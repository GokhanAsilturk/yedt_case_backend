"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const bcrypt = __importStar(require("bcryptjs"));
const AppError_1 = require("../error/models/AppError");
const errorCodes_1 = require("../error/constants/errorCodes");
const validator_1 = require("../middleware/validator");
const database_1 = require("../config/database");
class User extends sequelize_1.Model {
    async validatePassword(password) {
        return await bcrypt.compare(password, this.password);
    }
}
User.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        }
    },
    role: {
        type: sequelize_1.DataTypes.ENUM('admin', 'student'),
        allowNull: false
    },
    tokenVersion: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: database_1.sequelize,
    modelName: 'User',
    tableName: 'Users'
});
// Şifre değişikliğinde güncellemek için hook
User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12); // Salt faktörünü artır (10'dan 12'ye)
        user.tokenVersion = (user.tokenVersion || 0) + 1; // Şifre değiştiğinde token sürümünü artır
    }
});
// Yeni kullanıcı oluşturulduğunda şifreyi hashlemek için hook
User.beforeCreate(async (user) => {
    if (!(0, validator_1.validatePassword)(user.password)) {
        throw new AppError_1.AppError('Şifre en az 8 karakter uzunluğunda olmalı, en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir.', 400, errorCodes_1.ErrorCode.VALIDATION_ERROR);
    }
    // Daha güçlü hashing (salt faktörünü artır)
    user.password = await bcrypt.hash(user.password, 12);
});
// Şifre doğrulama işlevini genişlet (brute force saldırılarına karşı zamanlama koruması)
User.prototype.validatePassword = async function (password) {
    // Zamanlama saldırılarına karşı koruma için sabit zamanlı karşılaştırma
    const isValid = await bcrypt.compare(password, this.password);
    // Başarısız giriş denemelerini yönetmek için eklenebilir - veritabanında field eklenmesi gerekebilir
    // this.loginAttempts = isValid ? 0 : (this.loginAttempts || 0) + 1;
    // await this.save();
    return isValid;
};
exports.default = User;
//# sourceMappingURL=User.js.map