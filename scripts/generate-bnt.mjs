// Auto-generates Bangla-script উচ্চারণ (transliteration) for each ayah
// in src/data/juz1.json by mapping Arabic letters + diacritics to Bangla
// phonetic equivalents. This is a best-effort phonetic conversion — not
// sourced from a printed mushaf — so emphatic letters (ص ض ط ظ) collapse
// to their plain Bangla equivalents.
//
// Run: node scripts/generate-bnt.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'juz1.json');

// ---- Arabic → Bangla phonetic tables ----------------------------------

const CONS = {
  'ا': '',   // alef = vowel carrier (silent on its own)
  'أ': '',   // alef + hamza above
  'إ': '',   // alef + hamza below
  'آ': 'আ',  // alef + madda (long ā at start of word)
  'ٱ': '',   // alef wasla (silent connector)
  'ب': 'ব',
  'ت': 'ত',
  'ث': 'স',  // emphatic-th, collapses to স
  'ج': 'জ',
  'ح': 'হ',
  'خ': 'খ',
  'د': 'দ',
  'ذ': 'য',
  'ر': 'র',
  'ز': 'য',
  'س': 'স',
  'ش': 'শ',
  'ص': 'স',
  'ض': 'দ',
  'ط': 'ত',
  'ظ': 'য',
  'ع': "'",  // 'ayn → glottal mark
  'غ': 'গ',
  'ف': 'ফ',
  'ق': 'ক',
  'ك': 'ক',
  'ل': 'ল',
  'م': 'ম',
  'ن': 'ন',
  'ه': 'হ',
  'و': 'ও',  // waw — context-dependent (handled below)
  'ي': 'য়',
  'ى': '',   // alif maqsura — vowel carrier
  'ء': "'",  // hamza → glottal
  'ة': 'হ',  // ta marbuta — usually 'h' at pause
};

// Diacritics applied AFTER a consonant
const FATHA  = 'َ'; // َ  → আ-kar (া)
const KASRA  = 'ِ'; // ِ  → ই-kar (ি)
const DAMMA  = 'ُ'; // ُ  → উ-kar (ু)
const SUKUN  = 'ْ'; // ْ  → halant (্)
const SHADDA = 'ّ'; // ّ  → doubles previous consonant
const TANWIN_FATHA = 'ً'; // ً  → ান
const TANWIN_KASRA = 'ٍ'; // ٍ  → িন
const TANWIN_DAMMA = 'ٌ'; // ٌ  → ুন
const DAGGER_ALEF  = 'ٰ'; // ٰ  → আ-kar (long)
const MADDA        = 'ٓ'; // ٓ  → lengthens (handled minimally)

const VOWEL_KAR = {
  [FATHA]: 'া',
  [KASRA]: 'ি',
  [DAMMA]: 'ু',
  [DAGGER_ALEF]: 'া',
};

// Standalone vowel forms (when a vowel sound starts a word)
const VOWEL_STANDALONE = {
  [FATHA]: 'আ',
  [KASRA]: 'ই',
  [DAMMA]: 'উ',
  [DAGGER_ALEF]: 'আ',
};

function isArabicLetter(c) {
  return CONS.hasOwnProperty(c);
}
function isDiacritic(c) {
  return c === FATHA || c === KASRA || c === DAMMA || c === SUKUN ||
         c === SHADDA || c === TANWIN_FATHA || c === TANWIN_KASRA ||
         c === TANWIN_DAMMA || c === DAGGER_ALEF || c === MADDA;
}

// ---- Main converter ---------------------------------------------------

function transliterate(arabic) {
  // Strip BOM and ZWJ/ZWNJ
  let text = arabic.replace(/[﻿‌‍]/g, '');

  let out = '';
  let i = 0;
  // Track whether the last non-space output token was a "vowelled consonant"
  // (so we know if a following ا is a long-ā lengthener vs. a fresh letter).
  let lastWasVowelledCons = false;
  let lastVowel = null; // 'a' | 'i' | 'u' | null

  // Helper to peek diacritics following position i (skip combining marks)
  function diacAt(pos) {
    return text[pos];
  }

  while (i < text.length) {
    const c = text[i];

    // whitespace and punctuation pass through
    if (/\s/.test(c)) {
      out += c;
      i++;
      lastWasVowelledCons = false;
      lastVowel = null;
      continue;
    }
    if (!isArabicLetter(c) && !isDiacritic(c)) {
      // Unknown — skip
      i++;
      continue;
    }

    if (isDiacritic(c)) {
      // Stray diacritic (shouldn't happen, but skip)
      i++;
      continue;
    }

    // It's a consonant/letter. Look at the diacritics that follow it.
    let letter = c;
    i++;

    let hasShadda = false;
    let vowel = null;       // 'a' | 'i' | 'u' | 'an' | 'in' | 'un' | null
    let hasSukun = false;
    let lengthen = false;   // true if followed by long-vowel marker (ا/و/ي as madd)

    while (i < text.length && isDiacritic(text[i])) {
      const d = text[i];
      if (d === SHADDA) hasShadda = true;
      else if (d === FATHA) vowel = 'a';
      else if (d === KASRA) vowel = 'i';
      else if (d === DAMMA) vowel = 'u';
      else if (d === SUKUN) hasSukun = true;
      else if (d === TANWIN_FATHA) vowel = 'an';
      else if (d === TANWIN_KASRA) vowel = 'in';
      else if (d === TANWIN_DAMMA) vowel = 'un';
      else if (d === DAGGER_ALEF) { vowel = 'a'; lengthen = true; }
      // MADDA: ignore (handled via آ)
      i++;
    }

    // Look ahead: is next a long-vowel letter that lengthens this vowel?
    // ا after fatha → long ā (no extra char in Bangla, just emit আ-kar — already handled)
    // و after damma → long ū (we emit আ-kar = ু — same kar, treat as same)
    // ي/ى after kasra → long ī
    // We "consume" the lengthener if it has no diacritic (i.e. acts as madd letter).
    if (i < text.length) {
      const nxt = text[i];
      const after = text[i+1];
      const nextIsBare = after === undefined || (!isDiacritic(after) || after === SUKUN);
      if (vowel === 'a' && (nxt === 'ا' || nxt === 'ى') && nextIsBare) {
        lengthen = true;
        i++; // consume madd letter
      } else if (vowel === 'i' && (nxt === 'ي' || nxt === 'ى') && nextIsBare) {
        lengthen = true;
        i++;
      } else if (vowel === 'u' && nxt === 'و' && nextIsBare) {
        lengthen = true;
        i++;
      }
    }

    // ---- Emit Bangla -------------------------------------------------

    // Special: word-initial alef variants act as vowel carriers
    const isWordStart = out.length === 0 || /\s$/.test(out);
    if ((c === 'ا' || c === 'أ' || c === 'إ' || c === 'ٱ') && isWordStart) {
      // Standalone vowel
      const v = vowel || 'a';
      const stand = v === 'i' ? 'ই' : v === 'u' ? 'উ' : 'আ';
      out += stand;
      // Tanwin endings on alef (rare at start) — skip
      lastWasVowelledCons = true;
      lastVowel = v;
      continue;
    }

    // Bare alef mid-word (madd lengthener that wasn't consumed) — skip silently
    if (c === 'ا' || c === 'ٱ' || c === 'ى' || c === 'أ' || c === 'إ') {
      if (vowel) {
        // Treat as vowel carrier with this vowel — emit standalone form
        const stand = vowel === 'i' ? 'ই' : vowel === 'u' ? 'উ' : 'আ';
        out += stand;
        lastWasVowelledCons = true;
        lastVowel = vowel;
      }
      // else silent
      continue;
    }
    if (c === 'آ') {
      out += 'আ';
      lastWasVowelledCons = true;
      lastVowel = 'a';
      continue;
    }

    let cons = CONS[letter] ?? '';
    if (!cons) { continue; }

    // Waw and ya act as consonants 'w' and 'y' when they carry a vowel
    // → emit ওয় / য় instead of plain ও / য়
    if (letter === 'و' && vowel) {
      cons = 'ওয়';  // wa/wi/wu base — vowel sign follows
    } else if (letter === 'ي' && vowel) {
      cons = 'ইয়';  // ya/yi/yu base
    }

    // Doubling via shadda: cons + halant + cons (Bangla conjunct)
    if (hasShadda) {
      out += cons + '্' + cons;
    } else {
      out += cons;
    }

    // Append vowel sign / tanwin. We deliberately skip emitting halant
    // for plain sukun — Bangla Quran transliteration convention writes
    // adjacent consonants without halants (e.g. ٱلْحَمْدُ → আলহামদু).
    if (vowel === 'a') {
      out += 'া';
    } else if (vowel === 'i') {
      out += 'ি';
    } else if (vowel === 'u') {
      out += 'ু';
    } else if (vowel === 'an') {
      out += 'ান';
    } else if (vowel === 'in') {
      out += 'িন';
    } else if (vowel === 'un') {
      out += 'ুন';
    }
    // sukun and bare-no-marker: emit nothing (just the consonant)

    lastWasVowelledCons = vowel !== null && !hasSukun;
    lastVowel = vowel;
  }

  // Cleanup passes ------------------------------------------------------

  // Common idiomatic fixes
  out = out
    // আল + ল্লাহ → আল্লাহ (the ٱل definite article merging into "Allah")
    .replace(/আলল্ল/g, 'আল্ল')
    // Sun-letter assimilation: ٱل + sun letter drops the ل.
    // Match "আল" + sun-letter-conjunct (X্X) and remove the ল.
    .replace(/আলত্ত/g, 'আত্ত')
    .replace(/আলস্স/g, 'আস্স')
    .replace(/আলদ্দ/g, 'আদ্দ')
    .replace(/আলয্য/g, 'আয্য')
    .replace(/আলর্র/g, 'আর্র')
    .replace(/আলশ্শ/g, 'আশ্শ')
    .replace(/আলন্ন/g, 'আন্ন')
    // ٱللَّه pattern fallbacks
    .replace(/(^|\s)ল্লাহ/g, '$1আল্লাহ')
    .replace(/(^|\s)ল্লাহি/g, '$1আল্লাহি')
    .replace(/(^|\s)ল্লাহু/g, '$1আল্লাহু')
    // Collapse triple-letter artifacts and stray double halants
    .replace(/্্+/g, '্')
    // Remove trailing halant before space or end
    .replace(/্(\s|$)/g, '$1')
    // Collapse multi-spaces (when ۛ/۞ recitation marks were stripped)
    .replace(/\s{2,}/g, ' ');

  return out.trim();
}

// ---- Run --------------------------------------------------------------

const raw = fs.readFileSync(DATA_PATH, 'utf8');
const ayahs = JSON.parse(raw);

let updated = 0;
for (const a of ayahs) {
  if (!a.bnt || a.bntAuto) {
    a.bnt = transliterate(a.ar);
    a.bntAuto = true;
    updated++;
  }
}

fs.writeFileSync(DATA_PATH, JSON.stringify(ayahs, null, 0) + '\n', 'utf8');
console.log(`Updated ${updated}/${ayahs.length} ayahs with auto-generated bnt.`);
console.log('Sample:');
for (const sample of [0, 1, 7, 8, 50]) {
  if (ayahs[sample]) {
    console.log(`  ${ayahs[sample].se} ${ayahs[sample].sno}:${ayahs[sample].n}`);
    console.log(`    ar : ${ayahs[sample].ar}`);
    console.log(`    bnt: ${ayahs[sample].bnt}`);
  }
}
