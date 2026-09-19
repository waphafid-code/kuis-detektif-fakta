/**
 * ============================================================
 * 🏫 SKUAD DIGITAL OSIS — 3D LOW-POLY SCHOOL HUB (hub.js)
 * ============================================================
 * Lobi sekretariat OSIS 3D low-poly interaktif untuk eksplorasi
 * stasiun level. Dioptimalkan untuk perangkat low-end
 * (Android RAM 2-3GB, <8k tris). Mendukung lazy-loading,
 * touch controls, fake contact shadows, WebGL context loss
 * recovery, Page Visibility pause, dan siklus hidup bersih.
 * ============================================================
 */

(function () {
    'use strict';

    // Metadata stasiun materi Informatika Fase E (konteks OSIS sekolah)
    const STATIONS_META = [
        {
            id: 0,
            title: 'Gate: Orientasi Skuad',
            shortName: 'GATE 0',
            atp: 'Konsep Dasar Semua Materi',
            bloom: 'C1 Mengingat',
            desc: 'Registrasi anggota baru Skuad Digital OSIS dan uji pemahaman istilah kunci sebelum misi pertama.',
            color: 0x3b82f6,
            icon: '🚪'
        },
        {
            id: 1,
            title: 'Misi 1: Inbox Detective',
            shortName: 'MISI 1',
            atp: 'Validitas Sumber Data (ITP 1.1-1.2)',
            bloom: 'C3 Menerapkan',
            desc: 'Saring 12 pesan masuk di grup angkatan & story IG OSIS: pisahkan fakta dari hoaks @infosmax_anon.',
            color: 0x10b981,
            icon: '🕵️'
        },
        {
            id: 2,
            title: 'Misi 2: Ruang Arsip OSIS (Warehouse Sorter)',
            shortName: 'MISI 2',
            atp: '7 Tipe Struktur Data & Penerapannya (ITP 2.1-2.2)',
            bloom: 'C2 Memahami',
            desc: 'Rapikan 12 kiriman berkas ke 7 rak fisik (Array, Stack, Queue, Tree, Linked List, Graph, Hash Table) & selesaikan 5 skenario kepanitiaan HUT.',
            color: 0xf59e0b,
            icon: '📦'
        },
        {
            id: 3,
            title: 'Misi 3: Lomba Algoritma',
            shortName: 'MISI 3',
            atp: 'Algoritma Standar (ITP 3.1-3.2)',
            bloom: 'C4 Menganalisis',
            desc: 'Adu cepat algoritma Binary Search vs Linear Search dan Bubble vs Selection Sort.',
            color: 0xec4899,
            icon: '⚡'
        },
        {
            id: 4,
            title: 'Misi 4: Dekomposisi Proker',
            shortName: 'MISI 4',
            atp: 'Berpikir Komputasional (Dekomposisi)',
            bloom: 'C4 Menganalisis',
            desc: 'Pecah program kerja OSIS yang rumit menjadi komponen-komponen kecil yang terkelola.',
            color: 0x8b5cf6,
            icon: '🧩'
        },
        {
            id: 5,
            title: 'Misi 5: Robo-Asisten OSIS',
            shortName: 'MISI 5',
            atp: 'Pseudocode & Diagram Alir (IPO)',
            bloom: 'C3-C4 Menerapkan',
            desc: 'Rancang instruksi logika dan alur Input-Proses-Output untuk bot asisten sekretariat.',
            color: 0x06b6d4,
            icon: '🤖'
        },
        {
            id: 6,
            title: 'Misi 6: Lab Komputer Sekolah',
            shortName: 'MISI 6',
            atp: 'Peranan Sistem Operasi',
            bloom: 'C5 Mengevaluasi',
            desc: 'Tangani masalah teknis di lab komputer: kelola memori, hak akses, dan manajemen proses OS.',
            color: 0x14b8a6,
            icon: '🖥️'
        },
        {
            id: 7,
            title: 'Misi 7: Presentasi ke Kepsek',
            shortName: 'MISI 7',
            atp: 'Proyek Integrasi Seluruh Materi',
            bloom: 'C6 Menciptakan',
            desc: 'Rancang alur kerja digital dan presentasikan bukti investigasi ke Kepala Sekolah.',
            color: 0xeab308,
            icon: '🏆'
        },
        {
            id: 'labtik',
            title: 'Lab TIK: Ahli Pencarian (Cari Aku Ya!)',
            shortName: 'LAB TIK',
            atp: 'Web Browser & Mesin Pencari (Search Operators)',
            bloom: 'C3 Menerapkan',
            desc: 'Bantu Divisi Riset OSIS menguasai operator mesin pencari (AND, OR, NOT, kutip) dan verifikasi kredibilitas sumber.',
            color: 0x06b6d4,
            icon: '🔍'
        }
    ];

    let scene = null;
    let camera = null;
    let renderer = null;
    let clock = null;
    let animFrameId = null;
    let isContextLost = false;

    let containerEl = null;
    let onSelectStationCb = null;
    let currentBudget = null;

    // Objek 3D interaktif
    const stationObjects = [];
    const interactiveMeshes = [];
    let isPaused = false;

    // Kontrol Kamera Orbit Sentuh & Mouse
    let isPointerDown = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerDownTime = 0;
    let cameraAngle = Math.PI / 4;
    let cameraTargetAngle = Math.PI / 4;
    let cameraPitch = 0.55;
    const cameraDistance = 14;

    // Raycasting
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    /**
     * Helper untuk membuat CanvasTexture beresolusi hemat memori (256x128)
     */
    function createBadgeTexture(text, subtitle, isUnlocked, colorHex) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = isUnlocked ? 'rgba(15, 23, 42, 0.92)' : 'rgba(30, 41, 59, 0.85)';
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(8, 8, 240, 112, 16);
        } else {
            ctx.rect(8, 8, 240, 112);
        }
        ctx.fill();

        ctx.lineWidth = 4;
        ctx.strokeStyle = isUnlocked ? `#${colorHex.toString(16).padStart(6, '0')}` : '#64748b';
        ctx.stroke();

        ctx.fillStyle = isUnlocked ? '#ffffff' : '#94a3b8';
        ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 50);

        ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        if (isUnlocked) {
            ctx.fillStyle = `#${colorHex.toString(16).padStart(6, '0')}`;
            ctx.fillText(subtitle, 128, 86);
        } else {
            ctx.fillStyle = '#ef4444';
            ctx.fillText('🔒 TERKUNCI', 128, 86);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        return texture;
    }

    /**
     * Membuat texture Mading Digital (menampilkan meterKepercayaanSekolah)
     */
    function createMadingTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        const meter = window.GameStorage ? window.GameStorage.getMeterKepercayaan() : { percentage: 50, color: '#f59e0b' };
        const pct = meter.percentage;

        // Background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(4, 4, 248, 120, 12);
        else ctx.rect(4, 4, 248, 120);
        ctx.fill();

        // Border
        ctx.lineWidth = 3;
        ctx.strokeStyle = meter.color;
        ctx.stroke();

        // Title
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('MADING DIGITAL OSIS', 128, 28);

        // Meter bar background
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(24, 42, 208, 18, 6);
        else ctx.rect(24, 42, 208, 18);
        ctx.fill();

        // Meter bar fill
        ctx.fillStyle = meter.color;
        const fillW = Math.max(4, (pct / 100) * 208);
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(24, 42, fillW, 18, 6);
        else ctx.rect(24, 42, fillW, 18);
        ctx.fill();

        // Percentage text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText(`${pct}%`, 128, 90);

        // Status text
        ctx.fillStyle = meter.color;
        ctx.font = '11px sans-serif';
        ctx.fillText('Kepercayaan Sekolah', 128, 112);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        return texture;
    }

    /**
     * Membangun Lobi Sekretariat OSIS Low-Poly
     */
    function buildOfficeEnvironment(budget) {
        const isTierLow = budget.tier === 'low';
        const MatClass = isTierLow ? THREE.MeshLambertMaterial : THREE.MeshStandardMaterial;

        // 1. Lantai
        const floorGeo = new THREE.PlaneGeometry(36, 36);
        const floorMat = new MatClass({ color: 0x0f172a, roughness: 0.8, metalness: 0.1 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = budget.shadows;
        scene.add(floor);
        scene.userData.floorMesh = floor;

        // Grid
        const grid = new THREE.GridHelper(32, 16, 0x1e293b, 0x1e293b);
        grid.position.y = 0.005;
        scene.add(grid);
        scene.userData.gridHelper = grid;

        // 2. Pilar Dekoratif
        const pillarGeo = new THREE.CylinderGeometry(0.35, 0.35, 6, isTierLow ? 6 : 8);
        const pillarMat = new MatClass({ color: 0x1e293b });
        [[-10,3,-10],[10,3,-10],[-10,3,10],[10,3,10]].forEach(([x,y,z]) => {
            const pillar = new THREE.Mesh(pillarGeo, pillarMat);
            pillar.position.set(x, y, z);
            scene.add(pillar);
            if (budget.fakeShadows) {
                const s = createFakeShadowDisc(0.7);
                s.position.set(x, 0.01, z);
                scene.add(s);
            }
        });

        // 3. Meja Pusat (Mading Digital OSIS)
        const centerDeskGeo = new THREE.CylinderGeometry(1.8, 2.0, 0.9, isTierLow ? 10 : 16);
        const centerDeskMat = new MatClass({ color: 0x1e293b, roughness: 0.5 });
        const centerDesk = new THREE.Mesh(centerDeskGeo, centerDeskMat);
        centerDesk.position.set(0, 0.45, 0);
        centerDesk.castShadow = budget.shadows;
        centerDesk.receiveShadow = budget.shadows;
        scene.add(centerDesk);

        // Mading Digital (CanvasTexture Sprite showing meter kepercayaan)
        const madingTexture = createMadingTexture();
        const madingMat = new THREE.SpriteMaterial({ map: madingTexture, transparent: true });
        const madingSprite = new THREE.Sprite(madingMat);
        madingSprite.position.set(0, 2.0, 0);
        madingSprite.scale.set(2.4, 1.2, 1.0);
        scene.add(madingSprite);
        scene.userData.madingSprite = madingSprite;
        scene.userData.madingTexture = madingTexture;

        if (budget.fakeShadows) {
            const centerShadow = createFakeShadowDisc(2.4);
            centerShadow.position.set(0, 0.01, 0);
            scene.add(centerShadow);
        }
    }

    function createFakeShadowDisc(radius) {
        const geo = new THREE.CircleGeometry(radius, 10);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.35,
            depthWrite: false
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        return mesh;
    }

    /**
     * Refresh Mading Digital texture (saat meter berubah)
     */
    function refreshMadingDisplay() {
        if (!scene || !scene.userData.madingSprite) return;
        if (scene.userData.madingTexture) {
            scene.userData.madingTexture.dispose();
        }
        const newTex = createMadingTexture();
        scene.userData.madingSprite.material.map = newTex;
        scene.userData.madingTexture = newTex;
    }

    /**
     * Membangun Stasiun Level Melingkar
     */
    function buildStations(budget) {
        const isTierLow = budget.tier === 'low';
        const MatClass = isTierLow ? THREE.MeshLambertMaterial : THREE.MeshStandardMaterial;
        const totalStations = STATIONS_META.length;
        const radius = 6.8;
        const storage = window.GameStorage;

        for (let i = 0; i < totalStations; i++) {
            const meta = STATIONS_META[i];
            const isUnlocked = true; // SEMUA LEVEL TERBUKA
            const isCompleted = storage ? storage.isLevelCompleted(meta.id) : false;
            const stars = storage ? storage.getLevelStars(meta.id) : 0;

            const angle = (i / totalStations) * Math.PI * 2 - Math.PI / 2;
            const posX = Math.cos(angle) * radius;
            const posZ = Math.sin(angle) * radius;

            const stationGroup = new THREE.Group();
            stationGroup.position.set(posX, 0, posZ);
            stationGroup.userData = {
                stationId: meta.id, meta, isUnlocked, isCompleted, stars,
                baseY: 0, floatPhase: i * 0.8
            };

            // Meja Pod
            const deskGeo = new THREE.CylinderGeometry(0.9, 1.0, 0.8, isTierLow ? 8 : 12);
            const deskMat = new MatClass({ color: isUnlocked ? 0x1e293b : 0x0f172a, roughness: 0.6 });
            const deskMesh = new THREE.Mesh(deskGeo, deskMat);
            deskMesh.position.y = 0.4;
            deskMesh.castShadow = budget.shadows;
            deskMesh.receiveShadow = budget.shadows;
            stationGroup.add(deskMesh);

            // Ring Neon
            const ringGeo = new THREE.RingGeometry(0.75, 0.9, isTierLow ? 8 : 14);
            const ringMat = new THREE.MeshBasicMaterial({ color: isUnlocked ? meta.color : 0x475569, side: THREE.DoubleSide });
            const ringMesh = new THREE.Mesh(ringGeo, ringMat);
            ringMesh.rotation.x = -Math.PI / 2;
            ringMesh.position.y = 0.81;
            stationGroup.add(ringMesh);

            // Terminal Screen
            const screenGeo = new THREE.BoxGeometry(0.6, 0.45, 0.08);
            const screenMat = new MatClass({
                color: isUnlocked ? meta.color : 0x334155,
                emissive: isUnlocked ? meta.color : 0x000000,
                emissiveIntensity: isUnlocked ? 0.35 : 0
            });
            const screenMesh = new THREE.Mesh(screenGeo, screenMat);
            screenMesh.position.set(0, 1.15, 0);
            screenMesh.rotation.y = -angle + Math.PI;
            stationGroup.add(screenMesh);

            // Badge Sprite
            const badgeTexture = createBadgeTexture(
                meta.shortName,
                isUnlocked ? (isCompleted ? `SELESAI ★${stars}` : 'MASUK ➔') : 'TERKUNCI',
                isUnlocked, meta.color
            );
            const spriteMat = new THREE.SpriteMaterial({ map: badgeTexture, transparent: true });
            const badgeSprite = new THREE.Sprite(spriteMat);
            badgeSprite.position.set(0, 2.2, 0);
            badgeSprite.scale.set(1.8, 0.9, 1.0);
            stationGroup.add(badgeSprite);
            stationGroup.userData.badgeSprite = badgeSprite;
            stationGroup.userData.badgeTexture = badgeTexture;

            // Fake Shadow
            if (budget.fakeShadows) {
                const shadow = createFakeShadowDisc(1.2);
                shadow.position.set(0, 0.01, 0);
                stationGroup.add(shadow);
            }

            // Hitbox (touch-friendly)
            const hitGeo = new THREE.BoxGeometry(2.0, 2.8, 2.0);
            const hitMat = new THREE.MeshBasicMaterial({ visible: false });
            const hitMesh = new THREE.Mesh(hitGeo, hitMat);
            hitMesh.position.y = 1.2;
            hitMesh.userData = { parentStationGroup: stationGroup };
            stationGroup.add(hitMesh);

            scene.add(stationGroup);
            stationObjects.push(stationGroup);
            interactiveMeshes.push(hitMesh);
        }
    }

    function refreshStationStates() {
        const storage = window.GameStorage;
        if (!storage) return;

        stationObjects.forEach((group) => {
            const id = group.userData.stationId;
            const meta = group.userData.meta;
            const isUnlocked = true;
            const isCompleted = storage.isLevelCompleted(id);
            const stars = storage.getLevelStars(id);

            group.userData.isUnlocked = isUnlocked;
            group.userData.isCompleted = isCompleted;
            group.userData.stars = stars;

            if (group.userData.badgeSprite && group.userData.badgeTexture) {
                group.userData.badgeTexture.dispose();
                const newTexture = createBadgeTexture(
                    meta.shortName,
                    isUnlocked ? (isCompleted ? `SELESAI ★${stars}` : 'MASUK ➔') : 'TERKUNCI',
                    isUnlocked, meta.color
                );
                group.userData.badgeSprite.material.map = newTexture;
                group.userData.badgeTexture = newTexture;
            }
        });

        // Refresh mading digital juga
        refreshMadingDisplay();
    }

    function setupLighting(budget) {
        const ambient = new THREE.AmbientLight(0xffffff, budget.tier === 'low' ? 0.9 : 0.6);
        scene.add(ambient);
        scene.userData.ambientLight = ambient;

        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(8, 14, 10);

        if (budget.shadows) {
            dirLight.castShadow = true;
            dirLight.shadow.mapSize.width = budget.maxTextureSize || 512;
            dirLight.shadow.mapSize.height = budget.maxTextureSize || 512;
            dirLight.shadow.camera.near = 0.5;
            dirLight.shadow.camera.far = 30;
            dirLight.shadow.camera.left = -12;
            dirLight.shadow.camera.right = 12;
            dirLight.shadow.camera.top = 12;
            dirLight.shadow.camera.bottom = -12;
            dirLight.shadow.bias = -0.002;
        }

        scene.add(dirLight);

        if (budget.tier !== 'low') {
            const pointLight = new THREE.PointLight(0x38bdf8, 1.2, 12);
            pointLight.position.set(0, 2.5, 0);
            scene.add(pointLight);
        }
    }

    // === INPUT HANDLERS ===

    function setupInputHandlers() {
        const dom = renderer.domElement;

        function getPointerPos(e) {
            if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            return { x: e.clientX, y: e.clientY };
        }

        function onDown(e) {
            if (isPaused || isContextLost) return;
            isPointerDown = true;
            const pos = getPointerPos(e);
            pointerStartX = pos.x;
            pointerStartY = pos.y;
            pointerDownTime = performance.now();
        }

        function onMove(e) {
            if (!isPointerDown || isPaused || isContextLost) return;
            const pos = getPointerPos(e);
            cameraTargetAngle += (pos.x - pointerStartX) * 0.005;
            cameraPitch = Math.max(0.2, Math.min(1.1, cameraPitch - (pos.y - pointerStartY) * 0.003));
            pointerStartX = pos.x;
            pointerStartY = pos.y;
        }

        function onUp(e) {
            if (!isPointerDown) return;
            isPointerDown = false;
            const duration = performance.now() - pointerDownTime;
            const pos = (e.changedTouches && e.changedTouches.length > 0)
                ? { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
                : { x: e.clientX, y: e.clientY };
            if (duration < 350) {
                handleTap(pos.x, pos.y);
            }
        }

        dom.addEventListener('pointerdown', onDown, { passive: true });
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerup', onUp, { passive: true });
        window.addEventListener('pointercancel', () => { isPointerDown = false; }, { passive: true });

        dom.addEventListener('wheel', (e) => {
            if (isPaused || isContextLost) return;
            cameraTargetAngle += e.deltaX * 0.001;
        }, { passive: true });
    }

    function handleTap(clientX, clientY) {
        if (!containerEl || isPaused || isContextLost) return;

        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes, false);

        if (intersects.length > 0) {
            const hitMesh = intersects[0].object;
            const parentGroup = hitMesh.userData.parentStationGroup;
            if (parentGroup && onSelectStationCb) {
                onSelectStationCb(parentGroup.userData.stationId, parentGroup.userData);
            }
        }
    }

    // === RENDER LOOP ===

    function animate() {
        animFrameId = requestAnimationFrame(animate);
        if (isPaused || !clock || isContextLost) return;

        const rawDelta = clock.getDelta();
        const dt = Math.min(rawDelta, 0.1);
        const elapsedTime = clock.getElapsedTime();

        cameraAngle += (cameraTargetAngle - cameraAngle) * 0.08;
        const camX = Math.cos(cameraAngle) * Math.cos(cameraPitch) * cameraDistance;
        const camY = Math.sin(cameraPitch) * cameraDistance;
        const camZ = Math.sin(cameraAngle) * Math.cos(cameraPitch) * cameraDistance;
        camera.position.set(camX, camY, camZ);
        camera.lookAt(0, 1.0, 0);

        // Floating bobbing untuk badge stasiun terbuka
        stationObjects.forEach((group) => {
            if (group.userData.isUnlocked && group.userData.badgeSprite) {
                const floatOffset = Math.sin(elapsedTime * 2.0 + group.userData.floatPhase) * 0.08;
                group.userData.badgeSprite.position.y = 2.2 + floatOffset;
            }
        });

        renderer.render(scene, camera);
    }

    function handleResize() {
        if (!renderer || !camera || !containerEl) return;
        const width = containerEl.clientWidth || window.innerWidth;
        const height = containerEl.clientHeight || window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    // === WebGL CONTEXT LOSS HANDLING ===

    function setupContextLossHandlers() {
        if (!renderer || !renderer.domElement) return;
        const canvas = renderer.domElement;

        canvas.addEventListener('webglcontextlost', function (e) {
            e.preventDefault();
            isContextLost = true;
            isPaused = true;
            console.warn('⚠️ WebGL context lost. Pausing hub scene.');
        }, false);

        canvas.addEventListener('webglcontextrestored', function () {
            console.log('✅ WebGL context restored. Re-initializing scene.');
            isContextLost = false;

            // Re-build scene tanpa kehilangan progres
            if (scene) {
                scene.traverse((obj) => dispose3DObject(obj));
            }
            stationObjects.length = 0;
            interactiveMeshes.length = 0;

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x0b0f19);

            buildOfficeEnvironment(currentBudget);
            buildStations(currentBudget);
            setupLighting(currentBudget);

            isPaused = false;
            if (clock) clock.getDelta();
        }, false);
    }

    // === PAGE VISIBILITY ===

    function setupVisibilityHandler() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                isPaused = true;
            } else {
                if (!isContextLost) {
                    isPaused = false;
                    if (clock) clock.getDelta();
                }
            }
        });
    }

    // === DISPOSAL ===

    function dispose3DObject(obj) {
        if (!obj) return;
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(disposeMaterial);
            } else {
                disposeMaterial(obj.material);
            }
        }
        while (obj.children && obj.children.length > 0) {
            dispose3DObject(obj.children[0]);
            obj.remove(obj.children[0]);
        }
    }

    function disposeMaterial(mat) {
        if (!mat) return;
        if (mat.map) mat.map.dispose();
        if (mat.lightMap) mat.lightMap.dispose();
        if (mat.bumpMap) mat.bumpMap.dispose();
        if (mat.normalMap) mat.normalMap.dispose();
        if (mat.specularMap) mat.specularMap.dispose();
        if (mat.envMap) mat.envMap.dispose();
        mat.dispose();
    }

    // === PUBLIC API ===

    const HubScene = {
        init: function (container, deviceTierBudget, onSelectStation) {
            containerEl = container;
            currentBudget = deviceTierBudget || {
                tier: 'low', shadows: false, fakeShadows: true,
                pixelRatio: 1.0, antialias: false
            };
            onSelectStationCb = onSelectStation;

            const width = container.clientWidth || window.innerWidth;
            const height = container.clientHeight || window.innerHeight;

            scene = new THREE.Scene();
            scene.background = new THREE.Color(0x0b0f19);

            camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 60);

            renderer = new THREE.WebGLRenderer({
                antialias: currentBudget.antialias,
                powerPreference: 'low-power'
            });
            renderer.setSize(width, height);
            renderer.setPixelRatio(currentBudget.pixelRatio);

            if (currentBudget.shadows) {
                renderer.shadowMap.enabled = true;
                renderer.shadowMap.type = THREE.PCFShadowMap;
            }

            container.innerHTML = '';
            container.appendChild(renderer.domElement);

            clock = new THREE.Clock();

            buildOfficeEnvironment(currentBudget);
            buildStations(currentBudget);
            setupLighting(currentBudget);
            setupInputHandlers();
            setupContextLossHandlers();
            setupVisibilityHandler();

            window.addEventListener('resize', handleResize);

            isPaused = false;
            isContextLost = false;
            animate();
        },

        refreshStationStates: function () {
            refreshStationStates();
        },

        pause: function () {
            isPaused = true;
        },

        resume: function () {
            isPaused = false;
            if (clock) clock.getDelta();
            this.refreshStationStates();
        },

        setTheme: function (theme) {
            // Hub selalu dark mode — fungsi ini hanya untuk kompatibilitas
            if (!scene) return;
            scene.background.set(0x0b0f19);
        },

        dispose: function () {
            this.pause();
            if (animFrameId) {
                cancelAnimationFrame(animFrameId);
                animFrameId = null;
            }

            window.removeEventListener('resize', handleResize);

            if (scene) {
                scene.traverse((obj) => dispose3DObject(obj));
                scene = null;
            }

            if (renderer) {
                renderer.dispose();
                if (renderer.domElement && renderer.domElement.parentNode) {
                    renderer.domElement.parentNode.removeChild(renderer.domElement);
                }
                renderer = null;
            }

            stationObjects.length = 0;
            interactiveMeshes.length = 0;
            clock = null;
            containerEl = null;
            onSelectStationCb = null;
        }
    };

    window.HubScene = HubScene;
})();
