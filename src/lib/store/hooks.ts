import { useAtom } from 'jotai';
import { useCallback, useRef, useMemo } from 'react';
import {
  userAtom,
  userLoadingAtom,
  userErrorAtom,
  themeAtom,
  sidebarCollapsedAtom,
  loadingStatesAtom,
  loadingMessageAtom,
  loadingProgressAtom,
  errorStatesAtom,
  dataCacheAtom,
  dataCacheTimeAtom,
  formStatesAtom,
  formErrorsAtom,
  formDirtyAtom,
  modalStatesAtom,
} from './index';

// User hooks
export function useUser() {
  const [user, setUser] = useAtom(userAtom);
  const [loading, setLoading] = useAtom(userLoadingAtom);
  const [error, setError] = useAtom(userErrorAtom);

  return useMemo(() => ({
    user,
    setUser,
    loading,
    setLoading,
    error,
    setError,
    isAuthenticated: !!user?.id
  }), [user, loading, error, setUser, setLoading, setError]);
}

// Theme hooks
export function useTheme() {
  const [theme, setTheme] = useAtom(themeAtom);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, [setTheme]);

  return useMemo(() => ({ 
    theme, 
    setTheme, 
    toggleTheme 
  }), [theme, setTheme, toggleTheme]);
}

// Sidebar hooks
export function useSidebar() {
  const [collapsed, setCollapsed] = useAtom(sidebarCollapsedAtom);

  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => !prev);
  }, [setCollapsed]);

  return useMemo(() => ({ 
    collapsed, 
    setCollapsed, 
    toggleSidebar 
  }), [collapsed, setCollapsed, toggleSidebar]);
}

// Loading hooks
export function useLoadingState(key: string) {
  const [loadingStates, setLoadingStates] = useAtom(loadingStatesAtom);
  const [message, setMessage] = useAtom(loadingMessageAtom);
  const [progress, setProgress] = useAtom(loadingProgressAtom);
  const lastUpdate = useRef(0);

  const setLoading = useCallback((isLoading: boolean) => {
    const now = Date.now();
    if (now - lastUpdate.current < 100) {
      return;
    }
    lastUpdate.current = now;
    
    setLoadingStates(prev => {
      if (prev[key] === isLoading) {
        return prev;
      }
      return { ...prev, [key]: isLoading };
    });
  }, [key, setLoadingStates]);

  return useMemo(() => ({
    isLoading: loadingStates[key] || false,
    setLoading,
    message,
    setMessage,
    progress,
    setProgress
  }), [loadingStates, key, message, progress, setLoading, setMessage, setProgress]);
}

// Error hooks
export function useErrorState(key: string) {
  const [errorStates, setErrorStates] = useAtom(errorStatesAtom);

  const setError = useCallback((error: string | null) => {
    setErrorStates(prev => {
      if (prev[key] === error) {
        return prev;
      }
      return { ...prev, [key]: error };
    });
  }, [key, setErrorStates]);

  return useMemo(() => ({
    error: errorStates[key] || null,
    setError
  }), [errorStates, key, setError]);
}

// Cache hooks
export function useDataCache<T>(key: string, ttl: number = 5 * 60 * 1000) {
  const [cache, setCache] = useAtom(dataCacheAtom);
  const [cacheTime, setCacheTime] = useAtom(dataCacheTimeAtom);
  const lastUpdate = useRef(0);

  const getData = useCallback(() => {
    const time = cacheTime[key];
    if (time && Date.now() - time > ttl) {
      // Cache expired
      setCache(prev => {
        const newCache = { ...prev };
        delete newCache[key];
        return newCache;
      });
      setCacheTime(prev => {
        const newTime = { ...prev };
        delete newTime[key];
        return newTime;
      });
      return null;
    }
    return cache[key] as T | null;
  }, [key, cache, cacheTime, ttl, setCache, setCacheTime]);

  const setData = useCallback((data: T) => {
    const now = Date.now();
    if (now - lastUpdate.current < 100) {
      return;
    }
    lastUpdate.current = now;

    setCache(prev => {
      if (JSON.stringify(prev[key]) === JSON.stringify(data)) {
        return prev;
      }
      return { ...prev, [key]: data };
    });
    setCacheTime(prev => ({ ...prev, [key]: now }));
  }, [key, setCache, setCacheTime]);

  const clearCache = useCallback(() => {
    setCache(prev => {
      const newCache = { ...prev };
      delete newCache[key];
      return newCache;
    });
    setCacheTime(prev => {
      const newTime = { ...prev };
      delete newTime[key];
      return newTime;
    });
  }, [key, setCache, setCacheTime]);

  return useMemo(() => ({ 
    getData, 
    setData, 
    clearCache 
  }), [getData, setData, clearCache]);
}

// Form hooks
export function useFormState<T>(formId: string) {
  const [formStates, setFormStates] = useAtom(formStatesAtom);
  const [formErrors, setFormErrors] = useAtom(formErrorsAtom);
  const [formDirty, setFormDirty] = useAtom(formDirtyAtom);
  const lastUpdate = useRef(0);

  const setState = useCallback((state: T) => {
    const now = Date.now();
    if (now - lastUpdate.current < 100) {
      return;
    }
    lastUpdate.current = now;

    setFormStates(prev => {
      if (JSON.stringify(prev[formId]) === JSON.stringify(state)) {
        return prev;
      }
      return { ...prev, [formId]: state };
    });
  }, [formId, setFormStates]);

  const setErrors = useCallback((errors: Record<string, string>) => {
    setFormErrors(prev => {
      if (JSON.stringify(prev[formId]) === JSON.stringify(errors)) {
        return prev;
      }
      return { ...prev, [formId]: errors };
    });
  }, [formId, setFormErrors]);

  const setDirty = useCallback((isDirty: boolean) => {
    setFormDirty(prev => {
      if (prev[formId] === isDirty) {
        return prev;
      }
      return { ...prev, [formId]: isDirty };
    });
  }, [formId, setFormDirty]);

  return useMemo(() => ({
    state: formStates[formId] as T,
    setState,
    errors: formErrors[formId] || {},
    setErrors,
    isDirty: formDirty[formId] || false,
    setDirty
  }), [formStates, formErrors, formDirty, formId, setState, setErrors, setDirty]);
}

// Modal hooks
export function useModal(modalId: string) {
  const [modalStates, setModalStates] = useAtom(modalStatesAtom);
  const lastUpdate = useRef(0);

  const isOpen = modalStates[modalId] || false;

  const openModal = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdate.current < 100) {
      return;
    }
    lastUpdate.current = now;

    setModalStates(prev => ({ ...prev, [modalId]: true }));
  }, [modalId, setModalStates]);

  const closeModal = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdate.current < 100) {
      return;
    }
    lastUpdate.current = now;

    setModalStates(prev => ({ ...prev, [modalId]: false }));
  }, [modalId, setModalStates]);

  const toggleModal = useCallback(() => {
    const now = Date.now();
    if (now - lastUpdate.current < 100) {
      return;
    }
    lastUpdate.current = now;

    setModalStates(prev => ({ ...prev, [modalId]: !prev[modalId] }));
  }, [modalId, setModalStates]);

  return useMemo(() => ({ 
    isOpen, 
    openModal, 
    closeModal, 
    toggleModal 
  }), [isOpen, openModal, closeModal, toggleModal]);
}