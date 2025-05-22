import { Response } from 'express';
import { Op } from 'sequelize';
import AuthController from '../../controllers/authController';
import User from '../../models/User';
import { generateTokenPair } from '../../utils/jwt';
import ApiResponse from '../../utils/apiResponse';

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
  let mockResponse: Partial<Response>;

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

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (generateTokenPair as jest.Mock).mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      });

      const mockRequest = {
        body: {
          username: 'testuser',
          password: 'password123',
        },
      };

      await AuthController.login(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.success).toHaveBeenCalledWith(mockResponse, {
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

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const mockRequest = {
        body: {
          username: 'testuser',
          password: 'wrongpassword',
        },
      };

      await AuthController.login(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse,
        'Geçersiz kullanıcı adı veya şifre',
        401,
        { code: 'UNAUTHORIZED' }
      );
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
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      // Mock User model create to return the new user
      (User.create as jest.Mock).mockResolvedValue(mockUser);
      
      // Mock generate token
      (generateTokenPair as jest.Mock).mockReturnValue({
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

      await AuthController.register(mockRequest as any, mockResponse as Response);
      
      expect(User.findOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { username: 'newuser' },
            { email: 'newuser@example.com' }
          ]
        }
      });
      
      expect(User.create).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'admin'
      });
      
      expect(generateTokenPair).toHaveBeenCalledWith(mockUser);
      
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        {
          user: expect.objectContaining({
            id: mockUser.id,
            username: mockUser.username,
            email: mockUser.email,
            role: mockUser.role
          }),
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        },
        'Yönetici kullanıcı başarıyla kaydedildi',
        201
      );
    });

    it('should return error when username or email already exists', async () => {
      // Mock existing user
      const mockExistingUser = {
        id: 1,
        username: 'existinguser',
        email: 'existing@example.com',
      };

      // Mock User model findOne to return an existing user
      (User.findOne as jest.Mock).mockResolvedValue(mockExistingUser);

      const mockRequest = {
        body: {
          username: 'existinguser',
          email: 'new@example.com',
          password: 'password123',
        },
      };

      await AuthController.register(mockRequest as any, mockResponse as Response);
      
      expect(User.findOne).toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse,
        'Kullanıcı adı veya e-posta zaten mevcut',
        400
      );
    });

    it('should handle errors during registration', async () => {
      // Mock User model findOne to throw an error
      const error = new Error('Database error');
      (User.findOne as jest.Mock).mockRejectedValue(error);

      const mockRequest = {
        body: {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123',
        },
      };

      await AuthController.register(mockRequest as any, mockResponse as Response);
      
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockResponse,
        'Database error'
      );
    });
  });
});
