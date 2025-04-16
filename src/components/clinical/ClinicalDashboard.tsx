import React, { useState, useEffect, useMemo } from 'react';
import { 
  Stethoscope,
  ClipboardCheck,
  FileText, 
  Activity,
  Calendar,
  Users,
  TrendingUp,
  ArrowRight,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  X,
  Edit
} from 'lucide-react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../LoadingSpinner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

// Treatment plan schema
const treatmentPlanSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  provider_id: z.string().uuid('Invalid provider ID'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  goals: z.array(z.object({
    description: z.string().min(1, 'Goal description is required'),
    target_date: z.string().min(1, 'Target date is required'),
    status: z.enum(['pending', 'in_progress', 'completed']),
    progress: z.number().min(0).max(100)
  })).min(1, 'At least one goal is required'),
  status: z.enum(['draft', 'active', 'completed', 'archived']).default('draft')
});

type TreatmentPlan = z.infer<typeof treatmentPlanSchema> & {
  id: string;
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
};

function ClinicalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success: showSuccess, error: showError } = useToast();
  const [showNewPlan, setShowNewPlan] = useState<boolean>(false);
  const [newPlan, setNewPlan] = useState<{
    client_id: string;
    start_date: string;
    end_date: string;
    diagnosis: string;
    goals: {
      description: string;
      target_date: string;
      status: 'pending';
      progress: number;
    }[];
  }>({
    client_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    diagnosis: '',
    goals: [{
      description: '',
      target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      progress: 0
    }]
  });

  // Query hooks
  /*const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients?status=active');
      if (!response.ok) throw new Error('Failed to fetch clients');
      return response.json();
    }
  });

  const { data: treatmentPlans = [], isLoading: plansLoading, error: plansError } = useQuery<TreatmentPlan[]>({
    queryKey: ['treatment-plans'],
    queryFn: async () => {
      const response = await fetch('/api/treatment-plans?limit=5');
      if (!response.ok) throw new Error('Failed to fetch treatment plans');
      return response.json();
    }
  });

  const { data: assessments = [], isLoading: assessmentsLoading } = useQuery({
    queryKey: ['assessments'],
    queryFn: async () => {
      const response = await fetch('/api/assessments?limit=5');
      if (!response.ok) throw new Error('Failed to fetch assessments');
      return response.json();
    }
  });

  const { data: outcomes = [], isLoading: outcomesLoading } = useQuery({
    queryKey: ['outcomes'],
    queryFn: async () => {
      const response = await fetch('/api/outcomes?limit=5');
      if (!response.ok) throw new Error('Failed to fetch outcomes');
      return response.json();
    }
  });*/

  // Memoized stats
  /*const stats = useMemo(() => {
    const totalPlans = treatmentPlans.length;
    const activePlans = treatmentPlans.filter(plan => plan.status === 'active').length;
    const completedAssessments = assessments.filter(a => a.status === 'completed').length;
    const averageOutcome = outcomes.length > 0
      ? outcomes.reduce((sum, o) => 
          sum + Object.values(o.metrics).reduce((a, b) => a + b, 0) / Object.values(o.metrics).length, 
        0) / outcomes.length
      : 0;

    return {
      totalPlans,
      activePlans,
      completedAssessments,
      averageOutcome
    };
  }, [treatmentPlans, assessments, outcomes]);*/

  const handleCreatePlan = async () => {
    try {
      const validatedData = treatmentPlanSchema.parse({
        ...newPlan,
        provider_id: user?.id,
        status: 'draft'
      });

      const response = await fetch('/api/treatment-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (!response.ok) {
        throw new Error('Failed to create treatment plan');
      }

      const data = await response.json();

      if (error) throw error;

      mutatePlans(prev => [data, ...(prev || [])]);
      setShowNewPlan(false);
      setNewPlan({
        client_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        diagnosis: '',
        goals: [{
          description: '',
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          progress: 0
        }]
      });
      showSuccess('Treatment plan created successfully');
      navigate(`/clinical/treatment-plans/${data.id}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        showError(error.errors[0].message);
      } else {
        showError('Failed to create treatment plan');
      }
    }
  };

  const addGoal = () => {
    setNewPlan(prev => ({
      ...prev,
      goals: [
        ...prev.goals,
        {
          description: '',
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          progress: 0
        }
      ]
    }));
  };

  const removeGoal = (index: number) => {
    setNewPlan(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const updateGoal = (index: number, updates: Partial<typeof newPlan.goals[0]>) => {
    setNewPlan(prev => ({
      ...prev,
      goals: prev.goals.map((goal, i) => 
        i === index ? { ...goal, ...updates } : goal
      )
    }));
  };

  /*if (plansLoading || clientsLoading || assessmentsLoading || outcomesLoading) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clinical Dashboard</h1>
            <p className="text-gray-600">Monitor treatment progress and outcomes</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowNewPlan(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Treatment Plan
            </button>
          </div>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          icon={ClipboardCheck}
          title="Active Treatment Plans"
          //value={stats.activePlans}
          //total={stats.totalPlans}
          value={3}
          total={9}
          trend="+12%"
          trendUp={true}
          color="blue"
        />
        <MetricCard
          icon={FileText}
          title="Completed Assessments"
          //value={stats.completedAssessments}
          //total={assessments.length}
          value={7}
          total={15}
          trend="+5%"
          trendUp={true}
          color="green"
        />
        <MetricCard
          icon={Activity}
          title="Average Outcome"
          //value={`${Math.round(stats.averageOutcome)}%`}
          value={0}
          total={20}
          trend="+8%"
          trendUp={true}
          color="indigo"
        />
        <MetricCard
          icon={Users}
          title="Active Clients"
          //value={treatmentPlans.filter(p => p.status === 'active').length}
          value={1}
          total={10}
          trend="+3%"
          trendUp={true}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Treatment Plans */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Treatment Plans</h2>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/clinical/treatment-plans')}
              >
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
            <div className="space-y-4">
              {/* treatmentPlans.map((plan) => (
                <div key={plan.id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {plan.client.first_name} {plan.client.last_name}
                      </h3>
                      <span className={`badge ${
                        plan.status === 'active' 
                          ? 'badge-success' 
                          : plan.status === 'completed'
                          ? 'badge-info'
                          : 'badge-warning'
                      }`}>
                        {plan.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {format(new Date(plan.start_date), 'MMM d, yyyy')} - {format(new Date(plan.end_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              )) */}
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
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span className="ml-3 text-sm font-medium text-blue-900">
                    Pending Reviews
                  </span>
                </div>
                <span className="text-lg font-semibold text-blue-900">
                  {/*treatmentPlans.filter(p => p.status === 'pending_review').length*/}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="ml-3 text-sm font-medium text-green-900">
                    Goals Achieved
                  </span>
                </div>
                <span className="text-lg font-semibold text-green-900">
                  {/*treatmentPlans.reduce((sum, plan) => 
                    sum + plan.goals.filter(g => g.status === 'completed').length, 
                  0) */}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="ml-3 text-sm font-medium text-yellow-900">
                    Due for Review
                  </span>
                </div>
                <span className="text-lg font-semibold text-yellow-900">
                  {/* treatmentPlans.filter(p => 
                    new Date(p.end_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                  ).length */}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Treatment Plan Modal */}
      {showNewPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">New Treatment Plan</h2>
              <button
                onClick={() => setShowNewPlan(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Client
                </label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={newPlan.client_id}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, client_id: e.target.value }))}
                >
                  <option value="">Select client</option>
                  {/* clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </option>
                  )) */}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newPlan.start_date}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newPlan.end_date}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Diagnosis
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  value={newPlan.diagnosis}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Enter diagnosis and clinical impressions..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Treatment Goals</h3>
                  <button
                    onClick={addGoal}
                    className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Goal
                  </button>
                </div>

                <div className="space-y-4">
                  {newPlan.goals.map((goal, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Goal Description
                            </label>
                            <textarea
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                              rows={2}
                              value={goal.description}
                              onChange={(e) => updateGoal(index, { description: e.target.value })}
                              placeholder="Enter goal description..."
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Target Date
                              </label>
                              <input
                                type="date"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={goal.target_date}
                                onChange={(e) => updateGoal(index, { target_date: e.target.value })}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Initial Progress
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={goal.progress}
                                onChange={(e) => updateGoal(index, { progress: Number(e.target.value) })}
                              />
                            </div>
                          </div>
                        </div>

                        {newPlan.goals.length > 1 && (
                          <button
                            onClick={() => removeGoal(index)}
                            className="ml-4 p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNewPlan(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlan}
                  disabled={!newPlan.client_id || !newPlan.diagnosis || newPlan.goals.some(g => !g.description)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Treatment Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, total, trend, trendUp, color }) {
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
        {total && (
          <span className="ml-2 text-sm text-gray-600">of {total}</span>
        )}
      </div>
    </div>
  );
}

export default ClinicalDashboard;