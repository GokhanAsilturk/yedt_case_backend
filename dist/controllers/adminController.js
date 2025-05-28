"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Admin_1 = __importDefault(require("../models/Admin"));
const User_1 = __importDefault(require("../models/User"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const AppError_1 = require("../error/models/AppError");
const errorCodes_1 = require("../error/constants/errorCodes");
const errorMessages_1 = require("../error/constants/errorMessages");
const AdminController = {
    // List all admins
    getAllAdmins: async (req, res, next) => {
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
                    { '$user.lastName$': { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { department: { [sequelize_1.Op.iLike]: `%${search}%` } },
                    { title: { [sequelize_1.Op.iLike]: `%${search}%` } }
                ]
            } : {};
            const { count, rows: admins } = await Admin_1.default.findAndCountAll({
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
            apiResponse_1.default.pagination(res, admins, page, limit, count);
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
    // Get admin details by ID
    getAdminById: async (req, res, next) => {
        try {
            const admin = await Admin_1.default.findByPk(req.params.id, {
                include: [
                    {
                        model: User_1.default,
                        as: 'user',
                        attributes: ['username', 'email', 'role', 'firstName', 'lastName']
                    }
                ]
            });
            if (!admin) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            apiResponse_1.default.success(res, admin);
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Yönetici bilgileri alınırken bir hata oluştu', 500);
            }
        }
    },
    // Create a new admin
    createAdmin: async (req, res, next) => {
        try {
            const { username, email, password, firstName, lastName, department, title } = req.body; // Create User first
            const user = await User_1.default.create({
                username,
                email,
                password,
                role: 'admin',
                firstName,
                lastName
            }); // Type assertion needed due to Sequelize typing limitations
            // Then create Admin
            const admin = await Admin_1.default.create({
                userId: user.id,
                department,
                title
            }); // Type assertion needed due to Sequelize typing limitations
            apiResponse_1.default.success(res, { user, admin }, 'Yönetici başarıyla oluşturuldu', 201);
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Yönetici oluşturulurken bir hata oluştu', 500);
            }
        }
    },
    // Update admin details
    updateAdmin: async (req, res, next) => {
        try {
            const { firstName, lastName, department, title } = req.body;
            const admin = await Admin_1.default.findByPk(req.params.id);
            if (!admin) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            // Önce kullanıcı bilgilerini güncelle
            const user = await User_1.default.findByPk(admin.userId);
            await (user === null || user === void 0 ? void 0 : user.update({
                firstName,
                lastName
            }));
            // Sonra admin bilgilerini güncelle
            await admin.update({
                department,
                title
            });
            apiResponse_1.default.success(res, { admin, user }, 'Yönetici başarıyla güncellendi');
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Yönetici güncellenirken bir hata oluştu', 500);
            }
        }
    },
    // Delete an admin
    deleteAdmin: async (req, res, next) => {
        try {
            const admin = await Admin_1.default.findByPk(req.params.id);
            if (!admin) {
                throw new AppError_1.AppError(errorMessages_1.ErrorMessage.NOT_FOUND.tr, 404, errorCodes_1.ErrorCode.NOT_FOUND);
            }
            // Transaction kullanarak silme işlemlerini gerçekleştir
            await database_1.sequelize.transaction(async (t) => {
                // Önce admin'i sil
                await admin.destroy({ transaction: t });
                // Sonra user'ı sil
                await User_1.default.destroy({
                    where: { id: admin.userId },
                    transaction: t
                });
            });
            apiResponse_1.default.success(res, null, 'Yönetici başarıyla silindi');
        }
        catch (error) {
            if (next) {
                next(error);
            }
            else if (error instanceof AppError_1.AppError) {
                apiResponse_1.default.error(res, error.message, error.statusCode, { code: error.errorCode });
            }
            else {
                apiResponse_1.default.error(res, error instanceof Error ? error.message : 'Yönetici silinirken bir hata oluştu', 500);
            }
        }
    }
};
exports.default = AdminController;
//# sourceMappingURL=adminController.js.map