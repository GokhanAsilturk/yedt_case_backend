"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
require("../models"); // Import model associations
beforeAll(async () => {
    // Force sync all models
    await database_1.sequelize.sync({ force: true });
});
afterAll(async () => {
    await database_1.sequelize.close();
});
//# sourceMappingURL=setup.js.map