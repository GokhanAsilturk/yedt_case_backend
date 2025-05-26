"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = __importDefault(require("../controllers/adminController"));
const middleware_1 = require("../middleware");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = express_1.default.Router();
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
router.get('/', middleware_1.auth, (0, middleware_1.checkRole)(['admin']), (0, asyncHandler_1.default)(adminController_1.default.getAllAdmins));
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
router.get('/:id', middleware_1.auth, (0, middleware_1.checkRole)(['admin']), (0, asyncHandler_1.default)(adminController_1.default.getAdminById));
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
router.post('/', middleware_1.auth, (0, middleware_1.checkRole)(['admin']), (0, asyncHandler_1.default)(adminController_1.default.createAdmin));
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
router.put('/:id', middleware_1.auth, (0, middleware_1.checkRole)(['admin']), (0, asyncHandler_1.default)(adminController_1.default.updateAdmin));
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
router.delete('/:id', middleware_1.auth, (0, middleware_1.checkRole)(['admin']), (0, asyncHandler_1.default)(adminController_1.default.deleteAdmin));
exports.default = router;
//# sourceMappingURL=admins.js.map