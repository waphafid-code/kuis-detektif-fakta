/**
 * ============================================================
 * 🚪 LEVEL 0: 3D SECURITY CHECKPOINT & CYBER HOLOGRAPHIC GATE
 * ============================================================
 * - Background: Full 3D Security Checkpoint with sci-fi pillars,
 *   animated laser beams (red locked / green unlocked),
 *   ambient light beacons, and 3D particle bursts.
 * - Foreground: Razor-sharp Cyberpunk Holographic Terminal HUD
 *   ensuring 100% crystal-clear question text, zero text clipping,
 *   zero mesh penetration, and full responsiveness across all devices.
 * ============================================================
 */

(function () {
    'use strict';

    let activeContainer = null;
    let onFinishCallback = null;
    let onExitCallback = null;
    let sceneSetup = null;
    let animFrameId = null;

    // Game state
    let currentQIdx = 0;
    let correctAnswers = 0;
    let studentAnswers = [];
    let isAnswering = false;
    let feedbackTimer = null;

    // 3D objects
    let gateGroup = null;
    let laserBeams = [];
    let statusLight = null;
    let ringL = null;
    let ringR = null;
    let particleSystems = [];
    let floatingObjects = [];

    function getPlayerName() {
        return (window.GameStorage && window.GameStorage.getPlayerName()) || 'Detektif Muda';
    }

    function getDeviceBudget() {
        return (window.DeviceTier && window.DeviceTier.getBudget()) || {
            tier: 'low', shadows: false, pixelRatio: 1.0, antialias: false
        };
    }

    /**
     * Build the 3D Security Checkpoint Environment
     */
    function buildEnvironment(scene, budget) {
        const E = window.Engine3D;

        // Floor - Dark Cyberpunk Grid
        const floor = E.createFloor(24, 0x080e1a, 0x1e3a8a, budget);
        scene.add(floor);

        // === GATE PILLARS & LASER BARRIER ===
        gateGroup = new THREE.Group();
        gateGroup.position.set(0, 0, -2.5);

        // Left pillar
        const pillarGeo = new THREE.CylinderGeometry(0.3, 0.38, 5.2, 12);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
        const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
        leftPillar.position.set(-2.8, 2.6, 0);
        gateGroup.add(leftPillar);

        // Right pillar
        const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
        rightPillar.position.set(2.8, 2.6, 0);
        gateGroup.add(rightPillar);

        // Top arch beam
        const topGeo = new THREE.BoxGeometry(6.2, 0.4, 0.4);
        const topMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
        const topBeam = new THREE.Mesh(topGeo, topMat);
        topBeam.position.set(0, 5.2, 0);
        gateGroup.add(topBeam);

        // Status sphere light
        const statusGeo = new THREE.SphereGeometry(0.22, 12, 12);
        const statusMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        statusLight = new THREE.Mesh(statusGeo, statusMat);
        statusLight.position.set(0, 5.55, 0);
        gateGroup.add(statusLight);

        // 5 Laser Beams across gate
        laserBeams = [];
        for (let i = 0; i < 5; i++) {
            const laserGeo = new THREE.CylinderGeometry(0.025, 0.025, 5.4, 8);
            const laserMat = new THREE.MeshBasicMaterial({
                color: 0xef4444,
                transparent: true,
                opacity: 0.88
            });
            const laser = new THREE.Mesh(laserGeo, laserMat);
            laser.rotation.z = Math.PI / 2;
            laser.position.set(0, 1.0 + i * 0.9, 0);
            gateGroup.add(laser);
            laserBeams.push(laser);
        }

        // Neon rings on pillar tops
        ringL = E.createNeonRing(0.42, 0xef4444, 0.05);
        ringL.position.set(-2.8, 5.3, 0);
        ringL.rotation.x = Math.PI / 2;
        gateGroup.add(ringL);

        ringR = E.createNeonRing(0.42, 0xef4444, 0.05);
        ringR.position.set(2.8, 5.3, 0);
        ringR.rotation.x = Math.PI / 2;
        gateGroup.add(ringR);

        scene.add(gateGroup);

        // === AMBIENT BEACONS ON SIDES ===
        for (let side = -1; side <= 1; side += 2) {
            for (let z = -1; z <= 3; z += 2) {
                const beaconGeo = new THREE.CylinderGeometry(0.08, 0.12, 2.2, 6);
                const beaconMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
                const beacon = new THREE.Mesh(beaconGeo, beaconMat);
                beacon.position.set(side * 4.2, 1.1, z);
                scene.add(beacon);

                const glowBulb = new THREE.Mesh(
                    new THREE.SphereGeometry(0.14, 8, 8),
                    new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
                );
                glowBulb.position.set(side * 4.2, 2.3, z);
                scene.add(glowBulb);
                floatingObjects.push({ mesh: glowBulb, baseY: 2.3, speed: 2.0 + z * 0.2, amp: 0.06 });
            }
        }
    }

    /**
     * Unlock Gate Visuals (Lasers turn green and deactivate)
     */
    function unlockGate() {
        if (statusLight) statusLight.material.color.setHex(0x22c55e);
        if (ringL) ringL.material.color.setHex(0x22c55e);
        if (ringR) ringR.material.color.setHex(0x22c55e);

        laserBeams.forEach(function (beam) {
            beam.material.color.setHex(0x22c55e);
            beam.material.opacity = 0.25;
            beam.scale.set(0.1, 1, 0.1);
        });

        // 3D particle celebration burst
        if (sceneSetup) {
            [-1.5, 0, 1.5].forEach(function (x) {
                const pos = new THREE.Vector3(x, 2.8, -2.5);
                const ps = window.Engine3D.createParticleBurst(sceneSetup.scene, pos, 0x22c55e, 25);
                particleSystems.push(ps);
            });
        }
    }

    /**
     * Render the Holographic Cyber Kiosk in Foreground
     */
    function renderKioskContainer() {
        if (!activeContainer) return;
        let kiosk = activeContainer.querySelector('.gate-kiosk-wrapper');
        if (!kiosk) {
            kiosk = document.createElement('div');
            kiosk.className = 'gate-kiosk-wrapper';
            activeContainer.appendChild(kiosk);
        }
        return kiosk;
    }

    /**
     * Show Briefing Stage
     */
    function showBriefing() {
        const kiosk = renderKioskContainer();
        const dialog = window.LEVEL_0_DIALOG;
        const playerName = getPlayerName();
        const speech = dialog && dialog.dialogPembuka
            ? dialog.dialogPembuka.map(function (s) { return s.replace(/{playerName}/g, playerName); }).join('<br><br>')
            : `Halo <strong>${playerName}</strong>! Selamat datang di Gerbang Keamanan Digital OSIS.<br><br>Sebelum dapat mengakses misi investigasi, kamu wajib membuktikan pemahaman dasar tentang Data, Fakta, dan Keamanan Digital!`;

        kiosk.innerHTML = `
            <div class="gate-kiosk-card animate-pop-in">
                <div class="kiosk-header-bar">
                    <div class="kiosk-badge-group">
                        <span class="badge-gate-tag">GATE 0</span>
                        <span class="badge-bloom-tag">C1 MENGINGAT</span>
                    </div>
                    <span class="kiosk-status-badge">🔒 AKSES DIBATASI</span>
                </div>

                <div class="mentor-briefing-row">
                    <div class="mentor-avatar-box">👩‍💼</div>
                    <div class="mentor-details">
                        <h3 class="mentor-title">Bu Maya — Kepala Keamanan Data Sekolah</h3>
                        <p class="mentor-subtitle">Pemeriksaan Kredensial Anggota Skuad Baru</p>
                    </div>
                </div>

                <div class="kiosk-dialog-bubble">
                    <p>${speech}</p>
                </div>

                <div class="kiosk-rules-box">
                    <span>🎯 <strong>Syarat Kelulusan:</strong> Jawab minimal <strong>4 dari 5 soal benar (80%)</strong> untuk membuka stasiun investigasi Misi 1.</span>
                </div>

                <button type="button" class="btn-action-primary" id="btn-start-gate-test">
                    Mulai Uji Lisensi Detektif (5 Soal) ➔
                </button>
            </div>
        `;

        document.getElementById('btn-start-gate-test').addEventListener('click', function () {
            if (window.GameUI) window.GameUI.playSynth('tap');
            currentQIdx = 0;
            correctAnswers = 0;
            studentAnswers = [];
            showQuestion();
        });
    }

    /**
     * Show Individual Question
     */
    function showQuestion() {
        const data = window.LEVEL_0_DATA;
        if (!data || !data.questions) return;

        if (currentQIdx >= data.questions.length) {
            showResults();
            return;
        }

        const q = data.questions[currentQIdx];
        const total = data.questions.length;
        const kiosk = renderKioskContainer();
        const progressPct = Math.round((currentQIdx / total) * 100);

        // Update HUD
        const statsEl = activeContainer.querySelector('#hud-3d-stats');
        if (statsEl) {
            statsEl.innerHTML = `<span>❓ ${currentQIdx + 1}/${total}</span> <span>✅ ${correctAnswers}</span>`;
        }

        const optionLabels = ['A', 'B', 'C', 'D'];
        const optionColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'];

        kiosk.innerHTML = `
            <div class="gate-kiosk-card animate-pop-in">
                <!-- Progress Header -->
                <div class="kiosk-progress-header">
                    <div class="progress-info-row">
                        <span class="progress-label">PERTANYAAN ${currentQIdx + 1} DARI ${total}</span>
                        <span class="progress-score">Skor Benar: ${correctAnswers}</span>
                    </div>
                    <div class="kiosk-progress-track">
                        <div class="kiosk-progress-fill" style="width: ${progressPct}%;"></div>
                    </div>
                </div>

                <!-- Question Box (Crisp, High-Contrast Typography) -->
                <div class="kiosk-question-box">
                    <h3 class="kiosk-question-text">${q.text}</h3>
                </div>

                <!-- Answer Choices (Spacious, Fully Responsive Grid) -->
                <div class="kiosk-options-grid">
                    ${q.options.map(function (opt, idx) {
                        return `
                            <button type="button" class="btn-kiosk-option" data-idx="${idx}" style="--btn-accent: ${optionColors[idx]}">
                                <span class="opt-prefix">${optionLabels[idx]}</span>
                                <span class="opt-text">${opt}</span>
                            </button>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        isAnswering = true;

        const buttons = kiosk.querySelectorAll('.btn-kiosk-option');
        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                if (!isAnswering) return;
                const chosenIdx = parseInt(this.getAttribute('data-idx'), 10);
                handleAnswer(chosenIdx, buttons);
            });
        });
    }

    /**
     * Handle Answer Submission
     */
    function handleAnswer(chosenIdx, buttons) {
        if (!isAnswering) return;
        isAnswering = false;

        const data = window.LEVEL_0_DATA;
        const q = data.questions[currentQIdx];
        const correctIdx = (q.correct !== undefined) ? q.correct : q.answer;
        const isCorrect = (chosenIdx === correctIdx);

        if (isCorrect) {
            correctAnswers++;
            if (window.GameUI) window.GameUI.playSynth('success');
        } else {
            if (window.GameUI) window.GameUI.playSynth('error');
        }

        studentAnswers.push({ qId: q.id, chosen: chosenIdx, correct: isCorrect });

        // Highlight selected button
        buttons.forEach(function (btn) {
            const bIdx = parseInt(btn.getAttribute('data-idx'), 10);
            if (bIdx === correctIdx) {
                btn.classList.add('opt-correct');
            } else if (bIdx === chosenIdx && !isCorrect) {
                btn.classList.add('opt-wrong');
            } else {
                btn.style.opacity = '0.35';
            }
            btn.disabled = true;
        });

        // 3D Particle effect in background
        if (sceneSetup) {
            const burstColor = isCorrect ? 0x22c55e : 0xef4444;
            const burstPos = new THREE.Vector3((chosenIdx - 1.5) * 1.5, 2.0, -1.0);
            const ps = window.Engine3D.createParticleBurst(sceneSetup.scene, burstPos, burstColor, 20);
            particleSystems.push(ps);
        }

        // Show Feedback Modal
        showAnswerFeedback(isCorrect, q, function () {
            currentQIdx++;
            showQuestion();
        });
    }

    /**
     * Show Answer Explanation Feedback
     */
    function showAnswerFeedback(isCorrect, q, onNext) {
        let feedbackOverlay = activeContainer.querySelector('.gate-feedback-modal');
        if (!feedbackOverlay) {
            feedbackOverlay = document.createElement('div');
            feedbackOverlay.className = 'gate-feedback-modal';
            activeContainer.appendChild(feedbackOverlay);
        }

        feedbackOverlay.innerHTML = `
            <div class="gate-feedback-card ${isCorrect ? 'fb-correct' : 'fb-wrong'} animate-pop-in">
                <div class="fb-header">
                    <span class="fb-icon">${isCorrect ? '✅ JAWABAN TEPAT!' : '❌ JAWABAN KURANG TEPAT!'}</span>
                </div>
                <div class="fb-body">
                    <p class="fb-explanation"><strong>📖 Penjelasan Detektif:</strong><br>${q.explanation}</p>
                </div>
                <button type="button" class="btn-action-primary" id="btn-feedback-continue">
                    Lanjut ke Pertanyaan Berikutnya ➔
                </button>
            </div>
        `;
        feedbackOverlay.style.display = 'flex';

        document.getElementById('btn-feedback-continue').addEventListener('click', function () {
            feedbackOverlay.style.display = 'none';
            if (window.GameUI) window.GameUI.playSynth('tap');
            onNext();
        });
    }

    /**
     * Show Final Results and License
     */
    function showResults() {
        const data = window.LEVEL_0_DATA;
        const total = data.questions.length;
        const pct = Math.round((correctAnswers / total) * 100);
        const isPassed = (pct >= (data.passingScore || 80));

        const kiosk = renderKioskContainer();

        if (isPassed) {
            unlockGate();
            if (window.GameStorage) {
                window.GameStorage.completeLevel(0, correctAnswers * 20, 3, "Lisensi Detektif Terbit: Pemahaman istilah dasar data & fakta telah lulus uji.");
                window.GameStorage.updateMeterKepercayaan(10);
            }
            if (window.GameUI) window.GameUI.playSynth('levelUp');
        } else {
            if (window.GameUI) window.GameUI.playSynth('error');
        }

        kiosk.innerHTML = `
            <div class="gate-kiosk-card ${isPassed ? 'card-pass' : 'card-fail'} animate-pop-in">
                <div class="results-header">
                    <h2>${isPassed ? '🎉 LISENSI DETEKTIF DATA TERBIT!' : '⚠️ BELUM MEMENUHI STANDAR KELULUSAN'}</h2>
                    <div class="results-stars">${isPassed ? '⭐⭐⭐' : '☆☆☆'}</div>
                </div>

                <div class="results-stats-row">
                    <div class="stat-pill">
                        <span class="stat-pill-label">SKOR ANDA</span>
                        <strong class="stat-pill-val">${pct}%</strong>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-pill-label">JAWABAN BENAR</span>
                        <strong class="stat-pill-val">${correctAnswers} dari ${total}</strong>
                    </div>
                    <div class="stat-pill">
                        <span class="stat-pill-label">STATUS</span>
                        <strong class="stat-pill-val" style="color: ${isPassed ? '#34d399' : '#f87171'};">
                            ${isPassed ? 'LULUS RESMI' : 'REMEDIAL'}
                        </strong>
                    </div>
                </div>

                <div class="license-certificate-box">
                    <div class="license-badge-icon">${isPassed ? '🛡️' : '🔒'}</div>
                    <div class="license-text">
                        <strong>${isPassed ? 'Identitas Detektif Resmi Terdaftar' : 'Akses Misi 1 Masih Terkunci'}</strong>
                        <p>${isPassed 
                            ? 'Selamat! Pemahaman konsep dasar Fakta vs Hoaks telah teruji. Sinar laser gerbang telah dibuka!' 
                            : 'Nilai minimal kelulusan adalah 80% (minimal 4 benar). Pelajari kembali perbedaan data dan fakta, lalu coba lagi!'}</p>
                    </div>
                </div>

                <div class="results-actions-row">
                    ${isPassed ? `
                        <button type="button" class="btn-action-primary" id="btn-gate-to-hub">
                            Buka Stasiun Misi 1 (Kembali ke Lobi) ➔
                        </button>
                    ` : `
                        <button type="button" class="btn-action-secondary" id="btn-gate-retry">
                            Ulangi Uji Lisensi ↺
                        </button>
                        <button type="button" class="btn-action-primary" id="btn-gate-to-hub">
                            Kembali ke Lobi
                        </button>
                    `}
                </div>
            </div>
        `;

        if (document.getElementById('btn-gate-retry')) {
            document.getElementById('btn-gate-retry').addEventListener('click', function () {
                currentQIdx = 0;
                correctAnswers = 0;
                studentAnswers = [];
                showQuestion();
            });
        }

        document.getElementById('btn-gate-to-hub').addEventListener('click', function () {
            if (isPassed && onFinishCallback) {
                onFinishCallback({
                    score: correctAnswers * 20,
                    stars: 3,
                    accuracy: pct,
                    storyClue: "Lisensi Detektif Terbit"
                });
            } else if (onExitCallback) {
                onExitCallback();
            }
        });
    }

    /**
     * Animation Loop
     */
    function animate() {
        animFrameId = requestAnimationFrame(animate);
        if (!sceneSetup) return;

        const dt = sceneSetup.clock.getDelta();
        const time = sceneSetup.clock.getElapsedTime();

        // Pulsing laser beams
        laserBeams.forEach(function (beam, idx) {
            beam.material.opacity = 0.75 + Math.sin(time * 4 + idx * 0.8) * 0.2;
        });

        // Floating ambient beacons
        floatingObjects.forEach(function (obj) {
            obj.mesh.position.y = obj.baseY + Math.sin(time * obj.speed) * obj.amp;
        });

        // Update particle systems
        for (let i = particleSystems.length - 1; i >= 0; i--) {
            const alive = particleSystems[i].update(dt);
            if (!alive) {
                particleSystems[i].dispose();
                particleSystems.splice(i, 1);
            }
        }

        sceneSetup.renderer.render(sceneSetup.scene, sceneSetup.camera);
    }

    function handleResize() {
        if (!sceneSetup || !activeContainer) return;
        const w = activeContainer.clientWidth || window.innerWidth;
        const h = activeContainer.clientHeight || window.innerHeight;
        sceneSetup.camera.aspect = w / h;
        sceneSetup.camera.updateProjectionMatrix();
        sceneSetup.renderer.setSize(w, h);
    }

    /**
     * Public Interface
     */
    const Level0Onboarding = {
        init: function (container, onComplete, onExit) {
            activeContainer = container;
            onFinishCallback = onComplete;
            onExitCallback = onExit;

            currentQIdx = 0;
            correctAnswers = 0;
            studentAnswers = [];
            isAnswering = false;
            particleSystems = [];
            floatingObjects = [];

            const budget = getDeviceBudget();
            sceneSetup = window.Engine3D.createScene(container, budget);
            sceneSetup.camera.position.set(0, 2.6, 5.0);
            sceneSetup.camera.lookAt(0, 2.4, -2.5);

            window.Engine3D.setupLighting(sceneSetup.scene, budget, 0xffffff, 0.75);

            buildEnvironment(sceneSetup.scene, budget);

            window.Engine3D.createHUD(container, {
                exitBtnId: 'btn-l0-exit',
                levelTag: 'GATE 0',
                title: 'Gerbang Keamanan: Registrasi Anggota',
                statsId: 'hud-3d-stats',
                statsHtml: '<span>❓ 1/5</span> <span>✅ 0</span>'
            });

            const exitBtn = container.querySelector('#btn-l0-exit');
            if (exitBtn) {
                exitBtn.addEventListener('click', function () {
                    if (onExitCallback) onExitCallback();
                });
            }

            window.addEventListener('resize', handleResize);
            showBriefing();
            animate();
        },

        dispose: function () {
            if (animFrameId) {
                cancelAnimationFrame(animFrameId);
                animFrameId = null;
            }
            if (feedbackTimer) clearTimeout(feedbackTimer);
            window.removeEventListener('resize', handleResize);

            particleSystems.forEach(function (ps) { ps.dispose(); });
            particleSystems = [];
            floatingObjects = [];
            laserBeams = [];
            gateGroup = null;

            if (sceneSetup) {
                window.Engine3D.disposeScene(sceneSetup);
                sceneSetup = null;
            }

            if (activeContainer) {
                activeContainer.innerHTML = '';
                activeContainer = null;
            }

            onFinishCallback = null;
            onExitCallback = null;
        }
    };

    window.Level0Onboarding = Level0Onboarding;
})();
