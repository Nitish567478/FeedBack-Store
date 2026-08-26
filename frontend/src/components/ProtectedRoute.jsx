import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, normalizeRole } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400">Authenticating session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = normalizeRole(user.role);

  if (allowedRoles) {
    const normalizedAllowed = allowedRoles.map(r => normalizeRole(r));
    if (!normalizedAllowed.includes(userRole)) {
      // Redirect to their default dashboard based on their role
      if (userRole === 'ADMIN') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole === 'STORE_OWNER') {
        return <Navigate to="/owner/dashboard" replace />;
      } else {
        return <Navigate to="/stores" replace />;
      }
    }
  }

  return children;
};
