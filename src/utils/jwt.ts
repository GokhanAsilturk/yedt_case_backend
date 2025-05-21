import jwt from 'jsonwebtoken';
import { UserModel } from '../types/models';

interface JwtPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'your-default-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1d';

export const generateToken = (user: UserModel): string => {
  const payload: JwtPayload = {
    id: user.id,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  } as jwt.SignOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token signature');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else {
      throw new Error('Token verification failed');
    }
  }
};
