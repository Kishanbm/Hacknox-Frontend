import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { ENDPOINTS } from '../config/endpoints';
import { Calendar, MapPin, Search, Filter, ArrowUpRight, Award } from 'lucide-react';
import { HackathonEvent } from '../types';
import { publicService } from '../services/public.service';

const Hackathons: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchHackathons = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await publicService.getHackathons({ status: filter !== 'All' ? filter : undefined });
        setHackathons(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Failed to fetch hackathons:', err);
        setError(err?.message || 'Failed to load hackathons');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHackathons();
  }, [filter]);

  // Helper function to determine status based on dates
  const getHackathonStatus = (startDate?: string | null, endDate?: string | null, regDeadline?: string | null) => {
    try {
      const now = new Date();
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const reg = regDeadline ? new Date(regDeadline) : null;

      if (start && end && start <= now && end >= now) return 'Live';
      if (start && reg && start > now && reg >= now) return 'Registration Open';
      if (start && start > now) return 'Upcoming';
      if (end && end < now) return 'Past';
      return 'Upcoming';
    } catch (e) {
      return 'Upcoming';
    }
  };

  // Helper function to get banner gradient based on status
  const getBannerGradient = (status: string) => {
    switch (status) {
      case 'Live': return 'from-primary to-purple-800';
      case 'Upcoming': return 'from-blue-600 to-cyan-600';
      case 'Registration Open': return 'from-green-600 to-emerald-700';
      case 'Past': return 'from-gray-500 to-gray-700';
      default: return 'from-primary to-purple-800';
    }
  };

  // Helper function to format dates
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredEvents = hackathons;

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
            {isLoading ? (
              <div className="col-span-full py-20 text-center">
                <div className="inline-block animate-pulse px-6 py-3 bg-gray-100 rounded-xl">Loading hackathons...</div>
              </div>
            ) : error ? (
              <div className="col-span-full py-20 text-center text-red-500">{error}</div>
            ) : filteredEvents.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-500">No hackathons found for this filter.</div>
            ) : filteredEvents.map(event => {
              const status = getHackathonStatus(event.start_date, event.end_date, event.registration_deadline);
              const bannerGradient = event.banner_gradient || getBannerGradient(status);
              const theme = Array.isArray(event.theme) ? event.theme : (event.theme ? [event.theme] : []);
              const organizerLogo = event.organizer_logo ? event.organizer_logo : (event.organizer_name ? event.organizer_name.substring(0, 2).toUpperCase() : '');
              
              return (
                <Link key={event.id} to={`/dashboard/hackathons/${event.id}`} onClick={() => console.debug('Hackathon card clicked', event.id, 'hash:', window.location.hash)} className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full relative no-underline">
                {/* Banner */}
                <div className={`h-32 ${bannerGradient ? 'bg-gradient-to-r ' + bannerGradient : 'bg-gray-50'} relative p-6`}>
                  <div className={`absolute top-4 right-4 backdrop-blur-md text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${
                    status === 'Live' 
                    ? 'bg-black/30 text-[#24FF00] border-[#24FF00]/50' 
                    : 'bg-white/20 text-white border-white/20'
                  }`}>
                     {status === 'Live' && <div className="w-1.5 h-1.5 rounded-full bg-[#24FF00] animate-pulse"></div>}
                    {status}
                  </div>
                </div>

                    {/* Organizer Logo - Overlapping (only if present) */}
                    { (organizerLogo) && (
                      <div className="absolute top-24 left-6 w-14 h-14 bg-white p-1 rounded-xl shadow-md flex items-center justify-center border border-gray-50">
                        { event.organizer_logo ? (
                          <img src={event.organizer_logo} alt={event.organizer_name || 'Organizer'} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-xs font-black text-gray-400">
                            {organizerLogo}
                          </div>
                        ) }
                      </div>
                    )}

                {/* Content */}
                <div className="p-6 pt-10 flex-1 flex flex-col">
                  <div className="mb-4">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">{event.organizer_name || ''}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-1">{event.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 font-medium">
                      { (event.start_date && event.end_date) && (
                        <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                      ) }
                      { (event.location || event.mode) && (
                        <span className="flex items-center gap-1"><MapPin size={14} /> {event.location || event.mode}</span>
                      ) }
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {theme.slice(0, 3).map((t: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-bold border border-gray-100">
                        {t}
                      </span>
                    ))}
                    {theme.length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 text-gray-400 rounded-md text-xs font-bold border border-gray-100">+{theme.length - 3}</span>
                    )}
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400">
                      {event.max_team_size ? `Max ${event.max_team_size} members` : ''}
                    </span>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center transition-all bg-gray-900 text-white">
                      <ArrowUpRight size={20} className="text-[#24FF00]" />
                    </div>
                  </div>
                </div>
              </Link>
              );
            })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Hackathons;
