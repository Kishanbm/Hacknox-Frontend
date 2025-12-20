// API Configuration
export const API_CONFIG = {
  // Replace with your actual backend URL or use environment variable
  BASE_URL: 'http://localhost:8000/api/v1', 
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Centralized Endpoint Registry
export const ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_CONFIG.BASE_URL}/auth/login`,
    REGISTER: `${API_CONFIG.BASE_URL}/auth/register`,
    LOGOUT: `${API_CONFIG.BASE_URL}/auth/logout`,
    REFRESH: `${API_CONFIG.BASE_URL}/auth/refresh`,
  },
  
  USER: {
    PROFILE: `${API_CONFIG.BASE_URL}/user/profile`,
    UPDATE_PROFILE: `${API_CONFIG.BASE_URL}/user/profile/update`,
    STATS: `${API_CONFIG.BASE_URL}/user/stats`, // KPIs for Dashboard
    NOTIFICATIONS: `${API_CONFIG.BASE_URL}/user/notifications`,
    SETTINGS: `${API_CONFIG.BASE_URL}/user/settings`,
    ROADMAP: `${API_CONFIG.BASE_URL}/user/roadmap`,
  },

  HACKATHONS: {
    LIST: `${API_CONFIG.BASE_URL}/hackathons`, // Supports query params ?status=live
    ACTIVE: `${API_CONFIG.BASE_URL}/hackathons/active`, // For hero slider
    DETAIL: (id: string) => `${API_CONFIG.BASE_URL}/hackathons/${id}`,
    REGISTER: (id: string) => `${API_CONFIG.BASE_URL}/hackathons/${id}/register`,
  },

  TEAMS: {
    LIST: `${API_CONFIG.BASE_URL}/teams`,
    CREATE: `${API_CONFIG.BASE_URL}/teams/create`,
    JOIN: `${API_CONFIG.BASE_URL}/teams/join`, // Via code
    DETAIL: (id: string) => `${API_CONFIG.BASE_URL}/teams/${id}`,
    INVITES: `${API_CONFIG.BASE_URL}/teams/invites`,
    RESPOND_INVITE: (id: string) => `${API_CONFIG.BASE_URL}/teams/invites/${id}/respond`, // Action: accept/decline
    LEAVE: (id: string) => `${API_CONFIG.BASE_URL}/teams/${id}/leave`,
  },

  SUBMISSIONS: {
    LIST: `${API_CONFIG.BASE_URL}/submissions`,
    CREATE: `${API_CONFIG.BASE_URL}/submissions/create`,
    DETAIL: (id: string) => `${API_CONFIG.BASE_URL}/submissions/${id}`,
    UPDATE: (id: string) => `${API_CONFIG.BASE_URL}/submissions/${id}`,
    UPLOAD_ASSETS: (id: string) => `${API_CONFIG.BASE_URL}/submissions/${id}/assets`,
  },

  ORGANIZER: {
    PROFILE: (id: string) => `${API_CONFIG.BASE_URL}/organizers/${id}`,
  },

  // Judge Portal Endpoints
  JUDGE: {
    DASHBOARD: `${API_CONFIG.BASE_URL}/judge/dashboard`, // Stats, deadlines, pending actions
    HACKATHONS: `${API_CONFIG.BASE_URL}/judge/hackathons`, // List of assigned hackathons
    INVITATIONS: `${API_CONFIG.BASE_URL}/judge/invitations`, // Pending judge invites
    RESPOND_INVITE: (id: string) => `${API_CONFIG.BASE_URL}/judge/invitations/${id}/respond`,
    ASSIGNMENTS: `${API_CONFIG.BASE_URL}/judge/assignments`, // Evaluation queue
    SUBMISSION_DETAIL: (id: string) => `${API_CONFIG.BASE_URL}/judge/submissions/${id}`, // Specific submission to grade
    SUBMIT_SCORE: (id: string) => `${API_CONFIG.BASE_URL}/judge/submissions/${id}/score`, // POST evaluation
    PROFILE: `${API_CONFIG.BASE_URL}/judge/profile`,
    UPDATE_PROFILE: `${API_CONFIG.BASE_URL}/judge/profile/update`,
  }
};
