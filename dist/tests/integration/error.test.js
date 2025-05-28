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
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const BaseError_1 = require("../../error/models/BaseError");
const ValidationError_1 = require("../../error/models/ValidationError");
const BusinessError_1 = require("../../error/models/BusinessError");
const SecurityError_1 = require("../../error/models/SecurityError");
const TechnicalError_1 = require("../../error/models/TechnicalError");
const errorHandler_1 = require("../../middleware/errorHandler");
const errorCodes_1 = require("../../error/constants/errorCodes");
const httpStatusCodes_1 = require("../../error/constants/httpStatusCodes");
const errorUtils = __importStar(require("../../error/utils/errorUtils"));
jest.mock('../../error/services/ErrorLogService', () => {
    return {
        ErrorLogService: jest.fn().mockImplementation(() => {
            return { logError: jest.fn().mockImplementation((error, req) => Promise.resolve(undefined)) };
        })
    };
});
// Test için mock API oluşturma
const app = (0, express_1.default)();
// Test rotaları oluştur - her biri farklı bir hata türünü tetikler
app.get('/api/error/validation', (req, res, next) => {
    const error = new ValidationError_1.ValidationError('Geçersiz giriş değeri', { field: 'email', message: 'Geçerli bir e-posta adresi girilmelidir' });
    next(error);
});
app.get('/api/error/business', (req, res, next) => {
    const error = new BusinessError_1.BusinessError('Kaydedilecek öğrenci zaten mevcut');
    next(error);
});
app.get('/api/error/security', (req, res, next) => {
    const error = new SecurityError_1.SecurityError('Bu işlem için yetkiniz bulunmamaktadır');
    next(error);
});
app.get('/api/error/technical', (req, res, next) => {
    const error = new TechnicalError_1.TechnicalError('Veritabanı bağlantısı sağlanamadı');
    next(error);
});
app.get('/api/error/base', (req, res, next) => {
    const error = new BaseError_1.BaseError(errorCodes_1.ErrorCode.GENERIC_ERROR, 'Genel bir hata oluştu', 'error', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR);
    next(error);
});
app.get('/api/error/standard', (req, res, next) => {
    const error = new Error('Standart JS hatası');
    next(error);
});
app.get('/api/error/utils/validation', (req, res, next) => {
    const error = errorUtils.createValidationError('Doğrulama hatası (utils)', httpStatusCodes_1.HttpStatusCode.BAD_REQUEST, { field: 'password', message: 'Şifre en az 8 karakter olmalıdır' });
    next(error);
});
app.get('/api/error/utils/business', (req, res, next) => {
    const error = errorUtils.createBusinessError('İş mantığı hatası (utils)');
    next(error);
});
app.get('/api/error/utils/security', (req, res, next) => {
    const error = errorUtils.createSecurityError('Güvenlik hatası (utils)');
    next(error);
});
app.get('/api/error/utils/technical', (req, res, next) => {
    const error = errorUtils.createTechnicalError('Teknik hata (utils)');
    next(error);
});
// 404 handler
app.use(errorHandler_1.notFoundHandler);
// Error handler middleware'i
app.use(function (err, req, res, next) {
    // async fonksiyonu non-async olarak çağırıyoruz
    (0, errorHandler_1.errorHandler)(err, req, res, next).catch(next);
    // Promise'i döndürmüyoruz - express middleware'leri Promise döndürmemelidir
});
describe('Hata Yönetim Sistemi Entegrasyon Testleri', () => {
    describe('Hata Sınıfları Testleri', () => {
        it('ValidationError doğru şekilde işlenmeli', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/error/validation');
            expect(response.status).toBe(httpStatusCodes_1.HttpStatusCode.BAD_REQUEST);
            expect(response.body).toEqual({
                success: false,
                message: 'Geçersiz giriş değeri',
                error: {
                    code: errorCodes_1.ErrorCode.VALIDATION_ERROR,
                    details: { field: 'email', message: 'Geçerli bir e-posta adresi girilmelidir' }
                }
            });
        });
        it('BusinessError doğru şekilde işlenmeli', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/error/business');
            expect(response.status).toBe(httpStatusCodes_1.HttpStatusCode.BAD_REQUEST);
            expect(response.body).toEqual({
                success: false,
                message: 'Kaydedilecek öğrenci zaten mevcut',
                error: { code: errorCodes_1.ErrorCode.BUSINESS_ERROR }
            });
        });
        it('SecurityError doğru şekilde işlenmeli', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/error/security');
            expect(response.status).toBe(httpStatusCodes_1.HttpStatusCode.FORBIDDEN);
            expect(response.body).toEqual({
                success: false,
                message: 'Bu işlem için yetkiniz bulunmamaktadır',
                error: { code: errorCodes_1.ErrorCode.SECURITY_ERROR }
            });
        });
        it('TechnicalError doğru şekilde işlenmeli', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/error/technical');
            expect(response.status).toBe(httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                success: false,
                message: 'Veritabanı bağlantısı sağlanamadı',
                error: { code: errorCodes_1.ErrorCode.TECHNICAL_ERROR }
            });
        });
        it('BaseError doğru şekilde işlenmeli', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/error/base');
            expect(response.status).toBe(httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                success: false,
                message: 'Genel bir hata oluştu',
                error: { code: errorCodes_1.ErrorCode.GENERIC_ERROR }
            });
        });
        it('Standart Error doğru şekilde işlenmeli', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/error/standard');
            expect(response.status).toBe(httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                success: false,
                message: 'Internal Server Error'
            });
        });
    });
    describe('errorUtils Yardımcı Fonksiyonları Testleri', () => {
        it('createValidationError fonksiyonu doğru şekilde işlenmeli', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/error/utils/validation');
            expect(response.status).toBe(httpStatusCodes_1.HttpStatusCode.BAD_REQUEST);
            expect(response.body).toEqual({
                success: false,
                message: 'Doğrulama hatası (utils)',
                error: {
                    code: errorCodes_1.ErrorCode.VALIDATION_ERROR,
                    details: { field: 'password', message: 'Şifre en az 8 karakter olmalıdır' }
                }
            });
        });
        it('createBusinessError fonksiyonu doğru şekilde işlenmeli', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/error/utils/business');
            expect(response.status).toBe(httpStatusCodes_1.HttpStatusCode.BAD_REQUEST);
            expect(response.body).toEqual({
                success: false,
                message: 'İş mantığı hatası (utils)',
                error: { code: errorCodes_1.ErrorCode.BUSINESS_ERROR }
            });
        });
        it('createSecurityError fonksiyonu doğru şekilde işlenmeli', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/error/utils/security');
            expect(response.status).toBe(httpStatusCodes_1.HttpStatusCode.FORBIDDEN);
            expect(response.body).toEqual({
                success: false,
                message: 'Güvenlik hatası (utils)',
                error: { code: errorCodes_1.ErrorCode.SECURITY_ERROR }
            });
        });
        it('createTechnicalError fonksiyonu doğru şekilde işlenmeli', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/error/utils/technical');
            expect(response.status).toBe(httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR);
            expect(response.body).toEqual({
                success: false,
                message: 'Teknik hata (utils)',
                error: { code: errorCodes_1.ErrorCode.TECHNICAL_ERROR }
            });
        });
    });
    describe('notFoundHandler Testi', () => {
        it('Bulunmayan rota için 404 hatası döndürmeli', async () => {
            const response = await (0, supertest_1.default)(app).get('/api/nonexistent-route');
            expect(response.status).toBe(httpStatusCodes_1.HttpStatusCode.NOT_FOUND);
            expect(response.body).toEqual({
                success: false,
                message: '/api/nonexistent-route yolu bulunamadı',
                error: { code: errorCodes_1.ErrorCode.NOT_FOUND }
            });
        });
    });
});
//# sourceMappingURL=error.test.js.map