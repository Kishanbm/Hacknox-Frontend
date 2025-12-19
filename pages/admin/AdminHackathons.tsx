import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { Plus, Calendar, MapPin, Users, Edit, MoreVertical, PlayCircle, PauseCircle, Trash2, Search, Filter } from 'lucide-react';

const AdminHackathons: React.FC = () => {
    const navigate = useNavigate();
    const [filter, setFilter] = useState('All');

    // Mock Data with State
    const [hackathons, setHackathons] = useState([
        {
            id: 'h1',
            name: 'HackOnX 2025',
            status: 'Live',
            dates: 'Mar 15 - 17, 2025',
            location: 'Bengaluru (Offline)',
            teams: 124,
            judges: 12,
            gradient: 'from-purple-600 to-indigo-600'
        },
        {
            id: 'h2',
            name: 'Global AI Challenge',
            status: 'Upcoming',
            dates: 'Apr 10 - 12, 2025',
            location: 'Remote',
            teams: 450,
            judges: 8,
            gradient: 'from-blue-600 to-cyan-600'
        },
        {
            id: 'h3',
            name: 'Sustainable Future',
            status: 'Draft',
            dates: 'May 05 - 08, 2025',
            location: 'Hybrid',
            teams: 0,
            judges: 0,
            gradient: 'from-gray-500 to-gray-600'
        }
    ]);

    const toggleStatus = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setHackathons(hackathons.map(h => {
            if (h.id === id) {
                const newStatus = h.status === 'Live' ? 'Paused' : 'Live';
                return { ...h, status: newStatus };
            }
            return h;
        }));
    };

    const deleteHackathon = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(window.confirm('Are you sure you want to delete this event?')) {
            setHackathons(hackathons.filter(h => h.id !== id));
        }
    };
    
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate('/admin/hackathons/create');
    };

    const filteredHackathons = filter === 'All' ? hackathons : hackathons.filter(h => h.status === filter);

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-heading text-gray-900">Event Manager</h1>
                        <p className="text-gray-500">Create, monitor, and control hackathon lifecycles.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/hackathons/create')}
                        className="px-6 py-3 bg-[#5425FF] text-white rounded-xl font-bold hover:bg-[#4015D1] transition-colors flex items-center gap-2 shadow-lg shadow-[#5425FF]/20 group"
                    >
                        <Plus size={20} className="text-[#24FF00] group-hover:text-white transition-colors" /> Create Hackathon
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <div className="flex bg-white p-1 rounded-xl border border-gray-200">
                        {['All', 'Live', 'Upcoming', 'Draft', 'Paused'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                    filter === status 
                                    ? 'bg-gray-900 text-white shadow-sm' 
                                    : 'text-gray-500 hover:bg-gray-50'
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
                            placeholder="Search events..." 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#5425FF]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {filteredHackathons.map((hackathon) => (
                        <div 
                            key={hackathon.id} 
                            onClick={() => navigate(`/admin/hackathons/${hackathon.id}`)}
                            className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row group transition-all hover:border-[#5425FF]/30 cursor-pointer"
                        >
                            {/* Visual Strip */}
                            <div className={`w-full md:w-4 bg-gradient-to-b ${hackathon.gradient}`}></div>
                            
                            <div className="p-6 flex-1 flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#5425FF] transition-colors">{hackathon.name}</h3>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border flex items-center gap-1.5 ${
                                            hackathon.status === 'Live' ? 'bg-[#24FF00]/10 text-green-700 border-[#24FF00]/20' : 
                                            hackathon.status === 'Draft' ? 'bg-gray-100 text-gray-600 border-gray-200' : 
                                            hackathon.status === 'Paused' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                            'bg-blue-50 text-blue-600 border-blue-200'
                                        }`}>
                                            {hackathon.status === 'Live' && <div className="w-1.5 h-1.5 rounded-full bg-[#24FF00] animate-pulse"></div>}
                                            {hackathon.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5"><Calendar size={16} /> {hackathon.dates}</span>
                                        <span className="flex items-center gap-1.5"><MapPin size={16} /> {hackathon.location}</span>
                                    </div>
                                </div>

                                <div className="flex gap-10 text-center px-6 md:border-l md:border-r border-gray-100 w-full md:w-auto justify-center md:justify-start">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{hackathon.teams}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Teams</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{hackathon.judges}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Judges</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                    <button 
                                        onClick={(e) => toggleStatus(hackathon.id, e)}
                                        className={`p-2.5 rounded-xl transition-colors border ${
                                            hackathon.status === 'Live' 
                                            ? 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100' 
                                            : 'bg-green-50 text-green-600 border-green-100 hover:bg-green-100'
                                        }`}
                                        title={hackathon.status === 'Live' ? "Pause Event" : "Go Live"}
                                    >
                                        {hackathon.status === 'Live' ? <PauseCircle size={20} /> : <PlayCircle size={20} />}
                                    </button>
                                    
                                    <button 
                                        onClick={handleEdit} 
                                        className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:text-[#5425FF] hover:border-[#5425FF] transition-colors" 
                                        title="Edit Configuration"
                                    >
                                        <Edit size={20} />
                                    </button>
                                    
                                    <div className="h-8 w-px bg-gray-200 mx-1"></div>

                                    <button 
                                        onClick={(e) => deleteHackathon(hackathon.id, e)}
                                        className="p-2.5 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
                                        title="Delete Event"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredHackathons.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 border-dashed">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-gray-900 font-bold mb-1">No Events Found</h3>
                            <p className="text-gray-500 text-sm">Create a new hackathon to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminHackathons;