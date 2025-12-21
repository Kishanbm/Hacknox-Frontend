import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { CalendarModal } from '../components/CalendarModal';
import { ENDPOINTS } from '../config/endpoints';
import { teamService } from '../services/team.service';
import { publicService } from '../services/public.service';
import { 
  Trophy, Clock, Zap, AlertCircle, ArrowUpRight, 
  Activity, Layers, ChevronDown, ChevronUp, Calendar as CalendarIcon, 
  CheckCircle2, AlertTriangle, ArrowRight, MapPin, MoreVertical, Flag, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell,
  FunnelChart, Funnel, LabelList
} from 'recharts';

// --- Static chart data (can be replaced with real analytics later) ---

const funnelData = [
  { value: 100, name: 'Joined', fill: '#6366f1' },
  { value: 80, name: 'Team Formed', fill: '#8b5cf6' },
  { value: 60, name: 'Building', fill: '#ec4899' },
  { value: 40, name: 'Submitted', fill: '#10b981' },
];

const deadlineData = [
  { bucket: 'Today', count: 1, urgency: 'High' },
  { bucket: '3 Days', count: 3, urgency: 'High' },
  { bucket: '7 Days', count: 1, urgency: 'Medium' },
  { bucket: '14 Days', count: 2, urgency: 'Low' },
];

const readinessData = [
  { subject: 'Repo Linked', A: 100, fullMark: 100 },
  { subject: 'Demo Video', A: 80, fullMark: 100 },
  { subject: 'Pitch Deck', A: 40, fullMark: 100 },
  { subject: 'Description', A: 90, fullMark: 100 },
  { subject: 'Team', A: 100, fullMark: 100 },
];

const calendarDays = Array.from({ length: 35 }, (_, i) => i + 1);
const calendarEvents = [
    { day: 14, type: 'deadline', color: 'bg-red-500' },
    { day: 16, type: 'event', color: 'bg-blue-500' },
    { day: 17, type: 'milestone', color: 'bg-green-500' },
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // State for real data
  const [activeHackathons, setActiveHackathons] = useState<any[]>([]);
  const [activeHackathonsCount, setActiveHackathonsCount] = useState(0);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [actionsRequired, setActionsRequired] = useState(0);
  const [nextDeadline, setNextDeadline] = useState("--");
  const [nextDeadlineEvent, setNextDeadlineEvent] = useState("No upcoming");
  const [roadmapSteps, setRoadmapSteps] = useState<any[]>([]);

  // Fetch real data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch teams (which are linked to hackathons)
        const teams = await teamService.getMyTeams();
        
        // Fetch public hackathons to get full details
        const hackathonsRes = await publicService.getHackathons();
        const hackathons = hackathonsRes || [];

        // Build active hackathons from teams
        const localUser = (() => {
          try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
        })();

        const activeEvents = (teams || [])
          .filter((t: any) => t.hackathon_phase !== 'completed')
          .map((t: any) => {
            const hackathon = hackathons.find((h: any) => h.id === t.hackathon_id);
            const isLeader = t.leader_id === localUser?.id;
            const progress = t.submission_status === 'submitted' ? 100 : t.submission_status === 'draft' ? 50 : 10;
            
            return {
              id: t.hackathon_id || t.id,
              name: t.hackathon_title || hackathon?.title || 'Hackathon',
              organizer: hackathon?.organizer_name || 'Organizer',
              role: isLeader ? 'Leader' : 'Member',
              team: t.name,
              status: t.hackathon_phase === 'ongoing' ? 'Live' : (t.hackathon_phase === 'registration' ? 'Registration' : 'Upcoming'),
              nextTask: t.is_verified ? 'Work on submission' : 'Complete team verification',
              deadline: hackathon?.submission_deadline ? getTimeRemaining(hackathon.submission_deadline) : '—',
              progress,
              color: 'from-indigo-600 to-purple-700',
              bgImage: hackathon?.banner_url || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000'
            };
          });

        setActiveHackathons(activeEvents);
        setActiveHackathonsCount(activeEvents.length);

        // Calculate submissions progress
        const totalTeams = (teams || []).length;
        const submittedCount = (teams || []).filter((t: any) => t.submission_status === 'submitted' || t.submission_status === 'draft').length;
        setSubmissionProgress(totalTeams > 0 ? Math.round((submittedCount / totalTeams) * 100) : 0);

        // Calculate actions required (unverified teams, missing submissions)
        const actions = (teams || []).filter((t: any) => !t.is_verified || t.submission_status === 'no_submission').length;
        setActionsRequired(actions);

        // Find next deadline
        const now = new Date();
        const upcomingDeadlines = hackathons
          .filter((h: any) => h.submission_deadline && new Date(h.submission_deadline) > now)
          .sort((a: any, b: any) => new Date(a.submission_deadline).getTime() - new Date(b.submission_deadline).getTime());
        
        if (upcomingDeadlines.length > 0) {
          const next = upcomingDeadlines[0];
          setNextDeadline(getTimeRemaining(next.submission_deadline));
          setNextDeadlineEvent(next.title + ' Submission');
        }

        // Build roadmap from first active event
        if (activeEvents.length > 0) {
          const firstHackathon = hackathons.find((h: any) => h.id === activeEvents[0].id);
          if (firstHackathon) {
            const steps = [
              { id: 1, title: 'Registration', date: formatDate(firstHackathon.start_date), status: 'completed' },
              { id: 2, title: 'Team Formation', date: formatDate(firstHackathon.start_date), status: activeEvents[0].team ? 'completed' : 'active' },
              { id: 3, title: 'Building', date: '—', status: activeEvents[0].progress > 10 ? 'completed' : 'active' },
              { id: 4, title: 'Submission', date: formatDate(firstHackathon.submission_deadline), status: activeEvents[0].progress === 100 ? 'completed' : 'upcoming' },
              { id: 5, title: 'Results', date: formatDate(firstHackathon.result_date), status: 'upcoming' },
            ];
            setRoadmapSteps(steps);
          }
        }

      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper to format time remaining
  const getTimeRemaining = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return 'Passed';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 pb-12">
        
        {/* --- KPI SECTION (Bento Grid) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           
           {/* 1. Active Hackathons */}
           <div 
             onClick={() => navigate('/dashboard/hackathons')}
             className="bg-white p-5 lg:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-36 lg:h-40 group hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
           >
              <div className="flex justify-between items-start">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Layers size={20} />
                 </div>
                 <span className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wide">Participation</span>
              </div>
              <div>
                 <div className="text-3xl lg:text-4xl font-heading text-gray-900 mb-1">{activeHackathonsCount}</div>
                 <div className="text-xs lg:text-sm font-medium text-gray-500">Across 3 teams</div>
              </div>
           </div>

           {/* 2. Submission Progress */}
           <div 
             onClick={() => navigate('/dashboard/submissions')}
             className="bg-white p-5 lg:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-36 lg:h-40 group hover:border-purple-200 hover:shadow-md transition-all cursor-pointer"
           >
              <div className="flex justify-between items-start">
                 <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity size={20} />
                 </div>
                 <span className={`text-[10px] lg:text-xs font-bold px-2 py-0.5 rounded ${submissionProgress > 50 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {submissionProgress > 50 ? 'On Track' : 'At Risk'}
                 </span>
              </div>
              <div className="flex items-end gap-3">
                 <div className="relative w-12 h-12 lg:w-16 lg:h-16 shrink-0">
                     <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E0E7FF" strokeWidth="4" />
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4F46E5" strokeWidth="4" strokeDasharray={`${submissionProgress}, 100`} />
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] lg:text-xs font-bold text-gray-700">{submissionProgress}%</div>
                 </div>
                 <div className="text-xs lg:text-sm font-medium text-gray-500 mb-1">Submissions Started</div>
              </div>
           </div>

           {/* 3. Actions Required */}
           <div 
             onClick={() => navigate('/dashboard/submissions')}
             className="bg-white p-5 lg:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-36 lg:h-40 group hover:border-amber-200 hover:shadow-md transition-all cursor-pointer"
           >
              <div className="flex justify-between items-start">
                 <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertCircle size={20} />
                 </div>
                 <span className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wide">Attention</span>
              </div>
              <div>
                 <div className="text-3xl lg:text-4xl font-heading text-amber-500 mb-1">{actionsRequired}</div>
                 <div className="flex items-center gap-1 text-xs lg:text-sm font-medium text-gray-500 group-hover:text-amber-600 transition-colors">
                    Review Now <ArrowUpRight size={14} />
                 </div>
              </div>
           </div>

           {/* 4. Next Deadline */}
           <div 
             onClick={() => setIsCalendarOpen(true)}
             className="bg-white p-5 lg:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-36 lg:h-40 group hover:border-red-200 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
           >
               <div className="absolute right-0 top-0 w-24 h-24 bg-red-50 rounded-bl-full -mr-4 -mt-4 z-0 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start z-10">
                 <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock size={20} />
                 </div>
                 <div className="text-[10px] lg:text-xs font-bold text-gray-500 hover:text-primary flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2 py-1 rounded-lg transition-colors">
                    <CalendarIcon size={12}/> View All
                 </div>
              </div>
              <div className="z-10">
                 <div className="text-2xl lg:text-3xl font-heading text-red-500 mb-1">{nextDeadline}</div>
                 <div className="text-xs font-bold text-gray-900 uppercase truncate">{nextDeadlineEvent}</div>
              </div>
           </div>
        </div>

        {/* --- HERO SLIDER --- */}
        <section>
            <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-xl lg:text-2xl font-heading text-gray-900">Active Events</h2>
                <div className="flex gap-2">
                    <button className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-500"><ChevronLeft size={18}/></button>
                    <button className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-500"><ChevronRight size={18}/></button>
                </div>
            </div>
            
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 lg:gap-6 pb-4 lg:pb-8 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide">
                {activeHackathons.map((hackathon) => (
                    <div 
                        key={hackathon.id}
                        onClick={() => navigate(`/dashboard/hackathons/${hackathon.id}`)}
                        className="snap-center shrink-0 w-[85vw] md:w-[600px] lg:w-[750px] h-[280px] lg:h-[320px] rounded-3xl relative overflow-hidden shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
                    >
                        {/* Background Image with Overlay */}
                        <div className="absolute inset-0">
                            <img src={hackathon.bgImage} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className={`absolute inset-0 bg-gradient-to-r ${hackathon.color} opacity-90 mix-blend-multiply`}></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-between text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-[10px] lg:text-xs font-bold uppercase tracking-wider">
                                            {hackathon.status}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-[10px] lg:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                            <Clock size={12} /> {hackathon.deadline}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl lg:text-4xl font-heading mb-1">{hackathon.name}</h3>
                                    <p className="text-white/80 font-medium flex items-center gap-2 text-sm lg:text-base">
                                        by {hackathon.organizer}
                                    </p>
                                </div>
                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-white group-hover:text-primary transition-colors">
                                    <ArrowUpRight size={20} />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-end justify-between mb-4">
                                    <div>
                                        <div className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1">Current Team</div>
                                        <div className="flex items-center gap-2 font-bold text-lg lg:text-xl">
                                            <Flag size={18} className="text-secondary" /> {hackathon.team}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase tracking-widest text-white/60 font-bold mb-1">Next Task</div>
                                        <div className="font-bold text-base lg:text-lg">{hackathon.nextTask}</div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="relative h-1.5 lg:h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-secondary shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                                        style={{ width: `${hackathon.progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between mt-2 text-[10px] font-bold text-white/60">
                                    <span>Progress</span>
                                    <span>{hackathon.progress}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
            
            {/* --- LEFT COLUMN (Graphs & Timeline) --- */}
            <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                
                {/* Timeline Roadmap */}
                <div className="bg-white p-6 lg:p-8 rounded-3xl border border-gray-100 shadow-sm overflow-x-auto">
                    <div className="flex justify-between items-center mb-8 min-w-[300px]">
                        <h3 className="font-heading text-xl text-gray-900 flex items-center gap-2">
                            <MapPin size={20} className="text-primary"/> Project Roadmap
                        </h3>
                        <span className="text-xs font-bold text-gray-400 uppercase">HackOnX 2025</span>
                    </div>
                    
                    <div className="relative min-w-[600px] md:min-w-0">
                        {/* Connecting Line */}
                        <div className="absolute top-[14px] left-0 right-0 h-0.5 bg-gray-100 hidden md:block"></div>
                        
                        <div className="flex flex-col md:flex-row justify-between gap-6 relative">
                            {roadmapSteps.map((step, idx) => {
                                const isCompleted = step.status === 'completed';
                                const isActive = step.status === 'active';
                                
                                return (
                                    <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-0 relative z-10 group">
                                        {/* Mobile Vertical Line */}
                                        {idx !== roadmapSteps.length - 1 && (
                                            <div className="absolute left-[14px] top-8 bottom-[-24px] w-0.5 bg-gray-100 md:hidden"></div>
                                        )}

                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                            isCompleted ? 'bg-primary border-primary text-white' : 
                                            isActive ? 'bg-white border-primary text-primary shadow-[0_0_0_4px_rgba(84,37,255,0.2)]' : 
                                            'bg-white border-gray-200 text-gray-300'
                                        }`}>
                                            {isCompleted ? <CheckCircle2 size={14} /> : <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary' : 'bg-gray-300'}`}></div>}
                                        </div>
                                        
                                        <div className="md:text-center md:mt-4">
                                            <div className={`text-sm font-bold ${isActive ? 'text-primary' : 'text-gray-900'}`}>{step.title}</div>
                                            <div className="text-xs text-gray-500 font-medium">{step.date}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Funnel & Deadline Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    
                    {/* Submission Funnel */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="mb-4">
                            <h3 className="font-heading text-lg text-gray-900">Submission Funnel</h3>
                            <p className="text-sm text-gray-500">Participant conversion rates</p>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <FunnelChart>
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                                        itemStyle={{color: '#111827', fontWeight: 'bold'}}
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

                    {/* Deadline Load */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="mb-4 flex justify-between items-end">
                            <div>
                                <h3 className="font-heading text-lg text-gray-900">Workload</h3>
                                <p className="text-sm text-gray-500">Upcoming deadlines</p>
                            </div>
                            <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold uppercase">High Pressure</span>
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deadlineData}>
                                    <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                                    <Tooltip cursor={{fill: '#F3F4F6', radius: 4}} contentStyle={{borderRadius: '12px'}} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {deadlineData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.urgency === 'High' ? '#EF4444' : entry.urgency === 'Medium' ? '#F59E0B' : '#10B981'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RIGHT COLUMN (Calendar & Stats) --- */}
            <div className="space-y-6 lg:space-y-8">
                
                {/* Calendar Widget */}
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                         <h3 className="font-heading text-lg text-gray-900">March 2025</h3>
                         <div className="flex gap-1">
                             <button className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={16} className="text-gray-400"/></button>
                             <button className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={16} className="text-gray-400"/></button>
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['S','M','T','W','T','F','S'].map(d => (
                            <div key={d} className="text-xs font-bold text-gray-400">{d}</div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                            const isCurrentMonth = i < 31;
                            const dayNum = isCurrentMonth ? i + 1 : i - 30;
                            const event = isCurrentMonth ? calendarEvents.find(e => e.day === dayNum) : null;
                            const isToday = dayNum === 15 && isCurrentMonth;

                            return (
                                <div 
                                    key={i} 
                                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative group cursor-pointer transition-colors
                                        ${!isCurrentMonth ? 'text-gray-200' : 'text-gray-700 hover:bg-gray-50'}
                                        ${isToday ? 'bg-primary text-white hover:bg-primary font-bold shadow-md shadow-primary/30' : ''}
                                    `}
                                >
                                    {dayNum}
                                    {event && (
                                        <div className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${event.color} ${isToday ? 'bg-white' : ''}`}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                             <div className="w-10 h-10 bg-red-100 text-red-500 rounded-lg flex flex-col items-center justify-center shrink-0">
                                 <span className="text-[10px] font-bold uppercase">Mar</span>
                                 <span className="text-sm font-bold leading-none">17</span>
                             </div>
                             <div>
                                 <div className="text-sm font-bold text-gray-900">Submission Deadline</div>
                                 <div className="text-xs text-gray-500">HackOnX 2025</div>
                             </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                             <div className="w-10 h-10 bg-blue-100 text-blue-500 rounded-lg flex flex-col items-center justify-center shrink-0">
                                 <span className="text-[10px] font-bold uppercase">Mar</span>
                                 <span className="text-sm font-bold leading-none">20</span>
                             </div>
                             <div>
                                 <div className="text-sm font-bold text-gray-900">Mentorship Round</div>
                                 <div className="text-xs text-gray-500">Online Event</div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Stats (Readiness) */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
                    <div 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="p-6 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <div>
                             <h3 className="font-heading text-lg text-gray-900 flex items-center gap-2">
                                <Zap size={18} className="text-amber-500" /> Readiness Audit
                             </h3>
                             <p className="text-xs text-gray-500">AI Analysis</p>
                        </div>
                        {showAdvanced ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                    </div>
                    
                    {showAdvanced && (
                        <div className="p-6 pt-0 animate-in fade-in slide-in-from-top-4 duration-300">
                             <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={readinessData}>
                                        <PolarGrid stroke="#E5E7EB" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6B7280' }} />
                                        <Radar name="Current" dataKey="A" stroke="#5425FF" fill="#5425FF" fillOpacity={0.4} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                             </div>
                             <p className="text-xs text-center text-gray-500 mt-2">Your pitch deck needs more work to improve score.</p>
                        </div>
                    )}
                </div>

                {/* Rank / Gamification Mini Card */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-center mb-4 relative z-10">
                        <div className="flex items-center gap-2">
                            <Trophy size={18} className="text-yellow-400" />
                            <span className="font-heading text-lg">Top 5%</span>
                        </div>
                        <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded">Global Rank</span>
                    </div>
                    <div className="w-full bg-gray-700 h-2 rounded-full mb-2 relative z-10">
                        <div className="bg-secondary h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <p className="text-xs text-gray-400 relative z-10">You are outperforming 95% of participants.</p>
                </div>

            </div>
        </div>
        
        <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
