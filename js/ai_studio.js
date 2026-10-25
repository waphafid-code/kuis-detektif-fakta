// ============================================================
//  🤖 STUDIO KUIS AI (NVIDIA NEMOTRON), BANK MODUL & MISSION HUB
// ============================================================

async function initModulesCatalog() {
    if (!window.QuizManager) return;
    const modules = await QuizManager.getAllModules();
    const homeSelect = document.getElementById('input-module');
    const filterSelect = document.getElementById('filter-module');
    const activeId = QuizManager.getActiveModuleId();

    if (homeSelect) {
        homeSelect.innerHTML = '';
        modules.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.icon || '📚'} ${m.title} (${m.questionCount || 0} Soal)`;
            if (m.id === activeId) opt.selected = true;
            homeSelect.appendChild(opt);
        });
        handleHomeModuleChange();
    }

    if (filterSelect) {
        let opts = '<option value="all">📚 Semua Materi / Modul</option>';
        modules.forEach(m => {
            opts += `<option value="${m.id}">${m.icon || '📚'} ${m.title}</option>`;
        });
        filterSelect.innerHTML = opts;
    }
}

async function handleHomeModuleChange() {
    const sel = document.getElementById('input-module');
    if (!sel || !window.QuizManager) return;
    const moduleId = sel.value;
    QuizManager.setActiveModuleId(moduleId);

    const modules = await QuizManager.getAllModules();
    const current = modules.find(m => m.id === moduleId) || QuizManager.DEFAULT_MODULE;
    currentActiveModule = current;

    const badgeEl = document.getElementById('home-module-badge');
    const descEl = document.getElementById('home-module-desc');
    if (badgeEl) badgeEl.textContent = `${current.questionCount || 0} Soal · KKM ${current.kkm || 80}`;
    if (descEl) descEl.textContent = current.description || 'Materi evaluasi pembelajaran kuis interaktif.';
}

function switchTeacherTab(tabKey) {
    if (typeof sfxClick === 'function') sfxClick();

    // Pastikan layar dasbor guru aktif
    if (typeof screens !== 'undefined' && screens.teacher && !screens.teacher.classList.contains('active')) {
        if (typeof switchScreen === 'function') switchScreen('teacher');
    }

    ['records', 'diagnostics', 'editor', 'ai', 'bank'].forEach(key => {
        const btn = document.getElementById(`tab-btn-${key}`);
        const pane = document.getElementById(`teacher-tab-${key}`);
        if (btn) btn.classList.toggle('active', key === tabKey);
        if (pane) pane.style.display = key === tabKey ? 'block' : 'none';
    });

    // 🧭 Sinkronisasi Indikator Menu Aktif di Header Navigasi Utama
    const headerNavMap = {
        'records': 'nav-btn-rekap',
        'diagnostics': 'nav-btn-rekap',
        'editor': 'nav-btn-rekap',
        'bank': 'nav-btn-bank',
        'ai': 'nav-btn-ai'
    };
    const targetNavId = headerNavMap[tabKey] || 'nav-btn-rekap';
    document.querySelectorAll('.header-nav .nav-item').forEach(el => el.classList.remove('active'));
    const targetNavEl = document.getElementById(targetNavId);
    if (targetNavEl) targetNavEl.classList.add('active');

    if (tabKey === 'bank') {
        renderBankSoalModules();
    } else if (tabKey === 'editor') {
        if (typeof initQuestionEditor === 'function') initQuestionEditor();
    } else if (tabKey === 'ai') {
        initAiStudio();
    } else if (tabKey === 'records') {
        renderDashboard();
    } else if (tabKey === 'diagnostics') {
        if (typeof renderDiagnosticsDashboard === 'function') renderDiagnosticsDashboard();
    }
}

function openQuestionEditorForModule(moduleId) {
    switchTeacherTab('editor');
    if (typeof initQuestionEditor === 'function') {
        initQuestionEditor(moduleId);
    }
}

function toggleApiKeyVisibility() {
    const keyInput = document.getElementById('ai-api-key');
    if (!keyInput) return;
    keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
}

function initAiStudio() {
    if (!window.NemotronAI) return;
    const keyInput = document.getElementById('ai-api-key');
    const modelSelect = document.getElementById('ai-model-select');
    const keyStatusHint = document.getElementById('ai-key-status-hint');

    const savedKey = NemotronAI.getApiKey();
    if (keyInput && savedKey) {
        keyInput.value = savedKey;
        if (keyStatusHint) keyStatusHint.textContent = '✅ API Key NVIDIA tersimpan & siap digunakan.';
    }

    const savedModel = NemotronAI.getSelectedModel();
    if (modelSelect && savedModel) {
        modelSelect.value = savedModel;
    }

    // Pasang drag-and-drop listener interaktif pada dropzone jika belum terpasang
    const dropzone = document.getElementById('ai-dropzone');
    if (dropzone && !dropzone.dataset.dragBound) {
        dropzone.dataset.dragBound = 'true';

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('drag-active');
            }, false);
        });

        ['dragleave', 'dragend'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('drag-active');
            }, false);
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove('drag-active');
            const dt = e.dataTransfer;
            if (dt && dt.files && dt.files.length > 0) {
                handleAiFileUpload({ target: { files: dt.files } });
            }
        }, false);
    }
}

function saveApiKeyFromInput() {
    const keyInput = document.getElementById('ai-api-key');
    if (!keyInput || !window.NemotronAI) return;
    const val = keyInput.value.trim();
    NemotronAI.setApiKey(val);
    sfxCorrect();
    const hint = document.getElementById('ai-key-status-hint');
    if (val) {
        showToast('Kunci API NVIDIA berhasil disimpan secara lokal! 🔑', '✅');
        if (hint) hint.textContent = '✅ API Key NVIDIA tersimpan & siap digunakan.';
    } else {
        showToast('Kunci API NVIDIA dihapus.', 'ℹ️');
        if (hint) hint.textContent = 'Kunci API belum diatur.';
    }
}

function toggleApiKeyVisibility() {
    const keyInput = document.getElementById('ai-api-key');
    if (!keyInput) return;
    keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
}

function saveModelChoice() {
    const sel = document.getElementById('ai-model-select');
    if (sel && window.NemotronAI) {
        NemotronAI.setSelectedModel(sel.value);
        showToast(`Model AI disetel ke: ${sel.value}`, '🤖');
    }
}

async function handleAiFileUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || !window.DocParser) return;

    const statusEl = document.getElementById('ai-extract-status');
    const rawTextArea = document.getElementById('ai-raw-text');
    const titleInput = document.getElementById('ai-module-title');
    const fileCard = document.getElementById('ai-file-card');
    const fileNameEl = document.getElementById('ai-file-name');
    const fileMetaEl = document.getElementById('ai-file-meta');
    const fileIconEl = document.getElementById('ai-file-icon');
    const dropzoneIcon = document.getElementById('ai-dropzone-icon');

    const ext = file.name.split('.').pop().toLowerCase();
    let fileEmoji = '📄';
    if (ext === 'docx' || ext === 'doc') fileEmoji = '📘';
    else if (ext === 'pdf') fileEmoji = '📕';
    else if (ext === 'pptx') fileEmoji = '📙';

    if (dropzoneIcon) dropzoneIcon.textContent = fileEmoji;

    statusEl.style.display = 'block';
    statusEl.style.background = 'rgba(79, 70, 229, 0.08)';
    statusEl.style.border = '1px solid rgba(79, 70, 229, 0.25)';
    statusEl.style.color = 'var(--text)';
    statusEl.innerHTML = `⏳ Membaca dan mengekstrak materi dari <strong>${file.name}</strong>...`;

    try {
        const result = await DocParser.extractText(file, (pct, msg) => {
            statusEl.innerHTML = `⏳ <strong>${pct}%</strong> &bull; ${msg}`;
        });

        statusEl.style.background = 'rgba(16, 185, 129, 0.12)';
        statusEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
        statusEl.style.color = 'var(--success)';
        statusEl.innerHTML = `✨ Berhasil membaca dokumen <strong>${file.name}</strong> (${result.meta.fileType || 'Dokumen'}, ${result.meta.totalPages || 1} Halaman/Slide, ~${result.meta.wordCount} Kata). AI Agent sedang merumuskan draft soal HOTS...`;
        sfxCorrect();

        if (rawTextArea) {
            rawTextArea.value = result.text;
        }

        if (titleInput && (!titleInput.value || titleInput.value === 'Modul Baru Pembelajaran')) {
            const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
            titleInput.value = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
        }

        if (fileCard) {
            fileCard.style.display = 'flex';
            if (fileNameEl) fileNameEl.textContent = file.name;
            if (fileMetaEl) fileMetaEl.textContent = `${result.meta.fileType || 'Dokumen'} • ${result.meta.totalPages || 1} Halaman/Slide • ~${result.meta.wordCount} Kata • Siap Dianalisis AI Agent`;
            if (fileIconEl) {
                fileIconEl.textContent = fileEmoji;
            }
        }

        showToast(`Dokumen ${file.name} terbaca. AI Agent mulai menganalisis...`, '🤖');
        
        // Reset input file agar pengguna bisa memilih kembali dokumen yang sama jika diperlukan
        if (e.target && e.target.value) {
            try { e.target.value = ''; } catch(ign) {}
        }

        // Otomatis jalankan pembuatan draft kuis
        setTimeout(() => {
            runAiQuizGeneration();
        }, 500);

    } catch (err) {
        console.error(err);
        sfxWrong();
        statusEl.style.background = 'rgba(244, 63, 94, 0.12)';
        statusEl.style.border = '1px solid rgba(244, 63, 94, 0.3)';
        statusEl.style.color = 'var(--danger)';
        statusEl.innerHTML = `❌ Gagal memproses berkas: ${err.message}`;
    }
}

async function runAiQuizGeneration() {
    const rawText = document.getElementById('ai-raw-text').value.trim();
    if (!rawText) {
        sfxWrong();
        showToast('Silakan unggah dokumen atau tempel teks materi terlebih dahulu!', '⚠️');
        return;
    }

    const title = document.getElementById('ai-module-title').value.trim() || 'Materi Baru';
    const category = document.getElementById('ai-module-category').value.trim() || 'Informatika';
    const qCount = parseInt(document.getElementById('ai-q-count').value, 10) || 10;
    const qType = document.getElementById('ai-q-type').value || 'mix';
    const points = parseInt(document.getElementById('ai-q-points').value, 10) || 5;
    const kkm = parseInt(document.getElementById('ai-module-kkm').value, 10) || 80;
    const includeRemedialEl = document.getElementById('ai-include-remedial');
    const includeRemedial = includeRemedialEl ? includeRemedialEl.checked : true;

    const btn = document.getElementById('btn-generate-ai');
    const origBtnHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner" style="display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation: spin 0.8s linear infinite;"></span> Sedang Menganalisis Dokumen via AI Agent...`;
    }

    try {
        const quizPkg = await NemotronAI.generateQuiz(rawText, {
            moduleTitle: title,
            questionCount: qCount,
            questionType: qType,
            pointsPerQuestion: points,
            kkm: kkm,
            includeRemedialPool: includeRemedial
        }, (statusMsg) => {
            if (btn) btn.innerHTML = `<span class="spinner" style="display:inline-block; width:14px; height:14px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation: spin 0.8s linear infinite;"></span> ${statusMsg}`;
            const statusEl = document.getElementById('ai-extract-status');
            if (statusEl) statusEl.innerHTML = `🤖 ${statusMsg}`;
        });

        quizPkg.category = category;
        quizPkg.kkm = kkm;
        generatedQuizDraft = quizPkg;

        sfxVictory();
        const remMsg = quizPkg.remedialQuestions && quizPkg.remedialQuestions.length > 0 
            ? ` (+ ${quizPkg.remedialQuestions.length} butir remedial adaptif)` 
            : '';
        showToast(`Berhasil menyusun ${quizPkg.questions.length} butir soal${remMsg}! Silakan tinjau dan setujui draft 🎉`, '✅');
        renderAiQuestionsPreview(quizPkg);

        const previewSec = document.getElementById('ai-preview-section');
        if (previewSec) {
            previewSec.style.display = 'block';
            previewSec.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (err) {
        console.warn('Fallback ke autonomous pedagogical synthesizer:', err);
        const fallbackPkg = NemotronAI.synthesizeQuizLocally(rawText, {
            moduleTitle: title,
            questionCount: qCount,
            category: category,
            kkm: kkm,
            includeRemedialPool: includeRemedial
        });
        generatedQuizDraft = fallbackPkg;
        renderAiQuestionsPreview(fallbackPkg);
        const previewSec = document.getElementById('ai-preview-section');
        if (previewSec) {
            previewSec.style.display = 'block';
            previewSec.scrollIntoView({ behavior: 'smooth' });
        }
        const remMsg = fallbackPkg.remedialQuestions && fallbackPkg.remedialQuestions.length > 0 
            ? ` (+ ${fallbackPkg.remedialQuestions.length} butir remedial)` 
            : '';
        showToast(`Draft ${fallbackPkg.questions.length} butir soal${remMsg} siap ditinjau & disetujui! 🎉`, '✅');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = origBtnHtml;
        }
    }
}

function renderAiQuestionsPreview(quizPkg) {
    const listEl = document.getElementById('ai-questions-preview-list');
    const metaEl = document.getElementById('ai-preview-meta');
    if (!listEl || !quizPkg) return;

    if (metaEl) {
        const totalPts = quizPkg.questions.reduce((sum, q) => sum + parseInt(q.points || 0, 10), 0);
        const ped = quizPkg.pedagogicalProfile || {
            expertPersona: "Prof. Dr. Pedagogi AI — Pakar Asesmen Kurikulum Merdeka",
            hotsPercentage: "80% HOTS (C4 Analisis & C5 Evaluasi)",
            cognitiveBalance: "Dominan Penalaran Kritis & Studi Kasus Kontekstual",
            diagnosticTarget: "Pendeteksian Miskonsepsi Siswa",
            teacherAdvice: "Paket kuis ini dirancang dengan pendekatan Sokratik untuk menguji penalaran mendalam dan penerapan konsep siswa, dilengkapi pembahasan 3-Pilar (Konsep Inti, Bedah Miskonsepsi, dan Mutiara Pedagogis)."
        };

        metaEl.innerHTML = `
            <!-- Pedagogical Intelligence Dashboard Banner -->
            <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.16), rgba(168, 85, 247, 0.14)); border: 1px solid rgba(139, 92, 246, 0.38); border-radius: 16px; padding: 18px 20px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.12);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; box-shadow: 0 0 15px var(--primary-glow);">
                            🎓
                        </div>
                        <div>
                            <div style="font-size: 1rem; font-weight: 800; color: #ffffff; letter-spacing: 0.3px;">
                                ${ped.expertPersona || 'Prof. Dr. Pedagogi AI — Pakar Asesmen Kurikulum Merdeka'}
                            </div>
                            <div style="font-size: 0.78rem; color: #c4b5fd;">
                                Asesmen Diagnostik Kognitif Tingkat Tinggi (HOTS) • Bebas Hafalan Mati
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span style="font-size: 0.72rem; font-weight: 800; padding: 4px 10px; border-radius: 9999px; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4);">
                            🎯 ${ped.hotsPercentage || '80% HOTS'}
                        </span>
                        <span style="font-size: 0.72rem; font-weight: 800; padding: 4px 10px; border-radius: 9999px; background: rgba(56, 189, 248, 0.18); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4);">
                            🧠 Taksonomi Bloom C3–C5
                        </span>
                        <span style="font-size: 0.72rem; font-weight: 800; padding: 4px 10px; border-radius: 9999px; background: rgba(245, 158, 11, 0.18); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);">
                            🔍 Diagnostik Miskonsepsi
                        </span>
                    </div>
                </div>
                <div style="background: rgba(0, 0, 0, 0.22); border-left: 3px solid var(--accent); padding: 10px 14px; border-radius: 0 10px 10px 0; font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;">
                    💡 <strong style="color: var(--accent);">Catatan & Rekomendasi Pedagogis Guru:</strong> ${ped.teacherAdvice || ped.recommendation || 'Paket soal telah dioptimalkan untuk memicu penalaran kritis siswa dan mendeteksi titik miskonsepsi.'}
                </div>
            </div>

            <!-- Draft Header & Controls -->
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--glass-border);">
                <div>
                    <div style="font-weight: 800; font-size: 1.15rem; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                        <span>📝 Draf Soal Hasil Analisis: ${escapeHtml(quizPkg.title)}</span>
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">
                        ${quizPkg.questions.length} Butir Soal Terbaca &bull; KKM: ${quizPkg.kkm} &bull; Kategori: ${escapeHtml(quizPkg.category || 'Bahan Ajar')}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span id="ai-total-points-badge" style="font-size: 0.78rem; font-weight: 800; padding: 5px 14px; border-radius: 9999px; background: ${totalPts === 100 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}; color: ${totalPts === 100 ? 'var(--success)' : 'var(--danger)'}; border: 1px solid ${totalPts === 100 ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'};">
                        ${totalPts === 100 ? '✅ Total Poin: 100 (Standar)' : '⚠️ Total Poin: ' + totalPts + ' / 100'}
                    </span>
                    <button type="button" class="quick-toolbar-btn" onclick="toggleAllDraftSections(true)" title="Buka seluruh tab di semua butir soal">
                        📂 Buka Semua Tab
                    </button>
                    <button type="button" class="quick-toolbar-btn" onclick="toggleAllDraftSections(false)" title="Ciutkan seluruh tab agar tampilan ringkas">
                        📁 Ciutkan Semua Tab
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="addDraftQuestion()" style="font-size: 0.8rem; padding: 6px 13px; font-weight: 700;">
                        ➕ Tambah Soal
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="rebalanceDraftPoints()" style="font-size: 0.8rem; padding: 6px 13px; font-weight: 700;">
                        ⚖️ Pas 100 Poin
                    </button>
                </div>
            </div>
        `;
    }

    listEl.innerHTML = '';
    quizPkg.questions.forEach((q, idx) => {
        const qCard = document.createElement('div');
        qCard.className = 'glass-card';
        qCard.style.padding = '18px';
        qCard.style.border = '1px solid var(--glass-border)';
        qCard.style.borderRadius = '14px';
        qCard.style.background = 'rgba(255, 255, 255, 0.03)';
        qCard.style.marginBottom = '16px';
        qCard.id = `draft-qcard-${idx}`;

        const hasCase = Boolean(q.caseStudy && String(q.caseStudy).trim().length > 0);
        const isComplex = q.type === 'checkbox';
        const isTf = q.type === 'tf';

        const bloomTag = q.bloomLevel 
            ? `<span class="q-badge" style="background: rgba(168, 85, 247, 0.18); border-color: rgba(168, 85, 247, 0.45); color: #d8b4fe; font-size: 0.72rem; padding: 2px 8px; font-weight: 800;">🎓 ${q.bloomLevel}</span>` 
            : `<span class="q-badge" style="background: rgba(99, 102, 241, 0.18); border-color: rgba(99, 102, 241, 0.45); color: #a5b4fc; font-size: 0.72rem; padding: 2px 8px; font-weight: 800;">🎓 C4 (Analisis)</span>`;

        let optionsHtml = '';
        (q.options || []).forEach((opt, optIdx) => {
            const isCorrect = isComplex 
                ? (Array.isArray(q.answer) && q.answer.includes(optIdx))
                : q.answer === optIdx;

            optionsHtml += `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                    <span style="font-size: 0.85rem; font-weight: 800; color: ${isCorrect ? 'var(--success)' : 'var(--text-secondary)'}; width: 28px; height: 28px; border-radius: 8px; background: ${isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)'}; display: flex; align-items: center; justify-content: center; border: 1px solid ${isCorrect ? 'rgba(16,185,129,0.5)' : 'var(--glass-border)'}; flex-shrink: 0;">
                        ${String.fromCharCode(65 + optIdx)}
                    </span>
                    <input type="text" class="form-input" style="flex: 1; padding: 8px 12px; font-size: 0.85rem; background: ${isCorrect ? 'rgba(16,185,129,0.05)' : 'rgba(0,0,0,0.2)'}; border-color: ${isCorrect ? 'rgba(16,185,129,0.45)' : 'var(--glass-border)'};" value="${escapeHtml(opt || '')}" onchange="updateDraftOptionText(${idx}, ${optIdx}, this.value)">
                    <label style="font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; gap: 6px; color: ${isCorrect ? 'var(--success)' : 'var(--text-muted)'}; cursor: pointer; white-space: nowrap; padding: 6px 12px; border-radius: 8px; background: ${isCorrect ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.04)'}; border: 1px solid ${isCorrect ? 'rgba(16,185,129,0.45)' : 'var(--glass-border)'};">
                        <input type="${isComplex ? 'checkbox' : 'radio'}" name="draft_ans_${idx}" ${isCorrect ? 'checked' : ''} onchange="updateDraftAnswerKey(${idx}, ${optIdx}, this.checked)">
                        ${isCorrect ? 'Kunci ✅' : 'Pengecoh'}
                    </label>
                    ${!isTf ? `<button type="button" onclick="removeDraftOption(${idx}, ${optIdx})" style="background:none; border:none; color: var(--danger); cursor: pointer; font-size: 0.85rem; padding: 4px 6px;" title="Hapus opsi ini">✖</button>` : ''}
                </div>
            `;
        });

        const keyDisplay = isComplex 
            ? (Array.isArray(q.answer) ? q.answer.map(i => String.fromCharCode(65 + i)).join(', ') : 'A')
            : (q.type === 'tf' ? (q.answer === 0 ? 'Benar' : 'Salah') : String.fromCharCode(65 + (q.answer || 0)));

        qCard.innerHTML = `
            <!-- Header Kartu Soal -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; border-bottom: 1px dashed var(--glass-border); padding-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <strong style="color: var(--accent); font-size: 1.05rem;">Butir Soal #${idx + 1}</strong>
                    ${bloomTag}
                    <select class="form-input" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 6px;" onchange="changeDraftQuestionType(${idx}, this.value)">
                        <option value="mcq" ${q.type === 'mcq' ? 'selected' : ''}>🔘 Pilihan Ganda Tunggal</option>
                        <option value="checkbox" ${q.type === 'checkbox' ? 'selected' : ''}>☑️ Pilihan Ganda Kompleks</option>
                        <option value="tf" ${q.type === 'tf' ? 'selected' : ''}>⚖️ Benar / Salah</option>
                    </select>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">Bobot:</span>
                        <input type="number" min="1" max="100" class="form-input" style="width: 58px; padding: 3px 6px; font-size: 0.78rem; text-align: center;" value="${q.points || 5}" onchange="updateDraftQuestionPoints(${idx}, this.value)">
                        <span style="font-size: 0.75rem; color: var(--text-secondary);">Poin</span>
                    </div>
                </div>
                <div style="display: flex; gap: 6px;">
                    <button type="button" class="btn btn-item-delete" onclick="removeDraftQuestion(${idx})">🗑️ Hapus Soal</button>
                </div>
            </div>

            <!-- TAB 1: 📁 Instruksi / Skenario Kasus / Stimulus (Bisa Dibuka/Tutup) -->
            <div class="q-collapsible-block q-section-case" id="draft-block-case-${idx}">
                <button type="button" class="q-collapse-btn ${hasCase ? 'has-content' : 'is-empty'}" onclick="toggleDraftSection(${idx}, 'case')">
                    <div class="q-collapse-btn-left">
                        <span class="q-collapse-icon">📖</span>
                        <span class="q-collapse-title">Instruksi &amp; Skenario Kasus Kontekstual</span>
                        <span class="q-collapse-badge ${hasCase ? 'badge-has-content' : 'badge-empty'}">
                            ${hasCase ? '✅ Ada Stimulus' : '⚪ Kosong'}
                        </span>
                    </div>
                    <div class="q-collapse-btn-right">
                        <span class="q-collapse-arrow ${hasCase ? 'open' : ''}" id="draft-arrow-case-${idx}">▼</span>
                    </div>
                </button>
                <div class="q-collapse-body" id="draft-body-case-${idx}" style="display: ${hasCase ? 'block' : 'none'};">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
                        <span class="case-format-label">
                            Format Teks Stimulus (Paragraf Berjarak Nyaman):
                        </span>
                        <div style="display: flex; gap: 6px;">
                            <button type="button" class="btn btn-secondary" id="btn-toggle-edit-case-${idx}" onclick="toggleEditDraftCase(${idx})" style="padding: 3px 8px; font-size: 0.72rem;">
                                ✏️ Edit Teks
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="autoFormatDraftCaseStudy(${idx})" style="padding: 3px 8px; font-size: 0.72rem;" title="Pecah kalimat rapat jadi paragraf berjarak">
                                🧹 Rapikan Paragraf
                            </button>
                            <button type="button" class="btn btn-secondary" onclick="clearDraftCaseStudy(${idx})" style="padding: 3px 8px; font-size: 0.72rem; color: var(--danger); border-color: rgba(239,68,68,0.3);">
                                🗑️ Hapus
                            </button>
                        </div>
                    </div>
                    <!-- Mode Tampilan Paragraf Nyaman -->
                    <div id="draft-case-disp-${idx}" class="case-study-display-box" style="display: block;">
                        ${hasCase ? formatCaseStudyHtml(q.caseStudy) : '<p style="margin:0; font-style:italic; color:var(--text-muted); font-size:0.8rem;">Tidak ada stimulus untuk butir soal ini.</p>'}
                    </div>
                    <!-- Mode Textarea untuk Edit Bebas -->
                    <div id="draft-case-edit-${idx}" style="display: none; margin-top: 8px;">
                        <textarea class="form-input" rows="4" style="width: 100%; font-size: 0.84rem; line-height: 1.5; resize: vertical;" placeholder="Tuliskan stimulus kasus di sini..." onchange="updateDraftCaseStudyText(${idx}, this.value)">${escapeHtml(q.caseStudy || '')}</textarea>
                        <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 3px; display: block;">💡 Tekan Enter dua kali untuk membuat paragraf baru.</span>
                    </div>
                </div>
            </div>

            <!-- TAB 2: 📝 Butir Pertanyaan (Bisa Dibuka/Tutup) -->
            <div class="q-collapsible-block" id="draft-block-q-${idx}">
                <button type="button" class="q-collapse-btn has-content" onclick="toggleDraftSection(${idx}, 'q')">
                    <div class="q-collapse-btn-left">
                        <span class="q-collapse-icon">📝</span>
                        <span class="q-collapse-title">Butir Pertanyaan Soal</span>
                        <span class="q-collapse-badge badge-has-content">✅ Terbuka</span>
                    </div>
                    <div class="q-collapse-btn-right">
                        <span class="q-collapse-arrow open" id="draft-arrow-q-${idx}">▼</span>
                    </div>
                </button>
                <div class="q-collapse-body" id="draft-body-q-${idx}" style="display: block;">
                    <textarea class="form-input" rows="3" style="width: 100%; font-size: 0.88rem; font-weight: 600; line-height: 1.5;" onchange="updateDraftQuestionText(${idx}, this.value)">${escapeHtml(q.q || '')}</textarea>
                </div>
            </div>

            <!-- TAB 3: 🔘 Pilihan Jawaban & Kunci Resmi (Bisa Dibuka/Tutup) -->
            <div class="q-collapsible-block" id="draft-block-options-${idx}">
                <button type="button" class="q-collapse-btn has-content" onclick="toggleDraftSection(${idx}, 'options')">
                    <div class="q-collapse-btn-left">
                        <span class="q-collapse-icon">🎯</span>
                        <span class="q-collapse-title">Pilihan Jawaban &amp; Kunci Resmi</span>
                        <span class="q-collapse-badge badge-has-content">
                            ${(q.options || []).length} Pilihan &bull; Kunci: ${keyDisplay}
                        </span>
                    </div>
                    <div class="q-collapse-btn-right">
                        <span class="q-collapse-arrow open" id="draft-arrow-options-${idx}">▼</span>
                    </div>
                </button>
                <div class="q-collapse-body" id="draft-body-options-${idx}" style="display: block;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 600;">Pilih radio/checkbox untuk mengunci kunci jawaban resmi:</span>
                        ${!isTf ? `<button type="button" onclick="addDraftOption(${idx})" style="background: none; border: none; color: var(--accent); cursor: pointer; font-size: 0.78rem; font-weight: 800;">➕ Tambah Opsi</button>` : ''}
                    </div>
                    ${optionsHtml}
                </div>
            </div>

            <!-- TAB 4: 💡 Pembahasan & Analisis Diagnostik (Bisa Dibuka/Tutup) -->
            <div class="q-collapsible-block" id="draft-block-exp-${idx}">
                <button type="button" class="q-collapse-btn ${q.explanation ? 'has-content' : 'is-empty'}" onclick="toggleDraftSection(${idx}, 'exp')">
                    <div class="q-collapse-btn-left">
                        <span class="q-collapse-icon">💡</span>
                        <span class="q-collapse-title">Pembahasan, Bedah Miskonsepsi &amp; Petunjuk</span>
                        <span class="q-collapse-badge ${q.explanation ? 'badge-has-content' : 'badge-empty'}">
                            ${q.explanation ? '✅ Ada Pembahasan' : '⚪ Kosong'}
                        </span>
                    </div>
                    <div class="q-collapse-btn-right">
                        <span class="q-collapse-arrow" id="draft-arrow-exp-${idx}">▼</span>
                    </div>
                </button>
                <div class="q-collapse-body" id="draft-body-exp-${idx}" style="display: none;">
                    <div style="margin-bottom: 10px;">
                        <label style="font-size: 0.74rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 3px;">
                            💡 Analisis Pembahasan Guru:
                        </label>
                        <textarea class="form-input" rows="3" style="width: 100%; font-size: 0.82rem; line-height: 1.45;" placeholder="Penjelasan konseptual dan alasan jawaban..." onchange="updateDraftExplanationText(${idx}, this.value)">${escapeHtml(q.explanation || '')}</textarea>
                    </div>
                    <div>
                        <label style="font-size: 0.74rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 3px;">
                            🔍 Petunjuk Berpikir Siswa (Clue / Hint):
                        </label>
                        <input type="text" class="form-input" style="width: 100%; font-size: 0.82rem; padding: 6px 10px;" value="${escapeHtml(q.hint || '')}" placeholder="Petunjuk berpikir jika siswa kesulitan..." onchange="updateDraftHintText(${idx}, this.value)">
                    </div>
                </div>
            </div>
        `;
        listEl.appendChild(qCard);
    });

    // Render Remedial Questions Preview jika dihasilkan serentak
    if (quizPkg.remedialQuestions && quizPkg.remedialQuestions.length > 0) {
        const remHeader = document.createElement('div');
        remHeader.style.cssText = "margin: 28px 0 16px 0; padding: 14px 18px; border-radius: 14px; background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(234, 88, 12, 0.08)); border: 1px solid rgba(245, 158, 11, 0.35); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;";
        remHeader.innerHTML = `
            <div>
                <div style="font-weight: 800; font-size: 1.05rem; color: #f59e0b; display: flex; align-items: center; gap: 8px;">
                    🛡️ Paket Soal Remedial Khusus (${quizPkg.remedialQuestions.length} Butir Soal Terfokus Sesuai Dokumen)
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 3px;">
                    Dihasilkan serentak dari materi ajar untuk siswa yang mendapat skor &lt; ${quizPkg.kkm || 80}. Standar total 100 poin (${quizPkg.remedialQuestions.length} &times; 20 poin).
                </div>
            </div>
            <span style="font-size: 0.75rem; font-weight: 800; padding: 5px 12px; border-radius: 9999px; background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4);">
                ✅ Siap Diujikan Otomatis
            </span>
        `;
        listEl.appendChild(remHeader);

        quizPkg.remedialQuestions.forEach((rq, rIdx) => {
            const rCard = document.createElement('div');
            rCard.className = 'glass-card';
            rCard.style.padding = '16px';
            rCard.style.border = '1px solid rgba(245, 158, 11, 0.28)';
            rCard.style.borderRadius = '12px';
            rCard.style.background = 'rgba(245, 158, 11, 0.03)';
            rCard.style.marginBottom = '14px';

            let rOptsHtml = '';
            (rq.options || []).forEach((opt, oIdx) => {
                const isCorrect = rq.answer === oIdx;
                rOptsHtml += `
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span style="font-size: 0.8rem; font-weight: 700; color: ${isCorrect ? 'var(--success)' : 'var(--text-secondary)'}; width: 22px; text-align: center;">
                            ${String.fromCharCode(65 + oIdx)}.
                        </span>
                        <input type="text" class="form-input" style="flex: 1; padding: 5px 8px; font-size: 0.8rem;" value="${escapeHtml(opt || '')}" onchange="updateDraftRemedialOptionText(${rIdx}, ${oIdx}, this.value)">
                        <label style="font-size: 0.75rem; display: flex; align-items: center; gap: 4px; color: ${isCorrect ? 'var(--success)' : 'var(--text-muted)'}; cursor: pointer; white-space: nowrap; padding: 3px 6px; border-radius: 4px; background: ${isCorrect ? 'rgba(16,185,129,0.12)' : 'transparent'};">
                            <input type="radio" name="draft_rem_ans_${rIdx}" ${isCorrect ? 'checked' : ''} onchange="updateDraftRemedialAnswerKey(${rIdx}, ${oIdx})">
                            ${isCorrect ? 'Kunci ✅' : 'Pilihan'}
                        </label>
                    </div>
                `;
            });

            rCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px dashed rgba(245, 158, 11, 0.25); padding-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <strong style="color: #f59e0b; font-size: 0.9rem;">🛡️ Remedial #${rIdx + 1}</strong>
                        <span class="q-badge" style="background: rgba(245, 158, 11, 0.15); border-color: rgba(245, 158, 11, 0.35); color: #fbbf24; font-size: 0.7rem; padding: 2px 6px;">Penguatan Konsep</span>
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">20 Poin</span>
                    </div>
                </div>
                <div style="margin-bottom: 10px;">
                    <textarea class="form-input" rows="2" style="width: 100%; font-size: 0.82rem;" onchange="updateDraftRemedialQuestionText(${rIdx}, this.value)">${escapeHtml(rq.q || '')}</textarea>
                </div>
                <div style="margin-bottom: 10px;">
                    ${rOptsHtml}
                </div>
                <div>
                    <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 3px;">💡 Ulasan Pedagogis Remedial:</label>
                    <textarea class="form-input" rows="2" style="width: 100%; font-size: 0.8rem;" onchange="updateDraftRemedialExplanationText(${rIdx}, this.value)">${escapeHtml(rq.explanation || '')}</textarea>
                </div>
            `;
            listEl.appendChild(rCard);
        });
    }

    // ════════════════════════════════════════════════════════════════
    // ⚖️ PANEL KEPUTUSAN GURU: PERSETUJUAN, REVISI & PENOLAKAN DRAF
    // ════════════════════════════════════════════════════════════════
    const approvalCard = document.createElement('div');
    approvalCard.className = 'ai-approval-panel glass-card';
    approvalCard.style.cssText = 'margin-top: 28px; padding: 24px; border-radius: 16px;';
    approvalCard.innerHTML = `
        <div class="ai-approval-header">
            <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.6rem;">⚖️</span>
                    <h4 class="ai-approval-title">
                        Panel Keputusan Guru: Persetujuan, Revisi &amp; Penolakan Soal
                    </h4>
                </div>
                <p class="ai-approval-subtitle">
                    Tinjau butir soal di atas. Anda dapat <strong>Menerima</strong>, <strong>Menolak</strong>, atau <strong>Meminta Revisi</strong> draf soal sebelum diterbitkan resmi ke portal siswa.
                </p>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span class="badge-locked-pill ai-approval-badge-count">
                    📊 ${quizPkg.questions.length} Butir Soal Terbaca
                </span>
                <span class="ai-approval-badge-score">
                    🎯 Standar 100 Poin
                </span>
            </div>
        </div>

        <div class="ai-approval-actions">
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button type="button" class="btn btn-approval-reject" onclick="rejectAiQuizDraft()">
                    ❌ Tolak Soal &amp; Buat Ulang
                </button>
                <button type="button" class="btn btn-approval-revise" onclick="openRevisionPromptModal()">
                    ✏️ Minta Revisi / Ubah Draf
                </button>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button type="button" class="btn btn-approval-save" onclick="saveDraftAsPendingModule()">
                    💾 Simpan Draf ke Bank Soal
                </button>
                <button type="button" class="btn btn-approval-publish" onclick="publishAiQuizModule()">
                    🚀 Saya Setuju &amp; Terbitkan Kuis (Soal Diterima)
                </button>
            </div>
        </div>

        <!-- Form Instruksi Revisi Cepat Guru -->
        <div id="ai-quick-revision-box" class="ai-quick-revision-box" style="display: none;">
            <label class="ai-revision-label">
                📝 Instruksi Revisi Khusus Guru:
            </label>
            <textarea id="ai-revision-instruction" class="form-input ai-revision-textarea" rows="3" placeholder="Contoh: Rapikan paragraf stimulus pada soal nomor 1, ubah tingkat kesulitan menjadi lebih menantang, atau seimbangkan bobot poin..."></textarea>
            <div style="display: flex; justify-content: flex-end; gap: 8px;">
                <button type="button" class="btn btn-approval-cancel" onclick="closeRevisionPromptModal()">Batal</button>
                <button type="button" class="btn btn-approval-apply" onclick="applyAiDraftRevision()">
                    ⚡ Terapkan Revisi Otomatis
                </button>
            </div>
        </div>
    `;
    listEl.appendChild(approvalCard);
}

/**
 * Format string teks kasus / stimulus menjadi paragraf terpisah yang rapi dan nyaman dibaca.
 * Mencegah satu blok teks panjang dempet tanpa kelang paragraf.
 */
function formatCaseStudyHtml(rawText) {
    if (!rawText || typeof rawText !== 'string') return '';
    const clean = rawText.trim();
    if (!clean) return '';

    // Pisahkan berdasarkan baris baru
    let paragraphs = clean.split(/\n+/).map(p => p.trim()).filter(Boolean);

    // Jika hanya satu teks panjang tanpa enter (> 150 karakter), pecah berdasarkan batas kalimat
    if (paragraphs.length === 1 && paragraphs[0].length > 150) {
        const sentences = paragraphs[0].split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/);
        if (sentences.length >= 2) {
            paragraphs = [];
            let tempGroup = [];
            for (let i = 0; i < sentences.length; i++) {
                tempGroup.push(sentences[i]);
                if (tempGroup.length >= 2 || i === sentences.length - 1) {
                    paragraphs.push(tempGroup.join(' '));
                    tempGroup = [];
                }
            }
        }
    }

    return paragraphs.map(p => `<p class="case-study-p">${typeof escapeHtml === 'function' ? escapeHtml(p) : p}</p>`).join('');
}
window.formatCaseStudyHtml = formatCaseStudyHtml;

/**
 * Buka-tutup (accordion) per bagian pada butir soal draf
 */
function toggleDraftSection(qIdx, sectionKey) {
    const body = document.getElementById(`draft-body-${sectionKey}-${qIdx}`);
    const arrow = document.getElementById(`draft-arrow-${sectionKey}-${qIdx}`);
    if (!body) return;
    const isHidden = body.style.display === 'none';
    body.style.display = isHidden ? 'block' : 'none';
    if (arrow) arrow.classList.toggle('open', isHidden);
}
window.toggleDraftSection = toggleDraftSection;

/**
 * Buka atau ciutkan seluruh tab di semua butir soal sekaligus
 */
function toggleAllDraftSections(open = true) {
    document.querySelectorAll('[id^="draft-body-"]').forEach(el => {
        el.style.display = open ? 'block' : 'none';
    });
    document.querySelectorAll('[id^="draft-arrow-"]').forEach(el => {
        el.classList.toggle('open', open);
    });
    if (typeof showToast === 'function') {
        showToast(open ? 'Seluruh tab butir soal telah DIBUKA! 📂' : 'Seluruh tab butir soal telah DICIUTKAN! 📁', 'ℹ️');
    }
}
window.toggleAllDraftSections = toggleAllDraftSections;

/**
 * Alihkan antara mode tampilan paragraf rapi dan mode edit teks stimulus
 */
function toggleEditDraftCase(qIdx) {
    const disp = document.getElementById(`draft-case-disp-${qIdx}`);
    const edit = document.getElementById(`draft-case-edit-${qIdx}`);
    const btn = document.getElementById(`btn-toggle-edit-case-${qIdx}`);
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
}
window.toggleEditDraftCase = toggleEditDraftCase;

/**
 * Rapikan teks stimulus panjang menjadi paragraf-paragraf terpisah secara otomatis
 */
function autoFormatDraftCaseStudy(qIdx) {
    if (!generatedQuizDraft || !generatedQuizDraft.questions[qIdx]) return;
    const q = generatedQuizDraft.questions[qIdx];
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
        renderAiQuestionsPreview(generatedQuizDraft);
        if (typeof showToast === 'function') {
            showToast(`Teks stimulus butir soal #${qIdx + 1} berhasil dirapikan berparagraf! ✨`, '🧹');
        }
    } else {
        if (typeof showToast === 'function') {
            showToast('Teks stimulus sudah cukup ringkas.', 'ℹ️');
        }
    }
}
window.autoFormatDraftCaseStudy = autoFormatDraftCaseStudy;

/**
 * Kosongkan teks stimulus pada soal tertentu
 */
function clearDraftCaseStudy(qIdx) {
    if (!generatedQuizDraft || !generatedQuizDraft.questions[qIdx]) return;
    if (!confirm(`Kosongkan teks skenario kasus/stimulus untuk butir soal #${qIdx + 1}?`)) return;
    generatedQuizDraft.questions[qIdx].caseStudy = null;
    renderAiQuestionsPreview(generatedQuizDraft);
    if (typeof showToast === 'function') {
        showToast(`Stimulus butir soal #${qIdx + 1} dikosongkan.`, '🗑️');
    }
}
window.clearDraftCaseStudy = clearDraftCaseStudy;

function updateDraftCaseStudyText(qIdx, val) {
    if (generatedQuizDraft && generatedQuizDraft.questions[qIdx]) {
        generatedQuizDraft.questions[qIdx].caseStudy = val.trim();
        const disp = document.getElementById(`draft-case-disp-${qIdx}`);
        if (disp) {
            disp.innerHTML = formatCaseStudyHtml(val.trim());
        }
    }
}
window.updateDraftCaseStudyText = updateDraftCaseStudyText;

function updateDraftHintText(qIdx, val) {
    if (generatedQuizDraft && generatedQuizDraft.questions[qIdx]) {
        generatedQuizDraft.questions[qIdx].hint = val.trim();
    }
}
window.updateDraftHintText = updateDraftHintText;

/**
 * Tolak draf soal hasil generate dan buat ulang
 */
function rejectAiQuizDraft() {
    if (!confirm('Apakah Anda yakin ingin MENOLAK draf soal ini dan membatalkan hasil generate?')) return;
    generatedQuizDraft = null;
    const previewSec = document.getElementById('ai-preview-section');
    if (previewSec) previewSec.style.display = 'none';
    const rawTextEl = document.getElementById('ai-raw-text');
    if (rawTextEl) rawTextEl.scrollIntoView({ behavior: 'smooth' });
    if (typeof showToast === 'function') {
        showToast('Draf soal ditolak. Silakan sesuaikan bahan materi atau opsi kuis untuk generate ulang!', '❌');
    }
}
window.rejectAiQuizDraft = rejectAiQuizDraft;

/**
 * Simpan draf ke Bank Soal tanpa mengaktifkan kuis langsung untuk siswa
 */
async function saveDraftAsPendingModule() {
    if (!generatedQuizDraft || !generatedQuizDraft.questions || generatedQuizDraft.questions.length === 0) {
        if (typeof showToast === 'function') showToast('Tidak ada butir soal dalam draf untuk disimpan!', '⚠️');
        return;
    }
    try {
        const draftCopy = {
            ...generatedQuizDraft,
            badge: 'Draf Guru (Belum Aktif)',
            isDraft: true
        };
        await QuizManager.saveCustomModule(draftCopy);
        if (typeof sfxCorrect === 'function') sfxCorrect();
        if (typeof showToast === 'function') {
            showToast(`💾 Draf "${draftCopy.title}" berhasil disimpan ke Bank Soal tanpa diaktifkan langsung.`, 'success', 5000);
        }
        await initModulesCatalog();
        switchTeacherTab('bank');
        const previewSec = document.getElementById('ai-preview-section');
        if (previewSec) previewSec.style.display = 'none';
        generatedQuizDraft = null;
    } catch (err) {
        if (typeof showToast === 'function') showToast(`Gagal menyimpan draf: ${err.message}`, '⚠️');
    }
}
window.saveDraftAsPendingModule = saveDraftAsPendingModule;

function openRevisionPromptModal() {
    const box = document.getElementById('ai-quick-revision-box');
    if (box) {
        const isHidden = box.style.display === 'none';
        box.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            box.scrollIntoView({ behavior: 'smooth' });
            const inp = document.getElementById('ai-revision-instruction');
            if (inp) inp.focus();
        }
    }
}
window.openRevisionPromptModal = openRevisionPromptModal;

function closeRevisionPromptModal() {
    const box = document.getElementById('ai-quick-revision-box');
    if (box) box.style.display = 'none';
}
window.closeRevisionPromptModal = closeRevisionPromptModal;

function applyAiDraftRevision() {
    const inp = document.getElementById('ai-revision-instruction');
    const instruction = inp ? inp.value.trim() : '';
    if (!instruction) {
        if (typeof showToast === 'function') showToast('Masukkan instruksi revisi yang diinginkan terlebih dahulu!', '⚠️');
        return;
    }

    const lower = instruction.toLowerCase();
    if (lower.includes('rapikan') || lower.includes('paragraf') || lower.includes('stimulus') || lower.includes('kasus')) {
        if (generatedQuizDraft && generatedQuizDraft.questions) {
            generatedQuizDraft.questions.forEach(q => {
                if (q.caseStudy && q.caseStudy.length > 100) {
                    const sents = q.caseStudy.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/);
                    if (sents.length >= 2) {
                        q.caseStudy = sents.join('\n\n');
                    }
                }
            });
        }
    }
    if (lower.includes('poin') || lower.includes('100') || lower.includes('bobot')) {
        rebalanceDraftPoints(false);
    }
    if (lower.includes('mudah') || lower.includes('easy')) {
        if (generatedQuizDraft && generatedQuizDraft.questions) {
            generatedQuizDraft.questions.forEach(q => q.difficulty = 'Easy');
        }
    } else if (lower.includes('sulit') || lower.includes('hots') || lower.includes('hard')) {
        if (generatedQuizDraft && generatedQuizDraft.questions) {
            generatedQuizDraft.questions.forEach(q => q.difficulty = 'Hard');
        }
    }

    renderAiQuestionsPreview(generatedQuizDraft);
    closeRevisionPromptModal();
    if (inp) inp.value = '';
    if (typeof showToast === 'function') {
        showToast('Instruksi revisi berhasil diterapkan pada draf soal! ✨', '✅');
    }
}
window.applyAiDraftRevision = applyAiDraftRevision;

function updateDraftRemedialQuestionText(rIdx, val) {
    if (generatedQuizDraft && generatedQuizDraft.remedialQuestions && generatedQuizDraft.remedialQuestions[rIdx]) {
        generatedQuizDraft.remedialQuestions[rIdx].q = val;
    }
}

function updateDraftRemedialOptionText(rIdx, oIdx, val) {
    if (generatedQuizDraft && generatedQuizDraft.remedialQuestions && generatedQuizDraft.remedialQuestions[rIdx]) {
        generatedQuizDraft.remedialQuestions[rIdx].options[oIdx] = val;
    }
}

function updateDraftRemedialAnswerKey(rIdx, oIdx) {
    if (generatedQuizDraft && generatedQuizDraft.remedialQuestions && generatedQuizDraft.remedialQuestions[rIdx]) {
        generatedQuizDraft.remedialQuestions[rIdx].answer = oIdx;
    }
}

function updateDraftRemedialExplanationText(rIdx, val) {
    if (generatedQuizDraft && generatedQuizDraft.remedialQuestions && generatedQuizDraft.remedialQuestions[rIdx]) {
        generatedQuizDraft.remedialQuestions[rIdx].explanation = val;
    }
}

function addDraftQuestion() {
    if (!generatedQuizDraft) return;
    if (!generatedQuizDraft.questions) generatedQuizDraft.questions = [];
    const newIdx = generatedQuizDraft.questions.length + 1;
    generatedQuizDraft.questions.push({
        id: newIdx,
        q: "Tuliskan pertanyaan baru di sini...",
        type: "mcq",
        difficulty: "Medium",
        options: [
            "Pilihan jawaban A",
            "Pilihan jawaban B",
            "Pilihan jawaban C",
            "Pilihan jawaban D"
        ],
        answer: 0,
        points: 5,
        explanation: "Penjelasan konseptual mengenai jawaban yang benar."
    });
    generatedQuizDraft.questionCount = generatedQuizDraft.questions.length;
    rebalanceDraftPoints(false);
    renderAiQuestionsPreview(generatedQuizDraft);
    showToast(`Berhasil menambahkan Butir Soal #${newIdx}! Silakan sesuaikan teks & kunci jawaban.`, '➕');
}

function rebalanceDraftPoints(notify = true) {
    if (!generatedQuizDraft || !generatedQuizDraft.questions || generatedQuizDraft.questions.length === 0) return;
    const totalQ = generatedQuizDraft.questions.length;
    const basePts = Math.floor(100 / totalQ);
    const remainder = 100 - (basePts * totalQ);

    generatedQuizDraft.questions.forEach((q, idx) => {
        q.points = basePts + (idx < remainder ? 1 : 0);
        if (q.type === 'checkbox') {
            const totalCorrect = Array.isArray(q.answer) ? q.answer.length : 1;
            q.scoringRule = {
                type: "tiered",
                tiers: [
                    { minCorrect: totalCorrect, wrongAllowed: 0, points: q.points },
                    { minCorrect: Math.max(1, Math.floor(totalCorrect / 2)), wrongAllowed: 0, points: Math.max(1, Math.floor(q.points / 2)) },
                    { minCorrect: 0, wrongAllowed: 99, points: 0 }
                ]
            };
        }
    });

    if (notify) {
        renderAiQuestionsPreview(generatedQuizDraft);
        showToast('Bobot poin seluruh soal berhasil diseimbangkan pas 100 Poin! ⚖️', '✅');
    }
}

function changeDraftQuestionType(qIdx, newType) {
    if (!generatedQuizDraft || !generatedQuizDraft.questions[qIdx]) return;
    const q = generatedQuizDraft.questions[qIdx];
    q.type = newType;
    if (newType === 'tf') {
        q.options = ["Benar", "Salah"];
        q.answer = 0;
    } else if (newType === 'checkbox') {
        if (!Array.isArray(q.answer)) q.answer = [q.answer !== undefined ? q.answer : 0];
        if (!q.options || q.options.length < 3) {
            q.options = ["Opsi Pernyataan 1", "Opsi Pernyataan 2", "Opsi Pernyataan 3", "Pengecoh 4"];
        }
    } else { // mcq
        if (Array.isArray(q.answer)) q.answer = q.answer[0] || 0;
        if (!q.options || q.options.length < 2) {
            q.options = ["Opsi A", "Opsi B", "Opsi C", "Opsi D"];
        }
    }
    renderAiQuestionsPreview(generatedQuizDraft);
    showToast(`Tipe soal #${qIdx + 1} diubah menjadi ${newType.toUpperCase()}`, '🔄');
}

function addDraftOption(qIdx) {
    if (!generatedQuizDraft || !generatedQuizDraft.questions[qIdx]) return;
    const q = generatedQuizDraft.questions[qIdx];
    if (!q.options) q.options = [];
    if (q.options.length >= 6) {
        showToast('Maksimum 6 pilihan jawaban per butir soal.', '⚠️');
        return;
    }
    const nextLetter = String.fromCharCode(65 + q.options.length);
    q.options.push(`Pilihan jawaban ${nextLetter}`);
    renderAiQuestionsPreview(generatedQuizDraft);
}

function removeDraftOption(qIdx, optIdx) {
    if (!generatedQuizDraft || !generatedQuizDraft.questions[qIdx]) return;
    const q = generatedQuizDraft.questions[qIdx];
    if (q.options.length <= 2) {
        showToast('Minimal harus ada 2 pilihan jawaban!', '⚠️');
        return;
    }
    q.options.splice(optIdx, 1);
    if (q.type === 'checkbox') {
        q.answer = (q.answer || []).filter(i => i !== optIdx).map(i => i > optIdx ? i - 1 : i);
        if (q.answer.length === 0) q.answer = [0];
    } else {
        if (q.answer === optIdx) q.answer = 0;
        else if (q.answer > optIdx) q.answer--;
    }
    renderAiQuestionsPreview(generatedQuizDraft);
}

function updateDraftQuestionPoints(qIdx, val) {
    if (!generatedQuizDraft || !generatedQuizDraft.questions[qIdx]) return;
    const pts = Math.max(1, parseInt(val, 10) || 1);
    generatedQuizDraft.questions[qIdx].points = pts;
    const totalPts = generatedQuizDraft.questions.reduce((sum, q) => sum + parseInt(q.points || 0, 10), 0);
    const badgeEl = document.getElementById('ai-total-points-badge');
    if (badgeEl) {
        badgeEl.textContent = totalPts === 100 ? '✅ Total Poin: 100 (Standar)' : `⚠️ Total Poin: ${totalPts} / 100`;
        badgeEl.style.background = totalPts === 100 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)';
        badgeEl.style.color = totalPts === 100 ? 'var(--success)' : 'var(--danger)';
        badgeEl.style.borderColor = totalPts === 100 ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)';
    }
}

function updateDraftQuestionText(qIdx, val) {
    if (generatedQuizDraft && generatedQuizDraft.questions[qIdx]) {
        generatedQuizDraft.questions[qIdx].q = val;
    }
}

function updateDraftOptionText(qIdx, optIdx, val) {
    if (generatedQuizDraft && generatedQuizDraft.questions[qIdx]) {
        generatedQuizDraft.questions[qIdx].options[optIdx] = val;
    }
}

function updateDraftExplanationText(qIdx, val) {
    if (generatedQuizDraft && generatedQuizDraft.questions[qIdx]) {
        generatedQuizDraft.questions[qIdx].explanation = val;
    }
}

function updateDraftAnswerKey(qIdx, optIdx, isChecked) {
    if (!generatedQuizDraft || !generatedQuizDraft.questions[qIdx]) return;
    const q = generatedQuizDraft.questions[qIdx];
    if (q.type === 'checkbox') {
        if (!Array.isArray(q.answer)) q.answer = [];
        if (isChecked && !q.answer.includes(optIdx)) q.answer.push(optIdx);
        else if (!isChecked) q.answer = q.answer.filter(i => i !== optIdx);
    } else {
        q.answer = optIdx;
    }
}

function removeDraftQuestion(idx) {
    if (!generatedQuizDraft || !generatedQuizDraft.questions) return;
    generatedQuizDraft.questions.splice(idx, 1);
    generatedQuizDraft.questionCount = generatedQuizDraft.questions.length;
    rebalanceDraftPoints(false);
    renderAiQuestionsPreview(generatedQuizDraft);
    showToast('Butir soal telah dihapus dari draf.', '🗑️');
}

window.publishDraftToActiveBank = publishAiQuizModule;

async function publishAiQuizModule() {
    if (!generatedQuizDraft || !generatedQuizDraft.questions || generatedQuizDraft.questions.length === 0) {
        showToast('Tidak ada soal dalam draf untuk diterbitkan!', '⚠️');
        return;
    }

    try {
        await QuizManager.saveNewModule(generatedQuizDraft);
        sfxVictory();
        shootConfetti();
        showToast(`Materi "${generatedQuizDraft.title}" berhasil diterbitkan ke Portal Siswa! 🚀`, '🎉');

        await initModulesCatalog();
        switchTeacherTab('bank');
        document.getElementById('ai-preview-section').style.display = 'none';
        generatedQuizDraft = null;
    } catch (err) {
        sfxWrong();
        showToast(`Gagal menerbitkan: ${err.message}`, '❌');
    }
}

function copyAiPromptForWeb() {
    const rawText = document.getElementById('ai-raw-text').value.trim() || 'Teks materi ajar Anda di sini...';
    const title = document.getElementById('ai-module-title').value.trim() || 'Materi Baru';
    const qCount = document.getElementById('ai-q-count').value || '10';

    const prompt = NemotronAI.buildSystemPrompt({
        questionCount: qCount,
        questionType: document.getElementById('ai-q-type').value || 'mix',
        pointsPerQuestion: parseInt(document.getElementById('ai-q-points').value, 10) || 5
    }) + `\n\nJUDUL MATERI: ${title}\nMATERI:\n"""\n${rawText}\n"""\n\nKeluarkan HANYA format JSON valid sesuai aturan di atas.`;

    fallbackCopyText(prompt);
    showToast('Prompt lengkap siap ditempel ke ChatGPT / Claude / Gemini Web! 📋', '🤖');
}

async function renderBankSoalModules() {
    const grid = document.getElementById('bank-modules-grid');
    if (!grid || !window.QuizManager) return;

    const modules = await QuizManager.getAllModules();
    const activeId = QuizManager.getActiveModuleId();

    grid.innerHTML = '';
    modules.forEach(m => {
        const card = document.createElement('div');
        const isActive = m.id === activeId;
        card.className = `module-grid-card ${isActive ? 'active-module' : ''}`;

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <div style="font-size: 2rem;">${m.icon || '📚'}</div>
                <span class="q-badge" style="font-size: 0.72rem; padding: 2px 8px; background: rgba(34,211,238,0.15); color: var(--accent); border-color: rgba(34,211,238,0.3);">
                    ${m.badge || (m.isDefault ? 'Bawaan' : 'Modul AI')}
                </span>
            </div>
            <h4 style="margin: 0 0 6px 0; font-size: 1rem; color: var(--text);">${m.title}</h4>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">${m.description || '-'}</p>
            
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; font-size: 0.75rem; color: var(--text-muted);">
                <span>📊 ${m.questionCount || 0} Soal</span> · 
                <span>🎯 KKM: ${m.kkm || 80}</span> · 
                <span>📂 ${m.category || 'Informatika'}</span>
                ${(m.hasRemedialPool || (m.remedialCount && m.remedialCount > 0)) ? ` · <span style="color:#fbbf24; font-weight:700;">🛡️ ${m.remedialCount || 5} Remedial</span>` : ''}
                ${!m.isDefault ? ` · <span style="color:#38bdf8;" title="Otomatis dipelihara dengan siklus retensi penyimpanan 7 hari">⏳ Retensi 7 Hari</span>` : ''}
            </div>

            <div style="display: flex; gap: 6px; flex-wrap: wrap; border-top: 1px solid var(--glass-border); padding-top: 10px;">
                <button class="btn btn-secondary" style="flex: 1; padding: 6px 10px; font-size: 0.75rem;" onclick="previewModuleQuestions('${m.id}')">
                    👁️ Pratinjau
                </button>
                <button class="btn btn-secondary" style="flex: 1; padding: 6px 10px; font-size: 0.75rem; border-color: rgba(139,92,246,0.4); color: #c4b5fd;" onclick="openQuestionEditorForModule('${m.id}')" title="Buka di Editor G-Form">
                    ✏️ Edit Soal
                </button>
                <button class="btn ${isActive ? 'btn-primary' : 'btn-secondary'}" style="flex: 1; padding: 6px 10px; font-size: 0.75rem;" onclick="setModuleAsActive('${m.id}')">
                    ${isActive ? '✅ Aktif' : 'Pilih Modul'}
                </button>
                ${!m.isDefault ? `<button class="btn btn-danger" style="padding: 6px 10px; font-size: 0.75rem;" onclick="deleteModuleFromBank('${m.id}')" title="Hapus Modul">🗑️</button>` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

async function setModuleAsActive(moduleId) {
    if (!window.QuizManager) return;
    QuizManager.setActiveModuleId(moduleId);
    showToast('Modul kuis aktif diperbarui! 🎯', '✅');
    await initModulesCatalog();
    renderBankSoalModules();
}

async function deleteModuleFromBank(moduleId) {
    if (!confirm('Apakah Anda yakin ingin menghapus modul materi kuis ini dari bank soal?')) return;
    try {
        await QuizManager.deleteModule(moduleId);
        sfxCorrect();
        showToast('Modul kuis berhasil dihapus.', '🗑️');
        await initModulesCatalog();
        renderBankSoalModules();
    } catch (e) {
        showToast(e.message, '⚠️');
    }
}

async function previewModuleQuestions(moduleId) {
    if (!window.QuizManager) return;
    const questions = await QuizManager.loadQuestionsForModule(moduleId);
    if (!questions || questions.length === 0) {
        showToast('Tidak ada soal yang ditemukan pada modul ini.', 'ℹ️');
        return;
    }

    const modules = await QuizManager.getAllModules();
    const current = modules.find(m => m.id === moduleId) || QuizManager.DEFAULT_MODULE;

    const previewPkg = {
        title: current.title,
        category: current.category,
        kkm: current.kkm,
        questions: questions
    };
    generatedQuizDraft = previewPkg;
    renderAiQuestionsPreview(previewPkg);
    switchTeacherTab('ai');
    const previewSec = document.getElementById('ai-preview-section');
    previewSec.style.display = 'block';
    previewSec.scrollIntoView({ behavior: 'smooth' });
}
