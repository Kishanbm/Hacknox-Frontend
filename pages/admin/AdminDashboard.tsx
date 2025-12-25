import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { 
    Activity, Users, Gavel, AlertOctagon, ArrowUpRight, 
    Calendar, TrendingUp, AlertTriangle, Clock, CheckCircle2,
    X, Save, Send, ChevronDown, Loader2
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    FunnelChart, Funnel, LabelList, Cell, CartesianGrid, Legend
} from 'recharts';
import { adminService } from '../../services/admin.service';
import { useToast } from '../../components/ui/ToastProvider';

// Default empty funnel data structure
const emptyFunnelData = [
    { value: 0, name: 'Registered Teams', fill: '#6366f1' },
    { value: 0, name: 'Verified Teams', fill: '#8b5cf6' },
    { value: 0, name: 'Submissions', fill: '#ec4899' },
    { value: 0, name: 'Evaluated', fill: '#10b981' },
    { value: 0, name: 'Winners', fill: '#fbbf24' },
];

// Interface for hackathon
interface Hackathon {
    id: string;
    name: string;
    status?: string;
    submission_deadline?: string;
}

// Interface for judge load data
interface JudgeLoadItem {
    name: string;
    assigned: number;
    completed: number;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { success: toastSuccess, error: toastError } = useToast();
    
    // Modal States
    const [isExtendModalOpen, setExtendModalOpen] = useState(false);

    // Extend deadline states
    const [selectedExtendHackathon, setSelectedExtendHackathon] = useState<string>('');
    const [extendHours, setExtendHours] = useState<number>(0);
    const [extendReason, setExtendReason] = useState<string>('');
    const [extendLoading, setExtendLoading] = useState(false);

    // Nearest deadline state
    const [nearestDeadline, setNearestDeadline] = useState<{ hackathonName: string; timeLeft: string; percentage: number } | null>(null);

    // Data States
    const [hackathons, setHackathons] = useState<Hackathon[]>([]);
    const [selectedFunnelHackathon, setSelectedFunnelHackathon] = useState<string>('all');
    const [funnelData, setFunnelData] = useState(emptyFunnelData);
    const [judgeLoadData, setJudgeLoadData] = useState<JudgeLoadItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [funnelLoading, setFunnelLoading] = useState(false);

    // KPI Values (will be computed from data)
    const [activeHackathons, setActiveHackathons] = useState(0);
    const [upcomingHackathons, setUpcomingHackathons] = useState(0);
    const [conversionRate, setConversionRate] = useState(0);
    const [evalCompletion, setEvalCompletion] = useState(0);
    const [criticalRisks, setCriticalRisks] = useState(0);

    // Fetch hackathons and initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                
                // Fetch hackathons
                const hackResponse = await adminService.getMyHackathons();
                const hackList = hackResponse?.hackathons || hackResponse || [];
                setHackathons(hackList);
                
                // Count active and upcoming
                const active = hackList.filter((h: Hackathon) => h.status === 'active' || h.status === 'ongoing').length;
                const upcoming = hackList.filter((h: Hackathon) => h.status === 'upcoming' || h.status === 'draft').length;
                setActiveHackathons(active || hackList.length);
                setUpcomingHackathons(upcoming);
                // If the user has no hackathons, don't fetch global workload/analytics
                if (!hackList || hackList.length === 0) {
                    // Show empty states
                    setJudgeLoadData([{ name: 'No hackathons', assigned: 0, completed: 0 }]);
                    setFunnelData(emptyFunnelData);
                    setConversionRate(0);
                    setEvalCompletion(0);
                    setNearestDeadline(null);
                    setSelectedFunnelHackathon('none');
                } else {
                    // Fetch judges for workload data (top 6)
                    await fetchJudgeWorkload();

                    // Fetch aggregate analytics for KPIs
                    await fetchAnalyticsData('all');

                    // Calculate nearest deadline
                    calculateNearestDeadline(hackList);
                }

                // Fetch reports count for critical issues
                try {
                    const reportsCount = await adminService.getReportsCount();
                    setCriticalRisks(reportsCount?.count || 0);
                } catch (err) {
                    console.error('Failed to fetch reports count', err);
                    setCriticalRisks(0);
                }
                
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchInitialData();
    }, []);

    // Calculate nearest deadline from hackathons
    const calculateNearestDeadline = (hackList: Hackathon[]) => {
        try {
            const now = new Date().getTime();
            let nearest: { hackathon: Hackathon; timeLeft: number } | null = null;
            
            for (const hack of hackList) {
                const deadline = hack.submission_deadline || (hack as any).submissionDeadline;
                if (!deadline) continue;
                
                const deadlineTime = new Date(deadline).getTime();
                const timeLeft = deadlineTime - now;
                
                // Only consider future deadlines
                if (timeLeft > 0) {
                    if (!nearest || timeLeft < nearest.timeLeft) {
                        nearest = { hackathon: hack, timeLeft };
                    }
                }
            }
            
            if (nearest) {
                const hours = Math.floor(nearest.timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((nearest.timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const timeLeftStr = `${hours}h ${minutes}m`;
                
                // Calculate percentage (assuming 7 days = 100%)
                const totalTime = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
                const percentage = Math.min(100, Math.max(0, 100 - (nearest.timeLeft / totalTime * 100)));
                
                setNearestDeadline({
                    hackathonName: nearest.hackathon.name,
                    timeLeft: timeLeftStr,
                    percentage: percentage
                });
            } else {
                setNearestDeadline(null);
            }
        } catch (error) {
            console.error('Error calculating nearest deadline:', error);
        }
    };

    // Fetch analytics when funnel hackathon changes
    useEffect(() => {
        if (!loading && hackathons.length > 0) {
            if (selectedFunnelHackathon === 'none') {
                setFunnelData(emptyFunnelData);
                setConversionRate(0);
                setEvalCompletion(0);
            } else {
                fetchAnalyticsData(selectedFunnelHackathon);
            }
        }
    }, [selectedFunnelHackathon, hackathons]);

    // Fetch analytics data for funnel and KPIs
    const fetchAnalyticsData = async (hackathonId: string) => {
        try {
            setFunnelLoading(true);
            if (hackathonId === 'none') {
                setFunnelData(emptyFunnelData);
                setConversionRate(0);
                setEvalCompletion(0);
                return;
            }
            
            // Use specific hackathon or aggregate all
            let analyticsData: any = null;
            
            if (hackathonId === 'all' && hackathons.length > 0) {
                // Aggregate data from all hackathons
                const allAnalytics = await Promise.all(
                    hackathons.map(h => adminService.getAnalyticsForHackathon(h.id).catch(() => null))
                );
                
                // Combine the analytics
                let totalTeams = 0;
                let verifiedTeams = 0;
                let totalSubmissions = 0;
                let evaluatedCount = 0;
                let winnersCount = 0;
                
                allAnalytics.forEach((data: any) => {
                    if (!data) return;
                    
                    const keyMetrics = data.keyMetrics || {};
                    totalTeams += keyMetrics.totalTeams || 0;
                    totalSubmissions += keyMetrics.totalSubmissions || 0;
                    
                    // Count from summaries
                    const teamSummary = data.teamSummary || [];
                    const submissionSummary = data.submissionSummary || [];
                    const evalSummary = data.evaluationSummary || [];
                    
                    // Verified = teams with verified status
                    const verified = teamSummary.find((t: any) => t.verification_status === 'verified');
                    verifiedTeams += verified?.count || 0;
                    
                    // Evaluated = evaluations with submitted status
                    const evaluated = evalSummary.find((e: any) => e.status === 'submitted' || e.status === 'completed');
                    evaluatedCount += evaluated?.count || 0;
                    
                    // Winners = submissions with winner status
                    const winners = submissionSummary.find((s: any) => s.status === 'winner');
                    winnersCount += winners?.count || 0;
                });
                
                // Update funnel
                setFunnelData([
                    { value: totalTeams, name: 'Registered Teams', fill: '#6366f1' },
                    { value: verifiedTeams || Math.floor(totalTeams * 0.8), name: 'Verified Teams', fill: '#8b5cf6' },
                    { value: totalSubmissions, name: 'Submissions', fill: '#ec4899' },
                    { value: evaluatedCount, name: 'Evaluated', fill: '#10b981' },
                    { value: winnersCount, name: 'Winners', fill: '#fbbf24' },
                ]);
                
                // Update KPIs
                setConversionRate(totalTeams > 0 ? Math.round((totalSubmissions / totalTeams) * 100) : 0);
                setEvalCompletion(totalSubmissions > 0 ? Math.round((evaluatedCount / totalSubmissions) * 100) : 0);
                
            } else {
                // Single hackathon
                analyticsData = await adminService.getAnalyticsForHackathon(hackathonId);

                // Defensive: if analyticsData is missing or invalid, show empty funnel
                if (!analyticsData) {
                    setFunnelData(emptyFunnelData);
                    setConversionRate(0);
                    setEvalCompletion(0);
                    return;
                }

                const keyMetrics = analyticsData?.keyMetrics || {};
                const teamSummary = analyticsData?.teamSummary || [];
                const submissionSummary = analyticsData?.submissionSummary || [];
                const evalSummary = analyticsData?.evaluationSummary || [];

                const totalTeams = Number(keyMetrics.totalTeams || 0);
                const totalSubmissions = Number(keyMetrics.totalSubmissions || 0);

                const verified = teamSummary.find((t: any) => t.verification_status === 'verified');
                const verifiedTeams = Number(verified?.count || Math.floor(totalTeams * 0.8));

                const evaluated = evalSummary.find((e: any) => e.status === 'submitted' || e.status === 'completed');
                const evaluatedCount = Number(evaluated?.count || 0);

                const winners = submissionSummary.find((s: any) => s.status === 'winner');
                const winnersCount = Number(winners?.count || 0);

                setFunnelData([
                    { value: totalTeams, name: 'Registered Teams', fill: '#6366f1' },
                    { value: verifiedTeams, name: 'Verified Teams', fill: '#8b5cf6' },
                    { value: totalSubmissions, name: 'Submissions', fill: '#ec4899' },
                    { value: evaluatedCount, name: 'Evaluated', fill: '#10b981' },
                    { value: winnersCount, name: 'Winners', fill: '#fbbf24' },
                ]);

                // Compute conversion and review coverage from the returned summaries (more robust to varying status names)
                const totalSubmissionCount = (submissionSummary || []).reduce((acc: number, s: any) => acc + (Number(s.count) || 0), 0);
                const totalEvaluationCount = (evalSummary || []).reduce((acc: number, e: any) => acc + (Number(e.count) || 0), 0);

                setConversionRate(totalTeams > 0 ? Math.round((totalSubmissionCount / totalTeams) * 100) : 0);
                setEvalCompletion(totalSubmissionCount > 0 ? Math.round((totalEvaluationCount / totalSubmissionCount) * 100) : 0);
            }
            
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setFunnelLoading(false);
        }
    };

    // Fetch judge workload data (top 6)
    const fetchJudgeWorkload = async () => {
        try {
            // Fetch all judges with their assignments
            const judgeResponse = await adminService.getJudges(1, 100);
            const judgeList = judgeResponse?.judges || judgeResponse?.data || judgeResponse || [];
            
            // Calculate workload for each judge
            const workloadData: JudgeLoadItem[] = [];
            
            for (const judge of judgeList.slice(0, 10)) { // Check top 10 judges
                try {
                    const judgeDetails = await adminService.getJudgeById?.(judge.id) || judge;
                    const firstName = judgeDetails.first_name || judge.first_name || '';
                    const lastName = judgeDetails.last_name || judge.last_name || '';
                    const displayName = `${firstName} ${lastName.charAt(0)}.`.trim() || judge.email?.split('@')[0] || 'Judge';
                    
                    const assigned = judgeDetails.total_assigned || judge.total_assigned || 0;
                    const completed = judgeDetails.completed_evaluations || judge.completed_evaluations || 0;
                    
                    workloadData.push({
                        name: displayName,
                        assigned: assigned,
                        completed: completed
                    });
                } catch (e) {
                    // Skip if we can't get details
                }
            }
            
            // Sort by assigned (descending) and take top 6
            const top6 = workloadData
                .sort((a, b) => b.assigned - a.assigned)
                .slice(0, 6);
            
            setJudgeLoadData(top6.length > 0 ? top6 : [
                { name: 'No judges', assigned: 0, completed: 0 }
            ]);
            
        } catch (error) {
            console.error('Error fetching judge workload:', error);
            setJudgeLoadData([{ name: 'No data', assigned: 0, completed: 0 }]);
        }
    };

    // Handle extend deadline submission
    const handleExtendDeadline = async () => {
        if (!selectedExtendHackathon || extendHours <= 0) return;
        
        try {
            setExtendLoading(true);
            
            // Get the current hackathon details
            const hackathon = hackathons.find(h => h.id === selectedExtendHackathon);
            if (!hackathon) throw new Error('Hackathon not found');
            
            const currentDeadline = hackathon.submission_deadline || (hackathon as any).submissionDeadline;
            if (!currentDeadline) throw new Error('No deadline set for this hackathon');
            
            // Calculate new deadline
            const currentDeadlineDate = new Date(currentDeadline);
            const newDeadlineDate = new Date(currentDeadlineDate.getTime() + (extendHours * 60 * 60 * 1000));
            
            // Update hackathon with new deadline
            await adminService.updateHackathon(selectedExtendHackathon, {
                submission_deadline: newDeadlineDate.toISOString()
            });
            
            // Refresh hackathons list
            const res = await adminService.getMyHackathons();
            const hackList = res?.hackathons || res || [];
            setHackathons(hackList);
            calculateNearestDeadline(hackList);
            
            // Close modal and reset
            setExtendModalOpen(false);
            setSelectedExtendHackathon('');
            setExtendHours(0);
            setExtendReason('');
            
            toastSuccess && toastSuccess(`Deadline extended successfully by ${extendHours} hour(s)`);
        } catch (error: any) {
            console.error('Error extending deadline:', error);
            toastError && toastError(`Failed to extend deadline: ${error?.message || 'Unknown error'}`);
        } finally {
            setExtendLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-12">
                
                {/* --- PRIMARY KPI CARDS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    
                    {/* 1. Active Hackathons */}
                    <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between h-36 md:h-40">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-gray-900 text-white rounded-xl">
                                <Activity size={20} />
                            </div>
                            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wide">Scope</span>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-heading text-gray-900 mb-1">{activeHackathons}</div>
                            <div className="text-xs md:text-sm font-medium text-gray-500">
                                <span className="text-green-600 font-bold">{upcomingHackathons} upcoming</span> • {activeHackathons + upcomingHackathons} total
                            </div>
                        </div>
                    </div>

                    {/* 2. Registration -> Submission Conversion */}
                    <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between h-36 md:h-40">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <Users size={20} />
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded ${conversionRate > 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {conversionRate > 50 ? 'Healthy' : 'Low'}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-end gap-2 mb-1">
                                <div className="text-3xl md:text-4xl font-heading text-gray-900">{conversionRate}%</div>
                                <TrendingUp size={24} className="text-green-500 mb-2" />
                            </div>
                            <div className="text-xs md:text-sm font-medium text-gray-500">Submission Conversion</div>
                        </div>
                    </div>

                    {/* 3. Evaluation Completion */}
                    <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between h-36 md:h-40">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Gavel size={20} />
                            </div>
                            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-wide">Progress</span>
                        </div>
                        <div>
                             <div className="flex items-end justify-between mb-2">
                                <span className="text-3xl md:text-4xl font-heading text-gray-900">{evalCompletion}%</span>
                                <span className="text-[10px] md:text-xs font-bold text-gray-400 mb-2">Target: 100%</span>
                             </div>
                             <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${evalCompletion}%` }}></div>
                             </div>
                        </div>
                    </div>

                    {/* 4. Risk & Attention */}
                    <div 
                        onClick={() => navigate('/admin/reports')}
                        className="bg-red-50 p-5 md:p-6 rounded-3xl border border-red-100 shadow-sm flex flex-col justify-between h-36 md:h-40 group hover:bg-red-100 transition-colors cursor-pointer"
                    >
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-white text-red-600 rounded-xl shadow-sm">
                                <AlertOctagon size={20} />
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold text-red-600 uppercase tracking-wide ${criticalRisks > 0 ? 'animate-pulse' : ''}`}>Action Req.</span>
                        </div>
                        <div>
                            <div className="text-3xl md:text-4xl font-heading text-red-600 mb-1">{criticalRisks}</div>
                            <div className="text-xs md:text-sm font-bold text-red-800 flex items-center gap-1 group-hover:gap-2 transition-all">
                                Critical Issues <ArrowUpRight size={14} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- GRAPHS & INSIGHTS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    
                    {/* Graph 1: Funnel Health */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Hackathon Funnel Health</h3>
                                <p className="text-xs text-gray-500">Aggregate view of active events</p>
                            </div>
                            <select
                                value={selectedFunnelHackathon}
                                onChange={(e) => setSelectedFunnelHackathon(e.target.value)}
                                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:border-gray-900"
                            >
                                <option value="all">All Hackathons</option>
                                {hackathons.map(h => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="h-64 md:h-72 w-full">
                            {funnelLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="animate-spin text-gray-400" size={24} />
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <FunnelChart>
                                        <Tooltip 
                                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                            itemStyle={{fontWeight: 'bold', color: '#111827'}}
                                            formatter={(value: number) => [value.toLocaleString(), 'Count']}
                                        />
                                        <Legend 
                                            verticalAlign="bottom" 
                                            height={36} 
                                            iconType="circle"
                                            formatter={(value) => <span className="text-xs font-bold text-gray-600 ml-1">{value}</span>}
                                        />
                                        <Funnel
                                            dataKey="value"
                                            data={funnelData}
                                            isAnimationActive
                                        >
                                            {funnelData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Funnel>
                                    </FunnelChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Graph 2: Judge Performance */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                         <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Judge Workload & Status</h3>
                                <p className="text-xs text-gray-500">Identify lagging evaluators</p>
                            </div>
                        </div>
                        <div className="h-64 md:h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={judgeLoadData} layout="vertical" barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fontSize: 12, fontWeight: 600}} />
                                    <Tooltip 
                                        cursor={{fill: '#F8FAFC'}} 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Legend wrapperStyle={{paddingTop: '10px'}} />
                                    <Bar dataKey="assigned" name="Assigned" fill="#E2E8F0" radius={[0, 4, 4, 0]} barSize={12} />
                                    <Bar dataKey="completed" name="Completed" fill="#5425FF" radius={[0, 4, 4, 0]} barSize={12}>
                                        {judgeLoadData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.completed < entry.assigned * 0.5 ? '#EF4444' : '#5425FF'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>

                {/* --- GOVERNANCE & DEADLINE SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                    
                    {/* Quick Actions / Governance - Full Width with Side-by-Side Buttons */}
                    <div className="bg-gradient-to-br from-[#111827] to-gray-800 rounded-3xl p-6 text-white shadow-lg">
                        <h3 className="font-heading text-lg mb-4 text-[#24FF00]">Quick Actions</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button 
                                onClick={() => navigate('/admin/participants')}
                                className="py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold flex flex-col items-center gap-2 px-3 transition-colors"
                            >
                                <Users size={20} />
                                <span className="text-xs">Users</span>
                            </button>
                            <button 
                                onClick={() => setExtendModalOpen(true)}
                                className="py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold flex flex-col items-center gap-2 px-3 transition-colors"
                            >
                                <Calendar size={20} />
                                <span className="text-xs">Deadlines</span>
                            </button>
                            <button 
                                onClick={() => navigate('/admin/leaderboard')}
                                className="py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold flex flex-col items-center gap-2 px-3 transition-colors"
                            >
                                <CheckCircle2 size={20} />
                                <span className="text-xs">Results</span>
                            </button>
                        </div>
                    </div>

                    {/* Deadline Timer */}
                    {nearestDeadline ? (
                        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-center">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-gray-400 font-bold uppercase mb-2">Next Deadline</div>
                                    <div className="text-3xl font-heading text-gray-900 mb-1">{nearestDeadline.timeLeft}</div>
                                    <div className="text-sm font-bold text-red-500">{nearestDeadline.hackathonName}</div>
                                </div>
                                <div className="w-20 h-20 relative">
                                    <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E5E7EB" strokeWidth="3"/>
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EF4444" strokeWidth="3" strokeDasharray={`${nearestDeadline.percentage}, 100`} className="animate-pulse"/>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Clock size={24} className="text-red-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex items-center justify-center">
                            <div className="text-center">
                                <Clock size={32} className="mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-500">No upcoming deadlines</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- MODALS --- */}

                {/* Extend Deadline Modal */}
                {isExtendModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Calendar size={24} className="text-[#5425FF]"/> Extend Deadline
                                </h2>
                                <button onClick={() => {
                                    setExtendModalOpen(false);
                                    setSelectedExtendHackathon('');
                                    setExtendHours(0);
                                    setExtendReason('');
                                }} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Hackathon</label>
                                    <select 
                                        value={selectedExtendHackathon}
                                        onChange={(e) => setSelectedExtendHackathon(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium"
                                    >
                                        <option value="">Choose hackathon...</option>
                                        {hackathons.map(h => (
                                            <option key={h.id} value={h.id}>{h.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Extend By</label>
                                    <div className="grid grid-cols-3 gap-2 mb-2">
                                        <button onClick={() => setExtendHours(1)} className={`py-2 border rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors ${extendHours === 1 ? 'border-[#5425FF] text-[#5425FF] bg-[#5425FF]/5' : 'border-gray-200'}`}>+1 Hour</button>
                                        <button onClick={() => setExtendHours(12)} className={`py-2 border rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors ${extendHours === 12 ? 'border-[#5425FF] text-[#5425FF] bg-[#5425FF]/5' : 'border-gray-200'}`}>+12 Hours</button>
                                        <button onClick={() => setExtendHours(24)} className={`py-2 border rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors ${extendHours === 24 ? 'border-[#5425FF] text-[#5425FF] bg-[#5425FF]/5' : 'border-gray-200'}`}>+24 Hours</button>
                                    </div>
                                    <input
                                        type="number"
                                        min="1"
                                        value={extendHours || ''}
                                        onChange={(e) => setExtendHours(parseInt(e.target.value) || 0)}
                                        placeholder="Or enter custom hours"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Reason (Optional)</label>
                                    <textarea 
                                        value={extendReason}
                                        onChange={(e) => setExtendReason(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] text-sm resize-none" 
                                        rows={3} 
                                        placeholder="e.g. Server outage, technical issues..."
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleExtendDeadline}
                                disabled={extendLoading || !selectedExtendHackathon || extendHours <= 0}
                                className="w-full py-3 bg-[#111827] text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {extendLoading ? (
                                    <><Loader2 className="animate-spin" size={18} /> Extending...</>
                                ) : (
                                    <><Save size={18} /> Confirm Extension</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;