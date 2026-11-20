// 🛡️ REGRESSION: kunci jawaban per modul (id soal 1..20 sama di semua modul), alur remedial, penanda & pengiriman
const fs = require('fs'), path = require('path'), assert = require('assert');
let n = 0; const t = (name, fn) => { try { fn(); console.log('  ✅ PASS:', name); n++; } catch (e) { console.error('  ❌ FAIL:', name, '\n   ', e.message); process.exit(1); } };
const rd = f => fs.readFileSync(path.join(__dirname, f), 'utf8');
for (const base of ['js', 'src/js']) {
  const qe = rd(base + '/quiz_engine.js');
  t(`${base}: vault kunci dipisah per modul`, () => {
    assert(/function _vaultKey\(modId, key\)/.test(qe));
    assert(/function vaultAnswers\(questions, moduleId\)/.test(qe));
    assert(!/_masterBuiltinVault\.set\(`idx_\$\{idx\}`/.test(qe), 'kunci idx global tanpa modul masih ada');
  });
  t(`${base}: remedial menawarkan modal Kembali/Lanjutkan, bukan popup tercatat`, () => {
    assert(/openRemedialOffer\(name, cls/.test(qe) && /confirmRemedialStart/.test(qe));
    assert(/alreadyRemedialed/.test(qe), 'batas 1x remedial hilang');
  });
  t(`${base}: payload cloud membawa penanda remedial`, () => {
    for (const f of ['audio.js', 'firebase_sync.js', 'storage.js']) assert(/isRemedial/.test(rd(base + '/' + f)), f);
  });
  t(`${base}: rekap guru punya penanda remedial`, () => assert(/function getRemedialMeta/.test(rd(base + '/dashboard.js'))));
}
for (const h of ['index.html', 'src/index.html']) t(`${h}: modal remedial-offer ada`, () => {
  const s = rd(h); assert(/id="remedial-offer-modal"/.test(s) && /confirmRemedialStart\(\)/.test(s) && /closeRemedialOffer\(\)/.test(s));
});
console.log(`🎉 ALL ${n} TESTS PASSED`); process.exit(0);
