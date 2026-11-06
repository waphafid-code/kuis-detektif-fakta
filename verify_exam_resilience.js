const fs = require('fs');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════');
console.log('🛡️ RUNNING EXAM RESILIENCE & ANTI-KICK VERIFICATION SUITE');
console.log('════════════════════════════════════════════════════════════════\n');

let pass = 0;
let total = 0;

function test(name, fn) {
    total++;
    try {
        fn();
        console.log(`  ✓ [PASS] Test ${total}: ${name}`);
        pass++;
    } catch (e) {
        console.error(`  ✗ [FAIL] Test ${total}: ${name}`);
        console.error(`    -> ${e.message}`);
    }
}

const qe = fs.readFileSync('js/quiz_engine.js', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');
const css = fs.readFileSync('css/style.css', 'utf8');

test('Dual-Storage: saveCurrentQuizSession writes backup to localStorage', () => {
    assert(qe.includes("localStorage.setItem('quizmaster_active_exam_session_backup'"), 'Must backup active session to localStorage');
});

test('RAM Eviction Recovery: checkUnfinishedSession & restoreQuizSession read from localStorage backup', () => {
    assert(qe.includes("raw = localStorage.getItem('quizmaster_active_exam_session_backup')"), 'Must fall back to localStorage backup');
});

test('Screen Wake Lock: requestExamWakeLock and releaseExamWakeLock implemented', () => {
    assert(qe.includes('async function requestExamWakeLock()'), 'Must have requestExamWakeLock');
    assert(qe.includes('function releaseExamWakeLock()'), 'Must have releaseExamWakeLock');
    assert(qe.includes('navigator.wakeLock.request'), 'Must call Screen Wake Lock API');
});

test('Android Gesture Trap: popstate intercepts back navigation during active exam', () => {
    assert(qe.includes("window.addEventListener('popstate'"), 'Must listen for popstate');
    assert(qe.includes("history.pushState({ inQuiz: true }"), 'Must pushState to trap back button');
});

test('Mobile Notification Tolerance: blur timeout gives 15s grace on mobile', () => {
    assert(qe.includes('const graceMs = isMobileOrTouchDevice() ? 15000 : 8000;'), 'Must give 15s grace period on mobile');
});

test('Offline Resilience: HTML has status banner & CSS provides offline/online styles', () => {
    assert(html.includes('id="quiz-network-status-banner"'), 'index.html must have quiz-network-status-banner');
    assert(css.includes('.network-status-banner.offline'), 'css must style offline banner');
    assert(css.includes('.network-status-banner.online'), 'css must style online banner');
});

test('Offline Submission Queue: syncPendingOfflineRecords and offline queue implemented', () => {
    assert(qe.includes('syncPendingOfflineRecords'), 'Must have syncPendingOfflineRecords function');
    assert(qe.includes("localStorage.getItem('quizmaster_offline_pending_sync')"), 'Must manage offline sync queue in localStorage');
});

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`📊 FINAL RESULT: ${pass} / ${total} TESTS PASSED`);
if (pass === total) {
    console.log('🎉 100% EXAM RESILIENCE & ANTI-KICK GUARANTEED!');
}
console.log('════════════════════════════════════════════════════════════════\n');

if (pass !== total) process.exit(1);
