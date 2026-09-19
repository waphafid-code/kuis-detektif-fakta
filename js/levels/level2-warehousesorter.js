/**
 * ============================================================
 * 📦 LEVEL 2: 3D RUANG ARSIP OSIS (WAREHOUSE SORTER)
 * ============================================================
 * Full 3D interactive data structure warehouse:
 * 7 physical 3D racks (Array, Stack, Queue, Tree, Linked List,
 * Graph, Hash Table), animated cargo parcel sorting,
 * holographic OSIS scenario terminal (Babak 2), and particles.
 * Conforms to ATP 2.1 - 2.2 (Bloom C2 Memahami).
 * ============================================================
 */

(function () {
    'use strict';

    let activeContainer = null;
    let onFinishCallback = null;
    let onExitCallback = null;
    let sceneSetup = null;

    // Game state
    let stage = 'babak1'; // 'briefing', 'babak1', 'babak2', 'summary'
    let currentShipmentIdx = 0;
    let shipmentsList = [];
    let correctShipments = 0;

    let currentScenarioIdx = 0;
    let scenariosList = [];
    let correctScenarios = 0;

    let score = 0;
    let streak = 0;
    let isProcessing = false;

    // 3D Objects
    let rackGroups = [];
    let rackHitboxes = [];
    let currentCrateGroup = null;
    let crateBasePos = new THREE.Vector3(0, 1.1, 0.5);
    let monitorMesh = null;
    let scenarioMonitor = null;
    let particleSystems = [];
    let animCrate = null; // { mesh, startPos, targetPos, progress, onDone }

    function getPlayerName() {
        return (window.GameStorage && window.GameStorage.getPlayerName()) || 'Detektif Muda';
    }

    function getDeviceBudget() {
        return (window.DeviceTier && window.DeviceTier.getBudget()) || {
            tier: 'low', shadows: false, pixelRatio: 1.0, antialias: false
        };
    }

    /**
     * 7 Racks Definition with 3D models and layout
     */
    const RACK_CONFIGS = [
        { id: 'array', name: 'ARRAY', sub: 'Larik Berindeks [0..n]', color: 0x3b82f6, icon: '🔢', angle: -2.3, radius: 6.5 },
        { id: 'stack', name: 'STACK', sub: 'Tumpukan LIFO (Top)', color: 0xec4899, icon: '📚', angle: -1.55, radius: 6.8 },
        { id: 'queue', name: 'QUEUE', sub: 'Antrean FIFO (Ban)', color: 0x10b981, icon: '🚶‍♂️', angle: -0.8, radius: 6.5 },
        { id: 'tree', name: 'TREE', sub: 'Pohon Hierarki Cabang', color: 0x14b8a6, icon: '🌳', angle: 0.0, radius: 7.0 },
        { id: 'linked_list', name: 'LINKED LIST', sub: 'Rantai Pointer Next', color: 0x8b5cf6, icon: '🔗', angle: 0.8, radius: 6.5 },
        { id: 'graph', name: 'GRAPH', sub: 'Graf Banyak-ke-Banyak', color: 0xf59e0b, icon: '🕸️', angle: 1.55, radius: 6.8 },
        { id: 'hash_table', name: 'HASH TABLE', sub: 'Loker Key-Value O(1)', color: 0x06b6d4, icon: '🗄️', angle: 2.3, radius: 6.5 }
    ];

    /**
     * Build the 3D Warehouse Environment
     */
    function buildEnvironment(scene, budget) {
        const E = window.Engine3D;

        // Warehouse Floor
        const floor = E.createFloor(24, 0x090d16, 0x172554, budget);
        scene.add(floor);

        // Industrial Ceiling Beams
        const beamMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.4 });
        for (let i = -3; i <= 3; i++) {
            const beam = new THREE.Mesh(new THREE.BoxGeometry(22, 0.4, 0.4), beamMat);
            beam.position.set(0, 5.5, i * 3);
            scene.add(beam);
        }

        // Inspection Dock Pedestal (in front of player)
        const dockGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.8, 16);
        const dockMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.3 });
        const dock = new THREE.Mesh(dockGeo, dockMat);
        dock.position.set(0, 0.4, 0.5);
        dock.receiveShadow = budget.shadows;
        scene.add(dock);

        // Neon ring around dock
        const dockRing = E.createNeonRing(1.25, 0x38bdf8, 0.04);
        dockRing.rotation.x = Math.PI / 2;
        dockRing.position.set(0, 0.81, 0.5);
        scene.add(dockRing);

        // Floating Holographic Monitor (above dock)
        const monFrame = new THREE.Mesh(
            new THREE.BoxGeometry(3.6, 2.0, 0.08),
            new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
        );
        monFrame.position.set(0, 2.8, -0.6);
        scene.add(monFrame);

        const monCanvas = document.createElement('canvas');
        monCanvas.width = 720;
        monCanvas.height = 400;
        const monTex = new THREE.CanvasTexture(monCanvas);
        monTex.minFilter = THREE.LinearFilter;
        monTex.generateMipmaps = false;
        monitorMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(3.4, 1.85),
            new THREE.MeshBasicMaterial({ map: monTex })
        );
        monitorMesh.position.set(0, 2.8, -0.55);
        monitorMesh.userData._canvas = monCanvas;
        monitorMesh.userData._texture = monTex;
        scene.add(monitorMesh);

        // Build the 7 3D Racks
        buildRacks(scene, budget);
    }

    /**
     * Build the 7 3D Racks with distinct visual identities
     */
    function buildRacks(scene, budget) {
        const E = window.Engine3D;
        rackGroups = [];
        rackHitboxes = [];

        RACK_CONFIGS.forEach(function (cfg) {
            const group = new THREE.Group();
            const posX = Math.sin(cfg.angle) * cfg.radius;
            const posZ = -Math.cos(cfg.angle) * cfg.radius;
            group.position.set(posX, 0, posZ);
            group.rotation.y = -cfg.angle + Math.PI;

            // Base platform
            const platGeo = new THREE.BoxGeometry(2.2, 0.2, 1.4);
            const platMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.5, roughness: 0.4 });
            const plat = new THREE.Mesh(platGeo, platMat);
            plat.position.y = 0.1;
            group.add(plat);

            // Custom architecture per rack type
            if (cfg.id === 'array') {
                for (let i = 0; i < 4; i++) {
                    const slotGeo = new THREE.BoxGeometry(0.42, 1.2, 0.8);
                    const slotMat = new THREE.MeshStandardMaterial({
                        color: cfg.color,
                        emissive: cfg.color,
                        emissiveIntensity: 0.2,
                        wireframe: true
                    });
                    const slot = new THREE.Mesh(slotGeo, slotMat);
                    slot.position.set(-0.75 + i * 0.5, 0.8, 0);
                    group.add(slot);
                }
            } else if (cfg.id === 'stack') {
                const chuteGeo = new THREE.BoxGeometry(1.4, 2.2, 1.0);
                const chuteMat = new THREE.MeshStandardMaterial({
                    color: cfg.color,
                    emissive: cfg.color,
                    emissiveIntensity: 0.25,
                    wireframe: true
                });
                const chute = new THREE.Mesh(chuteGeo, chuteMat);
                chute.position.set(0, 1.2, 0);
                group.add(chute);
                const arrow = E.createNeonRing(0.4, cfg.color, 0.04);
                arrow.rotation.x = Math.PI / 2;
                arrow.position.set(0, 2.3, 0);
                group.add(arrow);
            } else if (cfg.id === 'queue') {
                const trackGeo = new THREE.BoxGeometry(2.0, 0.3, 0.9);
                const trackMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 });
                const track = new THREE.Mesh(trackGeo, trackMat);
                track.position.set(0, 0.7, 0);
                group.add(track);
                for (let r = 0; r < 5; r++) {
                    const roller = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.1, 0.1, 0.8, 8),
                        new THREE.MeshStandardMaterial({ color: 0x34d399 })
                    );
                    roller.rotation.z = Math.PI / 2;
                    roller.position.set(-0.8 + r * 0.4, 0.9, 0);
                    group.add(roller);
                }
            } else if (cfg.id === 'tree') {
                const trunk = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.12, 0.18, 1.4, 8),
                    new THREE.MeshStandardMaterial({ color: 0x14b8a6, metalness: 0.4 })
                );
                trunk.position.set(0, 0.8, 0);
                group.add(trunk);
                const rootNode = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 8), new THREE.MeshBasicMaterial({ color: 0x2dd4bf }));
                rootNode.position.set(0, 1.6, 0);
                group.add(rootNode);
                [-0.6, 0.6].forEach(function (cx) {
                    const branch = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ color: 0x14b8a6 }));
                    branch.position.set(cx, 1.1, 0.3);
                    group.add(branch);
                });
            } else if (cfg.id === 'linked_list') {
                for (let n = 0; n < 3; n++) {
                    const node = new THREE.Mesh(
                        new THREE.BoxGeometry(0.35, 0.6, 0.5),
                        new THREE.MeshStandardMaterial({ color: cfg.color, emissive: cfg.color, emissiveIntensity: 0.3 })
                    );
                    node.position.set(-0.6 + n * 0.6, 0.7, 0);
                    group.add(node);
                    if (n < 2) {
                        const pipe = new THREE.Mesh(
                            new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6),
                            new THREE.MeshBasicMaterial({ color: 0xc084fc })
                        );
                        pipe.rotation.z = Math.PI / 2;
                        pipe.position.set(-0.3 + n * 0.6, 0.7, 0);
                        group.add(pipe);
                    }
                }
            } else if (cfg.id === 'graph') {
                const gNodes = [[-0.5, 0.6, -0.3], [0.5, 0.6, -0.3], [-0.4, 1.2, 0.3], [0.4, 1.2, 0.3]];
                gNodes.forEach(function (gn) {
                    const sph = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfbbf24 }));
                    sph.position.set(gn[0], gn[1], gn[2]);
                    group.add(sph);
                });
            } else if (cfg.id === 'hash_table') {
                for (let r = 0; r < 2; r++) {
                    for (let c = 0; c < 3; c++) {
                        const box = new THREE.Mesh(
                            new THREE.BoxGeometry(0.4, 0.4, 0.6),
                            new THREE.MeshStandardMaterial({ color: 0x0891b2, emissive: 0x06b6d4, emissiveIntensity: 0.25 })
                        );
                        box.position.set(-0.5 + c * 0.5, 0.5 + r * 0.5, 0);
                        group.add(box);
                    }
                }
            }

            // Billboard Label above the rack
            const labelSprite = E.createTextSprite(cfg.icon + ' ' + cfg.name, {
                fontSize: 32,
                canvasWidth: 384,
                canvasHeight: 96,
                bgColor: 'rgba(15, 23, 42, 0.9)',
                borderColor: '#' + cfg.color.toString(16).padStart(6, '0'),
                color: '#ffffff',
                scaleX: 2.4,
                scaleY: 0.6
            });
            labelSprite.position.set(0, 2.6, 0);
            group.add(labelSprite);

            // Subtitle billboard
            const subSprite = E.createTextSprite(cfg.sub, {
                fontSize: 22,
                canvasWidth: 384,
                canvasHeight: 64,
                bgColor: 'transparent',
                borderColor: 'transparent',
                color: '#' + cfg.color.toString(16).padStart(6, '0'),
                scaleX: 2.0,
                scaleY: 0.35
            });
            subSprite.position.set(0, 2.1, 0);
            group.add(subSprite);

            // Hitbox for raycasting
            const hitGeo = new THREE.BoxGeometry(2.4, 3.2, 1.8);
            const hitMat = new THREE.MeshBasicMaterial({ visible: false });
            const hitMesh = new THREE.Mesh(hitGeo, hitMat);
            hitMesh.position.set(0, 1.5, 0);
            hitMesh.userData.rackId = cfg.id;
            hitMesh.userData.rackName = cfg.name;
            hitMesh.userData.rackColor = cfg.color;
            hitMesh.userData.parentRackGroup = group;
            group.add(hitMesh);
            rackHitboxes.push(hitMesh);

            group.userData.rackId = cfg.id;
            group.userData.config = cfg;
            scene.add(group);
            rackGroups.push(group);
        });
    }

    /**
     * Spawn the current shipment parcel / crate on the inspection dock
     */
    function spawnCrate(shipment) {
        if (!sceneSetup) return;
        const scene = sceneSetup.scene;

        if (currentCrateGroup) {
            scene.remove(currentCrateGroup);
            window.Engine3D.disposeScene({ scene: currentCrateGroup });
            currentCrateGroup = null;
        }

        const group = new THREE.Group();
        group.position.copy(crateBasePos);

        // 3D Cargo Crate
        const crateGeo = new THREE.BoxGeometry(0.9, 0.65, 0.9);
        const crateMat = new THREE.MeshStandardMaterial({
            color: 0x3b82f6,
            metalness: 0.3,
            roughness: 0.4
        });
        const crate = new THREE.Mesh(crateGeo, crateMat);
        crate.castShadow = true;
        group.add(crate);

        // Edge reinforcement frame
        const frameGeo = new THREE.BoxGeometry(0.94, 0.69, 0.94);
        const frameMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa, wireframe: true });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        group.add(frame);

        // Crate icon badge
        const badge = window.Engine3D.createTextSprite(shipment.icon || '📦', {
            fontSize: 48,
            canvasWidth: 128,
            canvasHeight: 128,
            bgColor: 'transparent',
            borderColor: 'transparent',
            scaleX: 0.6,
            scaleY: 0.6
        });
        badge.position.set(0, 0.55, 0);
        group.add(badge);

        scene.add(group);
        currentCrateGroup = group;
    }

    /**
     * Update the Holographic Monitor with current shipment info
     */
    function updateMonitor(shipment) {
        if (!monitorMesh || !monitorMesh.userData._canvas) return;
        const canvas = monitorMesh.userData._canvas;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        // Cyberpunk background
        ctx.fillStyle = 'rgba(11, 19, 43, 0.95)';
        ctx.fillRect(0, 0, W, H);

        // Neon border
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, W - 8, H - 8);

        // Header bar
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 6, W - 12, 54);

        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'left';
        ctx.fillText(`📦 KIRIMAN ${currentShipmentIdx + 1}/${shipmentsList.length}`, 24, 40);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`SKOR: ${score}  |  🔥 ${streak}x`, W - 24, 40);

        // Shipment Category & Sender
        ctx.textAlign = 'left';
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#a855f7';
        ctx.fillText(`[${shipment.category || 'Berkas'}] • Dari: ${shipment.sender || 'OSIS'}`, 24, 95);

        // Title
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#ffffff';
        const titleLines = window.Engine3D._wrapText(ctx, shipment.title, W - 48);
        titleLines.forEach(function (tl, idx) {
            ctx.fillText(tl, 24, 130 + idx * 30);
        });

        // Description
        const descStartY = 130 + titleLines.length * 30 + 10;
        ctx.font = '19px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        const descLines = window.Engine3D._wrapText(ctx, shipment.description, W - 48);
        descLines.forEach(function (dl, idx) {
            ctx.fillText(dl, 24, descStartY + idx * 26);
        });

        // Physical Hint Box
        const hintY = H - 75;
        ctx.fillStyle = 'rgba(30, 58, 138, 0.5)';
        ctx.fillRect(20, hintY - 10, W - 40, 60);
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, hintY - 10, W - 40, 60);

        ctx.font = 'italic 18px sans-serif';
        ctx.fillStyle = '#93c5fd';
        ctx.fillText(`💡 Karakteristik: ${shipment.physicalHint || ''}`, 32, hintY + 25);

        monitorMesh.userData._texture.needsUpdate = true;
    }

    /**
     * Sort the shipment to the chosen rack
     */
    function sortShipmentToRack(rackId) {
        if (isProcessing || stage !== 'babak1') return;
        isProcessing = true;

        const shipment = shipmentsList[currentShipmentIdx];
        const isCorrect = (rackId === shipment.targetRack);
        const chosenRack = rackGroups.find(function (g) { return g.userData.rackId === rackId; });

        // Sound
        if (window.GameUI) {
            window.GameUI.playSynth(isCorrect ? 'success' : 'error');
        }

        // Animate crate flying to target rack
        if (currentCrateGroup && chosenRack) {
            const startP = currentCrateGroup.position.clone();
            const endP = chosenRack.position.clone().add(new THREE.Vector3(0, 1.2, 0));

            animCrate = {
                mesh: currentCrateGroup,
                startPos: startP,
                targetPos: endP,
                progress: 0,
                onDone: function () {
                    // Particle burst at rack
                    if (sceneSetup) {
                        const burstColor = isCorrect ? 0x22c55e : 0xef4444;
                        const ps = window.Engine3D.createParticleBurst(sceneSetup.scene, endP, burstColor, 20);
                        particleSystems.push(ps);
                    }

                    // Score update
                    if (isCorrect) {
                        score += 100 + streak * 15;
                        streak++;
                        correctShipments++;
                    } else {
                        streak = 0;
                    }

                    // Show Feedback Dialog
                    showSortingFeedback(isCorrect, shipment, rackId, function () {
                        currentShipmentIdx++;
                        if (currentShipmentIdx < shipmentsList.length) {
                            spawnCrate(shipmentsList[currentShipmentIdx]);
                            updateMonitor(shipmentsList[currentShipmentIdx]);
                            isProcessing = false;
                        } else {
                            startBabak2();
                        }
                    });
                }
            };
        } else {
            isProcessing = false;
        }
    }

    /**
     * Show sorting explanation feedback modal overlay
     */
    function showSortingFeedback(isCorrect, shipment, chosenRackId, onNext) {
        if (!activeContainer) { onNext(); return; }

        let modal = activeContainer.querySelector('.warehouse-feedback-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'warehouse-feedback-modal';
            activeContainer.appendChild(modal);
        }

        const chosenCfg = RACK_CONFIGS.find(function (r) { return r.id === chosenRackId; });
        const correctCfg = RACK_CONFIGS.find(function (r) { return r.id === shipment.targetRack; });

        modal.innerHTML = `
            <div class="warehouse-feedback-card ${isCorrect ? 'card-correct' : 'card-wrong'}">
                <div class="feedback-header">
                    <span class="feedback-icon">${isCorrect ? '✅ TEPAT SEKALI!' : '❌ KURANG TEPAT!'}</span>
                    <span class="feedback-streak">${isCorrect && streak > 1 ? '🔥 STREAK x' + streak : ''}</span>
                </div>
                <div class="feedback-body">
                    <p class="feedback-title"><strong>${shipment.title}</strong></p>
                    <div class="feedback-comparison">
                        <div class="choice-tag ${isCorrect ? 'tag-correct' : 'tag-wrong'}">
                            Pilihan Anda: <strong>${chosenCfg ? chosenCfg.name : chosenRackId}</strong>
                        </div>
                        ${!isCorrect ? `
                        <div class="choice-tag tag-target">
                            Rak Seharusnya: <strong>${correctCfg ? correctCfg.name : shipment.targetRack}</strong>
                        </div>` : ''}
                    </div>
                    <div class="feedback-explanation">
                        <p><strong>📖 Analisis Struktur Data:</strong></p>
                        <p>${shipment.explanation}</p>
                    </div>
                </div>
                <button type="button" class="btn-action-primary" id="btn-feedback-next">
                    Lanjut ke Kiriman Berikutnya ➔
                </button>
            </div>
        `;
        modal.style.display = 'flex';

        const btnNext = modal.querySelector('#btn-feedback-next');
        btnNext.addEventListener('click', function () {
            modal.style.display = 'none';
            if (window.GameUI) window.GameUI.playSynth('tap');
            onNext();
        });
    }

    /**
     * Transition to Babak 2: Real OSIS Committee Scenarios
     */
    function startBabak2() {
        stage = 'babak2';
        currentScenarioIdx = 0;
        correctScenarios = 0;

        if (currentCrateGroup) currentCrateGroup.visible = false;
        if (monitorMesh) monitorMesh.visible = false;

        const quickBar = activeContainer ? activeContainer.querySelector('.warehouse-quick-bar') : null;
        if (quickBar) quickBar.style.display = 'none';

        buildScenarioTerminal();
        if (scenariosList.length > 0) {
            presentScenario(scenariosList[0]);
        } else {
            finishLevel2();
        }
    }

    /**
     * Build 3D Scenario Terminal for Babak 2
     */
    function buildScenarioTerminal() {
        if (!sceneSetup || scenarioMonitor) return;
        const scene = sceneSetup.scene;

        const sCanvas = document.createElement('canvas');
        sCanvas.width = 800;
        sCanvas.height = 480;
        const sTex = new THREE.CanvasTexture(sCanvas);
        sTex.minFilter = THREE.LinearFilter;
        sTex.generateMipmaps = false;

        scenarioMonitor = new THREE.Mesh(
            new THREE.PlaneGeometry(5.2, 3.1),
            new THREE.MeshBasicMaterial({ map: sTex, side: THREE.DoubleSide })
        );
        scenarioMonitor.position.set(0, 2.5, -1.8);
        scenarioMonitor.userData._canvas = sCanvas;
        scenarioMonitor.userData._texture = sTex;
        scene.add(scenarioMonitor);
    }

    /**
     * Present Scenario in Babak 2
     */
    function presentScenario(scenario) {
        if (!scenarioMonitor || !scenarioMonitor.userData._canvas) return;
        const canvas = scenarioMonitor.userData._canvas;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.96)';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, W - 8, H - 8);

        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(6, 6, W - 12, 54);

        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#a78bfa';
        ctx.textAlign = 'left';
        ctx.fillText(`⚡ BABAK 2: SKENARIO NYATA OSIS (${currentScenarioIdx + 1}/${scenariosList.length})`, 24, 40);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`SKOR: ${score}`, W - 24, 40);

        ctx.textAlign = 'left';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillStyle = '#ffffff';
        const titleLines = window.Engine3D._wrapText(ctx, scenario.title, W - 48);
        titleLines.forEach(function (line, i) {
            ctx.fillText(line, 24, 95 + i * 32);
        });

        const startY = 100 + titleLines.length * 32;
        ctx.font = '19px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        const descLines = window.Engine3D._wrapText(ctx, scenario.context, W - 48);
        descLines.forEach(function (line, i) {
            ctx.fillText(line, 24, startY + i * 26);
        });

        const qY = startY + descLines.length * 26 + 15;
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = '#38bdf8';
        const qLines = window.Engine3D._wrapText(ctx, 'Pertanyaan: ' + scenario.question, W - 48);
        qLines.forEach(function (line, i) {
            ctx.fillText(line, 24, qY + i * 28);
        });

        scenarioMonitor.userData._texture.needsUpdate = true;

        renderScenarioChoicesOverlay(scenario);
    }

    /**
     * Render HTML Buttons Overlay for Babak 2
     */
    function renderScenarioChoicesOverlay(scenario) {
        if (!activeContainer) return;
        let overlay = activeContainer.querySelector('.scenario-choices-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'scenario-choices-overlay';
            activeContainer.appendChild(overlay);
        }

        overlay.innerHTML = `
            <div class="choices-container">
                ${scenario.options.map(function (opt, idx) {
                    return `
                        <button type="button" class="btn-scenario-choice" data-idx="${idx}">
                            <span class="choice-alpha">${String.fromCharCode(65 + idx)}</span>
                            <span class="choice-text">${opt.text}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        `;
        overlay.style.display = 'block';

        const buttons = overlay.querySelectorAll('.btn-scenario-choice');
        buttons.forEach(function (btn) {
            btn.addEventListener('click', function () {
                const choiceIdx = parseInt(this.getAttribute('data-idx'), 10);
                handleScenarioAnswer(scenario, choiceIdx);
            });
        });
    }

    /**
     * Handle Scenario Answer
     */
    function handleScenarioAnswer(scenario, choiceIdx) {
        if (isProcessing) return;
        isProcessing = true;

        const isCorrect = (choiceIdx === scenario.correctAnswer);
        if (isCorrect) {
            score += 150;
            correctScenarios++;
        }

        if (window.GameUI) {
            window.GameUI.playSynth(isCorrect ? 'success' : 'error');
        }

        const overlay = activeContainer.querySelector('.scenario-choices-overlay');
        if (overlay) overlay.style.display = 'none';

        let modal = activeContainer.querySelector('.warehouse-feedback-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'warehouse-feedback-modal';
            activeContainer.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="warehouse-feedback-card ${isCorrect ? 'card-correct' : 'card-wrong'}">
                <div class="feedback-header">
                    <span class="feedback-icon">${isCorrect ? '✅ KEPUTUSAN TEPAT!' : '❌ KEPUTUSAN KURANG EFEKTIF!'}</span>
                </div>
                <div class="feedback-body">
                    <p class="feedback-title"><strong>${scenario.title}</strong></p>
                    <div class="feedback-explanation">
                        <p><strong>📖 Pembahasan:</strong></p>
                        <p>${scenario.explanation}</p>
                    </div>
                </div>
                <button type="button" class="btn-action-primary" id="btn-scenario-next">
                    Lanjut ➔
                </button>
            </div>
        `;
        modal.style.display = 'flex';

        modal.querySelector('#btn-scenario-next').addEventListener('click', function () {
            modal.style.display = 'none';
            currentScenarioIdx++;
            isProcessing = false;
            if (currentScenarioIdx < scenariosList.length) {
                presentScenario(scenariosList[currentScenarioIdx]);
            } else {
                finishLevel2();
            }
        });
    }

    /**
     * Finish Level 2 and Show Summary
     */
    function finishLevel2() {
        stage = 'summary';

        const totalTasks = shipmentsList.length + scenariosList.length;
        const totalCorrect = correctShipments + correctScenarios;
        const accuracy = Math.round((totalCorrect / totalTasks) * 100);

        let stars = 1;
        if (accuracy >= 85) stars = 3;
        else if (accuracy >= 65) stars = 2;

        const storyClue = "Bagan Arsip Terverifikasi: Data panitia HUT tersimpan rapi!";

        if (window.GameStorage) {
            window.GameStorage.completeLevel(2, score, stars, storyClue);
            window.GameStorage.updateMeterKepercayaan(15);
        }

        if (window.GameUI) {
            window.GameUI.playSynth('levelUp');
        }

        // Particle fireworks
        if (sceneSetup) {
            for (let f = 0; f < 3; f++) {
                setTimeout(function () {
                    if (!sceneSetup) return;
                    const pos = new THREE.Vector3((Math.random() - 0.5) * 6, 2.5 + Math.random() * 2, -1);
                    const ps = window.Engine3D.createParticleBurst(sceneSetup.scene, pos, 0xfbbf24, 25);
                    particleSystems.push(ps);
                }, f * 300);
            }
        }

        if (!activeContainer) return;
        const modal = document.createElement('div');
        modal.className = 'warehouse-feedback-modal';
        modal.innerHTML = `
            <div class="warehouse-feedback-card card-summary">
                <div class="summary-header">
                    <h2>🏆 MISI ARSIP OSIS TUNTAS!</h2>
                    <div class="summary-stars">
                        ${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}
                    </div>
                </div>
                <div class="summary-stats-grid">
                    <div class="stat-box">
                        <span class="stat-label">TOTAL SKOR</span>
                        <span class="stat-val">${score}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">AKURASI</span>
                        <span class="stat-val">${accuracy}%</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">SORTING BERKAS</span>
                        <span class="stat-val">${correctShipments}/${shipmentsList.length}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">SKENARIO OSIS</span>
                        <span class="stat-val">${correctScenarios}/${scenariosList.length}</span>
                    </div>
                </div>
                <div class="summary-badge-reward">
                    <span class="badge-icon">🎖️</span>
                    <div>
                        <strong>Gelar: Master Struktur Data OSIS</strong>
                        <p>Berhasil mengklasifikasikan 7 jenis struktur data dalam manajemen organisasi.</p>
                    </div>
                </div>
                <button type="button" class="btn-action-primary" id="btn-summary-exit">
                    Kembali ke Lobi ➔
                </button>
            </div>
        `;
        modal.style.display = 'flex';
        activeContainer.appendChild(modal);

        modal.querySelector('#btn-summary-exit').addEventListener('click', function () {
            if (onFinishCallback) {
                onFinishCallback({ score: score, stars: stars, accuracy: accuracy, storyClue: storyClue });
            } else if (onExitCallback) {
                onExitCallback();
            }
        });
    }

    /**
     * Setup Raycast Pointer Click for 3D Racks
     */
    function setupPointerRaycast(rendererDom) {
        let pointerDownX = 0, pointerDownY = 0;

        rendererDom.addEventListener('pointerdown', function (e) {
            pointerDownX = e.clientX;
            pointerDownY = e.clientY;
        });

        rendererDom.addEventListener('pointerup', function (e) {
            const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
            if (dist > 10) return;

            if (!sceneSetup || stage !== 'babak1' || isProcessing) return;

            const intersects = window.Engine3D.raycastObjects(
                e, activeContainer, sceneSetup.camera, rackHitboxes
            );

            if (intersects.length > 0) {
                const hit = intersects[0].object;
                if (hit.userData && hit.userData.rackId) {
                    sortShipmentToRack(hit.userData.rackId);
                }
            }
        });
    }

    /**
     * Render bottom HUD quick rack selector buttons for mobile / touch
     */
    function renderQuickRackButtons() {
        if (!activeContainer) return;
        let bar = activeContainer.querySelector('.warehouse-quick-bar');
        if (!bar) {
            bar = document.createElement('div');
            bar.className = 'warehouse-quick-bar';
            activeContainer.appendChild(bar);
        }

        bar.innerHTML = `
            <div class="quick-racks-strip">
                ${RACK_CONFIGS.map(function (r) {
                    return `
                        <button type="button" class="btn-quick-rack" data-rack="${r.id}" style="--rack-color: #${r.color.toString(16).padStart(6, '0')}">
                            <span class="qr-icon">${r.icon}</span>
                            <span class="qr-name">${r.name}</span>
                        </button>
                    `;
                }).join('')}
            </div>
        `;

        const btns = bar.querySelectorAll('.btn-quick-rack');
        btns.forEach(function (b) {
            b.addEventListener('click', function () {
                const rId = this.getAttribute('data-rack');
                sortShipmentToRack(rId);
            });
        });
    }

    /**
     * Animation Loop
     */
    let animFrameId = null;
    function animate() {
        animFrameId = requestAnimationFrame(animate);

        if (!sceneSetup) return;
        const dt = sceneSetup.clock.getDelta();
        const time = sceneSetup.clock.getElapsedTime();

        // Floating crate animation
        if (currentCrateGroup && !animCrate) {
            currentCrateGroup.position.y = crateBasePos.y + Math.sin(time * 2.5) * 0.05;
            currentCrateGroup.rotation.y = Math.sin(time * 1.2) * 0.15;
        }

        // Flying crate animation to rack
        if (animCrate) {
            animCrate.progress += dt * 2.2;
            if (animCrate.progress >= 1.0) {
                animCrate.mesh.position.copy(animCrate.targetPos);
                const cb = animCrate.onDone;
                animCrate = null;
                if (cb) cb();
            } else {
                animCrate.mesh.position.lerpVectors(animCrate.startPos, animCrate.targetPos, animCrate.progress);
                animCrate.mesh.position.y += Math.sin(animCrate.progress * Math.PI) * 1.5;
                animCrate.mesh.rotation.y += dt * 6;
            }
        }

        // Particle update
        for (let i = particleSystems.length - 1; i >= 0; i--) {
            const alive = particleSystems[i].update(dt);
            if (!alive) {
                particleSystems[i].dispose();
                particleSystems.splice(i, 1);
            }
        }

        sceneSetup.renderer.render(sceneSetup.scene, sceneSetup.camera);
    }

    /**
     * Public Module Interface
     */
    const Level2WarehouseSorter = {
        init: function (container, onComplete, onExit) {
            activeContainer = container;
            onFinishCallback = onComplete;
            onExitCallback = onExit;

            const dataObj = window.LEVEL_2_DATA || {};
            shipmentsList = dataObj.shipments || window.LEVEL_2_SHIPMENTS || [];
            scenariosList = dataObj.scenarios || window.LEVEL_2_SCENARIOS || [];

            stage = 'babak1';
            currentShipmentIdx = 0;
            correctShipments = 0;
            currentScenarioIdx = 0;
            correctScenarios = 0;
            score = 0;
            streak = 0;
            isProcessing = false;
            animCrate = null;
            particleSystems = [];

            const budget = getDeviceBudget();
            sceneSetup = window.Engine3D.createScene(container, budget);
            sceneSetup.camera.position.set(0, 3.2, 4.2);
            sceneSetup.camera.lookAt(0, 1.8, -1.0);

            window.Engine3D.setupLighting(sceneSetup.scene, budget, 0xffffff, 0.7);

            buildEnvironment(sceneSetup.scene, budget);
            setupPointerRaycast(sceneSetup.renderer.domElement);

            window.Engine3D.createHUD(container, {
                exitBtnId: 'btn-warehouse-exit',
                levelTag: 'MISI 2',
                title: 'Ruang Arsip OSIS (Warehouse Sorter)'
            });
            document.getElementById('btn-warehouse-exit').addEventListener('click', function () {
                if (onExitCallback) onExitCallback();
            });

            renderQuickRackButtons();

            if (shipmentsList.length > 0) {
                spawnCrate(shipmentsList[0]);
                updateMonitor(shipmentsList[0]);
            }

            animate();
        },

        dispose: function () {
            if (animFrameId) {
                cancelAnimationFrame(animFrameId);
                animFrameId = null;
            }

            particleSystems.forEach(function (ps) { ps.dispose(); });
            particleSystems = [];

            if (sceneSetup) {
                window.Engine3D.disposeScene(sceneSetup);
                sceneSetup = null;
            }

            if (activeContainer) {
                activeContainer.innerHTML = '';
                activeContainer = null;
            }

            currentCrateGroup = null;
            monitorMesh = null;
            scenarioMonitor = null;
            rackGroups = [];
            rackHitboxes = [];
            onFinishCallback = null;
            onExitCallback = null;
        }
    };

    window.Level2WarehouseSorter = Level2WarehouseSorter;
})();
