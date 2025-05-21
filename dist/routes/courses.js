"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const courseController_1 = __importDefault(require("../controllers/courseController"));
const auth_1 = require("../middleware/auth");
const middleware_1 = require("../middleware");
const router = express_1.default.Router();
/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: List all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth_1.auth, courseController_1.default.getAllCourses);
/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course details by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', auth_1.auth, courseController_1.default.getCourseById);
/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Add new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth_1.auth, (0, middleware_1.checkRole)(['admin']), courseController_1.default.createCourse);
/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update course details
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth_1.auth, (0, middleware_1.checkRole)(['admin']), courseController_1.default.updateCourse);
/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth_1.auth, (0, middleware_1.checkRole)(['admin']), courseController_1.default.deleteCourse);
exports.default = router;
//# sourceMappingURL=courses.js.map