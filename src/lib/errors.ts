import { z } from 'zod';

// Custom error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'APP_ERROR',
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
  }
}

// Error handling utilities
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function handleZodError(error: z.ZodError): ValidationError {
  const details = error.errors.map(err => ({
    path: err.path.join('.'),
    message: err.message
  }));
  
  return new ValidationError('Validation failed', { errors: details });
}

export function handleUnknownError(error: unknown): AppError {
  if (error instanceof Error) {
    return new AppError(error.message);
  }
  return new AppError('An unexpected error occurred');
}

// Supabase error handling
export async function handleParseError(error: any): Promise<never> {
  // Network errors
  if (!navigator.onLine) {
    throw new AppError('No internet connection. Please check your network and try again.', 'NETWORK_ERROR', 503);
  }

  if (error instanceof Parse.Error) {
    switch (error.code) {
      // Authentication errors
      case Parse.Error.INVALID_SESSION_TOKEN:
        throw new AuthError('Your session has expired. Please sign in again.');
      case Parse.Error.OBJECT_NOT_FOUND:
        throw new NotFoundError('Requested resource not found');
      case Parse.Error.USERNAME_TAKEN:
      case Parse.Error.EMAIL_TAKEN:
        throw new ValidationError('Account already exists with this email');
      case Parse.Error.INVALID_EMAIL_ADDRESS:
        throw new ValidationError('Invalid email format');
      case Parse.Error.INVALID_PASSWORD:
        throw new ValidationError('Invalid password format');
      
      // Permission errors
      case Parse.Error.OPERATION_FORBIDDEN:
        throw new AuthError('You do not have permission to perform this action.');
      
      // Rate limiting
      case Parse.Error.REQUEST_LIMIT_EXCEEDED:
        throw new AppError('Too many requests. Please wait a moment and try again.', 'RATE_LIMIT', 429);
      
      // Validation errors
      case Parse.Error.INVALID_JSON:
      case Parse.Error.INCORRECT_TYPE:
        throw new ValidationError('Invalid data format. Please check your input and try again.');
      
      // Timeout errors
      case Parse.Error.TIMEOUT:
        throw new AppError('The request timed out. Please try again.', 'TIMEOUT', 504);
      
      // Default error handling
      default:
        throw new AppError(error.message || 'An unexpected error occurred. Please try again.');
    }
  }

  // Generic error with original message
  throw new AppError(error.message || 'An unexpected error occurred. Please try again.');
}

// Error reporting
export async function reportError(error: Error, componentStack?: string): Promise<void> {
  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    try {
      const errorReport = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        componentStack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      // Send to your error reporting service
      console.error('Error report:', errorReport);
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }
}