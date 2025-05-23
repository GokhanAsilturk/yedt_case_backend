"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.AppError = exports.ErrorCode = void 0;
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
// Standart hata kodları
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["BAD_REQUEST"] = "BAD_REQUEST";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["INTERNAL_SERVER"] = "INTERNAL_SERVER";
    ErrorCode["DATABASE_ERROR"] = "DATABASE_ERROR";
    ErrorCode["TOKEN_EXPIRED"] = "TOKEN_EXPIRED";
    ErrorCode["TOKEN_INVALID"] = "TOKEN_INVALID";
    ErrorCode["GENERIC_ERROR"] = "GENERIC_ERROR";
    ErrorCode["INTERNAL_SERVER_ERROR"] = "INTERNAL_SERVER_ERROR";
    ErrorCode["METHOD_NOT_ALLOWED"] = "METHOD_NOT_ALLOWED";
    ErrorCode["NOT_ACCEPTABLE"] = "NOT_ACCEPTABLE";
    ErrorCode["REQUEST_TIMEOUT"] = "REQUEST_TIMEOUT";
    ErrorCode["CONFLICT"] = "CONFLICT";
    ErrorCode["GONE"] = "GONE";
    ErrorCode["LENGTH_REQUIRED"] = "LENGTH_REQUIRED";
    ErrorCode["PRECONDITION_FAILED"] = "PRECONDITION_FAILED";
    ErrorCode["PAYLOAD_TOO_LARGE"] = "PAYLOAD_TOO_LARGE";
    ErrorCode["URI_TOO_LONG"] = "URI_TOO_LONG";
    ErrorCode["UNSUPPORTED_MEDIA_TYPE"] = "UNSUPPORTED_MEDIA_TYPE";
    ErrorCode["RANGE_NOT_SATISFIABLE"] = "RANGE_NOT_SATISFIABLE";
    ErrorCode["EXPECTATION_FAILED"] = "EXPECTATION_FAILED";
    ErrorCode["TEAPOT"] = "TEAPOT";
    ErrorCode["UNPROCESSABLE_ENTITY"] = "UNPROCESSABLE_ENTITY";
    ErrorCode["TOO_MANY_REQUESTS"] = "TOO_MANY_REQUESTS";
    ErrorCode["INTERNAL_SERVER_ERROR_DATABASE"] = "INTERNAL_SERVER_ERROR_DATABASE";
    ErrorCode["INVALID_INPUT"] = "INVALID_INPUT";
    ErrorCode["BUSINESS_ERROR"] = "BUSINESS_ERROR";
    ErrorCode["INSUFFICIENT_PERMISSIONS"] = "INSUFFICIENT_PERMISSIONS";
    ErrorCode["RESOURCE_NOT_AVAILABLE"] = "RESOURCE_NOT_AVAILABLE";
    ErrorCode["SECURITY_ERROR"] = "SECURITY_ERROR";
    ErrorCode["INVALID_CREDENTIALS"] = "INVALID_CREDENTIALS";
    ErrorCode["ACCESS_DENIED"] = "ACCESS_DENIED";
    ErrorCode["TECHNICAL_ERROR"] = "TECHNICAL_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
// Özel hata sınıfı
class AppError extends Error {
    constructor(message, statusCode, errorCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
// Sequelize hatalarını işlemek için yardımcı fonksiyon
const handleSequelizeError = (err) => {
    if (err.name === 'SequelizeValidationError') {
        return new AppError('Veri doğrulama hatası: ' + err.errors.map((e) => e.message).join(', '), 400, ErrorCode.VALIDATION_ERROR);
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
        return new AppError('Veritabanı benzersizlik hatası: Aynı kayıt zaten mevcut', 400, ErrorCode.VALIDATION_ERROR);
    }
    return new AppError('Veritabanı hatası: ' + err.message, 500, ErrorCode.DATABASE_ERROR);
};
// Geliştirme ortamında detaylı hata, üretim ortamında basit hata
const sendErrorResponse = (err, req, res) => {
    // Operasyonel hatalar güvenle istemciye gönderilebilir
    if (err.isOperational) {
        return apiResponse_1.default.error(res, err.message, err.statusCode, { code: err.errorCode });
    }
    // Operasyonel olmayan hatalar (programlama hataları) için
    // detaylı bilgi vermeden genel bir hata mesajı gönder
    console.error('KRITIK HATA:', err);
    return apiResponse_1.default.error(res, 'Bir şeyler yanlış gitti', 500, { code: ErrorCode.INTERNAL_SERVER });
};
// Global hata yakalama middleware'i
const errorHandler = (err, req, res, next) => {
    var _a;
    let error;
    // Özel hata sınıfımızın bir örneği mi?
    if (err instanceof AppError) {
        error = err;
    }
    // Sequelize hatası mı?
    else if ((_a = err.name) === null || _a === void 0 ? void 0 : _a.startsWith('Sequelize')) {
        error = handleSequelizeError(err);
    }
    // JWT hatası mı?
    else if (err.name === 'JsonWebTokenError') {
        error = new AppError('Geçersiz token', 401, ErrorCode.TOKEN_INVALID);
    }
    else if (err.name === 'TokenExpiredError') {
        error = new AppError('Token süresi doldu', 401, ErrorCode.TOKEN_EXPIRED);
    }
    // Diğer hatalar
    else {
        error = new AppError(err.message || 'Bir şeyler yanlış gitti', 500, ErrorCode.INTERNAL_SERVER, false);
    }
    sendErrorResponse(error, req, res);
};
exports.errorHandler = errorHandler;
// 404 Hatası için middleware
const notFoundHandler = (req, res, next) => {
    const err = new AppError(`${req.originalUrl} yolu bulunamadı`, 404, ErrorCode.NOT_FOUND);
    next(err);
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=errorHandler.js.map