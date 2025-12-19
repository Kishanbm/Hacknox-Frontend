import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Search, ShieldAlert, CheckCircle2, MoreHorizontal, UserX, AlertCircle } from 'lucide-react';

const AdminParticipants: React.FC = () => {
    const [filter, setFilter] = useState('All');
    
    // Mock Data
    const [teams, setTeams] = useState([
        { id: 1, name: 'Alpha Squad', leader: 'Alex Morgan', members: 4, status: 'Verified', hackathon: 'HackOnX 2025' },
        { id: 2, name: 'GreenGen', leader: 'Sarah Chen', members: 3, status: 'Pending', hackathon: 'Sustainable Future' },
        { id: 3, name: 'CopyCat', leader: 'John Doe', members: 2, status: 'Flagged', hackathon: 'HackOnX 2025' },
        { id: 4, name: 'PixelPioneers', leader: 'David Kim', members: 4, status: 'Verified', hackathon: 'Global AI Challenge' },
    ]);

    const handleAction = (id: number, action: 'verify' | 'disqualify') => {
        setTeams(teams.map(t => {
            if (t.id === id) {
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
                        <h1 className="text-3xl font-heading text-gray-900">Participant Management</h1>
                        <p className="text-gray-500">Verify team eligibility and manage governance.</p>
                    </div>
                    <div className="flex gap-3">
                         <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:border-[#5425FF]">
                            <option>HackOnX 2025</option>
                            <option>Global AI Challenge</option>
                        </select>
                         <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search teams..." 
                                className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-64 focus:outline-none focus:border-[#5425FF]"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Team Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Leader</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Size</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Event</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {teams.map(team => (
                                <tr key={team.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-gray-900">{team.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{team.leader}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{team.members}/4</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{team.hackathon}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
                                            team.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-200' :
                                            team.status === 'Flagged' ? 'bg-red-50 text-red-600 border-red-200' :
                                            team.status === 'Disqualified' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                                            'bg-amber-50 text-amber-600 border-amber-200'
                                        }`}>
                                            {team.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {team.status !== 'Verified' && team.status !== 'Disqualified' && (
                                                <button 
                                                    onClick={() => handleAction(team.id, 'verify')}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                                                    title="Verify Team"
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
                                            <button className="p-2 text-gray-400 hover:text-gray-900 rounded-lg">
                                                <MoreHorizontal size={18} />
                                            </button>
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