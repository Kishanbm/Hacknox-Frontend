import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { adminService } from '../../services/admin.service';

const AdminLeaderboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [working, setWorking] = useState(false);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [isPublishedFilter, setIsPublishedFilter] = useState<string>('');
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [selectedHackathonId, setSelectedHackathonId] = useState<string | undefined>(localStorage.getItem('selectedHackathonId') || undefined);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      // If this admin hasn't created any hackathons, don't fetch global leaderboard
      // backend will return other hackathons' teams; instead show empty state
      if (!hackathons || hackathons.length === 0) {
        setRows([]);
        return;
      }

      // Validate selected hackathon belongs to this admin; if not, clear it
      if (selectedHackathonId) {
        const found = hackathons.find(h => h.id === selectedHackathonId);
        if (!found) {
          setSelectedHackathonId(undefined);
          localStorage.removeItem('selectedHackathonId');
        }
      }

      const filter = isPublishedFilter === '' ? undefined : isPublishedFilter === 'true' ? true : false;
      const res = await adminService.getLeaderboard(filter as any, selectedHackathonId);
      // tolerate various backend response shapes
      let fetchedRows: any[] = [];
      if (Array.isArray(res)) fetchedRows = res as any[];
      else if (res?.leaderboard) fetchedRows = res.leaderboard;
      else if (res?.data) fetchedRows = res.data;
      else fetchedRows = [];

      // If 'All' is selected (no hackathon filter) we should still restrict results
      // to only hackathons managed by this admin. Backend may return platform-wide
      // rows when header is opt-out; filter them client-side by extracting a
      // possible hackathon id from each row and checking membership.
      if (!selectedHackathonId && hackathons && hackathons.length > 0) {
        const allowed = new Set(hackathons.map((h: any) => h.id));
        const extractHackathonId = (row: any) => {
          // common shapes: hackathon_id, hackathonId, hackathon?.id, team?.hackathon_id
          if (!row) return undefined;
          if (row.hackathon_id) return row.hackathon_id;
          if (row.hackathonId) return row.hackathonId;
          if (row.hackathon && (row.hackathon.id || row.hackathon.hackathon_id || row.hackathonId)) return row.hackathon.id || row.hackathon.hackathon_id || row.hackathonId;
          if (row.team && (row.team.hackathon_id || row.team.hackathonId)) return row.team.hackathon_id || row.team.hackathonId;
          // fallback: sometimes team object contains hackathon reference under team.hackathon
          if (row.team && row.team.hackathon && (row.team.hackathon.id || row.team.hackathon_id)) return row.team.hackathon.id || row.team.hackathon_id;
          return undefined;
        };

        fetchedRows = fetchedRows.filter(r => {
          const hid = extractHackathonId(r);
          // if no hackathon id on row, be conservative and exclude it
          if (!hid) return false;
          return allowed.has(hid);
        });
      }

      setRows(fetchedRows);
    } catch (e: any) {
      setError(e?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Trigger load when filters, selected hackathon or hackathon list changes
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPublishedFilter, selectedHackathonId, hackathons]);

  useEffect(() => {
    // load hackathons for selector
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

        // If the admin only manages a single hackathon, default-select it to avoid showing platform-wide "All" results
        if ((!stored || stored === undefined) && list.length === 1) {
          const only = list[0];
          if (only && only.id) {
            setSelectedHackathonId(only.id);
            localStorage.setItem('selectedHackathonId', only.id);
          }
        }
      } catch (e) {
        // ignore
      }
    };
    fetchHackathons();
    // update load when selected hackathon changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const runAggregate = async () => {
    setError(null); setMessage(null); setWorking(true); setActiveButton('aggregate');
    try {
      const res = await adminService.aggregateScores(selectedHackathonId);
      setMessage(res?.message || 'Aggregated');
    } catch (e: any) { setError(e?.message || 'Failed to aggregate'); }
    finally { setWorking(false); setActiveButton(null); }
  };

  const runCompute = async () => {
    setError(null); setMessage(null); setWorking(true); setActiveButton('compute');
    try {
      const res = await adminService.computeLeaderboard(selectedHackathonId);
      setMessage(res?.message || 'Computed');
      await load();
    } catch (e: any) { setError(e?.message || 'Failed to compute'); }
    finally { setWorking(false); setActiveButton(null); }
  };

  const togglePublish = async (shouldPublish: boolean) => {
    setError(null); setMessage(null); setWorking(true); setActiveButton(shouldPublish ? 'publish' : 'unpublish');
    try {
      const res = await adminService.publishLeaderboard(shouldPublish, selectedHackathonId);
      setMessage(`Publish set to ${res?.isPublished ?? res?.is_published ?? shouldPublish}`);
      await load();
    } catch (e: any) { setError(e?.message || 'Failed to toggle publish'); }
    finally { setWorking(false); setActiveButton(null); }
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-heading text-gray-900">Leaderboard</h1>
          <p className="text-gray-500 mt-1">Aggregate scores, compute ranks, and publish results.</p>
        </div>

        {(error || message) && (
          <div className={`px-4 py-3 rounded-xl flex items-center gap-2 border ${error ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
            {error || message}
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hackathon</label>
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
                  className="px-3 py-2 text-sm border rounded-lg"
                >
                  <option value="">All</option>
                  {hackathons.map((h: any) => (
                    <option key={h.id} value={h.id}>{h.name || h.title || h.id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">Filter</label>
                <select value={isPublishedFilter} onChange={(e) => setIsPublishedFilter(e.target.value)} className="px-3 py-2 text-sm border rounded-lg">
                  <option value="">All</option>
                  <option value="true">Published</option>
                  <option value="false">Unpublished</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={working || !selectedHackathonId}
                onClick={runAggregate}
                className={`${activeButton === 'aggregate' ? 'px-4 py-2 rounded-full bg-black text-white text-sm font-semibold' : 'px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:shadow-sm'} disabled:opacity-50`}
                title={!selectedHackathonId ? 'Select a hackathon to run aggregate' : 'Aggregate Scores'}
              >
                Aggregate Scores
              </button>

              <button
                disabled={working || !selectedHackathonId}
                onClick={runCompute}
                className={`${activeButton === 'compute' ? 'px-4 py-2 rounded-full bg-black text-white text-sm font-semibold' : 'px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:shadow-sm'} disabled:opacity-50`}
                title={!selectedHackathonId ? 'Select a hackathon to compute leaderboard' : 'Compute Leaderboard'}
              >
                Compute Leaderboard
              </button>

              <button
                disabled={working || !selectedHackathonId}
                onClick={() => togglePublish(true)}
                className={`${activeButton === 'publish' ? 'px-4 py-2 rounded-full bg-black text-white text-sm font-semibold' : 'px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:shadow-sm'} disabled:opacity-50`}
                title={!selectedHackathonId ? 'Select a hackathon to publish' : 'Publish'}
              >
                Publish
              </button>

              <button
                disabled={working || !selectedHackathonId}
                onClick={() => togglePublish(false)}
                className={`${activeButton === 'unpublish' ? 'px-4 py-2 rounded-full bg-black text-white text-sm font-semibold' : 'px-4 py-2 rounded-full border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:shadow-sm'} disabled:opacity-50`}
                title={!selectedHackathonId ? 'Select a hackathon to unpublish' : 'Unpublish'}
              >
                Unpublish
              </button>

              <button
                disabled={working}
                onClick={async () => { setActiveButton('refresh'); await load(); setActiveButton(null); }}
                className={`${activeButton === 'refresh' ? 'px-3 py-2 rounded-full bg-black text-white' : 'px-3 py-2 border rounded-full bg-white text-gray-600 hover:bg-gray-50'}`}
                title="Refresh"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M20 8a8 8 0 11-4.906-7.248M4 16a8 8 0 014.906 7.248" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg text-[#5425FF] mb-4">Internal Leaderboard</h2>
          {loading ? (
            <div className="py-10 text-center">Loading...</div>
          ) : (
            <div className="space-y-2.5">
              {rows.map((r: any, idx: number) => {
                const rank = r.rank ?? idx + 1;
                return (
                  <div key={idx} className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-bold">{r.teamName || r.team_name || '—'}</div>
                      <div className="text-xs text-gray-500">{r.project_title || r.project || ''}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Score</div>
                      <div className="font-bold">{r.score ?? r.final_score ?? '—'}</div>
                    </div>
                  </div>
                );
              })}
              {rows.length === 0 && <div className="py-10 text-center text-gray-400">No leaderboard data yet.</div>}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLeaderboard;
