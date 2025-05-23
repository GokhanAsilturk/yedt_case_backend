import { Request, Response } from 'express';
import { errorHandler } from '../../middleware/errorHandler';
import { BaseError } from '../../error/models/BaseError';
import { ValidationError } from '../../error/models/ValidationError';
import { BusinessError } from '../../error/models/BusinessError';
import { SecurityError } from '../../error/models/SecurityError';
import { TechnicalError } from '../../error/models/TechnicalError';
import { ErrorCode } from '../../error/constants/errorCodes';
import { HttpStatusCode } from '../../error/constants/httpStatusCodes';
import ApiResponse from '../../utils/apiResponse';
import { ErrorLogService } from '../../error/services/ErrorLogService';
import * as errorUtils from '../../error/utils/errorUtils';

// Mock ApiResponse ve ErrorLogService
jest.mock('../../utils/apiResponse');
jest.mock('../../error/services/ErrorLogService');

describe('Hata Yönetim Sistemi Testleri', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let errorLogSpy: jest.SpyInstance;
  let apiResponseErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      url: '/test',
      method: 'GET',
      headers: {},
      body: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
    
    // ErrorLogService ve ApiResponse spy'ları
    errorLogSpy = jest.spyOn(ErrorLogService.prototype, 'logError').mockResolvedValue();
    apiResponseErrorSpy = jest.spyOn(ApiResponse, 'error').mockReturnValue(mockResponse as Response);
    
    // Node environment'ı development olarak ayarla
    process.env.NODE_ENV = 'development';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Hata Modelleri Testleri', () => {
    it('ValidationError doğru şekilde oluşturulmalı', () => {
      const errorDetails = { field: 'email', message: 'Geçersiz e-posta formatı' };
      const error = new ValidationError('Doğrulama hatası', errorDetails);
      
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.errorCode).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Doğrulama hatası');
      expect(error.severity).toBe('error');
      expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(error.details).toEqual(errorDetails);
    });

    it('BusinessError doğru şekilde oluşturulmalı', () => {
      const error = new BusinessError('İş mantığı hatası');
      
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(BusinessError);
      expect(error.errorCode).toBe(ErrorCode.BUSINESS_ERROR);
      expect(error.message).toBe('İş mantığı hatası');
      expect(error.severity).toBe('error');
      expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
    });

    it('SecurityError doğru şekilde oluşturulmalı', () => {
      const error = new SecurityError('Güvenlik hatası');
      
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(SecurityError);
      expect(error.errorCode).toBe(ErrorCode.SECURITY_ERROR);
      expect(error.message).toBe('Güvenlik hatası');
      expect(error.severity).toBe('error');
      expect(error.statusCode).toBe(HttpStatusCode.FORBIDDEN);
    });

    it('TechnicalError doğru şekilde oluşturulmalı', () => {
      const error = new TechnicalError('Teknik hata');
      
      expect(error).toBeInstanceOf(BaseError);
      expect(error).toBeInstanceOf(TechnicalError);
      expect(error.errorCode).toBe(ErrorCode.TECHNICAL_ERROR);
      expect(error.message).toBe('Teknik hata');
      expect(error.severity).toBe('error');
      expect(error.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    });

    it('BaseError doğru şekilde oluşturulmalı', () => {
      const error = new BaseError(
        ErrorCode.GENERIC_ERROR,
        'Genel hata',
        'error',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
      
      expect(error).toBeInstanceOf(BaseError);
      expect(error.errorCode).toBe(ErrorCode.GENERIC_ERROR);
      expect(error.message).toBe('Genel hata');
      expect(error.severity).toBe('error');
      expect(error.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
    });
  });

  describe('errorUtils Yardımcı Fonksiyonları Testleri', () => {
    it('createValidationError doğru hata oluşturmalı', () => {
      const metadata = { field: 'username' };
      const context = { operation: 'kayıt olma' };
      const error = errorUtils.createValidationError(
        'Doğrulama hatası',
        HttpStatusCode.BAD_REQUEST,
        metadata,
        context
      );
      
      expect(error).toBeInstanceOf(BaseError);
      expect(error.errorCode).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.message).toBe('Doğrulama hatası');
      expect(error.severity).toBe('warning');
      expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(error.metadata).toEqual(metadata);
      expect(error.context).toEqual(context);
    });

    it('createBusinessError doğru hata oluşturmalı', () => {
      const metadata = { entityId: '123' };
      const context = { operation: 'güncelleme' };
      const error = errorUtils.createBusinessError(
        'İş mantığı hatası',
        HttpStatusCode.BAD_REQUEST,
        metadata,
        context
      );
      
      expect(error).toBeInstanceOf(BaseError);
      expect(error.errorCode).toBe(ErrorCode.BUSINESS_ERROR);
      expect(error.message).toBe('İş mantığı hatası');
      expect(error.severity).toBe('warning');
      expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
      expect(error.metadata).toEqual(metadata);
      expect(error.context).toEqual(context);
    });

    it('createSecurityError doğru hata oluşturmalı', () => {
      const metadata = { userId: '123' };
      const context = { operation: 'erişim kontrolü' };
      const error = errorUtils.createSecurityError(
        'Güvenlik hatası',
        HttpStatusCode.FORBIDDEN,
        metadata,
        context
      );
      
      expect(error).toBeInstanceOf(BaseError);
      expect(error.errorCode).toBe(ErrorCode.SECURITY_ERROR);
      expect(error.message).toBe('Güvenlik hatası');
      expect(error.severity).toBe('error');
      expect(error.statusCode).toBe(HttpStatusCode.FORBIDDEN);
      expect(error.metadata).toEqual(metadata);
      expect(error.context).toEqual(context);
    });

    it('createTechnicalError doğru hata oluşturmalı', () => {
      const metadata = { service: 'database' };
      const context = { operation: 'veri sorgulama' };
      const error = errorUtils.createTechnicalError(
        'Teknik hata',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        metadata,
        context
      );
      
      expect(error).toBeInstanceOf(BaseError);
      expect(error.errorCode).toBe(ErrorCode.TECHNICAL_ERROR);
      expect(error.message).toBe('Teknik hata');
      expect(error.severity).toBe('error');
      expect(error.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(error.metadata).toEqual(metadata);
      expect(error.context).toEqual(context);
    });
  });

  describe('errorHandler Middleware Testleri', () => {
    it('ValidationError doğru şekilde işlenmeli', async () => {
      const errorDetails = { field: 'email', message: 'Geçersiz e-posta formatı' };
      const error = new ValidationError('Doğrulama hatası', errorDetails);
      
      await errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(errorLogSpy).toHaveBeenCalledWith(error, mockRequest);
      expect(apiResponseErrorSpy).toHaveBeenCalledWith(
        mockResponse,
        'Doğrulama hatası',
        HttpStatusCode.BAD_REQUEST,
        { code: ErrorCode.VALIDATION_ERROR, details: errorDetails }
      );
    });

    it('BusinessError doğru şekilde işlenmeli', async () => {
      const error = new BusinessError('İş mantığı hatası');
      
      await errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(errorLogSpy).toHaveBeenCalledWith(error, mockRequest);
      expect(apiResponseErrorSpy).toHaveBeenCalledWith(
        mockResponse,
        'İş mantığı hatası',
        HttpStatusCode.BAD_REQUEST,
        { code: ErrorCode.BUSINESS_ERROR }
      );
    });

    it('SecurityError doğru şekilde işlenmeli', async () => {
      const error = new SecurityError('Güvenlik hatası');
      
      await errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(errorLogSpy).toHaveBeenCalledWith(error, mockRequest);
      expect(apiResponseErrorSpy).toHaveBeenCalledWith(
        mockResponse,
        'Güvenlik hatası',
        HttpStatusCode.FORBIDDEN,
        { code: ErrorCode.SECURITY_ERROR }
      );
    });

    it('TechnicalError doğru şekilde işlenmeli', async () => {
      const error = new TechnicalError('Teknik hata');
      
      await errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(errorLogSpy).toHaveBeenCalledWith(error, mockRequest);
      expect(apiResponseErrorSpy).toHaveBeenCalledWith(
        mockResponse,
        'Teknik hata',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        { code: ErrorCode.TECHNICAL_ERROR }
      );
    });

    it('BaseError doğru şekilde işlenmeli', async () => {
      const error = new BaseError(
        ErrorCode.GENERIC_ERROR,
        'Genel hata',
        'error',
        HttpStatusCode.INTERNAL_SERVER_ERROR
      );
      
      await errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(errorLogSpy).toHaveBeenCalledWith(error, mockRequest);
      expect(apiResponseErrorSpy).toHaveBeenCalledWith(
        mockResponse,
        'Genel hata',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        { code: ErrorCode.GENERIC_ERROR }
      );
    });

    it('Standart Error düzgün şekilde BaseError\'a dönüştürülmeli', async () => {
      const error = new Error('Standart hata');
      
      await errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(errorLogSpy).toHaveBeenCalled();
      expect(apiResponseErrorSpy).toHaveBeenCalledWith(
        mockResponse,
        'Internal Server Error',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
        undefined
      );
    });

    it('Production ortamında hata detayları gizlenmeli', async () => {
      process.env.NODE_ENV = 'production';
      const error = new ValidationError('Doğrulama hatası', { field: 'email' });
      
      await errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(errorLogSpy).toHaveBeenCalledWith(error, mockRequest);
      expect(apiResponseErrorSpy).toHaveBeenCalledWith(
        mockResponse,
        'Internal Server Error',
        HttpStatusCode.BAD_REQUEST,
        undefined
      );
      
      process.env.NODE_ENV = 'development'; // Ortamı geri sıfırla
    });
  });

  describe('ApiResponse Testleri', () => {
    it('ApiResponse.error doğru yanıt formatını döndürmeli', () => {
      const originalApiResponseError = jest.requireActual('../../utils/apiResponse').default.error;
      jest.spyOn(ApiResponse, 'error').mockImplementation(originalApiResponseError);
      
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;
      
      ApiResponse.error(mockRes, 'Hata mesajı', 400, { code: 'TEST_ERROR' });
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Hata mesajı',
        error: { code: 'TEST_ERROR' }
      });
    });
  });
});