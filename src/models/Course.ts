import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database';
import { CourseModel } from '../types/models';

const Course = sequelize.define<CourseModel>(
  'Course',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
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
    tableName: 'Courses',
    modelName: 'Course',
    timestamps: true
  }
);

export default Course as typeof Course & (new () => CourseModel);
