import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { 
    ChevronLeft, Calendar, MapPin, Users, Gavel, Clock, Trophy, 
    Calculator, Send, Download, AlertTriangle, CheckCircle2, TrendingUp, ExternalLink 
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import apiClient from '../../lib/axios';

const AdminHackathonDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Overview');
    
    // State
    const [hackathon, setHackathon] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any>(null);
    const [judges, setJudges] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Results State
    const [calculating, setCalculating] = useState(false);
    const [leaderboardComputed, setLeaderboardComputed] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [leaderboardPublished, setLeaderboardPublished] = useState(false);

    useEffect(() => {
        if (id) {
            // Set the hackathon ID in localStorage for x-hackathon-id header
            localStorage.setItem('selectedHackathonId', id);
            // Also set it on the axios client instance
            try {
                apiClient.getInstance().defaults.headers.common['x-hackathon-id'] = id;
            } catch (e) {
                console.warn('Failed to set x-hackathon-id on apiClient instance', e);
            }
            
            fetchData();
        }
        
        return () => {
            // Clean up header when leaving
            try {
                apiClient.getInstance().defaults.headers.common && delete apiClient.getInstance().defaults.headers.common['x-hackathon-id'];
            } catch (e) {
                try { delete (apiClient as any).defaults?.headers?.common['x-hackathon-id']; } catch (_) {}
            }
        };
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch all data in parallel (analytics requires x-hackathon-id header set above)
            const [analyticsRes, judgesRes, teamsRes, leaderboardRes] = await Promise.all([
                adminService.getAnalyticsOverview().catch(() => ({})),
                adminService.getJudges(1, 100).catch(() => ({ judges: [] })),
                adminService.getTeams(1, 100).catch(() => ({ teams: [] })),
                adminService.getLeaderboard().catch(() => ({ leaderboard: [] }))
            ]);

            console.log('[AdminHackathonDetail] Fetched data:', { analyticsRes, judgesRes, teamsRes, leaderboardRes });

            // Normalize analytics shape: backend returns { keyMetrics: { totalTeams, totalSubmissions, ... } }
            const normalizedAnalytics = {
                ...analyticsRes,
                totalTeams: analyticsRes?.keyMetrics?.totalTeams ?? analyticsRes?.totalTeams ?? analyticsRes?.total_teams,
                totalSubmissions: analyticsRes?.keyMetrics?.totalSubmissions ?? analyticsRes?.totalSubmissions ?? analyticsRes?.total_submissions,
                evaluationSummary: analyticsRes?.evaluationSummary || analyticsRes?.evaluation_summary || []
            };

            setAnalytics(normalizedAnalytics || {});
            setJudges(judgesRes.judges || []);
            setTeams(teamsRes.teams || []);
            const lbData = Array.isArray(leaderboardRes) ? leaderboardRes : (leaderboardRes.leaderboard || []);
            const isPublished = leaderboardRes?.is_published ?? leaderboardRes?.isPublished ?? leaderboardRes?.published ?? false;
            setLeaderboard(lbData);
            setLeaderboardPublished(Boolean(isPublished));

            // Also fetch the hackathon metadata (name, deadlines, etc.)
            try {
                const hack = await adminService.getHackathon(id!);
                setHackathon(hack || null);
            } catch (e) {
                console.warn('[AdminHackathonDetail] failed to load hackathon metadata', e);
            }
            
            if (leaderboardRes.leaderboard && leaderboardRes.leaderboard.length > 0) {
                setLeaderboardComputed(true);
            }
        } catch (error: any) {
            console.error('[AdminHackathonDetail] Error fetching:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDeadline = (deadline: string) => {
        if (!deadline) return 'N/A';
        try {
            const date = new Date(deadline);
            return date.toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        } catch {
            return deadline;
        }
    };

    const handleCalculate = async () => {
        try {
            setCalculating(true);
            // First aggregate scores
            await adminService.aggregateScores();
            // Then compute leaderboard
            await adminService.computeLeaderboard();
            // Refetch leaderboard
            const res = await adminService.getLeaderboard();
            setLeaderboard(res.leaderboard || []);
            setLeaderboardComputed(true);
            alert('Leaderboard calculated successfully!');
        } catch (error: any) {
            alert('Failed to calculate: ' + (error.response?.data?.message || error.message));
        } finally {
            setCalculating(false);
        }
    };

    const handlePublish = async () => {
        try {
            setPublishing(true);
            await adminService.publishLeaderboard(true);
            alert('Leaderboard published successfully!');
        } catch (error: any) {
            alert('Failed to publish: ' + (error.response?.data?.message || error.message));
        } finally {
            setPublishing(false);
        }
    };

    const handleExportCSV = async () => {
        try {
            const blob = await adminService.exportTeamsCSV();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `teams-${id}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error: any) {
            alert('Failed to export: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto pb-12">
                <button onClick={() => navigate('/admin/hackathons')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold text-sm">
                    <ChevronLeft size={20} /> Back to Events
                </button>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-[#5425FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500 font-medium">Loading hackathon details...</p>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#5425FF]/10 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
                            
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-4xl font-heading text-gray-900">{hackathon?.name || 'Hackathon Details'}</h1>
                                        <span className="bg-[#24FF00]/10 text-green-700 border border-[#24FF00]/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                                            <span className="w-2 h-2 bg-[#24FF00] rounded-full animate-pulse"></span> {hackathon?.status || 'Active'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm font-medium text-gray-500 mt-4">
                                        <span className="flex items-center gap-2"><Calendar size={18} className="text-[#5425FF]" /> ID: {id}</span>
                                        <span className="flex items-center gap-2">Max Team: {hackathon?.max_team_size ?? hackathon?.maxTeamSize ?? analytics?.totalTeams ?? 'N/A'}</span>
                                    </div>

                                    {/* Dev info: show fetched objects so UI doesn't go blank and to aid debugging */}
                                    <div className="mt-4 text-xs text-gray-400 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        <div><strong>Debug:</strong></div>
                                        <div className="mt-2">
                                            <pre className="whitespace-pre-wrap break-words max-h-32 overflow-auto">{JSON.stringify({ hackathon: hackathon?.id ? { id: hackathon.id, name: hackathon.name } : null, analytics: analytics ? { totalTeams: analytics.totalTeams, totalSubmissions: analytics.totalSubmissions } : null, judges: judges?.length, teams: teams?.length }, null, 2)}</pre>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-900 text-white p-5 rounded-2xl min-w-[200px] text-center shadow-lg">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Analytics</div>
                                    <div className="text-2xl font-heading text-[#24FF00] tabular-nums">
                                        {analytics?.totalTeams || 0} Teams
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">{analytics?.totalSubmissions || 0} Submissions</div>
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
                                <span className="text-4xl font-heading text-gray-900">{analytics?.totalTeams || 0}</span>
                                <span className="text-gray-500 font-bold mb-1">Teams</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#5425FF] h-2 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Registered teams</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                            <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wide mb-4">Submission Status</h3>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-heading text-gray-900">{analytics?.totalSubmissions || 0}</span>
                                <span className="text-gray-500 font-bold mb-1">Submitted</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-[#24FF00] h-2 rounded-full" style={{ 
                                    width: `${analytics?.totalTeams ? (analytics.totalSubmissions / analytics.totalTeams * 100) : 0}%` 
                                }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {analytics?.totalTeams ? Math.round((analytics.totalSubmissions / analytics.totalTeams) * 100) : 0}% of teams
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                            <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wide mb-4">Evaluation</h3>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-4xl font-heading text-gray-900">{judges.length}</span>
                                <span className="text-gray-500 font-bold mb-1">Judges</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Active judges</p>
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
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {judges.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No judges assigned yet
                                        </td>
                                    </tr>
                                ) : (
                                    judges.map((judge: any) => (
                                        <tr key={judge.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {judge.first_name} {judge.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{judge.email}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-bold">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-xs font-bold text-[#5425FF] hover:underline">View</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- PARTICIPANTS TAB --- */}
                {activeTab === 'Participants' && (
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <button 
                                onClick={handleExportCSV}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Download size={16} /> Export CSV
                            </button>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Team Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Leader</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {teams.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                                No teams registered yet
                                            </td>
                                        </tr>
                                    ) : (
                                        teams.map((team: any) => (
                                            <tr key={team.id} className="hover:bg-gray-50/50">
                                                <td className="px-6 py-4 font-bold text-gray-900">{team.name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{team.leader_email || 'N/A'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                                        team.verification_status === 'verified' 
                                                            ? 'bg-green-50 text-green-700 border-green-200' 
                                                            : 'bg-gray-50 text-gray-600 border-gray-200'
                                                    }`}>
                                                        {team.verification_status || 'pending'}
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
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- RESULTS TAB --- */}
                {activeTab === 'Results' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Control Bar */}
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-gray-900 ml-2">Scoring & Leaderboard</h3>
                            <div className="flex gap-3">
                                <button 
                                    onClick={handleExportCSV}
                                    className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                >
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

                        {/* Leaderboard (show top 3 only when published) */}
                        {!leaderboardPublished ? (
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 text-center text-gray-500">
                                Results are not published for this hackathon.
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {leaderboard.slice(0, 3).map((entry: any, index: number) => (
                                        <div key={entry.id || index} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-center">
                                            <div className="text-2xl font-heading mb-2">{index + 1}</div>
                                            <div className="font-bold text-lg">{entry.team_name || entry.teamName || 'Unknown Team'}</div>
                                            <div className="text-sm text-gray-500 mt-1">{entry.project_title || entry.project || ''}</div>
                                            <div className="text-3xl font-heading text-[#5425FF] mt-4">{(entry.final_score ?? entry.score ?? '-')}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Publish Section */}
                        {leaderboardComputed && leaderboard.length > 0 && (
                            <div className="bg-gray-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                                <div>
                                    <h3 className="text-2xl font-heading mb-2 text-[#24FF00]">Ready to Publish?</h3>
                                    <p className="text-gray-400 text-sm max-w-md">This will release the final scores and rankings to all participants and public dashboards. This action cannot be undone.</p>
                                </div>
                                <button 
                                    onClick={handlePublish}
                                    disabled={publishing}
                                    className="px-8 py-4 bg-[#24FF00] text-black rounded-xl font-bold hover:bg-[#1fe600] shadow-[0_0_20px_rgba(36,255,0,0.4)] transition-all flex items-center gap-2 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {publishing ? 'Publishing...' : <><Send size={20} /> Publish Leaderboard</>}
                                </button>
                            </div>
                        )}
                    </div>
                )}
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminHackathonDetail;