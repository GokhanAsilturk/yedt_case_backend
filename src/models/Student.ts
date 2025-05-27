import { DataTypes } from 'sequelize';
import {sequelize} from '../config/database';
import { StudentModel } from '../types/models';
import User from './User';

const Student = sequelize.define<StudentModel>(
  'Student',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    birthDate: {
      type: DataTypes.DATE,
      allowNull: false
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
    tableName: 'Students',
    modelName: 'Student',
    timestamps: true
  }
);

Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Student;
