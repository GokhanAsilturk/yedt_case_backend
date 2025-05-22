import { sequelize } from '../config/database';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const seedAdmins = async (): Promise<void> => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const id = uuidv4();

  try {
    await sequelize.query(`
      INSERT INTO "Users" (id, username, email, password, role, "createdAt", "updatedAt")
      VALUES (:id, :username, :email, :password, :role, NOW(), NOW())
    `, {
      replacements: {
        id,
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Error creating default admin:', error);
    throw error;
  }
};
