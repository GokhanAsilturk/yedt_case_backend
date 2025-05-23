import { Request } from 'express';
import { BaseError } from '../models/BaseError';
import ErrorLog from '../models/ErrorLog';

export class ErrorLogService {
  async logError(error: BaseError, req: Request): Promise<void> {
    const logEntry = {
      errorCode: error.errorCode,
      message: error.message,
      stackTrace: error.stack ?? '',
      severity: error.severity,
      metadata: error.metadata || {},
      timestamp: new Date(),
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    };

    try {
      await ErrorLog.create(logEntry);
      console.log('Hata başarıyla loglandı.');
    } catch (dbError) {
      console.error('Hata veritabanına kaydedilirken bir hata oluştu:', dbError);
    }
  }
}