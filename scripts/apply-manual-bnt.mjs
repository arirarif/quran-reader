// Applies hand-written Bangla উচ্চারণ for specific ayahs, overriding
// any auto-generated value. Style matches hadithbd.com / subah-dua.html:
// long vowels marked with `-`, sun-letter assimilation, ق → ক্ব,
// recitation-flow word merging.
//
// Each entry: { sno, n, bnt }. Run once after juz1.json is generated.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'juz1.json');

const MANUAL = [
  // ----- Surah Al-Faatiha (1) -----
  { sno: 1, n: 1, bnt: 'বিসমিল্লা-হির রাহমা-নির রাহী-ম।' },
  { sno: 1, n: 2, bnt: 'আলহামদু লিল্লা-হি রাব্বিল আ-লামী-ন।' },
  { sno: 1, n: 3, bnt: 'আর্‌রাহমা-নির রাহী-ম।' },
  { sno: 1, n: 4, bnt: 'মা-লিকি ইয়াওমিদ্‌দী-ন।' },
  { sno: 1, n: 5, bnt: 'ইয়্যা-কা না’বুদু ওয়া ইয়্যা-কা নাসতাঈ-ন।' },
  { sno: 1, n: 6, bnt: 'ইহদিনাস্‌ সিরা-তাল মুসতাক্বী-ম।' },
  { sno: 1, n: 7, bnt: 'সিরা-তাল্লাযী-না আন’আমতা আলাইহিম, গাইরিল মাগদূ-বি আলাইহিম ওয়ালাদ্‌দা-ল্লী-ন।' },
];

const raw = fs.readFileSync(DATA_PATH, 'utf8');
const ayahs = JSON.parse(raw);

let applied = 0;
for (const m of MANUAL) {
  const ayah = ayahs.find(a => a.sno === m.sno && a.n === m.n);
  if (!ayah) {
    console.warn(`  ! No ayah found for sno=${m.sno} n=${m.n}`);
    continue;
  }
  ayah.bnt = m.bnt;
  ayah.bntAuto = false;
  applied++;
}

fs.writeFileSync(DATA_PATH, JSON.stringify(ayahs, null, 0) + '\n', 'utf8');
console.log(`Applied ${applied} hand-written উচ্চারণ entries.`);
for (const m of MANUAL) {
  console.log(`  ${m.sno}:${m.n}  ${m.bnt}`);
}
