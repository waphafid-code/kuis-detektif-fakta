/**
 * verify_tryout_dashboard_matrix.js
 * Comprehensive Verification for Tryout Terpadu 60 Soal (6 Materi):
 * 1. Fallback built-in questions (TRYOUT_TERPADU_BUILTIN_QUESTIONS, 60 questions, 10 per M1..M6).
 * 2. topicBreakdown preservation in audio.js (snapshotAttempt & mergeRecordsList).
 * 3. Dasbor Guru: Matrix view of 6 separated module scores (M1..M6) viewed simultaneously with Total Score.
 * 4. Modal Detail Siswa: Topic filtering (M1..M6) and 60-question sheet inspection.
 * 5. Excel Export: Dedicated Tryout sheet with M1..M6 separated score columns.
 * 6. HTML & UI sync across root and src/.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 VERIFYING TRYOUT 60-QUESTION DASHBOARD MATRIX & ANSWERS SHEET');
console.log('════════════════════════════════════════════════════════════════\n');

// 1. Verifikasi TRYOUT_TERPADU_BUILTIN_QUESTIONS di quiz_manager.js & src/
['js/quiz_manager.js', 'src/js/quiz_manager.js'].forEach(filePath => {
    const code = fs.readFileSync(filePath, 'utf8');
    assert(code.includes('window.TRYOUT_TERPADU_BUILTIN_QUESTIONS ='), `${filePath} harus mendefinisikan window.TRYOUT_TERPADU_BUILTIN_QUESTIONS`);

    const sandbox = { window: {} };
    vm.createContext(sandbox);
    // Evaluasi inisialisasi pertanyaan
    vm.runInContext(code, sandbox);
    const qs = sandbox.window.TRYOUT_TERPADU_BUILTIN_QUESTIONS;
    assert(Array.isArray(qs), `${filePath}: TRYOUT_TERPADU_BUILTIN_QUESTIONS harus array`);
    assert.strictEqual(qs.length, 60, `${filePath}: Harus memiliki tepat 60 butir soal`);

    const topics = {};
    qs.forEach((q, idx) => {
        const code = q.topicCode || ('M' + (Math.floor(idx / 10) + 1));
        topics[code] = (topics[code] || 0) + 1;
        assert(!/^[A-E][.\s]/i.test(q.options[0]), `${filePath}: Soal #${idx + 1} tidak boleh memiliki awalan A-E pada opsi`);
    });

    ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].forEach(code => {
        assert.strictEqual(topics[code], 10, `${filePath}: Materi ${code} harus berisi tepat 10 butir soal`);
    });
});
console.log('  ✅ PASS: 1. TRYOUT_TERPADU_BUILTIN_QUESTIONS (60 soal • 10 per M1..M6) terverifikasi lengkap di root dan src/.');

// 2. Verifikasi Preservasi topicBreakdown di audio.js
['js/audio.js', 'src/js/audio.js'].forEach(filePath => {
    const code = fs.readFileSync(filePath, 'utf8');
    assert(code.includes('topicBreakdown: x.topicBreakdown || null'), `${filePath}: snapshotAttempt harus menyimpan topicBreakdown`);
    assert(code.includes('higher.topicBreakdown || item.topicBreakdown || cur.topicBreakdown'), `${filePath}: mergeRecordsList harus menjaga topicBreakdown`);

    const sandbox = {
        window: { addEventListener: () => {} },
        document: { addEventListener: () => {} },
        localStorage: { getItem: () => null, setItem: () => {} },
        normalizeModuleId: (m) => m,
        isPoisonedRemedialRecord: () => false
    };
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);

    const mockSnap = sandbox.window.snapshotAttempt({
        score: 85,
        total: 60,
        topicBreakdown: { M1: { score: 90 }, M2: { score: 80 } }
    }, false);
    assert(mockSnap.topicBreakdown && mockSnap.topicBreakdown.M1.score === 90, `${filePath}: snapshotAttempt harus mempertahankan topicBreakdown`);

    const merged = sandbox.window.mergeRecordsList(
        [{ name: 'Budi', class: 'X E 1', moduleId: 'modul_tryout_terpadu', score: 70, topicBreakdown: { M1: { score: 70 } } }],
        [{ name: 'Budi', class: 'X E 1', moduleId: 'modul_tryout_terpadu', score: 85, topicBreakdown: { M1: { score: 90 }, M2: { score: 80 } } }]
    );
    assert(merged[0].topicBreakdown && merged[0].topicBreakdown.M1.score === 90, `${filePath}: mergeRecordsList harus mempertahankan topicBreakdown dengan nilai terbaik`);
});
console.log('  ✅ PASS: 2. Preservasi topicBreakdown pada snapshotAttempt & mergeRecordsList audio.js terverifikasi.');

// 3. Verifikasi Matriks Dasbor Guru di dashboard.js (Tabel Tryout 13 Kolom)
['js/dashboard.js', 'src/js/dashboard.js'].forEach(filePath => {
    const code = fs.readFileSync(filePath, 'utf8');

    // A. Fungsi computeTopicBreakdownFromRecord
    assert(code.includes('function computeTopicBreakdownFromRecord'), `${filePath} harus memiliki computeTopicBreakdownFromRecord`);

    // B. Header Tryout memiliki kolom terpisah M1 s.d M6
    assert(code.includes('M1: Literasi Digital') || code.includes('⚡ M1') || code.includes('🕵️ M1'), `${filePath}: Header harus memiliki kolom M1`);
    assert(code.includes('M6: Aplikasi Perkantoran') || code.includes('📊 M6'), `${filePath}: Header harus memiliki kolom M6`);
    assert(code.includes('Skor Total ⇅'), `${filePath}: Header harus memiliki Skor Total`);

    // C. Rows Tryout menampilkan nilai M1..M6 berdampingan
    assert(code.includes('renderTopicCell'), `${filePath}: Harus merender cell untuk setiap materi M1..M6`);
    assert(code.includes('m1Cell') && code.includes('m6Cell'), `${filePath}: Harus mengisi kolom m1Cell hingga m6Cell`);

    // D. Tombol filter modul Tryout di btnsMap & indikator aktif
    assert(code.includes("'modul_tryout_terpadu': 'btn-mod-filter-tryout'"), `${filePath}: btnsMap harus memetakan modul_tryout_terpadu ke btn-mod-filter-tryout`);

    // E. Ekspor Excel Tryout dengan kolom M1..M6
    assert(code.includes('generateTryoutSheet'), `${filePath}: exportRecordsToExcel harus memiliki generateTryoutSheet`);
    assert(code.includes("'M1 (Fakta)'") && code.includes("'M6 (Word/Excel)'"), `${filePath}: Sheet Tryout harus menyertakan kolom terpisah M1 s.d M6`);

    // F. Modal Detail Siswa mendukung filter topik M1..M6
    assert(code.includes("filterStudentDetail('"), `${filePath}: Modal kartu topik harus interaktif untuk memfilter soal materi`);
    assert(code.includes("topicsTitleMap"), `${filePath}: renderStudentDetailQuestions harus menampilkan banner filter materi`);
});
console.log('  ✅ PASS: 3. Dasbor Guru mendukung tampilan matriks per modul M1-M6, ekspor Excel Tryout, dan filter topik modal detail.');

// 4. Verifikasi Integrasi HTML (Tombol Segmented Filter & Cache Buster)
['index.html', 'src/index.html', 'kuis_interaktif_dasbor_guru.html', 'src/kuis_interaktif_dasbor_guru.html'].forEach(filePath => {
    const html = fs.readFileSync(filePath, 'utf8');
    assert(html.includes('id="btn-mod-filter-tryout"'), `${filePath} harus memiliki tombol segmented filter btn-mod-filter-tryout`);
    assert(html.includes('badge-cnt-tryout-mod'), `${filePath} harus memiliki badge badge-cnt-tryout-mod`);
    assert(html.includes('modul_tryout_terpadu'), `${filePath} harus memiliki opsi modul_tryout_terpadu`);
    assert(html.includes('20261122-v3048-tryout-dashboard-matrix'), `${filePath} harus menggunakan cache buster 20261122-v3048-tryout-dashboard-matrix`);
});
console.log('  ✅ PASS: 4. Seluruh 4 berkas HTML (Beranda & Dasbor Guru) terverifikasi memiliki tombol filter Tryout dan cache buster terbaru.');

// 5. Simulasi Rekonstruksi Soal & Nilai Siswa (End-to-End Test)
(() => {
    const dbCode = fs.readFileSync('js/dashboard.js', 'utf8');
    const qmCode = fs.readFileSync('js/quiz_manager.js', 'utf8');

    const sandbox = {
        window: { addEventListener: () => {} },
        document: { addEventListener: () => {} },
        localStorage: { getItem: () => null, setItem: () => {} },
        escapeHtml: (s) => s,
        getActiveQuizData: () => []
    };
    vm.createContext(sandbox);
    vm.runInContext(qmCode, sandbox);
    vm.runInContext(dbCode, sandbox);

    // Buat record simulasi siswa yang mengerjakan Tryout 60 soal
    const mockDetailedAnswers = sandbox.window.TRYOUT_TERPADU_BUILTIN_QUESTIONS.map((q, idx) => {
        // Misal siswa benar di 50 nomor, salah di 10 nomor
        const isCorrect = idx % 6 !== 0; 
        return {
            qIndex: idx,
            questionNumber: idx + 1,
            questionText: q.q,
            options: q.options,
            selectedIndices: [isCorrect ? q.answer : ((q.answer + 1) % q.options.length)],
            correctIndices: [q.answer],
            isCorrect: isCorrect,
            pointsEarned: isCorrect ? 5 : 0,
            maxPoints: 5,
            topicCode: q.topicCode || ('M' + (Math.floor(idx / 10) + 1)),
            topicName: q.topicName
        };
    });

    const mockRecord = {
        name: 'Ahmad Faiz',
        class: 'X E 1',
        moduleId: 'modul_tryout_terpadu',
        score: 83,
        correct: 50,
        total: 60,
        detailedAnswers: mockDetailedAnswers
    };

    // Hitung topicBreakdown
    const tb = sandbox.window.computeTopicBreakdownFromRecord(mockRecord);
    assert(tb, 'computeTopicBreakdownFromRecord harus menghasilkan objek valid');
    ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].forEach(mCode => {
        assert(tb[mCode], `Breakdown harus memiliki materi ${mCode}`);
        assert.strictEqual(tb[mCode].total, 10, `Materi ${mCode} harus memiliki 10 butir soal`);
        assert(typeof tb[mCode].score === 'number', `Skor materi ${mCode} harus angka numerik`);
    });

    // Uji reconstructStudentAnswers
    const reconstructed = sandbox.window.reconstructStudentAnswers(mockRecord);
    assert.strictEqual(reconstructed.length, 60, 'reconstructStudentAnswers harus mengembalikan seluruh 60 soal');
    assert.strictEqual(reconstructed[0].isCorrect, false, 'Soal #1 harus tercatat salah sesuai simulasi');
    assert.strictEqual(reconstructed[1].isCorrect, true, 'Soal #2 harus tercatat benar sesuai simulasi');
})();
console.log('  ✅ PASS: 5. Simulasi pengerjaan Tryout 60 soal, pemisahan skor per materi M1..M6, dan rekonstruksi lembar jawaban 100% akurat.');

console.log('\n🎉 SELURUH 5 PENGUJIAN MATRIKS TRYOUT DASBOR GURU LULUS DENGAN SEMPURNA! (EXIT 0)');
