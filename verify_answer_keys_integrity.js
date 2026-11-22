// Tes integritas kunci jawaban semua bank soal bawaan (pengerjaan pertama & remedial memakai soal yang sama).
const fs = require('fs'), path = require('path'), vm = require('vm');
let fail = 0; const bad = m => { fail++; console.error('GAGAL:', m); };
const dirs = ['bank_soal', 'src/bank_soal'];
const banks = {};
for (const d of dirs) for (const f of fs.readdirSync(path.join(__dirname, d)).filter(f => f.endsWith('.json') && f !== 'modules.json')) {
  const raw = fs.readFileSync(path.join(__dirname, d, f), 'utf8');
  let j; try { j = JSON.parse(raw); } catch (e) { bad(`${d}/${f} bukan JSON valid`); continue; }
  banks[`${d}/${f}`] = Array.isArray(j) ? j : (j.questions || []);
}
// default_questions.js (modul bawaan Detektif Fakta)
for (const f of ['js/default_questions.js', 'src/js/default_questions.js']) {
  const ctx = { window: {} }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, f), 'utf8'), ctx);
  banks[f] = ctx.window.DEFAULT_BUILTIN_QUESTIONS || [];
}
for (const [name, qs] of Object.entries(banks)) {
  if (!qs.length) { bad(`${name}: kosong`); continue; }
  const ids = new Set(); let pts = 0;
  for (const q of qs) {
    const tag = `${name} Q${q.id}`;
    if (ids.has(q.id)) bad(`${tag}: id ganda`); ids.add(q.id);
    pts += Number(q.points) || 0;
    const n = (q.options || []).length;
    if (new Set(q.options).size !== n) bad(`${tag}: opsi duplikat`);
    const ans = Array.isArray(q.answer) ? q.answer : [q.answer];
    if (!ans.length || ans.some(a => !Number.isInteger(a) || a < 0 || a >= n)) bad(`${tag}: kunci di luar rentang`);
    if (new Set(ans).size !== ans.length) bad(`${tag}: kunci ganda`);
    if (q.type === 'mcq' && ans.length !== 1) bad(`${tag}: mcq harus 1 kunci`);
    if (q.type === 'tf' && (n !== 2 || ans.length !== 1)) bad(`${tag}: tf harus 2 opsi & 1 kunci`);
    if (q.type === 'checkbox' && ans.length < 2) bad(`${tag}: checkbox minimal 2 kunci`);
    if (q.scoringRule && q.scoringRule.type === 'tiered') {
      const top = Math.max(...q.scoringRule.tiers.map(t => t.minCorrect));
      if (ans.length < top) bad(`${tag}: kunci kurang dari syarat tier tertinggi`);
      if (Math.max(...q.scoringRule.tiers.map(t => t.points)) !== q.points) bad(`${tag}: poin tier tertinggi != poin soal`);
    }
    if (!q.explanation) bad(`${tag}: tanpa pembahasan`);
  }
  if (pts !== 100) bad(`${name}: total poin ${pts} != 100`);
}
// Regresi: Q18 Detektif Fakta - "Mengenali tanda-tanda informasi palsu" adalah jawaban benar
for (const [name, qs] of Object.entries(banks)) {
  const q = qs.find(x => x.q && x.q.startsWith('Pilih tiga kegiatan yang menunjukkan literasi media'));
  if (q) { const i = q.options.indexOf('Mengenali tanda-tanda informasi palsu'); if (!q.answer.includes(i)) bad(`${name}: Q18 harus menganggap "Mengenali tanda-tanda informasi palsu" benar`); }
}
// main dan src identik
for (const [name, qs] of Object.entries(banks)) if (name.startsWith('src/')) {
  const m = name.slice(4); if (banks[m] && JSON.stringify(banks[m]) !== JSON.stringify(qs)) bad(`${name} tidak identik dengan ${m}`);
}
if (fail) { console.error(`${fail} masalah`); process.exit(1); }
console.log('OK: kunci jawaban semua bank soal konsisten (' + Object.keys(banks).length + ' sumber)');
