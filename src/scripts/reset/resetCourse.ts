import { sequelize } from '../../config/database';

/**
 * Course tablosunu sıfırlayan script
 * Bu script, Course tablosundaki tüm kayıtları siler.
 */
async function resetCourseTable() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Course tablosu sıfırlanıyor...');
    
    // Raw SQL sorgusu ile CASCADE seçeneğini kullanarak tabloyu truncate et
    await sequelize.query('TRUNCATE TABLE "Courses" CASCADE', { transaction });
    
    // Başarılı olduğunu bildir
    const deletedCount = 'SUCCESS';
    
    await transaction.commit();
    console.log(`Course tablosu başarıyla sıfırlandı. ${deletedCount} kayıt silindi.`);
    
  } catch (error) {
    await transaction.rollback();
    console.error('Course tablosu sıfırlanırken bir hata oluştu:', error);
    throw error;
  }
}

// Script doğrudan çalıştırıldığında
if (require.main === module) {
  resetCourseTable()
    .then(() => {
      console.log('İşlem tamamlandı.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Hata:', error);
      process.exit(1);
    });
}

export default resetCourseTable;