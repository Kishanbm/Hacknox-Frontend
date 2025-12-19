import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Mail, Plus, UserPlus, MoreVertical, ShieldOff, KeyRound, Trash2, UserCheck, X } from 'lucide-react';

const AdminJudges: React.FC = () => {
    // Mock Data with Status and Load
    const [judges, setJudges] = useState([
        { id: 1, name: 'Dr. Emily Smith', email: 'emily.smith@deepmind.com', role: 'AI Researcher', company: 'DeepMind', location: 'London, UK', status: 'Active', load: 12, assignments: ['HackOnX 2025'] },
        { id: 2, name: 'James Wilson', email: 'j.wilson@aws.com', role: 'Senior Architect', company: 'AWS', location: 'Seattle, USA', status: 'Invited', load: 0, assignments: [] },
        { id: 3, name: 'Sarah Chen', email: 'sarah@techstart.io', role: 'CTO', company: 'TechStart', location: 'Singapore', status: 'Active', load: 24, assignments: ['HackOnX 2025', 'Global AI'] },
        { id: 4, name: 'Michael Ross', email: 'mike@cybercorp.de', role: 'Security Lead', company: 'CyberCorp', location: 'Berlin, DE', status: 'Deactivated', load: 0, assignments: [] },
    ]);

    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedJudgeId, setSelectedJudgeId] = useState<number | null>(null);
    const [activeActionId, setActiveActionId] = useState<number | null>(null);

    const handleAction = (id: number, action: 'deactivate' | 'activate' | 'reset' | 'delete') => {
        if (action === 'deactivate') {
            setJudges(judges.map(j => j.id === id ? { ...j, status: 'Deactivated', load: 0 } : j));
        } else if (action === 'activate') {
            setJudges(judges.map(j => j.id === id ? { ...j, status: 'Active' } : j));
        } else if (action === 'delete') {
            setJudges(judges.filter(j => j.id !== id));
        } else if (action === 'reset') {
            alert(`Password reset link sent to ${judges.find(j => j.id === id)?.email}`);
        }
        setActiveActionId(null);
    };

    const openAssignModal = (id: number) => {
        setSelectedJudgeId(id);
        setAssignModalOpen(true);
    };

    const handleQuickAssign = (event: string) => {
        if (selectedJudgeId) {
            setJudges(judges.map(j => {
                if (j.id === selectedJudgeId && !j.assignments.includes(event)) {
                    return { ...j, assignments: [...j.assignments, event] };
                }
                return j;
            }));
            setAssignModalOpen(false);
            setSelectedJudgeId(null);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-heading text-gray-900">Judge Identity & Access</h1>
                        <p className="text-gray-500">Onboard evaluators, manage access, and monitor availability.</p>
                    </div>
                    <div className="flex gap-3">
                         <button 
                            onClick={() => setInviteModalOpen(true)}
                            className="px-6 py-2.5 bg-[#5425FF] text-white rounded-xl font-bold hover:bg-[#4015D1] transition-colors flex items-center gap-2 shadow-lg shadow-[#5425FF]/20 group"
                        >
                            <UserPlus size={18} className="text-[#24FF00] group-hover:text-white transition-colors" /> Create Judge
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Identity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Access Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Affiliation</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Active Assignments</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Lifecycle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {judges.map(judge => (
                                    <tr key={judge.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg border-2 border-white shadow-sm">
                                                    {judge.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{judge.name}</div>
                                                    <div className="text-xs text-gray-400 font-medium">{judge.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border flex items-center gap-1.5 w-fit ${
                                                judge.status === 'Active' ? 'bg-[#24FF00]/10 text-green-700 border-[#24FF00]/20' : 
                                                judge.status === 'Deactivated' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                            }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    judge.status === 'Active' ? 'bg-[#24FF00] shadow-[0_0_5px_#24FF00] animate-pulse' : 
                                                    judge.status === 'Deactivated' ? 'bg-red-500' : 'bg-amber-500'
                                                }`}></div>
                                                {judge.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-700">{judge.company}</div>
                                            <div className="text-xs text-gray-500">{judge.role}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {judge.assignments.map((a, i) => (
                                                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-600 font-medium">{a}</span>
                                                ))}
                                                {judge.assignments.length === 0 && <span className="text-xs text-gray-400 italic">Unassigned</span>}
                                            </div>
                                            {judge.status === 'Active' && (
                                                <button 
                                                    onClick={() => openAssignModal(judge.id)}
                                                    className="text-xs font-bold text-[#5425FF] hover:underline flex items-center gap-1"
                                                >
                                                    <Plus size={12} /> Quick Assign
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button 
                                                onClick={() => setActiveActionId(activeActionId === judge.id ? null : judge.id)}
                                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <MoreVertical size={18} />
                                            </button>
                                            
                                            {/* Action Menu */}
                                            {activeActionId === judge.id && (
                                                <div className="absolute right-12 top-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-10 py-1 animate-in fade-in zoom-in-95 duration-200">
                                                    <button 
                                                        onClick={() => handleAction(judge.id, 'reset')}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                    >
                                                        <KeyRound size={16} /> Reset Password
                                                    </button>
                                                    {judge.status === 'Active' ? (
                                                        <button 
                                                            onClick={() => handleAction(judge.id, 'deactivate')}
                                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                                                        >
                                                            <ShieldOff size={16} /> Deactivate
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleAction(judge.id, 'activate')}
                                                            className="w-full text-left px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 flex items-center gap-2"
                                                        >
                                                            <UserCheck size={16} /> Reactivate
                                                        </button>
                                                    )}
                                                    <div className="h-px bg-gray-100 my-1"></div>
                                                    <button 
                                                        onClick={() => handleAction(judge.id, 'delete')}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                    >
                                                        <Trash2 size={16} /> Remove Account
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Invite Modal */}
                {isInviteModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Initialize Judge Account</h2>
                            <p className="text-gray-500 mb-6 text-sm">Create a new evaluator identity. They will receive an email to set their password.</p>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] text-sm" placeholder="e.g. Dr. Jane Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address (Identity)</label>
                                    <input type="email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] text-sm" placeholder="jane@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Organization</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] text-sm" placeholder="e.g. OpenAI" />
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
                                    className="flex-1 py-3 bg-[#5425FF] text-white rounded-xl font-bold hover:bg-[#4015D1] transition-colors flex items-center justify-center gap-2 group"
                                >
                                    <Mail size={18} className="text-[#24FF00] group-hover:text-white" /> Send Invite
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Assign Modal */}
                {isAssignModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Quick Assign Judge</h2>
                                <button onClick={() => setAssignModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-gray-500 mb-6 text-sm">Add {judges.find(j => j.id === selectedJudgeId)?.name} to a hackathon event. This grants them access to the event dashboard.</p>
                            
                            <div className="space-y-3">
                                {['HackOnX 2025', 'Global AI Challenge', 'Sustainable Future'].map(evt => (
                                    <button 
                                        key={evt}
                                        onClick={() => handleQuickAssign(evt)}
                                        className="w-full text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 hover:border-[#5425FF] hover:text-[#5425FF] hover:bg-[#5425FF]/5 transition-all flex justify-between items-center"
                                    >
                                        {evt}
                                        <Plus size={16} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminJudges;