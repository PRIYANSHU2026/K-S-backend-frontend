import type React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  redirectPath = '/login',
}) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();

  // If still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="ml-3 text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // If there's a required permission and user doesn't have it, redirect to dashboard
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated and authorized, render the children
  return <>{children}</>;
};

// This route is only accessible to non-authenticated users
// For example, login and register pages
export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // If still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, render the route
  return <>{/* Render children via Outlet or other means */}</>;
};
