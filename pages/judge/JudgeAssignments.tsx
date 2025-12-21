import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { JudgeLayout } from '../../components/JudgeLayout';
import { Search, Filter, Clock, CheckCircle2, ChevronRight, FileText, ArrowRight } from 'lucide-react';
import { judgeService, JudgeAssignment } from '../../services/judge.service';

const JudgeAssignments: React.FC = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState('All');
    const [hackathonFilter, setHackathonFilter] = useState('All Events');
    const [assignments, setAssignments] = useState<JudgeAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<{id: string, title: string}[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch events for the dropdown
                const eventsData = await judgeService.getEvents();
                // Controller returns: { message, events: [...] }
                setEvents(eventsData.events || eventsData || []);

                // Fetch assignments
                const response = await judgeService.getAssignedTeams(1, 100, hackathonFilter === 'All Events' ? undefined : hackathonFilter);
                setAssignments(response.teams);
            } catch (error) {
                console.error("Failed to fetch assignments", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [hackathonFilter]);

    const filtered = assignments.filter(a => {
        const evalStatusRaw = (a as any).evaluationStatus ?? (a as any).evaluation?.[0]?.status ?? 'pending';

        let uiStatus = 'Pending';
        if (evalStatusRaw === 'draft') uiStatus = 'Draft';
        if (evalStatusRaw === 'submitted') uiStatus = 'Completed';
        if (evalStatusRaw === 'pending') uiStatus = 'Pending';

        const matchesStatus = statusFilter === 'All' ? true : 
                              statusFilter === 'Pending' ? (uiStatus === 'Pending' || uiStatus === 'Draft') : 
                              uiStatus === statusFilter;
        
        return matchesStatus;
    });

    return (
        <JudgeLayout>
            <div className="max-w-7xl mx-auto pb-20 lg:pb-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Evaluation Queue</h1>
                        <p className="text-gray-500">Select a submission to begin grading.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search projects..." 
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] focus:ring-1 focus:ring-[#5425FF] transition-all text-sm"
                            />
                        </div>
                        <select 
                            value={hackathonFilter}
                            onChange={(e) => {
                                const val = e.target.value;
                                setHackathonFilter(val);
                                // Store in localStorage so evaluation endpoints can use it
                                if (val === 'All Events') {
                                    localStorage.removeItem('selectedHackathonId');
                                } else {
                                    localStorage.setItem('selectedHackathonId', val);
                                }
                            }}
                            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 focus:outline-none focus:border-[#5425FF] text-sm font-bold appearance-none cursor-pointer hover:bg-gray-50"
                        >
                            <option value="All Events">All Events</option>
                            {events.map(h => <option key={h.id} value={h.id}>{h.name || h.title}</option>)}
                        </select>
                    </div>
                </div>

                {/* Tabs - Scrollable */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
                    {['All', 'Pending', 'Completed'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                                statusFilter === tab 
                                ? 'bg-[#5425FF] text-white shadow-md shadow-[#5425FF]/20' 
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Project</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Hackathon</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Deadline</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Score</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            Loading assignments...
                                        </td>
                                    </tr>
                                ) : filtered.length > 0 ? (
                                    filtered.map((item, idx) => {
                                        // Support both backend shapes: flattened (new) and nested (old)
                                        const evalStatusRaw = (item as any).evaluationStatus ?? (item as any).evaluation?.[0]?.status ?? 'pending';
                                        let uiStatus = 'Pending';
                                        if (evalStatusRaw === 'draft') uiStatus = 'Draft';
                                        if (evalStatusRaw === 'submitted') uiStatus = 'Completed';

                                        const score = (item as any).evaluationScore ?? (item as any).evaluation?.[0]?.score ?? '-';

                                        const projectTitle = (item as any).teamName ?? (item as any).team?.submission?.[0]?.title ?? (item as any).team?.name ?? 'Untitled';
                                        const teamName = (item as any).teamName ?? (item as any).team?.name ?? '';
                                        const hackathonTitle = (item as any).hackathonName ?? (item as any).hackathon?.name ?? (item as any).hackathon?.title ?? 'Unknown Event';
                                        const category = (item as any).projectCategory ?? (item as any).team?.project_category ?? 'General';
                                        const deadline = ((item as any).submissionStatus === 'submitted' || (item as any).evaluationSubmittedAt) ? 'Submitted' : 'Open';
                                        const rowKey = (item as any).assignmentId ?? (item as any).id ?? (item as any).teamId ?? idx;
                                        const teamIdForRoute = (item as any).teamId ?? (item as any).team?.id;

                                        return (
                                        <tr key={rowKey} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{projectTitle}</div>
                                                        <div className="text-xs text-gray-500">{teamName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-600 whitespace-nowrap">
                                                {hackathonTitle}
                                                <div className="text-xs text-gray-400">{category}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`flex items-center gap-1.5 text-sm font-bold ${
                                                    uiStatus === 'Completed' ? 'text-green-600' : 
                                                    uiStatus === 'Draft' ? 'text-amber-600' : 'text-gray-600'
                                                }`}>
                                                    {uiStatus === 'Completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                                    {uiStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium whitespace-nowrap">
                                                {deadline}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap">
                                                {score}
                                            </td>
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <button 
                                                    onClick={() => navigate(`/judge/evaluate/${teamIdForRoute}`)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ml-auto ${
                                                        uiStatus === 'Completed' 
                                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                                                        : 'bg-[#5425FF] text-white hover:bg-[#4015D1] shadow-lg shadow-[#5425FF]/20'
                                                    }`}>
                                                    {uiStatus === 'Completed' ? 'Edit Score' : 'Grade Now'}
                                                    {uiStatus !== 'Completed' && <ArrowRight size={12} />}
                                                </button>
                                            </td>
                                        </tr>
                                    )})
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            No assignments found matching filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </JudgeLayout>
    );
};

export default JudgeAssignments;
