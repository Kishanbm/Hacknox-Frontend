import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { ENDPOINTS } from '../config/endpoints';
import { 
  Users, MoreVertical, Plus, MessageCircle, Github, LogOut, Settings, 
  Check, X, Clock, Trophy, Archive, Hash, ArrowUpRight
} from 'lucide-react';
import { ParticipantTeam } from '../types';

// Extended Types for this page
interface TeamInvite {
  id: string;
  teamName: string;
  hackathonName: string;
  inviterName: string;
  inviterAvatar: string;
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

// Mock Data
const activeTeams: ParticipantTeam[] = [
    {
      id: 't1',
      name: 'Alpha Squad',
      hackathonId: 'h1',
      hackathonName: 'HackOnX 2025',
      hackathonOrganizer: 'SuperCompute India',
      role: 'Leader',
      status: 'Verified',
      submissionStatus: 'Draft',
      nextTask: 'Finalize Pitch Deck',
      members: [
        { id: 'm1', name: "Alex Morgan", role: "Leader", status: "Online", avatar: "AM" },
        { id: 'm2', name: "Sarah Chen", role: "Member", status: "Online", avatar: "SC" },
        { id: 'm3', name: "Mike Ross", role: "Member", status: "Offline", avatar: "MR" },
        { id: 'm4', name: "Jessica Su", role: "Member", status: "Busy", avatar: "JS" },
      ]
    },
    {
      id: 't2',
      name: 'PixelPioneers',
      hackathonId: 'h2',
      hackathonName: 'Global AI Challenge',
      hackathonOrganizer: 'Google Devs',
      role: 'Member',
      status: 'Pending',
      submissionStatus: 'Not Started',
      nextTask: 'Join Discord Channel',
      members: [
        { id: 'm5', name: "David Kim", role: "Leader", status: "Online", avatar: "DK" },
        { id: 'm1', name: "Alex Morgan", role: "Member", status: "Online", avatar: "AM" },
      ]
    }
];

const initialInvites: TeamInvite[] = [
    {
        id: 'i1',
        teamName: 'Quantum Leapers',
        hackathonName: 'HackOnX 2025',
        inviterName: 'Priya Patel',
        inviterAvatar: 'PP',
        role: 'Backend Developer',
        sentAt: '2 hours ago'
    },
    {
        id: 'i2',
        teamName: 'Beta Builders',
        hackathonName: 'Sustainable Future',
        inviterName: 'John Doe',
        inviterAvatar: 'JD',
        role: 'Frontend Dev',
        sentAt: '1 day ago'
    }
];

const pastTeams: PastTeam[] = [
    {
        id: 'p1',
        name: 'BlockBusters',
        hackathonName: 'Defi Summer 2024',
        date: 'June 2024',
        role: 'Leader',
        membersCount: 4,
        achievement: '🥈 2nd Place'
    },
    {
        id: 'p2',
        name: 'GreenGen',
        hackathonName: 'EcoHack 2023',
        date: 'Nov 2023',
        role: 'Member',
        membersCount: 3,
        achievement: 'Finalist'
    },
    {
        id: 'p3',
        name: 'SoloBuilders',
        hackathonName: 'Speed Hack v1',
        date: 'Aug 2023',
        role: 'Leader',
        membersCount: 1,
        achievement: 'Participant'
    }
];

type Tab = 'active' | 'invites' | 'history';

const MyTeams: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [invites, setInvites] = useState<TeamInvite[]>(initialInvites);
  const [animatingId, setAnimatingId] = useState<string | null>(null); // For removal animation
  const navigate = useNavigate();

  // 🔗 API INTEGRATION POINT
  useEffect(() => {
      // LINK: Fetch My Teams and Invites
      // fetch(ENDPOINTS.TEAMS.LIST)
      // fetch(ENDPOINTS.TEAMS.INVITES)
  }, []);

  const handleInviteAction = (id: string, action: 'accept' | 'decline') => {
      setAnimatingId(id);
      
      // 🔗 API INTEGRATION POINT
      // fetch(ENDPOINTS.TEAMS.RESPOND_INVITE(id), { method: 'POST', body: JSON.stringify({ action }) })

      setTimeout(() => {
          setInvites(prev => prev.filter(inv => inv.id !== id));
          setAnimatingId(null);
          // If accepted, typically you'd fetch activeTeams again or add to state, 
          // but for mock we just remove from invites.
      }, 400); // Wait for animation
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
                 <button 
                    onClick={() => navigate('/dashboard/teams/join')}
                    className="flex-1 sm:flex-none justify-center bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center gap-2"
                 >
                    <Hash size={20} /> Join via Code
                </button>
                <button 
                    onClick={() => navigate('/dashboard/teams/create')}
                    className="flex-1 sm:flex-none justify-center bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus size={20} /> Create Team
                </button>
            </div>
        </div>

        {/* Tab Navigation - Scrollable on mobile */}
        <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 md:mx-0 md:px-0 md:static md:bg-transparent md:py-0">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 w-full md:w-fit overflow-x-auto no-scrollbar shadow-sm md:shadow-none">
                <button 
                    onClick={() => setActiveTab('active')}
                    className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'active' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <Users size={16} /> Active Teams
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>{activeTeams.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('invites')}
                    className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'invites' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <MessageCircle size={16} /> Invites
                    {invites.length > 0 && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                        activeTab === 'history' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    <Archive size={16} /> History
                </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
            
            {/* ACTIVE TEAMS VIEW */}
            {activeTab === 'active' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {activeTeams.map((team) => (
                        <div key={team.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                            {/* Header */}
                            <div className="p-5 md:p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div onClick={() => navigate(`/dashboard/teams/${team.id}`)} className="cursor-pointer flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{team.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                            team.status === 'Verified' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                        }`}>
                                            {team.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium flex flex-col gap-1">
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <Trophy size={14} className="text-primary"/> {team.hackathonName}
                                        </div>
                                        {team.hackathonOrganizer && (
                                            <div className="text-xs text-gray-400 pl-6 hidden sm:block">
                                                Hosted by {team.hackathonOrganizer}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 self-end sm:self-start">
                                     <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs font-bold">{team.role}</span>
                                     <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Members Grid */}
                            <div className="p-5 md:p-6 flex-1">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Squad Members</h4>
                                    {team.role === 'Leader' && (
                                        <button className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                                            <Plus size={12} /> Invite
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    {team.members.map(member => (
                                        <Link to={`/dashboard/user/${member.id}`} key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 border-2 border-white shadow-sm">
                                                        {member.avatar}
                                                    </div>
                                                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                                        member.status === 'Online' ? 'bg-green-500' : member.status === 'Busy' ? 'bg-red-500' : 'bg-gray-300'
                                                    }`}></div>
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

                            {/* Action Footer */}
                            <div className="p-4 bg-gray-50 flex gap-2 border-t border-gray-100">
                                <button className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2">
                                    <MessageCircle size={16} /> <span className="hidden sm:inline">Chat</span>
                                </button>
                                <button 
                                    onClick={() => navigate(`/dashboard/teams/${team.id}`)}
                                    className="flex-1 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2"
                                >
                                    <Settings size={16} /> Manage
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Quick Join Card */}
                    <div 
                        onClick={() => navigate('/dashboard/teams/create')}
                        className="border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 md:p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer group min-h-[300px] md:min-h-[400px]"
                    >
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                            <Plus size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Create New Squad</h3>
                        <p className="text-gray-500 text-sm max-w-xs mb-6">Start a new journey in an upcoming hackathon.</p>
                        <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-primary transition-colors shadow-lg">
                            Create Team
                        </button>
                    </div>
                </div>
            )}

            {/* INVITES VIEW */}
            {activeTab === 'invites' && (
                <div className="max-w-3xl">
                    {invites.length > 0 ? (
                        <div className="space-y-4">
                            {invites.map(invite => (
                                <div 
                                    key={invite.id} 
                                    className={`bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-all duration-300 relative overflow-hidden ${
                                        animatingId === invite.id ? 'opacity-0 translate-x-10 scale-95' : 'opacity-100'
                                    }`}
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400"></div>
                                    
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
                                            <MessageCircle size={24} />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 text-lg">{invite.teamName}</h3>
                                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded">{invite.role}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm mb-2">
                                                <span className="font-bold text-gray-900">{invite.inviterName}</span> invited you to join for <span className="text-primary font-bold">{invite.hackathonName}</span>.
                                            </p>
                                            <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                <Clock size={12} /> {invite.sentAt}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 shrink-0 w-full md:w-auto">
                                        <button 
                                            onClick={() => handleInviteAction(invite.id, 'decline')}
                                            className="flex-1 md:flex-none justify-center px-6 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:text-red-500 transition-colors"
                                        >
                                            Decline
                                        </button>
                                        <button 
                                            onClick={() => handleInviteAction(invite.id, 'accept')}
                                            className="flex-1 md:flex-none justify-center px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
                                        >
                                            <Check size={18} /> Accept
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 animate-in fade-in zoom-in-95 duration-300">
                             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm">
                                 <MessageCircle size={32} />
                             </div>
                             <h3 className="text-gray-900 font-bold mb-1">No Pending Invites</h3>
                             <p className="text-gray-500 text-sm">You're all caught up! Check active teams or create a new one.</p>
                         </div>
                    )}
                </div>
            )}

            {/* HISTORY VIEW */}
            {activeTab === 'history' && (
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
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <div className="font-bold text-gray-900">{team.name}</div>
                                            <div className="text-xs text-gray-400">{team.membersCount} Members</div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600 font-medium whitespace-nowrap">{team.hackathonName}</td>
                                        <td className="py-4 px-6 text-sm text-gray-500 whitespace-nowrap">{team.date}</td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold border border-gray-200">
                                                {team.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            {team.achievement ? (
                                                <span className="text-primary font-bold text-sm">{team.achievement}</span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <button className="text-gray-400 hover:text-primary font-bold text-xs flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                View <ArrowUpRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {pastTeams.length === 0 && (
                        <div className="p-12 text-center text-gray-500">No history found.</div>
                    )}
                </div>
            )}
            
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTeams;
