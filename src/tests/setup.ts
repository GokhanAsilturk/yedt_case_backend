import { sequelize } from '../config/database';
import '../models';  // Import model associations

beforeAll(async () => {
  // Force sync all models
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});
