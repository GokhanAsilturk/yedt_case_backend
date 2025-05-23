"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlInjectionProtection = exports.setupSecurityMiddleware = exports.commonSchemas = exports.validate = exports.ErrorCode = exports.AppError = exports.notFoundHandler = exports.errorHandler = exports.hasPermission = exports.Permission = exports.requireRoles = exports.requirePermission = exports.auth = exports.checkRole = void 0;
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const errorHandler_1 = require("./errorHandler");
Object.defineProperty(exports, "errorHandler", { enumerable: true, get: function () { return errorHandler_1.errorHandler; } });
Object.defineProperty(exports, "notFoundHandler", { enumerable: true, get: function () { return errorHandler_1.notFoundHandler; } });
Object.defineProperty(exports, "AppError", { enumerable: true, get: function () { return errorHandler_1.AppError; } });
Object.defineProperty(exports, "ErrorCode", { enumerable: true, get: function () { return errorHandler_1.ErrorCode; } });
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
const checkRole = (roles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                apiResponse_1.default.error(res, 'Authentication required', 401);
                return;
            }
            if (!roles.includes(req.user.role)) {
                apiResponse_1.default.error(res, 'You do not have permission to perform this action', 403);
                return;
            }
            next();
        }
        catch (error) {
            if (error instanceof Error) {
                apiResponse_1.default.error(res, error.message, 500);
            }
            else {
                apiResponse_1.default.error(res, 'Authorization check failed', 500);
            }
        }
    };
};
exports.checkRole = checkRole;
//# sourceMappingURL=index.js.map