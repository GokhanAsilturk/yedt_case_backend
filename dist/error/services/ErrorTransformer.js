"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitize = sanitize;
function sanitize(data) {
    // Burada hassas bilgileri temizleme işlemleri gerçekleştirilir.
    // Örneğin, parolalar, API anahtarları gibi veriler temizlenebilir.
    if (typeof data === 'object' && data !== null) {
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('apikey')) {
                    data[key] = '***'; // Hassas bilgileri maskele
                }
                else {
                    data[key] = sanitize(data[key]); // Rekürsif olarak iç içe objeleri temizle
                }
            }
        }
    }
    return data;
}
//# sourceMappingURL=ErrorTransformer.js.map