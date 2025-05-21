"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
require("../models"); // Import models to ensure they are registered
beforeAll(async () => {
    // Force sync all models
    await database_1.default.sync({ force: true });
});
afterAll(async () => {
    await database_1.default.close();
});
//# sourceMappingURL=setup.js.map