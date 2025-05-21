import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import ApiResponse from '../utils/apiResponse';
import { AuthRequest, AuthMiddleware } from '../types/express';

export const auth: AuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      ApiResponse.error(res, 'Authentication required', 401);
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'your-secret-key') as jwt.JwtPayload;
    const user = await User.findByPk(decoded.id);

    if (!user) {
      ApiResponse.error(res, 'User not found', 401);
      return;
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      ApiResponse.error(res, 'Invalid token', 401);
    } else if (error instanceof jwt.TokenExpiredError) {
      ApiResponse.error(res, 'Token expired', 401);
    } else {
      ApiResponse.error(res, 'Authentication failed', 401);
    }
  }
};
