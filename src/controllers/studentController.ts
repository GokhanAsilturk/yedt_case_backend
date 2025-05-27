import { Request, Response, NextFunction } from 'express';
import { TypedRequest, PaginationQuery, IdParams, StudentCreateBody, StudentUpdateBody, SearchQuery } from '../types/express';
import { Op, Transaction } from 'sequelize';
import { sequelize } from '../config/database';
import Student from '../models/Student';
import User from '../models/User';
import Enrollment from '../models/Enrollment';
import ApiResponse from '../utils/apiResponse';
import { AppError } from '../error/models/AppError';
import { ErrorCode } from '../error/constants/errorCodes';
import { ErrorMessage } from '../error/constants/errorMessages';

const StudentController = {
  getAllStudents: async (req: TypedRequest<{}, any, any, PaginationQuery & SearchQuery>, res: Response, next?: NextFunction): Promise<void> => {
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
          { lastName: { [Op.iLike]: `%${search}%` } }
        ]
      } : {};

      const { count, rows: students } = await Student.findAndCountAll({
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

      ApiResponse.pagination(res, students, page, limit, count);
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

  getStudentById: async (req: Request & { user?: any }, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const student = await Student.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'userAccount',
            attributes: ['username', 'email', 'role']
          }
        ]
      });

      if (!student) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }
  
      if (req.user?.role === 'student' && student.id !== (req.user.studentId ?? req.user.id)) {
        throw new AppError(ErrorMessage.UNAUTHORIZED.tr, 403, ErrorCode.FORBIDDEN);
      }
  
      ApiResponse.success(res, student);
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Öğrenci bilgileri alınırken bir hata oluştu', 500);
        }
    }
  },

  createStudent: async (req: TypedRequest<{}, any, StudentCreateBody>, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const { username, email, password, firstName, lastName, birthDate } = req.body;

      const user = await User.create({
        username,
        email,
        password,
        role: 'student'
      } as any);

      const student = await Student.create({
        userId: user.id,
        firstName,
        lastName,
        birthDate: new Date(birthDate)
      } as any);

      ApiResponse.success(res, { user, student }, 'Student created successfully', 201);
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Öğrenci oluşturulurken bir hata oluştu', 500);
        }
    }
  },

  updateStudent: async (req: TypedRequest<IdParams, any, StudentUpdateBody>, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const { firstName, lastName, birthDate } = req.body;
      const student = await Student.findByPk(req.params.id);

      if (!student) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      await student.update({
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : undefined
      });

      ApiResponse.success(res, student, 'Student updated successfully');
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Öğrenci güncellenirken bir hata oluştu', 500);
        }
    }
  },

  deleteStudent: async (req: TypedRequest<IdParams>, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const student = await Student.findByPk(req.params.id);

      if (!student) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      await sequelize.transaction(async (t: Transaction) => {
        await Enrollment.destroy({
          where: { studentId: student.id },
          transaction: t
        });

        await student.destroy({ transaction: t });

        await User.destroy({
          where: { id: student.userId },
          transaction: t
        });
      });

      ApiResponse.success(res, null, 'Student deleted successfully');
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Öğrenci silinirken bir hata oluştu', 500);
        }
    }
  },
  
  updateStudentProfile: async (req: Request & { user?: any } & { body: StudentUpdateBody }, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const { firstName, lastName, birthDate } = req.body;
      const studentId = req.user?.studentId ?? req.user?.id;
      const student = await Student.findByPk(studentId);

      if (!student) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      await student.update({
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      });

      ApiResponse.success(res, student, 'Profil başarıyla güncellendi');
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
        ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
      } else {
        ApiResponse.error(res, error instanceof Error ? error.message : 'Profil güncellenirken bir hata oluştu', 500);
      }
    }
  }
};

export default StudentController;
