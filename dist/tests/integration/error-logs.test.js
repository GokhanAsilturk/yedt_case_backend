"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const database_1 = require("../../config/database");
const ErrorLog_1 = __importDefault(require("../../error/models/ErrorLog"));
const setup_1 = require("../setup");
const errorCodes_1 = require("../../error/constants/errorCodes");
describe('Error Logs API Testleri', () => {
    let adminToken;
    let userToken;
    let errorLogs;
    beforeAll(async () => {
        // Veritabanını temizle
        await database_1.sequelize.sync({ force: true });
        // Admin ve normal kullanıcı oluştur
        const adminUser = await (0, setup_1.createTestUser)({ role: 'admin' });
        const normalUser = await (0, setup_1.createTestUser)({ role: 'student' });
        // Token'ları al
        const adminResponse = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: adminUser.email, password: '123456' });
        adminToken = adminResponse.body.data.token;
        const userResponse = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({ email: normalUser.email, password: '123456' });
        userToken = userResponse.body.data.token;
        // Test için error log kayıtları oluştur
        const baseDate = new Date();
        errorLogs = await Promise.all([
            ErrorLog_1.default.create({
                errorCode: errorCodes_1.ErrorCode.VALIDATION_ERROR,
                message: 'Test error 1',
                stackTrace: 'Test stack trace 1',
                severity: 'error',
                metadata: {},
                timestamp: new Date(baseDate.getTime() - 1000), // 1 saniye önce
            }),
            ErrorLog_1.default.create({
                errorCode: errorCodes_1.ErrorCode.BUSINESS_ERROR,
                message: 'Test error 2',
                stackTrace: 'Test stack trace 2',
                severity: 'warning',
                metadata: {},
                timestamp: new Date(baseDate.getTime() - 2000), // 2 saniye önce
            }),
            ErrorLog_1.default.create({
                errorCode: errorCodes_1.ErrorCode.TECHNICAL_ERROR,
                message: 'Test error 3',
                stackTrace: 'Test stack trace 3',
                severity: 'critical',
                metadata: {},
                timestamp: new Date(baseDate.getTime()), // en yeni
            }),
            ErrorLog_1.default.create({
                errorCode: errorCodes_1.ErrorCode.SECURITY_ERROR,
                message: 'Test error 4',
                stackTrace: 'Test stack trace 4',
                severity: 'error',
                metadata: {},
                timestamp: new Date(baseDate.getTime() - 3000), // 3 saniye önce
            }),
        ]);
    });
    afterAll(async () => {
        await database_1.sequelize.close();
    });
    describe('GET /api/errors', () => {
        it('Admin olmayan kullanıcı 403 hatası almalı', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/errors?page=1&limit=10')
                .set('Authorization', `Bearer ${userToken}`);
            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('yetkiniz bulunmamaktadır');
        });
        it('Admin kullanıcı başarılı şekilde error loglarını alabilmeli', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/errors?page=1&limit=10')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data.rows)).toBe(true);
            expect(response.body.data.rows.length).toBe(4);
            expect(response.body.data.count).toBe(4); // Toplam kayıt sayısı kontrolü
        });
        it('Limit parametresi doğru çalışmalı', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/errors?page=1&limit=2')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.rows.length).toBe(2);
            expect(response.body.data.count).toBe(4); // Toplam kayıt sayısı değişmemeli
        });
        it('Page parametresi doğru çalışmalı', async () => {
            // İlk sayfa
            const response1 = await (0, supertest_1.default)(app_1.default)
                .get('/api/errors?page=1&limit=2')
                .set('Authorization', `Bearer ${adminToken}`);
            // İkinci sayfa
            const response2 = await (0, supertest_1.default)(app_1.default)
                .get('/api/errors?page=2&limit=2')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response1.body.data.rows[0].id).not.toBe(response2.body.data.rows[0].id);
            expect(response1.body.data.rows.length).toBe(2);
            expect(response2.body.data.rows.length).toBe(2);
            expect(response1.body.data.count).toBe(4); // Her iki sayfada da toplam kayıt sayısı aynı olmalı
            expect(response2.body.data.count).toBe(4);
        });
        it('Loglar en yeni en üstte olacak şekilde sıralı gelmeli', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/errors?page=1&limit=10')
                .set('Authorization', `Bearer ${adminToken}`);
            const logs = response.body.data.rows;
            expect(new Date(logs[0].timestamp).getTime()).toBeGreaterThan(new Date(logs[1].timestamp).getTime());
            expect(new Date(logs[1].timestamp).getTime()).toBeGreaterThan(new Date(logs[2].timestamp).getTime());
            expect(new Date(logs[2].timestamp).getTime()).toBeGreaterThan(new Date(logs[3].timestamp).getTime());
            // En yeni kaydın timestamp'i test verisi oluştururken set ettiğimiz en yeni tarih olmalı
            expect(new Date(logs[0].timestamp).getTime()).toBe(errorLogs[2].timestamp.getTime());
        });
        it('Geçersiz page ve limit parametreleri için 400 hatası dönmeli', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/errors?page=0&limit=0')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('geçerli sayılar olmalıdır');
        });
    });
});
//# sourceMappingURL=error-logs.test.js.map