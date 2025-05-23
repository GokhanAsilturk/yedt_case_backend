"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const database_1 = require("../../config/database");
const Course_1 = __importDefault(require("../../models/Course"));
const User_1 = __importDefault(require("../../models/User"));
const jwt_1 = require("../../utils/jwt");
describe('Course Integration Tests', () => {
    let adminToken;
    let testCourseId;
    beforeAll(async () => {
        // Test veritabanını temizle ve yeni tablolar oluştur
        await database_1.sequelize.sync({ force: true });
        // Admin kullanıcı oluştur
        const adminUser = await User_1.default.create({
            username: 'courseadmin',
            email: 'courseadmin@example.com',
            password: 'Password123!',
            role: 'admin'
        });
        adminToken = (0, jwt_1.generateAccessToken)(adminUser);
    });
    beforeEach(async () => {
        // Her test öncesi örnek kurs oluştur
        const course = await Course_1.default.create({
            name: 'Test Course',
            description: 'Test course description'
        });
        testCourseId = course.id;
    });
    afterEach(async () => {
        // Her test sonrası veritabanını temizle
        await Course_1.default.destroy({ where: {} });
    });
    afterAll(async () => {
        // Test sonrası veritabanı bağlantısını kapat
        await User_1.default.destroy({ where: {} });
        await database_1.sequelize.close();
    });
    describe('GET /api/courses', () => {
        it('should return all courses with pagination', async () => {
            // Ek kurslar oluştur
            await Course_1.default.create({ name: 'Course 1', description: 'Description 1' });
            await Course_1.default.create({ name: 'Course 2', description: 'Description 2' });
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/courses')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.pagination).toBeDefined();
            expect(response.body.data.length).toBeGreaterThanOrEqual(3); // Test kurs + oluşturduğumuz 2 kurs
        });
        it('should filter courses with search parameter', async () => {
            // Aranabilecek ek kurslar oluştur
            await Course_1.default.create({ name: 'Mathematics', description: 'Advanced math course' });
            await Course_1.default.create({ name: 'Physics', description: 'Introduction to physics' });
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/courses?search=math')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            // Tüm bulunan kurslar içinde 'math' ifadesi olmalı
            response.body.data.forEach((course) => {
                var _a, _b, _c, _d;
                const nameContainsMath = (_b = (_a = course.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('math')) !== null && _b !== void 0 ? _b : false;
                const descContainsMath = (_d = (_c = course.description) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes('math')) !== null && _d !== void 0 ? _d : false;
                const nameOrDescContainsMath = nameContainsMath !== null && nameContainsMath !== void 0 ? nameContainsMath : descContainsMath;
                expect(nameOrDescContainsMath).toBe(true);
            });
        });
        it('should return empty array when no courses match search', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/courses?search=nonexistent')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(0);
        });
        it('should paginate results correctly', async () => {
            // 15 kurs oluştur
            for (let i = 1; i <= 15; i++) {
                await Course_1.default.create({ name: `Course ${i}`, description: `Description ${i}` });
            }
            // Sayfa 1, her sayfada 5 sonuç
            const response1 = await (0, supertest_1.default)(app_1.default)
                .get('/api/courses?page=1&limit=5')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response1.status).toBe(200);
            expect(response1.body.data.length).toBe(5);
            expect(response1.body.pagination.totalItems).toBeGreaterThanOrEqual(16); // 15 yeni + 1 test kurs
            expect(response1.body.pagination.currentPage).toBe(1);
            expect(response1.body.pagination.pageSize).toBe(5);
            // Sayfa 2, her sayfada 5 sonuç
            const response2 = await (0, supertest_1.default)(app_1.default)
                .get('/api/courses?page=2&limit=5')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response2.status).toBe(200);
            expect(response2.body.data.length).toBe(5);
            expect(response2.body.pagination.currentPage).toBe(2);
        });
    });
    describe('GET /api/courses/:id', () => {
        it('should return a specific course by ID', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/api/courses/${testCourseId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe(testCourseId);
            expect(response.body.data.name).toBe('Test Course');
            expect(response.body.data.description).toBe('Test course description');
        });
        it('should return 404 for non-existent course ID', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/courses/9999')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Course not found');
        });
    });
    describe('POST /api/courses', () => {
        it('should create a new course', async () => {
            const newCourse = {
                name: 'New Course',
                description: 'A brand new course'
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/courses')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newCourse);
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.name).toBe('New Course');
            expect(response.body.data.description).toBe('A brand new course');
            // Veritabanında oluşturulduğunu kontrol et
            const createdCourse = await Course_1.default.findByPk(response.body.data.id);
            expect(createdCourse).not.toBeNull();
            expect(createdCourse === null || createdCourse === void 0 ? void 0 : createdCourse.name).toBe('New Course');
        });
        it('should create course with default description when not provided', async () => {
            const newCourse = {
                name: 'Course Without Description'
                // description eksik
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/courses')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newCourse);
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Course Without Description');
            expect(response.body.data.description).toBe('');
        });
        it('should not create course without name', async () => {
            const invalidCourse = {
                description: 'Course without name'
                // name eksik
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/courses')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidCourse);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
        it('should reject request without authentication', async () => {
            const newCourse = {
                name: 'Unauthorized Course',
                description: 'This should not be created'
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/courses')
                .send(newCourse);
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('PUT /api/courses/:id', () => {
        it('should update an existing course', async () => {
            const updateData = {
                name: 'Updated Course',
                description: 'Updated description'
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .put(`/api/courses/${testCourseId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Updated Course');
            expect(response.body.data.description).toBe('Updated description');
            // Veritabanında güncellendiğinden emin ol
            const updatedCourse = await Course_1.default.findByPk(testCourseId);
            expect(updatedCourse === null || updatedCourse === void 0 ? void 0 : updatedCourse.name).toBe('Updated Course');
            expect(updatedCourse === null || updatedCourse === void 0 ? void 0 : updatedCourse.description).toBe('Updated description');
        });
        it('should update only provided fields', async () => {
            // Sadece adı güncelle
            const updateData = {
                name: 'Partially Updated Course'
                // description eksik, güncellenmemeli
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .put(`/api/courses/${testCourseId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('Partially Updated Course');
            expect(response.body.data.description).toBe('Test course description'); // değişmemeli
            // Veritabanında da doğrula
            const updatedCourse = await Course_1.default.findByPk(testCourseId);
            expect(updatedCourse === null || updatedCourse === void 0 ? void 0 : updatedCourse.name).toBe('Partially Updated Course');
            expect(updatedCourse === null || updatedCourse === void 0 ? void 0 : updatedCourse.description).toBe('Test course description');
        });
        it('should return 404 when updating non-existent course', async () => {
            const updateData = {
                name: 'Phantom Course'
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .put('/api/courses/9999')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Course not found');
        });
    });
    describe('DELETE /api/courses/:id', () => {
        it('should delete an existing course', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/courses/${testCourseId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Course deleted successfully');
            // Veritabanından silindiğinden emin ol
            const deletedCourse = await Course_1.default.findByPk(testCourseId);
            expect(deletedCourse).toBeNull();
        });
        it('should return 404 when deleting non-existent course', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .delete('/api/courses/9999')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Course not found');
        });
    });
});
//# sourceMappingURL=course.test.js.map