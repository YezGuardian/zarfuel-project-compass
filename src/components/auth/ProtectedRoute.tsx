import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
  requiresSpecial?: boolean;
  skipProfileCheck?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresAdmin = false,
  requiresSpecial = false,
  skipProfileCheck = false
}) => {
  const { user, profile, isLoading, isAdmin, isSpecial, isSuperAdmin } = useAuth();

  if (isLoading) {
    // Show loading indicator while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-zarfuel-gold mb-4" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // SuperAdmin has access to everything, bypass all other checks
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  // Check if profile is incomplete (needs first and last name)
  const isProfileIncomplete = 
    !skipProfileCheck && 
    profile && 
    (!profile.first_name || !profile.last_name);

  // Redirect to complete profile page if profile is incomplete
  if (isProfileIncomplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  // If route requires admin but user is not admin
  if (requiresAdmin && !isAdmin()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If route requires special role but user doesn't have it
  if (requiresSpecial && !isSpecial()) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If user is authenticated and has correct role, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
