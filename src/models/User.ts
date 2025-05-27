import { DataTypes, Model, CreationOptional } from 'sequelize';
import * as bcrypt from 'bcryptjs';
import { AppError } from '../error/models/AppError';
import { ErrorCode } from '../error/constants/errorCodes';
import { validatePassword } from '../middleware/validator';
import { sequelize } from '../config/database';

class User extends Model {
  declare id: CreationOptional<string>;
  declare username: string;
  declare email: string;
  declare password: string;
  declare role: 'admin' | 'student';
  declare tokenVersion: CreationOptional<number>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'student'),
    allowNull: false
  },
  tokenVersion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
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
}, {
  sequelize,
  modelName: 'User',
  tableName: 'Users'
});

User.beforeUpdate(async (user: User) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 12);
    user.tokenVersion = (user.tokenVersion || 0) + 1;
  }
});

User.beforeCreate(async (user: User) => {
  if (!validatePassword(user.password)) {
    throw new AppError(
      'Şifre en az 8 karakter uzunluğunda olmalı, en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.',
      400,
      ErrorCode.VALIDATION_ERROR
    );
  }
  
  user.password = await bcrypt.hash(user.password, 12);
});

User.prototype.validatePassword = async function (password: string): Promise<boolean> {
  const isValid = await bcrypt.compare(password, this.password);
  
  return isValid;
};

export default User;
