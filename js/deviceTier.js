/**
 * ============================================================
 * 📱 DEVICE TIER DETECTOR & QUALITY BUDGET MANAGER
 * ============================================================
 * Mengoptimalkan game 3D untuk ponsel low-end (Android RAM 2-3GB)
 * Target: Tetap playable (>= 30 FPS) di layar kecil & GPU kentang
 * ============================================================
 */

(function () {
    'use strict';

    const STORAGE_KEY_TIER_OVERRIDE = 'skuad_tier_override';
    const STORAGE_KEY_MODE_RINGAN = 'skuad_mode_ringan';

    // 🎯 BUDGET PER TIER
    const QUALITY_BUDGETS = {
        low: {
            tier: 'low',
            label: 'Mode Ringan (HP Kentang)',
            badge: 'Tier Low ⚡',
            maxTriangles: 8000,
            maxTextureSize: 256,
            shadows: false, // 0 Real-time Shadow, gunakan fake contact shadow ellipse
            fakeShadows: true,
            pixelRatio: 1.0, // Kunci ke 1.0, abaikan DPR tinggi
            antialias: false,
            fog: false,
            envMap: false,
            postProcessing: false,
            instancingThreshold: 3,
            targetFPS: 30
        },
        medium: {
            tier: 'medium',
            label: 'Standar (HP Menengah)',
            badge: 'Tier Med ⚖️',
            maxTriangles: 20000,
            maxTextureSize: 512,
            shadows: true, // 1 simple directional light shadow
            fakeShadows: false,
            pixelRatio: Math.min(window.devicePixelRatio || 1.0, 1.5),
            antialias: true,
            fog: false,
            envMap: false,
            postProcessing: false,
            instancingThreshold: 4,
            targetFPS: 45
        },
        high: {
            tier: 'high',
            label: 'Ultra HD (Laptop / PC)',
            badge: 'Tier High 🚀',
            maxTriangles: 50000,
            maxTextureSize: 1024,
            shadows: true,
            fakeShadows: false,
            pixelRatio: Math.min(window.devicePixelRatio || 1.0, 2.0),
            antialias: true,
            fog: false,
            envMap: false,
            postProcessing: false,
            instancingThreshold: 5,
            targetFPS: 60
        }
    };

    /**
     * Jalankan quick micro-benchmark render 5 frame uji
     */
    function runMicroBenchmark() {
        return new Promise((resolve) => {
            try {
                const testCanvas = document.createElement('canvas');
                testCanvas.width = 64;
                testCanvas.height = 64;
                const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
                if (!gl) {
                    resolve({ score: 0, isLow: true });
                    return;
                }

                const startTime = performance.now();
                for (let i = 0; i < 5; i++) {
                    gl.clearColor(0.1 * i, 0.2, 0.3, 1.0);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.finish();
                }
                const duration = performance.now() - startTime;
                // Jika 5 frame kecil butuh > 20ms, GPU sangat lambat
                resolve({
                    durationMs: duration,
                    isLow: duration > 20
                });
            } catch (e) {
                resolve({ score: 0, isLow: true });
            }
        });
    }

    /**
     * Deteksi tier perangkat otomatis
     */
    async function detectTier() {
        // 1. Cek manual override jika siswa/guru mengaktifkan Mode Ringan
        const modeRingan = localStorage.getItem(STORAGE_KEY_MODE_RINGAN) === 'true';
        if (modeRingan) {
            return 'low';
        }

        const manualOverride = localStorage.getItem(STORAGE_KEY_TIER_OVERRIDE);
        if (manualOverride && QUALITY_BUDGETS[manualOverride]) {
            return manualOverride;
        }

        // 2. Hardware API inspection
        const memory = navigator.deviceMemory; // in GB (Chrome only)
        const cores = navigator.hardwareConcurrency || 2;
        const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
        const screenWidth = Math.min(window.screen.width, window.screen.height);

        // Jika RAM <= 3GB atau core <= 4 di ponsel layar kecil -> otomatis Tier Low
        if (isMobile) {
            if (memory !== undefined && memory <= 3) return 'low';
            if (cores <= 4 && screenWidth <= 420) return 'low';
        }

        // 3. Jalankan micro-benchmark
        const bench = await runMicroBenchmark();
        if (bench.isLow) {
            return 'low';
        }

        // 4. Klasifikasi default
        if (!isMobile && screenWidth >= 1024) {
            return 'high';
        } else if (memory && memory >= 6 && cores >= 6) {
            return 'medium';
        } else {
            return isMobile ? 'low' : 'medium';
        }
    }

    // API Object
    const DeviceTier = {
        currentTier: 'low',
        currentBudget: QUALITY_BUDGETS.low,

        init: async function () {
            const detected = await detectTier();
            this.setTier(detected);
            return this.currentBudget;
        },

        getTier: function () {
            return this.currentTier;
        },

        getBudget: function () {
            return this.currentBudget;
        },

        setTier: function (tierName, persist = false) {
            const budget = QUALITY_BUDGETS[tierName] || QUALITY_BUDGETS.low;
            this.currentTier = budget.tier;
            this.currentBudget = budget;

            if (persist) {
                localStorage.setItem(STORAGE_KEY_TIER_OVERRIDE, budget.tier);
            }
            return budget;
        },

        setModeRingan: function (active) {
            localStorage.setItem(STORAGE_KEY_MODE_RINGAN, active ? 'true' : 'false');
            if (active) {
                this.setTier('low', false);
            } else {
                localStorage.removeItem(STORAGE_KEY_TIER_OVERRIDE);
            }
            return this.getBudget();
        },

        isModeRingan: function () {
            return localStorage.getItem(STORAGE_KEY_MODE_RINGAN) === 'true' || this.currentTier === 'low';
        },

        getBudgets: function () {
            return QUALITY_BUDGETS;
        }
    };

    window.DeviceTier = DeviceTier;
})();
