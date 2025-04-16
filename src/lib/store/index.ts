import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { User } from '../../types/auth';
import { Notification } from '../../components/layout/NotificationCenter';

// User state
export const userAtom = atomWithStorage<User | null>('user', null);
export const userLoadingAtom = atom<boolean>(true);
export const userErrorAtom = atom<string | null>(null);

// App settings
export const themeAtom = atomWithStorage<'light' | 'dark'>('theme', 'light');
export const sidebarCollapsedAtom = atomWithStorage<boolean>('sidebarCollapsed', false);

// Loading states
export const loadingStatesAtom = atom<Record<string, boolean>>({});
export const loadingMessageAtom = atom<string | null>(null);
export const loadingProgressAtom = atom<number>(0);

// Error states
export const errorStatesAtom = atom<Record<string, string | null>>({});

// Data cache
export const dataCacheAtom = atom<Record<string, any>>({});
export const dataCacheTimeAtom = atom<Record<string, number>>({});

// Form states
export const formStatesAtom = atom<Record<string, any>>({});
export const formErrorsAtom = atom<Record<string, Record<string, string>>>({});
export const formDirtyAtom = atom<Record<string, boolean>>({});

// Modal states
export const modalStatesAtom = atom<Record<string, boolean>>({});

// Notifications
export const notificationsAtom = atom<Notification[]>([]);