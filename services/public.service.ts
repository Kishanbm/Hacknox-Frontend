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
      
      // Extract evaluation_criteria and tech_stack from raw_event_info for convenience
      const eventInfo = hack.raw_event_info || {};
      hack.evaluation_criteria = eventInfo.evaluation_criteria || [];
      hack.tech_stack = eventInfo.tech_stack || [];
      hack.modes = hack.modes || eventInfo.modes || [];
      hack.themes = hack.themes || eventInfo.themes || eventInfo.theme || [];
      
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

  /**
   * Get wins (top-3 leaderboard placements) count for a public user
   */
  getUserWins: async (userId: string): Promise<{ wins: number; teams?: any[] }> => {
    const response = await apiClient.get(ENDPOINTS.PUBLIC.USER_WINS(userId));
    return response.data || { wins: 0, teams: [] };
  },
  /**
   * Get participation info for a public user (canonical count of hackathons participated)
   */
  getUserParticipation: async (userId: string): Promise<{ count: number; hackathons?: any[] }> => {
    const response = await apiClient.get(ENDPOINTS.PUBLIC.USER_PARTICIPATION(userId));
    return response.data || { count: 0, hackathons: [] };
  },
};

export default publicService;
