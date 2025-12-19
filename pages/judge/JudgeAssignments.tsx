import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JudgeLayout } from '../../components/JudgeLayout';
import { Search, Filter, Clock, CheckCircle2, ChevronRight, FileText, ArrowRight } from 'lucide-react';

// Extended mock data with hackathon IDs
const assignments = [
    { id: 's1', project: 'NeuroNet', team: 'Alpha Squad', hackathon: 'HackOnX 2025', status: 'Pending', score: '-', deadline: '24h left', category: 'AI/ML' },
    { id: 's2', project: 'EcoTrack', team: 'GreenGen', hackathon: 'Sustainable Future', status: 'Draft', score: '-', deadline: '48h left', category: 'Sustainability' },
    { id: 's3', project: 'DeFi Bridge', team: 'BlockBusters', hackathon: 'HackOnX 2025', status: 'Completed', score: '35/40', deadline: 'Submitted', category: 'Blockchain' },
    { id: 's4', project: 'HealthAI', team: 'MedTech', hackathon: 'Global AI Challenge', status: 'Pending', score: '-', deadline: '12h left', category: 'Healthcare' },
    { id: 's5', project: 'CyberShield', team: 'NetSec', hackathon: 'HackOnX 2025', status: 'Completed', score: '38/40', deadline: 'Submitted', category: 'Security' },
];

const JudgeAssignments: React.FC = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('All');
    const [hackathonFilter, setHackathonFilter] = useState('All Events');

    const filtered = assignments.filter(a => {
        const matchesStatus = statusFilter === 'All' ? true : 
                              statusFilter === 'Pending' ? (a.status === 'Pending' || a.status === 'Draft') : 
                              a.status === statusFilter;
        
        const matchesHackathon = hackathonFilter === 'All Events' ? true : a.hackathon === hackathonFilter;

        return matchesStatus && matchesHackathon;
    });

    // Extract unique hackathons for dropdown
    const uniqueHackathons = ['All Events', ...Array.from(new Set(assignments.map(a => a.hackathon)))];

    return (
        <JudgeLayout>
            <div className="max-w-7xl mx-auto pb-20 lg:pb-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Evaluation Queue</h1>
                        <p className="text-gray-500">Select a submission to begin grading.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search projects..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] focus:ring-1 focus:ring-[#5425FF] transition-all text-sm"
                            />
                        </div>
                        <select 
                            value={hackathonFilter}
                            onChange={(e) => setHackathonFilter(e.target.value)}
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:border-[#5425FF] text-sm font-bold appearance-none cursor-pointer hover:bg-gray-50"
                        >
                            {uniqueHackathons.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                </div>

                {/* Tabs - Scrollable */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
                    {['All', 'Pending', 'Completed'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                                statusFilter === tab 
                                ? 'bg-[#5425FF] text-white shadow-md shadow-[#5425FF]/20' 
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Project</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Hackathon</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Deadline</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.length > 0 ? (
                                    filtered.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{item.project}</div>
                                                        <div className="text-xs text-gray-500">{item.team}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">
                                                {item.hackathon}
                                                <div className="text-xs text-gray-400">{item.category}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`flex items-center gap-1.5 text-sm font-bold ${
                                                    item.status === 'Completed' ? 'text-green-600' : 
                                                    item.status === 'Draft' ? 'text-amber-600' : 'text-gray-600'
                                                }`}>
                                                    {item.status === 'Completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                                                {item.deadline}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                                                {item.score}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <button 
                                                    onClick={() => navigate(`/judge/evaluate/${item.id}`)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ml-auto ${
                                                        item.status === 'Completed' 
                                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                                                        : 'bg-[#5425FF] text-white hover:bg-[#4015D1] shadow-lg shadow-[#5425FF]/20'
                                                    }`}
                                                >
                                                    {item.status === 'Completed' ? 'Edit Score' : 'Grade Now'}
                                                    {item.status !== 'Completed' && <ArrowRight size={12} />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No assignments found matching filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </JudgeLayout>
    );
};

export default JudgeAssignments;