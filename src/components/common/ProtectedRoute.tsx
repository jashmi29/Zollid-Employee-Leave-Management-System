import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { UserRole } from '../../types.js';

interface Props {
  children: React.ReactElement;
  allowedRole?: UserRole;
}

export const ProtectedRoute: React.FC<Props> = ({ children, allowedRole }) => {
  const { isAuthenticated, isLoading, role, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isManagerUser = role === 'manager';

  if (allowedRole === 'manager') {
    if (!isManagerUser) {
      return <Navigate to="/dashboard" replace />;
    }
  } else if (allowedRole && role !== allowedRole) {
    const redirectPath = isManagerUser ? '/manager/dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};
