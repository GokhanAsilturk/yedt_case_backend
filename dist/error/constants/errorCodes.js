"use strict";
/**
 * @file src/error/constants/errorCodes.ts
 * @description Standart hata kodları için sabitler.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
/**
 * Hata kodları.
 * @enum {string}
 */
var ErrorCode;
(function (ErrorCode) {
    // Genel hatalar
    ErrorCode["GENERIC_ERROR"] = "GENERIC_ERROR";
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["METHOD_NOT_ALLOWED"] = "METHOD_NOT_ALLOWED";
    ErrorCode["NOT_ACCEPTABLE"] = "NOT_ACCEPTABLE";
    ErrorCode["REQUEST_TIMEOUT"] = "REQUEST_TIMEOUT";
    ErrorCode["CONFLICT"] = "CONFLICT";
    ErrorCode["GONE"] = "GONE";
    ErrorCode["LENGTH_REQUIRED"] = "LENGTH_REQUIRED";
    ErrorCode["PRECONDITION_FAILED"] = "PRECONDITION_FAILED";
    ErrorCode["PAYLOAD_TOO_LARGE"] = "PAYLOAD_TOO_LARGE";
    ErrorCode["URI_TOO_LONG"] = "URI_TOO_LONG";
    ErrorCode["UNSUPPORTED_MEDIA_TYPE"] = "UNSUPPORTED_MEDIA_TYPE";
    ErrorCode["RANGE_NOT_SATISFIABLE"] = "RANGE_NOT_SATISFIABLE";
    ErrorCode["EXPECTATION_FAILED"] = "EXPECTATION_FAILED";
    ErrorCode["TEAPOT"] = "TEAPOT";
    ErrorCode["UNPROCESSABLE_ENTITY"] = "UNPROCESSABLE_ENTITY";
    ErrorCode["TOO_MANY_REQUESTS"] = "TOO_MANY_REQUESTS";
    ErrorCode["INTERNAL_SERVER_ERROR_DATABASE"] = "INTERNAL_SERVER_ERROR_DATABASE";
    // Doğrulama hataları
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    // İş mantığı hataları
    ErrorCode["BUSINESS_ERROR"] = "BUSINESS_ERROR";
    ErrorCode["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
    ErrorCode["RESOURCE_NOT_AVAILABLE"] = "RESOURCE_NOT_AVAILABLE";
    // Güvenlik hataları
    ErrorCode["SECURITY_ERROR"] = "SECURITY_ERROR";
    ErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ErrorCode["ACCESS_DENIED"] = "ACCESS_DENIED";
    // Teknik hatalar
    ErrorCode["TECHNICAL_ERROR"] = "TECHNICAL_ERROR";
    ErrorCode["DATABASE_CONNECTION_ERROR"] = "DATABASE_CONNECTION_ERROR";
    ErrorCode["EXTERNAL_SERVICE_UNAVAILABLE"] = "EXTERNAL_SERVICE_UNAVAILABLE";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
//# sourceMappingURL=errorCodes.js.map