import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { FileClock, Search, Filter, Shield, AlertTriangle, CheckCircle2, Info, RefreshCw, XCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';

const AdminAudit: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(25);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchAction, setSearchAction] = useState('');
    const [searchUser, setSearchUser] = useState('');
    const [filter, setFilter] = useState('All');
    const [selectedHackathonId, setSelectedHackathonId] = useState<string | undefined>(localStorage.getItem('selectedHackathonId') || undefined);

    const load = async (p = 1) => {
        setLoading(true);
        setError(null);
        try {
            // Pass hackathonId only if specifically selected (not 'all' or undefined)
            const hackId = selectedHackathonId && selectedHackathonId !== 'all' ? selectedHackathonId : undefined;
            const res = await adminService.getAuditLogs(p, limit, hackId);
            setLogs(res.logs || res || []);
            setPage(res.page || p);
        } catch (e: any) {
            setError(e.message || 'Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedHackathonId]);

    const formatDetails = (details: any) => {
        if (!details) return '';
        let parsed: any = details;
        if (typeof details === 'string') {
            try {
                parsed = JSON.parse(details);
            } catch (e) {
                // not JSON, return as-is
                return details;
            }
        }

        if (parsed && typeof parsed === 'object') {
            // Prefer message field when available
            if (parsed.message && typeof parsed.message === 'string') return parsed.message;
            // If result.message nested
            if (parsed.result?.message && typeof parsed.result.message === 'string') return parsed.result.message;
            
            // Build a human-readable description from common fields
            const parts: string[] = [];
            
            // Handle announcement-related fields
            if (parsed.announcementId) parts.push(`announcementId: ${parsed.announcementId}`);
            if (parsed.title) parts.push(`title: ${parsed.title}`);
            if (parsed.content) parts.push(`content: ${String(parsed.content).substring(0, 50)}${parsed.content.length > 50 ? '...' : ''}`);
            
            // Handle submission-related fields
            if (parsed.submissionId) parts.push(`submissionId: ${parsed.submissionId}`);
            if (parsed.submissionTitle || parsed.submission_title) parts.push(`submission: ${parsed.submissionTitle || parsed.submission_title}`);
            if (parsed.teamName || parsed.team_name) parts.push(`team: ${parsed.teamName || parsed.team_name}`);
            if (parsed.status) parts.push(`status: ${parsed.status}`);
            
            // Handle judge/team related
            if (parsed.judgeId) parts.push(`judgeId: ${parsed.judgeId}`);
            if (parsed.judgeName || parsed.judge_name) parts.push(`judge: ${parsed.judgeName || parsed.judge_name}`);
            if (parsed.teamId) parts.push(`teamId: ${parsed.teamId}`);
            
            // Handle hackathon related
            if (parsed.hackathonId) parts.push(`hackathonId: ${parsed.hackathonId}`);
            if (parsed.hackathonName || parsed.hackathon_name) parts.push(`hackathon: ${parsed.hackathonName || parsed.hackathon_name}`);
            
            // Handle user related
            if (parsed.email) parts.push(`email: ${parsed.email}`);
            if (parsed.userId) parts.push(`userId: ${parsed.userId}`);
            
            // If we built up parts, return them
            if (parts.length > 0) return parts.join('\n');
            
            // Otherwise pretty-print key: value pairs (shallow)
            return Object.entries(parsed)
                .slice(0, 5) // Limit to first 5 fields
                .map(([k, v]) => {
                    if (typeof v === 'object') return `${k}: ${JSON.stringify(v).substring(0, 50)}`;
                    return `${k}: ${v}`;
                })
                .join('\n');
        }

        return String(parsed);
    };

    const renderStatus = (status?: string) => {
        const s = (status || 'Success').toString().toLowerCase();
        if (s === 'success' || s === 'ok') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase border bg-[#24FF00]/10 text-green-700 border-[#24FF00]/20">
                    <CheckCircle2 size={14} />
                    SUCCESS
                </span>
            );
        }
        if (s === 'failed' || s === 'error' || s === 'failure') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase border bg-red-50 text-red-700 border-red-200">
                    <XCircle size={14} />
                    FAILED
                </span>
            );
        }
        if (s === 'warning' || s === 'warn') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase border bg-amber-50 text-amber-700 border-amber-200">
                    <AlertTriangle size={14} />
                    WARNING
                </span>
            );
        }
        if (s === 'info' || s === 'information') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase border bg-blue-50 text-blue-700 border-blue-200">
                    <Info size={14} />
                    INFO
                </span>
            );
        }
        // fallback neutral
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase border bg-gray-50 text-gray-700 border-gray-100">{(status || 'Unknown').toString()}</span>
        );
    };

    const getIcon = (severity: string) => {
        switch (severity) {
            case 'Critical': return <AlertTriangle size={16} className="text-red-600" />;
            case 'Warning': return <AlertTriangle size={16} className="text-amber-600" />;
            case 'Success': return <CheckCircle2 size={16} className="text-[#24FF00]" />;
            default: return <Info size={16} className="text-blue-600" />;
        }
    };

    const getBadgeStyle = (severity: string) => {
        switch (severity) {
            case 'Critical': return 'bg-red-50 text-red-700 border-red-200';
            case 'Warning': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'Success': return 'bg-[#24FF00]/10 text-green-700 border-[#24FF00]/20';
            default: return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    // Filter logs by action type, user email, and severity
    const filtered = logs.filter((l) => {
        const actionMatch = searchAction ? (l.action || '').toString().toLowerCase().includes(searchAction.toLowerCase()) : true;
        const userEmail = (l.admin?.email || '') as string;
        const userMatch = searchUser ? userEmail.toLowerCase().includes(searchUser.toLowerCase()) : true;
        
        // Severity filter based on status mapping
        let severityMatch = true;
        if (filter !== 'All') {
            const status = (l.status || 'Success').toString().toLowerCase();
            if (filter === 'Success') severityMatch = status === 'success' || status === 'ok';
            else if (filter === 'Critical') severityMatch = status === 'failed' || status === 'error' || status === 'failure';
            else if (filter === 'Warning') severityMatch = status === 'warning' || status === 'warn';
            else if (filter === 'Info') severityMatch = status === 'info' || status === 'information';
        }
        
        return actionMatch && userMatch && severityMatch;
    });

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-heading text-gray-900">System Logs</h1>
                        <p className="text-gray-500">Audit trail of all administrative actions and system events.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => load(1)}
                            className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
                        {['All', 'Info', 'Success', 'Warning', 'Critical'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                                    filter === status 
                                    ? 'bg-gray-900 text-white shadow-md' 
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <input 
                            type="text" 
                            placeholder="Filter by action type..." 
                            value={searchAction}
                            onChange={(e) => setSearchAction(e.target.value)}
                            className="flex-1 md:w-60 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]"
                        />
                        <input 
                            type="text" 
                            placeholder="Filter by user email..." 
                            value={searchUser}
                            onChange={(e) => setSearchUser(e.target.value)}
                            className="flex-1 md:w-60 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]"
                        />
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-[#5425FF]">Loading...</div>
                    ) : error ? (
                        <div className="p-12 text-center text-red-600">{error}</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action Type</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filtered.map((l) => (
                                            <tr key={l.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-700">
                                                    {l.created_at ? new Date(l.created_at).toLocaleString() : '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Shield size={14} className="text-gray-400" />
                                                        <span className="font-bold text-gray-700 text-sm">{l.admin?.email || 'system'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-900 text-sm">{l.action}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-gray-700 break-words max-w-xl whitespace-pre-wrap">
                                                        {formatDetails(l.details)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {renderStatus(l.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filtered.length === 0 && (
                                <div className="p-12 text-center text-gray-500">No logs found matching this criteria.</div>
                            )}
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {filtered.length} of {logs.length} entries {filtered.length !== logs.length && '(filtered)'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        disabled={page <= 1} 
                                        onClick={() => load(page - 1)} 
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Prev
                                    </button>
                                    <span className="text-sm text-gray-500 px-2">Page {page}</span>
                                    <button 
                                        onClick={() => load(page + 1)} 
                                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAudit;