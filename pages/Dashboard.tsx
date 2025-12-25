import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { CalendarModal } from '../components/CalendarModal';
import { ENDPOINTS } from '../config/endpoints';
import { teamService } from '../services/team.service';
import { publicService } from '../services/public.service';
import submissionsService from '../services/submissions.service';
import { 
  Clock, Zap, AlertCircle, ArrowUpRight, 
  Activity, Layers, ChevronDown, ChevronUp, Calendar as CalendarIcon, 
  CheckCircle2, MapPin, Flag, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell,
  FunnelChart, Funnel
} from 'recharts';

// Funnel legend colors
const FUNNEL_COLORS = {
  'Joined': '#6366f1',
  'Team Formed': '#8b5cf6',
  'Building': '#ec4899',
  'Submitted': '#10b981',
};

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
  
  // New state for dynamic features
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | null>(null);
  const [selectedFunnelHackathonId, setSelectedFunnelHackathonId] = useState<string | null>(null);
  const [allHackathons, setAllHackathons] = useState<any[]>([]);
  const [allTeams, setAllTeams] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [workloadData, setWorkloadData] = useState<any[]>([]);
  const [readinessData, setReadinessData] = useState<any[]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);

  // Fetch real data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Fetch teams (which are linked to hackathons)
        const teams = await teamService.getMyTeams();
        setAllTeams(teams || []);
        
        // Fetch public hackathons to get full details
        const hackathonsRes = await publicService.getHackathons();
        const hackathons = hackathonsRes || [];
        setAllHackathons(hackathons);

        // Fetch submissions
        const submissionsRes = await submissionsService.getMySubmissions();
        const userSubmissions = submissionsRes?.submissions || [];
        setSubmissions(userSubmissions);

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
              teamId: t.id,
              status: t.hackathon_phase === 'ongoing' ? 'Live' : (t.hackathon_phase === 'registration' ? 'Registration' : 'Upcoming'),
              nextTask: t.is_verified ? 'Work on submission' : 'Complete team verification',
              deadline: hackathon?.submission_deadline ? getTimeRemaining(hackathon.submission_deadline) : '—',
              progress,
              color: 'from-indigo-600 to-purple-700',
              bgImage: hackathon?.banner_url || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000',
              startDate: hackathon?.start_date,
              submissionDeadline: hackathon?.submission_deadline,
              resultDate: hackathon?.result_date,
              isVerified: t.is_verified,
              memberCount: t.member_count || 1,
            };
          });

        setActiveHackathons(activeEvents);
        setActiveHackathonsCount(activeEvents.length);

        // Set first hackathon as selected by default
        if (activeEvents.length > 0 && !selectedHackathonId) {
          setSelectedHackathonId(activeEvents[0].id);
        }
        if (activeEvents.length > 0 && !selectedFunnelHackathonId) {
          setSelectedFunnelHackathonId(activeEvents[0].id);
        }

        // Calculate submissions progress (teams that have started or submitted)
        const totalTeams = (teams || []).length;
        const submittedCount = (teams || []).filter((t: any) => 
          t.submission_status === 'submitted' || 
          t.submission_status === 'draft' ||
          t.submission_status === 'accepted'
        ).length;
        setSubmissionProgress(totalTeams > 0 ? Math.round((submittedCount / totalTeams) * 100) : 0);

        // Calculate actions required (unverified teams, missing submissions)
        const actions = (teams || []).filter((t: any) => !t.is_verified || t.submission_status === 'no_submission').length;
        setActionsRequired(actions);

        // Find next deadline from the user's active hackathons only
        const now = new Date();
        const upcomingDeadlines = activeEvents
          .filter((h: any) => h.submissionDeadline && new Date(h.submissionDeadline) > now)
          .sort((a: any, b: any) => new Date(a.submissionDeadline).getTime() - new Date(b.submissionDeadline).getTime());

        if (upcomingDeadlines.length > 0) {
          const next = upcomingDeadlines[0];
          setNextDeadline(getTimeRemaining(next.submissionDeadline));
          setNextDeadlineEvent((next.name || next.title || 'Hackathon') + ' Submission');
        } else {
          setNextDeadline("--");
          setNextDeadlineEvent("No upcoming deadlines");
        }

        // Calculate real funnel data with raw counts for tooltip
        const joinedCount = (teams || []).length;
        const teamFormedCount = (teams || []).filter((t: any) => t.is_verified).length;
        const buildingCount = (teams || []).filter((t: any) => 
          t.submission_status === 'draft' || t.submission_status === 'submitted' || t.submission_status === 'accepted'
        ).length;
        const submittedCountFunnel = (teams || []).filter((t: any) => 
          t.submission_status === 'submitted' || t.submission_status === 'accepted'
        ).length;
        
        const maxVal = Math.max(joinedCount, 1);
        setFunnelData([
          { value: Math.round((joinedCount / maxVal) * 100), name: 'Joined', fill: '#6366f1', count: joinedCount },
          { value: Math.round((teamFormedCount / maxVal) * 100), name: 'Team Formed', fill: '#8b5cf6', count: teamFormedCount },
          { value: Math.round((buildingCount / maxVal) * 100) || (teamFormedCount > 0 ? 10 : 0), name: 'Building', fill: '#ec4899', count: buildingCount },
          { value: Math.round((submittedCountFunnel / maxVal) * 100), name: 'Submitted', fill: '#10b981', count: submittedCountFunnel },
        ]);

        // Calculate workload data based on real deadlines
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const day3 = new Date(todayStart.getTime() + 3 * 24 * 60 * 60 * 1000);
        const day7 = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);
        const day14 = new Date(todayStart.getTime() + 14 * 24 * 60 * 60 * 1000);
        const tomorrow = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        // Workload: count deadlines only for hackathons the user is part of (activeEvents)
        const todayDeadlines = activeEvents.filter((h: any) => {
          const d = new Date(h.submissionDeadline || h.submission_deadline);
          return d >= todayStart && d < tomorrow;
        }).length;
        const threeDayDeadlines = activeEvents.filter((h: any) => {
          const d = new Date(h.submissionDeadline || h.submission_deadline);
          return d >= tomorrow && d < day3;
        }).length;
        const sevenDayDeadlines = activeEvents.filter((h: any) => {
          const d = new Date(h.submissionDeadline || h.submission_deadline);
          return d >= day3 && d < day7;
        }).length;
        const fourteenDayDeadlines = activeEvents.filter((h: any) => {
          const d = new Date(h.submissionDeadline || h.submission_deadline);
          return d >= day7 && d < day14;
        }).length;

        setWorkloadData([
          { bucket: 'Today', count: todayDeadlines, urgency: 'High' },
          { bucket: '3 Days', count: threeDayDeadlines, urgency: 'High' },
          { bucket: '7 Days', count: sevenDayDeadlines, urgency: 'Medium' },
          { bucket: '14 Days', count: fourteenDayDeadlines, urgency: 'Low' },
        ]);

        // Build calendar events only from the user's active hackathons
        const events: any[] = [];
        activeEvents.forEach((h: any) => {
          if (h.startDate) {
            events.push({ date: new Date(h.startDate), title: (h.name || h.title) + ' Start', type: 'event', color: 'bg-primary', hackathonId: h.id });
          }
          if (h.submissionDeadline) {
            events.push({ date: new Date(h.submissionDeadline), title: (h.name || h.title) + ' Submission', type: 'deadline', color: 'bg-red-500', hackathonId: h.id });
          }
          if (h.resultDate || h.result_date) {
            const rd = h.resultDate || h.result_date;
            events.push({ date: new Date(rd), title: (h.name || h.title) + ' Results', type: 'results', color: 'bg-green-500', hackathonId: h.id });
          }
        });
        setCalendarEvents(events);

      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Update roadmap and readiness when selected hackathon changes
  useEffect(() => {
    if (!selectedHackathonId || allHackathons.length === 0) return;

    const hackathon = allHackathons.find((h: any) => h.id === selectedHackathonId);
    const team = activeHackathons.find((t: any) => t.id === selectedHackathonId);
    const submission = submissions.find((s: any) => s.hackathon?.id === selectedHackathonId);

    if (hackathon) {
      const hasSubmission = submission?.status === 'submitted' || submission?.status === 'draft';
      const isSubmitted = submission?.status === 'submitted';
      
      const steps = [
        { id: 1, title: 'Registration', date: formatDate(hackathon.start_date), status: 'completed' },
        { id: 2, title: 'Team Formation', date: formatDate(hackathon.start_date), status: team?.teamId ? 'completed' : 'active' },
        { id: 3, title: 'Building', date: '—', status: hasSubmission ? 'completed' : (team?.teamId ? 'active' : 'upcoming') },
        { id: 4, title: 'Submission', date: formatDate(hackathon.submission_deadline), status: isSubmitted ? 'completed' : 'upcoming' },
        { id: 5, title: 'Results', date: formatDate(hackathon.result_date), status: 'upcoming' },
      ];
      setRoadmapSteps(steps);

      // Calculate readiness data based on actual submission
      const repoScore = submission?.repo_url ? 100 : 0;
      const demoScore = submission?.demo_url ? 100 : 0;
      const descScore = submission?.description ? (submission.description.length > 100 ? 100 : 50) : 0;
      const teamScore = team?.isVerified ? 100 : (team?.teamId ? 50 : 0);
      const pitchScore = submission?.title ? 60 : 0; // Approximate pitch readiness

      setReadinessData([
        { subject: 'Repo Linked', A: repoScore, fullMark: 100 },
        { subject: 'Demo Video', A: demoScore, fullMark: 100 },
        { subject: 'Pitch Deck', A: pitchScore, fullMark: 100 },
        { subject: 'Description', A: descScore, fullMark: 100 },
        { subject: 'Team', A: teamScore, fullMark: 100 },
      ]);
    }
  }, [selectedHackathonId, allHackathons, activeHackathons, submissions]);

  // Update funnel data when selected funnel hackathon changes
  useEffect(() => {
    if (!selectedFunnelHackathonId) {
      // Show all teams data if no hackathon selected
      const joinedCount = allTeams.length;
      const teamFormedCount = allTeams.filter((t: any) => t.is_verified).length;
      const buildingCount = allTeams.filter((t: any) => t.submission_status === 'draft').length;
      const submittedCountFunnel = allTeams.filter((t: any) => t.submission_status === 'submitted').length;
      
      const maxVal = Math.max(joinedCount, 1);
      setFunnelData([
        { value: Math.round((joinedCount / maxVal) * 100), name: 'Joined', fill: '#6366f1', count: joinedCount },
        { value: Math.round((teamFormedCount / maxVal) * 100), name: 'Team Formed', fill: '#8b5cf6', count: teamFormedCount },
        { value: Math.round((buildingCount / maxVal) * 100) || (teamFormedCount > 0 ? 10 : 0), name: 'Building', fill: '#ec4899', count: buildingCount },
        { value: Math.round((submittedCountFunnel / maxVal) * 100), name: 'Submitted', fill: '#10b981', count: submittedCountFunnel },
      ]);
      return;
    }

    // Filter teams for the selected hackathon
    const filteredTeams = allTeams.filter((t: any) => 
      String(t.hackathon_id) === String(selectedFunnelHackathonId)
    );

    const joinedCount = filteredTeams.length > 0 ? 1 : 0; // User joined this hackathon
    const teamFormedCount = filteredTeams.some((t: any) => t.is_verified) ? 1 : 0;
    const buildingCount = filteredTeams.some((t: any) => t.submission_status === 'draft') ? 1 : 0;
    const submittedCountFunnel = filteredTeams.some((t: any) => t.submission_status === 'submitted') ? 1 : 0;

    // For individual hackathon, show progress as percentage of completion
    setFunnelData([
      { value: joinedCount > 0 ? 100 : 0, name: 'Joined', fill: '#6366f1', count: joinedCount },
      { value: teamFormedCount > 0 ? 85 : 0, name: 'Team Formed', fill: '#8b5cf6', count: teamFormedCount },
      { value: buildingCount > 0 ? 60 : (teamFormedCount > 0 ? 30 : 0), name: 'Building', fill: '#ec4899', count: buildingCount },
      { value: submittedCountFunnel > 0 ? 40 : 0, name: 'Submitted', fill: '#10b981', count: submittedCountFunnel },
    ]);
  }, [selectedFunnelHackathonId, allTeams]);

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days: { date: number; isCurrentMonth: boolean; fullDate: Date }[] = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: daysInPrevMonth - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, daysInPrevMonth - i)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i)
      });
    }
    
    // Next month days to fill the grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i)
      });
    }
    
    return days;
  }, [calendarMonth]);

  const monthEvents = useMemo(() => {
    return calendarEvents.filter((e: any) => {
      const eventMonth = e.date.getMonth();
      const eventYear = e.date.getFullYear();
      return eventMonth === calendarMonth.getMonth() && eventYear === calendarMonth.getFullYear();
    });
  }, [calendarEvents, calendarMonth]);

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction: number) => {
    setCalendarMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + direction);
      return newMonth;
    });
  };

  // Get readiness tip
  const getReadinessTip = () => {
    if (readinessData.length === 0) return "Select a hackathon to view readiness.";
    const lowest = readinessData.reduce((min, item) => item.A < min.A ? item : min, readinessData[0]);
    if (lowest.A < 50) return `Your ${lowest.subject.toLowerCase()} needs more work to improve score.`;
    if (lowest.A < 80) return `Consider improving your ${lowest.subject.toLowerCase()} for a better score.`;
    return "Great job! Your submission is looking ready.";
  };

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
                 <div className="text-xs lg:text-sm font-medium text-gray-500">Across {allTeams.length} team{allTeams.length !== 1 ? 's' : ''}</div>
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
                        <div className="relative">
                          <select
                            value={selectedHackathonId || ''}
                            onChange={(e) => setSelectedHackathonId(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 uppercase px-4 py-2 pr-8 rounded-lg cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                          >
                            {activeHackathons.length === 0 && (
                              <option value="">No Hackathons</option>
                            )}
                            {activeHackathons.map((h) => (
                              <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                          </select>
                          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                    
                    <div className="relative min-w-0 md:min-w-[600px]">
                        {/* Connecting Line - Background (gray) */}
                        <div className="absolute top-[14px] left-0 right-0 h-0.5 bg-gray-200 hidden md:block"></div>
                        {/* Connecting Line - Progress (blue/primary) */}
                        {(() => {
                          // Calculate progress percentage based on completed/active steps
                          const activeIndex = roadmapSteps.findIndex(s => s.status === 'active');
                          const lastCompletedIndex = roadmapSteps.reduce((acc, s, i) => s.status === 'completed' ? i : acc, -1);
                          const progressIndex = activeIndex >= 0 ? activeIndex : lastCompletedIndex;
                          const totalSteps = roadmapSteps.length;
                          // Calculate width: each step represents equal portion, go to middle of active step
                          const progressPercent = totalSteps > 1 ? ((progressIndex + 0.5) / (totalSteps - 1)) * 100 : 0;
                          return progressIndex >= 0 ? (
                            <div 
                              className="absolute top-[14px] left-0 h-0.5 bg-primary hidden md:block transition-all duration-500" 
                              style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            ></div>
                          ) : null;
                        })()}
                        
                        <div className="flex flex-col md:flex-row justify-between gap-6 relative">
                            {roadmapSteps.map((step, idx) => {
                                const isCompleted = step.status === 'completed';
                                const isActive = step.status === 'active';
                                // For mobile vertical line coloring
                                const nextStep = roadmapSteps[idx + 1];
                                const lineIsBlue = isCompleted || (isActive && nextStep?.status !== 'upcoming');
                                
                                return (
                                    <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-0 relative z-10 group">
                                        {/* Mobile Vertical Line */}
                                        {idx !== roadmapSteps.length - 1 && (
                                            <div className={`absolute left-[14px] top-8 bottom-[-24px] w-0.5 md:hidden ${isCompleted ? 'bg-primary' : 'bg-gray-200'}`}></div>
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
                        <div className="flex flex-col md:flex-row md:justify-between items-start mb-4">
                            <div>
                                <h3 className="font-heading text-lg text-gray-900">Submission Funnel</h3>
                                <p className="text-sm text-gray-500">Your progress stages</p>
                            </div>
                            <div className="relative w-full md:w-auto mt-3 md:mt-0 overflow-hidden">
                              {/* Small screen: compact select showing only an icon visually (text hidden via textIndent) */}
                              <select
                                value={selectedFunnelHackathonId || ''}
                                onChange={(e) => setSelectedFunnelHackathonId(e.target.value)}
                                title={activeHackathons.find(h => h.id === selectedFunnelHackathonId)?.name || ''}
                                className="block md:hidden w-10 h-10 appearance-none bg-gray-50 border border-gray-200 text-xs text-transparent px-2 py-2 pr-8 rounded-lg cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                                style={{ textIndent: '9999px' }}
                              >
                                {activeHackathons.length === 0 && (
                                  <option value="">No Hackathons</option>
                                )}
                                {activeHackathons.map((h) => (
                                  <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                              </select>

                              {/* Medium+ screen: full select with text */}
                              <select
                                value={selectedFunnelHackathonId || ''}
                                onChange={(e) => setSelectedFunnelHackathonId(e.target.value)}
                                className="hidden md:block w-full md:w-auto max-w-full md:max-w-[260px] appearance-none bg-gray-50 border border-gray-200 text-xs font-bold text-gray-700 uppercase px-4 py-2 pr-8 rounded-lg cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors truncate"
                              >
                                {activeHackathons.length === 0 && (
                                  <option value="">No Hackathons</option>
                                )}
                                {activeHackathons.map((h) => (
                                  <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                              </select>

                              {/* Chevron for small screens (centered) and md+ (right) */}
                              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <FunnelChart>
                                    <Tooltip 
                                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                                        itemStyle={{color: '#111827', fontWeight: 'bold'}}
                                        formatter={(value: number, name: string, props: any) => {
                                            const count = props.payload?.count ?? value;
                                            return [count, name];
                                        }}
                                    />
                                    <Funnel
                                        dataKey="value"
                                        data={funnelData}
                                        isAnimationActive
                                    >
                                    </Funnel>
                                </FunnelChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Legend below the chart */}
                        <div className="flex flex-wrap justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
                          {funnelData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.fill }}></div>
                              <span className="text-xs font-medium text-gray-600">{item.name}</span>
                            </div>
                          ))}
                        </div>
                    </div>

                    {/* Deadline Load */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <div className="mb-4 flex justify-between items-end">
                            <div>
                                <h3 className="font-heading text-lg text-gray-900">Workload</h3>
                                <p className="text-sm text-gray-500">Upcoming deadlines</p>
                            </div>
                            {workloadData.some(d => d.count > 0 && (d.urgency === 'High')) ? (
                              <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold uppercase">High Pressure</span>
                            ) : workloadData.some(d => d.count > 0) ? (
                              <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-xs font-bold uppercase">Moderate</span>
                            ) : (
                              <span className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs font-bold uppercase">Clear</span>
                            )}
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={workloadData}>
                                    <XAxis dataKey="bucket" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9CA3AF'}} />
                                    <Tooltip cursor={{fill: '#F3F4F6', radius: 4}} contentStyle={{borderRadius: '12px'}} />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {workloadData.map((entry, index) => (
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
                         <h3 className="font-heading text-lg text-gray-900">{formatMonthYear(calendarMonth)}</h3>
                         <div className="flex gap-1">
                             <button 
                               onClick={() => navigateMonth(-1)}
                               className="p-1 hover:bg-gray-100 rounded transition-colors"
                             >
                               <ChevronLeft size={16} className="text-gray-400"/>
                             </button>
                             <button 
                               onClick={() => navigateMonth(1)}
                               className="p-1 hover:bg-gray-100 rounded transition-colors"
                             >
                               <ChevronRight size={16} className="text-gray-400"/>
                             </button>
                         </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['S','M','T','W','T','F','S'].map((d, idx) => (
                            <div key={idx} className="text-xs font-bold text-gray-400">{d}</div>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                            const today = new Date();
                            const isToday = day.isCurrentMonth && 
                              day.date === today.getDate() && 
                              calendarMonth.getMonth() === today.getMonth() && 
                              calendarMonth.getFullYear() === today.getFullYear();
                            
                            const dayEvents = calendarEvents.filter((e: any) => {
                              return day.isCurrentMonth &&
                                e.date.getDate() === day.date &&
                                e.date.getMonth() === calendarMonth.getMonth() &&
                                e.date.getFullYear() === calendarMonth.getFullYear();
                            });

                            return (
                                <div 
                                    key={i} 
                                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs relative group cursor-pointer transition-colors
                                        ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-50'}
                                        ${isToday ? 'bg-primary text-white hover:bg-primary font-bold shadow-md shadow-primary/30' : ''}
                                    `}
                                >
                                    {day.date}
                                    {dayEvents.length > 0 && (
                                        <div className="flex gap-0.5 absolute bottom-1">
                                          {dayEvents.slice(0, 3).map((ev: any, idx: number) => (
                                            <div key={idx} className={`w-1 h-1 rounded-full ${ev.color} ${isToday ? 'bg-white' : ''}`}></div>
                                          ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Month events list */}
                    <div className="mt-6 space-y-3 max-h-48 overflow-y-auto">
                        {monthEvents.length === 0 ? (
                          <div className="text-center text-sm text-gray-400 py-4">
                            No events this month
                          </div>
                        ) : (
                          monthEvents
                            .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
                            .map((event: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                                <div className={`w-10 h-10 ${event.type === 'deadline' ? 'bg-red-100 text-red-500' : event.type === 'results' ? 'bg-green-100 text-green-500' : 'bg-blue-100 text-blue-500'} rounded-lg flex flex-col items-center justify-center shrink-0`}>
                                  <span className="text-[10px] font-bold uppercase">
                                    {event.date.toLocaleDateString('en-US', { month: 'short' })}
                                  </span>
                                  <span className="text-sm font-bold leading-none">{event.date.getDate()}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-bold text-gray-900 truncate">{event.title}</div>
                                  <div className="text-xs text-gray-500 capitalize">{event.type}</div>
                                </div>
                              </div>
                            ))
                        )}
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
                             <p className="text-xs text-gray-500">Submission Analysis</p>
                        </div>
                        {showAdvanced ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                    </div>
                    
                    {showAdvanced && (
                        <div className="p-6 pt-0 animate-in fade-in slide-in-from-top-4 duration-300">
                             {readinessData.length > 0 ? (
                               <>
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
                                 <p className="text-xs text-center text-gray-500 mt-2">{getReadinessTip()}</p>
                               </>
                             ) : (
                               <div className="text-center py-8 text-gray-400 text-sm">
                                 Select a hackathon to view readiness analysis.
                               </div>
                             )}
                        </div>
                    )}
                </div>

            </div>
        </div>
        
        <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} events={calendarEvents} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
