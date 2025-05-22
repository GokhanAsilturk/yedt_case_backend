import { Request, Response } from 'express';
import { Op } from 'sequelize';
import User from '../models/User';
import ApiResponse from '../utils/apiResponse';
import { generateTokenPair, invalidateToken } from '../utils/jwt';
import { AppError, ErrorCode } from '../middleware/errorHandler';

interface LoginRequest extends Request {
  body: {
    username: string;
    password: string;
  };
}

interface RegisterRequest extends Request {
  body: {
    username: string;
    email: string;
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
  user?: any; // Kullanıcı bilgisi
}

class AuthController {
  static async login(req: LoginRequest, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username } });

      if (!user) {
        throw new AppError('Geçersiz kullanıcı adı veya şifre', 401, ErrorCode.UNAUTHORIZED);
      }
      
      const isValidPassword = await user.validatePassword(password);
      
      if (!isValidPassword) {
        throw new AppError('Geçersiz kullanıcı adı veya şifre', 401, ErrorCode.UNAUTHORIZED);
      }

      // Access ve refresh token çifti oluştur
      const { accessToken, refreshToken } = generateTokenPair(user);
      
      // Hassas kullanıcı bilgilerini çıkar
      const safeUser = {
        id: user.id,
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
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  }

  static async register(req: RegisterRequest, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        where: { 
          [Op.or]: [{ username }, { email }]
        }
      });

      if (existingUser) {
        ApiResponse.error(res, 'Username or email already exists', 400);
        return;
      }

      // Create admin user
      const user = await User.create({
        username,
        email,
        password,
        role: 'admin'  // Always create as admin
      });

      // Hassas kullanıcı bilgilerini çıkar
      const safeUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      
      const { accessToken, refreshToken } = generateTokenPair(user);
      
      ApiResponse.success(
        res,
        { user: safeUser, accessToken, refreshToken },
        'Yönetici kullanıcı başarıyla kaydedildi',
        201
      );
    } catch (error) {
      ApiResponse.error(res, error instanceof Error ? error.message : 'An error occurred');
    }
  }
  
  /**
   * Refresh token kullanarak yeni bir access token oluşturur
   */
  static async refreshToken(req: RefreshTokenRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        throw new AppError('Refresh token gerekli', 400, ErrorCode.BAD_REQUEST);
      }
      
      const newAccessToken = await import('../utils/jwt').then(m =>
        m.refreshAccessToken(refreshToken)
      );
      
      if (!newAccessToken) {
        throw new AppError('Geçersiz veya süresi dolmuş refresh token', 401, ErrorCode.UNAUTHORIZED);
      }
      
      ApiResponse.success(res, { accessToken: newAccessToken });
    } catch (error) {
      if (error instanceof AppError) {
        ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
      } else if (error instanceof Error) {
        ApiResponse.error(res, error.message, 500);
      } else {
        ApiResponse.error(res, 'Token yenileme sırasında bir hata oluştu', 500);
      }
    }
  }
  
  /**
   * Kullanıcı çıkışını yapar ve tokenları geçersiz kılar
   */
  static async logout(req: LogoutRequest, res: Response): Promise<void> {
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
      if (error instanceof AppError) {
        ApiResponse.error(res, error.message, error.statusCode, { code: error.errorCode });
      } else if (error instanceof Error) {
        ApiResponse.error(res, error.message, 500);
      } else {
        ApiResponse.error(res, 'Çıkış yapılırken bir hata oluştu', 500);
      }
    }
  }
}

export default AuthController;
