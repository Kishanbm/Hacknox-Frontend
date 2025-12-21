import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/Layout';
import notificationsService from '../services/notifications.service';
import { publicService } from '../services/public.service';
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
        const hs = await publicService.getHackathons();
        setHackathons(hs || []);
        // Determine hackathon id to request (prefer selected filter or stored selection)
        const stored = typeof window !== 'undefined' ? localStorage.getItem('selectedHackathonId') : null;
        const hackId = filterHackathon === 'all' ? (stored || (hs && hs[0]?.id)) : filterHackathon;
        const nots = await notificationsService.getNotifications(hackId || undefined);
        setNotifications(nots || []);
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
      await notificationsService.markOneRead(id);
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
        const nots = await notificationsService.getNotifications(hackId || undefined);
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
                    <div className="font-bold text-gray-900">{n.title}</div>
                    <div className="text-xs text-gray-600">{n.target_user_id ? `${n.target_user_first_name || ''} ${n.target_user_last_name || ''}`.trim() : (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : '')}</div>
                  </div>
                  {!n.is_read && (
                    <button onClick={() => markAsRead(n.id)} className="text-xs bg-white border border-primary text-primary px-3 py-1 rounded-md">Mark read</button>
                  )}
                </div>
                <div className="text-sm text-gray-700 mb-2">{n.content || n.message || n.desc}</div>
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
