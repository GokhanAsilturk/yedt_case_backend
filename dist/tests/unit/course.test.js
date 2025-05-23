"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const courseController_1 = __importDefault(require("../../controllers/courseController"));
const Course_1 = __importDefault(require("../../models/Course"));
const apiResponse_1 = __importDefault(require("../../utils/apiResponse"));
// Mock Course model
jest.mock('../../models/Course');
// Mock ApiResponse
jest.mock('../../utils/apiResponse', () => ({
    success: jest.fn(),
    error: jest.fn(),
    pagination: jest.fn()
}));
describe('CourseController', () => {
    let mockResponse;
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
            Course_1.default.findAndCountAll.mockResolvedValue(mockResult);
            const mockRequest = {
                query: {
                    page: '1',
                    limit: '10'
                }
            };
            await courseController_1.default.getAllCourses(mockRequest, mockResponse);
            expect(Course_1.default.findAndCountAll).toHaveBeenCalledWith({
                where: {},
                limit: 10,
                offset: 0,
                order: [['createdAt', 'DESC']]
            });
            expect(apiResponse_1.default.pagination).toHaveBeenCalledWith(mockResponse, mockCourses, 1, 10, 2);
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
            Course_1.default.findAndCountAll.mockResolvedValue(mockResult);
            const mockRequest = {
                query: {
                    page: '1',
                    limit: '10',
                    search: 'math'
                }
            };
            await courseController_1.default.getAllCourses(mockRequest, mockResponse);
            expect(Course_1.default.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    [sequelize_1.Op.or]: [
                        { name: { [sequelize_1.Op.like]: '%math%' } },
                        { description: { [sequelize_1.Op.like]: '%math%' } }
                    ]
                }
            }));
            expect(apiResponse_1.default.pagination).toHaveBeenCalled();
        });
        it('should sanitize search input', async () => {
            Course_1.default.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });
            const mockRequest = {
                query: {
                    page: '1',
                    limit: '10',
                    search: 'math%_'
                }
            };
            await courseController_1.default.getAllCourses(mockRequest, mockResponse);
            // Verify % and _ are escaped in the search
            expect(Course_1.default.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    [sequelize_1.Op.or]: [
                        { name: { [sequelize_1.Op.like]: '%math\\%\\__%' } },
                        { description: { [sequelize_1.Op.like]: '%math\\%\\__%' } }
                    ]
                }
            }));
        });
        it('should handle errors', async () => {
            // Mock error
            const error = new Error('Database error');
            Course_1.default.findAndCountAll.mockRejectedValue(error);
            const mockRequest = {
                query: {
                    page: '1',
                    limit: '10'
                }
            };
            await courseController_1.default.getAllCourses(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
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
            Course_1.default.findByPk.mockResolvedValue(mockCourse);
            const mockRequest = {
                params: {
                    id: '1'
                }
            };
            await courseController_1.default.getCourseById(mockRequest, mockResponse);
            expect(Course_1.default.findByPk).toHaveBeenCalledWith('1');
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, mockCourse);
        });
        it('should return 404 when course not found', async () => {
            Course_1.default.findByPk.mockResolvedValue(null);
            const mockRequest = {
                params: {
                    id: '999'
                }
            };
            await courseController_1.default.getCourseById(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Course not found', 404);
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Course_1.default.findByPk.mockRejectedValue(error);
            const mockRequest = {
                params: {
                    id: '1'
                }
            };
            await courseController_1.default.getCourseById(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
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
            Course_1.default.create.mockResolvedValue(mockCourse);
            const mockRequest = {
                body: {
                    name: 'New Course',
                    description: 'A brand new course'
                }
            };
            await courseController_1.default.createCourse(mockRequest, mockResponse);
            expect(Course_1.default.create).toHaveBeenCalledWith({
                name: 'New Course',
                description: 'A brand new course'
            });
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, mockCourse, 'Course created successfully', 201);
        });
        it('should create course with default description when not provided', async () => {
            // Mock course
            const mockCourse = {
                id: 1,
                name: 'New Course',
                description: ''
            };
            Course_1.default.create.mockResolvedValue(mockCourse);
            const mockRequest = {
                body: {
                    name: 'New Course'
                    // description eksik
                }
            };
            await courseController_1.default.createCourse(mockRequest, mockResponse);
            expect(Course_1.default.create).toHaveBeenCalledWith({
                name: 'New Course',
                description: ''
            });
            expect(apiResponse_1.default.success).toHaveBeenCalled();
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Course_1.default.create.mockRejectedValue(error);
            const mockRequest = {
                body: {
                    name: 'New Course',
                    description: 'A brand new course'
                }
            };
            await courseController_1.default.createCourse(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
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
            Course_1.default.findByPk.mockResolvedValue(mockCourse);
            const mockRequest = {
                params: {
                    id: '1'
                },
                body: {
                    name: 'Updated Course',
                    description: 'Updated description'
                }
            };
            await courseController_1.default.updateCourse(mockRequest, mockResponse);
            expect(Course_1.default.findByPk).toHaveBeenCalledWith('1');
            expect(mockCourse.update).toHaveBeenCalledWith({
                name: 'Updated Course',
                description: 'Updated description'
            });
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, mockCourse, 'Course updated successfully');
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
            Course_1.default.findByPk.mockResolvedValue(mockCourse);
            const mockRequest = {
                params: {
                    id: '1'
                },
                body: {
                    name: 'Updated Course'
                    // description eksik, güncellenmemeli
                }
            };
            await courseController_1.default.updateCourse(mockRequest, mockResponse);
            expect(mockCourse.update).toHaveBeenCalledWith({
                name: 'Updated Course',
                description: 'Old description'
            });
            expect(apiResponse_1.default.success).toHaveBeenCalled();
        });
        it('should return 404 when course not found', async () => {
            Course_1.default.findByPk.mockResolvedValue(null);
            const mockRequest = {
                params: {
                    id: '999'
                },
                body: {
                    name: 'Updated Course'
                }
            };
            await courseController_1.default.updateCourse(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Course not found', 404);
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Course_1.default.findByPk.mockRejectedValue(error);
            const mockRequest = {
                params: {
                    id: '1'
                },
                body: {
                    name: 'Updated Course'
                }
            };
            await courseController_1.default.updateCourse(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
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
            Course_1.default.findByPk.mockResolvedValue(mockCourse);
            const mockRequest = {
                params: {
                    id: '1'
                }
            };
            await courseController_1.default.deleteCourse(mockRequest, mockResponse);
            expect(Course_1.default.findByPk).toHaveBeenCalledWith('1');
            expect(mockCourse.destroy).toHaveBeenCalled();
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, null, 'Course deleted successfully');
        });
        it('should return 404 when course not found', async () => {
            Course_1.default.findByPk.mockResolvedValue(null);
            const mockRequest = {
                params: {
                    id: '999'
                }
            };
            await courseController_1.default.deleteCourse(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Course not found', 404);
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Course_1.default.findByPk.mockRejectedValue(error);
            const mockRequest = {
                params: {
                    id: '1'
                }
            };
            await courseController_1.default.deleteCourse(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
        });
    });
});
//# sourceMappingURL=course.test.js.map