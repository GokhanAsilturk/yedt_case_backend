import { sequelize } from '../../config/database';

/**
 * User tablosunu sıfırlayan script
 * Bu script, User tablosundaki tüm kayıtları siler.
 * DİKKAT: Bu işlem Student ve Admin tablolarındaki ilişkili kayıtların da silinmesine neden olabilir.
 */
async function resetUserTable() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('User tablosu sıfırlanıyor...');
    
    // Raw SQL sorgusu ile CASCADE seçeneğini kullanarak tabloyu truncate et
    await sequelize.query('TRUNCATE TABLE "Users" CASCADE', { transaction });
    
    // Başarılı olduğunu bildir
    const deletedCount = 'SUCCESS';
    
    await transaction.commit();
    console.log(`User tablosu başarıyla sıfırlandı. ${deletedCount} kayıt silindi.`);
    
  } catch (error) {
    await transaction.rollback();
    console.error('User tablosu sıfırlanırken bir hata oluştu:', error);
    throw error;
  }
}

// Script doğrudan çalıştırıldığında
if (require.main === module) {
  resetUserTable()
    .then(() => {
      console.log('İşlem tamamlandı.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Hata:', error);
      process.exit(1);
    });
}

export default resetUserTable;