"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const User_1 = __importDefault(require("../../models/User"));
const database_1 = require("../../config/database");
jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashedPassword'),
    compare: jest.fn().mockResolvedValue(true)
}));
describe('Auth Integration Tests', () => {
    beforeAll(async () => {
        // Test veritabanını temizle ve yeni tablolar oluştur
        await database_1.sequelize.sync({ force: true });
    });
    beforeEach(async () => {
        await User_1.default.destroy({ where: {} }); // Her test öncesi veritabanını temizle
    });
    afterAll(async () => {
        // Test sonrası veritabanı bağlantısını kapat
        await database_1.sequelize.close();
    });
    describe('POST /api/auth/register', () => {
        // AdminRegister yetkilendirme testleri için kullanılacak değişkenler
        let adminToken;
        let studentToken;
        beforeAll(async () => {
            var _a, _b;
            // Test için admin ve student kullanıcı oluşturalım
            const adminUser = await User_1.default.create({
                username: 'adminuser',
                email: 'admin@example.com',
                password: 'Password123!',
                role: 'admin'
            });
            const studentUser = await User_1.default.create({
                username: 'studentuser',
                email: 'student@example.com',
                password: 'Password123!',
                role: 'student'
            });
            // Token oluştur
            const jwt = require('jsonwebtoken');
            adminToken = jwt.sign({ id: adminUser.id, role: adminUser.role }, (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : 'your-secret-key', { expiresIn: '1h' });
            studentToken = jwt.sign({ id: studentUser.id, role: studentUser.role }, (_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : 'your-secret-key', { expiresIn: '1h' });
        });
        it('should register a new admin user successfully when authenticated as admin', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password123!',
                role: 'admin'
            });
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.token).toBeDefined();
        });
        it('should not register user with existing username', async () => {
            // İlk kullanıcıyı oluştur
            await User_1.default.create({
                username: 'existinguser',
                email: 'existing@example.com',
                password: 'Password123!',
                role: 'student'
            });
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                username: 'existinguser',
                email: 'new@example.com',
                password: 'Password123!',
                role: 'admin'
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('exists');
        });
        it('should not register user with invalid data', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                username: 'te', // Çok kısa kullanıcı adı
                email: 'invalidemail', // Geçersiz email
                password: '123', // Çok kısa şifre
                role: 'admin'
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('validation');
        });
        it('should not register user without required fields', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                username: 'testuser'
                // email ve password eksik
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('required');
        });
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
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Her test öncesi test kullanıcısını oluştur
            await User_1.default.create({
                username: 'logintest',
                email: 'login@example.com',
                password: 'Password123!',
                role: 'student'
            });
        });
        it('should login successfully with correct credentials', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                username: 'logintest',
                password: 'Password123!'
            });
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.accessToken).toBeDefined();
            expect(response.body.data.refreshToken).toBeDefined();
        });
        it('should fail login with incorrect password', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                username: 'logintest',
                password: 'wrongpassword'
            });
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Geçersiz');
        });
        it('should fail login with non-existent user', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                username: 'nonexistentuser',
                password: 'Password123!'
            });
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('required');
            expect(response.body.message).toContain('Geçersiz');
        });
        it('should fail login with empty credentials', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                username: '',
                password: ''
            });
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('Authentication Flow', () => {
        it('should login and access protected routes with token', async () => {
            // Login işlemi
            const loginResponse = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send({
                username: 'adminuser',
                password: 'Password123!'
            });
            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body.success).toBe(true);
            const token = loginResponse.body.data.accessToken;
            expect(token).toBeDefined();
            // Korumalı bir route'a eriş
            const protectedResponse = await (0, supertest_1.default)(app_1.default)
                .get('/api/students')
                .set('Authorization', `Bearer ${token}`);
            // Admin olarak erişimi olmalı
            expect(protectedResponse.status).toBe(200);
        });
        it('should reject access to protected routes without token', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/students');
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
        it('should reject access with invalid token', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/students')
                .set('Authorization', 'Bearer invalidtoken123');
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
});
//# sourceMappingURL=auth.test.js.map