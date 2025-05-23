"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.requirePermission = exports.auth = exports.hasPermission = exports.Permission = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const errorHandler_1 = require("./errorHandler");
// Uygulama içindeki izinler
var Permission;
(function (Permission) {
    // Kullanıcı izinleri
    Permission["VIEW_USERS"] = "view_users";
    Permission["CREATE_USER"] = "create_user";
    Permission["UPDATE_USER"] = "update_user";
    Permission["DELETE_USER"] = "delete_user";
    // Öğrenci izinleri
    Permission["VIEW_STUDENTS"] = "view_students";
    Permission["CREATE_STUDENT"] = "create_student";
    Permission["UPDATE_STUDENT"] = "update_student";
    Permission["DELETE_STUDENT"] = "delete_student";
    // Kurs izinleri
    Permission["VIEW_COURSES"] = "view_courses";
    Permission["CREATE_COURSE"] = "create_course";
    Permission["UPDATE_COURSE"] = "update_course";
    Permission["DELETE_COURSE"] = "delete_course";
    // Kayıt izinleri
    Permission["VIEW_ENROLLMENTS"] = "view_enrollments";
    Permission["CREATE_ENROLLMENT"] = "create_enrollment";
    Permission["UPDATE_ENROLLMENT"] = "update_enrollment";
    Permission["DELETE_ENROLLMENT"] = "delete_enrollment";
})(Permission || (exports.Permission = Permission = {}));
// Her rol için izinleri tanımla
const rolePermissions = {
    'admin': [
        Permission.VIEW_USERS, Permission.CREATE_USER, Permission.UPDATE_USER, Permission.DELETE_USER,
        Permission.VIEW_STUDENTS, Permission.CREATE_STUDENT, Permission.UPDATE_STUDENT, Permission.DELETE_STUDENT,
        Permission.VIEW_COURSES, Permission.CREATE_COURSE, Permission.UPDATE_COURSE, Permission.DELETE_COURSE,
        Permission.VIEW_ENROLLMENTS, Permission.CREATE_ENROLLMENT, Permission.UPDATE_ENROLLMENT, Permission.DELETE_ENROLLMENT
    ],
    'student': [
        Permission.VIEW_STUDENTS,
        Permission.VIEW_COURSES,
        Permission.VIEW_ENROLLMENTS
    ]
};
/**
 * Kullanıcının rolüne göre belirli izinlere sahip olup olmadığını kontrol eder
 * @param userRole Kullanıcı rolü
 * @param requiredPermission Gereken izin
 * @returns Kullanıcının izne sahip olup olmadığı
 */
const hasPermission = (userRole, requiredPermission) => {
    if (!rolePermissions[userRole]) {
        return false;
    }
    return rolePermissions[userRole].includes(requiredPermission);
};
exports.hasPermission = hasPermission;
/**
 * Kullanıcı kimlik doğrulama middleware'i
 */
const auth = async (req, res, next) => {
    var _a, _b;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            apiResponse_1.default.error(res, 'Authentication required', 401);
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, (_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : 'your-secret-key');
        // Token süresinin dolup dolmadığını kontrol et
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            throw new errorHandler_1.AppError('Token süresi doldu', 401, errorHandler_1.ErrorCode.TOKEN_EXPIRED);
        }
        const user = await User_1.default.findByPk(decoded.id);
        if (!user) {
            apiResponse_1.default.error(res, 'User not found', 401);
            return;
        }
        req.user = user;
        req.token = token;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            apiResponse_1.default.error(res, 'Invalid token', 401);
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            apiResponse_1.default.error(res, 'Token expired', 401);
        }
        else {
            apiResponse_1.default.error(res, 'Authentication failed', 401);
        }
    }
};
exports.auth = auth;
/**
 * Belirli izinlere sahip kullanıcıları doğrulayan middleware
 * @param requiredPermission Gereken izin
 */
const requirePermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError('Yetkilendirme gerekli', 401, errorHandler_1.ErrorCode.UNAUTHORIZED);
            }
            const { role } = req.user;
            if (!(0, exports.hasPermission)(role, requiredPermission)) {
                throw new errorHandler_1.AppError('Bu işlemi gerçekleştirmek için gerekli izne sahip değilsiniz', 403, errorHandler_1.ErrorCode.FORBIDDEN);
            }
            next();
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else if (error instanceof Error) {
                apiResponse_1.default.error(res, error.message, 500);
            }
            else {
                apiResponse_1.default.error(res, 'Yetkilendirme hatası', 500);
            }
        }
    };
};
exports.requirePermission = requirePermission;
/**
 * Belirli rollere sahip kullanıcıları doğrulayan middleware
 * @param roles İzin verilen roller dizisi
 */
const requireRoles = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new errorHandler_1.AppError('Yetkilendirme gerekli', 401, errorHandler_1.ErrorCode.UNAUTHORIZED);
            }
            if (!roles.includes(req.user.role)) {
                throw new errorHandler_1.AppError('Bu işlemi gerçekleştirmek için gerekli role sahip değilsiniz', 403, errorHandler_1.ErrorCode.FORBIDDEN);
            }
            next();
        }
        catch (error) {
            if (error instanceof errorHandler_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else if (error instanceof Error) {
                apiResponse_1.default.error(res, error.message, 500);
            }
            else {
                apiResponse_1.default.error(res, 'Yetkilendirme hatası', 500);
            }
        }
    };
};
exports.requireRoles = requireRoles;
//# sourceMappingURL=auth.js.map