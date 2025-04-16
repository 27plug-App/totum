import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes';
import ToastContainer from './components/ToastContainer';
import LoadingSpinner from './components/LoadingSpinner';
import { AlertCircle } from 'lucide-react';

function App() {
  const [initialized, setInitialized] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeApp() {
      try {
        // Reset connection state
        //resetConnection();
        
        // Initialize connection with retries
        // Attempt to establish connection with the server
        /*const connected = await initializeConnection();
        // If connection fails, throw an error with user-friendly message
        if (!connected) {
          throw new Error('Unable to connect to the server. Please check your connection and try again.');
        }*/

        if (!mounted) return;
        setInitialized(true);
        setError(null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to initialize application');
        setInitialized(false);
      }
    }

    initializeApp();

    return () => {
      mounted = false;
    };
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
          {error ? (
            <>
              <div className="flex justify-center mb-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Retry Connection
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-gray-600">Initializing application...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <AppRoutes />
          <ToastContainer />
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;