"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("../models/User"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../error/models/AppError");
const errorCodes_1 = require("../error/constants/errorCodes");
const errorMessages_1 = require("../error/constants/errorMessages");
class AuthController {
    static async login(req, res, next) {
        try {
            const { username, password } = req.body;
            const user = await User_1.default.findOne({ where: { username } });
            if (!user) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.INVALID_CREDENTIALS.tr, 401, errorCodes_1.ErrorCode.UNAUTHORIZED);
            }
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.INVALID_CREDENTIALS.tr, 401, errorCodes_1.ErrorCode.UNAUTHORIZED);
            }
            // Access ve refresh token çifti oluştur
            const { accessToken, refreshToken } = (0, jwt_1.generateTokenPair)(user);
            // Hassas kullanıcı bilgilerini çıkar
            const safeUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            apiResponse_1.default.success(res, {
                user: safeUser,
                accessToken,
                refreshToken
            });
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Bir hata oluştu', 500);
            }
        }
    }
    /**
     * Refresh token kullanarak yeni bir access token oluşturur
     */
    static async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.BAD_REQUEST.tr, 400, errorCodes_1.ErrorCode.BAD_REQUEST);
            }
            const newAccessToken = await Promise.resolve().then(() => __importStar(require('../utils/jwt'))).then(m => m.refreshAccessToken(refreshToken));
            if (!newAccessToken) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.UNAUTHORIZED.tr, 401, errorCodes_1.ErrorCode.UNAUTHORIZED);
            }
            apiResponse_1.default.success(res, { accessToken: newAccessToken });
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Token yenileme sırasında bir hata oluştu', 500);
            }
        }
    }
    /**
     * Kullanıcı çıkışını yapar ve tokenları geçersiz kılar
     */
    static async logout(req, res, next) {
        var _a, _b;
        try {
            // Access token'ı geçersiz kıl (eğer varsa)
            const accessToken = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
            if (accessToken) {
                (0, jwt_1.invalidateToken)(accessToken);
            }
            // Refresh token'ı geçersiz kıl (eğer varsa)
            const { refreshToken } = req.body;
            if (refreshToken) {
                (0, jwt_1.invalidateToken)(refreshToken);
            }
            // Kullanıcının token sürümünü artır (varsa)
            if ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) {
                await User_1.default.update({ tokenVersion: User_1.default.sequelize.literal('tokenVersion + 1') }, { where: { id: req.user.id } });
            }
            apiResponse_1.default.success(res, null, 'Başarıyla çıkış yapıldı');
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Çıkış yapılırken bir hata oluştu', 500);
            }
        }
    }
    static async adminLogin(req, res, next) {
        try {
            const { username, password } = req.body;
            const user = await User_1.default.findOne({ where: { username, role: 'admin' } });
            if (!user) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.INVALID_CREDENTIALS.tr, 401, errorCodes_1.ErrorCode.UNAUTHORIZED);
            }
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.INVALID_CREDENTIALS.tr, 401, errorCodes_1.ErrorCode.UNAUTHORIZED);
            }
            const { accessToken, refreshToken } = (0, jwt_1.generateTokenPair)(user);
            const safeUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            apiResponse_1.default.success(res, {
                user: safeUser,
                accessToken,
                refreshToken
            });
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Bir hata oluştu', 500);
            }
        }
    }
    static async studentLogin(req, res, next) {
        try {
            const { username, password } = req.body;
            const user = await User_1.default.findOne({ where: { username, role: 'student' } });
            if (!user) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.INVALID_CREDENTIALS.tr, 401, errorCodes_1.ErrorCode.UNAUTHORIZED);
            }
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.INVALID_CREDENTIALS.tr, 401, errorCodes_1.ErrorCode.UNAUTHORIZED);
            }
            const { accessToken, refreshToken } = (0, jwt_1.generateTokenPair)(user);
            const safeUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            apiResponse_1.default.success(res, {
                user: safeUser,
                accessToken,
                refreshToken
            });
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Bir hata oluştu', 500);
            }
        }
    }
}
exports.default = AuthController;
//# sourceMappingURL=authController.js.map