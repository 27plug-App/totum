import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart,
  TrendingUp,
  Target,
  Calendar,
  User,
  Download,
  ArrowRight,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Plus
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../LoadingSpinner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useLoadingState } from '../../lib/store/hooks';
import VirtualList from '../VirtualList';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Outcome {
  id: string;
  client_id: string;
  provider_id: string;
  assessment_id: string;
  date: string;
  metrics: {
    category: string;
    score: number;
    previous_score: number;
    target: number;
  }[];
  notes: string;
  created_at: string;
  client: {
    first_name: string;
    last_name: string;
  };
  provider: {
    first_name: string;
    last_name: string;
  };
}

function OutcomeTracking() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30');
  const { isLoading, setLoading } = useLoadingState('outcomes');

  // Query hooks with optimized data fetching
  /*const { data: outcomes = [], loading: outcomesLoading, error: outcomesError } = useSupabaseQuery<Outcome>({
    query: supabase
      .from('outcomes')
      .select(`
        *,
        client:clients(first_name, last_name),
        provider:users(first_name, last_name)
      `)
      .order('date', { ascending: false }),
    key: 'outcomes'
  });

  const { data: clients = [], loading: clientsLoading } = useSupabaseQuery({
    query: supabase
      .from('clients')
      .select('id, first_name, last_name')
      .eq('status', 'active'),
    key: 'active-clients'
  });*/

  // Memoized filtered outcomes
  /*const filteredOutcomes = useMemo(() => {
    return outcomes.filter(outcome => 
      selectedClient === 'all' || outcome.client_id === selectedClient
    );
  }, [outcomes, selectedClient]);

  // Memoized stats
  const stats = useMemo(() => {
    const totalOutcomes = filteredOutcomes.length;
    const averageScore = filteredOutcomes.reduce((sum, outcome) => 
      sum + outcome.metrics.reduce((acc, m) => acc + m.score, 0) / outcome.metrics.length,
    0) / (totalOutcomes || 1);

    const improvementRate = filteredOutcomes.reduce((sum, outcome) => {
      const improved = outcome.metrics.filter(m => m.score > m.previous_score).length;
      return sum + (improved / outcome.metrics.length);
    }, 0) / (totalOutcomes || 1);

    const goalsAchieved = filteredOutcomes.reduce((sum, outcome) => 
      sum + outcome.metrics.filter(m => m.score >= m.target).length,
    0);

    return {
      totalOutcomes,
      averageScore,
      improvementRate,
      goalsAchieved
    };
  }, [filteredOutcomes]);*/

  // Chart data
  /*const progressChartData = useMemo(() => {
    const categories = Array.from(new Set(
      filteredOutcomes.flatMap(o => o.metrics.map(m => m.category))
    ));

    const datasets = categories.map(category => {
      const data = filteredOutcomes.map(outcome => {
        const metric = outcome.metrics.find(m => m.category === category);
        return metric?.score || 0;
      });

      return {
        label: category,
        data,
        borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
        backgroundColor: `hsla(${Math.random() * 360}, 70%, 50%, 0.1)`,
        tension: 0.4
      };
    });

    return {
      labels: filteredOutcomes.map(o => format(new Date(o.date), 'MMM d')),
      datasets
    };
  }, [filteredOutcomes]);*/

  /*if (outcomesLoading || clientsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (outcomesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Error Loading Outcomes</h3>
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
            <h1 className="text-2xl font-bold text-gray-900">Outcome Tracking</h1>
            <p className="text-gray-600">Monitor and analyze treatment outcomes</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="btn btn-secondary">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
            {hasPermission('manage_clinical') && (
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/clinical/outcomes/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Record Outcome
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="ml-2 text-sm font-medium text-blue-900">Average Score</span>
            </div>
            <span className="text-lg font-semibold text-blue-900">
              {Math.round(30)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="ml-2 text-sm font-medium text-green-900">Improvement Rate</span>
            </div>
            <span className="text-lg font-semibold text-green-900">
              {Math.round(0.5 * 100)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-indigo-600" />
              <span className="ml-2 text-sm font-medium text-indigo-900">Goals Achieved</span>
            </div>
            <span className="text-lg font-semibold text-indigo-900">
              {10}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart className="w-5 h-5 text-purple-600" />
              <span className="ml-2 text-sm font-medium text-purple-900">Total Outcomes</span>
            </div>
            <span className="text-lg font-semibold text-purple-900">
              {5}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="all">All Clients</option>
              {/* clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              )) */}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="180">Last 6 Months</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress Chart 
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Progress Overview</h2>
        <Line 
          data={progressChartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  callback: (value) => `${value}%`
                }
              }
            }
          }}
        />
      </div>*/}

      {/* Outcomes List 
      <div className="space-y-6">
        <VirtualList
          items={filteredOutcomes}
          rowHeight={300}
          renderItem={(outcome) => (
            <div key={outcome.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {outcome.client.first_name[0]}{outcome.client.last_name[0]}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {outcome.client.first_name} {outcome.client.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Assessment Date: {format(new Date(outcome.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                  View Details
                  <ArrowRight className="w-4 h-4 ml-1 inline" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {outcome.metrics.map((metric, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      {metric.category}
                    </h4>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {metric.score}%
                        </span>
                        <span className={`text-sm font-medium ${
                          metric.score > metric.previous_score
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {(metric.score - metric.previous_score).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${metric.score}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>Previous: {metric.previous_score}%</span>
                        <span>Target: {metric.target}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {outcome.notes && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">{outcome.notes}</p>
                </div>
              )}
            </div>
          )}
        />
      </div>*/}
      
    </div>
  );
}

export default OutcomeTracking;