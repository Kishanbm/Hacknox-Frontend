import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { ChevronLeft, Save, Plus, Trash2, Gavel, Layers, Code, Calendar } from 'lucide-react';
import { adminService } from '../../services/admin.service';

const AdminCreateHackathon: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    
    // Form States
    const [name, setName] = useState('');
    const [submissionDeadline, setSubmissionDeadline] = useState('');
    const [maxTeamSize, setMaxTeamSize] = useState(4);
    const [judgesPerSubmission, setJudgesPerSubmission] = useState(3);
    const [criteria, setCriteria] = useState([{ name: 'Innovation', weight: 25 }]);
    const [techStack, setTechStack] = useState(['React', 'Node.js', 'Python']);
    const [newTech, setNewTech] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            // Fetch hackathon details and prefill the form
            (async () => {
                try {
                    setLoading(true);
                    const data = await adminService.getHackathon(id!);
                    // expected fields: name, submission_deadline, max_team_size, event_info_json
                    setName(data.name || '');
                    setSubmissionDeadline(data.submission_deadline || '');
                    setMaxTeamSize(data.max_team_size || 4);

                    const info = data.event_info_json || {};
                    setJudgesPerSubmission(info.judges_per_submission || 3);
                    setCriteria(info.evaluation_criteria || [{ name: 'Innovation', weight: 25 }]);
                    setTechStack(info.tech_stack || ['React', 'Node.js', 'Python']);
                } catch (err) {
                    console.error('[AdminCreateHackathon] Failed to load hackathon for edit', err);
                    alert('Failed to load hackathon details for editing.');
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
            alert('Please fill in Hackathon Name and Submission Deadline');
            return;
        }

        const eventInfo = {
            judges_per_submission: judgesPerSubmission,
            evaluation_criteria: criteria,
            tech_stack: techStack
        };

        try {
            setSaving(true);
            if (isEditMode) {
                await adminService.updateHackathon(id!, {
                    name,
                    submission_deadline: submissionDeadline,
                    max_team_size: maxTeamSize,
                    event_info_json: eventInfo
                });
                alert('Hackathon updated successfully!');
            } else {
                await adminService.createHackathon({
                    name,
                    submission_deadline: submissionDeadline,
                    max_team_size: maxTeamSize,
                    event_info_json: eventInfo
                });
                alert('Hackathon created successfully!');
            }
            navigate('/admin/hackathons');
        } catch (error: any) {
            console.error('[AdminCreateHackathon] Error saving:', error);
            alert('Failed to save: ' + (error.response?.data?.message || error.message));
        } finally {
            setSaving(false);
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
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCreateHackathon;