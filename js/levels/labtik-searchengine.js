/**
 * ============================================================
 * 🖥️ LAB TIK: 3D CYBER RESEARCH LAB & SEARCH ENGINE
 * ============================================================
 * Full 3D Interactive Lab TIK environment:
 * - 3D Cyber Lab room with server racks and holographic portal
 * - Babak 1: 3D Terminal Fungsi Browser
 * - Babak 2: 3D Pipeline Visualizer (Crawling -> Indexing -> Ranking)
 * - Babak 3: 3D Holographic Search Engine (Boolean Operators & Results)
 * - Babak 4: 3D Credibility Source Analyzer
 * ============================================================
 */

(function () {
    'use strict';

    let activeContainer = null;
    let onFinishCallback = null;
    let onExitCallback = null;
    let sceneSetup = null;

    // State
    let currentStage = 'briefing'; // briefing, babak1, babak2, babak3, summary
    let score = 0;
    let currentMissionIdx = 0;
    let missions = [];
    let dummyResults = [];

    // 3D Objects
    let terminalMesh = null;
    let portalRing = null;
    let serverRacks = [];
    let particleSystems = [];
    let pipelineNodes = [];
    let pipelinePackets = [];

    function getPlayerName() {
        return (window.GameStorage && window.GameStorage.getPlayerName()) || 'Detektif Muda';
    }

    function getDeviceBudget() {
        return (window.DeviceTier && window.DeviceTier.getBudget()) || {
            tier: 'low', shadows: false, pixelRatio: 1.0, antialias: false
        };
    }

    /**
     * Build 3D Cyber Lab Environment
     */
    function buildEnvironment(scene, budget) {
        const E = window.Engine3D;

        // Cyber Floor
        const floor = E.createFloor(20, 0x070b14, 0x0e7490, budget);
        scene.add(floor);

        // Holographic Data Portal Ring (background)
        portalRing = E.createNeonRing(3.2, 0x06b6d4, 0.08);
        portalRing.position.set(0, 3.2, -4.5);
        scene.add(portalRing);

        const innerRing = E.createNeonRing(2.4, 0x3b82f6, 0.05);
        innerRing.position.set(0, 3.2, -4.45);
        scene.add(innerRing);

        // Server Towers on left & right
        serverRacks = [];
        [-4, 4].forEach(function (xPos) {
            for (let z = -2; z <= 2; z += 2) {
                const rackGeo = new THREE.BoxGeometry(1.2, 3.8, 0.9);
                const rackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 });
                const rack = new THREE.Mesh(rackGeo, rackMat);
                rack.position.set(xPos, 1.9, z);
                scene.add(rack);

                // LED lights
                for (let l = 0; l < 4; l++) {
                    const led = new THREE.Mesh(
                        new THREE.SphereGeometry(0.04, 6, 6),
                        new THREE.MeshBasicMaterial({ color: (l % 2 === 0 ? 0x22c55e : 0x06b6d4) })
                    );
                    led.position.set(xPos + (xPos > 0 ? -0.61 : 0.61), 1.2 + l * 0.6, z);
                    scene.add(led);
                }
                serverRacks.push(rack);
            }
        });

        // Floating Main Holographic Terminal (center)
        const tCanvas = document.createElement('canvas');
        tCanvas.width = 800;
        tCanvas.height = 460;
        const tTex = new THREE.CanvasTexture(tCanvas);
        tTex.minFilter = THREE.LinearFilter;
        tTex.generateMipmaps = false;

        terminalMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(4.8, 2.76),
            new THREE.MeshBasicMaterial({ map: tTex, side: THREE.DoubleSide })
        );
        terminalMesh.position.set(0, 2.3, -1.2);
        terminalMesh.userData._canvas = tCanvas;
        terminalMesh.userData._texture = tTex;
        scene.add(terminalMesh);
    }

    /**
     * Render Briefing Stage
     */
    function renderBriefing() {
        currentStage = 'briefing';
        const canvas = terminalMesh.userData._canvas;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(7, 15, 30, 0.96)';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, W - 8, H - 8);

        // Header
        ctx.fillStyle = '#083344';
        ctx.fillRect(6, 6, W - 12, 54);
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#22d3ee';
        ctx.textAlign = 'left';
        ctx.fillText('⚡ LAB TIK: CYBER RESEARCH TERMINAL', 24, 40);

        // Mentor info
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(`Selamat Datang, ${getPlayerName()}!`, 24, 100);

        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Mentor: Kak Bimo (Kadiv Riset Digital OSIS)', 24, 135);

        // Dialogue
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '19px sans-serif';
        const lines = [
            'Di era informasi, mesin pencari adalah senjata investigasi terkuat kita.',
            'Namun, 80% siswa salah menggunakan kata kunci dan termakan konten jebakan.',
            'Di lab ini, kamu akan menguasai cara kerja search engine (Crawling, Indexing,',
            'Ranking) dan logika operator Boolean (AND, OR, NOT, Frasa Eksak).'
        ];
        lines.forEach(function (l, i) {
            ctx.fillText(l, 24, 185 + i * 30);
        });

        // Target badge
        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fillRect(20, H - 90, W - 40, 65);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, H - 90, W - 40, 65);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'italic 18px sans-serif';
        ctx.fillText('🎯 Target: Selesaikan 4 Babak untuk mengantongi Sertifikat Cyber Researcher!', 32, H - 52);

        terminalMesh.userData._texture.needsUpdate = true;

        // HTML Overlay Button
        showStageOverlay(`
            <div class="labtik-overlay-card">
                <button type="button" class="btn-action-primary" id="btn-start-lab-b1">
                    Mulai Babak 1: Fungsi Browser ➔
                </button>
            </div>
        `);
        document.getElementById('btn-start-lab-b1').addEventListener('click', function () {
            if (window.GameUI) window.GameUI.playSynth('tap');
            startBabak1();
        });
    }

    /**
     * Babak 1: Fungsi Web Browser
     */
    function startBabak1() {
        currentStage = 'babak1';
        const canvas = terminalMesh.userData._canvas;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(7, 15, 30, 0.96)';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, W - 8, H - 8);

        ctx.fillStyle = '#172554';
        ctx.fillRect(6, 6, W - 12, 54);
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#60a5fa';
        ctx.fillText('🌐 BABAK 1: VERIFIKASI FUNGSI WEB BROWSER', 24, 40);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('Manakah fungsi utama Web Browser yang tepat?', 24, 105);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '19px sans-serif';
        ctx.fillText('Pilih item yang merupakan tugas browser komputer:', 24, 145);

        terminalMesh.userData._texture.needsUpdate = true;

        const options = [
            { text: 'Menerjemahkan kode HTML/CSS/JS menjadi tampilan visual web', correct: true },
            { text: 'Memperbaiki kerusakan fisik kabel monitor dan harddisk', correct: false },
            { text: 'Mengirim permintaan HTTP/HTTPS ke server & menampilkan respons', correct: true },
            { text: 'Membuat aplikasi game Android dari nol', correct: false }
        ];

        let selected = [];

        showStageOverlay(`
            <div class="labtik-overlay-card">
                <div class="browser-options-grid">
                    ${options.map(function (opt, idx) {
                        return `
                            <button type="button" class="btn-check-option" data-idx="${idx}">
                                <span class="chk-box">☐</span>
                                <span class="chk-text">${opt.text}</span>
                            </button>
                        `;
                    }).join('')}
                </div>
                <button type="button" class="btn-action-primary" id="btn-submit-b1" style="margin-top: 15px;">
                    Verifikasi Jawaban ➔
                </button>
            </div>
        `);

        const btns = activeContainer.querySelectorAll('.btn-check-option');
        btns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                const idx = parseInt(this.getAttribute('data-idx'), 10);
                if (selected.includes(idx)) {
                    selected = selected.filter(function (i) { return i !== idx; });
                    this.classList.remove('selected');
                    this.querySelector('.chk-box').textContent = '☐';
                } else {
                    selected.push(idx);
                    this.classList.add('selected');
                    this.querySelector('.chk-box').textContent = '☑';
                }
                if (window.GameUI) window.GameUI.playSynth('tap');
            });
        });

        document.getElementById('btn-submit-b1').addEventListener('click', function () {
            const correctIndices = [0, 2];
            const isAllCorrect = (selected.length === 2 && selected.includes(0) && selected.includes(2));

            if (isAllCorrect) {
                score += 150;
                if (window.GameUI) window.GameUI.playSynth('success');
            } else {
                if (window.GameUI) window.GameUI.playSynth('error');
            }

            window.Engine3D.showFeedback3D(
                activeContainer,
                isAllCorrect,
                isAllCorrect ? 'ANALISIS TEPAT!' : 'PERLU PERBAIKAN!',
                isAllCorrect
                    ? 'Browser bertugas mem-parsing kode web & mengirim HTTP request, bukan memperbaiki hardware atau membuat app Android!'
                    : 'Jawaban benar: Browser menerjemahkan HTML/CSS/JS dan berkomunikasi lewat HTTP request.',
                2800
            );

            setTimeout(function () {
                startBabak2();
            }, 3000);
        });
    }

    /**
     * Babak 2: 3D Pipeline Visualizer (Crawling -> Indexing -> Ranking)
     */
    function startBabak2() {
        currentStage = 'babak2';
        const canvas = terminalMesh.userData._canvas;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(7, 15, 30, 0.96)';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, W - 8, H - 8);

        ctx.fillStyle = '#064e3b';
        ctx.fillRect(6, 6, W - 12, 54);
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#34d399';
        ctx.fillText('⚙️ BABAK 2: 3 TAHAP UTAMA CARA KERJA SEARCH ENGINE', 24, 40);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('Susun urutan kerja mesin pencari dari awal hingga hasil tampil:', 24, 105);

        terminalMesh.userData._texture.needsUpdate = true;

        // Build 3D pipeline nodes in scene
        build3DPipelineVisuals();

        const steps = [
            { id: 'crawl', name: '1. Crawling (Bot Laba-laba Menjelajahi Tautan Web)', correctOrder: 1 },
            { id: 'index', name: '2. Indexing (Mengorganisasi & Menyimpan Kata ke Database Raksasa)', correctOrder: 2 },
            { id: 'rank', name: '3. Ranking & Serving (Menilai Relevansi & Menampilkan Hasil Terbaik)', correctOrder: 3 }
        ];

        let currentOrder = [];

        showStageOverlay(`
            <div class="labtik-overlay-card">
                <p style="color: #94a3b8; margin-bottom: 10px;">Klik tombol sesuai urutan alur data search engine (Langkah 1 s.d 3):</p>
                <div class="pipeline-buttons-col">
                    <button type="button" class="btn-pipeline-step" data-step="index">
                        🗄️ Indexing (Katalogisasi Data ke Indeks)
                    </button>
                    <button type="button" class="btn-pipeline-step" data-step="crawl">
                        🕷️ Crawling (Bot Menjelajahi Tautan Web)
                    </button>
                    <button type="button" class="btn-pipeline-step" data-step="rank">
                        🏆 Ranking (Pemeringkatan Hasil Otoritas & Relevansi)
                    </button>
                </div>
                <div class="pipeline-order-display" id="pipeline-order-display">
                    Urutan Dipilih: <span id="pipeline-chosen-seq">-</span>
                </div>
                <button type="button" class="btn-action-primary" id="btn-submit-b2" style="margin-top: 12px;" disabled>
                    Jalankan Pipeline Data ➔
                </button>
            </div>
        `);

        const pBtns = activeContainer.querySelectorAll('.btn-pipeline-step');
        pBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                const s = this.getAttribute('data-step');
                if (currentOrder.includes(s)) return;
                currentOrder.push(s);
                this.disabled = true;
                this.style.opacity = '0.5';

                const display = document.getElementById('pipeline-chosen-seq');
                display.textContent = currentOrder.join(' ➔ ').toUpperCase();

                if (window.GameUI) window.GameUI.playSynth('tap');

                if (currentOrder.length === 3) {
                    document.getElementById('btn-submit-b2').disabled = false;
                }
            });
        });

        document.getElementById('btn-submit-b2').addEventListener('click', function () {
            const isCorrect = (currentOrder[0] === 'crawl' && currentOrder[1] === 'index' && currentOrder[2] === 'rank');
            if (isCorrect) {
                score += 150;
                if (window.GameUI) window.GameUI.playSynth('success');
            } else {
                if (window.GameUI) window.GameUI.playSynth('error');
            }

            // Particle pulse on pipeline
            if (sceneSetup) {
                const ps = window.Engine3D.createParticleBurst(sceneSetup.scene, new THREE.Vector3(0, 3.2, -4.4), 0x34d399, 30);
                particleSystems.push(ps);
            }

            window.Engine3D.showFeedback3D(
                activeContainer,
                isCorrect,
                isCorrect ? 'PIPELINE AKTIF DENGAN SEMPURNA!' : 'URUTAN BELUM TEPAT!',
                'Alur resmi mesin pencari selalu: 1. CRAWLING (menjelajah web) ➔ 2. INDEXING (menyimpan kata kunci) ➔ 3. RANKING (menampilkan urutan skor tertinggi).',
                3000
            );

            setTimeout(function () {
                startBabak3();
            }, 3200);
        });
    }

    /**
     * Build 3D pipeline nodes
     */
    function build3DPipelineVisuals() {
        if (!sceneSetup) return;
        const scene = sceneSetup.scene;

        pipelineNodes.forEach(function (n) { scene.remove(n); });
        pipelineNodes = [];

        [-1.8, 0, 1.8].forEach(function (x, i) {
            const node = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.35, 0.15, 16),
                new THREE.MeshStandardMaterial({
                    color: (i === 0 ? 0x3b82f6 : (i === 1 ? 0x10b981 : 0xf59e0b)),
                    metalness: 0.5
                })
            );
            node.rotation.x = Math.PI / 2;
            node.position.set(x, 4.2, -3.5);
            scene.add(node);
            pipelineNodes.push(node);
        });
    }

    /**
     * Babak 3: 3D Holographic Search Engine (Boolean Operators)
     */
    function startBabak3() {
        currentStage = 'babak3';
        currentMissionIdx = 0;
        missions = (window.LABTIK_DATA && window.LABTIK_DATA.missions) || [];
        dummyResults = (window.LABTIK_DATA && window.LABTIK_DATA.dummyResults) || [];

        presentSearchMission();
    }

    /**
     * Present individual search mission in Babak 3
     */
    function presentSearchMission() {
        if (currentMissionIdx >= missions.length) {
            finishLabTIK();
            return;
        }

        const mission = missions[currentMissionIdx];
        const canvas = terminalMesh.userData._canvas;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(7, 15, 30, 0.96)';
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 6;
        ctx.strokeRect(4, 4, W - 8, H - 8);

        // Header
        ctx.fillStyle = '#0e7490';
        ctx.fillRect(6, 6, W - 12, 54);
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#cffafe';
        ctx.fillText(`🔍 BABAK 3: SIMULASI PENCARIAN (MISI ${currentMissionIdx + 1}/${missions.length})`, 24, 40);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#fbbf24';
        ctx.fillText(`SKOR: ${score}`, W - 24, 40);

        // Instruction
        ctx.textAlign = 'left';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Instruksi Kebutuhan OSIS:', 24, 100);

        ctx.font = '19px sans-serif';
        ctx.fillStyle = '#cbd5e1';
        // Strip HTML tags for canvas rendering
        const cleanInstruction = mission.instruction.replace(/<\/?[^>]+(>|$)/g, '');
        const insLines = window.Engine3D._wrapText(ctx, cleanInstruction, W - 48);
        insLines.forEach(function (l, idx) {
            ctx.fillText(l, 24, 135 + idx * 28);
        });

        // Hint box
        const hintY = H - 85;
        ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
        ctx.fillRect(20, hintY, W - 40, 65);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, hintY, W - 40, 65);

        ctx.font = 'italic 18px sans-serif';
        ctx.fillStyle = '#67e8f9';
        ctx.fillText(`💡 Petunjuk Sintaks: ${mission.hint}`, 32, hintY + 38);

        terminalMesh.userData._texture.needsUpdate = true;

        // Render Search Query Input Simulator in Overlay
        renderSearchSimulatorOverlay(mission);
    }

    /**
     * Render Query Input and Filter Simulator
     */
    function renderSearchSimulatorOverlay(mission) {
        showStageOverlay(`
            <div class="labtik-overlay-card">
                <div class="search-input-box">
                    <input type="text" id="input-search-query" class="input-query-field" 
                        placeholder='Ketik kata kunci & operator (contoh: "frasa" kata -pengecualian OR pilihan)...' />
                    <button type="button" class="btn-action-primary" id="btn-execute-search">
                        Cari 🔍
                    </button>
                </div>
                <div class="search-helper-chips">
                    <span class="chip-label">Sisipkan Operator:</span>
                    <button type="button" class="btn-chip" data-insert='""'>Frasa Eksak (" ")</button>
                    <button type="button" class="btn-chip" data-insert='OR'>Pilihan (OR)</button>
                    <button type="button" class="btn-chip" data-insert='-'>Pengecualian (-)</button>
                </div>
                <div id="search-results-area" class="search-results-container" style="display:none;"></div>
            </div>
        `);

        const inputField = document.getElementById('input-search-query');
        inputField.focus();

        const chips = activeContainer.querySelectorAll('.btn-chip');
        chips.forEach(function (c) {
            c.addEventListener('click', function () {
                const ins = this.getAttribute('data-insert');
                inputField.value += (inputField.value.length > 0 ? ' ' : '') + ins;
                inputField.focus();
                if (window.GameUI) window.GameUI.playSynth('tap');
            });
        });

        document.getElementById('btn-execute-search').addEventListener('click', function () {
            executeSearchQuery(mission, inputField.value.trim());
        });

        inputField.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                executeSearchQuery(mission, inputField.value.trim());
            }
        });
    }

    /**
     * Evaluate the Search Query and display matching 3D results
     */
    function executeSearchQuery(mission, query) {
        if (!query) {
            if (window.GameUI) window.GameUI.showToast('Ketikkan kata kunci pencarian terlebih dahulu!', 'info', 2500);
            return;
        }

        const qLower = query.toLowerCase();
        const expLower = mission.expectedQuery.toLowerCase();

        // Check if query contains core required syntax
        const hasQuotes = (expLower.includes('"') ? qLower.includes('"') : true);
        const hasMinus = (expLower.includes('-') ? qLower.includes('-') : true);
        const hasOR = (expLower.includes('or') ? (query.includes('OR') || qLower.includes('or')) : true);

        const isSyntaxValid = hasQuotes && hasMinus && hasOR;

        // Filter results matching targetDocIds
        const matchedDocs = dummyResults.filter(function (doc) {
            return mission.targetDocIds.includes(doc.id);
        });

        const resultsArea = document.getElementById('search-results-area');
        resultsArea.style.display = 'block';

        if (isSyntaxValid && matchedDocs.length > 0) {
            score += 120;
            if (window.GameUI) window.GameUI.playSynth('success');

            resultsArea.innerHTML = `
                <div class="results-banner-success">
                    ✅ <strong>SINTAKS PENCARIAN TEPAT!</strong> Menemukan ${matchedDocs.length} sumber yang relevan:
                </div>
                ${matchedDocs.map(function (doc) {
                    return `
                        <div class="result-card-item">
                            <span class="res-url">${doc.url}</span>
                            <h4 class="res-title">${doc.title}</h4>
                            <p class="res-snippet">${doc.snippet}</p>
                            <span class="res-cred-tag ${doc.isCredible ? 'cred-true' : 'cred-false'}">
                                ${doc.isCredible ? '🛡️ Sumber Kredibel & Sesuai' : '⚠️ Sumber Tidak Kredibel'}
                            </span>
                        </div>
                    `;
                }).join('')}
                <button type="button" class="btn-action-primary" id="btn-next-mission" style="margin-top: 10px;">
                    Lanjut ke Misi Berikutnya ➔
                </button>
            `;

            document.getElementById('btn-next-mission').addEventListener('click', function () {
                currentMissionIdx++;
                presentSearchMission();
            });
        } else {
            if (window.GameUI) window.GameUI.playSynth('error');

            resultsArea.innerHTML = `
                <div class="results-banner-wrong">
                    ❌ <strong>HASIL KURANG SPESIFIK / OPERATOR BELUM TEPAT</strong>
                    <p>Format yang diharapkan mirip: <code>${mission.expectedQuery}</code></p>
                    <p style="font-size: 0.85rem; color: #cbd5e1;">Periksa kembali tanda kutip "", huruf besar OR, atau tanda minus (-).</p>
                </div>
                <button type="button" class="btn-action-secondary" id="btn-retry-query" style="margin-top: 8px;">
                    Coba Lagi ↺
                </button>
                <button type="button" class="btn-action-primary" id="btn-bypass-query" style="margin-top: 8px; margin-left: 8px;">
                    Gunakan Jawaban Resmi & Lanjut ➔
                </button>
            `;

            document.getElementById('btn-retry-query').addEventListener('click', function () {
                resultsArea.style.display = 'none';
            });

            document.getElementById('btn-bypass-query').addEventListener('click', function () {
                score += 50;
                currentMissionIdx++;
                presentSearchMission();
            });
        }
    }

    /**
     * Finish Lab TIK and Show Summary
     */
    function finishLabTIK() {
        currentStage = 'summary';

        if (window.GameStorage) {
            window.GameStorage.completeLevel('labtik', score, 3, "Master Web Browser & Operator Boolean Search");
            window.GameStorage.updateMeterKepercayaan(15);
        }

        if (window.GameUI) {
            window.GameUI.playSynth('levelUp');
        }

        // Particle burst
        if (sceneSetup) {
            const ps = window.Engine3D.createParticleBurst(sceneSetup.scene, new THREE.Vector3(0, 3, -1.2), 0x06b6d4, 35);
            particleSystems.push(ps);
        }

        showStageOverlay(`
            <div class="labtik-overlay-card card-summary">
                <div class="summary-header">
                    <h2>🏆 LAB TIK TUNTAS — CYBER RESEARCHER!</h2>
                    <div class="summary-stars">⭐⭐⭐</div>
                </div>
                <div class="summary-stats-grid">
                    <div class="stat-box">
                        <span class="stat-label">TOTAL SKOR</span>
                        <span class="stat-val">${score}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">STATUS</span>
                        <span class="stat-val">LULUS</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">KOMPETENSI</span>
                        <span class="stat-val">Search Engine & Browser</span>
                    </div>
                </div>
                <div class="summary-badge-reward">
                    <span class="badge-icon">🔬</span>
                    <div>
                        <strong>Gelar: Peneliti Digital Handal</strong>
                        <p>Menguasai perayap web, indexing, dan formula operator boolean (AND, OR, NOT, "").</p>
                    </div>
                </div>
                <button type="button" class="btn-action-primary" id="btn-labtik-finish">
                    Kembali ke Lobi ➔
                </button>
            </div>
        `);

        document.getElementById('btn-labtik-finish').addEventListener('click', function () {
            if (onFinishCallback) {
                onFinishCallback({ score: score, stars: 3 });
            } else if (onExitCallback) {
                onExitCallback();
            }
        });
    }

    /**
     * Helper to show overlay HTML on top of 3D canvas
     */
    function showStageOverlay(html) {
        if (!activeContainer) return;
        let overlay = activeContainer.querySelector('.labtik-stage-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'labtik-stage-overlay';
            activeContainer.appendChild(overlay);
        }
        overlay.innerHTML = html;
        overlay.style.display = 'flex';
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

        // Rotate portal ring
        if (portalRing) {
            portalRing.rotation.z = time * 0.4;
        }

        // Pulse server racks
        serverRacks.forEach(function (r, i) {
            r.position.y = 1.9 + Math.sin(time * 2 + i) * 0.02;
        });

        // Float terminal gently
        if (terminalMesh) {
            terminalMesh.position.y = 2.3 + Math.sin(time * 1.5) * 0.04;
        }

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

    /**
     * Public Interface
     */
    const LabTIK_SearchEngine = {
        init: function (container, onComplete, onExit) {
            activeContainer = container;
            onFinishCallback = onComplete;
            onExitCallback = onExit;

            score = 0;
            currentMissionIdx = 0;
            particleSystems = [];

            const budget = getDeviceBudget();
            sceneSetup = window.Engine3D.createScene(container, budget);
            sceneSetup.camera.position.set(0, 2.8, 3.8);
            sceneSetup.camera.lookAt(0, 2.2, -1.2);

            window.Engine3D.setupLighting(sceneSetup.scene, budget, 0xffffff, 0.7);

            buildEnvironment(sceneSetup.scene, budget);

            window.Engine3D.createHUD(container, {
                exitBtnId: 'btn-labtik-hud-exit',
                levelTag: 'LAB TIK',
                title: 'Cyber Research Terminal'
            });
            document.getElementById('btn-labtik-hud-exit').addEventListener('click', function () {
                if (onExitCallback) onExitCallback();
            });

            renderBriefing();

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

            terminalMesh = null;
            portalRing = null;
            serverRacks = [];
            pipelineNodes = [];
            onFinishCallback = null;
            onExitCallback = null;
        }
    };

    window.LabTIK_SearchEngine = LabTIK_SearchEngine;
})();
