import { Response } from 'express';
import EnrollmentController from '../../controllers/enrollmentController';
import Enrollment from '../../models/Enrollment';
import Student from '../../models/Student';
import Course from '../../models/Course';
import ApiResponse from '../../utils/apiResponse';

// Mock models
jest.mock('../../models/Enrollment');
jest.mock('../../models/Student');
jest.mock('../../models/Course');

// Mock ApiResponse
jest.mock('../../utils/apiResponse', () => ({
  success: jest.fn(),
  error: jest.fn(),
  pagination: jest.fn()
}));

describe('EnrollmentController', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    
    // Reset all mocks after each test
    jest.clearAllMocks();
  });

  describe('getAllEnrollments', () => {
    it('should return paginated enrollments', async () => {
      // Mock data
      const mockEnrollments = [
        { id: 1, studentId: 1, courseId: 1, student: { firstName: 'John' }, course: { name: 'Math' } },
        { id: 2, studentId: 2, courseId: 2, student: { firstName: 'Jane' }, course: { name: 'Physics' } }
      ];
      
      const mockResult = {
        count: 2,
        rows: mockEnrollments
      };
      
      (Enrollment.findAndCountAll as jest.Mock).mockResolvedValue(mockResult);
      
      const mockRequest = {
        query: {
          page: '1',
          limit: '10'
        }
      };
      
      await EnrollmentController.getAllEnrollments(mockRequest as any, mockResponse as Response);
      
      expect(Enrollment.findAndCountAll).toHaveBeenCalledWith({
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
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      
      expect(ApiResponse.pagination).toHaveBeenCalledWith(
        mockResponse, 
        mockEnrollments, 
        1, 
        10, 
        2
      );
    });
    
    it('should handle errors', async () => {
      // Mock error
      const error = new Error('Database error');
      (Enrollment.findAndCountAll as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        query: {
          page: '1',
          limit: '10'
        }
      };
      
      await EnrollmentController.getAllEnrollments(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('enrollCourse', () => {
    it('should enroll a student in a course', async () => {
      // Mock data
      const mockStudent = { id: 1, firstName: 'John', lastName: 'Doe' };
      const mockCourse = { id: 1, name: 'Mathematics' };
      const mockEnrollment = { 
        id: 1, 
        studentId: 1, 
        courseId: 1, 
        enrollmentDate: new Date() 
      };
      
      (Student.findOne as jest.Mock).mockResolvedValue(mockStudent);
      (Course.findByPk as jest.Mock).mockResolvedValue(mockCourse);
      (Enrollment.findOne as jest.Mock).mockResolvedValue(null); // No existing enrollment
      (Enrollment.create as jest.Mock).mockResolvedValue(mockEnrollment);
      
      const mockRequest = {
        user: { id: 1 },
        params: {
          courseId: '1'
        }
      };
      
      await EnrollmentController.enrollCourse(mockRequest as any, mockResponse as Response);
      
      expect(Student.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(Course.findByPk).toHaveBeenCalledWith('1');
      expect(Enrollment.findOne).toHaveBeenCalledWith({
        where: { studentId: 1, courseId: '1' }
      });
      expect(Enrollment.create).toHaveBeenCalledWith({
        studentId: 1,
        courseId: '1',
        enrollmentDate: expect.any(Date)
      });
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        mockEnrollment, 
        'Enrolled successfully', 
        201
      );
    });
    
    it('should return error when student not found', async () => {
      (Student.findOne as jest.Mock).mockResolvedValue(null);
      
      const mockRequest = {
        user: { id: 1 },
        params: {
          courseId: '1'
        }
      };
      
      await EnrollmentController.enrollCourse(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Student not found', 
        404
      );
      expect(Enrollment.create).not.toHaveBeenCalled();
    });
    
    it('should return error when course not found', async () => {
      const mockStudent = { id: 1, firstName: 'John', lastName: 'Doe' };
      
      (Student.findOne as jest.Mock).mockResolvedValue(mockStudent);
      (Course.findByPk as jest.Mock).mockResolvedValue(null);
      
      const mockRequest = {
        user: { id: 1 },
        params: {
          courseId: '1'
        }
      };
      
      await EnrollmentController.enrollCourse(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Course not found', 
        404
      );
      expect(Enrollment.create).not.toHaveBeenCalled();
    });
    
    it('should return error when already enrolled', async () => {
      const mockStudent = { id: 1, firstName: 'John', lastName: 'Doe' };
      const mockCourse = { id: 1, name: 'Mathematics' };
      const existingEnrollment = { id: 1, studentId: 1, courseId: 1 };
      
      (Student.findOne as jest.Mock).mockResolvedValue(mockStudent);
      (Course.findByPk as jest.Mock).mockResolvedValue(mockCourse);
      (Enrollment.findOne as jest.Mock).mockResolvedValue(existingEnrollment);
      
      const mockRequest = {
        user: { id: 1 },
        params: {
          courseId: '1'
        }
      };
      
      await EnrollmentController.enrollCourse(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Already enrolled in this course', 
        400
      );
      expect(Enrollment.create).not.toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Student.findOne as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        user: { id: 1 },
        params: {
          courseId: '1'
        }
      };
      
      await EnrollmentController.enrollCourse(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('withdrawCourse', () => {
    it('should withdraw a student from a course', async () => {
      // Mock data
      const mockStudent = { id: 1, firstName: 'John', lastName: 'Doe' };
      const mockEnrollment = { 
        id: 1, 
        studentId: 1, 
        courseId: 1,
        destroy: jest.fn().mockResolvedValue(undefined)
      };
      
      (Student.findOne as jest.Mock).mockResolvedValue(mockStudent);
      (Enrollment.findOne as jest.Mock).mockResolvedValue(mockEnrollment);
      
      const mockRequest = {
        user: { id: 1 },
        params: {
          courseId: '1'
        }
      };
      
      await EnrollmentController.withdrawCourse(mockRequest as any, mockResponse as Response);
      
      expect(Student.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
      expect(Enrollment.findOne).toHaveBeenCalledWith({
        where: { studentId: 1, courseId: '1' }
      });
      expect(mockEnrollment.destroy).toHaveBeenCalled();
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        null, 
        'Withdrawn successfully'
      );
    });
    
    it('should return error when student not found', async () => {
      (Student.findOne as jest.Mock).mockResolvedValue(null);
      
      const mockRequest = {
        user: { id: 1 },
        params: {
          courseId: '1'
        }
      };
      
      await EnrollmentController.withdrawCourse(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Student not found', 
        404
      );
    });
    
    it('should return error when enrollment not found', async () => {
      const mockStudent = { id: 1, firstName: 'John', lastName: 'Doe' };
      
      (Student.findOne as jest.Mock).mockResolvedValue(mockStudent);
      (Enrollment.findOne as jest.Mock).mockResolvedValue(null);
      
      const mockRequest = {
        user: { id: 1 },
        params: {
          courseId: '1'
        }
      };
      
      await EnrollmentController.withdrawCourse(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Enrollment not found', 
        404
      );
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Student.findOne as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        user: { id: 1 },
        params: {
          courseId: '1'
        }
      };
      
      await EnrollmentController.withdrawCourse(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('getStudentEnrollments', () => {
    it('should return enrollments for a student', async () => {
      // Mock data
      const mockEnrollments = [
        { id: 1, studentId: 1, courseId: 1, course: { name: 'Math' } },
        { id: 2, studentId: 1, courseId: 2, course: { name: 'Physics' } }
      ];
      
      (Enrollment.findAll as jest.Mock).mockResolvedValue(mockEnrollments);
      
      const mockRequest = {
        params: {
          id: '1' // studentId
        }
      };
      
      await EnrollmentController.getStudentEnrollments(mockRequest as any, mockResponse as Response);
      
      expect(Enrollment.findAll).toHaveBeenCalledWith({
        where: { studentId: '1' },
        include: [
          {
            model: Course,
            as: 'course'
          }
        ]
      });
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        mockEnrollments
      );
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Enrollment.findAll as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        params: {
          id: '1'
        }
      };
      
      await EnrollmentController.getStudentEnrollments(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('getCourseEnrollments', () => {
    it('should return enrollments for a course', async () => {
      // Mock data
      const mockEnrollments = [
        { id: 1, studentId: 1, courseId: 1, student: { firstName: 'John' } },
        { id: 2, studentId: 2, courseId: 1, student: { firstName: 'Jane' } }
      ];
      
      (Enrollment.findAll as jest.Mock).mockResolvedValue(mockEnrollments);
      
      const mockRequest = {
        params: {
          id: '1' // courseId
        }
      };
      
      await EnrollmentController.getCourseEnrollments(mockRequest as any, mockResponse as Response);
      
      expect(Enrollment.findAll).toHaveBeenCalledWith({
        where: { courseId: '1' },
        include: [
          {
            model: Student,
            as: 'student'
          }
        ]
      });
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        mockEnrollments
      );
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Enrollment.findAll as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        params: {
          id: '1'
        }
      };
      
      await EnrollmentController.getCourseEnrollments(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('createEnrollment', () => {
    it('should create a new enrollment', async () => {
      // Mock data
      const mockStudent = { id: 1, firstName: 'John' };
      const mockCourse = { id: 1, name: 'Mathematics' };
      const mockEnrollment = { 
        id: 1, 
        studentId: '1', 
        courseId: '1', 
        enrollmentDate: new Date() 
      };
      
      (Enrollment.findOne as jest.Mock).mockResolvedValue(null); // No existing enrollment
      (Student.findByPk as jest.Mock).mockResolvedValue(mockStudent);
      (Course.findByPk as jest.Mock).mockResolvedValue(mockCourse);
      (Enrollment.create as jest.Mock).mockResolvedValue(mockEnrollment);
      
      const mockRequest = {
        body: {
          studentId: '1',
          courseId: '1'
        }
      };
      
      await EnrollmentController.createEnrollment(mockRequest as any, mockResponse as Response);
      
      expect(Enrollment.findOne).toHaveBeenCalledWith({
        where: { studentId: '1', courseId: '1' }
      });
      expect(Student.findByPk).toHaveBeenCalledWith('1');
      expect(Course.findByPk).toHaveBeenCalledWith('1');
      expect(Enrollment.create).toHaveBeenCalledWith({
        studentId: '1',
        courseId: '1',
        enrollmentDate: expect.any(Date)
      });
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        mockEnrollment, 
        'Enrollment created successfully', 
        201
      );
    });
    
    it('should return error when enrollment already exists', async () => {
      const existingEnrollment = { id: 1, studentId: '1', courseId: '1' };
      
      (Enrollment.findOne as jest.Mock).mockResolvedValue(existingEnrollment);
      
      const mockRequest = {
        body: {
          studentId: '1',
          courseId: '1'
        }
      };
      
      await EnrollmentController.createEnrollment(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Student is already enrolled in this course', 
        400
      );
      expect(Enrollment.create).not.toHaveBeenCalled();
    });
    
    it('should return error when student not found', async () => {
      (Enrollment.findOne as jest.Mock).mockResolvedValue(null);
      (Student.findByPk as jest.Mock).mockResolvedValue(null);
      
      const mockRequest = {
        body: {
          studentId: '999',
          courseId: '1'
        }
      };
      
      await EnrollmentController.createEnrollment(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Student not found', 
        404
      );
      expect(Enrollment.create).not.toHaveBeenCalled();
    });
    
    it('should return error when course not found', async () => {
      const mockStudent = { id: 1, firstName: 'John' };
      
      (Enrollment.findOne as jest.Mock).mockResolvedValue(null);
      (Student.findByPk as jest.Mock).mockResolvedValue(mockStudent);
      (Course.findByPk as jest.Mock).mockResolvedValue(null);
      
      const mockRequest = {
        body: {
          studentId: '1',
          courseId: '999'
        }
      };
      
      await EnrollmentController.createEnrollment(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Course not found', 
        404
      );
      expect(Enrollment.create).not.toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Enrollment.findOne as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        body: {
          studentId: '1',
          courseId: '1'
        }
      };
      
      await EnrollmentController.createEnrollment(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('deleteEnrollment', () => {
    it('should delete an enrollment', async () => {
      // Mock data
      const mockEnrollment = { 
        id: 1,
        destroy: jest.fn().mockResolvedValue(undefined)
      };
      
      (Enrollment.findByPk as jest.Mock).mockResolvedValue(mockEnrollment);
      
      const mockRequest = {
        params: {
          id: '1'
        }
      };
      
      await EnrollmentController.deleteEnrollment(mockRequest as any, mockResponse as Response);
      
      expect(Enrollment.findByPk).toHaveBeenCalledWith('1');
      expect(mockEnrollment.destroy).toHaveBeenCalled();
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        null, 
        'Enrollment deleted successfully'
      );
    });
    
    it('should return error when enrollment not found', async () => {
      (Enrollment.findByPk as jest.Mock).mockResolvedValue(null);
      
      const mockRequest = {
        params: {
          id: '999'
        }
      };
      
      await EnrollmentController.deleteEnrollment(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Enrollment not found', 
        404
      );
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Enrollment.findByPk as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        params: {
          id: '1'
        }
      };
      
      await EnrollmentController.deleteEnrollment(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
});