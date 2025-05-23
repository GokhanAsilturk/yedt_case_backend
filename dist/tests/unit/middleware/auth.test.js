"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../../../middleware/auth");
const User_1 = __importDefault(require("../../../models/User"));
const apiResponse_1 = __importDefault(require("../../../utils/apiResponse"));
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
    let mockResponse;
    let mockRequest;
    let nextFunction;
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
        User_1.default.findByPk.mockResolvedValue(mockUser);
        // Mock jwt verify
        jsonwebtoken_1.default.verify.mockReturnValue({ id: 1 });
        await (0, auth_1.auth)(mockRequest, mockResponse, nextFunction);
        expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
        expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
        expect(User_1.default.findByPk).toHaveBeenCalledWith(1);
        // Check user and token are set in request
        expect(mockRequest.user).toBe(mockUser);
        expect(mockRequest.token).toBe('valid-token');
        // Next should be called
        expect(nextFunction).toHaveBeenCalled();
        expect(apiResponse_1.default.error).not.toHaveBeenCalled();
    });
    it('should return error when no token is provided', async () => {
        // Mock no token
        mockRequest.header.mockReturnValue(undefined);
        await (0, auth_1.auth)(mockRequest, mockResponse, nextFunction);
        expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
        expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Authentication required', 401);
        // Next should not be called
        expect(nextFunction).not.toHaveBeenCalled();
    });
    it('should return error when token is invalid', async () => {
        // Mock token
        mockRequest.header.mockReturnValue('Bearer invalid-token');
        // Mock jwt verify to throw error
        jsonwebtoken_1.default.verify.mockImplementation(() => {
            throw new jsonwebtoken_1.default.JsonWebTokenError('Invalid token');
        });
        await (0, auth_1.auth)(mockRequest, mockResponse, nextFunction);
        expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
        expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('invalid-token', expect.any(String));
        expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Invalid token', 401);
        // Next should not be called
        expect(nextFunction).not.toHaveBeenCalled();
    });
    it('should return error when token is expired', async () => {
        // Mock token
        mockRequest.header.mockReturnValue('Bearer expired-token');
        // Mock jwt verify to throw error
        jsonwebtoken_1.default.verify.mockImplementation(() => {
            throw new jsonwebtoken_1.default.TokenExpiredError('Token expired', new Date());
        });
        await (0, auth_1.auth)(mockRequest, mockResponse, nextFunction);
        expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
        expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('expired-token', expect.any(String));
        expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Token expired', 401);
        // Next should not be called
        expect(nextFunction).not.toHaveBeenCalled();
    });
    it('should return error when user is not found', async () => {
        // Mock token
        mockRequest.header.mockReturnValue('Bearer valid-token');
        // Mock jwt verify
        jsonwebtoken_1.default.verify.mockReturnValue({ id: 999 });
        // Mock user not found
        User_1.default.findByPk.mockResolvedValue(null);
        await (0, auth_1.auth)(mockRequest, mockResponse, nextFunction);
        expect(mockRequest.header).toHaveBeenCalledWith('Authorization');
        expect(jsonwebtoken_1.default.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
        expect(User_1.default.findByPk).toHaveBeenCalledWith(999);
        expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'User not found', 401);
        // Next should not be called
        expect(nextFunction).not.toHaveBeenCalled();
    });
    it('should handle general authentication errors', async () => {
        // Mock token
        mockRequest.header.mockReturnValue('Bearer valid-token');
        // Mock jwt verify to throw error
        jsonwebtoken_1.default.verify.mockImplementation(() => {
            throw new Error('General error');
        });
        await (0, auth_1.auth)(mockRequest, mockResponse, nextFunction);
        expect(apiResponse_1.default.error).toHaveBeenCalledWith(mockResponse, 'Authentication failed', 401);
        // Next should not be called
        expect(nextFunction).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=auth.test.js.map