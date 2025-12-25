import apiClient from '../lib/axios';

// ==================== HACKATHON MANAGEMENT ====================

export interface CreateHackathonData {
  name: string;
  submission_deadline: string;
  max_team_size?: number;
  event_info_json?: any;
  banner?: string;
  cities?: string[];
  modes?: string[];
  themes?: string[];
}

export interface UpdateHackathonData {
  name?: string;
  description?: string;
  start_date?: string | null;
  end_date?: string | null;
  submission_deadline?: string | null;
  max_team_size?: number;
  status?: string;
  event_info_json?: any;
  cities?: string[] | string;
  modes?: string[] | string;
  themes?: string[] | string;
}

export const adminService = {
  // 1. Get My Hackathons
  getMyHackathons: async () => {
    const response = await apiClient.get('/admin/hackathons');
    return response.data;
  },

  // Get single hackathon detail
  getHackathon: async (id: string) => {
    // Backend does not expose GET /:id — fall back to fetching list and finding the item
    const res = await apiClient.get('/admin/hackathons');
    const list = res.data?.hackathons || res.data || [];
    return list.find((h: any) => h.id === id) || null;
  },

  // Get analytics for a specific hackathon by overriding header per-request
  getAnalyticsForHackathon: async (hackathonId: string) => {
    const response = await apiClient.get('/admin/analytics/overview', {
      headers: { 'x-hackathon-id': hackathonId }
    });
    return response.data;
  },

  // Get judges list for a specific hackathon (returns array or metadata)
  getJudgesForHackathon: async (hackathonId: string, page = 1, limit = 100) => {
    const response = await apiClient.get('/admin/judges', {
      headers: { 'x-hackathon-id': hackathonId },
      params: { page, limit }
    });
    return response.data;
  },

  // 2. Create Hackathon
  createHackathon: async (data: CreateHackathonData) => {
    const response = await apiClient.post('/admin/hackathons', data);
    return response.data;
  },

  // 3. Update Hackathon
  updateHackathon: async (id: string, data: UpdateHackathonData) => {
    const response = await apiClient.patch(`/admin/hackathons/${id}`, data);
    return response.data;
  },

  // 4. Delete Hackathon
  deleteHackathon: async (id: string) => {
    const response = await apiClient.delete(`/admin/hackathons/${id}`);
    return response.data;
  },

  // ==================== JUDGE MANAGEMENT ====================

  // 5. Get Judges List
  getJudges: async (page = 1, limit = 10, hackathonId?: string) => {
    const config: any = { params: { page, limit } };
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const response = await apiClient.get('/admin/judges', config);
    return response.data;
  },

  // 6. Create Judge
  createJudge: async (data: { email: string; firstName: string; lastName: string }) => {
    const response = await apiClient.post('/admin/judge', data);
    return response.data;
  },

  // 7. Update Judge
  updateJudge: async (judgeId: string, data: any) => {
    const response = await apiClient.patch(`/admin/judge/${judgeId}`, data);
    return response.data;
  },

  // 8. Delete Judge
  deleteJudge: async (judgeId: string, type: 'soft' | 'hard' = 'soft') => {
    const response = await apiClient.delete(`/admin/judge/${judgeId}`, {
      params: { type }
    });
    return response.data;
  },

  // ==================== TEAM MANAGEMENT ====================

  // 9. Get Teams List
  getTeams: async (page = 1, limit = 10, filters: any = {}, search = '', hackathonId?: string) => {
    const config: any = { params: { page, limit, ...filters, search } };
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const response = await apiClient.get('/admin/teams', config);
    return response.data;
  },

  // 10. Get Team Detail
  getTeamDetail: async (teamId: string, hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const response = await apiClient.get(`/admin/team/${teamId}`, config);
    return response.data;
  },

  // 11. Update Team
  updateTeam: async (teamId: string, data: any, hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const response = await apiClient.patch(`/admin/team/${teamId}`, data, config);
    return response.data;
  },

  // 12. Verify Team
  verifyTeam: async (teamId: string, action: 'approve' | 'reject', hackathonId?: string) => {
    const config: any = { headers: { 'Content-Type': 'application/json' } };
    if (hackathonId) config.headers['x-hackathon-id'] = hackathonId;
    const response = await apiClient.post(`/admin/team/${teamId}/verify`, { action }, config);
    return response.data;
  },

  // 13. Export Teams CSV
  exportTeamsCSV: async () => {
    const response = await apiClient.get('/admin/teams/export', {
      responseType: 'blob'
    });
    return response.data;
  },

  // ==================== SUBMISSIONS MANAGEMENT ====================

  // 14. Get Submissions Panel
  getSubmissions: async (page = 1, limit = 10, filters: any = {}, hackathonId?: string) => {
    const config: any = { params: { page, limit, ...filters } };
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const response = await apiClient.get('/admin/submissions', config);
    return response.data;
  },

  // 15. Get Submission Detail
  getSubmissionDetail: async (submissionId: string, hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const response = await apiClient.get(`/admin/submission/${submissionId}`, config);
    return response.data;
  },

  // 16. Change Submission Status
  changeSubmissionStatus: async (submissionId: string, data: { newStatus?: string; status?: string; adminNote?: string }, hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    // normalize payload: backend expects `status` (not `newStatus`)
    const payload: any = {
      status: data.status ?? data.newStatus,
    };
    if (data.adminNote) payload.adminNote = data.adminNote;
    // include hackathon id in body as a fallback in case headers are lost
    if (hackathonId) payload.hackathonId = hackathonId;
    if (hackathonId) payload.hackathon_id = hackathonId;
    const response = await apiClient.patch(`/admin/submission/${submissionId}/status`, payload, config);
    return response.data;
  },

  // 17. Download Submission
  downloadSubmission: async (submissionId: string, hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const response = await apiClient.get(`/admin/submission/${submissionId}/download`, config);
    return response.data;
  },

  // ==================== JUDGE ASSIGNMENTS ====================

  // 18. Get Judge Assignments
  getJudgeAssignments: async (hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const response = await apiClient.get('/admin/judge-assignments', config);
    return response.data;
  },

  // 19. Assign Teams to Judges
  assignTeamsToJudges: async (data: { judgeId: string; teamIds: string[] } | any[], hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    else config.headers = { 'x-hackathon-id': false };
    const payload = Array.isArray(data) ? data : [data];
    // Backend expects { assignments: [...] } in the request body
    const response = await apiClient.post('/admin/assignments/assign', { assignments: payload }, config);
    return response.data;
  },

  // 20. Reassign Team
  reassignTeam: async (data: { teamId: string; oldJudgeId: string; newJudgeId: string }, hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    else config.headers = { 'x-hackathon-id': false };
    const response = await apiClient.post('/admin/assignments/reassign', data, config);
    return response.data;
  },

  // 21. Auto Balance Assignments
  autoBalanceAssignments: async (hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    else config.headers = { 'x-hackathon-id': false };
    const response = await apiClient.post('/admin/assignments/auto-balance', {}, config);
    return response.data;
  },

  // ==================== SCORING & LEADERBOARD ====================

  // 22. Aggregate Scores
  aggregateScores: async (hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const response = await apiClient.post('/admin/scores/aggregate', {}, config);
    return response.data;
  },

  // 23. Compute Leaderboard
  computeLeaderboard: async (hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const response = await apiClient.post('/admin/scores/compute-leaderboard', {}, config);
    return response.data;
  },

  // 24. Get Internal Leaderboard
  getLeaderboard: async (isPublished?: boolean, hackathonId?: string) => {
    const params: any = {};
    // send both common param names to be tolerant of backend variations
    if (typeof isPublished === 'boolean') {
      params.is_published = isPublished;
      params.isPublished = isPublished;
    }
    const config: any = { params };
    // Only include the header when a hackathon is explicitly selected.
    // Previously we set the header to `false` which became the string 'false'
    // and caused the backend to treat it as an actual hackathon id filter.
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const response = await apiClient.get('/admin/leaderboard', config);
    return response.data;
  },

  // 25. Publish Leaderboard
  publishLeaderboard: async (isPublic: boolean, hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    else config.headers = { 'x-hackathon-id': false };
    // Backend expects `isPublished` boolean field in some versions; include both to be safe
    const payload = { is_public: isPublic, isPublished: isPublic };
    const response = await apiClient.post('/admin/leaderboard/publish', payload, config);
    return response.data;
  },

  // ==================== ANNOUNCEMENTS ====================

  // 26. Get Announcements
  getAnnouncements: async (page = 1, limit = 10, hackathonId?: string) => {
    const config: any = { params: { page, limit } };
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const response = await apiClient.get('/admin/announcements', config);
    return response.data;
  },

  // 27. Create Announcement
  createAnnouncement: async (data: any, hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    // include hackathonId in body as a fallback in case headers are stripped
    const payload = { ...data } as any;
    if (hackathonId) payload.hackathonId = hackathonId;
    const response = await apiClient.post('/admin/announcements', payload, config);
    return response.data;
  },

  // 28. Send Announcement
  sendAnnouncement: async (data: any, hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const payload = { ...data } as any;
    if (hackathonId) payload.hackathonId = hackathonId;
    const response = await apiClient.post('/admin/announcements/send', payload, config);
    return response.data;
  },

  // 29. Schedule Announcement
  scheduleAnnouncement: async (data: any, hackathonId?: string) => {
    const config: any = {};
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const payload = { ...data } as any;
    if (hackathonId) payload.hackathonId = hackathonId;
    const response = await apiClient.post('/admin/announcements/schedule', payload, config);
    return response.data;
  },

  // ==================== ANALYTICS ====================

  // 30. Get Analytics Overview
  getAnalyticsOverview: async () => {
    const response = await apiClient.get('/admin/analytics/overview');
    return response.data;
  },

  // 31. Get Analytics Detail
  getAnalyticsDetail: async () => {
    const response = await apiClient.get('/admin/analytics/detail');
    return response.data;
  },

  // 32. Get State/College Breakdown
  getBreakdown: async () => {
    const response = await apiClient.get('/admin/overview/breakdown');
    return response.data;
  },

  // ==================== AUDIT & SETTINGS ====================

  // 33. Get Audit Logs
  getAuditLogs: async (page = 1, limit = 50, hackathonId?: string) => {
    const config: any = { params: { page, limit } };
    if (hackathonId) config.headers = { 'x-hackathon-id': hackathonId };
    const response = await apiClient.get('/admin/settings/audit-logs', config);
    return response.data;
  },

  // 34. Update Settings
  updateSettings: async (data: any) => {
    const response = await apiClient.patch('/admin/settings', data);
    return response.data;
  },

  // ==================== REPORTS/FLAGS ====================

  // 35. Get Reports/Flags
  getReports: async (page = 1, limit = 50, hackathonId?: string, status?: string) => {
    const config: any = { params: { page, limit } };
    if (hackathonId) config.params.hackathon_id = hackathonId;
    if (status) config.params.status = status;
    const response = await apiClient.get('/admin/reports', config);
    return response.data;
  },

  // 36. Get Reports Count
  getReportsCount: async (hackathonId?: string) => {
    const config: any = { params: {} };
    if (hackathonId) config.params.hackathon_id = hackathonId;
    const response = await apiClient.get('/admin/reports/count', config);
    return response.data;
  },

  // 37. Update Report Status
  updateReportStatus: async (reportId: string, status: 'pending' | 'reviewed' | 'resolved' | 'dismissed', notes?: string) => {
    const response = await apiClient.patch(`/admin/reports/${reportId}`, { status, notes });
    return response.data;
  },
};

export default adminService;
