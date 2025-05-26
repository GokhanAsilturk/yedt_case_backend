"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetUserTable = exports.resetEnrollmentTable = exports.resetCourseTable = exports.resetStudentTable = void 0;
exports.resetAllTables = resetAllTables;
const resetStudent_1 = __importDefault(require("./resetStudent"));
exports.resetStudentTable = resetStudent_1.default;
const resetCourse_1 = __importDefault(require("./resetCourse"));
exports.resetCourseTable = resetCourse_1.default;
const resetEnrollment_1 = __importDefault(require("./resetEnrollment"));
exports.resetEnrollmentTable = resetEnrollment_1.default;
const resetUser_1 = __importDefault(require("./resetUser"));
exports.resetUserTable = resetUser_1.default;
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
        await (0, resetEnrollment_1.default)();
        // 2. Sonra student ve course tablolarını sıfırla
        console.log('2. Student tablosu sıfırlanıyor...');
        await (0, resetStudent_1.default)();
        console.log('3. Course tablosu sıfırlanıyor...');
        await (0, resetCourse_1.default)();
        // 3. En son user tablosunu sıfırla
        console.log('4. User tablosu sıfırlanıyor...');
        await (0, resetUser_1.default)();
        console.log('Tüm tablolar başarıyla sıfırlandı.');
    }
    catch (error) {
        console.error('Tablolar sıfırlanırken bir hata oluştu:', error);
        process.exit(1);
    }
}
async function main() {
    var _a;
    const args = process.argv.slice(2);
    const tableName = (_a = args[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase();
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
                await (0, resetStudent_1.default)();
                break;
            case 'course':
                await (0, resetCourse_1.default)();
                break;
            case 'enrollment':
                await (0, resetEnrollment_1.default)();
                break;
            case 'user':
                await (0, resetUser_1.default)();
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
    }
    catch (error) {
        console.error('Hata:', error);
        process.exit(1);
    }
}
// Script doğrudan çalıştırıldığında
if (require.main === module) {
    main();
}
//# sourceMappingURL=resetTables.js.map