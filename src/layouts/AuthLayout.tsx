import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const AuthLayout: React.FC = () => {
  const { user } = useApp();

  // If user is already authenticated, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
