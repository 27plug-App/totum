import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { notificationsAtom } from '../lib/store';
import type { Notification } from '../components/layout/NotificationCenter';

export function useNotifications() {
  const [notifications, setNotifications] = useAtom(notificationsAtom);

  const addNotification = useCallback((
    message: string,
    type: Notification['type'] = 'info',
    duration: number = 5000
  ): string => {
    const id = Math.random().toString(36).substring(2);
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    return id;
  }, [setNotifications]);

  const removeNotification = useCallback((id: string): void => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, [setNotifications]);

  const clearNotifications = useCallback((): void => {
    setNotifications([]);
  }, [setNotifications]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success: (message: string, duration?: number) => 
      addNotification(message, 'success', duration),
    error: (message: string, duration?: number) => 
      addNotification(message, 'error', duration),
    warning: (message: string, duration?: number) => 
      addNotification(message, 'warning', duration),
    info: (message: string, duration?: number) => 
      addNotification(message, 'info', duration)
  };
}