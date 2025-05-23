import { BaseError } from '../models/BaseError';
import { ErrorCode } from '../constants/errorCodes';
import { ErrorSeverity } from '../types/errorTypes';

export class ErrorTransformer {
  transform(err: Error): BaseError {
    // Burada hataları dönüştürme mantığı yer alacak.
    // Örneğin, farklı hata türlerini BaseError'a dönüştürebilirsiniz.
    // Şimdilik, tüm hataları genel bir hata olarak ele alalım.
    return new BaseError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      err.message ?? 'Internal Server Error',
      'critical' as ErrorSeverity,
      500
    );
  }
}