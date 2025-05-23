"use strict";
/**
 * @file src/error/constants/errorMessages.ts
 * @description Merkezi hata mesajları deposu (Türkçe).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessage = void 0;
/**
 * Hata mesajları.
 * @enum {string}
 */
var ErrorMessage;
(function (ErrorMessage) {
    // Genel hatalar
    ErrorMessage["GENERIC_ERROR"] = "Beklenmedik bir hata olu\u015Ftu.";
    ErrorMessage["INTERNAL_SERVER_ERROR"] = "Sunucu hatas\u0131.";
    ErrorMessage["BAD_REQUEST"] = "Ge\u00E7ersiz istek.";
    ErrorMessage["UNAUTHORIZED"] = "Yetkisiz eri\u015Fim.";
    ErrorMessage["FORBIDDEN"] = "Bu kayna\u011Fa eri\u015Fim izniniz yok.";
    ErrorMessage["NOT_FOUND"] = "Kaynak bulunamad\u0131.";
    ErrorMessage["METHOD_NOT_ALLOWED"] = "Bu metot bu kaynak i\u00E7in desteklenmiyor.";
    ErrorMessage["NOT_ACCEPTABLE"] = "\u0130stek kabul edilemez.";
    ErrorMessage["REQUEST_TIMEOUT"] = "\u0130stek zaman a\u015F\u0131m\u0131na u\u011Frad\u0131.";
    ErrorMessage["CONFLICT"] = "\u00C7ak\u0131\u015Fma hatas\u0131.";
    ErrorMessage["GONE"] = "Kaynak silinmi\u015F veya mevcut de\u011Fil.";
    ErrorMessage["LENGTH_REQUIRED"] = "\u0130stek i\u00E7in i\u00E7erik uzunlu\u011Fu belirtilmelidir.";
    ErrorMessage["PRECONDITION_FAILED"] = "\u00D6nko\u015Ful ba\u015Far\u0131s\u0131z.";
    ErrorMessage["PAYLOAD_TOO_LARGE"] = "\u0130stek boyutu \u00E7ok b\u00FCy\u00FCk.";
    ErrorMessage["URI_TOO_LONG"] = "URI \u00E7ok uzun.";
    ErrorMessage["UNSUPPORTED_MEDIA_TYPE"] = "Desteklenmeyen medya t\u00FCr\u00FC.";
    ErrorMessage["RANGE_NOT_SATISFIABLE"] = "Belirtilen aral\u0131k kar\u015F\u0131lanam\u0131yor.";
    ErrorMessage["EXPECTATION_FAILED"] = "Beklenti kar\u015F\u0131lanamad\u0131.";
    ErrorMessage["TEAPOT"] = "Ben bir \u00E7aydanl\u0131\u011F\u0131m.";
    ErrorMessage["UNPROCESSABLE_ENTITY"] = "\u0130\u015Flenemeyen varl\u0131k.";
    ErrorMessage["TOO_MANY_REQUESTS"] = "\u00C7ok fazla istek g\u00F6nderdiniz.";
    ErrorMessage["INTERNAL_SERVER_ERROR_DATABASE"] = "Veritaban\u0131 hatas\u0131.";
    // Doğrulama hataları
    ErrorMessage["VALIDATION_ERROR"] = "Do\u011Frulama hatas\u0131.";
    ErrorMessage["INVALID_INPUT"] = "Ge\u00E7ersiz giri\u015F.";
    // İş mantığı hataları
    ErrorMessage["BUSINESS_ERROR"] = "\u0130\u015F mant\u0131\u011F\u0131 hatas\u0131.";
    ErrorMessage["INSUFFICIENT_PERMISSIONS"] = "Yetersiz yetki.";
    ErrorMessage["RESOURCE_NOT_AVAILABLE"] = "Kaynak mevcut de\u011Fil.";
    // Güvenlik hataları
    ErrorMessage["SECURITY_ERROR"] = "G\u00FCvenlik hatas\u0131.";
    ErrorMessage["INVALID_CREDENTIALS"] = "Ge\u00E7ersiz kimlik bilgileri.";
    ErrorMessage["ACCESS_DENIED"] = "Eri\u015Fim reddedildi.";
    // Teknik hatalar
    ErrorMessage["TECHNICAL_ERROR"] = "Teknik hata.";
    ErrorMessage["DATABASE_CONNECTION_ERROR"] = "Veritaban\u0131 ba\u011Flant\u0131 hatas\u0131.";
    ErrorMessage["EXTERNAL_SERVICE_UNAVAILABLE"] = "Harici servis kullan\u0131lam\u0131yor.";
})(ErrorMessage || (exports.ErrorMessage = ErrorMessage = {}));
//# sourceMappingURL=errorMessages.js.map