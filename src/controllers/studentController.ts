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
      const offset = (page - 1) * limit;      const whereClause = search ? {
        [Op.or]: [
          { '$user.username$': { [Op.iLike]: `%${search}%` } },
          { '$user.email$': { [Op.iLike]: `%${search}%` } },
          { '$user.firstName$': { [Op.iLike]: `%${search}%` } },
          { '$user.lastName$': { [Op.iLike]: `%${search}%` } }
        ]
      } : {};

      const { count, rows: students } = await Student.findAndCountAll({
        where: whereClause,        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username', 'email', 'role', 'firstName', 'lastName']
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      ApiResponse.pagination(res, students, page, limit, count);
    } catch (err) { // Değişiklik: error -> err, tip kontrolü eklendi
      if (next) {
        next(err);
      } else if (err instanceof AppError) {
        ApiResponse.error(res, err.message, err.statusCode, { code: err.errorCode });
      } else if (err instanceof Error) { // Değişiklik: err'in Error tipinde olup olmadığı kontrol ediliyor
        ApiResponse.error(res, err.message, 500);
      } else { // Değişiklik: Bilinmeyen hatalar için genel mesaj
        ApiResponse.error(res, ErrorMessage.GENERIC_ERROR.tr, 500);
      }
    }
  },

  getStudentById: async (req: Request & { user?: any }, res: Response, next?: NextFunction): Promise<void> => {
    try {      const student = await Student.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username', 'email', 'role', 'firstName', 'lastName']
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
    } catch (err) { // Değişiklik: error -> err, tip kontrolü eklendi
      if (next) {
        next(err);
      } else if (err instanceof AppError) {
        ApiResponse.error(res, err.message, err.statusCode, { code: err.errorCode });
      } else if (err instanceof Error) { // Değişiklik: err'in Error tipinde olup olmadığı kontrol ediliyor
        ApiResponse.error(res, err.message, 500);
      } else { // Değişiklik: Bilinmeyen hatalar için özel mesaj korunuyor
        ApiResponse.error(res, 'Öğrenci bilgileri alınırken bir hata oluştu', 500);
      }
    }
  },
  createStudent: async (req: TypedRequest<{}, any, StudentCreateBody>, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const { username, email, password, firstName, lastName, birthDate } = req.body;

      // Önce kullanıcı adı ve e-posta adresinin benzersiz olup olmadığını kontrol et
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        throw new AppError(ErrorMessage.USERNAME_ALREADY_EXISTS.tr, 409, ErrorCode.USERNAME_ALREADY_EXISTS);
      }

      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        throw new AppError(ErrorMessage.EMAIL_ALREADY_EXISTS.tr, 409, ErrorCode.EMAIL_ALREADY_EXISTS);
      }

      const user = await User.create({
        username,
        firstName,
        lastName,
        email,
        password,
        role: 'student'
      } as any);

      const student = await Student.create({
        userId: user.id,
        birthDate: new Date(birthDate)
      } as any);

      ApiResponse.success(res, { user, student }, 'Student created successfully', 201);
    } catch (err) { // Değişiklik: error -> err, tip kontrolü eklendi
      if (next) {
        next(err);
      } else if (err instanceof AppError) {
        ApiResponse.error(res, err.message, err.statusCode, { code: err.errorCode });
      } else if (err instanceof Error) { // Değişiklik: err'in Error tipinde olup olmadığı kontrol ediliyor ve S6660 uyarısı gideriliyor
        // Sequelize hata mesajlarını daha anlaşılır hale getir
        if (err.message.includes('Duplicate entry') || err.message.includes('tekil kısıtlaması') || err.message.includes('unique constraint')) {
          if (err.message.toLowerCase().includes('username') || err.message.toLowerCase().includes('users_username')) {
            ApiResponse.error(res, ErrorMessage.USERNAME_ALREADY_EXISTS.tr, 409, { code: ErrorCode.USERNAME_ALREADY_EXISTS });
          } else if (err.message.toLowerCase().includes('email') || err.message.toLowerCase().includes('users_email')) {
            ApiResponse.error(res, ErrorMessage.EMAIL_ALREADY_EXISTS.tr, 409, { code: ErrorCode.EMAIL_ALREADY_EXISTS });
          } else {
            ApiResponse.error(res, ErrorMessage.CONFLICT.tr, 409, { code: ErrorCode.CONFLICT });
          }
        } else {
          // Orijinal mantığa uygun olarak, belirli olmayan Error örnekleri için genel hata
          ApiResponse.error(res, ErrorMessage.GENERIC_ERROR.tr, 500, { code: ErrorCode.INTERNAL_SERVER_ERROR });
        }
      } else { // Değişiklik: Bilinmeyen hatalar için genel mesaj
        ApiResponse.error(res, ErrorMessage.GENERIC_ERROR.tr, 500, { code: ErrorCode.INTERNAL_SERVER_ERROR });
      }
    }
  },  updateStudent: async (req: TypedRequest<IdParams, any, StudentUpdateBody>, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const { firstName, lastName, username, birthDate } = req.body;
      const student = await Student.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id']
          }
        ]
      });

      if (!student) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      // Kullanıcı adının benzersiz olup olmadığını kontrol et
      if (username) {
        const existingUsername = await User.findOne({
          where: {
            username,
            id: {
              [Op.ne]: student.userId
            }
          }
        });

        if (existingUsername) {
          throw new AppError(ErrorMessage.USERNAME_ALREADY_EXISTS.tr, 409, ErrorCode.USERNAME_ALREADY_EXISTS);
        }
      }

      // User tablosunu güncelle
      if (firstName || lastName || username) {
        await User.update(
          {
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
            ...(username && { username: username })
          },
          { where: { id: student.userId } }
        );
      }

      // Student tablosunu güncelle
      if (birthDate) {
        await student.update({
          birthDate: new Date(birthDate)
        });
      }

      // Güncellenmiş student'ı include ile geri döndür
      const updatedStudent = await Student.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username', 'email', 'role', 'firstName', 'lastName']
          }
        ]
      });      ApiResponse.success(res, updatedStudent, 'Student updated successfully');
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          // Sequelize hata mesajlarını daha anlaşılır hale getir
          if (error instanceof Error && (error.message.includes('Duplicate entry') || error.message.includes('tekil kısıtlaması') || error.message.includes('unique constraint'))) {
            if (error.message.toLowerCase().includes('username') || error.message.toLowerCase().includes('users_username')) {
              ApiResponse.error(res, ErrorMessage.USERNAME_ALREADY_EXISTS.tr, 409, { code: ErrorCode.USERNAME_ALREADY_EXISTS });
            } else if (error.message.toLowerCase().includes('email') || error.message.toLowerCase().includes('users_email')) {
              ApiResponse.error(res, ErrorMessage.EMAIL_ALREADY_EXISTS.tr, 409, { code: ErrorCode.EMAIL_ALREADY_EXISTS });
            } else {
              ApiResponse.error(res, ErrorMessage.CONFLICT.tr, 409, { code: ErrorCode.CONFLICT });
            }
          } else {
            ApiResponse.error(res, error instanceof Error ? error.message : 'Öğrenci güncellenirken bir hata oluştu', 500, { code: ErrorCode.INTERNAL_SERVER_ERROR });
          }
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
  },    updateStudentProfile: async (req: Request & { user?: any } & { body: StudentUpdateBody }, res: Response, next?: NextFunction): Promise<void> => {
    try {
      const { firstName, lastName, birthDate } = req.body;
      const userId = req.user?.id;
      
      // User bilgilerini güncelle
      if (firstName || lastName) {
        await User.update(
          {
            ...(firstName && { firstName }),
            ...(lastName && { lastName })
          },
          { where: { id: userId } }
        );
      }

      // Student bilgilerini güncelle
      if (birthDate) {
        const student = await Student.findOne({ where: { userId } });
        if (student) {
          await student.update({
            birthDate: new Date(birthDate)
          });
        }
      }

      // Güncellenmiş bilgileri getir
      const updatedUser = await User.findByPk(userId, {
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'role']
      });

      const updatedStudent = await Student.findOne({ 
        where: { userId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username', 'email', 'firstName', 'lastName', 'role']
          }
        ]
      });

      ApiResponse.success(res, { user: updatedUser, student: updatedStudent }, 'Profil başarıyla güncellendi');
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
