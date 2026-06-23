import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AuthLayout: React.FC = () => {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-app-bg text-app-text">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If user is already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
