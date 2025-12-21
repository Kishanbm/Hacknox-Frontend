import apiClient from '../lib/axios';
import { ENDPOINTS } from '../config/endpoints';

export const notificationsService = {
  getNotifications: async (hackathonId?: string) => {
    const headers: any = {};
    // Prefer explicit param, else use stored selected hackathon id
    const selected = hackathonId || (typeof window !== 'undefined' ? localStorage.getItem('selectedHackathonId') : null);
    if (selected) headers['x-hackathon-id'] = selected;
    const response = await apiClient.get(ENDPOINTS.PARTICIPANT.NOTIFICATIONS + (selected ? '' : ''), { headers });
    // API returns { message, notifications }
    if (response.data && Array.isArray(response.data.notifications)) return response.data.notifications;
    if (Array.isArray(response.data)) return response.data;
    return [];
  },

  markRead: async (notificationIds: string[]) => {
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) return;
    // Backend expects PATCH /api/notifications/read with { notificationIds }
    const response = await apiClient.patch(`${ENDPOINTS.PARTICIPANT.NOTIFICATIONS}/read`, { notificationIds });
    return response.data;
  },

  markOneRead: async (id: string) => {
    return await notificationsService.markRead([id]);
  }
};

export default notificationsService;
