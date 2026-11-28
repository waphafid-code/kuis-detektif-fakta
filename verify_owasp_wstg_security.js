// ============================================================
// 🛡️ REAL INTEGRATED RUNTIME & OWASP WSTG v4.2 (4.1 - 4.12) SECURITY TEST
// Loads the ACTUAL production JS modules together with real WebCrypto
// and audits static/server/cloud configs honestly (no faked passes).
// ============================================================
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vm = require('vm');
const crypto = require('crypto');

console.log('════════════════════════════════════════════════════════════════');
console.log('🔐 REAL INTEGRATED RUNTIME & OWASP WSTG v4.2 SECURITY VERIFICATION');
console.log('════════════════════════════════════════════════════════════════\n');

let pass = 0;
let fail = 0;
const findings = [];
const checks = [];

async function runCheck(section, name, fn) {
    try {
        const res = await fn();
        pass++;
        checks.push({ section, name, status: 'PASS', detail: res || '' });
        console.log(`  ✓ [PASS] [${section}] ${name}${res ? ' — ' + res : ''}`);
    } catch (e) {
        fail++;
        checks.push({ section, name, status: 'FAIL', detail: e.message });
        console.error(`  ✗ [FAIL] [${section}] ${name}\n    -> ${e.message}`);
    }
}

function recordFinding(section, severity, title, evidence) {
    findings.push({ section, severity, title, evidence });
    console.log(`  ⚠️ [FINDING - ${severity}] [${section}] ${title}\n     Evidence: ${evidence}`);
}

function createClassList(initial = []) {
    const set = new Set(initial);
    return {
        add: (...cls) => cls.forEach(c => set.add(c)),
        remove: (...cls) => cls.forEach(c => set.delete(c)),
        contains: (c) => set.has(c),
        toggle: (c, force) => {
            if (force === true) { set.add(c); return true; }
            if (force === false) { set.delete(c); return false; }
            return set.has(c) ? (set.delete(c), false) : (set.add(c), true);
        }
    };
}

function buildIntegratedAppSandbox() {
    const docListeners = {};
    const winListeners = {};
    const ls = new Map();
    const ss = new Map();
    const elements = new Map();

    const makeEl = (id, tag = 'DIV', classes = []) => {
        const el = {
            id,
            tagName: tag,
            dataset: {},
            value: '',
            textContent: '',
            innerHTML: '',
            disabled: false,
            checked: false,
            style: {},
            options: [],
            children: [],
            classList: createClassList(classes),
            appendChild(child) {
                this.children.push(child);
                if (tag === 'SELECT' && child.tagName === 'OPTION') this.options.push(child);
                return child;
            },
            remove() {},
            focus() {},
            click() {},
            closest() { return null; },
            getAttribute(k) { return this['data-' + k] || ''; },
            querySelector(sel) {
                if (sel === '#opt-custom-timer-val' || sel === '#opt-custom-cheat-tol') {
                    const targetId = sel.slice(1);
                    return this.options.find(o => o.id === targetId) || null;
                }
                if (sel === 'option[value="custom"]') {
                    return this.options.find(o => o.value === 'custom') || null;
                }
                return null;
            },
            insertBefore(node) { this.options.push(node); return node; },
            querySelectorAll() { return []; }
        };
        elements.set(id, el);
        return el;
    };

    const home = makeEl('screen-home', 'DIV', ['screen', 'active']);
    const quiz = makeEl('screen-quiz', 'DIV', ['screen']);
    const result = makeEl('screen-result', 'DIV', ['screen']);
    const teacher = makeEl('screen-teacher', 'DIV', ['screen']);
    const pinModal = makeEl('pin-modal', 'DIV');
    makeEl('cheat-warning-modal');
    makeEl('cheat-modal');
    makeEl('resume-modal');
    makeEl('cheat-warning-title');
    makeEl('cheat-warning-reason');
    makeEl('cheat-warning-chances');
    makeEl('cheat-approval-wait-box');
    makeEl('cheat-approval-status-text');
    makeEl('btn-resume-exam', 'BUTTON');
    makeEl('btn-check-teacher-approval', 'BUTTON');
    makeEl('btn-exit-locked-exam', 'BUTTON');
    makeEl('cheat-detected-reason');
    makeEl('exam-security-watermark');
    makeEl('fullscreen-countdown-box');
    makeEl('fullscreen-countdown-num');
    makeEl('display-name');
    makeEl('display-class');
    makeEl('dash-tbody');
    makeEl('input-class', 'SELECT');
    makeEl('input-name', 'SELECT');
    makeEl('input-module', 'SELECT');
    const timerSel = makeEl('setting-timer', 'SELECT');
    ['15', '20', '30', '45', '60', '90', '120', '0', 'custom'].forEach(v => {
        const opt = makeEl('opt-t-' + v, 'OPTION');
        opt.value = v;
        timerSel.appendChild(opt);
    });
    makeEl('input-custom-timer-value', 'INPUT');
    makeEl('input-custom-timer-unit', 'SELECT').value = 'detik';
    makeEl('setting-active-exam-module', 'SELECT');
    makeEl('custom-visible-modules-box');
    makeEl('custom-visible-modules-list');
    makeEl('teacher-approval-queue-list');
    makeEl('approval-queue-count-badge');

    const doc = {
        hidden: false,
        activeElement: null,
        body: { classList: createClassList(), appendChild() {} },
        documentElement: {},
        getElementById: (id) => elements.get(id) || makeEl(id),
        createElement: (tag) => makeEl('dyn_' + Math.random().toString(36).slice(2), tag.toUpperCase()),
        querySelectorAll: () => [],
        querySelector: () => null,
        addEventListener: (t, fn) => { (docListeners[t] ||= []).push(fn); }
    };

    const sandbox = {
        console,
        Math,
        JSON,
        Date,
        Promise,
        Set,
        Map,
        Array,
        Object,
        Number,
        String,
        Boolean,
        Error,
        TextEncoder,
        crypto: crypto.webcrypto,
        setTimeout,
        clearTimeout,
        setInterval: () => 1,
        clearInterval: () => {},
        fetch: () => Promise.resolve({ ok: false, json: async () => ({}) }),
        localStorage: {
            getItem: (k) => (ls.has(k) ? ls.get(k) : null),
            setItem: (k, v) => ls.set(k, String(v)),
            removeItem: (k) => ls.delete(k)
        },
        sessionStorage: {
            getItem: (k) => (ss.has(k) ? ss.get(k) : null),
            setItem: (k, v) => ss.set(k, String(v)),
            removeItem: (k) => ss.delete(k)
        },
        document: doc,
        navigator: {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
            maxTouchPoints: 0,
            clipboard: { writeText: () => Promise.resolve() },
            mediaDevices: { getDisplayMedia: () => Promise.resolve({}) }
        },
        screen: { availHeight: 900, height: 900 },
        history: { pushState() {} },
        isSecureContext: true,
        openPinModal: () => { pinModal.classList.add('active'); },
        closeModal: () => { pinModal.classList.remove('active'); }
    };
    sandbox.window = sandbox;
    sandbox.window.innerWidth = 1280;
    sandbox.window.innerHeight = 720;
    sandbox.window.outerWidth = 1280;
    sandbox.window.outerHeight = 720;
    sandbox.window.location = { href: 'http://localhost:5500/index.html', hostname: 'localhost' };
    sandbox.window.addEventListener = (t, fn) => { (winListeners[t] ||= []).push(fn); };

    const orderedScripts = [
        'js/default_records.js',
        'js/student_roster.js',
        'js/quiz_manager.js',
        'js/storage.js',
        'js/audio.js',
        'js/ai_studio.js',
        'js/dashboard.js',
        'js/quiz_engine.js'
    ];
    for (const file of orderedScripts) {
        const code = fs.readFileSync(path.join(__dirname, file), 'utf8');
        vm.runInNewContext(code, sandbox, { filename: file });
    }

    return {
        sandbox,
        doc,
        ls,
        ss,
        elements,
        emitDoc: (type, extra = {}) => {
            const state = { prevented: false, stopped: false };
            const ev = { preventDefault: () => { state.prevented = true; }, stopPropagation: () => { state.stopped = true; }, _state: state, ...extra };
            (docListeners[type] || []).forEach(fn => fn(ev));
            return ev;
        },
        emitWin: (type, extra = {}) => {
            const state = { prevented: false, stopped: false };
            const ev = { preventDefault: () => { state.prevented = true; }, stopPropagation: () => { state.stopped = true; }, _state: state, ...extra };
            (winListeners[type] || []).forEach(fn => fn(ev));
            return ev;
        }
    };
}

(async function main() {
    const app = buildIntegratedAppSandbox();
    const { sandbox, doc, elements } = app;

    // 4.4 / 4.5 Authentication & Authorization Bypass Checks
    await runCheck('4.4/4.5 Auth & Authz', 'Unauthenticated grantTeacherAccess() & switchScreen("teacher") are rejected', async () => {
        sandbox.sessionStorage.setItem('quizmaster_teacher_auth_token', 'forged_console_token');
        assert.strictEqual(sandbox.window.isTeacherAuthValid(), false, 'Forged token must be rejected');
        sandbox.window.switchScreen('teacher');
        assert(!elements.get('screen-teacher').classList.contains('active'), 'Teacher screen must NOT activate');
        assert(elements.get('pin-modal').classList.contains('active'), 'PIN modal must open instead');
        sandbox.window.grantTeacherAccess();
        assert(!elements.get('screen-teacher').classList.contains('active'), 'Direct grantTeacherAccess() call must be blocked');
        return 'Forged token & direct console bypass blocked';
    });

    await runCheck('4.4 Auth Token', 'Real WebCrypto signed token validates only with true PIN hash + session salt', async () => {
        const token = await vm.runInNewContext('generateSignedTeacherToken()', sandbox);
        sandbox.sessionStorage.setItem('quizmaster_teacher_auth_token', token);
        assert.strictEqual(sandbox.window.isTeacherAuthValid(), true);
        sandbox.window.grantTeacherAccess();
        assert(elements.get('screen-teacher').classList.contains('active'), 'Valid signed token unlocks Teacher Dashboard');
        return 'Signed token validated via WebCrypto SHA-256';
    });

    // 4.6 Session Tampering Integrity Check
    await runCheck('4.6 Session Management', 'Tampered active exam session fails computeSessionChecksum() integrity verification', async () => {
        elements.get('screen-quiz').classList.add('active');
        vm.runInNewContext(`
            studentName = 'SISWA UJI';
            studentClass = 'X E 1';
            score = 20;
            currentQ = 4;
            shuffledQuizOrder = [0,1,2,3,4];
            earnedPointsTotal = 20;
            totalPossiblePoints = 100;
            cheatStrikes = 2;
            isLockedForTeacherApproval = true;
            saveCurrentQuizSession();
        `, sandbox);
        const raw = sandbox.sessionStorage.getItem('detektif_active_session_v2');
        const parsed = JSON.parse(raw);
        assert.strictEqual(parsed._sig, vm.runInNewContext(`computeSessionChecksum(${JSON.stringify(parsed)})`, sandbox));
        // Student tampers score to 100 and resets cheatStrikes to 0
        parsed.score = 100;
        parsed.cheatStrikes = 0;
        sandbox.sessionStorage.setItem('detektif_active_session_v2', JSON.stringify(parsed));
        sandbox.localStorage.setItem('quizmaster_active_exam_session_backup', JSON.stringify(parsed));
        sandbox.window.checkUnfinishedSession();
        assert.strictEqual(sandbox.sessionStorage.getItem('detektif_active_session_v2'), null, 'Tampered session must be purged immediately');
        elements.get('screen-quiz').classList.remove('active');
        return 'Tampered score/strikes invalidated checksum and purged session';
    });

    // 4.7 Input Validation & Injection
    await runCheck('4.7 Input Validation', 'XSS escaping, CSV formula neutralization (CWE-1236) & server SQL parameterization verified', async () => {
        const xssOut = sandbox.window.escapeHtml('<img src=x onerror="alert(1)">');
        assert(!xssOut.includes('<') && !xssOut.includes('>'), 'HTML tags must be escaped');
        assert.strictEqual(sandbox.window.sanitizeSpreadsheetValue('=cmd|\'/C calc\'!A0'), '\'=cmd|\'/C calc\'!A0', 'Formula injection must be neutralized');
        const srv = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
        assert(srv.includes('VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'), 'MySQL insert uses parameterized placeholders');
        return 'escapeHtml + sanitizeSpreadsheetValue + parameterized SQL confirmed';
    });

    // 4.10 Business Logic & Anti-Cheat + Demo + Teacher Approval Gate + Custom Settings
    await runCheck('4.10 Business Logic', 'Custom timer, custom multi-module filter, Demo anti-cheat & Teacher Approval Gate execute cleanly', async () => {
        // Test custom timer
        elements.get('input-custom-timer-value').value = '47';
        elements.get('input-custom-timer-unit').value = 'detik';
        await sandbox.window.applyCustomQuizTimer();
        assert.strictEqual(sandbox.window.loadTimerSetting(), 47, 'Custom timer 47s must persist');

        // Test custom multi-module
        sandbox.localStorage.setItem('quizmaster_visible_exam_modules', JSON.stringify(['modul_hki_profesi_budaya', 'modul_etika_privasi_keamanan']));
        sandbox.localStorage.setItem('quizmaster_active_exam_module_mode', 'custom');
        await sandbox.window.initModulesCatalog();
        const modOpts = elements.get('input-module').options.map(o => o.value);
        assert.deepStrictEqual(modOpts, ['modul_hki_profesi_budaya', 'modul_etika_privasi_keamanan'], 'Student module picker must show ONLY teacher-checked modules');

        // Test Demo anti-cheat 3-strike -> lock -> teacher approve
        vm.runInNewContext(`
            studentName = 'MUHAMMAD HAFIDH (AKUN DEMO)';
            studentClass = 'KELAS DEMO';
            cheatStrikes = 0;
            isCheatingTriggered = false;
            isCheatWarningActive = false;
            isLockedForTeacherApproval = false;
            lastCheatEventTime = 0;
            quizData = vaultAnswers([{ id: 1, question: 'Q', options: ['A','B'], answer: 0, explanation: 'Rahasia' }], 'modul_hki_profesi_budaya');
            window.quizData = quizData;
        `, sandbox);
        assert.strictEqual(sandbox.window.quizData[0].answer, undefined, 'Answer key must be stripped from window.quizData');
        elements.get('screen-quiz').classList.add('active');

        const baseNow = sandbox.Date.now();
        let fakeNow = baseNow;
        sandbox.Date.now = () => fakeNow;

        app.emitDoc('copy');
        assert(elements.get('cheat-warning-modal').classList.contains('active'), 'Demo violation #1 (copy) opens warning');
        sandbox.window.resumeFromCheatWarning();
        fakeNow += 2000;

        app.emitWin('keydown', { key: 'PrintScreen', code: 'PrintScreen', keyCode: 44 });
        assert(elements.get('cheat-warning-modal').classList.contains('active'), 'Demo violation #2 (PrintScreen) opens warning');
        sandbox.window.resumeFromCheatWarning();
        fakeNow += 2000;

        app.emitDoc('contextmenu');
        assert.strictEqual(elements.get('btn-resume-exam').style.display, 'none', 'Violation #3 locks exam for Teacher approval');
        assert.strictEqual(elements.get('cheat-approval-wait-box').style.display, 'block');

        const key = sandbox.window.getCheatApprovalKey('MUHAMMAD HAFIDH (AKUN DEMO)', 'KELAS DEMO', 'modul_hki_profesi_budaya');
        await sandbox.window.approveStudentContinueQuiz(key, 'MUHAMMAD HAFIDH (AKUN DEMO)', 'KELAS DEMO', 'modul_hki_profesi_budaya');
        const unlocked = await sandbox.window.checkTeacherApprovalAndResume(true);
        assert.strictEqual(unlocked, true, 'Teacher approval must unlock locked Demo session');
        assert(!elements.get('cheat-warning-modal').classList.contains('active'), 'Lock modal must close after approval');
        return 'All 4 custom settings & Demo 3-strike lock/approve cycle verified';
    });

    // 4.11 Client-Side & DOM Security
    await runCheck('4.11 Client-Side Security', 'Reflection gimmick completely removed; answer vault & anti-copy guards active', async () => {
        const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        assert(!html.includes('id="student-reflection-card"'), 'Reflection gimmick card removed');
        assert.strictEqual(sandbox.window.submitStudentReflection, undefined, 'submitStudentReflection removed');
        assert.strictEqual(typeof sandbox.window.getAnswerFromVault, 'function');
        return 'Vault + anti-copy + anti-reflection verified in integrated runtime';
    });

    // ═══ HONEST OWASP WSTG SECURITY AUDIT CHECKS (4.1, 4.2, 4.4, 4.8, 4.9, 4.12) ═══
    console.log('\n── Honest OWASP WSTG Infrastructure & API Audit Findings ──');

    // 4.1 & 4.2 Static Asset Exposure
    const srvCode = fs.readFileSync(path.join(__dirname, 'server.js'), 'utf8');
    if (srvCode.includes('express.static(path.join(__dirname))')) {
        recordFinding('4.1/4.2 Config & Info Gathering', 'HIGH',
            'Unrestricted static root exposes answer-key JSONs & backend source',
            'server.js serves __dirname directly (and GitHub Pages/python static server serves bank_soal/*.json containing raw answer keys, server.js, and DB SQL/rules files).');
    }

    if (srvCode.includes('app.use(cors())')) {
        recordFinding('4.2 Deployment Config', 'MEDIUM',
            'Wildcard CORS enabled in Express server.js',
            'server.js line 11 uses app.use(cors()) allowing any origin to call /api/scores.');
    }

    // 4.4 & 4.9 Weak Cryptography / Offline 4-digit PIN brute-force proof
    const pinHashMatch = fs.readFileSync(path.join(__dirname, 'js/dashboard.js'), 'utf8').match(/TEACHER_PIN_HASH\s*=\s*'([a-f0-9]+)'/);
    if (pinHashMatch) {
        const targetHash = pinHashMatch[1];
        const t0 = Date.now();
        let cracked = null;
        for (let p = 0; p <= 9999; p++) {
            const cand = String(p).padStart(4, '0');
            const h = crypto.createHash('sha256').update(cand).digest('hex');
            if (h === targetHash) { cracked = cand; break; }
        }
        const elapsedMs = Date.now() - t0;
        if (cracked) {
            recordFinding('4.4/4.9 Weak Cryptography', 'HIGH',
                '4-digit Teacher PIN SHA-256 hash is trivially brute-forced offline',
                `Tested real 0000..9999 SHA-256 loop in Node: cracked offline in ${elapsedMs}ms without knowing salt (client-side SPA limitation + server.js also defaults PIN_GURU to "2543").`);
        }
    }

    // 4.8 Error Handling
    if (srvCode.includes('res.status(500).json({ error: err.message })')) {
        recordFinding('4.8 Error Handling', 'MEDIUM',
            'Raw database error messages returned to API clients',
            'server.js returns err.message on 500 responses in /api/scores and /api/settings.');
    }

    // 4.5 & 4.12 API & Cloud Database Authorization
    const fsRules = fs.readFileSync(path.join(__dirname, 'firestore.rules'), 'utf8');
    if (fsRules.includes('allow read, create: if true') && fsRules.includes('allow update: if true') && fsRules.includes('allow delete: if true')) {
        recordFinding('4.5/4.12 Cloud Firestore API', 'CRITICAL',
            'Firestore rules allow unauthenticated public read/create/update/delete',
            'firestore.rules allows read/create, update, and delete with condition "if true" on /quiz_results/{document=**}.');
    }

    const rtdbRules = fs.readFileSync(path.join(__dirname, 'database.rules.json'), 'utf8');
    if (rtdbRules.includes('".write": true')) {
        recordFinding('4.5/4.12 Firebase RTDB API', 'CRITICAL',
            'Firebase RTDB allows unauthenticated writes and record deletions',
            'database.rules.json sets ".read": true and ".write": true on quiz_results/$record_id.');
    }

    const rlsSql = fs.readFileSync(path.join(__dirname, 'supabase_rls_setup.sql'), 'utf8');
    if (rlsSql.includes('FOR UPDATE') && rlsSql.includes('TO authenticated') && srvCode.includes("app.get('/api/scores', async")) {
        recordFinding('4.12 Express Local API', 'HIGH',
            'Express GET/POST /api/scores endpoints have no authentication or server-side grading',
            'server.js allows unauthenticated GET /api/scores (exposes all student rows) and POST /api/scores (trusts client-submitted score). Supabase RLS blocks anon UPDATE/DELETE (note: dashboard saveCloudSharedState PATCH uses anon key).');
    }

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log(`📊 REAL INTEGRATED CHECKS: ${pass} PASSED, ${fail} FAILED | OWASP OPEN FINDINGS: ${findings.length}`);
    console.log('════════════════════════════════════════════════════════════════\n');

    if (fail > 0) process.exit(1);
})();
