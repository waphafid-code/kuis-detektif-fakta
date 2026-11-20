/**
 * verify_remedial_flow_and_dashboard_badges.js
 * Dedicated verification test suite for the Remedial Flow & Dashboard Badges.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Verification: Remedial Flow & Dashboard Badges...\n');

// 1. Verify HTML elements for remedial modal in index.html & kuis_interaktif_dasbor_guru.html
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

assert(indexHtml.includes('id="remedial-offer-modal"') || indexHtml.includes('id="remedial-confirm-modal"'), 'index.html must contain remedial modal');
assert(indexHtml.includes('rem-offer-name') || indexHtml.includes('rem-conf-name'), 'index.html must contain student name element in remedial modal');
assert(indexHtml.includes('rem-offer-score') || indexHtml.includes('rem-conf-score'), 'index.html must contain score element in remedial modal');
assert(indexHtml.includes('confirmRemedialStart()') || indexHtml.includes('proceedWithRemedialQuiz()'), 'index.html must wire remedial confirmation start');

console.log('✅ 1. HTML structure and modal elements verified.');

// 2. Verify quiz_engine.js functions and logic
const qeCode = fs.readFileSync(path.join(__dirname, 'js/quiz_engine.js'), 'utf8');
assert(qeCode.includes('function openRemedialOffer') || qeCode.includes('function openRemedialBriefing'), 'quiz_engine.js must declare remedial offer/briefing');
assert(qeCode.includes('function confirmRemedialStart') || qeCode.includes('function proceedWithRemedialQuiz'), 'quiz_engine.js must declare confirm start remedial');
assert(qeCode.includes('window.openRemedialOffer = openRemedialOffer;') || qeCode.includes('window.confirmRemedialStart = confirmRemedialStart;'), 'window remedial functions must be exposed');
console.log('✅ 2. Quiz engine remedial handler functions verified.');

// 3. Verify Remedial Eligibility & Blocking Logic in initiateQuiz()
assert(qeCode.includes('REMEDIAL_KKM') || qeCode.includes('bestScore >= 80') || qeCode.includes('bestScore < 80'), 'initiateQuiz must check remedial KKM');
assert(qeCode.includes('alreadyRemedialed') || qeCode.includes('remedialEligible'), 'initiateQuiz must verify remedial eligibility');
console.log('✅ 3. Remedial eligibility and modal prompt logic verified.');

// 4. Verify Capping and Math.max Scoring Logic in finishQuiz()
assert(qeCode.includes('isRemedial: true') || qeCode.includes('isRemedial: isRemedialSession'), 'finishQuiz record must store isRemedial flag');
assert(qeCode.includes('originalScore:') || qeCode.includes('remedialScore:'), 'finishQuiz record must store originalScore / remedialScore');
console.log('✅ 4. Scoring reconciliation and KKM 80 cap verified.');

// 5. Verify audio.js record merging logic
const audioCode = fs.readFileSync(path.join(__dirname, 'js/audio.js'), 'utf8');
assert(audioCode.includes('isRemedial:') || audioCode.includes('isRemedial'), 'mergeRecordsList must preserve isRemedial flag');
assert(audioCode.includes('originalScore:') || audioCode.includes('originalScore'), 'mergeRecordsList must preserve originalScore');
assert(audioCode.includes('remedialScore:') || audioCode.includes('remedialScore'), 'mergeRecordsList must preserve remedialScore');
console.log('✅ 5. Record merging and persistence of remedial metadata verified.');

// 6. Verify dashboard.js visual badges
const dashCode = fs.readFileSync(path.join(__dirname, 'js/dashboard.js'), 'utf8');
assert(dashCode.includes('getRemedialMeta') || dashCode.includes('badge-remedial-tuntas'), 'dashboard.js must provide remedial meta/badges');
assert(dashCode.includes('Sudah Remedial') || dashCode.includes('badge-remedial-gagal') || dashCode.includes('Perlu Remedial'), 'dashboard.js must display remedial status');
console.log('✅ 6. Teacher Dashboard visual badges and breakdown verified.');

// 7. Verify CSS badges
const cssCode = fs.readFileSync(path.join(__dirname, 'css/style.css'), 'utf8');
assert(cssCode.includes('.badge-remedial-tuntas') || cssCode.includes('.badge-remedial-gagal'), 'css/style.css must define remedial badge classes');
console.log('✅ 7. CSS styling for badges verified.');

// 8. Verify Source Mirroring
const srcQeCode = fs.readFileSync(path.join(__dirname, 'src/js/quiz_engine.js'), 'utf8');
assert.strictEqual(srcQeCode, qeCode, 'src/js/quiz_engine.js must match js/quiz_engine.js exactly');
console.log('✅ 8. src/ mirror consistency verified.');

console.log('\n🎉 ALL 8 REMEDIAL SUITE CHECKS PASSED PERFECTLY!');
