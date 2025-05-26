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
const refreshTokenSchema = {
    body: {
        refreshToken: joi_1.default.string().required().messages({
            'any.required': 'Refresh token alanı zorunludur.'
        })
    }
};
/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Login as an admin
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
 *         description: Admin login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/admin/login', (0, index_1.validate)(loginSchema), authController_1.default.adminLogin);
/**
 * @swagger
 * /api/auth/student/login:
 *   post:
 *     summary: Student login
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
 *         description: Student login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/student/login', (0, index_1.validate)(loginSchema), authController_1.default.studentLogin);
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