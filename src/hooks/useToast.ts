import { toast } from 'sonner';

export function useToast() {
  return {
    success: (message: string) => toast.success(message),
    error: (message: string) => toast.error(message),
    warning: (message: string) => toast.warning(message),
    info: (message: string) => toast.info(message),
    promise: <T>(
      promise: Promise<T>,
      {
        loading = 'Loading...',
        success = 'Success!',
        error = 'Error!',
      }: {
        loading?: string;
        success?: string | ((data: T) => string);
        error?: string | ((error: Error) => string);
      } = {}
    ): Promise<T> => {
      return toast.promise(promise, {
        loading,
        success: (data) => (typeof success === 'function' ? success(data) : success),
        error: (err) => (typeof error === 'function' ? error(err) : error),
      });
    },
    custom: (
      message: string,
      {
        type = 'default',
        duration = 5000,
        position = 'bottom-right',
      }: {
        type?: 'default' | 'success' | 'error' | 'warning' | 'info';
        duration?: number;
        position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
      } = {}
    ): string => {
      return toast(message, {
        duration,
        position,
        type,
      });
    },
    dismiss: (toastId?: string) => {
      if (toastId) {
        toast.dismiss(toastId);
      } else {
        toast.dismiss();
      }
    },
  };
}