
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'border-primary-600' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-16 w-16',
  };

  return (
    <div
      className={`animate-spin rounded-full border-t-2 border-b-2 ${sizeClasses[size]} ${color}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
