import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { Edit, ChevronLeft, Users, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/admin.service';

const AdminTeamDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [team, setTeam] = useState<any>(null);

    const [editForm, setEditForm] = useState({
        name: '',
        city: '',
        projectCategory: '',
        adminNotes: '',
    });
    const [saving, setSaving] = useState(false);

    const load = async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            const res = await adminService.getTeamDetail(id);
            setTeam(res.team || res);
            setEditForm({
                name: res.team?.name || res?.name || '',
                city: res.team?.city || res?.city || '',
                projectCategory: res.team?.project_category || res?.project_category || '',
                adminNotes: res.team?.admin_notes || res?.admin_notes || '',
            });
        } catch (e: any) {
            setError(e.message || 'Failed to load team');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const onVerify = async (action: 'approve' | 'reject') => {
        if (!id) return;
        setError(null);
        setMessage(null);
        try {
            const res = await adminService.verifyTeam(id, action);
            setMessage(res.message || 'Updated');
            await load();
        } catch (e: any) {
            setError(e.message || 'Failed to verify team');
        }
    };

    const onSave = async () => {
        if (!id) return;
        setError(null);
        setMessage(null);
        setSaving(true);
        try {
            const payload: any = {};
            if (editForm.name) payload.name = editForm.name;
            if (editForm.city) payload.city = editForm.city;
            if (editForm.projectCategory) payload.projectCategory = editForm.projectCategory;
            if (editForm.adminNotes) payload.adminNotes = editForm.adminNotes;
            const res = await adminService.updateTeam(id, payload);
            setMessage(res.message || 'Saved');
            await load();
        } catch (e: any) {
            setError(e.message || 'Failed to update team');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                    <span className="ml-3 text-gray-900 font-medium">Loading team...</span>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-start justify-between">
                    <button
                        onClick={() => navigate('/admin/participants')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold text-sm"
                    >
                        <ChevronLeft size={20} />
                        Back to Teams
                    </button>
                </div>

                <div>
                    <h1 className="text-3xl font-heading text-gray-900">Team Profile</h1>
                    <p className="text-gray-500 mt-1">Members, submissions, judges, and evaluations.</p>
                </div>

                {(error || message) && (
                    <div
                        className={`px-4 py-3 rounded-xl flex items-center gap-2 border ${
                            error ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
                        }`}
                    >
                        {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                        {error || message}
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Team summary */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 xl:col-span-2">
                        <div className="flex items-start justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-heading text-gray-900">{team?.name || 'Team'}</h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Status: <span className="capitalize font-semibold text-gray-900">{team?.verification_status || team?.verificationStatus || 'unknown'}</span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => onVerify('approve')}
                                    className={`px-4 py-2 rounded-xl font-bold ${
                                        (team?.verification_status || team?.verificationStatus || '').toLowerCase() === 'verified'
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => onVerify('reject')}
                                    className={`px-4 py-2 rounded-xl font-bold ${
                                        (team?.verification_status || team?.verificationStatus || '').toLowerCase() === 'rejected'
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    Reject
                                </button>
                            </div>
                        </div>

                        {/* Members */}
                        <div className="mb-6">
                            <h3 className="text-lg font-heading text-gray-900 mb-3 flex items-center gap-2">
                                <Users size={20} className="text-gray-900" />
                                Members
                            </h3>
                            <div className="space-y-2">
                                {(team?.members || []).map((m: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="min-w-0">
                                            <p className="font-bold text-gray-900 truncate">
                                                {(m?.firstName || m?.lastName)
                                                    ? ((m?.firstName || '') + (m?.lastName ? ' ' + m.lastName : '')).trim()
                                                    : (m?.name || m?.email || 'Member')}
                                            </p>
                                            <p className="text-xs text-gray-500 capitalize">{m?.role || 'member'}</p>
                                        </div>
                                    </div>
                                ))}
                                {(team?.members || []).length === 0 && (
                                    <p className="text-sm text-gray-400 py-4 text-center">No members.</p>
                                )}
                            </div>
                        </div>

                        {/* Submissions */}
                        <div>
                            <h3 className="text-lg font-heading text-gray-900 mb-3 flex items-center gap-2">
                                <FileText size={20} className="text-gray-900" />
                                Submissions
                            </h3>
                            <div className="space-y-2">
                                {(team?.submissions || []).map((s: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-sm text-gray-900">
                                            Repo: {s?.repo_url ? (
                                                <a
                                                    className="text-gray-900 hover:underline font-medium"
                                                    href={s.repo_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    {s.repo_url}
                                                </a>
                                            ) : '—'}
                                        </p>
                                        {s?.status && <p className="text-xs text-gray-500 mt-1">Status: {s.status}</p>}
                                    </div>
                                ))}
                                {(team?.submissions || []).length === 0 && (
                                    <p className="text-sm text-gray-400 py-4 text-center">No submissions.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Admin edit */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-heading text-gray-900 mb-4 flex items-center gap-3">
                            <span className="p-1.5 rounded-md border border-gray-200 inline-flex items-center justify-center">
                                <Edit className="h-4 w-4 text-gray-900" />
                            </span>
                            Admin Edit
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Team Name</label>
                                <input
                                    value={editForm.name}
                                    onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">City</label>
                                <input
                                    value={editForm.city}
                                    onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Project Category</label>
                                <input
                                    value={editForm.projectCategory}
                                    onChange={(e) => setEditForm((p) => ({ ...p, projectCategory: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Admin Notes</label>
                                <textarea
                                    value={editForm.adminNotes}
                                    onChange={(e) => setEditForm((p) => ({ ...p, adminNotes: e.target.value }))}
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                />
                            </div>
                            <button
                                disabled={saving}
                                onClick={onSave}
                                className="w-full px-5 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminTeamDetail;
