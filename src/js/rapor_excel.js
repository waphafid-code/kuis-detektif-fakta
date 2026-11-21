// ============================================================
// 📊 RAPOR EXCEL SISWA (.xlsx) — BERGAYA PENUH, TANPA PUSTAKA TAMBAHAN
// ------------------------------------------------------------
// • Membaca SATU snapshot hasil resmi (window.lastQuizResult) agar nilai di layar hasil,
//   rapor PDF, dan rapor Excel SELALU sama.
// • Menulis berkas OOXML sendiri lewat JSZip (sudah dimuat di halaman), sehingga bisa memberi
//   warna, border, rumus, format kondisional, freeze pane, filter, dan pengaturan cetak —
//   hal yang tidak didukung SheetJS edisi komunitas.
// • Semua teks ditulis sebagai inline string (BUKAN rumus), sehingga isi seperti "=CMD()"
//   pada soal/pembahasan tidak pernah dieksekusi Excel (anti formula-injection).
// ============================================================
(function (global) {
    'use strict';

    const SHEET_DETAIL = 'Rincian Jawaban';
    const SHEET_SUMMARY = 'Rapor';

    // ───────────────────────── Snapshot hasil ─────────────────────────
    function diffLabel(d) {
        return d === 'Easy' ? 'Mudah' : (d === 'Hard' ? 'Sulit' : 'Sedang');
    }

    function safeGlobal(name, fallback) {
        try {
            // eslint-disable-next-line no-new-func
            const v = (new Function('return typeof ' + name + " !== 'undefined' ? " + name + ' : undefined'))();
            return v === undefined ? fallback : v;
        } catch (e) { return fallback; }
    }

    function joinText(arr) {
        if (!Array.isArray(arr)) return arr == null ? '' : String(arr);
        return arr.map(x => (x == null ? '' : String(x))).join(' | ');
    }

    function buildSnapshot() {
        const res = global.lastQuizResult || null;
        const rec = res && res.record ? res.record : null;
        const qd = safeGlobal('quizData', []) || [];
        const order = safeGlobal('shuffledQuizOrder', []) || [];
        const detailed = (rec ? rec.detailedAnswers : safeGlobal('detailedAnswers', [])) || [];
        const total = rec && rec.total ? rec.total : qd.length;
        const locked = !!global.isAnswersLocked;
        const postponed = (typeof global.isReviewPostponed === 'function')
            ? !!global.isReviewPostponed()
            : (function () { try { return localStorage.getItem('quizmaster_review_release_mode') !== 'open'; } catch (e) { return true; } })();

        const rows = [];
        for (let i = 0; i < total; i++) {
            const da = detailed[i] || null;
            const q = qd[i] || {};
            const posInOrder = order.indexOf(i);
            const no = da && da.questionNumber ? da.questionNumber : (posInOrder >= 0 ? posInOrder + 1 : i + 1);
            const max = da ? (Number(da.maxPoints) || Number(q.points) || 5) : (Number(q.points) || 5);
            const pts = da ? (Number(da.pointsEarned) || 0) : 0;
            let result = 'SALAH';
            if (pts > 0 && pts >= max) result = 'BENAR';
            else if (pts > 0) result = 'SEBAGIAN';
            const selected = da ? joinText(da.selectedText) : '(Belum dijawab)';
            rows.push({
                no: no,
                difficulty: diffLabel(da && da.difficulty ? da.difficulty : q.difficulty),
                question: String((da && da.questionText) || q.q || ''),
                selected: selected,
                key: locked ? '🔒 Dikunci oleh Guru' : joinText(da ? da.correctText : []) || '-',
                result: result,
                points: pts,
                maxPoints: max,
                explanation: locked ? '🔒 Pembahasan dikunci selama mode ujian' : String((da && da.explanation) || '-')
            });
        }
        rows.sort((a, b) => a.no - b.no);

        const counts = { total: rows.length, full: 0, partial: 0, wrong: 0 };
        rows.forEach(r => {
            if (r.result === 'BENAR') counts.full++;
            else if (r.result === 'SEBAGIAN') counts.partial++;
            else counts.wrong++;
        });

        const pointsEarned = rec ? (Number(rec.pointsEarned) || 0) : (Number(safeGlobal('earnedPointsTotal', 0)) || 0);
        const totalPointsRaw = rec ? Number(rec.totalPoints) : Number(safeGlobal('totalPossiblePoints', 0));
        const totalPoints = totalPointsRaw > 0 ? totalPointsRaw : rows.reduce((a, r) => a + r.maxPoints, 0);

        // Nilai resmi = nilai yang tampil di layar hasil (displayScore). Cadangan: hitung dari poin berbobot,
        // BUKAN dari jumlah soal benar penuh (penyebab bug 35 vs 5).
        let score;
        if (res && typeof res.displayScore === 'number') score = res.displayScore;
        else if (rec && typeof rec.score === 'number') score = rec.score;
        else score = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 100) : 0;
        score = Math.min(100, Math.max(0, Math.round(score)));

        const mod = safeGlobal('currentActiveModule', null);
        const kkm = res && res.kkm ? res.kkm : ((mod && mod.kkm) || 80);

        const diffMap = {};
        rows.forEach(r => {
            const d = diffMap[r.difficulty] || (diffMap[r.difficulty] = { label: r.difficulty, count: 0, points: 0, max: 0 });
            d.count++; d.points += r.points; d.max += r.maxPoints;
        });
        const byDifficulty = ['Mudah', 'Sedang', 'Sulit'].filter(k => diffMap[k]).map(k => diffMap[k]);

        const modTitle = (rec && rec.moduleTitle) || (mod && mod.title) || 'Evaluasi Kuis Pembelajaran Informatika';
        const sName = (rec && rec.name) || safeGlobal('studentName', '') || 'Siswa';
        const sClass = (rec && rec.class) || safeGlobal('studentClass', '') || 'Kelas';

        return {
            hasOfficialResult: !!rec,
            name: String(sName),
            cls: String(sClass),
            moduleTitle: String(modTitle),
            proofId: String(global.lastSubmittedProofId || (rec && rec.submissionProofId) || '-'),
            kkm: kkm,
            score: score,
            attemptScore: res && typeof res.attemptScore === 'number' ? res.attemptScore : score,
            isRemedial: !!(res && res.isRemedial),
            originalScore: (rec && rec.originalScore != null) ? rec.originalScore : null,
            isPassed: score >= kkm,
            pointsEarned: pointsEarned,
            totalPoints: totalPoints,
            date: rec ? rec.date : new Date().toLocaleDateString('id-ID'),
            time: rec ? rec.time : '',
            duration: rec ? rec.duration : '-',
            maxStreak: res ? res.maxStreak : Number(safeGlobal('maxStreak', 0)) || 0,
            hints: rec ? (rec.hintsUsedCount || 0) : 0,
            tabSwitches: rec ? (rec.tabSwitchCount || 0) : 0,
            rows: rows,
            counts: counts,
            byDifficulty: byDifficulty,
            postponed: postponed,
            locked: locked
        };
    }

    // ───────────────────────── Penulis OOXML ─────────────────────────
    function colL(n) {
        let s = '';
        while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
        return s;
    }
    function addr(r, c) { return colL(c) + r; }
    function absAddr(r, c) { return '$' + colL(c) + '$' + r; }

    function xmlEsc(s) {
        return String(s)
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
    function clip(s) { s = String(s); return s.length > 32000 ? s.slice(0, 32000) + '…' : s; }

    function StyleBook() {
        this.fonts = ['<font><sz val="11"/><color rgb="FF1E293B"/><name val="Calibri"/><family val="2"/></font>'];
        this.fills = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>'];
        this.borders = ['<border><left/><right/><top/><bottom/><diagonal/></border>'];
        this.xfs = ['<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'];
        this.cache = {};
        this.dxfs = [];
    }
    StyleBook.prototype._idx = function (arr, xml) {
        let i = arr.indexOf(xml);
        if (i < 0) { arr.push(xml); i = arr.length - 1; }
        return i;
    };
    StyleBook.prototype.add = function (o) {
        const key = JSON.stringify(o);
        if (this.cache[key] !== undefined) return this.cache[key];
        const font = '<font>' + (o.b ? '<b/>' : '') + (o.i ? '<i/>' : '') +
            '<sz val="' + (o.sz || 11) + '"/><color rgb="FF' + (o.color || '1E293B') + '"/><name val="Calibri"/><family val="2"/></font>';
        const fill = o.fill
            ? '<fill><patternFill patternType="solid"><fgColor rgb="FF' + o.fill + '"/><bgColor indexed="64"/></patternFill></fill>'
            : '<fill><patternFill patternType="none"/></fill>';
        const side = (n) => '<' + n + ' style="thin"><color rgb="FF' + (o.bc || 'CBD5E1') + '"/></' + n + '>';
        const border = o.border
            ? '<border>' + side('left') + side('right') + side('top') + side('bottom') + '<diagonal/></border>'
            : this.borders[0];
        const fi = this._idx(this.fonts, font);
        const fl = this._idx(this.fills, fill);
        const bi = this._idx(this.borders, border);
        const align = '<alignment horizontal="' + (o.h || 'general') + '" vertical="' + (o.v || 'center') + '"' +
            (o.wrap ? ' wrapText="1"' : '') + (o.indent ? ' indent="' + o.indent + '"' : '') + '/>';
        const xf = '<xf numFmtId="' + (o.fmt || 0) + '" fontId="' + fi + '" fillId="' + fl + '" borderId="' + bi +
            '" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1">' + align + '</xf>';
        this.xfs.push(xf);
        const id = this.xfs.length - 1;
        this.cache[key] = id;
        return id;
    };
    StyleBook.prototype.addDxf = function (fontColor, fillColor, bold) {
        this.dxfs.push('<dxf><font>' + (bold ? '<b/>' : '') + '<color rgb="FF' + fontColor + '"/></font>' +
            '<fill><patternFill><bgColor rgb="FF' + fillColor + '"/></patternFill></fill></dxf>');
        return this.dxfs.length - 1;
    };
    StyleBook.prototype.xml = function () {
        return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
            '<fonts count="' + this.fonts.length + '">' + this.fonts.join('') + '</fonts>' +
            '<fills count="' + this.fills.length + '">' + this.fills.join('') + '</fills>' +
            '<borders count="' + this.borders.length + '">' + this.borders.join('') + '</borders>' +
            '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
            '<cellXfs count="' + this.xfs.length + '">' + this.xfs.join('') + '</cellXfs>' +
            '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
            '<dxfs count="' + this.dxfs.length + '">' + this.dxfs.join('') + '</dxfs>' +
            '</styleSheet>';
    };

    function Sheet(name) {
        this.name = name;
        this.cells = {};
        this.merges = [];
        this.cols = [];
        this.rowH = {};
        this.cf = [];
        this.freezeRow = 0;
        this.filter = null;
        this.printTitleRow = 0;
        this.maxR = 1;
        this.maxC = 1;
    }
    Sheet.prototype.set = function (r, c, val, style, formula) {
        this.cells[r + ',' + c] = { v: val, s: style, f: formula };
        if (r > this.maxR) this.maxR = r;
        if (c > this.maxC) this.maxC = c;
    };
    Sheet.prototype.merge = function (r1, c1, r2, c2, val, style, formula) {
        for (let r = r1; r <= r2; r++) {
            for (let c = c1; c <= c2; c++) this.set(r, c, null, style);
        }
        this.set(r1, c1, val, style, formula);
        if (r1 !== r2 || c1 !== c2) this.merges.push(addr(r1, c1) + ':' + addr(r2, c2));
    };
    Sheet.prototype.xml = function (selected) {
        const rowsMap = {};
        Object.keys(this.cells).forEach(k => {
            const p = k.split(',');
            const r = +p[0], c = +p[1];
            (rowsMap[r] = rowsMap[r] || []).push({ c: c, cell: this.cells[k] });
        });
        let sd = '';
        Object.keys(rowsMap).map(Number).sort((a, b) => a - b).forEach(r => {
            const ht = this.rowH[r];
            sd += '<row r="' + r + '"' + (ht ? ' ht="' + ht + '" customHeight="1"' : '') + '>';
            rowsMap[r].sort((a, b) => a.c - b.c).forEach(o => {
                const ref = addr(r, o.c);
                const cell = o.cell;
                const sAttr = cell.s ? ' s="' + cell.s + '"' : '';
                const v = cell.v;
                if (cell.f) {
                    const f = '<f>' + xmlEsc(cell.f) + '</f>';
                    if (typeof v === 'number') sd += '<c r="' + ref + '"' + sAttr + '>' + f + '<v>' + v + '</v></c>';
                    else sd += '<c r="' + ref + '"' + sAttr + ' t="str">' + f + '<v>' + xmlEsc(v == null ? '' : v) + '</v></c>';
                } else if (v === null || v === undefined || v === '') {
                    sd += '<c r="' + ref + '"' + sAttr + '/>';
                } else if (typeof v === 'number' && isFinite(v)) {
                    sd += '<c r="' + ref + '"' + sAttr + '><v>' + v + '</v></c>';
                } else {
                    sd += '<c r="' + ref + '"' + sAttr + ' t="inlineStr"><is><t xml:space="preserve">' + xmlEsc(clip(v)) + '</t></is></c>';
                }
            });
            sd += '</row>';
        });

        const cols = this.cols.length
            ? '<cols>' + this.cols.map((w, i) => '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + w + '" customWidth="1"/>').join('') + '</cols>'
            : '';
        const pane = this.freezeRow
            ? '<pane ySplit="' + this.freezeRow + '" topLeftCell="A' + (this.freezeRow + 1) + '" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A' + (this.freezeRow + 1) + '" sqref="A' + (this.freezeRow + 1) + '"/>'
            : '';
        let x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
            '<sheetPr><pageSetUpPr fitToPage="1"/></sheetPr>' +
            '<dimension ref="A1:' + addr(this.maxR, this.maxC) + '"/>' +
            '<sheetViews><sheetView workbookViewId="0" showGridLines="0"' + (selected ? ' tabSelected="1"' : '') + '>' + pane + '</sheetView></sheetViews>' +
            '<sheetFormatPr defaultRowHeight="18"/>' + cols +
            '<sheetData>' + sd + '</sheetData>';
        if (this.filter) x += '<autoFilter ref="' + this.filter + '"/>';
        if (this.merges.length) x += '<mergeCells count="' + this.merges.length + '">' + this.merges.map(m => '<mergeCell ref="' + m + '"/>').join('') + '</mergeCells>';
        this.cf.forEach(g => { x += g; });
        x += '<pageMargins left="0.4" right="0.4" top="0.6" bottom="0.6" header="0.3" footer="0.3"/>' +
            '<pageSetup paperSize="9" orientation="' + (this.landscape ? 'landscape' : 'portrait') + '" fitToWidth="1" fitToHeight="0"/>' +
            '<headerFooter><oddFooter>&amp;L&amp;8Rapor Hasil Evaluasi — SMAN 4 Padang&amp;R&amp;8Halaman &amp;P dari &amp;N</oddFooter></headerFooter>' +
            '</worksheet>';
        return x;
    };

    function estHeight(texts, widths, minH) {
        let lines = 1;
        texts.forEach((t, i) => {
            const w = Math.max(4, (widths[i] || 10) * 1.05);
            let n = 0;
            String(t == null ? '' : t).split('\n').forEach(seg => { n += Math.max(1, Math.ceil(seg.length / w)); });
            if (n > lines) lines = n;
        });
        return Math.min(400, Math.max(minH || 20, lines * 14.5 + 6));
    }

    // ───────────────────────── Susunan rapor ─────────────────────────
    function buildWorkbookParts(snap) {
        const sb = new StyleBook();
        const C = { navy: '0F172A', indigo: '4F46E5', cyan: '0891B2', slate: 'F1F5F9', zebra: 'F8FAFC', green: 'DCFCE7', red: 'FEE2E2', amber: 'FEF3C7' };

        const st = {
            title: sb.add({ b: 1, sz: 18, color: 'FFFFFF', fill: C.navy, h: 'center' }),
            subtitle: sb.add({ b: 1, sz: 11, color: 'E2E8F0', fill: '1E293B', h: 'center', wrap: 1 }),
            infoBar: sb.add({ sz: 10, color: 'FFFFFF', fill: C.cyan, h: 'center', wrap: 1 }),
            section: sb.add({ b: 1, sz: 11, color: 'FFFFFF', fill: C.indigo, h: 'left', indent: 1 }),
            label: sb.add({ b: 1, fill: C.slate, border: 1, h: 'left', indent: 1 }),
            value: sb.add({ border: 1, h: 'left', wrap: 1, indent: 1 }),
            valueMono: sb.add({ border: 1, h: 'left', wrap: 1, indent: 1, sz: 10 }),
            bigScore: sb.add({ b: 1, sz: 40, border: 1, h: 'center', fill: snap.isPassed ? C.green : C.red, color: snap.isPassed ? '166534' : '991B1B', fmt: 1 }),
            status: sb.add({ b: 1, sz: 12, border: 1, h: 'center', fill: snap.isPassed ? C.green : C.red, color: snap.isPassed ? '166534' : '991B1B' }),
            th: sb.add({ b: 1, color: 'FFFFFF', fill: C.indigo, border: 1, h: 'center', wrap: 1 }),
            tdText: sb.add({ border: 1, h: 'left', v: 'top', wrap: 1, indent: 1 }),
            tdTextZ: sb.add({ border: 1, h: 'left', v: 'top', wrap: 1, indent: 1, fill: C.zebra }),
            tdCenter: sb.add({ border: 1, h: 'center', v: 'top' }),
            tdCenterZ: sb.add({ border: 1, h: 'center', v: 'top', fill: C.zebra }),
            tdBold: sb.add({ b: 1, border: 1, h: 'center', v: 'top' }),
            tdBoldZ: sb.add({ b: 1, border: 1, h: 'center', v: 'top', fill: C.zebra }),
            num: sb.add({ border: 1, h: 'center' }),
            numB: sb.add({ b: 1, border: 1, h: 'center' }),
            pct: sb.add({ b: 1, border: 1, h: 'center', fmt: 9 }),
            note: sb.add({ border: 1, h: 'left', wrap: 1, indent: 1, color: '475569', sz: 10 }),
            total: sb.add({ b: 1, border: 1, h: 'right', fill: C.slate, indent: 1 }),
            totalNum: sb.add({ b: 1, border: 1, h: 'center', fill: C.slate }),
            lockBox: sb.add({ b: 1, color: '92400E', fill: C.amber, border: 1, bc: 'F59E0B', h: 'left', wrap: 1, indent: 1 }),
            footer: sb.add({ i: 1, sz: 9, color: '64748B', h: 'center', wrap: 1 }),
            spacer: sb.add({})
        };
        const dxGreen = sb.addDxf('166534', C.green, true);
        const dxRed = sb.addDxf('991B1B', C.red, true);
        const dxAmber = sb.addDxf('92400E', C.amber, true);

        const counts = snap.counts;
        const hasDetail = !snap.postponed && snap.rows.length > 0;
        const lastDetail = 3 + snap.rows.length; // baris data terakhir pada sheet rincian
        const dRange = (col) => "'" + SHEET_DETAIL + "'!" + absAddr(4, col) + ':' + absAddr(lastDetail, col);

        // ═══ Sheet 1: Rapor ═══
        const s1 = new Sheet(SHEET_SUMMARY);
        s1.landscape = false;
        s1.cols = [26, 26, 14, 14, 14, 22];
        let r = 1;
        s1.merge(r, 1, r, 6, 'RAPOR HASIL EVALUASI PEMBELAJARAN SISWA', st.title); s1.rowH[r] = 42; r++;
        s1.merge(r, 1, r, 6, snap.moduleTitle.toUpperCase(), st.subtitle); s1.rowH[r] = estHeight([snap.moduleTitle], [90], 24); r++;
        s1.merge(r, 1, r, 6, 'SMAN 4 PADANG  •  Guru Pengampu: Bpk. MUHAMMAD HAFIDH PUTRA ROSHADI, S.Pd.', st.infoBar); s1.rowH[r] = 22; r++;
        s1.rowH[r] = 8; r++;

        s1.merge(r, 1, r, 3, 'IDENTITAS SISWA', st.section); s1.merge(r, 4, r, 6, 'NILAI AKHIR', st.section); s1.rowH[r] = 22; r++;
        const idTop = r; // baris pertama identitas
        const idRows = [
            ['Nama Siswa', snap.name, st.value],
            ['Kelas', snap.cls, st.value],
            ['Modul Kuis', snap.moduleTitle, st.value],
            ['Tanggal & Waktu', (snap.date || '-') + (snap.time ? '  •  ' + snap.time : ''), st.value],
            ['Durasi Pengerjaan', snap.duration || '-', st.value],
            ['Jenis Pengerjaan', snap.isRemedial
                ? 'REMEDIAL (nilai awal ' + (snap.originalScore != null ? snap.originalScore : '-') + ' ➔ nilai akhir ' + snap.score + ')'
                : 'Pengerjaan Reguler', st.value],
            ['No. Bukti Verifikasi', snap.proofId, st.valueMono]
        ];
        if (snap.isRemedial) {
            const att = snap.attemptScore !== undefined && snap.attemptScore !== null ? snap.attemptScore : snap.score;
            idRows.push(['Status Remedial', `Sudah Remedial · Tuntas (Capaian: ${att} ➔ Nilai Akhir KKM: ${snap.score})`, st.value]);
        }
        idRows.forEach((row, i) => {
            const rr = idTop + i;
            s1.set(rr, 1, row[0], st.label);
            s1.merge(rr, 2, rr, 3, row[1], row[2]);
            s1.rowH[rr] = estHeight([row[1]], [28], 22);
        });
        // Blok nilai besar (kanan)
        const scoreR = idTop;
        const kkmR = idTop + 4;
        const poinR = idTop + 5;
        const statusR = idTop + 3;
        s1.merge(scoreR, 4, scoreR + 2, 6, snap.score, st.bigScore);
        const kkmAddr = absAddr(kkmR, 6);
        const scoreAddr = absAddr(scoreR, 4);
        const statusText = snap.isPassed ? 'LULUS (KOMPETEN)' : 'BELUM LULUS (REMEDIAL)';
        s1.merge(statusR, 4, statusR, 6, statusText, st.status, 'IF(' + scoreAddr + '>=' + kkmAddr + ',"LULUS (KOMPETEN)","BELUM LULUS (REMEDIAL)")');
        s1.merge(kkmR, 4, kkmR, 5, 'Batas Kelulusan (KKM)', st.label); s1.set(kkmR, 6, snap.kkm, st.numB);
        s1.merge(poinR, 4, poinR, 5, 'Poin Diperoleh', st.label); s1.set(poinR, 6, (Math.round(snap.pointsEarned * 100) / 100) + ' / ' + (Math.round(snap.totalPoints * 100) / 100), st.tdBold);
        // Format kondisional: seluruh blok nilai hijau/merah mengikuti nilai vs KKM
        const blk = addr(scoreR, 4) + ':' + addr(statusR, 6);
        s1.cf.push('<conditionalFormatting sqref="' + blk + '">' +
            '<cfRule type="expression" dxfId="' + dxGreen + '" priority="1"><formula>' + xmlEsc(scoreAddr + '>=' + kkmAddr) + '</formula></cfRule>' +
            '<cfRule type="expression" dxfId="' + dxRed + '" priority="2"><formula>' + xmlEsc(scoreAddr + '<' + kkmAddr) + '</formula></cfRule>' +
            '</conditionalFormatting>');
        r = idTop + idRows.length;
        s1.rowH[r] = 10; r++;

        // Ringkasan
        s1.merge(r, 1, r, 6, 'RINGKASAN HASIL BELAJAR', st.section); s1.rowH[r] = 22; r++;
        s1.set(r, 1, 'Indikator', st.th); s1.set(r, 2, 'Capaian', st.th); s1.merge(r, 3, r, 6, 'Keterangan', st.th); s1.rowH[r] = 22; r++;
        const rTotal = r, rFull = r + 1, rPart = r + 2, rWrong = r + 3, rAcc = r + 4, rPow = r + 5;
        const addStat = (rr, label, val, note, style, formula) => {
            s1.set(rr, 1, label, st.label);
            s1.set(rr, 2, val, style || st.numB, formula);
            s1.merge(rr, 3, rr, 6, note, st.note);
            s1.rowH[rr] = estHeight([note], [56], 22);
        };
        addStat(rTotal, 'Total Butir Soal', counts.total, 'Jumlah soal pada paket kuis ini.');
        addStat(rFull, 'Benar Penuh', counts.full, 'Mendapat poin maksimal pada butir tersebut.', st.numB, hasDetail ? 'COUNTIF(' + dRange(6) + ',"BENAR")' : null);
        addStat(rPart, 'Benar Sebagian', counts.partial, 'Pilihan majemuk / matriks yang mendapat poin parsial.', st.numB, hasDetail ? 'COUNTIF(' + dRange(6) + ',"SEBAGIAN")' : null);
        addStat(rWrong, 'Salah / Tidak Dijawab', counts.wrong, 'Tidak memperoleh poin.', st.numB, hasDetail ? 'COUNTIF(' + dRange(6) + ',"SALAH")' : null);
        addStat(rAcc, '% Soal Benar Penuh', counts.total ? counts.full / counts.total : 0, 'BUKAN nilai akhir. Nilai akhir dihitung dari poin berbobot (termasuk poin parsial).', st.pct, 'IF(' + absAddr(rTotal, 2) + '=0,0,' + absAddr(rFull, 2) + '/' + absAddr(rTotal, 2) + ')');
        addStat(rPow, 'Penguasaan (Poin)', snap.totalPoints ? snap.pointsEarned / snap.totalPoints : 0, 'Poin diperoleh ÷ poin maksimal — dasar perhitungan nilai akhir.', st.pct);
        r = rPow + 1;
        if (snap.attemptScore !== snap.score || snap.isRemedial) {
            addStat(r, 'Nilai Percobaan Ini', snap.attemptScore, 'Nilai resmi memakai aturan remedial / nilai tertinggi sesuai kebijakan guru.', st.numB);
            r++;
        }
        addStat(r, 'Rekor Streak Terbaik', snap.maxStreak, 'Jawaban benar penuh beruntun terpanjang.', st.numB); r++;
        addStat(r, 'Petunjuk Dipakai', snap.hints, 'Jumlah penggunaan petunjuk berpikir.', st.numB); r++;
        addStat(r, 'Pindah Tab / Layar', snap.tabSwitches, 'Pelanggaran fokus layar yang tercatat sistem pengawas.', st.numB); r++;
        s1.rowH[r] = 10; r++;

        // Analisis per kesulitan
        if (snap.byDifficulty.length) {
            s1.merge(r, 1, r, 6, 'ANALISIS PER TINGKAT KESULITAN', st.section); s1.rowH[r] = 22; r++;
            ['Tingkat', 'Jumlah Soal', 'Poin Diperoleh', 'Poin Maksimal', 'Penguasaan', 'Catatan'].forEach((h, i) => s1.set(r, i + 1, h, st.th));
            s1.rowH[r] = 22; r++;
            snap.byDifficulty.forEach(d => {
                const ratio = d.max ? d.points / d.max : 0;
                s1.set(r, 1, d.label, st.label);
                s1.set(r, 2, d.count, st.num);
                s1.set(r, 3, d.points, st.num);
                s1.set(r, 4, d.max, st.num);
                s1.set(r, 5, ratio, st.pct, 'IF(' + addr(r, 4) + '=0,0,' + addr(r, 3) + '/' + addr(r, 4) + ')');
                const kuat = ratio >= snap.kkm / 100, cukup = ratio >= 0.6;
                s1.set(r, 6, kuat ? 'Kuat' : (cukup ? 'Cukup' : 'Perlu Latihan'), st.tdBold,
                    'IF(' + addr(r, 5) + '>=' + kkmAddr + '/100,"Kuat",IF(' + addr(r, 5) + '>=0.6,"Cukup","Perlu Latihan"))');
                s1.rowH[r] = 22;
                r++;
            });
            const first = r - snap.byDifficulty.length;
            s1.cf.push('<conditionalFormatting sqref="' + addr(first, 6) + ':' + addr(r - 1, 6) + '">' +
                '<cfRule type="cellIs" dxfId="' + dxGreen + '" priority="3" operator="equal"><formula>"Kuat"</formula></cfRule>' +
                '<cfRule type="cellIs" dxfId="' + dxAmber + '" priority="4" operator="equal"><formula>"Cukup"</formula></cfRule>' +
                '<cfRule type="cellIs" dxfId="' + dxRed + '" priority="5" operator="equal"><formula>"Perlu Latihan"</formula></cfRule>' +
                '</conditionalFormatting>');
            s1.rowH[r] = 10; r++;
        }

        if (snap.postponed) {
            s1.merge(r, 1, r, 6, '🔒 Rincian butir soal & pembahasan dirahasiakan oleh Guru selama sesi ujian bersama berlangsung. ' +
                'Rapor lengkap dapat diunduh kembali setelah Guru membuka pembahasan.', st.lockBox);
            s1.rowH[r] = 40; r++;
            s1.rowH[r] = 8; r++;
        }
        s1.merge(r, 1, r, 6, 'Dokumen ini diterbitkan otomatis oleh Sistem Evaluasi Detektif Fakta Digital • SMAN 4 Padang • Nomor Verifikasi: ' + snap.proofId, st.footer);
        s1.rowH[r] = 30;

        // ═══ Sheet 2: Rincian Jawaban ═══
        let s2 = null;
        if (hasDetail) {
            s2 = new Sheet(SHEET_DETAIL);
            s2.landscape = true;
            s2.cols = [6, 10, 52, 34, 34, 12, 8, 8, 62];
            s2.merge(1, 1, 1, 9, 'RINCIAN JAWABAN & PEMBAHASAN — ' + snap.name.toUpperCase() + ' (' + snap.cls + ')', st.title); s2.rowH[1] = 34;
            s2.merge(2, 1, 2, 9, 'Hasil: BENAR = poin penuh  •  SEBAGIAN = poin parsial  •  SALAH = tidak memperoleh poin.  Gunakan tombol filter pada judul kolom untuk menyaring.', st.infoBar); s2.rowH[2] = 22;
            ['No', 'Tingkat', 'Pertanyaan Soal', 'Jawaban Anda', 'Kunci Jawaban Valid', 'Hasil', 'Poin', 'Maks', 'Pembahasan & Logika Edukatif']
                .forEach((h, i) => s2.set(3, i + 1, h, st.th));
            s2.rowH[3] = 26;
            snap.rows.forEach((row, i) => {
                const rr = 4 + i;
                const z = i % 2 === 1;
                s2.set(rr, 1, row.no, z ? st.tdBoldZ : st.tdBold);
                s2.set(rr, 2, row.difficulty, z ? st.tdCenterZ : st.tdCenter);
                s2.set(rr, 3, row.question, z ? st.tdTextZ : st.tdText);
                s2.set(rr, 4, row.selected, z ? st.tdTextZ : st.tdText);
                s2.set(rr, 5, row.key, z ? st.tdTextZ : st.tdText);
                s2.set(rr, 6, row.result, z ? st.tdBoldZ : st.tdBold);
                s2.set(rr, 7, row.points, z ? st.tdCenterZ : st.tdCenter);
                s2.set(rr, 8, row.maxPoints, z ? st.tdCenterZ : st.tdCenter);
                s2.set(rr, 9, row.explanation, z ? st.tdTextZ : st.tdText);
                s2.rowH[rr] = estHeight([row.question, row.selected, row.key, row.explanation], [52, 34, 34, 62], 24);
            });
            const tr = lastDetail + 1;
            s2.merge(tr, 1, tr, 6, 'TOTAL POIN', st.total);
            s2.set(tr, 7, snap.pointsEarned, st.totalNum, 'SUM(' + addr(4, 7) + ':' + addr(lastDetail, 7) + ')');
            s2.set(tr, 8, snap.totalPoints, st.totalNum, 'SUM(' + addr(4, 8) + ':' + addr(lastDetail, 8) + ')');
            s2.set(tr, 9, '', st.total);
            s2.rowH[tr] = 22;
            s2.freezeRow = 3;
            s2.filter = 'A3:' + addr(lastDetail, 9);
            s2.printTitleRow = 3;
            s2.cf.push('<conditionalFormatting sqref="' + addr(4, 6) + ':' + addr(lastDetail, 6) + '">' +
                '<cfRule type="cellIs" dxfId="' + dxGreen + '" priority="1" operator="equal"><formula>"BENAR"</formula></cfRule>' +
                '<cfRule type="cellIs" dxfId="' + dxAmber + '" priority="2" operator="equal"><formula>"SEBAGIAN"</formula></cfRule>' +
                '<cfRule type="cellIs" dxfId="' + dxRed + '" priority="3" operator="equal"><formula>"SALAH"</formula></cfRule>' +
                '</conditionalFormatting>');
        }

        return { sb: sb, sheets: s2 ? [s1, s2] : [s1], lastDetail: lastDetail };
    }

    async function buildXlsxBlob(snap) {
        const JSZipCtor = global.JSZip;
        if (typeof JSZipCtor === 'undefined') throw new Error('JSZip belum tersedia');
        const parts = buildWorkbookParts(snap);
        const zip = new JSZipCtor();
        const n = parts.sheets.length;

        let ct = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
            '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
            '<Default Extension="xml" ContentType="application/xml"/>' +
            '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>';
        for (let i = 1; i <= n; i++) ct += '<Override PartName="/xl/worksheets/sheet' + i + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>';
        ct += '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
            '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
            '</Types>';
        zip.file('[Content_Types].xml', ct);

        zip.file('_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
            '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
            '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
            '</Relationships>');

        const iso = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
        zip.file('docProps/core.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
            '<dc:title>' + xmlEsc('Rapor ' + snap.name + ' - ' + snap.cls) + '</dc:title>' +
            '<dc:creator>Sistem Evaluasi Detektif Fakta - SMAN 4 Padang</dc:creator>' +
            '<dcterms:created xsi:type="dcterms:W3CDTF">' + iso + '</dcterms:created></cp:coreProperties>');

        let wb = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
            '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
            '<bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/></bookViews><sheets>';
        parts.sheets.forEach((s, i) => { wb += '<sheet name="' + xmlEsc(s.name) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; });
        wb += '</sheets>';
        let names = '';
        parts.sheets.forEach((s, i) => {
            const q = "'" + s.name + "'";
            if (s.filter) {
                const m = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(s.filter);
                names += '<definedName name="_xlnm._FilterDatabase" localSheetId="' + i + '" hidden="1">' + xmlEsc(q + '!$' + m[1] + '$' + m[2] + ':$' + m[3] + '$' + m[4]) + '</definedName>';
            }
            if (s.printTitleRow) {
                names += '<definedName name="_xlnm.Print_Titles" localSheetId="' + i + '">' + xmlEsc(q + '!$' + s.printTitleRow + ':$' + s.printTitleRow) + '</definedName>';
            }
        });
        if (names) wb += '<definedNames>' + names + '</definedNames>';
        wb += '<calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>';
        zip.file('xl/workbook.xml', wb);

        let rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">';
        for (let i = 1; i <= n; i++) rels += '<Relationship Id="rId' + i + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + i + '.xml"/>';
        rels += '<Relationship Id="rId' + (n + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';
        zip.file('xl/_rels/workbook.xml.rels', rels);

        zip.file('xl/styles.xml', parts.sb.xml());
        parts.sheets.forEach((s, i) => zip.file('xl/worksheets/sheet' + (i + 1) + '.xml', s.xml(i === 0)));

        return zip.generateAsync({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            compression: 'DEFLATE'
        });
    }

    function downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            if (a.parentNode) a.parentNode.removeChild(a);
            URL.revokeObjectURL(url);
        }, 1500);
    }

    global.RaporExcel = {
        buildSnapshot: buildSnapshot,
        buildXlsxBlob: buildXlsxBlob,
        downloadBlob: downloadBlob,
        _internal: { buildWorkbookParts: buildWorkbookParts, colL: colL }
    };
    global.buildStudentResultSnapshot = buildSnapshot;
})(typeof window !== 'undefined' ? window : globalThis);
