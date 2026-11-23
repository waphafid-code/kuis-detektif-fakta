// ============================================================
// 🧪 VERIFIKASI REAL-TIME TOPIC TRACKING, PENJELASAN SOAL,
// TABEL MATERI ANDROID, DAN PROTEKSI ANTI-BOCOR KUNCI JAWABAN
// ============================================================
const fs = require('fs');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 VERIFYING REAL-TIME TOPIC TRACKING & ANTI-LEAK PROTECTION');
console.log('════════════════════════════════════════════════════════════════\n');

let passed = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        passed++;
    } catch (e) {
        console.error(`  ❌ FAIL: ${name}\n    ${e.message}`);
        process.exit(1);
    }
}

const rootEngine = fs.readFileSync('js/quiz_engine.js', 'utf8');
const srcEngine = fs.readFileSync('src/js/quiz_engine.js', 'utf8');
const rootDash = fs.readFileSync('js/dashboard.js', 'utf8');
const srcDash = fs.readFileSync('src/js/dashboard.js', 'utf8');
const rootHtml = fs.readFileSync('index.html', 'utf8');
const srcHtml = fs.readFileSync('src/index.html', 'utf8');
const rootFb = fs.readFileSync('js/firebase_sync.js', 'utf8');
const srcFb = fs.readFileSync('src/js/firebase_sync.js', 'utf8');
const rootAudio = fs.readFileSync('js/audio.js', 'utf8');
const srcAudio = fs.readFileSync('src/js/audio.js', 'utf8');
const rootRapor = fs.readFileSync('js/rapor_excel.js', 'utf8');
const srcRapor = fs.readFileSync('src/js/rapor_excel.js', 'utf8');

// 1. Root & src Parity Check (100% Identical)
test('1. Paritas 100% antara Root dan src/ untuk seluruh 6 file inti', () => {
    assert.strictEqual(rootEngine, srcEngine, 'quiz_engine.js harus identik');
    assert.strictEqual(rootDash, srcDash, 'dashboard.js harus identik');
    assert.strictEqual(rootHtml, srcHtml, 'index.html harus identik');
    assert.strictEqual(rootFb, srcFb, 'firebase_sync.js harus identik');
    assert.strictEqual(rootAudio, srcAudio, 'audio.js harus identik');
    assert.strictEqual(rootRapor, srcRapor, 'rapor_excel.js harus identik');
});

// 2. Real-time Topic Tracking in quiz_engine.js
test('2. Real-time Topic Tracking & Badge Materi pada setiap butir soal', () => {
    assert(rootEngine.includes('TRYOUT_TOPICS_META'), 'TRYOUT_TOPICS_META harus terdefinisi');
    assert(rootEngine.includes('window.liveTopicProgress = {};'), 'liveTopicProgress harus diinisialisasi saat mulai kuis');
    assert(rootEngine.includes("tCode = data.topicCode || (activeModId === 'modul_tryout_terpadu'"), 'Harus mendeteksi topicCode per soal');
    assert(rootEngine.includes("topicBadge = document.getElementById('q-topic-badge')"), 'Harus menampilkan badge materi q-topic-badge di card soal');
    assert(rootEngine.includes('live-topic-feedback-toast'), 'Harus menyertakan banner kenaikan nilai materi spesifik pada feedback');
    assert(rootEngine.includes('prog.score = prog.maxPoints > 0 ? Math.round((prog.earnedPoints / prog.maxPoints) * 100) : 0;'), 'Harus mengakumulasi nilai materi real-time saat jawaban dievaluasi');
});

// 3. Explanation Visibility & No Auto-Jump Timer
test('3. Pembahasan tampil dengan tenang tanpa auto-skip 650ms', () => {
    assert(rootEngine.includes('handleSingleNextAction'), 'handleSingleNextAction harus ada');
    assert(rootEngine.replace(/\r\n/g, '\n').includes('if (detailedAnswers && detailedAnswers[origQIdx]) {\n        nextQuestion();\n        return;\n    }'), 'Klik pertama mengunci & menampilkan pembahasan, klik kedua baru lanjut');
    // Pastikan tidak ada auto-jump timer 650ms pada handleSingleNextAction
    const handleNextFn = rootEngine.slice(rootEngine.indexOf('function handleSingleNextAction'), rootEngine.indexOf('window.handleSingleNextAction'));
    assert(!handleNextFn.includes('setTimeout'), 'handleSingleNextAction tidak boleh otomatis melompat via setTimeout');
});

// 4. Android-friendly Topic Summary Table on Result Screen
test('4. Tabel rekapitulasi 6 materi responsif Android pada layar hasil', () => {
    assert(rootHtml.includes('id="tryout-topic-summary-card"'), 'index.html harus memiliki wadah #tryout-topic-summary-card');
    assert(rootEngine.includes('Rekapitulasi Penguasaan per Materi (Tryout 60 Soal)'), 'finishQuiz harus merender kartu rekapitulasi materi');
    assert(rootEngine.includes('Rata-rata 6 Materi:'), 'finishQuiz harus menampilkan rata-rata 6 materi');
    assert(rootEngine.includes('Jumlah Benar:'), 'finishQuiz harus menampilkan jumlah benar per materi');
});

// 5. Anti-Cheat & Answer Leak Protection for Daily Quizzes vs Tryout
test('5. Proteksi anti-bocor: kuis harian dilindungi, khusus Tryout bisa unduh & review', () => {
    assert(rootEngine.includes("const isTryoutSession = (activeModId === 'modul_tryout_terpadu');"), 'Harus mendeteksi apakah sesi aktif adalah Tryout');
    assert(rootEngine.includes('isPostponed = !isTryoutSession &&'), 'Review tidak boleh ditunda jika sesi adalah Tryout');
    assert(rootDash.includes('isTryoutMod = (snap.moduleId === \'modul_tryout_terpadu\')'), 'PDF export harus mengizinkan pembacaan jika Tryout');
    assert(rootRapor.includes('isTryoutMod = (modId === \'modul_tryout_terpadu\')'), 'Excel export harus mengizinkan rincian jika Tryout');
});

// 6. Firebase RTDB & Dashboard Integration
test('6. Integrasi Firebase RTDB dan Dasbor Guru (Semua Modul & Tryout)', () => {
    assert(rootFb.includes('topic_breakdown: record.topicBreakdown || null'), 'saveRecordToFirebase harus menyimpan topic_breakdown');
    assert(rootFb.includes('topicBreakdown: extractedTopicBreakdown'), 'fetchFirebaseRecords harus mengekstrak topicBreakdown');
    assert(rootDash.includes("'modul_tryout_terpadu': 'btn-mod-filter-tryout'"), 'btnsMap selectModuleSegment harus menyertakan tryout');
    assert(rootDash.includes('🎯 Tryout (6 Materi)'), 'Tabel mode Semua Modul harus menampilkan kolom Tryout');
    assert(rootDash.includes('hasSubmitted = hasFakta || hasJaringan || hasTryout'), 'Siswa yang sudah Tryout harus terhitung sudah mengumpulkan di mode Semua Modul');
});

console.log('════════════════════════════════════════════════════════════════');
console.log(`🎉 ALL ${passed}/6 REAL-TIME TRYOUT & ANTI-LEAK TESTS PASSED! (EXIT 0)`);
console.log('════════════════════════════════════════════════════════════════\n');
