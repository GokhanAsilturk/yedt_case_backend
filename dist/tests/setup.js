"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestUser = void 0;
const database_1 = require("../config/database");
require("../models"); // Import model associations
const User_1 = __importDefault(require("../models/User"));
const uuid_1 = require("uuid");
const createTestUser = async (options = {}) => {
    var _a, _b, _c, _d, _e;
    const userId = (0, uuid_1.v4)();
    const defaultEmail = `test${userId}@example.com`;
    const defaultUsername = `testuser${userId}`;
    const user = await User_1.default.create({
        id: userId,
        email: (_a = options.email) !== null && _a !== void 0 ? _a : defaultEmail,
        username: (_b = options.username) !== null && _b !== void 0 ? _b : defaultUsername,
        password: '123456',
        role: (_c = options.role) !== null && _c !== void 0 ? _c : 'student',
        firstName: (_d = options.firstName) !== null && _d !== void 0 ? _d : 'Test',
        lastName: (_e = options.lastName) !== null && _e !== void 0 ? _e : 'User'
    });
    return user;
};
exports.createTestUser = createTestUser;
beforeAll(async () => {
    // Force sync all models
    await database_1.sequelize.sync({ force: true });
});
afterAll(async () => {
    await database_1.sequelize.close();
});
//# sourceMappingURL=setup.js.map