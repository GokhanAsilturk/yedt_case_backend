"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmins = void 0;
const User_1 = __importDefault(require("../models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const seedAdmins = async () => {
    const salt = await bcrypt_1.default.genSalt(10);
    const hashedPassword = await bcrypt_1.default.hash('admin123', salt);
    const defaultAdmin = {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin'
    };
    try {
        await User_1.default.create(defaultAdmin);
        console.log('Default admin user created successfully');
    }
    catch (error) {
        console.error('Error creating default admin:', error);
        throw error;
    }
};
exports.seedAdmins = seedAdmins;
//# sourceMappingURL=adminSeeder.js.map