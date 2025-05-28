import { sequelize } from '../config/database';
import '../models';  // Import model associations
import User from '../models/User';
import { v4 as uuidv4 } from 'uuid';

interface CreateTestUserOptions {
  role?: 'admin' | 'student';
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export const createTestUser = async (options: CreateTestUserOptions = {}) => {
  const userId = uuidv4();
  const defaultEmail = `test${userId}@example.com`;
  const defaultUsername = `testuser${userId}`;

  const user = await User.create({
    id: userId,
    email: options.email ?? defaultEmail,
    username: options.username ?? defaultUsername,
    password: '123456',
    role: options.role ?? 'student',
    firstName: options.firstName ?? 'Test',
    lastName: options.lastName ?? 'User'
  });

  return user;
};

beforeAll(async () => {
  // Force sync all models
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
