import React, { Suspense } from 'react';
import { useAppContext } from '../../context/AppContext';
import Sidebar from '../Sidebar';
import LoadingSpinner from '../LoadingSpinner';
import ErrorBoundary from '../ErrorBoundary';
import NotificationCenter from './NotificationCenter';

interface LayoutProps {
  children: React.ReactNode;
} 

export default function Layout({ children }: LayoutProps) {
  const { theme, sidebar } = useAppContext();

  return (
    <div className={`min-h-screen ${theme.theme === 'dark' ? 'dark' : 'light'}`}>
      <div className="flex h-screen bg-gray-50 ">
        <Sidebar collapsed={sidebar.collapsed} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <ErrorBoundary>
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <LoadingSpinner size="large" />
                </div>
              }>
                { <NotificationCenter /> }
                {children}
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}