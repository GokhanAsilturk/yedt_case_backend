import request from 'supertest';
import app from '../../app';
import { sequelize } from '../../config/database';
import Student from '../../models/Student';
import User from '../../models/User';
import Enrollment from '../../models/Enrollment';
import { generateAccessToken } from '../../utils/jwt';
import { Op } from 'sequelize';

describe('Student Integration Tests', () => {
  let adminToken: string;
  let adminUserId: string;
  let testStudentId: string;
  
  beforeAll(async () => {
    // Test veritabanını temizle ve yeni tablolar oluştur
    await sequelize.sync({ force: true });
      // Admin kullanıcı oluştur
    const adminUser = await User.create({
      username: 'adminuser',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'admin'
    });
    
    adminUserId = adminUser.id;
    adminToken = generateAccessToken(adminUser);
  });
    beforeEach(async () => {
    // Her test öncesi test öğrencisini oluştur
    const user = await User.create({
      username: 'teststudent',
      firstName: 'Test',
      lastName: 'Student',
      email: 'student@example.com',
      password: 'Password123!',
      role: 'student'
    });
    
    const student = await Student.create({
      userId: user.id,
      birthDate: new Date('1995-05-15')
    });
    
    testStudentId = student.id;
  });
  
  afterEach(async () => {
    // Her test sonrası veritabanını temizle
    await Enrollment.destroy({ where: {} });
    await Student.destroy({ where: {} });
    await User.destroy({ where: { id: { [Op.ne]: adminUserId } } });
  });
  
  afterAll(async () => {
    // Test sonrası veritabanı bağlantısını kapat
    await User.destroy({ where: {} });
    await sequelize.close();
  });
  
  describe('GET /api/students', () => {
    it('should return all students with pagination', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.totalItems).toBeGreaterThanOrEqual(1);
    });
    
    it('should filter students with search parameter', async () => {
      const response = await request(app)
        .get('/api/students?search=Test')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].user.firstName).toBe('Test');
    });
    
    it('should return empty array when no students match search', async () => {
      const response = await request(app)
        .get('/api/students?search=nonexistent')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(0);
    });
    
    it('should reject request without authentication', async () => {
      const response = await request(app)
        .get('/api/students');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  it('should reject request for getAllStudents without admin role', async () => {
    const user = {
      id: 'someUserId',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password',
      role: 'student',
      tokenVersion: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      validatePassword: () => Promise.resolve(true),
    } as any;
    const token = generateAccessToken(user);
    const response = await request(app)
      .get('/api/students')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
  });
  
  describe('GET /api/students/:id', () => {
    it('should return a specific student by ID', async () => {
      const response = await request(app)
        .get(`/api/students/${testStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
        expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testStudentId);
      expect(response.body.data.user.firstName).toBe('Test');
      expect(response.body.data.user.lastName).toBe('Student');
      expect(response.body.data.user).toBeDefined();
    });
    
    it('should return 404 for non-existent student ID', async () => {
      const response = await request(app)
        .get('/api/students/9999')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Student not found');
    });
  });
  
  describe('POST /api/students', () => {
    it('should create a new student', async () => {
      const newStudent = {
        username: 'newstudent',
        email: 'new@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'Student',
        birthDate: '1998-10-15'
      };
      
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newStudent);
        expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.student).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.firstName).toBe('New');
      expect(response.body.data.user.lastName).toBe('Student');
      expect(response.body.data.user.username).toBe('newstudent');
      expect(response.body.data.user.email).toBe('new@example.com');
      expect(response.body.data.user.role).toBe('student');
    });
    
    it('should not create student with existing username or email', async () => {
      const duplicateStudent = {
        username: 'teststudent', // Zaten mevcut kullanıcı adı
        email: 'new@example.com',
        password: 'Password123!',
        firstName: 'Duplicate',
        lastName: 'Student',
        birthDate: '1998-10-15'
      };
      
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateStudent);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
    
    it('should not create student with missing required fields', async () => {
      const incompleteStudent = {
        username: 'incomplete',
        // email eksik
        password: 'Password123!',
        firstName: 'Incomplete'
        // lastName eksik
      };
      
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(incompleteStudent);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('PUT /api/students/:id', () => {
    it('should update an existing student', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };
      
      const response = await request(app)
        .put(`/api/students/${testStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
        expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.firstName).toBe('Updated');
      expect(response.body.data.user.lastName).toBe('Name');
        // Veritabanında da güncellendiğinden emin ol - User tablosundan kontrol et
      const updatedStudent = await Student.findByPk(testStudentId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }
        ]
      });
      expect(updatedStudent?.user?.firstName).toBe('Updated');
      expect(updatedStudent?.user?.lastName).toBe('Name');
    });
    
    it('should return 404 when updating non-existent student', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };
      
      const response = await request(app)
        .put('/api/students/9999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Student not found');
    });
  });
  
  describe('DELETE /api/students/:id', () => {
    it('should delete an existing student', async () => {
      const response = await request(app)
        .delete(`/api/students/${testStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Student deleted successfully');
      
      // Veritabanından silindiğinden emin ol
      const deletedStudent = await Student.findByPk(testStudentId);
      expect(deletedStudent).toBeNull();
    });
    
    it('should return 404 when deleting non-existent student', async () => {
      const response = await request(app)
        .delete('/api/students/9999')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Student not found');
    });
    
    it('should delete student with associated enrollments', async () => {
      // Önce bir kurs oluştur
      const course = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Course',
          description: 'Course for deletion test'
        });
      
      // Öğrenciyi kursa kaydet
      await Enrollment.create({
        studentId: testStudentId,
        courseId: course.body.data.id.toString(),
        enrollmentDate: new Date()
      });
      
      // Öğrenciyi sil
      const response = await request(app)
        .delete(`/api/students/${testStudentId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      // Enrollment'ın da silindiğinden emin ol
      const enrollments = await Enrollment.findAll({ where: { studentId: testStudentId } });
      expect(enrollments.length).toBe(0);
    });
  });
});