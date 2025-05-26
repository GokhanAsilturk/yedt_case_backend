"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlInjectionProtection = exports.setupSecurityMiddleware = exports.commonSchemas = exports.validate = exports.ErrorCode = exports.AppError = exports.notFoundHandler = exports.errorHandler = exports.hasPermission = exports.Permission = exports.requireRoles = exports.requirePermission = exports.auth = exports.checkRole = void 0;
const errorHandler_1 = require("./errorHandler");
Object.defineProperty(exports, "errorHandler", { enumerable: true, get: function () { return errorHandler_1.errorHandler; } });
Object.defineProperty(exports, "notFoundHandler", { enumerable: true, get: function () { return errorHandler_1.notFoundHandler; } });
const validator_1 = require("./validator");
Object.defineProperty(exports, "validate", { enumerable: true, get: function () { return validator_1.validate; } });
Object.defineProperty(exports, "commonSchemas", { enumerable: true, get: function () { return validator_1.commonSchemas; } });
const security_1 = require("./security");
Object.defineProperty(exports, "setupSecurityMiddleware", { enumerable: true, get: function () { return security_1.setupSecurityMiddleware; } });
Object.defineProperty(exports, "sqlInjectionProtection", { enumerable: true, get: function () { return security_1.sqlInjectionProtection; } });
const auth_1 = require("./auth");
Object.defineProperty(exports, "auth", { enumerable: true, get: function () { return auth_1.auth; } });
Object.defineProperty(exports, "requirePermission", { enumerable: true, get: function () { return auth_1.requirePermission; } });
Object.defineProperty(exports, "requireRoles", { enumerable: true, get: function () { return auth_1.requireRoles; } });
Object.defineProperty(exports, "Permission", { enumerable: true, get: function () { return auth_1.Permission; } });
Object.defineProperty(exports, "hasPermission", { enumerable: true, get: function () { return auth_1.hasPermission; } });
const AppError_1 = require("../error/models/AppError");
Object.defineProperty(exports, "AppError", { enumerable: true, get: function () { return AppError_1.AppError; } });
const errorCodes_1 = require("../error/constants/errorCodes");
Object.defineProperty(exports, "ErrorCode", { enumerable: true, get: function () { return errorCodes_1.ErrorCode; } });
const errorMessages_1 = require("../error/constants/errorMessages");
const checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.UNAUTHORIZED.tr, 401, errorCodes_1.ErrorCode.UNAUTHORIZED);
            }
            if (!roles.includes(req.user.role)) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.FORBIDDEN.tr, 403, errorCodes_1.ErrorCode.FORBIDDEN);
            }
            next();
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                next(error);
            }
            else if (error instanceof Error) {
                next(new AppError_1.AppError(error.message, 500, errorCodes_1.ErrorCode.UNAUTHORIZED));
            }
            else {
                next(new AppError_1.AppError(errorMessages_1.ErrorMessage.SECURITY_ERROR.tr, 500, errorCodes_1.ErrorCode.UNAUTHORIZED));
            }
        }
    };
};
exports.checkRole = checkRole;
//# sourceMappingURL=index.js.map