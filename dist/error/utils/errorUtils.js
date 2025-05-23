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
function createError(errorCode, message, severity, metadata, context) {
    return new BaseError_1.BaseError(errorCode, message, severity, metadata, context);
}
function createValidationError(message, metadata, context) {
    return createError(errorCodes_1.ErrorCode.VALIDATION_ERROR, message, 'warning', metadata, context);
}
function createBusinessError(message, metadata, context) {
    return createError(errorCodes_1.ErrorCode.BUSINESS_ERROR, message, 'warning', metadata, context);
}
function createTechnicalError(message, metadata, context) {
    return createError(errorCodes_1.ErrorCode.TECHNICAL_ERROR, message, 'error', metadata, context);
}
function createSecurityError(message, metadata, context) {
    return createError(errorCodes_1.ErrorCode.SECURITY_ERROR, message, 'error', metadata, context);
}
//# sourceMappingURL=errorUtils.js.map