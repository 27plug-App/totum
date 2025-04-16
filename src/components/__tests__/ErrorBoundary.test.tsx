import { render, screen, fireEvent } from '../../test/utils';
import ErrorBoundary from '../ErrorBoundary';
import { vi } from 'vitest';

describe('ErrorBoundary', () => {
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  it('allows error recovery via try again button', () => {
    let shouldThrow = true;
    const TestComponent = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>Recovered</div>;
    };

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

    shouldThrow = false;
    fireEvent.click(screen.getByText(/try again/i));

    expect(screen.getByText('Recovered')).toBeInTheDocument();
  });

  it('uses custom fallback when provided', () => {
    const fallback = <div>Custom Error UI</div>;
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });

  it('calls onError prop when error occurs', () => {
    const onError = vi.fn();
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) })
    );
  });
});