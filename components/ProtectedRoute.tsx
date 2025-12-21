import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

/**
 * Protected Route Component
 * Wraps routes that require authentication and/or specific roles
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/',
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user role
      const roleRedirects: Record<UserRole, string> = {
        participant: '/dashboard',
        judge: '/judge/dashboard',
        admin: '/admin/dashboard',
      };
      
      return <Navigate to={user ? roleRedirects[user.role] : '/'} replace />;
    }
  }

  return children;
};

/**
 * Redirect authenticated users away from public pages (like login)
 */
export const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect authenticated users to their role-specific dashboard
  if (isAuthenticated && user) {
    const roleRedirects: Record<UserRole, string> = {
      participant: '/dashboard',
      judge: '/judge/dashboard',
      admin: '/admin/dashboard',
    };
    
    return <Navigate to={roleRedirects[user.role]} replace />;
  }

  return children;
};

export default ProtectedRoute;
