import User from '../models/User';
import bcrypt from 'bcrypt';

export const seedAdmins = async (): Promise<void> => {  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123', salt);

  const defaultAdmin = {
    username: 'admin',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin'
  };

  try {
    await User.create(defaultAdmin);
    console.log('Default admin user created successfully');
  } catch (error) {
    console.error('Error creating default admin:', error);
    throw error;
  }
};
