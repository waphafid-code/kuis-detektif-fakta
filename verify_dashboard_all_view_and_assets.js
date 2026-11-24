/**
 * verify_dashboard_all_view_and_assets.js
 * - Tampilan dasbor "Semua Modul" crash (hasPanduan/hasPrivasi tak terdeklarasi): kedua deklarasi harus ada di tiap blok.
 * - gameId topik Learning Hub harus dikenali launchMiniGame.
 * - Tag cache-busting (?v=) seragam di kedua HTML agar HP siswa tidak memakai berkas lama.
 * - Tidak ada deklarasi fungsi ganda toggleApiKeyVisibility.
 */
const fs = require('fs'), assert = require('assert');
for (const base of ['.', 'src']) {
    const dash = fs.readFileSync(`${base}/js/dashboard.js`, 'utf8');
    assert((dash.match(/const hasPanduan = !!bestPanduan;/g) || []).length >= 2, `${base}: hasPanduan harus dideklarasikan di kedua blok`);
    assert((dash.match(/const hasPrivasi = !!bestPrivasi;/g) || []).length >= 2, `${base}: hasPrivasi harus dideklarasikan di kedua blok`);

    const mg = fs.readFileSync(`${base}/js/mini_games.js`, 'utf8');
    const hub = fs.readFileSync(`${base}/js/learning_hub.js`, 'utf8');
    const known = [...mg.matchAll(/case '([a-z_]+)':\s*\n\s*start/g)].map(m => m[1]);
    assert(known.length >= 6, `${base}: daftar game tidak terbaca`);
    for (const m of hub.matchAll(/gameId: '([a-z_]+)'/g)) assert(known.includes(m[1]), `${base}: gameId '${m[1]}' tidak dikenal launchMiniGame`);

    const ai = fs.readFileSync(`${base}/js/ai_studio.js`, 'utf8');
    assert((ai.match(/function toggleApiKeyVisibility\(/g) || []).length === 1, `${base}: toggleApiKeyVisibility harus tunggal`);

    const tags = new Set();
    for (const h of ['index.html', 'kuis_interaktif_dasbor_guru.html']) {
        const t = fs.readFileSync(`${base}/${h}`, 'utf8');
        for (const m of t.matchAll(/\.(?:js|css)\?v=([^"&]+)/g)) tags.add(m[1]);
    }
    assert.strictEqual(tags.size, 1, `${base}: tag cache harus seragam, ditemukan: ${[...tags].join(', ')}`);
}
console.log('✅ verify_dashboard_all_view_and_assets: LULUS');
