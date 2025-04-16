import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export default function EmptyState({ 
  title, 
  message, 
  icon = <AlertCircle className="w-12 h-12 text-gray-400" />,
  action 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{message}</p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}