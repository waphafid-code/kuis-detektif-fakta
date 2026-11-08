/**
 * ============================================================
 * 🎓 LEARNING HUB & INTERACTIVE STUDY STUDIO (ALA RUANGGURU)
 * ============================================================
 * Modul pembelajaran mandiri interaktif berbasis ATP Fase E
 * (Informatika Kelas X):
 * 1. Validitas Sumber Data & Cek Fakta (2 JP)
 * 2. 7 Tipe Struktur Data & Pemanfaatannya (10 JP)
 * 3. Algoritma Pengurutan (Sorting) & Pencarian (Searching) (8 JP)
 * 4. Pseudocode & Input-Proses-Output (IPO)
 * 5. Jurus Sakti Aplikasi Perkantoran & Rumus Excel (TIK)
 * 
 * Pengembang: QuizMaster EdTech Engine
 * ============================================================
 */

// 📚 DATASET MATERI PEMBELAJARAN INTERAKTIF (BITE-SIZED MICRO-MODULES)
// 📚 DATASET MATERI PEMBELAJARAN INTERAKTIF (KOMPREHENSIF, BERBOBOT & MENYENANGKAN)
const LEARNING_MODULES = {
    'validitas_data': {
        id: 'validitas_data',
        title: 'Detektif Validitas Sumber Data & Cek Fakta',
        badge: 'ATP 1 • Berpikir Komputasional (2 JP)',
        icon: '🕵️',
        gameId: 'hoax_buster',
        gameTitle: 'Detektif Hoax Buster (30s Speedrun)',
        summary: 'Kecakapan menguji keaslian data, mengenali bias clickbait, mendeteksi phishing APK, dan memverifikasi domain resmi.',
        color: '#f43f5e',
        slides: [
            {
                title: 'Fenomena Nyata: Mengapa Satu Info Palsu Bisa Fatal?',
                badge: 'Langkah 1 dari 8 • Fenomena & Latar Belakang',
                bloom: { code: 'C2', label: 'C2 • Memahami' },
                contentHtml: `
                    <div class="learn-story-box">
                        <div class="story-avatar">📱</div>
                        <div class="story-text">
                            <strong>Kisah Nyata:</strong> Seorang warga menerima pesan WhatsApp berbunyi: 
                            <em>"Mulai besok pemerintah bagikan kuota darurat 100GB dan bantuan sosial tunai Rp 1.500.000! Segera klik: bantuan-sosial-bansos.xyz"</em>. 
                            Pesan itu diteruskan ke puluhan grup keluarga. Korban yang mengeklik tautan tersebut diminta mengunduh berkas yang ternyata adalah <strong>trojan perbankan</strong>, mengakibatkan saldo tabungan terkuras!
                        </div>
                    </div>
                    <div class="learn-diagram-box">
                        <h4 style="color: #fb7185; margin: 0 0 8px 0;">Mengapa Manusia Mudah Terjebak Hoaks?</h4>
                        <p style="margin: 0; font-size: 0.84rem; line-height: 1.55; color: var(--text);">
                            Pembuat informasi palsu tidak hanya menyerang teknologi, tetapi memanfaatkan <strong>psikologi manusia</strong>:
                            <br>• <strong>Rasa Panik / Takut (Fear):</strong> Berita bahaya bencana mendadak.
                            <br>• <strong>Keserakahan (Greed):</strong> Janji hadiah gratis, ponsel murah, atau uang tunai.
                            <br>• <strong>Urgensi Palsu (FOMO):</strong> "Bagi sekarang sebelum link ini dihapus pemerintah!"
                        </p>
                    </div>
                `
            },
            {
                title: 'Anatomi URL & Domain Resmi Negara Republik Indonesia',
                badge: 'Langkah 2 dari 8 • Anatomi Teknis',
                bloom: { code: 'C1', label: 'C1 • Mengingat' },
                contentHtml: `
                    <p style="font-size: 0.86rem; color: var(--text-muted); margin-bottom: 12px;">
                        Pelajari struktur alamat website (URL) untuk membedakan domain legal resmi vs domain jebakan:
                    </p>
                    <div class="learn-code-block">
                        https:// <span style="color: #60a5fa;">subdomain</span> . <span style="color: #34d399; font-weight: bold;">domain-utama</span> . <span style="color: #facc15; font-weight: bold;">tld</span> / path
                        <br><br>
                        Contoh Resmi:  https:// <span style="color: #60a5fa;">buku</span> . <span style="color: #34d399; font-weight: bold;">kemdikbud</span> . <span style="color: #facc15; font-weight: bold;">go.id</span> / modul
                        <br>
                        Contoh Jebakan: https:// <span style="color: #f43f5e;">kemdikbud</span> . <span style="color: #f43f5e; font-weight: bold;">klaim-kuota-bansos</span> . <span style="color: #f43f5e; font-weight: bold;">xyz</span> / login
                    </div>
                    <table class="learn-compare-table">
                        <thead>
                            <tr>
                                <th>Akhiran Domain (TLD)</th>
                                <th>Pengelola &amp; Peruntukan Resmi RI</th>
                                <th>Tingkat Kepercayaan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>.go.id</code></td>
                                <td>Instansi Pemerintah Resmi (Kementerian, Dinas, Pemda)</td>
                                <td><span style="color: #34d399; font-weight: 700;">🛡️ Sangat Terpercaya</span> (Wajib SK Negara)</td>
                            </tr>
                            <tr>
                                <td><code>.ac.id</code> / <code>.sch.id</code></td>
                                <td>Perguruan Tinggi Akademik / Sekolah Resmi</td>
                                <td><span style="color: #34d399; font-weight: 700;">🛡️ Sangat Terpercaya</span></td>
                            </tr>
                            <tr>
                                <td><code>.xyz</code>, <code>.biz.id</code>, <code>.top</code></td>
                                <td>Domain bebas biaya murah yang dapat dibeli siapapun secara anonim</td>
                                <td><span style="color: #fb7185; font-weight: 700;">⚠️ Wajib Waspada</span> (Sering disalahgunakan)</td>
                            </tr>
                        </tbody>
                    </table>
                `
            },
            {
                title: '3 Gangguan Informasi: Misinformasi, Disinformasi & Malinformasi',
                badge: 'Langkah 3 dari 8 • Klasifikasi Teori',
                bloom: { code: 'C2', label: 'C2 • Memahami' },
                contentHtml: `
                    <p style="font-size: 0.86rem; color: var(--text); margin-bottom: 12px;">
                        Kementerian Kominfo dan UNESCO mengelompokkan kekacauan informasi digital menjadi 3 bentuk berbeda:
                    </p>
                    <table class="learn-compare-table">
                        <thead>
                            <tr>
                                <th>Kategori</th>
                                <th>Definisi Konsep</th>
                                <th>Niat Pelaku</th>
                                <th>Contoh Nyata</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong style="color: #facc15;">Misinformasi</strong></td>
                                <td>Informasi keliru atau salah, namun dibagikan tanpa niat jahat.</td>
                                <td>Tidak berniat merugikan (korban percaya info itu benar).</td>
                                <td>Ibu mengirim tips kesehatan herbal rebusan daun sirih karena peduli pada keluarga.</td>
                            </tr>
                            <tr>
                                <td><strong style="color: #f43f5e;">Disinformasi</strong></td>
                                <td>Informasi palsu yang <em>sengaja dirancang</em> untuk menipu atau mengadu domba.</td>
                                <td>Sengaja berniat jahat, meraup uang, atau membuat kepanikan.</td>
                                <td>Berita hoaks penculikan anak di depan sekolah atau link phishing bantuan sosial.</td>
                            </tr>
                            <tr>
                                <td><strong style="color: #c084fc;">Malinformasi</strong></td>
                                <td>Informasi berbasis fakta nyata, tetapi dipelintir atau disebar untuk menjatuhkan pihak lain.</td>
                                <td>Berniat merusak reputasi atau balas dendam.</td>
                                <td>Menyebarkan rekaman percakapan pribadi seseorang secara sepotong untuk memeras.</td>
                            </tr>
                        </tbody>
                    </table>
                `
            },
            {
                title: '4 Jurus "Lateral Reading" Ala Fact-Checker Profesional',
                badge: 'Langkah 4 dari 8 • Keterampilan Praktik',
                bloom: { code: 'C3', label: 'C3 • Menerapkan' },
                contentHtml: `
                    <div class="pillar-grid-learn">
                        <div class="pillar-mini-card">
                            <div class="mini-icon">🌐</div>
                            <strong>1. Buka Tab Samping (Lateral)</strong>
                            <p>Jangan berdiam di halaman yang kamu curigai. Buka tab baru di browser dan cari nama organisasi yang menerbitkan artikel tersebut.</p>
                        </div>
                        <div class="pillar-mini-card">
                            <div class="mini-icon">🖼️</div>
                            <strong>2. Reverse Image Search</strong>
                            <p>Gunakan Google Lens atau TinEye untuk menguji keaslian foto. Banyak hoaks memakai foto gempa tahun 2015 dan diklaim terjadi hari ini.</p>
                        </div>
                        <div class="pillar-mini-card">
                            <div class="mini-icon">🏛️</div>
                            <strong>3. Cek Dewan Pers &amp; Media Arus Utama</strong>
                            <p>Periksa apakah berita tersebut juga dilaporkan oleh kantor berita kredibel (Antara, Kompas, Detik, Tempo).</p>
                        </div>
                        <div class="pillar-mini-card">
                            <div class="mini-icon">🤖</div>
                            <strong>4. Manfaatkan Chatbot Cek Fakta</strong>
                            <p>Kirimkan tautan atau teks yang mencurigakan ke Bot WhatsApp CekFakta Mafindo (+62 859-2160-0500) untuk verifikasi otomatis.</p>
                        </div>
                    </div>
                `
            },
            {
                title: 'Laboratorium Interaktif: Deteksi Red Flag Hoaks!',
                badge: 'Langkah 5 dari 8 • Simulasi Interaktif',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                type: 'simulator',
                simulatorId: 'hoax_scanner',
                contentHtml: `
                    <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 12px;">
                        Klik pada bagian yang menurutmu adalah <strong>tanda bahaya (red flag)</strong> dalam pesan ini:
                    </p>
                    <div class="hoax-sim-card" id="hoax-sim-box">
                        <div class="hoax-sim-header">
                            <span class="hoax-badge-alert">⚠️ PESAN BERANTAI</span>
                            <span style="font-size: 0.75rem; color: #888;">Baru saja diteruskan berkali-kali</span>
                        </div>
                        <div class="hoax-sim-body">
                            <div class="hoax-clickable-target" id="target-title" onclick="inspectHoaxClue('title')">
                                🚨 <strong>GEMPAR!! BAGIKAN KE 10 GRUP MAKA KUOTA 50GB LANGSUNG AKTIF!!</strong> 🚨
                            </div>
                            <p style="margin: 8px 0; font-size: 0.84rem;">Kementerian Informasi memberikan bantuan kuota darurat bagi seluruh pelajar sekolah.</p>
                            <div class="hoax-clickable-target" id="target-url" onclick="inspectHoaxClue('url')">
                                👉 Klik segera: <u>http://subsidi-kuota.kemdikbud-resmi.biz.id/klaim</u>
                            </div>
                        </div>
                        <div class="hoax-feedback-banner" id="hoax-feedback-area">
                            💡 <em>Klik judul yang heboh atau alamat tautan mencurigakan di atas!</em>
                        </div>
                    </div>
                `
            },
            {
                title: 'Bedah Kasus: Bahaya Modus File APK Berkedok Undangan / Resi',
                badge: 'Langkah 6 dari 8 • Studi Kasus Cyber Crime',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                contentHtml: `
                    <div class="learn-diagram-box">
                        <h4 style="color: #fb7185; margin: 0 0 8px 0;">Mengapa File .APK Sangat Berbahaya di WhatsApp?</h4>
                        <p style="font-size: 0.85rem; line-height: 1.55; color: var(--text);">
                            Pernahkah kamu melihat kiriman file seperti <code>Undangan_Pernikahan.apk</code> atau <code>Foto_Paket_JNT.apk</code>?
                            <br>• File dokumen teks berekstensi <code>.pdf</code> atau <code>.docx</code>.
                            <br>• File foto gambar berekstensi <code>.jpg</code> atau <code>.png</code>.
                            <br>• <strong>.APK (Android Package Kit)</strong> adalah aplikasi perangkat lunak yang bisa diinstal langsung di sistem Android!
                        </p>
                    </div>
                    <div class="learn-story-box">
                        <div class="story-avatar">🛑</div>
                        <div class="story-text">
                            <strong>Mekanisme Serangan:</strong> Ketika korban menekan file APK tersebut dan menyetujui izin akses <em>Accessibility Service</em> dan <em>SMS</em>, hacker dapat membaca SMS OTP bank milik korban dari jarak jauh tanpa korban sadari!
                            <br><span style="color: #34d399; font-weight: 700;">Aturan Emas: JANGAN PERNAH menginstal file berekstensi .apk yang dikirim orang asing di media sosial!</span>
                        </div>
                    </div>
                `
            },
            {
                title: 'Kuis Checkpoint 1: Menganalisis Jebakan Berita Viral 🎯',
                badge: 'Langkah 7 dari 8 • Evaluasi Pemahaman',
                bloom: { code: 'C5', label: 'C5 • Mengevaluasi' },
                type: 'checkpoint',
                question: 'Sebuah pesan di media sosial mendesak: "BAGIKAN KE SEMUA TEMAN SEBELUM DIHAPUS PEMERINTAH DALAM 1 JAM!". Dari sudut pandang literasi digital, alasan paling tepat mengapa pesan ini patut dicurigai adalah ...',
                options: [
                    'Pemerintah Indonesia tidak pernah menghapus berita di media sosial',
                    'Pesan sengaja memanipulasi emosi kepanikan dan urgensi waktu palsu agar korban menyebarkannya tanpa sempat berpikir kritis',
                    'Pesan tersebut ditulis menggunakan huruf kecil semua sehingga sulit dibaca',
                    'Format teks tidak memiliki emoji sehingga terkesan membosankan'
                ],
                correctAnswer: 1,
                explanation: 'Tepat sekali! Membangun rasa panik dan batas waktu palsu (urgency trigger) adalah taktik psikologis nomor satu pembuat hoaks agar logika berpikir pembaca lumpuh.'
            },
            {
                title: 'Kuis Checkpoint 2: Verifikasi Validitas Data Statistik 🎯',
                badge: 'Langkah 8 dari 8 • Evaluasi Pemahaman',
                bloom: { code: 'C5', label: 'C5 • Mengevaluasi' },
                type: 'checkpoint',
                question: 'Saat membaca infografis data statistik angka pengangguran di media sosial, langkah pertama yang paling bertanggung jawab untuk memastikan keabsahan datanya adalah ...',
                options: [
                    'Melihat apakah warna grafik tampak menarik dan profesional',
                    'Memeriksa sumber resmi rujukan data (misalnya data Badan Pusat Statistik - bps.go.id) dan metodologi pengambilannya',
                    'Membaca kolom komentar untuk melihat berapa banyak warganet yang setuju',
                    'Langsung mengunggahnya ke story Instagram agar terlihat melek isu sosial'
                ],
                correctAnswer: 1,
                explanation: 'Sempurna! Kevalidan data statistik bertumpu pada sumber primer terakreditasi (seperti BPS) dan metodologi pengambilan sampelnya, bukan pada estetika desain atau popularitas di kolom komentar.'
            }
        ]
    },

    'struktur_data': {
        id: 'struktur_data',
        title: 'Petualangan 7 Struktur Data Komputasi',
        badge: 'ATP 2 • Berpikir Komputasional (10 JP)',
        icon: '📦',
        gameId: 'kitchen_express',
        gameTitle: 'Stack vs Queue Kitchen Express',
        summary: 'Memahami arsitektur penataan data di RAM: Array, Linked List, Stack (LIFO), Queue (FIFO), Tree, Graph, dan Hash Table.',
        color: '#8b5cf6',
        slides: [
            {
                title: 'Mengapa Komputer Membutuhkan Struktur Data?',
                badge: 'Langkah 1 dari 8 • Analogi Nyata & Memori',
                bloom: { code: 'C2', label: 'C2 • Memahami' },
                contentHtml: `
                    <div class="learn-story-box">
                        <div class="story-avatar">📚</div>
                        <div class="story-text">
                            <strong>Analogi Lemari Pakaian:</strong> Kalau kamu melempar semua baju, celana, dan kaus kaki ke dalam satu tumpukan acak di lantai, kamu akan butuh 15 menit cuma untuk mencari kaus kaki yang cocok! 
                            Tapi jika kamu menyusunnya di rak bersekat teratur (kaus di rak 1, celana di rak 2), kamu bisa mengambilnya dalam <strong>2 detik</strong>.
                        </div>
                    </div>
                    <div class="learn-diagram-box">
                        <h4 style="color: #a5b4fc; margin: 0 0 8px 0;">Struktur Data di Dalam Memori RAM Komputer</h4>
                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.55; color: var(--text);">
                            RAM komputer terdiri dari miliaran sel memori beralamat heksadesimal. <strong>Struktur Data</strong> adalah format khusus untuk mengorganisasi, menyimpan, dan memanipulasi data sehingga CPU dapat melakukan operasi pencarian (search), penambahan (insert), dan penghapusan (delete) dengan secepat kilat.
                        </p>
                    </div>
                `
            },
            {
                title: 'Peta Konsep: 7 Tipe Struktur Data Klasik',
                badge: 'Langkah 2 dari 8 • Taksonomi Data',
                bloom: { code: 'C1', label: 'C1 • Mengingat' },
                contentHtml: `
                    <div class="learn-flowchart-grid">
                        <div class="flow-symbol-card">
                            <div class="flow-symbol-icon">📊</div>
                            <div class="flow-symbol-name">1. Array</div>
                            <div class="flow-symbol-desc">Indeks bernomor tetap berdampingan di memori</div>
                        </div>
                        <div class="flow-symbol-card">
                            <div class="flow-symbol-icon">🔗</div>
                            <div class="flow-symbol-name">2. Linked List</div>
                            <div class="flow-symbol-desc">Rantai simpul dinamis bertaut pointer</div>
                        </div>
                        <div class="flow-symbol-card">
                            <div class="flow-symbol-icon">🥞</div>
                            <div class="flow-symbol-name">3. Stack</div>
                            <div class="flow-symbol-desc">Tumpukan LIFO (Last In First Out)</div>
                        </div>
                        <div class="flow-symbol-card">
                            <div class="flow-symbol-icon">🎟️</div>
                            <div class="flow-symbol-name">4. Queue</div>
                            <div class="flow-symbol-desc">Antrean FIFO (First In First Out)</div>
                        </div>
                        <div class="flow-symbol-card">
                            <div class="flow-symbol-icon">🌳</div>
                            <div class="flow-symbol-name">5. Tree</div>
                            <div class="flow-symbol-desc">Hierarki akar-cabang tanpa siklus tertutup</div>
                        </div>
                        <div class="flow-symbol-card">
                            <div class="flow-symbol-icon">🕸️</div>
                            <div class="flow-symbol-name">6. Graph</div>
                            <div class="flow-symbol-desc">Jaringan simpul dan garis bebas terhubung</div>
                        </div>
                        <div class="flow-symbol-card">
                            <div class="flow-symbol-icon">🔑</div>
                            <div class="flow-symbol-name">7. Hash Table</div>
                            <div class="flow-symbol-desc">Pasangan kunci-nilai akses super cepat O(1)</div>
                        </div>
                    </div>
                `
            },
            {
                title: 'Struktur Linear: Array Statis vs Linked List Dinamis',
                badge: 'Langkah 3 dari 8 • Analisis Perbandingan',
                bloom: { code: 'C2', label: 'C2 • Memahami' },
                contentHtml: `
                    <table class="learn-compare-table">
                        <thead>
                            <tr>
                                <th>Karakteristik</th>
                                <th>Array (Larik)</th>
                                <th>Linked List (Senarai Berantai)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Lokasi di Memori</strong></td>
                                <td>Blok memori bersebelahan secara kontigu (rapat).</td>
                                <td>Tersebar di berbagai alamat RAM acak.</td>
                            </tr>
                            <tr>
                                <td><strong>Ukuran Alokasi</strong></td>
                                <td>Statis (harus dideklarasikan ukuran awalnya, misal 50 elemen).</td>
                                <td>Dinamis (dapat membesar atau mengecil kapan saja).</td>
                            </tr>
                            <tr>
                                <td><strong>Akses Elemen</strong></td>
                                <td>Sangat cepat melalui indeks nomor: <code>data[3]</code> dalam waktu konstan O(1).</td>
                                <td>Harus menelusuri simpul dari depan (Head) satu per satu O(N).</td>
                            </tr>
                            <tr>
                                <td><strong>Penyisipan Data</strong></td>
                                <td>Lambat, karena elemen di kanannya harus digeser satu per satu.</td>
                                <td>Sangat cepat, cukup ubah pointer penunjuk simpul berikutnya!</td>
                            </tr>
                        </tbody>
                    </table>
                `
            },
            {
                title: 'Duel Dinamis: Stack (LIFO) vs Queue (FIFO)',
                badge: 'Langkah 4 dari 8 • Prinsip & Contoh Aplikasi',
                bloom: { code: 'C3', label: 'C3 • Menerapkan' },
                contentHtml: `
                    <div class="comparison-grid-learn">
                        <div class="compare-card stack-side">
                            <div class="compare-icon">🥞</div>
                            <h4 style="color: #c084fc; margin: 4px 0;">STACK (Tumpukan)</h4>
                            <div class="principle-pill">Prinsip LIFO: Last In, First Out</div>
                            <p style="font-size: 0.82rem; margin-top: 8px;">
                                Elemen yang <strong>terakhir ditaruh (Push)</strong> akan menjadi yang <strong>pertama diambil (Pop)</strong>.
                                <br><br>
                                <strong>Penerapan Nyata:</strong>
                                <br>• Fitur Undo (Ctrl + Z) pada Microsoft Word.
                                <br>• Tombol Back di browser internet.
                                <br>• Call Stack pemanggilan fungsi pada pemrograman rekursif.
                            </p>
                        </div>
                        <div class="compare-card queue-side">
                            <div class="compare-icon">🎟️</div>
                            <h4 style="color: #38bdf8; margin: 4px 0;">QUEUE (Antrean)</h4>
                            <div class="principle-pill">Prinsip FIFO: First In, First Out</div>
                            <p style="font-size: 0.82rem; margin-top: 8px;">
                                Elemen yang <strong>pertama kali masuk (Enqueue)</strong> akan menjadi yang <strong>pertama dilayani (Dequeue)</strong>.
                                <br><br>
                                <strong>Penerapan Nyata:</strong>
                                <br>• Antrean dokumen cetak di mesin printer sekolah.
                                <br>• Daftar putar lagu (Music Playlist Queue) di Spotify.
                                <br>• Penanganan request pengguna di server web.
                            </p>
                        </div>
                    </div>
                `
            },
            {
                title: 'Laboratorium Simulator Interaktif: Praktik Stack & Queue',
                badge: 'Langkah 5 dari 8 • Simulator Interaktif',
                bloom: { code: 'C3', label: 'C3 • Menerapkan' },
                type: 'simulator',
                simulatorId: 'stack_queue_sim',
                contentHtml: `
                    <div class="stack-queue-sim-wrap">
                        <div class="sim-column">
                            <h5 style="color: #c084fc; margin-bottom: 8px;">🥞 Simulator Stack (Tumpukan Piring)</h5>
                            <div class="stack-shelf" id="sim-stack-shelf">
                                <div class="stack-plate plate-1">Piring #1 (Bawah)</div>
                                <div class="stack-plate plate-2">Piring #2 (Tengah)</div>
                            </div>
                            <div style="display: flex; gap: 6px; margin-top: 10px;">
                                <button type="button" class="btn-sim-action" onclick="simStackPush()">➕ Push (Taruh Atas)</button>
                                <button type="button" class="btn-sim-action btn-sim-danger" onclick="simStackPop()">➖ Pop (Ambil Atas)</button>
                            </div>
                            <div class="sim-note" id="stack-sim-status">Tumpukan: 2 piring. Ambil akan mengambil piring paling atas!</div>
                        </div>

                        <div class="sim-column">
                            <h5 style="color: #38bdf8; margin-bottom: 8px;">🎟️ Simulator Queue (Antrean Siswa)</h5>
                            <div class="queue-lane" id="sim-queue-lane">
                                <span class="queue-token">Siswa A (Depan)</span>
                                <span class="queue-token">Siswa B</span>
                            </div>
                            <div style="display: flex; gap: 6px; margin-top: 10px;">
                                <button type="button" class="btn-sim-action" onclick="simQueueEnqueue()">➕ Enqueue (Antre Belakang)</button>
                                <button type="button" class="btn-sim-action btn-sim-danger" onclick="simQueueDequeue()">➖ Dequeue (Layani Depan)</button>
                            </div>
                            <div class="sim-note" id="queue-sim-status">Antrean: 2 orang. Layani akan melayani Siswa A yang datang duluan!</div>
                        </div>
                    </div>
                `
            },
            {
                title: 'Struktur Non-Linear: Tree (Hierarki) vs Graph (Jaringan)',
                badge: 'Langkah 6 dari 8 • Konsep Lanjutan',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                contentHtml: `
                    <div class="learn-diagram-box">
                        <h4 style="color: #38bdf8; margin: 0 0 8px 0;">Tree (Pohon Hierarki)</h4>
                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.55; color: var(--text);">
                            Struktur bertingkat yang berawal dari satu simpul utama bernama <strong>Akar (Root)</strong>, bercabang ke <strong>Anak (Child)</strong>, dan berakhir di <strong>Daun (Leaf)</strong>. Syarat mutlak Tree: <em>TIDAK BOLEH MEMILIKI SIKLUS TERTUTUP (Loop)</em>.
                            <br><strong>Contoh Nyata:</strong> Struktur folder di komputer (<code>C:TugasInformatikaModul.pdf</code>) dan susunan elemen HTML (DOM Tree).
                        </p>
                    </div>
                    <div class="learn-diagram-box" style="margin-top: 10px;">
                        <h4 style="color: #ec4899; margin: 0 0 8px 0;">Graph (Jaringan Bebas)</h4>
                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.55; color: var(--text);">
                            Kumpulan titik simpul <strong>(Vertex)</strong> yang dihubungkan oleh garis penghubung <strong>(Edge)</strong>. Graph boleh saling menyilang dan membentuk putaran siklus tertutup.
                            <br><strong>Contoh Nyata:</strong> Jaringan rute jalan di Google Maps (mencari jalan terpendek algoritma Dijkstra) dan relasi pertemanan di media sosial Instagram.
                        </p>
                    </div>
                `
            },
            {
                title: 'Hash Table: Rahasia Pencarian Kilat O(1)',
                badge: 'Langkah 7 dari 8 • Arsitektur Efisiensi',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                contentHtml: `
                    <div class="learn-story-box">
                        <div class="story-avatar">⚡</div>
                        <div class="story-text">
                            <strong>Pernahkah Kamu Berpikir?</strong> Bagaimana sistem sekolah menemukan biodata dari 1.000 siswa hanya dalam hitungan mikrodetik ketika NISN diketikkan? Apakah komputer mengecek nama satu per satu dari siswa pertama sampai ke-1.000? 
                            <br>Tentu tidak! Komputer menggunakan <strong>Hash Table (Tabel Hash)</strong>.
                        </div>
                    </div>
                    <div class="learn-diagram-box">
                        <h4 style="color: #34d399; margin: 0 0 8px 0;">Cara Kerja Fungsi Hash:</h4>
                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.55; color: var(--text);">
                            Kunci pencarian (misal NISN: <code>"89012"</code>) dimasukkan ke rumus matematika bernama <strong>Hash Function</strong>. Rumus ini langsung menghitung nomor kotak memori di mana data siswa itu tersimpan. 
                            <br>Hasilnya: Data ditemukan secara instan dalam 1 langkah langsung (Kompleksitas Waktu: <code>O(1)</code>)!
                        </p>
                    </div>
                `
            },
            {
                title: 'Kuis Checkpoint Evaluasi: Menentukan Struktur Data Tepat 🎯',
                badge: 'Langkah 8 dari 8 • Evaluasi Keputusan Desain',
                bloom: { code: 'C5', label: 'C5 • Mengevaluasi' },
                type: 'checkpoint',
                question: 'Sebuah tim pengembang aplikasi musik streaming ingin merancang fitur "Riwayat Lagu Terakhir yang Baru Diputar" agar pengguna dapat memutar balik lagu yang baru saja selesai didengar. Struktur data yang paling efisien adalah ...',
                options: [
                    'Queue (Karena lagu pertama yang didengar harus diputar balik paling awal)',
                    'Stack (Karena lagu terakhir yang selesai diputar berada di urutan paling atas untuk diambil kembali / LIFO)',
                    'Tree (Karena setiap lagu harus memiliki cabang anak dan akar)',
                    'Graph (Karena semua lagu harus terhubung dalam lingkaran siklus acak)'
                ],
                correctAnswer: 1,
                explanation: 'Luar biasa tepat! Riwayat lagu terakhir adalah model LIFO (Last In, First Out). Lagu yang paling baru selesai didengar ditaruh (Push) di atas tumpukan, sehingga ketika diputar ulang, lagu itulah yang langsung diambil pertama kali (Pop).'
            }
        ]
    },

    'algoritma_standar': {
        id: 'algoritma_standar',
        title: 'Laboratorium Algoritma Standar (Sorting & Searching)',
        badge: 'ATP 3 • Berpikir Komputasional (8 JP)',
        icon: '⚡',
        gameId: 'sort_dash',
        gameTitle: 'Algoritma Balap: Sorting Dash',
        summary: 'Menguasai perbandingan algoritma pengurutan (Bubble, Selection, Insertion Sort) dan rahasia kecepatan Binary Search O(log N).',
        color: '#10b981',
        slides: [
            {
                title: 'Mengapa Komputer Harus Mengurutkan Data?',
                badge: 'Langkah 1 dari 8 • Analogi Nyata',
                bloom: { code: 'C2', label: 'C2 • Memahami' },
                contentHtml: `
                    <div class="learn-story-box">
                        <div class="story-avatar">🔍</div>
                        <div class="story-text">
                            <strong>Uji Nalar:</strong> Coba cari nama temanmu di lembar absensi yang susunan namanya <strong>acak-acakan tanpa abjad</strong>. Kamu terpaksa membaca dari baris 1 sampai 36 satu per satu!
                            Tetapi jika daftar absen sudah <strong>diurutkan dari A sampai Z</strong>, kamu langsung membuka halaman tengah dan menemukannya dalam 3 detik!
                        </div>
                    </div>
                    <div class="learn-diagram-box">
                        <h4 style="color: #34d399; margin: 0 0 8px 0;">Sorting adalah Pondasi Utama Pencarian Kilat</h4>
                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.55; color: var(--text);">
                            Di dunia komputasi, algoritma pencarian tercepat (seperti <em>Binary Search</em>) HANYA BISA BERJALAN jika kumpulan datanya sudah terurut. Oleh karena itu, memahami <strong>Sorting (Pengurutan)</strong> adalah keterampilan inti berpikir komputasional di Fase E.
                        </p>
                    </div>
                `
            },
            {
                title: 'Tri Tunggal Algoritma Pengurutan Pemula',
                badge: 'Langkah 2 dari 8 • Tiga Strategi Sorting',
                bloom: { code: 'C1', label: 'C1 • Mengingat' },
                contentHtml: `
                    <div class="pillar-grid-learn">
                        <div class="pillar-mini-card">
                            <div class="mini-icon">🫧</div>
                            <strong>1. Bubble Sort</strong>
                            <p>Membandingkan dua elemen berdampingan. Jika posisinya terbalik, tukar! Angka terbesar perlahan "mengapung" ke ujung kanan seperti gelembung.</p>
                        </div>
                        <div class="pillar-mini-card">
                            <div class="mini-icon">🎯</div>
                            <strong>2. Selection Sort</strong>
                            <p>Mencari nilai terkecil dari seluruh deret yang belum terurut, lalu menukarnya langsung ke posisi paling depan secara bertahap.</p>
                        </div>
                        <div class="pillar-mini-card">
                            <div class="mini-icon">🃏</div>
                            <strong>3. Insertion Sort</strong>
                            <p>Mengambil satu kartu per satu dan menyelipkannya ke tempat yang pas di antara kartu-kartu yang sudah terurut di tangan kirimu.</p>
                        </div>
                    </div>
                `
            },
            {
                title: 'Laboratorium Visualizer Bubble Sort Langkah Demi Langkah',
                badge: 'Langkah 3 dari 8 • Simulator Interaktif',
                bloom: { code: 'C3', label: 'C3 • Menerapkan' },
                type: 'simulator',
                simulatorId: 'bubble_sort_sim',
                contentHtml: `
                    <p style="font-size: 0.86rem; color: var(--text-muted); margin-bottom: 12px;">
                        Tekan tombol <strong>"Langkah Berikutnya ➔"</strong> untuk melihat algoritma membandingkan dan menukar balok angka:
                    </p>
                    <div class="bubble-sort-board" id="sort-board-container">
                        <!-- Rendered by JS -->
                    </div>
                    <div class="sort-controls-bar">
                        <button type="button" class="btn-sim-action" id="btn-sort-next" onclick="stepBubbleSort()">Langkah Berikutnya ➔</button>
                        <button type="button" class="btn-sim-action btn-sim-secondary" onclick="resetBubbleSort()">Acak Ulang 🔄</button>
                    </div>
                    <div class="sim-note" id="sort-step-status" style="margin-top: 10px;">
                        Status: Siap! Angka acak: [5, 2, 8, 1, 4]. Klik "Langkah Berikutnya" untuk mulai membandingkan.
                    </div>
                `
            },
            {
                title: 'Algoritma Pencarian: Linear Search vs Binary Search',
                badge: 'Langkah 4 dari 8 • Konsep Searching',
                bloom: { code: 'C2', label: 'C2 • Memahami' },
                contentHtml: `
                    <table class="learn-compare-table">
                        <thead>
                            <tr>
                                <th>Kriteria</th>
                                <th>Linear Search (Pencarian Berurutan)</th>
                                <th>Binary Search (Pencarian Bagi Dua)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Prinsip Kerja</strong></td>
                                <td>Mengecek elemen satu per satu dari indeks ke-0, 1, 2, hingga akhir data.</td>
                                <td>Memotong rentang data menjadi dua bagian di titik tengah (Midpoint).</td>
                            </tr>
                            <tr>
                                <td><strong>Syarat Awal Data</strong></td>
                                <td>Data <strong>BOLEH ACAK</strong> / tidak perlu terurut.</td>
                                <td>Data <strong>MUTLAK WAJIB SUDAH TERURUT</strong>!</td>
                            </tr>
                            <tr>
                                <td><strong>Kasus Terburuk (Worst Case)</strong></td>
                                <td>Jika ada N data, butuh N kali pemeriksaan: <code>O(N)</code>.</td>
                                <td>Hanya butuh logaritma basis 2 dari N langkah: <code>O(log N)</code>.</td>
                            </tr>
                            <tr>
                                <td><strong>Contoh 1.000 Data</strong></td>
                                <td>Bisa butuh hingga 1.000 kali perbandingan!</td>
                                <td>Maksimal HANYA 10 KALI perbandingan!</td>
                            </tr>
                        </tbody>
                    </table>
                `
            },
            {
                title: 'Keajaiban Matematika Binary Search: O(log N)',
                badge: 'Langkah 5 dari 8 • Bedah Efisiensi',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                contentHtml: `
                    <div class="learn-story-box">
                        <div class="story-avatar">🎯</div>
                        <div class="story-text">
                            <strong>Game Tebak Angka 1 sampai 100:</strong> 
                            "Saya memikirkan angka antara 1 sampai 100. Jika tebakanmu salah, saya hanya akan bilang 'Terlalu Besar' atau 'Terlalu Kecil'."
                            <br>Berapa jumlah tebakan maksimal yang kamu butuhkan untuk PASTI MENANG?
                        </div>
                    </div>
                    <div class="learn-diagram-box">
                        <h4 style="color: #34d399; margin: 0 0 8px 0;">Cukup Maksimal 7 Langkah Saja!</h4>
                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.55; color: var(--text);">
                            • Langkah 1: Tebak tengah: 50. (Sisa 50 kemungkinan)
                            <br>• Langkah 2: Tebak tengah: 75. (Sisa 25 kemungkinan)
                            <br>• Langkah 3: Tebak tengah: 88. (Sisa 12 kemungkinan)
                            <br>• Langkah 4: Tebak tengah: 94. (Sisa 6 kemungkinan)
                            <br>• Langkah 5: Tebak tengah: 97. (Sisa 3 kemungkinan)
                            <br>• Langkah 6: Tebak tengah: 99. (Sisa 1 kemungkinan)
                            <br>• Langkah 7: PASTI TEPAT! Karena <code>2^7 = 128 &gt; 100</code>!
                        </p>
                    </div>
                `
            },
            {
                title: 'Trace Table: Melacak Titik Tengah Binary Search',
                badge: 'Langkah 6 dari 8 • Tabel Pelacakan',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                contentHtml: `
                    <p style="font-size: 0.86rem; color: var(--text); margin-bottom: 12px;">
                        Rumus menghitung indeks titik tengah pada Binary Search:
                        <br><code>Mid = Math.floor((Low + High) / 2)</code>
                    </p>
                    <table class="learn-compare-table">
                        <thead>
                            <tr>
                                <th>Iterasi</th>
                                <th>Indeks Low</th>
                                <th>Indeks High</th>
                                <th>Indeks Mid</th>
                                <th>Nilai di Titik Mid</th>
                                <th>Keputusan Algoritma</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Langkah 1</td>
                                <td>0</td>
                                <td>7</td>
                                <td>(0+7)/2 = 3</td>
                                <td>Angka 18</td>
                                <td>Target 25 &gt; 18, buang separuh kiri! Set Low = Mid + 1 = 4</td>
                            </tr>
                            <tr>
                                <td>Langkah 2</td>
                                <td>4</td>
                                <td>7</td>
                                <td>(4+7)/2 = 5</td>
                                <td>Angka 28</td>
                                <td>Target 25 &lt; 28, buang separuh kanan! Set High = Mid - 1 = 4</td>
                            </tr>
                            <tr>
                                <td>Langkah 3</td>
                                <td>4</td>
                                <td>4</td>
                                <td>(4+4)/2 = 4</td>
                                <td>Angka 25</td>
                                <td><strong>KETEMU!</strong> Data berada tepat di Indeks ke-4 🎉</td>
                            </tr>
                        </tbody>
                    </table>
                `
            },
            {
                title: 'Kuis Checkpoint 1: Menganalisis Syarat Algoritma 🎯',
                badge: 'Langkah 7 dari 8 • Evaluasi Kasus',
                bloom: { code: 'C5', label: 'C5 • Mengevaluasi' },
                type: 'checkpoint',
                question: 'Seorang programmer menjalankan Binary Search pada deret angka berikut: [15, 3, 42, 8, 27, 90, 11]. Hasil pencarian melaporkan bahwa angka 27 TIDAK DITEMUKAN, padahal angka itu jelas ada di dalam deret. Apa penyebab utama kegagalan tersebut?',
                options: [
                    'Algoritma Binary Search memiliki bug bawaan dari bahasa pemrograman',
                    'Deret data belum diurutkan terlebih dahulu sehingga prinsip bagi dua membuang separuh bagian yang salah',
                    'Jumlah data ganjil sehingga komputer tidak bisa membagi dua',
                    'Angka 27 terlalu kecil untuk ditemukan oleh algoritma'
                ],
                correctAnswer: 1,
                explanation: 'Tepat sekali! Syarat mutlak mutlak Binary Search adalah data harus terurut terlebih dahulu. Jika datanya acak, perbandingan nilai tengah akan memberikan keputusan yang salah dan membuang separuh wilayah yang justru memuat target pencarian!'
            },
            {
                title: 'Kuis Checkpoint 2: Evaluasi Jumlah Langkah Maksimal 🎯',
                badge: 'Langkah 8 dari 8 • Evaluasi Kompleksitas',
                bloom: { code: 'C5', label: 'C5 • Mengevaluasi' },
                type: 'checkpoint',
                question: 'Sebuah basis data perpustakaan menyimpan 64 judul buku yang telah tersusun rapi menurut abjad. Jumlah perbandingan maksimal yang dilakukan oleh Binary Search untuk memastikan apakah suatu judul buku ada atau tidak adalah ...',
                options: [
                    '64 langkah perbandingan',
                    '32 langkah perbandingan',
                    '6 langkah perbandingan (karena 2 pangkat 6 = 64)',
                    '1 langkah perbandingan saja'
                ],
                correctAnswer: 2,
                explanation: 'Sempurna! Karena setiap langkah membagi sisa data menjadi separuh, jumlah langkah maksimum adalah 2^k >= 64, yaitu k = 6 langkah saja!'
            }
        ]
    },

    'pseudocode_ipo': {
        id: 'pseudocode_ipo',
        title: 'Arsitektur Logika Pseudocode & Flowchart (IPO)',
        badge: 'ATP 4 & 5 • Berpikir Komputasional',
        icon: '🧩',
        gameId: 'sort_dash',
        gameTitle: 'Algoritma Balap: Sorting Dash',
        summary: 'Merancang algoritma terstruktur: Input-Proses-Output (IPO), simbol standar flowchart internasional, percabangan nested IF, dan teknik dry run.',
        color: '#3b82f6',
        slides: [
            {
                title: 'Bahasa Manusia Menuju Kode Mesin: Mengapa Butuh Pseudocode?',
                badge: 'Langkah 1 dari 8 • Konsep Jembatan Logika',
                bloom: { code: 'C2', label: 'C2 • Memahami' },
                contentHtml: `
                    <div class="learn-story-box">
                        <div class="story-avatar">👨‍💻</div>
                        <div class="story-text">
                            <strong>Pernahkah Kamu Bingung?</strong> Ketika diminta membuat program, banyak orang langsung membuka aplikasi dan bingung mau mengetik apa. Programmer senior TIDAK PERNAH langsung mengetik kode pemrograman! 
                            Mereka merancang logikanya terlebih dahulu menggunakan <strong>Pseudocode (Kode Semu)</strong> atau <strong>Flowchart (Diagram Alir)</strong>.
                        </div>
                    </div>
                    <div class="learn-diagram-box">
                        <h4 style="color: #60a5fa; margin: 0 0 8px 0;">Keunggulan Pseudocode:</h4>
                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.55; color: var(--text);">
                            • Menggunakan kata-kata terstruktur sederhana (<code>INPUT</code>, <code>IF-THEN-ELSE</code>, <code>WHILE</code>, <code>OUTPUT</code>).
                            <br>• Bebas dari kesalahan titik-koma (syntax error) bahasa komputer tertentu.
                            <br>• Sangat mudah diterjemahkan ke bahasa apapun (Python, C++, Java, JavaScript).
                        </p>
                    </div>
                `
            },
            {
                title: 'Fondasi Inti Komputasi: Siklus IPO (Input - Proses - Output)',
                badge: 'Langkah 2 dari 8 • Siklus Komputasi',
                bloom: { code: 'C1', label: 'C1 • Mengingat' },
                contentHtml: `
                    <div class="ipo-flow-grid">
                        <div class="ipo-box ipo-in">
                            <span class="ipo-label">📥 INPUT</span>
                            <strong>Pemasukan Data</strong>
                            <p>Data mentah dari keyboard, sensor, atau file (misal: Nilai Ujian = 85).</p>
                        </div>
                        <div class="ipo-arrow">➔</div>
                        <div class="ipo-box ipo-proc">
                            <span class="ipo-label">⚙️ PROSES</span>
                            <strong>Pengolahan Logika</strong>
                            <p>Komputer menguji logika: Apakah 85 &gt;= 80?</p>
                        </div>
                        <div class="ipo-arrow">➔</div>
                        <div class="ipo-box ipo-out">
                            <span class="ipo-label">📤 OUTPUT</span>
                            <strong>Penyajian Hasil</strong>
                            <p>Layar menampilkan status: "TUNTAS KKM 80 🎉".</p>
                        </div>
                    </div>
                    <p style="margin-top: 14px; font-size: 0.84rem; color: var(--text-muted);">
                        Semua sistem digital di muka bumi—mulai dari kalkulator saku hingga kecerdasan buatan (AI Nemotron)—selalu beroperasi berdasarkan siklus abadi IPO ini!
                    </p>
                `
            },
            {
                title: 'Standar Simbol Internasional Flowchart (Diagram Alir)',
                badge: 'Langkah 3 dari 8 • Notasi Diagram',
                bloom: { code: 'C1', label: 'C1 • Mengingat' },
                contentHtml: `
                    <div class="learn-flowchart-grid">
                        <div class="flow-symbol-card">
                            <div class="flow-symbol-icon">🛑</div>
                            <div class="flow-symbol-name">Terminator</div>
                            <div class="flow-symbol-desc">Bentuk oval/kapsul: Titik Mulai (START) &amp; Selesai (END)</div>
                        </div>
                        <div class="flow-symbol-card">
                            <div class="flow-symbol-icon">▱</div>
                            <div class="flow-symbol-name">Input / Output</div>
                            <div class="flow-symbol-desc">Bentuk jajar genjang: Membaca input data / Mencetak output</div>
                        </div>
                        <div class="flow-symbol-card">
                            <div class="flow-symbol-icon">▭</div>
                            <div class="flow-symbol-name">Process</div>
                            <div class="flow-symbol-desc">Bentuk persegi panjang: Perhitungan rumus &amp; penugasan nilai</div>
                        </div>
                        <div class="flow-symbol-card">
                            <div class="flow-symbol-icon">◇</div>
                            <div class="flow-symbol-name">Decision</div>
                            <div class="flow-symbol-desc">Bentuk belah ketupat: Percabangan kondisi (Ya / Tidak)</div>
                        </div>
                        <div class="flow-symbol-card">
                            <div class="flow-symbol-icon">⬇️</div>
                            <div class="flow-symbol-name">Flow Line</div>
                            <div class="flow-symbol-desc">Garis panah: Menunjukkan arah aliran eksekusi program</div>
                        </div>
                    </div>
                `
            },
            {
                title: '3 Struktur Kontrol Utama: Sequence, Branching & Looping',
                badge: 'Langkah 4 dari 8 • Struktur Kendali',
                bloom: { code: 'C2', label: 'C2 • Memahami' },
                contentHtml: `
                    <table class="learn-compare-table">
                        <thead>
                            <tr>
                                <th>Struktur Kontrol</th>
                                <th>Cara Kerja</th>
                                <th>Kata Kunci Pseudocode</th>
                                <th>Contoh Kasus</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>1. Runtunan (Sequence)</strong></td>
                                <td>Instruksi dijalankan lurus dari baris atas ke bawah secara berurutan.</td>
                                <td>Langkah demi langkah terurut.</td>
                                <td>Menghitung luas persegi panjang: Input panjang $	o$ Input lebar $	o$ Hitung Luas $	o$ Cetak.</td>
                            </tr>
                            <tr>
                                <td><strong>2. Percabangan (Branching)</strong></td>
                                <td>Memilih jalur aksi berdasarkan hasil pengujian kondisi logika (Benar/Salah).</td>
                                <td><code>IF - THEN - ELSE - ENDIF</code></td>
                                <td>Penentuan diskon: Jika belanja $ge$ 100.000 maka dapat potongan 10%.</td>
                            </tr>
                            <tr>
                                <td><strong>3. Perulangan (Looping)</strong></td>
                                <td>Mengulang sekumpulan instruksi selama kondisi syarat masih terpenuhi.</td>
                                <td><code>WHILE - DO</code> atau <code>FOR - TO - DO</code></td>
                                <td>Mencetak nomor antrean siswa dari nomor 1 sampai 36.</td>
                            </tr>
                        </tbody>
                    </table>
                `
            },
            {
                title: 'Laboratorium Simulator IPO Interaktif: Status KKM Siswa',
                badge: 'Langkah 5 dari 8 • Simulator Interaktif',
                bloom: { code: 'C3', label: 'C3 • Menerapkan' },
                type: 'simulator',
                simulatorId: 'ipo_machine_sim',
                contentHtml: `
                    <div class="ipo-interactive-wrap">
                        <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 12px;">
                            <label style="font-weight: 700; font-size: 0.88rem; color: var(--text);">📥 Geser Input Nilai Siswa:</label>
                            <input type="range" id="ipo-slider" min="40" max="100" value="82" oninput="updateIpoSimulator(this.value)" style="flex: 1; min-width: 140px; accent-color: #3b82f6;">
                            <span id="ipo-slider-val" style="font-size: 1.1rem; font-weight: 800; color: #60a5fa; min-width: 35px;">82</span>
                        </div>
                        <div class="ipo-pseudocode-view">
                            <div class="code-line"><strong>INPUT</strong> nilai_siswa = <span id="code-val-in" style="color: #60a5fa;">82</span></div>
                            <div class="code-line"><strong>IF</strong> nilai_siswa &gt;= 80 <strong>THEN</strong></div>
                            <div class="code-line" style="padding-left: 20px;"><strong>OUTPUT</strong> = <span id="code-val-out" style="color: #34d399;">"TUNTAS KKM 80 🎉"</span></div>
                            <div class="code-line"><strong>ELSE</strong></div>
                            <div class="code-line" style="padding-left: 20px;"><strong>OUTPUT</strong> = "PERLU REMEDIAL 📚"</div>
                            <div class="code-line"><strong>ENDIF</strong></div>
                        </div>
                    </div>
                `
            },
            {
                title: 'Membedah Kasus Pseudocode Kompleks: Diskon Bertingkat',
                badge: 'Langkah 6 dari 8 • Analisis Kasus Riil',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                contentHtml: `
                    <p style="font-size: 0.86rem; color: var(--text); margin-bottom: 10px;">
                        Pelajari rancangan pseudocode algoritma kasir dengan diskon bertingkat di bawah ini:
                    </p>
                    <div class="learn-code-block">
                        <span style="color: #94a3b8;">// DEKLARASI VARIABEL</span><br>
                        <strong>VAR</strong> total_belanja, diskon, bayar_akhir : <em>Real</em><br><br>
                        <strong>ALGORITMA:</strong><br>
                        <strong>READ</strong> (total_belanja)<br>
                        <strong>IF</strong> total_belanja &gt;= 200000 <strong>THEN</strong><br>
                        &nbsp;&nbsp;&nbsp;&nbsp;diskon &larr; 0.15 * total_belanja<br>
                        <strong>ELSE IF</strong> total_belanja &gt;= 100000 <strong>THEN</strong><br>
                        &nbsp;&nbsp;&nbsp;&nbsp;diskon &larr; 0.05 * total_belanja<br>
                        <strong>ELSE</strong><br>
                        &nbsp;&nbsp;&nbsp;&nbsp;diskon &larr; 0<br>
                        <strong>ENDIF</strong><br>
                        bayar_akhir &larr; total_belanja - diskon<br>
                        <strong>WRITE</strong> ("Total yang harus dibayar: Rp ", bayar_akhir)
                    </div>
                `
            },
            {
                title: 'Jurus "Dry Run" & Trace Table: Menemukan Bug di Atas Kertas',
                badge: 'Langkah 7 dari 8 • Deteksi Bug Manual',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                contentHtml: `
                    <div class="learn-story-box">
                        <div class="story-avatar">📝</div>
                        <div class="story-text">
                            <strong>Apa itu Dry Run?</strong> Dry Run adalah teknik menguji alur logika program secara manual baris demi baris menggunakan pensil dan tabel pelacak (Trace Table) sebelum kode dijalankan di komputer. 
                            Ini adalah jurus ampuh untuk menemukan kesalahan logika (logic error) atau perulangan tanpa henti (infinite loop)!
                        </div>
                    </div>
                    <table class="learn-compare-table">
                        <thead>
                            <tr>
                                <th>Langkah / Baris</th>
                                <th>Variabel <code>cacah</code></th>
                                <th>Variabel <code>total</code></th>
                                <th>Kondisi <code>cacah &lt;= 3</code></th>
                                <th>Aksi yang Dilakukan</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Awal</td>
                                <td>1</td>
                                <td>0</td>
                                <td>1 &lt;= 3 (TRUE)</td>
                                <td>total = 0 + 10 = 10, cacah naik jadi 2</td>
                            </tr>
                            <tr>
                                <td>Loop 2</td>
                                <td>2</td>
                                <td>10</td>
                                <td>2 &lt;= 3 (TRUE)</td>
                                <td>total = 10 + 10 = 20, cacah naik jadi 3</td>
                            </tr>
                            <tr>
                                <td>Loop 3</td>
                                <td>3</td>
                                <td>20</td>
                                <td>3 &lt;= 3 (TRUE)</td>
                                <td>total = 20 + 10 = 30, cacah naik jadi 4</td>
                            </tr>
                            <tr>
                                <td>Loop 4</td>
                                <td>4</td>
                                <td>30</td>
                                <td>4 &lt;= 3 (FALSE)</td>
                                <td><strong>STOP!</strong> Loop berhenti, Output total = 30</td>
                            </tr>
                        </tbody>
                    </table>
                `
            },
            {
                title: 'Kuis Checkpoint Evaluasi: Menilai Output Pseudocode 🎯',
                badge: 'Langkah 8 dari 8 • Evaluasi Pemahaman',
                bloom: { code: 'C5', label: 'C5 • Mengevaluasi' },
                type: 'checkpoint',
                question: 'Perhatikan potongan pseudocode perulangan berikut:\n\nx = 1; y = 0\nWHILE x <= 4 DO\n    y = y + x\n    x = x + 1\nENDWHILE\nOUTPUT y\n\nBerapakah nilai akhir variabel y yang dicetak ke layar?',
                options: [
                    'Nilai y = 4',
                    'Nilai y = 10 (karena akumulasi penjumlahan: 1 + 2 + 3 + 4 = 10)',
                    'Nilai y = 0',
                    'Program mengalami error perulangan selamanya (infinite loop)'
                ],
                correctAnswer: 1,
                explanation: 'Tepat sekali! Pada setiap iterasi, nilai x ditambahkan ke y: Iterasi 1: y=1; Iterasi 2: y=3; Iterasi 3: y=6; Iterasi 4: y=10. Pada saat x bernilai 5, kondisi x <= 4 bernilai False dan program mencetak y = 10.'
            }
        ]
    },

    'office_tik': {
        id: 'office_tik',
        title: 'Jurus Sakti Aplikasi Perkantoran & Rumus Excel (TIK)',
        badge: 'Integrasi TIK & Analisis Data',
        icon: '📊',
        gameId: 'excel_dash',
        gameTitle: 'Excel Formula Dash',
        summary: 'Menguasai integrasi Mail Merge otomatis, logika Nested IF bertingkat, kolaborasi AND/OR, dan detektif data VLOOKUP vs XLOOKUP.',
        color: '#0284c7',
        slides: [
            {
                title: 'Ekosistem Aplikasi Perkantoran & Otomasi Kerja Terpadu',
                badge: 'Langkah 1 dari 8 • Integrasi TIK Modern',
                bloom: { code: 'C2', label: 'C2 • Memahami' },
                contentHtml: `
                    <div class="learn-story-box">
                        <div class="story-avatar">💼</div>
                        <div class="story-text">
                            <strong>Tuntutan Abad 21:</strong> Di lingkungan kantor modern, kamu tidak bekerja hanya dengan satu aplikasi terisolasi. Pengolah Kata (Word), Pengolah Lembar Kerja (Excel), dan Presentasi (PowerPoint) saling terhubung erat secara dinamis melalui fitur <strong>Object Linking and Embedding (OLE)</strong>.
                        </div>
                    </div>
                    <div class="learn-diagram-box">
                        <h4 style="color: #38bdf8; margin: 0 0 8px 0;">Contoh Integrasi Nyata:</h4>
                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.55; color: var(--text);">
                            • <strong>Tabel Keuangan:</strong> Dibuat dan dihitung di Excel, lalu dihubungkan (*linked*) ke laporan tahunan di Microsoft Word. Setiap kali angka di Excel diubah, laporan di Word otomatis terbarui!
                            <br>• <strong>Grafik Statistik:</strong> Grafik performa penjualan dari Excel disematkan ke slide PowerPoint untuk presentasi rapat dinas.
                        </p>
                    </div>
                `
            },
            {
                title: 'Jurus Sakti Mail Merge: 1.000 Surat Otomatis dalam 2 Menit',
                badge: 'Langkah 2 dari 8 • Keterampilan Produktivitas',
                bloom: { code: 'C3', label: 'C3 • Menerapkan' },
                contentHtml: `
                    <div class="learn-story-box">
                        <div class="story-avatar">💌</div>
                        <div class="story-text">
                            <strong>Tantangan Panitia:</strong> Sekolahmu menyelenggarakan lomba cerdas cermat dengan 500 peserta. Guru memintamu membuat piagam penghargaan dengan nama, sekolah, dan predikat yang berbeda-beda. Mengetik satu per satu butuh waktu berhari-hari!
                            <br>Dengan fitur <strong>Mail Merge (Surat Massal)</strong>, tugas itu selesai dalam <strong>2 menit</strong>!
                        </div>
                    </div>
                    <div class="pillar-grid-learn">
                        <div class="pillar-mini-card">
                            <div class="mini-icon">📄</div>
                            <strong>1. Master Template (Word)</strong>
                            <p>Desain surat atau sertifikat dengan field kosong yang disiapkan: <code>&laquo;Nama_Siswa&raquo;</code> dan <code>&laquo;Predikat&raquo;</code>.</p>
                        </div>
                        <div class="pillar-mini-card">
                            <div class="mini-icon">📊</div>
                            <strong>2. Data Source (Excel)</strong>
                            <p>Tabel spreadsheet rapi yang memuat kolom: No, Nama, Asal Sekolah, Nilai, dan Predikat Juara.</p>
                        </div>
                        <div class="pillar-mini-card">
                            <div class="mini-icon">⚡</div>
                            <strong>3. Finish &amp; Merge</strong>
                            <p>Klik 'Merge' untuk mencetak atau mengekspor ratusan dokumen sekaligus dalam hitungan detik tanpa satu pun kesalahan ketik!</p>
                        </div>
                    </div>
                `
            },
            {
                title: 'Logika Percabangan Excel: IF Tunggal vs IF Bertingkat (Nested IF)',
                badge: 'Langkah 3 dari 8 • Formula Logika',
                bloom: { code: 'C2', label: 'C2 • Memahami' },
                contentHtml: `
                    <p style="font-size: 0.86rem; color: var(--text); margin-bottom: 12px;">
                        Rumus logika dasar Excel memiliki 3 parameter argumen:
                        <br><code>=IF(Tes_Logika, Nilai_Jika_Benar, Nilai_Jika_Salah)</code>
                    </p>
                    <table class="learn-compare-table">
                        <thead>
                            <tr>
                                <th>Tipe Rumus IF</th>
                                <th>Contoh Sintaks Excel</th>
                                <th>Kapan Digunakan?</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>IF Tunggal</strong></td>
                                <td><code>=IF(B2>=80, "TUNTAS", "REMEDIAL")</code></td>
                                <td>Hanya ada 2 kemungkinan hasil (Lulus / Tidak Lulus).</td>
                            </tr>
                            <tr>
                                <td><strong>Nested IF (IF Bertingkat)</strong></td>
                                <td><code>=IF(B2>=90, "A", IF(B2>=80, "B", IF(B2>=70, "C", "D")))</code></td>
                                <td>Ada lebih dari 2 kategori hasil (misal predikat nilai: A, B, C, D).</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="sim-note" style="margin-top: 10px;">
                        💡 <strong>Kunci Sukses Menulis Nested IF:</strong> Jumlah tanda kurung tutup di akhir rumus harus persis sama dengan jumlah kata <code>IF</code> yang kamu buka!
                    </div>
                `
            },
            {
                title: 'Laboratorium Simulator Formula Excel: Coba Ubah Nilai Siswa!',
                badge: 'Langkah 4 dari 8 • Simulator Interaktif',
                bloom: { code: 'C3', label: 'C3 • Menerapkan' },
                type: 'simulator',
                simulatorId: 'excel_sim',
                contentHtml: `
                    <div class="excel-mock-card">
                        <div class="excel-formula-bar">
                            <span class="excel-fx">fx</span>
                            <input type="text" readonly value='=IF(B2>=80, "TUNTAS KKM", "REMEDIAL")' class="excel-fx-input">
                        </div>
                        <table class="excel-mini-table">
                            <thead>
                                <tr>
                                    <th>A (Nama Siswa)</th>
                                    <th>B (Nilai Ujian)</th>
                                    <th>C (Status Kelulusan - Rumus IF)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Ahmad Fauzan</td>
                                    <td>
                                        <input type="number" id="excel-sim-score" min="0" max="100" value="85" oninput="updateExcelSimulator(this.value)" class="excel-input-cell">
                                    </td>
                                    <td id="excel-sim-result" class="excel-status-cell cell-pass">
                                        ✅ TUNTAS KKM
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="sim-note" style="margin-top: 10px;">
                            💡 Ubah angka di sel B2 (misal ke 70 atau 95). Amati bagaimana sel C otomatis beradaptasi tanpa perlu kamu ketik ulang!
                        </div>
                    </div>
                `
            },
            {
                title: 'Kolaborasi Logika Majemuk: Rumus AND vs OR',
                badge: 'Langkah 5 dari 8 • Logika Ganda',
                bloom: { code: 'C3', label: 'C3 • Menerapkan' },
                contentHtml: `
                    <table class="learn-compare-table">
                        <thead>
                            <tr>
                                <th>Fungsi Logika</th>
                                <th>Aturan Nilai Kebenaran</th>
                                <th>Contoh Kasus Sekolah</th>
                                <th>Sintaks Rumus Excel</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong style="color: #38bdf8;">AND</strong></td>
                                <td>Hanya bernilai TRUE jika <strong>SEMUA SYARAT</strong> terpenuhi.</td>
                                <td>Syarat beasiswa: Nilai Rata-rata $ge 85$ <strong>DAN</strong> Kehadiran $ge 90%$.</td>
                                <td><code>=IF(AND(B2>=85, C2>=90), "Lolos", "Gagal")</code></td>
                            </tr>
                            <tr>
                                <td><strong style="color: #facc15;">OR</strong></td>
                                <td>Bernilai TRUE jika <strong>SALAH SATU SYARAT SAJA</strong> sudah terpenuhi.</td>
                                <td>Syarat penghargaan: Juara Akademik <strong>ATAU</strong> Juara Olahraga.</td>
                                <td><code>=IF(OR(D2="Juara 1", E2="Juara 1"), "Dapat Trofi", "Standar")</code></td>
                            </tr>
                        </tbody>
                    </table>
                `
            },
            {
                title: 'Detektif Data: Jurus Pencarian Tabel VLOOKUP vs XLOOKUP',
                badge: 'Langkah 6 dari 8 • Rumus Lookup Profesional',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                contentHtml: `
                    <div class="learn-code-block">
                        =VLOOKUP(nilai_kunci, tabel_referensi, nomor_kolom_ambil, [pencarian_eksak])<br><br>
                        Contoh Riil: =VLOOKUP("NISN-101", A2:D100, 2, FALSE)
                    </div>
                    <div class="learn-diagram-box">
                        <h4 style="color: #34d399; margin: 0 0 8px 0;">Mengapa Parameter ke-4 Wajib Diisi FALSE (atau 0)?</h4>
                        <p style="margin: 0; font-size: 0.85rem; line-height: 1.55; color: var(--text);">
                            • <strong>FALSE / 0 (Exact Match):</strong> Mencari data yang persis 100%. Jika kode tidak ditemukan, Excel akan menampilkan error <code>#N/A</code>.
                            <br>• <strong>TRUE / 1 (Approximate Match):</strong> Mencari data perkiraan terdekat. Berbahaya untuk data sensitif seperti NISN atau nomor induk pegawai!
                            <br><br>
                            ⭐ <strong>Kelebihan XLOOKUP (Modern Excel 365):</strong> Tidak dibatasi oleh urutan kolom kiri-ke-kanan, dan default pencariannya sudah otomatis Exact Match!
                        </p>
                    </div>
                `
            },
            {
                title: 'Rumus Agregasi Statistik Bersyarat: COUNTIF & SUMIF Guru',
                badge: 'Langkah 7 dari 8 • Rekapitulasi Data Otomatis',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                contentHtml: `
                    <table class="learn-compare-table">
                        <thead>
                            <tr>
                                <th>Nama Rumus</th>
                                <th>Kegunaan Utama</th>
                                <th>Contoh Sintaks Nyata Guru</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>COUNTIF</code></td>
                                <td>Menghitung <strong>banyaknya siswa</strong> yang memenuhi kriteria tertentu.</td>
                                <td><code>=COUNTIF(C2:C37, ">=80")</code><br><em>Menghitung berapa siswa yang berhasil tuntas KKM.</em></td>
                            </tr>
                            <tr>
                                <td><code>SUMIF</code></td>
                                <td>Menjumlahkan <strong>total nilai angka</strong> khusus untuk kategori kriteria tertentu.</td>
                                <td><code>=SUMIF(B2:B37, "Laki-laki", D2:D37)</code><br><em>Menjumlahkan total nilai khusus siswa laki-laki.</em></td>
                            </tr>
                            <tr>
                                <td><code>AVERAGEIF</code></td>
                                <td>Menghitung <strong>nilai rata-rata</strong> khusus bagi siswa yang memenuhi syarat kriteria.</td>
                                <td><code>=AVERAGEIF(B2:B37, "Perempuan", D2:D37)</code></td>
                            </tr>
                        </tbody>
                    </table>
                `
            },
            {
                title: 'Kuis Checkpoint Evaluasi: Menilai Formula VLOOKUP 🎯',
                badge: 'Langkah 8 dari 8 • Evaluasi Pemahaman Kasus',
                bloom: { code: 'C5', label: 'C5 • Mengevaluasi' },
                type: 'checkpoint',
                question: 'Seorang staf tata usaha mencari nama siswa berdasarkan NISN menggunakan rumus: =VLOOKUP("1024", A2:C50, 2, FALSE). Pada tabel A2:C50, Kolom A memuat NISN, Kolom B memuat Nama Siswa, dan Kolom C memuat Kelas. Namun rumus menghasilkan error #N/A. Mengapa hal ini bisa terjadi?',
                options: [
                    'Angka indeks kolom 2 salah, seharusnya diisi dengan nomor kolom 3',
                    'Kode NISN "1024" memang tidak terdaftar dalam jangkauan sel kolom A2:A50 tabel referensi',
                    'Parameter FALSE menyebabkan Excel tidak bisa membaca teks huruf nama siswa',
                    'Rumus VLOOKUP hanya bisa digunakan pada hari kerja sekolah'
                ],
                correctAnswer: 1,
                explanation: 'Tepat sekali! Pesan error #N/A (Not Available) pada rumus VLOOKUP dengan parameter Exact Match (FALSE) mengindikasikan bahwa kunci yang dicari ("1024") tidak ada di dalam kolom pertama tabel data acuan.'
            }
        ]
    },

    'pseudocode_ipo': {
        id: 'pseudocode_ipo',
        title: 'Logika Pseudocode & Mesin IPO',
        badge: 'ATP 4 & 5 • Algoritma Dasar',
        icon: '🧩',
        gameId: 'robocode',
        gameTitle: 'RoboCode: Alur Logika Pemrograman',
        summary: 'Dasar alur komputasi programmer untuk siswa SMA: Input, Proses Logika, dan Output. Disertai contoh Pseudocode sederhana.',
        color: '#3b82f6',
        slides: [
            {
                title: 'Apa itu Mesin IPO?',
                badge: 'Langkah 1 dari 6 • Konsep Dasar Komputasi',
                bloom: { code: 'C2', label: 'C2 • Memahami' },
                contentHtml: `
                    <div class="learn-story-box">
                        <div class="story-avatar">🤖</div>
                        <div class="story-text">
                            <strong>Analogi Pabrik Roti:</strong> Komputer bekerja persis seperti pabrik! Kamu butuh bahan baku seperti terigu & telur (<strong>Input</strong>), lalu oven untuk memanggang & mencampur (<strong>Process</strong>), dan hasil akhirnya adalah roti lezat (<strong>Output</strong>).
                        </div>
                    </div>
                    <div class="learn-diagram-box" style="text-align: center;">
                        <h4 style="color: #60a5fa; margin: 0 0 12px 0;">Siklus I-P-O (Input - Process - Output)</h4>
                        <div style="display: flex; justify-content: space-around; align-items: center; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 10px;">
                            <div style="text-align:center;">
                                <div style="font-size: 2rem;">⌨️</div>
                                <strong>INPUT</strong><br><span style="font-size: 0.75rem;">(Data Masuk)</span>
                            </div>
                            <div style="font-size: 1.5rem;">➔</div>
                            <div style="text-align:center;">
                                <div style="font-size: 2rem;">⚙️</div>
                                <strong>PROCESS</strong><br><span style="font-size: 0.75rem;">(Pengolahan / Rumus)</span>
                            </div>
                            <div style="font-size: 1.5rem;">➔</div>
                            <div style="text-align:center;">
                                <div style="font-size: 2rem;">🖥️</div>
                                <strong>OUTPUT</strong><br><span style="font-size: 0.75rem;">(Hasil / Layar)</span>
                            </div>
                        </div>
                    </div>
                `
            },
            {
                title: 'Mengenal Pseudocode',
                badge: 'Langkah 2 dari 6 • Bahasa Algoritma',
                bloom: { code: 'C1', label: 'C1 • Mengingat' },
                contentHtml: `
                    <p style="font-size: 0.9rem; color: var(--text);">
                        <strong>Pseudocode (Kode Semu)</strong> adalah cara menuliskan algoritma (langkah-langkah program) menggunakan bahasa sehari-hari yang mudah dipahami manusia, sebelum diterjemahkan ke bahasa pemrograman asli (seperti Python, C++, atau Java).
                    </p>
                    <table class="learn-compare-table">
                        <thead>
                            <tr>
                                <th>Istilah Pseudocode</th>
                                <th>Artinya</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><code>READ / BACA</code></td>
                                <td>Mengambil data dari pengguna (Input).</td>
                            </tr>
                            <tr>
                                <td><code>SET / HITUNG</code></td>
                                <td>Melakukan proses matematika atau memasukkan nilai (Process).</td>
                            </tr>
                            <tr>
                                <td><code>IF - THEN - ELSE</code></td>
                                <td>Jika ada syarat tertentu, maka lakukan ini, selain itu lakukan yang lain (Percabangan).</td>
                            </tr>
                            <tr>
                                <td><code>PRINT / TULIS</code></td>
                                <td>Menampilkan hasil ke layar (Output).</td>
                            </tr>
                        </tbody>
                    </table>
                `
            },
            {
                title: 'Contoh 1: Pseudocode Penjumlahan Sederhana',
                badge: 'Langkah 3 dari 6 • Studi Kasus Pemula',
                bloom: { code: 'C3', label: 'C3 • Menerapkan' },
                contentHtml: `
                    <div class="learn-diagram-box">
                        <h4 style="color: #60a5fa; margin: 0 0 8px 0;">Menghitung Luas Persegi Panjang</h4>
                        <p style="font-size: 0.85rem; margin-bottom: 8px;">Misalkan kita membuat program kalkulator luas untuk pelajaran Matematika Kelas X.</p>
                        <div class="learn-code-block" style="font-family: monospace; font-size: 0.9rem;">
                            <strong>PROGRAM</strong> Hitung_Luas<br>
                            <span style="color: #94a3b8;">// Bagian Deklarasi</span><br>
                            VAR panjang, lebar, luas: INTEGER<br><br>
                            
                            <span style="color: #94a3b8;">// Bagian Algoritma (IPO)</span><br>
                            <strong>ALGORITMA:</strong><br>
                            1. <span style="color: #34d399;">READ</span> panjang <span style="color: #94a3b8;">// (Input)</span><br>
                            2. <span style="color: #34d399;">READ</span> lebar <span style="color: #94a3b8;">// (Input)</span><br>
                            3. <span style="color: #facc15;">SET</span> luas = panjang * lebar <span style="color: #94a3b8;">// (Process)</span><br>
                            4. <span style="color: #60a5fa;">PRINT</span> "Luasnya adalah: ", luas <span style="color: #94a3b8;">// (Output)</span><br>
                            <strong>END PROGRAM</strong>
                        </div>
                    </div>
                `
            },
            {
                title: 'Contoh 2: Pseudocode dengan Percabangan (IF-THEN)',
                badge: 'Langkah 4 dari 6 • Logika Percabangan',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                contentHtml: `
                    <div class="learn-diagram-box">
                        <h4 style="color: #60a5fa; margin: 0 0 8px 0;">Penentu Kelulusan KKM Siswa</h4>
                        <p style="font-size: 0.85rem; margin-bottom: 8px;">Program ini akan mengecek apakah nilai siswa di atas 75 atau tidak.</p>
                        <div class="learn-code-block" style="font-family: monospace; font-size: 0.9rem;">
                            <strong>PROGRAM</strong> Cek_Lulus<br>
                            VAR nilai: INTEGER<br><br>
                            
                            <strong>ALGORITMA:</strong><br>
                            1. <span style="color: #34d399;">READ</span> nilai<br>
                            2. <span style="color: #facc15;">IF</span> (nilai >= 75) <span style="color: #facc15;">THEN</span><br>
                            3. &nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #60a5fa;">PRINT</span> "LULUS!"<br>
                            4. <span style="color: #facc15;">ELSE</span><br>
                            5. &nbsp;&nbsp;&nbsp;&nbsp;<span style="color: #60a5fa;">PRINT</span> "REMEDIAL"<br>
                            6. <span style="color: #facc15;">END IF</span><br>
                        </div>
                        <p style="font-size: 0.85rem; margin-top: 8px; color: var(--text-muted);">Logika ini sangat sering dipakai pada aplikasi sistem nilai raport online seperti E-Raport!</p>
                    </div>
                `
            },
            {
                title: 'Laboratorium Mini: Mesin IPO Interaktif',
                badge: 'Langkah 5 dari 6 • Simulasi Interaktif',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                type: 'simulator',
                simulatorId: 'ipo_machine',
                contentHtml: `
                    <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
                        Geser nilai input (Nilai Ujian) di bawah, dan perhatikan bagaimana Proses Logika merespons untuk menghasilkan Output! (KKM = 80)
                    </p>
                    <div style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="margin-bottom: 15px;">
                            <strong>📥 INPUT:</strong><br>
                            <input type="range" min="0" max="100" value="70" style="width: 100%; margin-top: 10px;" oninput="updateIpoSimulator(this.value)">
                            <div style="text-align: right; font-weight: bold; font-size: 1.2rem; color: #60a5fa;">Nilai: <span id="ipo-slider-val">70</span></div>
                        </div>
                        <div style="margin-bottom: 15px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; font-family: monospace;">
                            <strong>⚙️ PROCESS (Logika):</strong><br>
                            IF (Nilai >= 80) THEN<br>
                            &nbsp;&nbsp;Status = "TUNTAS KKM"<br>
                            ELSE<br>
                            &nbsp;&nbsp;Status = "PERLU REMEDIAL"<br>
                            END IF
                        </div>
                        <div style="font-size: 1.1rem;">
                            <strong>🖥️ OUTPUT:</strong><br>
                            <span id="code-val-out" style="color: #f43f5e; font-weight: 800; display: block; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px; text-align: center; margin-top: 5px;">"PERLU REMEDIAL 📚"</span>
                        </div>
                    </div>
                `
            },
            {
                title: 'Kuis Checkpoint: Analisis Kode 🎯',
                badge: 'Langkah 6 dari 6 • Evaluasi Pemahaman',
                bloom: { code: 'C5', label: 'C5 • Mengevaluasi' },
                type: 'checkpoint',
                question: 'Perhatikan Pseudocode berikut:\n1. READ harga_barang\n2. READ jumlah_beli\n3. SET total = harga_barang * jumlah_beli\n4. PRINT total\n\nPada baris ke-3, tahap apakah yang sedang terjadi di mesin IPO?',
                options: [
                    'Output (Mencetak hasil belanja ke layar)',
                    'Input (Memasukkan data harga dari keyboard)',
                    'Process (Mengolah data dan menghitung total harga)',
                    'Storage (Menyimpan data selamanya di hardisk)'
                ],
                correctAnswer: 2,
                explanation: 'Sempurna! Baris ke-3 (SET total = harga_barang * jumlah_beli) adalah tahap PROCESS karena komputer sedang melakukan operasi matematika.'
            }
        ]
    },

    'mini_games_logic': {
        id: 'mini_games_logic',
        title: 'Bedah Algoritma Mini Games',
        badge: 'Pengayaan • Logika Game',
        icon: '🎮',
        gameId: 'hoax_buster',
        gameTitle: 'Detektif Hoax Buster (30s Speedrun)',
        summary: 'Mengupas rahasia komputasi di balik Arena Mini Game: Bagaimana Bubble Sort, LIFO/FIFO, dan sistem poin dirancang.',
        color: '#f59e0b',
        slides: [
            {
                title: 'Rahasia Algoritma Bubble Sort di Game Balap Balok',
                badge: 'Bedah Game 1',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                contentHtml: `
                    <div class="learn-story-box">
                        <div class="story-avatar">🏎️</div>
                        <div class="story-text">
                            Di permainan "Algoritma Balap: Urutkan Balok Cepat!", kamu harus mengurutkan angka acak dari terkecil ke terbesar. Komputer menggunakan cara bernama <strong>Bubble Sort</strong> untuk melakukannya secara otomatis!
                        </div>
                    </div>
                    <div class="learn-diagram-box">
                        <h4 style="color: #fbbf24; margin: 0 0 8px 0;">Pseudocode Bubble Sort:</h4>
                        <div class="learn-code-block" style="font-family: monospace; font-size: 0.85rem;">
                            FOR i = 1 TO jumlah_balok<br>
                            &nbsp;&nbsp;FOR j = 1 TO (jumlah_balok - i)<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;IF balok[j] > balok[j+1] THEN<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TUKAR(balok[j], balok[j+1])<br>
                            &nbsp;&nbsp;&nbsp;&nbsp;END IF<br>
                            &nbsp;&nbsp;END FOR<br>
                            END FOR
                        </div>
                    </div>
                `
            },
            {
                title: 'Dapur LIFO vs FIFO di Kitchen Express',
                badge: 'Bedah Game 2',
                bloom: { code: 'C4', label: 'C4 • Menganalisis' },
                contentHtml: `
                    <p style="font-size: 0.9rem; color: var(--text);">
                        Di "Stack vs Queue Kitchen Express", kamu bermain sebagai koki yang melayani pesanan. Tahukah kamu bahwa ini adalah simulasi manajemen memori komputer?
                    </p>
                    <table class="learn-compare-table">
                        <thead>
                            <tr>
                                <th>Struktur (Konsep)</th>
                                <th>Prinsip Kerja di Komputer</th>
                                <th>Contoh Nyata di Game</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><strong>Queue (Antrean)</strong></td>
                                <td><strong>FIFO</strong> (First In, First Out)</td>
                                <td>Pelanggan yang pesan pertama, harus dilayani paling pertama. Komputer menggunakannya untuk antrean Print Dokumen.</td>
                            </tr>
                            <tr>
                                <td><strong>Stack (Tumpukan)</strong></td>
                                <td><strong>LIFO</strong> (Last In, First Out)</td>
                                <td>Tumpukan piring kotor. Piring terakhir yang ditaruh di atas adalah piring pertama yang dicuci. Digunakan komputer untuk fitur tombol "Undo" (Ctrl+Z).</td>
                            </tr>
                        </tbody>
                    </table>
                `
            },
            {
                title: 'Logika Sistem Skor (Combo & Streak multiplier)',
                badge: 'Bedah Game 3',
                bloom: { code: 'C3', label: 'C3 • Menerapkan' },
                contentHtml: `
                    <div class="learn-diagram-box">
                        <h4 style="color: #fbbf24; margin: 0 0 8px 0;">Bagaimana Game Menghitung Poin Combo?</h4>
                        <p style="font-size: 0.85rem; margin-bottom: 8px;">Semakin banyak jawaban benar berturut-turut, skor (streak) kamu akan dikalikan!</p>
                        <div class="learn-code-block" style="font-family: monospace; font-size: 0.85rem;">
                            <span style="color: #34d399;">IF</span> jawaban == BENAR <span style="color: #34d399;">THEN</span><br>
                            &nbsp;&nbsp;streak = streak + 1<br>
                            &nbsp;&nbsp;poin_tambahan = 10 * streak<br>
                            &nbsp;&nbsp;total_skor = total_skor + poin_tambahan<br>
                            <span style="color: #f43f5e;">ELSE</span><br>
                            &nbsp;&nbsp;streak = 0 <span style="color: #94a3b8;">// Combo putus!</span><br>
                            &nbsp;&nbsp;total_skor = total_skor - 5<br>
                            <span style="color: #34d399;">END IF</span>
                        </div>
                    </div>
                `
            }
        ]
    }
};

window.LEARNING_MODULES = LEARNING_MODULES;

// ============================================================
// 🎮 CONTROLLER RUANG BELAJAR INTERAKTIF
// ============================================================

let currentLearningTopic = null;
let currentSlideIndex = 0;

/**
 * Membuka modul materi pembelajaran tertentu
 */
function openLearningTopic(topicId) {
    if (typeof sfxClick === 'function') sfxClick();
    const topic = LEARNING_MODULES[topicId];
    if (!topic) return;

    currentLearningTopic = topic;
    currentSlideIndex = 0;

    // Switch screen ke 'learn'
    if (typeof switchScreen === 'function') {
        switchScreen('learn');
    }

    // Toggle view: hide catalog, show slides
    const catView = document.getElementById('learn-catalog-view');
    const slideView = document.getElementById('learn-slide-view');
    if (catView) catView.style.display = 'none';
    if (slideView) slideView.style.display = 'block';

    renderLearningSlide();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.openLearningTopic = openLearningTopic;

/**
 * Keluar dari ruang belajar dan kembali ke beranda
 */
function closeLearningHub() {
    if (typeof sfxClick === 'function') sfxClick();
    
    // Tampilkan kembali katalog, sembunyikan slide
    const catView = document.getElementById('learn-catalog-view');
    const slideView = document.getElementById('learn-slide-view');
    if (catView && slideView) {
        catView.style.display = 'block';
        slideView.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        if (typeof switchScreen === 'function') {
            switchScreen('home');
        }
    }
}
window.closeLearningHub = closeLearningHub;

/**
 * Render slide materi aktif
 */
function renderLearningSlide() {
    const topic = currentLearningTopic;
    if (!topic) return;

    const slide = topic.slides[currentSlideIndex];
    if (!slide) return;

    const totalSlides = topic.slides.length;
    const progressPct = Math.round(((currentSlideIndex + 1) / totalSlides) * 100);

    // Update Header
    const topicTitleEl = document.getElementById('learn-topic-title');
    const topicBadgeEl = document.getElementById('learn-topic-badge');
    const progressFillEl = document.getElementById('learn-progress-fill');
    const progressTextEl = document.getElementById('learn-progress-text');

    if (topicTitleEl) topicTitleEl.textContent = `${topic.icon} ${topic.title}`;
    if (topicBadgeEl) topicBadgeEl.textContent = topic.badge;
    if (progressFillEl) progressFillEl.style.width = `${progressPct}%`;
    if (progressTextEl) progressTextEl.textContent = `Slide ${currentSlideIndex + 1} dari ${totalSlides}`;

    // Update Card Body
    const cardTitleEl = document.getElementById('learn-card-title');
    const cardBadgeEl = document.getElementById('learn-card-badge');
    const cardBodyEl = document.getElementById('learn-card-body');

    if (cardTitleEl) cardTitleEl.textContent = slide.title;
    if (cardBadgeEl) {
        const bloomHtml = slide.bloom ? `<span class="bloom-badge bloom-${slide.bloom.code.toLowerCase()}">${escapeHtml(slide.bloom.label)}</span>` : '';
        cardBadgeEl.innerHTML = `${bloomHtml}<span class="slide-step-badge">${escapeHtml(slide.badge || `Langkah ${currentSlideIndex + 1} dari ${totalSlides}`)}</span>`;
    }

    if (slide.type === 'checkpoint') {
        // Render checkpoint quiz card
        cardBodyEl.innerHTML = `
            <div class="learn-checkpoint-wrapper">
                <div class="checkpoint-qtext">${escapeHtml(slide.question)}</div>
                <div class="checkpoint-options-grid">
                    ${slide.options.map((opt, idx) => `
                        <button type="button" class="checkpoint-opt-btn" id="chk-opt-${idx}" onclick="checkCheckpointAnswer(${idx})">
                            <span class="chk-opt-letter">${String.fromCharCode(65 + idx)}</span>
                            <span class="chk-opt-text">${escapeHtml(opt)}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="checkpoint-feedback" id="chk-feedback-box" style="display: none;"></div>
            </div>
        `;
    } else {
        cardBodyEl.innerHTML = slide.contentHtml;
        // Inisialisasi simulator jika ada
        if (slide.simulatorId === 'bubble_sort_sim') {
            setTimeout(initBubbleSortSim, 50);
        }
    }

    // Update Nav Buttons
    const prevBtn = document.getElementById('btn-learn-prev');
    const nextBtn = document.getElementById('btn-learn-next');

    if (prevBtn) {
        prevBtn.style.visibility = currentSlideIndex === 0 ? 'hidden' : 'visible';
    }

    if (nextBtn) {
        nextBtn.style.display = 'inline-flex';
        if (currentSlideIndex === totalSlides - 1) {
            nextBtn.innerHTML = `<span>Selesai Belajar &amp; Coba Kuis 🎯</span>`;
            nextBtn.onclick = () => finishLearningTopic(topic.id);
        } else {
            nextBtn.innerHTML = `<span>Lanjut Langkah Berikutnya ➔</span>`;
            nextBtn.onclick = nextLearnSlide;
        }
    }
}
window.renderLearningSlide = renderLearningSlide;

function nextLearnSlide() {
    if (!currentLearningTopic) return;
    if (currentSlideIndex < currentLearningTopic.slides.length - 1) {
        if (typeof sfxClick === 'function') sfxClick();
        currentSlideIndex++;
        renderLearningSlide();
    }
}
window.nextLearnSlide = nextLearnSlide;

function prevLearnSlide() {
    if (!currentLearningTopic) return;
    if (currentSlideIndex > 0) {
        if (typeof sfxClick === 'function') sfxClick();
        currentSlideIndex--;
        renderLearningSlide();
    }
}
window.prevLearnSlide = prevLearnSlide;

function finishLearningTopic(topicId) {
    if (typeof sfxSuccess === 'function') sfxSuccess();
    if (typeof confetti === 'function') confetti({ particleCount: 120, spread: 80 });

    const cardTitleEl = document.getElementById('learn-card-title');
    const cardBadgeEl = document.getElementById('learn-card-badge');
    const cardBodyEl = document.getElementById('learn-card-body');
    const prevBtn = document.getElementById('btn-learn-prev');
    const nextBtn = document.getElementById('btn-learn-next');

    if (cardTitleEl) cardTitleEl.textContent = `🎉 Selamat! Kamu Tuntas Mempelajari Materi Ini!`;
    if (cardBadgeEl) cardBadgeEl.innerHTML = `<span class="bloom-badge bloom-c6">C6 • Penguasaan Konsep Tuntas</span>`;
    if (prevBtn) prevBtn.style.visibility = 'hidden';
    if (nextBtn) nextBtn.style.display = 'none';

    const topic = currentLearningTopic;
    const gameId = topic ? topic.gameId : 'hoax_buster';
    const gameTitle = topic ? topic.gameTitle : 'Mini Game Ice Breaking';

    if (cardBodyEl) {
        cardBodyEl.innerHTML = `
            <div class="learn-completion-card">
                <div class="completion-trophy">🏆</div>
                <h3 class="completion-title">Selamat Telah Menyelesaikan: <em>${escapeHtml(topic ? topic.title : '')}</em></h3>
                <p class="completion-desc">
                    Kamu telah melalui alur berpikir komputasional dari mengingat konsep (C1), memahami analogi (C2), 
                    mencoba simulator hands-on (C3), menganalisis kasus (C4), hingga mengevaluasi jawaban (C5)!
                </p>

                <div class="completion-choices-grid">
                    <div class="completion-choice-box" onclick="closeLearningHub(); if (typeof launchMiniGame === 'function') { openMiniGamesHub(); launchMiniGame('${gameId}'); }">
                        <div class="choice-icon-big">🎮</div>
                        <h4>Mainkan Mini Game (Ice Breaking)</h4>
                        <p>Segarkan pikiran dengan game: <strong>${escapeHtml(gameTitle)}</strong>!</p>
                        <button type="button" class="btn-completion-act btn-game-act">Mainkan Game ➔</button>
                    </div>

                    <div class="completion-choice-box" onclick="closeLearningHub(); if (typeof initiateQuiz === 'function') initiateQuiz();">
                        <div class="choice-icon-big">🎯</div>
                        <h4>Uji di Kuis Evaluasi</h4>
                        <p>Buktikan pemahamanmu di kuis interaktif dengan timer dan penilaian otomatis!</p>
                        <button type="button" class="btn-completion-act btn-quiz-act">Mulai Kuis ➔</button>
                    </div>
                </div>

                <div style="margin-top: 18px; text-align: center;">
                    <button type="button" class="btn-completion-home" onclick="closeLearningHub()">
                        ← Kembali ke Katalog Materi Beranda
                    </button>
                </div>
            </div>
        `;
    }
}
window.finishLearningTopic = finishLearningTopic;

/**
 * Mengecek jawaban kuis checkpoint interaktif
 */
function checkCheckpointAnswer(selectedIdx) {
    if (!currentLearningTopic) return;
    const slide = currentLearningTopic.slides[currentSlideIndex];
    if (!slide || slide.type !== 'checkpoint') return;

    const feedbackEl = document.getElementById('chk-feedback-box');
    const buttons = document.querySelectorAll('.checkpoint-opt-btn');

    buttons.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === slide.correctAnswer) {
            btn.classList.add('btn-chk-correct');
        } else if (idx === selectedIdx) {
            btn.classList.add('btn-chk-wrong');
        }
    });

    if (selectedIdx === slide.correctAnswer) {
        if (typeof sfxCorrect === 'function') sfxCorrect();
        if (typeof confettiExplosion === 'function') confettiExplosion();
        feedbackEl.className = 'checkpoint-feedback feedback-success';
        feedbackEl.innerHTML = `
            <div style="font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">🎉 JAWABANMU TEPAT SEKALI!</div>
            <div>${escapeHtml(slide.explanation)}</div>
        `;
    } else {
        if (typeof sfxWrong === 'function') sfxWrong();
        feedbackEl.className = 'checkpoint-feedback feedback-error';
        feedbackEl.innerHTML = `
            <div style="font-weight: 800; font-size: 0.95rem; margin-bottom: 4px;">💡 Sedikit Lagi Tepat!</div>
            <div>${escapeHtml(slide.explanation)}</div>
        `;
    }
    feedbackEl.style.display = 'block';
}
window.checkCheckpointAnswer = checkCheckpointAnswer;

// ============================================================
// 🛠️ SIMULATOR 1: STACK & QUEUE
// ============================================================
let simStackItems = ['Piring #1 (Bawah)', 'Piring #2 (Tengah)'];
let simQueueItems = ['Siswa A (Depan)', 'Siswa B'];

function renderSimStack() {
    const shelf = document.getElementById('sim-stack-shelf');
    const status = document.getElementById('stack-sim-status');
    if (!shelf) return;
    shelf.innerHTML = simStackItems.map((item, idx) => `
        <div class="stack-plate plate-${(idx % 4) + 1}">${escapeHtml(item)} ${idx === simStackItems.length - 1 ? '⬅️ [PUNCAK]' : ''}</div>
    `).join('');
    if (status) {
        status.textContent = simStackItems.length > 0 
            ? `Tumpukan berisi ${simStackItems.length} piring. Ambil (Pop) akan mengambil: "${simStackItems[simStackItems.length - 1]}"!`
            : 'Tumpukan kosong! Taruh piring baru dengan tombol Push.';
    }
}

function simStackPush() {
    if (typeof sfxClick === 'function') sfxClick();
    if (simStackItems.length >= 5) {
        alert('Tumpukan sudah maksimal 5 piring agar tidak jatuh!');
        return;
    }
    simStackItems.push(`Piring #${simStackItems.length + 1} (Baru)`);
    renderSimStack();
}
window.simStackPush = simStackPush;

function simStackPop() {
    if (typeof sfxClick === 'function') sfxClick();
    if (simStackItems.length === 0) {
        alert('Tumpukan sudah kosong!');
        return;
    }
    simStackItems.pop();
    renderSimStack();
}
window.simStackPop = simStackPop;

function renderSimQueue() {
    const lane = document.getElementById('sim-queue-lane');
    const status = document.getElementById('queue-sim-status');
    if (!lane) return;
    lane.innerHTML = simQueueItems.map((item, idx) => `
        <span class="queue-token ${idx === 0 ? 'token-front' : ''}">${escapeHtml(item)} ${idx === 0 ? '⬅️ [DEPAN]' : ''}</span>
    `).join('');
    if (status) {
        status.textContent = simQueueItems.length > 0 
            ? `Antrean: ${simQueueItems.length} orang. Layani (Dequeue) akan melayani: "${simQueueItems[0]}"!`
            : 'Antrean kosong! Masukkan orang baru dengan tombol Enqueue.';
    }
}

function simQueueEnqueue() {
    if (typeof sfxClick === 'function') sfxClick();
    if (simQueueItems.length >= 5) {
        alert('Antrean sudah penuh maksimal 5 orang!');
        return;
    }
    const names = ['Siswa C', 'Siswa D', 'Siswa E', 'Siswa F'];
    const nextName = names[simQueueItems.length - 2] || `Siswa #${simQueueItems.length + 1}`;
    simQueueItems.push(nextName);
    renderSimQueue();
}
window.simQueueEnqueue = simQueueEnqueue;

function simQueueDequeue() {
    if (typeof sfxClick === 'function') sfxClick();
    if (simQueueItems.length === 0) {
        alert('Antrean sudah kosong!');
        return;
    }
    simQueueItems.shift(); // First In First Out
    renderSimQueue();
}
window.simQueueDequeue = simQueueDequeue;

// ============================================================
// 🛠️ SIMULATOR 2: BUBBLE SORT VISUALIZER
// ============================================================
let bubbleBars = [5, 2, 8, 1, 4];
let sortI = 0;
let sortJ = 0;
let isSortFinished = false;

function initBubbleSortSim() {
    bubbleBars = [5, 2, 8, 1, 4];
    sortI = 0;
    sortJ = 0;
    isSortFinished = false;
    renderBubbleSortBars(-1, -1);
    const statusEl = document.getElementById('sort-step-status');
    if (statusEl) {
        statusEl.innerHTML = `Status: Siap! Data acak <code>[5, 2, 8, 1, 4]</code>. Klik "Langkah Berikutnya" untuk mulai mengurutkan.`;
    }
}
window.initBubbleSortSim = initBubbleSortSim;

function resetBubbleSort() {
    if (typeof sfxClick === 'function') sfxClick();
    initBubbleSortSim();
}
window.resetBubbleSort = resetBubbleSort;

function renderBubbleSortBars(active1 = -1, active2 = -1) {
    const container = document.getElementById('sort-board-container');
    if (!container) return;

    container.innerHTML = bubbleBars.map((val, idx) => {
        let stateClass = '';
        if (isSortFinished) {
            stateClass = 'bar-sorted';
        } else if (idx === active1 || idx === active2) {
            stateClass = 'bar-comparing';
        }

        return `
            <div class="sort-bar-item ${stateClass}">
                <div class="bar-visual" style="height: ${val * 18 + 20}px;">
                    <span class="bar-val-text">${val}</span>
                </div>
                <div class="bar-idx-label">Index ${idx}</div>
            </div>
        `;
    }).join('');
}

function stepBubbleSort() {
    if (typeof sfxClick === 'function') sfxClick();
    if (isSortFinished) {
        alert('Semua angka sudah terurut rapi dari terkecil ke terbesar! Klik "Acak Ulang" jika ingin mencoba lagi.');
        return;
    }

    const n = bubbleBars.length;
    const statusEl = document.getElementById('sort-step-status');

    if (sortI < n - 1) {
        if (sortJ < n - sortI - 1) {
            const valLeft = bubbleBars[sortJ];
            const valRight = bubbleBars[sortJ + 1];

            renderBubbleSortBars(sortJ, sortJ + 1);

            if (valLeft > valRight) {
                // Swap
                bubbleBars[sortJ] = valRight;
                bubbleBars[sortJ + 1] = valLeft;
                if (statusEl) {
                    statusEl.innerHTML = `⚠️ <strong>TUKAR:</strong> Angka <code>${valLeft}</code> &gt; <code>${valRight}</code>, maka posisinya bertukar!`;
                }
            } else {
                if (statusEl) {
                    statusEl.innerHTML = `✅ <strong>TETAP:</strong> Angka <code>${valLeft}</code> &le; <code>${valRight}</code>, posisi sudah benar, tidak perlu ditukar.`;
                }
            }
            sortJ++;
        } else {
            sortJ = 0;
            sortI++;
            stepBubbleSort();
        }
    } else {
        isSortFinished = true;
        renderBubbleSortBars(-1, -1);
        if (typeof sfxSuccess === 'function') sfxSuccess();
        if (statusEl) {
            statusEl.innerHTML = `🎉 <strong>SELESAI!</strong> Seluruh balok angka telah tersusun rapi: <code>[${bubbleBars.join(', ')}]</code>.`;
        }
    }
}
window.stepBubbleSort = stepBubbleSort;

// ============================================================
// 🛠️ SIMULATOR 3: EXCEL FORMULA TESTER & IPO
// ============================================================
function updateExcelSimulator(val) {
    const score = Number(val) || 0;
    const resultCell = document.getElementById('excel-sim-result');
    if (!resultCell) return;

    if (score >= 80) {
        resultCell.className = 'excel-status-cell cell-pass';
        resultCell.textContent = '✅ TUNTAS KKM';
    } else {
        resultCell.className = 'excel-status-cell cell-fail';
        resultCell.textContent = '❌ REMEDIAL';
    }
}
window.updateExcelSimulator = updateExcelSimulator;

function updateIpoSimulator(val) {
    const score = Number(val) || 0;
    const sliderVal = document.getElementById('ipo-slider-val');
    const codeIn = document.getElementById('code-val-in');
    const codeOut = document.getElementById('code-val-out');

    if (sliderVal) sliderVal.textContent = score;
    if (codeIn) codeIn.textContent = score;

    if (codeOut) {
        if (score >= 80) {
            codeOut.style.color = '#34d399';
            codeOut.textContent = '"TUNTAS KKM 80 🎉"';
        } else {
            codeOut.style.color = '#f43f5e';
            codeOut.textContent = '"PERLU REMEDIAL 📚"';
        }
    }
}
window.updateIpoSimulator = updateIpoSimulator;

function inspectHoaxClue(type) {
    if (typeof sfxClick === 'function') sfxClick();
    const feedback = document.getElementById('hoax-feedback-area');
    if (!feedback) return;

    if (type === 'title') {
        feedback.innerHTML = `
            <div style="color: #fb7185; font-weight: 800;">🚨 JEBAKAN CLICKBAIT TERDETEKSI!</div>
            <div style="font-size: 0.8rem; color: #fff; margin-top: 2px;">
                Penggunaan huruf kapital berlebih, kata-kata panik ("GEMPAR"), dan janji manis berhadiah adalah ciri 99% hoaks!
            </div>
        `;
    } else if (type === 'url') {
        feedback.innerHTML = `
            <div style="color: #fb7185; font-weight: 800;">🌐 DOMAIN PALSU TERDETEKSI!</div>
            <div style="font-size: 0.8rem; color: #fff; margin-top: 2px;">
                Perhatikan akhiran: <code>.biz.id</code> bukan domain resmi kementerian! Kemdikbud resmi beralamat di <code>kemdikbud.go.id</code>.
            </div>
        `;
    }
}
window.inspectHoaxClue = inspectHoaxClue;
