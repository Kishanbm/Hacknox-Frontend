import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JudgeLayout } from '../../components/JudgeLayout';
import { Calendar, MapPin, ChevronRight, BarChart3, Users, Clock, Mail, Check, X, Info, ExternalLink } from 'lucide-react';

// Mock Data for Assigned Hackathons
const assignedHackathons = [
    {
        id: 'h1',
        name: 'HackOnX 2025',
        role: 'Technical Judge',
        dates: 'Mar 15 - 17',
        status: 'Active',
        assignedCount: 15,
        completedCount: 8,
        deadline: '2 Days Left',
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000'
    },
    {
        id: 'h2',
        name: 'Global AI Challenge',
        role: 'Panel Judge',
        dates: 'Apr 10 - 12',
        status: 'Upcoming',
        assignedCount: 0,
        completedCount: 0,
        deadline: 'Starts in 25 days',
        image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=1000'
    },
    {
        id: 'h3',
        name: 'Sustainable Future',
        role: 'Lead Judge',
        dates: 'May 05 - 08',
        status: 'Upcoming',
        assignedCount: 5,
        completedCount: 0,
        deadline: 'Starts in 2 months',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000'
    }
];

// Mock Data for Pending Invitations
const initialInvitations = [
    {
        id: 'i1',
        hackathonId: 'h4',
        name: 'Defi Summer 2.0',
        organizer: 'Ethereum Foundation',
        role: 'Smart Contract Auditor',
        dates: 'Jun 01 - 03',
        sentAt: '2 days ago',
        description: 'A global summit for decentralized finance innovation. We need experts in Solidity and security to judge the final round.',
        image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1000'
    },
    {
        id: 'i2',
        hackathonId: 'h5',
        name: 'HealthTech 2025',
        organizer: 'MedLife Partners',
        role: 'Impact Judge',
        dates: 'Jul 15 - 18',
        sentAt: '5 hours ago',
        description: 'Focusing on AI in healthcare. Looking for judges with experience in medical data privacy and compliance.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000'
    }
];

const JudgeHackathons: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'assigned' | 'invites'>('assigned');
    const [invitations, setInvitations] = useState(initialInvitations);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleInviteAction = (id: string, action: 'accept' | 'decline') => {
        setProcessingId(id);
        // Simulate API call
        setTimeout(() => {
            setInvitations(prev => prev.filter(inv => inv.id !== id));
            setProcessingId(null);
            // In a real app, 'accept' would move it to assignedHackathons
        }, 800);
    };

    return (
        <JudgeLayout>
            <div className="max-w-7xl mx-auto pb-20 lg:pb-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hackathon Management</h1>
                        <p className="text-gray-500">Manage your judging assignments and incoming invitations.</p>
                    </div>
                    
                    {/* Tab Switcher */}
                    <div className="bg-white p-1 rounded-xl border border-gray-200 flex items-center overflow-x-auto w-full md:w-auto">
                        <button 
                            onClick={() => setActiveTab('assigned')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeTab === 'assigned' 
                                ? 'bg-gray-900 text-white shadow-md' 
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <Calendar size={16} /> My Events
                            <span className="bg-gray-800 text-white px-1.5 py-0.5 rounded text-[10px]">{assignedHackathons.length}</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('invites')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                                activeTab === 'invites' 
                                ? 'bg-gray-900 text-white shadow-md' 
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            <Mail size={16} /> Invitations
                            {invitations.length > 0 && (
                                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] animate-pulse">{invitations.length}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* --- ASSIGNED HACKATHONS TAB --- */}
                {activeTab === 'assigned' && (
                    <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {assignedHackathons.map((hackathon) => (
                            <div 
                                key={hackathon.id}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-all group"
                            >
                                {/* Image Section */}
                                <div className="w-full md:w-64 h-48 md:h-auto relative shrink-0">
                                    <img src={hackathon.image} alt={hackathon.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                            hackathon.status === 'Active' ? 'bg-[#24FF00] text-black border-[#24FF00]' : 'bg-gray-800 text-white border-gray-700'
                                        }`}>
                                            {hackathon.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl md:text-2xl font-heading text-gray-900">{hackathon.name}</h3>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded border border-gray-100 whitespace-nowrap">
                                                {hackathon.role}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                                            <span className="flex items-center gap-1.5"><Calendar size={16} /> {hackathon.dates}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={16} /> {hackathon.deadline}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                                        <div className="flex gap-8">
                                            <div>
                                                <div className="text-2xl font-bold text-gray-900">{hackathon.assignedCount}</div>
                                                <div className="text-xs text-gray-500 font-bold uppercase">Assigned</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-[#5425FF]">{hackathon.completedCount}</div>
                                                <div className="text-xs text-gray-500 font-bold uppercase">Completed</div>
                                            </div>
                                            <div className="hidden sm:block">
                                                <div className="text-2xl font-bold text-gray-400">
                                                    {hackathon.assignedCount > 0 
                                                        ? Math.round((hackathon.completedCount / hackathon.assignedCount) * 100) 
                                                        : 0}%
                                                </div>
                                                <div className="text-xs text-gray-500 font-bold uppercase">Progress</div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => navigate(`/judge/assignments`)}
                                            className="w-full sm:w-auto px-6 py-3 bg-[#5425FF] text-white rounded-xl font-bold hover:bg-[#4015D1] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#5425FF]/20"
                                        >
                                            View Submissions <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* --- PENDING INVITATIONS TAB --- */}
                {activeTab === 'invites' && (
                    <div className="grid grid-cols-1 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {invitations.length > 0 ? (
                            invitations.map((invite) => (
                                <div 
                                    key={invite.id}
                                    className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row transition-all relative ${
                                        processingId === invite.id ? 'opacity-50 pointer-events-none' : 'hover:shadow-md'
                                    }`}
                                >
                                    {/* Image Section */}
                                    <div className="w-full md:w-56 h-48 md:h-auto relative shrink-0">
                                        <img src={invite.image} alt={invite.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                                Invited
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-6 md:p-8 flex-1">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                                            <div>
                                                <h3 className="text-2xl font-heading text-gray-900 mb-1">{invite.name}</h3>
                                                <p className="text-sm font-bold text-gray-500 flex flex-wrap items-center gap-2">
                                                    Invited by <span className="text-[#5425FF]">{invite.organizer}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:block"></span>
                                                    <span className="text-gray-400 font-normal">{invite.sentAt}</span>
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap">
                                                Role: {invite.role}
                                            </div>
                                        </div>

                                        <p className="text-gray-600 text-sm leading-relaxed mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            {invite.description}
                                        </p>

                                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-4 text-sm font-bold text-gray-500 w-full md:w-auto">
                                                <span className="flex items-center gap-2"><Calendar size={16} /> {invite.dates}</span>
                                                <button 
                                                    onClick={() => navigate(`/dashboard/hackathons/${invite.hackathonId}`)}
                                                    className="flex items-center gap-1 text-gray-400 hover:text-[#5425FF] transition-colors ml-auto md:ml-0"
                                                >
                                                    <Info size={16} /> Event Details
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-3 w-full md:w-auto">
                                                <button 
                                                    onClick={() => handleInviteAction(invite.id, 'decline')}
                                                    className="flex-1 md:flex-none px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <X size={18} /> Decline
                                                </button>
                                                <button 
                                                    onClick={() => handleInviteAction(invite.id, 'accept')}
                                                    className="flex-1 md:flex-none px-6 py-2.5 bg-[#24FF00] text-black rounded-xl font-bold hover:bg-[#1fe600] transition-colors shadow-lg shadow-[#24FF00]/20 flex items-center justify-center gap-2"
                                                >
                                                    <Check size={18} /> Accept Invite
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                    <Mail size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Pending Invitations</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    You're all caught up! New invitations will appear here when organizers request your expertise.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </JudgeLayout>
    );
};

export default JudgeHackathons;