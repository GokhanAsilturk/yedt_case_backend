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

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
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
      await User.create({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'Password123!',
        role: 'student'
      });

      const response = await request(app)
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
    it('should not register user with invalid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'te', // Çok kısa kullanıcı adı
          email: 'invalidemail', // Geçersiz email
          password: '123', // Çok kısa şifre
          role: 'student'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should not register user without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser'
          // email ve password eksik
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
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
      expect(response.body.data.token).toBeDefined();
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
    });
    it('should fail login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'Password123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
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
    it('should register, login and access protected routes with token', async () => {
      // 1. Kayıt ol
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'flowtest',
          email: 'flow@example.com',
          password: 'Password123!',
          role: 'student'
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      
      const token = registerResponse.body.data.token;
      expect(token).toBeDefined();

      // 2. Korumalı bir route'a eriş
      const protectedResponse = await request(app)
        .get('/api/students')
        .set('Authorization', `Bearer ${token}`);

      // Admin olarak kaydolduğu için erişimi olmalı
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
