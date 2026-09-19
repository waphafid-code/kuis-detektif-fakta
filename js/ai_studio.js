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
                    <div style="font-weight: 800; font-size: 1.15rem; color: var(--primary);">📝 Draft Soal Hasil Analisis Dokumen: ${quizPkg.title}</div>
                    <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 2px;">
                        ${quizPkg.questions.length} Butir Soal Terbaca • KKM: ${quizPkg.kkm} • Kategori: ${quizPkg.category || 'Bahan Ajar'}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    <span id="ai-total-points-badge" style="font-size: 0.78rem; font-weight: 800; padding: 5px 14px; border-radius: 9999px; background: ${totalPts === 100 ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}; color: ${totalPts === 100 ? 'var(--success)' : 'var(--danger)'}; border: 1px solid ${totalPts === 100 ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'};">
                        ${totalPts === 100 ? '✅ Total Poin: 100 (Standar)' : '⚠️ Total Poin: ' + totalPts + ' / 100'}
                    </span>
                    <button type="button" class="btn btn-secondary" onclick="addDraftQuestion()" style="font-size: 0.8rem; padding: 6px 13px; font-weight: 700;">
                        ➕ Tambah Soal
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="rebalanceDraftPoints()" style="font-size: 0.8rem; padding: 6px 13px; font-weight: 700;">
                        ⚖️ Pas 100 Poin
                    </button>
                    <button type="button" class="btn btn-primary" onclick="publishAiQuizModule()" style="font-size: 0.82rem; padding: 6px 16px; font-weight: 800;">
                        💾 Terbitkan ke Bank Soal
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

        const isComplex = q.type === 'checkbox';
        const isTf = q.type === 'tf';

        const bloomTag = q.bloomLevel 
            ? `<span class="q-badge" style="background: rgba(168, 85, 247, 0.18); border-color: rgba(168, 85, 247, 0.45); color: #d8b4fe; font-size: 0.72rem; padding: 2px 8px; font-weight: 800;">🎓 ${q.bloomLevel}</span>` 
            : `<span class="q-badge" style="background: rgba(99, 102, 241, 0.18); border-color: rgba(99, 102, 241, 0.45); color: #a5b4fc; font-size: 0.72rem; padding: 2px 8px; font-weight: 800;">🎓 C4 (Analisis)</span>`;

        let caseHtml = '';
        if (q.caseStudy) {
            caseHtml = `
                <div style="background: rgba(234, 179, 8, 0.06); border-left: 3px solid var(--warning); padding: 8px 12px; border-radius: 0 8px 8px 0; margin-bottom: 10px; font-size: 0.83rem; color: #fde68a;">
                    <strong>📁 Skenario Kasus Kontekstual:</strong> ${q.caseStudy}
                </div>
            `;
        }

        let optionsHtml = '';
        (q.options || []).forEach((opt, optIdx) => {
            const isCorrect = isComplex 
                ? (Array.isArray(q.answer) && q.answer.includes(optIdx))
                : q.answer === optIdx;

            optionsHtml += `
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span style="font-size: 0.8rem; font-weight: 700; color: ${isCorrect ? 'var(--success)' : 'var(--text-secondary)'}; width: 24px; text-align: center;">
                        ${String.fromCharCode(65 + optIdx)}.
                    </span>
                    <input type="text" class="form-input" style="flex: 1; padding: 6px 10px; font-size: 0.82rem;" value="${(opt || '').replace(/"/g, '&quot;')}" onchange="updateDraftOptionText(${idx}, ${optIdx}, this.value)">
                    <label style="font-size: 0.75rem; display: flex; align-items: center; gap: 4px; color: ${isCorrect ? 'var(--success)' : 'var(--text-muted)'}; cursor: pointer; white-space: nowrap; padding: 4px 8px; border-radius: 6px; background: ${isCorrect ? 'rgba(16,185,129,0.12)' : 'transparent'};">
                        <input type="${isComplex ? 'checkbox' : 'radio'}" name="draft_ans_${idx}" ${isCorrect ? 'checked' : ''} onchange="updateDraftAnswerKey(${idx}, ${optIdx}, this.checked)">
                        ${isCorrect ? 'Kunci ✅' : 'Pengecoh'}
                    </label>
                    ${!isTf ? `<button type="button" onclick="removeDraftOption(${idx}, ${optIdx})" style="background:none; border:none; color: var(--danger); cursor: pointer; font-size: 0.8rem; padding: 2px 4px;" title="Hapus opsi ini">✖</button>` : ''}
                </div>
            `;
        });

        qCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; border-bottom: 1px dashed var(--glass-border); padding-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                    <strong style="color: var(--accent); font-size: 1rem;">Butir Soal #${idx + 1}</strong>
                    ${bloomTag}
                    <select class="form-input" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 6px;" onchange="changeDraftQuestionType(${idx}, this.value)">
                        <option value="mcq" ${q.type === 'mcq' ? 'selected' : ''}>🔘 Pilihan Ganda Biasa</option>
                        <option value="checkbox" ${q.type === 'checkbox' ? 'selected' : ''}>☑️ Pilihan Ganda Kompleks</option>
                        <option value="tf" ${q.type === 'tf' ? 'selected' : ''}>⚖️ Benar / Salah</option>
                    </select>
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">Bobot:</span>
                        <input type="number" min="1" max="100" class="form-input" style="width: 60px; padding: 3px 6px; font-size: 0.78rem; text-align: center;" value="${q.points || 5}" onchange="updateDraftQuestionPoints(${idx}, this.value)">
                        <span style="font-size: 0.75rem; color: var(--text-secondary);">Poin</span>
                    </div>
                </div>
                <div style="display: flex; gap: 6px;">
                    <button type="button" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.72rem; color: #fda4af; border-color: rgba(244,63,94,0.4);" onclick="removeDraftQuestion(${idx})">🗑️ Hapus Soal</button>
                </div>
            </div>

            ${caseHtml}

            <div style="margin-bottom: 12px;">
                <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 4px;">Teks Pertanyaan (Dapat diedit bebas):</label>
                <textarea class="form-input" rows="2" style="width: 100%; font-size: 0.85rem;" onchange="updateDraftQuestionText(${idx}, this.value)">${q.q}</textarea>
            </div>

            <div style="margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin: 0;">Pilihan Jawaban & Kunci:</label>
                    ${!isTf ? `<button type="button" onclick="addDraftOption(${idx})" style="background: none; border: none; color: var(--accent); cursor: pointer; font-size: 0.75rem; font-weight: 700;">➕ Tambah Opsi</button>` : ''}
                </div>
                ${optionsHtml}
            </div>

            <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 4px;">💡 Pembahasan / Cita Dokumen:</label>
                <textarea class="form-input" rows="2" style="width: 100%; font-size: 0.82rem;" onchange="updateDraftExplanationText(${idx}, this.value)">${q.explanation || ''}</textarea>
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
                        <input type="text" class="form-input" style="flex: 1; padding: 5px 8px; font-size: 0.8rem;" value="${(opt || '').replace(/"/g, '&quot;')}" onchange="updateDraftRemedialOptionText(${rIdx}, ${oIdx}, this.value)">
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
                    <textarea class="form-input" rows="2" style="width: 100%; font-size: 0.82rem;" onchange="updateDraftRemedialQuestionText(${rIdx}, this.value)">${rq.q}</textarea>
                </div>
                <div style="margin-bottom: 10px;">
                    ${rOptsHtml}
                </div>
                <div>
                    <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 3px;">💡 Ulasan Pedagogis Remedial:</label>
                    <textarea class="form-input" rows="2" style="width: 100%; font-size: 0.8rem;" onchange="updateDraftRemedialExplanationText(${rIdx}, this.value)">${rq.explanation || ''}</textarea>
                </div>
            `;
            listEl.appendChild(rCard);
        });
    }
}

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
