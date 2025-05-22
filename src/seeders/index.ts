import { Sequelize } from 'sequelize';
import { seedAdmins } from './adminSeeder';
import { seedCourses } from './courseSeeder';
import { seedStudents } from './studentSeeder';
import User from '../models/User';
import Course from '../models/Course';
import Student from '../models/Student';

export const runSeeders = async (sequelize: Sequelize): Promise<void> => {
  try {
    // Check if admin exists
    const adminCount = await User.count({ where: { role: 'admin' } });
    if (adminCount === 0) {
      console.log('Seeding admin...');
      await seedAdmins();
    }

    // Check if courses exist
    const courseCount = await Course.count();
    if (courseCount === 0) {
      console.log('Seeding courses...');
      await seedCourses();
    }

    // Check if students exist
    const studentCount = await Student.count();
    if (studentCount === 0) {
      console.log('Seeding students...');
      await seedStudents();
    }

    console.log('Seeding completed!');
  } catch (error) {
    console.error('Error running seeders:', error);
    throw error;
  }
};
