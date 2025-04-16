import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingSpinner from './components/LoadingSpinner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import SetupPage from './components/auth/SetupPage';
import { useAuth } from './hooks/useAuth';
import { PermissionParams } from './lib/config/permission-params';

// Lazy load components
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const Schedule = React.lazy(() => import('./components/Schedule'));
const Documents = React.lazy(() => import('./components/Documents'));
const Billing = React.lazy(() => import('./components/Billing'));
const Messages = React.lazy(() => import('./components/Messages'));
const Settings = React.lazy(() => import('./components/settings/Settings'));
const ClinicalNotes = React.lazy(() => import('./components/ClinicalNotes'));
const Authorizations = React.lazy(() => import('./components/Authorizations'));
const Analytics = React.lazy(() => import('./components/Analytics'));
const Organization = React.lazy(() => import('./components/Organization'));
const UserManagement = React.lazy(() => import('./components/user/UserManagement'));
const Timesheet = React.lazy(() => import('./components/Timesheet'));

// Clinical Components 
const ClinicalManagement = React.lazy(() => import('./components/clinical/ClinicalManagement'));
const ClinicalDashboard = React.lazy(() => import('./components/clinical/ClinicalDashboard'));
const TreatmentPlans = React.lazy(() => import('./components/clinical/TreatmentPlans'));
const Assessments = React.lazy(() => import('./components/clinical/Assessments'));
const OutcomeTracking = React.lazy(() => import('./components/clinical/OutcomeTracking'));
const Telehealth = React.lazy(() => import('./components/clinical/Telehealth'));

// Admin Components
const PaymentProcessing = React.lazy(() => import('./components/admin/PaymentProcessing'));
const InsuranceVerification = React.lazy(() => import('./components/admin/InsuranceVerification'));
const ClaimsManagement = React.lazy(() => import('./components/admin/ClaimsManagement'));

export default function AppRoutes() {
  const { hasPermission } = useAuth();

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    }>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/setup" element={<SetupPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/schedule" element={
            hasPermission(PermissionParams.permission_manage_schedule) ? <Schedule /> : <Navigate to="/" replace />
          } />
          <Route path="/documents" element={
            hasPermission(PermissionParams.permission_manage_documents) ? <Documents /> : <Navigate to="/" replace />
          } />
          <Route path="/billing" element={
            hasPermission(PermissionParams.permission_manage_billing) ? <Billing /> : <Navigate to="/" replace />
          } />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/timesheet" element={<Timesheet />} />
          <Route path="/clinical-notes" element={
            hasPermission(PermissionParams.permission_manage_clinical) ? <ClinicalNotes /> : <Navigate to="/" replace />
          } />
          <Route path="/authorizations" element={
            hasPermission(PermissionParams.permission_manage_authorizations) ? <Authorizations /> : <Navigate to="/" replace />
          } />
          <Route path="/analytics" element={
            hasPermission(PermissionParams.permission_manage_analytics) ? <Analytics /> : <Navigate to="/" replace />
          } />
          <Route path="/organization" element={
            hasPermission(PermissionParams.permission_manage_organization) ? <Organization /> : <Navigate to="/" replace />
          } />
          <Route path="/users" element={
            hasPermission(PermissionParams.permission_manage_users) ? <UserManagement /> : <Navigate to="/" replace />
          } />

          {/* Clinical Routes */}
          <Route path="/clinical-management" element={
            hasPermission(PermissionParams.permission_manage_users) ? <ClinicalManagement /> : <Navigate to="/" replace />
          } />
          <Route path="/clinical" element={
            hasPermission(PermissionParams.permission_manage_clinical) ? <ClinicalDashboard /> : <Navigate to="/" replace />
          } />
          <Route path="/clinical/treatment-plans/*" element={
            hasPermission(PermissionParams.permission_manage_clinical) ? <TreatmentPlans /> : <Navigate to="/" replace />
          } />
          <Route path="/clinical/assessments/*" element={
            hasPermission(PermissionParams.permission_manage_clinical) ? <Assessments /> : <Navigate to="/" replace />
          } />
          <Route path="/clinical/outcomes/*" element={
            hasPermission(PermissionParams.permission_manage_clinical) ? <OutcomeTracking /> : <Navigate to="/" replace />
          } />
          <Route path="/clinical/telehealth/*" element={
            hasPermission(PermissionParams.permission_manage_clinical) ? <Telehealth /> : <Navigate to="/" replace />
          } />

          {/* Admin Routes */}
          <Route path="/admin/insurance" element={
            hasPermission(PermissionParams.permission_manage_billing) ? <InsuranceVerification /> : <Navigate to="/" replace />
          } />
          <Route path="/admin/claims" element={
            hasPermission(PermissionParams.permission_manage_billing) ? <ClaimsManagement /> : <Navigate to="/" replace />
          } />
          <Route path="/admin/payment-processing" element={
            hasPermission(PermissionParams.permission_manage_billing) ? <PaymentProcessing /> : <Navigate to="/" replace />
          } />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}