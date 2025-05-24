import { Response, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import Admin from '../models/Admin';
import User from '../models/User';
import ApiResponse from '../utils/apiResponse';
import {
  TypedRequest,
  PaginationQuery,
  IdParams,
  AdminCreateBody,
  AdminUpdateBody,
  SearchQuery
} from '../types/express';
import { AppError } from '../error/models/AppError';
import { ErrorCode } from '../error/constants/errorCodes';
import { ErrorMessage } from '../error/constants/errorMessages';

const AdminController = {
  // List all admins (with pagination and search)
  getAllAdmins: async (req: TypedRequest<{}, any, any, PaginationQuery & SearchQuery>, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page ?? '1');
      const limit = parseInt(req.query.limit ?? '10');
      const search = req.query.search ?? '';
      const offset = (page - 1) * limit;

      const whereClause = search ? {
        [Op.or]: [
          { '$user.username$': { [Op.iLike]: `%${search}%` } },
          { '$user.email$': { [Op.iLike]: `%${search}%` } },
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { department: { [Op.iLike]: `%${search}%` } },
          { title: { [Op.iLike]: `%${search}%` } }
        ]
      } : {};

      const { count, rows: admins } = await Admin.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'userAccount',
            attributes: ['username', 'email', 'role']
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      ApiResponse.pagination(res, admins, page, limit, count);
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : ErrorMessage.GENERIC_ERROR.tr, 500);
        }
    }
  },

  // Get admin details by ID
  getAdminById: async (req: TypedRequest<IdParams>, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const admin = await Admin.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'userAccount',
            attributes: ['username', 'email', 'role']
          }
        ]
      });

      if (!admin) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      ApiResponse.success(res, admin);
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Yönetici bilgileri alınırken bir hata oluştu', 500);
        }
    }
  },

  // Create a new admin
  createAdmin: async (req: TypedRequest<{}, any, AdminCreateBody>, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const { username, email, password, firstName, lastName, department, title } = req.body;

      // Create User first
      const user = await User.create({
        username,
        email,
        password,
        role: 'admin'
      } as any); // Type assertion needed due to Sequelize typing limitations

      // Then create Admin
      const admin = await Admin.create({
        userId: user.id,
        firstName,
        lastName,
        department,
        title
      } as any); // Type assertion needed due to Sequelize typing limitations

      ApiResponse.success(res, { user, admin }, 'Yönetici başarıyla oluşturuldu', 201);
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Yönetici oluşturulurken bir hata oluştu', 500);
        }
    }
  },

  // Update admin details
  updateAdmin: async (req: TypedRequest<IdParams, any, AdminUpdateBody>, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const { firstName, lastName, department, title } = req.body;
      const admin = await Admin.findByPk(req.params.id);

      if (!admin) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      await admin.update({
        firstName,
        lastName,
        department,
        title
      });

      ApiResponse.success(res, admin, 'Yönetici başarıyla güncellendi');
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Yönetici güncellenirken bir hata oluştu', 500);
        }
    }
  },

  // Delete an admin
  deleteAdmin: async (req: TypedRequest<IdParams>, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const admin = await Admin.findByPk(req.params.id);

      if (!admin) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      // Transaction kullanarak silme işlemlerini gerçekleştir
      await sequelize.transaction(async (t: Transaction) => {
        // Önce admin'i sil
        await admin.destroy({ transaction: t });

        // Sonra user'ı sil
        await User.destroy({
          where: { id: admin.userId },
          transaction: t
        });
      });

      ApiResponse.success(res, null, 'Yönetici başarıyla silindi');
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Yönetici silinirken bir hata oluştu', 500);
        }
    }
  }
};

export default AdminController;