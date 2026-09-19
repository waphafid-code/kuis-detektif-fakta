/**
 * ============================================================
 * 🩺 DIAGNOSTICS & MISCONCEPTION HEATMAP MODULE (DASBOR GURU)
 * ============================================================
 * Modul analitik diagnostik pembelajaran untuk menganalisis:
 * - Failure Rate & Daya Serap per Butir Soal (Q1 - Q20)
 * - Pemetaan Miskonsepsi Siswa berdasarkan 155 data riil kelas X E 1 - X E 6
 * - Rekomendasi Tindak Lanjut & Rencana Aksi Remedial Klasikal Guru
 * 
 * Pengembang: QuizMaster EdTech Engine
 * Guru Pembina: Ibu Rini Syafitri, S.Pd.
 * ============================================================
 */

// 🏷️ PEMETAAN TOPIK & MISKONSEPSI PEDAGOGIS 20 BUTIR SOAL UTAMA
const QUESTION_PEDAGOGICAL_MAP = [
    {
        topic: "Konsep Ekosistem Cek Fakta",
        concept: "Sinergi multi-pemangku kepentingan (media, platform, komunitas, individu).",
        misconception: "Mengira cek fakta hanyalah nama satu aplikasi atau tanggung jawab satu instansi tertentu.",
        remedialTip: "Tegaskan analogi 'ekosistem biologi': cek fakta butuh kerja sama semua elemen digital."
    },
    {
        topic: "Tujuan Literasi Verifikasi",
        concept: "Menjamin hak publik atas informasi terpercaya dan akuntabel.",
        misconception: "Menganggap tujuan utama cek fakta adalah menghapus akun atau membatasi kebebasan berpendapat.",
        remedialTip: "Ajak siswa membedakan antara 'sensor sepihak' vs 'klarifikasi berbasis bukti empiris'."
    },
    {
        topic: "Tugas Organisasi Periksa Fakta",
        concept: "Investigasi independen, perbandingan sumber silang, dan publikasi metodologis.",
        misconception: "Mengira organisasi cek fakta berwenang menangkap penyebar hoaks layaknya kepolisian.",
        remedialTip: "Jelaskan peran organisasi non-profit sebagai penyidik fakta, bukan aparat penegak hukum."
    },
    {
        topic: "Transparansi & Metodologi",
        concept: "Menjelaskan sumber data, alat verifikasi, dan alur penarikan kesimpulan kepada publik.",
        misconception: "Menganggap hasil akhir sudah cukup dipercaya tanpa perlu menampilkan cara memverifikasinya.",
        remedialTip: "Latih siswa memeriksa kolom 'Metodologi' pada situs cek fakta terverifikasi (IFCN)."
    },
    {
        topic: "Peran Platform Media Sosial",
        concept: "Pemberian label konten meragukan, filter moderasi, dan perujukan ke rujukan valid.",
        misconception: "Siswa terkecoh mengira algoritma media sosial otomatis membuat semua unggahan jadi benar atau menghapus semua postingan.",
        remedialTip: "Demonstrasikan fitur 'Fact-Check Label' di Instagram/Facebook/X dan bagaimana pengguna harus menyikapinya."
    },
    {
        topic: "Keterampilan Membaca Lateral",
        concept: "Membuka tab samping untuk mengecek kredibilitas sumber sebelum membaca isi klaim.",
        misconception: "Siswa membaca secara vertikal (hanya scroll ke bawah dalam satu situs yang berpotensi bias).",
        remedialTip: "Lakukan demonstrasi langsung: buka klaim lalu buka 3 tab media arus utama untuk konfirmasi silang."
    },
    {
        topic: "Manfaat Jaringan Kolaboratif (Multi-Select)",
        concept: "Efisiensi verifikasi klaim kompleks melalui pertukaran basis data dan kepakaran gabungan.",
        misconception: "Siswa gagal memilih seluruh opsi valid karena kurang teliti membaca stimulus butir ganda.",
        remedialTip: "Latih strategi menjawab soal pilihan ganda kompleks: evaluasi setiap opsi secara mandiri (True/False per opsi)."
    },
    {
        topic: "Hakikat Literasi Media",
        concept: "Kemampuan menalar kritis dan mendeteksi bias, bukan sekadar mahir mengoperasikan gawai.",
        misconception: "Mengira orang yang aktif membagikan berita di medsos sudah memiliki literasi media yang baik.",
        remedialTip: "Diskusikan paradoks: 'Pengguna aktif internet belum tentu pengguna yang kritis dan melek literasi'."
    },
    {
        topic: "Bahaya Bias Judul (Clickbait)",
        concept: "Judul bombastis kerap mendistorsi isi konteks berita yang sesungguhnya.",
        misconception: "Mengasumsikan membaca headline sudah cukup untuk menyimpulkan fakta.",
        remedialTip: "Beri contoh perbandingan 3 judul clickbait dengan isi beritanya yang ternyata bertolak belakang."
    },
    {
        topic: "Tindakan Kritis Komunitas",
        concept: "Saring sebelum sharing: periksa mandiri dan bagikan klarifikasi terverifikasi.",
        misconception: "Menganggap meneruskan pesan ke grup lain adalah cara cepat mengonfirmasi kebenaran.",
        remedialTip: "Tanamkan etika digital: jangan jadikan grup WhatsApp tempat uji coba kebenaran hoaks mentah."
    },
    {
        topic: "Bukti Aduan Konten Kominfo",
        concept: "Tangkapan layar (screenshot) dan URL tautan presisi sebagai bukti digital autentik.",
        misconception: "Mengira opini pribadi atau foto diri pelapor lebih diutamakan daripada jejak tautan URL.",
        remedialTip: "Tunjukkan contoh format laporan aduan digital yang lengkap dengan URL permalink dan metadata."
    },
    {
        topic: "Perlindungan Kerahasiaan Pelapor",
        concept: "Jaminan privasi pengadu untuk mencegah intimidasi dan meningkatkan partisipasi publik.",
        misconception: "Takut melapor karena khawatir data pribadi dan nomor telepon akan disebarluaskan ke publik.",
        remedialTip: "Edukasi jaminan hukum UU ITE dan SOP kerahasiaan kanal aduankonten.id."
    },
    {
        topic: "Kanal Resmi Email Kominfo",
        concept: "Alamat resmi berdomain pemerintah: aduankonten@mail.kominfo.go.id.",
        misconception: "Terkecoh dengan alamat email gratisan tiruan (gmail.com) atau domain non-pemerintah.",
        remedialTip: "Tegaskan kaidah domain resmi: Instansi pemerintah RI SELALU berakhiran .go.id, bukan @gmail.com!"
    },
    {
        topic: "Kanal Pelaporan Mafindo (TurnBackHoax)",
        concept: "Platform lapor hoaks komunitas Mafindo beralamat di turnbackhoax.id/lapor-hoax/.",
        misconception: "Siswa banyak tertukar antara situs pemblokiran TrustPositif, email kepolisian, atau situs aduan Kominfo.",
        remedialTip: "Buka langsung situs TurnBackHoax.id di proyektor kelas dan tunjukkan letak tombol 'Lapor Hoaks'."
    },
    {
        topic: "Pencegahan Konten Meragukan (Multi-Select)",
        concept: "Verifikasi sumber, pembandingan silang, dan pelaporan terarah.",
        misconception: "Memilih opsi reaktif seperti mengubah isi konten atau gegabah meneruskannya.",
        remedialTip: "Bahas 3 pilar aksi pencegahan: Cek Sumber -> Bandingkan -> Laporkan ke Kanal Resmi."
    },
    {
        topic: "Respon Moderasi Platform Digital",
        concept: "Pemberian label peringatan mitigasi dan rujukan tautan edukatif kepada pengguna.",
        misconception: "Mengira platform sebaiknya membiarkan konten demi trafik viral atau langsung menghapus seluruh akun pengguna.",
        remedialTip: "Diskusikan prinsip 'Inform-before-Ban': mendidik pengguna lebih efektif daripada sekadar sensor buta."
    },
    {
        topic: "Prinsip Akuntabilitas Transparansi",
        concept: "Transparansi mewajibkan publikasi proses, sumber wawancara, dan alat verifikasi.",
        misconception: "Menganggap cukup mempublikasikan stempel BENAR/SALAH tanpa menyajikan data penelusuran.",
        remedialTip: "Simulasikan bedah artikel cek fakta: tunjukkan bagian mana yang disebut bukti dan mana yang kesimpulan."
    },
    {
        topic: "Tanggung Jawab Digital (Multi-Select)",
        concept: "Membaca kritis, memeriksa produsen informasi, dan membandingkan rujukan independen.",
        misconception: "Siswa terkecoh memilih 'Menyebarkan berita karena sedang viral' sebagai bentuk tanggung jawab.",
        remedialTip: "Kupas tuntas jebakan viralitas: 'Banyak orang membagikan bukan berarti hal tersebut benar!' (Argumentum ad Populum)."
    },
    {
        topic: "Dukungan Ekosistem Sekolah",
        concept: "Penyediaan fasilitas, sarana literasi, dan perlindungan hukum bagi kegiatan periksa fakta siswa.",
        misconception: "Mengira sekolah cukup melarang internet secara total atau membiarkan siswa tanpa pendampingan.",
        remedialTip: "Bahas peran strategis sekolah sebagai inkubator agen muda Detektif Fakta yang berdaya."
    },
    {
        topic: "Alur Investigasi Fakta Komprehensif",
        concept: "SOP berurutan: Simpan Bukti -> Telusuri Sumber -> Komparasi Silang -> Ambil Tindakan/Lapor.",
        misconception: "Lompat langsung ke kesimpulan hanya dengan membaca sekilas judul di media sosial.",
        remedialTip: "Gunakan lembar kerja '4 Langkah Detektif Fakta' untuk memandu alur berpikir terstruktur siswa."
    }
];

// ============================================================
// 📊 ENGINE ANALITIK DIAGNOSTIK
// ============================================================

/**
 * Menghitung statistik diagnostik lengkap berdasarkan data record
 * @param {string} selectedClass - 'all' atau nama kelas spesifik (e.g. 'X E 1')
 */
function calculateDiagnosticStats(selectedClass = 'all') {
    const allRecords = (typeof loadRecords === 'function') ? loadRecords() : (window.OFFICIAL_EXAM_RESULTS || []);
    const questions = (typeof DEFAULT_BUILTIN_QUESTIONS !== 'undefined') ? DEFAULT_BUILTIN_QUESTIONS : [];

    // Filter berdasarkan kelas
    const filteredRecords = allRecords.filter(r => {
        if (!r) return false;
        if (!selectedClass || selectedClass === 'all') return true;
        const c = String(r.class || '').trim().toUpperCase();
        return c === String(selectedClass).trim().toUpperCase();
    });

    const totalStudents = filteredRecords.length;
    if (totalStudents === 0) {
        return {
            totalStudents: 0,
            averageScore: 0,
            passRate: 0,
            criticalCount: 0,
            warningCount: 0,
            masteredCount: 0,
            items: [],
            topCritical: []
        };
    }

    // Hitung rata-rata skor & ketuntasan
    let totalScore = 0;
    let passedCount = 0;
    filteredRecords.forEach(r => {
        const s = Number(r.score) || 0;
        totalScore += s;
        if (s >= 80) passedCount++;
    });

    const averageScore = Math.round(totalScore / totalStudents);
    const passRate = Math.round((passedCount / totalStudents) * 100);

    // Hitung kesalahan per butir soal
    const questionStats = questions.map((q, idx) => {
        let wrongCount = 0;
        filteredRecords.forEach(r => {
            if (Array.isArray(r.wrongQuestions) && r.wrongQuestions.includes(idx)) {
                wrongCount++;
            }
        });

        const correctCount = totalStudents - wrongCount;
        const failureRate = Math.round((wrongCount / totalStudents) * 100);
        const masteryRate = 100 - failureRate;

        let status = 'mastered';
        let statusLabel = 'Tuntas Optimal';
        let statusBadgeClass = 'badge-mastered';

        if (failureRate >= 50) {
            status = 'critical';
            statusLabel = 'Miskonsepsi Kritis';
            statusBadgeClass = 'badge-critical';
        } else if (failureRate >= 25) {
            status = 'warning';
            statusLabel = 'Perlu Penguatan';
            statusBadgeClass = 'badge-warning';
        }

        const pedagogicalInfo = QUESTION_PEDAGOGICAL_MAP[idx] || {
            topic: `Materi Butir #${idx + 1}`,
            concept: q.q || 'Konsep literasi informasi',
            misconception: 'Siswa kurang cermat dalam membedakan opsi yang saling mirip.',
            remedialTip: 'Berikan latihan studi kasus tambahan sebelum evaluasi berikutnya.'
        };

        return {
            index: idx,
            questionNumber: idx + 1,
            questionData: q,
            topic: pedagogicalInfo.topic,
            concept: pedagogicalInfo.concept,
            misconception: pedagogicalInfo.misconception,
            remedialTip: pedagogicalInfo.remedialTip,
            difficulty: q.difficulty || 'Medium',
            type: q.type || 'mcq',
            wrongCount,
            correctCount,
            totalStudents,
            failureRate,
            masteryRate,
            status,
            statusLabel,
            statusBadgeClass
        };
    });

    // Hitung agregat status
    let criticalCount = 0;
    let warningCount = 0;
    let masteredCount = 0;

    questionStats.forEach(item => {
        if (item.status === 'critical') criticalCount++;
        else if (item.status === 'warning') warningCount++;
        else masteredCount++;
    });

    // Top 3 Butir Soal Terberat / Miskonsepsi Terbesar
    const topCritical = [...questionStats]
        .sort((a, b) => b.failureRate - a.failureRate)
        .slice(0, 3);

    return {
        totalStudents,
        averageScore,
        passRate,
        criticalCount,
        warningCount,
        masteredCount,
        items: questionStats,
        topCritical
    };
}
window.calculateDiagnosticStats = calculateDiagnosticStats;

// ============================================================
// 🖥️ TAMPILAN & RENDERING DASBOR DIAGNOSTIK
// ============================================================

let currentDiagnosticClassFilter = 'all';

/**
 * Render utama tab diagnostik miskonsepsi
 */
function renderDiagnosticsDashboard(selectedClass = null) {
    if (selectedClass !== null) {
        currentDiagnosticClassFilter = selectedClass;
    }

    const container = document.getElementById('teacher-tab-diagnostics');
    if (!container) return;

    const stats = calculateDiagnosticStats(currentDiagnosticClassFilter);
    const availableClasses = getAvailableRecordClasses();

    // 1. Update Selector Kelas jika elemen ada
    const filterSelect = document.getElementById('diag-class-select');
    if (filterSelect) {
        let optionsHtml = `<option value="all" ${currentDiagnosticClassFilter === 'all' ? 'selected' : ''}>🌐 Semua Kelas (155 Siswa)</option>`;
        availableClasses.forEach(cls => {
            optionsHtml += `<option value="${cls}" ${currentDiagnosticClassFilter === cls ? 'selected' : ''}>🏫 Kelas ${cls}</option>`;
        });
        filterSelect.innerHTML = optionsHtml;
    }

    // 2. Render Kartu KPI Utama
    const kpiEl = document.getElementById('diag-kpi-container');
    if (kpiEl) {
        kpiEl.innerHTML = `
            <div class="diag-kpi-card">
                <div class="diag-kpi-icon">👥</div>
                <div class="diag-kpi-content">
                    <div class="diag-kpi-val">${stats.totalStudents}</div>
                    <div class="diag-kpi-label">Siswa Dianalisis</div>
                    <div class="diag-kpi-sub">${currentDiagnosticClassFilter === 'all' ? 'Agregat 5 Rombel' : 'Rombel ' + currentDiagnosticClassFilter}</div>
                </div>
            </div>
            <div class="diag-kpi-card">
                <div class="diag-kpi-icon">📈</div>
                <div class="diag-kpi-content">
                    <div class="diag-kpi-val ${stats.averageScore >= 80 ? 'text-success' : 'text-amber'}">${stats.averageScore}</div>
                    <div class="diag-kpi-label">Rata-rata Skor</div>
                    <div class="diag-kpi-sub">Ketuntasan KKM: ${stats.passRate}%</div>
                </div>
            </div>
            <div class="diag-kpi-card ${stats.criticalCount > 0 ? 'kpi-alert-card' : ''}">
                <div class="diag-kpi-icon">🔴</div>
                <div class="diag-kpi-content">
                    <div class="diag-kpi-val text-danger">${stats.criticalCount}</div>
                    <div class="diag-kpi-label">Soal Miskonsepsi Kritis</div>
                    <div class="diag-kpi-sub">Tingkat salah ≥ 50%</div>
                </div>
            </div>
            <div class="diag-kpi-card">
                <div class="diag-kpi-icon">🟢</div>
                <div class="diag-kpi-content">
                    <div class="diag-kpi-val text-success">${stats.masteredCount}</div>
                    <div class="diag-kpi-label">Soal Tuntas Optimal</div>
                    <div class="diag-kpi-sub">${Math.round((stats.masteredCount / 20) * 100)}% dari 20 Soal</div>
                </div>
            </div>
        `;
    }

    // 3. Render Kartu Rencana Intervensi Pedagogis (Action Plan Ibu Guru)
    const actionPlanEl = document.getElementById('diag-action-plan-container');
    if (actionPlanEl) {
        let actionItemsHtml = '';
        if (stats.topCritical.length === 0 || stats.topCritical[0].failureRate === 0) {
            actionItemsHtml = `
                <div class="diag-empty-plan">
                    <div style="font-size: 2rem;">🎉</div>
                    <h5 style="margin: 6px 0; color: var(--emerald-400);">Seluruh Konsep Telah Dikuasai dengan Sangat Baik!</h5>
                    <p style="color: var(--text-muted); font-size: 0.88rem; margin: 0;">Tidak ditemukan butir miskonsepsi kritis pada kelompok kelas ini. Siswa siap melanjutkan ke modul pengayaan tingkat lanjut.</p>
                </div>
            `;
        } else {
            actionItemsHtml = stats.topCritical.map((item, rank) => `
                <div class="action-plan-item">
                    <div class="action-plan-badge">
                        <span class="rank-num">#${rank + 1}</span>
                        <span class="fail-tag">${item.failureRate}% Salah</span>
                    </div>
                    <div class="action-plan-body">
                        <div class="action-plan-header">
                            <span class="q-num-tag">Soal #${item.questionNumber}</span>
                            <span class="topic-tag">${item.topic}</span>
                        </div>
                        <p class="action-plan-text"><strong>🎯 Indikator:</strong> ${escapeHtml(item.concept)}</p>
                        <div class="misconception-callout">
                            <div class="callout-title">⚠️ Akar Miskonsepsi Siswa:</div>
                            <div class="callout-desc">${escapeHtml(item.misconception)}</div>
                        </div>
                        <div class="remedial-action-box">
                            <div class="action-title">💡 Rencana Tindak Lanjut Guru (10 Menit Tatap Muka):</div>
                            <div class="action-desc">${escapeHtml(item.remedialTip)}</div>
                        </div>
                        <div style="margin-top: 10px; display: flex; gap: 8px;">
                            <button type="button" class="btn-micro-inspect" onclick="openQuestionDiagnosticModal(${item.index})">
                                🔍 Bedah Butir Soal Ini
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        actionPlanEl.innerHTML = `
            <div class="action-plan-header-banner">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="action-banner-icon">📋</div>
                    <div>
                        <h4 style="margin: 0; font-size: 1.05rem; font-weight: 800; color: var(--text);">Rencana Aksi Intervensi Pedagogis Klasikal</h4>
                        <div style="font-size: 0.82rem; color: var(--text-muted);">Panduan perbaikan pembelajaran terarah bagi Ibu Rini Syafitri, S.Pd. berdasarkan topik dengan tingkat kekeliruan tertinggi.</div>
                    </div>
                </div>
            </div>
            <div class="action-plan-grid">
                ${actionItemsHtml}
            </div>
        `;
    }

    // 4. Render Tabel & Heatmap Butir Soal Lengkap
    const tableBodyEl = document.getElementById('diag-table-body');
    if (tableBodyEl) {
        tableBodyEl.innerHTML = stats.items.map(item => {
            // Bar color logic
            let barGradient = 'linear-gradient(90deg, #10b981, #059669)'; // green
            if (item.failureRate >= 50) {
                barGradient = 'linear-gradient(90deg, #f43f5e, #e11d48)'; // crimson red
            } else if (item.failureRate >= 25) {
                barGradient = 'linear-gradient(90deg, #f59e0b, #d97706)'; // amber
            }

            const cleanSnippet = (item.questionData && item.questionData.q) 
                ? escapeHtml(item.questionData.q.length > 68 ? item.questionData.q.substring(0, 68) + '...' : item.questionData.q)
                : `Butir Soal #${item.questionNumber}`;

            const difficultyBadge = {
                'Easy': '<span class="diff-badge diff-easy">Mudah</span>',
                'Medium': '<span class="diff-badge diff-medium">Sedang</span>',
                'Hard': '<span class="diff-badge diff-hard">Sulit / HOTS</span>'
            }[item.difficulty] || '<span class="diff-badge">Umum</span>';

            const typeLabel = {
                'mcq': 'Pilihan Ganda',
                'tf': 'Benar / Salah',
                'checkbox': 'Pilihan Kompleks'
            }[item.type] || item.type;

            return `
                <tr class="diag-row diag-row-${item.status}">
                    <td class="text-center font-bold" style="width: 50px;">#${item.questionNumber}</td>
                    <td>
                        <div style="font-weight: 700; color: var(--text); margin-bottom: 2px;">${cleanSnippet}</div>
                        <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; gap: 8px; align-items: center;">
                            <span class="diag-topic-pill">🏷️ ${item.topic}</span>
                            <span>•</span>
                            <span>${typeLabel}</span>
                        </div>
                    </td>
                    <td class="text-center" style="width: 100px;">
                        ${difficultyBadge}
                    </td>
                    <td class="text-center" style="width: 120px;">
                        <span style="color: var(--rose-400); font-weight: 700;">${item.wrongCount} salah</span>
                        <div style="font-size: 0.76rem; color: var(--text-muted);">dari ${item.totalStudents} siswa</div>
                    </td>
                    <td style="width: 220px;">
                        <div class="diag-heatbar-wrap">
                            <div class="diag-heatbar-track">
                                <div class="diag-heatbar-fill" style="width: ${item.failureRate}%; background: ${barGradient};"></div>
                            </div>
                            <div class="diag-heatbar-label">
                                <span class="heat-pct font-bold ${item.failureRate >= 50 ? 'text-danger' : (item.failureRate >= 25 ? 'text-amber' : 'text-success')}">${item.failureRate}%</span>
                                <span class="heat-mastery">Daya Serap ${item.masteryRate}%</span>
                            </div>
                        </div>
                    </td>
                    <td class="text-center" style="width: 130px;">
                        <span class="diag-status-badge ${item.statusBadgeClass}">${item.statusLabel}</span>
                    </td>
                    <td class="text-center" style="width: 90px;">
                        <button type="button" class="btn-table-action" onclick="openQuestionDiagnosticModal(${item.index})" title="Bedah Rasional & Miskonsepsi">
                            🔍 Bedah
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
}
window.renderDiagnosticsDashboard = renderDiagnosticsDashboard;

/**
 * Mendapatkan daftar unik kelas siswa dari record yang tersimpan
 */
function getAvailableRecordClasses() {
    const allRecords = (typeof loadRecords === 'function') ? loadRecords() : (window.OFFICIAL_EXAM_RESULTS || []);
    const classSet = new Set();
    allRecords.forEach(r => {
        if (r && r.class) {
            const c = String(r.class).trim();
            if (c) classSet.add(c);
        }
    });
    return Array.from(classSet).sort();
}
window.getAvailableRecordClasses = getAvailableRecordClasses;

/**
 * Handler pergantian kelas filter dari dropdown
 */
function onDiagnosticClassChange(cls) {
    if (typeof sfxClick === 'function') sfxClick();
    renderDiagnosticsDashboard(cls);
}
window.onDiagnosticClassChange = onDiagnosticClassChange;

// ============================================================
// 🔍 MODAL DETAIL BEDAH PEDAGOGIS BUTIR SOAL
// ============================================================

/**
 * Membuka modal inspeksi mendalam sebuah butir soal
 */
function openQuestionDiagnosticModal(qIndex) {
    if (typeof sfxClick === 'function') sfxClick();
    const questions = (typeof DEFAULT_BUILTIN_QUESTIONS !== 'undefined') ? DEFAULT_BUILTIN_QUESTIONS : [];
    const q = questions[qIndex];
    if (!q) return;

    const stats = calculateDiagnosticStats(currentDiagnosticClassFilter);
    const itemStat = stats.items[qIndex] || {};
    const pedInfo = QUESTION_PEDAGOGICAL_MAP[qIndex] || {};

    const modal = document.getElementById('modal-diag-question');
    if (!modal) return;

    // Set judul & meta
    document.getElementById('modal-diag-title').textContent = `Bedah Soal #${qIndex + 1}: ${pedInfo.topic || 'Literasi Digital'}`;
    document.getElementById('modal-diag-stats-summary').innerHTML = `
        <span class="diag-tag-chip">🏫 Filter: ${currentDiagnosticClassFilter === 'all' ? 'Semua Kelas (155 Siswa)' : 'Kelas ' + currentDiagnosticClassFilter}</span>
        <span class="diag-tag-chip ${itemStat.failureRate >= 50 ? 'chip-danger' : (itemStat.failureRate >= 25 ? 'chip-amber' : 'chip-success')}">
            ❌ Tingkat Kesalahan: ${itemStat.failureRate || 0}% (${itemStat.wrongCount || 0} dari ${itemStat.totalStudents || 0} siswa)
        </span>
        <span class="diag-tag-chip chip-info">🎯 Daya Serap: ${itemStat.masteryRate || 100}%</span>
    `;

    // Render Stimulus / Soal & Pilihan
    let optionsHtml = '';
    if (Array.isArray(q.options)) {
        optionsHtml = q.options.map((opt, optIdx) => {
            let isCorrect = false;
            if (Array.isArray(q.answer)) {
                isCorrect = q.answer.includes(optIdx);
            } else {
                isCorrect = (q.answer === optIdx);
            }

            return `
                <div class="modal-diag-option ${isCorrect ? 'option-correct' : 'option-standard'}">
                    <span class="opt-indicator">${isCorrect ? '✅' : '⚪'}</span>
                    <span class="opt-text">${escapeHtml(opt)}</span>
                    ${isCorrect ? '<span class="opt-correct-label">Kunci Jawaban</span>' : ''}
                </div>
            `;
        }).join('');
    }

    document.getElementById('modal-diag-qbody').innerHTML = `
        ${q.caseStudy ? `<div class="modal-diag-casestudy"><strong>📖 Kasus / Stimulus:</strong> ${escapeHtml(q.caseStudy)}</div>` : ''}
        <div class="modal-diag-qtext">${escapeHtml(q.q)}</div>
        <div class="modal-diag-options-list">
            ${optionsHtml}
        </div>
    `;

    // Render 3 Pilar Analitik Pedagogis
    document.getElementById('modal-diag-pillars').innerHTML = `
        <div class="tri-pillar-card" style="margin-top: 14px;">
            <div class="pillar-box pillar-concept">
                <div class="pillar-header">🎯 Konsep Inti Pembelajaran</div>
                <div class="pillar-content">${escapeHtml(pedInfo.concept || q.explanation || 'Konsep literasi informasi digital.')}</div>
            </div>
            <div class="pillar-box pillar-distractor">
                <div class="pillar-header">🔍 Analisis Pengecoh &amp; Jebakan Soal</div>
                <div class="pillar-content">${escapeHtml(pedInfo.misconception || 'Opsi pengecoh dirancang untuk menguji kecermatan siswa dalam memverifikasi sumber.')}</div>
            </div>
            <div class="pillar-box pillar-insight">
                <div class="pillar-header">💡 Tindak Lanjut Guru (Intervensi Pedagogis)</div>
                <div class="pillar-content">${escapeHtml(pedInfo.remedialTip || 'Berikan penguatan materi dan contoh konkret pada sesi tatap muka.')}</div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    modal.classList.add('active');
}
window.openQuestionDiagnosticModal = openQuestionDiagnosticModal;

/**
 * Menutup modal inspeksi soal
 */
function closeQuestionDiagnosticModal() {
    if (typeof sfxClick === 'function') sfxClick();
    const modal = document.getElementById('modal-diag-question');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
    }
}
window.closeQuestionDiagnosticModal = closeQuestionDiagnosticModal;

// ============================================================
// 🖨️ CETAK / EXPORT LAPORAN DIAGNOSTIK
// ============================================================

/**
 * Membuka jendela cetak laporan diagnostik resmi guru
 */
function printDiagnosticReport() {
    if (typeof sfxClick === 'function') sfxClick();
    window.print();
}
window.printDiagnosticReport = printDiagnosticReport;
