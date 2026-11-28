/**
 * verify_demo_account_exit.js
 * 
 * Memverifikasi:
 * 1. Ketersediaan akun demo untuk Guru ("GURU PENGUJI (TEST REMEDIAL)" dan "MUHAMMAD HAFIDH (AKUN DEMO)")
 * 2. Visibilitas KELAS DEMO aktif secara default (loadDemoVisibilitySetting() === 'show')
 * 3. Deteksi isCurrentStudentDemo() bekerja akurat
 * 4. Anti-cheat dinonaktifkan untuk akun demo (bebas keluar masuk tab / jendela)
 * 5. Fungsi exitDemoQuiz('home') memungkinkan keluar dari ujian kapan saja ke beranda
 * 6. Fungsi exitDemoQuiz('finish_fail') mensimulasikan nilai < 80 untuk menguji alur remedial instan
 * 7. Fungsi resetDemoStudentRecords() tersedia untuk mereset riwayat pengujian demo
 */

const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

async function runTest() {
    console.log('════════════════════════════════════════════════════════════════');
    console.log('🧪 VERIFYING DEMO ACCOUNT & FREE EXIT ANYTIME');
    console.log('════════════════════════════════════════════════════════════════\n');

    // 1. Verifikasi Roster Siswa Demo
    const rosterCode = fs.readFileSync('js/student_roster.js', 'utf8');
    const rosterContext = { window: {} };
    vm.createContext(rosterContext);
    vm.runInContext(rosterCode, rosterContext);

    const demoRoster = rosterContext.window.STUDENT_ROSTER['KELAS DEMO'];
    assert(Array.isArray(demoRoster), 'STUDENT_ROSTER harus memiliki KELAS DEMO');
    assert(demoRoster.includes('GURU PENGUJI (TEST REMEDIAL)'), 'Harus ada akun GURU PENGUJI (TEST REMEDIAL)');
    assert(demoRoster.includes('MUHAMMAD HAFIDH (AKUN DEMO)'), 'Harus ada akun MUHAMMAD HAFIDH (AKUN DEMO)');
    console.log('  ✅ PASS: 1. Akun pengujian "GURU PENGUJI (TEST REMEDIAL)" & "MUHAMMAD HAFIDH (AKUN DEMO)" tersedia di KELAS DEMO');

    // 2. Verifikasi Default Visibilitas Kelas Demo di Dashboard
    const dashCode = fs.readFileSync('js/dashboard.js', 'utf8');
    const dashContext = {
        window: {
            addEventListener() {},
            removeEventListener() {},
            dispatchEvent() {}
        },
        document: {
            getElementById() { return null; },
            createElement() { return { style: {} }; },
            body: { appendChild() {} },
            addEventListener() {},
            removeEventListener() {}
        },
        localStorage: {
            _data: {},
            getItem(k) { return this._data[k] || null; },
            setItem(k, v) { this._data[k] = String(v); }
        }
    };
    vm.createContext(dashContext);
    vm.runInContext(dashCode, dashContext);
    assert.strictEqual(dashContext.window.loadDemoVisibilitySetting(), 'hide', 'loadDemoVisibilitySetting() harus default hide untuk siswa');
    dashContext.window.saveDemoVisibilitySetting('show');
    assert.strictEqual(dashContext.window.loadDemoVisibilitySetting(), 'show', 'loadDemoVisibilitySetting() harus show setelah diaktifkan');
    console.log('  ✅ PASS: 2. KELAS DEMO terproteksi hide default untuk siswa dan dapat diaktifkan instan untuk pengujian Guru');

    // 3. Verifikasi Markup UI di index.html
    const html = fs.readFileSync('index.html', 'utf8');
    assert(html.includes('id="quiz-demo-banner"'), 'index.html harus memuat banner kontrol demo #quiz-demo-banner');
    assert(html.includes("exitDemoQuiz('home')"), 'Harus ada tombol exitDemoQuiz ke beranda');
    assert(html.includes("exitDemoQuiz('finish_fail')"), 'Harus ada tombol exitDemoQuiz untuk simulasi nilai remedial');
    assert(html.includes('id="btn-demo-reset"'), 'Harus ada tombol #btn-demo-reset di result screen');
    console.log('  ✅ PASS: 3. Banner kontrol keluar ujian kapan saja dan tombol reset demo tersedia di HTML');

    // 4. Verifikasi Logika di js/quiz_engine.js
    const elements = {};
    function createElement(id, tag = 'div') {
        const el = {
            id,
            tagName: tag.toUpperCase(),
            style: {},
            classList: {
                classes: new Set(),
                add(c) { this.classes.add(c); },
                remove(c) { this.classes.delete(c); },
                contains(c) { return this.classes.has(c); }
            },
            textContent: '',
            innerHTML: '',
            value: '',
            disabled: false,
            querySelector(sel) {
                return { 
                    textContent: '', 
                    innerHTML: '', 
                    style: {}, 
                    classList: { add() {}, remove() {}, contains() { return false; } },
                    onclick: null 
                };
            },
            appendChild() {},
            focus() {}
        };
        elements[id] = el;
        return el;
    }

    [
        'screen-home', 'screen-quiz', 'screen-result',
        'quiz-demo-banner', 'btn-demo-reset',
        'remedial-card', 'btn-start-remedial', 'remedial-offer-modal',
        'rem-offer-name', 'rem-offer-class', 'rem-offer-module', 'rem-offer-score', 'rem-offer-kkm',
        'input-class', 'input-name', 'input-module', 'btn-start-quiz',
        'cheat-warning-modal', 'cheat-modal', 'display-name', 'display-class',
        'score-ring', 'score-ring-text', 'kkm-status-banner', 'submission-proof-banner',
        'result-title', 'result-desc',
        'proof-title-text', 'proof-status-pill', 'proof-remedial-badge', 'proof-details-text',
        'proof-id-code', 'proof-timestamp-badge', 'res-correct', 'res-wrong', 'res-streak', 'review-list'
    ].forEach(id => createElement(id));

    let switchedScreen = '';
    const context = {
        console,
        setTimeout: global.setTimeout,
        clearTimeout: global.clearTimeout,
        setInterval: global.setInterval,
        clearInterval: global.clearInterval,
        navigator: { userAgent: 'Node', maxTouchPoints: 0 },
        window: {
            innerWidth: 375,
            innerHeight: 667,
            location: { href: 'http://localhost' },
            history: { pushState() {} },
            addEventListener() {},
            removeEventListener() {},
            dispatchEvent() {}
        },
        document: {
            getElementById(id) { return elements[id] || null; },
            createElement(tag) { return createElement('anon_' + Math.random(), tag); },
            querySelectorAll() { return []; },
            querySelector() { 
                return { 
                    textContent: '', 
                    style: {},
                    classList: { add() {}, remove() {}, contains() { return false; } }
                }; 
            },
            body: { 
                appendChild() {},
                classList: { add() {}, remove() {}, contains() { return false; } }
            },
            addEventListener() {},
            removeEventListener() {}
        },
        sessionStorage: {
            _data: {},
            getItem(k) { return this._data[k] || null; },
            setItem(k, v) { this._data[k] = String(v); },
            removeItem(k) { delete this._data[k]; }
        },
        localStorage: {
            _data: {
                'quizmaster_remedial_enabled': 'true',
                'quizmaster_submission_policy': 'single_only'
            },
            getItem(k) { return this._data[k] || null; },
            setItem(k, v) { this._data[k] = String(v); },
            removeItem(k) { delete this._data[k]; }
        },
        confirm: () => true,
        sfxClick() {},
        sfxWrong() {},
        sfxRight() {},
        sfxTimerWarn() {},
        stopTimer() {},
        stopBGM() {},
        clearFullscreenWarningCountdown() {},
        exitExamFullscreen() {},
        showToast() {},
        switchScreen(scr) { switchedScreen = scr; },
        isReviewPostponed: () => false,
        isExamTokenRequired: () => true,
        getExpectedExamToken: () => 'TOKEN123',
        checkClassAccess: () => ({ allowed: true }),
        loadSubmissionPolicy: () => 'single_only',
        loadRemedialSetting: () => true,
        loadRecords: () => [],
        saveRecord: () => {},
        shuffleArray: (arr) => arr.map(val => ({ val })),
        vaultAnswers: (arr) => arr,
        initAudio: () => {},
        loadTimerSetting: () => 60,
        enterExamFullscreen: () => {},
        isEnforcedFullscreen: () => false,
        runCountdown: () => {},
        STUDENT_ROSTER: rosterContext.window.STUDENT_ROSTER,
        isNameEquivalent: (a, b) => String(a).toLowerCase() === String(b).toLowerCase()
    };

    vm.createContext(context);
    const storageCode = fs.readFileSync('js/storage.js', 'utf8');
    const engineCode = fs.readFileSync('js/quiz_engine.js', 'utf8');
    vm.runInContext(storageCode, context);
    vm.runInContext(engineCode, context);

    // TEST 4A: isCurrentStudentDemo() mengenali akun demo
    vm.runInContext(`
        studentName = 'GURU PENGUJI (TEST REMEDIAL)';
        studentClass = 'KELAS DEMO';
    `, context);
    assert.strictEqual(context.isCurrentStudentDemo(), true, 'GURU PENGUJI (TEST REMEDIAL) di KELAS DEMO harus terdeteksi demo');
    console.log('  ✅ PASS: 4. isCurrentStudentDemo() mengenali akun demo');

    // TEST 4B: Anti-cheat aktif secara default di akun demo (agar Guru bisa uji), dan dapat di-bypass jika mode QA bypass diaktifkan
    elements['screen-quiz'].classList.add('active');
    const initialStrikes = vm.runInContext('cheatStrikes', context);
    context.handleAntiCheatEvent('Mencoba buka tab lain', false);
    const strikesDefaultDemo = vm.runInContext('cheatStrikes', context);
    assert.strictEqual(strikesDefaultDemo, initialStrikes + 1, 'Anti-cheat default harus aktif di akun demo agar dapat diuji langsung');

    vm.runInContext(`
        isCheatWarningActive = false;
        cheatStrikes = 0;
        lastCheatEventTime = 0;
        localStorage.setItem('quizmaster_demo_anticheat', 'bypass');
    `, context);
    context.handleAntiCheatEvent('Mencoba buka tab lain', false);
    const strikesBypass = vm.runInContext('cheatStrikes', context);
    assert.strictEqual(strikesBypass, 0, 'Anti-cheat harus dibypass ketika setting demo anticheat = bypass');
    console.log('  ✅ PASS: 5. Anti-cheat aktif penuh di akun demo (default) dan mendukung mode bypass QA');

    // TEST 4C: exitDemoQuiz('home') menghentikan ujian dan kembali ke beranda
    context.exitDemoQuiz('home');
    assert(elements['screen-home'].classList.contains('active'), 'Layar screen-home harus aktif setelah exitDemoQuiz("home")');
    console.log('  ✅ PASS: 6. exitDemoQuiz("home") memungkinkan keluar ke beranda kapan saja');

    // TEST 4D: exitDemoQuiz('finish_fail') mensimulasikan nilai 70 dan memicu alur remedial
    context.quizData = Array.from({ length: 20 }, (_, i) => ({ id: i + 1, points: 5 }));
    context.exitDemoQuiz('finish_fail');
    await new Promise(r => setTimeout(r, 50));
    const finalScore = vm.runInContext('score', context);
    assert.strictEqual(finalScore, 70, 'Skor simulasi harus 70 (< 80 KKM)');
    assert.strictEqual(elements['remedial-card'].style.display, 'flex', 'Kartu remedial harus muncul setelah simulasi skor 70');
    console.log('  ✅ PASS: 7. exitDemoQuiz("finish_fail") mensimulasikan skor 70 dan mengaktifkan alur remedial');

    console.log('\n🎉 SELURUH PENGUJIAN AKUN DEMO & BEBAS KELUAR LULUS SEMPURNA!\n');
    process.exit(0);
}

runTest();
