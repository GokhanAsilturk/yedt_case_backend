"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentController_1 = __importDefault(require("../controllers/studentController"));
const middleware_1 = require("../middleware");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const joi_1 = __importDefault(require("joi"));
const router = express_1.default.Router();
// Öğrenci profil güncelleme şeması
const updateStudentProfileSchema = {
    body: {
        firstName: joi_1.default.string().required().messages({
            'any.required': 'Ad alanı zorunludur.'
        }),
        lastName: joi_1.default.string().required().messages({
            'any.required': 'Soyad alanı zorunludur.'
        }),
        birthDate: joi_1.default.date().iso().messages({
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
router.get('/', middleware_1.auth, (0, middleware_1.checkRole)(['admin']), (0, asyncHandler_1.default)(studentController_1.default.getAllStudents));
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
router.get('/:id', middleware_1.auth, (req, res, next) => {
    var _a;
    // Öğrencinin kendi ID'si ile eşleşme kontrolü
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'student' && req.params.id !== req.user.id && req.params.id !== req.user.studentId) {
        res.status(403).json({
            success: false,
            message: 'Bu öğrenci bilgilerine erişim yetkiniz bulunmamaktadır.'
        });
    }
    else {
        next();
    }
}, (0, asyncHandler_1.default)(studentController_1.default.getStudentById));
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
router.post('/', middleware_1.auth, (0, middleware_1.checkRole)(['admin']), (0, asyncHandler_1.default)(studentController_1.default.createStudent));
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
router.put('/:id', middleware_1.auth, (0, middleware_1.checkRole)(['admin']), (0, asyncHandler_1.default)(studentController_1.default.updateStudent));
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
router.delete('/:id', middleware_1.auth, (0, middleware_1.checkRole)(['admin']), (0, asyncHandler_1.default)(studentController_1.default.deleteStudent));
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
router.put('/profile', middleware_1.auth, (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'student') {
        res.status(403).json({
            success: false,
            message: 'Bu işlem sadece öğrenciler tarafından yapılabilir.'
        });
    }
    else {
        next();
    }
}, (0, middleware_1.validate)(updateStudentProfileSchema), (0, asyncHandler_1.default)(studentController_1.default.updateStudentProfile));
exports.default = router;
//# sourceMappingURL=students.js.map