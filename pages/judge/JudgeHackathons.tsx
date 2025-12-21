import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JudgeLayout } from '../../components/JudgeLayout';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import { judgeService } from '../../services/judge.service';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'events' | 'invitations'>('events');
    const [invitations, setInvitations] = useState<any[]>([]);
    const [invLoading, setInvLoading] = useState(false);

    useEffect(() => {
        const loadHackathons = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await judgeService.getEvents();
                const events = response?.events || response || [];

                // Ensure each event has banner and description by fetching public details when missing
                const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
                const detailsPromises = (Array.isArray(events) ? events : []).map(async (e: any) => {
                    if (e.banner_url && (e.start_date || e.submission_deadline)) return e;
                    try {
                        const res = await fetch(`${base}/public/hackathons/${e.id}`);
                        if (!res.ok) return e;
                        const json = await res.json();
                        const detail = json?.hackathon || json || {};
                        return { ...e, ...detail };
                    } catch (err) {
                        return e;
                    }
                });

                const enriched = await Promise.all(detailsPromises);
                setHackathons(Array.isArray(enriched) ? enriched : enriched || []);
            } catch (err: any) {
                console.error('Failed to load judge hackathons:', err);
                setError(err?.message || 'Failed to load hackathons');
            } finally {
                setLoading(false);
            }
        };

        const loadInvitations = async () => {
            setInvLoading(true);
            try {
                // Derive invitations from assigned teams (UI-only)
                const assigned = await judgeService.getAssignedTeams(1, 200);
                const teams = assigned?.teams || [];

                // Group by hackathon
                const map = new Map<string, any[]>();
                teams.forEach((t: any) => {
                    const hid = t.hackathonId || t.hackathon_id || t.hackathon?.id || 'unknown';
                    const hname = t.hackathonName || t.hackathon?.name || null;
                    if (!map.has(hid)) map.set(hid, []);
                    map.get(hid).push({ ...t, hackathonName: hname });
                });

                const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
                const invitationsArr: any[] = [];

                for (const [hackathonId, teamList] of map.entries()) {
                    if (!hackathonId || hackathonId === 'unknown') continue;
                    // fetch public hackathon detail for banner and dates
                    let detail: any = {};
                    try {
                        const res = await fetch(`${base}/public/hackathons/${hackathonId}`);
                        if (res.ok) {
                            const json = await res.json();
                            detail = json?.hackathon || json || {};
                        }
                    } catch (err) {
                        // ignore
                    }

                    invitationsArr.push({
                        id: hackathonId,
                        name: detail.name || (teamList[0]?.hackathonName || 'Hackathon'),
                        banner_url: detail.banner_url || detail.banner || null,
                        start_date: detail.start_date || detail.start || null,
                        end_date: detail.end_date || detail.end || null,
                        submission_deadline: detail.submission_deadline || null,
                        description: detail.description || detail.summary || null,
                        invitedBy: detail.organizer || 'Organizer',
                        teams: teamList
                    });
                }

                setInvitations(invitationsArr);
            } catch (e) {
                console.warn('Failed to build invitations from assignments:', e);
                setInvitations([]);
            } finally {
                setInvLoading(false);
            }
        };

        loadHackathons();
        loadInvitations();
    }, []);

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

    if (loading) {
        return (
            <JudgeLayout>
                <div className="flex items-center justify-center min-h-screen bg-[#F3F4F6] text-gray-800">
                    <div className="text-center">
                        <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-[#24FF00] border-t-transparent rounded-full"></div>
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
                                className="px-4 py-2 bg-[#24FF00] text-black rounded hover:bg-[#20DD00] transition-colors font-semibold"
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
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">My Hackathons</h1>
                            <p className="text-gray-400">View and manage hackathons you're judging</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setActiveTab('events')}
                                className={`px-4 py-2 rounded-xl font-medium ${activeTab === 'events' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                            >
                                My Events
                            </button>
                            <button
                                onClick={() => setActiveTab('invitations')}
                                className={`px-4 py-2 rounded-xl font-medium ${activeTab === 'invitations' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
                            >
                                Invitations
                            </button>
                        </div>
                    </div>

                    {activeTab === 'events' && (
                        hackathons.length === 0 ? (
                            <div className="text-center py-12">
                                <Calendar className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                                <p className="text-gray-400">No hackathons assigned yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {hackathons.map((hackathon) => {
                                const status = getHackathonStatus(hackathon.status);
                                const assignedCount = hackathon.assignedCount ?? 0;
                                const completedCount = hackathon.completedCount ?? 0;
                                const progress = assignedCount > 0 
                                    ? Math.round((completedCount / assignedCount) * 100) 
                                    : 0;

                                return (
                                    <div
                                        key={hackathon.id}
                                        className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden hover:border-gray-700 transition-colors"
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
                                            <div className="md:w-2/3 p-6">
                                                <h2 className="text-2xl font-bold mb-4">{hackathon.name}</h2>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                                    {/* Assigned Teams */}
                                                    <div className="bg-gray-800 rounded-lg p-4">
                                                        <div className="text-gray-400 text-sm mb-1">Assigned Teams</div>
                                                        <div className="text-2xl font-bold text-white">
                                                            {assignedCount}
                                                        </div>
                                                    </div>

                                                    {/* Completed */}
                                                    <div className="bg-gray-800 rounded-lg p-4">
                                                        <div className="text-gray-400 text-sm mb-1">Completed</div>
                                                        <div className="text-2xl font-bold text-[#24FF00]">
                                                            {completedCount}
                                                        </div>
                                                    </div>

                                                    {/* Progress */}
                                                    <div className="bg-gray-800 rounded-lg p-4">
                                                        <div className="text-gray-400 text-sm mb-1">Progress</div>
                                                        <div className="text-2xl font-bold text-blue-400">
                                                            {progress}%
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Deadline */}
                                                {hackathon.submission_deadline && (
                                                    <div className="flex items-center text-gray-400 text-sm mb-6">
                                                        <Clock className="h-4 w-4 mr-2" />
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
                                                    className="flex items-center px-6 py-3 bg-[#24FF00] text-black rounded-lg font-semibold hover:bg-[#20DD00] transition-colors"
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
                    )}

                    {activeTab === 'invitations' && (
                        <div>
                            {invLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin h-8 w-8 mx-auto mb-4 border-4 border-[#5425FF] border-t-transparent rounded-full"></div>
                                    <p className="text-gray-400">Loading invitations...</p>
                                </div>
                            ) : (
                                <div>
                                    {invitations.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="text-gray-400">No invitations at the moment</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            {invitations.map((inv: any) => (
                                                <div key={inv.id} className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
                                                    <div className="flex gap-4 items-start md:items-center">
                                                        <div className="w-40 h-28 rounded overflow-hidden bg-gray-100">
                                                            {inv.banner_url ? (
                                                                <img src={inv.banner_url} alt={inv.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-gradient-to-br from-[#24FF00] to-[#00A3FF]"></div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1">
                                                            <h3 className="text-xl font-bold mb-1">{inv.name}</h3>
                                                            <div className="text-sm text-gray-500 mb-3">Invited by {inv.invitedBy || 'Organizer'}</div>
                                                            {inv.description && <p className="text-gray-500 mb-3">{inv.description}</p>}

                                                            <div className="flex items-center gap-3 mt-2">
                                                                <button onClick={() => declineInvitation(inv)} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700">Decline</button>
                                                                <button onClick={() => acceptInvitation(inv)} className="px-4 py-2 rounded-lg bg-[#24FF00] text-black font-bold">Accept Invite</button>
                                                                <button onClick={() => handleViewSubmissions(inv.id)} className="ml-auto text-sm text-[#5425FF]">View Submissions</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </JudgeLayout>
    );
};

export default JudgeHackathons;
