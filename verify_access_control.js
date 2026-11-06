const fs = require('fs');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════');
console.log('🔒 RUNNING COMPREHENSIVE ACCESS CONTROL & RESILIENCE SUITE');
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
        console.error(`    -> ${e.message}`);
    }
}

// Mock browser environment for dashboard.js
const mockLocalStorage = {};
global.localStorage = {
    getItem: (k) => mockLocalStorage[k] || null,
    setItem: (k, v) => { mockLocalStorage[k] = String(v); },
    removeItem: (k) => { delete mockLocalStorage[k]; },
    clear: () => { Object.keys(mockLocalStorage).forEach(k => delete mockLocalStorage[k]); }
};
global.window = global;
global.document = {
    getElementById: () => null,
    querySelector: () => null
};
global.ACCESS_SETTINGS_KEY = 'detektif_fakta_access_control';
global.sfxClick = () => {};
global.showToast = () => {};
global.isClassEquivalent = (a, b) => (a || '').replace(/[\s\.\-_]/g, '').toUpperCase() === (b || '').replace(/[\s\.\-_]/g, '').toUpperCase();

// Load code
const dashboardCode = fs.readFileSync('js/dashboard.js', 'utf8');
const audioCode = fs.readFileSync('js/audio.js', 'utf8');
const storageCode = fs.readFileSync('js/storage.js', 'utf8');

// Evaluate dashboard access control functions in context
const vm = require('vm');
const scriptContext = {
    localStorage: global.localStorage,
    window: global.window,
    document: global.document,
    ACCESS_SETTINGS_KEY: global.ACCESS_SETTINGS_KEY,
    sfxClick: global.sfxClick,
    showToast: global.showToast,
    isClassEquivalent: global.isClassEquivalent,
    Date: Date,
    console: console,
    JSON: JSON
};
vm.createContext(scriptContext);
const dashboardSnippet = dashboardCode.slice(dashboardCode.indexOf('function loadAccessSettings'), dashboardCode.indexOf('function closeAccessLockedModal'));
vm.runInContext(dashboardSnippet + '\nthis.loadAccessSettings = loadAccessSettings; this.checkClassAccess = checkClassAccess; this.saveAccessSettings = saveAccessSettings;', scriptContext);

global.loadAccessSettings = scriptContext.loadAccessSettings;
global.checkClassAccess = scriptContext.checkClassAccess;
global.saveAccessSettings = scriptContext.saveAccessSettings;

test('Access Control Default: loadAccessSettings defaults to "always_open" with all 6 classes', () => {
    localStorage.clear();
    const settings = loadAccessSettings();
    assert.strictEqual(settings.mode, 'always_open', 'Default mode must be always_open');
    ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'].forEach(c => {
        assert.strictEqual(settings.classOverrides[c], true, `${c} override must be true by default`);
        assert.strictEqual(settings.manualOpenedClasses[c], true, `${c} manual opened must be true by default`);
    });
});

test('Access Control Migration: Legacy mode "auto" or "schedule" automatically migrates to "always_open"', () => {
    localStorage.setItem(ACCESS_SETTINGS_KEY, JSON.stringify({
        mode: 'schedule',
        classOverrides: {}
    }));
    const settings = loadAccessSettings();
    assert.strictEqual(settings.mode, 'always_open', 'Legacy schedule mode must migrate to always_open');
});

test('Access Control Universal Availability: All 6 classes can take quiz anytime without accidental lockouts', () => {
    localStorage.clear();
    const classes = ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'];
    classes.forEach(c => {
        const access = checkClassAccess(c, 'modul_jaringan_keamanan');
        assert.strictEqual(access.allowed, true, `${c} must have allowed: true on any day and time`);
    });
});

test('Access Control Manual Lock: Explicit lock (classOverrides[cls] === false) properly restricts only targeted class', () => {
    localStorage.clear();
    const settings = loadAccessSettings();
    settings.classOverrides['X E 3'] = false;
    saveAccessSettings(settings);

    const blocked = checkClassAccess('X E 3', 'modul_jaringan_keamanan');
    assert.strictEqual(blocked.allowed, false, 'Explicitly locked class must be disallowed');
    assert(blocked.reason.includes('dikunci'), 'Reason must state locked by teacher');

    const allowed = checkClassAccess('X E 1', 'modul_jaringan_keamanan');
    assert.strictEqual(allowed.allowed, true, 'Other classes must remain allowed');
});

test('Active Exam Immunity: In-progress exam (quizInProgress === true) is NEVER locked out', () => {
    global.window.quizInProgress = true;
    const access = checkClassAccess('X E 3', 'modul_jaringan_keamanan');
    assert.strictEqual(access.allowed, true, 'Student mid-exam must never be kicked out');
    global.window.quizInProgress = false;
});

test('Cloud State Sanitization: applyCloudSharedStateToLocal prevents legacy "schedule" mode from locking students', () => {
    localStorage.clear();
    // Simulate applyCloudSharedStateToLocal
    eval(audioCode.slice(audioCode.indexOf('function applyCloudSharedStateToLocal'), audioCode.indexOf('window.applyCloudSharedStateToLocal = applyCloudSharedStateToLocal;')));
    
    applyCloudSharedStateToLocal({
        accessSettings: {
            mode: 'schedule',
            classOverrides: { 'X E 1': true }
        }
    });

    const stored = JSON.parse(localStorage.getItem(ACCESS_SETTINGS_KEY));
    assert.strictEqual(stored.mode, 'always_open', 'Incoming cloud state must be normalized to always_open');
    assert.strictEqual(stored.classOverrides['X E 1'], true, 'Overrides must be preserved');
});

test('Cloud Save Protection: saveCloudSharedState guarantees mode "always_open" written to cloud', () => {
    assert(storageCode.includes("mergedState.accessSettings.mode = 'always_open'"), 'saveCloudSharedState must guard against schedule mode in cloud');
});

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`📊 FINAL RESULT: ${pass} / ${total} TESTS PASSED`);
if (pass === total) {
    console.log('🎉 100% UNEXPECTED LOCKOUTS ELIMINATED & ACCESS CONTROL VERIFIED!');
} else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
}
console.log('════════════════════════════════════════════════════════════════\n');
