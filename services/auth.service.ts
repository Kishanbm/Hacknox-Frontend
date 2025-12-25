import apiClient from '../lib/axios';
import { ENDPOINTS } from '../config/endpoints';
import { LoginResponse, SignupResponse, MeResponse } from '../types/api';

/**
 * Authentication Service
 * Contains all authentication-related API calls
 */

export const authService = {
  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Register new user
   */
  signup: async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<SignupResponse> => {
    const response = await apiClient.post<SignupResponse>(ENDPOINTS.AUTH.SIGNUP, {
      firstName,
      lastName,
      email,
      password,
    });
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
  },

  /**
   * Get current user profile
   */
  me: async (): Promise<MeResponse> => {
    const response = await apiClient.get<{ message: string; user: MeResponse }>(ENDPOINTS.AUTH.ME);
    return response.data.user; // Extract user from response
  },

  /**
   * Verify email with token
   */
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  },

  /**
   * Send password reset link
   */
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
      token,
      newPassword,
    });
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    banner_url?: string;
    bio?: string;
    phone?: string;
    linkedin_url?: string;
    github_url?: string;
    badges?: any[];
    skills?: string[];
    tech_stack?: string[];
    experiences?: any[];
    projects?: any[];
    education?: any[];
    achievements?: string[];
    portfolio_url?: string;
    website_url?: string;
    timezone?: string;
    location?: string;
    availability?: string;
    languages?: string[];
    social_links?: any[];
    resume_url?: string;
    is_profile_complete?: boolean;
    profile_completed_at?: string;
    display_name?: string;
    pronouns?: string;
  }): Promise<{ message: string; profile: any }> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.EDIT_PROFILE, profileData);
    return response.data;
  },

  /**
   * Update password
   */
  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    // backend expects `oldPassword` and `newPassword`
    await apiClient.patch(ENDPOINTS.AUTH.UPDATE_PASSWORD, {
      oldPassword: currentPassword,
      newPassword,
    });
  },

  /**
   * Update email preferences
   */
  updateEmailPreferences: async (preferences: {
    receiveAnnouncements?: boolean;
    receiveDeadlines?: boolean;
    receiveEvaluations?: boolean;
  }): Promise<void> => {
    await apiClient.patch(ENDPOINTS.AUTH.UPDATE_EMAIL_PREFERENCES, preferences);
  },

  /**
   * Get public user/profile by id
   */
  getUserById: async (id: string): Promise<any> => {
    const response = await apiClient.get<{ user: any }>(ENDPOINTS.AUTH.USER_DETAIL(id));
    return response.data?.user ?? response.data;
  },
};

export default authService;
