import request from 'supertest';
import app from '../../app';
import { sequelize } from '../../config/database';
import ErrorLog from '../../error/models/ErrorLog';
import { createTestUser } from '../setup';
import { ErrorCode } from '../../error/constants/errorCodes';

describe('Error Logs API Testleri', () => {
  let adminToken: string;
  let userToken: string;
  let errorLogs: ErrorLog[];

  beforeAll(async () => {
    // Veritabanını temizle
    await sequelize.sync({ force: true });

    // Admin ve normal kullanıcı oluştur
    const adminUser = await createTestUser({ role: 'admin' });
    const normalUser = await createTestUser({ role: 'student' });

    // Token'ları al
    const adminResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: adminUser.email, password: '123456' });
    adminToken = adminResponse.body.data.token;

    const userResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: normalUser.email, password: '123456' });
    userToken = userResponse.body.data.token;

    // Test için error log kayıtları oluştur
    const baseDate = new Date();
    errorLogs = await Promise.all([
      ErrorLog.create({
        errorCode: ErrorCode.VALIDATION_ERROR,
        message: 'Test error 1',
        stackTrace: 'Test stack trace 1',
        severity: 'error',
        metadata: {},
        timestamp: new Date(baseDate.getTime() - 1000), // 1 saniye önce
      }),
      ErrorLog.create({
        errorCode: ErrorCode.BUSINESS_ERROR,
        message: 'Test error 2',
        stackTrace: 'Test stack trace 2',
        severity: 'warning',
        metadata: {},
        timestamp: new Date(baseDate.getTime() - 2000), // 2 saniye önce
      }),
      ErrorLog.create({
        errorCode: ErrorCode.TECHNICAL_ERROR,
        message: 'Test error 3',
        stackTrace: 'Test stack trace 3',
        severity: 'critical',
        metadata: {},
        timestamp: new Date(baseDate.getTime()), // en yeni
      }),
      ErrorLog.create({
        errorCode: ErrorCode.SECURITY_ERROR,
        message: 'Test error 4',
        stackTrace: 'Test stack trace 4',
        severity: 'error',
        metadata: {},
        timestamp: new Date(baseDate.getTime() - 3000), // 3 saniye önce
      }),
    ]);
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('GET /api/errors', () => {
    it('Admin olmayan kullanıcı 403 hatası almalı', async () => {
      const response = await request(app)
        .get('/api/errors?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('yetkiniz bulunmamaktadır');
    });

    it('Admin kullanıcı başarılı şekilde error loglarını alabilmeli', async () => {
      const response = await request(app)
        .get('/api/errors?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.rows)).toBe(true);
      expect(response.body.data.rows.length).toBe(4);
      expect(response.body.data.count).toBe(4); // Toplam kayıt sayısı kontrolü
    });

    it('Limit parametresi doğru çalışmalı', async () => {
      const response = await request(app)
        .get('/api/errors?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rows.length).toBe(2);
      expect(response.body.data.count).toBe(4); // Toplam kayıt sayısı değişmemeli
    });

    it('Page parametresi doğru çalışmalı', async () => {
      // İlk sayfa
      const response1 = await request(app)
        .get('/api/errors?page=1&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      // İkinci sayfa
      const response2 = await request(app)
        .get('/api/errors?page=2&limit=2')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response1.body.data.rows[0].id).not.toBe(response2.body.data.rows[0].id);
      expect(response1.body.data.rows.length).toBe(2);
      expect(response2.body.data.rows.length).toBe(2);
      expect(response1.body.data.count).toBe(4); // Her iki sayfada da toplam kayıt sayısı aynı olmalı
      expect(response2.body.data.count).toBe(4);
    });

    it('Loglar en yeni en üstte olacak şekilde sıralı gelmeli', async () => {
      const response = await request(app)
        .get('/api/errors?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      const logs = response.body.data.rows;
      expect(new Date(logs[0].timestamp).getTime()).toBeGreaterThan(new Date(logs[1].timestamp).getTime());
      expect(new Date(logs[1].timestamp).getTime()).toBeGreaterThan(new Date(logs[2].timestamp).getTime());
      expect(new Date(logs[2].timestamp).getTime()).toBeGreaterThan(new Date(logs[3].timestamp).getTime());

      // En yeni kaydın timestamp'i test verisi oluştururken set ettiğimiz en yeni tarih olmalı
      expect(new Date(logs[0].timestamp).getTime()).toBe(errorLogs[2].timestamp.getTime());
    });

    it('Geçersiz page ve limit parametreleri için 400 hatası dönmeli', async () => {
      const response = await request(app)
        .get('/api/errors?page=0&limit=0')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('geçerli sayılar olmalıdır');
    });
  });
});