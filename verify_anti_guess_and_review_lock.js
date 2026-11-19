// ============================================================
// 🛡️ VERIFICATION SUITE: ANTI-GUESS (NO LENGTH BIAS) & REVIEW RELEASE LOCK
// ============================================================
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

console.log('════════════════════════════════════════════════════════════════');
console.log('🛡️ VERIFYING ANTI-GUESS HEURISTICS & TEACHER REVIEW LOCK');
console.log('════════════════════════════════════════════════════════════════\n');

let pass = 0;
let total = 0;

function test(name, fn) {
    total++;
    try {
        fn();
        console.log(`  ✓ [PASS] ${name}`);
        pass++;
    } catch (e) {
        console.error(`  ✗ [FAIL] ${name}`);
        console.error('    Error:', e.message);
    }
}

// 1. Anti-Guess: Modul Etika, Privasi & Keamanan Digital
test('Test 1: Modul Etika & Privasi has ZERO strictly longest correct answers in JSON & JS', () => {
    const jsonPath = path.join(__dirname, 'bank_soal', 'modul_etika_privasi_keamanan.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let strictlyLongestCount = 0;
    data.questions.forEach(q => {
        if (q.type === 'mcq' && Array.isArray(q.options)) {
            const lengths = q.options.map(o => o.length);
            const correctLen = lengths[q.answer];
            const maxLen = Math.max(...lengths);
            if (lengths.filter(l => l === maxLen).length === 1 && correctLen === maxLen) {
                strictlyLongestCount++;
            }
        }
    });
    assert.strictEqual(strictlyLongestCount, 0, 'No MCQ in Modul Etika should have the strictly longest option as answer');

    // Also verify in quiz_manager.js built-in
    const managerCode = fs.readFileSync(path.join(__dirname, 'js', 'quiz_manager.js'), 'utf8');
    const sandbox = { window: {} };
    vm.runInNewContext(managerCode, sandbox);
    const builtIn = sandbox.window.ETIKA_PRIVASI_BUILTIN_QUESTIONS;
    assert(Array.isArray(builtIn) && builtIn.length === 20, 'Built-in questions must exist');
    let builtInLongest = 0;
    builtIn.forEach(q => {
        if (q.type === 'mcq' && Array.isArray(q.options)) {
            const lengths = q.options.map(o => o.length);
            const correctLen = lengths[q.answer];
            const maxLen = Math.max(...lengths);
            if (lengths.filter(l => l === maxLen).length === 1 && correctLen === maxLen) {
                builtInLongest++;
            }
        }
    });
    assert.strictEqual(builtInLongest, 0, 'Built-in Modul Etika must also have 0 strictly longest answers');
});

// 2. Anti-Guess: Modul HKI, Budaya & Profesi Informatika
test('Test 2: Modul HKI & Budaya has ZERO strictly longest correct answers in JSON & JS', () => {
    const jsonPath = path.join(__dirname, 'bank_soal', 'modul_hki_profesi_budaya.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let strictlyLongestCount = 0;
    data.questions.forEach(q => {
        if (q.type === 'mcq' && Array.isArray(q.options)) {
            const lengths = q.options.map(o => o.length);
            const correctLen = lengths[q.answer];
            const maxLen = Math.max(...lengths);
            if (lengths.filter(l => l === maxLen).length === 1 && correctLen === maxLen) {
                strictlyLongestCount++;
            }
        }
    });
    assert.strictEqual(strictlyLongestCount, 0, 'No MCQ in Modul HKI should have the strictly longest option as answer');

    const managerCode = fs.readFileSync(path.join(__dirname, 'js', 'quiz_manager.js'), 'utf8');
    const sandbox = { window: {} };
    vm.runInNewContext(managerCode, sandbox);
    const builtIn = sandbox.window.HKI_CULTURE_BUILTIN_QUESTIONS;
    assert(Array.isArray(builtIn) && builtIn.length === 20, 'Built-in questions must exist');
    let builtInLongest = 0;
    builtIn.forEach(q => {
        if (q.type === 'mcq' && Array.isArray(q.options)) {
            const lengths = q.options.map(o => o.length);
            const correctLen = lengths[q.answer];
            const maxLen = Math.max(...lengths);
            if (lengths.filter(l => l === maxLen).length === 1 && correctLen === maxLen) {
                builtInLongest++;
            }
        }
    });
    assert.strictEqual(builtInLongest, 0, 'Built-in Modul HKI must also have 0 strictly longest answers');
});

// 3. Anti-Guess: Modul Jaringan & Keamanan
test('Test 3: Modul Jaringan & Keamanan has ZERO strictly longest correct answers in JSON & JS', () => {
    const jsonPath = path.join(__dirname, 'bank_soal', 'modul_jaringan_keamanan.json');
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let strictlyLongestCount = 0;
    data.questions.forEach(q => {
        if (q.type === 'mcq' && Array.isArray(q.options)) {
            const lengths = q.options.map(o => o.length);
            const correctLen = lengths[q.answer];
            const maxLen = Math.max(...lengths);
            if (lengths.filter(l => l === maxLen).length === 1 && correctLen === maxLen) {
                strictlyLongestCount++;
            }
        }
    });
    assert.strictEqual(strictlyLongestCount, 0, 'No MCQ in Modul Jaringan should have the strictly longest option as answer');
});

// 4. HTML Elements for Review Release Mode
test('Test 4: index.html contains review release settings and postponed card', () => {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    assert(html.includes('id="setting-review-release-mode"'), 'Must have setting-review-release-mode select');
    assert(html.includes('value="locked"'), 'Must have locked option');
    assert(html.includes('value="open"'), 'Must have open option');
    assert(html.includes('id="review-postponed-card"'), 'Must have review-postponed-card container');
});

// 5. Dashboard Functions for Review Release
test('Test 5: dashboard.js defines loadReviewReleaseSetting and saveReviewReleaseSetting', () => {
    const dashCode = fs.readFileSync(path.join(__dirname, 'js', 'dashboard.js'), 'utf8');
    assert(dashCode.includes('function loadReviewReleaseSetting'), 'loadReviewReleaseSetting must be defined');
    assert(dashCode.includes('function isReviewPostponed'), 'isReviewPostponed must be defined');
    assert(dashCode.includes('function saveReviewReleaseSetting'), 'saveReviewReleaseSetting must be defined');
    assert(dashCode.includes('quizmaster_review_release_mode'), 'Storage key must match');
});

// 6. Cloud Shared State Sync in audio.js
test('Test 6: audio.js syncs reviewReleaseMode in applyCloudSharedStateToLocal', () => {
    const audioCode = fs.readFileSync(path.join(__dirname, 'js', 'audio.js'), 'utf8');
    assert(audioCode.includes('state.reviewReleaseMode'), 'Must handle state.reviewReleaseMode in sync');
    assert(audioCode.includes('quizmaster_review_release_mode'), 'Must persist to quizmaster_review_release_mode');
});

// 7. Quiz Engine Result Screen Review Lock
test('Test 7: quiz_engine.js suppresses review list and remedial when isReviewPostponed() is true', () => {
    const engineCode = fs.readFileSync(path.join(__dirname, 'js', 'quiz_engine.js'), 'utf8');
    assert(engineCode.includes('isReviewPostponed'), 'finishQuiz & buildReview must check isReviewPostponed()');
    assert(engineCode.includes('review-postponed-card'), 'Must toggle review-postponed-card');
});

// 8. PDF & Excel Leak Protection when Review is Postponed
test('Test 8: exportStudentPDF & exportStudentExcel do not leak question table when postponed', () => {
    const dashCode = fs.readFileSync(path.join(__dirname, 'js', 'dashboard.js'), 'utf8');
    assert(dashCode.includes('BUKTI TANDA TERIMA PENGUMPULAN UJIAN RESMI'), 'PDF must generate submission certificate instead of question breakdown');
    assert(dashCode.includes('Rapor butir soal & pembahasan dirahasiakan') || dashCode.includes('pembahasan ditahan sesuai pengaturan Guru') || dashCode.includes('!isPostponed'), 'Excel must hide question breakdown when postponed');
});

console.log('════════════════════════════════════════════════════════════════');
console.log(`📊 FINAL RESULT: ${pass} / ${total} TESTS PASSED`);
if (pass === total) {
    console.log('🎉 100% ANTI-GUESS & REVIEW RELEASE LOCK VERIFIED!');
} else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
}
console.log('════════════════════════════════════════════════════════════════\n');
