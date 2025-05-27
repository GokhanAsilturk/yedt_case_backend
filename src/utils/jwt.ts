import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel } from '../types/models';

export interface JwtPayload {
  id: string;
  role: string;
  tokenVersion?: number;  // Token sürümü - kullanıcı logout olduğunda değişir
  iat?: number;
  exp?: number;
  jti?: string;  // JWT ID - her token için benzersiz tanımlayıcı
}

// JWT yapılandırması
const JWT_SECRET = process.env.JWT_SECRET ?? 'asdasdasdas';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h'; 
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';  

// Blacklist - geçersiz tokenlar için, gerçek uygulamada Redis veya DB kullanılmalı.
const invalidatedTokens = new Set<string>();

/**
 * Kullanıcı için access token oluşturur
 * @param user Kullanıcı objesi
 * @returns JWT access token
 */
export const generateAccessToken = (user: UserModel): string => {
  const jwtid = crypto.randomUUID();
  
  const payload: JwtPayload = {
    id: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
    jti: jwtid
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256',  
    audience: 'yedt-eğitim-sistemi',  
    issuer: 'yedt-backend-api'  
  } as jwt.SignOptions);
};

/**
 * Kullanıcı için refresh token oluşturur
 * @param user Kullanıcı objesi
 * @returns JWT refresh token
 */
export const generateRefreshToken = (user: UserModel): string => {
  const jwtid = crypto.randomUUID();
  
  const payload: JwtPayload = {
    id: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
    jti: jwtid
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
    algorithm: 'HS256',
    audience: 'yedt-eğitim-sistemi',
    issuer: 'yedt-backend-api'
  } as jwt.SignOptions);
};

/**
 * Token çiftini oluşturur (access ve refresh token)
 * @param user Kullanıcı objesi
 * @returns Oluşturulan token çifti
 */
export const generateTokenPair = (user: UserModel) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
};

/**
 * JWT token'ını doğrular
 * @param token JWT token
 * @returns Çözümlenmiş token yükü
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],  // Sadece bu algoritma ile imzalanmış tokenları kabul et
      audience: 'yedt-eğitim-sistemi',
      issuer: 'yedt-backend-api',
      complete: true  // Header, payload ve signature dahil tam token bilgisini al
    }) as jwt.JwtPayload & { jti?: string };
    
    // Token blacklist'te mi kontrol et
    if (decoded.jti && invalidatedTokens.has(decoded.jti)) {
      throw new Error('Token has been invalidated');
    }
    
    return decoded as unknown as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token signature');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token not yet valid');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Refresh token'dan yeni bir access token oluşturur
 * @param refreshToken Refresh token
 * @returns Yeni access token veya null (geçersiz refresh token durumunda)
 */
export const refreshAccessToken = async (refreshToken: string): Promise<string | null> => {
  try {
    const decoded = verifyToken(refreshToken) as JwtPayload & { jti?: string };
    
    // Kullanıcı kimliğini doğrula
    const user = await import('../models/User').then(m => m.default.findByPk(decoded.id));
    
    if (!user) {
      return null;
    }
    
    // Token sürümünü kontrol et (kullanıcı çıkış yaptığında değişir)
    if (decoded.tokenVersion !== user.tokenVersion) {
      return null;
    }
    
    // Yeni access token oluştur
    return generateAccessToken(user);
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

/**
 * Token'ı geçersiz kılar (blacklist'e ekler)
 * @param token JWT token
 */
export const invalidateToken = (token: string): void => {
  try {
    const decoded = jwt.decode(token, { complete: true }) as { payload: { jti?: string } } | null;
    
    if (decoded?.payload.jti) {
      invalidatedTokens.add(decoded.payload.jti);
    }
  } catch (error) {
    // Token decode edilemezse hata fırlatma, sadece ignore et
    console.error('Token invalidation failed:', error);
  }
};
