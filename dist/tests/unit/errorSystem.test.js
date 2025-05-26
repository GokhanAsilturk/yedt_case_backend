"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../../middleware/errorHandler");
const BaseError_1 = require("../../error/models/BaseError");
const ValidationError_1 = require("../../error/models/ValidationError");
const BusinessError_1 = require("../../error/models/BusinessError");
const SecurityError_1 = require("../../error/models/SecurityError");
const TechnicalError_1 = require("../../error/models/TechnicalError");
const errorCodes_1 = require("../../error/constants/errorCodes");
const httpStatusCodes_1 = require("../../error/constants/httpStatusCodes");
const apiResponse_1 = __importDefault(require("../../utils/apiResponse"));
const ErrorLogService_1 = require("../../error/services/ErrorLogService");
const errorUtils = __importStar(require("../../error/utils/errorUtils"));
// Mock ApiResponse ve ErrorLogService
jest.mock('../../utils/apiResponse');
jest.mock('../../error/services/ErrorLogService');
describe('Hata Yönetim Sistemi Testleri', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    let errorLogSpy;
    let apiResponseErrorSpy;
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
        errorLogSpy = jest.spyOn(ErrorLogService_1.ErrorLogService.prototype, 'logError').mockResolvedValue();
        apiResponseErrorSpy = jest.spyOn(apiResponse_1.default, 'error').mockReturnValue(mockResponse);
        // Node environment'ı development olarak ayarla
        process.env.NODE_ENV = 'development';
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Hata Modelleri Testleri', () => {
        it('ValidationError doğru şekilde oluşturulmalı', () => {
            const errorDetails = { field: 'email', message: 'Geçersiz e-posta formatı' };
            const error = new ValidationError_1.ValidationError('Doğrulama hatası', errorDetails);
            expect(error).toBeInstanceOf(BaseError_1.BaseError);
            expect(error).toBeInstanceOf(ValidationError_1.ValidationError);
            expect(error.errorCode).toBe(errorCodes_1.ErrorCode.VALIDATION_ERROR);
            expect(error.message).toBe('Doğrulama hatası');
            expect(error.severity).toBe('error');
            expect(error.statusCode).toBe(httpStatusCodes_1.HttpStatusCode.BAD_REQUEST);
            expect(error.details).toEqual(errorDetails);
        });
        it('BusinessError doğru şekilde oluşturulmalı', () => {
            const error = new BusinessError_1.BusinessError('İş mantığı hatası');
            expect(error).toBeInstanceOf(BaseError_1.BaseError);
            expect(error).toBeInstanceOf(BusinessError_1.BusinessError);
            expect(error.errorCode).toBe(errorCodes_1.ErrorCode.BUSINESS_ERROR);
            expect(error.message).toBe('İş mantığı hatası');
            expect(error.severity).toBe('error');
            expect(error.statusCode).toBe(httpStatusCodes_1.HttpStatusCode.BAD_REQUEST);
        });
        it('SecurityError doğru şekilde oluşturulmalı', () => {
            const error = new SecurityError_1.SecurityError('Güvenlik hatası');
            expect(error).toBeInstanceOf(BaseError_1.BaseError);
            expect(error).toBeInstanceOf(SecurityError_1.SecurityError);
            expect(error.errorCode).toBe(errorCodes_1.ErrorCode.SECURITY_ERROR);
            expect(error.message).toBe('Güvenlik hatası');
            expect(error.severity).toBe('error');
            expect(error.statusCode).toBe(httpStatusCodes_1.HttpStatusCode.FORBIDDEN);
        });
        it('TechnicalError doğru şekilde oluşturulmalı', () => {
            const error = new TechnicalError_1.TechnicalError('Teknik hata');
            expect(error).toBeInstanceOf(BaseError_1.BaseError);
            expect(error).toBeInstanceOf(TechnicalError_1.TechnicalError);
            expect(error.errorCode).toBe(errorCodes_1.ErrorCode.TECHNICAL_ERROR);
            expect(error.message).toBe('Teknik hata');
            expect(error.severity).toBe('error');
            expect(error.statusCode).toBe(httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR);
        });
        it('BaseError doğru şekilde oluşturulmalı', () => {
            const error = new BaseError_1.BaseError(errorCodes_1.ErrorCode.GENERIC_ERROR, 'Genel hata', 'error', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR);
            expect(error).toBeInstanceOf(BaseError_1.BaseError);
            expect(error.errorCode).toBe(errorCodes_1.ErrorCode.GENERIC_ERROR);
            expect(error.message).toBe('Genel hata');
            expect(error.severity).toBe('error');
            expect(error.statusCode).toBe(httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR);
        });
    });
    describe('errorUtils Yardımcı Fonksiyonları Testleri', () => {
        it('createValidationError doğru hata oluşturmalı', () => {
            const metadata = { field: 'username' };
            const context = { operation: 'kayıt olma' };
            const error = errorUtils.createValidationError('Doğrulama hatası', httpStatusCodes_1.HttpStatusCode.BAD_REQUEST, metadata, context);
            expect(error).toBeInstanceOf(BaseError_1.BaseError);
            expect(error.errorCode).toBe(errorCodes_1.ErrorCode.VALIDATION_ERROR);
            expect(error.message).toBe('Doğrulama hatası');
            expect(error.severity).toBe('warning');
            expect(error.statusCode).toBe(httpStatusCodes_1.HttpStatusCode.BAD_REQUEST);
            expect(error.metadata).toEqual(metadata);
            expect(error.context).toEqual(context);
        });
        it('createBusinessError doğru hata oluşturmalı', () => {
            const metadata = { entityId: '123' };
            const context = { operation: 'güncelleme' };
            const error = errorUtils.createBusinessError('İş mantığı hatası', httpStatusCodes_1.HttpStatusCode.BAD_REQUEST, metadata, context);
            expect(error).toBeInstanceOf(BaseError_1.BaseError);
            expect(error.errorCode).toBe(errorCodes_1.ErrorCode.BUSINESS_ERROR);
            expect(error.message).toBe('İş mantığı hatası');
            expect(error.severity).toBe('warning');
            expect(error.statusCode).toBe(httpStatusCodes_1.HttpStatusCode.BAD_REQUEST);
            expect(error.metadata).toEqual(metadata);
            expect(error.context).toEqual(context);
        });
        it('createSecurityError doğru hata oluşturmalı', () => {
            const metadata = { userId: '123' };
            const context = { operation: 'erişim kontrolü' };
            const error = errorUtils.createSecurityError('Güvenlik hatası', httpStatusCodes_1.HttpStatusCode.FORBIDDEN, metadata, context);
            expect(error).toBeInstanceOf(BaseError_1.BaseError);
            expect(error.errorCode).toBe(errorCodes_1.ErrorCode.SECURITY_ERROR);
            expect(error.message).toBe('Güvenlik hatası');
            expect(error.severity).toBe('error');
            expect(error.statusCode).toBe(httpStatusCodes_1.HttpStatusCode.FORBIDDEN);
            expect(error.metadata).toEqual(metadata);
            expect(error.context).toEqual(context);
        });
        it('createTechnicalError doğru hata oluşturmalı', () => {
            const metadata = { service: 'database' };
            const context = { operation: 'veri sorgulama' };
            const error = errorUtils.createTechnicalError('Teknik hata', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR, metadata, context);
            expect(error).toBeInstanceOf(BaseError_1.BaseError);
            expect(error.errorCode).toBe(errorCodes_1.ErrorCode.TECHNICAL_ERROR);
            expect(error.message).toBe('Teknik hata');
            expect(error.severity).toBe('error');
            expect(error.statusCode).toBe(httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR);
            expect(error.metadata).toEqual(metadata);
            expect(error.context).toEqual(context);
        });
    });
    describe('errorHandler Middleware Testleri', () => {
        it('ValidationError doğru şekilde işlenmeli', async () => {
            const errorDetails = { field: 'email', message: 'Geçersiz e-posta formatı' };
            const error = new ValidationError_1.ValidationError('Doğrulama hatası', errorDetails);
            await (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(errorLogSpy).toHaveBeenCalledWith(error, mockRequest);
            expect(apiResponseErrorSpy).toHaveBeenCalledWith(mockResponse, 'Doğrulama hatası', httpStatusCodes_1.HttpStatusCode.BAD_REQUEST, { code: errorCodes_1.ErrorCode.VALIDATION_ERROR, details: errorDetails });
        });
        it('BusinessError doğru şekilde işlenmeli', async () => {
            const error = new BusinessError_1.BusinessError('İş mantığı hatası');
            await (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(errorLogSpy).toHaveBeenCalledWith(error, mockRequest);
            expect(apiResponseErrorSpy).toHaveBeenCalledWith(mockResponse, 'İş mantığı hatası', httpStatusCodes_1.HttpStatusCode.BAD_REQUEST, { code: errorCodes_1.ErrorCode.BUSINESS_ERROR });
        });
        it('SecurityError doğru şekilde işlenmeli', async () => {
            const error = new SecurityError_1.SecurityError('Güvenlik hatası');
            await (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(errorLogSpy).toHaveBeenCalledWith(error, mockRequest);
            expect(apiResponseErrorSpy).toHaveBeenCalledWith(mockResponse, 'Güvenlik hatası', httpStatusCodes_1.HttpStatusCode.FORBIDDEN, { code: errorCodes_1.ErrorCode.SECURITY_ERROR });
        });
        it('TechnicalError doğru şekilde işlenmeli', async () => {
            const error = new TechnicalError_1.TechnicalError('Teknik hata');
            await (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(errorLogSpy).toHaveBeenCalledWith(error, mockRequest);
            expect(apiResponseErrorSpy).toHaveBeenCalledWith(mockResponse, 'Teknik hata', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR, { code: errorCodes_1.ErrorCode.TECHNICAL_ERROR });
        });
        it('BaseError doğru şekilde işlenmeli', async () => {
            const error = new BaseError_1.BaseError(errorCodes_1.ErrorCode.GENERIC_ERROR, 'Genel hata', 'error', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR);
            await (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(errorLogSpy).toHaveBeenCalledWith(error, mockRequest);
            expect(apiResponseErrorSpy).toHaveBeenCalledWith(mockResponse, 'Genel hata', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR, { code: errorCodes_1.ErrorCode.GENERIC_ERROR });
        });
        it('Standart Error düzgün şekilde BaseError\'a dönüştürülmeli', async () => {
            const error = new Error('Standart hata');
            await (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(errorLogSpy).toHaveBeenCalled();
            expect(apiResponseErrorSpy).toHaveBeenCalledWith(mockResponse, 'Internal Server Error', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR, undefined);
        });
        it('Production ortamında hata detayları gizlenmeli', async () => {
            process.env.NODE_ENV = 'production';
            const error = new ValidationError_1.ValidationError('Doğrulama hatası', { field: 'email' });
            await (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(errorLogSpy).toHaveBeenCalledWith(error, mockRequest);
            expect(apiResponseErrorSpy).toHaveBeenCalledWith(mockResponse, 'Internal Server Error', httpStatusCodes_1.HttpStatusCode.BAD_REQUEST, undefined);
            process.env.NODE_ENV = 'development'; // Ortamı geri sıfırla
        });
    });
    describe('ApiResponse Testleri', () => {
        it('ApiResponse.error doğru yanıt formatını döndürmeli', () => {
            const originalApiResponseError = jest.requireActual('../../utils/apiResponse').default.error;
            jest.spyOn(apiResponse_1.default, 'error').mockImplementation(originalApiResponseError);
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            apiResponse_1.default.error(mockRes, 'Hata mesajı', 400, { code: 'TEST_ERROR' });
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Hata mesajı',
                error: { code: 'TEST_ERROR' }
            });
        });
    });
});
//# sourceMappingURL=errorSystem.test.js.map