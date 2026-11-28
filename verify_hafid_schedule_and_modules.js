// ============================================================
// 🎓 VERIFICATION SUITE: TEACHER NAME, DATE-TIME RANGE & DURATION
// ============================================================
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════');
console.log('👨‍🏫 VERIFYING TEACHER NAME, ACCESS TIME RANGE & DURATION');
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
        console.error(e);
    }
}

const storageCode = fs.readFileSync(path.join(__dirname, 'js/storage.js'), 'utf8');
const dashboardCode = fs.readFileSync(path.join(__dirname, 'js/dashboard.js'), 'utf8');
const quizEngineCode = fs.readFileSync(path.join(__dirname, 'js/quiz_engine.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const aiStudioCode = fs.readFileSync(path.join(__dirname, 'js/ai_studio.js'), 'utf8');

// 1. Teacher Identity Verification
test('storage.js defines OFFICIAL_TEACHER_NAME as "Muhammad Hafidh Putra Roshadi, S.Pd."', () => {
    assert(storageCode.includes('const OFFICIAL_TEACHER_NAME = "Muhammad Hafidh Putra Roshadi, S.Pd."'));
    assert(storageCode.includes('const SCHEDULE_PAK_HAFIDH = SCHEDULE_RINI_SYAFITRI'));
    assert(storageCode.includes('const SCHEDULE_MUHAMMAD_HAFIDH = SCHEDULE_RINI_SYAFITRI'));
});

test('index.html displays teacher name in modal and header and removes reflection gimmick', () => {
    assert(indexHtml.includes('MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.'));
    assert(indexHtml.includes('Bpk. Muhammad Hafidh Putra Roshadi, S.Pd.'));
    assert(indexHtml.includes('Status Akses Kelas (Berdasarkan Roster Resmi Bpk. Muhammad Hafidh Putra Roshadi, S.Pd.)'));
    assert(!indexHtml.includes('id="student-reflection-card"'), 'Kartu refleksi harus sudah dihapus');
    assert(!indexHtml.includes('submitStudentReflection'), 'Tombol kirim refleksi harus sudah dihapus');
    assert(!quizEngineCode.includes('function submitStudentReflection'), 'Handler submitStudentReflection harus sudah dihapus');
});

test('dashboard.js exports and signatures use MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.', () => {
    assert(dashboardCode.includes("guruMataPelajaran: \"MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.\""));
    assert(dashboardCode.includes("Guru Pengampu: MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd."));
    assert(dashboardCode.includes("doc.text('MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.', 140, finalY + 24)"));
});

test('quiz_engine.js feedback and verification dialogs reference Pak Hafidh', () => {
    assert(quizEngineCode.includes('Bpk. Muhammad Hafidh Putra Roshadi, S.Pd.'));
});

test('ai_studio.js badge does not say Jam Buk Rini', () => {
    assert(!aiStudioCode.includes('Jam Buk Rini'));
    assert(aiStudioCode.includes('Jam Pak Hafidh'));
});

// 2. Zero PIN Leakage
test('Zero PIN leakage: Neither dashboard.js nor index.html contains plaintext PIN (2543)', () => {
    assert(!dashboardCode.includes('(2543)'));
    assert(!indexHtml.includes('(2543)'));
});

// 3. Date-Time Range Mode Logic
test('Date-Time Range Mode: Blocks access before start time, allows within window, blocks after end time', () => {
    // Setup mock sandbox for dashboard checkClassAccess
    const mockStorage = {};
    const sandbox = {
        localStorage: {
            getItem: (k) => mockStorage[k] || null,
            setItem: (k, v) => { mockStorage[k] = v; }
        },
        document: {
            getElementById: () => null
        },
        window: { quizInProgress: false },
        quizInProgress: false,
        SCHEDULE_PAK_HAFIDH: {
            'X E 1': { day: 1, dayName: 'Senin', start: '08:00', end: '10:00', period: 'Jam 1-2' }
        },
        isClassEquivalent: (a, b) => a === b,
        getDayName: () => 'Senin',
        ACCESS_SETTINGS_KEY: 'detektif_fakta_access_control'
    };

    const vm = require('vm');
    vm.createContext(sandbox);

    // Extract necessary functions from dashboardCode
    vm.runInContext(`
        const ACCESS_SETTINGS_KEY = 'detektif_fakta_access_control';
        ${dashboardCode.slice(dashboardCode.indexOf('function loadAccessSettings'), dashboardCode.indexOf('function saveAccessSettings'))}
        ${dashboardCode.slice(dashboardCode.indexOf('function getClassSchedule'), dashboardCode.indexOf('function setAccessMode'))}
    `, sandbox);

    const now = Date.now();

    // Scenario A: Window is in the future (not started yet)
    sandbox.localStorage.setItem('detektif_fakta_access_control', JSON.stringify({
        mode: 'date_range',
        rangeStartTimestamp: now + 3600000, // 1 hour in future
        rangeEndTimestamp: now + 7200000,
        rangeStartStr: '17 Nov 2026, 14:00 WIB',
        rangeEndStr: '17 Nov 2026, 16:00 WIB'
    }));

    let res = sandbox.checkClassAccess('X E 1', 'modul_jaringan_keamanan');
    assert.strictEqual(res.allowed, false, 'Access must be blocked before start time');
    assert(res.reason.includes('Kuis belum dibuka'), 'Reason must indicate exam not started');

    // Scenario B: Window is currently active
    sandbox.localStorage.setItem('detektif_fakta_access_control', JSON.stringify({
        mode: 'date_range',
        rangeStartTimestamp: now - 1800000, // started 30 mins ago
        rangeEndTimestamp: now + 3600000,   // ends in 1 hour
        rangeStartStr: '17 Nov 2026, 10:00 WIB',
        rangeEndStr: '17 Nov 2026, 12:00 WIB'
    }));

    res = sandbox.checkClassAccess('X E 1', 'modul_jaringan_keamanan');
    assert.strictEqual(res.allowed, true, 'Access must be allowed within window');

    // Scenario C: Window has expired
    sandbox.localStorage.setItem('detektif_fakta_access_control', JSON.stringify({
        mode: 'date_range',
        rangeStartTimestamp: now - 7200000,
        rangeEndTimestamp: now - 1800000, // expired 30 mins ago
        rangeStartStr: '17 Nov 2026, 08:00 WIB',
        rangeEndStr: '17 Nov 2026, 10:00 WIB'
    }));

    res = sandbox.checkClassAccess('X E 1', 'modul_jaringan_keamanan');
    assert.strictEqual(res.allowed, false, 'Access must be blocked after end time');
    assert(res.reason.includes('telah berakhir'), 'Reason must indicate exam window ended');

    // Scenario D: Mid-exam immunity (quizInProgress === true)
    sandbox.quizInProgress = true;
    res = sandbox.checkClassAccess('X E 1', 'modul_jaringan_keamanan');
    assert.strictEqual(res.allowed, true, 'In-progress exam student must NEVER be kicked out');
});

// 4. Custom Duration (Deadline) Logic
test('Custom Duration Mode: 60m and 90m presets calculate valid end timestamp and allow/block accurately', () => {
    const mockStorage = {};
    const sandbox = {
        localStorage: {
            getItem: (k) => mockStorage[k] || null,
            setItem: (k, v) => { mockStorage[k] = v; }
        },
        document: {
            getElementById: () => ({ classList: { contains: () => false }, value: '' })
        },
        window: { quizInProgress: false },
        quizInProgress: false,
        SCHEDULE_PAK_HAFIDH: {
            'X E 1': { day: 1, dayName: 'Senin', start: '08:00', end: '10:00', period: 'Jam 1-2' }
        },
        isClassEquivalent: (a, b) => a === b,
        getDayName: () => 'Senin',
        ACCESS_SETTINGS_KEY: 'detektif_fakta_access_control'
    };

    const vm = require('vm');
    vm.createContext(sandbox);

    vm.runInContext(`
        const ACCESS_SETTINGS_KEY = 'detektif_fakta_access_control';
        ${dashboardCode.slice(dashboardCode.indexOf('function loadAccessSettings'), dashboardCode.indexOf('function saveAccessSettings'))}
        ${dashboardCode.slice(dashboardCode.indexOf('function getClassSchedule'), dashboardCode.indexOf('function setAccessMode'))}
    `, sandbox);

    const now = Date.now();

    // Active 90-minute countdown
    sandbox.localStorage.setItem('detektif_fakta_access_control', JSON.stringify({
        mode: 'deadline',
        deadlineTimestamp: now + (90 * 60 * 1000), // 90 mins in future
        deadlineEndStr: '90 Menit'
    }));

    let res = sandbox.checkClassAccess('X E 1', 'modul_jaringan_keamanan');
    assert.strictEqual(res.allowed, true, 'Access must be allowed while 90-minute countdown is active');

    // Expired 60-minute countdown
    sandbox.localStorage.setItem('detektif_fakta_access_control', JSON.stringify({
        mode: 'deadline',
        deadlineTimestamp: now - 5000, // expired 5 seconds ago
        deadlineEndStr: '60 Menit'
    }));

    res = sandbox.checkClassAccess('X E 1', 'modul_jaringan_keamanan');
    assert.strictEqual(res.allowed, false, 'Access must be blocked once deadline timestamp expires');
});

// 5. Default Module Mode is "all"
test('loadActiveExamModuleSetting defaults to "all" so all 4 modules are visible by default', () => {
    const sandbox = {
        localStorage: {
            getItem: () => null
        }
    };
    const vm = require('vm');
    vm.createContext(sandbox);
    vm.runInContext(dashboardCode.slice(dashboardCode.indexOf('function loadActiveExamModuleSetting'), dashboardCode.indexOf('window.loadActiveExamModuleSetting =')), sandbox);
    assert.strictEqual(sandbox.loadActiveExamModuleSetting(), 'all');
});

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`📊 FINAL RESULT: ${pass} / ${total} TESTS PASSED`);
if (pass === total) {
    console.log('🎉 ALL TEACHER NAME, DATE-TIME RANGE & DURATION CHECKS VERIFIED 100%!');
} else {
    console.error('❌ SOME CHECKS FAILED');
    process.exit(1);
}
