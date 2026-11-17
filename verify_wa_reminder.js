const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('════════════════════════════════════════════════════════════════');
console.log('📲 VERIFYING WHATSAPP CLASS REMINDER & BROADCAST TOOL');
console.log('   (Matt Pocock TDD Methodology: Red-Green-Refactor)');
console.log('════════════════════════════════════════════════════════════════\n');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`  ✓ [PASS] ${name}`);
        passCount++;
    } catch (err) {
        console.error(`  ✗ [FAIL] ${name}`);
        console.error(err);
        failCount++;
    }
}

// 1. Check HTML structure in index.html
test('Test 1: index.html contains #wa-reminder-modal with all required controls', () => {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    assert(html.includes('id="wa-reminder-modal"'), 'Modal wa-reminder-modal should exist');
    assert(html.includes('id="wa-remind-class"'), 'Select wa-remind-class should exist');
    assert(html.includes('id="wa-remind-module"'), 'Select wa-remind-module should exist');
    assert(html.includes('btn-wa-cat-all'), 'Category button all should exist');
    assert(html.includes('btn-wa-cat-unsubmitted'), 'Category button unsubmitted should exist');
    assert(html.includes('btn-wa-cat-remedial'), 'Category button remedial should exist');
    assert(html.includes('id="wa-badge-unsubmitted"'), 'Badge unsubmitted should exist');
    assert(html.includes('id="wa-badge-remedial"'), 'Badge remedial should exist');
    assert(html.includes('id="wa-badge-passed"'), 'Badge passed should exist');
    assert(html.includes('id="wa-badge-total"'), 'Badge total should exist');
    assert(html.includes('id="wa-remind-preview-text"'), 'Preview textarea should exist');
    assert(html.includes('copyWaReminderText()'), 'Copy WA button should be bound');
    assert(html.includes('openWhatsAppWithReminder()'), 'Send WA button should be bound');
    assert(html.includes('openWaReminderModal()'), 'Dashboard trigger button should exist');
});

// Setup mock browser sandbox for testing dashboard.js logic
function setupSandbox(mockRecords = []) {
    const sandbox = {
        console,
        setTimeout: (fn) => fn(),
        clearTimeout: () => {},
        window: {},
        document: {
            getElementById: (id) => {
                if (!sandbox._elements[id]) {
                    sandbox._elements[id] = {
                        id,
                        value: '',
                        textContent: '',
                        innerHTML: '',
                        style: {},
                        classList: {
                            _classes: new Set(),
                            add: function(c) { this._classes.add(c); },
                            remove: function(c) { this._classes.delete(c); },
                            contains: function(c) { return this._classes.has(c); },
                            toggle: function(c, force) { if (force !== undefined) { force ? this.add(c) : this.remove(c); } else { this.contains(c) ? this.remove(c) : this.add(c); } }
                        },
                        querySelectorAll: () => [],
                        addEventListener: () => {},
                        appendChild: () => {},
                        removeChild: () => {}
                    };
                }
                return sandbox._elements[id];
            },
            querySelectorAll: () => [],
            createElement: (tag) => ({
                tagName: tag,
                style: {},
                classList: { add: () => {}, remove: () => {} },
                appendChild: () => {},
                setAttribute: () => {}
            }),
            body: { appendChild: () => {}, removeChild: () => {} }
        },
        _elements: {},
        navigator: {
            clipboard: {
                _lastCopied: '',
                writeText: async function(txt) {
                    this._lastCopied = txt;
                    return Promise.resolve();
                }
            }
        },
        sessionStorage: {
            _store: {},
            getItem: function(k) { return this._store[k] || null; },
            setItem: function(k, v) { this._store[k] = String(v); },
            removeItem: function(k) { delete this._store[k]; }
        },
        localStorage: {
            _store: {
                'quizmaster_records': JSON.stringify(mockRecords)
            },
            getItem: function(k) { return this._store[k] || null; },
            setItem: function(k, v) { this._store[k] = String(v); },
            removeItem: function(k) { delete this._store[k]; }
        },
        showToast: (msg, icon) => { sandbox._lastToast = { msg, icon }; },
        sfxClick: () => {},
        open: (url, target) => { sandbox._lastOpenedUrl = url; sandbox._lastOpenedTarget = target; }
    };
    sandbox.window = sandbox;
    sandbox.window.open = sandbox.open;
    sandbox.window.navigator = sandbox.navigator;
    sandbox.window.addEventListener = () => {};
    sandbox.window.removeEventListener = () => {};
    sandbox.STORAGE_KEY = 'quizmaster_records';
    sandbox.window.STORAGE_KEY = 'quizmaster_records';
    sandbox.localStorage._store['quizmaster_official_pdf_sync_ver'] = '20261028_official_jki_v5';

    // Load student_roster.js
    const rosterCode = fs.readFileSync(path.join(__dirname, 'js', 'student_roster.js'), 'utf8');
    vm.runInNewContext(rosterCode, sandbox);
    sandbox.STUDENT_ROSTER = sandbox.window.STUDENT_ROSTER;
    sandbox.isNameEquivalent = sandbox.window.isNameEquivalent;
    sandbox.isClassEquivalent = sandbox.window.isClassEquivalent;

    // Load audio.js (for normalizeModuleId)
    const audioCode = fs.readFileSync(path.join(__dirname, 'js', 'audio.js'), 'utf8');
    vm.runInNewContext(audioCode, sandbox);

    // Load dashboard.js
    const dashCode = fs.readFileSync(path.join(__dirname, 'js', 'dashboard.js'), 'utf8');
    vm.runInNewContext(dashCode, sandbox);

    return sandbox;
}

test('Test 2: dashboard.js exports WhatsApp reminder functions to window', () => {
    const sandbox = setupSandbox();
    assert.strictEqual(typeof sandbox.window.openWaReminderModal, 'function');
    assert.strictEqual(typeof sandbox.window.closeWaReminderModal, 'function');
    assert.strictEqual(typeof sandbox.window.setWaReminderCategory, 'function');
    assert.strictEqual(typeof sandbox.window.updateWaReminderPreview, 'function');
    assert.strictEqual(typeof sandbox.window.copyWaReminderText, 'function');
    assert.strictEqual(typeof sandbox.window.openWhatsAppWithReminder, 'function');
});

test('Test 3: Categorization - Correctly identifies Unsubmitted vs Remedial vs Passed', () => {
    // 36 students in X E 1.
    // Official names from STUDENT_ROSTER['X E 1']:
    // "ADITYA PUTRA PRATAMA", "AISAH PUTRI KARLINA YENTI", "ALEESYA NADIRAH", ...
    const mockRecs = [
        {
            name: 'ADITYA PUTRA PRATAMA',
            class: 'X E 1',
            score: 90, // Passed (>= 80)
            moduleId: 'modul_jaringan_keamanan',
            date: '2026-11-17T08:00:00Z'
        },
        {
            name: 'AISAH PUTRI KARLINA YENTI',
            class: 'X E 1',
            score: 65, // Remedial (< 80)
            moduleId: 'modul_jaringan_keamanan',
            date: '2026-11-17T08:05:00Z'
        },
        {
            name: 'ALEESYA NADIRAH',
            class: 'X E 1',
            score: 75, // Remedial (< 80)
            moduleId: 'modul_jaringan_keamanan',
            date: '2026-11-17T08:10:00Z'
        }
        // Remaining 33 students in X E 1 have no records -> Unsubmitted
    ];

    const sandbox = setupSandbox(mockRecs);
    sandbox.document.getElementById('wa-remind-class').value = 'X E 1';
    sandbox.document.getElementById('wa-remind-module').value = 'modul_jaringan_keamanan';

    sandbox.window.setWaReminderCategory('all');
    sandbox.window.updateWaReminderPreview();

    const badgeUnsub = Number(sandbox.document.getElementById('wa-badge-unsubmitted').textContent);
    const badgeRemedial = Number(sandbox.document.getElementById('wa-badge-remedial').textContent);
    const badgePassed = Number(sandbox.document.getElementById('wa-badge-passed').textContent);
    const badgeTotal = Number(sandbox.document.getElementById('wa-badge-total').textContent);

    assert.strictEqual(badgeTotal, 36, 'Total students in X E 1 should be 36');
    assert.strictEqual(badgePassed, 1, 'Passed students should be 1 (Aditya Putra Pratama)');
    assert.strictEqual(badgeRemedial, 2, 'Remedial students should be 2 (Aisah & Aleesya)');
    assert.strictEqual(badgeUnsub, 33, 'Unsubmitted students should be 33');
});

test('Test 4: WhatsApp Message Content - Includes Teacher Name, Class, Module, KKM 80 and Platform Link', () => {
    const mockRecs = [
        { name: 'ADITYA PUTRA PRATAMA', class: 'X E 1', score: 95, moduleId: 'modul_jaringan_keamanan' },
        { name: 'AISAH PUTRI KARLINA YENTI', class: 'X E 1', score: 70, moduleId: 'modul_jaringan_keamanan' }
    ];

    const sandbox = setupSandbox(mockRecs);
    sandbox.document.getElementById('wa-remind-class').value = 'X E 1';
    sandbox.document.getElementById('wa-remind-module').value = 'modul_jaringan_keamanan';

    sandbox.window.setWaReminderCategory('all');
    sandbox.window.updateWaReminderPreview();

    const previewText = sandbox.document.getElementById('wa-remind-preview-text').value;
    assert(previewText.includes('MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.'), 'Must include official teacher name');
    assert(previewText.includes('SMAN 4 PADANG'), 'Must include school name');
    assert(previewText.includes('X E 1'), 'Must include target class');
    assert(previewText.includes('80'), 'Must mention KKM 80');
    assert(previewText.includes('https://waphafid-code.github.io/kuis-detektif-fakta/'), 'Must include valid platform link');
    assert(previewText.includes('DAFTAR SISWA BELUM MENGERJAKAN'), 'Must have unsubmitted section');
    assert(previewText.includes('DAFTAR SISWA PERLU REMEDIAL MANDIRI'), 'Must have remedial section');
    assert(previewText.includes('AISAH PUTRI KARLINA YENTI'), 'Must list remedial student Aisah Putri');
    assert(previewText.includes('70'), 'Must show Aisah score 70');
});

test('Test 5: Filter Modes - "unsubmitted" only lists unsubmitted, "remedial" only lists remedial', () => {
    const mockRecs = [
        { name: 'ADITYA PUTRA PRATAMA', class: 'X E 1', score: 95, moduleId: 'modul_jaringan_keamanan' },
        { name: 'AISAH PUTRI KARLINA YENTI', class: 'X E 1', score: 70, moduleId: 'modul_jaringan_keamanan' }
    ];

    const sandbox = setupSandbox(mockRecs);
    sandbox.document.getElementById('wa-remind-class').value = 'X E 1';
    sandbox.document.getElementById('wa-remind-module').value = 'modul_jaringan_keamanan';

    // Mode: unsubmitted
    sandbox.window.setWaReminderCategory('unsubmitted');
    const unsubText = sandbox.document.getElementById('wa-remind-preview-text').value;
    assert(unsubText.includes('DAFTAR SISWA BELUM MENGERJAKAN'), 'Must list unsubmitted');
    assert(!unsubText.includes('DAFTAR SISWA PERLU REMEDIAL MANDIRI'), 'Should NOT list remedial section');

    // Mode: remedial
    sandbox.window.setWaReminderCategory('remedial');
    const remedialText = sandbox.document.getElementById('wa-remind-preview-text').value;
    assert(remedialText.includes('DAFTAR SISWA PERLU REMEDIAL MANDIRI'), 'Must list remedial');
    assert(!remedialText.includes('DAFTAR SISWA BELUM MENGERJAKAN'), 'Should NOT list unsubmitted section');
    assert(remedialText.includes('AISAH PUTRI KARLINA YENTI'), 'Must list remedial student');
});

test('Test 6: openWhatsAppWithReminder copies to clipboard AND triggers WhatsApp URL', () => {
    const mockRecs = [
        { name: 'AISAH PUTRI KARLINA YENTI', class: 'X E 1', score: 60, moduleId: 'modul_jaringan_keamanan' }
    ];

    const sandbox = setupSandbox(mockRecs);
    sandbox.document.getElementById('wa-remind-class').value = 'X E 1';
    sandbox.document.getElementById('wa-remind-module').value = 'modul_jaringan_keamanan';
    sandbox.window.setWaReminderCategory('all');

    sandbox.window.openWhatsAppWithReminder();

    const expectedText = sandbox.document.getElementById('wa-remind-preview-text').value;
    assert.strictEqual(sandbox.navigator.clipboard._lastCopied, expectedText, 'Text must be copied to clipboard');
    assert(sandbox._lastOpenedUrl.startsWith('https://api.whatsapp.com/send?text='), 'Must target api.whatsapp.com');
    assert(sandbox._lastOpenedUrl.includes(encodeURIComponent('MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.')), 'Encoded URL must contain teacher name');
});

test('Test 7: Target class "all" spans across all 6 classes (216 official students total)', () => {
    const sandbox = setupSandbox([]); // 0 records submitted
    sandbox.document.getElementById('wa-remind-class').value = 'all';
    sandbox.document.getElementById('wa-remind-module').value = 'modul_jaringan_keamanan';
    sandbox.window.setWaReminderCategory('all');

    sandbox.window.updateWaReminderPreview();

    const badgeTotal = Number(sandbox.document.getElementById('wa-badge-total').textContent);
    const badgeUnsub = Number(sandbox.document.getElementById('wa-badge-unsubmitted').textContent);
    const badgeRemedial = Number(sandbox.document.getElementById('wa-badge-remedial').textContent);

    assert.strictEqual(badgeTotal, 216, 'Total official students across 6 classes should be 216');
    assert.strictEqual(badgeUnsub, 216, 'All 216 should be marked unsubmitted');
    assert.strictEqual(badgeRemedial, 0, '0 remedial students');

    const previewText = sandbox.document.getElementById('wa-remind-preview-text').value;
    assert(previewText.includes('Semua Kelas Resmi (X E 1 - X E 6)'));
});

test('Test 8: All Passed Case produces celebratory message with no remedial or unsubmitted list', () => {
    // Fill all 36 students of X E 1 with score 85 (>= KKM 80)
    const baseSandbox = setupSandbox([]);
    const rosterList = baseSandbox.STUDENT_ROSTER['X E 1'] || [];
    const mockRecs = rosterList.map(name => ({
        name,
        class: 'X E 1',
        score: 85,
        moduleId: 'modul_jaringan_keamanan'
    }));

    const sandbox = setupSandbox(mockRecs);
    sandbox.document.getElementById('wa-remind-class').value = 'X E 1';
    sandbox.document.getElementById('wa-remind-module').value = 'modul_jaringan_keamanan';
    sandbox.window.setWaReminderCategory('all');

    sandbox.window.updateWaReminderPreview();

    const badgeUnsub = Number(sandbox.document.getElementById('wa-badge-unsubmitted').textContent);
    const badgeRemedial = Number(sandbox.document.getElementById('wa-badge-remedial').textContent);
    const badgePassed = Number(sandbox.document.getElementById('wa-badge-passed').textContent);

    assert.strictEqual(badgeUnsub, 0, '0 unsubmitted');
    assert.strictEqual(badgeRemedial, 0, '0 remedial');
    assert.strictEqual(badgePassed, 36, 'All 36 passed');

    const previewText = sandbox.document.getElementById('wa-remind-preview-text').value;
    assert(previewText.includes('Luar Biasa! Seluruh siswa kelas X E 1 telah menuntaskan kuis'));
    assert(!previewText.includes('DAFTAR SISWA BELUM MENGERJAKAN'));
    assert(!previewText.includes('DAFTAR SISWA PERLU REMEDIAL MANDIRI'));
});

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`📊 FINAL RESULT: ${passCount} / ${passCount + failCount} TESTS PASSED`);
if (failCount === 0) {
    console.log('🎉 ALL WHATSAPP REMINDER CHECKS VERIFIED 100%!');
} else {
    console.log('❌ SOME CHECKS FAILED');
    process.exit(1);
}
