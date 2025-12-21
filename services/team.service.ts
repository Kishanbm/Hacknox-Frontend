import apiClient from '../lib/axios';
import { ENDPOINTS } from '../config/endpoints';
import { Team, TeamInvitation } from '../types/api';

/**
 * Team Service
 * Contains all team-related API calls
 */

export const teamService = {
  /**
   * Get list of user's teams
   */
  getMyTeams: async (): Promise<Team[]> => {
    // Opt-out of automatic x-hackathon-id header for this endpoint so backend returns all teams
    const response = await apiClient.get<any>(ENDPOINTS.TEAMS.MY_TEAMS, {
      headers: { 'x-hackathon-id': false },
    });
    // Backend returns { teams: [...] }
    return response.data?.teams ?? response.data ?? [];
  },

  /**
   * Get team details by ID
   */
  getTeamById: async (teamId: string): Promise<Team> => {
    const response = await apiClient.get<any>(ENDPOINTS.TEAMS.DETAIL(teamId));
    // backend responds with { team }
    return response.data?.team ?? response.data;
  },

  /**
   * Create a new team
   */
  createTeam: async (teamData: {
    name: string;
    hackathonId: string;
  }): Promise<Team> => {
    const response = await apiClient.post<Team>(ENDPOINTS.TEAMS.CREATE, teamData);
    return response.data;
  },

  /**
   * Join a team using team code
   */
  joinTeam: async (teamCode: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.TEAMS.JOIN, { teamCode });
  },

  /**
   * Update team details
   */
  updateTeam: async (
    teamId: string,
    teamData: { name?: string; description?: string }
  ): Promise<Team> => {
    const response = await apiClient.patch<Team>(ENDPOINTS.TEAMS.UPDATE(teamId), teamData);
    return response.data;
  },

  /**
   * Leave a team
   */
  leaveTeam: async (teamId: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.TEAMS.LEAVE(teamId));
  },

  /**
   * Delete/disband a team (leader only)
   */
  deleteTeam: async (teamId: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.TEAMS.DELETE(teamId));
  },

  /**
   * Invite a member to team
   */
  inviteMember: async (teamId: string, email: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.TEAMS.INVITE_MEMBER(teamId), { email });
  },

  /**
   * Remove a member from team (leader only)
   */
  removeMember: async (teamId: string, memberId: string): Promise<void> => {
    await apiClient.delete(ENDPOINTS.TEAMS.REMOVE_MEMBER(teamId, memberId));
  },

  /**
   * Get team invitations
   */
  getInvitations: async (): Promise<TeamInvitation[]> => {
    const response = await apiClient.get<any>(ENDPOINTS.TEAMS.INVITATIONS, {
      headers: { 'x-hackathon-id': false },
    });
    // Backend returns { invitations: [...] }
    return response.data?.invitations ?? response.data ?? [];
  },

  /**
   * Respond to team invitation
   */
  respondToInvitation: async (
    invitationId: string,
    action: 'accept' | 'decline'
  ): Promise<void> => {
    await apiClient.post(ENDPOINTS.TEAMS.RESPOND_INVITATION(invitationId), { action });
  },
};

export default teamService;
