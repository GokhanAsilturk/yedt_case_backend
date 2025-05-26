"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Student_1 = __importDefault(require("../models/Student"));
const Course_1 = __importDefault(require("../models/Course"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const AppError_1 = require("../error/models/AppError");
const errorCodes_1 = require("../error/constants/errorCodes");
const errorMessages_1 = require("../error/constants/errorMessages");
const EnrollmentController = {
    // List all enrollments (with pagination)
    getAllEnrollments: async (req, res, next) => {
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
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : errorMessages_1.ErrorMessage.GENERIC_ERROR.tr, 500);
            }
        }
    },
    // Enroll logged-in student to a course
    enrollCourse: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { courseId } = req.params;
            const student = await Student_1.default.findOne({ where: { userId } });
            if (!student) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            const course = await Course_1.default.findByPk(courseId);
            if (!course) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            const existingEnrollment = await Enrollment_1.default.findOne({
                where: { studentId: student.id, courseId }
            });
            if (existingEnrollment) {
                throw new AppError_1.AppError('Bu kursa zaten kayıtlısınız', 400, errorCodes_1.ErrorCode.CONFLICT);
            }
            const enrollment = await Enrollment_1.default.create({
                studentId: student.id,
                courseId,
                enrollmentDate: new Date()
            });
            apiResponse_1.default.success(res, enrollment, 'Enrolled successfully', 201);
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Kayıt işlemi sırasında bir hata oluştu', 500);
            }
        }
    },
    // Withdraw logged-in student from a course
    withdrawCourse: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { courseId } = req.params;
            const student = await Student_1.default.findOne({ where: { userId } });
            if (!student) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            const enrollment = await Enrollment_1.default.findOne({
                where: { studentId: student.id, courseId }
            });
            if (!enrollment) {
                throw new AppError_1.AppError('Kayıt bulunamadı', 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            await enrollment.destroy();
            apiResponse_1.default.success(res, null, 'Withdrawn successfully');
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Kayıt silme işlemi sırasında bir hata oluştu', 500);
            }
        }
    },
    getStudentEnrollments: async (req, res, next) => {
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
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Öğrenci kayıtları alınırken bir hata oluştu', 500);
            }
        }
    },
    // Get course enrollments
    getCourseEnrollments: async (req, // Use TypedRequest with IdParams
    res, next) => {
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
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Kurs kayıtları alınırken bir hata oluştu', 500);
            }
        }
    },
    // Create a new enrollment
    createEnrollment: async (req, // Use TypedRequest with EnrollmentBody
    res, next) => {
        try {
            const { studentId, courseId } = req.body;
            // Check if enrollment already exists
            const existingEnrollment = await Enrollment_1.default.findOne({
                where: { studentId, courseId }
            });
            if (existingEnrollment) {
                throw new AppError_1.AppError('Öğrenci bu kursa zaten kayıtlı', 400, errorCodes_1.ErrorCode.CONFLICT);
            }
            // Check if student and course exist
            const [student, course] = await Promise.all([
                Student_1.default.findByPk(studentId),
                Course_1.default.findByPk(courseId)
            ]);
            if (!student) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            if (!course) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            const enrollment = await Enrollment_1.default.create({
                studentId,
                courseId,
                enrollmentDate: new Date()
            });
            apiResponse_1.default.success(res, enrollment, 'Enrollment created successfully', 201);
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Kayıt oluşturulurken bir hata oluştu', 500);
            }
        }
    },
    // Delete an enrollment
    deleteEnrollment: async (req, // Use TypedRequest with IdParams
    res, next) => {
        try {
            const enrollment = await Enrollment_1.default.findByPk(req.params.id);
            if (!enrollment) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            await enrollment.destroy();
            apiResponse_1.default.success(res, null, 'Enrollment deleted successfully');
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Kayıt silinirken bir hata oluştu', 500);
            }
        }
    }
};
exports.default = EnrollmentController;
//# sourceMappingURL=enrollmentController.js.map