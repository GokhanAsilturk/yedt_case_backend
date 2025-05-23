import express from 'express';
import AuthController from '../controllers/authController';
import { validate, commonSchemas, requireRoles } from '../middleware/index';
import Joi from 'joi';
import { auth } from '../middleware';

const router = express.Router();

// Validasyon şemaları
const loginSchema = {
  body: {
    username: commonSchemas.username,
    password: Joi.string().required().messages({
      'any.required': 'Şifre alanı zorunludur.'
    })
  }
};

const registerSchema = {
  body: {
    username: commonSchemas.username,
    email: commonSchemas.email,
    password: commonSchemas.password,
    role: Joi.string().valid('admin', 'student').default('student').messages({
      'any.only': 'Rol sadece "admin" veya "student" olabilir.'
    })
  }
};

const refreshTokenSchema = {
  body: {
    refreshToken: Joi.string().required().messages({
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
router.post('/login', validate(loginSchema), AuthController.login);

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
router.post('/register', auth, requireRoles(['admin']), validate(registerSchema), AuthController.RegisterAdmin);

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
router.post('/refresh-token', validate(refreshTokenSchema), AuthController.refreshToken);

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
router.post('/logout', auth, AuthController.logout);

export default router;
