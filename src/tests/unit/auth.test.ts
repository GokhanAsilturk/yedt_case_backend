import { Response } from 'express';
import AuthController from '../../controllers/authController';
import User from '../../models/User';
import { generateToken } from '../../utils/jwt';
import ApiResponse from '../../utils/apiResponse';

// Mock User model
jest.mock('../../models/User');
// Mock JWT utils
jest.mock('../../utils/jwt');

// Mock ApiResponse
jest.mock('../../utils/apiResponse', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

describe('AuthController', () => {
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
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

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (generateToken as jest.Mock).mockReturnValue('mock-token');

      const mockRequest = {
        body: {
          username: 'testuser',
          password: 'password123',
        },
      };

      await AuthController.login(mockRequest as any, mockResponse as Response);      expect(ApiResponse.success).toHaveBeenCalledWith(mockResponse, {
        user: mockUser,
        token: 'mock-token'
      });
    });

    it('should return error when credentials are invalid', async () => {
      const mockUser = {
        validatePassword: jest.fn().mockResolvedValue(false),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const mockRequest = {
        body: {
          username: 'testuser',
          password: 'wrongpassword',
        },
      };

      await AuthController.login(mockRequest as any, mockResponse as Response);      expect(ApiResponse.error).toHaveBeenCalledWith(mockResponse, 'Invalid credentials', 401);
    });
  });
});
