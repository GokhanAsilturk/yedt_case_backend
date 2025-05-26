"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const User_1 = __importDefault(require("../../models/User"));
const database_1 = require("../../config/database");
describe('Admin Authorization Tests', () => {
    let adminToken;
    let studentToken;
    beforeAll(async () => {
        // Test veritabanını temizle ve yeni tablolar oluştur
        await database_1.sequelize.sync({ force: true });
        // Admin kullanıcı oluştur
        await User_1.default.create({
            username: 'adminuser',
            email: 'admin@example.com',
            password: 'Password123!',
            role: 'admin'
        });
        // Öğrenci kullanıcı oluştur
        await User_1.default.create({
            username: 'studentuser',
            email: 'student@example.com',
            password: 'Password123!',
            role: 'student'
        });
        // Admin olarak giriş yap ve token al
        const adminLoginResponse = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            username: 'adminuser',
            password: 'Password123!'
        });
        adminToken = adminLoginResponse.body.data.accessToken;
        // Öğrenci olarak giriş yap ve token al
        const studentLoginResponse = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/login')
            .send({
            username: 'studentuser',
            password: 'Password123!'
        });
        studentToken = studentLoginResponse.body.data.accessToken;
    });
    it('should get student token successfully', async () => {
        expect(studentToken).toBeDefined();
        expect(typeof studentToken).toBe('string');
        it('should not allow student to access admin route', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/admins')
                .set('Authorization', `Bearer ${studentToken}`);
            expect(response.statusCode).toBe(403); // Forbidden
        });
        expect(studentToken).not.toBe('');
    });
    afterAll(async () => {
        // Test sonrası veritabanı bağlantısını kapat
        await database_1.sequelize.close();
    });
    it('should get admin token successfully', async () => {
        expect(adminToken).toBeDefined();
        expect(typeof adminToken).toBe('string');
        expect(adminToken).not.toBe('');
    });
});
//# sourceMappingURL=auth.admin.test.js.map