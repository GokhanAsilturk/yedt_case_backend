import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { errorHandler, notFoundHandler } from './errorHandler';
import { validate, commonSchemas, ValidationSchema } from './validator';
import { setupSecurityMiddleware, sqlInjectionProtection } from './security';
import { auth, requirePermission, requireRoles, Permission, hasPermission } from './auth';
import { AppError } from '../error/models/AppError';
import { ErrorCode } from '../error/constants/errorCodes';
import { ErrorMessage } from '../error/constants/errorMessages';

export const checkRole = (roles: string[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError(ErrorMessage.UNAUTHORIZED.tr, 401, ErrorCode.UNAUTHORIZED);
      }

      if (!roles.includes(req.user.role)) {
        throw new AppError(ErrorMessage.FORBIDDEN.tr, 403, ErrorCode.FORBIDDEN);
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else if (error instanceof Error) {
        next(new AppError(error.message, 500, ErrorCode.UNAUTHORIZED));
      } else {
        next(new AppError(ErrorMessage.SECURITY_ERROR.tr, 500, ErrorCode.UNAUTHORIZED));
      }
    }
  };
};

export {
  auth,
  requirePermission,
  requireRoles,
  Permission,
  hasPermission,
  errorHandler,
  notFoundHandler,
  AppError,
  ErrorCode,
  validate,
  commonSchemas,
  ValidationSchema,
  setupSecurityMiddleware,
  sqlInjectionProtection
};
