import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import Course from '../models/Course';
import ApiResponse from '../utils/apiResponse';
import {
  CourseCreateRequest,
  CourseUpdateRequest,
  CourseGetRequest,
  CourseListRequest,
  CourseBody
} from '../types/express';
import { AppError } from '../error/models/AppError';
import { ErrorCode } from '../error/constants/errorCodes';
import { ErrorMessage } from '../error/constants/errorMessages';

const CourseController = {
  // List all courses (with pagination and search)
  getAllCourses: async (
    req: CourseListRequest,
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const page = parseInt(req.query.page ?? '1');
      const limit = parseInt(req.query.limit ?? '10');
      const search = req.query.search ?? '';
      const offset = (page - 1) * limit;

      const sanitizedSearch = typeof search === 'string' ? search.replace(/[%_]/g, '\\$&') : '';
      const whereClause = sanitizedSearch
        ? {
            [Op.or]: [
              { name: { [Op.like]: `%${sanitizedSearch}%` } },
              { description: { [Op.like]: `%${sanitizedSearch}%` } }
            ]
          }
        : {};

      const { count, rows: courses } = await Course.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      ApiResponse.pagination(res, courses, page, limit, count);
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

  // Get course details by ID
  getCourseById: async (
    req: CourseGetRequest,
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const course = await Course.findByPk(req.params.id);
      
      if (!course) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      ApiResponse.success(res, course);
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Kurs alınırken bir hata oluştu', 500);
        }
    }
  },

  // Create a new course
  createCourse: async (
    req: CourseCreateRequest,
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {      const { name, description = '' } = req.body;
      const course = await Course.create({
        name,
        description
      });
      
      ApiResponse.success(res, course, 'Course created successfully', 201);
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Kurs oluşturulurken bir hata oluştu', 500);
        }
    }
  },

  // Update course details
  updateCourse: async (
    req: CourseUpdateRequest,
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const course = await Course.findByPk(req.params.id);
      
      if (!course) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      const { name, description } = req.body;
      await course.update({
        name: name ?? course.name,
        description: description ?? course.description
      } as Partial<CourseBody>);
      
      ApiResponse.success(res, course, 'Course updated successfully');
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Kurs güncellenirken bir hata oluştu', 500);
        }
    }
  },

  // Delete a course
  deleteCourse: async (
    req: CourseGetRequest,
    res: Response,
    next?: NextFunction
  ): Promise<void> => {
    try {
      const course = await Course.findByPk(req.params.id);
      
      if (!course) {
        throw new AppError(ErrorMessage.NOT_FOUND.tr, 404, ErrorCode.NOT_FOUND);
      }

      await course.destroy();
      ApiResponse.success(res, null, 'Course deleted successfully');
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Kurs silinirken bir hata oluştu', 500);
        }
    }
  }
};

export default CourseController;
