import resetStudentTable from './resetStudent';
import resetCourseTable from './resetCourse';
import resetEnrollmentTable from './resetEnrollment';
import resetUserTable from './resetUser';

/**
 * Tabloları sıfırlama script arayüzü
 * Komut satırı parametrelerine göre belirtilen tabloları sıfırlar
 * 
 * Kullanım:
 * ts-node src/scripts/reset/resetTables.ts [tablo_adı]
 * 
 * Örnek:
 * ts-node src/scripts/reset/resetTables.ts student     # Sadece student tablosunu sıfırlar
 * ts-node src/scripts/reset/resetTables.ts all         # Tüm tabloları sıfırlar
 */

async function resetAllTables() {
  try {
    console.log('Tüm tablolar sıfırlanıyor...');
    
    // İlişkisel tabloları sırasıyla sıfırlıyoruz
    // 1. Önce enrollment tablosunu sıfırla (çünkü diğer tablolara bağımlı)
    console.log('1. Enrollment tablosu sıfırlanıyor...');
    await resetEnrollmentTable();
    
    // 2. Sonra student ve course tablolarını sıfırla
    console.log('2. Student tablosu sıfırlanıyor...');
    await resetStudentTable();
    
    console.log('3. Course tablosu sıfırlanıyor...');
    await resetCourseTable();
    
    // 3. En son user tablosunu sıfırla
    console.log('4. User tablosu sıfırlanıyor...');
    await resetUserTable();
    
    console.log('Tüm tablolar başarıyla sıfırlandı.');
  } catch (error) {
    console.error('Tablolar sıfırlanırken bir hata oluştu:', error);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const tableName = args[0]?.toLowerCase();
  
  if (!tableName || args.length === 0) {
    console.log(`
Kullanım: ts-node src/scripts/reset/resetTables.ts [tablo_adı]

Mevcut Tablolar:
  - student     : Öğrenci tablosunu sıfırlar
  - course      : Kurs tablosunu sıfırlar
  - enrollment  : Kayıt tablosunu sıfırlar
  - user        : Kullanıcı tablosunu sıfırlar
  - all         : Tüm tabloları sıfırlar

Örnek:
  ts-node src/scripts/reset/resetTables.ts student
  ts-node src/scripts/reset/resetTables.ts all
    `);
    process.exit(0);
  }
  
  try {
    switch (tableName) {
      case 'student':
        await resetStudentTable();
        break;
      case 'course':
        await resetCourseTable();
        break;
      case 'enrollment':
        await resetEnrollmentTable();
        break;
      case 'user':
        await resetUserTable();
        break;
      case 'all':
        await resetAllTables();
        break;
      default:
        console.error(`Hata: '${tableName}' geçerli bir tablo adı değil.`);
        process.exit(1);
    }
    
    console.log('İşlem başarıyla tamamlandı.');
    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

// Script doğrudan çalıştırıldığında
if (require.main === module) {
  main();
}

export {
  resetStudentTable,
  resetCourseTable,
  resetEnrollmentTable,
  resetUserTable,
  resetAllTables
};