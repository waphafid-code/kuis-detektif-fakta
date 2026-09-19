import os
import sys
import json
import shutil

# Set stdout encoding for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=140, bottom=140, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_cell_border(cell, **kwargs):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = parse_xml(f'<w:tcBorders {nsdecls("w")}/>')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        edge_data = kwargs.get(edge)
        if edge_data:
            val = edge_data.get('val', 'single')
            sz = edge_data.get('sz', 4)
            color = edge_data.get('color', 'auto')
            element = parse_xml(f'<w:{edge} {nsdecls("w")} w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>')
            tcBorders.append(element)
        else:
            element = parse_xml(f'<w:{edge} {nsdecls("w")} w:val="none"/>')
            tcBorders.append(element)
    tcPr.append(tcBorders)

def create_document():
    doc = Document()

    # Set Margins (Normal / 0.8 inch all sides)
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        section.header.is_linked_to_previous = False
        section.footer.is_linked_to_previous = False
        
        # Header
        header_p = section.header.paragraphs[0]
        header_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        h_run = header_p.add_run("Kuis Interaktif: Detektif Fakta Digital — Modul Uji Validitas Data")
        h_run.font.name = "Calibri"
        h_run.font.size = Pt(8.5)
        h_run.font.italic = True
        h_run.font.color.rgb = RGBColor(140, 140, 160)

        # Footer
        footer_p = section.footer.paragraphs[0]
        footer_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        f_run = footer_p.add_run("Dokumen Rekapitulasi Soal & Kunci Jawaban | Kurikulum Merdeka Kelas X")
        f_run.font.name = "Calibri"
        f_run.font.size = Pt(8.5)
        f_run.font.color.rgb = RGBColor(140, 140, 160)

    # Theme Palette Colors
    PRIMARY_COLOR = RGBColor(79, 70, 229)    # #4F46E5 Indigo
    PRIMARY_DARK = RGBColor(55, 48, 163)     # #3730A3 Deep Indigo
    DARK_TITLE = RGBColor(15, 23, 42)        # #0F172A Slate 900
    TEXT_MAIN = RGBColor(30, 41, 59)         # #1E293B Slate 800
    TEXT_MUTED = RGBColor(100, 116, 139)     # #64748B Slate 500
    SUCCESS_COLOR = RGBColor(16, 185, 129)   # #10B981 Emerald
    SUCCESS_DARK = RGBColor(4, 120, 87)      # #047857 Emerald Dark
    ACCENT_COLOR = RGBColor(8, 145, 178)     # #0891B2 Cyan 600
    DIFF_EASY = RGBColor(16, 185, 129)       # Green
    DIFF_MED = RGBColor(217, 119, 6)         # Amber
    DIFF_HARD = RGBColor(225, 29, 72)        # Rose

    # ═══════════════════════════════════════════════════════════════
    # HEADER UTAMA
    # ═══════════════════════════════════════════════════════════════
    title_p = doc.add_paragraph()
    title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    
    r_badge = title_p.add_run("BANK SOAL & REKAPITULASI KUNCI JAWABAN RESMI\n")
    r_badge.font.name = "Calibri"
    r_badge.font.size = Pt(11)
    r_badge.font.bold = True
    r_badge.font.color.rgb = PRIMARY_COLOR

    r_title = title_p.add_run("MISI DETEKTIF FAKTA DIGITAL\nUJI VALIDITAS DATA & LITERASI DIGITAL")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(18)
    r_title.font.bold = True
    r_title.font.color.rgb = DARK_TITLE

    sub_p = doc.add_paragraph()
    sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    sub_p.paragraph_format.space_before = Pt(2)
    sub_p.paragraph_format.space_after = Pt(14)
    r_sub = sub_p.add_run("Naskah Lengkap Butir Soal, Distribusi Tingkat Kesulitan, Kunci Jawaban & Pembahasan Konseptual")
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(10.5)
    r_sub.font.italic = True
    r_sub.font.color.rgb = TEXT_MUTED

    # ═══════════════════════════════════════════════════════════════
    # TABEL IDENTITAS & METADATA
    # ═══════════════════════════════════════════════════════════════
    meta_table = doc.add_table(rows=5, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    col_widths = [Inches(2.5), Inches(4.5)]
    for row in meta_table.rows:
        for i, cell in enumerate(row.cells):
            cell.width = col_widths[i]

    metadata_items = [
        ("Mata Pelajaran / Elemen", "Informatika / Berpikir Komputasional & Literasi Digital"),
        ("Sasaran Siswa / Fase", "Kelas X (Fase E: Kelas X E 1 s/d X E 6)"),
        ("Jumlah Butir Soal", "20 Butir Soal Terstandarisasi"),
        ("Komposisi Bentuk Soal", "14 Pilihan Ganda (MCQ), 3 Benar/Salah (T/F), 3 Pilihan Ganda Kompleks (Multi-Select)"),
        ("Alokasi Waktu & KKM", "30 Detik per Butir Soal (Total 10 Menit) | Kriteria Ketuntasan Minimal (KKM): 75")
    ]

    for row_idx, (label, val) in enumerate(metadata_items):
        cell_lbl = meta_table.rows[row_idx].cells[0]
        cell_val = meta_table.rows[row_idx].cells[1]
        
        set_cell_background(cell_lbl, "F1F5F9")
        set_cell_background(cell_val, "FFFFFF")
        set_cell_margins(cell_lbl, top=70, bottom=70, left=100, right=100)
        set_cell_margins(cell_val, top=70, bottom=70, left=100, right=100)
        
        for edge in ('top', 'bottom', 'left', 'right'):
            set_cell_border(cell_lbl, **{edge: {'val': 'single', 'sz': 4, 'color': 'CBD5E1'}})
            set_cell_border(cell_val, **{edge: {'val': 'single', 'sz': 4, 'color': 'CBD5E1'}})

        p_lbl = cell_lbl.paragraphs[0]
        p_lbl.paragraph_format.space_before = Pt(0)
        p_lbl.paragraph_format.space_after = Pt(0)
        r_lbl = p_lbl.add_run(label)
        r_lbl.font.name = "Calibri"
        r_lbl.font.size = Pt(9.5)
        r_lbl.font.bold = True
        r_lbl.font.color.rgb = DARK_TITLE

        p_val = cell_val.paragraphs[0]
        p_val.paragraph_format.space_before = Pt(0)
        p_val.paragraph_format.space_after = Pt(0)
        r_val = p_val.add_run(val)
        r_val.font.name = "Calibri"
        r_val.font.size = Pt(9.5)
        r_val.font.color.rgb = TEXT_MAIN

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # ═══════════════════════════════════════════════════════════════
    # DATA LENGKAP 20 BUTIR SOAL
    # ═══════════════════════════════════════════════════════════════
    questions_raw = [
        {
            "no": 1,
            "type": "Pilihan Ganda",
            "diff": "Mudah",
            "topic": "Pengertian ekosistem periksa fakta",
            "key": "B",
            "key_full": "B. Jaringan pihak yang bekerja sama memverifikasi informasi",
            "q": "Apa yang dimaksud dengan ekosistem periksa fakta?",
            "case": None,
            "options": [
                "Kumpulan berita yang sedang ramai",
                "Jaringan pihak yang bekerja sama memverifikasi informasi",
                "Aplikasi untuk membuat berita",
                "Kelompok yang membagikan pesan",
                "Situs untuk menyimpan artikel"
            ],
            "exp": "Ekosistem periksa fakta bukan hanya satu aplikasi atau satu organisasi. Ekosistem ini terdiri dari berbagai pihak yang saling bekerja sama, seperti organisasi periksa fakta, platform media sosial, komunitas, dan individu. Tujuannya adalah memeriksa kebenaran informasi yang beredar."
        },
        {
            "no": 2,
            "type": "Pilihan Ganda",
            "diff": "Mudah",
            "topic": "Tujuan utama ekosistem periksa fakta",
            "key": "D",
            "key_full": "D. Membantu masyarakat memperoleh informasi terpercaya",
            "q": "Tujuan utama ekosistem periksa fakta adalah ...",
            "case": None,
            "options": [
                "Meningkatkan jumlah berita viral",
                "Menghapus semua informasi lama",
                "Membatasi penggunaan media sosial",
                "Membantu masyarakat memperoleh informasi terpercaya",
                "Menggantikan seluruh tugas media"
            ],
            "exp": "Periksa fakta membantu masyarakat mengetahui informasi yang akurat dan dapat dipercaya. Dengan kemampuan tersebut, seseorang tidak mudah mempercayai atau menyebarkan berita yang belum jelas kebenarannya."
        },
        {
            "no": 3,
            "type": "Pilihan Ganda",
            "diff": "Mudah",
            "topic": "Tugas utama organisasi periksa fakta",
            "key": "A",
            "key_full": "A. Menyelidiki dan memverifikasi klaim",
            "q": "Tugas utama organisasi periksa fakta adalah ...",
            "case": None,
            "options": [
                "Menyelidiki dan memverifikasi klaim",
                "Membuat berita menjadi populer",
                "Menghapus semua akun pengguna",
                "Menyebarkan informasi terbaru",
                "Mengubah isi berita yang salah"
            ],
            "exp": "Organisasi periksa fakta bekerja dengan menyelidiki klaim atau informasi yang beredar. Mereka memeriksa sumber, membandingkan informasi, dan mencari bukti sebelum menyampaikan kesimpulan."
        },
        {
            "no": 4,
            "type": "Pilihan Ganda",
            "diff": "Sedang",
            "topic": "Urgensi transparansi metodologi pemeriksaan",
            "key": "C",
            "key_full": "C. Agar masyarakat memahami proses verifikasi",
            "q": "Mengapa organisasi periksa fakta perlu menjelaskan metodologi pemeriksaannya?",
            "case": None,
            "options": [
                "Agar mendapatkan banyak pengikut",
                "Agar berita lebih cepat menyebar",
                "Agar masyarakat memahami proses verifikasi",
                "Agar semua informasi terlihat menarik",
                "Agar pengguna tidak bertanya lagi"
            ],
            "exp": "Metodologi menjelaskan bagaimana sebuah informasi diperiksa. Jika prosesnya dijelaskan secara terbuka, masyarakat dapat memahami alasan suatu informasi dinilai benar, palsu, atau menyesatkan."
        },
        {
            "no": 5,
            "type": "Pilihan Ganda",
            "diff": "Sedang",
            "topic": "Peran platform media sosial dalam periksa fakta",
            "key": "E",
            "key_full": "E. Menandai konten tidak akurat",
            "q": "Salah satu peran platform media sosial dalam periksa fakta adalah ...",
            "case": None,
            "options": [
                "Membuat semua unggahan menjadi benar",
                "Menyebarkan semua informasi pengguna",
                "Menghapus semua akun yang dilaporkan",
                "Mengubah berita agar lebih menarik",
                "Menandai konten tidak akurat"
            ],
            "exp": "Platform media sosial dapat membantu mengurangi penyebaran hoaks dengan memberikan tanda pada konten yang tidak akurat. Platform juga dapat mengarahkan pengguna kepada informasi yang telah diverifikasi."
        },
        {
            "no": 6,
            "type": "Pilihan Ganda",
            "diff": "Sedang",
            "topic": "Teknik membaca lateral (Lateral Reading)",
            "key": "A",
            "key_full": "A. Membaca lateral",
            "case": "Rani menerima unggahan yang berisi klaim mengejutkan. Ia membuka beberapa sumber lain untuk mengetahui siapa pembuat informasi, kapan diterbitkan, dan apakah ada sumber yang mendukung klaim tersebut.",
            "q": "Tindakan Rani menunjukkan ...",
            "options": [
                "Membaca lateral",
                "Membaca judul",
                "Menyebarkan berita",
                "Mengubah informasi",
                "Menghapus sumber"
            ],
            "exp": "Membaca lateral dilakukan dengan membandingkan informasi dari beberapa sumber. Cara ini membantu seseorang menilai keandalan sumber dan memahami apakah klaim yang dibaca memiliki bukti pendukung."
        },
        {
            "no": 7,
            "type": "Pilihan Ganda Kompleks",
            "diff": "Sedang",
            "topic": "Manfaat kolaborasi dalam ekosistem fakta",
            "key": "A, D, E",
            "key_full": "A, D, dan E (A: Membagikan informasi pemeriksaan; D: Meningkatkan efisiensi pemeriksaan; E: Membantu menangani informasi yang kompleks)",
            "q": "Pilih tiga pernyataan yang benar tentang manfaat jaringan kolaboratif:",
            "case": None,
            "options": [
                "Membagikan informasi pemeriksaan",
                "Menyembunyikan metode kerja",
                "Berbagi hasil penelitian",
                "Meningkatkan efisiensi pemeriksaan",
                "Membantu menangani informasi yang kompleks"
            ],
            "exp": "Kerja sama memungkinkan berbagai pihak membagikan informasi dan membantu proses pemeriksaan. Hal ini membuat pemeriksaan menjadi lebih efisien dan memudahkan penanganan informasi yang rumit atau cepat menyebar."
        },
        {
            "no": 8,
            "type": "Pilihan Ganda",
            "diff": "Mudah",
            "topic": "Fungsi literasi media bagi individu",
            "key": "C",
            "key_full": "C. Menilai informasi secara kritis",
            "q": "Literasi media membantu seseorang untuk ...",
            "case": None,
            "options": [
                "Mempercayai informasi populer",
                "Membagikan berita dengan cepat",
                "Menilai informasi secara kritis",
                "Menghapus semua media sosial",
                "Mengikuti pendapat terbanyak"
            ],
            "exp": "Literasi media mengajarkan seseorang untuk berpikir kritis ketika menerima informasi. Seseorang perlu melihat sumber, isi, waktu publikasi, dan tanda-tanda informasi palsu sebelum mengambil keputusan."
        },
        {
            "no": 9,
            "type": "Benar / Salah",
            "diff": "Sedang",
            "topic": "Kekeliruan membaca hanya judul (Clickbait)",
            "key": "B (Salah)",
            "key_full": "B. Salah",
            "q": "Membaca satu judul berita saja sudah cukup untuk membuktikan bahwa informasi tersebut benar.",
            "case": None,
            "options": [
                "Benar",
                "Salah"
            ],
            "exp": "Judul berita belum tentu menggambarkan isi informasi secara lengkap. Untuk mengetahui kebenarannya, pembaca perlu melihat sumber, membaca isi informasi, dan membandingkannya dengan sumber lain."
        },
        {
            "no": 10,
            "type": "Pilihan Ganda",
            "diff": "Sedang",
            "topic": "Respon komunitas terhadap informasi meragukan",
            "key": "D",
            "key_full": "D. Memeriksa informasi lalu membagikan hasil yang terverifikasi",
            "case": "Sebuah komunitas menerima informasi yang belum jelas kebenarannya.",
            "q": "Tindakan yang paling tepat adalah ...",
            "options": [
                "Meneruskannya kepada semua anggota",
                "Menghapus semua akun pengirim",
                "Mengubah isi informasi",
                "Memeriksa informasi lalu membagikan hasil yang terverifikasi",
                "Membiarkan informasi tanpa pemeriksaan"
            ],
            "exp": "Komunitas memiliki peran dalam membantu menyaring informasi yang beredar. Informasi sebaiknya diperiksa terlebih dahulu. Setelah kebenarannya lebih jelas, hasil pemeriksaan dapat dibagikan dan anggota lain dapat diperingatkan jika terdapat hoaks."
        },
        {
            "no": 11,
            "type": "Pilihan Ganda",
            "diff": "Mudah",
            "topic": "Persyaratan bukti laporan konten hoaks",
            "key": "A",
            "key_full": "A. Tangkapan layar dan URL konten",
            "q": "Bukti yang perlu disiapkan saat melaporkan konten hoaks melalui Kominfo adalah ...",
            "case": None,
            "options": [
                "Tangkapan layar dan URL konten",
                "Foto pribadi pelapor",
                "Jumlah pengikut akun",
                "Pendapat dari teman",
                "Komentar pengguna lain"
            ],
            "exp": "Tangkapan layar menunjukkan isi konten yang dilaporkan. URL membantu pihak yang menerima laporan menemukan lokasi konten tersebut sehingga pemeriksaan dapat dilakukan dengan lebih tepat."
        },
        {
            "no": 12,
            "type": "Benar / Salah",
            "diff": "Sedang",
            "topic": "Jaminan perlindungan & kerahasiaan pelapor",
            "key": "A (Benar)",
            "key_full": "A. Benar",
            "q": "Kerahasiaan pelapor melalui Kominfo dijamin.",
            "case": None,
            "options": [
                "Benar",
                "Salah"
            ],
            "exp": "Jaminan kerahasiaan membuat masyarakat lebih berani melaporkan informasi yang diduga hoaks. Pelapor tidak harus menyebarkan identitasnya kepada publik, tetapi tetap perlu menyampaikan laporan secara jujur dan berdasarkan bukti."
        },
        {
            "no": 13,
            "type": "Pilihan Ganda",
            "diff": "Mudah",
            "topic": "Kanal resmi aduan konten Kominfo",
            "key": "C",
            "key_full": "C. aduankonten@mail.kominfo.go.id",
            "q": "Alamat email untuk mengirim aduan konten melalui Kominfo adalah ...",
            "case": None,
            "options": [
                "cybercrime@polri.go.id",
                "polisionline.net@gmail.com",
                "aduankonten@mail.kominfo.go.id",
                "info@mediaonline.id",
                "laporberita@gmail.com"
            ],
            "exp": "Alamat aduankonten@mail.kominfo.go.id digunakan untuk menyampaikan aduan konten kepada Kominfo. Laporan akan lebih mudah diperiksa jika disertai tangkapan layar dan tautan konten yang jelas."
        },
        {
            "no": 14,
            "type": "Pilihan Ganda",
            "diff": "Mudah",
            "topic": "Kanal lapor hoaks Mafindo (TurnBackHoax)",
            "key": "E",
            "key_full": "E. turnbackhoax.id/lapor-hoax/",
            "q": "Situs Mafindo yang digunakan untuk melaporkan hoaks adalah ...",
            "case": None,
            "options": [
                "trustpositif.kominfo.go.id",
                "aduankonten@mail.kominfo.go.id",
                "cybercrime@polri.go.id",
                "polisionline.net@gmail.com",
                "turnbackhoax.id/lapor-hoax/"
            ],
            "exp": "TurnBackHoax (turnbackhoax.id/lapor-hoax/) merupakan salah satu layanan Mafindo untuk menerima laporan hoaks. Pengguna dapat memasukkan informasi yang dicurigai palsu melalui halaman pelaporan tersebut."
        },
        {
            "no": 15,
            "type": "Pilihan Ganda Kompleks",
            "diff": "Sulit",
            "topic": "Sikap bijak menemukan konten meragukan",
            "key": "A, C, E",
            "key_full": "A, C, dan E (A: Memeriksa sumber informasi; C: Membandingkan dengan sumber lain; E: Melaporkan kepada pihak yang sesuai)",
            "q": "Pilih tiga tindakan yang sesuai ketika seseorang menemukan konten yang meragukan:",
            "case": None,
            "options": [
                "Memeriksa sumber informasi",
                "Langsung meneruskan pesan",
                "Membandingkan dengan sumber lain",
                "Mengubah isi konten",
                "Melaporkan kepada pihak yang sesuai"
            ],
            "exp": "Informasi yang meragukan perlu diperiksa dari sumbernya dan dibandingkan dengan informasi lain. Jika setelah pemeriksaan masih terdapat masalah atau indikasi hoaks, konten tersebut dapat dilaporkan kepada platform atau organisasi periksa fakta."
        },
        {
            "no": 16,
            "type": "Pilihan Ganda",
            "diff": "Sulit",
            "topic": "Moderasi konten bermasalah oleh platform",
            "key": "D",
            "key_full": "D. Memberi tanda atau mengarahkan pengguna ke informasi terverifikasi",
            "case": "Sebuah platform media sosial menemukan konten yang telah diperiksa oleh organisasi periksa fakta dan dinilai tidak akurat.",
            "q": "Tindakan yang paling sesuai adalah ...",
            "options": [
                "Membiarkan konten tanpa tanda",
                "Menyebarkan konten ke lebih banyak pengguna",
                "Menghapus semua unggahan pengguna",
                "Memberi tanda atau mengarahkan pengguna ke informasi terverifikasi",
                "Mengubah nama pembuat konten"
            ],
            "exp": "Platform dapat membantu pengguna memahami bahwa suatu konten bermasalah dengan memberikan tanda atau peringatan. Platform juga dapat mengarahkan pengguna kepada informasi yang sudah diverifikasi sehingga penyebaran informasi yang tidak akurat dapat dikurangi."
        },
        {
            "no": 17,
            "type": "Benar / Salah",
            "diff": "Sulit",
            "topic": "Konsep transparansi metodologi verifikasi",
            "key": "B (Salah)",
            "key_full": "B. Salah",
            "q": "Transparansi dalam periksa fakta berarti organisasi hanya perlu menyampaikan hasil akhir tanpa menjelaskan proses pemeriksaannya.",
            "case": None,
            "options": [
                "Benar",
                "Salah"
            ],
            "exp": "Transparansi justru mengharuskan organisasi menjelaskan proses dan metode yang digunakan. Masyarakat perlu mengetahui bagaimana bukti diperiksa dan mengapa suatu kesimpulan dibuat. Jika hanya hasil akhir yang ditampilkan, pembaca akan kesulitan memahami dasar penilaiannya."
        },
        {
            "no": 18,
            "type": "Pilihan Ganda Kompleks",
            "diff": "Sulit",
            "topic": "Implementasi etika & tanggung jawab digital",
            "key": "A, B, E",
            "key_full": "A, B, dan E (A: Membaca informasi secara kritis; B: Memeriksa siapa pembuat informasi; E: Membandingkan informasi dengan sumber lain)",
            "q": "Pilih tiga kegiatan yang menunjukkan literasi media dan tanggung jawab digital:",
            "case": None,
            "options": [
                "Membaca informasi secara kritis",
                "Memeriksa siapa pembuat informasi",
                "Menyebarkan berita karena banyak yang membagikannya",
                "Mengenali tanda-tanda informasi palsu",
                "Membandingkan informasi dengan sumber lain"
            ],
            "exp": "Literasi media tidak hanya berarti mampu membaca, tetapi juga mampu menilai kualitas informasi. Memeriksa pembuat informasi dan membandingkan sumber membantu seseorang mengambil keputusan berdasarkan bukti, bukan hanya karena informasi tersebut populer."
        },
        {
            "no": 19,
            "type": "Pilihan Ganda",
            "diff": "Sulit",
            "topic": "Dukungan institusional terhadap periksa fakta",
            "key": "C",
            "key_full": "C. Menyediakan dana, sumber daya, dan dukungan hukum",
            "case": "Sebuah sekolah ingin memperkuat kegiatan periksa fakta di lingkungan siswa.",
            "q": "Bentuk dukungan yang paling tepat adalah ...",
            "options": [
                "Membatasi semua akses berita",
                "Membiarkan siswa memeriksa informasi sendiri",
                "Menyediakan dana, sumber daya, dan dukungan hukum",
                "Menghapus semua akun media sosial siswa",
                "Mengajarkan siswa untuk mengikuti informasi populer"
            ],
            "exp": "Kegiatan periksa fakta membutuhkan dukungan agar dapat dilakukan secara berkelanjutan. Dana, sumber daya, dan dukungan hukum dapat membantu organisasi atau lembaga menjalankan pemeriksaan informasi dengan lebih baik."
        },
        {
            "no": 20,
            "type": "Pilihan Ganda",
            "diff": "Sulit",
            "topic": "Prosedur runtut verifikasi informasi bertahap",
            "key": "D",
            "key_full": "D. Menyimpan bukti, memeriksa sumber, membandingkan informasi, lalu melaporkan jika diperlukan",
            "case": "Fajar menerima pesan berantai yang belum jelas kebenarannya. Ia ingin melakukan pemeriksaan secara bertanggung jawab.",
            "q": "Urutan tindakan yang paling tepat adalah ...",
            "options": [
                "Membagikan pesan, lalu menunggu komentar",
                "Menghapus pesan, kemudian melupakan isinya",
                "Membaca judul, lalu langsung menentukan kesimpulan",
                "Menyimpan bukti, memeriksa sumber, membandingkan informasi, lalu melaporkan jika diperlukan",
                "Mengubah isi pesan agar lebih mudah dipercaya"
            ],
            "exp": "Pemeriksaan informasi harus dilakukan secara bertahap. Fajar perlu menyimpan bukti terlebih dahulu, memeriksa sumber dan waktu publikasi, membandingkan informasi dengan sumber lain, kemudian menentukan tindakan yang sesuai. Jika konten terbukti bermasalah, ia dapat melaporkannya kepada platform atau organisasi periksa fakta."
        }
    ]

    # ═══════════════════════════════════════════════════════════════
    # BAGIAN 1: TABEL KISI-KISI & KUNCI JAWABAN CEPAT
    # ═══════════════════════════════════════════════════════════════
    h1 = doc.add_paragraph()
    h1.paragraph_format.space_before = Pt(14)
    h1.paragraph_format.space_after = Pt(6)
    r_h1 = h1.add_run("BAGIAN 1: TABEL KISI-KISI, DISTRIBUSI MATERI & KUNCI JAWABAN CEPAT")
    r_h1.font.name = "Calibri"
    r_h1.font.size = Pt(12)
    r_h1.font.bold = True
    r_h1.font.color.rgb = PRIMARY_COLOR

    sum_table = doc.add_table(rows=1, cols=5)
    sum_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sum_table.autofit = False

    hdr_widths = [Inches(0.5), Inches(1.4), Inches(0.9), Inches(3.2), Inches(1.0)]
    hdr_cells = sum_table.rows[0].cells
    hdr_titles = ["No.", "Bentuk Soal", "Tingkat", "Indikator / Pokok Materi", "Kunci"]
    
    for i, cell in enumerate(hdr_cells):
        cell.width = hdr_widths[i]
        set_cell_background(cell, "4F46E5")
        set_cell_margins(cell, top=90, bottom=90, left=80, right=80)
        set_cell_border(cell, 
                        top={'val': 'single', 'sz': 6, 'color': '3730A3'},
                        bottom={'val': 'single', 'sz': 6, 'color': '3730A3'},
                        left={'val': 'single', 'sz': 4, 'color': '6366F1'},
                        right={'val': 'single', 'sz': 4, 'color': '6366F1'})
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if i in [0, 2, 4] else WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(hdr_titles[i])
        r.font.name = "Calibri"
        r.font.size = Pt(9)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    for q in questions_raw:
        row_cells = sum_table.add_row().cells
        for i, cell in enumerate(row_cells):
            cell.width = hdr_widths[i]
            bg_color = "F8FAFC" if q["no"] % 2 == 1 else "FFFFFF"
            set_cell_background(cell, bg_color)
            set_cell_margins(cell, top=60, bottom=60, left=70, right=70)
            set_cell_border(cell, 
                            top={'val': 'single', 'sz': 4, 'color': 'E2E8F0'},
                            bottom={'val': 'single', 'sz': 4, 'color': 'E2E8F0'},
                            left={'val': 'single', 'sz': 4, 'color': 'E2E8F0'},
                            right={'val': 'single', 'sz': 4, 'color': 'E2E8F0'})
        
        # Col 0: No
        p0 = row_cells[0].paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p0.paragraph_format.space_before = Pt(0)
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(str(q["no"]))
        r0.font.name = "Calibri"
        r0.font.size = Pt(9)
        r0.font.bold = True
        r0.font.color.rgb = DARK_TITLE

        # Col 1: Type
        p1 = row_cells[1].paragraphs[0]
        p1.paragraph_format.space_before = Pt(0)
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(q["type"])
        r1.font.name = "Calibri"
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = TEXT_MAIN

        # Col 2: Diff
        p2 = row_cells[2].paragraphs[0]
        p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p2.paragraph_format.space_before = Pt(0)
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(q["diff"])
        r2.font.name = "Calibri"
        r2.font.size = Pt(8.5)
        r2.font.bold = True
        if q["diff"] == "Mudah":
            r2.font.color.rgb = DIFF_EASY
        elif q["diff"] == "Sedang":
            r2.font.color.rgb = DIFF_MED
        else:
            r2.font.color.rgb = DIFF_HARD

        # Col 3: Topic
        p3 = row_cells[3].paragraphs[0]
        p3.paragraph_format.space_before = Pt(0)
        p3.paragraph_format.space_after = Pt(0)
        r3 = p3.add_run(q["topic"])
        r3.font.name = "Calibri"
        r3.font.size = Pt(8.5)
        r3.font.color.rgb = TEXT_MAIN

        # Col 4: Key
        p4 = row_cells[4].paragraphs[0]
        p4.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p4.paragraph_format.space_before = Pt(0)
        p4.paragraph_format.space_after = Pt(0)
        r4 = p4.add_run(q["key"])
        r4.font.name = "Calibri"
        r4.font.size = Pt(9)
        r4.font.bold = True
        r4.font.color.rgb = SUCCESS_DARK

    doc.add_page_break()

    # ═══════════════════════════════════════════════════════════════
    # BAGIAN 2: NASKAH LENGKAP SOAL, PILIHAN & PEMBAHASAN
    # ═══════════════════════════════════════════════════════════════
    h2 = doc.add_paragraph()
    h2.paragraph_format.space_before = Pt(0)
    h2.paragraph_format.space_after = Pt(10)
    r_h2 = h2.add_run("BAGIAN 2: NASKAH SOAL, KUNCI JAWABAN & PEMBAHASAN DETAIL")
    r_h2.font.name = "Calibri"
    r_h2.font.size = Pt(13)
    r_h2.font.bold = True
    r_h2.font.color.rgb = PRIMARY_COLOR

    for q in questions_raw:
        card_table = doc.add_table(rows=1, cols=1)
        card_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        card_table.autofit = False
        cell_card = card_table.rows[0].cells[0]
        cell_card.width = Inches(7.0)
        
        set_cell_background(cell_card, "FAFAFC")
        set_cell_margins(cell_card, top=120, bottom=120, left=160, right=160)
        set_cell_border(cell_card, 
                        top={'val': 'single', 'sz': 6, 'color': '8B5CF6'},
                        bottom={'val': 'single', 'sz': 4, 'color': 'E2E8F0'},
                        left={'val': 'single', 'sz': 12, 'color': '6366F1'},
                        right={'val': 'single', 'sz': 4, 'color': 'E2E8F0'})

        # Header within card
        p_qhdr = cell_card.paragraphs[0]
        p_qhdr.paragraph_format.space_before = Pt(0)
        p_qhdr.paragraph_format.space_after = Pt(4)
        
        r_num = p_qhdr.add_run(f"SOAL BUTIR #{q['no']}")
        r_num.font.name = "Calibri"
        r_num.font.size = Pt(11)
        r_num.font.bold = True
        r_num.font.color.rgb = PRIMARY_COLOR

        r_badge = p_qhdr.add_run(f"  —  [ Bentuk: {q['type']}  |  Tingkat: {q['diff']} ]")
        r_badge.font.name = "Calibri"
        r_badge.font.size = Pt(9.5)
        r_badge.font.bold = False
        r_badge.font.color.rgb = TEXT_MUTED

        # Case study / Stimulus if present
        if q["case"]:
            p_case = cell_card.add_paragraph()
            p_case.paragraph_format.space_before = Pt(4)
            p_case.paragraph_format.space_after = Pt(4)
            
            r_c_lbl = p_case.add_run("📖 Stimulus / Narasi Kasus:\n")
            r_c_lbl.font.name = "Calibri"
            r_c_lbl.font.size = Pt(9.5)
            r_c_lbl.font.bold = True
            r_c_lbl.font.color.rgb = ACCENT_COLOR
            
            r_c_txt = p_case.add_run(f"\"{q['case']}\"")
            r_c_txt.font.name = "Calibri"
            r_c_txt.font.size = Pt(10)
            r_c_txt.font.italic = True
            r_c_txt.font.color.rgb = TEXT_MAIN

        # Question Text
        p_q = cell_card.add_paragraph()
        p_q.paragraph_format.space_before = Pt(4)
        p_q.paragraph_format.space_after = Pt(6)
        r_q = p_q.add_run(f"Pertanyaan:\n{q['q']}")
        r_q.font.name = "Calibri"
        r_q.font.size = Pt(10.5)
        r_q.font.bold = True
        r_q.font.color.rgb = DARK_TITLE

        # Options
        p_opt_hdr = cell_card.add_paragraph()
        p_opt_hdr.paragraph_format.space_before = Pt(2)
        p_opt_hdr.paragraph_format.space_after = Pt(2)
        r_opt_hdr = p_opt_hdr.add_run("Pilihan Jawaban:")
        r_opt_hdr.font.name = "Calibri"
        r_opt_hdr.font.size = Pt(9.5)
        r_opt_hdr.font.bold = True
        r_opt_hdr.font.color.rgb = TEXT_MUTED

        for idx, opt in enumerate(q["options"]):
            char = chr(65 + idx)
            p_opt = cell_card.add_paragraph()
            p_opt.paragraph_format.left_indent = Inches(0.2)
            p_opt.paragraph_format.space_before = Pt(1)
            p_opt.paragraph_format.space_after = Pt(2)
            
            is_correct = False
            if q["type"] == "Pilihan Ganda Kompleks":
                is_correct = char in q["key"]
            elif q["type"] == "Benar / Salah":
                is_correct = char == q["key"][0]
            else:
                is_correct = char == q["key"]

            r_opt_code = p_opt.add_run(f"{char}.  ")
            r_opt_code.font.name = "Calibri"
            r_opt_code.font.size = Pt(10)
            r_opt_code.font.bold = True
            
            r_opt_txt = p_opt.add_run(opt)
            r_opt_txt.font.name = "Calibri"
            r_opt_txt.font.size = Pt(10)

            if is_correct:
                r_opt_code.font.color.rgb = SUCCESS_DARK
                r_opt_txt.font.color.rgb = SUCCESS_DARK
                r_opt_txt.font.bold = True
                r_tag = p_opt.add_run("   ✔ [KUNCI BENAR]")
                r_tag.font.name = "Calibri"
                r_tag.font.size = Pt(9)
                r_tag.font.bold = True
                r_tag.font.color.rgb = SUCCESS_COLOR
            else:
                r_opt_code.font.color.rgb = TEXT_MAIN
                r_opt_txt.font.color.rgb = TEXT_MAIN

        # Answer Key Line
        p_ans = cell_card.add_paragraph()
        p_ans.paragraph_format.space_before = Pt(6)
        p_ans.paragraph_format.space_after = Pt(4)
        
        r_ans_lbl = p_ans.add_run("🎯 Kunci Jawaban Resmi: ")
        r_ans_lbl.font.name = "Calibri"
        r_ans_lbl.font.size = Pt(10)
        r_ans_lbl.font.bold = True
        r_ans_lbl.font.color.rgb = SUCCESS_DARK

        r_ans_val = p_ans.add_run(q["key_full"])
        r_ans_val.font.name = "Calibri"
        r_ans_val.font.size = Pt(10)
        r_ans_val.font.bold = True
        r_ans_val.font.color.rgb = SUCCESS_DARK

        # Explanation
        p_exp = cell_card.add_paragraph()
        p_exp.paragraph_format.space_before = Pt(4)
        p_exp.paragraph_format.space_after = Pt(2)
        
        r_exp_lbl = p_exp.add_run("💡 Pembahasan / Penjelasan Ilmiah:\n")
        r_exp_lbl.font.name = "Calibri"
        r_exp_lbl.font.size = Pt(9.5)
        r_exp_lbl.font.bold = True
        r_exp_lbl.font.color.rgb = PRIMARY_COLOR

        r_exp_txt = p_exp.add_run(q["exp"])
        r_exp_txt.font.name = "Calibri"
        r_exp_txt.font.size = Pt(9.5)
        r_exp_txt.font.color.rgb = TEXT_MAIN

        # Spacer between cards
        doc.add_paragraph().paragraph_format.space_after = Pt(5)

    doc.add_page_break()

    # ═══════════════════════════════════════════════════════════════
    # BAGIAN 3: LEMBAR KUNCI JAWABAN CEPAT (QUICK ANSWER KEY SHEET)
    # ═══════════════════════════════════════════════════════════════
    h3 = doc.add_paragraph()
    h3.paragraph_format.space_before = Pt(0)
    h3.paragraph_format.space_after = Pt(8)
    r_h3 = h3.add_run("BAGIAN 3: LEMBAR KUNCI JAWABAN CEPAT (MASTER ANSWER SHEET)")
    r_h3.font.name = "Calibri"
    r_h3.font.size = Pt(13)
    r_h3.font.bold = True
    r_h3.font.color.rgb = PRIMARY_COLOR

    # 2-column quick key table
    quick_table = doc.add_table(rows=11, cols=4)
    quick_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    quick_table.autofit = False

    q_col_widths = [Inches(0.8), Inches(2.6), Inches(0.8), Inches(2.6)]
    for row in quick_table.rows:
        for i, cell in enumerate(row.cells):
            cell.width = q_col_widths[i]

    # Header row
    q_hdr_cells = quick_table.rows[0].cells
    q_hdr_titles = ["No.", "Kunci Jawaban", "No.", "Kunci Jawaban"]
    for i, cell in enumerate(q_hdr_cells):
        set_cell_background(cell, "3730A3")
        set_cell_margins(cell, top=80, bottom=80, left=80, right=80)
        set_cell_border(cell, 
                        top={'val': 'single', 'sz': 6, 'color': '1E1B4B'},
                        bottom={'val': 'single', 'sz': 6, 'color': '1E1B4B'},
                        left={'val': 'single', 'sz': 4, 'color': '4F46E5'},
                        right={'val': 'single', 'sz': 4, 'color': '4F46E5'})
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if i in [0, 2] else WD_ALIGN_PARAGRAPH.LEFT
        r = p.add_run(q_hdr_titles[i])
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    # 10 rows for questions 1-10 on left, 11-20 on right
    for row_i in range(1, 11):
        q_left = questions_raw[row_i - 1]
        q_right = questions_raw[row_i + 9]

        r_cells = quick_table.rows[row_i].cells
        bg_c = "F8FAFC" if row_i % 2 == 1 else "FFFFFF"

        for c_idx, cell in enumerate(r_cells):
            set_cell_background(cell, bg_c)
            set_cell_margins(cell, top=60, bottom=60, left=70, right=70)
            set_cell_border(cell, 
                            top={'val': 'single', 'sz': 4, 'color': 'E2E8F0'},
                            bottom={'val': 'single', 'sz': 4, 'color': 'E2E8F0'},
                            left={'val': 'single', 'sz': 4, 'color': 'E2E8F0'},
                            right={'val': 'single', 'sz': 4, 'color': 'E2E8F0'})

        # Left No & Key
        p_l_no = r_cells[0].paragraphs[0]
        p_l_no.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_l_no = p_l_no.add_run(str(q_left["no"]))
        r_l_no.font.bold = True
        r_l_no.font.size = Pt(9.5)

        p_l_key = r_cells[1].paragraphs[0]
        r_l_key = p_l_key.add_run(q_left["key"])
        r_l_key.font.bold = True
        r_l_key.font.size = Pt(9.5)
        r_l_key.font.color.rgb = SUCCESS_DARK

        # Right No & Key
        p_r_no = r_cells[2].paragraphs[0]
        p_r_no.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_r_no = p_r_no.add_run(str(q_right["no"]))
        r_r_no.font.bold = True
        r_r_no.font.size = Pt(9.5)

        p_r_key = r_cells[3].paragraphs[0]
        r_r_key = p_r_key.add_run(q_right["key"])
        r_r_key.font.bold = True
        r_r_key.font.size = Pt(9.5)
        r_r_key.font.color.rgb = SUCCESS_DARK

    # ═══════════════════════════════════════════════════════════════
    # RUBRIK PENILAIAN & PEDOMAN SKORING
    # ═══════════════════════════════════════════════════════════════
    h4 = doc.add_paragraph()
    h4.paragraph_format.space_before = Pt(18)
    h4.paragraph_format.space_after = Pt(6)
    r_h4 = h4.add_run("PEDOMAN PENILAIAN & BOBOT SKOR")
    r_h4.font.name = "Calibri"
    r_h4.font.size = Pt(12)
    r_h4.font.bold = True
    r_h4.font.color.rgb = PRIMARY_COLOR

    rubrik_table = doc.add_table(rows=4, cols=4)
    rubrik_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    rubrik_table.autofit = False

    rubrik_widths = [Inches(1.8), Inches(1.2), Inches(1.8), Inches(2.0)]
    for row in rubrik_table.rows:
        for i, cell in enumerate(row.cells):
            cell.width = rubrik_widths[i]

    rubrik_headers = ["Bentuk Soal", "Jumlah Butir", "Bobot Skor per Butir", "Skor Maksimal"]
    for i, cell in enumerate(rubrik_table.rows[0].cells):
        set_cell_background(cell, "4F46E5")
        set_cell_margins(cell, top=70, bottom=70, left=70, right=70)
        set_cell_border(cell, 
                        top={'val': 'single', 'sz': 4, 'color': '3730A3'},
                        bottom={'val': 'single', 'sz': 4, 'color': '3730A3'},
                        left={'val': 'single', 'sz': 4, 'color': '6366F1'},
                        right={'val': 'single', 'sz': 4, 'color': '6366F1'})
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(rubrik_headers[i])
        r.font.name = "Calibri"
        r.font.size = Pt(9)
        r.font.bold = True
        r.font.color.rgb = RGBColor(255, 255, 255)

    rubrik_data = [
        ("Pilihan Ganda (MCQ)", "14 Butir", "5 Poin / Butir", "70 Poin"),
        ("Benar / Salah (True/False)", "3 Butir", "5 Poin / Butir", "15 Poin"),
        ("Pilihan Ganda Kompleks", "3 Butir", "5 Poin / Butir", "15 Poin")
    ]

    for row_i, (b_soal, jml, bobot, max_s) in enumerate(rubrik_data, start=1):
        r_cells = rubrik_table.rows[row_i].cells
        for cell in r_cells:
            set_cell_background(cell, "F8FAFC" if row_i % 2 == 1 else "FFFFFF")
            set_cell_margins(cell, top=60, bottom=60, left=70, right=70)
            set_cell_border(cell, 
                            top={'val': 'single', 'sz': 4, 'color': 'E2E8F0'},
                            bottom={'val': 'single', 'sz': 4, 'color': 'E2E8F0'},
                            left={'val': 'single', 'sz': 4, 'color': 'E2E8F0'},
                            right={'val': 'single', 'sz': 4, 'color': 'E2E8F0'})
        r_cells[0].paragraphs[0].add_run(b_soal).font.size = Pt(9)
        r_cells[1].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_cells[1].paragraphs[0].add_run(jml).font.size = Pt(9)
        r_cells[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_cells[2].paragraphs[0].add_run(bobot).font.size = Pt(9)
        r_cells[3].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_s_run = r_cells[3].paragraphs[0].add_run(max_s)
        r_s_run.font.size = Pt(9)
        r_s_run.font.bold = True

    # Total Score note
    p_tot = doc.add_paragraph()
    p_tot.paragraph_format.space_before = Pt(6)
    p_tot.paragraph_format.space_after = Pt(24)
    r_tot = p_tot.add_run("📌 Perhitungan Nilai Akhir:  Nilai Siswa = (Total Skor Perolehan / 100) × 100  |  Skor Maksimal = 100 Poin")
    r_tot.font.name = "Calibri"
    r_tot.font.size = Pt(9.5)
    r_tot.font.bold = True
    r_tot.font.color.rgb = DARK_TITLE

    # Tanda Tangan / Pengesahan
    sig_table = doc.add_table(rows=1, cols=2)
    sig_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sig_table.autofit = False

    sig_widths = [Inches(3.4), Inches(3.4)]
    for i, cell in enumerate(sig_table.rows[0].cells):
        cell.width = sig_widths[i]
        set_cell_background(cell, "FFFFFF")
        set_cell_margins(cell, top=60, bottom=60, left=70, right=70)
        set_cell_border(cell)

    p_sig_left = sig_table.rows[0].cells[0].paragraphs[0]
    p_sig_left.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sl = p_sig_left.add_run("Mengetahui,\nKepala Sekolah / Koordinator Kurikulum\n\n\n\n\n(___________________________)\nNIP. .................................................")
    r_sl.font.name = "Calibri"
    r_sl.font.size = Pt(9.5)
    r_sl.font.color.rgb = TEXT_MAIN

    p_sig_right = sig_table.rows[0].cells[1].paragraphs[0]
    p_sig_right.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sr = p_sig_right.add_run("Guru Mata Pelajaran Informatika,\nPengampu Literasi Digital\n\n\n\n\n(___________________________)\nNIP. .................................................")
    r_sr.font.name = "Calibri"
    r_sr.font.size = Pt(9.5)
    r_sr.font.color.rgb = TEXT_MAIN

    # Save documents
    target_filename = "Rekap_Soal_dan_Kunci_Jawaban_Kuis_Detektif_Fakta.docx"
    local_temp_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_rekap.docx")
    doc.save(local_temp_file)

    target_paths = [
        r"C:\DOWNLOAD",
        r"C:\Downloads",
        os.path.expanduser(r"~\Downloads"),
        os.path.dirname(os.path.abspath(__file__))
    ]

    saved_locations = []
    for path in target_paths:
        try:
            if not os.path.exists(path):
                os.makedirs(path, exist_ok=True)
            dst_file = os.path.join(path, target_filename)
            shutil.copy2(local_temp_file, dst_file)
            saved_locations.append(dst_file)
            print(f"Berhasil disimpan di: {dst_file}")
        except Exception as e:
            print(f"Gagal menyalin ke {path}: {e}")

    try:
        os.remove(local_temp_file)
    except:
        pass

    return saved_locations

if __name__ == "__main__":
    locs = create_document()
    print("\nLokasi File Word (.docx) Berhasil Disimpan:")
    for l in locs:
        print(" ->", l)
