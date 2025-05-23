import { BaseError } from './BaseError';

export class AppError extends BaseError {
  public isOperational: boolean;

  constructor(message: string, statusCode: number, errorCode: string, isOperational = true) {
    super(errorCode, message, 'error', statusCode);
    this.isOperational = isOperational;
  }
}