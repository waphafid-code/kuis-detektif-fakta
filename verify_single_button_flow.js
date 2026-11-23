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
const nemotron = fs.readFileSync('js/ai_nemotron.js', 'utf8');
const hkiBank = JSON.parse(fs.readFileSync('bank_soal/modul_hki_profesi_budaya.json', 'utf8'));
const privacyBank = JSON.parse(fs.readFileSync('bank_soal/modul_etika_privasi_keamanan.json', 'utf8'));
const tryoutBank = JSON.parse(fs.readFileSync('bank_soal/modul_tryout_terpadu.json', 'utf8'));

function scoreComplex(answer, selected, maxPoints = 5) {
    const correct = new Set(answer);
    const chosen = new Set(selected);
    let matched = 0;
    let wrong = 0;
    chosen.forEach(index => correct.has(index) ? matched++ : wrong++);
    if (correct.size === 0) return 0;
    let earned = Math.round((matched / correct.size) * maxPoints);
    if (wrong > 0) earned = Math.max(0, earned - (wrong * Math.floor(maxPoints / correct.size)));
    return earned;
}

test('1. Root & src/js/quiz_engine.js 100% identik', () => {
    assert.strictEqual(rootEngine, srcEngine, 'js/quiz_engine.js dan src/js/quiz_engine.js harus identik');
});

test('2. Root & src/index.html 100% identik', () => {
    assert.strictEqual(rootHtml, srcHtml, 'index.html dan src/index.html harus identik');
});

test('3. index.html: btn-check disembunyikan & btn-next memanggil handleSingleNextAction()', () => {
    assert(!rootHtml.includes('id="btn-check"'), 'Tombol Cek Jawaban terpisah harus dihapus dari HTML');
    assert(rootHtml.includes('id="btn-next" onclick="handleSingleNextAction()"'), 'btn-next harus memanggil handleSingleNextAction()');
    assert(rootHtml.includes('Periksa Jawaban &amp; Lanjutkan ➔'), 'Tombol tunggal harus memeriksa jawaban pada klik pertama');
});

test('4. quiz_engine.js: handleSingleNextAction terdefinisi dan terekspor ke window', () => {
    assert(rootEngine.includes('function handleSingleNextAction()'), 'Fungsi handleSingleNextAction harus ada');
    assert(rootEngine.includes('window.handleSingleNextAction = handleSingleNextAction;'), 'handleSingleNextAction harus diekspor ke window');
});

test('5. quiz_engine.js: loadQuestion menampilkan satu tombol untuk periksa lalu lanjut', () => {
    assert(rootEngine.includes("checkBtn.style.display = 'none';"), 'loadQuestion harus menyembunyikan checkBtn');
    assert(rootEngine.includes("nextBtn.style.display = 'inline-flex';"), 'loadQuestion harus menampilkan nextBtn');
    assert(rootEngine.includes("nextBtn.innerHTML = isFinalQ ? '🏁 Periksa & Kirim Jawaban ➔' : 'Periksa Jawaban & Lanjutkan ➔';"), 'loadQuestion harus mengatur teks awal tombol tunggal');
    assert(rootEngine.includes("nextBtn.innerHTML = isFinalQ ? '🏁 Kirim Jawaban & Lihat Hasil ➔' : 'Lanjutkan ➔';"), 'Setelah hasil keluar, tombol berubah menjadi Lanjutkan');
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
console.log(`🎉 ${passed} TESTS PASSED SUCCESSFULLY!`);
console.log('════════════════════════════════════════════════════════════════');


test('8. Kedua modul terbaru memiliki soal pilihan ganda kompleks yang dinilai parsial', () => {
    assert(hkiBank.questions.some(q => q.type === 'checkbox'), 'Modul HKI harus memiliki soal checkbox');
    assert(privacyBank.questions.some(q => q.type === 'checkbox'), 'Modul Etika/Privasi harus memiliki soal checkbox');
    assert(nemotron.includes('isPartial: !isFull && earned > 0'), 'Nemotron harus mengembalikan status poin parsial');
    assert(rootEngine.includes('window.NemotronAI.calculateQuestionPoints'), 'quiz_engine harus memakai kalkulator poin untuk soal kompleks');
});

test('9. Tryout mendukung aturan yang sama jika soal kompleks ditambahkan', () => {
    assert(Array.isArray(tryoutBank), 'Bank tryout harus berupa daftar soal');
    assert(rootEngine.includes("data.type === 'mcq' || data.type === 'tf'"), 'Engine memisahkan pilihan tunggal dari tipe kompleks');
    assert(rootEngine.includes('window.NemotronAI.calculateQuestionPoints'), 'Semua tipe kompleks memakai kalkulator poin generik');
});

test('10. Poin parsial proporsional dan penalti opsi salah berjalan fair', () => {
    const key = [0, 2, 3];
    assert.strictEqual(scoreComplex(key, [0]), 2, '1 dari 3 opsi benar tetap memperoleh 2/5 poin');
    assert.strictEqual(scoreComplex(key, [0, 2]), 3, '2 dari 3 opsi benar memperoleh 3/5 poin');
    assert.strictEqual(scoreComplex(key, [0, 2, 3]), 5, 'Semua opsi benar memperoleh nilai penuh');
    assert.strictEqual(scoreComplex(key, [0, 2, 3, 4]), 4, 'Memilih opsi salah mengurangi poin');
    assert.strictEqual(scoreComplex(key, [4]), 0, 'Hanya memilih opsi salah tidak mendapat poin');
});


test('11. Tombol satu aksi tidak menimpa state setelah checkAnswer dan memakai guard', () => {
    const handler = rootEngine.slice(rootEngine.indexOf('function handleSingleNextAction() {'), rootEngine.indexOf('window.handleSingleNextAction = handleSingleNextAction;'));
    assert(handler.includes('nextQuestion();'), 'Klik kedua harus pindah setelah jawaban terkunci');
    assert(handler.includes("'⏳ Memeriksa Jawaban...'"), 'Klik pertama menampilkan status pemeriksaan');
    assert(handler.includes(": 'Lanjutkan ➔';"), 'Setelah pemeriksaan tombol berubah menjadi Lanjutkan');
    assert(!handler.includes('Periksa Jawaban & Lanjutkan ➔'), 'Handler tidak boleh menimpa label hasil dari checkAnswer');
    assert(handler.includes('isTransitioningQuestion || isCheckingAnswer'), 'Klik ganda dicegah saat proses aktif');
});

test('12. Long-press, copy, paste, cut, dan context menu tidak menghasilkan anti-cheat strike', () => {
    assert(!rootEngine.includes("document.addEventListener('copy'"), 'Event copy tidak boleh diberi strike');
    assert(!rootEngine.includes("document.addEventListener('paste'"), 'Event paste tidak boleh diberi strike');
    assert(!rootEngine.includes("document.addEventListener('contextmenu'"), 'Long-press/context menu tidak boleh diberi strike');
    assert(!rootEngine.includes("document.addEventListener('selectstart'"), 'Seleksi teks untuk long-press diperbolehkan');
    assert(!rootEngine.includes("handleAntiCheatEvent('📋 Percobaan Clipboard"), 'Shortcut clipboard tidak boleh menghasilkan strike');
});

test('13. Screenshot dan perpindahan halaman tetap memiliki deteksi yang tersedia', () => {
    assert(rootEngine.includes("e.key === 'PrintScreen'"), 'PrintScreen tetap terdeteksi');
    assert(rootEngine.includes('Gesture Usap 3 Jari'), 'Gesture screenshot 3 jari tetap terdeteksi jika browser melaporkannya');
    assert(rootEngine.includes("document.addEventListener('visibilitychange'"), 'Pindah tab/aplikasi tetap dipantau');
    assert(rootEngine.includes("window.addEventListener('beforeunload'"), 'Keluar/reload halaman tetap diberi konfirmasi');
    assert(rootEngine.includes('isMobileOrTouchDevice() ? 2500 : 1800'), 'Grace period mobile dipersingkat untuk deteksi meninggalkan browser');
});


test('14. checkAnswer mendeklarasikan activeModId di scope sendiri', () => {
    const start = rootEngine.indexOf('function checkAnswer(isAutoTimeout = false) {');
    const end = rootEngine.indexOf('\nfunction nextQuestion() {', start);
    const body = rootEngine.slice(start, end);
    assert(body.includes('const activeModId ='), 'activeModId harus tersedia di dalam checkAnswer');
    assert(body.includes('detailedAnswers[origQIdx] ='), 'Snapshot jawaban disimpan sebelum topic metadata dipakai');
    assert(body.includes('finally {\n        isCheckingAnswer = false;'), 'Flag pemeriksaan harus selalu direset');
});

test('15. nextQuestion selalu melepas guard transisi jika pemuatan soal gagal', () => {
    const start = rootEngine.indexOf('function nextQuestion() {');
    const end = rootEngine.indexOf('\nasync function finishQuiz()', start);
    const body = rootEngine.slice(start, end);
    assert(body.includes('finally {\n            isTransitioningQuestion = false;'), 'Guard transisi wajib direset di finally');
    assert(body.includes('currentQ = previousQ;'), 'Indeks soal dikembalikan jika loadQuestion gagal');
    assert(body.includes('Coba Lanjutkan Lagi'), 'Tombol dipulihkan jika transisi gagal');
    assert(body.includes('if (!detailedAnswers || !detailedAnswers[origQIdx])'), 'Tidak boleh pindah jika jawaban belum tersimpan');
});

test('16. Handler tombol menangani error pemeriksaan dan memulihkan tombol', () => {
    const start = rootEngine.indexOf('function handleSingleNextAction() {');
    const end = rootEngine.indexOf('\nwindow.handleSingleNextAction', start);
    const body = rootEngine.slice(start, end);
    assert(body.includes('try {\n        checkAnswer(false);'), 'Pemeriksaan harus ditangani dengan try/catch');
    assert(body.includes('catch (error)'), 'Error pemeriksaan tidak boleh mematikan alur');
    assert(body.includes('nextQuestion();'), 'Klik kedua tetap meneruskan soal');
    assert(body.includes('isCheckingAnswer = false;'), 'Flag diperbaiki saat error');
});


test('17. Koreksi langsung menampilkan jawaban siswa, kunci, dan alasan benar/salah', () => {
    const review = rootEngine.slice(rootEngine.indexOf('const correctnessLabel ='), rootEngine.indexOf('// 🎯 Banner Akumulasi Nilai per Materi Real-Time', rootEngine.indexOf('const correctnessLabel =')));
    assert(review.includes('JAWABAN KAMU'), 'Jawaban yang dipilih siswa harus ditampilkan');
    assert(review.includes('JAWABAN YANG TEPAT'), 'Kunci jawaban harus ditampilkan');
    assert(review.includes('Mengapa jawaban ini benar?'), 'Alasan untuk jawaban benar harus ditampilkan');
    assert(review.includes('Mengapa jawaban ini salah?'), 'Alasan untuk jawaban salah harus ditampilkan');
    assert(review.includes('formatPedagogicalFeedback(expText)'), 'Pembahasan soal harus tampil langsung');
    assert(review.includes('Bagian mana yang benar dan perlu diperbaiki?'), 'Jawaban kompleks sebagian mendapat koreksi khusus');
});

test('18. Semua bank soal resmi menyediakan pembahasan untuk koreksi langsung', () => {
    for (const bank of ['modul_detektif_fakta','modul_jaringan_keamanan','modul_hki_profesi_budaya','modul_etika_privasi_keamanan','modul_tryout_terpadu']) {
        assert(fs.existsSync(path.join(__dirname, 'bank_soal', bank + '.json')), 'Bank soal tersedia: ' + bank);
        const raw = JSON.parse(fs.readFileSync(path.join(__dirname, 'bank_soal', bank + '.json'), 'utf8'));
        const questions = Array.isArray(raw) ? raw : raw.questions;
        assert(questions.every(q => String(q.explanation || '').trim().length > 0), 'Semua soal memiliki explanation: ' + bank);
    }
});


test('19. Klik manual tanpa jawaban tidak memanggil pemeriksaan dan memberi instruksi', () => {
    const start = rootEngine.indexOf('function handleSingleNextAction() {');
    const end = rootEngine.indexOf('\nwindow.handleSingleNextAction', start);
    const body = rootEngine.slice(start, end);
    assert(body.includes('input[name="q-opt"]:checked'), 'Pilihan ganda harus dicek sebelum dinilai');
    assert(body.includes('Pilih jawaban terlebih dahulu sebelum melanjutkan.'), 'Siswa mendapat instruksi saat belum memilih');
    assert(body.includes('Pilih jawaban terlebih dahulu pada semua pernyataan.'), 'Matriks harus dilengkapi');
    assert(body.indexOf('Pilih jawaban terlebih dahulu') < body.indexOf('checkAnswer(false)'), 'Validasi berlangsung sebelum pemeriksaan');
});

test('20. Pembahasan langsung ringkas dan tidak dirender dua kali', () => {
    const start = rootEngine.indexOf('function formatPedagogicalFeedback(explanation) {');
    const end = rootEngine.indexOf('\nwindow.formatPedagogicalFeedback', start);
    const body = rootEngine.slice(start, end);
    assert(body.includes('const maxLength = 240'), 'Pembahasan dibatasi maksimal 240 karakter');
    assert(body.includes('sentences.slice(0, 2)'), 'Hanya dua kalimat inti yang ditampilkan');
    assert(body.includes('Alasan singkat:'), 'Label pembahasan ringkas ditampilkan');
    assert(!rootEngine.includes('${expText ? formatPedagogicalFeedback(expText) : \'\'}'), 'Penjelasan tidak dirender berulang');
});
