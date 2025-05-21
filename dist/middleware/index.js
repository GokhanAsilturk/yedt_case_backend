"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.checkRole = void 0;
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
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
var auth_1 = require("./auth");
Object.defineProperty(exports, "auth", { enumerable: true, get: function () { return auth_1.auth; } });
//# sourceMappingURL=index.js.map