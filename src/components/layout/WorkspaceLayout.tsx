import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';

export const WorkspaceLayout: React.FC = () => {
  const { user, currentSession } = useApp();
  const location = useLocation();

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
