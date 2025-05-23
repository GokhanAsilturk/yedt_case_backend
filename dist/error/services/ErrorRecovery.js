"use strict";
// Hata kurtarma stratejileri burada tanımlanacak.
// Örneğin:
// - Fallback mekanizmaları
// - Retry stratejileri
// - Circuit breaker pattern desteği
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorRecoveryService = void 0;
class ErrorRecoveryService {
    constructor() {
        // Circuit breaker pattern için basit bir örnek (gerçek uygulamada daha karmaşık olmalı)
        this.isCircuitOpen = false;
        this.failureCount = 0;
        this.failureThreshold = 3;
        this.resetTimeout = 10000; // 10 saniye
    }
    static getInstance() {
        if (!ErrorRecoveryService.instance) {
            ErrorRecoveryService.instance = new ErrorRecoveryService();
        }
        return ErrorRecoveryService.instance;
    }
    // Örnek bir fallback metodu
    async executeWithFallback(fn, fallback) {
        try {
            return await fn();
        }
        catch (error) {
            console.error('Hata oluştu, fallback uygulanıyor:', error);
            return await fallback();
        }
    }
    // Örnek bir retry metodu (basit bir örnek)
    async retry(fn, retries = 3, delay = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            }
            catch (error) {
                console.error(`Hata oluştu, tekrar deneniyor (${i + 1}/${retries}):`, error);
                if (i === retries - 1) {
                    throw error; // Son denemede hatayı tekrar fırlat
                }
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw new Error('Retry failed'); // Bu satır hiçbir zaman çalışmamalı
    }
    async executeWithCircuitBreaker(fn) {
        if (this.isCircuitOpen) {
            console.warn('Circuit açık, işlem reddedildi.');
            throw new Error('Circuit açık');
        }
        try {
            const result = await fn();
            this.failureCount = 0; // Başarılı olursa sıfırla
            return result;
        }
        catch (error) {
            this.failureCount++;
            console.error('Hata oluştu (Circuit Breaker):', error);
            if (this.failureCount >= this.failureThreshold) {
                this.isCircuitOpen = true;
                console.warn('Circuit açıldı.');
                setTimeout(() => {
                    this.isCircuitOpen = false;
                    this.failureCount = 0;
                    console.warn('Circuit kapandı.');
                }, this.resetTimeout);
            }
            throw error;
        }
    }
}
exports.ErrorRecoveryService = ErrorRecoveryService;
//# sourceMappingURL=ErrorRecovery.js.map