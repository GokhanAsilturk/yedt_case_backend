
import { runSeeders } from './index';
import { sequelize } from '../config/database';
import dotenv from 'dotenv';

dotenv.config();

const runSeedersCLI = async () => {
  try {
    console.log('Running seeders...');
    await sequelize.authenticate();
    await runSeeders(sequelize);
    console.log('Seeders completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error running seeders:', error);
    process.exit(1);
  }
};

runSeedersCLI();
