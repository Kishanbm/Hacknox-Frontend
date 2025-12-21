import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import submissionsService from '../services/submissions.service';
import { 
  Calendar, MapPin, Users, Trophy, ChevronLeft, Share2, 
  ExternalLink, Globe, MessageCircle, Clock, CheckCircle2, AlertCircle 
} from 'lucide-react';

const HackathonDetail: React.FC = () => {
  const { id } = useParams();
    console.debug('HackathonDetail render attempt for id:', id);
    const [activeTab, setActiveTab] = useState('Overview');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [event, setEvent] = useState<any | null>(null);
    const [isRegistered, setIsRegistered] = useState(false);
    const [userTeamName, setUserTeamName] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!id) return;
            setIsLoading(true);
            setError(null);
            try {
                console.debug('Fetching hackathon detail for id:', id);
                const data = await (await import('../services/public.service')).publicService.getHackathonById(id);
                setEvent(data || null);
            } catch (e: any) {
                console.error('Failed to fetch hackathon detail', e);
                setError(e?.message || 'Failed to load hackathon');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    // after we have hackathon data, check authenticated user's submissions to determine registration
    useEffect(() => {
        const checkRegistration = async () => {
            if (!event || !event.id) return;
            try {
                const res = await submissionsService.getMySubmissions();
                if (res && Array.isArray(res.submissions)) {
                    const found = res.submissions.find(s => (s.hackathon && (s.hackathon.id === event.id || s.hackathon.id === event.hackathon_id)));
                    if (found) {
                        setIsRegistered(true);
                        setUserTeamName(found.team?.name || null);
                    } else {
                        setIsRegistered(false);
                        setUserTeamName(null);
                    }
                }
            } catch (err) {
                // ignore errors (not authenticated or API error)
                console.debug('Could not check registration status', err);
            }
        };
        checkRegistration();
    }, [event]);

    // show loading / error / not-found states to avoid dereferencing null
    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="max-w-7xl mx-auto pb-12">
                    <div className="py-24 text-center text-gray-500">Loading hackathon details...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="max-w-7xl mx-auto pb-12">
                    <div className="py-24 text-center text-red-600">{error}</div>
                </div>
            </DashboardLayout>
        );
    }

    if (!event) {
        return (
            <DashboardLayout>
                <div className="max-w-7xl mx-auto pb-12">
                    <div className="py-24 text-center text-gray-500">Hackathon not found.</div>
                </div>
            </DashboardLayout>
        );
    }

    // compute banner style: prefer a banner image URL, then gradient, otherwise a neutral background
    const bannerStyle: React.CSSProperties | undefined = event.banner_url ? {
        backgroundImage: `url(${(event.banner_url || '').startsWith('http') ? event.banner_url : '/uploads/' + event.banner_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    } : undefined;

    const bannerClass = event.banner_gradient ? `bg-gradient-to-r ${event.banner_gradient}` : 'bg-gray-100';

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto pb-12">
        {/* Breadcrumb / Back */}
        <div className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-900 transition-colors w-fit">
            <Link to="/dashboard/hackathons" className="flex items-center gap-2">
                <ChevronLeft size={20} /> <span className="font-bold text-sm">Back to Hackathons</span>
            </Link>
        </div>

        {/* Hero Header */}
        <div className="relative rounded-3xl overflow-hidden bg-white shadow-sm border border-gray-100 mb-8">
            <div className={`h-48 md:h-64 ${bannerClass} relative`} style={bannerStyle}>
                <div className="absolute top-4 right-4 flex gap-2">
                    <button className="bg-white/10 backdrop-blur-md text-white p-2 rounded-lg hover:bg-white/20 transition-colors">
                        <Share2 size={20} />
                    </button>
                    <button className="bg-white/10 backdrop-blur-md text-white p-2 rounded-lg hover:bg-white/20 transition-colors">
                        <Globe size={20} />
                    </button>
                </div>
            </div>
            
            <div className="px-6 md:px-10 pb-8 relative">
                {/* Logo Overlap */}
                                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg border border-gray-100 absolute -top-12 flex items-center justify-center">
                                        { event?.organizer_logo ? (
                                            <img src={event.organizer_logo} alt={event.organizer_name || 'Org'} className="w-14 h-14 object-cover rounded-lg" />
                                        ) : (
                                            <span className="font-heading text-2xl text-primary">{(event?.organizer_name || 'SC').substring(0,2).toUpperCase()}</span>
                                        ) }
                                </div>

                <div className="pt-16 flex flex-col md:flex-row justify-between items-start gap-6">
                    <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                        <h1 className="text-3xl md:text-4xl font-heading text-gray-900">{event?.name || ''}</h1>
                                                        { event?.status && (
                                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200">
                                                                    {event.status}
                                                            </span>
                                                        ) }
                                                </div>
                                                <p className="text-lg text-gray-600 mb-4">{event?.tagline || event?.description?.slice?.(0,120) || ''}</p>
                        
                                                <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500">
                                                         { (event?.start_date && event?.end_date) && (
                                                             <span className="flex items-center gap-1.5"><Calendar size={16} className="text-primary"/> {new Date(event.start_date).toLocaleDateString()}</span>
                                                         ) }
                                                         { event?.location && (
                                                             <span className="flex items-center gap-1.5"><MapPin size={16} className="text-primary"/> {event.location}</span>
                                                         ) }
                                                         { event?.mode && (
                                                             <span className="flex items-center gap-1.5"><Users size={16} className="text-primary"/> {event.mode}</span>
                                                         ) }
                                                </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col gap-3">
                        { (isRegistered || (event.userStatus || event.user_status || (event.current_user && event.current_user.registered))) ? (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 min-w-[250px]">
                                <div className="flex items-center gap-2 font-bold text-green-700 mb-1">
                                    <CheckCircle2 size={20} /> Registered
                                </div>
                                <p className="text-xs text-green-600 mb-3">You are part of team "{userTeamName || event.userTeamName || event.team?.name || event.current_user?.team_name || 'your team'}"</p>
                                <Link to={`/dashboard/submissions?hackathon=${event.id || event._id || event.hackathon_id}`}
                                    className="w-full block text-center bg-white border border-green-200 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">
                                    Manage Submission
                                </Link>
                            </div>
                        ) : (
                            <Link to={`/dashboard/teams?hackathon=${event.id || event._id || event.hackathon_id}`}
                                  className="block text-center bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all">
                                Register Now
                            </Link>
                        )}
                        <button className="flex items-center justify-center gap-2 text-gray-600 bg-gray-50 hover:bg-gray-100 py-2.5 rounded-xl font-bold text-sm transition-colors">
                            <MessageCircle size={18} /> Join Discord
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                 <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                    {['Overview', 'Themes', 'Schedule', 'Rules'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
                                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                 </div>

                 <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm min-h-[300px]">
                     {activeTab === 'Overview' && (
                         <div className="prose prose-purple max-w-none">
                             <h3 className="font-heading text-lg mb-4">About the Event</h3>
                             <p className="whitespace-pre-line text-gray-600 leading-relaxed mb-8">{event.description || 'No description provided.'}</p>
                             
                             <h3 className="font-heading text-lg mb-4 flex items-center gap-2"><Trophy size={20} className="text-amber-500"/> Prizes</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(Array.isArray(event.prizes) && event.prizes.length > 0) ? (
                                  event.prizes.map((prize: any, idx: number) => (
                                    <div key={idx} className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                                        <div className="text-amber-800 font-bold text-lg">{prize.value}</div>
                                        <div className="font-bold text-gray-900">{prize.title}</div>
                                        <div className="text-xs text-amber-700">{prize.desc}</div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-4 text-sm text-gray-500">No prizes listed for this event.</div>
                                )}
                             </div>
                         </div>
                     )}
                     {activeTab === 'Schedule' && (
                         <div className="space-y-6">
                             { (Array.isArray(event.schedule) ? event.schedule : []).map((item: any, idx: number, arr: any[]) => (
                                 <div key={idx} className="flex gap-4">
                                     <div className="flex flex-col items-center">
                                         <div className="w-3 h-3 bg-primary rounded-full"></div>
                                         {idx !== (arr.length - 1) && <div className="w-0.5 flex-1 bg-gray-200 my-1"></div>}
                                     </div>
                                     <div>
                                         <div className="text-sm font-bold text-primary mb-1">{item.time}</div>
                                         <div className="font-bold text-gray-900">{item.title}</div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     )}
                     {activeTab === 'Themes' && (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {['High-Performance Computing', 'AI Acceleration', 'Distributed Systems', 'Open Innovation'].map((t, i) => (
                                 <div key={i} className="p-4 border border-gray-200 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-colors">
                                     <div className="font-bold text-gray-900">{t}</div>
                                     <p className="text-sm text-gray-500 mt-1">Build solutions that scale.</p>
                                 </div>
                             ))}
                         </div>
                     )}
                      {activeTab === 'Rules' && (
                         <div className="space-y-4 text-gray-600">
                             <p>1. Team size must be between 2 to 4 members.</p>
                             <p>2. All code must be written during the hackathon.</p>
                             <p>3. Use of open source libraries is allowed and encouraged.</p>
                             <div className="p-4 bg-gray-50 rounded-xl border-l-4 border-primary">
                                 <strong>Submission Requirement:</strong> A GitHub repository link and a 2-minute video demo are mandatory.
                             </div>
                         </div>
                     )}
                 </div>
            </div>

            {/* Sidebar Stats */}
            <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-4">Event Stats</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Registrations</span>
                            <span className="font-bold text-gray-900">1,240</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Teams Formed</span>
                            <span className="font-bold text-gray-900">312</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 text-sm">Acceptance Rate</span>
                            <span className="font-bold text-gray-900">45%</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
                             <div className="bg-green-500 h-1.5 rounded-full" style={{width: '65%'}}></div>
                        </div>
                        <div className="text-xs text-center text-gray-400">Registration closes in 5 days</div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                             <h4 className="font-heading text-lg mb-2 text-secondary">Organizer</h4>
                             <div className="flex items-center gap-3 mb-4">
                                 <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-primary font-bold">{(event.organizer_name || '').substring(0,2).toUpperCase() || 'Org'}</div>
                                 <div>
                                     <div className="font-bold">{event.organizer_name || 'Organizer'}</div>
                                     {event.organizer_handle && <div className="text-xs text-gray-400">{event.organizer_handle}</div>}
                                 </div>
                             </div>
                             { (event.organizer_id || event.organizerId) ? (
                               <Link 
                                  to={`/dashboard/organizer/${event.organizer_id || event.organizerId}`}
                                  className="block w-full text-center py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold transition-colors"
                               >
                                   View Profile
                               </Link>
                             ) : (
                               <div className="block w-full text-center py-2 bg-gray-50 text-gray-500 rounded-xl text-sm">Organizer profile unavailable</div>
                             )}
                        </div>
                </div>
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HackathonDetail;