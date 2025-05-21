"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const auth = async (req, res, next) => {
    var _a, _b;
    try {
        const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
        if (!token) {
            apiResponse_1.default.error(res, 'Authentication required', 401);
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, (_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : 'your-secret-key');
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
//# sourceMappingURL=auth.js.map