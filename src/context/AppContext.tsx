import React, { createContext, useContext, ReactNode } from 'react';
import { Provider } from 'jotai';
import { useUser, useTheme, useSidebar } from '../lib/store/hooks';

interface AppContextValue {
  user: ReturnType<typeof useUser>;
  theme: ReturnType<typeof useTheme>;
  sidebar: ReturnType<typeof useSidebar>;
}

const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const user = useUser();
  const theme = useTheme();
  const sidebar = useSidebar();

  const value: AppContextValue = {
    user,
    theme,
    sidebar
  };

  return (
    <Provider>
      <AppContext.Provider value={value}>
        {children}
      </AppContext.Provider>
    </Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}