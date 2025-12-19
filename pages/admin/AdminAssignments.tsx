import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { 
    GitMerge, UploadCloud, Zap, Users, CheckCircle2, 
    MoreHorizontal, RefreshCw, AlertCircle, FileText, ArrowRight, X, Search, FileUp, AlertTriangle 
} from 'lucide-react';

const AdminAssignments: React.FC = () => {
    // --- Mock Data ---
    const [assignments, setAssignments] = useState([
        { id: 1, judge: 'Dr. Emily Smith', teams: ['Alpha Squad', 'NeuroNet'], load: 2, maxLoad: 5, status: 'Active' },
        { id: 2, judge: 'James Wilson', teams: ['GreenGen', 'EcoTrack', 'SolarAI'], load: 3, maxLoad: 5, status: 'Active' },
        { id: 3, judge: 'Sarah Chen', teams: [], load: 0, maxLoad: 5, status: 'Available' },
        { id: 4, judge: 'Michael Ross', teams: ['CyberShield'], load: 1, maxLoad: 5, status: 'Active' },
    ]);

    const [isManualModalOpen, setManualModalOpen] = useState(false);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [isConflictModalOpen, setConflictModalOpen] = useState(false);
    
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');
    const [manualSelection, setManualSelection] = useState({ judge: '', team: '' });

    // Computed KPIs
    const totalAssigned = assignments.reduce((acc, curr) => acc + curr.teams.length, 0);
    const judgesCount = assignments.length;
    // Mock progress
    const completedEval = 12; 
    const pendingEval = totalAssigned * 3 - completedEval; // Assuming 3 judges per team ideally, simplified here

    const kpis = {
        judges: judgesCount,
        assigned: totalAssigned,
        completed: completedEval,
        pending: pendingEval
    };

    // --- ALGORITHMS ---

    const handleAutoBalance = () => {
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
    };

    const handleImportCSV = () => {
        setUploadStatus('uploading');
        // Simulate parsing delay
        setTimeout(() => {
            setUploadStatus('success');
            // Mock: Add new unassigned teams or distribute them
            // For demo, we simply add 3 new teams to the first judge to create an imbalance (triggering need for auto-balance)
            const newTeams = ['Omega Protocol', 'SkyNet Systems', 'DeepBlue AI'];
            
            setAssignments(prev => {
                const updated = [...prev];
                if (updated[0]) {
                    updated[0].teams = [...updated[0].teams, ...newTeams];
                    updated[0].load = updated[0].teams.length;
                }
                return updated;
            });

            setTimeout(() => {
                setUploadStatus('idle');
                setImportModalOpen(false);
            }, 1000);
        }, 1500);
    };

    const handleManualAssign = () => {
        if (manualSelection.judge && manualSelection.team) {
            setAssignments(assignments.map(a => {
                if (a.judge === manualSelection.judge) {
                    return { ...a, teams: [...a.teams, manualSelection.team], load: a.load + 1 };
                }
                return a;
            }));
            setManualModalOpen(false);
            setManualSelection({ judge: '', team: '' });
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
                    <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 focus:outline-none focus:border-[#5425FF] shadow-sm">
                        <option>Context: HackOnX 2025</option>
                        <option>Context: Global AI Challenge</option>
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

                {/* --- Action Bar --- */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <button 
                        onClick={() => setManualModalOpen(true)}
                        className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:border-[#5425FF] hover:text-[#5425FF] flex items-center gap-2 shadow-sm transition-all"
                    >
                        <GitMerge size={18} /> Manual Assign
                    </button>
                    <button 
                        onClick={() => setImportModalOpen(true)}
                        className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <UploadCloud size={18} /> Import CSV
                    </button>
                    <button 
                        onClick={handleAutoBalance}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-[#5425FF] text-white rounded-xl font-bold hover:opacity-90 flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all ml-auto"
                    >
                        <Zap size={18} /> Auto-Balance Load
                    </button>
                </div>

                {/* --- Assignment Matrix --- */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Users size={18} /> Assignment Matrix
                        </h3>
                        <div className="text-xs text-gray-500 font-medium flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-green-500"></span> Live Sync
                             <button className="p-1 hover:bg-gray-200 rounded"><RefreshCw size={14}/></button>
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
                                                {row.teams.length > 0 ? row.teams.map((team, i) => (
                                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-bold border border-gray-200 flex items-center gap-1 group cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors">
                                                        {team}
                                                    </span>
                                                )) : (
                                                    <span className="text-xs text-gray-400 italic">No active assignments</span>
                                                )}
                                                <button 
                                                    onClick={() => {
                                                        setManualSelection({ ...manualSelection, judge: row.judge });
                                                        setManualModalOpen(true);
                                                    }}
                                                    className="w-6 h-6 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-[#5425FF] hover:border-[#5425FF] transition-colors"
                                                >
                                                    +
                                                </button>
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

                {/* --- Manual Assign Modal --- */}
                {isManualModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Manual Assignment</h2>
                                <button onClick={() => setManualModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Evaluator</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium"
                                        value={manualSelection.judge}
                                        onChange={(e) => setManualSelection({ ...manualSelection, judge: e.target.value })}
                                    >
                                        <option value="">Choose Judge...</option>
                                        {assignments.map(a => <option key={a.id} value={a.judge}>{a.judge} (Load: {a.load})</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Team</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                        <select 
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium appearance-none"
                                            value={manualSelection.team}
                                            onChange={(e) => setManualSelection({ ...manualSelection, team: e.target.value })}
                                        >
                                            <option value="">Search or Select Team...</option>
                                            <option value="Beta Builders">Beta Builders</option>
                                            <option value="Quantum Leap">Quantum Leap</option>
                                            <option value="Data Miners">Data Miners</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-800">
                                    <strong>Note:</strong> Manually assigning overrides the auto-balance algorithm. Ensure no conflicts exist.
                                </div>

                                <button 
                                    onClick={handleManualAssign}
                                    disabled={!manualSelection.judge || !manualSelection.team}
                                    className="w-full py-3.5 bg-[#5425FF] text-white rounded-xl font-bold hover:bg-[#4015D1] transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={18} /> Confirm Assignment
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- Import CSV Modal --- */}
                {isImportModalOpen && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900">Bulk Import Assignments</h2>
                                <button onClick={() => setImportModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            {uploadStatus === 'success' ? (
                                <div className="py-8">
                                    <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Import Successful</h3>
                                    <p className="text-gray-500 text-sm">3 new assignments added.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 mb-6 hover:bg-gray-50 transition-colors cursor-pointer group">
                                        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#5425FF]/10 group-hover:text-[#5425FF] transition-colors">
                                            <FileUp size={32} />
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">Click to upload CSV</p>
                                        <p className="text-xs text-gray-500 mt-1">or drag and drop file here</p>
                                    </div>
                                    
                                    <div className="text-left text-xs text-gray-500 bg-gray-50 p-4 rounded-xl mb-6">
                                        <strong>Required columns:</strong> Judge Email, Team Name, Hackathon ID.
                                    </div>

                                    <button 
                                        onClick={handleImportCSV}
                                        disabled={uploadStatus === 'uploading'}
                                        className="w-full py-3 bg-[#111827] text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                                    >
                                        {uploadStatus === 'uploading' ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Parsing...
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud size={18} /> Upload & Process
                                            </>
                                        )}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

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