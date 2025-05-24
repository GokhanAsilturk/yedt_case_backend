import express from 'express';
import AuthController from '../controllers/authController';
import { validate, commonSchemas } from '../middleware/index';
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


const refreshTokenSchema = {
  body: {
    refreshToken: Joi.string().required().messages({
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
router.post('/admin/login', validate(loginSchema), AuthController.adminLogin);

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
router.post('/student/login', validate(loginSchema), AuthController.studentLogin);

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
