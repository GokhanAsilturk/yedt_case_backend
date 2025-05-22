import { DataTypes, Model, CreationOptional } from 'sequelize';
import * as bcrypt from 'bcryptjs';
import { AppError, ErrorCode } from '../middleware/errorHandler';
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
    allowNull: false
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

// Şifre değişikliğinde güncellemek için hook
User.beforeUpdate(async (user: User) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 12); // Salt faktörünü artır (10'dan 12'ye)
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Şifre değiştiğinde token sürümünü artır
  }
});

// Yeni kullanıcı oluşturulduğunda şifreyi hashlemek için hook
User.beforeCreate(async (user: User) => {
  // Şifre karmaşıklığını kontrol et
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(user.password)) {
    throw new AppError(
      'Şifre en az 8 karakter uzunluğunda olmalı ve en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.',
      400,
      ErrorCode.VALIDATION_ERROR
    );
  }
  
  // Daha güçlü hashing (salt faktörünü artır)
  user.password = await bcrypt.hash(user.password, 12);
});

// Şifre doğrulama işlevini genişlet (brute force saldırılarına karşı zamanlama koruması)
User.prototype.validatePassword = async function (password: string): Promise<boolean> {
  // Zamanlama saldırılarına karşı koruma için sabit zamanlı karşılaştırma
  const isValid = await bcrypt.compare(password, this.password);
  
  // Başarısız giriş denemelerini yönetmek için eklenebilir - veritabanında field eklenmesi gerekebilir
  // this.loginAttempts = isValid ? 0 : (this.loginAttempts || 0) + 1;
  // await this.save();
  
  return isValid;
};

export default User;
