/**
 * @file src/error/constants/errorMessages.ts
 * @description Merkezi hata mesajları deposu (Türkçe).
 */

/**
 * Hata mesajları.
 * @enum {string}
 */
interface ErrorMessage {
  tr: string;
  en: string;
}

export const ErrorMessage = {
  // Genel hatalar
  GENERIC_ERROR: {
    tr: 'Beklenmedik bir hata oluştu.',
    en: 'An unexpected error occurred.',
  } as ErrorMessage,
  INTERNAL_SERVER_ERROR: {
    tr: 'Sunucu hatası.',
    en: 'Internal server error.',
  } as ErrorMessage,
  BAD_REQUEST: {
    tr: 'Geçersiz istek.',
    en: 'Bad request.',
  } as ErrorMessage,
  UNAUTHORIZED: {
    tr: 'Yetkisiz erişim.',
    en: 'Unauthorized.',
  } as ErrorMessage,
  FORBIDDEN: {
    tr: 'Bu kaynağa erişim izniniz yok.',
    en: 'Forbidden.',
  } as ErrorMessage,
  NOT_FOUND: {
    tr: 'Kaynak bulunamadı.',
    en: 'Not found.',
  } as ErrorMessage,
  METHOD_NOT_ALLOWED: {
    tr: 'Bu metot bu kaynak için desteklenmiyor.',
    en: 'Method not allowed.',
  } as ErrorMessage,
  NOT_ACCEPTABLE: {
    tr: 'İstek kabul edilemez.',
    en: 'Not acceptable.',
  } as ErrorMessage,
  REQUEST_TIMEOUT: {
    tr: 'İstek zaman aşımına uğradı.',
    en: 'Request timeout.',
  } as ErrorMessage,
  CONFLICT: {
    tr: 'Çakışma hatası.',
    en: 'Conflict.',
  } as ErrorMessage,
  GONE: {
    tr: 'Kaynak silinmiş veya mevcut değil.',
    en: 'Gone.',
  } as ErrorMessage,
  LENGTH_REQUIRED: {
    tr: 'İstek için içerik uzunluğu belirtilmelidir.',
    en: 'Length required.',
  } as ErrorMessage,
  PRECONDITION_FAILED: {
    tr: 'Önkoşul başarısız.',
    en: 'Precondition failed.',
  } as ErrorMessage,
  PAYLOAD_TOO_LARGE: {
    tr: 'İstek boyutu çok büyük.',
    en: 'Payload too large.',
  } as ErrorMessage,
  URI_TOO_LONG: {
    tr: 'URI çok uzun.',
    en: 'URI too long.',
  } as ErrorMessage,
  UNSUPPORTED_MEDIA_TYPE: {
    tr: 'Desteklenmeyen medya türü.',
    en: 'Unsupported media type.',
  } as ErrorMessage,
  RANGE_NOT_SATISFIABLE: {
    tr: 'Belirtilen aralık karşılanamıyor.',
    en: 'Range not satisfiable.',
  } as ErrorMessage,
  EXPECTATION_FAILED: {
    tr: 'Beklenti karşılanamadı.',
    en: 'Expectation failed.',
  } as ErrorMessage,
  TEAPOT: {
    tr: 'Ben bir çaydanlığım.',
    en: "I'm a teapot.",
  } as ErrorMessage,
  UNPROCESSABLE_ENTITY: {
    tr: 'İşlenemeyen varlık.',
    en: 'Unprocessable entity.',
  } as ErrorMessage,
  TOO_MANY_REQUESTS: {
    tr: 'Çok fazla istek gönderdiniz.',
    en: 'Too many requests.',
  } as ErrorMessage,
  INTERNAL_SERVER_ERROR_DATABASE: {
    tr: 'Veritabanı hatası.',
    en: 'Database error.',
  } as ErrorMessage,

  // Doğrulama hataları
  VALIDATION_ERROR: {
    tr: 'Doğrulama hatası.',
    en: 'Validation error.',
  } as ErrorMessage,
  INVALID_INPUT: {
    tr: 'Geçersiz giriş.',
    en: 'Invalid input.',
  } as ErrorMessage,

  // İş mantığı hataları
  BUSINESS_ERROR: {
    tr: 'İş mantığı hatası.',
    en: 'Business logic error.',
  } as ErrorMessage,
  INSUFFICIENT_PERMISSIONS: {
    tr: 'Yetersiz yetki.',
    en: 'Insufficient permissions.',
  } as ErrorMessage,
  RESOURCE_NOT_AVAILABLE: {
    tr: 'Kaynak mevcut değil.',
    en: 'Resource not available.',
  } as ErrorMessage,

  // Güvenlik hataları
  SECURITY_ERROR: {
    tr: 'Güvenlik hatası.',
    en: 'Security error.',
  } as ErrorMessage,
  INVALID_CREDENTIALS: {
    tr: 'Geçersiz kimlik bilgileri.',
    en: 'Invalid credentials.',
  } as ErrorMessage,
  ACCESS_DENIED: {
    tr: 'Erişim reddedildi.',
    en: 'Access denied.',
  } as ErrorMessage,

  // Teknik hatalar
  TECHNICAL_ERROR: {
    tr: 'Teknik hata.',
    en: 'Technical error.',
  } as ErrorMessage,
  DATABASE_CONNECTION_ERROR: {
    tr: 'Veritabanı bağlantı hatası.',
    en: 'Database connection error.',
  } as ErrorMessage,
  EXTERNAL_SERVICE_UNAVAILABLE: {
    tr: 'Harici servis kullanılamıyor.',
    en: 'External service unavailable.',
  } as ErrorMessage,
}