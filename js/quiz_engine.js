//  🚀 QUIZ FLOW & ANTI-CHEAT SYSTEM (LENGKAP DENGAN RESTORE SESI & INTEGRITY CHECK)
// ============================================================
const SESSION_QUIZ_ACTIVE_KEY = 'detektif_active_session_v2';
let isCheatingTriggered = false;

function computeSessionChecksum(data) {
    const payload = `${data.studentName || ''}:${data.studentClass || ''}:${data.score || 0}:${data.currentQ || 0}:${data.quizStartTime || 0}:${(data.shuffledQuizOrder || []).join(',')}:QM_SALT_INTEGRITY_2026`;
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
        hash = ((hash << 5) - hash) + payload.charCodeAt(i);
        hash |= 0;
    }
    return hash.toString(36);
}

function saveCurrentQuizSession() {
    if (!screens.quiz || !screens.quiz.classList.contains('active') || isCheatingTriggered) return;
    try {
        const sessionData = {
            studentName,
            studentClass,
            currentQ,
            score,
            streak,
            maxStreak,
            answeredCorrectly,
            detailedAnswers,
            shuffledQuizOrder,
            quizStartTime,
            TIMER_MAX
        };
        sessionData._sig = computeSessionChecksum(sessionData);
        sessionStorage.setItem(SESSION_QUIZ_ACTIVE_KEY, JSON.stringify(sessionData));
    } catch(e) {}
}

function checkUnfinishedSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_QUIZ_ACTIVE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && data.studentName && data.shuffledQuizOrder && data.shuffledQuizOrder.length > 0) {
            // Verifikasi tanda tangan integritas anti-tampering
            if (!data._sig || data._sig !== computeSessionChecksum(data)) {
                console.warn('⚠️ Sesi kuis lokal dimodifikasi secara ilegal! Sesi dibatalkan demi integritas nilai.');
                sessionStorage.removeItem(SESSION_QUIZ_ACTIVE_KEY);
                return;
            }
            document.getElementById('resume-student-name').textContent = data.studentName;
            document.getElementById('resume-student-info').textContent = `Kelas: ${data.studentClass || '-'} · Sedang di Soal #${(data.currentQ || 0) + 1} dari ${quizData.length} (Skor: ${data.score || 0})`;
            document.getElementById('resume-modal').classList.add('active');
        }
    } catch(e) {}
}

function restoreQuizSession() {
    sfxClick();
    document.getElementById('resume-modal').classList.remove('active');
    try {
        const raw = sessionStorage.getItem(SESSION_QUIZ_ACTIVE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (!data._sig || data._sig !== computeSessionChecksum(data)) {
            showToast('Sesi tidak valid atau telah dimodifikasi! Memulai ulang.', '⚠️');
            discardQuizSession();
            return;
        }
        initAudio();

        studentName = data.studentName;
        studentClass = data.studentClass;
        currentQ = data.currentQ || 0;
        score = data.score || 0;
        streak = data.streak || 0;
        maxStreak = data.maxStreak || 0;
        answeredCorrectly = data.answeredCorrectly || new Array(quizData.length).fill(null);
        detailedAnswers = data.detailedAnswers || new Array(quizData.length).fill(null);
        shuffledQuizOrder = data.shuffledQuizOrder;
        quizStartTime = data.quizStartTime || Date.now();
        TIMER_MAX = data.TIMER_MAX !== undefined ? data.TIMER_MAX : loadTimerSetting();

        document.getElementById('display-name').textContent = studentName;
        document.getElementById('display-class').textContent = studentClass;

        switchScreen('quiz');
        loadQuestion(currentQ);
        setTimeout(startBGM, 200);
        showToast('Sesi kuis berhasil dipulihkan! Lanjutkan misi!', '🚀');
    } catch(e) {
        discardQuizSession();
    }
}

function discardQuizSession() {
    sfxClick();
    sessionStorage.removeItem(SESSION_QUIZ_ACTIVE_KEY);
    document.getElementById('resume-modal').classList.remove('active');
    goHome();
}

let initialQuizWidth = 0;
let initialQuizHeight = 0;
let cheatStrikes = 0;
const MAX_CHEAT_STRIKES = 3;
let isCheatWarningActive = false;
let lastCheatEventTime = 0;

function isQuizActive() {
    return screens.quiz && screens.quiz.classList.contains('active') && !isCheatingTriggered;
}

// 🖥️ FULLSCREEN LOCKDOWN UTILITIES & CONTROLLERS
let fullscreenWarningTimer = null;
let fullscreenWarningCountdownVal = 15;

function isBrowserInFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
}
window.isBrowserInFullscreen = isBrowserInFullscreen;

function enterExamFullscreen() {
    const elem = document.documentElement;
    const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
    if (req) {
        try {
            const p = req.call(elem);
            if (p && typeof p.then === 'function') {
                p.catch(err => {
                    console.warn('Permintaan fullscreen browser dibatasi atau memerlukan interaksi:', err);
                });
            }
        } catch(e) {
            console.warn('Layar penuh error:', e);
        }
    }
}
window.enterExamFullscreen = enterExamFullscreen;

function exitExamFullscreen() {
    if (isBrowserInFullscreen()) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) {
            try {
                const p = exit.call(document);
                if (p && typeof p.then === 'function') p.catch(() => {});
            } catch(e) {}
        }
    }
}
window.exitExamFullscreen = exitExamFullscreen;

function startFullscreenWarningCountdown() {
    clearFullscreenWarningCountdown();
    fullscreenWarningCountdownVal = 15;
    const box = document.getElementById('fullscreen-countdown-box');
    const num = document.getElementById('fullscreen-countdown-num');
    if (box) box.style.display = 'block';
    if (num) num.textContent = fullscreenWarningCountdownVal;

    fullscreenWarningTimer = setInterval(() => {
        fullscreenWarningCountdownVal--;
        if (num) num.textContent = fullscreenWarningCountdownVal;
        if (fullscreenWarningCountdownVal <= 0) {
            clearFullscreenWarningCountdown();
            if (isQuizActive() && isCheatWarningActive) {
                triggerCheatPenalty('Menolak Kembali ke Mode Layar Penuh dalam Batas Waktu 15 Detik');
            }
        }
    }, 1000);
}
window.startFullscreenWarningCountdown = startFullscreenWarningCountdown;

function clearFullscreenWarningCountdown() {
    if (fullscreenWarningTimer) {
        clearInterval(fullscreenWarningTimer);
        fullscreenWarningTimer = null;
    }
    const box = document.getElementById('fullscreen-countdown-box');
    if (box) box.style.display = 'none';
}
window.clearFullscreenWarningCountdown = clearFullscreenWarningCountdown;

function handleFullscreenChange() {
    if (!isQuizActive()) return;

    const isWajib = (typeof isEnforcedFullscreen === 'function') 
        ? isEnforcedFullscreen() 
        : (localStorage.getItem('quizmaster_fullscreen_mode') !== 'opsional');
    
    if (!isWajib) return;

    const inFs = isBrowserInFullscreen();
    if (!inFs) {
        handleAntiCheatEvent('🖥️ Keluar dari Mode Layar Penuh (Fullscreen Lockdown Terlepas)');
        startFullscreenWarningCountdown();
    } else {
        clearFullscreenWarningCountdown();
    }
}

document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('mozfullscreenchange', handleFullscreenChange);
document.addEventListener('MSFullscreenChange', handleFullscreenChange);

// 🛡️ Sistem Toleransi Anti-Cheat (3-Strike Warning System)
function handleAntiCheatEvent(reason = 'Kecurangan / Aktivitas Terlarang', isCritical = false) {
    if (isCheatingTriggered || isCheatWarningActive) return;
    if (!isQuizActive()) return;

    // Debounce agar event beruntun (misal blur + visibilitychange bersamaan) tidak menghabiskan 2 strike sekaligus
    const now = Date.now();
    if (now - lastCheatEventTime < 1500) return;
    lastCheatEventTime = now;

    cheatStrikes++;

    if (cheatStrikes < MAX_CHEAT_STRIKES && !isCritical) {
        // ⏸️ TOLERANSI 1 & 2: Pause Kuis & Tampilkan Modal Peringatan Edukatif
        isCheatWarningActive = true;
        stopTimer();
        sfxTimerWarn();
        try { if (navigator.vibrate) navigator.vibrate([250, 100, 250]); } catch(e) {}

        const titleEl = document.getElementById('cheat-warning-title');
        const reasonEl = document.getElementById('cheat-warning-reason');
        const chancesEl = document.getElementById('cheat-warning-chances');
        const modal = document.getElementById('cheat-warning-modal');

        if (titleEl) {
            titleEl.textContent = cheatStrikes === 1 
                ? '⚠️ Peringatan Toleransi Anti-Cheat (#1 dari 3)' 
                : '🚨 Peringatan Keras Toleransi (#2 dari 3)';
        }
        if (reasonEl) reasonEl.textContent = `Penyebab: ${reason}`;
        if (chancesEl) {
            const rem = MAX_CHEAT_STRIKES - cheatStrikes;
            chancesEl.innerHTML = `• Sisa Kesempatan: <strong style="color: ${rem === 1 ? '#f43f5e' : '#fde047'}; font-size: 0.95rem;">${rem} kali lagi</strong> sebelum DISKUALIFIKASI otomatis dan skor 0.`;
        }
        if (modal) modal.classList.add('active');
    } else {
        // 🚨 STRIKE 3 ATAU KRITIS: Diskualifikasi Penuh
        triggerCheatPenalty(`${reason} (Mencapai Batas Maksimal 3x Pelanggaran)`);
    }
}

function resumeFromCheatWarning() {
    clearFullscreenWarningCountdown();
    sfxClick();
    const modal = document.getElementById('cheat-warning-modal');
    if (modal) modal.classList.remove('active');
    isCheatWarningActive = false;

    // Jika mode fullscreen wajib, kunci kembali browser ke fullscreen
    const isWajib = (typeof isEnforcedFullscreen === 'function') 
        ? isEnforcedFullscreen() 
        : (localStorage.getItem('quizmaster_fullscreen_mode') !== 'opsional');
    if (isWajib && !isBrowserInFullscreen()) {
        enterExamFullscreen();
    }

    if (TIMER_MAX > 0 && timerVal > 0) {
        startTimer();
    }
    showToast(`Peringatan #${cheatStrikes} diterima. Sisa ${MAX_CHEAT_STRIKES - cheatStrikes} kesempatan. Tetap berada di halaman ujian!`, '🛡️');
}

// 🚨 Anti-Cheating Handler (Immediate Disqualification setelah 3 Strike atau Pelanggaran Fatal)
function triggerCheatPenalty(reason = 'Kecurangan / Buka Tab Lain') {
    if (isCheatingTriggered) return;
    if (!screens.quiz || !screens.quiz.classList.contains('active')) return;

    isCheatingTriggered = true;
    isCheatWarningActive = false;
    const warningModal = document.getElementById('cheat-warning-modal');
    if (warningModal) warningModal.classList.remove('active');

    stopTimer();
    stopBGM();
    
    // 🔊 Alarm Keras 20 Detik & 📳 Getar Kencang HP Android 20 Detik
    sfxAlarm(20);
    startCheatVibration(20);

    // Hapus sesi aktif agar tidak bisa dipulihkan kembali
    sessionStorage.removeItem(SESSION_QUIZ_ACTIVE_KEY);

    // Update alasan pelanggaran di modal
    const reasonEl = document.getElementById('cheat-detected-reason');
    if (reasonEl) reasonEl.textContent = `Penyebab: ${reason}`;

    // Simpan rekap diskualifikasi ke database / localstorage
    const now = new Date();
    const clockStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} WIB`;
    const cheatRecord = {
        name: studentName,
        class: studentClass,
        score: 0,
        correct: 0,
        total: quizData.length,
        wrongQuestions: quizData.map((_, i) => i),
        detailedAnswers: [],
        statusNote: `🚨 DISKUALIFIKASI (${reason}) - Keluar Tab ${Math.max(3, cheatStrikes || 3)}x`,
        cheatReason: reason,
        tabSwitchCount: Math.max(3, cheatStrikes || 3),
        isCheated: true,
        time: clockStr,
        duration: 'Diskualifikasi',
        date: now.toLocaleDateString('id-ID'),
        timestamp: now.getTime()
    };
    saveRecord(cheatRecord);

    document.getElementById('cheat-modal').classList.add('active');
}

function acknowledgeCheatPenalty() {
    clearFullscreenWarningCountdown();
    exitExamFullscreen();
    document.getElementById('cheat-modal').classList.remove('active');
    isCheatingTriggered = false;
    cheatStrikes = 0;
    isCheatWarningActive = false;
    if (alarmSirenTimer) { clearInterval(alarmSirenTimer); alarmSirenTimer = null; }
    if (cheatVibrationTimer) { clearInterval(cheatVibrationTimer); cheatVibrationTimer = null; }
    try { navigator.vibrate(0); } catch(e) {}
    goHome();
}

// 👁️ 1. DETEKSI PERPINDAHAN TAB / KELUAR DARI BROWSER (ANTI-CHEAT)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isQuizActive() && !isCheatWarningActive) {
        handleAntiCheatEvent('🌐 Berpindah Tab / Meminimalkan Browser');
    }
});

window.addEventListener('blur', () => {
    if (isQuizActive() && !isCheatWarningActive) {
        setTimeout(() => {
            if ((document.hidden || !document.hasFocus()) && isQuizActive() && !isCheatWarningActive) {
                handleAntiCheatEvent('🌐 Keluar dari Aplikasi Browser / Buka Aplikasi Lain');
            }
        }, 400);
    }
});

// 📸 2. DETEKSI SCREENSHOT / TANGKAPAN LAYAR / SNIPPING TOOL
window.addEventListener('keyup', (e) => {
    if (!isQuizActive()) return;
    if (e.key === 'PrintScreen' || e.keyCode === 44) {
        handleAntiCheatEvent('📸 Screenshot / PrintScreen Terdeteksi');
    }
});

// 🔒 3. SECURITY HARDENING: DEVTOOLS, SHORTCUTS, SNIPPING TOOL, PRINT & VIEW SOURCE BLOCKER
window.addEventListener('keydown', (e) => {
    if (!isQuizActive()) return;

    // F12 (Developer Tools)
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        handleAntiCheatEvent('🛠️ Percobaan Membuka DevTools (F12)');
        return;
    }

    // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (Inspect / Console)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        handleAntiCheatEvent('🛠️ Percobaan Inspect Element / DevTools');
        return;
    }

    // Ctrl+U (View Source), Ctrl+S (Save Page), Ctrl+P (Print Page)
    if ((e.ctrlKey || e.metaKey) && ['u', 'U', 's', 'S', 'p', 'P'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        handleAntiCheatEvent(`🔒 Percobaan Shortcut Terlarang (Ctrl+${e.key.toUpperCase()})`);
        return;
    }

    // Ctrl+A / Cmd+A (Select All Blocker)
    if ((e.ctrlKey || e.metaKey) && ['a', 'A'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        showToast('⚠️ Tindakan dilarang: Memilih seluruh teks dinonaktifkan demi integritas asesmen!', '🔒');
        return;
    }

    // Ctrl+C / Ctrl+X / Ctrl+V
    if ((e.ctrlKey || e.metaKey) && ['c', 'C', 'x', 'X', 'v', 'V'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        handleAntiCheatEvent('📋 Percobaan Clipboard / Copy-Paste Shortcut');
        return;
    }

    // Windows Snipping tool (Win+Shift+S), Mac Screenshot (Cmd+Shift+3/4)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['S', 's', '3', '4'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        handleAntiCheatEvent('📸 Screenshot / Snipping Tool Terdeteksi');
        return;
    }
});

// 📋 4. DETEKSI & PENCEGAHAN COPY - PASTE - CUT - KLIK KANAN - DRAG
document.addEventListener('copy', (e) => {
    if (isQuizActive()) {
        e.preventDefault();
        showToast('⚠️ Tindakan dilarang: Menyalin teks soal dinonaktifkan demi integritas asesmen.', '🔒');
        handleAntiCheatEvent('📋 Percobaan Copy / Salin Teks Soal');
    }
});

document.addEventListener('paste', (e) => {
    if (isQuizActive()) {
        e.preventDefault();
        showToast('⚠️ Tindakan dilarang: Menempelkan teks dinonaktifkan demi integritas asesmen.', '🔒');
        handleAntiCheatEvent('📋 Percobaan Paste / Tempel Teks');
    }
});

document.addEventListener('cut', (e) => {
    if (isQuizActive()) {
        e.preventDefault();
        showToast('⚠️ Tindakan dilarang: Memotong teks dinonaktifkan demi integritas asesmen.', '🔒');
        handleAntiCheatEvent('📋 Percobaan Cut / Potong Teks');
    }
});

document.addEventListener('contextmenu', (e) => {
    if (isQuizActive()) {
        e.preventDefault();
        showToast('⚠️ Tindakan dilarang: Menu klik kanan dinonaktifkan.', '🔒');
        handleAntiCheatEvent('🖱️ Percobaan Klik Kanan / Context Menu');
    }
});

document.addEventListener('dragstart', (e) => {
    if (isQuizActive()) {
        e.preventDefault();
        return false;
    }
});

// 🛡️ Bersihkan seleksi teks otomatis saat kuis aktif (Anti-Highlight)
document.addEventListener('selectionchange', () => {
    if (isQuizActive()) {
        const sel = window.getSelection();
        if (sel && sel.toString().trim().length > 0) {
            sel.removeAllRanges();
        }
    }
});

// 📱 5. DETEKSI SPLIT SCREEN / LAYAR TERBELAH / RESIZE DRASTIS DI HP & DESKTOP
window.addEventListener('resize', () => {
    if (!isQuizActive()) return;
    if (initialQuizHeight > 0 && initialQuizWidth > 0) {
        // Jika tinggi layar berkurang drastis (indikasi split screen / floating app)
        if (window.innerHeight < initialQuizHeight * 0.60 || window.innerWidth < initialQuizWidth * 0.60) {
            handleAntiCheatEvent('📱 Split Screen / Layar Terbelah Terdeteksi');
        }
    }
});

// 🚫 6. PENCEGAHAN LINK / MAILTO (AGAR SISWA TIDAK TERLEMPAR KE APLIKASI EMAIL)
document.addEventListener('click', (e) => {
    if (isQuizActive()) {
        const link = e.target.closest('a');
        if (link) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }
}, true);

// 🛡️ 2 TAHAP VERIFIKASI SAAT REFRESH / MENINGGALKAN HALAMAN
window.addEventListener('beforeunload', (e) => {
    if (screens.quiz && screens.quiz.classList.contains('active') && !isCheatingTriggered) {
        saveCurrentQuizSession();
        const confirmationMessage = 'PERINGATAN: Kuis sedang berlangsung! Jawaban Anda akan disimpan di sesi ini, namun pastikan tidak meninggalkan kuis tanpa izin guru.';
        e.preventDefault();
        e.returnValue = confirmationMessage;
        return confirmationMessage;
    }
});

function onHomeClassChanged() {
    const classSelect = document.getElementById('input-class');
    const nameSelect = document.getElementById('input-name');
    if (!classSelect || !nameSelect) return;

    const selectedClass = classSelect.value;
    const students = typeof getStudentsByClass === 'function' 
        ? getStudentsByClass(selectedClass) 
        : (typeof STUDENT_ROSTER !== 'undefined' ? STUDENT_ROSTER[selectedClass] || [] : []);

    nameSelect.innerHTML = '';
    if (!students || students.length === 0) {
        nameSelect.disabled = true;
        nameSelect.innerHTML = '<option value="" disabled selected>— Tidak ada data siswa untuk kelas ini —</option>';
        return;
    }

    nameSelect.disabled = false;
    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    defaultOpt.textContent = `— Pilih Nama Anda (${students.length} Siswa Terdaftar) —`;
    nameSelect.appendChild(defaultOpt);

    students.forEach((sName, idx) => {
        const opt = document.createElement('option');
        opt.value = sName;
        opt.textContent = `${idx + 1}. ${sName}`;
        nameSelect.appendChild(opt);
    });

    sfxClick();
}

function updateHomeStudentDisplay() {
    const sel = document.getElementById('input-name');
    const disp = document.getElementById('home-student-name-display');
    const cls = document.getElementById('input-class');
    const sub = document.getElementById('home-student-sub-display');
    if (sel && disp && sel.value) {
        disp.textContent = sel.value;
    }
    if (sub && cls && cls.value) {
        sub.innerHTML = `<span>⭐ Kelas: <strong>${cls.value}</strong></span> • <span>👑 SMAN 4 Padang</span>`;
    }

    // Modern Header Profile Pill Synchronization
    const profName = document.getElementById('header-profile-name');
    const profRole = document.getElementById('header-profile-role');
    const profAvatar = document.getElementById('header-avatar-text');
    if (profName && sel && sel.value) profName.textContent = sel.value;
    if (profRole && cls && cls.value) profRole.textContent = `Kelas ${cls.value}`;
    if (profAvatar && sel && sel.value) {
        const parts = sel.value.trim().split(/\s+/);
        const initials = parts.length > 1 ? (parts[0][0] + parts[1][0]) : parts[0].substring(0, 2);
        profAvatar.textContent = initials.toUpperCase();
    }
}
window.updateHomeStudentDisplay = updateHomeStudentDisplay;

async function initiateQuiz() {
    const clsSelect = document.getElementById('input-class');
    const nameSelect = document.getElementById('input-name');
    const cls = clsSelect ? clsSelect.value : '';
    const name = nameSelect ? nameSelect.value.trim() : '';
    const moduleSelect = document.getElementById('input-module');
    const moduleId = moduleSelect ? moduleSelect.value : (window.QuizManager ? QuizManager.getActiveModuleId() : 'modul_detektif_fakta');

    if (!cls) {
        sfxWrong();
        if (clsSelect) {
            clsSelect.style.borderColor = 'var(--danger)';
            clsSelect.style.animation = 'shake 0.4s';
            setTimeout(() => { clsSelect.style.borderColor = ''; clsSelect.style.animation = ''; }, 1500);
        }
        showToast('Silakan pilih kelas Anda terlebih dahulu!', '⚠️');
        return;
    }

    if (!name) {
        sfxWrong();
        if (nameSelect) {
            nameSelect.style.borderColor = 'var(--danger)';
            nameSelect.style.animation = 'shake 0.4s';
            setTimeout(() => { nameSelect.style.borderColor = ''; nameSelect.style.animation = ''; }, 1500);
        }
        showToast('Silakan pilih nama Anda dari daftar siswa!', '⚠️');
        return;
    }

    // 🛡️ Whitelist Validation: Pastikan nama siswa ada dalam daftar resmi kelas
    if (window.STUDENT_ROSTER && window.STUDENT_ROSTER[cls]) {
        const officialNames = window.STUDENT_ROSTER[cls].map(n => n.trim().toLowerCase());
        if (!officialNames.includes(name.trim().toLowerCase())) {
            sfxWrong();
            showToast('Nama siswa tidak terdaftar dalam absensi resmi kelas terpilih!', '⚠️');
            return;
        }
    }

    isQuizFinishing = false;

    // 🔒 Verifikasi Akses Jadwal RINI SYAFITRI & Pengaturan Guru
    const access = checkClassAccess(cls);
    if (!access.allowed) {
        sfxWrong();
        const schedule = access.schedule || (typeof getClassSchedule === 'function' ? getClassSchedule(cls) : (SCHEDULE_RINI_SYAFITRI[cls] || {}));
        document.getElementById('locked-class-name').textContent = `Kelas ${cls}`;
        document.getElementById('locked-class-schedule').innerHTML = `
            📅 <strong>Jadwal Resmi Mata Pelajaran (Rini Syafitri):</strong> ${schedule.dayName || '-'}, Pukul <strong>${schedule.start || '-'} - ${schedule.end || '-'} WIB</strong> (${schedule.period || '-'})
        `;
        document.getElementById('locked-current-time').textContent = `Waktu Saat Ini: ${access.currentInfo || new Date().toLocaleString('id-ID')}`;
        document.getElementById('access-locked-modal').classList.add('active');
        return;
    }

    // 🔄 Verifikasi Batas Respon Siswa (Submission Policy)
    const policy = (typeof loadSubmissionPolicy === 'function') 
        ? loadSubmissionPolicy() 
        : (localStorage.getItem('quizmaster_submission_policy') || 'allow_remedy');
    
    const previousAttempts = loadRecords().filter(r => 
        (r.name || '').trim().toLowerCase() === name.trim().toLowerCase() && 
        r.class === cls
    );

    if (policy === 'single_only' && previousAttempts.length > 0) {
        sfxWrong();
        const prev = previousAttempts[0];
        const dupModal = document.getElementById('already-submitted-modal');
        if (dupModal) {
            const elName = document.getElementById('dup-student-name');
            const elClass = document.getElementById('dup-student-class');
            const elScore = document.getElementById('dup-student-score');
            const elMeta = document.getElementById('dup-student-meta');
            if (elName) elName.textContent = name;
            if (elClass) elClass.textContent = `Kelas: ${cls}`;
            if (elScore) elScore.textContent = `Nilai: ${prev.score} / 100`;
            if (elMeta) elMeta.textContent = `Waktu Submit: ${prev.time || '-'}, ${prev.date || ''} · Durasi: ${prev.duration || '-'}`;
            dupModal.classList.add('active');
        } else {
            showToast(`Siswa ${name} sudah pernah mengirimkan jawaban kuis!`, '⚠️');
        }
        return;
    }

    if (policy === 'allow_remedy' && previousAttempts.length > 0) {
        const best = Math.max(...previousAttempts.map(r => r.score));
        showToast(`Sesi Remedi: Nilai tertinggi Anda (${best}/100) akan dipertahankan! ⭐`, 'ℹ️');
    }

    // 📦 Muat Soal Sesuai Modul Pembelajaran Terpilih
    if (window.QuizManager) {
        QuizManager.setActiveModuleId(moduleId);
        const allMods = await QuizManager.getAllModules();
        currentActiveModule = allMods.find(m => m.id === moduleId) || QuizManager.DEFAULT_MODULE;
        const loadedQuestions = await QuizManager.loadQuestionsForModule(moduleId);
        if (loadedQuestions && loadedQuestions.length > 0) {
            quizData = loadedQuestions;
        }
    }

    initAudio();
    studentName = name;
    studentClass = cls;
    currentQ = 0;
    score = 0;
    earnedPointsTotal = 0;

    // Reset dan simpan bank soal master untuk kebutuhan sesi remedial adaptif
    isRemedialSession = false;
    window.isRemedialSession = false;
    remedialSourceRecord = null;
    window.remedialSourceRecord = null;
    remedialOriginalQuestions = [...quizData];
    window.remedialOriginalQuestions = remedialOriginalQuestions;
    const remInd = document.getElementById('quiz-remedial-indicator');
    if (remInd) remInd.style.display = 'none';

    totalPossiblePoints = quizData.reduce((acc, q) => acc + (q.points || 5), 0);
    if (totalPossiblePoints === 0) totalPossiblePoints = quizData.length * 5;
    streak = 0;
    maxStreak = 0;
    isCheatingTriggered = false;
    cheatStrikes = 0;
    isCheatWarningActive = false;

    const indices = Array.from({ length: quizData.length }, (_, i) => i);
    shuffledQuizOrder = shuffleArray(indices).map(item => item.val);

    answeredCorrectly = new Array(quizData.length).fill(null);
    detailedAnswers = new Array(quizData.length).fill(null);
    TIMER_MAX = loadTimerSetting();

    // 🖥️ Kunci Layar Penuh Otomatis jika Mode Wajib Aktif
    const isWajib = (typeof isEnforcedFullscreen === 'function') 
        ? isEnforcedFullscreen() 
        : (localStorage.getItem('quizmaster_fullscreen_mode') !== 'opsional');
    if (isWajib) {
        enterExamFullscreen();
    }

    runCountdown();
}

function runCountdown() {
    const overlay = document.getElementById('countdown-screen');
    const numEl = document.getElementById('countdown-num');
    const labelEl = document.getElementById('countdown-label');
    overlay.classList.add('active');

    let count = 3;
    numEl.textContent = count;
    numEl.style.color = '';
    numEl.style.textShadow = '';
    labelEl.textContent = 'Bersiaplah... Ujian Segera Dimulai';
    sfxCountdown();

    const cdInterval = setInterval(() => {
        count--;
        if (count > 0) {
            numEl.style.animation = 'none'; void numEl.offsetWidth;
            numEl.style.animation = 'countdownPulse 0.8s ease-out';
            numEl.textContent = count;
            sfxCountdown();
        } else if (count === 0) {
            numEl.style.animation = 'none'; void numEl.offsetWidth;
            numEl.style.animation = 'countdownPulse 0.8s ease-out';
            numEl.textContent = 'MULAI!';
            numEl.style.color = 'var(--primary)';
            numEl.style.textShadow = '0 0 60px var(--primary-glow), 0 0 100px rgba(70,72,212,0.4)';
            labelEl.textContent = 'Selamat Mengerjakan Ujian! 🚀';
            sfxGo();
        } else {
            clearInterval(cdInterval);
            overlay.classList.remove('active');
            startQuizActual();
        }
    }, 800);
}

function startQuizActual() {
    isCheatingTriggered = false;
    sessionHintsUsedCount = 0;
    initialQuizWidth = window.innerWidth;
    initialQuizHeight = window.innerHeight;
    document.getElementById('display-name').textContent = studentName;
    document.getElementById('display-class').textContent = studentClass;
    quizStartTime = Date.now();
    switchScreen('quiz');
    loadQuestion(0);
    saveCurrentQuizSession();
    setTimeout(startBGM, 200);
}

function startTimer() {
    stopTimer();
    if (TIMER_MAX === 0) {
        document.getElementById('timer-display').textContent = '⏱ ∞';
        document.getElementById('timer-display').classList.remove('warning');
        return;
    }
    timerVal = TIMER_MAX;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        timerVal = Math.max(0, timerVal - 1);
        updateTimerDisplay();
        if (timerVal <= 5 && timerVal > 0) sfxTimerWarn();
        if (timerVal <= 0) { stopTimer(); autoSubmitTimeout(); }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function updateTimerDisplay() {
    const el = document.getElementById('timer-display');
    el.textContent = `⏱ ${timerVal}`;
    el.classList.toggle('warning', timerVal <= 5);
}

function autoSubmitTimeout() {
    const origQIdx = shuffledQuizOrder[currentQ];
    const data = quizData[origQIdx];
    const checkedInputs = document.querySelectorAll('input[name="q-opt"]:checked, input[type="radio"][name^="matrix_row_"]:checked');

    // 🔒 AUTO-LOCK: Jika siswa sudah memilih suatu pilihan saat waktu habis,
    // kunci dan nilai otomatis jawaban pilihan siswa tanpa membatalkan/merugikan siswa!
    if (checkedInputs.length > 0) {
        checkAnswer(true);
        return;
    }

    // Jika siswa belum memilih sama sekali saat waktu habis:
    sfxWrong();
    const allInputs = document.querySelectorAll('input[name="q-opt"], input[type="radio"][name^="matrix_row_"]');
    const labels = document.querySelectorAll('.opt-label, .matrix-btn-label');

    allInputs.forEach(inp => inp.disabled = true);
    labels.forEach(lbl => lbl.classList.add('disabled'));

    if (data.type === 'matrix_tf') {
        const table = document.getElementById('matrix-active-table');
        if (table) table.classList.add('disabled-row');
    } else {
        const correctOriginals = Array.isArray(data.answer) ? data.answer : [data.answer];
        currentShuffleMap.forEach((origIdx, shuffIdx) => {
            if (correctOriginals.includes(origIdx)) {
                const l = document.getElementById(`label-${shuffIdx}`);
                if (l) l.classList.add('correct');
            }
        });
    }

    streak = 0;
    answeredCorrectly[origQIdx] = false;

    detailedAnswers[origQIdx] = {
        qIndex: origQIdx,
        questionNumber: currentQ + 1,
        questionText: data.q,
        caseStudy: data.caseStudy || null,
        difficulty: data.difficulty || 'Medium',
        type: data.type,
        options: data.options || data.statements,
        selectedIndices: [],
        selectedText: ['(Waktu Habis — Belum Memilih Jawaban)'],
        correctIndices: Array.isArray(data.answer) ? data.answer : [data.answer],
        correctText: Array.isArray(data.answer) ? data.answer.map(i => (data.options && data.options[i]) || i) : [(data.options && data.options[data.answer]) || data.answer],
        isCorrect: false,
        pointsEarned: 0,
        maxPoints: data.points || 5,
        isPartial: false,
        pointSummary: 'Waktu Habis (0 Poin)',
        explanation: data.explanation
    };

    document.getElementById('streak-display').textContent = `🔥 ${streak}`;
    document.getElementById('streak-display').classList.remove('on-fire');

    const card = document.querySelector('#screen-quiz .glass-card');
    if (card) card.classList.remove('streak-on-fire');

    const fb = document.getElementById('feedback-box');
    fb.className = 'feedback-box wrong-fb';
    fb.innerHTML = `<h4>⏰ Waktu Habis (Belum Ada Jawaban Terpilih)!</h4><p>${data.explanation}</p>`;
    fb.style.display = 'block';

    document.getElementById('btn-check').style.display = 'none';
    document.getElementById('btn-next').style.display = 'inline-flex';

    const app = document.getElementById('main-app');
    app.classList.remove('shake-it'); void app.offsetWidth; app.classList.add('shake-it');
    document.body.classList.remove('flash-wrong'); void document.body.offsetWidth; document.body.classList.add('flash-wrong');
    spawnRandomEmojis('⏰', 3);
}

function updateCheckboxCounter(reqCount) {
    const checkedCount = document.querySelectorAll('input[name="q-opt"]:checked').length;
    const numEl = document.getElementById('cb-num');
    const box = document.getElementById('cb-counter-box');
    if (numEl) numEl.textContent = checkedCount;
    if (box) {
        box.classList.toggle('complete', checkedCount === reqCount);
        box.classList.toggle('warning', checkedCount > reqCount);
    }
}

// ═══════════════════════════════════════════════════════════════
// 💡 COGNITIVE HINT & SCAFFOLDING HANDLERS
// ═══════════════════════════════════════════════════════════════
let currentQuestionHintOpened = false;
let sessionHintsUsedCount = 0;

function toggleQuestionHint() {
    const hintBox = document.getElementById('hint-box');
    const hintBtn = document.getElementById('btn-hint');
    const hintTextEl = document.getElementById('hint-box-text');
    if (!hintBox || !hintTextEl) return;

    const isVisible = hintBox.style.display === 'block';
    if (isVisible) {
        hintBox.style.display = 'none';
        if (hintBtn) hintBtn.classList.remove('active');
        if (typeof sfxClick === 'function') sfxClick();
    } else {
        const origQIdx = shuffledQuizOrder[currentQ];
        const data = quizData[origQIdx];
        
        let clue = data ? data.hint : null;
        if (!clue) {
            if (data && data.type === 'tf') {
                clue = "Uji apakah pernyataan tersebut mutlak berlaku dalam segala kondisi, atau hanya asumsi subjektif.";
            } else if (data && data.type === 'matrix_tf') {
                clue = "Perhatikan setiap baris secara mandiri. Bedakan mana langkah verifikasi ilmiah dan mana tindakan reaktif.";
            } else if (data && data.type === 'checkbox') {
                clue = "Ada lebih dari satu jawaban benar. Eliminasi opsi yang bernada provokatif atau tanpa dasar data.";
            } else {
                clue = "Baca opsi secara saksama. Eliminasi opsi yang menggunakan generalisasi berlebihan ('semua', 'selalu', 'pasti').";
            }
        }

        hintTextEl.innerHTML = clue;
        hintBox.style.display = 'block';
        if (hintBtn) hintBtn.classList.add('active');
        if (!currentQuestionHintOpened) {
            currentQuestionHintOpened = true;
            sessionHintsUsedCount++;
        }
        if (typeof sfxClick === 'function') sfxClick();
    }
}
window.toggleQuestionHint = toggleQuestionHint;

// ═══════════════════════════════════════════════════════════════
// 🎯 TRI-PILLAR PEDAGOGICAL FEEDBACK FORMATTER
// ═══════════════════════════════════════════════════════════════
function formatPedagogicalFeedback(explanation) {
    if (!explanation) return '<p>Penjelasan untuk butir soal ini belum tersedia.</p>';

    let concept = '';
    let distractor = '';
    let insight = '';

    if (explanation.includes('🎯') || explanation.includes('🔍') || explanation.includes('💡') || explanation.includes('|')) {
        const parts = explanation.split(/\s*\|\s*|\n+/);
        parts.forEach(p => {
            const trimmed = p.trim();
            if (trimmed.includes('🎯') || /konsep\s*inti/i.test(trimmed)) {
                concept = trimmed.replace(/^🎯\s*(konsep\s*inti\s*:\s*)?/i, '').trim();
            } else if (trimmed.includes('🔍') || /bedah\s*pengecoh|miskonsepsi/i.test(trimmed)) {
                distractor = trimmed.replace(/^🔍\s*(bedah\s*pengecoh\s*(dan\s*miskonsepsi)?\s*:\s*)?/i, '').trim();
            } else if (trimmed.includes('💡') || /mutiara\s*pedagogis|kesimpulan/i.test(trimmed)) {
                insight = trimmed.replace(/^💡\s*(mutiara\s*pedagogis\s*:\s*)?/i, '').trim();
            } else if (!concept) {
                concept = trimmed;
            } else if (!distractor) {
                distractor = trimmed;
            } else {
                insight = trimmed;
            }
        });
    } else {
        const sentences = explanation.split(/(?<=[.!?])\s+/);
        if (sentences.length >= 2) {
            concept = sentences[0];
            distractor = sentences.slice(1, -1).join(' ') || sentences[1];
            insight = sentences.length > 2 ? sentences[sentences.length - 1] : 'Selalu terapkan prinsip kritis verifikasi fakta sebelum mempercayai atau membagikan suatu klaim.';
        } else {
            concept = explanation;
            insight = 'Kembangkan kebiasaan memeriksa keabsahan sumber informasi demi menjaga kejernihan berpikir di era digital.';
        }
    }

    let html = '<div class="tri-pillar-feedback">';
    if (concept) {
        html += `
            <div class="pillar-card pillar-concept">
                <div class="pillar-card-title">🎯 Konsep Inti &amp; Landasan Fakta</div>
                <p class="pillar-card-desc">${concept}</p>
            </div>
        `;
    }
    if (distractor) {
        html += `
            <div class="pillar-card pillar-distractor">
                <div class="pillar-card-title">🔍 Bedah Pengecoh &amp; Miskonsepsi Umum</div>
                <p class="pillar-card-desc">${distractor}</p>
            </div>
        `;
    }
    if (insight) {
        html += `
            <div class="pillar-card pillar-insight">
                <div class="pillar-card-title">💡 Mutiara Pedagogis / Refleksi Nalar</div>
                <p class="pillar-card-desc">${insight}</p>
            </div>
        `;
    }
    html += '</div>';
    return html;
}
window.formatPedagogicalFeedback = formatPedagogicalFeedback;

// ═══════════════════════════════════════════════════════════════
// 🪞 STUDENT METACOGNITIVE REFLECTION HANDLERS
// ═══════════════════════════════════════════════════════════════
let selectedReflectionConfidence = 'Tinggi';

function selectReflectionChip(el) {
    if (!el) return;
    const group = document.getElementById('reflection-chips-group');
    if (group) {
        group.querySelectorAll('.reflection-chip').forEach(c => c.classList.remove('active'));
    }
    el.classList.add('active');
    selectedReflectionConfidence = el.getAttribute('data-val') || 'Tinggi';
    if (typeof sfxClick === 'function') sfxClick();
}
window.selectReflectionChip = selectReflectionChip;

async function submitStudentReflection() {
    const noteEl = document.getElementById('reflection-student-note');
    const note = noteEl ? noteEl.value.trim() : '';
    const btn = document.getElementById('btn-submit-reflection');
    const msg = document.getElementById('reflection-saved-msg');

    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Menyimpan...';
    }

    const reflectionPayload = {
        confidenceLevel: selectedReflectionConfidence,
        studentNote: note || 'Tidak ada catatan tambahan.',
        submittedAt: new Date().toISOString()
    };

    const records = loadRecords();
    if (records.length > 0) {
        records[0].studentReflection = reflectionPayload;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }

    try {
        const cfg = getSupabaseConfig();
        if (cfg && cfg.url && cfg.key) {
            const targetUrl = `${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}?student_name=eq.${encodeURIComponent(studentName)}&order=id.desc&limit=1`;
            await fetch(targetUrl, {
                method: 'PATCH',
                headers: {
                    'apikey': cfg.key,
                    'Authorization': 'Bearer ' + cfg.key,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    wrong_questions: {
                        items: (records[0] ? records[0].wrongQuestions : []),
                        reflection: reflectionPayload
                    }
                })
            });
        }
    } catch(e) {
        console.warn('Gagal sync refleksi ke cloud:', e);
    }

    if (typeof sfxCorrect === 'function') sfxCorrect();
    if (btn) {
        btn.textContent = 'Terkirim ✅';
        btn.style.background = 'var(--success)';
        btn.style.borderColor = 'var(--success)';
    }
    if (msg) {
        msg.style.display = 'inline';
    }
    showToast('Refleksi diri Anda berhasil disimpan dan diteruskan ke Guru! 🌟', '🪞');
}
window.submitStudentReflection = submitStudentReflection;

function loadQuestion(index) {
    const origQIdx = shuffledQuizOrder[index];
    const data = quizData[origQIdx];

    // Reset status petunjuk berpikir
    currentQuestionHintOpened = false;
    const hintBox = document.getElementById('hint-box');
    const hintBtn = document.getElementById('btn-hint');
    if (hintBox) hintBox.style.display = 'none';
    if (hintBtn) {
        hintBtn.classList.remove('active');
        hintBtn.style.display = 'inline-flex';
    }

    const app = document.getElementById('main-app');
    app.classList.remove('shake-it');

    const qContent = document.getElementById('q-content');
    qContent.classList.remove('slide-out', 'slide-in');
    void qContent.offsetWidth;
    qContent.classList.add('slide-in');

    const fb = document.getElementById('feedback-box');
    fb.style.display = 'none';
    fb.className = 'feedback-box';

    document.getElementById('btn-next').style.display = 'none';
    document.getElementById('btn-check').style.display = 'inline-flex';
    document.getElementById('btn-check').disabled = false;

    const pct = Math.round((index / quizData.length) * 100);
    document.getElementById('progress-fill').style.width = `${pct}%`;
    document.getElementById('progress-label').textContent = `Soal ${index + 1} dari ${quizData.length}`;
    document.getElementById('progress-pct').textContent = `${pct}%`;
    document.getElementById('score-display').textContent = `⭐ ${score}`;
    document.getElementById('streak-display').textContent = `🔥 ${streak}`;
    document.getElementById('streak-display').classList.toggle('on-fire', streak >= 3);

    const card = document.querySelector('#screen-quiz .glass-card');
    if (card) card.classList.toggle('streak-on-fire', streak >= 3);

    const badge = document.getElementById('q-badge');
    const diffBadge = document.getElementById('q-diff-badge');
    const ptsBadge = document.getElementById('q-points-badge');
    const tierHint = document.getElementById('q-tier-hint');
    const cbBox = document.getElementById('cb-counter-box');
    let inputType = 'radio';
    const reqCount = Array.isArray(data.answer) ? data.answer.length : 1;
    const qPts = data.points || 5;

    if (ptsBadge) {
        ptsBadge.style.display = 'inline-flex';
        ptsBadge.innerHTML = `⭐ Bobot: ${qPts} Poin`;
    }

    if (tierHint) {
        if (data.type === 'checkbox') {
            tierHint.style.display = 'block';
            if (data.scoringRule && data.scoringRule.type === 'tiered') {
                tierHint.innerHTML = `⚖️ <strong>Penilaian Majemuk Berjenjang:</strong> Pilih semua opsi yang menurut Anda valid (Poin dihitung bertingkat berdasarkan ketepatan pilihan).`;
            } else {
                tierHint.innerHTML = `☑️ <strong>Pilihan Ganda Kompleks:</strong> Pilih semua opsi jawaban yang menurut Anda valid.`;
            }
        } else if (data.type === 'matrix_tf') {
            tierHint.style.display = 'block';
            tierHint.innerHTML = `⚖️ <strong>Tabel Matriks Pernyataan:</strong> Tentukan <strong>[Benar]</strong> atau <strong>[Salah]</strong> untuk SETIAP baris pernyataan di bawah. Sistem menjamin tidak bisa memilih 2 jawaban pada baris yang sama.`;
        } else {
            tierHint.style.display = 'none';
        }
    }

    if (data.type === 'mcq') {
        badge.className = 'q-badge mcq';
        badge.textContent = '🔘 Pilihan Ganda (Pilih 1 Jawaban)';
        cbBox.style.display = 'none';
    } else if (data.type === 'tf') {
        badge.className = 'q-badge tf';
        badge.textContent = '⚖️ Benar / Salah (Tunggal)';
        cbBox.style.display = 'none';
    } else if (data.type === 'matrix_tf') {
        badge.className = 'q-badge tf';
        badge.textContent = '⚖️ Matriks Pernyataan (Benar / Salah)';
        cbBox.style.display = 'none';
    } else {
        badge.className = 'q-badge checkbox';
        badge.textContent = `☑️ Pilihan Majemuk (${reqCount} Kunci Benar)`;
        inputType = 'checkbox';
        cbBox.style.display = 'inline-flex';
        cbBox.className = 'cb-counter-box';
        cbBox.innerHTML = `<span>☑️ Terpilih: <strong id="cb-num">0</strong> jawaban (Bisa lebih dari 1)</span>`;
    }

    if (diffBadge) {
        const diff = data.difficulty || 'Medium';
        if (diff === 'Easy') {
            diffBadge.className = 'q-badge diff-easy';
            diffBadge.innerHTML = '🟢 Tingkat: Mudah';
        } else if (diff === 'Hard') {
            diffBadge.className = 'q-badge diff-hard';
            diffBadge.innerHTML = '🔴 Tingkat: Sulit';
        } else {
            diffBadge.className = 'q-badge diff-medium';
            diffBadge.innerHTML = '🟡 Tingkat: Sedang';
        }
    }

    const csBox = document.getElementById('case-study-box');
    if (data.caseStudy) {
        csBox.style.display = 'block';
        csBox.innerHTML = `<strong>📁 Bukti Kasus / Stimulus:</strong> ${typeof escapeHtml === 'function' ? escapeHtml(data.caseStudy) : data.caseStudy}`;
    } else { csBox.style.display = 'none'; }

    document.getElementById('q-text').innerHTML = `<span class="q-num">Soal ${index + 1}.</span> ${typeof escapeHtml === 'function' ? escapeHtml(data.q) : data.q}`;

    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';

    // ═══ RENDER MATRIX TABLE (AKM STANDARD — MUTUAL EXCLUSIVE PER ROW) ═══
    if (data.type === 'matrix_tf') {
        const statements = data.statements || data.options || [];
        const container = document.createElement('div');
        container.className = 'matrix-container';

        let tableHtml = `
            <table class="matrix-table" id="matrix-active-table">
                <thead>
                    <tr>
                        <th style="text-align: left;">Pernyataan Kasus</th>
                        <th class="matrix-opt-col">Benar</th>
                        <th class="matrix-opt-col">Salah</th>
                    </tr>
                </thead>
                <tbody>
        `;

        statements.forEach((stmt, rowIdx) => {
            const rowName = `matrix_row_${index}_${rowIdx}`;
            tableHtml += `
                <tr data-stmt-idx="${rowIdx}">
                    <td class="matrix-stmt-col">
                        <strong style="color: var(--accent); font-family: var(--font-mono); margin-right: 6px;">[#${rowIdx+1}]</strong>
                        ${typeof escapeHtml === 'function' ? escapeHtml(stmt) : stmt}
                    </td>
                    <td class="matrix-opt-col">
                        <label class="matrix-btn-label true-btn" id="matrix-lbl-${rowIdx}-0">
                            <input type="radio" name="${rowName}" value="0" onchange="window.handleMatrixRadioSelect(${rowIdx}, 0)">
                            <span>✓ Benar</span>
                        </label>
                    </td>
                    <td class="matrix-opt-col">
                        <label class="matrix-btn-label false-btn" id="matrix-lbl-${rowIdx}-1">
                            <input type="radio" name="${rowName}" value="1" onchange="window.handleMatrixRadioSelect(${rowIdx}, 1)">
                            <span>✕ Salah</span>
                        </label>
                    </td>
                </tr>
            `;
        });

        tableHtml += `</tbody></table>`;
        container.innerHTML = tableHtml;
        grid.appendChild(container);
    } else {
        // ═══ RENDER REGULAR OPTIONS (MCQ, TF, CHECKBOX) ═══
        const shuffled = shuffleArray(data.options);
        currentShuffleMap = shuffled.map(s => s.origIdx);

        shuffled.forEach((item, shuffIdx) => {
            const label = document.createElement('label');
            label.className = 'opt-label';
            label.id = `label-${shuffIdx}`;

            const input = document.createElement('input');
            input.type = inputType;
            input.name = 'q-opt';
            input.value = shuffIdx;

            input.addEventListener('change', () => {
                sfxClick();
                if (data.type === 'mcq' || data.type === 'tf') {
                    // Garansi: Hapus seleksi visual dari semua baris lain
                    grid.querySelectorAll('.opt-label').forEach(l => l.classList.remove('selected-opt'));
                    label.classList.add('selected-opt');
                } else if (data.type === 'checkbox') {
                    const maxAllowed = data.maxSelect || (Array.isArray(data.answer) ? data.answer.length : null);
                    const checkedInputs = grid.querySelectorAll('input[type="checkbox"]:checked');
                    // Cegah human error memilih lebih dari batas yang ditentukan
                    if (input.checked && maxAllowed && checkedInputs.length > maxAllowed) {
                        input.checked = false;
                        sfxWrong();
                        showToast(`Maksimal memilih ${maxAllowed} jawaban untuk soal ini! Batalkan salah satu pilihan Anda sebelum memilih yang lain.`, '⚠️');
                        return;
                    }
                    label.classList.toggle('selected-opt', input.checked);
                    updateCheckboxCounter(reqCount);
                }
            });

            const checkMark = document.createElement('span');
            checkMark.className = 'check-indicator';

            const text = document.createElement('span');
            text.className = 'opt-text';
            text.textContent = item.val;

            label.appendChild(input);
            label.appendChild(checkMark);
            label.appendChild(text);
            grid.appendChild(label);
        });
    }

    startTimer();
    saveCurrentQuizSession();
}

window.handleMatrixRadioSelect = function(rowIdx, val) {
    sfxClick();
    const lblTrue = document.getElementById(`matrix-lbl-${rowIdx}-0`);
    const lblFalse = document.getElementById(`matrix-lbl-${rowIdx}-1`);
    if (lblTrue && lblFalse) {
        lblTrue.classList.toggle('active', val === 0);
        lblFalse.classList.toggle('active', val === 1);
    }
};

function checkAnswer(isAutoTimeout = false) {
    stopTimer();
    const origQIdx = shuffledQuizOrder[currentQ];
    const data = quizData[origQIdx];
    const grid = document.getElementById('options-grid');

    let selectedOriginals = [];
    let correctOriginals = [];
    let isCorrect = false;
    let pointRes = null;

    if (data.type === 'matrix_tf') {
        const rows = grid.querySelectorAll('tr[data-stmt-idx]');
        let allChosen = true;
        let userAnswers = []; // 0 = Benar, 1 = Salah, null = belum
        rows.forEach((row, rIdx) => {
            const checked = row.querySelector(`input[name="matrix_row_${currentQ}_${rIdx}"]:checked`);
            if (!checked) {
                allChosen = false;
                userAnswers.push(null);
            } else {
                userAnswers.push(parseInt(checked.value, 10));
            }
        });

        if (!allChosen && !isAutoTimeout) {
            sfxWrong();
            showToast('Harap tentukan [Benar] atau [Salah] untuk setiap baris sebelum mengecek!', '⚠️');
            if (TIMER_MAX > 0) startTimer();
            return;
        }

        // Disable all matrix radios
        grid.querySelectorAll('input[type="radio"]').forEach(inp => inp.disabled = true);
        const table = document.getElementById('matrix-active-table');
        if (table) table.classList.add('disabled-row');

        correctOriginals = Array.isArray(data.answer) ? data.answer : [];
        selectedOriginals = userAnswers;

        let correctCount = 0;
        rows.forEach((row, rIdx) => {
            const userVal = userAnswers[rIdx];
            const correctVal = correctOriginals[rIdx];
            const lblTrue = document.getElementById(`matrix-lbl-${rIdx}-0`);
            const lblFalse = document.getElementById(`matrix-lbl-${rIdx}-1`);

            // Tandai kunci benar dengan border hijau
            if (correctVal === 0 && lblTrue) lblTrue.classList.add('correct-choice');
            if (correctVal === 1 && lblFalse) lblFalse.classList.add('correct-choice');

            // Jika jawaban siswa salah, tandai pilihan siswa dengan border merah
            if (userVal !== null && userVal !== correctVal) {
                const wrongLbl = userVal === 0 ? lblTrue : lblFalse;
                if (wrongLbl) wrongLbl.classList.add('wrong-choice');
            }

            if (userVal === correctVal) {
                correctCount++;
            }
        });

        const totalRows = correctOriginals.length || 1;
        isCorrect = correctCount === totalRows;
        const maxPts = data.points || 5;
        const ptsEarned = Math.round((correctCount / totalRows) * maxPts);

        pointRes = {
            pointsEarned: ptsEarned,
            maxPoints: maxPts,
            isFullCorrect: isCorrect,
            isPartial: !isCorrect && ptsEarned > 0,
            summary: `${ptsEarned}/${maxPts} Poin (${correctCount}/${totalRows} Pernyataan Tepat)`
        };
    } else {
        const inputs = document.querySelectorAll('input[name="q-opt"]');
        const labels = document.querySelectorAll('.opt-label');

        let selectedShuffleIdxs = [];
        inputs.forEach(inp => {
            if (inp.checked) selectedShuffleIdxs.push(parseInt(inp.value));
        });

        if (selectedShuffleIdxs.length === 0 && !isAutoTimeout) {
            sfxWrong();
            showToast('Silakan pilih jawaban terlebih dahulu!', '⚠️');
            if (TIMER_MAX > 0) startTimer();
            return;
        }

        if (data.type === 'checkbox' && !isAutoTimeout) {
            if (selectedShuffleIdxs.length === 0) {
                sfxWrong();
                showToast('Silakan pilih minimal 1 jawaban sebelum mengunci!', '⚠️');
                if (TIMER_MAX > 0) startTimer();
                return;
            }
        }

        inputs.forEach(inp => inp.disabled = true);
        labels.forEach(lbl => lbl.classList.add('disabled'));

        selectedOriginals = selectedShuffleIdxs.map(si => currentShuffleMap[si]);
        correctOriginals = Array.isArray(data.answer) ? data.answer : [data.answer];

        if (data.type === 'mcq' || data.type === 'tf') {
            isCorrect = selectedOriginals.length > 0 && selectedOriginals[0] === correctOriginals[0];
            if (isCorrect) {
                const l = document.getElementById(`label-${selectedShuffleIdxs[0]}`);
                if (l) l.classList.add('correct');
            } else {
                if (selectedShuffleIdxs.length > 0) {
                    const l = document.getElementById(`label-${selectedShuffleIdxs[0]}`);
                    if (l) l.classList.add('wrong');
                }
                currentShuffleMap.forEach((origIdx, shuffIdx) => {
                    if (origIdx === correctOriginals[0]) {
                        const l = document.getElementById(`label-${shuffIdx}`);
                        if (l) l.classList.add('correct');
                    }
                });
            }
        } else {
            const correctSet = new Set(correctOriginals);
            const selectedSet = new Set(selectedOriginals);
            isCorrect = correctSet.size === selectedSet.size && [...correctSet].every(v => selectedSet.has(v));

            currentShuffleMap.forEach((origIdx, shuffIdx) => {
                if (correctSet.has(origIdx)) {
                    const l = document.getElementById(`label-${shuffIdx}`);
                    if (l) l.classList.add('correct');
                }
                if (selectedShuffleIdxs.includes(shuffIdx) && !correctSet.has(origIdx)) {
                    const l = document.getElementById(`label-${shuffIdx}`);
                    if (l) l.classList.add('wrong');
                }
            });
        }

        pointRes = window.NemotronAI ? window.NemotronAI.calculateQuestionPoints(data, selectedOriginals) : {
            pointsEarned: isCorrect ? (data.points || 5) : 0,
            maxPoints: data.points || 5,
            isFullCorrect: isCorrect,
            isPartial: false,
            summary: isCorrect ? 'Benar Penuh' : 'Salah'
        };
    }

    earnedPointsTotal += pointRes.pointsEarned;

    const card = document.querySelector('#screen-quiz .glass-card');
    const fb = document.getElementById('feedback-box');

    let selectedText = [];
    let correctText = [];
    if (data.type === 'matrix_tf') {
        const stmts = data.statements || data.options || [];
        selectedText = selectedOriginals.map((val, idx) => `[#${idx+1}] ${val === 0 ? 'Benar' : (val === 1 ? 'Salah' : 'Belum')}`);
        correctText = correctOriginals.map((val, idx) => `[#${idx+1}] ${val === 0 ? 'Benar' : 'Salah'}`);
    } else {
        selectedText = selectedOriginals.map(idx => data.options[idx]);
        correctText = correctOriginals.map(idx => data.options[idx]);
    }

    detailedAnswers[origQIdx] = {
        qIndex: origQIdx,
        questionNumber: currentQ + 1,
        questionText: data.q,
        caseStudy: data.caseStudy || null,
        difficulty: data.difficulty || 'Medium',
        type: data.type,
        options: data.options || data.statements,
        selectedIndices: selectedOriginals,
        selectedText: selectedText.length > 0 ? selectedText : ['(Waktu Habis — Belum Memilih)'],
        correctIndices: correctOriginals,
        correctText: correctText,
        isCorrect: isCorrect,
        pointsEarned: pointRes.pointsEarned,
        maxPoints: pointRes.maxPoints,
        isPartial: pointRes.isPartial,
        pointSummary: pointRes.summary,
        explanation: data.explanation
    };

    // Sembunyikan tombol petunjuk saat jawaban sudah dikunci
    const hintBtn = document.getElementById('btn-hint');
    const hintBox = document.getElementById('hint-box');
    if (hintBtn) hintBtn.style.display = 'none';
    if (hintBox) hintBox.style.display = 'none';

    if (pointRes.isFullCorrect) {
        sfxCorrect();
        score++;
        streak++;
        if (streak > maxStreak) maxStreak = streak;
        answeredCorrectly[origQIdx] = true;

        triggerStreakVibration(streak);

        fb.className = 'feedback-box correct-fb';
        fb.innerHTML = `<h4>${isAutoTimeout ? '⏰ Waktu Habis — Pilihan Terkunci & Benar! ✅' : '✅ Jawaban Benar Penuh!'} (+${pointRes.pointsEarned} Poin)</h4>${formatPedagogicalFeedback(data.explanation)}`;

        const streakEl = document.getElementById('streak-display');
        streakEl.style.transform = 'scale(1.25)';
        setTimeout(() => streakEl.style.transform = '', 250);

        if (card) card.classList.toggle('streak-on-fire', streak >= 3);
        if (streak >= 2) showMegaComboHero(streak);
    } else if (pointRes.isPartial) {
        sfxCorrect();
        streak = 0;
        answeredCorrectly[origQIdx] = true;

        fb.className = 'feedback-box warning-fb';
        fb.innerHTML = `<h4>🟡 Jawaban Benar Sebagian (+${pointRes.pointsEarned}/${pointRes.maxPoints} Poin)</h4><p style="font-weight: 700; color: #fde047; margin-bottom: 6px;">${pointRes.summary}</p>${formatPedagogicalFeedback(data.explanation)}`;

        if (card) card.classList.remove('streak-on-fire');
    } else {
        sfxWrong();
        streak = 0;
        answeredCorrectly[origQIdx] = false;

        fb.className = 'feedback-box wrong-fb';
        fb.innerHTML = `<h4>${isAutoTimeout ? '⏰ Waktu Habis — Pilihan Otomatis Terkunci! ❌' : '❌ Analisis Kurang Tepat'} (0/${pointRes.maxPoints} Poin)</h4>${formatPedagogicalFeedback(data.explanation)}`;

        if (card) card.classList.remove('streak-on-fire');
    }

    fb.style.display = 'block';
    document.getElementById('score-display').textContent = `⭐ ${earnedPointsTotal} Poin`;
    document.getElementById('streak-display').textContent = `🔥 ${streak}`;
    document.getElementById('streak-display').classList.toggle('on-fire', streak >= 3);

    document.getElementById('btn-check').style.display = 'none';
    document.getElementById('btn-next').style.display = 'inline-flex';
    saveCurrentQuizSession();
}

function nextQuestion() {
    sfxClick();
    const qContent = document.getElementById('q-content');
    qContent.classList.remove('slide-in');
    qContent.classList.add('slide-out');

    setTimeout(() => {
        currentQ++;
        if (currentQ < quizData.length) loadQuestion(currentQ);
        else finishQuiz();
    }, 300);
}

let isQuizFinishing = false;
function finishQuiz() {
    if (isQuizFinishing) return;
    isQuizFinishing = true;

    clearFullscreenWarningCountdown();
    exitExamFullscreen();

    window.onbeforeunload = null;
    sessionStorage.removeItem(SESSION_QUIZ_ACTIVE_KEY);
    stopBGM();
    stopTimer();
    switchScreen('result');

    const card = document.querySelector('#screen-quiz .glass-card');
    if (card) card.classList.remove('streak-on-fire');

    const calcScore = totalPossiblePoints > 0 
        ? Math.round((earnedPointsTotal / totalPossiblePoints) * 100) 
        : Math.round((score / quizData.length) * 100);
    const finalScore = Math.min(100, Math.max(0, calcScore));

    const elapsed = Math.round((Date.now() - quizStartTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    const timeStr = `${mins}m ${secs}s`;
    const now = new Date();
    const clockStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')} WIB`;

    const numCorrect = answeredCorrectly.filter(x => x === true).length;
    const KKM = currentActiveModule ? (currentActiveModule.kkm || 80) : 80;

    // 📈 Rekonsiliasi Nilai Perbaikan Kurikulum Merdeka (Adaptive Remedial Reconcile)
    let displayScore = finalScore;
    let reconciledScore = finalScore;
    if (isRemedialSession && remedialSourceRecord) {
        const orig = remedialSourceRecord.score || 0;
        // Peningkatan proporsional pada butir soal yang salah
        reconciledScore = Math.max(orig, Math.min(100, Math.round(orig + (100 - orig) * (finalScore / 100))));
        displayScore = reconciledScore;
    }

    const isPassed = displayScore >= KKM;

    const record = {
        moduleId: currentActiveModule ? currentActiveModule.id : 'modul_detektif_fakta',
        moduleTitle: currentActiveModule ? currentActiveModule.title : 'Misi Detektif Fakta',
        name: studentName,
        class: studentClass,
        score: displayScore,
        isRemedial: isRemedialSession,
        originalScore: isRemedialSession && remedialSourceRecord ? remedialSourceRecord.score : null,
        remedialScore: isRemedialSession ? finalScore : null,
        pointsEarned: earnedPointsTotal,
        totalPoints: totalPossiblePoints,
        correct: numCorrect,
        total: quizData.length,
        wrongQuestions: quizData.map((_, i) => answeredCorrectly[i] === false ? i : -1).filter(i => i >= 0),
        detailedAnswers: detailedAnswers,
        time: clockStr,
        duration: timeStr,
        date: now.toLocaleDateString('id-ID'),
        timestamp: now.getTime(),
        tabSwitchCount: cheatStrikes || 0,
        isCheated: false,
        hintsUsedCount: sessionHintsUsedCount || 0
    };
    saveRecord(record);

    const ring = document.getElementById('score-ring');
    const circumference = 2 * Math.PI * 78;
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;
    if (isPassed) ring.style.stroke = 'var(--success)';
    else ring.style.stroke = 'var(--danger)';
    setTimeout(() => { ring.style.strokeDashoffset = circumference - (circumference * displayScore / 100); }, 200);

    const scoreText = document.getElementById('score-ring-text');
    let counter = 0;
    const step = Math.max(1, Math.floor(displayScore / 50));
    const counterInterval = setInterval(() => {
        counter += step;
        if (counter >= displayScore) { counter = displayScore; clearInterval(counterInterval); }
        scoreText.textContent = counter;
    }, 25);

    const kkmBanner = document.getElementById('kkm-status-banner');
    if (kkmBanner) {
        if (isRemedialSession) {
            if (isPassed) {
                kkmBanner.className = 'kkm-status-banner passed';
                kkmBanner.innerHTML = `🎉 STATUS: TUNTAS REMEDIAL (Skor Awal: ${remedialSourceRecord ? remedialSourceRecord.score : 0} ➔ Skor Baru: ${displayScore} / 100 • KKM: ${KKM})`;
            } else {
                kkmBanner.className = 'kkm-status-banner remedial';
                kkmBanner.innerHTML = `⚠️ STATUS: REMEDIAL BELUM TUNTAS (Skor: ${displayScore} / 100 • KKM: ${KKM})`;
            }
        } else {
            if (isPassed) {
                kkmBanner.className = 'kkm-status-banner passed';
                kkmBanner.innerHTML = `🎉 STATUS: LULUS KKM (Skor: ${displayScore} / 100 • KKM: ${KKM})`;
            } else {
                kkmBanner.className = 'kkm-status-banner remedial';
                kkmBanner.innerHTML = `⚠️ STATUS: BELUM LULUS / REMEDIAL (Skor: ${displayScore} / 100 • KKM: ${KKM})`;
            }
        }
    }

    const titleEl = document.getElementById('result-title');
    const descEl = document.getElementById('result-desc');

    if (isRemedialSession) {
        if (isPassed) {
            titleEl.textContent = '🎉 Selamat! Remedial Berhasil Tuntas!';
            titleEl.style.color = 'var(--success)';
            descEl.textContent = `Luar biasa ${studentName}! Anda berhasil memperbaiki pemahaman konsep dengan nilai baru ${displayScore} dari 100 (Melampaui KKM ${KKM}). Nilai perbaikan telah dikirim ke Dasbor Guru.`;
            sfxVictory(); shootConfetti();
            spawnRandomEmojis('🎉', 4);
        } else {
            titleEl.textContent = '📉 Remedial Belum Mencapai KKM';
            titleEl.style.color = 'var(--danger)';
            descEl.textContent = `Nilai akhir perbaikan Anda ${displayScore} dari 100 belum mencapai KKM ${KKM}. Pelajari ulasan pembahasan di bawah ini untuk konsultasi dengan guru mata pelajaran.`;
            sfxWrong();
        }
    } else {
        if (displayScore >= 90) {
            titleEl.textContent = '🏆 Evaluasi Cemerlang — Nilai Sempurna!';
            titleEl.style.color = 'var(--success)';
            descEl.textContent = `Luar biasa ${studentName}! Nilai akhir Anda ${displayScore} dari 100 (Melampaui KKM ${KKM}). Pemahaman konsep Anda sangat matang!`;
            sfxVictory(); shootConfetti();
            spawnRandomEmojis('🏆', 6);
        } else if (displayScore >= 80) {
            titleEl.textContent = '🎉 Kompeten — Lulus Memenuhi KKM!';
            titleEl.style.color = 'var(--success)';
            descEl.textContent = `Selamat ${studentName}! Anda dinyatakan LULUS dengan nilai akhir ${displayScore} dari 100 (Batas KKM: ${KKM}). Pertahankan prestasi Anda!`;
            sfxVictory(); shootConfetti();
            spawnRandomEmojis('🎉', 4);
        } else {
            titleEl.textContent = '📉 Belum Mencapai KKM — Tetap Semangat!';
            titleEl.style.color = 'var(--danger)';
            descEl.textContent = `Nilai akhir Anda ${displayScore} dari 100 belum mencapai standar kelulusan KKM ${KKM}. Silakan pelajari kembali ulasan soal di bawah ini dan ikuti remedial.`;
            sfxWrong();
        }
    }

    // 🔁 Kontrol Tampilan Tombol & Card Remedial Adaptif (Sesuai Pengaturan Guru)
    const isRemedialConfigEnabled = (typeof loadRemedialSetting === 'function') 
        ? loadRemedialSetting() 
        : (localStorage.getItem('quizmaster_remedial_enabled') !== 'disabled');

    const remedialCard = document.getElementById('remedial-card');
    const btnStartRemedial = document.getElementById('btn-start-remedial');
    const remedialCount = document.getElementById('remedial-card-count');
    const remedialBtnCount = document.getElementById('remedial-q-count');

    const wrongList = record.wrongQuestions || [];
    if (!isPassed && wrongList.length > 0 && isRemedialConfigEnabled) {
        remedialSourceRecord = record;
        window.remedialSourceRecord = record;
        if (remedialCard) remedialCard.style.display = 'flex';
        if (btnStartRemedial) btnStartRemedial.style.display = 'inline-flex';
        if (remedialCount) remedialCount.textContent = wrongList.length;
        if (remedialBtnCount) remedialBtnCount.textContent = wrongList.length;
    } else {
        if (remedialCard) remedialCard.style.display = 'none';
        if (btnStartRemedial) btnStartRemedial.style.display = 'none';
    }

    const resCorrectEl = document.getElementById('res-correct');
    const resWrongEl = document.getElementById('res-wrong');
    const resStreakEl = document.getElementById('res-streak');
    if (resCorrectEl) resCorrectEl.textContent = `${numCorrect} Soal`;
    if (resWrongEl) resWrongEl.textContent = `${quizData.length - numCorrect} Soal`;
    if (resStreakEl) resStreakEl.textContent = maxStreak;
    buildReview();
}

function buildReview() {
    const list = document.getElementById('review-list');
    list.innerHTML = '';
    shuffledQuizOrder.forEach((origIdx, playIdx) => {
        const data = quizData[origIdx];
        const isRight = answeredCorrectly[origIdx];
        const div = document.createElement('div');
        div.className = `review-item ${isRight ? 'review-correct' : 'review-wrong'}`;
        const status = isRight ? '✅' : (isRight === false ? '❌' : '⏰');
        let correctAns;
        if (data.type === 'matrix_tf') {
            const stmts = data.statements || data.options || [];
            correctAns = (Array.isArray(data.answer) ? data.answer : []).map((ans, i) => `[#${i+1}] ${ans === 0 ? '✓ Benar' : '✕ Salah'}`).join(' • ');
        } else if (Array.isArray(data.answer)) {
            correctAns = data.answer.map(a => (data.options && data.options[a]) || a).join(' | ');
        } else {
            correctAns = (data.options && data.options[data.answer]) || data.answer;
        }

        const diff = data.difficulty || 'Medium';
        let diffLabel = diff === 'Easy' ? '🟢 Mudah' : (diff === 'Hard' ? '🔴 Sulit' : '🟡 Sedang');
        let diffClass = diff === 'Easy' ? 'diff-easy' : (diff === 'Hard' ? 'diff-hard' : 'diff-medium');

        // Jawaban siswa yang tersimpan
        const userAnsDetail = detailedAnswers[origIdx];
        const userAnsText = userAnsDetail && userAnsDetail.selectedText ? userAnsDetail.selectedText.join(' • ') : '-';

        div.innerHTML = `
            <div class="review-q" style="font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; line-height: 1.4; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                <span>${status} <strong>Soal ${playIdx + 1}:</strong> ${data.q}</span>
                <span class="q-badge ${diffClass}" style="font-size: 0.72rem; padding: 2px 10px; margin: 0;">${diffLabel}</span>
            </div>
            <div style="font-size: 0.84rem; margin-bottom: 4px; color: ${isRight ? 'var(--success)' : 'var(--danger)'};">
                <strong>Jawaban Anda:</strong> ${userAnsText}
            </div>
            <div class="review-answer" style="margin-bottom: 10px; font-size: 0.84rem;">
                <strong>Kunci Jawaban Tepat:</strong> <span style="color: var(--success); font-weight: 700;">${correctAns}</span>
            </div>
            <div class="review-explanation" style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45; background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: 12px; border-left: 3.5px solid ${isRight ? 'var(--success)' : 'var(--danger)'};">
                <div style="font-weight: 800; font-size: 0.88rem; color: ${isRight ? 'var(--success)' : '#fb7185'}; margin-bottom: 6px;">
                    💡 Bedah Soal &amp; Analisis Pedagogis:
                </div>
                ${formatPedagogicalFeedback(data.explanation)}
            </div>
        `;
        list.appendChild(div);
    });
}

let reviewVisible = false;
function toggleReview() {
    reviewVisible = !reviewVisible;
    document.getElementById('review-section').style.display = reviewVisible ? 'block' : 'none';
    document.getElementById('btn-toggle-review').textContent = reviewVisible ? '🔼 Sembunyikan Review' : '📋 Lihat Review';
}

function shootConfetti() {
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 16 : 40;
    const colors = ['#8b5cf6', '#22d3ee', '#10b981', '#f59e0b', '#f43f5e', '#6366f1', '#ec4899'];
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti';
        el.style.left = Math.random() * 100 + 'vw';
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.width = (Math.random() * 6 + 4) + 'px';
        el.style.height = (Math.random() * 6 + 4) + 'px';
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        el.style.animationDuration = (Math.random() * 1.5 + 1.2) + 's';
        el.style.animationDelay = (Math.random() * 0.5) + 's';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2200);
    }
}

// ============================================================
// 📖 MODAL PANDUAN MENGERJAKAN SOAL & TATA TERTIB UJIAN
// ============================================================
function showExamGuide() {
    if (typeof sfxClick === 'function') sfxClick();
    const modal = document.getElementById('exam-guide-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeExamGuide() {
    if (typeof sfxClick === 'function') sfxClick();
    const modal = document.getElementById('exam-guide-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

window.showExamGuide = showExamGuide;
window.closeExamGuide = closeExamGuide;

// ============================================================
// 🔁 MODAL & KONTROL SESI REMEDIAL ADAPTIF
// ============================================================
function openRemedialBriefing() {
    if (typeof sfxClick === 'function') sfxClick();
    const modal = document.getElementById('remedial-briefing-modal');
    if (!modal) return;
    const rec = remedialSourceRecord;
    if (!rec || !rec.wrongQuestions || rec.wrongQuestions.length === 0) {
        showToast('Tidak ada butir soal yang perlu remedial!', 'ℹ️');
        return;
    }
    const nameEl = document.getElementById('rem-brief-name');
    const classEl = document.getElementById('rem-brief-class');
    const oldScoreEl = document.getElementById('rem-brief-old-score');
    const wrongCountEl = document.getElementById('rem-brief-wrong-count');

    if (nameEl) nameEl.textContent = rec.name || studentName || 'Siswa';
    if (classEl) classEl.textContent = `(${rec.class || studentClass || '-'})`;
    if (oldScoreEl) oldScoreEl.textContent = `Skor Awal: ${rec.score || 0}`;
    if (wrongCountEl) wrongCountEl.textContent = `${rec.wrongQuestions.length} Soal Salah`;

    modal.classList.add('active');
}

function closeRemedialBriefing() {
    if (typeof sfxClick === 'function') sfxClick();
    const modal = document.getElementById('remedial-briefing-modal');
    if (modal) modal.classList.remove('active');
}

async function executeRemedialSession() {
    closeRemedialBriefing();
    const rec = remedialSourceRecord;
    if (!rec || !rec.wrongQuestions || rec.wrongQuestions.length === 0) {
        showToast('Data butir soal remedial tidak ditemukan!', '⚠️');
        return;
    }

    // Pastikan referensi master pertanyaan lengkap
    if (!remedialOriginalQuestions || remedialOriginalQuestions.length === 0) {
        remedialOriginalQuestions = [...quizData];
        window.remedialOriginalQuestions = remedialOriginalQuestions;
    }

    // Periksa apakah modul aktif memiliki paket soal remedial khusus buatan AI
    let filteredQuestions = [];
    if (currentActiveModule && Array.isArray(currentActiveModule.remedialQuestions) && currentActiveModule.remedialQuestions.length > 0) {
        filteredQuestions = [...currentActiveModule.remedialQuestions];
    } else {
        // Filter HANYA butir soal yang sebelumnya dijawab salah
        filteredQuestions = rec.wrongQuestions
            .map(origIdx => remedialOriginalQuestions[origIdx])
            .filter(q => q && typeof q === 'object');
    }

    if (filteredQuestions.length === 0) {
        showToast('Gagal memuat butir soal remedial!', '⚠️');
        return;
    }

    // Set state kuis ke mode remedial
    isRemedialSession = true;
    window.isRemedialSession = true;
    quizData = filteredQuestions;
    window.quizData = filteredQuestions;

    isQuizFinishing = false;
    currentQ = 0;
    score = 0;
    earnedPointsTotal = 0;
    totalPossiblePoints = quizData.reduce((acc, q) => acc + (q.points || 5), 0);
    if (totalPossiblePoints === 0) totalPossiblePoints = quizData.length * 5;
    streak = 0;
    maxStreak = 0;
    isCheatingTriggered = false;
    cheatStrikes = 0;
    isCheatWarningActive = false;

    // Acak urutan butir soal remedial
    const indices = Array.from({ length: quizData.length }, (_, i) => i);
    shuffledQuizOrder = shuffleArray(indices).map(item => item.val);

    answeredCorrectly = new Array(quizData.length).fill(null);
    detailedAnswers = new Array(quizData.length).fill(null);
    TIMER_MAX = loadTimerSetting();

    // Tampilkan banner indikator remedial di layar kuis
    const remInd = document.getElementById('quiz-remedial-indicator');
    const remText = document.getElementById('quiz-remedial-text');
    if (remInd) remInd.style.display = 'flex';
    if (remText) remText.textContent = `Menyelesaikan ${quizData.length} butir soal perbaikan konsep (Target KKM: 80)`;

    // Beralih ke layar kuis & mulai hitung mundur
    switchScreen('quiz');

    // 🖥️ Kunci Layar Penuh Otomatis jika Mode Wajib Aktif
    const isWajib = (typeof isEnforcedFullscreen === 'function') 
        ? isEnforcedFullscreen() 
        : (localStorage.getItem('quizmaster_fullscreen_mode') !== 'opsional');
    if (isWajib) {
        enterExamFullscreen();
    }

    runCountdown();
}

window.openRemedialBriefing = openRemedialBriefing;
window.closeRemedialBriefing = closeRemedialBriefing;
window.executeRemedialSession = executeRemedialSession;

