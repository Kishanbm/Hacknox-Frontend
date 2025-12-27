import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/ToastProvider';
import { useParams, useNavigate } from 'react-router-dom';
import { JudgeLayout } from '../../components/JudgeLayout';
import { ENDPOINTS } from '../../config/endpoints';
import { 
    ChevronLeft, ExternalLink, Github, Video, Save, Send, Flag, 
    Maximize2, FileText, AlertTriangle, CheckCircle2, Download, FileArchive 
} from 'lucide-react';
import { judgeService } from '../../services/judge.service';
import { publicService } from '../../services/public.service';

const JudgeEvaluation: React.FC = () => {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [scores, setScores] = useState<Record<string, number>>({});
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submission, setSubmission] = useState<any>(null);
    const [evaluationStatus, setEvaluationStatus] = useState<{ status: string; isLocked?: boolean } | null>(null);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [teamName, setTeamName] = useState<string>('');
    const [hackathon, setHackathon] = useState<any>(null);
    const [rubricCriteria, setRubricCriteria] = useState<any[]>([]);
    const [showFlagModal, setShowFlagModal] = useState(false);
    const [flagSubject, setFlagSubject] = useState('');
    const [flagMessage, setFlagMessage] = useState('');
    const [flagSubmitting, setFlagSubmitting] = useState(false);
    const [isHackathonCompleted, setIsHackathonCompleted] = useState(false);
    
    const buildHackathonMarkdown = (h: any) => {
        if (!h) return '';
        const eventInfo = h.raw_event_info || h.event_info_json || {};
        const parts: string[] = [];
        parts.push(`# ${h.name || h.title || 'Hackathon'}\n`);
        if (h.description) parts.push(h.description + '\n');
        if (eventInfo.description) parts.push(eventInfo.description + '\n');
        if (eventInfo.task) {
            parts.push('## Task\n');
            parts.push((Array.isArray(eventInfo.task) ? eventInfo.task.join('\n') : String(eventInfo.task)) + '\n');
        }
        if (eventInfo.rules) {
            parts.push('## Rules\n');
            parts.push((Array.isArray(eventInfo.rules) ? eventInfo.rules.map((r: any, i: number) => `${i+1}. ${r}`).join('\n') : String(eventInfo.rules)) + '\n');
        }
        if (eventInfo.prizes) {
            parts.push('## Prizes\n');
            parts.push((Array.isArray(eventInfo.prizes) ? eventInfo.prizes.join('\n') : String(eventInfo.prizes)) + '\n');
        }
        if (h.start_date || h.end_date) {
            parts.push('## Schedule\n');
            parts.push(`Start: ${h.start_date || 'TBD'}\nEnd: ${h.end_date || 'TBD'}\n`);
        }
        if (eventInfo.submission_guidelines) {
            parts.push('## Submission Guidelines\n');
            parts.push(String(eventInfo.submission_guidelines) + '\n');
        }
        // include link to admin/public page if available
        const envAny = (import.meta.env as any);
        const base = envAny.VITE_PUBLIC_URL || (envAny.VITE_API_BASE_URL ? String(envAny.VITE_API_BASE_URL).replace(/\/api$/, '') : '');
        if (h.id) parts.push(`\nMore details: ${base}/hackathon/${h.id}\n`);
        return parts.join('\n');
    };

    const { success, error: toastError, warn } = useToast();

    // Prefer query param hackathonId, fall back to selectedHackathonId in localStorage
    const _qp = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
    const selectedHackathonId = _qp.get('hackathonId') || localStorage.getItem('selectedHackathonId') || undefined;

    const downloadHackathonDetails = () => {
        if (!hackathon) {
            warn('Hackathon details not available');
            return;
        }
        const md = buildHackathonMarkdown(hackathon);
        const blob = new Blob([md], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const name = (hackathon.name || 'hackathon').replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
        a.href = url;
        a.download = `${name}-details.md`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    // Map UI rubric keys to backend evaluation field names
    const mapCriteriaKeyToBackend = (key: string) => {
        if (!key) return null;
        const k = key.toString().toLowerCase();
        // Match innovation
        if (k.includes('innov') || k.includes('creative') || k.includes('original')) return 'score_innovation';
        // Match feasibility/complexity/technical
        if (k.includes('feas') || k.includes('complex') || k.includes('technical') || k.includes('viab')) return 'score_feasibility';
        // Match execution/implementation/quality
        if (k.includes('exec') || k.includes('execution') || k.includes('implement') || k.includes('quality') || k.includes('code')) return 'score_execution';
        // Match presentation/design/UX/UI
        if (k.includes('present') || k.includes('design') || k.includes('ux') || k.includes('ui') || k.includes('visual') || k.includes('utility') || k.includes('impact') || k.includes('useful')) return 'score_presentation';
        
        // For unknown keys, try to intelligently map based on position/index
        // This is a fallback for custom criteria
        return null; // Return null for unknown, we'll handle it separately
    };

    const deriveRequiredScores = (scoresObj: any) => {
        const get = (keys: string[]) => {
            for (const k of keys) {
                if (scoresObj[k] !== undefined && scoresObj[k] !== null) return Number(scoresObj[k]);
            }
            return 0;
        };

        const feasibility = get(['complexity', 'feasibility', 'complex', 'technical', 'execution', 'exec']);
        const execution = get(['design', 'execution', 'exec', 'implementation']);
        const presentation = get(['utility', 'presentation', 'present', 'ux', 'design']);

        return {
            score_feasibility: feasibility,
            score_execution: execution,
            score_presentation: presentation,
        };
    };

    const totalScore = Object.values(scores).reduce((a: number, b: number) => a + b, 0);
    const maxScore = rubricCriteria.length > 0 ? rubricCriteria.reduce((sum, c) => sum + (c.max_score || 10), 0) : 40;

    // Load submission, draft, status, and hackathon details
    useEffect(() => {
        const teamId = submissionId; // route param is named submissionId but it's actually teamId
        if (!teamId) return;

            // Determine hackathon id: prefer explicit query param, then localStorage
            const urlParams = new URLSearchParams(window.location.search || window.location.hash.split('?')[1] || '');
            const paramHackathonId = urlParams.get('hackathonId');
            const selectedHackathonId = paramHackathonId || localStorage.getItem('selectedHackathonId');
            if (!selectedHackathonId) {
                console.error('No hackathonId found in localStorage or query param. Requests may fail if backend requires hackathon context.');
            }

        const load = async () => {
            setLoading(true);
            try {
                // Fetch submission, evaluation draft, status, and hackathon details in parallel
                const [submissionRes, draftRes, statusRes, hackathonRes] = await Promise.allSettled([
                    judgeService.getSubmissionForEvaluation(teamId, selectedHackathonId || undefined),
                    judgeService.getEvaluationDraft(teamId, selectedHackathonId || undefined),
                    judgeService.getEvaluationStatus(teamId, selectedHackathonId || undefined),
                    selectedHackathonId ? publicService.getHackathonById(selectedHackathonId).catch(() => null) : Promise.resolve(null),
                ]);

                if (submissionRes.status === 'fulfilled' && submissionRes.value && submissionRes.value.submission) {
                    const sub = submissionRes.value.submission;
                    setSubmission(sub);
                    // Extract team name from submission or team object
                    setTeamName(sub.team_name || sub.team?.name || sub.teamName || 'Team');
                } else if (submissionRes.status === 'rejected') {
                    console.error('Submission fetch error', submissionRes.reason);
                }

                // Default criteria as fallback
                const defaultCriteria = [
                    { key: 'innovation', name: 'Innovation & Creativity', description: 'How unique is the solution?', weight: 25 },
                    { key: 'complexity', name: 'Technical Complexity', description: 'Quality of code and architecture.', weight: 25 },
                    { key: 'design', name: 'Design & UX', description: 'User-friendly and visually appealing.', weight: 25 },
                    { key: 'utility', name: 'Utility & Impact', description: 'Real-world impact and usefulness.', weight: 25 },
                ];

                // Load hackathon details and rubric
                let criteria: any[] = defaultCriteria;
                if (hackathonRes.status === 'fulfilled' && hackathonRes.value) {
                    const h = hackathonRes.value.hackathon || hackathonRes.value;
                    setHackathon(h);
                    
                    // Check if hackathon is completed (results published)
                    const hackathonStatus = h.status?.toLowerCase() || '';
                    const isCompleted = hackathonStatus === 'completed' || 
                                       hackathonStatus === 'past' || 
                                       h.leaderboard_published === true ||
                                       h.results_published === true;
                    setIsHackathonCompleted(isCompleted);
                    
                    // Parse evaluation criteria from hackathon config (event_info_json)
                    const eventInfo = h.raw_event_info || h.event_info_json || {};
                    const evalCriteria = h.evaluation_criteria || eventInfo.evaluation_criteria || [];
                    
                    if (Array.isArray(evalCriteria) && evalCriteria.length > 0) {
                        // Map the criteria to the expected format
                        criteria = evalCriteria.map((c: any, idx: number) => ({
                            key: c.key || c.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || `criteria_${idx}`,
                            name: c.name || c.label || `Criterion ${idx + 1}`,
                            description: c.description || c.desc || '',
                            weight: c.weight || 25,
                            max_score: c.max_score || 10
                        }));
                    }
                }

                setRubricCriteria(criteria);
                
                // Initialize scores based on criteria
                const initialScores: Record<string, number> = {};
                criteria.forEach((c: any) => {
                    const key = c.key || c.name?.toLowerCase().replace(/[^a-z0-9]/g, '_');
                    initialScores[key] = 0;
                });
                setScores(initialScores);

                // Load draft scores if available
                if (draftRes.status === 'fulfilled' && draftRes.value && draftRes.value.evaluation) {
                    const ev = draftRes.value.evaluation;
                    setDraftId(ev.id || null);
                    
                    // Map backend fields to local scores
                    const draftScores: Record<string, number> = {};
                    criteria.forEach((c: any) => {
                        const key = c.key || c.name?.toLowerCase().replace(/[^a-z0-9]/g, '_');
                        const backendKey = mapCriteriaKeyToBackend(key);
                        draftScores[key] = ev[backendKey] ?? ev[`score_${key}`] ?? 0;
                    });
                    setScores(draftScores);
                    setFeedback(ev.comments ?? '');
                }

                if (statusRes.status === 'fulfilled' && statusRes.value) {
                    setEvaluationStatus({ status: statusRes.value.status, isLocked: statusRes.value.isLocked || false });
                }
            } catch (err) {
                console.error('Error loading evaluation page', err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [submissionId]);

    const handleScoreChange = (criteria: keyof typeof scores, value: number) => {
        setScores(prev => ({ ...prev, [criteria]: value }));
    };

    const handleSaveDraft = async () => {
        const teamId = submissionId;
        if (!teamId) return;
        setIsSubmitting(true);
        try {
            // Initialize payload with 4 required fields
            const payload: any = {
                comments: feedback,
                score_innovation: 0,
                score_feasibility: 0,
                score_execution: 0,
                score_presentation: 0
            };
            
            // Map rubric criteria scores to the 4 backend fields
            if (rubricCriteria.length > 0) {
                rubricCriteria.forEach((c: any, index: number) => {
                    const key = c.key || c.name;
                    const scoreValue = Number(scores[key] || 0);
                    const backendKey = mapCriteriaKeyToBackend(key);
                    
                    if (backendKey) {
                        // Use max value if multiple criteria map to same field
                        payload[backendKey] = Math.max(payload[backendKey], scoreValue);
                    } else {
                        // For unknown criteria, map by index to the 4 fields
                        const fieldIndex = index % 4;
                        const fields = ['score_innovation', 'score_feasibility', 'score_execution', 'score_presentation'];
                        payload[fields[fieldIndex]] = Math.max(payload[fields[fieldIndex]], scoreValue);
                    }
                });
            } else {
                // Fallback to default mapping
                payload.score_innovation = Number(scores.innovation || 0);
                payload.score_feasibility = Number(scores.complexity || scores.feasibility || 0);
                payload.score_execution = Number(scores.design || scores.execution || 0);
                payload.score_presentation = Number(scores.utility || scores.presentation || 0);
            }

            // Ensure hackathon id included in body as fallback for some backend variants
            payload.hackathon_id = payload.hackathon_id || (selectedHackathonId || hackathon?.id);
            const res = await judgeService.saveEvaluationDraft(teamId, payload, selectedHackathonId || hackathon?.id);
            if (res && res.evaluation) setDraftId(res.evaluation.id || null);
        } catch (err) {
            console.error('Failed to save draft', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        const teamId = submissionId;
        if (!teamId) return;
        
        // Validate that all criteria have scores > 0
        const hasAllScores = rubricCriteria.every((c: any) => {
            const key = c.key || c.name;
            return scores[key] > 0;
        });
        
        if (!hasAllScores) {
            warn('Please provide scores for all evaluation criteria before submitting.');
            return;
        }

        if (!feedback || feedback.trim().length < 15) {
            warn('Please provide detailed feedback (minimum 15 characters) before submitting.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            // Initialize payload with 4 required fields
            const payload: any = {
                comments: feedback,
                score_innovation: 0,
                score_feasibility: 0,
                score_execution: 0,
                score_presentation: 0
            };
            
            // Map rubric criteria scores to the 4 backend fields
            if (rubricCriteria.length > 0) {
                rubricCriteria.forEach((c: any, index: number) => {
                    const key = c.key || c.name;
                    const scoreValue = Number(scores[key] || 0);
                    const backendKey = mapCriteriaKeyToBackend(key);
                    
                    if (backendKey) {
                        // Use max value if multiple criteria map to same field
                        payload[backendKey] = Math.max(payload[backendKey], scoreValue);
                    } else {
                        // For unknown criteria, map by index to the 4 fields
                        const fieldIndex = index % 4;
                        const fields = ['score_innovation', 'score_feasibility', 'score_execution', 'score_presentation'];
                        payload[fields[fieldIndex]] = Math.max(payload[fields[fieldIndex]], scoreValue);
                    }
                });
            } else {
                // Fallback to default mapping
                payload.score_innovation = Number(scores.innovation || 0);
                payload.score_feasibility = Number(scores.complexity || scores.feasibility || 0);
                payload.score_execution = Number(scores.design || scores.execution || 0);
                payload.score_presentation = Number(scores.utility || scores.presentation || 0);
            }
            
            // Ensure all scores are at least 1 for validation
            Object.keys(payload).forEach(key => {
                if (key.startsWith('score_') && payload[key] === 0) {
                    payload[key] = 1; // Minimum score
                }
            });

            // Ensure hackathon id included in body as fallback for some backend variants
            payload.hackathon_id = payload.hackathon_id || (selectedHackathonId || hackathon?.id);

            if (evaluationStatus?.status === 'submitted') {
                await judgeService.updateSubmittedEvaluation(teamId, payload, selectedHackathonId || hackathon?.id);
            } else {
                await judgeService.submitFinalEvaluation(teamId, payload, selectedHackathonId || hackathon?.id);
            }

            navigate('/judge/assignments');
        } catch (err) {
            console.error('Failed to submit evaluation', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <JudgeLayout>
            <div className="h-[calc(100vh-80px)] lg:h-[calc(100vh-140px)] flex flex-col pb-20 lg:pb-0">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4 shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/judge/assignments')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-lg lg:text-xl font-bold text-gray-900">{submission?.title || 'Evaluation'}</h1>
                                {hackathon && (
                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200 whitespace-nowrap">
                                        {hackathon.name || hackathon.title || 'Hackathon'}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                Team: {teamName} {submission?.project_category && `• Track: ${submission.project_category}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        {isHackathonCompleted ? (
                            <div className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm font-bold flex items-center gap-2">
                                <AlertTriangle size={16} /> Hackathon completed - Evaluation locked
                            </div>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={handleSaveDraft}
                                    disabled={isSubmitting}
                                    className="flex-1 sm:flex-none justify-center px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <Save size={16} /> <span className="sm:hidden">Save</span> <span className="hidden sm:inline">Save Draft</span>
                                </button>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 sm:flex-none justify-center px-6 py-2 bg-[#24FF00] text-black rounded-lg text-sm font-bold hover:bg-[#1fe600] shadow-lg shadow-[#24FF00]/20 flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : (
                                        <><Send size={16} /> Submit Score</>
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Split View */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 overflow-y-auto lg:overflow-hidden">
                    
                    {/* LEFT: Project Content */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden min-h-[500px] lg:min-h-0">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                <FileText size={18} /> Submission Details
                            </h3>
                            <button className="text-gray-400 hover:text-gray-600" title="Expand">
                                <Maximize2 size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            
                            {/* Video if present */}
                            {submission?.video_url && (
                                <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
                                    <iframe 
                                        src={submission.video_url} 
                                        className="w-full h-full" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                        title="Demo Video"
                                    ></iframe>
                                </div>
                            )}

                            {/* Links */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {submission?.repo_url && (
                                    <a href={submission.repo_url} target="_blank" rel="noreferrer" className="flex-1 p-3 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-700 hover:border-[#5425FF] hover:text-[#5425FF] transition-colors font-bold text-sm">
                                        <Github size={18} /> View Repository
                                    </a>
                                )}
                                {submission?.live_url && (
                                    <a href={submission.live_url} target="_blank" rel="noreferrer" className="flex-1 p-3 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-700 hover:border-[#5425FF] hover:text-[#5425FF] transition-colors font-bold text-sm">
                                        <ExternalLink size={18} /> Live Demo
                                    </a>
                                )}
                                {submission?.zip_storage_path && (
                                    <a href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/uploads/${submission.zip_storage_path}`} target="_blank" rel="noreferrer" className="flex-1 p-3 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-gray-700 hover:border-[#5425FF] hover:text-[#5425FF] transition-colors font-bold text-sm">
                                        <FileArchive size={18} /> Download ZIP
                                    </a>
                                )}
                            </div>

                            {/* Description */}
                            <div className="prose prose-gray max-w-none">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Project Description</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {submission?.description || 'No project description provided.'}
                                </p>
                                {submission?.additional_info && (
                                    <p className="text-gray-600 text-sm leading-relaxed mt-4">{submission.additional_info}</p>
                                )}
                            </div>

                            {/* Tech Stack Chips - Dynamic from Hackathon Config */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Technologies</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(submission?.technologies || hackathon?.tech_stack || hackathon?.raw_event_info?.tech_stack || []).map((t: string) => (
                                        <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">
                                            {t}
                                        </span>
                                    ))}
                                    {(!submission?.technologies && !hackathon?.tech_stack && !hackathon?.raw_event_info?.tech_stack) && (
                                        <span className="text-gray-400 text-sm">No technologies specified</span>
                                    )}
                                </div>
                            </div>

                            {/* Theme/Mode Info - from Hackathon */}
                            {(hackathon?.themes?.length > 0 || hackathon?.modes?.length > 0) && (
                                <>
                                <div className="space-y-3">
                                    {hackathon?.themes?.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Theme</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {hackathon.themes.map((theme: string, idx: number) => (
                                                    <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                                                        {theme}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {hackathon?.modes?.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Mode</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {hackathon.modes.map((mode: string, idx: number) => (
                                                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                                                        {mode}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Hackathon Details Card (moved below so it shows even when themes/modes are empty) */}
                                </>
                            )}

                            {/* Hackathon Details Card (always show when hackathon data exists) */}
                            {hackathon && (
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Hackathon Details</h4>
                                        <div className="flex items-center gap-2">
                                            <button onClick={downloadHackathonDetails} className="px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-bold hover:bg-gray-50 flex items-center gap-2">
                                                <Download size={14} /> Download
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-700 space-y-2 max-h-40 overflow-auto prose prose-sm">
                                        <p className="font-semibold">Description</p>
                                        <p>{hackathon?.description || hackathon?.raw_event_info?.description || 'No description provided.'}</p>
                                        { (hackathon?.raw_event_info?.task || hackathon?.event_info_json?.task) && (
                                            <>
                                                <p className="font-semibold mt-2">Task</p>
                                                <p>{Array.isArray(hackathon?.raw_event_info?.task || hackathon?.event_info_json?.task) ? (hackathon?.raw_event_info?.task || hackathon?.event_info_json?.task).join('; ') : (hackathon?.raw_event_info?.task || hackathon?.event_info_json?.task)}</p>
                                            </>
                                        )}
                                        { (hackathon?.raw_event_info?.rules || hackathon?.event_info_json?.rules) && (
                                            <>
                                                <p className="font-semibold mt-2">Rules</p>
                                                <p>{Array.isArray(hackathon?.raw_event_info?.rules || hackathon?.event_info_json?.rules) ? (hackathon?.raw_event_info?.rules || hackathon?.event_info_json?.rules).slice(0,5).join('; ') : (hackathon?.raw_event_info?.rules || hackathon?.event_info_json?.rules)}</p>
                                            </>
                                        )}
                                        { (hackathon?.raw_event_info?.prizes || hackathon?.event_info_json?.prizes) && (
                                            <>
                                                <p className="font-semibold mt-2">Prizes</p>
                                                <p>{Array.isArray(hackathon?.raw_event_info?.prizes || hackathon?.event_info_json?.prizes) ? (hackathon?.raw_event_info?.prizes || hackathon?.event_info_json?.prizes).join('; ') : (hackathon?.raw_event_info?.prizes || hackathon?.event_info_json?.prizes)}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* RIGHT: Scoring Form */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden min-h-[600px] lg:min-h-0">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-700">Evaluation Rubric</h3>
                            <div className="text-sm font-bold">
                                Total Score: <span className="text-[#5425FF] text-lg font-heading">{totalScore}</span>/{maxScore}
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            
                            {/* Rubric Items - Dynamic from Hackathon Config */}
                            {rubricCriteria.map((item: any) => {
                                const key = item.key || item.name?.toLowerCase().replace(/[^a-z0-9]/g, '_');
                                const label = item.name || item.label || key;
                                const desc = item.description || item.desc || '';
                                const maxScore = item.max_score || item.maxScore || 10;
                                const weight = item.weight || 0;
                                return (
                                <div key={key}>
                                    <div className="flex justify-between mb-2">
                                        <label className="font-bold text-gray-900">
                                            {label}
                                            {weight > 0 && <span className="text-xs text-gray-400 ml-2">({weight}%)</span>}
                                        </label>
                                        <span className="text-sm font-bold text-[#5425FF]">
                                            {scores[key] || 0}/{maxScore}
                                        </span>
                                    </div>
                                    {desc && <p className="text-xs text-gray-500 mb-3">{desc}</p>}
                                    <div className="relative h-2 bg-gray-100 rounded-lg">
                                        <input 
                                            type="range" min="0" max={maxScore} step="1" 
                                            value={scores[key] || 0}
                                            onChange={(e) => handleScoreChange(key, parseInt(e.target.value))}
                                            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-[#5425FF] rounded-lg pointer-events-none transition-all duration-150"
                                            style={{ width: `${((scores[key] || 0) / maxScore) * 100}%` }}
                                        ></div>
                                        <div 
                                            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#5425FF] rounded-full shadow-md pointer-events-none transition-all duration-150"
                                            style={{ left: `calc(${((scores[key] || 0) / maxScore) * 100}% - 8px)` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-bold uppercase">
                                        <span>Poor</span>
                                        <span>Average</span>
                                        <span>Excellent</span>
                                    </div>
                                </div>
                            );
                        })
                    }

                            <hr className="border-gray-100" />

                            {/* Feedback */}
                            <div>
                                <label className="block font-bold text-gray-900 mb-2">Qualitative Feedback</label>
                                <textarea 
                                    rows={4} 
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] transition-colors text-sm"
                                    placeholder="Provide constructive feedback for the team..."
                                ></textarea>
                            </div>

                            {/* Danger Zone / Flag */}
                            <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                                    <AlertTriangle size={16} /> Report Submission
                                </div>
                                <button 
                                    onClick={() => setShowFlagModal(true)}
                                    className="text-xs font-bold text-red-600 hover:underline"
                                >
                                    Flag as Inappropriate
                                </button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>

            {/* Flag as Inappropriate Modal */}
            {showFlagModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Flag size={24} className="text-red-500"/> Report Submission
                            </h2>
                            <button 
                                onClick={() => {
                                    setShowFlagModal(false);
                                    setFlagSubject('');
                                    setFlagMessage('');
                                }} 
                                className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                            >
                                ×
                            </button>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                <select 
                                    value={flagSubject}
                                    onChange={(e) => setFlagSubject(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 font-medium"
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="plagiarism">Plagiarism / Copied Work</option>
                                    <option value="inappropriate_content">Inappropriate Content</option>
                                    <option value="cheating">Cheating / Rule Violation</option>
                                    <option value="incomplete">Incomplete Submission</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                <textarea 
                                    value={flagMessage}
                                    onChange={(e) => setFlagMessage(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 text-sm resize-none" 
                                    rows={4} 
                                    placeholder="Please describe the issue in detail..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setShowFlagModal(false);
                                    setFlagSubject('');
                                    setFlagMessage('');
                                }}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={async () => {
                                    if (!flagSubject || !flagMessage) {
                                        warn('Please select a subject and provide a message');
                                        return;
                                    }
                                    setFlagSubmitting(true);
                                    try {
                                        await judgeService.reportSubmission(submissionId!, {
                                            subject: flagSubject,
                                            message: flagMessage,
                                            hackathon_id: hackathon?.id || localStorage.getItem('selectedHackathonId'),
                                            team_name: teamName,
                                            submission_title: submission?.title
                                        });
                                        success('Report submitted successfully. Admin will review it.');
                                        setShowFlagModal(false);
                                        setFlagSubject('');
                                        setFlagMessage('');
                                    } catch (err) {
                                        console.error('Failed to submit report', err);
                                        toastError('Failed to submit report. Please try again.');
                                    } finally {
                                        setFlagSubmitting(false);
                                    }
                                }}
                                disabled={flagSubmitting || !flagSubject || !flagMessage}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {flagSubmitting ? (
                                    <>Submitting...</>
                                ) : (
                                    <><Send size={16} /> Submit Report</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </JudgeLayout>
    );
};

export default JudgeEvaluation;
