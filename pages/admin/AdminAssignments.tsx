import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { 
    GitMerge, UploadCloud, Zap, Users, CheckCircle2, 
    MoreHorizontal, RefreshCw, AlertCircle, FileText, ArrowRight, X, Search, FileUp, AlertTriangle,
    ChevronDown, MousePointerClick, ListChecks, Repeat, Scale
} from 'lucide-react';

import { adminService } from '../../services/admin.service';

const AdminAssignments: React.FC = () => {
    // assignments loaded from backend
    const [assignments, setAssignments] = useState<any[]>([]);
    const [hackathons, setHackathons] = useState<any[]>([]);
    const [selectedHackathonId, setSelectedHackathonId] = useState<string | undefined>(localStorage.getItem('selectedHackathonId') || undefined);

    const [isConflictModalOpen, setConflictModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [loadingData, setLoadingData] = useState(false);
    
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
    const [manualSelection, setManualSelection] = useState({ judge: '', team: '' });
    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [judges, setJudges] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [working, setWorking] = useState(false);
    
    // Assignment Method Selection
    const [activeTab, setActiveTab] = useState<'manual' | 'csv' | 'bulk' | 'reassign' | 'autobalance'>('manual');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
    const [reassignData, setReassignData] = useState({ teamId: '', oldJudgeId: '', newJudgeId: '' });
    const [csvFile, setCsvFile] = useState<File | null>(null);

    // Computed KPIs from actual data
    const totalAssigned = assignments.reduce((acc, curr) => acc + (curr.teams?.length || 0), 0);
    const judgesCount = judges.length;
    const completedEval = assignments.reduce((acc, curr) => {
        // Count teams with status 'completed' if available
        return acc + (curr.teams?.filter((t: any) => t.status === 'completed')?.length || 0);
    }, 0);
    const pendingEval = totalAssigned - completedEval;

    const kpis = {
        judges: judgesCount,
        assigned: totalAssigned,
        completed: completedEval,
        pending: pendingEval
    };

    // load hackathons for top-right selector
    useEffect(() => {
        const fetchHackathons = async () => {
            try {
                const res = await adminService.getMyHackathons();
                const list = res?.hackathons || res || [];
                setHackathons(list);
            } catch (e) {
                // ignore
            }
        };
        fetchHackathons();
    }, []);

    // Load data when hackathonId changes OR on initial mount
    useEffect(() => {
        if (selectedHackathonId) {
            localStorage.setItem('selectedHackathonId', selectedHackathonId);
        } else {
            localStorage.removeItem('selectedHackathonId');
        }
        load();
        loadJudgesAndTeams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedHackathonId]);

    const load = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await adminService.getJudgeAssignments(selectedHackathonId);
            // Backend may return different shapes, normalize here
            const matrix = res?.assignmentMatrix || res?.matrix || res?.data || res || [];

            // Normalize backend assignment matrix to UI shape
            const normalized = (Array.isArray(matrix) ? matrix : []).map((j: any) => {
                const judgeId = j.judgeId || j.id || j.judge || j.judge_email || j.judgeEmail;
                const judgeName = j.judgeName || j.judge || j.judge_email || j.judgeEmail || (j.profile && (j.profile.first_name || '') + ' ' + (j.profile.last_name || ''));
                const isActive = (j.isActive === undefined) ? (j.status !== 'Deactivated') : j.isActive;
                const loadCount = j.totalLoad || j.load || (j.loadStats && j.loadStats.totalAssigned) || 0;
                const maxLoad = j.maxLoad || j.capacity || (j.loadStats && j.loadStats.capacity) || 999;
                // teams may be array of strings or objects
                const teamsArr = j.teamsAssigned || j.teams || j.teamsList || [];
                const teams = (Array.isArray(teamsArr) ? teamsArr : []).map((t: any) => {
                    if (!t) return '';
                    if (typeof t === 'string') return t;
                    return t.teamName || t.name || t.team || t.team_id || t.teamId || (t.team && (t.team.name || t.team.id)) || '';
                });

                return {
                    id: judgeId,
                    judge: judgeName || judgeId,
                    status: isActive ? 'Active' : 'Deactivated',
                    load: loadCount,
                    maxLoad,
                    teams
                };
            });

            setAssignments(normalized);
        } catch (e: any) {
            console.error('Failed to load assignment matrix:', e);
            setError(e?.message || 'Failed to load assignment matrix');
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const loadJudgesAndTeams = async () => {
        try {
            setLoadingData(true);
            const [judgesRes, teamsRes] = await Promise.all([
                adminService.getJudges(1, 100, selectedHackathonId),
                adminService.getTeams(1, 100, {}, '', selectedHackathonId)
            ]);
            // Normalize response shapes
            const judgesList = judgesRes?.judges || judgesRes?.data || (Array.isArray(judgesRes) ? judgesRes : []);
            const teamsList = teamsRes?.teams || teamsRes?.data || (Array.isArray(teamsRes) ? teamsRes : []);
            setJudges(judgesList);
            setTeams(teamsList);
        } catch (e: any) {
            console.error('Failed to load judges/teams:', e);
            setJudges([]);
            setTeams([]);
        } finally {
            setLoadingData(false);
        }
    };

    // --- ALGORITHMS ---

    const handleAutoBalance = async () => {
        setWorking(true);
        setError(null);
        setMessage(null);
        try {
            // Try server-side auto-balance first
            const res = await adminService.autoBalanceAssignments(selectedHackathonId);
            setMessage(res?.message || 'Auto-balance completed');
            await load();
            setWorking(false);
            return;
        } catch (e: any) {
            // fallback to client-side algorithm if server call fails
            console.warn('Server auto-balance failed, falling back to client-side', e?.message);
        }
        // 1. Collect all currently assigned teams
        const allTeams = assignments.flatMap(a => a.teams);
        
        // 2. Identify active judges
        const activeJudges = assignments.filter(a => a.status !== 'Deactivated');
        
        if (activeJudges.length === 0) return;

        // 3. Reset assignments for active judges
        const newAssignments = assignments.map(a => {
            if (a.status !== 'Deactivated') {
                return { ...a, teams: [], load: 0 };
            }
            return a;
        });

        // 4. Round-robin distribution
        let judgeIdx = 0;
        allTeams.forEach(team => {
            // Find next active judge in the newAssignments array
            while (newAssignments[judgeIdx].status === 'Deactivated') {
                judgeIdx = (judgeIdx + 1) % newAssignments.length;
            }
            
            newAssignments[judgeIdx].teams.push(team);
            newAssignments[judgeIdx].load += 1;
            
            judgeIdx = (judgeIdx + 1) % newAssignments.length;
        });

        setAssignments(newAssignments);
        setWorking(false);
    };

    const handleManualAssign = async () => {
        if (manualSelection.judge && manualSelection.team) {
            try {
                setWorking(true);
                // backend expects an array of { judgeId, teamId } objects
                const payload = [{ judgeId: manualSelection.judge, teamId: manualSelection.team }];
                await adminService.assignTeamsToJudges(payload, selectedHackathonId);
                setMessage('Assignment successful');
                await load();
                setManualSelection({ judge: '', team: '' });
            } catch (e: any) {
                setError(e?.message || 'Failed to assign');
            } finally {
                setWorking(false);
            }
        }
    };

    const handleBulkAssign = async () => {
        if (selectedTeams.length > 0 && manualSelection.judge) {
            try {
                setWorking(true);
                // convert to [{judgeId, teamId}, ...] for backend
                const payload = selectedTeams.map((tId) => ({ judgeId: manualSelection.judge, teamId: tId }));
                await adminService.assignTeamsToJudges(payload, selectedHackathonId);
                setMessage('Bulk assignment successful');
                await load();
                setSelectedTeams([]);
                setManualSelection({ ...manualSelection, judge: '' });
            } catch (e: any) {
                setError(e?.message || 'Failed to bulk assign');
            } finally {
                setWorking(false);
            }
        }
    };

    const handleReassign = async () => {
        if (reassignData.teamId && reassignData.oldJudgeId && reassignData.newJudgeId) {
            try {
                setWorking(true);
                await adminService.reassignTeam(reassignData, selectedHackathonId);
                setMessage('Team reassigned successfully');
                await load();
                setReassignData({ teamId: '', oldJudgeId: '', newJudgeId: '' });
            } catch (e: any) {
                setError(e?.message || 'Failed to reassign');
            } finally {
                setWorking(false);
            }
        }
    };

    const handleImportCSV = async () => {
        if (!csvFile) return;
        try {
            setWorking(true);
            setUploadStatus('uploading');
            // Parse CSV and extract assignments
            const text = await csvFile.text();
            const lines = text.split('\n').filter(l => l.trim());
            // lines expected: header + rows with judgeId,teamId
            const assignments = lines.slice(1).map(line => {
                const [judgeId, teamId] = line.split(',').map(s => s.trim());
                return { judgeId, teamId };
            });
            // send batch to backend as array of {judgeId, teamId}
            if (assignments.length > 0) {
                await adminService.assignTeamsToJudges(assignments, selectedHackathonId);
            }
            setUploadStatus('success');
            setMessage('CSV import successful');
            await load();
            setCsvFile(null);
        } catch (e: any) {
            setError(e?.message || 'Failed to import CSV');
            setUploadStatus('idle');
        } finally {
            setWorking(false);
        }
    };

    // Conflict Detection Logic
    const conflicts = [
        ...assignments.filter(a => a.load > a.maxLoad).map(a => ({
            id: `load-${a.id}`,
            judge: a.judge,
            type: 'Overload',
            desc: `Assigned ${a.load} teams (Max: ${a.maxLoad}). Quality of evaluation may suffer.`
        })),
        // Hardcoded Conflict of Interest Example
        ...assignments.filter(a => a.judge === 'James Wilson' && a.teams.includes('GreenGen')).map(a => ({
            id: `coi-${a.id}`,
            judge: a.judge,
            type: 'Conflict of Interest',
            desc: 'Judge listed as "Mentor" for team GreenGen in registration data.'
        }))
    ];

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto pb-12">
                
                {/* Header & Context */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-heading text-gray-900">Assignments Orchestration</h1>
                        <p className="text-gray-500">Manage judge-team mappings, balance workloads, and ensure fair coverage.</p>
                    </div>
                    <select value={selectedHackathonId || ''} onChange={(e) => {
                            const val = e.target.value || undefined;
                            if (!val) return setSelectedHackathonId(undefined);
                            // Defensive: dropdown value should be id, but if not, try to resolve by name
                            const byId = hackathons.find(h => String(h.id) === val);
                            if (byId) return setSelectedHackathonId(byId.id);
                            const byName = hackathons.find(h => (h.name || h.title || '').toLowerCase() === String(val).toLowerCase());
                            if (byName) return setSelectedHackathonId(byName.id);
                            // fallback: set raw value
                            setSelectedHackathonId(val);
                        }} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:border-[#5425FF] shadow-sm">
                        <option value="">Context: All</option>
                        {hackathons.map((h) => (
                            <option key={h.id} value={h.id}>{h.name || h.title || h.id}</option>
                        ))}
                    </select>
                </div>

                {/* --- KPI Cards --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Available Judges</div>
                        <div className="text-2xl font-heading text-gray-900">{kpis.judges}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Total Assigned</div>
                        <div className="text-2xl font-heading text-blue-600">{kpis.assigned}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Completed</div>
                        <div className="text-2xl font-heading text-green-600">{kpis.completed}</div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Pending</div>
                        <div className="text-2xl font-heading text-amber-500">{kpis.pending}</div>
                    </div>
                </div>

                {/* --- Assignment Method Selector --- */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Assignment Method</h3>
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-xl font-bold text-gray-700 hover:border-[#5425FF] flex items-center gap-2 transition-colors"
                            >
                                {activeTab === 'manual' && <><MousePointerClick size={18} className="text-emerald-500" /> Manual Assign</>}
                                {activeTab === 'csv' && <><FileUp size={18} className="text-blue-500" /> CSV Import</>}
                                {activeTab === 'bulk' && <><ListChecks size={18} className="text-purple-500" /> Bulk Multi-Select</>}
                                {activeTab === 'reassign' && <><Repeat size={18} className="text-orange-500" /> Reassign Team</>}
                                {activeTab === 'autobalance' && <><Scale size={18} className="text-amber-500" /> Auto-Balance</>}
                                <ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                                    <button
                                        onClick={() => { setActiveTab('manual'); setDropdownOpen(false); }}
                                        className="w-full px-4 py-3 text-left hover:bg-emerald-50 flex items-center gap-3 transition-colors border-b border-gray-100"
                                    >
                                        <MousePointerClick size={18} className="text-emerald-500" />
                                        <span className="font-bold text-gray-700">Manual Assign</span>
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('csv'); setDropdownOpen(false); }}
                                        className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-gray-100"
                                    >
                                        <FileUp size={18} className="text-blue-500" />
                                        <span className="font-bold text-gray-700">CSV Import</span>
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('bulk'); setDropdownOpen(false); }}
                                        className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center gap-3 transition-colors border-b border-gray-100"
                                    >
                                        <ListChecks size={18} className="text-purple-500" />
                                        <span className="font-bold text-gray-700">Bulk Multi-Select</span>
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('reassign'); setDropdownOpen(false); }}
                                        className="w-full px-4 py-3 text-left hover:bg-orange-50 flex items-center gap-3 transition-colors border-b border-gray-100"
                                    >
                                        <Repeat size={18} className="text-orange-500" />
                                        <span className="font-bold text-gray-700">Reassign Team</span>
                                    </button>
                                    <button
                                        onClick={() => { setActiveTab('autobalance'); setDropdownOpen(false); }}
                                        className="w-full px-4 py-3 text-left hover:bg-amber-50 flex items-center gap-3 transition-colors"
                                    >
                                        <Scale size={18} className="text-amber-500" />
                                        <span className="font-bold text-gray-700">Auto-Balance</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Manual Assign Form */}
                    {activeTab === 'manual' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Judge</label>
                                    <select
                                        value={manualSelection.judge}
                                        onChange={(e) => setManualSelection({ ...manualSelection, judge: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#5425FF]"
                                    >
                                        <option value="">Choose a judge...</option>
                                        {judges.map((j) => (
                                            <option key={j.id} value={j.id}>{j.name || j.email || j.id}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Team</label>
                                    <select
                                        value={manualSelection.team}
                                        onChange={(e) => setManualSelection({ ...manualSelection, team: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#5425FF]"
                                    >
                                        <option value="">Choose a team...</option>
                                        {teams.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name || t.id}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleManualAssign}
                                disabled={!manualSelection.judge || !manualSelection.team || working}
                                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {working ? 'Assigning...' : 'Assign Team'}
                            </button>
                        </div>
                    )}

                    {/* CSV Import Form */}
                    {activeTab === 'csv' && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                                <FileUp size={48} className="mx-auto text-blue-500 mb-4" />
                                <p className="text-sm text-gray-600 mb-4">Upload a CSV file with columns: judgeId, teamId</p>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                                    className="block mx-auto"
                                />
                                {csvFile && <p className="text-sm text-green-600 mt-2">File: {csvFile.name}</p>}
                            </div>
                            <button
                                onClick={handleImportCSV}
                                disabled={!csvFile || working}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {working ? 'Importing...' : 'Import Assignments'}
                            </button>
                        </div>
                    )}

                    {/* Bulk Multi-Select Form */}
                    {activeTab === 'bulk' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Select Judge</label>
                                <select
                                    value={manualSelection.judge}
                                    onChange={(e) => setManualSelection({ ...manualSelection, judge: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#5425FF]"
                                >
                                    <option value="">Choose a judge...</option>
                                    {judges.map((j) => (
                                        <option key={j.id} value={j.id}>{j.name || j.email || j.id}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Select Teams (multiple)</label>
                                <div className="border border-gray-300 rounded-xl p-4 max-h-64 overflow-y-auto space-y-2">
                                    {teams.map((t) => (
                                        <label key={t.id} className="flex items-center gap-2 p-2 hover:bg-purple-50 rounded-lg cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedTeams.includes(t.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedTeams([...selectedTeams, t.id]);
                                                    } else {
                                                        setSelectedTeams(selectedTeams.filter(id => id !== t.id));
                                                    }
                                                }}
                                                className="w-4 h-4 text-purple-600"
                                            />
                                            <span className="text-sm font-medium text-gray-700">{t.name || t.id}</span>
                                        </label>
                                    ))}
                                </div>
                                {selectedTeams.length > 0 && (
                                    <p className="text-sm text-purple-600 mt-2">{selectedTeams.length} team(s) selected</p>
                                )}
                            </div>
                            <button
                                onClick={handleBulkAssign}
                                disabled={!manualSelection.judge || selectedTeams.length === 0 || working}
                                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {working ? 'Assigning...' : `Assign ${selectedTeams.length} Team(s)`}
                            </button>
                        </div>
                    )}

                    {/* Reassign Team Form */}
                    {activeTab === 'reassign' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Team</label>
                                    <select
                                        value={reassignData.teamId}
                                        onChange={(e) => setReassignData({ ...reassignData, teamId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#5425FF]"
                                    >
                                        <option value="">Select team...</option>
                                        {teams.map((t) => (
                                            <option key={t.id} value={t.id}>{t.name || t.id}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">From Judge</label>
                                    <select
                                        value={reassignData.oldJudgeId}
                                        onChange={(e) => setReassignData({ ...reassignData, oldJudgeId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#5425FF]"
                                    >
                                        <option value="">Select judge...</option>
                                        {judges.map((j) => (
                                            <option key={j.id} value={j.id}>{j.name || j.email || j.id}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">To Judge</label>
                                    <select
                                        value={reassignData.newJudgeId}
                                        onChange={(e) => setReassignData({ ...reassignData, newJudgeId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#5425FF]"
                                    >
                                        <option value="">Select judge...</option>
                                        {judges.map((j) => (
                                            <option key={j.id} value={j.id}>{j.name || j.email || j.id}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleReassign}
                                disabled={!reassignData.teamId || !reassignData.oldJudgeId || !reassignData.newJudgeId || working}
                                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {working ? 'Reassigning...' : 'Reassign Team'}
                            </button>
                        </div>
                    )}

                    {/* Auto-Balance Info */}
                    {activeTab === 'autobalance' && (
                        <div className="space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <Scale size={32} className="text-amber-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-amber-900 mb-2">Automated Workload Distribution</h4>
                                        <p className="text-sm text-amber-700 mb-4">
                                            This will evenly distribute all assigned teams across active judges using a round-robin algorithm.
                                            Current assignments will be cleared and redistributed.
                                        </p>
                                        <ul className="text-xs text-amber-600 space-y-1 mb-4">
                                            <li>• Balances workload across judges</li>
                                            <li>• Respects judge capacity limits</li>
                                            <li>• Maintains fairness in distribution</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleAutoBalance}
                                disabled={working}
                                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                            >
                                <Zap size={18} />
                                {working ? 'Balancing...' : 'Run Auto-Balance'}
                            </button>
                        </div>
                    )}

                    {/* Status Messages */}
                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                            <AlertTriangle size={16} />
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            {message}
                        </div>
                    )}
                </div>

                {/* --- Assignment Matrix --- */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Users size={18} /> Assignment Matrix
                        </h3>
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-green-500"></span> Live Sync
                             <button onClick={() => load()} className="p-1 hover:bg-gray-200 rounded"><RefreshCw size={14}/></button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/4">Evaluator</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider w-1/6">Load Capacity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Teams</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {assignments.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">{row.judge}</div>
                                            <div className="text-xs text-gray-500">{row.status}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden max-w-[100px]">
                                                    <div 
                                                        className={`h-full rounded-full ${row.load > row.maxLoad ? 'bg-red-500' : 'bg-blue-500'}`}
                                                        style={{width: `${Math.min((row.load / row.maxLoad) * 100, 100)}%`}}
                                                    ></div>
                                                </div>
                                                <span className={`text-xs font-bold ${row.load > row.maxLoad ? 'text-red-500' : 'text-gray-600'}`}>
                                                    {row.load}/{row.maxLoad}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {row.teams && row.teams.length > 0 ? row.teams.map((team: any, i: number) => (
                                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold border border-gray-200 flex items-center gap-1 group cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors">
                                                        {typeof team === 'string' ? team : team.name || team.id}
                                                    </span>
                                                )) : (
                                                    <span className="text-xs text-gray-400 italic">No active assignments</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-gray-900 rounded-lg">
                                                <MoreHorizontal size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* --- Conflict / Rules Widget --- */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex items-start gap-4">
                        <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm"><AlertCircle size={20}/></div>
                        <div>
                            <h4 className="font-bold text-blue-900 mb-1">Assignment Rules Active</h4>
                            <p className="text-sm text-blue-700">Conflict of Interest checking is enabled. Judges cannot be assigned to teams from their own organization.</p>
                        </div>
                    </div>
                    
                    <div 
                        onClick={() => setConflictModalOpen(true)}
                        className={`bg-white rounded-2xl p-6 border shadow-sm flex items-center justify-between cursor-pointer group transition-colors ${
                            conflicts.length > 0 ? 'border-red-200 hover:border-red-400' : 'border-gray-200 hover:border-[#5425FF]'
                        }`}
                    >
                        <div>
                            <h4 className={`font-bold mb-1 ${conflicts.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                {conflicts.length > 0 ? 'Conflicts Detected' : 'View Conflict Report'}
                            </h4>
                            <p className="text-sm text-gray-500">
                                {conflicts.length > 0 ? `${conflicts.length} potential issues detected in current matrix.` : 'No critical issues found.'}
                            </p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                            conflicts.length > 0 ? 'bg-red-50 text-red-500 group-hover:bg-red-100' : 'bg-gray-50 text-gray-400 group-hover:bg-[#5425FF] group-hover:text-white'
                        }`}>
                            <ArrowRight size={20} />
                        </div>
                    </div>
                </div>

                {/* --- Conflict Report Modal --- */}
                {isConflictModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Conflict Intelligence</h2>
                                        <p className="text-xs text-gray-500">Real-time issues in assignment matrix</p>
                                    </div>
                                </div>
                                <button onClick={() => setConflictModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                {conflicts.length > 0 ? (
                                    conflicts.map((c) => (
                                        <div key={c.id} className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-4">
                                            <div className="mt-1 text-red-600">
                                                <AlertCircle size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-gray-900">{c.judge}</h4>
                                                    <span className="text-[10px] font-bold text-red-600 uppercase bg-white px-2 py-0.5 rounded border border-red-100">{c.type}</span>
                                                </div>
                                                <p className="text-sm text-red-800">{c.desc}</p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setConflictModalOpen(false);
                                                    setManualSelection(prev => ({...prev, judge: c.judge}));
                                                    setManualModalOpen(true);
                                                }}
                                                className="text-xs font-bold text-gray-600 underline hover:text-gray-900"
                                            >
                                                Fix
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 size={32} />
                                        </div>
                                        <h3 className="font-bold text-gray-900">All Systems Nominal</h3>
                                        <p className="text-gray-500 text-sm">No conflicts detected in the current assignments.</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end gap-3">
                                <button onClick={() => setConflictModalOpen(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                                    Dismiss
                                </button>
                                {conflicts.length > 0 && (
                                    <button 
                                        onClick={() => {
                                            setConflictModalOpen(false);
                                            handleAutoBalance();
                                        }}
                                        className="px-5 py-2.5 bg-[#5425FF] text-white rounded-xl font-bold hover:bg-[#4015D1] transition-colors flex items-center gap-2"
                                    >
                                        <Zap size={16} /> Auto-Fix Conflicts
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
};

export default AdminAssignments;