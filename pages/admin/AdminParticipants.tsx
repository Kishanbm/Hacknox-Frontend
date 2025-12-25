import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { Search, ShieldAlert, CheckCircle2, MoreHorizontal, UserX, AlertCircle, Lock, Unlock, RefreshCw, Download, X } from 'lucide-react';
import { adminService } from '../../services/admin.service';

type TeamRow = {
    id: string;
    name: string;
    leaderName?: string;
    memberCount?: number;
    verificationStatus?: string;
    dateCreated?: string;
};

const AdminParticipants: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [teams, setTeams] = useState<TeamRow[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [maxTeamSize] = useState(4);

    const [status, setStatus] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [searchInput, setSearchInput] = useState<string>('');
    const [hackathons, setHackathons] = useState<any[]>([]);
    const [selectedHackathonId, setSelectedHackathonId] = useState<string | undefined>(
        localStorage.getItem('selectedHackathonId') || undefined
    );

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    // Export CSV state
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportHackathonId, setExportHackathonId] = useState<string>('');
    const [isExporting, setIsExporting] = useState(false);
    const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [bulkProcessing, setBulkProcessing] = useState(false);

    const handleExportCSV = async () => {
        setIsExporting(true);
        try {
            // Fetch teams for the selected hackathon or all
            let teamsToExport: any[] = [];
            if (exportHackathonId) {
                const res = await adminService.getTeams(1, 1000, {}, '', exportHackathonId);
                teamsToExport = res.teams || [];
            } else {
                // Fetch from all hackathons
                const calls = hackathons.map(h => adminService.getTeams(1, 1000, {}, '', h.id).catch(() => ({ teams: [] })));
                const results = await Promise.all(calls);
                teamsToExport = results.flatMap((r: any) => r.teams || []);
            }
            
            const headers = ['Team ID', 'Team Name', 'Leader Name', 'Member Count', 'Status', 'Created Date'];
            const rows = teamsToExport.map((t: any) => [
                t.id,
                t.name || '',
                t.leaderName || '',
                t.memberCount || 0,
                t.verificationStatus || '',
                t.dateCreated ? new Date(t.dateCreated).toLocaleDateString() : ''
            ]);
            
            const csvContent = "data:text/csv;charset=utf-8," 
                + headers.join(",") + "\n" 
                + rows.map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `participants_export_${new Date().toISOString().split('T')[0]}.csv`);
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

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            // If admin has no hackathons, don't fetch global teams
            if (!hackathons || hackathons.length === 0) {
                setTeams([]);
                setTotalCount(0);
                return;
            }

            const filters = { status: status || undefined };

            // If a specific hackathon is selected, fetch via backend normally
            if (selectedHackathonId) {
                const res = await adminService.getTeams(page, limit, filters, search || undefined, selectedHackathonId);
                setTeams(res.teams || []);
                setTotalCount(res.totalCount || res.total || (res.teams ? res.teams.length : 0));
                return;
            }

            // When "All Hackathons" is selected, fetch teams for each hackathon owned by this admin
            // and merge results on the frontend to ensure we only show admin-owned teams.
            const perHackathonLimit = 1000; // fetch reasonably large set per hackathon
            const calls = hackathons.map((h) => adminService.getTeams(1, perHackathonLimit, filters, search || undefined, h.id).catch(() => ({ teams: [] })));
            const results = await Promise.all(calls);
            const combined = results.flatMap((r: any) => r.teams || []);
            // apply simple frontend pagination over combined results
            const start = (page - 1) * limit;
            const paged = combined.slice(start, start + limit);
            setTeams(paged);
            setTotalCount(combined.length);
        } catch (e: any) {
            setError(e.message || 'Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchHackathons = async () => {
            try {
                const res = await adminService.getMyHackathons();
                const list = res?.hackathons || res || [];
                setHackathons(list);

                // If a stored selected id exists but isn't part of this admin's hackathons, clear it
                const stored = localStorage.getItem('selectedHackathonId') || undefined;
                if (stored && !list.find((h: any) => h.id === stored)) {
                    localStorage.removeItem('selectedHackathonId');
                    setSelectedHackathonId(undefined);
                }
            } catch (e) {
                // ignore
            }
        };
        fetchHackathons();
    }, []);

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, status, search, selectedHackathonId, hackathons]);

    const stats = useMemo(() => {
        const total = teams.length;
        const verified = teams.filter((t) => (t.verificationStatus || '').toLowerCase() === 'verified').length;
        const pending = teams.filter((t) => (t.verificationStatus || '').toLowerCase() === 'pending').length;
        const rejected = teams.filter((t) => (t.verificationStatus || '').toLowerCase() === 'rejected' || (t.verificationStatus || '').toLowerCase() === 'revoke').length;
        return { total, verified, pending, rejected };
    }, [teams]);

    const renderStatus = (s: string) => {
        const status = s.toLowerCase();
        if (status === 'verified' || status === 'approved')
            return (
                <span className="px-2 py-1 rounded text-xs font-bold uppercase border flex w-fit items-center gap-1 bg-green-50 text-green-600 border-green-200">
                    <CheckCircle2 size={12} />
                    Verified
                </span>
            );
        if (status === 'pending')
            return (
                <span className="px-2 py-1 rounded text-xs font-bold uppercase border flex w-fit items-center gap-1 bg-amber-50 text-amber-600 border-amber-200">
                    <AlertCircle size={12} />
                    Pending
                </span>
            );
        if (status === 'rejected' || status === 'revoke')
            return (
                <span className="px-2 py-1 rounded text-xs font-bold uppercase border flex w-fit items-center gap-1 bg-red-50 text-red-600 border-red-200">
                    <UserX size={12} />
                    Rejected
                </span>
            );
        if (status === 'flagged')
            return (
                <span className="px-2 py-1 rounded text-xs font-bold uppercase border flex w-fit items-center gap-1 bg-red-50 text-red-600 border-red-200">
                    <ShieldAlert size={12} />
                    Flagged
                </span>
            );
        return (
            <span className="px-2 py-1 rounded text-xs font-bold uppercase border flex w-fit items-center gap-1 bg-gray-100 text-gray-500 border-gray-200">
                Unknown
            </span>
        );
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-heading text-gray-900">Participant Governance</h1>
                        <p className="text-gray-500">Monitor team integrity, verify eligibility, and enforce rules.</p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={selectedHackathonId || ''}
                            onChange={(e) => {
                                const v = e.target.value || undefined;
                                setSelectedHackathonId(v);
                                setPage(1);
                                if (v) localStorage.setItem('selectedHackathonId', v);
                                else localStorage.removeItem('selectedHackathonId');
                            }}
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:border-gray-900"
                        >
                            <option value="">All Hackathons</option>
                            {hackathons.map((h: any) => (
                                <option key={h.id} value={h.id}>
                                    {h.name || h.title || h.id}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                            <Download size={18} /> Export CSV
                        </button>
                        <button
                            onClick={() => setBulkModalOpen(true)}
                            disabled={selectedTeamIds.length === 0}
                            className={`px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 ${selectedTeamIds.length===0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Verify Selected ({selectedTeamIds.length})
                        </button>
                    </div>
                </div>

                {/* Top stat cards (match Assignments card style) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total Teams</div>
                        <div className="text-2xl font-heading text-gray-900">{stats.total}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Verified</div>
                        <div className="text-2xl font-heading text-green-600">{stats.verified}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Rejected</div>
                        <div className="text-2xl font-heading text-red-600">{stats.rejected}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Pending</div>
                        <div className="text-2xl font-heading text-amber-500">{stats.pending}</div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                            <h2 className="text-xl font-heading text-gray-900">Teams List</h2>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <select
                                    value={status}
                                    onChange={(e) => {
                                        setPage(1);
                                        setStatus(e.target.value);
                                    }}
                                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:border-gray-900"
                                >
                                    <option value="">All Status</option>
                                    <option value="verified">Verified</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>

                                <div className="relative flex-1 md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        value={searchInput}
                                        onChange={(e) => {
                                            setSearchInput(e.target.value);
                                            if (e.target.value === '') {
                                                setPage(1);
                                                setSearch('');
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setPage(1);
                                                setSearch(searchInput.trim());
                                            }
                                        }}
                                        placeholder="Search team..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    />
                                </div>

                                <button
                                    onClick={load}
                                    className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                >
                                    <RefreshCw size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3" />
                            <span className="text-gray-900 font-medium">Loading teams...</span>
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">
                                            <input
                                                type="checkbox"
                                                checked={teams.length>0 && selectedTeamIds.length === teams.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedTeamIds(teams.map(t => t.id));
                                                    else setSelectedTeamIds([]);
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Team Entity</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Leader</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Composition</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Integrity</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {teams.map((team) => {
                                        const members = Number(team.memberCount ?? 0);
                                        const belowMin = members < 2;
                                        const vstatus = (team.verificationStatus || '').toLowerCase();

                                        return (
                                            <tr
                                                key={team.id}
                                                onClick={() => navigate(`/admin/teams/${team.id}`)}
                                                className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                            >
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTeamIds.includes(team.id)}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedTeamIds((prev) => prev.includes(team.id) ? prev.filter(id => id !== team.id) : [...prev, team.id]);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{team.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {team.id}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{team.leaderName || '—'}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-sm font-bold ${belowMin ? 'text-red-500' : 'text-gray-700'}`}>
                                                            {members}/{maxTeamSize}
                                                        </span>
                                                    </div>
                                                    {belowMin && <span className="text-[10px] text-red-500 font-bold uppercase">Below Min Size</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {renderStatus(team.verificationStatus || 'unknown')}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {team.dateCreated ? new Date(team.dateCreated).toLocaleDateString() : '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {teams.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-10 text-center text-gray-400">
                                                No teams found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Page {page} of {totalPages} • Total {totalCount}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page <= 1}
                                            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Prev
                                        </button>
                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page >= totalPages}
                                            className="px-4 py-2 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

                {/* Export CSV Modal */}
                {showExportModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-heading text-xl text-gray-900 flex items-center gap-2">
                                    <Download size={20} /> Export Participants
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

                {/* Bulk Verify Modal */}
                {bulkModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-heading text-xl text-gray-900">Verify / Reject Selected Teams</h3>
                                <button onClick={() => setBulkModalOpen(false)} className="text-gray-400 hover:text-gray-900">Close</button>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-gray-600 mb-4">Review the selected teams. Uncheck any team you do not want to include.</p>

                                <div className="max-h-72 overflow-auto border rounded p-3">
                                    {teams.filter(t => selectedTeamIds.includes(t.id)).map(t => (
                                        <div key={t.id} className="flex items-center justify-between py-2">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTeamIds.includes(t.id)}
                                                    onChange={() => setSelectedTeamIds((prev) => prev.includes(t.id) ? prev.filter(id=>id!==t.id) : [...prev, t.id])}
                                                />
                                                <div>
                                                    <div className="font-medium">{t.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {t.id}</div>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">Status: {t.verificationStatus || 'unknown'}</div>
                                        </div>
                                    ))}
                                    {selectedTeamIds.length === 0 && <div className="text-gray-500 text-sm">No teams selected.</div>}
                                </div>

                                <div className="mt-6 flex gap-3 justify-end">
                                    <button
                                        onClick={async () => {
                                            setBulkProcessing(true);
                                            try {
                                                const toProcess = teams.filter(t => selectedTeamIds.includes(t.id)).map(t=>t.id);
                                                await Promise.allSettled(toProcess.map(id => adminService.verifyTeam(id, 'approve', selectedHackathonId)));
                                                setBulkModalOpen(false);
                                                setSelectedTeamIds([]);
                                                await load();
                                            } catch (e) {
                                                console.error('Bulk verify failed', e);
                                            } finally {
                                                setBulkProcessing(false);
                                            }
                                        }}
                                        disabled={bulkProcessing || selectedTeamIds.length===0}
                                        className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold disabled:opacity-50"
                                    >
                                        {bulkProcessing ? 'Processing...' : 'Verify Selected'}
                                    </button>

                                    <button
                                        onClick={async () => {
                                            setBulkProcessing(true);
                                            try {
                                                const toProcess = teams.filter(t => selectedTeamIds.includes(t.id)).map(t=>t.id);
                                                await Promise.allSettled(toProcess.map(id => adminService.verifyTeam(id, 'reject', selectedHackathonId)));
                                                setBulkModalOpen(false);
                                                setSelectedTeamIds([]);
                                                await load();
                                            } catch (e) {
                                                console.error('Bulk reject failed', e);
                                            } finally {
                                                setBulkProcessing(false);
                                            }
                                        }}
                                        disabled={bulkProcessing || selectedTeamIds.length===0}
                                        className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold disabled:opacity-50"
                                    >
                                        {bulkProcessing ? 'Processing...' : 'Reject Selected'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </AdminLayout>
    );
};

export default AdminParticipants;