// ============================================================
//  💾 GLOBAL CONSTANTS & STATE
// ============================================================
const STORAGE_KEY = 'detektif_fakta_records_v2';
const TIMER_SETTING_KEY = 'detektif_fakta_timer';
const PIN_GURU = '2543';

// 🛡️ GLOBAL SECURITY HELPERS: XSS ESCAPING & CSV/EXCEL FORMULA SANITIZATION
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

function sanitizeSpreadsheetValue(val) {
    if (val === null || val === undefined) return '';
    const s = String(val).trim();
    if (/^[=+\-@\t\r]/.test(s)) {
        return "'" + s;
    }
    return s;
}
window.sanitizeSpreadsheetValue = sanitizeSpreadsheetValue;

// ☁️ SUPABASE CLOUD DATABASE CONFIGURATION (DAPAT DISESUAIKAN GURU)
const SUPABASE_CONFIG_KEY = 'quizmaster_supabase_config_v2';
const DEFAULT_SUPABASE_URL = 'https://vuegrohnszqtmnthcaqp.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_nDQrTtj1ZqRFgb7rtBVFkQ_i6Kr1FdA';
const DEFAULT_SUPABASE_SECRET_KEY = '';

function getSupabaseConfig() {
    try {
        const saved = JSON.parse(localStorage.getItem(SUPABASE_CONFIG_KEY));
        // Jika belum ada atau masih pakai key lama (JWT eyJ...), perbarui ke publishable key baru
        if (saved && saved.url && saved.key && !saved.key.startsWith('eyJ')) {
            return saved;
        }
    } catch (e) {}
    const fresh = {
        url: DEFAULT_SUPABASE_URL,
        key: DEFAULT_SUPABASE_ANON_KEY,
        secretKey: DEFAULT_SUPABASE_SECRET_KEY,
        table: 'quiz_results'
    };
    try {
        localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(fresh));
    } catch(e) {}
    return fresh;
}
window.getSupabaseConfig = getSupabaseConfig;

function saveSupabaseConfig(url, key, table = 'quiz_results', secretKey = '') {
    const cfg = {
        url: (url || DEFAULT_SUPABASE_URL).trim(),
        key: (key || DEFAULT_SUPABASE_ANON_KEY).trim(),
        secretKey: (secretKey || DEFAULT_SUPABASE_SECRET_KEY).trim(),
        table: (table || 'quiz_results').trim()
    };
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(cfg));
    return initSupabaseClient();
}
window.saveSupabaseConfig = saveSupabaseConfig;

let supabaseClient = null;

function initSupabaseClient() {
    const cfg = getSupabaseConfig();
    try {
        if (window.supabase && typeof window.supabase.createClient === 'function' && cfg.url && cfg.key) {
            supabaseClient = window.supabase.createClient(cfg.url, cfg.key);
            window.supabaseClient = supabaseClient;
            return supabaseClient;
        }
    } catch (err) {
        console.warn('Supabase init error:', err);
    }
    supabaseClient = null;
    window.supabaseClient = null;
    return null;
}
window.initSupabaseClient = initSupabaseClient;
initSupabaseClient();

// ============================================================
// 🌐 MULTI-DEVICE CLOUD SHARED STATE (SYNC ACROSS MOBILE & DESKTOP)
// ============================================================
const CLOUD_STATE_ROW_NAME = '__QUIZMASTER_SHARED_STATE__';
const CLOUD_STATE_ROW_CLASS = '__SYSTEM_CONFIG__';
const PENDING_SYNC_KEY = 'quizmaster_pending_sync_records_v1';

async function fetchCloudSharedState() {
    const cfg = getSupabaseConfig();
    try {
        const url = `${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}?student_name=eq.${encodeURIComponent(CLOUD_STATE_ROW_NAME)}&select=*&order=id.desc&limit=1`;
        const res = await fetch(url, {
            headers: {
                'apikey': cfg.key,
                'Authorization': 'Bearer ' + cfg.key
            }
        });
        if (res.ok) {
            const rows = await res.json();
            if (Array.isArray(rows) && rows.length > 0 && rows[0].wrong_questions) {
                return rows[0].wrong_questions;
            }
        }
    } catch(e) {
        console.warn('Gagal memuat Cloud Shared State:', e.message);
    }
    return null;
}
window.fetchCloudSharedState = fetchCloudSharedState;

async function saveCloudSharedState(partialState) {
    const cfg = getSupabaseConfig();
    const baseUrl = `${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}`;
    
    // Gabungkan dengan state yang sudah tersimpan
    let currentState = {};
    try {
        const existing = await fetchCloudSharedState();
        if (existing && typeof existing === 'object') {
            currentState = existing;
        }
    } catch(e) {}
    
    const mergedState = {
        ...currentState,
        ...partialState,
        updatedAt: Date.now()
    };

    try {
        // 1. Coba PATCH pada baris yang sudah ada
        const patchRes = await fetch(`${baseUrl}?student_name=eq.${encodeURIComponent(CLOUD_STATE_ROW_NAME)}`, {
            method: 'PATCH',
            headers: {
                'apikey': cfg.key,
                'Authorization': 'Bearer ' + cfg.key,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                wrong_questions: mergedState,
                quiz_date: new Date().toLocaleDateString('id-ID')
            })
        });
        const patchData = await patchRes.json();
        
        // 2. Jika baris belum ada (0 updated rows), lakukan POST
        if (!Array.isArray(patchData) || patchData.length === 0) {
            await fetch(baseUrl, {
                method: 'POST',
                headers: {
                    'apikey': cfg.key,
                    'Authorization': 'Bearer ' + cfg.key,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    student_name: CLOUD_STATE_ROW_NAME,
                    student_class: CLOUD_STATE_ROW_CLASS,
                    score: 100,
                    correct_count: 0,
                    total_questions: 0,
                    wrong_questions: mergedState,
                    duration: '0',
                    time_str: '00:00',
                    quiz_date: new Date().toLocaleDateString('id-ID')
                })
            });
        }
        return true;
    } catch(e) {
        console.warn('Gagal menyimpan Cloud Shared State:', e.message);
        return false;
    }
}
window.saveCloudSharedState = saveCloudSharedState;

// ============================================================
// 📱 OFFLINE RESILIENT SYNC QUEUE (PENANGANAN KONEKSI LEMAH / OFFLINE)
// ============================================================
function getPendingRecords() {
    try {
        const raw = localStorage.getItem(PENDING_SYNC_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch(e) {
        return [];
    }
}
window.getPendingRecords = getPendingRecords;

function queueRecordForSync(record) {
    const queue = getPendingRecords();
    queue.push({
        record: record,
        queuedAt: Date.now()
    });
    localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(queue));
    console.log('📦 Nilai disimpan ke antrean offline sync:', record.name);
}
window.queueRecordForSync = queueRecordForSync;

async function flushPendingRecords() {
    const queue = getPendingRecords();
    if (!queue || queue.length === 0) return 0;
    
    console.log(`⏳ Memulai sinkronisasi ${queue.length} data nilai yang tertunda ke Cloud Supabase...`);
    const cfg = getSupabaseConfig();
    const successfulIndices = [];

    for (let i = 0; i < queue.length; i++) {
        const item = queue[i];
        const r = item.record;
        let uploaded = false;
        const uploadPayload = {
            student_name: r.name,
            student_class: r.class,
            score: r.score,
            correct_count: r.correct,
            total_questions: r.total || 20,
            wrong_questions: r.wrongQuestions || [],
            duration: r.duration || '0m',
            time_str: r.time || '00:00',
            quiz_date: r.date || new Date().toLocaleDateString('id-ID')
        };

        // Coba via SDK
        if (supabaseClient) {
            try {
                const { error } = await supabaseClient.from(cfg.table || 'quiz_results').insert([uploadPayload]);
                if (!error) uploaded = true;
            } catch(e) {}
        }

        // Coba via REST jika SDK belum berhasil
        if (!uploaded) {
            try {
                const res = await fetch(`${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}`, {
                    method: 'POST',
                    headers: {
                        'apikey': cfg.key,
                        'Authorization': 'Bearer ' + cfg.key,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(uploadPayload)
                });
                if (res.ok) uploaded = true;
            } catch(e) {}
        }

        if (uploaded) {
            successfulIndices.push(i);
        }
    }

    if (successfulIndices.length > 0) {
        const remaining = queue.filter((_, idx) => !successfulIndices.includes(idx));
        localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(remaining));
        if (typeof showToast === 'function') {
            showToast(`🌐 ${successfulIndices.length} data nilai offline berhasil disinkronkan ke Cloud Supabase!`, '☁️');
        }
    }

    return successfulIndices.length;
}
window.flushPendingRecords = flushPendingRecords;

// 🕒 JADWAL MENGAJAR RESMI GURU MATA PELAJARAN (RINI SYAFITRI)
// 0: Minggu, 1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat, 6: Sabtu
const SCHEDULE_RINI_SYAFITRI = {
    'X E 1': { day: 1, dayName: 'Senin', start: '08:35', end: '09:25', period: 'Jam ke 4 - 5' },
    'X E 2': { day: 1, dayName: 'Senin', start: '10:35', end: '11:25', period: 'Jam ke 8 - 9' },
    'X E 6': { day: 3, dayName: 'Rabu',  start: '10:50', end: '11:50', period: 'Jam ke 8 - 9' },
    'X E 3': { day: 4, dayName: 'Kamis', start: '08:00', end: '09:00', period: 'Jam ke 3 - 4' },
    'X E 5': { day: 5, dayName: 'Jumat', start: '07:00', end: '08:10', period: 'Jam ke 1 - 2' },
    'X E 4': { day: 5, dayName: 'Jumat', start: '09:20', end: '10:50', period: 'Jam ke 5 - 6' }
};
const SCHEDULE_BUK_RINI = SCHEDULE_RINI_SYAFITRI;
const ACCESS_SETTINGS_KEY = 'detektif_fakta_access_control';

let TIMER_MAX = 30;
let studentName = '';
let studentClass = '';
let currentQ = 0;
let score = 0;
let streak = 0;
let maxStreak = 0;
let timerVal = 30;
let timerInterval = null;
let answeredCorrectly = [];
let detailedAnswers = [];
let quizStartTime = null;
let prevRecordCount = 0;
let shuffledQuizOrder = [];
let currentShuffleMap = [];
let isBackendOnline = false;
let currentActiveModule = null;
let earnedPointsTotal = 0;
let totalPossiblePoints = 100;
let generatedQuizDraft = null;
let quizData = (typeof window !== 'undefined' && Array.isArray(window.DEFAULT_BUILTIN_QUESTIONS) && window.DEFAULT_BUILTIN_QUESTIONS.length > 0) 
    ? [...window.DEFAULT_BUILTIN_QUESTIONS] 
    : [];
window.quizData = quizData;

let isRemedialSession = false;
let remedialSourceRecord = null;
let remedialOriginalQuestions = [];
window.isRemedialSession = isRemedialSession;
window.remedialSourceRecord = remedialSourceRecord;

let currentStudent = { name: '', kelas: '' };
window.currentStudent = currentStudent;

const screens = {
    get home() { return document.getElementById('screen-home'); },
    get learn() { return document.getElementById('screen-learn'); },
    get games() { return document.getElementById('screen-games'); },
    get quiz() { return document.getElementById('screen-quiz'); },
    get result() { return document.getElementById('screen-result'); },
    get teacher() { return document.getElementById('screen-teacher'); }
};
window.screens = screens;

function switchScreen(key) {
    Object.values(screens).forEach(s => {
        if (s) s.classList.remove('active');
    });
    if (screens[key]) {
        screens[key].classList.add('active');
    }

    // Sync Modern Header Elements
    const portalBadge = document.getElementById('header-portal-badge');
    const navItems = document.querySelectorAll('.header-nav .nav-item');
    const profName = document.getElementById('header-profile-name');
    const profRole = document.getElementById('header-profile-role');
    const profAvatar = document.getElementById('header-avatar-text');

    if (navItems) {
        navItems.forEach(el => el.classList.remove('active'));
    }

    if (key === 'home') {
        if (portalBadge) portalBadge.innerHTML = '<span class="pulse-dot"></span> STUDENT PORTAL';
        const homeNav = document.getElementById('nav-btn-home');
        if (homeNav) homeNav.classList.add('active');
        if (profName) profName.textContent = currentStudent.name || 'Akun Siswa';
        if (profRole) profRole.textContent = currentStudent.kelas ? `Kelas ${currentStudent.kelas}` : 'SMAN 4 Padang';
        if (profAvatar) {
            if (currentStudent.name) {
                const parts = currentStudent.name.trim().split(/\s+/);
                profAvatar.textContent = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
            } else {
                profAvatar.textContent = '🎓';
            }
        }
    } else if (key === 'learn') {
        if (portalBadge) portalBadge.innerHTML = '<span class="pulse-dot" style="background: #10B981;"></span> RUANG BELAJAR';
        const learnNav = document.getElementById('nav-btn-learn');
        if (learnNav) learnNav.classList.add('active');
        if (profName) profName.textContent = currentStudent.name || 'Ruang Belajar';
        if (profRole) profRole.textContent = 'Modul Belajar';
        if (profAvatar) profAvatar.textContent = '📖';
    } else if (key === 'games') {
        if (portalBadge) portalBadge.innerHTML = '<span class="pulse-dot" style="background: #EC4899;"></span> ARENA GAME';
        const gamesNav = document.getElementById('nav-btn-games');
        if (gamesNav) gamesNav.classList.add('active');
        if (profName) profName.textContent = currentStudent.name || 'Arena Game';
        if (profRole) profRole.textContent = 'Ice Breaking';
        if (profAvatar) profAvatar.textContent = '🎮';
    } else if (key === 'teacher') {
        if (portalBadge) portalBadge.innerHTML = '<span class="pulse-dot" style="background: #8B5CF6;"></span> TEACHER PORTAL';
        const rekapNav = document.getElementById('nav-btn-rekap');
        if (rekapNav) rekapNav.classList.add('active');
        if (profName) profName.textContent = 'Ibu Guru / Admin';
        if (profRole) profRole.textContent = 'Guru Mata Pelajaran';
        if (profAvatar) profAvatar.textContent = '👩‍🏫';
    } else if (key === 'quiz') {
        if (portalBadge) portalBadge.innerHTML = '<span class="pulse-dot" style="background: #10B981;"></span> RUANG UJIAN';
        if (profName) profName.textContent = currentStudent.name || 'Siswa Ujian';
        if (profRole) profRole.textContent = currentStudent.kelas ? `Kelas ${currentStudent.kelas}` : 'Sedang Ujian';
    } else if (key === 'result') {
        if (portalBadge) portalBadge.innerHTML = '<span class="pulse-dot" style="background: #F59E0B;"></span> HASIL & REVIEW';
        if (profName) profName.textContent = currentStudent.name || 'Siswa Evaluasi';
        if (profRole) profRole.textContent = currentStudent.kelas ? `Kelas ${currentStudent.kelas}` : 'Selesai Ujian';
    }

    // ⏱️ Synchronize Header Live Timer (HANYA MUNCUL SAAT SISWA UJIAN)
    if (key === 'quiz') {
        if (typeof startHeaderSessionTimer === 'function') startHeaderSessionTimer();
    } else {
        if (typeof stopHeaderSessionTimer === 'function') stopHeaderSessionTimer();
    }
}
window.switchScreen = switchScreen;

function goHome() {
    window.onbeforeunload = null;
    stopBGM();
    stopTimer();
    const nameInp = document.getElementById('input-name');
    const classInp = document.getElementById('input-class');
    if (nameInp) nameInp.value = '';
    if (classInp) classInp.selectedIndex = 0;
    isRemedialSession = false;
    window.isRemedialSession = false;
    remedialSourceRecord = null;
    window.remedialSourceRecord = null;
    const remInd = document.getElementById('quiz-remedial-indicator');
    if (remInd) remInd.style.display = 'none';

    switchScreen('home');
    document.querySelectorAll('.header-nav .nav-item').forEach(el => el.classList.remove('active'));
    const homeNav = document.getElementById('nav-btn-home');
    if (homeNav) homeNav.classList.add('active');
}

// ============================================================
//  🎵 MODERN CHILL & UPLIFTING STUDY-BEATS AUDIO SYNTHESIZER
// ============================================================
const ACConstructor = window.AudioContext || window.webkitAudioContext;
let actx = null;
let isMuted = false;
let bgmInterval = null;
let bgmRunning = false;
let bgmStep = 0;

function initAudio() {
    if (!actx) actx = new ACConstructor();
    if (actx.state === 'suspended') actx.resume();
}

function tone(freq, type, dur, vol, slide = null, delay = 0, filterFreq = null) {
    if (isMuted || !actx) return;
    const t = actx.currentTime + delay;
    const osc = actx.createOscillator();
    const g = actx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(10, slide), t + dur);
    
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.03);
    g.gain.setValueAtTime(vol * 0.8, t + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    
    if (filterFreq) {
        const filter = actx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(filterFreq, t);
        osc.connect(filter);
        filter.connect(g);
    } else {
        osc.connect(g);
    }
    
    g.connect(actx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
}

// Warm Rhodes / Marimba bell tone
function playBellNote(freq, dur = 0.4, vol = 0.08, delay = 0) {
    if (isMuted || !actx) return;
    tone(freq, 'sine', dur, vol, null, delay, 2200);
    tone(freq * 2, 'triangle', dur * 0.6, vol * 0.25, null, delay, 1800);
}

// Gentle Lo-Fi Kick
function playKick(t = 0, vol = 0.2) {
    if (isMuted || !actx) return;
    const now = actx.currentTime + t;
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
}

// Soft Brushed Snare
function playSnare(t = 0, vol = 0.09) {
    if (isMuted || !actx) return;
    const now = actx.currentTime + t;
    const bufferSize = Math.floor(actx.sampleRate * 0.08);
    const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    const noise = actx.createBufferSource();
    noise.buffer = buffer;
    const filter = actx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    const gain = actx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(actx.destination);
    noise.start(now);
    tone(180, 'triangle', 0.06, vol * 0.6, 90, t);
}

// Airy Hat
function playHiHat(t = 0, vol = 0.02) {
    if (isMuted || !actx) return;
    const now = actx.currentTime + t;
    const bufferSize = Math.floor(actx.sampleRate * 0.025);
    const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = actx.createBufferSource();
    noise.buffer = buffer;
    const filter = actx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8500;
    const gain = actx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(actx.destination);
    noise.start(now);
}

// ✨ Sophisticated, Pleasant Sound Effects
function sfxClick() { 
    playBellNote(659.25, 0.06, 0.08); 
}

function sfxCorrect() {
    // Harmonious major chord chime arpeggio
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    chord.forEach((n, i) => {
        playBellNote(n, 0.35, 0.16, i * 0.045);
    });
}

function sfxWrong() {
    // Gentle mellow pluck (friendly, not harsh)
    playBellNote(329.63, 0.18, 0.14, 0);
    playBellNote(277.18, 0.22, 0.12, 0.08);
}

function sfxCountdown() { 
    playBellNote(440, 0.15, 0.18); 
}

function sfxGo() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => playBellNote(n, 0.4, 0.2, i * 0.05));
}

function sfxVictory() {
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51, 1567.98];
    notes.forEach((n, i) => {
        playBellNote(n, 0.5, 0.18, i * 0.07);
    });
}

function sfxTimerWarn() { 
    playBellNote(880, 0.09, 0.22);
    playBellNote(1174.66, 0.08, 0.16, 0.06);
}

function sfxNewData() { 
    playBellNote(523.25, 0.18, 0.14, 0);
    playBellNote(783.99, 0.25, 0.16, 0.08);
}

function sfxStreakCombo(lvl) {
    const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51];
    chords.slice(0, Math.min(chords.length, lvl + 2)).forEach((f, idx) => {
        playBellNote(f, 0.4, 0.18, idx * 0.04);
    });
}

// 🚨 Loud Siren Alarm Synthesizer for Anti-Cheat Violation (20 Detik)
let alarmSirenTimer = null;
function sfxAlarm(durationSec = 20) {
    if (!actx) initAudio();
    if (isMuted || !actx) return;
    if (alarmSirenTimer) clearInterval(alarmSirenTimer);
    let up = true;
    let freq = 700;
    
    // First burst
    tone(950, 'sawtooth', 0.5, 0.45, 450);
    const startTime = Date.now();
    alarmSirenTimer = setInterval(() => {
        if (Date.now() - startTime >= durationSec * 1000) {
            clearInterval(alarmSirenTimer);
            alarmSirenTimer = null;
            return;
        }
        if (freq >= 1400) up = false;
        if (freq <= 500) up = true;
        freq += up ? 200 : -200;
        tone(freq, 'sawtooth', 0.15, 0.38, null, 0, 3500);
    }, 110);
}

// 📳 Getar Kencang HP Android 20 Detik saat Terdeteksi Curang
let cheatVibrationTimer = null;
function startCheatVibration(durationSec = 20) {
    if ('vibrate' in navigator) {
        if (cheatVibrationTimer) clearInterval(cheatVibrationTimer);
        const startTime = Date.now();
        try { navigator.vibrate([600, 200, 600, 200, 600, 200]); } catch(e) {}
        cheatVibrationTimer = setInterval(() => {
            if (Date.now() - startTime >= durationSec * 1000) {
                clearInterval(cheatVibrationTimer);
                cheatVibrationTimer = null;
                try { navigator.vibrate(0); } catch(e) {}
                return;
            }
            try { navigator.vibrate([600, 200, 600, 200, 600, 200]); } catch(e) {}
        }, 1600);
    }
}

// 🎼 Lush Chill-Pop / Lo-Fi Study Chords (Cmaj7 -> Am7 -> Dm7 -> G7)
const LUSH_CHORDS = [
    { bass: 130.81, notes: [261.63, 329.63, 392.00, 493.88], melody: [523.25, 659.25, 587.33, 493.88] }, // Cmaj7
    { bass: 110.00, notes: [220.00, 261.63, 329.63, 392.00], melody: [440.00, 523.25, 659.25, 523.25] }, // Am7
    { bass: 146.83, notes: [293.66, 349.23, 440.00, 523.25], melody: [587.33, 523.25, 440.00, 392.00] }, // Dm7
    { bass: 98.00,  notes: [196.00, 246.94, 293.66, 349.23], melody: [392.00, 493.88, 587.33, 659.25] }  // G7
];

function bgmTick() {
    if (!bgmRunning || isMuted || !actx) return;
    const step = bgmStep % 16;
    const chordIndex = Math.floor((bgmStep % 64) / 16);
    const chord = LUSH_CHORDS[chordIndex];

    // Smooth subtle beat
    if (step === 0 || step === 10) playKick(0, 0.18);
    if (step === 4 || step === 12) playSnare(0, 0.08);
    if (step % 2 === 0) playHiHat(0, 0.015);
    else if (step % 4 === 3) playHiHat(0, 0.01);

    // Warm deep sub-bass (rounded triangle)
    if (step === 0 || step === 6 || step === 10) {
        tone(chord.bass, 'triangle', 0.35, 0.16, null, 0, 400);
    }

    // Gentle Electric Piano chord stabs
    if (step === 0 || step === 6) {
        chord.notes.forEach(f => {
            playBellNote(f, 0.35, 0.045);
        });
    }

    // Melodic rhodes bell arpeggio on off-beats
    if (step % 4 === 2) {
        const melNote = chord.melody[Math.floor(step / 4)];
        playBellNote(melNote, 0.3, 0.06);
    }

    bgmStep++;
}

function startBGM() {
    if (bgmRunning) return;
    bgmRunning = true;
    bgmStep = 0;
    bgmInterval = setInterval(bgmTick, 150); // Chill 100 BPM tempo
}

function stopBGM() {
    bgmRunning = false;
    if (bgmInterval) {
        clearInterval(bgmInterval);
        bgmInterval = null;
    }
}

function toggleSound() {
    isMuted = !isMuted;
    const btn = document.getElementById('btn-sound');
    if (isMuted) {
        btn.textContent = '🔇'; btn.classList.add('muted');
        stopBGM();
    } else {
        btn.textContent = '🔊'; btn.classList.remove('muted');
        initAudio();
        if (screens.quiz && screens.quiz.classList.contains('active')) startBGM();
    }
}

// ============================================================
// 🧹 KEBIJAKAN RETENSI PENYIMPANAN 7 HARI (STORAGE AUTO-PURGE)
// ============================================================
const STORAGE_RETENTION_MS = 7 * 24 * 60 * 60 * 1000; // 7 Hari (604,800,000 milidetik)

function cleanupExpiredStorageFiles() {
    try {
        const now = Date.now();
        let purgedCount = 0;
        let purgedBytes = 0;

        // 1. Periksa berkas modul materi ajar custom buatan guru
        const modulesKey = 'quizmaster_custom_modules_list';
        const rawModules = localStorage.getItem(modulesKey);
        if (rawModules) {
            try {
                const modules = JSON.parse(rawModules);
                if (Array.isArray(modules)) {
                    const remaining = [];
                    for (const m of modules) {
                        const createdTime = m.uploadedAt || (m.createdAt ? new Date(m.createdAt).getTime() : 0);
                        const isOlderThan7Days = (createdTime > 0) && (now - createdTime > STORAGE_RETENTION_MS);
                        
                        // Modul default bawaan tidak boleh dihapus
                        if (isOlderThan7Days && !m.isDefault && m.id !== 'modul_detektif_fakta') {
                            const dataKey = 'quizmaster_quiz_data_' + m.id;
                            const dataVal = localStorage.getItem(dataKey);
                            if (dataVal) {
                                purgedBytes += dataVal.length;
                                localStorage.removeItem(dataKey);
                            }
                            purgedCount++;
                            console.log(`🧹 Auto-Purge: Modul materi kedaluwarsa (>7 hari) dibersihkan: ${m.title}`);
                        } else {
                            remaining.push(m);
                        }
                    }
                    if (purgedCount > 0) {
                        localStorage.setItem(modulesKey, JSON.stringify(remaining));
                    }
                }
            } catch(e) {}
        }

        // 2. Periksa cache teks ekstrak dokumen sementara & draft yang belum diterbitkan
        const tempPrefixes = ['quizmaster_draft_', 'quizmaster_cached_file_', 'detektif_extracted_doc_', 'qm_temp_upload_'];
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (!key) continue;
            const matchesPrefix = tempPrefixes.some(p => key.startsWith(p));
            if (matchesPrefix) {
                try {
                    const raw = localStorage.getItem(key);
                    const item = JSON.parse(raw);
                    const timestamp = item.uploadedAt || item.timestamp || 0;
                    if (timestamp > 0 && (now - timestamp > STORAGE_RETENTION_MS)) {
                        purgedBytes += (raw ? raw.length : 0);
                        localStorage.removeItem(key);
                        purgedCount++;
                    }
                } catch(e) {
                    // Jika data string mentah tanpa struktur, tetap periksa
                }
            }
        }

        if (purgedCount > 0) {
            console.log(`🛡️ Storage Retention: Berhasil membersihkan ${purgedCount} berkas/draft kedaluwarsa (>7 hari) senilai ~${Math.round(purgedBytes / 1024)} KB.`);
        }
        return { purgedCount, purgedBytes };
    } catch (err) {
        console.warn('Peringatan pembersihan storage:', err);
        return { purgedCount: 0, purgedBytes: 0 };
    }
}

function runManualStorageCleanup() {
    if (typeof sfxClick === 'function') sfxClick();
    const result = cleanupExpiredStorageFiles();
    if (result.purgedCount > 0) {
        if (typeof sfxVictory === 'function') sfxVictory();
        showToast(`🧹 Berhasil membersihkan ${result.purgedCount} berkas/draft kedaluwarsa (>7 hari) seluas ~${Math.round(result.purgedBytes / 1024)} KB!`, '✅');
        if (typeof renderBankSoalModules === 'function') renderBankSoalModules();
        if (typeof initModulesCatalog === 'function') initModulesCatalog();
    } else {
        showToast('Penyimpanan browser bersih! Tidak ada berkas/draft yang berumur lebih dari 7 hari. 🛡️', '✅');
    }
}

window.cleanupExpiredStorageFiles = cleanupExpiredStorageFiles;
window.runManualStorageCleanup = runManualStorageCleanup;

