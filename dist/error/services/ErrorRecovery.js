"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorRecovery = void 0;
class ErrorRecovery {
    async recover(error) {
        // Hata kurtarma mantığı
        // Örneğin, veritabanı bağlantısını yeniden deneme, önbelleği temizleme vb.
        console.log('Hata Kurtarma İşlemi:', error.errorCode, error.message);
        // Burada kurtarma işlemleri gerçekleştirilir.
    }
}
exports.ErrorRecovery = ErrorRecovery;
//# sourceMappingURL=ErrorRecovery.js.map