import { DataTypes } from 'sequelize';
import sequelize from '../config/database';
import { EnrollmentModel } from '../types/models';
import Student from './Student';
import Course from './Course';

const Enrollment = sequelize.define<EnrollmentModel>(
  'Enrollment',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Students',
        key: 'id'
      }
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Courses',
        key: 'id'
      }
    },
    enrollmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: 'Enrollments',
    modelName: 'Enrollment',
    timestamps: true
  }
);

// Set up many-to-many relationship between Student and Course
Student.belongsToMany(Course, { through: Enrollment, foreignKey: 'studentId', as: 'courses' });
Course.belongsToMany(Student, { through: Enrollment, foreignKey: 'courseId', as: 'students' });

// Set up direct associations for eager loading
Enrollment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

export default Enrollment as typeof Enrollment & (new () => EnrollmentModel);
