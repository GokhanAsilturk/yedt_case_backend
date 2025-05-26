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
});
//# sourceMappingURL=auth.test.js.map