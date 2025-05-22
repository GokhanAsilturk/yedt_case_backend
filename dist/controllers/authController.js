"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const User_1 = __importDefault(require("../models/User"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const jwt_1 = require("../utils/jwt");
class AuthController {
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User_1.default.findOne({ where: { username } });
            if (!user || !(await user.validatePassword(password))) {
                apiResponse_1.default.error(res, 'Invalid credentials', 401);
                return;
            }
            const token = (0, jwt_1.generateToken)(user);
            apiResponse_1.default.success(res, { user, token });
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    }
    static async register(req, res) {
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
            const token = (0, jwt_1.generateToken)(user);
            apiResponse_1.default.success(res, { user, token }, 'Admin user registered successfully', 201);
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    }
}
exports.default = AuthController;
//# sourceMappingURL=authController.js.map