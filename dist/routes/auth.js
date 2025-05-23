"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controllers/authController"));
const index_1 = require("../middleware/index");
const joi_1 = __importDefault(require("joi"));
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
// Validasyon şemaları
const loginSchema = {
    body: {
        username: index_1.commonSchemas.username,
        password: joi_1.default.string().required().messages({
            'any.required': 'Şifre alanı zorunludur.'
        })
    }
};
const registerSchema = {
    body: {
        username: index_1.commonSchemas.username,
        email: index_1.commonSchemas.email,
        password: index_1.commonSchemas.password,
        role: joi_1.default.string().valid('admin', 'student').default('student').messages({
            'any.only': 'Rol sadece "admin" veya "student" olabilir.'
        })
    }
};
const refreshTokenSchema = {
    body: {
        refreshToken: joi_1.default.string().required().messages({
            'any.required': 'Refresh token alanı zorunludur.'
        })
    }
};
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', (0, index_1.validate)(loginSchema), authController_1.default.login);
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register new admin user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin user registered successfully
 *       400:
 *         description: Username or email already exists
 *       401:
 *         description: Unauthorized
 */
router.post('/register', middleware_1.auth, (0, index_1.requireRoles)(['admin']), (0, index_1.validate)(registerSchema), authController_1.default.RegisterAdmin);
/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh-token', (0, index_1.validate)(refreshTokenSchema), authController_1.default.refreshToken);
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', middleware_1.auth, authController_1.default.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map