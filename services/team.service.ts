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
    const response = await apiClient.get<any>(ENDPOINTS.TEAMS.MY_TEAMS);
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
    description?: string;
  }): Promise<Team> => {
    const response = await apiClient.post<Team>(ENDPOINTS.TEAMS.CREATE, teamData);
    return response.data;
  },

  /** Update team details (leader only) - PATCH /teams/update */
  updateTeamDetails: async (updates: { name?: string; description?: string }): Promise<any> => {
    const response = await apiClient.patch<any>('/teams/update', updates);
    return response.data;
  },

  /**
   * Join a team using team code
   * Backend expects `{ joinCode }` in the request body.
   */
  joinTeam: async (teamCode: string): Promise<any> => {
    // Prefer explicit hackathonId in the body to ensure backend receives it
    // even if localStorage or automatic header injection is missing.
    const hackathonId = typeof window !== 'undefined' ? localStorage.getItem('selectedHackathonId') : null;
    const payload: any = { joinCode: teamCode };
    if (hackathonId) payload.hackathonId = hackathonId;
    // Ensure backend receives hackathon id header explicitly — some flows may not
    // have the axios interceptor add it (e.g., SSR or timing issues). Pass it in
    // the request headers directly when available.
    const config = hackathonId ? { headers: { 'x-hackathon-id': hackathonId } } : undefined;
    const response = await apiClient.post(ENDPOINTS.TEAMS.JOIN, payload, config);
    return response.data;
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
  inviteMember: async (teamId: string | null, email: string): Promise<void> => {
    // Backend route is leader-scoped and will resolve team by leader_id.
    // We still pass teamId for context, but the endpoint does not include it in the URL.
    await apiClient.post(ENDPOINTS.TEAMS.INVITE_MEMBER as string, { teamId, email });
  },

  /**
   * Remove a member from team (leader only)
   */
  removeMember: async (teamId: string, memberId: string): Promise<void> => {
    // Backend expects DELETE /teams/:teamId/member/remove with body { memberId }
    await apiClient.delete(ENDPOINTS.TEAMS.REMOVE_MEMBER(teamId), { data: { memberId } });
  },

  /**
   * Get team invitations
   */
  getInvitations: async (): Promise<TeamInvitation[]> => {
    const response = await apiClient.get<any>(ENDPOINTS.TEAMS.INVITATIONS);
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
  /**
   * Accept an invitation by token using the canonical endpoint
   */
  acceptInviteWithToken: async (token: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.TEAMS.ACCEPT_INVITE as string, { token });
  },
};

export default teamService;
