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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateToken = exports.refreshAccessToken = exports.verifyToken = exports.generateTokenPair = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
// JWT yapılandırması
const JWT_SECRET = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : 'asdasdasdas';
const JWT_EXPIRES_IN = (_b = process.env.JWT_EXPIRES_IN) !== null && _b !== void 0 ? _b : '1h';
const JWT_REFRESH_EXPIRES_IN = (_c = process.env.JWT_REFRESH_EXPIRES_IN) !== null && _c !== void 0 ? _c : '7d';
// Blacklist - geçersiz tokenlar için, gerçek uygulamada Redis veya DB kullanılmalı.
const invalidatedTokens = new Set();
/**
 * Kullanıcı için access token oluşturur
 * @param user Kullanıcı objesi
 * @returns JWT access token
 */
const generateAccessToken = (user) => {
    var _a;
    const jwtid = crypto_1.default.randomUUID();
    const payload = {
        id: user.id,
        role: user.role,
        tokenVersion: (_a = user.tokenVersion) !== null && _a !== void 0 ? _a : 0,
        jti: jwtid
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
        algorithm: 'HS256',
        audience: 'yedt-eğitim-sistemi',
        issuer: 'yedt-backend-api'
    });
};
exports.generateAccessToken = generateAccessToken;
/**
 * Kullanıcı için refresh token oluşturur
 * @param user Kullanıcı objesi
 * @returns JWT refresh token
 */
const generateRefreshToken = (user) => {
    var _a;
    const jwtid = crypto_1.default.randomUUID();
    const payload = {
        id: user.id,
        role: user.role,
        tokenVersion: (_a = user.tokenVersion) !== null && _a !== void 0 ? _a : 0,
        jti: jwtid
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        algorithm: 'HS256',
        audience: 'yedt-eğitim-sistemi',
        issuer: 'yedt-backend-api'
    });
};
exports.generateRefreshToken = generateRefreshToken;
/**
 * Token çiftini oluşturur (access ve refresh token)
 * @param user Kullanıcı objesi
 * @returns Oluşturulan token çifti
 */
const generateTokenPair = (user) => {
    return {
        accessToken: (0, exports.generateAccessToken)(user),
        refreshToken: (0, exports.generateRefreshToken)(user)
    };
};
exports.generateTokenPair = generateTokenPair;
/**
 * JWT token'ını doğrular
 * @param token JWT token
 * @returns Çözümlenmiş token yükü
 */
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET, {
            algorithms: ['HS256'], // Sadece bu algoritma ile imzalanmış tokenları kabul et
            audience: 'yedt-eğitim-sistemi',
            issuer: 'yedt-backend-api',
            complete: true // Header, payload ve signature dahil tam token bilgisini al
        });
        // Token blacklist'te mi kontrol et
        if (decoded.jti && invalidatedTokens.has(decoded.jti)) {
            throw new Error('Token has been invalidated');
        }
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Invalid token signature');
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Token has expired');
        }
        else if (error instanceof jsonwebtoken_1.default.NotBeforeError) {
            throw new Error('Token not yet valid');
        }
        else {
            throw new Error('Token verification failed');
        }
    }
};
exports.verifyToken = verifyToken;
/**
 * Refresh token'dan yeni bir access token oluşturur
 * @param refreshToken Refresh token
 * @returns Yeni access token veya null (geçersiz refresh token durumunda)
 */
const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = (0, exports.verifyToken)(refreshToken);
        // Kullanıcı kimliğini doğrula
        const user = await Promise.resolve().then(() => __importStar(require('../models/User'))).then(m => m.default.findByPk(decoded.id));
        if (!user) {
            return null;
        }
        // Token sürümünü kontrol et (kullanıcı çıkış yaptığında değişir)
        if (decoded.tokenVersion !== user.tokenVersion) {
            return null;
        }
        // Yeni access token oluştur
        return (0, exports.generateAccessToken)(user);
    }
    catch (error) {
        console.error('Token refresh failed:', error);
        return null;
    }
};
exports.refreshAccessToken = refreshAccessToken;
/**
 * Token'ı geçersiz kılar (blacklist'e ekler)
 * @param token JWT token
 */
const invalidateToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.decode(token, { complete: true });
        if (decoded === null || decoded === void 0 ? void 0 : decoded.payload.jti) {
            invalidatedTokens.add(decoded.payload.jti);
        }
    }
    catch (error) {
        // Token decode edilemezse hata fırlatma, sadece ignore et
        console.error('Token invalidation failed:', error);
    }
};
exports.invalidateToken = invalidateToken;
//# sourceMappingURL=jwt.js.map