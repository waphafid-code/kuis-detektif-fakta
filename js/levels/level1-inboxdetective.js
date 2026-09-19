/**
 * ============================================================
 * 🕵️ LEVEL 1: 3D FORENSIC DESK (ATP 1.1-1.2 — C3 MENERAPKAN)
 * ============================================================
 * Full 3D cyberpunk forensic desk: documents as 3D envelopes,
 * 3 forensic tools, 2 decision trays, and a big monitor.
 * ============================================================
 */

(function () {
    'use strict';

    let activeContainer = null;
    let onFinishCallback = null;
    let onExitCallback = null;
    let sceneSetup = null;

    // State
    let docQueue = [];
    let currentDocIdx = 0;
    let currentDoc = null;
    let testsRevealed = { domain: false, metadata: false, media: false };
    let correctCount = 0;
    let wrongCount = 0;
    let phase = 'idle'; // idle, inspecting, decided
    let particleSystems = [];
    let floatingObjects = [];

    // 3D Objects
    let monitorScreen = null;
    let docEnvelopes = [];
    let toolMeshes = [];    // [domain, metadata, media]
    let toolHitboxes = [];
    let trayFakta = null;
    let trayHoaks = null;
    let trayHitboxes = [];
    let activeEnvelope = null;
    let scoreSprite = null;

    // Camera
    let camAngle = 0.3;
    let camTargetAngle = 0.3;

    function getDeviceBudget() {
        return (window.DeviceTier && window.DeviceTier.getBudget()) || {
            tier: 'low', shadows: false, pixelRatio: 1.0, antialias: false
        };
    }

    function buildEnvironment(scene, budget) {
        const E = window.Engine3D;

        // Floor - dark cyberpunk
        const floor = E.createFloor(18, 0x0a0f1e, 0x162040, budget);
        scene.add(floor);

        // === FORENSIC DESK (center) ===
        const deskGeo = new THREE.BoxGeometry(5, 0.15, 3);
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 });
        const desk = new THREE.Mesh(deskGeo, deskMat);
        desk.position.set(0, 0.85, 0);
        desk.castShadow = budget.shadows;
        desk.receiveShadow = budget.shadows;
        scene.add(desk);

        // Desk legs
        const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.85, 6);
        const legMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
        [[-2.2, -1.2], [2.2, -1.2], [-2.2, 1.2], [2.2, 1.2]].forEach(function (pos) {
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(pos[0], 0.425, pos[1]);
            scene.add(leg);
        });

        // === BIG MONITOR (behind desk) ===
        // Monitor frame
        const mFrameGeo = new THREE.BoxGeometry(4.5, 2.8, 0.12);
        const mFrameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.2 });
        const mFrame = new THREE.Mesh(mFrameGeo, mFrameMat);
        mFrame.position.set(0, 2.6, -2.5);
        scene.add(mFrame);

        // Monitor stand
        const standGeo = new THREE.CylinderGeometry(0.08, 0.12, 1.2, 8);
        const standMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
        const stand = new THREE.Mesh(standGeo, standMat);
        stand.position.set(0, 1.6, -2.5);
        scene.add(stand);

        // Monitor screen (CanvasTexture)
        const screenGeo = new THREE.PlaneGeometry(4.2, 2.5);
        const screenCanvas = document.createElement('canvas');
        screenCanvas.width = 640;
        screenCanvas.height = 384;
        const screenTex = new THREE.CanvasTexture(screenCanvas);
        screenTex.minFilter = THREE.LinearFilter;
        screenTex.generateMipmaps = false;
        const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
        monitorScreen = new THREE.Mesh(screenGeo, screenMat);
        monitorScreen.position.set(0, 2.6, -2.43);
        monitorScreen.userData._texture = screenTex;
        monitorScreen.userData._canvas = screenCanvas;
        scene.add(monitorScreen);

        // === FORENSIC TOOLS (on desk) ===
        const toolConfigs = [
            { name: '🔍 Cek Domain', key: 'domain', color: 0x3b82f6, x: -1.6 },
            { name: '📅 Cek Metadata', key: 'metadata', color: 0x8b5cf6, x: 0 },
            { name: '📰 Verifikasi Media', key: 'media', color: 0xf59e0b, x: 1.6 }
        ];

        toolMeshes = [];
        toolHitboxes = [];

        toolConfigs.forEach(function (cfg) {
            const tGroup = new THREE.Group();
            tGroup.position.set(cfg.x, 1.15, 1.0);

            // Tool body
            const tGeo = new THREE.BoxGeometry(1.2, 0.4, 0.6);
            const tMat = new THREE.MeshStandardMaterial({
                color: cfg.color,
                emissive: cfg.color,
                emissiveIntensity: 0.25,
                roughness: 0.4, metalness: 0.2
            });
            const tMesh = new THREE.Mesh(tGeo, tMat);
            tGroup.add(tMesh);

            // Tool label
            const label = E.createTextSprite(cfg.name, {
                fontSize: 20,
                canvasWidth: 192,
                canvasHeight: 48,
                bgColor: 'transparent',
                borderColor: 'transparent',
                color: '#ffffff',
                scaleX: 1.1,
                scaleY: 0.28
            });
            label.position.set(0, 0.4, 0);
            tGroup.add(label);

            tGroup.userData.toolKey = cfg.key;
            tGroup.userData.bodyMat = tMat;
            scene.add(tGroup);
            toolMeshes.push(tGroup);

            // Hitbox
            const hitGeo = new THREE.BoxGeometry(1.4, 0.6, 0.8);
            const hitMat = new THREE.MeshBasicMaterial({ visible: false });
            const hitbox = new THREE.Mesh(hitGeo, hitMat);
            hitbox.position.copy(tGroup.position);
            hitbox.userData.toolKey = cfg.key;
            scene.add(hitbox);
            toolHitboxes.push(hitbox);

            floatingObjects.push({ mesh: tGroup, baseY: 1.15, speed: 1.5, amp: 0.03 });
        });

        // === DECISION TRAYS ===
        // Fakta tray (green, left)
        trayFakta = buildTray(scene, -3.2, 0x22c55e, '✅ FAKTA VALID', budget);
        // Hoaks tray (red, right)
        trayHoaks = buildTray(scene, 3.2, 0xef4444, '❌ HOAKS/PALSU', budget);

        trayHitboxes = [];
        // Fakta hitbox
        var fHitGeo = new THREE.BoxGeometry(2.2, 1.5, 2.0);
        var fHitMat = new THREE.MeshBasicMaterial({ visible: false });
        var fHit = new THREE.Mesh(fHitGeo, fHitMat);
        fHit.position.set(-3.2, 0.75, 0);
        fHit.userData.decision = 'fakta';
        scene.add(fHit);
        trayHitboxes.push(fHit);

        var hHit = new THREE.Mesh(fHitGeo, fHitMat.clone());
        hHit.position.set(3.2, 0.75, 0);
        hHit.userData.decision = 'hoaks';
        scene.add(hHit);
        trayHitboxes.push(hHit);

        // === SIDE DECORATION ===
        // Rack shelves
        for (var side = -1; side <= 1; side += 2) {
            var rackGeo = new THREE.BoxGeometry(0.3, 3.5, 2.0);
            var rackMat = new THREE.MeshStandardMaterial({ color: 0x1a2744, metalness: 0.3 });
            var rack = new THREE.Mesh(rackGeo, rackMat);
            rack.position.set(side * 6.5, 1.75, -1);
            scene.add(rack);

            for (var s = 0; s < 3; s++) {
                var shelfGeo = new THREE.BoxGeometry(1.5, 0.06, 1.8);
                var shelfMat = new THREE.MeshStandardMaterial({ color: 0x1e3a5f });
                var shelf = new THREE.Mesh(shelfGeo, shelfMat);
                shelf.position.set(side * 6, 0.7 + s * 1.1, -1);
                scene.add(shelf);
            }
        }

        // Neon edge on desk
        var neonRing = E.createNeonRing(0.6, 0x38bdf8);
        neonRing.position.set(0, 0.87, 0);
        neonRing.rotation.x = Math.PI / 2;
        scene.add(neonRing);
        floatingObjects.push({ mesh: neonRing, baseY: 0.87, speed: 1, amp: 0.02 });

        // Mentor sprite
        var mentorSprite = E.createTextSprite('🕵️ Pak Detektif — Mentor Forensik', {
            fontSize: 18,
            canvasWidth: 384,
            canvasHeight: 80,
            bgColor: 'rgba(15, 23, 42, 0.8)',
            borderColor: 'rgba(59, 130, 246, 0.6)',
            color: '#bfdbfe',
            scaleX: 2.5,
            scaleY: 0.5
        });
        mentorSprite.position.set(4, 3.5, -2);
        scene.add(mentorSprite);
        floatingObjects.push({ mesh: mentorSprite, baseY: 3.5, speed: 1.2, amp: 0.06 });

        // Score display
        scoreSprite = E.createTextSprite('Dokumen: 0/12 — ✅0 ❌0', {
            fontSize: 20,
            canvasWidth: 384,
            canvasHeight: 64,
            bgColor: 'rgba(15, 23, 42, 0.85)',
            borderColor: 'rgba(34, 197, 94, 0.5)',
            color: '#a7f3d0',
            scaleX: 3.0,
            scaleY: 0.5
        });
        scoreSprite.position.set(0, 4.2, 0);
        scene.add(scoreSprite);
    }

    function buildTray(scene, x, color, label, budget) {
        var tGroup = new THREE.Group();
        tGroup.position.set(x, 0, 0);

        // Tray base
        var baseGeo = new THREE.BoxGeometry(1.8, 0.12, 1.5);
        var baseMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.3 });
        var base = new THREE.Mesh(baseGeo, baseMat);
        base.position.y = 0.5;
        tGroup.add(base);

        // Tray walls
        var wallGeo = new THREE.BoxGeometry(1.8, 0.5, 0.06);
        var wallMat = new THREE.MeshStandardMaterial({ color: color, transparent: true, opacity: 0.5 });
        var back = new THREE.Mesh(wallGeo, wallMat);
        back.position.set(0, 0.75, -0.72);
        tGroup.add(back);
        var front = new THREE.Mesh(wallGeo, wallMat);
        front.position.set(0, 0.75, 0.72);
        tGroup.add(front);

        var sideGeo = new THREE.BoxGeometry(0.06, 0.5, 1.5);
        var left = new THREE.Mesh(sideGeo, wallMat);
        left.position.set(-0.87, 0.75, 0);
        tGroup.add(left);
        var right = new THREE.Mesh(sideGeo, wallMat);
        right.position.set(0.87, 0.75, 0);
        tGroup.add(right);

        // Label
        var E = window.Engine3D;
        var labelSp = E.createTextSprite(label, {
            fontSize: 22,
            canvasWidth: 256,
            canvasHeight: 64,
            bgColor: 'rgba(0,0,0,0.7)',
            borderColor: 'transparent',
            color: '#ffffff',
            scaleX: 1.8,
            scaleY: 0.45
        });
        labelSp.position.set(0, 1.3, 0);
        tGroup.add(labelSp);

        scene.add(tGroup);
        return tGroup;
    }

    /**
     * Create 3D envelope for current document
     */
    function spawnDocumentEnvelope(scene, doc) {
        var E = window.Engine3D;
        var envGroup = new THREE.Group();
        envGroup.position.set(0, 2.0, 0.5);

        // Envelope body
        var envGeo = new THREE.BoxGeometry(1.2, 0.06, 0.8);
        var envColor = doc.isHoax ? 0x7f1d1d : 0x1e3a5f;
        var envMat = new THREE.MeshStandardMaterial({
            color: envColor,
            emissive: envColor,
            emissiveIntensity: 0.15,
            roughness: 0.5
        });
        var envMesh = new THREE.Mesh(envGeo, envMat);
        envGroup.add(envMesh);

        // Title label on envelope
        var titleSp = E.createTextSprite(doc.title, {
            fontSize: 16,
            canvasWidth: 256,
            canvasHeight: 64,
            bgColor: 'rgba(30,41,59,0.9)',
            borderColor: 'rgba(148,163,184,0.4)',
            color: '#e2e8f0',
            scaleX: 1.4,
            scaleY: 0.35
        });
        titleSp.position.set(0, 0.35, 0);
        envGroup.add(titleSp);

        // File type tag
        var tagSp = E.createTextSprite(doc.fileType, {
            fontSize: 14,
            canvasWidth: 192,
            canvasHeight: 48,
            bgColor: 'transparent',
            borderColor: 'transparent',
            color: '#94a3b8',
            scaleX: 1.0,
            scaleY: 0.25
        });
        tagSp.position.set(0, -0.25, 0);
        envGroup.add(tagSp);

        scene.add(envGroup);
        activeEnvelope = envGroup;
        floatingObjects.push({ mesh: envGroup, baseY: 2.0, speed: 1.8, amp: 0.06 });

        return envGroup;
    }

    function updateMonitorScreen(lines) {
        if (!monitorScreen || !monitorScreen.userData._canvas) return;
        var canvas = monitorScreen.userData._canvas;
        var ctx = canvas.getContext('2d');
        var W = 640, H = 384;

        ctx.clearRect(0, 0, W, H);

        // BG
        ctx.fillStyle = '#0a0e1a';
        ctx.fillRect(0, 0, W, H);

        // Scanline
        ctx.fillStyle = 'rgba(56, 189, 248, 0.02)';
        for (var i = 0; i < H; i += 3) ctx.fillRect(0, i, W, 1);

        // Border
        ctx.strokeStyle = '#1e40af';
        ctx.lineWidth = 3;
        ctx.strokeRect(3, 3, W - 6, H - 6);

        // Text lines
        var y = 30;
        var fontSize = 18;
        ctx.font = fontSize + 'px sans-serif';
        ctx.textAlign = 'left';

        lines.forEach(function (line) {
            if (line.type === 'title') {
                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 20px sans-serif';
                ctx.fillText(line.text, 20, y);
                y += 28;
            } else if (line.type === 'label') {
                ctx.fillStyle = '#38bdf8';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText(line.text, 20, y);
                y += 22;
            } else if (line.type === 'good') {
                ctx.fillStyle = '#4ade80';
                ctx.font = '15px sans-serif';
                var wrapped = wrapCtx(ctx, line.text, W - 50);
                wrapped.forEach(function (wl) { ctx.fillText(wl, 28, y); y += 20; });
            } else if (line.type === 'bad') {
                ctx.fillStyle = '#f87171';
                ctx.font = '15px sans-serif';
                var wrapped2 = wrapCtx(ctx, line.text, W - 50);
                wrapped2.forEach(function (wl) { ctx.fillText(wl, 28, y); y += 20; });
            } else {
                ctx.fillStyle = line.color || '#cbd5e1';
                ctx.font = (line.bold ? 'bold ' : '') + (line.size || 16) + 'px sans-serif';
                var wrapped3 = wrapCtx(ctx, line.text, W - 50);
                wrapped3.forEach(function (wl) { ctx.fillText(wl, 20, y); y += 20; });
            }
        });

        monitorScreen.userData._texture.needsUpdate = true;
    }

    function wrapCtx(ctx, text, maxW) {
        var words = text.split(' ');
        var lines = [];
        var cl = '';
        words.forEach(function (w) {
            var t = cl + (cl ? ' ' : '') + w;
            if (ctx.measureText(t).width > maxW && cl) { lines.push(cl); cl = w; }
            else cl = t;
        });
        if (cl) lines.push(cl);
        return lines.length > 0 ? lines : [''];
    }

    function updateScoreDisplay() {
        if (!scoreSprite || !scoreSprite.userData._texture) return;
        var canvas = scoreSprite.userData._texture.image;
        var ctx = canvas.getContext('2d');
        var W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.5)';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, W - 4, H - 4);
        ctx.fillStyle = '#a7f3d0';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Dokumen: ' + (currentDocIdx) + '/12 — ✅' + correctCount + ' ❌' + wrongCount, W / 2, H / 2);
        scoreSprite.userData._texture.needsUpdate = true;
    }

    // ====== GAME FLOW ======

    function loadDocQueue() {
        var docs = window.LEVEL_1_DOCS;
        if (!docs || !Array.isArray(docs)) return;
        docQueue = docs.slice();
        currentDocIdx = 0;
        correctCount = 0;
        wrongCount = 0;
    }

    function presentNextDocument() {
        if (currentDocIdx >= docQueue.length) {
            showFinalResults();
            return;
        }

        currentDoc = docQueue[currentDocIdx];
        testsRevealed = { domain: false, metadata: false, media: false };
        phase = 'inspecting';

        // Remove old envelope
        if (activeEnvelope) {
            sceneSetup.scene.remove(activeEnvelope);
            activeEnvelope = null;
        }

        // Spawn new
        spawnDocumentEnvelope(sceneSetup.scene, currentDoc);

        // Show doc info on monitor
        updateMonitorScreen([
            { type: 'title', text: '📄 ' + currentDoc.title },
            { text: '📨 Pengirim: ' + currentDoc.sender, color: '#94a3b8' },
            { text: '🌐 URL: ' + currentDoc.url, color: '#64748b', size: 14 },
            { text: '', color: '#334155' },
            { text: currentDoc.snippet, color: '#e2e8f0', size: 16 },
            { text: '', color: '#334155' },
            { type: 'label', text: '🔬 Gunakan 3 alat forensik di meja untuk menganalisis!' },
            { text: 'Lalu seret ke nampan FAKTA (kiri) atau HOAKS (kanan).', color: '#94a3b8', size: 14 }
        ]);

        // Reset tool appearance
        toolMeshes.forEach(function (t) {
            t.userData.bodyMat.emissiveIntensity = 0.25;
        });

        updateScoreDisplay();
    }

    function revealTest(testKey) {
        if (!currentDoc || phase !== 'inspecting') return;
        if (testsRevealed[testKey]) return;

        testsRevealed[testKey] = true;
        if (window.GameUI) window.GameUI.playSynth('tap');

        // Highlight used tool
        toolMeshes.forEach(function (t) {
            if (t.userData.toolKey === testKey) {
                t.userData.bodyMat.emissiveIntensity = 0.7;
            }
        });

        // Update monitor with revealed tests
        var lines = [
            { type: 'title', text: '📄 ' + currentDoc.title },
            { text: currentDoc.snippet, color: '#e2e8f0', size: 15 },
            { text: '', color: '#334155' }
        ];

        if (testsRevealed.domain) {
            var d = currentDoc.tests.domain;
            lines.push({ type: d.startsWith('✅') || d.startsWith('📅') ? 'good' : 'bad', text: d });
        }
        if (testsRevealed.metadata) {
            var m = currentDoc.tests.metadata;
            lines.push({ type: m.startsWith('✅') || m.startsWith('📅') ? 'good' : 'bad', text: m });
        }
        if (testsRevealed.media) {
            var me = currentDoc.tests.media;
            lines.push({ type: me.startsWith('✅') || me.startsWith('🔍') ? 'good' : 'bad', text: me });
        }

        var revealed = (testsRevealed.domain ? 1 : 0) + (testsRevealed.metadata ? 1 : 0) + (testsRevealed.media ? 1 : 0);
        if (revealed < 3) {
            lines.push({ text: '', color: '#334155' });
            lines.push({ type: 'label', text: '(' + (3 - revealed) + ' alat belum digunakan)' });
        } else {
            lines.push({ text: '', color: '#334155' });
            lines.push({ type: 'label', text: '✅ Semua alat digunakan! Pilih nampan FAKTA atau HOAKS.' });
        }

        updateMonitorScreen(lines);
    }

    function makeDecision(decision) {
        if (!currentDoc || phase !== 'inspecting') return;
        phase = 'decided';

        var isHoax = currentDoc.isHoax;
        var chosenHoax = (decision === 'hoaks');
        var isCorrect = (chosenHoax === isHoax);

        if (isCorrect) {
            correctCount++;
            if (window.GameUI) window.GameUI.playSynth('success');
        } else {
            wrongCount++;
            if (window.GameUI) window.GameUI.playSynth('error');
        }

        // Fly envelope to tray
        if (activeEnvelope) {
            var targetX = (decision === 'fakta') ? -3.2 : 3.2;
            var env = activeEnvelope;
            var startX = env.position.x;
            var startY = env.position.y;
            var startZ = env.position.z;
            var t = 0;
            var flyInterval = setInterval(function () {
                t += 0.05;
                if (t >= 1) {
                    t = 1;
                    clearInterval(flyInterval);
                }
                env.position.x = startX + (targetX - startX) * t;
                env.position.y = startY + (0.7 - startY) * t;
                env.position.z = startZ + (0 - startZ) * t;
            }, 16);
        }

        // Particle burst
        var burstColor = isCorrect ? 0x22c55e : 0xef4444;
        var burst = window.Engine3D.createParticleBurst(
            sceneSetup.scene,
            new THREE.Vector3(decision === 'fakta' ? -3.2 : 3.2, 1.0, 0),
            burstColor, 18
        );
        particleSystems.push(burst);

        // Feedback
        window.Engine3D.showFeedback3D(
            activeContainer, isCorrect,
            isCorrect ? 'BENAR!' : 'SALAH!',
            currentDoc.explanation,
            2500
        );

        updateMonitorScreen([
            { type: 'title', text: isCorrect ? '✅ KEPUTUSAN BENAR!' : '❌ KEPUTUSAN SALAH!' },
            { text: currentDoc.explanation, color: isCorrect ? '#4ade80' : '#f87171', size: 16 }
        ]);

        // Advance
        currentDocIdx++;
        updateScoreDisplay();
        setTimeout(function () {
            presentNextDocument();
        }, 2800);
    }

    function showFinalResults() {
        phase = 'done';
        var total = docQueue.length;
        var accuracy = Math.round((correctCount / total) * 100);
        var stars = accuracy >= 90 ? 3 : (accuracy >= 70 ? 2 : (accuracy >= 50 ? 1 : 0));

        updateMonitorScreen([
            { type: 'title', text: '📊 LAPORAN MISI FORENSIK' },
            { text: '', color: '#334155' },
            { text: 'Dokumen Diproses: ' + total, color: '#e2e8f0', size: 20, bold: true },
            { text: 'Keputusan Benar: ' + correctCount, color: '#4ade80', size: 20, bold: true },
            { text: 'Keputusan Salah: ' + wrongCount, color: '#f87171', size: 20, bold: true },
            { text: '', color: '#334155' },
            { text: 'Akurasi: ' + accuracy + '% — Bintang: ' + '★'.repeat(stars) + '☆'.repeat(3 - stars), color: '#fbbf24', size: 22, bold: true },
            { text: '', color: '#334155' },
            { type: 'label', text: 'Ketuk tombol hijau untuk menyelesaikan misi.' }
        ]);

        // Show finish button (reuse tool hitbox area)
        toolMeshes.forEach(function (t) { t.visible = false; });
        toolHitboxes.forEach(function (h) { h.visible = false; });
        trayHitboxes.forEach(function (h) { h.visible = false; });

        // Create finish button as answer button
        var E = window.Engine3D;
        var finishBtn = E.createButton3D('🏆 Selesaikan Misi', {
            width: 3.0, height: 0.7, color: 0x22c55e, emissiveIntensity: 0.5
        });
        finishBtn.position.set(0, 1.5, 2.5);
        sceneSetup.scene.add(finishBtn);

        var finishHit = new THREE.Mesh(
            new THREE.BoxGeometry(3.2, 0.9, 0.5),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        finishHit.position.copy(finishBtn.position);
        finishHit.userData.finishAction = true;
        sceneSetup.scene.add(finishHit);
        trayHitboxes.push(finishHit); // Reuse for raycasting

        if (onFinishCallback) {
            finishHit.userData._completeData = {
                score: accuracy,
                stars: stars,
                accuracy: accuracy,
                storyClue: 'Misi Forensik Tuntas — ' + accuracy + '% akurasi'
            };
        }
    }

    // ====== INPUT ======

    function setupInput() {
        if (!sceneSetup || !sceneSetup.renderer) return;
        var dom = sceneSetup.renderer.domElement;
        var pDownX = 0, pDownY = 0, pDownTime = 0, dragging = false;

        dom.addEventListener('pointerdown', function (e) {
            pDownX = e.clientX; pDownY = e.clientY; pDownTime = performance.now(); dragging = false;
        }, { passive: true });

        dom.addEventListener('pointermove', function (e) {
            if (pDownTime > 0) {
                var dx = e.clientX - pDownX;
                if (Math.abs(dx) > 10) {
                    dragging = true;
                    camTargetAngle += dx * 0.003;
                    pDownX = e.clientX;
                }
            }
        }, { passive: true });

        dom.addEventListener('pointerup', function (e) {
            var dur = performance.now() - pDownTime;
            pDownTime = 0;
            if (dur < 400 && !dragging) onTap(e);
            dragging = false;
        }, { passive: true });
    }

    function onTap(event) {
        if (!sceneSetup) return;
        var E = window.Engine3D;

        // Check tools
        var toolHits = E.raycastObjects(event, activeContainer, sceneSetup.camera, toolHitboxes);
        if (toolHits.length > 0 && phase === 'inspecting') {
            var key = toolHits[0].object.userData.toolKey;
            if (key) revealTest(key);
            return;
        }

        // Check trays
        var trayHits = E.raycastObjects(event, activeContainer, sceneSetup.camera, trayHitboxes);
        if (trayHits.length > 0) {
            var obj = trayHits[0].object;
            if (obj.userData.finishAction && obj.userData._completeData) {
                if (onFinishCallback) onFinishCallback(obj.userData._completeData);
                return;
            }
            if (phase === 'inspecting' && obj.userData.decision) {
                makeDecision(obj.userData.decision);
            }
        }
    }

    // ====== ANIMATION ======

    function animate() {
        if (!sceneSetup || !sceneSetup.renderer) return;
        sceneSetup.animFrameId = requestAnimationFrame(animate);

        var dt = Math.min(sceneSetup.clock.getDelta(), 0.1);
        var elapsed = sceneSetup.clock.getElapsedTime();

        // Camera
        camAngle += (camTargetAngle - camAngle) * 0.06;
        var camDist = 9;
        var camPitch = 0.5;
        var cx = Math.cos(camAngle) * Math.cos(camPitch) * camDist;
        var cy = Math.sin(camPitch) * camDist + 1.5;
        var cz = Math.sin(camAngle) * Math.cos(camPitch) * camDist;
        sceneSetup.camera.position.set(cx, cy, cz);
        sceneSetup.camera.lookAt(0, 1.2, 0);

        // Floating
        floatingObjects.forEach(function (fo) {
            if (fo.mesh && fo.mesh.visible !== false) {
                fo.mesh.position.y = fo.baseY + Math.sin(elapsed * fo.speed) * fo.amp;
            }
        });

        // Particles
        for (var pi = particleSystems.length - 1; pi >= 0; pi--) {
            var alive = particleSystems[pi].update(dt);
            if (!alive) { particleSystems[pi].dispose(); particleSystems.splice(pi, 1); }
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

    var Level1Detective = {
        init: function (container, onComplete, onExit) {
            activeContainer = container;
            onFinishCallback = onComplete;
            onExitCallback = onExit;
            particleSystems = [];
            floatingObjects = [];

            container.innerHTML = '';
            container.style.position = 'relative';

            var budget = getDeviceBudget();

            sceneSetup = window.Engine3D.createScene(container, budget);
            window.Engine3D.setupLighting(sceneSetup.scene, budget, 0xa0b8d0, 0.45);

            // Blue point light for cyberpunk feel
            var pt = new THREE.PointLight(0x3b82f6, 1.0, 15);
            pt.position.set(0, 3, 0);
            sceneSetup.scene.add(pt);

            buildEnvironment(sceneSetup.scene, budget);

            // HUD
            window.Engine3D.createHUD(container, {
                exitBtnId: 'btn-l1-exit',
                levelTag: 'LEVEL 1',
                title: 'Meja Forensik Digital',
                statsId: 'hud-l1-stats',
                statsHtml: '<span>📄 0/12</span>'
            });

            container.querySelector('#btn-l1-exit').addEventListener('click', function () {
                if (onExitCallback) onExitCallback();
            });

            setupInput();
            window.addEventListener('resize', handleResize);

            loadDocQueue();
            presentNextDocument();

            animate();
        },

        dispose: function () {
            window.removeEventListener('resize', handleResize);
            particleSystems.forEach(function (ps) { ps.dispose(); });
            particleSystems = [];
            floatingObjects = [];
            docQueue = [];
            currentDoc = null;
            activeEnvelope = null;
            toolMeshes = [];
            toolHitboxes = [];
            trayHitboxes = [];
            monitorScreen = null;
            scoreSprite = null;

            window.Engine3D.disposeScene(sceneSetup);
            sceneSetup = null;

            if (activeContainer) { activeContainer.innerHTML = ''; activeContainer = null; }
            onFinishCallback = null;
            onExitCallback = null;
        }
    };

    window.Level1Detective = Level1Detective;
})();
