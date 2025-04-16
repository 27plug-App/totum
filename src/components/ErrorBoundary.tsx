import React, { Component, ErrorInfo, ReactNode, useState } from 'react';
import { AlertTriangle, RefreshCw, Flag } from 'lucide-react';
import { reportError } from '../lib/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface State {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: null,
    errorInfo: null
  };

  private mounted: boolean = false;

  public static getDerivedStateFromError(error: Error): State {
    return { error, errorInfo: null };
  }

  public componentDidMount() {
    this.mounted = true;
  }

  public componentWillUnmount() {
    this.mounted = false;
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.mounted) {
      this.setState({ error, errorInfo });
      
      // Report error
      reportError(error, errorInfo.componentStack);
      
      // Call onError prop if provided
      if (this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    }
  }

  public componentDidUpdate(prevProps: Props) {
    if (
      this.props.resetOnPropsChange &&
      this.state.error &&
      (prevProps.children !== this.props.children || prevProps.fallback !== this.props.fallback)
    ) {
      this.setState({ error: null, errorInfo: null });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ error: null, errorInfo: null });
  };

  private handleReport = async () => {
    if (this.state.error) {
      try {
        await reportError(
          this.state.error,
          this.state.errorInfo?.componentStack
        );
      } catch (error) {
        console.error('Failed to report error:', error);
      }
    }
  };

  public render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
              Something went wrong
            </h1>

            <div className="bg-red-50 rounded-lg p-4 mb-6">
              <div className="mb-4">
                <h2 className="text-sm font-medium text-red-800">Error Details</h2>
                <p className="mt-1 text-sm text-red-600">
                  {this.state.error.message || 'An unexpected error occurred'}
                </p>
              </div>

              {this.state.errorInfo && (
                <div>
                  <h2 className="text-sm font-medium text-red-800 mb-1">
                    Component Stack
                  </h2>
                  <pre className="text-xs text-red-600 overflow-auto max-h-40 p-2 bg-red-100 rounded">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </button>

              <button
                onClick={this.handleReport}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Flag className="w-4 h-4 mr-2" />
                Report Issue
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  ErrorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary
        fallback={
          ErrorFallback ? (
            <ErrorFallback
              error={new Error('Component error')}
              resetErrorBoundary={() => {}}
            />
          ) : undefined
        }
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for error boundaries
export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    throw error;
  }

  return setError;
}