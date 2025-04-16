import React, { useState, useCallback, useEffect } from 'react';
import { 
  Clock, 
  MapPin, 
  DollarSign,
  Play,
  Square,
  AlertCircle,
  Calendar,
  Filter,
  Download,
  Search,
  User,
  FileText,
  ChevronDown,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { z } from 'zod';

// Validation schema
const timeEntrySchema = z.object({
  user_id: z.string().uuid('Invalid user ID'),
  clock_in: z.string().min(1, 'Clock in time is required'),
  clock_out: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  billing_status: z.enum(['pending', 'billed', 'void']).default('pending')
});

type TimeEntry = z.infer<typeof timeEntrySchema> & {
  id: string;
  created_at: string;
  updated_at: string;
  billing_entries?: {
    id: string;
    amount: number;
    status: string;
  }[];
};

function Timesheet() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [showNewTimesheet, setShowNewTimesheet] = useState<boolean>(false);
  const [newEntry, setNewEntry] = useState<{
    date: string;
    startTime: string;
    endTime: string;
    notes: string;
    client_id: string;
    startLocation: { latitude: number | null; longitude: number | null };
    endLocation: { latitude: number | null; longitude: number | null };
  }>({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    notes: '',
    client_id: '',
    startLocation: { latitude: null, longitude: null },
    endLocation: { latitude: null, longitude: null }
  });

  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    error: string | null;
  }>({
    latitude: null,
    longitude: null,
    error: null
  });

  // Query hooks
  /*const { data: entries = [], loading, error, mutate } = useSupabaseQuery<TimeEntry>({
    query: supabase
      .from('time_entries')
      .select(`
        *,
        billing_entries (
          id,
          amount,
          status,
          service_code
        )
      `)
      .eq('user_id', user?.id || '')
      .gte('clock_in', startOfWeek(selectedWeek).toISOString())
      .lte('clock_in', endOfWeek(selectedWeek).toISOString())
      .order('clock_in', { ascending: false }),
    key: 'time-entries',
    enabled: !!user?.id
  });

  const { data: clients = [] } = useSupabaseQuery({
    query: supabase
      .from('clients')
      .select('id, first_name, last_name')
      .eq('status', 'active'),
    key: 'active-clients'
  });*/

  // Get current active entry
  // const activeEntry = entries.find(entry => !entry.clock_out);

  // Get location
  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      showError('Your browser does not support location services');
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (error) {
      showError('Unable to get your location. Please enable location services.');
      return null;
    }
  }, [showError]);

  useEffect(() => {
    const initLocation = async () => {
      const loc = await getLocation();
      if (loc) {
        setLocation({ ...loc, error: null });
      }
    };
    initLocation();
  }, [getLocation]);

  const handleCreateTimesheet = async () => {
    try {
      // Get current location for start time
      const startLoc = await getLocation();
      if (!startLoc) {
        showError('Unable to get location for clock in');
        return;
      }

      // Get current location for end time
      const endLoc = await getLocation();
      if (!endLoc) {
        showError('Unable to get location for clock out');
        return;
      }

      const startDateTime = new Date(`${newEntry.date}T${newEntry.startTime}`);
      const endDateTime = new Date(`${newEntry.date}T${newEntry.endTime}`);

      // Create time entry with locations
      const { data: timeEntry, error: timeError } = await supabase
        .from('time_entries')
        .insert([{
          user_id: user?.id,
          clock_in: startDateTime.toISOString(),
          clock_out: endDateTime.toISOString(),
          notes: newEntry.notes,
          latitude: startLoc.latitude,
          longitude: startLoc.longitude,
          billing_status: 'pending'
        }])
        .select()
        .single();

      if (timeError) throw timeError;

      // Create billing entry if client is selected
      if (newEntry.client_id) {
        const duration = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60); // Duration in minutes
        const rate = user?.billing_rate || 0;
        const amount = (duration / 60) * rate; // Convert to hours

        const { error: billingError } = await supabase
          .from('billing_entries')
          .insert([{
            time_entry_id: timeEntry.id,
            provider_id: user?.id,
            client_id: newEntry.client_id,
            service_code: 'TIME',
            units: Math.ceil(duration / 15), // 15-minute units
            amount,
            status: 'pending'
          }]);

        if (billingError) throw billingError;
      }

      // Update UI
      mutate();
      setShowNewTimesheet(false);
      setNewEntry({
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        notes: '',
        client_id: '',
        startLocation: { latitude: null, longitude: null },
        endLocation: { latitude: null, longitude: null }
      });
      showSuccess('Timesheet created successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        showError(error.errors[0].message);
      } else {
        showError('Failed to create timesheet');
      }
    }
  };

  const calculateDuration = (entry: TimeEntry) => {
    const start = new Date(entry.clock_in);
    const end = entry.clock_out ? new Date(entry.clock_out) : new Date();
    const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const calculateDailyTotal = (entries: TimeEntry[]) => {
    return entries.reduce((total, entry) => {
      const start = new Date(entry.clock_in);
      const end = entry.clock_out ? new Date(entry.clock_out) : new Date();
      return total + (end.getTime() - start.getTime()) / (1000 * 60);
    }, 0);
  };

  const weekDays = eachDayOfInterval({
    start: startOfWeek(selectedWeek),
    end: endOfWeek(selectedWeek)
  });

  /*if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Error Loading Time Entries</h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }*/

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Timesheet</h1>
            <p className="text-gray-600">Track your time and billable hours</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowNewTimesheet(true)}
              className="btn btn-secondary"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Timesheet
            </button>
            {/*activeEntry*/ false ? (
              <div className="flex items-center space-x-4">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="">Select client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {/* Handle clock out */}}
                  disabled={!selectedClient}
                  className={`btn ${
                    selectedClient 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Clock Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {/* Handle clock in */}}
                className="btn btn-primary bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Clock In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Weekly View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Summary</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedWeek(new Date(selectedWeek.setDate(selectedWeek.getDate() - 7)))}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronDown className="w-5 h-5 transform rotate-90" />
              </button>
              <span className="text-sm font-medium text-gray-600">
                {format(startOfWeek(selectedWeek), 'MMM d')} - {format(endOfWeek(selectedWeek), 'MMM d, yyyy')}
              </span>
              <button
                onClick={() => setSelectedWeek(new Date(selectedWeek.setDate(selectedWeek.getDate() + 7)))}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronDown className="w-5 h-5 transform -rotate-90" />
              </button>
            </div>
          </div>
        </div>

      <div className="divide-y divide-gray-200">
          {/* weekDays.map(day => {
            const dayEntries = entries.filter(entry => 
              new Date(entry.clock_in).toDateString() === day.toDateString()
            );
            const totalMinutes = calculateDailyTotal(dayEntries);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = Math.round(totalMinutes % 60);

            return (
              <div key={day.toISOString()} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    {format(day, 'EEEE, MMM d')}
                  </h3>
                  <span className="text-sm font-medium text-gray-600">
                    Total: {hours}h {minutes}m
                  </span>
                </div>

                <div className="space-y-4">
                  {dayEntries.map(entry => (
                    <div key={entry.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {format(new Date(entry.clock_in), 'h:mm a')} - {
                              entry.clock_out 
                                ? format(new Date(entry.clock_out), 'h:mm a')
                                : 'Ongoing'
                            }
                          </div>
                          {entry.notes && (
                            <p className="text-sm text-gray-500 mt-1">{entry.notes}</p>
                          )}
                          {entry.latitude && entry.longitude && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {entry.latitude.toFixed(6)}, {entry.longitude.toFixed(6)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-900">
                          {calculateDuration(entry)}
                        </span>
                        {entry.billing_entries?.[0] && (
                          <div className="flex items-center text-gray-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span className="text-sm">
                              ${entry.billing_entries[0].amount.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }) */}
        </div>
      </div>

      {/* New Timesheet Modal */}
      {showNewTimesheet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">New Timesheet Entry</h2>
              <button
                onClick={() => setShowNewTimesheet(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Clock In Time
                  </label>
                  <input
                    type="time"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Clock Out Time
                  </label>
                  <input
                    type="time"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client (Required for Billable Hours)
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newEntry.client_id}
                  onChange={(e) => setNewEntry({ ...newEntry, client_id: e.target.value })}
                >
                  <option value="">Select client</option>
                  {/*clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  ))*/}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  placeholder="Add notes about your work..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewTimesheet(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTimesheet}
                  disabled={!newEntry.date || !newEntry.startTime || !newEntry.endTime || !newEntry.client_id}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Timesheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timesheet;