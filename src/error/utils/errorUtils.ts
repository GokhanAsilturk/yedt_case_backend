// Yardımcı fonksiyonlar burada tanımlanacak.
// Örneğin:
// - Hata kodlarını ve mesajlarını yönetme
// - Hata oluşturma fonksiyonları

import { BaseError } from '../models/BaseError';
import { ErrorCode } from '../constants/errorCodes';
import { ErrorSeverity } from '../types/errorTypes';
import { HttpStatusCode } from '../constants/httpStatusCodes';

export function createError(
  errorCode: string,
  message: string,
  severity: ErrorSeverity,
  statusCode: number = 500,
  metadata?: object,
  context?: object,
): BaseError {
  return new BaseError(errorCode, message, severity, statusCode, metadata, context);
}

export function createValidationError(
  message: string,
  statusCode: number = HttpStatusCode.BAD_REQUEST,
  metadata?: object,
  context?: object,
): BaseError {
  return createError(
    ErrorCode.VALIDATION_ERROR,
    message,
    'warning',
    statusCode,
    metadata,
    context,
  );
}

export function createBusinessError(
  message: string,
  statusCode: number = HttpStatusCode.BAD_REQUEST,
  metadata?: object,
  context?: object,
): BaseError {
  return createError(
    ErrorCode.BUSINESS_ERROR,
    message,
    'warning',
    statusCode,
    metadata,
    context,
  );
}

export function createTechnicalError(
  message: string,
  statusCode: number = HttpStatusCode.INTERNAL_SERVER_ERROR,
  metadata?: object,
  context?: object,
): BaseError {
  return createError(
    ErrorCode.TECHNICAL_ERROR,
    message,
    'error',
    statusCode,
    metadata,
    context,
  );
}

export function createSecurityError(
  message: string,
  statusCode: number = HttpStatusCode.FORBIDDEN,
  metadata?: object,
  context?: object,
): BaseError {
  return createError(
    ErrorCode.SECURITY_ERROR,
    message,
    'error',
    statusCode,
    metadata,
    context,
  );
}