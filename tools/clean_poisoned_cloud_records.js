// ============================================================
// 🧹 ALAT PEMBERSIHAN DATA CLOUD (MODE DRY-RUN AMAN)
// ------------------------------------------------------------
// Alat untuk memeriksa dan mengusulkan penghapusan entri remedial
// palsu 20/11/2026 (skor 90, benar 18) dari Firebase RTDB & Supabase.
//
// ⚠️ PERINGATAN KESELAMATAN:
// Secara default skrip ini berjalan dalam MODE SIMULASI (DRY-RUN).
// Tidak ada data cloud yang dihapus tanpa bendera eksplisit:
//   node tools/clean_poisoned_cloud_records.js --execute --confirm-teacher-approval
// ============================================================
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('════════════════════════════════════════════════════════════════');
console.log('🧹 QUIZMASTER CLOUD DATA CLEANUP TOOL (DRY-RUN INSPECTION)');
console.log('════════════════════════════════════════════════════════════════\n');

// Muat helper audio.js untuk isPoisonedRemedialRecord
const audioCode = fs.readFileSync(path.join(__dirname, '../js/audio.js'), 'utf8');
const ctx = {
    window: { addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => {} },
    localStorage: { getItem: () => null, setItem: () => {} },
    console: { log() {}, warn() {}, error() {} }
};
ctx.window.window = ctx.window;
vm.createContext(ctx);
vm.runInContext(audioCode, ctx);

const isPoisonedRemedialRecord = ctx.isPoisonedRemedialRecord || ctx.window.isPoisonedRemedialRecord;
const purgeFakeJkiRecords = ctx.purgeFakeJkiRecords || ctx.window.purgeFakeJkiRecords;

const args = process.argv.slice(2);
const isExecute = args.includes('--execute');
const hasTeacherConfirmation = args.includes('--confirm-teacher-approval');

console.log(`Mode Operasi: ${isExecute && hasTeacherConfirmation ? '⚠️ LIVE EXECUTE (HAPUS NYATA)' : '🛡️ DRY-RUN (HANYA SIMULASI / PRATINJAU)'}`);

// Muat daftar hasil ujian resmi saat ini
const defRecordsCode = fs.readFileSync(path.join(__dirname, '../js/default_records.js'), 'utf8');
const match = defRecordsCode.match(/const OFFICIAL_EXAM_RESULTS = (\[[\s\S]*?\n\]);/);
const baselineRecords = match ? eval(match[1]) : [];

console.log(`\n1. Memindai data basis data lokal & cadangan (${baselineRecords.length} entri)...`);

const poisonedFound = [];
baselineRecords.forEach((r, idx) => {
    if (isPoisonedRemedialRecord && isPoisonedRemedialRecord(r)) {
        poisonedFound.push({ index: idx, record: r });
    }
});

console.log(`   Ditemukan ${poisonedFound.length} entri terdeteksi sebagai remedial palsu (20/11/2026, skor 90, benar 18):`);

if (poisonedFound.length > 0) {
    console.table(poisonedFound.map(p => ({
        Nama: p.record.name,
        Kelas: p.record.class,
        Modul: p.record.moduleId,
        Tanggal: p.record.date,
        Skor: p.record.score,
        RemedialScore: p.record.remedialScore,
        Benar: p.record.correct
    })));
} else {
    console.log('   ✨ Catatan baseline resmi sudah bersih dari entri remedial palsu 20/11.');
}

console.log('\n2. Rencana Pembersihan Cloud (Firebase & Supabase):');
console.log('   - Modul Target: modul_detektif_fakta (Misi Detektif Fakta)');
console.log('   - Kriteria Target: Kelas X E 2, Tanggal 20/11/2026, remedialScore == 90, correct == 18');
console.log('   - Tindakan yang akan diambil:');
console.log('     * Firebase Realtime Database: Hapus child node yang berakhiran `_rem` dengan stempel 20/11/2026.');
console.log('     * Supabase `quiz_submissions`: DELETE WHERE quiz_date = "20/11/2026" AND student_class = "X E 2" AND score = 80 AND wrong_questions->>remedialScore = "90";');

if (!isExecute || !hasTeacherConfirmation) {
    console.log('\n🛡️ [SIMULASI SELESAI] Tidak ada data cloud yang diubah atau dihapus.');
    console.log('   Aplikasi kuis saat ini sudah secara otomatis mengabaikan entri-entri ini');
    console.log('   melalui mekanisme isolasi `isPoisonedRemedialRecord`.');
    console.log('   Untuk melakukan eksekusi penghapusan di cloud, hubungi guru untuk konfirmasi resmi.');
} else {
    console.log('\n⚠️ Menunggu input konfirmasi interaktif dari Guru sebelum menghubungi endpoint cloud...');
}
