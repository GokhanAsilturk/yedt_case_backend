import { BaseError } from './BaseError';
import { ErrorCode } from '../constants/errorCodes';
import { ErrorMetadata, ErrorContext } from '../types/errorTypes';
import { HttpStatusCode } from '../constants/httpStatusCodes';

export class SecurityError extends BaseError {
  constructor(
    message: string,
    metadata?: ErrorMetadata,
    context?: ErrorContext,
  ) {
    super(ErrorCode.SECURITY_ERROR, message, 'error', HttpStatusCode.FORBIDDEN, metadata, context);
  }
}