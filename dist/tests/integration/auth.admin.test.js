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
    afterAll(async () => {
        // Test sonrası veritabanı bağlantısını kapat
        await database_1.sequelize.close();
    });
    describe('RegisterAdmin Authorization', () => {
        it('should allow admin to register a new admin user', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                username: 'newadmin',
                email: 'newadmin@example.com',
                password: 'Password123!',
                role: 'admin'
            });
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.role).toBe('admin');
        });
        it('should not allow student to register a new admin user', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${studentToken}`)
                .send({
                username: 'tryadmin',
                email: 'tryadmin@example.com',
                password: 'Password123!',
                role: 'admin'
            });
            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
        });
        it('should require authentication for admin registration', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                username: 'unauthorized',
                email: 'unauthorized@example.com',
                password: 'Password123!',
                role: 'admin'
            });
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
//# sourceMappingURL=auth.admin.test.js.map