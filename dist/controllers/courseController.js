"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Course_1 = __importDefault(require("../models/Course"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const AppError_1 = require("../error/models/AppError");
const errorCodes_1 = require("../error/constants/errorCodes");
const errorMessages_1 = require("../error/constants/errorMessages");
const CourseController = {
    // List all courses (with pagination and search)
    getAllCourses: async (req, res, next) => {
        var _a, _b, _c;
        try {
            const page = parseInt((_a = req.query.page) !== null && _a !== void 0 ? _a : '1');
            const limit = parseInt((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10');
            const search = (_c = req.query.search) !== null && _c !== void 0 ? _c : '';
            const offset = (page - 1) * limit;
            const sanitizedSearch = typeof search === 'string' ? search.replace(/[%_]/g, '\\$&') : '';
            const whereClause = sanitizedSearch
                ? {
                    [sequelize_1.Op.or]: [
                        { name: { [sequelize_1.Op.like]: `%${sanitizedSearch}%` } },
                        { description: { [sequelize_1.Op.like]: `%${sanitizedSearch}%` } }
                    ]
                }
                : {};
            const { count, rows: courses } = await Course_1.default.findAndCountAll({
                where: whereClause,
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });
            apiResponse_1.default.pagination(res, courses, page, limit, count);
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
    // Get course details by ID
    getCourseById: async (req, res, next) => {
        try {
            const course = await Course_1.default.findByPk(req.params.id);
            if (!course) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            apiResponse_1.default.success(res, course);
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Kurs alınırken bir hata oluştu', 500);
            }
        }
    },
    // Create a new course
    createCourse: async (req, res, next) => {
        try {
            const { name, description = '' } = req.body;
            const course = await Course_1.default.create({
                name,
                description
            });
            apiResponse_1.default.success(res, course, 'Course created successfully', 201);
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Kurs oluşturulurken bir hata oluştu', 500);
            }
        }
    },
    // Update course details
    updateCourse: async (req, res, next) => {
        try {
            const course = await Course_1.default.findByPk(req.params.id);
            if (!course) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            const { name, description } = req.body;
            await course.update({
                name: name !== null && name !== void 0 ? name : course.name,
                description: description !== null && description !== void 0 ? description : course.description
            });
            apiResponse_1.default.success(res, course, 'Course updated successfully');
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Kurs güncellenirken bir hata oluştu', 500);
            }
        }
    },
    // Delete a course
    deleteCourse: async (req, res, next) => {
        try {
            const course = await Course_1.default.findByPk(req.params.id);
            if (!course) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            await course.destroy();
            apiResponse_1.default.success(res, null, 'Course deleted successfully');
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Kurs silinirken bir hata oluştu', 500);
            }
        }
    }
};
exports.default = CourseController;
//# sourceMappingURL=courseController.js.map