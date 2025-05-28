"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const BaseError_1 = require("../error/models/BaseError");
const ValidationError_1 = require("../error/models/ValidationError");
const SecurityError_1 = require("../error/models/SecurityError");
const errorCodes_1 = require("../error/constants/errorCodes");
const httpStatusCodes_1 = require("../error/constants/httpStatusCodes");
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const ErrorLogService_1 = require("../error/services/ErrorLogService");
const notFoundHandler = (req, res, next) => {
    const err = new BaseError_1.BaseError(errorCodes_1.ErrorCode.NOT_FOUND, `${req.originalUrl} yolu bulunamadı`, 'error', httpStatusCodes_1.HttpStatusCode.NOT_FOUND);
    next(err);
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = async (err, req, res, next) => {
    const errorLogService = new ErrorLogService_1.ErrorLogService();
    if (!(err instanceof BaseError_1.BaseError)) {
        await errorLogService.logError(err, req);
    }
    let message = 'Internal Server Error';
    let errorDetails = undefined;
    if (err instanceof ValidationError_1.ValidationError) {
        message = err.message;
        errorDetails = {
            code: err.errorCode,
            details: err.details,
        };
    }
    else if (err instanceof SecurityError_1.SecurityError || err instanceof BaseError_1.BaseError) {
        message = err.message;
        errorDetails = { code: err.errorCode };
    }
    if (process.env.NODE_ENV === 'production') {
        message = 'Internal Server Error';
        errorDetails = undefined;
    }
    const statusCode = err instanceof BaseError_1.BaseError ? err.statusCode : httpStatusCodes_1.HttpStatusCode.INTERNAL_SERVER_ERROR;
    return apiResponse_1.default.error(res, message, statusCode, errorDetails);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map