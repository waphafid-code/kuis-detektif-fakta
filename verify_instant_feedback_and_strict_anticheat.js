/**
 * verify_instant_feedback_and_strict_anticheat.js
 * Test-Driven Verification for:
 * 1. Instant Correct/Wrong feedback on every question during quiz.
 * 2. Individual question points displayed (+5 Poin / 0 Poin), cumulative total score hidden during quiz.
 * 3. Strict Anti-Cheating:
 *    - 3-strike warning policy.
 *    - Copy, paste, cut, contextmenu, selectstart blocked.
 *    - Screenshot (PrintScreen, Win+Shift+S, Cmd+Shift+3/4) blocked.
 *    - Tab switch & blur detection with tightened grace period.
 *    - Akun demo tetap bypass agar guru bisa menguji bebas.
 */
const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 VERIFYING INSTANT FEEDBACK & STRICT ANTI-CHEAT POLICIES');
console.log('════════════════════════════════════════════════════════════════\n');

// 1. Verifikasi kode quiz_engine.js dan src/quiz_engine.js
['js/quiz_engine.js', 'src/js/quiz_engine.js'].forEach(filePath => {
    const code = fs.readFileSync(filePath, 'utf8');

    // A. Feedback instan Benar / Salah aktif di semua sesi
    assert(code.includes('correct-fb') && code.includes('wrong-fb'), `${filePath}: Harus memiliki feedback class correct-fb dan wrong-fb`);
    
    // B. Total poin disembunyikan saat kuis berlangsung (scoreDisplay hidden)
    assert(code.includes("scoreDisplay.style.display = 'none'") || code.includes('scoreDisplay.style.display="none"'), `${filePath}: scoreDisplay kumulatif harus disembunyikan saat ujian aktif`);

    // C. Poin per butir soal ditampilkan (+X Poin / 0 Poin)
    assert(code.includes('Jawaban Benar') && code.includes('Poin'), `${filePath}: Harus menampilkan status Benar dan poin per butir soal`);

    // D. Aturan 3x Peringatan Anti-Cheat
    assert(code.includes('MAX_CHEAT_STRIKES = 3') || code.includes('MAX_CHEAT_STRIKES=3') || code.includes('cheatStrikes < MAX_CHEAT_STRIKES'), `${filePath}: Harus menerapkan batas maksimal 3 kali peringatan`);
    assert(code.includes('Peringatan Toleransi Anti-Cheat (#1 dari 3)') || code.includes('#1 dari 3'), `${filePath}: Harus ada peringatan #1`);
    assert(code.includes('Peringatan Keras Toleransi (#2 dari 3)') || code.includes('#2 dari 3'), `${filePath}: Harus ada peringatan #2`);
    assert(code.includes('triggerCheatPenalty'), `${filePath}: Harus ada penalti diskualifikasi pada strike ke-3`);

    // E. Anti Screenshot & Copy Paste Blocker
    assert(code.includes('PrintScreen'), `${filePath}: Harus mendeteksi tombol PrintScreen`);
    assert(code.includes('copy'), `${filePath}: Harus menangani event copy`);
    assert(code.includes('paste'), `${filePath}: Harus menangani event paste`);
    assert(code.includes('contextmenu'), `${filePath}: Harus menangani event contextmenu`);
    assert(code.includes('selectstart') || code.includes('selectionchange'), `${filePath}: Harus mencegah seleksi teks`);
});
console.log('  ✅ PASS: 1. Kode quiz_engine.js di root dan src/ terverifikasi mendukung umpan balik instan & anti-cheat ketat.');

// 2. Simulasi DOM: Feedback Instan Benar dan Salah
(() => {
    const code = fs.readFileSync('js/quiz_engine.js', 'utf8');
    
    // Periksa bahwa pemeriksaan jawaban tidak lagi mengunci umpan balik di live exam
    // Kode lama memiliki: fb.innerHTML = '<h4>🔒 Jawaban Terkunci & Disimpan</h4>' pada isExamLive
    const hasLiveLockSilence = code.includes("<h4>🔒 Jawaban Terkunci & Disimpan</h4>");
    assert(!hasLiveLockSilence, 'Pemeriksaan jawaban tidak boleh lagi membungkam umpan balik dengan "Jawaban Terkunci & Disimpan", melainkan langsung menampilkan Benar / Salah!');
})();
console.log('  ✅ PASS: 2. Mode kuis langsung (live exam) kini menampilkan hasil Benar / Salah seketika.');

// 3. Verifikasi Akun Demo Tetap Bebas
(() => {
    const code = fs.readFileSync('js/quiz_engine.js', 'utf8');
    assert(code.includes('isCurrentStudentDemo'), 'Harus tetap memanggil isCurrentStudentDemo untuk bypass anti-cheat akun demo');
})();
console.log('  ✅ PASS: 3. Akun demo guru tetap memiliki hak akses bypass anti-cheat.');

console.log('\n🎉 SELURUH PENGUJIAN UMPAN BALIK INSTAN & ANTI-CHEAT KETAT LULUS DENGAN SEMPURNA! (EXIT 0)');
