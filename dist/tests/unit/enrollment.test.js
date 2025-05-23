"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enrollmentController_1 = __importDefault(require("../../controllers/enrollmentController"));
const Enrollment_1 = __importDefault(require("../../models/Enrollment"));
const Student_1 = __importDefault(require("../../models/Student"));
const Course_1 = __importDefault(require("../../models/Course"));
const apiResponse_1 = __importDefault(require("../../utils/apiResponse"));
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
    let mockResponse;
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
            Enrollment_1.default.findAndCountAll.mockResolvedValue(mockResult);
            const mockRequest = {
                query: {
                    page: '1',
                    limit: '10'
                }
            };
            await enrollmentController_1.default.getAllEnrollments(mockRequest, mockResponse);
            expect(Enrollment_1.default.findAndCountAll).toHaveBeenCalledWith({
                include: [
                    {
                        model: Student_1.default,
                        as: 'student'
                    },
                    {
                        model: Course_1.default,
                        as: 'course'
                    }
                ],
                limit: 10,
                offset: 0,
                order: [['createdAt', 'DESC']]
            });
            expect(apiResponse_1.default.pagination).toHaveBeenCalledWith(mockResponse, mockEnrollments, 1, 10, 2);
        });
        it('should handle errors', async () => {
            // Mock error
            const error = new Error('Database error');
            Enrollment_1.default.findAndCountAll.mockRejectedValue(error);
            const mockRequest = {
                query: {
                    page: '1',
                    limit: '10'
                }
            };
            await enrollmentController_1.default.getAllEnrollments(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
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
            Student_1.default.findOne.mockResolvedValue(mockStudent);
            Course_1.default.findByPk.mockResolvedValue(mockCourse);
            Enrollment_1.default.findOne.mockResolvedValue(null); // No existing enrollment
            Enrollment_1.default.create.mockResolvedValue(mockEnrollment);
            const mockRequest = {
                user: { id: 1 },
                params: {
                    courseId: '1'
                }
            };
            await enrollmentController_1.default.enrollCourse(mockRequest, mockResponse);
            expect(Student_1.default.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
            expect(Course_1.default.findByPk).toHaveBeenCalledWith('1');
            expect(Enrollment_1.default.findOne).toHaveBeenCalledWith({
                where: { studentId: 1, courseId: '1' }
            });
            expect(Enrollment_1.default.create).toHaveBeenCalledWith({
                studentId: 1,
                courseId: '1',
                enrollmentDate: expect.any(Date)
            });
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, mockEnrollment, 'Enrolled successfully', 201);
        });
        it('should return error when student not found', async () => {
            Student_1.default.findOne.mockResolvedValue(null);
            const mockRequest = {
                user: { id: 1 },
                params: {
                    courseId: '1'
                }
            };
            await enrollmentController_1.default.enrollCourse(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Student not found', 404);
            expect(Enrollment_1.default.create).not.toHaveBeenCalled();
        });
        it('should return error when course not found', async () => {
            const mockStudent = { id: 1, firstName: 'John', lastName: 'Doe' };
            Student_1.default.findOne.mockResolvedValue(mockStudent);
            Course_1.default.findByPk.mockResolvedValue(null);
            const mockRequest = {
                user: { id: 1 },
                params: {
                    courseId: '1'
                }
            };
            await enrollmentController_1.default.enrollCourse(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Course not found', 404);
            expect(Enrollment_1.default.create).not.toHaveBeenCalled();
        });
        it('should return error when already enrolled', async () => {
            const mockStudent = { id: 1, firstName: 'John', lastName: 'Doe' };
            const mockCourse = { id: 1, name: 'Mathematics' };
            const existingEnrollment = { id: 1, studentId: 1, courseId: 1 };
            Student_1.default.findOne.mockResolvedValue(mockStudent);
            Course_1.default.findByPk.mockResolvedValue(mockCourse);
            Enrollment_1.default.findOne.mockResolvedValue(existingEnrollment);
            const mockRequest = {
                user: { id: 1 },
                params: {
                    courseId: '1'
                }
            };
            await enrollmentController_1.default.enrollCourse(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Already enrolled in this course', 400);
            expect(Enrollment_1.default.create).not.toHaveBeenCalled();
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Student_1.default.findOne.mockRejectedValue(error);
            const mockRequest = {
                user: { id: 1 },
                params: {
                    courseId: '1'
                }
            };
            await enrollmentController_1.default.enrollCourse(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
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
            Student_1.default.findOne.mockResolvedValue(mockStudent);
            Enrollment_1.default.findOne.mockResolvedValue(mockEnrollment);
            const mockRequest = {
                user: { id: 1 },
                params: {
                    courseId: '1'
                }
            };
            await enrollmentController_1.default.withdrawCourse(mockRequest, mockResponse);
            expect(Student_1.default.findOne).toHaveBeenCalledWith({ where: { userId: 1 } });
            expect(Enrollment_1.default.findOne).toHaveBeenCalledWith({
                where: { studentId: 1, courseId: '1' }
            });
            expect(mockEnrollment.destroy).toHaveBeenCalled();
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, null, 'Withdrawn successfully');
        });
        it('should return error when student not found', async () => {
            Student_1.default.findOne.mockResolvedValue(null);
            const mockRequest = {
                user: { id: 1 },
                params: {
                    courseId: '1'
                }
            };
            await enrollmentController_1.default.withdrawCourse(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Student not found', 404);
        });
        it('should return error when enrollment not found', async () => {
            const mockStudent = { id: 1, firstName: 'John', lastName: 'Doe' };
            Student_1.default.findOne.mockResolvedValue(mockStudent);
            Enrollment_1.default.findOne.mockResolvedValue(null);
            const mockRequest = {
                user: { id: 1 },
                params: {
                    courseId: '1'
                }
            };
            await enrollmentController_1.default.withdrawCourse(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Enrollment not found', 404);
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Student_1.default.findOne.mockRejectedValue(error);
            const mockRequest = {
                user: { id: 1 },
                params: {
                    courseId: '1'
                }
            };
            await enrollmentController_1.default.withdrawCourse(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
        });
    });
    describe('getStudentEnrollments', () => {
        it('should return enrollments for a student', async () => {
            // Mock data
            const mockEnrollments = [
                { id: 1, studentId: 1, courseId: 1, course: { name: 'Math' } },
                { id: 2, studentId: 1, courseId: 2, course: { name: 'Physics' } }
            ];
            Enrollment_1.default.findAll.mockResolvedValue(mockEnrollments);
            const mockRequest = {
                params: {
                    id: '1' // studentId
                }
            };
            await enrollmentController_1.default.getStudentEnrollments(mockRequest, mockResponse);
            expect(Enrollment_1.default.findAll).toHaveBeenCalledWith({
                where: { studentId: '1' },
                include: [
                    {
                        model: Course_1.default,
                        as: 'course'
                    }
                ]
            });
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, mockEnrollments);
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Enrollment_1.default.findAll.mockRejectedValue(error);
            const mockRequest = {
                params: {
                    id: '1'
                }
            };
            await enrollmentController_1.default.getStudentEnrollments(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
        });
    });
    describe('getCourseEnrollments', () => {
        it('should return enrollments for a course', async () => {
            // Mock data
            const mockEnrollments = [
                { id: 1, studentId: 1, courseId: 1, student: { firstName: 'John' } },
                { id: 2, studentId: 2, courseId: 1, student: { firstName: 'Jane' } }
            ];
            Enrollment_1.default.findAll.mockResolvedValue(mockEnrollments);
            const mockRequest = {
                params: {
                    id: '1' // courseId
                }
            };
            await enrollmentController_1.default.getCourseEnrollments(mockRequest, mockResponse);
            expect(Enrollment_1.default.findAll).toHaveBeenCalledWith({
                where: { courseId: '1' },
                include: [
                    {
                        model: Student_1.default,
                        as: 'student'
                    }
                ]
            });
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, mockEnrollments);
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Enrollment_1.default.findAll.mockRejectedValue(error);
            const mockRequest = {
                params: {
                    id: '1'
                }
            };
            await enrollmentController_1.default.getCourseEnrollments(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
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
            Enrollment_1.default.findOne.mockResolvedValue(null); // No existing enrollment
            Student_1.default.findByPk.mockResolvedValue(mockStudent);
            Course_1.default.findByPk.mockResolvedValue(mockCourse);
            Enrollment_1.default.create.mockResolvedValue(mockEnrollment);
            const mockRequest = {
                body: {
                    studentId: '1',
                    courseId: '1'
                }
            };
            await enrollmentController_1.default.createEnrollment(mockRequest, mockResponse);
            expect(Enrollment_1.default.findOne).toHaveBeenCalledWith({
                where: { studentId: '1', courseId: '1' }
            });
            expect(Student_1.default.findByPk).toHaveBeenCalledWith('1');
            expect(Course_1.default.findByPk).toHaveBeenCalledWith('1');
            expect(Enrollment_1.default.create).toHaveBeenCalledWith({
                studentId: '1',
                courseId: '1',
                enrollmentDate: expect.any(Date)
            });
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, mockEnrollment, 'Enrollment created successfully', 201);
        });
        it('should return error when enrollment already exists', async () => {
            const existingEnrollment = { id: 1, studentId: '1', courseId: '1' };
            Enrollment_1.default.findOne.mockResolvedValue(existingEnrollment);
            const mockRequest = {
                body: {
                    studentId: '1',
                    courseId: '1'
                }
            };
            await enrollmentController_1.default.createEnrollment(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Student is already enrolled in this course', 400);
            expect(Enrollment_1.default.create).not.toHaveBeenCalled();
        });
        it('should return error when student not found', async () => {
            Enrollment_1.default.findOne.mockResolvedValue(null);
            Student_1.default.findByPk.mockResolvedValue(null);
            const mockRequest = {
                body: {
                    studentId: '999',
                    courseId: '1'
                }
            };
            await enrollmentController_1.default.createEnrollment(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Student not found', 404);
            expect(Enrollment_1.default.create).not.toHaveBeenCalled();
        });
        it('should return error when course not found', async () => {
            const mockStudent = { id: 1, firstName: 'John' };
            Enrollment_1.default.findOne.mockResolvedValue(null);
            Student_1.default.findByPk.mockResolvedValue(mockStudent);
            Course_1.default.findByPk.mockResolvedValue(null);
            const mockRequest = {
                body: {
                    studentId: '1',
                    courseId: '999'
                }
            };
            await enrollmentController_1.default.createEnrollment(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Course not found', 404);
            expect(Enrollment_1.default.create).not.toHaveBeenCalled();
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Enrollment_1.default.findOne.mockRejectedValue(error);
            const mockRequest = {
                body: {
                    studentId: '1',
                    courseId: '1'
                }
            };
            await enrollmentController_1.default.createEnrollment(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
        });
    });
    describe('deleteEnrollment', () => {
        it('should delete an enrollment', async () => {
            // Mock data
            const mockEnrollment = {
                id: 1,
                destroy: jest.fn().mockResolvedValue(undefined)
            };
            Enrollment_1.default.findByPk.mockResolvedValue(mockEnrollment);
            const mockRequest = {
                params: {
                    id: '1'
                }
            };
            await enrollmentController_1.default.deleteEnrollment(mockRequest, mockResponse);
            expect(Enrollment_1.default.findByPk).toHaveBeenCalledWith('1');
            expect(mockEnrollment.destroy).toHaveBeenCalled();
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, null, 'Enrollment deleted successfully');
        });
        it('should return error when enrollment not found', async () => {
            Enrollment_1.default.findByPk.mockResolvedValue(null);
            const mockRequest = {
                params: {
                    id: '999'
                }
            };
            await enrollmentController_1.default.deleteEnrollment(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Enrollment not found', 404);
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Enrollment_1.default.findByPk.mockRejectedValue(error);
            const mockRequest = {
                params: {
                    id: '1'
                }
            };
            await enrollmentController_1.default.deleteEnrollment(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
        });
    });
});
//# sourceMappingURL=enrollment.test.js.map