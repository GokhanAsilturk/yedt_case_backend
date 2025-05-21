import { Response } from 'express';
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

const CourseController = {
  // List all courses (with pagination and search)
  getAllCourses: async (
    req: CourseListRequest,
    res: Response
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
      if (error instanceof Error) {
        ApiResponse.error(res, error.message);
      } else {
        ApiResponse.error(res, 'An error occurred while fetching courses');
      }
    }
  },

  // Get course details by ID
  getCourseById: async (
    req: CourseGetRequest,
    res: Response
  ): Promise<void> => {
    try {
      const course = await Course.findByPk(req.params.id);
      
      if (!course) {
        ApiResponse.error(res, 'Course not found', 404);
        return;
      }

      ApiResponse.success(res, course);
    } catch (error) {
      if (error instanceof Error) {
        ApiResponse.error(res, error.message);
      } else {
        ApiResponse.error(res, 'An error occurred while fetching the course');
      }
    }
  },

  // Create a new course
  createCourse: async (
    req: CourseCreateRequest,
    res: Response
  ): Promise<void> => {
    try {      const { name, description = '' } = req.body;
      const course = await Course.create({
        name,
        description
      });
      
      ApiResponse.success(res, course, 'Course created successfully', 201);
    } catch (error) {
      if (error instanceof Error) {
        ApiResponse.error(res, error.message);
      } else {
        ApiResponse.error(res, 'An error occurred while creating the course');
      }
    }
  },

  // Update course details
  updateCourse: async (
    req: CourseUpdateRequest,
    res: Response
  ): Promise<void> => {
    try {
      const course = await Course.findByPk(req.params.id);
      
      if (!course) {
        ApiResponse.error(res, 'Course not found', 404);
        return;
      }

      const { name, description } = req.body;
      await course.update({
        name: name ?? course.name,
        description: description ?? course.description
      } as Partial<CourseBody>);
      
      ApiResponse.success(res, course, 'Course updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        ApiResponse.error(res, error.message);
      } else {
        ApiResponse.error(res, 'An error occurred while updating the course');
      }
    }
  },

  // Delete a course
  deleteCourse: async (
    req: CourseGetRequest,
    res: Response
  ): Promise<void> => {
    try {
      const course = await Course.findByPk(req.params.id);
      
      if (!course) {
        ApiResponse.error(res, 'Course not found', 404);
        return;
      }

      await course.destroy();
      ApiResponse.success(res, null, 'Course deleted successfully');
    } catch (error) {
      if (error instanceof Error) {
        ApiResponse.error(res, error.message);
      } else {
        ApiResponse.error(res, 'An error occurred while deleting the course');
      }
    }
  }
};

export default CourseController;
