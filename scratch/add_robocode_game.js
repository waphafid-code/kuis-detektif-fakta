const fs = require('fs');
const path = require('path');

const miniGamesPath = path.join(__dirname, '..', 'js', 'mini_games.js');
let content = fs.readFileSync(miniGamesPath, 'utf8');

// 1. Add ROBOCODE_LEVELS dataset before openMiniGamesHub
const robocodeDataset = `    // ============================================================
    // DATA ROBOCODE: ALGORITMA RUNNER & PSEUDOCODE (C4 & C3)
    // ============================================================
    const ROBOCODE_LEVELS = [
        {
            id: 1,
            title: "Level 1: Akumulator Perulangan Genap",
            scenario: "RoboCode diminta menghitung total akumulasi penjumlahan bilangan genap dari 2 sampai 6.",
            codeLines: [
                { num: 1, text: "total ← 0", comment: "Inisialisasi akumulator" },
                { num: 2, text: "FOR i ← 2 TO 6 STEP 2 DO", comment: "Perulangan lompat 2 (2, 4, 6)" },
                { num: 3, text: "    total ← total + i", comment: "Tambahkan nilai i ke total" },
                { num: 4, text: "ENDFOR", comment: "Akhir perulangan" },
                { num: 5, text: "OUTPUT total", comment: "Cetak hasil ke layar" }
            ],
            traceSteps: [
                { line: 1, vars: { total: 0, i: "-" }, note: "total diinisialisasi 0" },
                { line: 2, vars: { total: 0, i: 2 }, note: "i mulai dari 2" },
                { line: 3, vars: { total: 2, i: 2 }, note: "total = 0 + 2 = 2" },
                { line: 2, vars: { total: 2, i: 4 }, note: "i bertambah jadi 4" },
                { line: 3, vars: { total: 6, i: 4 }, note: "total = 2 + 4 = 6" },
                { line: 2, vars: { total: 6, i: 6 }, note: "i bertambah jadi 6" },
                { line: 3, vars: { total: 12, i: 6 }, note: "total = 6 + 6 = 12" },
                { line: 5, vars: { total: 12, i: 6 }, note: "Selesai! Output = 12" }
            ],
            targetQuestion: "Berapakah nilai akhir variabel 'total' yang dicetak pada baris ke-5?",
            choices: [
                "total = 12 (karena akumulasi 2 + 4 + 6 = 12)",
                "total = 20",
                "total = 6",
                "total = 0"
            ],
            correct: 0,
            explanation: "Benar sekali! Variabel i bernilai 2, 4, dan 6. Nilai total terakumulasi: 0 + 2 + 4 + 6 = 12."
        },
        {
            id: 2,
            title: "Level 2: Percabangan Diskon Bertingkat",
            scenario: "Pelanggan berbelanja sebesar Rp 150.000. Berapakah jumlah uang yang harus dibayar?",
            codeLines: [
                { num: 1, text: "belanja ← 150000", comment: "Input total belanja" },
                { num: 2, text: "IF belanja >= 200000 THEN", comment: "Uji diskon 20%" },
                { num: 3, text: "    diskon ← 30000", comment: "Dilewati (150rb < 200rb)" },
                { num: 4, text: "ELSE IF belanja >= 100000 THEN", comment: "Uji diskon kedua (TRUE!)" },
                { num: 5, text: "    diskon ← 15000", comment: "Diskon Rp 15.000 aktif" },
                { num: 6, text: "ELSE", comment: "Tanpa diskon" },
                { num: 7, text: "    diskon ← 0", comment: "Dilewati" },
                { num: 8, text: "ENDIF", comment: "Selesai percabangan" },
                { num: 9, text: "bayar ← belanja - diskon", comment: "Hitung total bayar" },
                { num: 10, text: "OUTPUT bayar", comment: "Cetak hasil" }
            ],
            traceSteps: [
                { line: 1, vars: { belanja: 150000, diskon: 0, bayar: "-" }, note: "belanja = 150000" },
                { line: 2, vars: { belanja: 150000, diskon: 0, bayar: "-" }, note: "150000 >= 200000? FALSE" },
                { line: 4, vars: { belanja: 150000, diskon: 0, bayar: "-" }, note: "150000 >= 100000? TRUE!" },
                { line: 5, vars: { belanja: 150000, diskon: 15000, bayar: "-" }, note: "diskon diset 15000" },
                { line: 9, vars: { belanja: 150000, diskon: 15000, bayar: 135000 }, note: "bayar = 150000 - 15000 = 135000" },
                { line: 10, vars: { belanja: 150000, diskon: 15000, bayar: 135000 }, note: "Output = 135000" }
            ],
            targetQuestion: "Berapakah nilai akhir variabel 'bayar' yang dihasilkan?",
            choices: [
                "bayar = 135000 (karena 150000 - 15000)",
                "bayar = 120000",
                "bayar = 150000 (tanpa diskon)",
                "bayar = 15000"
            ],
            correct: 0,
            explanation: "Tepat! Karena belanja Rp 150.000 memenuhi syarat kedua (>= 100.000), maka diskon adalah Rp 15.000, sehingga total bayar = 150.000 - 15.000 = 135.000."
        },
        {
            id: 3,
            title: "Level 3: Pelacak Midpoint Binary Search",
            scenario: "Data terurut memiliki 9 elemen (indeks 1 sampai 9). Cari posisi titik tengah (mid).",
            codeLines: [
                { num: 1, text: "low ← 1; high ← 9; target ← 75", comment: "Batas pencarian awal" },
                { num: 2, text: "mid ← FLOOR((low + high) / 2)", comment: "Hitung titik tengah: (1+9)/2 = 5" },
                { num: 3, text: "IF target > data[mid] THEN", comment: "Target 75 > data[5] yang bernilai 50" },
                { num: 4, text: "    low ← mid + 1", comment: "Geser batas bawah ke separuh kanan" },
                { num: 5, text: "ENDIF", comment: "Selesai evaluasi" },
                { num: 6, text: "OUTPUT low", comment: "Batas low baru untuk iterasi berikutnya" }
            ],
            traceSteps: [
                { line: 1, vars: { low: 1, high: 9, mid: "-" }, note: "low=1, high=9" },
                { line: 2, vars: { low: 1, high: 9, mid: 5 }, note: "mid = FLOOR(10/2) = 5" },
                { line: 3, vars: { low: 1, high: 9, mid: 5 }, note: "target > data[5]? TRUE" },
                { line: 4, vars: { low: 6, high: 9, mid: 5 }, note: "low = 5 + 1 = 6" },
                { line: 6, vars: { low: 6, high: 9, mid: 5 }, note: "Output low = 6" }
            ],
            targetQuestion: "Setelah baris ke-4 dieksekusi, berapakah nilai baru dari variabel 'low'?",
            choices: [
                "low = 6 (karena mid + 1 = 5 + 1)",
                "low = 5",
                "low = 1",
                "low = 10"
            ],
            correct: 0,
            explanation: "Luar biasa! Ketika target lebih besar dari nilai di indeks tengah (mid=5), separuh data sebelah kiri dibuang, dan batas pencarian low dimajukan ke mid + 1 = 6."
        },
        {
            id: 4,
            title: "Level 4: Algoritma Pertukaran Variabel (Swap)",
            scenario: "Dua cangkir berisi kopi (a=7) dan teh (b=3). Tukar isinya menggunakan cangkir kosong (temp).",
            codeLines: [
                { num: 1, text: "a ← 7; b ← 3", comment: "Kondisi awal nilai a dan b" },
                { num: 2, text: "temp ← a", comment: "Simpan nilai a (7) ke temp" },
                { num: 3, text: "a ← b", comment: "Salin nilai b (3) ke a" },
                { num: 4, text: "b ← temp", comment: "Salin nilai temp (7) ke b" },
                { num: 5, text: "OUTPUT a, b", comment: "Cetak nilai akhir" }
            ],
            traceSteps: [
                { line: 1, vars: { a: 7, b: 3, temp: "-" }, note: "Awal: a=7, b=3" },
                { line: 2, vars: { a: 7, b: 3, temp: 7 }, note: "temp = 7" },
                { line: 3, vars: { a: 3, b: 3, temp: 7 }, note: "a = 3" },
                { line: 4, vars: { a: 3, b: 7, temp: 7 }, note: "b = 7" },
                { line: 5, vars: { a: 3, b: 7, temp: 7 }, note: "Output: a=3, b=7" }
            ],
            targetQuestion: "Berapakah nilai akhir variabel 'a' dan 'b' setelah baris ke-4 selesai?",
            choices: [
                "a = 3 dan b = 7 (nilai berhasil tertukar rapi)",
                "a = 7 dan b = 3 (tidak ada perubahan)",
                "a = 3 dan b = 3 (kedua variabel menjadi 3)",
                "a = 7 dan b = 7"
            ],
            correct: 0,
            explanation: "Sempurna! Variabel 'temp' berfungsi sebagai penampung sementara sehingga nilai a tidak hilang saat ditimpa oleh b. Nilai kedua variabel berhasil saling bertukar (Swap)."
        },
        {
            id: 5,
            title: "Level 5: Operator Logika Majemuk (AND)",
            scenario: "Sistem menguji kelayakan siswa meraih penghargaan kehormatan berdasarkan nilai dan kehadiran.",
            codeLines: [
                { num: 1, text: "nilai ← 88; hadir ← 85", comment: "Data siswa" },
                { num: 2, text: "status ← 'REGULER'", comment: "Status bawaan" },
                { num: 3, text: "IF (nilai >= 85) AND (hadir >= 90) THEN", comment: "Uji syarat ganda AND" },
                { num: 4, text: "    status ← 'HONOR_STUDENT'", comment: "Hanya jika KEDUA syarat terpenuhi" },
                { num: 5, text: "ENDIF", comment: "Selesai pengujian" },
                { num: 6, text: "OUTPUT status", comment: "Cetak status siswa" }
            ],
            traceSteps: [
                { line: 1, vars: { nilai: 88, hadir: 85, status: "-" }, note: "nilai=88, hadir=85" },
                { line: 2, vars: { nilai: 88, hadir: 85, status: "'REGULER'" }, note: "status diisi 'REGULER'" },
                { line: 3, vars: { nilai: 88, hadir: 85, status: "'REGULER'" }, note: "88>=85 (TRUE) AND 85>=90 (FALSE) = FALSE!" },
                { line: 5, vars: { nilai: 88, hadir: 85, status: "'REGULER'" }, note: "Baris 4 dilewati!" },
                { line: 6, vars: { nilai: 88, hadir: 85, status: "'REGULER'" }, note: "Output: 'REGULER'" }
            ],
            targetQuestion: "Apakah nilai akhir variabel 'status' yang dicetak ke layar?",
            choices: [
                "status = 'REGULER' (karena kehadiran 85 < 90, operator AND menuntut SEMUA syarat terpenuhi)",
                "status = 'HONOR_STUDENT' (karena nilai 88 sudah di atas 85)",
                "status = NULL (kosong)",
                "Terjadi Syntax Error"
            ],
            correct: 0,
            explanation: "Analisis tajam! Operator logika AND hanya menghasilkan nilai TRUE jika seluruh kondisi terpenuhi. Meskipun nilai 88 >= 85, kehadiran 85 < 90 membuat hasil akhir FALSE, sehingga status tetap 'REGULER'."
        }
    ];\n\n`;

// Insert robocodeDataset before `function openMiniGamesHub()`
content = content.replace('function openMiniGamesHub()', robocodeDataset + 'function openMiniGamesHub()');

// 2. Add Game 5 to lobby grid
const oldLobbyGrid = `                    <!-- Game 4 -->
                    <div class="mini-game-hub-card" onclick="launchMiniGame('excel_dash')">
                        <div class="game-card-bloom bloom-c5">C5 • Mengevaluasi</div>
                        <div class="game-card-icon">📊</div>
                        <h3 class="game-card-title">Excel Formula Dash</h3>
                        <p class="game-card-desc">Teka-teki rumus spreadsheet kilat: pilih formula paling presisi untuk memecahkan data studi kasus!</p>
                        <div class="game-card-footer">
                            <span class="game-tag">💡 Jurus Praktis</span>
                            <button type="button" class="btn-play-game">Mainkan ➔</button>
                        </div>
                    </div>
                </div>`;

const newLobbyGrid = `                    <!-- Game 4 -->
                    <div class="mini-game-hub-card" onclick="launchMiniGame('excel_dash')">
                        <div class="game-card-bloom bloom-c5">C5 • Mengevaluasi</div>
                        <div class="game-card-icon">📊</div>
                        <h3 class="game-card-title">Excel Formula Dash</h3>
                        <p class="game-card-desc">Teka-teki rumus spreadsheet kilat: pilih formula paling presisi untuk memecahkan data studi kasus!</p>
                        <div class="game-card-footer">
                            <span class="game-tag">💡 Jurus Praktis</span>
                            <button type="button" class="btn-play-game">Mainkan ➔</button>
                        </div>
                    </div>

                    <!-- Game 5 (NEW) -->
                    <div class="mini-game-hub-card" onclick="launchMiniGame('robocode_runner')">
                        <div class="game-card-bloom bloom-c4">C4 • Menganalisis</div>
                        <div class="game-card-icon">🤖</div>
                        <h3 class="game-card-title">RoboCode: Algoritma Runner</h3>
                        <p class="game-card-desc">Eksekusi pseudocode baris demi baris, pantau live memory watch, dan tebak nilai akhir variabel di memori!</p>
                        <div class="game-card-footer">
                            <span class="game-tag">⚡ Pseudocode &amp; IPO</span>
                            <button type="button" class="btn-play-game">Mainkan ➔</button>
                        </div>
                    </div>
                </div>`;

content = content.replace(oldLobbyGrid, newLobbyGrid);

// 3. Add case to launchMiniGame
const oldLaunchSwitch = `            case 'excel_dash':
                startExcelDash();
                break;`;

const newLaunchSwitch = `            case 'excel_dash':
                startExcelDash();
                break;
            case 'robocode_runner':
                startRoboCodeRunner();
                break;`;

content = content.replace(oldLaunchSwitch, newLaunchSwitch);

// 4. Add RoboCode Game Engine Implementation
const robocodeEngineCode = `
    // ============================================================
    // 8. GAME 5: ROBOCODE ALGORITMA RUNNER (C4 & C3)
    // ============================================================
    function startRoboCodeRunner(levelIdx) {
        if (levelIdx === undefined) levelIdx = 0;
        stopGameTimer();
        const deck = [...ROBOCODE_LEVELS];
        const currentLvl = deck[levelIdx % deck.length];

        gameState.score = gameState.score || 0;
        gameState.streak = gameState.streak || 0;
        gameState.data = {
            deck: deck,
            levelIdx: levelIdx,
            currentLevel: currentLvl,
            traceStepIdx: 0,
            isExecuting: false,
            execTimer: null
        };

        renderRoboCodeStage();
    }
    window.startRoboCodeRunner = startRoboCodeRunner;

    function renderRoboCodeStage() {
        const container = document.getElementById('games-stage-container');
        if (!container || !gameState.data) return;

        const lvl = gameState.data.currentLevel;
        const initVars = lvl.traceSteps[0].vars;

        container.innerHTML = \`
            <div class="game-play-area">
                <div class="game-hud">
                    <button type="button" class="btn-back-lobby" onclick="renderGameSelectScreen()">← Keluar ke Arena</button>
                    <div class="game-hud-stats">
                        <div class="hud-item"><span class="hud-label">LEVEL:</span> <strong>\${gameState.data.levelIdx + 1}/\${gameState.data.deck.length}</strong></div>
                        <div class="hud-item"><span class="hud-label">SKOR:</span> <strong id="hud-score">\${gameState.score}</strong></div>
                        <div class="hud-item streak-fire"><span class="hud-label">STREAK:</span> <strong id="hud-streak">🔥 \${gameState.streak}</strong></div>
                    </div>
                </div>

                <div class="robocode-arena">
                    <div class="arena-bloom-tag bloom-c4">C4 • Menganalisis Logika Pseudocode &amp; Dry Run</div>

                    <!-- 🤖 RoboCode Mascot Coach -->
                    <div class="mascot-coach-bubble" id="robocode-coach-bubble">
                        <span class="mascot-avatar-bounce" id="robocode-avatar">🤖</span>
                        <div class="mascot-coach-text" id="robocode-coach-text">
                            <strong>RoboCode:</strong> "BEEP BOOP! Cermati alur algoritma di bawah. Kamu bisa tekan 'Jalankan Simulasi ⏯️' untuk melacak langkahnya!"
                        </div>
                    </div>

                    <!-- 📋 Skenario Masalah -->
                    <div class="robocode-mission-card">
                        <div class="mission-header">MISI ALGORITMA: \${escapeHtml(lvl.title)} 🎯</div>
                        <p class="mission-desc">\${escapeHtml(lvl.scenario)}</p>
                    </div>

                    <!-- 💻 Virtual Code Terminal + Live Memory Watch Grid -->
                    <div class="robocode-ide-grid">
                        <!-- Terminal Kiri -->
                        <div class="robocode-terminal">
                            <div class="terminal-titlebar">
                                <span class="term-dot dot-red"></span>
                                <span class="term-dot dot-yellow"></span>
                                <span class="term-dot dot-green"></span>
                                <span class="term-filename">algorithm_runner.pseudo</span>
                                <button type="button" class="btn-term-run" id="btn-term-run" onclick="triggerRoboCodeRun()">
                                    ⏯️ Jalankan Simulasi
                                </button>
                            </div>
                            <div class="terminal-body" id="robocode-code-lines">
                                \${lvl.codeLines.map(line => \`
                                    <div class="term-code-line" id="code-line-\${line.num}">
                                        <span class="line-num">\${line.num}</span>
                                        <span class="line-code">\${escapeHtml(line.text)}</span>
                                        <span class="line-comment">// \${escapeHtml(line.comment)}</span>
                                    </div>
                                \`).join('')}
                            </div>
                        </div>

                        <!-- Live Memory Watch Kanan -->
                        <div class="robocode-memory-sidebar">
                            <div class="memory-header">
                                <span>🧠 Live RAM Watch</span>
                                <span class="memory-status" id="memory-step-badge">Status: Standby</span>
                            </div>
                            <div class="memory-grid" id="robocode-memory-grid">
                                \${Object.keys(initVars).map(vName => \`
                                    <div class="memory-box" id="mem-box-\${vName}">
                                        <div class="mem-var-name">\${vName}</div>
                                        <div class="mem-var-val" id="mem-val-\${vName}">\${initVars[vName]}</div>
                                    </div>
                                \`).join('')}
                            </div>
                            <div class="memory-log-note" id="memory-log-note">
                                💡 Klik 'Jalankan Simulasi' untuk melihat variabel berganti secara real-time!
                            </div>
                        </div>
                    </div>

                    <!-- ❓ Target Pertanyaan & Pilihan Jawaban -->
                    <div class="robocode-quiz-section">
                        <h4 class="robocode-question-text">❓ \${escapeHtml(lvl.targetQuestion)}</h4>
                        <div class="robocode-choices-grid">
                            \${lvl.choices.map((ch, idx) => \`
                                <button type="button" class="btn-robocode-choice" id="robo-choice-\${idx}" onclick="answerRoboCode(\${idx})">
                                    <span class="choice-tag">\${String.fromCharCode(65 + idx)}</span>
                                    <span class="choice-text">\${escapeHtml(ch)}</span>
                                </button>
                            \`).join('')}
                        </div>
                    </div>

                    <div class="robocode-feedback-panel" id="robocode-feedback-box" style="display: none;"></div>
                </div>
            </div>
        \`;
    }

    function triggerRoboCodeRun() {
        if (!gameState.data || gameState.data.isExecuting) return;
        gameState.data.isExecuting = true;
        const btn = document.getElementById('btn-term-run');
        if (btn) {
            btn.disabled = true;
            btn.textContent = '⏳ Mengeksekusi...';
        }

        const steps = gameState.data.currentLevel.traceSteps;
        let stepIdx = 0;

        function runNext() {
            if (stepIdx >= steps.length) {
                gameState.data.isExecuting = false;
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = '🔄 Ulangi Simulasi';
                }
                const coachEl = document.getElementById('robocode-coach-text');
                if (coachEl) {
                    coachEl.innerHTML = '<strong>RoboCode:</strong> "Simulasi selesai! Sekarang pilih jawaban yang tepat di bawah!"';
                }
                return;
            }

            const currentStep = steps[stepIdx];
            gameSfx.pop();

            // Highlight line
            document.querySelectorAll('.term-code-line').forEach(el => el.classList.remove('code-line-active'));
            const activeLineEl = document.getElementById(\`code-line-\${currentStep.line}\`);
            if (activeLineEl) {
                activeLineEl.classList.add('code-line-active');
            }

            // Update variables
            Object.keys(currentStep.vars).forEach(vName => {
                const valEl = document.getElementById(\`mem-val-\${vName}\`);
                const boxEl = document.getElementById(\`mem-box-\${vName}\`);
                if (valEl) {
                    valEl.textContent = currentStep.vars[vName];
                }
                if (boxEl) {
                    boxEl.classList.add('memory-updated');
                    setTimeout(() => boxEl.classList.remove('memory-updated'), 300);
                }
            });

            // Update log note
            const logEl = document.getElementById('memory-log-note');
            const badgeEl = document.getElementById('memory-step-badge');
            if (logEl) logEl.textContent = \`➡️ Langkah \${stepIdx + 1}: \${currentStep.note}\`;
            if (badgeEl) badgeEl.textContent = \`Langkah \${stepIdx + 1}/\${steps.length}\`;

            stepIdx++;
            gameState.data.execTimer = setTimeout(runNext, 450);
        }

        runNext();
    }
    window.triggerRoboCodeRun = triggerRoboCodeRun;

    function answerRoboCode(choiceIdx) {
        if (!gameState.data) return;
        const currentLvl = gameState.data.currentLevel;
        const isCorrect = (choiceIdx === currentLvl.correct);
        const feedbackEl = document.getElementById('robocode-feedback-box');
        const coachEl = document.getElementById('robocode-coach-text');
        const avatarEl = document.getElementById('robocode-avatar');

        if (isCorrect) {
            gameState.streak++;
            if (gameState.streak > gameState.maxStreak) gameState.maxStreak = gameState.streak;
            const pts = 160 + (gameState.streak * 35);
            gameState.score += pts;
            gameSfx.correct(gameState.streak);

            const choiceBtn = document.getElementById(\`robo-choice-\${choiceIdx}\`);
            if (choiceBtn) spawnFloatingScore(choiceBtn, pts, gameState.streak);

            if (coachEl) {
                if (avatarEl) avatarEl.textContent = '🌟';
                coachEl.innerHTML = '<strong>RoboCode:</strong> "BEEP BOOP! ANALISIS SEMPURNA! Alur logika pseudocode kamu sangat jernih!"';
            }
        } else {
            gameSfx.wrong();
            gameState.streak = 0;
            if (coachEl) {
                if (avatarEl) avatarEl.textContent = '🤖💥';
                coachEl.innerHTML = '<strong>RoboCode:</strong> "BZZZT! Ada kesalahan dry-run! Perhatikan perubahan nilai pada Live RAM Watch!"';
            }
        }

        const scoreEl = document.getElementById('hud-score');
        const streakEl = document.getElementById('hud-streak');
        if (scoreEl) scoreEl.textContent = gameState.score;
        if (streakEl) streakEl.textContent = \`🔥 \${gameState.streak}\`;

        if (feedbackEl) {
            feedbackEl.style.display = 'block';
            feedbackEl.className = \`robocode-feedback-panel \${isCorrect ? 'fb-correct' : 'fb-wrong'}\`;
            feedbackEl.innerHTML = \`<strong>\${isCorrect ? '🎉 LOGIKA TEPAT SEKALI!' : '💡 ANALISIS ULANG!'}</strong> \${currentLvl.explanation}\`;
        }

        setTimeout(function() {
            if (gameState.data.levelIdx < gameState.data.deck.length - 1) {
                startRoboCodeRunner(gameState.data.levelIdx + 1);
            } else {
                endMiniGame('RoboCode: Algoritma Runner', '🏆 LUAR BIASA! Kamu telah menuntaskan seluruh tantangan analisis pseudocode & algoritma dengan gemilang!');
            }
        }, 1400);
    }
    window.answerRoboCode = answerRoboCode;
`;

content = content + robocodeEngineCode;

fs.writeFileSync(miniGamesPath, content, 'utf8');
console.log('Successfully injected RoboCode game into js/mini_games.js!');
