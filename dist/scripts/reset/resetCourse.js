"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../../config/database");
/**
 * Course tablosunu sıfırlayan script
 * Bu script, Course tablosundaki tüm kayıtları siler.
 */
async function resetCourseTable() {
    const transaction = await database_1.sequelize.transaction();
    try {
        console.log('Course tablosu sıfırlanıyor...');
        // Raw SQL sorgusu ile CASCADE seçeneğini kullanarak tabloyu truncate et
        await database_1.sequelize.query('TRUNCATE TABLE "Courses" CASCADE', { transaction });
        // Başarılı olduğunu bildir
        const deletedCount = 'SUCCESS';
        await transaction.commit();
        console.log(`Course tablosu başarıyla sıfırlandı. ${deletedCount} kayıt silindi.`);
    }
    catch (error) {
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
exports.default = resetCourseTable;
//# sourceMappingURL=resetCourse.js.map