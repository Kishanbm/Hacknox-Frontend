import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { 
    ChevronLeft, Calendar, MapPin, Users, Gavel, Clock, Trophy, 
    Calculator, Send, Download, AlertTriangle, CheckCircle2, TrendingUp, ExternalLink 
} from 'lucide-react';

const AdminHackathonDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');
    
    // Results State
    const [calculating, setCalculating] = useState(false);
    const [leaderboardComputed, setLeaderboardComputed] = useState(false);
    const [publishing, setPublishing] = useState(false);

    // Mock Data
    const event = {
        name: id === 'h1' ? 'HackOnX 2025' : 'Global AI Challenge',
        status: 'Live',
        dates: 'Mar 15 - 17, 2025',
        location: id === 'h1' ? 'Bengaluru' : 'Online',
        deadline: 'Mar 17, 11:00 AM',
        timeLeft: '22h 14m 05s'
    };

    const judges = [
        { id: 1, name: 'Dr. Emily Smith', role: 'Lead Judge', completed: 15, pending: 2 },
        { id: 2, name: 'James Wilson', role: 'Technical Judge', completed: 12, pending: 5 },
        { id: 3, name: 'Sarah Chen', role: 'Design Judge', completed: 18, pending: 0 },
    ];

    const teams = [
        { id: 't1', name: 'Alpha Squad', members: 4, status: 'Submitted' },
        { id: 't2', name: 'GreenGen', members: 3, status: 'Submitted' },
        { id: 't3', name: 'NeuroNet', members: 4, status: 'Submitted' },
        { id: 't4', name: 'PixelPioneers', members: 2, status: 'Draft' },
    ];

    // Submissions with raw scores
    const rawScores = [
        { id: 's1', teamId: 't1', team: 'Alpha Squad', project: 'Neural Vis', judge1: 9, judge2: 8, judge3: 9, total: null },
        { id: 's2', teamId: 't2', team: 'GreenGen', project: 'EcoTrack', judge1: 7, judge2: 8, judge3: 7, total: null },
        { id: 's3', teamId: 't3', team: 'NeuroNet', project: 'BrainWave', judge1: 8, judge2: 9, judge3: 10, total: null },
    ];

    const [scores, setScores] = useState<any[]>(rawScores);

    const handleCalculate = () => {
        setCalculating(true);
        setTimeout(() => {
            const calculated = scores.map(s => ({
                ...s,
                total: ((s.judge1 + s.judge2 + s.judge3) / 3).toFixed(2)
            })).sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
            
            setScores(calculated);
            setLeaderboardComputed(true);
            setCalculating(false);
        }, 2000);
    };

    const handlePublish = () => {
        setPublishing(true);
        setTimeout(() => {
            setPublishing(false);
            alert('Leaderboard published successfully!');
        }, 1500);
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto pb-12">
                <button onClick={() => navigate('/admin/hackathons')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold text-sm">
                    <ChevronLeft size={20} /> Back to Events
                </button>

                {/* Header */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#5425FF]/10 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-heading text-gray-900">{event.name}</h1>
                                <span className="bg-[#24FF00]/10 text-green-700 border border-[#24FF00]/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                    <span className="w-2 h-2 bg-[#24FF00] rounded-full animate-pulse"></span> {event.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-6 text-sm font-medium text-gray-500 mt-4">
                                <span className="flex items-center gap-2"><Calendar size={18} className="text-[#5425FF]" /> {event.dates}</span>
                                <span className="flex items-center gap-2"><MapPin size={18} className="text-[#5425FF]" /> {event.location}</span>
                            </div>
                        </div>

                        <div className="bg-gray-900 text-white p-5 rounded-2xl min-w-[200px] text-center shadow-lg">
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Time Remaining</div>
                            <div className="text-3xl font-heading text-[#24FF00] tabular-nums">{event.timeLeft}</div>
                            <div className="text-xs text-gray-500 mt-1">Deadline: {event.deadline}</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
                    {['Overview', 'Judges', 'Participants', 'Results'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                activeTab === tab 
                                ? 'bg-gray-900 text-white shadow-lg' 
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* --- OVERVIEW TAB --- */}
                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                            <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wide mb-4">Participation</h3>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-heading text-gray-900">124</span>
                                <span className="text-gray-500 font-bold mb-1">Teams</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#5425FF] h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">85% Check-in rate</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                            <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wide mb-4">Submission Status</h3>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-heading text-gray-900">42</span>
                                <span className="text-gray-500 font-bold mb-1">Submitted</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#24FF00] h-2 rounded-full" style={{ width: '34%' }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">34% of active teams</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                            <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wide mb-4">Evaluation</h3>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-heading text-gray-900">78%</span>
                                <span className="text-gray-500 font-bold mb-1">Graded</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">22% Pending review</p>
                        </div>
                    </div>
                )}

                {/* --- JUDGES TAB --- */}
                {activeTab === 'Judges' && (
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Judge</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {judges.map(judge => (
                                    <tr key={judge.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-bold text-gray-900">{judge.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{judge.role}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 w-24 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="bg-[#5425FF] h-full rounded-full" 
                                                        style={{ width: `${(judge.completed / (judge.completed + judge.pending)) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-600">
                                                    {judge.completed}/{judge.completed + judge.pending}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-xs font-bold text-[#5425FF] hover:underline">Reassign</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- PARTICIPANTS TAB --- */}
                {activeTab === 'Participants' && (
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Team Name</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Members</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {teams.map(team => (
                                    <tr key={team.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-bold text-gray-900">{team.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{team.members} Members</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                                team.status === 'Submitted' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                                            }`}>
                                                {team.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => navigate(`/dashboard/teams/${team.id}`)}
                                                className="text-xs font-bold text-gray-400 hover:text-[#5425FF] flex items-center justify-end gap-1 ml-auto transition-colors"
                                            >
                                                View <ExternalLink size={12} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- RESULTS TAB --- */}
                {activeTab === 'Results' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Control Bar */}
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 ml-2">Scoring & Leaderboard</h3>
                            <div className="flex gap-3">
                                <button className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                    <Download size={16} /> Export CSV
                                </button>
                                <button 
                                    onClick={handleCalculate}
                                    disabled={calculating}
                                    className="px-5 py-2 bg-[#5425FF] text-white rounded-xl text-sm font-bold hover:bg-[#4015D1] shadow-lg shadow-[#5425FF]/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                                >
                                    {calculating ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Calculating...</>
                                    ) : (
                                        <><Calculator size={16} /> Calculate Aggregate</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Leaderboard Table */}
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">Rank</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Team</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Project</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Judge 1</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Judge 2</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Judge 3</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aggregate Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {scores.map((score, index) => (
                                        <tr key={score.id} className={`hover:bg-gray-50/50 transition-colors ${leaderboardComputed && index < 3 ? 'bg-yellow-50/30' : ''}`}>
                                            <td className="px-6 py-4">
                                                {leaderboardComputed ? (
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                        index === 1 ? 'bg-gray-100 text-gray-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'
                                                    }`}>
                                                        {index + 1}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                <button 
                                                    onClick={() => navigate(`/dashboard/teams/${score.teamId}`)}
                                                    className="hover:text-[#5425FF] hover:underline"
                                                >
                                                    {score.team}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{score.project}</td>
                                            <td className="px-6 py-4 text-gray-500">{score.judge1}</td>
                                            <td className="px-6 py-4 text-gray-500">{score.judge2}</td>
                                            <td className="px-6 py-4 text-gray-500">{score.judge3}</td>
                                            <td className="px-6 py-4 text-right">
                                                {leaderboardComputed ? (
                                                    <span className="text-lg font-heading text-[#5425FF]">{score.total}</span>
                                                ) : (
                                                    <span className="text-gray-300 italic">Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Publish Section */}
                        {leaderboardComputed && (
                            <div className="bg-gray-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                                <div>
                                    <h3 className="text-2xl font-heading mb-2 text-[#24FF00]">Ready to Publish?</h3>
                                    <p className="text-gray-400 text-sm max-w-md">This will release the final scores and rankings to all participants and public dashboards. This action cannot be undone.</p>
                                </div>
                                <button 
                                    onClick={handlePublish}
                                    disabled={publishing}
                                    className="px-8 py-4 bg-[#24FF00] text-black rounded-xl font-bold hover:bg-[#1fe600] shadow-[0_0_20px_rgba(36,255,0,0.4)] transition-all flex items-center gap-2 transform hover:scale-105"
                                >
                                    {publishing ? 'Publishing...' : <><Send size={20} /> Publish Leaderboard</>}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminHackathonDetail;