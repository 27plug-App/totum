import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Clock,
  Activity
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import LoadingSpinner from './LoadingSpinner';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
);

interface MetricCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  description: string;
  trend: string;
  trendUp: boolean;
  color: 'blue' | 'green' | 'yellow' | 'indigo';
}

interface KPICardProps {
  title: string;
  value: string | number;
  change: string;
  positive: boolean;
}

interface Appointment {
  id: string;
  start_time: string;
  type: string;
}

interface BillingEntry {
  id: string;
  created_at: string;
  amount: string;
}

function Analytics() {
  /*const { data: appointments = [], loading: appointmentsLoading, error: appointmentsError } = useSupabaseQuery<Appointment[]>({
    query: supabase
      .from('appointments')
      .select('*')
      .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    key: 'monthly-appointments'
  });

  const { data: billingEntries = [], loading: billingLoading, error: billingError } = useSupabaseQuery<BillingEntry[]>({
    query: supabase
      .from('billing_entries')
      .select('*')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    key: 'monthly-billing'
  });

  if (appointmentsLoading || billingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (appointmentsError || billingError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Failed to load data</p>
      </div>
    );
  }*/

  const appointments: unknown = [];  
  const billingEntries: unknown = [];

  const appointmentsByDay = useMemo(() => {
    return appointments.reduce((acc, apt) => {
      const date = new Date(apt.start_time).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [appointments]);

  const revenueByDay = useMemo(() => {
    return billingEntries.reduce((acc, entry) => {
      const date = new Date(entry.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + Number(entry.amount);
      return acc;
    }, {} as Record<string, number>);
  }, [billingEntries]);

  const appointmentTypes = useMemo(() => {
    return appointments.reduce((acc, apt) => {
      acc[apt.type] = (acc[apt.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [appointments]);

  const appointmentsData = {
    labels: Object.keys(appointmentsByDay).slice(-7),
    datasets: [
      {
        label: 'Appointments',
        data: Object.values(appointmentsByDay).slice(-7),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const revenueData = {
    labels: Object.keys(revenueByDay).slice(-7),
    datasets: [
      {
        label: 'Revenue',
        data: Object.values(revenueByDay).slice(-7),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const appointmentTypesData = {
    labels: Object.keys(appointmentTypes),
    datasets: [
      {
        data: Object.values(appointmentTypes),
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)',
          'rgba(34, 197, 94, 0.5)',
          'rgba(239, 68, 68, 0.5)',
          'rgba(234, 179, 8, 0.5)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
          'rgb(234, 179, 8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your practice's performance and metrics</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={Calendar}
          title="Total Appointments"
          value={/*appointments*/[].length}
          description="Last 30 days"
          trend="+12%"
          trendUp={true}
          color="blue"
        />
        <MetricCard
          icon={DollarSign}
          title="Revenue"
          value={`$${/*billingEntries*/[].reduce((sum, entry) => sum + Number(entry.amount), 0).toFixed(2)}`}
          description="Last 30 days"
          trend="+8%"
          trendUp={true}
          color="green"
        />
        <MetricCard
          icon={Clock}
          title="Avg. Session Duration"
          value="45 min"
          description="This month"
          trend="-5%"
          trendUp={false}
          color="yellow"
        />
        <MetricCard
          icon={Activity}
          title="Utilization Rate"
          value="78%"
          description="This month"
          trend="+3%"
          trendUp={true}
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointments Overview</h2>
          <Bar
            data={appointmentsData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
          <Line
            data={revenueData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KPICard
              title="Client Retention"
              value="92%"
              change="+2.5%"
              positive={true}
            />
            <KPICard
              title="No-Show Rate"
              value="4.8%"
              change="-1.2%"
              positive={true}
            />
            <KPICard
              title="New Clients"
              value="24"
              change="+8"
              positive={true}
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Types</h2>
          <Doughnut
            data={appointmentTypesData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, description, trend, trendUp, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-auto flex items-center space-x-1">
          <TrendingUp className={`w-4 h-4 ${trendUp ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-sm font-medium ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
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

function KPICard({ title, value, change, positive }: KPICardProps) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-medium text-gray-600">{title}</h4>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className={`ml-2 text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </p>
      </div>
    </div>
  );
}

export default Analytics;