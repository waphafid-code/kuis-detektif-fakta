/**
 * verify_ui_theme_contrast_css.js
 * Regresi UI/UX tema terang (25/11/2026):
 * - .btn-warning harus terdefinisi (dulu tidak, sehingga tombol remedial tampil abu-abu)
 * - CSS tidak boleh berisi selektor atribut dengan tanda kutip bersarang (membuat seluruh aturan diabaikan)
 * - kurung kurawal seimbang, root dan src identik
 * - tombol navigasi Ruang Belajar & pilihan Hoax Buster punya penyesuaian tema terang
 */
const fs = require('fs'), assert = require('assert');
const a = fs.readFileSync('css/style.css', 'utf8'), b = fs.readFileSync('src/css/style.css', 'utf8');
assert.strictEqual(a, b, 'css/style.css dan src/css/style.css harus identik');
assert(/\.btn-warning\s*\{/.test(a), '.btn-warning harus terdefinisi');
assert(!/\[style[*^$~|]?=""/.test(a), 'selektor atribut dengan tanda kutip bersarang ditemukan');
let d = 0; for (const ch of a) { if (ch === '{') d++; if (ch === '}') d--; assert(d >= 0, 'kurung kurawal tidak seimbang'); }
assert.strictEqual(d, 0, 'kurung kurawal tidak seimbang');
['.btn-learn-nav:not(.btn-learn-primary)', '.btn-hoax-choice .choice-text', '.btn-sim-action', '#cheat-warning-chances strong']
    .forEach(s => assert(a.includes(`[data-theme="light"] ${s}`), `penyesuaian tema terang untuk ${s} hilang`));
console.log('✅ verify_ui_theme_contrast_css: LULUS');
