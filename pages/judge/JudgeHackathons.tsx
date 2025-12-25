import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JudgeLayout } from '../../components/JudgeLayout';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import { judgeService } from '../../services/judge.service';
import { publicService } from '../../services/public.service';
import { useToast } from '../../components/ui/ToastProvider';

interface JudgeHackathon {
    id: string;
    name: string;
    slug?: string;
    status?: string;
    submission_deadline?: string;
    start_date?: string;
    end_date?: string;
    banner_url?: string;
    assignedCount?: number;
    completedCount?: number;
}

const JudgeHackathons: React.FC = () => {
    const navigate = useNavigate();
    const [hackathons, setHackathons] = useState<JudgeHackathon[]>([]);
    const [invitations, setInvitations] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'events' | 'invitations'>('events');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { success, error: toastError, warn } = useToast();

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                if (activeTab === 'events') {
                    console.log('JudgeHackathons: calling judgeService.getEvents()');
                    const response = await judgeService.getEvents();
                    const events = response?.events || response || [];

                    // Enrich events with public hackathon details
                    const enriched = await Promise.all(
                        (Array.isArray(events) ? events : []).map(async (ev: any) => {
                            try {
                                if (!ev.id) return ev;
                                const details = await publicService.getHackathonById(ev.id);
                                const banner = details?.banner_url || details?.banner || ev.banner_url;
                                return {
                                    ...ev,
                                    banner_url: banner,
                                    name: ev.name || details?.name || ev.name,
                                    slug: ev.slug || details?.slug || ev.slug,
                                } as JudgeHackathon;
                            } catch (e) {
                                console.warn('Failed to enrich hackathon', ev.id, e);
                                return ev;
                            }
                        })
                    );
                    setHackathons(enriched);
                } else {
                    // Load invitations
                    try {
                        const inviteResponse = await judgeService.getInvitations();
                        setInvitations(inviteResponse?.invitations || inviteResponse || []);
                    } catch (e) {
                        console.warn('Failed to load invitations:', e);
                        setInvitations([]);
                    }
                }
            } catch (err: any) {
                console.error('Failed to load judge data:', err);
                setError(err?.message || 'Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [activeTab]);

    const getHackathonStatus = (status?: string) => {
        // If backend provides status, use it
        if (status) {
            const normalized = status.toLowerCase();
            if (normalized === 'active') return { label: 'ACTIVE', color: 'bg-[#24FF00] text-black' };
            if (normalized === 'upcoming') return { label: 'UPCOMING', color: 'bg-gray-800 text-white' };
            if (normalized === 'ended' || normalized === 'completed') return { label: 'ENDED', color: 'bg-gray-400 text-white' };
        }
        return { label: 'ACTIVE', color: 'bg-[#24FF00] text-black' };
    };

    const getDaysUntilDeadline = (deadline?: string): number => {
        if (!deadline) return 0;
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diff = deadlineDate.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const handleViewSubmissions = (hackathonId: string) => {
        // Store selected hackathon in localStorage for header propagation
        localStorage.setItem('selectedHackathonId', hackathonId);
        navigate('/judge/assignments');
    };

    const handleAcceptInvitation = async (invitationId: string) => {
        try {
            await judgeService.acceptInvitation(invitationId);
            // Refresh invitations list
            const inviteResponse = await judgeService.getInvitations();
            setInvitations(inviteResponse?.invitations || inviteResponse || []);
            success('Invitation accepted successfully!');
        } catch (err: any) {
            console.error('Failed to accept invitation:', err);
            toastError(err?.message || 'Failed to accept invitation');
        }
    };

    const handleRejectInvitation = async (invitationId: string) => {
        try {
            await judgeService.rejectInvitation(invitationId);
            // Refresh invitations list
            const inviteResponse = await judgeService.getInvitations();
            setInvitations(inviteResponse?.invitations || inviteResponse || []);
            success('Invitation rejected');
        } catch (err: any) {
            console.error('Failed to reject invitation:', err);
            toastError(err?.message || 'Failed to reject invitation');
        }
    };

    if (loading) {
        return (
            <JudgeLayout>
                <div className="flex items-center justify-center min-h-screen bg-[#F3F4F6] text-gray-800">
                    <div className="text-center">
                        <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-[#5425FF] border-t-transparent rounded-full"></div>
                        <p className="text-gray-600">Loading hackathons...</p>
                    </div>
                </div>
            </JudgeLayout>
        );
    }

    if (error) {
        return (
            <JudgeLayout>
                <div className="min-h-screen bg-[#F3F4F6] text-gray-800 flex items-center justify-center">
                    <div className="max-w-md w-full mx-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-[#5425FF] text-white rounded hover:bg-[#4015D1] transition-colors font-semibold"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </JudgeLayout>
        );
    }

    return (
        <JudgeLayout>
            <div className="min-h-screen bg-[#F3F4F6] text-gray-800">
                <div className="container mx-auto px-4 py-8">
                    {/* Header with Tabs */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-3xl font-bold">Hackathon Management</h1>
                            <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-200">
                                <button
                                    onClick={() => setActiveTab('events')}
                                    className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                                        activeTab === 'events'
                                            ? 'bg-[#5425FF] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <Calendar className="inline h-4 w-4 mr-2" />
                                    My Events
                                    {hackathons.length > 0 && (
                                        <span className="ml-2 bg-white text-[#5425FF] px-2 py-0.5 rounded-full text-xs">
                                            {hackathons.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('invitations')}
                                    className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                                        activeTab === 'invitations'
                                            ? 'bg-[#5425FF] text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    Invitations
                                    {invitations.length > 0 && (
                                        <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                                            {invitations.length}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-500">
                            {activeTab === 'events' 
                                ? 'View and manage hackathons you\'re judging'
                                : 'Manage your incoming invitations'
                            }
                        </p>
                    </div>

                    {/* Content based on active tab */}
                    {activeTab === 'events' ? (
                        hackathons.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                                <p className="text-gray-400">No hackathons assigned yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {hackathons.map((hackathon) => {
                                    const status = getHackathonStatus(hackathon.status);

                                    return (
                                        <div
                                            key={hackathon.id}
                                            className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-colors"
                                        >
                                            <div className="flex flex-col md:flex-row">
                                                {/* Left: Image/Banner */}
                                                <div className="md:w-1/3 h-48 md:h-auto relative">
                                                    {hackathon.banner_url ? (
                                                        <img 
                                                            src={hackathon.banner_url} 
                                                            alt={hackathon.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gradient-to-br from-[#24FF00] to-[#00A3FF]"></div>
                                                    )}
                                                    <div className="absolute top-4 left-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Right: Content */}
                                                <div className="md:w-2/3 p-6 text-gray-800">
                                                    <h2 className="text-2xl font-bold mb-4 text-gray-900">{hackathon.name}</h2>

                                                    {/* Deadline */}
                                                    {hackathon.submission_deadline && (
                                                        <div className="flex items-center text-gray-600 text-sm mb-6">
                                                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                                            <span>
                                                                Submission Deadline: {new Date(hackathon.submission_deadline).toLocaleDateString('en-US', { 
                                                                    month: 'short', 
                                                                    day: 'numeric', 
                                                                    year: 'numeric' 
                                                                })}
                                                                {getDaysUntilDeadline(hackathon.submission_deadline) > 0 && (
                                                                    <span className="ml-2 text-[#24FF00]">
                                                                        ({getDaysUntilDeadline(hackathon.submission_deadline)} days left)
                                                                    </span>
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Action Button */}
                                                    <button
                                                        onClick={() => handleViewSubmissions(hackathon.id)}
                                                        className="flex items-center px-6 py-3 bg-[#5425FF] text-white rounded-lg font-semibold hover:bg-[#4015D1] transition-colors"
                                                    >
                                                        <span>View Submissions</span>
                                                        <ChevronRight className="h-5 w-5 ml-2" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        // Invitations Tab
                        invitations.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500">No pending invitations</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {invitations.map((invite) => (
                                    <div
                                        key={invite.id}
                                        className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {invite.hackathon_name || invite.hackathon?.name || 'Hackathon Invitation'}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-4">
                                                    You've been invited to judge this event
                                                </p>
                                                <div className="text-xs text-gray-500">
                                                    Invited on: {new Date(invite.created_at || Date.now()).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleAcceptInvitation(invite.id)}
                                                    className="px-6 py-2 bg-[#24FF00] text-black rounded-lg font-semibold hover:bg-[#1ECC00] transition-colors"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRejectInvitation(invite.id)}
                                                    className="px-6 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>
        </JudgeLayout>
    );
};

export default JudgeHackathons;
