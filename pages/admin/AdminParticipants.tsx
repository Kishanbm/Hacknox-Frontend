import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { Search, ShieldAlert, CheckCircle2, MoreHorizontal, UserX, AlertCircle, Lock, Unlock, RefreshCw } from 'lucide-react';
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
                    <div>
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
                    </div>
                </div>

                {/* Top stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Teams', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-50', border: 'border-gray-200' },
                        { label: 'Verified', value: stats.verified, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                        { label: 'Rejected', value: stats.rejected, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                        { label: 'Pending', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
                    ].map((c) => (
                        <div key={c.label} className={`${c.bg} rounded-2xl p-4 shadow-sm border ${c.border}`}>
                            <p className="text-sm text-gray-600 font-medium mb-1">{c.label}</p>
                            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                        </div>
                    ))}
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
        </AdminLayout>
    );
};

export default AdminParticipants;