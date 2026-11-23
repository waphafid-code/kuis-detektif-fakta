/**
 * Regression coverage for remedial score delivery, module visibility, roster validation,
 * and exam focus/refresh resilience.
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');

const root = fs.readFileSync(path.join(__dirname, 'js/quiz_engine.js'), 'utf8');
const src = fs.readFileSync(path.join(__dirname, 'src/js/quiz_engine.js'), 'utf8');
const dashboard = fs.readFileSync(path.join(__dirname, 'js/dashboard.js'), 'utf8');
const dashboardSrc = fs.readFileSync(path.join(__dirname, 'src/js/dashboard.js'), 'utf8');
const audio = fs.readFileSync(path.join(__dirname, 'js/audio.js'), 'utf8');
const audioSrc = fs.readFileSync(path.join(__dirname, 'src/js/audio.js'), 'utf8');
const roster = fs.readFileSync(path.join(__dirname, 'js/student_roster.js'), 'utf8');

function test(name, fn) {
    fn();
    console.log('PASS: ' + name);
}

test('Root/src engine, dashboard and audio copies are identical', () => {
    assert.strictEqual(root, src);
    assert.strictEqual(dashboard, dashboardSrc);
    assert.strictEqual(audio, audioSrc);
});

test('Remedial warnings persist across reload without breaking legacy session signatures', () => {
    assert(root.includes("hasOwnProperty.call(data, 'cheatStrikes')"));
    assert(root.includes('cheatStrikes: Math.max(0, Number(cheatStrikes) || 0)'));
    assert(root.includes('Number(data.cheatStrikes) || 0'));
    assert(root.includes('saveCurrentQuizSession();'));
    assert(root.includes("window.addEventListener('pagehide'"));
    assert(root.includes('clearBlurGraceTimer();'));
});

test('Reload saves and restores progress without treating pagehide as a strike', () => {
    const pagehide = root.slice(root.indexOf("window.addEventListener('pagehide'"), root.indexOf("window.addEventListener('beforeunload'", root.indexOf("window.addEventListener('pagehide'")));
    assert(pagehide.includes('saveCurrentQuizSession()'));
    assert(!pagehide.includes('handleAntiCheatEvent'));
    assert(root.includes('Reload diperbolehkan'));
});

test('Clipboard copy, cut and paste are allowed; screenshot and DevTools guards remain', () => {
    assert(root.includes('Copy, cut, dan paste diperbolehkan'));
    assert(!root.includes("['c', 'C', 'x', 'X', 'v', 'V'].includes(e.key)"));
    assert(root.includes("e.key === 'PrintScreen'"));
    assert(root.includes("['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key)"));
});

test('Leaving focus/hidden page still enters the 3-strike warning flow', () => {
    assert(root.includes("document.addEventListener('visibilitychange'"));
    assert(root.includes("window.addEventListener('blur'"));
    assert(root.includes('handleAntiCheatEvent(\'🌐 Berpindah Tab / Meminimalkan Browser\')'));
    assert(root.includes('const MAX_CHEAT_STRIKES = 3'));
});

test('Hanifa Zahfaleta Rolia is present in X E 4 official roster', () => {
    assert(roster.includes("'X E 4': ["));
    assert(roster.includes('"HANIFA ZAHFALETA ROLIA"'));
    assert(root.includes('const rosterClass = Object.keys(window.STUDENT_ROSTER).find'));
    assert(root.includes('officialNames.some(officialName'));
    assert(root.includes('isClassEquivalent(key, cls)'));
});

test('Unregistered students are blocked before quiz start with a clear message', () => {
    assert(root.includes('Nama tidak terdaftar pada kelas yang dipilih'));
    assert(root.indexOf('Nama tidak terdaftar pada kelas yang dipilih') < root.indexOf('isInitiatingQuiz = true'));
});

test('Teacher comparison filter does not silently lock student module access', () => {
    assert(dashboard.includes('function selectModuleSegment(moduleId, syncToStudents = false)'));
    assert(dashboard.includes('Filter dashboard hanya mengubah tampilan guru'));
    assert(dashboard.includes("saveActiveExamModuleSetting('all')") || dashboard.includes('saveActiveExamModuleSetting(moduleId)'));
    assert(dashboard.includes('updateApplyButtonState(loadActiveExamModuleSetting())'), 'Apply button must reflect actual applied mode, not the currently browsed filter');
});

test('Applying all modules clears stale HKI lock and chooses a neutral default', () => {
    assert(dashboard.includes("mode === 'all' ? defaultModuleId : mode"));
    assert(dashboard.includes("activeModuleId: (mode === 'all' ? 'modul_jaringan_keamanan' : mode)"));
    assert(audio.includes("lockedMode === 'all'"));
    assert(audio.includes("'modul_jaringan_keamanan'"));
});

test('All five built-in modules remain present in dashboard comparison choices', () => {
    for (const id of ['modul_tryout_terpadu','modul_jaringan_keamanan','modul_detektif_fakta','modul_hki_profesi_budaya','modul_etika_privasi_keamanan']) {
        assert(dashboard.includes("id: '" + id + "'"));
    }
    assert(dashboard.includes("id: 'all'"));
});

test('Remedial results trigger local dashboard update and remote cloud refresh', () => {
    assert(audio.includes("new CustomEvent('quizmaster_new_record'"));
    assert(dashboard.includes("window.addEventListener('quizmaster_new_record'"));
    assert(audio.includes('.on(\'postgres_changes\''));
    assert(audio.includes('syncWithBackend(false)'));
    assert(audio.includes('initSupabaseRealtime()'));
});

test('Remedial raw score and official reconciled score remain separately recorded', () => {
    assert(root.includes('remedialScore: isRemedialSession ? finalScore : null'));
    assert(root.includes('score: displayScore'));
    assert(audio.includes('remedialScore: record.isRemedial ? (record.remedialScore ?? null) : null'));
    assert(audio.includes('const recordedRemedialScores ='));
    assert(audio.includes('hasRecordedRemedialScore ? bestRemScore'));
});

test('Remedial merge keeps raw remedial score even when it is lower than original', () => {
    const context = {
        window: { addEventListener() {}, removeEventListener() {}, dispatchEvent() {} },
        localStorage: { getItem() { return null; }, setItem() {} },
        console: { log() {}, warn() {}, error() {} }
    };
    context.window.window = context.window;
    context.window.localStorage = context.localStorage;
    vm.createContext(context);
    vm.runInContext(audio, context);
    const merge = context.mergeRecordsList || context.window.mergeRecordsList;
    const original = { name: 'HANIFA ZAHFALETA ROLIA', class: 'X E 4', moduleId: 'modul_detektif_fakta', score: 79, isRemedial: false };
    const failedRemedial = { name: original.name, class: original.class, moduleId: original.moduleId, score: 79, isRemedial: true, originalScore: 79, remedialScore: 60 };
    const mergedFailed = merge([original], [failedRemedial])[0];
    assert.strictEqual(mergedFailed.score, 79, 'Official score preserves the better original grade');
    assert.strictEqual(mergedFailed.remedialScore, 60, 'Raw remedial achievement must remain 60, not be replaced by 79');

    const passedRemedial = { ...failedRemedial, score: 80, remedialScore: 92 };
    const mergedPassed = merge([original], [passedRemedial])[0];
    assert.strictEqual(mergedPassed.score, 80, 'Official remedial grade remains capped at KKM 80');
    assert.strictEqual(mergedPassed.remedialScore, 92, 'Raw remedial achievement remains 92');
});

console.log('All 12 live remedial / exam-control regression checks passed.');
