// 🛡️ Aturan nilai remedial: nilai akhir = tertinggi antara sebelum & sesudah remedial; bila remedial lulus (>= KKM 80) dipatok tepat 80.
const fs = require('fs'), vm = require('vm'), assert = require('assert');
for (const base of ['js', 'src/js']) {
  const sb = { console: { log() {}, warn() {}, error() {}, info() {} }, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, document: { getElementById: () => null, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] }, navigator: {}, setTimeout, setInterval: () => 0, clearInterval() {}, addEventListener() {} };
  sb.window = sb; sb.self = sb; const ctx = vm.createContext(sb);
  for (const f of ['default_records.js', 'storage.js', 'audio.js']) { try { new vm.Script(fs.readFileSync(`${base}/${f}`, 'utf8'), { filename: f }).runInContext(ctx, { timeout: 3000 }); } catch (e) { if (e instanceof SyntaxError) throw e; } }
  const merge = ctx.mergeRecordsList; assert.strictEqual(typeof merge, 'function', base + ': mergeRecordsList tidak ada');
  const b = { name: 'UJI SISWA', class: 'X E 9', moduleId: 'modul_detektif_fakta', date: '22/11/2026' };
  const R = (score, orig, rem) => ({ ...b, score, isRemedial: true, originalScore: orig, remedialScore: rem });
  const cases = [
    [[{ ...b, score: 60 }, R(95, 60, 95)], 80], [[{ ...b, score: 60 }, R(40, 60, 40)], 60], [[{ ...b, score: 60 }, R(70, 60, 70)], 70],
    [[{ ...b, score: 60 }, R(80, 60, 80)], 80], [[R(95, 60, 95), { ...b, score: 60 }], 80], [[{ ...b, score: 60 }, { ...b, score: 95, isRemedial: true }], 80], [[{ ...b, score: 85 }], 85]
  ];
  cases.forEach(([l, exp], i) => assert.strictEqual(merge(l.slice(0, 1), l.slice(1))[0].score, exp, `${base} kasus ${i + 1}`));
  console.log(`  ✅ PASS: ${base}: aturan nilai tertinggi & patok 80 (${cases.length} kasus)`);
}
process.exit(0);
