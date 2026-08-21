import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AuthLoadingScreen } from './AuthLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps any route that requires authentication.
 * - While session is loading: shows full-screen loader (prevents flash of login page)
 * - If unauthenticated: redirects to /login with returnTo query param
 * - If authenticated: renders children
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    // Preserve intended destination so after login we redirect back
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return <>{children}</>;
};

/**
 * Redirects already-authenticated users away from login/signup pages.
 */
export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (user) {
    // Check if there's a returnTo param
    const params = new URLSearchParams(location.search);
    const returnTo = params.get('returnTo') ?? '/app/dashboard';
    return <Navigate to={returnTo} replace />;
  }

  return <>{children}</>;
};
