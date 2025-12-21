import apiClient from '../lib/axios';
import { ENDPOINTS } from '../config/endpoints';

export interface DashboardData {
  teamStatus: {
    id: string;
    name: string;
    status: string;
    memberCount: number;
    isLeader: boolean;
  } | null;
  submissionStatus: {
    state: string;
    submissionId: string | null;
  };
  announcementsSummary: {
    total: number;
    unreadCount: number;
    latestTitle: string | null;
  };
  upcomingDeadlines: Array<{
    name: string;
    date: string;
  }>;
}

export const participantService = {
  /**
   * Get participant dashboard data
   * Note: This requires x-hackathon-id header, so hackathonId must be set in localStorage
   */
  getDashboard: async (): Promise<DashboardData> => {
    const response = await apiClient.get<{ message: string; dashboard: DashboardData }>(
      ENDPOINTS.PARTICIPANT.DASHBOARD
    );
    return response.data.dashboard;
  },

  /**
   * Get my submissions (across all hackathons)
   */
  getMySubmissions: async (): Promise<any[]> => {
    const response = await apiClient.get<any>('/participant/my-submissions', {
      headers: { 'x-hackathon-id': false }, // opt-out to get all
    });
    const data = response.data;
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.submissions)) return data.submissions;
    return [];
  },
};

export default participantService;
