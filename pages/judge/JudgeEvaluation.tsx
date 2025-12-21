import React, { useState, useEffect } from 'react';
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
    const [scores, setScores] = useState({
        innovation: 0,
        complexity: 0,
        design: 0,
        utility: 0
    });
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submission, setSubmission] = useState<any>(null);
    const [evaluationStatus, setEvaluationStatus] = useState<{ status: string; isLocked?: boolean } | null>(null);
    const [draftId, setDraftId] = useState<string | null>(null);
    const [teamName, setTeamName] = useState<string>('');
    const [hackathon, setHackathon] = useState<any>(null);
    const [rubricCriteria, setRubricCriteria] = useState<any[]>([]);

    const totalScore = Object.values(scores).reduce((a: number, b: number) => a + b, 0);
    const maxScore = rubricCriteria.length > 0 ? rubricCriteria.reduce((sum, c) => sum + (c.max_score || 10), 0) : 40;

    // Load submission, draft, status, and hackathon details
    useEffect(() => {
        const teamId = submissionId; // route param is named submissionId but it's actually teamId
        if (!teamId) return;

        // Ensure hackathonId is in localStorage (should be set by assignments page)
        const selectedHackathonId = localStorage.getItem('selectedHackathonId');
        if (!selectedHackathonId) {
            console.error('No hackathonId found in localStorage. Please select a hackathon first.');
            // Still try to load, axios interceptor will add header if available
        }

        const load = async () => {
            setLoading(true);
            try {
                // Fetch submission, evaluation draft, status, and hackathon details in parallel
                const [submissionRes, draftRes, statusRes, hackathonRes] = await Promise.allSettled([
                    judgeService.getSubmissionForEvaluation(teamId),
                    judgeService.getEvaluationDraft(teamId),
                    judgeService.getEvaluationStatus(teamId),
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

                // Load hackathon details and rubric
                if (hackathonRes.status === 'fulfilled' && hackathonRes.value) {
                    const h = hackathonRes.value.hackathon || hackathonRes.value;
                    setHackathon(h);
                    
                    // Parse evaluation criteria from hackathon config
                    const criteria = h.evaluation_criteria || h.evaluationCriteria || [];
                    if (Array.isArray(criteria) && criteria.length > 0) {
                        setRubricCriteria(criteria);
                        // Initialize scores based on criteria
                        const initialScores: any = {};
                        criteria.forEach((c: any, idx: number) => {
                            const key = c.key || `criteria_${idx}`;
                            initialScores[key] = 0;
                        });
                        setScores(initialScores);
                    } else {
                        // Fallback to default 4-criteria rubric
                        setRubricCriteria([
                            { key: 'innovation', label: 'Innovation & Creativity', description: 'How unique is the solution?', max_score: 10 },
                            { key: 'complexity', label: 'Technical Complexity', description: 'Quality of code and architecture.', max_score: 10 },
                            { key: 'design', label: 'Design & UX', description: 'User-friendly and visually appealing.', max_score: 10 },
                            { key: 'utility', label: 'Utility & Impact', description: 'Real-world impact and usefulness.', max_score: 10 },
                        ]);
                    }
                }

                if (draftRes.status === 'fulfilled' && draftRes.value && draftRes.value.evaluation) {
                    const ev = draftRes.value.evaluation;
                    setDraftId(ev.id || null);
                    // Map backend fields to local scores - need to handle dynamic criteria
                    if (rubricCriteria.length > 0) {
                        const draftScores: any = {};
                        rubricCriteria.forEach((c: any) => {
                            const key = c.key || c.name;
                            const backendKey = `score_${key}`;
                            draftScores[key] = ev[backendKey] ?? 0;
                        });
                        setScores(draftScores);
                    } else {
                        // Fallback to default mapping
                        setScores({
                            innovation: ev.score_innovation ?? 0,
                            complexity: ev.score_feasibility ?? 0,
                            design: ev.score_execution ?? 0,
                            utility: ev.score_presentation ?? 0,
                        });
                    }
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
            // Build payload dynamically based on rubric criteria
            const payload: any = { comments: feedback };
            
            if (rubricCriteria.length > 0) {
                rubricCriteria.forEach((c: any) => {
                    const key = c.key || c.name;
                    const backendKey = `score_${key}`;
                    payload[backendKey] = Number(scores[key] || 0);
                });
            } else {
                // Fallback to default mapping
                payload.score_innovation = Number(scores.innovation || 0);
                payload.score_feasibility = Number(scores.complexity || 0);
                payload.score_execution = Number(scores.design || 0);
                payload.score_presentation = Number(scores.utility || 0);
            }

            const res = await judgeService.saveEvaluationDraft(teamId, payload);
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
        setIsSubmitting(true);
        try {
            // Build payload dynamically based on rubric criteria
            const payload: any = { comments: feedback };
            
            if (rubricCriteria.length > 0) {
                rubricCriteria.forEach((c: any) => {
                    const key = c.key || c.name;
                    const backendKey = `score_${key}`;
                    payload[backendKey] = Number(scores[key] || 0);
                });
            } else {
                // Fallback to default mapping
                payload.score_innovation = Number(scores.innovation || 0);
                payload.score_feasibility = Number(scores.complexity || 0);
                payload.score_execution = Number(scores.design || 0);
                payload.score_presentation = Number(scores.utility || 0);
            }

            if (evaluationStatus?.status === 'submitted') {
                await judgeService.updateSubmittedEvaluation(teamId, payload);
            } else {
                await judgeService.submitFinalEvaluation(teamId, payload);
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

                            {/* Tech Stack Chips */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Technologies</h4>
                                <div className="flex flex-wrap gap-2">
                                    {(submission?.technologies || ['React', 'Three.js', 'Python']).map((t: string) => (
                                        <span key={t} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </div>

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
                            {(rubricCriteria.length > 0 ? rubricCriteria : [
                                { key: 'innovation', label: 'Innovation & Creativity', description: 'How unique is the solution? Does it solve the problem in a novel way?', max_score: 10 },
                                { key: 'complexity', label: 'Technical Complexity', description: 'Quality of code, architecture, and technical implementation.', max_score: 10 },
                                { key: 'design', label: 'Design & UX', description: 'Is the solution user-friendly and visually appealing?', max_score: 10 },
                                { key: 'utility', label: 'Utility & Impact', description: 'Potential real-world impact and usefulness.', max_score: 10 },
                            ]).map((item: any) => {
                                const key = item.key || item.id || item.name;
                                const label = item.label || item.name || key;
                                const desc = item.description || item.desc || '';
                                const maxScore = item.max_score || item.maxScore || 10;
                                return (
                                <div key={key}>
                                    <div className="flex justify-between mb-2">
                                        <label className="font-bold text-gray-900">{label}</label>
                                        <span className="text-sm font-bold text-[#5425FF]">
                                            {scores[key] || 0}/{maxScore}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-3">{desc}</p>
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
                                <button className="text-xs font-bold text-red-600 hover:underline">Flag as Inappropriate</button>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </JudgeLayout>
    );
};

export default JudgeEvaluation;
