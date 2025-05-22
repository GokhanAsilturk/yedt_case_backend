"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const database_1 = require("../config/database");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const runSeedersCLI = async () => {
    try {
        console.log('Running seeders...');
        await database_1.sequelize.authenticate();
        await (0, index_1.runSeeders)(database_1.sequelize);
        console.log('Seeders completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error running seeders:', error);
        process.exit(1);
    }
};
runSeedersCLI();
//# sourceMappingURL=cli.js.map