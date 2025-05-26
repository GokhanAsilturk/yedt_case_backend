"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonSchemas = exports.validate = exports.validatePassword = void 0;
const joi_1 = __importDefault(require("joi"));
const AppError_1 = require("../error/models/AppError");
const errorCodes_1 = require("../error/constants/errorCodes");
const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};
exports.validatePassword = validatePassword;
/**
 * Joi validasyon şemalarını kullanarak request validation gerçekleştiren middleware
 * @param schema Doğrulama için kullanılacak Joi şema nesnesi
 */
const validate = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        // Request body doğrulama
        if (schema.body) {
            const { error } = joi_1.default.object(schema.body).validate(req.body, { abortEarly: false });
            if (error) {
                validationErrors.push(...error.details.map(detail => detail.message));
            }
        }
        // Request query doğrulama
        if (schema.query) {
            const { error } = joi_1.default.object(schema.query).validate(req.query, { abortEarly: false });
            if (error) {
                validationErrors.push(...error.details.map(detail => detail.message));
            }
        }
        // Request params doğrulama
        if (schema.params) {
            const { error } = joi_1.default.object(schema.params).validate(req.params, { abortEarly: false });
            if (error) {
                validationErrors.push(...error.details.map(detail => detail.message));
            }
        }
        // Hata varsa, hata yanıtı döndür
        if (validationErrors.length > 0) {
            throw new AppError_1.AppError(`Doğrulama hatası: ${validationErrors.join(', ')}`, 400, errorCodes_1.ErrorCode.VALIDATION_ERROR);
        }
        next();
    };
};
exports.validate = validate;
// Ortak kullanılacak Joi şemaları
exports.commonSchemas = {
    id: joi_1.default.string().uuid().required().messages({
        'string.guid': 'Geçersiz ID formatı. UUID olmalıdır.',
        'any.required': 'ID alanı zorunludur.'
    }),
    email: joi_1.default.string().email().required().messages({
        'string.email': 'Geçersiz e-posta adresi formatı.',
        'any.required': 'E-posta alanı zorunludur.'
    }),
    password: joi_1.default.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required().messages({
        'string.min': 'Şifre en az 8 karakter uzunluğunda olmalıdır.',
        'string.pattern.base': 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.',
        'any.required': 'Şifre alanı zorunludur.'
    }),
    username: joi_1.default.string().alphanum().min(3).max(30).required().messages({
        'string.alphanum': 'Kullanıcı adı sadece harf ve rakam içermelidir.',
        'string.min': 'Kullanıcı adı en az 3 karakter uzunluğunda olmalıdır.',
        'string.max': 'Kullanıcı adı en fazla 30 karakter uzunluğunda olmalıdır.',
        'any.required': 'Kullanıcı adı alanı zorunludur.'
    }),
    pagination: {
        page: joi_1.default.number().integer().min(1).default(1).messages({
            'number.base': 'Sayfa numarası bir sayı olmalıdır.',
            'number.integer': 'Sayfa numarası bir tam sayı olmalıdır.',
            'number.min': 'Sayfa numarası en az 1 olmalıdır.'
        }),
        limit: joi_1.default.number().integer().min(1).max(100).default(10).messages({
            'number.base': 'Limit bir sayı olmalıdır.',
            'number.integer': 'Limit bir tam sayı olmalıdır.',
            'number.min': 'Limit en az 1 olmalıdır.',
            'number.max': 'Limit en fazla 100 olmalıdır.'
        })
    }
};
//# sourceMappingURL=validator.js.map