const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('================================================================');
console.log('🔒 RUNNING NEW MODULE (ETIKA, PRIVASI & KEAMANAN) VERIFICATION');
console.log('   (Matt Pocock Quality & Compliance Verification)');
console.log('================================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ [PASS] ${message}`);
        passed++;
    } else {
        console.error(`  ✗ [FAIL] ${message}`);
        failed++;
    }
}

// 1. Load module JSON
const modulePath = path.join(__dirname, 'bank_soal/modul_etika_privasi_keamanan.json');
assert(fs.existsSync(modulePath), 'File bank_soal/modul_etika_privasi_keamanan.json exists');

const srcModulePath = path.join(__dirname, 'src/bank_soal/modul_etika_privasi_keamanan.json');
assert(fs.existsSync(srcModulePath), 'File src/bank_soal/modul_etika_privasi_keamanan.json exists (mirrored)');

const moduleData = JSON.parse(fs.readFileSync(modulePath, 'utf8'));
assert(moduleData.id === 'modul_etika_privasi_keamanan', 'Module ID is "modul_etika_privasi_keamanan"');
assert(moduleData.kkm === 80, 'Module KKM is 80');
assert(Array.isArray(moduleData.questions) && moduleData.questions.length === 20, 'Module contains exactly 20 questions');

// 2. Validate Question Structure, Clean Stems & Clean Options
let totalPoints = 0;
let hasStemNumberPrefix = false;
let hasOptionPrefix = false;

moduleData.questions.forEach((q, idx) => {
    totalPoints += (q.points || 0);
    assert(q.id && q.q && Array.isArray(q.options) && q.options.length >= 2, `Question #${idx + 1} has valid stem and options`);
    assert(q.answer !== undefined && q.answer !== null, `Question #${idx + 1} has valid answer key`);

    if (/^\d+[\.\)]\s*/.test(q.q)) {
        hasStemNumberPrefix = true;
        console.error(`Question #${idx + 1} stem still has number prefix: "${q.q}"`);
    }

    q.options.forEach(opt => {
        if (/^[A-E]\.\s+/i.test(opt)) {
            hasOptionPrefix = true;
            console.error(`Question #${idx + 1} option still has letter prefix: "${opt}"`);
        }
    });
});

assert(totalPoints === 100, `Total points across 20 questions is exactly 100 (Actual: ${totalPoints})`);
assert(!hasStemNumberPrefix, 'All question stems are strictly clean of number prefixes ("1.", "2.", etc.)');
assert(!hasOptionPrefix, 'All options are strictly clean of letter prefixes ("A.", "B.", "C.", "D.", "E.")');

// 3. Verify Answer Keys Match Expected Keys Exactly
// MCQ (1-8):
// Q1: B (1)
// Q2: D (3)
// Q3: A (0)
// Q4: D (3) - Refactored for Anti-Guess Heuristic (prevents longest answer bias)
// Q5: C (2)
// Q6: B (1)
// Q7: D (3)
// Q8: E (4)
const expectedMCQ = [1, 3, 0, 3, 2, 1, 3, 4];
for (let i = 0; i < 8; i++) {
    assert(moduleData.questions[i].answer === expectedMCQ[i], `MCQ #${i + 1} answer matches expected key (Index: ${expectedMCQ[i]})`);
}

// Checkbox (9-14):
// Q9: A, B, D, E -> [0, 1, 3, 4]
// Q10: A, B, C, E -> [0, 1, 2, 4]
// Q11: B, C, E -> [1, 2, 4]
// Q12: A, C, E -> [0, 2, 4]
// Q13: A, C, D, E -> [0, 2, 3, 4]
// Q14: A, C, D, E -> [0, 2, 3, 4]
const expectedCheckbox = [
    [0, 1, 3, 4],
    [0, 1, 2, 4],
    [1, 2, 4],
    [0, 2, 4],
    [0, 2, 3, 4],
    [0, 2, 3, 4]
];
for (let i = 0; i < 6; i++) {
    const qIdx = 8 + i;
    const ans = moduleData.questions[qIdx].answer;
    const exp = expectedCheckbox[i];
    const isMatch = Array.isArray(ans) && ans.length === exp.length && exp.every(v => ans.includes(v));
    assert(isMatch, `Checkbox #${qIdx + 1} answer matches expected keys (${JSON.stringify(exp)})`);
}

// TF (15-20):
// Q15: Benar (0)
// Q16: Salah (1)
// Q17: Benar (0)
// Q18: Benar (0)
// Q19: Benar (0)
// Q20: Salah (1)
const expectedTF = [0, 1, 0, 0, 0, 1];
for (let i = 0; i < 6; i++) {
    const qIdx = 14 + i;
    assert(moduleData.questions[qIdx].answer === expectedTF[i], `TF #${qIdx + 1} answer matches expected key (Index: ${expectedTF[i]})`);
}

// 4. Test Partial Scoring Simulation for Checkbox Questions
// Simulate NemotronAI calculation on Q9 (answers: [0, 1, 3, 4], totalPoints: 5)
const q9 = moduleData.questions[8];
const correctSet = new Set(q9.answer);
const maxPoints = q9.points || 5;

// Student selects 2 correct answers ([0, 1])
const selected2 = [0, 1];
const matched2 = selected2.filter(idx => correctSet.has(idx)).length;
const earned2 = Math.round((matched2 / correctSet.size) * maxPoints);
assert(earned2 > 0 && earned2 < maxPoints, `Partial credit: Student choosing 2 of 4 correct answers receives partial points (${earned2}/${maxPoints} points)`);

// Student selects all 4 correct answers ([0, 1, 3, 4])
const selectedFull = [0, 1, 3, 4];
const matchedFull = selectedFull.filter(idx => correctSet.has(idx)).length;
const earnedFull = Math.round((matchedFull / correctSet.size) * maxPoints);
assert(earnedFull === maxPoints, `Full credit: Student choosing all 4 correct answers receives full points (${earnedFull}/${maxPoints} points)`);

// 5. Test Shuffling Randomness Simulation
function shuffleArraySim(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const indices = Array.from({ length: 20 }, (_, i) => i);
const student1Order = shuffleArraySim(indices);
const student2Order = shuffleArraySim(indices);
const isOrderIdentical = student1Order.every((v, i) => v === student2Order[i]);
assert(!isOrderIdentical, 'Simulation: Student 1 and Student 2 receive randomized, non-identical question sequences');

// 6. Test QuizManager Integration & Isolation
(async () => {
    const jsCode = fs.readFileSync('js/quiz_manager.js', 'utf8');
    const window = { localStorage: { getItem: () => null, setItem: () => null } };
    const sandbox = { window, localStorage: window.localStorage, console };
    vm.createContext(sandbox);
    vm.runInContext(jsCode, sandbox);

    assert(sandbox.window.QuizManager !== undefined, 'QuizManager is defined on window');
    assert(sandbox.window.QuizManager.ETIKA_PRIVASI_MODULE !== undefined, 'ETIKA_PRIVASI_MODULE exists in QuizManager');
    assert(sandbox.window.QuizManager.ETIKA_PRIVASI_MODULE.id === 'modul_etika_privasi_keamanan', 'Module ID is correctly registered');

    const modules = await sandbox.window.QuizManager.getAllModules();
    assert(modules.length === 4, `All 4 modules are returned (Actual: ${modules.length})`);
    assert(modules[0].id === 'modul_jaringan_keamanan', 'Index 0 is modul_jaringan_keamanan');
    assert(modules[1].id === 'modul_detektif_fakta', 'Index 1 is modul_detektif_fakta');
    assert(modules[2].id === 'modul_hki_profesi_budaya', 'Index 2 is modul_hki_profesi_budaya');
    assert(modules[3].id === 'modul_etika_privasi_keamanan', 'Index 3 is modul_etika_privasi_keamanan');

    console.log('\n================================================================');
    console.log(`📊 FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
})();
