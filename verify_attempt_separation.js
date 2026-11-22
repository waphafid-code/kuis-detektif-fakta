// Memastikan jawaban pengerjaan pertama dan remedial tersimpan & ditampilkan terpisah (tidak tercampur / tidak dikarang)
const fs = require('fs'); let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.error('GAGAL:', m); } };
for (const pre of ['', 'src/']) {
  const r = f => fs.readFileSync(pre + f, 'utf8');
  const qe = r('js/quiz_engine.js'), fb = r('js/firebase_sync.js'), au = r('js/audio.js'), db = r('js/dashboard.js'), html = r('index.html');
  ok(/studentAnswers: detailedAnswers\.map/.test(qe), pre + 'quiz_engine: hasil kuis harus membawa studentAnswers');
  ok((fb.match(/ans: Array\.isArray\((record|r)\.studentAnswers\)/g) || []).length >= 2, pre + 'firebase_sync: payload harus membawa ans');
  ok(/studentAnswers: extractedAns/.test(fb) && /r\.wrong_questions\?\.ans/.test(fb), pre + 'firebase_sync: pembacaan harus memulihkan ans');
  ok((fb.match(/_rem' : ''/g) || []).length === 2, pre + 'firebase_sync: kunci entri remedial harus berbeda dari pengerjaan pertama');
  ok(/ans: Array\.isArray\(record\.studentAnswers\)/.test(au) && /studentAnswers: r\.wrong_questions\.ans/.test(au) || /studentAnswers: r\.wrong_questions\.ans/.test(au), pre + 'audio: Supabase harus membawa ans');
  ok(/function pickAttempts/.test(au) && /\.\.\.pickAttempts\(cur, item\)/.test(au), pre + 'audio: merge harus menyimpan firstAttempt & remedialAttempt');
  ok(/record\.firstAttempt/.test(db) && /record\.remedialAttempt/.test(db), pre + 'dashboard: tampilan memakai snapshot sesi asli');
  ok(!/31\/8\/2026/.test(db) && !/6m 20s/.test(db), pre + 'dashboard: tidak boleh ada tanggal/durasi karangan untuk sesi pertama');
  ok(/renderAttemptComparison/.test(db) && /btn-sd-attempt-compare/.test(html), pre + 'tombol dan tampilan Bandingkan harus ada');
  ok(/recordHasRealAnswers/.test(db) && /PERKIRAAN/.test(db), pre + 'dashboard: peringatan bila jawaban asli tidak tersimpan');
}
if (fail) process.exit(1); console.log('OK: pemisahan jawaban pertama vs remedial terverifikasi');
