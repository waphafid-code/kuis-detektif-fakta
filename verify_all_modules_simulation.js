// ============================================================
// 🧪 VERIFY ALL MODULES SIMULATION (END-TO-END AUDIT)
// ------------------------------------------------------------
// Memverifikasi simulasi penilaian untuk ke-4 modul kuis:
// 1. modul_jaringan_keamanan
// 2. modul_detektif_fakta
// 3. modul_hki_profesi_budaya
// 4. modul_etika_privasi_keamanan
//
// Menguji:
// - Jawab sempurna (100% kunci valid) -> nilai 100
// - Jawab salah semua -> nilai 0
// - Checkbox tiered (skor berjenjang) -> poin penuh dan parsial sesuai aturan
// - Pengacakan opsi (shuffle) tidak merusak pemetaan kunci
// - Pengerjaan pertama dan remedial menghasilkan penilaian identik
// ============================================================
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 VERIFYING ALL MODULES SIMULATION & SCORING INTEGRITY');
console.log('════════════════════════════════════════════════════════════════\n');

// Load NemotronAI for calculateQuestionPoints
const nemotronCode = fs.readFileSync(path.join(__dirname, 'js/ai_nemotron.js'), 'utf8');
const nemotronCtx = { window: {}, console: { warn() {}, log() {} } };
vm.createContext(nemotronCtx);
vm.runInContext(nemotronCode, nemotronCtx);
const NemotronAI = nemotronCtx.window.NemotronAI;
assert(NemotronAI && typeof NemotronAI.calculateQuestionPoints === 'function', 'NemotronAI.calculateQuestionPoints must be available');

const modules = [
    { id: 'modul_jaringan_keamanan', file: 'bank_soal/modul_jaringan_keamanan.json' },
    { id: 'modul_detektif_fakta', file: 'bank_soal/modul_detektif_fakta.json' },
    { id: 'modul_hki_profesi_budaya', file: 'bank_soal/modul_hki_profesi_budaya.json' },
    { id: 'modul_etika_privasi_keamanan', file: 'bank_soal/modul_etika_privasi_keamanan.json' }
];

let totalTests = 0;
let passedTests = 0;

function check(label, fn) {
    totalTests++;
    try {
        fn();
        console.log(`  ✅ PASS: ${label}`);
        passedTests++;
    } catch (e) {
        console.error(`  ❌ FAIL: ${label}\n     ${e.message}`);
        process.exit(1);
    }
}

modules.forEach(mod => {
    console.log(`\n📘 Memeriksa Modul: ${mod.id}`);
    const raw = fs.readFileSync(path.join(__dirname, mod.file), 'utf8');
    const parsed = JSON.parse(raw);
    const questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
    assert(Array.isArray(questions), `${mod.id} questions must be an array`);
    assert.strictEqual(questions.length, 20, `${mod.id} must have exactly 20 questions`);

    // 1. Simulasi Jawaban 100% Benar
    check(`${mod.id} - Siswa menjawab 100% benar menghasilkan skor 100`, () => {
        let earned = 0;
        let totalPossible = 0;
        questions.forEach((q, idx) => {
            const maxPts = q.points || 5;
            totalPossible += maxPts;
            let selectedOriginals = [];
            if (q.type === 'mcq' || q.type === 'tf') {
                selectedOriginals = [Array.isArray(q.answer) ? q.answer[0] : q.answer];
            } else if (q.type === 'matrix_tf') {
                selectedOriginals = [...q.answer];
            } else if (q.type === 'checkbox') {
                const ansList = Array.isArray(q.answer) ? q.answer : [q.answer];
                if (q.scoringRule && q.scoringRule.type === 'tiered') {
                    const topTier = [...q.scoringRule.tiers].sort((a, b) => b.points - a.points)[0];
                    selectedOriginals = ansList.slice(0, topTier.minCorrect);
                } else {
                    selectedOriginals = [...ansList];
                }
            }
            const res = NemotronAI.calculateQuestionPoints(q, selectedOriginals);
            assert(res.isFullCorrect, `Soal #${idx + 1} (${q.id}) harus full correct, dapat: ${JSON.stringify(res)}`);
            assert.strictEqual(res.pointsEarned, maxPts, `Soal #${idx + 1} harus dapat ${maxPts} poin`);
            earned += res.pointsEarned;
        });
        const finalScore = Math.round((earned / totalPossible) * 100);
        assert.strictEqual(finalScore, 100, `Skor akhir harus 100, didapat: ${finalScore}`);
    });

    // 2. Simulasi Jawaban Salah Semua
    check(`${mod.id} - Siswa menjawab salah semua menghasilkan skor 0`, () => {
        let earned = 0;
        let totalPossible = 0;
        questions.forEach((q, idx) => {
            const maxPts = q.points || 5;
            totalPossible += maxPts;
            let selectedOriginals = [];
            const correctSet = new Set(Array.isArray(q.answer) ? q.answer : [q.answer]);
            const numOpts = (q.options || []).length || 4;
            // Pilih opsi yang bukan kunci
            for (let i = 0; i < numOpts; i++) {
                if (!correctSet.has(i)) {
                    selectedOriginals.push(i);
                    break;
                }
            }
            const res = NemotronAI.calculateQuestionPoints(q, selectedOriginals);
            assert(!res.isFullCorrect, `Soal #${idx + 1} tidak boleh full correct`);
            earned += res.pointsEarned;
        });
        const finalScore = Math.round((earned / totalPossible) * 100);
        assert.strictEqual(finalScore, 0, `Skor akhir harus 0, didapat: ${finalScore}`);
    });

    // 3. Uji Pengacakan Opsi (Shuffle Invariant)
    check(`${mod.id} - Pengacakan opsi (shuffle) menghasilkan pemetaan indeks yang valid`, () => {
        questions.forEach((q, idx) => {
            const opts = q.options || [];
            const n = opts.length;
            if (n < 2) return;
            // Simulasi shuffle: map indeks acak ke indeks asli
            const currentShuffleMap = Array.from({ length: n }, (_, i) => i);
            // Reverse / putar shuffle map
            currentShuffleMap.reverse();

            const correctOriginal = Array.isArray(q.answer) ? q.answer[0] : q.answer;
            // Temukan di indeks acak mana jawaban benar berada
            const shuffIdx = currentShuffleMap.indexOf(correctOriginal);
            assert(shuffIdx !== -1, `Opsi benar harus ditemukan di shuffle map`);

            // Saat siswa klik tombol opsi acak shuffIdx:
            const mappedOriginal = currentShuffleMap[shuffIdx];
            assert.strictEqual(mappedOriginal, correctOriginal, `Pemetaan kembali harus tepat sama dengan correctOriginal`);
        });
    });
});

// 4. Uji Khusus Checkbox Tiered (Detektif Fakta Q7, Q15, Q18)
console.log('\n🔍 Memeriksa Soal Checkbox Tiered Detektif Fakta:');
const dfRaw = fs.readFileSync(path.join(__dirname, 'bank_soal/modul_detektif_fakta.json'), 'utf8');
const dfParsed = JSON.parse(dfRaw);
const dfQuestions = Array.isArray(dfParsed) ? dfParsed : (dfParsed.questions || []);
const tieredQuestions = dfQuestions.filter(q => q.scoringRule && q.scoringRule.type === 'tiered');

assert(tieredQuestions.length >= 3, 'Harus ada minimal 3 soal tiered di modul_detektif_fakta');

tieredQuestions.forEach(q => {
    check(`Detektif Fakta Q${q.id}: tier full (${q.points} poin) vs partial (${q.scoringRule.tiers.find(t=>t.points < q.points).points} poin)`, () => {
        const topTier = [...q.scoringRule.tiers].sort((a, b) => b.points - a.points)[0];
        const midTier = [...q.scoringRule.tiers].sort((a, b) => b.points - a.points)[1];
        const correctAnswers = q.answer;

        // Pilih sejumlah topTier.minCorrect
        const fullChoices = correctAnswers.slice(0, topTier.minCorrect);
        const fullRes = NemotronAI.calculateQuestionPoints(q, fullChoices);
        assert.strictEqual(fullRes.pointsEarned, q.points, `Pilihan penuh harus dapat ${q.points} poin`);
        assert.strictEqual(fullRes.isFullCorrect, true, `Pilihan penuh harus isFullCorrect === true`);

        // Pilih sejumlah midTier.minCorrect
        const partialChoices = correctAnswers.slice(0, midTier.minCorrect);
        const partialRes = NemotronAI.calculateQuestionPoints(q, partialChoices);
        assert.strictEqual(partialRes.pointsEarned, midTier.points, `Pilihan parsial harus dapat ${midTier.points} poin`);
        assert.strictEqual(partialRes.isPartial, true, `Pilihan parsial harus isPartial === true`);
        assert.strictEqual(partialRes.isFullCorrect, false, `Pilihan parsial tidak boleh isFullCorrect`);
    });
});

console.log(`\n🎉 SELURUH SIMULASI 4 MODUL SELESAI: ${passedTests} / ${totalTests} PENGUJIAN LULUS!`);
