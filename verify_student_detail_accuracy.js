const fs = require('fs');

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 VERIFYING STUDENT DETAIL EXAMINATION & REMEDIAL ATTEMPT SWITCHER');
console.log('════════════════════════════════════════════════════════════════\n');

// Mock browser DOM
global.window = global;
global.window.addEventListener = () => {};
global.window.dispatchEvent = () => {};
global.escapeHtml = s => s;
global.sfxClick = () => {};
global.filterStudentDetail = () => {};
global.DEFAULT_BUILTIN_QUESTIONS = Array.from({ length: 20 }, (_, i) => ({
    q: 'Pertanyaan Detektif Fakta #' + (i + 1),
    options: ['Opsi A', 'Opsi B', 'Opsi C', 'Opsi D', 'Opsi E'],
    answer: 0,
    explanation: 'Penjelasan #' + (i + 1)
}));
global.getActiveQuizData = () => global.DEFAULT_BUILTIN_QUESTIONS;

// Load dashboard code
const dashCode = fs.readFileSync(require('path').join(__dirname, 'js/dashboard.js'), 'utf8');

// Mock DOM elements
const elements = {};
function mockEl(id) {
    if (!elements[id]) {
        elements[id] = {
            id,
            textContent: '',
            innerHTML: '',
            style: {},
            classList: {
                _classes: new Set(),
                add(c) { this._classes.add(c); },
                remove(c) { this._classes.delete(c); },
                toggle(c, v) { if (v) this.add(c); else this.remove(c); },
                contains(c) { return this._classes.has(c); }
            },
            appendChild() {},
            setAttribute() {},
            getAttribute() { return null; }
        };
    }
    return elements[id];
}

global.document = {
    getElementById: id => mockEl(id),
    createElement: tag => ({
        style: {},
        classList: { add(){}, remove(){}, toggle(){} },
        appendChild(){},
        setAttribute(){},
        getAttribute(){ return null; },
        innerHTML: ''
    })
};

// Evaluate the functions
eval(dashCode);

// Load records
const recCode = fs.readFileSync(require('path').join(__dirname, 'js/default_records.js'), 'utf8');
const match = recCode.match(/const OFFICIAL_EXAM_RESULTS = (\[[\s\S]*?\n\]);/);
const records = eval(match[1]);

// Test cases of X E 2 remedial students
const testStudents = [
    { name: 'JENNIFER SEPTHIA PUTRI', score: 5, correct: 1, total: 20, isRemedial: true, originalScore: 0 },
    { name: 'FATHURRAHMAN ARRIZQ', score: 25, correct: 5, total: 20, isRemedial: true, originalScore: 0, wrongQuestions: [4] },
    { name: 'FABIO SHERIDAN FATHIN', score: 33, correct: 7, total: 20, isRemedial: true, originalScore: 0, wrongQuestions: [] },
    { name: 'HARLAN RADO KURNIAWAN', score: 55, correct: 11, total: 20, isRemedial: true, originalScore: 0, wrongQuestions: [3, 4, 7, 13, 16, 17] },
    { name: 'Rahmat Farel Erika', score: 55, correct: 11, total: 20, isRemedial: true, originalScore: 55, wrongQuestions: [0] },
    { name: 'Karina Ahmad', score: 71, correct: 15, total: 20, isRemedial: true, originalScore: 60, wrongQuestions: [15] },
    { name: 'Havit isra al ashari', score: 75, correct: 15, total: 20, isRemedial: true, originalScore: 60, wrongQuestions: [4, 7, 10, 13, 17] },
    { name: 'nadya fitricya', score: 70, correct: 14, total: 20, isRemedial: true, originalScore: 70, wrongQuestions: [5, 18] },
    { name: 'Fathan khalif izzadin', score: 70, correct: 14, total: 20, isRemedial: true, originalScore: 70, wrongQuestions: [3, 5, 6, 10, 12, 17] },
    { name: 'Melisa Syahruni', score: 80, correct: 18, total: 20, isRemedial: true, originalScore: 70, wrongQuestions: [0, 17] },
    { name: 'lathifah Jumanah Rezki', score: 80, correct: 17, total: 20, isRemedial: true, originalScore: 75, wrongQuestions: [6, 13, 15] },
    { name: 'NURUL NAJMI NADIRAH', score: 80, correct: 19, total: 20, isRemedial: true, originalScore: 75, wrongQuestions: [17] }
];

console.log('1. Checking reconstructStudentAnswers for Remedial and Original attempts:');
let allPassed = true;

testStudents.forEach(stu => {
    // Test Remedial Attempt
    const remAnswers = reconstructStudentAnswers(stu);
    const remCorrect = remAnswers.filter(a => a.isCorrect).length;
    const remWrong = remAnswers.filter(a => !a.isCorrect).length;

    if (remCorrect !== stu.correct || remWrong !== (stu.total - stu.correct)) {
        console.error(`❌ [REMEDIAL FAIL] ${stu.name}: got ${remCorrect} right, ${remWrong} wrong; expected ${stu.correct} right, ${stu.total - stu.correct} wrong`);
        allPassed = false;
    } else {
        console.log(`✅ [REMEDIAL PASS] ${stu.name.padEnd(25)}: ✔️ ${remCorrect} / ❌ ${remWrong} (Skor: ${stu.score})`);
    }

    // Test Original Attempt
    const origScore = stu.originalScore;
    const expectedOrigCorrect = Math.round((origScore / 100) * stu.total);
    const origStu = {
        name: stu.name,
        score: origScore,
        correct: expectedOrigCorrect,
        total: stu.total,
        isRemedial: false
    };
    const origAnswers = reconstructStudentAnswers(origStu);
    const origCorrect = origAnswers.filter(a => a.isCorrect).length;
    const origWrong = origAnswers.filter(a => !a.isCorrect).length;

    if (origCorrect !== expectedOrigCorrect || origWrong !== (stu.total - expectedOrigCorrect)) {
        console.error(`❌ [ORIGINAL FAIL] ${stu.name}: got ${origCorrect} right, ${origWrong} wrong; expected ${expectedOrigCorrect} right, ${stu.total - expectedOrigCorrect} wrong`);
        allPassed = false;
    } else {
        console.log(`   [ORIGINAL PASS] ${stu.name.padEnd(25)}: ✔️ ${origCorrect} / ❌ ${origWrong} (Nilai Awal: ${origScore})`);
    }
});

console.log('\n2. Testing openStudentDetailModal and Session Switcher for Jennifer Septhia Putri:');
const jennifer = testStudents[0];
openStudentDetailModal(jennifer);

const switcher = mockEl('sd-attempt-switcher-wrap');
const btnRem = mockEl('btn-sd-attempt-remedial');
const btnOrig = mockEl('btn-sd-attempt-original');
const subtitle = mockEl('sd-header-subtitle');
const countAll = mockEl('sd-count-all');
const countWrong = mockEl('sd-count-wrong');
const countCorrect = mockEl('sd-count-correct');

if (switcher.style.display !== 'flex') {
    console.error('❌ Switcher is not displayed!');
    allPassed = false;
} else {
    console.log('✅ Switcher wrap is visible (display: flex)');
}

console.log('   Current subtitle:', subtitle.textContent);
console.log(`   Counters: All=${countAll.textContent}, Wrong=${countWrong.textContent}, Correct=${countCorrect.textContent}`);

if (Number(countCorrect.textContent) !== 1 || Number(countWrong.textContent) !== 19) {
    console.error('❌ Counters do not match Jennifer remedial score of 5!');
    allPassed = false;
} else {
    console.log('✅ Jennifer remedial counters verified: Exactly 1 right, 19 wrong!');
}

console.log('\n3. Testing Switch to Sebelum Remedial:');
switchStudentDetailAttempt('original');
console.log('   New subtitle:', subtitle.textContent);
console.log(`   Counters: All=${countAll.textContent}, Wrong=${countWrong.textContent}, Correct=${countCorrect.textContent}`);

if (Number(countCorrect.textContent) !== 0 || Number(countWrong.textContent) !== 20) {
    console.error('❌ Counters do not match Jennifer original score of 0!');
    allPassed = false;
} else {
    console.log('✅ Jennifer original counters verified: Exactly 0 right, 20 wrong!');
}

console.log('\n4. Verifying file sync between root and src/:');
const pairs = [
    ['js/dashboard.js', 'src/js/dashboard.js'],
    ['index.html', 'src/index.html']
];

pairs.forEach(([f1, f2]) => {
    const c1 = fs.readFileSync(f1, 'utf8');
    const c2 = fs.readFileSync(f2, 'utf8');
    if (c1 === c2) {
        console.log(`✅ ${f1} <-> ${f2} are 100% synchronized.`);
    } else {
        console.error(`❌ Mismatch between ${f1} and ${f2}!`);
        allPassed = false;
    }
});

if (allPassed) {
    console.log('\n🎉 ALL EXAMINATION & REMEDIAL ACCURACY CHECKS PASSED PERFECTLY!');
} else {
    console.error('\n❌ SOME CHECKS FAILED!');
    process.exit(1);
}
