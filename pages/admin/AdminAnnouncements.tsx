import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Megaphone, Send, Clock, Users, Calendar, AlertCircle, CheckCircle2, History, X } from 'lucide-react';
import { adminService } from '../../services/admin.service';

const AdminAnnouncements: React.FC = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [selectedHackathonId, setSelectedHackathonId] = useState<string | undefined>(
        localStorage.getItem('selectedHackathonId') || undefined
    );
    const [audience, setAudience] = useState('participants');
    const [priority, setPriority] = useState('Normal');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    // Broadcast modal state
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    const [broadcastType, setBroadcastType] = useState<'now' | 'schedule' | null>(null);
    const [scheduleDate, setScheduleDate] = useState('');
    const [scheduleTime, setScheduleTime] = useState('');
    
    // Data loading
    const [hackathons, setHackathons] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const [lastFetchCount, setLastFetchCount] = useState<number | null>(null);
    const composeRef = useRef<HTMLDivElement | null>(null);
    const [historyHeight, setHistoryHeight] = useState<number | undefined>(undefined);

    useEffect(() => {
        loadHackathons();
        loadAnnouncements(1, false);
    }, []);

    const loadHackathons = async () => {
        try {
            const res = await adminService.getMyHackathons();
            setHackathons(res?.hackathons || res || []);
        } catch (e) {
            console.error('Failed to load hackathons:', e);
        }
    };

    const loadAnnouncements = async (pageToLoad = 1, append = false) => {
        try {
            if (!append) setLoading(true);
            setError(null);
            // Pass hackathonId only if specifically selected (not 'all' or undefined)
            const hackId = selectedHackathonId && selectedHackathonId !== 'all' ? selectedHackathonId : undefined;
            const res = await adminService.getAnnouncements(pageToLoad, pageSize, hackId);
            const fetched = res?.announcements || res || [];
            setLastFetchCount(Array.isArray(fetched) ? fetched.length : 0);
            setAnnouncements(prev => (append ? [...prev, ...(Array.isArray(fetched) ? fetched : [])] : (Array.isArray(fetched) ? fetched : [])));
            setPage(pageToLoad);
        } catch (e: any) {
            setError(e.message || 'Failed to load announcements');
        } finally {
            setLoading(false);
        }
    };

    const handleBroadcastClick = () => {
        if (!title || !message) {
            setError('Please fill in subject and message');
            return;
        }
        if (!selectedHackathonId || selectedHackathonId === 'all') {
            setError('Select a specific hackathon before broadcasting announcements.');
            return;
        }
        setShowBroadcastModal(true);
    };

    const handleSendNow = async () => {
        setError(null);
        setSuccessMessage(null);
        setIsSending(true);
        setBroadcastType('now');
        
        try {
            // First, create the announcement resource so we have an ID to send
            const createPayload: any = {
                title,
                content: message,
                audience,
                priority: priority.toLowerCase(),
            };
            if (selectedHackathonId) createPayload.hackathonId = selectedHackathonId;

            console.debug('Creating announcement', { selectedHackathonId, createPayload });
            const created = await adminService.createAnnouncement(createPayload, selectedHackathonId);
            console.debug('Create response', created);
            const announcementId = created?.id || created?.announcement?.id || created?.announcementId;
            if (!announcementId) throw new Error('Announcement ID not returned from create API');

            // Now request the backend to send the created announcement
            await adminService.sendAnnouncement({ announcementId }, selectedHackathonId);
            setSuccessMessage('Announcement sent successfully!');
            setTitle('');
            setMessage('');
            setShowBroadcastModal(false);
            setBroadcastType(null);
            await loadAnnouncements(1, false);
        } catch (e: any) {
            setError(e.message || 'Failed to send announcement');
        } finally {
            setIsSending(false);
        }
    };

    const handleSchedule = async () => {
        if (!scheduleDate || !scheduleTime) {
            setError('Please select date and time for scheduling');
            return;
        }
        
        setError(null);
        setSuccessMessage(null);
        setIsSending(true);
        setBroadcastType('schedule');
        
        try {
            const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
            
            // Create announcement first
            const createPayload: any = {
                title,
                content: message,
                audience,
                priority: priority.toLowerCase(),
            };
            if (selectedHackathonId) createPayload.hackathonId = selectedHackathonId;

            console.debug('Creating announcement for schedule', { selectedHackathonId, createPayload });
            const created = await adminService.createAnnouncement(createPayload, selectedHackathonId);
            console.debug('Create response', created);
            const announcementId = created?.id || created?.announcement?.id || created?.announcementId;
            if (!announcementId) throw new Error('Announcement ID not returned from create API');

            // Then schedule it (backend expects `scheduledAt` camelCase)
            await adminService.scheduleAnnouncement({ announcementId, scheduledAt }, selectedHackathonId);
            setSuccessMessage('Announcement scheduled successfully!');
            setTitle('');
            setMessage('');
            setScheduleDate('');
            setScheduleTime('');
            setShowBroadcastModal(false);
            setBroadcastType(null);
            await loadAnnouncements(1, false);
        } catch (e: any) {
            setError(e.message || 'Failed to schedule announcement');
        } finally {
            setIsSending(false);
        }
    };

    // Keep history sidebar height equal to compose card
    useLayoutEffect(() => {
        const measure = () => {
            if (composeRef.current) setHistoryHeight(composeRef.current.clientHeight);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [composeRef, announcements, loading]);

    // Reload announcements when selected hackathon changes
    useEffect(() => {
        setAnnouncements([]);
        setPage(1);
        loadAnnouncements(1, false);
    }, [selectedHackathonId]);

    const handleViewMore = async () => {
        const next = page + 1;
        await loadAnnouncements(next, true);
    };

    const formatDate = (date: string) => {
        if (!date) return '—';
        try {
            return new Date(date).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return date;
        }
    };

    const getStatusBadge = (announcement: any) => {
        const now = new Date();
        const scheduledAt = announcement.scheduled_at || announcement.scheduledAt;
        const sentAt = announcement.sent_at || announcement.sentAt;
        
        if (sentAt) {
            return <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 whitespace-nowrap">Sent</span>;
        }
        
        if (scheduledAt) {
            const scheduleTime = new Date(scheduledAt);
            if (scheduleTime > now) {
                return <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200 whitespace-nowrap">Scheduled</span>;
            } else {
                return <span className="text-[10px] font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200 whitespace-nowrap">Pending</span>;
            }
        }
        
        return <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-100 whitespace-nowrap">Draft</span>;
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto pb-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-heading text-gray-900">Broadcast Center</h1>
                    <p className="text-gray-500">Send announcements to participants, judges, or specific hackathon groups.</p>
                </div>

                {(error || successMessage) && (
                    <div
                        className={`mb-6 px-4 py-3 rounded-xl flex items-center gap-2 border ${
                            error ? 'bg-red-50 border-red-200 text-red-800' : 'bg-green-50 border-green-200 text-green-800'
                        }`}
                    >
                        {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                        {error || successMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Compose Card */}
                    <div className="lg:col-span-2">
                        <div ref={composeRef} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-900/10 text-gray-900 rounded-xl flex items-center justify-center">
                                    <Megaphone size={20} />
                                </div>
                                <h3 className="font-heading text-lg text-gray-900">Compose Message</h3>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                {/* Targets */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Target Event</label>
                                        <div className="relative">
                                            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <select 
                                                value={selectedHackathonId || ''}
                                                onChange={(e) => {
                                                    const v = e.target.value || undefined;
                                                    setSelectedHackathonId(v);
                                                    if (v) localStorage.setItem('selectedHackathonId', v);
                                                    else localStorage.removeItem('selectedHackathonId');
                                                }}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 appearance-none text-gray-900 font-medium"
                                            >
                                                <option value="">All Events</option>
                                                {hackathons.map((h: any) => (
                                                    <option key={h.id} value={h.id}>
                                                        {h.name || h.title || h.id}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Audience</label>
                                        <div className="relative">
                                            <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <select 
                                                value={audience}
                                                onChange={(e) => setAudience(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 appearance-none text-gray-900 font-medium"
                                            >
                                                <option value="participants">Participants</option>
                                                <option value="judges">Judges</option>
                                                <option value="all">All</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. Submission Deadline Extended"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                    <textarea 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={5}
                                        placeholder="Type your announcement here..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 resize-none text-gray-700"
                                    ></textarea>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="priority" 
                                                checked={priority === 'Normal'}
                                                onChange={() => setPriority('Normal')}
                                                className="text-gray-900 focus:ring-gray-900" 
                                            />
                                            <span className="text-sm font-medium text-gray-600">Normal</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="priority" 
                                                checked={priority === 'High'}
                                                onChange={() => setPriority('High')}
                                                className="text-red-600 focus:ring-red-600" 
                                            />
                                            <span className="text-sm font-bold text-red-600 flex items-center gap-1">
                                                <AlertCircle size={14} /> High Priority
                                            </span>
                                        </label>
                                    </div>
                                    <button 
                                        onClick={handleBroadcastClick}
                                        disabled={!title || !message || !selectedHackathonId}
                                        className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={18} /> Broadcast
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm h-full">
                            <h3 className="font-heading text-lg text-gray-900 mb-6 flex items-center gap-2">
                                <History size={20} className="text-gray-400" /> Recent History
                            </h3>
                            
                            {loading ? (
                                <div className="py-10 text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3" />
                                    <span className="text-gray-500 text-sm">Loading...</span>
                                </div>
                            ) : announcements.length === 0 ? (
                                <div className="py-10 text-center text-gray-400 text-sm">No announcements yet</div>
                            ) : (
                                <div style={historyHeight ? { maxHeight: `${historyHeight}px`, overflowY: 'auto' } : undefined} className="space-y-4">
                                    {announcements.map((item: any) => {
                                        const scheduledAt = item.scheduled_at || item.scheduledAt;
                                        return (
                                            <div key={item.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-gray-900/30 transition-colors">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <div className="flex items-center gap-3">
                                                                                <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.title}</h4>
                                                                                {/* Priority badge */}
                                                                                {(() => {
                                                                                    const p = (item.priority || item.priority?.toString() || '').toString().toLowerCase();
                                                                                    if (!p) return null;
                                                                                    const isHigh = p === 'high';
                                                                                    return (
                                                                                        <div className={`flex items-center gap-2 text-[11px] font-semibold ${isHigh ? 'text-red-600' : 'text-blue-600'}`}>
                                                                                            <span className={`${isHigh ? 'bg-red-500' : 'bg-blue-500'} w-2 h-2 rounded-full inline-block`} />
                                                                                            <span>{isHigh ? 'High Priority' : 'Normal'}</span>
                                                                                        </div>
                                                                                    );
                                                                                })()}
                                                                            </div>
                                                                            {getStatusBadge(item)}
                                                                        </div>
                                                <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.message}</p>
                                                
                                                <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                                    <span className="bg-white px-2 py-1 rounded border border-gray-100">
                                                        {item.hackathon_name || 'All Events'}
                                                    </span>
                                                    <span className="bg-white px-2 py-1 rounded border border-gray-100">
                                                        {item.audience || 'All'}
                                                    </span>
                                                    {scheduledAt && (
                                                        <span className="bg-amber-50 px-2 py-1 rounded border border-amber-200 text-amber-700 flex items-center gap-1">
                                                            <Clock size={10} />
                                                            {formatDate(scheduledAt)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {/* View more button for pagination */}
                            {lastFetchCount === pageSize && (
                                <div className="mt-4 text-center">
                                    <button
                                        onClick={handleViewMore}
                                        disabled={loading}
                                        className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm hover:bg-gray-200 disabled:opacity-50"
                                    >
                                        {loading ? 'Loading...' : 'View more'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Broadcast Modal */}
                {showBroadcastModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h3 className="font-heading text-xl text-gray-900">Choose Broadcast Option</h3>
                                <button
                                    onClick={() => {
                                        setShowBroadcastModal(false);
                                        setBroadcastType(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-900"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-4">
                                {!broadcastType ? (
                                    <>
                                        <button
                                            onClick={() => setBroadcastType('now')}
                                            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <Send size={20} className="text-green-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">Send Now</h4>
                                                    <p className="text-sm text-gray-500">Broadcast immediately</p>
                                                </div>
                                            </div>
                                        </button>
                                        
                                        <button
                                            onClick={() => setBroadcastType('schedule')}
                                            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-gray-900 hover:bg-gray-50 transition-all text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                                    <Clock size={20} className="text-amber-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">Schedule</h4>
                                                    <p className="text-sm text-gray-500">Send at a specific time</p>
                                                </div>
                                            </div>
                                        </button>
                                    </>
                                ) : broadcastType === 'now' ? (
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                            <p className="text-sm text-gray-700">
                                                <strong>To:</strong> {audience.charAt(0).toUpperCase() + audience.slice(1)}
                                                {selectedHackathonId ? ` in ${hackathons.find(h => h.id === selectedHackathonId)?.name || 'selected hackathon'}` : ' in all hackathons'}
                                            </p>
                                            <p className="text-sm text-gray-700 mt-2">
                                                <strong>Subject:</strong> {title}
                                            </p>
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setBroadcastType(null)}
                                                disabled={isSending}
                                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleSendNow}
                                                disabled={isSending}
                                                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isSending ? (
                                                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Sending...</>
                                                ) : (
                                                    <><Send size={18} /> Send Now</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Schedule Date</label>
                                            <input
                                                type="date"
                                                value={scheduleDate}
                                                onChange={(e) => setScheduleDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Schedule Time</label>
                                            <input
                                                type="time"
                                                value={scheduleTime}
                                                onChange={(e) => setScheduleTime(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                            />
                                        </div>
                                        
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setBroadcastType(null)}
                                                disabled={isSending}
                                                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleSchedule}
                                                disabled={isSending || !scheduleDate || !scheduleTime}
                                                className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                {isSending ? (
                                                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Scheduling...</>
                                                ) : (
                                                    <><Clock size={18} /> Schedule</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminAnnouncements;