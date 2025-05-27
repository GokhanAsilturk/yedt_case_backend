import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import { BaseError } from '../../error/models/BaseError';
import { ValidationError } from '../../error/models/ValidationError';
import { BusinessError } from '../../error/models/BusinessError';
import { SecurityError } from '../../error/models/SecurityError';
import { TechnicalError } from '../../error/models/TechnicalError';
import { errorHandler, notFoundHandler } from '../../middleware/errorHandler';
import { ErrorCode } from '../../error/constants/errorCodes';
import { HttpStatusCode } from '../../error/constants/httpStatusCodes';
import * as errorUtils from '../../error/utils/errorUtils';

jest.mock('../../error/services/ErrorLogService', () => {
  return {
    ErrorLogService: jest.fn().mockImplementation(() => {
      return { logError: jest.fn().mockImplementation((error, req) => Promise.resolve(undefined)) };
    })
  };
});

// Test için mock API oluşturma
const app = express();

// Test rotaları oluştur - her biri farklı bir hata türünü tetikler
app.get('/api/error/validation', (req: Request, res: Response, next: NextFunction) => {
  const error = new ValidationError(
    'Geçersiz giriş değeri',
    { field: 'email', message: 'Geçerli bir e-posta adresi girilmelidir' }
  );
  next(error);
});

app.get('/api/error/business', (req: Request, res: Response, next: NextFunction) => {
  const error = new BusinessError('Kaydedilecek öğrenci zaten mevcut');
  next(error);
});

app.get('/api/error/security', (req: Request, res: Response, next: NextFunction) => {
  const error = new SecurityError('Bu işlem için yetkiniz bulunmamaktadır');
  next(error);
});

app.get('/api/error/technical', (req: Request, res: Response, next: NextFunction) => {
  const error = new TechnicalError('Veritabanı bağlantısı sağlanamadı');
  next(error);
});

app.get('/api/error/base', (req: Request, res: Response, next: NextFunction) => {
  const error = new BaseError(
    ErrorCode.GENERIC_ERROR,
    'Genel bir hata oluştu',
    'error',
    HttpStatusCode.INTERNAL_SERVER_ERROR
  );
  next(error);
});

app.get('/api/error/standard', (req: Request, res: Response, next: NextFunction) => {
  const error = new Error('Standart JS hatası');
  next(error);
});

app.get('/api/error/utils/validation', (req: Request, res: Response, next: NextFunction) => {
  const error = errorUtils.createValidationError(
    'Doğrulama hatası (utils)',
    HttpStatusCode.BAD_REQUEST,
    { field: 'password', message: 'Şifre en az 8 karakter olmalıdır' }
  );
  next(error);
});

app.get('/api/error/utils/business', (req: Request, res: Response, next: NextFunction) => {
  const error = errorUtils.createBusinessError('İş mantığı hatası (utils)');
  next(error);
});

app.get('/api/error/utils/security', (req: Request, res: Response, next: NextFunction) => {
  const error = errorUtils.createSecurityError('Güvenlik hatası (utils)');
  next(error);
});

app.get('/api/error/utils/technical', (req: Request, res: Response, next: NextFunction) => {
  const error = errorUtils.createTechnicalError('Teknik hata (utils)');
  next(error);
});

// 404 handler
app.use(notFoundHandler);

// Error handler middleware'i
app.use(function(err: Error, req: Request, res: Response, next: NextFunction) {
  // async fonksiyonu non-async olarak çağırıyoruz
  errorHandler(err, req, res, next).catch(next);
  // Promise'i döndürmüyoruz - express middleware'leri Promise döndürmemelidir
});

describe('Hata Yönetim Sistemi Entegrasyon Testleri', () => {
  describe('Hata Sınıfları Testleri', () => {
    it('ValidationError doğru şekilde işlenmeli', async () => {
      const response = await request(app).get('/api/error/validation');
      
      expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
      expect(response.body).toEqual({
        success: false,
        message: 'Geçersiz giriş değeri',
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          details: { field: 'email', message: 'Geçerli bir e-posta adresi girilmelidir' }
        }
      });
    });

    it('BusinessError doğru şekilde işlenmeli', async () => {
      const response = await request(app).get('/api/error/business');
      
      expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
      expect(response.body).toEqual({
        success: false,
        message: 'Kaydedilecek öğrenci zaten mevcut',
        error: { code: ErrorCode.BUSINESS_ERROR }
      });
    });

    it('SecurityError doğru şekilde işlenmeli', async () => {
      const response = await request(app).get('/api/error/security');
      
      expect(response.status).toBe(HttpStatusCode.FORBIDDEN);
      expect(response.body).toEqual({
        success: false,
        message: 'Bu işlem için yetkiniz bulunmamaktadır',
        error: { code: ErrorCode.SECURITY_ERROR }
      });
    });

    it('TechnicalError doğru şekilde işlenmeli', async () => {
      const response = await request(app).get('/api/error/technical');
      
      expect(response.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({
        success: false,
        message: 'Veritabanı bağlantısı sağlanamadı',
        error: { code: ErrorCode.TECHNICAL_ERROR }
      });
    });

    it('BaseError doğru şekilde işlenmeli', async () => {
      const response = await request(app).get('/api/error/base');
      
      expect(response.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({
        success: false,
        message: 'Genel bir hata oluştu',
        error: { code: ErrorCode.GENERIC_ERROR }
      });
    });

    it('Standart Error doğru şekilde işlenmeli', async () => {
      const response = await request(app).get('/api/error/standard');
      
      expect(response.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({
        success: false,
        message: 'Internal Server Error'
      });
    });
  });

  describe('errorUtils Yardımcı Fonksiyonları Testleri', () => {
    it('createValidationError fonksiyonu doğru şekilde işlenmeli', async () => {
      const response = await request(app).get('/api/error/utils/validation');
      
      expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
      expect(response.body).toEqual({
        success: false,
        message: 'Doğrulama hatası (utils)',
        error: { 
          code: ErrorCode.VALIDATION_ERROR,
          details: { field: 'password', message: 'Şifre en az 8 karakter olmalıdır' }
        }
      });
    });

    it('createBusinessError fonksiyonu doğru şekilde işlenmeli', async () => {
      const response = await request(app).get('/api/error/utils/business');
      
      expect(response.status).toBe(HttpStatusCode.BAD_REQUEST);
      expect(response.body).toEqual({
        success: false,
        message: 'İş mantığı hatası (utils)',
        error: { code: ErrorCode.BUSINESS_ERROR }
      });
    });

    it('createSecurityError fonksiyonu doğru şekilde işlenmeli', async () => {
      const response = await request(app).get('/api/error/utils/security');
      
      expect(response.status).toBe(HttpStatusCode.FORBIDDEN);
      expect(response.body).toEqual({
        success: false,
        message: 'Güvenlik hatası (utils)',
        error: { code: ErrorCode.SECURITY_ERROR }
      });
    });

    it('createTechnicalError fonksiyonu doğru şekilde işlenmeli', async () => {
      const response = await request(app).get('/api/error/utils/technical');
      
      expect(response.status).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({
        success: false,
        message: 'Teknik hata (utils)',
        error: { code: ErrorCode.TECHNICAL_ERROR }
      });
    });
  });

  describe('notFoundHandler Testi', () => {
    it('Bulunmayan rota için 404 hatası döndürmeli', async () => {
      const response = await request(app).get('/api/nonexistent-route');
      
      expect(response.status).toBe(HttpStatusCode.NOT_FOUND);
      expect(response.body).toEqual({
        success: false,
        message: '/api/nonexistent-route yolu bulunamadı',
        error: { code: ErrorCode.NOT_FOUND }
      });
    });
  });
});