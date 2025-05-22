import Course from '../models/Course';

const defaultCourses = [
  {
    name: 'Mathematics 101',
    description: 'Introduction to basic mathematics concepts including algebra and calculus.'
  },
  {
    name: 'Physics 101',
    description: 'Fundamental physics principles and mechanics.'
  },
  {
    name: 'Computer Science 101',
    description: 'Introduction to programming and computer science basics.'
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
