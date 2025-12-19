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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-heading text-gray-900">Explore Events</h1>
                <p className="text-gray-500">Discover your next challenge and build the future.</p>
            </div>
            
            <div className="flex gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search hackathons..." 
                        className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl w-64 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>
                <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-primary hover:border-primary transition-colors flex items-center gap-2 font-bold">
                    <Filter size={20} /> Filter
                </button>
            </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
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
                    {status}
                </button>
            ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEvents.map(event => (
                <div 
                    key={event.id} 
                    onClick={() => navigate(`/dashboard/hackathons/${event.id}`)}
                    className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full relative cursor-pointer"
                >
                    {/* Banner */}
                    <div className={`h-32 bg-gradient-to-r ${event.bannerGradient} relative p-6`}>
                        <span className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2 py-1 rounded border border-white/20">
                            {event.status}
                        </span>
                    </div>

                    {/* Organizer Logo - Overlapping */}
                    <div className="absolute top-24 left-6 w-14 h-14 bg-white p-1 rounded-xl shadow-md flex items-center justify-center">
                         <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-400">
                             {event.organizer.logo}
                         </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 pt-10 flex-1 flex flex-col">
                        <div className="mb-4">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Organized by {event.organizer.name}</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{event.name}</h3>
                            <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                <span className="flex items-center gap-1"><Calendar size={14} /> {event.startDate} - {event.endDate}</span>
                                <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {event.theme.map(t => (
                                <span key={t} className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-bold border border-gray-100">
                                    {t}
                                </span>
                            ))}
                        </div>

                        <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                            <span className={`text-xs font-bold ${
                                event.userStatus === 'Not Registered' ? 'text-gray-400' : 'text-green-600'
                            }`}>
                                {event.userStatus}
                            </span>
                            <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                event.userStatus === 'Not Registered' 
                                ? 'bg-gray-900 text-white hover:bg-primary' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                                <ArrowUpRight size={20} />
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