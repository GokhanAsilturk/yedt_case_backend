export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorMetadata {
  [key: string]: any;
}

export interface ErrorContext {
  [key: string]: any;
}

export interface BaseErrorInterface {
  errorCode: string;
  message: string;
  severity: ErrorSeverity;
  metadata?: ErrorMetadata;
  context?: ErrorContext;
}