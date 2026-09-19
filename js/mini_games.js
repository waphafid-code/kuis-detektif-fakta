/**
 * ============================================================
 * 🎮 QUIZMASTER MINI-GAMES & ICE BREAKING ENGINE
 * ============================================================
 * Arena Game Edukatif & Ice Breaking untuk melatih kecerdasan
 * komputasional siswa Fase E (Kelas X) berbasis Taksonomi Bloom:
 * 
 * Game 1: 🕵️ Detektif Hoax Buster (30s Speedrun) [C4 Menganalisis]
 * Game 2: ⚡ Algoritma Balap: Urutkan Balok Cepat! [C3 & C4 Sorting]
 * Game 3: 🥞 Stack vs Queue Kitchen Express [C3 LIFO vs FIFO]
 * Game 4: 📊 Excel Formula Dash [C3 & C5 Formulasi Data]
 * 
 * Fitur:
 * - 100% Vanilla JS, ultra-lightweight (< 20 KB), zero dependencies
 * - Audio Sintetis Web Audio API (bebas lag, instant offline)
 * - Timer dinamis, combo streak multiplier 🔥, rating bintang ⭐⭐⭐
 * ============================================================
 */

(function () {
    'use strict';

    // 🔊 AUDIO SYNTHESIZER (WEB AUDIO API)
    let audioCtx = null;
    function getAudioContext() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function playTone(freq, type, duration, gainVal) {
        if (type === undefined) type = 'sine';
        if (duration === undefined) duration = 0.15;
        if (gainVal === undefined) gainVal = 0.12;
        try {
            if (window.soundMuted) return;
            const ctx = getAudioContext();
            if (!ctx) return;
            if (ctx.state === 'suspended') {
                ctx.resume();
            }
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime);
            gain.gain.setValueAtTime(gainVal, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio context safely ignored if blocked
        }
    }

    const gameSfx = {
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
        popup.innerHTML = `<span class="score-plus">+${points}</span>${streak > 1 ? ` <span class="score-streak">🔥 x${streak}!</span>` : ''}`;
        parentEl.appendChild(popup);
        setTimeout(function() { popup.remove(); }, 850);
    }

    // 🎯 STATE MINI-GAMES
    const gameState = {
        activeGame: null,
        score: 0,
        streak: 0,
        maxStreak: 0,
        timer: null,
        timeLeft: 0,
        totalTime: 30,
        data: null
    };

    // ============================================================
    // 1. DATASET MINI-GAMES
    // ============================================================

    // DATA HOAX BUSTER (C4 Menganalisis)
    const HOAX_BUSTER_ITEMS = [
        {
            text: '🚨 "LINK DAFTAR BEASISWA KIP KULIAH JALUR GAIB 100% LOLOS TANPA TES! KLIK DI SINI: http://beasiswa-kip-gratis.site"',
            isHoax: true,
            reason: 'Hoaks Phishing! Situs pendaftaran resmi pemerintah selalu berakhiran .go.id, bukan .site.'
        },
        {
            text: '✅ "SNMPTN kini berganti nama menjadi SNBP, pendaftaran resmi dilakukan melalui portal Kemendikbudristek bppp.kemdikbud.go.id"',
            isHoax: false,
            reason: 'Fakta Valid! Menggunakan domain resmi instansi pemerintah (.go.id) dan bahasa informatif.'
        },
        {
            text: '🚨 "INFO MENDADAK: Besok SMA diliburkan 1 bulan karena badai radiasi kosmik matahari yang membakar kulit!"',
            isHoax: true,
            reason: 'Hoaks! Narasi "radiasi kosmik libur 1 bulan" adalah pesan berantai lawas yang tidak terbukti kebenarannya.'
        },
        {
            text: '✅ "Pendaftaran Ekstrakurikuler Wajib Pramuka untuk Kelas X SMAN 4 Padang dibuka melalui formulir Google form resmi dari Wali Kelas."',
            isHoax: false,
            reason: 'Fakta Valid! Sesuai prosedur sekolah dan disalurkan dari sumber terpercaya (Wali Kelas).'
        },
        {
            text: '🚨 "PENTING! Kirim pesan ini ke 20 teman sekelasmu, kalau tidak akun WhatsApp kamu akan diblokir dari grup kelas!"',
            isHoax: true,
            reason: 'Hoaks! WhatsApp tidak pernah mensyaratkan forward pesan berantai (spam) untuk menjaga akun.'
        },
        {
            text: '🚨 "Silakan Install Aplikasi Undangan-Grup-Angkatan.apk ini untuk masuk ke grup angkatan baru kita ya!"',
            isHoax: true,
            reason: 'Hoaks & Berbahaya! File berakhiran .apk dari pihak tak dikenal adalah modus peretasan ponsel (Malware).'
        },
        {
            text: '✅ "Ujian Akhir Semester (UAS) Kelas X akan dilaksanakan secara daring menggunakan platform e-Learning ujian sekolah."',
            isHoax: false,
            reason: 'Fakta Valid! Pemberitahuan resmi dan logis tentang kebijakan asesmen akademik sekolah.'
        },
        {
            text: '🚨 "Pengumuman: Seluruh siswa kelas X wajib mentransfer uang kas Rp50.000 ke rekening BNI pribadi atas nama Agus (Kakak Kelas) sebelum jam 12!"',
            isHoax: true,
            reason: 'Hoaks Penipuan! Pungutan liar mendadak ke rekening pribadi adalah modus penipuan.'
        }
    ];

    // DATA SORTING DASH (C3 Menerapkan & C4 Menganalisis)
    const SORTING_LEVELS = [
        {
            id: 1,
            title: 'Level 1: Menyortir Nomor Absen',
            array: [35, 12, 28, 20],
            minMoves: 3,
            hint: 'Bandingkan dua kertas ujian. Geser kertas dengan nomor absen lebih besar ke posisi paling kanan.'
        },
        {
            id: 2,
            title: 'Level 2: Mengurutkan Nilai Ulangan',
            array: [95, 78, 65, 88, 72],
            minMoves: 5,
            hint: 'Dorong nilai ulangan tertinggi (95) ke posisi paling kanan terlebih dahulu!'
        },
        {
            id: 3,
            title: 'Level 3: Antrean Pendaftaran OSIS',
            array: [64, 25, 12, 88, 33, 5],
            minMoves: 8,
            hint: 'Fokus pada nomor antrean terkecil (5) dan terbesar (88). Urutkan langkah demi langkah.'
        }
    ];

    // DATA EXCEL DASH (C3 Menerapkan & C5 Mengevaluasi)
    const EXCEL_DASH_QUESTIONS = [
        {
            scenario: 'Sebagai Sekretaris Kelas, kamu menghitung TOTAL seluruh uang kas dari sel C2 sampai C10:',
            tableHint: 'Sel C2:C10 berisi deretan angka nominal setoran kas.',
            choices: [
                '=SUM(C2:C10)',
                '=AVERAGE(C2:C10)',
                '=COUNT(C2:C10)',
                '=TOTAL(C2..C10)'
            ],
            correct: 0,
            explain: '=SUM() digunakan untuk menjumlahkan sekumpulan angka dalam suatu range sel.'
        },
        {
            scenario: 'Guru memintamu mencari status KELULUSAN siswa. Jika nilai di sel B2 >= 75 adalah "LULUS", jika tidak "REMEDIAL":',
            tableHint: 'Batas KKM Ulangan Harian adalah 75.',
            choices: [
                '=IF(B2>=75; "LULUS"; "REMEDIAL")',
                '=CHECK(B2>=75; LULUS; REMEDIAL)',
                '=IF(B2=75; "LULUS")',
                '=SUMIF(B2>=75; "LULUS")'
            ],
            correct: 0,
            explain: 'Fungsi logika percabangan =IF(tes_logika; nilai_jika_benar; nilai_jika_salah).'
        },
        {
            scenario: 'Mencari RATA-RATA nilai Raport siswa kelas X-E2 dari sel D2 sampai D30:',
            tableHint: 'Terdapat 29 data nilai siswa di dalam kelas tersebut.',
            choices: [
                '=AVERAGE(D2:D30)',
                '=MEAN(D2:D30)',
                '=RATARATA(D2:D30)',
                '=SUM(D2:D30)/MAX'
            ],
            correct: 0,
            explain: '=AVERAGE() menghitung nilai mean aritmatika (rata-rata) dari rentang sel numerik.'
        },
        {
            scenario: 'Mencari siswa dengan NILAI TERTINGGI untuk diberi penghargaan dari sel B2 sampai B35:',
            tableHint: 'Mencari skor puncak dari 34 siswa dalam satu kelas.',
            choices: [
                '=MAX(B2:B35)',
                '=TOP(B2:B35)',
                '=HIGH(B2:B35)',
                '=LARGE(B2:B35)'
            ],
            correct: 0,
            explain: '=MAX() mengambil nilai numerik paling besar di dalam rentang sel yang dipilih.'
        }
    ];

    // ============================================================
    // 2. HUB & NAVIGATION RENDERER
    // ============================================================

        // ============================================================
    // DATA ROBOCODE: ALGORITMA RUNNER & PSEUDOCODE (C4 & C3)
    // ============================================================
    const ROBOCODE_LEVELS = [
        {
            id: 1,
            title: "Level 1: Robot OSIS Perekap Eskul",
            scenario: "RoboCode (Robot OSIS) diminta menghitung akumulasi siswa yang mendaftar Eskul Basket dari Kelas Genap (X-2, X-4, X-6).",
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
            title: "Level 2: Denda Keterlambatan Sekolah",
            scenario: "Seorang siswa terlambat 15 menit. Berapakah poin pelanggaran yang dikenakan?",
            codeLines: [
                { num: 1, text: "telat ← 15", comment: "Input jumlah menit terlambat" },
                { num: 2, text: "IF telat >= 30 THEN", comment: "Uji denda berat (>30 menit)" },
                { num: 3, text: "    poin ← 20", comment: "Dilewati (15 < 30)" },
                { num: 4, text: "ELSE IF telat >= 10 THEN", comment: "Uji denda sedang (TRUE!)" },
                { num: 5, text: "    poin ← 10", comment: "Denda 10 poin aktif" },
                { num: 6, text: "ELSE", comment: "Tanpa denda poin" },
                { num: 7, text: "    poin ← 0", comment: "Dilewati" },
                { num: 8, text: "ENDIF", comment: "Selesai percabangan" },
                { num: 9, text: "OUTPUT poin", comment: "Cetak hasil" }
            ],
            traceSteps: [
                { line: 1, vars: { telat: 15, poin: 0 }, note: "Siswa telat 15 menit" },
                { line: 2, vars: { telat: 15, poin: 0 }, note: "15 >= 30? FALSE" },
                { line: 4, vars: { telat: 15, poin: 0 }, note: "15 >= 10? TRUE!" },
                { line: 5, vars: { telat: 15, poin: 10 }, note: "poin pelanggaran diset 10" },
                { line: 9, vars: { telat: 15, poin: 10 }, note: "Output = 10 poin" }
            ],
            targetQuestion: "Berapakah poin pelanggaran yang dicetak (OUTPUT) pada baris 9?",
            choices: [
                "poin = 10 (karena telat 15 menit >= 10 menit)",
                "poin = 20",
                "poin = 0 (dimaafkan)",
                "poin = 30"
            ],
            correct: 0,
            explanation: "Tepat! Karena siswa terlambat 15 menit, ia lolos dari syarat pertama (>=30) namun terjaring di syarat kedua (>=10). Jadi poin pelanggarannya adalah 10."
        },
        {
            id: 3,
            title: "Level 3: Pelacak Loker Siswa (Binary Search)",
            scenario: "Sekolah memiliki deretan loker bernomor terurut (1 sampai 9). Cari posisi loker milik Budi (target=75).",
            codeLines: [
                { num: 1, text: "low ← 1; high ← 9; target ← 75", comment: "Batas deretan loker awal" },
                { num: 2, text: "mid ← FLOOR((low + high) / 2)", comment: "Periksa loker tengah: (1+9)/2 = 5" },
                { num: 3, text: "IF target > loker[mid] THEN", comment: "Loker Budi 75 > Loker 5 (Isi:50)" },
                { num: 4, text: "    low ← mid + 1", comment: "Cari di separuh kanan deretan" },
                { num: 5, text: "ENDIF", comment: "Selesai evaluasi" },
                { num: 6, text: "OUTPUT low", comment: "Batas awal pencarian baru" }
            ],
            traceSteps: [
                { line: 1, vars: { low: 1, high: 9, mid: "-" }, note: "low=1, high=9" },
                { line: 2, vars: { low: 1, high: 9, mid: 5 }, note: "mid = FLOOR(10/2) = 5" },
                { line: 3, vars: { low: 1, high: 9, mid: 5 }, note: "target > loker[5]? TRUE" },
                { line: 4, vars: { low: 6, high: 9, mid: 5 }, note: "low = 5 + 1 = 6" },
                { line: 6, vars: { low: 6, high: 9, mid: 5 }, note: "Output low = 6" }
            ],
            targetQuestion: "Setelah baris ke-4 dieksekusi, berapakah nilai baru dari batas pencarian 'low'?",
            choices: [
                "low = 6 (karena mid + 1 = 5 + 1)",
                "low = 5",
                "low = 1",
                "low = 10"
            ],
            correct: 0,
            explanation: "Luar biasa! Karena nomor loker Budi lebih besar dari loker tengah (mid=5), maka sisa loker di sebelah kiri diabaikan, dan batas pencarian dipindahkan ke kanan (mid + 1 = 6)."
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
    ];

function openMiniGamesHub() {
        if (typeof switchScreen === 'function') {
            switchScreen('games');
        }
        renderGameSelectScreen();
    }
    window.openMiniGamesHub = openMiniGamesHub;

    
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

        container.innerHTML = `
            <div class="game-play-area">
                <div class="game-hud">
                    <button type="button" class="btn-back-lobby" onclick="renderGameSelectScreen()">← Keluar ke Arena</button>
                    <div class="game-hud-stats">
                        <div class="hud-item"><span class="hud-label">LEVEL:</span> <strong>${data.levelIdx + 1}/${BINARY_SEARCH_LEVELS.length}</strong></div>
                        <div class="hud-item"><span class="hud-label">SKOR:</span> <strong id="hud-score">${gameState.score}</strong></div>
                        <div class="hud-item streak-fire"><span class="hud-label">STREAK:</span> <strong id="hud-streak">🔥 ${gameState.streak}</strong></div>
                        <div class="hud-item"><span class="hud-label">LANGKAH:</span> <strong>${data.steps}</strong> / maks ${level.optimalSteps}</div>
                    </div>
                </div>

                <div class="binary-search-arena" style="max-width: 900px; margin: 0 auto; padding: 20px 10px;">
                    <div class="arena-bloom-tag bloom-c4">C4 • Menganalisis Algoritma Pencarian Biner O(log N)</div>
                    <h3 class="game-stage-title" style="margin: 10px 0 4px 0; text-align: center;">${level.title}</h3>
                    
                    <!-- Target ID Banner -->
                    <div class="binary-target-banner">
                        <div>
                            <span class="binary-target-label">TARGET BERKAS RAHASIA:</span>
                            <strong class="binary-target-val">📁 ID: ${data.targetVal}</strong>
                        </div>
                        <div class="binary-range-text">
                            Rentang Aktif: <strong style="color: #38bdf8;">[${data.low} ... ${data.high}]</strong> (${data.high - data.low + 1} Berkas Tersisa)
                        </div>
                    </div>

                    <!-- 🔍 Mascot Coach Reaction -->
                    <div class="mascot-coach-bubble" style="margin-bottom: 16px;">
                        <span class="mascot-avatar-bounce" id="binary-avatar">🔍</span>
                        <div class="mascot-coach-text" id="binary-coach-text">
                            ${data.feedbackMsg ? data.feedbackMsg : `<strong>Detektif Arsip:</strong> "${level.hint}"`}
                        </div>
                    </div>

                    <!-- Rak Arsip Interaktif -->
                    <div class="binary-files-rack" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(78px, 1fr)); gap: 10px; margin: 20px 0;">
                        ${data.files.map((val, idx) => {
                            const isEliminated = (idx < data.low || idx > data.high);
                            const isMid = (!isEliminated && idx === mid);
                            const isTarget = (val === data.targetVal && data.isAnswered);

                            return `
                                <button type="button" 
                                        class="binary-file-card ${isMid ? 'file-midpoint' : ''} ${isEliminated ? 'file-eliminated' : ''} ${isTarget ? 'file-target' : ''}"
                                        id="file-folder-${idx}"
                                        onclick="guessBinarySearch(${idx})"
                                        ${isEliminated || data.isAnswered ? 'disabled' : ''}
                                        style="opacity: ${isEliminated ? '0.35' : '1'}; cursor: ${isEliminated ? 'not-allowed' : 'pointer'};">
                                    <span class="binary-folder-icon">${isTarget ? '🎉' : (isEliminated ? '🔒' : '📁')}</span>
                                    <strong class="binary-folder-num">${val}</strong>
                                    <span class="binary-folder-tag">${isMid ? '[MID 🎯]' : `[${idx}]`}</span>
                                </button>
                            `;
                        }).join('')}
                    </div>

                    <div class="binary-instructions-bar">
                        💡 <strong>Cara Bermain:</strong> Klik folder bertanda <strong style="color:#38bdf8;">[MID 🎯]</strong> untuk membandingkan. Sistem akan membuang separuh data secara instan!
                    </div>
                </div>
            </div>
        `;
    }

    function guessBinarySearch(idx) {
        if (!gameState.data || gameState.data.isAnswered) return;
        const data = gameState.data;
        const level = data.currentLevel;
        const clickedVal = data.files[idx];

        data.steps++;
        const targetCell = document.getElementById(`file-folder-${idx}`);

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

            data.feedbackMsg = `<strong>Detektif Arsip:</strong> "🏆 BINGO! Berkas rahasia ID: ${data.targetVal} berhasil ditemukan dalam ${data.steps} langkah! Efisiensi O(log N) terbukti!"`;
            renderBinarySearchStage();

            setTimeout(function() {
                if (data.levelIdx < BINARY_SEARCH_LEVELS.length - 1) {
                    startBinarySearch(data.levelIdx + 1);
                } else {
                    endMiniGame('Binary Search: Detektif Arsip', `🏆 LUAR BIASA! Kamu menuntaskan semua berkas investigasi dengan algoritma Pencarian Biner tercepat!\nTotal Langkah: ${data.steps}`);
                }
            }, 1400);
        } else if (clickedVal < data.targetVal) {
            gameSfx.swap(50);
            data.low = idx + 1;
            data.feedbackMsg = `<strong>Detektif Arsip:</strong> "ID ${clickedVal} LEBIH KECIL dari ${data.targetVal}! Semua berkas ID &le; ${clickedVal} berhasil DIELIMINASI!"`;
            renderBinarySearchStage();
        } else {
            gameSfx.swap(50);
            data.high = idx - 1;
            data.feedbackMsg = `<strong>Detektif Arsip:</strong> "ID ${clickedVal} LEBIH BESAR dari ${data.targetVal}! Semua berkas ID &ge; ${clickedVal} berhasil DIELIMINASI!"`;
            renderBinarySearchStage();
        }
    }
    window.guessBinarySearch = guessBinarySearch;

    function renderGameSelectScreen() {
        stopGameTimer();
        gameState.activeGame = null;

        const container = document.getElementById('games-stage-container');
        if (!container) return;

        container.innerHTML = `
            <div class="game-lobby-wrapper">
                <div class="game-lobby-header">
                    <div style="text-align: left; margin-bottom: 16px;">
                        <button type="button" class="btn-learn-back" onclick="switchScreen('home')">
                            <span>←</span>
                            <span>Kembali ke Beranda</span>
                        </button>
                    </div>
                    <div class="lobby-badge">🎮 ARENA ICE BREAKING &amp; GAMIFIKASI</div>
                    <h2 class="lobby-title">Asah Otak Komputasional &amp; Uji Refleks Cepat</h2>
                    <p class="lobby-subtitle">
                        Pilih tantangan mini-game untuk menyegarkan pikiran, menguji insting logika, 
                        dan memperkuat pemahaman konsep Informatika Fase E berdasarkan <strong>Taksonomi Bloom</strong>!
                    </p>
                </div>

                                <div class="games-selection-grid">
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
                </div>
            </div>
        `;
    }
    window.renderGameSelectScreen = renderGameSelectScreen;

    function launchMiniGame(gameId) {
        if (typeof switchScreen === 'function') {
            switchScreen('games');
        }
        if (typeof sfxClick === 'function') sfxClick();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        gameState.activeGame = gameId;
        gameState.score = 0;
        gameState.streak = 0;
        gameState.maxStreak = 0;

        switch (gameId) {
            case 'hoax_buster':
                startHoaxBuster();
                break;
            case 'sort_dash':
                startSortDash(0);
                break;
            case 'kitchen_express':
                startKitchenExpress();
                break;
            case 'excel_dash':
                startExcelDash();
                break;
            case 'robocode_runner':
                startRoboCodeRunner(0);
                break;
            case 'binary_search':
                startBinarySearch(0);
                break;
            default:
                renderGameSelectScreen();
        }
    }
    window.launchMiniGame = launchMiniGame;

    function stopGameTimer() {
        if (gameState.timer) {
            clearInterval(gameState.timer);
            gameState.timer = null;
        }
        if (gameState.data && gameState.data.execTimer) {
            clearTimeout(gameState.data.execTimer);
            gameState.data.execTimer = null;
        }
    }

    // ============================================================
    // 3. GAME 1: DETEKTIF HOAX BUSTER (30S SPEEDRUN)
    // ============================================================
    function startHoaxBuster() {
        const container = document.getElementById('games-stage-container');
        if (!container) return;

        const deck = [...HOAX_BUSTER_ITEMS].sort(() => Math.random() - 0.5);
        gameState.data = {
            deck: deck,
            currentIndex: 0,
            correctCount: 0
        };
        const duration = getMiniGamesDuration(30);
        gameState.timeLeft = duration;
        gameState.totalTime = duration;

        renderHoaxBusterStage();
        startTimerBar(duration, onHoaxBusterTimeUp);
    }

    function renderHoaxBusterStage() {
        const container = document.getElementById('games-stage-container');
        const currentItem = gameState.data.deck[gameState.data.currentIndex];

        container.innerHTML = `
            <div class="game-play-area">
                <div class="game-hud">
                    <button type="button" class="btn-back-lobby" onclick="renderGameSelectScreen()">← Keluar ke Arena</button>
                    <div class="game-hud-stats">
                        <div class="hud-item"><span class="hud-label">SKOR:</span> <strong id="hud-score">${gameState.score}</strong></div>
                        <div class="hud-item streak-fire"><span class="hud-label">STREAK:</span> <strong id="hud-streak">🔥 ${gameState.streak}</strong></div>
                        <div class="hud-item"><span class="hud-label">WAKTU:</span> <strong id="hud-timer">${gameState.timeLeft}s</strong></div>
                    </div>
                </div>

                <div class="game-timer-track">
                    <div class="game-timer-fill" id="game-timer-fill" style="width: ${(gameState.timeLeft / gameState.totalTime) * 100}%"></div>
                </div>

                <div class="hoax-buster-arena">
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
                            ${escapeHtml(currentItem.text)}
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
                </div>
            </div>
        `;
    }

    function answerHoaxBuster(studentSaysHoax) {
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
            stamp.className = `hoax-stamp ${studentSaysHoax ? 'stamp-hoax' : 'stamp-fakta'}`;
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
            reasonEl.className = `hoax-instant-reason ${isCorrect ? 'reason-correct' : 'reason-wrong'}`;
            reasonEl.innerHTML = `<strong>${isCorrect ? '🎯 TEPAT!' : '⚠️ KURANG TEPAT!'}</strong> ${currentItem.reason}`;
        }

        const scoreEl = document.getElementById('hud-score');
        const streakEl = document.getElementById('hud-streak');
        if (scoreEl) scoreEl.textContent = gameState.score;
        if (streakEl) streakEl.textContent = `🔥 ${gameState.streak}`;

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
    }
    window.answerHoaxBuster = answerHoaxBuster;

    function onHoaxBusterTimeUp() {
        endMiniGame('Detektif Hoax Buster', 'Waktu 30 detik telah habis! Mari kita lihat kecermatan analisismu.');
    }

    // ============================================================
    // 4. GAME 2: ALGORITMA BALAP (SORTING DASH)
    // ============================================================
        function calculateSortProgress(arr) {
        if (!arr || arr.length <= 1) return 100;
        let inversions = 0;
        const n = arr.length;
        const maxInv = (n * (n - 1)) / 2;
        if (maxInv <= 0) return 100;
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (arr[i] > arr[j]) inversions++;
            }
        }
        return Math.max(0, Math.round(((maxInv - inversions) / maxInv) * 100));
    }

    function startSortDash(levelIndex) {
        if (levelIndex === undefined) levelIndex = 0;
        stopGameTimer();
        const level = SORTING_LEVELS[levelIndex] || SORTING_LEVELS[0];
        gameState.data = {
            levelIndex: levelIndex,
            levelTitle: level.title,
            array: [...level.array],
            targetSorted: [...level.array].sort((a, b) => a - b),
            moves: 0,
            minMoves: level.minMoves,
            hint: level.hint,
            startTime: Date.now(),
            selectedIndex: null
        };

        renderSortDashStage();
    }
    window.startSortDash = startSortDash;

    function renderSortDashStage() {
        const container = document.getElementById('games-stage-container');
        if (!container) return;

        const maxVal = Math.max(...gameState.data.array);

        container.innerHTML = `
            <div class="game-play-area">
                <div class="game-hud">
                    <button type="button" class="btn-back-lobby" onclick="renderGameSelectScreen()">← Keluar ke Arena</button>
                    <div class="game-hud-stats">
                        <div class="hud-item"><span class="hud-label">LEVEL:</span> <strong>${gameState.data.levelIndex + 1}/3</strong></div>
                        <div class="hud-item"><span class="hud-label">LANGKAH TUKAR:</span> <strong id="hud-moves">${gameState.data.moves}</strong> (Target: ≤${gameState.data.minMoves})</div>
                    </div>
                </div>

                <div class="sorting-dash-arena">
                    <div class="arena-bloom-tag bloom-c3">C3 • Menerapkan Logika Bubble Sort</div>
                    <h3 class="game-stage-title" style="margin: 6px 0 2px 0;">${gameState.data.levelTitle}</h3>
                    
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
                            <div class="sort-progress-fill" id="sort-progress-fill" style="width: ${calculateSortProgress(gameState.data.array)}%"></div>
                        </div>
                        <span class="sort-progress-pct" id="sort-progress-pct">${calculateSortProgress(gameState.data.array)}%</span>
                    </div>

                    <div class="sort-interactive-board" id="sort-bars-board">
                        ${gameState.data.array.map((val, idx) => {
                            const heightPct = Math.round((val / maxVal) * 160) + 40;
                            const isSelected = gameState.data.selectedIndex === idx;
                            return `
                                <div class="sort-dash-bar ${isSelected ? 'bar-selected' : ''}" 
                                     id="bar-item-${idx}" 
                                     style="height: ${heightPct}px;"
                                     onclick="handleSortBarClick(${idx})">
                                    <div class="bar-val-badge">${val}</div>
                                    <div class="bar-index-label">[${idx}]</div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div class="sort-action-toolbar">
                        <button type="button" class="btn-dash-action" onclick="resetCurrentSortLevel()">🔄 Acak Ulang</button>
                        <div class="sort-hint-box">
                            💡 <em>${gameState.data.hint}</em>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function handleSortBarClick(idx) {
        if (!gameState.data) return;

        if (gameState.data.selectedIndex === null) {
            gameState.data.selectedIndex = idx;
            gameSfx.pop();
            renderSortDashStage();
        } else {
            const firstIdx = gameState.data.selectedIndex;
            if (firstIdx === idx) {
                gameState.data.selectedIndex = null;
                renderSortDashStage();
                return;
            }

            if (Math.abs(firstIdx - idx) === 1) {
                const bar1 = document.getElementById(`bar-item-${firstIdx}`);
                const bar2 = document.getElementById(`bar-item-${idx}`);
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
            } else {
                gameSfx.wrong();
                alert("💡 Dalam aturan Bubble Sort, kamu hanya boleh menukar dua balok yang BERDAMPINGAN/BERSEBELAHAN!");
                gameState.data.selectedIndex = null;
                renderSortDashStage();
            }
        }
    }
    window.handleSortBarClick = handleSortBarClick;

    function resetCurrentSortLevel() {
        if (!gameState.data) return;
        startSortDash(gameState.data.levelIndex);
    }
    window.resetCurrentSortLevel = resetCurrentSortLevel;

    function checkSortStatus() {
        const isSorted = gameState.data.array.every((val, i, arr) => !i || arr[i - 1] <= val);
        if (isSorted) {
            gameSfx.win();
            const stars = gameState.data.moves <= gameState.data.minMoves ? 3 : (gameState.data.moves <= gameState.data.minMoves + 2 ? 2 : 1);
            const starsEmoji = '⭐'.repeat(stars);

            setTimeout(() => {
                if (typeof confetti === 'function') confetti({ particleCount: 80, spread: 70 });

                if (gameState.data.levelIndex < SORTING_LEVELS.length - 1) {
                    startSortDash(gameState.data.levelIndex + 1);
                    if (typeof showToast === 'function') {
                        showToast(`Level Selesai dalam ${gameState.data.moves} langkah! ${starsEmoji}`, '🎉');
                    }
                } else {
                    endMiniGame('Algoritma Balap: Sorting Dash', `🏆 LUAR BIASA! Kamu menuntaskan semua level dengan efisiensi logika algoritma tinggi!\nTotal Langkah Terakhir: ${gameState.data.moves}`);
                }
            }, 300);
        }
    }

    // ============================================================
    // 5. GAME 3: STACK VS QUEUE KITCHEN EXPRESS
    // ============================================================
    function startKitchenExpress() {
        stopGameTimer();
        gameState.score = 0;
        gameState.streak = 0;
        const duration = getMiniGamesDuration(40);
        gameState.timeLeft = duration;
        gameState.totalTime = duration;

        gameState.data = {
            stackPlates: ['Piring Biru', 'Piring Kuning', 'Piring Hijau'],
            queueOrders: ['Pesanan Meja 1', 'Pesanan Meja 2'],
            currentTask: null
        };

        generateNextKitchenTask();
        renderKitchenStage();
        startTimerBar(duration, onKitchenTimeUp);
    }

    function generateNextKitchenTask() {
        if (!gameState.data) return;
        const tasks = [
            {
                type: 'stack_push',
                prompt: '📥 Koki selesai mencuci piring! TARUH di atas tumpukan (STACK: PUSH)'
            },
            {
                type: 'stack_pop',
                prompt: '🍽️ Pelayan butuh piring untuk makanan! AMBIL piring paling atas (STACK: POP)'
            },
            {
                type: 'queue_enqueue',
                prompt: '🎟️ Pelanggan baru datang memesan! MASUKKAN ke ujung antrean (QUEUE: ENQUEUE)'
            },
            {
                type: 'queue_dequeue',
                prompt: '🧑‍🍳 Pesanan siap diantar! LAYANI pelanggan paling depan (QUEUE: DEQUEUE)'
            }
        ];
        gameState.data.currentTask = tasks[Math.floor(Math.random() * tasks.length)];
    }

    function renderKitchenStage() {
        const container = document.getElementById('games-stage-container');
        if (!container) return;

        const task = gameState.data.currentTask;

        container.innerHTML = `
            <div class="game-play-area">
                <div class="game-hud">
                    <button type="button" class="btn-back-lobby" onclick="renderGameSelectScreen()">← Keluar ke Arena</button>
                    <div class="game-hud-stats">
                        <div class="hud-item"><span class="hud-label">SKOR:</span> <strong id="hud-score">${gameState.score}</strong></div>
                        <div class="hud-item streak-fire"><span class="hud-label">STREAK:</span> <strong id="hud-streak">🔥 ${gameState.streak}</strong></div>
                        <div class="hud-item"><span class="hud-label">WAKTU:</span> <strong id="hud-timer">${gameState.timeLeft}s</strong></div>
                    </div>
                </div>

                <div class="game-timer-track">
                    <div class="game-timer-fill" id="game-timer-fill" style="width: ${(gameState.timeLeft / gameState.totalTime) * 100}%"></div>
                </div>

                <div class="kitchen-arena">
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
                        <div class="ticket-prompt">${task.prompt}</div>
                    </div>

                    <div class="kitchen-tables-grid">
                        <!-- SISI STACK -->
                        <div class="kitchen-col stack-col">
                            <h4 style="color: #c084fc;">🥞 Rak Piring (STACK / LIFO)</h4>
                            <div class="kitchen-stack-rack" id="kitchen-stack-view">
                                ${gameState.data.stackPlates.length === 0 ? '<div class="empty-rack-note">Rak Piring Kosong</div>' : ''}
                                ${[...gameState.data.stackPlates].reverse().map((plate, i) => `
                                    <div class="kitchen-plate-item ${i === 0 ? 'plate-top' : ''}">${plate} ${i === 0 ? '⬅️ [PUNCAK]' : ''}</div>
                                `).join('')}
                            </div>
                            <div class="kitchen-btn-row">
                                <button type="button" class="btn-kitchen-action" onclick="kitchenExecute('stack_push')">➕ PUSH (Taruh Atas)</button>
                                <button type="button" class="btn-kitchen-action btn-danger-action" onclick="kitchenExecute('stack_pop')">➖ POP (Ambil Atas)</button>
                            </div>
                        </div>

                        <!-- SISI QUEUE -->
                        <div class="kitchen-col queue-col">
                            <h4 style="color: #38bdf8;">🎟️ Loket Pesanan (QUEUE / FIFO)</h4>
                            <div class="kitchen-queue-lane" id="kitchen-queue-view">
                                ${gameState.data.queueOrders.length === 0 ? '<div class="empty-rack-note">Tidak Ada Antrean</div>' : ''}
                                ${gameState.data.queueOrders.map((ord, i) => `
                                    <div class="kitchen-queue-token ${i === 0 ? 'token-head' : ''}">${ord} ${i === 0 ? '⬅️ [DEPAN]' : ''}</div>
                                `).join('')}
                            </div>
                            <div class="kitchen-btn-row">
                                <button type="button" class="btn-kitchen-action" onclick="kitchenExecute('queue_enqueue')">➕ ENQUEUE (Antre Belakang)</button>
                                <button type="button" class="btn-kitchen-action btn-success-action" onclick="kitchenExecute('queue_dequeue')">✔️ DEQUEUE (Layani Depan)</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function kitchenExecute(actionType) {
        if (!gameState.data) return;
        const target = gameState.data.currentTask.type;
        const isCorrect = (actionType === target);

        if (isCorrect) {
            gameState.streak++;
            const points = 120 + (gameState.streak * 25);
            gameState.score += points;
            gameSfx.correct(gameState.streak);

            const ticketEl = document.getElementById('kitchen-ticket');
            spawnFloatingScore(ticketEl, points, gameState.streak);

            if (actionType === 'stack_push') {
                gameState.data.stackPlates.push(`Piring #${gameState.data.stackPlates.length + 1}`);
            } else if (actionType === 'stack_pop') {
                if (gameState.data.stackPlates.length > 0) gameState.data.stackPlates.pop();
            } else if (actionType === 'queue_enqueue') {
                gameState.data.queueOrders.push(`Pesanan Meja ${gameState.data.queueOrders.length + 1}`);
            } else if (actionType === 'queue_dequeue') {
                if (gameState.data.queueOrders.length > 0) gameState.data.queueOrders.shift();
            }

            generateNextKitchenTask();
            renderKitchenStage();
        } else {
            gameSfx.wrong();
            gameState.streak = 0;
            const ticket = document.getElementById('kitchen-ticket');
            if (ticket) {
                ticket.classList.add('ticket-error');
                setTimeout(() => ticket.classList.remove('ticket-error'), 350);
            }
            const streakEl = document.getElementById('hud-streak');
            if (streakEl) streakEl.textContent = `🔥 0`;
        }
    }
    window.kitchenExecute = kitchenExecute;

    function onKitchenTimeUp() {
        endMiniGame('Stack vs Queue Kitchen', 'Waktu ritmis dapur 40 detik selesai! Pemahaman LIFO dan FIFO kamu sangat teruji di sini.');
    }

    // ============================================================
    // 6. GAME 4: EXCEL FORMULA DASH
    // ============================================================
    function startExcelDash() {
        stopGameTimer();
        const deck = [...EXCEL_DASH_QUESTIONS].sort(() => Math.random() - 0.5);
        gameState.score = 0;
        gameState.streak = 0;
        const duration = getMiniGamesDuration(45);
        gameState.timeLeft = duration;
        gameState.totalTime = duration;
        gameState.data = {
            deck: deck,
            currentIndex: 0
        };

        renderExcelDashStage();
        startTimerBar(duration, () => {
            endMiniGame('Excel Formula Dash', `Waktu tantangan Excel Formula Dash selesai! Skor akhir: ${gameState.score}`);
        });
    }

    function renderExcelDashStage() {
        const container = document.getElementById('games-stage-container');
        if (!container) return;

        const currentQ = gameState.data.deck[gameState.data.currentIndex];

        container.innerHTML = `
            <div class="game-play-area">
                <div class="game-hud">
                    <button type="button" class="btn-back-lobby" onclick="renderGameSelectScreen()">← Keluar ke Arena</button>
                    <div class="game-hud-stats">
                        <div class="hud-item"><span class="hud-label">SOAL:</span> <strong>${gameState.data.currentIndex + 1}/${gameState.data.deck.length}</strong></div>
                        <div class="hud-item"><span class="hud-label">SKOR:</span> <strong id="hud-score">${gameState.score}</strong></div>
                        <div class="hud-item streak-fire"><span class="hud-label">STREAK:</span> <strong id="hud-streak">🔥 ${gameState.streak}</strong></div>
                        <div class="hud-item"><span class="hud-label">WAKTU:</span> <strong id="hud-timer">${gameState.totalTime > 0 && gameState.totalTime !== 999 ? gameState.timeLeft + 's' : '♾️ Bebas'}</strong></div>
                    </div>
                </div>

                <div class="game-timer-track">
                    <div class="game-timer-fill" id="game-timer-fill" style="width: ${gameState.totalTime === 999 ? 100 : ((gameState.timeLeft / gameState.totalTime) * 100)}%"></div>
                </div>

                <div class="excel-dash-arena">
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
                        <h4 class="case-scenario">${escapeHtml(currentQ.scenario)}</h4>
                        <div class="case-hint">📌 Catatan: ${escapeHtml(currentQ.tableHint)}</div>
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
                        ${currentQ.choices.map((ch, idx) => `
                            <button type="button" class="btn-formula-choice" id="fx-choice-${idx}" onclick="answerExcelDash(${idx})">
                                <span class="choice-tag">${String.fromCharCode(65 + idx)}</span>
                                <code class="formula-code">${escapeHtml(ch)}</code>
                            </button>
                        `).join('')}
                    </div>

                    <div class="excel-feedback-panel" id="excel-feedback-box" style="display: none;"></div>
                </div>
            </div>
        `;
    }

    function answerExcelDash(choiceIdx) {
        if (!gameState.data || gameState.data.isAnswered) return;
        gameState.data.isAnswered = true;
        document.querySelectorAll('.btn-formula-choice').forEach(b => b.disabled = true);
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
            feedbackEl.className = `excel-feedback-panel ${isCorrect ? 'fb-correct' : 'fb-wrong'}`;
            feedbackEl.innerHTML = `<strong>${isCorrect ? '✅ FORMULA PRESISI!' : '❌ KURANG TEPAT!'}</strong> ${currentQ.explain}`;
        }

        setTimeout(function() {
            gameState.data.currentIndex++;
            if (gameState.data.currentIndex >= gameState.data.deck.length) {
                endMiniGame('Excel Formula Dash', 'Hebat! Kamu telah menyelesaikan seluruh tantangan studi kasus formula kantor!');
            } else {
                renderExcelDashStage();
            }
        }, 1100);
    }
    window.answerExcelDash = answerExcelDash;

    // ============================================================
    // 7. TIMER & GAME OVER MODAL
    // ============================================================
    function getMiniGamesDuration(defaultSec = 30) {
        if (typeof window.loadMiniGamesTimerSetting === 'function') {
            const val = window.loadMiniGamesTimerSetting();
            if (val !== null && !isNaN(val)) return val;
        }
        const saved = localStorage.getItem('detektif_fakta_minigames_timer');
        if (saved !== null) {
            const parsed = parseInt(saved, 10);
            if (!isNaN(parsed)) return parsed;
        }
        return defaultSec;
    }

    function startTimerBar(seconds, onComplete) {
        stopGameTimer();
        if (seconds <= 0) {
            // Mode Bebas Tanpa Batas Waktu
            gameState.timeLeft = 999;
            gameState.totalTime = 999;
            const timerEl = document.getElementById('hud-timer');
            const fillEl = document.getElementById('game-timer-fill');
            if (timerEl) timerEl.textContent = '♾️ Bebas';
            if (fillEl) fillEl.style.width = '100%';
            return;
        }

        gameState.timeLeft = seconds;
        gameState.totalTime = seconds;

        gameState.timer = setInterval(() => {
            gameState.timeLeft--;
            const timerEl = document.getElementById('hud-timer');
            const fillEl = document.getElementById('game-timer-fill');

            if (timerEl) timerEl.textContent = `${gameState.timeLeft}s`;
            if (fillEl) fillEl.style.width = `${(gameState.timeLeft / gameState.totalTime) * 100}%`;

            if (gameState.timeLeft <= 5 && gameState.timeLeft > 0) {
                gameSfx.tick();
            }

            if (gameState.timeLeft <= 0) {
                stopGameTimer();
                if (typeof onComplete === 'function') onComplete();
            }
        }, 1000);
    }

    function endMiniGame(gameName, summaryText) {
        stopGameTimer();
        gameSfx.win();
        if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 80 });

        const container = document.getElementById('games-stage-container');
        if (!container) return;

        container.innerHTML = `
            <div class="game-result-modal">
                <div class="result-badge">🎉 GAME OVER — HASIL PERMAINAN</div>
                <h2 class="result-title">${escapeHtml(gameName)}</h2>
                <p class="result-summary">${escapeHtml(summaryText)}</p>

                <div class="result-score-banner">
                    <div class="res-stat-item">
                        <span class="res-label">TOTAL SKOR</span>
                        <strong class="res-value score-val">${gameState.score}</strong>
                    </div>
                    <div class="res-stat-item">
                        <span class="res-label">MAX COMBO STREAK</span>
                        <strong class="res-value streak-val">🔥 ${gameState.maxStreak || gameState.streak}</strong>
                    </div>
                </div>

                <div class="result-actions">
                    <button type="button" class="btn-res-action btn-res-replay" onclick="launchMiniGame('${gameState.activeGame}')">
                        🔄 Mainkan Lagi
                    </button>
                    <button type="button" class="btn-res-action btn-res-lobby" onclick="renderGameSelectScreen()">
                        🎮 Pilih Game Lain
                    </button>
                    <button type="button" class="btn-res-action btn-res-learn" onclick="switchScreen('learn')">
                        📖 Balik Belajar
                    </button>
                </div>
            </div>
        `;
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

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
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.startRoboCodeRunner = startRoboCodeRunner;

    function renderRoboCodeStage() {
        const container = document.getElementById('games-stage-container');
        if (!container || !gameState.data) return;

        const lvl = gameState.data.currentLevel;
        const initVars = lvl.traceSteps[0].vars;

        container.innerHTML = `
            <div class="game-play-area">
                <div class="game-hud">
                    <button type="button" class="btn-back-lobby" onclick="renderGameSelectScreen()">← Keluar ke Arena</button>
                    <div class="game-hud-stats">
                        <div class="hud-item"><span class="hud-label">LEVEL:</span> <strong>${gameState.data.levelIdx + 1}/${gameState.data.deck.length}</strong></div>
                        <div class="hud-item"><span class="hud-label">SKOR:</span> <strong id="hud-score">${gameState.score}</strong></div>
                        <div class="hud-item streak-fire"><span class="hud-label">STREAK:</span> <strong id="hud-streak">🔥 ${gameState.streak}</strong></div>
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
                        <div class="mission-header">MISI ALGORITMA: ${escapeHtml(lvl.title)} 🎯</div>
                        <p class="mission-desc">${escapeHtml(lvl.scenario)}</p>
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
                                ${lvl.codeLines.map(line => `
                                    <div class="term-code-line" id="code-line-${line.num}">
                                        <span class="line-num">${line.num}</span>
                                        <span class="line-code">${escapeHtml(line.text)}</span>
                                        <span class="line-comment">// ${escapeHtml(line.comment)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <!-- Live Memory Watch Kanan -->
                        <div class="robocode-memory-sidebar">
                            <div class="memory-header">
                                <span>🧠 Live RAM Watch</span>
                                <span class="memory-status" id="memory-step-badge">Status: Standby</span>
                            </div>
                            <div class="memory-grid" id="robocode-memory-grid">
                                ${Object.keys(initVars).map(vName => `
                                    <div class="memory-box" id="mem-box-${vName}">
                                        <div class="mem-var-name">${vName}</div>
                                        <div class="mem-var-val" id="mem-val-${vName}">${initVars[vName]}</div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="memory-log-note" id="memory-log-note">
                                💡 Klik 'Jalankan Simulasi' untuk melihat variabel berganti secara real-time!
                            </div>
                        </div>
                    </div>

                    <!-- ❓ Target Pertanyaan & Pilihan Jawaban -->
                    <div class="robocode-quiz-section">
                        <h4 class="robocode-question-text">❓ ${escapeHtml(lvl.targetQuestion)}</h4>
                        <div class="robocode-choices-grid">
                            ${lvl.choices.map((ch, idx) => `
                                <button type="button" class="btn-robocode-choice" id="robo-choice-${idx}" onclick="answerRoboCode(${idx})">
                                    <span class="choice-tag">${String.fromCharCode(65 + idx)}</span>
                                    <span class="choice-text">${escapeHtml(ch)}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="robocode-feedback-panel" id="robocode-feedback-box" style="display: none;"></div>
                </div>
            </div>
        `;
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
            const activeLineEl = document.getElementById(`code-line-${currentStep.line}`);
            if (activeLineEl) {
                activeLineEl.classList.add('code-line-active');
            }

            // Update variables
            Object.keys(currentStep.vars).forEach(vName => {
                const valEl = document.getElementById(`mem-val-${vName}`);
                const boxEl = document.getElementById(`mem-box-${vName}`);
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
            if (logEl) logEl.textContent = `➡️ Langkah ${stepIdx + 1}: ${currentStep.note}`;
            if (badgeEl) badgeEl.textContent = `Langkah ${stepIdx + 1}/${steps.length}`;

            stepIdx++;
            gameState.data.execTimer = setTimeout(runNext, 450);
        }

        runNext();
    }
    window.triggerRoboCodeRun = triggerRoboCodeRun;

    function answerRoboCode(choiceIdx) {
        if (!gameState.data || gameState.data.isAnswered) return;
        gameState.data.isAnswered = true;
        document.querySelectorAll('.btn-robocode-choice').forEach(b => b.disabled = true);
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

            const choiceBtn = document.getElementById(`robo-choice-${choiceIdx}`);
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
        if (streakEl) streakEl.textContent = `🔥 ${gameState.streak}`;

        if (feedbackEl) {
            feedbackEl.style.display = 'block';
            feedbackEl.className = `robocode-feedback-panel ${isCorrect ? 'fb-correct' : 'fb-wrong'}`;
            feedbackEl.innerHTML = `<strong>${isCorrect ? '🎉 LOGIKA TEPAT SEKALI!' : '💡 ANALISIS ULANG!'}</strong> ${currentLvl.explanation}`;
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

})();
