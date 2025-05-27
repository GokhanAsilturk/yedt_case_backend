import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { auth } from '../../../middleware/auth';
import User from '../../../models/User';
import ApiResponse from '../../../utils/apiResponse';

jest.mock('../../../models/User');

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn()
}));

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
    
    jest.clearAllMocks();
  });
  
  it('should call next when token is valid', async () => {
    mockRequest.header.mockReturnValue('Bearer valid-token');
    
    const mockUser = { id: 1, username: 'testuser', role: 'admin' };
    (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
    
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1 });
    
    await auth(mockRequest, mockResponse as Response, nextFunction);
    
    expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
    expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
    expect(User.findByPk).toHaveBeenCalledWith(1);
    
    expect(mockRequest.user).toBe(mockUser);
    expect(mockRequest.token).toBe('valid-token');
    
    expect(nextFunction).toHaveBeenCalled();
    expect(ApiResponse.error).not.toHaveBeenCalled();
  });
  
  it('should return error when no token is provided', async () => {
    mockRequest.header.mockReturnValue(undefined);
    
    await auth(mockRequest, mockResponse as Response, nextFunction);
    
    expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
    expect(ApiResponse.error).toHaveBeenCalledWith(
      mockResponse, 
      'Authentication required', 
      401
    );
    
    expect(nextFunction).not.toHaveBeenCalled();
  });
  
  it('should return error when token is invalid', async () => {
    mockRequest.header.mockReturnValue('Bearer invalid-token');
    
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
    
    expect(nextFunction).not.toHaveBeenCalled();
  });
  
  it('should return error when token is expired', async () => {
    mockRequest.header.mockReturnValue('Bearer expired-token');
    
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
    
    expect(nextFunction).not.toHaveBeenCalled();
  });
  
  it('should return error when user is not found', async () => {
    mockRequest.header.mockReturnValue('Bearer valid-token');
    
    (jwt.verify as jest.Mock).mockReturnValue({ id: 999 });
    
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
    
    expect(nextFunction).not.toHaveBeenCalled();
  });
  
  it('should handle general authentication errors', async () => {
    mockRequest.header.mockReturnValue('Bearer valid-token');
    
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('General error');
    });
    
    await auth(mockRequest, mockResponse as Response, nextFunction);
    
    expect(ApiResponse.error).toHaveBeenCalledWith(
      mockResponse, 
      'Authentication failed', 
      401
    );
    
    expect(nextFunction).not.toHaveBeenCalled();
  });
});