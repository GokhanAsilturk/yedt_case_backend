import express from 'express';
import CourseController from '../controllers/courseController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware';
import { TypedRequestHandler } from '../types/express';

const router = express.Router();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: List all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', 
  auth as TypedRequestHandler,
  CourseController.getAllCourses
);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course details by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id',
  auth as TypedRequestHandler,
  CourseController.getCourseById
);

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Add new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.post('/',
  auth as TypedRequestHandler,
  checkRole(['admin']) as TypedRequestHandler,
  CourseController.createCourse
);

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update course details
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id',
  auth as TypedRequestHandler,
  checkRole(['admin']) as TypedRequestHandler,
  CourseController.updateCourse
);

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id',
  auth as TypedRequestHandler,
  checkRole(['admin']) as TypedRequestHandler,
  CourseController.deleteCourse
);

export default router;
