import User from './User';
import Student from './Student';
import Admin from './Admin';
import Course from './Course';
import Enrollment from './Enrollment';
import { sequelize } from '../config/database';

User.hasOne(Student, {
  foreignKey: 'userId',
  as: 'studentProfile'
});
Student.belongsTo(User, {
  foreignKey: 'userId',
  as: 'userAccount'
});

User.hasOne(Admin, {
  foreignKey: 'userId',
  as: 'adminProfile'
});
Admin.belongsTo(User, {
  foreignKey: 'userId',
  as: 'userAccount'
});

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

Student.hasMany(Enrollment, {
  foreignKey: 'studentId',
  as: 'studentEnrollments'
});
Enrollment.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'enrolledStudent'
});

Course.hasMany(Enrollment, {
  foreignKey: 'courseId',
  as: 'courseEnrollments'
});
Enrollment.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'enrolledCourse'
});

export { sequelize, User, Student, Admin, Course, Enrollment };
