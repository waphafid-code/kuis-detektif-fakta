/**
 * 📝 G-FORM STYLE QUESTION BUILDER & EDITOR
 * Memungkinkan Guru untuk membuat, mengedit, menambah, dan menghapus butir soal
 * secara visual mirip antarmuka Google Forms dengan kustomisasi tipe soal & poin.
 */

let currentEditingModuleId = null;
let currentEditingQuestions = [];

async function initQuestionEditor(moduleId = null) {
    if (!window.QuizManager) return;
    const modules = await QuizManager.getAllModules();
    const select = document.getElementById('editor-module-select');
    if (!select) return;

    select.innerHTML = '';
    modules.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = `${m.icon || '📚'} ${m.title} (${m.questionCount || 0} Soal)`;
        select.appendChild(opt);
    });

    const targetId = moduleId || QuizManager.getActiveModuleId() || (modules[0] ? modules[0].id : null);
    if (targetId) {
        select.value = targetId;
        await loadModuleIntoEditor(targetId);
    }
}

async function onEditorModuleChange() {
    const select = document.getElementById('editor-module-select');
    if (!select) return;
    await loadModuleIntoEditor(select.value);
}

async function loadModuleIntoEditor(moduleId) {
    currentEditingModuleId = moduleId;
    const questions = await QuizManager.loadQuestionsForModule(moduleId);
    // Deep clone to allow discarding edits
    currentEditingQuestions = JSON.parse(JSON.stringify(questions || []));
    renderQuestionEditorList();
}

function renderQuestionEditorList() {
    const container = document.getElementById('editor-questions-container');
    const summaryBadge = document.getElementById('editor-summary-badge');
    if (!container) return;

    container.innerHTML = '';
    const totalPoints = currentEditingQuestions.reduce((acc, q) => acc + (parseInt(q.points, 10) || 5), 0);

    // ⚖️ 100-Point Validation Banner (Stitch Requirement)
    const banner = document.createElement('div');
    if (totalPoints === 100) {
        banner.className = 'points-validation-banner valid';
        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.4rem;">✅</span>
                <div>
                    <div style="font-weight: 800; color: var(--success); font-size: 0.9rem;">
                        Total Bobot Modul: 100 / 100 Poin (Ideal & Sesuai Standar Ujian)
                    </div>
                    <div style="font-size: 0.76rem; color: var(--text-secondary);">
                        Seluruh ${currentEditingQuestions.length} butir soal telah memenuhi ketentuan skor maksimal 100.
                    </div>
                </div>
            </div>
            <div style="font-size: 0.78rem; font-weight: 800; color: var(--success); background: rgba(16,185,129,0.15); padding: 4px 12px; border-radius: 9999px;">
                Maksimal 100 Poin
            </div>
        `;
    } else {
        banner.className = 'points-validation-banner warning';
        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.5rem;">⚠️</span>
                <div>
                    <div style="font-weight: 800; color: var(--danger); font-size: 0.92rem;">
                        Peringatan Standar Ujian: Total Saat Ini ${totalPoints} Poin (Wajib Tepat 100 Poin!)
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">
                        ${totalPoints > 100 ? `Kelebihan ${totalPoints - 100} poin.` : `Kekurangan ${100 - totalPoints} poin.`} Setiap modul ujian wajib bernilai total maksimal 100 poin.
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" type="button" onclick="autoNormalizeQuestionsTo100()" style="padding: 6px 16px; font-size: 0.8rem; font-weight: 800;">
                ⚖️ Normalisasi Otomatis ke 100 Poin
            </button>
        `;
    }
    container.appendChild(banner);

    currentEditingQuestions.forEach((q, idx) => {
        const pts = q.points !== undefined ? q.points : 5;

        const card = document.createElement('div');
        card.className = 'gform-card';
        card.id = `q-card-${idx}`;
        card.style.cssText = `
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid var(--glass-border);
            border-left: 4px solid var(--primary);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
            position: relative;
            transition: all 0.25s ease;
        `;

        card.innerHTML = `
            <!-- Top Card Header -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-family: var(--font-mono); font-weight: 800; color: var(--accent); font-size: 1.1rem;">
                        #${idx + 1}
                    </span>
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Butir Soal</span>
                </div>
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <!-- Question Type -->
                    <select class="form-select" style="padding: 6px 10px; font-size: 0.8rem; width: auto;" onchange="updateQuestionType(${idx}, this.value)">
                        <option value="mcq" ${q.type === 'mcq' ? 'selected' : ''}>🔘 Pilihan Ganda (Tunggal)</option>
                        <option value="checkbox" ${q.type === 'checkbox' ? 'selected' : ''}>☑️ Pilihan Ganda Kompleks (Checkbox)</option>
                        <option value="tf" ${q.type === 'tf' ? 'selected' : ''}>⚖️ Benar / Salah (Tunggal)</option>
                        <option value="matrix_tf" ${q.type === 'matrix_tf' ? 'selected' : ''}>⚖️ Matriks Pernyataan (Benar / Salah)</option>
                    </select>

                    <!-- Difficulty -->
                    <select class="form-select" style="padding: 6px 10px; font-size: 0.8rem; width: auto;" onchange="updateQuestionDifficulty(${idx}, this.value)">
                        <option value="Easy" ${q.difficulty === 'Easy' ? 'selected' : ''}>🟢 Mudah</option>
                        <option value="Medium" ${q.difficulty === 'Medium' ? 'selected' : ''}>🟡 Sedang</option>
                        <option value="Hard" ${q.difficulty === 'Hard' ? 'selected' : ''}>🔴 Sulit (HOTS)</option>
                    </select>

                    <!-- Points -->
                    <div style="display: flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 8px; border: 1px solid var(--glass-border);">
                        <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">POIN:</span>
                        <input type="number" min="1" max="100" value="${pts}" style="width: 55px; background: transparent; border: none; color: #facc15; font-weight: 800; font-family: var(--font-mono); font-size: 0.85rem; text-align: center;" onchange="updateQuestionPoints(${idx}, this.value)">
                    </div>
                </div>
            </div>

            <!-- Case Study / Stimulus Input (Optional) -->
            <div style="margin-bottom: 12px;">
                <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: block; margin-bottom: 4px;">
                    📖 Teks Stimulus / Studi Kasus (Opsional):
                </label>
                <textarea class="form-input" rows="2" placeholder="Masukkan cerita, kasus, atau data pendukung (bisa dikosongkan)..." style="font-size: 0.85rem; width: 100%; resize: vertical;" onchange="updateQuestionCaseStudy(${idx}, this.value)">${q.caseStudy || ''}</textarea>
            </div>

            <!-- Question Textarea -->
            <div style="margin-bottom: 16px;">
                <label style="font-size: 0.8rem; font-weight: 700; color: var(--text); display: block; margin-bottom: 4px;">
                    ❓ Pertanyaan Soal:
                </label>
                <textarea class="form-input" rows="2" placeholder="Tuliskan butir pertanyaan di sini..." style="font-size: 0.95rem; width: 100%; font-weight: 600; resize: vertical;" onchange="updateQuestionText(${idx}, this.value)">${q.q || ''}</textarea>
            </div>

            <!-- Options Area (G-Form Style) -->
            <div style="background: rgba(0,0,0,0.2); border-radius: 12px; padding: 14px; margin-bottom: 14px; border: 1px dashed var(--glass-border);">
                <div style="font-size: 0.78rem; font-weight: 700; color: var(--accent); margin-bottom: 10px; display: flex; justify-content: space-between;">
                    <span>🎯 ${q.type === 'matrix_tf' ? 'Daftar Pernyataan & Kunci [Benar / Salah] (1 Baris = 1 Pilihan):' : 'Pilihan Jawaban (Pilih jawaban BENAR):'}</span>
                    <span style="color: var(--text-muted); font-size: 0.72rem;">${q.type === 'matrix_tf' ? 'Setiap baris wajib Benar atau Salah' : (q.type === 'checkbox' ? 'Bisa pilih lebih dari 1' : 'Pilih 1 kunci')}</span>
                </div>
                <div id="options-list-${idx}" style="display: flex; flex-direction: column; gap: 8px;">
                    ${renderOptionsRows(q, idx)}
                </div>
                ${q.type !== 'tf' ? `
                    <button class="btn btn-secondary" type="button" onclick="addOptionToQuestion(${idx})" style="margin-top: 10px; padding: 6px 14px; font-size: 0.78rem;">
                        ➕ ${q.type === 'matrix_tf' ? 'Tambah Baris Pernyataan' : 'Tambah Pilihan Jawaban'}
                    </button>
                ` : ''}

                <!-- Tiered Scoring Settings for Checkbox Questions -->
                ${q.type === 'checkbox' ? renderTieredScoringBox(q, idx) : ''}
            </div>

            <!-- Explanation / Pembahasan -->
            <div style="margin-bottom: 14px;">
                <label style="font-size: 0.75rem; font-weight: 700; color: #34d399; display: block; margin-bottom: 4px;">
                    💡 Pembahasan & Umpan Balik (Ditampilkan ke siswa setelah menjawab):
                </label>
                <textarea class="form-input" rows="2" placeholder="Tuliskan penjelasan kenapa jawaban tersebut benar..." style="font-size: 0.82rem; width: 100%; resize: vertical;" onchange="updateQuestionExplanation(${idx}, this.value)">${q.explanation || ''}</textarea>
            </div>

            <!-- Card Bottom Bar: Actions -->
            <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--glass-border); padding-top: 12px;">
                <button class="btn btn-secondary" type="button" onclick="moveQuestionUp(${idx})" ${idx === 0 ? 'disabled' : ''} title="Geser Naik" style="padding: 6px 10px; font-size: 0.8rem;">
                    ⬆️
                </button>
                <button class="btn btn-secondary" type="button" onclick="moveQuestionDown(${idx})" ${idx === currentEditingQuestions.length - 1 ? 'disabled' : ''} title="Geser Turun" style="padding: 6px 10px; font-size: 0.8rem;">
                    ⬇️
                </button>
                <button class="btn btn-secondary" type="button" onclick="duplicateQuestion(${idx})" style="padding: 6px 12px; font-size: 0.8rem;" title="Gandakan Soal">
                    📋 Duplikat
                </button>
                <button class="btn btn-danger" type="button" onclick="deleteQuestion(${idx})" style="padding: 6px 12px; font-size: 0.8rem;" title="Hapus Soal">
                    🗑️ Hapus
                </button>
            </div>
        `;

        container.appendChild(card);
    });

    if (summaryBadge) {
        summaryBadge.textContent = `${currentEditingQuestions.length} Butir Soal • Total Skor: ${totalPoints} Poin`;
    }
}

function renderOptionsRows(q, qIdx) {
    if (q.type === 'matrix_tf') {
        const answers = Array.isArray(q.answer) ? q.answer : [];
        return (q.options || []).map((opt, oIdx) => {
            const rowVal = answers[oIdx] !== undefined ? answers[oIdx] : 0;
            const inputName = `matrix_admin_${qIdx}_${oIdx}`;
            return `
                <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 8px; border: 1px solid var(--glass-border);">
                    <span style="font-weight: 700; color: var(--accent); font-size: 0.85rem; width: 32px; font-family: var(--font-mono);">
                        #${oIdx + 1}
                    </span>
                    <input type="text" class="form-input" value="${escapeHtmlAttr(opt)}" placeholder="Tulis pernyataan..." style="flex: 1; padding: 6px 10px; font-size: 0.88rem;" onchange="updateOptionText(${qIdx}, ${oIdx}, this.value)">
                    <div style="display: flex; gap: 4px; align-items: center; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 8px;">
                        <label style="cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; color: ${rowVal === 0 ? '#6ee7b7' : 'var(--text-muted)'}; background: ${rowVal === 0 ? 'rgba(16,185,129,0.2)' : 'transparent'};">
                            <input type="radio" name="${inputName}" value="0" ${rowVal === 0 ? 'checked' : ''} onchange="setMatrixRowAnswer(${qIdx}, ${oIdx}, 0)" style="cursor: pointer;">
                            Benar
                        </label>
                        <label style="cursor: pointer; display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; color: ${rowVal === 1 ? '#fda4af' : 'var(--text-muted)'}; background: ${rowVal === 1 ? 'rgba(244,63,94,0.2)' : 'transparent'};">
                            <input type="radio" name="${inputName}" value="1" ${rowVal === 1 ? 'checked' : ''} onchange="setMatrixRowAnswer(${qIdx}, ${oIdx}, 1)" style="cursor: pointer;">
                            Salah
                        </label>
                    </div>
                    ${q.options.length > 2 ? `
                        <button class="btn btn-danger" type="button" onclick="removeOptionFromQuestion(${qIdx}, ${oIdx})" style="padding: 4px 8px; font-size: 0.72rem;" title="Hapus Pernyataan">
                            ✕
                        </button>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    const isCheckbox = q.type === 'checkbox';
    const isTf = q.type === 'tf';

    return (q.options || []).map((opt, oIdx) => {
        let isChecked = false;
        if (isCheckbox) {
            isChecked = Array.isArray(q.answer) && q.answer.includes(oIdx);
        } else {
            isChecked = q.answer === oIdx;
        }

        const inputType = isCheckbox ? 'checkbox' : 'radio';
        const inputName = `q_ans_${qIdx}`;

        return `
            <div style="display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.02); padding: 6px 10px; border-radius: 8px; border: 1px solid ${isChecked ? 'rgba(16,185,129,0.5)' : 'var(--glass-border)'};">
                <input type="${inputType}" name="${inputName}" ${isChecked ? 'checked' : ''} onchange="toggleOptionAnswer(${qIdx}, ${oIdx})" style="cursor: pointer; transform: scale(1.2);">
                <span style="font-weight: 700; color: var(--text-muted); font-size: 0.85rem; width: 22px;">
                    ${String.fromCharCode(65 + oIdx)}.
                </span>
                <input type="text" class="form-input" value="${escapeHtmlAttr(opt)}" style="flex: 1; padding: 6px 10px; font-size: 0.88rem;" onchange="updateOptionText(${qIdx}, ${oIdx}, this.value)" ${isTf ? 'readonly' : ''}>
                ${!isTf && q.options.length > 2 ? `
                    <button class="btn btn-danger" type="button" onclick="removeOptionFromQuestion(${qIdx}, ${oIdx})" style="padding: 4px 8px; font-size: 0.72rem;" title="Hapus Pilihan">
                        ✕
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
}

function escapeHtmlAttr(str) {
    if (!str) return '';
    return String(str).replace(/"/g, '&quot;');
}

/**
 * ⚙️ Komponen Editor Skor Bertingkat (Tiered Scoring) untuk Soal Checkbox
 */
function renderTieredScoringBox(q, idx) {
    const isTiered = q.scoringRule && q.scoringRule.type === 'tiered';
    const totalCorrect = Array.isArray(q.answer) ? q.answer.length : 1;
    const maxPts = q.points || 5;

    // Pastikan tiers ada jika mode bertingkat aktif
    if (isTiered && (!q.scoringRule.tiers || q.scoringRule.tiers.length === 0)) {
        buildDefaultTiersForQuestion(q);
    }

    const tiers = isTiered ? q.scoringRule.tiers : [];

    return `
        <div style="margin-top: 14px; padding: 12px 14px; background: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 6px;">
                <span style="font-size: 0.82rem; font-weight: 700; color: var(--primary);">
                    ⚙️ Pengaturan Skor Bertingkat (Kustom Poin Per Kondisi)
                </span>
                <label style="font-size: 0.76rem; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-weight: 600; color: var(--text);">
                    <input type="checkbox" ${isTiered ? 'checked' : ''} onchange="toggleTieredScoring(${idx}, this.checked)">
                    Aktifkan Skor Bertingkat
                </label>
            </div>
            ${isTiered ? `
                <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 10px; line-height: 1.4;">
                    Tentukan perolehan poin siswa berdasarkan jumlah pilihan benar yang dicentang (Kunci benar saat ini: <strong>${totalCorrect} opsi</strong>):
                </div>
                <div style="display: flex; flex-direction: column; gap: 6px;">
                    ${tiers.map((t, tIdx) => {
                        const isBottomTier = t.minCorrect === 0 || tIdx === tiers.length - 1;
                        return `
                            <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.8); padding: 7px 12px; border-radius: 8px; border: 1px solid var(--glass-border); font-size: 0.8rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                                <span style="font-weight: 600; color: var(--text);">
                                    ${!isBottomTier ? `Jika Benar ≥ <strong style="color: var(--primary); font-size: 0.88rem;">${t.minCorrect}</strong> jawaban:` : `Jika Benar ≤ 1 atau 0:`}
                                </span>
                                <div style="display: flex; align-items: center; gap: 6px;">
                                    <span style="font-size: 0.75rem; color: var(--text-muted);">Dapat</span>
                                    <input type="number" min="0" max="100" value="${t.points}" style="width: 55px; padding: 4px 6px; text-align: center; font-weight: 800; border-radius: 6px; border: 1.5px solid var(--primary); font-family: var(--font-mono); color: var(--primary); background: #fff;" onchange="updateTierPoint(${idx}, ${tIdx}, this.value)">
                                    <span style="font-weight: 700; font-size: 0.75rem; color: var(--primary);">Poin</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div style="margin-top: 8px; display: flex; gap: 6px; justify-content: flex-end;">
                    <button class="btn btn-secondary" type="button" onclick="resetDefaultTiers(${idx})" style="padding: 4px 10px; font-size: 0.72rem;">
                        🔄 Reset Aturan Default
                    </button>
                </div>
            ` : `
                <div style="font-size: 0.74rem; color: var(--text-muted); line-height: 1.4;">
                    <em>(Mode Standar: Benar lengkap mendapat nilai penuh ${maxPts} poin. Bila dicentang sebagian atau ada yang salah, nilai dihitung proporsional).</em>
                </div>
            `}
        </div>
    `;
}

function buildDefaultTiersForQuestion(q) {
    const totalCorrect = Array.isArray(q.answer) ? q.answer.length : 1;
    const maxPts = q.points || 5;
    q.scoringRule = {
        type: 'tiered',
        tiers: []
    };

    if (totalCorrect >= 4) {
        q.scoringRule.tiers = [
            { minCorrect: 4, wrongAllowed: 0, points: maxPts },
            { minCorrect: 3, wrongAllowed: 0, points: Math.max(1, Math.ceil(maxPts * 0.75)) },
            { minCorrect: 2, wrongAllowed: 0, points: Math.max(1, Math.ceil(maxPts * 0.5)) },
            { minCorrect: 0, wrongAllowed: 99, points: 0 }
        ];
    } else if (totalCorrect === 3) {
        q.scoringRule.tiers = [
            { minCorrect: 3, wrongAllowed: 0, points: maxPts },
            { minCorrect: 2, wrongAllowed: 0, points: Math.max(1, Math.ceil(maxPts * 0.5)) },
            { minCorrect: 0, wrongAllowed: 99, points: 0 }
        ];
    } else {
        q.scoringRule.tiers = [
            { minCorrect: totalCorrect, wrongAllowed: 0, points: maxPts },
            { minCorrect: 0, wrongAllowed: 99, points: 0 }
        ];
    }
}

function toggleTieredScoring(qIdx, isEnabled) {
    const q = currentEditingQuestions[qIdx];
    if (!q) return;

    if (isEnabled) {
        buildDefaultTiersForQuestion(q);
    } else {
        delete q.scoringRule;
    }
    renderQuestionEditorList();
}

function updateTierPoint(qIdx, tierIdx, val) {
    const q = currentEditingQuestions[qIdx];
    if (!q || !q.scoringRule || !q.scoringRule.tiers || !q.scoringRule.tiers[tierIdx]) return;
    q.scoringRule.tiers[tierIdx].points = parseInt(val, 10) || 0;
}

function resetDefaultTiers(qIdx) {
    const q = currentEditingQuestions[qIdx];
    if (!q) return;
    buildDefaultTiersForQuestion(q);
    renderQuestionEditorList();
    showToast('Aturan skor bertingkat di-reset ke default proporsional.', '🔄');
}

// 🔧 Handlers
function updateQuestionText(idx, val) {
    if (currentEditingQuestions[idx]) currentEditingQuestions[idx].q = val;
}

function updateQuestionCaseStudy(idx, val) {
    if (currentEditingQuestions[idx]) currentEditingQuestions[idx].caseStudy = val.trim();
}

function updateQuestionExplanation(idx, val) {
    if (currentEditingQuestions[idx]) currentEditingQuestions[idx].explanation = val;
}

function updateQuestionPoints(idx, val) {
    const num = parseInt(val, 10) || 5;
    if (currentEditingQuestions[idx]) {
        currentEditingQuestions[idx].points = num;
        renderQuestionEditorList();
    }
}

function updateQuestionDifficulty(idx, val) {
    if (currentEditingQuestions[idx]) currentEditingQuestions[idx].difficulty = val;
}

function updateQuestionType(idx, newType) {
    const q = currentEditingQuestions[idx];
    if (!q) return;
    q.type = newType;

    if (newType === 'tf') {
        q.options = ["Benar", "Salah"];
        q.answer = 0;
    } else if (newType === 'matrix_tf') {
        q.options = ["Pernyataan 1", "Pernyataan 2", "Pernyataan 3"];
        q.answer = [0, 1, 0];
    } else if (newType === 'checkbox') {
        if (!Array.isArray(q.answer)) q.answer = [q.answer || 0];
        if (!q.options || q.options.length < 3) q.options = ["Pilihan 1", "Pilihan 2", "Pilihan 3", "Pilihan 4"];
    } else {
        if (Array.isArray(q.answer)) q.answer = q.answer[0] || 0;
        if (!q.options || q.options.length < 2) q.options = ["Pilihan A", "Pilihan B", "Pilihan C", "Pilihan D"];
    }
    renderQuestionEditorList();
}

function setMatrixRowAnswer(qIdx, oIdx, val) {
    const q = currentEditingQuestions[qIdx];
    if (!q) return;
    if (!Array.isArray(q.answer)) q.answer = [];
    q.answer[oIdx] = val;
    renderQuestionEditorList();
}

function toggleOptionAnswer(qIdx, oIdx) {
    const q = currentEditingQuestions[qIdx];
    if (!q) return;

    if (q.type === 'checkbox') {
        if (!Array.isArray(q.answer)) q.answer = [];
        const pos = q.answer.indexOf(oIdx);
        if (pos === -1) q.answer.push(oIdx);
        else q.answer.splice(pos, 1);
        q.answer.sort((a, b) => a - b);
    } else {
        q.answer = oIdx;
    }
    renderQuestionEditorList();
}

function updateOptionText(qIdx, oIdx, text) {
    const q = currentEditingQuestions[qIdx];
    if (q && q.options && q.options[oIdx] !== undefined) {
        q.options[oIdx] = text;
    }
}

function addOptionToQuestion(qIdx) {
    const q = currentEditingQuestions[qIdx];
    if (!q) return;
    if (!q.options) q.options = [];
    const nextLetter = String.fromCharCode(65 + q.options.length);
    q.options.push(`Pilihan ${nextLetter}`);
    renderQuestionEditorList();
}

function removeOptionFromQuestion(qIdx, oIdx) {
    const q = currentEditingQuestions[qIdx];
    if (!q || !q.options || q.options.length <= 2) return;
    q.options.splice(oIdx, 1);

    // Adjust answers
    if (q.type === 'checkbox') {
        q.answer = (q.answer || []).filter(a => a !== oIdx).map(a => a > oIdx ? a - 1 : a);
    } else {
        if (q.answer === oIdx) q.answer = 0;
        else if (q.answer > oIdx) q.answer--;
    }
    renderQuestionEditorList();
}

function addNewQuestion() {
    currentEditingQuestions.push({
        type: 'mcq',
        difficulty: 'Medium',
        points: 5,
        q: 'Tuliskan pertanyaan soal baru di sini...',
        options: [
            'Pilihan A',
            'Pilihan B',
            'Pilihan C',
            'Pilihan D'
        ],
        answer: 0,
        explanation: 'Penjelasan mengapa pilihan A benar.'
    });
    renderQuestionEditorList();

    // Scroll to the newly added question card
    setTimeout(() => {
        const lastCard = document.getElementById(`q-card-${currentEditingQuestions.length - 1}`);
        if (lastCard) lastCard.scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function duplicateQuestion(idx) {
    const clone = JSON.parse(JSON.stringify(currentEditingQuestions[idx]));
    clone.q += ' (Salinan)';
    currentEditingQuestions.splice(idx + 1, 0, clone);
    renderQuestionEditorList();
}

function deleteQuestion(idx) {
    if (currentEditingQuestions.length <= 1) {
        showToast('Minimal harus ada 1 butir soal dalam modul!', '⚠️');
        return;
    }
    if (confirm(`Hapus soal #${idx + 1}?`)) {
        currentEditingQuestions.splice(idx, 1);
        renderQuestionEditorList();
    }
}

function moveQuestionUp(idx) {
    if (idx <= 0) return;
    const temp = currentEditingQuestions[idx];
    currentEditingQuestions[idx] = currentEditingQuestions[idx - 1];
    currentEditingQuestions[idx - 1] = temp;
    renderQuestionEditorList();
}

function moveQuestionDown(idx) {
    if (idx >= currentEditingQuestions.length - 1) return;
    const temp = currentEditingQuestions[idx];
    currentEditingQuestions[idx] = currentEditingQuestions[idx + 1];
    currentEditingQuestions[idx + 1] = temp;
    renderQuestionEditorList();
}

function autoNormalizeQuestionsTo100() {
    if (!currentEditingQuestions || currentEditingQuestions.length === 0) return;
    const count = currentEditingQuestions.length;
    const basePoints = Math.floor(100 / count);
    const remainder = 100 - (basePoints * count);

    currentEditingQuestions.forEach((q, idx) => {
        q.points = basePoints + (idx < remainder ? 1 : 0);
        if (q.scoringRule && q.scoringRule.type === 'tiered') {
            buildDefaultTiersForQuestion(q);
        }
    });

    renderQuestionEditorList();
    showToast('Bobot seluruh butir soal berhasil dinormalisasi menjadi tepat 100 Poin!', '⚖️');
}
window.autoNormalizeQuestionsTo100 = autoNormalizeQuestionsTo100;

async function saveQuestionEditorChanges() {
    if (!currentEditingModuleId || !window.QuizManager) return;
    if (currentEditingQuestions.length === 0) {
        showToast('Tidak ada soal untuk disimpan!', '⚠️');
        return;
    }

    // ⚖️ Validasi Total Poin = 100
    const totalPoints = currentEditingQuestions.reduce((acc, q) => acc + (parseInt(q.points, 10) || 0), 0);
    if (totalPoints !== 100) {
        const confirmNorm = confirm(`⚠️ Peringatan Standar Nilai:\n\nTotal bobot modul saat ini adalah ${totalPoints} Poin (Bukan tepat 100 Poin).\nSistem ujian mewajibkan nilai maksimal bernilai 100.\n\nKlik OK untuk menormalisasi bobot secara otomatis menjadi tepat 100 Poin dan menyimpan, atau Cancel untuk kembali menyunting.`);
        if (confirmNorm) {
            autoNormalizeQuestionsTo100();
        } else {
            return;
        }
    }

    // Save questions into QuizManager
    if (typeof QuizManager.saveQuestionsForModule === 'function') {
        QuizManager.saveQuestionsForModule(currentEditingModuleId, currentEditingQuestions);
    } else {
        const storedKey = (QuizManager.CUSTOM_QUIZ_DATA_PREFIX || 'detektif_fakta_quiz_data_') + currentEditingModuleId;
        localStorage.setItem(storedKey, JSON.stringify({ id: currentEditingModuleId, questions: currentEditingQuestions }));
        if (QuizManager.getActiveModuleId && QuizManager.getActiveModuleId() === currentEditingModuleId) {
            window.quizData = currentEditingQuestions;
        }
    }

    // Update question count in module metadata
    const modules = await QuizManager.getAllModules();
    const mod = modules.find(m => m.id === currentEditingModuleId);
    if (mod) {
        mod.questionCount = currentEditingQuestions.length;
        const storageKey = QuizManager.MODULES_STORAGE_KEY || 'detektif_fakta_all_modules_v2';
        localStorage.setItem(storageKey, JSON.stringify(modules));
    }

    sfxVictory();
    showToast(`Perubahan berhasil disimpan! (${currentEditingQuestions.length} soal tersimpan • Total: 100 Poin)`, '✅');
    await initModulesCatalog();
    renderBankSoalModules();
}
