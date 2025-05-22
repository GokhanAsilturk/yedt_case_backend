import { Response } from 'express';
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

const EnrollmentController = {
  // List all enrollments (with pagination)
  getAllEnrollments: async (
    req: TypedRequest<{}, any, any, PaginationQuery>,
    res: Response
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
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  },

  getStudentEnrollments: async (
    req: TypedRequest<IdParams>,
    res: Response
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
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  },

  // Get course enrollments
  getCourseEnrollments: async (
    req: TypedRequest<IdParams>, // Use TypedRequest with IdParams
    res: Response
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
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  },

  // Create a new enrollment
  createEnrollment: async (
    req: TypedRequest<{}, any, EnrollmentBody>, // Use TypedRequest with EnrollmentBody
    res: Response
  ): Promise<void> => {
    try {
      const { studentId, courseId } = req.body;

      // Check if enrollment already exists
      const existingEnrollment = await Enrollment.findOne({
        where: { studentId, courseId }
      });

      if (existingEnrollment) {
        ApiResponse.error(res, 'Student is already enrolled in this course', 400);
        return;
      }

      // Check if student and course exist
      const [student, course] = await Promise.all([
        Student.findByPk(studentId),
        Course.findByPk(courseId)
      ]);

      if (!student) {
        ApiResponse.error(res, 'Student not found', 404);
        return;
      }

      if (!course) {
        ApiResponse.error(res, 'Course not found', 404);
        return;
      }

      const enrollment = await Enrollment.create({
        studentId,
        courseId,
        enrollmentDate: new Date()
      });

      ApiResponse.success(res, enrollment, 'Enrollment created successfully', 201);
    } catch (error) {
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  },

  // Delete an enrollment
  deleteEnrollment: async (
    req: TypedRequest<IdParams>, // Use TypedRequest with IdParams
    res: Response
  ): Promise<void> => {
    try {
      const enrollment = await Enrollment.findByPk(req.params.id);

      if (!enrollment) {
        ApiResponse.error(res, 'Enrollment not found', 404);
        return;
      }

      await enrollment.destroy();
      ApiResponse.success(res, null, 'Enrollment deleted successfully');
    } catch (error) {
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  }
};

export default EnrollmentController;
