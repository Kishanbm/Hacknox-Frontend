import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { ChevronLeft, Save, Plus, Trash2, Gavel, Layers, Code, Calendar } from 'lucide-react';

const AdminCreateHackathon: React.FC = () => {
    const navigate = useNavigate();
    
    // Form States
    const [criteria, setCriteria] = useState([{ name: 'Innovation', weight: 25 }]);
    const [techStack, setTechStack] = useState(['React', 'Node.js', 'Python']);
    const [newTech, setNewTech] = useState('');

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

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto pb-12">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold text-sm">
                    <ChevronLeft size={20} /> Back to List
                </button>

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-heading text-gray-900">Configure Event</h1>
                    <button className="px-6 py-2.5 bg-[#111827] text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-lg">
                        <Save size={18} /> Save & Publish
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
                                <input type="text" placeholder="e.g. HackOnX 2025" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                                <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                                <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tagline</label>
                                <input type="text" placeholder="One line description" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]" />
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
                            <select className="w-full md:w-1/3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]">
                                <option>1 Judge</option>
                                <option>2 Judges</option>
                                <option selected>3 Judges</option>
                                <option>4 Judges (Panel)</option>
                                <option>5 Judges</option>
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