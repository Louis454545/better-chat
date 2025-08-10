import type { DomainError } from "../types";

// Custom error classes for different domains
export class AuthenticationError extends Error {
  type = 'authentication' as const;
  details?: any;
  
  constructor(message: string = "Not authenticated", details?: any) {
    super(message);
    this.name = 'AuthenticationError';
    this.details = details;
  }
}

export class AuthorizationError extends Error {
  type = 'authorization' as const;
  details?: any;
  
  constructor(message: string = "Not authorized", details?: any) {
    super(message);
    this.name = 'AuthorizationError';
    this.details = details;
  }
}

export class ValidationError extends Error {
  type = 'validation' as const;
  details?: any;
  
  constructor(message: string = "Validation failed", details?: any) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

export class NotFoundError extends Error {
  type = 'not_found' as const;
  details?: any;
  
  constructor(resource: string, details?: any) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.details = details;
  }
}

export class BusinessLogicError extends Error {
  type = 'business_logic' as const;
  details?: any;
  
  constructor(message: string, details?: any) {
    super(message);
    this.name = 'BusinessLogicError';
    this.details = details;
  }
}

export class ExternalApiError extends Error {
  type = 'external_api' as const;
  details?: any;
  
  constructor(service: string, message: string, details?: any) {
    super(`${service}: ${message}`);
    this.name = 'ExternalApiError';
    this.details = details;
  }
}

// Error factory functions
export const createAuthError = (message?: string, details?: any) => 
  new AuthenticationError(message, details);

export const createAuthzError = (message?: string, details?: any) => 
  new AuthorizationError(message, details);

export const createValidationError = (message?: string, details?: any) => 
  new ValidationError(message, details);

export const createNotFoundError = (resource: string, details?: any) => 
  new NotFoundError(resource, details);

export const createBusinessError = (message: string, details?: any) => 
  new BusinessLogicError(message, details);

export const createApiError = (service: string, message: string, details?: any) => 
  new ExternalApiError(service, message, details);

// Error type guards
export const isAuthError = (error: any): error is AuthenticationError => 
  error instanceof AuthenticationError;

export const isAuthzError = (error: any): error is AuthorizationError => 
  error instanceof AuthorizationError;

export const isValidationError = (error: any): error is ValidationError => 
  error instanceof ValidationError;

export const isNotFoundError = (error: any): error is NotFoundError => 
  error instanceof NotFoundError;

export const isBusinessError = (error: any): error is BusinessLogicError => 
  error instanceof BusinessLogicError;

export const isApiError = (error: any): error is ExternalApiError => 
  error instanceof ExternalApiError;

// Safe JSON stringification that handles circular references
function safeStringify(obj: any): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  });
}

// Error logging utility
export const logError = (error: any, context?: string) => {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    name: error.name,
    message: error.message,
    type: error.type,
    details: error.details,
    stack: error.stack,
  };
  
  try {
    console.error('Domain Error:', safeStringify(logData));
  } catch (e) {
    // Fallback if even safe stringification fails
    console.error('Domain Error (basic):', {
      timestamp: logData.timestamp,
      context: logData.context,
      name: logData.name,
      message: logData.message,
      type: logData.type,
    });
  }
  
  return logData;
};

// Convert domain errors to user-friendly messages
export const formatErrorMessage = (error: any): string => {
  if (isAuthError(error)) {
    return "Please sign in to continue";
  }
  
  if (isAuthzError(error)) {
    return "You don't have permission to perform this action";
  }
  
  if (isValidationError(error)) {
    return `Invalid input: ${error.message}`;
  }
  
  if (isNotFoundError(error)) {
    return error.message;
  }
  
  if (isBusinessError(error)) {
    return error.message;
  }
  
  if (isApiError(error)) {
    return "External service error. Please try again later.";
  }
  
  return "An unexpected error occurred";
};