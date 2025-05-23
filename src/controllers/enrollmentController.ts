import { Response, NextFunction } from 'express';
import Student from '../models/Student';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import ApiResponse from '../utils/apiResponse';
import {
  TypedRequest,
  PaginationQuery,
  IdParams,
  EnrollmentBody
} from '../types/express';
import { AppError } from '../error/models/AppError';
import { ErrorCode } from '../error/constants/errorCodes';
import { ErrorMessage } from '../error/constants/errorMessages';

const EnrollmentController = {
  // List all enrollments (with pagination)
  getAllEnrollments: async (
    req: TypedRequest<{}, any, any, PaginationQuery>,
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page ?? '1');
      const limit = parseInt(req.query.limit ?? '10');
      const offset = (page - 1) * limit;

      const { count, rows: enrollments } = await Enrollment.findAndCountAll({
        include: [
          {
            model: Student,
            as: 'student'
          },
          {
            model: Course,
            as: 'course'
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      ApiResponse.pagination(res, enrollments, page, limit, count);
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

  // Enroll logged-in student to a course
  enrollCourse: async (
    req: TypedRequest<{ courseId: string }>,
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { courseId } = req.params;

      const student = await Student.findOne({ where: { userId } });
      if (!student) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      const existingEnrollment = await Enrollment.findOne({
        where: { studentId: student.id, courseId }
      });

      if (existingEnrollment) {
        throw new AppError('Bu kursa zaten kayıtlısınız', 400, ErrorCode.CONFLICT);
      }

      const enrollment = await Enrollment.create({
        studentId: student.id,
        courseId,
        enrollmentDate: new Date()
      });

      ApiResponse.success(res, enrollment, 'Enrolled successfully', 201);
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Kayıt işlemi sırasında bir hata oluştu', 500);
        }
    }
  },

  // Withdraw logged-in student from a course
  withdrawCourse: async (
    req: TypedRequest<{ courseId: string }>,
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const { courseId } = req.params;

      const student = await Student.findOne({ where: { userId } });
      if (!student) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      const enrollment = await Enrollment.findOne({
        where: { studentId: student.id, courseId }
      });

      if (!enrollment) {
        throw new AppError('Kayıt bulunamadı', 404, ErrorCode.NOT_FOUND);
      }

      await enrollment.destroy();

      ApiResponse.success(res, null, 'Withdrawn successfully');
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Kayıt silme işlemi sırasında bir hata oluştu', 500);
        }
    }
  },

  getStudentEnrollments: async (
    req: TypedRequest<IdParams>,
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const { id: studentId } = req.params;
      const enrollments = await Enrollment.findAll({
        where: { studentId },
        include: [
          {
            model: Course,
            as: 'course'
          }
        ]
      });

      ApiResponse.success(res, enrollments);
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Öğrenci kayıtları alınırken bir hata oluştu', 500);
        }
    }
  },

  // Get course enrollments
  getCourseEnrollments: async (
    req: TypedRequest<IdParams>, // Use TypedRequest with IdParams
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const { id: courseId } = req.params;
      const enrollments = await Enrollment.findAll({
        where: { courseId },
        include: [
          {
            model: Student,
            as: 'student'
          }
        ]
      });

      ApiResponse.success(res, enrollments);
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Kurs kayıtları alınırken bir hata oluştu', 500);
        }
    }
  },

  // Create a new enrollment
  createEnrollment: async (
    req: TypedRequest<{}, any, EnrollmentBody>, // Use TypedRequest with EnrollmentBody
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const { studentId, courseId } = req.body;

      // Check if enrollment already exists
      const existingEnrollment = await Enrollment.findOne({
        where: { studentId, courseId }
      });

      if (existingEnrollment) {
        throw new AppError('Öğrenci bu kursa zaten kayıtlı', 400, ErrorCode.CONFLICT);
      }

      // Check if student and course exist
      const [student, course] = await Promise.all([
        Student.findByPk(studentId),
        Course.findByPk(courseId)
      ]);

      if (!student) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      if (!course) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      const enrollment = await Enrollment.create({
        studentId,
        courseId,
        enrollmentDate: new Date()
      });

      ApiResponse.success(res, enrollment, 'Enrollment created successfully', 201);
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Kayıt oluşturulurken bir hata oluştu', 500);
        }
    }
  },

  // Delete an enrollment
  deleteEnrollment: async (
    req: TypedRequest<IdParams>, // Use TypedRequest with IdParams
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const enrollment = await Enrollment.findByPk(req.params.id);

      if (!enrollment) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      await enrollment.destroy();
      ApiResponse.success(res, null, 'Enrollment deleted successfully');
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Kayıt silinirken bir hata oluştu', 500);
        }
    }
  }
};

export default EnrollmentController;
