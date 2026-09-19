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

function mergeRecordsList(existingList, incomingList) {
    const map = new Map();
    const makeKey = (r) => `${(r.name || '').toLowerCase().trim()}|${(r.class || '').trim()}`;
    
    (existingList || []).forEach(r => {
        if (r && r.name) map.set(makeKey(r), r);
    });

    (incomingList || []).forEach(r => {
        if (!r || !r.name) return;
        const k = makeKey(r);
        if (!map.has(k)) {
            map.set(k, r);
        } else {
            const cur = map.get(k);
            if ((r.score || 0) >= (cur.score || 0) || (r.timestamp || 0) > (cur.timestamp || 0)) {
                map.set(k, { ...cur, ...r });
            }
        }
    });

    return Array.from(map.values());
}
window.mergeRecordsList = mergeRecordsList;

const OFFICIAL_DATA_SYNC_KEY = 'quizmaster_official_pdf_sync_ver';
const CURRENT_OFFICIAL_VERSION = '20260919_official_155_final';

function loadRecords() {
    try {
        // Validasi sinkronisasi data resmi PDF 155 siswa (dokumen valid mutlak)
        if (localStorage.getItem(OFFICIAL_DATA_SYNC_KEY) !== CURRENT_OFFICIAL_VERSION) {
            if (typeof OFFICIAL_EXAM_RESULTS !== 'undefined' && Array.isArray(OFFICIAL_EXAM_RESULTS) && OFFICIAL_EXAM_RESULTS.length > 0) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(OFFICIAL_EXAM_RESULTS));
                localStorage.removeItem('detektif_fakta_records'); // Hapus cache testing lama
                localStorage.setItem(OFFICIAL_DATA_SYNC_KEY, CURRENT_OFFICIAL_VERSION);
                return OFFICIAL_EXAM_RESULTS;
            }
        }

        let saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (Array.isArray(saved) && saved.length > 0) {
            return saved;
        }

        if (typeof OFFICIAL_EXAM_RESULTS !== 'undefined' && Array.isArray(OFFICIAL_EXAM_RESULTS) && OFFICIAL_EXAM_RESULTS.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(OFFICIAL_EXAM_RESULTS));
            localStorage.setItem(OFFICIAL_DATA_SYNC_KEY, CURRENT_OFFICIAL_VERSION);
            return OFFICIAL_EXAM_RESULTS;
        }
        return [];
    } catch (e) {
        return (typeof OFFICIAL_EXAM_RESULTS !== 'undefined' && Array.isArray(OFFICIAL_EXAM_RESULTS)) ? OFFICIAL_EXAM_RESULTS : [];
    }
}

function restoreOfficialPdfRecords() {
    sfxClick();
    if (typeof OFFICIAL_EXAM_RESULTS !== 'undefined' && Array.isArray(OFFICIAL_EXAM_RESULTS)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(OFFICIAL_EXAM_RESULTS));
        localStorage.removeItem('detektif_fakta_records');
        localStorage.setItem(OFFICIAL_DATA_SYNC_KEY, CURRENT_OFFICIAL_VERSION);
        if (typeof renderDashboard === 'function') renderDashboard();
        showToast(`✅ Basis data berhasil disetel ulang ke 155 nilai siswa resmi PDF!`, '📥');
    }
}
window.restoreOfficialPdfRecords = restoreOfficialPdfRecords;

async function saveRecord(record) {
    const records = loadRecords();
    records.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

    // Broadcast event lokal untuk real-time sinkronisasi dasbor guru
    try {
        window.dispatchEvent(new CustomEvent('quizmaster_new_record', { detail: record }));
    } catch(e) {}

    let savedToSupabase = false;
    const cfg = (typeof getSupabaseConfig === 'function') ? getSupabaseConfig() : { url: DEFAULT_SUPABASE_URL, key: DEFAULT_SUPABASE_ANON_KEY, table: 'quiz_results' };
    const rowPayload = {
        student_name: record.name,
        student_class: record.class,
        score: record.score,
        correct_count: record.correct,
        total_questions: record.total || (window.quizData ? window.quizData.length : 20),
        wrong_questions: record.wrongQuestions || [],
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
                console.log('✅ Nilai siswa berhasil disimpan ke Cloud Supabase via SDK!');
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
                console.log('✅ Nilai siswa berhasil disimpan ke Cloud Supabase via direct REST API!');
            }
        } catch (restErr) {
            console.warn('Direct REST insert warning:', restErr.message);
        }
    }

    // 3. Jika sedang offline atau jaringan mobile terputus, masukkan ke Antrean Offline Sync
    if (!savedToSupabase) {
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
    const targetUrl = `${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}?select=*&order=score.desc`;
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
window.lastKnownSupabaseCount = 155;

function updateDbBadge(isOnline, count = null) {
    const badge = document.getElementById('db-status-badge');
    if (!badge) return;
    if (typeof count === 'number' && count > 0) {
        window.lastKnownSupabaseCount = count;
    }
    const currentCount = window.lastKnownSupabaseCount || 155;

    if (isOnline) {
        const expectedHtml = `🟢 <span>Cloud Supabase (${currentCount} Siswa)</span>`;
        if (badge.innerHTML !== expectedHtml) {
            badge.innerHTML = expectedHtml;
            badge.style.background = 'rgba(16,185,129,0.15)';
            badge.style.borderColor = 'rgba(16,185,129,0.4)';
            badge.style.color = 'var(--success)';
            badge.title = 'Terhubung ke Cloud Supabase — Data Real-Time Tersinkronisasi';
        }
    } else {
        const expectedHtml = '☁️ <span>Supabase (Klik untuk Sinkron)</span>';
        if (badge.innerHTML !== expectedHtml) {
            badge.innerHTML = expectedHtml;
            badge.style.background = 'rgba(99,102,241,0.15)';
            badge.style.borderColor = 'rgba(99,102,241,0.4)';
            badge.style.color = 'var(--primary)';
            badge.title = 'Klik untuk membuka modal sinkronisasi Supabase Cloud';
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
                    .order('score', { ascending: false });
                if (!error && Array.isArray(data)) rawData = data;
            } catch (sdkErr) {}
        }
    }

    if (Array.isArray(rawData)) {
        // A. Filter baris data siswa vs baris konfigurasi sistem
        const studentRows = rawData.filter(r => {
            const sName = String(r.student_name || '');
            const sClass = String(r.student_class || '');
            return !sName.startsWith('__') && sClass !== '__SYSTEM_CONFIG__' && sClass !== '__MODULE_DATA__';
        });

        // B. Ekstraksi Shared System State jika ada (Sync setting guru ke seluruh HP & Laptop)
        const systemStateRow = rawData.find(r => r.student_name === '__QUIZMASTER_SHARED_STATE__');
        if (systemStateRow && systemStateRow.wrong_questions && typeof systemStateRow.wrong_questions === 'object') {
            applyCloudSharedStateToLocal(systemStateRow.wrong_questions);
        }

        // C. Ekstraksi Modul Kuis yang dibuat guru jika ada
        const moduleRows = rawData.filter(r => r.student_class === '__MODULE_DATA__');
        if (moduleRows.length > 0 && window.QuizManager && typeof window.QuizManager.syncCloudModulesList === 'function') {
            window.QuizManager.syncCloudModulesList(moduleRows);
        }

        const formatted = studentRows.map(r => ({
            id: r.id,
            name: r.student_name || r.name,
            class: r.student_class || r.class,
            score: r.score,
            correct: r.correct_count !== undefined ? r.correct_count : (r.correct !== undefined ? r.correct : Math.round(r.score * 0.2)),
            total: r.total_questions || r.total || (window.quizData ? window.quizData.length : 20),
            wrongQuestions: Array.isArray(r.wrong_questions) ? r.wrong_questions : (Array.isArray(r.wrongQuestions) ? r.wrongQuestions : []),
            duration: r.duration || '-',
            time: r.time_str || r.time || '-',
            date: r.quiz_date || r.date || '-',
            timestamp: r.created_at ? new Date(r.created_at).getTime() : (r.timestamp || Date.now()),
            tabSwitchCount: r.tab_switch_count !== undefined ? r.tab_switch_count : (r.tabSwitchCount || 0),
            isCheated: r.is_cheated !== undefined ? r.is_cheated : !!r.isCheated
        }));

        let finalRecords;
        if (formatted.length >= 155) {
            finalRecords = formatted;
        } else {
            const current = loadRecords();
            finalRecords = mergeRecordsList(current, formatted);
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalRecords));
        localStorage.setItem(OFFICIAL_DATA_SYNC_KEY, CURRENT_OFFICIAL_VERSION);
        
        isBackendOnline = true;
        updateDbBadge(true, formatted.length);

        // Pastikan antrean nilai offline terunggah jika ada
        if (typeof flushPendingRecords === 'function') {
            flushPendingRecords();
        }

        // Pastikan Realtime Subscription aktif
        initSupabaseRealtime();

        if (typeof renderDashboard === 'function') renderDashboard();
        if (showFeedback) {
            showToast(`✅ Berhasil menyinkronkan ${formatted.length} data dari Supabase! (Total: ${merged.length})`, '☁️');
        }
        return true;
    } else {
        if (showFeedback) {
            showToast('⚠️ Gagal terhubung ke basis data Supabase. Periksa URL / Key.', '⚠️');
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
            const { error } = await supabaseClient.from(cfg.table || 'quiz_results').insert([{
                student_name: r.name,
                student_class: r.class,
                score: r.score,
                correct_count: r.correct !== undefined ? r.correct : 0,
                total_questions: r.total || 20,
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