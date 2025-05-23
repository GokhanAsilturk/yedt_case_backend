"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLogService = void 0;
const uuid_1 = require("uuid");
const ErrorLog_1 = __importDefault(require("../models/ErrorLog"));
const ErrorTransformer_1 = require("./ErrorTransformer");
class ErrorLogService {
    constructor() { }
    static getInstance() {
        if (!ErrorLogService.instance) {
            ErrorLogService.instance = new ErrorLogService();
        }
        return ErrorLogService.instance;
    }
    async log(options) {
        try {
            const { severity, error, message, metadata, req, userId } = options;
            const stackTrace = (error === null || error === void 0 ? void 0 : error.stack) || '';
            const requestId = (req === null || req === void 0 ? void 0 : req.headers['x-request-id']) || (0, uuid_1.v4)();
            const userAgent = req === null || req === void 0 ? void 0 : req.headers['user-agent'];
            const ip = req === null || req === void 0 ? void 0 : req.ip;
            const url = req === null || req === void 0 ? void 0 : req.originalUrl;
            const method = req === null || req === void 0 ? void 0 : req.method;
            const sanitizedMetadata = (0, ErrorTransformer_1.sanitize)(metadata || {});
            await ErrorLog_1.default.create({
                errorCode: (error === null || error === void 0 ? void 0 : error.name) || 'UNKNOWN_ERROR',
                message,
                stackTrace,
                severity,
                metadata: sanitizedMetadata,
                userId,
                requestId,
                timestamp: new Date(),
                userAgent,
                ip,
                url,
                method,
            });
        }
        catch (dbError) {
            console.error('Error logging to database:', dbError);
            // Loglama hatası durumunda ek bir işlem yapılabilir (örn. dosya loglama)
        }
    }
    async logInfo(options) {
        await this.log({ ...options, severity: 'info' });
    }
    async logWarning(options) {
        await this.log({ ...options, severity: 'warning' });
    }
    async logError(options) {
        await this.log({ ...options, severity: 'error' });
    }
    async logCritical(options) {
        await this.log({ ...options, severity: 'critical' });
    }
}
exports.ErrorLogService = ErrorLogService;
//# sourceMappingURL=ErrorLogService.js.map