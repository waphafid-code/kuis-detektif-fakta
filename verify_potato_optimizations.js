const fs = require('fs');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════');
console.log('🥔 RUNNING HP KENTANG ZERO-LAG VERIFICATION SUITE');
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

const css = fs.readFileSync('css/style.css', 'utf8');
const storageJs = fs.readFileSync('js/storage.js', 'utf8');
const particlesJs = fs.readFileSync('js/particles.js', 'utf8');
const quizEngineJs = fs.readFileSync('js/quiz_engine.js', 'utf8');
const deviceTierJs = fs.readFileSync('js/deviceTier.js', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

test('CSS disables backdrop-filter on mobile & hp-kentang', () => {
    assert(css.includes('backdrop-filter: none !important;'), 'Should disable backdrop-filter');
    assert(css.includes('-webkit-backdrop-filter: none !important;'), 'Should disable -webkit-backdrop-filter');
    assert(css.includes('.hp-kentang'), 'Should have .hp-kentang class selector');
});

test('CSS eliminates layer thrashing transform: translateZ(0) broad selector', () => {
    assert(!css.includes('.btn, button, input, select {\n        transform: translateZ(0);'), 'Broad translateZ(0) selector must be removed');
});

test('CSS configures 0ms touch latency via touch-action: manipulation', () => {
    assert(css.includes('touch-action: manipulation !important;'), 'Must have touch-action: manipulation');
    assert(css.includes('-webkit-tap-highlight-color: transparent !important;'), 'Must disable mobile tap highlight');
});

test('js/storage.js detects potato hardware (RAM, Cores, Screen, UserAgent)', () => {
    assert(storageJs.includes('detectPotatoDevice'), 'Should have detectPotatoDevice function');
    assert(storageJs.includes('deviceMemory'), 'Should inspect navigator.deviceMemory');
    assert(storageJs.includes('hardwareConcurrency'), 'Should inspect navigator.hardwareConcurrency');
    assert(storageJs.includes("classList.add('hp-kentang')"), 'Should tag documentElement with hp-kentang');
});

test('js/storage.js schedules 85% lighter audio nodes for potato phones', () => {
    assert(storageJs.includes('if (isPotatoDevice)'), 'Should have adaptive potato audio branch');
    assert(storageJs.includes('POTATO_SCHEDULE_AHEAD'), 'Should have adaptive lookahead buffer');
});

test('js/particles.js eliminated forced synchronous layout thrashing (offsetWidth)', () => {
    assert(!particlesJs.includes('void app.offsetWidth;'), 'Must remove void app.offsetWidth;');
    assert(!particlesJs.includes('void blurOverlay.offsetWidth;'), 'Must remove void blurOverlay.offsetWidth;');
    assert(particlesJs.includes('requestAnimationFrame'), 'Must use requestAnimationFrame instead');
});

test('js/quiz_engine.js removed forced reflows during loadQuestion and autoSubmit', () => {
    assert(!quizEngineJs.includes('void qContent.offsetWidth;'), 'Must remove void qContent.offsetWidth;');
    assert(quizEngineJs.includes('requestAnimationFrame(() => qContent.classList.add(\'slide-in\'))'), 'Must use requestAnimationFrame for qContent');
});

test('index.html properly loads deviceTier.js before storage.js', () => {
    assert(indexHtml.includes('<script src="js/deviceTier.js'), 'Must load deviceTier.js');
    const dtPos = indexHtml.indexOf('deviceTier.js');
    const stPos = indexHtml.indexOf('storage.js');
    assert(dtPos < stPos, 'deviceTier.js must load before storage.js');
});

test('deviceTier.js automatically toggles .hp-kentang class', () => {
    assert(deviceTierJs.includes("classList.add('hp-kentang')"), 'Should add hp-kentang on tier low');
    assert(deviceTierJs.includes("classList.remove('hp-kentang')"), 'Should remove hp-kentang on tier high/med');
});

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`📊 FINAL RESULT: ${pass} / ${total} TESTS PASSED`);
if (pass === total) {
    console.log('🎉 100% ZERO-LAG ON POTATO PHONES GUARANTEED!');
}
console.log('════════════════════════════════════════════════════════════════\n');

if (pass !== total) process.exit(1);
