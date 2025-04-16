import { useState, useCallback } from 'react';

interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);

  const confirm = useCallback((options: ConfirmationOptions): void => {
    setOptions(options);
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(async (): Promise<void> => {
    if (options?.onConfirm) {
      try {
        await options.onConfirm();
      } catch (error) {
        console.error('Confirmation error:', error);
      }
    }
    setIsOpen(false);
  }, [options]);

  const handleCancel = useCallback((): void => {
    if (options?.onCancel) {
      options.onCancel();
    }
    setIsOpen(false);
  }, [options]);

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel
  };
}