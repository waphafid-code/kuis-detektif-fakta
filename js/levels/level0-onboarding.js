/**
 * ============================================================
 * 🚪 LEVEL 0: 3D SECURITY CHECKPOINT (GATE WAJIB — C1 MENGINGAT)
 * ============================================================
 * Full 3D interactive security gate with laser barrier,
 * holographic terminal, floating 3D answer buttons,
 * and particle effects. Uses Engine3D shared utilities.
 * ============================================================
 */

(function () {
    'use strict';

    let activeContainer = null;
    let onFinishCallback = null;
    let onExitCallback = null;
    let sceneSetup = null;

    // Game state
    let currentQIdx = 0;
    let correctAnswers = 0;
    let studentAnswers = [];
    let isAnswering = false;
    let feedbackTimer = null;

    // 3D objects
    let gateGroup = null;
    let laserBeams = [];
    let terminalScreen = null;
    let answerButtons = [];
    let answerHitboxes = [];
    let mentorSprite = null;
    let progressBar = null;
    let progressFill = null;
    let particleSystems = [];
    let floatingObjects = [];

    // Camera
    let camAngle = 0;
    let camTargetAngle = 0;

    function getPlayerName() {
        return (window.GameStorage && window.GameStorage.getPlayerName()) || 'Detektif Muda';
    }

    function getDeviceBudget() {
        return (window.DeviceTier && window.DeviceTier.getBudget()) || {
            tier: 'low', shadows: false, pixelRatio: 1.0, antialias: false
        };
    }

    /**
     * Build the 3D security checkpoint environment
     */
    function buildEnvironment(scene, budget) {
        const E = window.Engine3D;

        // Floor
        const floor = E.createFloor(20, 0x0c1222, 0x1a2744, budget);
        scene.add(floor);

        // === GATE PILLARS ===
        gateGroup = new THREE.Group();
        gateGroup.position.set(0, 0, -4);

        // Left pillar
        const pillarGeo = new THREE.CylinderGeometry(0.25, 0.3, 4.5, 8);
        const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
        const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
        leftPillar.position.set(-2, 2.25, 0);
        leftPillar.castShadow = budget.shadows;
        gateGroup.add(leftPillar);

        // Right pillar
        const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
        rightPillar.position.set(2, 2.25, 0);
        rightPillar.castShadow = budget.shadows;
        gateGroup.add(rightPillar);

        // Top beam
        const topGeo = new THREE.BoxGeometry(4.5, 0.3, 0.3);
        const topMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.3 });
        const topBeam = new THREE.Mesh(topGeo, topMat);
        topBeam.position.set(0, 4.5, 0);
        gateGroup.add(topBeam);

        // Status light on top (changes green when gate opens)
        const statusGeo = new THREE.SphereGeometry(0.15, 8, 8);
        const statusMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const statusLight = new THREE.Mesh(statusGeo, statusMat);
        statusLight.position.set(0, 4.8, 0);
        gateGroup.add(statusLight);
        gateGroup.userData.statusLight = statusLight;

        // Laser beams (horizontal lines across gate - 5 beams)
        laserBeams = [];
        for (let i = 0; i < 5; i++) {
            const laserGeo = new THREE.CylinderGeometry(0.02, 0.02, 3.8, 6);
            const laserMat = new THREE.MeshBasicMaterial({
                color: 0xef4444,
                transparent: true,
                opacity: 0.85
            });
            const laser = new THREE.Mesh(laserGeo, laserMat);
            laser.rotation.z = Math.PI / 2;
            laser.position.set(0, 0.8 + i * 0.8, 0);
            gateGroup.add(laser);
            laserBeams.push(laser);
        }

        // Neon rings on pillar tops
        const ringL = E.createNeonRing(0.35, 0xef4444);
        ringL.position.set(-2, 4.6, 0);
        ringL.rotation.x = Math.PI / 2;
        gateGroup.add(ringL);
        gateGroup.userData.ringL = ringL;

        const ringR = E.createNeonRing(0.35, 0xef4444);
        ringR.position.set(2, 4.6, 0);
        ringR.rotation.x = Math.PI / 2;
        gateGroup.add(ringR);
        gateGroup.userData.ringR = ringR;

        scene.add(gateGroup);

        // === SCANNER TERMINAL (in front of gate) ===
        const termGroup = new THREE.Group();
        termGroup.position.set(0, 0, 1);

        // Terminal desk
        const deskGeo = new THREE.BoxGeometry(2.2, 1.0, 1.0);
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 });
        const desk = new THREE.Mesh(deskGeo, deskMat);
        desk.position.y = 0.5;
        desk.castShadow = budget.shadows;
        desk.receiveShadow = budget.shadows;
        termGroup.add(desk);

        // Terminal screen (CanvasTexture - shows questions)
        const screenGeo = new THREE.PlaneGeometry(2.0, 1.2);
        const screenCanvas = document.createElement('canvas');
        screenCanvas.width = 512;
        screenCanvas.height = 320;
        const screenTex = new THREE.CanvasTexture(screenCanvas);
        screenTex.minFilter = THREE.LinearFilter;
        screenTex.generateMipmaps = false;
        const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, side: THREE.DoubleSide });
        terminalScreen = new THREE.Mesh(screenGeo, screenMat);
        terminalScreen.position.set(0, 1.7, -0.3);
        terminalScreen.rotation.x = -0.15;
        terminalScreen.userData._texture = screenTex;
        terminalScreen.userData._canvas = screenCanvas;
        termGroup.add(terminalScreen);

        // Screen frame
        const frameGeo = new THREE.BoxGeometry(2.15, 1.35, 0.08);
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.set(0, 1.7, -0.33);
        frame.rotation.x = -0.15;
        termGroup.add(frame);

        scene.add(termGroup);

        // === PROGRESS BAR (3D cylinder) ===
        const pgGroup = new THREE.Group();
        pgGroup.position.set(0, 0.15, 2.5);

        const pgBgGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.0, 8);
        const pgBgMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const pgBg = new THREE.Mesh(pgBgGeo, pgBgMat);
        pgBg.rotation.z = Math.PI / 2;
        pgGroup.add(pgBg);

        const pgFillGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.01, 8);
        const pgFillMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
        progressFill = new THREE.Mesh(pgFillGeo, pgFillMat);
        progressFill.rotation.z = Math.PI / 2;
        progressFill.position.set(-1.5, 0, 0);
        pgGroup.add(progressFill);
        progressBar = pgGroup;

        scene.add(pgGroup);

        // === MENTOR HOLOGRAM (Bu Maya) ===
        mentorSprite = E.createTextSprite('👩‍💼 Bu Maya — Kepala Divisi', {
            fontSize: 22,
            canvasWidth: 384,
            canvasHeight: 96,
            bgColor: 'rgba(15, 23, 42, 0.8)',
            borderColor: 'rgba(168, 85, 247, 0.6)',
            color: '#e0e7ff',
            scaleX: 2.5,
            scaleY: 0.6
        });
        mentorSprite.position.set(-3, 2.5, 0);
        scene.add(mentorSprite);
        floatingObjects.push({ mesh: mentorSprite, baseY: 2.5, speed: 1.5, amp: 0.08 });

        // === AMBIENT DECORATION ===
        // Side barriers
        for (let side = -1; side <= 1; side += 2) {
            const barrierGeo = new THREE.BoxGeometry(0.15, 1.0, 6);
            const barrierMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f, metalness: 0.4 });
            const barrier = new THREE.Mesh(barrierGeo, barrierMat);
            barrier.position.set(side * 4.5, 0.5, -1);
            scene.add(barrier);
        }

        // Small light pillars
        for (let i = 0; i < 4; i++) {
            const lx = (i < 2 ? -3.5 : 3.5);
            const lz = (i % 2 === 0 ? -2 : 2);
            const lpGeo = new THREE.CylinderGeometry(0.1, 0.12, 2.0, 6);
            const lpMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
            const lp = new THREE.Mesh(lpGeo, lpMat);
            lp.position.set(lx, 1.0, lz);
            scene.add(lp);

            const bulbGeo = new THREE.SphereGeometry(0.12, 6, 6);
            const bulbMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 });
            const bulb = new THREE.Mesh(bulbGeo, bulbMat);
            bulb.position.set(lx, 2.1, lz);
            scene.add(bulb);
            floatingObjects.push({ mesh: bulb, baseY: 2.1, speed: 2 + i * 0.3, amp: 0.05 });
        }
    }

    /**
     * Create 4 floating answer buttons
     */
    function createAnswerButtons(scene, options) {
        const E = window.Engine3D;
        answerButtons = [];
        answerHitboxes = [];

        const colors = [0x3b82f6, 0x8b5cf6, 0xf59e0b, 0x10b981];
        const labels = ['A', 'B', 'C', 'D'];

        for (let i = 0; i < 4; i++) {
            const row = Math.floor(i / 2);
            const col = i % 2;
            const x = (col - 0.5) * 3.0;
            const z = 3.5 + row * 1.6;
            const y = 1.0;

            const btn = new THREE.Group();

            // Button body
            const bodyGeo = new THREE.BoxGeometry(2.6, 0.55, 0.18);
            const bodyMat = new THREE.MeshStandardMaterial({
                color: colors[i],
                emissive: colors[i],
                emissiveIntensity: 0.3,
                roughness: 0.35,
                metalness: 0.15,
                transparent: true,
                opacity: 0.92
            });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            btn.add(body);

            // Label prefix (A, B, C, D)
            const prefixSprite = E.createTextSprite(labels[i], {
                fontSize: 36,
                canvasWidth: 64,
                canvasHeight: 64,
                bgColor: 'transparent',
                borderColor: 'transparent',
                color: '#ffffff',
                scaleX: 0.35,
                scaleY: 0.35
            });
            prefixSprite.position.set(-1.05, 0, 0.12);
            btn.add(prefixSprite);

            // Answer text sprite (updated per question)
            const textSprite = E.createTextSprite('...', {
                fontSize: 18,
                canvasWidth: 384,
                canvasHeight: 80,
                bgColor: 'transparent',
                borderColor: 'transparent',
                color: '#ffffff',
                scaleX: 2.0,
                scaleY: 0.45
            });
            textSprite.position.set(0.15, 0, 0.12);
            btn.add(textSprite);

            btn.position.set(x, y, z);
            btn.userData = {
                index: i,
                bodyMesh: body,
                bodyMat: bodyMat,
                textSprite: textSprite,
                originalColor: colors[i],
                baseY: y
            };

            // Invisible hitbox for raycasting
            const hitGeo = new THREE.BoxGeometry(2.8, 0.7, 0.4);
            const hitMat = new THREE.MeshBasicMaterial({ visible: false });
            const hitbox = new THREE.Mesh(hitGeo, hitMat);
            hitbox.position.copy(btn.position);
            hitbox.userData.btnIndex = i;

            scene.add(btn);
            scene.add(hitbox);
            answerButtons.push(btn);
            answerHitboxes.push(hitbox);
            floatingObjects.push({ mesh: btn, baseY: y, speed: 1.8 + i * 0.2, amp: 0.04 });
        }
    }

    /**
     * Update terminal screen with current question text
     */
    function updateTerminalScreen(text, subtitle) {
        if (!terminalScreen || !terminalScreen.userData._canvas) return;
        const canvas = terminalScreen.userData._canvas;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 512, 320);

        // Background
        ctx.fillStyle = '#0a0e1a';
        ctx.fillRect(0, 0, 512, 320);

        // Border glow
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.strokeRect(4, 4, 504, 312);

        // Scanline effect
        ctx.fillStyle = 'rgba(56, 189, 248, 0.03)';
        for (let i = 0; i < 320; i += 4) {
            ctx.fillRect(0, i, 512, 2);
        }

        // Subtitle
        if (subtitle) {
            ctx.fillStyle = '#38bdf8';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(subtitle, 256, 30);
        }

        // Main text with word wrap
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';

        const words = text.split(' ');
        let lines = [];
        let currentLine = '';
        const maxWidth = 460;
        words.forEach(function (word) {
            const test = currentLine + (currentLine ? ' ' : '') + word;
            if (ctx.measureText(test).width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = test;
            }
        });
        if (currentLine) lines.push(currentLine);

        const lineHeight = 24;
        const startY = 70 + Math.max(0, (200 - lines.length * lineHeight) / 2);
        lines.forEach(function (line, idx) {
            ctx.fillText(line, 256, startY + idx * lineHeight);
        });

        terminalScreen.userData._texture.needsUpdate = true;
    }

    /**
     * Update answer button text
     */
    function updateAnswerButtonText(btnGroup, text) {
        const sprite = btnGroup.userData.textSprite;
        if (!sprite || !sprite.userData._texture) return;

        const canvas = sprite.userData._texture.image;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Word wrap
        const maxW = w - 20;
        const words = text.split(' ');
        let lines = [];
        let cl = '';
        words.forEach(function (word) {
            const t = cl + (cl ? ' ' : '') + word;
            if (ctx.measureText(t).width > maxW && cl) {
                lines.push(cl);
                cl = word;
            } else {
                cl = t;
            }
        });
        if (cl) lines.push(cl);

        const lh = 18;
        const sy = h / 2 - ((lines.length - 1) * lh) / 2;
        lines.forEach(function (l, i) {
            ctx.fillText(l, w / 2, sy + i * lh);
        });

        sprite.userData._texture.needsUpdate = true;
    }

    /**
     * Update progress bar
     */
    function updateProgressBar(fraction) {
        if (!progressFill) return;
        const length = Math.max(0.01, fraction * 3.0);
        progressFill.geometry.dispose();
        progressFill.geometry = new THREE.CylinderGeometry(0.09, 0.09, length, 8);
        progressFill.position.x = -1.5 + length / 2;

        if (fraction >= 1.0) {
            progressFill.material.color.setHex(0x22c55e);
        } else if (fraction >= 0.6) {
            progressFill.material.color.setHex(0xfbbf24);
        } else {
            progressFill.material.color.setHex(0x3b82f6);
        }
    }

    // ====== GAME FLOW ======

    function showBriefing() {
        const dialog = window.LEVEL_0_DIALOG;
        const playerName = getPlayerName();
        const p1 = dialog ? dialog.dialogPembuka[0].replace(/{playerName}/g, playerName) : 'Halo ' + playerName + ', selamat datang!';

        updateTerminalScreen(p1, '🔒 GATE SECURITY — BRIEFING');

        // Show "Start" prompt on buttons
        answerButtons.forEach(function (btn, i) {
            btn.visible = (i === 0);
        });
        answerHitboxes.forEach(function (hb, i) {
            hb.visible = (i === 0);
        });

        if (answerButtons[0]) {
            updateAnswerButtonText(answerButtons[0], '▶ MULAI TES LISENSI');
            answerButtons[0].userData.bodyMat.color.setHex(0x22c55e);
            answerButtons[0].userData.bodyMat.emissive.setHex(0x22c55e);
        }

        isAnswering = false;
    }

    function showQuestion() {
        const data = window.LEVEL_0_DATA;
        if (!data || !data.questions) return;

        if (currentQIdx >= data.questions.length) {
            showResults();
            return;
        }

        const q = data.questions[currentQIdx];
        const total = data.questions.length;

        updateTerminalScreen(q.text, 'PERTANYAAN ' + (currentQIdx + 1) + ' / ' + total);

        // Show all 4 buttons with answer options
        answerButtons.forEach(function (btn, i) {
            btn.visible = (i < q.options.length);
            if (i < q.options.length) {
                updateAnswerButtonText(btn, q.options[i]);
                btn.userData.bodyMat.color.setHex(btn.userData.originalColor);
                btn.userData.bodyMat.emissive.setHex(btn.userData.originalColor);
                btn.userData.bodyMat.emissiveIntensity = 0.3;
                btn.userData.bodyMat.opacity = 0.92;
            }
        });
        answerHitboxes.forEach(function (hb, i) {
            hb.visible = (i < q.options.length);
        });

        updateProgressBar(currentQIdx / total);

        // Update HUD
        var statsEl = activeContainer.querySelector('#hud-3d-stats');
        if (statsEl) {
            statsEl.innerHTML = '<span>❓ ' + (currentQIdx + 1) + '/' + total + '</span> <span>✅ ' + correctAnswers + '</span>';
        }

        isAnswering = true;
    }

    function handleAnswerClick(btnIndex) {
        if (!isAnswering) {
            // Briefing screen "start" button
            if (btnIndex === 0) {
                currentQIdx = 0;
                correctAnswers = 0;
                studentAnswers = [];
                showQuestion();
            }
            return;
        }

        isAnswering = false;
        const data = window.LEVEL_0_DATA;
        const q = data.questions[currentQIdx];
        const correctIdx = (q.correct !== undefined) ? q.correct : q.answer;
        const isCorrect = (btnIndex === correctIdx);

        if (isCorrect) {
            correctAnswers++;
            if (window.GameUI) window.GameUI.playSynth('success');
        } else {
            if (window.GameUI) window.GameUI.playSynth('error');
        }

        studentAnswers.push({ qId: q.id, chosen: btnIndex, correct: isCorrect });

        // Visual feedback on buttons
        answerButtons.forEach(function (btn, i) {
            if (i === correctIdx) {
                btn.userData.bodyMat.color.setHex(0x22c55e);
                btn.userData.bodyMat.emissive.setHex(0x22c55e);
                btn.userData.bodyMat.emissiveIntensity = 0.6;
            } else if (i === btnIndex && !isCorrect) {
                btn.userData.bodyMat.color.setHex(0xef4444);
                btn.userData.bodyMat.emissive.setHex(0xef4444);
                btn.userData.bodyMat.emissiveIntensity = 0.6;
            } else {
                btn.userData.bodyMat.opacity = 0.3;
            }
        });

        // Particle burst
        var burstColor = isCorrect ? 0x22c55e : 0xef4444;
        var burstPos = answerButtons[btnIndex].position.clone();
        burstPos.y += 0.3;
        var burst = window.Engine3D.createParticleBurst(sceneSetup.scene, burstPos, burstColor, 20);
        particleSystems.push(burst);

        // Flash terminal
        updateTerminalScreen(isCorrect ? '✅ TEPAT!' : '❌ BELUM TEPAT', q.explanation);

        // Show feedback overlay
        window.Engine3D.showFeedback3D(
            activeContainer,
            isCorrect,
            isCorrect ? 'TEPAT SEKALI!' : 'BELUM TEPAT',
            q.explanation,
            2200
        );

        // Auto-advance
        if (feedbackTimer) clearTimeout(feedbackTimer);
        feedbackTimer = setTimeout(function () {
            currentQIdx++;
            showQuestion();
        }, 2500);
    }

    function showResults() {
        const data = window.LEVEL_0_DATA;
        const dialog = window.LEVEL_0_DIALOG;
        const totalQ = data.questions.length;
        const scorePct = Math.round((correctAnswers / totalQ) * 100);
        const isPassed = scorePct >= data.passingScore;

        updateProgressBar(1.0);

        // Open gate animation if passed
        if (isPassed) {
            openGate();
        }

        // Determine debrief text
        let debriefKey = 'low';
        if (scorePct >= 80) debriefKey = 'high';
        else if (scorePct >= 60) debriefKey = 'medium';
        const debriefLines = dialog ? dialog.dialogPenutup[debriefKey] : ['Evaluasi selesai.'];
        const playerName = getPlayerName();
        const debriefText = debriefLines.map(function (l) {
            return l.replace(/{playerName}/g, playerName);
        }).join(' ');

        updateTerminalScreen(
            (isPassed ? '🎖️ LISENSI DETEKTIF TERBIT!' : '📑 BELUM MEMENUHI SYARAT') +
            ' — Skor: ' + scorePct + '% (' + correctAnswers + '/' + totalQ + ')',
            debriefText
        );

        // Show action buttons
        answerButtons.forEach(function (btn, i) {
            btn.visible = false;
        });
        answerHitboxes.forEach(function (hb, i) {
            hb.visible = false;
        });

        // Show result action button
        if (isPassed) {
            answerButtons[0].visible = true;
            answerHitboxes[0].visible = true;
            updateAnswerButtonText(answerButtons[0], '🚀 Buka Stasiun Level 1 ➔');
            answerButtons[0].userData.bodyMat.color.setHex(0x22c55e);
            answerButtons[0].userData.bodyMat.emissive.setHex(0x22c55e);
            answerButtons[0].userData.bodyMat.emissiveIntensity = 0.5;
            answerButtons[0].userData.bodyMat.opacity = 1.0;

            isAnswering = false;
            // Override click handler for finish
            answerButtons[0].userData._finishAction = true;
        } else {
            answerButtons[0].visible = true;
            answerHitboxes[0].visible = true;
            updateAnswerButtonText(answerButtons[0], '🔄 Ulangi Tes Lisensi');
            answerButtons[0].userData.bodyMat.color.setHex(0xf59e0b);
            answerButtons[0].userData.bodyMat.emissive.setHex(0xf59e0b);
            answerButtons[0].userData.bodyMat.emissiveIntensity = 0.5;
            answerButtons[0].userData.bodyMat.opacity = 1.0;

            isAnswering = false;
            answerButtons[0].userData._retryAction = true;
        }

        // Update HUD
        var statsEl = activeContainer.querySelector('#hud-3d-stats');
        if (statsEl) {
            statsEl.innerHTML = '<span>📊 ' + scorePct + '%</span> <span>' + (isPassed ? '✅ LULUS' : '❌ GAGAL') + '</span>';
        }
    }

    function openGate() {
        // Animate laser beams disappearing
        laserBeams.forEach(function (laser, i) {
            setTimeout(function () {
                laser.visible = false;
                // Particle burst at laser position
                var pos = new THREE.Vector3(0, laser.position.y, gateGroup.position.z);
                var burst = window.Engine3D.createParticleBurst(sceneSetup.scene, pos, 0x22c55e, 8);
                particleSystems.push(burst);
            }, i * 200);
        });

        // Change gate status light to green
        setTimeout(function () {
            var sl = gateGroup.userData.statusLight;
            if (sl) sl.material.color.setHex(0x22c55e);
            var rl = gateGroup.userData.ringL;
            if (rl) rl.material.color.setHex(0x22c55e);
            var rr = gateGroup.userData.ringR;
            if (rr) rr.material.color.setHex(0x22c55e);
        }, 1200);
    }

    // ====== INPUT HANDLING ======

    function setupInput() {
        if (!sceneSetup || !sceneSetup.renderer) return;
        const dom = sceneSetup.renderer.domElement;

        let pointerDownX = 0, pointerDownY = 0, pointerDownTime = 0, isDragging = false;

        dom.addEventListener('pointerdown', function (e) {
            pointerDownX = e.clientX;
            pointerDownY = e.clientY;
            pointerDownTime = performance.now();
            isDragging = false;
        }, { passive: true });

        dom.addEventListener('pointermove', function (e) {
            if (pointerDownTime > 0) {
                var dx = e.clientX - pointerDownX;
                if (Math.abs(dx) > 10) {
                    isDragging = true;
                    camTargetAngle += dx * 0.003;
                    pointerDownX = e.clientX;
                }
            }
        }, { passive: true });

        dom.addEventListener('pointerup', function (e) {
            var dur = performance.now() - pointerDownTime;
            pointerDownTime = 0;
            if (dur < 400 && !isDragging) {
                onTap(e);
            }
            isDragging = false;
        }, { passive: true });
    }

    function onTap(event) {
        if (!sceneSetup) return;
        var hits = window.Engine3D.raycastObjects(
            event, activeContainer, sceneSetup.camera, answerHitboxes
        );

        if (hits.length > 0) {
            var hitObj = hits[0].object;
            var idx = hitObj.userData.btnIndex;

            // Check special actions
            if (answerButtons[idx] && answerButtons[idx].userData._finishAction) {
                // Finish level
                if (onFinishCallback) {
                    var data = window.LEVEL_0_DATA;
                    var dialog = window.LEVEL_0_DIALOG;
                    var totalQ = data.questions.length;
                    var scorePct = Math.round((correctAnswers / totalQ) * 100);
                    onFinishCallback({
                        score: scorePct,
                        stars: 3,
                        passed: true,
                        storyClue: dialog ? dialog.storyClue : null
                    });
                }
                return;
            }

            if (answerButtons[idx] && answerButtons[idx].userData._retryAction) {
                // Reset retry flag
                answerButtons[idx].userData._retryAction = false;
                currentQIdx = 0;
                correctAnswers = 0;
                studentAnswers = [];
                // Re-open gate
                laserBeams.forEach(function (l) { l.visible = true; });
                var sl = gateGroup.userData.statusLight;
                if (sl) sl.material.color.setHex(0xef4444);
                var rl = gateGroup.userData.ringL;
                if (rl) rl.material.color.setHex(0xef4444);
                var rr = gateGroup.userData.ringR;
                if (rr) rr.material.color.setHex(0xef4444);
                showQuestion();
                return;
            }

            handleAnswerClick(idx);
        }
    }

    // ====== ANIMATION LOOP ======

    function animate() {
        if (!sceneSetup || !sceneSetup.renderer) return;
        sceneSetup.animFrameId = requestAnimationFrame(animate);

        var dt = sceneSetup.clock.getDelta();
        dt = Math.min(dt, 0.1);
        var elapsed = sceneSetup.clock.getElapsedTime();

        // Camera orbit (subtle auto + user drag)
        camAngle += (camTargetAngle - camAngle) * 0.06;
        var camDist = 10;
        var camPitch = 0.45;
        var cx = Math.cos(camAngle) * Math.cos(camPitch) * camDist;
        var cy = Math.sin(camPitch) * camDist + 1.5;
        var cz = Math.sin(camAngle) * Math.cos(camPitch) * camDist;
        sceneSetup.camera.position.set(cx, cy, cz);
        sceneSetup.camera.lookAt(0, 1.2, 0);

        // Float animations
        floatingObjects.forEach(function (fo) {
            if (fo.mesh && fo.mesh.visible) {
                fo.mesh.position.y = fo.baseY + Math.sin(elapsed * fo.speed) * fo.amp;
            }
        });

        // Laser beam pulse
        laserBeams.forEach(function (laser, i) {
            if (laser.visible) {
                laser.material.opacity = 0.5 + 0.35 * Math.sin(elapsed * 3 + i * 0.8);
            }
        });

        // Particle systems
        for (var pi = particleSystems.length - 1; pi >= 0; pi--) {
            var alive = particleSystems[pi].update(dt);
            if (!alive) {
                particleSystems[pi].dispose();
                particleSystems.splice(pi, 1);
            }
        }

        sceneSetup.renderer.render(sceneSetup.scene, sceneSetup.camera);
    }

    function handleResize() {
        if (!sceneSetup || !activeContainer) return;
        var w = activeContainer.clientWidth || window.innerWidth;
        var h = activeContainer.clientHeight || window.innerHeight;
        sceneSetup.camera.aspect = w / h;
        sceneSetup.camera.updateProjectionMatrix();
        sceneSetup.renderer.setSize(w, h);
    }

    // ====== PUBLIC API ======

    var Level0Onboarding = {
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

            container.innerHTML = '';
            container.style.position = 'relative';

            var budget = getDeviceBudget();

            // Create 3D scene
            sceneSetup = window.Engine3D.createScene(container, budget);
            window.Engine3D.setupLighting(sceneSetup.scene, budget, 0xc0d0ff, 0.5);

            // Build environment
            buildEnvironment(sceneSetup.scene, budget);
            createAnswerButtons(sceneSetup.scene);

            // HUD overlay
            window.Engine3D.createHUD(container, {
                exitBtnId: 'btn-l0-exit',
                levelTag: 'GATE 0',
                title: 'Gerbang Keamanan',
                statsId: 'hud-3d-stats',
                statsHtml: '<span>Briefing</span>'
            });

            // Exit button handler
            var exitBtn = container.querySelector('#btn-l0-exit');
            if (exitBtn) {
                exitBtn.addEventListener('click', function () {
                    if (onExitCallback) onExitCallback();
                });
            }

            // Input
            setupInput();

            // Resize
            window.addEventListener('resize', handleResize);

            // Show briefing
            showBriefing();

            // Start animation
            animate();
        },

        dispose: function () {
            if (feedbackTimer) clearTimeout(feedbackTimer);
            window.removeEventListener('resize', handleResize);

            // Cleanup particles
            particleSystems.forEach(function (ps) { ps.dispose(); });
            particleSystems = [];
            floatingObjects = [];

            answerButtons = [];
            answerHitboxes = [];
            gateGroup = null;
            laserBeams = [];
            terminalScreen = null;
            progressBar = null;
            progressFill = null;
            mentorSprite = null;

            window.Engine3D.disposeScene(sceneSetup);
            sceneSetup = null;

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
