"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Student_1 = __importDefault(require("../models/Student"));
const User_1 = __importDefault(require("../models/User"));
const Enrollment_1 = __importDefault(require("../models/Enrollment"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const StudentController = {
    // List all students (with pagination and search)
    getAllStudents: async (req, res) => {
        var _a, _b, _c;
        try {
            const page = parseInt((_a = req.query.page) !== null && _a !== void 0 ? _a : '1');
            const limit = parseInt((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10');
            const search = (_c = req.query.search) !== null && _c !== void 0 ? _c : '';
            const offset = (page - 1) * limit;
            const whereClause = search ? {
                [sequelize_1.Op.or]: [
                    { '$user.username$': { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { '$user.email$': { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { firstName: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { lastName: { [sequelize_1.Op.iLike]: `%${search}%` } }
                ]
            } : {};
            const { count, rows: students } = await Student_1.default.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: User_1.default,
                        as: 'userAccount', // Updated alias to match model association
                        attributes: ['username', 'email', 'role']
                    }
                ],
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });
            apiResponse_1.default.pagination(res, students, page, limit, count);
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    },
    // Get profile of logged-in student
    getProfile: async (req, res) => {
        try {
            const userId = req.user.id; // JWT'den user id alınır
            const student = await Student_1.default.findOne({
                where: { userId },
                include: [
                    {
                        model: User_1.default,
                        as: 'userAccount',
                        attributes: ['username', 'email', 'role']
                    }
                ]
            });
            if (!student) {
                apiResponse_1.default.error(res, 'Student profile not found', 404);
                return;
            }
            apiResponse_1.default.success(res, student);
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    },
    // Update profile of logged-in student
    updateProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const { firstName, lastName, birthDate } = req.body;
            const student = await Student_1.default.findOne({ where: { userId } });
            if (!student) {
                apiResponse_1.default.error(res, 'Student profile not found', 404);
                return;
            }
            await student.update({
                firstName,
                lastName,
                birthDate: birthDate ? new Date(birthDate) : undefined
            });
            apiResponse_1.default.success(res, student, 'Profile updated successfully');
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    },
    // Get student details by ID
    getStudentById: async (req, res) => {
        try {
            const student = await Student_1.default.findByPk(req.params.id, {
                include: [
                    {
                        model: User_1.default,
                        as: 'userAccount', // Updated alias to match model association
                        attributes: ['username', 'email', 'role']
                    }
                ]
            });
            if (!student) {
                apiResponse_1.default.error(res, 'Student not found', 404);
                return;
            }
            apiResponse_1.default.success(res, student);
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    },
    // Create a new student
    createStudent: async (req, res) => {
        try {
            const { username, email, password, firstName, lastName, birthDate } = req.body;
            // Create User first
            const user = await User_1.default.create({
                username,
                email,
                password,
                role: 'student'
            }); // Type assertion needed due to Sequelize typing limitations
            // Then create Student
            const student = await Student_1.default.create({
                userId: user.id,
                firstName,
                lastName,
                birthDate: new Date(birthDate)
            }); // Type assertion needed due to Sequelize typing limitations
            apiResponse_1.default.success(res, { user, student }, 'Student created successfully', 201);
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    },
    // Update student details
    updateStudent: async (req, res) => {
        try {
            const { firstName, lastName, birthDate } = req.body;
            const student = await Student_1.default.findByPk(req.params.id);
            if (!student) {
                apiResponse_1.default.error(res, 'Student not found', 404);
                return;
            }
            await student.update({
                firstName,
                lastName,
                birthDate: birthDate ? new Date(birthDate) : undefined // Handle optional birthDate
            });
            apiResponse_1.default.success(res, student, 'Student updated successfully');
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    },
    // Delete a student
    deleteStudent: async (req, res) => {
        try {
            const student = await Student_1.default.findByPk(req.params.id);
            if (!student) {
                apiResponse_1.default.error(res, 'Student not found', 404);
                return;
            }
            // Transaction kullanarak silme işlemlerini gerçekleştir
            await database_1.sequelize.transaction(async (t) => {
                // Önce enrollment kayıtlarını sil
                await Enrollment_1.default.destroy({
                    where: { studentId: student.id },
                    transaction: t
                });
                // Sonra öğrenciyi sil
                await student.destroy({ transaction: t });
                // En son user'ı sil
                await User_1.default.destroy({
                    where: { id: student.userId },
                    transaction: t
                });
            });
            apiResponse_1.default.success(res, null, 'Student deleted successfully');
        }
        catch (error) {
            apiResponse_1.default.error(res, error instanceof Error ? error.message : 'An error occurred');
        }
    }
};
exports.default = StudentController;
//# sourceMappingURL=studentController.js.map