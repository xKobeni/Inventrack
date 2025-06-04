import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from '../store/useAuthStore';
import { sessionManager } from './sessionManager';

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      // Start session management when authenticated
      sessionManager.start();
    } else {
      // Stop session management when not authenticated
      sessionManager.stop();
    }

    // Cleanup on unmount
    return () => {
      sessionManager.stop();
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    // Redirect to login page but save the attempted url
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
} 