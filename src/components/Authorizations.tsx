import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Authorization {
  id: string;
  client_id: string;
  insurance_provider: string;
  auth_number: string;
  start_date: string;
  end_date: string;
  total_units: number;
  used_units: number;
  service_code: string;
  status: string;
  created_at: string;
  clients: {
    first_name: string;
    last_name: string;
  };
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
}

function Authorizations() {
  const [authorizations, setAuthorizations] = useState<Authorization[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewAuth, setShowNewAuth] = useState<boolean>(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [newAuth, setNewAuth] = useState<Partial<Authorization>>({
    client_id: '',
    insurance_provider: '',
    auth_number: '',
    start_date: '',
    end_date: '',
    total_units: 0,
    service_code: '',
  });

  useEffect(() => {
    fetchAuthorizations();
    fetchClients();
  }, []);

  const fetchAuthorizations = async () => {
    try {
      const { data, error } = await supabase
        .from('authorizations')
        .select(`
          *,
          clients (first_name, last_name)
        `)
        .order('end_date', { ascending: true });

      if (error) throw error;
      setAuthorizations(data || []);
    } catch (error) {
      console.error('Error fetching authorizations:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, first_name, last_name')
        .eq('status', 'active');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const handleSaveAuth = async () => {
    try {
      const { error } = await supabase
        .from('authorizations')
        .insert([{
          ...newAuth,
          used_units: 0,
          status: 'active'
        }]);

      if (error) throw error;

      setNewAuth({
        client_id: '',
        insurance_provider: '',
        auth_number: '',
        start_date: '',
        end_date: '',
        total_units: 0,
        service_code: '',
      });
      setShowNewAuth(false);
      fetchAuthorizations();
    } catch (error) {
      console.error('Error saving authorization:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUtilizationColor = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  const filteredAuthorizations = authorizations.filter(auth => {
    const matchesSearch = 
      auth.clients.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auth.clients.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auth.auth_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || auth.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Authorizations</h1>
            <p className="text-gray-600">Manage insurance authorizations</p>
          </div>
          <button
            onClick={() => setShowNewAuth(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Authorization
          </button>
        </div>
      </header>

      {showNewAuth ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">New Authorization</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Client
              </label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                value={newAuth.client_id}
                onChange={(e) => setNewAuth({ ...newAuth, client_id: e.target.value })}
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Insurance Provider
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                value={newAuth.insurance_provider}
                onChange={(e) => setNewAuth({ ...newAuth, insurance_provider: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Authorization Number
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                value={newAuth.auth_number}
                onChange={(e) => setNewAuth({ ...newAuth, auth_number: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Code
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                value={newAuth.service_code}
                onChange={(e) => setNewAuth({ ...newAuth, service_code: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                value={newAuth.start_date}
                onChange={(e) => setNewAuth({ ...newAuth, start_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                value={newAuth.end_date}
                onChange={(e) => setNewAuth({ ...newAuth, end_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Total Units
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                value={newAuth.total_units}
                onChange={(e) => setNewAuth({ ...newAuth, total_units: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowNewAuth(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAuth}
              disabled={!newAuth.client_id || !newAuth.auth_number}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Authorization
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search authorizations..."
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
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auth Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAuthorizations.map((auth) => (
                  <tr key={auth.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {auth.clients.first_name} {auth.clients.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {auth.insurance_provider}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{auth.auth_number}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{auth.service_code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(auth.start_date).toLocaleDateString()} -
                        {new Date(auth.end_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${getUtilizationColor(auth.used_units, auth.total_units)}`}>
                        {auth.used_units} / {auth.total_units} units
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            getUtilizationColor(auth.used_units, auth.total_units).replace('text', 'bg')
                          }`}
                          style={{ width: `${(auth.used_units / auth.total_units) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(auth.status)}`}>
                        {auth.status.charAt(0).toUpperCase() + auth.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Authorizations;