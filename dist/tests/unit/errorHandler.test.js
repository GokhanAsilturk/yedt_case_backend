"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../../middleware/errorHandler");
const BaseError_1 = require("../../error/models/BaseError");
const ValidationError_1 = require("../../error/models/ValidationError");
const SecurityError_1 = require("../../error/models/SecurityError");
const errorCodes_1 = require("../../error/constants/errorCodes");
const httpStatusCodes_1 = require("../../error/constants/httpStatusCodes");
const apiResponse_1 = __importDefault(require("../../utils/apiResponse"));
const ErrorLogService_1 = require("../../error/services/ErrorLogService");
jest.mock('../../utils/apiResponse');
jest.mock('../../error/services/ErrorLogService');
describe('errorHandler', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
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
        const error = new BaseError_1.BaseError(errorCodes_1.ErrorCode.INTERNAL_SERVER_ERROR, 'Test message', 'error', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR);
        await (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
        expect(ErrorLogService_1.ErrorLogService.prototype.logError).toHaveBeenCalledWith(error, mockRequest);
        expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Test message', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR, { code: errorCodes_1.ErrorCode.INTERNAL_SERVER_ERROR });
    });
    it('should handle ValidationError correctly', async () => {
        const error = new ValidationError_1.ValidationError(errorCodes_1.ErrorCode.VALIDATION_ERROR, 'Validation failed', { field: 'value' });
        await (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
        expect(ErrorLogService_1.ErrorLogService.prototype.logError).toHaveBeenCalledWith(error, mockRequest);
        expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Validation failed', httpStatusCodes_1.HttpStatusCode.BAD_REQUEST, { code: errorCodes_1.ErrorCode.VALIDATION_ERROR, details: { field: 'value' } });
    });
    it('should handle SecurityError correctly', async () => {
        const error = new SecurityError_1.SecurityError('Unauthorized access', { detail: 'Authentication required' } // Provide an object for ErrorMetadata
        );
        await (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
        expect(ErrorLogService_1.ErrorLogService.prototype.logError).toHaveBeenCalledWith(error, mockRequest);
        expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Unauthorized access', httpStatusCodes_1.HttpStatusCode.UNAUTHORIZED, { code: errorCodes_1.ErrorCode.UNAUTHORIZED });
    });
    it('should handle generic Error correctly', async () => {
        const error = new Error('Generic error');
        await (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
        expect(ErrorLogService_1.ErrorLogService.prototype.logError).toHaveBeenCalledWith(expect.any(BaseError_1.BaseError), mockRequest);
        expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Internal Server Error', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR, undefined);
    });
    it('should handle production environment correctly', async () => {
        process.env.NODE_ENV = 'production';
        const error = new BaseError_1.BaseError(errorCodes_1.ErrorCode.INTERNAL_SERVER_ERROR, 'Test message', 'error', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR);
        await (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
        expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Internal Server Error', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR, undefined);
        process.env.NODE_ENV = 'development'; // Reset environment
    });
});
describe('notFoundHandler', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
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
        (0, errorHandler_1.notFoundHandler)(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalledWith(expect.any(BaseError_1.BaseError));
        const error = mockNext.mock.calls[0][0];
        expect(error.errorCode).toBe(errorCodes_1.ErrorCode.NOT_FOUND);
        expect(error.message).toBe('/test-route yolu bulunamadı');
        expect(error.statusCode).toBe(httpStatusCodes_1.HttpStatusCode.NOT_FOUND);
    });
});
//# sourceMappingURL=errorHandler.test.js.map