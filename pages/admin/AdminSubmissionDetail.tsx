import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { ChevronLeft, AlertTriangle, CheckCircle2, Download, ExternalLink } from 'lucide-react';
import { adminService } from '../../services/admin.service';

const AdminSubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [statusForm, setStatusForm] = useState({ newStatus: 'under-review', adminNote: '' });
  const [changing, setChanging] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!id) {
        setError('No submission ID provided');
        return;
      }
      const res = await adminService.getSubmissionDetail(id);
      setSubmission(res.submission);
      setStatusForm((p) => ({
        ...p,
        newStatus: res.submission?.status || p.newStatus,
      }));
    } catch (e: any) {
      setError(e.message || 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch the signed download URL in background
  useEffect(() => {
    let mounted = true;
    const fetchUrl = async () => {
      try {
        if (!id) return;
        const res = await adminService.downloadSubmission(id);
        if (!mounted) return;
        setDownloadUrl(res.signedUrl || res.url || null);
      } catch (e: any) {
        console.debug('Background download URL fetch failed:', e?.message || e);
      }
    };

    if (id) fetchUrl();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const changeStatus = async () => {
    setError(null);
    setMessage(null);
    setChanging(true);
    try {
      if (!id) return;
      const res = await adminService.changeSubmissionStatus(
        id, 
        {
          newStatus: statusForm.newStatus,
          adminNote: statusForm.adminNote || undefined,
        }
      );
      setMessage('Status updated');
      if (res.submission) {
        setSubmission(res.submission);
      } else {
        setSubmission((prev: any) => ({ 
          ...prev, 
          status: statusForm.newStatus, 
          admin_status_note: statusForm.adminNote 
        }));
      }
      setStatusForm((p) => ({ ...p, adminNote: '' }));
    } catch (e: any) {
      setError(e.message || 'Failed to update status');
    } finally {
      setChanging(false);
    }
  };

  const getDownload = async () => {
    setError(null);
    try {
      if (!id) return;
      const res = await adminService.downloadSubmission(id);
      setDownloadUrl(res.signedUrl || res.url || null);
    } catch (e: any) {
      setError(e.message || 'Failed to get download link');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-16 text-[#5425FF] font-figtree">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5425FF]" />
            <span className="ml-3">Loading submission...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <button
            onClick={() => navigate('/admin/submissions')}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 font-bold"
          >
            <ChevronLeft size={18} />
            Back to Submissions
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-heading text-gray-900">Submission Detail</h1>
          <p className="text-gray-500">Review repository, download file, and manage status.</p>
        </div>

        {(error || message) && (
          <div
            className={`px-4 py-3 rounded-xl font-figtree flex items-center gap-2 border mb-6 ${
              error ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
            }`}
          >
            {error ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            {error || message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-heading text-[#5425FF] mb-4 flex items-center gap-2">
              Submission Info
            </h2>
            <div className="space-y-2 text-sm font-figtree text-gray-700">
              <p>
                <span className="text-gray-500">Team:</span>{' '}
                {(() => {
                  const t = submission?.team;
                  if (!t) return '—';
                  const obj = Array.isArray(t) ? t[0] : t;
                  return obj?.name || '—';
                })()}
              </p>
              <p>
                <span className="text-gray-500">Project:</span>{' '}
                {submission?.title || submission?.project || '—'}
              </p>
              <p>
                <span className="text-gray-500">Status:</span>{' '}
                {(() => {
                  const st = (submission?.status || '').toLowerCase();
                  if (st === 'accepted') return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Accepted</span>;
                  if (st === 'under-review' || st === 'submitted') return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">{st === 'under-review' ? 'Under review' : 'Submitted'}</span>;
                  if (st === 'rejected') return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejected</span>;
                  return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Unknown</span>;
                })()}
              </p>
              {submission?.repo_url && (
                <p>
                  <span className="text-gray-500">Repo:</span>{' '}
                  <a className="text-[#5425FF] hover:underline inline-flex items-center gap-1" href={submission.repo_url} target="_blank" rel="noreferrer">
                    {submission.repo_url} <ExternalLink size={12} />
                  </a>
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  try {
                    if (!downloadUrl) {
                      setMessage('Preparing download...');
                      const res = await adminService.downloadSubmission(id!);
                      const url = res.signedUrl || res.url || null;
                      setDownloadUrl(url);
                      setMessage(null);
                      if (url) window.open(url, '_blank');
                    } else {
                      window.open(downloadUrl, '_blank');
                    }
                  } catch (e: any) {
                    setError(e.message || 'Failed to open file');
                    setMessage(null);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#5425FF] text-white font-figtree font-semibold hover:bg-[#4319CC] flex items-center gap-2"
              >
                <Download size={16} /> Open File
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-heading text-[#5425FF] mb-4 flex items-center gap-2">
              Change Submission Status
            </h2>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-sm font-figtree font-semibold text-gray-900 mb-2">New Status</label>
                <select
                  value={statusForm.newStatus}
                  onChange={(e) => setStatusForm((p) => ({ ...p, newStatus: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl font-figtree focus:outline-none focus:ring-2 focus:ring-[#5425FF]"
                >
                  <option value="under-review">under-review</option>
                  <option value="accepted">accepted</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-figtree font-semibold text-gray-900 mb-2">Admin Note</label>
                <input
                  value={statusForm.adminNote}
                  onChange={(e) => setStatusForm((p) => ({ ...p, adminNote: e.target.value }))}
                  placeholder="Optional note"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl font-figtree focus:outline-none focus:ring-2 focus:ring-[#5425FF]"
                />
              </div>
            </div>
            <button
              disabled={changing}
              onClick={changeStatus}
              className="mt-4 px-5 py-3 rounded-xl bg-[#5425FF] text-white font-figtree font-semibold hover:bg-[#4319CC] disabled:opacity-50"
            >
              {changing ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-heading text-[#5425FF] mb-4 flex items-center gap-2">
            Judge Reviews
          </h2>
          <div className="space-y-3">
            {(submission?.reviews || []).map((r: any, idx: number) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-2xl">
                <p className="font-figtree font-semibold text-gray-900">{r.judgeName || 'Judge'}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-700 font-figtree mt-2">
                  {['score_innovation', 'score_feasibility', 'score_execution', 'score_presentation'].map((k) => (
                    <div key={k} className="bg-gray-50 rounded-xl p-2">
                      <p className="text-gray-500">{k.replace('score_', '')}</p>
                      <p className="font-semibold">{r[k] ?? '—'}</p>
                    </div>
                  ))}
                </div>
                {r.comments && <p className="text-sm text-gray-600 font-figtree mt-3 whitespace-pre-wrap">{r.comments}</p>}
              </div>
            ))}
            {(submission?.reviews || []).length === 0 && (
              <p className="text-sm text-gray-400 font-figtree">No reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSubmissionDetail;
