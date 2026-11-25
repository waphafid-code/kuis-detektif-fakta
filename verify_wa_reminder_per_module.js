// Pengingat WA "Semua Modul Aktif" harus menilai per modul, bukan satu catatan di modul mana pun.
const fs=require('fs');let f=0;const ok=(c,m)=>{if(!c){f++;console.log('FAIL',m)}};
const s=fs.readFileSync('js/dashboard.js','utf8');
ok(fs.readFileSync('js/dashboard.js','utf8')===fs.readFileSync('src/js/dashboard.js','utf8'),'src identik');
ok(/WA_REMINDER_MODULES\s*=\s*\[/.test(s)&&s.includes("modul_tryout_terpadu', label"),'daftar 5 modul');
ok(/modsToCheck\s*=\s*\(selectedModule === 'all'\)/.test(s),'cek per modul');
ok((s.match(/const selectedModule = modSelect/g)||[]).length===1,'tak ada deklarasi ganda');
ok(/remedialScore\) \|\| 0/.test(s),'nilai remedial diperhitungkan');
ok(/tooLong/.test(s),'penanganan pesan panjang');
console.log('fails='+f);process.exit(f?1:0);
