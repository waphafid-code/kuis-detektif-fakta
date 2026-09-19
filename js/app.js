// ============================================================
//  🌓 MODERN THEME SYSTEM (LIGHT & DARK MODE)
// ============================================================
function initTheme() {
    const savedTheme = localStorage.getItem('quizmaster_theme') || 'light';
    setTheme(savedTheme, false);
}

function setTheme(theme, withSound = true) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quizmaster_theme', theme);
    
    const themeIcon = document.getElementById('theme-icon');
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    if (themeBtn) {
        themeBtn.title = theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap';
    }
    if (withSound && typeof sfxClick === 'function') {
        sfxClick();
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next, true);
    if (typeof showToast === 'function') {
        showToast(next === 'dark' ? 'Mode Gelap Aktif 🌙' : 'Mode Terang Aktif ☀️', '🎨');
    }
}
window.toggleTheme = toggleTheme;
window.setTheme = setTheme;
window.initTheme = initTheme;

// ============================================================
//  ⏱️ HEADER LIVE QUIZ TIMER (HANYA MUNCUL SAAT UJIAN BERLANGSUNG)
// ============================================================
let appQuizStartTime = null;
let appQuizTimerInterval = null;

function startHeaderSessionTimer() {
    const timerDisplay = document.getElementById('header-session-timer');
    const timerPill = document.getElementById('header-session-pill');
    if (!timerDisplay || !timerPill) return;

    timerPill.style.display = 'inline-flex';
    appQuizStartTime = Date.now();
    if (appQuizTimerInterval) clearInterval(appQuizTimerInterval);
    appQuizTimerInterval = setInterval(() => {
        if (!appQuizStartTime) return;
        const elapsedSec = Math.floor((Date.now() - appQuizStartTime) / 1000);
        const m = Math.floor(elapsedSec / 60);
        const s = elapsedSec % 60;
        timerDisplay.textContent = `Ujian: ${m}m ${s < 10 ? '0' : ''}${s}s`;
    }, 1000);
}

function stopHeaderSessionTimer() {
    const timerPill = document.getElementById('header-session-pill');
    if (timerPill) timerPill.style.display = 'none';
    if (appQuizTimerInterval) {
        clearInterval(appQuizTimerInterval);
        appQuizTimerInterval = null;
    }
    appQuizStartTime = null;
}
window.startHeaderSessionTimer = startHeaderSessionTimer;
window.stopHeaderSessionTimer = stopHeaderSessionTimer;

// ============================================================
//  🧭 STRUCTURED HEADER NAVIGATION HELPER
// ============================================================
window.targetTeacherTabAfterPin = null;

function navToTeacherTab(tabKey) {
    if (typeof sfxClick === 'function') sfxClick();
    const teacherScreen = document.getElementById('screen-teacher');
    if (teacherScreen && teacherScreen.classList.contains('active')) {
        if (typeof switchTeacherTab === 'function') {
            switchTeacherTab(tabKey);
        }
    } else {
        window.targetTeacherTabAfterPin = tabKey;
        if (typeof openPinModal === 'function') {
            openPinModal();
        }
    }
}
window.navToTeacherTab = navToTeacherTab;

// ============================================================
//  🎬 INIT APP (MULTI-DEVICE CLOUD SYNC READY)
// ============================================================
window.addEventListener('DOMContentLoaded', () => {
    initTheme();
    stopHeaderSessionTimer(); // Pastikan timer tersembunyi di awal
    TIMER_MAX = loadTimerSetting();
    
    // Inisialisasi Klien Supabase & Real-Time Sync Multi-Perangkat
    if (typeof initSupabaseClient === 'function') initSupabaseClient();
    if (typeof initSupabaseRealtime === 'function') initSupabaseRealtime();
    
    // Cek koneksi cloud & sinkronisasikan database Supabase segera
    if (typeof checkBackendStatus === 'function') checkBackendStatus();
    if (typeof flushPendingRecords === 'function') flushPendingRecords();

    switchScreen('home');
    checkUnfinishedSession();
    initModulesCatalog();
    initAiStudio();
    initParticles();
    if (typeof cleanupExpiredStorageFiles === 'function') {
        cleanupExpiredStorageFiles();
    }
});

// 🌐 Penanganan Koneksi Multi-Perangkat: Otomatis sinkron saat internet kembali menyala
window.addEventListener('online', () => {
    console.log('🌐 [Network] Perangkat online! Menyinkronkan database...');
    if (typeof flushPendingRecords === 'function') flushPendingRecords();
    if (typeof syncWithBackend === 'function') syncWithBackend(false);
    if (typeof initSupabaseRealtime === 'function') initSupabaseRealtime();
    if (typeof showToast === 'function') {
        showToast('🌐 Koneksi internet terhubung kembali. Sinkronisasi Cloud Supabase aktif!', '✅');
    }
});

window.addEventListener('offline', () => {
    console.log('📡 [Network] Perangkat dalam mode offline.');
    if (typeof updateDbBadge === 'function') updateDbBadge(false);
    if (typeof showToast === 'function') {
        showToast('📡 Anda sedang offline. Jawaban & nilai akan disimpan lokal dan otomatis disinkronkan saat online.', 'ℹ️');
    }
});

document.addEventListener('keydown', (e) => {
    // 🛡️ Global Escape Handler: Tutup dialog aktif secara aman
    if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('.modal-overlay.active');
        activeModals.forEach(m => {
            if (m.id === 'pin-modal' && typeof closeModal === 'function') closeModal();
            else if (m.id === 'exam-guide-modal' && typeof closeExamGuide === 'function') closeExamGuide();
            else if (m.id === 'supabase-modal' && typeof closeSupabaseModal === 'function') closeSupabaseModal();
            else if (m.id === 'student-detail-modal' && typeof closeStudentDetailModal === 'function') closeStudentDetailModal();
            else if (m.id === 'delete-modal' && typeof closeDeleteModal === 'function') closeDeleteModal();
            else if (m.id === 'delete-single-modal' && typeof closeDeleteSingleModal === 'function') closeDeleteSingleModal();
            else if (m.id === 'access-locked-modal' && typeof closeAccessLockedModal === 'function') closeAccessLockedModal();
            else if (m.id === 'already-submitted-modal' && typeof closeAlreadySubmittedModal === 'function') closeAlreadySubmittedModal();
            else if (m.id === 'remedial-briefing-modal' && typeof closeRemedialBriefing === 'function') closeRemedialBriefing();
        });
        return;
    }

    if (!screens.quiz || !screens.quiz.classList.contains('active')) return;
    // Abaikan jika fokus sedang berada pada input/textarea/select
    if (e.target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable)) return;

    if (e.key === 'Enter') {
        const checkBtn = document.getElementById('btn-check');
        const nextBtn = document.getElementById('btn-next');
        if (nextBtn && nextBtn.style.display !== 'none' && !nextBtn.disabled) {
            e.preventDefault();
            nextQuestion();
        } else if (checkBtn && checkBtn.style.display !== 'none' && !checkBtn.disabled) {
            e.preventDefault();
            checkAnswer();
        }
    }
});

// 🛡️ Global Backdrop Dismiss untuk semua modal overlay
document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('modal-overlay') && e.target.classList.contains('active')) {
        const m = e.target;
        if (m.id === 'pin-modal' && typeof closeModal === 'function') closeModal();
        else if (m.id === 'exam-guide-modal' && typeof closeExamGuide === 'function') closeExamGuide();
        else if (m.id === 'supabase-modal' && typeof closeSupabaseModal === 'function') closeSupabaseModal();
        else if (m.id === 'student-detail-modal' && typeof closeStudentDetailModal === 'function') closeStudentDetailModal();
        else if (m.id === 'delete-modal' && typeof closeDeleteModal === 'function') closeDeleteModal();
        else if (m.id === 'delete-single-modal' && typeof closeDeleteSingleModal === 'function') closeDeleteSingleModal();
        else if (m.id === 'access-locked-modal' && typeof closeAccessLockedModal === 'function') closeAccessLockedModal();
        else if (m.id === 'already-submitted-modal' && typeof closeAlreadySubmittedModal === 'function') closeAlreadySubmittedModal();
        else if (m.id === 'remedial-briefing-modal' && typeof closeRemedialBriefing === 'function') closeRemedialBriefing();
    }
});