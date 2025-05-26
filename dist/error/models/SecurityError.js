"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityError = void 0;
const BaseError_1 = require("./BaseError");
const errorCodes_1 = require("../constants/errorCodes");
const httpStatusCodes_1 = require("../constants/httpStatusCodes");
class SecurityError extends BaseError_1.BaseError {
    constructor(message, metadata, context) {
        super(errorCodes_1.ErrorCode.SECURITY_ERROR, message, 'error', httpStatusCodes_1.HttpStatusCode.FORBIDDEN, metadata, context);
    }
}
exports.SecurityError = SecurityError;
//# sourceMappingURL=SecurityError.js.map