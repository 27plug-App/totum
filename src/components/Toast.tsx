import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  },
  info: {
    icon: AlertCircle,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200'
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  }
};

export default function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  const { icon: Icon, bgColor, textColor, borderColor } = toastConfig[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div 
      className={`fixed bottom-4 right-4 max-w-sm w-full ${bgColor} border ${borderColor} rounded-lg shadow-lg`} 
      role="alert" 
      aria-live="assertive" 
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${textColor}`} />
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${textColor}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${textColor}`}
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}