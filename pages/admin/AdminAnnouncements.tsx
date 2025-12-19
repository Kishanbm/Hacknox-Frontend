import React, { useState } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Megaphone, Send, Clock, Users, Calendar, AlertCircle, CheckCircle2, History } from 'lucide-react';

const AdminAnnouncements: React.FC = () => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [targetEvent, setTargetEvent] = useState('All Events');
    const [audience, setAudience] = useState('All Participants');
    const [priority, setPriority] = useState('Normal');
    const [isSending, setIsSending] = useState(false);
    const [history, setHistory] = useState([
        { id: 1, title: 'Judging Has Started', message: 'Judges are now reviewing submissions.', target: 'HackOnX 2025', audience: 'All', time: '2 hours ago', status: 'Sent' },
        { id: 2, title: 'Deadline Extended', message: 'Submission deadline extended by 2 hours.', target: 'Global AI Challenge', audience: 'Team Leaders', time: '1 day ago', status: 'Sent' },
    ]);

    const handleSend = () => {
        if (!title || !message) return;
        setIsSending(true);
        setTimeout(() => {
            setHistory([{
                id: Date.now(),
                title,
                message,
                target: targetEvent,
                audience,
                time: 'Just now',
                status: 'Sent'
            }, ...history]);
            setTitle('');
            setMessage('');
            setIsSending(false);
        }, 1500);
    };

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto pb-12">
                <div className="mb-8">
                    <h1 className="text-3xl font-heading text-gray-900">Broadcast Center</h1>
                    <p className="text-gray-500">Send announcements to participants, judges, or specific hackathon groups.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Compose Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#5425FF]/10 text-[#5425FF] rounded-xl flex items-center justify-center">
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
                                                value={targetEvent}
                                                onChange={(e) => setTargetEvent(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] appearance-none text-gray-900 font-medium"
                                            >
                                                <option>All Events</option>
                                                <option>HackOnX 2025</option>
                                                <option>Global AI Challenge</option>
                                                <option>Sustainable Future</option>
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
                                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] appearance-none text-gray-900 font-medium"
                                            >
                                                <option>All Participants</option>
                                                <option>Team Leaders Only</option>
                                                <option>Judges Only</option>
                                                <option>Mentors Only</option>
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
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                    <textarea 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        rows={5}
                                        placeholder="Type your announcement here..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF] resize-none text-gray-700"
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
                                                className="text-[#5425FF] focus:ring-[#5425FF]" 
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
                                        onClick={handleSend}
                                        disabled={isSending || !title || !message}
                                        className="px-8 py-3 bg-[#111827] text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSending ? (
                                            <>Sending...</>
                                        ) : (
                                            <><Send size={18} /> Broadcast</>
                                        )}
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
                            
                            <div className="space-y-4">
                                {history.map((item) => (
                                    <div key={item.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#5425FF]/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900 text-sm leading-tight">{item.title}</h4>
                                            <span className="text-[10px] font-bold text-gray-400 bg-white px-2 py-1 rounded border border-gray-100 whitespace-nowrap">
                                                {item.time}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{item.message}</p>
                                        
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                            <span className="bg-white px-2 py-1 rounded border border-gray-100">{item.target}</span>
                                            <span className="bg-white px-2 py-1 rounded border border-gray-100">{item.audience}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminAnnouncements;