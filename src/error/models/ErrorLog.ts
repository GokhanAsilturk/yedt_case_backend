import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database';

interface ErrorLogAttributes {
  id: string;
  errorCode: string;
  message: string;
  stackTrace: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  metadata: object;
  userId?: string;
  requestId?: string;
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ErrorLogCreationAttributes = Optional<ErrorLogAttributes, 'id'>;

class ErrorLog extends Model<ErrorLogAttributes, ErrorLogCreationAttributes> implements ErrorLogAttributes {
  public id!: string;
  public errorCode!: string;
  public message!: string;
  public stackTrace!: string;
  public severity!: 'info' | 'warning' | 'error' | 'critical';
  public metadata!: object;
  public userId?: string;
  public requestId?: string;
  public timestamp!: Date;
  public userAgent?: string;
  public ip?: string;
  public url?: string;
  public method?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ErrorLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    errorCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    stackTrace: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    severity: {
      type: DataTypes.ENUM('info', 'warning', 'error', 'critical'),
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    requestId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    method: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'ErrorLog',
    tableName: 'error_logs',
    timestamps: true,
  }
);

export default ErrorLog;