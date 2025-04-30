
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type ProtectedRouteProps = {
  children: ReactNode;
  requiresAdmin?: boolean;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresAdmin = false 
}) => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    // Show loading indicator while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zarfuel-gold"></div>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If route requires admin but user is not admin
  if (requiresAdmin && !isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If user is authenticated and has correct role, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
