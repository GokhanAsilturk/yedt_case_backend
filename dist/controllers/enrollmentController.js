"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Student_1 = __importDefault(require("../models/Student"));
const Course_1 = __importDefault(require("../models/Course"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const EnrollmentController = {
    // List all enrollments (with pagination)
    getAllEnrollments: async (req, // Use PaginationQuery for query type
    res) => {
        var _a, _b;
        try {
            const page = parseInt((_a = req.query.page) !== null && _a !== void 0 ? _a : '1');
            const limit = parseInt((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10');
            const offset = (page - 1) * limit;
            const { count, rows: enrollments } = await Enrollment_1.default.findAndCountAll({
                include: [
                    {
                        model: Student_1.default,
                        as: 'student'
                    },
                    {
                        model: Course_1.default,
                        as: 'course'
                    }
                ],
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });
            apiResponse_1.default.pagination(res, enrollments, page, limit, count);
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    },
    // Get student enrollments
    getStudentEnrollments: async (req, // Use TypedRequest with IdParams
    res) => {
        try {
            const { id: studentId } = req.params;
            const enrollments = await Enrollment_1.default.findAll({
                where: { studentId },
                include: [
                    {
                        model: Course_1.default,
                        as: 'course'
                    }
                ]
            });
            apiResponse_1.default.success(res, enrollments);
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    },
    // Get course enrollments
    getCourseEnrollments: async (req, // Use TypedRequest with IdParams
    res) => {
        try {
            const { id: courseId } = req.params;
            const enrollments = await Enrollment_1.default.findAll({
                where: { courseId },
                include: [
                    {
                        model: Student_1.default,
                        as: 'student'
                    }
                ]
            });
            apiResponse_1.default.success(res, enrollments);
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    },
    // Create a new enrollment
    createEnrollment: async (req, // Use TypedRequest with EnrollmentBody
    res) => {
        try {
            const { studentId, courseId } = req.body;
            // Check if enrollment already exists
            const existingEnrollment = await Enrollment_1.default.findOne({
                where: { studentId, courseId }
            });
            if (existingEnrollment) {
                apiResponse_1.default.error(res, 'Student is already enrolled in this course', 400);
                return;
            }
            // Check if student and course exist
            const [student, course] = await Promise.all([
                Student_1.default.findByPk(studentId),
                Course_1.default.findByPk(courseId)
            ]);
            if (!student) {
                apiResponse_1.default.error(res, 'Student not found', 404);
                return;
            }
            if (!course) {
                apiResponse_1.default.error(res, 'Course not found', 404);
                return;
            }
            const enrollment = await Enrollment_1.default.create({
                studentId,
                courseId,
                enrollmentDate: new Date()
            });
            apiResponse_1.default.success(res, enrollment, 'Enrollment created successfully', 201);
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    },
    // Delete an enrollment
    deleteEnrollment: async (req, // Use TypedRequest with IdParams
    res) => {
        try {
            const enrollment = await Enrollment_1.default.findByPk(req.params.id);
            if (!enrollment) {
                apiResponse_1.default.error(res, 'Enrollment not found', 404);
                return;
            }
            await enrollment.destroy();
            apiResponse_1.default.success(res, null, 'Enrollment deleted successfully');
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    }
};
exports.default = EnrollmentController;
//# sourceMappingURL=enrollmentController.js.map