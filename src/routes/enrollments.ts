import express from 'express';
import EnrollmentController from '../controllers/enrollmentController';
import { auth, checkRole } from '../middleware';
import asyncHandler from '../utils/asyncHandler';

const router = express.Router();

router.post('/student/courses/:courseId/enroll',
  auth,
  asyncHandler(EnrollmentController.enrollCourse)
);

router.delete('/student/courses/:courseId/withdraw',
  auth,
  asyncHandler(EnrollmentController.withdrawCourse)
);

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
router.get('/',
  auth,
  checkRole(['admin']),
  asyncHandler(EnrollmentController.getAllEnrollments)
);

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
router.get('/students/:id',
  auth,
  asyncHandler(EnrollmentController.getStudentEnrollments)
);

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
router.get('/courses/:id',
  auth,
  asyncHandler(EnrollmentController.getCourseEnrollments)
);

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
router.post('/',
  auth,
  asyncHandler(EnrollmentController.createEnrollment)
);

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
router.delete('/:id',
  auth,
  asyncHandler(EnrollmentController.deleteEnrollment)
);

export default router;
