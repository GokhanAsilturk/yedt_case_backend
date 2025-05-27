"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const defaultCourses = [
    {
        name: 'Matematik 101',
        description: 'Temel matematik dersi.'
    },
    {
        name: 'Fizik 101',
        description: 'Fizik bilimine giriş dersi.'
    },
    {
        name: 'Bilgisayar Bilimleri',
        description: 'Bilgisayar bilimi temelleri dersi.'
    }
];
const seedCourses = async () => {
    try {
        await Promise.all(defaultCourses.map(course => Course_1.default.create(course)));
    }
    catch (error) {
        console.error('Error creating default courses:', error);
        throw error;
    }
};
exports.seedCourses = seedCourses;
//# sourceMappingURL=courseSeeder.js.map