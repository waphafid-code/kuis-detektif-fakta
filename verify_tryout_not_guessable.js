/**
 * verify_tryout_not_guessable.js
 * Menjaga agar soal Try Out tidak bisa ditebak dari bentuk jawaban:
 * - kunci bukan opsi terpanjang pada mayoritas soal (sebelumnya 52 dari 60)
 * - panjang pengecoh sebanding dengan kunci
 * - posisi kunci tersebar merata A-E
 * - bank JSON dan array bawaan identik (root dan src)
 */
const fs = require('fs'), assert = require('assert');
const load = base => JSON.parse(fs.readFileSync(`${base}/bank_soal/modul_tryout_terpadu.json`, 'utf8'));
const builtin = base => {
    const t = fs.readFileSync(`${base}/js/quiz_manager.js`, 'utf8');
    const mk = 'window.TRYOUT_TERPADU_BUILTIN_QUESTIONS = ';
    const i = t.indexOf(mk), j = t.indexOf('\n];', i);
    return JSON.parse(t.slice(i + mk.length, j + 2));
};
for (const base of ['.', 'src']) {
    const bank = load(base), bi = builtin(base);
    assert.deepStrictEqual(bank, bi, `${base}: bank JSON dan array bawaan harus identik`);
    assert.strictEqual(bank.length, 60);
    let longest = 0; const pos = [0, 0, 0, 0, 0];
    for (const q of bank) {
        assert.strictEqual(q.options.length, 5, `soal ${q.id}: harus 5 opsi`);
        assert.strictEqual(new Set(q.options.map(o => o.trim().toLowerCase())).size, 5, `soal ${q.id}: opsi ganda`);
        const k = q.options[q.answer].length;
        const others = q.options.filter((_, i) => i !== q.answer).map(o => o.length);
        if (k >= Math.max(...others)) longest++;
        others.forEach(l => assert(l >= 0.75 * k && l <= 1.5 * k, `soal ${q.id}: panjang pengecoh tidak sebanding (${(l / k).toFixed(2)})`));
        pos[q.answer]++;
    }
    assert(longest <= 18, `${base}: kunci terlalu sering opsi terpanjang (${longest}/60)`);
    pos.forEach((c, i) => assert(c >= 6 && c <= 18, `${base}: posisi kunci ${i} tidak merata (${pos})`));
}
console.log('✅ verify_tryout_not_guessable: LULUS');
