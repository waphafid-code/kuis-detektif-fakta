/**
 * ============================================================
 * 💾 GAME STORAGE & PROGRESS MANAGER (SKUAD DIGITAL OSIS)
 * ============================================================
 * Mengelola identitas anggota, progres level, meter kepercayaan
 * sekolah, babak cerita, quest log, skor, bintang, pengaturan.
 * ============================================================
 */

(function () {
    'use strict';

    const PROGRESS_KEY = 'skuad_osis_progress_v2';
    const SETTINGS_KEY = 'skuad_osis_settings_v2';
    const OLD_PROGRESS_KEY = 'kantor_data_progress_v1';
    const OLD_SETTINGS_KEY = 'kantor_data_settings_v1';

    const DEFAULT_PROGRESS = {
        playerName: '',
        playerRole: 'Anggota Skuad Digital OSIS',
        unlockedLevels: [0],
        completedLevels: {},
        highScores: {},
        stars: {},
        storyClues: {},
        meterKepercayaanSekolah: 50, // 0-100, default 50
        reflectionData: {} // Data pemahaman dari refleksi singkat per level
    };

    const DEFAULT_SETTINGS = {
        timerEnabled: true,
        soundEnabled: true,
        soundVolume: 0.8,
        modeRingan: false,
        modeSentuhMudah: false // Fallback: tap-to-select, tap-to-confirm
    };

    /**
     * Migrasi otomatis dari versi lama (Kantor Data Digital)
     */
    function migrateFromV1() {
        try {
            const oldRaw = localStorage.getItem(OLD_PROGRESS_KEY);
            if (!oldRaw) return null;

            const oldData = JSON.parse(oldRaw);
            // Migrasi field-field yang kompatibel
            const migrated = {
                ...DEFAULT_PROGRESS,
                playerName: oldData.playerName || '',
                unlockedLevels: oldData.unlockedLevels || [0],
                completedLevels: oldData.completedLevels || {},
                highScores: oldData.highScores || {},
                stars: oldData.stars || {},
                storyClues: oldData.storyClues || {},
                meterKepercayaanSekolah: 50
            };

            // Simpan ke key baru dan hapus key lama
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(migrated));
            localStorage.removeItem(OLD_PROGRESS_KEY);
            localStorage.removeItem(OLD_SETTINGS_KEY);

            console.log('📦 Migrasi progres dari v1 (Kantor Data Digital) → v2 (Skuad Digital OSIS) berhasil!');
            return migrated;
        } catch (e) {
            console.warn('Gagal migrasi dari v1:', e);
            return null;
        }
    }

    function loadProgress() {
        try {
            const raw = localStorage.getItem(PROGRESS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return { ...DEFAULT_PROGRESS, ...parsed };
            }
            // Coba migrasi dari v1
            const migrated = migrateFromV1();
            if (migrated) return migrated;
        } catch (e) {
            console.warn('Gagal memuat progres:', e);
        }
        return { ...DEFAULT_PROGRESS };
    }

    function saveProgress(data) {
        try {
            localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('Gagal menyimpan progres:', e);
        }
    }

    function loadSettings() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                return { ...DEFAULT_SETTINGS, ...parsed };
            }
        } catch (e) {
            console.warn('Gagal memuat pengaturan:', e);
        }
        return { ...DEFAULT_SETTINGS };
    }

    function saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('Gagal menyimpan pengaturan:', e);
        }
    }

    const GameStorage = {
        getProgress: function () {
            return loadProgress();
        },

        getPlayerName: function () {
            const p = loadProgress();
            return p.playerName || '';
        },

        setPlayerName: function (name) {
            const p = loadProgress();
            p.playerName = (name || '').trim();
            saveProgress(p);
            return p.playerName;
        },

        isLevelUnlocked: function (levelId) {
            const p = loadProgress();
            // Support both numeric and string IDs
            return p.unlockedLevels.includes(Number(levelId)) || p.unlockedLevels.includes(String(levelId));
        },

        isLevelCompleted: function (levelId) {
            const p = loadProgress();
            return !!p.completedLevels[levelId];
        },

        getLevelStars: function (levelId) {
            const p = loadProgress();
            return p.stars[levelId] || 0;
        },

        completeLevel: function (levelId, score, stars, storyClue) {
            const p = loadProgress();

            p.completedLevels[levelId] = true;
            p.highScores[levelId] = Math.max(p.highScores[levelId] || 0, score || 0);
            p.stars[levelId] = Math.max(p.stars[levelId] || 0, stars || 1);

            if (storyClue) {
                if (!p.storyClues) p.storyClues = {};
                p.storyClues[levelId] = storyClue;
            }

            // Buka level berikutnya (hanya untuk numeric ID)
            const numId = Number(levelId);
            if (!isNaN(numId)) {
                const nextLevelId = numId + 1;
                if (nextLevelId <= 7 && !p.unlockedLevels.includes(nextLevelId)) {
                    p.unlockedLevels.push(nextLevelId);
                }
            }

            saveProgress(p);
            return p;
        },

        unlockLevel: function (levelId) {
            const p = loadProgress();
            const id = Number(levelId);
            if (!p.unlockedLevels.includes(id)) {
                p.unlockedLevels.push(id);
                saveProgress(p);
            }
            return p;
        },

        getStoryClues: function () {
            const p = loadProgress();
            return p.storyClues || {};
        },

        // === METER KEPERCAYAAN SEKOLAH (Lintas-Modul) ===

        getMeterKepercayaan: function () {
            const p = loadProgress();
            const meter = p.meterKepercayaanSekolah || 50;
            const clamped = Math.max(0, Math.min(100, meter));

            let status = 'Waspada (Reputasi Kurang Baik)';
            let color = '#f43f5e'; // Rose

            if (clamped >= 70) {
                status = 'Terpercaya (Warga Sekolah Percaya)';
                color = '#10b981'; // Emerald
            } else if (clamped >= 40) {
                status = 'Sedang (Masih Perlu Pembuktian)';
                color = '#f59e0b'; // Amber
            }

            return {
                percentage: clamped,
                status: status,
                color: color
            };
        },

        updateMeterKepercayaan: function (delta) {
            const p = loadProgress();
            p.meterKepercayaanSekolah = Math.max(0, Math.min(100, (p.meterKepercayaanSekolah || 50) + delta));
            saveProgress(p);
            return p.meterKepercayaanSekolah;
        },

        // === DATA REFLEKSI SINGKAT ===

        saveReflection: function (levelId, itemId, reasoning) {
            const p = loadProgress();
            if (!p.reflectionData) p.reflectionData = {};
            if (!p.reflectionData[levelId]) p.reflectionData[levelId] = {};
            p.reflectionData[levelId][itemId] = reasoning;
            saveProgress(p);
        },

        getReflections: function (levelId) {
            const p = loadProgress();
            return (p.reflectionData && p.reflectionData[levelId]) || {};
        },

        // === BABAK CERITA ===

        getStoryChapter: function () {
            const p = loadProgress();
            const maxUnlocked = Math.max(...(p.unlockedLevels || [0]).map(Number).filter(n => !isNaN(n)));

            if (maxUnlocked <= 2) {
                return {
                    chapterNumber: 1,
                    title: 'Babak I: Orientasi Skuad Digital',
                    desc: 'Kamu baru bergabung ke Skuad Digital OSIS. Akun @infosmax_anon mulai menyebar info palsu. Ulang Tahun Sekolah masih 30 hari lagi.',
                    deadlineDays: 30,
                    urgency: 'Rendah — Waktu Pelatihan',
                    badgeColor: '#38bdf8'
                };
            } else if (maxUnlocked <= 5) {
                return {
                    chapterNumber: 2,
                    title: 'Babak II: Investigasi Akun Anonim',
                    desc: 'Pola @infosmax_anon mulai terkuak! Urgensi meningkat, hari-H Ulang Tahun Sekolah kian dekat.',
                    deadlineDays: 14,
                    urgency: 'Tinggi — Ancaman Nyata',
                    badgeColor: '#f59e0b'
                };
            } else {
                return {
                    chapterNumber: 3,
                    title: 'Babak III: Klimaks & Presentasi',
                    desc: 'Ulang Tahun Sekolah di depan mata! Presentasikan bukti ke Kepala Sekolah dan selamatkan reputasi OSIS.',
                    deadlineDays: 2,
                    urgency: 'KRITIS — Hari-H!',
                    badgeColor: '#f43f5e'
                };
            }
        },

        resetProgress: function () {
            const p = loadProgress();
            const currentName = p.playerName;
            const fresh = { ...DEFAULT_PROGRESS, playerName: currentName };
            saveProgress(fresh);
            return fresh;
        },

        getSettings: function () {
            return loadSettings();
        },

        updateSettings: function (partial) {
            const s = loadSettings();
            const updated = { ...s, ...partial };
            saveSettings(updated);
            return updated;
        }
    };

    window.GameStorage = GameStorage;
})();
