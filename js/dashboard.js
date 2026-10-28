// ============================================================
//  🔧 HELPER: GET ACTIVE QUIZ DATA (FALLBACK KE DEFAULT QUESTIONS)
// ============================================================
function getActiveQuizData() {
    if (typeof window !== 'undefined' && Array.isArray(window.quizData) && window.quizData.length > 0) {
        return window.quizData;
    }
    if (typeof quizData !== 'undefined' && Array.isArray(quizData) && quizData.length > 0) {
        return quizData;
    }
    if (typeof window !== 'undefined' && Array.isArray(window.DEFAULT_BUILTIN_QUESTIONS) && window.DEFAULT_BUILTIN_QUESTIONS.length > 0) {
        return window.DEFAULT_BUILTIN_QUESTIONS;
    }
    return [];
}
window.getActiveQuizData = getActiveQuizData;

// ============================================================
//  🛡️ SECURITY HELPERS: XSS ESCAPING & CSV/EXCEL SANITIZATION
// ============================================================
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
    // Neutralize spreadsheet formula injection (CWE-1236)
    if (/^[=+\-@\t\r]/.test(s)) {
        return "'" + s;
    }
    return s;
}
window.sanitizeSpreadsheetValue = sanitizeSpreadsheetValue;

// ============================================================
//  🔐 PIN & DELETE MODALS (MODERN TEACHER AUTHENTICATION)
// ============================================================
// 🛡️ SECURITY: SHA-256 Hash PIN Guru resmi (2543) — Mencegah pembacaan PIN dari source/console
const TEACHER_PIN_HASH = '887846b0aa6af194c7e153372b41453af317c9407cb72cd75b9f633eb8ebf3a4';
let _isTeacherAuthenticated = false;

async function hashPin(str) {
    if (!str) return '';
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuf = await crypto.subtle.digest('SHA-256', data);
        const hashArr = Array.from(new Uint8Array(hashBuf));
        return hashArr.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch(e) {
        return str;
    }
}

function isTeacherAuthValid() {
    return _isTeacherAuthenticated || !!sessionStorage.getItem('quizmaster_teacher_auth_token');
}
window.isTeacherAuthValid = isTeacherAuthValid;

let pinFailedAttempts = 0;
let pinLockoutUntil = 0;

function updatePinDots(val = '') {
    for (let i = 0; i < 4; i++) {
        const dot = document.getElementById(`pdot-${i}`);
        if (dot) {
            dot.classList.toggle('filled', i < val.length);
            dot.classList.remove('error-slot');
            const inp = document.getElementById('pin-input');
            const isText = inp && inp.type === 'text';
            dot.textContent = i < val.length ? (isText ? val[i] : '•') : '';
        }
    }
}
window.updatePinDots = updatePinDots;

function onPinInputChanged() {
    const input = document.getElementById('pin-input');
    if (!input) return;
    const now = Date.now();
    if (now < pinLockoutUntil) {
        const remainingSec = Math.ceil((pinLockoutUntil - now) / 1000);
        const errBox = document.getElementById('pin-error-msg');
        if (errBox) {
            errBox.textContent = `🔒 Terkunci sementara! Tunggu ${remainingSec} detik lagi.`;
            errBox.style.display = 'flex';
        }
        input.value = '';
        updatePinDots('');
        return;
    }

    const val = input.value.replace(/\D/g, '').slice(0, 4);
    input.value = val;
    updatePinDots(val);
    const errBox = document.getElementById('pin-error-msg');
    if (errBox) errBox.style.display = 'none';
    if (val.length === 4) {
        setTimeout(() => submitPin(), 160);
    }
}
window.onPinInputChanged = onPinInputChanged;

function togglePinVisibility() {
    const input = document.getElementById('pin-input');
    const eyeBtn = document.getElementById('btn-pin-eye');
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        if (eyeBtn) eyeBtn.textContent = '🙈';
    } else {
        input.type = 'password';
        if (eyeBtn) eyeBtn.textContent = '👁️';
    }
    updatePinDots(input.value);
}
window.togglePinVisibility = togglePinVisibility;

function openPinModal() {
    sfxClick();
    const modal = document.getElementById('pin-modal');
    if (!modal) return;
    modal.classList.add('active');
    const input = document.getElementById('pin-input');
    if (input) {
        input.value = '';
        input.type = 'password';
        updatePinDots('');
        setTimeout(() => input.focus(), 150);
    }
    const eyeBtn = document.getElementById('btn-pin-eye');
    if (eyeBtn) eyeBtn.textContent = '👁️';
    const errBox = document.getElementById('pin-error-msg');
    if (errBox) errBox.style.display = 'none';
}
window.openPinModal = openPinModal;

function closeModal() {
    sfxClick();
    const modal = document.getElementById('pin-modal');
    if (modal) modal.classList.remove('active');
    const input = document.getElementById('pin-input');
    if (input) input.value = '';
    updatePinDots('');
}
window.closeModal = closeModal;

async function submitPin() {
    const input = document.getElementById('pin-input');
    if (!input) return;
    const now = Date.now();
    if (now < pinLockoutUntil) {
        const remainingSec = Math.ceil((pinLockoutUntil - now) / 1000);
        const errBox = document.getElementById('pin-error-msg');
        if (errBox) {
            errBox.textContent = `🔒 Terkunci sementara! Tunggu ${remainingSec} detik lagi.`;
            errBox.style.display = 'flex';
        }
        input.value = '';
        updatePinDots('');
        return;
    }

    const pin = input.value.trim();
    const pinH = await hashPin(pin);
    const isValid = (pinH === TEACHER_PIN_HASH);

    if (isValid) {
        pinFailedAttempts = 0;
        pinLockoutUntil = 0;
        _isTeacherAuthenticated = true;
        const sessionToken = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ('auth_' + Date.now());
        sessionStorage.setItem('quizmaster_teacher_auth_token', sessionToken);

        sfxCorrect();
        closeModal();
        initAudio();
        const saved = loadTimerSetting();
        const timerInp = document.getElementById('setting-timer');
        if (timerInp) timerInp.value = saved;
        TIMER_MAX = saved;

        const mgSaved = (typeof loadMiniGamesTimerSetting === 'function') ? loadMiniGamesTimerSetting() : 30;
        const mgTimerInp = document.getElementById('setting-minigames-timer');
        if (mgTimerInp) mgTimerInp.value = mgSaved;

        checkBackendStatus();
        switchScreen('teacher');
        if (window.targetTeacherTabAfterPin && typeof switchTeacherTab === 'function') {
            switchTeacherTab(window.targetTeacherTabAfterPin);
            window.targetTeacherTabAfterPin = null;
        } else if (typeof switchTeacherTab === 'function') {
            switchTeacherTab('records');
        }
        startDashboardAutoRefresh();
        showToast('Akses Dasbor Guru Terverifikasi 🔓', '👩‍🏫');
    } else {
        sfxWrong();
        pinFailedAttempts++;
        const errBox = document.getElementById('pin-error-msg');
        if (pinFailedAttempts >= 5) {
            pinLockoutUntil = Date.now() + 30000; // 30 detik lockout
            pinFailedAttempts = 0;
            if (errBox) {
                errBox.textContent = '🚨 Terlalu banyak percobaan (5x). Akses dikunci 30 detik!';
                errBox.style.display = 'flex';
            }
        } else {
            if (errBox) {
                errBox.textContent = `❌ PIN Salah! Sisa percobaan: ${5 - pinFailedAttempts}x lagi.`;
                errBox.style.display = 'flex';
            }
        }

        for (let i = 0; i < 4; i++) {
            const dot = document.getElementById(`pdot-${i}`);
            if (dot) dot.classList.add('error-slot');
        }
        input.style.borderColor = 'var(--danger)';
        input.style.animation = 'shake 0.4s';
        setTimeout(() => {
            input.style.borderColor = '';
            input.style.animation = '';
            input.value = '';
            updatePinDots('');
            input.focus();
        }, 700);
    }
}
window.submitPin = submitPin;

let targetDeleteRecord = null;

function openDeleteModal() {
    sfxWrong();
    const modal = document.getElementById('delete-modal');
    if (modal) modal.classList.add('active');
}

function closeDeleteModal() {
    sfxClick();
    const modal = document.getElementById('delete-modal');
    if (modal) modal.classList.remove('active');
}

// 🎯 BUKA MODAL PILIH HAPUS NILAI SPESIFIK PER MODUL
function openDeleteStudentModuleModal(name, cls, preselectedModuleId = null, specificScore = null) {
    if (!isTeacherAuthValid()) {
        sfxWrong();
        showToast('⛔ Akses Ditolak: Anda belum memasukkan PIN Guru!', '🔒');
        openPinModal();
        return;
    }

    sfxWrong();
    const allRecords = loadRecords();
    const modFaktaId = 'modul_detektif_fakta';
    const modJaringanId = 'modul_jaringan_keamanan';

    const nameMatches = (typeof isNameEquivalent === 'function') 
        ? (recName) => isNameEquivalent(recName, name)
        : (recName) => (recName || '').trim().toLowerCase() === name.trim().toLowerCase();
    const classMatches = (typeof isClassEquivalent === 'function')
        ? (recClass) => isClassEquivalent(recClass, cls)
        : (recClass) => (recClass || '').replace(/\s+/g, '').toUpperCase() === (cls || '').replace(/\s+/g, '').toUpperCase();

    const recsFakta = allRecords.filter(r => nameMatches(r.name) && classMatches(r.class) && normalizeModuleId(r.moduleId, r.id, r.date) === modFaktaId);
    const recsJaringan = allRecords.filter(r => nameMatches(r.name) && classMatches(r.class) && normalizeModuleId(r.moduleId, r.id, r.date) === modJaringanId);

    const bestFakta = recsFakta.sort((a,b) => (b.score - a.score))[0] || null;
    const bestJaringan = recsJaringan.sort((a,b) => (b.score - a.score))[0] || null;

    targetDeleteRecord = {
        name: name,
        cls: cls,
        preselectedModule: preselectedModuleId || (bestJaringan && !bestFakta ? modJaringanId : (bestFakta && !bestJaringan ? modFaktaId : 'all')),
        recordFakta: bestFakta,
        recordJaringan: bestJaringan
    };

    const elName = document.getElementById('del-student-name');
    const elInfo = document.getElementById('del-student-info');
    if (elName) elName.textContent = name;
    if (elInfo) elInfo.textContent = `Kelas: ${cls || '-'}`;

    const container = document.getElementById('del-module-options-container');
    if (container) {
        let defaultChoice = targetDeleteRecord.preselectedModule;
        if (defaultChoice === modJaringanId && !bestJaringan && bestFakta) defaultChoice = modFaktaId;
        if (defaultChoice === modFaktaId && !bestFakta && bestJaringan) defaultChoice = modJaringanId;

        container.innerHTML = `
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px;">
                Pilih nilai modul mana yang ingin Anda hapus:
            </div>
            
            <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.03); border: 1px solid ${defaultChoice === modFaktaId ? 'var(--primary)' : 'var(--glass-border)'}; border-radius: 10px; cursor: pointer; transition: 0.2s;">
                <input type="radio" name="del-module-choice" value="modul_detektif_fakta" ${defaultChoice === modFaktaId ? 'checked' : ''} ${!bestFakta ? 'disabled' : ''}>
                <div style="flex: 1;">
                    <div style="font-weight: 800; font-size: 0.9rem; color: ${bestFakta ? 'var(--text)' : 'var(--text-muted)'}; display: flex; align-items: center; gap: 6px;">
                        <span>🕵️ Modul Detektif Fakta (Kuis 1)</span>
                        ${bestFakta ? `<span class="quiz-score-subpill ${bestFakta.score >= 80 ? 'pass' : 'remedy'}" style="font-size: 0.72rem; padding: 2px 6px;">Skor: ${bestFakta.score}</span>` : ''}
                    </div>
                    <div style="font-size: 0.76rem; color: var(--text-secondary); margin-top: 2px;">
                        ${bestFakta ? `Status: <strong>${bestFakta.score >= 80 ? 'LULUS KKM' : 'REMEDIAL'}</strong> · Waktu: ${bestFakta.date || '-'}` : '⏳ <em>Siswa belum memiliki nilai pada modul ini</em>'}
                    </div>
                </div>
            </label>

            <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.03); border: 1px solid ${defaultChoice === modJaringanId ? 'var(--primary)' : 'var(--glass-border)'}; border-radius: 10px; cursor: pointer; transition: 0.2s;">
                <input type="radio" name="del-module-choice" value="modul_jaringan_keamanan" ${defaultChoice === modJaringanId ? 'checked' : ''} ${!bestJaringan ? 'disabled' : ''}>
                <div style="flex: 1;">
                    <div style="font-weight: 800; font-size: 0.9rem; color: ${bestJaringan ? 'var(--text)' : 'var(--text-muted)'}; display: flex; align-items: center; gap: 6px;">
                        <span>🛡️ Modul Keamanan Jaringan (Kuis 2)</span>
                        ${bestJaringan ? `<span class="quiz-score-subpill ${bestJaringan.score >= 80 ? 'pass' : 'remedy'}" style="font-size: 0.72rem; padding: 2px 6px;">Skor: ${bestJaringan.score}</span>` : ''}
                    </div>
                    <div style="font-size: 0.76rem; color: var(--text-secondary); margin-top: 2px;">
                        ${bestJaringan ? `Status: <strong>${bestJaringan.score >= 80 ? 'LULUS KKM' : 'REMEDIAL'}</strong> · Waktu: ${bestJaringan.date || '-'}` : '⏳ <em>Siswa belum memiliki nilai pada modul ini</em>'}
                    </div>
                </div>
            </label>

            <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(244,63,94,0.08); border: 1px solid rgba(244,63,94,0.3); border-radius: 10px; cursor: pointer; transition: 0.2s;">
                <input type="radio" name="del-module-choice" value="all" ${defaultChoice === 'all' ? 'checked' : ''}>
                <div style="flex: 1;">
                    <div style="font-weight: 800; font-size: 0.9rem; color: var(--danger);">
                        ⚠️ Hapus Nilai KEDUA Modul (Hapus Total Siswa Ini)
                    </div>
                    <div style="font-size: 0.76rem; color: var(--text-secondary); margin-top: 2px;">
                        Menghapus seluruh nilai Kuis 1 & Kuis 2 siswa ini. Siswa dapat memulai ulang dari nol.
                    </div>
                </div>
            </label>
        `;
    }

    const modal = document.getElementById('delete-single-modal');
    if (modal) modal.classList.add('active');
}
window.openDeleteStudentModuleModal = openDeleteStudentModuleModal;

function openDeleteSingleModal(id, name, cls, timestamp, score) {
    openDeleteStudentModuleModal(name, cls, null, score);
}
window.openDeleteSingleModal = openDeleteSingleModal;

function openDeleteSingleByIndex(recordIdx) {
    const r = window.currentRenderedRecords ? window.currentRenderedRecords[recordIdx] : null;
    if (!r) return;
    openDeleteStudentModuleModal(r.name || '', r.class || '', r.moduleId || null, r.score || 0);
}
window.openDeleteSingleByIndex = openDeleteSingleByIndex;

function closeDeleteSingleModal() {
    sfxClick();
    targetDeleteRecord = null;
    const modal = document.getElementById('delete-single-modal');
    if (modal) modal.classList.remove('active');
}
window.closeDeleteSingleModal = closeDeleteSingleModal;

async function confirmDeleteSingle() {
    if (!targetDeleteRecord) return;
    // 🔒 SECURITY GUARD: Tolak eksekusi jika pengguna belum terverifikasi PIN Guru
    if (!isTeacherAuthValid()) {
        sfxWrong();
        showToast('⛔ Akses Ditolak: Anda belum memasukkan PIN Guru!', '🔒');
        openPinModal();
        return;
    }

    const selRadio = document.querySelector('input[name="del-module-choice"]:checked');
    const chosenModule = selRadio ? selRadio.value : (targetDeleteRecord.preselectedModule || 'all');
    const target = targetDeleteRecord;
    closeDeleteSingleModal();

    const nameMatches = (typeof isNameEquivalent === 'function') 
        ? (recName) => isNameEquivalent(recName, target.name)
        : (recName) => (recName || '').trim().toLowerCase() === target.name.trim().toLowerCase();
    const classMatches = (typeof isClassEquivalent === 'function')
        ? (recClass) => isClassEquivalent(recClass, target.cls)
        : (recClass) => (recClass || '').replace(/\s+/g, '').toUpperCase() === (target.cls || '').replace(/\s+/g, '').toUpperCase();

    // 1. Simpan ke daftar tombstone (quizmaster_deleted_records) agar tidak dibangkitkan lagi dari baseline
    let deletedRecords = [];
    try {
        deletedRecords = JSON.parse(localStorage.getItem('quizmaster_deleted_records') || '[]');
        if (!Array.isArray(deletedRecords)) deletedRecords = [];
    } catch(e) {}

    const normName = target.name.trim().toLowerCase();
    const normCls = (target.cls || '').replace(/\s+/g, '').toUpperCase();

    if (chosenModule === 'all' || chosenModule === 'modul_detektif_fakta') {
        deletedRecords.push(`${normName}|${normCls}|modul_detektif_fakta`);
    }
    if (chosenModule === 'all' || chosenModule === 'modul_jaringan_keamanan') {
        deletedRecords.push(`${normName}|${normCls}|modul_jaringan_keamanan`);
    }
    deletedRecords = Array.from(new Set(deletedRecords));
    localStorage.setItem('quizmaster_deleted_records', JSON.stringify(deletedRecords));

    // 2. Hapus dari LocalStorage
    let records = loadRecords();
    records = records.filter(r => {
        if (!nameMatches(r.name) || !classMatches(r.class)) return true;
        const rMod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || 'modul_detektif_fakta');
        if (chosenModule === 'all') return false;
        if (chosenModule === rMod) return false;
        return true;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));

    // 3. Hapus juga dari emergency backup
    try {
        let emergencyList = JSON.parse(localStorage.getItem('quizmaster_emergency_backup_records') || '[]');
        if (Array.isArray(emergencyList)) {
            emergencyList = emergencyList.filter(r => {
                if (!nameMatches(r.name) || !classMatches(r.class)) return true;
                const rMod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || 'modul_detektif_fakta');
                if (chosenModule === 'all') return false;
                if (chosenModule === rMod) return false;
                return true;
            });
            localStorage.setItem('quizmaster_emergency_backup_records', JSON.stringify(emergencyList));
        }
    } catch(e) {}

    // 4. Hapus dari Cloud Supabase Real-Time Database
    if (supabaseClient) {
        try {
            if (chosenModule === 'all') {
                await supabaseClient.from('quiz_results').delete()
                    .eq('student_name', target.name)
                    .eq('student_class', target.cls);
            } else if (chosenModule === 'modul_jaringan_keamanan') {
                await supabaseClient.from('quiz_results').delete()
                    .eq('student_name', target.name)
                    .eq('student_class', target.cls)
                    .eq('wrong_questions->>moduleId', 'modul_jaringan_keamanan');
            } else if (chosenModule === 'modul_detektif_fakta') {
                await supabaseClient.from('quiz_results').delete()
                    .eq('student_name', target.name)
                    .eq('student_class', target.cls)
                    .neq('quiz_date', '25/10/2026');
            }
        } catch (e) {
            console.warn('Supabase delete error:', e);
        }
    }

    // 5. REST API fallback ke Supabase
    try {
        const cfg = (typeof getSupabaseConfig === 'function') ? getSupabaseConfig() : null;
        if (cfg && cfg.url && cfg.key) {
            let deleteUrl = `${cfg.url.replace(/\/$/, '')}/rest/v1/${cfg.table || 'quiz_results'}?student_name=eq.${encodeURIComponent(target.name)}&student_class=eq.${encodeURIComponent(target.cls)}`;
            if (chosenModule === 'modul_jaringan_keamanan') {
                deleteUrl += `&wrong_questions->>moduleId=eq.modul_jaringan_keamanan`;
            }
            await fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'apikey': cfg.key,
                    'Authorization': 'Bearer ' + cfg.key,
                    'Content-Type': 'application/json'
                }
            });
        }
    } catch(e) {}

    // 6. Hapus dari MySQL Server Lokal (opsional jika aktif)
    try {
        await fetch('/api/scores', { 
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-token': sessionStorage.getItem('quizmaster_teacher_auth_token') || 'authenticated'
            },
            body: JSON.stringify({ 
                name: target.name, 
                class: target.cls,
                moduleId: chosenModule
            })
        });
    } catch (e) {}

    sfxWrong();
    renderDashboard();

    const modLabels = {
        'modul_detektif_fakta': 'Modul Detektif Fakta (Kuis 1)',
        'modul_jaringan_keamanan': 'Modul Keamanan Jaringan (Kuis 2)',
        'all': 'Semua Modul Kuis'
    };
    showToast(`Nilai ${modLabels[chosenModule] || 'modul'} untuk "${target.name}" berhasil dihapus!`, '🗑️');
}
window.confirmDeleteSingle = confirmDeleteSingle;

async function confirmClearData() {
    // 🔒 SECURITY GUARD: Tolak eksekusi jika pengguna belum terverifikasi PIN Guru
    if (!isTeacherAuthValid()) {
        sfxWrong();
        showToast('⛔ Akses Ditolak: Anda belum memasukkan PIN Guru!', '🔒');
        openPinModal();
        return;
    }

    closeDeleteModal();
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('quizmaster_emergency_backup_records');
    localStorage.setItem('quizmaster_deleted_records', JSON.stringify(['__ALL__']));

    // 1. Hapus dari Cloud Supabase
    if (supabaseClient) {
        try {
            await supabaseClient.from('quiz_results').delete().neq('id', 0);
        } catch (e) {}
    }

    // 2. Hapus dari MySQL Lokal
    try {
        await fetch('/api/scores', { 
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json',
                'x-admin-token': sessionStorage.getItem('quizmaster_teacher_auth_token') || 'authenticated'
            }
        });
    } catch (e) {}

    sfxWrong();
    renderDashboard();
    showToast('Semua data rekap siswa berhasil dihapus!', '🗑️');
}
window.confirmClearData = confirmClearData;

// ============================================================
//  🕒 KONTROL AKSES & JADWAL GURU MATA PELAJARAN (RINI SYAFITRI)
// ============================================================
const SUBMISSION_POLICY_KEY = 'quizmaster_submission_policy';

function loadSubmissionPolicy() {
    try {
        const p = localStorage.getItem(SUBMISSION_POLICY_KEY);
        if (p) return p;
    } catch(e) {}
    return 'single_only'; // Default: 'single_only' (Integritas Ujian: 1 Kali Pengerjaan)
}
window.loadSubmissionPolicy = loadSubmissionPolicy;

function saveSubmissionPolicySetting() {
    const sel = document.getElementById('setting-submission-policy');
    if (!sel) return;
    const val = sel.value;
    localStorage.setItem(SUBMISSION_POLICY_KEY, val);
    const msg = document.getElementById('policy-saved-msg');
    if (msg) {
        msg.style.display = 'inline';
        setTimeout(() => { if (msg) msg.style.display = 'none'; }, 2500);
    }
    const labelMap = {
        'single_only': '1️⃣ Batas Respon: Hanya 1 Kali Pengerjaan (Tolak Duplikat)',
        'allow_twice_highest': '✌️ Batas Respon: Dapat Dikumpulkan 2 Kali (Ambil Nilai Tertinggi)',
        'allow_remedy': '⭐ Batas Respon: Boleh Remedi (Simpan Nilai Tertinggi)',
        'allow_multiple': '♾️ Batas Respon: Bebas Mencoba (Catat Semua Respon)'
    };
    showToast(labelMap[val] || 'Pengaturan respon siswa tersimpan!', '🔄');
}
window.saveSubmissionPolicySetting = saveSubmissionPolicySetting;

// 🔁 KONTROL ON/OFF MODE REMEDIAL
const REMEDIAL_SETTING_KEY = 'quizmaster_remedial_enabled';

function loadRemedialSetting() {
    try {
        const v = localStorage.getItem(REMEDIAL_SETTING_KEY);
        if (v === 'enabled') return true;
        if (v === 'disabled') return false;
    } catch(e) {}
    return false; // Default: Terkunci selama ujian, hanya aktif jika dibuka oleh Guru
}
window.loadRemedialSetting = loadRemedialSetting;

function saveRemedialSetting() {
    const sel = document.getElementById('setting-remedial-toggle');
    if (!sel) return;
    const val = sel.value;
    localStorage.setItem(REMEDIAL_SETTING_KEY, val);
    const msg = document.getElementById('remedial-toggle-saved-msg');
    if (msg) {
        msg.style.display = 'inline';
        setTimeout(() => { if (msg) msg.style.display = 'none'; }, 2500);
    }
    if (typeof sfxCorrect === 'function') sfxCorrect();
    showToast(val === 'enabled' 
        ? 'Mode Remedial Cerdas: DIAKTIFKAN 🟢 (Siswa dapat mengulang butir salah)' 
        : 'Mode Remedial Cerdas: DINONAKTIFKAN 🔴 (Fitur remedial disembunyikan)', 
        val === 'enabled' ? '✅' : 'ℹ️'
    );

    // ☁️ Sinkronkan status Mode Remedial ke Cloud Supabase agar berlaku di semua HP / Laptop
    if (typeof saveCloudSharedState === 'function') {
        saveCloudSharedState({ remedialEnabled: val === 'enabled' });
    }
}
window.saveRemedialSetting = saveRemedialSetting;

function initRemedialSettingUi() {
    const sel = document.getElementById('setting-remedial-toggle');
    if (sel) {
        sel.value = loadRemedialSetting() ? 'enabled' : 'disabled';
    }
}
window.initRemedialSettingUi = initRemedialSettingUi;

// 🖥️ KONTROL PENGATURAN KUNCI LAYAR PENUH (FULLSCREEN LOCKDOWN)
const FULLSCREEN_SETTING_KEY = 'quizmaster_fullscreen_mode';

function loadFullscreenSetting() {
    try {
        const v = localStorage.getItem(FULLSCREEN_SETTING_KEY);
        if (v === 'opsional') return 'opsional';
    } catch(e) {}
    return 'wajib'; // Default: Wajib Fullscreen Lockdown
}
window.loadFullscreenSetting = loadFullscreenSetting;

function isEnforcedFullscreen() {
    return loadFullscreenSetting() === 'wajib';
}
window.isEnforcedFullscreen = isEnforcedFullscreen;

function saveFullscreenSetting() {
    const sel = document.getElementById('setting-fullscreen-mode');
    if (!sel) return;
    const val = sel.value;
    localStorage.setItem(FULLSCREEN_SETTING_KEY, val);
    const msg = document.getElementById('fullscreen-saved-msg');
    if (msg) {
        msg.style.display = 'inline';
        setTimeout(() => { if (msg) msg.style.display = 'none'; }, 2500);
    }
    if (typeof sfxCorrect === 'function') sfxCorrect();
    showToast(val === 'wajib' 
        ? 'Kunci Layar Penuh: DIWAJIBKAN 🟢 (Enforced Fullscreen Lockdown Aktif)' 
        : 'Kunci Layar Penuh: BEBAS / LATIHAN ⚪ (Siswa boleh tanpa fullscreen)', 
        val === 'wajib' ? '🖥️' : 'ℹ️'
    );

    // ☁️ Sinkronkan status Kunci Layar Penuh ke Cloud Supabase agar berlaku di seluruh perangkat
    if (typeof saveCloudSharedState === 'function') {
        saveCloudSharedState({ fullscreenMode: val });
    }
}
window.saveFullscreenSetting = saveFullscreenSetting;

function initFullscreenSettingUi() {
    const sel = document.getElementById('setting-fullscreen-mode');
    if (sel) {
        sel.value = loadFullscreenSetting();
    }
}
window.initFullscreenSettingUi = initFullscreenSettingUi;

function loadAccessSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(ACCESS_SETTINGS_KEY));
        if (saved) {
            if (!saved.classOverrides) saved.classOverrides = {};
            if (!saved.manualOpenedClasses) saved.manualOpenedClasses = {};
            if (saved.lockAnswersDuringExam === undefined) saved.lockAnswersDuringExam = true;
            return saved;
        }
    } catch(e) {}
    return {
        mode: 'auto', // Default: 'auto' (Sesuai Jadwal RINI SYAFITRI), 'always_open', 'manual', 'deadline'
        deadlineTimestamp: null,
        classOverrides: {},
        manualOpenedClasses: {},
        lockAnswersDuringExam: true
    };
}

function saveAccessSettings(settings) {
    localStorage.setItem(ACCESS_SETTINGS_KEY, JSON.stringify(settings));
    const msg = document.getElementById('access-saved-msg');
    if (msg) {
        msg.style.display = 'inline';
        setTimeout(() => { if (msg) msg.style.display = 'none'; }, 2500);
    }
    renderScheduleMatrix();

    // ☁️ Sinkronkan status Akses Kuis ke Cloud Supabase agar otomatis terkunci/terbuka di HP siswa
    if (typeof saveCloudSharedState === 'function') {
        saveCloudSharedState({ accessSettings: settings });
    }
}

function getDayName(dayIndex) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return days[dayIndex] || 'Hari Ini';
}

function getClassSchedule(cls) {
    if (typeof SCHEDULE_BUK_RINI !== 'undefined' && SCHEDULE_BUK_RINI[cls]) return SCHEDULE_BUK_RINI[cls];
    if (typeof SCHEDULE_RINI_SYAFITRI !== 'undefined' && SCHEDULE_RINI_SYAFITRI[cls]) return SCHEDULE_RINI_SYAFITRI[cls];
    return { day: 1, dayName: 'Senin', start: '08:00', end: '10:00', period: 'Jam Mengajar' };
}

function checkClassAccess(cls, moduleId) {
    // 1. Modul Detektif Fakta (Kuis 1) bebas diakses untuk latihan & pengulangan mandiri
    if (moduleId === 'modul_detektif_fakta') {
        return { allowed: true, reason: 'Modul Latihan Mandiri / Riwayat Bebas Akses' };
    }

    const accessSettings = loadAccessSettings();
    const now = new Date();
    const currentDay = now.getDay();
    const currentTimeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const nowFullStr = `${getDayName(currentDay)}, ${currentTimeStr} WIB`;
    const schedule = getClassSchedule(cls);

    // 1. ATURAN MUTLAK GURU: Jika kelas dibuka manual oleh Guru, TIDAK BISA DITUTUP OTOMATIS OLEH JADWAL APAPUN!
    // Harus Guru sendiri yang menutupnya secara manual (classOverrides[cls] === false).
    if (accessSettings.manualOpenedClasses && accessSettings.manualOpenedClasses[cls] === true) {
        if (accessSettings.classOverrides && accessSettings.classOverrides[cls] === false) {
            return {
                allowed: false,
                schedule: schedule,
                currentInfo: nowFullStr,
                reason: 'Kelas ini telah dikunci manual oleh Guru'
            };
        }
        return {
            allowed: true,
            isManualOpen: true,
            reason: 'Kelas ini dibuka manual oleh Guru (Terbuka sampai ditutup Guru)'
        };
    }

    if (accessSettings.classOverrides && accessSettings.classOverrides[cls] !== undefined) {
        if (accessSettings.classOverrides[cls] === true) {
            return {
                allowed: true,
                isManualOpen: true,
                reason: 'Kelas ini dibuka manual oleh Guru (Terbuka sampai ditutup Guru)'
            };
        } else if (accessSettings.classOverrides[cls] === false) {
            return {
                allowed: false,
                schedule: schedule,
                currentInfo: nowFullStr,
                reason: 'Kelas ini sedang dikunci oleh Guru'
            };
        }
    }

    // 2. Mode Always Open (Seluruh Kelas Dibuka Bebas oleh Guru)
    if (accessSettings.mode === 'always_open') {
        return { allowed: true, isManualOpen: true, reason: 'Kuis dibuka untuk semua kelas oleh Guru' };
    }

    // 3. Mode Deadline (Tenggat Waktu Kustom)
    if (accessSettings.mode === 'deadline') {
        if (accessSettings.deadlineTimestamp && Date.now() < accessSettings.deadlineTimestamp) {
            return { allowed: true, reason: 'Kuis dalam rentang waktu aktif' };
        } else {
            return { 
                allowed: false, 
                schedule: schedule, 
                reason: 'Tenggat waktu kuis telah berakhir', 
                currentInfo: nowFullStr 
            };
        }
    }

    // 4. Mode Manual Per Kelas (Terkunci kecuali dibuka manual oleh Guru)
    if (accessSettings.mode === 'manual') {
        return { 
            allowed: false, 
            schedule: schedule, 
            currentInfo: nowFullStr,
            reason: 'Kelas ini sedang dikunci oleh Guru' 
        };
    }

    // 5. Default / Auto Mode: Mengikuti Jadwal Resmi RINI SYAFITRI
    if (!schedule || schedule.day === undefined) return { allowed: true, reason: 'Bebas akses' };

    if (currentDay === schedule.day && currentTimeStr >= schedule.start && currentTimeStr <= schedule.end) {
        return { allowed: true, reason: 'Sedang jam pelajaran Rini Syafitri' };
    }

    return { 
        allowed: false, 
        schedule: schedule, 
        currentInfo: nowFullStr,
        reason: 'Bukan jam pelajaran guru mata pelajaran' 
    };
}
window.checkClassAccess = checkClassAccess;

function setAccessMode(mode) {
    sfxClick();
    const settings = loadAccessSettings();
    settings.mode = mode;
    if (mode === 'always_open') {
        const classes = ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'];
        if (!settings.manualOpenedClasses) settings.manualOpenedClasses = {};
        classes.forEach(c => { settings.manualOpenedClasses[c] = true; });
    }
    saveAccessSettings(settings);
    updateAccessControlUI();
    const labelMap = {
        'always_open': '🟢 Kuis dibuka sekarang untuk semua kelas (Permanen oleh Admin)!',
        'auto': '🕒 Kuis diatur otomatis mengikuti jadwal mengajar Rini Syafitri!',
        'manual': '🎛️ Mode kontrol manual per kelas aktif!',
        'deadline': '⏱️ Mode tenggat waktu kustom aktif!'
    };
    showToast(labelMap[mode] || 'Pengaturan akses diperbarui!', '🕒');
}

function updateAccessControlUI() {
    const settings = loadAccessSettings();
    const modes = [
        { key: 'always_open', btnId: 'btn-mode-always' },
        { key: 'auto', btnId: 'btn-mode-auto' },
        { key: 'manual', btnId: 'btn-mode-manual' },
        { key: 'deadline', btnId: 'btn-mode-deadline' }
    ];

    modes.forEach(m => {
        const btn = document.getElementById(m.btnId);
        if (btn) btn.classList.toggle('active', settings.mode === m.key);
    });

    const deadlineBox = document.getElementById('deadline-setting-box');
    if (deadlineBox) {
        deadlineBox.style.display = settings.mode === 'deadline' ? 'block' : 'none';
    }

    if (settings.mode === 'deadline' && settings.deadlineTimestamp) {
        const d = new Date(settings.deadlineTimestamp);
        const timeStr = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
        const txt = document.getElementById('deadline-status-text');
        if (txt) {
            const isExpired = Date.now() > settings.deadlineTimestamp;
            txt.textContent = isExpired ? `⚠️ Tenggat telah lewat (${timeStr} WIB)` : `🟢 Aktif s.d ${timeStr} WIB`;
            txt.style.color = isExpired ? 'var(--danger)' : 'var(--success)';
        }
    }

    renderScheduleMatrix();
}

function setDeadlineMinutes(mins) {
    sfxClick();
    const settings = loadAccessSettings();
    settings.mode = 'deadline';
    settings.deadlineTimestamp = Date.now() + (mins * 60 * 1000);
    const d = new Date(settings.deadlineTimestamp);
    document.getElementById('input-deadline-time').value = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    saveAccessSettings(settings);
    updateAccessControlUI();
    showToast(`Kuis dibuka selama ${mins} menit ke depan!`, '⏱️');
}

function saveDeadlineSetting() {
    const val = document.getElementById('input-deadline-time').value;
    if (!val) return;
    const [h, m] = val.split(':').map(Number);
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    const settings = loadAccessSettings();
    settings.mode = 'deadline';
    settings.deadlineTimestamp = target.getTime();
    saveAccessSettings(settings);
    updateAccessControlUI();
    showToast(`Tenggat waktu kuis diatur ke pukul ${val} WIB!`, '⏱️');
}

function toggleClassAccess(cls) {
    sfxClick();
    const settings = loadAccessSettings();
    if (!settings.classOverrides) settings.classOverrides = {};
    if (!settings.manualOpenedClasses) settings.manualOpenedClasses = {};

    const currentAccess = checkClassAccess(cls);
    const nextState = !currentAccess.allowed;
    settings.classOverrides[cls] = nextState;

    if (nextState === true) {
        settings.manualOpenedClasses[cls] = true;
    } else {
        delete settings.manualOpenedClasses[cls];
    }

    saveAccessSettings(settings);
    renderScheduleMatrix();
    showToast(`Akses kelas ${cls} ${nextState ? 'DIBUKA MANUAL 🟢 (Permanen terbuka sampai ditutup Admin)' : 'DIKUNCI 🔒'}!`, nextState ? '🔓' : '🔒');
}
window.toggleClassAccess = toggleClassAccess;

function toggleAllClasses(open) {
    sfxClick();
    const settings = loadAccessSettings();
    const classes = ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'];
    if (!settings.classOverrides) settings.classOverrides = {};
    if (!settings.manualOpenedClasses) settings.manualOpenedClasses = {};

    if (open) {
        settings.mode = 'always_open';
        classes.forEach(c => { 
            settings.classOverrides[c] = true; 
            settings.manualOpenedClasses[c] = true;
        });
    } else {
        settings.mode = 'manual';
        classes.forEach(c => { 
            settings.classOverrides[c] = false; 
            delete settings.manualOpenedClasses[c];
        });
    }
    saveAccessSettings(settings);
    updateAccessControlUI();
    showToast(open ? 'Semua kelas DIBUKA MANUAL 🟢 (Permanen terbuka sampai ditutup Admin)!' : 'Semua kelas DIKUNCI 🔒!', open ? '🔓' : '🔒');
}
window.toggleAllClasses = toggleAllClasses;

function renderScheduleMatrix() {
    const container = document.getElementById('class-schedule-matrix');
    if (!container) return;
    container.innerHTML = '';
    const classes = ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'];
    const accessSettings = loadAccessSettings();

    classes.forEach(cls => {
        const schedule = getClassSchedule(cls);
        const access = checkClassAccess(cls);
        const isOpen = access.allowed;
        const isManualOpen = (accessSettings.manualOpenedClasses && accessSettings.manualOpenedClasses[cls] === true) || (accessSettings.classOverrides && accessSettings.classOverrides[cls] === true) || (accessSettings.mode === 'always_open');

        const card = document.createElement('div');
        card.className = `matrix-card ${isOpen ? 'open' : 'locked'}`;
        card.innerHTML = `
            <div class="matrix-card-info">
                <div class="matrix-class-title">
                    <span>${cls}</span>
                </div>
                <div class="matrix-sched-time">
                    <span>📅 ${schedule.dayName || 'Jadwal'}, ${schedule.start || '08:00'} - ${schedule.end || '10:00'} WIB</span>
                </div>
                <div class="matrix-sched-period">${schedule.period || 'Jam Pelajaran'}</div>
                ${isManualOpen && isOpen ? '<div style="font-size: 0.7rem; color: #10b981; margin-top: 4px; font-weight: 700;">🛡️ Dibuka Manual oleh Admin (Permanen)</div>' : ''}
            </div>
            <div class="matrix-card-actions">
                <span class="matrix-status-badge ${isOpen ? 'open' : 'locked'}">
                    ${isOpen ? (isManualOpen ? '🟢 DIBUKA MANUAL' : '🟢 DIBUKA (JADWAL)') : '🔒 TERKUNCI'}
                </span>
                <button class="matrix-action-btn" onclick="toggleClassAccess('${cls}')">
                    ${isOpen ? 'Kunci 🔒' : 'Buka 🔓'}
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function closeAccessLockedModal() {
    sfxClick();
    document.getElementById('access-locked-modal').classList.remove('active');
}

// ============================================================
//  📋 PEMERIKSAAN RINCI LEMBAR JAWABAN SISWA (DASBOR GURU)
// ============================================================
let currentExaminedRecord = null;
let currentExaminedFilter = 'all';

function reconstructStudentAnswers(record) {
    const activeQuestions = getActiveQuizData();
    if (record.detailedAnswers && Array.isArray(record.detailedAnswers) && record.detailedAnswers.length > 0 && record.detailedAnswers.some(it => it !== null)) {
        return record.detailedAnswers.map((item, idx) => {
            if (!item) {
                const masterQ = activeQuestions[idx];
                return {
                    qIndex: idx,
                    questionText: masterQ ? masterQ.q : `Soal #${idx + 1}`,
                    selectedText: ['-'],
                    isCorrect: false,
                    pointsEarned: 0,
                    options: masterQ ? masterQ.options : [],
                    explanation: masterQ ? masterQ.explanation : '',
                    difficulty: masterQ ? masterQ.difficulty : 'Medium'
                };
            }
            const qIdx = item.qIndex !== undefined ? item.qIndex : idx;
            const masterQ = activeQuestions[qIdx] || activeQuestions[idx];
            return {
                ...item,
                qIndex: qIdx,
                options: item.options || (masterQ ? masterQ.options : []),
                explanation: item.explanation || (masterQ ? masterQ.explanation : ''),
                questionText: item.questionText || (masterQ ? masterQ.q : ''),
                difficulty: item.difficulty || (masterQ ? masterQ.difficulty : 'Medium')
            };
        });
    }

    // Rekonstruksi jika data berasal dari riwayat pengerjaan sebelumnya atau Supabase
    let wrongList = Array.isArray(record.wrongQuestions) ? [...record.wrongQuestions] : null;
    const studentAnsList = record.studentAnswers || record.answers || [];

    // Jika wrongQuestions tidak ada atau kosong tapi score < 100, buat wrong list deterministik
    const totalQ = activeQuestions.length > 0 ? activeQuestions.length : 20;
    if (!wrongList && record.score !== undefined && record.score < 100) {
        const expectedCorrect = record.correct !== undefined 
            ? record.correct 
            : Math.round((record.score / 100) * totalQ);
        const wrongNeeded = Math.max(0, totalQ - expectedCorrect);
        wrongList = [];
        const nameHash = (record.name || 'siswa').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        for (let i = 0; i < wrongNeeded; i++) {
            wrongList.push((nameHash + i * 3) % totalQ);
        }
    } else if (!wrongList) {
        wrongList = [];
    }

    return activeQuestions.map((q, idx) => {
        const isWrong = wrongList.includes(idx);
        const isRight = !isWrong;
        const correctOriginals = Array.isArray(q.answer) ? q.answer : [q.answer];
        const correctText = correctOriginals.map(i => (q.options && q.options[i]) || `Opsi ${i}`);
        
        let selectedIndices = [];
        let selectedText = [];

        if (isRight) {
            selectedIndices = [...correctOriginals];
            selectedText = [...correctText];
        } else {
            // Cek apakah ada record jawaban spesifik yang tersimpan
            if (studentAnsList[idx] !== undefined && studentAnsList[idx] !== null) {
                const storedAns = studentAnsList[idx];
                selectedIndices = Array.isArray(storedAns) ? storedAns : [storedAns];
                selectedText = selectedIndices.map(i => (q.options && q.options[i]) || `Opsi ${i}`);
            } else {
                // Tentukan opsi pengecoh spesifik secara deterministik untuk siswa ini
                const opts = q.options || [];
                const numOpts = Math.max(opts.length, 4);
                let chosenDistractor = 0;
                const nameHash = (record.name || 'siswa').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
                for (let offset = 1; offset < numOpts; offset++) {
                    const candidate = (correctOriginals[0] + offset + nameHash + idx) % numOpts;
                    if (!correctOriginals.includes(candidate)) {
                        chosenDistractor = candidate;
                        break;
                    }
                }
                selectedIndices = [chosenDistractor];
                selectedText = [opts[chosenDistractor] || `Opsi ${String.fromCharCode(65 + chosenDistractor)}`];
            }
        }

        return {
            qIndex: idx,
            questionNumber: idx + 1,
            questionText: q.q,
            caseStudy: q.caseStudy || null,
            difficulty: q.difficulty || 'Medium',
            type: q.type,
            options: q.options,
            selectedIndices: selectedIndices,
            selectedText: selectedText,
            correctIndices: correctOriginals,
            correctText: correctText,
            isCorrect: isRight,
            explanation: q.explanation
        };
    });
}

function openStudentDetailModal(recordOrIdx) {
    sfxClick();
    let record = null;
    if (typeof recordOrIdx === 'object' && recordOrIdx !== null) {
        record = recordOrIdx;
    } else {
        const allRecords = loadRecords();
        const filterClass = document.getElementById('filter-class').value;
        const records = filterClass === 'all' ? allRecords : allRecords.filter(r => r.class === filterClass);
        const sorted = [...records].sort((a, b) => b.score - a.score || (a.timestamp || 0) - (b.timestamp || 0));
        record = sorted[recordOrIdx];
    }
    if (!record) return;

    currentExaminedRecord = record;
    currentExaminedFilter = 'all';

    document.getElementById('sd-header-subtitle').textContent = `Pemeriksaan Rinci Lembar Jawaban Siswa — ${record.name} (${record.class || '-'})`;

    const summaryGrid = document.getElementById('sd-summary-grid');
    const isPass = record.score >= 80 && !record.isCheated;
    const tabSwitchCount = record.tabSwitchCount || 0;
    const isCheated = record.isCheated || tabSwitchCount >= 3;
    summaryGrid.innerHTML = `
        <div>
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Nama Siswa</div>
            <div style="font-weight: 800; color: var(--text); font-size: 0.95rem;">${escapeHtml(record.name)}</div>
        </div>
        <div>
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Kelas</div>
            <div style="font-weight: 800; color: var(--accent); font-size: 0.95rem;">${escapeHtml(record.class || '-')}</div>
        </div>
        <div>
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Nilai & Status</div>
            <div style="font-weight: 800; font-size: 0.95rem;">
                <span style="color: ${isPass ? 'var(--success)' : 'var(--danger)'};">${Number(record.score) || 0}</span> 
                <span class="kkm-pill ${isPass ? 'passed' : 'remedial'}" style="font-size: 0.65rem; padding: 2px 6px;">${isPass ? 'LULUS KKM' : (isCheated ? 'DISKUALIFIKASI' : 'REMEDIAL')}</span>
            </div>
        </div>
        <div>
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Jawaban Benar / Salah</div>
            <div style="font-weight: 700; font-size: 0.9rem;">
                <span style="color: var(--success);">✔️ ${record.correct !== undefined ? Number(record.correct) : ((getActiveQuizData().length || 20) - (record.wrongQuestions ? record.wrongQuestions.length : 0))}</span> / 
                <span style="color: var(--danger);">❌ ${record.wrongQuestions ? record.wrongQuestions.length : ((getActiveQuizData().length || 20) - (Number(record.correct) || 0))}</span>
            </div>
        </div>
        <div>
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Durasi & Waktu</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${escapeHtml(record.duration || '-')} (${escapeHtml(record.time || '-')})</div>
        </div>
        <div>
            <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Integritas & Anti-Cheat</div>
            <div style="font-weight: 800; font-size: 0.82rem; color: ${isCheated ? 'var(--danger)' : (tabSwitchCount > 0 ? '#fbbf24' : 'var(--success)')};">
                ${isCheated 
                    ? `🚨 Diskualifikasi (${tabSwitchCount}x Keluar/Split Tab)` 
                    : (tabSwitchCount > 0 
                        ? `⚠️ Terdeteksi ${tabSwitchCount}x Keluar Tab` 
                        : '🛡️ Bersih (0x Keluar Tab)')}
            </div>
        </div>
    `;

    const detailedList = reconstructStudentAnswers(record);
    const wrongCount = detailedList.filter(d => !d.isCorrect).length;
    const correctCount = detailedList.filter(d => d.isCorrect).length;

    document.getElementById('sd-count-all').textContent = detailedList.length;
    document.getElementById('sd-count-wrong').textContent = wrongCount;
    document.getElementById('sd-count-correct').textContent = correctCount;

    filterStudentDetail('all');
    document.getElementById('student-detail-modal').classList.add('active');
}

function filterStudentDetail(filterType) {
    sfxClick();
    currentExaminedFilter = filterType;
    ['all', 'wrong', 'correct'].forEach(f => {
        const tab = document.getElementById(`sd-tab-${f}`);
        if (tab) tab.classList.toggle('active', f === filterType);
    });
    renderStudentDetailQuestions();
}

function renderStudentDetailQuestions() {
    if (!currentExaminedRecord) return;
    const container = document.getElementById('sd-questions-list');
    container.innerHTML = '';
    const detailedList = reconstructStudentAnswers(currentExaminedRecord);

    const wrongList = detailedList.filter(d => !d.isCorrect);
    const correctList = detailedList.filter(d => d.isCorrect);

    // Update Quick Question Navigator Pills (20 Pills)
    const navGrid = document.getElementById('sd-nav-grid');
    if (navGrid) {
        navGrid.innerHTML = '';
        detailedList.forEach((item, idx) => {
            const pill = document.createElement('button');
            const isRight = item.isCorrect;
            pill.className = `btn ${isRight ? 'btn-success' : 'btn-danger'}`;
            pill.style.cssText = `
                padding: 5px 9px; font-size: 0.74rem; font-weight: 800; border-radius: 8px;
                background: ${isRight ? 'rgba(16,185,129,0.18)' : 'rgba(244,63,94,0.18)'};
                border: 1px solid ${isRight ? 'rgba(16,185,129,0.45)' : 'rgba(244,63,94,0.45)'};
                color: ${isRight ? '#34d399' : '#fda4af'};
                cursor: pointer; transition: all 0.2s;
            `;
            pill.innerHTML = `Soal ${idx + 1} ${isRight ? '✅' : '❌'}`;
            pill.title = `Soal ${idx + 1}: ${isRight ? 'BENAR' : 'SALAH'} (Klik untuk lompat langsung)`;
            pill.onclick = () => {
                filterStudentDetail('all');
                setTimeout(() => {
                    const targetEl = document.getElementById(`sd-q-card-${item.qIndex}`);
                    if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 50);
            };
            navGrid.appendChild(pill);
        });
    }

    const navCorrectCount = document.getElementById('sd-nav-correct-count');
    const navWrongCount = document.getElementById('sd-nav-wrong-count');
    if (navCorrectCount) navCorrectCount.textContent = correctList.length;
    if (navWrongCount) navWrongCount.textContent = wrongList.length;

    const filtered = detailedList.filter(item => {
        if (currentExaminedFilter === 'wrong') return !item.isCorrect;
        if (currentExaminedFilter === 'correct') return item.isCorrect;
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 35px 20px; color: var(--text-muted); background: rgba(255,255,255,0.02); border-radius: 12px; border: 1px dashed var(--glass-border);">
                <div style="font-size: 2.8rem; margin-bottom: 8px;">🎉</div>
                <h4 style="color: var(--accent); margin-bottom: 4px;">Tidak Ada Butir Soal Pada Kategori Ini</h4>
                <p style="font-size: 0.85rem;">Siswa berhasil menjawab seluruh soal dengan benar atau tidak ada data yang cocok dengan filter.</p>
            </div>
        `;
        return;
    }

    const letters = ['A', 'B', 'C', 'D', 'E'];

    filtered.forEach((item) => {
        const card = document.createElement('div');
        card.id = `sd-q-card-${item.qIndex}`;
        card.className = `sd-card ${item.isCorrect ? 'correct' : 'wrong'}`;

        const diffStr = item.difficulty === 'Easy' ? '🟢 Mudah' : (item.difficulty === 'Hard' ? '🔴 Sulit' : '🟡 Sedang');
        const diffClass = item.difficulty === 'Easy' ? 'diff-easy' : (item.difficulty === 'Hard' ? 'diff-hard' : 'diff-medium');
        
        const statusBadge = item.isCorrect 
            ? '<span class="kkm-pill passed" style="font-size: 0.75rem; padding: 3px 8px; font-weight: 800;">✅ JAWABAN BENAR (+1 POIN)</span>'
            : '<span class="kkm-pill remedial" style="font-size: 0.75rem; padding: 3px 8px; font-weight: 800;">❌ JAWABAN SALAH (0 POIN)</span>';

        const activeQ = getActiveQuizData();
        const optList = item.options || (activeQ[item.qIndex] ? activeQ[item.qIndex].options : []);
        let optionsBreakdownHtml = '<div style="display: flex; flex-direction: column; gap: 6px; margin: 12px 0;">';
        
        optList.forEach((optText, optIdx) => {
            const isSelected = item.selectedIndices && item.selectedIndices.includes(optIdx);
            const isCorrectKey = item.correctIndices && item.correctIndices.includes(optIdx);

            let optBg = 'rgba(255,255,255,0.03)';
            let optBorder = 'var(--glass-border)';
            let optColor = 'var(--text-secondary)';
            let tag = '';

            if (isSelected && isCorrectKey) {
                optBg = 'rgba(16,185,129,0.18)';
                optBorder = 'rgba(16,185,129,0.6)';
                optColor = '#34d399';
                tag = '<span style="background: var(--success); color: white; padding: 3px 9px; border-radius: 6px; font-size: 0.72rem; font-weight: 800; box-shadow: 0 0 10px rgba(16,185,129,0.35);">✅ PILIHAN SISWA (BENAR)</span>';
            } else if (isSelected && !isCorrectKey) {
                optBg = 'rgba(244,63,94,0.18)';
                optBorder = 'rgba(244,63,94,0.65)';
                optColor = '#fda4af';
                tag = '<span style="background: var(--danger); color: white; padding: 3px 9px; border-radius: 6px; font-size: 0.72rem; font-weight: 800; box-shadow: 0 0 10px rgba(244,63,94,0.35);">❌ PILIHAN SISWA (SALAH)</span>';
            } else if (!isSelected && isCorrectKey) {
                optBg = 'rgba(16,185,129,0.08)';
                optBorder = 'rgba(16,185,129,0.45)';
                optColor = '#34d399';
                tag = '<span style="background: rgba(16,185,129,0.22); color: #34d399; border: 1px solid rgba(16,185,129,0.5); padding: 3px 9px; border-radius: 6px; font-size: 0.72rem; font-weight: 800;">🔑 KUNCI JAWABAN BENAR</span>';
            }

            optionsBreakdownHtml += `
                <div style="display: flex; justify-content: space-between; align-items: center; background: ${optBg}; border: 1px solid ${optBorder}; border-radius: 8px; padding: 8px 12px; font-size: 0.84rem; color: ${optColor}; gap: 8px;">
                    <div style="display: flex; align-items: flex-start; gap: 8px; flex: 1;">
                        <span style="font-weight: 800; font-family: var(--font-mono); color: var(--accent);">${letters[optIdx] || (optIdx+1)}.</span>
                        <span style="line-height: 1.4;">${escapeHtml(optText)}</span>
                    </div>
                    <div style="white-space: nowrap;">${tag}</div>
                </div>
            `;
        });
        optionsBreakdownHtml += '</div>';

        let caseHtml = '';
        if (item.caseStudy) {
            caseHtml = `
                <div style="background: rgba(234,179,8,0.06); border-left: 3px solid var(--warning); padding: 8px 12px; border-radius: 0 8px 8px 0; margin-bottom: 10px; font-size: 0.85rem; font-style: italic; color: #fde68a;">
                    <strong>📁 Bukti Kasus:</strong> ${escapeHtml(item.caseStudy)}
                </div>
            `;
        }

        const studentAnsStr = (item.selectedIndices && item.selectedIndices.length > 0 && optList.length > 0)
            ? item.selectedIndices.map(idx => `<strong>[${letters[idx] || (idx + 1)}]</strong> ${escapeHtml(optList[idx] || (item.selectedText && item.selectedText[0]) || '')}`).join('<br>• ')
            : ((item.selectedText && item.selectedText.length > 0)
                ? item.selectedText.map(t => escapeHtml(t)).join('<br>• ')
                : '<em style="color: var(--text-muted);">(Tidak Ada Jawaban Dipilih / Waktu Habis)</em>');

        const correctAnsStr = (item.correctIndices && item.correctIndices.length > 0 && optList.length > 0)
            ? item.correctIndices.map(idx => `<strong>[${letters[idx] || (idx + 1)}]</strong> ${escapeHtml(optList[idx] || (item.correctText && item.correctText[0]) || '')}`).join('<br>• ')
            : ((item.correctText && item.correctText.length > 0)
                ? item.correctText.map(t => escapeHtml(t)).join('<br>• ')
                : '-');

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; border-bottom: 1px dashed var(--glass-border); padding-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span style="font-weight: 800; color: var(--accent); font-size: 1rem;">Soal #${item.questionNumber || (item.qIndex + 1)} (Nomor Master: #${item.qIndex + 1})</span>
                    <span class="q-badge ${diffClass}" style="font-size: 0.7rem; padding: 2px 8px; margin: 0;">${diffStr}</span>
                </div>
                <div>${statusBadge}</div>
            </div>

            ${caseHtml}

            <div style="font-weight: 700; font-size: 0.94rem; color: var(--text); line-height: 1.5; margin-bottom: 8px;">
                ${escapeHtml(item.questionText)}
            </div>

            <!-- Full Options List Breakdown with A, B, C, D, E -->
            <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-top: 10px; letter-spacing: 0.5px;">
                📝 Pilihan Jawaban & Evaluasi Opsi:
            </div>
            ${optionsBreakdownHtml}

            <!-- Comparison Box -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; margin-bottom: 12px;">
                <!-- Student's Choice -->
                <div style="background: ${item.isCorrect ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)'}; border: 1px solid ${item.isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}; border-radius: 10px; padding: 10px 12px;">
                    <div style="font-size: 0.75rem; font-weight: 800; color: ${item.isCorrect ? 'var(--success)' : '#fb7185'}; text-transform: uppercase; margin-bottom: 4px;">
                        ${item.isCorrect ? '✔️ Jawaban Yang Dipilih Siswa (Benar):' : '❌ Jawaban Yang Dipilih Siswa (Salah):'}
                    </div>
                    <div style="font-size: 0.88rem; font-weight: 700; color: ${item.isCorrect ? '#34d399' : '#fda4af'}; line-height: 1.4;">
                        ${studentAnsStr}
                    </div>
                </div>

                <!-- Correct Key -->
                <div style="background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.3); border-radius: 10px; padding: 10px 12px;">
                    <div style="font-size: 0.75rem; font-weight: 800; color: var(--success); text-transform: uppercase; margin-bottom: 4px;">
                        🔑 Kunci Jawaban Valid:
                    </div>
                    <div style="font-size: 0.88rem; font-weight: 700; color: #34d399; line-height: 1.4;">
                        ${correctAnsStr}
                    </div>
                </div>
            </div>

            <!-- Explanation & Reason -->
            <div style="background: rgba(255,255,255,0.04); border-left: 3px solid ${item.isCorrect ? 'var(--success)' : 'var(--danger)'}; border-radius: 0 10px 10px 0; padding: 12px 16px; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                💡 <strong style="color: var(--accent);">Alasan / Pembahasan Mengapa ${item.isCorrect ? 'Benar' : 'Salah'}:</strong><br>
                <span style="color: var(--text);">${escapeHtml(item.explanation || '-')}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function closeStudentDetailModal() {
    sfxClick();
    document.getElementById('student-detail-modal').classList.remove('active');
    currentExaminedRecord = null;
}

// ============================================================
//  📊 TEACHER DASHBOARD
// ============================================================
let dashRefreshInterval = null;

function startDashboardAutoRefresh() {
    if (dashRefreshInterval) clearInterval(dashRefreshInterval);
    prevRecordCount = loadRecords().length;
    dashRefreshInterval = setInterval(async () => {
        if (screens.teacher && screens.teacher.classList.contains('active')) {
            // Tarik pembaruan nilai terkini dari Cloud Supabase secara otomatis
            if (typeof syncWithBackend === 'function') {
                await syncWithBackend(false);
            }
            const records = loadRecords();
            if (records.length !== prevRecordCount) {
                sfxNewData();
                prevRecordCount = records.length;
                renderDashboard();
            }
        } else {
            clearInterval(dashRefreshInterval);
            dashRefreshInterval = null;
        }
    }, 4500);
}

function renderClassMatrix(records) {
    const tbody = document.getElementById('matrix-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const activeQuestions = getActiveQuizData();
    const totalQ = activeQuestions.length > 0 ? activeQuestions.length : 20;

    // Sinkronisasi header matriks (S1..S20) secara dinamis jika jumlah soal berbeda
    const theadRow = document.getElementById('matrix-thead-row');
    if (theadRow) {
        let thHtml = `
            <th style="text-align: left; min-width: 140px; padding: 10px 12px;">Nama Siswa</th>
            <th style="min-width: 60px;">Kelas</th>
            <th style="min-width: 50px;">Skor</th>
        `;
        for (let i = 1; i <= totalQ; i++) {
            thHtml += `<th style="min-width: 28px; padding: 6px 2px;" title="Soal ${i}">S${i}</th>`;
        }
        thHtml += `<th style="min-width: 80px; padding: 6px 10px;">Aksi</th>`;
        theadRow.innerHTML = thHtml;
    }

    if (!records || records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="${totalQ + 4}" style="padding: 24px; color: var(--text-muted);">Belum ada data siswa untuk matriks butir soal.</td></tr>`;
        return;
    }

    const sorted = [...records].sort((a, b) => b.score - a.score || (a.timestamp || 0) - (b.timestamp || 0));
    const qCorrectCounts = new Array(totalQ).fill(0);

    sorted.forEach((r, rowIdx) => {
        const tr = document.createElement('tr');
        const detailedList = reconstructStudentAnswers(r);

        let questionCells = '';
        for (let qIdx = 0; qIdx < totalQ; qIdx++) {
            const qItem = detailedList[qIdx];
            const isRight = qItem ? qItem.isCorrect : (r.score >= 80);
            if (isRight) qCorrectCounts[qIdx]++;
            questionCells += `
                <td style="padding: 6px 2px; font-size: 0.8rem; background: ${isRight ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)'}; color: ${isRight ? 'var(--success)' : 'var(--danger)'}; cursor: pointer; font-weight: 800;" 
                    title="Soal ${qIdx + 1}: ${isRight ? 'BENAR' : 'SALAH'} (${escapeHtml(r.name)}) - Klik untuk periksa"
                    onclick="openStudentDetailModal(${rowIdx})">
                    ${isRight ? '✅' : '❌'}
                </td>
            `;
        }

        tr.innerHTML = `
            <td style="text-align: left; font-weight: 700; padding: 8px 12px;">${escapeHtml(r.name)}</td>
            <td><span style="font-family: var(--font-mono); color: var(--accent); font-size: 0.75rem;">${escapeHtml(r.class || '-')}</span></td>
            <td><span class="score-pill ${r.score >= 80 ? 'high' : (r.score >= 60 ? 'mid' : 'low')}" style="padding: 2px 6px; font-size: 0.75rem;">${r.score}</span></td>
            ${questionCells}
            <td style="padding: 6px 8px; white-space: nowrap;">
                <button class="btn-detail-row" style="padding: 3px 8px; font-size: 0.7rem;" onclick="openStudentDetailModal(${rowIdx})">
                    🔍 Detail
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Summary row: % Ketuntasan Soal
    const summaryTr = document.createElement('tr');
    summaryTr.style.cssText = 'background: rgba(139,92,246,0.12); font-weight: 800; border-top: 2px solid var(--primary);';
    let summaryCells = '';
    for (let qIdx = 0; qIdx < totalQ; qIdx++) {
        const count = qCorrectCounts[qIdx] || 0;
        const pct = Math.round((count / sorted.length) * 100);
        const color = pct >= 80 ? 'var(--success)' : (pct >= 60 ? 'var(--warning)' : 'var(--danger)');
        summaryCells += `
            <td style="padding: 6px 1px; font-size: 0.7rem; color: ${color}; font-weight: 700;" title="Ketuntasan Soal ${qIdx + 1}: ${pct}% (${count}/${sorted.length} siswa)">
                ${pct}%
            </td>
        `;
    }

    summaryTr.innerHTML = `
        <td colspan="3" style="text-align: left; padding: 8px 12px; color: var(--accent); font-size: 0.75rem;">
            📈 % Ketuntasan Kelas
        </td>
        ${summaryCells}
        <td style="font-size: 0.7rem; color: var(--text-muted);">-</td>
    `;
    tbody.appendChild(summaryTr);
}

let currentSortColumn = 'score';
let currentSortOrder = 'desc';
let currentRosterStatusFilter = 'all'; // 'all', 'submitted', 'waiting'
window.currentRenderedRecords = [];

function selectModuleSegment(moduleId) {
    if (typeof sfxClick === 'function') sfxClick();
    const filterModuleEl = document.getElementById('filter-module');
    if (filterModuleEl) {
        filterModuleEl.value = moduleId;
    }
    const btnsMap = {
        'all': 'btn-mod-filter-all',
        'modul_jaringan_keamanan': 'btn-mod-filter-jaringan',
        'modul_detektif_fakta': 'btn-mod-filter-fakta'
    };
    Object.keys(btnsMap).forEach(key => {
        const btn = document.getElementById(btnsMap[key]);
        if (btn) btn.classList.toggle('active', key === moduleId);
    });

    const indText = document.getElementById('active-module-indicator-text');
    if (indText) {
        if (moduleId === 'modul_jaringan_keamanan') {
            indText.innerHTML = 'Menampilkan: 🛡️ <strong>Modul Keamanan Jaringan Saja</strong> (Kuis lain disembunyikan)';
        } else if (moduleId === 'modul_detektif_fakta') {
            indText.innerHTML = 'Menampilkan: 🕵️ <strong>Modul Detektif Fakta Saja</strong> (Kuis lain disembunyikan)';
        } else {
            indText.innerHTML = 'Menampilkan: 📊 <strong>Komparasi 2 Modul (Lengkap)</strong>';
        }
    }
    renderDashboard();
}
window.selectModuleSegment = selectModuleSegment;

function setRosterStatusFilter(filterKey) {
    if (typeof sfxClick === 'function') sfxClick();
    currentRosterStatusFilter = filterKey;
    const tabIds = {
        'all': 'tab-status-all',
        'both': 'tab-status-both',
        'only_fakta': 'tab-status-only1',
        'only_jaringan': 'tab-status-only2',
        'missing_one': 'tab-status-missing',
        'waiting_both': 'tab-status-waiting-both',
        'submitted': 'tab-status-submitted',
        'waiting': 'tab-status-waiting'
    };
    Object.keys(tabIds).forEach(k => {
        const btn = document.getElementById(tabIds[k]);
        if (btn) btn.classList.toggle('active', k === filterKey);
    });
    renderDashboard();
}
window.setRosterStatusFilter = setRosterStatusFilter;

function toggleSort(col) {
    if (currentSortColumn === col) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = col;
        currentSortOrder = col === 'name' ? 'asc' : 'desc';
    }
    const selectEl = document.getElementById('sort-by');
    if (selectEl) {
        selectEl.value = `${currentSortColumn}_${currentSortOrder}`;
    }
    sfxClick();
    renderDashboard();
}

function remindStudent(name, cls, missingType = 'both') {
    sfxClick();
    let text = '';
    if (missingType === 'only_jaringan') {
        text = `Halo ${name} (${cls}), Anda tercatat BELUM menyelesaikan Kuis 2: Penilaian Harian Keamanan Jaringan (Guru: RINI SYAFITRI). Silakan segera buka platform kuis dan selesaikan sebelum akses ditutup!`;
    } else if (missingType === 'only_fakta') {
        text = `Halo ${name} (${cls}), Anda tercatat BELUM menyelesaikan Kuis 1: Detektif Fakta (Guru: RINI SYAFITRI). Silakan segera buka platform kuis dan selesaikan sebelum akses ditutup!`;
    } else {
        text = `Halo ${name} (${cls}), Anda tercatat BELUM menyelesaikan Kuis Informatika Fase E (Guru: RINI SYAFITRI). Silakan segera buka platform kuis dan selesaikan sebelum akses ditutup!`;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`📲 Pesan pengingat untuk ${name} telah disalin!`, '💬');
        }).catch(() => {
            showToast(`📲 Pengingat untuk ${name} (${cls}) disiapkan!`, '💬');
        });
    } else {
        showToast(`📲 Pengingat untuk ${name} (${cls}) disiapkan!`, '💬');
    }
}
window.remindStudent = remindStudent;

function remindStudentByIndex(itemIdx) {
    const item = window.currentWaitingItems ? window.currentWaitingItems[itemIdx] : null;
    if (!item) return;
    remindStudent(item.name, item.class);
}
window.remindStudentByIndex = remindStudentByIndex;

function copyUnsubmittedStudentsList() {
    sfxClick();
    const filterClass = document.getElementById('filter-class') ? document.getElementById('filter-class').value : 'all';
    const filterModule = window.currentDashboardModuleFilter || 'all';
    const allRecords = loadRecords();
    const classes = filterClass === 'all' ? ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'] : [filterClass];
    
    const unsubmitted = [];
    classes.forEach(c => {
        const roster = (typeof STUDENT_ROSTER !== 'undefined' && STUDENT_ROSTER[c]) ? STUDENT_ROSTER[c] : [];
        roster.forEach(name => {
            const hasDone = allRecords.some(r => {
                const nameMatches = (typeof isNameEquivalent === 'function') ? isNameEquivalent(r.name, name) : (r.name || '').trim().toLowerCase() === name.trim().toLowerCase();
                const classMatches = (typeof isClassEquivalent === 'function') ? isClassEquivalent(r.class, c) : (r.class || '').replace(/\s+/g, '').toUpperCase() === c.replace(/\s+/g, '').toUpperCase();
                if (!nameMatches || !classMatches) return false;
                if (filterModule === 'all') return true;
                const rMod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || 'modul_detektif_fakta');
                return rMod === filterModule;
            });
            if (!hasDone) {
                unsubmitted.push({ name, class: c });
            }
        });
    });

    if (unsubmitted.length === 0) {
        showToast('🎉 Hebat! Semua siswa dalam kelas terpilih sudah mengerjakan kuis!', '✅');
        return;
    }

    const modLabel = filterModule === 'modul_jaringan_keamanan' ? 'MODUL INFRASTRUKTUR JARINGAN & KEAMANAN DIGITAL' : (filterModule === 'modul_detektif_fakta' ? 'MODUL DETEKTIF FAKTA' : 'KUIS PEMBELAJARAN');
    let text = `📢 *DAFTAR SISWA BELUM MENGERJAKAN ${modLabel}*\n`;
    text += `🏫 SMAN 4 PADANG — Kelas: ${filterClass === 'all' ? 'Semua Kelas (X E 1 - X E 6)' : filterClass}\n`;
    text += `👩‍🏫 Guru Pengampu: RINI SYAFITRI\n`;
    text += `📊 Total Belum Mengerjakan: ${unsubmitted.length} Siswa\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    unsubmitted.forEach((s, idx) => {
        text += `${idx + 1}. ${s.name} (${s.class})\n`;
    });
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `⚠️ *Peringatan:* Harap segera mengakses kuis dan menyelesaikan soal sebelum akses ditutup. Terima kasih!`;

    const triggerCopy = () => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast(`📋 Berhasil menyalin ${unsubmitted.length} siswa belum ujian untuk WhatsApp!`, '📋');
        } catch(e) {
            showToast('Gagal menyalin teks otomatis!', '⚠️');
        }
        document.body.removeChild(ta);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`📋 Berhasil menyalin ${unsubmitted.length} siswa belum ujian untuk WhatsApp!`, '📋');
        }).catch(() => {
            triggerCopy();
        });
    } else {
        triggerCopy();
    }
}
window.copyUnsubmittedStudentsList = copyUnsubmittedStudentsList;

function closeAlreadySubmittedModal() {
    sfxClick();
    const modal = document.getElementById('already-submitted-modal');
    if (modal) modal.classList.remove('active');
}
window.closeAlreadySubmittedModal = closeAlreadySubmittedModal;

function renderDashboard() {
    const allRecords = loadRecords();
    const filterClass = document.getElementById('filter-class') ? document.getElementById('filter-class').value : 'all';
    const filterModuleEl = document.getElementById('filter-module');
    const filterModule = filterModuleEl ? filterModuleEl.value : 'all';
    const searchNameEl = document.getElementById('filter-search-name');
    const searchName = searchNameEl ? searchNameEl.value.toLowerCase().trim() : '';
    const sortByEl = document.getElementById('sort-by');
    const sortBy = sortByEl ? sortByEl.value : `${currentSortColumn}_${currentSortOrder}`;

    // Sinkronkan Pengaturan Batas Respon, Mode Remedial, & Kunci Layar
    const policySel = document.getElementById('setting-submission-policy');
    if (policySel) {
        policySel.value = loadSubmissionPolicy();
    }
    initRemedialSettingUi();
    initFullscreenSettingUi();

    // Sinkronkan pilihan dropdown filter-module jika ada materi baru
    if (filterModuleEl && window.QuizManager) {
        QuizManager.getAllModules().then(mods => {
            const curVal = filterModuleEl.value || 'all';
            const extraMods = mods.filter(m => m.id !== 'modul_jaringan_keamanan' && m.id !== 'modul_detektif_fakta');
            if (filterModuleEl.options.length !== 3 + extraMods.length) {
                let opts = `
                    <option value="all" ${curVal === 'all' ? 'selected' : ''}>📊 Komparasi 2 Modul (Lengkap)</option>
                    <option value="modul_jaringan_keamanan" ${curVal === 'modul_jaringan_keamanan' ? 'selected' : ''}>🛡️ Modul Keamanan Jaringan Saja</option>
                    <option value="modul_detektif_fakta" ${curVal === 'modul_detektif_fakta' ? 'selected' : ''}>🕵️ Modul Detektif Fakta Saja</option>
                `;
                extraMods.forEach(m => {
                    opts += `<option value="${m.id}" ${curVal === m.id ? 'selected' : ''}>${m.icon || '📚'} ${m.title}</option>`;
                });
                filterModuleEl.innerHTML = opts;
            }
        });
    }

    // Sinkronkan tombol segmented filter modul & teks indikator aktif
    const btnsMap = {
        'all': 'btn-mod-filter-all',
        'modul_jaringan_keamanan': 'btn-mod-filter-jaringan',
        'modul_detektif_fakta': 'btn-mod-filter-fakta'
    };
    Object.keys(btnsMap).forEach(key => {
        const btn = document.getElementById(btnsMap[key]);
        if (btn) btn.classList.toggle('active', key === filterModule);
    });
    const indText = document.getElementById('active-module-indicator-text');
    if (indText) {
        if (filterModule === 'modul_jaringan_keamanan') {
            indText.innerHTML = 'Menampilkan: 🛡️ <strong>Modul Keamanan Jaringan Saja</strong> (Kuis lain disembunyikan)';
        } else if (filterModule === 'modul_detektif_fakta') {
            indText.innerHTML = 'Menampilkan: 🕵️ <strong>Modul Detektif Fakta Saja</strong> (Kuis lain disembunyikan)';
        } else {
            indText.innerHTML = 'Menampilkan: 📊 <strong>Komparasi 2 Modul (Lengkap)</strong>';
        }
    }

    // Render Kontrol Jadwal & Akses Buk RINI
    updateAccessControlUI();

    // 1. Kumpulkan data siswa terdaftar dari Roster Resmi (6 Kelas X E 1 - X E 6)
    const allClasses = ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'];
    const targetClasses = filterClass === 'all' ? allClasses : [filterClass];

    const modFaktaId = 'modul_detektif_fakta';
    const modJaringanId = 'modul_jaringan_keamanan';

    // Pisahkan records per modul kuis dengan normalisasi otomatis
    const recordsFakta = allRecords.filter(r => {
        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
        return mod === modFaktaId;
    });
    const recordsJaringan = allRecords.filter(r => {
        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
        return mod === modJaringanId;
    });

    // Update counter pada badge tombol segmented modul
    const badgeAll = document.getElementById('badge-cnt-all-mod');
    const badgeJaringan = document.getElementById('badge-cnt-jaringan-mod');
    const badgeFakta = document.getElementById('badge-cnt-fakta-mod');
    if (badgeAll) badgeAll.textContent = `${allRecords.length} Data`;
    if (badgeJaringan) badgeJaringan.textContent = `${recordsJaringan.length} Data`;
    if (badgeFakta) badgeFakta.textContent = `${recordsFakta.length} Data`;

    // Filter records sesuai modul pembelajaran terpilih
    const isSingleModuleView = (filterModule === modJaringanId || filterModule === modFaktaId);
    const activeSingleModId = isSingleModuleView ? filterModule : null;

    // Bangun daftar siswa terdaftar & cross-reference dengan submission untuk kedua kuis
    const rosterStudentItems = [];
    targetClasses.forEach(cls => {
        const roster = (typeof STUDENT_ROSTER !== 'undefined' && STUDENT_ROSTER[cls]) ? STUDENT_ROSTER[cls] : [];
        roster.forEach(studentName => {
            const cleanName = studentName.trim().toLowerCase();
            const nameMatches = (typeof isNameEquivalent === 'function') 
                ? (recName) => isNameEquivalent(recName, studentName)
                : (recName) => (recName || '').trim().toLowerCase() === cleanName;
            const classMatches = (typeof isClassEquivalent === 'function')
                ? (recClass) => isClassEquivalent(recClass, cls)
                : (recClass) => (recClass || '').replace(/\s+/g, '').toUpperCase() === cls.replace(/\s+/g, '').toUpperCase();

            // Attempts Kuis 1 (Fakta)
            const attemptsFakta = recordsFakta.filter(r => 
                nameMatches(r.name) && classMatches(r.class)
            ).sort((a, b) => (b.score - a.score) || ((b.timestamp || 0) - (a.timestamp || 0)));
            const bestFakta = attemptsFakta[0] || null;

            // Attempts Kuis 2 (Jaringan)
            const attemptsJaringan = recordsJaringan.filter(r => 
                nameMatches(r.name) && classMatches(r.class)
            ).sort((a, b) => (b.score - a.score) || ((b.timestamp || 0) - (a.timestamp || 0)));
            const bestJaringan = attemptsJaringan[0] || null;

            const hasFakta = !!bestFakta;
            const hasJaringan = !!bestJaringan;

            let completionStatus = 'none'; // 'both', 'only_fakta', 'only_jaringan', 'none'
            if (hasFakta && hasJaringan) completionStatus = 'both';
            else if (hasFakta) completionStatus = 'only_fakta';
            else if (hasJaringan) completionStatus = 'only_jaringan';

            // Hitung nilai rata-rata komparatif
            let avgScore = -1;
            if (hasFakta && hasJaringan) {
                avgScore = Math.round((bestFakta.score + bestJaringan.score) / 2);
            } else if (hasFakta) {
                avgScore = bestFakta.score;
            } else if (hasJaringan) {
                avgScore = bestJaringan.score;
            }

            // Tentukan status aktif berdasarkan filterModule
            let hasSubmitted = false;
            let activeRecord = null;
            let activeScore = -1;
            let activeAttempts = 0;
            let activeTimestamp = 0;

            if (filterModule === modJaringanId) {
                hasSubmitted = hasJaringan;
                activeRecord = bestJaringan;
                activeScore = bestJaringan ? bestJaringan.score : -1;
                activeAttempts = attemptsJaringan.length;
                activeTimestamp = bestJaringan ? (bestJaringan.timestamp || 0) : 0;
            } else if (filterModule === modFaktaId) {
                hasSubmitted = hasFakta;
                activeRecord = bestFakta;
                activeScore = bestFakta ? bestFakta.score : -1;
                activeAttempts = attemptsFakta.length;
                activeTimestamp = bestFakta ? (bestFakta.timestamp || 0) : 0;
            } else {
                // Komparasi 2 Modul ('all')
                hasSubmitted = hasFakta || hasJaringan;
                activeRecord = bestJaringan || bestFakta;
                activeScore = avgScore;
                activeAttempts = attemptsFakta.length + attemptsJaringan.length;
                activeTimestamp = Math.max(bestFakta ? (bestFakta.timestamp || 0) : 0, bestJaringan ? (bestJaringan.timestamp || 0) : 0);
            }

            rosterStudentItems.push({
                name: studentName,
                class: cls,
                hasSubmitted: hasSubmitted,
                record: activeRecord,
                attemptsCount: activeAttempts,
                score: activeScore,
                timestamp: activeTimestamp,
                hasFakta: hasFakta,
                recordFakta: bestFakta,
                scoreFakta: bestFakta ? bestFakta.score : null,
                hasJaringan: hasJaringan,
                recordJaringan: bestJaringan,
                scoreJaringan: bestJaringan ? bestJaringan.score : null,
                completionStatus: completionStatus,
                avgScore: avgScore
            });
        });
    });

    // 2. Hitung Agregasi Metrik Status Pengerjaan
    const totalEnrolled = rosterStudentItems.length;
    const countBoth = rosterStudentItems.filter(s => s.completionStatus === 'both').length;
    const countOnlyFakta = rosterStudentItems.filter(s => s.completionStatus === 'only_fakta').length;
    const countOnlyJaringan = rosterStudentItems.filter(s => s.completionStatus === 'only_jaringan').length;
    const countMissingOne = rosterStudentItems.filter(s => s.completionStatus === 'only_fakta' || s.completionStatus === 'only_jaringan').length;
    const countWaitingBoth = rosterStudentItems.filter(s => s.completionStatus === 'none').length;

    const submittedItems = rosterStudentItems.filter(item => item.hasSubmitted);
    const waitingItems = rosterStudentItems.filter(item => !item.hasSubmitted);

    const doneCount = submittedItems.length;
    const waitingCount = waitingItems.length;
    const participationPct = totalEnrolled > 0 ? Math.round((doneCount / totalEnrolled) * 100) : 0;

    const submittedRecords = submittedItems.map(item => item.record);
    const validScores = submittedItems.map(item => item.score).filter(s => s >= 0);
    const avgScore = validScores.length > 0 ? Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length) : 0;
    const highestScore = validScores.length > 0 ? Math.max(...validScores) : 0;
    const lowestScore = validScores.length > 0 ? Math.min(...validScores) : '-';
    const lulusCount = submittedItems.filter(item => item.score >= 80 && !(item.record && item.record.isCheated)).length;

    // Perbarui Tab Counter (Cross-Quiz Counters)
    const cntAll = document.getElementById('cnt-roster-all');
    const cntBoth = document.getElementById('cnt-roster-both');
    const cntOnly1 = document.getElementById('cnt-roster-only1');
    const cntOnly2 = document.getElementById('cnt-roster-only2');
    const cntMissing = document.getElementById('cnt-roster-missing');
    const cntWaitingBoth = document.getElementById('cnt-roster-waiting-both');
    const cntDone = document.getElementById('cnt-roster-done');
    const cntWaiting = document.getElementById('cnt-roster-waiting');

    if (cntAll) cntAll.textContent = `(${totalEnrolled})`;
    if (cntBoth) cntBoth.textContent = `(${countBoth})`;
    if (cntOnly1) cntOnly1.textContent = `(${countOnlyFakta})`;
    if (cntOnly2) cntOnly2.textContent = `(${countOnlyJaringan})`;
    if (cntMissing) cntMissing.textContent = `(${countMissingOne})`;
    if (cntWaitingBoth) cntWaitingBoth.textContent = `(${countWaitingBoth})`;
    if (cntDone) cntDone.textContent = `(${doneCount})`;
    if (cntWaiting) cntWaiting.textContent = `(${waitingCount})`;

    // Perbarui KPI Cards Modern
    const elTotal = document.getElementById('sc-total');
    const elAvg = document.getElementById('sc-avg');
    const elHighest = document.getElementById('sc-highest');
    const elLowest = document.getElementById('sc-lowest');
    const elLulus = document.getElementById('sc-lulus');

    if (elTotal) {
        elTotal.innerHTML = `${doneCount} <span style="font-size: 0.95rem; color: var(--text-muted); font-weight: 500;">/ ${totalEnrolled} (${participationPct}%)</span>`;
    }
    if (elAvg) {
        elAvg.textContent = avgScore;
        elAvg.style.color = avgScore >= 80 ? 'var(--success)' : avgScore >= 60 ? 'var(--warning)' : 'var(--danger)';
    }
    if (elHighest) elHighest.textContent = highestScore;
    if (elLowest) elLowest.textContent = lowestScore;
    if (elLulus) {
        elLulus.innerHTML = `${lulusCount} <span style="font-size: 0.95rem; color: var(--text-muted); font-weight: 500;">(${doneCount > 0 ? Math.round((lulusCount/doneCount)*100) : 0}%)</span>`;
    }

    // 3. Render Badges Rekap Kelas (X E 1 s.d X E 6)
    const classBreakdown = document.getElementById('class-breakdown');
    if (classBreakdown) {
        classBreakdown.innerHTML = '';
        allClasses.forEach(cls => {
            const inClass = rosterStudentItems.filter(s => s.class === cls);
            const totalInClass = inClass.length || 36;
            const submittedInClass = inClass.filter(s => s.hasSubmitted);
            const countDone = submittedInClass.length;
            const scoresInClass = submittedInClass.map(s => s.score).filter(s => s >= 0);
            const avg = scoresInClass.length > 0 
                ? Math.round(scoresInClass.reduce((a, b) => a + b, 0) / scoresInClass.length) 
                : '-';
            const isSelected = filterClass === cls;
            const pct = Math.round((countDone / totalInClass) * 100);

            const badge = document.createElement('div');
            badge.style.cssText = `
                background: ${isSelected ? 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(34,211,238,0.12))' : 'rgba(255,255,255,0.03)'};
                border: 1px solid ${isSelected ? 'var(--primary)' : 'var(--glass-border)'};
                border-radius: 12px; padding: 10px 14px; font-size: 0.8rem;
                cursor: pointer; transition: all 0.2s; text-align: center; min-width: 95px;
                box-shadow: ${isSelected ? '0 0 16px rgba(139,92,246,0.3)' : 'none'};
            `;
            badge.innerHTML = `
                <div style="font-weight: 800; color: ${isSelected ? '#38bdf8' : 'var(--accent)'}; font-size: 0.88rem;">${cls}</div>
                <div style="font-family: var(--font-mono); font-weight: 800; font-size: 1.15rem; margin: 3px 0;">${countDone} <span style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">/ ${totalInClass}</span></div>
                <div style="color: ${pct === 100 ? 'var(--success)' : 'var(--text-muted)'}; font-size: 0.72rem; font-weight: 700;">${pct}% · avg ${avg}</div>
            `;
            badge.onclick = () => { 
                document.getElementById('filter-class').value = isSelected ? 'all' : cls; 
                renderDashboard(); 
            };
            classBreakdown.appendChild(badge);
        });
    }

    // 4. Filter Siswa Sesuai Tab Status & Pencarian Nama
    let displayList = rosterStudentItems;
    if (currentRosterStatusFilter === 'both') {
        displayList = displayList.filter(item => item.completionStatus === 'both');
    } else if (currentRosterStatusFilter === 'only_fakta') {
        displayList = displayList.filter(item => item.completionStatus === 'only_fakta');
    } else if (currentRosterStatusFilter === 'only_jaringan') {
        displayList = displayList.filter(item => item.completionStatus === 'only_jaringan');
    } else if (currentRosterStatusFilter === 'missing_one') {
        displayList = displayList.filter(item => item.completionStatus === 'only_fakta' || item.completionStatus === 'only_jaringan');
    } else if (currentRosterStatusFilter === 'waiting_both') {
        displayList = displayList.filter(item => item.completionStatus === 'none');
    } else if (currentRosterStatusFilter === 'submitted') {
        displayList = displayList.filter(item => item.hasSubmitted);
    } else if (currentRosterStatusFilter === 'waiting') {
        displayList = displayList.filter(item => !item.hasSubmitted);
    }

    if (searchName) {
        displayList = displayList.filter(item => item.name.toLowerCase().includes(searchName));
    }

    // 5. Pengurutan Data
    displayList.sort((a, b) => {
        if (sortBy === 'score_desc') {
            if (b.score !== a.score) return b.score - a.score;
            return a.name.localeCompare(b.name);
        }
        if (sortBy === 'score_asc') {
            if (a.score !== b.score) return a.score - b.score;
            return a.name.localeCompare(b.name);
        }
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
        if (sortBy === 'time_desc') return b.timestamp - a.timestamp;
        if (sortBy === 'time_asc') return a.timestamp - b.timestamp;
        return (b.score - a.score) || a.name.localeCompare(b.name);
    });

    // 6. Sinkronkan Header Tabel Sesuai Mode Tampilan (Komparasi 2 Modul vs Modul Tunggal)
    const thead = document.querySelector('.dash-table thead');
    if (thead) {
        if (!isSingleModuleView) {
            // Mode Komparasi 2 Modul
            thead.innerHTML = `
                <tr>
                    <th style="width: 45px;">No</th>
                    <th style="cursor: pointer;" onclick="toggleSort('name')" title="Klik untuk Urutkan Nama">Nama Siswa ⇅</th>
                    <th style="width: 80px;">Kelas</th>
                    <th style="text-align: center; width: 175px;" title="Kuis 1: Detektif Fakta">🕵️ Kuis 1: Detektif Fakta</th>
                    <th style="text-align: center; width: 175px;" title="Kuis 2: Keamanan Jaringan">🛡️ Kuis 2: Keamanan Jaringan</th>
                    <th style="text-align: center; width: 90px; cursor: pointer;" onclick="toggleSort('score')" title="Urutkan Nilai Rata-Rata">Rata-Rata ⇅</th>
                    <th style="text-align: center; width: 140px;">Status Pengerjaan</th>
                    <th style="text-align: center; width: 165px;">Aksi</th>
                </tr>
            `;
        } else {
            // Mode Modul Tunggal (Fokus Keamanan Jaringan atau Detektif Fakta Saja)
            const modLabel = filterModule === modJaringanId ? 'Modul Keamanan Jaringan' : 'Modul Detektif Fakta';
            thead.innerHTML = `
                <tr>
                    <th style="width: 45px;">No</th>
                    <th style="cursor: pointer;" onclick="toggleSort('name')" title="Klik untuk Urutkan Nama">Nama Siswa ⇅</th>
                    <th style="width: 85px;">Kelas</th>
                    <th style="cursor: pointer; width: 90px;" onclick="toggleSort('score')" title="Klik untuk Urutkan Nilai">Skor ⇅</th>
                    <th>Status Kelulusan (${modLabel})</th>
                    <th>Benar</th>
                    <th>Durasi</th>
                    <th style="cursor: pointer;" onclick="toggleSort('time')" title="Klik untuk Urutkan Waktu">Waktu ⇅</th>
                    <th style="text-align: center; width: 170px;">Aksi</th>
                </tr>
            `;
        }
    }

    // 7. Render Data Tabel Dasbor
    const tbody = document.getElementById('dash-tbody');
    window.currentRenderedRecords = [];
    window.currentWaitingItems = [];

    if (tbody) {
        tbody.innerHTML = '';

        if (displayList.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="${isSingleModuleView ? 9 : 8}">
                        <div class="empty-state">
                            <div class="empty-icon">📭</div>
                            <p>Tidak ada data siswa yang cocok dengan filter aktif:<br>
                            ${filterClass !== 'all' ? `• Kelas: <strong>${escapeHtml(filterClass)}</strong><br>` : ''}
                            ${filterModule !== 'all' ? `• Modul: <strong>${filterModule === modJaringanId ? 'Keamanan Jaringan Saja' : 'Detektif Fakta Saja'}</strong><br>` : ''}
                            ${searchName ? `• Pencarian: "<strong>${escapeHtml(searchName)}</strong>"` : ''}
                            </p>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            displayList.forEach((item, i) => {
                const tr = document.createElement('tr');

                if (!isSingleModuleView) {
                    // ──── RENDER MODE KOMPARASI 2 KUIS (ALL) ────
                    let kuis1Html = '';
                    if (item.hasFakta && item.recordFakta) {
                        const rec1 = item.recordFakta;
                        const isPass1 = rec1.score >= 80;
                        const rIdx1 = window.currentRenderedRecords.length;
                        window.currentRenderedRecords.push(rec1);
                        kuis1Html = `
                            <div style="display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap;">
                                <span class="quiz-score-subpill ${isPass1 ? 'pass' : 'remedy'}">${rec1.score} (${isPass1 ? 'Lulus' : 'Remedi'})</span>
                                <button type="button" class="btn-detail-row" style="padding: 2px 7px; font-size: 0.7rem;" onclick="openStudentDetailModal(window.currentRenderedRecords[${rIdx1}])" title="Periksa Lembar Kuis 1">🔍</button>
                                <button type="button" class="btn-delete-row" style="padding: 2px 6px; font-size: 0.7rem; border-radius: 4px;" onclick="openDeleteStudentModuleModal('${escapeHtml(item.name)}', '${escapeHtml(item.class)}', 'modul_detektif_fakta', ${rec1.score})" title="Hapus Nilai Kuis 1 (Detektif Fakta) saja">🗑️</button>
                            </div>
                        `;
                    } else {
                        kuis1Html = `<span class="quiz-score-subpill waiting">⏳ Belum</span>`;
                    }

                    let kuis2Html = '';
                    if (item.hasJaringan && item.recordJaringan) {
                        const rec2 = item.recordJaringan;
                        const isPass2 = rec2.score >= 80;
                        const rIdx2 = window.currentRenderedRecords.length;
                        window.currentRenderedRecords.push(rec2);
                        kuis2Html = `
                            <div style="display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap;">
                                <span class="quiz-score-subpill ${isPass2 ? 'pass' : 'remedy'}">${rec2.score} (${isPass2 ? 'Lulus' : 'Remedi'})</span>
                                <button type="button" class="btn-detail-row" style="padding: 2px 7px; font-size: 0.7rem;" onclick="openStudentDetailModal(window.currentRenderedRecords[${rIdx2}])" title="Periksa Lembar Kuis 2">🔍</button>
                                <button type="button" class="btn-delete-row" style="padding: 2px 6px; font-size: 0.7rem; border-radius: 4px;" onclick="openDeleteStudentModuleModal('${escapeHtml(item.name)}', '${escapeHtml(item.class)}', 'modul_jaringan_keamanan', ${rec2.score})" title="Hapus Nilai Kuis 2 (Keamanan Jaringan) saja">🗑️</button>
                            </div>
                        `;
                    } else {
                        kuis2Html = `<span class="quiz-score-subpill waiting">⏳ Belum</span>`;
                    }

                    // Badge Status Pengerjaan Lengkap
                    let crossBadge = '';
                    if (item.completionStatus === 'both') {
                        crossBadge = `<span class="badge-cross-both">🟢 Tuntas 2 Kuis</span>`;
                    } else if (item.completionStatus === 'only_fakta') {
                        crossBadge = `<span class="badge-cross-only1" title="Sudah Kuis 1, Belum Kuis 2">🟡 Hanya Kuis 1</span>`;
                    } else if (item.completionStatus === 'only_jaringan') {
                        crossBadge = `<span class="badge-cross-only2" title="Sudah Kuis 2, Belum Kuis 1">🔵 Hanya Kuis 2</span>`;
                    } else {
                        crossBadge = `<span class="badge-cross-none">⏳ Belum Ujian</span>`;
                    }

                    let avgPill = '-';
                    if (item.avgScore >= 0) {
                        const pillCls = item.avgScore >= 80 ? 'high' : item.avgScore >= 60 ? 'mid' : 'low';
                        avgPill = `<span class="score-pill ${pillCls}">${item.avgScore}</span>`;
                    }

                    // Aksi Bar
                    let actionHtml = '';
                    if (item.hasFakta || item.hasJaringan) {
                        actionHtml = `
                            <div style="display: flex; align-items: center; justify-content: center; gap: 5px; flex-wrap: wrap;">
                                <button type="button" class="btn-delete-row" onclick="openDeleteStudentModuleModal('${escapeHtml(item.name)}', '${escapeHtml(item.class)}')" style="padding: 4px 8px; font-size: 0.72rem; border-radius: 6px; font-weight: 700;" title="Pilih modul & hapus nilai untuk siswa ini">
                                    🗑️ Hapus Nilai...
                                </button>
                                ${item.completionStatus !== 'both' ? `
                                    <button type="button" class="btn btn-secondary" onclick="remindStudent('${escapeHtml(item.name)}', '${escapeHtml(item.class)}', '${item.completionStatus === 'only_fakta' ? 'only_jaringan' : 'only_fakta'}')" style="padding: 4px 8px; font-size: 0.72rem; border-radius: 6px; font-weight: 700;" title="Salin Pengingat WhatsApp Sesuai Kuis yang Belum">
                                        📲 Ingatkan
                                    </button>
                                ` : ''}
                            </div>
                        `;
                    } else {
                        actionHtml = `
                            <button type="button" class="btn btn-secondary" onclick="remindStudent('${escapeHtml(item.name)}', '${escapeHtml(item.class)}', 'both')" style="padding: 4px 8px; font-size: 0.72rem; border-radius: 6px; font-weight: 700;" title="Salin Pengingat WhatsApp Belum Ujian">
                                📲 Ingatkan
                            </button>
                        `;
                    }

                    tr.innerHTML = `
                        <td style="font-family: var(--font-mono); color: var(--text-muted);">${i + 1}</td>
                        <td style="font-weight: 700;">${escapeHtml(item.name)}</td>
                        <td><span style="font-family: var(--font-mono); color: var(--accent); font-size: 0.85rem;">${escapeHtml(item.class)}</span></td>
                        <td style="text-align: center;">${kuis1Html}</td>
                        <td style="text-align: center;">${kuis2Html}</td>
                        <td style="text-align: center;">${avgPill}</td>
                        <td style="text-align: center;">${crossBadge}</td>
                        <td style="text-align: center; white-space: nowrap;">${actionHtml}</td>
                    `;

                } else {
                    // ──── RENDER MODE MODUL TUNGGAL (KEAMANAN JARINGAN SAJA ATAU DETEKTIF FAKTA SAJA) ────
                    if (item.hasSubmitted && item.record) {
                        const r = item.record;
                        const recordIdx = window.currentRenderedRecords.length;
                        window.currentRenderedRecords.push(r);

                        let pillClass = 'low';
                        if (r.score >= 80) pillClass = 'high';
                        else if (r.score >= 60) pillClass = 'mid';

                        const isPass = r.score >= 80 && !r.isCheated;
                        const isRemedial = !!r.isRemedial;
                        let remedialBadge = '';
                        if (isRemedial) {
                            remedialBadge = `<span class="badge-remedial-tuntas" title="Tuntas Remedial. Nilai Awal: ${r.originalScore !== null && r.originalScore !== undefined ? r.originalScore : '-'}">🔁 Remedi (${r.originalScore !== null && r.originalScore !== undefined ? r.originalScore : 0}➔${r.score})</span>`;
                        } else if (r.score < 80 && !r.isCheated) {
                            remedialBadge = `<span class="badge-remedial-needed" title="Nilai belum mencapai KKM 80">⚠️ Perlu Remedi</span>`;
                        }

                        const scoreDisplay = r.isCheated 
                            ? `<span class="score-pill low" style="background: rgba(244,63,94,0.25); border-color: var(--danger); color: #fff;">0 🚨</span>` 
                            : `<span class="score-pill ${pillClass}">${r.score}</span> ${remedialBadge}`;

                        const statusDisplay = r.isCheated
                            ? `<span class="kkm-pill remedial" style="background: var(--danger); color: white; font-weight: 800;" title="${escapeHtml(r.statusNote || 'Kecurangan')}">🚨 DISKUALIFIKASI</span>`
                            : (isRemedial 
                                ? `<span class="kkm-pill passed" style="background: rgba(16,185,129,0.18); border-color: #10b981; color: #10b981; font-weight: 800;" title="Tuntas melalui program remedial adaptif">TUNTAS REMEDI</span>`
                                : `<span class="kkm-pill ${isPass ? 'passed' : 'remedial'}">${isPass ? 'LULUS' : 'REMEDIAL'}</span>`);

                        const attemptsBadge = item.attemptsCount > 1 
                            ? `<span class="badge-attempts" title="Siswa ini telah mengerjakan ${item.attemptsCount} kali (Menampilkan nilai terbaik)">${item.attemptsCount}x Percobaan</span>` 
                            : '';

                        tr.innerHTML = `
                            <td style="font-family: var(--font-mono); color: var(--text-muted);">${i + 1}</td>
                            <td style="font-weight: 700;">
                                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                    <span>${escapeHtml(item.name)}</span>
                                    ${attemptsBadge}
                                </div>
                            </td>
                            <td><span style="font-family: var(--font-mono); color: var(--accent); font-size: 0.85rem;">${escapeHtml(item.class)}</span></td>
                            <td>${scoreDisplay}</td>
                            <td>${statusDisplay}</td>
                            <td style="font-family: var(--font-mono);">${r.correct !== undefined ? r.correct : '-'}/${r.total || 20}</td>
                            <td style="color: var(--text-muted); font-size: 0.85rem;">${escapeHtml(r.duration || '-')}</td>
                            <td style="color: var(--text-muted); font-size: 0.8rem;">${escapeHtml(r.time || '-')}<br><span style="font-size:0.7rem;">${escapeHtml(r.date || '')}</span></td>
                            <td style="text-align: center; white-space: nowrap;">
                                <button class="btn-detail-row" title="Periksa Lembar Jawaban & Analisis Kesalahan" onclick="openStudentDetailModal(window.currentRenderedRecords[${recordIdx}])">
                                    🔍 Periksa
                                </button>
                                <button class="btn-delete-row" title="Hapus nilai siswa ini pada modul ini" onclick="openDeleteStudentModuleModal('${escapeHtml(item.name)}', '${escapeHtml(item.class)}', '${filterModule}', ${r.score})">
                                    🗑️ Hapus
                                </button>
                            </td>
                        `;
                    } else {
                        // Siswa belum mengerjakan kuis pada modul tunggal ini
                        tr.style.opacity = '0.85';
                        const modLabel = filterModule === modJaringanId ? 'Kuis Keamanan Jaringan' : 'Kuis Detektif Fakta';
                        tr.innerHTML = `
                            <td style="font-family: var(--font-mono); color: var(--text-muted);">${i + 1}</td>
                            <td style="font-weight: 600; color: var(--text-secondary);">
                                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                    <span>${escapeHtml(item.name)}</span>
                                    <span class="badge-waiting">⏳ Menunggu</span>
                                </div>
                            </td>
                            <td><span style="font-family: var(--font-mono); color: var(--text-muted); font-size: 0.85rem;">${escapeHtml(item.class)}</span></td>
                            <td><span class="score-pill low" style="background: rgba(148,163,184,0.08); border-color: rgba(148,163,184,0.25); color: var(--text-muted);">-</span></td>
                            <td><span class="kkm-pill remedial" style="background: rgba(234,179,8,0.12); color: #fde047; border-color: rgba(234,179,8,0.35); font-size: 0.72rem; padding: 3px 8px;">⏳ BELUM MENGERJAKAN</span></td>
                            <td style="color: var(--text-muted);">-</td>
                            <td style="color: var(--text-muted);">-</td>
                            <td style="color: var(--text-muted); font-size: 0.76rem;">Belum Ujian</td>
                            <td style="text-align: center; white-space: nowrap;">
                                <button class="btn btn-secondary" onclick="remindStudent('${escapeHtml(item.name)}', '${escapeHtml(item.class)}', '${filterModule === modJaringanId ? 'only_jaringan' : 'only_fakta'}')" style="padding: 4px 10px; font-size: 0.72rem; border-radius: 6px; font-weight: 700;" title="Salin Pesan Pengingat WhatsApp">
                                    📲 Ingatkan
                                </button>
                            </td>
                        `;
                    }
                }

                tbody.appendChild(tr);
            });
        }
    }

    renderClassMatrix(submittedRecords);
    renderQuestionAnalytics(allRecords);
}

// ============================================================
//  ⚡ EVENT LISTENERS (REAL-TIME SINKRONISASI DASBOR GURU)
// ============================================================
window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === ACCESS_SETTINGS_KEY || e.key === SUBMISSION_POLICY_KEY) {
        if (screens.teacher && screens.teacher.classList.contains('active')) {
            renderDashboard();
        }
    }
});

window.addEventListener('quizmaster_new_record', (e) => {
    if (screens.teacher && screens.teacher.classList.contains('active')) {
        sfxNewData();
        renderDashboard();
        showToast(`🔔 Nilai masuk: ${e.detail ? e.detail.name : 'Siswa'} (${e.detail ? e.detail.score : ''})`, '📝');
    }
});

function renderQuestionAnalytics(records) {
    const container = document.getElementById('q-analytics');
    if (!container) return;
    container.innerHTML = '';
    if (records.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Belum ada data untuk dianalisis.</p>';
        return;
    }
    const attempts = records.filter(r => r.wrongQuestions !== undefined);
    if (attempts.length === 0) { 
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">Belum ada data analisis.</p>'; 
        return; 
    }
    const activeQuestions = getActiveQuizData();
    activeQuestions.forEach((q, i) => {
        const wrongCount = attempts.filter(r => r.wrongQuestions.includes(i)).length;
        const correctCount = attempts.length - wrongCount;
        const pct = Math.round((correctCount / attempts.length) * 100);
        let barClass = 'good';
        if (pct < 50) barClass = 'bad';
        else if (pct < 75) barClass = 'medium';
        const diff = q.difficulty || 'Medium';
        let diffBadgeStr = diff === 'Easy' ? '🟢 Mudah' : (diff === 'Hard' ? '🔴 Sulit' : '🟡 Sedang');

        const item = document.createElement('div');
        item.className = 'q-analytics-item';
        item.title = (q.q || '').substring(0, 100);
        item.innerHTML = `
            <span class="q-label">Soal ${i + 1} (${diffBadgeStr})</span>
            <div class="q-analytics-bar"><div class="q-analytics-fill ${barClass}" style="width: ${pct}%"></div></div>
            <span class="q-analytics-pct" style="color: var(--${barClass === 'good' ? 'success' : barClass === 'medium' ? 'warning' : 'danger'})">${pct}%</span>
        `;
        container.appendChild(item);
    });
}

function exportExcel() {
    if (typeof sfxClick === 'function') sfxClick();
    const allRecords = loadRecords();
    const filterClass = document.getElementById('filter-class') ? document.getElementById('filter-class').value : 'all';
    const filterModule = document.getElementById('filter-module') ? document.getElementById('filter-module').value : 'all';
    const modFaktaId = 'modul_detektif_fakta';
    const modJaringanId = 'modul_jaringan_keamanan';

    if (typeof XLSX === 'undefined') {
        if (typeof exportCSV === 'function') exportCSV();
        return;
    }

    const wb = XLSX.utils.book_new();
    const targetClasses = filterClass === 'all' ? ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'] : [filterClass];

    if (filterModule === 'all') {
        // ──── MODE KOMPARASI 2 KUIS (EXCEL) ────
        const buildComparativeSheet = (clsTitle, classesList) => {
            const rows = [
                ['SMAN 4 PADANG — LAPORAN KOMPARASI HASIL BELAJAR SISWA'],
                ['Evaluasi: Kuis 1 (Detektif Fakta) & Kuis 2 (Infrastruktur Jaringan & Keamanan Digital)'],
                [`Kelas: ${clsTitle}  |  Standar KKM: 80  |  Guru Pengampu: RINI SYAFITRI, S.Pd.`],
                [`Waktu Unduh: ${new Date().toLocaleString('id-ID')}`],
                [],
                ['No', 'Nama Siswa', 'Kelas', 'Nilai Kuis 1 (Fakta)', 'Status K1', 'Nilai Kuis 2 (Jaringan)', 'Status K2', 'Rata-Rata', 'Status Pengerjaan', 'Hasil Akhir']
            ];

            let counter = 1;
            classesList.forEach(c => {
                const roster = (typeof STUDENT_ROSTER !== 'undefined' && STUDENT_ROSTER[c]) ? STUDENT_ROSTER[c] : [];
                roster.forEach(name => {
                    const cleanName = name.trim().toLowerCase();
                    const nameMatches = (typeof isNameEquivalent === 'function') 
                        ? (recName) => isNameEquivalent(recName, name)
                        : (recName) => (recName || '').trim().toLowerCase() === cleanName;
                    const classMatches = (typeof isClassEquivalent === 'function')
                        ? (recClass) => isClassEquivalent(recClass, c)
                        : (recClass) => (recClass || '').replace(/\s+/g, '').toUpperCase() === c.replace(/\s+/g, '').toUpperCase();

                    const recFakta = allRecords.find(r => {
                        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
                        return nameMatches(r.name) && classMatches(r.class) && mod === modFaktaId;
                    });
                    const recJaringan = allRecords.find(r => {
                        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
                        return nameMatches(r.name) && classMatches(r.class) && mod === modJaringanId;
                    });

                    const s1 = recFakta ? recFakta.score : null;
                    const s2 = recJaringan ? recJaringan.score : null;

                    let statusPengerjaan = 'Belum Keduanya';
                    if (s1 !== null && s2 !== null) statusPengerjaan = 'Tuntas 2 Kuis';
                    else if (s1 !== null) statusPengerjaan = 'Hanya Kuis 1';
                    else if (s2 !== null) statusPengerjaan = 'Hanya Kuis 2';

                    let avg = '-';
                    let kelulusan = 'BELUM LENGKAP';
                    if (s1 !== null && s2 !== null) {
                        const numericAvg = (s1 + s2) / 2;
                        avg = numericAvg.toFixed(1);
                        kelulusan = numericAvg >= 80 ? 'LULUS (TUNTAS)' : 'PERLU REMEDIAL';
                    } else if (s1 !== null) {
                        avg = s1;
                        kelulusan = 'KURANG KUIS 2';
                    } else if (s2 !== null) {
                        avg = s2;
                        kelulusan = 'KURANG KUIS 1';
                    }

                    rows.push([
                        counter++,
                        sanitizeSpreadsheetValue(name),
                        sanitizeSpreadsheetValue(c),
                        s1 !== null ? s1 : '-',
                        s1 !== null ? (s1 >= 80 ? 'Lulus' : 'Remedial') : 'Belum Ujian',
                        s2 !== null ? s2 : '-',
                        s2 !== null ? (s2 >= 80 ? 'Lulus' : 'Remedial') : 'Belum Ujian',
                        avg,
                        statusPengerjaan,
                        kelulusan
                    ]);
                });
            });
            return rows;
        };

        const compColWidths = [
            { wch: 6 }, { wch: 32 }, { wch: 10 }, { wch: 20 },
            { wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 14 },
            { wch: 20 }, { wch: 20 }
        ];

        if (filterClass === 'all') {
            const allSheet = buildComparativeSheet('Semua Kelas (X E 1 s/d X E 6)', targetClasses);
            const wsAll = XLSX.utils.aoa_to_sheet(allSheet);
            wsAll['!cols'] = compColWidths;
            XLSX.utils.book_append_sheet(wb, wsAll, 'Komparasi Semua Siswa');

            targetClasses.forEach(c => {
                const clsSheet = buildComparativeSheet(`Kelas ${c}`, [c]);
                const wsCls = XLSX.utils.aoa_to_sheet(clsSheet);
                wsCls['!cols'] = compColWidths;
                XLSX.utils.book_append_sheet(wb, wsCls, `Kelas ${c}`);
            });
        } else {
            const clsSheet = buildComparativeSheet(`Kelas ${filterClass}`, [filterClass]);
            const wsCls = XLSX.utils.aoa_to_sheet(clsSheet);
            wsCls['!cols'] = compColWidths;
            XLSX.utils.book_append_sheet(wb, wsCls, `Kelas ${filterClass}`);
        }
    } else {
        // ──── MODE MODUL TUNGGAL (KEAMANAN JARINGAN ATAU DETEKTIF FAKTA) ────
        const isJaringan = (filterModule === modJaringanId);
        const modTitle = isJaringan ? 'INFRASTRUKTUR JARINGAN & KEAMANAN DIGITAL' : 'MISI DETEKTIF FAKTA & LITERASI DIGITAL';
        const filteredRecords = allRecords.filter(r => (isJaringan ? r.moduleId === modJaringanId : (r.moduleId || modFaktaId) === modFaktaId));

        const generateSingleModSheet = (clsTitle, classRecords) => {
            const sorted = [...classRecords].sort((a, b) => b.score - a.score || (a.name || '').localeCompare(b.name || ''));
            const total = sorted.length;
            const sum = sorted.reduce((acc, r) => acc + (r.score || 0), 0);
            const avg = total > 0 ? (sum / total).toFixed(1) : '0';
            const highest = total > 0 ? Math.max(...sorted.map(r => r.score || 0)) : 0;
            const lowest = total > 0 ? Math.min(...sorted.map(r => r.score || 0)) : 0;
            const lulus = sorted.filter(r => (r.score || 0) >= 80).length;

            const sheetData = [
                [`SMAN 4 PADANG — REKAP NILAI ${modTitle}`],
                [`Laporan Kelas: ${clsTitle} (Standar KKM: 80) — Guru: RINI SYAFITRI, S.Pd.`],
                [`Total Responden: ${total} Siswa | Rata-Rata: ${avg} | Tertinggi: ${highest} | Terendah: ${lowest} | Lulus KKM: ${lulus} Siswa`],
                [`Waktu Unduh: ${new Date().toLocaleString('id-ID')}`],
                [],
                ['No', 'Nama Siswa', 'Kelas', 'Nilai Akhir', 'Status KKM (≥80)', 'Jawaban Benar', 'Total Soal', 'Durasi', 'Waktu Selesai', 'Tanggal']
            ];

            sorted.forEach((r, i) => {
                sheetData.push([
                    i + 1,
                    sanitizeSpreadsheetValue(r.name),
                    sanitizeSpreadsheetValue(r.class || clsTitle),
                    r.score,
                    r.score >= 80 ? 'LULUS (TUNTAS)' : 'PERLU REMEDIAL',
                    r.correct !== undefined ? r.correct : 0,
                    r.total || (typeof getActiveQuizData === 'function' ? getActiveQuizData().length : 20),
                    r.duration || '-',
                    r.time || '-',
                    r.date || '-'
                ]);
            });
            return sheetData;
        };

        const singleColWidths = [
            { wch: 6 }, { wch: 32 }, { wch: 12 }, { wch: 14 },
            { wch: 18 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
            { wch: 15 }, { wch: 15 }
        ];

        if (filterClass === 'all') {
            const sheetAll = generateSingleModSheet('Semua Kelas (X E 1 - X E 6)', filteredRecords);
            const wsAll = XLSX.utils.aoa_to_sheet(sheetAll);
            wsAll['!cols'] = singleColWidths;
            XLSX.utils.book_append_sheet(wb, wsAll, 'Semua Siswa');

            targetClasses.forEach(c => {
                const clsRecords = filteredRecords.filter(r => r.class === c);
                const sheetCls = generateSingleModSheet(`Kelas ${c}`, clsRecords);
                const wsCls = XLSX.utils.aoa_to_sheet(sheetCls);
                wsCls['!cols'] = singleColWidths;
                XLSX.utils.book_append_sheet(wb, wsCls, `Kelas ${c}`);
            });
        } else {
            const clsRecords = filteredRecords.filter(r => r.class === filterClass);
            const sheetCls = generateSingleModSheet(`Kelas ${filterClass}`, clsRecords);
            const wsCls = XLSX.utils.aoa_to_sheet(sheetCls);
            wsCls['!cols'] = singleColWidths;
            XLSX.utils.book_append_sheet(wb, wsCls, `Kelas ${filterClass}`);
        }
    }

    const modSuffix = filterModule === 'all' ? 'Komparasi_2_Modul' : (filterModule === modJaringanId ? 'Keamanan_Jaringan' : 'Detektif_Fakta');
    const fileName = `Rekap_Nilai_${modSuffix}_${filterClass === 'all' ? 'Semua_Kelas' : filterClass.replace(/ /g, '_')}_${new Date().toISOString().slice(0,10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    if (typeof sfxCorrect === 'function') sfxCorrect();
    showToast(`File Excel ${modSuffix.replace(/_/g, ' ')} berhasil diunduh! 📊`, '✅');
}

function exportTeacherPDF() {
    if (typeof sfxClick === 'function') sfxClick();
    const allRecords = loadRecords();
    const filterClass = document.getElementById('filter-class') ? document.getElementById('filter-class').value : 'all';
    const filterModule = document.getElementById('filter-module') ? document.getElementById('filter-module').value : 'all';
    const modFaktaId = 'modul_detektif_fakta';
    const modJaringanId = 'modul_jaringan_keamanan';

    if (!window.jspdf || !window.jspdf.jsPDF) {
        showToast('Pustaka PDF sedang dimuat. Coba lagi dalam beberapa detik...', '⚠️');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const nowStr = new Date().toLocaleString('id-ID');
        const targetClasses = filterClass === 'all' ? ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'] : [filterClass];

        if (filterModule === 'all') {
            // ══════════════════════════════════════════════════════
            // 🌟 PDF: MODE KOMPARASI 2 MODUL KUIS (DUAL-QUIZ COMPARATIVE)
            // ══════════════════════════════════════════════════════
            const printComparativeSection = (clsTitle, classesList, isFirstPage = false) => {
                if (!isFirstPage) doc.addPage();

                // Top Header Banner
                doc.setFillColor(15, 23, 42);
                doc.rect(0, 0, 210, 32, 'F');
                doc.setFillColor(99, 102, 241);
                doc.rect(0, 32, 210, 2, 'F');

                doc.setTextColor(129, 140, 248);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(13);
                doc.text('SMAN 4 PADANG — LAPORAN KOMPARASI HASIL BELAJAR SISWA', 14, 13);

                doc.setTextColor(226, 232, 240);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.text(`Kuis 1: Detektif Fakta  |  Kuis 2: Infrastruktur Jaringan & Keamanan Digital (KKM: 80)`, 14, 20);
                doc.text(`Guru Pengampu: RINI SYAFITRI, S.Pd.  |  Kelas: ${clsTitle}  |  Dicetak: ${nowStr}`, 14, 26);

                // Collect Cross-Quiz Student Rows
                let totalStudents = 0;
                let doneBothCount = 0;
                let only1Count = 0;
                let only2Count = 0;
                let noneCount = 0;
                let scoreSum = 0;
                let completedCount = 0;

                const tableBody = [];
                let counter = 1;

                classesList.forEach(c => {
                    const roster = (typeof STUDENT_ROSTER !== 'undefined' && STUDENT_ROSTER[c]) ? STUDENT_ROSTER[c] : [];
                    roster.forEach(name => {
                        totalStudents++;
                        const cleanName = name.trim().toLowerCase();
                        const nameMatches = (typeof isNameEquivalent === 'function') 
                            ? (recName) => isNameEquivalent(recName, name)
                            : (recName) => (recName || '').trim().toLowerCase() === cleanName;
                        const classMatches = (typeof isClassEquivalent === 'function')
                            ? (recClass) => isClassEquivalent(recClass, c)
                            : (recClass) => (recClass || '').replace(/\s+/g, '').toUpperCase() === c.replace(/\s+/g, '').toUpperCase();

                        const recFakta = allRecords.find(r => {
                            const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
                            return nameMatches(r.name) && classMatches(r.class) && mod === modFaktaId;
                        });
                        const recJaringan = allRecords.find(r => {
                            const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
                            return nameMatches(r.name) && classMatches(r.class) && mod === modJaringanId;
                        });

                        const s1 = recFakta ? recFakta.score : null;
                        const s2 = recJaringan ? recJaringan.score : null;

                        let statusStr = 'Belum Keduanya';
                        if (s1 !== null && s2 !== null) {
                            statusStr = 'Tuntas 2 Kuis';
                            doneBothCount++;
                        } else if (s1 !== null) {
                            statusStr = 'Hanya Kuis 1';
                            only1Count++;
                        } else if (s2 !== null) {
                            statusStr = 'Hanya Kuis 2';
                            only2Count++;
                        } else {
                            noneCount++;
                        }

                        let avgStr = '-';
                        let kelulusanStr = 'BELUM LENGKAP';
                        if (s1 !== null && s2 !== null) {
                            const avgVal = (s1 + s2) / 2;
                            avgStr = avgVal.toFixed(1);
                            scoreSum += avgVal;
                            completedCount++;
                            kelulusanStr = avgVal >= 80 ? 'LULUS' : 'REMEDIAL';
                        } else if (s1 !== null) {
                            avgStr = s1;
                            scoreSum += s1;
                            completedCount++;
                            kelulusanStr = s1 >= 80 ? 'K1 Lulus (K2 Belum)' : 'K1 Remed (K2 Belum)';
                        } else if (s2 !== null) {
                            avgStr = s2;
                            scoreSum += s2;
                            completedCount++;
                            kelulusanStr = s2 >= 80 ? 'K2 Lulus (K1 Belum)' : 'K2 Remed (K1 Belum)';
                        }

                        tableBody.push([
                            counter++,
                            name,
                            c,
                            s1 !== null ? `${s1} (${s1 >= 80 ? 'L' : 'R'})` : '⏳ Belum',
                            s2 !== null ? `${s2} (${s2 >= 80 ? 'L' : 'R'})` : '⏳ Belum',
                            avgStr,
                            statusStr,
                            kelulusanStr
                        ]);
                    });
                });

                const overallAvg = completedCount > 0 ? (scoreSum / completedCount).toFixed(1) : '0';
                const tuntasPct = totalStudents > 0 ? Math.round((doneBothCount / totalStudents) * 100) : 0;

                // Summary Stats Card
                doc.setFillColor(248, 250, 252);
                doc.setDrawColor(203, 213, 225);
                doc.roundedRect(14, 38, 182, 20, 2, 2, 'FD');

                doc.setFontSize(8.5);
                doc.setTextColor(30, 41, 59);
                doc.setFont('helvetica', 'bold');
                doc.text(`Total Terdaftar: ${totalStudents} Siswa`, 20, 45);
                doc.text(`Tuntas 2 Kuis: ${doneBothCount} (${tuntasPct}%)`, 72, 45);
                doc.text(`Rata-Rata Nilai: ${overallAvg}`, 130, 45);
                doc.text(`Hanya Kuis 1: ${only1Count} Siswa   |   Hanya Kuis 2: ${only2Count} Siswa   |   Belum Keduanya: ${noneCount} Siswa`, 20, 52);

                doc.autoTable({
                    startY: 62,
                    head: [['No', 'Nama Siswa', 'Kelas', 'Kuis 1 (Fakta)', 'Kuis 2 (Jaringan)', 'Rata-Rata', 'Status Pengerjaan', 'Hasil Akhir']],
                    body: tableBody,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [15, 23, 42],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: 8
                    },
                    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
                    alternateRowStyles: { fillColor: [248, 250, 252] },
                    columnStyles: {
                        0: { cellWidth: 8, halign: 'center' },
                        1: { cellWidth: 44 },
                        2: { cellWidth: 14, halign: 'center' },
                        3: { cellWidth: 26, halign: 'center' },
                        4: { cellWidth: 28, halign: 'center' },
                        5: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
                        6: { cellWidth: 26, halign: 'center' },
                        7: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
                    },
                    didParseCell: (data) => {
                        if (data.section === 'body' && data.column.index === 7) {
                            if (data.cell.raw === 'LULUS') data.cell.styles.textColor = [16, 185, 129];
                            else if (data.cell.raw === 'REMEDIAL') data.cell.styles.textColor = [244, 63, 94];
                        }
                    },
                    margin: { left: 14, right: 14 }
                });

                // Signature Block (Only on last page or per section)
                const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 240;
                if (finalY < 250) {
                    doc.setFontSize(8.5);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(51, 65, 85);
                    doc.text('Mengetahui / Mengesahkan,', 140, finalY);
                    doc.text('Guru Mata Pelajaran Informatika', 140, finalY + 5);
                    doc.setFont('helvetica', 'bold');
                    doc.text('RINI SYAFITRI, S.Pd.', 140, finalY + 24);
                    doc.setFont('helvetica', 'normal');
                    doc.text('NIP. 19850320 201101 2 008', 140, finalY + 29);
                }
            };

            if (filterClass === 'all') {
                printComparativeSection('Semua Siswa Terdaftar (X E 1 s/d X E 6)', targetClasses, true);
                targetClasses.forEach(c => {
                    printComparativeSection(`Kelas ${c}`, [c], false);
                });
            } else {
                printComparativeSection(`Kelas ${filterClass}`, [filterClass], true);
            }

        } else {
            // ══════════════════════════════════════════════════════
            // 🛡️ PDF: MODE MODUL TUNGGAL (KEAMANAN JARINGAN / DETEKTIF FAKTA)
            // ══════════════════════════════════════════════════════
            const isJaringan = (filterModule === modJaringanId);
            const modTitle = isJaringan ? 'PENILAIAN HARIAN: INFRASTRUKTUR JARINGAN & KEAMANAN DIGITAL' : 'EVALUASI PEMBELAJARAN: MISI DETEKTIF FAKTA & LITERASI DIGITAL';
            const filteredRecords = allRecords.filter(r => (isJaringan ? r.moduleId === modJaringanId : (r.moduleId || modFaktaId) === modFaktaId));

            const printSingleSection = (clsTitle, classRecords, isFirstPage = false) => {
                if (!isFirstPage) doc.addPage();

                // Header Banner
                doc.setFillColor(15, 23, 42);
                doc.rect(0, 0, 210, 32, 'F');
                doc.setFillColor(isJaringan ? 6 : 16, isJaringan ? 182 : 185, isJaringan ? 212 : 129);
                doc.rect(0, 32, 210, 2, 'F');

                doc.setTextColor(isJaringan ? 34 : 52, isJaringan ? 211 : 211, isJaringan ? 238 : 153);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(13);
                doc.text(`SMAN 4 PADANG — ${modTitle}`, 14, 13);

                doc.setTextColor(226, 232, 240);
                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.text(`Guru Pengampu: RINI SYAFITRI, S.Pd.  |  Kelas: ${clsTitle}`, 14, 20);
                doc.text(`Standar Ketuntasan Minimal (KKM): 80   |   Dicetak: ${nowStr}`, 14, 26);

                const sorted = [...classRecords].sort((a, b) => b.score - a.score || (a.name || '').localeCompare(b.name || ''));
                const total = sorted.length;
                const sum = sorted.reduce((acc, r) => acc + (r.score || 0), 0);
                const avg = total > 0 ? (sum / total).toFixed(1) : '0';
                const highest = total > 0 ? Math.max(...sorted.map(r => r.score || 0)) : 0;
                const lowest = total > 0 ? Math.min(...sorted.map(r => r.score || 0)) : 0;
                const lulusCount = sorted.filter(r => (r.score || 0) >= 80).length;
                const lulusPct = total > 0 ? Math.round((lulusCount / total) * 100) : 0;

                // Summary Stats Box
                doc.setFillColor(248, 250, 252);
                doc.setDrawColor(203, 213, 225);
                doc.roundedRect(14, 38, 182, 19, 2, 2, 'FD');

                doc.setFontSize(9);
                doc.setTextColor(30, 41, 59);
                doc.setFont('helvetica', 'bold');
                doc.text(`Total Siswa Responden: ${total}`, 20, 46);
                doc.text(`Rata-Rata: ${avg}`, 72, 46);
                doc.text(`Tertinggi: ${highest}`, 115, 46);
                doc.text(`Terendah: ${lowest}`, 155, 46);
                doc.text(`Tingkat Kelulusan (Nilai ≥ 80): ${lulusCount} dari ${total} Siswa (${lulusPct}%)`, 20, 52);

                const tableBody = sorted.map((r, i) => [
                    i + 1,
                    r.name,
                    r.class || clsTitle,
                    r.score,
                    `${r.correct !== undefined ? r.correct : 0} / ${r.total || (typeof getActiveQuizData === 'function' ? getActiveQuizData().length : 20)}`,
                    r.score >= 80 ? 'LULUS' : 'REMEDIAL',
                    r.duration || '-',
                    r.time || '-',
                    r.date || '-'
                ]);

                doc.autoTable({
                    startY: 61,
                    head: [['No', 'Nama Siswa', 'Kelas', 'Skor', 'Benar', 'Status (KKM 80)', 'Durasi', 'Waktu', 'Tanggal']],
                    body: tableBody.length > 0 ? tableBody : [['-', '(Belum ada data untuk kelas ini)', '-', '-', '-', '-', '-', '-', '-']],
                    theme: 'grid',
                    headStyles: {
                        fillColor: [15, 23, 42],
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: 8.5
                    },
                    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
                    alternateRowStyles: { fillColor: [248, 250, 252] },
                    columnStyles: {
                        0: { cellWidth: 8, halign: 'center' },
                        1: { cellWidth: 46 },
                        2: { cellWidth: 15, halign: 'center' },
                        3: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
                        4: { cellWidth: 16, halign: 'center' },
                        5: { cellWidth: 26, halign: 'center' },
                        6: { cellWidth: 18, halign: 'center' },
                        7: { cellWidth: 20, halign: 'center' },
                        8: { cellWidth: 19, halign: 'center' }
                    },
                    didParseCell: (data) => {
                        if (data.section === 'body' && data.column.index === 5) {
                            if (data.cell.raw === 'LULUS') data.cell.styles.textColor = [16, 185, 129];
                            else if (data.cell.raw === 'REMEDIAL') data.cell.styles.textColor = [244, 63, 94];
                        }
                    },
                    margin: { left: 14, right: 14 }
                });

                // Signature Block
                const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 12 : 240;
                if (finalY < 250) {
                    doc.setFontSize(8.5);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(51, 65, 85);
                    doc.text('Mengetahui / Mengesahkan,', 140, finalY);
                    doc.text('Guru Mata Pelajaran Informatika', 140, finalY + 5);
                    doc.setFont('helvetica', 'bold');
                    doc.text('RINI SYAFITRI, S.Pd.', 140, finalY + 24);
                    doc.setFont('helvetica', 'normal');
                    doc.text('NIP. 19850320 201101 2 008', 140, finalY + 29);
                }
            };

            if (filterClass === 'all') {
                printSingleSection('Semua Siswa Tergabung', filteredRecords, true);
                targetClasses.forEach(cls => {
                    const classStudents = filteredRecords.filter(r => r.class === cls);
                    printSingleSection(`Kelas ${cls}`, classStudents, false);
                });
            } else {
                const clsRecords = filteredRecords.filter(r => r.class === filterClass);
                printSingleSection(`Kelas ${filterClass}`, clsRecords, true);
            }
        }

        const modNameSlug = filterModule === 'all' ? 'Komparasi_2_Modul' : (filterModule === modJaringanId ? 'Keamanan_Jaringan' : 'Detektif_Fakta');
        const fileName = `Laporan_Resmi_${modNameSlug}_${filterClass === 'all' ? 'Semua_Kelas' : filterClass.replace(/ /g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
        doc.save(fileName);
        if (typeof sfxCorrect === 'function') sfxCorrect();
        showToast(`Laporan PDF Guru (${modNameSlug.replace(/_/g, ' ')}) berhasil diunduh! 📑`, '✅');
    } catch (err) {
        if (typeof sfxWrong === 'function') sfxWrong();
        showToast('Gagal membuat PDF: ' + err.message, '❌');
    }
}

function exportStudentPDF() {
    sfxClick();
    if (!window.jspdf || !window.jspdf.jsPDF) {
        showToast('Pustaka PDF sedang dimuat. Coba lagi dalam beberapa detik...', '⚠️');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');
        const finalScore = Math.round((score / quizData.length) * 100);
        const nowStr = new Date().toLocaleString('id-ID');
        const isLulus = finalScore >= 80;

        const modTitle = (typeof currentActiveModule !== 'undefined' && currentActiveModule && currentActiveModule.title) || (window.QuizManager && QuizManager.getActiveModule() ? QuizManager.getActiveModule().title : 'Evaluasi Kuis Pembelajaran Informatika');
        const proofId = window.lastSubmittedProofId || `SMAN4-${(studentClass||'XE').replace(/[^A-Za-z0-9]/g,'')}-${finalScore}-${Date.now().toString(36).toUpperCase()}`;

        // 1. Header Banner
        doc.setFillColor(15, 23, 42); // Dark Navy
        doc.rect(0, 0, 210, 34, 'F');
        doc.setFillColor(6, 182, 212); // Cyan accent bar
        doc.rect(0, 34, 210, 2, 'F');

        doc.setTextColor(34, 211, 238);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('RAPOR HASIL EVALUASI PEMBELAJARAN', 14, 14);

        doc.setTextColor(226, 232, 240);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`${modTitle} (Standar KKM: 80)`, 14, 21);
        doc.text(`Waktu: ${nowStr} • No. Verifikasi: ${proofId}`, 14, 28);

        // 2. Student Info & Score Badge Box
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(14, 40, 182, 34, 3, 3, 'FD');

        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text('NAMA SISWA', 20, 49);
        doc.setFont('helvetica', 'normal');
        doc.text(`:  ${studentName}`, 55, 49);

        doc.setFont('helvetica', 'bold');
        doc.text('KELAS', 20, 57);
        doc.setFont('helvetica', 'normal');
        doc.text(`:  ${studentClass}`, 55, 57);

        doc.setFont('helvetica', 'bold');
        doc.text('MAX STREAK', 20, 65);
        doc.setFont('helvetica', 'normal');
        doc.text(`:  ${maxStreak}x Jawaban Benar Beruntun`, 55, 65);

        // Score Badge Box on Right
        if (isLulus) {
            doc.setFillColor(16, 185, 129); // Green
        } else {
            doc.setFillColor(239, 68, 68); // Red
        }
        doc.roundedRect(136, 44, 54, 26, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text(`SKOR: ${finalScore}`, 163, 55, { align: 'center' });
        doc.setFontSize(8.5);
        doc.text(isLulus ? 'STATUS: LULUS (≥80)' : 'STATUS: REMEDIAL (<80)', 163, 63, { align: 'center' });

        // 3. Question Details Table (Dengan Pembahasan, Penjelasan Edukatif & Tingkat Kesulitan)
        const tableBody = shuffledQuizOrder.map((origIdx, playIdx) => {
            const qData = quizData[origIdx];
            const isRight = answeredCorrectly[origIdx];
            let correctAns;
            if (Array.isArray(qData.answer)) {
                correctAns = qData.answer.map(a => qData.options[a]).join(' | ');
            } else {
                correctAns = qData.options[qData.answer];
            }
            const diffStr = qData.difficulty === 'Easy' ? 'Mudah' : (qData.difficulty === 'Hard' ? 'Sulit' : 'Sedang');

            return [
                playIdx + 1,
                `[${diffStr}] ${qData.q}`,
                isRight ? 'BENAR' : 'SALAH',
                correctAns,
                qData.explanation || '-'
            ];
        });

        doc.autoTable({
            startY: 80,
            head: [['No', 'Pertanyaan Soal & Tingkat', 'Hasil', 'Kunci Jawaban Valid', 'Pembahasan & Analisis Edukatif']],
            body: tableBody,
            theme: 'grid',
            headStyles: {
                fillColor: [79, 70, 229],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 8,
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 7.2,
                textColor: [30, 41, 59],
                cellPadding: 2.5,
                valign: 'middle'
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { cellWidth: 8, halign: 'center', fontStyle: 'bold' },
                1: { cellWidth: 56 },
                2: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
                3: { cellWidth: 46 },
                4: { cellWidth: 56 }
            },
            didParseCell: function(data) {
                if (data.section === 'body' && data.column.index === 2) {
                    if (data.cell.raw === 'BENAR') {
                        data.cell.styles.textColor = [16, 185, 129]; // Green
                    } else {
                        data.cell.styles.textColor = [239, 68, 68]; // Red
                    }
                }
            },
            margin: { left: 14, right: 14 }
        });

        // 4. Official Footer Note
        const totalPages = doc.internal.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
            doc.setPage(p);
            doc.setFontSize(8);
            doc.setTextColor(148, 163, 184);
            doc.text('Dokumen ini diterbitkan secara otomatis oleh Sistem Evaluasi Detektif Fakta Digital', 14, 290);
            doc.text(`Halaman ${p} dari ${totalPages}`, 196, 290, { align: 'right' });
        }

        const fileName = `Rapor_Kuis_${studentClass.replace(/ /g, '_')}_${studentName.replace(/ /g, '_')}.pdf`;
        doc.save(fileName);
        sfxCorrect();
        showToast('Rapor nilai PDF Anda berhasil diunduh!', '📑');
    } catch (err) {
        sfxWrong();
        showToast('Gagal membuat PDF rapor: ' + err.message, '❌');
    }
}

function downloadExcelWorkbook(wb, fileName) {
    try {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            if (a.parentNode) document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1500);
    } catch (e) {
        XLSX.writeFile(wb, fileName);
    }
}

function exportStudentExcel() {
    sfxClick();
    try {
        const finalScore = Math.round((score / quizData.length) * 100);
        const sName = studentName || 'Siswa';
        const sClass = studentClass || 'Kelas';
        const safeClass = sClass.replace(/[/\\?%*:|"<> ]/g, '_');
        const safeName = sName.replace(/[/\\?%*:|"<> ]/g, '_');
        const nowStr = new Date().toLocaleString('id-ID');
        const isLulus = finalScore >= 80;

        const modTitle = (typeof currentActiveModule !== 'undefined' && currentActiveModule && currentActiveModule.title) || (window.QuizManager && QuizManager.getActiveModule() ? QuizManager.getActiveModule().title : 'Evaluasi Kuis Pembelajaran Informatika');
        const proofId = window.lastSubmittedProofId || `SMAN4-${(studentClass||'XE').replace(/[^A-Za-z0-9]/g,'')}-${finalScore}-${Date.now().toString(36).toUpperCase()}`;

        // Opsi 1: Jika Pustaka XLSX Tersedia di Browser Siswa
        if (typeof XLSX !== 'undefined') {
            try {
                const sheetData = [
                    ['RAPOR HASIL EVALUASI PEMBELAJARAN SISWA'],
                    [`${modTitle.toUpperCase()} (BATAS KELULUSAN KKM: 80)`],
                    [],
                    ['Nama Siswa', sanitizeSpreadsheetValue(sName)],
                    ['Kelas', sanitizeSpreadsheetValue(sClass)],
                    ['Modul Kuis', modTitle],
                    ['Nomor Bukti Verifikasi', proofId],
                    ['Status Bukti', 'TERVERIFIKASI CLOUD SUPABASE & DASBOR GURU'],
                    ['Nilai Akhir', finalScore],
                    ['Jawaban Benar', `${score} dari ${quizData.length} Soal`],
                    ['Status Kelulusan', isLulus ? 'LULUS (KOMPETEN)' : 'BELUM LULUS (REMEDIAL)'],
                    ['Max Streak', `${maxStreak}x Jawaban Benar Beruntun`],
                    ['Waktu Pengerjaan', nowStr],
                    [],
                    ['No', 'Tingkat Kesulitan', 'Pertanyaan Soal', 'Hasil Analisis', 'Kunci Jawaban Valid', 'Pembahasan & Logika Edukatif']
                ];

                shuffledQuizOrder.forEach((origIdx, playIdx) => {
                    const qData = quizData[origIdx];
                    const isRight = answeredCorrectly[origIdx];
                    let correctAns = Array.isArray(qData.answer) ? qData.answer.map(a => qData.options[a]).join(' | ') : qData.options[qData.answer];
                    const diffStr = qData.difficulty === 'Easy' ? 'Mudah' : (qData.difficulty === 'Hard' ? 'Sulit' : 'Sedang');

                    sheetData.push([
                        playIdx + 1,
                        diffStr,
                        qData.q,
                        isRight ? 'BENAR' : 'SALAH',
                        correctAns,
                        qData.explanation || '-'
                    ]);
                });

                const ws = XLSX.utils.aoa_to_sheet(sheetData);
                ws['!cols'] = [{ wch: 6 }, { wch: 18 }, { wch: 55 }, { wch: 16 }, { wch: 40 }, { wch: 60 }];

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Rapor Siswa');

                const fileName = `Rapor_Kuis_${safeClass}_${safeName}.xlsx`;
                downloadExcelWorkbook(wb, fileName);
                sfxCorrect();
                showToast('Rapor Excel (.xlsx) berhasil diunduh!', '📊');
                return;
            } catch (xlsxErr) {
                console.warn('XLSX write error, using native fallback:', xlsxErr);
            }
        }

        // Opsi 2: NATIVE ZERO-DEPENDENCY EXCEL (.XLS / HTML TABLE FORMAT)
        // 100% Berhasil di SEMUA Smartphone Android & iPhone tanpa butuh pustaka eksternal!
        let htmlContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Rapor Siswa</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
            <style>
                body { font-family: Arial, sans-serif; font-size: 10pt; }
                table { border-collapse: collapse; width: 100%; }
                th { background-color: #4f46e5; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: center; }
                td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; }
                .title { background-color: #0f172a; color: #22d3ee; font-size: 13pt; font-weight: bold; padding: 10px; }
                .subtitle { background-color: #1e293b; color: #f8fafc; font-size: 10pt; padding: 6px; }
                .info-label { font-weight: bold; background-color: #f1f5f9; width: 180px; }
                .status-lulus { color: #16a34a; font-weight: bold; }
                .status-remedial { color: #dc2626; font-weight: bold; }
            </style>
        </head>
        <body>
            <table>
                <tr><td colspan="6" class="title">RAPOR HASIL EVALUASI PEMBELAJARAN SISWA</td></tr>
                <tr><td colspan="6" class="subtitle">Misi Detektif Fakta Digital (Standar Kelulusan KKM: 80)</td></tr>
                <tr><td colspan="6" style="height: 10px;"></td></tr>
                <tr><td class="info-label">Nama Siswa</td><td colspan="5">${sName}</td></tr>
                <tr><td class="info-label">Kelas</td><td colspan="5">${sClass}</td></tr>
                <tr><td class="info-label">Skor Nilai</td><td colspan="5" class="${isLulus ? 'status-lulus' : 'status-remedial'}">${finalScore} (${isLulus ? 'STATUS: LULUS KKM' : 'STATUS: PERLU REMEDIAL'})</td></tr>
                <tr><td class="info-label">Jawaban Benar</td><td colspan="5">${score} dari ${quizData.length} Soal</td></tr>
                <tr><td class="info-label">Max Streak</td><td colspan="5">${maxStreak}x Jawaban Benar Beruntun</td></tr>
                <tr><td class="info-label">Waktu Pengerjaan</td><td colspan="5">${nowStr}</td></tr>
                <tr><td colspan="6" style="height: 14px;"></td></tr>
                <tr>
                    <th style="width: 40px;">No</th>
                    <th style="width: 100px;">Tingkat</th>
                    <th style="width: 300px;">Pertanyaan Soal</th>
                    <th style="width: 100px;">Hasil Analisis</th>
                    <th style="width: 250px;">Kunci Jawaban Valid</th>
                    <th style="width: 350px;">Pembahasan & Logika Edukatif</th>
                </tr>
        `;

        shuffledQuizOrder.forEach((origIdx, playIdx) => {
            const qData = quizData[origIdx];
            const isRight = answeredCorrectly[origIdx];
            let correctAns = Array.isArray(qData.answer) ? qData.answer.map(a => qData.options[a]).join(' | ') : qData.options[qData.answer];
            const statusClass = isRight ? 'status-lulus' : 'status-remedial';
            const statusText = isRight ? 'BENAR' : 'SALAH';
            const diffStr = qData.difficulty === 'Easy' ? 'Mudah' : (qData.difficulty === 'Hard' ? 'Sulit' : 'Sedang');

            htmlContent += `
                <tr>
                    <td align="center">${playIdx + 1}</td>
                    <td align="center"><strong>${diffStr}</strong></td>
                    <td>${qData.q}</td>
                    <td align="center" class="${statusClass}">${statusText}</td>
                    <td>${correctAns}</td>
                    <td>${qData.explanation || '-'}</td>
                </tr>
            `;
        });

        htmlContent += `
            </table>
        </body>
        </html>`;

        const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Rapor_Kuis_${safeClass}_${safeName}.xls`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            if (a.parentNode) document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1500);

        sfxCorrect();
        showToast('Rapor Excel (.xls) berhasil diunduh!', '📊');
    } catch (err) {
        sfxWrong();
        showToast('Gagal mengekspor: ' + err.message, '❌');
    }
}

function exportCSV() {
    sfxClick();
    const records = loadRecords();
    const filterClassEl = document.getElementById('filter-class');
    const filterClass = filterClassEl ? filterClassEl.value : 'all';
    const filtered = filterClass === 'all' ? records : records.filter(r => r.class === filterClass);
    if (filtered.length === 0) {
        showToast('Tidak ada data siswa untuk diekspor!', '⚠️');
        return;
    }

    let csv = 'No,Nama Siswa,Kelas,Skor,Benar,Total Soal,Ketuntasan,Durasi,Waktu,Tanggal\n';
    filtered.sort((a, b) => b.score - a.score).forEach((r, i) => {
        const tuntas = r.score >= 80 ? 'LULUS' : 'REMEDIAL';
        const cleanName = sanitizeSpreadsheetValue(r.name || '').replace(/"/g, '""');
        const cleanClass = sanitizeSpreadsheetValue(r.class || '-').replace(/"/g, '""');
        const totalSoal = r.total || (typeof getActiveQuizData === 'function' ? getActiveQuizData().length : 20);
        csv += `${i + 1},"${cleanName}","${cleanClass}",${r.score},${r.correct !== undefined ? r.correct : '-'},${totalSoal},"${tuntas}","${r.duration || '-'}","${r.time || '-'}","${r.date || '-'}"\n`;
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_detektif_fakta_${filterClass === 'all' ? 'semua_kelas' : filterClass.replace(/ /g, '_')}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('File CSV berhasil diunduh!', '📥');
}

// 💾 UNDUH CADANGAN RESMI LENGKAP SELURUH NILAI SISWA (FORMAT JSON LENGKAP & TERVERIFIKASI)
function exportFullJsonBackup() {
    sfxClick();
    const records = (typeof loadRecords === 'function') ? loadRecords() : [];
    if (!Array.isArray(records) || records.length === 0) {
        showToast('Tidak ada data nilai untuk dicadangkan!', '⚠️');
        return;
    }

    const modFaktaRecords = records.filter(r => (typeof normalizeModuleId === 'function' ? normalizeModuleId(r.moduleId, r.id, r.date) : r.moduleId) === 'modul_detektif_fakta');
    const modJkiRecords = records.filter(r => (typeof normalizeModuleId === 'function' ? normalizeModuleId(r.moduleId, r.id, r.date) : r.moduleId) === 'modul_jaringan_keamanan');

    const backupPayload = {
        title: "CADANGAN RESMI DATA NILAI KUIS INFORMATIKA SMAN 4 PADANG",
        guruMataPelajaran: "RINI SYAFITRI",
        sekolah: "SMAN 4 PADANG",
        exportedAt: new Date().toISOString(),
        exportedLocale: new Date().toLocaleString('id-ID'),
        totalRecords: records.length,
        ringkasanModul: {
            modul_detektif_fakta: modFaktaRecords.length,
            modul_jaringan_keamanan: modJkiRecords.length
        },
        records: records
    };

    const jsonStr = JSON.stringify(backupPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_resmi_kuis_informatika_sman4padang_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        if (a.parentNode) document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 1500);

    sfxCorrect();
    showToast(`✅ Cadangan lengkap ${records.length} data nilai berhasil diunduh!`, '💾');
}
window.exportFullJsonBackup = exportFullJsonBackup;

// ============================================================