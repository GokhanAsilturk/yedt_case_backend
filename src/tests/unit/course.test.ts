import { Response } from 'express';
import { Op } from 'sequelize';
import CourseController from '../../controllers/courseController';
import Course from '../../models/Course';
import ApiResponse from '../../utils/apiResponse';

// Mock Course model
jest.mock('../../models/Course');

// Mock ApiResponse
jest.mock('../../utils/apiResponse', () => ({
  success: jest.fn(),
  error: jest.fn(),
  pagination: jest.fn()
}));

describe('CourseController', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    
    // Reset all mocks after each test
    jest.clearAllMocks();
  });

  describe('getAllCourses', () => {
    it('should return paginated courses', async () => {
      // Mock data
      const mockCourses = [
        { id: 1, name: 'Mathematics', description: 'Advanced math course' },
        { id: 2, name: 'Physics', description: 'Introduction to physics' }
      ];
      
      const mockResult = {
        count: 2,
        rows: mockCourses
      };
      
      (Course.findAndCountAll as jest.Mock).mockResolvedValue(mockResult);
      
      const mockRequest = {
        query: {
          page: '1',
          limit: '10'
        }
      };
      
      await CourseController.getAllCourses(mockRequest as any, mockResponse as Response);
      
      expect(Course.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      
      expect(ApiResponse.pagination).toHaveBeenCalledWith(
        mockResponse, 
        mockCourses, 
        1, 
        10, 
        2
      );
    });
    
    it('should apply search filters correctly', async () => {
      // Mock data
      const mockCourses = [
        { id: 1, name: 'Mathematics', description: 'Advanced math course' }
      ];
      
      const mockResult = {
        count: 1,
        rows: mockCourses
      };
      
      (Course.findAndCountAll as jest.Mock).mockResolvedValue(mockResult);
      
      const mockRequest = {
        query: {
          page: '1',
          limit: '10',
          search: 'math'
        }
      };
      
      await CourseController.getAllCourses(mockRequest as any, mockResponse as Response);
      
      expect(Course.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%math%' } },
            { description: { [Op.like]: '%math%' } }
          ]
        }
      }));
      
      expect(ApiResponse.pagination).toHaveBeenCalled();
    });
    
    it('should sanitize search input', async () => {
      (Course.findAndCountAll as jest.Mock).mockResolvedValue({ count: 0, rows: [] });
      
      const mockRequest = {
        query: {
          page: '1',
          limit: '10',
          search: 'math%_'
        }
      };
      
      await CourseController.getAllCourses(mockRequest as any, mockResponse as Response);
      
      // Verify % and _ are escaped in the search
      expect(Course.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
        where: {
          [Op.or]: [
            { name: { [Op.like]: '%math\\%\\__%' } },
            { description: { [Op.like]: '%math\\%\\__%' } }
          ]
        }
      }));
    });
    
    it('should handle errors', async () => {
      // Mock error
      const error = new Error('Database error');
      (Course.findAndCountAll as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        query: {
          page: '1',
          limit: '10'
        }
      };
      
      await CourseController.getAllCourses(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('getCourseById', () => {
    it('should return course by id', async () => {
      // Mock course
      const mockCourse = { 
        id: 1, 
        name: 'Mathematics', 
        description: 'Advanced math course' 
      };
      
      (Course.findByPk as jest.Mock).mockResolvedValue(mockCourse);
      
      const mockRequest = {
        params: {
          id: '1'
        }
      };
      
      await CourseController.getCourseById(mockRequest as any, mockResponse as Response);
      
      expect(Course.findByPk).toHaveBeenCalledWith('1');
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        mockCourse
      );
    });
    
    it('should return 404 when course not found', async () => {
      (Course.findByPk as jest.Mock).mockResolvedValue(null);
      
      const mockRequest = {
        params: {
          id: '999'
        }
      };
      
      await CourseController.getCourseById(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Course not found', 
        404
      );
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Course.findByPk as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        params: {
          id: '1'
        }
      };
      
      await CourseController.getCourseById(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('createCourse', () => {
    it('should create course successfully', async () => {
      // Mock course
      const mockCourse = { 
        id: 1, 
        name: 'New Course', 
        description: 'A brand new course' 
      };
      
      (Course.create as jest.Mock).mockResolvedValue(mockCourse);
      
      const mockRequest = {
        body: {
          name: 'New Course',
          description: 'A brand new course'
        }
      };
      
      await CourseController.createCourse(mockRequest as any, mockResponse as Response);
      
      expect(Course.create).toHaveBeenCalledWith({
        name: 'New Course',
        description: 'A brand new course'
      });
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        mockCourse, 
        'Course created successfully', 
        201
      );
    });
    
    it('should create course with default description when not provided', async () => {
      // Mock course
      const mockCourse = { 
        id: 1, 
        name: 'New Course', 
        description: '' 
      };
      
      (Course.create as jest.Mock).mockResolvedValue(mockCourse);
      
      const mockRequest = {
        body: {
          name: 'New Course'
          // description eksik
        }
      };
      
      await CourseController.createCourse(mockRequest as any, mockResponse as Response);
      
      expect(Course.create).toHaveBeenCalledWith({
        name: 'New Course',
        description: ''
      });
      
      expect(ApiResponse.success).toHaveBeenCalled();
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Course.create as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        body: {
          name: 'New Course',
          description: 'A brand new course'
        }
      };
      
      await CourseController.createCourse(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('updateCourse', () => {
    it('should update course successfully', async () => {
      // Mock course
      const mockCourse = { 
        id: 1, 
        name: 'Old Course', 
        description: 'Old description',
        update: jest.fn().mockResolvedValue({ 
          id: 1, 
          name: 'Updated Course', 
          description: 'Updated description' 
        })
      };
      
      (Course.findByPk as jest.Mock).mockResolvedValue(mockCourse);
      
      const mockRequest = {
        params: {
          id: '1'
        },
        body: {
          name: 'Updated Course',
          description: 'Updated description'
        }
      };
      
      await CourseController.updateCourse(mockRequest as any, mockResponse as Response);
      
      expect(Course.findByPk).toHaveBeenCalledWith('1');
      expect(mockCourse.update).toHaveBeenCalledWith({
        name: 'Updated Course',
        description: 'Updated description'
      });
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        mockCourse, 
        'Course updated successfully'
      );
    });
    
    it('should update only provided fields', async () => {
      // Mock course
      const mockCourse = { 
        id: 1, 
        name: 'Old Course', 
        description: 'Old description',
        update: jest.fn().mockResolvedValue({ 
          id: 1, 
          name: 'Updated Course', 
          description: 'Old description' 
        })
      };
      
      (Course.findByPk as jest.Mock).mockResolvedValue(mockCourse);
      
      const mockRequest = {
        params: {
          id: '1'
        },
        body: {
          name: 'Updated Course'
          // description eksik, güncellenmemeli
        }
      };
      
      await CourseController.updateCourse(mockRequest as any, mockResponse as Response);
      
      expect(mockCourse.update).toHaveBeenCalledWith({
        name: 'Updated Course',
        description: 'Old description'
      });
      
      expect(ApiResponse.success).toHaveBeenCalled();
    });
    
    it('should return 404 when course not found', async () => {
      (Course.findByPk as jest.Mock).mockResolvedValue(null);
      
      const mockRequest = {
        params: {
          id: '999'
        },
        body: {
          name: 'Updated Course'
        }
      };
      
      await CourseController.updateCourse(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Course not found', 
        404
      );
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Course.findByPk as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        params: {
          id: '1'
        },
        body: {
          name: 'Updated Course'
        }
      };
      
      await CourseController.updateCourse(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
  
  describe('deleteCourse', () => {
    it('should delete course successfully', async () => {
      // Mock course
      const mockCourse = { 
        id: 1, 
        name: 'Course to Delete',
        destroy: jest.fn().mockResolvedValue(undefined)
      };
      
      (Course.findByPk as jest.Mock).mockResolvedValue(mockCourse);
      
      const mockRequest = {
        params: {
          id: '1'
        }
      };
      
      await CourseController.deleteCourse(mockRequest as any, mockResponse as Response);
      
      expect(Course.findByPk).toHaveBeenCalledWith('1');
      expect(mockCourse.destroy).toHaveBeenCalled();
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse, 
        null, 
        'Course deleted successfully'
      );
    });
    
    it('should return 404 when course not found', async () => {
      (Course.findByPk as jest.Mock).mockResolvedValue(null);
      
      const mockRequest = {
        params: {
          id: '999'
        }
      };
      
      await CourseController.deleteCourse(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Course not found', 
        404
      );
    });
    
    it('should handle errors', async () => {
      const error = new Error('Database error');
      (Course.findByPk as jest.Mock).mockRejectedValue(error);
      
      const mockRequest = {
        params: {
          id: '1'
        }
      };
      
      await CourseController.deleteCourse(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse, 
        'Database error'
      );
    });
  });
});