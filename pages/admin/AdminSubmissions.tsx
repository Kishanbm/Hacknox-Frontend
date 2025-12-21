import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { 
    FileText, Search, CheckCircle2, Clock, AlertTriangle, Eye, UserPlus, Download, 
    Filter, ChevronUp, ChevronDown, Calendar, RefreshCw
} from 'lucide-react';
import { adminService } from '../../services/admin.service';

const AdminSubmissions: React.FC = () => {
    const navigate = useNavigate();
    const [hackathons, setHackathons] = useState<any[]>([]);
    const [selectedHackathonId, setSelectedHackathonId] = useState<string | undefined>(localStorage.getItem('selectedHackathonId') || undefined);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'submittedAt', direction: 'desc' });
    
    // API state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.max(1, Math.ceil(totalCount / limit));

    // Load hackathons for selector
    useEffect(() => {
        const fetchHackathons = async () => {
            try {
                const res = await adminService.getMyHackathons();
                const list = res?.hackathons || res || [];
                setHackathons(list);

                // Clear stored selected hackathon id if it doesn't belong to this admin
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

    // Load data when dependencies change
    useEffect(() => {
        if (selectedHackathonId) {
            localStorage.setItem('selectedHackathonId', selectedHackathonId);
        } else {
            localStorage.removeItem('selectedHackathonId');
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedHackathonId, page, statusFilter, hackathons]);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const filters: any = {};
            if (statusFilter) filters.status = statusFilter;
            
            // If admin has no hackathons, show empty
            if (!hackathons || hackathons.length === 0) {
                setSubmissions([]);
                setTotalCount(0);
                return;
            }

            // If a specific hackathon is selected, request server-side with hackathon header
            if (selectedHackathonId) {
                const res = await adminService.getSubmissions(page, limit, filters, selectedHackathonId);
                const subsList = res?.submissions || res?.data || (Array.isArray(res) ? res : []);
                setSubmissions(subsList);
                setTotalCount(res?.totalCount || res?.total || subsList.length);
                return;
            }

            // When 'All' selected, fetch per-admin-hackathon and merge results client-side
            const perHackathonLimit = 1000;
            const calls = hackathons.map(h => adminService.getSubmissions(1, perHackathonLimit, filters, h.id).catch(() => ({ submissions: [] })));
            const results = await Promise.all(calls);
            const combined = results.flatMap((r: any) => r.submissions || []);
            const start = (page - 1) * limit;
            const paged = combined.slice(start, start + limit);
            setSubmissions(paged);
            setTotalCount(combined.length);
        } catch (e: any) {
            console.error('Failed to load submissions:', e);
            setError(e?.message || 'Failed to load submissions');
            setSubmissions([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter & Sort Logic (client-side for search and sort)
    const processedSubmissions = useMemo(() => {
        let result = [...submissions];

        // 1. Search (Project or Team)
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(s => {
                const title = s.title || s.project || '';
                const teamName = s.teamName || (s.team && (s.team.name || s.team)) || '';
                return title.toLowerCase().includes(lowerQuery) || teamName.toLowerCase().includes(lowerQuery);
            });
        }

        // 2. Sort
        result.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortConfig.key === 'project') {
                aValue = a.title || a.project || '';
                bValue = b.title || b.project || '';
            } else if (sortConfig.key === 'score') {
                aValue = a.score || 0;
                bValue = b.score || 0;
            } else if (sortConfig.key === 'status') {
                aValue = a.submissionStatus || a.status || '';
                bValue = b.submissionStatus || b.status || '';
            } else {
                aValue = a[sortConfig.key as keyof typeof a];
                bValue = b[sortConfig.key as keyof typeof b];
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        return result;
    }, [submissions, searchQuery, sortConfig]);

    const handleSort = (key: string) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleExportCSV = () => {
        setIsExporting(true);
        setTimeout(() => {
            const headers = ['ID', 'Project', 'Team', 'Status', 'Evaluations', 'Submitted'];
            const rows = processedSubmissions.map(s => [
                s.id, 
                s.title || s.project || '—', 
                s.teamName || (s.team && (s.team.name || s.team)) || '—', 
                s.submissionStatus || s.status || '—', 
                s.evaluationCount || 0, 
                s.submittedAt ? new Date(s.submittedAt).toLocaleString() : '—'
            ]);
            
            const csvContent = "data:text/csv;charset=utf-8," 
                + headers.join(",") + "\n" 
                + rows.map(e => e.join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `submissions_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setIsExporting(false);
        }, 1000);
    };

    // Compute stats from submissions
    const stats = useMemo(() => {
        const totalSubmitted = submissions.filter(s => {
            const status = (s.submissionStatus || s.status || '').toLowerCase();
            return status === 'submitted' || status === 'under-review' || status === 'accepted';
        }).length;
        const accepted = submissions.filter(s => (s.submissionStatus || s.status || '').toLowerCase() === 'accepted').length;
        const rejected = submissions.filter(s => (s.submissionStatus || s.status || '').toLowerCase() === 'rejected').length;
        const underReview = submissions.filter(s => (s.submissionStatus || s.status || '').toLowerCase() === 'under-review').length;
        return { totalSubmitted, accepted, rejected, underReview };
    }, [submissions]);

    // Helper to render sort icon
    const SortIcon = ({ column }: { column: string }) => {
        if (sortConfig.key !== column) return <div className="w-4" />; // Spacer
        return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-heading text-gray-900">Submission Registry</h1>
                        <p className="text-gray-500">Monitor incoming projects, track evaluation progress, and manage integrity.</p>
                    </div>
                    <div className="flex gap-3">
                        <select 
                            value={selectedHackathonId || ''} 
                            onChange={(e) => {
                                const val = e.target.value || undefined;
                                if (!val) return setSelectedHackathonId(undefined);
                                setSelectedHackathonId(val);
                            }} 
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:border-[#5425FF] shadow-sm"
                        >
                            <option value="">Context: All</option>
                            {hackathons.map((h) => (
                                <option key={h.id} value={h.id}>{h.name || h.title || h.id}</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleExportCSV}
                            disabled={isExporting}
                            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-[#5425FF] hover:text-[#5425FF] flex items-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isExporting ? (
                                <><div className="w-4 h-4 border-2 border-[#5425FF] border-t-transparent rounded-full animate-spin"></div> Exporting...</>
                            ) : (
                                <><Download size={18} /> Export CSV</>
                            )}
                        </button>
                    </div>
                </div>

                {/* KPI Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-200 to-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-[#5425FF]/30 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-2 mb-1">
                            <FileText size={18} className="text-blue-600" />
                            <p className="text-sm font-figtree text-[#64748b]">Total Submitted</p>
                        </div>
                        <p className="text-2xl font-semibold text-blue-600">{stats.totalSubmitted}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-200 to-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-[#5425FF]/30 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-2 mb-1">
                            <CheckCircle2 size={18} className="text-emerald-600" />
                            <p className="text-sm font-figtree text-[#64748b]">Accepted</p>
                        </div>
                        <p className="text-2xl font-semibold text-emerald-600">{stats.accepted}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-200 to-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-[#5425FF]/30 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle size={18} className="text-red-600" />
                            <p className="text-sm font-figtree text-[#64748b]">Rejected</p>
                        </div>
                        <p className="text-2xl font-semibold text-red-600">{stats.rejected}</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-200 to-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-[#5425FF]/30 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={18} className="text-amber-600" />
                            <p className="text-sm font-figtree text-[#64748b]">Under Review</p>
                        </div>
                        <p className="text-2xl font-semibold text-amber-600">{stats.underReview}</p>
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
                        {/* Status Filter */}
                        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shrink-0">
                            {['', 'submitted', 'under-review', 'accepted', 'rejected'].map((status, idx) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                        statusFilter === status 
                                        ? 'bg-gray-900 text-white shadow-md' 
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    {idx === 0 ? 'All' : status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                        {/* Search Bar */}
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search project or team..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] text-sm font-medium"
                            />
                        </div>
                        <button
                            onClick={load}
                            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-[#5425FF] flex items-center gap-2 transition-all shadow-sm"
                            title="Refresh"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl font-figtree flex items-center gap-2">
                        <AlertTriangle size={18} />
                        {error}
                    </div>
                )}

                {/* Submissions Table */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="py-10 flex items-center justify-center text-[#5425FF] font-figtree">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5425FF]" />
                            <span className="ml-3">Loading submissions...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th 
                                            className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors group"
                                            onClick={() => handleSort('project')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Project Details <SortIcon column="project" />
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => handleSort('status')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Status <SortIcon column="status" />
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Evaluations
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Submitted
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Repo
                                        </th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {processedSubmissions.length > 0 ? (
                                        processedSubmissions.map((sub) => {
                                            const status = (sub.submissionStatus || sub.status || '').toLowerCase();
                                            const teamName = sub.teamName || (sub.team && (sub.team.name || sub.team)) || sub.id;
                                            const projectName = sub.title || sub.project || 'Untitled';
                                            
                                            return (
                                                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{projectName}</div>
                                                        <div className="text-xs text-gray-500">by {teamName}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {status === 'accepted' && <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Accepted</span>}
                                                        {(status === 'under-review' || status === 'submitted') && <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">{status === 'under-review' ? 'Under review' : 'Submitted'}</span>}
                                                        {status === 'rejected' && <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejected</span>}
                                                        {!status && <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Unknown</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600">{sub.evaluationCount ?? 0}</td>
                                                    <td className="px-6 py-4 text-gray-600 text-sm">{sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}</td>
                                                    <td className="px-6 py-4">
                                                        {sub.repoUrl || sub.repo_url ? (
                                                            <a
                                                                href={sub.repoUrl || sub.repo_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="text-[#5425FF] hover:underline text-sm"
                                                            >
                                                                Open
                                                            </a>
                                                        ) : (
                                                            '—'
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button 
                                                                onClick={() => navigate(`/admin/submissions/${sub.id}`)}
                                                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" 
                                                                title="View Details"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                No submissions found matching your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && !loading && (
                        <div className="flex items-center justify-between mt-6 pt-4 px-6 pb-6 border-t border-gray-200">
                            <p className="text-sm font-figtree text-[#64748b]">
                                Page {page} of {totalPages} • Total {totalCount}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="px-4 py-2 rounded-xl border border-gray-300 text-[#0f172a] font-figtree font-semibold hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="px-4 py-2 rounded-xl bg-[#5425FF] text-white font-figtree font-semibold hover:bg-[#4319CC] disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSubmissions;