import { sequelize } from '../../config/database';

/**
 * Enrollment tablosunu sıfırlayan script
 * Bu script, Enrollment tablosundaki tüm kayıtları siler.
 */
async function resetEnrollmentTable() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Enrollment tablosu sıfırlanıyor...');
    
    // Raw SQL sorgusu ile CASCADE seçeneğini kullanarak tabloyu truncate et
    await sequelize.query('TRUNCATE TABLE "Enrollments" CASCADE', { transaction });
    
    // Başarılı olduğunu bildir
    const deletedCount = 'SUCCESS';
    
    await transaction.commit();
    console.log(`Enrollment tablosu başarıyla sıfırlandı. ${deletedCount} kayıt silindi.`);
    
  } catch (error) {
    await transaction.rollback();
    console.error('Enrollment tablosu sıfırlanırken bir hata oluştu:', error);
    throw error;
  }
}

// Script doğrudan çalıştırıldığında
if (require.main === module) {
  resetEnrollmentTable()
    .then(() => {
      console.log('İşlem tamamlandı.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Hata:', error);
      process.exit(1);
    });
}

export default resetEnrollmentTable;