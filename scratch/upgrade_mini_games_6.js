const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'js', 'mini_games.js');
let code = fs.readFileSync(targetFile, 'utf8');

// 1. Define Binary Search Dataset and Game Engine
const binarySearchDataAndEngine = `
    // ============================================================
    // DATA GAME 6: BINARY SEARCH QUEST (C4 MENGANALISIS & C3 MENERAPKAN)
    // ============================================================
    const BINARY_SEARCH_LEVELS = [
        {
            level: 1,
            title: "Level 1: Kasus Berkas Guru Honorer (10 Berkas Terurut)",
            scenario: "Cari berkas rahasia bernomor ID di bawah ini dengan langkah seminimal mungkin!",
            files: [12, 19, 25, 34, 48, 55, 67, 78, 89, 94],
            targetIndex: 6, // target: 67
            optimalSteps: 3,
            hint: "Selalu pilih berkas di posisi TENGAH (MID) antara batas KIRI (L) dan KANAN (R)!"
        },
        {
            level: 2,
            title: "Level 2: Arsip Log Transaksi Server (16 Berkas Terurut)",
            scenario: "Temukan nomor transaksi mencurigakan CV DataKilat dalam arsip bank data.",
            files: [105, 118, 124, 137, 149, 155, 168, 172, 185, 199, 210, 225, 238, 246, 259, 275],
            targetIndex: 11, // target: 225
            optimalSteps: 4,
            hint: "Jika target > nilai tengah, eliminasi belahan KIRI. Jika target < nilai tengah, eliminasi belahan KANAN."
        },
        {
            level: 3,
            title: "Level 3: Brankas Password Root Enkripsi (20 Berkas Terurut)",
            scenario: "Lacak kode kunci root server sebelum akses ditutup!",
            files: [302, 315, 329, 341, 356, 368, 377, 389, 401, 415, 428, 439, 452, 468, 477, 489, 503, 517, 529, 545],
            targetIndex: 4, // target: 356
            optimalSteps: 5,
            hint: "Dengan Binary Search, 20 data hanya butuh maksimal 5 kali perbandingan (O(log N))!"
        }
    ];

    function startBinarySearch(levelIdx) {
        if (levelIdx === undefined) levelIdx = 0;
        stopGameTimer();
        const level = BINARY_SEARCH_LEVELS[levelIdx % BINARY_SEARCH_LEVELS.length];
        const files = [...level.files];
        const targetVal = files[level.targetIndex];

        gameState.score = gameState.score || 0;
        gameState.streak = gameState.streak || 0;
        gameState.data = {
            levelIdx: levelIdx,
            currentLevel: level,
            files: files,
            targetVal: targetVal,
            low: 0,
            high: files.length - 1,
            steps: 0,
            isAnswered: false,
            feedbackMsg: null
        };

        renderBinarySearchStage();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.startBinarySearch = startBinarySearch;

    function renderBinarySearchStage() {
        const container = document.getElementById('games-stage-container');
        if (!container || !gameState.data) return;

        const data = gameState.data;
        const level = data.currentLevel;
        const mid = Math.floor((data.low + data.high) / 2);

        container.innerHTML = \`
            <div class="game-play-area">
                <div class="game-hud">
                    <button type="button" class="btn-back-lobby" onclick="renderGameSelectScreen()">← Keluar ke Arena</button>
                    <div class="game-hud-stats">
                        <div class="hud-item"><span class="hud-label">LEVEL:</span> <strong>\${data.levelIdx + 1}/\${BINARY_SEARCH_LEVELS.length}</strong></div>
                        <div class="hud-item"><span class="hud-label">SKOR:</span> <strong id="hud-score">\${gameState.score}</strong></div>
                        <div class="hud-item streak-fire"><span class="hud-label">STREAK:</span> <strong id="hud-streak">🔥 \${gameState.streak}</strong></div>
                        <div class="hud-item"><span class="hud-label">LANGKAH:</span> <strong>\${data.steps}</strong> / maks \${level.optimalSteps}</div>
                    </div>
                </div>

                <div class="binary-search-arena" style="max-width: 900px; margin: 0 auto; padding: 20px 10px;">
                    <div class="arena-bloom-tag bloom-c4">C4 • Menganalisis Algoritma Pencarian Biner O(log N)</div>
                    <h3 style="color: #fff; margin: 10px 0 4px 0; text-align: center;">\${level.title}</h3>
                    
                    <!-- Target ID Banner -->
                    <div style="background: linear-gradient(135deg, rgba(14,165,233,0.2), rgba(99,102,241,0.2)); border: 2px solid #38bdf8; border-radius: 14px; padding: 14px 20px; margin: 14px 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <span style="font-size: 0.78rem; text-transform: uppercase; color: #94a3b8; font-weight: 800; display: block;">TARGET BERKAS RAHASIA:</span>
                            <strong style="font-size: 1.6rem; color: #38bdf8; font-family: monospace; letter-spacing: 2px;">📁 ID: \${data.targetVal}</strong>
                        </div>
                        <div style="text-align: right; font-size: 0.85rem; color: #cbd5e1;">
                            Rentang Aktif: <strong style="color: #38bdf8;">[\${data.low} ... \${data.high}]</strong> (\${data.high - data.low + 1} Berkas Tersisa)
                        </div>
                    </div>

                    <!-- 🔍 Mascot Coach Reaction -->
                    <div class="mascot-coach-bubble" style="margin-bottom: 16px;">
                        <span class="mascot-avatar-bounce" id="binary-avatar">🔍</span>
                        <div class="mascot-coach-text" id="binary-coach-text">
                            \${data.feedbackMsg ? data.feedbackMsg : \`<strong>Detektif Arsip:</strong> "\${level.hint}"\`}
                        </div>
                    </div>

                    <!-- Rak Arsip Interaktif -->
                    <div class="binary-files-rack" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); gap: 10px; margin: 20px 0;">
                        \${data.files.map((val, idx) => {
                            const isEliminated = (idx < data.low || idx > data.high);
                            const isMid = (!isEliminated && idx === mid);
                            const isTarget = (val === data.targetVal && data.isAnswered);
                            
                            let borderStyle = isMid ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)';
                            let bgStyle = isMid ? 'rgba(56,189,248,0.22)' : 'rgba(30,41,59,0.85)';
                            let opacity = isEliminated ? '0.3' : '1';
                            let transform = isMid ? 'scale(1.06)' : 'scale(1)';
                            if (isTarget) {
                                bgStyle = 'rgba(16,185,129,0.35)';
                                borderStyle = '2px solid #10b981';
                            }

                            return \`
                                <button type="button" 
                                        class="binary-file-card \${isMid ? 'file-midpoint' : ''} \${isEliminated ? 'file-eliminated' : ''}"
                                        id="file-folder-\${idx}"
                                        onclick="guessBinarySearch(\${idx})"
                                        \${isEliminated || data.isAnswered ? 'disabled' : ''}
                                        style="background: \${bgStyle}; border: \${borderStyle}; opacity: \${opacity}; transform: \${transform}; border-radius: 12px; padding: 12px 6px; color: #fff; cursor: \${isEliminated ? 'not-allowed' : 'pointer'}; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                    <span style="font-size: 1.4rem;">\${isTarget ? '🎉' : (isEliminated ? '🔒' : '📁')}</span>
                                    <strong style="font-size: 0.95rem; font-family: monospace; color: \${isMid ? '#38bdf8' : '#f1f5f9'};">\${val}</strong>
                                    <span style="font-size: 0.65rem; color: \${isMid ? '#38bdf8' : '#94a3b8'}; font-weight: 700;">\${isMid ? '[MID 🎯]' : \`[\${idx}]\`}</span>
                                </button>
                            \`;
                        }).join('')}
                    </div>

                    <div style="background: rgba(15,23,42,0.6); border: 1px dashed rgba(255,255,255,0.2); border-radius: 10px; padding: 10px 16px; font-size: 0.8rem; color: #94a3b8; text-align: center;">
                        💡 <strong>Cara Bermain:</strong> Klik folder bertanda <strong style="color:#38bdf8;">[MID 🎯]</strong> untuk membandingkan. Sistem akan membuang separuh data secara instan!
                    </div>
                </div>
            </div>
        \`;
    }

    function guessBinarySearch(idx) {
        if (!gameState.data || gameState.data.isAnswered) return;
        const data = gameState.data;
        const level = data.currentLevel;
        const clickedVal = data.files[idx];

        data.steps++;
        const targetCell = document.getElementById(\`file-folder-\${idx}\`);

        if (clickedVal === data.targetVal) {
            // BERHASIL DITEMUKAN!
            data.isAnswered = true;
            gameState.streak++;
            if (gameState.streak > gameState.maxStreak) gameState.maxStreak = gameState.streak;

            const bonusSteps = Math.max(0, (level.optimalSteps - data.steps) * 40);
            const pts = 200 + (gameState.streak * 30) + bonusSteps;
            gameState.score += pts;
            gameSfx.correct(gameState.streak);
            if (targetCell) spawnFloatingScore(targetCell, pts, gameState.streak);

            data.feedbackMsg = \`<strong>Detektif Arsip:</strong> "🏆 BINGO! Berkas rahasia ID: \${data.targetVal} berhasil ditemukan dalam \${data.steps} langkah! Efisiensi O(log N) terbukti!"\`;
            renderBinarySearchStage();

            setTimeout(function() {
                if (data.levelIdx < BINARY_SEARCH_LEVELS.length - 1) {
                    startBinarySearch(data.levelIdx + 1);
                } else {
                    endMiniGame('Binary Search: Detektif Arsip', \`🏆 LUAR BIASA! Kamu menuntaskan semua berkas investigasi dengan algoritma Pencarian Biner tercepat!\\nTotal Langkah: \${data.steps}\`);
                }
            }, 1400);
        } else if (clickedVal < data.targetVal) {
            gameSfx.swap(50);
            data.low = idx + 1;
            data.feedbackMsg = \`<strong>Detektif Arsip:</strong> "ID \${clickedVal} LEBIH KECIL dari \${data.targetVal}! Semua berkas ID &le; \${clickedVal} berhasil DIELIMINASI!"\`;
            renderBinarySearchStage();
        } else {
            gameSfx.swap(50);
            data.high = idx - 1;
            data.feedbackMsg = \`<strong>Detektif Arsip:</strong> "ID \${clickedVal} LEBIH BESAR dari \${data.targetVal}! Semua berkas ID &ge; \${clickedVal} berhasil DIELIMINASI!"\`;
            renderBinarySearchStage();
        }
    }
    window.guessBinarySearch = guessBinarySearch;
`;

// Insert the new binary search dataset and engine before renderGameSelectScreen
if (!code.includes('BINARY_SEARCH_LEVELS')) {
    code = code.replace('function renderGameSelectScreen()', binarySearchDataAndEngine + '\n    function renderGameSelectScreen()');
}

// 2. Replace the games-selection-grid with 6 perfectly balanced cards with unified clean labels
const updatedLobbyGrid = `                <div class="games-selection-grid">
                    <!-- Game 1 -->
                    <div class="mini-game-hub-card" onclick="launchMiniGame('hoax_buster')">
                        <div class="game-card-bloom bloom-c4">C4 • Menganalisis</div>
                        <div class="game-card-icon">🕵️</div>
                        <h3 class="game-card-title">Detektif Hoax Buster</h3>
                        <p class="game-card-desc">Speedrun 30 detik memilah pesan viral: Mana FAKTA resmi dan mana HOAKS berbahaya!</p>
                        <div class="game-card-footer">
                            <span class="game-tag">⚡ Refleks Cepat</span>
                            <button type="button" class="btn-play-game" onclick="event.stopPropagation(); launchMiniGame('hoax_buster')">Mainkan ➔</button>
                        </div>
                    </div>

                    <!-- Game 2 -->
                    <div class="mini-game-hub-card" onclick="launchMiniGame('sort_dash')">
                        <div class="game-card-bloom bloom-c3">C3 • Menerapkan</div>
                        <div class="game-card-icon">⚡</div>
                        <h3 class="game-card-title">Algoritma Balap: Sorting Dash</h3>
                        <p class="game-card-desc">Tukar balok angka bersebelahan dengan langkah paling sedikit ala Bubble Sort hingga terurut!</p>
                        <div class="game-card-footer">
                            <span class="game-tag">🧩 Logika Algoritma</span>
                            <button type="button" class="btn-play-game" onclick="event.stopPropagation(); launchMiniGame('sort_dash')">Mainkan ➔</button>
                        </div>
                    </div>

                    <!-- Game 3 -->
                    <div class="mini-game-hub-card" onclick="launchMiniGame('kitchen_express')">
                        <div class="game-card-bloom bloom-c3">C3 • Menerapkan</div>
                        <div class="game-card-icon">🥞</div>
                        <h3 class="game-card-title">Stack vs Queue Kitchen</h3>
                        <p class="game-card-desc">Uji refleks LIFO (tumpukan piring bersih) vs FIFO (antrean loket kantin) dalam tempo cepat!</p>
                        <div class="game-card-footer">
                            <span class="game-tag">⏱️ 40s Ritmis</span>
                            <button type="button" class="btn-play-game" onclick="event.stopPropagation(); launchMiniGame('kitchen_express')">Mainkan ➔</button>
                        </div>
                    </div>

                    <!-- Game 4 -->
                    <div class="mini-game-hub-card" onclick="launchMiniGame('excel_dash')">
                        <div class="game-card-bloom bloom-c5">C5 • Mengevaluasi</div>
                        <div class="game-card-icon">📊</div>
                        <h3 class="game-card-title">Excel Formula Dash</h3>
                        <p class="game-card-desc">Teka-teki rumus spreadsheet kilat: pilih formula paling presisi untuk memecahkan data studi kasus!</p>
                        <div class="game-card-footer">
                            <span class="game-tag">💡 Jurus Praktis</span>
                            <button type="button" class="btn-play-game" onclick="event.stopPropagation(); launchMiniGame('excel_dash')">Mainkan ➔</button>
                        </div>
                    </div>

                    <!-- Game 5 -->
                    <div class="mini-game-hub-card" onclick="launchMiniGame('robocode_runner')">
                        <div class="game-card-bloom bloom-c4">C4 • Menganalisis</div>
                        <div class="game-card-icon">🤖</div>
                        <h3 class="game-card-title">RoboCode: Algoritma Runner</h3>
                        <p class="game-card-desc">Eksekusi pseudocode baris demi baris, pantau live memory watch, dan tebak nilai akhir variabel di memori!</p>
                        <div class="game-card-footer">
                            <span class="game-tag">⚡ Pseudocode &amp; IPO</span>
                            <button type="button" class="btn-play-game" onclick="event.stopPropagation(); launchMiniGame('robocode_runner')">Mainkan ➔</button>
                        </div>
                    </div>

                    <!-- Game 6 (NEW: Balancing to 6 Symmetrical Cards) -->
                    <div class="mini-game-hub-card" onclick="launchMiniGame('binary_search')">
                        <div class="game-card-bloom bloom-c4">C4 • Menganalisis</div>
                        <div class="game-card-icon">🔍</div>
                        <h3 class="game-card-title">Binary Search: Detektif Arsip</h3>
                        <p class="game-card-desc">Temukan ID berkas rahasia di antara arsip terurut dengan langkah minimal eliminasi biner O(log N)!</p>
                        <div class="game-card-footer">
                            <span class="game-tag">🔎 Pencarian Biner</span>
                            <button type="button" class="btn-play-game" onclick="event.stopPropagation(); launchMiniGame('binary_search')">Mainkan ➔</button>
                        </div>
                    </div>
                </div>`;

const gridRegex = /<div class="games-selection-grid">[\s\S]*?<\/div>\s*<\/div>\s*`;/m;
code = code.replace(gridRegex, updatedLobbyGrid + '\n            </div>\n        `;');

// 3. Update launchMiniGame switch statement to support binary_search
if (!code.includes("case 'binary_search':")) {
    const launchSwitchRegex = /case 'robocode_runner':\s*startRoboCodeRunner\(0\);\s*break;/;
    code = code.replace(launchSwitchRegex, `case 'robocode_runner':
                startRoboCodeRunner(0);
                break;
            case 'binary_search':
                startBinarySearch(0);
                break;`);
}

// 4. Update stopGameTimer to clear execTimer (Fix Bug 4)
const oldStopGameTimer = `    function stopGameTimer() {
        if (gameState.timer) {
            clearInterval(gameState.timer);
            gameState.timer = null;
        }
    }`;

const newStopGameTimer = `    function stopGameTimer() {
        if (gameState.timer) {
            clearInterval(gameState.timer);
            gameState.timer = null;
        }
        if (gameState.data && gameState.data.execTimer) {
            clearTimeout(gameState.data.execTimer);
            gameState.data.execTimer = null;
        }
    }`;

code = code.replace(oldStopGameTimer, newStopGameTimer);

// 5. Fix calculateSortProgress division by zero (Fix Bug 7)
code = code.replace(/const maxInv = \(n \* \(n - 1\)\) \/ 2;/, 'const maxInv = (n * (n - 1)) / 2;\n        if (maxInv <= 0) return 100;');

// 6. Fix checkSortStatus blocking confirm() (Fix Bug 5)
const oldSortConfirm = `if (confirm(\`🎉 HEBAT! Balok berhasil terurut dalam \${gameState.data.moves} langkah!\\nRating: \${starsEmoji}\\n\\nLanjut ke Level berikutnya?\`)) {
                        startSortDash(gameState.data.levelIndex + 1);
                    }`;

const newSortConfirm = `startSortDash(gameState.data.levelIndex + 1);
                    if (typeof showToast === 'function') {
                        showToast(\`Level Selesai dalam \${gameState.data.moves} langkah! \${starsEmoji}\`, '🎉');
                    }`;

code = code.replace(oldSortConfirm, newSortConfirm);

// 7. Fix rapid double-click in answerRoboCode (Fix Bug 3)
code = code.replace(/function answerRoboCode\(choiceIdx\) \{\s*if \(!gameState\.data\) return;/, `function answerRoboCode(choiceIdx) {
        if (!gameState.data || gameState.data.isAnswered) return;
        gameState.data.isAnswered = true;
        document.querySelectorAll('.btn-robocode-choice').forEach(b => b.disabled = true);`);

// 8. Fix rapid double-click in answerExcelDash (Fix Bug 3)
code = code.replace(/function answerExcelDash\(choiceIdx\) \{\s*if \(!gameState\.data\) return;/, `function answerExcelDash(choiceIdx) {
        if (!gameState.data || gameState.data.isAnswered) return;
        gameState.data.isAnswered = true;
        document.querySelectorAll('.btn-formula-choice').forEach(b => b.disabled = true);`);

// 9. Fix rapid double-click in answerHoaxBuster (Fix Bug 3)
code = code.replace(/function answerHoaxBuster\(chosenIsHoax\) \{\s*if \(!gameState\.data\) return;/, `function answerHoaxBuster(chosenIsHoax) {
        if (!gameState.data || gameState.data.isAnswered) return;
        gameState.data.isAnswered = true;
        document.querySelectorAll('.btn-hoax-choice').forEach(b => b.disabled = true);`);

// 10. Expose window functions inside the closure
const windowExports = `
    window.openMiniGamesHub = openMiniGamesHub;
    window.renderGameSelectScreen = renderGameSelectScreen;
    window.launchMiniGame = launchMiniGame;
    window.startBinarySearch = startBinarySearch;
    window.guessBinarySearch = guessBinarySearch;
    window.startRoboCodeRunner = startRoboCodeRunner;
    window.triggerRoboCodeRun = triggerRoboCodeRun;
    window.answerRoboCode = answerRoboCode;
`;

if (!code.includes('window.guessBinarySearch = guessBinarySearch;')) {
    code = code.replace('})();', windowExports + '\n})();');
}

fs.writeFileSync(targetFile, code, 'utf8');
console.log("Mini games engine successfully upgraded to 6 balanced games and bugs patched!");
