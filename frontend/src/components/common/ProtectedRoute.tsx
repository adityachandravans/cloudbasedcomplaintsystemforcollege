import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullPage message="Verifying session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if unauthorized for this specific page
    const targetDashboard =
      user.role === 'admin'
        ? '/admin-dashboard'
        : user.role === 'hod'
        ? '/hod-dashboard'
        : user.role === 'staff'
        ? '/staff-dashboard'
        : '/student-dashboard';

    return <Navigate to={targetDashboard} replace />;
  }

  return <>{children}</>;
};
