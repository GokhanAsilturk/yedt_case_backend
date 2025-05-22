import User from '../models/User';
import Student from '../models/Student';
import bcrypt from 'bcrypt';

export const seedStudents = async (): Promise<void> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('student123', salt);

    // Örnek öğrenci kullanıcısı oluştur
    const studentUser = await User.create({
      username: 'student',
      email: 'student@example.com',
      password: hashedPassword,
      role: 'student'
    });

    // Öğrenci bilgilerini oluştur
    await Student.create({
      userId: studentUser.id,
      firstName: 'Gokhan',
      lastName: 'Asilturk',
      birthDate: new Date('2000-01-01')
    });

    console.log('Default student created successfully');
  } catch (error) {
    console.error('Error creating default student:', error);
    throw error;
  }
};
