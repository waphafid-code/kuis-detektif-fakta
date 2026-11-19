// ============================================================
// 🛡️ REGRESSION TEST: REDEKLARASI GLOBAL LINTAS-SKRIP
// ------------------------------------------------------------
// Bug asal: `let timerInterval` / `let timerVal` dideklarasikan di js/storage.js
// DAN js/quiz_engine.js. Semua <script> klasik berbagi satu scope leksikal global,
// sehingga browser melempar "SyntaxError: Identifier ... has already been declared"
// dan SELURUH quiz_engine.js tidak berjalan (onHomeClassChanged, initiateQuiz, dll
// jadi undefined -> dropdown nama siswa tidak pernah terisi).
// `node --check` per-file TIDAK mendeteksinya, karena benturan terjadi lintas file.
// Tes ini memuat semua skrip lokal sesuai urutan di HTML ke satu konteks bersama.
// ============================================================
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

let passed = 0;
function test(name, fn) {
    try { fn(); console.log(`  ✅ PASS: ${name}`); passed++; }
    catch (e) { console.error(`  ❌ FAIL: ${name}\n    ${e.message}`); process.exit(1); }
}

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 VERIFYING NO CROSS-SCRIPT GLOBAL REDECLARATIONS');
console.log('════════════════════════════════════════════════════════════════');

const REQUIRED_GLOBALS = [
    'onHomeClassChanged', 'updateHomeStudentDisplay', 'initiateQuiz',
    'checkAnswer', 'startTimer', 'stopTimer'
];

function loadAll(htmlRel) {
    const htmlPath = path.join(__dirname, htmlRel);
    const baseDir = path.dirname(htmlPath);
    const html = fs.readFileSync(htmlPath, 'utf8');
    const srcs = [...html.matchAll(/<script[^>]*\ssrc="(js\/[^"?]+)[^"]*"/g)].map(m => m[1]);
    assert(srcs.length > 5, `${htmlRel}: daftar <script> lokal tidak terbaca`);

    const sandbox = { console: { log() {}, warn() {}, error() {}, info() {}, debug() {} } };
    sandbox.window = sandbox;
    sandbox.self = sandbox;
    const ctx = vm.createContext(sandbox);

    const syntaxProblems = [];
    for (const rel of srcs) {
        const file = path.join(baseDir, rel);
        const code = fs.readFileSync(file, 'utf8');
        try {
            new vm.Script(code, { filename: rel }).runInContext(ctx, { timeout: 2000 });
        } catch (e) {
            // Error runtime (document/localStorage tidak ada di Node) diabaikan;
            // yang dicari hanya kegagalan tingkat sintaks / deklarasi ganda.
            if (e instanceof SyntaxError || /already been declared/.test(String(e && e.message))) {
                syntaxProblems.push(`${rel}: ${e.message}`);
            }
        }
    }
    return { ctx, syntaxProblems, count: srcs.length };
}

['index.html', 'src/index.html', 'kuis_interaktif_dasbor_guru.html', 'src/kuis_interaktif_dasbor_guru.html'].forEach((htmlRel, i) => {
    test(`${i + 1}. ${htmlRel}: tidak ada SyntaxError / redeklarasi lintas-skrip`, () => {
        const { syntaxProblems, count } = loadAll(htmlRel);
        assert.deepStrictEqual(syntaxProblems, [], `Ditemukan masalah pada ${count} skrip:\n    ` + syntaxProblems.join('\n    '));
    });

    test(`${i + 1}b. ${htmlRel}: fungsi kunci alur siswa terdefinisi global`, () => {
        const { ctx } = loadAll(htmlRel);
        REQUIRED_GLOBALS.forEach(fn => {
            assert.strictEqual(typeof ctx[fn], 'function', `${fn} tidak terdefinisi (quiz_engine.js gagal dimuat?)`);
        });
    });
});

console.log('════════════════════════════════════════════════════════════════');
console.log(`🎉 ALL ${passed}/8 TESTS PASSED - NO GLOBAL REDECLARATION CONFLICTS`);
console.log('════════════════════════════════════════════════════════════════');

process.exit(0); // hentikan timer asinkron dari skrip yang dimuat (mis. deviceTier.js)
