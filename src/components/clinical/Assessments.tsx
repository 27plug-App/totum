import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Activity,
  Trash2,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../LoadingSpinner';
import { format } from 'date-fns';
import { z } from 'zod';

// Validation schema
const assessmentSchema = z.object({
  client_id: z.string().uuid('Invalid client ID'),
  provider_id: z.string().uuid('Invalid provider ID'),
  type: z.string().min(1, 'Assessment type is required'),
  date: z.string().min(1, 'Assessment date is required'),
  scores: z.record(z.number().min(0).max(100)),
  recommendations: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'reviewed']).default('pending')
});

type Assessment = z.infer<typeof assessmentSchema> & {
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

const ASSESSMENT_TYPES = [
  'Initial Assessment',
  'Progress Assessment',
  'Discharge Assessment',
  'Behavioral Assessment',
  'Speech & Language Assessment',
  'Occupational Assessment'
];

const DEFAULT_SCORES = {
  'Communication': 0,
  'Social Skills': 0,
  'Behavior': 0,
  'Motor Skills': 0,
  'Cognitive Skills': 0
};

function Assessments() {
  const { user, hasPermission } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showNewAssessment, setShowNewAssessment] = useState<boolean>(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  const [newAssessment, setNewAssessment] = useState({
    client_id: '',
    type: '',
    date: new Date().toISOString().split('T')[0],
    scores: DEFAULT_SCORES,
    recommendations: '',
    status: 'pending' as const
  });

  // Query hooks
  /*const { data: assessments = [], loading, error, mutate } = useSupabaseQuery<Assessment>({
    query: supabase
      .from('assessments')
      .select(`
        *,
        client:clients(first_name, last_name),
        provider:users(first_name, last_name)
      `)
      .order('date', { ascending: false }),
    key: 'assessments'
  });

  const { data: clients = [] } = useSupabaseQuery({
    query: supabase
      .from('clients')
      .select('id, first_name, last_name')
      .eq('status', 'active'),
    key: 'active-clients'
  });*/

  const handleSaveAssessment = async () => {
    try {
      const validatedData = assessmentSchema.parse({
        ...newAssessment,
        provider_id: user?.id
      });

      const { data, error } = await supabase
        .from('assessments')
        .insert([validatedData])
        .select(`
          *,
          client:clients(first_name, last_name),
          provider:users(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      mutate(prev => [data, ...(prev || [])]);
      setShowNewAssessment(false);
      setNewAssessment({
        client_id: '',
        type: '',
        date: new Date().toISOString().split('T')[0],
        scores: DEFAULT_SCORES,
        recommendations: '',
        status: 'pending'
      });
      showSuccess('Assessment created successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        showError(error.errors[0].message);
      } else {
        showError('Failed to create assessment');
      }
    }
  };

  /*const handleUpdateAssessment = async (assessment: Assessment) => {
    try {
      const validatedData = assessmentSchema.parse({
        ...assessment,
        provider_id: assessment.provider_id
      });

      const { data, error } = await supabase
        .from('assessments')
        .update(validatedData)
        .eq('id', assessment.id)
        .select(`
          *,
          client:clients(first_name, last_name),
          provider:users(first_name, last_name)
        `)
        .single();

      if (error) throw error;

      mutate(prev => 
        prev?.map(a => a.id === assessment.id ? data : a) ?? []
      );
      setSelectedAssessment(null);
      showSuccess('Assessment updated successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        showError(error.errors[0].message);
      } else {
        showError('Failed to update assessment');
      }
    }
  };*/

  /*const handleDeleteAssessment = async (assessmentId: string) => {
    try {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', assessmentId);

      if (error) throw error;

      mutate(prev => prev?.filter(a => a.id !== assessmentId) ?? []);
      showSuccess('Assessment deleted successfully');
    } catch (error) {
      showError('Failed to delete assessment');
    }
  };*/

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'reviewed':
        return FileText;
      case 'in_progress':
        return Activity;
      default:
        return Clock;
    }
  };

  // Memoized filtered assessments
  /*const filteredAssessments = useMemo(() => {
    return assessments.filter(assessment => {
      const matchesSearch = 
        assessment.client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
      const matchesType = typeFilter === 'all' || assessment.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [assessments, searchTerm, statusFilter, typeFilter]);

  if (loading) {
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
          <h3 className="text-lg font-medium text-gray-900">Error Loading Assessments</h3>
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
            <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
            <p className="text-gray-600">Manage and track client assessments</p>
          </div>
          {hasPermission('manage_clinical') && (
            <button
              onClick={() => setShowNewAssessment(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Assessment
            </button>
          )}
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assessments..."
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
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              {ASSESSMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Assessments List */}
      <div className="space-y-6">
        {/*filteredAssessments.map((assessment) => {
          const StatusIcon = getStatusIcon(assessment.status);
          return (
            <div key={assessment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {assessment.client.first_name} {assessment.client.last_name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(assessment.date), 'MMM d, yyyy')}
                      <span className="mx-2">•</span>
                      {assessment.type}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(assessment.status)}`}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                  </span>
                  {hasPermission('manage_clinical') && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedAssessment(assessment)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssessment(assessment.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                {Object.entries(assessment.scores).map(([category, score]) => (
                  <div key={category} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
                    <div className="flex items-center">
                      <div className="flex-1 mr-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{score}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {assessment.recommendations && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-900">Recommendations</h4>
                  <p className="mt-1 text-sm text-yellow-800">{assessment.recommendations}</p>
                </div>
              )}
            </div>
          );
        }) */}
      </div>

      {/* Assessment Form Modal */}
      {(showNewAssessment || selectedAssessment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {selectedAssessment ? 'Edit Assessment' : 'New Assessment'}
              </h2>
              <button
                onClick={() => {
                  setShowNewAssessment(false);
                  setSelectedAssessment(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Client
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={selectedAssessment?.client_id ?? newAssessment.client_id}
                    onChange={(e) => {
                      if (selectedAssessment) {
                        setSelectedAssessment({ ...selectedAssessment, client_id: e.target.value });
                      } else {
                        setNewAssessment({ ...newAssessment, client_id: e.target.value });
                      }
                    }}
                    disabled={!!selectedAssessment}
                  >
                    <option value="">Select client</option>
                    {/* clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.first_name} {client.last_name}
                      </option>
                    )) */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Assessment Type
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={selectedAssessment?.type ?? newAssessment.type}
                    onChange={(e) => {
                      if (selectedAssessment) {
                        setSelectedAssessment({ ...selectedAssessment, type: e.target.value });
                      } else {
                        setNewAssessment({ ...newAssessment, type: e.target.value });
                      }
                    }}
                  >
                    <option value="">Select type</option>
                    {ASSESSMENT_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assessment Date
                </label>
                <input
                  type="date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={selectedAssessment?.date ?? newAssessment.date}
                  onChange={(e) => {
                    if (selectedAssessment) {
                      setSelectedAssessment({ ...selectedAssessment, date: e.target.value });
                    } else {
                      setNewAssessment({ ...newAssessment, date: e.target.value });
                    }
                  }}
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Assessment Scores</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedAssessment?.scores ?? newAssessment.scores).map(([category, score]) => (
                    <div key={category} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {category}
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className="flex-1"
                          value={score}
                          onChange={(e) => {
                            const newScore = parseInt(e.target.value);
                            if (selectedAssessment) {
                              setSelectedAssessment({
                                ...selectedAssessment,
                                scores: {
                                  ...selectedAssessment.scores,
                                  [category]: newScore
                                }
                              });
                            } else {
                              setNewAssessment({
                                ...newAssessment,
                                scores: {
                                  ...newAssessment.scores,
                                  [category]: newScore
                                }
                              });
                            }
                          }}
                        />
                        <span className="w-12 text-right text-sm text-gray-900">{score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Recommendations
                </label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                  value={selectedAssessment?.recommendations ?? newAssessment.recommendations}
                  onChange={(e) => {
                    if (selectedAssessment) {
                      setSelectedAssessment({
                        ...selectedAssessment,
                        recommendations: e.target.value
                      });
                    } else {
                      setNewAssessment({
                        ...newAssessment,
                        recommendations: e.target.value
                      });
                    }
                  }}
                  placeholder="Enter assessment recommendations..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowNewAssessment(false);
                    setSelectedAssessment(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={selectedAssessment ? () => handleUpdateAssessment(selectedAssessment) : handleSaveAssessment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedAssessment ? 'Update Assessment' : 'Save Assessment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Assessments;