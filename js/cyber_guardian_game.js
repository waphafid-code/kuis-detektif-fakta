/**
 * ============================================================
 * 🦸‍♂️ CYBER GUARDIAN: SENTINEL PROTOCOL
 * ============================================================
 * Game Edukasi Interaktif Generasi Baru (Senior Game Dev Quality)
 * Tema: Digital Superhero vs Sindikat Penjahat Siber (Cyber Villains)
 * 
 * Fitur Utama:
 * 1. 60 FPS Canvas Dynamic Particle Engine (Sparks, Laser Beams, Hex Shields)
 * 2. Real-time Battle Combat: Hero HP vs Boss HP, Screen Shake & Recoil
 * 3. Combo Streak Multiplier (🔥 1x - 5x) & Overdrive Energy Gauge
 * 4. Superhero Ultimate Ability: "QUANTUM PULSE CANNON" (Full Screen VFX)
 * 5. Web Audio Synthesizer (Zero-latency sound effects without external files)
 * 6. 3 Epic Boss Battles: Phish Phantom, Trojan Colossus, Ransom Overlord
 * 7. Kurikulum Informatika Fase E: JKI, Keamanan Siber, DNS, Topologi & Enkripsi
 * ============================================================
 */

(function () {
    'use strict';

    // 🔊 1. WEB AUDIO SYNTHESIZER UNTUK GAME
    let sfxAudioCtx = null;
    function getSfxAudio() {
        if (!sfxAudioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) sfxAudioCtx = new AC();
        }
        if (sfxAudioCtx && sfxAudioCtx.state === 'suspended') {
            sfxAudioCtx.resume();
        }
        return sfxAudioCtx;
    }

    function playSynthTone(freq, type, dur, vol, slideTo = null) {
        try {
            if (window.soundMuted) return;
            const ctx = getSfxAudio();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const now = ctx.currentTime;
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, now);
            if (slideTo) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + dur);
            }
            gain.gain.setValueAtTime(vol || 0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + dur);
        } catch (e) {}
    }

    const heroAudio = {
        attack: () => {
            playSynthTone(580, 'sawtooth', 0.12, 0.16, 220);
            setTimeout(() => playSynthTone(880, 'sine', 0.15, 0.12), 40);
        },
        critAttack: () => {
            playSynthTone(320, 'square', 0.08, 0.22, 110);
            setTimeout(() => playSynthTone(650, 'sawtooth', 0.18, 0.2, 900), 50);
            setTimeout(() => playSynthTone(1200, 'sine', 0.25, 0.18), 120);
        },
        shieldBlock: () => {
            playSynthTone(200, 'triangle', 0.15, 0.25, 500);
            setTimeout(() => playSynthTone(400, 'sine', 0.2, 0.15), 60);
        },
        bossHurt: () => {
            playSynthTone(140, 'sawtooth', 0.22, 0.22, 60);
        },
        bossAttack: () => {
            playSynthTone(180, 'sawtooth', 0.25, 0.2, 80);
            setTimeout(() => playSynthTone(120, 'triangle', 0.3, 0.25, 40), 90);
        },
        heroHurt: () => {
            playSynthTone(240, 'sawtooth', 0.2, 0.2, 100);
        },
        ultimateCharge: () => {
            playSynthTone(220, 'sine', 0.4, 0.2, 880);
            setTimeout(() => playSynthTone(440, 'triangle', 0.35, 0.2, 1320), 150);
        },
        ultimateFire: () => {
            playSynthTone(90, 'square', 0.5, 0.35, 40);
            playSynthTone(880, 'sawtooth', 0.4, 0.25, 120);
            setTimeout(() => playSynthTone(1400, 'sine', 0.5, 0.3, 200), 100);
        },
        victory: () => {
            [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((f, i) => {
                setTimeout(() => playSynthTone(f, 'triangle', 0.3, 0.18), i * 110);
            });
        }
    };

    // 👾 2. DATASET SKENARIO & BOSS BATTLES
    const GUARDIAN_CAMPAIGN = [
        {
            stage: 1,
            bossName: "Phish Phantom",
            bossTitle: "Lord of Social Engineering & Spoofing",
            bossAvatar: "🦹‍♂️",
            bossColor: "#ec4899",
            bossMaxHp: 100,
            cityDefenseName: "Gerbang Firewall Kota Siber",
            introDialogue: "Hahaha! Seluruh warga telah mengklik tautan hadiah palsu kirimanku. Datamu kini milikku!",
            challenges: [
                {
                    threatTitle: "🚨 SERANGAN: Phishing Link Masking!",
                    scenario: "Phish Phantom meluncurkan email penyamaran 'Verifikasi Akun Bank' dengan tautan mencurigakan: `http://klik-hadiah-bca.xyz.co/login`.",
                    question: "Sebagai Cyber Sentinel, senjata protokol pertahanan apa yang paling tepat untuk menangkis serangan ini?",
                    options: [
                        { text: "🛡️ Lateral Reading & Verifikasi Domain Resmi (bca.co.id)", correct: true, power: 35, desc: "Tepat! Domain resmi perbankan diverifikasi secara mandiri di tab peramban terpisah." },
                        { text: "⚡ Langsung klik tautan dan masukkan password palsu", correct: false, power: 0, desc: "Salah! Mengklik tautan palsu membiarkan peretas mencuri data kredensial." },
                        { text: "🔗 Meneruskan pesan ke seluruh grup WhatsApp", correct: false, power: 0, desc: "Salah! Membagikan pesan justru memperluas jangkauan infeksi phising." },
                        { text: "🔒 Mematikan layar ponsel tanpa melapor", correct: false, power: 0, desc: "Salah! Tidak menyelesaikan celah ancaman yang masih aktif." }
                    ]
                },
                {
                    threatTitle: "🚨 SERANGAN: Deceptive Email Spoofing!",
                    scenario: "Sebuah surat edaran mengatasnamakan Kominfo dikirim menggunakan domain gratisan: `pengaduan.kominfo@gmail.com` meminta foto KTP.",
                    question: "Bagaimana cara mendeteksi anomali pada identitas pengirim tersebut?",
                    options: [
                        { text: "🛡️ Instansi Pemerintah RI wajib berdomain resmi .go.id, bukan layanan gratis publik @gmail.com", correct: true, power: 35, desc: "Akurat! Domain lembaga pemerintah Indonesia selalu menggunakan ekstensi resmi .go.id." },
                        { text: "⚡ Alamat @gmail.com justru lebih aman karena milik Google", correct: false, power: 0, desc: "Salah! Instansi resmi tidak pernah menggunakan email publik gratisan untuk operasional." },
                        { text: "🔒 Format teks terlihat sangat rapi dan meyakinkan", correct: false, power: 0, desc: "Salah! Tampilan rapi adalah trik kamuflase visual peretas." },
                        { text: "🔗 Email tersebut memiliki lampiran gambar logo Garuda", correct: false, power: 0, desc: "Salah! Logo resmi dapat disalin dengan sangat mudah oleh peretas." }
                    ]
                },
                {
                    threatTitle: "🚨 SERANGAN PAMUNGKAS: Zero-Click Link Infiltration!",
                    scenario: "Phish Phantom membanjiri server dengan tautan manipulasi URL shortener berkedok kuota internet gratis 100GB.",
                    question: "Tindakan mitigasi pamungkas untuk melumpuhkan Phish Phantom?",
                    options: [
                        { text: "💥 Luncurkan URL Scanner & Periksa Reputasi Domain via TurnBackHoax / AduanKonten", correct: true, power: 40, desc: "Brilian! Pengecekan reputasi dan pelaporan ke kanal resmi melumpuhkan server phising!" },
                        { text: "🛡️ Forward pesan ke 10 teman agar tautan kedaluwarsa", correct: false, power: 0, desc: "Salah! Mitos internet yang menyesatkan." },
                        { text: "⚡ Hapus riwayat browsing browser saja", correct: false, power: 0, desc: "Salah! Menghapus riwayat tidak menghentikan muatan malware di server." },
                        { text: "🔒 Matikan modem internet rumah selamanya", correct: false, power: 0, desc: "Salah! Reaksi berlebihan dan tidak solutif." }
                    ]
                }
            ]
        },
        {
            stage: 2,
            bossName: "Trojan Colossus",
            bossTitle: "Titan of Network Infiltration & Hub Sniffer",
            bossAvatar: "🤖",
            bossColor: "#f59e0b",
            bossMaxHp: 120,
            cityDefenseName: "Sentral Switch Antargedung Padang Net",
            introDialogue: "Infrastruktur jaringan kalian rapuh! Aku menyadap seluruh paket kabel tanpa enkripsi!",
            challenges: [
                {
                    threatTitle: "🚨 SERANGAN: Packet Sniffing Broadcast!",
                    scenario: "Trojan Colossus menyusup ke laboratorium sekolah yang masih menggunakan perangkat HUB lama. Seluruh data siswa mengalir broadcast ke port laptop peretas.",
                    question: "Upgrade perangkat keras apa yang harus segera dikerahkan Superhero?",
                    options: [
                        { text: "🛡️ Ganti HUB dengan SWITCH Cerdas yang meneruskan paket spesifik ke MAC Address tujuan", correct: true, power: 40, desc: "Hebat! Switch membatasi lalu lintas data sehingga peretas di port lain tidak dapat menyadap." },
                        { text: "⚡ Ganti kabel UTP menjadi kabel antena televisi", correct: false, power: 0, desc: "Salah! Kabel koaksial tidak relevan untuk jaringan LAN modern." },
                        { text: "🔒 Cat ulang perangkat Hub menjadi warna merah", correct: false, power: 0, desc: "Salah! Sama sekali bukan solusi teknis." },
                        { text: "🔗 Cabut seluruh kabel dan gunakan Bluetooth", correct: false, power: 0, desc: "Salah! Bluetooth jangkauannya terlalu sempit (PAN) dan tidak memadai untuk lab." }
                    ]
                },
                {
                    threatTitle: "🚨 SERANGAN: Wi-Fi Eavesdropping di Ruang Publik!",
                    scenario: "Seorang siswa mengirim data pribadi rahasia melalui Wi-Fi publik bandara tanpa enkripsi (HTTP biasa). Layar HP memang dikunci sidik jari.",
                    question: "Mengapa kunci sidik jari ponsel gagal melindungi data yang melintas di udara?",
                    options: [
                        { text: "🛡️ Kunci sidik jari hanya melindungi akses fisik layar, paket data di udara tetap telanjang tanpa enkripsi SSL/TLS", correct: true, power: 40, desc: "Tepat sekali! Autentikasi fisik layar tidak mengenkripsi aliran paket data di jaringan nirkabel." },
                        { text: "⚡ Sidik jari siswa palsu", correct: false, power: 0, desc: "Salah! Masalahnya ada pada transmisi data, bukan sensor ponsel." },
                        { text: "🔒 Gelombang Wi-Fi otomatis membaca sidik jari", correct: false, power: 0, desc: "Salah! Teori konspirasi yang keliru." },
                        { text: "🔗 Wi-Fi publik hanya bisa dipakai menonton video", correct: false, power: 0, desc: "Salah! Wi-Fi publik mengalirkan semua jenis protokol data." }
                    ]
                },
                {
                    threatTitle: "🚨 SERANGAN PAMUNGKAS: Single Point of Failure!",
                    scenario: "Ruang gawat darurat rumah sakit membutuhkan arsitektur jaringan yang tidak boleh mati sedetik pun walau ada 2 kabel terputus.",
                    question: "Topologi superhero apa yang mampu menjamin keandalan mutlak tersebut?",
                    options: [
                        { text: "💥 Topologi MESH (Jaring Penuh) dengan banyak jalur cadangan redundansi tinggi", correct: true, power: 45, desc: "Kritis dan mematikan! Topologi Mesh menjamin data tetap sampai via rute alternatif!" },
                        { text: "🛡️ Topologi Ring satu arah", correct: false, power: 0, desc: "Salah! Pada Ring satu arah, satu kabel putus membuat seluruh jaringan lumpuh." },
                        { text: "⚡ Topologi Bus satu kabel lurus", correct: false, power: 0, desc: "Salah! Jalur backbone Bus putus melumpuhkan seluruh simpul." },
                        { text: "🔒 Tanpa topologi sama sekali", correct: false, power: 0, desc: "Salah! Jaringan komputer mutlak memerlukan rancangan topologi." }
                    ]
                }
            ]
        },
        {
            stage: 3,
            bossName: "Ransom Overlord: ZERO-DAY",
            bossTitle: "Master of Cryptolocker Cataclysm",
            bossAvatar: "👾",
            bossColor: "#ef4444",
            bossMaxHp: 150,
            cityDefenseName: "Pusat Data Inti Nasional Cyber Core",
            introDialogue: "Akulah penguasa kegelapan siber! Seluruh server data kuis dan rumah sakit telah ku-kunci dengan tebusan!",
            challenges: [
                {
                    threatTitle: "🚨 SERANGAN: Triple Threat Cyber Infiltration!",
                    scenario: "Pukul 08.00 Phising email diklik staf; Pukul 09.00 Ransomware mengunci database; Pukul 10.00 dokter tidak bisa membuka rekam medis pasien.",
                    question: "Pilar keamanan siber CIA-A apa yang lumpuh total pada pukul 10.00?",
                    options: [
                        { text: "🛡️ AVAILABILITY (Ketersediaan layanan bagi pengguna berhak lumpuh total)", correct: true, power: 50, desc: "Sempurna! Layanan tidak dapat diakses saat dibutuhkan merupakan pelanggaran pilar Availability." },
                        { text: "⚡ Confidentiality saja", correct: false, power: 0, desc: "Kurang tepat! Masalah utama pukul 10.00 adalah sistem tidak bisa diakses sama sekali." },
                        { text: "🔒 Non-Repudiation", correct: false, power: 0, desc: "Salah! Ini mengenai penyangkalan transaksi, bukan kelumpuhan akses." },
                        { text: "🔗 Kabel Fiber Optik putus digigit hiu", correct: false, power: 0, desc: "Salah! Penyebabnya adalah serangan ransomware, bukan insiden fisik kabel laut." }
                    ]
                },
                {
                    threatTitle: "🚨 SERANGAN: DNS Poisoning & Redirection!",
                    scenario: "Zero-Day membajak layanan penerjemah nama domain sekolah `www.sman4padang.sch.id` sehingga pengguna dialihkan ke IP server judi online.",
                    question: "Layanan direktori internet apa yang sedang diserang, dan fungsi utamanya apa?",
                    options: [
                        { text: "🛡️ DNS (Domain Name System) yang bertugas menerjemahkan nama domain alfabetis menjadi deretan angka IP Address", correct: true, power: 50, desc: "Luar biasa! DNS bekerja seperti buku telepon internet yang memetakan domain ke IP." },
                        { text: "⚡ NIC (Network Interface Card) pada printer guru", correct: false, power: 0, desc: "Salah! NIC adalah kartu jaringan perangkat fisik." },
                        { text: "🔒 Kabel Fiber Optik antargedung", correct: false, power: 0, desc: "Salah! Kabel adalah media fisik, bukan layanan direktori nama." },
                        { text: "🔗 Monitor komputer laboratorium", correct: false, power: 0, desc: "Salah! Monitor adalah perangkat output visual." }
                    ]
                },
                {
                    threatTitle: "🚨 SERANGAN FINAL: Ultimate Cryptolocker Doomsday!",
                    scenario: "Zero-Day mengaktifkan kunci asimetris tingkat tinggi untuk memusnahkan seluruh rekam jejak digital.",
                    question: "Protokol mitigasi pamungkas untuk memulihkan seluruh sistem kota siber?",
                    options: [
                        { text: "💥 ISOLASI JARINGAN SEGERA + PULIHKAN DARI COLD BACKUP OFFLINE TERVERIFIKASI!", correct: true, power: 60, desc: "MENANG TELAK! Isolasi memutus penyebaran malware dan backup offline memulihkan data tanpa tebusan!" },
                        { text: "🛡️ Membayar tebusan Bitcoin kepada peretas", correct: false, power: 0, desc: "Salah! Membayar tebusan mendanai kejahatan siber dan tidak menjamin kunci diberikan." },
                        { text: "⚡ Menyalakan ulang komputer berulang kali", correct: false, power: 0, desc: "Salah! Me-restart justru dapat mempercepat proses enkripsi file di background." },
                        { text: "🔒 Memasang stiker anti-radiasi di casing CPU", correct: false, power: 0, desc: "Salah! Mitos tidak berdasar." }
                    ]
                }
            ]
        }
    ];

    // 🎮 3. STATE GAME ENGINE
    let currentStageIdx = 0;
    let currentChallengeIdx = 0;
    let heroHp = 100;
    let heroMaxHp = 100;
    let bossHp = 100;
    let bossMaxHp = 100;
    let comboStreak = 0;
    let energyOverdrive = 0; // 0 s.d 100
    let totalScore = 0;
    let animFrameId = null;
    let particles = [];
    let screenShakeAmount = 0;

    // 🎨 4. CANVAS PARTICLE & VFX SYSTEM
    function initCanvasFx(canvas) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const resize = () => {
            canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : 800;
            canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : 420;
        };
        resize();
        window.addEventListener('resize', resize);

        // Particle generator loop
        function loop() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Digital Cyber Grid Background Lines
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
            ctx.lineWidth = 1;
            const gridSpacing = 40;
            for (let x = 0; x < canvas.width; x += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvas.height; y += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Update & Draw Particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                p.size = Math.max(0, p.size * 0.98);

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                if (p.life <= 0) {
                    particles.splice(i, 1);
                }
            }

            // Screen Shake Decay
            if (screenShakeAmount > 0) {
                screenShakeAmount *= 0.9;
                if (screenShakeAmount < 0.5) screenShakeAmount = 0;
                const canvasWrap = document.getElementById('guardian-battle-stage');
                if (canvasWrap) {
                    const sx = (Math.random() - 0.5) * screenShakeAmount;
                    const sy = (Math.random() - 0.5) * screenShakeAmount;
                    canvasWrap.style.transform = `translate(${sx}px, ${sy}px)`;
                }
            }

            animFrameId = requestAnimationFrame(loop);
        }
        loop();
    }

    function spawnBurst(x, y, color, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 5 + 3,
                color: color || '#38bdf8',
                life: 1.0,
                decay: Math.random() * 0.03 + 0.02
            });
        }
    }

    function triggerScreenShake(intensity = 15) {
        screenShakeAmount = intensity;
    }

    // 🚀 5. GAME LAUNCHER & STAGE RENDERER
    function launchCyberGuardianGame() {
        if (typeof switchScreen === 'function') {
            switchScreen('games');
        }

        const stageContainer = document.getElementById('games-stage-container');
        if (!stageContainer) return;

        currentStageIdx = 0;
        currentChallengeIdx = 0;
        totalScore = 0;
        comboStreak = 0;
        energyOverdrive = 0;
        loadStage(currentStageIdx);
    }
    window.launchCyberGuardianGame = launchCyberGuardianGame;

    function loadStage(stageIdx) {
        const stage = GUARDIAN_CAMPAIGN[stageIdx % GUARDIAN_CAMPAIGN.length];
        bossMaxHp = stage.bossMaxHp;
        bossHp = bossMaxHp;
        heroMaxHp = 100;
        heroHp = heroMaxHp;
        currentChallengeIdx = 0;

        renderBattleInterface(stage);
    }

    function renderBattleInterface(stage) {
        const container = document.getElementById('games-stage-container');
        if (!container) return;

        const currentChallenge = stage.challenges[currentChallengeIdx];
        const isUltReady = energyOverdrive >= 100;

        container.innerHTML = `
            <div class="guardian-battle-wrapper">
                <!-- TOP HUD: NAVIGATION & SCORE -->
                <div class="guardian-top-hud">
                    <button type="button" class="btn-learn-back" onclick="if(typeof openMiniGamesHub==='function')openMiniGamesHub(); else switchScreen('home');">
                        <span>←</span>
                        <span>Arena Game</span>
                    </button>
                    <div class="guardian-mission-pill">
                        <span class="pulsing-shield">🛡️</span>
                        <span>MISI STAGE ${stage.stage}/3: ${stage.cityDefenseName}</span>
                    </div>
                    <div class="guardian-score-pill">
                        <span>SKOR:</span>
                        <span id="guardian-score-val" class="score-highlight">${totalScore}</span>
                    </div>
                </div>

                <!-- BATTLE STAGE CANVAS & CHARACTERS -->
                <div class="guardian-battle-stage" id="guardian-battle-stage">
                    <canvas id="guardian-fx-canvas" class="guardian-fx-canvas"></canvas>

                    <!-- HERO POD -->
                    <div class="character-pod hero-pod" id="hero-pod">
                        <div class="character-avatar hero-avatar">
                            <span class="hero-glyph">🦸‍♂️</span>
                            <div class="hero-aura"></div>
                        </div>
                        <div class="char-info">
                            <div class="char-name">CYBER SENTINEL</div>
                            <div class="char-hp-bar">
                                <div class="hp-fill hero-fill" id="hero-hp-bar" style="width: ${(heroHp / heroMaxHp) * 100}%;"></div>
                            </div>
                            <div class="hp-text"><span id="hero-hp-val">${heroHp}</span> / ${heroMaxHp} HP</div>
                        </div>
                    </div>

                    <!-- VS EMBLEM & OVERDRIVE METER -->
                    <div class="battle-center-cluster">
                        <div class="combo-badge" id="combo-badge" style="opacity: ${comboStreak > 1 ? '1' : '0'};">
                            🔥 x${comboStreak} COMBO!
                        </div>
                        <div class="vs-emblem">VS</div>
                        <div class="overdrive-meter-wrap">
                            <div class="od-label">⚡ OVERDRIVE</div>
                            <div class="od-bar-bg">
                                <div class="od-bar-fill" id="od-bar-fill" style="width: ${energyOverdrive}%;"></div>
                            </div>
                        </div>
                    </div>

                    <!-- BOSS POD -->
                    <div class="character-pod boss-pod" id="boss-pod">
                        <div class="character-avatar boss-avatar" style="border-color: ${stage.bossColor};">
                            <span class="boss-glyph">${stage.bossAvatar}</span>
                            <div class="boss-aura" style="background: radial-gradient(circle, ${stage.bossColor}44 0%, transparent 70%);"></div>
                        </div>
                        <div class="char-info">
                            <div class="char-name" style="color: ${stage.bossColor};">${stage.bossName}</div>
                            <div class="char-hp-bar">
                                <div class="hp-fill boss-fill" id="boss-hp-bar" style="width: ${(bossHp / bossMaxHp) * 100}%; background: linear-gradient(90deg, ${stage.bossColor}, #fb7185);"></div>
                            </div>
                            <div class="hp-text"><span id="boss-hp-val">${bossHp}</span> / ${bossMaxHp} HP</div>
                        </div>
                    </div>
                </div>

                <!-- DIALOGUE / INTRUSION BANNER -->
                <div class="guardian-alert-banner">
                    <span class="alert-icon">⚠️</span>
                    <span class="alert-boss-speak">"${stage.introDialogue}"</span>
                </div>

                <!-- TACTICAL COMBAT QUESTION DECK -->
                <div class="guardian-combat-card">
                    <div class="combat-card-header">
                        <span class="threat-badge">${currentChallenge.threatTitle}</span>
                        <span class="step-indicator">Tantangan ${currentChallengeIdx + 1} dari ${stage.challenges.length}</span>
                    </div>

                    <p class="combat-scenario-text">
                        ${currentChallenge.scenario}
                    </p>

                    <h3 class="combat-action-prompt">
                        ${currentChallenge.question}
                    </h3>

                    <!-- TACTICAL CHOICES GRID -->
                    <div class="guardian-choices-grid" id="guardian-choices-grid">
                        ${currentChallenge.options.map((opt, i) => `
                            <button type="button" class="combat-choice-btn" onclick="executeTacticalMove(${i})">
                                <span class="choice-num">${['A', 'B', 'C', 'D'][i]}</span>
                                <span class="choice-text">${opt.text}</span>
                            </button>
                        `).join('')}
                    </div>

                    <!-- SUPERHERO ULTIMATE BUTTON -->
                    <div class="guardian-ultimate-wrap">
                        <button type="button" id="btn-guardian-ultimate" class="btn-ultimate-ability ${isUltReady ? 'ready' : 'charging'}" onclick="activateQuantumOverdrive()" ${isUltReady ? '' : 'disabled'}>
                            <span class="ult-icon">💥</span>
                            <span class="ult-text">${isUltReady ? '⚡ AKTIFKAN QUANTUM PULSE CANNON (BURST CRITICAL)!' : `🔋 Mengisi Energi Overdrive (${energyOverdrive}%)`}</span>
                            <span class="ult-icon">💥</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        const canvas = document.getElementById('guardian-fx-canvas');
        if (canvas) initCanvasFx(canvas);
    }

    // 💥 6. EKSEKUSI TANKALAN / SERANGAN TAKTIS
    function executeTacticalMove(optIdx) {
        const stage = GUARDIAN_CAMPAIGN[currentStageIdx];
        const challenge = stage.challenges[currentChallengeIdx];
        const chosen = challenge.options[optIdx];

        const choiceBtns = document.querySelectorAll('.combat-choice-btn');
        choiceBtns.forEach((btn, idx) => {
            btn.disabled = true;
            if (challenge.options[idx].correct) {
                btn.classList.add('correct');
            } else if (idx === optIdx) {
                btn.classList.add('wrong');
            }
        });

        const canvas = document.getElementById('guardian-fx-canvas');
        const cx = canvas ? canvas.width / 2 : 400;
        const cy = canvas ? canvas.height / 2 : 200;

        if (chosen.correct) {
            // HERO SERANG BOSS
            comboStreak++;
            energyOverdrive = Math.min(100, energyOverdrive + 35);
            const dmg = chosen.power + (comboStreak * 5);
            bossHp = Math.max(0, bossHp - dmg);
            totalScore += dmg * 10;

            heroAudio.attack();
            setTimeout(heroAudio.bossHurt, 80);
            triggerScreenShake(12);
            spawnBurst(cx + 150, cy, '#38bdf8', 35);
            spawnBurst(cx + 150, cy, '#ec4899', 25);

            // Pop Floating Damage
            spawnDamageNumber(`-${dmg} HP!`, 'boss', true);

            // Update UI
            updateHpAndMeters();

            // Lanjut ke tantangan berikutnya atau menang
            setTimeout(() => {
                if (bossHp <= 0 || currentChallengeIdx + 1 >= stage.challenges.length) {
                    onStageClear();
                } else {
                    currentChallengeIdx++;
                    renderBattleInterface(stage);
                }
            }, 1200);

        } else {
            // BOSS SERANG HERO
            comboStreak = 0;
            const heroDmg = 25;
            heroHp = Math.max(0, heroHp - heroDmg);

            heroAudio.bossAttack();
            setTimeout(heroAudio.heroHurt, 90);
            triggerScreenShake(20);
            spawnBurst(cx - 150, cy, '#ef4444', 30);

            spawnDamageNumber(`-${heroDmg} HP!`, 'hero', false);
            updateHpAndMeters();

            setTimeout(() => {
                if (heroHp <= 0) {
                    onGameOver();
                } else {
                    // Beri kesempatan ulang atau lanjut
                    if (currentChallengeIdx + 1 < stage.challenges.length) {
                        currentChallengeIdx++;
                        renderBattleInterface(stage);
                    } else {
                        onGameOver();
                    }
                }
            }, 1200);
        }
    }
    window.executeTacticalMove = executeTacticalMove;

    function activateQuantumOverdrive() {
        if (energyOverdrive < 100) return;
        energyOverdrive = 0;
        const ultDmg = 65;
        bossHp = Math.max(0, bossHp - ultDmg);
        totalScore += 1000;

        heroAudio.ultimateCharge();
        setTimeout(heroAudio.ultimateFire, 200);
        triggerScreenShake(30);

        const canvas = document.getElementById('guardian-fx-canvas');
        const cx = canvas ? canvas.width / 2 : 400;
        const cy = canvas ? canvas.height / 2 : 200;

        spawnBurst(cx, cy, '#38bdf8', 80);
        spawnBurst(cx + 150, cy, '#fbbf24', 60);
        spawnBurst(cx + 150, cy, '#ffffff', 50);

        spawnDamageNumber(`💥 CRITICAL OVERDRIVE -${ultDmg}!`, 'boss', true);
        updateHpAndMeters();

        setTimeout(() => {
            const stage = GUARDIAN_CAMPAIGN[currentStageIdx];
            if (bossHp <= 0) {
                onStageClear();
            } else {
                renderBattleInterface(stage);
            }
        }, 1300);
    }
    window.activateQuantumOverdrive = activateQuantumOverdrive;

    function spawnDamageNumber(text, target, isCrit) {
        const pod = document.getElementById(target === 'boss' ? 'boss-pod' : 'hero-pod');
        if (!pod) return;
        const popup = document.createElement('div');
        popup.className = `floating-dmg-popup ${isCrit ? 'crit' : 'normal'}`;
        popup.textContent = text;
        pod.appendChild(popup);
        setTimeout(() => {
            if (popup.parentNode) popup.parentNode.removeChild(popup);
        }, 900);
    }

    function updateHpAndMeters() {
        const heroBar = document.getElementById('hero-hp-bar');
        const heroVal = document.getElementById('hero-hp-val');
        const bossBar = document.getElementById('boss-hp-bar');
        const bossVal = document.getElementById('boss-hp-val');
        const scoreVal = document.getElementById('guardian-score-val');
        const odFill = document.getElementById('od-bar-fill');
        const ultBtn = document.getElementById('btn-guardian-ultimate');

        if (heroBar) heroBar.style.width = `${(heroHp / heroMaxHp) * 100}%`;
        if (heroVal) heroVal.textContent = heroHp;
        if (bossBar) bossBar.style.width = `${(bossHp / bossMaxHp) * 100}%`;
        if (bossVal) bossVal.textContent = bossHp;
        if (scoreVal) scoreVal.textContent = totalScore;
        if (odFill) odFill.style.width = `${energyOverdrive}%`;

        if (ultBtn) {
            const isReady = energyOverdrive >= 100;
            ultBtn.className = `btn-ultimate-ability ${isReady ? 'ready' : 'charging'}`;
            ultBtn.disabled = !isReady;
        }
    }

    // 🏆 7. STAGE CLEAR & GAME OVER SCREENS
    function onStageClear() {
        heroAudio.victory();
        const stage = GUARDIAN_CAMPAIGN[currentStageIdx];
        const isCampaignComplete = currentStageIdx + 1 >= GUARDIAN_CAMPAIGN.length;

        const container = document.getElementById('games-stage-container');
        if (!container) return;

        container.innerHTML = `
            <div class="guardian-result-modal">
                <div class="result-badge-star">⭐⭐⭐</div>
                <div class="result-hero-icon">🏆</div>
                <h2 class="result-title">${stage.bossName} BERHASIL DILUMPUHKAN!</h2>
                <p class="result-subtitle">
                    Pertahanan <strong>${stage.cityDefenseName}</strong> berhasil diselamatkan dari ancaman penjahat siber!
                </p>

                <div class="result-stats-card">
                    <div class="r-stat">
                        <span class="r-label">Total Skor</span>
                        <span class="r-val">${totalScore}</span>
                    </div>
                    <div class="r-stat">
                        <span class="r-label">Sisa HP Hero</span>
                        <span class="r-val" style="color: var(--success);">${heroHp} HP</span>
                    </div>
                    <div class="r-stat">
                        <span class="r-label">Gelar Pahlawan</span>
                        <span class="r-val" style="color: #38bdf8;">Cyber Sentinel Supreme</span>
                    </div>
                </div>

                <div class="result-actions">
                    ${isCampaignComplete ? `
                        <button type="button" class="btn btn-primary" onclick="launchCyberGuardianGame()" style="padding: 12px 24px; font-weight: 800;">
                            🔄 Mainkan Ulang Campaign
                        </button>
                    ` : `
                        <button type="button" class="btn btn-primary" onclick="nextStageCampaign()" style="padding: 12px 24px; font-weight: 800; background: linear-gradient(135deg, #059669, #10b981);">
                            Lanjut ke Stage Berikutnya ➔
                        </button>
                    `}
                    <button type="button" class="btn btn-secondary" onclick="if(typeof openMiniGamesHub==='function')openMiniGamesHub(); else switchScreen('home');" style="padding: 12px 20px;">
                        Kembali ke Arena Game
                    </button>
                </div>
            </div>
        `;
    }

    function nextStageCampaign() {
        currentStageIdx++;
        loadStage(currentStageIdx);
    }
    window.nextStageCampaign = nextStageCampaign;

    function onGameOver() {
        heroAudio.heroHurt();
        const container = document.getElementById('games-stage-container');
        if (!container) return;

        container.innerHTML = `
            <div class="guardian-result-modal" style="border-color: rgba(239,68,68,0.4); box-shadow: 0 0 50px rgba(239,68,68,0.25);">
                <div class="result-hero-icon" style="filter: grayscale(1);">💀</div>
                <h2 class="result-title" style="color: var(--danger);">PERTAHANAN SIBER JEBOL!</h2>
                <p class="result-subtitle">
                    HP Cyber Sentinel habis! Penjahat siber berhasil mengeksploitasi celah jaringan. Pelajari kembali materi dan bangkit kembali!
                </p>

                <div class="result-actions">
                    <button type="button" class="btn btn-primary" onclick="loadStage(currentStageIdx)" style="padding: 12px 24px; font-weight: 800; background: var(--danger);">
                        🔄 Coba Lagi Stage Ini
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="if(typeof openMiniGamesHub==='function')openMiniGamesHub(); else switchScreen('home');" style="padding: 12px 20px;">
                        Kembali ke Arena Game
                    </button>
                </div>
            </div>
        `;
    }

})();
