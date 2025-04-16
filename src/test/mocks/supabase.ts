import { vi } from 'vitest';

export const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    })),
    refreshSession: vi.fn(),
    admin: {
      createUser: vi.fn(),
      deleteUser: vi.fn()
    }
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn()
      })),
      order: vi.fn(),
      limit: vi.fn()
    })),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  })),
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(),
      download: vi.fn(),
      remove: vi.fn()
    }))
  },
  rpc: vi.fn(),
  channel: vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn()
    }))
  }))
};