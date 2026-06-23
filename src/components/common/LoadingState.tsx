import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Analyzing with AI Evaluation Engine...',
  fullScreen = false
}) => {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 bg-app-bg/90 backdrop-blur-md flex flex-col items-center justify-center space-y-4'
    : 'w-full py-12 flex flex-col items-center justify-center space-y-3';

  return (
    <div className={containerClasses}>
      <LoadingSpinner size="lg" />
      <p className="text-xs font-bold uppercase tracking-widest text-app-muted animate-pulse">{message}</p>
    </div>
  );
};
