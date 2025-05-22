"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_1 = require("./config/swagger");
const database_1 = require("./config/database");
const seeders_1 = require("./seeders");
require("./models");
dotenv_1.default.config();
// Initialize database and run seeders
const initDatabase = async () => {
    try {
        await database_1.sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        // Run seeders
        await (0, seeders_1.runSeeders)(database_1.sequelize);
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};
initDatabase();
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// Routes
const auth_1 = __importDefault(require("./routes/auth"));
const students_1 = __importDefault(require("./routes/students"));
const courses_1 = __importDefault(require("./routes/courses"));
const enrollments_1 = __importDefault(require("./routes/enrollments"));
// API Documentation
(0, swagger_1.setupSwagger)(app);
app.get('/', (req, res) => {
    res.json({ message: 'Student Management System API' });
});
// API routes
app.use('/api/auth', auth_1.default);
app.use('/api/students', students_1.default);
app.use('/api/courses', courses_1.default);
app.use('/api/enrollments', enrollments_1.default);
app.use((err, req, res, next) => {
    var _a, _b;
    console.error(err.stack);
    res.status((_a = err.status) !== null && _a !== void 0 ? _a : 500).json({
        error: (_b = err.message) !== null && _b !== void 0 ? _b : 'Something went wrong!'
    });
});
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 5000;
exports.default = app;
//# sourceMappingURL=app.js.map