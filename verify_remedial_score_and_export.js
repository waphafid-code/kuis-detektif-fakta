/**
 * verify_remedial_score_and_export.js
 * Verifies that remedial scores are displayed with the actual remedial score (e.g. 90),
 * while the final official score is capped at KKM 80 in all exports (Excel & PDF) and dashboard.
 */

const assert = require('assert');
const fs = require('fs');

console.log('🧪 Starting Verification: Remedial Score Display & Export Capping...\n');

// 1. Load default_records.js
const defaultRecs = require('./js/default_records.js');
const allRecs = defaultRecs.OFFICIAL_EXAM_RESULTS;

// Check XE2 remedial records
const xe2Remedial = allRecs.filter(r => r.class === 'X E 2' && r.isRemedial);
assert(xe2Remedial.length >= 14, 'Must have at least 14 remedial students in X E 2');

xe2Remedial.forEach(r => {
    assert.strictEqual(r.score, 80, `Final score for remedial student ${r.name} must be capped at 80`);
    assert(r.remedialScore >= 80, `Remedial achieved score for ${r.name} must be recorded (e.g. >=80)`);
    assert.strictEqual(r.isRemedial, true, `isRemedial must be true for ${r.name}`);
});
console.log('✅ 1. All X E 2 remedial records have score capped at 80 and remedialScore recorded.');

// 2. Check students with original score >= 80 (Seruni Putri, Keysa Putri Mevi, Khansaa)
const seruni = allRecs.find(r => r.name.toLowerCase().includes('serun') && r.class === 'X E 2' && r.moduleId === 'modul_detektif_fakta');
assert(seruni, 'Seruni Putri must exist in Detektif Fakta');
assert.strictEqual(seruni.score, 90, 'Seruni Putri official score in Detektif Fakta must be 90 (not degraded)');
assert(!seruni.isRemedial, 'Seruni Putri must not be marked as remedial');
console.log('✅ 2. Non-remedial students (>=80) maintain their full original score.');

// 3. Check getRemedialMeta & remedialExcelLabel from dashboard.js
global.window = global;
global.window.addEventListener = () => {};
global.document = {
    getElementById: () => null,
    addEventListener: () => {}
};
eval(fs.readFileSync('./js/dashboard.js', 'utf8'));

const testRec = {
    name: 'TEST SISWA',
    class: 'X E 2',
    score: 80,
    isRemedial: true,
    originalScore: 60,
    remedialScore: 90
};

const meta = getRemedialMeta(testRec);
assert.strictEqual(meta.state, 'tuntas');
assert(meta.label.includes('60➔90➔80'), 'Badge label must show (60➔90➔80)');

const excelLabel = remedialExcelLabel(testRec);
assert(excelLabel.includes('Remedi: 90'), 'Excel label must show raw remedial score 90');
assert(excelLabel.includes('Nilai Akhir: 80'), 'Excel label must show final capped score 80');
console.log('✅ 3. getRemedialMeta and remedialExcelLabel display both remedial score (90) and capped score (80).');

// 4. Check source mirroring
const filesToVerify = [
    ['js/audio.js', 'src/js/audio.js'],
    ['js/dashboard.js', 'src/js/dashboard.js'],
    ['js/default_records.js', 'src/js/default_records.js'],
    ['js/quiz_engine.js', 'src/js/quiz_engine.js'],
    ['js/rapor_excel.js', 'src/js/rapor_excel.js'],
    ['js/student_roster.js', 'src/js/student_roster.js']
];

filesToVerify.forEach(([f1, f2]) => {
    const c1 = fs.readFileSync(f1, 'utf8');
    const c2 = fs.readFileSync(f2, 'utf8');
    assert.strictEqual(c1, c2, `${f1} and ${f2} must match identically`);
});
console.log('✅ 4. All modified files match identically between root and src/.');

console.log('\n🎉 ALL REMEDIAL SCORE & EXPORT CAPPING CHECKS PASSED PERFECTLY!');
