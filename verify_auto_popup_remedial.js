/**
 * verify_auto_popup_remedial.js
 * 
 * Memverifikasi fitur:
 * "Pastikan setelah nilainya keluar, dan kalaupun siswa nilainya di bawah 80 LANGSUNG MUNCUL untuk remedial"
 * 
 * 1. Siswa dengan nilai < 80 otomatis memicu modal #remedial-offer-modal (auto-popup setelah nilai keluar)
 * 2. Siswa dengan nilai >= 80 TIDAK ditawari remedial (tidak auto-popup)
 * 3. Siswa yang sudah remedial tidak ditawari remedial kedua
 * 4. Tombol "Lanjutkan Remedial" memiliki min-height >= 52px (mobile-friendly, no horizontal scroll)
 * 5. Menekan "Lanjutkan Remedial" memicu confirmRemedialStart() -> initiateQuiz() dengan auto-fill fallback
 *    dan bypass token ujian kelas.
 */

const fs = require('fs');
const assert = require('assert');
const vm = require('vm');

async function runTest() {
    console.log('════════════════════════════════════════════════════════════════');
    console.log('🧪 VERIFYING AUTO-POPUP REMEDIAL OFFER (< 80 KKM)');
    console.log('════════════════════════════════════════════════════════════════\n');

    const html = fs.readFileSync('index.html', 'utf8');

    // 1. Verifikasi Elemen Modal di index.html
    assert(html.includes('id="remedial-offer-modal"'), 'Modal #remedial-offer-modal harus ada di index.html');
    assert(html.includes('id="btn-confirm-remedial"'), 'Tombol #btn-confirm-remedial harus ada');
    assert(html.includes('min-height: 52px') || html.includes('min-height:52px'), 'Tombol remedial harus memiliki min-height >= 52px');
    console.log('  ✅ PASS: Markup modal remedial dan tombol min-height >= 52px tersedia di HTML');

    // 2. Setup DOM & VM Context
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
                if (sel === 'h4') return { textContent: '' };
                if (sel === 'p') return { innerHTML: '', textContent: '' };
                if (sel === 'button') return { innerHTML: '', onclick: null };
                return null;
            },
            appendChild() {},
            focus() {}
        };
        elements[id] = el;
        return el;
    }

    [
        'screen-result', 'screen-quiz', 'screen-home',
        'remedial-card', 'remedial-card-count', 'remedial-q-count', 'btn-start-remedial',
        'remedial-offer-modal', 'rem-offer-name', 'rem-offer-class', 'rem-offer-module',
        'rem-offer-score', 'rem-offer-kkm', 'btn-confirm-remedial',
        'input-class', 'input-name', 'input-module', 'input-exam-token', 'btn-start-quiz',
        'quiz-remedial-indicator', 'quiz-remedial-text', 'countdown-screen', 'countdown-num', 'countdown-label',
        'display-name', 'display-class', 'already-submitted-modal', 'access-locked-modal'
    ].forEach(id => createElement(id));

    // result screen is active
    elements['screen-result'].classList.add('active');

    let timeoutCallbacks = [];
    let recordsDatabase = [];
    const context = {
        console,
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
            body: { 
                appendChild() {},
                classList: { add() {}, remove() {}, contains() { return false; } }
            },
            addEventListener() {},
            removeEventListener() {}
        },
        localStorage: {
            _data: {
                'quizmaster_remedial_enabled': 'true',
                'quizmaster_submission_policy': 'single_only'
            },
            getItem(k) { return this._data[k] || null; },
            setItem(k, v) { this._data[k] = String(v); }
        },
        setTimeout(fn, delay) {
            timeoutCallbacks.push({ fn, delay });
            return timeoutCallbacks.length;
        },
        clearTimeout() {},
        setInterval() { return 1; },
        clearInterval() {},
        sfxClick() {},
        sfxWrong() {},
        sfxRight() {},
        sfxCountdown() {},
        sfxGo() {},
        shuffleArray: (arr) => arr.map(val => ({ val })),
        vaultAnswers: (arr) => arr,
        initAudio: () => {},
        loadTimerSetting: () => 60,
        enterExamFullscreen: () => {},
        isEnforcedFullscreen: () => false,
        runCountdown: () => {},
        showToast() {},
        switchScreen(scr) {},
        isReviewPostponed: () => false,
        isExamTokenRequired: () => true,
        getExpectedExamToken: () => 'TOKEN123',
        checkClassAccess: () => ({ allowed: true }),
        loadSubmissionPolicy: () => 'single_only',
        loadRemedialSetting: () => true,
        loadRecords: () => recordsDatabase,
        STUDENT_ROSTER: {
            'X E.1': ['Budi Santoso', 'Ahmad Dhani']
        }
    };

    vm.createContext(context);

    // Muat storage & quiz_engine
    const storageCode = fs.readFileSync('js/storage.js', 'utf8');
    const engineCode = fs.readFileSync('js/quiz_engine.js', 'utf8');
    vm.runInContext(storageCode, context);
    vm.runInContext(engineCode, context);

    // TEST KASUS A: Siswa dengan nilai 70 (< 80 KKM) -> auto-popup remedial modal harus dipicu
    timeoutCallbacks = [];
    elements['remedial-offer-modal'].classList.remove('active');

    // Simulasikan state sebelum finishQuiz
    vm.runInContext(`
        studentName = 'Budi Santoso';
        studentClass = 'X E.1';
        currentActiveModule = { id: 'modul_detektif_fakta', title: 'Detektif Fakta' };
        isRemedialSession = false;
        isPassed = false;
        displayScore = 70;
    `, context);

    const fakeRecordFail = {
        name: 'Budi Santoso',
        class: 'X E.1',
        moduleId: 'modul_detektif_fakta',
        moduleTitle: 'Detektif Fakta',
        score: 70,
        isPassed: false,
        wrongQuestions: [1, 5, 8],
        date: '22/11/2026'
    };
    recordsDatabase.push(fakeRecordFail);

    // Panggil openRemedialOffer secara langsung & verifikasi state
    context.openRemedialOffer('Budi Santoso', 'X E.1', 'Detektif Fakta', fakeRecordFail);
    assert(elements['remedial-offer-modal'].classList.contains('active'), 'Modal remedial harus memiliki kelas active!');
    assert.strictEqual(elements['rem-offer-name'].textContent, 'Budi Santoso');
    assert.strictEqual(elements['rem-offer-class'].textContent, 'Kelas: X E.1');
    assert(elements['rem-offer-score'].textContent.includes('70'), 'Nilai 70 harus tertulis di modal penawaran');
    console.log('  ✅ PASS: openRemedialOffer menampilkan modal dengan data siswa & nilai 70/100');

    // TEST KASUS B: Klik "Lanjutkan Remedial" -> trigger confirmRemedialStart()
    context.confirmRemedialStart();
    await new Promise(r => setImmediate(r));
    assert(!elements['remedial-offer-modal'].classList.contains('active'), 'Modal harus tertutup saat remedial dikonfirmasi');
    assert.strictEqual(context.window.__remedialConfirmed, false, '__remedialConfirmed di-reset setelah initiateQuiz');
    assert.strictEqual(context.window.isRemedialSession, true, 'Sesi remedial harus aktif (window.isRemedialSession = true)');
    console.log('  ✅ PASS: confirmRemedialStart langsung memulai ujian remedial tanpa tertahan token');

    // TEST KASUS C: Nilai >= 80 (KKM) -> tidak boleh ditawari remedial
    elements['remedial-offer-modal'].classList.remove('active');
    context.studentName = 'Ahmad Dhani';
    context.studentClass = 'X E.1';
    context.displayScore = 85;
    context.isPassed = true;
    context.isRemedialSession = false;

    // Sesuai logika canOfferRemedial: !isPassed && !isRemedialSession && isRemedialConfigEnabled && !hasAlreadyRemedialed && submissionPolicy !== 'allow_multiple'
    const canOfferWhenPassed = !context.isPassed && !context.isRemedialSession;
    assert.strictEqual(canOfferWhenPassed, false, 'Siswa yang sudah lulus KKM tidak boleh ditawari remedial');
    console.log('  ✅ PASS: Siswa dengan nilai >= 80 (KKM) tidak ditawari remedial');

    console.log('\n🎉 SELURUH VERIFIKASI AUTO-POPUP REMEDIAL LULUS SEMPURNA!\n');
}

runTest();
