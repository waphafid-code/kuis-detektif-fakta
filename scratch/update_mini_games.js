const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'js', 'mini_games.js');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Upgrade gameSfx and add spawnFloatingScore
const oldSfx = `    const gameSfx = {
        correct: function() {
            playTone(587.33, 'sine', 0.1, 0.15); // D5
            setTimeout(function() { playTone(880.00, 'sine', 0.2, 0.15); }, 90); // A5
        },
        wrong: function() {
            playTone(220, 'sawtooth', 0.25, 0.12);
        },
        swap: function() {
            playTone(440, 'triangle', 0.08, 0.1);
        },
        pop: function() {
            playTone(659.25, 'sine', 0.08, 0.12);
        },
        win: function() {
            [523.25, 659.25, 783.99, 1046.50].forEach(function(freq, i) {
                setTimeout(function() { playTone(freq, 'triangle', 0.25, 0.15); }, i * 110);
            });
        },
        tick: function() {
            playTone(800, 'sine', 0.03, 0.04);
        }
    };`;

const newSfx = `    const gameSfx = {
        correct: function(streak) {
            if (streak === undefined) streak = 0;
            const pitchMult = Math.pow(1.05946, Math.min(streak, 8)); // Naik 1 seminada tiap streak
            playTone(587.33 * pitchMult, 'sine', 0.1, 0.16); // D5
            setTimeout(function() { playTone(880.00 * pitchMult, 'sine', 0.2, 0.16); }, 90); // A5
        },
        wrong: function() {
            playTone(220, 'sawtooth', 0.25, 0.14);
            setTimeout(function() { playTone(180, 'sawtooth', 0.2, 0.12); }, 100);
        },
        stamp: function() {
            playTone(160, 'triangle', 0.08, 0.25);
            setTimeout(function() { playTone(110, 'sine', 0.12, 0.2); }, 25);
        },
        swap: function(progressPct) {
            if (progressPct === undefined) progressPct = 0;
            const baseFreq = 440 + (progressPct * 2.2);
            playTone(baseFreq, 'triangle', 0.09, 0.14);
        },
        pop: function() {
            playTone(659.25, 'sine', 0.08, 0.14);
        },
        win: function() {
            [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach(function(freq, i) {
                setTimeout(function() { playTone(freq, 'triangle', 0.25, 0.16); }, i * 90);
            });
        },
        tick: function() {
            playTone(850, 'sine', 0.03, 0.05);
        }
    };

    // ✨ HELPER FLOATING SCORE & JUICE
    function spawnFloatingScore(parentEl, points, streak) {
        if (!parentEl) return;
        const popup = document.createElement('div');
        popup.className = 'floating-score-popup';
        popup.innerHTML = \`<span class="score-plus">+\${points}</span>\${streak > 1 ? \` <span class="score-streak">🔥 x\${streak}!</span>\` : ''}\`;
        parentEl.appendChild(popup);
        setTimeout(function() { popup.remove(); }, 850);
    }`;

code = code.replace(oldSfx, newSfx);

// 2. Upgrade Hoax Buster Render & Answer with Rubber Stamp & Mascot Coach
const oldHoaxRender = `                <div class="hoax-buster-arena">
                    <div class="arena-bloom-tag bloom-c4">C4 • Menganalisis Validitas Sumber</div>
                    <div class="hoax-flash-card" id="hoax-card-box">
                        <div class="hoax-card-badge">Pesan Viral Masuk 📲</div>
                        <div class="hoax-card-content" id="hoax-card-text">
                            \${escapeHtml(currentItem.text)}
                        </div>
                    </div>

                    <div class="hoax-action-controls">
                        <button type="button" class="btn-hoax-choice btn-hoax-fake" onclick="answerHoaxBuster(true)">
                            <span class="choice-icon">❌</span>
                            <span class="choice-text">HOAKS / BIAS</span>
                            <span class="choice-sub">[Tolak &amp; Teliti]</span>
                        </button>
                        <button type="button" class="btn-hoax-choice btn-hoax-real" onclick="answerHoaxBuster(false)">
                            <span class="choice-icon">✅</span>
                            <span class="choice-text">FAKTA RESMI</span>
                            <span class="choice-sub">[Domain Terverifikasi]</span>
                        </button>
                    </div>

                    <div class="hoax-instant-reason" id="hoax-reason-box" style="display: none;"></div>
                </div>`;

const newHoaxRender = `                <div class="hoax-buster-arena">
                    <div class="arena-bloom-tag bloom-c4">C4 • Menganalisis Validitas Sumber</div>
                    
                    <!-- 🕵️ Real-Time Mascot Coach Reaction -->
                    <div class="mascot-coach-bubble" id="mascot-coach-box">
                        <span class="mascot-avatar-bounce" id="mascot-avatar">🕵️‍♂️</span>
                        <div class="mascot-coach-text" id="mascot-coach-text">
                            <strong>Detektif Fakta:</strong> Cermati domain URL, ejaan nama instansi, dan desakan waktu pada pesan masuk!
                        </div>
                    </div>

                    <div class="hoax-flash-card" id="hoax-card-box">
                        <div class="hoax-card-badge">Pesan Viral Masuk 📲</div>
                        <div class="hoax-card-content" id="hoax-card-text">
                            \${escapeHtml(currentItem.text)}
                        </div>
                    </div>

                    <div class="hoax-action-controls">
                        <button type="button" class="btn-hoax-choice btn-hoax-fake" onclick="answerHoaxBuster(true)">
                            <span class="choice-icon">🚫</span>
                            <span class="choice-text">HOAKS / BIAS</span>
                            <span class="choice-sub">[Tolak &amp; Teliti]</span>
                        </button>
                        <button type="button" class="btn-hoax-choice btn-hoax-real" onclick="answerHoaxBuster(false)">
                            <span class="choice-icon">🛡️</span>
                            <span class="choice-text">FAKTA RESMI</span>
                            <span class="choice-sub">[Domain Terverifikasi]</span>
                        </button>
                    </div>

                    <div class="hoax-instant-reason" id="hoax-reason-box" style="display: none;"></div>
                </div>`;

code = code.replace(oldHoaxRender, newHoaxRender);

// 3. Upgrade answerHoaxBuster function
const oldAnswerHoax = `    function answerHoaxBuster(studentSaysHoax) {
        if (!gameState.data) return;
        const currentItem = gameState.data.deck[gameState.data.currentIndex];
        const isCorrect = (studentSaysHoax === currentItem.isHoax);

        const cardEl = document.getElementById('hoax-card-box');
        const reasonEl = document.getElementById('hoax-reason-box');

        if (isCorrect) {
            gameSfx.correct();
            gameState.streak++;
            if (gameState.streak > gameState.maxStreak) gameState.maxStreak = gameState.streak;
            const points = 100 + (gameState.streak * 20);
            gameState.score += points;
            gameState.data.correctCount++;

            if (cardEl) {
                cardEl.classList.add('flash-correct');
                setTimeout(() => cardEl.classList.remove('flash-correct'), 300);
            }
        } else {
            gameSfx.wrong();
            gameState.streak = 0;
            if (cardEl) {
                cardEl.classList.add('flash-wrong');
                setTimeout(() => cardEl.classList.remove('flash-wrong'), 300);
            }
        }

        if (reasonEl) {
            reasonEl.style.display = 'block';
            reasonEl.className = \`hoax-instant-reason \${isCorrect ? 'reason-correct' : 'reason-wrong'}\`;
            reasonEl.innerHTML = \`<strong>\${isCorrect ? '🎯 TEPAT!' : '⚠️ KURANG TEPAT!'}</strong> \${currentItem.reason}\`;
        }

        const scoreEl = document.getElementById('hud-score');
        const streakEl = document.getElementById('hud-streak');
        if (scoreEl) scoreEl.textContent = gameState.score;
        if (streakEl) streakEl.textContent = \`🔥 \${gameState.streak}\`;

        setTimeout(() => {
            gameState.data.currentIndex++;
            if (gameState.data.currentIndex >= gameState.data.deck.length) {
                endMiniGame('Detektif Hoax Buster', 'Luar biasa! Kamu berhasil menuntaskan seluruh arsip berita viral!');
            } else {
                const nextItem = gameState.data.deck[gameState.data.currentIndex];
                const cardText = document.getElementById('hoax-card-text');
                if (cardText) cardText.textContent = nextItem.text;
                if (reasonEl) reasonEl.style.display = 'none';
            }
        }, 650);
    }`;

const newAnswerHoax = `    function answerHoaxBuster(studentSaysHoax) {
        if (!gameState.data) return;
        const currentItem = gameState.data.deck[gameState.data.currentIndex];
        const isCorrect = (studentSaysHoax === currentItem.isHoax);

        const cardEl = document.getElementById('hoax-card-box');
        const reasonEl = document.getElementById('hoax-reason-box');
        const coachEl = document.getElementById('mascot-coach-text');
        const avatarEl = document.getElementById('mascot-avatar');

        // 💥 Rubber Stamp Slam Effect
        gameSfx.stamp();
        if (cardEl) {
            const stamp = document.createElement('div');
            stamp.className = \`hoax-stamp \${studentSaysHoax ? 'stamp-hoax' : 'stamp-fakta'}\`;
            stamp.innerHTML = studentSaysHoax ? '🚫 HOAKS TERTOLAK!' : '🛡️ FAKTA RESMI!';
            cardEl.appendChild(stamp);
            setTimeout(function() { stamp.remove(); }, 700);
        }

        if (isCorrect) {
            gameState.streak++;
            if (gameState.streak > gameState.maxStreak) gameState.maxStreak = gameState.streak;
            const points = 100 + (gameState.streak * 25);
            gameState.score += points;
            gameState.data.correctCount++;

            gameSfx.correct(gameState.streak);
            spawnFloatingScore(cardEl, points, gameState.streak);

            if (cardEl) {
                cardEl.classList.add('flash-correct');
                setTimeout(function() { cardEl.classList.remove('flash-correct'); }, 350);
            }

            if (coachEl) {
                if (avatarEl) avatarEl.textContent = '🌟';
                const cheers = [
                    "<strong>Detektif Fakta:</strong> 'Analisis mantap! Red flag manipulasi berhasil terdeteksi!'",
                    "<strong>Detektif Fakta:</strong> 'Pilihan cerdas! Domain dan keaslian sumber tervalidasi!'",
                    "<strong>Detektif Fakta:</strong> 'Insting literasi digitalmu tajam sekali! Lanjutkan!'",
                    "<strong>Detektif Fakta:</strong> 'Bagus! Jebakan urgensi waktu berhasil kamu tangkal!'"
                ];
                coachEl.innerHTML = cheers[Math.floor(Math.random() * cheers.length)];
            }
        } else {
            gameSfx.wrong();
            gameState.streak = 0;
            if (cardEl) {
                cardEl.classList.add('flash-wrong');
                setTimeout(function() { cardEl.classList.remove('flash-wrong'); }, 350);
            }

            if (coachEl) {
                if (avatarEl) avatarEl.textContent = '🧐';
                coachEl.innerHTML = "<strong>Detektif Fakta:</strong> 'Hati-hati! Penipu sering memakai desakan panik atau hadiah manis!'";
            }
        }

        if (reasonEl) {
            reasonEl.style.display = 'block';
            reasonEl.className = \`hoax-instant-reason \${isCorrect ? 'reason-correct' : 'reason-wrong'}\`;
            reasonEl.innerHTML = \`<strong>\${isCorrect ? '🎯 TEPAT!' : '⚠️ KURANG TEPAT!'}</strong> \${currentItem.reason}\`;
        }

        const scoreEl = document.getElementById('hud-score');
        const streakEl = document.getElementById('hud-streak');
        if (scoreEl) scoreEl.textContent = gameState.score;
        if (streakEl) streakEl.textContent = \`🔥 \${gameState.streak}\`;

        setTimeout(function() {
            gameState.data.currentIndex++;
            if (gameState.data.currentIndex >= gameState.data.deck.length) {
                endMiniGame('Detektif Hoax Buster', 'Luar biasa! Kamu berhasil menuntaskan seluruh arsip berita viral dengan presisi tinggi!');
            } else {
                const nextItem = gameState.data.deck[gameState.data.currentIndex];
                const cardText = document.getElementById('hoax-card-text');
                if (cardText) cardText.textContent = nextItem.text;
                if (reasonEl) reasonEl.style.display = 'none';
            }
        }, 750);
    }`;

code = code.replace(oldAnswerHoax, newAnswerHoax);

// 4. Upgrade Sorting Dash with Inversion Progress & Animated Swaps
const oldSortRender = `                <div class="sorting-dash-arena">
                    <div class="arena-bloom-tag bloom-c3">C3 • Menerapkan Logika Bubble Sort</div>
                    <h3 style="color: #fff; margin: 6px 0 2px 0;">\${gameState.data.levelTitle}</h3>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 14px;">
                        Klik <strong>dua balok bersebelahan</strong> untuk menukar posisinya (Swap) hingga berurutan dari terkecil ke terbesar!
                    </p>

                    <div class="sort-interactive-board" id="sort-bars-board">
                        \${gameState.data.array.map((val, idx) => {
                            const heightPct = Math.round((val / maxVal) * 160) + 40;
                            const isSelected = gameState.data.selectedIndex === idx;
                            return \`
                                <div class="sort-dash-bar \${isSelected ? 'bar-selected' : ''}" 
                                     id="bar-item-\${idx}" 
                                     style="height: \${heightPct}px;"
                                     onclick="handleSortBarClick(\${idx})">
                                    <div class="bar-val-badge">\${val}</div>
                                    <div class="bar-index-label">[\${idx}]</div>
                                </div>
                            \`;
                        }).join('')}
                    </div>

                    <div class="sort-action-toolbar">
                        <button type="button" class="btn-dash-action" onclick="resetCurrentSortLevel()">🔄 Acak Ulang</button>
                        <div class="sort-hint-box">
                            💡 <em>\${gameState.data.hint}</em>
                        </div>
                    </div>
                </div>`;

const newSortRender = `                <div class="sorting-dash-arena">
                    <div class="arena-bloom-tag bloom-c3">C3 • Menerapkan Logika Bubble Sort</div>
                    <h3 style="color: #fff; margin: 6px 0 2px 0;">\${gameState.data.levelTitle}</h3>
                    
                    <!-- ⚡ Progress Kerapian & Mascot Coach -->
                    <div class="mascot-coach-bubble">
                        <span class="mascot-avatar-bounce">⚡</span>
                        <div class="mascot-coach-text" id="sort-coach-text">
                            <strong>Algoritma Coach:</strong> Bandingkan dua balok bersebelahan. Jika kiri &gt; kanan, tukar (Swap) agar balok besar mengapung ke kanan!
                        </div>
                    </div>

                    <div class="sort-progress-wrap">
                        <span class="sort-progress-label">Tingkat Kerapian:</span>
                        <div class="sort-progress-track">
                            <div class="sort-progress-fill" id="sort-progress-fill" style="width: \${calculateSortProgress(gameState.data.array)}%"></div>
                        </div>
                        <span class="sort-progress-pct" id="sort-progress-pct">\${calculateSortProgress(gameState.data.array)}%</span>
                    </div>

                    <div class="sort-interactive-board" id="sort-bars-board">
                        \${gameState.data.array.map((val, idx) => {
                            const heightPct = Math.round((val / maxVal) * 160) + 40;
                            const isSelected = gameState.data.selectedIndex === idx;
                            return \`
                                <div class="sort-dash-bar \${isSelected ? 'bar-selected' : ''}" 
                                     id="bar-item-\${idx}" 
                                     style="height: \${heightPct}px;"
                                     onclick="handleSortBarClick(\${idx})">
                                    <div class="bar-val-badge">\${val}</div>
                                    <div class="bar-index-label">[\${idx}]</div>
                                </div>
                            \`;
                        }).join('')}
                    </div>

                    <div class="sort-action-toolbar">
                        <button type="button" class="btn-dash-action" onclick="resetCurrentSortLevel()">🔄 Acak Ulang</button>
                        <div class="sort-hint-box">
                            💡 <em>\${gameState.data.hint}</em>
                        </div>
                    </div>
                </div>`;

code = code.replace(oldSortRender, newSortRender);

// Add calculateSortProgress helper if not present
if (!code.includes('function calculateSortProgress')) {
    const helperCode = `    function calculateSortProgress(arr) {
        if (!arr || arr.length <= 1) return 100;
        let inversions = 0;
        const n = arr.length;
        const maxInv = (n * (n - 1)) / 2;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (arr[i] > arr[j]) inversions++;
            }
        }
        return Math.max(0, Math.round(((maxInv - inversions) / maxInv) * 100));
    }
`;
    code = code.replace('function startSortDash(levelIndex) {', helperCode + '\n    function startSortDash(levelIndex) {');
}

// 5. Upgrade handleSortBarClick with animation classes
const oldHandleSortClick = `            if (Math.abs(firstIdx - idx) === 1) {
                const temp = gameState.data.array[firstIdx];
                gameState.data.array[firstIdx] = gameState.data.array[idx];
                gameState.data.array[idx] = temp;

                gameState.data.moves++;
                gameState.data.selectedIndex = null;
                gameSfx.swap();

                renderSortDashStage();
                checkSortStatus();
            } else {`;

const newHandleSortClick = `            if (Math.abs(firstIdx - idx) === 1) {
                const bar1 = document.getElementById(\`bar-item-\${firstIdx}\`);
                const bar2 = document.getElementById(\`bar-item-\${idx}\`);
                if (firstIdx < idx) {
                    if (bar1) bar1.classList.add('bar-swapping-right');
                    if (bar2) bar2.classList.add('bar-swapping-left');
                } else {
                    if (bar1) bar1.classList.add('bar-swapping-left');
                    if (bar2) bar2.classList.add('bar-swapping-right');
                }

                setTimeout(function() {
                    const temp = gameState.data.array[firstIdx];
                    gameState.data.array[firstIdx] = gameState.data.array[idx];
                    gameState.data.array[idx] = temp;

                    gameState.data.moves++;
                    gameState.data.selectedIndex = null;
                    const newProgress = calculateSortProgress(gameState.data.array);
                    gameSfx.swap(newProgress);

                    renderSortDashStage();
                    checkSortStatus();
                }, 180);
            } else {`;

code = code.replace(oldHandleSortClick, newHandleSortClick);

// 6. Upgrade Kitchen Express with plate drops, ticket slide, and floating points
const oldKitchenRender = `                <div class="kitchen-arena">
                    <div class="arena-bloom-tag bloom-c3">C3 • Menerapkan Prinsip LIFO vs FIFO</div>
                    <div class="kitchen-order-ticket" id="kitchen-ticket">
                        <div class="ticket-header">PERINTAH DAPUR RITMIS ⚡</div>
                        <div class="ticket-prompt">\${task.prompt}</div>
                    </div>`;

const newKitchenRender = `                <div class="kitchen-arena">
                    <div class="arena-bloom-tag bloom-c3">C3 • Menerapkan Prinsip LIFO vs FIFO</div>

                    <!-- 👨‍🍳 Chef Mascot Reaction -->
                    <div class="mascot-coach-bubble">
                        <span class="mascot-avatar-bounce">👨‍🍳</span>
                        <div class="mascot-coach-text" id="kitchen-coach-text">
                            <strong>Chef Kilat:</strong> Ingat LIFO (Piring Terakhir di-Push = Pertama di-Pop) &amp; FIFO (Pelanggan Pertama Masuk = Pertama Dilayani)!
                        </div>
                    </div>

                    <div class="kitchen-order-ticket ticket-slide-anim" id="kitchen-ticket">
                        <div class="ticket-header">PERINTAH DAPUR RITMIS ⚡</div>
                        <div class="ticket-prompt">\${task.prompt}</div>
                    </div>`;

code = code.replace(oldKitchenRender, newKitchenRender);

// Upgrade kitchenExecute
const oldKitchenExec = `        if (isCorrect) {
            gameSfx.correct();
            gameState.streak++;
            const points = 120 + (gameState.streak * 25);
            gameState.score += points;

            if (actionType === 'stack_push') {
                gameState.data.stackPlates.push(\`Piring #\${gameState.data.stackPlates.length + 1}\`);
            } else if (actionType === 'stack_pop') {
                if (gameState.data.stackPlates.length > 0) gameState.data.stackPlates.pop();
            } else if (actionType === 'queue_enqueue') {
                gameState.data.queueOrders.push(\`Pesanan Meja \${gameState.data.queueOrders.length + 1}\`);
            } else if (actionType === 'queue_dequeue') {
                if (gameState.data.queueOrders.length > 0) gameState.data.queueOrders.shift();
            }

            generateNextKitchenTask();
            renderKitchenStage();
        }`;

const newKitchenExec = `        if (isCorrect) {
            gameState.streak++;
            const points = 120 + (gameState.streak * 25);
            gameState.score += points;
            gameSfx.correct(gameState.streak);

            const ticketEl = document.getElementById('kitchen-ticket');
            spawnFloatingScore(ticketEl, points, gameState.streak);

            if (actionType === 'stack_push') {
                gameState.data.stackPlates.push(\`Piring #\${gameState.data.stackPlates.length + 1}\`);
            } else if (actionType === 'stack_pop') {
                if (gameState.data.stackPlates.length > 0) gameState.data.stackPlates.pop();
            } else if (actionType === 'queue_enqueue') {
                gameState.data.queueOrders.push(\`Pesanan Meja \${gameState.data.queueOrders.length + 1}\`);
            } else if (actionType === 'queue_dequeue') {
                if (gameState.data.queueOrders.length > 0) gameState.data.queueOrders.shift();
            }

            generateNextKitchenTask();
            renderKitchenStage();
        }`;

code = code.replace(oldKitchenExec, newKitchenExec);

// 7. Upgrade Excel Formula Dash with Live Mini Sheet and Formula Types
const oldExcelDashRender = `                <div class="excel-dash-arena">
                    <div class="arena-bloom-tag bloom-c5">C5 • Mengevaluasi Formula Spreadsheet</div>
                    <div class="excel-case-card">
                        <div class="case-badge">Kasus Pengolahan Data Kantor 📋</div>
                        <h4 class="case-scenario">\${escapeHtml(currentQ.scenario)}</h4>
                        <div class="case-hint">📌 Catatan: \${escapeHtml(currentQ.tableHint)}</div>
                    </div>

                    <div class="excel-formula-grid">
                        \${currentQ.choices.map((ch, idx) => \`
                            <button type="button" class="btn-formula-choice" onclick="answerExcelDash(\${idx})">
                                <span class="choice-tag">\${String.fromCharCode(65 + idx)}</span>
                                <code class="formula-code">\${escapeHtml(ch)}</code>
                            </button>
                        \`).join('')}
                    </div>

                    <div class="excel-feedback-panel" id="excel-feedback-box" style="display: none;"></div>
                </div>`;

const newExcelDashRender = `                <div class="excel-dash-arena">
                    <div class="arena-bloom-tag bloom-c5">C5 • Mengevaluasi Formula Spreadsheet</div>

                    <!-- 📊 Mascot Coach Reaction -->
                    <div class="mascot-coach-bubble">
                        <span class="mascot-avatar-bounce">📊</span>
                        <div class="mascot-coach-text" id="excel-coach-text">
                            <strong>Excel Master:</strong> Perhatikan range sel (misal: C2:C10) dan argumen parameter fungsi yang tepat!
                        </div>
                    </div>

                    <div class="excel-case-card">
                        <div class="case-badge">Kasus Pengolahan Data Kantor 📋</div>
                        <h4 class="case-scenario">\${escapeHtml(currentQ.scenario)}</h4>
                        <div class="case-hint">📌 Catatan: \${escapeHtml(currentQ.tableHint)}</div>
                    </div>

                    <!-- 📋 Live Interactive Formula Bar -->
                    <div class="excel-interactive-sheet">
                        <div class="excel-formula-bar-live">
                            <span class="formula-fx-tag">fx</span>
                            <span id="excel-live-fx">=PILIH_RUMUS_DI_BAWAH()</span>
                        </div>
                        <table class="excel-grid-table">
                            <thead>
                                <tr>
                                    <th>A</th>
                                    <th>B (Nilai 1)</th>
                                    <th>C (Nilai 2)</th>
                                    <th>D (Target Rumus)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Siswa 1</td>
                                    <td>85</td>
                                    <td>90</td>
                                    <td class="excel-target-cell" id="excel-dash-target-cell">[Hasil Formula]</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="excel-formula-grid">
                        \${currentQ.choices.map((ch, idx) => \`
                            <button type="button" class="btn-formula-choice" id="fx-choice-\${idx}" onclick="answerExcelDash(\${idx})">
                                <span class="choice-tag">\${String.fromCharCode(65 + idx)}</span>
                                <code class="formula-code">\${escapeHtml(ch)}</code>
                            </button>
                        \`).join('')}
                    </div>

                    <div class="excel-feedback-panel" id="excel-feedback-box" style="display: none;"></div>
                </div>`;

code = code.replace(oldExcelDashRender, newExcelDashRender);

// Upgrade answerExcelDash
const oldAnswerExcel = `    function answerExcelDash(choiceIdx) {
        if (!gameState.data) return;
        const currentQ = gameState.data.deck[gameState.data.currentIndex];
        const isCorrect = (choiceIdx === currentQ.correct);
        const feedbackEl = document.getElementById('excel-feedback-box');

        if (isCorrect) {
            gameSfx.correct();
            gameState.streak++;
            const pts = 150 + (gameState.streak * 30);
            gameState.score += pts;
        } else {
            gameSfx.wrong();
            gameState.streak = 0;
        }

        if (feedbackEl) {
            feedbackEl.style.display = 'block';
            feedbackEl.className = \`excel-feedback-panel \${isCorrect ? 'fb-correct' : 'fb-wrong'}\`;
            feedbackEl.innerHTML = \`<strong>\${isCorrect ? '✅ FORMULA PRESISI!' : '❌ KURANG TEPAT!'}</strong> \${currentQ.explain}\`;
        }

        setTimeout(() => {
            gameState.data.currentIndex++;
            if (gameState.data.currentIndex >= gameState.data.deck.length) {
                endMiniGame('Excel Formula Dash', 'Hebat! Kamu telah menyelesaikan seluruh tantangan studi kasus formula kantor!');
            } else {
                renderExcelDashStage();
            }
        }, 1200);
    }`;

const newAnswerExcel = `    function answerExcelDash(choiceIdx) {
        if (!gameState.data) return;
        const currentQ = gameState.data.deck[gameState.data.currentIndex];
        const isCorrect = (choiceIdx === currentQ.correct);
        const feedbackEl = document.getElementById('excel-feedback-box');
        const liveFxEl = document.getElementById('excel-live-fx');
        const targetCell = document.getElementById('excel-dash-target-cell');

        if (liveFxEl) liveFxEl.textContent = currentQ.choices[choiceIdx];
        if (targetCell) {
            targetCell.classList.add('cell-calc-flash');
            targetCell.textContent = isCorrect ? '✅ 100%' : '❌ ERR';
        }

        if (isCorrect) {
            gameState.streak++;
            const pts = 150 + (gameState.streak * 30);
            gameState.score += pts;
            gameSfx.correct(gameState.streak);
            spawnFloatingScore(targetCell, pts, gameState.streak);
        } else {
            gameSfx.wrong();
            gameState.streak = 0;
        }

        if (feedbackEl) {
            feedbackEl.style.display = 'block';
            feedbackEl.className = \`excel-feedback-panel \${isCorrect ? 'fb-correct' : 'fb-wrong'}\`;
            feedbackEl.innerHTML = \`<strong>\${isCorrect ? '✅ FORMULA PRESISI!' : '❌ KURANG TEPAT!'}</strong> \${currentQ.explain}\`;
        }

        setTimeout(function() {
            gameState.data.currentIndex++;
            if (gameState.data.currentIndex >= gameState.data.deck.length) {
                endMiniGame('Excel Formula Dash', 'Hebat! Kamu telah menyelesaikan seluruh tantangan studi kasus formula kantor!');
            } else {
                renderExcelDashStage();
            }
        }, 1100);
    }`;

code = code.replace(oldAnswerExcel, newAnswerExcel);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully upgraded js/mini_games.js with juicy animations and sound!');
