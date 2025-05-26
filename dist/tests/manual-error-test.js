"use strict";
/**
 * Bu dosya, hata yönetim sistemini manuel olarak test etmek için kullanılır.
 *
 * Test etmek için:
 * 1. npm run test:manual komutu ile çalıştırın
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
const BaseError_1 = require("../error/models/BaseError");
const ValidationError_1 = require("../error/models/ValidationError");
const BusinessError_1 = require("../error/models/BusinessError");
const SecurityError_1 = require("../error/models/SecurityError");
const TechnicalError_1 = require("../error/models/TechnicalError");
const errorCodes_1 = require("../error/constants/errorCodes");
const httpStatusCodes_1 = require("../error/constants/httpStatusCodes");
const errorUtils = __importStar(require("../error/utils/errorUtils"));
// Test fonksiyonları
function testValidationError() {
    console.log('\n--- ValidationError Testi ---');
    const errorDetails = { field: 'email', message: 'Geçerli bir e-posta adresi girilmelidir' };
    const error = new ValidationError_1.ValidationError('Geçersiz giriş değeri', errorDetails);
    console.log('Error Code:', error.errorCode);
    console.log('Message:', error.message);
    console.log('Status Code:', error.statusCode);
    console.log('Severity:', error.severity);
    console.log('Details:', error.details);
    // Test onayı
    if (error.errorCode === errorCodes_1.ErrorCode.VALIDATION_ERROR &&
        error.message === 'Geçersiz giriş değeri' &&
        error.statusCode === httpStatusCodes_1.HttpStatusCode.BAD_REQUEST &&
        error.severity === 'error' &&
        error.details === errorDetails) {
        console.log('✅ ValidationError testi başarılı!');
    }
    else {
        console.log('❌ ValidationError testi başarısız!');
    }
}
function testBusinessError() {
    console.log('\n--- BusinessError Testi ---');
    const error = new BusinessError_1.BusinessError('Kaydedilecek öğrenci zaten mevcut');
    console.log('Error Code:', error.errorCode);
    console.log('Message:', error.message);
    console.log('Status Code:', error.statusCode);
    console.log('Severity:', error.severity);
    // Test onayı
    if (error.errorCode === errorCodes_1.ErrorCode.BUSINESS_ERROR &&
        error.message === 'Kaydedilecek öğrenci zaten mevcut' &&
        error.statusCode === httpStatusCodes_1.HttpStatusCode.BAD_REQUEST &&
        error.severity === 'error') {
        console.log('✅ BusinessError testi başarılı!');
    }
    else {
        console.log('❌ BusinessError testi başarısız!');
    }
}
function testSecurityError() {
    console.log('\n--- SecurityError Testi ---');
    const error = new SecurityError_1.SecurityError('Bu işlem için yetkiniz bulunmamaktadır');
    console.log('Error Code:', error.errorCode);
    console.log('Message:', error.message);
    console.log('Status Code:', error.statusCode);
    console.log('Severity:', error.severity);
    // Test onayı
    if (error.errorCode === errorCodes_1.ErrorCode.SECURITY_ERROR &&
        error.message === 'Bu işlem için yetkiniz bulunmamaktadır' &&
        error.statusCode === httpStatusCodes_1.HttpStatusCode.FORBIDDEN &&
        error.severity === 'error') {
        console.log('✅ SecurityError testi başarılı!');
    }
    else {
        console.log('❌ SecurityError testi başarısız!');
    }
}
function testTechnicalError() {
    console.log('\n--- TechnicalError Testi ---');
    const error = new TechnicalError_1.TechnicalError('Veritabanı bağlantısı sağlanamadı');
    console.log('Error Code:', error.errorCode);
    console.log('Message:', error.message);
    console.log('Status Code:', error.statusCode);
    console.log('Severity:', error.severity);
    // Test onayı
    if (error.errorCode === errorCodes_1.ErrorCode.TECHNICAL_ERROR &&
        error.message === 'Veritabanı bağlantısı sağlanamadı' &&
        error.statusCode === httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR &&
        error.severity === 'error') {
        console.log('✅ TechnicalError testi başarılı!');
    }
    else {
        console.log('❌ TechnicalError testi başarısız!');
    }
}
function testBaseError() {
    console.log('\n--- BaseError Testi ---');
    const error = new BaseError_1.BaseError(errorCodes_1.ErrorCode.GENERIC_ERROR, 'Genel bir hata oluştu', 'error', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR);
    console.log('Error Code:', error.errorCode);
    console.log('Message:', error.message);
    console.log('Status Code:', error.statusCode);
    console.log('Severity:', error.severity);
    // Test onayı
    if (error.errorCode === errorCodes_1.ErrorCode.GENERIC_ERROR &&
        error.message === 'Genel bir hata oluştu' &&
        error.statusCode === httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR &&
        error.severity === 'error') {
        console.log('✅ BaseError testi başarılı!');
    }
    else {
        console.log('❌ BaseError testi başarısız!');
    }
}
// errorUtils test fonksiyonları
function testErrorUtils() {
    console.log('\n--- errorUtils Testleri ---');
    // createValidationError testi
    const validationError = errorUtils.createValidationError('Doğrulama hatası', httpStatusCodes_1.HttpStatusCode.BAD_REQUEST, { field: 'password' });
    console.log('createValidationError:', validationError.errorCode === errorCodes_1.ErrorCode.VALIDATION_ERROR &&
        validationError.message === 'Doğrulama hatası' &&
        validationError.statusCode === httpStatusCodes_1.HttpStatusCode.BAD_REQUEST
        ? '✅ Başarılı' : '❌ Başarısız');
    // createBusinessError testi
    const businessError = errorUtils.createBusinessError('İş mantığı hatası');
    console.log('createBusinessError:', businessError.errorCode === errorCodes_1.ErrorCode.BUSINESS_ERROR &&
        businessError.message === 'İş mantığı hatası' &&
        businessError.statusCode === httpStatusCodes_1.HttpStatusCode.BAD_REQUEST
        ? '✅ Başarılı' : '❌ Başarısız');
    // createSecurityError testi
    const securityError = errorUtils.createSecurityError('Güvenlik hatası');
    console.log('createSecurityError:', securityError.errorCode === errorCodes_1.ErrorCode.SECURITY_ERROR &&
        securityError.message === 'Güvenlik hatası' &&
        securityError.statusCode === httpStatusCodes_1.HttpStatusCode.FORBIDDEN
        ? '✅ Başarılı' : '❌ Başarısız');
    // createTechnicalError testi
    const technicalError = errorUtils.createTechnicalError('Teknik hata');
    console.log('createTechnicalError:', technicalError.errorCode === errorCodes_1.ErrorCode.TECHNICAL_ERROR &&
        technicalError.message === 'Teknik hata' &&
        technicalError.statusCode === httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR
        ? '✅ Başarılı' : '❌ Başarısız');
}
// BaseError'dan türetilmiş hataların instanceof kontrolü
function testInstanceOfChecks() {
    console.log('\n--- instanceof Kontrolleri ---');
    const validationError = new ValidationError_1.ValidationError('Test');
    const businessError = new BusinessError_1.BusinessError('Test');
    const securityError = new SecurityError_1.SecurityError('Test');
    const technicalError = new TechnicalError_1.TechnicalError('Test');
    // ValidationError instanceof kontrolü
    console.log('ValidationError instanceof BaseError:', validationError instanceof BaseError_1.BaseError ? '✅ Başarılı' : '❌ Başarısız');
    // BusinessError instanceof kontrolü
    console.log('BusinessError instanceof BaseError:', businessError instanceof BaseError_1.BaseError ? '✅ Başarılı' : '❌ Başarısız');
    // SecurityError instanceof kontrolü
    console.log('SecurityError instanceof BaseError:', securityError instanceof BaseError_1.BaseError ? '✅ Başarılı' : '❌ Başarısız');
    // TechnicalError instanceof kontrolü
    console.log('TechnicalError instanceof BaseError:', technicalError instanceof BaseError_1.BaseError ? '✅ Başarılı' : '❌ Başarısız');
}
// Ana test fonksiyonu
function runAllTests() {
    console.log('\n========== HATA YÖNETİM SİSTEMİ TESTLERİ ==========\n');
    testValidationError();
    testBusinessError();
    testSecurityError();
    testTechnicalError();
    testBaseError();
    testErrorUtils();
    testInstanceOfChecks();
    console.log('\n=============== TEST SONUÇLARI ===============\n');
}
// Bu dosya doğrudan çalıştırıldığında tüm testleri çalıştır
if (require.main === module) {
    runAllTests();
}
//# sourceMappingURL=manual-error-test.js.map