/**
 * ============================================================
 * 🚀 3D LEVEL MISSIONS 3 TO 7 (FULL 3D IMPLEMENTATION)
 * ============================================================
 * Level 3: Lomba Algoritma (3D Binary Search & Sorting Arena)
 * Level 4: Dekomposisi Proker (3D Computational Thinking Hub)
 * Level 5: Robo-Asisten OSIS (3D Robot Workshop & IPO Logic)
 * Level 6: Lab Komputer Sekolah (3D OS Console & Process Bay)
 * Level 7: Presentasi ke Kepsek (3D Grand Council Hall)
 * ============================================================
 */

(function () {
    'use strict';

    function getPlayerName() {
        return (window.GameStorage && window.GameStorage.getPlayerName()) || 'Detektif Muda';
    }

    function getDeviceBudget() {
        return (window.DeviceTier && window.DeviceTier.getBudget()) || {
            tier: 'low', shadows: false, pixelRatio: 1.0, antialias: false
        };
    }

    // ============================================================
    // ⚡ LEVEL 3: 3D LOMBA ALGORITMA (BINARY SEARCH & SORTING)
    // ============================================================
    const Level3AlgorithmRace = {
        init: function (container, onComplete, onExit) {
            let activeContainer = container;
            let sceneSetup = null;
            let animId = null;
            let score = 0;
            let currentPhase = 'binary_search'; // binary_search, sorting, done
            let particleSystems = [];

            // Binary Search Game Data
            const sortedArray = [12, 19, 25, 34, 48, 55, 67, 78, 89, 94];
            let targetIdx = 6; // 67
            let targetVal = sortedArray[targetIdx];
            let low = 0;
            let high = sortedArray.length - 1;
            let stepCount = 0;
            let blocks3D = [];

            const budget = getDeviceBudget();
            sceneSetup = window.Engine3D.createScene(container, budget);
            sceneSetup.camera.position.set(0, 3.2, 5.0);
            sceneSetup.camera.lookAt(0, 1.5, -0.5);

            window.Engine3D.setupLighting(sceneSetup.scene, budget, 0xffffff, 0.7);

            // Floor & Neon Ring
            const floor = window.Engine3D.createFloor(22, 0x090d16, 0xec4899, budget);
            sceneSetup.scene.add(floor);

            const ring = window.Engine3D.createNeonRing(3.0, 0xec4899, 0.06);
            ring.position.set(0, 3.0, -3.5);
            sceneSetup.scene.add(ring);

            // 3D Array Blocks Setup
            const blockGeo = new THREE.BoxGeometry(0.65, 0.9, 0.65);
            sortedArray.forEach(function (val, i) {
                const group = new THREE.Group();
                const x = (i - (sortedArray.length - 1) / 2) * 0.85;
                group.position.set(x, 1.0, -0.5);

                const mat = new THREE.MeshStandardMaterial({
                    color: 0x334155,
                    metalness: 0.4,
                    roughness: 0.3
                });
                const mesh = new THREE.Mesh(blockGeo, mat);
                mesh.castShadow = true;
                group.add(mesh);

                const label = window.Engine3D.createTextSprite(String(val), {
                    fontSize: 32,
                    canvasWidth: 128,
                    canvasHeight: 128,
                    bgColor: 'transparent',
                    borderColor: 'transparent',
                    scaleX: 0.6,
                    scaleY: 0.6
                });
                label.position.set(0, 0.65, 0);
                group.add(label);

                group.userData = { idx: i, val: val, mesh: mesh, mat: mat };
                sceneSetup.scene.add(group);
                blocks3D.push(group);
            });

            // Holographic Billboard
            const monMesh = window.Engine3D.createTextPanel(
                `⚡ MISI 3: LOMBA ALGORITMA STANDAR (C4)\nTarget Berkas Rahasia: ID #${targetVal}\nRentang Pencarian: [${sortedArray[low]} ... ${sortedArray[high]}]\nPilih titik tengah (MID) untuk membagi data menjadi dua bagian!`,
                { canvasWidth: 700, canvasHeight: 250, meshWidth: 4.8, meshHeight: 1.7 }
            );
            monMesh.position.set(0, 2.9, -1.8);
            sceneSetup.scene.add(monMesh);

            window.Engine3D.createHUD(container, {
                exitBtnId: 'btn-lvl3-exit',
                levelTag: 'MISI 3',
                title: 'Lomba Algoritma: Binary Search vs Linear Search'
            });
            document.getElementById('btn-lvl3-exit').addEventListener('click', function () {
                if (onExit) onExit();
            });

            function updateBlockVisuals() {
                const mid = Math.floor((low + high) / 2);
                blocks3D.forEach(function (b, i) {
                    if (i < low || i > high) {
                        b.userData.mat.color.set(0x1e293b); // eliminated
                        b.position.y = 0.5;
                    } else if (i === mid) {
                        b.userData.mat.color.set(0xec4899); // current midpoint
                        b.userData.mat.emissive.set(0xec4899);
                        b.userData.mat.emissiveIntensity = 0.4;
                        b.position.y = 1.25;
                    } else {
                        b.userData.mat.color.set(0x38bdf8); // active range
                        b.userData.mat.emissive.set(0x000000);
                        b.position.y = 1.0;
                    }
                });

                window.Engine3D.updateTextPanel(
                    monMesh,
                    `⚡ MISI 3: LOMBA ALGORITMA (C4)\nTarget: ID #${targetVal}  |  Langkah: ${stepCount} (Oksimal maks 4 langkah)\nRentang Aktif: [${sortedArray[low]} s.d ${sortedArray[high]}]  |  MID: indeks ${mid} (Nilai: ${sortedArray[mid]})\nKlik tombol di bawah untuk memeriksa titik tengah!`
                );
            }

            updateBlockVisuals();

            // Overlay Controls
            let overlay = document.createElement('div');
            overlay.className = 'level3d-action-overlay';
            overlay.innerHTML = `
                <div class="algorithm-control-card">
                    <p id="alg-info-text">Titik Tengah (MID) terpilih: <strong style="color: #ec4899;">ID #${sortedArray[Math.floor((low + high) / 2)]}</strong></p>
                    <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                        <button type="button" class="btn-action-primary" id="btn-inspect-mid">
                            🔍 Uji Titik Tengah (MID)
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(overlay);

            document.getElementById('btn-inspect-mid').addEventListener('click', function () {
                stepCount++;
                const mid = Math.floor((low + high) / 2);
                const midVal = sortedArray[mid];

                if (midVal === targetVal) {
                    score += 250;
                    if (window.GameUI) window.GameUI.playSynth('success');

                    const ps = window.Engine3D.createParticleBurst(sceneSetup.scene, blocks3D[mid].position, 0x22c55e, 25);
                    particleSystems.push(ps);

                    window.Engine3D.showFeedback3D(
                        container,
                        true,
                        'TARGET DITEMUKAN!',
                        `Ditemukan dalam ${stepCount} langkah! Binary Search membagi ruang pencarian 2x lipat setiap langkah O(log N). Jauh lebih cepat dari Linear Search (O(N)) yang butuh 7 langkah.`,
                        3000
                    );

                    setTimeout(finishMission3, 3200);
                } else if (targetVal < midVal) {
                    high = mid - 1;
                    if (window.GameUI) window.GameUI.playSynth('tap');
                    updateBlockVisuals();
                } else {
                    low = mid + 1;
                    if (window.GameUI) window.GameUI.playSynth('tap');
                    updateBlockVisuals();
                }
            });

            function finishMission3() {
                if (window.GameStorage) {
                    window.GameStorage.completeLevel(3, score, 3, "Pencarian cepat mengungkap pola duplikasi konten hoaks.");
                    window.GameStorage.updateMeterKepercayaan(10);
                }
                if (window.GameUI) window.GameUI.playSynth('levelUp');

                overlay.innerHTML = `
                    <div class="warehouse-feedback-card card-summary">
                        <h2>🏆 MISI 3 SELESAI — MASTER ALGORITMA!</h2>
                        <div class="summary-stars">⭐⭐⭐</div>
                        <p>Skor: <strong>${score}</strong> | Efisiensi: <strong>O(log N) Sempurna</strong></p>
                        <button type="button" class="btn-action-primary" id="btn-m3-hub">Kembali ke Lobi ➔</button>
                    </div>
                `;
                document.getElementById('btn-m3-hub').addEventListener('click', function () {
                    if (onComplete) onComplete({ score: score, stars: 3 });
                    else if (onExit) onExit();
                });
            }

            function animate() {
                animId = requestAnimationFrame(animate);
                if (!sceneSetup) return;
                const dt = sceneSetup.clock.getDelta();
                ring.rotation.z += dt * 0.3;
                for (let i = particleSystems.length - 1; i >= 0; i--) {
                    if (!particleSystems[i].update(dt)) {
                        particleSystems[i].dispose();
                        particleSystems.splice(i, 1);
                    }
                }
                sceneSetup.renderer.render(sceneSetup.scene, sceneSetup.camera);
            }
            animate();

            this.dispose = function () {
                if (animId) cancelAnimationFrame(animId);
                particleSystems.forEach(function (p) { p.dispose(); });
                window.Engine3D.disposeScene(sceneSetup);
                container.innerHTML = '';
            };
        }
    };

    // ============================================================
    // 🧩 LEVEL 4: 3D DEKOMPOSISI PROKER (BERPIKIR KOMPUTASIONAL)
    // ============================================================
    const Level4Decomposition = {
        init: function (container, onComplete, onExit) {
            let animId = null;
            let score = 0;
            const budget = getDeviceBudget();
            const sceneSetup = window.Engine3D.createScene(container, budget);
            sceneSetup.camera.position.set(0, 3.2, 4.8);
            sceneSetup.camera.lookAt(0, 1.8, -0.5);

            window.Engine3D.setupLighting(sceneSetup.scene, budget, 0xffffff, 0.7);
            const floor = window.Engine3D.createFloor(22, 0x090d16, 0x8b5cf6, budget);
            sceneSetup.scene.add(floor);

            // 4 CT Pillars Racks
            const pillars = [
                { name: '1. Dekomposisi', desc: 'Pecah masalah besar jadi sub-tugas kecil', color: 0x3b82f6, x: -3.0 },
                { name: '2. Pengenalan Pola', desc: 'Temukan kesamaan dengan masalah masa lalu', color: 0x10b981, x: -1.0 },
                { name: '3. Abstraksi', desc: 'Fokus informasi esensial, buang detail tak penting', color: 0xf59e0b, x: 1.0 },
                { name: '4. Algoritma', desc: 'Susun langkah logis berurutan solusi', color: 0xec4899, x: 3.0 }
            ];

            pillars.forEach(function (p) {
                const group = new THREE.Group();
                group.position.set(p.x, 1.2, -1.0);
                const mesh = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.7, 0.75, 2.4, 16),
                    new THREE.MeshStandardMaterial({ color: p.color, roughness: 0.4, metalness: 0.3 })
                );
                group.add(mesh);
                const spr = window.Engine3D.createTextSprite(p.name, {
                    fontSize: 24, canvasWidth: 256, canvasHeight: 64,
                    bgColor: 'rgba(15,23,42,0.9)', borderColor: '#' + p.color.toString(16).padStart(6, '0'),
                    scaleX: 1.6, scaleY: 0.45
                });
                spr.position.set(0, 1.5, 0);
                group.add(spr);
                sceneSetup.scene.add(group);
            });

            // Holographic Monitor
            const mon = window.Engine3D.createTextPanel(
                '🧩 MISI 4: DEKOMPOSISI PROKER OSIS (C4)\nStudi Kasus: Persiapan HUT Sekolah ke-40 yang sangat rumit.\nKelompokkan tindakan panitia ke dalam 4 Pilar Berpikir Komputasional!',
                { canvasWidth: 700, canvasHeight: 220, meshWidth: 4.6, meshHeight: 1.5 }
            );
            mon.position.set(0, 3.2, -2.5);
            sceneSetup.scene.add(mon);

            window.Engine3D.createHUD(container, {
                exitBtnId: 'btn-lvl4-exit',
                levelTag: 'MISI 4',
                title: 'Dekomposisi Proker & Berpikir Komputasional'
            });
            document.getElementById('btn-lvl4-exit').addEventListener('click', function () {
                if (onExit) onExit();
            });

            // Tasks
            const tasks = [
                { q: "Membagi kepanitiaan menjadi 4 divisi mandiri: Acara, Konsumsi, Logistik, dan Publikasi.", correct: 0 },
                { q: "Memeriksa anggaran konsumsi tahun lalu untuk memperkirakan biaya tahun ini.", correct: 1 },
                { q: "Mengabaikan warna sepatu pengisi acara dan hanya mencatat durasi tampil.", correct: 2 },
                { q: "Membuat rundown waktu acara detik demi detik dari pembukaan hingga penutup.", correct: 3 }
            ];
            let tIdx = 0;

            const overlay = document.createElement('div');
            overlay.className = 'level3d-action-overlay';
            container.appendChild(overlay);

            function showTask() {
                if (tIdx >= tasks.length) {
                    if (window.GameStorage) {
                        window.GameStorage.completeLevel(4, score, 3, "Masalah besar proker dipecah jadi sub-tugas terkelola.");
                        window.GameStorage.updateMeterKepercayaan(10);
                    }
                    if (window.GameUI) window.GameUI.playSynth('levelUp');
                    overlay.innerHTML = `
                        <div class="warehouse-feedback-card card-summary">
                            <h2>🏆 MISI 4 SELESAI — MASTER BERPIKIR KOMPUTASIONAL!</h2>
                            <div class="summary-stars">⭐⭐⭐</div>
                            <p>Total Skor: <strong>${score}</strong> | Pemahaman 4 Pilar CT: <strong>100%</strong></p>
                            <button type="button" class="btn-action-primary" id="btn-m4-hub">Kembali ke Lobi ➔</button>
                        </div>
                    `;
                    document.getElementById('btn-m4-hub').addEventListener('click', function () {
                        if (onComplete) onComplete({ score: score, stars: 3 });
                        else if (onExit) onExit();
                    });
                    return;
                }

                const curr = tasks[tIdx];
                overlay.innerHTML = `
                    <div class="algorithm-control-card" style="max-width: 600px;">
                        <span class="hud-level-tag">TUGAS ${tIdx + 1}/${tasks.length}</span>
                        <p style="color:#ffffff; font-size:1.1rem; margin:12px 0;"><strong>"${curr.q}"</strong></p>
                        <p style="color:#94a3b8; font-size:0.9rem;">Tindakan di atas menerapkan pilar mana?</p>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px;">
                            <button class="btn-action-secondary ct-btn" data-val="0">1. Dekomposisi</button>
                            <button class="btn-action-secondary ct-btn" data-val="1">2. Pengenalan Pola</button>
                            <button class="btn-action-secondary ct-btn" data-val="2">3. Abstraksi</button>
                            <button class="btn-action-secondary ct-btn" data-val="3">4. Algoritma</button>
                        </div>
                    </div>
                `;

                overlay.querySelectorAll('.ct-btn').forEach(function (b) {
                    b.addEventListener('click', function () {
                        const v = parseInt(this.getAttribute('data-val'), 10);
                        const ok = (v === curr.correct);
                        if (ok) {
                            score += 100;
                            if (window.GameUI) window.GameUI.playSynth('success');
                        } else {
                            if (window.GameUI) window.GameUI.playSynth('error');
                        }
                        window.Engine3D.showFeedback3D(
                            container, ok, ok ? 'TEPAT!' : 'KURANG SESUAI',
                            ok ? 'Pengelompokan pilar CT benar!' : 'Pilar CT memiliki fungsi spesifik yang berbeda.', 1500
                        );
                        setTimeout(function () {
                            tIdx++;
                            showTask();
                        }, 1600);
                    });
                });
            }
            showTask();

            function animate() {
                animId = requestAnimationFrame(animate);
                sceneSetup.renderer.render(sceneSetup.scene, sceneSetup.camera);
            }
            animate();

            this.dispose = function () {
                if (animId) cancelAnimationFrame(animId);
                window.Engine3D.disposeScene(sceneSetup);
                container.innerHTML = '';
            };
        }
    };

    // ============================================================
    // 🤖 LEVEL 5: 3D ROBO-ASISTEN OSIS (IPO & PSEUDOCODE)
    // ============================================================
    const Level5RoboAssistant = {
        init: function (container, onComplete, onExit) {
            let animId = null;
            let score = 0;
            const budget = getDeviceBudget();
            const sceneSetup = window.Engine3D.createScene(container, budget);
            sceneSetup.camera.position.set(0, 2.8, 4.2);
            sceneSetup.camera.lookAt(0, 1.6, -0.5);

            window.Engine3D.setupLighting(sceneSetup.scene, budget, 0xffffff, 0.7);
            const floor = window.Engine3D.createFloor(20, 0x090d16, 0x06b6d4, budget);
            sceneSetup.scene.add(floor);

            // 3D Robot Mascot (Workbench)
            const robotGroup = new THREE.Group();
            robotGroup.position.set(0, 1.4, -0.8);
            // Robot Head
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.7), new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.6 }));
            robotGroup.add(head);
            // Eye screen
            const eyes = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.25), new THREE.MeshBasicMaterial({ color: 0x22d3ee }));
            eyes.position.set(0, 0.05, 0.36);
            robotGroup.add(eyes);
            // Antenna
            const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), new THREE.MeshBasicMaterial({ color: 0xf59e0b }));
            ant.position.set(0, 0.55, 0);
            robotGroup.add(ant);
            sceneSetup.scene.add(robotGroup);

            // Workbench table
            const table = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.2, 1.6), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
            table.position.set(0, 0.8, -0.8);
            sceneSetup.scene.add(table);

            window.Engine3D.createHUD(container, {
                exitBtnId: 'btn-lvl5-exit',
                levelTag: 'MISI 5',
                title: 'Robo-Asisten OSIS: Input - Process - Output'
            });
            document.getElementById('btn-lvl5-exit').addEventListener('click', function () {
                if (onExit) onExit();
            });

            const overlay = document.createElement('div');
            overlay.className = 'level3d-action-overlay';
            container.appendChild(overlay);

            overlay.innerHTML = `
                <div class="algorithm-control-card" style="max-width: 600px;">
                    <span class="hud-level-tag">PROGRAM LOGIKA BOT</span>
                    <p style="color:#ffffff; margin:10px 0;"><strong>Atur Instruksi IPO Bot Filter Komentar Hoaks:</strong></p>
                    <div style="text-align:left; background:rgba(15,23,42,0.8); padding:12px; border-radius:8px; font-family:monospace; color:#38bdf8; margin-bottom:12px;">
                        1. [INPUT] : Baca teks komentar masuk<br>
                        2. [PROSES]: JIKA teks mengandung kata "@infosmax_anon" MAKA...<br>
                        3. [OUTPUT]: Tandai flag "WASPADA HOAKS" & kirim peringatan
                    </div>
                    <p style="color:#cbd5e1; font-size:0.9rem;">Kondisi logika yang benar untuk bot filter adalah:</p>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-top:8px;">
                        <button class="btn-action-secondary r-btn" data-ok="true">IF (kataKunci === 'anon') THEN flag = 'Waspada' ELSE flag = 'Aman'</button>
                        <button class="btn-action-secondary r-btn" data-ok="false">FOR i = 1 TO 100 DO print('Semua Pesan Aman')</button>
                        <button class="btn-action-secondary r-btn" data-ok="false">DELETE ALL DATABASE();</button>
                    </div>
                </div>
            `;

            overlay.querySelectorAll('.r-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const ok = this.getAttribute('data-ok') === 'true';
                    if (ok) {
                        score = 300;
                        if (window.GameStorage) {
                            window.GameStorage.completeLevel(5, score, 3, "Bot asisten OSIS berhasil diprogram memfilter konten anonim.");
                            window.GameStorage.updateMeterKepercayaan(10);
                        }
                        if (window.GameUI) window.GameUI.playSynth('levelUp');
                        overlay.innerHTML = `
                            <div class="warehouse-feedback-card card-summary">
                                <h2>🏆 MISI 5 SELESAI — ROBO-ASISTEN AKTIF!</h2>
                                <div class="summary-stars">⭐⭐⭐</div>
                                <p>Alur Input-Proses-Output & Algoritma Keputusan berhasil diterapkan ke Bot!</p>
                                <button type="button" class="btn-action-primary" id="btn-m5-hub">Kembali ke Lobi ➔</button>
                            </div>
                        `;
                        document.getElementById('btn-m5-hub').addEventListener('click', function () {
                            if (onComplete) onComplete({ score: score, stars: 3 });
                            else if (onExit) onExit();
                        });
                    } else {
                        if (window.GameUI) window.GameUI.playSynth('error');
                        window.Engine3D.showFeedback3D(container, false, 'LOGIKA SALAH', 'Bot butuh percabangan IF-THEN-ELSE untuk memfilter!', 2000);
                    }
                });
            });

            function animate() {
                animId = requestAnimationFrame(animate);
                const t = sceneSetup.clock.getElapsedTime();
                robotGroup.position.y = 1.4 + Math.sin(t * 3) * 0.05;
                robotGroup.rotation.y = Math.sin(t * 1.5) * 0.2;
                sceneSetup.renderer.render(sceneSetup.scene, sceneSetup.camera);
            }
            animate();

            this.dispose = function () {
                if (animId) cancelAnimationFrame(animId);
                window.Engine3D.disposeScene(sceneSetup);
                container.innerHTML = '';
            };
        }
    };

    // ============================================================
    // 🖥️ LEVEL 6: 3D LAB KOMPUTER SEKOLAH (SISTEM OPERASI)
    // ============================================================
    const Level6ComputerLab = {
        init: function (container, onComplete, onExit) {
            let animId = null;
            let score = 0;
            const budget = getDeviceBudget();
            const sceneSetup = window.Engine3D.createScene(container, budget);
            sceneSetup.camera.position.set(0, 2.6, 4.0);
            sceneSetup.camera.lookAt(0, 1.8, -0.5);

            window.Engine3D.setupLighting(sceneSetup.scene, budget, 0xffffff, 0.7);
            const floor = window.Engine3D.createFloor(20, 0x090d16, 0x14b8a6, budget);
            sceneSetup.scene.add(floor);

            // Lab Racks with flashing LEDs
            [-2.5, 2.5].forEach(function (x) {
                const sRack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.2, 0.8), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 }));
                sRack.position.set(x, 1.6, -1.0);
                sceneSetup.scene.add(sRack);
            });

            // 3D Terminal
            const mon = window.Engine3D.createTextPanel(
                '🖥️ MISI 6: MANAJEMEN SISTEM OPERASI (C5)\nLab Komputer mengalami gangguan: Proses jahat menghabiskan 99% RAM\ndan mencoba mengakses data sensitif tanpa hak akses Admin!',
                { canvasWidth: 700, canvasHeight: 220, meshWidth: 4.6, meshHeight: 1.5 }
            );
            mon.position.set(0, 2.6, -1.8);
            sceneSetup.scene.add(mon);

            window.Engine3D.createHUD(container, {
                exitBtnId: 'btn-lvl6-exit',
                levelTag: 'MISI 6',
                title: 'Lab Komputer: Peranan Sistem Operasi (C5)'
            });
            document.getElementById('btn-lvl6-exit').addEventListener('click', function () {
                if (onExit) onExit();
            });

            const overlay = document.createElement('div');
            overlay.className = 'level3d-action-overlay';
            container.appendChild(overlay);

            overlay.innerHTML = `
                <div class="algorithm-control-card" style="max-width: 620px;">
                    <span class="hud-level-tag">KONSOL SISTEM OPERASI</span>
                    <p style="color:#ffffff; margin:10px 0;"><strong>Evaluasi Tindakan Administrator OS:</strong></p>
                    <p style="color:#cbd5e1; font-size:0.9rem;">Sebagai admin, langkah paling aman & efektif mengatasi malware runaway process adalah:</p>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
                        <button class="btn-action-secondary os-btn" data-ok="true">1. Buka Task Manager, Kill Process mencurigakan, dan cabut izin Superuser-nya</button>
                        <button class="btn-action-secondary os-btn" data-ok="false">2. Membiarkan proses berjalan agar memori RAM penuh dan mati sendiri</button>
                        <button class="btn-action-secondary os-btn" data-ok="false">3. Mencabut colokan listrik langsung tanpa mematikan sistem (force shutdown)</button>
                    </div>
                </div>
            `;

            overlay.querySelectorAll('.os-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const ok = this.getAttribute('data-ok') === 'true';
                    if (ok) {
                        score = 350;
                        if (window.GameStorage) {
                            window.GameStorage.completeLevel(6, score, 3, "Akses admin lab komputer berhasil diamankan dari eksploitasi.");
                            window.GameStorage.updateMeterKepercayaan(15);
                        }
                        if (window.GameUI) window.GameUI.playSynth('levelUp');
                        overlay.innerHTML = `
                            <div class="warehouse-feedback-card card-summary">
                                <h2>🏆 MISI 6 SELESAI — LAB KOMPUTER AMAN!</h2>
                                <div class="summary-stars">⭐⭐⭐</div>
                                <p>Sistem Operasi berhasil mengendalikan alokasi proses, memori, dan hak akses izin!</p>
                                <button type="button" class="btn-action-primary" id="btn-m6-hub">Kembali ke Lobi ➔</button>
                            </div>
                        `;
                        document.getElementById('btn-m6-hub').addEventListener('click', function () {
                            if (onComplete) onComplete({ score: score, stars: 3 });
                            else if (onExit) onExit();
                        });
                    } else {
                        if (window.GameUI) window.GameUI.playSynth('error');
                        window.Engine3D.showFeedback3D(container, false, 'KEPUTUSAN BERBAHAYA', 'Tindakan tersebut merusak integritas file sistem OS!', 2000);
                    }
                });
            });

            function animate() {
                animId = requestAnimationFrame(animate);
                sceneSetup.renderer.render(sceneSetup.scene, sceneSetup.camera);
            }
            animate();

            this.dispose = function () {
                if (animId) cancelAnimationFrame(animId);
                window.Engine3D.disposeScene(sceneSetup);
                container.innerHTML = '';
            };
        }
    };

    // ============================================================
    // 🏆 LEVEL 7: 3D PRESENTASI KE KEPSEK (GRAND FINAL C6)
    // ============================================================
    const Level7GrandPresentation = {
        init: function (container, onComplete, onExit) {
            let animId = null;
            let score = 0;
            const budget = getDeviceBudget();
            const sceneSetup = window.Engine3D.createScene(container, budget);
            sceneSetup.camera.position.set(0, 2.8, 4.5);
            sceneSetup.camera.lookAt(0, 1.8, -0.5);

            window.Engine3D.setupLighting(sceneSetup.scene, budget, 0xffffff, 0.8);
            const floor = window.Engine3D.createFloor(24, 0x0b1021, 0xeab308, budget);
            sceneSetup.scene.add(floor);

            // Grand Executive Podium
            const pod = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.6, 16), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 }));
            pod.position.set(0, 0.3, -1.0);
            sceneSetup.scene.add(pod);

            // Golden Trophy in 3D
            const trophyGroup = new THREE.Group();
            trophyGroup.position.set(0, 1.4, -1.0);
            const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.2, 0.8, 12), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 }));
            trophyGroup.add(cup);
            const tBase = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.3, 12), new THREE.MeshStandardMaterial({ color: 0x78350f }));
            tBase.position.y = -0.5;
            trophyGroup.add(tBase);
            sceneSetup.scene.add(trophyGroup);

            // Big Screen
            const mon = window.Engine3D.createTextPanel(
                '🏆 MISI 7: PRESENTASI INVESTIGASI KE KEPALA SEKOLAH (C6)\nSidang Dewan Sekolah: Bukti forensik dari Misi 0 sampai 6 dirangkum\nuntuk mengungkap tuntas pelaku pembuat disinformasi @infosmax_anon!',
                { canvasWidth: 720, canvasHeight: 220, meshWidth: 4.8, meshHeight: 1.5 }
            );
            mon.position.set(0, 3.2, -2.5);
            sceneSetup.scene.add(mon);

            window.Engine3D.createHUD(container, {
                exitBtnId: 'btn-lvl7-exit',
                levelTag: 'MISI 7 FINAL',
                title: 'Sidang Pembuktian Digital di Hadapan Kepala Sekolah'
            });
            document.getElementById('btn-lvl7-exit').addEventListener('click', function () {
                if (onExit) onExit();
            });

            const overlay = document.createElement('div');
            overlay.className = 'level3d-action-overlay';
            container.appendChild(overlay);

            overlay.innerHTML = `
                <div class="algorithm-control-card" style="max-width: 650px;">
                    <span class="hud-level-tag">SIDANG PARIPURNA</span>
                    <p style="color:#ffffff; margin:10px 0;"><strong>Penyusunan Alur Kerja Digital & Rekomendasi Solusi:</strong></p>
                    <p style="color:#cbd5e1; font-size:0.9rem;">Pilih kesimpulan komprehensif yang paling terbukti dari hasil seluruh investigasi:</p>
                    <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
                        <button class="btn-action-primary final-btn" data-ok="true">
                            ⭐ Bukti metadata + domain palsu + log OS membuktikan akun anonim sengaja memanipulasi informasi demi keuntungan pribadi. Rekomendasikan SOP verifikasi digital berkala.
                        </button>
                        <button class="btn-action-secondary final-btn" data-ok="false">
                            Semua informasi di medsos anggap benar tanpa perlu verifikasi fakta.
                        </button>
                    </div>
                </div>
            `;

            overlay.querySelectorAll('.final-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    const ok = this.getAttribute('data-ok') === 'true';
                    if (ok) {
                        score = 500;
                        if (window.GameStorage) {
                            window.GameStorage.completeLevel(7, score, 3, "Bukti investigasi dipresentasikan dengan sukses di hadapan Kepala Sekolah!");
                            window.GameStorage.updateMeterKepercayaan(25);
                        }
                        if (window.GameUI) window.GameUI.playSynth('levelUp');
                        overlay.innerHTML = `
                            <div class="warehouse-feedback-card card-summary">
                                <h2>🎉 SELAMAT! INVESTIGASI TUNTAS 100%!</h2>
                                <div class="summary-stars">⭐⭐⭐</div>
                                <p>Kamu dinobatkan sebagai <strong>Grand Master Detektif Fakta Digital</strong>!</p>
                                <p style="color:#38bdf8; font-size:0.95rem;">Kepala Sekolah memberikan penghargaan tertinggi atas integritas dan dedikasimu.</p>
                                <button type="button" class="btn-action-primary" id="btn-m7-hub">Kembali ke Lobi Utama ➔</button>
                            </div>
                        `;
                        document.getElementById('btn-m7-hub').addEventListener('click', function () {
                            if (onComplete) onComplete({ score: score, stars: 3 });
                            else if (onExit) onExit();
                        });
                    }
                });
            });

            function animate() {
                animId = requestAnimationFrame(animate);
                const t = sceneSetup.clock.getElapsedTime();
                trophyGroup.rotation.y = t * 1.2;
                trophyGroup.position.y = 1.4 + Math.sin(t * 2) * 0.08;
                sceneSetup.renderer.render(sceneSetup.scene, sceneSetup.camera);
            }
            animate();

            this.dispose = function () {
                if (animId) cancelAnimationFrame(animId);
                window.Engine3D.disposeScene(sceneSetup);
                container.innerHTML = '';
            };
        }
    };

    // Export all to window
    window.Level3AlgorithmRace = Level3AlgorithmRace;
    window.Level4Decomposition = Level4Decomposition;
    window.Level5RoboAssistant = Level5RoboAssistant;
    window.Level6ComputerLab = Level6ComputerLab;
    window.Level7GrandPresentation = Level7GrandPresentation;
})();
