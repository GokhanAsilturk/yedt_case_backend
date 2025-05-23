import { ErrorSeverity, ErrorMetadata, ErrorContext, BaseErrorInterface } from '../types/errorTypes';

export class BaseError extends Error implements BaseErrorInterface {
  public errorCode: string;
  public message: string;
  public severity: ErrorSeverity;
  public metadata?: ErrorMetadata;
  public context?: ErrorContext;
  public statusCode: number;

  constructor(
    errorCode: string,
    message: string,
    severity: ErrorSeverity,
    statusCode: number = 500,
    metadata?: ErrorMetadata,
    context?: ErrorContext,
  ) {
    super(message);
    this.errorCode = errorCode;
    this.message = message;
    this.severity = severity;
    this.statusCode = statusCode;
    this.metadata = metadata;
    this.context = context;
    Object.setPrototypeOf(this, BaseError.prototype);
  }
}