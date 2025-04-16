import React, { useState, useEffect } from 'react';
import { DollarSign, FileText, Search, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from './LoadingSpinner';

interface BillingEntry {
  id: string;
  appointment_id: string;
  client_id: string;
  provider_id: string;
  authorization_id: string;
  service_code: string;
  units: number;
  amount: number;
  status: 'pending' | 'submitted' | 'paid' | 'denied';
  claim_number: string;
  created_at: string;
  clients?: {
    first_name: string;
    last_name: string;
  };
  users?: {
    first_name: string;
    last_name: string;
  };
}

function Billing() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [entries, setEntries] = useState<BillingEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

  useEffect(() => {
    fetchBillingEntries();
  }, []);

  const fetchBillingEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('billing_entries')
        .select(`
          *,
          appointments (
            start_time,
            end_time,
            type
          ),
          clients (
            first_name,
            last_name
          ),
          users (
            first_name,
            last_name
          )
        `);

      if (error) throw error;
      setEntries(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching billing entries:', error);
      showError('Failed to fetch billing entries');
      setLoading(false);
    }
  };

  const handleSubmitClaims = async () => {
    try {
      const { error } = await supabase
        .from('billing_entries')
        .update({ status: 'submitted' })
        .in('id', selectedEntries);

      if (error) throw error;
      
      fetchBillingEntries();
      setSelectedEntries([]);
      showSuccess('Claims submitted successfully');
    } catch (error) {
      showError('Failed to submit claims');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return AlertCircle;
      case 'submitted':
        return FileText;
      case 'paid':
        return CheckCircle;
      case 'denied':
        return XCircle;
      default:
        return DollarSign;
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.claim_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.service_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
            <p className="text-gray-600">Manage claims and payments</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleSubmitClaims}
              disabled={selectedEntries.length === 0}
              className={`flex items-center px-4 py-2 rounded-lg ${
                selectedEntries.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Submit Claims
            </button>
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by claim number or service code..."
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
              <option value="submitted">Submitted</option>
              <option value="paid">Paid</option>
              <option value="denied">Denied</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedEntries.length === filteredEntries.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEntries(filteredEntries.map(entry => entry.id));
                      } else {
                        setSelectedEntries([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Claim Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Units
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => {
                const StatusIcon = getStatusIcon(entry.status);
                return (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEntries.includes(entry.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEntries([...selectedEntries, entry.id]);
                          } else {
                            setSelectedEntries(selectedEntries.filter(id => id !== entry.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {entry.claim_number || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {entry.service_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {entry.units}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        ${entry.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(entry.status)}`}>
                        <StatusIcon className="w-4 h-4 mr-1" />
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Billing;