const fs = require('fs');
const path = require('path');

console.log('════════════════════════════════════════════════════════════════');
console.log('⚖️ RUNNING NEW MODULE (HKI, PROFESI & BUDAYA) VERIFICATION');
console.log('   (Matt Pocock Quality & Compliance Verification)');
console.log('════════════════════════════════════════════════════════════════\n');

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
const modulePath = path.join(__dirname, 'bank_soal/modul_hki_profesi_budaya.json');
assert(fs.existsSync(modulePath), 'File bank_soal/modul_hki_profesi_budaya.json exists');

const moduleData = JSON.parse(fs.readFileSync(modulePath, 'utf8'));
assert(moduleData.id === 'modul_hki_profesi_budaya', 'Module ID is "modul_hki_profesi_budaya"');
assert(moduleData.kkm === 80, 'Module KKM is 80');
assert(Array.isArray(moduleData.questions) && moduleData.questions.length === 20, 'Module contains exactly 20 questions');

// 2. Validate Question Structure & Option Prefix Cleanliness
let totalPoints = 0;
let hasOptionPrefix = false;

moduleData.questions.forEach((q, idx) => {
    totalPoints += (q.points || 0);
    assert(q.id && q.q && Array.isArray(q.options) && q.options.length >= 2, `Question #${idx + 1} has valid stem and options`);
    assert(q.answer !== undefined && q.answer !== null, `Question #${idx + 1} has valid answer key`);

    q.options.forEach(opt => {
        if (/^[A-E]\.\s+/i.test(opt)) {
            hasOptionPrefix = true;
            console.error(`Question #${idx + 1} option still has prefix: "${opt}"`);
        }
    });
});

assert(totalPoints === 100, `Total points across 20 questions is exactly 100 (Actual: ${totalPoints})`);
assert(!hasOptionPrefix, 'All options are strictly clean of "A.", "B.", "C.", "D.", "E." prefixes');

// 3. Verify Answer Keys Match Expected Keys Exactly
// MCQ (1-8): D(3), B(1), C(2), E(4), A(0), B(1), D(3), C(2)
const expectedMCQ = [3, 1, 2, 4, 0, 1, 3, 2];
for (let i = 0; i < 8; i++) {
    assert(moduleData.questions[i].answer === expectedMCQ[i], `MCQ #${i + 1} answer matches expected key (Index: ${expectedMCQ[i]})`);
}

// Checkbox (9-14):
// 9: A,C,D -> [0,2,3]
// 10: B,D,E -> [1,3,4]
// 11: A,C,D,E -> [0,2,3,4]
// 12: A,C,D -> [0,2,3]
// 13: B,C,D -> [1,2,3]
// 14: A,B,D -> [0,1,3]
const expectedCheckbox = [
    [0, 2, 3],
    [1, 3, 4],
    [0, 2, 3, 4],
    [0, 2, 3],
    [1, 2, 3],
    [0, 1, 3]
];
for (let i = 0; i < 6; i++) {
    const qIdx = 8 + i;
    const ans = moduleData.questions[qIdx].answer;
    const exp = expectedCheckbox[i];
    const isMatch = Array.isArray(ans) && ans.length === exp.length && exp.every(v => ans.includes(v));
    assert(isMatch, `Checkbox #${qIdx + 1} answer matches expected keys (${JSON.stringify(exp)})`);
}

// TF (15-20): Benar(0), Benar(0), Salah(1), Benar(0), Benar(0), Salah(1)
const expectedTF = [0, 0, 1, 0, 0, 1];
for (let i = 0; i < 6; i++) {
    const qIdx = 14 + i;
    assert(moduleData.questions[qIdx].answer === expectedTF[i], `TF #${qIdx + 1} answer matches expected key (Index: ${expectedTF[i]})`);
}

// 4. Test Partial Scoring Simulation for Checkbox Questions
// Simulate NemotronAI calculation on Q9 (answers: [0, 2, 3], totalPoints: 5)
const q9 = moduleData.questions[8];
const correctSet = new Set(q9.answer);
const maxPoints = q9.points || 5;

// Student selects 1 correct answer ([0])
const selected1 = [0];
const matched1 = selected1.filter(idx => correctSet.has(idx)).length;
const earned1 = Math.round((matched1 / correctSet.size) * maxPoints);
assert(earned1 > 0 && earned1 < maxPoints, `Partial credit: Student choosing 1 of 3 correct answers receives partial points (${earned1}/${maxPoints} points)`);

// Student selects all 3 correct answers ([0, 2, 3])
const selectedFull = [0, 2, 3];
const matchedFull = selectedFull.filter(idx => correctSet.has(idx)).length;
const earnedFull = Math.round((matchedFull / correctSet.size) * maxPoints);
assert(earnedFull === maxPoints, `Full credit: Student choosing all 3 correct answers receives full points (${earnedFull}/${maxPoints} points)`);

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

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`📊 FINAL RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log('════════════════════════════════════════════════════════════════');

if (failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
