const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 VERIFYING REMINDER MESSAGE FORMAT & CLEAN PROFESSIONAL UI');
console.log('════════════════════════════════════════════════════════════════\n');

// 1. Load dashboard.js environment
global.window = global;
global.window.addEventListener = () => {};
global.document = {
    getElementById: (id) => {
        if (!global._mockElements) global._mockElements = {};
        if (!global._mockElements[id]) {
            global._mockElements[id] = {
                value: '',
                textContent: '',
                classList: { add: () => {}, remove: () => {} }
            };
        }
        return global._mockElements[id];
    },
    addEventListener: () => {}
};
global.STUDENT_ROSTER = {
    'X E 2': ['Karina Ahmad', 'Melisa Syahruni', 'Zahrani Sakinah']
};
global.loadRecords = () => [
    { name: 'Karina Ahmad', class: 'X E 2', score: 71, isRemedial: true, moduleId: 'modul_detektif_fakta' },
    { name: 'Melisa Syahruni', class: 'X E 2', score: 80, remedialScore: 80, isRemedial: true, moduleId: 'modul_detektif_fakta' }
    // Zahrani Sakinah has not taken it
];
global.normalizeModuleId = (m) => m || 'modul_detektif_fakta';
global.isNameEquivalent = (a, b) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();
global.isClassEquivalent = (a, b) => (a || '').replace(/\s+/g,'').toUpperCase() === (b || '').replace(/\s+/g,'').toUpperCase();
global.sfxClick = () => {};
global.showToast = () => {};

eval(fs.readFileSync('js/dashboard.js', 'utf8'));

// Test updateWaReminderPreview
const classSelect = document.getElementById('wa-remind-class');
classSelect.value = 'X E 2';
const modSelect = document.getElementById('wa-remind-module');
modSelect.value = 'modul_detektif_fakta';

updateWaReminderPreview();

const preview = document.getElementById('wa-remind-preview-text').value;
console.log('Generated WhatsApp Text Preview:\n');
console.log(preview);
console.log('\n------------------------------------------------------------');

// Check 1: List must be numbered
assert(preview.includes('1. Zahrani Sakinah (X E 2)'), 'Unsubmitted list must be numbered starting with 1.');
assert(preview.includes('1. Karina Ahmad (X E 2)'), 'Remedial list must be numbered starting with 1.');

// Check 2: MUST NOT contain student scores
assert(!preview.includes('Nilai:'), 'CRITICAL: Must not print "Nilai:" in reminder text!');
assert(!preview.includes('— Nilai: 71'), 'CRITICAL: Must not expose student score 71!');
assert(!preview.includes('— Nilai: 80'), 'CRITICAL: Must not expose student score 80!');
console.log('✅ Check 1 & 2: Numbered list verified & score is completely hidden from message.');

// Check 3: MUST NOT contain childish emoji clutter
const prohibitedEmojis = ['📢', '🏫', '👨‍🏫', '📚', '🎯', '❌', '🔄', '🎉', '👏', '🌟', '🌐', '⚠️', '🙏'];
prohibitedEmojis.forEach(em => {
    assert(!preview.includes(em), `CRITICAL: Prohibited emoji "${em}" found in WhatsApp message!`);
});
console.log('✅ Check 3: Free from useless emoji clutter.');

// Check 4: Modal UI and root/src mirroring
const h1 = fs.readFileSync('index.html', 'utf8');
const h2 = fs.readFileSync('src/index.html', 'utf8');
assert.strictEqual(h1, h2, 'index.html and src/index.html must match 100%');

const d1 = fs.readFileSync('js/dashboard.js', 'utf8');
const d2 = fs.readFileSync('src/js/dashboard.js', 'utf8');
assert.strictEqual(d1, d2, 'js/dashboard.js and src/js/dashboard.js must match 100%');
console.log('✅ Check 4: Root and src files mirrored identically.');

console.log('\n🎉 ALL REMINDER MESSAGE & CLEAN UI CHECKS PASSED!');
