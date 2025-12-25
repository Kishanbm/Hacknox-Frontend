import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import apiClient from '../../lib/axios';
import { ChevronLeft, Save, Plus, Trash2, Gavel, Layers, Code, Calendar, FileText, Trophy, ClipboardList } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { useToast } from '../../components/ui/ToastProvider';

const AdminCreateHackathon: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    
    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [task, setTask] = useState('');
    const [prizes, setPrizes] = useState('');
    const [submissionDeadline, setSubmissionDeadline] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [maxTeamSize, setMaxTeamSize] = useState(4);
    const [judgesPerSubmission, setJudgesPerSubmission] = useState(3);
    const [criteria, setCriteria] = useState([{ name: 'Innovation', weight: 25 }]);
    const [techStack, setTechStack] = useState(['React', 'Node.js', 'Python']);
    const [newTech, setNewTech] = useState('');
    const [citiesInput, setCitiesInput] = useState('');
    const [modesInput, setModesInput] = useState('');
    const [themesInput, setThemesInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerUrl, setBannerUrl] = useState<string>('');
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const bannerInputRef = useRef<HTMLInputElement | null>(null);

    const { warn: toastWarn, success: toastSuccess, error: toastError } = useToast();

    useEffect(() => {
        if (isEditMode) {
            // Fetch hackathon details and prefill the form
            (async () => {
                try {
                    setLoading(true);
                    const data = await adminService.getHackathon(id!);
                    // expected fields: name, submission_deadline, max_team_size, event_info_json
                    setName(data.name || '');
                    setDescription(data.description || '');
                    setSubmissionDeadline(data.submission_deadline || '');
                    setMaxTeamSize(data.max_team_size || 4);

                    const info = data.event_info_json || {};
                    setJudgesPerSubmission(info.judges_per_submission || 3);
                    setCriteria(info.evaluation_criteria || [{ name: 'Innovation', weight: 25 }]);
                    setTechStack(info.tech_stack || ['React', 'Node.js', 'Python']);
                    setTask(info.task || '');
                    setPrizes(info.prizes || '');
                    setBannerUrl(data.banner || '');
                    setStartDate(info.start_date || '');
                    setEndDate(info.end_date || '');
                    // if top-level arrays exist, populate inputs
                    setCitiesInput(Array.isArray(data.cities) ? data.cities.join(', ') : (info.cities ? (Array.isArray(info.cities) ? info.cities.join(', ') : String(info.cities)) : ''));
                    setModesInput(Array.isArray(data.modes) ? data.modes.join(', ') : (info.mode ? String(info.mode) : ''));
                    setThemesInput(Array.isArray(data.themes) ? data.themes.join(', ') : (info.theme ? (Array.isArray(info.theme) ? info.theme.join(', ') : String(info.theme)) : ''));
                } catch (err) {
                    console.error('[AdminCreateHackathon] Failed to load hackathon for edit', err);
                    toastError('Failed to load hackathon details for editing.');
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [id, isEditMode]);

    const addCriteria = () => {
        setCriteria([...criteria, { name: '', weight: 0 }]);
    };

    const removeCriteria = (idx: number) => {
        setCriteria(criteria.filter((_, i) => i !== idx));
    };

    const updateCriteria = (idx: number, field: string, value: any) => {
        const newC = [...criteria];
        // @ts-ignore
        newC[idx][field] = value;
        setCriteria(newC);
    };

    const addTech = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newTech) {
            setTechStack([...techStack, newTech]);
            setNewTech('');
        }
    };

    const handleSave = async () => {
        if (!name || !submissionDeadline) {
                toastWarn('Please fill in Hackathon Name and Submission Deadline');
                return;
            }

        const eventInfo = {
            judges_per_submission: judgesPerSubmission,
            evaluation_criteria: criteria,
            tech_stack: techStack,
            start_date: startDate || null,
            end_date: endDate || null,
            task: task || null,
            prizes: prizes || null
        };

        try {
            setSaving(true);
            if (isEditMode) {
                await adminService.updateHackathon(id!, {
                    name,
                    description: description || null,
                    submission_deadline: submissionDeadline,
                    max_team_size: maxTeamSize,
                        event_info_json: eventInfo,
                        banner: bannerUrl || undefined,
                        cities: citiesInput ? citiesInput.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                        modes: modesInput ? modesInput.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                        themes: themesInput ? themesInput.split(',').map(s => s.trim()).filter(Boolean) : undefined
                });
                toastSuccess('Hackathon updated successfully!');
            } else {
                await adminService.createHackathon({
                    name,
                    description: description || null,
                    submission_deadline: submissionDeadline,
                    max_team_size: maxTeamSize,
                        event_info_json: eventInfo,
                        banner: bannerUrl || undefined,
                        cities: citiesInput ? citiesInput.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                        modes: modesInput ? modesInput.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                        themes: themesInput ? themesInput.split(',').map(s => s.trim()).filter(Boolean) : undefined
                });
                toastSuccess('Hackathon created successfully!');
            }
            navigate('/admin/hackathons');
        } catch (error: any) {
            console.error('[AdminCreateHackathon] Error saving:', error);
            toastError('Failed to save: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
        }
    };

    const uploadBannerFile = async (file: File) => {
        try {
            setUploadingBanner(true);
            const form = new FormData();
            form.append('banner', file);
            const res = await apiClient.post('/uploads/banner', form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const url = res.data?.url;
            if (url) setBannerUrl(url);
            return url;
        } catch (err) {
            console.error('Banner upload failed', err);
            toastError('Failed to upload banner.');
            return null;
        } finally {
            setUploadingBanner(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto pb-12">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold text-sm">
                    <ChevronLeft size={20} /> Back to List
                </button>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-heading text-gray-900">{isEditMode ? 'Edit Event' : 'Configure Event'}</h1>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 bg-[#111827] text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
                        ) : (
                            <><Save size={18} /> {isEditMode ? 'Update' : 'Save & Publish'}</>
                        )}
                    </button>
                </div>
                {/* Banner Upload (clickable full-card) */}
                <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (bannerInputRef.current as HTMLInputElement | null)?.click(); } }}
                    onClick={() => (bannerInputRef.current as HTMLInputElement | null)?.click()}
                    className="bg-white p-0 rounded-3xl border border-gray-200 shadow-sm overflow-hidden cursor-pointer"
                >
                    <h3 className="sr-only">Event Banner (optional)</h3>
                    <div className="w-full h-44 flex items-center justify-center bg-transparent relative">
                        {/* Hidden file input triggered by the card */}
                        <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={async (e) => {
                                const f = e.target.files?.[0];
                                if (!f) return;
                                setBannerFile(f);
                                const url = await uploadBannerFile(f);
                                if (url) setBannerUrl(url);
                            }}
                        />

                        {bannerUrl ? (
                            <img src={bannerUrl} alt="banner preview" className="w-full h-44 object-cover" />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-md text-center p-4">
                                <div className="text-sm font-bold text-gray-600">Upload Event Banner</div>
                                <div className="text-xs text-gray-400 mt-1">Click to choose a file (recommended 1200×400)</div>
                            </div>
                        )}

                        {uploadingBanner && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <div className="text-white">Uploading...</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {/* 1. Basic Info */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                        <h3 className="font-heading text-lg text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar size={20} className="text-[#5425FF]" /> Basic Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Hackathon Name</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. HackOnX 2025" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium" 
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                <textarea 
                                    placeholder="Describe your hackathon - goals, themes, what participants can expect..." 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium resize-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                                <input 
                                    type="datetime-local" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                                <input 
                                    type="datetime-local" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Submission Deadline</label>
                                <input 
                                    type="datetime-local" 
                                    value={submissionDeadline}
                                    onChange={(e) => setSubmissionDeadline(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Max Team Size</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    max="10"
                                    value={maxTeamSize}
                                    onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Cities (comma-separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Bangalore, Mumbai"
                                    value={citiesInput}
                                    onChange={(e) => setCitiesInput(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Mode(s) (comma-separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Online, Offline"
                                    value={modesInput}
                                    onChange={(e) => setModesInput(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Themes (comma-separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. AI, Web, FinTech"
                                    value={themesInput}
                                    onChange={(e) => setThemesInput(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 2. Judging Configuration */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                         <h3 className="font-heading text-lg text-gray-900 mb-6 flex items-center gap-2">
                            <Gavel size={20} className="text-[#5425FF]" /> Judging Panel
                        </h3>
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Judges per Submission</label>
                            <select 
                                value={judgesPerSubmission}
                                onChange={(e) => setJudgesPerSubmission(Number(e.target.value))}
                                className="w-full md:w-1/3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]"
                            >
                                <option value={1}>1 Judge</option>
                                <option value={2}>2 Judges</option>
                                <option value={3}>3 Judges</option>
                                <option value={4}>4 Judges (Panel)</option>
                                <option value={5}>5 Judges</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">Recommended: 3 judges for balanced scoring.</p>
                        </div>

                        <div className="mb-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Evaluation Criteria</label>
                            <div className="space-y-3">
                                {criteria.map((c, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <input 
                                            type="text" 
                                            value={c.name} 
                                            onChange={(e) => updateCriteria(idx, 'name', e.target.value)}
                                            placeholder="Criterion Name" 
                                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm" 
                                        />
                                        <div className="w-32 relative">
                                            <input 
                                                type="number" 
                                                value={c.weight} 
                                                onChange={(e) => updateCriteria(idx, 'weight', e.target.value)}
                                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm pr-8" 
                                            />
                                            <span className="absolute right-3 top-2 text-gray-400 text-xs font-bold">%</span>
                                        </div>
                                        <button onClick={() => removeCriteria(idx)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                                <button onClick={addCriteria} className="text-sm font-bold text-[#5425FF] hover:underline flex items-center gap-1">
                                    <Plus size={14} /> Add Criterion
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 3. Tech Stack & Requirements */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                        <h3 className="font-heading text-lg text-gray-900 mb-6 flex items-center gap-2">
                            <Code size={20} className="text-[#5425FF]" /> Tech & Tracks
                        </h3>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Allowed Tech Stack</label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {techStack.map((tech, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center gap-2">
                                        {tech}
                                        <button onClick={() => setTechStack(techStack.filter(t => t !== tech))} className="hover:text-red-500">×</button>
                                    </span>
                                ))}
                            </div>
                            <input 
                                type="text" 
                                value={newTech}
                                onChange={(e) => setNewTech(e.target.value)}
                                onKeyDown={addTech}
                                placeholder="Type and press Enter to add..." 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]" 
                            />
                        </div>
                    </div>

                    {/* 4. Task / Problem Statement */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                        <h3 className="font-heading text-lg text-gray-900 mb-6 flex items-center gap-2">
                            <ClipboardList size={20} className="text-[#5425FF]" /> Task / Problem Statement
                        </h3>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">What needs to be done?</label>
                            <textarea 
                                placeholder="Describe the problem statement, requirements, deliverables, and any specific guidelines for participants..." 
                                value={task}
                                onChange={(e) => setTask(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium resize-none" 
                            />
                            <p className="text-xs text-gray-500 mt-2">Tip: Be specific about expected outputs, technologies, and evaluation criteria.</p>
                        </div>
                    </div>

                    {/* 5. Prizes */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
                        <h3 className="font-heading text-lg text-gray-900 mb-6 flex items-center gap-2">
                            <Trophy size={20} className="text-[#5425FF]" /> Prizes
                        </h3>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Prize Details</label>
                            <textarea 
                                placeholder="e.g.&#10;🥇 1st Place: $5,000 + Internship opportunity&#10;🥈 2nd Place: $2,500&#10;🥉 3rd Place: $1,000&#10;Special prizes for best UI, most innovative, etc." 
                                value={prizes}
                                onChange={(e) => setPrizes(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium resize-none" 
                            />
                            <p className="text-xs text-gray-500 mt-2">List all prizes including cash rewards, swag, and special category prizes.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCreateHackathon;