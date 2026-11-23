/**
 * verify_delete_score_per_module.js
 * Menjaga agar penghapusan nilai guru bekerja untuk SEMUA modul (termasuk Tryout Terpadu):
 * - modal memuat pilihan 5 modul + "all"
 * - tombstone ditulis per modul terpilih
 * - Supabase tidak lagi menghapus semua modul saat hanya Detektif Fakta yang dipilih
 * - normalizeModuleId tidak mencampur Etika (berisi kata "keamanan") dengan Jaringan
 */
const fs = require('fs'), assert = require('assert'), vm = require('vm');
for (const base of ['js', 'src/js']) {
    const dash = fs.readFileSync(`${base}/dashboard.js`, 'utf8');
    ['modul_tryout_terpadu', 'modul_detektif_fakta', 'modul_jaringan_keamanan', 'modul_hki_profesi_budaya', 'modul_etika_privasi_keamanan'].forEach(id =>
        assert(dash.includes(`id: '${id}'`), `${base}/dashboard.js: DELETE_MODULE_CHOICES harus memuat ${id}`));
    assert(dash.includes('deletedRecords.push(`${normName}|${normCls}|${chosenModule}`)'), `${base}: tombstone per modul terpilih`);
    assert(!/chosenModule === 'modul_detektif_fakta'\) \{\s*await supabaseClient\.from\('quiz_results'\)\.delete\(\)\s*\.eq\('student_name', target\.name\)\s*\.eq\('student_class', target\.cls\);\s*\}/.test(dash), `${base}: Supabase tidak boleh menghapus semua modul untuk Detektif Fakta`);
    assert(dash.includes(".eq('wrong_questions->>moduleId', chosenModule)"), `${base}: Supabase harus memfilter moduleId terpilih`);

    const audio = fs.readFileSync(`${base}/audio.js`, 'utf8');
    const sb = { window: { addEventListener() {} }, document: { addEventListener() {} }, localStorage: { getItem: () => null, setItem() {} } };
    vm.createContext(sb); vm.runInContext(audio, sb);
    const n = sb.window.normalizeModuleId;
    assert.strictEqual(n('modul_etika_privasi_keamanan'), 'modul_etika_privasi_keamanan');
    assert.strictEqual(n('modul_hki_profesi_budaya'), 'modul_hki_profesi_budaya');
    assert.strictEqual(n('modul_tryout_terpadu'), 'modul_tryout_terpadu');
    assert.strictEqual(n('modul_keamanan_jaringan'), 'modul_jaringan_keamanan');
    assert.strictEqual(n('modul_detektif_fakta'), 'modul_detektif_fakta');
}
console.log('✅ verify_delete_score_per_module: LULUS');
