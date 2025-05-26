"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../../config/database");
/**
 * Enrollment tablosunu sıfırlayan script
 * Bu script, Enrollment tablosundaki tüm kayıtları siler.
 */
async function resetEnrollmentTable() {
    const transaction = await database_1.sequelize.transaction();
    try {
        console.log('Enrollment tablosu sıfırlanıyor...');
        // Raw SQL sorgusu ile CASCADE seçeneğini kullanarak tabloyu truncate et
        await database_1.sequelize.query('TRUNCATE TABLE "Enrollments" CASCADE', { transaction });
        // Başarılı olduğunu bildir
        const deletedCount = 'SUCCESS';
        await transaction.commit();
        console.log(`Enrollment tablosu başarıyla sıfırlandı. ${deletedCount} kayıt silindi.`);
    }
    catch (error) {
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
exports.default = resetEnrollmentTable;
//# sourceMappingURL=resetEnrollment.js.map