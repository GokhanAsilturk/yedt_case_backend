"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const errorCodes_1 = require("./constants/errorCodes");
const BaseError_1 = require("./models/BaseError");
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
class ErrorHandler {
    constructor() { }
    static getInstance() {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }
    handleError(err, req, res, next) {
        let error;
        if (err instanceof BaseError_1.BaseError) {
            error = err;
        }
        else {
            console.error('KRİTİK HATA:', err);
            error = new BaseError_1.BaseError(errorCodes_1.ErrorCode.INTERNAL_SERVER_ERROR, err.message || 'Internal Server Error', 'error');
        }
        this.sendErrorResponse(error, req, res);
    }
    sendErrorResponse(error, req, res) {
        apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map