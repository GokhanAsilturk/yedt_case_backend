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
        it('should register a new user successfully', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'Password123!',
                role: 'student'
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
                .send({
                username: 'existinguser',
                email: 'new@example.com',
                password: 'Password123!',
                role: 'student'
            });
            expect(response.status).toBe(400);
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
            expect(response.body.data.token).toBeDefined();
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
        });
    });
});
//# sourceMappingURL=auth.test.js.map