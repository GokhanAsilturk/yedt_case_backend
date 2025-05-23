"use strict";
/**
 * @file src/error/models/BaseError.ts
 * @description Temel hata sınıfı.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = void 0;
class BaseError extends Error {
    constructor(errorCode, message, severity, metadata, context) {
        super(message);
        this.errorCode = errorCode;
        this.message = message;
        this.severity = severity;
        this.metadata = metadata;
        this.context = context;
        Object.setPrototypeOf(this, BaseError.prototype);
    }
}
exports.BaseError = BaseError;
//# sourceMappingURL=BaseError.js.map