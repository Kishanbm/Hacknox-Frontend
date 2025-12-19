import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Search, Mail, Plus, MapPin, Briefcase, ExternalLink, UserPlus, Check } from 'lucide-react';

const AdminJudges: React.FC = () => {
    // Mock Data
    const [judges, setJudges] = useState([
        { id: 1, name: 'Dr. Emily Smith', role: 'AI Researcher', company: 'DeepMind', location: 'London, UK', status: 'Active', assigned: ['HackOnX 2025'] },
        { id: 2, name: 'James Wilson', role: 'Senior Architect', company: 'AWS', location: 'Seattle, USA', status: 'Invited', assigned: [] },
        { id: 3, name: 'Sarah Chen', role: 'CTO', company: 'TechStart', location: 'Singapore', status: 'Active', assigned: ['HackOnX 2025', 'Global AI'] },
        { id: 4, name: 'Michael Ross', role: 'Security Lead', company: 'CyberCorp', location: 'Berlin, DE', status: 'Active', assigned: [] },
    ]);

    const [isInviteModalOpen, setInviteModalOpen] = useState(false);

    const handleAssign = (id: number) => {
        // Mock assignment
        alert(`Assigning judge ${id} to active hackathon...`);
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-heading text-gray-900">Judge Roster</h1>
                        <p className="text-gray-500">Invite experts and assign them to events.</p>
                    </div>
                    <div className="flex gap-3">
                         <button 
                            onClick={() => setInviteModalOpen(true)}
                            className="px-6 py-2.5 bg-[#5425FF] text-white rounded-xl font-bold hover:bg-[#4015D1] transition-colors flex items-center gap-2 shadow-lg shadow-[#5425FF]/20"
                        >
                            <Mail size={18} /> Invite Judge
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {judges.map(judge => (
                        <div key={judge.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 group hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg">
                                        {judge.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{judge.name}</h3>
                                        <div className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                            <Briefcase size={12} /> {judge.role} at {judge.company}
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                    judge.status === 'Active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                }`}>
                                    {judge.status}
                                </span>
                            </div>

                            <div className="text-sm text-gray-600 mb-6 flex items-center gap-2">
                                <MapPin size={14} className="text-gray-400" /> {judge.location}
                            </div>

                            <div className="mb-6">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Assigned To</div>
                                <div className="flex flex-wrap gap-2">
                                    {judge.assigned.length > 0 ? judge.assigned.map(ev => (
                                        <span key={ev} className="px-2 py-1 bg-gray-50 text-gray-700 rounded-md text-xs font-bold border border-gray-100">
                                            {ev}
                                        </span>
                                    )) : (
                                        <span className="text-xs text-gray-400 italic">No active assignments</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-50">
                                <button className="flex-1 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-100 transition-colors">
                                    View Profile
                                </button>
                                <button 
                                    onClick={() => handleAssign(judge.id)}
                                    className="flex-1 py-2 text-xs font-bold text-white bg-[#111827] hover:bg-black rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                    <Plus size={14} /> Assign
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Simple Invite Modal Mock */}
                {isInviteModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invite New Judge</h2>
                            <p className="text-gray-500 mb-6">Send an invitation email to add an expert to your roster.</p>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                                    <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Assign to Hackathon (Optional)</label>
                                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]">
                                        <option>Select Event...</option>
                                        <option>HackOnX 2025</option>
                                        <option>Global AI Challenge</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setInviteModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => setInviteModalOpen(false)}
                                    className="flex-1 py-3 bg-[#5425FF] text-white rounded-xl font-bold hover:bg-[#4015D1] transition-colors flex items-center justify-center gap-2"
                                >
                                    <UserPlus size={18} /> Send Invite
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminJudges;