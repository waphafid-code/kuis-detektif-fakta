import os
import re
import subprocess
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_cell_border(cell, **kwargs):
    """
    kwargs: top, bottom, left, right
    values: dict(sz=12, val='single', color='1E3A8A')
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
    for edge, border_args in kwargs.items():
        if border_args:
            b_xml = parse_xml(
                f'<w:{edge} {nsdecls("w")} '
                f'w:val="{border_args.get("val", "single")}" '
                f'w:sz="{border_args.get("sz", "4")}" '
                f'w:space="0" '
                f'w:color="{border_args.get("color", "auto")}"/>'
            )
            tcBorders.append(b_xml)
        else:
            b_xml = parse_xml(f'<w:{edge} {nsdecls("w")} w:val="none"/>')
            tcBorders.append(b_xml)
    tcPr.append(tcBorders)

def create_guide_document():
    doc = docx.Document()
    
    # Page setup - A4, Margins: Top 2.5cm, Bottom 2.5cm, Left 3.0cm, Right 2.5cm
    sections = doc.sections
    for section in sections:
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.18)
        section.right_margin = Inches(1.0)
        
    def add_p(text, align=WD_ALIGN_PARAGRAPH.LEFT, bold=False, italic=False, size=11, color=(30, 41, 59), space_after=4, space_before=0, bullet=False):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        
        if bullet:
            p.paragraph_format.left_indent = Inches(0.25)
            p.paragraph_format.first_line_indent = Inches(-0.25)
            text = "• " + text
            
        run = p.add_run(text)
        run.bold = bold
        run.italic = italic
        run.font.name = 'Times New Roman'
        run.font.size = Pt(size)
        run.font.color.rgb = RGBColor(*color)
        return p

    def add_formatted_p(runs_data, align=WD_ALIGN_PARAGRAPH.LEFT, space_after=4, space_before=0, bullet=False):
        """runs_data: list of tuples (text, bold, italic, color, size)"""
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        
        if bullet:
            p.paragraph_format.left_indent = Inches(0.25)
            p.paragraph_format.first_line_indent = Inches(-0.25)
            
        for item in runs_data:
            text = item[0]
            b = item[1] if len(item) > 1 else False
            it = item[2] if len(item) > 2 else False
            c = item[3] if len(item) > 3 else (30, 41, 59)
            sz = item[4] if len(item) > 4 else 11
            
            run = p.add_run(text)
            run.bold = b
            run.italic = it
            run.font.name = 'Times New Roman'
            run.font.size = Pt(sz)
            run.font.color.rgb = RGBColor(*c)
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.2
        p.paragraph_format.space_before = Pt(16)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(15)
        run.font.color.rgb = RGBColor(30, 58, 138) # Navy Blue
        
        # Add decorative bottom border under H1
        pBdr = parse_xml(f'<w:pBdr {nsdecls("w")}><w:bottom w:val="single" w:sz="12" w:space="4" w:color="1E3A8A"/></w:pBdr>')
        p._p.get_or_add_pPr().append(pBdr)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12.5)
        run.font.color.rgb = RGBColor(15, 23, 42) # Slate 900
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.italic = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(11.5)
        run.font.color.rgb = RGBColor(51, 65, 85)
        return p

    def add_callout(title, text_lines, box_type="info"):
        """Callout box with colored left bar"""
        colors = {
            "info": ("F0F7FF", "1E3A8A", (30, 58, 138)),
            "success": ("F0FDF4", "16A34A", (22, 101, 52)),
            "warning": ("FEFCE8", "CA8A04", (133, 77, 14)),
            "danger": ("FEF2F2", "DC2626", (153, 27, 27)),
        }
        bg, border_col, title_rgb = colors.get(box_type, colors["info"])
        
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        set_cell_background(cell, bg)
        set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
        set_cell_border(cell, 
                        left=dict(val="single", sz=24, color=border_col),
                        top=dict(val="none"),
                        right=dict(val="none"),
                        bottom=dict(val="none"))
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        run_t = p.add_run(title)
        run_t.bold = True
        run_t.font.name = 'Times New Roman'
        run_t.font.size = Pt(11)
        run_t.font.color.rgb = RGBColor(*title_rgb)
        
        for line in text_lines:
            p_sub = cell.add_paragraph()
            p_sub.paragraph_format.space_before = Pt(1)
            p_sub.paragraph_format.space_after = Pt(2)
            p_sub.paragraph_format.line_spacing = 1.15
            run_s = p_sub.add_run(line)
            run_s.font.name = 'Times New Roman'
            run_s.font.size = Pt(10.5)
            run_s.font.color.rgb = RGBColor(30, 41, 59)
            
        p_space = doc.add_paragraph()
        p_space.paragraph_format.space_before = Pt(0)
        p_space.paragraph_format.space_after = Pt(4)

    # ============================================================
    # 1. HEADER & COVER SECTION
    # ============================================================
    p_badge = add_p("BUKU SAKU & PANDUAN LENGKAP PRESENTASI PENGUJIAN QA", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=11, color=(30, 58, 138), space_after=2)
    p_title = add_p("MENGENAL ARSITEKTUR, CARA KERJA, TEKNOLOGI & METODOLOGI QA\nAPLIKASI QUIZMASTER SMAN 4 PADANG v3.0.02", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=15, color=(15, 23, 42), space_after=4)
    p_sub = add_p("Disusun untuk Mempermudah Penjelasan Teknis & Sidang Evaluasi Tugas Praktikum QA di Depan Dosen Penguji", align=WD_ALIGN_PARAGRAPH.CENTER, italic=True, size=11, color=(71, 85, 105), space_after=14)

    # Info Identity Box
    tbl_id = doc.add_table(rows=5, cols=2)
    tbl_id.alignment = WD_TABLE_ALIGNMENT.CENTER
    id_data = [
        ("Nama Tim Penguji / Praktikan", ": Muhammad Hafidh Putra Roshadi, Pipit Khofifah, Harie Fadhil, Andre Geovani"),
        ("Mata Kuliah / Tugas", ": Penjaminan Mutu Perangkat Lunak (Software Quality Assurance)"),
        ("Aplikasi yang Diaudit", ": QuizMaster SMAN 4 Padang (Versi Rilis Stabil v3.0.02)"),
        ("Guru Pengampu / Domain Expert", ": RINI SYAFITRI (Guru Mata Pelajaran Informatika SMAN 4 Padang)"),
        ("Target Populasi & Scope Data", ": 216 Siswa Resmi (Kelas X E 1 s.d X E 6) • 2 Modul Pembelajaran"),
    ]
    for r_idx, (col1, col2) in enumerate(id_data):
        row = tbl_id.rows[r_idx]
        c1, c2 = row.cells[0], row.cells[1]
        c1.width = Inches(2.3)
        c2.width = Inches(4.5)
        set_cell_background(c1, "F8FAFC")
        set_cell_background(c2, "F8FAFC")
        set_cell_margins(c1, 40, 40, 80, 80)
        set_cell_margins(c2, 40, 40, 80, 80)
        set_cell_border(c1, top=dict(val="none"), bottom=dict(val="single", sz=2, color="E2E8F0"), left=dict(val="none"), right=dict(val="none"))
        set_cell_border(c2, top=dict(val="none"), bottom=dict(val="single", sz=2, color="E2E8F0"), left=dict(val="none"), right=dict(val="none"))
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(col1)
        r1.bold = True
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(10)
        r1.font.color.rgb = RGBColor(30, 41, 59)
        
        p2 = c2.paragraphs[0]
        p2.paragraph_format.space_after = Pt(2)
        r2 = p2.add_run(col2)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(10)
        r2.font.color.rgb = RGBColor(15, 23, 42)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ============================================================
    # 2. ELEVATOR PITCH (RINGKASAN 60 DETIK UNTUK DOSEN)
    # ============================================================
    add_h1("1. ELEVATOR PITCH (CARA MENJELASKAN DALAM 60 DETIK)")
    add_callout(
        "💡 Bocoran Jawaban Instan Jika Dosen Bertanya: 'Jelaskan Secara Singkat Apa Aplikasi Ini dan Apa yang Kalian Kerjakan?'",
        [
            "\"Selamat pagi/siang Bapak/Ibu Dosen. Aplikasi yang kami audit adalah QuizMaster v3.0.02, sebuah platform web evaluasi pembelajaran kuis interaktif yang digunakan oleh Ibu Guru Rini Syafitri di SMAN 4 Padang untuk 216 siswa di kelas X E 1 sampai X E 6.\"",
            "\"Aplikasi ini memiliki 2 pilar utama: pertama, Ruang Ujian Siswa dengan fitur anti-curang, timer, sound effect dinamis, dan sistem ambang kelulusan KKM 80 (Tuntas vs Remedial). Kedua, Dasbor Manajemen Guru dengan keamanan berlapis (PIN 4 digit '2543' dan sensor sidik jari biometrik hardware WebAuthn), dilengkapi Asisten Analisis AI Guru berbasis NLP yang memetakan miskonsepsi siswa dan memantau siswa yang belum ujian secara real-time.\"",
            "\"Sebagai QA Engineer, fokus kami bukan hanya sekadar menguji UI, melainkan mengawal seluruh siklus kualitas: mulai dari Shift-Left (mereview ambiguitas requirement PIN dan kriteria KKM), menyusun Risk Register berbobot, merancang dan mengeksekusi 14 Test Case menggunakan 4 teknik Black-Box formal (Equivalence Partitioning, Boundary Value Analysis, Decision Table, dan State Transition), hingga menemukan dan memvalidasi perbaikan 2 bug kritis (Defect Chatbot NLP Loop dan Defect Layout Gambar Hasil Ujian). Hasilnya, seluruh requirement dan risiko terverifikasi 100% PASS dan aplikasi siap rilis.\""
        ],
        box_type="info"
    )

    # ============================================================
    # 3. LATAR BELAKANG & TUJUAN APLIKASI
    # ============================================================
    add_h1("2. LATAR BELAKANG, TUJUAN & PENGGUNA APLIKASI")
    add_formatted_p([
        ("Aplikasi ", False, False),
        ("QuizMaster SMAN 4 Padang", True, False),
        (" dikembangkan untuk mengatasi 3 kendala nyata dalam pelaksanaan ujian mata pelajaran Informatika:", False, False)
    ])
    add_formatted_p([("1. Kendala Efisiensi Rekapitulasi Manual: ", True, False), ("Dengan 216 siswa dari 6 rombel kelas, penilaian konvensional membutuhkan waktu berhari-hari untuk mengelompokkan siswa mana yang tuntas dan mana yang harus remedial.", False, False)], bullet=True)
    add_formatted_p([("2. Miskonsepsi Kritis Materi Literasi & Keamanan: ", True, False), ("Siswa sering kali salah paham pada materi fundamental. Sebagai contoh nyata pada Soal #18 Modul 2, banyak siswa mengira kunci sidik jari di ponsel sudah otomatis melindungi data yang dikirim di Wi-Fi publik, padahal transmisi udara tetap rentan sniffing tanpa enkripsi SSL/TLS.", False, False)], bullet=True)
    add_formatted_p([("3. Kebutuhan Proteksi Hak Akses Guru & Anti-Curang: ", True, False), ("Ujian sekolah rentan kebocoran kunci jawaban atau akses ilegal di luar jam sekolah, sehingga dibutuhkan sistem otorisasi guru yang ketat serta tata kelola jadwal ujian otomatis.", False, False)], bullet=True)

    add_h2("Dua Peran Pengguna Utama (User Roles)")
    add_formatted_p([
        ("• Siswa (Learner): ", True, False, (30, 58, 138)),
        ("Mengakses ruang belajar, membaca modul, mengerjakan kuis dengan sistem timer dan anti-pindah tab, serta menerima hasil penilaian instan beserta lembar refleksi konsep.", False, False)
    ])
    add_formatted_p([
        ("• Guru / Pendidik (Bu Rini Syafitri): ", True, False, (30, 58, 138)),
        ("Memegang kendali penuh melalui Dasbor Guru untuk mengunci/membuka akses kuis per rombel, memantau nilai live 216 siswa, mengekspor laporan rekap ke Excel, dan berkonsultasi dengan Asisten AI Guru.", False, False)
    ])

    # ============================================================
    # 4. CARA KERJA SISTEM & WORKFLOW STEP-BY-STEP
    # ============================================================
    add_h1("3. CARA KERJA APLIKASI (ALUR WORKFLOW APLIKASI)")
    
    add_h2("A. Alur Pengalaman Siswa (Student Journey)")
    add_formatted_p([("Langkah 1 (Pilih Identitas & Modul): ", True, False), ("Siswa membuka web, memilih nama dan kelasnya (X E 1 s.d X E 6), lalu memilih salah satu dari 2 modul: Modul 1 (Detektif Fakta) atau Modul 2 (Keamanan Jaringan & Sistem Informasi).", False, False)], bullet=True)
    add_formatted_p([("Langkah 2 (Validasi Hak Akses Kelas): ", True, False), ("Sistem otomatis memeriksa apakah kelas siswa diizinkan mengikuti ujian saat itu. Jika Bu Rini mengunci kelas secara manual, modal 'Akses Kuis Belum Dibuka' akan muncul dan mencegah siswa masuk.", False, False)], bullet=True)
    add_formatted_p([("Langkah 3 (Pengerjaan Kuis Interaktif): ", True, False), ("Siswa mengerjakan 20 butir soal pilihan ganda. Sistem mengacak urutan soal, menghitung mundur waktu (timer), mencatat 'Streak' jawaban benar beruntun, serta memutar sound effect interaktif.", False, False)], bullet=True)
    add_formatted_p([("Langkah 4 (Sistem Anti-Curang / Anti-Cheat): ", True, False), ("Jika siswa mencoba berpindah tab browser atau keluar dari mode layar penuh untuk mencari contekan, sistem memicu peringatan pelanggaran integritas.", False, False)], bullet=True)
    add_formatted_p([("Langkah 5 (Kalkulasi Skor Otomatis & Evaluasi KKM 80): ", True, False), ("Begitu tombol selesai ditekan, skor dihitung dengan rumus: (Jumlah Benar / 20) × 100. Sistem mencocokkan nilai dengan ambang KKM 80:", False, False)], bullet=True)
    
    # Sub-bullets for KKM
    add_formatted_p([("   - Jika Skor < 80 (Misal: 79): ", True, False, (185, 28, 28)), ("Status dinyatakan 'BELUM TUNTAS KKM' dan sistem otomatis mengarahkan siswa ke modul remedial dan ulasan materi yang belum dikuasai.", False, False)])
    add_formatted_p([("   - Jika Skor = 80: ", True, False, (22, 101, 52)), ("Status dinyatakan 'TUNTAS KKM' (Lulus tepat pada ambang standar kompetensi minimum).", False, False)])
    add_formatted_p([("   - Jika Skor > 80 (Misal: 85 - 100): ", True, False, (30, 58, 138)), ("Status dinyatakan 'TUNTAS SEMPURNA / PRESTASI HEBAT' dengan lencana kompeten.", False, False)])

    add_formatted_p([("Langkah 6 (Pemberian Bukti Resmi & Review): ", True, False), ("Siswa mendapatkan kode bukti submit unik (misal: QM-X-E1-BVA85-EXCELLENT) dan dapat membaca pembahasan rinci mengapa jawabannya benar atau salah.", False, False)], bullet=True)

    add_h2("B. Alur Kerja Guru (Teacher Journey)")
    add_formatted_p([("1. Autentikasi Ganda Menuju Dasbor Guru: ", True, False), ("Guru menekan tombol 'Dasbor Guru' di navigasi. Sistem memunculkan modal verifikasi biometrik. Guru dapat memasukkan 4 digit PIN rahasia ('2543') atau menempelkan sidik jari pada sensor fisik HP menggunakan WebAuthn API.", False, False)], bullet=True)
    add_formatted_p([("2. Manajemen Tata Kelola Akses Kelas (Access Control): ", True, False), ("Guru dapat memilih mode akses: Always Open (siswa bebas ujian), Scheduled (berdasarkan jam pelajaran resmi), atau menekan saklar 'Kunci Kelas Manual' untuk menutup kuis seketika.", False, False)], bullet=True)
    add_formatted_p([("3. Pemantauan Nilai & Distribusi Real-Time: ", True, False), ("Dasbor menampilkan kartu ringkasan: jumlah siswa yang sudah ujian, rata-rata nilai per kelas, persentase kelulusan KKM, serta tabel rekapitulasi 216 siswa yang dapat difilter per kelas.", False, False)], bullet=True)
    add_formatted_p([("4. Asisten Cerdas AI Guru (Analitik NLP Interaktif): ", True, False), ("Ibu Guru dapat mengetik pertanyaan berbahasa santai ke chatbot AI Guru, seperti: \"Di mana banyak miskonsepsi?\", \"Siapa yang belum mengerjakan modul jaringan di E1?\", atau \"Tampilkan siswa yang remedial\". AI langsung membaca basis data 216 siswa dan memberikan jawaban instan lengkap dengan rekomendasi pedagogis.", False, False)], bullet=True)

    # ============================================================
    # 5. SISTEM & ARSITEKTUR TEKNIS APLIKASI
    # ============================================================
    add_h1("4. ARSITEKTUR SISTEM & STRUKTUR FILE")
    add_formatted_p([
        ("QuizMaster dibangun dengan filosofi ", False, False),
        ("Client-Side Modular & Local-First Architecture", True, False),
        (". Artinya, aplikasi dapat beroperasi 100% cepat tanpa ketergantungan server yang lambat, bebas latensi di laboratorium sekolah, namun tetap mendukung sinkronisasi cloud.", False, False)
    ])

    tbl_arch = doc.add_table(rows=7, cols=3)
    tbl_arch.alignment = WD_TABLE_ALIGNMENT.CENTER
    arch_headers = ["File / Komponen", "Peran & Fungsi dalam Sistem", "Koneksi dalam Alur Aplikasi"]
    for c_i, h_txt in enumerate(arch_headers):
        cell = tbl_arch.rows[0].cells[c_i]
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, 60, 60, 100, 100)
        p = cell.paragraphs[0]
        r = p.add_run(h_txt)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(255, 255, 255)

    arch_rows = [
        ("index.html", "Single Page Application (SPA) shell yang memuat seluruh antarmuka (Lobby, Ujian, Hasil, Dasbor Guru, AI Studio).", "Mencegah reload halaman penuh saat transisi layar."),
        ("js/quiz_engine.js", "State manager pengerjaan kuis, pengacak soal, pengukur waktu mundur (timer), deteksi tab-switch anti-curang.", "Mengontrol siklus hidup state S1 (Lobby) -> S2 (Exam) -> S3 (Result)."),
        ("js/dashboard.js", "Pengendali otorisasi PIN '2543', WebAuthn hardware biometric fingerprint, dan tabel analitik nilai guru.", "Menjaga keamanan akses administratif ruang guru."),
        ("js/teacher_chatbot.js", "Mesin NLP Heuristik yang membaca konteks 216 siswa untuk menjawab pertanyaan analitis guru secara real-time.", "Menghubungkan data telemetri siswa dengan rekomendasi pedagogis."),
        ("bank_soal/*.json", "Basis data soal terstruktur kurikulum Informatika SMAN 4 Padang (Modul 1 Fakta & Modul 2 Jaringan).", "Menyediakan bank butir soal berbobot dan kunci pembahasan."),
        ("css/style.css", "Sistem desain Glassmorphism responsif (mobile 390px s.d desktop) bersertifikasi kontras tinggi WCAG AAA.", "Memastikan keterbacaan tinggi tanpa tabrakan warna.")
    ]
    for r_i, r_data in enumerate(arch_rows):
        row = tbl_arch.rows[r_i + 1]
        bg = "FFFFFF" if r_i % 2 == 0 else "F8FAFC"
        for c_i, txt in enumerate(r_data):
            cell = row.cells[c_i]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 50, 50, 80, 80)
            set_cell_border(cell, top=dict(val="single", sz=2, color="E2E8F0"), bottom=dict(val="single", sz=2, color="E2E8F0"), left=dict(val="none"), right=dict(val="none"))
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(txt)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9.5)
            if c_i == 0:
                r.bold = True
                r.font.color.rgb = RGBColor(30, 58, 138)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ============================================================
    # 6. TEKNOLOGI YANG DIGUNAKAN (TECH STACK)
    # ============================================================
    add_h1("5. TEKNOLOGI & TEKNIKAL STACK APLIKASI")
    add_formatted_p([
        ("Jika dosen bertanya: ", True, False, (30, 58, 138)),
        ("\"Teknologi apa saja yang kalian pakai di aplikasi ini dan mengapa memilih teknologi tersebut?\", jelaskan 5 pilar berikut:", False, False)
    ])

    tech_data = [
        ("1. Frontend Core (HTML5 Semantic & Vanilla Modern JavaScript ES6+ / ES2022)", [
            "• Menggunakan Vanilla JavaScript murni tanpa framework berat (seperti React/Angular) agar aplikasi sangat ringan, memuat dalam waktu < 0.5 detik, dan kompatibel pada smartphone siswa spek rendah.",
            "• Memanfaatkan fitur modern: async/await, modular pattern, structured cloning, dan Web Audio API untuk efek suara interaktif."
        ]),
        ("2. Keamanan & Kriptografi (SHA-256 Hashing & Web Authentication API / WebAuthn)", [
            "• Proteksi PIN Guru: PIN tidak pernah disimpan dalam bentuk teks polos (plaintext). Saat guru mengetik '2543', sistem langsung mengubahnya menjadi hash SHA-256 menggunakan Web Crypto API (crypto.subtle.digest).",
            "• Biometrik Hardware Smartphone: Mengimplementasikan standar industri W3C WebAuthn (FIDO2) yang memungkinkan guru menempelkan sidik jari pada sensor fisik ponsel Android/iPhone untuk membuka dasbor secara instan tanpa perlu mengetik PIN."
        ]),
        ("3. Antarmuka Pengguna & Aksesibilitas (CSS Variables & WCAG AAA Contrast)", [
            "• Mengadopsi prinsip Glassmorphism modern yang elegan dan responsif untuk layar smartphone 390px hingga monitor laboratorium sekolah 1920px.",
            "• Mematuhi standar aksesibilitas WCAG AAA: Tidak ada teks kuning di atas latar putih (seluruh teks modal peringatan menggunakan rasio kontras 8.5:1 warna bronze tua #78350F)."
        ]),
        ("4. Natural Language Processing (NLP Engine pada Chatbot Guru)", [
            "• Menggunakan Regular Expression Tokenization & Context-Aware Intent Matching.",
            "• Chatbot tidak sekadar melempar teks acak, melainkan secara dinamis meng-query array objek 216 siswa, menghitung siswa yang remedial (< 80), mendeteksi siswa yang belum mengerjakan kuis kedua, dan memetakan butir soal dengan persentase salah tertinggi."
        ]),
        ("5. Penyimpanan Data & Toleransi Gangguan (Local-First Offline-Ready)", [
            "• Menggunakan LocalStorage berarsitektur terstruktur dan IndexedDB caching.",
            "• Dilengkapi fitur toleransi jaringan: jika koneksi internet lab terputus saat ujian berlangsung, jawaban siswa tetap tersimpan aman di cache lokal dan otomatis tersinkronisasi kembali saat jaringan pulih."
        ])
    ]
    for title_t, points_t in tech_data:
        add_h2(title_t)
        for pt in points_t:
            add_formatted_p([(pt, False, False)], bullet=False)

    # ============================================================
    # 7. METODOLOGI PENJAMINAN MUTU (QA AUDIT EXPLANATION)
    # ============================================================
    add_h1("6. CARA MENJELASKAN TUGAS QA & METODOLOGI PENGUJIAN KE DOSEN")
    add_formatted_p([
        ("Bagian ini adalah ", False, False),
        ("inti utama penilaian praktikum QA", True, False),
        (". Dosen ingin melihat pemahaman konseptual yang kokoh mengenai metodologi QA, bukan hanya sekadar menguji aplikasi seperti pengguna awam.", False, False)
    ])

    add_h2("A. Konsep Dasar: Perbedaan QA vs QC pada Proyek QuizMaster")
    add_formatted_p([("• Quality Assurance (QA) - Pencegahan Cacat: ", True, False), ("Berfokus pada proses. Contoh konkret pada proyek ini: Kami melakukan 'Requirement Ambiguity Review' untuk menyelaraskan aturan panjang PIN (mengoreksi dokumen REQ-01 agar konsisten 4 digit), menetapkan kriteria kelulusan KKM yang terukur, dan merancang skenario uji sebelum sistem diimplementasikan (Shift-Left).", False, False)], bullet=True)
    add_formatted_p([("• Quality Control (QC) - Pendeteksian Cacat: ", True, False), ("Berfokus pada produk akhir. Contoh konkret pada proyek ini: Kami mengeksekusi 14 Test Case nyata di browser, mencatat hasil aktual, membandingkan dengan Test Oracle, dan memverifikasi apakah status KKM benar-benar berubah dari Remedial ke Tuntas.", False, False)], bullet=True)

    add_h2("B. Empat Teknik Pengujian Black-Box (Wajib Dikuasai Saat Sidang)")
    
    # Table for 4 Blackbox techniques
    tbl_bb = doc.add_table(rows=5, cols=4)
    tbl_bb.alignment = WD_TABLE_ALIGNMENT.CENTER
    bb_hdrs = ["Teknik Black-Box", "Tujuan Pengujian", "Data Uji Aktual yang Digunakan", "Expected vs Actual Result"]
    for c_i, h_txt in enumerate(bb_hdrs):
        cell = tbl_bb.rows[0].cells[c_i]
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, 60, 60, 80, 80)
        p = cell.paragraphs[0]
        r = p.add_run(h_txt)
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    bb_data = [
        (
            "1. Equivalence Partitioning (EP)\n(TC-01, TC-02, TC-03)",
            "Menguji domain input PIN Guru dengan membaginya ke dalam partisi ekuivalen yang valid dan invalid.",
            "• Valid (V1): '2543'\n• Invalid Nilai (I1): '9999'\n• Invalid Format (I2): '12'",
            "• '2543' -> Buka Dasbor Guru (PASS)\n• '9999' -> Error merah, sisa percobaan berkurang (PASS)\n• '12' -> Peringatan format harus 4 digit (PASS)"
        ),
        (
            "2. Boundary Value Analysis (BVA)\n(TC-04, TC-05, TC-06)",
            "Menguji titik batas ambang kelulusan KKM 80 pada nilai kritis N-1, N, dan N+1.",
            "• Titik Bawah (N-1): Skor 79\n• Titik Batas (N): Skor 80\n• Titik Atas (N+1): Skor 85",
            "• Skor 79 -> Status REMEDIAL (PASS)\n• Skor 80 -> Status TUNTAS KKM (PASS)\n• Skor 85 -> Status TUNTAS PRESTASI (PASS)"
        ),
        (
            "3. Decision Table Testing (DT)\n(TC-07, TC-08, TC-09)",
            "Menguji kombinasi aturan logika biner 2 kondisi (2² = 4 rules) pada kontrol akses kelas.",
            "• Rule 1: Always Open + Kunci Guru False\n• Rule 2: Always Open + Kunci Guru True\n• Rule 3: Mode Deadline Telah Lewat",
            "• Rule 1 -> Akses Ujian Diizinkan (PASS)\n• Rule 2 -> Akses Diblokir Manual Guru (PASS)\n• Rule 3 -> Akses Ditolak Kedaluwarsa (PASS)"
        ),
        (
            "4. State Transition Testing (ST)\n(TC-10, TC-11, TC-12)",
            "Menguji keabsahan transisi antar state dalam siklus hidup sesi ujian siswa.",
            "• State S1: Lobby Utama\n• State S2: Ujian Aktif\n• State S3: Layar Hasil",
            "• S1 -> S2: Sah (Mulai Ujian) (PASS)\n• S2 -> S3: Sah (Submit Jawaban) (PASS)\n• S1 -> S3: Terlarang (Ditolak Sistem Guardrail) (PASS)"
        )
    ]
    for r_i, r_data in enumerate(bb_data):
        row = tbl_bb.rows[r_i + 1]
        bg = "FFFFFF" if r_i % 2 == 0 else "F8FAFC"
        for c_i, txt in enumerate(r_data):
            cell = row.cells[c_i]
            set_cell_background(cell, bg)
            set_cell_margins(cell, 50, 50, 60, 60)
            set_cell_border(cell, top=dict(val="single", sz=2, color="E2E8F0"), bottom=dict(val="single", sz=2, color="E2E8F0"), left=dict(val="none"), right=dict(val="none"))
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(txt)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(9)
            if c_i == 0:
                r.bold = True
                r.font.color.rgb = RGBColor(30, 58, 138)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_h2("C. Bukti Siklus QA Sejati: Penemuan & Perbaikan 2 Cacat Kritis (Defects)")
    add_formatted_p([
        ("Salah satu bukti paling kuat bahwa tim melakukan audit nyata dan bukan laporan rekaan adalah adanya ", False, False),
        ("pencatatan Defect, Root Cause Analysis (RCA), dan Verifikasi Retest", True, False),
        (":", False, False)
    ])
    add_formatted_p([("1. DEFECT-01 (Chatbot Guru Terjebak Pesan Sapaan / Greeting Loop): ", True, False), ("Saat Bu Rini menanyakan pertanyaan analitis seperti 'Siapa saja yang belum mengerjakan modul jaringan di E1?', chatbot malah mengulang pesan perkenalan awal. Root Cause: Regex NLP awal terlalu sempit dan belum mengenali kombinasi kata tanya jamak. Solusi: Memperluas kamus tokenisasi NLP dan menambahkan query intent matching multi-kondisi. Status: FIXED & CLOSED.", False, False)], bullet=True)
    add_formatted_p([("2. DEFECT-02 (Pemotongan Gambar Skor TC-11 pada Layar Hasil): ", True, False), ("Pada saat pengujian otomatis tangkapan layar, lingkaran skor '90 SKOR' terpotong separuh di bagian atas karena scrollbar kontainer tertinggal di bawah. Root Cause: Transisi layar tidak mereset posisi scroll viewport. Solusi: Menambahkan protokol `window.scrollTo(0, 0)` dan mereset `scrollTop` kontainer sebelum capture. Status: FIXED & CLOSED.", False, False)], bullet=True)

    # ============================================================
    # 8. TANYA JAWAB KRITIS DOSEN (Q&A CHEAT SHEET)
    # ============================================================
    add_h1("7. LEMBAR CONTEK TANYA-JAWAB KRITIS (Q&A SIDANG DOSEN)")
    add_formatted_p([
        ("Berikut adalah daftar 8 pertanyaan yang paling sering ditanyakan dosen penguji praktikum QA beserta panduan cara menjawabnya secara percaya diri:", False, False)
    ])

    qa_list = [
        (
            "T: Mengapa kalian memilih PIN 4 digit padahal ada dokumen awal yang sempat menyebut 6 digit?",
            "J: Kami melakukan teknik Shift-Left 'Requirement Ambiguity Review'. Setelah kami telusuri kode sumber implementasi di dashboard.js dan pola UX keyboard ponsel guru di SMAN 4 Padang, sistem menggunakan PIN 4 digit dengan hash SHA-256 ('2543'). Ambiguitas 6 digit tersebut merupakan kesalahan dokumentasi masa lalu yang telah kami rekonsiliasi dan selaraskan ke seluruh Requirement, Acceptance Criteria, Test Case, dan RTM agar konsisten dan valid."
        ),
        (
            "T: Bagaimana kalian menentukan Test Oracle untuk menyatakan suatu Test Case itu Lolos (PASS)?",
            "J: Test Oracle kami didasarkan pada 3 sumber kebenaran objektif: (1) Acceptance Criteria berformat Given-When-Then, (2) Aturan akademik resmi SMAN 4 Padang (misalnya KKM bernilai tepat 80, di bawah 80 wajib remedial), dan (3) Standar kriptografi SHA-256 serta W3C WebAuthn untuk otentikasi biometrik."
        ),
        (
            "T: Kenapa Decision Table kalian hanya menguji Rule 1, 2, dan 3 secara manual, sementara Rule 4 tidak?",
            "J: Sesuai prinsip Testing Prioritization berbasis risiko, SMAN 4 Padang telah menetapkan kebijakan resmi bahwa seluruh rombel menggunakan mode Always Open agar siswa tidak panik terkunci saat jam ujian. Rule 4 (mode terjadwal tanpa kunci) memiliki risiko residual Rendah dan telah dicakup pengujian otomatis di verify_access_control.js. Ini mencerminkan efisiensi pengujian tanpa mengorbankan kualitas."
        ),
        (
            "T: Apa bukti bahwa traceability kalian berjalan dengan baik?",
            "J: Kami menyusun Requirements Traceability Matrix (RTM) yang memetakan hubungan dua arah: Setiap Requirement (REQ-01 s.d REQ-05) terhubung ke Acceptance Criteria, diturunkan menjadi Risk ID, dipetakan ke Test Scenario, dieksekusi melalui Test Case (TC-01 s.d TC-14), dan diverifikasi dengan artefak screenshot konkret di folder evidence/."
        ),
        (
            "T: Apa perbedaan verifikasi dan validasi dalam pengujian aplikasi QuizMaster ini?",
            "J: Verifikasi menjawab pertanyaan 'Are we building the product right?' — yaitu memastikan kode aplikasi sesuai dengan spesifikasi teknis (seperti formula skor benar, hashing berjalan). Sedangkan Validasi menjawab 'Are we building the right product?' — yaitu memastikan aplikasi benar-benar memenuhi kebutuhan Bu Rini dan 216 siswa di lapangan untuk evaluasi pembelajaran yang adil dan transparan."
        ),
        (
            "T: Mengapa Boundary Value Analysis memilih nilai 79, 80, dan 85?",
            "J: Karena KKM adalah 80 (N). Titik N-1 (79) adalah batas maksimal kegagalan yang wajib memicu remedial. Titik N (80) adalah batas minimum kelulusan tepat. Dan titik di atasnya (85) adalah representasi kategori kompeten dengan apresiasi. Menguji titik batas kritis ini membuktikan operator logika '>= 80' berjalan presisi tanpa cacat off-by-one."
        ),
        (
            "T: Apa fungsi integrasi biometrik sidik jari pada aplikasi ini?",
            "J: Ini adalah fitur proteksi otentikasi ganda untuk Bu Rini. Karena ponsel sering digunakan di ruang kelas terbuka, autentikasi biometrik WebAuthn memanfaatkan sensor fisik bawaan HP guru sehingga guru dapat membuka dasbor secara cepat tanpa khawatir PIN 4 digit diintip oleh siswa di sekitarnya."
        ),
        (
            "T: Apa rekomendasi QA terhadap aplikasi ini sebelum rilis ke produksi penuh?",
            "J: Berdasarkan exit criteria, kualitas aplikasi telah memenuhi seluruh standar kelulusan (0 defect blocker/critical, coverage 100%). Rekomendasi rilis kami adalah: (1) Lakukan backup berkala basis data lokal ke cloud storage sekolah, (2) Tetap gunakan mode Always Open selama jam ujian sekolah untuk meminimalisir kesalahan jam server HP siswa, dan (3) Berikan sosialisasi singkat bagi siswa mengenai sistem anti-curang tab-switch."
        )
    ]

    for q, a in qa_list:
        tbl_qa = doc.add_table(rows=1, cols=1)
        tbl_qa.alignment = WD_TABLE_ALIGNMENT.CENTER
        c = tbl_qa.cell(0, 0)
        set_cell_background(c, "F8FAFC")
        set_cell_margins(c, 70, 70, 120, 120)
        set_cell_border(c, left=dict(val="single", sz=18, color="1E3A8A"), top=dict(val="none"), right=dict(val="none"), bottom=dict(val="none"))
        
        p_q = c.paragraphs[0]
        p_q.paragraph_format.space_after = Pt(3)
        p_q.paragraph_format.line_spacing = 1.15
        r_q = p_q.add_run(q)
        r_q.bold = True
        r_q.font.name = 'Times New Roman'
        r_q.font.size = Pt(10.5)
        r_q.font.color.rgb = RGBColor(30, 58, 138)
        
        p_a = c.add_paragraph()
        p_a.paragraph_format.space_after = Pt(2)
        p_a.paragraph_format.line_spacing = 1.15
        r_a = p_a.add_run(a)
        r_a.font.name = 'Times New Roman'
        r_a.font.size = Pt(10)
        r_a.font.color.rgb = RGBColor(15, 23, 42)
        
        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(0)
        p_sp.paragraph_format.space_after = Pt(3)

    # ============================================================
    # 9. CHECKLIST PERSIAPAN PRESENTASI BESOK
    # ============================================================
    add_h1("8. CHECKLIST PERSIAPAN PRESENTASI & DEMO BESOK PAGI")
    checklist_items = [
        "1. Berkas Utama Siap: File PDF laporan resmi (LAPORAN_QA_AUDIT_OPTIMIZED.pdf) telah dicetak atau tersimpan di laptop.",
        "2. PIN Guru Diingat di Luar Kepala: PIN Guru adalah '2543' (4 Digit). Jangan sampai salah menyebut 6 digit di hadapan dosen!",
        "3. Demo Aplikasi Siap: Server web lokal berjalan (http://localhost:5500/index.html), buka halaman di Chrome sebelum presentasi dimulai.",
        "4. Kunci Bukti Pengujian di Tangan: Gambar 6.1 (Dasbor Guru), Gambar 6.2 (PIN Salah Merah), Gambar 6.3 (Format Warning), Gambar 6.4 (Remedial 79), Gambar 6.5 (Tuntas 80), dan Gambar 6.11 (Skor 90 Utuh).",
        "5. Sikap Presentasi: Tenang, gunakan istilah baku QA (Acceptance Criteria, Shift-Left, Boundary Value, Traceability, RCA), dan selalu tunjukkan bukti evidence ketika menjelaskan temuan."
    ]
    for item in checklist_items:
        add_formatted_p([(item, False, False)], bullet=False)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    add_callout(
        "🏆 SEMANGAT PRESENTASI & SUKSES BESOK!",
        [
            "Laporan dan pengujian aplikasi QuizMaster telah memenuhi standar tertinggi akademik QA dengan bukti evidence 100% otentik, bebas ambiguitas, dan didukung analisis teknis yang kokoh.",
            "Semoga presentasi tim Muhammad Hafidh Putra Roshadi, Pipit Khofifah, Harie Fadhil, dan Andre Geovani mendapatkan nilai A (Maksimal)!"
        ],
        box_type="success"
    )

    output_filename = "PANDUAN_PRESENTASI_QA_QUIZMASTER.docx"
    doc.save(output_filename)
    print(f"Generated {output_filename} successfully ({os.path.getsize(output_filename):,} bytes).")
    return output_filename

if __name__ == "__main__":
    create_guide_document()

