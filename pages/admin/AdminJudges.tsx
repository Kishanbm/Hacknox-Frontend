import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Mail, Plus, UserPlus, MoreVertical, ShieldOff, KeyRound, Trash2, UserCheck, X, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/admin.service';

const AdminJudges: React.FC = () => {
    const [judges, setJudges] = useState<any[]>([]);
    const [hackathons, setHackathons] = useState<any[]>([]);
    const [selectedHackathonId, setSelectedHackathonId] = useState<string | undefined>(
        localStorage.getItem('selectedHackathonId') || undefined
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Stats
    const [totalJudges, setTotalJudges] = useState<number | null>(null);
    const [activeJudges, setActiveJudges] = useState<number | null>(null);
    const [invitedJudges, setInvitedJudges] = useState<number | null>(null);
    const [assignedJudges, setAssignedJudges] = useState<number | null>(null);
    const [hackathonCount, setHackathonCount] = useState<number>(0);

    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedJudgeId, setSelectedJudgeId] = useState<string | null>(null);
    const [activeActionId, setActiveActionId] = useState<string | null>(null);

    // Create judge form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [organization, setOrganization] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const init = async () => {
            const list = await loadHackathons();
            await loadJudges(list);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedHackathonId]);

    const loadHackathons = async () => {
        try {
            const res = await adminService.getMyHackathons();
            const list = (res?.hackathons || res || []);
            setHackathons(list);
            setHackathonCount(Array.isArray(list) ? list.length : 0);
            // If a stored selected id exists but isn't part of this admin's hackathons, clear it
            const stored = localStorage.getItem('selectedHackathonId') || undefined;
            if (stored && !list.find((h: any) => h.id === stored)) {
                localStorage.removeItem('selectedHackathonId');
                setSelectedHackathonId(undefined);
            }
            return list;
        } catch (e) {
            console.error('Failed to load hackathons:', e);
            return [];
        }
    };

    const loadJudges = async (hackathonsList?: any[]) => {
        try {
            setLoading(true);
            setError(null);
            const effectiveHackathons = hackathonsList || hackathons;
            // If admin has no hackathons, show empty list to avoid returning platform-wide judges
            if (!effectiveHackathons || effectiveHackathons.length === 0) {
                setJudges([]);
                setTotalJudges(0);
                setActiveJudges(0);
                setInvitedJudges(0);
                setAssignedJudges(0);
                return;
            }

            let judgesList: any[] = [];
            if (selectedHackathonId) {
                const res = await adminService.getJudges(1, 100, selectedHackathonId);
                judgesList = res?.judges || res?.data || res || [];
            } else {
                // When "All" selected, fetch judges per-admin-hackathon and merge
                const calls = effectiveHackathons.map(h => adminService.getJudges(1, 100, h.id).catch(() => ([])));
                const results = await Promise.all(calls);
                const merged = results.flatMap(r => (r?.judges || r || []));
                // dedupe by id or email
                const map = new Map<string, any>();
                merged.forEach((j: any) => {
                    const key = j.id || j.email || JSON.stringify(j);
                    if (!map.has(key)) map.set(key, j);
                });
                judgesList = Array.from(map.values());
            }

            setJudges(Array.isArray(judgesList) ? judgesList : []);
            // compute simple stats
            const list = Array.isArray(judgesList) ? judgesList : [];
            setTotalJudges(list.length);
            setActiveJudges(list.filter((j: any) => j.is_active === true || j.email_verified === true || j.isActive === true).length);
            setInvitedJudges(list.filter((j: any) => !(j.email_verified || j.emailVerified)).length);
            // Respect backend shape differences: some responses include `assignmentLoad`, `assignments` or `teamsAssigned`.
            setAssignedJudges(list.filter((j: any) => {
                if (typeof j.assignmentLoad === 'number') return j.assignmentLoad > 0;
                if (Array.isArray(j.assignments) && j.assignments.length > 0) return true;
                if (Array.isArray(j.teamsAssigned) && j.teamsAssigned.length > 0) return true;
                return false;
            }).length);
        } catch (e: any) {
            setError(e.message || 'Failed to load judges');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJudge = async () => {
        if (!email || !firstName || !lastName) {
            setError('Email, first name, and last name are required');
            return;
        }

        setIsCreating(true);
        setError(null);
        setSuccessMessage(null);

        try {
                const res = await adminService.createJudge({ email, firstName, lastName });
                // Try to extract created judge object from response
                setSuccessMessage(`Judge ${firstName} ${lastName} created successfully!`);
                setInviteModalOpen(false);
                setFirstName('');
                setLastName('');
                setEmail('');
                setOrganization('');
                // Refresh the list from server to reflect authoritative data (matches front-end behaviour)
                await loadJudges();
        } catch (e: any) {
            setError(e.message || 'Failed to create judge');
        } finally {
            setIsCreating(false);
        }
    };

    const handleAction = async (id: string, action: 'deactivate' | 'activate' | 'reset' | 'delete-soft' | 'delete-hard') => {
        setError(null);
        setSuccessMessage(null);

        try {
            if (action === 'deactivate') {
                await adminService.updateJudge(id, { is_active: false });
                setSuccessMessage('Judge deactivated');
                await loadJudges();
            } else if (action === 'activate') {
                await adminService.updateJudge(id, { is_active: true });
                setSuccessMessage('Judge activated');
                await loadJudges();
            } else if (action === 'delete-soft' || action === 'delete-hard') {
                const kind = action === 'delete-hard' ? 'hard' : 'soft';
                if (confirm(`Are you sure you want to ${kind === 'hard' ? 'permanently delete' : 'remove'} this judge account?`)) {
                    await adminService.deleteJudge(id, kind as 'soft' | 'hard');
                    setSuccessMessage(kind === 'hard' ? 'Judge permanently deleted' : 'Judge removed');
                    await loadJudges();
                }
            } else if (action === 'reset') {
                // Trigger backend reset flow which will send the reset email
                const res = await adminService.updateJudge(id, { resetPassword: true });
                const msg = res?.message || `Password reset link sent to ${judges.find(j => j.id === id)?.email}`;
                setSuccessMessage(msg);
                await loadJudges();
            }
        } catch (e: any) {
            setError(e.message || `Failed to ${action} judge`);
        } finally {
            setActiveActionId(null);
        }
    };

    const openAssignModal = (id: string) => {
        setSelectedJudgeId(id);
        setAssignModalOpen(true);
    };

    const handleQuickAssign = async (hackathonId: string) => {
        if (!selectedJudgeId) return;

        try {
            // TODO: Implement judge-to-hackathon assignment endpoint
            setSuccessMessage('Judge assigned to hackathon');
            setAssignModalOpen(false);
            setSelectedJudgeId(null);
            await loadJudges();
        } catch (e: any) {
            setError(e.message || 'Failed to assign judge');
        }
    };

    const getJudgeName = (judge: any) => {
        const firstName = judge.first_name || judge.firstName || '';
        const lastName = judge.last_name || judge.lastName || '';
        return `${firstName} ${lastName}`.trim() || judge.email || 'Unknown';
    };

    const getJudgeStatus = (judge: any) => {
        if (judge.is_active === false || judge.isActive === false) return 'Deactivated';
        if (judge.email_verified || judge.emailVerified) return 'Active';
        // Make the reason for this state explicit in the UI
        return 'Invited (awaiting activation)';
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto relative">
                <div className="absolute inset-0 -z-10 pointer-events-none" style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                    opacity: 0.4
                }} />
                {(error || successMessage) && (
                    <div
                        className={`mb-6 px-4 py-3 rounded-xl flex items-center gap-2 border ${
                            error ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
                        }`}
                    >
                        {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                        {error || successMessage}
                    </div>
                )}

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-heading text-gray-900">Judge Identity & Access</h1>
                        <p className="text-gray-500">Onboard evaluators, manage access, and monitor availability.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                            <Calendar size={18} className="text-gray-500" />
                            <select
                                value={selectedHackathonId || ''}
                                onChange={(e) => {
                                        const v = e.target.value || undefined;
                                        setSelectedHackathonId(v);
                                        if (v) {
                                            localStorage.setItem('selectedHackathonId', v);
                                            // also set legacy key used by other frontends
                                            try { localStorage.setItem('nextor_active_hackathon_id', v); } catch (err) {}
                                        } else {
                                            localStorage.removeItem('selectedHackathonId');
                                            try { localStorage.removeItem('nextor_active_hackathon_id'); } catch (err) {}
                                        }
                                    }}
                                className="bg-transparent border-none focus:outline-none text-gray-900 font-medium cursor-pointer text-base"
                            >
                                <option value="">All Hackathons</option>
                                {hackathons.map((h: any) => (
                                    <option key={h.id} value={h.id}>
                                        {h.name || h.title || h.id}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button 
                            onClick={() => setInviteModalOpen(true)}
                            className="px-5 py-3 bg-[#5425FF] text-white rounded-xl font-bold hover:bg-[#4015D1] transition-colors flex items-center gap-3 shadow-lg shadow-[#5425FF]/20 group"
                        >
                            <UserPlus size={20} className="text-[#24FF00] group-hover:text-white transition-colors" /> Create Judge
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Judges', value: totalJudges ?? '—', valueClass: 'text-gray-900' },
                        { label: 'Active', value: activeJudges ?? '—', valueClass: 'text-green-700' },
                        { label: 'Invited', value: invitedJudges ?? '—', valueClass: 'text-amber-700' },
                        { label: 'Assigned', value: assignedJudges ?? '—', valueClass: 'text-gray-900' }
                    ].map((c, i) => (
                        <div key={i} className="relative bg-white rounded-2xl border border-gray-100 p-4 overflow-hidden">
                            {/* subtle grid background */}
                            <div className="absolute inset-0 pointer-events-none -z-10 rounded-2xl" style={{
                                backgroundImage: 'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
                                backgroundSize: '28px 28px',
                                opacity: 0.06
                            }} />
                            <div className="absolute inset-0 pointer-events-none -z-20 rounded-2xl" style={{
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -8px 24px rgba(0,0,0,0.03)'
                            }} />
                            <div className="relative">
                                <div className="text-sm text-gray-500">{c.label}</div>
                                <div className={`text-2xl font-bold ${c.valueClass}`}>{c.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5425FF] mx-auto mb-4" />
                            <p className="text-gray-500">Loading judges...</p>
                        </div>
                    ) : judges.length === 0 ? (
                        <div className="py-20 text-center text-gray-500">
                            No judges found. Create one to get started.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Identity</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Access Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Affiliation</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Active Assignments</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Lifecycle</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {judges.map(judge => {
                                        const judgeName = getJudgeName(judge);
                                        const status = getJudgeStatus(judge);
                                        const judgeEmail = judge.email || '';
                                        const assignments = judge.assignments || judge.teamsAssigned || [];

                                        return (
                                            <tr key={judge.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-600 text-lg border-2 border-white shadow-sm">
                                                            {judgeName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{judgeName}</div>
                                                            <div className="text-xs text-gray-400 font-medium">{judgeEmail}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border flex items-center gap-1.5 w-fit ${
                                                        status === 'Active' ? 'bg-[#24FF00]/10 text-green-700 border-[#24FF00]/20' : 
                                                        status === 'Deactivated' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                                    }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                                            status === 'Active' ? 'bg-[#24FF00] shadow-[0_0_5px_#24FF00] animate-pulse' : 
                                                            status === 'Deactivated' ? 'bg-red-500' : 'bg-amber-500'
                                                        }`}></div>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-700">{judge.organization || judge.company || '—'}</div>
                                                    <div className="text-xs text-gray-500">{judge.role || judge.title || '—'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-2 mb-2">
                                                        {Array.isArray(assignments) && assignments.length > 0 ? (
                                                            assignments.map((a: any, i: number) => (
                                                                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-600 font-medium">
                                                                    {a.teamName || a.name || a.title || a}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            // Fallback to showing a count when assignment names aren't available
                                                            (judge.assignmentLoad && judge.assignmentLoad > 0) ? (
                                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-600 font-medium">
                                                                    Assigned ({judge.assignmentLoad})
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic">Unassigned</span>
                                                            )
                                                        )}
                                                    </div>
                                                    {status === 'Active' && (
                                                        <button 
                                                            onClick={() => openAssignModal(judge.id)}
                                                            className="text-xs font-bold text-[#5425FF] hover:underline flex items-center gap-1"
                                                        >
                                                            <Plus size={12} /> Quick Assign
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right relative">
                                                    <button 
                                                        onClick={() => setActiveActionId(activeActionId === judge.id ? null : judge.id)}
                                                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    
                                                    {/* Action Menu */}
                                                    {activeActionId === judge.id && (
                                                        <div className="absolute right-12 top-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-10 py-1 animate-in fade-in zoom-in-95 duration-200">
                                                            <button 
                                                                onClick={() => handleAction(judge.id, 'reset')}
                                                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <KeyRound size={16} /> Reset Password
                                                            </button>
                                                            {status === 'Active' ? (
                                                                <button 
                                                                    onClick={() => handleAction(judge.id, 'deactivate')}
                                                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                                                                >
                                                                    <ShieldOff size={16} /> Deactivate
                                                                </button>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => handleAction(judge.id, 'activate')}
                                                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-green-600 hover:bg-green-50 flex items-center gap-2"
                                                                >
                                                                    <UserCheck size={16} /> Reactivate
                                                                </button>
                                                            )}
                                                            <div className="h-px bg-gray-100 my-1"></div>
                                                            <button 
                                                                onClick={() => handleAction(judge.id, 'delete-soft')}
                                                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 size={16} /> Remove (Soft)
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAction(judge.id, 'delete-hard')}
                                                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 rounded-b-xl"
                                                            >
                                                                <Trash2 size={16} /> Delete Permanently
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Invite Modal */}
                {isInviteModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Initialize Judge Account</h2>
                            <p className="text-gray-500 mb-6 text-sm">Create a new evaluator identity. They will receive an email to set their password.</p>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                                    <input 
                                        type="text" 
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] text-sm" 
                                        placeholder="e.g. Jane" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                                    <input 
                                        type="text" 
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] text-sm" 
                                        placeholder="e.g. Doe" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address (Identity)</label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] text-sm" 
                                        placeholder="jane@example.com" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Organization (Optional)</label>
                                    <input 
                                        type="text" 
                                        value={organization}
                                        onChange={(e) => setOrganization(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] text-sm" 
                                        placeholder="e.g. OpenAI" 
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={() => {
                                        setInviteModalOpen(false);
                                        setFirstName('');
                                        setLastName('');
                                        setEmail('');
                                        setOrganization('');
                                    }}
                                    disabled={isCreating}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleCreateJudge}
                                    disabled={isCreating || !email || !firstName || !lastName}
                                    className="flex-1 py-3 bg-[#5425FF] text-white rounded-xl font-bold hover:bg-[#4015D1] transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreating ? (
                                        <>Creating...</>
                                    ) : (
                                        <><Mail size={18} className="text-[#24FF00] group-hover:text-white" /> Send Invite</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Assign Modal */}
                {isAssignModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Quick Assign Judge</h2>
                                <button onClick={() => setAssignModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>
                            <p className="text-gray-500 mb-6 text-sm">Add {judges.find(j => j.id === selectedJudgeId) && getJudgeName(judges.find(j => j.id === selectedJudgeId)!)} to a hackathon event. This grants them access to the event dashboard.</p>
                            
                            <div className="space-y-3">
                                {hackathons.length === 0 ? (
                                    <p className="text-sm text-gray-400 text-center py-4">No hackathons available</p>
                                ) : (
                                    hackathons.map(h => (
                                        <button 
                                            key={h.id}
                                            onClick={() => handleQuickAssign(h.id)}
                                            className="w-full text-left px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-700 hover:border-[#5425FF] hover:text-[#5425FF] hover:bg-[#5425FF]/5 transition-all flex justify-between items-center"
                                        >
                                            {h.name || h.title || h.id}
                                            <Plus size={16} />
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminJudges;