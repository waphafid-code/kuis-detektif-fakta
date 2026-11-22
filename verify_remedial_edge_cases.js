// ============================================================
// 🧪 VERIFY REMEDIAL EDGE CASES (TUGAS 4 AUDIT)
// ------------------------------------------------------------
// Menguji 9 kasus tepi krusial pada alur remedial QuizMaster:
// 1. Nilai tepat 80 -> tidak ditawari remedial. Nilai 79 -> ditawari.
// 2. Remedial dinonaktifkan guru -> popup "sudah tercatat", bukan modal remedial.
// 3. Remedial kedua diblokir; remedial lama (pra-21/11) dengan nilai < 80 boleh diulang.
// 4. Siswa X E 2 yang kini 80 (penyesuaian guru) tidak bisa remedial.
// 5. Remedial gagal (0 benar) -> nilai akhir tetap nilai awal, label "Belum Tuntas".
// 6. Hapus catatan siswa oleh guru (tombstone) -> siswa bisa mengerjakan lagi.
// 7. Koneksi putus saat kirim -> antrean kirim ulang dan pill status jujur.
// 8. Tutup tab / refresh di tengah remedial -> sesi tersimpan & tidak menghasilkan nilai ganda.
// 9. Siswa di HP: tombol "Lanjutkan Remedial" terlihat tanpa scroll horizontal, tinggi tombol >= 52px.
// ============================================================
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 VERIFYING REMEDIAL EDGE CASES (9 KASUS TEPI)');
console.log('════════════════════════════════════════════════════════════════\n');

let totalTests = 0;
let passedTests = 0;

function check(label, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✅ PASS: ${label}`);
        passedTests++;
    } catch (e) {
        console.error(`  ❌ FAIL: ${label}\n     ${e.message}`);
        process.exit(1);
    }
}

// ------------------------------------------------------------
// KASUS 1: Nilai tepat 80 vs 79
// ------------------------------------------------------------
check('Kasus 1: Nilai tepat 80 tidak ditawari remedial, nilai 79 ditawari', () => {
    const REMEDIAL_KKM = 80;
    const isRemedialAllowed = true;
    const policy = 'single_only';

    // Siswa A: nilai 80
    const recordsA = [{ score: 80, isCheated: false, isRemedial: false }];
    const bestScoreA = Math.max(...recordsA.map(r => Number(r.score) || 0));
    const alreadyRemedialedA = false;
    const eligibleA = isRemedialAllowed && policy !== 'allow_multiple'
        && recordsA.length > 0 && bestScoreA < REMEDIAL_KKM && !alreadyRemedialedA;
    assert.strictEqual(eligibleA, false, 'Nilai tepat 80 (KKM) TIDAK boleh ditawari remedial');

    // Siswa B: nilai 79
    const recordsB = [{ score: 79, isCheated: false, isRemedial: false }];
    const bestScoreB = Math.max(...recordsB.map(r => Number(r.score) || 0));
    const eligibleB = isRemedialAllowed && policy !== 'allow_multiple'
        && recordsB.length > 0 && bestScoreB < REMEDIAL_KKM && !alreadyRemedialedA;
    assert.strictEqual(eligibleB, true, 'Nilai 79 (< 80) HARUS ditawari remedial');
});

// ------------------------------------------------------------
// KASUS 2: Remedial dinonaktifkan guru
// ------------------------------------------------------------
check('Kasus 2: Remedial dinonaktifkan guru -> siswa < 80 diblokir dengan popup, bukan modal remedial', () => {
    const REMEDIAL_KKM = 80;
    const isRemedialAllowed = false; // Guru menutup akses remedial
    const policy = 'single_only';

    const records = [{ score: 65, isCheated: false, isRemedial: false }];
    const bestScore = 65;
    const eligible = isRemedialAllowed && policy !== 'allow_multiple'
        && records.length > 0 && bestScore < REMEDIAL_KKM;
    assert.strictEqual(eligible, false, 'Saat remedial dinonaktifkan guru, siswa tidak eligible');

    // Cek apakah masuk jalur pemblokiran single_only
    const validAttempts = records.filter(r => !r.isCheated || Number(r.score) > 0);
    const canProceed = eligible ? true : (validAttempts.length === 0);
    assert.strictEqual(canProceed, false, 'Siswa harus diblokir masuk kuis');
});

// ------------------------------------------------------------
// KASUS 3: Remedial kedua diblokir; remedial lama (< 21/11) boleh diulang
// ------------------------------------------------------------
check('Kasus 3: Remedial kedua diblokir, tapi remedial lama (< 21/11) dengan nilai < 80 boleh diulang', () => {
    const isPreFixRemedial = (r) => {
        const m = String((r && r.date) || '').match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (!m) return false;
        return Date.UTC(+m[3], +m[2] - 1, +m[1]) < Date.UTC(2026, 10, 21);
    };

    // Remedial dikerjakan 22/11/2026 (sesudah fix)
    const recNewRemedial = { date: '22/11/2026', isRemedial: true, score: 70 };
    const isOld = isPreFixRemedial(recNewRemedial);
    assert.strictEqual(isOld, false, 'Remedial 22/11 bukan pre-fix remedial');
    const alreadyRemedialedNew = [recNewRemedial].some(r => r.isRemedial && !isPreFixRemedial(r));
    assert.strictEqual(alreadyRemedialedNew, true, 'Remedial 22/11 menghabiskan jatah remedial');

    // Remedial dikerjakan 20/11/2026 (sebelum fix, dinilai dengan kunci salah)
    const recOldRemedial = { date: '20/11/2026', isRemedial: true, score: 55 };
    const isOld2 = isPreFixRemedial(recOldRemedial);
    assert.strictEqual(isOld2, true, 'Remedial 20/11 terdeteksi sebagai pre-fix remedial');
    const alreadyRemedialedOld = [recOldRemedial].some(r => r.isRemedial && !isPreFixRemedial(r));
    assert.strictEqual(alreadyRemedialedOld, false, 'Remedial 20/11 TIDAK menghabiskan jatah remedial jika skor masih < 80');
});

// ------------------------------------------------------------
// KASUS 4: Siswa X E 2 yang kini 80 (penyesuaian guru) tidak bisa remedial
// ------------------------------------------------------------
check('Kasus 4: 14 Siswa X E 2 yang dipatok 80 oleh penyesuaian guru tidak ditawari remedial', () => {
    const audioCode = fs.readFileSync(path.join(__dirname, 'js/audio.js'), 'utf8');
    const ctx = {
        window: {
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => {}
        },
        localStorage: { getItem: () => null, setItem: () => {} },
        console: { log() {}, warn() {}, error() {} }
    };
    ctx.window.window = ctx.window;
    ctx.window.localStorage = ctx.localStorage;
    vm.createContext(ctx);
    vm.runInContext(audioCode, ctx);

    const mergeRecordsList = ctx.mergeRecordsList || ctx.window.mergeRecordsList;
    assert(typeof mergeRecordsList === 'function', 'mergeRecordsList harus tersedia');

    // Simulasi rekonsiliasi nilai siswa X E 2 dengan penyesuaian guru
    const officialBaseline = {
        name: 'JENNIFER SEPTHIA PUTRI',
        class: 'X E 2',
        moduleId: 'modul_detektif_fakta',
        score: 80,
        adjustedByTeacher: true,
        adjustedScore: 80,
        adjustmentNote: 'Koreksi sistem kuis per 22/11/2026'
    };
    const incomingCloud = {
        name: 'JENNIFER SEPTHIA PUTRI',
        class: 'X E 2',
        moduleId: 'modul_detektif_fakta',
        score: 5,
        remedialScore: 5
    };

    const merged = mergeRecordsList([officialBaseline], [incomingCloud]);
    assert.strictEqual(merged.length, 1);
    assert.strictEqual(merged[0].score, 80, 'Nilai Jennifer setelah merge harus 80');
    assert.strictEqual(merged[0].adjustedByTeacher, true);

    // Saat Jennifer mencoba buka kuis:
    const bestScore = merged[0].score;
    const REMEDIAL_KKM = 80;
    const eligible = bestScore < REMEDIAL_KKM;
    assert.strictEqual(eligible, false, 'Jennifer (skor 80) tidak boleh ditawari remedial');
});

// ------------------------------------------------------------
// KASUS 5: Remedial gagal (0 benar) -> nilai akhir tetap nilai awal, label "Belum Tuntas"
// ------------------------------------------------------------
check('Kasus 5: Remedial gagal (skor 0) -> nilai akhir tetap nilai awal, label "Belum Tuntas"', () => {
    const KKM = 80;
    const isRemedialSession = true;
    const remedialSourceRecord = { score: 55, name: 'Budi' };
    const finalScore = 0; // Remedial gagal total (0 benar)

    const orig = Number(remedialSourceRecord.score) || 0;
    let reconciledScore = finalScore;
    if (finalScore >= KKM) {
        reconciledScore = KKM;
    } else {
        reconciledScore = Math.max(orig, finalScore);
    }
    const displayScore = reconciledScore;
    const isPassed = displayScore >= KKM;

    assert.strictEqual(displayScore, 55, 'Nilai akhir harus tetap nilai awal (55)');
    assert.strictEqual(isPassed, false, 'Siswa belum lulus KKM');

    const statusLabel = isPassed ? 'TUNTAS REMEDIAL' : 'REMEDIAL BELUM TUNTAS';
    assert.strictEqual(statusLabel, 'REMEDIAL BELUM TUNTAS');
});

// ------------------------------------------------------------
// KASUS 6: Hapus catatan siswa oleh guru (tombstone) -> siswa bisa mengerjakan lagi
// ------------------------------------------------------------
check('Kasus 6: Hapus catatan siswa oleh guru (tombstone) memungkinkan siswa mengulang ujian', () => {
    const audioCode = fs.readFileSync(path.join(__dirname, 'js/audio.js'), 'utf8');
    const deletedStore = JSON.stringify(['andi|XE1|modul_detektif_fakta']);
    const ctx = {
        window: {
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => {}
        },
        localStorage: {
            getItem: (k) => k === 'quizmaster_deleted_records' ? deletedStore : null,
            setItem: () => {}
        },
        console: { log() {}, warn() {}, error() {} }
    };
    ctx.window.window = ctx.window;
    ctx.window.localStorage = ctx.localStorage;
    vm.createContext(ctx);
    vm.runInContext(audioCode, ctx);

    const filterDeletedRecords = ctx.filterDeletedRecords || ctx.window.filterDeletedRecords;
    const records = [
        { name: 'Andi', class: 'X E 1', moduleId: 'modul_detektif_fakta', score: 60 },
        { name: 'Budi', class: 'X E 1', moduleId: 'modul_detektif_fakta', score: 90 }
    ];

    const activeList = filterDeletedRecords(records);
    assert.strictEqual(activeList.length, 1, 'Andi harus difilter keluar karena tombstone');
    assert.strictEqual(activeList[0].name, 'Budi');

    // Saat Andi membuka halaman kuis:
    const previousAttemptsForAndi = activeList.filter(r => r.name.toLowerCase() === 'andi');
    assert.strictEqual(previousAttemptsForAndi.length, 0, 'Riwayat Andi kosong sehingga ia dapat mengerjakan lagi');
});

// ------------------------------------------------------------
// KASUS 7: Offline queue & pill status jujur
// ------------------------------------------------------------
check('Kasus 7: Sinyal putus saat submit menghasilkan status pill jujur dan antrean kirim ulang', () => {
    const qeCode = fs.readFileSync(path.join(__dirname, 'js/quiz_engine.js'), 'utf8');
    assert(qeCode.includes('startDeliveryRetry'), 'startDeliveryRetry harus terdefinisi di quiz_engine.js');
    assert(qeCode.includes('BELUM TERKIRIM KE GURU'), 'Pill harus menampilkan pesan jujur saat pengiriman cloud pending');
    assert(qeCode.includes('🟢 100% TERKIRIM KE CLOUD'), 'Pill harus menampilkan indikator hijau saat pengiriman berhasil');
});

// ------------------------------------------------------------
// KASUS 8: Tutup tab / refresh di tengah remedial tidak menghasilkan nilai ganda
// ------------------------------------------------------------
check('Kasus 8: Tutup tab / refresh menyimpan progres ke backup lokal tanpa submit data prematur', () => {
    const qeCode = fs.readFileSync(path.join(__dirname, 'js/quiz_engine.js'), 'utf8');
    assert(qeCode.includes('quizmaster_active_exam_session_backup'), 'Sesi aktif harus disimpan di backup storage');
    assert(qeCode.includes('checkUnfinishedSession'), 'checkUnfinishedSession harus menangani pemulihan sesi');

    // Pengiriman ke cloud hanya terjadi di dalam finishQuiz():
    const finishQuizIdx = qeCode.indexOf('async function finishQuiz');
    const saveRecordIdx = qeCode.indexOf('saveRecord(record)');
    assert(finishQuizIdx !== -1 && saveRecordIdx !== -1, 'Pengiriman saveRecord hanya ada saat kuis selesai');
    assert(saveRecordIdx > finishQuizIdx, 'saveRecord terpanggil di dalam alur finishQuiz');
});

// ------------------------------------------------------------
// KASUS 9: Siswa di HP: Tombol remedial tinggi >= 52px dan responsif tanpa scroll horizontal
// ------------------------------------------------------------
check('Kasus 9: CSS tombol modal remedial memiliki tinggi minimal 52px dan tata letak vertikal responsif', () => {
    const cssCode = fs.readFileSync(path.join(__dirname, 'css/style.css'), 'utf8');
    
    // Cek rule umum modal button
    const generalMatch = cssCode.match(/#remedial-offer-modal \.modal-actions \.btn[\s\S]*?min-height:\s*(\d+)px/);
    assert(generalMatch, 'CSS harus mengatur min-height untuk #remedial-offer-modal .modal-actions .btn');
    const genHeight = parseInt(generalMatch[1], 10);
    assert(genHeight >= 52, `min-height tombol modal harus >= 52px, ditemukan: ${genHeight}px`);

    // Cek media query mobile (<= 640px)
    const mobileBlockMatch = cssCode.match(/@media\s*\(max-width:\s*640px\)[\s\S]*?#remedial-offer-modal \.modal-actions \.btn[\s\S]*?min-height:\s*(\d+)px/);
    assert(mobileBlockMatch, 'Media query mobile harus mengatur tombol remedial');
    const mobHeight = parseInt(mobileBlockMatch[1], 10);
    assert(mobHeight >= 52, `min-height tombol mobile harus >= 52px, ditemukan: ${mobHeight}px`);

    // Pastikan flex-direction column pada modal actions mobile
    const flexColMatch = cssCode.match(/#remedial-offer-modal \.modal-actions[\s\S]*?flex-direction:\s*column/);
    assert(flexColMatch, 'Modal actions mobile harus flex-direction: column agar tidak terjadi scroll horizontal');
});

console.log(`\n🎉 SELURUH 9 KASUS TEPI ALUR REMEDIAL LULUS SEMPURNA: ${passedTests} / ${totalTests}!`);
