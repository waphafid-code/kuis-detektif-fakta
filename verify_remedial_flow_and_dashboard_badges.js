/**
 * verify_remedial_flow_and_dashboard_badges.js
 * Dedicated verification test suite for the Remedial Flow & Dashboard Badges.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Verification: Remedial Flow & Dashboard Badges...\n');

// 1. Verify HTML elements for #remedial-confirm-modal in index.html & kuis_interaktif_dasbor_guru.html
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const dasborHtml = fs.readFileSync(path.join(__dirname, 'kuis_interaktif_dasbor_guru.html'), 'utf8');

assert(indexHtml.includes('id="remedial-confirm-modal"'), 'index.html must contain #remedial-confirm-modal');
assert(indexHtml.includes('id="rem-conf-name"'), 'index.html must contain #rem-conf-name');
assert(indexHtml.includes('id="rem-conf-class"'), 'index.html must contain #rem-conf-class');
assert(indexHtml.includes('id="rem-conf-score"'), 'index.html must contain #rem-conf-score');
assert(indexHtml.includes('id="rem-conf-module"'), 'index.html must contain #rem-conf-module');
assert(indexHtml.includes('closeRemedialConfirmModal()'), 'index.html must wire closeRemedialConfirmModal()');
assert(indexHtml.includes('proceedWithRemedialQuiz()'), 'index.html must wire proceedWithRemedialQuiz()');

assert(dasborHtml.includes('id="remedial-confirm-modal"'), 'kuis_interaktif_dasbor_guru.html must contain #remedial-confirm-modal');
console.log('✅ 1. HTML structure and modal elements verified.');

// 2. Verify quiz_engine.js functions and logic
const qeCode = fs.readFileSync(path.join(__dirname, 'js/quiz_engine.js'), 'utf8');
assert(qeCode.includes('function closeRemedialConfirmModal'), 'quiz_engine.js must declare closeRemedialConfirmModal');
assert(qeCode.includes('function proceedWithRemedialQuiz'), 'quiz_engine.js must declare proceedWithRemedialQuiz');
assert(qeCode.includes('function startRemedialExam'), 'quiz_engine.js must declare startRemedialExam');
assert(qeCode.includes('window.closeRemedialConfirmModal = closeRemedialConfirmModal;'), 'window.closeRemedialConfirmModal must be exposed');
assert(qeCode.includes('window.proceedWithRemedialQuiz = proceedWithRemedialQuiz;'), 'window.proceedWithRemedialQuiz must be exposed');
assert(qeCode.includes('window.startRemedialExam = startRemedialExam;'), 'window.startRemedialExam must be exposed');
console.log('✅ 2. Quiz engine remedial handler functions verified.');

// 3. Verify Remedial Eligibility & Blocking Logic in initiateQuiz()
assert(qeCode.includes('bestScore >= 80'), 'initiateQuiz must check bestScore >= 80 to prevent tuntas students from taking remedial');
assert(qeCode.includes('bestScore < 80'), 'initiateQuiz must check bestScore < 80 for remedial eligibility');
assert(qeCode.includes('window.pendingRemedialSession ='), 'initiateQuiz must store pendingRemedialSession for the student');
console.log('✅ 3. Remedial eligibility and modal prompt logic verified.');

// 4. Verify Capping and Math.max Scoring Logic in finishQuiz()
assert(qeCode.includes('reconciledScore = KKM'), 'finishQuiz must cap remedial score to KKM (80)');
assert(qeCode.includes('reconciledScore = Math.max(orig, finalScore)'), 'finishQuiz must take highest score between orig and finalScore when < KKM');
assert(qeCode.includes('isRemedial: isRemedialSession'), 'finishQuiz record must store isRemedial flag');
assert(qeCode.includes('originalScore: isRemedialSession && remedialSourceRecord'), 'finishQuiz record must store originalScore');
assert(qeCode.includes('remedialScore: isRemedialSession ? finalScore : null'), 'finishQuiz record must store remedialScore');
console.log('✅ 4. Scoring reconciliation and KKM 80 cap verified.');

// 5. Verify audio.js record merging logic
const audioCode = fs.readFileSync(path.join(__dirname, 'js/audio.js'), 'utf8');
assert(audioCode.includes('isRemedial: !!(cur.isRemedial || item.isRemedial)'), 'mergeRecordsList must preserve isRemedial flag');
assert(audioCode.includes('originalScore:'), 'mergeRecordsList must preserve originalScore');
assert(audioCode.includes('remedialScore:'), 'mergeRecordsList must preserve remedialScore');
console.log('✅ 5. Record merging and persistence of remedial metadata verified.');

// 6. Verify dashboard.js visual badges
const dashCode = fs.readFileSync(path.join(__dirname, 'js/dashboard.js'), 'utf8');
assert(dashCode.includes('TUNTAS REMEDI (80)') || dashCode.includes('TUNTAS REMEDI'), 'dashboard.js must display TUNTAS REMEDI badge');
assert(dashCode.includes('LULUS MURNI'), 'dashboard.js must display LULUS MURNI badge');
assert(dashCode.includes('PERLU REMEDIAL') || dashCode.includes('BELUM LULUS'), 'dashboard.js must display PERLU REMEDIAL status');
assert(dashCode.includes('Murni •') && dashCode.includes('Remedi'), 'dashboard.js must display Pure vs Remedial breakdown in summary stats');
console.log('✅ 6. Teacher Dashboard visual badges and breakdown verified.');

// 7. Verify CSS badges
const cssCode = fs.readFileSync(path.join(__dirname, 'css/style.css'), 'utf8');
assert(cssCode.includes('.badge-murni'), 'css/style.css must define .badge-murni class');
console.log('✅ 7. CSS styling for badges verified.');

// 8. Verify Source Mirroring
const srcQeCode = fs.readFileSync(path.join(__dirname, 'src/js/quiz_engine.js'), 'utf8');
assert.strictEqual(srcQeCode, qeCode, 'src/js/quiz_engine.js must match js/quiz_engine.js exactly');
console.log('✅ 8. src/ mirror consistency verified.');

console.log('\n🎉 ALL 8 REMEDIAL SUITE CHECKS PASSED PERFECTLY!');
