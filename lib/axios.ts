import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Get base URL from environment variable or fallback to localhost
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Custom API Client with interceptors for authentication and error handling
 */
class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true, // Important: Send cookies with requests
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request Interceptor
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add Authorization header if token exists in localStorage
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add selected hackathon ID if it exists (for judge/admin/participant routes)
        // Allow callers to opt-out by passing `headers: { 'x-hackathon-id': false }` in the request config.
        if (config.headers && (config.headers as any)['x-hackathon-id'] === false) {
          // explicit opt-out: do not add header
        } else {
          const selectedHackathonId = localStorage.getItem('selectedHackathonId');
          if (selectedHackathonId && config.headers) {
            (config.headers as any)['x-hackathon-id'] = selectedHackathonId;
          }
        }

        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized (Token expired or invalid)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Clear authentication state
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          
          // Redirect to login page
          window.location.href = '/#/login';
          
          return Promise.reject(error);
        }

        // Handle 403 Forbidden (Insufficient permissions)
        if (error.response?.status === 403) {
          console.error('Access denied: Insufficient permissions');
        }

        // Handle network errors
        if (!error.response) {
          console.error('Network error: Could not connect to server');
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Centralized error handler
   */
  private handleError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      status: error.response?.status || 500,
      code: 'UNKNOWN_ERROR',
    };

    if (error.response) {
      // Server responded with error
      const data = error.response.data as any;
      apiError.message = data?.message || error.message;
      apiError.status = error.response.status;
      apiError.code = data?.code || 'SERVER_ERROR';
      apiError.details = data?.details;
    } else if (error.request) {
      // Request made but no response
      apiError.message = 'Network error: Could not connect to server';
      apiError.code = 'NETWORK_ERROR';
    } else {
      // Error in request configuration
      apiError.message = error.message;
      apiError.code = 'REQUEST_ERROR';
    }

    return apiError;
  }

  // HTTP Methods
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  /**
   * Upload files with multipart/form-data
   */
  public upload<T = any>(url: string, formData: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  }

  /**
   * Get the base Axios instance for advanced usage
   */
  public getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Error interface
export interface ApiError {
  message: string;
  status: number;
  code: string;
  details?: any;
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export default for easier imports
export default apiClient;
