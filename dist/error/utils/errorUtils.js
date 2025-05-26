"use strict";
// Yardımcı fonksiyonlar burada tanımlanacak.
// Örneğin:
// - Hata kodlarını ve mesajlarını yönetme
// - Hata oluşturma fonksiyonları
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = createError;
exports.createValidationError = createValidationError;
exports.createBusinessError = createBusinessError;
exports.createTechnicalError = createTechnicalError;
exports.createSecurityError = createSecurityError;
const BaseError_1 = require("../models/BaseError");
const errorCodes_1 = require("../constants/errorCodes");
const httpStatusCodes_1 = require("../constants/httpStatusCodes");
function createError(errorCode, message, severity, statusCode = 500, metadata, context) {
    return new BaseError_1.BaseError(errorCode, message, severity, statusCode, metadata, context);
}
function createValidationError(message, statusCode = httpStatusCodes_1.HttpStatusCode.BAD_REQUEST, metadata, context) {
    return createError(errorCodes_1.ErrorCode.VALIDATION_ERROR, message, 'warning', statusCode, metadata, context);
}
function createBusinessError(message, statusCode = httpStatusCodes_1.HttpStatusCode.BAD_REQUEST, metadata, context) {
    return createError(errorCodes_1.ErrorCode.BUSINESS_ERROR, message, 'warning', statusCode, metadata, context);
}
function createTechnicalError(message, statusCode = httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR, metadata, context) {
    return createError(errorCodes_1.ErrorCode.TECHNICAL_ERROR, message, 'error', statusCode, metadata, context);
}
function createSecurityError(message, statusCode = httpStatusCodes_1.HttpStatusCode.FORBIDDEN, metadata, context) {
    return createError(errorCodes_1.ErrorCode.SECURITY_ERROR, message, 'error', statusCode, metadata, context);
}
//# sourceMappingURL=errorUtils.js.map