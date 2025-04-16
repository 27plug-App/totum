import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { mockSupabase } from '../../test/mocks/supabase';
import { AppProvider } from '../../context/AppContext';
import { createUser } from '../../test/factories/user';

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with loading state', () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: null
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AppProvider
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('handles successful authentication', async () => {
    const mockUser = createUser();

    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: { user: { id: mockUser.id } } },
      error: null
    });

    mockSupabase.from('users').select().eq('id', mockUser.id).single.mockResolvedValueOnce({
      data: mockUser,
      error: null
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AppProvider
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('handles authentication error', async () => {
    mockSupabase.auth.getSession.mockResolvedValueOnce({
      data: { session: null },
      error: new Error('Auth error')
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AppProvider
    });

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('handles login', async () => {
    const mockUser = createUser();
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: mockUser },
      error: null
    });

    mockSupabase.from('users').select().eq('id', mockUser.id).single.mockResolvedValueOnce({
      data: mockUser,
      error: null
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AppProvider
    });

    await act(async () => {
      await result.current.login(credentials.email, credentials.password);
    });

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith(credentials);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('handles logout', async () => {
    mockSupabase.auth.signOut.mockResolvedValueOnce({
      error: null
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AppProvider
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('checks permissions correctly', () => {
    const adminUser = createUser({ role: 'admin' });
    const employeeUser = createUser({
      role: 'employee',
      permissions: ['manage_clinical']
    });

    const { result: adminResult } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AppProvider initialUser={adminUser}>{children}</AppProvider>
      )
    });

    const { result: employeeResult } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AppProvider initialUser={employeeUser}>{children}</AppProvider>
      )
    });

    expect(adminResult.current.hasPermission('any_permission')).toBe(true);
    expect(employeeResult.current.hasPermission('manage_clinical')).toBe(true);
    expect(employeeResult.current.hasPermission('unknown_permission')).toBe(false);
  });
});