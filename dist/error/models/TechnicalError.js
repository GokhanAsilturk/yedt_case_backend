"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicalError = void 0;
const BaseError_1 = require("./BaseError");
const errorCodes_1 = require("../constants/errorCodes");
const httpStatusCodes_1 = require("../constants/httpStatusCodes");
class TechnicalError extends BaseError_1.BaseError {
    constructor(message, metadata, context) {
        super(errorCodes_1.ErrorCode.TECHNICAL_ERROR, message, 'error', httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR, metadata, context);
    }
}
exports.TechnicalError = TechnicalError;
//# sourceMappingURL=TechnicalError.js.map