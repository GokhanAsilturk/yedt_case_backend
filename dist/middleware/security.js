"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sqlInjectionProtection = exports.customXssProtection = exports.setupSecurityMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
/**
 * Temel güvenlik middleware'lerini yapılandıran ve uygulayan fonksiyon
 * @param app Express uygulaması
 */
const setupSecurityMiddleware = (app) => {
    // Helmet - HTTP başlıklarını güvenli hale getirir
    app.use((0, helmet_1.default)());
    // Content-Security-Policy başlıklarını ayarla
    app.use(helmet_1.default.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        }
    }));
    // Sıkı-Transport-Güvenliği başlığını ayarla
    app.use(helmet_1.default.hsts({
        maxAge: 15552000, // 180 gün
        includeSubDomains: true,
        preload: true
    }));
    // X-XSS-Protection başlığını ayarla
    app.use(helmet_1.default.xssFilter());
    // X-Content-Type-Options başlığını ayarla
    app.use(helmet_1.default.noSniff());
    // X-Frame-Options başlığını ayarla
    app.use(helmet_1.default.frameguard({ action: 'deny' }));
    // Referrer-Policy başlığını ayarla
    app.use(helmet_1.default.referrerPolicy({ policy: 'same-origin' }));
    // Özel XSS koruması middleware'i
    app.use(exports.customXssProtection);
};
exports.setupSecurityMiddleware = setupSecurityMiddleware;
/**
 * Özel XSS koruması middleware'i
 * req.query değerlerini değiştirmeden XSS koruması sağlar
 */
const customXssProtection = (req, res, next) => {
    // Request body için XSS koruması
    if (req.body) {
        sanitizeObject(req.body);
    }
    // Request params için XSS koruması
    if (req.params) {
        sanitizeObject(req.params);
    }
    // NOT: req.query nesnesini doğrudan değiştirmiyoruz
    // Gerekirse query değerlerinin sanitize edilmiş kopyası oluşturulabilir
    next();
};
exports.customXssProtection = customXssProtection;
/**
 * Bir nesnenin içindeki string değerleri XSS saldırılarına karşı temizler
 * @param obj Temizlenecek nesne
 */
function sanitizeObject(obj, isSqlSanitize = false) {
    if (!obj || typeof obj !== 'object')
        return;
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
            if (isSqlSanitize) {
                // SQL injection koruması
                obj[key] = obj[key]
                    .replace(/(\b|\s)SELECT(\b|\s)/ig, '')
                    .replace(/(\b|\s)INSERT(\b|\s)/ig, '')
                    .replace(/(\b|\s)UPDATE(\b|\s)/ig, '')
                    .replace(/(\b|\s)DELETE(\b|\s)/ig, '')
                    .replace(/(\b|\s)DROP(\b|\s)/ig, '')
                    .replace(/(\b|\s)ALTER(\b|\s)/ig, '')
                    .replace(/(\b|\s)CREATE(\b|\s)/ig, '')
                    .replace(/(\b|\s)TRUNCATE(\b|\s)/ig, '')
                    .replace(/(\b|\s)--/g, '')
                    .replace(/'/g, "''");
            }
            else {
                // XSS koruması
                obj[key] = obj[key]
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;')
                    .replace(/\//g, '&#x2F;');
            }
        }
        else if (typeof obj[key] === 'object') {
            sanitizeObject(obj[key], isSqlSanitize);
        }
    });
}
/**
 * SQL Injection koruması için input sanitization middleware'i
 * Bu middleware, SQL injection saldırılarına karşı koruma sağlar
 */
const sqlInjectionProtection = (req, res, next) => {
    // SQL injection için tehlikeli olabilecek parametreleri temizle
    const sanitizeValue = (value) => {
        if (typeof value === 'string') {
            // SQL injection için kullanılabilecek karakterleri temizle
            return value
                .replace(/(\b|\s)SELECT(\b|\s)/ig, '')
                .replace(/(\b|\s)INSERT(\b|\s)/ig, '')
                .replace(/(\b|\s)UPDATE(\b|\s)/ig, '')
                .replace(/(\b|\s)DELETE(\b|\s)/ig, '')
                .replace(/(\b|\s)DROP(\b|\s)/ig, '')
                .replace(/(\b|\s)ALTER(\b|\s)/ig, '')
                .replace(/(\b|\s)CREATE(\b|\s)/ig, '')
                .replace(/(\b|\s)TRUNCATE(\b|\s)/ig, '')
                .replace(/(\b|\s)--/g, '')
                .replace(/'/g, "''");
        }
        else if (value !== null && typeof value === 'object') {
            // Derin kopya oluştur, orijinal nesneyi değiştirme
            const sanitizedObject = Array.isArray(value) ? [] : {};
            Object.keys(value).forEach((key) => {
                sanitizedObject[key] = sanitizeValue(value[key]);
            });
            return sanitizedObject;
        }
        return value;
    };
    // Request body içindeki verileri temizle
    if (req.body) {
        // Özel nesne temizleme fonksiyonunu kullan - doğrudan içeriği günceller
        sanitizeObject(req.body, true);
    }
    // req.query değerlerini güvenle işle (req.query'yi asla değiştirme)
    if (req.query && Object.keys(req.query).length > 0) {
        // Sadece loglama için query'nin temizlenmiş bir kopyasını oluştur
        const sanitizedQuery = Object.assign({}, req.query);
        sanitizeObject(sanitizedQuery, true);
        // console.log('Sanitized query:', sanitizedQuery);
        // NOT: req.query'ye hiç dokunmuyoruz, salt okunur!
    }
    // Request params değerlerini temizle (güvenli yöntemle)
    if (req.params) {
        // Params nesnesini doğrudan güncelle
        sanitizeObject(req.params, true);
    }
    next();
};
exports.sqlInjectionProtection = sqlInjectionProtection;
//# sourceMappingURL=security.js.map