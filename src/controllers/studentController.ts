import { Response } from 'express';
import { Op } from 'sequelize';
import Student from '../models/Student';
import User from '../models/User';
import ApiResponse from '../utils/apiResponse';
import {
  TypedRequest,
  PaginationQuery, // Import PaginationQuery
  IdParams, // Import IdParams
  StudentCreateBody, // Import StudentCreateBody
  StudentUpdateBody // Import StudentUpdateBody
} from '../types/express';

const StudentController = {
  // List all students (with pagination and search)
  getAllStudents: async (req: TypedRequest<{}, any, any, PaginationQuery>, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page ?? '1');
      const limit = parseInt(req.query.limit ?? '10');
      const search = req.query.search ?? '';
      const offset = (page - 1) * limit;

      const whereClause = search ? {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { '$User.email$': { [Op.iLike]: `%${search}%` } },
          { '$User.username$': { [Op.iLike]: `%${search}%` } }
        ]
      } : {};

      const { count, rows: students } = await Student.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            attributes: ['username', 'email', 'role']
          }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      ApiResponse.pagination(res, students, page, limit, count);
    } catch (error) {
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  },

  // Get student details by ID
  getStudentById: async (req: TypedRequest<IdParams>, res: Response): Promise<void> => { // Use TypedRequest with IdParams
    try {
      const student = await Student.findByPk(req.params.id, {
        include: [
          {
            model: User,
            attributes: ['username', 'email', 'role']
          }
        ]
      });

      if (!student) {
        ApiResponse.error(res, 'Student not found', 404);
        return;
      }

      ApiResponse.success(res, student);
    } catch (error) {
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  },

  // Create a new student
  createStudent: async (req: TypedRequest<{}, any, StudentCreateBody>, res: Response): Promise<void> => { // Use TypedRequest with StudentCreateBody
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
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  },

  // Update student details
  updateStudent: async (req: TypedRequest<IdParams, any, StudentUpdateBody>, res: Response): Promise<void> => { // Use TypedRequest with IdParams and StudentUpdateBody
    try {
      const { firstName, lastName, birthDate } = req.body;
      const student = await Student.findByPk(req.params.id);

      if (!student) {
        ApiResponse.error(res, 'Student not found', 404);
        return;
      }

      await student.update({
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : undefined // Handle optional birthDate
      });

      ApiResponse.success(res, student, 'Student updated successfully');
    } catch (error) {
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  },

  // Delete a student
  deleteStudent: async (req: TypedRequest<IdParams>, res: Response): Promise<void> => { // Use TypedRequest with IdParams
    try {
      const student = await Student.findByPk(req.params.id);

      if (!student) {
        ApiResponse.error(res, 'Student not found', 404);
        return;
      }

      // Find and delete associated user
      const user = await User.findByPk(student.userId);
      if (user) {
        await user.destroy();
      }

      await student.destroy();
      ApiResponse.success(res, null, 'Student deleted successfully');
    } catch (error) {
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  }
};

export default StudentController;
