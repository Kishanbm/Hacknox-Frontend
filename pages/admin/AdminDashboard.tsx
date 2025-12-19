import React from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { 
    Activity, Users, Gavel, AlertOctagon, ArrowUpRight, 
    Calendar, TrendingUp, AlertTriangle, Clock, CheckCircle2
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    FunnelChart, Funnel, LabelList, Cell, CartesianGrid, Legend
} from 'recharts';

// --- Mock Data ---

// Funnel Data: Registration -> Results
const funnelData = [
    { value: 1200, name: 'Registered Teams', fill: '#6366f1' },
    { value: 950, name: 'Eligible Teams', fill: '#8b5cf6' },
    { value: 744, name: 'Submissions', fill: '#ec4899' },
    { value: 550, name: 'Evaluated', fill: '#10b981' },
    { value: 12, name: 'Winners', fill: '#fbbf24' },
];

// Judge Load Data
const judgeLoadData = [
    { name: 'Dr. Smith', assigned: 20, completed: 18 },
    { name: 'Sarah J.', assigned: 25, completed: 25 },
    { name: 'Mike R.', assigned: 20, completed: 5 }, // Lagging
    { name: 'Priya P.', assigned: 15, completed: 12 },
    { name: 'Alex T.', assigned: 20, completed: 19 },
];

// Risks / Deadline Timeline
const risks = [
    { id: 1, type: 'Critical', title: '3 Judges Overdue', detail: 'HackOnX 2025 • AI Track', time: '2h overdue' },
    { id: 2, type: 'Warning', title: 'Submission Rate Low', detail: 'Global AI Challenge', time: 'Deadline in 4h' },
    { id: 3, type: 'Flag', title: 'Plagiarism Flag', detail: 'Team "CopyCat" • 98% match', time: 'Detected 1h ago' },
];

const AdminDashboard: React.FC = () => {

    // KPI Values
    const activeHackathons = 3;
    const upcomingHackathons = 2;
    const conversionRate = 62; // % Registered to Submitted
    const evalCompletion = 74; // %
    const criticalRisks = 3;

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-8 pb-12">
                
                {/* --- PRIMARY KPI CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* 1. Active Hackathons */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-gray-900 text-white rounded-xl">
                                <Activity size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Scope</span>
                        </div>
                        <div>
                            <div className="text-4xl font-heading text-gray-900 mb-1">{activeHackathons}</div>
                            <div className="text-sm font-medium text-gray-500">
                                <span className="text-green-600 font-bold">{upcomingHackathons} upcoming</span> • {activeHackathons + upcomingHackathons} total
                            </div>
                        </div>
                    </div>

                    {/* 2. Registration -> Submission Conversion */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <Users size={20} />
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${conversionRate > 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {conversionRate > 50 ? 'Healthy' : 'Low'}
                            </span>
                        </div>
                        <div>
                            <div className="flex items-end gap-2 mb-1">
                                <div className="text-4xl font-heading text-gray-900">{conversionRate}%</div>
                                <TrendingUp size={24} className="text-green-500 mb-2" />
                            </div>
                            <div className="text-sm font-medium text-gray-500">Submission Conversion</div>
                        </div>
                    </div>

                    {/* 3. Evaluation Completion */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between h-40">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <Gavel size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Progress</span>
                        </div>
                        <div>
                             <div className="flex items-end justify-between mb-2">
                                <span className="text-4xl font-heading text-gray-900">{evalCompletion}%</span>
                                <span className="text-xs font-bold text-gray-400 mb-2">Target: 100%</span>
                             </div>
                             <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${evalCompletion}%` }}></div>
                             </div>
                        </div>
                    </div>

                    {/* 4. Risk & Attention */}
                    <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm flex flex-col justify-between h-40 group hover:bg-red-100 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                            <div className="p-3 bg-white text-red-600 rounded-xl shadow-sm">
                                <AlertOctagon size={20} />
                            </div>
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wide animate-pulse">Action Req.</span>
                        </div>
                        <div>
                            <div className="text-4xl font-heading text-red-600 mb-1">{criticalRisks}</div>
                            <div className="text-sm font-bold text-red-800 flex items-center gap-1 group-hover:gap-2 transition-all">
                                Critical Issues <ArrowUpRight size={14} />
                            </div>
                        </div>
                    </div>

                </div>

                {/* --- GRAPHS & INSIGHTS --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Graph 1: Funnel Health */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Hackathon Funnel Health</h3>
                                <p className="text-xs text-gray-500">Aggregate view of active events</p>
                            </div>
                        </div>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <FunnelChart>
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                        itemStyle={{fontWeight: 'bold'}}
                                    />
                                    <Funnel
                                        dataKey="value"
                                        data={funnelData}
                                        isAnimationActive
                                    >
                                        <LabelList position="right" fill="#6B7280" stroke="none" dataKey="name" />
                                    </Funnel>
                                </FunnelChart>
                            </ResponsiveContainer>
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
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={judgeLoadData} layout="vertical" barGap={2}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fontSize: 12, fontWeight: 600}} />
                                    <Tooltip 
                                        cursor={{fill: '#F8FAFC'}} 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                    />
                                    <Legend />
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

                {/* --- RISK & TIMELINE SECTION --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Risk Feed */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <AlertTriangle size={18} className="text-red-500"/> Risk Intelligence
                            </h3>
                            <button className="text-xs font-bold text-red-600 hover:underline">View All Issues</button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {risks.map((risk) => (
                                <div key={risk.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                        risk.type === 'Critical' ? 'bg-red-100 text-red-600' : 
                                        risk.type === 'Warning' ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {risk.type === 'Critical' ? <AlertOctagon size={20} /> : <Clock size={20} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-900 text-sm">{risk.title}</h4>
                                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">{risk.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-500">{risk.detail}</p>
                                    </div>
                                    <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100">
                                        Resolve
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-[#111827] to-gray-800 rounded-3xl p-6 text-white shadow-lg">
                            <h3 className="font-heading text-lg mb-4 text-red-400">Governance</h3>
                            <div className="space-y-2">
                                <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold flex items-center gap-3 px-4 transition-colors">
                                    <Users size={16} /> User Management
                                </button>
                                <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold flex items-center gap-3 px-4 transition-colors">
                                    <Calendar size={16} /> Extend Deadlines
                                </button>
                                <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold flex items-center gap-3 px-4 transition-colors">
                                    <CheckCircle2 size={16} /> Publish Results
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm text-center">
                            <div className="text-3xl font-heading text-gray-900 mb-1">24h 12m</div>
                            <div className="text-xs text-gray-400 font-bold uppercase mb-4">Time to Next Deadline</div>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full mb-2">
                                <div className="bg-red-500 h-1.5 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                            </div>
                            <div className="text-xs text-red-500 font-bold">Evaluation Close: HackOnX</div>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;