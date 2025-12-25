import apiClient from '../lib/axios';
import { ENDPOINTS } from '../config/endpoints';

export const notificationsService = {
  getNotifications: async (hackathonId?: string, role?: string) => {
    const headers: any = {};
    // Prefer explicit param, else use stored selected hackathon id
    const selected = hackathonId || (typeof window !== 'undefined' ? localStorage.getItem('selectedHackathonId') : null);
    if (selected) headers['x-hackathon-id'] = selected;

    // Pick endpoint based on role (judge vs participant)
    const endpoint = role === 'judge' ? ENDPOINTS.JUDGE.NOTIFICATIONS : ENDPOINTS.PARTICIPANT.NOTIFICATIONS;
    const response = await apiClient.get(endpoint, { headers });
    // API returns { message, notifications }
    if (response.data && Array.isArray(response.data.notifications)) return response.data.notifications;
    if (Array.isArray(response.data)) return response.data;
    return [];
  },

  markRead: async (notificationIds: string[], hackathonId?: string, role?: string) => {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) return;
    const headers: any = {};
    const selected = hackathonId || (typeof window !== 'undefined' ? localStorage.getItem('selectedHackathonId') : null);
    if (selected) headers['x-hackathon-id'] = selected;
    // Backend expects PATCH /api/notifications/read with { notificationIds }
    const endpoint = role === 'judge' ? ENDPOINTS.JUDGE.NOTIFICATIONS : ENDPOINTS.PARTICIPANT.NOTIFICATIONS;
    const response = await apiClient.patch(`${endpoint}/read`, { notificationIds }, { headers });
    return response.data;
  },

  markOneRead: async (id: string, hackathonId?: string, role?: string) => {
    return await notificationsService.markRead([id], hackathonId, role);
  }
};

export default notificationsService;
