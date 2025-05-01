import type React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface ProtectedRouteProps {
  requiredPermission?: string;
  redirectPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermission,
  redirectPath = '/login',
}) => {
  const { isAuthenticated, loading, hasPermission } = useAuth();

  // If still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
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

  // If authenticated and authorized, render the route inside the admin layout
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
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
  return <Outlet />;
};
