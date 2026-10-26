/**
 * ============================================================
 * 🤖 ASISTEN CERDAS GEMINI AI (DUAL-MODE: GURU & SISWA)
 * ============================================================
 * Sistem asisten cerdas berorientasi peran (Role-Aware Contextual AI):
 * 
 * 1. 🎓 MODE SISWA (Default di Dasbor Siswa / Ruang Belajar / Umum):
 *    - DIBATASI KETAT: AI TIDAK memiliki akses atau membagikan rekapitulasi nilai,
 *      peringkat kelas, siapa yang terendah/tertinggi, maupun status pengerjaan kuis.
 *    - Siswa HANYA BISA BERTANYA seputar materi pelajaran dan konsep Informatika Fase E
 *      (Literasi Digital, Verifikasi Fakta, Deteksi Hoax, Keamanan Jaringan, JKI,
 *       dan Berpikir Komputasional).
 *    - Jika siswa menanyakan nilai/skor/peringkat/siapa terendah, AI menolak secara
 *      santun demi melindungi privasi dan kerahasiaan data seluruh siswa.
 * 
 * 2. 👩‍🏫 MODE GURU (Hanya Aktif di Dasbor Guru Terotentikasi PIN Resmi):
 *    - DIBERIKAN KEBEBASAN PENUH: AI memiliki kebebasan menganalisis data empiris
 *      216 siswa di kelas X E 1 s.d X E 6 secara komprehensif.
 *    - Mengetahui nilai tertinggi & terendah (per kelas maupun keseluruhan).
 *    - Mengetahui siswa yang belum mengerjakan kuis kedua atau kedua kuis sama sekali.
 *    - Mengetahui peta miskonsepsi & butir soal tersulit untuk tindakan remedial guru.
 * ============================================================
 */

(function () {
    'use strict';

    // 🔒 1. PENGECEKAN ROLE AKTIF (MODE GURU vs MODE SISWA)
    function isTeacherMode() {
        const isAuth = (typeof isTeacherAuthValid === 'function') ? isTeacherAuthValid() : false;
        const teacherScreen = document.getElementById('screen-teacher');
        const isTeacherScreenActive = teacherScreen && teacherScreen.classList.contains('active');
        return Boolean(isAuth && isTeacherScreenActive);
    }
    window.isTeacherMode = isTeacherMode;

    // 🧠 2. ENGINE EKSTRAKSI DATA KONTEKS REAL-TIME (KHUSUS MODE GURU)
    function getLiveTeacherContext() {
        const allRecords = (typeof loadRecords === 'function') ? loadRecords() : [];
        const classes = ['X E 1', 'X E 2', 'X E 3', 'X E 4', 'X E 5', 'X E 6'];
        const roster = (typeof STUDENT_ROSTER !== 'undefined') ? STUDENT_ROSTER : {};

        const modFaktaId = 'modul_detektif_fakta';
        const modJaringanId = 'modul_jaringan_keamanan';

        // Filter records per modul dengan normalisasi otomatis
        const recordsFakta = allRecords.filter(r => {
            const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
            return mod === modFaktaId;
        });
        const recordsJaringan = allRecords.filter(r => {
            const mod = (typeof normalizeModuleId === 'function') ? normalizeModuleId(r.moduleId, r.id, r.date) : (r.moduleId || modFaktaId);
            return mod === modJaringanId;
        });

        // Kumpulkan data per siswa secara komparatif
        const studentProfiles = [];
        let totalEnrolled = 0;

        classes.forEach(cls => {
            const list = roster[cls] || [];
            totalEnrolled += list.length;

            list.forEach(name => {
                const cleanName = name.trim().toLowerCase();
                const nameMatches = (typeof isNameEquivalent === 'function') 
                    ? (recName) => isNameEquivalent(recName, name)
                    : (recName) => (recName || '').trim().toLowerCase() === cleanName;
                const classMatches = (typeof isClassEquivalent === 'function')
                    ? (recClass) => isClassEquivalent(recClass, cls)
                    : (recClass) => (recClass || '').replace(/\s+/g, '').toUpperCase() === cls.replace(/\s+/g, '').toUpperCase();

                // Cari percobaan terbaik untuk Kuis 1 (Fakta)
                const attemptsFakta = recordsFakta.filter(r => 
                    nameMatches(r.name) && classMatches(r.class)
                ).sort((a, b) => b.score - a.score);
                const recFakta = attemptsFakta[0] || null;

                // Cari percobaan terbaik untuk Kuis 2 (Jaringan)
                const attemptsJaringan = recordsJaringan.filter(r => 
                    nameMatches(r.name) && classMatches(r.class)
                ).sort((a, b) => b.score - a.score);
                const recJaringan = attemptsJaringan[0] || null;

                const hasFakta = !!recFakta;
                const hasJaringan = !!recJaringan;

                let completionStatus = 'none'; // 'both', 'only_fakta', 'only_jaringan', 'none'
                if (hasFakta && hasJaringan) completionStatus = 'both';
                else if (hasFakta) completionStatus = 'only_fakta';
                else if (hasJaringan) completionStatus = 'only_jaringan';

                let avgScore = null;
                if (hasFakta && hasJaringan) {
                    avgScore = Math.round((recFakta.score + recJaringan.score) / 2);
                } else if (hasFakta) {
                    avgScore = recFakta.score;
                } else if (hasJaringan) {
                    avgScore = recJaringan.score;
                }

                studentProfiles.push({
                    name: name,
                    class: cls,
                    hasFakta: hasFakta,
                    recFakta: recFakta,
                    scoreFakta: recFakta ? recFakta.score : null,
                    hasJaringan: hasJaringan,
                    recJaringan: recJaringan,
                    scoreJaringan: recJaringan ? recJaringan.score : null,
                    completionStatus: completionStatus,
                    avgScore: avgScore
                });
            });
        });

        // Hitung agregasi status pengerjaan
        const finishedBoth = studentProfiles.filter(s => s.completionStatus === 'both');
        const onlyFakta = studentProfiles.filter(s => s.completionStatus === 'only_fakta');
        const onlyJaringan = studentProfiles.filter(s => s.completionStatus === 'only_jaringan');
        const finishedOneOnly = studentProfiles.filter(s => s.completionStatus === 'only_fakta' || s.completionStatus === 'only_jaringan');
        const finishedNone = studentProfiles.filter(s => s.completionStatus === 'none');

        // Agregasi per kelas
        const classStats = {};
        classes.forEach(cls => {
            const inClass = studentProfiles.filter(s => s.class === cls);
            const doneBothInClass = inClass.filter(s => s.completionStatus === 'both');
            const doneFaktaInClass = inClass.filter(s => s.hasFakta);
            const doneJaringanInClass = inClass.filter(s => s.hasJaringan);
            const doneNoneInClass = inClass.filter(s => s.completionStatus === 'none');
            const missingOneInClass = inClass.filter(s => s.completionStatus === 'only_fakta' || s.completionStatus === 'only_jaringan');

            // Hitung nilai tertinggi & terendah di kelas ini
            const validFaktaScores = doneFaktaInClass.map(s => s.scoreFakta);
            const validJaringanScores = doneJaringanInClass.map(s => s.scoreJaringan);
            const validAvgs = inClass.filter(s => s.avgScore !== null).map(s => s.avgScore);

            const highestFakta = validFaktaScores.length ? Math.max(...validFaktaScores) : null;
            const lowestFakta = validFaktaScores.length ? Math.min(...validFaktaScores) : null;
            const topStudentsFakta = doneFaktaInClass.filter(s => s.scoreFakta === highestFakta);
            const bottomStudentsFakta = doneFaktaInClass.filter(s => s.scoreFakta === lowestFakta);

            const highestJaringan = validJaringanScores.length ? Math.max(...validJaringanScores) : null;
            const lowestJaringan = validJaringanScores.length ? Math.min(...validJaringanScores) : null;
            const topStudentsJaringan = doneJaringanInClass.filter(s => s.scoreJaringan === highestJaringan);
            const bottomStudentsJaringan = doneJaringanInClass.filter(s => s.scoreJaringan === lowestJaringan);

            const highestAvg = validAvgs.length ? Math.max(...validAvgs) : null;
            const lowestAvg = validAvgs.length ? Math.min(...validAvgs) : null;
            const topStudentsOverall = inClass.filter(s => s.avgScore === highestAvg);
            const bottomStudentsOverall = inClass.filter(s => s.avgScore === lowestAvg);

            classStats[cls] = {
                className: cls,
                totalStudents: inClass.length,
                doneBoth: doneBothInClass,
                doneFakta: doneFaktaInClass,
                doneJaringan: doneJaringanInClass,
                doneNone: doneNoneInClass,
                missingOne: missingOneInClass,
                highestFakta, lowestFakta, topStudentsFakta, bottomStudentsFakta,
                highestJaringan, lowestJaringan, topStudentsJaringan, bottomStudentsJaringan,
                highestAvg, lowestAvg, topStudentsOverall, bottomStudentsOverall
            };
        });

        // Analisis Miskonsepsi & Butir Soal Tersulit
        const qFaktaErrors = Array(20).fill(0);
        let countFakta = 0;
        recordsFakta.forEach(r => {
            countFakta++;
            if (Array.isArray(r.wrongQuestions)) {
                r.wrongQuestions.forEach(qIdx => {
                    if (qIdx >= 0 && qIdx < 20) qFaktaErrors[qIdx]++;
                });
            }
        });

        const qJaringanErrors = Array(20).fill(0);
        let countJaringan = 0;
        recordsJaringan.forEach(r => {
            countJaringan++;
            if (Array.isArray(r.wrongQuestions)) {
                r.wrongQuestions.forEach(qIdx => {
                    if (qIdx >= 0 && qIdx < 20) qJaringanErrors[qIdx]++;
                });
            }
        });

        const worstFaktaQuestions = qFaktaErrors.map((errCount, idx) => ({
            qNumber: idx + 1,
            qIndex: idx,
            errorCount: errCount,
            errorPct: countFakta > 0 ? Math.round((errCount / countFakta) * 100) : 0
        })).sort((a, b) => b.errorCount - a.errorCount);

        const worstJaringanQuestions = qJaringanErrors.map((errCount, idx) => ({
            qNumber: idx + 1,
            qIndex: idx,
            errorCount: errCount,
            errorPct: countJaringan > 0 ? Math.round((errCount / countJaringan) * 100) : 0
        })).sort((a, b) => b.errorCount - a.errorCount);

        return {
            totalEnrolled,
            studentProfiles,
            recordsFaktaCount: recordsFakta.length,
            recordsJaringanCount: recordsJaringan.length,
            finishedBoth,
            onlyFakta,
            onlyJaringan,
            finishedOneOnly,
            finishedNone,
            classStats,
            classes,
            worstFaktaQuestions,
            worstJaringanQuestions
        };
    }

    // 🔍 3. NORMALISASI KELAS (Dukungan untuk input "10E6", "10e3", "X E 6", dll)
    function parseClassFromQuery(query) {
        const q = query.toUpperCase().replace(/\s+/g, '');
        if (q.includes('10E1') || q.includes('XE1') || q.includes('X-E-1')) return 'X E 1';
        if (q.includes('10E2') || q.includes('XE2') || q.includes('X-E-2')) return 'X E 2';
        if (q.includes('10E3') || q.includes('XE3') || q.includes('X-E-3')) return 'X E 3';
        if (q.includes('10E4') || q.includes('XE4') || q.includes('X-E-4')) return 'X E 4';
        if (q.includes('10E5') || q.includes('XE5') || q.includes('X-E-5')) return 'X E 5';
        if (q.includes('10E6') || q.includes('XE6') || q.includes('X-E-6')) return 'X E 6';
        return null;
    }

    // 🛡️ 4. DETEKTOR PERTANYAAN REKAP & NILAI (UNTUK MEMBATASI SISWA)
    function isGradeOrResultQuery(query) {
        const q = query.toLowerCase().trim();

        // 1. Pengecualian Positif: Jika pertanyaan murni konsep teknis/edukatif rumus spreadsheet
        // Contoh: "rumus nilai tertinggi di excel", "fungsi min untuk nilai terendah", "apa itu nilai cell"
        const isTechnicalOrFormulaInquiry = 
            (q.includes('excel') || q.includes('spreadsheet') || q.includes('rumus') || q.includes('formula') || q.includes('sintaks') || q.includes('fungsi') || q.includes('office') || q.includes('word') || q.includes('powerpoint')) &&
            (q.includes('cara') || q.includes('bagaimana') || q.includes('apa') || q.includes('contoh') || q.includes('max') || q.includes('min') || q.includes('average') || q.includes('sum') || q.includes('count') || q.includes('vlookup') || q.includes('if'));
        
        // Jika murni pertanyaan teknis rumus spreadsheet tanpa menanyakan siswa/kelas tertentu, loloskan ke materi
        const mentionsStudentOrClass = /\b(siswa|anak|teman|siapa|kelas|10e|xe|roster|absen|peringkat\s+kelas|juara\s+kelas|rekap|rapor|raport)\b/i.test(q);
        if (isTechnicalOrFormulaInquiry && !mentionsStudentOrClass) {
            return false;
        }

        // 2. Pola kata kunci rahasia yang tidak boleh dijawab di mode siswa (Kerahasiaan Data Siswa & Ujian)
        const forbiddenPatterns = [
            /\b(rekap|rekapitulasi|daftar\s+nilai|transkrip|hasil\s+kuis|hasil\s+ujian|rapor|raport)\b/i,
            /\b(siapa\s+yang|siapa\s+saja\s+yang|siapa\s+siswa|siapa\s+anak|siapa\s+teman)\b/i,
            /\b(ranking|peringkat|peringkat\s+ke|urutan\s+juara)\b/i,
            /\b(siapa.*(terendah|tertinggi|juara|rekor|lulus|remedial|belum|sudah))/i,
            /\b(nilai|skor|score).*(terendah|paling\s+rendah|terkecil|jelek|buruk|anjlok|tertinggi|paling\s+tinggi|terbesar)/i,
            /\b(terendah|tertinggi).*(nilai|skor|score|kuis|ujian)/i,
            /\b(belum|sudah)\s+(mengerjakan|ujian|kuis|selesai|tuntas|ikut)/i,
            /\b(bocoran\s+nilai|intip\s+nilai|lihat\s+nilai\s+teman|kunci\s+jawaban\s+kuis)/i
        ];

        for (const regex of forbiddenPatterns) {
            if (regex.test(q)) return true;
        }

        // Cek jika query menyebut nama siswa spesifik dari roster resmi disertai pertanyaan nilai/status
        const roster = (typeof STUDENT_ROSTER !== 'undefined') ? STUDENT_ROSTER : {};
        for (const cls in roster) {
            const names = roster[cls] || [];
            for (const name of names) {
                const cleanName = name.toLowerCase().trim();
                if (cleanName.length >= 5 && q.includes(cleanName)) {
                    if (/\b(nilai|skor|lulus|ikut|kuis|ujian|remedial|hasil)\b/i.test(q)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // 🚫 4B. GUARDRAIL KETAT: TIDAK UNTUK MENGERJAKAN / MENULISKAN KODING LANGSUNG
    function isCodingTaskRequest(query) {
        const q = query.toLowerCase().trim();

        // 1. Pengecualian konsep teoritis, sejarah & pengertian (boleh dijawab secara edukatif)
        const isTheoreticalConcept = 
            /^(apa\s+itu|apa\s+maksud|definisi|pengertian|sejarah|mengapa|apa\s+perbedaan|jelaskan\s+perbedaan)\s+(koding|coding|pemrograman|programming|bahasa\s+pemrograman|source\s+code|compiler|interpreter|ide)/i.test(q);
        if (isTheoreticalConcept) {
            return false;
        }

        // 2. Pengecualian rumus spreadsheet Excel/Office (bukan koding skrip, melainkan materi TIK perkantoran)
        if ((q.includes('excel') || q.includes('spreadsheet') || q.includes('rumus') || q.includes('formula')) && !q.includes('python') && !q.includes('c++') && !q.includes('javascript') && !q.includes('html')) {
            return false;
        }

        // 3. Deteksi aksi meminta dibuatkan / dituliskan kodingan
        const actionPatterns = /\b(buatkan|buat|bikinkan|bikin|tuliskan|tulis|ketikkan|ketik|kerjakan|generate|solve|selesaikan|kodingkan|codingkan|susunkan\s+kode|minta\s+kode|berikan\s+kode)\b/i;
        const codeNounPatterns = /\b(kode|koding|coding|kodingan|codingan|skrip|script|source\s*code|program|sintaks\s+kode|syntax\s+kode|fungsi\s+koding)\b/i;
        const progLanguages = /\b(python|c\+\+|cpp|c#|java|javascript|php|html|css|pascal|kotlin|swift|ruby|dart|go|golang|sql\s+query)\b/i;

        if (actionPatterns.test(q) && (codeNounPatterns.test(q) || progLanguages.test(q))) {
            return true;
        }

        if (/\b(bikin\s+program|buat\s+program|tulis\s+program|tugas\s+koding|tugas\s+coding|kodingan\s+tugas|codingan\s+tugas|kerjakan\s+proyek\s+koding)\b/i.test(q)) {
            return true;
        }

        if (/\b(source\s+code\s+lengkap|kode\s+lengkap|full\s+code|koding\s+lengkap)\b/i.test(q)) {
            return true;
        }

        return false;
    }
    window.isCodingTaskRequest = isCodingTaskRequest;

    // 🎓 5. ENGINE RESPON ASISTEN BELAJAR SISWA (HANYA MATERI & KONSEP)
    function generateStudentLearningResponse(userPrompt) {
        const p = userPrompt.toLowerCase().trim();
        const hasWord = (text, word) => new RegExp('(^|[^a-z0-9])' + word + '([^a-z0-9]|$)', 'i').test(text);

        // 🔒 BLOKIR PERTANYAAN REKAP NILAI, TERENDAH, TERTINGGI, DAN PERINGKAT DI MODE SISWA
        if (isGradeOrResultQuery(p)) {
            return `### 🔒 Akses Terbatas: Privasi & Kerahasiaan Nilai Siswa\n\n` +
                   `Mohon maaf, informasi mengenai **rekapitulasi nilai, peringkat kelas, siapa nilai terendah atau tertinggi, serta status kelulusan/pengerjaan kuis siswa** bersifat **rahasia** dan tidak dapat diakses oleh siswa.\n\n` +
                   `Kerahasiaan nilai dilindungi agar setiap siswa dapat fokus pada peningkatan kompetensinya masing-masing tanpa merasa terbebani komparasi nilai antar teman.\n\n` +
                   `🔑 **Akses Analisis Nilai:**\n` +
                   `Fitur rekapitulasi nilai dan analitik performa hanya dapat dibuka secara resmi oleh **Ibu Guru (Ibu Rini Syafitri, S.Pd.)** melalui Dasbor Guru terverifikasi PIN.\n\n` +
                   `---\n` +
                   `💡 **Sebagai Asisten Belajar Siswa, saya siap membantumu memahami seluruh materi pelajaran!**\n` +
                   `Silakan tanyakan materi atau konsep pembelajaran Informatika, misalnya:\n` +
                   `- 📊 *"Apa itu Microsoft Office dan fungsi aplikasi di dalamnya?"*\n` +
                   `- 📈 *"Bagaimana rumus IF bertingkat dan VLOOKUP di Excel?"*\n` +
                   `- ⚖️ *"Apa saja pelanggaran hukum dalam UU ITE dan etika digital?"*\n` +
                   `- 🤖 *"Bagaimana cara kerja LLM dan Generative AI?"*\n` +
                   `- 🌐 *"Apa perbedaan fungsi Switch dan Hub dalam jaringan komputer?"*\n` +
                   `- 🛡️ *"Apa saja ciri-ciri pesan phishing atau modus file APK berbahaya di WhatsApp?"*`;
        }

        // 🚫 GUARDRAIL KETAT: TIDAK UNTUK MENGERJAKAN / MENULISKAN KODING LANGSUNG
        if (isCodingTaskRequest(p)) {
            return `### ⚠️ Prinsip Belajar Mandiri: Asisten Tidak Menyediakan Koding Instan (No Direct Coding)\n\n` +
                   `Halo! Sesuai prinsip pembelajaran **Kurikulum Merdeka di SMAN 4 Padang**, asisten cerdas ini dirancang untuk **tidak menuliskan baris kode program (*script code*) jadi atau mengerjakan tugas koding secara langsung** untukmu.\n\n` +
                   `Kebijakan ini bertujuan agar kamu dapat melatih **nalar kritis, logika berpikir komputasional, dan kemampuan pemecahan masalah (*Problem Solving*) secara mandiri**! 🚀\n\n` +
                   `---\n\n` +
                   `### 💡 Alternatif Edukatif: Mari Pahami Alur Logika & Algoritmanya!\n` +
                   `Meskipun tidak memberikan kode jadi, saya siap membantumu merancang arsitektur solusinya:\n\n` +
                   `1. 🧩 **Logika & Tahapan Masalah (Problem Solving Steps):**\n` +
                   `   - **Input Data:** Tentukan data apa saja yang perlu dimasukkan oleh pengguna (*user*).\n` +
                   `   - **Validasi & Kondisi:** Periksa apakah ada kondisi khusus (menggunakan percabangan \`IF-ELSE\`).\n` +
                   `   - **Proses Inti:** Jalankan perhitungan matematis atau manipulasi data yang diperlukan.\n` +
                   `   - **Output:** Sajikan hasil akhir ke layar monitor secara informatif.\n\n` +
                   `2. 📊 **Bagan Alir (Flowchart):**\n` +
                   `   - Simbol **Oval (Terminator):** Titik Mulai (*Start*) & Selesai (*End*).\n` +
                   `   - Simbol **Jajar Genjang (Input/Output):** Membaca data masukan atau mencetak hasil.\n` +
                   `   - Simbol **Persegi Panjang (Process):** Operasi hitungan atau penugasan variabel.\n` +
                   `   - Simbol **Belah Ketupat (Decision):** Pengambilan keputusan (kondisi bernilai Benar/Salah).\n\n` +
                   `3. 📝 **Pseudocode (Teks Algoritma Terstruktur):**\n` +
                   `   Berikut rancangan algoritma bahasa alami yang dapat kamu jadikan acuan untuk menulis kodemu sendiri:\n\n` +
                   `\`\`\`text\n` +
                   `ALGORITMA RancanganSolusiMandiri\n` +
                   `DEKLARASI:\n` +
                   `    variabel_masukan : TipeData\n` +
                   `    variabel_hasil   : TipeData\n` +
                   `DESKRIPSI:\n` +
                   `    MULAI\n` +
                   `        BACA (variabel_masukan)\n` +
                   `        JIKA (kondisi_validasi) MAKA\n` +
                   `            variabel_hasil <- proses_perhitungan\n` +
                   `        SELAIN_ITU\n` +
                   `            variabel_hasil <- proses_alternatif\n` +
                   `        AKHIR_JIKA\n` +
                   `        TAMPILKAN (variabel_hasil)\n` +
                   `    SELESAI\n` +
                   `\`\`\`\n\n` +
                   `---\n\n` +
                   `🎯 **Tantangan Untukmu:**\n` +
                   `*Cobalah ketik dan susun baris kodinganmu sendiri di teks editor atau compiler (misal Python IDLE, VS Code, atau C++) di komputermu sendiri. Jika kamu bingung tentang konsep variabel, error logika, atau cara kerja perulangan, tanyakan konsepnya ke saya! Kamu pasti bisa!* 🌟`;
        }

        // 📊 MATERI 1: MICROSOFT OFFICE & APLIKASI PERKANTORAN (TIK)
        if (p.includes('office') || p.includes('ms office') || p.includes('ms.office') || p.includes('microsoft office') || p.includes('perkantoran') || p.includes('aplikasi kantor') || p.includes('aplikasi perkantoran') || p.includes('paket office')) {
            let reply = `### 📊 Mengenal Microsoft Office & Aplikasi Perkantoran (TIK)\n\n`;
            reply += `**Microsoft Office** adalah paket perangkat lunak aplikasi perkantoran (*Office Suite*) paling populer di dunia yang dikembangkan oleh Microsoft Corporation untuk membantu pengolahan dokumen, analisis lembar kerja, presentasi, pengelolaan basis data, dan komunikasi.\n\n`;
            reply += `Materi ini terintegrasi penuh pada **Ruang Belajar Topik 5: Jurus Sakti Aplikasi Perkantoran & Rumus Excel**.\n\n`;
            reply += `**3 Aplikasi Inti Microsoft Office dalam Pembelajaran Informatika:**\n\n`;
            reply += `1. **📝 Microsoft Word (Pengolah Kata / Word Processing):**\n`;
            reply += `   Digunakan untuk membuat surat resmi, proposal, makalah, modul, laporan, dan piagam sertifikat. Memiliki fitur otomatisasi canggih seperti **Mail Merge (Surat Massal)**, daftar isi otomatis (*Table of Contents*), dan *Page Break*.\n\n`;
            reply += `2. **📈 Microsoft Excel (Pengolah Lembar Kerja / Spreadsheet):**\n`;
            reply += `   Digunakan untuk mengolah data angka, pembukuan keuangan, analisis statistik, dan pembuatan grafik (*Charts*). Memanfaatkan rumus logika (\`IF\`, \`AND\`, \`OR\`), rumus pencarian (\`VLOOKUP\`, \`XLOOKUP\`), dan fungsi agregasi (\`SUM\`, \`AVERAGE\`, \`COUNTIF\`).\n\n`;
            reply += `3. **📽️ Microsoft PowerPoint (Presentasi Visual):**\n`;
            reply += `   Digunakan untuk menyusun materi tayang dalam bentuk slide interaktif. Dilengkapi fitur *Slide Master*, efek animasi (*Entrance, Exit*), transisi slide, serta penyematan media video/audio.\n\n`;
            reply += `**Aplikasi Pendukung Lainnya:**\n`;
            reply += `- **Microsoft Access:** Pengelola basis data relasional (*RDBMS*).\n`;
            reply += `- **Microsoft Outlook:** Pengelola surel (*email*), kalender kerja, dan jadwal rapat.\n`;
            reply += `- **Microsoft OneNote:** Buku catatan digital kolaboratif.\n\n`;
            reply += `💡 **Konsep Integrasi OLE (Object Linking and Embedding):**\n`;
            reply += `Dalam TIK Kurikulum Merdeka, kamu diajarkan bahwa aplikasi perkantoran saling terhubung! Contoh: Tabel dan grafik yang dihitung di Excel dapat disematkan (*linked*) langsung ke dalam laporan Word atau slide PowerPoint sehingga angka selalu sinkron otomatis saat data Excel diperbarui.\n\n`;
            reply += `*Alternatif Aplikasi Perkantoran Lain:* Google Workspace (Docs, Sheets, Slides), LibreOffice, WPS Office, dan Canva.`;
            return reply;
        }

        // 📝 MATERI 2: MICROSOFT WORD & OTOMASI MAIL MERGE
        if (p.includes('word') || p.includes('ms word') || p.includes('microsoft word') || p.includes('pengolah kata') || p.includes('mail merge') || p.includes('surat massal') || p.includes('daftar isi') || p.includes('table of content')) {
            let reply = `### 📝 Microsoft Word & Otomasi Dokumen (Mail Merge)\n\n`;
            reply += `**Microsoft Word** adalah aplikasi pengolah kata (*word processor*) standar industri untuk menyusun dokumen formal dengan tata letak profesional.\n\n`;
            reply += `**Jurus Sakti: Mail Merge (Surat & Piagam Massal dalam 2 Menit):**\n`;
            reply += `Fitur untuk membuat ratusan surat, piagam, atau kartu ujian dengan format yang sama tetapi data penerima berbeda secara otomatis.\n\n`;
            reply += `1. **Dokumen Master (Word):** Buat template surat atau sertifikat dengan field kosong penampung: \`<<Nama_Siswa>>\` dan \`<<Predikat>>\`.\n`;
            reply += `2. **Sumber Data (Excel):** Buat tabel spreadsheet berisi kolom No, Nama, dan Nilai/Predikat.\n`;
            reply += `3. **Integrasikan:** Klik tab *Mailings* -> *Select Recipients* -> *Use an Existing List* (pilih file Excel).\n`;
            reply += `4. **Finish & Merge:** Cetak atau ekspor ke PDF secara massal tanpa risiko salah ketik!\n\n`;
            reply += `**Shortcut Penting Microsoft Word:**\n`;
            reply += `- \`Ctrl + S\` : Menyimpan (*Save*) | \`Ctrl + P\` : Mencetak (*Print*)\n`;
            reply += `- \`Ctrl + B\` : Huruf Tebal (*Bold*) | \`Ctrl + I\` : Huruf Miring (*Italic*)\n`;
            reply += `- \`Ctrl + J\` : Rata Kanan-Kiri (*Justify*) | \`Ctrl + Enter\` : Ganti Halaman Baru (*Page Break*)`;
            return reply;
        }

        // 📈 MATERI 3: MICROSOFT EXCEL & FORMULA SPREADSHEET
        if (p.includes('excel') || p.includes('ms excel') || p.includes('microsoft excel') || p.includes('spreadsheet') || p.includes('lembar kerja') || p.includes('pengolah angka') || p.includes('rumus excel') || p.includes('formula excel') || p.includes('vlookup') || p.includes('hlookup') || p.includes('xlookup') || p.includes('nested if') || p.includes('sumif') || p.includes('countif') || p.includes('if bertingkat') || p.includes('cell') || p.includes('range')) {
            let reply = `### 📈 Microsoft Excel: Rumus Logika & Pengolahan Data Spreadsheet\n\n`;
            reply += `**Microsoft Excel** mengorganisasikan data dalam bentuk sel (*Cell*, misal \`A1\`), baris (*Row* bernomor), kolom (*Column* berhuruf), dan rentang (*Range*, misal \`A1:C10\`). Setiap rumus wajib diawali tanda sama dengan (**\`=\`**).\n\n`;
            reply += `**Kamus Rumus Excel Esensial (Kurikulum TIK):**\n\n`;
            reply += `1. **Fungsi Statistik Dasar:**\n`;
            reply += `   - \`=SUM(A1:A10)\` : Menjumlahkan total angka.\n`;
            reply += `   - \`=AVERAGE(A1:A10)\` : Menghitung nilai rata-rata.\n`;
            reply += `   - \`=MAX(A1:A10)\` : Mencari nilai tertinggi.\n`;
            reply += `   - \`=MIN(A1:A10)\` : Mencari nilai terendah.\n`;
            reply += `   - \`=COUNT(A1:A10)\` : Menghitung banyaknya sel yang berisi angka.\n\n`;
            reply += `2. **Fungsi Logika Percabangan (IF & Nested IF):**\n`;
            reply += `   - **IF Tunggal:** \`=IF(B2>=80, "LULUS", "REMEDIAL")\`\n`;
            reply += `   - **Nested IF (Bertingkat):** \`=IF(B2>=90, "A", IF(B2>=80, "B", "C"))\`\n`;
            reply += `   - **Kombinasi AND/OR:** \`=IF(AND(B2>=80, C2>=75), "Tuntas", "Belum Tuntas")\`\n\n`;
            reply += `3. **Pencarian Data (VLOOKUP vs XLOOKUP):**\n`;
            reply += `   - \`=VLOOKUP(nilai_kunci, tabel_referensi, nomor_kolom, FALSE)\` : Mencari data pada kolom vertikal secara presisi.\n`;
            reply += `   - \`=XLOOKUP(nilai_kunci, kolom_pencarian, kolom_hasil)\` : Rumus modern yang lebih fleksibel tanpa batasan kolom kiri/kanan.\n\n`;
            reply += `4. **Agregasi Bersyarat:**\n`;
            reply += `   - \`=COUNTIF(C2:C50, "LULUS")\` : Menghitung berapa siswa yang lulus.\n`;
            reply += `   - \`=SUMIF(B2:B50, "X E 1", D2:D50)\` : Menjumlahkan nilai khusus kelas X E 1.`;
            return reply;
        }

        // 📽️ MATERI 4: MICROSOFT POWERPOINT & TEKNIK PRESENTASI
        if (p.includes('powerpoint') || p.includes('power point') || hasWord(p, 'ppt') || p.includes('presentasi') || p.includes('slide') || p.includes('slide master') || p.includes('transisi') || p.includes('animasi ppt')) {
            let reply = `### 📽️ Microsoft PowerPoint & Seni Presentasi Digital yang Memikat\n\n`;
            reply += `**Microsoft PowerPoint** adalah aplikasi presentasi grafis untuk menyampaikan ide, laporan, atau bahan ajar secara visual dan komunikatif.\n\n`;
            reply += `**Fitur Unggulan PowerPoint:**\n`;
            reply += `1. **Slide Master:** Mengatur template keseragaman warna, logo sekolah/instansi, dan font pada seluruh slide sekaligus tanpa perlu mengedit per halaman.\n`;
            reply += `2. **Transition vs Animation:**\n`;
            reply += `   - **Transition:** Efek perpindahan antar-lembar slide (contoh: *Fade, Push, Morph*).\n`;
            reply += `   - **Animation:** Efek gerak pada teks atau gambar di dalam slide (*Entrance* = muncul, *Emphasis* = sorotan, *Exit* = menghilang).\n`;
            reply += `3. **Hyperlink & Action Button:** Membuat slide interaktif seperti game kuis atau navigasi menu beranda.\n\n`;
            reply += `**Prinsip Desain Presentasi Efektif (Kaidah Visual):**\n`;
            reply += `- **Kaidah 10-20-30 (Guy Kawasaki):** 10 Slide, 20 Menit durasi, font minimal ukuran 30pt agar terbaca jelas dari belakang ruangan.\n`;
            reply += `- **Kontras Kuat:** Teks gelap di atas latar terang, atau teks terang di atas latar gelap.\n`;
            reply += `- **Gunakan Diagram & Poin Singkat:** Hindari menempelkan paragraf panjang (*Wall of Text*) pada slide!`;
            return reply;
        }

        // 🖥️ MATERI 5: SISTEM KOMPUTER (HARDWARE, SOFTWARE, BRAINWARE)
        if (p.includes('sistem komputer') || p.includes('hardware') || p.includes('perangkat keras') || p.includes('software') || p.includes('perangkat lunak') || p.includes('brainware') || hasWord(p, 'cpu') || p.includes('processor') || p.includes('prosesor') || hasWord(p, 'ram') || hasWord(p, 'rom') || hasWord(p, 'ssd') || hasWord(p, 'hdd') || p.includes('harddisk') || hasWord(p, 'gpu') || p.includes('motherboard') || p.includes('input device') || p.includes('output device') || p.includes('chipset')) {
            let reply = `### 🖥️ Sistem Komputer: Triad Hardware, Software, & Brainware\n\n`;
            reply += `Komputer tidak dapat beroperasi jika salah satu dari 3 komponen utama ini hilang:\n\n`;
            reply += `1. **Hardware (Perangkat Keras):** Komponen fisik yang dapat dilihat dan disentuh:\n`;
            reply += `   - **Pemroses (Processing):** **CPU** (*Central Processing Unit*) sebagai otak komputer. Terdiri dari **ALU** (*Arithmetic Logic Unit* untuk hitungan) dan **CU** (*Control Unit* untuk pengatur lalu lintas data).\n`;
            reply += `   - **Memori Utama:** **RAM** (*Random Access Memory*) bersifat *volatil* (data hilang saat listrik mati) untuk menampung aplikasi yang sedang berjalan. **ROM** (*Read Only Memory*) bersifat *non-volatil* menyimpan program booting awal (BIOS/UEFI).\n`;
            reply += `   - **Media Penyimpanan Sekunder:** **SSD** (kecepatan kilat chip flash) vs **HDD** (piringan magnetik mekanik).\n`;
            reply += `   - **I/O Device:** Input (Keyboard, Mouse, Scanner, Mic) -> Output (Monitor, Printer, Speaker).\n\n`;
            reply += `2. **Software (Perangkat Lunak):** Program instruksi data:\n`;
            reply += `   - **Sistem Operasi (OS):** Jembatan hardware dan user (Windows, Linux, macOS, Android).\n`;
            reply += `   - **Perangkat Lunak Aplikasi:** Software penunjang tugas (Ms Office, Browser Chrome, Photoshop).\n`;
            reply += `   - **Utilitas & Driver:** Antivirus, pembersih disk, dan driver penghubung perangkat.\n\n`;
            reply += `3. **Brainware (Manusia):** Pengguna yang mengoperasikan (User, Programmer, Administrator, Analis).\n\n`;
            reply += `💡 **Siklus Pengolahan Data:** \`Input\` ➔ \`Proses (CPU & RAM)\` ➔ \`Output\` (dengan penyimpanan di \`Storage\`).`;
            return reply;
        }

        // ⚙️ MATERI 6: SISTEM OPERASI (OS)
        if (p.includes('sistem operasi') || p.includes('operating system') || hasWord(p, 'os') || p.includes('windows') || p.includes('linux') || p.includes('macos') || p.includes('android') || hasWord(p, 'gui') || hasWord(p, 'cli') || p.includes('kernel') || p.includes('file system')) {
            let reply = `### ⚙️ Sistem Operasi (Operating System / OS)\n\n`;
            reply += `**Sistem Operasi** adalah perangkat lunak sistem tingkat dasar yang mengelola seluruh sumber daya perangkat keras (*hardware*), manajemen memori, penjadwalan prosesor, sistem berkas (*file system*), dan antarmuka pengguna.\n\n`;
            reply += `**Fungsi Kunci Sistem Operasi:**\n`;
            reply += `1. **Manajemen Prosesor:** Mengatur giliran eksekusi program di CPU (*multitasking*).\n`;
            reply += `2. **Manajemen Memori:** Mengalokasikan ruang RAM untuk tiap aplikasi yang dibuka.\n`;
            reply += `3. **Manajemen Berkas (File System):** Mengatur penyimpanan dokumen dalam struktur folder direktori (misal: format NTFS, FAT32, ext4).\n`;
            reply += `4. **Antarmuka Pengguna (User Interface):**\n`;
            reply += `   - **GUI (Graphical User Interface):** Interaksi menggunakan ikon visual, jendela, dan kursor mouse (mudah bagi pemula, contoh: Windows 11, macOS, Android).\n`;
            reply += `   - **CLI (Command Line Interface):** Interaksi menggunakan baris perintah teks terminal (ringan, cepat, standar server dan hacker profesional, contoh: Terminal Linux, CMD, PowerShell).\n\n`;
            reply += `💡 **Sistem Operasi Terpopuler:** Microsoft Windows (PC umum), Linux (Server & IoT - *Open Source*), macOS/iOS (Apple), dan Android (Smartphone berbasis kernel Linux).`;
            return reply;
        }

        // 🕵️ MATERI 7: LITERASI DIGITAL, DETEKSI HOAX & VALIDITAS DATA
        if (p.includes('hoax') || p.includes('hoaks') || p.includes('fakta') || p.includes('cek fakta') || p.includes('palsu') || p.includes('bohong') || p.includes('verifikasi') || p.includes('clickbait') || p.includes('domain') || p.includes('go.id') || p.includes('reverse image') || p.includes('lens')) {
            let reply = `### 🕵️ Panduan Detektif Fakta: Verifikasi Informasi & Deteksi Hoaks\n\n`;
            reply += `Dalam literasi digital Informatika Fase E, kamu dilatih untuk berpikir kritis sebelum mempercayai dan membagikan informasi di media sosial.\n\n`;
            reply += `**4 Langkah Emas Deteksi Hoaks (C-E-K-S):**\n\n`;
            reply += `1. **C — Cermati Judul & Bahasa:**\n`;
            reply += `   Berita hoaks kerap memakai judul sensasional, huruf kapital berlebih, tanda seru berganda, serta nada provokatif yang memicu rasa panik (*fear*) atau urgensi mendesak (*"Bagi sekarang sebelum dihapus!"*).\n\n`;
            reply += `2. **E — Evaluasi Alamat Domain (URL):**\n`;
            reply += `   - **Resmi Pemerintah RI:** Wajib berakhiran **\`.go.id\`** (contoh: \`kemdikbud.go.id\`, \`kominfo.go.id\`).\n`;
            reply += `   - **Resmi Pendidikan:** Wajib **\`.sch.id\`** (sekolah) atau **\`.ac.id\`** (kampus).\n`;
            reply += `   - ⚠️ Waspadai situs palsu bertopeng domain gratisan/komersial seperti \`.xyz\`, \`.top\`, \`.free\`, atau blogspot tidak resmi!\n\n`;
            reply += `3. **K — Klarifikasi Melalui Platform Cek Fakta Independen:**\n`;
            reply += `   Periksa kebenaran klaim melalui lembaga pemeriksa fakta kredibel:\n`;
            reply += `   - *TurnBackHoax.id* (Masyarakat Anti Fitnah Indonesia - MAFINDO)\n`;
            reply += `   - *Cekfakta.com*\n`;
            reply += `   - Kanal Aduan Konten Kominfo (*s.id/cekhoaks*)\n`;
            reply += `   - *Google Fact Check Explorer*\n\n`;
            reply += `4. **S — Search Gambar Terbalik (Reverse Image Search):**\n`;
            reply += `   Gunakan **Google Lens** atau **Yandex Images** untuk memeriksa foto yang viral. Hoaks sering menggunakan foto peristiwa masa lalu di tempat lain yang dinarasikan ulang secara salah.\n\n`;
            reply += `💡 *Ingat Semboyan Digital:* **Saring Sebelum Sharing!**`;
            return reply;
        }

        // 🛡️ MATERI 8: PHISHING & SOCIAL ENGINEERING
        if (p.includes('phishing') || p.includes('scam') || p.includes('penipuan') || p.includes('apk') || p.includes('undangan') || p.includes('social engineering') || p.includes('curi akun') || p.includes('otp')) {
            let reply = `### 🛡️ Waspada Serangan Phishing & Rekayasa Sosial\n\n`;
            reply += `**Apa itu Phishing?**\n`;
            reply += `Phishing adalah teknik penipuan siber dengan memancing korban agar memberikan data sensitif (seperti kata sandi, kode OTP, PIN perbankan, dan data pribadi) dengan menyamar sebagai pihak tepercaya (bank, ekspedisi paket, atau pihak sekolah).\n\n`;
            reply += `**Modus Phishing Paling Berbahaya Saat Ini:**\n`;
            reply += `1. **Modus File APK di WhatsApp:**\n`;
            reply += `   Penipu mengirim file berekstensi \`.apk\` yang disamarkan dengan nama berkas seperti *"Surat Undangan Pernikahan.apk"*, *"Foto Paket JNT.apk"*, atau *"Surat Tilang ETLE.apk"*. Jika diinstal, aplikasi jahat ini akan menyadap SMS dan mencuri kode OTP perbankan!\n\n`;
            reply += `2. **Website Tiruan (Spoofed Website):**\n`;
            reply += `   Halaman login media sosial atau bank palsu dengan tampilan 99% mirip aslinya, namun alamat domainnya berbeda (misal: \`instagram-verify-badge.top\`).\n\n`;
            reply += `**Tips Pencegahan Mutlak:**\n`;
            reply += `- ❌ **JANGAN PERNAH** menginstal file \`.apk\` dari kiriman pesan WhatsApp atau sumber tidak resmi.\n`;
            reply += `- 🔒 **JANGAN PERNAH** memberikan kode OTP atau kata sandi kepada siapa pun, termasuk pihak yang mengaku petugas resmi.\n`;
            reply += `- ✅ Selalu pasang aplikasi resmi hanya dari Google Play Store atau Apple App Store.`;
            return reply;
        }

        // 🌐 MATERI 9: PERANGKAT JARINGAN (HUB vs SWITCH vs ROUTER vs MODEM)
        if (hasWord(p, 'hub') || p.includes('switch') || p.includes('router') || p.includes('modem') || p.includes('perangkat jaringan') || p.includes('beda hub') || p.includes('beda switch') || p.includes('mac address') || p.includes('collision')) {
            let reply = `### 🌐 Perbedaan Mendasar Hub vs Switch vs Router vs Modem\n\n`;
            reply += `Dalam infrastruktur jaringan komputer, keempat perangkat ini memiliki peran dan cara kerja yang berbeda:\n\n`;
            reply += `| Fitur | 📦 HUB | ⚡ SWITCH | 🚀 ROUTER |\n`;
            reply += `| :--- | :--- | :--- | :--- |\n`;
            reply += `| **Layer OSI** | Layer 1 (Physical) | Layer 2 (Data Link) | Layer 3 (Network) |\n`;
            reply += `| **Cara Kirim Data** | **Broadcast** (Kirim ke seluruh port membabi buta) | **Unicast / Multicast** (Kirim spesifik ke port tujuan) | **Routing Paket** (Mencari rute terbaik antarjaringan) |\n`;
            reply += `| **Alamat Digunakan** | Tidak memahami alamat | Menggunakan **MAC Address** | Menggunakan **IP Address** |\n`;
            reply += `| **Efisiensi & Kecepatan** | Rendah (banyak tabrakan data / *collision*) | Sangat Tinggi (jalur terisolasi per port) | Sangat Tinggi untuk antarkota/dunia |\n`;
            reply += `| **Fungsi Utama** | Menggabungkan kabel LAN sederhana | Menghubungkan banyak PC dalam satu jaringan LAN sekolah | Menghubungkan LAN lokal ke jaringan global **Internet** |\n\n`;
            reply += `💡 **Peran Modem:** Mengubah sinyal analog dari ISP (penyedia internet) menjadi sinyal digital yang dipahami komputer (*Modulator Demodulator*).`;
            return reply;
        }

        // 🔒 MATERI 10: KEAMANAN WI-FI PUBLIK, SNIFFING & MITM
        if (p.includes('wifi') || p.includes('wi-fi') || p.includes('publik') || p.includes('sniffing') || p.includes('mitm') || p.includes('man in the middle') || p.includes('hotspot') || p.includes('sadap')) {
            let reply = `### 🔒 Mengapa Jaringan Wi-Fi Publik Berbahaya?\n\n`;
            reply += `Jaringan Wi-Fi publik gratis (di kafe, bandara, atau taman kota) sering kali merupakan jaringan terbuka (*Open Network*) tanpa enkripsi lalu lintas data.\n\n`;
            reply += `**Potensi Ancaman di Wi-Fi Publik:**\n`;
            reply += `1. **Packet Sniffing (Penyadapan Paket):**\n`;
            reply += `   Peretas di ruangan yang sama dapat menggunakan aplikasi sniffer (seperti Wireshark) untuk merekam semua paket data yang melayang di udara dari gawai kamu.\n\n`;
            reply += `2. **Man-in-the-Middle (MITM):**\n`;
            reply += `   Peretas menyusup di antara perangkat kamu dan router internet, sehingga dapat membaca dan bahkan mengubah data yang kamu kirimkan.\n\n`;
            reply += `3. **Hotspot Palsu (Evil Twin):**\n`;
            reply += `   Peretas membuat Wi-Fi tiruan dengan nama mirip (misal: *"Free_Cafe_Wifi"*). Saat kamu tersambung, seluruh aktivitas internetmu langsung dipantau oleh peretas.\n\n`;
            reply += `💡 **Miskonsepsi Siswa:**\n`;
            reply += `Mengunci gawai dengan sensor sidik jari (*fingerprint*) atau PIN layar **TIDAK melindungi data** yang sedang melintas di jaringan Wi-Fi publik!\n\n`;
            reply += `🛡️ **Cara Aman Menggunakan Wi-Fi Publik:**\n`;
            reply += `- Selalu aktifkan **VPN (Virtual Private Network)** terpercaya untuk mengenkripsi terowongan data.\n`;
            reply += `- Pastikan alamat web menggunakan protokol gembok hijau aman **\`https://\`** (bukan \`http://\`).\n`;
            reply += `- Hindari membuka aplikasi perbankan atau berbelanja online saat terhubung ke Wi-Fi publik terbuka.`;
            return reply;
        }

        // 🧱 MATERI 11: FIREWALL & KEAMANAN JARINGAN
        if (p.includes('firewall') || p.includes('dinding api') || p.includes('filter paket') || p.includes('penyaring')) {
            let reply = `### 🧱 Apa Fungsi Firewall dalam Keamanan Komputer?\n\n`;
            reply += `**Firewall** adalah sistem keamanan jaringan yang bertindak sebagai dinding pertahanan antara jaringan internal tepercaya (komputermu/jaringan sekolah) dan jaringan luar yang tidak tepercaya (internet publik).\n\n`;
            reply += `**Cara Kerja Firewall:**\n`;
            reply += `Firewall memeriksa setiap paket data yang masuk (*inbound*) dan keluar (*outbound*) berdasarkan aturan keamanan (*security rules*):\n`;
            reply += `1. **Penyaringan Berdasarkan Port:** Membuka port layanan yang sah (misal port 80 untuk HTTP, port 443 untuk HTTPS) dan menutup port berisiko tinggi.\n`;
            reply += `2. **Penyaringan Berdasarkan Alamat IP:** Memblokir alamat IP yang dikenal sebagai sumber serangan siber atau spam.\n`;
            reply += `3. **Mencegah Akses Tak Diizinkan:** Menolak upaya peretas luar yang ingin memindai (*scanning*) atau menyusup ke dalam komputermu.\n\n`;
            reply += `💡 *Firewall dapat berupa perangkat lunak (seperti Windows Defender Firewall) maupun perangkat keras khusus di ruang server.*`;
            return reply;
        }

        // 💻 MATERI 12: MALWARE (VIRUS, TROJAN, RANSOMWARE, SPYWARE, WORM)
        if (p.includes('malware') || p.includes('virus') || p.includes('trojan') || p.includes('ransomware') || p.includes('spyware') || p.includes('worm') || p.includes('keylogger')) {
            let reply = `### 💻 Mengenal Jenis-Jenis Malware (Perangkat Lunak Berbahaya)\n\n`;
            reply += `**Malware** singkatan dari *Malicious Software*, yaitu semua program komputer yang sengaja diciptakan untuk merusak, mengganggu, atau menyusup ke sistem digital.\n\n`;
            reply += `**4 Jenis Malware Paling Berbahaya:**\n\n`;
            reply += `1. **Ransomware:**\n`;
            reply += `   Malware yang mengunci dan mengenkripsi seluruh file penting di komputer korban. Korban tidak bisa membuka dokumen mereka kecuali membayar sejumlah uang tebusan (*ransom*) kepada penjahat siber.\n\n`;
            reply += `2. **Trojan Horse (Kuda Troya):**\n`;
            reply += `   Malware yang menyamar sebagai aplikasi bermanfaat (game gratis, software bajakan, atau file undangan), namun diam-diam membuka jalan belakang (*backdoor*) untuk kendali peretas.\n\n`;
            reply += `3. **Spyware & Keylogger:**\n`;
            reply += `   Program mata-mata yang merekam ketikan keyboard pengguna (termasuk kata sandi akun dan nomor kartu) dan mengirimkannya diam-diam ke server peretas.\n\n`;
            reply += `4. **Worm (Cacing Komputer):**\n`;
            reply += `   Malware mandiri yang mampu menggandakan dirinya sendiri dan menyebar secara otomatis melalui jaringan tanpa memerlukan bantuan klik dari pengguna.`;
            return reply;
        }

        // 🔑 MATERI 13: TIPS PASSWORD KUAT & 2FA
        if (p.includes('password') || p.includes('kata sandi') || p.includes('sandi') || hasWord(p, '2fa') || hasWord(p, 'mfa') || p.includes('autentikasi') || p.includes('brute force')) {
            let reply = `### 🔑 Tips Membuat Kata Sandi (Password) Kuat & Aman\n\n`;
            reply += `Kata sandi adalah kunci pintu gerbang identitas digitalmu. Hindari serangan *Brute-Force* dan *Dictionary Attack* dengan tips berikut:\n\n`;
            reply += `**Standar Kata Sandi Kuat:**\n`;
            reply += `1. **Panjang Minimal 12-16 Karakter:** Semakin panjang kata sandi, semakin mustahil dipecahkan oleh komputer super penyerang.\n`;
            reply += `2. **Kombinasi 4 Elemen:** Huruf Besar (A-Z), Huruf Kecil (a-z), Angka (0-9), dan Simbol Unik (\`! @ # $ % ^ & *\`).\n`;
            reply += `3. **Gunakan Metode Passphrase:** Gabungkan beberapa kata acak yang mudah diingat kamu tetapi mustahil ditebak orang lain. Contoh: \`Kucing4OrenSukaM4kanDonat!\`\n`;
            reply += `4. ❌ **Hindari Data Pribadi:** Jangan pakai tanggal lahir, nama sendiri, nama pacar, nama hewan peliharaan, atau urutan keyboard (\`123456\`, \`qwerty\`).\n\n`;
            reply += `🛡️ **Wajib Aktifkan 2FA (Two-Factor Authentication):**\n`;
            reply += `2FA menambahkan lapisan keamanan kedua. Sekalipun kata sandimu bocor, akunmu tetap aman karena penyerang tidak memiliki kode autentikasi dari ponselmu!`;
            return reply;
        }

        // ⚖️ MATERI 14: PRINSIP KEAMANAN INFORMASI (CIA-A TRIAD)
        if (hasWord(p, 'cia') || p.includes('triad') || p.includes('confidentiality') || p.includes('integrity') || p.includes('availability') || p.includes('kerahasiaan') || p.includes('keutuhan') || p.includes('ketersediaan')) {
            let reply = `### ⚖️ Fondasi Keamanan Informasi: Prinsip CIA Triad\n\n`;
            reply += `Dalam standar keamanan siber internasional, keamanan data diukur dari tiga pilar utama (*CIA Triad*):\n\n`;
            reply += `1. **C — Confidentiality (Kerahasiaan):**\n`;
            reply += `   Menjamin bahwa data dan informasi hanya dapat diakses oleh pihak yang sah dan berwenang. Diimplementasikan melalui enkripsi data (seperti HTTPS dan SSL/TLS) serta pembatasan hak akses (*Access Control*).\n\n`;
            reply += `2. **I — Integrity (Keutuhan):**\n`;
            reply += `   Menjamin bahwa data tetap asli, akurat, dan tidak diubah, dimanipulasi, atau disisipi data palsu saat disimpan maupun ditransmisikan. Diimplementasikan melalui fungsi *Checksum* dan *Hash Cryptography*.\n\n`;
            reply += `3. **A — Availability (Ketersediaan):**\n`;
            reply += `   Menjamin bahwa sistem, jaringan, dan data selalu siap diakses kapan pun dibutuhkan oleh pengguna yang berhak. Diimplementasikan melalui redundansi server, cadangan daya (UPS), dan mitigasi serangan DDoS.\n\n`;
            reply += `💡 *Ditambah pilar ke-4:* **Authentication** (memastikan keaslian identitas pengguna melalui password, PIN, atau biometrik).`;
            return reply;
        }

        // 🖧 MATERI 15: TOPOLOGI JARINGAN & MEDIA TRANSMISI
        if (p.includes('topologi') || p.includes('star') || p.includes('bintang') || hasWord(p, 'bus') || hasWord(p, 'ring') || hasWord(p, 'mesh') || p.includes('kabel utp') || p.includes('fiber optic') || p.includes('serat optik') || p.includes('media transmisi')) {
            let reply = `### 🖧 Topologi Jaringan & Media Transmisi Komputer\n\n`;
            reply += `**Topologi Jaringan Terpopuler:**\n`;
            reply += `1. **Topologi Star (Bintang):**\n`;
            reply += `   Semua komputer terhubung langsung ke satu perangkat pusat (**Switch**). Kelebihan: Jika satu kabel komputer putus, komputer lain tetap berjalan normal. Ini topologi standar di lab komputer sekolah.\n\n`;
            reply += `2. **Topologi Bus:**\n`;
            reply += `   Menggunakan satu kabel utama (*backbone*). Kekurangan: Jika kabel utama putus, seluruh jaringan langsung mati total.\n\n`;
            reply += `3. **Topologi Mesh:**\n`;
            reply += `   Setiap perangkat terhubung ke setiap perangkat lainnya. Sangat redundan dan aman, tetapi membutuhkan biaya kabel yang sangat mahal.\n\n`;
            reply += `**Media Transmisi Data:**\n`;
            reply += `- **Kabel UTP (Unshielded Twisted Pair):** Menggunakan tembaga dengan konektor RJ-45. Jarak maksimal 100 meter, murah dan mudah dipasang di ruangan.\n`;
            reply += `- **Fiber Optic (Serat Optik):** Mengirimkan data berupa denyut **cahaya** melalui serat kaca bening. Kecepatan sangat tinggi, jangkauan puluhan kilometer, dan kebal dari sambaran petir serta interferensi elektromagnetik.`;
            return reply;
        }

        // 🧠 MATERI 16: BERPIKIR KOMPUTASIONAL & STRUKTUR DATA
        if (p.includes('komputasional') || p.includes('dekomposisi') || p.includes('abstraksi') || p.includes('pengenalan pola') || p.includes('struktur data') || p.includes('stack') || p.includes('queue') || p.includes('tree') || p.includes('graph')) {
            let reply = `### 🧠 Berpikir Komputasional (Computational Thinking)\n\n`;
            reply += `Berpikir komputasional adalah metode memecahkan masalah kompleks secara logis dan terstruktur:\n\n`;
            reply += `**4 Fondasi Utama:**\n`;
            reply += `1. **Dekomposisi:** Memecah masalah besar menjadi bagian-bagian kecil yang lebih mudah dikelola.\n`;
            reply += `2. **Pengenalan Pola (Pattern Recognition):** Menemukan kesamaan atau pola berulang dari masalah sebelumnya.\n`;
            reply += `3. **Abstraksi:** Memilah informasi penting dan mengabaikan detail-detail yang tidak relevan.\n`;
            reply += `4. **Perancangan Algoritma:** Menyusun instruksi langkah demi langkah yang logis untuk menyelesaikan masalah.\n\n`;
            reply += `**Struktur Data Dasar:**\n`;
            reply += `- **Stack (Tumpukan - LIFO):** *Last In, First Out* — elemen terakhir yang masuk adalah yang pertama keluar (seperti fitur *Undo* di Word atau tumpukan piring).\n`;
            reply += `- **Queue (Antrian - FIFO):** *First In, First Out* — elemen pertama yang datang adalah yang pertama dilayani (seperti antrian loket tiket).\n`;
            reply += `- **Tree (Pohon):** Struktur hierarki bercabang dari Root (akar) ke daun (seperti struktur folder direktori di Windows Explorer).\n`;
            reply += `- **Graph (Graf):** Kumpulan simpul (*node*) yang dihubungkan oleh jalur (*edge*), seperti peta rute Google Maps dan jaringan pertemanan media sosial.`;
            return reply;
        }

        // 🔄 MATERI 17: ALGORITMA SORTING & SEARCHING
        if (p.includes('sorting') || p.includes('searching') || p.includes('pengurutan') || p.includes('pencarian') || p.includes('bubble sort') || p.includes('selection sort') || p.includes('insertion sort') || p.includes('linear search') || p.includes('binary search')) {
            let reply = `### 🔄 Algoritma Pengurutan (Sorting) & Pencarian (Searching)\n\n`;
            reply += `Materi ini dipelajari mendalam di **Ruang Belajar Topik 3: Algoritma Sorting & Searching**.\n\n`;
            reply += `**1. Algoritma Pencarian (Searching):**\n`;
            reply += `- **Linear Search (Pencarian Berurutan):** Memeriksa data satu per satu dari awal sampai akhir. Bekerja pada data acak/tidak terurut, namun lambat untuk jutaan data.\n`;
            reply += `- **Binary Search (Pencarian Biner / Bagi Dua):** Mencari data dengan membagi rentang menjadi dua bagian secara berulang. **Syarat Mutlak:** Data wajib sudah terurut (*sorted*) terlebih dahulu! Jauh lebih efisien.\n\n`;
            reply += `**2. Algoritma Pengurutan (Sorting):**\n`;
            reply += `- **Bubble Sort (Gelembung):** Membandingkan dua elemen yang bersebelahan dan menukarnya (*swap*) jika urutannya salah, hingga angka terbesar 'mengapung' ke posisi akhir.\n`;
            reply += `- **Selection Sort:** Mencari elemen terkecil dalam array dan menempatkannya di posisi pertama, diulang untuk sisa array.\n`;
            reply += `- **Insertion Sort:** Menyisipkan elemen satu per satu ke posisi yang tepat seperti menyusun kartu remi di tangan.`;
            return reply;
        }

        // 💻 MATERI 18: PEMROGRAMAN, FLOWCHART & PSEUDOCODE
        if (p.includes('pemrograman') || p.includes('coding') || p.includes('pseudocode') || p.includes('flowchart') || p.includes('diagram alir') || p.includes('variabel') || p.includes('tipe data') || p.includes('percabangan') || p.includes('perulangan') || p.includes('looping') || p.includes('python') || p.includes('scratch')) {
            let reply = `### 💻 Algoritma, Flowchart & Dasar Pemrograman (AP)\n\n`;
            reply += `**Cara Menyajikan Algoritma:**\n`;
            reply += `1. **Flowchart (Diagram Alir):** Simbol grafis alur kerja:\n`;
            reply += `   - **Oval:** Terminator (Mulai/Selesai)\n`;
            reply += `   - **Persegi Panjang:** Proses (Hitungan / Deklarasi)\n`;
            reply += `   - **Belah Ketupat:** Keputusan / Kondisi Logika (*Decision*)\n`;
            reply += `   - **Jajar Genjang:** Input data dari keyboard atau Output data ke layar\n\n`;
            reply += `2. **Pseudocode (Kode Semu):** Teks instruksi terstruktur menyerupai bahasa pemrograman (\`INPUT\`, \`IF\`, \`ELSE\`, \`FOR\`, \`PRINT\`).\n\n`;
            reply += `**Konsep Kunci Pemrograman:**\n`;
            reply += `- **Variabel:** Wadah penyimpanan nilai di memori yang isinya dapat berubah.\n`;
            reply += `- **Tipe Data:** \`Integer\` (angka bulat), \`Float\` (angka desimal), \`String\` (teks), \`Boolean\` (True/False).\n`;
            reply += `- **Struktur Kontrol:** Percabangan (\`IF-ELSE\`) dan Perulangan (\`FOR\`, \`WHILE\`).`;
            return reply;
        }

        // ⚖️ MATERI 19: ETIKA DIGITAL, UU ITE, UU PDP, NETIKET & INTEGRITAS AKADEMIK
        if (p.includes('dsi') || p.includes('etika') || p.includes('netiket') || p.includes('uu ite') || p.includes('ite') || p.includes('pdp') || p.includes('data pribadi') || p.includes('jejak digital') || p.includes('digital footprint') || p.includes('cyberbullying') || p.includes('doxing') || p.includes('hate speech') || p.includes('ujaran kebencian') || p.includes('hak cipta') || p.includes('haki') || p.includes('lisensi') || p.includes('deepfake') || p.includes('plagiarisme') || p.includes('integritas') || p.includes('saring sebelum sharing')) {
            let reply = `### ⚖️ Etika Digital, Hukum Siber (UU ITE & UU PDP) & Integritas Akademik\n\n`;
            reply += `Informatika tidak hanya mempelajari perangkat teknis, melainkan norma perilaku, hukum digital, dan tanggung jawab moral di ruang siber.\n\n`;
            reply += `**Pilar Utama Etika Digital & Hukum Informatika:**\n\n`;
            reply += `1. **📜 Regulasi Hukum Siber di Indonesia:**\n`;
            reply += `   - **UU ITE (UU No. 11/2008 & Revisi UU No. 1/2024):** Melarang penyebaran berita bohong/hoaks (Pasal 28), pencemaran nama baik & penghinaan (Pasal 27 ayat 3), serta akses ilegal/peretasan akun orang lain (Pasal 30). Pelanggaran dapat dikenakan hukuman penjara dan denda miliaran rupiah.\n`;
            reply += `   - **UU Pelindungan Data Pribadi (UU PDP No. 27/2022):** Menjamin hak privasi setiap warga negara. Membedakan **Data Pribadi Umum** (nama lengkap, jenis kelamin, kewarganegaraan) dan **Data Pribadi Spesifik** (data kesehatan, biometrik sidik jari/wajah, catatan keuangan). Dilarang menyebarkan data pribadi orang lain tanpa izin (*Anti-Doxing*)!\n\n`;
            reply += `2. **👣 Jejak Digital (Digital Footprint):**\n`;
            reply += `   - **Jejak Aktif:** Postingan status, komentar di media sosial, foto/video yang diunggah, dan pesan di forum online.\n`;
            reply += `   - **Jejak Pasif:** Riwayat pencarian Google, data *cookies* peramban, log alamat IP, dan lokasi GPS yang terekam otomatis.\n`;
            reply += `   - *Ingat:* Jejak digital bersifat abadi (*permanent*) dan kerap diperiksa dalam seleksi beasiswa kuliah serta rekrutmen dunia kerja di masa depan!\n\n`;
            reply += `3. **🤝 Netiket & Etika Berinteraksi Daring:**\n`;
            reply += `   - Gunakan bahasa yang santun saat berkomunikasi dengan guru atau rekan di grup WhatsApp dan email resmi.\n`;
            reply += `   - Hindari penggunaan HURUF KAPITAL SEMUA karena diartikan sebagai berteriak/membentak (*shouting*).\n`;
            reply += `   - Tolak perilaku *Cyberbullying*, provokasi (*flaming*), dan penyebaran konten kebencian.\n\n`;
            reply += `4. **🎓 Etika Pemanfaatan AI & Integritas Akademik:**\n`;
            reply += `   - AI (seperti Gemini, ChatGPT, Claude) harus digunakan sebagai **mitra belajar dan partner diskusi konsep**, BUKAN untuk menyalin tugas sekolah secara mentah-mentah (*copy-paste plagiarism*).\n`;
            reply += `   - Selalu lakukan verifikasi kebenaran fakta terhadap jawaban AI (*check for hallucinations*) dan cantumkan atribusi referensi secara jujur.\n\n`;
            reply += `5. **🛡️ Hak Cipta & Lisensi Perangkat Lunak:**\n`;
            reply += `   - **Open Source (GPL, MIT, Apache):** Kode sumber terbuka, bebas dipelajari, dimodifikasi, dan didistribusikan ulang (contoh: Linux, Python, Blender).\n`;
            reply += `   - **Proprietary/Komersial:** Memiliki hak cipta ketat dan memerlukan pembelian lisensi resmi (contoh: Windows OS, Adobe Creative Suite). Dilarang membajak software!\n`;
            reply += `   - **Creative Commons (CC):** Standar lisensi konten digital (teks/gambar/musik) yang memberi izin penggunaan wajar dengan mencantumkan atribusi pembuat karya.`;
            return reply;
        }

        // ☁️ MATERI 20: CLOUD COMPUTING (KOMPUTASI AWAN)
        if (p.includes('cloud') || p.includes('komputasi awan') || p.includes('google drive') || p.includes('onedrive') || hasWord(p, 'saas') || hasWord(p, 'iaas') || hasWord(p, 'paas') || hasWord(p, 'aws') || p.includes('azure')) {
            let reply = `### ☁️ Cloud Computing (Komputasi Awan)\n\n`;
            reply += `**Cloud Computing** adalah penyediaan sumber daya komputasi (server, media penyimpanan file, basis data, jaringan, dan software) yang diakses melalui jaringan **Internet** secara fleksibel sesuai kebutuhan (*on-demand*).\n\n`;
            reply += `**3 Model Layanan Cloud Computing:**\n`;
            reply += `1. **SaaS (Software as a Service):** Pengguna langsung memakai aplikasi siap saji melalui peramban tanpa perlu instalasi. Contoh: Google Docs, Microsoft Office 365, Canva, Gmail.\n`;
            reply += `2. **PaaS (Platform as a Service):** Menyediakan lingkungan terpadu untuk pengembang membangun dan menguji aplikasi. Contoh: Google App Engine, Firebase, Heroku.\n`;
            reply += `3. **IaaS (Infrastructure as a Service):** Menyediakan infrastruktur dasar seperti server virtual, kapasitas penyimpanan, dan jaringan. Contoh: Amazon Web Services (AWS), Google Cloud Platform (GCP), Microsoft Azure.\n\n`;
            reply += `**Manfaat Nyata bagi Siswa & Sekolah:**\n`;
            reply += `- **Kolaborasi Real-Time:** Mengetik tugas kelompok bersamaan dalam satu dokumen tanpa konflik versi.\n`;
            reply += `- **Penyimpanan Terpusat:** File tersimpan aman di cloud (Google Drive / OneDrive) dan dapat dibuka dari ponsel maupun laptop mana pun.\n`;
            reply += `- **Pencadangan Otomatis (Auto-Backup):** Data terlindungi dari risiko flashdisk hilang atau harddisk laptop rusak.`;
            return reply;
        }

        // 🤖 MATERI 21: KECERDASAN BUATAN (AI), MACHINE LEARNING, LLM & PROMPT ENGINEERING
        if (hasWord(p, 'ai') || p.includes('kecerdasan buatan') || p.includes('artificial intelligence') || p.includes('machine learning') || p.includes('deep learning') || p.includes('neural network') || hasWord(p, 'llm') || p.includes('large language model') || p.includes('chatgpt') || p.includes('gemini') || p.includes('nemotron') || p.includes('claude') || p.includes('generative ai') || p.includes('gen ai') || p.includes('computer vision') || hasWord(p, 'nlp') || p.includes('prompt')) {
            let reply = `### 🤖 Kecerdasan Buatan (Artificial Intelligence / AI) & Pembelajaran Mesin\n\n`;
            reply += `**Kecerdasan Buatan (AI)** adalah cabang ilmu komputer yang merancang sistem dan mesin agar mampu meniru kemampuan kognitif manusia, seperti belajar (*learning*), bernalar (*reasoning*), memecahkan masalah (*problem solving*), dan memahami bahasa manusia (*NLP*).\n\n`;
            reply += `**1. Tingkatan Klasifikasi AI:**\n`;
            reply += `- **Narrow AI (ANI / AI Lemah):** AI spesifik yang dirancang untuk satu tugas tertentu. Contoh: AI pengenal wajah, algoritma rekomendasi YouTube, ChatGPT, dan asisten kuis ini. Seluruh AI saat ini berada di tahap ini!\n`;
            reply += `- **General AI (AGI / AI Kuat):** AI hipotesis di masa depan yang memiliki kecerdasan setara dengan akal budi manusia di segala bidang intelektual.\n`;
            reply += `- **Super AI (ASI):** AI yang kecerdasannya jauh melampaui seluruh kapasitas gabungan otak manusia terbaik di bumi.\n\n`;
            reply += `**2. Cabang Utama: Machine Learning & Deep Learning:**\n`;
            reply += `- **Supervised Learning (Terbimbing):** Model dilatih menggunakan data berlabel (*input + jawaban benar*). Contoh: Membedakan email spam vs bukan spam, diagnosis medis.\n`;
            reply += `- **Unsupervised Learning (Mandiri):** Model mencari pola tersembunyi sendiri dari data mentah tanpa label. Contoh: Pengelompokan selera pelanggan (*clustering*).\n`;
            reply += `- **Reinforcement Learning (Penguatan):** Model belajar melalui uji coba (*trial and error*) berdasarkan sistem hadiah (*reward*) dan penalti (*penalty*). Contoh: AI bermain catur (AlphaZero), mobil otonom.\n`;
            reply += `- **Deep Learning & Jaringan Saraf Tiruan (Neural Networks):** Terinspirasi oleh susunan neuron otak manusia dengan lapisan *Input Layer*, *Hidden Layers*, dan *Output Layer* untuk memproses data berdimensi tinggi seperti foto, video, dan suara.\n\n`;
            reply += `**3. Generative AI & Large Language Models (LLM):**\n`;
            reply += `- LLM (seperti Google Gemini, ChatGPT, Nemotron, Llama) dilatih pada triliunan kata untuk memprediksi token/kata berikutnya yang paling masuk akal secara probabilistik (*next-token prediction*).\n`;
            reply += `- Mampu merangkum teks, menerjemahkan bahasa, menganalisis data, dan berdialog secara kontekstual.\n\n`;
            reply += `**4. Seni Prompt Engineering untuk Pelajar:**\n`;
            reply += `Agar AI memberikan jawaban yang akurat dan berkualitas tinggi, gunakan rumus **R-C-T-C-O**:\n`;
            reply += `- **Role (Peran):** *"Bertindaklah sebagai guru Informatika SMA yang ramah..."*\n`;
            reply += `- **Context (Konteks):** *"Saya sedang belajar konsep topologi jaringan komputer Fase E..."*\n`;
            reply += `- **Task (Tugas):** *"Jelaskan perbedaan mendasar antara Switch dan Hub..."*\n`;
            reply += `- **Constraint (Batasan):** *"Gunakan bahasa sederhana dan berikan 2 analogi kehidupan nyata..."*\n`;
            reply += `- **Output (Format):** *"Sajikan dalam bentuk tabel perbandingan ringkas."*`;
            return reply;
        }

        // 🌐 MATERI 22: TEKNOLOGI TERKINI (IOT, 5G/6G, STARLINK, KUANTUM & KEAMANAN MODERN)
        if (hasWord(p, 'iot') || p.includes('internet of things') || p.includes('smart home') || p.includes('smart city') || p.includes('sensor') || p.includes('arduino') || p.includes('raspberry') || hasWord(p, '5g') || hasWord(p, '6g') || p.includes('starlink') || p.includes('satelit') || p.includes('quantum') || p.includes('kuantum') || p.includes('edge computing') || hasWord(p, 'gpu') || hasWord(p, 'npu') || hasWord(p, 'nosql') || p.includes('big data')) {
            let reply = `### 🌐 Eksplorasi Teknologi Terkini & Masa Depan Digital\n\n`;
            reply += `Dunia teknologi berkembang pesat melampaui komputer personal konvensional. Berikut inovasi mutakhir yang membentuk peradaban modern:\n\n`;
            reply += `1. **🏠 Internet of Things (IoT):**\n`;
            reply += `   Jaringan benda-benda fisik yang ditanami sensor, mikrokontroler (seperti Arduino atau ESP32), aktuator, dan konektivitas internet agar dapat mengumpulkan serta bertukar data secara otomatis.\n`;
            reply += `   - *Contoh Nyata:* Rumah pintar (*Smart Home* lampu otomatis nyala dari HP), pertanian cerdas (*Smart Farming* sensor kelembapan tanah menyiram tanaman sendiri), dan pemantau lalu lintas kota (*Smart City*).\n\n`;
            reply += `2. **🚀 Konektivitas Generasi Baru (5G, 6G & Satelit Starlink):**\n`;
            reply += `   - **5G / 6G:** Memberikan kecepatan gigabit per detik dengan latensi ultra rendah (*ultra-low latency* < 1 ms), memungkinkan operasi bedah jarak jauh dan mobil tanpa sopir (*autonomous vehicles*).\n`;
            reply += `   - **Satelit Orbit Rendah (LEO - Starlink):** Menghubungkan internet pita lebar berkecepatan tinggi ke daerah pelosok dan kepulauan terpencil tanpa memerlukan kabel darat.\n\n`;
            reply += `3. **⚛️ Komputasi Kuantum (Quantum Computing):**\n`;
            reply += `   Jika komputer klasik menggunakan **Bit** (bernilai 0 atau 1), komputer kuantum memanfaatkan **Qubit (Quantum Bit)** yang berkat fenomena *superposisi* dan *entanglement* dapat bernilai 0 dan 1 secara bersamaan. Mampu memecahkan simulasi molekul obat baru dan kalkulasi kriptografi super rumit dalam hitungan detik!\n\n`;
            reply += `4. **⚡ Hardware Akselerator AI (GPU & NPU):**\n`;
            reply += `   - **CPU:** Ahli menjalankan instruksi serial berurutan yang bervariasi.\n`;
            reply += `   - **GPU (Graphics Processing Unit):** Memiliki ribuan inti untuk memproses komputasi matriks paralel secara masif (grafis game 3D dan pelatihan AI).\n`;
            reply += `   - **NPU (Neural Processing Unit):** Chip khusus pada smartphone dan laptop modern yang dirancang murni untuk menjalankan tugas inferensi kecerdasan buatan dengan konsumsi baterai sangat hemat.\n\n`;
            reply += `5. **📊 Big Data & Basis Data Modern (SQL vs NoSQL):**\n`;
            reply += `   - **SQL (Relasional):** Tabel dengan skema terstruktur, baris, dan kolom (PostgreSQL, MySQL). Bagus untuk data keuangan dan akademik.\n`;
            reply += `   - **NoSQL (Non-Relasional):** Dokumen JSON atau pasangan key-value yang fleksibel tanpa skema kaku (MongoDB, Firebase). Bagus untuk data chat real-time dan media sosial berkapasitas raksasa (*Volume, Velocity, Variety*).`;
            return reply;
        }

        // 💡 MATERI 23: SMART GENERAL TECH & INFORMATICS SYNTHESIZER
        const itGeneralKeywords = [
            'komputer', 'laptop', 'pc', 'aplikasi', 'software', 'program', 'internet', 'file', 'berkas', 
            'folder', 'data', 'teknologi', 'memori', 'layar', 'mouse', 'keyboard', 'printer', 'flashdisk',
            'bit', 'byte', 'server', 'database', 'basis data', 'coding', 'algoritma', 'jaringan', 'siber', 
            'digital', 'gadget', 'gawai', 'kecepatan', 'bandwidth', 'kuota', 'hosting', 'domain', 'web', 'situs',
            'informasi', 'informatika', 'tik', 'elektronik', 'chipset', 'prosesor', 'processor', 'baterai',
            'kamera', 'bluetooth', 'port', 'usb', 'display', 'amoled', 'oled', 'lcd', 'robot', 'otomasi',
            'antarmuka', 'interface', 'koneksi', 'protokol', 'arsitektur', 'operating system', 'os', 'telekomunikasi'
        ];

        const matchesGeneralIt = itGeneralKeywords.some(k => p.includes(k));
        if (matchesGeneralIt) {
            let reply = `### 💡 Eksplorasi Konsep Informatika & Sains Teknologi Digital\n\n`;
            reply += `Pertanyaanmu mengenai **"${escapeHtml(userPrompt)}"** adalah topik yang sangat menarik dan beririsan langsung dengan disiplin ilmu **Informatika dan Teknologi Digital**!\n\n`;
            reply += `**Tinjauan Konseptual (Kurikulum Informatika Fase E SMAN 4 Padang):**\n\n`;
            reply += `1. **Peran & Relevansi Teknologi:**\n`;
            reply += `   Setiap perangkat, protokol, atau sistem digital dirancang untuk memecahkan masalah efisiensi manusia: memproses input data secara cepat, menyimpannya secara andal, dan mendistribusikan informasi secara aman melalui jaringan.\n\n`;
            reply += `2. **Keterkaitan dengan Elemen Informatika:**\n`;
            reply += `   - **Sistem Komputer (SK):** Bagaimana interaksi perangkat keras (*hardware*), sirkuit mikro, dan instruksi mesin mengeksekusi tugas tersebut.\n`;
            reply += `   - **Jaringan Komputer & Internet (JKI):** Jalur transmisi komunikasi, protokol pertukaran data, dan perlindungan enkripsinya.\n`;
            reply += `   - **Teknologi Informasi & Komunikasi (TIK):** Integrasi fungsional ke dalam aplikasi produktivitas dan antarmuka pengguna (*UI/UX*).\n`;
            reply += `   - **Dampak Sosial Informatika (DSI):** Aspek etika, hukum perlindungan data (*UU PDP*), dan jejak digital yang dihasilkan.\n\n`;
            reply += `💡 **Ingin Memperdalam Aspek Tertentu?**\n`;
            reply += `Kamu dapat menanyakan aspek lebih spesifik (misalnya: *"Bagaimana cara kerja teknologi ini di balik layar?"*, *"Apa kelebihan dan kekurangannya?"*, atau *"Bagaimana keterkaitannya dengan materi kuis?"*). Tetap semangat menggali ilmu pengetahuan! 🌟🚀`;
            return reply;
        }

        // 👋 SAPAAN RAMAH / PERKENALAN
        if (p.includes('halo') || p.includes('hai') || p.includes('pagi') || p.includes('siang') || p.includes('sore') || p.includes('malam') || p.includes('assalam') || p.includes('bisa apa') || p.includes('bantuan') || p.includes('menu')) {
            return `Halo! Saya **Asisten Belajar Siswa** untuk mata pelajaran Informatika Fase E SMAN 4 Padang 🎓✨\n\n` +
                   `Saya siap membantumu memahami materi pembelajaran kuis dan persiapan asesmen:\n` +
                   `- 📊 **Microsoft Office & TIK:** Pengenalan Ms Office, Word, Excel (rumus IF, VLOOKUP), PowerPoint, dan Mail Merge.\n` +
                   `- 🕵️ **Literasi Digital & Cek Fakta:** Trik mengenali hoaks, domain resmi (.go.id), dan reverse image search.\n` +
                   `- 🌐 **Infrastruktur Jaringan:** Perbedaan Hub vs Switch vs Router, topologi, dan kabel UTP vs Fiber Optic.\n` +
                   `- 🛡️ **Keamanan Digital:** Bahaya Wi-Fi publik, modus penipuan phishing APK, Firewall, dan tips password kuat.\n` +
                   `- 🧠 **Berpikir Komputasional & Algoritma:** Logika pemecahan masalah, struktur data, sorting, dan pseudocode.\n\n` +
                   `Silakan pilih topik di atas atau ketik pertanyaan materi yang ingin kamu pelajari! 🚀`;
        }

        // 📚 FALLBACK RESPON EDUKATIF CERDAS
        return `### 📖 Asisten Belajar Informatika Siswa\n\n` +
               `Pertanyaanmu sangat menarik! Sebagai asisten belajar, fokus utama saya adalah membantu pemahaman konsep materi pembelajaran Informatika Fase E.\n\n` +
               `Kamu bisa mengeksplorasi konsep-konsep kunci berikut:\n` +
               `- 📊 *"Apa itu Microsoft Office dan fungsi aplikasi di dalamnya?"*\n` +
               `- 📈 *"Bagaimana rumus IF bertingkat dan VLOOKUP di Excel?"*\n` +
               `- 📝 *"Bagaimana cara membuat Mail Merge otomatis di Word?"*\n` +
               `- 🕵️ *"Bagaimana cara cek keaslian foto berita dengan Google Lens?"*\n` +
               `- 🌐 *"Mengapa Switch lebih efisien daripada Hub dalam jaringan LAN?"*\n` +
               `- 🔒 *"Apa itu serangan Man-in-the-Middle di Wi-Fi publik?"*\n` +
               `- 🛡️ *"Bagaimana cara kerja Ransomware dan cara mencegahnya?"*\n` +
               `- 🧱 *"Apa peran Firewall dalam melindungi komputer sekolah?"*\n` +
               `- 🔑 *"Bagaimana cara membuat kata sandi yang tidak mudah ditebak peretas?"*\n\n` +
               `*Ketik pertanyaan spesifik mengenai materi di atas ya! Semangat belajarnya!* 🌟`;
    }

    // 👩‍🏫 6. ENGINE RESPON ASISTEN GURU (ANALISIS EMPIRIS REKAPITULASI & PERFORMA SISWA)
    function generateTeacherAiResponse(userPrompt) {
        const ctx = getLiveTeacherContext();
        const p = userPrompt.toLowerCase().trim();
        const targetClass = parseClassFromQuery(p);

        // 1. PERTANYAAN TENTANG NILAI TERTINGGI / TERENDAH (GURU MODE BEBAS ANALISIS)
        if (p.includes('tertinggi') || p.includes('terendah') || p.includes('ranking') || p.includes('juara') || p.includes('rekor') || p.includes('paling rendah') || p.includes('paling tinggi')) {
            const isLowest = p.includes('terendah') || p.includes('paling rendah') || p.includes('kecil') || p.includes('jelek') || p.includes('buruk');
            const isHighest = !isLowest;

            if (targetClass) {
                const c = ctx.classStats[targetClass];
                if (!c) return `Mohon maaf Ibu Guru, data untuk kelas **${targetClass}** belum tersedia.`;

                const topOrBot = isHighest ? 'Tertinggi' : 'Terendah';
                const emoji = isHighest ? '🏆' : '⚠️';

                let reply = `### ${emoji} Analisis Nilai ${topOrBot} — Kelas ${targetClass}\n\n`;
                reply += `Berikut ringkasan capaian nilai siswa di kelas **${targetClass}**:\n\n`;

                // Kuis 1 (Detektif Fakta)
                reply += `**1. Kuis Detektif Fakta (Literasi Digital):**\n`;
                if (c.doneFakta.length > 0) {
                    const score = isHighest ? c.highestFakta : c.lowestFakta;
                    const students = isHighest ? c.topStudentsFakta : c.bottomStudentsFakta;
                    reply += `- **Nilai ${topOrBot}:** \`${score}\`\n`;
                    reply += `- **Siswa (${students.length} orang):** ${students.map(s => `**${s.name}**`).join(', ')}\n\n`;
                } else {
                    reply += `*(Belum ada siswa kelas ${targetClass} yang mengerjakan Kuis 1)*\n\n`;
                }

                // Kuis 2 (Keamanan Jaringan)
                reply += `**2. Kuis Keamanan Jaringan (JKI):**\n`;
                if (c.doneJaringan.length > 0) {
                    const score = isHighest ? c.highestJaringan : c.lowestJaringan;
                    const students = isHighest ? c.topStudentsJaringan : c.bottomStudentsJaringan;
                    reply += `- **Nilai ${topOrBot}:** \`${score}\`\n`;
                    reply += `- **Siswa (${students.length} orang):** ${students.map(s => `**${s.name}**`).join(', ')}\n\n`;
                } else {
                    reply += `*(Belum ada siswa kelas ${targetClass} yang mengerjakan Kuis 2)*\n\n`;
                }

                if (isLowest) {
                    reply += `💡 **Rekomendasi Tindak Lanjut Guru:**\n`;
                    reply += `Siswa dengan nilai di bawah KKM 80 disarankan mengikuti sesi remedial terbimbing atau memanfaatkan modul interaktif di Ruang Belajar.\n`;
                } else {
                    reply += `⭐ **Apresiasi:**\n`;
                    reply += `Siswa-siswi tersebut telah menunjukkan ketuntasan materi yang luar biasa pada capaian pembelajaran Informatika Fase E.\n`;
                }

                return reply;
            } else {
                // Keseluruhan 6 Kelas
                const topOrBot = isHighest ? 'Tertinggi' : 'Terendah';
                let reply = `### 🌟 Nilai ${topOrBot} Keseluruhan (Kelas X E 1 - X E 6)\n\n`;
                reply += `Berikut rincian per kelas untuk perbandingan objektif:\n\n`;

                ctx.classes.forEach(cls => {
                    const c = ctx.classStats[cls];
                    const valFakta = isHighest ? c.highestFakta : c.lowestFakta;
                    const valJaringan = isHighest ? c.highestJaringan : c.lowestJaringan;
                    reply += `- **${cls}:** Kuis 1: \`${valFakta !== null ? valFakta : '-'}\` | Kuis 2: \`${valJaringan !== null ? valJaringan : '-'}\`\n`;
                });

                reply += `\n*Tips: Tanyakan secara spesifik, misal: "Siapa nilai tertinggi di kelas 10E6?" atau "Siapa nilai terendah di 10E3?"*`;
                return reply;
            }
        }

        // 2. STATUS PENGERJAAN KUIS SISWA
        if (p.includes('belum') || p.includes('sudah') || p.includes('mengerjakan') || p.includes('selesai') || p.includes('tuntas') || p.includes('ikut')) {
            const wantsBothDone = (p.includes('sudah') || p.includes('selesai') || p.includes('tuntas')) && (p.includes('kedua') || p.includes('2 kuis') || p.includes('semua'));
            const wantsBothNone = (p.includes('belum') || p.includes('tidak')) && (p.includes('kedua') || p.includes('sama sekali') || p.includes('semua') || p.includes('2 kuis'));
            const wantsOnlyFirst = p.includes('pertama') || p.includes('kuis 1') || p.includes('detektif fakta');
            const wantsOnlySecond = p.includes('kedua') || p.includes('kuis 2') || p.includes('keamanan jaringan') || p.includes('jki');
            const wantsMissingOne = p.includes('salah satu') || p.includes('satu kuis') || p.includes('parsial');

            // Kasus A: Sudah Menyelesaikan KEDUA Kuis
            if (wantsBothDone) {
                let list = ctx.finishedBoth;
                if (targetClass) list = list.filter(s => s.class === targetClass);

                let reply = `### 🟢 Siswa yang Sudah Mengerjakan KEDUA Kuis ${targetClass ? `(${targetClass})` : ''}\n\n`;
                reply += `Ditemukan sebanyak **${list.length} siswa** yang telah menuntaskan Kuis 1 (Detektif Fakta) dan Kuis 2 (Keamanan Jaringan):\n\n`;

                if (list.length === 0) {
                    reply += `*(Belum ada siswa yang menyelesaikan kedua kuis pada kriteria ini)*\n`;
                } else {
                    const sample = list.slice(0, 30);
                    reply += sample.map((s, i) => `${i + 1}. **${s.name}** (${s.class}) — Kuis 1: \`${s.scoreFakta}\` | Kuis 2: \`${s.scoreJaringan}\` | Rata-rata: **${s.avgScore}**`).join('\n');
                    if (list.length > 30) {
                        reply += `\n\n*...dan ${list.length - 30} siswa lainnya (dapat dilihat lengkap pada tabel Rekap Nilai).*`;
                    }
                }
                return reply;
            }

            // Kasus B: Belum Mengerjakan KEDUA Kuis (Belum Ujian Sama Sekali)
            if (wantsBothNone) {
                let list = ctx.finishedNone;
                if (targetClass) list = list.filter(s => s.class === targetClass);

                let reply = `### ⏳ Siswa yang BELUM Mengerjakan Kedua Kuis Sama Sekali ${targetClass ? `(${targetClass})` : ''}\n\n`;
                reply += `Terdapat **${list.length} siswa** terdaftar yang belum memiliki riwayat pengerjaan di Kuis 1 maupun Kuis 2:\n\n`;

                if (list.length === 0) {
                    reply += `🎉 **Luar biasa! Seluruh siswa sudah mengikuti setidaknya satu kuis.**\n`;
                } else {
                    reply += list.map((s, i) => `${i + 1}. **${s.name}** (${s.class}) — *Belum ada respon*`).join('\n');
                    reply += `\n\n📲 **Tindakan:** Ibu Guru dapat menekan tombol **"Salin Daftar Belum Ujian"** di dasbor untuk membagikan pengingat langsung ke grup WhatsApp kelas.`;
                }
                return reply;
            }

            // Kasus C: Belum Mengerjakan Kuis KEDUA (Keamanan Jaringan)
            if (wantsOnlySecond && p.includes('belum')) {
                let list = ctx.studentProfiles.filter(s => !s.hasJaringan);
                if (targetClass) list = list.filter(s => s.class === targetClass);

                let reply = `### 🛡️ Siswa yang BELUM Mengerjakan Kuis 2: Keamanan Jaringan ${targetClass ? `(${targetClass})` : ''}\n\n`;
                reply += `Terdapat **${list.length} siswa** yang belum menyelesaikan Kuis Keamanan Jaringan:\n\n`;

                if (list.length === 0) {
                    reply += `✅ **Seluruh siswa telah menyelesaikan Kuis Keamanan Jaringan.**\n`;
                } else {
                    const sample = list.slice(0, 35);
                    reply += sample.map((s, i) => {
                        const noteFakta = s.hasFakta ? `*(Sudah Kuis 1: ${s.scoreFakta})*` : `*(Kuis 1 juga belum)*`;
                        return `${i + 1}. **${s.name}** (${s.class}) ${noteFakta}`;
                    }).join('\n');
                    if (list.length > 35) {
                        reply += `\n\n*...dan ${list.length - 35} siswa lainnya.*`;
                    }
                }
                return reply;
            }

            // Kasus D: Belum Mengerjakan Kuis PERTAMA (Detektif Fakta)
            if (wantsOnlyFirst && p.includes('belum')) {
                let list = ctx.studentProfiles.filter(s => !s.hasFakta);
                if (targetClass) list = list.filter(s => s.class === targetClass);

                let reply = `### 🕵️ Siswa yang BELUM Mengerjakan Kuis 1: Detektif Fakta ${targetClass ? `(${targetClass})` : ''}\n\n`;
                reply += `Terdapat **${list.length} siswa** yang belum menyelesaikan Kuis Detektif Fakta:\n\n`;

                if (list.length === 0) {
                    reply += `✅ **Seluruh siswa telah menyelesaikan Kuis Detektif Fakta.**\n`;
                } else {
                    const sample = list.slice(0, 35);
                    reply += sample.map((s, i) => {
                        const noteJaringan = s.hasJaringan ? `*(Sudah Kuis 2: ${s.scoreJaringan})*` : `*(Kuis 2 juga belum)*`;
                        return `${i + 1}. **${s.name}** (${s.class}) ${noteJaringan}`;
                    }).join('\n');
                    if (list.length > 35) {
                        reply += `\n\n*...dan ${list.length - 35} siswa lainnya.*`;
                    }
                }
                return reply;
            }

            // Kasus E: Belum Mengerjakan Salah Satunya (Hanya Baru 1 Kuis)
            if (wantsMissingOne) {
                let list = ctx.finishedOneOnly;
                if (targetClass) list = list.filter(s => s.class === targetClass);

                let reply = `### ⚠️ Siswa yang Baru Mengerjakan Salah Satu Kuis Saja ${targetClass ? `(${targetClass})` : ''}\n\n`;
                reply += `Terdapat **${list.length} siswa** yang belum lengkap (baru menyelesaikan satu kuis):\n\n`;

                if (list.length === 0) {
                    reply += `✅ Tidak ada siswa yang statusnya parsial.\n`;
                } else {
                    reply += list.map((s, i) => {
                        const statusNote = s.hasFakta ? `Sudah Kuis 1 (${s.scoreFakta}), **Belum Kuis 2**` : `Sudah Kuis 2 (${s.scoreJaringan}), **Belum Kuis 1**`;
                        return `${i + 1}. **${s.name}** (${s.class}) — ${statusNote}`;
                    }).join('\n');
                }
                return reply;
            }
        }

        // 3. ANALISIS MISKONSEPSI & BUTIR SOAL TERSULIT
        if (p.includes('miskonsepsi') || p.includes('salah') || p.includes('sulit') || p.includes('susah') || p.includes('daya serap') || p.includes('analisis butir') || p.includes('remedial')) {
            const worstFakta = ctx.worstFaktaQuestions.slice(0, 3);
            const worstJaringan = ctx.worstJaringanQuestions.slice(0, 3);

            let reply = `### 🩺 Peta Miskonsepsi & Butir Soal Paling Banyak Salah Dijawab\n\n`;
            reply += `Berdasarkan analisis empiris hasil jawaban seluruh siswa:\n\n`;

            reply += `**1. Top Butir Soal Paling Sulit — Modul Detektif Fakta:**\n`;
            worstFakta.forEach(q => {
                reply += `- **Soal #${q.qNumber}:** Sebanyak \`${q.errorCount} siswa\` (${q.errorPct}%) salah menjawab.\n`;
            });
            reply += `> 💡 *Miskonsepsi Dominan:* Siswa cenderung mengira organisasi cek fakta berwenang melakukan penindakan hukum layaknya polisi, dan tertukar membedakan URL resmi lembaga pemerintah berdomain \`.go.id\` dengan alamat domain publik/komersial.\n\n`;

            reply += `**2. Top Butir Soal Paling Sulit — Modul Keamanan Jaringan:**\n`;
            worstJaringan.forEach(q => {
                reply += `- **Soal #${q.qNumber}:** Sebanyak \`${q.errorCount} siswa\` (${q.errorPct}%) salah menjawab.\n`;
            });
            reply += `> 💡 *Miskonsepsi Dominan:* Siswa masih sering terkecoh membedakan cara kerja broadcast pada Hub vs Switch, serta menganggap kunci layar sidik jari pada gawai otomatis melindungi paket data yang melintas di jaringan Wi-Fi publik terbuka tanpa enkripsi (Sniffing).\n\n`;

            reply += `📚 **Saran Aksi Pembelajaran Guru:**\n`;
            reply += `1. Berikan penguatan konsep pembedaan domain resmi pemerintah (\`.go.id\`).\n`;
            reply += `2. Demonstrasikan langsung simulasi lalu lintas data Hub vs Switch serta bahaya Wi-Fi publik gratis tanpa enkripsi.\n`;

            return reply;
        }

        // 4. RINGKASAN KELAS KESELURUHAN (OVERVIEW)
        if (p.includes('ringkasan') || p.includes('rekap') || p.includes('laporan') || p.includes('overview') || p.includes('seluruh') || p.includes('performa') || p.includes('kelas')) {
            let reply = `### 📊 Ringkasan Eksekutif Hasil Belajar Siswa (SMAN 4 Padang)\n\n`;
            reply += `Berikut ikhtisar data hasil pengerjaan kuis Informatika:\n\n`;
            reply += `- **Total Siswa Terdaftar:** \`${ctx.totalEnrolled} Siswa\` (Kelas X E 1 s.d X E 6)\n`;
            reply += `- **Sudah Selesai KEDUA Kuis:** \`${ctx.finishedBoth.length} Siswa\` (${Math.round((ctx.finishedBoth.length / ctx.totalEnrolled) * 100)}%)\n`;
            reply += `- **Hanya Kuis 1 (Detektif Fakta):** \`${ctx.onlyFakta.length} Siswa\`\n`;
            reply += `- **Hanya Kuis 2 (Keamanan Jaringan):** \`${ctx.onlyJaringan.length} Siswa\`\n`;
            reply += `- **Belum Ujian Sama Sekali:** \`${ctx.finishedNone.length} Siswa\`\n\n`;

            reply += `**Rincian Partisipasi Lengkap per Kelas:**\n`;
            reply += `| Kelas | Terdaftar | Tuntas 2 Kuis | Belum Lengkap | Belum Ujian |\n`;
            reply += `| :--- | :---: | :---: | :---: | :---: |\n`;
            ctx.classes.forEach(cls => {
                const c = ctx.classStats[cls];
                reply += `| **${cls}** | ${c.totalStudents} | ${c.doneBoth.length} | ${c.missingOne.length} | ${c.doneNone.length} |\n`;
            });

            reply += `\n*Silakan tanyakan nama kelas atau nama siswa tertentu untuk data spesifik!*`;
            return reply;
        }

        // 5. CARI NAMA SISWA TERTENTU (GURU MODE)
        const matchedStudents = ctx.studentProfiles.filter(s => 
            p.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(p)
        );
        if (matchedStudents.length > 0 && p.length >= 3) {
            let reply = `### 👤 Profil Capaian Siswa\n\n`;
            matchedStudents.slice(0, 3).forEach(s => {
                reply += `**${s.name}** (${s.class})\n`;
                reply += `- **Kuis 1 (Detektif Fakta):** ${s.hasFakta ? `Skor \`${s.scoreFakta}\` ${s.scoreFakta >= 80 ? '✅ Lulus' : '⚠️ Remedial'}` : '⏳ Belum Mengerjakan'}\n`;
                reply += `- **Kuis 2 (Keamanan Jaringan):** ${s.hasJaringan ? `Skor \`${s.scoreJaringan}\` ${s.scoreJaringan >= 80 ? '✅ Lulus' : '⚠️ Remedial'}` : '⏳ Belum Mengerjakan'}\n`;
                if (s.avgScore !== null) {
                    reply += `- **Nilai Rata-rata:** \`${s.avgScore}\`\n`;
                }
                reply += `\n`;
            });
            return reply;
        }

        // Jika pertanyaan Guru berkaitan dengan konsep materi kurikulum/pembelajaran (misal: Ms. Office, Excel, Mail Merge, Jaringan, Phishing, dll)
        const learningReply = generateStudentLearningResponse(userPrompt);
        if (!learningReply.startsWith('### 🔒 Akses Terbatas') && !learningReply.startsWith('### 📖 Asisten Belajar Informatika Siswa')) {
            return learningReply;
        }

        // DEFAULT FALLBACK RESPON CERDAS UNTUK GURU
        return `Halo Ibu Guru! Saya adalah **Asisten Analisis Pintar Gemini** untuk QuizMaster SMAN 4 Padang.\n\n` +
               `Saya memahami konteks seluruh data aplikasi ini, meliputi **216 siswa** di kelas **X E 1 s.d X E 6** dan **2 Modul Kuis** (Detektif Fakta & Keamanan Jaringan).\n\n` +
               `Ibu Guru dapat menanyakan hal-hal berikut:\n` +
               `- 🏆 *"Siapa nilai tertinggi di kelas 10E6?"*\n` +
               `- 📉 *"Siapa nilai terendah di kelas 10E3?"*\n` +
               `- ⏳ *"Siapa saja siswa yang belum mengerjakan kuis kedua?"*\n` +
               `- ❌ *"Siapa siswa yang belum mengerjakan kedua kuis sama sekali?"*\n` +
               `- ✅ *"Siapa yang sudah menyelesaikan kedua kuis di kelas X E 4?"*\n` +
               `- 🩺 *"Miskonsepsi apa yang paling sering muncul di Kuis Keamanan Jaringan?"*\n` +
               `- 📊 *"Tampilkan ringkasan seluruh kelas"*`;
    }

    // 🔀 7. DISPATCHER UTAMA DENGAN VALIDASI ROLE
    function handleChatbotQuery(userPrompt) {
        if (isTeacherMode()) {
            // Mode Guru: Diberikan kebebasan penuh untuk menganalisis nilai, ranking, dan capaian siswa
            return generateTeacherAiResponse(userPrompt);
        } else {
            // Mode Siswa: DIBATASI KETAT - Tidak tahu urusan rekap/nilai/terendah/tertinggi!
            return generateStudentLearningResponse(userPrompt);
        }
    }
    window.handleChatbotQuery = handleChatbotQuery;

    // 🎨 8. DYNAMIC UI ADAPTATION & RENDERING
    function updateTeacherChatbotModeUi() {
        const isTeacher = isTeacherMode();
        const floatBtn = document.getElementById('teacher-chatbot-trigger-btn');
        const floatLabel = document.getElementById('chatbot-trigger-label');
        const titleEl = document.getElementById('chatbot-ui-title');
        const badgeEl = document.getElementById('chatbot-ui-badge');
        const subEl = document.getElementById('chatbot-ui-sub');
        const chipsBar = document.getElementById('chatbot-chips-bar');
        const inputEl = document.getElementById('teacher-chatbot-input');
        const avatarEl = document.getElementById('chatbot-avatar-icon');

        if (floatBtn) {
            floatBtn.title = isTeacher 
                ? 'Tanya Asisten Pintar Guru (Analisis Nilai & Kelas)' 
                : 'Tanya Asisten Belajar Siswa (Materi & Konsep Pembelajaran)';
        }
        if (floatLabel) {
            floatLabel.textContent = isTeacher ? 'Tanya AI Guru' : 'Tanya AI Belajar';
        }

        if (isTeacher) {
            if (titleEl) titleEl.textContent = 'Asisten Analisis Pintar Guru';
            if (badgeEl) {
                badgeEl.textContent = 'Mode Guru • Gemini EdTech';
                badgeEl.className = 'chatbot-badge-ai badge-teacher';
            }
            if (subEl) subEl.textContent = 'Analitik Data Kontekstual & Rekap Nilai Siswa • SMAN 4 Padang';
            if (inputEl) inputEl.placeholder = 'Ketik pertanyaan analisis nilai (misal: Nilai tertinggi 10E6, siapa terendah)...';
            if (avatarEl) avatarEl.textContent = '✨';

            if (chipsBar) {
                chipsBar.innerHTML = `
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Siapa nilai tertinggi di kelas 10E6?')">🏆 Tertinggi 10E6</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Siapa nilai terendah di kelas 10E3?')">📉 Terendah 10E3</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Siapa yang belum mengerjakan kuis kedua?')">⏳ Belum Kuis 2</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Siapa yang belum mengerjakan kedua kuis sama sekali?')">❌ Belum Ujian</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Siapa siswa yang sudah menyelesaikan kedua kuis?')">✅ Tuntas 2 Kuis</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Apa miskonsepsi paling banyak dialami siswa?')">🩺 Peta Miskonsepsi</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Tampilkan ringkasan seluruh kelas')">📊 Ringkasan Kelas</button>
                `;
            }
        } else {
            if (titleEl) titleEl.textContent = 'Asisten Belajar Siswa';
            if (badgeEl) {
                badgeEl.textContent = 'Mode Siswa • Gemini Study AI';
                badgeEl.className = 'chatbot-badge-ai badge-student';
            }
            if (subEl) subEl.textContent = 'Bantuan Materi Informatika & Literasi Digital • SMAN 4 Padang';
            if (inputEl) inputEl.placeholder = 'Tanyakan konsep materi belajar (misal: Perbedaan Hub dan Switch)...';
            if (avatarEl) avatarEl.textContent = '🎓';

            if (chipsBar) {
                chipsBar.innerHTML = `
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Apa itu Microsoft Office dan aplikasi di dalamnya?')">📊 Ms. Office & TIK</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Bagaimana rumus IF dan VLOOKUP di Excel?')">📈 Rumus Excel</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Apa saja aturan dalam UU ITE dan UU PDP?')">⚖️ Etika Digital & UU ITE</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Bagaimana cara kerja LLM dan Generative AI?')">🤖 Konsep AI & LLM</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Apa manfaat Cloud Computing dan IoT bagi sekolah?')">☁️ Cloud & IoT</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Apa saja ciri-ciri pesan phishing atau APK palsu?')">🛡️ Hindari Phishing</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Apa perbedaan mendasar antara Switch dan Hub?')">🌐 Hub vs Switch</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Apa 4 fondasi utama berpikir komputasional?')">🧠 Berpikir Komputasional</button>
                    <button type="button" class="chatbot-chip" onclick="askTeacherQuick('Mengapa Wi-Fi publik berbahaya tanpa VPN?')">🔒 Bahaya Wi-Fi Publik</button>
                `;
            }
        }
    }
    window.updateTeacherChatbotModeUi = updateTeacherChatbotModeUi;

    function initTeacherChatbotUi() {
        if (document.getElementById('teacher-chatbot-container')) return;

        // Container Chatbot Drawer / Tab Panel
        const chatContainer = document.createElement('div');
        chatContainer.id = 'teacher-chatbot-container';
        chatContainer.className = 'teacher-chatbot-wrapper';
        chatContainer.innerHTML = `
            <div class="chatbot-header">
                <div class="chatbot-header-brand">
                    <div class="chatbot-avatar-gemini">
                        <span id="chatbot-avatar-icon">🎓</span>
                    </div>
                    <div>
                        <div class="chatbot-title">
                            <span id="chatbot-ui-title">Asisten Belajar Siswa</span>
                            <span id="chatbot-ui-badge" class="chatbot-badge-ai badge-student">Mode Siswa • Gemini Study AI</span>
                        </div>
                        <div class="chatbot-sub" id="chatbot-ui-sub">Bantuan Materi Informatika & Literasi Digital • SMAN 4 Padang</div>
                    </div>
                </div>
                <div class="chatbot-header-actions">
                    <button type="button" class="chatbot-ctrl-btn" onclick="clearTeacherChat()" title="Bersihkan Percakapan">🗑️</button>
                    <button type="button" class="chatbot-ctrl-btn" onclick="toggleTeacherChatbot(false)" title="Tutup Chatbot">✕</button>
                </div>
            </div>

            <!-- Suggestion Quick Chips -->
            <div class="chatbot-chips-bar" id="chatbot-chips-bar">
                <!-- Dynamically populated by updateTeacherChatbotModeUi -->
            </div>

            <!-- Messages Stream Area -->
            <div class="chatbot-messages-area" id="chatbot-messages-area">
                <!-- Dynamically populated on load/clear -->
            </div>

            <!-- Input Bar -->
            <div class="chatbot-input-bar">
                <input type="text" id="teacher-chatbot-input" class="chatbot-input-field" placeholder="Tanyakan materi pembelajaran..." onkeydown="if(event.key==='Enter')sendTeacherChatMessage();">
                <button type="button" id="btn-chatbot-send" class="chatbot-send-btn" onclick="sendTeacherChatMessage()" title="Kirim Pesan">
                    <span>Kirim</span>
                    <span>➔</span>
                </button>
            </div>
        `;

        document.body.appendChild(chatContainer);

        // Floating Trigger Button di pojok kanan bawah
        if (!document.getElementById('teacher-chatbot-trigger-btn')) {
            const floatBtn = document.createElement('button');
            floatBtn.id = 'teacher-chatbot-trigger-btn';
            floatBtn.type = 'button';
            floatBtn.className = 'chatbot-float-trigger';
            floatBtn.title = 'Tanya Asisten Belajar Siswa (Materi & Konsep)';
            floatBtn.innerHTML = `
                <span class="trigger-sparkle">✨</span>
                <span class="trigger-label" id="chatbot-trigger-label">Tanya AI Belajar</span>
            `;
            floatBtn.onclick = () => toggleTeacherChatbot(true);
            document.body.appendChild(floatBtn);
        }

        // Sinkronkan UI awal
        updateTeacherChatbotModeUi();
        clearTeacherChat();
    }

    function toggleTeacherChatbot(isOpen) {
        const container = document.getElementById('teacher-chatbot-container');
        if (!container) return;
        if (isOpen) {
            updateTeacherChatbotModeUi();
            container.classList.add('active');
            const inp = document.getElementById('teacher-chatbot-input');
            if (inp) setTimeout(() => inp.focus(), 150);
        } else {
            container.classList.remove('active');
        }
    }
    window.toggleTeacherChatbot = toggleTeacherChatbot;

    function clearTeacherChat() {
        const area = document.getElementById('chatbot-messages-area');
        if (!area) return;
        const isTeacher = isTeacherMode();

        if (isTeacher) {
            area.innerHTML = `
                <div class="chatbot-msg bot">
                    <div class="msg-avatar">✨</div>
                    <div class="msg-content">
                        <p>Selamat datang, Ibu Guru! Saya siap membantu menganalisis seluruh data siswa kelas <strong>X E 1 s.d X E 6</strong> untuk <strong>Kuis 1 (Detektif Fakta)</strong> dan <strong>Kuis 2 (Keamanan Jaringan)</strong>.</p>
                        <p>Silakan tanyakan performa siswa, nilai tertinggi/terendah, siswa yang belum ujian, atau analisis miskonsepsi!</p>
                    </div>
                </div>
            `;
        } else {
            area.innerHTML = `
                <div class="chatbot-msg bot">
                    <div class="msg-avatar">🎓</div>
                    <div class="msg-content">
                        <p>Halo! Saya <strong>Asisten Belajar Siswa</strong> untuk mata pelajaran Informatika SMAN 4 Padang 🚀</p>
                        <p>Saya siap membantumu memahami seluruh materi pembelajaran Informatika, seperti aplikasi perkantoran (Ms. Office, Word, Excel), literasi digital, deteksi hoaks, keamanan siber, dan infrastruktur jaringan.</p>
                        <p style="font-size:0.82rem; opacity:0.8; margin-top:8px;"><em>🔒 Catatan: Informasi rekapitulasi nilai dan hasil ujian siswa bersifat rahasia dan hanya dapat diakses oleh Ibu Guru melalui Dasbor Guru terverifikasi PIN.</em></p>
                    </div>
                </div>
            `;
        }
    }
    window.clearTeacherChat = clearTeacherChat;

    function askTeacherQuick(question) {
        const inp = document.getElementById('teacher-chatbot-input');
        if (inp) {
            inp.value = question;
            sendTeacherChatMessage();
        }
    }
    window.askTeacherQuick = askTeacherQuick;

    function renderMarkdownToHtml(md) {
        if (!md) return '';
        let h = md
            .replace(/^### (.*$)/gim, '<h4 class="ai-heading">$1</h4>')
            .replace(/^## (.*$)/gim, '<h3 class="ai-heading">$1</h3>')
            .replace(/^> (.*$)/gim, '<blockquote class="ai-quote">$1</blockquote>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code class="ai-code">$1</code>')
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n- (.*)/g, '<li class="ai-li">$1</li>');

        // Handle simple markdown tables
        if (h.includes('|')) {
            const lines = h.split('<br><br>');
            const formatted = lines.map(line => {
                if (line.includes('|')) {
                    const rows = line.split('\n').filter(r => r.trim().startsWith('|'));
                    if (rows.length >= 2) {
                        let tableHtml = '<div class="ai-table-wrap"><table class="ai-table">';
                        rows.forEach((r, idx) => {
                            if (r.includes('---')) return; // Separator row
                            const cols = r.split('|').filter((_, cIdx, arr) => cIdx > 0 && cIdx < arr.length - 1);
                            tableHtml += '<tr>';
                            cols.forEach(c => {
                                const tag = idx === 0 ? 'th' : 'td';
                                tableHtml += `<${tag}>${c.trim()}</${tag}>`;
                            });
                            tableHtml += '</tr>';
                        });
                        tableHtml += '</table></div>';
                        return tableHtml;
                    }
                }
                return line;
            });
            h = formatted.join('<br><br>');
        }

        return h;
    }

    function appendMessage(sender, text) {
        const area = document.getElementById('chatbot-messages-area');
        if (!area) return;

        const isTeacher = isTeacherMode();
        const msgDiv = document.createElement('div');
        msgDiv.className = `chatbot-msg ${sender}`;
        
        let avatar = '✨';
        if (sender === 'user') {
            avatar = isTeacher ? '👩‍🏫' : '🧑‍🎓';
        } else {
            avatar = isTeacher ? '✨' : '🎓';
        }

        const formattedHtml = sender === 'user' 
            ? `<p>${escapeHtml(text)}</p>` 
            : renderMarkdownToHtml(text);

        msgDiv.innerHTML = `
            <div class="msg-avatar">${avatar}</div>
            <div class="msg-content">${formattedHtml}</div>
        `;

        area.appendChild(msgDiv);
        area.scrollTop = area.scrollHeight;
    }

    // 🌊 STREAM CHAT ENGINE (ANIMASI STREAMING REAL-TIME ALA CHATGPT/GEMINI)
    let _activeStreamTimer = null;
    let _isStreamingNow = false;

    function stopCurrentStream() {
        if (_activeStreamTimer) {
            clearInterval(_activeStreamTimer);
            _activeStreamTimer = null;
        }
        _isStreamingNow = false;

        const cursor = document.getElementById('active-stream-cursor');
        if (cursor && cursor.parentNode) cursor.parentNode.removeChild(cursor);

        const stopBtn = document.getElementById('chatbot-active-stop-btn');
        if (stopBtn && stopBtn.parentNode) stopBtn.parentNode.removeChild(stopBtn);

        const streamEl = document.getElementById('active-streaming-msg');
        if (streamEl) {
            streamEl.classList.remove('streaming');
            streamEl.removeAttribute('id');
            const streamText = streamEl.querySelector('.stream-text');
            if (streamText) streamText.removeAttribute('id');
        }

        const sendBtn = document.getElementById('btn-chatbot-send');
        if (sendBtn) sendBtn.disabled = false;
    }
    window.stopCurrentStream = stopCurrentStream;

    function safeRenderStreamMarkdown(partialMd) {
        if (!partialMd) return '';
        let text = partialMd;
        // Tutup format bold jika jumlah ** ganjil
        const boldMatches = text.match(/\*\*/g);
        if (boldMatches && boldMatches.length % 2 !== 0) {
            text += '**';
        }
        // Tutup inline code jika jumlah ` ganjil
        const backtickMatches = text.match(/(?<!`)`(?!`)/g);
        if (backtickMatches && backtickMatches.length % 2 !== 0) {
            text += '`';
        }
        return renderMarkdownToHtml(text);
    }

    function streamBotMessage(fullText, botAvatar = '🎓') {
        const area = document.getElementById('chatbot-messages-area');
        if (!area) return;

        // Hentikan stream yang sedang berjalan sebelumnya
        stopCurrentStream();

        const msgDiv = document.createElement('div');
        msgDiv.className = 'chatbot-msg bot streaming';
        msgDiv.id = 'active-streaming-msg';
        msgDiv.innerHTML = `
            <div class="msg-avatar">${botAvatar}</div>
            <div class="msg-content">
                <div class="stream-text" id="active-stream-text"></div>
                <span class="stream-cursor" id="active-stream-cursor">▌</span>
                <div class="stream-action-bar">
                    <button type="button" class="chatbot-stop-btn" id="chatbot-active-stop-btn" onclick="stopCurrentStream()" title="Hentikan Stream">
                        <span>⏹ Hentikan Teks</span>
                    </button>
                </div>
            </div>
        `;
        area.appendChild(msgDiv);
        area.scrollTop = area.scrollHeight;

        const textContainer = msgDiv.querySelector('.stream-text');
        const cursor = msgDiv.querySelector('.stream-cursor');
        const stopBtn = msgDiv.querySelector('.chatbot-stop-btn');
        const sendBtn = document.getElementById('btn-chatbot-send');
        if (sendBtn) sendBtn.disabled = true;

        _isStreamingNow = true;
        let charIndex = 0;
        const totalChars = fullText.length;

        // Kecepatan streaming alami:
        // Text pendek -> 2-3 karakter per tick (16ms)
        // Text panjang -> 4-6 karakter per tick (16ms)
        const step = Math.max(2, Math.min(6, Math.ceil(totalChars / 110)));

        _activeStreamTimer = setInterval(() => {
            if (!_isStreamingNow) {
                stopCurrentStream();
                return;
            }

            charIndex += step;
            if (charIndex >= totalChars) {
                charIndex = totalChars;
                // Selesai streaming
                clearInterval(_activeStreamTimer);
                _activeStreamTimer = null;
                _isStreamingNow = false;

                if (textContainer) {
                    textContainer.innerHTML = renderMarkdownToHtml(fullText);
                    textContainer.removeAttribute('id');
                }
                if (cursor && cursor.parentNode) cursor.parentNode.removeChild(cursor);
                if (stopBtn && stopBtn.parentNode) stopBtn.parentNode.removeChild(stopBtn);
                msgDiv.classList.remove('streaming');
                msgDiv.removeAttribute('id');
                if (sendBtn) sendBtn.disabled = false;
                area.scrollTop = area.scrollHeight;
                return;
            }

            const currentSlice = fullText.substring(0, charIndex);
            if (textContainer) {
                textContainer.innerHTML = safeRenderStreamMarkdown(currentSlice);
            }
            area.scrollTop = area.scrollHeight;
        }, 16);
    }
    window.streamBotMessage = streamBotMessage;

    function sendTeacherChatMessage() {
        const inp = document.getElementById('teacher-chatbot-input');
        if (!inp) return;
        const text = inp.value.trim();
        if (!text) return;

        // Hentikan stream yang sedang berjalan jika ada
        if (_isStreamingNow) {
            stopCurrentStream();
        }

        inp.value = '';
        appendMessage('user', text);

        // Typing indicator sebentar (140ms) memberi jeda berpikir yang hidup
        const isTeacher = isTeacherMode();
        const botAvatar = isTeacher ? '✨' : '🎓';
        const area = document.getElementById('chatbot-messages-area');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-msg bot typing-msg';
        typingDiv.id = 'chatbot-typing-indicator';
        typingDiv.innerHTML = `
            <div class="msg-avatar">${botAvatar}</div>
            <div class="msg-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        area.appendChild(typingDiv);
        area.scrollTop = area.scrollHeight;

        setTimeout(() => {
            const typingEl = document.getElementById('chatbot-typing-indicator');
            if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);

            const aiReply = handleChatbotQuery(text);
            // Streaming respons AI ke layar obrolan!
            streamBotMessage(aiReply, botAvatar);
        }, 140);
    }
    window.sendTeacherChatMessage = sendTeacherChatMessage;

    // Inisialisasi saat DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTeacherChatbotUi);
    } else {
        initTeacherChatbotUi();
    }

    window.initTeacherChatbotUi = initTeacherChatbotUi;
})();
