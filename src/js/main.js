/**
 * ============================================================
 * 🚀 MAIN BOOTSTRAP, DYNAMIC ROUTER & LEVEL 8 3D CYBER DEFENSE
 * ============================================================
 * Mengorkestrasi deteksi hardware, Hub 3D, lazy-loading level 0-8,
 * dan Simulasi 3D Infrastruktur Jaringan & Keamanan Siber (CIA-A).
 * ============================================================
 */

(function () {
    'use strict';

    // ============================================================
    // 🛡️ LEVEL 8: 3D CYBER DEFENSE & NETWORK ARCHITECT LAB
    // ============================================================
    const Level8NetworkCyber3D = {
        init: function (container, onComplete, onExit) {
            let sceneSetup = null;
            let animId = null;
            let score = 0;
            let currentStage = 0;
            let nodes3D = [];
            let packetMesh = null;
            let shieldMesh = null;

            const stages = [
                {
                    phase: 'TAHAP 1: SKALA JARINGAN & PERANGKAT LOKAL (PAN vs LAN)',
                    scenario: 'Di laboratorium komputer sekolah (25 unit PC), lalu lintas paket data macet dan rawan disadap (Sniffing) karena masih memakai Hub yang menyebarkan paket secara broadcast ke semua port.',
                    task: 'Pilih perangkat penghubung cerdas untuk menggantikan Hub agar paket data dikirim langsung ke alamat tujuan spesifik!',
                    options: [
                        { label: 'Pasang Switch Cerdas (Layer-2 Unicast Forwarding)', correct: true, msg: 'Tepat! Switch meneruskan paket data langsung ke port alamat perangkat tujuan secara spesifik dan mencegah penyadapan broadcast.' },
                        { label: 'Ganti dengan Koneksi Bluetooth Personal Area Network (PAN)', correct: false, msg: 'Kurang tepat. Bluetooth berskala PAN (hanya beberapa meter untuk smartwatch/earbuds pribadi), bukan untuk 25 PC laboratorium.' },
                        { label: 'Lepas Konektor RJ-45 dan biarkan tanpa perangkat penghubung', correct: false, msg: 'Tanpa Switch atau perangkat penghubung, 25 komputer dalam topologi Star tidak dapat saling berkomunikasi.' }
                    ],
                    nodeColor: 0x38bdf8
                },
                {
                    phase: 'TAHAP 2: MEDIA TRANSMISI & PERANCANGAN TOPOLOGI HOTS',
                    scenario: 'Rumah sakit merancang 2 segmen: (1) Ruang UGD dengan 6 monitor detak jantung kritis yang pantang putus koneksi meskipun 1-2 kabel rusak, serta (2) Jalur antargedung sejauh 250 meter di luar ruangan yang harus berkecepatan cahaya & tahan petir.',
                    task: 'Tentukan kombinasi Topologi UGD dan Kabel Antargedung yang paling tepat!',
                    options: [
                        { label: 'Topologi Bus (UGD) + Kabel UTP Tanpa Pelindung (Antargedung)', correct: false, msg: 'Berbahaya! Pada Topologi Bus, jika kabel utama putus maka seluruh jaringan mati; kabel UTP tembaga juga rentan sambaran petir.' },
                        { label: 'Topologi Mesh (UGD) + Kabel Serat Optik / Fiber Optik (Antargedung)', correct: true, msg: 'Sempurna! Topologi Mesh memiliki banyak jalur cadangan (redundansi tinggi), dan Fiber Optik mentransmisikan pulsa cahaya yang kebal interferensi elektromagnetik/petir.' },
                        { label: 'Topologi Ring (UGD) + Kabel Koaksial Televisi Lama (Antargedung)', correct: false, msg: 'Pada Topologi Ring, jika satu titik putus maka seluruh aliran cincin terganggu.' }
                    ],
                    nodeColor: 0x10b981
                },
                {
                    phase: 'TAHAP 3: SISTEM NAVIGASI DNS & PENERJEMAH MODEM',
                    scenario: 'Saat server DNS mengalami gangguan, teknisi mengetikkan alamat IP 142.250.190.46 secara langsung di browser. Sementara itu, di rumah siswa, Router sudah terpasang ke PC dengan kabel UTP tetapi belum ada Modem dari jalur ISP.',
                    task: 'Manakah analisis teknis yang BENAR dari kedua kejadian di atas?',
                    options: [
                        { label: 'Alamat IP 142.250.190.46 tetap bisa dibuka tanpa DNS, sedangkan rumah siswa gagal internetan karena tidak ada Modem pengubah sinyal analog ke digital.', correct: true, msg: 'Analisis 100% Akurat! DNS hanya menerjemahkan nama domain ke IP (jika diketik IP langsung maka tetap jalan), sedangkan Modem wajib ada untuk modulasi-demodulasi sinyal ISP.' },
                        { label: 'Alamat IP gagal dibuka jika DNS mati, dan Switch bisa menggantikan fungsi Modem ISP.', correct: false, msg: 'Keliru. Mengetik IP langsung tidak membutuhkan DNS, dan Switch tidak bisa mengubah sinyal analog ISP menjadi digital.' },
                        { label: 'DNS berfungsi mengubah sinyal listrik menjadi cahaya pada kabel STP.', correct: false, msg: 'DNS adalah buku telepon internet (Domain ke IP), bukan pengubah sinyal fisik.' }
                    ],
                    nodeColor: 0xf59e0b
                },
                {
                    phase: 'TAHAP 4: PERTAHANAN SIBER & 4 PILAR KEAMANAN (CIA-A)',
                    scenario: 'INSIDEN SIBER RUMAH SAKIT: (1) Pukul 08.00 staf mengklik tautan email portal palsu & memasukkan password; (2) Pukul 09.00 peretas menginstal program pengunci data tebusan; (3) Pukul 10.00 sistem pendaftaran pasien down/lumpuh total.',
                    task: 'Identifikasi korelasi ancaman pukul 08.00 — 09.00 — dan pilar keamanan yang lumpuh pada pukul 10.00!',
                    options: [
                        { label: 'Sniffing (08.00) — Phising (09.00) — Confidentiality (10.00)', correct: false, msg: 'Kurang tepat. Email tautan palsu adalah Phising, bukan Sniffing.' },
                        { label: 'Phising (08.00) — Malware Ransomware (09.00) — Availability (10.00)', correct: true, msg: 'Pertahanan Siber Sempurna! Tautan palsu = Phising, program pengunci data tebusan = Malware (Ransomware), dan lumpuhnya ketersediaan layanan = Availability.' },
                        { label: 'Malware Virus (08.00) — Sniffing (09.00) — Integrity (10.00)', correct: false, msg: 'Kurang tepat. Lumpuhnya akses server saat dibutuhkan melanggar pilar Availability (Ketersediaan).' }
                    ],
                    nodeColor: 0xf43f5e
                }
            ];

            const budget = (window.DeviceTier && window.DeviceTier.getBudget()) || {
                tier: 'low', shadows: false, pixelRatio: 1.0, antialias: false
            };
            sceneSetup = window.Engine3D.createScene(container, budget);
            sceneSetup.camera.position.set(0, 4.3, 6.4);
            sceneSetup.camera.lookAt(0, 1.2, 0);

            window.Engine3D.setupLighting(sceneSetup.scene, budget, 0xffffff, 0.75);

            const floor = window.Engine3D.createFloor(24, 0x070b14, 0x0ea5e9, budget);
            sceneSetup.scene.add(floor);

            const outerRing = window.Engine3D.createNeonRing(2.9, 0x0ea5e9, 0.05);
            outerRing.rotation.x = Math.PI / 2;
            outerRing.position.set(0, 0.05, 0);
            sceneSetup.scene.add(outerRing);

            // Central Server Core 3D
            const coreGroup = new THREE.Group();
            const serverGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.8, 10);
            const serverMat = new THREE.MeshStandardMaterial({
                color: 0x0284c7,
                emissive: 0x0369a1,
                emissiveIntensity: 0.45,
                metalness: 0.6,
                roughness: 0.2
            });
            const serverMesh = new THREE.Mesh(serverGeo, serverMat);
            serverMesh.position.y = 1.0;
            coreGroup.add(serverMesh);

            const shieldGeo = new THREE.OctahedronGeometry(1.3, 1);
            const shieldMat = new THREE.MeshBasicMaterial({
                color: 0x38bdf8,
                wireframe: true,
                transparent: true,
                opacity: 0.4
            });
            shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
            shieldMesh.position.y = 1.0;
            coreGroup.add(shieldMesh);
            sceneSetup.scene.add(coreGroup);

            // 6 Satellite Network Nodes (Star & Mesh Topology visualization)
            const nodeGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
            const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });

            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const nx = Math.cos(angle) * 2.7;
                const nz = Math.sin(angle) * 2.7;

                const nMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0x0ea5e9, emissiveIntensity: 0.35 });
                const nMesh = new THREE.Mesh(nodeGeo, nMat);
                nMesh.position.set(nx, 0.6, nz);
                sceneSetup.scene.add(nMesh);
                nodes3D.push(nMesh);

                const pts = [new THREE.Vector3(0, 0.8, 0), new THREE.Vector3(nx, 0.6, nz)];
                const lGeo = new THREE.BufferGeometry().setFromPoints(pts);
                sceneSetup.scene.add(new THREE.Line(lGeo, lineMat));
            }

            // Data Packet Sphere
            const pktGeo = new THREE.SphereGeometry(0.16, 12, 12);
            const pktMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
            packetMesh = new THREE.Mesh(pktGeo, pktMat);
            packetMesh.position.set(2.7, 0.7, 0);
            sceneSetup.scene.add(packetMesh);

            const uiWrap = document.createElement('div');
            uiWrap.className = 'level-ui-overlay';
            uiWrap.style.cssText = 'position:absolute;inset:0;pointer-events:none;display:flex;flex-direction:column;justify-content:space-between;padding:16px;z-index:20;';
            container.appendChild(uiWrap);

            function renderStageUI() {
                if (currentStage >= stages.length) {
                    const finalScore = Math.min(100, Math.round((score / stages.length) * 100));
                    uiWrap.innerHTML = `
                        <div></div>
                        <div style="pointer-events:auto;max-width:560px;margin:0 auto;background:rgba(15,23,42,0.96);border:2px solid #38bdf8;border-radius:18px;padding:24px;text-align:center;color:#fff;box-shadow:0 20px 50px rgba(0,0,0,0.75);">
                            <div style="font-size:2.6rem;margin-bottom:8px;">🛡️⭐⭐⭐</div>
                            <h2 style="margin:0 0 8px;color:#38bdf8;">SIMULASI ARSITEK JARINGAN & SIBER TUNTAS!</h2>
                            <p style="font-size:0.92rem;color:#cbd5e1;margin-bottom:18px;line-height:1.5;">
                                Skor Pertahanan Siber: <strong style="color:#4ade80;font-size:1.25rem;">${finalScore}/100</strong><br>
                                Seluruh infrastruktur PAN, LAN, MAN, WAN, DNS, dan 4 Pilar CIA-A telah diamankan!
                            </p>
                            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
                                <button type="button" id="btn-cyber-finish" style="background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;border:none;padding:11px 22px;border-radius:10px;font-weight:800;cursor:pointer;">
                                    ✅ Simpan Progres & Kembali ke Lobi 3D
                                </button>
                                <a href="index.html" style="background:rgba(16,185,129,0.2);border:1.5px solid #10b981;color:#34d399;text-decoration:none;padding:11px 18px;border-radius:10px;font-weight:800;">
                                    📝 Kerjakan Ujian 20 Soal Sekarang
                                </a>
                            </div>
                        </div>
                        <div></div>
                    `;
                    document.getElementById('btn-cyber-finish').onclick = function () {
                        if (onComplete) onComplete({ score: finalScore, stars: 3 });
                        else if (onExit) onExit();
                    };
                    return;
                }

                const st = stages[currentStage];
                shieldMesh.material.color.setHex(st.nodeColor);

                uiWrap.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;pointer-events:auto;background:rgba(15,23,42,0.9);border:1px solid rgba(56,189,248,0.4);padding:10px 16px;border-radius:12px;">
                        <div>
                            <span style="font-size:0.75rem;color:#38bdf8;font-weight:800;letter-spacing:0.05em;">🛡️ MISI 8 • SIMULASI 3D (${currentStage + 1}/${stages.length})</span>
                            <h3 style="margin:2px 0 0;color:#fff;font-size:0.98rem;">${st.phase}</h3>
                        </div>
                        <button type="button" id="btn-cyber-exit" style="background:rgba(239,68,68,0.2);border:1px solid #ef4444;color:#fca5a5;padding:6px 12px;border-radius:8px;font-weight:700;cursor:pointer;">
                            ✕ Kembali ke Lobi
                        </button>
                    </div>

                    <div style="pointer-events:auto;max-width:660px;width:100%;margin:0 auto;background:rgba(15,23,42,0.94);border:1.5px solid rgba(56,189,248,0.45);border-radius:16px;padding:16px 20px;color:#fff;backdrop-filter:blur(10px);">
                        <p style="margin:0 0 8px;font-size:0.86rem;color:#cbd5e1;line-height:1.5;"><strong>📡 Studi Kasus:</strong> ${st.scenario}</p>
                        <p style="margin:0 0 12px;font-size:0.9rem;color:#38bdf8;font-weight:700;">🎯 ${st.task}</p>
                        <div id="cyber-opts-box" style="display:grid;gap:8px;">
                            ${st.options.map((o, idx) => `
                                <button type="button" class="cyber-opt-btn" data-idx="${idx}" style="text-align:left;background:rgba(30,41,59,0.92);border:1px solid rgba(148,163,184,0.35);color:#f8fafc;padding:10px 14px;border-radius:10px;font-size:0.85rem;font-weight:600;cursor:pointer;transition:all 0.2s;">
                                    🔹 ${o.label}
                                </button>
                            `).join('')}
                        </div>
                        <div id="cyber-feedback-msg" style="display:none;margin-top:12px;padding:10px 14px;border-radius:10px;font-size:0.84rem;line-height:1.45;"></div>
                    </div>
                `;

                document.getElementById('btn-cyber-exit').onclick = function () {
                    if (onExit) onExit();
                };

                uiWrap.querySelectorAll('.cyber-opt-btn').forEach(btn => {
                    btn.onclick = function () {
                        const idx = parseInt(this.getAttribute('data-idx'), 10);
                        const chosen = st.options[idx];
                        const fb = document.getElementById('cyber-feedback-msg');
                        uiWrap.querySelectorAll('.cyber-opt-btn').forEach(b => b.disabled = true);

                        if (chosen.correct) {
                            score++;
                            if (window.GameUI) window.GameUI.playSynth('success');
                            this.style.borderColor = '#10b981';
                            this.style.background = 'rgba(16,185,129,0.25)';
                            fb.style.display = 'block';
                            fb.style.background = 'rgba(16,185,129,0.15)';
                            fb.style.border = '1px solid #10b981';
                            fb.innerHTML = `✅ <strong>Tepat Sekali!</strong> ${chosen.msg} <br><button id="btn-next-stg" style="margin-top:8px;background:#10b981;color:#052e16;border:none;padding:7px 16px;border-radius:8px;font-weight:800;cursor:pointer;">Lanjut Tahap Berikutnya ➔</button>`;
                        } else {
                            if (window.GameUI) window.GameUI.playSynth('error');
                            this.style.borderColor = '#ef4444';
                            this.style.background = 'rgba(239,68,68,0.25)';
                            fb.style.display = 'block';
                            fb.style.background = 'rgba(239,68,68,0.15)';
                            fb.style.border = '1px solid #ef4444';
                            fb.innerHTML = `❌ <strong>Kurang Tepat:</strong> ${chosen.msg} <br><button id="btn-next-stg" style="margin-top:8px;background:#38bdf8;color:#0f172a;border:none;padding:7px 16px;border-radius:8px;font-weight:800;cursor:pointer;">Lanjut Tahap Berikutnya ➔</button>`;
                        }

                        document.getElementById('btn-next-stg').onclick = function () {
                            currentStage++;
                            renderStageUI();
                        };
                    };
                });
            }

            renderStageUI();

            function animate() {
                animId = requestAnimationFrame(animate);
                const t = sceneSetup.clock.getElapsedTime();
                shieldMesh.rotation.y = t * 0.6;
                shieldMesh.rotation.z = t * 0.3;
                outerRing.rotation.z = -t * 0.4;

                const activeNodeIdx = Math.floor(t * 0.85) % nodes3D.length;
                const progress = (t * 0.85) % 1;
                const targetNode = nodes3D[activeNodeIdx];
                if (targetNode && packetMesh) {
                    packetMesh.position.x = targetNode.position.x * progress;
                    packetMesh.position.z = targetNode.position.z * progress;
                    packetMesh.position.y = 0.7 + Math.sin(progress * Math.PI) * 0.45;
                }

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
    window.Level8NetworkCyber3D = Level8NetworkCyber3D;

    // ============================================================
    // 🚀 MAIN BOOTSTRAP & ROUTER
    // ============================================================
    let currentActiveLevel = null;
    let hubContainerEl = null;
    let levelContainerEl = null;

    async function bootstrap() {
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

        const fallbackTimer = setTimeout(hideLoader, 800);

        try {
            if (window.DeviceTier) {
                try {
                    await Promise.race([
                        window.DeviceTier.init(),
                        new Promise(r => setTimeout(() => r(window.DeviceTier.getBudget()), 400))
                    ]);
                } catch (errTier) { }
            }

            if (window.GameUI) {
                try {
                    window.GameUI.init((stationId) => {
                        startStationLevel(stationId);
                    });
                } catch (errUI) { }
            }

            if (window.HubScene && hubContainerEl && typeof THREE !== 'undefined') {
                try {
                    const budget = window.DeviceTier ? window.DeviceTier.getBudget() : null;
                    window.HubScene.init(hubContainerEl, budget, (stationId, stationData) => {
                        handleStationClicked(stationId, stationData);
                    });
                } catch (errHub) { }
            }
        } catch (globalErr) {
            console.error('Bootstrap error:', globalErr);
        } finally {
            clearTimeout(fallbackTimer);
            hideLoader();
        }
    }

    function handleStationClicked(stationId, stationData) {
        const storage = window.GameStorage;
        const isUnlocked = true; // Semua stasiun dibuka agar siswa leluasa belajar
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

    function startStationLevel(stationId) {
        if (stationId === 0 || stationId === '0') {
            mountLevel(window.Level0Onboarding, 0, '🎉 Lisensi Detektif Terbit!');
        } else if (stationId === 1 || stationId === '1') {
            mountLevel(window.Level1Detective, 1, '⭐ Misi 1 Tuntas!');
        } else if (stationId === 2 || stationId === '2') {
            mountLevel(window.Level2WarehouseSorter, 2, '⭐ Misi 2 Arsip Tuntas!');
        } else if (stationId === 3 || stationId === '3') {
            mountLevel(window.Level3AlgorithmRace, 3, '⭐ Misi 3 Algoritma Tuntas!');
        } else if (stationId === 4 || stationId === '4') {
            mountLevel(window.Level4Decomposition, 4, '⭐ Misi 4 Dekomposisi Tuntas!');
        } else if (stationId === 5 || stationId === '5') {
            mountLevel(window.Level5RoboAssistant, 5, '⭐ Misi 5 Robo-Asisten Tuntas!');
        } else if (stationId === 6 || stationId === '6') {
            mountLevel(window.Level6ComputerLab, 6, '⭐ Misi 6 Lab Komputer Tuntas!');
        } else if (stationId === 7 || stationId === '7') {
            mountLevel(window.Level7GrandPresentation, 7, '🏆 Misi 7 Presentasi Tuntas!');
        } else if (stationId === 8 || stationId === '8') {
            mountLevel(window.Level8NetworkCyber3D, 8, '🛡️ Misi 8 Arsitek Jaringan & Pertahanan Siber Tuntas!');
        } else if (stationId === 'labtik') {
            mountLevel(window.LabTIK_SearchEngine, 'labtik', '🔍 Lab TIK Selesai!');
        }
    }

    function mountLevel(levelObj, levelId, toastMsg) {
        if (!levelObj || !levelContainerEl) return;
        if (window.HubScene) window.HubScene.pause();

        levelContainerEl.classList.remove('hidden');
        levelContainerEl.innerHTML = '';
        currentActiveLevel = levelObj;

        levelObj.init(
            levelContainerEl,
            (result) => {
                const sc = (result && result.score) ? result.score : 100;
                const st = (result && result.stars) ? result.stars : 3;
                if (window.GameStorage) {
                    window.GameStorage.completeLevel(levelId, sc, st, toastMsg);
                    window.GameStorage.updateMeterKepercayaan(10);
                }
                if (window.GameUI) {
                    window.GameUI.showToast(`${toastMsg} (Skor: ${sc})`, 'success', 4000);
                    window.GameUI.playSynth('success');
                }
                unmountCurrentLevel();
            },
            () => {
                unmountCurrentLevel();
            }
        );
    }

    function unmountCurrentLevel() {
        if (currentActiveLevel && typeof currentActiveLevel.dispose === 'function') {
            currentActiveLevel.dispose();
            currentActiveLevel = null;
        }

        if (levelContainerEl) {
            levelContainerEl.innerHTML = '';
            levelContainerEl.classList.add('hidden');
        }

        if (window.GameUI) {
            window.GameUI.updateHUD();
        }

        if (window.HubScene) {
            window.HubScene.resume();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();