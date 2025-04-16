import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../LoadingSpinner';
import Layout from '../layout/Layout';
import { User } from '../../models/user';
import { useToast } from '../../hooks/useToast';

export default function ProtectedRoute() {
  const { isAuthenticated, loading, user, logout } = useAuth();
  const { error: showError } = useToast();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner 
          size="large"
          message="Initializing application..."
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user!.getStatus() !== User.activeStatus) {
    showError('Account is inactive');
    logout();
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}