import React, { useState, useMemo } from 'react';
import { 
  Search, 
  AlertCircle,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  MoreVertical,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../LoadingSpinner';
import { format } from 'date-fns';

interface Claim {
  id: string;
  client_id: string;
  provider_id: string;
  service_date: string;
  claim_number: string;
  insurance_provider: string;
  status: 'draft' | 'submitted' | 'pending' | 'paid' | 'denied' | 'appealed';
  amount: number;
  amount_paid: number;
  denial_reason?: string;
  submission_date?: string;
  payment_date?: string;
  notes: string;
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

function ClaimsManagement() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'quarter'>('month');
  const [selectedClaims, setSelectedClaims] = useState<string[]>([]);

  /*const { data: claims = [], loading, error, mutate } = useSupabaseQuery({
    query: supabase
      .from('claims')
      .select(`
        *,
        client:clients(first_name, last_name),
        provider:users(first_name, last_name)
      `)
      .order('created_at', { ascending: false }),
    key: 'claims'
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
          <h3 className="text-lg font-medium text-gray-900">Error Loading Claims</h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }*/

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'appealed':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return CheckCircle;
      case 'denied':
        return XCircle;
      case 'appealed':
        return AlertCircle;
      case 'submitted':
        return Send;
      case 'pending':
        return Clock;
      default:
        return FileText;
    }
  };

  /*const filteredClaims = useMemo(() => {
    return claims.filter(claim => {
      const matchesSearch = 
        claim.claim_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.client.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.client.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.insurance_provider.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [claims, searchTerm, statusFilter]);

  const totalAmount = filteredClaims.reduce((sum, claim) => sum + (claim.amount || 0), 0);
  const totalPaid = filteredClaims.reduce((sum, claim) => sum + (claim.amount_paid || 0), 0);
  const totalPending = filteredClaims.reduce((sum, claim) => 
    (claim.status === 'pending' || claim.status === 'submitted') ? sum + (claim.amount || 0) : sum, 0
  );*/

  const handleBatchSubmit = async () => {
    // Batch submit logic
  };

  const claims: never[] = []; 

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Claims Management</h1>
        <p className="text-gray-600">Manage and track insurance claims</p>
      </header>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search claims..."
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
              <option value="submitted">Submitted</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="denied">Denied</option>
              <option value="appealed">Appealed</option>
            </select>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="ml-2 text-sm font-medium text-blue-900">Total Claims</span>
              </div>
              <span className="text-lg font-semibold text-blue-900">
                {claims.length}
              </span>
            </div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="ml-2 text-sm font-medium text-green-900">Paid</span>
              </div>
              <span className="text-lg font-semibold text-green-900">
                {claims.filter(c => c.status === 'paid').length}
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
                {claims.filter(c => c.status === 'pending').length}
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
                {claims.filter(c => c.status === 'denied').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-6">
        {/*filteredClaims*/[].map((claim) => {
          const StatusIcon = getStatusIcon(claim.status);
          return (
            <div key={claim.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {claim.client.first_name[0]}{claim.client.last_name[0]}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {claim.client.first_name} {claim.client.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {claim.insurance_provider} • Claim #{claim.claim_number}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(claim.status)}`}>
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
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
                    Service Date
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(claim.service_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Amount
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ${claim.amount}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Amount Paid
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ${claim.amount_paid}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <FileText className="w-4 h-4 mr-1" />
                    Notes
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {claim.notes}
                  </p>
                </div>
              </div>

              {claim.denial_reason && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-800">{claim.denial_reason}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button className="btn btn-secondary">
                  <FileText className="w-4 h-4 mr-2" />
                  View Details
                </button>
                <button className="btn btn-primary">
                  <Send className="w-4 h-4 mr-2" />
                  Resubmit
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ClaimsManagement;