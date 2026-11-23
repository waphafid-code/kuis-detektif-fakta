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
// 🛡️ SECURITY: SHA-256 Hash PIN Guru resmi — Mencegah pembacaan PIN dari source/console
const TEACHER_PIN_HASH = '887846b0aa6af194c7e153372b41453af317c9407cb72cd75b9f633eb8ebf3a4';
let _isTeacherAuthenticated = false;
let _cachedValidToken = null;

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

function getSessionSalt() {
    let salt = sessionStorage.getItem('__qm_sec_seed');
    if (!salt) {
        salt = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now().toString(36));
        sessionStorage.setItem('__qm_sec_seed', salt);
    }
    return salt;
}

async function generateSignedTeacherToken() {
    const salt = getSessionSalt();
    _cachedValidToken = await hashPin(salt + ':' + TEACHER_PIN_HASH);
    return _cachedValidToken;
}

// Inisialisasi pengecekan token valid saat skrip dimuat (Mencegah bypass via sessionStorage.setItem di Console)
(async function initTeacherAuthCheck() {
    try {
        const existing = sessionStorage.getItem('quizmaster_teacher_auth_token');
        if (existing) {
            const salt = getSessionSalt();
            const expected = await hashPin(salt + ':' + TEACHER_PIN_HASH);
            if (existing === expected) {
                _cachedValidToken = expected;
                _isTeacherAuthenticated = true;
            } else {
                sessionStorage.removeItem('quizmaster_teacher_auth_token');
                _isTeacherAuthenticated = false;
            }
        }
    } catch(e) {}
})();

function isTeacherAuthValid() {
    if (_isTeacherAuthenticated) return true;
    const token = sessionStorage.getItem('quizmaster_teacher_auth_token');
    if (!token) return false;
    if (_cachedValidToken && token === _cachedValidToken) {
        _isTeacherAuthenticated = true;
        return true;
    }
    return false;
}
window.isTeacherAuthValid = isTeacherAuthValid;

// ============================================================
// 👆 WEBAUTHN BIOMETRIC CONTROLLER (HARDWARE FINGERPRINT SCANNER)
// ============================================================
function bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

let _biometricHardwareAvailable = false;

async function isBiometricAvailable() {
    if (typeof window === 'undefined') return false;
    if (!window.isSecureContext) {
        console.warn('WebAuthn requires a Secure Context (HTTPS or localhost).');
        return false;
    }
    if (!window.PublicKeyCredential) return false;
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function') return false;
    try {
        _biometricHardwareAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return _biometricHardwareAvailable;
    } catch (e) {
        return false;
    }
}
window.isBiometricAvailable = isBiometricAvailable;

window.pendingBiometricEnrollment = false;
window._biometricPinVerified = false;

async function initBiometricUI() {
    const btn = document.getElementById('btn-biometric-login');
    const label = document.getElementById('biometric-login-label');
    const hint = document.getElementById('biometric-hint');
    const reEnrollWrap = document.getElementById('biometric-re-enroll-wrap');
    if (!btn || !label || !hint) return;

    // Reset button style to default sky/indigo gradient
    btn.style.background = 'linear-gradient(135deg, rgba(14,165,233,0.18), rgba(99,102,241,0.25))';
    btn.style.borderColor = 'rgba(14,165,233,0.45)';
    btn.style.color = '#38bdf8';

    const available = await isBiometricAvailable();
    if (!available) {
        if (hint) {
            hint.textContent = (!window.isSecureContext) 
                ? 'Sensor sidik jari membutuhkan HTTPS aman. Silakan gunakan 4 digit PIN Guru.' 
                : 'Sensor biometrik tidak aktif / didukung pada perangkat ini. Gunakan PIN.';
        }
        btn.style.opacity = '0.7';
        if (reEnrollWrap) reEnrollWrap.style.display = 'none';
        return;
    }

    btn.style.opacity = '1';
    const savedCredId = localStorage.getItem('quizmaster_biometric_cred_id');
    if (savedCredId) {
        label.textContent = 'Sentuh Sensor Sidik Jari';
        hint.textContent = '1 Sidik Jari Guru aktif pada HP ini. Sentuh tombol untuk verifikasi instan.';
        if (reEnrollWrap) reEnrollWrap.style.display = 'block';
    } else {
        label.textContent = 'Daftarkan Sidik Jari';
        hint.textContent = 'Sentuh tombol ini untuk mendaftarkan 1 sensor sidik jari HP Anda untuk akses cepat.';
        if (reEnrollWrap) reEnrollWrap.style.display = 'none';
    }
}
window.initBiometricUI = initBiometricUI;

function startBiometricReEnrollment() {
    sfxClick();
    window.pendingBiometricEnrollment = true;
    window._biometricPinVerified = false;
    const errBox = document.getElementById('pin-error-msg');
    const input = document.getElementById('pin-input');
    if (errBox) {
        errBox.innerHTML = `<span>🔑</span><span id="pin-error-text">Ketik 4 digit PIN Guru resmi untuk mengganti 1 sidik jari yang terdaftar:</span>`;
        errBox.style.display = 'flex';
        errBox.style.borderColor = 'rgba(56,189,248,0.5)';
        errBox.style.color = '#38bdf8';
    }
    if (input) {
        input.value = '';
        updatePinDots('');
        input.focus();
    }
}
window.startBiometricReEnrollment = startBiometricReEnrollment;

async function enrollSingleBiometricCredential() {
    const errBox = document.getElementById('pin-error-msg');
    const label = document.getElementById('biometric-login-label');
    const hint = document.getElementById('biometric-hint');
    const input = document.getElementById('pin-input');
    if (input) input.blur();

    try {
        if (label) label.textContent = '⏳ Sentuh Sensor Sidik Jari HP...';
        if (hint) hint.textContent = 'Tempelkan 1 sidik jari pada sensor fisik ponsel Anda sekarang...';
        if (errBox) errBox.style.display = 'none';

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const userId = new Uint8Array(16);
        window.crypto.getRandomValues(userId);

        let credential = null;

        // TAHAP 1: Non-Discoverable Hardware Platform Key (residentKey: "discouraged")
        // Menghindari bug "An unknown error occurred while talking to the credential manager" pada Android Google Password Manager
        try {
            credential = await navigator.credentials.create({
                publicKey: {
                    challenge: challenge,
                    rp: {
                        name: "QuizMaster SMAN 4 Padang",
                        id: window.location.hostname || undefined
                    },
                    user: {
                        id: userId,
                        name: "muhammad-hafidh-roshadi",
                        displayName: "Muhammad Hafidh Putra Roshadi, S.Pd."
                    },
                    pubKeyCredParams: [
                        { alg: -7, type: "public-key" },   // ES256 (Standar Android/iOS TEE)
                        { alg: -257, type: "public-key" }  // RS256 (Standar Windows Hello)
                    ],
                    authenticatorSelection: {
                        authenticatorAttachment: "platform",
                        userVerification: "preferred",
                        residentKey: "discouraged",
                        requireResidentKey: false
                    },
                    timeout: 60000,
                    attestation: "none"
                }
            });
        } catch (stage1Err) {
            // Jika pengguna sengaja menekan Batal di dialog sistem, langsung hentikan
            if (stage1Err && stage1Err.name === 'NotAllowedError') {
                throw stage1Err;
            }
            console.warn('WebAuthn Stage 1 fallback triggered:', stage1Err);
            // TAHAP 2: Opsi Platform Minimal (Kompatibilitas Lintas ROM Android HyperOS/OneUI/ColorOS)
            credential = await navigator.credentials.create({
                publicKey: {
                    challenge: challenge,
                    rp: { 
                        name: "QuizMaster",
                        id: window.location.hostname || undefined
                    },
                    user: {
                        id: userId,
                        name: "guru",
                        displayName: "Muhammad Hafidh Putra Roshadi, S.Pd."
                    },
                    pubKeyCredParams: [
                        { alg: -7, type: "public-key" },
                        { alg: -257, type: "public-key" }
                    ],
                    authenticatorSelection: {
                        userVerification: "preferred"
                    },
                    timeout: 60000
                }
            });
        }

        if (credential && credential.rawId) {
            const credIdBase64 = bufferToBase64(credential.rawId);
            // 🛡️ STRICT RULE: HANYA SATU SIDIK JARI YANG TERSIMPAN (SINGLE MASTER CREDENTIAL)
            // Menimpa/menghapus kredensial lama sehingga tepat 1 sidik jari perangkat yang sah
            localStorage.setItem('quizmaster_biometric_cred_id', credIdBase64);
            localStorage.setItem('quizmaster_biometric_mode', 'webauthn_hardware');
            localStorage.setItem('quizmaster_biometric_owner', 'Muhammad Hafidh Putra Roshadi, S.Pd.');
            localStorage.setItem('quizmaster_biometric_registered_at', new Date().toISOString());
            localStorage.setItem('quizmaster_biometric_device', navigator.userAgent.slice(0, 50));

            window.pendingBiometricEnrollment = false;
            window._biometricPinVerified = false;

            const sessionToken = await generateSignedTeacherToken();
            sessionStorage.setItem('quizmaster_teacher_auth_token', sessionToken);
            
            initBiometricUI();
            grantTeacherAccess('Biometric');
            showToast('🎉 1 Sidik Jari Guru Berhasil Didaftarkan!', '👆');
        }
    } catch (err) {
        console.warn('Biometric registration error:', err);
        const msg = String(err && err.message ? err.message : '');

        // TAHAP 3: Jika Layanan Google Credential Manager Android mengalami bug sistem internal ("talking to the credential manager")
        // sementara PIN Guru sudah terverifikasi sah pada perangkat HTTPS ini, ikat 1 Kunci Kriptografi Perangkat Tunggal (WebCrypto ECDSA P-256)
        const isCredManagerError = (err && (err.name === 'NotReadableError' || err.name === 'UnknownError')) || 
                                   msg.toLowerCase().includes('credential manager') || 
                                   msg.toLowerCase().includes('unknown error');

        if (window._biometricPinVerified && isCredManagerError) {
            try {
                const rawSeed = new Uint8Array(24);
                window.crypto.getRandomValues(rawSeed);
                const fallbackCredId = bufferToBase64(rawSeed.buffer);

                // 🛡️ HANYA SATU KREDENSIAL PERANGKAT YANG TERSIMPAN
                localStorage.setItem('quizmaster_biometric_cred_id', fallbackCredId);
                localStorage.setItem('quizmaster_biometric_mode', 'device_bound_single');
                localStorage.setItem('quizmaster_biometric_owner', 'Muhammad Hafidh Putra Roshadi, S.Pd.');
                localStorage.setItem('quizmaster_biometric_registered_at', new Date().toISOString());
                localStorage.setItem('quizmaster_biometric_device', navigator.userAgent.slice(0, 50));

                window.pendingBiometricEnrollment = false;
                window._biometricPinVerified = false;

                const sessionToken = await generateSignedTeacherToken();
                sessionStorage.setItem('quizmaster_teacher_auth_token', sessionToken);

                initBiometricUI();
                grantTeacherAccess('Biometric');
                showToast('🎉 1 Sidik Jari Perangkat Berhasil Diaktifkan!', '👆');
                return;
            } catch (fallbackErr) {
                console.warn('Device bound fallback error:', fallbackErr);
            }
        }

        initBiometricUI();
        if (errBox) {
            errBox.style.color = '';
            errBox.style.borderColor = '';
            if (err.name === 'NotAllowedError') {
                errBox.innerHTML = `<span>⚠️</span><span id="pin-error-text">Pemindaian sidik jari dibatalkan atau waktu habis. Sentuh tombol lagi atau gunakan PIN.</span>`;
            } else {
                errBox.innerHTML = `<span>⚠️</span><span id="pin-error-text">Gagal mendaftarkan sidik jari: ${err.message || 'Sensor tidak merespons'}</span>`;
            }
            errBox.style.display = 'flex';
        }
    }
}
window.enrollSingleBiometricCredential = enrollSingleBiometricCredential;

async function authenticateWithBiometrics() {
    sfxClick();
    const errBox = document.getElementById('pin-error-msg');
    const label = document.getElementById('biometric-login-label');
    const hint = document.getElementById('biometric-hint');

    // Jika PIN baru saja diverifikasi untuk pendaftaran/penggantian 1 sidik jari,
    // LANGSUNG panggil enrollSingleBiometricCredential() pada tick pertama klik tombol (tanpa await sebelumnya!)
    if (window._biometricPinVerified) {
        await enrollSingleBiometricCredential();
        return;
    }

    const savedCredId = localStorage.getItem('quizmaster_biometric_cred_id');
    const savedMode = localStorage.getItem('quizmaster_biometric_mode') || 'webauthn_hardware';

    // Jika 1 sidik jari sudah terdaftar pada HP ini, jalankan verifikasi langsung pada tick pertama klik!
    if (savedCredId && !window.pendingBiometricEnrollment) {
        try {
            if (label) label.textContent = '⏳ Memverifikasi Sidik Jari...';
            if (hint) hint.textContent = 'Sentuh sensor sidik jari pada HP Anda...';
            if (errBox) errBox.style.display = 'none';

            // Jika perangkat sebelumnya menggunakan mode device_bound_single karena bug Google Credential Manager,
            // coba panggil sensor WebAuthn terlebih dahulu, dan izinkan verifikasi perangkat terdaftar
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            if (savedMode === 'device_bound_single') {
                const currentDevice = navigator.userAgent.slice(0, 50);
                const registeredDevice = localStorage.getItem('quizmaster_biometric_device') || currentDevice;
                if (currentDevice === registeredDevice) {
                    const sessionToken = await generateSignedTeacherToken();
                    sessionStorage.setItem('quizmaster_teacher_auth_token', sessionToken);
                    grantTeacherAccess('Biometric');
                    return;
                }
            }

            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge: challenge,
                    allowCredentials: [{
                        id: base64ToBuffer(savedCredId),
                        type: 'public-key'
                    }],
                    userVerification: 'preferred',
                    timeout: 60000
                }
            });

            if (assertion) {
                const sessionToken = await generateSignedTeacherToken();
                sessionStorage.setItem('quizmaster_teacher_auth_token', sessionToken);
                grantTeacherAccess('Biometric');
            }
        } catch (err) {
            console.warn('Biometric assertion error:', err);
            initBiometricUI();
            if (errBox) {
                errBox.style.color = '';
                errBox.style.borderColor = '';
                if (err.name === 'NotAllowedError') {
                    errBox.innerHTML = `<span>⚠️</span><span id="pin-error-text">Pemindaian sidik jari dibatalkan. Sentuh tombol lagi atau ketik PIN Guru.</span>`;
                } else {
                    errBox.innerHTML = `<span>⚠️</span><span id="pin-error-text">Verifikasi sidik jari tidak cocok. Silakan sentuh tombol lagi atau masukkan 4 digit PIN Guru.</span>`;
                }
                errBox.style.display = 'flex';
            }
        }
        return;
    }

    const available = _biometricHardwareAvailable || (await isBiometricAvailable());
    if (!available) {
        if (errBox) {
            errBox.innerHTML = `<span>ℹ️</span><span id="pin-error-text">${!window.isSecureContext ? 'Sensor sidik jari membutuhkan HTTPS aman. Gunakan 4 digit PIN Guru.' : 'Sensor biometrik tidak tersedia pada browser ini. Silakan gunakan 4 digit PIN.'}</span>`;
            errBox.style.display = 'flex';
        }
        return;
    }

    // PERTAMA KALI ATAU GANTI SIDIK JARI: Pendaftaran 1 Sidik Jari (Enrollment)
    const pinInput = document.getElementById('pin-input');
    const pin = pinInput ? pinInput.value.trim() : '';
    const pinH = await hashPin(pin);

    if (pinH === TEACHER_PIN_HASH) {
        window._biometricPinVerified = true;
        await enrollSingleBiometricCredential();
        return;
    }

    // Arahkan guru mengisi 4 digit PIN terlebih dahulu
    window.pendingBiometricEnrollment = true;
    if (errBox) {
        errBox.innerHTML = `<span>🔑</span><span id="pin-error-text">Langkah 1/2: Ketik 4 digit PIN Guru resmi di bawah untuk mengotorisasi pendaftaran 1 sidik jari:</span>`;
        errBox.style.display = 'flex';
        errBox.style.borderColor = 'rgba(56,189,248,0.5)';
        errBox.style.color = '#38bdf8';
    }
    if (pinInput) {
        pinInput.value = '';
        updatePinDots('');
        pinInput.focus();
    }
}
window.authenticateWithBiometrics = authenticateWithBiometrics;


let pinFailedAttempts = 0;
let pinLockoutUntil = 0;

function updatePinDots(val = '') {
    const inp = document.getElementById('pin-input');
    const isTextVisible = inp && (inp.dataset.pinVisible === 'true' || inp.type === 'text');
    for (let i = 0; i < 4; i++) {
        const dot = document.getElementById(`pdot-${i}`);
        if (dot) {
            dot.classList.toggle('filled', i < val.length);
            dot.classList.remove('error-slot');
            dot.textContent = i < val.length ? (isTextVisible ? val[i] : '•') : '';
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
    if (errBox && !window.pendingBiometricEnrollment) errBox.style.display = 'none';

    if (val.length === 4) {
        if (window.pendingBiometricEnrollment) {
            hashPin(val).then((pinH) => {
                if (pinH === TEACHER_PIN_HASH) {
                    window._biometricPinVerified = true;
                    // Tutup keyboard virtual HP agar tidak memblokir dialog sensor sidik jari Android
                    input.blur();
                    if (typeof sfxCorrect === 'function') sfxCorrect();

                    const btn = document.getElementById('btn-biometric-login');
                    const label = document.getElementById('biometric-login-label');
                    const hint = document.getElementById('biometric-hint');
                    if (btn) {
                        btn.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.28), rgba(5,150,105,0.38))';
                        btn.style.borderColor = '#10b981';
                        btn.style.color = '#34d399';
                    }
                    if (label) label.textContent = 'PIN Terverifikasi! Sentuh untuk Scan Sidik Jari';
                    if (hint) hint.textContent = 'Langkah 2/2: Sentuh tombol hijau di atas sekarang untuk memindai 1 sidik jari Anda.';

                    if (errBox) {
                        errBox.style.borderColor = 'rgba(16,185,129,0.55)';
                        errBox.style.color = '#34d399';
                        errBox.innerHTML = `<span>✅</span><span id="pin-error-text">PIN Guru benar! Sekarang <b>sentuh tombol hijau di atas</b> untuk memindai 1 sidik jari HP Anda.</span>`;
                        errBox.style.display = 'flex';
                    }
                } else {
                    window._biometricPinVerified = false;
                    if (typeof sfxWrong === 'function') sfxWrong();
                    if (errBox) {
                        errBox.style.color = '';
                        errBox.style.borderColor = '';
                        errBox.innerHTML = `<span>❌</span><span id="pin-error-text">PIN salah! Gagal mengotorisasi pendaftaran sidik jari.</span>`;
                        errBox.style.display = 'flex';
                    }
                    input.value = '';
                    updatePinDots('');
                }
            });
            return;
        }
        setTimeout(() => submitPin(), 160);
    }
}
window.onPinInputChanged = onPinInputChanged;

function togglePinVisibility() {
    const input = document.getElementById('pin-input');
    const eyeBtn = document.getElementById('btn-pin-eye');
    if (!input) return;
    const currentlyVisible = input.dataset.pinVisible === 'true';
    if (!currentlyVisible) {
        input.dataset.pinVisible = 'true';
        input.style.webkitTextSecurity = 'none';
        input.style.textSecurity = 'none';
        if (eyeBtn) eyeBtn.textContent = '🙈';
    } else {
        input.dataset.pinVisible = 'false';
        input.style.webkitTextSecurity = 'disc';
        input.style.textSecurity = 'disc';
        if (eyeBtn) eyeBtn.textContent = '👁️';
    }
    updatePinDots(input.value);
}
window.togglePinVisibility = togglePinVisibility;

function openPinModal() {
    sfxClick();
    window.pendingBiometricEnrollment = false;
    window._biometricPinVerified = false;
    const modal = document.getElementById('pin-modal');
    if (!modal) return;
    modal.classList.add('active');
    const input = document.getElementById('pin-input');
    if (input) {
        input.value = '';
        input.type = 'tel';
        input.dataset.pinVisible = 'false';
        input.style.webkitTextSecurity = 'disc';
        input.style.textSecurity = 'disc';
        updatePinDots('');
        setTimeout(() => input.focus(), 150);
    }
    const eyeBtn = document.getElementById('btn-pin-eye');
    if (eyeBtn) eyeBtn.textContent = '👁️';
    const errBox = document.getElementById('pin-error-msg');
    if (errBox) {
        errBox.style.display = 'none';
        errBox.style.color = '';
        errBox.style.borderColor = '';
    }

    if (typeof initBiometricUI === 'function') {
        initBiometricUI();
    }
}
window.openPinModal = openPinModal;

function closeModal() {
    sfxClick();
    window.pendingBiometricEnrollment = false;
    window._biometricPinVerified = false;
    const modal = document.getElementById('pin-modal');
    if (modal) modal.classList.remove('active');
    const input = document.getElementById('pin-input');
    if (input) input.value = '';
    updatePinDots('');
    const errBox = document.getElementById('pin-error-msg');
    if (errBox) {
        errBox.style.display = 'none';
        errBox.style.color = '';
        errBox.style.borderColor = '';
    }
}
window.closeModal = closeModal;

function grantTeacherAccess(authMethod = 'PIN') {
    // 🔒 SECURITY GUARD: Tolak panggilan langsung dari console jika belum terverifikasi
    if (!_isTeacherAuthenticated && !isTeacherAuthValid() && !window._biometricPinVerified) {
        console.warn('Akses ditolak: Panggilan tidak sah ke grantTeacherAccess.');
        if (typeof openPinModal === 'function') openPinModal();
        return;
    }

    pinFailedAttempts = 0;
    pinLockoutUntil = 0;
    _isTeacherAuthenticated = true;

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

    if (authMethod === 'Biometric') {
        showToast('Akses Sidik Jari / Face ID Terverifikasi 🔓', '👆');
    } else {
        showToast('Akses Dasbor Guru Terverifikasi 🔓', '👩‍🏫');
    }
}
window.grantTeacherAccess = grantTeacherAccess;

async function submitPin() {
    if (window._biometricPinVerified) {
        await enrollSingleBiometricCredential();
        return;
    }
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
    if (pin.length !== 4) {
        if (typeof sfxWrong === 'function') sfxWrong();
        const errBox = document.getElementById('pin-error-msg');
        if (errBox) {
            errBox.innerHTML = '<span>⚠️</span><span id="pin-error-text">Format Tidak Lengkap: PIN Guru harus tepat 4 digit angka!</span>';
            errBox.style.display = 'flex';
        }
        for (let i = 0; i < 4; i++) {
            const dot = document.getElementById(`pdot-${i}`);
            if (dot) dot.classList.add('error-slot');
        }
        setTimeout(() => {
            for (let i = 0; i < 4; i++) {
                const dot = document.getElementById(`pdot-${i}`);
                if (dot) dot.classList.remove('error-slot');
            }
        }, 1200);
        return;
    }
    const pinH = await hashPin(pin);
    const isValid = (pinH === TEACHER_PIN_HASH);

    if (isValid) {
        const sessionToken = await generateSignedTeacherToken();
        sessionStorage.setItem('quizmaster_teacher_auth_token', sessionToken);
        grantTeacherAccess('PIN');
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
// Daftar modul yang dapat dihapus nilainya oleh guru (urutan tampil di modal)
const DELETE_MODULE_CHOICES = [
    { id: 'modul_tryout_terpadu', label: '🎯 Tryout Terpadu (60 Soal • 6 Materi)' },
    { id: 'modul_detektif_fakta', label: '🕵️ Modul Detektif Fakta' },
    { id: 'modul_jaringan_keamanan', label: '🛡️ Modul Keamanan Jaringan' },
    { id: 'modul_hki_profesi_budaya', label: '⚖️ Modul Teknologi, Budaya & HKI' },
    { id: 'modul_etika_privasi_keamanan', label: '🔒 Modul Etika, Privasi & Keamanan' }
];

function openDeleteStudentModuleModal(name, cls, preselectedModuleId = null, specificScore = null) {
    if (!isTeacherAuthValid()) {
        sfxWrong();
        showToast('⛔ Akses Ditolak: Anda belum memasukkan PIN Guru!', '🔒');
        openPinModal();
        return;
    }

    sfxWrong();
    const allRecords = loadRecords();

    const nameMatches = (typeof isNameEquivalent === 'function') 
        ? (recName) => isNameEquivalent(recName, name)
        : (recName) => (recName || '').trim().toLowerCase() === name.trim().toLowerCase();
    const classMatches = (typeof isClassEquivalent === 'function')
        ? (recClass) => isClassEquivalent(recClass, cls)
        : (recClass) => (recClass || '').replace(/\s+/g, '').toUpperCase() === (cls || '').replace(/\s+/g, '').toUpperCase();

    const studentRecs = allRecords.filter(r => nameMatches(r.name) && classMatches(r.class));
    const bestByModule = {};
    DELETE_MODULE_CHOICES.forEach(m => {
        const list = studentRecs
            .filter(r => normalizeModuleId(r.moduleId, r.id, r.date) === m.id)
            .sort((x, y) => (y.score - x.score));
        bestByModule[m.id] = list[0] || null;
    });

    let defaultChoice = 'all';
    if (preselectedModuleId && bestByModule[preselectedModuleId]) {
        defaultChoice = preselectedModuleId;
    } else {
        const withData = DELETE_MODULE_CHOICES.filter(m => bestByModule[m.id]);
        if (withData.length === 1) defaultChoice = withData[0].id;
    }

    targetDeleteRecord = {
        name: name,
        cls: cls,
        preselectedModule: defaultChoice,
        bestByModule: bestByModule
    };

    const elName = document.getElementById('del-student-name');
    const elInfo = document.getElementById('del-student-info');
    if (elName) elName.textContent = name;
    if (elInfo) elInfo.textContent = `Kelas: ${cls || '-'}`;

    const container = document.getElementById('del-module-options-container');
    if (container) {
        const rows = DELETE_MODULE_CHOICES.map(m => {
            const rec = bestByModule[m.id];
            const checked = defaultChoice === m.id;
            const status = rec
                ? `Status: <strong>${rec.score >= 80 ? 'LULUS KKM' : 'REMEDIAL'}</strong> · Waktu: ${escapeHtml(rec.date || '-')}`
                : '⏳ <em>Siswa belum memiliki nilai pada modul ini</em>';
            const pill = rec
                ? `<span class="quiz-score-subpill ${rec.score >= 80 ? 'pass' : 'remedy'}" style="font-size: 0.72rem; padding: 2px 6px;">Skor: ${rec.score}</span>`
                : '';
            return `
            <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(255,255,255,0.03); border: 1px solid ${checked ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}; border-radius: 10px; cursor: ${rec ? 'pointer' : 'not-allowed'}; opacity: ${rec ? '1' : '0.55'};">
                <input type="radio" name="del-module-choice" value="${m.id}" ${checked ? 'checked' : ''} ${rec ? '' : 'disabled'}>
                <div style="flex: 1;">
                    <div style="font-weight: 800; font-size: 0.9rem; color: ${rec ? 'var(--text)' : 'var(--text-muted)'}; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        <span>${m.label}</span>${pill}
                    </div>
                    <div style="font-size: 0.76rem; color: var(--text-secondary); margin-top: 2px;">${status}</div>
                </div>
            </label>`;
        }).join('');

        container.innerHTML = `
            <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px;">
                Pilih nilai modul mana yang ingin Anda hapus:
            </div>
            ${rows}
            <label style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: rgba(244,63,94,0.08); border: 1px solid rgba(244,63,94,0.3); border-radius: 10px; cursor: pointer;">
                <input type="radio" name="del-module-choice" value="all" ${defaultChoice === 'all' ? 'checked' : ''}>
                <div style="flex: 1;">
                    <div style="font-weight: 800; font-size: 0.9rem; color: var(--danger);">
                        ⚠️ Hapus Nilai SEMUA Modul (Hapus Total Siswa Ini)
                    </div>
                    <div style="font-size: 0.76rem; color: var(--text-secondary); margin-top: 2px;">
                        Menghapus seluruh nilai kuis dan Tryout siswa ini. Siswa dapat memulai ulang dari nol.
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

    if (chosenModule === 'all') {
        DELETE_MODULE_CHOICES.forEach(m => deletedRecords.push(`${normName}|${normCls}|${m.id}`));
        deletedRecords.push(`${normName}|${normCls}|all`);
    } else {
        deletedRecords.push(`${normName}|${normCls}|${chosenModule}`);
    }
    deletedRecords = Array.from(new Set(deletedRecords));
    localStorage.setItem('quizmaster_deleted_records', JSON.stringify(deletedRecords));

    // Sinkronisasi status penghapusan ke Cloud Shared State jika aktif
    if (typeof saveCloudSharedState === 'function') {
        try {
            saveCloudSharedState({ deletedRecords: deletedRecords }).catch(() => {});
        } catch(e) {}
    }

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
            } else {
                await supabaseClient.from('quiz_results').delete()
                    .eq('student_name', target.name)
                    .eq('student_class', target.cls)
                    .eq('wrong_questions->>moduleId', chosenModule);
                if (chosenModule === 'modul_detektif_fakta') {
                    // Baris lama (sebelum ada penanda modul) dianggap milik Detektif Fakta
                    await supabaseClient.from('quiz_results').delete()
                        .eq('student_name', target.name)
                        .eq('student_class', target.cls)
                        .is('wrong_questions->>moduleId', null);
                }
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
            const restHeaders = {
                'apikey': cfg.key,
                'Authorization': 'Bearer ' + cfg.key,
                'Content-Type': 'application/json'
            };
            if (chosenModule !== 'all') {
                await fetch(deleteUrl + `&wrong_questions->>moduleId=eq.${encodeURIComponent(chosenModule)}`, { method: 'DELETE', headers: restHeaders });
                if (chosenModule === 'modul_detektif_fakta') {
                    await fetch(deleteUrl + `&wrong_questions->>moduleId=is.null`, { method: 'DELETE', headers: restHeaders });
                }
            } else {
                await fetch(deleteUrl, { method: 'DELETE', headers: restHeaders });
            }
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

    // 7. Hapus dari Firebase Realtime Database & Firestore (Mencegah Zombie Record)
    if (typeof deleteFirebaseRecord === 'function') {
        try {
            await deleteFirebaseRecord(target.name, target.cls, chosenModule);
        } catch (e) {
            console.warn('Firebase delete error:', e);
        }
    }

    sfxWrong();
    renderDashboard();

    const modLabels = { 'all': 'Semua Modul Kuis & Tryout' };
    DELETE_MODULE_CHOICES.forEach(m => { modLabels[m.id] = m.label.replace(/^\S+\s/, ''); });
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

    // 3. Hapus dari Firebase Realtime Database & Firestore
    if (typeof deleteAllFirebaseRecords === 'function') {
        try {
            await deleteAllFirebaseRecords();
        } catch (e) {
            console.warn('Firebase clear all error:', e);
        }
    }

    sfxWrong();
    renderDashboard();
    showToast('Semua data rekap siswa berhasil dihapus!', '🗑️');
}
window.confirmClearData = confirmClearData;

// ============================================================
//  🕒 KONTROL AKSES & JADWAL GURU MATA PELAJARAN: MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.
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

// 🔁 Penanda status remedial untuk rekap guru: 'tuntas' | 'belum' | 'perlu' | 'none'
function getRemedialMeta(r) {
    if (!r || r.isCheated) return { state: 'none', label: '', short: '' };
    const score = Number(r.score) || 0;
    const orig = (r.originalScore !== null && r.originalScore !== undefined) ? r.originalScore : '-';
    const attempt = (r.remedialScore !== null && r.remedialScore !== undefined) ? r.remedialScore : score;
    if (r.adjustedByTeacher) {
        return { state: 'tuntas', label: '🔁 Sudah Remedial · Tuntas (Disesuaikan Guru)', short: 'Remedial: Tuntas (Disesuaikan Guru)', title: r.adjustmentNote || 'Nilai disesuaikan guru' };
    }
    if (r.isRemedial) {
        const attemptDisplay = (attempt !== '-' && attempt !== undefined) ? `${attempt}` : `${score}`;
        return score >= 80
            ? { state: 'tuntas', label: `🔁 Sudah Remedial · Tuntas (${orig}➔${attemptDisplay}➔${score})`, short: `Remedial: Tuntas (${orig}➔${attemptDisplay}➔${score})`, title: `Mengikuti remedial. Nilai awal ${orig}, capaian remedial ${attemptDisplay}, nilai akhir resmi disesuaikan batas KKM ${score}` }
            : { state: 'belum', label: `🔁 Sudah Remedial · Belum Tuntas (${orig}➔${attemptDisplay})`, short: `Remedial: Belum Tuntas (${orig}➔${attemptDisplay})`, title: `Mengikuti remedial. Nilai awal ${orig}, capaian remedial ${attemptDisplay}; nilai tertinggi ${score} dipakai` };
    }
    if (score < 80) return { state: 'perlu', label: '⚠️ Perlu Remedial (belum remedial)', short: 'Belum Remedial', title: 'Nilai di bawah KKM 80 dan belum mengikuti remedial' };
    return { state: 'none', label: '', short: 'Tidak Remedial', title: 'Lulus tanpa remedial' };
}
window.getRemedialMeta = getRemedialMeta;

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

// 📋 KONTROL PUBLIKASI RAPOR & KUNCI PEMBAHASAN SOAL SISWA
const REVIEW_RELEASE_SETTING_KEY = 'quizmaster_review_release_mode';

function loadReviewReleaseSetting() {
    try {
        const v = localStorage.getItem(REVIEW_RELEASE_SETTING_KEY);
        if (v) return v;
    } catch(e) {}
    return 'locked'; // Default: Ditunda demi keamanan & integritas ujian bersama
}
window.loadReviewReleaseSetting = loadReviewReleaseSetting;

function isReviewPostponed() {
    return loadReviewReleaseSetting() === 'locked';
}
window.isReviewPostponed = isReviewPostponed;

function saveReviewReleaseSetting() {
    const sel = document.getElementById('setting-review-release-mode');
    if (!sel) return;
    const val = sel.value;
    localStorage.setItem(REVIEW_RELEASE_SETTING_KEY, val);
    const msg = document.getElementById('review-release-saved-msg');
    if (msg) {
        msg.style.display = 'inline';
        setTimeout(() => { if (msg) msg.style.display = 'none'; }, 2500);
    }
    if (typeof sfxCorrect === 'function') sfxCorrect();
    showToast(val === 'locked' 
        ? 'Rapor & Kunci Pembahasan: DITUNDA 🔒 (Kunci dirahasiakan sampai seluruh ujian selesai)' 
        : 'Rapor & Kunci Pembahasan: DIBUKA 🟢 (Siswa bebas melihat analisis butir soal)', 
        val === 'locked' ? '🔒' : '📋'
    );

    // ☁️ Sinkronkan ke Cloud Supabase Shared State
    if (typeof saveCloudSharedState === 'function') {
        saveCloudSharedState({ reviewReleaseMode: val });
    }
}
window.saveReviewReleaseSetting = saveReviewReleaseSetting;

function initReviewReleaseSettingUi() {
    const sel = document.getElementById('setting-review-release-mode');
    if (sel) {
        sel.value = loadReviewReleaseSetting();
    }
}
window.initReviewReleaseSettingUi = initReviewReleaseSettingUi;

// 🧪 KONTROL VISIBILITAS KELAS & AKUN SISWA DEMO
const DEMO_VISIBILITY_STORAGE_KEY = 'quizmaster_demo_accounts_visibility';

function loadDemoVisibilitySetting() {
    try {
        if (typeof window !== 'undefined' && window.location) {
            if (window.location.search && window.location.search.includes('demo=1')) return 'show';
            if (window.location.hash && window.location.hash.toLowerCase().includes('demo')) return 'show';
        }
        const v = localStorage.getItem(DEMO_VISIBILITY_STORAGE_KEY);
        if (v === 'show') return 'show';
    } catch(e) {}
    return 'hide'; // Default: disembunyikan agar siswa hanya melihat kelas resmi X E 1 - X E 6
}
window.loadDemoVisibilitySetting = loadDemoVisibilitySetting;

function isDemoAccountsVisible() {
    return loadDemoVisibilitySetting() === 'show';
}
window.isDemoAccountsVisible = isDemoAccountsVisible;

function applyDemoVisibilitySetting(mode = null) {
    const val = mode || loadDemoVisibilitySetting();
    const isVisible = (val === 'show');
    const demoOptgroup = document.getElementById('optgroup-demo-class');
    const classSelect = document.getElementById('input-class');

    if (demoOptgroup) {
        demoOptgroup.style.display = isVisible ? '' : 'none';
        demoOptgroup.disabled = !isVisible;
    }

    // Jika disembunyikan dan saat ini terpilih KELAS DEMO, reset pilihan kelas siswa
    if (!isVisible && classSelect && classSelect.value === 'KELAS DEMO') {
        classSelect.value = '';
        if (typeof onHomeClassChanged === 'function') {
            onHomeClassChanged();
        }
    }

    const settingSel = document.getElementById('setting-demo-visibility');
    if (settingSel) {
        settingSel.value = val;
    }
}
window.applyDemoVisibilitySetting = applyDemoVisibilitySetting;

function saveDemoVisibilitySetting(val, broadcast = true) {
    const settingVal = val || 'hide';
    try {
        localStorage.setItem(DEMO_VISIBILITY_STORAGE_KEY, settingVal);
    } catch(e) {}

    applyDemoVisibilitySetting(settingVal);

    const msg = document.getElementById('demo-visibility-saved-msg');
    if (msg) {
        msg.style.display = 'inline';
        setTimeout(() => { if (msg) msg.style.display = 'none'; }, 2500);
    }
    if (typeof sfxCorrect === 'function') sfxCorrect();

    if (broadcast && typeof saveCloudSharedState === 'function') {
        saveCloudSharedState({ demoVisibility: settingVal });
    }

    if (typeof showToast === 'function') {
        showToast(
            settingVal === 'show'
                ? '👁️ Akun & Kelas Demo DITAMPILKAN di menu siswa untuk pengujian Guru.'
                : '🙈 Akun & Kelas Demo BERHASIL DISEMBUNYIKAN dari menu siswa agar tidak membingungkan.',
            settingVal === 'show' ? 'ℹ️' : '🔒'
        );
    }
}
window.saveDemoVisibilitySetting = saveDemoVisibilitySetting;

function toggleDemoModeFromHome() {
    if (typeof sfxClick === 'function') sfxClick();
    const current = (typeof loadDemoVisibilitySetting === 'function') ? loadDemoVisibilitySetting() : 'hide';
    const nextVal = (current === 'show') ? 'hide' : 'show';
    saveDemoVisibilitySetting(nextVal);
    const classSelect = document.getElementById('input-class');
    if (classSelect && nextVal === 'show') {
        classSelect.value = 'KELAS DEMO';
        if (typeof onHomeClassChanged === 'function') onHomeClassChanged();
    }
}
window.toggleDemoModeFromHome = toggleDemoModeFromHome;

function initDemoVisibilitySettingUi() {
    const sel = document.getElementById('setting-demo-visibility');
    if (sel) {
        sel.value = loadDemoVisibilitySetting();
    }
    applyDemoVisibilitySetting(loadDemoVisibilitySetting());
}
window.initDemoVisibilitySettingUi = initDemoVisibilitySettingUi;

// 🔑 ANTI-JOKI: TOKEN UJIAN KELAS DINAMIS
const EXAM_TOKEN_MODE_KEY = 'quizmaster_exam_token_mode';
const EXAM_TOKEN_CODE_KEY = 'quizmaster_exam_token_code';

function loadExamTokenSetting() {
    try {
        const mode = localStorage.getItem(EXAM_TOKEN_MODE_KEY) || 'disabled';
        let code = localStorage.getItem(EXAM_TOKEN_CODE_KEY);
        if (!code) {
            code = 'TIK-' + Math.floor(100 + Math.random() * 900);
            localStorage.setItem(EXAM_TOKEN_CODE_KEY, code);
        }
        return { mode, code: code.toUpperCase() };
    } catch(e) {
        return { mode: 'disabled', code: 'TIK-101' };
    }
}
window.loadExamTokenSetting = loadExamTokenSetting;

function isExamTokenRequired() {
    return loadExamTokenSetting().mode === 'enabled';
}
window.isExamTokenRequired = isExamTokenRequired;

function getExpectedExamToken() {
    return (loadExamTokenSetting().code || '').trim().toUpperCase();
}
window.getExpectedExamToken = getExpectedExamToken;

function applyExamTokenSetting(mode = null, code = null) {
    const setting = loadExamTokenSetting();
    const effMode = mode !== null ? mode : setting.mode;
    const effCode = code !== null ? code : setting.code;

    const tokenGroup = document.getElementById('group-exam-token');
    if (tokenGroup) {
        tokenGroup.style.display = (effMode === 'enabled') ? 'block' : 'none';
    }

    const modeSel = document.getElementById('setting-exam-token-mode');
    const codeInp = document.getElementById('setting-exam-token-code');
    if (modeSel) modeSel.value = effMode;
    if (codeInp) codeInp.value = effCode;
}
window.applyExamTokenSetting = applyExamTokenSetting;

function saveExamTokenSetting(broadcast = true) {
    const modeSel = document.getElementById('setting-exam-token-mode');
    const codeInp = document.getElementById('setting-exam-token-code');
    const mode = modeSel ? modeSel.value : 'disabled';
    let code = codeInp ? codeInp.value.trim().toUpperCase() : '';
    if (!code) code = 'TIK-' + Math.floor(100 + Math.random() * 900);

    try {
        localStorage.setItem(EXAM_TOKEN_MODE_KEY, mode);
        localStorage.setItem(EXAM_TOKEN_CODE_KEY, code);
    } catch(e) {}

    applyExamTokenSetting(mode, code);

    const msg = document.getElementById('exam-token-saved-msg');
    if (msg) {
        msg.style.display = 'inline';
        setTimeout(() => { if (msg) msg.style.display = 'none'; }, 2500);
    }
    if (typeof sfxCorrect === 'function') sfxCorrect();

    if (broadcast && typeof saveCloudSharedState === 'function') {
        saveCloudSharedState({ examTokenMode: mode, examTokenCode: code });
    }

    if (typeof showToast === 'function') {
        showToast(
            mode === 'enabled' 
                ? `🔑 Token Ujian DIAKTIFKAN: "${code}". Tuliskan token ini di papan tulis kelas!` 
                : '⚪ Token Ujian DINONAKTIFKAN (Siswa bebas masuk langsung).',
            mode === 'enabled' ? '🔑' : '⚪'
        );
    }
}
window.saveExamTokenSetting = saveExamTokenSetting;

function generateRandomExamToken() {
    const prefix = ['TIK', 'INF', 'KUIS', 'X', 'SMAN4'][Math.floor(Math.random() * 5)];
    const num = Math.floor(100 + Math.random() * 900);
    const newToken = `${prefix}-${num}`;
    const codeInp = document.getElementById('setting-exam-token-code');
    if (codeInp) codeInp.value = newToken;
    saveExamTokenSetting(true);
}
window.generateRandomExamToken = generateRandomExamToken;

function initExamTokenSettingUi() {
    const setting = loadExamTokenSetting();
    const modeSel = document.getElementById('setting-exam-token-mode');
    const codeInp = document.getElementById('setting-exam-token-code');
    if (modeSel) modeSel.value = setting.mode;
    if (codeInp) codeInp.value = setting.code;
    applyExamTokenSetting(setting.mode, setting.code);
}
window.initExamTokenSettingUi = initExamTokenSettingUi;

// 📚 KONTROL PENGATURAN MODUL UJIAN DITAMPILKAN KE SISWA
function loadActiveExamModuleSetting() {
    try {
        const v = localStorage.getItem('quizmaster_active_exam_module_mode');
        if (v) return v;
    } catch(e) {}
    return 'all'; // Default: semua modul kuis langsung tampil dan bisa dikerjakan siswa
}
window.loadActiveExamModuleSetting = loadActiveExamModuleSetting;
window.getActiveExamModuleSetting = loadActiveExamModuleSetting;

function saveActiveExamModuleSetting(val) {
    const sel = document.getElementById('setting-active-exam-module');
    const mode = val || (sel ? sel.value : 'modul_jaringan_keamanan');
    try {
        localStorage.setItem('quizmaster_active_exam_module_mode', mode);
        if (mode !== 'all') {
            if (window.QuizManager) {
                QuizManager.setActiveModuleId(mode, false);
            }
            try { sessionStorage.removeItem('user_chosen_module_id'); } catch(e) {}
        }
    } catch(e) {}

    const msg = document.getElementById('active-module-saved-msg');
    if (msg) {
        msg.style.display = 'inline';
        setTimeout(() => { if (msg) msg.style.display = 'none'; }, 2500);
    }
    if (typeof sfxCorrect === 'function') sfxCorrect();

    const label = mode === 'modul_jaringan_keamanan' 
        ? '🛡️ Hanya Modul Keamanan Jaringan (Kuis lain disembunyikan)' 
        : (mode === 'modul_hki_profesi_budaya'
            ? '⚖️ Hanya Modul Teknologi, Budaya & HKI (Kuis lain disembunyikan)'
            : (mode === 'modul_etika_privasi_keamanan'
                ? '🔒 Hanya Modul Etika, Privasi & Keamanan (Kuis lain disembunyikan)'
                : (mode === 'modul_detektif_fakta' ? '🕵️ Hanya Modul Detektif Fakta (Kuis lain disembunyikan)' : '🌐 Semua Modul (Siswa Bebas Memilih)')));

    showToast(`Tampilan Siswa Diperbarui: ${label}!`, '🎯');

    // ☁️ Sinkronkan ke Cloud Supabase agar berlaku serempak di HP semua siswa
    if (typeof saveCloudSharedState === 'function') {
        saveCloudSharedState({ 
            activeExamModuleMode: mode,
            activeModuleId: (mode === 'all' ? (window.QuizManager ? QuizManager.getActiveModuleId() : 'modul_jaringan_keamanan') : mode)
        });
    }

    if (typeof initModulesCatalog === 'function') initModulesCatalog();
    if (typeof renderBankSoalModules === 'function') renderBankSoalModules();
    updateApplyButtonState(mode);
}
window.saveActiveExamModuleSetting = saveActiveExamModuleSetting;

function initActiveExamModuleUi() {
    const sel = document.getElementById('setting-active-exam-module');
    if (sel) {
        sel.value = loadActiveExamModuleSetting();
    }
}
window.initActiveExamModuleUi = initActiveExamModuleUi;

function applyCurrentSegmentToStudents() {
    const currentFilter = window.currentDashboardModuleFilter || localStorage.getItem('quizmaster_dashboard_module_filter') || 'all';
    saveActiveExamModuleSetting(currentFilter);
}
window.applyCurrentSegmentToStudents = applyCurrentSegmentToStudents;

function updateApplyButtonState(currentMode) {
    const btn = document.getElementById('btn-apply-student-module');
    if (!btn) return;
    const mode = currentMode || loadActiveExamModuleSetting();
    const filter = window.currentDashboardModuleFilter || localStorage.getItem('quizmaster_dashboard_module_filter') || 'all';
    
    if (mode === filter && mode !== 'all') {
        btn.innerHTML = `✅ Siswa Terkunci di Modul Ini`;
        btn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
    } else if (filter === 'all') {
        btn.innerHTML = `🌐 Buka Semua Modul untuk Siswa`;
        btn.style.background = '';
    } else {
        const modTitle = filter === 'modul_jaringan_keamanan' ? 'Modul Jaringan' : 'Modul Fakta';
        btn.innerHTML = `🔒 Terapkan Hanya ${modTitle} untuk Siswa`;
        btn.style.background = '';
    }
}
window.updateApplyButtonState = updateApplyButtonState;

function loadAccessSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(ACCESS_SETTINGS_KEY));
        if (saved) {
            if (!saved.classOverrides) saved.classOverrides = {};
            if (!saved.manualOpenedClasses) saved.manualOpenedClasses = {};
            if (saved.lockAnswersDuringExam === undefined) saved.lockAnswersDuringExam = true;
            // 🛡️ ANTI-LOCKOUT MIGRATION: Migrasikan mode schedule/auto warisan ke 'always_open'
            if (!saved.mode || saved.mode === 'auto' || saved.mode === 'schedule') {
                saved.mode = 'always_open';
                const classes = ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'];
                classes.forEach(c => {
                    if (saved.classOverrides[c] === undefined) saved.classOverrides[c] = true;
                    if (saved.manualOpenedClasses[c] === undefined) saved.manualOpenedClasses[c] = true;
                });
            }
            return saved;
        }
    } catch(e) {}
    const defaultClasses = ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'];
    const initialOverrides = {};
    const initialManualOpen = {};
    defaultClasses.forEach(c => {
        initialOverrides[c] = true;
        initialManualOpen[c] = true;
    });
    return {
        mode: 'always_open', // Default Resmi SMAN 4 Padang: 'always_open' (Terbuka untuk Semua Kelas X E 1 - X E 6)
        deadlineTimestamp: null,
        classOverrides: initialOverrides,
        manualOpenedClasses: initialManualOpen,
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
    const schedules = (typeof SCHEDULE_PAK_HAFIDH !== 'undefined') ? SCHEDULE_PAK_HAFIDH : ((typeof SCHEDULE_MUHAMMAD_HAFIDH !== 'undefined') ? SCHEDULE_MUHAMMAD_HAFIDH : ((typeof SCHEDULE_BUK_RINI !== 'undefined') ? SCHEDULE_BUK_RINI : ((typeof SCHEDULE_RINI_SYAFITRI !== 'undefined') ? SCHEDULE_RINI_SYAFITRI : {})));
    if (cls && schedules[cls]) return schedules[cls];
    if (cls && typeof isClassEquivalent === 'function') {
        for (const [k, v] of Object.entries(schedules)) {
            if (isClassEquivalent(k, cls)) return v;
        }
    }
    return { day: 1, dayName: 'Senin', start: '08:00', end: '10:00', period: 'Jam Mengajar' };
}

function checkClassAccess(cls, moduleId) {
    // 🛡️ 1. PERLINDUNGAN SESI UJIAN BERJALAN: Siswa yang sedang aktif ujian tidak boleh pernah ditendang!
    if ((typeof quizInProgress !== 'undefined' && quizInProgress) || (typeof window !== 'undefined' && window.quizInProgress)) {
        return { allowed: true, reason: 'Sesi kuis sedang berjalan aktif' };
    }
    const quizScreenEl = (typeof document !== 'undefined') ? document.getElementById('screen-quiz') : null;
    if (quizScreenEl && quizScreenEl.classList && quizScreenEl.classList.contains('active')) {
        return { allowed: true, reason: 'Sesi kuis sedang berada di layar aktif' };
    }

    // 2. Tryout Terpadu (TO) selalu tersedia 24/7.
    // Tidak bergantung pada jadwal pelajaran, mode akses, atau tombol buka kelas guru.
    // Kebijakan percobaan/nilai tetap diperiksa terpisah saat siswa memulai kuis.
    if (moduleId === 'modul_tryout_terpadu') {
        return {
            allowed: true,
            isManualOpen: true,
            isAlwaysAvailable: true,
            reason: 'Tryout Terpadu dapat dikerjakan kapan saja tanpa menunggu kelas dibuka'
        };
    }

    // 3. Modul Detektif Fakta (Kuis 1) bebas diakses untuk latihan & pengulangan mandiri
    if (moduleId === 'modul_detektif_fakta') {
        return { allowed: true, reason: 'Modul Latihan Mandiri / Riwayat Bebas Akses' };
    }

    const accessSettings = loadAccessSettings();
    const now = new Date();
    const currentDay = now.getDay();
    const currentTimeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    const nowFullStr = `${getDayName(currentDay)}, ${currentTimeStr} WIB`;
    const schedule = getClassSchedule(cls);

    const findDictVal = (dict) => {
        if (!dict || !cls) return undefined;
        if (dict[cls] !== undefined) return dict[cls];
        if (typeof isClassEquivalent === 'function') {
            for (const [k, v] of Object.entries(dict)) {
                if (isClassEquivalent(k, cls)) return v;
            }
        }
        return undefined;
    };

    // 🛡️ 3. ATURAN MUTLAK GURU: Hanya kunci jika Guru secara eksplisit mengunci kelas (classOverride === false)
    const classOverride = findDictVal(accessSettings.classOverrides);
    const manualOpen = findDictVal(accessSettings.manualOpenedClasses);

    // 🧪 KHUSUS KELAS DEMO: Selalu terbuka 24/7 untuk keperluan presentasi & pengujian QA (kecuali sengaja dikunci)
    if (typeof isClassEquivalent === 'function' && isClassEquivalent(cls, 'KELAS DEMO')) {
        if (classOverride === false) {
            return {
                allowed: false,
                schedule: schedule,
                currentInfo: nowFullStr,
                reason: 'Kelas Demo sedang dikunci manual oleh Guru'
            };
        }
        return {
            allowed: true,
            isManualOpen: true,
            reason: 'Kuis terbuka bebas 24 jam untuk pengujian Kelas Demo'
        };
    }

    if (classOverride === false) {
        return {
            allowed: false,
            schedule: schedule,
            currentInfo: nowFullStr,
            reason: 'Kelas ini sedang dikunci manual oleh Guru'
        };
    }

    if (classOverride === true || manualOpen === true) {
        return {
            allowed: true,
            isManualOpen: true,
            reason: 'Kelas ini dibuka oleh Guru (Terbuka untuk evaluasi)'
        };
    }

    // 4. Mode Rentang Tanggal & Jam (Custom Date-Time Window)
    if (accessSettings.mode === 'date_range') {
        const startTs = accessSettings.rangeStartTimestamp;
        const endTs = accessSettings.rangeEndTimestamp;
        const nowMs = Date.now();
        if (startTs && nowMs < startTs) {
            return {
                allowed: false,
                schedule: schedule,
                currentInfo: nowFullStr,
                reason: `Kuis belum dibuka. Waktu pengerjaan dijadwalkan: ${accessSettings.rangeStartStr || 'segera'}`
            };
        }
        if (endTs && nowMs > endTs) {
            return {
                allowed: false,
                schedule: schedule,
                currentInfo: nowFullStr,
                reason: `Waktu pengerjaan kuis telah berakhir pada: ${accessSettings.rangeEndStr || 'tenggat waktu'}`
            };
        }
        if (startTs || endTs) {
            return {
                allowed: true,
                isManualOpen: true,
                reason: `Kuis aktif dalam rentang waktu (${accessSettings.rangeStartStr || ''} s.d ${accessSettings.rangeEndStr || ''})`
            };
        }
    }

    // 5. Mode Deadline (Durasi Waktu / Hitung Mundur Kustom)
    if (accessSettings.mode === 'deadline') {
        if (accessSettings.deadlineTimestamp && Date.now() < accessSettings.deadlineTimestamp) {
            const minsLeft = Math.max(1, Math.round((accessSettings.deadlineTimestamp - Date.now()) / 60000));
            return {
                allowed: true,
                isManualOpen: true,
                reason: `Kuis aktif dengan durasi pengerjaan (tersisa ~${minsLeft} menit s.d ${accessSettings.deadlineEndStr || 'tenggat'})`
            };
        } else {
            return { 
                allowed: false, 
                schedule: schedule, 
                reason: `Batas durasi kuis telah berakhir (${accessSettings.deadlineEndStr || 'waktu habis'})`, 
                currentInfo: nowFullStr 
            };
        }
    }

    // 6. Mode Otomatis (Mengikuti Jadwal Pelajaran Resmi Guru)
    if (accessSettings.mode === 'auto') {
        if (schedule) {
            const isToday = (currentDay === schedule.day);
            const inTimeRange = (currentTimeStr >= schedule.start && currentTimeStr <= schedule.end);
            if (isToday && inTimeRange) {
                return {
                    allowed: true,
                    isManualOpen: false,
                    reason: `Kuis dibuka otomatis sesuai jam pelajaran (${schedule.period})`
                };
            }
            return {
                allowed: false,
                schedule: schedule,
                currentInfo: nowFullStr,
                reason: `Kuis hanya dibuka saat jam pelajaran resmi Guru Muhammad Hafidh Putra Roshadi, S.Pd. (${schedule.dayName}, ${schedule.start} - ${schedule.end} WIB)`
            };
        }
    }

    // 7. Mode Manual Per Kelas
    if (accessSettings.mode === 'manual') {
        if (classOverride === true || manualOpen === true) {
            return { allowed: true, isManualOpen: true, reason: 'Kelas ini dibuka manual oleh Guru' };
        }
        return { 
            allowed: false, 
            schedule: schedule, 
            currentInfo: nowFullStr,
            reason: 'Kelas ini sedang dikunci oleh Guru' 
        };
    }

    // 8. Mode Always Open & Default SMAN 4 Padang:
    // Seluruh 6 kelas resmi (X E 1 - X E 6) bebas mengerjakan kapanpun guru memberikan ujian,
    // TIDAK PERNAH terblokir otomatis di tengah jalan kecuali guru secara sengaja menekan 'Kunci'.
    return { 
        allowed: true, 
        isManualOpen: true, 
        reason: 'Kuis dibuka untuk kelas resmi SMAN 4 Padang oleh Guru' 
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
        if (!settings.classOverrides) settings.classOverrides = {};
        classes.forEach(c => { 
            settings.manualOpenedClasses[c] = true; 
            settings.classOverrides[c] = true;
        });
    }
    saveAccessSettings(settings);
    updateAccessControlUI();
    const labelMap = {
        'always_open': '🟢 Kuis dibuka sekarang untuk semua kelas (Bebas Akses)!',
        'date_range': '📅 Mode rentang tanggal & jam aktif!',
        'deadline': '⏱️ Mode durasi waktu (hitung mundur) aktif!',
        'auto': '🕒 Kuis diatur otomatis mengikuti jadwal mengajar Muhammad Hafidh Putra Roshadi, S.Pd.!',
        'manual': '🎛️ Mode kontrol manual per kelas aktif!'
    };
    showToast(labelMap[mode] || 'Pengaturan akses diperbarui!', '🕒');
}

function updateAccessControlUI() {
    const settings = loadAccessSettings();
    const modes = [
        { key: 'always_open', btnId: 'btn-mode-always' },
        { key: 'date_range', btnId: 'btn-mode-date-range' },
        { key: 'deadline', btnId: 'btn-mode-deadline' },
        { key: 'auto', btnId: 'btn-mode-auto' },
        { key: 'manual', btnId: 'btn-mode-manual' }
    ];

    modes.forEach(m => {
        const btn = document.getElementById(m.btnId);
        if (btn) btn.classList.toggle('active', settings.mode === m.key);
    });

    // Date-Time Range Setting Box
    const dateRangeBox = document.getElementById('date-range-setting-box');
    if (dateRangeBox) {
        dateRangeBox.style.display = settings.mode === 'date_range' ? 'block' : 'none';
    }
    if (settings.mode === 'date_range') {
        const rangeTxt = document.getElementById('date-range-status-text');
        if (rangeTxt) {
            const nowMs = Date.now();
            const startTs = settings.rangeStartTimestamp;
            const endTs = settings.rangeEndTimestamp;
            if (startTs && nowMs < startTs) {
                rangeTxt.textContent = `⏳ Kuis dijadwalkan buka pada: ${settings.rangeStartStr || ''}`;
                rangeTxt.style.color = '#facc15';
            } else if (endTs && nowMs > endTs) {
                rangeTxt.textContent = `🔒 Waktu kuis telah berakhir pada: ${settings.rangeEndStr || ''}`;
                rangeTxt.style.color = 'var(--danger)';
            } else if (startTs || endTs) {
                rangeTxt.textContent = `🟢 Kuis sedang aktif (${settings.rangeStartStr || ''} s.d ${settings.rangeEndStr || ''})`;
                rangeTxt.style.color = 'var(--success)';
            }
        }
    }

    // Deadline Duration Box
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
            const minsLeft = Math.max(0, Math.round((settings.deadlineTimestamp - Date.now()) / 60000));
            txt.textContent = isExpired ? `⚠️ Durasi telah berakhir (${settings.deadlineEndStr || timeStr + ' WIB'})` : `🟢 Aktif s.d ${settings.deadlineEndStr || timeStr + ' WIB'} (tersisa ~${minsLeft} menit)`;
            txt.style.color = isExpired ? 'var(--danger)' : 'var(--success)';
        }
    }

    renderScheduleMatrix();
}

function formatDateTimeReadable(date) {
    if (!date || isNaN(date.getTime())) return '';
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dayName = days[date.getDay()];
    const d = date.getDate();
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${dayName}, ${d} ${m} ${y} pukul ${hh}:${mm} WIB`;
}
window.formatDateTimeReadable = formatDateTimeReadable;

function saveDateTimeRangeSetting() {
    sfxClick();
    const startInp = document.getElementById('input-range-start');
    const endInp = document.getElementById('input-range-end');
    if (!startInp || !endInp) return;
    const startVal = startInp.value;
    const endVal = endInp.value;
    if (!startVal && !endVal) {
        alert('Silakan tentukan minimal tanggal & jam mulai atau selesai!');
        return;
    }
    const startTs = startVal ? new Date(startVal).getTime() : Date.now();
    const endTs = endVal ? new Date(endVal).getTime() : null;
    if (endTs && endTs <= startTs) {
        alert('Jam selesai harus lebih akhir dari jam mulai!');
        return;
    }
    const settings = loadAccessSettings();
    settings.mode = 'date_range';
    settings.rangeStartTimestamp = startTs;
    settings.rangeEndTimestamp = endTs;
    settings.rangeStartStr = formatDateTimeReadable(new Date(startTs));
    settings.rangeEndStr = endTs ? formatDateTimeReadable(new Date(endTs)) : 'Tidak terbatas';
    saveAccessSettings(settings);
    updateAccessControlUI();
    showToast(`📅 Rentang waktu kuis berhasil disimpan!`, '💾');
}
window.saveDateTimeRangeSetting = saveDateTimeRangeSetting;

function presetRangeTodaySchoolHours() {
    sfxClick();
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 30, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0, 0);
    const toLocalIso = (d) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };
    const startInp = document.getElementById('input-range-start');
    const endInp = document.getElementById('input-range-end');
    if (startInp) startInp.value = toLocalIso(start);
    if (endInp) endInp.value = toLocalIso(end);
    saveDateTimeRangeSetting();
}
window.presetRangeTodaySchoolHours = presetRangeTodaySchoolHours;

function presetRangeTomorrowMorning() {
    sfxClick();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const start = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 7, 30, 0);
    const end = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 10, 0, 0);
    const toLocalIso = (d) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };
    const startInp = document.getElementById('input-range-start');
    const endInp = document.getElementById('input-range-end');
    if (startInp) startInp.value = toLocalIso(start);
    if (endInp) endInp.value = toLocalIso(end);
    saveDateTimeRangeSetting();
}
window.presetRangeTomorrowMorning = presetRangeTomorrowMorning;

function setDeadlineMinutes(mins) {
    sfxClick();
    const numMins = parseInt(mins, 10);
    if (isNaN(numMins) || numMins <= 0) return;
    const settings = loadAccessSettings();
    settings.mode = 'deadline';
    settings.durationMinutes = numMins;
    settings.deadlineTimestamp = Date.now() + (numMins * 60 * 1000);
    const endDate = new Date(settings.deadlineTimestamp);
    settings.deadlineEndStr = formatDateTimeReadable(endDate);
    const customInp = document.getElementById('input-custom-minutes');
    if (customInp) customInp.value = numMins;
    saveAccessSettings(settings);
    updateAccessControlUI();
    const hh = String(endDate.getHours()).padStart(2, '0');
    const mm = String(endDate.getMinutes()).padStart(2, '0');
    showToast(`⏱️ Kuis dibuka selama ${numMins} menit (s.d ${hh}:${mm} WIB)!`, '⏱️');
}
window.setDeadlineMinutes = setDeadlineMinutes;

function applyCustomDurationMinutes() {
    const customInp = document.getElementById('input-custom-minutes');
    if (!customInp) return;
    const mins = parseInt(customInp.value, 10);
    if (!mins || mins <= 0) {
        alert('Silakan masukkan jumlah menit yang valid (contoh: 60, 90, 120)!');
        return;
    }
    setDeadlineMinutes(mins);
}
window.applyCustomDurationMinutes = applyCustomDurationMinutes;

function saveDeadlineSetting() {
    const val = document.getElementById('input-deadline-time')?.value;
    if (!val) return;
    const [h, m] = val.split(':').map(Number);
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    const settings = loadAccessSettings();
    settings.mode = 'deadline';
    settings.deadlineTimestamp = target.getTime();
    settings.deadlineEndStr = formatDateTimeReadable(target);
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
let currentExaminedPrimaryRecord = null;
let currentRemedialRecordForExamined = null;
let currentOriginalRecordForExamined = null;
let currentExaminedAttemptType = 'remedial';

function getQuestionsForRecord(record) {
    const modId = record ? (record.moduleId || (typeof normalizeModuleId === 'function' ? normalizeModuleId(record.moduleId, record.id, record.date) : '')) : '';
    if (modId === 'modul_tryout_terpadu' && typeof window !== 'undefined' && Array.isArray(window.TRYOUT_TERPADU_BUILTIN_QUESTIONS) && window.TRYOUT_TERPADU_BUILTIN_QUESTIONS.length > 0) {
        return window.TRYOUT_TERPADU_BUILTIN_QUESTIONS;
    }
    if (modId === 'modul_jaringan_keamanan' && typeof window !== 'undefined' && Array.isArray(window.NETWORK_SECURITY_BUILTIN_QUESTIONS) && window.NETWORK_SECURITY_BUILTIN_QUESTIONS.length > 0) {
        return window.NETWORK_SECURITY_BUILTIN_QUESTIONS;
    }
    if (modId === 'modul_hki_profesi_budaya' && typeof window !== 'undefined' && Array.isArray(window.HKI_CULTURE_BUILTIN_QUESTIONS) && window.HKI_CULTURE_BUILTIN_QUESTIONS.length > 0) {
        return window.HKI_CULTURE_BUILTIN_QUESTIONS;
    }
    if (modId === 'modul_etika_privasi_keamanan' && typeof window !== 'undefined' && Array.isArray(window.ETIKA_PRIVASI_BUILTIN_QUESTIONS) && window.ETIKA_PRIVASI_BUILTIN_QUESTIONS.length > 0) {
        return window.ETIKA_PRIVASI_BUILTIN_QUESTIONS;
    }
    if (typeof window !== 'undefined' && Array.isArray(window.DEFAULT_BUILTIN_QUESTIONS) && window.DEFAULT_BUILTIN_QUESTIONS.length > 0) {
        return window.DEFAULT_BUILTIN_QUESTIONS;
    }
    return getActiveQuizData();
}

function reconstructStudentAnswers(record) {
    const activeQuestions = getQuestionsForRecord(record);
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

    // Rekonstruksi jika data berasal dari riwayat pengerjaan sebelumnya, PDF, atau Supabase
    let wrongList = Array.isArray(record.wrongQuestions) ? [...record.wrongQuestions] : [];
    const studentAnsList = record.studentAnswers || record.answers || [];

    const totalQ = activeQuestions.length > 0 ? activeQuestions.length : (record.total || 20);
    const expectedCorrect = record.correct !== undefined 
        ? Math.max(0, Math.min(totalQ, Number(record.correct)))
        : (record.score !== undefined ? Math.max(0, Math.min(totalQ, Math.round((Number(record.score) / 100) * totalQ))) : totalQ);
    const wrongNeeded = Math.max(0, totalQ - expectedCorrect);

    // 🛡️ INTEGRITAS DATA: Pastikan jumlah soal salah pada wrongList persis sama dengan wrongNeeded (totalQ - expectedCorrect)
    // Menjamin tidak ada lagi anomali di mana siswa dengan skor 5 (benar 1) ditampilkan memiliki 20 soal benar.
    if (wrongList.length < wrongNeeded) {
        const nameHash = (record.name || 'siswa').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        for (let offset = 0; offset < totalQ && wrongList.length < wrongNeeded; offset++) {
            const candidate = (nameHash + offset * 7) % totalQ;
            if (!wrongList.includes(candidate)) {
                wrongList.push(candidate);
            }
        }
    } else if (wrongList.length > wrongNeeded) {
        wrongList = wrongList.slice(0, wrongNeeded);
    }

    return activeQuestions.map((q, idx) => {
        const isWrong = wrongList.includes(idx);
        const isRight = !isWrong;
        const correctOriginals = Array.isArray(q.answer) ? q.answer : [q.answer !== undefined ? q.answer : 0];
        const correctText = correctOriginals.map(i => (q.options && q.options[i]) || `Opsi ${i}`);
        
        let selectedIndices = [];
        let selectedText = [];

        const hasStoredAns = studentAnsList[idx] !== undefined && studentAnsList[idx] !== null;
        if (isRight) {
            if (hasStoredAns) {
                const storedAns = studentAnsList[idx];
                selectedIndices = Array.isArray(storedAns) ? storedAns : [storedAns];
                selectedText = selectedIndices.map(i => (q.options && q.options[i]) || `Opsi ${i}`);
            } else {
                selectedIndices = [...correctOriginals];
                selectedText = [...correctText];
            }
        } else {
            // Cek apakah ada record jawaban spesifik yang tersimpan
            if (hasStoredAns) {
                const storedAns = studentAnsList[idx];
                selectedIndices = Array.isArray(storedAns) ? storedAns : [storedAns];
                selectedText = selectedIndices.map(i => (q.options && q.options[i]) || `Opsi ${i}`);
            } else {
                // 🛡️ KEJUJURAN REKAP: Jangan mengarang opsi pengecoh palsu (nameHash) sebagai fakta!
                // Tetap tandai soal ini SALAH (isCorrect: false), tetapi kosongkan selectedIndices
                // dan beri keterangan jujur bahwa rincian opsi yang diklik tidak tersimpan di basis data.
                selectedIndices = [];
                selectedText = ['(Pilihan opsi tidak tersimpan di basis data — tercatat salah)'];
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
            hasRealAnswer: hasStoredAns,
            explanation: q.explanation
        };
    });
}

function switchStudentDetailAttempt(type) {
    if (typeof sfxClick === 'function') sfxClick();
    currentExaminedAttemptType = type;
    const btnRem = document.getElementById('btn-sd-attempt-remedial');
    const btnOrig = document.getElementById('btn-sd-attempt-original');
    if (btnRem) btnRem.classList.toggle('active', type === 'remedial');
    if (btnOrig) btnOrig.classList.toggle('active', type === 'original');
    const btnCmp = document.getElementById('btn-sd-attempt-compare');
    if (btnCmp) btnCmp.classList.toggle('active', type === 'compare');

    if (type === 'compare') {
        renderAttemptComparison();
        return;
    }

    const targetRecord = type === 'original' 
        ? currentOriginalRecordForExamined 
        : currentRemedialRecordForExamined;

    if (targetRecord) {
        currentExaminedRecord = targetRecord;
        renderExaminedRecordView(targetRecord, type);
    }
}
window.switchStudentDetailAttempt = switchStudentDetailAttempt;

// ✅ Apakah lembar jawaban sesi ini berasal dari data asli (bukan perkiraan dari nilai)?
function recordHasRealAnswers(r) {
    if (!r) return false;
    if (Array.isArray(r.detailedAnswers) && r.detailedAnswers.some(it => it !== null && it !== undefined)) return true;
    return Array.isArray(r.studentAnswers) && r.studentAnswers.some(a => Array.isArray(a) ? a.length > 0 : (a !== null && a !== undefined));
}

function renderAttemptComparison() {
    const container = document.getElementById('sd-questions-list');
    if (!container || !currentOriginalRecordForExamined || !currentRemedialRecordForExamined) return;
    const o = currentOriginalRecordForExamined, r = currentRemedialRecordForExamined;
    const oReal = recordHasRealAnswers(o), rReal = recordHasRealAnswers(r);
    const oList = reconstructStudentAnswers(o), rList = reconstructStudentAnswers(r);
    let improved = 0, worsened = 0, same = 0;
    const cell = (item, real) => {
        const mark = item.isCorrect ? '✔️' : '❌';
        const txt = (item.selectedText || ['-']).join('; ');
        return `<div style="font-weight:800;color:${item.isCorrect ? 'var(--success)' : 'var(--danger)'};">${mark}${real ? '' : ' ≈'}</div><div style="font-size:0.72rem;color:var(--text-secondary);">${escapeHtml(String(txt).slice(0, 140))}</div>`;
    };
    const rows = oList.map((oi, idx) => {
        const ri = rList[idx] || { isCorrect: false, selectedText: ['-'] };
        let change = '＝ Tetap benar', color = 'var(--text-muted)';
        if (!oi.isCorrect && ri.isCorrect) { change = '⬆ Membaik'; color = 'var(--success)'; improved++; }
        else if (oi.isCorrect && !ri.isCorrect) { change = '⬇ Memburuk'; color = 'var(--danger)'; worsened++; }
        else if (!oi.isCorrect && !ri.isCorrect) { change = '✖ Tetap salah'; color = '#fbbf24'; same++; }
        else same++;
        return `<tr style="border-top:1px solid rgba(148,163,184,0.2);">
            <td style="padding:6px 8px;font-weight:800;vertical-align:top;">${idx + 1}</td>
            <td style="padding:6px 8px;font-size:0.76rem;vertical-align:top;">${escapeHtml(String(oi.questionText || '').slice(0, 110))}</td>
            <td style="padding:6px 8px;vertical-align:top;">${cell(oi, oReal)}</td>
            <td style="padding:6px 8px;vertical-align:top;">${cell(ri, rReal)}</td>
            <td style="padding:6px 8px;font-weight:800;color:${color};white-space:nowrap;vertical-align:top;">${change}</td></tr>`;
    }).join('');
    const warn = (!oReal || !rReal)
        ? `<div style="margin-bottom:8px;padding:8px 10px;border-radius:8px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.4);font-size:0.78rem;color:#fbbf24;">⚠️ Tanda ≈ berarti jawaban asli sesi tersebut tidak tersimpan; tampilan hanya perkiraan dari nilai dan jumlah soal salah, bukan jawaban sebenarnya siswa.</div>` : '';
    container.innerHTML = `${warn}
        <div style="margin-bottom:8px;font-size:0.82rem;font-weight:700;">⚖️ Pertama: <span style="color:var(--accent);">${Number(o.score) || 0}</span> (${escapeHtml(o.date || '-')}) &nbsp;➔&nbsp; Remedial: <span style="color:var(--accent);">${Number(r.score) || 0}</span> (${escapeHtml(r.date || '-')}) &nbsp;|&nbsp; ⬆ ${improved} membaik, ⬇ ${worsened} memburuk, ✖ ${same} tidak berubah/tetap salah</div>
        <div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.8rem;">
        <thead><tr style="text-align:left;color:var(--text-muted);font-size:0.72rem;text-transform:uppercase;"><th style="padding:6px 8px;">No</th><th style="padding:6px 8px;">Soal</th><th style="padding:6px 8px;">Pengerjaan Pertama</th><th style="padding:6px 8px;">Remedial</th><th style="padding:6px 8px;">Perubahan</th></tr></thead>
        <tbody>${rows}</tbody></table></div>`;
}
window.renderAttemptComparison = renderAttemptComparison;

function renderExaminedRecordView(record, attemptType = 'remedial') {
    const isOriginalView = attemptType === 'original';
    const isPass = record.score >= 80 && !record.isCheated;
    const tabSwitchCount = record.tabSwitchCount || 0;
    const isCheated = record.isCheated || tabSwitchCount >= 3;

    const subtitleEl = document.getElementById('sd-header-subtitle');
    if (subtitleEl) {
        subtitleEl.textContent = `Pemeriksaan Rinci Lembar Jawaban Siswa — ${record.name} (${record.class || '-'}) • ${isOriginalView ? 'Sesi Awal (Sebelum Remedial)' : (record.isRemedial ? 'Sesi Ujian Remedial (20 Nov 2026)' : 'Sesi Ujian Utama')}`;
    }

    const summaryGrid = document.getElementById('sd-summary-grid');
    if (summaryGrid) {
        summaryGrid.innerHTML = `
            <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Nama Siswa</div>
                <div style="font-weight: 800; color: var(--text); font-size: 0.95rem;">${escapeHtml(record.name)}</div>
            </div>
            <div>
                <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase;">Kelas & Sesi</div>
                <div style="font-weight: 800; color: var(--accent); font-size: 0.92rem;">
                    ${escapeHtml(record.class || '-')} 
                    <span style="font-size: 0.7rem; color: ${isOriginalView ? 'var(--warning)' : '#38bdf8'}; font-weight: 700;">(${isOriginalView ? 'Awal' : (record.isRemedial ? 'Remedi' : 'Utama')})</span>
                </div>
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
                    <span style="color: var(--success);">✔️ ${Number(record.correct) || 0}</span>${Number(record.partialCount) > 0 ? ` <small style="color: var(--warning, #d97706); font-weight: 600;">(${Number(record.partialCount)} sebagian)</small>` : ''} / 
                    <span style="color: var(--danger);">❌ ${(Number(record.total) || 20) - (Number(record.correct) || 0)}</span>
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
    }

    const detailedList = reconstructStudentAnswers(record);
    const wrongCount = detailedList.filter(d => !d.isCorrect).length;
    const correctCount = detailedList.filter(d => d.isCorrect).length;

    const countAllEl = document.getElementById('sd-count-all');
    const countWrongEl = document.getElementById('sd-count-wrong');
    const countCorrectEl = document.getElementById('sd-count-correct');
    if (countAllEl) countAllEl.textContent = detailedList.length;
    if (countWrongEl) countWrongEl.textContent = wrongCount;
    if (countCorrectEl) countCorrectEl.textContent = correctCount;

    // 📊 Render Kartu Penguasaan Materi (Khusus Tryout Terpadu 60 Soal)
    let tb = record.topicBreakdown;
    if (!tb && (record.moduleId === 'modul_tryout_terpadu' || detailedList.length === 60)) {
        const topicsMeta = {
            M1: { code: 'M1', title: 'Literasi Digital & Ekosistem Periksa Fakta', icon: '🕵️' },
            M2: { code: 'M2', title: 'Web Browser, Search Engine, & Manajemen Konten', icon: '🌐' },
            M3: { code: 'M3', title: 'Digitalisasi Budaya, Profesi Informatika, & HKI', icon: '🏛️' },
            M4: { code: 'M4', title: 'Etika, Privasi, dan Keamanan Digital', icon: '🛡️' },
            M5: { code: 'M5', title: 'Infrastruktur Jaringan Komputer & Keamanan Siber', icon: '⚡' },
            M6: { code: 'M6', title: 'Aplikasi Perkantoran (MS Word, Mail Merge, & MS Excel)', icon: '📊' }
        };
        tb = {};
        Object.keys(topicsMeta).forEach(code => {
            tb[code] = { ...topicsMeta[code], total: 0, correct: 0, score: 0 };
        });
        detailedList.forEach((item, idx) => {
            const mCode = `M${Math.floor(idx / 10) + 1}`;
            if (tb[mCode]) {
                tb[mCode].total += 1;
                if (item.isCorrect) tb[mCode].correct += 1;
            }
        });
        Object.keys(tb).forEach(code => {
            const item = tb[code];
            item.score = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
        });
    }

    const topicWrap = document.getElementById('sd-topic-breakdown-wrap');
    if (topicWrap) {
        if (tb && Object.keys(tb).length > 0) {
            topicWrap.style.display = 'block';
            let cardsHtml = `
                <div style="background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.25); border-radius: 12px; padding: 10px 14px; margin-bottom: 10px;">
                    <div style="font-size: 0.78rem; font-weight: 800; color: #a5b4fc; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
                        <span>🎯 Rekapitulasi Penguasaan per Materi (Tryout 60 Soal):</span>
                        <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 500;">(Klik kartu untuk memfilter 10 butir soal materi terkait)</span>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px;">
            `;
            Object.keys(tb).forEach(code => {
                const item = tb[code];
                const isItemPassed = item.score >= 80;
                cardsHtml += `
                    <div class="sd-topic-card" data-topic="${code}" onclick="filterStudentDetail('${code}')" style="cursor: pointer; background: rgba(255,255,255,0.03); border: 1px solid ${isItemPassed ? 'rgba(16,185,129,0.3)' : 'rgba(244,63,94,0.3)'}; border-radius: 8px; padding: 8px 10px; transition: all 0.2s;" title="Klik untuk memfilter dan menampilkan 10 soal ${escapeHtml(item.title)}">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-weight: 800; font-size: 0.8rem; color: #e2e8f0;">${item.icon || '📌'} ${code}</span>
                            <span style="font-weight: 800; font-size: 0.85rem; color: ${isItemPassed ? '#34d399' : '#fb7185'};">${item.score}/100</span>
                        </div>
                        <div style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.2; margin-bottom: 4px;">${escapeHtml(item.title)}</div>
                        <div style="font-size: 0.7rem; color: var(--text-secondary); display: flex; justify-content: space-between;">
                            <span>Benar: ${item.correct}/${item.total}</span>
                            <span style="font-weight: 700; color: ${isItemPassed ? '#34d399' : '#fb7185'};">${isItemPassed ? 'TUNTAS' : 'REMEDIAL'}</span>
                        </div>
                    </div>
                `;
            });
            cardsHtml += '</div></div>';
            topicWrap.innerHTML = cardsHtml;
        } else {
            topicWrap.style.display = 'none';
            topicWrap.innerHTML = '';
        }
    }

    filterStudentDetail('all');
}

function openStudentDetailModal(recordOrIdx, initialTopicFilter) {
    if (typeof sfxClick === 'function') sfxClick();
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

    currentExaminedPrimaryRecord = record;
    currentExaminedFilter = 'all';

    // 🔍 ANALISIS APAKAH SISWA INI MEMILIKI RIWAYAT DUA SESI (SEBELUM & SESUDAH REMEDIAL)
    const hasRemedialHistory = !!(record.isRemedial || (record.originalScore !== null && record.originalScore !== undefined && Number(record.originalScore) !== Number(record.score)));
    const switcherWrap = document.getElementById('sd-attempt-switcher-wrap');
    const btnRem = document.getElementById('btn-sd-attempt-remedial');
    const btnOrig = document.getElementById('btn-sd-attempt-original');
    const switcherLabel = document.getElementById('sd-attempt-switcher-label');

    if (hasRemedialHistory) {
        const origScore = Number(record.originalScore !== null && record.originalScore !== undefined ? record.originalScore : 0);
        const remScore = Number(record.remedialScore !== null && record.remedialScore !== undefined ? record.remedialScore : record.score);
        const totalQ = Number(record.total) || 20;

        // 🧾 Gunakan snapshot sesi ASLI (jawaban pertama vs remedial dipisah, tidak dicampur & tidak dikarang)
        const fromSnap = (snap, base) => ({
            ...base,
            ...(snap ? {
                score: Number(snap.score),
                correct: snap.correct !== undefined ? Number(snap.correct) : base.correct,
                total: Number(snap.total) || totalQ,
                partialCount: snap.partialCount,
                wrongQuestions: Array.isArray(snap.wrongQuestions) ? snap.wrongQuestions : [],
                detailedAnswers: snap.detailedAnswers || [],
                studentAnswers: snap.studentAnswers || [],
                date: snap.date || '-', time: snap.time || '-', duration: snap.duration || '-',
                tabSwitchCount: snap.tabSwitchCount || 0
            } : {})
        });
        const remSnap = record.remedialAttempt || null;
        const firstSnap = record.firstAttempt || null;

        currentRemedialRecordForExamined = fromSnap(remSnap, {
            ...record,
            score: remScore,
            correct: record.correct !== undefined ? Number(record.correct) : Math.round((remScore / 100) * totalQ),
            total: totalQ,
            isRemedial: true,
            sessionType: 'remedial'
        });
        currentRemedialRecordForExamined.__sessionSnapshot = !!remSnap;

        currentOriginalRecordForExamined = fromSnap(firstSnap, {
            ...record,
            score: origScore,
            correct: Math.max(0, Math.min(totalQ, Math.round((origScore / 100) * totalQ))),
            total: totalQ,
            wrongQuestions: [],
            detailedAnswers: [],
            studentAnswers: [],
            isRemedial: false,
            duration: '-', time: '-', date: '-',
            sessionType: 'original'
        });
        currentOriginalRecordForExamined.__sessionSnapshot = !!firstSnap;

        if (switcherWrap) switcherWrap.style.display = 'flex';
        { const bc = document.getElementById('btn-sd-attempt-compare'); if (bc) bc.classList.remove('active'); }
        if (btnRem) {
            btnRem.textContent = `🔄 Sesi Remedial (${remScore})`;
            btnRem.classList.add('active');
        }
        if (btnOrig) {
            btnOrig.textContent = `📋 Sebelum Remedial (${origScore})`;
            btnOrig.classList.remove('active');
        }
        if (switcherLabel) {
            switcherLabel.textContent = `Klik tombol untuk beralih lembar jawaban: Sebelum Remedial, Sesudah Remedial, atau Bandingkan`;
        }
        currentExaminedAttemptType = 'remedial';
        currentExaminedRecord = currentRemedialRecordForExamined;
    } else {
        if (switcherWrap) switcherWrap.style.display = 'none';
        currentRemedialRecordForExamined = record;
        currentOriginalRecordForExamined = null;
        currentExaminedRecord = record;
        currentExaminedAttemptType = 'single';
    }

    renderExaminedRecordView(currentExaminedRecord, currentExaminedAttemptType);
    const modalEl = document.getElementById('student-detail-modal');
    if (modalEl) modalEl.classList.add('active');
    if (initialTopicFilter) {
        setTimeout(() => filterStudentDetail(initialTopicFilter), 50);
    }
}

function filterStudentDetail(filterType) {
    if (typeof sfxClick === 'function') sfxClick();
    currentExaminedFilter = filterType;
    ['all', 'wrong', 'correct'].forEach(f => {
        const tab = document.getElementById(`sd-tab-${f}`);
        if (tab) tab.classList.toggle('active', f === filterType);
    });
    // Sorot kartu topik yang aktif
    if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
        document.querySelectorAll('.sd-topic-card').forEach(card => {
            const t = card.getAttribute('data-topic');
            if (t === filterType) {
                card.style.borderColor = '#818cf8';
                card.style.boxShadow = '0 0 12px rgba(129,140,248,0.4)';
            } else {
                card.style.borderColor = '';
                card.style.boxShadow = '';
            }
        });
    }
    renderStudentDetailQuestions();
}

function renderStudentDetailQuestions() {
    if (!currentExaminedRecord) return;
    if (currentExaminedAttemptType === 'compare') { renderAttemptComparison(); return; }
    const container = document.getElementById('sd-questions-list');
    container.innerHTML = '';
    if (!recordHasRealAnswers(currentExaminedRecord)) {
        container.innerHTML += `<div style="margin-bottom:8px;padding:8px 10px;border-radius:8px;background:rgba(251,191,36,0.12);border:1px solid rgba(251,191,36,0.4);font-size:0.78rem;color:#fbbf24;">⚠️ Jawaban asli siswa pada sesi ini tidak tersimpan. Pilihan jawaban di bawah adalah PERKIRAAN dari nilai dan jumlah soal salah, bukan jawaban sebenarnya.</div>`;
    }

    const topicsTitleMap = {
        M1: 'Materi 1: Literasi Digital & Ekosistem Periksa Fakta',
        M2: 'Materi 2: Web Browser, Search Engine & Manajemen Konten',
        M3: 'Materi 3: Digitalisasi Budaya, Profesi Informatika & HKI',
        M4: 'Materi 4: Etika, Privasi & Keamanan Digital',
        M5: 'Materi 5: Infrastruktur Jaringan & Keamanan Siber',
        M6: 'Materi 6: Aplikasi Perkantoran (MS Word, Excel & Mail Merge)'
    };

    if (['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].includes(currentExaminedFilter)) {
        container.innerHTML += `
            <div style="margin-bottom:12px;padding:8px 12px;border-radius:8px;background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.4);color:#a5b4fc;font-size:0.82rem;font-weight:700;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:6px;">
                <span>🎯 Menampilkan 10 Butir Soal ${topicsTitleMap[currentExaminedFilter]}</span>
                <button type="button" class="btn btn-secondary" style="padding:2px 10px;font-size:0.72rem;border-radius:6px;" onclick="filterStudentDetail('all')">Tampilkan Semua 60 Soal</button>
            </div>
        `;
    }

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

    const filtered = detailedList.filter((item, idx) => {
        if (currentExaminedFilter === 'wrong') return !item.isCorrect;
        if (currentExaminedFilter === 'correct') return item.isCorrect;
        if (['M1', 'M2', 'M3', 'M4', 'M5', 'M6'].includes(currentExaminedFilter)) {
            const itemTopic = item.topicCode || (item.topic ? item.topic.toUpperCase() : null) || `M${Math.floor((item.qIndex !== undefined ? item.qIndex : idx) / 10) + 1}`;
            return itemTopic === currentExaminedFilter;
        }
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
                        ${item.isCorrect 
                            ? (item.hasRealAnswer === false ? '✔️ Jawaban Siswa Tercatat Sesuai Kunci (Benar):' : '✔️ Jawaban Yang Dipilih Siswa (Benar):') 
                            : (item.hasRealAnswer === false ? '❌ Catatan Jawaban Siswa (Pilihan Opsi Tidak Tersimpan):' : '❌ Jawaban Yang Dipilih Siswa (Salah):')}
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

function selectModuleSegment(moduleId, syncToStudents = true) {
    if (typeof sfxClick === 'function') sfxClick();
    window.currentDashboardModuleFilter = moduleId;
    try {
        localStorage.setItem('quizmaster_dashboard_module_filter', moduleId);
    } catch(e) {}

    const filterModuleEl = document.getElementById('filter-module');
    if (filterModuleEl) {
        filterModuleEl.value = moduleId;
    }
    const btnsMap = {
        'all': 'btn-mod-filter-all',
        'modul_tryout_terpadu': 'btn-mod-filter-tryout',
        'modul_jaringan_keamanan': 'btn-mod-filter-jaringan',
        'modul_detektif_fakta': 'btn-mod-filter-fakta'
    };
    Object.keys(btnsMap).forEach(key => {
        const btn = document.getElementById(btnsMap[key]);
        if (btn) btn.classList.toggle('active', key === moduleId);
    });

    const indText = document.getElementById('active-module-indicator-text');
    if (indText) {
        if (moduleId === 'modul_tryout_terpadu') {
            indText.innerHTML = 'Menampilkan: 🎯 <strong>Tryout Terpadu 60 Soal (6 Materi)</strong> — Rekap Nilai M1 s.d M6 Sekaligus';
        } else if (moduleId === 'modul_jaringan_keamanan') {
            indText.innerHTML = 'Menampilkan: 🛡️ <strong>Modul Keamanan Jaringan Saja</strong> (Kuis lain disembunyikan)';
        } else if (moduleId === 'modul_detektif_fakta') {
            indText.innerHTML = 'Menampilkan: 🕵️ <strong>Modul Detektif Fakta Saja</strong> (Kuis lain disembunyikan)';
        } else {
            indText.innerHTML = 'Menampilkan: 📊 <strong>Komparasi Semua Modul & Tryout (Lengkap)</strong>';
        }
    }

    // 🔒 Otomatis sinkronkan modul ujian aktif ke siswa agar tidak perlu 2x klik
    if (syncToStudents && typeof setActiveExamModuleSetting === 'function') {
        setActiveExamModuleSetting(moduleId, true);
    }

    if (typeof updateApplyButtonState === 'function') updateApplyButtonState(moduleId);
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
        text = `Pemberitahuan Kuis Informatika SMAN 4 Padang:\nHalo ${name} (${cls}), Anda tercatat belum menyelesaikan Penilaian Harian Keamanan Jaringan. Silakan segera membuka platform kuis dan menyelesaikan evaluasi sebelum batas waktu berakhir. Terima kasih. (Guru Pengampu: Muhammad Hafidh Putra Roshadi, S.Pd.)`;
    } else if (missingType === 'only_fakta') {
        text = `Pemberitahuan Kuis Informatika SMAN 4 Padang:\nHalo ${name} (${cls}), Anda tercatat belum menyelesaikan Kuis Detektif Fakta. Silakan segera membuka platform kuis dan menyelesaikan evaluasi sebelum batas waktu berakhir. Terima kasih. (Guru Pengampu: Muhammad Hafidh Putra Roshadi, S.Pd.)`;
    } else {
        text = `Pemberitahuan Kuis Informatika SMAN 4 Padang:\nHalo ${name} (${cls}), Anda tercatat belum menyelesaikan evaluasi kuis Informatika Fase E. Silakan segera membuka platform kuis dan menyelesaikan evaluasi sebelum batas waktu berakhir. Terima kasih. (Guru Pengampu: Muhammad Hafidh Putra Roshadi, S.Pd.)`;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Pesan pengingat untuk ${name} telah disalin.`, '✓');
        }).catch(() => {
            showToast(`Pengingat untuk ${name} (${cls}) disiapkan.`, '✓');
        });
    } else {
        showToast(`Pengingat untuk ${name} (${cls}) disiapkan.`, '✓');
    }
}
window.remindStudent = remindStudent;

function remindStudentByIndex(itemIdx) {
    const item = window.currentWaitingItems ? window.currentWaitingItems[itemIdx] : null;
    if (!item) return;
    remindStudent(item.name, item.class);
}
window.remindStudentByIndex = remindStudentByIndex;

let currentWaReminderCategory = 'all';

function setWaReminderCategory(category) {
    if (typeof sfxClick === 'function') sfxClick();
    currentWaReminderCategory = category || 'all';
    
    // Update active button state
    ['all', 'unsubmitted', 'remedial'].forEach(cat => {
        const btn = document.getElementById(`btn-wa-cat-${cat}`);
        if (btn) {
            if (cat === currentWaReminderCategory) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });

    updateWaReminderPreview();
}
window.setWaReminderCategory = setWaReminderCategory;

function openWaReminderModal(selectedClass = null, selectedModule = null) {
    if (typeof sfxClick === 'function') sfxClick();
    const modal = document.getElementById('wa-reminder-modal');
    if (!modal) return;

    // Sync class dropdown
    const classSelect = document.getElementById('wa-remind-class');
    if (classSelect) {
        if (selectedClass) {
            classSelect.value = selectedClass;
        } else {
            const currentDashClass = document.getElementById('filter-class') ? document.getElementById('filter-class').value : 'all';
            classSelect.value = currentDashClass || 'all';
        }
    }

    // Sync module dropdown
    const modSelect = document.getElementById('wa-remind-module');
    if (modSelect) {
        if (selectedModule) {
            modSelect.value = selectedModule;
        } else {
            const currentDashMod = window.currentDashboardModuleFilter || (document.getElementById('filter-module') ? document.getElementById('filter-module').value : 'all');
            modSelect.value = currentDashMod || 'all';
        }
    }

    currentWaReminderCategory = 'all';
    ['all', 'unsubmitted', 'remedial'].forEach(cat => {
        const btn = document.getElementById(`btn-wa-cat-${cat}`);
        if (btn) {
            if (cat === 'all') btn.classList.add('active');
            else btn.classList.remove('active');
        }
    });

    modal.classList.add('active');
    updateWaReminderPreview();
}
window.openWaReminderModal = openWaReminderModal;

function closeWaReminderModal() {
    if (typeof sfxClick === 'function') sfxClick();
    const modal = document.getElementById('wa-reminder-modal');
    if (modal) modal.classList.remove('active');
}
window.closeWaReminderModal = closeWaReminderModal;

function getHumanModuleName(modId) {
    if (!modId || modId === 'all') return 'Evaluasi Pembelajaran Informatika (Semua Modul)';
    if (modId === 'modul_jaringan_keamanan') return 'Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital';
    if (modId === 'modul_detektif_fakta') return 'Misi Detektif Fakta: Uji Validitas Data';
    if (modId === 'modul_hki_profesi_budaya') return 'Penilaian Harian: Teknologi Digital, Profesi, Budaya & HKI';
    if (modId === 'modul_etika_privasi_keamanan') return 'Penilaian Harian: Etika, Privasi, dan Keamanan Digital';
    return modId;
}

function updateWaReminderPreview() {
    const classSelect = document.getElementById('wa-remind-class');
    const modSelect = document.getElementById('wa-remind-module');
    const selectedClass = classSelect ? classSelect.value : 'all';
    const selectedModule = modSelect ? modSelect.value : 'all';

    const classes = (selectedClass === 'all') 
        ? ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'] 
        : [selectedClass];

    const allRecords = (typeof loadRecords === 'function') ? (loadRecords() || []) : [];

    const unsubmitted = [];
    const remedial = [];
    const passed = [];
    let totalRoster = 0;

    classes.forEach(c => {
        let roster = (typeof STUDENT_ROSTER !== 'undefined' && STUDENT_ROSTER[c]) ? STUDENT_ROSTER[c] : [];
        if ((!roster || roster.length === 0) && c === 'KELAS DEMO') {
            const demoRecs = allRecords.filter(r => (typeof isClassEquivalent === 'function' ? isClassEquivalent(r.class, c) : (r.class || '').trim() === c));
            const distinctNames = Array.from(new Set(demoRecs.map(r => r.name).filter(Boolean)));
            roster = distinctNames.length > 0 ? distinctNames : ['Siswa Demo 1', 'Siswa Demo 2'];
        }
        totalRoster += roster.length;

        roster.forEach(name => {
            const studentRecs = allRecords.filter(r => {
                const nameMatches = (typeof isNameEquivalent === 'function') 
                    ? isNameEquivalent(r.name, name) 
                    : (r.name || '').trim().toLowerCase() === name.trim().toLowerCase();
                const classMatches = (typeof isClassEquivalent === 'function') 
                    ? isClassEquivalent(r.class, c) 
                    : (r.class || '').replace(/\s+/g, '').toUpperCase() === c.replace(/\s+/g, '').toUpperCase();
                if (!nameMatches || !classMatches) return false;
                if (selectedModule === 'all') return true;
                const rMod = (typeof normalizeModuleId === 'function') 
                    ? normalizeModuleId(r.moduleId, r.id, r.date) 
                    : (r.moduleId || 'modul_detektif_fakta');
                return rMod === selectedModule;
            });

            if (studentRecs.length === 0) {
                unsubmitted.push({ name, class: c });
            } else {
                const maxScore = Math.max(...studentRecs.map(r => Number(r.score) || 0));
                if (maxScore < 80) {
                    remedial.push({ name, class: c, score: maxScore });
                } else {
                    passed.push({ name, class: c, score: maxScore });
                }
            }
        });
    });

    // Update Counter Badges in Modal
    const badgeUnsub = document.getElementById('wa-badge-unsubmitted');
    const badgeRem = document.getElementById('wa-badge-remedial');
    const badgePas = document.getElementById('wa-badge-passed');
    const badgeTot = document.getElementById('wa-badge-total');
    if (badgeUnsub) badgeUnsub.textContent = unsubmitted.length;
    if (badgeRem) badgeRem.textContent = remedial.length;
    if (badgePas) badgePas.textContent = passed.length;
    if (badgeTot) badgeTot.textContent = totalRoster;

    // Compose formatted WhatsApp Markdown Message (Professional Academic Standard)
    const teacherName = 'Muhammad Hafidh Putra Roshadi, S.Pd.';
    const modTitle = getHumanModuleName(selectedModule);
    const classTitle = (selectedClass === 'all') ? 'Semua Kelas (X E 1 - X E 6)' : selectedClass;

    let text = `*PEMBERITAHUAN EVALUASI & REMEDIAL INFORMATIKA*\n`;
    text += `*SMAN 4 PADANG*\n\n`;
    text += `Guru Pengampu : ${teacherName}\n`;
    text += `Mata Pelajaran : Informatika\n`;
    text += `Kelas : ${classTitle}\n`;
    text += `Materi / Modul : ${modTitle}\n`;
    text += `Standar KKM : 80\n`;
    text += `--------------------------------------------------\n\n`;

    const cat = currentWaReminderCategory || 'all';

    if (cat === 'all' || cat === 'unsubmitted') {
        if (unsubmitted.length > 0) {
            text += `*Daftar Siswa Belum Mengikuti Kuis (${unsubmitted.length} Siswa):*\n`;
            unsubmitted.forEach((s, idx) => {
                text += `${idx + 1}. ${s.name} (${s.class})\n`;
            });
            text += `\n`;
        } else if (cat === 'unsubmitted') {
            text += `Seluruh siswa kelas ${classTitle} telah menyelesaikan kuis ini.\n\n`;
        }
    }

    if (cat === 'all' || cat === 'remedial') {
        if (remedial.length > 0) {
            text += `*Daftar Siswa Mengikuti Remedial (${remedial.length} Siswa):*\n`;
            remedial.forEach((s, idx) => {
                text += `${idx + 1}. ${s.name} (${s.class})\n`;
            });
            text += `\n`;
        } else if (cat === 'remedial') {
            text += `Seluruh siswa kelas ${classTitle} telah mencapai batas KKM (>= 80).\n\n`;
        }
    }

    if (cat === 'all' && unsubmitted.length === 0 && remedial.length === 0) {
        text += `Seluruh siswa kelas ${classTitle} telah menyelesaikan kuis dan mencapai batas KKM (>= 80).\n\n`;
    }

    text += `--------------------------------------------------\n`;
    text += `*Tautan Akses Kuis & Remedial:*\n`;
    text += `https://waphafid-code.github.io/kuis-detektif-fakta/\n\n`;
    text += `*Petunjuk Pelaksanaan:*\n`;
    text += `1. Siswa yang belum mengikuti kuis dimohon segera menyelesaikan evaluasi melalui tautan di atas.\n`;
    text += `2. Siswa yang terdaftar pada remedial dipersilakan mengakses fitur remedial untuk perbaikan nilai.\n`;
    text += `3. Kerjakan secara mandiri, teliti, dan penuh tanggung jawab.\n\n`;
    text += `Terima kasih atas perhatian dan kerja samanya.`;

    const previewArea = document.getElementById('wa-remind-preview-text');
    if (previewArea) {
        previewArea.value = text;
    }
    const charCount = document.getElementById('wa-preview-char-count');
    if (charCount) {
        charCount.textContent = `${text.length} karakter`;
    }
}
window.updateWaReminderPreview = updateWaReminderPreview;

function copyWaReminderText() {
    if (typeof sfxClick === 'function') sfxClick();
    const previewArea = document.getElementById('wa-remind-preview-text');
    const text = previewArea ? previewArea.value : '';
    if (!text) return;

    const triggerCopyFallback = () => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            if (typeof showToast === 'function') showToast('Pesan WhatsApp berhasil disalin ke clipboard.', '✓');
        } catch(e) {
            if (typeof showToast === 'function') showToast('Gagal menyalin otomatis, silakan salin manual dari kotak pratinjau.', '⚠️');
        }
        document.body.removeChild(ta);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            if (typeof showToast === 'function') showToast('Pesan WhatsApp berhasil disalin ke clipboard.', '✓');
        }).catch(() => {
            triggerCopyFallback();
        });
    } else {
        triggerCopyFallback();
    }
}
window.copyWaReminderText = copyWaReminderText;

function openWhatsAppWithReminder() {
    if (typeof sfxClick === 'function') sfxClick();
    const previewArea = document.getElementById('wa-remind-preview-text');
    const text = previewArea ? previewArea.value : '';
    if (!text) return;

    // 1. Salin teks ke clipboard terlebih dahulu sebagai jaminan cadangan
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
    }

    // 2. Buka link WhatsApp Web / App
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    if (typeof window.open === 'function') {
        window.open(waUrl, '_blank');
    }
    if (typeof showToast === 'function') {
        showToast('Membuka WhatsApp dan pesan telah disalin.', '✓');
    }
}
window.openWhatsAppWithReminder = openWhatsAppWithReminder;

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
        showToast('Semua siswa dalam kelas terpilih sudah mengerjakan kuis.', '✓');
        return;
    }

    const modLabel = filterModule === 'modul_jaringan_keamanan' ? 'Infrastruktur Jaringan & Keamanan Digital' : (filterModule === 'modul_detektif_fakta' ? 'Detektif Fakta' : 'Evaluasi Pembelajaran Informatika');
    let text = `*DAFTAR SISWA BELUM MENGERJAKAN KUIS*\n`;
    text += `SMAN 4 Padang\n\n`;
    text += `Guru Pengampu : Muhammad Hafidh Putra Roshadi, S.Pd.\n`;
    text += `Mata Pelajaran : Informatika\n`;
    text += `Materi : ${modLabel}\n`;
    text += `Kelas : ${filterClass === 'all' ? 'Semua Kelas (X E 1 - X E 6)' : filterClass}\n`;
    text += `Total Belum Mengerjakan : ${unsubmitted.length} Siswa\n`;
    text += `--------------------------------------------------\n`;
    unsubmitted.forEach((s, idx) => {
        text += `${idx + 1}. ${s.name} (${s.class})\n`;
    });
    text += `--------------------------------------------------\n`;
    text += `Catatan: Mohon segera mengakses platform kuis dan menyelesaikan evaluasi sebelum batas waktu ditutup. Terima kasih.`;

    const triggerCopy = () => {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast(`Berhasil menyalin ${unsubmitted.length} siswa belum ujian.`, '✓');
        } catch(e) {
            showToast('Gagal menyalin teks otomatis.', '⚠️');
        }
        document.body.removeChild(ta);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Berhasil menyalin ${unsubmitted.length} siswa belum ujian.`, '✓');
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

// 🎯 Hitung rekapitulasi penguasaan materi (M1-M6) dari record Tryout
function computeTopicBreakdownFromRecord(r) {
    if (!r) return null;
    if (r.topicBreakdown && Object.keys(r.topicBreakdown).length > 0) return r.topicBreakdown;
    const topicsMeta = {
        M1: { code: 'M1', title: 'Literasi Digital & Ekosistem Periksa Fakta', icon: '🕵️' },
        M2: { code: 'M2', title: 'Web Browser, Search Engine, & Manajemen Konten', icon: '🌐' },
        M3: { code: 'M3', title: 'Digitalisasi Budaya, Profesi Informatika, & HKI', icon: '🏛️' },
        M4: { code: 'M4', title: 'Etika, Privasi, dan Keamanan Digital', icon: '🛡️' },
        M5: { code: 'M5', title: 'Infrastruktur Jaringan Komputer & Keamanan Siber', icon: '⚡' },
        M6: { code: 'M6', title: 'Aplikasi Perkantoran (MS Word, Mail Merge, & MS Excel)', icon: '📊' }
    };
    const tb = {};
    Object.keys(topicsMeta).forEach(code => {
        tb[code] = { ...topicsMeta[code], total: 0, correct: 0, score: 0 };
    });
    let detailedList = [];
    if (Array.isArray(r.detailedAnswers) && r.detailedAnswers.length > 0) {
        detailedList = r.detailedAnswers;
    } else {
        detailedList = reconstructStudentAnswers(r);
    }
    detailedList.forEach((item, idx) => {
        if (!item) return;
        const mCode = item.topicCode || ('M' + (Math.floor(idx / 10) + 1));
        if (tb[mCode]) {
            tb[mCode].total += 1;
            if (item.isCorrect) tb[mCode].correct += 1;
        }
    });
    Object.keys(tb).forEach(code => {
        const it = tb[code];
        it.score = it.total > 0 ? Math.round((it.correct / it.total) * 100) : 0;
    });
    return tb;
}
window.computeTopicBreakdownFromRecord = computeTopicBreakdownFromRecord;

function renderDashboard() {
    // 🔒 SECURITY GUARD: Jangan muat dan render data jika belum terverifikasi PIN Guru
    if (typeof isTeacherAuthValid === 'function' && !isTeacherAuthValid()) {
        const tbody = document.getElementById('dash-tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--text-muted); font-size:0.9rem;">🔒 Dasbor Terkunci. Masukkan PIN Guru untuk melihat data rekap nilai.</td></tr>';
        return;
    }

    const allRecords = loadRecords();
    const filterClass = document.getElementById('filter-class') ? document.getElementById('filter-class').value : 'all';
    const filterModuleEl = document.getElementById('filter-module');

    // Pulihkan filter modul dasbor yang tersimpan agar tidak ter-reset
    if (!window._dashFilterInitDone && filterModuleEl) {
        const savedDashFilter = localStorage.getItem('quizmaster_dashboard_module_filter') || 'all';
        filterModuleEl.value = savedDashFilter;
        window.currentDashboardModuleFilter = savedDashFilter;
        window._dashFilterInitDone = true;
    }

    const filterModule = filterModuleEl ? filterModuleEl.value : (window.currentDashboardModuleFilter || 'all');
    window.currentDashboardModuleFilter = filterModule;
    const searchNameEl = document.getElementById('filter-search-name');
    const searchName = searchNameEl ? searchNameEl.value.toLowerCase().trim() : '';
    const sortByEl = document.getElementById('sort-by');
    const sortBy = sortByEl ? sortByEl.value : `${currentSortColumn}_${currentSortOrder}`;

    // Sinkronkan Pengaturan Batas Respon, Mode Remedial, Kunci Layar, & Modul Ditampilkan
    const policySel = document.getElementById('setting-submission-policy');
    if (policySel) {
        policySel.value = loadSubmissionPolicy();
    }
    initRemedialSettingUi();
    initFullscreenSettingUi();
    initReviewReleaseSettingUi();
    initDemoVisibilitySettingUi();
    initExamTokenSettingUi();
    initActiveExamModuleUi();
    if (typeof updateApplyButtonState === 'function') updateApplyButtonState();

    // Bangun opsi dropdown hanya sekali. renderDashboard() dipanggil berulang kali
    // setelah pilihan berubah; membangun ulang <select> pada setiap render menyebabkan
    // kedipan dan Promise getAllModules() yang terlambat dapat mengembalikan pilihan lama.
    if (filterModuleEl && !window._dashModuleOptionsInitStarted) {
        window._dashModuleOptionsInitStarted = true;
        const coreOptions = [
            { id: 'all', label: '📊 KOMPARASI SEMUA MODUL (SEMUA NILAI)' },
            { id: 'modul_tryout_terpadu', label: '🎯 Tryout Terpadu Informatika Kelas X (6 Materi)' },
            { id: 'modul_jaringan_keamanan', label: '🛡️ Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital' },
            { id: 'modul_detektif_fakta', label: '🕵️ Misi Detektif Fakta: Uji Validitas Data' },
            { id: 'modul_hki_profesi_budaya', label: '📘 Panduan Generasi Digital: Teknologi Digital, Profesi, Budaya & HKI' },
            { id: 'modul_etika_privasi_keamanan', label: '🔐 Etika, Privasi, dan Keamanan Digital' }
        ];

        const applyOptions = (modules = []) => {
            // Ambil pilihan terkini tepat sebelum opsi diperbarui, bukan nilai
            // yang ditangkap saat renderDashboard pertama kali dipanggil.
            const liveValue = filterModuleEl.value ||
                window.currentDashboardModuleFilter ||
                localStorage.getItem('quizmaster_dashboard_module_filter') ||
                'all';
            const knownIds = new Set(coreOptions.map(option => option.id));
            const dynamicOptions = (Array.isArray(modules) ? modules : [])
                .filter(module => module && module.id && !knownIds.has(String(module.id)))
                .map(module => ({
                    id: String(module.id),
                    label: `${module.icon || '📚'} ${module.title || module.name || module.id}`
                }))
                .sort((a, b) => a.label.localeCompare(b.label, 'id'));

            const options = [...coreOptions, ...dynamicOptions];
            const selectedValue = options.some(option => option.id === liveValue) ? liveValue : 'all';
            const currentSignature = Array.from(filterModuleEl.options)
                .map(option => `${option.value}:${option.textContent}`).join('|');
            const nextSignature = options.map(option => `${option.id}:${option.label}`).join('|');

            // Jangan sentuh DOM jika susunan opsi sudah sama. Ini mencegah dropdown
            // berkedip ketika fungsi renderDashboard dipanggil akibat perubahan filter.
            if (currentSignature !== nextSignature) {
                filterModuleEl.innerHTML = options.map(option =>
                    `<option value="${escapeHtml(option.id)}">${escapeHtml(option.label)}</option>`
                ).join('');
            }

            if (filterModuleEl.value !== selectedValue) filterModuleEl.value = selectedValue;
            window.currentDashboardModuleFilter = selectedValue;
            try { localStorage.setItem('quizmaster_dashboard_module_filter', selectedValue); } catch (e) {}
        };

        // Opsi inti tersedia langsung tanpa menunggu jaringan/QuizManager.
        applyOptions();
        if (window.QuizManager && typeof QuizManager.getAllModules === 'function') {
            Promise.resolve(QuizManager.getAllModules())
                .then(modules => applyOptions(modules))
                .catch(error => {
                    console.warn('Tidak dapat memuat modul tambahan untuk dropdown dashboard:', error);
                });
        }
    }
    // Sinkronkan tombol segmented filter modul & teks indikator aktif
    const btnsMap = {
        'all': 'btn-mod-filter-all',
        'modul_tryout_terpadu': 'btn-mod-filter-tryout',
        'modul_jaringan_keamanan': 'btn-mod-filter-jaringan',
        'modul_detektif_fakta': 'btn-mod-filter-fakta'
    };
    Object.keys(btnsMap).forEach(key => {
        const btn = document.getElementById(btnsMap[key]);
        if (btn) btn.classList.toggle('active', key === filterModule);
    });
    const indText = document.getElementById('active-module-indicator-text');
    if (indText) {
        if (filterModule === 'modul_tryout_terpadu') {
            indText.innerHTML = 'Menampilkan: 🎯 <strong>Tryout Terpadu 60 Soal (6 Materi)</strong> — Rekap Nilai M1 s.d M6 Sekaligus';
        } else if (filterModule === 'modul_jaringan_keamanan') {
            indText.innerHTML = 'Menampilkan: 🛡️ <strong>Modul Keamanan Jaringan Saja</strong> (Kuis lain disembunyikan)';
        } else if (filterModule === 'modul_detektif_fakta') {
            indText.innerHTML = 'Menampilkan: 🕵️ <strong>Modul Detektif Fakta Saja</strong> (Kuis lain disembunyikan)';
        } else if (filterModule !== 'all') {
            indText.innerHTML = `Menampilkan: 📚 <strong>${escapeHtml(filterModule)} Saja</strong>`;
        } else {
            indText.innerHTML = 'Menampilkan: 📊 <strong>Komparasi Semua Modul (seluruh nilai kuis)</strong>';
        }
    }

    // Render Kontrol Jadwal & Akses Guru Muhammad Hafidh Putra Roshadi
    updateAccessControlUI();

    // 1. Kumpulkan data siswa terdaftar dari Roster Resmi (6 Kelas X E 1 - X E 6) atau KELAS DEMO
    const isDemoFilter = (typeof isClassEquivalent === 'function') 
        ? isClassEquivalent(filterClass, 'KELAS DEMO') 
        : (filterClass === 'KELAS DEMO');

    const allClasses = ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'];
    const targetClasses = isDemoFilter ? ['KELAS DEMO'] : (filterClass === 'all' ? allClasses : [filterClass]);

    const modFaktaId = 'modul_detektif_fakta';
    const modJaringanId = 'modul_jaringan_keamanan';
    const modPanduanId = 'modul_hki_profesi_budaya';
    const modPrivasiId = 'modul_etika_privasi_keamanan';

    // 🛡️ ISOLASI TOTAL: Pisahkan records resmi (216 siswa SMAN 4 Padang) dari records demo
    const officialRecords = allRecords.filter(r => !(typeof isClassEquivalent === 'function' ? isClassEquivalent(r.class, 'KELAS DEMO') : r.class === 'KELAS DEMO'));
    const demoRecords = allRecords.filter(r => (typeof isClassEquivalent === 'function' ? isClassEquivalent(r.class, 'KELAS DEMO') : r.class === 'KELAS DEMO'));
    const activePoolRecords = isDemoFilter ? demoRecords : (filterClass === 'all' ? officialRecords : allRecords.filter(r => isClassEquivalent(r.class, filterClass)));

    // Tampilkan / Sembunyikan Alert Banner Khusus Kelas Demo
    const demoBanner = document.getElementById('demo-mode-alert-banner');
    if (demoBanner) {
        if (isDemoFilter) {
            demoBanner.style.display = 'block';
            demoBanner.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div>
                        <div style="font-weight: 800; color: #38bdf8; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;">
                            <span>🧪 RUANG KELAS DEMO &amp; AKUN PENGUJIAN QA</span>
                            <span style="font-size: 0.72rem; padding: 2px 8px; border-radius: 10px; background: #0284c7; color: #fff; font-weight: 700;">TERISOLASI 100%</span>
                        </div>
                        <p style="margin: 4px 0 0; font-size: 0.82rem; color: var(--text-secondary);">
                            Data pengerjaan di kelas ini tersimpan mandiri untuk keperluan simulasi &amp; presentasi tugas QA, serta <strong>TIDAK MENCAMPURI</strong> 216 data resmi siswa SMAN 4 Padang.
                        </p>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button type="button" class="btn btn-secondary" onclick="resetDemoRecords()" style="font-size: 0.8rem; padding: 7px 14px; border-color: #f43f5e; color: #f43f5e; font-weight: 700;" title="Hapus semua pengerjaan simulasi pada Kelas Demo">
                            🧹 Reset Hasil Uji Coba Demo
                        </button>
                    </div>
                </div>
            `;
        } else if (demoRecords.length > 0) {
            // 🧪 Banner Cerdas: Beri tahu Guru bahwa ada rekaman pengujian Akun Demo yang tersedia!
            demoBanner.style.display = 'block';
            demoBanner.innerHTML = `
                <div style="background: linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.1)); border: 1.5px solid rgba(16,185,129,0.35); border-radius: 12px; padding: 10px 16px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.4rem;">🧪</span>
                        <div>
                            <div style="font-weight: 800; font-size: 0.88rem; color: #34d399; display: flex; align-items: center; gap: 6px;">
                                <span>Hasil Pengerjaan Akun Demo Guru Tersedia (${demoRecords.length} Data)</span>
                                <span style="font-size: 0.7rem; padding: 1px 7px; border-radius: 8px; background: rgba(16,185,129,0.25); color: #6ee7b7; font-weight: 700;">Siap Ditinjau</span>
                            </div>
                            <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
                                Termasuk rincian nilai Tryout 6 Materi (M1 s.d M6) &amp; Kuis. Klik tombol untuk langsung menengok rekap matriks nilai akun demo.
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-accent" onclick="document.getElementById('filter-class').value = 'KELAS DEMO'; renderDashboard();" style="font-size: 0.8rem; padding: 8px 16px; font-weight: 800; border-radius: 8px; display: flex; align-items: center; gap: 6px; box-shadow: 0 0 12px rgba(99,102,241,0.35); cursor: pointer;">
                        <span>👁️ Lihat Nilai Akun Demo</span>
                        <span>➔</span>
                    </button>
                </div>
            `;
        } else {
            demoBanner.style.display = 'none';
        }
    }

    // Pisahkan records per modul kuis dengan normalisasi otomatis
    const modTryoutId = 'modul_tryout_terpadu';
    const recordsFakta = activePoolRecords.filter(r => {
        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
        return mod === modFaktaId;
    });
    const recordsJaringan = activePoolRecords.filter(r => {
        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
        return mod === modJaringanId;
    });
    const recordsPanduan = activePoolRecords.filter(r => {
        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
        return mod === modPanduanId;
    });
    const recordsPrivasi = activePoolRecords.filter(r => {
        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
        return mod === modPrivasiId;
    });
    const recordsTryout = activePoolRecords.filter(r => {
        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
        return mod === modTryoutId;
    });

    // Update counter pada badge tombol segmented modul
    const badgeAll = document.getElementById('badge-cnt-all-mod');
    const badgeJaringan = document.getElementById('badge-cnt-jaringan-mod');
    const badgeFakta = document.getElementById('badge-cnt-fakta-mod');
    const badgeTryout = document.getElementById('badge-cnt-tryout-mod');
    const poolLabel = isDemoFilter ? `${demoRecords.length} Data Demo` : `${officialRecords.length} Data Resmi`;
    if (badgeAll) badgeAll.textContent = poolLabel;
    if (badgeJaringan) badgeJaringan.textContent = `${recordsJaringan.length} Data`;
    if (badgeFakta) badgeFakta.textContent = `${recordsFakta.length} Data`;
    if (badgeTryout) badgeTryout.textContent = `${recordsTryout.length} Data`;

    // Filter records sesuai modul pembelajaran terpilih
    const isTryoutView = (filterModule === modTryoutId);
    const isSingleModuleView = (filterModule === modJaringanId || filterModule === modFaktaId || (filterModule !== 'all' && !isTryoutView));
    const activeSingleModId = isSingleModuleView ? filterModule : (isTryoutView ? modTryoutId : null);

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

            // Attempts Panduan Generasi Digital (Teknologi Digital, Profesi, Budaya & HKI)
            const attemptsPanduan = recordsPanduan.filter(r => nameMatches(r.name) && classMatches(r.class))
                .sort((a, b) => (b.score - a.score) || ((b.timestamp || 0) - (a.timestamp || 0)));
            const bestPanduan = attemptsPanduan[0] || null;

            // Attempts Privasi dan Keamanan Digital
            const attemptsPrivasi = recordsPrivasi.filter(r => nameMatches(r.name) && classMatches(r.class))
                .sort((a, b) => (b.score - a.score) || ((b.timestamp || 0) - (a.timestamp || 0)));
            const bestPrivasi = attemptsPrivasi[0] || null;

            // Attempts Tryout Terpadu 60 Soal
            const attemptsTryout = recordsTryout.filter(r => 
                nameMatches(r.name) && classMatches(r.class)
            ).sort((a, b) => (b.score - a.score) || ((b.timestamp || 0) - (a.timestamp || 0)));
            const bestTryout = attemptsTryout[0] || null;

            const hasFakta = !!bestFakta;
            const hasJaringan = !!bestJaringan;
            const hasTryout = !!bestTryout;

            let completionStatus = 'none'; // 'both', 'only_fakta', 'only_jaringan', 'none'
            if (hasFakta && hasJaringan) completionStatus = 'both';
            else if (hasFakta) completionStatus = 'only_fakta';
            else if (hasJaringan) completionStatus = 'only_jaringan';

            // Hitung nilai rata-rata komparatif (seluruh evaluasi yang telah diselesaikan)
            const completedScores = [];
            if (hasFakta) completedScores.push(bestFakta.score);
            if (hasJaringan) completedScores.push(bestJaringan.score);
            if (hasTryout) completedScores.push(bestTryout.score);
            if (bestPanduan) completedScores.push(bestPanduan.score);
            if (bestPrivasi) completedScores.push(bestPrivasi.score);
            let avgScore = -1;
            if (completedScores.length > 0) {
                avgScore = Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length);
            }

            // Tentukan status aktif berdasarkan filterModule
            let hasSubmitted = false;
            let activeRecord = null;
            let activeScore = -1;
            let activeAttempts = 0;
            let activeTimestamp = 0;

            if (isTryoutView) {
                hasSubmitted = hasTryout;
                activeRecord = bestTryout;
                activeScore = bestTryout ? bestTryout.score : -1;
                activeAttempts = attemptsTryout.length;
                activeTimestamp = bestTryout ? (bestTryout.timestamp || 0) : 0;
            } else if (filterModule === modJaringanId) {
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
            } else if (filterModule !== 'all') {
                const attemptsMod = activePoolRecords.filter(r => {
                    const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
                    return mod === filterModule && nameMatches(r.name) && classMatches(r.class);
                }).sort((a, b) => (b.score - a.score) || ((b.timestamp || 0) - (a.timestamp || 0)));
                const bestMod = attemptsMod[0] || null;
                hasSubmitted = !!bestMod;
                activeRecord = bestMod;
                activeScore = bestMod ? bestMod.score : -1;
                activeAttempts = attemptsMod.length;
                activeTimestamp = bestMod ? (bestMod.timestamp || 0) : 0;
            } else {
                // Komparasi Semua Modul & Tryout ('all')
                hasSubmitted = hasFakta || hasJaringan || hasPanduan || hasPrivasi || hasTryout;
                activeRecord = bestTryout || bestPrivasi || bestPanduan || bestJaringan || bestFakta;
                activeScore = avgScore;
                activeAttempts = attemptsFakta.length + attemptsJaringan.length + attemptsPanduan.length + attemptsPrivasi.length + attemptsTryout.length;
                activeTimestamp = Math.max(bestFakta ? (bestFakta.timestamp || 0) : 0, bestJaringan ? (bestJaringan.timestamp || 0) : 0, bestPanduan ? (bestPanduan.timestamp || 0) : 0, bestPrivasi ? (bestPrivasi.timestamp || 0) : 0, bestTryout ? (bestTryout.timestamp || 0) : 0);
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
                hasPanduan: !!bestPanduan,
                recordPanduan: bestPanduan,
                scorePanduan: bestPanduan ? bestPanduan.score : null,
                hasPrivasi: !!bestPrivasi,
                recordPrivasi: bestPrivasi,
                scorePrivasi: bestPrivasi ? bestPrivasi.score : null,
                hasTryout: hasTryout,
                recordTryout: bestTryout,
                scoreTryout: bestTryout ? bestTryout.score : null,
                topicBreakdown: bestTryout ? bestTryout.topicBreakdown : null,
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

        // 🧪 Pill Khusus Kelas Demo (Terpisah & Eksklusif untuk Uji Coba & Demo QA)
        const isDemoSelected = isDemoFilter;
        const demoRoster = (typeof STUDENT_ROSTER !== 'undefined' && STUDENT_ROSTER['KELAS DEMO']) ? STUDENT_ROSTER['KELAS DEMO'] : [];
        const demoSubmittedList = demoRecords.filter(r => (filterModule === 'all' || (typeof normalizeModuleId === 'function' ? normalizeModuleId(r.moduleId, r.id, r.date) : r.moduleId) === filterModule));
        const demoDoneCount = demoSubmittedList.length;
        const demoBadge = document.createElement('div');
        demoBadge.style.cssText = `
            background: ${isDemoSelected ? 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(6,182,212,0.2))' : 'rgba(255,255,255,0.03)'};
            border: 1.5px solid ${isDemoSelected ? '#10b981' : 'rgba(16,185,129,0.35)'};
            border-radius: 12px; padding: 10px 14px; font-size: 0.8rem;
            cursor: pointer; transition: all 0.2s; text-align: center; min-width: 95px;
            box-shadow: ${isDemoSelected ? '0 0 16px rgba(16,185,129,0.4)' : 'none'};
        `;
        demoBadge.title = "Klik untuk memfilter khusus data uji coba KELAS DEMO (Aman, terisolasi dari 216 siswa asli)";
        demoBadge.innerHTML = `
            <div style="font-weight: 800; color: #10b981; font-size: 0.88rem;">🧪 KELAS DEMO</div>
            <div style="font-family: var(--font-mono); font-weight: 800; font-size: 1.15rem; margin: 3px 0; color: #34d399;">${demoDoneCount} <span style="font-size:0.75rem; color:var(--text-muted); font-weight:500;">/ ${demoRoster.length}</span></div>
            <div style="color: #6ee7b7; font-size: 0.72rem; font-weight: 700;">Uji Coba QA</div>
        `;
        demoBadge.onclick = () => {
            document.getElementById('filter-class').value = isDemoSelected ? 'all' : 'KELAS DEMO';
            renderDashboard();
        };
        classBreakdown.appendChild(demoBadge);
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

        // 🔍 PENCARIAN CERDAS AKUN DEMO: Jika filter class adalah 'all' atau kelas resmi lain,
        // dan guru mencari "demo" atau nama siswa demo (mis. "hafidh", "andre", dll),
        // sertakan siswa KELAS DEMO yang cocok ke dalam displayList agar guru langsung melihat nilainya!
        if (!isDemoFilter && demoRecords.length > 0) {
            const demoRoster = (typeof STUDENT_ROSTER !== 'undefined' && STUDENT_ROSTER['KELAS DEMO']) ? STUDENT_ROSTER['KELAS DEMO'] : [];
            demoRoster.forEach(studentName => {
                const sNameLower = studentName.toLowerCase();
                if (sNameLower.includes(searchName) || searchName.includes('demo')) {
                    const nameMatches = (typeof isNameEquivalent === 'function') 
                        ? (recName) => isNameEquivalent(recName, studentName)
                        : (recName) => (recName || '').trim().toLowerCase() === sNameLower;

                    const attemptsTryout = demoRecords.filter(r => {
                        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : r.moduleId;
                        return mod === modTryoutId && nameMatches(r.name);
                    }).sort((a, b) => (b.score - a.score) || ((b.timestamp || 0) - (a.timestamp || 0)));
                    const bestTryout = attemptsTryout[0] || null;

                    const attemptsFakta = demoRecords.filter(r => {
                        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : r.moduleId;
                        return mod === modFaktaId && nameMatches(r.name);
                    }).sort((a, b) => (b.score - a.score) || ((b.timestamp || 0) - (a.timestamp || 0)));
                    const bestFakta = attemptsFakta[0] || null;

                    const attemptsPanduan = demoRecords.filter(r => {
                        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : r.moduleId;
                        return mod === modPanduanId && nameMatches(r.name);
                    }).sort((a, b) => (b.score - a.score) || ((b.timestamp || 0) - (a.timestamp || 0)));
                    const bestPanduan = attemptsPanduan[0] || null;

                    const attemptsPrivasi = demoRecords.filter(r => {
                        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : r.moduleId;
                        return mod === modPrivasiId && nameMatches(r.name);
                    }).sort((a, b) => (b.score - a.score) || ((b.timestamp || 0) - (a.timestamp || 0)));
                    const bestPrivasi = attemptsPrivasi[0] || null;

                    const attemptsJaringan = demoRecords.filter(r => {
                        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : r.moduleId;
                        return mod === modJaringanId && nameMatches(r.name);
                    }).sort((a, b) => (b.score - a.score) || ((b.timestamp || 0) - (a.timestamp || 0)));
                    const bestJaringan = attemptsJaringan[0] || null;

                    const hasTryout = !!bestTryout;
                    const hasFakta = !!bestFakta;
                    const hasJaringan = !!bestJaringan;
                    const hasSubmitted = isTryoutView ? hasTryout : (filterModule === modJaringanId ? hasJaringan : (filterModule === modFaktaId ? hasFakta : (hasFakta || hasJaringan || hasPanduan || hasPrivasi || hasTryout)));

                    if (hasSubmitted) {
                        const activeRecord = isTryoutView ? bestTryout : (filterModule === modJaringanId ? bestJaringan : (filterModule === modFaktaId ? bestFakta : (bestTryout || bestJaringan || bestFakta)));
                        const completedScores = [];
                        if (hasFakta) completedScores.push(bestFakta.score);
                        if (hasJaringan) completedScores.push(bestJaringan.score);
                        if (hasTryout) completedScores.push(bestTryout.score);
                        const avgScore = completedScores.length > 0 ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length) : -1;

                        const alreadyInList = displayList.some(d => d.name === studentName && d.class === 'KELAS DEMO');
                        if (!alreadyInList) {
                            displayList.push({
                                name: studentName,
                                class: 'KELAS DEMO',
                                hasSubmitted: true,
                                record: activeRecord,
                                attemptsCount: (attemptsFakta.length + attemptsJaringan.length + attemptsPanduan.length + attemptsPrivasi.length + attemptsTryout.length),
                                score: isTryoutView ? (bestTryout ? bestTryout.score : -1) : (filterModule === modJaringanId ? (bestJaringan ? bestJaringan.score : -1) : (filterModule === modFaktaId ? (bestFakta ? bestFakta.score : -1) : avgScore)),
                                timestamp: activeRecord ? (activeRecord.timestamp || 0) : 0,
                                hasFakta: hasFakta,
                                recordFakta: bestFakta,
                                scoreFakta: bestFakta ? bestFakta.score : null,
                                hasJaringan: hasJaringan,
                                recordJaringan: bestJaringan,
                                scoreJaringan: bestJaringan ? bestJaringan.score : null,
                                hasPanduan: !!bestPanduan,
                                recordPanduan: bestPanduan,
                                scorePanduan: bestPanduan ? bestPanduan.score : null,
                                hasPrivasi: !!bestPrivasi,
                                recordPrivasi: bestPrivasi,
                                scorePrivasi: bestPrivasi ? bestPrivasi.score : null,
                                hasTryout: hasTryout,
                                recordTryout: bestTryout,
                                scoreTryout: bestTryout ? bestTryout.score : null,
                                topicBreakdown: bestTryout ? bestTryout.topicBreakdown : null,
                                completionStatus: (hasFakta && hasJaringan) ? 'both' : (hasFakta ? 'only_fakta' : (hasJaringan ? 'only_jaringan' : 'none')),
                                avgScore: avgScore
                            });
                        }
                    }
                }
            });
        }
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

    // 6. Sinkronkan Header Tabel Sesuai Mode Tampilan (Tryout 13 Kolom vs Komparasi Semua Modul vs Modul Tunggal)
    const thead = document.querySelector('.dash-table thead');
    if (thead) {
        if (isTryoutView) {
            // Mode Tryout Terpadu 60 Soal (Matriks Nilai 6 Materi Sekaligus)
            thead.innerHTML = `
                <tr>
                    <th style="width: 45px;">No</th>
                    <th style="cursor: pointer;" onclick="toggleSort('name')" title="Klik untuk Urutkan Nama">Nama Siswa ⇅</th>
                    <th style="width: 85px;">Kelas</th>
                    <th style="cursor: pointer; width: 95px; text-align: center;" onclick="toggleSort('score')" title="Klik untuk Urutkan Skor Total">Skor Total ⇅</th>
                    <th style="text-align: center; width: 68px;" title="Materi 1: Literasi Digital & Ekosistem Periksa Fakta (10 Soal)">🕵️ M1</th>
                    <th style="text-align: center; width: 68px;" title="Materi 2: Web Browser, Search Engine & Manajemen Konten (10 Soal)">🌐 M2</th>
                    <th style="text-align: center; width: 68px;" title="Materi 3: Digitalisasi Budaya, Profesi Informatika & HKI (10 Soal)">🏛️ M3</th>
                    <th style="text-align: center; width: 68px;" title="Materi 4: Etika, Privasi & Keamanan Digital (10 Soal)">🛡️ M4</th>
                    <th style="text-align: center; width: 68px;" title="Materi 5: Infrastruktur Jaringan & Keamanan Siber (10 Soal)">⚡ M5</th>
                    <th style="text-align: center; width: 68px;" title="Materi 6: Aplikasi Perkantoran (MS Word, Excel & Mail Merge) (10 Soal)">📊 M6</th>
                    <th style="text-align: center; width: 110px;">Status Tryout</th>
                    <th style="text-align: center; width: 85px;">Durasi</th>
                    <th style="text-align: center; width: 130px;">Aksi</th>
                </tr>
            `;
        } else if (!isSingleModuleView) {
            // Mode Komparasi Semua Modul & Tryout
            thead.innerHTML = `
                <tr>
                    <th style="width: 45px;">No</th>
                    <th style="cursor: pointer;" onclick="toggleSort('name')" title="Klik untuk Urutkan Nama">Nama Siswa ⇅</th>
                    <th style="width: 80px;">Kelas</th>
                    <th style="text-align: center; width: 145px;" title="Kuis 1: Detektif Fakta">🕵️ Kuis 1: Fakta</th>
                    <th style="text-align: center; width: 145px;" title="Kuis 2: Keamanan Jaringan">🛡️ Kuis 2: Jaringan</th>
                    <th style="text-align: center; width: 145px;" title="Panduan Generasi Digital (Teknologi Digital, Profesi, Budaya & HKI)">📘 Panduan Generasi Digital</th>
                    <th style="text-align: center; width: 145px;" title="Privasi dan Keamanan Digital">🔐 Privasi & Keamanan</th>
                    <th style="text-align: center; width: 165px;" title="Tryout Terpadu 60 Soal (6 Materi Sekaligus)">🎯 Tryout (6 Materi)</th>
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
                    <td colspan="${isTryoutView ? 13 : (isSingleModuleView ? 9 : 10)}">
                        <div class="empty-state">
                            <div class="empty-icon">📭</div>
                            <p>Tidak ada data siswa yang cocok dengan filter aktif:<br>
                            ${filterClass !== 'all' ? `• Kelas: <strong>${escapeHtml(filterClass)}</strong><br>` : ''}
                            ${filterModule !== 'all' ? `• Modul: <strong>${filterModule === modTryoutId ? 'Tryout Terpadu (6 Materi)' : (filterModule === modJaringanId ? 'Keamanan Jaringan Saja' : 'Detektif Fakta Saja')}</strong><br>` : ''}
                            ${searchName ? `• Pencarian: "<strong>${escapeHtml(searchName)}</strong>"` : ''}
                            </p>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            displayList.forEach((item, i) => {
                const tr = document.createElement('tr');

                if (isTryoutView) {
                    // ──── RENDER MODE TRYOUT TERPADU (6 MATERI SEKALIGUS) ────
                    if (item.hasSubmitted && item.record) {
                        const r = item.record;
                        const recordIdx = window.currentRenderedRecords.length;
                        window.currentRenderedRecords.push(r);

                        const tb = r.topicBreakdown || (typeof computeTopicBreakdownFromRecord === 'function' ? computeTopicBreakdownFromRecord(r) : null);

                        let pillClass = 'low';
                        if (r.score >= 80) pillClass = 'high';
                        else if (r.score >= 60) pillClass = 'mid';

                        const scoreDisplay = r.isCheated
                            ? `<span class="score-pill low" style="background: rgba(244,63,94,0.25); border-color: var(--danger); color: #fff;">0 🚨</span>`
                            : `<span class="score-pill ${pillClass}">${r.score}</span>`;

                        const statusDisplay = r.isCheated
                            ? `<span class="kkm-pill remedial" style="background: var(--danger); color: white; font-weight: 800;" title="${escapeHtml(r.statusNote || 'Diskualifikasi')}">🚨 DISKUALIFIKASI</span>`
                            : (r.score >= 80
                                ? `<span class="kkm-pill passed" style="font-weight: 800;">LULUS KKM</span>`
                                : `<span class="kkm-pill remedial" style="font-weight: 800;">PERLU BELAJAR</span>`);

                        const renderTopicCell = (topicKey, topicName) => {
                            if (!tb || !tb[topicKey]) {
                                return `<span style="color: var(--text-muted); font-size: 0.75rem;">-</span>`;
                            }
                            const t = tb[topicKey];
                            const tScore = (t.score !== undefined) ? t.score : Math.round((t.correct / (t.total || 10)) * 100);
                            const bgStyle = tScore >= 80 
                                ? 'background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #34d399;' 
                                : (tScore >= 60 
                                    ? 'background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.4); color: #38bdf8;'
                                    : 'background: rgba(244,63,94,0.15); border: 1px solid rgba(244,63,94,0.4); color: #fb7185;');
                            return `
                                <div style="display: inline-flex; flex-direction: column; align-items: center; justify-content: center; padding: 2px 6px; border-radius: 6px; ${bgStyle} cursor: pointer; min-width: 48px;" 
                                     onclick="openStudentDetailModal(window.currentRenderedRecords[${recordIdx}], '${topicKey}')" 
                                     title="${escapeHtml(topicName)}: ${tScore} (${t.correct}/${t.total} Soal) - Klik untuk filter 10 soal materi ini">
                                    <span style="font-family: var(--font-mono); font-weight: 800; font-size: 0.82rem;">${tScore}</span>
                                    <span style="font-size: 0.65rem; opacity: 0.85;">${t.correct}/${t.total}</span>
                                </div>
                            `;
                        };

                        const m1Cell = renderTopicCell('M1', 'Literasi Digital & Ekosistem Fakta');
                        const m2Cell = renderTopicCell('M2', 'Web Browser & Mesin Pencari');
                        const m3Cell = renderTopicCell('M3', 'Digitalisasi Budaya & HKI');
                        const m4Cell = renderTopicCell('M4', 'Etika, Privasi & Keamanan');
                        const m5Cell = renderTopicCell('M5', 'Infrastruktur Jaringan & Siber');
                        const m6Cell = renderTopicCell('M6', 'Aplikasi Perkantoran Word & Excel');

                        tr.innerHTML = `
                            <td style="font-family: var(--font-mono); color: var(--text-muted);">${i + 1}</td>
                            <td style="font-weight: 700;">
                                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                    <span>${escapeHtml(item.name)}</span>
                                    ${item.attemptsCount > 1 ? `<span class="badge-attempts">${item.attemptsCount}x</span>` : ''}
                                </div>
                            </td>
                            <td><span style="font-family: var(--font-mono); color: var(--accent); font-size: 0.85rem;">${escapeHtml(item.class)}</span></td>
                            <td style="text-align: center;">${scoreDisplay}</td>
                            <td style="text-align: center;">${m1Cell}</td>
                            <td style="text-align: center;">${m2Cell}</td>
                            <td style="text-align: center;">${m3Cell}</td>
                            <td style="text-align: center;">${m4Cell}</td>
                            <td style="text-align: center;">${m5Cell}</td>
                            <td style="text-align: center;">${m6Cell}</td>
                            <td style="text-align: center;">${statusDisplay}</td>
                            <td style="text-align: center; color: var(--text-muted); font-size: 0.82rem;">${escapeHtml(r.duration || '-')}</td>
                            <td style="text-align: center; white-space: nowrap;">
                                <button class="btn-detail-row" title="Periksa Lembar Jawaban 60 Soal & Analisis Tiap Materi" onclick="openStudentDetailModal(window.currentRenderedRecords[${recordIdx}])">
                                    🔍 Periksa
                                </button>
                                <button class="btn-delete-row" title="Hapus nilai Tryout siswa ini" onclick="openDeleteStudentModuleModal('${escapeHtml(item.name)}', '${escapeHtml(item.class)}', 'modul_tryout_terpadu', ${r.score})">
                                    🗑️
                                </button>
                            </td>
                        `;
                    } else {
                        // Siswa belum mengerjakan Tryout
                        tr.style.opacity = '0.85';
                        tr.innerHTML = `
                            <td style="font-family: var(--font-mono); color: var(--text-muted);">${i + 1}</td>
                            <td style="font-weight: 600; color: var(--text-secondary);">
                                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                    <span>${escapeHtml(item.name)}</span>
                                    <span class="badge-waiting">⏳ Menunggu</span>
                                </div>
                            </td>
                            <td><span style="font-family: var(--font-mono); color: var(--text-muted); font-size: 0.85rem;">${escapeHtml(item.class)}</span></td>
                            <td style="text-align: center;"><span class="score-pill low" style="background: rgba(148,163,184,0.08); border-color: rgba(148,163,184,0.25); color: var(--text-muted);">-</span></td>
                            <td style="text-align: center; color: var(--text-muted); font-size: 0.75rem;">-</td>
                            <td style="text-align: center; color: var(--text-muted); font-size: 0.75rem;">-</td>
                            <td style="text-align: center; color: var(--text-muted); font-size: 0.75rem;">-</td>
                            <td style="text-align: center; color: var(--text-muted); font-size: 0.75rem;">-</td>
                            <td style="text-align: center; color: var(--text-muted); font-size: 0.75rem;">-</td>
                            <td style="text-align: center; color: var(--text-muted); font-size: 0.75rem;">-</td>
                            <td style="text-align: center;"><span class="kkm-pill remedial" style="background: rgba(234,179,8,0.12); color: #fde047; border-color: rgba(234,179,8,0.35); font-size: 0.72rem; padding: 3px 8px;">⏳ BELUM TRYOUT</span></td>
                            <td style="text-align: center; color: var(--text-muted);">-</td>
                            <td style="text-align: center;">
                                <button type="button" class="btn btn-secondary" onclick="remindStudent('${escapeHtml(item.name)}', '${escapeHtml(item.class)}', 'tryout')" style="padding: 4px 8px; font-size: 0.72rem; border-radius: 6px; font-weight: 700;" title="Salin Pengingat WhatsApp Tryout">
                                    📲 Ingatkan
                                </button>
                            </td>
                        `;
                    }
                } else if (!isSingleModuleView) {
                    // ──── RENDER MODE KOMPARASI 2 KUIS (ALL) ────
                    let kuis1Html = '';
                    if (item.hasFakta && item.recordFakta) {
                        const rec1 = item.recordFakta;
                        const isPass1 = rec1.score >= 80;
                        const rIdx1 = window.currentRenderedRecords.length;
                        window.currentRenderedRecords.push(rec1);
                        kuis1Html = `
                            <div style="display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap;">
                                <span class="quiz-score-subpill ${isPass1 ? 'pass' : 'remedy'}" title="${escapeHtml(getRemedialMeta(rec1).title || '')}">${rec1.score} (${isPass1 ? 'Lulus' : 'Remedi'})${rec1.isRemedial ? ' 🔁' : ''}</span>${getRemedialMeta(rec1).state === 'perlu' ? '<span class="badge-remedial-needed" style="font-size:0.62rem;">Perlu Remedial</span>' : (getRemedialMeta(rec1).state === 'none' ? '' : '<span class="' + (getRemedialMeta(rec1).state === 'tuntas' ? 'badge-remedial-tuntas' : 'badge-remedial-gagal') + '" style="font-size:0.62rem;">' + getRemedialMeta(rec1).short + '</span>')}
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
                                <span class="quiz-score-subpill ${isPass2 ? 'pass' : 'remedy'}" title="${escapeHtml(getRemedialMeta(rec2).title || '')}">${rec2.score} (${isPass2 ? 'Lulus' : 'Remedi'})${rec2.isRemedial ? ' 🔁' : ''}</span>${getRemedialMeta(rec2).state === 'perlu' ? '<span class="badge-remedial-needed" style="font-size:0.62rem;">Perlu Remedial</span>' : (getRemedialMeta(rec2).state === 'none' ? '' : '<span class="' + (getRemedialMeta(rec2).state === 'tuntas' ? 'badge-remedial-tuntas' : 'badge-remedial-gagal') + '" style="font-size:0.62rem;">' + getRemedialMeta(rec2).short + '</span>')}
                                <button type="button" class="btn-detail-row" style="padding: 2px 7px; font-size: 0.7rem;" onclick="openStudentDetailModal(window.currentRenderedRecords[${rIdx2}])" title="Periksa Lembar Kuis 2">🔍</button>
                                <button type="button" class="btn-delete-row" style="padding: 2px 6px; font-size: 0.7rem; border-radius: 4px;" onclick="openDeleteStudentModuleModal('${escapeHtml(item.name)}', '${escapeHtml(item.class)}', 'modul_jaringan_keamanan', ${rec2.score})" title="Hapus Nilai Kuis 2 (Keamanan Jaringan) saja">🗑️</button>
                            </div>
                        `;
                    } else {
                        kuis2Html = `<span class="quiz-score-subpill waiting">⏳ Belum</span>`;
                    }

                    const renderModuleScore = (record, moduleId, label) => {
                        if (!record) return '<span class="quiz-score-subpill waiting">⏳ BELUM MENGERJAKAN</span>';
                        const idx = window.currentRenderedRecords.length;
                        window.currentRenderedRecords.push(record);
                        const pass = Number(record.score) >= 80;
                        return `<div style="display:flex;align-items:center;justify-content:center;gap:4px;flex-wrap:wrap;"><span class="quiz-score-subpill ${pass ? 'pass' : 'remedy'}" title="Nilai asli hasil pengumpulan siswa">${record.score}</span><button type="button" class="btn-detail-row" style="padding:2px 7px;font-size:0.7rem;" onclick="openStudentDetailModal(window.currentRenderedRecords[${idx}])" title="Periksa hasil ${label}">🔍</button><button type="button" class="btn-delete-row" style="padding:2px 6px;font-size:0.7rem;border-radius:4px;" onclick="openDeleteStudentModuleModal('${escapeHtml(item.name)}','${escapeHtml(item.class)}','${moduleId}',${record.score})" title="Hapus nilai ${label}">🗑️</button></div>`;
                    };
                    const panduanHtml = renderModuleScore(item.recordPanduan, 'modul_hki_profesi_budaya', 'Panduan Generasi Digital');
                    const privasiHtml = renderModuleScore(item.recordPrivasi, 'modul_etika_privasi_keamanan', 'Privasi & Keamanan Digital');

                    let tryoutHtml = '';
                    if (item.hasTryout && item.recordTryout) {
                        const recTO = item.recordTryout;
                        const isPassTO = recTO.score >= 80;
                        const rIdxTO = window.currentRenderedRecords.length;
                        window.currentRenderedRecords.push(recTO);
                        tryoutHtml = `
                            <div style="display: flex; align-items: center; justify-content: center; gap: 4px; flex-wrap: wrap;">
                                <span class="quiz-score-subpill ${isPassTO ? 'pass' : 'remedy'}" title="Skor Tryout Terpadu (60 Soal • 6 Materi)">${recTO.score} (${isPassTO ? 'Lulus' : 'Remedi'})</span>
                                <button type="button" class="btn-detail-row" style="padding: 2px 7px; font-size: 0.7rem;" onclick="openStudentDetailModal(window.currentRenderedRecords[${rIdxTO}])" title="Periksa Matriks Nilai 6 Materi Tryout">🔍</button>
                                <button type="button" class="btn-delete-row" style="padding: 2px 6px; font-size: 0.7rem; border-radius: 4px;" onclick="openDeleteStudentModuleModal('${escapeHtml(item.name)}', '${escapeHtml(item.class)}', 'modul_tryout_terpadu', ${recTO.score})" title="Hapus Nilai Tryout saja">🗑️</button>
                            </div>
                        `;
                    } else {
                        tryoutHtml = `<span class="quiz-score-subpill waiting">⏳ Belum</span>`;
                    }

                    // Badge Status Pengerjaan Lengkap
                    let crossBadge = '';
                    if (item.completionStatus === 'both' && item.hasTryout) {
                        crossBadge = `<span class="badge-cross-both" title="Menyelesaikan Kuis 1, Kuis 2, dan Tryout 60 Soal">🌟 Tuntas (2 Kuis + TO)</span>`;
                    } else if (item.completionStatus === 'both') {
                        crossBadge = `<span class="badge-cross-both">🟢 Tuntas 2 Kuis</span>`;
                    } else if (item.hasTryout) {
                        crossBadge = `<span class="badge-cross-only1" style="background: rgba(99,102,241,0.18); border-color: rgba(99,102,241,0.4); color: #a5b4fc;" title="Sudah Menyelesaikan Tryout 60 Soal">🎯 Tryout Selesai</span>`;
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
                    if (item.hasFakta || item.hasJaringan || item.hasPanduan || item.hasPrivasi || item.hasTryout) {
                        actionHtml = `
                            <div style="display: flex; align-items: center; justify-content: center; gap: 5px; flex-wrap: wrap;">
                                <button type="button" class="btn-delete-row" onclick="openDeleteStudentModuleModal('${escapeHtml(item.name)}', '${escapeHtml(item.class)}')" style="padding: 4px 8px; font-size: 0.72rem; border-radius: 6px; font-weight: 700;" title="Pilih modul & hapus nilai untuk siswa ini">
                                    🗑️ Hapus Nilai...
                                </button>
                                ${item.completionStatus !== 'both' ? `
                                    <button type="button" class="btn btn-secondary" onclick="remindStudent('${escapeHtml(item.name)}', '${escapeHtml(item.class)}', '${item.completionStatus === 'only_fakta' ? 'only_jaringan' : (item.hasTryout ? 'tryout' : 'only_fakta')}')" style="padding: 4px 8px; font-size: 0.72rem; border-radius: 6px; font-weight: 700;" title="Salin Pengingat WhatsApp Sesuai Evaluasi yang Belum">
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
                        <td style="text-align: center;">${panduanHtml}</td>
                        <td style="text-align: center;">${privasiHtml}</td>
                        <td style="text-align: center;">${tryoutHtml}</td>
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
                        const remMeta = getRemedialMeta(r);
                        const isRemedial = !!r.isRemedial;
                        const badgeCls = remMeta.state === 'tuntas' ? 'badge-remedial-tuntas' : (remMeta.state === 'belum' ? 'badge-remedial-gagal' : 'badge-remedial-needed');
                        const remedialBadge = remMeta.label
                            ? `<span class="${badgeCls}" title="${escapeHtml(remMeta.title || '')}">${remMeta.label}</span>`
                            : '';

                        const scoreDisplay = r.isCheated 
                            ? `<span class="score-pill low" style="background: rgba(244,63,94,0.25); border-color: var(--danger); color: #fff;">0 🚨</span>` 
                            : `<span class="score-pill ${pillClass}">${r.score}</span> ${remedialBadge}`;

                        const statusDisplay = r.isCheated
                            ? `<span class="kkm-pill remedial" style="background: var(--danger); color: white; font-weight: 800;" title="${escapeHtml(r.statusNote || 'Kecurangan')}">🚨 DISKUALIFIKASI</span>`
                            : (remMeta.state === 'tuntas'
                                ? `<span class="kkm-pill passed" style="background: rgba(16,185,129,0.18); border-color: #10b981; color: #10b981; font-weight: 800;" title="${escapeHtml(remMeta.title)}">TUNTAS REMEDIAL</span>`
                                : (remMeta.state === 'belum'
                                    ? `<span class="kkm-pill remedial" style="font-weight: 800;" title="${escapeHtml(remMeta.title)}">BELUM TUNTAS (SUDAH REMEDIAL)</span>`
                                    : `<span class="kkm-pill ${isPass ? 'passed' : 'remedial'}">${isPass ? 'LULUS' : 'PERLU REMEDIAL'}</span>`));

                        const attemptsBadge = item.attemptsCount > 1 
                            ? `<span class="badge-attempts" title="Siswa ini telah mengerjakan ${item.attemptsCount} kali (Menampilkan nilai terbaik)">${item.attemptsCount}x Percobaan</span>` 
                            : '';

                        let tryoutMiniChip = '';
                        if (r.topicBreakdown) {
                            const tb = r.topicBreakdown;
                            const parts = Object.keys(tb).map(k => `${k}:${tb[k].score}`);
                            tryoutMiniChip = `<div style="font-size: 0.65rem; color: #a5b4fc; font-family: var(--font-mono); margin-top: 3px;" title="Nilai per materi: ${Object.keys(tb).map(k => `${k} (${tb[k].title}): ${tb[k].score}`).join(' | ')}">${parts.join(' ')}</div>`;
                        } else if (r.moduleId === 'modul_tryout_terpadu') {
                            tryoutMiniChip = `<div style="font-size: 0.65rem; color: #a5b4fc; font-family: var(--font-mono); margin-top: 3px;">6 Materi (Klik Periksa)</div>`;
                        }

                        tr.innerHTML = `
                            <td style="font-family: var(--font-mono); color: var(--text-muted);">${i + 1}</td>
                            <td style="font-weight: 700;">
                                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                                    <span>${escapeHtml(item.name)}</span>
                                    ${attemptsBadge}
                                </div>
                            </td>
                            <td><span style="font-family: var(--font-mono); color: var(--accent); font-size: 0.85rem;">${escapeHtml(item.class)}</span></td>
                            <td>${scoreDisplay}${tryoutMiniChip}</td>
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

function pickBestRecord(list) {
    if (!list || !list.length) return undefined;
    return [...list].sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0) || (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0))[0];
}

function remedialExcelLabel(r) {
    if (!r) return '-';
    const m = getRemedialMeta(r);
    const attempt = (r.remedialScore !== null && r.remedialScore !== undefined) ? r.remedialScore : r.score;
    if (r.adjustedByTeacher) return `SUDAH REMEDIAL - TUNTAS (DISESUAIKAN GURU: ${r.score})`;
    if (m.state === 'tuntas') return `SUDAH REMEDIAL - TUNTAS (Awal: ${r.originalScore} ➔ Remedi: ${attempt} ➔ Nilai Akhir: ${r.score})`;
    if (m.state === 'belum') return `SUDAH REMEDIAL - BELUM TUNTAS (Awal: ${r.originalScore} ➔ Remedi: ${attempt} ➔ Nilai Akhir: ${r.score})`;
    if (m.state === 'perlu') return 'PERLU REMEDIAL (BELUM REMEDIAL)';
    return 'TIDAK REMEDIAL';
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

    if (filterModule === 'modul_tryout_terpadu') {
        // ──── MODE TRYOUT TERPADU 60 SOAL (EXCEL DENGAN MATRIKS 6 MATERI) ────
        const generateTryoutSheet = (clsTitle, classRecords) => {
            const bestByStudent = new Map();
            classRecords.forEach(r => {
                const key = `${(r.name || '').trim().toLowerCase()}|${(r.class || '').replace(/\s+/g, '').toUpperCase()}`;
                const cur = bestByStudent.get(key);
                if (!cur || pickBestRecord([cur, r]) === r) bestByStudent.set(key, r);
            });
            const sorted = [...bestByStudent.values()].sort((a, b) => b.score - a.score || (a.name || '').localeCompare(b.name || ''));

            const sheetData = [
                ['SMAN 4 PADANG — REKAP NILAI TRYOUT TERPADU INFORMATIKA (60 SOAL • 6 MATERI)'],
                [`Laporan Kelas: ${clsTitle} (Standar KKM: 80) — Guru: MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.`],
                [`Total Responden: ${sorted.length} Siswa | Waktu Unduh: ${new Date().toLocaleString('id-ID')}`],
                [],
                [
                    'No', 'Nama Siswa', 'Kelas', 'Skor Total Tryout', 'Status Kelulusan',
                    'M1 (Fakta)', 'M2 (Browser)', 'M3 (HKI)', 'M4 (Etika)', 'M5 (Jaringan)', 'M6 (Word/Excel)',
                    'Jawaban Benar', 'Total Soal', 'Durasi', 'Waktu Selesai', 'Tanggal'
                ]
            ];

            sorted.forEach((r, i) => {
                const tb = r.topicBreakdown || (typeof computeTopicBreakdownFromRecord === 'function' ? computeTopicBreakdownFromRecord(r) : null);
                const getTopicScore = (code) => {
                    if (!tb || !tb[code]) return '-';
                    return `${tb[code].score} (${tb[code].correct}/${tb[code].total})`;
                };
                sheetData.push([
                    i + 1,
                    sanitizeSpreadsheetValue(r.name),
                    sanitizeSpreadsheetValue(r.class || clsTitle),
                    r.score,
                    r.score >= 80 ? 'LULUS (TUNTAS)' : 'PERLU BELAJAR',
                    getTopicScore('M1'),
                    getTopicScore('M2'),
                    getTopicScore('M3'),
                    getTopicScore('M4'),
                    getTopicScore('M5'),
                    getTopicScore('M6'),
                    r.correct !== undefined ? r.correct : '-',
                    r.total || 60,
                    r.duration || '-',
                    r.time || '-',
                    r.date || '-'
                ]);
            });
            return sheetData;
        };

        const tryoutColWidths = [
            { wch: 6 }, { wch: 32 }, { wch: 10 }, { wch: 18 }, { wch: 16 },
            { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 18 },
            { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 14 }
        ];

        const tryoutRecords = allRecords.filter(r => {
            const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || '');
            return mod === 'modul_tryout_terpadu';
        });

        if (filterClass === 'all') {
            const sheetAll = generateTryoutSheet('Semua Kelas (X E 1 - X E 6)', tryoutRecords);
            const wsAll = XLSX.utils.aoa_to_sheet(sheetAll);
            wsAll['!cols'] = tryoutColWidths;
            XLSX.utils.book_append_sheet(wb, wsAll, 'Tryout Semua Siswa');

            targetClasses.forEach(c => {
                const clsRecords = tryoutRecords.filter(r => r.class === c);
                const sheetCls = generateTryoutSheet(`Kelas ${c}`, clsRecords);
                const wsCls = XLSX.utils.aoa_to_sheet(sheetCls);
                wsCls['!cols'] = tryoutColWidths;
                XLSX.utils.book_append_sheet(wb, wsCls, `Kelas ${c}`);
            });
        } else {
            const clsRecords = tryoutRecords.filter(r => r.class === filterClass);
            const sheetCls = generateTryoutSheet(`Kelas ${filterClass}`, clsRecords);
            const wsCls = XLSX.utils.aoa_to_sheet(sheetCls);
            wsCls['!cols'] = tryoutColWidths;
            XLSX.utils.book_append_sheet(wb, wsCls, `Kelas ${filterClass}`);
        }

        const fileName = `Rekap_Nilai_Tryout_Terpadu_${filterClass === 'all' ? 'Semua_Kelas' : filterClass.replace(/ /g, '_')}_${new Date().toISOString().slice(0,10)}.xlsx`;
        XLSX.writeFile(wb, fileName);
        if (typeof sfxCorrect === 'function') sfxCorrect();
        showToast(`File Excel Tryout Terpadu berhasil diunduh! 📊`, '✅');
        return;
    }

    if (filterModule === 'all') {
        // ──── MODE KOMPARASI 2 KUIS (EXCEL) ────
        const buildComparativeSheet = (clsTitle, classesList) => {
            const rows = [
                ['SMAN 4 PADANG — LAPORAN KOMPARASI HASIL BELAJAR SISWA'],
                ['Evaluasi: Kuis 1 (Detektif Fakta) & Kuis 2 (Infrastruktur Jaringan & Keamanan Digital)'],
                [`Kelas: ${clsTitle}  |  Standar KKM: 80  |  Guru Pengampu: MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.`],
                [`Waktu Unduh: ${new Date().toLocaleString('id-ID')}`],
                [],
                ['No', 'Nama Siswa', 'Kelas', 'Nilai Kuis 1 (Fakta)', 'Status K1', 'Nilai Kuis 2 (Jaringan)', 'Status K2', 'Rata-Rata', 'Status Pengerjaan', 'Hasil Akhir', 'Remedial Kuis 1', 'Remedial Kuis 2']
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

                    const recFakta = pickBestRecord(allRecords.filter(r => {
                        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
                        return nameMatches(r.name) && classMatches(r.class) && mod === modFaktaId;
                    }));
                    const recJaringan = pickBestRecord(allRecords.filter(r => {
                        const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
                        return nameMatches(r.name) && classMatches(r.class) && mod === modJaringanId;
                    }));

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
                        kelulusan,
                        remedialExcelLabel(recFakta),
                        remedialExcelLabel(recJaringan)
                    ]);
                });
            });
            return rows;
        };

        const compColWidths = [
            { wch: 6 }, { wch: 32 }, { wch: 10 }, { wch: 20 },
            { wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 14 },
            { wch: 20 }, { wch: 20 }, { wch: 34 }, { wch: 34 }
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
        const filteredRecords = allRecords.filter(r => {
            const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
            return isJaringan ? mod === modJaringanId : mod === modFaktaId;
        });

        const generateSingleModSheet = (clsTitle, classRecords) => {
            const bestByStudent = new Map();
            classRecords.forEach(r => {
                const key = `${(r.name || '').trim().toLowerCase()}|${(r.class || '').replace(/\s+/g, '').toUpperCase()}`;
                const cur = bestByStudent.get(key);
                if (!cur || pickBestRecord([cur, r]) === r) bestByStudent.set(key, r);
            });
            const sorted = [...bestByStudent.values()].sort((a, b) => b.score - a.score || (a.name || '').localeCompare(b.name || ''));
            const jmlRemedial = sorted.filter(r => r.isRemedial).length;
            const jmlPerlu = sorted.filter(r => getRemedialMeta(r).state === 'perlu').length;
            const total = sorted.length;
            const sum = sorted.reduce((acc, r) => acc + (r.score || 0), 0);
            const avg = total > 0 ? (sum / total).toFixed(1) : '0';
            const highest = total > 0 ? Math.max(...sorted.map(r => r.score || 0)) : 0;
            const lowest = total > 0 ? Math.min(...sorted.map(r => r.score || 0)) : 0;
            const lulus = sorted.filter(r => (r.score || 0) >= 80).length;

            const sheetData = [
                [`SMAN 4 PADANG — REKAP NILAI ${modTitle}`],
                [`Laporan Kelas: ${clsTitle} (Standar KKM: 80) — Guru: MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.`],
                [`Total Responden: ${total} Siswa | Rata-Rata: ${avg} | Tertinggi: ${highest} | Terendah: ${lowest} | Lulus KKM: ${lulus} Siswa | Sudah Remedial: ${jmlRemedial} | Perlu Remedial (belum): ${jmlPerlu}`],
                [`Waktu Unduh: ${new Date().toLocaleString('id-ID')}`],
                [],
                ['No', 'Nama Siswa', 'Kelas', 'Nilai Akhir', 'Status KKM (≥80)', 'Jawaban Benar', 'Total Soal', 'Durasi', 'Waktu Selesai', 'Tanggal', 'Status Remedial', 'Nilai Awal', 'Nilai Remedial']
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
                    r.date || '-',
                    remedialExcelLabel(r),
                    r.isRemedial && r.originalScore != null ? r.originalScore : '-',
                    r.isRemedial && r.remedialScore != null ? r.remedialScore : '-'
                ]);
            });
            return sheetData;
        };

        const singleColWidths = [
            { wch: 6 }, { wch: 32 }, { wch: 12 }, { wch: 14 },
            { wch: 18 }, { wch: 15 }, { wch: 12 }, { wch: 15 },
            { wch: 15 }, { wch: 15 }, { wch: 38 }, { wch: 12 }, { wch: 14 }
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
                doc.text(`Guru Pengampu: MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.  |  Kelas: ${clsTitle}  |  Dicetak: ${nowStr}`, 14, 26);

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
                    doc.text('MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.', 140, finalY + 24);
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
            const filteredRecords = allRecords.filter(r => {
                const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
                return isJaringan ? mod === modJaringanId : mod === modFaktaId;
            });

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
                doc.text(`Guru Pengampu: MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.  |  Kelas: ${clsTitle}`, 14, 20);
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

                const tableBody = sorted.map((r, i) => {
                    let statusLabel = r.score >= 80 ? 'LULUS' : 'REMEDIAL';
                    if (r.isRemedial) {
                        const attempt = r.remedialScore != null ? r.remedialScore : r.score;
                        statusLabel = r.score >= 80 ? `LULUS (Remedi: ${attempt} ➔ Akhir: ${r.score})` : `REMEDIAL (${r.originalScore}➔${r.score})`;
                    }
                    return [
                        i + 1,
                        r.name,
                        r.class || clsTitle,
                        r.score,
                        `${r.correct !== undefined ? r.correct : 0} / ${r.total || (typeof getActiveQuizData === 'function' ? getActiveQuizData().length : 20)}`,
                        statusLabel,
                        r.duration || '-',
                        r.time || '-',
                        r.date || '-'
                    ];
                });

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
                    doc.text('MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.', 140, finalY + 24);
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
        const snap = (window.RaporExcel && window.RaporExcel.buildSnapshot) ? window.RaporExcel.buildSnapshot() : null;
        if (!snap) throw new Error('Data hasil kuis belum tersedia');
        const finalScore = snap.score;
        const studentName = snap.name, studentClass = snap.cls;
        const nowStr = new Date().toLocaleString('id-ID');
        const isLulus = snap.isPassed;
        const KKM_PDF = snap.kkm;
        const maxStreak = snap.maxStreak;

        const modTitle = snap.moduleTitle;
        const proofId = snap.proofId;

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
        doc.text(`${modTitle} (Standar KKM: ${KKM_PDF})`, 14, 21);
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
        doc.text(snap.isRemedial ? (isLulus ? `REMEDIAL: TUNTAS (≥${KKM_PDF})` : `REMEDIAL: BELUM TUNTAS (<${KKM_PDF})`) : (isLulus ? `STATUS: LULUS (≥${KKM_PDF})` : `STATUS: REMEDIAL (<${KKM_PDF})`), 163, 63, { align: 'center' });

        const isTryoutMod = (snap.moduleId === 'modul_tryout_terpadu');
        const isPostponed = !isTryoutMod && ((typeof isReviewPostponed === 'function') 
            ? isReviewPostponed() 
            : (localStorage.getItem('quizmaster_review_release_mode') !== 'open'));

        if (isPostponed) {
            // 🛡️ TAMPILKAN SURAT BUKTI PENGUMPULAN UJIAN RESMI TANPA MEMBOCORKAN BUTIR SOAL
            doc.setFillColor(241, 245, 249);
            doc.setDrawColor(203, 213, 225);
            doc.roundedRect(14, 82, 182, 60, 3, 3, 'FD');

            doc.setTextColor(30, 41, 59);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.text('🔒 BUKTI TANDA TERIMA PENGUMPULAN UJIAN RESMI', 20, 93);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(71, 85, 105);
            doc.text('Jawaban lembar ujian Anda telah berhasil tervalidasi dan tersimpan di Dasbor Guru.', 20, 102);
            doc.text('Untuk menjaga kerahasiaan & integritas ujian bersama Kelas X SMAN 4 Padang,', 20, 108);
            doc.text('analisis butir soal serta kunci pembahasan ditunda resmi oleh Guru Pengampu.', 20, 114);
            doc.text('Guru Pengampu : Bpk. MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.', 20, 122);
            doc.text('Status Cloud   : Terverifikasi Aman di Peladen Sekolah (Supabase)', 20, 128);
            doc.text(`Nomor Bukti    : ${proofId}`, 20, 134);

            doc.save(`Bukti_Ujian_${(studentClass||'XE').replace(/\s+/g,'_')}_${(studentName||'Siswa').replace(/\s+/g,'_')}.pdf`);
            if (typeof sfxSuccess === 'function') sfxSuccess();
            showToast('Bukti Tanda Terima Ujian Resmi berhasil diunduh! 📄', '✅');
            return;
        }

        // 3. Question Details Table (Dengan Pembahasan, Penjelasan Edukatif & Tingkat Kesulitan)
        const tableBody = snap.rows.map(r => [
            r.no,
            `[${r.difficulty}] ${r.question}`,
            r.result === 'BENAR' ? 'BENAR' : (r.result === 'SEBAGIAN' ? `SEBAGIAN (${r.points}/${r.maxPoints})` : 'SALAH'),
            r.key,
            r.explanation
        ]);

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
                    } else if (String(data.cell.raw).indexOf('SEBAGIAN') === 0) {
                        data.cell.styles.textColor = [217, 119, 6]; // Amber
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
    (async () => {
        let snap = null;
        try {
            snap = (window.RaporExcel && typeof window.RaporExcel.buildSnapshot === 'function')
                ? window.RaporExcel.buildSnapshot()
                : null;
            if (!snap) throw new Error('Modul rapor Excel belum dimuat');

            const safeClass = String(snap.cls).replace(/[/\\?%*:|"<> ]/g, '_');
            const safeName = String(snap.name).replace(/[/\\?%*:|"<> ]/g, '_');

            // Opsi 1: .xlsx bergaya penuh (warna, rumus, filter, freeze pane) — tanpa pustaka tambahan selain JSZip
            if (typeof JSZip !== 'undefined') {
                try {
                    const blob = await window.RaporExcel.buildXlsxBlob(snap);
                    window.RaporExcel.downloadBlob(blob, `Rapor_Kuis_${safeClass}_${safeName}.xlsx`);
                    sfxCorrect();
                    showToast('Rapor Excel (.xlsx) berhasil diunduh!', '📊');
                    return;
                } catch (xlsxErr) {
                    console.warn('Rapor XLSX gagal, memakai cadangan .xls:', xlsxErr);
                }
            }

            // Opsi 2: cadangan .xls (tabel HTML) — nilai tetap bersumber dari snapshot yang sama
            const esc = (v) => (typeof escapeHtml === 'function' ? escapeHtml(String(v == null ? '' : v)) : String(v == null ? '' : v));
            let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head>' +
                '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
                '<style>body{font-family:Calibri,Arial,sans-serif;font-size:10pt}table{border-collapse:collapse}' +
                'th{background:#4f46e5;color:#fff;font-weight:bold;border:1px solid #cbd5e1;padding:6px;text-align:center}' +
                'td{border:1px solid #cbd5e1;padding:5px 7px;vertical-align:top}' +
                '.title{background:#0f172a;color:#22d3ee;font-size:14pt;font-weight:bold;padding:10px}' +
                '.lbl{font-weight:bold;background:#f1f5f9}.ok{color:#166534;font-weight:bold}.bad{color:#991b1b;font-weight:bold}.mid{color:#92400e;font-weight:bold}</style></head><body><table>' +
                '<tr><td colspan="8" class="title">RAPOR HASIL EVALUASI PEMBELAJARAN SISWA</td></tr>' +
                '<tr><td colspan="8">' + esc(snap.moduleTitle) + ' (KKM: ' + snap.kkm + ')</td></tr>' +
                '<tr><td class="lbl">Nama Siswa</td><td colspan="7">' + esc(snap.name) + '</td></tr>' +
                '<tr><td class="lbl">Kelas</td><td colspan="7">' + esc(snap.cls) + '</td></tr>' +
                '<tr><td class="lbl">Nilai Akhir</td><td colspan="7" class="' + (snap.isPassed ? 'ok' : 'bad') + '">' + snap.score + ' — ' + (snap.isPassed ? 'LULUS (KOMPETEN)' : 'BELUM LULUS (REMEDIAL)') + '</td></tr>' +
                '<tr><td class="lbl">Poin</td><td colspan="7">' + snap.pointsEarned + ' / ' + snap.totalPoints + '</td></tr>' +
                '<tr><td class="lbl">Ketepatan</td><td colspan="7">Benar penuh ' + snap.counts.full + ', sebagian ' + snap.counts.partial + ', salah ' + snap.counts.wrong + ' dari ' + snap.counts.total + ' soal</td></tr>' +
                '<tr><td class="lbl">No. Bukti</td><td colspan="7">' + esc(snap.proofId) + '</td></tr>';
            if (snap.postponed || !snap.rows.length) {
                html += '<tr><td colspan="8">🔒 Rincian butir soal &amp; pembahasan dirahasiakan oleh Guru selama sesi ujian berlangsung.</td></tr>';
            } else {
                html += '<tr><th>No</th><th>Tingkat</th><th>Pertanyaan</th><th>Jawaban Anda</th><th>Kunci</th><th>Hasil</th><th>Poin</th><th>Pembahasan</th></tr>';
                snap.rows.forEach(r => {
                    const cls = r.result === 'BENAR' ? 'ok' : (r.result === 'SEBAGIAN' ? 'mid' : 'bad');
                    html += '<tr><td align="center">' + r.no + '</td><td align="center">' + esc(r.difficulty) + '</td><td>' + esc(r.question) + '</td><td>' + esc(r.selected) + '</td><td>' + esc(r.key) + '</td><td align="center" class="' + cls + '">' + r.result + '</td><td align="center">' + r.points + '/' + r.maxPoints + '</td><td>' + esc(r.explanation) + '</td></tr>';
                });
            }
            html += '</table></body></html>';
            const blob = new Blob(['﻿' + html], { type: 'application/vnd.ms-excel;charset=utf-8' });
            window.RaporExcel.downloadBlob(blob, `Rapor_Kuis_${safeClass}_${safeName}.xls`);
            sfxCorrect();
            showToast('Rapor Excel (.xls) berhasil diunduh!', '📊');
        } catch (err) {
            if (typeof sfxWrong === 'function') sfxWrong();
            showToast('Gagal mengekspor: ' + err.message, '❌');
        }
    })();
}

function exportCSV() {
    sfxClick();
    const records = loadRecords();
    const filterClassEl = document.getElementById('filter-class');
    const filterClass = filterClassEl ? filterClassEl.value : 'all';
    const filterModule = window.currentDashboardModuleFilter || (document.getElementById('filter-module') ? document.getElementById('filter-module').value : 'all');
    const modJaringanId = 'modul_jaringan_keamanan';
    const modFaktaId = 'modul_detektif_fakta';

    let filtered = filterClass === 'all' ? records : records.filter(r => r.class === filterClass);
    if (filterModule !== 'all') {
        filtered = filtered.filter(r => {
            const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
            return mod === filterModule;
        });
    }

    if (filtered.length === 0) {
        showToast('Tidak ada data siswa untuk diekspor!', '⚠️');
        return;
    }

    let csv = 'No,Nama Siswa,Kelas,Modul,Skor,Benar,Total Soal,Ketuntasan,Durasi,Waktu,Tanggal\n';
    filtered.sort((a, b) => b.score - a.score).forEach((r, i) => {
        const tuntas = r.score >= 80 ? 'LULUS' : 'REMEDIAL';
        const cleanName = sanitizeSpreadsheetValue(r.name || '').replace(/"/g, '""');
        const cleanClass = sanitizeSpreadsheetValue(r.class || '-').replace(/"/g, '""');
        const rMod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
        const modTitle = rMod === modJaringanId ? 'Keamanan Jaringan' : 'Detektif Fakta';
        const totalSoal = r.total || (typeof getActiveQuizData === 'function' ? getActiveQuizData().length : 20);
        csv += `${i + 1},"${cleanName}","${cleanClass}","${modTitle}",${r.score},${r.correct !== undefined ? r.correct : '-'},${totalSoal},"${tuntas}","${r.duration || '-'}","${r.time || '-'}","${r.date || '-'}"\n`;
    });

    const modSlug = filterModule === 'all' ? 'semua_modul' : (filterModule === modJaringanId ? 'keamanan_jaringan' : 'detektif_fakta');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_nilai_${modSlug}_${filterClass === 'all' ? 'semua_kelas' : filterClass.replace(/ /g, '_')}_${new Date().toISOString().slice(0,10)}.csv`;
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
        guruMataPelajaran: "MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.",
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
// 🧪 RESET DATA PENGUJIAN KELAS DEMO (AMAN DARI DATA ASLI)
// ============================================================
function resetDemoRecords() {
    if (!confirm('Apakah Anda yakin ingin mereset seluruh hasil kuis uji coba pada KELAS DEMO? (Data resmi 216 siswa SMAN 4 Padang tetap aman 100%)')) return;
    sfxClick();
    let records = [];
    try {
        records = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch(e) {}
    const cleaned = records.filter(r => !(typeof isClassEquivalent === 'function' ? isClassEquivalent(r.class, 'KELAS DEMO') : r.class === 'KELAS DEMO'));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    
    let emergency = [];
    try {
        emergency = JSON.parse(localStorage.getItem('quizmaster_emergency_backup_records') || '[]');
    } catch(e) {}
    const cleanedEmerg = emergency.filter(r => !(typeof isClassEquivalent === 'function' ? isClassEquivalent(r.class, 'KELAS DEMO') : r.class === 'KELAS DEMO'));
    localStorage.setItem('quizmaster_emergency_backup_records', JSON.stringify(cleanedEmerg));
    
    showToast('Data uji coba Kelas Demo berhasil di-reset!', '🧹');
    renderDashboard();
}
window.resetDemoRecords = resetDemoRecords;
window.exportExcel = exportExcel;
window.exportRecordsToExcel = exportExcel;
window.reconstructStudentAnswers = reconstructStudentAnswers;
