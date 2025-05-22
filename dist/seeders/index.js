"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeeders = void 0;
const adminSeeder_1 = require("./adminSeeder");
const courseSeeder_1 = require("./courseSeeder");
const studentSeeder_1 = require("./studentSeeder");
const User_1 = __importDefault(require("../models/User"));
const Course_1 = __importDefault(require("../models/Course"));
const Student_1 = __importDefault(require("../models/Student"));
const runSeeders = async (sequelize) => {
    try {
        // Check if admin exists
        const adminCount = await User_1.default.count({ where: { role: 'admin' } });
        if (adminCount === 0) {
            console.log('Seeding admin...');
            await (0, adminSeeder_1.seedAdmins)();
        }
        // Check if courses exist
        const courseCount = await Course_1.default.count();
        if (courseCount === 0) {
            console.log('Seeding courses...');
            await (0, courseSeeder_1.seedCourses)();
        }
        // Check if students exist
        const studentCount = await Student_1.default.count();
        if (studentCount === 0) {
            console.log('Seeding students...');
            await (0, studentSeeder_1.seedStudents)();
        }
        console.log('Seeding completed!');
    }
    catch (error) {
        console.error('Error running seeders:', error);
        throw error;
    }
};
exports.runSeeders = runSeeders;
//# sourceMappingURL=index.js.map