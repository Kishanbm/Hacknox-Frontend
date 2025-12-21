import axios from '../lib/axios';
import { ENDPOINTS } from '../config/endpoints';

export interface JudgeAssignment {
  id: string;
  hackathon_id: string;
  hackathon: {
    id: string;
    title: string;
  };
  team: {
    id: string;
    name: string;
    leader_id: string;
    verification_status: string;
    project_category: string;
    submission: {
      id: string;
      status: string;
      submitted_at: string;
      repo_url: string;
      zip_storage_path: string;
      title: string;
    }[];
  };
  evaluation: {
    id: string;
    status: string;
    submitted_at: string;
    score: number;
  }[];
}

export interface AssignmentsResponse {
  message: string;
  teams: JudgeAssignment[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export const judgeService = {
  getAssignedTeams: async (page: number = 1, limit: number = 10, hackathonId?: string) => {
    const params: any = { page, limit };
    // Build axios options and include header when hackathonId supplied
    const options: any = { params };

    // If a specific hackathon is selected -> send it in header.
    // If the filter is set to show "All" (or "All Events") explicitly opt-out
    // so the axios interceptor does not inject a stored hackathon id automatically.
    if (hackathonId && hackathonId !== 'All' && hackathonId !== 'All Events') {
      options.headers = { 'x-hackathon-id': hackathonId };
    } else {
      // explicit opt-out: set header to false so interceptor won't add stored id
      options.headers = { 'x-hackathon-id': false };
    }

    const response = await axios.get<AssignmentsResponse>(ENDPOINTS.JUDGE.ASSIGNMENTS, options);
    return response.data;
  },

  getEvents: async () => {
    const response = await axios.get(ENDPOINTS.JUDGE.EVENTS);
    return response.data;
  }
,

  getSubmissionForEvaluation: async (teamId: string) => {
    const response = await axios.get(`${ENDPOINTS.JUDGE.SUBMISSION_DETAIL(teamId)}`);
    return response.data;
  },

  getEvaluationDraft: async (teamId: string) => {
    const response = await axios.get(`${ENDPOINTS.JUDGE.GET_DRAFT(teamId)}`);
    return response.data;
  },

  getEvaluationStatus: async (teamId: string) => {
    const response = await axios.get(`${ENDPOINTS.JUDGE.GET_STATUS(teamId)}`);
    return response.data;
  },

  saveEvaluationDraft: async (teamId: string, payload: any) => {
    const response = await axios.post(`${ENDPOINTS.JUDGE.SAVE_DRAFT(teamId)}`, payload);
    return response.data;
  },

  submitFinalEvaluation: async (teamId: string, payload: any) => {
    const response = await axios.post(`${ENDPOINTS.JUDGE.SUBMIT_EVALUATION(teamId)}`, payload);
    return response.data;
  },

  updateSubmittedEvaluation: async (teamId: string, payload: any) => {
    const response = await axios.patch(`${ENDPOINTS.JUDGE.UPDATE_EVALUATION(teamId)}`, payload);
    return response.data;
  }
};
