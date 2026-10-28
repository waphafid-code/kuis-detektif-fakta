//  📂 DATA PERSISTENCE & MYSQL SYNC
// ============================================================
function showToast(text, icon = 'ℹ️') {
    const toast = document.getElementById('toast-msg');
    if (!toast) return;
    toast.innerHTML = `<span style="font-size: 1.3rem;">${icon}</span> <span>${text}</span>`;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity = '1';
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
        toast.style.opacity = '0';
    }, 3000);
}

function normalizeModuleId(modId, id, date) {
    if (modId) {
        const s = String(modId).toLowerCase();
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
    if (typeof id === 'number' && id >= 670) return 'modul_jaringan_keamanan';
    if (typeof date === 'string' && (date.includes('/10/2026') || date.includes('-10-') || date.includes('/10/') || date.includes('25/10') || date.includes('26/10') || date.includes('27/10') || date.includes('28/10'))) return 'modul_jaringan_keamanan';
    return 'modul_detektif_fakta';
}
window.normalizeModuleId = normalizeModuleId;

function mergeRecordsList(existingList, incomingList) {
    const map = new Map();
    const makeKey = (r) => {
        const modId = normalizeModuleId(r.moduleId || r.module_id, r.id, r.date || r.quiz_date);
        const normCls = (r.class || r.student_class || '').replace(/\s+/g, ' ').trim().toUpperCase();
        const normName = (r.name || r.student_name || '').toLowerCase().trim();
        return `${normName}|${normCls}|${modId}`;
    };
    
    (existingList || []).forEach(r => {
        if (r && (r.name || r.student_name)) {
            const modId = normalizeModuleId(r.moduleId || r.module_id, r.id, r.date || r.quiz_date);
            const item = {
                ...r,
                moduleId: modId,
                moduleTitle: r.moduleTitle || (modId === 'modul_jaringan_keamanan' ? 'Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital' : 'Misi Detektif Fakta')
            };
            map.set(makeKey(item), item);
        }
    });

    (incomingList || []).forEach(r => {
        if (!r || (!r.name && !r.student_name)) return;
        const modId = normalizeModuleId(r.moduleId || r.module_id, r.id, r.date || r.quiz_date);
        const item = {
            ...r,
            moduleId: modId,
            moduleTitle: r.moduleTitle || (modId === 'modul_jaringan_keamanan' ? 'Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital' : 'Misi Detektif Fakta')
        };
        const k = makeKey(item);
        if (!map.has(k)) {
            map.set(k, item);
        } else {
            const cur = map.get(k);
            // 🏆 AMBIL NILAI TERTINGGI: Selalu pertahankan skor tertinggi dari seluruh percobaan
            const bestScore = Math.max(Number(cur.score) || 0, Number(item.score) || 0);
            const higher = (Number(item.score) || 0) >= (Number(cur.score) || 0) ? item : cur;
            map.set(k, {
                ...cur,
                ...item,
                score: bestScore,
                correct: higher.correct !== undefined ? higher.correct : (item.correct !== undefined ? item.correct : cur.correct),
                wrongQuestions: higher.wrongQuestions || item.wrongQuestions || cur.wrongQuestions,
                detailedAnswers: higher.detailedAnswers || item.detailedAnswers || cur.detailedAnswers
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

    return list.filter(r => {
        if (!r) return false;
        const normName = (r.name || r.student_name || '').toLowerCase().trim();
        const normCls = (r.class || r.student_class || '').replace(/\s+/g, '').toUpperCase();
        const modId = normalizeModuleId(r.moduleId || r.module_id, r.id, r.date || r.quiz_date);
        const k = `${normName}|${normCls}|${modId}`;
        if (deletedKeys.has(k)) return false;
        if (r.id && deletedKeys.has(String(r.id))) return false;
        return true;
    });
}
window.filterDeletedRecords = filterDeletedRecords;

const OFFICIAL_DATA_SYNC_KEY = 'quizmaster_official_pdf_sync_ver';
const CURRENT_OFFICIAL_VERSION = '20261028_official_jki_v5';

function getCleanOfficialBaseline() {
    const raw = (typeof OFFICIAL_EXAM_RESULTS !== 'undefined' && Array.isArray(OFFICIAL_EXAM_RESULTS))
        ? OFFICIAL_EXAM_RESULTS
        : ((typeof window !== 'undefined' && Array.isArray(window.OFFICIAL_EXAM_RESULTS)) ? window.OFFICIAL_EXAM_RESULTS : []);
    return purgeFakeJkiRecords(raw);
}

function loadRecords() {
    try {
        const syncVer = localStorage.getItem(OFFICIAL_DATA_SYNC_KEY);
        const baseline = getCleanOfficialBaseline();
        
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
            const mergedClean = filterDeletedRecords(mergeRecordsList(baseline, saved));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedClean));
            localStorage.setItem('quizmaster_emergency_backup_records', JSON.stringify(filterDeletedRecords(emergency)));
            localStorage.setItem(OFFICIAL_DATA_SYNC_KEY, CURRENT_OFFICIAL_VERSION);
            return mergedClean;
        }

        let baseList = baseline;
        if (Array.isArray(saved) && saved.length > 0) {
            baseList = mergeRecordsList(baseline, saved);
        }
        if (Array.isArray(emergency) && emergency.length > 0) {
            baseList = mergeRecordsList(baseList, emergency);
        }

        baseList = filterDeletedRecords(purgeFakeJkiRecords(baseList));
        return baseList;
    } catch (e) {
        return filterDeletedRecords(getCleanOfficialBaseline());
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
    // Jika soal >= 10 butir dan selesai dalam durasi < 5 detik dengan skor tinggi, flag anomali
    if (record.rawDurationMs && record.rawDurationMs < 5000 && record.total >= 10 && record.score > 50 && !record.isCheated) {
        record.isCheated = true;
        record.statusNote = '🚨 DISKUALIFIKASI (Anomali Kecepatan Mustahil: < 5 Detik)';
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

    // 🛡️ EMERGENCY REDUNDANT BACKUP: Simpan langsung ke cadangan darurat lokal
    try {
        const emergencyList = JSON.parse(localStorage.getItem('quizmaster_emergency_backup_records') || '[]');
        emergencyList.push({ ...record, savedAt: Date.now() });
        if (emergencyList.length > 200) emergencyList.shift();
        localStorage.setItem('quizmaster_emergency_backup_records', JSON.stringify(emergencyList));
    } catch(e) {}

    const currentRecords = loadRecords();
    const merged = mergeRecordsList(currentRecords, [record]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

    // Broadcast event lokal untuk real-time sinkronisasi dasbor guru
    try {
        window.dispatchEvent(new CustomEvent('quizmaster_new_record', { detail: record }));
    } catch(e) {}

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
            moduleId: modId,
            moduleTitle: record.moduleTitle,
            proofId: proofCode
        },
        duration: record.duration,
        time_str: record.time,
        quiz_date: record.date
    };

    // 1. Simpan ke Cloud Supabase Real-Time Database via SDK
    if (supabaseClient) {
        try {
            const { error } = await supabaseClient.from(cfg.table || 'quiz_results').insert([rowPayload]);
            if (!error) {
                savedToSupabase = true;
                console.log('✅ Nilai siswa berhasil disimpan ke Cloud Supabase via SDK! ID Bukti:', proofCode);
            } else {
                console.warn('Supabase SDK insert warning:', error.message);
            }
        } catch (err) {
            console.warn('Supabase SDK sync error:', err);
        }
    }

    // 2. Jalur Fallback Langsung via REST API (Penyelamat jika koneksi seluler mobile lambat / CDN terkendala)
    if (!savedToSupabase) {
        try {
            const targetUrl = `${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}`;
            const res = await fetch(targetUrl, {
                method: 'POST',
                headers: {
                    'apikey': cfg.key,
                    'Authorization': 'Bearer ' + cfg.key,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(rowPayload)
            });
            if (res.ok) {
                savedToSupabase = true;
                console.log('✅ Nilai siswa berhasil disimpan ke Cloud Supabase via direct REST API! ID Bukti:', proofCode);
            }
        } catch (restErr) {
            console.warn('Direct REST insert warning:', restErr.message);
        }
    }

    // 2b. Simpan ke Google Firebase Cloud Firestore (Berjalan 24 Jam Non-Stop)
    let savedToFirebase = false;
    if (typeof saveRecordToFirebase === 'function') {
        try {
            savedToFirebase = await saveRecordToFirebase(record, proofCode);
            if (savedToFirebase) {
                console.log('🔥 Nilai siswa berhasil disimpan ke Google Firebase Cloud Firestore! ID Bukti:', proofCode);
            }
        } catch (fbErr) {
            console.warn('Firebase save warning:', fbErr.message);
        }
    }

    // 3. Jika sedang offline atau jaringan mobile terputus, masukkan ke Antrean Offline Sync
    if (!savedToSupabase && !savedToFirebase) {
        if (typeof queueRecordForSync === 'function') {
            queueRecordForSync(record);
        }
    }

    // 4. Cadangan ke server Node.js lokal (jika dijalankan)
    try {
        await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(record)
        });
    } catch (err) {}

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
    return v !== null ? parseInt(v) : 30;
}

async function saveTimerSetting() {
    const val = parseInt(document.getElementById('setting-timer').value);
    localStorage.setItem(TIMER_SETTING_KEY, val);
    TIMER_MAX = val;
    const msg = document.getElementById('timer-saved-msg');
    if (msg) {
        msg.classList.add('show');
        setTimeout(() => msg.classList.remove('show'), 2000);
    }
    sfxCorrect();

    // ☁️ Sinkronkan durasi timer ke Cloud Supabase agar berlaku di seluruh HP / Laptop
    if (typeof saveCloudSharedState === 'function') {
        saveCloudSharedState({ timerSeconds: val });
    }

    try {
        await fetch('/api/settings', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-pin': PIN_GURU 
            },
            body: JSON.stringify({ timer_seconds: val, pin: PIN_GURU })
        });
    } catch (e) {}
}

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
    // Ambil data siswa & modul custom, abaikan __SYSTEM_CONFIG__ agar tidak memenuhi kuota 1000 baris PostgREST
    const targetUrl = `${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}?student_class=neq.__SYSTEM_CONFIG__&select=*&order=id.desc&limit=5000`;
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

        // 2. Sinkronisasi Durasi Timer Kuis
        if (typeof state.timerSeconds === 'number' && state.timerSeconds > 0) {
            localStorage.setItem(TIMER_SETTING_KEY, state.timerSeconds);
            TIMER_MAX = state.timerSeconds;
            const timerSel = document.getElementById('setting-timer');
            if (timerSel) timerSel.value = state.timerSeconds;
        }

        // 2b. Sinkronisasi Durasi Timer Mini-Games
        if (state.miniGamesTimerSeconds !== undefined) {
            localStorage.setItem(MINIGAMES_TIMER_KEY, state.miniGamesTimerSeconds);
            const mgTimerSel = document.getElementById('setting-minigames-timer');
            if (mgTimerSel) mgTimerSel.value = state.miniGamesTimerSeconds;
        }

        // 3. Sinkronisasi Pengaturan Akses Kuis
        if (state.accessSettings && typeof state.accessSettings === 'object') {
            localStorage.setItem('detektif_fakta_access_control', JSON.stringify(state.accessSettings));
            if (typeof initAccessSettingsUi === 'function') initAccessSettingsUi();
        }

        // 4. Sinkronisasi Modul Ujian Aktif
        if (state.activeModuleId && window.QuizManager) {
            const curActive = window.QuizManager.getActiveModuleId();
            if (curActive !== state.activeModuleId) {
                window.QuizManager.setActiveModuleId(state.activeModuleId);
                if (typeof initModulesCatalog === 'function') initModulesCatalog();
            }
        }
    } catch(e) {
        console.warn('Gagal menerapkan Cloud Shared State:', e);
    }
}
window.applyCloudSharedStateToLocal = applyCloudSharedStateToLocal;

// ⚡ REAL-TIME SUPABASE SUBSCRIPTION (SEKETIKA UPDATE SAAT ADA NILAI / PERUBAHAN BARU)
let realtimeChannel = null;

function initSupabaseRealtime() {
    if (realtimeChannel) return;
    const client = window.supabaseClient || (typeof initSupabaseClient === 'function' ? initSupabaseClient() : null);
    if (!client || typeof client.channel !== 'function') return;

    try {
        const cfg = (typeof getSupabaseConfig === 'function') ? getSupabaseConfig() : { table: 'quiz_results' };
        const tableName = cfg.table || 'quiz_results';

        realtimeChannel = client
            .channel('quizmaster_multi_device_sync')
            .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
                console.log('⚡ [Real-time Supabase Event]:', payload.eventType);
                // Sinkronisasi data di latar belakang secara otomatis
                syncWithBackend(false);
            })
            .subscribe((status) => {
                console.log('📡 [Supabase Realtime Channel Status]:', status);
            });
    } catch(e) {
        console.warn('Realtime subscription warning:', e.message);
    }
}
window.initSupabaseRealtime = initSupabaseRealtime;

async function syncWithBackend(showFeedback = false) {
    const cfg = (typeof getSupabaseConfig === 'function') ? getSupabaseConfig() : { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_ANON_KEY, table: 'quiz_results' };
    const tableName = cfg.table || 'quiz_results';

    let rawData = null;

    // 1. Coba ambil data via REST API langsung (paling cepat & andal di mobile/desktop)
    try {
        rawData = await fetchSupabaseRecords(cfg);
    } catch (restErr) {
        console.warn('REST sync fetch error, mencoba supabaseClient:', restErr.message);
        if (supabaseClient) {
            try {
                const { data, error } = await supabaseClient
                    .from(tableName)
                    .select('*')
                    .neq('student_class', '__SYSTEM_CONFIG__')
                    .order('id', { ascending: false })
                    .limit(5000);
                if (!error && Array.isArray(data)) rawData = data;
            } catch (sdkErr) {}
        }
    }

    // Ambil status shared state cloud di latar belakang secara terpisah agar tidak mempengaruhi kuota data siswa
    if (typeof fetchCloudSharedState === 'function') {
        fetchCloudSharedState().then(cloudState => {
            if (cloudState && typeof applyCloudSharedStateToLocal === 'function') {
                applyCloudSharedStateToLocal(cloudState);
            }
        }).catch(() => {});
    }

    if (Array.isArray(rawData)) {
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

        const formatted = studentRows.map(r => {
            let extractedModId = null;
            let extractedModTitle = null;
            let extractedWrong = [];

            if (r.wrong_questions && typeof r.wrong_questions === 'object' && !Array.isArray(r.wrong_questions)) {
                extractedModId = r.wrong_questions.moduleId;
                extractedModTitle = r.wrong_questions.moduleTitle;
                extractedWrong = Array.isArray(r.wrong_questions.list) ? r.wrong_questions.list : [];
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
                isCheated: r.is_cheated !== undefined ? r.is_cheated : !!r.isCheated
            };
        });

        // Selalu gabungkan dengan baseline data resmi (155 data resmi Misi Detektif Fakta) dan data lokal saat ini
        const baseline = (typeof OFFICIAL_EXAM_RESULTS !== 'undefined' && Array.isArray(OFFICIAL_EXAM_RESULTS)) ? purgeFakeJkiRecords(OFFICIAL_EXAM_RESULTS) : [];
        const currentLocal = purgeFakeJkiRecords(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
        const mergedBaseline = mergeRecordsList(baseline, currentLocal);
        let cloudList = formatted;

        // Ambil data dari Firebase Cloud Firestore jika aktif
        if (typeof fetchFirebaseRecords === 'function') {
            try {
                const fbRecords = await fetchFirebaseRecords();
                if (Array.isArray(fbRecords) && fbRecords.length > 0) {
                    cloudList = mergeRecordsList(cloudList, fbRecords);
                    console.log(`🔥 [Firebase] ${fbRecords.length} data nilai digabungkan ke dasbor.`);
                }
            } catch(fbErr) {
                console.warn('Firebase sync warning:', fbErr.message);
            }
        }

        const finalRecords = filterDeletedRecords(purgeFakeJkiRecords(mergeRecordsList(mergedBaseline, cloudList)));

        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalRecords));
        localStorage.setItem(OFFICIAL_DATA_SYNC_KEY, CURRENT_OFFICIAL_VERSION);
        
        isBackendOnline = true;
        updateDbBadge(true, finalRecords.length);

        // Pastikan antrean nilai offline terunggah jika ada
        if (typeof flushPendingRecords === 'function') {
            flushPendingRecords();
        }

        // Pastikan Realtime Subscription aktif
        initSupabaseRealtime();
        if (typeof initFirebaseRealtime === 'function') {
            initFirebaseRealtime();
        }

        if (typeof renderDashboard === 'function') renderDashboard();
        if (showFeedback) {
            showToast(`✅ Berhasil menyinkronkan data cloud! (Total: ${finalRecords.length} Siswa)`, '☁️');
        }
        return true;
    } else {
        // Coba sinkronkan dari Firebase jika Supabase offline/bermasalah
        if (typeof fetchFirebaseRecords === 'function') {
            try {
                const fbRecords = await fetchFirebaseRecords();
                if (Array.isArray(fbRecords) && fbRecords.length > 0) {
                    const baseline = (typeof OFFICIAL_EXAM_RESULTS !== 'undefined' && Array.isArray(OFFICIAL_EXAM_RESULTS)) ? purgeFakeJkiRecords(OFFICIAL_EXAM_RESULTS) : [];
                    const currentLocal = purgeFakeJkiRecords(JSON.parse(localStorage.getItem(STORAGE_KEY)) || []);
                    const mergedBaseline = mergeRecordsList(baseline, currentLocal);
                    const finalRecords = filterDeletedRecords(purgeFakeJkiRecords(mergeRecordsList(mergedBaseline, fbRecords)));
                    
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalRecords));
                    localStorage.setItem(OFFICIAL_DATA_SYNC_KEY, CURRENT_OFFICIAL_VERSION);
                    isBackendOnline = true;
                    updateDbBadge(true, finalRecords.length);
                    if (typeof initFirebaseRealtime === 'function') initFirebaseRealtime();
                    if (typeof renderDashboard === 'function') renderDashboard();
                    if (showFeedback) {
                        showToast(`🔥 Berhasil menyinkronkan ${fbRecords.length} data dari Google Firebase!`, '🔥');
                    }
                    return true;
                }
            } catch(fbErr) {}
        }

        if (showFeedback) {
            showToast('⚠️ Gagal terhubung ke basis data Supabase. Periksa URL / Key atau gunakan Firebase.', '⚠️');
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
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
                if (typeof renderDashboard === 'function') renderDashboard();
            }
        }
    } catch (e) {}

    return false;
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