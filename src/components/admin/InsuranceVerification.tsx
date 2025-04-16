import React, { useState, useMemo } from 'react';
import { 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../LoadingSpinner';
import { format } from 'date-fns';

interface InsuranceVerification {
  id: string;
  client_id: string;
  insurance_provider: string;
  policy_number: string;
  verification_date: string;
  status: 'pending' | 'verified' | 'denied' | 'expired';
  coverage_details: {
    service_type: string;
    copay: number;
    deductible: number;
    deductible_met: number;
    out_of_pocket_max: number;
    out_of_pocket_met: number;
    visit_limit: number;
    visits_used: number;
    authorization_required: boolean;
    effective_date: string;
    end_date: string;
  };
  notes: string;
  created_at: string;
  updated_at: string;
  client: {
    first_name: string;
    last_name: string;
  };
}

function InsuranceVerification() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewVerification, setShowNewVerification] = useState<boolean>(false);

  /*const { data: verifications = [], loading, error } = useSupabaseQuery({
    query: supabase
      .from('insurance_verifications')
      .select(`
        *,
        client:clients(first_name, last_name)
      `)
      .order('created_at', { ascending: false }),
    key: 'insurance-verifications'
  });

  const { data: clients = [] } = useSupabaseQuery({
    query: supabase
      .from('clients')
      .select('id, first_name, last_name')
      .eq('status', 'active'),
    key: 'active-clients'
  });*/

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
          <h3 className="text-lg font-medium text-gray-900">Error Loading Verifications</h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }*/

  /*const filteredVerifications = useMemo(() => {
    return verifications.filter(verification => {
      const matchesSearch = 
        verification.client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.insurance_provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        verification.policy_number.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || verification.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [verifications, searchTerm, statusFilter]);*/

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return CheckCircle;
      case 'denied':
        return XCircle;
      case 'expired':
        return Clock;
      default:
        return RefreshCw;
    }
  };

  const verifications: never[] = [];

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Insurance Verification</h1>
            <p className="text-gray-600">Manage and track insurance verifications</p>
          </div>
          <button
            onClick={() => setShowNewVerification(true)}
            className="btn btn-primary"
          >
            New Verification
          </button>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search verifications..."
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
              <option value="verified">Verified</option>
              <option value="denied">Denied</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="ml-2 text-sm font-medium text-blue-900">Total Verifications</span>
              </div>
              <span className="text-lg font-semibold text-blue-900">
                {verifications.length}
              </span>
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="ml-2 text-sm font-medium text-green-900">Verified</span>
              </div>
              <span className="text-lg font-semibold text-green-900">
                {verifications.filter(v => v.status === 'verified').length}
              </span>
            </div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="ml-2 text-sm font-medium text-yellow-900">Pending</span>
              </div>
              <span className="text-lg font-semibold text-yellow-900">
                {verifications.filter(v => v.status === 'pending').length}
              </span>
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="ml-2 text-sm font-medium text-red-900">Denied</span>
              </div>
              <span className="text-lg font-semibold text-red-900">
                {verifications.filter(v => v.status === 'denied').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verifications List */}
      <div className="space-y-6">
        {/*filteredVerifications*/[].map((verification) => {
          const StatusIcon = getStatusIcon(verification.status);
          return (
            <div key={verification.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {verification.client.first_name[0]}{verification.client.last_name[0]}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {verification.client.first_name} {verification.client.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {verification.insurance_provider} • Policy #{verification.policy_number}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(verification.status)}`}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                  </span>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <Download className="w-5 h-5 text-gray-500" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    Effective Date
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(verification.coverage_details.effective_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Copay
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ${verification.coverage_details.copay}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Deductible
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ${verification.coverage_details.deductible_met} / ${verification.coverage_details.deductible}
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${(verification.coverage_details.deductible_met / verification.coverage_details.deductible) * 100}%` 
                      }}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <User className="w-4 h-4 mr-1" />
                    Visit Limit
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {verification.coverage_details.visits_used} / {verification.coverage_details.visit_limit}
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ 
                        width: `${(verification.coverage_details.visits_used / verification.coverage_details.visit_limit) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>

              {verification.notes && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">{verification.notes}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button className="btn btn-secondary">
                  <FileText className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button className="btn btn-primary">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reverify
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InsuranceVerification;