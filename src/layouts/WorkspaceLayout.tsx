import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const WorkspaceLayout: React.FC = () => {
  const { user, loading, currentSession } = useApp();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-app-bg text-app-text">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Route guarding: if not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Prevent accessing dashboard/setup if a session is currently active
  // This directs user back to the interview session so they don't break flow
  if (currentSession && location.pathname !== '/interview/session') {
    return <Navigate to="/interview/session" replace />;
  }

  return (
    <div className="flex min-h-screen bg-app-bg text-app-text font-sans overflow-x-hidden">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main content pane */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto px-4 py-8 md:px-8 pb-24 md:pb-8">
        <div className="mx-auto w-full max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
