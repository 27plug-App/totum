import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  FileText, 
  MessageSquare, 
  Clock,
  Shield,
  Activity,
  ClipboardList,
  ChevronRight,
  Download,
  Upload,
  Bell,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSupabaseQuery } from '../../hooks/useSupabaseQuery';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../LoadingSpinner';

function PatientPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('overview');

  const { data: appointments = [], loading: appointmentsLoading, error: appointmentsError } = useSupabaseQuery({
    query: supabase
      .from('appointments')
      .select(`
        *,
        users (first_name, last_name)
      `)
      .eq('client_id', user?.id)
      .order('start_time', { ascending: true })
      .limit(5),
    key: 'upcoming-appointments'
  });

  const { data: documents = [], loading: documentsLoading, error: documentsError } = useSupabaseQuery({
    query: supabase
      .from('documents')
      .select('*')
      .eq('client_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5),
    key: 'recent-documents'
  });

  if (appointmentsLoading || documentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (appointmentsError || documentsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Error Loading Data</h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
            <p className="text-gray-600">Manage your healthcare information</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="btn btn-secondary">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-medium">
                2
              </span>
            </button>
            <button className="btn btn-primary">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Provider
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 hover:scale-105 transition-transform duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
              <p className="text-sm text-gray-600 mt-2">Book appointments and view your calendar</p>
              <button className="mt-4 text-blue-600 text-sm font-medium flex items-center">
                View Schedule
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="card p-6 hover:scale-105 transition-transform duration-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              <p className="text-sm text-gray-600 mt-2">Access your medical records and forms</p>
              <button className="mt-4 text-green-600 text-sm font-medium flex items-center">
                View Documents
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="card p-6 hover:scale-105 transition-transform duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
              <p className="text-sm text-gray-600 mt-2">Track your treatment progress</p>
              <button className="mt-4 text-purple-600 text-sm font-medium flex items-center">
                View Progress
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
              <button className="btn btn-secondary">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {appointments.map((apt: any) => (
                <div key={apt.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {apt.type}
                      </h3>
                      <span className="badge badge-success">
                        Confirmed
                      </span>
                    </div>
                    <p className="text-gray-600">
                      {new Date(apt.start_time).toLocaleDateString()} at{' '}
                      {new Date(apt.start_time).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      with Dr. {apt.users.first_name} {apt.users.last_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Documents */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Documents</h2>
              <div className="flex space-x-2">
                <button className="btn btn-secondary">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </button>
                <button className="btn btn-secondary">
                  View All
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="w-6 h-6 text-gray-400" />
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{doc.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Profile Summary */}
          <div className="card p-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.first_name} {user?.last_name}
                </h2>
                <p className="text-gray-600">Patient ID: {user?.id.slice(0, 8)}</p>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Next Appointment</span>
                <span className="text-gray-900 font-medium">
                  {appointments[0] ? new Date(appointments[0].start_time).toLocaleDateString() : 'None scheduled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Insurance Status</span>
                <span className="badge badge-success">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Visit</span>
                <span className="text-gray-900 font-medium">Mar 15, 2025</span>
              </div>
            </div>
            <button className="w-full btn btn-secondary mt-6">
              Edit Profile
            </button>
          </div>

          {/* Treatment Progress */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Treatment Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Goal 1: Speech Clarity</span>
                  <span className="text-blue-600 font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Goal 2: Vocabulary</span>
                  <span className="text-green-600 font-medium">90%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Goal 3: Fluency</span>
                  <span className="text-yellow-600 font-medium">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
            <button className="w-full btn btn-secondary mt-6">
              View Full Report
            </button>
          </div>

          {/* Quick Links */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
            <div className="space-y-3">
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-gray-700">
                <Shield className="w-5 h-5 mr-3 text-gray-400" />
                Insurance Information
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-gray-700">
                <ClipboardList className="w-5 h-5 mr-3 text-gray-400" />
                Forms & Documents
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-gray-700">
                <MessageSquare className="w-5 h-5 mr-3 text-gray-400" />
                Message History
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center text-gray-700">
                <Activity className="w-5 h-5 mr-3 text-gray-400" />
                Progress Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientPortal;