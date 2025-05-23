"use strict";
/**
 * @file src/error/models/BusinessError.ts
 * @description İş mantığı hataları sınıfı.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessError = void 0;
const BaseError_1 = require("./BaseError");
const errorCodes_1 = require("../constants/errorCodes");
/**
 * İş mantığı hatası sınıfı.
 * @class
 * @extends {BaseError}
 */
class BusinessError extends BaseError_1.BaseError {
    /**
     * BusinessError sınıfının constructor'ı.
     * @param {string} message Hata mesajı.
     * @param {ErrorMetadata} metadata Hata metadata'sı.
     * @param {ErrorContext} context Hata context'i.
     * @param {string} i18nKey Uluslararasılaştırma anahtarı.
     */
    constructor(message, metadata, context, i18nKey) {
        super(errorCodes_1.ErrorCode.BUSINESS_ERROR, message, 'warning', metadata, context);
        this.name = 'BusinessError';
    }
}
exports.BusinessError = BusinessError;
//# sourceMappingURL=BusinessError.js.map