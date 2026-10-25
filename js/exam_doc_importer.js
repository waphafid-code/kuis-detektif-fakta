/**
 * ==============================================================================
 * 📄 EXAM DOCUMENT IMPORTER & SMART QUESTION DISSECTOR (exam_doc_importer.js)
 * ==============================================================================
 * Fitur Generator & Impor Bank Soal dari Dokumen Word (.docx), PDF (.pdf), Teks:
 * 1. Menerima berkas melalui Drag & Drop atau File Picker (Word, PDF, Teks, JSON).
 * 2. Membedah & mendeteksi struktur secara otomatis:
 *    - Mana SOAL (Pertanyaan Inti)
 *    - Mana INSTRUKSI / STIMULUS / STUDI KASUS (Wacana, Narasi)
 *    - Mana PILIHAN OPSI JAWABAN (A, B, C, D, E atau Benar/Salah)
 *    - Mana KUNCI JAWABAN (Otomatis terkunci/terpilih sesuai dokumen)
 *    - Mana PEMBAHASAN & PETUNJUK (Explanation & Hint)
 * 3. Menyediakan modal pratinjau interaktif (WYSIWYG review) sebelum disimpan.
 * 4. Menyimpan paket soal ke Bank Soal & Modul Ujian QuizManager secara permanen.
 * ==============================================================================
 */

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // 🧠 1. SMART DOCUMENT DISSECTION PARSER ENGINE
    // ═══════════════════════════════════════════════════════════════
    const ExamDocParser = {
        /**
         * Mengurai file Word/PDF/Teks secara otomatis
         * @param {File} file Objek File dari drag & drop atau file input
         * @param {Function} onProgress Callback progres (pct, statusText)
         * @returns {Promise<{success: boolean, title: string, questions: Array, meta: Object}>}
         */
        async parseFile(file, onProgress = () => { }) {
            if (!file) throw new Error("Berkas dokumen tidak ditemukan!");
            if (!window.DocParser) throw new Error("Pustaka DocParser belum tersedia!");

            onProgress(15, `Membaca struktur ${file.name}...`);
            const extracted = await window.DocParser.extractText(file, (pct, msg) => {
                onProgress(Math.round(15 + (pct * 0.45)), msg);
            });

            if (!extracted || !extracted.text || extracted.text.trim().length < 20) {
                throw new Error("Dokumen tidak memuat teks yang cukup untuk diurai sebagai naskah soal!");
            }

            onProgress(65, "Menganalisis butir soal, stimulus, dan kunci jawaban...");
            const parsed = this.parseText(extracted.text, file.name);
            onProgress(100, `Selesai! Berhasil mengidentifikasi ${parsed.questions.length} butir soal.`);

            return {
                ...parsed,
                meta: extracted.meta || {}
            };
        },

        /**
         * Mengurai string teks dokumen menjadi butir-butir soal
         */
        parseText(fullText, defaultFileName = "") {
            if (!fullText || typeof fullText !== 'string') {
                return { success: false, error: "Teks dokumen kosong", questions: [] };
            }

            // Normalisasi baris & hapus penanda halaman PDF.js
            let text = fullText
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .replace(/---\s*\[Halaman\s*\d+\]\s*---/gi, '')
                .replace(/---\s*\[Slide\s*\d+\]\s*---/gi, '')
                .trim();

            // 1. Ekstrak Kunci Jawaban Terpisah di Akhir Dokumen (jika ada daftar khusus)
            const separateKeys = {};
            const keySectionRegex = /(?:^|\n)\s*(?:KUNCI\s+JAWABAN|KUNCI\s+SOAL|KUNCI\s+RESMI|ANSWER\s+KEYS?)[\s\S]*?(?=\n\s*(?:PEMBAHASAN|CATATAN|REFERENSI|$))/i;
            const keySectionMatch = text.match(keySectionRegex);
            if (keySectionMatch) {
                const keyLines = keySectionMatch[0].split('\n');
                keyLines.forEach(line => {
                    const clean = line.replace(/^[^a-zA-Z0-9]+/, '').trim();
                    const m = clean.match(/^(?:Soal\s*)?(\d+)[\.\)\:\-]\s*([A-Ea-e,\s&danDAN]+|BENAR|SALAH|TRUE|FALSE)/i);
                    if (m) {
                        separateKeys[parseInt(m[1], 10)] = m[2].trim();
                    }
                });
            }

            // 2. Deteksi Judul Dokumen (baris awal sebelum soal nomor 1)
            let detectedTitle = "";
            const firstQMatch = text.search(/(?:^|\n)\s*(?:(?:Soal|Nomor|No\.?)\s*)?1[\.\)]\s+/i);
            if (firstQMatch > 0) {
                const headerPart = text.substring(0, firstQMatch).trim();
                const headerLines = headerPart.split('\n')
                    .map(l => l.replace(/^[^a-zA-Z0-9"'(]+/, '').trim())
                    .filter(l => l && l.length > 5 && !l.startsWith('---'));
                if (headerLines.length > 0) {
                    detectedTitle = headerLines[0];
                    if (headerLines.length > 1 && detectedTitle.length < 32) {
                        detectedTitle += ' — ' + headerLines[1];
                    }
                }
            }
            if (!detectedTitle && defaultFileName) {
                detectedTitle = defaultFileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
                detectedTitle = detectedTitle.charAt(0).toUpperCase() + detectedTitle.slice(1);
            }

            // 3. Membelah Dokumen Menjadi Blok-Blok Butir Soal Berurutan
            const qSplitterRegex = /(?:^|\n)\s*(?:(?:Soal|Nomor|No\.?)\s*)?(\d{1,3})[\.\)\-:]\s*(?=\n|[A-Za-z0-9"“'‘\[\(])/gi;
            let match;
            const splits = [];

            while ((match = qSplitterRegex.exec(text)) !== null) {
                const qNum = parseInt(match[1], 10);
                if (splits.length === 0) {
                    if (qNum === 1 || qNum <= 3) {
                        splits.push({ num: qNum, index: match.index + match[0].length, fullMatchIndex: match.index });
                    }
                } else {
                    const lastNum = splits[splits.length - 1].num;
                    if (qNum > lastNum && qNum <= lastNum + 5) {
                        splits.push({ num: qNum, index: match.index + match[0].length, fullMatchIndex: match.index });
                    }
                }
            }

            // Fallback jika pemisah angka 1, 2, 3 tidak ditemukan (misal format paragraf ganda)
            if (splits.length === 0) {
                const paragraphs = text.split(/\n\s*\n\s*\n/).filter(p => p.trim().length > 30);
                paragraphs.forEach((p, idx) => {
                    splits.push({ num: idx + 1, index: 0, fullMatchIndex: 0, textOverride: p });
                });
            }

            const parsedQuestions = [];

            for (let i = 0; i < splits.length; i++) {
                let blockText = '';
                if (splits[i].textOverride) {
                    blockText = splits[i].textOverride;
                } else {
                    const start = splits[i].index;
                    const end = (i + 1 < splits.length) ? splits[i + 1].fullMatchIndex : (keySectionMatch ? keySectionMatch.index : text.length);
                    blockText = text.substring(start, end).trim();
                }

                if (!blockText) continue;

                const qItem = this.parseSingleQuestionBlock(blockText, splits[i].num || (i + 1), separateKeys);
                if (qItem && (qItem.q || qItem.options.length > 0)) {
                    parsedQuestions.push(qItem);
                }
            }

            // 4. Normalisasi Poin (Total Bobot Modul 100 Poin)
            this.normalizePoints(parsedQuestions);

            return {
                success: parsedQuestions.length > 0,
                title: detectedTitle || "Paket Soal Pembelajaran Terpadu",
                questionCount: parsedQuestions.length,
                questions: parsedQuestions
            };
        },

        /**
         * Mengurai Satu Blok Soal Menjadi Objek Terstruktur Lengkap
         */
        parseSingleQuestionBlock(blockText, qNum, separateKeys = {}) {
            const lines = blockText.split('\n');
            let mode = 'PROMPT'; // PROMPT, CASE, QUESTION, OPTION, EXP, HINT
            let currentOptLetter = null;

            const item = {
                id: qNum,
                type: 'mcq',
                difficulty: 'Medium',
                points: 5,
                caseStudy: null,
                q: '',
                options: [],
                answer: 0,
                explanation: '',
                hint: ''
            };

            const rawCase = [];
            const rawQ = [];
            const rawExp = [];
            const rawHint = [];
            let rawKey = separateKeys[qNum] || null;
            const detectedKeysFromTags = [];
            const optionsMap = {};

            const optRegex = /^\s*(\*?\s*[A-Ea-e])[\.\)\:\-]\s*(.*)$/;
            const tfOptionRegex = /^\s*(BENAR|SALAH|TRUE|FALSE)\s*$/i;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) {
                    if (mode === 'CASE') rawCase.push('');
                    else if (mode === 'QUESTION' || mode === 'PROMPT') rawQ.push('');
                    continue;
                }

                const cleanLine = line.replace(/^[^a-zA-Z0-9"'(]+/, '').trim();

                // 1. Cek Kunci Jawaban
                const keyMatch = cleanLine.match(/^(?:Kunci\s+Jawaban(?:\s+Resmi)?|Kunci(?:\s+Jawaban)?|Jawaban(?:\s+Resmi)?|Jawaban\s+Benar|Answer\s*Key|Answer)[\s:\-=]+(.*)$/i);
                if (keyMatch) {
                    rawKey = keyMatch[1].trim();
                    mode = 'KEY';
                    continue;
                }

                // 2. Cek Pembahasan / Penjelasan
                const expMatch = cleanLine.match(/^(?:Pembahasan(?:\s*&\s*Analisis(?:\s*Bukti)?)?|Penjelasan|Explanation|Alasan)[\s:\-=]*(.*)$/i);
                if (expMatch) {
                    mode = 'EXP';
                    if (expMatch[1].trim()) rawExp.push(expMatch[1].trim());
                    continue;
                }

                // 3. Cek Petunjuk / Hint
                const hintMatch = cleanLine.match(/^(?:Petunjuk(?:\s*Berpikir|\s*Kognitif)?|Hint|Clue)[\s:\-=]*(.*)$/i);
                if (hintMatch) {
                    mode = 'HINT';
                    if (hintMatch[1].trim()) rawHint.push(hintMatch[1].trim());
                    continue;
                }

                // 4. Cek Tingkat Kesulitan
                const diffMatch = cleanLine.match(/^(?:Tingkat(?:\s+Kesulitan)?|Difficulty)[\s:\-=]+(.*)$/i);
                if (diffMatch) {
                    const d = diffMatch[1].trim().toLowerCase();
                    if (d.includes('mudah') || d.includes('easy')) item.difficulty = 'Easy';
                    else if (d.includes('sulit') || d.includes('hard') || d.includes('hots')) item.difficulty = 'Hard';
                    else item.difficulty = 'Medium';
                    continue;
                }

                // 5. Cek Header Stimulus / Kasus / Wacana
                const caseHeaderMatch = cleanLine.match(/^(?:Stimulus(?:\s*\/\s*Narasi\s*Kasus)?|Studi\s+Kasus|Kasus|Instruksi|Wacana|Narasi|Bukti\s+Kasus)[\s:\-=]*(.*)$/i);
                if (caseHeaderMatch) {
                    mode = 'CASE';
                    if (caseHeaderMatch[1].trim()) rawCase.push(caseHeaderMatch[1].trim());
                    continue;
                }

                // 6. Cek Header Pertanyaan: / Soal:
                const qHeaderMatch = cleanLine.match(/^(?:Pertanyaan|Soal)[\s:\-=]*(.*)$/i);
                if (qHeaderMatch) {
                    mode = 'QUESTION';
                    if (qHeaderMatch[1].trim()) rawQ.push(qHeaderMatch[1].trim());
                    continue;
                }

                // 7. Cek Header "Pilihan Jawaban:"
                if (/^(?:Pilihan\s+Jawaban|Opsi|Options)[\s:\-=]*$/i.test(cleanLine)) {
                    continue;
                }

                // 8. Cek Opsi Jawaban (A, B, C, D, E)
                const optMatch = line.match(optRegex);
                if (optMatch) {
                    mode = 'OPTION';
                    currentOptLetter = optMatch[1].replace(/\*/g, '').trim().toUpperCase();
                    let optVal = optMatch[2].trim();

                    if (optMatch[1].includes('*') || /(?:✔|\[KUNCI(?:\s+BENAR)?\]|\(Kunci(?:\s+Benar)?\)|\(Benar\)|\(Jawaban\s+Benar\)|\[x\])/i.test(optVal)) {
                        detectedKeysFromTags.push(currentOptLetter);
                        optVal = optVal.replace(/(?:✔\s*)?(?:\[KUNCI(?:\s+BENAR)?\]|\(Kunci(?:\s+Benar)?\)|\(Benar\)|\(Jawaban\s+Benar\)|\[x\])/gi, '').trim();
                    }

                    optionsMap[currentOptLetter] = optVal;
                    continue;
                }

                // Cek Opsi Benar / Salah langsung
                const tfMatch = line.match(tfOptionRegex);
                if (tfMatch && (mode === 'PROMPT' || mode === 'QUESTION' || mode === 'OPTION')) {
                    mode = 'OPTION';
                    const tfVal = tfMatch[1].toUpperCase();
                    if (tfVal.startsWith('B') || tfVal.startsWith('T')) {
                        optionsMap['A'] = 'BENAR';
                    } else {
                        optionsMap['B'] = 'SALAH';
                    }
                    continue;
                }

                // Akumulasi baris bertingkat
                if (mode === 'CASE') {
                    rawCase.push(line);
                } else if (mode === 'QUESTION') {
                    rawQ.push(line);
                } else if (mode === 'OPTION' && currentOptLetter) {
                    optionsMap[currentOptLetter] += ' ' + line;
                } else if (mode === 'EXP') {
                    rawExp.push(line);
                } else if (mode === 'HINT') {
                    rawHint.push(line);
                } else if (mode === 'PROMPT') {
                    rawQ.push(line);
                }
            }

            // Susun array Opsi Jawaban berurutan (A - E)
            const letters = ['A', 'B', 'C', 'D', 'E'];
            letters.forEach(letCode => {
                if (optionsMap[letCode] !== undefined) {
                    item.options.push(optionsMap[letCode].trim());
                }
            });

            // Fallback True/False jika tidak ada opsi A-D
            if (item.options.length === 0) {
                item.options = ['BENAR', 'SALAH'];
                item.type = 'tf';
            }

            // Susun Case Study & Question
            let finalCase = rawCase.join('\n').trim();
            let finalQ = rawQ.join('\n').trim();

            if (!finalCase && finalQ) {
                const quoteMatch = finalQ.match(/^["“]([\s\S]{15,})["”]\s*([\s\S]*)$/);
                if (quoteMatch) {
                    finalCase = quoteMatch[1].trim();
                    finalQ = quoteMatch[2].trim() || finalCase;
                }
            }

            item.caseStudy = finalCase ? this.cleanQuotes(finalCase) : null;
            item.q = this.cleanQuestionHeader(finalQ || 'Pilihlah salah satu jawaban yang paling tepat!');
            item.explanation = rawExp.join('\n').trim();
            item.hint = rawHint.join('\n').trim();

            // Kunci Jawaban Otomatis Terkunci Sesuai Dokumen
            if (!rawKey && detectedKeysFromTags.length > 0) {
                rawKey = detectedKeysFromTags.join(', ');
            }
            this.lockAnswerKey(item, rawKey);

            return item;
        },

        cleanQuestionHeader(str) {
            if (!str) return '';
            return str
                .replace(/^(?:Pertanyaan|Soal)[\s:\-=]+/i, '')
                .replace(/\(Pilihan\s+Ganda\s+Kompleks\)/gi, '')
                .replace(/\(Checkbox\)/gi, '')
                .replace(/\(Pilihan\s+Majemuk\)/gi, '')
                .replace(/Pilihan\s+Jawaban[\s:\-=]*/gi, '')
                .trim();
        },

        cleanQuotes(str) {
            if (!str) return '';
            return str.replace(/^["“]|["”]$/g, '').trim();
        },

        /**
         * Kunci Jawaban Otomatis: Memetakan ke indeks angka [0, 1, 2, ...]
         */
        lockAnswerKey(item, rawKey) {
            if (!rawKey) {
                item.answer = (item.type === 'checkbox') ? [0] : 0;
                return;
            }

            const keyStr = String(rawKey).trim().toUpperCase();

            // Format Benar / Salah
            if (item.type === 'tf' || keyStr.includes('BENAR') || keyStr.includes('SALAH') || keyStr.includes('TRUE') || keyStr.includes('FALSE')) {
                item.type = 'tf';
                if (!item.options || item.options.length === 0) item.options = ['BENAR', 'SALAH'];
                if (keyStr.includes('BENAR') || keyStr.includes('TRUE') || keyStr.startsWith('A')) {
                    item.answer = 0; // BENAR
                } else {
                    item.answer = 1; // SALAH
                }
                return;
            }

            // Format Pilihan Ganda Kompleks (Checkbox)
            const letters = keyStr.match(/[A-E]/g);
            if (letters && (letters.length > 1 || keyStr.includes(',') || keyStr.includes('&') || keyStr.includes('DAN'))) {
                item.type = 'checkbox';
                const uniqueIndices = [...new Set(letters.map(l => l.charCodeAt(0) - 65))]
                    .filter(idx => idx >= 0 && idx < item.options.length)
                    .sort((a, b) => a - b);
                item.answer = uniqueIndices.length > 0 ? uniqueIndices : [0];
                return;
            }

            // Format Pilihan Ganda Tunggal (MCQ)
            if (letters && letters.length === 1) {
                const idx = letters[0].charCodeAt(0) - 65;
                item.answer = (idx >= 0 && idx < item.options.length) ? idx : 0;
                item.type = 'mcq';
                return;
            }

            const num = parseInt(keyStr, 10);
            if (!isNaN(num)) {
                item.answer = Math.max(0, Math.min(item.options.length - 1, num - 1));
                return;
            }

            item.answer = 0;
        },

        normalizePoints(questions) {
            if (!questions || questions.length === 0) return;
            const len = questions.length;
            const basePts = Math.floor(100 / len);
            const remainder = 100 % len;
            questions.forEach((q, idx) => {
                q.points = basePts + (idx < remainder ? 1 : 0);
            });
        }
    };

    window.ExamDocParser = ExamDocParser;

    // ═══════════════════════════════════════════════════════════════
    // 🎨 2. INTERACTIVE UI & DRAG-AND-DROP CONTROLLER
    // ═══════════════════════════════════════════════════════════════
    let currentParsedModuleData = null;

    const ExamDocImporterUI = {
        /**
         * Inisialisasi event listener Drag & Drop pada container
         */
        init() {
            const dropzone = document.getElementById('exam-doc-dropzone');
            const fileInput = document.getElementById('exam-doc-file-input');

            if (!dropzone || !fileInput) return;

            // Drag and drop events
            ['dragenter', 'dragover'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.add('drag-active');
                }, false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                dropzone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    dropzone.classList.remove('drag-active');
                }, false);
            });

            dropzone.addEventListener('drop', (e) => {
                const dt = e.dataTransfer;
                const file = dt && dt.files && dt.files[0];
                if (file) {
                    this.processUploadedFile(file);
                }
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files && e.target.files[0];
                if (file) {
                    this.processUploadedFile(file);
                    e.target.value = '';
                }
            });
        },

        triggerFileInput() {
            const input = document.getElementById('exam-doc-file-input');
            if (input) input.click();
        },

        /**
         * Memproses file yang di-drop atau dipilih
         */
        async processUploadedFile(file) {
            const statusBox = document.getElementById('exam-importer-status');
            const progressBar = document.getElementById('exam-importer-progress');
            const statusText = document.getElementById('exam-importer-status-text');

            if (statusBox) statusBox.style.display = 'block';

            try {
                if (typeof sfxClick === 'function') sfxClick();

                const parsed = await ExamDocParser.parseFile(file, (pct, msg) => {
                    if (progressBar) progressBar.style.width = `${pct}%`;
                    if (statusText) statusText.innerHTML = `<strong>${pct}%</strong> &bull; ${msg}`;
                });

                if (!parsed.questions || parsed.questions.length === 0) {
                    throw new Error("Tidak ada butir soal yang berhasil diuraikan dari dokumen ini. Pastikan berkas memiliki nomor soal (1, 2, 3...) dan opsi jawaban!");
                }

                if (typeof sfxCorrect === 'function') sfxCorrect();
                if (typeof showToast === 'function') {
                    showToast(`🎉 Berhasil membedah ${parsed.questions.length} butir soal dari ${file.name}!`, 'success');
                }

                currentParsedModuleData = {
                    ...parsed,
                    fileName: file.name
                };

                // Tampilkan Modal Review Hasil Parsing
                this.openReviewModal(currentParsedModuleData);

            } catch (err) {
                console.error("Gagal parse dokumen soal:", err);
                if (typeof sfxWrong === 'function') sfxWrong();
                if (statusText) {
                    statusText.innerHTML = `<span style="color:var(--danger);">❌ ${err.message}</span>`;
                }
                if (typeof showToast === 'function') {
                    showToast(err.message, '⚠️');
                }
            }
        },

        /**
         * Membuka modal input teks soal manual
         */
        openManualTextPrompt() {
            const modal = document.getElementById('modal-exam-manual-text');
            if (modal) modal.style.display = 'flex';
        },

        closeManualTextModal() {
            const modal = document.getElementById('modal-exam-manual-text');
            if (modal) modal.style.display = 'none';
        },

        processManualText() {
            const txtArea = document.getElementById('exam-manual-text-area');
            const titleInput = document.getElementById('exam-manual-title-input');
            const rawText = txtArea ? txtArea.value.trim() : '';

            if (!rawText || rawText.length < 20) {
                if (typeof showToast === 'function') showToast("Harap tempel teks naskah soal terlebih dahulu!", "⚠️");
                return;
            }

            const title = (titleInput && titleInput.value.trim()) || "Paket Soal Impor Manual";
            const parsed = ExamDocParser.parseText(rawText, title);

            if (!parsed.questions || parsed.questions.length === 0) {
                if (typeof showToast === 'function') showToast("Gagal mendeteksi butir soal. Pastikan ada format nomor (1., 2.) dan pilihan (A., B.)!", "⚠️");
                return;
            }

            this.closeManualTextModal();
            currentParsedModuleData = parsed;
            this.openReviewModal(currentParsedModuleData);
        },

        /**
         * Menampilkan Modal Pratinjau Interaktif Soal & Kunci Jawaban Otomatis
         */
        openReviewModal(pkg) {
            const modal = document.getElementById('modal-exam-doc-preview');
            if (!modal) return;

            // Isi Form Header
            const titleEl = document.getElementById('exam-prev-title');
            const catEl = document.getElementById('exam-prev-cat');
            const kkmEl = document.getElementById('exam-prev-kkm');
            const descEl = document.getElementById('exam-prev-desc');
            const badgeCountEl = document.getElementById('exam-prev-badge-count');

            if (titleEl) titleEl.value = pkg.title || 'Modul Pembelajaran Baru';
            if (catEl) catEl.value = 'Jaringan Komputer & Internet (JKI)';
            if (kkmEl) kkmEl.value = 80;
            if (descEl) descEl.value = `Paket kuis asesmen ${pkg.questions.length} butir soal hasil pembedahan otomatis dokumen Word/PDF.`;
            if (badgeCountEl) {
                const autoKeyCount = pkg.questions.filter(q => q.answer !== undefined && q.answer !== null).length;
                badgeCountEl.innerHTML = `📊 <strong>${pkg.questions.length} Butir Soal</strong> &bull; 🎯 <strong>${autoKeyCount} Kunci Terkunci Otomatis</strong>`;
            }

            this.renderQuestionsList(pkg.questions);
            modal.style.display = 'flex';
        },

        closeReviewModal() {
            const modal = document.getElementById('modal-exam-doc-preview');
            if (modal) modal.style.display = 'none';
        },

        /**
         * Render Kartu-Kartu Butir Soal dengan Visual Kunci Jawaban Terpilih
         */
        renderQuestionsList(questions) {
            const container = document.getElementById('exam-prev-questions-list');
            if (!container) return;

            container.innerHTML = '';

            questions.forEach((q, idx) => {
                const card = document.createElement('div');
                card.className = 'exam-preview-qcard';
                card.id = `prev-qcard-${idx}`;

                const typeBadge = q.type === 'checkbox'
                    ? '<span class="q-badge" style="background:rgba(139,92,246,0.18);color:#a78bfa;border-color:rgba(139,92,246,0.4);">☑️ Pilihan Ganda Kompleks</span>'
                    : (q.type === 'tf'
                        ? '<span class="q-badge" style="background:rgba(245,158,11,0.18);color:#fde68a;border-color:rgba(245,158,11,0.4);">⚖️ Benar / Salah</span>'
                        : '<span class="q-badge" style="background:rgba(14,165,233,0.18);color:#38bdf8;border-color:rgba(14,165,233,0.4);">🔘 Pilihan Ganda Tunggal</span>');

                card.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;border-bottom:1px dashed var(--glass-border);padding-bottom:8px;">
                        <div style="display:flex;align-items:center;gap:10px;">
                            <span style="font-weight:800;font-size:1rem;color:var(--text);background:rgba(255,255,255,0.06);padding:3px 10px;border-radius:8px;">
                                Butir Soal ${idx + 1}
                            </span>
                            ${typeBadge}
                            <span style="font-size:0.75rem;color:var(--text-muted);font-weight:700;">
                                ⚖️ ${q.points || 5} Poin
                            </span>
                        </div>
                        <div style="display:flex;gap:6px;">
                            <button type="button" class="btn btn-secondary" onclick="ExamDocImporterUI.deleteQuestion(${idx})" style="padding:4px 10px;font-size:0.75rem;color:var(--danger);border-color:rgba(239,68,68,0.3);" title="Hapus Butir Soal Ini">
                                🗑️ Hapus
                            </button>
                        </div>
                    </div>

                    <!-- TAB 1: 📁 Instruksi / Skenario Kasus / Stimulus (Bisa Buka/Tutup) -->
                    <div class="q-collapsible-block q-section-case" id="exam-prev-block-case-${idx}">
                        <button type="button" class="q-collapse-btn ${q.caseStudy ? 'has-content' : 'is-empty'}" onclick="ExamDocImporterUI.toggleSection(${idx}, 'case')">
                            <div class="q-collapse-btn-left">
                                <span class="q-collapse-icon">📖</span>
                                <span class="q-collapse-title">Instruksi &amp; Skenario Kasus Kontekstual</span>
                                <span class="q-collapse-badge ${q.caseStudy ? 'badge-has-content' : 'badge-empty'}">
                                    ${q.caseStudy ? '✅ Ada Stimulus' : '⚪ Kosong'}
                                </span>
                            </div>
                            <div class="q-collapse-btn-right">
                                <span class="q-collapse-arrow ${q.caseStudy ? 'open' : ''}" id="exam-prev-arrow-case-${idx}">▼</span>
                            </div>
                        </button>
                        <div class="q-collapse-body" id="exam-prev-body-case-${idx}" style="display: ${q.caseStudy ? 'block' : 'none'};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
                                <span style="font-size: 0.74rem; font-weight: 700; color: #fde68a;">
                                    Format Teks Stimulus (Paragraf Berjarak Nyaman):
                                </span>
                                <div style="display: flex; gap: 6px;">
                                    <button type="button" class="btn btn-secondary" id="btn-toggle-exam-case-${idx}" onclick="ExamDocImporterUI.toggleEditCase(${idx})" style="padding: 3px 8px; font-size: 0.72rem;">
                                        ✏️ Edit Teks
                                    </button>
                                    <button type="button" class="btn btn-secondary" onclick="ExamDocImporterUI.autoFormatCase(${idx})" style="padding: 3px 8px; font-size: 0.72rem;">
                                        🧹 Rapikan Paragraf
                                    </button>
                                </div>
                            </div>
                            <div id="exam-prev-case-disp-${idx}" class="case-study-display-box" style="display: block;">
                                ${q.caseStudy ? (typeof formatCaseStudyHtml === 'function' ? formatCaseStudyHtml(q.caseStudy) : `<p class="case-study-p">${escapeHtml(q.caseStudy)}</p>`) : '<p style="margin:0; font-style:italic; color:var(--text-muted); font-size:0.8rem;">Tidak ada stimulus kasus.</p>'}
                            </div>
                            <div id="exam-prev-case-edit-${idx}" style="display: none; margin-top: 8px;">
                                <textarea class="form-control" style="width:100%;font-size:0.84rem;line-height:1.5;resize:vertical;background:rgba(15,23,42,0.75);color:#f8fafc;border:1.5px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px 14px;" rows="4" onchange="ExamDocImporterUI.updateCaseStudy(${idx}, this.value)">${escapeHtml(q.caseStudy || '')}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- TAB 2: 📝 Butir Pertanyaan (Bisa Buka/Tutup) -->
                    <div class="q-collapsible-block" id="exam-prev-block-q-${idx}">
                        <button type="button" class="q-collapse-btn has-content" onclick="ExamDocImporterUI.toggleSection(${idx}, 'q')">
                            <div class="q-collapse-btn-left">
                                <span class="q-collapse-icon">📝</span>
                                <span class="q-collapse-title">Butir Pertanyaan Soal</span>
                                <span class="q-collapse-badge badge-has-content">✅ Terbuka</span>
                            </div>
                            <div class="q-collapse-btn-right">
                                <span class="q-collapse-arrow open" id="exam-prev-arrow-q-${idx}">▼</span>
                            </div>
                        </button>
                        <div class="q-collapse-body" id="exam-prev-body-q-${idx}" style="display: block;">
                            <textarea class="form-control exam-q-textarea" style="width:100%;font-size:0.88rem;font-weight:600;min-height:60px;resize:vertical;line-height:1.55;background:rgba(15,23,42,0.75);color:#f8fafc;border:1.5px solid rgba(255,255,255,0.12);border-radius:10px;padding:12px 14px;" onchange="ExamDocImporterUI.updateQuestionText(${idx}, this.value)">${escapeHtml(q.q)}</textarea>
                        </div>
                    </div>

                    <!-- TAB 3: 🔘 Pilihan Jawaban & Kunci Resmi (Bisa Buka/Tutup) -->
                    <div class="q-collapsible-block" id="exam-prev-block-options-${idx}">
                        <button type="button" class="q-collapse-btn has-content" onclick="ExamDocImporterUI.toggleSection(${idx}, 'options')">
                            <div class="q-collapse-btn-left">
                                <span class="q-collapse-icon">🎯</span>
                                <span class="q-collapse-title">Pilihan Jawaban &amp; Kunci Resmi</span>
                                <span class="q-collapse-badge badge-has-content">🎯 Terkunci Otomatis</span>
                            </div>
                            <div class="q-collapse-btn-right">
                                <span class="q-collapse-arrow open" id="exam-prev-arrow-options-${idx}">▼</span>
                            </div>
                        </button>
                        <div class="q-collapse-body" id="exam-prev-body-options-${idx}" style="display: block;">
                            <div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:8px;">
                                Klik kartu pilihan untuk mengubah atau mengunci kunci jawaban resmi:
                            </div>
                            <div class="exam-prev-options-box" id="prev-options-box-${idx}">
                                ${this.renderOptionsHtml(q, idx)}
                            </div>
                        </div>
                    </div>

                    <!-- TAB 4: 💡 Pembahasan & Hint (Bisa Buka/Tutup) -->
                    <div class="q-collapsible-block" id="exam-prev-block-exp-${idx}">
                        <button type="button" class="q-collapse-btn ${q.explanation ? 'has-content' : 'is-empty'}" onclick="ExamDocImporterUI.toggleSection(${idx}, 'exp')">
                            <div class="q-collapse-btn-left">
                                <span class="q-collapse-icon">💡</span>
                                <span class="q-collapse-title">Pembahasan &amp; Petunjuk Berpikir</span>
                                <span class="q-collapse-badge ${q.explanation ? 'badge-has-content' : 'badge-empty'}">
                                    ${q.explanation ? '✅ Ada Pembahasan' : '⚪ Kosong'}
                                </span>
                            </div>
                            <div class="q-collapse-btn-right">
                                <span class="q-collapse-arrow" id="exam-prev-arrow-exp-${idx}">▼</span>
                            </div>
                        </button>
                        <div class="q-collapse-body" id="exam-prev-body-exp-${idx}" style="display: none;">
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.78rem;">
                                <div>
                                    <label style="font-size:0.72rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:3px;">💡 Pembahasan:</label>
                                    <input type="text" class="form-control" value="${escapeHtml(q.explanation || '')}" placeholder="Keterangan pembahasan..." style="font-size:0.8rem;padding:8px 12px;background:rgba(15,23,42,0.75);color:#f8fafc;border:1.5px solid rgba(255,255,255,0.12);border-radius:8px;" onchange="ExamDocImporterUI.updateExplanation(${idx}, this.value)">
                                </div>
                                <div>
                                    <label style="font-size:0.72rem;font-weight:700;color:var(--text-muted);display:block;margin-bottom:3px;">🔍 Petunjuk / Hint:</label>
                                    <input type="text" class="form-control" value="${escapeHtml(q.hint || '')}" placeholder="Petunjuk berpikir siswa..." style="font-size:0.8rem;padding:8px 12px;background:rgba(15,23,42,0.75);color:#f8fafc;border:1.5px solid rgba(255,255,255,0.12);border-radius:8px;" onchange="ExamDocImporterUI.updateHint(${idx}, this.value)">
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                container.appendChild(card);
            });
        },

        renderOptionsHtml(q, qIdx) {
            const isCheckbox = q.type === 'checkbox';
            const letters = ['A', 'B', 'C', 'D', 'E'];

            return q.options.map((optText, optIdx) => {
                const char = letters[optIdx] || String(optIdx + 1);
                let isSelected = false;

                if (isCheckbox) {
                    isSelected = Array.isArray(q.answer) && q.answer.includes(optIdx);
                } else {
                    isSelected = q.answer === optIdx;
                }

                return `
                    <div class="exam-prev-opt-row ${isSelected ? 'opt-locked-active' : ''}" onclick="ExamDocImporterUI.toggleOptionKey(${qIdx}, ${optIdx})">
                        <div style="display:flex;align-items:center;gap:10px;width:100%;">
                            <span class="exam-prev-opt-char ${isSelected ? 'char-locked' : ''}">
                                ${isSelected ? '✔ ' + char : char}
                            </span>
                            <input type="text" class="form-control" value="${escapeHtml(optText)}" style="flex:1;font-size:0.83rem;border:none;background:transparent;color:var(--text);" onchange="ExamDocImporterUI.updateOptionText(${qIdx}, ${optIdx}, this.value)" onclick="event.stopPropagation();">
                            ${isSelected ? '<span class="badge-locked-pill">KUNCI RESMI 🎯</span>' : ''}
                        </div>
                    </div>
                `;
            }).join('');
        },

        toggleOptionKey(qIdx, optIdx) {
            if (!currentParsedModuleData || !currentParsedModuleData.questions[qIdx]) return;
            const q = currentParsedModuleData.questions[qIdx];

            if (q.type === 'checkbox') {
                if (!Array.isArray(q.answer)) q.answer = [q.answer];
                if (q.answer.includes(optIdx)) {
                    q.answer = q.answer.filter(i => i !== optIdx);
                } else {
                    q.answer.push(optIdx);
                    q.answer.sort((a, b) => a - b);
                }
            } else {
                q.answer = optIdx;
            }

            // Re-render hanya kotak opsi
            const box = document.getElementById(`prev-options-box-${qIdx}`);
            if (box) {
                box.innerHTML = this.renderOptionsHtml(q, qIdx);
            }
        },

        updateCaseStudy(qIdx, val) {
            if (currentParsedModuleData && currentParsedModuleData.questions[qIdx]) {
                currentParsedModuleData.questions[qIdx].caseStudy = val.trim();
            }
        },

        updateQuestionText(qIdx, val) {
            if (currentParsedModuleData && currentParsedModuleData.questions[qIdx]) {
                currentParsedModuleData.questions[qIdx].q = val.trim();
            }
        },

        updateOptionText(qIdx, optIdx, val) {
            if (currentParsedModuleData && currentParsedModuleData.questions[qIdx]) {
                currentParsedModuleData.questions[qIdx].options[optIdx] = val.trim();
            }
        },

        updateExplanation(qIdx, val) {
            if (currentParsedModuleData && currentParsedModuleData.questions[qIdx]) {
                currentParsedModuleData.questions[qIdx].explanation = val.trim();
            }
        },

        updateHint(qIdx, val) {
            if (currentParsedModuleData && currentParsedModuleData.questions[qIdx]) {
                currentParsedModuleData.questions[qIdx].hint = val.trim();
            }
        },

        toggleSection(qIdx, sectionKey) {
            const body = document.getElementById(`exam-prev-body-${sectionKey}-${qIdx}`);
            const arrow = document.getElementById(`exam-prev-arrow-${sectionKey}-${qIdx}`);
            if (!body) return;
            const isHidden = body.style.display === 'none';
            body.style.display = isHidden ? 'block' : 'none';
            if (arrow) arrow.classList.toggle('open', isHidden);
        },

        toggleAllSections(open = true) {
            document.querySelectorAll('[id^="exam-prev-body-"]').forEach(el => {
                el.style.display = open ? 'block' : 'none';
            });
            document.querySelectorAll('[id^="exam-prev-arrow-"]').forEach(el => {
                el.classList.toggle('open', open);
            });
        },

        toggleEditCase(qIdx) {
            const disp = document.getElementById(`exam-prev-case-disp-${qIdx}`);
            const edit = document.getElementById(`exam-prev-case-edit-${qIdx}`);
            const btn = document.getElementById(`btn-toggle-exam-case-${qIdx}`);
            if (!disp || !edit) return;
            const isEditing = edit.style.display === 'block';
            if (isEditing) {
                disp.style.display = 'block';
                edit.style.display = 'none';
                if (btn) btn.innerHTML = '✏️ Edit Teks';
            } else {
                disp.style.display = 'none';
                edit.style.display = 'block';
                if (btn) btn.innerHTML = '👁️ Pratinjau Rapi';
            }
        },

        autoFormatCase(qIdx) {
            if (!currentParsedModuleData || !currentParsedModuleData.questions[qIdx]) return;
            const q = currentParsedModuleData.questions[qIdx];
            if (!q.caseStudy) return;

            const sentences = q.caseStudy.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/);
            if (sentences.length >= 2) {
                const pList = [];
                let cur = [];
                for (let i = 0; i < sentences.length; i++) {
                    cur.push(sentences[i]);
                    if (cur.length >= 2 || i === sentences.length - 1) {
                        pList.push(cur.join(' '));
                        cur = [];
                    }
                }
                q.caseStudy = pList.join('\n\n');
                this.openReviewModal(currentParsedModuleData);
            }
        },

        deleteQuestion(qIdx) {
            if (!currentParsedModuleData) return;
            if (!confirm(`Hapus Butir Soal Nomor ${qIdx + 1}?`)) return;
            currentParsedModuleData.questions.splice(qIdx, 1);
            ExamDocParser.normalizePoints(currentParsedModuleData.questions);
            this.openReviewModal(currentParsedModuleData);
        },

        addNewQuestion() {
            if (!currentParsedModuleData) return;
            const newId = currentParsedModuleData.questions.length + 1;
            currentParsedModuleData.questions.push({
                id: newId,
                type: 'mcq',
                difficulty: 'Medium',
                points: 5,
                caseStudy: null,
                q: 'Ketikkan pertanyaan baru di sini...',
                options: ['Pilihan Jawaban A', 'Pilihan Jawaban B', 'Pilihan Jawaban C', 'Pilihan Jawaban D'],
                answer: 0,
                explanation: '',
                hint: ''
            });
            ExamDocParser.normalizePoints(currentParsedModuleData.questions);
            this.openReviewModal(currentParsedModuleData);
        },

        /**
         * Simpan Paket Soal ke Bank Soal & Terbitkan
         */
        async saveToBankSoal(setActiveForStudents = false) {
            if (!currentParsedModuleData || !window.QuizManager) return;

            const titleEl = document.getElementById('exam-prev-title');
            const catEl = document.getElementById('exam-prev-cat');
            const kkmEl = document.getElementById('exam-prev-kkm');
            const descEl = document.getElementById('exam-prev-desc');

            const title = (titleEl && titleEl.value.trim()) || currentParsedModuleData.title || "Modul Baru";
            const category = (catEl && catEl.value.trim()) || "Informatika & Literasi Digital";
            const kkm = parseInt(kkmEl ? kkmEl.value : 80, 10) || 80;
            const desc = (descEl && descEl.value.trim()) || "Paket soal bank materi kuis.";

            const moduleId = 'modul_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);

            const quizPackage = {
                id: moduleId,
                title: title,
                category: category,
                icon: '📚',
                badge: 'Bank Soal Guru',
                description: desc,
                questionCount: currentParsedModuleData.questions.length,
                kkm: kkm,
                questions: currentParsedModuleData.questions,
                createdAt: new Date().toISOString()
            };

            try {
                if (typeof sfxCorrect === 'function') sfxCorrect();
                await window.QuizManager.saveCustomModule(quizPackage);

                if (setActiveForStudents) {
                    window.QuizManager.setActiveModuleId(moduleId);
                    if (typeof showToast === 'function') {
                        showToast(`🎯 Modul "${title}" berhasil disimpan dan langsung DISETEL AKTIF untuk ujian siswa!`, 'success', 5000);
                    }
                } else {
                    if (typeof showToast === 'function') {
                        showToast(`💾 Modul "${title}" berhasil disimpan ke Bank Soal!`, 'success', 4000);
                    }
                }

                this.closeReviewModal();

                // Segarkan Bank Soal dan Dropdown Modul
                if (typeof renderBankSoalModules === 'function') {
                    renderBankSoalModules();
                }
                if (typeof initModulesCatalog === 'function') {
                    await initModulesCatalog();
                }

                // Pindahkan layar guru ke Bank Soal jika belum
                if (typeof switchTeacherTab === 'function') {
                    switchTeacherTab('bank');
                }

            } catch (err) {
                console.error("Gagal simpan modul ke Bank Soal:", err);
                if (typeof showToast === 'function') showToast(err.message, '⚠️');
            }
        },

        /**
         * Simpan dan langsung buka di Editor G-Form Style
         */
        async saveAndOpenInEditor() {
            if (!currentParsedModuleData || !window.QuizManager) return;
            await this.saveToBankSoal(false);
            if (typeof switchTeacherTab === 'function') {
                switchTeacherTab('editor');
            }
        },

        /**
         * Ekspor JSON Bank Soal langsung ke perangkat
         */
        downloadJson() {
            if (!currentParsedModuleData) return;
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentParsedModuleData, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `${(currentParsedModuleData.title || 'bank_soal').replace(/\s+/g, '_')}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
        }
    };

    function escapeHtml(str) {
        if (!str || typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    window.ExamDocImporterUI = ExamDocImporterUI;

    // Inisialisasi saat DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ExamDocImporterUI.init());
    } else {
        ExamDocImporterUI.init();
    }
})();
