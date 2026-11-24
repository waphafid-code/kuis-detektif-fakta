/**
 * verify_student_flow_and_toast.js
 * Regresi dua masalah yang dilaporkan guru (24/11/2026):
 * 1. Tombol "Periksa Jawaban & Lanjutkan" tidak boleh macet pada soal yang sudah diperiksa
 *    (mis. waktu habis tanpa memilih): pengecekan "sudah diperiksa -> lanjut" harus SEBELUM validasi "pilih jawaban".
 * 2. Toast (#toast-msg) tidak boleh memakai latar gelap permanen; harus mengikuti variabel tema agar terbaca di tema terang.
 */
const fs = require('fs'), assert = require('assert');
for (const base of ['.', 'src']) {
    const eng = fs.readFileSync(`${base}/js/quiz_engine.js`, 'utf8');
    const fn = eng.slice(eng.indexOf('function handleSingleNextAction()'));
    const iNext = fn.indexOf('detailedAnswers[origQIdx]');
    const iValid = fn.indexOf("Pilih jawaban terlebih dahulu sebelum melanjutkan");
    assert(iNext > 0 && iValid > 0, `${base}: struktur handleSingleNextAction berubah`);
    assert(iNext < iValid, `${base}: cek "sudah diperiksa -> nextQuestion" harus sebelum validasi jawaban kosong`);

    const audio = fs.readFileSync(`${base}/js/audio.js`, 'utf8');
    assert(audio.includes('_toastTimer') && audio.includes('clearTimeout(_toastTimer)'), `${base}: showToast harus memakai satu timer`);

    for (const html of ['index.html', 'kuis_interaktif_dasbor_guru.html']) {
        const t = fs.readFileSync(`${base}/${html}`, 'utf8');
        const m = t.match(/<div id="toast-msg"[^>]*>/);
        assert(m, `${base}/${html}: #toast-msg tidak ditemukan`);
        assert(!/rgba\(\s*15\s*,\s*15\s*,\s*40/.test(m[0]), `${base}/${html}: toast tidak boleh berlatar gelap permanen`);
        assert(/background:\s*var\(--bg-card/.test(m[0]) && /color:\s*var\(--text/.test(m[0]), `${base}/${html}: toast harus memakai variabel tema`);
        assert(!/background: rgba\(15,15,40/.test(t), `${base}/${html}: tidak boleh ada latar gelap permanen 15,15,40`);
    }
}
console.log('✅ verify_student_flow_and_toast: LULUS');
