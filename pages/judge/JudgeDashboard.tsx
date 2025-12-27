import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JudgeLayout } from '../../components/JudgeLayout';
import { ENDPOINTS } from '../../config/endpoints';
import { 
    Clock, FileCheck, AlertCircle, ArrowUpRight, 
    Calendar, TrendingUp, Flag
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    AreaChart, Area, CartesianGrid, ReferenceLine, Cell
} from 'recharts';
import apiClient from '../../lib/axios';

const JudgeDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [assignedTotal, setAssignedTotal] = useState<number>(0);
    const [completedTotal, setCompletedTotal] = useState<number>(0);
    const [pendingUrgent, setPendingUrgent] = useState<number>(0);
    const [nextDeadlineTime, setNextDeadlineTime] = useState<string>("--");
    const [nextDeadlineEvent, setNextDeadlineEvent] = useState<string>("No upcoming deadline");
    const [progressData, setProgressData] = useState<any[]>([]);
    const [pendingEvaluations, setPendingEvaluations] = useState<any[]>([]);
    const [scoreDistributionData, setScoreDistributionData] = useState<any[]>([]);
    const [flaggedReports, setFlaggedReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const progressPercent = Math.round((completedTotal / Math.max(1, assignedTotal)) * 100);

    // Fetch judge dashboard from backend and replace dummy data
    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                // Fetch dashboard summary
                const resp = await apiClient.get(ENDPOINTS.JUDGE.DASHBOARD);
                const d = resp.data?.dashboard || resp.data || {};
                
                // Set assignment counts from backend
                setAssignedTotal(d.totalAssigned ?? d.assignedTeamsCount ?? 0);
                setCompletedTotal(d.completedCount ?? d.evaluationProgress?.completed ?? 0);
                setPendingUrgent(d.pendingCount ?? d.evaluationProgress?.pending ?? 0);
                
                // Set score distribution data (for bias check graph)
                if (Array.isArray(d.scoreDistribution)) {
                    setScoreDistributionData(d.scoreDistribution);
                }
                
                // If backend provides timeline for progress chart
                if (Array.isArray(d.evaluationProgress?.timeline)) {
                    setProgressData(d.evaluationProgress.timeline.map((it: any) => ({ 
                        day: it.day || it.date || '', 
                        completed: it.completed || 0 
                    })));
                }

                // Nearest submission deadline (backend returns ISO string)
                const getTimeRemaining = (deadline?: string) => {
                    if (!deadline) return '--';
                    const diff = new Date(deadline).getTime() - Date.now();
                    if (diff <= 0) return 'Passed';
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    if (days > 0) return `${days}d ${hours}h`;
                    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    return `${hours}h ${mins}m`;
                };

                if (d.nextDeadlineTime) {
                    setNextDeadlineTime(getTimeRemaining(d.nextDeadlineTime));
                    setNextDeadlineEvent(d.nextDeadlineEvent || 'Upcoming');
                }
                
                
                // Fetch pending assignments from assignments endpoint
                const assignResp = await apiClient.get(ENDPOINTS.JUDGE.ASSIGNMENTS, {
                    params: { page: 1, limit: 10 },
                    headers: { 'x-hackathon-id': false } // Get all hackathons
                });
                
                const teams = assignResp.data?.teams || [];
                // Filter for pending evaluations only
                const pending = teams.filter((t: any) => {
                    const status = t.evaluationStatus || 'pending';
                    return status !== 'submitted' && t.isReadyForEvaluation;
                }).map((t: any) => ({
                    id: t.teamId,
                    project: t.teamName || 'Untitled',
                    hackathon: t.hackathonName || 'Unknown Event',
                    timeLeft: t.submittedAt ? 'Open' : 'Pending',
                    status: t.evaluationStatus === 'draft' ? 'Draft' : 'Pending'
                }));
                
                setPendingEvaluations(pending.slice(0, 3)); // Show top 3
                
                // Use reports included in dashboard payload if present; otherwise fall back to endpoint
                let reportsList: any[] = d.reports || [];
                if (!reportsList || reportsList.length === 0) {
                    try {
                        const reportsResp = await apiClient.get(ENDPOINTS.JUDGE.MY_REPORTS);
                        reportsList = reportsResp.data?.reports || [];
                    } catch (reportErr) {
                        console.warn('Could not fetch reports:', reportErr);
                        reportsList = [];
                    }
                }

                const openReports = (reportsList || []).filter((r: any) => (r.status && String(r.status).toLowerCase() !== 'closed'));
                setFlaggedReports(openReports.slice(0, 2));
                
                // If backend didn't send a nearest deadline, infer from assignments list
                if (!d.nextDeadlineTime) {
                    const upcoming = (teams || [])
                        .map((t: any) => ({
                            name: t.hackathonName || t.hackathon || 'Hackathon',
                            deadline: t.submissionDeadline || t.submission_deadline || null
                        }))
                        .filter((x: any) => x.deadline)
                        .map((x: any) => ({ ...x, ts: new Date(x.deadline).getTime() }))
                        .filter((x: any) => !isNaN(x.ts) && x.ts > Date.now())
                        .sort((a: any, b: any) => a.ts - b.ts);

                    if (upcoming.length > 0) {
                        setNextDeadlineTime(getTimeRemaining(upcoming[0].deadline));
                        setNextDeadlineEvent(upcoming[0].name || 'Upcoming');
                    } else {
                        setNextDeadlineTime('--');
                        setNextDeadlineEvent('No upcoming deadline');
                    }
                }
            } catch (err) {
                console.error('Failed to load judge dashboard', err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

        // Prepare chart-friendly data and domains
    const chartProgressData = progressData.map((it) => ({
        dayLabel: (() => {
            try { return new Date(it.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); } catch { return it.day; }
        })(),
        completed: it.completed || 0,
    }));

    const maxCompleted = Math.max(1, ...(chartProgressData.map((c) => c.completed || 0)));

    const maxScoreCount = Math.max(1, ...(scoreDistributionData.map((s) => s.count || 0)));


  return (
    <JudgeLayout>
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-20 lg:pb-0">
            
            {/* --- TOP KPI CARDS (4) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                
                {/* 1. Assigned Submissions */}
                <div className="bg-white p-5 lg:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between h-36 lg:h-40">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-gray-50 text-gray-600 rounded-xl">
                            <FileCheck size={20} />
                        </div>
                        <span className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wide">Workload</span>
                    </div>
                    <div>
                        <div className="text-3xl lg:text-4xl font-heading text-gray-900 mb-1">{assignedTotal}</div>
                        <div className="text-xs lg:text-sm font-medium text-gray-500">Across 3 hackathons</div>
                    </div>
                </div>

                {/* 2. Evaluations Completed */}
                <div className="bg-white p-5 lg:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between h-36 lg:h-40">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-[#5425FF]/10 text-[#5425FF] rounded-xl">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-[10px] lg:text-xs font-bold text-[#5425FF] bg-[#5425FF]/10 px-2 py-1 rounded">
                            {progressPercent}% Done
                        </span>
                    </div>
                    <div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-3xl lg:text-4xl font-heading text-gray-900">{completedTotal}</span>
                            <span className="text-lg lg:text-xl font-heading text-gray-400 mb-1">/ {assignedTotal}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#5425FF] h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* 3. Pending Before Deadline */}
                <div className="bg-white p-5 lg:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between h-36 lg:h-40">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                            <Clock size={20} />
                        </div>
                        <span className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wide">Pending</span>
                    </div>
                    <div>
                        <div className="text-3xl lg:text-4xl font-heading text-amber-500 mb-1">{pendingUrgent}</div>
                        <div className="text-xs lg:text-sm font-medium text-gray-500">{nextDeadlineTime && nextDeadlineTime !== '--' ? `Deadline in ${nextDeadlineTime}` : 'No upcoming deadlines'}</div>
                    </div>
                </div>

                {/* 4. Next Evaluation Deadline */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 lg:p-6 rounded-3xl border border-gray-800 shadow-lg text-white flex flex-col justify-between h-36 lg:h-40 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#24FF00] rounded-full blur-3xl opacity-10 -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="p-3 bg-white/10 text-[#24FF00] rounded-xl">
                            <Calendar size={20} />
                        </div>
                        <span className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wide">Next Deadline</span>
                    </div>
                    <div className="relative z-10">
                        <div className="text-2xl lg:text-3xl font-heading text-white mb-1">{nextDeadlineTime}</div>
                        <div className="text-xs lg:text-sm font-medium text-gray-400 truncate">left for {nextDeadlineEvent}</div>
                    </div>
                </div>

            </div>

            {/* --- GRAPHS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                
                {/* Graph 1: Evaluation Progress Timeline */}
                <div className="bg-white p-5 lg:p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Evaluation Velocity</h3>
                            <p className="text-xs text-gray-500">Evaluations completed over time</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartProgressData}>
                                <defs>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5425FF" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#5425FF" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="dayLabel" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} domain={[0, maxCompleted]} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    itemStyle={{color: '#5425FF', fontWeight: 'bold'}}
                                />
                                <Area type="monotone" dataKey="completed" stroke="#5425FF" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Graph 2: Score Distribution (Bias Check) */}
                <div className="bg-white p-5 lg:p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Score Bias Check</h3>
                            <p className="text-xs text-gray-500">Distribution of your assigned scores</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={scoreDistributionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} domain={[0, maxScoreCount]} />
                                <Tooltip 
                                    cursor={{fill: '#F8FAFC', radius: 8}}
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                                    {scoreDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === 3 ? '#24FF00' : '#E2E8F0'} />
                                    ))}
                                </Bar>
                                <ReferenceLine y={0} stroke="#000" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* --- SECONDARY SECTIONS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                
                {/* Pending Evaluations List */}
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <Clock size={18} className="text-amber-500"/> Pending Evaluations
                        </h4>
                        <button 
                            onClick={() => navigate('/judge/assignments')}
                            className="text-xs font-bold text-[#5425FF] hover:underline flex items-center gap-1"
                        >
                            View All <ArrowUpRight size={12} />
                        </button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {pendingEvaluations.map((sub) => (
                            <div key={sub.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-12 rounded-full ${sub.status === 'Urgent' ? 'bg-amber-500' : 'bg-gray-300'}`}></div>
                                    <div>
                                        <div className="font-bold text-gray-900 text-sm">{sub.project}</div>
                                        <div className="text-xs text-gray-500">{sub.hackathon}</div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6 flex-1 w-full sm:w-auto">
                                    <div className="text-right">
                                        <div className={`text-sm font-bold ${sub.status === 'Urgent' ? 'text-amber-600' : 'text-gray-600'}`}>
                                            {sub.timeLeft}
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">Time Left</div>
                                    </div>
                                    <button 
                                        onClick={() => navigate(`/judge/evaluate/${sub.id}`)}
                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:border-[#5425FF] hover:text-[#5425FF] transition-colors shadow-sm"
                                    >
                                        Evaluate
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Flags / Notices */}
                <div className="space-y-6">
                    <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                                <Flag size={20} className="text-red-600" />
                                <h4 className="font-bold text-red-900">Flags Raised</h4>
                            </div>
                            <span className="bg-white text-red-600 text-xs font-bold px-2 py-1 rounded border border-red-100">
                                {flaggedReports.length} Open
                            </span>
                        </div>
                        {flaggedReports.length > 0 ? (
                            <div className="space-y-3">
                                {flaggedReports.map((report: any) => (
                                    <div key={report.id} className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                                        <div className="text-xs font-bold text-gray-900">{report.subject}</div>
                                        <div className="text-[10px] text-gray-500">
                                            Project: {report.submissionTitle || report.teamName || 'Unknown'} • ID: #{report.submissionId?.slice(0, 8) || 'N/A'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-xs text-gray-500 text-center py-4">
                                No open flags
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    </JudgeLayout>
  );
};

export default JudgeDashboard;
