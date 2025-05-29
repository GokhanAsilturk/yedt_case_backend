"use strict";
/**
 * @file src/error/constants/errorMessages.ts
 * @description Merkezi hata mesajları deposu (Türkçe).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessage = void 0;
exports.ErrorMessage = {
    // Genel hatalar
    GENERIC_ERROR: {
        tr: 'Beklenmedik bir hata oluştu.',
        en: 'An unexpected error occurred.',
    },
    INTERNAL_SERVER_ERROR: {
        tr: 'Sunucu hatası.',
        en: 'Internal server error.',
    },
    BAD_REQUEST: {
        tr: 'Geçersiz istek.',
        en: 'Bad request.',
    },
    UNAUTHORIZED: {
        tr: 'Yetkisiz erişim.',
        en: 'Unauthorized.',
    },
    FORBIDDEN: {
        tr: 'Bu kaynağa erişim izniniz yok.',
        en: 'Forbidden.',
    },
    NOT_FOUND: {
        tr: 'Kaynak bulunamadı.',
        en: 'Not found.',
    },
    METHOD_NOT_ALLOWED: {
        tr: 'Bu metot bu kaynak için desteklenmiyor.',
        en: 'Method not allowed.',
    },
    NOT_ACCEPTABLE: {
        tr: 'İstek kabul edilemez.',
        en: 'Not acceptable.',
    },
    REQUEST_TIMEOUT: {
        tr: 'İstek zaman aşımına uğradı.',
        en: 'Request timeout.',
    },
    CONFLICT: {
        tr: 'Çakışma hatası.',
        en: 'Conflict.',
    },
    GONE: {
        tr: 'Kaynak silinmiş veya mevcut değil.',
        en: 'Gone.',
    },
    LENGTH_REQUIRED: {
        tr: 'İstek için içerik uzunluğu belirtilmelidir.',
        en: 'Length required.',
    },
    PRECONDITION_FAILED: {
        tr: 'Önkoşul başarısız.',
        en: 'Precondition failed.',
    },
    PAYLOAD_TOO_LARGE: {
        tr: 'İstek boyutu çok büyük.',
        en: 'Payload too large.',
    },
    URI_TOO_LONG: {
        tr: 'URI çok uzun.',
        en: 'URI too long.',
    },
    UNSUPPORTED_MEDIA_TYPE: {
        tr: 'Desteklenmeyen medya türü.',
        en: 'Unsupported media type.',
    },
    RANGE_NOT_SATISFIABLE: {
        tr: 'Belirtilen aralık karşılanamıyor.',
        en: 'Range not satisfiable.',
    },
    EXPECTATION_FAILED: {
        tr: 'Beklenti karşılanamadı.',
        en: 'Expectation failed.',
    },
    TEAPOT: {
        tr: 'Ben bir çaydanlığım.',
        en: "I'm a teapot.",
    },
    UNPROCESSABLE_ENTITY: {
        tr: 'İşlenemeyen varlık.',
        en: 'Unprocessable entity.',
    },
    TOO_MANY_REQUESTS: {
        tr: 'Çok fazla istek gönderdiniz.',
        en: 'Too many requests.',
    },
    INTERNAL_SERVER_ERROR_DATABASE: {
        tr: 'Veritabanı hatası.',
        en: 'Database error.',
    },
    // Doğrulama hataları
    VALIDATION_ERROR: {
        tr: 'Doğrulama hatası.',
        en: 'Validation error.',
    },
    INVALID_INPUT: {
        tr: 'Geçersiz giriş.',
        en: 'Invalid input.',
    },
    // İş mantığı hataları
    BUSINESS_ERROR: {
        tr: 'İş mantığı hatası.',
        en: 'Business logic error.',
    },
    INSUFFICIENT_PERMISSIONS: {
        tr: 'Yetersiz yetki.',
        en: 'Insufficient permissions.',
    },
    RESOURCE_NOT_AVAILABLE: {
        tr: 'Kaynak mevcut değil.',
        en: 'Resource not available.',
    },
    USERNAME_ALREADY_EXISTS: {
        tr: 'Bu kullanıcı adı zaten kullanılmaktadır.',
        en: 'This username is already in use.',
    },
    EMAIL_ALREADY_EXISTS: {
        tr: 'Bu e-posta adresi zaten kullanılmaktadır.',
        en: 'This email address is already in use.',
    },
    // Güvenlik hataları
    SECURITY_ERROR: {
        tr: 'Güvenlik hatası.',
        en: 'Security error.',
    },
    INVALID_CREDENTIALS: {
        tr: 'Geçersiz kimlik bilgileri.',
        en: 'Invalid credentials.',
    },
    ACCESS_DENIED: {
        tr: 'Erişim reddedildi.',
        en: 'Access denied.',
    },
    // Teknik hatalar
    TECHNICAL_ERROR: {
        tr: 'Teknik hata.',
        en: 'Technical error.',
    },
    DATABASE_CONNECTION_ERROR: {
        tr: 'Veritabanı bağlantı hatası.',
        en: 'Database connection error.',
    },
    EXTERNAL_SERVICE_UNAVAILABLE: {
        tr: 'Harici servis kullanılamıyor.',
        en: 'External service unavailable.',
    },
};
//# sourceMappingURL=errorMessages.js.map