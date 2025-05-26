"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Enrollment = exports.Course = exports.Admin = exports.Student = exports.User = exports.sequelize = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Student_1 = __importDefault(require("./Student"));
exports.Student = Student_1.default;
const Admin_1 = __importDefault(require("./Admin"));
exports.Admin = Admin_1.default;
const Course_1 = __importDefault(require("./Course"));
exports.Course = Course_1.default;
const Enrollment_1 = __importDefault(require("./Enrollment"));
exports.Enrollment = Enrollment_1.default;
const database_1 = require("../config/database");
Object.defineProperty(exports, "sequelize", { enumerable: true, get: function () { return database_1.sequelize; } });
// User - Student İlişkisi (One-to-One)
User_1.default.hasOne(Student_1.default, {
    foreignKey: 'userId',
    as: 'studentProfile'
});
Student_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId',
    as: 'userAccount'
});
// User - Admin İlişkisi (One-to-One)
User_1.default.hasOne(Admin_1.default, {
    foreignKey: 'userId',
    as: 'adminProfile'
});
Admin_1.default.belongsTo(User_1.default, {
    foreignKey: 'userId',
    as: 'userAccount'
});
// Student - Course İlişkisi (Many-to-Many through Enrollment)
Student_1.default.belongsToMany(Course_1.default, {
    through: Enrollment_1.default,
    foreignKey: 'studentId',
    otherKey: 'courseId',
    as: 'enrolledCourses'
});
Course_1.default.belongsToMany(Student_1.default, {
    through: Enrollment_1.default,
    foreignKey: 'courseId',
    otherKey: 'studentId',
    as: 'enrolledStudents'
});
// Student - Enrollment İlişkisi
Student_1.default.hasMany(Enrollment_1.default, {
    foreignKey: 'studentId',
    as: 'studentEnrollments'
});
Enrollment_1.default.belongsTo(Student_1.default, {
    foreignKey: 'studentId',
    as: 'enrolledStudent'
});
// Course - Enrollment İlişkisi
Course_1.default.hasMany(Enrollment_1.default, {
    foreignKey: 'courseId',
    as: 'courseEnrollments'
});
Enrollment_1.default.belongsTo(Course_1.default, {
    foreignKey: 'courseId',
    as: 'enrolledCourse'
});
//# sourceMappingURL=index.js.map