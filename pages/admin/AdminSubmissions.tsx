import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { 
    FileText, Search, CheckCircle2, Clock, AlertTriangle, Eye, UserPlus, Download, Check
} from 'lucide-react';

const AdminSubmissions: React.FC = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');
    const [isExporting, setIsExporting] = useState(false);

    // Mock Data
    const submissions = [
        { id: 's1', project: 'NeuroNet', team: 'Alpha Squad', hackathon: 'HackOnX 2025', track: 'AI/ML', status: 'Submitted', judges: 2, score: '-', submittedAt: '2h ago' },
        { id: 's2', project: 'EcoTrack', team: 'GreenGen', hackathon: 'Sustainable Future', track: 'Sustainability', status: 'Graded', judges: 3, score: '85/100', submittedAt: '1d ago' },
        { id: 's3', project: 'DeFi Bridge', team: 'BlockBusters', hackathon: 'HackOnX 2025', track: 'Blockchain', status: 'Flagged', judges: 0, score: '-', submittedAt: '3h ago' },
        { id: 's4', project: 'HealthAI', team: 'MedTech', hackathon: 'Global AI Challenge', track: 'Healthcare', status: 'Under Review', judges: 1, score: '-', submittedAt: '5h ago' },
        { id: 's5', project: 'CyberShield', team: 'NetSec', hackathon: 'HackOnX 2025', track: 'Security', status: 'Submitted', judges: 0, score: '-', submittedAt: '10m ago' },
    ];

    const filteredSubmissions = filter === 'All' ? submissions : submissions.filter(s => s.status === filter);

    const handleExportCSV = () => {
        setIsExporting(true);
        
        // Simulate generation delay
        setTimeout(() => {
            const headers = ['ID', 'Project', 'Team', 'Hackathon', 'Track', 'Status', 'Judges', 'Score', 'Time'];
            const rows = filteredSubmissions.map(s => [s.id, s.project, s.team, s.hackathon, s.track, s.status, s.judges, s.score, s.submittedAt]);
            
            const csvContent = "data:text/csv;charset=utf-8," 
                + headers.join(",") + "\n" 
                + rows.map(e => e.join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `submissions_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setIsExporting(false);
        }, 1000);
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-heading text-gray-900">Submission Registry</h1>
                        <p className="text-gray-500">Monitor incoming projects, track evaluation progress, and manage integrity.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleExportCSV}
                            disabled={isExporting}
                            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-[#5425FF] hover:text-[#5425FF] flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isExporting ? (
                                <><div className="w-4 h-4 border-2 border-[#5425FF] border-t-transparent rounded-full animate-spin"></div> Exporting...</>
                            ) : (
                                <><Download size={18} /> Export CSV</>
                            )}
                        </button>
                    </div>
                </div>

                {/* KPI Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">142</div>
                            <div className="text-xs font-bold text-gray-400 uppercase">Total Projects</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">34</div>
                            <div className="text-xs font-bold text-gray-400 uppercase">Pending Review</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">85%</div>
                            <div className="text-xs font-bold text-gray-400 uppercase">Evaluation Rate</div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex bg-white p-1 rounded-xl border border-gray-200">
                        {['All', 'Submitted', 'Under Review', 'Graded', 'Flagged'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    filter === status 
                                    ? 'bg-gray-900 text-white shadow-md' 
                                    : 'text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search projects..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]"
                        />
                    </div>
                </div>

                {/* Submissions Table */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Project Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Context</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Evaluation Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredSubmissions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{sub.project}</div>
                                            <div className="text-xs text-gray-500">by {sub.team} • {sub.submittedAt}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-700">{sub.hackathon}</div>
                                            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded w-fit mt-1">{sub.track}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border flex items-center gap-1.5 w-fit ${
                                                    sub.status === 'Graded' ? 'bg-green-50 text-green-600 border-green-200' : 
                                                    sub.status === 'Flagged' ? 'bg-red-50 text-red-600 border-red-200' :
                                                    sub.status === 'Under Review' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                    'bg-amber-50 text-amber-600 border-amber-200'
                                                }`}>
                                                    {sub.status === 'Flagged' && <AlertTriangle size={12} />}
                                                    {sub.status}
                                                </span>
                                                {sub.judges > 0 && (
                                                    <span className="text-xs text-gray-400 font-medium">{sub.judges} Judges</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`font-heading text-lg ${sub.score !== '-' ? 'text-gray-900' : 'text-gray-300'}`}>
                                                {sub.score}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate('/admin/assignments')}
                                                    className="p-2 text-gray-400 hover:text-[#5425FF] hover:bg-[#5425FF]/5 rounded-lg transition-colors"
                                                    title="Assign Judges"
                                                >
                                                    <UserPlus size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/dashboard/submissions/${sub.id}`)}
                                                    className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" 
                                                    title="View Project"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSubmissions;