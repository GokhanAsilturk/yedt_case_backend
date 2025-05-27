import { Response } from 'express';
import { Op } from 'sequelize';
import StudentController from '../../controllers/studentController';
import Student from '../../models/Student';
import User from '../../models/User';
import Enrollment from '../../models/Enrollment';
import ApiResponse from '../../utils/apiResponse';
import { sequelize } from '../../config/database';

jest.mock('../../models/Student');
jest.mock('../../models/User');
jest.mock('../../models/Enrollment');
jest.mock('../../config/database', () => ({
  sequelize: {
    transaction: jest.fn().mockImplementation(callback => callback())
  }
}));

jest.mock('../../utils/apiResponse', () => ({
  success: jest.fn(),
  error: jest.fn(),
  pagination: jest.fn()
}));

describe('StudentController', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    
    jest.clearAllMocks();
  });

  describe('getAllStudents', () => {
    it('should return paginated students', async () => {
      const mockStudents = [
        { id: 1, firstName: 'John', lastName: 'Doe', userAccount: { username: 'johndoe', email: 'john@example.com' } },
        { id: 2, firstName: 'Jane', lastName: 'Smith', userAccount: { username: 'janesmith', email: 'jane@example.com' } }
      ];
      
      const mockResult = {
        count: 2,
        rows: mockStudents
      };
      
      (Student.findAndCountAll as jest.Mock).mockResolvedValue(mockResult);
      
      const mockRequest = {
        query: {
          page: '1',
          limit: '10'
        }
      };
      
      await StudentController.getAllStudents(mockRequest as any, mockResponse as Response);
      
      expect(Student.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        include: [
          {
            model: User,
            as: 'userAccount',
            attributes: ['username', 'email', 'role']
          }
        ],
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      
      expect(ApiResponse.pagination).toHaveBeenCalledWith(
        mockResponse, 
        mockStudents, 
        1, 
        10, 
        2
      );
    });
    
    it('should apply search filters correctly', async () => {
      const mockStudents = [
        { id: 1, firstName: 'John', lastName: 'Doe', userAccount: { username: 'johndoe', email: 'john@example.com' } }
      ];
      
      const mockResult = {
        count: 1,
        rows: mockStudents
      };
      
      (Student.findAndCountAll as jest.Mock).mockResolvedValue(mockResult);
      
      const mockRequest = {
        query: {
          page: '1',
          limit: '10',
          search: 'john'
        }
      };
      
      await StudentController.getAllStudents(mockRequest as any, mockResponse as Response);
      
      expect(Student.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          [Op.or]: [
            { '$user.username$': { [Op.iLike]: '%john%' } },
            { '$user.email$': { [Op.iLike]: '%john%' } },
            { firstName: { [Op.iLike]: '%john%' } },
            { lastName: { [Op.iLike]: '%john%' } }
          ]
        }
      }));
      
      expect(ApiResponse.pagination).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Student.findAndCountAll as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        query: {
          page: '1',
          limit: '10'
        }
      };
      
      await StudentController.getAllStudents(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('getStudentById', () => {
    it('should return student by id', async () => {
      const mockStudent = { 
        id: 1, 
        firstName: 'John', 
        lastName: 'Doe', 
        userAccount: { username: 'johndoe', email: 'john@example.com' } 
      };
      
      (Student.findByPk as jest.Mock).mockResolvedValue(mockStudent);
      
      const mockRequest = {
        params: {
          id: '1'
        }
      };
      
      await StudentController.getStudentById(mockRequest as any, mockResponse as Response);
      
      expect(Student.findByPk).toHaveBeenCalledWith('1', {
        include: [
          {
            model: User,
            as: 'userAccount',
            attributes: ['username', 'email', 'role']
          }
        ]
      });
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        mockStudent
      );
    });
    
    it('should return 404 when student not found', async () => {
      (Student.findByPk as jest.Mock).mockResolvedValue(null);
      
      const mockRequest = {
        params: {
          id: '999'
        }
      };
      
      await StudentController.getStudentById(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Student not found', 
        404
      );
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Student.findByPk as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        params: {
          id: '1'
        }
      };
      
      await StudentController.getStudentById(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('createStudent', () => {
    it('should create student successfully', async () => {
      const mockUser = { id: 1, username: 'johndoe', email: 'john@example.com', role: 'student' };
      const mockStudent = { id: 1, userId: 1, firstName: 'John', lastName: 'Doe' };
      
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      (Student.create as jest.Mock).mockResolvedValue(mockStudent);
      
      const mockRequest = {
        body: {
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1990-01-01'
        }
      };
      
      await StudentController.createStudent(mockRequest as any, mockResponse as Response);
      
      expect(User.create).toHaveBeenCalledWith({
        username: 'johndoe',
        email: 'john@example.com',
        password: 'password123',
        role: 'student'
      });
      
      expect(Student.create).toHaveBeenCalledWith({
        userId: 1,
        firstName: 'John',
        lastName: 'Doe',
        birthDate: expect.any(Date)
      });
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        { user: mockUser, student: mockStudent }, 
        'Student created successfully', 
        201
      );
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (User.create as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        body: {
          username: 'johndoe',
          email: 'john@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          birthDate: '1990-01-01'
        }
      };
      
      await StudentController.createStudent(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('updateStudent', () => {
    it('should update student successfully', async () => {
      const mockStudent = { 
        id: 1, 
        firstName: 'John', 
        lastName: 'Doe',
        update: jest.fn().mockResolvedValue({ id: 1, firstName: 'Updated', lastName: 'Student' })
      };
      
      (Student.findByPk as jest.Mock).mockResolvedValue(mockStudent);
      
      const mockRequest = {
        params: {
          id: '1'
        },
        body: {
          firstName: 'Updated',
          lastName: 'Student'
        }
      };
      
      await StudentController.updateStudent(mockRequest as any, mockResponse as Response);
      
      expect(Student.findByPk).toHaveBeenCalledWith('1');
      expect(mockStudent.update).toHaveBeenCalledWith({
        firstName: 'Updated',
        lastName: 'Student',
        birthDate: undefined
      });
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        mockStudent, 
        'Student updated successfully'
      );
    });
    
    it('should return 404 when student not found', async () => {
      (Student.findByPk as jest.Mock).mockResolvedValue(null);
      
      const mockRequest = {
        params: {
          id: '999'
        },
        body: {
          firstName: 'Updated',
          lastName: 'Student'
        }
      };
      
      await StudentController.updateStudent(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Student not found', 
        404
      );
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Student.findByPk as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        params: {
          id: '1'
        },
        body: {
          firstName: 'Updated',
          lastName: 'Student'
        }
      };
      
      await StudentController.updateStudent(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('deleteStudent', () => {
    it('should delete student successfully', async () => {
      const mockStudent = { 
        id: 1, 
        userId: 1,
        destroy: jest.fn().mockResolvedValue(undefined)
      };
      
      (Student.findByPk as jest.Mock).mockResolvedValue(mockStudent);
      (Enrollment.destroy as jest.Mock).mockResolvedValue(undefined);
      (User.destroy as jest.Mock).mockResolvedValue(undefined);
      
      const mockRequest = {
        params: {
          id: '1'
        }
      };
      
      await StudentController.deleteStudent(mockRequest as any, mockResponse as Response);
      
      expect(Student.findByPk).toHaveBeenCalledWith('1');
      expect(sequelize.transaction).toHaveBeenCalled();
      expect(Enrollment.destroy).toHaveBeenCalledWith({
        where: { studentId: 1 },
        transaction: expect.anything()
      });
      expect(mockStudent.destroy).toHaveBeenCalled();
      expect(User.destroy).toHaveBeenCalledWith({
        where: { id: 1 },
        transaction: expect.anything()
      });
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        null, 
        'Student deleted successfully'
      );
    });
    
    it('should return 404 when student not found', async () => {
      (Student.findByPk as jest.Mock).mockResolvedValue(null);
      
      const mockRequest = {
        params: {
          id: '999'
        }
      };
      
      await StudentController.deleteStudent(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Student not found', 
        404
      );
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Student.findByPk as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        params: {
          id: '1'
        }
      };
      
      await StudentController.deleteStudent(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
});