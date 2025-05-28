import request from 'supertest';
import app from '../../app';
import { sequelize } from '../../config/database';
import Student from '../../models/Student';
import User from '../../models/User';
import Course from '../../models/Course';
import Enrollment from '../../models/Enrollment';
import { generateAccessToken } from '../../utils/jwt';

describe('Enrollment Integration Tests', () => {
  let adminToken: string;
  let studentToken: string;
  let studentId: string;
  let courseId: string;
  let enrollmentId: string;
  
  beforeAll(async () => {
    // Test veritabanını temizle ve yeni tablolar oluştur
    await sequelize.sync({ force: true });
    
    // Admin kullanıcı oluştur
    const adminUser = await User.create({
      username: 'enrolladmin',
      email: 'enrolladmin@example.com',
      password: 'Password123!',
      role: 'admin'
    });
    
    adminToken = generateAccessToken(adminUser);
      // Test öğrencisi oluştur
    const studentUser = await User.create({
      username: 'enrollstudent',
      firstName: 'Enroll',
      lastName: 'Student',
      email: 'enrollstudent@example.com',
      password: 'Password123!',
      role: 'student'
    });
    
    studentToken = generateAccessToken(studentUser);
      const student = await Student.create({
      userId: studentUser.id,
      birthDate: new Date('1995-05-15')
    });
    
    studentId = student.id;
    
    // Test kursu oluştur
    const course = await Course.create({
      name: 'Enrollment Test Course',
      description: 'Course for enrollment tests'
    });
    
    courseId = course.id;
  });
  
  afterAll(async () => {
    // Test sonrası veritabanı bağlantısını kapat
    await Enrollment.destroy({ where: {} });
    await Student.destroy({ where: {} });
    await Course.destroy({ where: {} });
    await User.destroy({ where: {} });
    await sequelize.close();
  });
  
  describe('GET /api/enrollments', () => {
    beforeEach(async () => {
      // Her test öncesi enrollment oluştur
      await Enrollment.destroy({ where: {} }); // Önce temizle
      
      const enrollment = await Enrollment.create({
        studentId,
        courseId,
        enrollmentDate: new Date()
      });
      
      enrollmentId = enrollment.id;
    });
    
    it('should return all enrollments with pagination', async () => {
      const response = await request(app)
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
        await Enrollment.create({
          studentId,
          courseId,
          enrollmentDate: new Date()
        });
      }
      
      // Sayfa 1, her sayfada 3 sonuç
      const response = await request(app)
        .get('/api/enrollments?page=1&limit=3')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(3);
      expect(response.body.pagination.totalItems).toBeGreaterThanOrEqual(6); // 1 mevcut + 5 yeni
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.pageSize).toBe(3);
      
      // Sayfa 2, her sayfada 3 sonuç
      const response2 = await request(app)
        .get('/api/enrollments?page=2&limit=3')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response2.status).toBe(200);
      expect(response2.body.data.length).toBeGreaterThanOrEqual(3);
      expect(response2.body.pagination.currentPage).toBe(2);
    });
    
    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/enrollments');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/enrollments/enroll/:courseId', () => {
    beforeEach(async () => {
      // Her test öncesi kayıtları temizle
      await Enrollment.destroy({ where: {} });
    });
    
    it('should enroll a student in a course', async () => {
      const response = await request(app)
        .post(`/api/enrollments/enroll/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.studentId).toBe(studentId);
      expect(response.body.data.courseId).toBe(courseId);
      
      // Veritabanında da oluşturulduğunu kontrol et
      const enrollment = await Enrollment.findOne({
        where: { studentId, courseId }
      });
      expect(enrollment).not.toBeNull();
    });
    
    it('should not allow enrolling in the same course twice', async () => {
      // İlk kayıt
      await request(app)
        .post(`/api/enrollments/enroll/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      // İkinci kayıt denemesi
      const response = await request(app)
        .post(`/api/enrollments/enroll/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Already enrolled in this course');
    });
    
    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
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
      await Enrollment.destroy({ where: {} }); // Önce temizle
      
      await Enrollment.create({
        studentId,
        courseId,
        enrollmentDate: new Date()
      });
    });
    
    it('should withdraw a student from a course', async () => {
      const response = await request(app)
        .delete(`/api/enrollments/withdraw/${courseId}`)
        .set('Authorization', `Bearer ${studentToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Withdrawn successfully');
      
      // Veritabanından silindiğini kontrol et
      const enrollment = await Enrollment.findOne({
        where: { studentId, courseId }
      });
      expect(enrollment).toBeNull();
    });
    
    it('should return 404 when trying to withdraw from a course not enrolled in', async () => {
      // Önce kurs kaydını sil
      await Enrollment.destroy({ where: { studentId, courseId } });
      
      const response = await request(app)
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
      await Enrollment.destroy({ where: {} });
      
      await Enrollment.create({
        studentId,
        courseId,
        enrollmentDate: new Date()
      });
    });
    
    it('should return enrollments for a specific student', async () => {
      const response = await request(app)
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
      await Enrollment.destroy({ where: {} });
      
      const response = await request(app)
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
      await Enrollment.destroy({ where: {} });
      
      await Enrollment.create({
        studentId,
        courseId,
        enrollmentDate: new Date()
      });
    });
    
    it('should return enrollments for a specific course', async () => {
      const response = await request(app)
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
      await Enrollment.destroy({ where: {} });
      
      const response = await request(app)
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
      await Enrollment.destroy({ where: {} });
    });
    
    it('should create a new enrollment', async () => {
      const newEnrollment = {
        studentId,
        courseId
      };
      
      const response = await request(app)
        .post('/api/enrollments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newEnrollment);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.studentId).toBe(studentId);
      expect(response.body.data.courseId).toBe(courseId);
      
      // Veritabanında da oluşturulduğunu kontrol et
      const enrollment = await Enrollment.findOne({
        where: { studentId, courseId }
      });
      expect(enrollment).not.toBeNull();
    });
    
    it('should not create duplicate enrollment', async () => {
      // Önce bir kayıt oluştur
      await Enrollment.create({
        studentId,
        courseId,
        enrollmentDate: new Date()
      });
      
      // Aynı kaydı tekrar oluşturmaya çalış
      const duplicateEnrollment = {
        studentId,
        courseId
      };
      
      const response = await request(app)
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
      
      const response = await request(app)
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
      
      const response = await request(app)
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
      await Enrollment.destroy({ where: {} }); // Önce temizle
      
      const enrollment = await Enrollment.create({
        studentId,
        courseId,
        enrollmentDate: new Date()
      });
      
      enrollmentId = enrollment.id;
    });
    
    it('should delete an enrollment', async () => {
      const response = await request(app)
        .delete(`/api/enrollments/${enrollmentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Enrollment deleted successfully');
      
      // Veritabanından silindiğini kontrol et
      const enrollment = await Enrollment.findByPk(enrollmentId);
      expect(enrollment).toBeNull();
    });
    
    it('should return 404 for non-existent enrollment', async () => {
      const response = await request(app)
        .delete('/api/enrollments/9999')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Enrollment not found');
    });
  });
});