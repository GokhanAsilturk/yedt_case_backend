import { BaseError } from '../models/BaseError';

export class ErrorRecovery {
  async recover(error: BaseError): Promise<void> {
    // Hata kurtarma mantığı
    // Örneğin, veritabanı bağlantısını yeniden deneme, önbelleği temizleme vb.
    console.log('Hata Kurtarma İşlemi:', error.errorCode, error.message);
    // Burada kurtarma işlemleri gerçekleştirilir.
  }
}