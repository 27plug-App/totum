import React from 'react';

interface LoadingPlaceholderProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  animate?: boolean;
}

export default function LoadingPlaceholder({
  width = '100%',
  height = '1rem',
  className = '',
  animate = true
}: LoadingPlaceholderProps) {
  return (
    <div
      style={{ width, height }}
      className={`bg-gray-200 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
      aria-busy={animate}
      aria-live="polite"
    />
  );
}