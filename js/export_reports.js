//  📥 IMPOR DARI EXCEL / CSV
// ============================================================
function triggerImportExcel() {
    sfxClick();
    document.getElementById('excel-file-input').click();
}

function handleImportExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            if (typeof XLSX === 'undefined') {
                showToast('Pustaka Excel belum siap. Coba beberapa saat lagi.', '⚠️');
                return;
            }

            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (!json || json.length === 0) {
                showToast('File Excel kosong!', '⚠️');
                return;
            }

            let headerRowIndex = -1;
            for (let i = 0; i < json.length; i++) {
                if (Array.isArray(json[i])) {
                    const row = json[i].map(c => String(c || '').toLowerCase().trim());
                    if (row.some(c => c.includes('nama'))) {
                        headerRowIndex = i;
                        break;
                    }
                }
            }

            if (headerRowIndex === -1) {
                showToast('Format kolom Excel tidak sesuai (kolom Nama Siswa tidak ditemukan)!', '⚠️');
                return;
            }

            const headers = json[headerRowIndex].map(c => String(c || '').toLowerCase().trim());
            const nameIdx = headers.findIndex(c => c.includes('nama'));
            const classIdx = headers.findIndex(c => c.includes('kelas'));
            const scoreIdx = headers.findIndex(c => c.includes('nilai') || c.includes('skor'));
            const correctIdx = headers.findIndex(c => c.includes('benar'));
            const durationIdx = headers.findIndex(c => c.includes('durasi'));
            const timeIdx = headers.findIndex(c => c.includes('waktu'));
            const dateIdx = headers.findIndex(c => c.includes('tanggal'));

            const importedRecords = [];
            for (let i = headerRowIndex + 1; i < json.length; i++) {
                const row = json[i];
                if (!row || !row[nameIdx]) continue;

                const name = String(row[nameIdx]).trim();
                if (!name || name.toLowerCase().includes('rekap') || name.toLowerCase().includes('total')) continue;

                const cls = classIdx !== -1 && row[classIdx] ? String(row[classIdx]).trim() : 'X E 1';
                const scoreVal = scoreIdx !== -1 && !isNaN(parseInt(row[scoreIdx])) ? parseInt(row[scoreIdx]) : 0;
                const correctVal = correctIdx !== -1 && !isNaN(parseInt(row[correctIdx])) ? parseInt(row[correctIdx]) : Math.round(scoreVal * 12 / 100);
                const durationVal = durationIdx !== -1 && row[durationIdx] ? String(row[durationIdx]) : '1m 30s';
                const timeVal = timeIdx !== -1 && row[timeIdx] ? String(row[timeIdx]) : '12:00 WIB';
                const dateVal = dateIdx !== -1 && row[dateIdx] ? String(row[dateIdx]) : new Date().toLocaleDateString('id-ID');

                importedRecords.push({
                    name,
                    class: cls,
                    score: scoreVal,
                    correct: correctVal,
                    total: 12,
                    wrongQuestions: [],
                    duration: durationVal,
                    time: timeVal,
                    date: dateVal,
                    timestamp: Date.now() - (json.length - i) * 1000
                });
            }

            if (importedRecords.length === 0) {
                showToast('Tidak ada baris data siswa yang valid untuk diimpor!', '⚠️');
                return;
            }

            const currentRecords = loadRecords();
            const updated = [...currentRecords, ...importedRecords];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            for (const rec of importedRecords) {
                try {
                    fetch('/api/scores', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(rec)
                    });
                } catch (e) {}
            }

            sfxCorrect();
            renderDashboard();
            showToast(`Berhasil mengimpor ${importedRecords.length} data siswa dari Excel!`, '✅');
        } catch (err) {
            sfxWrong();
            showToast('Gagal memproses file Excel: ' + err.message, '❌');
        }
        event.target.value = '';
    };
    reader.readAsArrayBuffer(file);
}

function copyQuizLink() {
    sfxClick();
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => {
            sfxCorrect();
            showToast('Tautan kuis berhasil disalin ke clipboard! 📋', '✅');
        }).catch(() => fallbackCopyText(url));
    } else {
        fallbackCopyText(url);
    }
}

function fallbackCopyText(text) {
    const inp = document.createElement('textarea');
    inp.value = text;
    inp.style.position = 'fixed';
    inp.style.opacity = '0';
    document.body.appendChild(inp);
    inp.select();
    try {
        document.execCommand('copy');
        sfxCorrect();
        showToast('Tautan kuis berhasil disalin ke clipboard! 📋', '✅');
    } catch (e) {
        showToast('Salin tautan ini: ' + text, '🔗');
    }
    document.body.removeChild(inp);
}

function toggleFullscreen() {
    sfxClick();
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
            showToast('Mode Layar Penuh Aktif 🔲', '📺');
        }).catch(() => {
            showToast('Layar penuh tidak didukung di browser ini', 'ℹ️');
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                showToast('Keluar dari Layar Penuh', 'ℹ️');
            }).catch(() => {});
        }
    }
}
