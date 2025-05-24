import request from 'supertest';
import app from '../../app';
import User from '../../models/User';
import { sequelize } from '../../config/database';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    // Test veritabanını temizle ve yeni tablolar oluştur
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await User.destroy({ where: {} }); // Her test öncesi veritabanını temizle
  });

  afterAll(async () => {
    // Test sonrası veritabanı bağlantısını kapat
    await sequelize.close();
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Her test öncesi test kullanıcısını oluştur
      await User.create({
        username: 'logintest',
        email: 'login@example.com',
        password: 'Password123!',
        role: 'student'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
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
      const response = await request(app)
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
      const response = await request(app)
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
      const response = await request(app)
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
      const loginResponse = await request(app)
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
      const protectedResponse = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${token}`);

      // Admin olarak erişimi olmalı
      expect(protectedResponse.status).toBe(200);
    });
    
    it('should reject access to protected routes without token', async () => {
      const response = await request(app)
        .get('/api/students');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject access with invalid token', async () => {
      const response = await request(app)
        .get('/api/students')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
