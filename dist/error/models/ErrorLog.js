"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class ErrorLog extends sequelize_1.Model {
}
ErrorLog.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    errorCode: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    stackTrace: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    severity: {
        type: sequelize_1.DataTypes.ENUM('info', 'warning', 'error', 'critical'),
        allowNull: false,
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: true,
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    requestId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    userAgent: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    ip: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    method: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'ErrorLog',
    tableName: 'error_logs',
    timestamps: true,
});
exports.default = ErrorLog;
//# sourceMappingURL=ErrorLog.js.map