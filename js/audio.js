//  📂 DATA PERSISTENCE & MYSQL SYNC
// ============================================================
let _toastTimer = null;
function showToast(text, icon = 'ℹ️') {
    const toast = document.getElementById('toast-msg');
    if (!toast) return;
    toast.innerHTML = `<span style="font-size: 1.3rem;">${icon}</span> <span>${text}</span>`;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
    // Satu timer saja: toast baru tidak boleh ditutup lebih awal oleh timer toast sebelumnya
    if (_toastTimer) clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        toast.style.opacity = '0';
        _toastTimer = null;
    }, 3200);
}

function normalizeModuleId(modId, id, date) {
    if (modId) {
        const s = String(modId).toLowerCase();
        // ID resmi lain dikembalikan apa adanya (mencegah Etika "keamanan" tercampur dengan Jaringan)
        if (s === 'modul_etika_privasi_keamanan' || s === 'modul_hki_profesi_budaya' || s === 'modul_tryout_terpadu') return s;
        if (s === 'modul_jaringan_keamanan' || s === 'modul_keamanan_jaringan' || s.includes('jaringan') || s.includes('keamanan')) {
            return 'modul_jaringan_keamanan';
        }
        if (s === 'modul_detektif_fakta' || s.includes('detektif') || s.includes('fakta')) {
            return 'modul_detektif_fakta';
        }
        return modId;
    }
    if (typeof id === 'string' && (id.startsWith('jki-') || id.includes('jaringan') || id.includes('keamanan'))) return 'modul_jaringan_keamanan';
    if (typeof id === 'string' && id.startsWith('pdf-')) return 'modul_detektif_fakta';
    return 'modul_detektif_fakta';
}
window.normalizeModuleId = normalizeModuleId;

// 🚫 Catatan "remedial 90" karangan (commit c7b74fc) yang mungkin sudah terlanjur tersimpan di cloud / perangkat lain.
// Dikenali dari tanda tangannya: siswa-modul yang dikoreksi + remedialScore 90 + 18 benar. Selalu diabaikan saat penggabungan.
let _poisonKeyCache = null;
function _poisonedKeys() {
    if (_poisonKeyCache) return _poisonKeyCache;
    const set = new Set();
    try {
        const ids = (typeof window !== 'undefined' && Array.isArray(window.OFFICIAL_CORRECTED_RECORD_IDS)) ? window.OFFICIAL_CORRECTED_RECORD_IDS : [];
        getCleanOfficialBaseline().filter(r => ids.includes(r.id)).forEach(r => {
            const modId = normalizeModuleId(r.moduleId, r.id, r.date);
            set.add(`${(r.name || '').toLowerCase().trim()}|${(r.class || '').replace(/\s+/g, '').toUpperCase()}|${modId}`);
        });
    } catch (e) {}
    if (set.size) _poisonKeyCache = set;
    return set;
}
function isPoisonedRemedialRecord(r) {
    if (!r) return false;
    const rs = (r.remedialScore !== undefined && r.remedialScore !== null) ? Number(r.remedialScore) : null;
    if (rs !== 90 || Number(r.correct) !== 18) return false;
    const dt = String(r.date || r.quiz_date || '');
    if (!(dt.includes('20/11/2026') || dt.includes('2026-11-20'))) return false; // remedial ulang sah (>= 21/11) tidak ikut diblokir
    const modId = normalizeModuleId(r.moduleId || r.module_id, r.id, r.date || r.quiz_date);
    const k = `${(r.name || r.student_name || '').toLowerCase().trim()}|${(r.class || r.student_class || '').replace(/\s+/g, '').toUpperCase()}|${modId}`;
    return _poisonedKeys().has(k);
}
window.isPoisonedRemedialRecord = isPoisonedRemedialRecord;

// 🧾 Snapshot satu sesi pengerjaan (pertama / remedial) agar jawaban kedua sesi TIDAK tercampur saat digabung
function snapshotAttempt(x, asRemedial) {
    if (!x) return null;
    const hasReal = Array.isArray(x.detailedAnswers) && x.detailedAnswers.some(a => a);
    const hasAns = Array.isArray(x.studentAnswers) && x.studentAnswers.length > 0;
    return {
        score: asRemedial ? Number((x.remedialScore !== undefined && x.remedialScore !== null) ? x.remedialScore : x.score) : Number(x.score),
        correct: x.correct, total: x.total, partialCount: x.partialCount,
        topicBreakdown: x.topicBreakdown || null,
        wrongQuestions: Array.isArray(x.wrongQuestions) ? x.wrongQuestions : [],
        detailedAnswers: hasReal ? x.detailedAnswers : null,
        studentAnswers: hasAns ? x.studentAnswers : null,
        hasRealAnswers: hasReal || hasAns,
        date: x.date, time: x.time, duration: x.duration,
        timestamp: x.timestamp, tabSwitchCount: x.tabSwitchCount || 0
    };
}
function pickAttempts(a, b) {
    const list = [a, b].filter(Boolean);
    const firsts = [], rems = [];
    list.forEach(x => {
        if (x.firstAttempt) firsts.push(x.firstAttempt);
        else if (!x.isRemedial && !x.adjustedByTeacher) firsts.push(snapshotAttempt(x, false));
        if (x.remedialAttempt) rems.push(x.remedialAttempt);
        else if ((x.isRemedial || x.adjustedByTeacher) && !x.firstAttempt) rems.push(snapshotAttempt(x, true));
    });
    const byTs = (p, q) => (Number(p.timestamp) || 0) - (Number(q.timestamp) || 0);
    firsts.sort(byTs); rems.sort(byTs);
    return { firstAttempt: firsts[0] || null, remedialAttempt: rems.length ? rems[rems.length - 1] : null };
}
window.snapshotAttempt = snapshotAttempt;

function mergeRecordsList(existingList, incomingList) {
    const map = new Map();
    const makeKey = (r) => {
        const modId = normalizeModuleId(r.moduleId || r.module_id, r.id, r.date || r.quiz_date);
        const normCls = (r.class || r.student_class || '').replace(/\s+/g, '').toUpperCase();
        const normName = (r.name || r.student_name || '').toLowerCase().trim();
        return `${normName}|${normCls}|${modId}`;
    };
    
    (existingList || []).forEach(r => {
        if (r && (r.name || r.student_name) && !isPoisonedRemedialRecord(r)) {
            const modId = normalizeModuleId(r.moduleId || r.module_id, r.id, r.date || r.quiz_date);
            const item = {
                ...r,
                moduleId: modId,
                moduleTitle: r.moduleTitle || (modId === 'modul_tryout_terpadu' ? 'Tryout Terpadu 60 Soal (6 Materi)' : (modId === 'modul_jaringan_keamanan' ? 'Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital' : 'Misi Detektif Fakta'))
            };
            map.set(makeKey(item), item);
        }
    });

    (incomingList || []).forEach(r => {
        if (!r || (!r.name && !r.student_name) || isPoisonedRemedialRecord(r)) return;
        const modId = normalizeModuleId(r.moduleId || r.module_id, r.id, r.date || r.quiz_date);
        const item = {
            ...r,
            moduleId: modId,
            moduleTitle: r.moduleTitle || (modId === 'modul_tryout_terpadu' ? 'Tryout Terpadu 60 Soal (6 Materi)' : (modId === 'modul_jaringan_keamanan' ? 'Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital' : 'Misi Detektif Fakta'))
        };
        const k = makeKey(item);
        if (!map.has(k)) {
            map.set(k, item);
        } else {
            const cur = map.get(k);
            // 🏆 AMBIL NILAI TERTINGGI: Selalu pertahankan skor tertinggi dari seluruh percobaan
            const origScore = (cur.originalScore !== undefined && cur.originalScore !== null)
                ? Number(cur.originalScore)
                : ((item.originalScore !== undefined && item.originalScore !== null)
                    ? Number(item.originalScore)
                    : Math.min(Number(cur.score) || 0, Number(item.score) || 0));
            const isRem = !!(cur.isRemedial || item.isRemedial) && (origScore < 80);
            const bestScore = Math.max(Number(cur.score) || 0, Number(item.score) || 0);
            const isSameSubmission = (cur.submissionProofId && item.submissionProofId && cur.submissionProofId === item.submissionProofId) || (cur.id && item.id && cur.id === item.id);
            // Simpan capaian remedial mentah apa adanya. Jangan campur dengan
            // nilai resmi/awal: jika remedial 60 sementara nilai awal 79, kolom
            // "Nilai Remedial" harus tetap 60, sedangkan nilai rapor resmi 79.
            const recordedRemedialScores = [cur.remedialScore, item.remedialScore]
                .filter(value => value !== undefined && value !== null && Number.isFinite(Number(value)))
                .map(value => Math.max(0, Math.min(100, Number(value))));
            const hasRecordedRemedialScore = recordedRemedialScores.length > 0;
            const bestRemScore = hasRecordedRemedialScore
                ? Math.max(...recordedRemedialScores)
                : (isRem ? bestScore : 0);
            // 🧑‍🏫 Penyesuaian resmi guru (mis. koreksi kesalahan sistem) selalu menang atas hitungan otomatis
            const adj = [cur, item].find(x => x && x.adjustedByTeacher && x.adjustedScore != null);
            const finalScore = adj ? Number(adj.adjustedScore) : (isRem ? Math.min(80, Math.max(origScore, bestRemScore || 0)) : bestScore);
            const higher = (Number(item.score) || 0) >= (Number(cur.score) || 0) ? item : cur;
            map.set(k, {
                ...cur,
                ...item,
                score: finalScore,
                isRemedial: isRem || !!adj,
                ...(adj ? { adjustedByTeacher: true, adjustedScore: Number(adj.adjustedScore), adjustmentNote: adj.adjustmentNote || '' } : {}),
                originalScore: (isRem || adj) ? origScore : (cur.originalScore ?? item.originalScore ?? null),
                remedialScore: (isRem || adj) ? (hasRecordedRemedialScore ? bestRemScore : (isRem ? bestRemScore : finalScore)) : null,
                correct: higher.correct !== undefined ? higher.correct : (item.correct !== undefined ? item.correct : cur.correct),
                topicBreakdown: higher.topicBreakdown || item.topicBreakdown || cur.topicBreakdown || null,
                wrongQuestions: higher.wrongQuestions || item.wrongQuestions || cur.wrongQuestions,
                detailedAnswers: higher.detailedAnswers || item.detailedAnswers || cur.detailedAnswers,
                studentAnswers: higher.studentAnswers || item.studentAnswers || cur.studentAnswers,
                ...pickAttempts(cur, item)
            });
        }
    });

    return Array.from(map.values());
}
window.mergeRecordsList = mergeRecordsList;

function purgeFakeJkiRecords(list) {
    if (!Array.isArray(list)) return [];
    return list.filter(r => {
        if (!r) return false;
        // Hanya bersihkan ID fiktif murni (jki-rec lama tanpa student match), pertahankan jki-official-
        if (typeof r.id === 'string' && r.id.startsWith('jki-rec-')) return false;
        // Bersihkan tanggal fiktif bulan Agustus 2026 untuk modul Keamanan Jaringan karena kuis baru dibuat Oktober 2026
        if (r.moduleId === 'modul_jaringan_keamanan') {
            const dt = String(r.date || r.quiz_date || '');
            if (dt.includes('/8/2026') || dt.includes('-08-') || dt.includes('25/8') || dt.includes('27/8') || dt.includes('28/8') || dt.includes('29/8')) {
                return false;
            }
        }
        return true;
    });
}
window.purgeFakeJkiRecords = purgeFakeJkiRecords;

// 🗑️ Helper filter data yang telah resmi dihapus oleh Guru (Tombstones)
// Waktu kirim nilai (ms). 0 bila tidak diketahui (mis. data baseline bawaan) sehingga tetap dianggap lama.
function getRecordSubmitTime(r) {
    const cands = [r && r.submittedAt, r && r.submitted_at, r && r.timestamp];
    for (const c of cands) {
        const n = Number(c);
        if (Number.isFinite(n) && n > 1e12) return n;
    }
    return 0;
}
window.getRecordSubmitTime = getRecordSubmitTime;

// Tombstone lama (sebelum ada cap waktu) dianggap dibuat sebelum batas ini; tombstone baru memakai waktu hapus sebenarnya.
const LEGACY_DELETE_CUTOFF_MS = Date.parse('2026-11-28T00:00:00+07:00');
const DELETED_AT_KEY = 'quizmaster_deleted_at';
function getDeletedAtMap() {
    try {
        const m = JSON.parse(localStorage.getItem(DELETED_AT_KEY) || '{}');
        return (m && typeof m === 'object' && !Array.isArray(m)) ? m : {};
    } catch (e) { return {}; }
}
function markDeletedAt(keys, atMs) {
    try {
        const m = getDeletedAtMap();
        const t = Number(atMs) || Date.now();
        (Array.isArray(keys) ? keys : [keys]).forEach(k => { if (k && !(m[k] >= t)) m[k] = t; });
        localStorage.setItem(DELETED_AT_KEY, JSON.stringify(m));
    } catch (e) {}
}
window.getDeletedAtMap = getDeletedAtMap;
window.markDeletedAt = markDeletedAt;

function filterDeletedRecords(list) {
    if (!Array.isArray(list) || list.length === 0) return [];
    let deletedKeys = new Set();
    try {
        const rawDel = JSON.parse(localStorage.getItem('quizmaster_deleted_records') || '[]');
        if (Array.isArray(rawDel)) {
            deletedKeys = new Set(rawDel);
        }
    } catch(e) {}
    if (!deletedKeys.size) return list;
    if (deletedKeys.has('__ALL__')) return [];

    const deletedAt = getDeletedAtMap();
    return list.filter(r => {
        if (!r) return false;
        const normName = (r.name || r.student_name || '').toLowerCase().trim();
        const normCls = (r.class || r.student_class || '').replace(/\s+/g, '').toUpperCase();
        const modId = normalizeModuleId(r.moduleId || r.module_id, r.id, r.date || r.quiz_date);
        const k = `${normName}|${normCls}|${modId}`;
        const kAll = `${normName}|${normCls}|all`;
        const hit = deletedKeys.has(k) ? k : (deletedKeys.has(kAll) ? kAll : null);
        if (hit) {
            // ⏱️ Penghapusan hanya berlaku untuk nilai yang dikirim SEBELUM guru menghapus.
            // Nilai baru (pengerjaan ulang setelah dihapus guru) harus tetap tampil.
            const delAt = deletedAt[hit] || LEGACY_DELETE_CUTOFF_MS;
            const subAt = getRecordSubmitTime(r);
            if (!(subAt && subAt > delAt)) return false;
        }
        if (r.id && deletedKeys.has(String(r.id))) return false;
        return true;
    });
}
window.filterDeletedRecords = filterDeletedRecords;

const OFFICIAL_DATA_SYNC_KEY = 'quizmaster_official_pdf_sync_ver';
const CURRENT_OFFICIAL_VERSION = '20261128_official_remedial_fix_v13';

function getCleanOfficialBaseline() {
    const raw = (typeof OFFICIAL_EXAM_RESULTS !== 'undefined' && Array.isArray(OFFICIAL_EXAM_RESULTS))
        ? OFFICIAL_EXAM_RESULTS
        : ((typeof window !== 'undefined' && Array.isArray(window.OFFICIAL_EXAM_RESULTS)) ? window.OFFICIAL_EXAM_RESULTS : []);
    return purgeFakeJkiRecords(raw);
}

function getCleanDemoBaseline() {
    const rawDemo = (typeof DEFAULT_DEMO_RECORDS !== 'undefined' && Array.isArray(DEFAULT_DEMO_RECORDS))
        ? DEFAULT_DEMO_RECORDS
        : ((typeof window !== 'undefined' && Array.isArray(window.DEFAULT_DEMO_RECORDS)) ? window.DEFAULT_DEMO_RECORDS : []);
    return rawDemo;
}

// 🛡️ CLOUD STUDENT SUBMISSION VERIFIER (MENCEGAH BYPASS VIA INCOGNITO / HAPUS CACHE & MENEMUKAN NILAI REMEDIAL)
async function checkCloudStudentSubmission(name, cls, targetModId) {
    if (!name || !cls) return [];
    const results = [];
    const seenKeys = new Set();

    const pushIfMatch = (rName, rCls, rModRaw, id, date, payload) => {
        const cMatch = (typeof isClassEquivalent === 'function')
            ? isClassEquivalent(rCls, cls)
            : (rCls || '').replace(/\s+/g, '').toUpperCase() === cls.replace(/\s+/g, '').toUpperCase();
        const nMatch = (typeof isNameEquivalent === 'function')
            ? isNameEquivalent(rName, name)
            : (rName || '').trim().toLowerCase() === name.trim().toLowerCase();
        const rMod = (typeof normalizeModuleId === 'function')
            ? normalizeModuleId(rModRaw, id, date)
            : (rModRaw || 'modul_detektif_fakta');
        if (cMatch && nMatch && rMod === targetModId) {
            const sig = `${payload.score}|${payload.date || ''}|${payload.isRemedial ? 1 : 0}|${payload.remedialScore ?? ''}`;
            if (!seenKeys.has(sig)) {
                seenKeys.add(sig);
                results.push(payload);
            }
        }
    };

    const withTimeout = (promise, ms = 3000) => Promise.race([
        promise,
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))
    ]);

    await Promise.allSettled([
        // 1. Cek dari Cloud Supabase
        withTimeout((async () => {
            const cfg = (typeof getSupabaseConfig === 'function') ? getSupabaseConfig() : { table: 'quiz_results' };
            const client = window.supabaseClient || (typeof initSupabaseClient === 'function' ? initSupabaseClient() : null);
            if (!client) return;
            const { data, error } = await client
                .from(cfg.table || 'quiz_results')
                .select('id, student_name, student_class, score, quiz_date, time_str, duration, wrong_questions')
                .ilike('student_name', name.trim())
                .limit(15);

            if (!error && Array.isArray(data)) {
                data.forEach(r => {
                    const wq = (r.wrong_questions && typeof r.wrong_questions === 'object' && !Array.isArray(r.wrong_questions)) ? r.wrong_questions : {};
                    pushIfMatch(r.student_name, r.student_class, wq.moduleId || r.module_id, r.id, r.quiz_date, {
                        id: r.id,
                        name: r.student_name,
                        class: r.student_class,
                        score: Number(r.score) || 0,
                        date: r.quiz_date,
                        time: r.time_str,
                        duration: r.duration,
                        moduleId: targetModId,
                        moduleTitle: wq.moduleTitle || '',
                        isRemedial: !!wq.isRemedial,
                        originalScore: wq.originalScore,
                        remedialScore: wq.remedialScore
                    });
                });
            }
        })(), 3000),
        // 2. Cek juga dari Firebase RTDB agar riwayat remedial / kuis tidak pernah terlewat
        withTimeout((async () => {
            // Hanya ambil catatan siswa ini (bukan seluruh basis data) agar 1000 siswa tidak saling membebani
            const fbList = (typeof fetchFirebaseRecordsForStudent === 'function')
                ? await fetchFirebaseRecordsForStudent(name, cls)
                : (typeof fetchFirebaseRecords === 'function' ? await fetchFirebaseRecords() : []);
            if (!Array.isArray(fbList)) return;
            fbList.forEach(r => {
                if (!r) return;
                pushIfMatch(r.name, r.class, r.moduleId, r.id, r.date, r);
            });
        })(), 6000)
    ]);

    return results;
}
window.checkCloudStudentSubmission = checkCloudStudentSubmission;

// 🛡️ SAFE STORAGE SETTER DENGAN PENANGANAN QUOTAEXCEEDEDERROR
function safeLocalStorageSet(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (err) {
        const isQuota = (err && (err.name === 'QuotaExceededError' || err.code === 22 || err.code === 1014));
        if (isQuota) {
            console.warn('⚠️ [Storage Quota Exceeded]: Menyelamatkan memori lokal dari overload...');
            try {
                localStorage.removeItem('quizmaster_emergency_backup_records');
                if (key === 'quizmaster_records' || (typeof STORAGE_KEY !== 'undefined' && key === STORAGE_KEY)) {
                    let parsed = JSON.parse(value);
                    if (Array.isArray(parsed) && parsed.length > 200) {
                        parsed = parsed.slice(-200);
                        localStorage.setItem(key, JSON.stringify(parsed));
                        return true;
                    }
                }
            } catch (e2) {}
        }
        return false;
    }
}
window.safeLocalStorageSet = safeLocalStorageSet;

// 🩹 Koreksi data resmi: catatan yang pernah tertimpa angka seragam (remedial 90) dipulihkan ke nilai tercatat asli,
// termasuk pada salinan localStorage perangkat yang sudah terlanjur menyimpan angka keliru (merge "nilai tertinggi" tidak bisa menurunkannya).
function applyOfficialCorrections(list) {
    try {
        const ids = (typeof window !== 'undefined' && Array.isArray(window.OFFICIAL_CORRECTED_RECORD_IDS)) ? window.OFFICIAL_CORRECTED_RECORD_IDS : [];
        if (!ids.length || !Array.isArray(list)) return list;
        const fix = new Map(getCleanOfficialBaseline().filter(r => ids.includes(r.id)).map(r => {
            const modId = normalizeModuleId(r.moduleId, r.id, r.date);
            return [`${(r.name || '').toLowerCase().trim()}|${(r.class || '').replace(/\s+/g, '').toUpperCase()}|${modId}`, r];
        }));
        return list.map(r => {
            if (!r) return r;
            const modId = normalizeModuleId(r.moduleId || r.module_id, r.id, r.date || r.quiz_date);
            const k = `${(r.name || r.student_name || '').toLowerCase().trim()}|${(r.class || r.student_class || '').replace(/\s+/g, '').toUpperCase()}|${modId}`;
            return fix.has(k) ? { ...fix.get(k), moduleId: modId } : r;
        });
    } catch (e) { return list; }
}
window.applyOfficialCorrections = applyOfficialCorrections;

function loadRecords() {
    try {
        const syncVer = localStorage.getItem(OFFICIAL_DATA_SYNC_KEY);
        const baseline = getCleanOfficialBaseline();
        const demoBaseline = getCleanDemoBaseline();
        const combinedBaseline = mergeRecordsList(baseline, demoBaseline);
        
        let saved = [];
        try {
            saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch(e) {}
        
        let emergency = [];
        try {
            emergency = JSON.parse(localStorage.getItem('quizmaster_emergency_backup_records') || '[]');
        } catch(e) {}

        saved = purgeFakeJkiRecords(saved);
        emergency = purgeFakeJkiRecords(emergency);

        // Jika versi sinkronisasi belum versi bersih terbaru, paksa pembersihan localStorage
        if (syncVer !== CURRENT_OFFICIAL_VERSION) {
            const mergedClean = applyOfficialCorrections(filterDeletedRecords(mergeRecordsList(combinedBaseline, saved)));
            safeLocalStorageSet(STORAGE_KEY, JSON.stringify(mergedClean));
            safeLocalStorageSet('quizmaster_emergency_backup_records', JSON.stringify(filterDeletedRecords(emergency)));
            safeLocalStorageSet(OFFICIAL_DATA_SYNC_KEY, CURRENT_OFFICIAL_VERSION);
            return mergedClean;
        }

        let baseList = combinedBaseline;
        if (Array.isArray(saved) && saved.length > 0) {
            baseList = mergeRecordsList(combinedBaseline, saved);
        }
        if (Array.isArray(emergency) && emergency.length > 0) {
            baseList = mergeRecordsList(baseList, emergency);
        }

        baseList = filterDeletedRecords(purgeFakeJkiRecords(baseList));
        return baseList;
    } catch (e) {
        return filterDeletedRecords(mergeRecordsList(getCleanOfficialBaseline(), getCleanDemoBaseline()));
    }
}
window.loadRecords = loadRecords;

function restoreOfficialPdfRecords() {
    sfxClick();
    const clean = getCleanOfficialBaseline();
    if (clean.length > 0) {
        // Pertahankan seluruh pengerjaan modul lain yang ada di penyimpanan lokal
        let currentSaved = [];
        try {
            currentSaved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        } catch(e) {}
        const merged = mergeRecordsList(clean, currentSaved);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        localStorage.removeItem('detektif_fakta_records');
        localStorage.removeItem('quizmaster_deleted_records'); // Reset daftar hapus saat guru ingin memulihkan penuh
        localStorage.setItem(OFFICIAL_DATA_SYNC_KEY, CURRENT_OFFICIAL_VERSION);
        if (typeof renderDashboard === 'function') renderDashboard();
        // Tarik kembali pembaruan terbaru dari Supabase Cloud
        if (typeof syncWithBackend === 'function') syncWithBackend(true);
        showToast(`✅ Basis data disinkronkan: ${merged.length} nilai kuis resmi telah dimuat!`, '📥');
    }
}
window.restoreOfficialPdfRecords = restoreOfficialPdfRecords;
window.initOfficialBaselineRecords = restoreOfficialPdfRecords;

async function saveRecord(record) {
    if (!record) return;

    // 🛡️ SECURITY & DATA INTEGRITY VALIDATION:
    // 1. Sanitasi string dasar
    record.name = String(record.name || 'Siswa').trim().slice(0, 100);
    record.class = String(record.class || '-').trim().slice(0, 50);

    // 2. Validasi rentang skor (0 - 100) & jumlah benar/total
    const totalQ = Number(record.total) || (window.quizData ? window.quizData.length : 20);
    record.total = Math.max(1, totalQ);
    const correctCount = Number(record.correct) || 0;
    record.correct = Math.max(0, Math.min(record.total, correctCount));
    
    let numericScore = Number(record.score);
    if (isNaN(numericScore) || numericScore < 0) numericScore = 0;
    if (numericScore > 100) numericScore = 100;
    record.score = Math.round(numericScore);

    // 3. Deteksi anomali kecepatan mustahil (Anti-Bot / Script Tampering di console)
    // Hanya flag jika durasi benar-benar mustahil secara biologis/fisik (< 1000ms untuk >= 10 soal dengan skor > 80)
    // dan bukan akun pengujian guru (Rini Syafitri / Guru / Penguji / Admin / Test)
    const isTesterOrTeacher = /guru|rini|admin|test|uji/i.test(String(record.name || ''));
    if (!isTesterOrTeacher && record.rawDurationMs && record.rawDurationMs > 0 && record.rawDurationMs < 1000 && record.total >= 10 && record.score > 80 && !record.isCheated) {
        record.isCheated = true;
        record.statusNote = '🚨 DISKUALIFIKASI (Anomali Kecepatan Mustahil: < 1 Detik)';
        record.score = 0;
    }

    const modId = normalizeModuleId(record.moduleId, record.id, record.date);
    record.moduleId = modId;
    if (!record.moduleTitle) {
        record.moduleTitle = (modId === 'modul_jaringan_keamanan') 
            ? 'Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital' 
            : 'Misi Detektif Fakta';
    }

    // 🛡️ BUKTI OTENTIKASI & VERIFIKASI PENGERJAAN RESMI (SUBMISSION RECEIPT CODE)
    const safeClsCode = (record.class || 'XE').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    const proofCode = `SMAN4-${safeClsCode}-${record.score}-${Date.now().toString(36).toUpperCase()}`;
    record.submissionProofId = proofCode;
    window.lastSubmittedProofId = proofCode;
    if (!record.submittedAt) record.submittedAt = Date.now();

    // 🛡️ EMERGENCY REDUNDANT BACKUP: Simpan langsung ke cadangan darurat lokal
    try {
        const emergencyList = JSON.parse(localStorage.getItem('quizmaster_emergency_backup_records') || '[]');
        emergencyList.push({ ...record, savedAt: Date.now() });
        if (emergencyList.length > 200) emergencyList.shift();
        localStorage.setItem('quizmaster_emergency_backup_records', JSON.stringify(emergencyList));
    } catch(e) {}

    // 🛡️ UN-TOMBSTONE: Bersihkan kunci penghapusan siswa ini karena telah mengirimkan nilai baru resmi
    try {
        const normName = String(record.name || '').trim().toLowerCase();
        const normCls = String(record.class || '').replace(/\s+/g, '').toUpperCase();
        const curMod = record.moduleId || 'modul_detektif_fakta';
        const key = `${normName}|${normCls}|${curMod}`;
        const keyAll = `${normName}|${normCls}|all`;

        let delList = [];
        try {
            delList = JSON.parse(localStorage.getItem('quizmaster_deleted_records') || '[]');
        } catch(e) {
            delList = [];
        }
        if (Array.isArray(delList) && delList.length > 0) {
            delList = delList.filter(k => k !== key && k !== keyAll && k !== normName);
            localStorage.setItem('quizmaster_deleted_records', JSON.stringify(delList));
        }

        // Hapus tombstone dari Firebase RTDB jika ada
        const cfgFb = (typeof getFirebaseConfig === 'function') ? getFirebaseConfig() : null;
        const dbUrl = (cfgFb && cfgFb.databaseURL) ? cfgFb.databaseURL.replace(/\/$/, '') : 'https://kuis-informatika-c8781-default-rtdb.firebaseio.com';
        const safeKey = `del_${encodeURIComponent(normName).replace(/[^a-zA-Z0-9]/g, '_')}_${encodeURIComponent(normCls).replace(/[^a-zA-Z0-9]/g, '_')}_${encodeURIComponent(curMod).replace(/[^a-zA-Z0-9]/g, '_')}`;
        const safeKeyAll = `del_${encodeURIComponent(normName).replace(/[^a-zA-Z0-9]/g, '_')}_${encodeURIComponent(normCls).replace(/[^a-zA-Z0-9]/g, '_')}_all`;
    } catch(e) {}

    const currentRecords = loadRecords();
    const merged = mergeRecordsList(currentRecords, [record]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

    // Broadcast event lokal untuk real-time sinkronisasi dasbor guru
    try {
        window.dispatchEvent(new CustomEvent('quizmaster_new_record', { detail: record }));
    } catch(e) {}

    let savedToFirebase = false;
    let savedToSupabase = false;

    const cfg = (typeof getSupabaseConfig === 'function') ? getSupabaseConfig() : { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_ANON_KEY, table: 'quiz_results' };
    
    // Simpan moduleId, moduleTitle, dan proofId di dalam wrong_questions JSON payload (kompatibel penuh dengan Supabase jsonb)
    const rowPayload = {
        student_name: record.name,
        student_class: record.class,
        score: record.score,
        correct_count: record.correct,
        total_questions: record.total || (window.quizData ? window.quizData.length : 20),
        wrong_questions: {
            list: Array.isArray(record.wrongQuestions) ? record.wrongQuestions : [],
            ans: Array.isArray(record.studentAnswers) ? record.studentAnswers : [],
            moduleId: modId,
            moduleTitle: record.moduleTitle,
            proofId: proofCode,
            isRemedial: !!record.isRemedial,
            originalScore: record.isRemedial ? (record.originalScore ?? null) : null,
            remedialScore: record.isRemedial ? (record.remedialScore ?? null) : null,
            topicBreakdown: record.topicBreakdown || null,
            detailedAnswers: Array.isArray(record.detailedAnswers) ? record.detailedAnswers : null
        },
        topic_breakdown: record.topicBreakdown || null,
        detailed_answers: Array.isArray(record.detailedAnswers) ? record.detailedAnswers : null,
        duration: record.duration,
        time_str: record.time,
        quiz_date: record.date
    };

    // 🚀 Simpan ke Google Firebase dan Supabase secara PARALEL (Promise.allSettled)
    // Mengurangi waktu tunggu dari 5.5 detik menjadi maksimal ~2 detik
    const syncPromises = [];

    // 1. Google Firebase Realtime Database (REST API)
    if (typeof saveRecordToFirebase === 'function') {
        const fbTask = (async () => {
            const fbPromise = saveRecordToFirebase(record, proofCode);
            const fbTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 8000));
            const ok = await Promise.race([fbPromise, fbTimeout]);
            if (ok) {
                savedToFirebase = true;
                console.log('🔥 [Firebase RTDB] Nilai siswa berhasil disimpan! ID Bukti:', proofCode);
            }
        })().catch(fbErr => {
            console.warn('Firebase save warning:', fbErr.message);
        });
        syncPromises.push(fbTask);
    }

    // 2. Cloud Supabase (SDK / REST)
    if (supabaseClient) {
        const spTask = (async () => {
            const spTimeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase timeout')), 8000));
            let { error } = await Promise.race([supabaseClient.from(cfg.table || 'quiz_results').insert([rowPayload]), spTimeout]);
            if (error) {
                // Skema tabel lama tanpa kolom topic_breakdown / detailed_answers menolak SELURUH baris: ulangi tanpa kolom opsional
                // (datanya tetap ada di dalam wrong_questions).
                console.warn('Supabase insert ditolak, mencoba ulang tanpa kolom opsional:', error.message || error);
                const lean = { ...rowPayload };
                delete lean.topic_breakdown;
                delete lean.detailed_answers;
                ({ error } = await Promise.race([supabaseClient.from(cfg.table || 'quiz_results').insert([lean]), spTimeout]));
                if (error) console.warn('Supabase insert gagal:', error.message || error);
            }
            if (!error) {
                savedToSupabase = true;
                console.log('✅ [Cloud Supabase] Nilai siswa berhasil disimpan! ID Bukti:', proofCode);
            }
        })().catch(err => {
            console.warn('Supabase SDK sync skipped/timeout:', err.message);
        });
        syncPromises.push(spTask);
    }

    if (syncPromises.length > 0) {
        await Promise.allSettled(syncPromises);
    }

    // 3. Jika sedang offline atau jaringan mobile terputus, masukkan ke Antrean Offline Sync
    if (!savedToSupabase && !savedToFirebase) {
        if (typeof queueRecordForSync === 'function') {
            queueRecordForSync(record);
        }
    }

    // 4. Cadangan ke server Node.js lokal (hanya jika dev server lokal berjalan)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        try {
            fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record)
            }).catch(() => {});
        } catch (err) {}
    }

    return {
        success: true,
        savedToSupabase: savedToSupabase,
        savedToFirebase: savedToFirebase,
        proofId: proofCode,
        timestamp: record.timestamp,
        dateStr: `${record.date} ${record.time}`
    };
}

function loadTimerSetting() {
    const v = localStorage.getItem(TIMER_SETTING_KEY);
    if (v === null || v === '') return 30;
    const parsed = parseInt(v, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 30;
}

function syncTimerSelectUi(secondsVal) {
    const val = (typeof secondsVal === 'number' && Number.isFinite(secondsVal) && secondsVal >= 0)
        ? secondsVal
        : loadTimerSetting();
    const sel = document.getElementById('setting-timer');
    const customInp = document.getElementById('input-custom-timer-value');
    const customUnit = document.getElementById('input-custom-timer-unit');
    if (sel) {
        let optCustom = sel.querySelector('#opt-custom-timer-val');
        const hasPreset = Array.from(sel.options).some(o => o.id !== 'opt-custom-timer-val' && String(o.value) === String(val));
        if (hasPreset) {
            if (optCustom) optCustom.remove();
            sel.value = String(val);
        } else {
            if (!optCustom) {
                optCustom = document.createElement('option');
                optCustom.id = 'opt-custom-timer-val';
                const customTrigger = sel.querySelector('option[value="custom"]');
                if (customTrigger) sel.insertBefore(optCustom, customTrigger);
                else sel.appendChild(optCustom);
            }
            optCustom.value = String(val);
            const labelText = (val >= 60 && val % 60 === 0) ? `${val / 60} menit (${val} detik)` : `${val} detik`;
            optCustom.textContent = `⏱️ Kustom: ${labelText}`;
            sel.value = String(val);
        }
    }
    if (customInp && val > 0) {
        if (val >= 60 && val % 60 === 0) {
            customInp.value = String(val / 60);
            if (customUnit) customUnit.value = 'menit';
        } else {
            customInp.value = String(val);
            if (customUnit) customUnit.value = 'detik';
        }
    }
}
window.syncTimerSelectUi = syncTimerSelectUi;

async function _commitQuizTimerValue(val) {
    localStorage.setItem(TIMER_SETTING_KEY, val);
    TIMER_MAX = val;
    syncTimerSelectUi(val);
    const msg = document.getElementById('timer-saved-msg');
    if (msg) {
        msg.classList.add('show');
        setTimeout(() => msg.classList.remove('show'), 2000);
    }
    if (typeof sfxCorrect === 'function') sfxCorrect();

    if (typeof saveCloudSharedState === 'function') {
        saveCloudSharedState({ timerSeconds: val });
    }

    try {
        await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': sessionStorage.getItem('quizmaster_teacher_auth_token') || ''
            },
            body: JSON.stringify({ timer_seconds: val })
        });
    } catch (e) {}
}

async function saveTimerSetting() {
    const sel = document.getElementById('setting-timer');
    if (!sel) return;
    if (sel.value === 'custom') {
        const customInp = document.getElementById('input-custom-timer-value');
        if (customInp) customInp.focus();
        return;
    }
    const val = parseInt(sel.value, 10);
    if (!Number.isFinite(val) || val < 0) return;
    await _commitQuizTimerValue(val);
}

async function applyCustomQuizTimer() {
    const valInp = document.getElementById('input-custom-timer-value');
    const unitSel = document.getElementById('input-custom-timer-unit');
    const rawNum = valInp ? parseInt(valInp.value, 10) : NaN;
    if (!Number.isFinite(rawNum) || rawNum < 1) {
        if (typeof showToast === 'function') showToast('⚠️ Masukkan angka waktu yang valid (minimal 1)!', '⚠️');
        if (valInp) valInp.focus();
        return;
    }
    const unit = unitSel ? unitSel.value : 'detik';
    const totalSec = Math.min(36000, unit === 'menit' ? (rawNum * 60) : rawNum);
    await _commitQuizTimerValue(totalSec);
    if (typeof showToast === 'function') {
        showToast(`⏱️ Waktu kustom diterapkan: ${rawNum} ${unit} (${totalSec} detik/soal)!`, '✅');
    }
}
window.applyCustomQuizTimer = applyCustomQuizTimer;

// 🎮 MINI-GAMES TIMER SETTING (DURASI ARENA ICE BREAKING)
const MINIGAMES_TIMER_KEY = 'detektif_fakta_minigames_timer';

function loadMiniGamesTimerSetting() {
    const v = localStorage.getItem(MINIGAMES_TIMER_KEY);
    return v !== null ? parseInt(v, 10) : 30;
}
window.loadMiniGamesTimerSetting = loadMiniGamesTimerSetting;

async function saveMiniGamesTimerSetting() {
    const sel = document.getElementById('setting-minigames-timer');
    if (!sel) return;
    const val = parseInt(sel.value, 10);
    localStorage.setItem(MINIGAMES_TIMER_KEY, val);

    const msg = document.getElementById('minigames-timer-saved-msg');
    if (msg) {
        msg.style.display = 'inline-block';
        msg.classList.add('show');
        setTimeout(() => {
            msg.classList.remove('show');
            msg.style.display = 'none';
        }, 2000);
    }
    sfxCorrect();

    // ☁️ Sinkronkan durasi timer mini-games ke Cloud Supabase agar berlaku di seluruh HP / Laptop
    if (typeof saveCloudSharedState === 'function') {
        saveCloudSharedState({ miniGamesTimerSeconds: val });
    }
}
window.saveMiniGamesTimerSetting = saveMiniGamesTimerSetting;

async function fetchSupabaseRecords(cfg) {
    // Ambil data siswa & modul custom, batasi ke 500 baris terbaru agar efisien dan aman dari kuota memori HP
    const targetUrl = `${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}?student_class=neq.__SYSTEM_CONFIG__&select=*&order=id.desc&limit=500`;
    const res = await fetch(targetUrl, {
        headers: {
            'apikey': cfg.key,
            'Authorization': 'Bearer ' + cfg.key
        }
    });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
}

// 🌐 STABLE DATABASE BADGE MANAGER (ELIMINATES TEXT FLICKERING / BOUNCING)
window.lastKnownSupabaseCount = 221;

function updateDbBadge(isOnline, count = null) {
    const badge = document.getElementById('db-status-badge');
    if (!badge) return;
    if (typeof count === 'number' && count > 0) {
        window.lastKnownSupabaseCount = count;
    }
    const currentCount = window.lastKnownSupabaseCount || 221;

    if (isOnline) {
        const expectedHtml = `🔥 <span>Firebase Cloud (${currentCount} Siswa)</span>`;
        if (badge.innerHTML !== expectedHtml) {
            badge.innerHTML = expectedHtml;
            badge.style.background = 'rgba(245,158,11,0.15)';
            badge.style.borderColor = 'rgba(245,158,11,0.4)';
            badge.style.color = '#f59e0b';
            badge.title = 'Terhubung ke Google Firebase Realtime Database 24 Jam — Data Real-Time Tersinkronisasi';
        }
    } else {
        const expectedHtml = '☁️ <span>Database (Klik untuk Sinkron)</span>';
        if (badge.innerHTML !== expectedHtml) {
            badge.innerHTML = expectedHtml;
            badge.style.background = 'rgba(99,102,241,0.15)';
            badge.style.borderColor = 'rgba(99,102,241,0.4)';
            badge.style.color = 'var(--primary)';
            badge.title = 'Klik untuk membuka modal sinkronisasi Cloud Database';
        }
    }
}
window.updateDbBadge = updateDbBadge;

async function checkBackendStatus() {
    const cfg = (typeof getSupabaseConfig === 'function') ? getSupabaseConfig() : { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_ANON_KEY, table: 'quiz_results' };

    // 1. Cek Koneksi ke Cloud Supabase via REST / SDK
    try {
        const targetUrl = `${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}?select=id&limit=1`;
        const res = await fetch(targetUrl, {
            headers: {
                'apikey': cfg.key,
                'Authorization': 'Bearer ' + cfg.key
            }
        });
        if (res.ok) {
            isBackendOnline = true;
            updateDbBadge(true);
            syncWithBackend(false);
            return;
        }
    } catch (e) {
        console.warn('REST ping warning:', e.message);
    }

    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient.from(cfg.table || 'quiz_results').select('id').limit(1);
            if (!error) {
                isBackendOnline = true;
                updateDbBadge(true);
                syncWithBackend(false);
                return;
            }
        } catch (e) {}
    }

    // 2. Cek Koneksi ke Server MySQL Lokal (opsional jika aktif)
    try {
        const res = await fetch('/api/status');
        if (res.ok) {
            const data = await res.json();
            if (data.mysql_connected) {
                isBackendOnline = true;
                updateDbBadge(true);
                syncWithBackend(false);
                return;
            }
        }
    } catch (e) {}

    // 2b. Cek Koneksi ke Google Firebase Realtime Database 24 Jam
    if (typeof testFirebaseConnection === 'function') {
        try {
            const fbTest = await testFirebaseConnection();
            if (fbTest && fbTest.success) {
                isBackendOnline = true;
                updateDbBadge(true);
                syncWithBackend(false);
                return;
            }
        } catch(e) {}
    }

    // 3. Cadangan Offline (LocalStorage) dengan tombol aksi Supabase
    isBackendOnline = false;
    updateDbBadge(false);
}

// 🌐 APLIKASIKAN CLOUD SHARED STATE KE PENYIMPANAN LOKAL
function applyCloudSharedStateToLocal(state) {
    if (!state || typeof state !== 'object') return;
    try {
        // 1. Sinkronisasi Mode Remedial (Aktif / Nonaktif)
        if (state.remedialEnabled !== undefined) {
            localStorage.setItem('quizmaster_remedial_enabled', state.remedialEnabled ? 'enabled' : 'disabled');
            const remSel = document.getElementById('setting-remedial-toggle');
            if (remSel) remSel.value = state.remedialEnabled ? 'enabled' : 'disabled';
        }

        // 1b. Sinkronisasi Kunci Layar Penuh (Fullscreen Lockdown)
        if (state.fullscreenMode !== undefined) {
            localStorage.setItem('quizmaster_fullscreen_mode', state.fullscreenMode);
            const fsSel = document.getElementById('setting-fullscreen-mode');
            if (fsSel) fsSel.value = state.fullscreenMode;
        }

        // 1c. Sinkronisasi Publikasi Rapor & Kunci Pembahasan Siswa
        if (state.reviewReleaseMode !== undefined) {
            localStorage.setItem('quizmaster_review_release_mode', state.reviewReleaseMode);
            const revSel = document.getElementById('setting-review-release-mode');
            if (revSel) revSel.value = state.reviewReleaseMode;
        }

        // 2. Sinkronisasi Durasi Timer Kuis
        if (typeof state.timerSeconds === 'number' && state.timerSeconds >= 0) {
            localStorage.setItem(TIMER_SETTING_KEY, state.timerSeconds);
            TIMER_MAX = state.timerSeconds;
            if (typeof syncTimerSelectUi === 'function') {
                syncTimerSelectUi(state.timerSeconds);
            } else {
                const timerSel = document.getElementById('setting-timer');
                if (timerSel) timerSel.value = state.timerSeconds;
            }
        }

        // 2c. Sinkronisasi Batas Toleransi Anti-Cheat
        if (state.cheatToleranceLimit !== undefined && state.cheatToleranceLimit !== null) {
            const tol = Math.max(0, Math.min(50, parseInt(state.cheatToleranceLimit, 10) || 0));
            localStorage.setItem('quizmaster_cheat_tolerance_limit', String(tol));
            if (typeof syncCheatToleranceUi === 'function') syncCheatToleranceUi(tol);
        }

        // 2b. Sinkronisasi Durasi Timer Mini-Games
        if (state.miniGamesTimerSeconds !== undefined) {
            localStorage.setItem(MINIGAMES_TIMER_KEY, state.miniGamesTimerSeconds);
            const mgTimerSel = document.getElementById('setting-minigames-timer');
            if (mgTimerSel) mgTimerSel.value = state.miniGamesTimerSeconds;
        }

        // 3. Sinkronisasi Pengaturan Akses Kuis
        if (state.accessSettings && typeof state.accessSettings === 'object') {
            const cleanAccess = { ...state.accessSettings };
            // 🛡️ ANTI-LOCKOUT GUARD: Jika cloud masih membawa mode schedule/auto warisan, normalkan ke always_open
            if (!cleanAccess.mode || cleanAccess.mode === 'schedule' || cleanAccess.mode === 'auto') {
                cleanAccess.mode = 'always_open';
            }
            if (!cleanAccess.classOverrides) cleanAccess.classOverrides = {};
            if (!cleanAccess.manualOpenedClasses) cleanAccess.manualOpenedClasses = {};
            if (cleanAccess.mode === 'always_open') {
                ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'].forEach(c => {
                    if (cleanAccess.classOverrides[c] === undefined) {
                        cleanAccess.classOverrides[c] = true;
                    }
                    if (cleanAccess.manualOpenedClasses[c] === undefined) {
                        cleanAccess.manualOpenedClasses[c] = true;
                    }
                });
            }
            localStorage.setItem('detektif_fakta_access_control', JSON.stringify(cleanAccess));
            if (typeof initAccessSettingsUi === 'function') initAccessSettingsUi();
        }

        // 4. Sinkronisasi Modul Ujian Aktif & Visibilitas Modul
        if (Array.isArray(state.visibleExamModules)) {
            localStorage.setItem('quizmaster_visible_exam_modules', JSON.stringify(state.visibleExamModules));
        }

        const lockedMode = (state.activeExamModuleMode !== undefined) 
            ? state.activeExamModuleMode 
            : (localStorage.getItem('quizmaster_active_exam_module_mode') || 'all');
        if (state.activeExamModuleMode !== undefined) {
            localStorage.setItem('quizmaster_active_exam_module_mode', state.activeExamModuleMode);
            const examModSel = document.getElementById('setting-active-exam-module');
            if (examModSel) examModSel.value = state.activeExamModuleMode;
        }

        const customVisibleList = Array.isArray(state.visibleExamModules)
            ? state.visibleExamModules
            : ((typeof loadVisibleExamModules === 'function') ? loadVisibleExamModules() : []);

        // Jika guru membuka semua modul, jangan mewarisi HKI/modul lama sebagai
        // pilihan aktif yang membingungkan. Semua opsi tetap tersedia; jaringan hanya
        // menjadi pilihan awal netral sampai siswa memilih paket kuisnya sendiri.
        let targetActiveId = lockedMode === 'all'
            ? 'modul_jaringan_keamanan'
            : (lockedMode === 'custom'
                ? ((customVisibleList && customVisibleList[0]) || state.activeModuleId || 'modul_jaringan_keamanan')
                : (state.activeModuleId || lockedMode || 'modul_jaringan_keamanan'));
        if (lockedMode && lockedMode !== 'all' && lockedMode !== 'custom') {
            targetActiveId = lockedMode;
        }

        const inQuiz = (typeof isQuizActive === 'function' && isQuizActive()) ||
                       (document.getElementById('screen-quiz') && document.getElementById('screen-quiz').classList.contains('active'));
        if (!inQuiz) {
            if (window.QuizManager) {
                const curActive = window.QuizManager.getActiveModuleId();
                if (curActive !== targetActiveId) {
                    window.QuizManager.setActiveModuleId(targetActiveId, false);
                }
            }
            if (typeof initModulesCatalog === 'function') initModulesCatalog();
        }

        // 4b. Sinkronisasi Visibilitas Akun & Kelas Demo Siswa
        if (state.demoVisibility !== undefined) {
            localStorage.setItem('quizmaster_demo_accounts_visibility', state.demoVisibility);
            if (typeof applyDemoVisibilitySetting === 'function') {
                applyDemoVisibilitySetting(state.demoVisibility);
            }
        }

        // 4b2. Sinkronisasi Mode Anti-Cheat pada Akun Demo
        if (state.demoAntiCheat !== undefined) {
            localStorage.setItem('quizmaster_demo_anticheat', state.demoAntiCheat);
            const demoAcSel = document.getElementById('setting-demo-anticheat');
            if (demoAcSel) demoAcSel.value = state.demoAntiCheat;
        }

        // 4d. Sinkronisasi Antrean Kunci Anti-Cheat & Persetujuan Guru
        if (state.cheatLockRequests && typeof state.cheatLockRequests === 'object') {
            try {
                const existingLocks = (typeof loadLocalCheatLocks === 'function') ? loadLocalCheatLocks() : {};
                localStorage.setItem('quizmaster_cloud_cheat_locks', JSON.stringify({ ...existingLocks, ...state.cheatLockRequests }));
            } catch (e) {}
        }
        if (state.teacherApprovals && typeof state.teacherApprovals === 'object') {
            try {
                const existingApprovals = (typeof loadLocalTeacherApprovals === 'function') ? loadLocalTeacherApprovals() : {};
                localStorage.setItem('quizmaster_cloud_teacher_approvals', JSON.stringify({ ...existingApprovals, ...state.teacherApprovals }));
            } catch (e) {}
        }
        if (typeof window.onCloudApprovalsUpdated === 'function') {
            try { window.onCloudApprovalsUpdated(); } catch (e) {}
        }

        // 4c. Sinkronisasi Pengaturan Anti-Joki (Token Ujian)
        if (state.examTokenMode !== undefined || state.examTokenCode !== undefined) {
            if (state.examTokenMode !== undefined) localStorage.setItem('quizmaster_exam_token_mode', state.examTokenMode);
            if (state.examTokenCode !== undefined) localStorage.setItem('quizmaster_exam_token_code', state.examTokenCode);
            if (typeof applyExamTokenSetting === 'function') {
                applyExamTokenSetting(state.examTokenMode, state.examTokenCode);
            }
        }

        // 5. Sinkronisasi Daftar Penghapusan Siswa (Tombstone Deletions)
        if (Array.isArray(state.deletedRecords) && state.deletedRecords.length > 0) {
            try {
                let localDels = JSON.parse(localStorage.getItem('quizmaster_deleted_records') || '[]');
                if (!Array.isArray(localDels)) localDels = [];
                const mergedDels = Array.from(new Set([...localDels, ...state.deletedRecords]));
                localStorage.setItem('quizmaster_deleted_records', JSON.stringify(mergedDels));
                if (state.deletedAt && typeof state.deletedAt === 'object') {
                    Object.keys(state.deletedAt).forEach(k => markDeletedAt(k, state.deletedAt[k]));
                }
            } catch(e) {}
        }
    } catch(e) {
        console.warn('Gagal menerapkan Cloud Shared State:', e);
    }
}
window.applyCloudSharedStateToLocal = applyCloudSharedStateToLocal;

// ⚡ REAL-TIME SUPABASE SUBSCRIPTION (SEKETIKA UPDATE SAAT ADA NILAI / PERUBAHAN BARU)
let realtimeChannel = null;
let _supabaseSyncDebounceTimer = null;
let _syncInFlightPromise = null;
let _lastSyncAt = 0;
let _lastSyncedFingerprint = '';

function initSupabaseRealtime() {
    if (realtimeChannel) return;
    if (!isTeacherSyncContext()) return;
    const client = window.supabaseClient || (typeof initSupabaseClient === 'function' ? initSupabaseClient() : null);
    if (!client || typeof client.channel !== 'function') return;

    try {
        const cfg = (typeof getSupabaseConfig === 'function') ? getSupabaseConfig() : { table: 'quiz_results' };
        const tableName = cfg.table || 'quiz_results';

        realtimeChannel = client
            .channel('quizmaster_multi_device_sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
                console.log('⚡ [Real-time Supabase Event]:', payload.eventType);
                if (_supabaseSyncDebounceTimer) clearTimeout(_supabaseSyncDebounceTimer);
                _supabaseSyncDebounceTimer = setTimeout(() => {
                    _supabaseSyncDebounceTimer = null;
                    syncWithBackend(false);
                }, 1200);
            })
            .subscribe((status) => {
                console.log('📡 [Supabase Realtime Channel Status]:', status);
            });
    } catch(e) {
        console.warn('Realtime subscription warning:', e.message);
    }
}
window.initSupabaseRealtime = initSupabaseRealtime;

function computeRecordsFingerprint(list) {
    if (!Array.isArray(list) || list.length === 0) return '0';
    let sum = 0;
    let remSum = 0;
    for (let i = 0; i < list.length; i++) {
        const r = list[i];
        sum += Number(r && r.score) || 0;
        if (r && r.isRemedial) remSum += (Number(r.remedialScore) || Number(r.score) || 0) + 1;
    }
    return `${list.length}:${sum}:${remSum}`;
}

// 🚦 Hanya perangkat GURU yang boleh menarik seluruh basis data & membuka stream realtime.
// Tanpa ini, 1000 HP siswa masing-masing mengunduh seluruh nilai setiap ada siswa lain yang selesai (O(N^2))
// dan menghabiskan batas koneksi simultan Firebase, sehingga nilai/dasbor guru tidak ikut terkirim.
function isTeacherSyncContext() {
    try {
        if (typeof isTeacherAuthValid === 'function' && isTeacherAuthValid()) return true;
        const t = (typeof screens !== 'undefined' && screens && screens.teacher) ? screens.teacher : null;
        return !!(t && t.classList && t.classList.contains('active'));
    } catch (e) { return false; }
}
window.isTeacherSyncContext = isTeacherSyncContext;

async function syncWithBackend(showFeedback = false) {
    if (!showFeedback && !isTeacherSyncContext()) return false;
    // 🛡️ QUIZ FOCUS PROTECTION: Jika siswa sedang aktif di tengah ujian kuis,
    // tunda sinkronisasi riwayat nilai orang lain agar thread CPU & memori HP siswa 100% lancar tanpa lag/freeze
    if (!showFeedback) {
        if (typeof isQuizActive === 'function' && isQuizActive()) return false;
        const quizEl = (typeof document !== 'undefined') ? document.getElementById('screen-quiz') : null;
        if (quizEl && quizEl.classList && quizEl.classList.contains('active')) return false;
        // 🛡️ COOLDOWN GUARD: Hindari badai sinkronisasi berulang dalam rentang < 4 detik
        if ((Date.now() - _lastSyncAt) < 4000) return true;
    }

    if (_syncInFlightPromise) {
        return _syncInFlightPromise;
    }

    _syncInFlightPromise = (async () => {
    const cfg = (typeof getSupabaseConfig === 'function') ? getSupabaseConfig() : { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_ANON_KEY, table: 'quiz_results' };
    const tableName = cfg.table || 'quiz_results';

    let rawData = null;
    let fbRecords = [];
    let isAnyOnline = false;

    // Ambil status shared state cloud di latar belakang secara terpisah
    if (typeof fetchCloudSharedState === 'function') {
        fetchCloudSharedState().then(cloudState => {
            if (cloudState && typeof applyCloudSharedStateToLocal === 'function') {
                applyCloudSharedStateToLocal(cloudState);
            }
        }).catch(() => {});
    }

    // 1. Tarik data dari Cloud Supabase & Firebase Realtime Database secara paralel & independen
    const [supabaseResult, firebaseResult] = await Promise.allSettled([
        (async () => {
            try {
                return await fetchSupabaseRecords(cfg);
            } catch (restErr) {
                if (supabaseClient) {
                    const { data, error } = await supabaseClient
                        .from(tableName)
                        .select('*')
                        .neq('student_class', '__SYSTEM_CONFIG__')
                        .order('id', { ascending: false })
                        .limit(500);
                    if (!error && Array.isArray(data)) return data;
                }
                throw restErr;
            }
        })(),
        (async () => {
            if (typeof fetchFirebaseRecords === 'function') {
                return await fetchFirebaseRecords();
            }
            return [];
        })()
    ]);

    if (supabaseResult.status === 'fulfilled' && Array.isArray(supabaseResult.value)) {
        rawData = supabaseResult.value;
        isAnyOnline = true;
    } else if (supabaseResult.status === 'rejected') {
        console.warn('Supabase fetch note:', supabaseResult.reason?.message || 'offline/unreachable');
    }

    if (firebaseResult.status === 'fulfilled' && Array.isArray(firebaseResult.value)) {
        fbRecords = firebaseResult.value;
        if (fbRecords.length > 0) {
            isAnyOnline = true;
            console.log(`🔥 [Firebase RTDB] Memuat ${fbRecords.length} data siswa secara independen.`);
        }
    } else if (firebaseResult.status === 'rejected') {
        console.warn('Firebase fetch note:', firebaseResult.reason?.message);
    }

    let supabaseFormatted = [];
    if (Array.isArray(rawData) && rawData.length > 0) {
        // A. Filter baris data siswa vs baris konfigurasi sistem
        const studentRows = rawData.filter(r => {
            const sName = String(r.student_name || '');
            const sClass = String(r.student_class || '');
            return !sName.startsWith('__') && sClass !== '__SYSTEM_CONFIG__' && sClass !== '__MODULE_DATA__';
        });

        // B. Ekstraksi Modul Kuis yang dibuat guru jika ada
        const moduleRows = rawData.filter(r => r.student_class === '__MODULE_DATA__');
        if (moduleRows.length > 0 && window.QuizManager && typeof window.QuizManager.syncCloudModulesList === 'function') {
            window.QuizManager.syncCloudModulesList(moduleRows);
        }

        supabaseFormatted = studentRows.map(r => {
            let extractedModId = null;
            let extractedModTitle = null;
            let extractedWrong = [];
            let remFlags = {};

            if (r.wrong_questions && typeof r.wrong_questions === 'object' && !Array.isArray(r.wrong_questions)) {
                if (r.wrong_questions.isRemedial) remFlags = { isRemedial: true, originalScore: r.wrong_questions.originalScore, remedialScore: r.wrong_questions.remedialScore };
                extractedModId = r.wrong_questions.moduleId;
                extractedModTitle = r.wrong_questions.moduleTitle;
                extractedWrong = Array.isArray(r.wrong_questions.list) ? r.wrong_questions.list : [];
                if (Array.isArray(r.wrong_questions.ans)) remFlags = { ...remFlags, studentAnswers: r.wrong_questions.ans };
            } else if (Array.isArray(r.wrong_questions)) {
                extractedWrong = r.wrong_questions;
            }

            const modId = normalizeModuleId(extractedModId || r.moduleId || r.module_id, r.id, r.quiz_date || r.date);
            const modTitle = extractedModTitle || r.moduleTitle || (modId === 'modul_jaringan_keamanan' ? 'Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital' : 'Misi Detektif Fakta');

            return {
                id: r.id,
                name: r.student_name || r.name,
                class: r.student_class || r.class,
                score: r.score,
                correct: r.correct_count !== undefined ? r.correct_count : (r.correct !== undefined ? r.correct : Math.round(r.score * 0.2)),
                total: r.total_questions || r.total || (window.quizData ? window.quizData.length : 20),
                wrongQuestions: extractedWrong,
                moduleId: modId,
                moduleTitle: modTitle,
                duration: r.duration || '-',
                time: r.time_str || r.time || '-',
                date: r.quiz_date || r.date || '-',
                timestamp: r.created_at ? new Date(r.created_at).getTime() : (r.timestamp || Date.now()),
                tabSwitchCount: r.tab_switch_count !== undefined ? r.tab_switch_count : (r.tabSwitchCount || 0),
                isCheated: r.is_cheated !== undefined ? r.is_cheated : !!r.isCheated,
                ...remFlags
            };
        });
    }

    // Gabungkan baseline data resmi, data lokal, Supabase, dan Firebase
    const baseline = (typeof OFFICIAL_EXAM_RESULTS !== 'undefined' && Array.isArray(OFFICIAL_EXAM_RESULTS)) ? purgeFakeJkiRecords(OFFICIAL_EXAM_RESULTS) : [];
    let rawLocal = [];
    try {
        rawLocal = typeof loadRecords === 'function' ? loadRecords() : (JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
    } catch(e) {
        rawLocal = [];
    }
    const currentLocal = purgeFakeJkiRecords(Array.isArray(rawLocal) ? rawLocal : []);
    const mergedBaseline = mergeRecordsList(baseline, currentLocal);
    const combinedCloud = mergeRecordsList(supabaseFormatted, fbRecords);

    if (isAnyOnline || combinedCloud.length > 0) {
        const finalRecords = filterDeletedRecords(purgeFakeJkiRecords(mergeRecordsList(mergedBaseline, combinedCloud)));
        const nextFingerprint = computeRecordsFingerprint(finalRecords);
        const hasChanges = nextFingerprint !== _lastSyncedFingerprint;
        _lastSyncedFingerprint = nextFingerprint;
        _lastSyncAt = Date.now();

        if (hasChanges) {
            safeLocalStorageSet(STORAGE_KEY, JSON.stringify(finalRecords));
        }
        safeLocalStorageSet(OFFICIAL_DATA_SYNC_KEY, CURRENT_OFFICIAL_VERSION);

        isBackendOnline = true;
        updateDbBadge(true, finalRecords.length);

        if (typeof flushPendingRecords === 'function') {
            flushPendingRecords();
        }

        initSupabaseRealtime();
        if (typeof initFirebaseRealtime === 'function') {
            initFirebaseRealtime();
        }

        const teacherScreenActive = (typeof screens !== 'undefined' && screens && screens.teacher && screens.teacher.classList && screens.teacher.classList.contains('active'));
        if (teacherScreenActive && (hasChanges || showFeedback) && typeof renderDashboard === 'function') {
            renderDashboard();
        }
        if (showFeedback) {
            showToast(`✅ Basis data Cloud tersinkronisasi! (Total: ${finalRecords.length} Siswa)`, '🔥');
        }
        return true;
    } else {
        _lastSyncAt = Date.now();
        if (showFeedback) {
            showToast('⚠️ Sedang offline atau server cloud sedang sibuk. Menggunakan data lokal.', '⚠️');
        }
    }

    // 2. Sinkronisasi Data dari Server MySQL Lokal (opsional)
    try {
        const res = await fetch('/api/scores');
        if (res.ok) {
            const dbRecords = await res.json();
            if (Array.isArray(dbRecords) && dbRecords.length > 0) {
                const current = loadRecords();
                const merged = mergeRecordsList(current, dbRecords);
                safeLocalStorageSet(STORAGE_KEY, JSON.stringify(merged));
                const teacherScreenActive = (typeof screens !== 'undefined' && screens && screens.teacher && screens.teacher.classList && screens.teacher.classList.contains('active'));
                if (teacherScreenActive && typeof renderDashboard === 'function') renderDashboard();
            }
        }
    } catch (e) {}

    return false;
    })();

    try {
        return await _syncInFlightPromise;
    } finally {
        _syncInFlightPromise = null;
    }
}
window.syncWithBackend = syncWithBackend;

// 🔥 FIREBASE MODAL ACTIONS & CONTROLLERS
function openFirebaseModal() {
    sfxClick();
    const modal = document.getElementById('firebase-modal');
    if (!modal) return;
    const cfg = (typeof getFirebaseConfig === 'function') ? getFirebaseConfig() : null;
    const rtdbInp = document.getElementById('fb-input-rtdb');
    const keyInp = document.getElementById('fb-input-key');
    const projInp = document.getElementById('fb-input-project');
    const authInp = document.getElementById('fb-input-auth');
    const appInp = document.getElementById('fb-input-app');
    const statusBox = document.getElementById('fb-status-box');

    if (cfg) {
        if (rtdbInp) rtdbInp.value = cfg.databaseURL || 'https://kuis-informatika-c8781-default-rtdb.firebaseio.com';
        if (keyInp) keyInp.value = cfg.apiKey || '';
        if (projInp) projInp.value = cfg.projectId || '';
        if (authInp) authInp.value = cfg.authDomain || '';
        if (appInp) appInp.value = cfg.appId || '';
    }

    if (statusBox) {
        statusBox.innerHTML = '🟢 <strong>Status: Terhubung Aktif</strong> ke Firebase Realtime Database (<strong>kuis-informatika-c8781</strong>)!';
        statusBox.style.color = 'var(--success)';
    }

    modal.classList.add('active');
}
window.openFirebaseModal = openFirebaseModal;

function closeFirebaseModal() {
    sfxClick();
    const modal = document.getElementById('firebase-modal');
    if (modal) modal.classList.remove('active');
}
window.closeFirebaseModal = closeFirebaseModal;

function handlePasteFirebaseSnippet() {
    const pasteArea = document.getElementById('fb-paste-snippet');
    if (!pasteArea) return;
    const parsed = (typeof parseFirebaseConfigSnippet === 'function') ? parseFirebaseConfigSnippet(pasteArea.value) : null;
    if (parsed) {
        if (document.getElementById('fb-input-rtdb') && parsed.databaseURL) document.getElementById('fb-input-rtdb').value = parsed.databaseURL;
        if (document.getElementById('fb-input-key')) document.getElementById('fb-input-key').value = parsed.apiKey || '';
        if (document.getElementById('fb-input-project')) document.getElementById('fb-input-project').value = parsed.projectId || '';
        if (document.getElementById('fb-input-auth')) document.getElementById('fb-input-auth').value = parsed.authDomain || '';
        if (document.getElementById('fb-input-app')) document.getElementById('fb-input-app').value = parsed.appId || '';
        pasteArea.value = '';
        showToast('✅ Berhasil membaca kode Firebase Config!', '📋');
    } else {
        showToast('Format kode tidak dikenali. Pastikan menyalin blok firebaseConfig.', '⚠️');
    }
}
window.handlePasteFirebaseSnippet = handlePasteFirebaseSnippet;

async function saveAndTestFirebase() {
    sfxClick();
    const databaseURL = document.getElementById('fb-input-rtdb')?.value.trim() || 'https://kuis-informatika-c8781-default-rtdb.firebaseio.com';
    const key = document.getElementById('fb-input-key')?.value.trim() || 'AIzaSyDF1bsT8NFwu5qc33UrHcFiECxH63-J9P0';
    const projectId = document.getElementById('fb-input-project')?.value.trim() || 'kuis-informatika-c8781';
    const authDomain = document.getElementById('fb-input-auth')?.value.trim() || `${projectId}.firebaseapp.com`;
    const appId = document.getElementById('fb-input-app')?.value.trim() || '1:707112824956:web:01c89af0c315927c3719f9';

    const cfg = { apiKey: key, projectId, databaseURL, authDomain, appId };
    saveFirebaseConfig(cfg);
    initFirebaseClient();

    const btn = document.getElementById('btn-fb-test');
    if (btn) btn.innerHTML = '⏳ Menghubungkan ke Firebase...';

    const testRes = (typeof testFirebaseConnection === 'function') ? await testFirebaseConnection() : { success: false, message: 'Fungsi tes tidak ditemukan' };
    if (btn) btn.innerHTML = '🔥 Simpan & Tes Koneksi Firebase';

    const statusBox = document.getElementById('fb-status-box');
    if (testRes.success) {
        sfxCorrect();
        if (statusBox) {
            statusBox.innerHTML = `🟢 <strong>Sukses:</strong> ${testRes.message}!`;
            statusBox.style.color = 'var(--success)';
        }
        showToast('🔥 Berhasil terhubung ke Firebase Realtime Database!', '✅');
        if (typeof initFirebaseRealtime === 'function') initFirebaseRealtime();
        syncWithBackend(false);
        setTimeout(() => closeFirebaseModal(), 1500);
    } else {
        sfxWrong();
        if (statusBox) {
            statusBox.innerHTML = `❌ <strong>Gagal Terhubung:</strong> ${testRes.message}`;
            statusBox.style.color = 'var(--danger)';
        }
    }
}
window.saveAndTestFirebase = saveAndTestFirebase;

async function uploadAllLocalRecordsToFirebaseAction() {
    sfxClick();
    if (typeof uploadAllRecordsToFirebase !== 'function') {
        showToast('Modul Firebase belum siap.', '⚠️');
        return;
    }

    showToast('🔥 Mengunggah seluruh data kuis ke Firebase Realtime Database...', '⏳');
    try {
        const count = await uploadAllRecordsToFirebase();
        sfxCorrect();
        showToast(`✅ Sukses! ${count} data kuis resmi tersimpan permanen di Firebase.`, '🔥');
        syncWithBackend(false);
    } catch (err) {
        sfxWrong();
        showToast(`⚠️ Gagal mengunggah: ${err.message}`, '❌');
    }
}
window.uploadAllLocalRecordsToFirebaseAction = uploadAllLocalRecordsToFirebaseAction;

// ☁️ SUPABASE MODAL ACTIONS & CONTROLLERS
function openSupabaseModal() {
    sfxClick();
    const modal = document.getElementById('supabase-modal');
    if (!modal) return;
    const cfg = (typeof getSupabaseConfig === 'function') ? getSupabaseConfig() : { url: '', key: '', table: 'quiz_results' };
    const urlInp = document.getElementById('sb-input-url');
    const keyInp = document.getElementById('sb-input-key');
    const tblInp = document.getElementById('sb-input-table');
    const statusMsg = document.getElementById('sb-status-box');

    if (urlInp) urlInp.value = cfg.url || '';
    if (keyInp) keyInp.value = cfg.key || '';
    if (tblInp) tblInp.value = cfg.table || 'quiz_results';

    if (statusMsg) {
        statusMsg.innerHTML = isBackendOnline 
            ? '🟢 <strong>Status: Terhubung Aktif</strong> ke Cloud Supabase!'
            : '⚠️ <strong>Status: Offline / Belum Terhubung</strong> (Jika menggunakan proyek gratis yang jarang dibuka, pastikan proyek tidak dalam status PAUSED di dashboard.supabase.com)';
        statusMsg.style.color = isBackendOnline ? 'var(--success)' : '#f59e0b';
    }

    modal.classList.add('active');
}
window.openSupabaseModal = openSupabaseModal;

function closeSupabaseModal() {
    sfxClick();
    const modal = document.getElementById('supabase-modal');
    if (modal) modal.classList.remove('active');
}
window.closeSupabaseModal = closeSupabaseModal;

async function saveAndTestSupabase() {
    sfxClick();
    const url = document.getElementById('sb-input-url').value.trim();
    const key = document.getElementById('sb-input-key').value.trim();
    const table = document.getElementById('sb-input-table').value.trim() || 'quiz_results';

    if (!url || !key) {
        showToast('URL dan Anon Key tidak boleh kosong!', '⚠️');
        return;
    }

    saveSupabaseConfig(url, key, table);
    initSupabaseClient();

    const btn = document.getElementById('btn-sb-test');
    if (btn) btn.innerHTML = '⏳ Menghubungkan ke Supabase...';

    const ok = await syncWithBackend(true);
    if (btn) btn.innerHTML = '🔄 Simpan & Sinkronkan Sekarang';

    if (ok) {
        sfxCorrect();
        checkBackendStatus();
        const statusMsg = document.getElementById('sb-status-box');
        if (statusMsg) {
            statusMsg.innerHTML = '🟢 <strong>Sukses:</strong> Berhasil terhubung & tersinkronisasi dengan Supabase Cloud!';
            statusMsg.style.color = 'var(--success)';
        }
        setTimeout(() => closeSupabaseModal(), 1500);
    } else {
        sfxWrong();
        const statusMsg = document.getElementById('sb-status-box');
        if (statusMsg) {
            statusMsg.innerHTML = '❌ <strong>Gagal Terhubung:</strong> Domain Supabase tidak merespons (Periksa apakah project di dashboard.supabase.com sedang "Paused" atau URL/Key salah).';
            statusMsg.style.color = 'var(--danger)';
        }
    }
}
window.saveAndTestSupabase = saveAndTestSupabase;

async function uploadAllLocalRecordsToSupabase() {
    sfxClick();
    if (!supabaseClient) {
        showToast('Supabase belum aktif. Simpan konfigurasi terlebih dahulu.', '⚠️');
        return;
    }
    const cfg = getSupabaseConfig();
    const records = loadRecords();
    if (records.length === 0) {
        showToast('Tidak ada data nilai lokal untuk diunggah.', 'ℹ️');
        return;
    }

    showToast(`Mengunggah ${records.length} data siswa ke Cloud Supabase...`, '⏳');
    let successCount = 0;
    for (const r of records) {
        try {
            const modId = normalizeModuleId(r.moduleId || r.module_id, r.id, r.date || r.quiz_date);
            const { error } = await supabaseClient.from(cfg.table || 'quiz_results').insert([{
                student_name: r.name,
                student_class: r.class,
                score: r.score,
                correct_count: r.correct !== undefined ? r.correct : 0,
                total_questions: r.total || 20,
                wrong_questions: {
                    list: Array.isArray(r.wrongQuestions) ? r.wrongQuestions : [],
                    moduleId: modId,
                    moduleTitle: r.moduleTitle || (modId === 'modul_jaringan_keamanan' ? 'Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital' : 'Misi Detektif Fakta')
                },
                duration: r.duration || '-',
                time_str: r.time || '-',
                quiz_date: r.date || '-',
                tab_switch_count: r.tabSwitchCount || 0,
                is_cheated: !!r.isCheated
            }]);
            if (!error) successCount++;
        } catch(e) {}
    }

    sfxCorrect();
    showToast(`✅ Berhasil mengunggah ${successCount} dari ${records.length} data ke Supabase!`, '☁️');
    syncWithBackend(false);
}
window.uploadAllLocalRecordsToSupabase = uploadAllLocalRecordsToSupabase;

window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && screens.teacher && screens.teacher.classList.contains('active')) {
        sfxNewData();
        renderDashboard();
    }
    if (e.key === TIMER_SETTING_KEY) {
        TIMER_MAX = loadTimerSetting();
    }
});

// ============================================================
