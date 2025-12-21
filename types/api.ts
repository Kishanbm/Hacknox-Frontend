// API Response Types

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Auth Related Types
export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'participant' | 'judge' | 'admin';
    first_name: string;
    last_name: string;
    avatar_url?: string;
    is_verified: boolean;
  };
}

export interface SignupResponse {
  message: string;
}

export interface MeResponse {
  id: string;
  email: string;
  role: 'participant' | 'judge' | 'admin';
  Profiles?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    bio?: string;
    github_url?: string;
    linkedin_url?: string;
    phone?: string;
  };
}

// Legacy fields for backward compatibility
export interface UserProfile {
  id: string;
  email: string;
  role: 'participant' | 'judge' | 'admin';
  first_name: string;
  last_name: string;
  avatar_url?: string;
  is_verified: boolean;
  institution?: string;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
}

// Team Types
export interface Team {
  id: string;
  name: string;
  team_code: string;
  // Sometimes backend returns join_code or joinCode
  join_code?: string;
  joinCode?: string;
  hackathon_id: string;
  // Optional display fields returned by some endpoints
  hackathon_title?: string;
  description?: string;
  created_at: string;
  leader_id: string;
  is_verified: boolean;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: 'leader' | 'member';
  joined_at: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  inviter_id: string;
  invitee_email: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  team?: Team;
}

// Hackathon Types
export interface Hackathon {
  id: string;
  title: string;
  description: string;
  theme?: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  submission_deadline: string;
  result_date?: string;
  current_phase: 'upcoming' | 'registration' | 'ongoing' | 'judging' | 'completed';
  is_registration_open: boolean;
  banner_url?: string;
  location?: string;
  mode: 'online' | 'offline' | 'hybrid';
  max_team_size: number;
  created_at: string;
}

// Submission Types
export interface Submission {
  id: string;
  team_id: string;
  hackathon_id: string;
  title: string;
  description: string;
  github_url?: string;
  demo_url?: string;
  video_url?: string;
  presentation_url?: string;
  status: 'draft' | 'submitted' | 'under_review' | 'reviewed';
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  team?: Team;
  files?: SubmissionFile[];
}

export interface SubmissionFile {
  id: string;
  submission_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

// Judge Types
export interface JudgeAssignment {
  id: string;
  judge_id: string;
  team_id: string;
  hackathon_id: string;
  assigned_at: string;
  team?: Team;
}

export interface Evaluation {
  id: string;
  judge_id: string;
  team_id: string;
  hackathon_id: string;
  innovation_score: number;
  technical_score: number;
  presentation_score: number;
  feasibility_score: number;
  impact_score: number;
  total_score: number;
  comments?: string;
  status: 'draft' | 'submitted';
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

// Dashboard Types
export interface ParticipantDashboard {
  user: MeResponse;
  teams: Team[];
  hackathons: Hackathon[];
  submissions: Submission[];
  notifications: Notification[];
  stats: {
    teamsCount: number;
    hackathonsCount: number;
    submissionsCount: number;
  };
}

export interface JudgeDashboard {
  user: MeResponse;
  assignments: JudgeAssignment[];
  evaluations: Evaluation[];
  hackathons: Hackathon[];
  stats: {
    totalAssignments: number;
    completedEvaluations: number;
    pendingEvaluations: number;
  };
}

export interface AdminDashboard {
  stats: {
    totalParticipants: number;
    totalTeams: number;
    totalSubmissions: number;
    totalJudges: number;
  };
  recentActivity: any[];
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: 'team_invite' | 'announcement' | 'deadline' | 'evaluation' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  team_id: string;
  team_name: string;
  total_score: number;
  average_score: number;
  evaluations_count: number;
}

// Announcement Types
export interface Announcement {
  id: string;
  hackathon_id: string;
  title: string;
  message: string;
  created_by: string;
  created_at: string;
  scheduled_for?: string;
  is_sent: boolean;
}

// Analytics Types
export interface AnalyticsOverview {
  totalParticipants: number;
  totalTeams: number;
  totalSubmissions: number;
  registrationTrend: Array<{ date: string; count: number }>;
  submissionTrend: Array<{ date: string; count: number }>;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details?: any;
  ip_address?: string;
  created_at: string;
  user?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}
