"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const database_1 = require("../../config/database");
const Student_1 = __importDefault(require("../../models/Student"));
const User_1 = __importDefault(require("../../models/User"));
const Course_1 = __importDefault(require("../../models/Course"));
const Enrollment_1 = __importDefault(require("../../models/Enrollment"));
const jwt_1 = require("../../utils/jwt");
describe('Enrollment Integration Tests', () => {
    let adminToken;
    let studentToken;
    let studentId;
    let courseId;
    let enrollmentId;
    beforeAll(async () => {
        // Test veritabanını temizle ve yeni tablolar oluştur
        await database_1.sequelize.sync({ force: true });
        // Admin kullanıcı oluştur
        const adminUser = await User_1.default.create({
            username: 'enrolladmin',
            email: 'enrolladmin@example.com',
            password: 'Password123!',
            role: 'admin'
        });
        adminToken = (0, jwt_1.generateAccessToken)(adminUser);
        // Test öğrencisi oluştur
        const studentUser = await User_1.default.create({
            username: 'enrollstudent',
            email: 'enrollstudent@example.com',
            password: 'Password123!',
            role: 'student'
        });
        studentToken = (0, jwt_1.generateAccessToken)(studentUser);
        const student = await Student_1.default.create({
            userId: studentUser.id,
            firstName: 'Enroll',
            lastName: 'Student',
            birthDate: new Date('1995-05-15')
        });
        studentId = student.id;
        // Test kursu oluştur
        const course = await Course_1.default.create({
            name: 'Enrollment Test Course',
            description: 'Course for enrollment tests'
        });
        courseId = course.id;
    });
    afterAll(async () => {
        // Test sonrası veritabanı bağlantısını kapat
        await Enrollment_1.default.destroy({ where: {} });
        await Student_1.default.destroy({ where: {} });
        await Course_1.default.destroy({ where: {} });
        await User_1.default.destroy({ where: {} });
        await database_1.sequelize.close();
    });
    describe('GET /api/enrollments', () => {
        beforeEach(async () => {
            // Her test öncesi enrollment oluştur
            await Enrollment_1.default.destroy({ where: {} }); // Önce temizle
            const enrollment = await Enrollment_1.default.create({
                studentId,
                courseId,
                enrollmentDate: new Date()
            });
            enrollmentId = enrollment.id;
        });
        it('should return all enrollments with pagination', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/enrollments')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.pagination).toBeDefined();
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            // Enrollment içeriğini kontrol et
            const enrollment = response.body.data[0];
            expect(enrollment.studentId).toBe(studentId);
            expect(enrollment.courseId).toBe(courseId);
            expect(enrollment.student).toBeDefined();
            expect(enrollment.course).toBeDefined();
        });
        it('should return paginated results correctly', async () => {
            // 5 ekstra enrollment oluştur
            for (let i = 0; i < 5; i++) {
                await Enrollment_1.default.create({
                    studentId,
                    courseId,
                    enrollmentDate: new Date()
                });
            }
            // Sayfa 1, her sayfada 3 sonuç
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/enrollments?page=1&limit=3')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.data.length).toBe(3);
            expect(response.body.pagination.totalItems).toBeGreaterThanOrEqual(6); // 1 mevcut + 5 yeni
            expect(response.body.pagination.currentPage).toBe(1);
            expect(response.body.pagination.pageSize).toBe(3);
            // Sayfa 2, her sayfada 3 sonuç
            const response2 = await (0, supertest_1.default)(app_1.default)
                .get('/api/enrollments?page=2&limit=3')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response2.status).toBe(200);
            expect(response2.body.data.length).toBeGreaterThanOrEqual(3);
            expect(response2.body.pagination.currentPage).toBe(2);
        });
        it('should reject request without authentication', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/enrollments');
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('POST /api/enrollments/enroll/:courseId', () => {
        beforeEach(async () => {
            // Her test öncesi kayıtları temizle
            await Enrollment_1.default.destroy({ where: {} });
        });
        it('should enroll a student in a course', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post(`/api/enrollments/enroll/${courseId}`)
                .set('Authorization', `Bearer ${studentToken}`);
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.studentId).toBe(studentId);
            expect(response.body.data.courseId).toBe(courseId);
            // Veritabanında da oluşturulduğunu kontrol et
            const enrollment = await Enrollment_1.default.findOne({
                where: { studentId, courseId }
            });
            expect(enrollment).not.toBeNull();
        });
        it('should not allow enrolling in the same course twice', async () => {
            // İlk kayıt
            await (0, supertest_1.default)(app_1.default)
                .post(`/api/enrollments/enroll/${courseId}`)
                .set('Authorization', `Bearer ${studentToken}`);
            // İkinci kayıt denemesi
            const response = await (0, supertest_1.default)(app_1.default)
                .post(`/api/enrollments/enroll/${courseId}`)
                .set('Authorization', `Bearer ${studentToken}`);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Already enrolled in this course');
        });
        it('should return 404 for non-existent course', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/enrollments/enroll/9999')
                .set('Authorization', `Bearer ${studentToken}`);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Course not found');
        });
    });
    describe('DELETE /api/enrollments/withdraw/:courseId', () => {
        beforeEach(async () => {
            // Her test öncesi bir enrollment oluştur
            await Enrollment_1.default.destroy({ where: {} }); // Önce temizle
            await Enrollment_1.default.create({
                studentId,
                courseId,
                enrollmentDate: new Date()
            });
        });
        it('should withdraw a student from a course', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/enrollments/withdraw/${courseId}`)
                .set('Authorization', `Bearer ${studentToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Withdrawn successfully');
            // Veritabanından silindiğini kontrol et
            const enrollment = await Enrollment_1.default.findOne({
                where: { studentId, courseId }
            });
            expect(enrollment).toBeNull();
        });
        it('should return 404 when trying to withdraw from a course not enrolled in', async () => {
            // Önce kurs kaydını sil
            await Enrollment_1.default.destroy({ where: { studentId, courseId } });
            const response = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/enrollments/withdraw/${courseId}`)
                .set('Authorization', `Bearer ${studentToken}`);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Enrollment not found');
        });
    });
    describe('GET /api/enrollments/student/:id', () => {
        beforeEach(async () => {
            // Her test öncesi kayıtları temizle ve yeni kayıt oluştur
            await Enrollment_1.default.destroy({ where: {} });
            await Enrollment_1.default.create({
                studentId,
                courseId,
                enrollmentDate: new Date()
            });
        });
        it('should return enrollments for a specific student', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/api/enrollments/student/${studentId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            // İlk enrollment'ın içeriğini kontrol et
            const enrollment = response.body.data[0];
            expect(enrollment.studentId).toBe(studentId);
            expect(enrollment.courseId).toBe(courseId);
            expect(enrollment.course).toBeDefined();
        });
        it('should return empty array for student with no enrollments', async () => {
            // Önce kayıtları temizle
            await Enrollment_1.default.destroy({ where: {} });
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/api/enrollments/student/${studentId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(0);
        });
    });
    describe('GET /api/enrollments/course/:id', () => {
        beforeEach(async () => {
            // Her test öncesi kayıtları temizle ve yeni kayıt oluştur
            await Enrollment_1.default.destroy({ where: {} });
            await Enrollment_1.default.create({
                studentId,
                courseId,
                enrollmentDate: new Date()
            });
        });
        it('should return enrollments for a specific course', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/api/enrollments/course/${courseId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBeGreaterThanOrEqual(1);
            // İlk enrollment'ın içeriğini kontrol et
            const enrollment = response.body.data[0];
            expect(enrollment.studentId).toBe(studentId);
            expect(enrollment.courseId).toBe(courseId);
            expect(enrollment.student).toBeDefined();
        });
        it('should return empty array for course with no enrollments', async () => {
            // Önce kayıtları temizle
            await Enrollment_1.default.destroy({ where: {} });
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/api/enrollments/course/${courseId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(0);
        });
    });
    describe('POST /api/enrollments', () => {
        beforeEach(async () => {
            // Her test öncesi kayıtları temizle
            await Enrollment_1.default.destroy({ where: {} });
        });
        it('should create a new enrollment', async () => {
            const newEnrollment = {
                studentId,
                courseId
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/enrollments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newEnrollment);
            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.studentId).toBe(studentId);
            expect(response.body.data.courseId).toBe(courseId);
            // Veritabanında da oluşturulduğunu kontrol et
            const enrollment = await Enrollment_1.default.findOne({
                where: { studentId, courseId }
            });
            expect(enrollment).not.toBeNull();
        });
        it('should not create duplicate enrollment', async () => {
            // Önce bir kayıt oluştur
            await Enrollment_1.default.create({
                studentId,
                courseId,
                enrollmentDate: new Date()
            });
            // Aynı kaydı tekrar oluşturmaya çalış
            const duplicateEnrollment = {
                studentId,
                courseId
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/enrollments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(duplicateEnrollment);
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Student is already enrolled in this course');
        });
        it('should return 404 for non-existent student', async () => {
            const invalidEnrollment = {
                studentId: '9999',
                courseId
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/enrollments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidEnrollment);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Student not found');
        });
        it('should return 404 for non-existent course', async () => {
            const invalidEnrollment = {
                studentId,
                courseId: '9999'
            };
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/enrollments')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(invalidEnrollment);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Course not found');
        });
    });
    describe('DELETE /api/enrollments/:id', () => {
        beforeEach(async () => {
            // Her test öncesi bir enrollment oluştur
            await Enrollment_1.default.destroy({ where: {} }); // Önce temizle
            const enrollment = await Enrollment_1.default.create({
                studentId,
                courseId,
                enrollmentDate: new Date()
            });
            enrollmentId = enrollment.id;
        });
        it('should delete an enrollment', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/enrollments/${enrollmentId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Enrollment deleted successfully');
            // Veritabanından silindiğini kontrol et
            const enrollment = await Enrollment_1.default.findByPk(enrollmentId);
            expect(enrollment).toBeNull();
        });
        it('should return 404 for non-existent enrollment', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .delete('/api/enrollments/9999')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Enrollment not found');
        });
    });
});
//# sourceMappingURL=enrollment.test.js.map