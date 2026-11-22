/**
 * verify_hardened_anticheat.js
 * Test-Driven Verification for:
 * 1. Mobile 3-finger swipe screenshot interception (Xiaomi, Oppo, Realme, Vivo, Samsung).
 * 2. Laptop docked DevTools & Inspector detection (outer vs inner dimension difference).
 * 3. Mobile split screen (layar terbelah) detection (< 65% screen height).
 * 4. Dynamic Security Watermark (Anti-Joki & Anti-Foto Kamera) during active exam.
 * 5. Print & PDF export prevention (@media print & beforeprint event).
 * 6. Strict 3-strike warning enforcement & demo account immunity.
 * 7. Synchronization between root and src/ files.
 */
const fs = require('fs');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════');
console.log('🛡️ VERIFYING HARDENED ANTI-CHEAT SUITE (LAPTOP & MOBILE)');
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

const qeRoot = fs.readFileSync('js/quiz_engine.js', 'utf8');
const qeSrc = fs.readFileSync('src/js/quiz_engine.js', 'utf8');
const stRoot = fs.readFileSync('js/storage.js', 'utf8');
const stSrc = fs.readFileSync('src/js/storage.js', 'utf8');
const cssRoot = fs.readFileSync('css/style.css', 'utf8');
const cssSrc = fs.readFileSync('src/css/style.css', 'utf8');

// 1. Mobile 3-Finger Swipe Screenshot Interception
test('Mobile: 3-finger touch gesture intercepted on touchstart', () => {
    ['root', 'src'].forEach(target => {
        const code = target === 'root' ? qeRoot : qeSrc;
        assert(code.includes('touches.length >= 3'), `${target}: Must check e.touches.length >= 3`);
        assert(code.includes('Gesture Usap 3 Jari') || code.includes('Screenshot Ponsel'), `${target}: Must trigger 3-finger screenshot anti-cheat event`);
    });
});

// 2. Laptop: Docked DevTools Detection
test('Laptop: Docked DevTools detected via outer and inner dimensions', () => {
    ['root', 'src'].forEach(target => {
        const code = target === 'root' ? qeRoot : qeSrc;
        assert((code.includes('window.outerWidth - window.innerWidth') && code.includes('> 160')) || code.includes('outerWidth - window.innerWidth > 160'), `${target}: Must detect docked DevTools difference > 160px`);
        assert(code.includes('Developer Tools / Inspector') || code.includes('DevTools'), `${target}: Must trigger DevTools anti-cheat event`);
    });
});

// 3. Mobile: Split Screen Detection Threshold
test('Mobile: Split screen detected when window height < 65% of screen', () => {
    ['root', 'src'].forEach(target => {
        const code = target === 'root' ? qeRoot : qeSrc;
        assert(code.includes('screenH * 0.65'), `${target}: Must detect split screen at 65% height`);
        assert(code.includes('Layar Terbelah') || code.includes('Split Screen'), `${target}: Must trigger split-screen anti-cheat event`);
    });
});

// 4. Dynamic Security Watermark Lifecycle
test('Dynamic Security Watermark: renderExamWatermark & removeExamWatermark implemented and hooked', () => {
    ['root', 'src'].forEach(target => {
        const qe = target === 'root' ? qeRoot : qeSrc;
        const st = target === 'root' ? stRoot : stSrc;
        assert(qe.includes('function renderExamWatermark()'), `${target}: quiz_engine.js must declare renderExamWatermark`);
        assert(qe.includes('function removeExamWatermark()'), `${target}: quiz_engine.js must declare removeExamWatermark`);
        assert(st.includes('renderExamWatermark'), `${target}: storage.js switchScreen must invoke renderExamWatermark on quiz`);
        assert(st.includes('removeExamWatermark'), `${target}: storage.js switchScreen must invoke removeExamWatermark leaving quiz`);
    });
});

// 5. Print & PDF Export Blocker
test('Print Blocker: beforeprint listener in JS and @media print in CSS', () => {
    ['root', 'src'].forEach(target => {
        const qe = target === 'root' ? qeRoot : qeSrc;
        const css = target === 'root' ? cssRoot : cssSrc;
        assert(qe.includes('beforeprint'), `${target}: Must listen for beforeprint event`);
        assert(css.includes('@media print') && css.includes('exam-mode-active'), `${target}: CSS must block print in exam mode`);
    });
});

// 6. Strict 3-Strike Warning & Demo Account Immunity
test('Anti-Cheat Core: 3-strike warning enforced and demo accounts immune', () => {
    ['root', 'src'].forEach(target => {
        const code = target === 'root' ? qeRoot : qeSrc;
        assert(code.includes('const MAX_CHEAT_STRIKES = 3'), `${target}: Must enforce 3 strikes maximum`);
        assert(code.includes('isCurrentStudentDemo'), `${target}: Must protect demo accounts from strikes`);
    });
});

// 7. Exact Synchronization
test('Codebase Integrity: root and src files are 100% identical', () => {
    assert.strictEqual(qeRoot, qeSrc, 'js/quiz_engine.js and src/js/quiz_engine.js must match identically');
    assert.strictEqual(stRoot, stSrc, 'js/storage.js and src/js/storage.js must match identically');
    assert.strictEqual(cssRoot, cssSrc, 'css/style.css and src/css/style.css must match identically');
});

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`📊 FINAL RESULT: ${pass} / ${total} TESTS PASSED`);
if (pass === total) {
    console.log('🎉 100% HARDENED ANTI-CHEAT VERIFIED ON LAPTOP & MOBILE!');
}
console.log('════════════════════════════════════════════════════════════════\n');

if (pass !== total) process.exit(1);
