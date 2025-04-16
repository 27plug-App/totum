import React, { useState, useCallback } from 'react';
import { 
  Calendar as CalendarIcon,
  Clock,
  User,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useConfirmation } from '../hooks/useConfirmation';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { z } from 'zod';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Define schemas
const appointmentSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  provider_id: z.string().uuid('Invalid provider ID'),
  type: z.string().min(1, 'Appointment type is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  notes: z.string().optional(),
  location: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'cancelled', 'completed']).default('scheduled'),
});

type Appointment = z.infer<typeof appointmentSchema> & {
  id: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
  users?: {
    first_name: string;
    last_name: string;
  };
};

function Schedule() {
  const { user, hasPermission } = useAuth();
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState<Date>(new Date());
  const [showNewAppointment, setShowNewAppointment] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [newAppointment, setNewAppointment] = useState<Omit<Appointment, 'id'>>({
    client_id: '',
    provider_id: user?.id || '',
    type: '',
    start_time: '',
    end_time: '',
    notes: '',
    location: '',
    status: 'scheduled'
  });

  const { error: showError, success: showSuccess } = useToast();
  const { confirm } = useConfirmation();

  // Query hooks
  /*const { data: appointments = [], loading: appointmentsLoading, error: appointmentsError, mutate: mutateAppointments } = useSupabaseQuery<Appointment>({
    query: supabase
      .from('appointments')
      .select(`
        *,
        clients (first_name, last_name),
        users (first_name, last_name)
      `),
    key: 'appointments',
    enabled: !!user?.id
  });

  const { data: clients = [], loading: clientsLoading, error: clientsError } = useSupabaseQuery({
    query: supabase
      .from('clients')
      .select('id, first_name, last_name')
      .eq('status', 'active'),
    key: 'active-clients',
    enabled: !!user?.id
  });

  const { data: providers = [], loading: providersLoading, error: providersError } = useSupabaseQuery({
    query: supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('role', 'employee'),
    key: 'providers',
    enabled: !!user?.id
  });*/

  const handleSelectSlot = useCallback(({ start, end }) => {
    if (!hasPermission('manage_clinical')) return;
    
    setSelectedSlot({ start, end });
    setNewAppointment(prev => ({
      ...prev,
      start_time: start.toISOString(),
      end_time: end.toISOString()
    }));
    setShowNewAppointment(true);
  }, [hasPermission]);

  /*const handleSelectEvent = useCallback((event: Appointment) => {
    confirm({
      title: 'Appointment Details',
      message: `
        Client: ${event.clients?.first_name} ${event.clients?.last_name}
        Provider: ${event.users?.first_name} ${event.users?.last_name}
        Type: ${event.type}
        Time: ${format(new Date(event.start_time), 'PPp')} - ${format(new Date(event.end_time), 'p')}
        Status: ${event.status}
        ${event.location ? `Location: ${event.location}` : ''}
        ${event.notes ? `Notes: ${event.notes}` : ''}
      `,
      confirmText: hasPermission('manage_clinical') ? 'Cancel Appointment' : 'Close',
      cancelText: 'Close',
      onConfirm: async () => {
        if (!hasPermission('manage_clinical')) return;
        
        try {
          const { error } = await supabase
            .from('appointments')
            .update({ status: 'cancelled' })
            .eq('id', event.id);

          if (error) throw error;

          mutateAppointments(prev => 
            prev?.map(apt => 
              apt.id === event.id ? { ...apt, status: 'cancelled' } : apt
            ) ?? []
          );
          showSuccess('Appointment cancelled successfully');
        } catch (error) {
          showError('Failed to cancel appointment');
        }
      }
    });
  }, [confirm, mutateAppointments, showSuccess, showError, hasPermission]); */

  const handleCreateAppointment = async () => {
    try {
      const validatedData = appointmentSchema.parse(newAppointment);

      const { data, error } = await supabase
        .from('appointments')
        .insert([validatedData])
        .select(`
          *,
          clients (first_name, last_name),
          users (first_name, last_name)
        `)
        .single();

      if (error) throw error;

      mutateAppointments(prev => [...(prev ?? []), data]);
      setShowNewAppointment(false);
      showSuccess('Appointment created successfully');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create appointment');
    }
  };

  /*if (appointmentsLoading || clientsLoading || providersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (appointmentsError || clientsError || providersError) {
    return (
      <EmptyState
        title="Error loading schedule"
        message="Failed to load appointments. Please try again."
        icon={<AlertCircle className="w-12 h-12 text-red-500" />}
        action={
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        }
      />
    );
  }*/

  /*const formattedAppointments = appointments?.map(apt => ({
    ...apt,
    start: new Date(apt.start_time),
    end: new Date(apt.end_time),
    title: `${apt.clients?.first_name} ${apt.clients?.last_name} - ${apt.type}`
  })) ?? [];*/

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
            <p className="text-gray-600">Manage appointments and sessions</p>
          </div>
          {hasPermission('manage_clinical') && (
            <button
              onClick={() => setShowNewAppointment(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </button>
          )}
        </div>
      </header>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <Calendar
          localizer={localizer}
          //events={formattedAppointments}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 250px)' }}
          onSelectEvent={/*handleSelectEvent*/ () => {}}
          onSelectSlot={handleSelectSlot}
          selectable={hasPermission('manage_clinical')}
          view={view}
          onView={setView as any}
          date={date}
          onNavigate={setDate}
          eventPropGetter={event => ({
            className: `bg-${event.status === 'cancelled' ? 'red' : 'blue'}-100 text-${event.status === 'cancelled' ? 'red' : 'blue'}-800 border-${event.status === 'cancelled' ? 'red' : 'blue'}-200`
          })}
          messages={{
            today: 'Today',
            previous: 'Previous',
            next: 'Next',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Time',
            event: 'Event',
            noEventsInRange: 'No appointments in this time range.',
          }}
        />
      </div>

      {/* New Appointment Modal */}
      {showNewAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Schedule New Appointment</h2>
              <button
                onClick={() => setShowNewAppointment(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Client</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newAppointment.client_id}
                  onChange={e => setNewAppointment(prev => ({ ...prev, client_id: e.target.value }))}
                >
                  <option value="">Select client</option>
                  {/* clients?.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  )) */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Provider</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newAppointment.provider_id}
                  onChange={e => setNewAppointment(prev => ({ ...prev, provider_id: e.target.value }))}
                >
                  <option value="">Select provider</option>
                  {/* providers?.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.first_name} {provider.last_name}
                    </option>
                  )) */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newAppointment.type}
                  onChange={e => setNewAppointment(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="">Select type</option>
                  <option value="Initial Assessment">Initial Assessment</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Therapy Session">Therapy Session</option>
                  <option value="Consultation">Consultation</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newAppointment.start_time.slice(0, 16)}
                    onChange={e => setNewAppointment(prev => ({ ...prev, start_time: new Date(e.target.value).toISOString() }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newAppointment.end_time.slice(0, 16)}
                    onChange={e => setNewAppointment(prev => ({ ...prev, end_time: new Date(e.target.value).toISOString() }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newAppointment.location}
                  onChange={e => setNewAppointment(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Room 101, Video Call, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  value={newAppointment.notes}
                  onChange={e => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes or instructions..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewAppointment(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAppointment}
                  disabled={!newAppointment.client_id || !newAppointment.provider_id || !newAppointment.type || !newAppointment.start_time || !newAppointment.end_time}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Schedule Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;