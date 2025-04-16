import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useLoading } from '../lib/loading';

interface LoadingOverlayProps {
  blur?: boolean;
  transparent?: boolean;
}

export default function LoadingOverlay({ 
  blur = true,
  transparent = false 
}: LoadingOverlayProps) {
  const { loadingMessage, loadingProgress } = useLoading();

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center
        ${blur ? 'backdrop-blur-sm' : ''}
        ${transparent ? 'bg-white/50' : 'bg-white/80'}`}
      aria-busy="true"
      aria-live="polite"
    >
      <LoadingSpinner 
        size="large"
        message={loadingMessage || 'Loading...'}
        progress={loadingProgress}
      />
    </div>
  );
}