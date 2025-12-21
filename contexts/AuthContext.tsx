import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient, { ApiError } from '../lib/axios';

// User Role Type
export type UserRole = 'participant' | 'judge' | 'admin';

// User Interface
export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

// Auth Context Interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  refetchUser: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Manages authentication state for all three portals
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  /**
   * Check authentication status by fetching current user
   */
  const checkAuth = async (): Promise<void> => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await apiClient.get('/auth/me');
      const userData = response.data;

      const user: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.first_name,
        lastName: userData.last_name,
        avatarUrl: userData.avatar_url,
        isVerified: userData.is_verified,
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login function
   */
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;

      // Store token
      localStorage.setItem('authToken', token);

      // Map backend response to User interface
      const user: User = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.first_name,
        lastName: userData.last_name,
        avatarUrl: userData.avatar_url,
        isVerified: userData.is_verified,
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Login failed');
    }
  };

  /**
   * Signup function
   */
  const signup = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<void> => {
    try {
      await apiClient.post('/auth/signup', {
        firstName,
        lastName,
        email,
        password,
      });
      // Note: User needs to verify email before logging in
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Signup failed');
    }
  };

  /**
   * Logout function
   */
  const logout = async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('selectedHackathonId');
      setUser(null);
    }
  };

  /**
   * Verify email with token
   */
  const verifyEmail = async (token: string): Promise<void> => {
    try {
      await apiClient.post('/auth/verify-email', { token });
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Email verification failed');
    }
  };

  /**
   * Update user data locally (after profile update)
   */
  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  /**
   * Refetch user data from server
   */
  const refetchUser = async (): Promise<void> => {
    await checkAuth();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    verifyEmail,
    updateUser,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook to check if user has specific role
 */
export const useRole = (requiredRole: UserRole | UserRole[]): boolean => {
  const { user } = useAuth();
  
  if (!user) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user.role === requiredRole;
};

export default AuthContext;
