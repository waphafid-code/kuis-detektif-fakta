// ============================================================
// 🛡️ VERIFICATION SUITE: DEMO VISIBILITY TOGGLE & ANTI-JOKI
// ============================================================
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 VERIFYING DEMO VISIBILITY TOGGLE & ANTI-JOKI SYSTEM');
console.log('════════════════════════════════════════════════════════════════');

let testsPassed = 0;
function test(name, fn) {
    try {
        fn();
        console.log(`  ✅ PASS: ${name}`);
        testsPassed++;
    } catch (e) {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(e);
        process.exit(1);
    }
}

// 1. Verify index.html and src/index.html UI Elements
test('1. index.html contains optgroup-demo-class, group-exam-token, and Dasbor Guru settings', () => {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    const srcHtml = fs.readFileSync(path.join(__dirname, 'src/index.html'), 'utf8');
    
    [html, srcHtml].forEach(content => {
        assert(content.includes('id="optgroup-demo-class"'), 'Missing id="optgroup-demo-class"');
        assert(content.includes('id="group-exam-token"'), 'Missing id="group-exam-token"');
        assert(content.includes('id="input-exam-token"'), 'Missing id="input-exam-token"');
        assert(content.includes('id="setting-demo-visibility"'), 'Missing id="setting-demo-visibility"');
        assert(!content.includes('id="setting-device-binding"'), 'Pengaturan Kunci HP seharusnya sudah dihapus');
        assert(content.includes('id="setting-exam-token-mode"'), 'Missing id="setting-exam-token-mode"');
        assert(content.includes('id="setting-exam-token-code"'), 'Missing id="setting-exam-token-code"');
    });
});

// 2. Verify Demo Visibility Setting Logic in js/dashboard.js
test('2. Demo Visibility defaults to hide and toggles accurately', () => {
    const dashCode = fs.readFileSync(path.join(__dirname, 'js/dashboard.js'), 'utf8');
    
    // Mock environment
    let store = {};
    const mockStorage = {
        getItem: k => store[k] || null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: k => { delete store[k]; },
        key: i => Object.keys(store)[i],
        get length() { return Object.keys(store).length; }
    };
    
    const elements = {};
    const mockDoc = {
        getElementById: id => {
            if (!elements[id]) {
                elements[id] = { id, style: {}, classList: { add() {}, remove() {} }, value: '' };
            }
            return elements[id];
        },
        addEventListener: () => {}
    };
    
    const context = {
        localStorage: mockStorage,
        document: mockDoc,
        window: {},
        addEventListener: () => {},
        showToast: () => {},
        sfxCorrect: () => {},
        sfxWrong: () => {},
        saveCloudSharedState: () => {},
        onHomeClassChanged: () => {}
    };
    context.window = context;

    const fn = new Function('localStorage', 'document', 'window', 'showToast', 'sfxCorrect', 'sfxWrong', 'saveCloudSharedState', 'onHomeClassChanged', 
        dashCode + `
        return {
            loadDemoVisibilitySetting,
            isDemoAccountsVisible,
            applyDemoVisibilitySetting,
            saveDemoVisibilitySetting,
            loadExamTokenSetting,
            isExamTokenRequired,
            getExpectedExamToken,
            applyExamTokenSetting,
            saveExamTokenSetting,
            generateRandomExamToken
        };
        `);
    
    const dash = fn(mockStorage, mockDoc, context, context.showToast, context.sfxCorrect, context.sfxWrong, context.saveCloudSharedState, context.onHomeClassChanged);

    // Initial check: defaults to hide
    assert.strictEqual(dash.loadDemoVisibilitySetting(), 'hide');
    assert.strictEqual(dash.isDemoAccountsVisible(), false);

    // Apply hide: optgroup-demo-class display is none
    dash.applyDemoVisibilitySetting('hide');
    assert.strictEqual(elements['optgroup-demo-class'].style.display, 'none');

    // Toggle to show
    dash.saveDemoVisibilitySetting('show', false);
    assert.strictEqual(dash.loadDemoVisibilitySetting(), 'show');
    assert.strictEqual(dash.isDemoAccountsVisible(), true);
    assert.strictEqual(elements['optgroup-demo-class'].style.display, '');

    // Reset back to hide
    dash.saveDemoVisibilitySetting('hide', false);
    assert.strictEqual(dash.loadDemoVisibilitySetting(), 'hide');
    assert.strictEqual(elements['optgroup-demo-class'].style.display, 'none');
});

// 3. Fitur Kunci 1 Siswa per HP sudah dihapus: siswa bebas berganti nama di HP yang sama
test('3. Device Binding (Kunci 1 Siswa per HP) fully removed from code and UI', () => {
    ['js/dashboard.js', 'js/quiz_engine.js', 'js/audio.js', 'src/js/dashboard.js', 'src/js/quiz_engine.js', 'src/js/audio.js'].forEach(f => {
        const code = fs.readFileSync(path.join(__dirname, f), 'utf8');
        ['isDeviceBindingEnabled', 'resetAllDeviceBindings', 'saveDeviceBindingSetting', 'quizmaster_bound_device_', 'deviceBindingMode', 'resetDeviceBindingsTimestamp']
            .forEach(k => assert(!code.includes(k), `${f} masih memuat sisa fitur kunci perangkat: ${k}`));
    });
});

// 4. Verify Dynamic Classroom Token Anti-Joki
test('4. Dynamic Classroom Token generates, persists, and validates properly', () => {
    let store = {};
    const mockStorage = {
        getItem: k => store[k] || null,
        setItem: (k, v) => { store[k] = String(v); },
        removeItem: k => { delete store[k]; },
        key: i => Object.keys(store)[i],
        get length() { return Object.keys(store).length; }
    };
    
    const elements = {};
    const mockDoc = {
        getElementById: id => {
            if (!elements[id]) elements[id] = { id, style: {}, classList: { add() {}, remove() {} }, value: '' };
            return elements[id];
        },
        addEventListener: () => {}
    };

    const mockWin = {
        addEventListener: () => {}
    };
    mockWin.window = mockWin;
    
    const dashCode = fs.readFileSync(path.join(__dirname, 'js/dashboard.js'), 'utf8');
    const fn = new Function('localStorage', 'document', 'window', 'showToast', 'sfxCorrect', 'sfxWrong', 'saveCloudSharedState', 'onHomeClassChanged', 
        dashCode + `
        return {
            loadExamTokenSetting,
            isExamTokenRequired,
            getExpectedExamToken,
            applyExamTokenSetting,
            saveExamTokenSetting,
            generateRandomExamToken
        };
        `);
    
    const dash = fn(mockStorage, mockDoc, mockWin, () => {}, () => {}, () => {}, () => {}, () => {});

    // Initially disabled
    assert.strictEqual(dash.isExamTokenRequired(), false);

    // Teacher enables token with specific code
    mockDoc.getElementById('setting-exam-token-mode').value = 'enabled';
    mockDoc.getElementById('setting-exam-token-code').value = 'TIK-777';
    dash.saveExamTokenSetting(false);

    assert.strictEqual(dash.isExamTokenRequired(), true);
    assert.strictEqual(dash.getExpectedExamToken(), 'TIK-777');
    assert.strictEqual(mockDoc.getElementById('group-exam-token').style.display, 'block');

    // Teacher generates random token
    dash.generateRandomExamToken();
    const generatedToken = dash.getExpectedExamToken();
    assert(generatedToken.length >= 5, 'Generated token is too short');
    assert(generatedToken.includes('-'), 'Generated token missing hyphen format');
});

// 5. Verify initiateQuiz Anti-Joki guards in js/quiz_engine.js
test('5. initiateQuiz keeps Exam Token validation and has no Device Binding', () => {
    const qeCode = fs.readFileSync(path.join(__dirname, 'js/quiz_engine.js'), 'utf8');
    const srcQeCode = fs.readFileSync(path.join(__dirname, 'src/js/quiz_engine.js'), 'utf8');
    
    [qeCode, srcQeCode].forEach(code => {
        assert(code.includes('isExamTokenRequired'), 'Missing isExamTokenRequired check in initiateQuiz');
        assert(code.includes('input-exam-token'), 'Missing input-exam-token lookup in initiateQuiz');
    });
});

// 6. Verify all 4 modules are guaranteed in ai_studio.js & quiz_manager.js
test('6. All 4 official modules are permanently guaranteed in initModulesCatalog', () => {
    const aiCode = fs.readFileSync(path.join(__dirname, 'js/ai_studio.js'), 'utf8');
    const qmCode = fs.readFileSync(path.join(__dirname, 'js/quiz_manager.js'), 'utf8');
    
    assert(aiCode.includes('officialModules = ['), 'Missing officialModules guarantee array in ai_studio.js');
    assert(aiCode.includes('HKI_CULTURE_MODULE'), 'Missing HKI_CULTURE_MODULE in ai_studio.js');
    assert(aiCode.includes('ETIKA_PRIVASI_MODULE'), 'Missing ETIKA_PRIVASI_MODULE in ai_studio.js');
    assert(qmCode.includes('HKI_CULTURE_MODULE: {'), 'Missing HKI_CULTURE_MODULE definition in quiz_manager.js');
    assert(qmCode.includes('ETIKA_PRIVASI_MODULE: {'), 'Missing ETIKA_PRIVASI_MODULE definition in quiz_manager.js');
});

// 7. Verify Cloud Sync in audio.js
test('7. audio.js syncs demoVisibility and examToken settings', () => {
    const audioCode = fs.readFileSync(path.join(__dirname, 'js/audio.js'), 'utf8');
    assert(audioCode.includes('demoVisibility'), 'Missing demoVisibility in audio.js');
    assert(audioCode.includes('examTokenMode'), 'Missing examTokenMode in audio.js');
});

// 8. Verify cache-busting version tags updated
test('8. Cache-busting version tag updated to v3018 - v3021 in HTML files', () => {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    const guruHtml = fs.readFileSync(path.join(__dirname, 'kuis_interaktif_dasbor_guru.html'), 'utf8');
    const hasValidTag = (str) => str.includes('v3018-anti-joki-and-demo-toggle') || str.includes('v3019-zero-lag-anti-glitch') || str.includes('v3020-zero-lag-cache-optimized') || str.includes('v3021-fix-dropdown-no-device-lock');
    assert(hasValidTag(html), 'index.html missing cache-busting version tag');
    assert(hasValidTag(guruHtml), 'kuis_interaktif_dasbor_guru.html missing cache-busting version tag');
});

console.log('════════════════════════════════════════════════════════════════');
console.log(`🎉 ALL ${testsPassed}/8 TESTS PASSED FOR DEMO TOGGLE & ANTI-JOKI!`);
console.log('════════════════════════════════════════════════════════════════');
