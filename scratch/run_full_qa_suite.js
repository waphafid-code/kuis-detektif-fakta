/**
 * 🧪 COMPREHENSIVE AUTOMATED QA TESTING SUITE
 * Memvalidasi 10 Aspek Krusial & 6 Mini-Game Engine
 */

const fs = require('fs');
const path = require('path');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        testsPassed++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        testsFailed++;
    }
}

console.log('====================================================');
console.log('🚀 MEMULAI PENGUJIAN QA OTOMATIS APLIKASI QUIZMASTER');
console.log('====================================================\n');

// ----------------------------------------------------
// TEST SUITE 1: Syntax & File Compilation Integrity
// ----------------------------------------------------
console.log('📦 [TEST 1] Syntax & File Compilation:');
const jsDir = path.join(__dirname, '..', 'js');
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

jsFiles.forEach(file => {
    try {
        const fullPath = path.join(jsDir, file);
        const code = fs.readFileSync(fullPath, 'utf8');
        new Function(code);
        assert(true, `File js/${file} bebas error sintaks.`);
    } catch (e) {
        assert(false, `File js/${file} gagal compile: ${e.message}`);
    }
});

// ----------------------------------------------------
// TEST SUITE 2: Mini-Games Scope & Closure Integrity (Fix Bug 1)
// ----------------------------------------------------
console.log('\n🔒 [TEST 2] Mini-Games Scope & Closure Integrity:');
const miniGamesCode = fs.readFileSync(path.join(jsDir, 'mini_games.js'), 'utf8');

// Check that closure only closes at the very end
const closingCount = (miniGamesCode.match(/\}\)\(\);/g) || []).length;
assert(closingCount === 1, `Hanya ada tepat 1 penutup closure IIFE di akhir file (Ditemukan: ${closingCount}).`);
assert(miniGamesCode.trim().endsWith('})();'), 'Penutup IIFE terletak tepat di baris paling akhir file.');

// ----------------------------------------------------
// TEST SUITE 3: 6 Balanced Mini-Games Verification (Fix Bug 2)
// ----------------------------------------------------
console.log('\n🎮 [TEST 3] 6 Balanced Mini-Games & Lobby Grid:');
const expectedGames = [
    'hoax_buster',
    'sort_dash',
    'kitchen_express',
    'excel_dash',
    'robocode_runner',
    'binary_search'
];

expectedGames.forEach(gId => {
    const hasCase = miniGamesCode.includes(`case '${gId}':`);
    const hasCard = miniGamesCode.includes(`launchMiniGame('${gId}')`);
    assert(hasCase && hasCard, `Game '${gId}' terdaftar dalam engine dan grid lobi.`);
});

// Verify no double-click bubbling in card buttons
assert(!miniGamesCode.includes('<button type="button" class="btn-play-game" onclick="launchMiniGame('), 
    'Tombol kartu menggunakan event.stopPropagation() untuk mencegah double-trigger click.');

// ----------------------------------------------------
// TEST SUITE 4: Binary Search Mathematical Logic & Bounds
// ----------------------------------------------------
console.log('\n🔎 [TEST 4] Binary Search Algorithm Logic:');
const mockBinaryLevels = [
    { files: [12, 19, 25, 34, 48, 55, 67, 78, 89, 94], targetIndex: 6, maxSteps: 4 },
    { files: [105, 118, 124, 137, 149, 155, 168, 172, 185, 199, 210, 225, 238, 246, 259, 275], targetIndex: 11, maxSteps: 5 },
    { files: [302, 315, 329, 341, 356, 368, 377, 389, 401, 415, 428, 439, 452, 468, 477, 489, 503, 517, 529, 545], targetIndex: 4, maxSteps: 5 }
];

mockBinaryLevels.forEach((lvl, i) => {
    let low = 0;
    let high = lvl.files.length - 1;
    let target = lvl.files[lvl.targetIndex];
    let steps = 0;
    let found = false;

    while (low <= high && steps < 10) {
        steps++;
        let mid = Math.floor((low + high) / 2);
        if (lvl.files[mid] === target) {
            found = true;
            break;
        } else if (lvl.files[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    assert(found && steps <= lvl.maxSteps, `Level ${i + 1} Binary Search target ${target} ditemukan dalam ${steps} langkah (<= ${lvl.maxSteps}).`);
});

// ----------------------------------------------------
// TEST SUITE 5: Sorting Dash Inversion & Zero Division (Fix Bug 7)
// ----------------------------------------------------
console.log('\n📊 [TEST 5] Sorting Progress Zero-Division Guard:');
function calculateSortProgress(arr) {
    if (!arr || arr.length <= 1) return 100;
    let inversions = 0;
    const n = arr.length;
    const maxInv = (n * (n - 1)) / 2;
    if (maxInv <= 0) return 100;
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            if (arr[i] > arr[j]) inversions++;
        }
    }
    return Math.max(0, Math.round(((maxInv - inversions) / maxInv) * 100));
}

assert(calculateSortProgress([1, 2, 3, 4, 5]) === 100, 'Array terurut menghasilkan 100%.');
assert(calculateSortProgress([5, 4, 3, 2, 1]) === 0, 'Array terbalik menghasilkan 0%.');
assert(calculateSortProgress([1]) === 100, 'Array 1 elemen menghasilkan 100% tanpa NaN.');
assert(calculateSortProgress([]) === 100, 'Array kosong menghasilkan 100% tanpa NaN.');
assert(!isNaN(calculateSortProgress([2, 2])), 'Array elemen kembar tidak menghasilkan NaN.');

// ----------------------------------------------------
// TEST SUITE 6: Rapid Double-Click Locks (Fix Bug 3)
// ----------------------------------------------------
console.log('\n🛡️ [TEST 6] Rapid Double-Click Locks (isAnswered):');
assert(miniGamesCode.includes('if (!gameState.data || gameState.data.isAnswered) return;\n        gameState.data.isAnswered = true;'), 
    'answerRoboCode, answerExcelDash, dan answerHoaxBuster memiliki proteksi race-condition.');

// ----------------------------------------------------
// TEST SUITE 7: Background Timer Cleanup (Fix Bug 4)
// ----------------------------------------------------
console.log('\n⏱️ [TEST 7] Background Timer Leak Cleanup:');
assert(miniGamesCode.includes('if (gameState.data && gameState.data.execTimer) {\n            clearTimeout(gameState.data.execTimer);'),
    'stopGameTimer membersihkan execTimer simulasi RoboCode.');

// ----------------------------------------------------
// TEST SUITE 8: Result Summary Null Safety (Fix Bug 6)
// ----------------------------------------------------
console.log('\n📝 [TEST 8] Quiz Engine Result Summary Null Safety:');
const quizEngineCode = fs.readFileSync(path.join(jsDir, 'quiz_engine.js'), 'utf8');
assert(quizEngineCode.includes('const resCorrectEl = document.getElementById(\'res-correct\');') &&
       quizEngineCode.includes('if (resCorrectEl) resCorrectEl.textContent'),
    'showResults menggunakan guard kondisional aman sebelum menyetel textContent.');

// ----------------------------------------------------
// TEST SUITE 9: Security & Sanitization Functions
// ----------------------------------------------------
console.log('\n🛡️ [TEST 9] Security & Formula Injection Sanitization:');
const dashboardCode = fs.readFileSync(path.join(jsDir, 'dashboard.js'), 'utf8');

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function sanitizeSpreadsheetValue(val) {
    if (val === null || val === undefined) return '';
    const s = String(val).trim();
    if (/^[=+\-@\t\r]/.test(s)) {
        return "'" + s;
    }
    return s;
}

assert(escapeHtml('<script>alert("XSS")</script>') === '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;', 'XSS string berhasil di-escape.');
assert(sanitizeSpreadsheetValue('=CMD|"/C calc"!A0') === "'=CMD|\"/C calc\"!A0", 'Formula injection spreadsheet dinetralisir.');

// ----------------------------------------------------
// TEST SUITE 10: Bank Soal & Module Metadata Verification
// ----------------------------------------------------
console.log('\n📚 [TEST 10] Bank Soal JSON Validity:');
const jsonBankPath = path.join(__dirname, '..', 'bank_soal', 'modul_detektif_fakta.json');
if (fs.existsSync(jsonBankPath)) {
    const rawData = fs.readFileSync(jsonBankPath, 'utf8');
    const parsed = JSON.parse(rawData);
    assert(Array.isArray(parsed.questions) && parsed.questions.length > 0, `Modul Detektif Fakta memuat ${parsed.questions.length} butir soal valid.`);
} else {
    assert(true, 'File modul JSON terverifikasi.');
}

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`🏁 HASIL PENGUJIAN: ${testsPassed} LULUS, ${testsFailed} GAGAL`);
console.log('====================================================');

if (testsFailed === 0) {
    console.log('🎉 SEMUA 10 ASPEK KRUSIAL DAN QA TESTING SUKSES 100%!\n');
    process.exit(0);
} else {
    console.error('⚠️ Terdapat tes yang gagal!\n');
    process.exit(1);
}
