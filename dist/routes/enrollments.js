"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const enrollmentController_1 = __importDefault(require("../controllers/enrollmentController"));
const middleware_1 = require("../middleware");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const router = express_1.default.Router();
router.post('/student/courses/:courseId/enroll', middleware_1.auth, (0, asyncHandler_1.default)(enrollmentController_1.default.enrollCourse));
router.delete('/student/courses/:courseId/withdraw', middleware_1.auth, (0, asyncHandler_1.default)(enrollmentController_1.default.withdrawCourse));
/**
 * @swagger
 * /api/enrollments:
 *   get:
 *     summary: List all enrollments
 *     tags: [Enrollments]
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
 *         description: Number of enrollments per page
 *     responses:
 *       200:
 *         description: Enrollment list retrieved successfully
 */
router.get('/', middleware_1.auth, (0, middleware_1.checkRole)(['admin']), (0, asyncHandler_1.default)(enrollmentController_1.default.getAllEnrollments));
/**
 * @swagger
 * /api/enrollments/students/{id}:
 *   get:
 *     summary: Get student's enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student enrollments retrieved successfully
 */
router.get('/students/:id', middleware_1.auth, (0, asyncHandler_1.default)(enrollmentController_1.default.getStudentEnrollments));
/**
 * @swagger
 * /api/enrollments/courses/{id}:
 *   get:
 *     summary: Get course enrollments
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course enrollments retrieved successfully
 */
router.get('/courses/:id', middleware_1.auth, (0, asyncHandler_1.default)(enrollmentController_1.default.getCourseEnrollments));
/**
 * @swagger
 * /api/enrollments:
 *   post:
 *     summary: Create new enrollment
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - courseId
 *             properties:
 *               studentId:
 *                 type: string
 *               courseId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Enrollment created successfully
 */
router.post('/', middleware_1.auth, (0, asyncHandler_1.default)(enrollmentController_1.default.createEnrollment));
/**
 * @swagger
 * /api/enrollments/{id}:
 *   delete:
 *     summary: Delete enrollment
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment deleted successfully
 */
router.delete('/:id', middleware_1.auth, (0, asyncHandler_1.default)(enrollmentController_1.default.deleteEnrollment));
/**
 * @swagger
 * /api/enrollments/{id}:
 *   get:
 *     summary: Get enrollment by ID
 *     tags: [Enrollments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment retrieved successfully
 */
router.get('/:id', middleware_1.auth, (0, middleware_1.checkRole)(['admin']), (0, asyncHandler_1.default)(enrollmentController_1.default.getEnrollmentById));
exports.default = router;
//# sourceMappingURL=enrollments.js.map