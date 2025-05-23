import { Request, Response, NextFunction } from 'express';
import { ErrorCode } from './constants/errorCodes';
import { BaseError } from './models/BaseError';
import ApiResponse from '../utils/apiResponse';

export class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(err: Error, req: Request, res: Response, next: NextFunction): void {
    let error: BaseError;

    if (err instanceof BaseError) {
      error = err;
    } else {
      console.error('KRİTİK HATA:', err);
      error = new BaseError(ErrorCode.INTERNAL_SERVER_ERROR, err.message || 'Internal Server Error', 'error');
    }

    this.sendErrorResponse(error, req, res);
  }

  private sendErrorResponse(error: BaseError, req: Request, res: Response): void {
    ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
  }
}