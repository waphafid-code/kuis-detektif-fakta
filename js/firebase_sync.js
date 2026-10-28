// ============================================================
// 🔥 FIREBASE CLOUD FIRESTORE INTEGRATION MODULE
// ============================================================
// Modul sinkronisasi real-time Cloud Firestore untuk QuizMaster
// Beroperasi 24/7 tanpa batas jeda waktu, mendukung sinkronisasi offline,
// pembaruan multi-device real-time (onSnapshot), dan pencadangan redundan.

const FIREBASE_CONFIG_KEY = 'quizmaster_firebase_config_v1';
const FIRESTORE_COLLECTION = 'quiz_results';

let firebaseApp = null;
let firestoreDb = null;
let firebaseRealtimeUnsubscribe = null;

/**
 * Mengambil konfigurasi Firebase dari localStorage
 */
function getFirebaseConfig() {
    try {
        const saved = JSON.parse(localStorage.getItem(FIREBASE_CONFIG_KEY));
        if (saved && saved.apiKey && saved.projectId) {
            return saved;
        }
    } catch (e) {}
    return null;
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
        apiKey: (cfg.apiKey || '').trim(),
        authDomain: (cfg.authDomain || '').trim(),
        projectId: (cfg.projectId || '').trim(),
        storageBucket: (cfg.storageBucket || '').trim(),
        messagingSenderId: (cfg.messagingSenderId || '').trim(),
        appId: (cfg.appId || '').trim(),
        measurementId: (cfg.measurementId || '').trim()
    };
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(cleanCfg));
    return initFirebaseClient();
}
window.saveFirebaseConfig = saveFirebaseConfig;

/**
 * Parse teks konfigurasi Firebase yang ditempel (paste) oleh guru dari Firebase Console
 * Mendukung format JSON murni atau potongan kode: const firebaseConfig = { ... };
 */
function parseFirebaseConfigSnippet(snippet) {
    if (!snippet || typeof snippet !== 'string') return null;
    let clean = snippet.trim();

    // 1. Jika pengguna menempelkan format const firebaseConfig = { ... }
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
        clean = match[0];
    }

    // 2. Coba JSON.parse langsung
    try {
        return JSON.parse(clean);
    } catch (e) {}

    // 3. Ekstraksi manual dengan regex jika kunci tidak berkutip (JS Object literal)
    try {
        const extractField = (fieldName) => {
            const regex = new RegExp(`['"]?${fieldName}['"]?\\s*:\\s*['"]([^'"]+)['"]`, 'i');
            const found = clean.match(regex);
            return found ? found[1].trim() : '';
        };

        const parsed = {
            apiKey: extractField('apiKey'),
            authDomain: extractField('authDomain'),
            projectId: extractField('projectId'),
            storageBucket: extractField('storageBucket'),
            messagingSenderId: extractField('messagingSenderId'),
            appId: extractField('appId'),
            measurementId: extractField('measurementId')
        };

        if (parsed.apiKey && parsed.projectId) {
            return parsed;
        }
    } catch (err) {}

    return null;
}
window.parseFirebaseConfigSnippet = parseFirebaseConfigSnippet;

/**
 * Inisialisasi Firebase App & Cloud Firestore
 */
function initFirebaseClient() {
    const cfg = getFirebaseConfig();
    if (!cfg || !cfg.apiKey || !cfg.projectId) {
        firestoreDb = null;
        window.firestoreDb = null;
        return null;
    }

    if (typeof firebase === 'undefined' || !firebase.initializeApp) {
        console.warn('⚠️ Firebase SDK belum dimuat di halaman.');
        return null;
    }

    try {
        // Cek jika app sudah pernah dibuat sebelumnya
        const existingApp = firebase.apps && firebase.apps.find(a => a.name === '[DEFAULT]');
        if (existingApp) {
            firebaseApp = existingApp;
        } else {
            firebaseApp = firebase.initializeApp(cfg);
        }

        firestoreDb = firebaseApp.firestore();
        window.firestoreDb = firestoreDb;

        // Aktifkan persistensi offline Firestore jika didukung browser
        if (firestoreDb && typeof firestoreDb.enablePersistence === 'function') {
            firestoreDb.enablePersistence({ synchronizeTabs: true }).catch(err => {
                if (err.code !== 'failed-precondition' && err.code !== 'unimplemented') {
                    console.warn('Firestore offline persistence warning:', err.message);
                }
            });
        }

        console.log('🔥 Firebase Cloud Firestore berhasil diinisialisasi:', cfg.projectId);
        return firestoreDb;
    } catch (err) {
        console.warn('Gagal menginisialisasi Firebase Firestore:', err);
        firestoreDb = null;
        window.firestoreDb = null;
        return null;
    }
}
window.initFirebaseClient = initFirebaseClient;

/**
 * Menyimpan satu hasil kuis ke Cloud Firestore
 */
async function saveRecordToFirebase(record, proofCode) {
    const db = window.firestoreDb || initFirebaseClient();
    if (!db) return false;

    try {
        const modId = (typeof normalizeModuleId === 'function')
            ? normalizeModuleId(record.moduleId || record.module_id, record.id, record.date)
            : (record.moduleId || 'modul_detektif_fakta');

        const docPayload = {
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
            submitted_at: firebase.firestore.FieldValue.serverTimestamp(),
            submission_proof_id: proofCode || record.submissionProofId || ''
        };

        // Buat ID dokumen yang unik dan deterministik berdasarkan proofCode atau kombinasi nama-kelas
        const docId = proofCode ? proofCode.replace(/[^A-Za-z0-9_-]/g, '_') : `${record.name}_${record.class}_${Date.now()}`.replace(/[^A-Za-z0-9_-]/g, '_');

        await db.collection(FIRESTORE_COLLECTION).doc(docId).set(docPayload, { merge: true });
        console.log('🔥 [Firebase Firestore] Berhasil menyimpan nilai siswa:', record.name, 'DocID:', docId);
        return true;
    } catch (err) {
        console.warn('🔥 [Firebase Firestore] Gagal menyimpan nilai:', err);
        return false;
    }
}
window.saveRecordToFirebase = saveRecordToFirebase;

/**
 * Mengambil seluruh data nilai dari Cloud Firestore
 */
async function fetchFirebaseRecords() {
    const db = window.firestoreDb || initFirebaseClient();
    if (!db) return [];

    try {
        const snapshot = await db.collection(FIRESTORE_COLLECTION)
            .where('student_class', '!=', '__SYSTEM_CONFIG__')
            .get();

        const records = [];
        snapshot.forEach(doc => {
            const r = doc.data();
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
                ? normalizeModuleId(extractedModId || r.moduleId, r.id || doc.id, r.quiz_date)
                : (extractedModId || 'modul_detektif_fakta');

            records.push({
                id: doc.id,
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
                submissionProofId: r.submission_proof_id || (r.wrong_questions ? r.wrong_questions.proofId : '') || doc.id
            });
        });

        console.log(`🔥 [Firebase Firestore] Berhasil memuat ${records.length} data siswa dari cloud.`);
        return records;
    } catch (err) {
        console.warn('🔥 [Firebase Firestore] Gagal memuat data:', err);
        return [];
    }
}
window.fetchFirebaseRecords = fetchFirebaseRecords;

/**
 * Unggah massal seluruh data siswa (termasuk 221 nilai resmi) ke Cloud Firestore
 */
async function uploadAllRecordsToFirebase(recordsToUpload = null) {
    const db = window.firestoreDb || initFirebaseClient();
    if (!db) {
        throw new Error('Firebase Firestore belum terhubung. Konfigurasikan Firebase terlebih dahulu.');
    }

    const records = recordsToUpload || (typeof loadRecords === 'function' ? loadRecords() : []);
    if (!Array.isArray(records) || records.length === 0) {
        throw new Error('Tidak ada data kuis untuk diunggah.');
    }

    console.log(`🔥 Memulai unggah ${records.length} data ke Cloud Firestore...`);

    // Firestore batch menulis hingga 500 dokumen per operasi
    const BATCH_SIZE = 400;
    let totalUploaded = 0;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const slice = records.slice(i, i + BATCH_SIZE);
        const batch = db.batch();

        slice.forEach(r => {
            const modId = (typeof normalizeModuleId === 'function')
                ? normalizeModuleId(r.moduleId || r.module_id, r.id, r.date)
                : (r.moduleId || 'modul_detektif_fakta');

            const proofCode = r.submissionProofId || `SMAN4-${(r.class || 'XE').replace(/[^A-Za-z0-9]/g, '').toUpperCase()}-${r.score}-${Date.now().toString(36).toUpperCase()}`;
            const docId = `rec_${(r.name || 'siswa').replace(/[^A-Za-z0-9]/g, '_')}_${(r.class || 'cls').replace(/[^A-Za-z0-9]/g, '_')}_${modId}_${r.score}`.slice(0, 100);

            const docRef = db.collection(FIRESTORE_COLLECTION).doc(docId);
            batch.set(docRef, {
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
                quiz_date: r.date || new Date().toLocaleDateString('id-ID'),
                submission_proof_id: proofCode,
                synced_at: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        });

        await batch.commit();
        totalUploaded += slice.length;
        console.log(`🔥 Batch ${Math.floor(i / BATCH_SIZE) + 1} selesai: ${totalUploaded}/${records.length} terunggah.`);
    }

    return totalUploaded;
}
window.uploadAllRecordsToFirebase = uploadAllRecordsToFirebase;

/**
 * Berlangganan (realtime subscription) pada Cloud Firestore
 * Jika ada siswa yang menyelesaikan kuis di HP/laptop lain, dasbor guru langsung terupdate seketika
 */
function initFirebaseRealtime() {
    const db = window.firestoreDb || initFirebaseClient();
    if (!db) return;

    if (firebaseRealtimeUnsubscribe) {
        try { firebaseRealtimeUnsubscribe(); } catch (e) {}
    }

    try {
        firebaseRealtimeUnsubscribe = db.collection(FIRESTORE_COLLECTION)
            .where('student_class', '!=', '__SYSTEM_CONFIG__')
            .onSnapshot(snapshot => {
                let hasChanges = false;
                snapshot.docChanges().forEach(change => {
                    if (change.type === 'added' || change.type === 'modified') {
                        hasChanges = true;
                    }
                });

                if (hasChanges) {
                    console.log('⚡ [Firebase Realtime] Terdeteksi penambahan/perubahan nilai di Cloud Firestore!');
                    if (typeof syncWithBackend === 'function') {
                        syncWithBackend(false);
                    }
                }
            }, err => {
                console.warn('Firebase realtime snapshot warning:', err.message);
            });

        console.log('📡 [Firebase Realtime] Listener aktif 24/7 di Cloud Firestore.');
    } catch (err) {
        console.warn('Gagal mengaktifkan Firebase realtime listener:', err);
    }
}
window.initFirebaseRealtime = initFirebaseRealtime;

/**
 * Tes koneksi ke Cloud Firestore
 */
async function testFirebaseConnection() {
    const db = window.firestoreDb || initFirebaseClient();
    if (!db) {
        return { success: false, message: 'Firebase belum terkonfigurasi atau SDK belum tersedia.' };
    }

    try {
        // Coba baca 1 dokumen dari koleksi
        const snap = await db.collection(FIRESTORE_COLLECTION).limit(1).get();
        return {
            success: true,
            message: `Terhubung ke Firestore (${snap.size} dokumen terdeteksi dalam sampel)`
        };
    } catch (err) {
        return {
            success: false,
            message: `Gagal terhubung: ${err.message}`
        };
    }
}
window.testFirebaseConnection = testFirebaseConnection;

// Jalankan inisialisasi awal saat skrip dimuat
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        initFirebaseClient();
        if (window.firestoreDb) {
            initFirebaseRealtime();
        }
    });
}
