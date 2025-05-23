"use strict";
/**
 * @file src/error/models/ValidationError.ts
 * @description Doğrulama hataları sınıfı.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const BaseError_1 = require("./BaseError");
const errorCodes_1 = require("../constants/errorCodes");
/**
 * Doğrulama hatası sınıfı.
 * @class
 * @extends {BaseError}
 */
class ValidationError extends BaseError_1.BaseError {
    /**
     * ValidationError sınıfının constructor'ı.
     * @param {string} message Hata mesajı.
     * @param {ErrorMetadata} metadata Hata metadata'sı.
     * @param {ErrorContext} context Hata context'i.
     * @param {string} i18nKey Uluslararasılaştırma anahtarı.
     */
    constructor(message, metadata, context, i18nKey) {
        super(errorCodes_1.ErrorCode.VALIDATION_ERROR, message, 'warning', metadata, context);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=ValidationError.js.map