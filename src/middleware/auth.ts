import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import ApiResponse from '../utils/apiResponse';
import { AuthRequest, AuthMiddleware } from '../types/express';
import { AppError, ErrorCode } from './errorHandler';

// Uygulama içindeki izinler
export enum Permission {
  // Kullanıcı izinleri
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  
  // Öğrenci izinleri
  VIEW_STUDENTS = 'view_students',
  CREATE_STUDENT = 'create_student',
  UPDATE_STUDENT = 'update_student',
  DELETE_STUDENT = 'delete_student',
  
  // Kurs izinleri
  VIEW_COURSES = 'view_courses',
  CREATE_COURSE = 'create_course',
  UPDATE_COURSE = 'update_course',
  DELETE_COURSE = 'delete_course',
  
  // Kayıt izinleri
  VIEW_ENROLLMENTS = 'view_enrollments',
  CREATE_ENROLLMENT = 'create_enrollment',
  UPDATE_ENROLLMENT = 'update_enrollment',
  DELETE_ENROLLMENT = 'delete_enrollment'
}

// Her rol için izinleri tanımla
const rolePermissions: Record<string, Permission[]> = {
  'admin': [
    Permission.VIEW_USERS, Permission.CREATE_USER, Permission.UPDATE_USER, Permission.DELETE_USER,
    Permission.VIEW_STUDENTS, Permission.CREATE_STUDENT, Permission.UPDATE_STUDENT, Permission.DELETE_STUDENT,
    Permission.VIEW_COURSES, Permission.CREATE_COURSE, Permission.UPDATE_COURSE, Permission.DELETE_COURSE,
    Permission.VIEW_ENROLLMENTS, Permission.CREATE_ENROLLMENT, Permission.UPDATE_ENROLLMENT, Permission.DELETE_ENROLLMENT
  ],
  'student': [
    Permission.VIEW_STUDENTS,
    Permission.VIEW_COURSES,
    Permission.VIEW_ENROLLMENTS
  ]
};

/**
 * Kullanıcının rolüne göre belirli izinlere sahip olup olmadığını kontrol eder
 * @param userRole Kullanıcı rolü
 * @param requiredPermission Gereken izin
 * @returns Kullanıcının izne sahip olup olmadığı
 */
export const hasPermission = (userRole: string, requiredPermission: Permission): boolean => {
  if (!rolePermissions[userRole]) {
    return false;
  }
  
  return rolePermissions[userRole].includes(requiredPermission);
};

/**
 * Kullanıcı kimlik doğrulama middleware'i
 */
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

    const decoded = jwt.verify(token, process.env.JWT_SECRET ?? 'your-secret-key') as jwt.JwtPayload & { exp?: number };
    
    // Token süresinin dolup dolmadığını kontrol et
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      throw new AppError('Token süresi doldu', 401, ErrorCode.TOKEN_EXPIRED);
    }
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

/**
 * Belirli izinlere sahip kullanıcıları doğrulayan middleware
 * @param requiredPermission Gereken izin
 */
export const requirePermission = (requiredPermission: Permission): AuthMiddleware => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Yetkilendirme gerekli', 401, ErrorCode.UNAUTHORIZED);
      }
      
      const { role } = req.user;
      
      if (!hasPermission(role, requiredPermission)) {
        throw new AppError(
          'Bu işlemi gerçekleştirmek için gerekli izne sahip değilsiniz',
          403,
          ErrorCode.FORBIDDEN
        );
      }
      
      next();
    } catch (error) {
      if (error instanceof AppError) {
        ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
      } else if (error instanceof Error) {
        ApiResponse.error(res, error.message, 500);
      } else {
        ApiResponse.error(res, 'Yetkilendirme hatası', 500);
      }
    }
  };
};

/**
 * Belirli rollere sahip kullanıcıları doğrulayan middleware
 * @param roles İzin verilen roller dizisi
 */
export const requireRoles = (roles: string[]): AuthMiddleware => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Yetkilendirme gerekli', 401, ErrorCode.UNAUTHORIZED);
      }
      
      if (!roles.includes(req.user.role)) {
        throw new AppError(
          'Bu işlemi gerçekleştirmek için gerekli role sahip değilsiniz',
          403,
          ErrorCode.FORBIDDEN
        );
      }
      
      next();
    } catch (error) {
      if (error instanceof AppError) {
        ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
      } else if (error instanceof Error) {
        ApiResponse.error(res, error.message, 500);
      } else {
        ApiResponse.error(res, 'Yetkilendirme hatası', 500);
      }
    }
  };
};
