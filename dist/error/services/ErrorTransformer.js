"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorTransformer = void 0;
const BaseError_1 = require("../models/BaseError");
const errorCodes_1 = require("../constants/errorCodes");
class ErrorTransformer {
    transform(err) {
        var _a;
        // Burada hataları dönüştürme mantığı yer alacak.
        // Örneğin, farklı hata türlerini BaseError'a dönüştürebilirsiniz.
        // Şimdilik, tüm hataları genel bir hata olarak ele alalım.
        return new BaseError_1.BaseError(errorCodes_1.ErrorCode.INTERNAL_SERVER_ERROR, (_a = err.message) !== null && _a !== void 0 ? _a : 'Internal Server Error', 'critical', 500);
    }
}
exports.ErrorTransformer = ErrorTransformer;
//# sourceMappingURL=ErrorTransformer.js.map