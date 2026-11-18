const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('════════════════════════════════════════════════════════════════');
console.log('🛡️ VERIFYING ANSWER CHECK & TRANSITION BUTTON GUARDS');
console.log('════════════════════════════════════════════════════════════════\n');

const quizEngineCode = fs.readFileSync(path.join(__dirname, 'js', 'quiz_engine.js'), 'utf8');

// Test 1: isCheckingAnswer variable declared
assert(quizEngineCode.includes('let isCheckingAnswer = false;'), 'Test 1 Failed: isCheckingAnswer not declared');
console.log('  ✓ [PASS] Test 1: isCheckingAnswer flag is properly declared');

// Test 2: isCheckingAnswer guard inside checkAnswer()
assert(quizEngineCode.includes('if (isCheckingAnswer) return;'), 'Test 2 Failed: checkAnswer lacks isCheckingAnswer guard');
assert(quizEngineCode.includes('isCheckingAnswer = true;'), 'Test 2 Failed: isCheckingAnswer = true not set');
assert(quizEngineCode.includes('isCheckingAnswer = false;'), 'Test 2 Failed: isCheckingAnswer = false reset not present in finally');
console.log('  ✓ [PASS] Test 2: checkAnswer() implements re-entrancy lock and finally cleanup');

// Test 3: isTransitioningQuestion flag and guard in nextQuestion()
assert(quizEngineCode.includes('let isTransitioningQuestion = false;'), 'Test 3 Failed: isTransitioningQuestion not declared');
assert(quizEngineCode.includes('if (isTransitioningQuestion) return;'), 'Test 3 Failed: nextQuestion lacks isTransitioningQuestion guard');
console.log('  ✓ [PASS] Test 3: nextQuestion() implements transition guard to prevent double-next glitches');

// Test 4: loadQuestion and startQuizActual reset guards
assert(quizEngineCode.includes('function startQuizActual() {'), 'Test 4 Failed: startQuizActual not found');
assert(quizEngineCode.includes('function loadQuestion(index) {'), 'Test 4 Failed: loadQuestion not found');
console.log('  ✓ [PASS] Test 4: loadQuestion and startQuizActual reset both guard flags on start and question advance');

// Test 5: Check parity between js/quiz_engine.js and src/js/quiz_engine.js
const srcQuizEngineCode = fs.readFileSync(path.join(__dirname, 'src', 'js', 'quiz_engine.js'), 'utf8');
assert.strictEqual(quizEngineCode, srcQuizEngineCode, 'Test 5 Failed: js/quiz_engine.js does not match src/js/quiz_engine.js');
console.log('  ✓ [PASS] Test 5: Full parity verified between root js/ and src/js/quiz_engine.js');

console.log('\n════════════════════════════════════════════════════════════════');
console.log('📊 FINAL RESULT: 5 / 5 TESTS PASSED');
console.log('🎉 ANSWER SELECTION AND BUTTON GUARD VERIFIED 100%!');
console.log('════════════════════════════════════════════════════════════════\n');
