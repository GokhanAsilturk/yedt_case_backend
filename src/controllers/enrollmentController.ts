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

// Utility function to add delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility function for retry mechanism
const retryOperation = async <T>(
  operation: () => Promise<T>,
  retries = 3,
  delayMs = 100
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(delayMs * (i + 1)); // Exponential backoff
    }
  }
  throw new Error('Max retries exceeded');
};

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

      // Use retry mechanism to find student and course
      const [student, course] = await retryOperation(async () => {
        const student = await Student.findOne({ where: { userId } });
        if (!student) {
          throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
        }

        const course = await Course.findByPk(courseId);
        if (!course) {
          throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
        }

        return [student, course];
      });

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

      // Use retry mechanism for better reliability
      const [student, enrollment] = await retryOperation(async () => {
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

        return [student, enrollment];
      });

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

  // Öğrenci kayıtlarını getiren endpoint - studentId kullanarak
  getStudentEnrollments: async (
    req: TypedRequest<IdParams>,
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const studentId = req.params.id;
      
      // Öğrencinin varlığını kontrol et
      const student = await Student.findByPk(studentId);
      if (!student) {
        res.status(404).json({ message: 'Öğrenci bulunamadı' });
        return;
      }
        // Öğrenciye ait kayıtları getir
      const enrollments = await Enrollment.findAll({
        where: { studentId },
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'name', 'description']
          }
        ]
      });
      
      ApiResponse.success(res, enrollments, 'Öğrenci kayıtları başarıyla alındı');    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
        ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
      } else {
        ApiResponse.error(res, error instanceof Error ? error.message : 'Öğrenci kayıtları getirilirken bir hata oluştu', 500);
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

      // Check if student and course exist with retry mechanism
      const [student, course] = await retryOperation(async () => {
        const [student, course] = await Promise.all([
          Student.findByPk(studentId),
          Course.findByPk(courseId)
        ]);

        if (!student) {
          throw new AppError('Öğrenci bulunamadı', 404, ErrorCode.NOT_FOUND);
        }

        if (!course) {
          throw new AppError('Kurs bulunamadı', 404, ErrorCode.NOT_FOUND);
        }

        return [student, course];
      });

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
  deleteEnrollment: async (
    req: TypedRequest<IdParams>, 
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      // Use retry mechanism for better reliability
      const enrollment = await retryOperation(async () => {
        const enrollment = await Enrollment.findByPk(req.params.id);

        if (!enrollment) {
          throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
        }

        return enrollment;
      });

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
  },

   getEnrollmentById: async (
    req: TypedRequest<IdParams>,
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Use retry mechanism to handle race conditions
      const enrollment = await retryOperation(async () => {
        const enrollment = await Enrollment.findByPk(id, {
          include: [
            { model: Student, as: 'student' },
            { model: Course, as: 'course' }
          ]
        });
        
        if (!enrollment) {
          throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
        }
        
        return enrollment;
      });
      
      ApiResponse.success(res, enrollment, 'Kayıt başarıyla getirildi');
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
        ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
      } else {
        ApiResponse.error(res, error instanceof Error ? error.message : 'Kayıt getirilirken bir hata oluştu', 500);
      }
    }
  },
  // Update enrollment (new method to handle PUT requests)
  updateEnrollment: async (
    req: TypedRequest<IdParams, any, Partial<EnrollmentBody>>,
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      
      // Increased retry delay for better reliability
      const enrollment = await retryOperation(async () => {
        // Add a small delay before the first attempt
        await delay(50);
        
        const enrollment = await Enrollment.findByPk(id, {
          include: [
            { model: Student, as: 'student' },
            { model: Course, as: 'course' }
          ]
        });
        
        if (!enrollment) {
          throw new AppError('Kayıt bulunamadı', 404, ErrorCode.NOT_FOUND);
        }
        
        return enrollment;
      }, 5, 200); // Increased retries and delay

      // For enrollment updates, we might want to update enrollment date or other fields
      const { studentId, courseId } = req.body;
      
      const updateData: any = {};
      
      // Validate and prepare update data
      if (studentId && studentId !== enrollment.studentId) {
        // Use retry mechanism to verify new student exists
        const student = await retryOperation(async () => {
          const student = await Student.findByPk(studentId);
          if (!student) {
            throw new AppError('Öğrenci bulunamadı', 404, ErrorCode.NOT_FOUND);
          }
          return student;
        }, 3, 100);
        updateData.studentId = studentId;
      }
      
      if (courseId && courseId !== enrollment.courseId) {
        // Use retry mechanism to verify new course exists
        const course = await retryOperation(async () => {
          const course = await Course.findByPk(courseId);
          if (!course) {
            throw new AppError('Kurs bulunamadı', 404, ErrorCode.NOT_FOUND);
          }
          return course;
        }, 3, 100);
        updateData.courseId = courseId;
      }

      // Update enrollment if there are changes
      if (Object.keys(updateData).length > 0) {
        await enrollment.update(updateData);
        // Small delay after update to ensure data consistency
        await delay(100);
      }

      // Return updated enrollment with includes using retry mechanism
      const updatedEnrollment = await retryOperation(async () => {
        const updatedEnrollment = await Enrollment.findByPk(id, {
          include: [
            { model: Student, as: 'student' },
            { model: Course, as: 'course' }
          ]
        });
        
        if (!updatedEnrollment) {
          throw new AppError('Güncellenmiş kayıt bulunamadı', 404, ErrorCode.NOT_FOUND);
        }
        
        return updatedEnrollment;
      }, 3, 150);

      ApiResponse.success(res, updatedEnrollment, 'Kayıt başarıyla güncellendi');
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
        ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
      } else {
        ApiResponse.error(res, error instanceof Error ? error.message : 'Kayıt güncellenirken bir hata oluştu', 500);
      }
    }
  }
};

export default EnrollmentController;
