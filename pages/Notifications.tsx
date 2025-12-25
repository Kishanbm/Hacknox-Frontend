import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/Layout';
import notificationsService from '../services/notifications.service';
import { teamService } from '../services/team.service';
import { publicService } from '../services/public.service';
import { judgeService } from '../services/judge.service';
import { useAuth } from '../contexts/AuthContext';
import { Check, Info, AlertTriangle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [filterHackathon, setFilterHackathon] = useState<string | 'all'>('all');

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        if (user?.role === 'judge') {
          // For judges, fetch their assigned hackathons from judge service
          const eventsData = await judgeService.getEvents();
          const judgeHackathons = eventsData.events || eventsData || [];
          setHackathons(judgeHackathons.map((e: any) => ({ id: e.id, name: e.name || e.title || e.slug })));
          
          // Fetch notifications for all judge's hackathons (role-based filtering in backend)
          const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedHackathonId') : null;
          const hackId = filterHackathon === 'all' ? (stored || (judgeHackathons && judgeHackathons[0]?.id)) : filterHackathon;
          const nots = await notificationsService.getNotifications(hackId || undefined, user?.role);
          setNotifications(nots || []);
        } else {
          // For participants, fetch teams to get hackathons
          const teams = await teamService.getMyTeams();
          const userHackathonIds = new Set((teams || []).map((t: any) => t.hackathon_id).filter(Boolean));
          
          // Fetch all hackathons and filter to only user's hackathons
          const hs = await publicService.getHackathons();
          const userHackathons = (hs || []).filter((h: any) => userHackathonIds.has(h.id));
          setHackathons(userHackathons);
          
          // Determine hackathon id to request (prefer selected filter or stored selection)
          const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedHackathonId') : null;
          const hackId = filterHackathon === 'all' ? (stored || (userHackathons && userHackathons[0]?.id)) : filterHackathon;
          const nots = await notificationsService.getNotifications(hackId || undefined, user?.role);
          setNotifications(nots || []);
        }
      } catch (e) {
        console.error('Failed to load notifications', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await notificationsService.markOneRead(id, undefined, user?.role);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error('Mark read failed', e);
    }
  };

  // Refetch when filter changes
  useEffect(() => {
    const loadFiltered = async () => {
      setIsLoading(true);
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedHackathonId') : null;
        const hackId = filterHackathon === 'all' ? (stored || (hackathons && hackathons[0]?.id)) : filterHackathon;
        const nots = await notificationsService.getNotifications(hackId || undefined, user?.role);
        setNotifications(nots || []);
      } catch (e) {
        console.error('Failed to load filtered notifications', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadFiltered();
  }, [filterHackathon]);

  const filtered = notifications.filter(n => filterHackathon === 'all' ? true : n.hackathon_id === filterHackathon);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Notifications</h2>
          <div className="flex items-center gap-3">
            <select value={filterHackathon} onChange={(e) => setFilterHackathon(e.target.value as any)} className="px-3 py-2 border rounded-md text-sm">
              <option value="all">All Hackathons</option>
              {hackathons.map(h => (
                <option key={h.id} value={h.id}>{h.name || h.slug || h.id}</option>
              ))}
            </select>
            <Link to="/dashboard" className="text-sm text-gray-500 hover:underline">Back</Link>
          </div>
        </div>

        <div className="space-y-3">
          {isLoading && <p className="text-gray-500">Loading...</p>}
          {!isLoading && filtered.length === 0 && (
            <div className="bg-white border border-gray-100 rounded-lg p-6 text-center text-gray-600">No notifications</div>
          )}

          {filtered.map(n => (
            <div key={n.id} className={`bg-white border ${n.is_read ? 'border-gray-100' : 'border-primary/20 bg-blue-50/30'} rounded-xl p-4 flex gap-4 items-start`}> 
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-primary bg-primary/10">
                {n.category === 'invite' ? <Users /> : n.category === 'alert' ? <AlertTriangle /> : <Info />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-gray-900">{n.title}</div>
                      {/* Priority badge */}
                      {(() => {
                        const p = (n.priority || n.priority?.toString() || '').toString().toLowerCase();
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
                    <div className="text-xs text-gray-600">{n.target_user_id ? `${n.target_user_first_name || ''} ${n.target_user_last_name || ''}`.trim() : (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '')}</div>
                  </div>
                  {!n.is_read && (
                    <button onClick={() => markAsRead(n.id)} className="text-xs bg-white border border-primary text-primary px-3 py-1 rounded-md">Mark read</button>
                  )}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  {(() => {
                    // Format the content to show meaningful names instead of raw IDs
                    let text = n.content || n.message || n.desc || '';
                    // If there's a submission_name or team_name in the notification data, use it
                    if (n.submission_name || n.submissionName) {
                      text = text.replace(/\(id: [a-f0-9-]+\)/gi, `(${n.submission_name || n.submissionName})`);
                    }
                    if (n.team_name || n.teamName) {
                      // Replace team references
                      text = text.replace(/team [a-f0-9-]+/gi, `team ${n.team_name || n.teamName}`);
                    }
                    // Clean up any remaining UUIDs to make them shorter
                    text = text.replace(/\(id: ([a-f0-9]{8})-[a-f0-9-]+\)/gi, '');
                    return text;
                  })()}
                </div>
                <div className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
