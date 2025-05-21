import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { setupSwagger } from './config/swagger';
import sequelize from './config/database';

dotenv.config();

// Database sync
sequelize.sync({ force: false }).then(() => {
  console.log('Database synchronized successfully');
}).catch(err => {
  console.error('Error syncing database:', err);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
import authRoutes from './routes/auth';
import studentRoutes from './routes/students';
import courseRoutes from './routes/courses';
import enrollmentRoutes from './routes/enrollments';

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

// Error handling middleware
interface Error {
  stack?: string;
  message: string;
  status?: number;
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);  res.status(err.status ?? 500).json({ 
    error: err.message ?? 'Something went wrong!' 
  });
});

const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
