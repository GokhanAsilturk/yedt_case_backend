#!/bin/bash
set -e

echo "Veritabanı bağlantısı bekleniyor..."
# Veritabanı hazır olana kadar bekle
until node -e "
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'yedt_case'
});
sequelize.authenticate()
  .then(() => {
    console.log('Veritabanı bağlantısı başarılı');
    process.exit(0);
  })
  .catch(err => {
    console.error('Veritabanı bağlantısı başarısız:', err);
    process.exit(1);
  });
"; do
  echo "Veritabanı henüz hazır değil... Tekrar deneniyor"
  sleep 2
done

echo "Veritabanı hazır, migration ve seed işlemleri başlatılıyor..."

# Veritabanı tabloları oluştur (sync)
NODE_ENV=$NODE_ENV node -e "
const { sequelize } = require('./dist/config/database');
const models = require('./dist/models');

async function syncDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log('Veritabanı tabloları başarıyla oluşturuldu.');
    process.exit(0);
  } catch (error) {
    console.error('Veritabanı tabloları oluşturulurken hata:', error);
    process.exit(1);
  }
}

syncDatabase();
"

# Seed verileri yükle
echo "Seed verileri yükleniyor..."
npm run seed

echo "Veritabanı kurulumu tamamlandı!"