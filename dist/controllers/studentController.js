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
const AppError_1 = require("../error/models/AppError");
const errorCodes_1 = require("../error/constants/errorCodes");
const errorMessages_1 = require("../error/constants/errorMessages");
const StudentController = {
    getAllStudents: async (req, res, next) => {
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
                    { '$user.firstName$': { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { '$user.lastName$': { [sequelize_1.Op.iLike]: `%${search}%` } }
                ]
            } : {};
            const { count, rows: students } = await Student_1.default.findAndCountAll({
                where: whereClause, include: [
                    {
                        model: User_1.default,
                        as: 'user',
                        attributes: ['username', 'email', 'role', 'firstName', 'lastName']
                    }
                ],
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });
            apiResponse_1.default.pagination(res, students, page, limit, count);
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
    getStudentById: async (req, res, next) => {
        var _a, _b;
        try {
            const student = await Student_1.default.findByPk(req.params.id, {
                include: [
                    {
                        model: User_1.default,
                        as: 'user',
                        attributes: ['username', 'email', 'role', 'firstName', 'lastName']
                    }
                ]
            });
            if (!student) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'student' && student.id !== ((_b = req.user.studentId) !== null && _b !== void 0 ? _b : req.user.id)) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.UNAUTHORIZED.tr, 403, errorCodes_1.ErrorCode.FORBIDDEN);
            }
            apiResponse_1.default.success(res, student);
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Öğrenci bilgileri alınırken bir hata oluştu', 500);
            }
        }
    },
    createStudent: async (req, res, next) => {
        try {
            const { username, email, password, firstName, lastName, birthDate } = req.body;
            const user = await User_1.default.create({
                username,
                firstName,
                lastName,
                email,
                password,
                role: 'student'
            });
            const student = await Student_1.default.create({
                userId: user.id,
                birthDate: new Date(birthDate),
                birthday: birthDate
            });
            apiResponse_1.default.success(res, { user, student }, 'Student created successfully', 201);
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Öğrenci oluşturulurken bir hata oluştu', 500);
            }
        }
    }, updateStudent: async (req, res, next) => {
        try {
            const { firstName, lastName, username, birthDate, birthday } = req.body;
            const student = await Student_1.default.findByPk(req.params.id, {
                include: [
                    {
                        model: User_1.default,
                        as: 'user',
                        attributes: ['id']
                    }
                ]
            });
            if (!student) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            // User tablosunu güncelle
            if (firstName || lastName || username) {
                await User_1.default.update({
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName }),
                    ...(username && { username: username })
                }, { where: { id: student.userId } });
            } // Student tablosunu güncelle
            if (birthDate || birthday) {
                await student.update({
                    ...(birthDate && { birthDate: new Date(birthDate) }),
                    ...(birthday && { birthday })
                });
            }
            // Güncellenmiş student'ı include ile geri döndür
            const updatedStudent = await Student_1.default.findByPk(req.params.id, {
                include: [
                    {
                        model: User_1.default,
                        as: 'user',
                        attributes: ['username', 'email', 'role', 'firstName', 'lastName']
                    }
                ]
            });
            apiResponse_1.default.success(res, updatedStudent, 'Student updated successfully');
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Öğrenci güncellenirken bir hata oluştu', 500);
            }
        }
    },
    deleteStudent: async (req, res, next) => {
        try {
            const student = await Student_1.default.findByPk(req.params.id);
            if (!student) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            await database_1.sequelize.transaction(async (t) => {
                await Enrollment_1.default.destroy({
                    where: { studentId: student.id },
                    transaction: t
                });
                await student.destroy({ transaction: t });
                await User_1.default.destroy({
                    where: { id: student.userId },
                    transaction: t
                });
            });
            apiResponse_1.default.success(res, null, 'Student deleted successfully');
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Öğrenci silinirken bir hata oluştu', 500);
            }
        }
    },
    updateStudentProfile: async (req, res, next) => {
        var _a;
        try {
            const { firstName, lastName, birthDate, birthday } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            // User bilgilerini güncelle
            if (firstName || lastName) {
                await User_1.default.update({
                    ...(firstName && { firstName }),
                    ...(lastName && { lastName })
                }, { where: { id: userId } });
            }
            // Student bilgilerini güncelle
            if (birthDate) {
                const student = await Student_1.default.findOne({ where: { userId } });
                if (student) {
                    await student.update({
                        birthDate: new Date(birthDate)
                    });
                }
            }
            // Güncellenmiş bilgileri getir
            const updatedUser = await User_1.default.findByPk(userId, {
                attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'role']
            });
            const updatedStudent = await Student_1.default.findOne({
                where: { userId },
                include: [
                    {
                        model: User_1.default,
                        as: 'user',
                        attributes: ['username', 'email', 'firstName', 'lastName', 'role']
                    }
                ]
            });
            apiResponse_1.default.success(res, { user: updatedUser, student: updatedStudent }, 'Profil başarıyla güncellendi');
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Profil güncellenirken bir hata oluştu', 500);
            }
        }
    }
};
exports.default = StudentController;
//# sourceMappingURL=studentController.js.map