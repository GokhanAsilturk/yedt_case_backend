/**
 * Bu dosya, hata yönetim sistemini manuel olarak test etmek için kullanılır.
 * 
 * Test etmek için:
 * 1. npm run test:manual komutu ile çalıştırın
 */

import { BaseError } from '../error/models/BaseError';
import { ValidationError } from '../error/models/ValidationError';
import { BusinessError } from '../error/models/BusinessError';
import { SecurityError } from '../error/models/SecurityError';
import { TechnicalError } from '../error/models/TechnicalError';
import { ErrorCode } from '../error/constants/errorCodes';
import { HttpStatusCode } from '../error/constants/httpStatusCodes';
import * as errorUtils from '../error/utils/errorUtils';

// Test fonksiyonları
function testValidationError() {
  console.log('\n--- ValidationError Testi ---');
  const errorDetails = { field: 'email', message: 'Geçerli bir e-posta adresi girilmelidir' };
  const error = new ValidationError('Geçersiz giriş değeri', errorDetails);
  
  console.log('Error Code:', error.errorCode);
  console.log('Message:', error.message);
  console.log('Status Code:', error.statusCode);
  console.log('Severity:', error.severity);
  console.log('Details:', error.details);
  
  // Test onayı
  if (
    error.errorCode === ErrorCode.VALIDATION_ERROR &&
    error.message === 'Geçersiz giriş değeri' &&
    error.statusCode === HttpStatusCode.BAD_REQUEST &&
    error.severity === 'error' &&
    error.details === errorDetails
  ) {
    console.log('✅ ValidationError testi başarılı!');
  } else {
    console.log('❌ ValidationError testi başarısız!');
  }
}

function testBusinessError() {
  console.log('\n--- BusinessError Testi ---');
  const error = new BusinessError('Kaydedilecek öğrenci zaten mevcut');
  
  console.log('Error Code:', error.errorCode);
  console.log('Message:', error.message);
  console.log('Status Code:', error.statusCode);
  console.log('Severity:', error.severity);
  
  // Test onayı
  if (
    error.errorCode === ErrorCode.BUSINESS_ERROR &&
    error.message === 'Kaydedilecek öğrenci zaten mevcut' &&
    error.statusCode === HttpStatusCode.BAD_REQUEST &&
    error.severity === 'error'
  ) {
    console.log('✅ BusinessError testi başarılı!');
  } else {
    console.log('❌ BusinessError testi başarısız!');
  }
}

function testSecurityError() {
  console.log('\n--- SecurityError Testi ---');
  const error = new SecurityError('Bu işlem için yetkiniz bulunmamaktadır');
  
  console.log('Error Code:', error.errorCode);
  console.log('Message:', error.message);
  console.log('Status Code:', error.statusCode);
  console.log('Severity:', error.severity);
  
  // Test onayı
  if (
    error.errorCode === ErrorCode.SECURITY_ERROR &&
    error.message === 'Bu işlem için yetkiniz bulunmamaktadır' &&
    error.statusCode === HttpStatusCode.FORBIDDEN &&
    error.severity === 'error'
  ) {
    console.log('✅ SecurityError testi başarılı!');
  } else {
    console.log('❌ SecurityError testi başarısız!');
  }
}

function testTechnicalError() {
  console.log('\n--- TechnicalError Testi ---');
  const error = new TechnicalError('Veritabanı bağlantısı sağlanamadı');
  
  console.log('Error Code:', error.errorCode);
  console.log('Message:', error.message);
  console.log('Status Code:', error.statusCode);
  console.log('Severity:', error.severity);
  
  // Test onayı
  if (
    error.errorCode === ErrorCode.TECHNICAL_ERROR &&
    error.message === 'Veritabanı bağlantısı sağlanamadı' &&
    error.statusCode === HttpStatusCode.INTERNAL_SERVER_ERROR &&
    error.severity === 'error'
  ) {
    console.log('✅ TechnicalError testi başarılı!');
  } else {
    console.log('❌ TechnicalError testi başarısız!');
  }
}

function testBaseError() {
  console.log('\n--- BaseError Testi ---');
  const error = new BaseError(
    ErrorCode.GENERIC_ERROR,
    'Genel bir hata oluştu',
    'error',
    HttpStatusCode.INTERNAL_SERVER_ERROR
  );
  
  console.log('Error Code:', error.errorCode);
  console.log('Message:', error.message);
  console.log('Status Code:', error.statusCode);
  console.log('Severity:', error.severity);
  
  // Test onayı
  if (
    error.errorCode === ErrorCode.GENERIC_ERROR &&
    error.message === 'Genel bir hata oluştu' &&
    error.statusCode === HttpStatusCode.INTERNAL_SERVER_ERROR &&
    error.severity === 'error'
  ) {
    console.log('✅ BaseError testi başarılı!');
  } else {
    console.log('❌ BaseError testi başarısız!');
  }
}

// errorUtils test fonksiyonları
function testErrorUtils() {
  console.log('\n--- errorUtils Testleri ---');
  
  // createValidationError testi
  const validationError = errorUtils.createValidationError(
    'Doğrulama hatası',
    HttpStatusCode.BAD_REQUEST,
    { field: 'password' }
  );
  console.log('createValidationError:', 
    validationError.errorCode === ErrorCode.VALIDATION_ERROR &&
    validationError.message === 'Doğrulama hatası' &&
    validationError.statusCode === HttpStatusCode.BAD_REQUEST
    ? '✅ Başarılı' : '❌ Başarısız'
  );
  
  // createBusinessError testi
  const businessError = errorUtils.createBusinessError('İş mantığı hatası');
  console.log('createBusinessError:', 
    businessError.errorCode === ErrorCode.BUSINESS_ERROR &&
    businessError.message === 'İş mantığı hatası' &&
    businessError.statusCode === HttpStatusCode.BAD_REQUEST
    ? '✅ Başarılı' : '❌ Başarısız'
  );
  
  // createSecurityError testi
  const securityError = errorUtils.createSecurityError('Güvenlik hatası');
  console.log('createSecurityError:', 
    securityError.errorCode === ErrorCode.SECURITY_ERROR &&
    securityError.message === 'Güvenlik hatası' &&
    securityError.statusCode === HttpStatusCode.FORBIDDEN
    ? '✅ Başarılı' : '❌ Başarısız'
  );
  
  // createTechnicalError testi
  const technicalError = errorUtils.createTechnicalError('Teknik hata');
  console.log('createTechnicalError:', 
    technicalError.errorCode === ErrorCode.TECHNICAL_ERROR &&
    technicalError.message === 'Teknik hata' &&
    technicalError.statusCode === HttpStatusCode.INTERNAL_SERVER_ERROR
    ? '✅ Başarılı' : '❌ Başarısız'
  );
}

// BaseError'dan türetilmiş hataların instanceof kontrolü
function testInstanceOfChecks() {
  console.log('\n--- instanceof Kontrolleri ---');
  
  const validationError = new ValidationError('Test');
  const businessError = new BusinessError('Test');
  const securityError = new SecurityError('Test');
  const technicalError = new TechnicalError('Test');
  
  // ValidationError instanceof kontrolü
  console.log('ValidationError instanceof BaseError:', 
    validationError instanceof BaseError ? '✅ Başarılı' : '❌ Başarısız');
  
  // BusinessError instanceof kontrolü
  console.log('BusinessError instanceof BaseError:', 
    businessError instanceof BaseError ? '✅ Başarılı' : '❌ Başarısız');
  
  // SecurityError instanceof kontrolü
  console.log('SecurityError instanceof BaseError:', 
    securityError instanceof BaseError ? '✅ Başarılı' : '❌ Başarısız');
  
  // TechnicalError instanceof kontrolü
  console.log('TechnicalError instanceof BaseError:', 
    technicalError instanceof BaseError ? '✅ Başarılı' : '❌ Başarısız');
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