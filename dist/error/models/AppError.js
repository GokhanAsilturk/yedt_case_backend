"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const BaseError_1 = require("./BaseError");
class AppError extends BaseError_1.BaseError {
    constructor(message, statusCode, errorCode, isOperational = true) {
        super(errorCode, message, 'error', statusCode);
        this.isOperational = isOperational;
    }
}
exports.AppError = AppError;
//# sourceMappingURL=AppError.js.map