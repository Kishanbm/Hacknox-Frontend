import apiClient from '../lib/axios';
import { ENDPOINTS } from '../config/endpoints';
import { Hackathon, LeaderboardEntry } from '../types/api';

/**
 * Public Service
 * Contains all public (non-authenticated) API calls
 */

export const publicService = {
  /**
   * Get list of all hackathons
   */
  getHackathons: async (filters?: {
    status?: string;
    mode?: string;
  }): Promise<any[]> => {
    const response = await apiClient.get(ENDPOINTS.PUBLIC.HACKATHONS, {
      params: filters,
    });
    // Backend returns { message, hackathons }
    if (response.data && Array.isArray(response.data.hackathons)) return response.data.hackathons;
    // Fallback: if API returns array directly
    if (Array.isArray(response.data)) return response.data;
    return [];
  },

  /**
   * Get hackathon details by ID
   */
  getHackathonById: async (hackathonId: string): Promise<any> => {
    const response = await apiClient.get(ENDPOINTS.PUBLIC.HACKATHON_DETAIL(hackathonId), {
      headers: {
        'x-hackathon-id': hackathonId
      }
    });
    // Backend returns { message, hackathon, current_user? }
    if (response.data && response.data.hackathon) {
      // merge possible current_user/user/team info onto the hackathon object for convenience
      const hack = response.data.hackathon;
      if (response.data.current_user) hack.current_user = response.data.current_user;
      if (response.data.user_status) hack.userStatus = response.data.user_status;
      if (response.data.user_team_name) hack.userTeamName = response.data.user_team_name;
      return hack;
    }
    return response.data;
  },

  /**
   * Get public leaderboard for a hackathon
   */
  getLeaderboard: async (hackathonId: string): Promise<LeaderboardEntry[]> => {
    const response = await apiClient.get<LeaderboardEntry[]>(
      ENDPOINTS.PUBLIC.LEADERBOARD(hackathonId)
    );
    return response.data;
  },
};

export default publicService;
