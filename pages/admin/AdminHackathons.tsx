import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '../../components/AdminLayout';
import { Plus, Calendar, MapPin, Users, Edit, MoreVertical, PlayCircle, PauseCircle } from 'lucide-react';

const AdminHackathons: React.FC = () => {
    const navigate = useNavigate();

    // Mock Data
    const hackathons = [
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
    ];

    return (
        <AdminLayout>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-heading text-gray-900">Hackathons</h1>
                        <p className="text-gray-500">Manage event lifecycles, settings, and configurations.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/admin/hackathons/create')}
                        className="px-6 py-3 bg-[#111827] text-white rounded-xl font-bold hover:bg-black transition-colors flex items-center gap-2 shadow-lg"
                    >
                        <Plus size={20} /> Create Hackathon
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {hackathons.map((hackathon) => (
                        <div key={hackathon.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row group">
                            {/* Visual Strip */}
                            <div className={`w-full md:w-4 bg-gradient-to-b ${hackathon.gradient}`}></div>
                            
                            <div className="p-6 flex-1 flex flex-col md:flex-row items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold text-gray-900">{hackathon.name}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border ${
                                            hackathon.status === 'Live' ? 'bg-green-50 text-green-600 border-green-200' : 
                                            hackathon.status === 'Draft' ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-200'
                                        }`}>
                                            {hackathon.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                                        <span className="flex items-center gap-1.5"><Calendar size={16} /> {hackathon.dates}</span>
                                        <span className="flex items-center gap-1.5"><MapPin size={16} /> {hackathon.location}</span>
                                    </div>
                                </div>

                                <div className="flex gap-8 text-center px-6 border-l border-gray-100">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{hackathon.teams}</div>
                                        <div className="text-xs text-gray-400 font-bold uppercase">Teams</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-900">{hackathon.judges}</div>
                                        <div className="text-xs text-gray-400 font-bold uppercase">Judges</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {hackathon.status === 'Live' ? (
                                        <button className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors" title="Pause Event">
                                            <PauseCircle size={20} />
                                        </button>
                                    ) : (
                                        <button className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors" title="Launch Event">
                                            <PlayCircle size={20} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => navigate(`/admin/hackathons/create`)} // Reusing create for edit mock
                                        className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors" title="Edit Settings"
                                    >
                                        <Edit size={20} />
                                    </button>
                                    <button className="p-3 bg-white border border-gray-200 text-gray-400 rounded-xl hover:text-gray-900 transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminHackathons;