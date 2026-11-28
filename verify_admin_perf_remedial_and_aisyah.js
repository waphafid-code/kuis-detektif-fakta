const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

console.log('🧪 Starting Verification: Admin Perf, Remedial Access Bypass, and Aisyah Score...\n');

// 1. Verify AISYAH ALIFAH DHANIEL = 100 on modul_detektif_fakta in default_records.js
const { OFFICIAL_EXAM_RESULTS } = require('./js/default_records.js');
const aisyahFakta = OFFICIAL_EXAM_RESULTS.find(r =>
    r && String(r.name || '').toUpperCase() === 'AISYAH ALIFAH DHANIEL' &&
    String(r.class || '').replace(/\s+/g, '').toUpperCase() === 'XE2' &&
    r.moduleId === 'modul_detektif_fakta'
);
assert(aisyahFakta, 'AISYAH ALIFAH DHANIEL harus tercatat pada modul_detektif_fakta');
assert.strictEqual(aisyahFakta.score, 100, 'Nilai AISYAH ALIFAH DHANIEL di Detektif Fakta harus 100');
assert.strictEqual(aisyahFakta.correct, 20, 'Jumlah benar harus 20');
console.log('✅ 1. Nilai AISYAH ALIFAH DHANIEL = 100 di modul_detektif_fakta terverifikasi.');

// 2. Verify remedial access logic allows < 80 non-remedial student even when checkClassAccess() returns allowed:false
const qeCode = fs.readFileSync('js/quiz_engine.js', 'utf8');
assert(
    qeCode.includes('if (!access.allowed && !remedialEligible && !remedialConfirmed)'),
    'initiateQuiz harus mengizinkan remedialEligible melewati kunci kelas reguler'
);
assert(
    qeCode.indexOf('const remedialEligible =') < qeCode.indexOf('if (!access.allowed && !remedialEligible && !remedialConfirmed)'),
    'remedialEligible harus dihitung SEBELUM pengecekan !access.allowed memblokir siswa'
);
assert(
    qeCode.includes('fetchCloudSharedState()'),
    'initiateQuiz harus menyinkronkan Cloud Shared State jika cache remedial lokal belum tersedia/lama'
);

// Runtime VM simulation for remedialEligible even with locked class
(async () => {
    let offeredModal = false;
    let lockedModalShown = false;
    const mockStorage = {
        quizmaster_remedial_enabled: 'enabled',
        quizmaster_submission_policy: 'single_only'
    };
    const noopEl = () => ({
        value: '', disabled: false, innerHTML: '', textContent: '',
        style: {}, classList: { add: (c) => { if (c === 'active') lockedModalShown = true; }, remove: () => {}, contains: () => false }
    });
    const sandbox = {
        console, Date, Math, Array, Object, String, Number, Promise, Set, Map, JSON,
        setTimeout, clearTimeout,
        window: { __remedialConfirmed: false },
        document: {
            getElementById: (id) => {
                if (id === 'input-class') return { value: 'X E 4', style: {} };
                if (id === 'input-name') return { value: 'NADA SYIFA', style: {} };
                if (id === 'input-module') return { value: 'modul_jaringan_keamanan', style: {} };
                if (id === 'access-locked-modal') return { classList: { add: () => { lockedModalShown = true; }, remove: () => {} } };
                if (id === 'remedial-offer-modal') return { classList: { add: () => { offeredModal = true; }, remove: () => {} } };
                return noopEl();
            },
            querySelector: () => noopEl()
        },
        localStorage: {
            getItem: (k) => mockStorage[k] || null,
            setItem: (k, v) => { mockStorage[k] = String(v); }
        },
        sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
        loadRemedialSetting: () => true,
        loadSubmissionPolicy: () => 'single_only',
        checkClassAccess: () => ({ allowed: false, reason: 'Kelas ini sedang dikunci manual oleh Guru' }),
        loadRecords: () => [{
            name: 'NADA SYIFA',
            class: 'X E 4',
            moduleId: 'modul_jaringan_keamanan',
            moduleTitle: 'Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital',
            score: 54,
            date: '30/10/2026',
            isRemedial: false,
            isCheated: false
        }],
        normalizeModuleId: (m) => m || 'modul_detektif_fakta',
        isNameEquivalent: (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase(),
        isClassEquivalent: (a, b) => String(a).replace(/\s+/g, '').toUpperCase() === String(b).replace(/\s+/g, '').toUpperCase(),
        isCurrentStudentDemo: () => false,
        verifyAndPurgeIfDeletedByTeacher: async () => false,
        openRemedialOffer: () => { offeredModal = true; },
        showToast: () => {},
        sfxClick: () => {},
        sfxWrong: () => {},
        escapeHtml: (s) => String(s || ''),
        STUDENT_ROSTER: { 'X E 4': ['NADA SYIFA'] },
        studentName: '', studentClass: '', remedialSourceRecord: null, currentActiveModule: null,
        isQuizFinishing: false,
        QuizManager: { getActiveModuleId: () => 'modul_jaringan_keamanan', getAllModules: async () => [] }
    };
    sandbox.window.STUDENT_ROSTER = sandbox.STUDENT_ROSTER;
    sandbox.window.QuizManager = sandbox.QuizManager;
    vm.createContext(sandbox);

    const fnStart = qeCode.indexOf('let isInitiatingQuiz = false;');
    const fnEnd = qeCode.indexOf('function runCountdown()');
    vm.runInContext(qeCode.slice(fnStart, fnEnd), sandbox);

    await sandbox.initiateQuiz();
    assert.strictEqual(lockedModalShown, false, 'Siswa < 80 belum remedial TIDAK boleh diblokir modal kelas terkunci');
    assert.strictEqual(offeredModal, true, 'Siswa < 80 belum remedial HARUS langsung menerima modal penawaran remedial');
    console.log('✅ 2. Simulasi runtime: siswa skor < 80 belum remedial dapat langsung masuk penawaran remedial meski kelas reguler dikunci.');
})().then(() => {
    // 3. Verify Firebase SSE singleton + sync cooldown + dashboard batching/deferred rendering
    const fbCode = fs.readFileSync('js/firebase_sync.js', 'utf8');
    const audioCode = fs.readFileSync('js/audio.js', 'utf8');
    const dashCode = fs.readFileSync('js/dashboard.js', 'utf8');

    assert(fbCode.includes('_rtdbSubscribedUrl') && fbCode.includes('rtdbEventSource.readyState !== 2'), 'initFirebaseRealtime wajib memiliki singleton guard');
    assert(fbCode.includes('if (isInitialPut && (Date.now() - openedAt) < 2000) return;'), 'SSE put awal wajib diabaikan agar tidak memicu loop sync');
    assert(audioCode.includes('let _syncInFlightPromise = null;') && audioCode.includes('(Date.now() - _lastSyncAt) < 4000'), 'syncWithBackend wajib deduplikasi in-flight & cooldown');
    assert(audioCode.includes('fetchFirebaseRecords'), 'checkCloudStudentSubmission wajib ikut mengecek Firebase RTDB');
    assert(dashCode.includes('recordsByClassAndMod') && dashCode.includes('tbodyRowsHtml.join') && dashCode.includes('_dashDeferredRenderToken'), 'renderDashboard wajib memakai indeks kelas, batch innerHTML, dan defer matrix/analitik');
    assert(dashCode.includes('12000'), 'Auto refresh dasbor tidak lagi membanjiri tiap 4.5 detik');
    console.log('✅ 3. Optimasi lag halaman admin & pencegahan SSE loop terverifikasi.');

    // 4. Verify src/ mirrors match root identically
    ['audio.js', 'dashboard.js', 'default_records.js', 'firebase_sync.js', 'quiz_engine.js'].forEach(f => {
        const rootC = fs.readFileSync(`js/${f}`, 'utf8');
        const srcC = fs.readFileSync(`src/js/${f}`, 'utf8');
        assert.strictEqual(rootC, srcC, `src/js/${f} harus identik dengan js/${f}`);
    });
    console.log('✅ 4. Seluruh file root dan src/ 100% identik.\n🎉 ALL CHECKS PASSED!');
}).catch(err => {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
});
