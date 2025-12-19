import React from 'react';
import { useNavigate } from 'react-router-dom';
import { JudgeLayout } from '../../components/JudgeLayout';
import { 
    Clock, FileCheck, AlertCircle, ArrowUpRight, 
    Calendar, TrendingUp, Flag
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    AreaChart, Area, CartesianGrid, ReferenceLine, Cell
} from 'recharts';

// --- Mock Data ---

// Graph 1: Evaluation Progress Timeline
const progressData = [
  { day: 'Mon', completed: 2 },
  { day: 'Tue', completed: 4 },
  { day: 'Wed', completed: 3 },
  { day: 'Thu', completed: 6 },
  { day: 'Fri', completed: 8 }, // Today
];

// Graph 2: Score Distribution (Bias Check)
const scoreDistributionData = [
    { range: '0-10', count: 0 },
    { range: '11-20', count: 2 },
    { range: '21-30', count: 5 },
    { range: '31-35', count: 8 },
    { range: '36-40', count: 3 },
];

const pendingEvaluations = [
    { id: 's1', project: 'NeuroNet', hackathon: 'HackOnX 2025', timeLeft: '4h 30m', status: 'Urgent' },
    { id: 's4', project: 'HealthAI', hackathon: 'Global AI Challenge', timeLeft: '12h 15m', status: 'Pending' },
    { id: 's2', project: 'EcoTrack', hackathon: 'Sustainable Future', timeLeft: '2 Days', status: 'Pending' },
];

const JudgeDashboard: React.FC = () => {
  const navigate = useNavigate();

  // KPI Values
  const assignedTotal = 18;
  const completedTotal = 11;
  const pendingUrgent = 7;
  const nextDeadlineTime = "36 hours";
  const nextDeadlineEvent = "HackOnX Finals";
  const progressPercent = Math.round((completedTotal / assignedTotal) * 100);

  return (
    <JudgeLayout>
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            
            {/* --- TOP KPI CARDS (4) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Assigned Submissions */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-gray-50 text-gray-600 rounded-xl">
                            <FileCheck size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Workload</span>
                    </div>
                    <div>
                        <div className="text-4xl font-heading text-gray-900 mb-1">{assignedTotal}</div>
                        <div className="text-sm font-medium text-gray-500">Across 3 hackathons</div>
                    </div>
                </div>

                {/* 2. Evaluations Completed */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-[#5425FF]/10 text-[#5425FF] rounded-xl">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-xs font-bold text-[#5425FF] bg-[#5425FF]/10 px-2 py-1 rounded">
                            {progressPercent}% Done
                        </span>
                    </div>
                    <div>
                        <div className="flex items-end gap-2 mb-2">
                            <span className="text-4xl font-heading text-gray-900">{completedTotal}</span>
                            <span className="text-xl font-heading text-gray-400 mb-1">/ {assignedTotal}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-[#5425FF] h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* 3. Pending Before Deadline */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between h-40">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
                            <Clock size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Pending</span>
                    </div>
                    <div>
                        <div className="text-4xl font-heading text-amber-500 mb-1">{pendingUrgent}</div>
                        <div className="text-sm font-medium text-gray-500">Deadline in 2 days</div>
                    </div>
                </div>

                {/* 4. Next Evaluation Deadline */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl border border-gray-800 shadow-lg text-white flex flex-col justify-between h-40 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#24FF00] rounded-full blur-3xl opacity-10 -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="p-3 bg-white/10 text-[#24FF00] rounded-xl">
                            <Calendar size={20} />
                        </div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Next Deadline</span>
                    </div>
                    <div className="relative z-10">
                        <div className="text-3xl font-heading text-white mb-1">{nextDeadlineTime}</div>
                        <div className="text-sm font-medium text-gray-400 truncate">left for {nextDeadlineEvent}</div>
                    </div>
                </div>

            </div>

            {/* --- GRAPHS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Graph 1: Evaluation Progress Timeline */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Evaluation Velocity</h3>
                            <p className="text-xs text-gray-500">Evaluations completed over time</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={progressData}>
                                <defs>
                                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#5425FF" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#5425FF" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} />
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
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
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
                                <div className="flex items-center justify-between sm:justify-end gap-6 flex-1">
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
                                2 Open
                            </span>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                                <div className="text-xs font-bold text-gray-900">Plagiarism Report</div>
                                <div className="text-[10px] text-gray-500">Project: CryptoSafe • ID: #8821</div>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                                <div className="text-xs font-bold text-gray-900">Incomplete Submission</div>
                                <div className="text-[10px] text-gray-500">Project: SolarAI • ID: #9942</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </JudgeLayout>
  );
};

export default JudgeDashboard;