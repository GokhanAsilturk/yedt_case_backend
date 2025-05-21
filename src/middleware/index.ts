//index.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import ApiResponse from '../utils/apiResponse';

export const checkRole = (roles: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Authentication required', 401);
        return;
      }

      if (!roles.includes(req.user.role)) {
        ApiResponse.error(
          res,
          'You do not have permission to perform this action',
          403
        );
        return;
      }

      next();
    } catch (error) {
      if (error instanceof Error) {
        ApiResponse.error(res, error.message, 500);
      } else {
        ApiResponse.error(res, 'Authorization check failed', 500);
      }
    }
  };
};

export { auth } from './auth';
