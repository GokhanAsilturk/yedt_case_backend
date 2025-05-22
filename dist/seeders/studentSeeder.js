"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedStudents = void 0;
const User_1 = __importDefault(require("../models/User"));
const Student_1 = __importDefault(require("../models/Student"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const seedStudents = async () => {
    try {
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash('student123', salt);
        // Örnek öğrenci kullanıcısı oluştur
        const studentUser = await User_1.default.create({
            username: 'student',
            email: 'student@example.com',
            password: hashedPassword,
            role: 'student'
        });
        // Öğrenci bilgilerini oluştur
        await Student_1.default.create({
            userId: studentUser.id,
            firstName: 'Gokhan',
            lastName: 'Asilturk',
            birthDate: new Date('2000-01-01')
        });
        console.log('Default student created successfully');
    }
    catch (error) {
        console.error('Error creating default student:', error);
        throw error;
    }
};
exports.seedStudents = seedStudents;
//# sourceMappingURL=studentSeeder.js.map