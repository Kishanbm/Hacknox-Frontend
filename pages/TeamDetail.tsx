import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { 
    Users, Trophy, Calendar, ChevronLeft, Settings, MessageCircle, 
    Github, Copy, CheckCircle2, MoreVertical, Crown, Shield, UserMinus,
    LogOut, Rocket
} from 'lucide-react';
import { teamService } from '../services/team.service';

const TeamDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [team, setTeam] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadTeam = async () => {
            if (!id) return;
            setIsLoading(true);
            setError(null);
            try {
                const data = await teamService.getTeamById(id);
                // Map backend response to expected UI format
                const localUser = (() => {
                    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
                })();
                
                const members = (data.members || []).map((m: any) => {
                    const user = m.user || {};
                    // supabase may return Profiles or profile depending on select alias
                    const profile = Array.isArray(user.Profiles) ? user.Profiles[0] : (Array.isArray(user.profile) ? user.profile[0] : (user.profile || user.Profiles || {}));
                    const name = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user.email || m.user_id || 'Member';
                    const avatar = profile?.avatar_url || name.split(' ').map((s:string)=>s[0]).slice(0,2).join('').toUpperCase();
                    const isLeader = data.leader_id === user.id;
                    return {
                        id: user.id || m.user_id,
                        name,
                        role: isLeader ? 'Leader' : 'Member',
                        status: 'Offline',
                        avatar,
                        title: isLeader ? 'Team Leader' : 'Member'
                    };
                });

                const userRole = members.find((m: any) => m.id === localUser?.id)?.role || 'Member';

                setTeam({
                    id: data.id,
                    name: data.name,
                    code: data.join_code || '',
                    hackathon: {
                        name: data.hackathon_title || 'Hackathon',
                        status: 'Live',
                        daysLeft: 2,
                        id: data.hackathon_id || ''
                    },
                    description: data.description || 'No description',
                    role: userRole,
                    members,
                    checklist: []
                });
            } catch (err: any) {
                console.error('Failed to load team', err);
                setError(err?.message || 'Failed to load team');
            } finally {
                setIsLoading(false);
            }
        };
        loadTeam();
    }, [id]);

    const copyCode = () => {
        if (team?.code) {
            navigator.clipboard.writeText(team.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block animate-pulse px-6 py-3 bg-gray-100 rounded-xl">Loading team...</div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !team) {
        return (
            <DashboardLayout>
                <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-500 mb-4">{error || 'Team not found'}</p>
                        <button onClick={() => navigate('/dashboard/teams')} className="px-4 py-2 bg-gray-900 text-white rounded-xl font-bold">
                            Back to Teams
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto pb-12">
                {/* Navigation */}
                <button onClick={() => navigate('/dashboard/teams')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-bold text-sm transition-colors">
                    <ChevronLeft size={20} /> Back to Teams
                </button>

                {/* Header Card */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-heading text-gray-900">{team.name}</h1>
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200">
                                    Verified
                                </span>
                            </div>
                            <p className="text-gray-500 max-w-xl">{team.description}</p>
                            
                            <div className="flex items-center gap-6 mt-6">
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Trophy size={16} className="text-amber-500" />
                                    {team.hackathon.name}
                                </div>
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Calendar size={16} className="text-primary" />
                                    {team.hackathon.daysLeft} Days Left
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <Link to={`/dashboard/submissions/s1`} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                <Rocket size={18} /> Work on Project
                            </Link>
                            <div className="flex gap-2">
                                <button className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm border border-gray-200">
                                    <MessageCircle size={16} /> Chat
                                </button>
                                <button className="flex-1 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm border border-gray-200">
                                    <Github size={16} /> Repo
                                </button>
                                {team.role === 'Leader' && (
                                    <button className="px-3 py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors border border-gray-200">
                                        <Settings size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Members */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                                <h3 className="font-heading text-lg text-gray-900 flex items-center gap-2">
                                    <Users size={20} className="text-primary"/> Squad Members
                                </h3>
                                <span className="text-xs font-bold text-gray-400 uppercase">{team.members.length} / 4 Members</span>
                            </div>
                            <div className="divide-y divide-gray-50">
                                {team.members.map(member => (
                                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 border-2 border-white shadow-sm">
                                                    {member.avatar}
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                                                    member.status === 'Online' ? 'bg-green-500' : 'bg-gray-300'
                                                }`}></div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-gray-900">{member.name}</h4>
                                                    {member.role === 'Leader' && <Crown size={14} className="text-yellow-500 fill-current" />}
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium">{member.title}</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {team.role === 'Leader' && member.role !== 'Leader' && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                    <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove Member">
                                                        <UserMinus size={18} />
                                                    </button>
                                                </div>
                                            )}
                                            <Link to={`/dashboard/user/${member.id}`} className="p-2 text-gray-400 hover:text-primary transition-colors">
                                                <MoreVertical size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {team.members.length < 4 && team.role === 'Leader' && (
                                <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                                    <p className="text-sm text-gray-500 mb-3">Looking for more talent?</p>
                                    <button 
                                        onClick={copyCode}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:text-primary hover:border-primary transition-all shadow-sm"
                                    >
                                        {copied ? <CheckCircle2 size={16} className="text-green-500"/> : <Copy size={16}/>}
                                        {copied ? 'Code Copied' : `Copy Invite Code: ${team.code}`}
                                    </button>
                                </div>
                            )}
                        </div>

                         {/* Tasks / Progress */}
                         <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <h3 className="font-heading text-lg text-gray-900 mb-6">Submission Checklist</h3>
                            <div className="space-y-4">
                                {team.checklist.map(item => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                                            item.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-200 text-transparent'
                                        }`}>
                                            <CheckCircle2 size={14} className="fill-current" />
                                        </div>
                                        <span className={`text-sm font-medium ${item.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                            {item.task}
                                        </span>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-6">
                        
                        {/* Invite Code Widget */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-lg">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield size={20} className="text-secondary" />
                                <h3 className="font-heading text-lg">Team Code</h3>
                            </div>
                            <div 
                                onClick={copyCode}
                                className="bg-white/10 border border-white/10 rounded-xl p-4 text-center cursor-pointer hover:bg-white/20 transition-colors group"
                            >
                                <div className="text-3xl font-mono font-bold tracking-widest mb-1 group-hover:scale-105 transition-transform">{team.code}</div>
                                <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                    {copied ? <CheckCircle2 size={12} className="text-green-400"/> : <Copy size={12}/>} 
                                    {copied ? 'Copied!' : 'Click to copy'}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4 text-center">Share this code with teammates to let them join instantly.</p>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                             <h4 className="font-bold text-red-700 mb-2">Danger Zone</h4>
                             {team.role === 'Leader' ? (
                                 <button className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-colors">
                                     Disband Team
                                 </button>
                             ) : (
                                 <button className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                                     <LogOut size={16} /> Leave Team
                                 </button>
                             )}
                        </div>

                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TeamDetail;