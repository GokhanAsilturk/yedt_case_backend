"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const studentController_1 = __importDefault(require("../../controllers/studentController"));
const Student_1 = __importDefault(require("../../models/Student"));
const User_1 = __importDefault(require("../../models/User"));
const Enrollment_1 = __importDefault(require("../../models/Enrollment"));
const apiResponse_1 = __importDefault(require("../../utils/apiResponse"));
const database_1 = require("../../config/database");
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
    let mockResponse;
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
                { id: 1, user: { firstName: 'John', lastName: 'Doe', username: 'johndoe', email: 'john@example.com' } },
                { id: 2, user: { firstName: 'Jane', lastName: 'Smith', username: 'janesmith', email: 'jane@example.com' } }
            ];
            const mockResult = {
                count: 2,
                rows: mockStudents
            };
            Student_1.default.findAndCountAll.mockResolvedValue(mockResult);
            const mockRequest = {
                query: {
                    page: '1',
                    limit: '10'
                }
            };
            await studentController_1.default.getAllStudents(mockRequest, mockResponse);
            expect(Student_1.default.findAndCountAll).toHaveBeenCalledWith({
                where: {},
                include: [
                    {
                        model: User_1.default,
                        as: 'user',
                        attributes: ['username', 'email', 'role', 'firstName', 'lastName']
                    }
                ],
                limit: 10,
                offset: 0,
                order: [['createdAt', 'DESC']]
            });
            expect(apiResponse_1.default.pagination).toHaveBeenCalledWith(mockResponse, mockStudents, 1, 10, 2);
        });
        it('should apply search filters correctly', async () => {
            const mockStudents = [
                { id: 1, user: { firstName: 'John', lastName: 'Doe', username: 'johndoe', email: 'john@example.com' } }
            ];
            const mockResult = {
                count: 1,
                rows: mockStudents
            };
            Student_1.default.findAndCountAll.mockResolvedValue(mockResult);
            const mockRequest = {
                query: {
                    page: '1',
                    limit: '10',
                    search: 'john'
                }
            };
            await studentController_1.default.getAllStudents(mockRequest, mockResponse);
            expect(Student_1.default.findAndCountAll).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    [sequelize_1.Op.or]: [
                        { '$user.username$': { [sequelize_1.Op.iLike]: '%john%' } },
                        { '$user.email$': { [sequelize_1.Op.iLike]: '%john%' } },
                        { '$user.firstName$': { [sequelize_1.Op.iLike]: '%john%' } },
                        { '$user.lastName$': { [sequelize_1.Op.iLike]: '%john%' } }
                    ]
                }
            }));
            expect(apiResponse_1.default.pagination).toHaveBeenCalled();
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Student_1.default.findAndCountAll.mockRejectedValue(error);
            const mockRequest = {
                query: {
                    page: '1',
                    limit: '10'
                }
            };
            await studentController_1.default.getAllStudents(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
        });
    });
    describe('getStudentById', () => {
        it('should return student by id', async () => {
            const mockStudent = {
                id: 1,
                user: { firstName: 'John', lastName: 'Doe', username: 'johndoe', email: 'john@example.com' }
            };
            Student_1.default.findByPk.mockResolvedValue(mockStudent);
            const mockRequest = {
                params: {
                    id: '1'
                }
            };
            await studentController_1.default.getStudentById(mockRequest, mockResponse);
            expect(Student_1.default.findByPk).toHaveBeenCalledWith('1', {
                include: [
                    {
                        model: User_1.default,
                        as: 'user',
                        attributes: ['username', 'email', 'role', 'firstName', 'lastName']
                    }
                ]
            });
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, mockStudent);
        });
        it('should return 404 when student not found', async () => {
            Student_1.default.findByPk.mockResolvedValue(null);
            const mockRequest = {
                params: {
                    id: '999'
                }
            };
            await studentController_1.default.getStudentById(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Student not found', 404);
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Student_1.default.findByPk.mockRejectedValue(error);
            const mockRequest = {
                params: {
                    id: '1'
                }
            };
            await studentController_1.default.getStudentById(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
        });
    });
    describe('createStudent', () => {
        it('should create student successfully', async () => {
            const mockUser = { id: 1, username: 'johndoe', email: 'john@example.com', role: 'student', firstName: 'John', lastName: 'Doe' };
            const mockStudent = { id: 1, userId: 1, birthDate: '1990-01-01' };
            User_1.default.create.mockResolvedValue(mockUser);
            Student_1.default.create.mockResolvedValue(mockStudent);
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
            await studentController_1.default.createStudent(mockRequest, mockResponse);
            expect(User_1.default.create).toHaveBeenCalledWith({
                username: 'johndoe',
                email: 'john@example.com',
                password: 'password123',
                role: 'student',
                firstName: 'John',
                lastName: 'Doe'
            });
            expect(Student_1.default.create).toHaveBeenCalledWith({
                userId: 1,
                birthDate: expect.any(Date)
            });
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, { user: mockUser, student: mockStudent }, 'Student created successfully', 201);
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            User_1.default.create.mockRejectedValue(error);
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
            await studentController_1.default.createStudent(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
        });
    });
    describe('updateStudent', () => {
        it('should update student successfully', async () => {
            const mockStudent = {
                id: 1,
                userId: 1,
                update: jest.fn().mockResolvedValue({ id: 1, birthDate: '1990-01-01' })
            };
            const mockUser = {
                id: 1,
                update: jest.fn().mockResolvedValue({ id: 1, firstName: 'Updated', lastName: 'Student' })
            };
            Student_1.default.findByPk.mockResolvedValue(mockStudent);
            User_1.default.findByPk.mockResolvedValue(mockUser);
            const mockRequest = {
                params: {
                    id: '1'
                },
                body: {
                    firstName: 'Updated',
                    lastName: 'Student',
                    birthDate: '1990-01-01'
                }
            };
            await studentController_1.default.updateStudent(mockRequest, mockResponse);
            expect(Student_1.default.findByPk).toHaveBeenCalledWith('1');
            expect(User_1.default.findByPk).toHaveBeenCalledWith(1);
            expect(mockUser.update).toHaveBeenCalledWith({
                firstName: 'Updated',
                lastName: 'Student'
            });
            expect(mockStudent.update).toHaveBeenCalledWith({
                birthDate: expect.any(Date)
            });
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, { student: mockStudent, user: mockUser }, 'Student updated successfully');
        });
        it('should return 404 when student not found', async () => {
            Student_1.default.findByPk.mockResolvedValue(null);
            const mockRequest = {
                params: {
                    id: '999'
                },
                body: {
                    firstName: 'Updated',
                    lastName: 'Student'
                }
            };
            await studentController_1.default.updateStudent(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Student not found', 404);
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Student_1.default.findByPk.mockRejectedValue(error);
            const mockRequest = {
                params: {
                    id: '1'
                },
                body: {
                    firstName: 'Updated',
                    lastName: 'Student'
                }
            };
            await studentController_1.default.updateStudent(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
        });
    });
    describe('deleteStudent', () => {
        it('should delete student successfully', async () => {
            const mockStudent = {
                id: 1,
                userId: 1,
                destroy: jest.fn().mockResolvedValue(undefined)
            };
            Student_1.default.findByPk.mockResolvedValue(mockStudent);
            Enrollment_1.default.destroy.mockResolvedValue(undefined);
            User_1.default.destroy.mockResolvedValue(undefined);
            const mockRequest = {
                params: {
                    id: '1'
                }
            };
            await studentController_1.default.deleteStudent(mockRequest, mockResponse);
            expect(Student_1.default.findByPk).toHaveBeenCalledWith('1');
            expect(database_1.sequelize.transaction).toHaveBeenCalled();
            expect(Enrollment_1.default.destroy).toHaveBeenCalledWith({
                where: { studentId: 1 },
                transaction: expect.anything()
            });
            expect(mockStudent.destroy).toHaveBeenCalled();
            expect(User_1.default.destroy).toHaveBeenCalledWith({
                where: { id: 1 },
                transaction: expect.anything()
            });
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, null, 'Student deleted successfully');
        });
        it('should return 404 when student not found', async () => {
            Student_1.default.findByPk.mockResolvedValue(null);
            const mockRequest = {
                params: {
                    id: '999'
                }
            };
            await studentController_1.default.deleteStudent(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Student not found', 404);
        });
        it('should handle errors', async () => {
            const error = new Error('Database error');
            Student_1.default.findByPk.mockRejectedValue(error);
            const mockRequest = {
                params: {
                    id: '1'
                }
            };
            await studentController_1.default.deleteStudent(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
        });
    });
});
//# sourceMappingURL=student.test.js.map