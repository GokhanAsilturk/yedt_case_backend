"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
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
    describe('login', () => {
        it('should return token when credentials are valid', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@example.com',
                role: 'student',
                validatePassword: jest.fn().mockResolvedValue(true),
            };
            User_1.default.findOne.mockResolvedValue(mockUser);
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
            await authController_1.default.login(mockRequest, mockResponse);
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, {
                user: expect.objectContaining({
                    id: mockUser.id,
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
            await authController_1.default.login(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Geçersiz kullanıcı adı veya şifre', 401, { code: 'UNAUTHORIZED' });
        });
    });
    describe('register', () => {
        it('should register a new user successfully', async () => {
            // Mock data
            const mockUser = {
                id: 1,
                username: 'newuser',
                email: 'newuser@example.com',
                role: 'admin',
            };
            // Mock User model findOne to return null (user doesn't exist)
            User_1.default.findOne.mockResolvedValue(null);
            // Mock User model create to return the new user
            User_1.default.create.mockResolvedValue(mockUser);
            // Mock generate token
            jwt_1.generateTokenPair.mockReturnValue({
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            });
            const mockRequest = {
                body: {
                    username: 'newuser',
                    email: 'newuser@example.com',
                    password: 'password123',
                },
            };
            await authController_1.default.RegisterAdmin(mockRequest, mockResponse);
            expect(User_1.default.findOne).toHaveBeenCalledWith({
                where: {
                    [sequelize_1.Op.or]: [
                        { username: 'newuser' },
                        { email: 'newuser@example.com' }
                    ]
                }
            });
            expect(User_1.default.create).toHaveBeenCalledWith({
                username: 'newuser',
                email: 'newuser@example.com',
                password: 'password123',
                role: 'admin'
            });
            expect(jwt_1.generateTokenPair).toHaveBeenCalledWith(mockUser);
            expect(apiResponse_1.default.success).toHaveBeenCalledWith(mockResponse, {
                user: expect.objectContaining({
                    id: mockUser.id,
                    username: mockUser.username,
                    email: mockUser.email,
                    role: mockUser.role
                }),
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token'
            }, 'Yönetici kullanıcı başarıyla kaydedildi', 201);
        });
        it('should return error when username or email already exists', async () => {
            // Mock existing user
            const mockExistingUser = {
                id: 1,
                username: 'existinguser',
                email: 'existing@example.com',
            };
            // Mock User model findOne to return an existing user
            User_1.default.findOne.mockResolvedValue(mockExistingUser);
            const mockRequest = {
                body: {
                    username: 'existinguser',
                    email: 'new@example.com',
                    password: 'password123',
                },
            };
            await authController_1.default.RegisterAdmin(mockRequest, mockResponse);
            expect(User_1.default.findOne).toHaveBeenCalled();
            expect(User_1.default.create).not.toHaveBeenCalled();
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Kullanıcı adı veya e-posta zaten mevcut', 400);
        });
        it('should handle errors during registration', async () => {
            // Mock User model findOne to throw an error
            const error = new Error('Database error');
            User_1.default.findOne.mockRejectedValue(error);
            const mockRequest = {
                body: {
                    username: 'newuser',
                    email: 'newuser@example.com',
                    password: 'password123',
                },
            };
            await authController_1.default.RegisterAdmin(mockRequest, mockResponse);
            expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Database error');
        });
    });
});
//# sourceMappingURL=auth.test.js.map