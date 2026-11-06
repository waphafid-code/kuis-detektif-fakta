const fs = require('fs');

const testCases = [
  {
    id: 'TC-01',
    reqId: 'REQ-03',
    riskId: 'RSK-03',
    technique: 'Equivalence Partitioning',
    precondition: 'Pengguna berada di layar utama (Lobby) dan menekan tombol Portal Dasbor Guru.',
    steps: '1. Klik Portal Dasbor Guru; 2. Masukkan PIN pada input modal; 3. Klik Verifikasi PIN Masuk.',
    data: 'PIN = "2543" (Kelas Valid)',
    expected: 'Modal tertutup, otentikasi berhasil, dan layar Dasbor Guru (screen-teacher) terbuka penuh.',
    actual: 'Otentikasi berhasil, token tersimpan di sessionStorage, Dasbor Guru terbuka.',
    status: 'PASS',
    evidence: 'evidence/TC01_EP_Valid_PIN.png'
  },
  {
    id: 'TC-02',
    reqId: 'REQ-03',
    riskId: 'RSK-03',
    technique: 'Equivalence Partitioning',
    precondition: 'Pengguna berada di layar utama dan membuka modal verifikasi PIN Guru.',
    steps: '1. Buka modal PIN; 2. Masukkan PIN yang salah; 3. Klik tombol Verifikasi PIN.',
    data: 'PIN = "9999" (Kelas Invalid - Nilai Salah)',
    expected: 'Akses ditolak, animasi getar muncul, dan teks error merah "PIN Salah! Akses ditolak" tampil.',
    actual: 'Akses ditolak, efek shake aktif, pesan kesalahan PIN Salah muncul.',
    status: 'PASS',
    evidence: 'evidence/TC02_EP_Invalid_PIN.png'
  },
  {
    id: 'TC-03',
    reqId: 'REQ-03',
    riskId: 'RSK-03',
    technique: 'Equivalence Partitioning',
    precondition: 'Pengguna berada di layar utama dan membuka modal verifikasi PIN Guru.',
    steps: '1. Buka modal PIN; 2. Masukkan PIN kurang dari 4 digit; 3. Klik Verifikasi PIN.',
    data: 'PIN = "12" (Kelas Invalid - Format Tidak Lengkap)',
    expected: 'Sistem menolak submit atau memunculkan peringatan format PIN harus 4 digit angka.',
    actual: 'Akses ditolak, input bergetar dan pesan error muncul, Dasbor tetap terkunci.',
    status: 'PASS',
    evidence: 'evidence/TC03_EP_Format_PIN.png'
  },
  {
    id: 'TC-04',
    reqId: 'REQ-02',
    riskId: 'RSK-01',
    technique: 'Boundary Value Analysis',
    precondition: 'Siswa menyelesaikan seluruh 20 butir soal kuis.',
    steps: '1. Jawab soal sehingga total skor tepat di bawah KKM; 2. Klik Kirim Jawaban.',
    data: 'Skor = 75 atau 79 (Batas Bawah KKM 80)',
    expected: 'Halaman hasil menampilkan badge status "REMEDIAL / BELUM TUNTAS" (merah) dan tombol remedial aktif.',
    actual: 'Banner KKM menampilkan status REMEDIAL merah, kartu rekomendasi remedial muncul.',
    status: 'PASS',
    evidence: 'evidence/TC04_BVA_KKM_79_Remedial.png'
  },
  {
    id: 'TC-05',
    reqId: 'REQ-02',
    riskId: 'RSK-01',
    technique: 'Boundary Value Analysis',
    precondition: 'Siswa menyelesaikan seluruh 20 butir soal kuis.',
    steps: '1. Jawab soal sehingga total skor tepat sama dengan KKM; 2. Klik Kirim Jawaban.',
    data: 'Skor = 80 (Tepat pada Batas KKM 80)',
    expected: 'Halaman hasil menampilkan badge status "LULUS / TUNTAS KKM" (hijau) dan remedial dinonaktifkan.',
    actual: 'Banner KKM menampilkan status LULUS KKM hijau (80/100), remedial nonaktif.',
    status: 'PASS',
    evidence: 'evidence/TC05_BVA_KKM_80_Tuntas.png'
  },
  {
    id: 'TC-06',
    reqId: 'REQ-02',
    riskId: 'RSK-01',
    technique: 'Boundary Value Analysis',
    precondition: 'Siswa menyelesaikan seluruh 20 butir soal kuis.',
    steps: '1. Jawab soal sehingga total skor di atas ambang KKM; 2. Klik Kirim Jawaban.',
    data: 'Skor = 85 (Batas Atas KKM 80)',
    expected: 'Halaman hasil menampilkan status "KOMPETEN / LULUS KKM" (hijau) dengan predikat sangat baik.',
    actual: 'Banner menampilkan LULUS KKM hijau (85/100), tombol ekspor sertifikat aktif.',
    status: 'PASS',
    evidence: 'evidence/TC06_BVA_KKM_81_Tuntas.png'
  },
  {
    id: 'TC-07',
    reqId: 'REQ-04',
    riskId: 'RSK-02',
    technique: 'Decision Table',
    precondition: 'Guru mengatur mode akses di Dasbor pada mode Always Open.',
    steps: '1. Set mode akses ke always_open; 2. Siswa memilih kelas X E 1; 3. Klik Mulai Kuis.',
    data: 'Mode = "always_open", Override = true',
    expected: 'Siswa dapat langsung memulai ujian tanpa terhalang jadwal jam pelajaran.',
    actual: 'Akses diizinkan, kuis dimulai langsung ke layar soal pertama.',
    status: 'PASS',
    evidence: 'evidence/TC07_DT_AlwaysOpen_AccessAllowed.png'
  },
  {
    id: 'TC-08',
    reqId: 'REQ-04',
    riskId: 'RSK-02',
    technique: 'Decision Table',
    precondition: 'Guru melakukan penguncian manual pada salah satu kelas di Matrix Jadwal.',
    steps: '1. Guru menekan tombol Kunci pada baris kelas X E 1; 2. Siswa kelas X E 1 mencoba memulai kuis.',
    data: 'Mode = "always_open", Override X E 1 = false (Manual Lock)',
    expected: 'Sistem memblokir siswa X E 1 dengan modal peringatan "Kelas ini sedang dikunci oleh Guru".',
    actual: 'Modal access-locked-modal muncul, menampilkan info kelas sedang dikunci oleh Guru.',
    status: 'PASS',
    evidence: 'evidence/TC08_DT_AlwaysOpen_OverrideLocked.png'
  },
  {
    id: 'TC-09',
    reqId: 'REQ-04',
    riskId: 'RSK-02',
    technique: 'Decision Table',
    precondition: 'Guru menyetel mode tenggat waktu (deadline) yang telah lewat.',
    steps: '1. Guru set mode deadline ke jam yang telah lewat; 2. Siswa menekan Mulai Kuis.',
    data: 'Mode = "deadline", now > deadlineTimestamp',
    expected: 'Sistem memblokir siswa dengan pesan "Tenggat waktu kuis telah berakhir".',
    actual: 'Modal muncul dengan keterangan tenggat waktu telah berakhir pada jam yang ditentukan.',
    status: 'PASS',
    evidence: 'evidence/TC09_DT_Deadline_Expired.png'
  },
  {
    id: 'TC-10',
    reqId: 'REQ-01',
    riskId: 'RSK-04',
    technique: 'State Transition',
    precondition: 'Siswa berada pada state [LOBBY_SETUP], memilih kelas X E 1 dan nama siswa.',
    steps: '1. Pilih kelas; 2. Pilih nama lengkap siswa; 3. Klik tombol Mulai Kuis.',
    data: 'Kelas = "X E 1", Nama = "ADITYA PUTRA PRATAMA"',
    expected: 'Transisi state berhasil dari [LOBBY_SETUP] ke [ACTIVE_EXAM], timer mulai menghitung mundur.',
    actual: 'Layar beralih ke screen-quiz, soal nomor 1 tampil, timer berjalan lancar.',
    status: 'PASS',
    evidence: 'evidence/TC10_ST_Lobby_To_ActiveExam.png'
  },
  {
    id: 'TC-11',
    reqId: 'REQ-01',
    riskId: 'RSK-04',
    technique: 'State Transition',
    precondition: 'Siswa berada pada state [ACTIVE_EXAM] pada butir soal terakhir.',
    steps: '1. Pilih jawaban pada butir soal ke-20; 2. Klik tombol Kirim Jawaban.',
    data: 'State = [ACTIVE_EXAM] -> Selesai',
    expected: 'Transisi state berhasil dari [ACTIVE_EXAM] ke [RESULT_REVIEW], nilai tersimpan lokal dan cloud.',
    actual: 'Layar beralih ke screen-result, skor dan evaluasi tampil, data tersimpan.',
    status: 'PASS',
    evidence: 'evidence/TC11_ST_ActiveExam_To_Results.png'
  },
  {
    id: 'TC-12',
    reqId: 'REQ-01',
    riskId: 'RSK-04',
    technique: 'State Transition',
    precondition: 'Siswa mencoba melompati alur state yang dilarang (Negative / Forbidden Transition).',
    steps: '1. Buka kuis langsung saat kelas dikunci atau paksa akses tanpa otorisasi.',
    data: 'Transisi Terlarang: [LOBBY_SETUP] langsung ke [ACTIVE_EXAM] saat kelas terkunci',
    expected: 'Sistem menolak transisi terlarang, memunculkan modal blokir dan mengembalikan siswa ke lobby.',
    actual: 'Akses ditolak, modal akses terkunci muncul, siswa tidak dapat mengakses soal.',
    status: 'PASS',
    evidence: 'evidence/TC12_ST_Forbidden_Transition.png'
  }
];

const csvEscape = (val) => '"' + String(val).replace(/"/g, '""') + '"';

const tcHeader = ['Test_ID', 'Requirement_ID', 'Risk_ID', 'Technique', 'Precondition', 'Test_Steps', 'Test_Data', 'Expected_Result', 'Actual_Result', 'Status', 'Evidence'];
const tcRows = [tcHeader.join(',')];
testCases.forEach(tc => {
  tcRows.push([
    csvEscape(tc.id),
    csvEscape(tc.reqId),
    csvEscape(tc.riskId),
    csvEscape(tc.technique),
    csvEscape(tc.precondition),
    csvEscape(tc.steps),
    csvEscape(tc.data),
    csvEscape(tc.expected),
    csvEscape(tc.actual),
    csvEscape(tc.status),
    csvEscape(tc.evidence)
  ].join(','));
});
fs.writeFileSync('test-cases/05_Test_Cases.csv', tcRows.join('\n'), 'utf8');

const rtmData = [
  {
    reqId: 'REQ-01',
    reqDesc: 'Siswa dapat memilih kelas, nama lengkap terdaftar, dan paket modul ujian resmi untuk memulai kuis.',
    riskId: 'RSK-04',
    riskDesc: 'Siswa salah memasukkan identitas atau melompati urutan pengerjaan ujian.',
    tcId: 'TC-10, TC-11, TC-12',
    type: 'State Transition',
    status: 'PASS',
    defectId: '-',
    evidence: 'evidence/TC10_ST_Lobby_To_ActiveExam.png, evidence/TC11_ST_ActiveExam_To_Results.png, evidence/TC12_ST_Forbidden_Transition.png'
  },
  {
    reqId: 'REQ-02',
    reqDesc: 'Sistem menghitung capaian nilai siswa skala 0-100 dan mengevaluasi kelulusan berbasis ambang batas KKM 80.',
    riskId: 'RSK-01',
    riskDesc: 'Kesalahan perhitungan status kelulusan pada nilai ambang batas (boundary error).',
    tcId: 'TC-04, TC-05, TC-06',
    type: 'Boundary Value Analysis',
    status: 'PASS',
    defectId: '-',
    evidence: 'evidence/TC04_BVA_KKM_79_Remedial.png, evidence/TC05_BVA_KKM_80_Tuntas.png, evidence/TC06_BVA_KKM_81_Tuntas.png'
  },
  {
    reqId: 'REQ-03',
    reqDesc: 'Dasbor Guru dilindungi verifikasi otentikasi PIN 4 digit untuk menjaga kerahasiaan nilai dan kontrol ujian.',
    riskId: 'RSK-03',
    riskDesc: 'Siswa atau pihak tidak berwenang mengakses data rekapitulasi nilai dan kunci jawaban.',
    tcId: 'TC-01, TC-02, TC-03',
    type: 'Equivalence Partitioning',
    status: 'PASS',
    defectId: '-',
    evidence: 'evidence/TC01_EP_Valid_PIN.png, evidence/TC02_EP_Invalid_PIN.png, evidence/TC03_EP_Format_PIN.png'
  },
  {
    reqId: 'REQ-04',
    reqDesc: 'Guru dapat mengatur dan mengontrol jadwal akses kelas (Always Open, Manual Lock, Deadline, Auto Schedule).',
    riskId: 'RSK-02',
    riskDesc: 'Siswa terkunci secara tidak sengaja di luar jam pelajaran atau saat sinkronisasi cloud.',
    tcId: 'TC-07, TC-08, TC-09',
    type: 'Decision Table',
    status: 'PASS',
    defectId: 'DEFECT-01',
    evidence: 'evidence/TC07_DT_AlwaysOpen_AccessAllowed.png, evidence/TC08_DT_AlwaysOpen_OverrideLocked.png, evidence/TC09_DT_Deadline_Expired.png'
  },
  {
    reqId: 'REQ-05',
    reqDesc: 'Asisten AI Dasbor Guru mampu menganalisis secara tepat status pengerjaan, siswa belum ujian, dan remedial per kelas.',
    riskId: 'RSK-05',
    riskDesc: 'AI Chatbot gagal mem-parsing query guru atau salah mengenali nama kelas sehingga memberi fallback kosong.',
    tcId: 'Sub-test Defect Verification',
    type: 'System Functional Testing',
    status: 'PASS',
    defectId: 'DEFECT-02',
    evidence: 'evidence/DEFECT01_Chatbot_NLP_Query_Fixed.png'
  }
];

const rtmHeader = ['Req_ID', 'Requirement_Description', 'Risk_ID', 'Risk_Description', 'Test_Case_ID', 'Test_Type', 'Execution_Status', 'Defect_ID', 'Evidence_File'];
const rtmRows = [rtmHeader.join(',')];
rtmData.forEach(r => {
  rtmRows.push([
    csvEscape(r.reqId),
    csvEscape(r.reqDesc),
    csvEscape(r.riskId),
    csvEscape(r.riskDesc),
    csvEscape(r.tcId),
    csvEscape(r.type),
    csvEscape(r.status),
    csvEscape(r.defectId),
    csvEscape(r.evidence)
  ].join(','));
});
fs.writeFileSync('test-cases/05_RTM.csv', rtmRows.join('\n'), 'utf8');

console.log('05_Test_Cases.csv and 05_RTM.csv successfully written!');

