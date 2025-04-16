import { useState, useEffect, useCallback, useMemo } from 'react';
import { Parse, createNewInstallation } from '../lib/parse';
import { useToast } from './useToast';
import { User } from '../models/user';
import { useNavigate } from 'react-router-dom';
import { MainHelper } from '../lib/helpers/main-helper';

export function useAuth() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
 
  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = Parse.User.current() as User;
   
        if (currentUser) {

          setUser(currentUser);
          setError(null);

          setIsAuthenticated(true);
        }
      } catch (error) {

        // console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
        setUser(null);

      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      await Parse.User.logIn(email, password).then(
        async (user: any) => {
          // const user = Parse.User.current() as User;
          console.log('logged user', user);

          setUser(user);
          setIsAuthenticated(true);

          createNewInstallation();

          navigate(0);

        },() => {
          showError('Login failed. Please check your credentials and try again.');
        }
      );
      
    } catch (error) {

      const message = error instanceof Error ? error.message : 'Authentication failed';
      setError(message);
      showError('Login failed. Please check your credentials and try again.');
     
    } finally {
      setLoading(false);
    }
  }, [showError, isAuthenticated, navigate]);

  const logout = useCallback(async (): Promise<void> => {
    try {

      await Parse.User.logOut().then(() => {
        setIsAuthenticated(false);

        setUser(null);
        setError(null);

        navigate('/');
      })
        
    } catch (error) {

      const message = error instanceof Error ? error.message : 'Logout failed';
      showError(message);
      throw error;

    }
  }, [showError]);

  const updateUser = useCallback( async () => {
    const user = Parse.User.current();
    await user.fetch();

    setUser(user);
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {

    const currentUser = Parse.User.current() as User;

    return MainHelper.grantPermission(currentUser, permission);

  }, [user]);

  return useMemo(() => ({
    user,
    loading,
    error,
    login,
    logout,
    hasPermission,
    isAuthenticated,
    updateUser
  }), [user, loading, error, login, logout, updateUser, hasPermission, isAuthenticated, updateUser]);
}