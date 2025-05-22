import User from '../models/User';
import Student from '../models/Student';
import * as bcrypt from 'bcryptjs';

export const seedStudents = async (): Promise<void> => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('student123', salt);

    // Örnek öğrenci kullanıcısı oluştur
    const studentUser = await User.create({
      username: 'gokhanasilturk',
      email: 'gokhanasilturkk@gmail.com',
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

  } catch (error) {
    console.error('Error creating default student:', error);
    throw error;
  }
};
