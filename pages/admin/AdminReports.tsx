import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { adminService } from '../../services/admin.service';
import { useToast } from '../../components/ui/ToastProvider';
import { 
    Flag, ChevronLeft, AlertTriangle, CheckCircle2, Eye, 
    Clock, X, Filter, Loader2, ExternalLink
} from 'lucide-react';

interface Report {
    id: string;
    reporter_id: string;
    reporter_type: string;
    reporter_name: string;
    team_id: string;
    team_name: string;
    hackathon_id: string;
    subject: string;
    message: string;
    submission_title: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    admin_notes?: string;
    reviewed_by?: string;
    created_at: string;
    updated_at?: string;
}

interface Hackathon {
    id: string;
    name: string;
}

const AdminReports: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [hackathons, setHackathons] = useState<Hackathon[]>([]);
    const [selectedHackathon, setSelectedHackathon] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 20
    });

    useEffect(() => {
        loadHackathons();
        loadReports();
    }, [selectedHackathon, selectedStatus]);

    const loadHackathons = async () => {
        try {
            const res = await adminService.getMyHackathons();
            const hackList = res?.hackathons || res || [];
            setHackathons(hackList);
        } catch (err) {
            console.error('Failed to load hackathons', err);
        }
    };

    const loadReports = async () => {
        try {
            setLoading(true);
            const res = await adminService.getReports(
                pagination.currentPage,
                pagination.itemsPerPage,
                selectedHackathon !== 'all' ? selectedHackathon : undefined,
                selectedStatus !== 'all' ? selectedStatus : undefined
            );
            setReports(res.reports || []);
            if (res.pagination) {
                setPagination(res.pagination);
            }
        } catch (err) {
            console.error('Failed to load reports', err);
        } finally {
            setLoading(false);
        }
    };

    const { error: toastError } = useToast();

    const handleUpdateStatus = async (reportId: string, status: string) => {
        try {
            setUpdatingStatus(true);
            await adminService.updateReportStatus(reportId, status as any, adminNotes);
            setShowDetailModal(false);
            setSelectedReport(null);
            setAdminNotes('');
            loadReports();
        } catch (err) {
            console.error('Failed to update report status', err);
            toastError('Failed to update report status');
        } finally {
            setUpdatingStatus(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-red-100 text-red-700 border-red-200';
            case 'reviewed': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
            case 'dismissed': return 'bg-gray-100 text-gray-600 border-gray-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    const getSubjectLabel = (subject: string) => {
        switch (subject) {
            case 'plagiarism': return 'Plagiarism / Copied Work';
            case 'inappropriate_content': return 'Inappropriate Content';
            case 'cheating': return 'Cheating / Rule Violation';
            case 'incomplete': return 'Incomplete Submission';
            case 'other': return 'Other';
            default: return subject;
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <button 
                            onClick={() => navigate('/admin/dashboard')} 
                            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 font-bold text-sm"
                        >
                            <ChevronLeft size={20} /> Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-heading text-gray-900 flex items-center gap-3">
                            <Flag className="text-red-500" size={28} />
                            Reports & Flags
                        </h1>
                        <p className="text-gray-500 mt-1">Review and manage reported submissions</p>
                    </div>
                    
                    {/* Filter Controls */}
                    <div className="flex gap-3">
                        <select
                            value={selectedHackathon}
                            onChange={(e) => setSelectedHackathon(e.target.value)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-gray-900"
                        >
                            <option value="all">All Hackathons</option>
                            {hackathons.map(h => (
                                <option key={h.id} value={h.id}>{h.name}</option>
                            ))}
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-gray-900"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="resolved">Resolved</option>
                            <option value="dismissed">Dismissed</option>
                        </select>
                    </div>
                </div>

                {/* Reports List */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="animate-spin mx-auto mb-4 text-gray-400" size={32} />
                            <p className="text-gray-500">Loading reports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="p-12 text-center">
                            <CheckCircle2 className="mx-auto mb-4 text-green-500" size={48} />
                            <h3 className="font-bold text-gray-900 mb-2">No Reports Found</h3>
                            <p className="text-gray-500">There are no reported submissions matching your filters.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {reports.map((report) => (
                                <div 
                                    key={report.id} 
                                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => {
                                        setSelectedReport(report);
                                        setAdminNotes(report.admin_notes || '');
                                        setShowDetailModal(true);
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <AlertTriangle className="text-red-500 shrink-0" size={20} />
                                                <h3 className="font-bold text-gray-900">
                                                    {getSubjectLabel(report.subject)}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${getStatusColor(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                                {report.message}
                                            </p>
                                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <strong>Team:</strong> {report.team_name || 'Unknown'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <strong>Submission:</strong> {report.submission_title || 'N/A'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <strong>Reporter:</strong> {report.reporter_name || 'Unknown'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {new Date(report.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-500">
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setPagination(p => ({ ...p, currentPage: page }))}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                                    pagination.currentPage === page
                                        ? 'bg-gray-900 text-white'
                                        : 'bg-white border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}

                {/* Detail Modal */}
                {showDetailModal && selectedReport && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <AlertTriangle className="text-red-500" size={24} />
                                        Report Details
                                    </h2>
                                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(selectedReport.status)}`}>
                                        {selectedReport.status}
                                    </span>
                                </div>
                                <button 
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        setSelectedReport(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Subject</label>
                                        <p className="font-bold text-gray-900">{getSubjectLabel(selectedReport.subject)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Reported At</label>
                                        <p className="text-gray-900">{new Date(selectedReport.created_at).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Team</label>
                                        <p className="text-gray-900">{selectedReport.team_name || 'Unknown'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Submission</label>
                                        <p className="text-gray-900">{selectedReport.submission_title || 'N/A'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 mb-1">Reporter</label>
                                        <p className="text-gray-900">{selectedReport.reporter_name} ({selectedReport.reporter_type})</p>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1">Message</label>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-700">
                                        {selectedReport.message}
                                    </div>
                                </div>

                                {selectedReport.team_id && (
                                    <button
                                        onClick={() => navigate(`/admin/teams/${selectedReport.team_id}`)}
                                        className="text-sm font-bold text-[#5425FF] hover:underline flex items-center gap-1"
                                    >
                                        View Team Details <ExternalLink size={14} />
                                    </button>
                                )}

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Admin Notes</label>
                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 text-sm resize-none"
                                        rows={3}
                                        placeholder="Add notes about this report..."
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => handleUpdateStatus(selectedReport.id, 'reviewed')}
                                    disabled={updatingStatus}
                                    className="flex-1 py-3 bg-yellow-100 text-yellow-700 rounded-xl font-bold hover:bg-yellow-200 transition-colors disabled:opacity-50"
                                >
                                    Mark Reviewed
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedReport.id, 'resolved')}
                                    disabled={updatingStatus}
                                    className="flex-1 py-3 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition-colors disabled:opacity-50"
                                >
                                    Mark Resolved
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed')}
                                    disabled={updatingStatus}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminReports;
