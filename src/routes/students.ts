import express, { Request, Response, NextFunction } from 'express';
import StudentController from '../controllers/studentController';
import { auth, checkRole, validate } from '../middleware';
import asyncHandler from '../utils/asyncHandler';
import Joi from 'joi';

const router = express.Router();

// Öğrenci profil güncelleme şeması
const updateStudentProfileSchema = {
  body: {
    firstName: Joi.string().required().messages({
      'any.required': 'Ad alanı zorunludur.'
    }),
    lastName: Joi.string().required().messages({
      'any.required': 'Soyad alanı zorunludur.'
    }),
    birthDate: Joi.date().iso().messages({
      'date.format': 'Geçerli bir tarih formatı giriniz (YYYY-MM-DD).'
    })
  }
};

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: List all students
 *     tags: [Students]
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
 *         description: Number of students per page
 *     responses:
 *       200:
 *         description: Student list retrieved successfully
 */
router.get('/',
 auth,
 checkRole(['admin']),
 asyncHandler(StudentController.getAllStudents)
);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get student details by ID
 *     tags: [Students]
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
 *         description: Student details retrieved successfully
 *       404:
 *         description: Student not found
 */
router.get('/:id',
  auth,
  (req: Request & { user?: any }, res: Response, next: NextFunction): void => {
    // Öğrencinin kendi ID'si ile eşleşme kontrolü
    if (req.user?.role === 'student' && req.params.id !== req.user.id && req.params.id !== req.user.studentId) {
      res.status(403).json({
        success: false,
        message: 'Bu öğrenci bilgilerine erişim yetkiniz bulunmamaktadır.'
      });
    } else {
      next();
    }
  },
  asyncHandler(StudentController.getStudentById)
);

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Add new student
 *     tags: [Students]
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
 *               - birthDate
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
 *               birthDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Student created successfully
 */
router.post('/',
  auth,
  checkRole(['admin']),
  asyncHandler(StudentController.createStudent)
);

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update student details
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - birthDate
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       404:
 *         description: Student not found
 */
router.put('/:id',
  auth,
  checkRole(['admin', 'student']),
  asyncHandler(StudentController.updateStudent)
);

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete student
 *     tags: [Students]
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
 *         description: Student deleted successfully
 *       404:
 *         description: Student not found
 */
router.delete('/:id',
  auth,
  checkRole(['admin']),
  asyncHandler(StudentController.deleteStudent)
);

/**
 * @swagger
 * /api/students/profile:
 *   put:
 *     summary: Update student profile
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
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
 *               birthDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Student not found
 */
// Öğrenci profil güncelleme endpoint'i - Sadece öğrencinin kendi profilini güncellemesine izin verir
router.put('/profile',
  auth,
  (req: Request & { user?: any }, res: Response, next: NextFunction): void => {
    if (req.user?.role !== 'student') {
      res.status(403).json({
        success: false,
        message: 'Bu işlem sadece öğrenciler tarafından yapılabilir.'
      });
    } else {
      next();
    }
  },
  validate(updateStudentProfileSchema),
  asyncHandler(StudentController.updateStudentProfile)
);

export default router;
