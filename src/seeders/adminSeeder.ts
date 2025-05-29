import { sequelize } from '../config/database';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const seedAdmins = async (): Promise<void> => {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admins = [
    {
      id: uuidv4(),
      username: 'admin',
      firstName: 'Recep',
      lastName: 'İvedik',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    },
    {
      id: uuidv4(),
      username: 'admin2',
      firstName: 'Mehmet',
      lastName: 'Yılmaz',
      email: 'admin2@example.com',
      password: hashedPassword,
      role: 'admin'
    }
  ];

  try {
    for (const admin of admins) {
      await sequelize.query(`
        INSERT INTO "Users" (id, username, "firstName", "lastName", email, password, role, "createdAt", "updatedAt")
        VALUES (:id, :username, :firstName, :lastName, :email, :password, :role, NOW(), NOW())
      `, {
        replacements: admin
      });
    }
    console.log('2 admin successfully created');
  } catch (error) {
    console.error('Error creating default admins:', error);
    throw error;
  }
};
