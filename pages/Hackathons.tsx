import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { Calendar, MapPin, Search, Filter, ArrowUpRight, Award } from 'lucide-react';
import { HackathonEvent } from '../types';

// Mock Data
const allEvents: HackathonEvent[] = [
    {
      id: 'h1',
      name: 'HackOnX 2025',
      organizer: { name: 'SuperCompute India', logo: 'SC' },
      status: 'Live',
      startDate: 'Mar 15',
      endDate: 'Mar 17',
      location: 'Bengaluru',
      theme: ['HPC', 'AI'],
      userStatus: 'Team Formed',
      bannerGradient: 'from-primary to-purple-800',
      riskLevel: 'High', readinessScore: 0, nextDeadlineLabel: '', nextDeadlineTime: '', actionsRequiredCount: 0
    },
    {
      id: 'h2',
      name: 'Global AI Challenge',
      organizer: { name: 'Google Devs', logo: 'GD' },
      status: 'Upcoming',
      startDate: 'Apr 10',
      endDate: 'Apr 12',
      location: 'Online',
      theme: ['Generative AI'],
      userStatus: 'Registered',
      bannerGradient: 'from-blue-600 to-cyan-600',
      riskLevel: 'Low', readinessScore: 0, nextDeadlineLabel: '', nextDeadlineTime: '', actionsRequiredCount: 0
    },
    {
      id: 'h3',
      name: 'Sustainable Future',
      organizer: { name: 'EcoWorld', logo: 'EW' },
      status: 'Registration Open',
      startDate: 'May 05',
      endDate: 'May 08',
      location: 'Hybrid',
      theme: ['Sustainability', 'IoT'],
      userStatus: 'Not Registered',
      bannerGradient: 'from-green-600 to-emerald-700',
      riskLevel: 'Low', readinessScore: 0, nextDeadlineLabel: '', nextDeadlineTime: '', actionsRequiredCount: 0
    },
    {
      id: 'h4',
      name: 'Defi Summer 2.0',
      organizer: { name: 'Ethereum Foundation', logo: 'EF' },
      status: 'Registration Open',
      startDate: 'Jun 01',
      endDate: 'Jun 03',
      location: 'Remote',
      theme: ['Blockchain', 'FinTech'],
      userStatus: 'Not Registered',
      bannerGradient: 'from-orange-500 to-red-500',
      riskLevel: 'Low', readinessScore: 0, nextDeadlineLabel: '', nextDeadlineTime: '', actionsRequiredCount: 0
    }
];

const Hackathons: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();

  const filteredEvents = filter === 'All' ? allEvents : allEvents.filter(e => e.status === filter);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20 md:pb-0">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-heading text-gray-900">Explore Events</h1>
                <p className="text-gray-500 text-sm md:text-base">Discover your next challenge and build the future.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search hackathons..." 
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm md:shadow-none"
                    />
                </div>
                <button className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2 font-bold shadow-sm md:shadow-none">
                    <Filter size={20} /> Filter
                </button>
            </div>
        </div>

        {/* Filters - Scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {['All', 'Live', 'Upcoming', 'Registration Open', 'Past'].map(status => (
                <button 
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                        filter === status 
                        ? 'bg-gray-900 text-white shadow-lg' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    <span className={filter === status ? 'text-[#24FF00]' : ''}>{status}</span>
                </button>
            ))}
        </div>

        {/* Grid - Bento Box Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredEvents.map(event => (
                <div 
                    key={event.id} 
                    onClick={() => navigate(`/dashboard/hackathons/${event.id}`)}
                    className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full relative cursor-pointer"
                >
                    {/* Banner */}
                    <div className={`h-32 bg-gradient-to-r ${event.bannerGradient} relative p-6`}>
                        <div className={`absolute top-4 right-4 backdrop-blur-md text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                            event.status === 'Live' 
                            ? 'bg-black/30 text-[#24FF00] border-[#24FF00]/50' 
                            : 'bg-white/20 text-white border-white/20'
                        }`}>
                             {event.status === 'Live' && <div className="w-1.5 h-1.5 rounded-full bg-[#24FF00] animate-pulse"></div>}
                            {event.status}
                        </div>
                    </div>

                    {/* Organizer Logo - Overlapping */}
                    <div className="absolute top-24 left-6 w-14 h-14 bg-white p-1 rounded-xl shadow-md flex items-center justify-center border border-gray-50">
                         <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-400">
                             {event.organizer.logo}
                         </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-10 flex-1 flex flex-col">
                        <div className="mb-4">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Organized by {event.organizer.name}</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{event.name}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 font-medium">
                                <span className="flex items-center gap-1"><Calendar size={14} /> {event.startDate} - {event.endDate}</span>
                                <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {event.theme.slice(0, 3).map(t => (
                                <span key={t} className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-bold border border-gray-100">
                                    {t}
                                </span>
                            ))}
                            {event.theme.length > 3 && (
                                <span className="px-2 py-1 bg-gray-50 text-gray-400 rounded-md text-xs font-bold border border-gray-100">+{event.theme.length - 3}</span>
                            )}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                            <span className={`text-xs font-bold ${
                                event.userStatus === 'Not Registered' ? 'text-gray-400' : 'text-green-600'
                            }`}>
                                {event.userStatus}
                            </span>
                            <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                event.userStatus === 'Not Registered' 
                                ? 'bg-gray-900 text-white hover:bg-primary group-hover:scale-110' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                                <ArrowUpRight size={20} className={event.userStatus === 'Not Registered' ? 'text-[#24FF00]' : ''} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Hackathons;