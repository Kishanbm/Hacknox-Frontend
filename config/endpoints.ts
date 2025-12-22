// API Configuration
export const API_CONFIG = {
  // Get base URL from environment variable or fallback to localhost
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api', 
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Centralized Endpoint Registry
export const ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    USER_DETAIL: (id: string) => `/auth/user/${id}`,
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    EDIT_PROFILE: '/auth/user/edit',
    UPDATE_PASSWORD: '/auth/settings/password',
    UPDATE_EMAIL_PREFERENCES: '/auth/settings/email-preferences',
  },
  
  // Participant Portal Endpoints
  PARTICIPANT: {
    DASHBOARD: '/participant/dashboard',
    NOTIFICATIONS: '/notifications',
    MARK_NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  },

  // Public Endpoints
  PUBLIC: {
    HACKATHONS: '/public/hackathons',
    HACKATHON_DETAIL: (id: string) => `/public/hackathons/${id}`,
    LEADERBOARD: (hackathonId: string) => `/public/hackathons/${hackathonId}/leaderboard`,
  },

  // Team Management Endpoints
  TEAMS: {
    LIST: '/teams',
    MY_TEAMS: '/teams/my-teams',
    CREATE: '/teams',
    JOIN: '/teams/join', // Via code
    DETAIL: (id: string) => `/teams/${id}`,
    UPDATE: (id: string) => `/teams/${id}`,
    DELETE: (id: string) => `/teams/${id}`,
    LEAVE: (id: string) => `/teams/${id}/leave`,
    // Backend expects invites to be created via POST /teams/member/add (leader-scoped)
    INVITE_MEMBER: '/teams/member/add',
    // Backend expects DELETE /teams/:teamId/member/remove with { memberId } in body
    REMOVE_MEMBER: (teamId: string) => `/teams/${teamId}/member/remove`,
    INVITATIONS: '/teams/invitations',
    RESPOND_INVITATION: (id: string) => `/teams/invitations/${id}`,
    ACCEPT_INVITE: '/teams/accept-invite',
  },

  // Submission Endpoints
  SUBMISSIONS: {
    LIST: '/submissions',
    CREATE: '/submissions/create',
    DETAIL: (id: string) => `/submissions/${id}`,
    UPDATE: (id: string) => `/submissions/${id}`,
    DELETE: (id: string) => `/submissions/${id}`,
    UPLOAD_FILE: (id: string) => `/submissions/${id}/upload`,
    DOWNLOAD_FILE: (id: string, fileId: string) => `/submissions/${id}/files/${fileId}/download`,
  },

  // Judge Portal Endpoints
  JUDGE: {
    DASHBOARD: '/judge/dashboard',
    EVENTS: '/judge/events', // List of hackathons judge is assigned to
    ASSIGNMENTS: '/judge/assignments', // Teams assigned for evaluation
    SUBMISSION_DETAIL: (teamId: string) => `/judge/submission/${teamId}`,
    SAVE_DRAFT: (teamId: string) => `/judge/evaluation/${teamId}/draft`,
    GET_DRAFT: (teamId: string) => `/judge/evaluation/${teamId}`,
    GET_STATUS: (teamId: string) => `/judge/evaluation/${teamId}/status`,
    SUBMIT_EVALUATION: (teamId: string) => `/judge/evaluation/${teamId}/submit`,
    UPDATE_EVALUATION: (teamId: string) => `/judge/evaluation/${teamId}/update`,
    MY_REVIEWS: '/judge/my-reviews',
  },

  // Admin Portal Endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    
    // Judge Management
    CREATE_JUDGE: '/admin/judge',
    JUDGES_LIST: '/admin/judges',
    UPDATE_JUDGE: (judgeId: string) => `/admin/judge/${judgeId}`,
    DELETE_JUDGE: (judgeId: string) => `/admin/judge/${judgeId}`,
    
    // Team Management
    TEAMS_LIST: '/admin/teams',
    TEAM_DETAIL: (teamId: string) => `/admin/team/${teamId}`,
    UPDATE_TEAM: (teamId: string) => `/admin/team/${teamId}`,
    VERIFY_TEAM: (teamId: string) => `/admin/team/${teamId}/verify`,
    EXPORT_TEAMS_CSV: '/admin/teams/export',
    
    // Judge Assignments
    JUDGE_ASSIGNMENTS: '/admin/judge-assignments',
    ASSIGN_TEAMS: '/admin/assignments/assign',
    REASSIGN_TEAM: '/admin/assignments/reassign',
    AUTO_BALANCE: '/admin/assignments/auto-balance',
    
    // Submissions Management
    SUBMISSIONS_LIST: '/admin/submissions',
    SUBMISSION_DETAIL: (submissionId: string) => `/admin/submission/${submissionId}`,
    UPDATE_SUBMISSION_STATUS: (submissionId: string) => `/admin/submission/${submissionId}/status`,
    DOWNLOAD_SUBMISSION: (submissionId: string) => `/admin/submission/${submissionId}/download`,
    
    // Scoring & Leaderboard
    AGGREGATE_SCORES: '/admin/scores/aggregate',
    COMPUTE_LEADERBOARD: '/admin/leaderboard/compute',
    GET_LEADERBOARD: '/admin/leaderboard',
    TOGGLE_PUBLISH_LEADERBOARD: '/admin/leaderboard/publish',
    
    // Announcements
    CREATE_ANNOUNCEMENT: '/admin/announcements',
    SEND_ANNOUNCEMENT: '/admin/announcements/send',
    SCHEDULE_ANNOUNCEMENT: '/admin/announcements/schedule',
    ANNOUNCEMENTS_LIST: '/admin/announcements',
    
    // Analytics
    ANALYTICS_OVERVIEW: '/admin/analytics/overview',
    ANALYTICS_DETAIL: '/admin/analytics/detail',
    STATE_COLLEGE_BREAKDOWN: '/admin/analytics/breakdown',
    
    // Audit & Settings
    AUDIT_LOGS: '/admin/audit-logs',
    PLATFORM_SETTINGS: '/admin/settings',
    UPDATE_PLATFORM_SETTINGS: '/admin/settings',
  },

  // Hackathon Management (Admin)
  HACKATHONS: {
    LIST: '/admin/hackathons',
    CREATE: '/admin/hackathons/create',
    DETAIL: (id: string) => `/admin/hackathons/${id}`,
    UPDATE: (id: string) => `/admin/hackathons/${id}`,
    DELETE: (id: string) => `/admin/hackathons/${id}`,
    UPDATE_PHASE: (id: string) => `/admin/hackathons/${id}/phase`,
    TOGGLE_REGISTRATION: (id: string) => `/admin/hackathons/${id}/registration`,
  },
};
