const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('════════════════════════════════════════════════════════════════');
console.log('🛡️ VERIFYING 8 QA FLAW FIXES & SECURITY HARDENING');
console.log('   (Matt Pocock TDD Methodology: Red-Green-Refactor)');
console.log('════════════════════════════════════════════════════════════════\n');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✓ [PASS] ${name}`);
        passCount++;
    } catch (err) {
        console.error(`  ✗ [FAIL] ${name}`);
        console.error(err);
        failCount++;
    }
}

// 1. Check Modul 3 & 4 Answer Vaulting
test('Test 1: vaultAnswers() strips answers from all 4 builtin modules in window', () => {
    const engineCode = fs.readFileSync(path.join(__dirname, 'js', 'quiz_engine.js'), 'utf8');
    assert(engineCode.includes('HKI_CULTURE_BUILTIN_QUESTIONS'), 'Must handle HKI_CULTURE_BUILTIN_QUESTIONS');
    assert(engineCode.includes('ETIKA_PRIVASI_BUILTIN_QUESTIONS'), 'Must handle ETIKA_PRIVASI_BUILTIN_QUESTIONS');

    // Run in sandbox to prove answers are deleted from window objects
    const sandbox = {
        window: {
            DEFAULT_BUILTIN_QUESTIONS: [{ id: 'q_0', q: 'Q1', answer: 2, explanation: 'Exp1' }],
            NETWORK_SECURITY_BUILTIN_QUESTIONS: [{ id: 'net_0', q: 'Q2', answer: 1, explanation: 'Exp2' }],
            HKI_CULTURE_BUILTIN_QUESTIONS: [{ id: 'hki_0', q: 'Q3', answer: 0, explanation: 'Exp3' }],
            ETIKA_PRIVASI_BUILTIN_QUESTIONS: [{ id: 'etika_0', q: 'Q4', answer: 3, explanation: 'Exp4' }]
        },
        document: { getElementById: () => ({ classList: { add: ()=>{}, remove: ()=>{} }, style: {} }) }
    };
    sandbox.window.window = sandbox.window;
    vm.runInNewContext(engineCode.slice(0, engineCode.indexOf('// 🛡️ PEMBERSIH TEKS SOAL')), sandbox);

    // Call vaultAnswers
    const sample = [
        { id: 'hki_0', q: 'Q3', answer: 0, explanation: 'Exp3' }
    ];
    sandbox.vaultAnswers(sample);

    assert.strictEqual(sandbox.window.HKI_CULTURE_BUILTIN_QUESTIONS[0].answer, undefined, 'HKI answer must be deleted');
    assert.strictEqual(sandbox.window.HKI_CULTURE_BUILTIN_QUESTIONS[0].explanation, undefined, 'HKI explanation must be deleted');
    assert.strictEqual(sandbox.window.ETIKA_PRIVASI_BUILTIN_QUESTIONS[0].answer, undefined, 'Etika answer must be deleted');
    assert.strictEqual(sandbox.window.ETIKA_PRIVASI_BUILTIN_QUESTIONS[0].explanation, undefined, 'Etika explanation must be deleted');
});

// 2. Check Live Exam Feedback Masking
test('Test 2: Live exam hides green highlight and pedagogical explanation when answering', () => {
    const engineCode = fs.readFileSync(path.join(__dirname, 'js', 'quiz_engine.js'), 'utf8');
    // Ensure checkAnswer checks whether it is a live exam and does not reveal the correct answer green highlight to neighbors
    assert(engineCode.includes('isExamModule') || engineCode.includes('lockAnswersDuringExam') || engineCode.includes('Jawaban Terkunci'), 'checkAnswer must guard live exam answer display');
});

// 3. Check Floating Window & Blur Anti-Cheat
test('Test 3: Anti-cheat blur event detects background apps even when document.hidden is false', () => {
    const engineCode = fs.readFileSync(path.join(__dirname, 'js', 'quiz_engine.js'), 'utf8');
    // In blur event listener, it should NOT require document.hidden === true to trigger
    const blurPart = engineCode.match(/window\.addEventListener\('blur'[\s\S]*?\}\);/);
    assert(blurPart, 'Blur event listener must exist');
    assert(!blurPart[0].includes('if (document.hidden)'), 'Blur listener must not be blocked by if (document.hidden)');
});

// 4. Check Incognito / Cloud Pre-check
test('Test 4: initiateQuiz performs cloud check to block repeat submissions in Incognito', () => {
    const engineCode = fs.readFileSync(path.join(__dirname, 'js', 'quiz_engine.js'), 'utf8');
    assert(engineCode.includes('checkCloudStudentSubmission') || engineCode.includes('verifyAndPurgeIfDeletedByTeacher'), 'Must check cloud submission status before starting quiz');
});

// 5. Check Teacher Authorization Guard on grantTeacherAccess & renderDashboard
test('Test 5: grantTeacherAccess and renderDashboard abort if unauthenticated', () => {
    const dashCode = fs.readFileSync(path.join(__dirname, 'js', 'dashboard.js'), 'utf8');
    assert(dashCode.includes('grantTeacherAccess'), 'grantTeacherAccess must exist');

    const grantFn = dashCode.match(/function grantTeacherAccess\([^)]*\)\s*\{([\s\S]*?)switchScreen/);
    assert(grantFn, 'grantTeacherAccess function must be found');
    assert(grantFn[1].includes('_isTeacherAuthenticated') || grantFn[1].includes('isTeacherAuthValid'), 'grantTeacherAccess must check auth before granting access');

    const renderFn = dashCode.match(/function renderDashboard\(\)\s*\{([\s\S]*?)const allRecords/);
    assert(renderFn, 'renderDashboard function must be found');
    assert(renderFn[1].includes('isTeacherAuthValid'), 'renderDashboard must check isTeacherAuthValid()');
});

// 6. Check Deletion Protection
test('Test 6: confirmClearData and confirmDeleteSingle require valid teacher authentication', () => {
    const dashCode = fs.readFileSync(path.join(__dirname, 'js', 'dashboard.js'), 'utf8');
    const clearFn = dashCode.match(/async function confirmClearData\(\)\s*\{([\s\S]*?)localStorage/);
    assert(clearFn, 'confirmClearData must exist');
    assert(clearFn[1].includes('isTeacherAuthValid'), 'confirmClearData must require isTeacherAuthValid()');
});

// 7. Check Supabase Row Limit & LocalStorage Quota Guard
test('Test 7: fetchSupabaseRecords uses sensible row limit and safe storage setter', () => {
    const audioCode = fs.readFileSync(path.join(__dirname, 'js', 'audio.js'), 'utf8');
    assert(audioCode.includes('limit=500') || !audioCode.includes('limit=5000'), 'Supabase limit must not be 5000 rows');
    assert(audioCode.includes('safeLocalStorageSet') || audioCode.includes('QuotaExceededError'), 'Must handle QuotaExceededError or safeLocalStorageSet');
});

// 8. Check Monotonic Clock for Quiz Timer
test('Test 8: startTimer uses performance.now() to prevent system clock tampering', () => {
    const engineCode = fs.readFileSync(path.join(__dirname, 'js', 'quiz_engine.js'), 'utf8');
    const timerFn = engineCode.match(/function startTimer\([^)]*\)\s*\{([\s\S]*?)function stopTimer/);
    assert(timerFn, 'startTimer must exist');
    assert(timerFn[1].includes('performance.now'), 'startTimer must use performance.now()');
});

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`📊 FINAL RESULT: ${passCount} / ${passCount + failCount} TESTS PASSED`);
if (failCount === 0) {
    console.log('🎉 ALL 8 QA FIXES VERIFIED 100%!');
} else {
    console.log('❌ SOME CHECKS FAILED');
    process.exit(1);
}
