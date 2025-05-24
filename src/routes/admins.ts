import express from 'express';
import AdminController from '../controllers/adminController';
import { auth, checkRole } from '../middleware';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

/**
 * @swagger
 * /api/admins:
 *   get:
 *     summary: List all admins
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of admins per page
 *     responses:
 *       200:
 *         description: Admin list retrieved successfully
 */
router.get('/',
 auth,
 checkRole(['admin']),
 asyncHandler(AdminController.getAllAdmins)
);

/**
 * @swagger
 * /api/admins/{id}:
 *   get:
 *     summary: Get admin details by ID
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin details retrieved successfully
 *       404:
 *         description: Admin not found
 */
router.get('/:id',
  auth,
  checkRole(['admin']),
  asyncHandler(AdminController.getAdminById)
);

/**
 * @swagger
 * /api/admins:
 *   post:
 *     summary: Add new admin
 *     tags: [Admins]
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
 *               - firstName
 *               - lastName
 *               - department
 *               - title
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               department:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created successfully
 */
router.post('/',
  auth,
  checkRole(['admin']),
  asyncHandler(AdminController.createAdmin)
);

/**
 * @swagger
 * /api/admins/{id}:
 *   put:
 *     summary: Update admin details
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               department:
 *                 type: string
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       404:
 *         description: Admin not found
 */
router.put('/:id',
  auth,
  checkRole(['admin']),
  asyncHandler(AdminController.updateAdmin)
);

/**
 * @swagger
 * /api/admins/{id}:
 *   delete:
 *     summary: Delete admin
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       404:
 *         description: Admin not found
 */
router.delete('/:id',
  auth,
  checkRole(['admin']),
  asyncHandler(AdminController.deleteAdmin)
);

export default router;