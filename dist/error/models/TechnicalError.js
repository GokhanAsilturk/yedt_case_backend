"use strict";
/**
 * @file src/error/models/TechnicalError.ts
 * @description Teknik hatalar sınıfı.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicalError = void 0;
const BaseError_1 = require("./BaseError");
const errorCodes_1 = require("../constants/errorCodes");
/**
 * Teknik hata sınıfı.
 * @class
 * @extends {BaseError}
 */
class TechnicalError extends BaseError_1.BaseError {
    /**
     * TechnicalError sınıfının constructor'ı.
     * @param {string} message Hata mesajı.
     * @param {ErrorMetadata} metadata Hata metadata'sı.
     * @param {ErrorContext} context Hata context'i.
     * @param {string} i18nKey Uluslararasılaştırma anahtarı.
     */
    constructor(message, metadata, context, i18nKey) {
        super(errorCodes_1.ErrorCode.TECHNICAL_ERROR, message, 'error', metadata, context);
        this.name = 'TechnicalError';
    }
}
exports.TechnicalError = TechnicalError;
//# sourceMappingURL=TechnicalError.js.map