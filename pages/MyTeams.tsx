import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { 
  Users, MoreVertical, Plus, MessageCircle, Settings, 
  Check, Clock, Trophy, Archive, Hash, ArrowUpRight
} from 'lucide-react';
import { ParticipantTeam } from '../types';
import { teamService } from '../services/team.service';

// Local UI types
interface TeamInvite {
  id: string;
  teamName: string;
  hackathonName: string;
  inviterName: string;
  inviterAvatar?: string;
  role: string;
  sentAt: string;
}

interface PastTeam {
  id: string;
  name: string;
  hackathonName: string;
  date: string;
  role: string;
  membersCount: number;
  achievement?: string;
}

type Tab = 'active' | 'invites' | 'history';

const MyTeams: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [activeTeams, setActiveTeams] = useState<ParticipantTeam[]>([]);
  const [pastTeams, setPastTeams] = useState<PastTeam[]>([]);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [teams, invitations] = await Promise.all([
          teamService.getMyTeams(),
          teamService.getInvitations(),
        ]);

        if (!mounted) return;

        // determine local user id if present
        const localUser = (() => {
          try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
        })();

        // Separate active vs past teams based on hackathon phase
        const allTeams = (teams || []);
        const active: ParticipantTeam[] = [];
        const past: PastTeam[] = [];

        allTeams.forEach((t: any) => {
          const members = (t.members || []).map((m: any) => {
            const user = m.user || {};
            const profile = Array.isArray(user.profile) ? user.profile[0] : user.profile;
            const name = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}`.trim() : (user.email || m.user_id || 'Member');
            const avatar = profile?.avatar_url ? '' : (name.split(' ').map((s:string)=>s[0]).slice(0,2).join(''));
            return {
              id: user.id || m.user_id,
              name,
              role: (m.role === 'leader' || t.leader_id === (user.id || m.user_id)) ? 'Leader' : 'Member',
              avatar,
              status: 'Offline'
            };
          });

          const currentMember = (t.members || []).find((m: any) => (m.user && localUser && m.user.id === localUser.id) || m.user_id === localUser?.id);
          const role: 'Leader' | 'Member' = (t.leader_id === localUser?.id) ? 'Leader' : 'Member';
          const hackathonPhase = t.hackathon_phase || 'ongoing';

          // Check if hackathon is completed (past)
          if (hackathonPhase === 'completed') {
            past.push({
              id: t.id,
              name: t.name,
              hackathonName: t.hackathon_title || 'Hackathon',
              date: t.hackathon_end_date ? new Date(t.hackathon_end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '',
              role,
              membersCount: members.length,
              achievement: 'Participant' // Could be fetched from backend if available
            });
          } else {
            active.push({
              id: t.id,
              name: t.name,
              hackathonId: t.hackathon_id || t.hackathonId || '',
              hackathonName: t.hackathon_title || 'Hackathon',
              hackathonOrganizer: t.hackathon_organizer || undefined,
              role,
              status: t.is_verified ? 'Verified' : 'Pending',
              members,
              submissionStatus: t.submission_status || 'Not Started',
              nextTask: t.next_task || undefined,
            } as ParticipantTeam);
          }
        });

        setActiveTeams(active);
        setPastTeams(past);

        // Map invitations from normalized backend response
        const mappedInvites: TeamInvite[] = (invitations || []).map((inv: any) => ({
          id: inv.id,
          teamName: inv.team_name || inv.team?.name || 'Team',
          hackathonName: inv.hackathon_title || inv.team?.hackathon_title || 'Hackathon',
          inviterName: inv.inviter_name || 'Team Leader',
          inviterAvatar: inv.inviter_avatar || '',
          role: inv.role || 'Member',
          sentAt: inv.created_at || ''
        }));

        setInvites(mappedInvites);
      } catch (err: any) {
        console.error('Failed to load teams/invites', err);
        setError(err?.message || 'Failed to load your teams');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();
    return () => { mounted = false; };
  }, []);

  const handleInviteAction = (id: string, action: 'accept' | 'decline') => {
    setAnimatingId(id);

    (async () => {
      try {
        await teamService.respondToInvitation(id, action === 'accept' ? 'accept' : 'decline');
        setTimeout(() => {
          setInvites(prev => prev.filter(inv => inv.id !== id));
          setAnimatingId(null);
        }, 300);

        if (action === 'accept') {
          const teams = await teamService.getMyTeams();
          setActiveTeams(teams as any);
        }
      } catch (err) {
        console.error('Invitation response failed', err);
        setAnimatingId(null);
      }
    })();
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20 md:pb-0">
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-heading text-gray-900">Team Command</h1>
            <p className="text-gray-500 text-sm md:text-base">Manage squads, review invites, and access history.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button onClick={() => navigate('/dashboard/teams/join')} className="flex-1 sm:flex-none justify-center bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Hash size={20} /> Join via Code
            </button>
            <button onClick={() => navigate('/dashboard/teams/create')} className="flex-1 sm:flex-none justify-center bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
              <Plus size={20} /> Create Team
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent md:py-0">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 w-full md:w-fit overflow-x-auto no-scrollbar shadow-sm md:shadow-none">
            <button onClick={() => setActiveTab('active')} className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'active' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Users size={16} /> Active Teams
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{activeTeams.length}</span>
            </button>
            <button onClick={() => setActiveTab('invites')} className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'invites' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              <MessageCircle size={16} /> Invites
              {invites.length > 0 && (<span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>)}
            </button>
            <button onClick={() => setActiveTab('history')} className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'history' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>
              <Archive size={16} /> History
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="py-20 text-center"><div className="inline-block animate-pulse px-6 py-3 bg-gray-100 rounded-xl">Loading teams...</div></div>
          ) : error ? (
            <div className="py-20 text-center text-red-500">{error}</div>
          ) : (
            <>
              {/* ACTIVE */}
              {activeTab === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {activeTeams.map(team => (
                    <div key={team.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                      <div className="p-5 md:p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div onClick={() => navigate(`/dashboard/teams/${team.id}`)} className="cursor-pointer flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{team.name}</h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${team.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                              {team.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 font-medium flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-gray-900"><Trophy size={14} className="text-primary"/> {team.hackathonName}</div>
                            {team.hackathonOrganizer && (<div className="text-xs text-gray-400 pl-6 hidden sm:block">Hosted by {team.hackathonOrganizer}</div>)}
                          </div>
                        </div>

                        <div className="flex gap-2 self-end sm:self-start">
                          <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-bold">{team.role}</span>
                          <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={20} /></button>
                        </div>
                      </div>

                      <div className="p-5 md:p-6 flex-1">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Squad Members</h4>
                          {team.role === 'Leader' && (<button className="text-primary text-xs font-bold hover:underline flex items-center gap-1"><Plus size={12}/> Invite</button>)}
                        </div>

                        <div className="space-y-3">
                          {team.members.map(member => (
                            <Link to={`/dashboard/user/${member.id}`} key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border-2 border-white shadow-sm">{member.avatar}</div>
                                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${member.status === 'Online' ? 'bg-green-500' : member.status === 'Busy' ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-gray-900">{member.name}</div>
                                  <div className="text-xs text-gray-500">{member.role}</div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 flex gap-2 border-t border-gray-100">
                        <button className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"><MessageCircle size={16}/> <span className="hidden sm:inline">Chat</span></button>
                        <button onClick={() => navigate(`/dashboard/teams/${team.id}`)} className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"><Settings size={16}/> Manage</button>
                      </div>
                    </div>
                  ))}

                  {/* Quick Join Card */}
                  <div onClick={() => navigate('/dashboard/teams/create')} className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 md:p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer group min-h-[300px] md:min-h-[400px]">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 group-hover:bg-primary group-hover:text-white transition-colors"><Plus size={32}/></div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Create New Squad</h3>
                    <p className="text-gray-500 text-sm max-w-xs mb-6">Start a new journey in an upcoming hackathon.</p>
                    <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-primary transition-colors shadow-lg">Create Team</button>
                  </div>
                </div>
              )}

              {/* INVITES */}
              {activeTab === 'invites' && (
                <div className="max-w-3xl">
                  {invites.length > 0 ? (
                    <div className="space-y-4">
                      {invites.map(invite => (
                        <div key={invite.id} className={`bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all duration-300 relative overflow-hidden ${animatingId === invite.id ? 'opacity-0 translate-x-10 scale-95' : 'opacity-100'}`}>
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 border border-amber-100"><MessageCircle size={24}/></div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2 mb-1"><h3 className="font-bold text-gray-900 text-lg">{invite.teamName}</h3><span className="text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded">{invite.role}</span></div>
                              <p className="text-gray-600 text-sm mb-2"><span className="font-bold text-gray-900">{invite.inviterName}</span> invited you to join for <span className="text-primary font-bold">{invite.hackathonName}</span>.</p>
                              <div className="text-xs text-gray-400 font-medium flex items-center gap-1"><Clock size={12}/> {invite.sentAt}</div>
                            </div>
                          </div>
                          <div className="flex gap-3 shrink-0 w-full md:w-auto">
                            <button onClick={() => handleInviteAction(invite.id, 'decline')} className="flex-1 md:flex-none justify-center px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:text-red-500 transition-colors">Decline</button>
                            <button onClick={() => handleInviteAction(invite.id, 'accept')} className="flex-1 md:flex-none justify-center px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"><Check size={18}/> Accept</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 animate-in fade-in zoom-in-95 duration-300">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm"><MessageCircle size={32}/></div>
                      <h3 className="text-gray-900 font-bold mb-1">No Pending Invites</h3>
                      <p className="text-gray-500 text-sm">You're all caught up! Check active teams or create a new one.</p>
                    </div>
                  )}
                </div>
              )}

              {/* HISTORY */}
              {activeTab === 'history' && (
                <>
                  {pastTeams.length > 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Team Name</th>
                              <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Hackathon</th>
                              <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Date</th>
                              <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Role</th>
                              <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Result</th>
                              <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {pastTeams.map(team => (
                              <tr key={team.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="py-4 px-6 whitespace-nowrap"><div className="font-bold text-gray-900">{team.name}</div><div className="text-xs text-gray-400">{team.membersCount} Members</div></td>
                                <td className="py-4 px-6 text-sm text-gray-600 font-medium whitespace-nowrap">{team.hackathonName}</td>
                                <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">{team.date}</td>
                                <td className="py-4 px-6 whitespace-nowrap"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold border border-gray-200">{team.role}</span></td>
                                <td className="py-4 px-6 whitespace-nowrap">{team.achievement ? (<span className="text-primary font-bold text-sm">{team.achievement}</span>) : (<span className="text-gray-400 text-sm">-</span>)}</td>
                                <td className="py-4 px-6 text-right whitespace-nowrap"><button className="text-gray-400 hover:text-primary font-bold text-xs flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">View <ArrowUpRight size={14}/></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm"><Archive size={32}/></div>
                      <h3 className="text-gray-900 font-bold mb-1">No History Yet</h3>
                      <p className="text-gray-500 text-sm">Your past teams will appear here after hackathons conclude.</p>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTeams;
