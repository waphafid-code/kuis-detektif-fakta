// ============================================================
// 🧪 VERIFIKASI FITUR ALUR SATU TOMBOL & AUTO-SALAH KETIKA TIDAK MEMILIH
// ============================================================
const fs = require('fs');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 VERIFYING SINGLE-BUTTON QUIZ FLOW & UNANSWERED AUTO-FAIL');
console.log('════════════════════════════════════════════════════════════════');

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
const rootHtml = fs.readFileSync('index.html', 'utf8');
const srcHtml = fs.readFileSync('src/index.html', 'utf8');

test('1. Root & src/js/quiz_engine.js 100% identik', () => {
    assert.strictEqual(rootEngine, srcEngine, 'js/quiz_engine.js dan src/js/quiz_engine.js harus identik');
});

test('2. Root & src/index.html 100% identik', () => {
    assert.strictEqual(rootHtml, srcHtml, 'index.html dan src/index.html harus identik');
});

test('3. index.html: btn-check disembunyikan & btn-next memanggil handleSingleNextAction()', () => {
    assert(rootHtml.includes('id="btn-check" style="display:none;"'), 'btn-check harus disembunyikan via style display:none');
    assert(rootHtml.includes('id="btn-next" onclick="handleSingleNextAction()"'), 'btn-next harus memanggil handleSingleNextAction()');
    assert(rootHtml.includes('Lanjut Soal Berikutnya ➔'), 'btn-next default text harus Lanjut Soal Berikutnya ➔');
});

test('4. quiz_engine.js: handleSingleNextAction terdefinisi dan terekspor ke window', () => {
    assert(rootEngine.includes('function handleSingleNextAction()'), 'Fungsi handleSingleNextAction harus ada');
    assert(rootEngine.includes('window.handleSingleNextAction = handleSingleNextAction;'), 'handleSingleNextAction harus diekspor ke window');
});

test('5. quiz_engine.js: loadQuestion hanya menampilkan tombol lanjut soal', () => {
    assert(rootEngine.includes("checkBtn.style.display = 'none';"), 'loadQuestion harus menyembunyikan checkBtn');
    assert(rootEngine.includes("nextBtn.style.display = 'inline-flex';"), 'loadQuestion harus menampilkan nextBtn');
    assert(rootEngine.includes("nextBtn.innerHTML = isFinalQ ? '🏁 Selesai & Kirim Jawaban ➔' : 'Lanjut Soal Berikutnya ➔';"), 'loadQuestion harus mengatur teks tombol tunggal');
});

test('6. quiz_engine.js: checkAnswer tidak memblokir siswa saat tidak memilih jawaban (MCQ/TF/Matrix/Checkbox)', () => {
    assert(!rootEngine.includes("if (selectedShuffleIdxs.length === 0 && !isAutoTimeout) {\n                sfxWrong();\n                showToast('Silakan pilih jawaban"), 'Blokir toast pada pilihan ganda harus ditiadakan');
    assert(!rootEngine.includes("if (!allChosen && !isAutoTimeout) {\n                sfxWrong();\n                showToast('Harap tentukan [Benar]"), 'Blokir toast pada matriks harus ditiadakan');
    assert(rootEngine.includes('Dilewati / Belum Memilih (0 Poin)'), 'Jawaban kosong harus langsung disalahkan dengan 0 poin');
    assert(rootEngine.includes('(Dilewati — Tidak Memilih Jawaban)'), 'Detailed answers harus mencatat status dilewati');
});

test('7. quiz_engine.js: nextQuestion memiliki guard jika jawaban belum terkunci', () => {
    assert(rootEngine.includes('if (quizData && quizData[origQIdx] && !detailedAnswers[origQIdx])') && rootEngine.includes('checkAnswer(false);'), 'nextQuestion harus otomatis mengunci & menilai jika belum dievaluasi');
});

console.log('════════════════════════════════════════════════════════════════');
console.log(`🎉 ALL ${passed}/7 TESTS PASSED SUCCESSFULLY!`);
console.log('════════════════════════════════════════════════════════════════');
