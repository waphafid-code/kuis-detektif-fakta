/**
 * ============================================================
 * 🚀 MAIN BOOTSTRAP & DYNAMIC ROUTER (main.js)
 * ============================================================
 * Mengorkestrasi deteksi hardware, Hub 3D, lazy-loading level,
 * dan manajemen siklus hidup memori (disposal & pause/resume).
 * ============================================================
 */

(function () {
    'use strict';

    let currentActiveLevel = null;
    let hubContainerEl = null;
    let levelContainerEl = null;

    /**
     * Memulai Aplikasi saat DOM Siap
     */
    async function bootstrap() {
        console.log('🚀 Bootstrapping Kantor Data Digital (Hub 3D)...');

        hubContainerEl = document.getElementById('hub-canvas-container');
        levelContainerEl = document.getElementById('level-stage-container');

        const hideLoader = () => {
            const appLoader = document.getElementById('app-preloader');
            if (appLoader) {
                appLoader.classList.add('fade-out');
                setTimeout(() => {
                    if (appLoader && appLoader.parentNode) {
                        appLoader.parentNode.removeChild(appLoader);
                    }
                }, 300);
            }
        };

        // JAMINAN MUTLAK: Preloader PASTI hilang dalam maksimal 800ms apapun yang terjadi
        const fallbackTimer = setTimeout(hideLoader, 800);

        try {
            // 1. Deteksi Kualitas Perangkat (Tier Low/Med/High)
            if (window.DeviceTier) {
                try {
                    const budget = await Promise.race([
                        window.DeviceTier.init(),
                        new Promise(r => setTimeout(() => r(window.DeviceTier.getBudget()), 400))
                    ]);
                    if (budget) {
                        console.log(`📱 Perangkat terdeteksi: ${budget.badge} (Max Tris: ${budget.maxTriangles}, Shadows: ${budget.shadows})`);
                    }
                } catch (errTier) {
                    console.warn('DeviceTier init warning:', errTier);
                }
            }

            // 2. Inisialisasi UI Overlay Global
            if (window.GameUI) {
                try {
                    window.GameUI.init((stationId) => {
                        startStationLevel(stationId);
                    });
                } catch (errUI) {
                    console.warn('GameUI init warning:', errUI);
                }
            }

            // 3. Bangun Scene Lobi 3D Low-Poly
            if (window.HubScene && hubContainerEl && typeof THREE !== 'undefined') {
                try {
                    const budget = window.DeviceTier ? window.DeviceTier.getBudget() : null;
                    window.HubScene.init(hubContainerEl, budget, (stationId, stationData) => {
                        handleStationClicked(stationId, stationData);
                    });
                } catch (errHub) {
                    console.warn('HubScene 3D init warning:', errHub);
                }
            }
        } catch (globalErr) {
            console.error('Bootstrap error:', globalErr);
        } finally {
            clearTimeout(fallbackTimer);
            hideLoader();
        }
    }

    /**
     * Saat stasiun di-tap pada 3D viewport
     */
    function handleStationClicked(stationId, stationData) {
        const storage = window.GameStorage;
        const isUnlocked = storage ? storage.isLevelUnlocked(stationId) : (stationId === 0);
        const isCompleted = storage ? storage.isLevelCompleted(stationId) : false;
        const stars = storage ? storage.getLevelStars(stationId) : 0;
        const progress = storage ? storage.getProgress() : null;
        const highScore = (progress && progress.highScores) ? (progress.highScores[stationId] || 0) : 0;

        if (window.GameUI) {
            window.GameUI.showStationModal(
                stationData.meta,
                isUnlocked,
                isCompleted,
                stars,
                highScore
            );
        }
    }

    /**
     * Mulai misi level dari stasiun yang dipilih
     */
    function startStationLevel(stationId) {
        const id = Number(stationId);

        // Validasi gembok
        if (window.GameStorage && !window.GameStorage.isLevelUnlocked(id)) {
            if (window.GameUI) {
                window.GameUI.showToast('🔒 Level ini masih terkunci! Selesaikan level prasyarat terlebih dahulu.', 'error', 3000);
                window.GameUI.playSynth('error');
            }
            return;
        }

        if (stationId === 0 || stationId === '0') {
            mountLevel0();
        } else if (stationId === 1 || stationId === '1') {
            mountLevel1();
        } else if (stationId === 2 || stationId === '2') {
            mountLevel2();
        } else if (stationId === 3 || stationId === '3') {
            mountLevel3();
        } else if (stationId === 4 || stationId === '4') {
            mountLevel4();
        } else if (stationId === 5 || stationId === '5') {
            mountLevel5();
        } else if (stationId === 6 || stationId === '6') {
            mountLevel6();
        } else if (stationId === 7 || stationId === '7') {
            mountLevel7();
        } else if (stationId === 'labtik') {
            mountLabTIK();
        } else {
            if (window.GameUI) {
                window.GameUI.showToast(`Stasiun Level ${id} siap dimainkan!`, 'info', 3000);
            }
        }
    }

    /**
     * Mount Level 0: Onboarding Quiz (Gate Wajib)
     */
    function mountLevel0() {
        if (!window.Level0Onboarding || !levelContainerEl) {
            console.error('Modul Level 0 tidak ditemukan!');
            return;
        }

        // 1. Pause Hub 3D
        if (window.HubScene) window.HubScene.pause();

        // 2. Tampilkan Container Level
        levelContainerEl.classList.remove('hidden');
        levelContainerEl.innerHTML = '';
        currentActiveLevel = window.Level0Onboarding;

        // 3. Mount Level 0
        window.Level0Onboarding.init(
            levelContainerEl,
            // onComplete callback
            (result) => {
                console.log('✅ Level 0 Selesai dengan hasil:', result);
                if (window.GameStorage) {
                    window.GameStorage.completeLevel(0, result.score, result.stars, result.storyClue);
                }
                if (window.GameUI) {
                    window.GameUI.showToast('🎉 Selamat! Lisensi Detektif Terbit. Stasiun Level 1 kini TERBUKA!', 'success', 4000);
                    window.GameUI.playSynth('success');
                }
                unmountCurrentLevel();
            },
            // onExit callback
            () => {
                unmountCurrentLevel();
            }
        );
    }

    /**
     * Mount Level 1: Inbox Detective (C3 Menerapkan)
     */
    function mountLevel1() {
        if (!window.Level1Detective || !levelContainerEl) {
            console.error('Modul Level 1 tidak ditemukan!');
            return;
        }

        // 1. Pause Hub 3D
        if (window.HubScene) window.HubScene.pause();

        // 2. Tampilkan Container Level
        levelContainerEl.classList.remove('hidden');
        levelContainerEl.innerHTML = '';
        currentActiveLevel = window.Level1Detective;

        // 3. Mount Level 1
        window.Level1Detective.init(
            levelContainerEl,
            // onComplete callback
            (result) => {
                console.log('✅ Level 1 Selesai dengan hasil:', result);
                if (window.GameStorage) {
                    window.GameStorage.completeLevel(1, result.score, result.stars, result.storyClue);
                }
                if (window.GameUI) {
                    window.GameUI.showToast(`⭐ Misi Tuntas! Anda memperoleh ${result.stars} Bintang dengan akurasi ${result.accuracy}%!`, 'success', 4500);
                    window.GameUI.playSynth('success');
                }
                unmountCurrentLevel();
            },
            // onExit callback
            () => {
                unmountCurrentLevel();
            }
        );
    }

    /**
     * Mount Level 2: Ruang Arsip OSIS (Warehouse Sorter)
     */
    function mountLevel2() {
        if (!window.Level2WarehouseSorter || !levelContainerEl) {
            console.error('Modul Level 2 tidak ditemukan!');
            return;
        }

        // 1. Pause Hub 3D
        if (window.HubScene) window.HubScene.pause();

        // 2. Tampilkan Container Level
        levelContainerEl.classList.remove('hidden');
        levelContainerEl.innerHTML = '';
        currentActiveLevel = window.Level2WarehouseSorter;

        // 3. Mount Level 2
        window.Level2WarehouseSorter.init(
            levelContainerEl,
            // onComplete callback
            (result) => {
                console.log('✅ Level 2 Selesai dengan hasil:', result);
                if (window.GameStorage) {
                    window.GameStorage.completeLevel(2, result.score, result.stars, result.storyClue);
                }
                if (window.GameUI) {
                    window.GameUI.showToast(`⭐ Misi Arsip Tuntas! Memperoleh ${result.stars} Bintang dengan akurasi ${result.accuracy}%!`, 'success', 4500);
                    window.GameUI.playSynth('success');
                }
                unmountCurrentLevel();
            },
            // onExit callback
            () => {
                unmountCurrentLevel();
            }
        );
    }

    /**
     * Mount Level 3: Lomba Algoritma
     */
    function mountLevel3() {
        if (!window.Level3AlgorithmRace || !levelContainerEl) {
            console.error('Modul Level 3 tidak ditemukan!');
            return;
        }
        if (window.HubScene) window.HubScene.pause();
        levelContainerEl.classList.remove('hidden');
        levelContainerEl.innerHTML = '';
        currentActiveLevel = window.Level3AlgorithmRace;
        window.Level3AlgorithmRace.init(
            levelContainerEl,
            () => { unmountCurrentLevel(); },
            () => { unmountCurrentLevel(); }
        );
    }

    /**
     * Mount Level 4: Dekomposisi Proker
     */
    function mountLevel4() {
        if (!window.Level4Decomposition || !levelContainerEl) {
            console.error('Modul Level 4 tidak ditemukan!');
            return;
        }
        if (window.HubScene) window.HubScene.pause();
        levelContainerEl.classList.remove('hidden');
        levelContainerEl.innerHTML = '';
        currentActiveLevel = window.Level4Decomposition;
        window.Level4Decomposition.init(
            levelContainerEl,
            () => { unmountCurrentLevel(); },
            () => { unmountCurrentLevel(); }
        );
    }

    /**
     * Mount Level 5: Robo-Asisten OSIS
     */
    function mountLevel5() {
        if (!window.Level5RoboAssistant || !levelContainerEl) {
            console.error('Modul Level 5 tidak ditemukan!');
            return;
        }
        if (window.HubScene) window.HubScene.pause();
        levelContainerEl.classList.remove('hidden');
        levelContainerEl.innerHTML = '';
        currentActiveLevel = window.Level5RoboAssistant;
        window.Level5RoboAssistant.init(
            levelContainerEl,
            () => { unmountCurrentLevel(); },
            () => { unmountCurrentLevel(); }
        );
    }

    /**
     * Mount Level 6: Lab Komputer Sekolah
     */
    function mountLevel6() {
        if (!window.Level6ComputerLab || !levelContainerEl) {
            console.error('Modul Level 6 tidak ditemukan!');
            return;
        }
        if (window.HubScene) window.HubScene.pause();
        levelContainerEl.classList.remove('hidden');
        levelContainerEl.innerHTML = '';
        currentActiveLevel = window.Level6ComputerLab;
        window.Level6ComputerLab.init(
            levelContainerEl,
            () => { unmountCurrentLevel(); },
            () => { unmountCurrentLevel(); }
        );
    }

    /**
     * Mount Level 7: Presentasi ke Kepsek
     */
    function mountLevel7() {
        if (!window.Level7GrandPresentation || !levelContainerEl) {
            console.error('Modul Level 7 tidak ditemukan!');
            return;
        }
        if (window.HubScene) window.HubScene.pause();
        levelContainerEl.classList.remove('hidden');
        levelContainerEl.innerHTML = '';
        currentActiveLevel = window.Level7GrandPresentation;
        window.Level7GrandPresentation.init(
            levelContainerEl,
            () => { unmountCurrentLevel(); },
            () => { unmountCurrentLevel(); }
        );
    }

    /**
     * Mount Lab TIK: Web Browser & Search Engine
     */
    function mountLabTIK() {
        if (!window.LabTIK_SearchEngine || !levelContainerEl) {
            console.error('Modul Lab TIK tidak ditemukan!');
            return;
        }

        // 1. Pause Hub 3D
        if (window.HubScene) window.HubScene.pause();

        // 2. Tampilkan Container Level
        levelContainerEl.classList.remove('hidden');
        levelContainerEl.innerHTML = '';
        currentActiveLevel = window.LabTIK_SearchEngine;

        // 3. Mount Lab TIK
        window.LabTIK_SearchEngine.init(
            levelContainerEl,
            // onComplete callback
            (result) => {
                console.log('✅ Lab TIK Selesai dengan skor:', result.score);
                if (window.GameStorage) {
                    window.GameStorage.completeLevel('labtik', result.score, 3, "Paham cara kerja search engine");
                    window.GameStorage.updateMeterKepercayaan(8);
                }
                if (window.GameUI) {
                    window.GameUI.showToast(`⭐ Misi Pencarian Selesai! Skor: ${result.score}/100 (+8% Kepercayaan Sekolah)`, 'success', 4500);
                    window.GameUI.playSynth('success');
                }
                unmountCurrentLevel();
            },
            // onExit callback
            () => {
                unmountCurrentLevel();
            }
        );
    }

    /**
     * Unmount level aktif dan kembali ke Hub 3D (Clean disposal)
     */
    function unmountCurrentLevel() {
        if (currentActiveLevel && typeof currentActiveLevel.dispose === 'function') {
            currentActiveLevel.dispose();
            currentActiveLevel = null;
        }

        if (levelContainerEl) {
            levelContainerEl.innerHTML = '';
            levelContainerEl.classList.add('hidden');
        }

        // Resume Hub 3D, perbarui HUD, dan segarkan status gembok stasiun
        if (window.GameUI) {
            window.GameUI.updateHUD();
        }

        if (window.HubScene) {
            window.HubScene.resume();
        }
    }

    // Tunggu event DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
