"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
// Ortama göre veritabanı yapılandırması belirle
const env = (_a = process.env.NODE_ENV) !== null && _a !== void 0 ? _a : 'development';
// Test ortamı için ayrı veritabanı yapılandırması
const createTestConnection = () => {
    return new sequelize_1.Sequelize({
        dialect: 'sqlite',
        storage: ':memory:', // In-memory SQLite veritabanı
        logging: false,
    });
};
// Geliştirme ve üretim ortamı için PostgreSQL yapılandırması
const createNormalConnection = () => {
    var _a, _b, _c, _d, _e;
    return new sequelize_1.Sequelize({
        dialect: 'postgres',
        host: (_a = process.env.DB_HOST) !== null && _a !== void 0 ? _a : 'localhost',
        port: parseInt((_b = process.env.DB_PORT) !== null && _b !== void 0 ? _b : '5432'),
        username: (_c = process.env.DB_USER) !== null && _c !== void 0 ? _c : 'postgres',
        password: (_d = process.env.DB_PASSWORD) !== null && _d !== void 0 ? _d : '1234',
        database: (_e = process.env.DB_NAME) !== null && _e !== void 0 ? _e : 'yedt_case',
        logging: false,
    });
};
// Ortama göre uygun bağlantıyı seç
exports.sequelize = env === 'test'
    ? createTestConnection()
    : createNormalConnection();
//# sourceMappingURL=database.js.map