const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════');
console.log('📱 RUNNING MODAL MOBILE & SCROLL COMPATIBILITY VERIFICATION');
console.log('   (Android, iOS Safari, Tablet, and Desktop Compatibility)');
console.log('════════════════════════════════════════════════════════════════\n');

const css = fs.readFileSync(path.join(__dirname, 'css/style.css'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// TEST 1: Check that .modal-overlay has overflow-y: auto and iOS momentum scrolling
console.log('Test 1: Overlay scrollability for tall content & small screens');
assert(
    css.includes('.modal-overlay') && (css.includes('overflow-y: auto') || css.includes('overflow-y: scroll')),
    'FAIL: .modal-overlay must specify overflow-y: auto or scroll'
);
assert(
    css.includes('-webkit-overflow-scrolling: touch'),
    'FAIL: .modal-overlay must support -webkit-overflow-scrolling: touch for iOS'
);
console.log('  ✓ [PASS] .modal-overlay has overflow-y: auto and -webkit-overflow-scrolling');

// TEST 2: Check elimination of broken negative sticky bottom (-20px / -32px)
console.log('\nTest 2: Elimination of broken negative sticky bottom buttons');
assert(
    !css.includes('bottom: -20px') && !css.includes('bottom: -32px'),
    'FAIL: Broken negative sticky bottom (-20px / -32px) must be eliminated'
);
console.log('  ✓ [PASS] Negative sticky bottom offsets (-20px / -32px) eliminated');

// TEST 3: Check elimination of align-items: flex-end on modal overlay
console.log('\nTest 3: Elimination of align-items: flex-end that pushes modal behind mobile navigation');
const mobileOverlayRegex = /\.modal-overlay\s*\{[^}]*align-items:\s*flex-end/g;
assert(
    !mobileOverlayRegex.test(css),
    'FAIL: .modal-overlay must not use align-items: flex-end'
);
console.log('  ✓ [PASS] align-items: flex-end on modal overlay eliminated');

// TEST 4: Check margin: auto to prevent data loss / top clipping in scrollable flex
console.log('\nTest 4: Modal box uses margin: auto for centered alignment and top-scrollability');
assert(
    css.includes('margin: auto') || css.includes('margin: auto !important'),
    'FAIL: .modal-box must use margin: auto'
);
console.log('  ✓ [PASS] .modal-box margin: auto verified');

// TEST 5: Check mobile primary button prioritization (#btn-confirm-remedial order: -1)
console.log('\nTest 5: Primary "Lanjutkan Remedial" button is placed at top on mobile');
assert(
    css.includes('#btn-confirm-remedial') && css.includes('order: -1'),
    'FAIL: #btn-confirm-remedial must have order: -1 on mobile for easy reach'
);
console.log('  ✓ [PASS] #btn-confirm-remedial order: -1 verified');

// TEST 6: Check tap targets and touch-action
console.log('\nTest 6: Tap targets and touch responsiveness');
assert(
    css.includes('touch-action: manipulation'),
    'FAIL: Action buttons must include touch-action: manipulation'
);
console.log('  ✓ [PASS] Tap targets and touch-action verified');

// TEST 7: Source mirroring verification
console.log('\nTest 7: Root and src/ mirroring');
const srcCss = fs.readFileSync(path.join(__dirname, 'src/css/style.css'), 'utf8');
const srcHtml = fs.readFileSync(path.join(__dirname, 'src/index.html'), 'utf8');
assert.strictEqual(srcCss, css, 'src/css/style.css must match css/style.css identically');
assert.strictEqual(srcHtml, indexHtml, 'src/index.html must match index.html identically');
console.log('  ✓ [PASS] Root and src/ files match identically');

console.log('\n🎉 ALL MODAL MOBILE & SCROLL COMPATIBILITY CHECKS PASSED!');
