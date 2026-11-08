const fs = require('fs');
const path = require('path');

console.log('════════════════════════════════════════════════════════════════');
console.log('🤖 RUNNING BIOMETRICS & TEACHER/STUDENT AI CHATBOT VERIFICATION');
console.log('════════════════════════════════════════════════════════════════\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ [PASS] ${message}`);
        passed++;
    } else {
        console.error(`  ✗ [FAIL] ${message}`);
        failed++;
    }
}

// 1. Check HTML for elimination of "(m-Banking)"
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const dasborHtml = fs.readFileSync(path.join(__dirname, 'kuis_interaktif_dasbor_guru.html'), 'utf8');

assert(!indexHtml.includes('(m-Banking)'), 'index.html has zero occurrences of "(m-Banking)"');
assert(!dasborHtml.includes('(m-Banking)'), 'kuis_interaktif_dasbor_guru.html has zero occurrences of "(m-Banking)"');
assert(indexHtml.includes('Daftarkan Sidik Jari'), 'index.html contains button "Daftarkan Sidik Jari"');
assert(indexHtml.includes('biometric-re-enroll-wrap'), 'index.html contains biometric re-enrollment wrapper');

// 2. Check dashboard.js for Biometric logic & single credential enforcement
const dashboardJs = fs.readFileSync(path.join(__dirname, 'js/dashboard.js'), 'utf8');

assert(!dashboardJs.includes('(m-Banking)'), 'dashboard.js has zero occurrences of "(m-Banking)"');
assert(!dashboardJs.includes('2543'), 'dashboard.js never leaks plaintext PIN in UI messages or comments');
assert(dashboardJs.includes('window.pendingBiometricEnrollment'), 'dashboard.js tracks pendingBiometricEnrollment');
assert(dashboardJs.includes('enrollSingleBiometricCredential'), 'dashboard.js defines enrollSingleBiometricCredential');
assert(dashboardJs.includes('startBiometricReEnrollment'), 'dashboard.js defines startBiometricReEnrollment');
assert(dashboardJs.includes('localStorage.setItem(\'quizmaster_biometric_cred_id\''), 'dashboard.js stores single credential ID');

// 3. Load teacher_chatbot.js in Node.js mock environment
const chatbotJs = fs.readFileSync(path.join(__dirname, 'js/teacher_chatbot.js'), 'utf8');

// Setup DOM and globals mock
const mockDocument = {
    getElementById: (id) => {
        if (id === 'screen-teacher') return { classList: { contains: () => true } };
        return {
            textContent: '',
            style: {},
            innerHTML: '',
            appendChild: () => {},
            focus: () => {}
        };
    },
    createElement: () => ({
        style: {},
        innerHTML: '',
        appendChild: () => {}
    }),
    body: { appendChild: () => {} }
};

const mockWindow = {
    document: mockDocument,
    isTeacherAuthValid: () => true, // Simulate teacher mode
    quizData: [],
    DEFAULT_BUILTIN_QUESTIONS: [],
    STUDENT_ROSTER: {
        'X E 1': ['Aditya Pratama', 'Aisyah Putri', 'Budi Santoso'],
        'X E 2': ['Citra Dewi', 'Deni Saputra']
    },
    loadRecords: () => [
        { name: 'Aditya Pratama', class: 'X E 1', moduleId: 'modul_detektif_fakta', score: 85, wrongQuestions: [2, 5] },
        { name: 'Aditya Pratama', class: 'X E 1', moduleId: 'modul_jaringan_keamanan', score: 75, wrongQuestions: [7, 18, 12] },
        { name: 'Aisyah Putri', class: 'X E 1', moduleId: 'modul_detektif_fakta', score: 90, wrongQuestions: [] },
        { name: 'Budi Santoso', class: 'X E 1', moduleId: 'modul_jaringan_keamanan', score: 85, wrongQuestions: [18] }
    ]
};

// Sandbox evaluation
const vm = require('vm');
const context = vm.createContext({
    window: mockWindow,
    document: mockDocument,
    isTeacherAuthValid: mockWindow.isTeacherAuthValid,
    STUDENT_ROSTER: mockWindow.STUDENT_ROSTER,
    loadRecords: mockWindow.loadRecords,
    console: console,
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval
});

vm.runInContext(chatbotJs, context);

const handleChatbotQuery = context.window.handleChatbotQuery;

// Test Intent 1: Misconceptions (even with typo "misskonsepsi")
const resMis1 = handleChatbotQuery("dimana banyak misskonsepsi");
assert(resMis1.includes('Peta Miskonsepsi Kritis'), 'Intent: "dimana banyak misskonsepsi" correctly triggers misconception map');
assert(resMis1.includes('Wi-Fi Publik vs Sensor Sidik Jari'), 'Intent: Misconception report details Wi-Fi vs Fingerprint confusion');

const resMis2 = handleChatbotQuery("soal kuis mana yang paling banyak salah dijawab");
assert(resMis2.includes('Peta Miskonsepsi Kritis'), 'Intent: "soal kuis mana yang paling banyak salah" triggers misconception map');

// Test Intent 2: Belum Mengerjakan Kedua Modul
const resBothUn = handleChatbotQuery("siapa yang belum mengerjakan kedua modul");
assert(resBothUn.includes('BELUM Mengerjakan Kedua Modul Sama Sekali'), 'Intent: "siapa yang belum mengerjakan kedua modul" triggers 0-module unsubmitted list');

// Test Intent 3: Belum Mengerjakan Salah Satu Modul
const resOneUn = handleChatbotQuery("siapa yang belum mengerjakan salah satu modul");
assert(resOneUn.includes('Baru Mengerjakan Salah Satu Modul Saja'), 'Intent: "siapa yang belum mengerjakan salah satu modul" triggers partial unsubmitted list');

// Test Intent 4: Siswa Remedial (< 80)
const resRem = handleChatbotQuery("siapa saja yang remedial");
assert(resRem.includes('Siswa Perlu Remedial (Skor < KKM 80)'), 'Intent: "siapa saja yang remedial" triggers remedial list');

// Test Intent 5: Live Learning Map & Teacher Recommendations
const resMap = handleChatbotQuery("tampilkan peta proses belajar mengajar secara realtime dan masukan");
assert(resMap.includes('Peta Proses Belajar Mengajar Real-time & Masukan Analitis'), 'Intent: Live map query triggers comprehensive briefing');
assert(resMap.includes('Masukan & Rekomendasi Tindakan Guru'), 'Intent: Live map provides actionable pedagogical recommendations');

// Test Intent 6: Belum Modul Jaringan in E1
const resE1 = handleChatbotQuery("siapa saja yang belum modul jaringan di E1");
assert(resE1.includes('X E 1'), 'Intent: "siapa saja yang belum modul jaringan di E1" filters to class X E 1');

// Test Student Mode Boundaries (Privacy & Cheat Prevention)
context.window.isTeacherAuthValid = () => false; // Switch to Student Mode
mockDocument.getElementById = () => ({ classList: { contains: () => false } }); // screen-teacher not active

const resStudentPrivacy = handleChatbotQuery("siapa nilai terendah di kelas 10E1?");
assert(resStudentPrivacy.includes('Akses Terbatas: Privasi & Kerahasiaan Nilai Siswa'), 'Student Mode: Secret grade queries are strictly blocked');

const resStudentDirectCode = handleChatbotQuery("buatkan kode python lengkap untuk saya");
assert(resStudentDirectCode.includes('Prinsip Belajar Mandiri: Asisten Tidak Menyediakan Koding Instan'), 'Student Mode: Direct coding requests are blocked and redirected to problem solving');

const resStudentConcept = handleChatbotQuery("apa perbedaan switch dan hub");
assert(resStudentConcept.includes('Topologi Jaringan') || resStudentConcept.includes('Infrastruktur Jaringan') || resStudentConcept.includes('Switch'), 'Student Mode: Concept queries provide friendly, educational explanations');

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`📊 FINAL RESULT: ${passed} / ${passed + failed} TESTS PASSED`);
if (failed === 0) {
    console.log('🎉 100% BIOMETRIC CONTROLLER & AI CHATBOT PERSONA AUDIT VERIFIED!');
}
console.log('════════════════════════════════════════════════════════════════\n');
process.exit(failed > 0 ? 1 : 0);

