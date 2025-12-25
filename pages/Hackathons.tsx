import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/Layout';
import { ENDPOINTS } from '../config/endpoints';
import { Calendar, MapPin, Search, Filter, ArrowUpRight, Award } from 'lucide-react';
import { HackathonEvent } from '../types';
import { publicService } from '../services/public.service';

const Hackathons: React.FC = () => {
  // Default to show Live events first
  const [filter, setFilter] = useState('Live');
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [queryFilters, setQueryFilters] = useState<{ city?: string; mode?: string; theme?: string }>({});
  const [combinedFilters, setCombinedFilters] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedModes, setSelectedModes] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchHackathons = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Compose backend filter params
        const params: any = {};
        if (filter && filter !== 'All') params.status = filter;
        if (queryFilters.mode) params.mode = queryFilters.mode;
        if (queryFilters.city) params.city = queryFilters.city;
        if (queryFilters.theme) params.theme = queryFilters.theme;

        const data = await publicService.getHackathons(params);
        setHackathons(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Failed to fetch hackathons:', err);
        setError(err?.message || 'Failed to load hackathons');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHackathons();
  }, [filter, queryFilters]);

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
                <button onClick={() => setShowFiltersPanel(v => !v)} className="w-full sm:w-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-2 font-bold shadow-sm md:shadow-none">
                  <Filter size={20} /> Filter
                </button>
            </div>
        </div>

            {/* Right-side Filters Panel */}
            {showFiltersPanel && (
              <div className="mb-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <h4 className="font-bold mb-2">Filters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* City select - options derived from loaded hackathons */}
                  <select multiple={combinedFilters} value={selectedCities} onChange={(e) => {
                      const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                      setSelectedCities(opts);
                    }} className="p-2 border rounded">
                    <option value="">-- City --</option>
                    {Array.from(new Set(hackathons.flatMap(h => (Array.isArray(h.cities) ? h.cities : (h.location ? [h.location] : []))).map((c:any) => String(c).trim()).filter(Boolean))).map((c: string) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  {/* Mode select */}
                  <select multiple={combinedFilters} value={selectedModes} onChange={(e) => {
                      const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                      setSelectedModes(opts);
                    }} className="p-2 border rounded">
                    <option value="">-- Mode --</option>
                    {Array.from(new Set(hackathons.flatMap(h => (Array.isArray(h.modes) ? h.modes : (h.mode ? [h.mode] : []))).map((m:any) => String(m).trim()).filter(Boolean))).map((m: string) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  {/* Theme select */}
                  <select multiple={combinedFilters} value={selectedThemes} onChange={(e) => {
                      const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                      setSelectedThemes(opts);
                    }} className="p-2 border rounded">
                    <option value="">-- Theme --</option>
                    {Array.from(new Set(hackathons.flatMap(h => (Array.isArray(h.themes) ? h.themes : (Array.isArray(h.theme) ? h.theme : (h.theme ? [h.theme] : [])))).map((t:any) => String(t).trim()).filter(Boolean))).map((t: string) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={combinedFilters} onChange={e => setCombinedFilters(e.target.checked)} />
                    <span>Combined filters (multi-select)</span>
                  </label>
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => {
                      setShowFiltersPanel(false);
                      setFilter('All');
                      setSelectedCities([]); setSelectedModes([]); setSelectedThemes([]); setQueryFilters({});
                    }} className="px-3 py-2 bg-white border rounded">Reset</button>
                  <button onClick={() => {
                      // Apply selected options: join multiple selections with commas for backend
                      const params: any = {};
                      if (selectedCities.length > 0) params.city = selectedCities.join(',');
                      if (selectedModes.length > 0) params.mode = selectedModes.join(',');
                      if (selectedThemes.length > 0) params.theme = selectedThemes.join(',');
                      setQueryFilters(params);
                      setShowFiltersPanel(false);
                    }} className="px-3 py-2 bg-primary text-white rounded">Apply</button>
                </div>
              </div>
            )}

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
              const computedStatus = getHackathonStatus(event.start_date, event.end_date, event.registration_deadline);
              const dbStatus = event.status ? String(event.status).toLowerCase() : null;
              const status = (function(){
                if (dbStatus) {
                  if (['live','active'].includes(dbStatus)) return 'Live';
                  if (['paused'].includes(dbStatus)) return 'Paused';
                  if (['upcoming','pending'].includes(dbStatus)) return 'Upcoming';
                  if (['registration open','registration_open','registration-open'].includes(dbStatus)) return 'Registration Open';
                  if (['past','ended','completed'].includes(dbStatus)) return 'Past';
                  return String(dbStatus).charAt(0).toUpperCase() + String(dbStatus).slice(1);
                }
                return computedStatus;
              })();
              const bannerGradient = event.banner_gradient || getBannerGradient(status);
              const theme = Array.isArray(event.theme) ? event.theme : (event.theme ? [event.theme] : []);
              const organizerLogo = event.organizer_logo ? event.organizer_logo : (event.organizer_name ? event.organizer_name.substring(0, 2).toUpperCase() : '');
              
              return (
                <Link key={event.id} to={`/dashboard/hackathons/${event.id}`} onClick={() => console.debug('Hackathon card clicked', event.id, 'hash:', window.location.hash)} className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full relative no-underline">
                {/* Banner */}
                <div className="h-32 relative overflow-hidden">
                  {event.banner_url ? (
                    <img src={event.banner_url} alt={event.name} className="w-full h-full object-cover" />
                  ) : bannerGradient ? (
                    <div className={`w-full h-full bg-gradient-to-r ${bannerGradient}`}></div>
                  ) : (
                    <div className="w-full h-full bg-gray-50"></div>
                  )}
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
                      { (event.start_date && event.end_date) ? (
                        <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(event.start_date)} - {formatDate(event.end_date)}</span>
                      ) : (event.submission_deadline) ? (
                        <span className="flex items-center gap-1"><Calendar size={14} /> Deadline: {formatDate(event.submission_deadline)}</span>
                      ) : null }
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
