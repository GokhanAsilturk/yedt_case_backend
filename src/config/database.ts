import { Sequelize } from 'sequelize';

const env = process.env.NODE_ENV ?? 'development';

const createTestConnection = () => {
  return new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
  });
};

const createNormalConnection = () => {
  return new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432'),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '1234',
    database: process.env.DB_NAME ?? 'yedt_case',
    logging: false,
  });
};

export const sequelize = env === 'test'
  ? createTestConnection()
  : createNormalConnection();
