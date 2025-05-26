import User from '../models/User';
import Student from '../models/Student';

export const seedStudents = async (): Promise<void> => {
  try {

    // Örnek öğrenci kullanıcısı oluştur
    const studentUser = await User.create({
      username: 'gokhanasilturk',
      email: 'gokhanasilturkk@gmail.com',
      password: 'Student123!', 
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
