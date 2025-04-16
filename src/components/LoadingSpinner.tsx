import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
  message?: string;
  progress?: number;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = 'text-blue-600',
  className = '',
  message,
  progress
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} aria-busy="true" aria-live="polite">
      <Loader2 className={`animate-spin ${color} ${sizeClasses[size]}`} />
      
      {message && (
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      )}

      {typeof progress === 'number' && (
        <div className="mt-4 w-48">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 text-center">{progress}%</p>
        </div>
      )}
    </div>
  );
}