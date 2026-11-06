// ============================================================
// 🔒 VERIFICATION SUITE: MODULE ISOLATION & RELEASE READINESS
// ============================================================
const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const quizManagerJs = fs.readFileSync(path.join(__dirname, 'js/quiz_manager.js'), 'utf8');
const aiStudioJs = fs.readFileSync(path.join(__dirname, 'js/ai_studio.js'), 'utf8');
const dashboardJs = fs.readFileSync(path.join(__dirname, 'js/dashboard.js'), 'utf8');
const audioJs = fs.readFileSync(path.join(__dirname, 'js/audio.js'), 'utf8');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✓ [PASS] Test ${totalTests}: ${testName}`);
    } else {
        console.error(`  ✗ [FAIL] Test ${totalTests}: ${testName}`);
    }
}

console.log('════════════════════════════════════════════════════════════════');
console.log('🔒 RUNNING MODULE ISOLATION & RELEASE READINESS TEST SUITE');
console.log('════════════════════════════════════════════════════════════════\n');

// Mock DOM & Storage environment
const mockLocalStorage = {};
const mockSessionStorage = {};

const localStorage = {
    getItem: (k) => (k in mockLocalStorage ? mockLocalStorage[k] : null),
    setItem: (k, v) => { mockLocalStorage[k] = String(v); },
    removeItem: (k) => { delete mockLocalStorage[k]; },
    clear: () => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }
};

const sessionStorage = {
    getItem: (k) => (k in mockSessionStorage ? mockSessionStorage[k] : null),
    setItem: (k, v) => { mockSessionStorage[k] = String(v); },
    removeItem: (k) => { delete mockSessionStorage[k]; },
    clear: () => { Object.keys(mockSessionStorage).forEach(k => delete mockSessionStorage[k]); }
};

function createMockElement(id, tagName = 'div') {
    const el = {
        id,
        tagName: tagName.toUpperCase(),
        value: '',
        _innerHTML: '',
        textContent: '',
        style: {},
        classList: {
            classes: new Set(),
            add(c) { this.classes.add(c); },
            remove(c) { this.classes.delete(c); },
            toggle(c, force) {
                if (force === undefined) {
                    this.classes.has(c) ? this.classes.delete(c) : this.classes.add(c);
                } else if (force) {
                    this.classes.add(c);
                } else {
                    this.classes.delete(c);
                }
            },
            contains(c) { return this.classes.has(c); }
        },
        children: [],
        appendChild(child) {
            this.children.push(child);
            return child;
        },
        querySelector: () => null,
        querySelectorAll: () => []
    };
    Object.defineProperty(el, 'innerHTML', {
        get() { return this._innerHTML; },
        set(val) {
            this._innerHTML = val;
            if (val === '') this.children = [];
        }
    });
    return el;
}

const mockElements = {
    'input-module': createMockElement('input-module', 'select'),
    'filter-module': createMockElement('filter-module', 'select'),
    'setting-active-exam-module': createMockElement('setting-active-exam-module', 'select'),
    'home-module-badge': createMockElement('home-module-badge', 'span'),
    'home-module-desc': createMockElement('home-module-desc', 'div'),
    'active-module-saved-msg': createMockElement('active-module-saved-msg', 'span'),
    'btn-apply-student-module': createMockElement('btn-apply-student-module', 'button'),
    'bank-modules-grid': createMockElement('bank-modules-grid', 'div'),
    'btn-mod-filter-all': createMockElement('btn-mod-filter-all', 'button'),
    'btn-mod-filter-jaringan': createMockElement('btn-mod-filter-jaringan', 'button'),
    'btn-mod-filter-fakta': createMockElement('btn-mod-filter-fakta', 'button'),
    'active-module-indicator-text': createMockElement('active-module-indicator-text', 'div')
};

const document = {
    getElementById: (id) => mockElements[id] || null,
    createElement: (tag) => {
        const el = createMockElement('', tag);
        if (tag.toLowerCase() === 'option') {
            el.selected = false;
        }
        return el;
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {}
};

const window = {
    localStorage,
    sessionStorage,
    document,
    showToast: () => {},
    sfxClick: () => {},
    sfxCorrect: () => {},
    addEventListener: () => {},
    removeEventListener: () => {}
};

// Evaluate scripts in sandbox
const sandbox = {
    window,
    document,
    localStorage,
    sessionStorage,
    console,
    setTimeout: (fn) => fn(),
    showToast: () => {},
    sfxClick: () => {},
    sfxCorrect: () => {},
    loadRecords: () => [],
    loadSubmissionPolicy: () => 'single_only',
    updateAccessControlUI: () => {},
    saveCloudSharedState: () => Promise.resolve(true),
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({ questions: [] }) })
};

// 1. Load QuizManager
const vm = require('vm');
vm.createContext(sandbox);

vm.runInContext(quizManagerJs, sandbox);
vm.runInContext(aiStudioJs, sandbox);
vm.runInContext(dashboardJs, sandbox);

// TEST 1: HTML Structure verification
assert(
    indexHtml.includes('id="setting-active-exam-module"') &&
    indexHtml.includes('id="btn-apply-student-module"'),
    'HTML contains setting-active-exam-module and btn-apply-student-module controls'
);

// TEST 2: Canonical modules order puts Penilaian Harian (Jaringan) as primary
(async () => {
    const modules = await sandbox.window.QuizManager.getAllModules();
    assert(
        modules[0].id === 'modul_jaringan_keamanan' && modules[1].id === 'modul_detektif_fakta',
        'Canonical module order prioritizes Penilaian Harian: Jaringan & Keamanan at index 0'
    );

    // TEST 3: Default active exam module is modul_jaringan_keamanan
    sandbox.localStorage.clear();
    const defaultMode = sandbox.window.loadActiveExamModuleSetting();
    assert(
        defaultMode === 'modul_jaringan_keamanan',
        'Default active exam module setting is modul_jaringan_keamanan'
    );

    // TEST 4: When locked to modul_jaringan_keamanan, input-module has ONLY 1 option
    await sandbox.window.initModulesCatalog();
    const homeSel = mockElements['input-module'];
    const options = homeSel.children;
    assert(
        options.length === 1 && options[0].value === 'modul_jaringan_keamanan',
        'When active mode is modul_jaringan_keamanan, input-module renders EXACTLY 1 option (Modul Jaringan)'
    );

    // TEST 5: Repeated calls to initModulesCatalog NEVER revert to detektif_fakta
    await sandbox.window.initModulesCatalog();
    await sandbox.window.initModulesCatalog();
    assert(
        homeSel.children.length === 1 &&
        homeSel.children[0].value === 'modul_jaringan_keamanan' &&
        sandbox.window.QuizManager.getActiveModuleId() === 'modul_jaringan_keamanan',
        'Repeated initModulesCatalog calls NEVER revert back to detektif_fakta'
    );

    // TEST 6: When teacher sets active module to "all", input-module renders all available modules
    sandbox.window.saveActiveExamModuleSetting('all');
    await sandbox.window.initModulesCatalog();
    assert(
        homeSel.children.length >= 2 &&
        homeSel.children.some(o => o.value === 'modul_jaringan_keamanan') &&
        homeSel.children.some(o => o.value === 'modul_detektif_fakta'),
        'When mode is set to "all", input-module renders both modules freely'
    );

    // TEST 7: When teacher sets active module to "modul_detektif_fakta", input-module renders ONLY detektif_fakta
    sandbox.window.saveActiveExamModuleSetting('modul_detektif_fakta');
    await sandbox.window.initModulesCatalog();
    assert(
        homeSel.children.length === 1 && homeSel.children[0].value === 'modul_detektif_fakta',
        'When mode is set to modul_detektif_fakta, input-module renders EXACTLY 1 option (Detektif Fakta)'
    );

    // TEST 8: Teacher dashboard selectModuleSegment persists to localStorage and does not reset to all
    sandbox.window.selectModuleSegment('modul_jaringan_keamanan');
    assert(
        sandbox.localStorage.getItem('quizmaster_dashboard_module_filter') === 'modul_jaringan_keamanan' &&
        sandbox.window.currentDashboardModuleFilter === 'modul_jaringan_keamanan',
        'selectModuleSegment persists filter to localStorage quizmaster_dashboard_module_filter'
    );

    // TEST 9: Bank Soal setModuleAsActive locks active exam module
    await sandbox.window.setModuleAsActive('modul_jaringan_keamanan');
    assert(
        sandbox.window.loadActiveExamModuleSetting() === 'modul_jaringan_keamanan' &&
        homeSel.children.length === 1 &&
        homeSel.children[0].value === 'modul_jaringan_keamanan',
        'setModuleAsActive in Bank Soal successfully locks the module for students without reverting'
    );

    // TEST 10: Audio Cloud Shared State sync applies activeExamModuleMode cleanly
    // Mock applyCloudSharedStateToLocal from audio.js
    vm.runInContext(audioJs, sandbox);
    sandbox.window.applyCloudSharedStateToLocal({
        activeExamModuleMode: 'modul_jaringan_keamanan',
        activeModuleId: 'modul_jaringan_keamanan'
    });
    assert(
        sandbox.localStorage.getItem('quizmaster_active_exam_module_mode') === 'modul_jaringan_keamanan' &&
        homeSel.children.length === 1 &&
        homeSel.children[0].value === 'modul_jaringan_keamanan',
        'applyCloudSharedStateToLocal applies activeExamModuleMode and keeps exactly 1 option on student screens'
    );

    console.log('\n════════════════════════════════════════════════════════════════');
    console.log(`📊 FINAL RESULT: ${passedTests} / ${totalTests} TESTS PASSED`);
    if (passedTests === totalTests) {
        console.log('🎉 100% MODULE ISOLATION & RELEASE READINESS VERIFIED!');
    } else {
        console.error('❌ SOME TESTS FAILED');
        process.exit(1);
    }
    console.log('════════════════════════════════════════════════════════════════\n');
})();
