import User from '../models/User';
import Student from '../models/Student';

export const seedStudents = async (): Promise<void> => {
  const students = [
    {
      username: 'gokhanasilturk',
      firstName: 'Gokhan',
      lastName: 'Asilturk',
      email: 'gokhanasilturkk@gmail.com',
      password: 'Student123!', 
      role: 'student',
      birthDate: new Date('2000-01-01')
    },
    {
      username: 'polatkemalbali',
      firstName: 'Polat',
      lastName: 'Alemdar',
      email: 'polat.alemdar@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('2000-01-01')
    },
    {
      username: 'mematibasbugra',
      firstName: 'Memati',
      lastName: 'Baş',
      email: 'memati.bas@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('1999-05-15')
    },
    {
      username: 'suederman',
      firstName: 'Süleyman',
      lastName: 'Çakır',
      email: 'suleyman.cakir@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('2001-03-22')
    },
    {
      username: 'esraerenoglu',
      firstName: 'Esra',
      lastName: 'Eroğlu',
      email: 'esra.eroglu@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('2000-08-10')
    },
    {
      username: 'kemaletincelik',
      firstName: 'Kemal',
      lastName: 'Soydere',
      email: 'kemal.soydere@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('1998-12-05')
    },
    {
      username: 'nihandelibas',
      firstName: 'Nihan',
      lastName: 'Sezin',
      email: 'nihan.sezin@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('2001-07-18')
    },
    {
      username: 'onuraksal',
      firstName: 'Onus',
      lastName: 'Aksal',
      email: 'onus.aksal@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('2000-11-30')
    },
    {
      username: 'feridagencer',
      firstName: 'Ferida',
      lastName: 'Ağencer',
      email: 'ferida.agencer@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('1999-09-14')
    },
    {
      username: 'yamanceylan',
      firstName: 'Yaman',
      lastName: 'Koper',
      email: 'yaman.koper@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('2001-02-25')
    },
    {
      username: 'seherkilic',
      firstName: 'Seher',
      lastName: 'Kılıç',
      email: 'seher.kilic@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('2000-06-08')
    },
    {
      username: 'cemrekiran',
      firstName: 'Cemre',
      lastName: 'Kıran',
      email: 'cemre.kiran@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('1999-04-12')
    },
    {
      username: 'emelmataraci',
      firstName: 'Emel',
      lastName: 'Mataraci',
      email: 'emel.mataraci@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('2001-10-03')
    },
    {
      username: 'halisagam',
      firstName: 'Halis',
      lastName: 'Ağam',
      email: 'halis.agam@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('2000-01-20')
    },
    {
      username: 'serkanbolat',
      firstName: 'Serkan',
      lastName: 'Bolat',
      email: 'serkan.bolat@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('1998-08-27')
    },
    {
      username: 'edayildiz',
      firstName: 'Eda',
      lastName: 'Yıldız',
      email: 'eda.yildiz@gmail.com',
      password: 'Student123!',
      role: 'student',
      birthDate: new Date('2001-05-16')
    }
  ];

  try {
    for (const studentData of students) {
      // Öğrenci kullanıcısı oluştur
      const studentUser = await User.create({
        username: studentData.username,
        firstName: studentData.firstName,
        lastName: studentData.lastName,
        email: studentData.email,
        password: studentData.password,
        role: studentData.role
      });

      // Öğrenci bilgilerini oluştur
      await Student.create({
        userId: studentUser.id,
        birthDate: studentData.birthDate
      });
    }
    console.log('15 students successfully created');
  } catch (error) {
    console.error('Error creating default students:', error);
    throw error;
  }
};
