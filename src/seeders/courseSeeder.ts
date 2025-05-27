import Course from '../models/Course';

const defaultCourses = [
  {
    name: 'Matematik 101',
    description: 'Temel matematik dersi.'
  },
  {
    name: 'Fizik 101',
    description: 'Fizik bilimine giriş dersi.'
  },
  {
    name: 'Bilgisayar Bilimleri',
    description: 'Bilgisayar bilimi temelleri dersi.'
  }
];

export const seedCourses = async (): Promise<void> => {
  try {
    await Promise.all(defaultCourses.map(course => Course.create(course)));
  } catch (error) {
    console.error('Error creating default courses:', error);
    throw error;
  }
};
