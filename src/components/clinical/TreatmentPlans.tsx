import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck,
  Search,
  Plus,
  FileText,
  Calendar,
  Target,
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  MoreVertical,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../LoadingSpinner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useLoadingState } from '../../lib/store/hooks';
import VirtualList from '../VirtualList';

interface TreatmentPlan {
  id: string;
  client_id: string;
  provider_id: string;
  start_date: string;
  end_date: string;
  diagnosis: string;
  goals: {
    id: string;
    description: string;
    target_date: string;
    status: 'pending' | 'in_progress' | 'completed';
    progress: number;
  }[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  client: {
    first_name: string;
    last_name: string;
  };
  provider: {
    first_name: string;
    last_name: string;
  };
}

function TreatmentPlans() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewPlan, setShowNewPlan] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);
  const { isLoading, setLoading } = useLoadingState('treatment-plans');

  // Query hooks with proper dependencies
  /*const { data: plans = [], loading: plansLoading, error: plansError, mutate } = useSupabaseQuery<TreatmentPlan>({
    query: supabase
      .from('treatment_plans')
      .select(`
        *,
        client:clients(first_name, last_name),
        provider:users(first_name, last_name)
      `)
      .order('created_at', { ascending: false }),
    key: 'treatment-plans',
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const { data: clients = [], loading: clientsLoading } = useSupabaseQuery({
    query: supabase
      .from('clients')
      .select('id, first_name, last_name')
      .eq('status', 'active'),
    key: 'active-clients',
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000 // 30 minutes
  });*/

  // Memoized filtered plans
  /*const filteredPlans = useMemo(() => {
    return plans.filter(plan => {
      const matchesSearch = 
        plan.client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || plan.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [plans, searchTerm, statusFilter]);

  // Memoized stats
  const stats = useMemo(() => {
    const totalPlans = plans.length;
    const activePlans = plans.filter(p => p.status === 'active').length;
    const completedPlans = plans.filter(p => p.status === 'completed').length;
    const totalGoals = plans.reduce((sum, plan) => sum + plan.goals.length, 0);
    const completedGoals = plans.reduce((sum, plan) => 
      sum + plan.goals.filter(g => g.status === 'completed').length, 
    0);

    return {
      totalPlans,
      activePlans,
      completedPlans,
      totalGoals,
      completedGoals,
      completionRate: totalGoals ? (completedGoals / totalGoals) * 100 : 0
    };
  }, [plans]);*/

  /*if (plansLoading || clientsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (plansError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Error Loading Treatment Plans</h3>
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
            <h1 className="text-2xl font-bold text-gray-900">Treatment Plans</h1>
            <p className="text-gray-600">Manage and track patient treatment plans</p>
          </div>
          {hasPermission('manage_clinical') && (
            <button
              onClick={() => navigate('/clinical/treatment-plans/new')}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Treatment Plan
            </button>
          )}
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              <span className="ml-2 text-sm font-medium text-blue-900">Active Plans</span>
            </div>
            <span className="text-lg font-semibold text-blue-900">
              {/*stats.activePlans*/}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="ml-2 text-sm font-medium text-green-900">Completed</span>
            </div>
            <span className="text-lg font-semibold text-green-900">
              {/*stats.completedPlans*/}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-indigo-600" />
              <span className="ml-2 text-sm font-medium text-indigo-900">Goals Met</span>
            </div>
            <span className="text-lg font-semibold text-indigo-900">
              {/*stats.completedGoals}/{stats.totalGoals*/}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-5 h-5 text-purple-600" />
              <span className="ml-2 text-sm font-medium text-purple-900">Success Rate</span>
            </div>
            <span className="text-lg font-semibold text-purple-900">
              {Math.round(20)}%
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search treatment plans..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Treatment Plans List 
      <div className="space-y-6">
        <VirtualList
          items={filteredPlans}
          rowHeight={300}
          renderItem={(plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {plan.client.first_name[0]}{plan.client.last_name[0]}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {plan.client.first_name} {plan.client.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Provider: Dr. {plan.provider.first_name} {plan.provider.last_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    plan.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : plan.status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : plan.status === 'archived'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                  </span>
                  {hasPermission('manage_clinical') && (
                    <>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-full"
                        onClick={() => navigate(`/clinical/treatment-plans/${plan.id}/edit`)}
                      >
                        <Edit className="w-5 h-5 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-full">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Diagnosis</h4>
                    <p className="mt-1 text-sm text-gray-900">{plan.diagnosis}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {format(new Date(plan.start_date), 'MMM d, yyyy')} - {format(new Date(plan.end_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {format(new Date(plan.updated_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Treatment Goals</h4>
                <div className="space-y-4">
                  {plan.goals.map((goal) => (
                    <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Target className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {goal.description}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          goal.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : goal.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {goal.status.replace('_', ' ').charAt(0).toUpperCase() + 
                           goal.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="flex-1 mr-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm text-gray-600">{goal.progress}%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Target Date: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate(`/clinical/treatment-plans/${plan.id}`)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate(`/clinical/treatment-plans/${plan.id}/progress`)}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Update Progress
                </button>
              </div>
            </div>
          )}
        />
      </div>*/}
    </div>
  );
}

export default TreatmentPlans;