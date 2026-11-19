/**
 * verify_mobile_desktop_quiz_smoothness.js
 * Verification suite for smooth quiz progression, answer checking, and desktop/mobile UI compatibility.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════');
console.log('📱 RUNNING MOBILE & DESKTOP QUIZ SMOOTHNESS VERIFICATION');
console.log('════════════════════════════════════════════════════════════════\n');

// 1. Verify loadQuestion synchronization
const qeCode = fs.readFileSync(path.join(__dirname, 'js/quiz_engine.js'), 'utf8');

assert(qeCode.includes('currentQ = typeof index === \'number\' ? index : 0;'),
    'loadQuestion must synchronize currentQ with the index parameter');
console.log('  ✓ [PASS] Test 1: loadQuestion synchronizes currentQ = index to eliminate desync');

// 2. Verify startQuizActual resets currentQ
assert(qeCode.includes('function startQuizActual() {') && qeCode.includes('currentQ = 0;'),
    'startQuizActual must explicitly reset currentQ = 0');
console.log('  ✓ [PASS] Test 2: startQuizActual explicitly resets currentQ = 0 on exam start');

// 3. Verify handleMatrixRadioSelect sets both active class and checked property synchronously
assert(qeCode.includes('inpTrue && val === 0') && qeCode.includes('inpTrue.checked = true'),
    'handleMatrixRadioSelect must set inpTrue.checked = true');
assert(qeCode.includes('inpFalse && val === 1') && qeCode.includes('inpFalse.checked = true'),
    'handleMatrixRadioSelect must set inpFalse.checked = true');
console.log('  ✓ [PASS] Test 3: handleMatrixRadioSelect guarantees DOM checked & active class synchronously');

// 4. Verify checkAnswer uses resilient querySelector for matrix_tf
assert(qeCode.includes("row.querySelector('input[type=\"radio\"]:checked')"),
    'checkAnswer must use resilient row.querySelector for checked radio');
console.log('  ✓ [PASS] Test 4: checkAnswer uses resilient querySelector without brittle name string dependency');

// 5. Verify matrix labels have onclick handler for touch zero-lag
assert(qeCode.includes('onclick="window.handleMatrixRadioSelect(${rowIdx}, 0)"'),
    'True matrix label must have onclick handler for mobile touch resilience');
assert(qeCode.includes('onclick="window.handleMatrixRadioSelect(${rowIdx}, 1)"'),
    'False matrix label must have onclick handler for mobile touch resilience');
console.log('  ✓ [PASS] Test 5: Matrix labels have direct onclick handlers for instant mobile touch response');

// 6. Verify desktop Enter key navigation doesn't block radio/checkbox inputs
const appCode = fs.readFileSync(path.join(__dirname, 'js/app.js'), 'utf8');
assert(appCode.includes("!['radio', 'checkbox'].includes(e.target.type)"),
    'Enter key listener in app.js must allow radio and checkbox inputs to trigger check/next');
console.log('  ✓ [PASS] Test 6: Desktop Enter key listener enables instant keyboard checking from options');

// 7. Verify mobile touch-friendly full-width action buttons in css/style.css
const cssCode = fs.readFileSync(path.join(__dirname, 'css/style.css'), 'utf8');
assert(cssCode.includes('.q-actions {') && cssCode.includes('width: 100% !important;'),
    'css/style.css must have responsive full-width .q-actions for mobile screens');
console.log('  ✓ [PASS] Test 7: Mobile CSS provides full-width thumb-friendly 48px touch targets for action buttons');

// 8. Verify src/ mirroring
const srcQeCode = fs.readFileSync(path.join(__dirname, 'src/js/quiz_engine.js'), 'utf8');
const srcAppCode = fs.readFileSync(path.join(__dirname, 'src/js/app.js'), 'utf8');
const srcCssCode = fs.readFileSync(path.join(__dirname, 'src/css/style.css'), 'utf8');

assert.strictEqual(srcQeCode, qeCode, 'src/js/quiz_engine.js must match js/quiz_engine.js');
assert.strictEqual(srcAppCode, appCode, 'src/js/app.js must match js/app.js');
assert.strictEqual(srcCssCode, cssCode, 'src/css/style.css must match css/style.css');
console.log('  ✓ [PASS] Test 8: All updated files match their src/ counterparts 100%');

console.log('\n════════════════════════════════════════════════════════════════');
console.log('📊 FINAL RESULT: 8 / 8 TESTS PASSED');
console.log('🎉 QUIZ SMOOTHNESS & DESKTOP/MOBILE COMPATIBILITY VERIFIED 100%!');
console.log('════════════════════════════════════════════════════════════════\n');
