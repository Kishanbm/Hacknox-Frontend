import apiClient from '../lib/axios';

export interface Submission {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'submitted' | 'evaluating' | 'winner';
  repo_url: string | null;
  demo_url: string | null;
  submitted_at: string | null;
  updated_at: string;
  team: {
    id: string;
    name: string;
    leader_id: string;
  };
  hackathon: {
    id: string;
    name: string;
    slug: string;
  };
  isLeader: boolean;
  canEdit: boolean;
}

export interface SubmissionDetail {
  id: string;
  team_id: string;
  hackathon_id: string;
  title: string;
  description: string | null;
  repo_url: string | null;
  demo_url: string | null;
  zip_storage_path: string | null;
  status: 'draft' | 'submitted' | 'evaluating' | 'winner';
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  team: {
    id: string;
    name: string;
    leader_id: string;
    members: Array<{
      user: {
        id: string;
        email: string;
        role: string;
        Profiles: {
          first_name: string;
          last_name: string;
        } | null;
      };
    }>;
  };
}

export interface MySubmissionsResponse {
  message: string;
  submissions: Submission[];
}

export interface SubmissionDetailResponse {
  submission: SubmissionDetail;
}

export interface UpdateSubmissionData {
  title?: string;
  description?: string;
  repo_url?: string;
  demo_url?: string;
}

const submissionsService = {
  getMySubmissions: async (): Promise<MySubmissionsResponse> => {
    const response = await apiClient.get<MySubmissionsResponse>('/participant/my-submissions');
    return response.data;
  },

  getSubmissionDetails: async (submissionId: string, hackathonId?: string): Promise<SubmissionDetailResponse> => {
    const config = hackathonId ? { headers: { 'x-hackathon-id': hackathonId } } : undefined;
    const response = await apiClient.get<SubmissionDetailResponse>(`/submissions/${submissionId}`, config as any);
    return response.data;
  },

  updateSubmission: async (submissionId: string, data: UpdateSubmissionData, hackathonId?: string) => {
    const config = hackathonId ? { headers: { 'x-hackathon-id': hackathonId } } : undefined;
    const response = await apiClient.patch(`/submissions/${submissionId}`, data, config as any);
    return response.data;
  },

  finalizeSubmission: async (submissionId: string, hackathonId?: string) => {
    const config = hackathonId ? { headers: { 'x-hackathon-id': hackathonId } } : undefined;
    const response = await apiClient.put(`/submissions/${submissionId}/finalize`, undefined, config as any);
    return response.data;
  },
};

export default submissionsService;
