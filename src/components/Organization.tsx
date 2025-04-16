import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Settings, 
  Shield, 
  Map, 
  Phone, 
  Mail,
  Globe,
  FileText,
  Clock,
  DollarSign
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

interface OrgSettings {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  taxId: string;
  businessHours: {
    [key: string]: { start: string; end: string };
  };
  billing: {
    defaultRate: number;
    currency: string;
    taxRate: number;
    paymentTerms: string;
    acceptedPaymentMethods: string[];
  };
}

function Organization() {
  const { user } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const [activeTab, setActiveTab] = useState<string>('general');

  const [orgSettings, setOrgSettings] = useState<OrgSettings>({
    name: 'Totum Healthcare',
    email: 'contact@totum.healthcare',
    phone: '(555) 123-4567',
    address: '123 Healthcare Ave, Medical District, NY 10001',
    website: 'https://totum.healthcare',
    taxId: '12-3456789',
    businessHours: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: '', end: '' },
      sunday: { start: '', end: '' }
    },
    billing: {
      defaultRate: 150,
      currency: 'USD',
      taxRate: 0,
      paymentTerms: 'Net 30',
      acceptedPaymentMethods: ['Credit Card', 'Insurance', 'Bank Transfer']
    }
  });

  const handleSaveSettings = () => {
    try {
      // In a real app, this would save to the database
      showSuccess('Organization settings saved successfully');
    } catch (error) {
      showError('Failed to save organization settings');
    }
  };

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Organization Settings</h1>
        <p className="text-gray-600">Manage your organization's profile and settings</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg w-full ${
                activeTab === 'general'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Building2 className="mr-3 h-5 w-5" />
              General Information
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg w-full ${
                activeTab === 'locations'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Map className="mr-3 h-5 w-5" />
              Locations
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg w-full ${
                activeTab === 'billing'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <DollarSign className="mr-3 h-5 w-5" />
              Billing Settings
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg w-full ${
                activeTab === 'documents'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText className="mr-3 h-5 w-5" />
              Documents
            </button>
            <button
              onClick={() => setActiveTab('hours')}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg w-full ${
                activeTab === 'hours'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Clock className="mr-3 h-5 w-5" />
              Business Hours
            </button>
          </nav>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">General Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={orgSettings.name}
                    onChange={e => setOrgSettings({ ...orgSettings, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={orgSettings.email}
                      onChange={e => setOrgSettings({ ...orgSettings, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={orgSettings.phone}
                      onChange={e => setOrgSettings({ ...orgSettings, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={orgSettings.address}
                    onChange={e => setOrgSettings({ ...orgSettings, address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <input
                      type="url"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={orgSettings.website}
                      onChange={e => setOrgSettings({ ...orgSettings, website: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tax ID
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={orgSettings.taxId}
                      onChange={e => setOrgSettings({ ...orgSettings, taxId: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing Settings</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Default Hourly Rate
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={orgSettings.billing.defaultRate}
                        onChange={e => setOrgSettings({
                          ...orgSettings,
                          billing: {
                            ...orgSettings.billing,
                            defaultRate: Number(e.target.value)
                          }
                        })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={orgSettings.billing.taxRate}
                      onChange={e => setOrgSettings({
                        ...orgSettings,
                        billing: {
                          ...orgSettings.billing,
                          taxRate: Number(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Payment Terms
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={orgSettings.billing.paymentTerms}
                    onChange={e => setOrgSettings({
                      ...orgSettings,
                      billing: {
                        ...orgSettings.billing,
                        paymentTerms: e.target.value
                      }
                    })}
                  >
                    <option value="Net 30">Net 30</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Due on Receipt">Due on Receipt</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Accepted Payment Methods
                  </label>
                  <div className="mt-2 space-y-2">
                    {['Credit Card', 'Insurance', 'Bank Transfer', 'Cash', 'Check'].map(method => (
                      <label key={method} className="inline-flex items-center mr-6">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          checked={orgSettings.billing.acceptedPaymentMethods.includes(method)}
                          onChange={e => {
                            const methods = e.target.checked
                              ? [...orgSettings.billing.acceptedPaymentMethods, method]
                              : orgSettings.billing.acceptedPaymentMethods.filter(m => m !== method);
                            setOrgSettings({
                              ...orgSettings,
                              billing: {
                                ...orgSettings.billing,
                                acceptedPaymentMethods: methods
                              }
                            });
                          }}
                        />
                        <span className="ml-2 text-sm text-gray-700">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Business Hours</h2>
              <div className="space-y-6">
                {Object.entries(orgSettings.businessHours).map(([day, hours]) => (
                  <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="font-medium text-gray-700 capitalize">
                      {day}
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-500">Open</label>
                        <input
                          type="time"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={hours.start}
                          onChange={e => setOrgSettings({
                            ...orgSettings,
                            businessHours: {
                              ...orgSettings.businessHours,
                              [day]: { ...hours, start: e.target.value }
                            }
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-500">Close</label>
                        <input
                          type="time"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={hours.end}
                          onChange={e => setOrgSettings({
                            ...orgSettings,
                            businessHours: {
                              ...orgSettings.businessHours,
                              [day]: { ...hours, end: e.target.value }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Organization;