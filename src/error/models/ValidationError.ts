import { BaseError } from './BaseError';
import { ErrorCode } from '../constants/errorCodes';
import { ErrorMetadata, ErrorContext } from '../types/errorTypes';
import { HttpStatusCode } from '../constants/httpStatusCodes';

export class ValidationError extends BaseError {
  public details?: any;
  constructor(
    message: string,
    details?: any,
    metadata?: ErrorMetadata,
    context?: ErrorContext,
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, 'error', HttpStatusCode.BAD_REQUEST, metadata, context);
    this.details = details;
  }
}