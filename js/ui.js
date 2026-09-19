/**
 * ============================================================
 * 🎮 GLOBAL UI, QUEST LOG & HUD OVERLAY MANAGER (ui.js)
 * ============================================================
 * Mengelola antarmuka overlay HTML: HUD bar, registrasi anggota,
 * Quest Log (Log Misi 3 Babak), balon ucapan Mentor Kak Bimo,
 * modal stasiun, modal pengaturan, toast, dan sound synthesizer.
 * ============================================================
 */

(function () {
    'use strict';

    // Web Audio Synthesizer Ringan (0 download file eksternal)
    let audioCtx = null;

    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playSynthSound(type) {
        const settings = window.GameStorage ? window.GameStorage.getSettings() : { soundEnabled: true, soundVolume: 0.8 };
        if (!settings.soundEnabled) return;

        try {
            const ctx = getAudioContext();
            if (!ctx) return;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const now = ctx.currentTime;
            const volume = settings.soundVolume || 0.8;

            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'tap') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
                gain.gain.setValueAtTime(0.2 * volume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
                osc.start(now);
                osc.stop(now + 0.06);
            } else if (type === 'success') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.08);
                osc.frequency.setValueAtTime(783.99, now + 0.16);
                gain.gain.setValueAtTime(0.25 * volume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
                osc.start(now);
                osc.stop(now + 0.35);
            } else if (type === 'stamp') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(140, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
                gain.gain.setValueAtTime(0.35 * volume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                osc.start(now);
                osc.stop(now + 0.12);
            } else if (type === 'error') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.linearRampToValueAtTime(110, now + 0.18);
                gain.gain.setValueAtTime(0.3 * volume, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
                osc.start(now);
                osc.stop(now + 0.18);
            }
        } catch (e) {
            // Audio ignore if blocked
        }
    }

    // Metadata 8 Level untuk Quest Log
    const ALL_LEVELS_INFO = [
        { id: 0, code: 'GATE 0', name: 'Orientasi Skuad', atp: 'Konsep Dasar Literasi Data', defaultClue: '@infosmax_anon kedapatan memakai ratusan akun bot untuk membanjiri medsos sekolah dengan tautan fiktif.' },
        { id: 1, code: 'MISI 1', name: 'Inbox Detective', atp: 'Validitas Sumber Data (ITP 1.1-1.2)', defaultClue: 'Ditemukan jejak digital @infosmax_anon yang menyamarkan link phishing sebagai info OSIS resmi.' },
        { id: 2, code: 'MISI 2', name: 'Gudang Arsip OSIS', atp: 'Konsep Struktur Data (ITP 2.1-2.2)', defaultClue: '@infosmax_anon mengacaukan arsip OSIS untuk menghilangkan bukti penyebaran hoaks.' },
        { id: 3, code: 'MISI 3', name: 'Lomba Algoritma', atp: 'Algoritma Standar (ITP 3.1-3.2)', defaultClue: 'Pencarian cepat mengungkap pola duplikasi konten hoaks yang disebar sindikat.' },
        { id: 4, code: 'MISI 4', name: 'Dekomposisi Proker', atp: 'Berpikir Komputasional (Dekomposisi)', defaultClue: 'Masalah besar program kerja berhasil dipecah menjadi sub-tugas yang terkelola.' },
        { id: 5, code: 'MISI 5', name: 'Robo-Asisten OSIS', atp: 'Pseudocode & Diagram Alir (IPO)', defaultClue: 'Bot asisten OSIS berhasil diprogram untuk memfilter otomatis konten dari @infosmax_anon.' },
        { id: 6, code: 'MISI 6', name: 'Lab Komputer Sekolah', atp: 'Peranan Sistem Operasi', defaultClue: 'Akses admin lab komputer diamankan dari eksploitasi celah OS lama.' },
        { id: 7, code: 'MISI 7', name: 'Presentasi ke Kepsek', atp: 'Proyek Integrasi Seluruh Materi', defaultClue: 'Bukti investigasi dipresentasikan dengan sukses di hadapan Kepala Sekolah!' }
    ];

    // Elemen DOM
    let hudBarEl = null;
    let stationModalEl = null;
    let settingsModalEl = null;
    let questLogModalEl = null;
    let idCardModalEl = null;
    let mentorHubWidgetEl = null;
    let toastContainerEl = null;
    let onStartMissionCb = null;

    /**
     * Inisialisasi DOM UI
     */
    function initUI(onStartMission) {
        onStartMissionCb = onStartMission;
        createHUD();
        createMentorHubWidget();
        createQuestLogModal();
        createStationModal();
        createSettingsModal();
        createToastContainer();
        createIDCardModal();

        updateHUD();
        initTheme();
        checkPlayerRegistration();
    }

    /**
     * Manajemen Tema Game Hub (Eksklusif Dark Mode Saja)
     */
    function initTheme() {
        setTheme('dark', false);
    }

    function setTheme(theme, withSound = false) {
        // Game Hub selalu terkunci pada tema gelap Cyberpunk Data Office
        document.documentElement.setAttribute('data-theme', 'dark');
        if (document.body) {
            document.body.setAttribute('data-theme', 'dark');
        }

        if (window.HubScene && typeof window.HubScene.setTheme === 'function') {
            window.HubScene.setTheme('dark');
        }

        // Notify active stage and mini-games
        window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: 'dark' } }));
    }

    function toggleTheme() {
        setTheme('dark', false);
    }

    /**
     * Header HUD Atas
     */
    function createHUD() {
        const existing = document.getElementById('hub-hud-header');
        if (existing) {
            hudBarEl = existing;
        } else {
            hudBarEl = document.createElement('header');
            hudBarEl.className = 'hub-hud-header';
            hudBarEl.id = 'hub-hud-header';
            hudBarEl.innerHTML = `
                <div class="hub-brand-group">
                    <!-- Tombol Kembali Utama Sisi Kiri -->
                    <a href="kuis_interaktif_dasbor_guru.html" class="hud-back-btn" id="hud-btn-kembali" title="Kembali ke Beranda Utama / Dasbor">
                        <span class="hud-back-arrow">⬅️</span>
                        <span class="hud-back-label">Kembali</span>
                    </a>
                    <span class="hud-brand-icon">🏫</span>
                    <div class="hud-brand-text">
                        <h1 class="hud-app-title">Skuad Digital OSIS</h1>
                        <span class="hud-app-sub">Fase E • Informatika SMA</span>
                    </div>
                </div>

                <div class="hud-actions-group">
                    <!-- Profil Siswa / Badge ID Card -->
                    <button type="button" class="hud-chip-btn profile-chip" id="btn-open-idcard" title="Kartu Identitas Staf">
                        <span class="chip-avatar">👤</span>
                        <span id="hud-player-name">Detektif Muda</span>
                    </button>

                    <!-- Tombol Log Misi / Quest Log -->
                    <button type="button" class="hud-chip-btn quest-log-chip" id="btn-open-quest-log" title="Buka Log Misi &amp; Catatan Investigasi">
                        <span>📋</span>
                        <span>Log Misi</span>
                    </button>

                    <!-- Indikator Grafis Low-End -->
                    <button type="button" class="hud-chip-btn" id="btn-tier-indicator" title="Pengaturan Grafis &amp; Mode Ringan">
                        <span id="tier-badge-label">Tier Low ⚡</span>
                    </button>

                    <!-- Toggle Suara -->
                    <button type="button" class="hud-icon-btn" id="btn-sound-toggle" title="Toggle Suara" aria-label="Toggle Suara">
                        <span id="sound-icon">🔊</span>
                    </button>

                    <!-- Pengaturan Global -->
                    <button type="button" class="hud-icon-btn" id="btn-open-settings" title="Pengaturan Global" aria-label="Pengaturan">
                        ⚙️
                    </button>

                    <!-- Tombol Keluar / Kembali ke Beranda Sisi Kanan -->
                    <a href="kuis_interaktif_dasbor_guru.html" class="hud-portal-link" id="hud-btn-exit" title="Keluar dan Kembali ke Beranda Utama">
                        🚪 <span>Kembali ke Beranda</span>
                    </a>
                </div>
            `;
            document.body.appendChild(hudBarEl);
        }

        // Bind Events
        const btnIdCard = document.getElementById('btn-open-idcard');
        if (btnIdCard) {
            btnIdCard.addEventListener('click', () => {
                playSynthSound('tap');
                openIDCardModal();
            });
        }

        const btnQuestLog = document.getElementById('btn-open-quest-log');
        if (btnQuestLog) {
            btnQuestLog.addEventListener('click', () => {
                playSynthSound('tap');
                openQuestLogModal();
            });
        }

        const btnTier = document.getElementById('btn-tier-indicator');
        if (btnTier) {
            btnTier.addEventListener('click', () => {
                playSynthSound('tap');
                openSettingsModal();
            });
        }

        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                if (!window.GameStorage) return;
                const settings = window.GameStorage.getSettings();
                const newSoundState = !settings.soundEnabled;
                window.GameStorage.updateSettings({ soundEnabled: newSoundState });
                const soundIcon = document.getElementById('sound-icon');
                if (soundIcon) soundIcon.textContent = newSoundState ? '🔊' : '🔇';
                playSynthSound('tap');
                showToast(newSoundState ? 'Suara Diaktifkan 🔊' : 'Suara Dimatikan 🔇', 'info', 1800);
            });
        }

        const btnSettings = document.getElementById('btn-open-settings');
        if (btnSettings) {
            btnSettings.addEventListener('click', () => {
                playSynthSound('tap');
                openSettingsModal();
            });
        }
    }

    /**
     * Balon Ucapan Mentor Bu Maya di Hub 3D
     */
    function createMentorHubWidget() {
        mentorHubWidgetEl = document.createElement('div');
        mentorHubWidgetEl.className = 'hub-mentor-widget animate-slide-down';
        mentorHubWidgetEl.id = 'hub-mentor-widget';
        mentorHubWidgetEl.innerHTML = `
            <div class="mentor-widget-avatar">👨‍💻</div>
            <div class="mentor-widget-content">
                <div class="mentor-widget-speaker">
                    <strong>Kak Bimo</strong>
                    <span class="mentor-tag">Pembina Ekskul TIK</span>
                </div>
                <div class="mentor-widget-bubble" id="hub-mentor-remark">
                    Memuat instruksi...
                </div>
            </div>
        `;
        document.body.appendChild(mentorHubWidgetEl);
    }

    function updateMentorRemark() {
        const remarkEl = document.getElementById('hub-mentor-remark');
        if (!remarkEl || !window.GameStorage) return;

        const pName = window.GameStorage.getPlayerName() || 'Anggota Baru';
        const meter = window.GameStorage.getMeterKepercayaan();
        const p = window.GameStorage.getProgress();

        let remark = '';
        if (!p.completedLevels || !p.completedLevels[0]) {
            remark = `Halo <strong>${pName}</strong>! Selamat datang di Skuad Digital OSIS. Yuk selesaikan <strong>Gate 0</strong> dulu biar kamu resmi jadi anggota.`;
        } else if (!p.completedLevels[1]) {
            remark = `Mantap, <strong>${pName}</strong>! Kamu udah resmi jadi anggota. Sekarang bantu kita cek pesan-pesan mencurigakan di <strong>Misi 1 (Inbox Detective)</strong>.`;
        } else {
            remark = `Kerja bagus, <strong>${pName}</strong>! Kepercayaan sekolah sekarang <strong>${meter.percentage}%</strong>. @infosmax_anon mulai kewalahan, lanjut investigasinya!`;
        }

        remarkEl.innerHTML = remark;
    }

    /**
     * Modal Registrasi ID Card Detektif (Muncul saat pertama buka)
     */
    function createIDCardModal() {
        idCardModalEl = document.createElement('div');
        idCardModalEl.className = 'modal-backdrop hidden';
        idCardModalEl.id = 'modal-idcard';
        idCardModalEl.innerHTML = `
            <div class="modal-card idcard-modal-card animate-zoom-in">
                <div class="idcard-top-strip">
                    <span>SKUAD DIGITAL OSIS // INFORMATIKA FASE E</span>
                </div>

                <div class="idcard-body">
                    <div class="idcard-photo-box">
                        <div class="idcard-photo-avatar">🎓</div>
                        <span class="idcard-role-label">ANGGOTA SKUAD</span>
                    </div>

                    <div class="idcard-form-col">
                        <h2 class="idcard-headline">Registrasi Anggota Skuad Digital</h2>
                        <p class="idcard-subtext">
                            Akun @infosmax_anon sedang menyebar hoaks di medsos sekolah! Daftarkan namamu untuk bergabung dengan Skuad Digital OSIS dan selamatkan reputasi sekolah!
                        </p>

                        <div class="idcard-input-group">
                            <label for="input-student-name">Nama Lengkap / Panggilan:</label>
                            <input type="text" id="input-student-name" class="idcard-text-input" placeholder="Contoh: Rian / Siti / Budi" maxlength="30" autocomplete="name">
                        </div>

                        <div class="idcard-meta-badges">
                            <span class="idcard-pill">Tim: <strong>Skuad Digital OSIS</strong></span>
                            <span class="idcard-pill">Kelas: <strong>Fase E SMA (Kelas X)</strong></span>
                        </div>
                    </div>
                </div>

                <div class="idcard-footer">
                    <button type="button" class="btn-action-primary" id="btn-save-idcard">
                        Gabung Skuad Digital ➔
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(idCardModalEl);

        document.getElementById('btn-save-idcard').addEventListener('click', savePlayerName);
        document.getElementById('input-student-name').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') savePlayerName();
        });
    }

    function checkPlayerRegistration() {
        if (!window.GameStorage) return;
        const currentName = window.GameStorage.getPlayerName();
        if (!currentName || currentName.trim() === '') {
            openIDCardModal();
        }
    }

    function openIDCardModal() {
        if (!idCardModalEl) return;
        const currentName = window.GameStorage ? window.GameStorage.getPlayerName() : '';
        const input = document.getElementById('input-student-name');
        if (input) input.value = currentName;
        idCardModalEl.classList.remove('hidden');
        setTimeout(() => { if (input) input.focus(); }, 100);
    }

    function savePlayerName() {
        const input = document.getElementById('input-student-name');
        if (!input) return;
        let name = input.value.trim();
        if (!name) name = 'Detektif Muda';

        if (window.GameStorage) {
            window.GameStorage.setPlayerName(name);
        }

        playSynthSound('success');
        idCardModalEl.classList.add('hidden');
        updateHUD();
        showToast(`Selamat datang di Skuad Digital OSIS, ${name}! 🎓`, 'success', 3500);
    }

    /**
     * Modal Quest Log (Log Misi & Babak Cerita)
     */
    function createQuestLogModal() {
        questLogModalEl = document.createElement('div');
        questLogModalEl.className = 'modal-backdrop hidden';
        questLogModalEl.id = 'modal-quest-log';
        questLogModalEl.innerHTML = `
            <div class="modal-card quest-log-card">
                <button type="button" class="modal-close-btn" id="btn-close-quest-log" aria-label="Tutup">✕</button>

                <div class="quest-log-header">
                    <span class="quest-book-icon">📋</span>
                    <div>
                        <div class="quest-log-tag" id="ql-chapter-badge">BABAK I • ORIENTASI</div>
                        <h2 class="quest-log-title">Log Misi &amp; Catatan Investigasi</h2>
                    </div>
                </div>

                <!-- Misi Utama & Deadline Audit -->
                <div class="quest-mission-banner">
                    <div class="mission-desc-col">
                        <span class="mission-label">MISI UTAMA:</span>
                        <p class="mission-text">
                            Pulihkan kepercayaan warga sekolah pada akun medsos & mading digital sekolah dari serangan hoaks <strong>@infosmax_anon</strong> sebelum <strong>Ulang Tahun Sekolah</strong>.
                        </p>
                    </div>
                    <div class="mission-deadline-badge" id="ql-deadline-box">
                        <span class="deadline-num" id="ql-days-left">30</span>
                        <span class="deadline-label">Hari Menuju Ultah Sekolah</span>
                    </div>
                </div>

                <!-- Reputasi Kantor -->
                <div class="quest-reputation-bar-box">
                    <div class="rep-label-row">
                        <span>Kepercayaan Sekolah: <strong id="ql-rep-pct">50%</strong></span>
                        <span id="ql-rep-status" class="rep-status-text">Sedang</span>
                    </div>
                    <div class="rep-progress-track">
                        <div class="rep-progress-fill" id="ql-rep-fill" style="width: 50%;"></div>
                    </div>
                </div>

                <!-- Checklist 8 Level & Story Clues Progresif -->
                <div class="quest-checklist-section">
                    <h3 class="checklist-title">STATUS STASIUN &amp; JEJAK KASUS</h3>
                    <div class="quest-levels-list" id="ql-levels-container">
                        <!-- Populated by JS -->
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(questLogModalEl);

        document.getElementById('btn-close-quest-log').addEventListener('click', closeQuestLogModal);
        questLogModalEl.addEventListener('click', (e) => {
            if (e.target === questLogModalEl) closeQuestLogModal();
        });
    }

    function openQuestLogModal() {
        if (!questLogModalEl || !window.GameStorage) return;
        playSynthSound('tap');

        const chapter = window.GameStorage.getStoryChapter();
        const rep = window.GameStorage.getMeterKepercayaan();
        const storageClues = window.GameStorage.getStoryClues();

        // Update Chapter & Deadline
        document.getElementById('ql-chapter-badge').textContent = chapter.title.toUpperCase();
        document.getElementById('ql-chapter-badge').style.borderColor = chapter.badgeColor;
        document.getElementById('ql-chapter-badge').style.color = chapter.badgeColor;
        document.getElementById('ql-days-left').textContent = chapter.deadlineDays;

        // Update Reputasi
        document.getElementById('ql-rep-pct').textContent = `${rep.percentage}%`;
        document.getElementById('ql-rep-status').textContent = rep.status;
        document.getElementById('ql-rep-status').style.color = rep.color;
        document.getElementById('ql-rep-fill').style.width = `${rep.percentage}%`;
        document.getElementById('ql-rep-fill').style.backgroundColor = rep.color;

        // Populate Checklist
        const container = document.getElementById('ql-levels-container');
        container.innerHTML = '';

        ALL_LEVELS_INFO.forEach((info) => {
            const isUnlocked = window.GameStorage.isLevelUnlocked(info.id);
            const isCompleted = window.GameStorage.isLevelCompleted(info.id);
            const stars = window.GameStorage.getLevelStars(info.id);

            let statusBadge = '';
            let clueContent = '';

            if (isCompleted) {
                statusBadge = `<span class="ql-status-completed">✓ SELESAI (${'★'.repeat(stars)})</span>`;
                const revealedClue = storageClues[info.id] || info.defaultClue;
                clueContent = `<div class="ql-clue-box clue-unlocked"><strong>🔍 Jejak Kasus:</strong> ${revealedClue}</div>`;
            } else if (isUnlocked) {
                statusBadge = `<span class="ql-status-active">⚡ SEDANG BERJALAN</span>`;
                clueContent = `<div class="ql-clue-box clue-active"><strong>📍 Status:</strong> Stasiun terbuka. Masuk ke lobi untuk menyelesaikan investigasi ini.</div>`;
            } else {
                statusBadge = `<span class="ql-status-locked">🔒 TERKUNCI</span>`;
                clueContent = `<div class="ql-clue-box clue-locked"><em>🔒 Selesaikan stasiun sebelumnya untuk mengungkap petunjuk kasus ini.</em></div>`;
            }

            const itemEl = document.createElement('div');
            itemEl.className = `quest-level-item ${isCompleted ? 'item-completed' : (isUnlocked ? 'item-active' : 'item-locked')}`;
            itemEl.innerHTML = `
                <div class="ql-item-header">
                    <div class="ql-item-title-group">
                        <span class="ql-item-code">${info.code}</span>
                        <strong class="ql-item-name">${info.name}</strong>
                    </div>
                    ${statusBadge}
                </div>
                <div class="ql-item-atp">${info.atp}</div>
                ${clueContent}
            `;
            container.appendChild(itemEl);
        });

        questLogModalEl.classList.remove('hidden');
    }

    function closeQuestLogModal() {
        if (questLogModalEl) {
            questLogModalEl.classList.add('hidden');
        }
    }

    /**
     * Memperbarui seluruh state HUD
     */
    function updateHUD() {
        if (!window.GameStorage) return;

        // Player Name
        const nameEl = document.getElementById('hud-player-name');
        if (nameEl) {
            const pName = window.GameStorage.getPlayerName() || 'Anggota Baru';
            nameEl.textContent = pName;
        }

        // Tier Badge
        const badgeLabel = document.getElementById('tier-badge-label');
        if (badgeLabel && window.DeviceTier) {
            const budget = window.DeviceTier.getBudget();
            badgeLabel.textContent = budget ? budget.badge : 'Tier Auto';
        }

        // Mentor Hub Remark
        updateMentorRemark();
    }

    /**
     * Modal Informasi Stasiun yang Dipilih
     */
    function createStationModal() {
        stationModalEl = document.createElement('div');
        stationModalEl.className = 'modal-backdrop hidden';
        stationModalEl.id = 'modal-station-details';
        stationModalEl.innerHTML = `
            <div class="modal-card station-modal-card">
                <button type="button" class="modal-close-btn" id="btn-close-station-modal" aria-label="Tutup">✕</button>

                <div class="station-modal-header">
                    <span class="station-big-icon" id="st-modal-icon">🚪</span>
                    <div>
                        <div class="station-modal-badge" id="st-modal-shortname">GATE 0</div>
                        <h2 class="station-modal-title" id="st-modal-title">Judul Stasiun</h2>
                    </div>
                </div>

                <div class="station-modal-body">
                    <div class="station-meta-row">
                        <span class="meta-label">Materi ATP:</span>
                        <span class="meta-value" id="st-modal-atp">-</span>
                    </div>
                    <div class="station-meta-row">
                        <span class="meta-label">Taksonomi:</span>
                        <span class="meta-value tag-bloom" id="st-modal-bloom">-</span>
                    </div>

                    <div class="station-desc-box" id="st-modal-desc">-</div>

                    <div class="station-progress-row">
                        <div class="progress-col">
                            <span class="prog-label">Status:</span>
                            <span class="prog-val" id="st-modal-status">Siap Dimainkan</span>
                        </div>
                        <div class="progress-col">
                            <span class="prog-label">Bintang:</span>
                            <span class="prog-stars" id="st-modal-stars">☆☆☆☆☆</span>
                        </div>
                        <div class="progress-col">
                            <span class="prog-label">Skor Rekor:</span>
                            <span class="prog-val" id="st-modal-score">0</span>
                        </div>
                    </div>
                </div>

                <div class="station-modal-footer" style="display: flex; gap: 0.75rem; justify-content: flex-end; align-items: center;">
                    <button type="button" class="btn-action-secondary" id="btn-modal-cancel-station" style="background: rgba(255, 255, 255, 0.08); border: 1.5px solid rgba(255, 255, 255, 0.2); color: #cbd5e1; padding: 0.75rem 1.25rem; border-radius: 0.5rem; cursor: pointer; font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem;">
                        ⬅️ Kembali
                    </button>
                    <button type="button" class="btn-action-primary" id="btn-modal-start-mission">
                        Mulai Misi ➔
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(stationModalEl);

        document.getElementById('btn-close-station-modal').addEventListener('click', closeStationModal);
        const cancelBtn = document.getElementById('btn-modal-cancel-station');
        if (cancelBtn) cancelBtn.addEventListener('click', closeStationModal);
        stationModalEl.addEventListener('click', (e) => {
            if (e.target === stationModalEl) closeStationModal();
        });
    }

    function showStationModal(stationMeta, isUnlocked, isCompleted, stars, highScore) {
        if (!stationModalEl) return;
        playSynthSound('tap');

        document.getElementById('st-modal-icon').textContent = stationMeta.icon || '📍';
        document.getElementById('st-modal-shortname').textContent = stationMeta.shortName;
        document.getElementById('st-modal-title').textContent = stationMeta.title;
        document.getElementById('st-modal-atp').textContent = stationMeta.atp;
        document.getElementById('st-modal-bloom').textContent = stationMeta.bloom;
        document.getElementById('st-modal-desc').textContent = stationMeta.desc;

        const statusEl = document.getElementById('st-modal-status');
        const starsEl = document.getElementById('st-modal-stars');
        const scoreEl = document.getElementById('st-modal-score');
        const startBtn = document.getElementById('btn-modal-start-mission');

        scoreEl.textContent = highScore || 0;

        let starsStr = '';
        const starCount = stars || 0;
        for (let i = 1; i <= 5; i++) {
            starsStr += i <= starCount ? '★' : '☆';
        }
        starsEl.textContent = starsStr;

        if (isUnlocked) {
            statusEl.innerHTML = isCompleted ? '<span class="text-success">✓ Selesai</span>' : '<span class="text-primary">Terbuka</span>';
            startBtn.disabled = false;
            startBtn.textContent = isCompleted ? 'Main Lagi ➔' : 'Mulai Misi ➔';
            startBtn.className = 'btn-action-primary';
        } else {
            statusEl.innerHTML = '<span class="text-danger">🔒 Terkunci</span>';
            startBtn.disabled = true;
            startBtn.textContent = '🔒 Selesaikan Level Sebelumnya';
            startBtn.className = 'btn-action-disabled';
        }

        startBtn.onclick = () => {
            if (!isUnlocked) return;
            playSynthSound('tap');
            closeStationModal();
            if (onStartMissionCb) {
                onStartMissionCb(stationMeta.id);
            }
        };

        stationModalEl.classList.remove('hidden');
    }

    function closeStationModal() {
        if (stationModalEl) {
            stationModalEl.classList.add('hidden');
        }
    }

    /**
     * Modal Pengaturan Global
     */
    function createSettingsModal() {
        settingsModalEl = document.createElement('div');
        settingsModalEl.className = 'modal-backdrop hidden';
        settingsModalEl.id = 'modal-settings';
        settingsModalEl.innerHTML = `
            <div class="modal-card settings-modal-card">
                <button type="button" class="modal-close-btn" id="btn-close-settings" aria-label="Tutup">✕</button>

                <div class="settings-modal-header">
                    <span class="settings-gear-icon">⚙️</span>
                    <div>
                        <h2 class="settings-modal-title">Pengaturan Game</h2>
                        <p class="settings-modal-sub">Optimasi performa &amp; kenyamanan belajar</p>
                    </div>
                </div>

                <div class="settings-modal-body">
                    <!-- Mode Ringan (Prioritas HP Kentang) -->
                    <div class="setting-toggle-item highlight-mode-ringan">
                        <div class="setting-text-col">
                            <strong>⚡ Mode Ringan (HP Kentang)</strong>
                            <p>Matikan shadow, antialias, dan batasi resolusi untuk ponsel Android RAM 2-3GB.</p>
                        </div>
                        <label class="switch-toggle">
                            <input type="checkbox" id="toggle-mode-ringan">
                            <span class="slider-round"></span>
                        </label>
                    </div>

                    <!-- Pilihan Manual Tier Grafis -->
                    <div class="setting-row">
                        <label for="select-device-tier" class="setting-label">Kualitas Grafis 3D:</label>
                        <select id="select-device-tier" class="setting-select">
                            <option value="low">Tier Low (Hemat Daya &amp; Kentang)</option>
                            <option value="medium">Tier Medium (Standar Mobile)</option>
                            <option value="high">Tier High (Laptop / PC HD)</option>
                        </select>
                    </div>

                    <!-- Suara & Efek -->
                    <div class="setting-toggle-item">
                        <div class="setting-text-col">
                            <strong>🔊 Efek Suara Audio</strong>
                            <p>Suara klik, chime skor, dan efek stempel.</p>
                        </div>
                        <label class="switch-toggle">
                            <input type="checkbox" id="toggle-sound-enabled">
                            <span class="slider-round"></span>
                        </label>
                    </div>

                    <!-- Timer Misi -->
                    <div class="setting-toggle-item">
                        <div class="setting-text-col">
                            <strong>⏱️ Tampilkan Timer Misi</strong>
                            <p>Hitung waktu pengerjaan untuk evaluasi kecepatan berpikir.</p>
                        </div>
                        <label class="switch-toggle">
                            <input type="checkbox" id="toggle-timer-enabled">
                            <span class="slider-round"></span>
                        </label>
                    </div>

                    <!-- Reset Progres -->
                    <div class="setting-danger-zone">
                        <div>
                            <strong>Reset Seluruh Progres</strong>
                            <p class="text-muted">Kembalikan semua stasiun ke status awal terkunci.</p>
                        </div>
                        <button type="button" class="btn-danger-sm" id="btn-reset-progress">Reset Progres</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(settingsModalEl);

        document.getElementById('btn-close-settings').addEventListener('click', closeSettingsModal);
        settingsModalEl.addEventListener('click', (e) => {
            if (e.target === settingsModalEl) closeSettingsModal();
        });

        // Mode Ringan Toggle
        const toggleRingan = document.getElementById('toggle-mode-ringan');
        toggleRingan.addEventListener('change', (e) => {
            if (!window.DeviceTier) return;
            window.DeviceTier.setModeRingan(e.target.checked);
            updateHUD();
            showToast(e.target.checked ? 'Mode Ringan Diaktifkan (Tier Low)' : 'Mode Ringan Dimatikan', 'success', 2200);
            document.getElementById('select-device-tier').value = window.DeviceTier.getTier();
        });

        // Manual Tier Select
        const selectTier = document.getElementById('select-device-tier');
        selectTier.addEventListener('change', (e) => {
            if (!window.DeviceTier) return;
            window.DeviceTier.setTier(e.target.value, true);
            updateHUD();
            showToast(`Grafis diatur ke ${e.target.value.toUpperCase()}`, 'info', 2000);
        });

        // Sound Toggle
        const toggleSound = document.getElementById('toggle-sound-enabled');
        toggleSound.addEventListener('change', (e) => {
            if (!window.GameStorage) return;
            window.GameStorage.updateSettings({ soundEnabled: e.target.checked });
            const soundIcon = document.getElementById('sound-icon');
            if (soundIcon) soundIcon.textContent = e.target.checked ? '🔊' : '🔇';
        });

        // Timer Toggle
        const toggleTimer = document.getElementById('toggle-timer-enabled');
        toggleTimer.addEventListener('change', (e) => {
            if (!window.GameStorage) return;
            window.GameStorage.updateSettings({ timerEnabled: e.target.checked });
        });

        // Reset Progress Button
        document.getElementById('btn-reset-progress').addEventListener('click', () => {
            if (confirm('Apakah Anda yakin ingin mengulang semua progres level dari awal?')) {
                if (window.GameStorage) {
                    window.GameStorage.resetProgress();
                }
                if (window.HubScene) {
                    window.HubScene.refreshStationStates();
                }
                closeSettingsModal();
                updateHUD();
                showToast('Progres berhasil direset ke awal.', 'info', 2500);
            }
        });
    }

    function openSettingsModal() {
        if (!settingsModalEl) return;
        playSynthSound('tap');

        const storage = window.GameStorage;
        const tier = window.DeviceTier;

        if (tier) {
            document.getElementById('toggle-mode-ringan').checked = tier.isModeRingan();
            document.getElementById('select-device-tier').value = tier.getTier();
        }

        if (storage) {
            const s = storage.getSettings();
            document.getElementById('toggle-sound-enabled').checked = s.soundEnabled;
            document.getElementById('toggle-timer-enabled').checked = s.timerEnabled;
        }

        settingsModalEl.classList.remove('hidden');
    }

    function closeSettingsModal() {
        if (settingsModalEl) {
            settingsModalEl.classList.add('hidden');
        }
    }

    /**
     * Toast Notifications Stack
     */
    function createToastContainer() {
        toastContainerEl = document.createElement('div');
        toastContainerEl.className = 'toast-stack-container';
        document.body.appendChild(toastContainerEl);
    }

    function showToast(message, type = 'info', duration = 3000) {
        if (!toastContainerEl) createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast-pill toast-${type} animate-slide-down`;

        let icon = 'ℹ️';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '⚠️';

        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span class="toast-msg">${message}</span>`;
        toastContainerEl.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, duration);
    }

    // ==========================================
    // EXPORT API
    // ==========================================
    const UI = {
        init: function (onStartMission) {
            initUI(onStartMission);
        },

        showStationModal: function (stationMeta, isUnlocked, isCompleted, stars, highScore) {
            showStationModal(stationMeta, isUnlocked, isCompleted, stars, highScore);
        },

        closeStationModal: function () {
            closeStationModal();
        },

        openSettings: function () {
            openSettingsModal();
        },

        openQuestLog: function () {
            openQuestLogModal();
        },

        openIDCard: function () {
            openIDCardModal();
        },

        showToast: function (msg, type, dur) {
            showToast(msg, type, dur);
        },

        playSynth: function (type) {
            playSynthSound(type);
        },

        updateHUD: function () {
            updateHUD();
        },

        setTheme: function (theme) {
            setTheme(theme, true);
        },

        toggleTheme: function () {
            toggleTheme();
        }
    };

    window.GameUI = UI;
})();
