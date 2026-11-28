// Nilai tidak boleh hilang: tombstone berstempel waktu + beban sinkron tidak O(N^2) + simpan Firebase tangguh.
const fs=require('fs');let f=0;const ok=(c,m)=>{if(!c){f++;console.log('FAIL',m)}};
const rd=p=>fs.readFileSync(p,'utf8');
for(const p of ['js/audio.js','js/firebase_sync.js','js/dashboard.js','js/storage.js','js/app.js']) ok(rd(p)===rd('src/'+p),'src identik '+p);
const a=rd('js/audio.js'),fb=rd('js/firebase_sync.js'),d=rd('js/dashboard.js'),st=rd('js/storage.js');
ok(/function isTeacherSyncContext/.test(a)&&/if \(!showFeedback && !isTeacherSyncContext\(\)\) return false/.test(a),'sinkron otomatis hanya guru');
ok(/function initFirebaseRealtime\(\) \{\n[^]*?isTeacherSyncContext/.test(fb),'SSE Firebase hanya guru');
ok(/if \(realtimeChannel\) return;\n\s+if \(!isTeacherSyncContext\(\)\) return;/.test(a),'Supabase realtime hanya guru');
ok(/fetchFirebaseRecordsForStudent/.test(a),'cek siswa memakai unduhan tertarget');
ok(!/method: 'DELETE' \}\)\.catch/.test(a.split('async function saveRecord')[1].split('const currentRecords')[0]),'siswa tidak menghapus tombstone');
ok(/attempt < 3/.test(fb),'retry simpan Firebase');
ok(/_flushPendingBusy/.test(st)&&/getPendingRecords\(\)\.filter\(it => !sentStamps/.test(st),'antrean aman dari tumpang tindih');
ok(/markDeletedAt\(deletedRecords/.test(d)&&/initFirebaseRealtime\(\)/.test(d),'guru: cap waktu hapus + aktifkan realtime');
// perilaku filterDeletedRecords
const store={};global.localStorage={getItem:k=>store[k]??null,setItem:(k,v)=>store[k]=String(v),removeItem:k=>delete store[k]};
global.window=global;
const src=a.slice(a.indexOf('// Waktu kirim nilai'),a.indexOf('window.filterDeletedRecords'));
global.normalizeModuleId=(m)=>m||'modul_detektif_fakta';
eval(src+';global.filterDeletedRecords=filterDeletedRecords;');
const T=Date.parse('2026-11-28T09:00:00+07:00');
const mk=(score,ts,mod='modul_etika_privasi_keamanan')=>({name:'Nafla Aprillia Nengsih',class:'X E 2',moduleId:mod,score,timestamp:ts});
store.quizmaster_deleted_records=JSON.stringify(['nafla aprillia nengsih|XE2|modul_etika_privasi_keamanan']);
store.quizmaster_deleted_at=JSON.stringify({'nafla aprillia nengsih|XE2|modul_etika_privasi_keamanan':T});
let out=filterDeletedRecords([mk(64,T-5000),mk(64,T+60000),mk(80,T+900000),{...mk(70,0),moduleId:'modul_detektif_fakta'}]);
ok(out.length===3&&!out.some(r=>r.timestamp===T-5000),'nilai sebelum hapus tersembunyi, sesudahnya tampil');
// tombstone lama tanpa cap waktu: nilai hari ini tampil, baseline lama tetap tersembunyi
delete store.quizmaster_deleted_at;
out=filterDeletedRecords([mk(90,0),mk(64,Date.parse('2026-11-20T10:00:00+07:00')),mk(64,T),mk(80,T+1000)]);
ok(out.length===2&&out.every(r=>r.timestamp>=T),'tombstone lama: nilai baru tampil, lama tersembunyi');
store.quizmaster_deleted_records=JSON.stringify(['__ALL__']);ok(filterDeletedRecords([mk(64,T)]).length===0,'__ALL__ tetap menghapus semua');
ok(/function moduleTitleFor/.test(a)&&!/modId === 'modul_jaringan_keamanan' \? 'Penilaian Harian/.test(a),'judul modul terpusat (Etika/HKI tidak lagi berlabel Detektif Fakta)');
console.log('fails='+f);process.exit(f?1:0);
