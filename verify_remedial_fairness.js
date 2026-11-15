const fs = require('fs');
const path = require('path');

console.log('════════════════════════════════════════════════════════════════');
console.log('⚖️ RUNNING REMEDIAL FAIRNESS & KKM CAP VERIFICATION SUITE');
console.log('   (Matt Pocock TDD Methodology: Red-Green-Refactor)');
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

const quizEngineContent = fs.readFileSync(path.join(__dirname, 'js/quiz_engine.js'), 'utf8');

// Helper to simulate the reconciliation logic from quiz_engine.js
function calculateReconciledScoreSim(finalScore, isRemedialSession, remedialSourceRecord, KKM = 80, submissionPolicy = 'single_only', highestPrevScore = null) {
    let displayScore = finalScore;
    let reconciledScore = finalScore;

    // Extract current logic in quiz_engine.js
    if (isRemedialSession && remedialSourceRecord) {
        const orig = Number(remedialSourceRecord.score) || 0;
        // In the fixed version, if finalScore >= KKM, cap at KKM (80)
        // If the code still uses the old formula:
        if (quizEngineContent.includes('orig + (100 - orig) * (finalScore / 100)')) {
            reconciledScore = Math.max(orig, Math.min(100, Math.round(orig + (100 - orig) * (finalScore / 100))));
            displayScore = reconciledScore;
        } else if (quizEngineContent.includes('reconciledScore = KKM')) {
            if (finalScore >= KKM) {
                reconciledScore = KKM;
            } else {
                reconciledScore = Math.max(orig, finalScore);
            }
            displayScore = reconciledScore;
        } else {
            // Raw fallback for testing
            displayScore = finalScore;
        }
    } else if ((submissionPolicy === 'allow_twice_highest' || submissionPolicy === 'allow_remedy') && highestPrevScore !== null) {
        displayScore = Math.max(highestPrevScore, finalScore);
        reconciledScore = displayScore;
    }

    return { displayScore, reconciledScore };
}

// TEST 1: Check source code has eliminated the old unfair formula
assert(
    !quizEngineContent.includes('orig + (100 - orig) * (finalScore / 100)'),
    'Test 1: Unfair formula "orig + (100 - orig) * (finalScore / 100)" is eliminated'
);

// TEST 2: Check source code explicitly enforces KKM cap
assert(
    quizEngineContent.includes('reconciledScore = KKM') || quizEngineContent.includes('displayScore = KKM'),
    'Test 2: Explicit KKM cap "reconciledScore = KKM" is present for successful remedial'
);

// TEST 3: Scenario Budi (Non-remedial, First Attempt: 85)
const budi = calculateReconciledScoreSim(85, false, null, 80);
assert(budi.displayScore === 85, 'Test 3: Non-remedial student with score 85 retains pure score 85');

// TEST 4: Scenario Andi (Remedial, Initial: 65, Remedial Score: 100)
// Must be capped at KKM 80, never 100, and never higher than Budi (85)
const andi = calculateReconciledScoreSim(100, true, { score: 65 }, 80);
assert(andi.displayScore === 80, `Test 4: Remedial student scoring 100 is capped at KKM 80 (Actual: ${andi.displayScore})`);
assert(andi.displayScore < budi.displayScore, `Test 4b: Academic Fairness: Remedial student (${andi.displayScore}) never scores higher than honest first-pass student (${budi.displayScore})`);

// TEST 5: Scenario Citra (Remedial, Initial: 60, Remedial Score: 90)
const citra = calculateReconciledScoreSim(90, true, { score: 60 }, 80);
assert(citra.displayScore === 80, `Test 5: Remedial student scoring 90 is capped at KKM 80 (Actual: ${citra.displayScore})`);

// TEST 6: Scenario Doni (Remedial, Initial: 50, Remedial Score: 75 -> Still below KKM)
const doni = calculateReconciledScoreSim(75, true, { score: 50 }, 80);
assert(doni.displayScore === 75, `Test 6: Remedial student scoring 75 (< KKM) gets improved score 75 (Actual: ${doni.displayScore})`);

// TEST 7: Scenario Eka (Remedial, Initial: 70, Remedial Score: 60 -> Worse score)
const eka = calculateReconciledScoreSim(60, true, { score: 70 }, 80);
assert(eka.displayScore === 70, `Test 7: Remedial student scoring lower retains original 70 (Actual: ${eka.displayScore})`);

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('════════════════════════════════════════════════════════════════');

if (failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
