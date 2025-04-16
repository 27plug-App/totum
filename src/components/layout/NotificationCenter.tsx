import React, { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { notificationsAtom } from '../../lib/store';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useAtom<Notification[]>(notificationsAtom);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, [setNotifications]);

  useEffect(() => {
    const timers = notifications.map(notification => {
      if (notification.duration !== 0) {
        return setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration || 5000);
      }
      return null;
    });

    return () => {
      timers.forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [notifications, removeNotification]);

  if (!notifications.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 min-w-[320px] max-w-[420px]">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`flex items-start p-4 rounded-lg shadow-lg border animate-slide-in ${
            notification.type === 'success' ? 'bg-green-50 border-green-200' :
            notification.type === 'error' ? 'bg-red-50 border-red-200' :
            notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
            'bg-blue-50 border-blue-200'
          }`}
          role="alert"
        >
          <div className="flex-shrink-0">
            {notification.type === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            {notification.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-red-600" />
            )}
            {notification.type === 'warning' && (
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            )}
            {notification.type === 'info' && (
              <Info className="w-5 h-5 text-blue-600" />
            )}
          </div>

          <div className="ml-3 flex-1 pt-[2px]">
            <p className={`text-sm font-medium ${
              notification.type === 'success' ? 'text-green-800' :
              notification.type === 'error' ? 'text-red-800' :
              notification.type === 'warning' ? 'text-yellow-800' :
              'text-blue-800'
            }`}>
              {notification.message}
            </p>
          </div>

          <button
            onClick={() => removeNotification(notification.id)}
            className={`ml-4 flex-shrink-0 rounded-full p-1 transition-colors ${
              notification.type === 'success' ? 'hover:bg-green-100 text-green-600' :
              notification.type === 'error' ? 'hover:bg-red-100 text-red-600' :
              notification.type === 'warning' ? 'hover:bg-yellow-100 text-yellow-600' :
              'hover:bg-blue-100 text-blue-600'
            }`}
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}