import User from './User';
import Student from './Student';
import Course from './Course';
import Enrollment from './Enrollment';
import { sequelize } from '../config/database';

// User - Student İlişkisi (One-to-One)
User.hasOne(Student, {
  foreignKey: 'userId',
  as: 'studentProfile'
});
Student.belongsTo(User, {
  foreignKey: 'userId',
  as: 'userAccount'
});

// Student - Course İlişkisi (Many-to-Many through Enrollment)
Student.belongsToMany(Course, {
  through: Enrollment,
  foreignKey: 'studentId',
  otherKey: 'courseId',
  as: 'enrolledCourses'
});

Course.belongsToMany(Student, {
  through: Enrollment,
  foreignKey: 'courseId',
  otherKey: 'studentId',
  as: 'enrolledStudents'
});

// Student - Enrollment İlişkisi
Student.hasMany(Enrollment, {
  foreignKey: 'studentId',
  as: 'studentEnrollments'
});
Enrollment.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'enrolledStudent'
});

// Course - Enrollment İlişkisi
Course.hasMany(Enrollment, {
  foreignKey: 'courseId',
  as: 'courseEnrollments'
});
Enrollment.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'enrolledCourse'
});

export { sequelize, User, Student, Course, Enrollment };
