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
  // List all students (with pagination and search)
  getAllStudents: async (req: TypedRequest<{}, any, any, PaginationQuery & SearchQuery>, res: Response, next?: NextFunction): Promise<void> => { // Use PaginationQuery and SearchQuery
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
            as: 'userAccount', // Updated alias to match model association
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

  // Get student details by ID
  getStudentById: async (req: Request & { user?: any }, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const student = await Student.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'userAccount', // Updated alias to match model association
            attributes: ['username', 'email', 'role']
          }
        ]
      });

      if (!student) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }
  
      // Öğrencinin kendi ID'si kontrolü
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

  // Create a new student
  createStudent: async (req: TypedRequest<{}, any, StudentCreateBody>, res: Response, next?: NextFunction): Promise<void> => { // Use TypedRequest with StudentCreateBody
    try {
      const { username, email, password, firstName, lastName, birthDate } = req.body;

      // Create User first
      const user = await User.create({
        username,
        email,
        password,
        role: 'student'
      } as any); // Type assertion needed due to Sequelize typing limitations

      // Then create Student
      const student = await Student.create({
        userId: user.id,
        firstName,
        lastName,
        birthDate: new Date(birthDate)
      } as any); // Type assertion needed due to Sequelize typing limitations

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

  // Update student details
  updateStudent: async (req: TypedRequest<IdParams, any, StudentUpdateBody>, res: Response, next?: NextFunction): Promise<void> => { // Use TypedRequest with IdParams and StudentUpdateBody
    try {
      const { firstName, lastName, birthDate } = req.body;
      const student = await Student.findByPk(req.params.id);

      if (!student) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      await student.update({
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : undefined // Handle optional birthDate
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

  // Delete a student
  deleteStudent: async (req: TypedRequest<IdParams>, res: Response, next?: NextFunction): Promise<void> => { // Use TypedRequest with IdParams
    try {
      const student = await Student.findByPk(req.params.id);

      if (!student) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      // Transaction kullanarak silme işlemlerini gerçekleştir
      await sequelize.transaction(async (t: Transaction) => {
        // Önce enrollment kayıtlarını sil
        await Enrollment.destroy({
          where: { studentId: student.id },
          transaction: t
        });

        // Sonra öğrenciyi sil
        await student.destroy({ transaction: t });

        // En son user'ı sil
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
  
  // Update student profile
  updateStudentProfile: async (req: Request & { user?: any } & { body: StudentUpdateBody }, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const { firstName, lastName, birthDate } = req.body;
      const studentId = req.user?.studentId ?? req.user?.id; // Assuming studentId is available in req.user
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
