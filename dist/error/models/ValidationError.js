"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const BaseError_1 = require("./BaseError");
const errorCodes_1 = require("../constants/errorCodes");
const httpStatusCodes_1 = require("../constants/httpStatusCodes");
class ValidationError extends BaseError_1.BaseError {
    constructor(message, details, metadata, context) {
        super(errorCodes_1.ErrorCode.VALIDATION_ERROR, message, 'error', httpStatusCodes_1.HttpStatusCode.BAD_REQUEST, metadata, context);
        this.details = details;
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=ValidationError.js.map