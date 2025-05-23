"use strict";
/**
 * @file src/error/models/SecurityError.ts
 * @description Güvenlik hataları sınıfı.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityError = void 0;
const BaseError_1 = require("./BaseError");
const errorCodes_1 = require("../constants/errorCodes");
/**
 * Güvenlik hatası sınıfı.
 * @class
 * @extends {BaseError}
 */
class SecurityError extends BaseError_1.BaseError {
    /**
     * SecurityError sınıfının constructor'ı.
     * @param {string} message Hata mesajı.
     * @param {ErrorMetadata} metadata Hata metadata'sı.
     * @param {ErrorContext} context Hata context'i.
     * @param {string} i18nKey Uluslararasılaştırma anahtarı.
     */
    constructor(message, metadata, context, i18nKey) {
        super(errorCodes_1.ErrorCode.SECURITY_ERROR, message, 'error', metadata, context);
        this.name = 'SecurityError';
    }
}
exports.SecurityError = SecurityError;
//# sourceMappingURL=SecurityError.js.map