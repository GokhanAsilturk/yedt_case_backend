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
const sequelize_1 = require("sequelize");
const User_1 = __importDefault(require("../models/User"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthController {
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User_1.default.findOne({ where: { username } });
            if (!user) {
                throw new errorHandler_1.AppError('Geçersiz kullanıcı adı veya şifre', 401, errorHandler_1.ErrorCode.UNAUTHORIZED);
            }
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                throw new errorHandler_1.AppError('Geçersiz kullanıcı adı veya şifre', 401, errorHandler_1.ErrorCode.UNAUTHORIZED);
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
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    }
    static async RegisterAdmin(req, res) {
        try {
            const { username, email, password } = req.body;
            // Check if user already exists
            const existingUser = await User_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [{ username }, { email }]
                }
            });
            if (existingUser) {
                apiResponse_1.default.error(res, 'Username or email already exists', 400);
                return;
            }
            // Create admin user
            const user = await User_1.default.create({
                username,
                email,
                password,
                role: 'admin' // Always create as admin
            });
            // Hassas kullanıcı bilgilerini çıkar
            const safeUser = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            const { accessToken, refreshToken } = (0, jwt_1.generateTokenPair)(user);
            apiResponse_1.default.success(res, { user: safeUser, accessToken, refreshToken }, 'Yönetici kullanıcı başarıyla kaydedildi', 201);
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    }
    /**
     * Refresh token kullanarak yeni bir access token oluşturur
     */
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                throw new errorHandler_1.AppError('Refresh token gerekli', 400, errorHandler_1.ErrorCode.BAD_REQUEST);
            }
            const newAccessToken = await Promise.resolve().then(() => __importStar(require('../utils/jwt'))).then(m => m.refreshAccessToken(refreshToken));
            if (!newAccessToken) {
                throw new errorHandler_1.AppError('Geçersiz veya süresi dolmuş refresh token', 401, errorHandler_1.ErrorCode.UNAUTHORIZED);
            }
            apiResponse_1.default.success(res, { accessToken: newAccessToken });
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else if (error instanceof Error) {
                apiResponse_1.default.error(res, error.message, 500);
            }
            else {
                apiResponse_1.default.error(res, 'Token yenileme sırasında bir hata oluştu', 500);
            }
        }
    }
    /**
     * Kullanıcı çıkışını yapar ve tokenları geçersiz kılar
     */
    static async logout(req, res) {
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
            if (error instanceof errorHandler_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else if (error instanceof Error) {
                apiResponse_1.default.error(res, error.message, 500);
            }
            else {
                apiResponse_1.default.error(res, 'Çıkış yapılırken bir hata oluştu', 500);
            }
        }
    }
}
exports.default = AuthController;
//# sourceMappingURL=authController.js.map