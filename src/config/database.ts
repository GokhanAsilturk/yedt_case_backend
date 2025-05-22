import { Sequelize } from 'sequelize';

// Ortama göre veritabanı yapılandırması belirle
const env = process.env.NODE_ENV ?? 'development';

// Test ortamı için ayrı veritabanı yapılandırması
const createTestConnection = () => {
  return new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:', // In-memory SQLite veritabanı
    logging: false,
  });
};

// Geliştirme ve üretim ortamı için PostgreSQL yapılandırması
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

// Ortama göre uygun bağlantıyı seç
export const sequelize = env === 'test'
  ? createTestConnection()
  : createNormalConnection();
