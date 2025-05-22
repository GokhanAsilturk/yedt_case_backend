import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { auth } from '../../../middleware/auth';
import User from '../../../models/User';
import ApiResponse from '../../../utils/apiResponse';

// Mock User model
jest.mock('../../../models/User');

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

// Mock ApiResponse
jest.mock('../../../utils/apiResponse', () => ({
  success: jest.fn(),
  error: jest.fn()
}));

describe('Auth Middleware', () => {
  let mockResponse: Partial<Response>;
  let mockRequest: any;
  let nextFunction: NextFunction;
  
  beforeEach(() => {
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    
    mockRequest = {
      header: jest.fn()
    };
    
    nextFunction = jest.fn();
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  it('should call next when token is valid', async () => {
    // Mock token
    mockRequest.header.mockReturnValue('Bearer valid-token');
    
    // Mock user
    const mockUser = { id: 1, username: 'testuser', role: 'admin' };
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    
    // Mock jwt verify
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1 });
    
    await auth(mockRequest, mockResponse as Response, nextFunction);
    
    expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
    expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
    expect(User.findByPk).toHaveBeenCalledWith(1);
    
    // Check user and token are set in request
    expect(mockRequest.user).toBe(mockUser);
    expect(mockRequest.token).toBe('valid-token');
    
    // Next should be called
    expect(nextFunction).toHaveBeenCalled();
    expect(ApiResponse.error).not.toHaveBeenCalled();
  });
  
  it('should return error when no token is provided', async () => {
    // Mock no token
    mockRequest.header.mockReturnValue(undefined);
    
    await auth(mockRequest, mockResponse as Response, nextFunction);
    
    expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
    expect(ApiResponse.error).toHaveBeenCalledWith(
      mockResponse, 
      'Authentication required', 
      401
    );
    
    // Next should not be called
    expect(nextFunction).not.toHaveBeenCalled();
  });
  
  it('should return error when token is invalid', async () => {
    // Mock token
    mockRequest.header.mockReturnValue('Bearer invalid-token');
    
    // Mock jwt verify to throw error
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.JsonWebTokenError('Invalid token');
    });
    
    await auth(mockRequest, mockResponse as Response, nextFunction);
    
    expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
    expect(jwt.verify).toHaveBeenCalledWith('invalid-token', expect.any(String));
    expect(ApiResponse.error).toHaveBeenCalledWith(
      mockResponse, 
      'Invalid token', 
      401
    );
    
    // Next should not be called
    expect(nextFunction).not.toHaveBeenCalled();
  });
  
  it('should return error when token is expired', async () => {
    // Mock token
    mockRequest.header.mockReturnValue('Bearer expired-token');
    
    // Mock jwt verify to throw error
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new jwt.TokenExpiredError('Token expired', new Date());
    });
    
    await auth(mockRequest, mockResponse as Response, nextFunction);
    
    expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
    expect(jwt.verify).toHaveBeenCalledWith('expired-token', expect.any(String));
    expect(ApiResponse.error).toHaveBeenCalledWith(
      mockResponse, 
      'Token expired', 
      401
    );
    
    // Next should not be called
    expect(nextFunction).not.toHaveBeenCalled();
  });
  
  it('should return error when user is not found', async () => {
    // Mock token
    mockRequest.header.mockReturnValue('Bearer valid-token');
    
    // Mock jwt verify
    (jwt.verify as jest.Mock).mockReturnValue({ id: 999 });
    
    // Mock user not found
    (User.findByPk as jest.Mock).mockResolvedValue(null);
    
    await auth(mockRequest, mockResponse as Response, nextFunction);
    
    expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
    expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
    expect(User.findByPk).toHaveBeenCalledWith(999);
    expect(ApiResponse.error).toHaveBeenCalledWith(
      mockResponse, 
      'User not found', 
      401
    );
    
    // Next should not be called
    expect(nextFunction).not.toHaveBeenCalled();
  });
  
  it('should handle general authentication errors', async () => {
    // Mock token
    mockRequest.header.mockReturnValue('Bearer valid-token');
    
    // Mock jwt verify to throw error
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('General error');
    });
    
    await auth(mockRequest, mockResponse as Response, nextFunction);
    
    expect(ApiResponse.error).toHaveBeenCalledWith(
      mockResponse, 
      'Authentication failed', 
      401
    );
    
    // Next should not be called
    expect(nextFunction).not.toHaveBeenCalled();
  });
});