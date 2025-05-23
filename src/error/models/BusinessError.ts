import { BaseError } from './BaseError';
import { ErrorCode } from '../constants/errorCodes';
import { ErrorMetadata, ErrorContext } from '../types/errorTypes';
import { HttpStatusCode } from '../constants/httpStatusCodes';

export class BusinessError extends BaseError {
  constructor(
    message: string,
    metadata?: ErrorMetadata,
    context?: ErrorContext,
  ) {
    super(ErrorCode.BUSINESS_ERROR, message, 'error', HttpStatusCode.BAD_REQUEST, metadata, context);
  }
}