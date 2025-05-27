import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../error/models/BaseError';
import { ValidationError } from '../error/models/ValidationError';
import { SecurityError } from '../error/models/SecurityError';
import { ErrorCode } from '../error/constants/errorCodes';
import { HttpStatusCode } from '../error/constants/httpStatusCodes';
import ApiResponse from '../utils/apiResponse';
import { ErrorLogService } from '../error/services/ErrorLogService';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const err = new BaseError(
    ErrorCode.NOT_FOUND,
    `${req.originalUrl} yolu bulunamadı`,
    'error',
    HttpStatusCode.NOT_FOUND,
  );
  next(err);
};

export const errorHandler = async (err: Error, req: Request, res: Response, next: NextFunction) => {
  const errorLogService = new ErrorLogService();

  if (!(err instanceof BaseError)) {
    await errorLogService.logError(err as BaseError, req);
  }

  let message = 'Internal Server Error';
  let errorDetails: any = undefined;

  if (err instanceof ValidationError) {
    message = err.message;
    errorDetails = {
      code: err.errorCode,
      details: err.details,
    };
  } else if (err instanceof SecurityError || err instanceof BaseError) {
    message = err.message;
    errorDetails = { code: err.errorCode };
  }

  if (process.env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
    errorDetails = undefined;
  }

  const statusCode = err instanceof BaseError ? err.statusCode : HttpStatusCode.INTERNAL_SERVER_ERROR;
  return ApiResponse.error(res, message, statusCode, errorDetails);
};