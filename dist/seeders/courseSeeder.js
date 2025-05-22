"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const defaultCourses = [
    {
        name: 'Mathematics 101',
        description: 'Introduction to basic mathematics concepts including algebra and calculus.'
    },
    {
        name: 'Physics 101',
        description: 'Fundamental physics principles and mechanics.'
    },
    {
        name: 'Computer Science 101',
        description: 'Introduction to programming and computer science basics.'
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