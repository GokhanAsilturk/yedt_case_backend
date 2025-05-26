"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLogService = void 0;
const ErrorLog_1 = __importDefault(require("../models/ErrorLog"));
class ErrorLogService {
    async logError(error, req) {
        var _a;
        const logEntry = {
            errorCode: error.errorCode,
            message: error.message,
            stackTrace: (_a = error.stack) !== null && _a !== void 0 ? _a : '',
            severity: error.severity,
            metadata: error.metadata || {},
            timestamp: new Date(),
            url: req.url,
            method: req.method,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
        };
        try {
            await ErrorLog_1.default.create(logEntry);
            console.log('Hata başarıyla loglandı.');
        }
        catch (dbError) {
            console.error('Hata veritabanına kaydedilirken bir hata oluştu:', dbError);
        }
    }
    async getPaginatedLogs(options) {
        const { limit, offset } = options;
        const { count, rows } = await ErrorLog_1.default.findAndCountAll({
            order: [['timestamp', 'DESC']],
            limit,
            offset,
        });
        return {
            rows,
            count,
        };
    }
}
exports.ErrorLogService = ErrorLogService;
//# sourceMappingURL=ErrorLogService.js.map