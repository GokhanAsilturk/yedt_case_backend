import { Request, Response, NextFunction } from 'express';
import { notFoundHandler, errorHandler } from '../../middleware/errorHandler';
import { BaseError } from '../../error/models/BaseError';
import { ValidationError } from '../../error/models/ValidationError';
import { SecurityError } from '../../error/models/SecurityError';
import { ErrorCode } from '../../error/constants/errorCodes';
import { HttpStatusCode } from '../../error/constants/httpStatusCodes';
import ApiResponse from '../../utils/apiResponse';
import { ErrorLogService } from '../../error/services/ErrorLogService';

jest.mock('../../utils/apiResponse');
jest.mock('../../error/services/ErrorLogService');

describe('errorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should handle BaseError correctly', async () => {
    const error = new BaseError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Test message',
      'error',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
    await errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(ErrorLogService.prototype.logError).toHaveBeenCalledWith(error, mockRequest);
    expect(ApiResponse.error).toHaveBeenCalledWith(
      mockResponse,
      'Test message',
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      { code: ErrorCode.INTERNAL_SERVER_ERROR }
    );
  });

  it('should handle ValidationError correctly', async () => {
    const error = new ValidationError(
      ErrorCode.VALIDATION_ERROR,
      'Validation failed',
      { field: 'value' }
    );
    await errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(ErrorLogService.prototype.logError).toHaveBeenCalledWith(error, mockRequest);
    expect(ApiResponse.error).toHaveBeenCalledWith(
      mockResponse,
      'Validation failed',
      HttpStatusCode.BAD_REQUEST,
      { code: ErrorCode.VALIDATION_ERROR, details: { field: 'value' } }
    );
  });

  it('should handle SecurityError correctly', async () => {
    const error = new SecurityError(
      'Unauthorized access',
      { detail: 'Authentication required' } // Provide an object for ErrorMetadata
    );
    await errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(ErrorLogService.prototype.logError).toHaveBeenCalledWith(error, mockRequest);
    expect(ApiResponse.error).toHaveBeenCalledWith(
      mockResponse,
      'Unauthorized access',
      HttpStatusCode.UNAUTHORIZED,
      { code: ErrorCode.UNAUTHORIZED }
    );
  });

  it('should handle generic Error correctly', async () => {
    const error = new Error('Generic error');
    await errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(ErrorLogService.prototype.logError).toHaveBeenCalledWith(expect.any(BaseError), mockRequest);
    expect(ApiResponse.error).toHaveBeenCalledWith(
      mockResponse,
      'Internal Server Error',
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      undefined
    );
  });

  it('should handle production environment correctly', async () => {
    process.env.NODE_ENV = 'production';
    const error = new BaseError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Test message',
      'error',
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
    await errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(ApiResponse.error).toHaveBeenCalledWith(
      mockResponse,
      'Internal Server Error',
      HttpStatusCode.INTERNAL_SERVER_ERROR,
      undefined
    );
    process.env.NODE_ENV = 'development'; // Reset environment
  });
});

describe('notFoundHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/test-route',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('should call next with a BaseError for not found route', () => {
    notFoundHandler(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(BaseError));
    const error = (mockNext as jest.Mock).mock.calls[0][0];
    expect(error.errorCode).toBe(ErrorCode.NOT_FOUND);
    expect(error.message).toBe('/test-route yolu bulunamadı');
    expect(error.statusCode).toBe(HttpStatusCode.NOT_FOUND);
  });
});