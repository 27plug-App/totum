import React from 'react';
import { Toaster } from 'sonner';

export default function ToastContainer(): JSX.Element {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'white',
          color: 'black',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '1rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        success: {
          style: {
            borderColor: '#86efac',
            backgroundColor: '#f0fdf4',
          },
        },
        error: {
          style: {
            borderColor: '#fca5a5',
            backgroundColor: '#fef2f2',
          },
        },
        warning: {
          style: {
            borderColor: '#fcd34d',
            backgroundColor: '#fffbeb',
          },
        },
        info: {
          style: {
            borderColor: '#93c5fd',
            backgroundColor: '#eff6ff',
          },
        },
      }}
    />
  );
}