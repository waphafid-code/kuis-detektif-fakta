const fs = require('fs');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════');
console.log('📱 RUNNING MOBILE, TABLET & UI/UX PRO MAX VERIFICATION SUITE');
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

const html = fs.readFileSync('index.html', 'utf8');
const styleCss = fs.readFileSync('css/style.css', 'utf8');
const guardianCss = fs.readFileSync('css/guardian_and_chatbot.css', 'utf8');
const particlesJs = fs.readFileSync('js/particles.js', 'utf8');

test('Mobile Top Bar: decoupled semantic classes used in index.html', () => {
    assert(html.includes('class="mobile-brand-box"'), 'Must have mobile-brand-box class');
    assert(html.includes('class="mobile-brand-icon"'), 'Must have mobile-brand-icon class');
    assert(html.includes('class="mobile-theme-btn"'), 'Must have mobile-theme-btn class');
    assert(html.includes('id="theme-icon-mob"'), 'Must retain theme-icon-mob id for theme toggle');
});

test('Mobile Top Bar: CSS prevents icon clipping and theme button stretching', () => {
    assert(styleCss.includes('.mobile-brand-box {'), 'Must style mobile-brand-box');
    assert(styleCss.includes('.mobile-brand-icon {'), 'Must style mobile-brand-icon');
    assert(styleCss.includes('.mobile-theme-btn {'), 'Must style mobile-theme-btn');
    assert(styleCss.includes('width: 40px !important;') || styleCss.includes('width: 38px !important;'), 'Menu and theme buttons must have fixed width to prevent stretch');
});

test('Form Label Split: Step 3 label and badge wrap cleanly on mobile', () => {
    assert(html.includes('form-label-split'), 'index.html must use form-label-split');
    assert(html.includes('module-badge-pill'), 'index.html must use module-badge-pill');
    assert(styleCss.includes('.form-label-split {'), 'CSS must define form-label-split');
    assert(styleCss.includes('.module-badge-pill {'), 'CSS must define module-badge-pill');
});

test('Safe Area Clearance: container has bottom padding to prevent FAB overlap', () => {
    assert(styleCss.includes('padding-bottom: 96px !important;'), 'Must have safe area padding-bottom on mobile');
});

test('Floating Chatbot: mobile positioning safe and infinite GPU spin disabled on mobile', () => {
    assert(guardianCss.includes('.chatbot-float-trigger {'), 'Must style chatbot-float-trigger');
    assert(guardianCss.includes('animation: none !important; /* Eliminates continuous GPU layer thrashing on mobile */'), 'Must disable spinSparkle on mobile');
});

test('Design Tokens: missing CSS variables defined in :root & dark theme', () => {
    assert(styleCss.includes('--bg-body: #F8FAFC;'), '--bg-body must be defined in :root');
    assert(styleCss.includes('--bg-body: #0B0F19;'), '--bg-body must be defined in dark theme');
    assert(styleCss.includes('--glass-bg: rgba(255, 255, 255'), '--glass-bg must be defined in :root');
    assert(styleCss.includes('--glass-bg: rgba(21, 29, 48'), '--glass-bg must be defined in dark theme');
    assert(styleCss.includes('--font-sans:'), '--font-sans must be defined');
});

test('Theme Adaptation: Teacher Chatbot and Settings Panel support light theme cleanly', () => {
    assert(guardianCss.includes('[data-theme="light"] .teacher-chatbot-wrapper'), 'Chatbot must have light theme styling');
    assert(guardianCss.includes('[data-theme="light"] .chatbot-input-field'), 'Chatbot input must have light theme styling');
    assert(styleCss.includes('[data-theme="dark"] .settings-panel'), 'Settings panel must have dark theme styling without bleeding to light theme');
});

test('Tablet & Potato Anti-Lag: particles disabled on screens < 992px & potato mode', () => {
    assert(particlesJs.includes('window.innerWidth < 992'), 'Particles must guard against mobile and tablet');
    assert(particlesJs.includes('hp-kentang'), 'Particles must guard against hp-kentang');
});

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`📊 FINAL RESULT: ${pass} / ${total} TESTS PASSED`);
if (pass === total) {
    console.log('🎉 100% MOBILE, TABLET & UI/UX PRO MAX VERIFIED!');
}
console.log('════════════════════════════════════════════════════════════════\n');

if (pass !== total) process.exit(1);

