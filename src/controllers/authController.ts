import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Student from '../models/Student';
import ApiResponse from '../utils/apiResponse';
import { generateTokenPair, invalidateToken } from '../utils/jwt';
import { AppError } from '../error/models/AppError';
import { ErrorCode } from '../error/constants/errorCodes';
import { ErrorMessage } from '../error/constants/errorMessages';

interface LoginRequest extends Request {
  body: {
    username: string;
    password: string;
  };
}

interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

interface LogoutRequest extends Request {
  body: {
    refreshToken?: string;
  };
  headers: {
    authorization?: string;
  };
  user?: any;
}

class AuthController {
  /**
   * Refresh token kullanarak yeni bir access token oluşturur
   */
  static async refreshToken(req: RefreshTokenRequest, res: Response, next?: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new AppError(ErrorMessage.BAD_REQUEST.tr, 400, ErrorCode.BAD_REQUEST);
      }
      
      const newAccessToken = await import('../utils/jwt').then(m =>
        m.refreshAccessToken(refreshToken)
      );
      
      if (!newAccessToken) {
        throw new AppError(ErrorMessage.UNAUTHORIZED.tr, 401, ErrorCode.UNAUTHORIZED);
      }
      
      ApiResponse.success(res, { accessToken: newAccessToken });
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Token yenileme sırasında bir hata oluştu', 500);
        }
    }
  }
  
  /**
   * Kullanıcı çıkışını yapar ve tokenları geçersiz kılar
   */
  static async logout(req: LogoutRequest, res: Response, next?: NextFunction): Promise<void> {
    try {
      // Access token'ı geçersiz kıl (eğer varsa)
      const accessToken = req.headers.authorization?.replace('Bearer ', '');
      if (accessToken) {
        invalidateToken(accessToken);
      }
      
      // Refresh token'ı geçersiz kıl (eğer varsa)
      const { refreshToken } = req.body;
      if (refreshToken) {
        invalidateToken(refreshToken);
      }
      
      // Kullanıcının token sürümünü artır (varsa)
      if (req.user?.id) {
        await User.update(
          { tokenVersion: User.sequelize!.literal('tokenVersion + 1') },
          { where: { id: req.user.id } }
        );
      }
      
      ApiResponse.success(res, null, 'Başarıyla çıkış yapıldı');
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
          ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
        } else {
          ApiResponse.error(res, error instanceof Error ? error.message : 'Çıkış yapılırken bir hata oluştu', 500);
        }
    }
  }
  static async adminLogin(req: LoginRequest, res: Response, next?: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username, role: 'admin' } });

      if (!user) {
        throw new AppError(ErrorMessage.INVALID_CREDENTIALS.tr, 401, ErrorCode.UNAUTHORIZED);
      }

      const isValidPassword = await user.validatePassword(password);

      if (!isValidPassword) {
        throw new AppError(ErrorMessage.INVALID_CREDENTIALS.tr, 401, ErrorCode.UNAUTHORIZED);
      }

      const { accessToken, refreshToken } = generateTokenPair(user);

      const safeUser = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };

      ApiResponse.success(res, {
        user: safeUser,
        accessToken,
        refreshToken
      });
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
        ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
      } else {
        ApiResponse.error(res, error instanceof Error ? error.message : 'Bir hata oluştu', 500);
      }
    }
  }

  static async studentLogin(req: LoginRequest, res: Response, next?: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username, role: 'student' } });

      if (!user) {
        throw new AppError(ErrorMessage.INVALID_CREDENTIALS.tr, 401, ErrorCode.UNAUTHORIZED);
      }

      const isValidPassword = await user.validatePassword(password);

      if (!isValidPassword) {
        throw new AppError(ErrorMessage.INVALID_CREDENTIALS.tr, 401, ErrorCode.UNAUTHORIZED);
      }

      // Öğrenci kaydını bul
      const student = await Student.findOne({ where: { userId: user.id } });
      
      if (!student) {
        throw new AppError('Öğrenci kaydı bulunamadı', 404, ErrorCode.NOT_FOUND);
      }      const { accessToken, refreshToken } = generateTokenPair(user);      
      
      const responseData = {
        user: {
          id: student.id,
          userId: user.id,
          firstName: student.firstName,
          lastName: student.lastName,
          username: user.username,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      };

      // ApiResponse kullanarak yanıtı gönderelim
      ApiResponse.success(res, responseData);
    } catch (error) {
      if (next) {
        next(error);
      } else if (error instanceof AppError) {
        ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
      } else {
        ApiResponse.error(res, error instanceof Error ? error.message : 'Bir hata oluştu', 500);
      }
    }
  }
}

export default AuthController;
