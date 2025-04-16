import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export default function LoadingButton({
  children,
  loading = false,
  loadingText = 'Loading...',
  icon,
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg
        transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${loading ? 'cursor-wait' : ''}
        ${className}`}
      aria-busy={loading}
      aria-disabled={loading || disabled}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}