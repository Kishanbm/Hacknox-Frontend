import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { 
    Users, Trophy, Calendar, ChevronLeft, Settings, MessageCircle, 
    Github, Copy, CheckCircle2, MoreVertical, Crown, Shield, UserMinus,
    LogOut, Rocket, Edit3
} from 'lucide-react';
import { teamService } from '../services/team.service';
import { useToast } from '../components/ui/ToastProvider';

const TeamDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [team, setTeam] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hackathonCompleted, setHackathonCompleted] = useState(false);

    const { error: toastError, success: toastSuccess } = useToast();

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
                    const avatarUrl = profile?.avatar_url || null;
                    const initials = name.split(' ').map((s:string)=>s[0]).slice(0,2).join('').toUpperCase();
                    const isLeader = data.leader_id === user.id;
                    return {
                        id: user.id || m.user_id,
                        name,
                        role: isLeader ? 'Leader' : 'Member',
                        status: 'Offline',
                        avatarUrl,
                        initials,
                        title: isLeader ? 'Team Leader' : 'Member'
                    };
                });

                const userRole = members.find((m: any) => m.id === localUser?.id)?.role || 'Member';
                
                // Check if hackathon is completed (results published or phase completed)
                const isCompleted = data.hackathon_phase === 'completed' || 
                                   data.leaderboard_published === true ||
                                   data.hackathon_status === 'completed' ||
                                   data.hackathon_status === 'past';
                setHackathonCompleted(isCompleted);

                // Calculate days left
                let daysLeft = 0;
                let hackathonStatus = 'Live';
                if (data.submission_deadline) {
                    const deadline = new Date(data.submission_deadline);
                    const now = new Date();
                    const diff = deadline.getTime() - now.getTime();
                    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                    if (diff < 0) hackathonStatus = 'Ended';
                }
                if (isCompleted) hackathonStatus = 'Completed';

                setTeam({
                    id: data.id,
                    name: data.name,
                    code: data.join_code || '',
                    verificationStatus: data.verification_status ?? 'pending',
                    hackathon: {
                        name: data.hackathon_title || 'Hackathon',
                        status: hackathonStatus,
                        daysLeft: daysLeft,
                        id: data.hackathon_id || ''
                    },
                    description: data.description || 'No description',
                    role: userRole,
                    members,
                    checklist: []
                });
                setEditName(data.name || '');
                setEditDescription(data.description || '');
            } catch (err: any) {
                console.error('Failed to load team', err);
                const msg = err?.message || 'Failed to load team';
                toastError(msg);
                setError(msg);
            } finally {
                setIsLoading(false);
            }
        };
        loadTeam();
        // expose reload for later actions
        (window as any).__reloadTeam = loadTeam;
    }, [id]);

    const handleRemoveMember = async (memberId: string) => {
        if (!team?.id) return;
        const ok = window.confirm('Remove this member from the team?');
        if (!ok) return;
        try {
            await teamService.removeMember(team.id, memberId);
            // reload team members
            const data = await teamService.getTeamById(team.id);
            const members = (data.members || []).map((m: any) => {
                const user = m.user || {};
                const profile = Array.isArray(user.Profiles) ? user.Profiles[0] : (Array.isArray(user.profile) ? user.profile[0] : (user.profile || user.Profiles || {}));
                const name = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user.email || m.user_id || 'Member';
                const avatarUrl = profile?.avatar_url || null;
                const initials = name.split(' ').map((s:string)=>s[0]).slice(0,2).join('').toUpperCase();
                const isLeader = data.leader_id === user.id;
                return {
                    id: user.id || m.user_id,
                    name,
                    role: isLeader ? 'Leader' : 'Member',
                    status: 'Offline',
                    avatarUrl,
                    initials,
                    title: isLeader ? 'Team Leader' : 'Member'
                };
            });
            setTeam(prev => ({ ...(prev || {}), members }));
        } catch (err: any) {
            console.error('Failed to remove member', err);
            toastError(err?.message || 'Failed to remove member');
        }
    };

    const copyCode = () => {
        if (team?.code) {
            navigator.clipboard.writeText(team.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const [isLeaving, setIsLeaving] = useState(false);
    const [isDisbanding, setIsDisbanding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);

    const handleLeaveTeam = async () => {
        if (!team?.id) return;
        const ok = window.confirm('Are you sure you want to leave this team?');
        if (!ok) return;
        try {
            setIsLeaving(true);
            await teamService.leaveTeam(team.id);
            // navigate back to teams list
            navigate('/dashboard/teams');
        } catch (err: any) {
            console.error('Failed to leave team', err);
            toastError(err?.message || 'Failed to leave team');
        } finally {
            setIsLeaving(false);
        }
    };

    const handleDisbandTeam = async () => {
        if (!team?.id) return;
        const ok = window.confirm('Disbanding will delete the team and remove all members. Continue?');
        if (!ok) return;
        try {
            setIsDisbanding(true);
            await teamService.deleteTeam(team.id);
            navigate('/dashboard/teams');
        } catch (err: any) {
            console.error('Failed to disband team', err);
            toastError(err?.message || 'Failed to disband team');
        } finally {
            setIsDisbanding(false);
        }
    };

    const handleStartEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // reset edits to current team
        setEditName(team?.name || '');
        setEditDescription(team?.description || '');
    };

    const handleSaveEdit = async () => {
        if (!team?.id) return;
            try {
            setIsSavingEdit(true);
            const resp = await teamService.updateTeamDetails({ name: editName, description: editDescription });
            const refreshed = resp?.team ? resp.team : await teamService.getTeamById(team.id);
            // update local team
            const members = (refreshed.members || []).map((m: any) => {
                const user = m.user || {};
                const profile = Array.isArray(user.Profiles) ? user.Profiles[0] : (Array.isArray(user.profile) ? user.profile[0] : (user.profile || user.Profiles || {}));
                const name = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : user.email || m.user_id || 'Member';
                const avatarUrl = profile?.avatar_url || null;
                const initials = name.split(' ').map((s:string)=>s[0]).slice(0,2).join('').toUpperCase();
                const isLeader = refreshed.leader_id === user.id;
                return {
                    id: user.id || m.user_id,
                    name,
                    role: isLeader ? 'Leader' : 'Member',
                    status: 'Offline',
                    avatarUrl,
                    initials,
                    title: isLeader ? 'Team Leader' : 'Member'
                };
            });
            setTeam(prev => ({ ...(prev || {}), name: refreshed.name, description: refreshed.description || 'No description', members }));
            setIsEditing(false);
        } catch (err: any) {
            console.error('Failed to save team edits', err);
            toastError(err?.message || 'Failed to save changes');
        } finally {
            setIsSavingEdit(false);
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
                                {isEditing ? (
                                    <div className="flex items-start gap-3 w-full">
                                        <input value={editName} onChange={e => setEditName(e.target.value)} className="text-3xl md:text-4xl font-heading text-gray-900 border border-gray-200 rounded-lg px-3 py-2 w-full" />
                                    </div>
                                ) : (
                                    <>
                                        <h1 className="text-4xl font-heading text-gray-900">{team.name}</h1>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${team.verificationStatus === 'verified' ? 'bg-green-100 text-green-700 border-green-200' : team.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                                            {team.verificationStatus === 'verified' ? 'Verified' : team.verificationStatus === 'rejected' ? 'Rejected' : 'Pending'}
                                        </span>
                                    </>
                                )}
                                {team.role === 'Leader' && !isEditing && !hackathonCompleted && (
                                    <button onClick={handleStartEdit} aria-label="Edit team" className="ml-2 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 flex items-center justify-center">
                                        <Edit3 size={16} />
                                    </button>
                                )}
                                {isEditing && (
                                    <div className="ml-4 flex items-center gap-2">
                                        <button onClick={handleSaveEdit} disabled={isSavingEdit} className="px-3 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                                            {isSavingEdit ? 'Saving...' : 'Save'}
                                        </button>
                                        <button onClick={handleCancelEdit} className="px-3 py-2 bg-white text-gray-700 rounded-xl font-bold border border-gray-200">Cancel</button>
                                    </div>
                                )}
                            </div>
                            {isEditing ? (
                                <textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} className="mt-2 text-gray-700 max-w-xl w-full border border-gray-200 rounded-lg p-3" rows={3} />
                            ) : (
                                <p className="text-gray-500 max-w-xl">{team.description}</p>
                            )}
                            
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
                            <Link to={`/dashboard/submissions?hackathon=${team.hackathon.id}&team=${team.id}`} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                                <Rocket size={18} /> Work on Project
                            </Link>
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
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 border-2 border-white shadow-sm overflow-hidden">
                                                    {member.avatarUrl ? (
                                                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="inline-block">{member.initials}</span>
                                                    )}
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
                                            {team.role === 'Leader' && member.role !== 'Leader' && !hackathonCompleted && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                                    <button onClick={() => handleRemoveMember(member.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove Member">
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
                            {team.members.length < 4 && team.role === 'Leader' && !hackathonCompleted && (
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
                            {hackathonCompleted && (
                                <div className="p-4 bg-amber-50 text-center border-t border-amber-100">
                                    <p className="text-sm text-amber-700 font-medium">This hackathon has ended. Team editing is disabled.</p>
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
                                 <button onClick={handleDisbandTeam} disabled={isDisbanding} className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isDisbanding ? 'Disbanding...' : 'Disband Team'}
                                 </button>
                             ) : (
                                 <button onClick={handleLeaveTeam} disabled={isLeaving} className="w-full py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                     <LogOut size={16} /> {isLeaving ? 'Leaving...' : 'Leave Team'}
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