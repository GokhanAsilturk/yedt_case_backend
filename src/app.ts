import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { setupSwagger } from './config/swagger';
import { sequelize } from './config/database';
import { runSeeders } from './seeders';
import {
  errorHandler,
  notFoundHandler,
  setupSecurityMiddleware,
  sqlInjectionProtection
} from './middleware';
import './models';

dotenv.config();

// Initialize database and run seeders
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Veritabanı şemasını senkronize et (sadece değişiklikleri uygula, tabloları silmeden)
    await sequelize.sync({ alter: true });
    console.log('Database schema synchronized successfully.');
    
    // Run seeders (ilk çalıştırmada veya NODE_ENV=development ise)
    const isDevEnvironment = process.env.NODE_ENV === 'development';
    if (isDevEnvironment) {
      await runSeeders(sequelize);
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

initDatabase();

const app = express();

// Temel Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Güvenlik Middleware'leri
setupSecurityMiddleware(app);
// SQL Injection koruması tekrar aktif
app.use(sqlInjectionProtection);

// Routes
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import courseRoutes from './routes/courses';
import enrollmentRoutes from './routes/enrollments';
import adminRoutes from './routes/admins';

// API Documentation
setupSwagger(app);

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Student Management System API' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admins', adminRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware
app.use(((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
}));

const PORT = process.env.PORT ?? 5000;

export default app;
