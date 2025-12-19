import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Search, ShieldAlert, CheckCircle2, MoreHorizontal, UserX, AlertCircle, Lock, Unlock } from 'lucide-react';

const AdminParticipants: React.FC = () => {
    
    // Mock Data
    const [teams, setTeams] = useState([
        { id: 1, name: 'Alpha Squad', leader: 'Alex Morgan', members: 4, status: 'Verified', hackathon: 'HackOnX 2025', locked: true },
        { id: 2, name: 'GreenGen', leader: 'Sarah Chen', members: 3, status: 'Pending', hackathon: 'Sustainable Future', locked: false },
        { id: 3, name: 'CopyCat', leader: 'John Doe', members: 2, status: 'Flagged', hackathon: 'HackOnX 2025', locked: false },
        { id: 4, name: 'PixelPioneers', leader: 'David Kim', members: 4, status: 'Verified', hackathon: 'Global AI Challenge', locked: true },
        { id: 5, name: 'QuantumLeap', leader: 'Priya P.', members: 1, status: 'Disqualified', hackathon: 'HackOnX 2025', locked: true },
    ]);

    const handleAction = (id: number, action: 'verify' | 'disqualify' | 'toggleLock') => {
        setTeams(teams.map(t => {
            if (t.id === id) {
                if (action === 'toggleLock') return { ...t, locked: !t.locked };
                return { ...t, status: action === 'verify' ? 'Verified' : 'Disqualified' };
            }
            return t;
        }));
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-heading text-gray-900">Participant Governance</h1>
                        <p className="text-gray-500">Monitor team integrity, verify eligibility, and enforce rules.</p>
                    </div>
                    <div className="flex gap-3">
                         <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:border-[#5425FF]">
                            <option>HackOnX 2025</option>
                            <option>Global AI Challenge</option>
                            <option>All Events</option>
                        </select>
                         <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search teams or leaders..." 
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-64 focus:outline-none focus:border-[#5425FF]"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Team Entity</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Composition</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Context</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Integrity</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Governance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {teams.map(team => (
                                <tr key={team.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{team.name}</div>
                                        <div className="text-xs text-gray-500">Lead: {team.leader}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-bold ${team.members < 2 ? 'text-red-500' : 'text-gray-700'}`}>{team.members}/4</span>
                                            {team.locked ? <Lock size={12} className="text-gray-400"/> : <Unlock size={12} className="text-green-500"/>}
                                        </div>
                                        {team.members < 2 && <span className="text-[10px] text-red-500 font-bold uppercase">Below Min Size</span>}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{team.hackathon}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase border flex w-fit items-center gap-1 ${
                                            team.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-200' :
                                            team.status === 'Flagged' ? 'bg-red-50 text-red-600 border-red-200' :
                                            team.status === 'Disqualified' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                            'bg-amber-50 text-amber-600 border-amber-200'
                                        }`}>
                                            {team.status === 'Flagged' && <ShieldAlert size={12} />}
                                            {team.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleAction(team.id, 'toggleLock')}
                                                className={`p-2 rounded-lg transition-colors ${team.locked ? 'text-amber-600 hover:bg-amber-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                                title={team.locked ? "Unlock Team" : "Lock Team"}
                                            >
                                                {team.locked ? <Lock size={18} /> : <Unlock size={18} />}
                                            </button>
                                            
                                            {team.status !== 'Verified' && team.status !== 'Disqualified' && (
                                                <button 
                                                    onClick={() => handleAction(team.id, 'verify')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                                    title="Verify Eligibility"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}
                                            
                                            {team.status !== 'Disqualified' && (
                                                <button 
                                                    onClick={() => handleAction(team.id, 'disqualify')}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                                                    title="Disqualify / Remove"
                                                >
                                                    <UserX size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminParticipants;