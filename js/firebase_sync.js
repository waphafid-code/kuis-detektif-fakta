// ============================================================
// 🔥 FIREBASE REALTIME DATABASE & CLOUD FIRESTORE MODULE
// ============================================================
// Modul sinkronisasi real-time Google Firebase untuk QuizMaster
// Beroperasi 24/7 nonstop di Google Cloud tanpa batas jeda waktu/pause,
// mendukung sinkronisasi offline, multi-device live stream, dan pencadangan redundan.

const FIREBASE_CONFIG_KEY = 'quizmaster_firebase_config_v1';
const FIRESTORE_COLLECTION = 'quiz_results';

let firebaseApp = null;
let firestoreDb = null;
let rtdbEventSource = null;

const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyDF1bsT8NFwu5qc33UrHcFiECxH63-J9P0",
    authDomain: "kuis-informatika-c8781.firebaseapp.com",
    databaseURL: "https://kuis-informatika-c8781-default-rtdb.firebaseio.com",
    projectId: "kuis-informatika-c8781",
    storageBucket: "kuis-informatika-c8781.firebasestorage.app",
    messagingSenderId: "707112824956",
    appId: "1:707112824956:web:01c89af0c315927c3719f9",
    measurementId: "G-HM72HHWR7P"
};
window.DEFAULT_FIREBASE_CONFIG = DEFAULT_FIREBASE_CONFIG;

/**
 * Mengambil konfigurasi Firebase dari localStorage atau default resmi project kuis-informatika
 */
function getFirebaseConfig() {
    try {
        const saved = JSON.parse(localStorage.getItem(FIREBASE_CONFIG_KEY));
        if (saved && (saved.apiKey || saved.databaseURL)) {
            return {
                ...DEFAULT_FIREBASE_CONFIG,
                ...saved
            };
        }
    } catch (e) {}
    return { ...DEFAULT_FIREBASE_CONFIG };
}
window.getFirebaseConfig = getFirebaseConfig;

/**
 * Menyimpan konfigurasi Firebase ke localStorage dan menginisialisasi client
 */
function saveFirebaseConfig(cfg) {
    if (!cfg || typeof cfg !== 'object') {
        localStorage.removeItem(FIREBASE_CONFIG_KEY);
        firestoreDb = null;
        firebaseApp = null;
        return null;
    }
    const cleanCfg = {
        apiKey: (cfg.apiKey || DEFAULT_FIREBASE_CONFIG.apiKey).trim(),
        authDomain: (cfg.authDomain || DEFAULT_FIREBASE_CONFIG.authDomain).trim(),
        databaseURL: (cfg.databaseURL || DEFAULT_FIREBASE_CONFIG.databaseURL).trim(),
        projectId: (cfg.projectId || DEFAULT_FIREBASE_CONFIG.projectId).trim(),
        storageBucket: (cfg.storageBucket || DEFAULT_FIREBASE_CONFIG.storageBucket).trim(),
        messagingSenderId: (cfg.messagingSenderId || DEFAULT_FIREBASE_CONFIG.messagingSenderId).trim(),
        appId: (cfg.appId || DEFAULT_FIREBASE_CONFIG.appId).trim(),
        measurementId: (cfg.measurementId || DEFAULT_FIREBASE_CONFIG.measurementId).trim()
    };
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(cleanCfg));
    return initFirebaseClient();
}
window.saveFirebaseConfig = saveFirebaseConfig;

/**
 * Parse teks konfigurasi Firebase yang ditempel (paste) oleh guru dari Firebase Console
 */
function parseFirebaseConfigSnippet(snippet) {
    if (!snippet || typeof snippet !== 'string') return null;
    let clean = snippet.trim();

    const match = clean.match(/\{[\s\S]*\}/);
    if (match) clean = match[0];

    try {
        return JSON.parse(clean);
    } catch (e) {}

    try {
        const extractField = (fieldName) => {
            const regex = new RegExp(`['"]?${fieldName}['"]?\\s*:\\s*['"]([^'"]+)['"]`, 'i');
            const found = clean.match(regex);
            return found ? found[1].trim() : '';
        };

        const parsed = {
            apiKey: extractField('apiKey'),
            authDomain: extractField('authDomain'),
            databaseURL: extractField('databaseURL'),
            projectId: extractField('projectId'),
            storageBucket: extractField('storageBucket'),
            messagingSenderId: extractField('messagingSenderId'),
            appId: extractField('appId'),
            measurementId: extractField('measurementId')
        };

        if (parsed.apiKey || parsed.projectId || parsed.databaseURL) {
            return parsed;
        }
    } catch (err) {}

    return null;
}
window.parseFirebaseConfigSnippet = parseFirebaseConfigSnippet;

/**
 * Inisialisasi Firebase App & Database
 */
function initFirebaseClient() {
    const cfg = getFirebaseConfig();
    if (!cfg) return null;

    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        try {
            const existingApp = firebase.apps && firebase.apps.find(a => a.name === '[DEFAULT]');
            if (existingApp) {
                firebaseApp = existingApp;
            } else {
                firebaseApp = firebase.initializeApp(cfg);
            }
            if (typeof firebase.firestore === 'function') {
                firestoreDb = firebaseApp.firestore();
                window.firestoreDb = firestoreDb;
            }
        } catch (e) {
            console.warn('Firebase SDK init warning:', e.message);
        }
    }

    console.log('🔥 Firebase Database Module aktif — Target RTDB:', cfg.databaseURL);
    return true;
}
window.initFirebaseClient = initFirebaseClient;

/**
 * Menyimpan satu hasil kuis ke Firebase Realtime Database & Cloud Firestore
 */
async function saveRecordToFirebase(record, proofCode) {
    if (!record) return false;
    const cfg = getFirebaseConfig();
    const dbUrl = (cfg && cfg.databaseURL) ? cfg.databaseURL.replace(/\/$/, '') : 'https://kuis-informatika-c8781-default-rtdb.firebaseio.com';

    const modId = (typeof normalizeModuleId === 'function')
        ? normalizeModuleId(record.moduleId || record.module_id, record.id, record.date)
        : (record.moduleId || 'modul_detektif_fakta');

    const key = ('rec_' + (record.name || 'siswa') + '_' + (record.class || 'cls') + '_' + modId + '_' + (record.score || 0)).replace(/[^A-Za-z0-9_-]/g, '_');

    const payload = {
        student_name: record.name,
        student_class: record.class,
        score: Number(record.score) || 0,
        correct_count: Number(record.correct) || 0,
        total_questions: Number(record.total) || 20,
        wrong_questions: {
            list: Array.isArray(record.wrongQuestions) ? record.wrongQuestions : [],
            moduleId: modId,
            moduleTitle: record.moduleTitle || (modId === 'modul_jaringan_keamanan' ? 'Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital' : 'Misi Detektif Fakta'),
            proofId: proofCode || record.submissionProofId || ''
        },
        duration: record.duration || '0m',
        time_str: record.time || '00:00',
        quiz_date: record.date || new Date().toLocaleDateString('id-ID'),
        submission_proof_id: proofCode || record.submissionProofId || '',
        submitted_at: Date.now()
    };

    let rtdbSuccess = false;

    // 1. Simpan ke Firebase Realtime Database via REST API (Ultra-cepat, sub-millisecond)
    try {
        const res = await fetch(`${dbUrl}/quiz_results/${encodeURIComponent(key)}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            rtdbSuccess = true;
            console.log('🔥 [Firebase RTDB] Nilai siswa berhasil disimpan:', record.name, 'Key:', key);
        }
    } catch (e) {
        console.warn('Firebase RTDB save error:', e.message);
    }

    // 2. Simpan juga ke Cloud Firestore jika aktif
    const db = window.firestoreDb;
    if (db) {
        try {
            await db.collection(FIRESTORE_COLLECTION).doc(key).set(payload, { merge: true });
            console.log('🔥 [Firestore] Nilai siswa tersimpan di Firestore:', record.name);
            rtdbSuccess = true;
        } catch(err) {}
    }

    return rtdbSuccess;
}
window.saveRecordToFirebase = saveRecordToFirebase;

/**
 * Mengambil seluruh data nilai dari Firebase Realtime Database (atau Firestore)
 */
async function fetchFirebaseRecords() {
    const cfg = getFirebaseConfig();
    const dbUrl = (cfg && cfg.databaseURL) ? cfg.databaseURL.replace(/\/$/, '') : 'https://kuis-informatika-c8781-default-rtdb.firebaseio.com';

    // 1. Ambil dari Realtime Database REST API (Tercepat & 100% Bebas Kuota)
    try {
        const res = await fetch(`${dbUrl}/quiz_results.json`);
        if (res.ok) {
            const data = await res.json();
            if (data && typeof data === 'object') {
                const records = [];
                Object.entries(data).forEach(([key, r]) => {
                    if (!r || typeof r !== 'object') return;
                    const sName = String(r.student_name || '');
                    const sClass = String(r.student_class || '');
                    if (sName.startsWith('__') || sClass === '__SYSTEM_CONFIG__') return;

                    let extractedModId = null;
                    let extractedModTitle = null;
                    let extractedWrong = [];

                    if (r.wrong_questions && typeof r.wrong_questions === 'object' && !Array.isArray(r.wrong_questions)) {
                        extractedModId = r.wrong_questions.moduleId;
                        extractedModTitle = r.wrong_questions.moduleTitle;
                        extractedWrong = Array.isArray(r.wrong_questions.list) ? r.wrong_questions.list : [];
                    } else if (Array.isArray(r.wrong_questions)) {
                        extractedWrong = r.wrong_questions;
                    }

                    const modId = (typeof normalizeModuleId === 'function')
                        ? normalizeModuleId(extractedModId || r.moduleId, r.id || key, r.quiz_date)
                        : (extractedModId || 'modul_detektif_fakta');

                    records.push({
                        id: key,
                        name: r.student_name || 'Siswa',
                        class: r.student_class || '-',
                        score: Number(r.score) || 0,
                        correct: Number(r.correct_count) || 0,
                        total: Number(r.total_questions) || 20,
                        wrongQuestions: extractedWrong,
                        duration: r.duration || '0m',
                        time: r.time_str || '00:00',
                        date: r.quiz_date || '',
                        moduleId: modId,
                        moduleTitle: extractedModTitle || (modId === 'modul_jaringan_keamanan' ? 'Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital' : 'Misi Detektif Fakta'),
                        submissionProofId: r.submission_proof_id || (r.wrong_questions ? r.wrong_questions.proofId : '') || key
                    });
                });

                console.log(`🔥 [Firebase RTDB] Berhasil memuat ${records.length} data siswa.`);
                return records;
            }
        }
    } catch (err) {
        console.warn('Firebase RTDB fetch warning:', err.message);
    }

    // 2. Fallback ke Firestore jika RTDB kosong
    const db = window.firestoreDb;
    if (db) {
        try {
            const snapshot = await db.collection(FIRESTORE_COLLECTION)
                .where('student_class', '!=', '__SYSTEM_CONFIG__')
                .get();

            const records = [];
            snapshot.forEach(doc => {
                const r = doc.data();
                records.push({
                    id: doc.id,
                    name: r.student_name || 'Siswa',
                    class: r.student_class || '-',
                    score: Number(r.score) || 0,
                    correct: Number(r.correct_count) || 0,
                    total: Number(r.total_questions) || 20,
                    wrongQuestions: r.wrong_questions?.list || [],
                    duration: r.duration || '0m',
                    time: r.time_str || '00:00',
                    date: r.quiz_date || '',
                    moduleId: r.wrong_questions?.moduleId || 'modul_detektif_fakta',
                    moduleTitle: r.wrong_questions?.moduleTitle || 'Misi Detektif Fakta',
                    submissionProofId: r.submission_proof_id || doc.id
                });
            });
            return records;
        } catch (fsErr) {}
    }

    return [];
}
window.fetchFirebaseRecords = fetchFirebaseRecords;

/**
 * Unggah massal seluruh data siswa ke Firebase Realtime Database
 */
async function uploadAllRecordsToFirebase(recordsToUpload = null) {
    const cfg = getFirebaseConfig();
    const dbUrl = (cfg && cfg.databaseURL) ? cfg.databaseURL.replace(/\/$/, '') : 'https://kuis-informatika-c8781-default-rtdb.firebaseio.com';
    const records = recordsToUpload || (typeof loadRecords === 'function' ? loadRecords() : []);
    if (!Array.isArray(records) || records.length === 0) {
        throw new Error('Tidak ada data kuis untuk diunggah.');
    }

    console.log(`🔥 Memulai sinkronisasi massal ${records.length} data ke Firebase Realtime Database...`);

    const payload = {};
    records.forEach(r => {
        const modId = (typeof normalizeModuleId === 'function')
            ? normalizeModuleId(r.moduleId || r.module_id, r.id, r.date)
            : (r.moduleId || 'modul_detektif_fakta');

        const key = ('rec_' + (r.name || 'siswa') + '_' + (r.class || 'cls') + '_' + modId + '_' + (r.score || 0)).replace(/[^A-Za-z0-9_-]/g, '_');
        const proofCode = r.submissionProofId || `SMAN4-${(r.class || 'XE').replace(/[^A-Za-z0-9]/g, '').toUpperCase()}-${r.score}-${Date.now().toString(36).toUpperCase()}`;

        payload[key] = {
            student_name: r.name,
            student_class: r.class,
            score: Number(r.score) || 0,
            correct_count: Number(r.correct) || 0,
            total_questions: Number(r.total) || 20,
            wrong_questions: {
                list: Array.isArray(r.wrongQuestions) ? r.wrongQuestions : [],
                moduleId: modId,
                moduleTitle: r.moduleTitle || (modId === 'modul_jaringan_keamanan' ? 'Penilaian Harian: Infrastruktur Jaringan & Keamanan Digital' : 'Misi Detektif Fakta'),
                proofId: proofCode
            },
            duration: r.duration || '0m',
            time_str: r.time || '00:00',
            quiz_date: r.date || '',
            submission_proof_id: proofCode,
            synced_at: Date.now()
        };
    });

    const res = await fetch(`${dbUrl}/quiz_results.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    console.log(`🔥 Berhasil mengunggah ${records.length} data ke Firebase Realtime Database!`);
    return records.length;
}
window.uploadAllRecordsToFirebase = uploadAllRecordsToFirebase;

/**
 * Berlangganan Live Stream Real-Time (Server-Sent Events) dari Firebase RTDB
 * Saat siswa menyelesaikan kuis di HP/laptop lain, dasbor guru seketika terupdate tanpa refresh
 */
function initFirebaseRealtime() {
    const cfg = getFirebaseConfig();
    const dbUrl = (cfg && cfg.databaseURL) ? cfg.databaseURL.replace(/\/$/, '') : 'https://kuis-informatika-c8781-default-rtdb.firebaseio.com';

    if (rtdbEventSource) {
        try { rtdbEventSource.close(); } catch(e) {}
    }

    try {
        if (typeof EventSource !== 'undefined') {
            rtdbEventSource = new EventSource(`${dbUrl}/quiz_results.json`);
            rtdbEventSource.addEventListener('put', (event) => {
                if (typeof syncWithBackend === 'function') {
                    syncWithBackend(false);
                }
            });
            rtdbEventSource.addEventListener('patch', (event) => {
                if (typeof syncWithBackend === 'function') {
                    syncWithBackend(false);
                }
            });
            console.log('📡 [Firebase RTDB SSE] Live stream listener aktif 24/7.');
        }
    } catch(e) {
        console.warn('Firebase RTDB SSE warning:', e.message);
    }
}
window.initFirebaseRealtime = initFirebaseRealtime;

/**
 * Tes koneksi ke Firebase Realtime Database
 */
async function testFirebaseConnection() {
    const cfg = getFirebaseConfig();
    const dbUrl = (cfg && cfg.databaseURL) ? cfg.databaseURL.replace(/\/$/, '') : 'https://kuis-informatika-c8781-default-rtdb.firebaseio.com';

    try {
        const res = await fetch(`${dbUrl}/quiz_results.json?shallow=true`);
        if (res.ok) {
            const data = await res.json();
            const count = data ? Object.keys(data).length : 0;
            return {
                success: true,
                message: `Terhubung Aktif ke Firebase Realtime Database (${count} siswa tercatat)!`
            };
        } else {
            return { success: false, message: `HTTP ${res.status}: ${res.statusText}` };
        }
    } catch (err) {
        return { success: false, message: `Gagal terhubung: ${err.message}` };
    }
}
window.testFirebaseConnection = testFirebaseConnection;

// Jalankan inisialisasi awal saat skrip dimuat
if (typeof window !== 'undefined') {
    initFirebaseClient();
    initFirebaseRealtime();
}
