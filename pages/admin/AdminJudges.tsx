import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Mail, Plus, UserPlus, MoreVertical, ShieldOff, KeyRound, Trash2, UserCheck, X, Calendar, AlertCircle, CheckCircle2, Download } from 'lucide-react';
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
    const [selectedJudgeIds, setSelectedJudgeIds] = useState<string[]>([]);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    // Export CSV state
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportHackathonId, setExportHackathonId] = useState<string>('');
    const [isExporting, setIsExporting] = useState(false);

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

    // Close action menu when clicking outside
    useEffect(() => {
        const handler = (e: any) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.action-menu') && !target.closest('.more-button')) {
                setActiveActionId(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

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
            // Invited = those who have not completed acceptance (no email_verified and no accepted invitation)
            setInvitedJudges(list.filter((j: any) => !(j.email_verified || j.emailVerified) && !(j.hasAcceptedInvitation === true || j.hasAcceptedInvitation === 'true')).length);
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

    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            let judgesToExport: any[] = [];
            if (exportHackathonId) {
                const res = await adminService.getJudges(1, 1000, exportHackathonId);
                judgesToExport = res?.judges || res?.data || res || [];
            } else {
                // Fetch from all hackathons
                const calls = hackathons.map(h => adminService.getJudges(1, 1000, h.id).catch(() => []));
                const results = await Promise.all(calls);
                const merged = results.flatMap(r => (r?.judges || r || []));
                // dedupe
                const map = new Map<string, any>();
                merged.forEach((j: any) => {
                    const key = j.id || j.email;
                    if (!map.has(key)) map.set(key, j);
                });
                judgesToExport = Array.from(map.values());
            }
            
            const headers = ['Judge ID', 'First Name', 'Last Name', 'Email', 'Status', 'Active', 'Organization'];
            const rows = judgesToExport.map((j: any) => [
                j.id || '',
                j.first_name || j.firstName || '',
                j.last_name || j.lastName || '',
                j.email || '',
                j.email_verified || j.emailVerified ? 'Active' : 'Invited',
                j.is_active !== false ? 'Yes' : 'No',
                j.organization || ''
            ]);
            
            const csvContent = "data:text/csv;charset=utf-8," 
                + headers.join(",") + "\n" 
                + rows.map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `judges_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setShowExportModal(false);
        } catch (e) {
            console.error('Export failed:', e);
        } finally {
            setIsExporting(false);
        }
    };

    const getJudgeName = (judge: any) => {
        const firstName = judge.first_name || judge.firstName || '';
        const lastName = judge.last_name || judge.lastName || '';
        return `${firstName} ${lastName}`.trim() || judge.email || 'Unknown';
    };

    const getJudgeStatus = (judge: any) => {
        if (judge.is_active === false || judge.isActive === false) return 'Deactivated';
        const accepted = judge.hasAcceptedInvitation === true || judge.hasAcceptedInvitation === 'true';
        const verified = judge.email_verified || judge.emailVerified;
        // If user is active and has accepted, show both
        if ((judge.is_active === true || judge.isActive === true) && accepted) return 'Accepted & Active';
        // If user is active (but maybe accepted via email verification) show Active
        if (judge.is_active === true || judge.isActive === true || verified) return 'Active';
        // If judge has accepted the invitation but not yet active
        if (accepted) return 'Accepted (awaiting activation)';
        // Default: invited
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
                    <div className="grid grid-cols-2 gap-3 items-center">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 w-full">
                            <Calendar size={18} className="text-gray-500" />
                            <select
                                value={selectedHackathonId || ''}
                                onChange={(e) => {
                                        const v = e.target.value || undefined;
                                        setSelectedHackathonId(v);
                                        if (v) {
                                            localStorage.setItem('selectedHackathonId', v);
                                            try { localStorage.setItem('nextor_active_hackathon_id', v); } catch (err) {}
                                        } else {
                                            localStorage.removeItem('selectedHackathonId');
                                            try { localStorage.removeItem('nextor_active_hackathon_id'); } catch (err) {}
                                        }
                                    }}
                                className="bg-transparent border-none focus:outline-none text-gray-900 font-medium cursor-pointer text-base w-full"
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
                            onClick={() => setShowExportModal(true)}
                            className="px-4 py-2.5 h-10 text-sm bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 w-full"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                        <button 
                            onClick={() => setInviteModalOpen(true)}
                            className="px-4 py-2.5 h-10 text-sm bg-[#5425FF] text-white rounded-xl font-bold hover:bg-[#4015D1] transition-colors flex items-center gap-2 shadow-lg shadow-[#5425FF]/20 group w-full"
                        >
                            <UserPlus size={16} className="text-[#24FF00] group-hover:text-white transition-colors" /> Create Judge
                        </button>
                        <button
                            onClick={() => setBulkModalOpen(true)}
                            disabled={selectedJudgeIds.length === 0}
                            className={`px-4 py-2.5 h-10 text-sm bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 w-full ${selectedJudgeIds.length===0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Actions ({selectedJudgeIds.length})
                        </button>
                    </div>
                </div>

                {/* Stats Cards (match Assignments card style) */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total Judges</div>
                        <div className="text-2xl font-heading text-gray-900">{totalJudges ?? '—'}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Active</div>
                        <div className="text-2xl font-heading text-green-600">{activeJudges ?? '—'}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Invited</div>
                        <div className="text-2xl font-heading text-amber-600">{invitedJudges ?? '—'}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Assigned</div>
                        <div className="text-2xl font-heading text-gray-900">{assignedJudges ?? '—'}</div>
                    </div>
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
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">
                                            <input
                                                type="checkbox"
                                                checked={judges.length>0 && selectedJudgeIds.length === judges.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedJudgeIds(judges.map(j => j.id));
                                                    else setSelectedJudgeIds([]);
                                                }}
                                            />
                                        </th>
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
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedJudgeIds.includes(judge.id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedJudgeIds(prev => prev.includes(judge.id) ? prev.filter(id => id !== judge.id) : [...prev, judge.id]);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </td>
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
                                                        status === 'Accepted & Active' ? 'bg-[#24FF00]/10 text-green-700 border-[#24FF00]/20' :
                                                        status === 'Active' ? 'bg-[#24FF00]/10 text-green-700 border-[#24FF00]/20' : 
                                                        status === 'Deactivated' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                                    }`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                                            status === 'Accepted & Active' ? 'bg-[#24FF00] shadow-[0_0_5px_#24FF00] animate-pulse' :
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
                                                    {(status === 'Accepted & Active' || status === 'Active') && (
                                                        <button 
                                                            onClick={() => openAssignModal(judge.id)}
                                                            className="text-sm font-bold text-[#5425FF] hover:underline flex items-center gap-2"
                                                        >
                                                            <Plus size={14} /> Quick Assign
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right relative">
                                                    <button 
                                                        onClick={() => setActiveActionId(activeActionId === judge.id ? null : judge.id)}
                                                        className="more-button p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    
                                                    {/* Action Menu */}
                                                    {activeActionId === judge.id && (
                                                        <div className="action-menu absolute right-12 top-2 w-40 sm:w-44 md:w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-10 py-1 animate-in fade-in zoom-in-95 duration-200 text-sm">
                                                            <button 
                                                                onClick={() => handleAction(judge.id, 'reset')}
                                                                className="w-full text-left px-3 py-2 font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <KeyRound size={14} /> Reset Password
                                                            </button>
                                                            {status === 'Active' ? (
                                                                <button 
                                                                    onClick={() => handleAction(judge.id, 'deactivate')}
                                                                    className="w-full text-left px-3 py-2 font-medium text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                                                                >
                                                                    <ShieldOff size={14} /> Deactivate
                                                                </button>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => handleAction(judge.id, 'activate')}
                                                                    className="w-full text-left px-3 py-2 font-medium text-green-600 hover:bg-green-50 flex items-center gap-2"
                                                                >
                                                                    <UserCheck size={14} /> Reactivate
                                                                </button>
                                                            )}
                                                            <div className="h-px bg-gray-100 my-1"></div>
                                                            <button 
                                                                onClick={() => handleAction(judge.id, 'delete-soft')}
                                                                className="w-full text-left px-3 py-2 font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 size={14} /> Remove (Soft)
                                                            </button>
                                                            <button 
                                                                onClick={() => handleAction(judge.id, 'delete-hard')}
                                                                className="w-full text-left px-3 py-2 font-medium text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 rounded-b-xl"
                                                            >
                                                                <Trash2 size={14} /> Delete Permanently
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

                {/* Bulk Actions Modal */}
                {bulkModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-heading text-xl text-gray-900">Bulk Actions for Selected Judges</h3>
                                <button onClick={() => setBulkModalOpen(false)} className="text-gray-400 hover:text-gray-900">Close</button>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 mb-4">Selected judges: {selectedJudgeIds.length}. Uncheck anyone you don't want to include below.</p>
                                <div className="max-h-64 overflow-auto border rounded p-3">
                                    {judges.filter(j => selectedJudgeIds.includes(j.id)).map(j => (
                                        <div key={j.id} className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-3">
                                                <input type="checkbox" checked={selectedJudgeIds.includes(j.id)} onChange={() => setSelectedJudgeIds(prev => prev.includes(j.id) ? prev.filter(id => id !== j.id) : [...prev, j.id])} />
                                                <div>
                                                    <div className="font-medium">{getJudgeName(j)}</div>
                                                    <div className="text-xs text-gray-500">{j.email}</div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">{getJudgeStatus(j)}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
                                    <button
                                        onClick={async () => {
                                            setBulkProcessing(true);
                                            try {
                                                await Promise.allSettled(selectedJudgeIds.map(id => adminService.updateJudge(id, { resetPassword: true })));
                                                await loadJudges();
                                                setSelectedJudgeIds([]);
                                                setBulkModalOpen(false);
                                            } catch (e) {
                                                console.error('Bulk reset failed', e);
                                            } finally { setBulkProcessing(false); }
                                        }}
                                        disabled={bulkProcessing || selectedJudgeIds.length===0}
                                        className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800 font-bold disabled:opacity-50"
                                    >
                                        {bulkProcessing ? 'Processing...' : 'Reset Password (Selected)'}
                                    </button>

                                    <button
                                        onClick={async () => {
                                            setBulkProcessing(true);
                                            try {
                                                await Promise.allSettled(selectedJudgeIds.map(id => adminService.updateJudge(id, { is_active: false })));
                                                await loadJudges();
                                                setSelectedJudgeIds([]);
                                                setBulkModalOpen(false);
                                            } catch (e) {
                                                console.error('Bulk deactivate failed', e);
                                            } finally { setBulkProcessing(false); }
                                        }}
                                        disabled={bulkProcessing || selectedJudgeIds.length===0}
                                        className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold disabled:opacity-50"
                                    >
                                        {bulkProcessing ? 'Processing...' : 'Deactivate Selected'}
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (!confirm('Remove selected judges (soft delete)? This will disable their accounts.')) return;
                                            setBulkProcessing(true);
                                            try {
                                                await Promise.allSettled(selectedJudgeIds.map(id => adminService.deleteJudge(id, 'soft')));
                                                await loadJudges();
                                                setSelectedJudgeIds([]);
                                                setBulkModalOpen(false);
                                            } catch (e) {
                                                console.error('Bulk remove failed', e);
                                            } finally { setBulkProcessing(false); }
                                        }}
                                        disabled={bulkProcessing || selectedJudgeIds.length===0}
                                        className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold disabled:opacity-50"
                                    >
                                        {bulkProcessing ? 'Processing...' : 'Remove (Soft) Selected'}
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (!confirm('Permanently delete selected judges? This cannot be undone.')) return;
                                            setBulkProcessing(true);
                                            try {
                                                await Promise.allSettled(selectedJudgeIds.map(id => adminService.deleteJudge(id, 'hard')));
                                                await loadJudges();
                                                setSelectedJudgeIds([]);
                                                setBulkModalOpen(false);
                                            } catch (e) {
                                                console.error('Bulk delete failed', e);
                                            } finally { setBulkProcessing(false); }
                                        }}
                                        disabled={bulkProcessing || selectedJudgeIds.length===0}
                                        className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold disabled:opacity-50"
                                    >
                                        {bulkProcessing ? 'Processing...' : 'Delete Permanently (Selected)'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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

                {/* Export CSV Modal */}
                {showExportModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-heading text-xl text-gray-900 flex items-center gap-2">
                                    <Download size={20} /> Export Judges
                                </h3>
                                <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-900">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Hackathon</label>
                                    <select
                                        value={exportHackathonId}
                                        onChange={(e) => setExportHackathonId(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    >
                                        <option value="">All Hackathons</option>
                                        {hackathons.map((h: any) => (
                                            <option key={h.id} value={h.id}>{h.name || h.title || h.id}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleExportCSV}
                                    disabled={isExporting}
                                    className="w-full px-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isExporting ? (
                                        <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Exporting...</>
                                    ) : (
                                        <><Download size={18} /> Download CSV</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminJudges;