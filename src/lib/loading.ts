import { atom, useAtom } from 'jotai';

// Global loading state
export const globalLoadingAtom = atom<boolean>(false);

// Loading states for different sections
export const loadingStates = {
  auth: atom<boolean>(false),
  data: atom<boolean>(false),
  form: atom<boolean>(false),
  upload: atom<boolean>(false),
  api: atom<boolean>(false)
};

// Loading messages
export const loadingMessageAtom = atom<string | null>(null);

// Loading progress (0-100)
export const loadingProgressAtom = atom<number>(0);

// Loading utilities
export function useLoading() {
  const [isGlobalLoading, setGlobalLoading] = useAtom(globalLoadingAtom);
  const [loadingMessage, setLoadingMessage] = useAtom(loadingMessageAtom);
  const [loadingProgress, setLoadingProgress] = useAtom(loadingProgressAtom);

  return {
    isLoading: isGlobalLoading,
    setLoading: setGlobalLoading,
    loadingMessage,
    setLoadingMessage,
    loadingProgress,
    setLoadingProgress,
  };
}