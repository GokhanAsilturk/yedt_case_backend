"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const Student_1 = __importDefault(require("./Student"));
const Course_1 = __importDefault(require("./Course"));
const Enrollment = database_1.sequelize.define('Enrollment', {
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true
    },
    studentId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Students',
            key: 'id'
        }
    },
    courseId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Courses',
            key: 'id'
        }
    },
    enrollmentDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
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
    tableName: 'Enrollments',
    modelName: 'Enrollment',
    timestamps: true
});
// Set up many-to-many relationship between Student and Course
Student_1.default.belongsToMany(Course_1.default, { through: Enrollment, foreignKey: 'studentId', as: 'courses' });
Course_1.default.belongsToMany(Student_1.default, { through: Enrollment, foreignKey: 'courseId', as: 'students' });
// Set up direct associations for eager loading
Enrollment.belongsTo(Student_1.default, { foreignKey: 'studentId', as: 'student' });
Enrollment.belongsTo(Course_1.default, { foreignKey: 'courseId', as: 'course' });
exports.default = Enrollment;
//# sourceMappingURL=Enrollment.js.map