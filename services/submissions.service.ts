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
    // Add a cache-busting timestamp param to avoid 304 cached empty responses
    const response = await apiClient.get<MySubmissionsResponse>('/participant/my-submissions', {
      params: { _ts: Date.now() },
    });
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

  createSubmission: async (data: { team_id: string } & UpdateSubmissionData, hackathonId?: string) => {
    const config = hackathonId ? { headers: { 'x-hackathon-id': hackathonId } } : undefined;
    const response = await apiClient.post(`/submissions`, data, config as any);
    return response.data;
  },

  /**
   * Create or update a submission draft with optional ZIP file upload.
   * Uses multipart/form-data and the backend expects the file field name to be `zipFile`.
   */
  createSubmissionWithFile: async (
    data: { team_id?: string } & UpdateSubmissionData,
    file?: File | null,
    hackathonId?: string,
    onProgress?: (percent: number) => void
  ) => {
    const form = new FormData();
    if (data.title) form.append('title', data.title);
    if (data.description) form.append('description', data.description);
    if (data.repo_url) form.append('repoUrl', data.repo_url as any);
    if (data.demo_url) form.append('demoUrl', data.demo_url as any);
    if ((data as any).team_id) form.append('teamId', (data as any).team_id as any);
    if (file) form.append('zipFile', file, file.name);

    const headers: any = { 'Content-Type': 'multipart/form-data' };
    if (hackathonId) headers['x-hackathon-id'] = hackathonId;

    const resp = await apiClient.upload('/submissions', form, (progressEvent: any) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    });

    return resp.data;
  },

  finalizeSubmission: async (submissionId: string, hackathonId?: string) => {
    const config = hackathonId ? { headers: { 'x-hackathon-id': hackathonId } } : undefined;
    const response = await apiClient.put(`/submissions/${submissionId}/finalize`, undefined, config as any);
    return response.data;
  },
};

export default submissionsService;
