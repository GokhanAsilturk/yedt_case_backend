import { BaseError } from './BaseError';
import { ErrorCode } from '../constants/errorCodes';
import { ErrorMetadata, ErrorContext } from '../types/errorTypes';
import { HttpStatusCode } from '../constants/httpStatusCodes';

export class TechnicalError extends BaseError {
  constructor(
    message: string,
    metadata?: ErrorMetadata,
    context?: ErrorContext,
  ) {
    super(ErrorCode.TECHNICAL_ERROR, message, 'error', HttpStatusCode.INTERNAL_SERVER_ERROR, metadata, context);
  }
}