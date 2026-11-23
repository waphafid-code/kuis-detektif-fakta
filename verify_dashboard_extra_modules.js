const fs = require('fs');
const path = require('path');
const assert = require('assert');

const rootPath = path.join(__dirname, 'js/dashboard.js');
const srcPath = path.join(__dirname, 'src/js/dashboard.js');
const root = fs.readFileSync(rootPath, 'utf8');
const src = fs.readFileSync(srcPath, 'utf8');

assert.strictEqual(root, src, 'Root and src dashboard files must remain byte-identical');

for (const [id, label, recordKey, scoreKey] of [
    ['modul_hki_profesi_budaya', 'Panduan Generasi Digital', 'recordPanduan', 'scorePanduan'],
    ['modul_etika_privasi_keamanan', 'Privasi dan Keamanan Digital', 'recordPrivasi', 'scorePrivasi']
]) {
    assert(root.includes(`const mod${id === 'modul_hki_profesi_budaya' ? 'Panduan' : 'Privasi'}Id = '${id}'`), `${label}: module ID is registered`);
    assert(root.includes(`return mod === ${id === 'modul_hki_profesi_budaya' ? 'modPanduanId' : 'modPrivasiId'};`), `${label}: records are selected by exact module ID`);
    assert(root.includes(`${recordKey}: best${id === 'modul_hki_profesi_budaya' ? 'Panduan' : 'Privasi'}`), `${label}: original submission record is retained`);
    assert(root.includes(`${scoreKey}: best${id === 'modul_hki_profesi_budaya' ? 'Panduan' : 'Privasi'} ? best${id === 'modul_hki_profesi_budaya' ? 'Panduan' : 'Privasi'}.score : null`), `${label}: score comes directly from submitted record`);
}
assert(root.includes('⏳ BELUM MENGERJAKAN'), 'Missing submissions are explicitly labeled');
assert(root.includes('${record.score}'), 'Dashboard renders the stored score without recalculation');
assert(root.includes('📘 Panduan Generasi Digital'), 'Teacher table has Panduan Generasi Digital column');
assert(root.includes('🔐 Privasi & Keamanan'), 'Teacher table has Privasi and Security column');
assert(root.includes('colspan="${isTryoutView ? 13 : (isSingleModuleView ? 9 : 10)}"'), 'Empty-state colspan matches the expanded 10-column comparison table');

console.log('PASS: additional quiz scores, missing-work labels, exact record score, and mirrored files verified.');
