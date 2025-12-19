import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { FileClock, Search, Filter, Shield, AlertTriangle, CheckCircle2, Info, RefreshCw } from 'lucide-react';

const AdminAudit: React.FC = () => {
    // Mock Audit Data
    const [logs, setLogs] = useState([
        { id: 'l1', actor: 'Admin Director', action: 'Created Judge Account', target: 'james.wilson@aws.com', timestamp: '2 mins ago', severity: 'Info' },
        { id: 'l2', actor: 'Admin Director', action: 'Force Disqualified Team', target: 'Team CopyCat', timestamp: '1 hour ago', severity: 'Critical' },
        { id: 'l3', actor: 'System', action: 'Auto-Balanced Assignments', target: 'HackOnX 2025', timestamp: '3 hours ago', severity: 'Success' },
        { id: 'l4', actor: 'Admin User', action: 'Updated Hackathon Date', target: 'Global AI Challenge', timestamp: '5 hours ago', severity: 'Warning' },
        { id: 'l5', actor: 'Admin Director', action: 'Exported Submissions', target: 'CSV Download', timestamp: '1 day ago', severity: 'Info' },
        { id: 'l6', actor: 'System', action: 'Generated Conflict Report', target: 'Assignments Matrix', timestamp: '1 day ago', severity: 'Warning' },
    ]);

    const [filter, setFilter] = useState('All');

    const filteredLogs = filter === 'All' ? logs : logs.filter(l => l.severity === filter);

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

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-heading text-gray-900">System Logs</h1>
                        <p className="text-gray-500">Audit trail of all administrative actions and system events.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
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
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by actor or target..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]"
                        />
                    </div>
                </div>

                {/* Logs Table */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actor</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Target Entity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase border w-fit ${getBadgeStyle(log.severity)}`}>
                                                {getIcon(log.severity)}
                                                {log.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Shield size={14} className="text-gray-400" />
                                                <span className="font-bold text-gray-700 text-sm">{log.actor}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-gray-900 text-sm">{log.action}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                                {log.target}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-500 font-medium">
                                            {log.timestamp}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredLogs.length === 0 && (
                        <div className="p-12 text-center text-gray-500">No logs found matching this criteria.</div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAudit;