import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  Users, 
  FileText, 
  Activity,
  TrendingUp,
  DollarSign,
  Bell,
  Plus,
  UserPlus,
  FileCheck,
  ClipboardCheck,
  X
} from 'lucide-react';
// import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

// Client schema
const clientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email').optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
  parent_id: z.string().uuid('Invalid parent ID').optional().nullable()
});

type Client = z.infer<typeof clientSchema>;

function Dashboard() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClient, setNewClient] = useState<Client>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    status: 'active',
    parent_id: null
  });

  // Query hooks
  /*const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await fetch('/api/appointments?limit=5');
      if (!response.ok) throw new Error('Failed to fetch appointments');
      return response.json();
    }
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch('/api/tasks?status=pending&limit=5');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    }
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients?status=active');
      if (!response.ok) throw new Error('Failed to fetch clients');
      return response.json();
    }
  });*/

  // Memoized stats
  /*const stats = useMemo(() => {
    const todayAppointments = appointments.filter(apt => 
      new Date(apt.start_time).toDateString() === new Date().toDateString()
    ).length;

    const completedSessions = appointments.filter(apt => apt.status === 'completed').length;
    const totalRevenue = appointments.reduce((sum, apt) => sum + (apt.amount || 0), 0);
    const utilizationRate = appointments.length > 0 
      ? (completedSessions / appointments.length) * 100 
      : 0;

    return {
      todayAppointments,
      completedSessions,
      totalRevenue,
      utilizationRate
    };
  }, [appointments]);*/

  /*const handleCreateClient = async () => {
    try {
      const validatedData = clientSchema.parse(newClient);

      const { data, error } = await supabase
        .from('clients')
        .insert([validatedData])
        .select()
        .single();

      if (error) throw error;

      mutateClients(prev => [...(prev || []), data]);
      setShowNewClient(false);
      setNewClient({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        status: 'active',
        parent_id: null
      });
      showSuccess('Client created successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        showError(error.errors[0].message);
      } else {
        showError('Failed to create client');
      }
    }
  };*/

  const quickActions = [
    {
      icon: UserPlus,
      label: 'New Client',
      onClick: () => setShowNewClient(true),
      permission: 'manage_clinical'
    },
    {
      icon: Calendar,
      label: 'Schedule Appointment',
      onClick: () => navigate('/schedule'),
      permission: 'manage_clinical'
    },
    {
      icon: FileCheck,
      label: 'Clinical Note',
      onClick: () => navigate('/clinical-notes'),
      permission: 'manage_clinical'
    },
    {
      icon: ClipboardCheck,
      label: 'Treatment Plan',
      onClick: () => navigate('/clinical/treatment-plans'),
      permission: 'manage_clinical'
    }
  ];

  /*if (appointmentsLoading || tasksLoading || clientsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }*/

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.first_name}!</h1>
            <p className="text-gray-600">Here's what's happening in your practice today</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="btn btn-secondary">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-medium">
                3
              </span>
            </button>
            <button 
              onClick={() => setShowQuickActions(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Quick Actions
            </button>
          </div>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={Calendar}
          title="Today's Sessions"
          //value={stats.todayAppointments}
          value="2"
          trend="+12%"
          trendUp={true}
          description="From last week"
          color="blue"
        />
        <MetricCard
          icon={Users}
          title="Active Clients"
          //value={clients.length}
          value="3"
          trend="+5%"
          trendUp={true}
          description="New this month"
          color="green"
        />
        <MetricCard
          icon={DollarSign}
          title="Revenue"
          //value={`$${stats.totalRevenue.toLocaleString()}`}
          value="5"
          trend="+8%"
          trendUp={true}
          description="vs last month"
          color="indigo"
        />
        <MetricCard
          icon={Activity}
          title="Utilization"
          //value={`${Math.round(stats.utilizationRate)}%`}
          value="6"
          trend="+3%"
          trendUp={true}
          description="Target: 85%"
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Schedule */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
              <button 
                onClick={() => navigate('/schedule')}
                className="btn btn-secondary"
              >
                View Calendar
              </button>
            </div>
            <div className="space-y-4">
              {/*appointments[].map(apt => (
                <div key={apt.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {apt.client?.first_name} {apt.client?.last_name}
                      </h3>
                      <span className="badge badge-success">
                        {apt.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(apt.start_time), 'h:mm a')} - {format(new Date(apt.end_time), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))*/}
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Tasks & Reminders</h2>
              <button 
                onClick={() => navigate('/tasks')}
                className="btn btn-secondary"
              >
                View All Tasks
              </button>
            </div>
            <div className="space-y-4">
              {/*tasks.map(task => (
                <div key={task.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {task.title}
                      </h3>
                      <span className={`badge ${
                        task.priority === 'high' 
                          ? 'badge-error' 
                          : task.priority === 'medium'
                          ? 'badge-warning'
                          : 'badge-success'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))*/}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="ml-3 text-sm font-medium text-blue-900">
                    Draft Notes
                  </span>
                </div>
                <span className="text-lg font-semibold text-blue-900">
                  {/*tasks.filter(task => task.type === 'note').length*/}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="ml-3 text-sm font-medium text-green-900">
                    Completed Sessions
                  </span>
                </div>
                <span className="text-lg font-semibold text-green-900">
                  {/*stats.completedSessions*/}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Modal */}
      {showQuickActions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Quick Actions</h2>
              <button
                onClick={() => setShowQuickActions(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                hasPermission(action.permission) && (
                  <button
                    key={index}
                    onClick={() => {
                      setShowQuickActions(false);
                      action.onClick();
                    }}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <action.icon className="w-8 h-8 text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-900">{action.label}</span>
                  </button>
                )
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New Client Modal */}
      {showNewClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">New Client</h2>
              <button
                onClick={() => setShowNewClient(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newClient.first_name}
                  onChange={(e) => setNewClient({ ...newClient, first_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newClient.last_name}
                  onChange={(e) => setNewClient({ ...newClient, last_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newClient.email || ''}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value || null })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newClient.phone || ''}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value || null })}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewClient(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={/*handleCreateClient*/() => {}}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, trend, trendUp, description, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:translate-y-[-2px] transition-all duration-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-auto flex items-center space-x-1">
          <TrendingUp 
            className={`w-4 h-4 ${
              trendUp ? 'text-green-500' : 'text-red-500'
            }`} 
          />
          <span className={`text-sm font-medium ${
            trendUp ? 'text-green-500' : 'text-red-500'
          }`}>
            {trend}
          </span>
        </div>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <div className="mt-2">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <span className="ml-2 text-sm text-gray-600">{description}</span>
      </div>
    </div>
  );
}

export default Dashboard;