"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const authController_1 = __importDefault(require("../../controllers/authController"));
const User_1 = __importDefault(require("../../models/User"));
const jwt_1 = require("../../utils/jwt");
const apiResponse_1 = __importDefault(require("../../utils/apiResponse"));
// Mock User model
jest.mock('../../models/User');
// Mock JWT utils
jest.mock('../../utils/jwt', () => ({
    generateAccessToken: jest.fn(),
    generateTokenPair: jest.fn().mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
    })
}));
// Mock ApiResponse
jest.mock('../../utils/apiResponse', () => ({
    success: jest.fn(),
    error: jest.fn()
}));
describe('AuthController', () => {
    let mockResponse;
    beforeEach(() => {
        mockResponse = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        // Reset all mocks after each test
        jest.clearAllMocks();
    });
    describe('studentLogin', () => {
        it('should return token when credentials are valid', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                role: 'student',
                validatePassword: jest.fn().mockResolvedValue(true),
            };
            const mockStudent = {
                id: 100,
                userId: 1
            };
            User_1.default.findOne.mockResolvedValue(mockUser);
            // Mock Student model
            jest.mock('../../models/Student', () => ({
                findOne: jest.fn().mockResolvedValue(mockStudent)
            }));
            jwt_1.generateTokenPair.mockReturnValue({
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            });
            const mockRequest = {
                body: {
                    username: 'testuser',
                    password: 'password123',
                },
            };
            await authController_1.default.studentLogin(mockRequest, mockResponse);
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, {
                user: expect.objectContaining({
                    id: mockStudent.id,
                    userId: mockUser.id,
                    username: mockUser.username,
                    email: mockUser.email,
                    role: mockUser.role
                }),
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            });
        });
        it('should return error when credentials are invalid', async () => {
            const mockUser = {
                validatePassword: jest.fn().mockResolvedValue(false),
            };
            User_1.default.findOne.mockResolvedValue(mockUser);
            const mockRequest = {
                body: {
                    username: 'testuser',
                    password: 'wrongpassword',
                },
            };
            await authController_1.default.studentLogin(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, expect.any(String), 401, expect.objectContaining({ code: expect.any(String) }));
        });
    });
});
//# sourceMappingURL=auth.test.js.map