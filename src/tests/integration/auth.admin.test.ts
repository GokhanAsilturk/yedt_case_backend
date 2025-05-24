import request from 'supertest';
import app from '../../app';
import User from '../../models/User';
import { sequelize } from '../../config/database';

describe('Admin Authorization Tests', () => {
  let adminToken: string;
  let studentToken: string;

  beforeAll(async () => {
    // Test veritabanını temizle ve yeni tablolar oluştur
    await sequelize.sync({ force: true });

    // Admin kullanıcı oluştur
    await User.create({
      username: 'adminuser',
      email: 'admin@example.com',
      password: 'Password123!',
      role: 'admin'
    });

    // Öğrenci kullanıcı oluştur
    await User.create({
      username: 'studentuser',
      email: 'student@example.com',
      password: 'Password123!',
      role: 'student'
    });

    // Admin olarak giriş yap ve token al
    const adminLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'adminuser',
        password: 'Password123!'
      });

    adminToken = adminLoginResponse.body.data.accessToken;

    // Öğrenci olarak giriş yap ve token al
    const studentLoginResponse = await request(app)
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
    const response = await request(app)
      .get('/api/admins')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.statusCode).toBe(403); // Forbidden
  });
    expect(studentToken).not.toBe('');
  });

  afterAll(async () => {
    // Test sonrası veritabanı bağlantısını kapat
    await sequelize.close();
  });

  it('should get admin token successfully', async () => {
    expect(adminToken).toBeDefined();
    expect(typeof adminToken).toBe('string');
    expect(adminToken).not.toBe('');
  });
});