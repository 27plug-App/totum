import { useState, useCallback } from 'react';
import { clockIn, clockOut, getTimeEntries } from '../lib/timesheet';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { useLoadingState } from '../lib/store/hooks';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

export function useTimesheet() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const { isLoading, setLoading } = useLoadingState('timesheet');
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null
  });

  const getLocation = useCallback((): Promise<{ latitude: number; longitude: number } | null> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const newLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            setLocation({ ...newLocation, error: null });
            resolve(newLocation);
          },
          error => {
            const errorMessage = 'Unable to get your location. Please enable location services.';
            setLocation({
              latitude: null,
              longitude: null,
              error: errorMessage
            });
            showError(errorMessage);
            resolve(null);
          }
        );
      } else {
        const errorMessage = 'Your browser does not support location services';
        setLocation({
          latitude: null,
          longitude: null,
          error: errorMessage
        });
        showError(errorMessage);
        resolve(null);
      }
    });
  }, [showError]);

  const handleClockIn = useCallback(async (notes?: string): Promise<any> => {
    if (!user) {
      showError('You must be logged in to clock in');
      return null;
    }

    try {
      setLoading(true);
      const locationData = await getLocation();
      
      const entry = await clockIn({
        userId: user.id,
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
        notes
      });
      showSuccess('Successfully clocked in');
      return entry;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clock in';
      showError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, getLocation, setLoading, showSuccess, showError]);

  const handleClockOut = useCallback(async (
    entryId: string,
    clientId: string,
    notes?: string
  ): Promise<any> => {
    if (!user) {
      showError('You must be logged in to clock out');
      return null;
    }

    try {
      setLoading(true);
      const locationData = await getLocation();
      
      const result = await clockOut({
        entryId,
        userId: user.id,
        clientId,
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
        notes
      });
      showSuccess('Successfully clocked out and created billing entry');
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to clock out';
      showError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, getLocation, setLoading, showSuccess, showError]);

  const fetchTimeEntries = useCallback(async (startDate: Date, endDate: Date): Promise<any[]> => {
    if (!user) {
      return [];
    }

    try {
      setLoading(true);
      const entries = await getTimeEntries(user.id, startDate, endDate);
      return entries;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch time entries';
      showError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, showError]);

  return {
    isLoading,
    location,
    getLocation,
    clockIn: handleClockIn,
    clockOut: handleClockOut,
    fetchTimeEntries
  };
}