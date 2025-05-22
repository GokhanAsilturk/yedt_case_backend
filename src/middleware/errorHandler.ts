import { Request, Response, NextFunction } from 'express';
import ApiResponse from '../utils/apiResponse';

// Standart hata kodları
export enum ErrorCode {
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER = 'INTERNAL_SERVER',
  DATABASE_ERROR = 'DATABASE_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID'
}

// Özel hata sınıfı
export class AppError extends Error {
  statusCode: number;
  errorCode: ErrorCode;
  isOperational: boolean;

  constructor(message: string, statusCode: number, errorCode: ErrorCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Sequelize hatalarını işlemek için yardımcı fonksiyon
const handleSequelizeError = (err: any): AppError => {
  if (err.name === 'SequelizeValidationError') {
    return new AppError(
      'Veri doğrulama hatası: ' + err.errors.map((e: any) => e.message).join(', '),
      400,
      ErrorCode.VALIDATION_ERROR
    );
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return new AppError(
      'Veritabanı benzersizlik hatası: Aynı kayıt zaten mevcut',
      400,
      ErrorCode.VALIDATION_ERROR
    );
  }
  
  return new AppError(
    'Veritabanı hatası: ' + err.message,
    500,
    ErrorCode.DATABASE_ERROR
  );
};

// Geliştirme ortamında detaylı hata, üretim ortamında basit hata
const sendErrorResponse = (err: AppError, req: Request, res: Response) => {
  // Operasyonel hatalar güvenle istemciye gönderilebilir
  if (err.isOperational) {
    return ApiResponse.error(
      res, 
      err.message, 
      err.statusCode, 
      { code: err.errorCode }
    );
  }
  
  // Operasyonel olmayan hatalar (programlama hataları) için
  // detaylı bilgi vermeden genel bir hata mesajı gönder
  console.error('KRITIK HATA:', err);
  return ApiResponse.error(
    res,
    'Bir şeyler yanlış gitti',
    500,
    { code: ErrorCode.INTERNAL_SERVER }
  );
};

// Global hata yakalama middleware'i
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  let error: AppError;

  // Özel hata sınıfımızın bir örneği mi?
  if (err instanceof AppError) {
    error = err;
  } 
  // Sequelize hatası mı?
  else if (err.name?.startsWith('Sequelize')) {
    error = handleSequelizeError(err);
  } 
  // JWT hatası mı?
  else if (err.name === 'JsonWebTokenError') {
    error = new AppError('Geçersiz token', 401, ErrorCode.TOKEN_INVALID);
  } 
  else if (err.name === 'TokenExpiredError') {
    error = new AppError('Token süresi doldu', 401, ErrorCode.TOKEN_EXPIRED);
  } 
  // Diğer hatalar
  else {
    error = new AppError(
      err.message || 'Bir şeyler yanlış gitti',
      500,
      ErrorCode.INTERNAL_SERVER,
      false
    );
  }

  sendErrorResponse(error, req, res);
};

// 404 Hatası için middleware
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const err = new AppError(`${req.originalUrl} yolu bulunamadı`, 404, ErrorCode.NOT_FOUND);
  next(err);
};