/**
 * Character leitmotifs. Each character has one melody (MATERIAL) and at
 * least two arrangements:
 *   theme:<id>:town  the gentle variation that plays around town
 *   theme:<id>       their full entrance theme at shows
 * Extras: theme:dex:away (Dex's town theme with one instrument missing while
 * he is in the city) and theme:dustdevil (Clint's masked alter ego: the same
 * melody in a minor key).
 */
import type { SongDef } from '../notation';
import { DUCHESS, SHUFFLE, VELVET } from './motifs';
import { onlyBars, slice, tr } from './util';

export interface Part {
  chords: string;
  mel: string;
  /** Optional second voice. */
  harm?: string;
}

export interface Material {
  key: string;
  meter?: number;
  swing?: number;
  A: Part;
  B: Part;
}

export const MATERIAL: Record<string, Material> = {
  birdie: { key: SHUFFLE.key, swing: 0.3, A: SHUFFLE.A, B: SHUFFLE.B },
  grandma: { key: DUCHESS.key, meter: 3, A: DUCHESS.A, B: DUCHESS.B },
  velvet: { key: VELVET.key, meter: 3, A: VELVET.A, B: VELVET.B },
  // "Alas de Oro": marimba over cumbia; each phrase ends with wings settling.
  mariposa: {
    key: 'A',
    A: {
      chords: 'Am | Dm | G | C | F | Dm | E7 | Am',
      mel: 'E5e A5e C6e B5e A5q E5q | F5e A5e D6e C6e A5q F5q | D5e G5e B5e A5e G5q D5q | E5e G5e C6e B5e C6h | A5q. G5e F5q C5q | D5q. E5e F5q A5q | G#5q. F5e E5q D5q | C5s E5s A5s C6s E6s C6s A5s E5s A5h',
    },
    B: {
      chords: 'F | G | Em7 | Am | Dm7 | G7 | Cmaj7 | E7',
      mel: 'A5q. C6e A5q F5q | B5q. D6e B5q G5q | G5q. B5e D6q B5q | C6h A5h | F5q. A5e C6q D6q | B5q. A5e G5q F5q | E5q. G5e B5q C6q | B4s E5s G#5s B5s E6s B5s G#5s E5s B5h',
    },
  },
  // "The Mountain and the Sparrow": a tuba below, a music-box sparrow above.
  earl: {
    key: 'C',
    A: {
      chords: 'C | Am | F | G | C | Am | Dm7 G7 | C',
      mel: "G5e' C6e' E6q D6e' C6e' G5q | A5e' C6e' E6q D6e' C6e' A5q | F5e' A5e' C6q B5e' A5e' G5q | D6q B5q G5q rq | G5e' C6e' E6q D6e' C6e' G5q | A5e' C6e' E6q G6q E6q | F6q. E6e D6q B5q | C6h. rq",
    },
    B: {
      chords: 'F | C/E | Dm7 | G | F | C/E | Fm6 | G7',
      mel: 'A5q. C6e F6q E6q | G5h. E5q | F5q. A5e C6q A5q | B5h. D6q | A5q. C6e F6q E6q | G6h. E6q | Ab5q. F5e D5q C5q | B4h D5q F5q',
    },
  },
  // "Never Stop Flying": pop-punk, and yes, I-V-vi-IV.
  dex: {
    key: 'E',
    A: {
      chords: 'E | B | C#m | A | E | B | A | B',
      mel: 'G#4e B4e E5q E5e F#5e G#5q | F#5q. D#5e B4h | G#4e B4e C#5q C#5e D#5e E5q | C#5q. B4e A4h | G#4e B4e E5q E5e F#5e G#5q | B5q. A5e F#5q D#5q | E5q. F#5e A5q G#5q | F#5h. rq',
    },
    B: {
      chords: 'A | E | B | C#m | A | E | B | B7',
      mel: 'C#5e E5e A5q. G#5e F#5e E5e | G#5q. E5e B4h | D#5e F#5e B5q. A5e G#5e F#5e | G#5h. rq | C#6q. B5e A5q E5q | G#5q. F#5e E5q B4q | D#5q F#5q B5q D#6q | F#5h. A5q',
    },
  },
  // "Mirror, Mirror": a strut with a glissando hair flip every four bars.
  gideon: {
    key: 'A',
    A: {
      chords: 'Am9 | D9 | Am9 | D9 | Fmaj7 | E7 | Am9 | E7#9',
      mel: "A5e' re A5e' G5e E5q. D5e | E5q F#5q. A5e -q | A5e' re A5e' G5e E5q. G5e | C5t D5t E5t F#5t G5t A5t B5t C6t E6h. | C6q. A5e E5q C5q | D6q. B5e G#5q E5q | C6e B5e A5e G5e A5h | E5t F#5t G#5t A5t B5t C6t D6t E6t G6h.",
    },
    B: {
      chords: 'Dm9 | G13 | Cmaj7 | Fmaj7 | Bm7b5 | E7 | Am9 | E7',
      mel: 'F5q. A5e C6q E6q | D6q. B5e F5q E5q | E5q. G5e B5h | A5q. C6e E6h | D6q. C6e B5q A5q | G#5q. B5e D6h | C6e B5e A5e G5e E5h | E5t F#5t G#5t A5t B5t C6t D6t E6t G#6h.',
    },
  },
  // "Measure Twice": two lines that almost clash, and always resolve.
  twins: {
    key: 'G',
    A: {
      chords: 'G | C | G | D | G | C | D7 | G',
      mel: 'D5q. B4e G4q B4q | C5q. E5e G5q E5q | D5q. B4e G4q D5q | F#5h A5h | G5q. F#5e E5q D5q | E5q. D5e C5q E5q | D5q. C5e A4q F#4q | G4h. rq',
      harm: 'B4q. G4e D4q G4q | A4q. C5e E5q C5q | B4q. G4e D4q B4q | D5h F#5h | E5q. D5e C5q B4q | C5q. B4e A4q C5q | C5q. A4e F#4q D4q | B4h. rq',
    },
    B: {
      chords: 'C | G/B | Am | D | C | G/B | A7 | D7',
      mel: 'E5q G5q E5q C5q | D5q. B4e G4h | C5q E5q A5q G5q | F#5h. D5q | E5q G5q C6q B5q | D6q. B5e G5h | C#6q. A5e E5q C#5q | D5h. rq',
      harm: 'C5q B4q C5q E5q | B4q. D5e B4h | A4q C5q F#5q E5q | A5h. F#5q | C5q E5q A5q G5q | B5q. G5e D5h | A5q. E5e C#5q A4q | D5h. rq',
    },
  },
  // "Category Five": gusts up, and the calm in the eye.
  hazel: {
    key: 'D',
    A: {
      chords: 'Bm | Gmaj7 | Em7 | F#7sus4 F#7 | Bm | Gmaj7 | Em7 A | D',
      mel: 'F#4e B4e D5e F#5e -h | G5q. F#5e D5h | E5e G5e B5e D6e -q B5q | B5h A#5h | F#4e B4e D5e F#5e -q B5q | A5q. G5e F#5q D5q | G5q. F#5e E5q C#5q | D5w',
    },
    B: {
      chords: 'G | A | F#m7 | Bm | G | A | F# | F#7',
      mel: 'B5q. A5e G5q D5q | C#6q. B5e A5q E5q | A5q. G#5e F#5q C#5q | D5h. F#5q | B5q. D6e B5q G5q | C#6q. E6e C#6q A5q | A#5q. C#6e F#6h | E6q. C#6e A#5h',
    },
  },
  // "Dust and Denim": a harmonica shuffle. The Dust Devil plays it in minor.
  clint: {
    key: 'A',
    swing: 0.25,
    A: {
      chords: 'A | D/A | A | E7 | A | D | A E7 | A',
      mel: 'E4e A4e C#5q -e B4e A4q | F#4q. A4e D5h | C#5e E5e~ C#5q B4e A4e E4q | G#4q. B4e D5q B4q | E4e A4e C#5q -e B4e A4q | F#5q. E5e D5q A4q | C#5q. A4e B4q G#4q | A4h. rq',
    },
    B: {
      chords: 'D | D | A | A | B7 | B7 | E7 | E7',
      mel: 'A5q. F#5e D5q F#5q | E5q. D5e B4h | C#5q. E5e A5q E5q | C#5h. rq | D#5q. F#5e A5q F#5q | B5q. A5e F#5h | G#5q. F#5e E5q D5q | B4h. rq',
    },
  },
  // "Tuck-In": a 6/8 lullaby.
  tiny: {
    key: 'G',
    meter: 3,
    A: {
      chords: 'G | C/G | G | D7 | G | C | G/D D7 | G',
      mel: 'D5q B4e D5q B4e | E5q C5e E5q C5e | D5q B4e G5q. | F#5q. A4q. | B4q D5e G5q B5e | A5q G5e E5q. | D5q. C5e B4e A4e | G4h.',
    },
    B: {
      chords: 'Em | C | G | D | Em | C | Am7 D7 | G',
      mel: 'B4q E5e G5q E5e | G5q E5e C5q. | B4q D5e G5q D5e | F#5h. | G5q B5e A5q G5e | E5q G5e C6q. | B5q. A5e F#5e D5e | G5h.',
    },
  },
  // The Mothman: a theremin, and a little moth flutter.
  mothman: {
    key: 'E',
    A: {
      chords: 'Em | Cmaj7 | Am7 | B7 | Em | Cmaj7 | F#m7b5 | B7',
      mel: 'B4h G5q~ F#5q | E5h. B4q | C5q. E5e~ A5h | D#5q E5s D#5s C#5s D#5s B4h | B4h G5q~ F#5q | E5q. G5e~ B5h | A5q. G5e F#5q E5q | D#5q E5s D#5s C#5s D#5s B4h',
    },
    B: {
      chords: 'C | D | Bm7 | Em | C | D | B7sus4 | B7',
      mel: 'G5q. E5e C5q E5q | F#5q. A5e D6h | B5q. A5e F#5q D5q | E5h. rq | G5q. C6e E6q~ C6q | F#6q. D6e A5h | E5q. F#5e B5h | D#6q E6s D#6s C#6s D#6s B5h',
    },
  },
  // "Professor" Pinfall: a two-part invention. Maths you can dance to.
  professor: {
    key: 'D',
    A: {
      chords: 'Dm | A7 | Dm | C | F | Gm A7 | Dm | A7',
      mel: 'D5s E5s F5s G5s A5e D5e C#6e D6e A5e F5e | E5s F5s G5s A5s Bb5e E5e C#5e E5e A4e G4e | F5s G5s A5s Bb5s C6e F5e E5e D5e C#5e D5e | E5s F5s G5s A5s G5e C5e E5e G5e C6e Bb5e | A5s Bb5s C6s D6s C6e F5e A5e C6e F6e C6e | Bb5s A5s G5s F5s G5e Bb5e A5e C#6e E6e C#6e | D6s C#6s D6s E6s F6e D6e A5e F5e D5e F5e | E5s F5s E5s D5s C#5e E5e A5h',
    },
    B: {
      chords: 'F | C7 | Dm | A7 | Bb | Gm7 | E7 | A7',
      mel: 'C6s Bb5s A5s G5s F5e A5e C6e F6e C6e A5e | Bb5s A5s G5s F5s E5e G5e Bb5e C6e Bb5e G5e | A5s G5s F5s E5s D5e F5e A5e D6e A5e F5e | G5s F5s E5s D5s C#5e E5e A5e C#6e A5e E5e | D6s C6s Bb5s A5s Bb5e F5e D5e F5e Bb5e D6e | Bb5s A5s G5s F5s G5e D5e Bb4e D5e G5e Bb5e | G#5s F#5s E5s D5s E5e B4e G#4e B4e E5e G#5e | A5s G5s F5s E5s C#5e E5e A5h',
    },
  },
  // "Sweet Lou": sweet 70s soul.
  lou: {
    key: 'Eb',
    A: {
      chords: 'Ebmaj7 | Cm7 | Fm7 | Bb7 | Ebmaj7 | Cm7 | Abmaj7 Bb7 | Eb6',
      mel: 'Bb4e Eb5e G5e Bb5e -q G5q | Bb5q. G5e Eb5h | Ab5e G5e F5e Eb5e C5q Ab4q | D5h. rq | Bb4e Eb5e G5e Bb5e -q C6q | Bb5q. G5e F5q Eb5q | C5q Eb5q D5q F5q | Eb5h. rq',
    },
    B: {
      chords: 'Abmaj7 | Gm7 | Fm7 | Bb7 | Abmaj7 | Gm7 C7 | Fm7 | Bb7sus4',
      mel: 'C6q. Bb5e G5q Eb5q | Bb5q. F5e D5h | Ab5q. G5e F5q C5q | D5q F5q Ab5q Bb5q | C6q. Eb6e C6q G5q | Bb5q. G5e E5q Bb4q | Ab5q. G5e F5q Eb5q | F5w',
    },
  },
};

export const CHARACTER_IDS = [
  'birdie', 'earl', 'mariposa', 'dex', 'gideon', 'twins', 'hazel', 'clint', 'mothman', 'tiny', 'professor', 'lou', 'grandma', 'velvet',
] as const;

const M = MATERIAL;

// ─── Birdie: "Sugar's Shuffle" ──────────────────────────────────────────────

const birdieTown: SongDef = {
  id: 'theme:birdie:town',
  title: "Sugar's Shuffle (porch radio)",
  bpm: 104,
  swing: 0.3,
  key: 'G',
  tracks: {
    keys: { inst: 'keys', echo: 0.15 },
    comp: { inst: 'keys', vol: 0.55, center: 58 },
    bass: { inst: 'bassPluck' },
    drums: { inst: 'kit', vol: 0.35 },
  },
  sections: {
    A: { chords: M.birdie.A.chords, keys: M.birdie.A.mel, comp: '@rq cq rq cq', bass: '@1q 3q 5q Aq', drums: '....x.......x...' },
    B: { chords: M.birdie.B.chords, keys: M.birdie.B.mel, comp: '@rq cq rq cq', bass: '@1q 3q 5q Aq', drums: '....x.......x...' },
  },
  form: ['A', 'B', 'A', 'B'],
  fx: { lowpass: 2800, crackle: 0.1 },
};

const birdieEntrance: SongDef = {
  id: 'theme:birdie',
  title: "Sugar's Shuffle (entrance)",
  bpm: 112,
  swing: 0.28,
  key: 'G',
  tracks: {
    keys: { inst: 'keys', vol: 1.1, echo: 0.15 },
    lead: { inst: 'lead', vol: 0.6, echo: 0.2 },
    brass: { inst: 'brass', vol: 0.9 },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.6 },
    perc: { inst: 'kit', vol: 0.45 },
  },
  sections: {
    I: { chords: 'G | D7', brass: '@cq rq rh', drums: 'u.u.p...u.u.p...|u.u.p...u.u.pppp', bass: '@1q rq rh' },
    A: {
      chords: M.birdie.A.chords,
      keys: M.birdie.A.mel,
      lead: M.birdie.A.mel,
      brass: '@ce! re rq ce! re rq',
      bass: '@1q 3q 5q Aq',
      drums: 'u.u.p...u.u.p...',
      perc: 'c...............|[....h.......h...|]*7',
    },
    B: {
      chords: M.birdie.B.chords,
      keys: M.birdie.B.mel,
      lead: M.birdie.B.mel,
      brass: '@cq. ce re cq.',
      bass: '@1q 3q 5q Aq',
      drums: 'u.u.p...u.u.p...',
      perc: 'c...............|[....h.......h...|]*7',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'B'],
};

// ─── Grandma Dottie: "The Duchess Waltz" ────────────────────────────────────

const grandmaTown: SongDef = {
  id: 'theme:grandma:town',
  title: 'The Duchess Waltz (humming from memory)',
  bpm: 72,
  meter: 3,
  key: 'F',
  echo: { beats: 1, feedback: 0.38, wet: 0.38 },
  tracks: {
    box: { inst: 'musicbox', echo: 0.45 },
    pad: { inst: 'pad', center: 60 },
  },
  sections: {
    A: { chords: M.grandma.A.chords, box: M.grandma.A.mel, pad: '@pad' },
    B: { chords: M.grandma.B.chords, box: M.grandma.B.mel, pad: '@pad' },
    // On foggy days one phrase drops out and the melody waits for it.
    A2: { chords: M.grandma.A.chords, box: onlyBars(M.grandma.A.mel, (i) => i !== 4 && i !== 5, 3), pad: '@pad' },
  },
  form: ['A', 'B', 'A2', 'B'],
};

const grandmaEntrance: SongDef = {
  id: 'theme:grandma',
  title: 'The Duchess Waltz (entrance)',
  bpm: 92,
  meter: 3,
  key: 'F',
  tracks: {
    acc: { inst: 'accordion', echo: 0.2 },
    fiddle: { inst: 'fiddle', vol: 0.8, pan: 0.25 },
    strings: { inst: 'strings' },
    keys: { inst: 'keys', vol: 0.6, center: 62 },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.45 },
  },
  sections: {
    // The velvet curtain.
    I: { chords: 'F | C7', strings: '@pad', fiddle: 'C5h. | C5h E5q', drums: '/8 c.....|..x.x.' },
    A: { chords: M.grandma.A.chords, acc: M.grandma.A.mel, keys: '@rq cq cq', bass: '@1q rh 5,q rh', drums: '/8 k.x.x.' },
    B: {
      chords: M.grandma.B.chords,
      acc: M.grandma.B.mel,
      fiddle: tr(M.grandma.B.mel, -12),
      strings: '@pad',
      keys: '@rq cq cq',
      bass: '@1q rh 5,q rh',
      drums: '/8 [k.x.x.|]*7 k.xxxx',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'B'],
};

// ─── The Velvet Hammers ─────────────────────────────────────────────────────

const velvetTown: SongDef = {
  id: 'theme:velvet:town',
  title: 'The Velvet Hammers (keepsake)',
  bpm: 84,
  meter: 3,
  key: 'Bb',
  echo: { beats: 1.5, feedback: 0.38, wet: 0.36 },
  tracks: {
    box: { inst: 'musicbox', echo: 0.45 },
    whistle: { inst: 'whistle', vol: 0.8, echo: 0.35 },
    pad: { inst: 'pad', center: 60 },
    bass: { inst: 'bassPluck', vol: 0.7 },
  },
  sections: {
    A: { chords: M.velvet.A.chords, box: M.velvet.A.mel, pad: '@pad', bass: '@1q. 5,q.' },
    B: { chords: M.velvet.B.chords, whistle: M.velvet.B.mel, pad: '@pad', bass: '@1q. 5,q.' },
  },
  form: ['A', 'B', 'A'],
};

const velvetEntrance: SongDef = {
  id: 'theme:velvet',
  title: 'The Velvet Hammers',
  bpm: 100,
  meter: 3,
  key: 'Bb',
  echo: { beats: 1.5, feedback: 0.34, wet: 0.32 },
  tracks: {
    lead: { inst: 'lead', echo: 0.3 },
    acc: { inst: 'accordion', vol: 0.8, pan: -0.2 },
    keys: { inst: 'keys', vol: 0.8, center: 60, pan: 0.2 },
    brass: { inst: 'brass', vol: 0.85 },
    strings: { inst: 'strings' },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.55 },
  },
  sections: {
    I: { chords: 'Bb | F7', brass: '@cq. rq.', strings: '@pad', drums: '/8 c..s..|k.sssS' },
    A: {
      chords: M.velvet.A.chords,
      lead: M.velvet.A.mel,
      acc: tr(M.velvet.A.mel, -12),
      brass: '@cq. rq.',
      keys: '@re ce ce re ce ce',
      strings: '@pad',
      bass: '@1q. 5,q.',
      drums: '/8 c..s..|[k..s..|]*14 k.ssss',
    },
    B: {
      chords: M.velvet.B.chords,
      lead: M.velvet.B.mel,
      acc: tr(M.velvet.B.mel, -12),
      keys: '@re ce ce re ce ce',
      strings: '@pad',
      bass: '@1q. 5,q.',
      drums: '/8 [k..s..|]*7 k.ssss',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A'],
};

// ─── La Mariposa Dorada: "Alas de Oro" ──────────────────────────────────────

const CUMBIA_BASS = '@1q 5,e 5,e 1q 5,q';
const GUIRO = 'g.ggg.ggg.ggg.gg';

const mariposaTown: SongDef = {
  id: 'theme:mariposa:town',
  title: 'Alas de Oro (taqueria radio)',
  bpm: 96,
  key: 'A',
  tracks: {
    lead: { inst: 'marimba', echo: 0.2 },
    guitar: { inst: 'pluck', vol: 0.7, center: 60 },
    pad: { inst: 'pad', vol: 0.7, center: 60 },
    bass: { inst: 'bassPluck' },
    drums: { inst: 'kit', vol: 0.4 },
    perc: { inst: 'kit', vol: 0.3 },
  },
  sections: {
    A: { chords: M.mariposa.A.chords, lead: M.mariposa.A.mel, guitar: '@re ce re ce re ce re ce', bass: CUMBIA_BASS, drums: 'k...x.k.k...x.k.', perc: GUIRO },
    B: { chords: M.mariposa.B.chords, lead: M.mariposa.B.mel, guitar: '@re ce re ce re ce re ce', pad: '@pad', bass: CUMBIA_BASS, drums: 'k...x.k.k...x.k.', perc: GUIRO },
  },
  form: ['A', 'B', 'A', 'B'],
};

const mariposaEntrance: SongDef = {
  id: 'theme:mariposa',
  title: 'Alas de Oro (entrance)',
  bpm: 128,
  key: 'A',
  tracks: {
    lead: { inst: 'trumpet', echo: 0.2 },
    harm: { inst: 'brass', vol: 0.8, center: 64 },
    xylo: { inst: 'marimba', vol: 0.8, pan: 0.25 },
    arp: { inst: 'arp25', vol: 0.9, center: 66, pan: -0.25 },
    guitar: { inst: 'pluck', vol: 0.7, center: 60 },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.55 },
    perc: { inst: 'kit', vol: 0.4 },
  },
  sections: {
    // The butterflies are released: a full flight of arpeggios.
    I: { chords: 'Am | E7', arp: '@[1s 3s 5s 8s 3^s 5^s 8^s 5^s]*2', drums: 'k...............|s.s.s.s.ssssSSSS' },
    A: {
      chords: M.mariposa.A.chords,
      lead: M.mariposa.A.mel,
      harm: '@3q 5q 3q 5q',
      guitar: '@re ce re ce re ce re ce',
      bass: CUMBIA_BASS,
      drums: 'k.b.k.bbk.b.k.bb',
      perc: GUIRO,
    },
    B: {
      chords: M.mariposa.B.chords,
      lead: M.mariposa.B.mel,
      xylo: tr(M.mariposa.B.mel, -12),
      guitar: '@re ce re ce re ce re ce',
      bass: CUMBIA_BASS,
      drums: 'k.b.k.bbk.b.k.bb',
      perc: GUIRO,
    },
    F: {
      chords: 'Am | F | G | E7',
      arp: '@[1s 3s 5s 8s 3^s 5^s 8^s 5^s]*2',
      xylo: "A5e' C6e' E6e' C6e' A5e' E5e' C5e' E5e' | F5e' A5e' C6e' A5e' F5e' C5e' A4e' C5e' | G5e' B5e' D6e' B5e' G5e' D5e' B4e' D5e' | E5e' G#5e' B5e' D6e' E6h",
      bass: CUMBIA_BASS,
      drums: 'k.b.k.bbk.b.k.bb|k.b.k.bbk.b.k.bb|k.b.k.bbk.b.k.bb|s.s.s.s.ssssSSSS',
      perc: GUIRO,
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'F'],
};

// ─── Big Earl: "The Mountain and the Sparrow" ───────────────────────────────

const TUBA = '@1q 5,q 3q 5,q';

const earlTown: SongDef = {
  id: 'theme:earl:town',
  title: 'The Mountain and the Sparrow',
  bpm: 72,
  key: 'C',
  tracks: {
    box: { inst: 'musicbox', echo: 0.4 },
    tuba: { inst: 'tuba' },
    pad: { inst: 'pad', vol: 0.7, center: 60 },
  },
  sections: {
    A: { chords: M.earl.A.chords, box: M.earl.A.mel, tuba: TUBA, pad: '@pad' },
    B: { chords: M.earl.B.chords, box: M.earl.B.mel, tuba: '@1h 5,h', pad: '@pad' },
  },
  form: ['A', 'B', 'A', 'B'],
};

const earlEntrance: SongDef = {
  id: 'theme:earl',
  title: 'The Mountain (entrance)',
  bpm: 84,
  key: 'C',
  minor: true,
  tracks: {
    box: { inst: 'musicbox', vol: 0.6, echo: 0.5 },
    tuba: { inst: 'tuba', vol: 1.1 },
    power: { inst: 'power', vol: 0.9, center: 45 },
    strings: { inst: 'strings', vol: 0.8 },
    drums: { inst: 'kit', vol: 0.65 },
    perc: { inst: 'kit', vol: 0.6 },
  },
  sections: {
    I: { chords: 'C | G', strings: '@pad', perc: 'n...............|........t...t.mm' },
    A: {
      chords: M.earl.A.chords,
      box: M.earl.A.mel,
      tuba: TUBA,
      power: '@1h 1h',
      drums: 'k...t...k.k.t...',
      perc: 'n...............|................',
    },
    B: {
      chords: M.earl.B.chords,
      box: M.earl.B.mel,
      tuba: '@1h 5,h',
      power: '@1h 1h',
      strings: '@pad',
      drums: '[k...t...k.k.t...|]*7 t.t.m.m.f.f.ttmm',
      perc: 'n...............|................',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A'],
  fx: { wind: 0.28, wobble: 7 },
};

// ─── Dex: "Never Stop Flying" ───────────────────────────────────────────────

const dexTownTracks = {
  lead: { inst: 'lead50', echo: 0.3 },
  keys: { inst: 'epiano', center: 60 },
  bass: { inst: 'bassPluck' },
  drums: { inst: 'kit', vol: 0.42 },
  perc: { inst: 'kit', vol: 0.25 },
};

const dexTownSections = (withLead: boolean) => ({
  A: {
    chords: M.dex.A.chords,
    lead: withLead ? M.dex.A.mel : undefined,
    keys: '@cq. ce rh',
    bass: '@1q. 5,e rq 1e 5,e',
    drums: 'k...s..k..k.s...|k...s..k..k.s.k.',
    perc: 'h.h.h.hhh.h.h.hh',
  },
  B: {
    chords: M.dex.B.chords,
    lead: withLead ? M.dex.B.mel : undefined,
    keys: '@cq. ce rh',
    bass: '@1q. 5,e rq 1e 5,e',
    drums: 'k...s..k..k.s...|k...s..k..k.s.k.',
    perc: 'h.h.h.hhh.h.h.hh',
  },
});

const dexTown: SongDef = {
  id: 'theme:dex:town',
  title: 'Never Stop Flying (skate park)',
  bpm: 90,
  swing16: 0.2,
  key: 'E',
  tracks: dexTownTracks,
  sections: dexTownSections(true),
  form: ['A', 'B', 'A', 'B'],
  fx: { crackle: 0.14, lowpass: 6000 },
};

const dexAway: SongDef = { ...dexTown, id: 'theme:dex:away', title: 'Never Stop Flying (while he is gone)', sections: dexTownSections(false) };

const dexEntrance: SongDef = {
  id: 'theme:dex',
  title: 'Never Stop Flying',
  bpm: 168,
  key: 'E',
  tracks: {
    lead: { inst: 'lead', echo: 0.15 },
    harm: { inst: 'harm', vol: 0.7 },
    power: { inst: 'power' },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.6 },
    perc: { inst: 'kit', vol: 0.5 },
  },
  sections: {
    I: { chords: 'E | B', power: '@1e*8', drums: 'k.......k.......|s.s.s.s.ssssSSSS', perc: 'y...............|................' },
    A: {
      chords: M.dex.A.chords,
      lead: M.dex.A.mel,
      harm: tr(M.dex.A.mel, -12),
      power: '@1e*8',
      bass: '@1e*8',
      drums: '[k.h.s.h.k.k.s.h.|]*7 k.h.s.h.s.ssmmtt',
      perc: 'y...............|[................|]*3',
    },
    B: {
      chords: M.dex.B.chords,
      lead: M.dex.B.mel,
      harm: tr(M.dex.B.mel, -12),
      power: '@1e*8',
      bass: '@1e*8',
      drums: 'c.h.s.h.k.k.s.h.|[k.h.s.h.k.k.s.h.|]*6 k.h.s.h.s.ssmmtt',
      perc: 'y...............|[................|]*3',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'B'],
};

// ─── Gorgeous Gideon: "Mirror, Mirror" ──────────────────────────────────────

const gideonTown: SongDef = {
  id: 'theme:gideon:town',
  title: 'Mirror, Mirror (salon radio)',
  bpm: 80,
  swing: 0.06,
  key: 'A',
  tracks: {
    lead: { inst: 'whistle', vol: 0.85, echo: 0.3 },
    guitar: { inst: 'pluck', vol: 0.8, center: 60 },
    pad: { inst: 'pad', vol: 0.6, center: 62 },
    bass: { inst: 'bassPluck' },
    drums: { inst: 'kit', vol: 0.35 },
  },
  sections: {
    A: { chords: M.gideon.A.chords, lead: M.gideon.A.mel, guitar: '@cq. ce re ce cq', bass: '@1q. 5,e 1q 5,q', drums: 'x..x..x...x..x..' },
    B: { chords: M.gideon.B.chords, lead: M.gideon.B.mel, guitar: '@cq. ce re ce cq', pad: '@pad', bass: '@1q. 5,e 1q 5,q', drums: 'x..x..x...x..x..' },
  },
  form: ['A', 'B', 'A', 'B'],
};

const gideonEntrance: SongDef = {
  id: 'theme:gideon',
  title: 'Mirror, Mirror (entrance)',
  bpm: 116,
  key: 'A',
  tracks: {
    lead: { inst: 'lead50', echo: 0.25 },
    sparkle: { inst: 'bell', vol: 0.55, center: 62, pan: 0.3 },
    strings: { inst: 'strings' },
    bass: { inst: 'bassSynth' },
    drums: { inst: 'kit', vol: 0.55 },
    perc: { inst: 'kit', vol: 0.4 },
  },
  sections: {
    I: { chords: 'Am9 | E7#9', strings: '@pad', sparkle: '@[1s 5s 8s 5s]*4', drums: 'k...k...k...k...|k...k...k...kkkk' },
    A: {
      chords: M.gideon.A.chords,
      lead: M.gideon.A.mel,
      sparkle: '@[1s 5s 8s 5s]*4',
      strings: '@pad',
      bass: '@[1e 1^e]*4',
      drums: 'k...k...k...k...',
      perc: '..o.p.o...o.p.o.',
    },
    B: {
      chords: M.gideon.B.chords,
      lead: M.gideon.B.mel,
      sparkle: '@[1s 3s 5s 8s]*4',
      strings: '@pad',
      bass: '@[1e 1^e]*4',
      drums: 'k...k...k...k...',
      perc: '..o.p.o...o.p.o.',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'B'],
};

// ─── The Bruiser Twins: "Measure Twice" ─────────────────────────────────────

const twinsTown: SongDef = {
  id: 'theme:twins:town',
  title: 'Measure Twice (banjo duet)',
  bpm: 100,
  swing: 0.12,
  key: 'G',
  tracks: {
    bo: { inst: 'pluck', pan: -0.3 },
    buck: { inst: 'pluck', vol: 0.9, pan: 0.3 },
    bass: { inst: 'bassPluck' },
    drums: { inst: 'kit', vol: 0.3 },
  },
  sections: {
    A: { chords: M.twins.A.chords, bo: M.twins.A.mel, buck: M.twins.A.harm, bass: '@1q 5,q 1q 5,q', drums: 'x...x...x...x...' },
    B: { chords: M.twins.B.chords, bo: M.twins.B.mel, buck: M.twins.B.harm, bass: '@1q 5,q 1q 5,q', drums: 'x...x...x...x...' },
  },
  form: ['A', 'B', 'A', 'B'],
};

const twinsEntrance: SongDef = {
  id: 'theme:twins',
  title: 'Measure Twice (entrance)',
  bpm: 108,
  key: 'G',
  tracks: {
    bo: { inst: 'lead', echo: 0.12, pan: -0.25 },
    // Buck is always a hair behind.
    buck: { inst: 'lead12', vol: 0.9, delay: 0.06, pan: 0.25 },
    power: { inst: 'power', vol: 0.85 },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.6 },
    perc: { inst: 'kit', vol: 0.45 },
  },
  sections: {
    I: { chords: 'G | D', power: '@1q rq rh', drums: 'u...p...u.u.p...|u...p...u.u.pppp', perc: 'w...............|..............w.' },
    A: {
      chords: M.twins.A.chords,
      bo: M.twins.A.mel,
      buck: M.twins.A.harm,
      power: '@1q 1q 1q 1q',
      bass: '@1e*8',
      drums: 'k...p...k.k.p...',
      perc: '..............w.|................',
    },
    B: {
      chords: M.twins.B.chords,
      bo: M.twins.B.mel,
      buck: M.twins.B.harm,
      power: '@1q 1q 1q 1q',
      bass: '@1e*8',
      drums: 'k...p...k.k.p...',
      perc: '..............w.|................',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'B'],
};

// ─── Hazel "Hurricane" Huang: "Category Five" ───────────────────────────────

const hazelTown: SongDef = {
  id: 'theme:hazel:town',
  title: 'Category Five (the eye of the storm)',
  bpm: 70,
  key: 'D',
  echo: { beats: 1.5, feedback: 0.36, wet: 0.36 },
  tracks: {
    lead: { inst: 'softtri', echo: 0.35 },
    pad: { inst: 'pad', center: 60 },
    bass: { inst: 'bass', vol: 0.6 },
  },
  sections: {
    A: { chords: M.hazel.A.chords, lead: M.hazel.A.mel, pad: '@pad', bass: '@1w' },
    B: { chords: M.hazel.B.chords, lead: M.hazel.B.mel, pad: '@pad', bass: '@1w' },
  },
  form: ['A', 'B', 'A', 'B'],
  fx: { wind: 0.06 },
};

const GUSTS = '@[1s 3s 5s 8s 5s 3s]*2 1s 3s 5s 8s';

const hazelEntrance: SongDef = {
  id: 'theme:hazel',
  title: 'Category Five (entrance)',
  bpm: 132,
  key: 'D',
  tracks: {
    lead: { inst: 'lead', echo: 0.2 },
    gust: { inst: 'arp25', vol: 0.95, center: 62, pan: 0.25 },
    strings: { inst: 'strings' },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.6 },
    perc: { inst: 'kit', vol: 0.6 },
  },
  sections: {
    I: { chords: 'Bm | F#7', gust: GUSTS, perc: 'n...............|................', drums: '................|s.s.s.s.ssssSSSS' },
    A: {
      chords: M.hazel.A.chords,
      lead: M.hazel.A.mel,
      gust: GUSTS,
      strings: '@pad',
      bass: '@1e*8',
      drums: '[k.h.s.h.k.hks.h.|]*7 k.h.s.h.s.ssmmtt',
      perc: 'n...............|................',
    },
    B: {
      chords: M.hazel.B.chords,
      lead: M.hazel.B.mel,
      gust: GUSTS,
      strings: '@pad',
      bass: '@1e*8',
      drums: '[k.h.s.h.k.hks.h.|]*7 k.h.s.h.s.ssmmtt',
      perc: 'n...............|................',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'B'],
  fx: { wind: 0.14 },
};

// ─── "Cowboy" Clint Ransom: "Dust and Denim" (and the Dust Devil) ───────────

const clintTown: SongDef = {
  id: 'theme:clint:town',
  title: 'Dust and Denim',
  bpm: 92,
  swing: 0.25,
  key: 'A',
  tracks: {
    lead: { inst: 'lead12', echo: 0.2 },
    guitar: { inst: 'pluck', vol: 0.75, center: 60 },
    bass: { inst: 'bassPluck' },
    drums: { inst: 'kit', vol: 0.35 },
  },
  sections: {
    A: { chords: M.clint.A.chords, lead: M.clint.A.mel, guitar: '@rq cq rq cq', bass: '@1q rq 5,q rq', drums: 'x...s...x...s...' },
    B: { chords: M.clint.B.chords, lead: M.clint.B.mel, guitar: '@rq cq rq cq', bass: '@1q rq 5,q rq', drums: 'x...s...x...s...' },
  },
  form: ['A', 'B', 'A', 'B'],
};

const clintEntrance: SongDef = {
  id: 'theme:clint',
  title: 'Dust and Denim (Cowboy Clint, once upon a time)',
  bpm: 104,
  swing: 0.25,
  key: 'A',
  tracks: {
    lead: { inst: 'lead12', echo: 0.2 },
    fiddle: { inst: 'fiddle', vol: 0.7, pan: 0.25 },
    guitar: { inst: 'pluck', vol: 0.75, center: 60 },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.55 },
  },
  sections: {
    I: { chords: 'A | E7', guitar: '@re ce re ce re ce re ce', drums: 'j.j.j.j.j.j.j.j.|k.j.s.j.k.j.ssss' },
    A: { chords: M.clint.A.chords, lead: M.clint.A.mel, guitar: '@re ce re ce re ce re ce', bass: '@1q 5,q 1q 5,q', drums: 'k.j.s.j.k.j.s.j.' },
    B: {
      chords: M.clint.B.chords,
      lead: M.clint.B.mel,
      fiddle: tr(M.clint.B.mel, -12),
      guitar: '@re ce re ce re ce re ce',
      bass: '@1q 5,q 1q 5,q',
      drums: 'k.j.s.j.k.j.s.j.',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'B'],
};

const dustDevil: SongDef = {
  id: 'theme:dustdevil',
  title: 'The Dust Devil',
  bpm: 120,
  key: 'A',
  minor: true,
  tracks: {
    lead: { inst: 'lead12', echo: 0.3 },
    whistle: { inst: 'whistle', vol: 0.7, echo: 0.4 },
    power: { inst: 'power', vol: 0.85, center: 45 },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.6 },
  },
  sections: {
    I: { chords: 'A | E7', power: '@1h rh', drums: 't...t...t...t.t.|t.t.t.t.m.m.f.f.' },
    A: { chords: M.clint.A.chords, lead: M.clint.A.mel, power: '@1q. 1q. 1q', bass: '@1q. 5,e 1q 5,q', drums: 'k...t.t.s...t.t.' },
    B: {
      chords: M.clint.B.chords,
      lead: M.clint.B.mel,
      whistle: tr(M.clint.B.mel, 12),
      power: '@1q. 1q. 1q',
      bass: '@1q. 5,e 1q 5,q',
      drums: '[k...t.t.s...t.t.|]*7 t.t.m.m.f.f.ssss',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'B'],
  fx: { wind: 0.32 },
};

// ─── Tiny Tallbridge: "Tuck-In" ─────────────────────────────────────────────

const tinyTown: SongDef = {
  id: 'theme:tiny:town',
  title: 'Tuck-In (lullaby)',
  bpm: 99,
  meter: 3,
  key: 'G',
  tracks: {
    box: { inst: 'musicbox', echo: 0.4 },
    pad: { inst: 'pad', center: 60 },
    bass: { inst: 'bassPluck', vol: 0.6 },
  },
  sections: {
    A: { chords: M.tiny.A.chords, box: M.tiny.A.mel, pad: '@pad', bass: '@1q. 5,q.' },
    B: { chords: M.tiny.B.chords, box: M.tiny.B.mel, pad: '@pad', bass: '@1q. 5,q.' },
  },
  form: ['A', 'B', 'A', 'B'],
};

const tinyEntrance: SongDef = {
  id: 'theme:tiny',
  title: 'Tuck-In (stadium version)',
  bpm: 114,
  meter: 3,
  key: 'G',
  tracks: {
    lead: { inst: 'lead', vol: 1.1, echo: 0.2 },
    harm: { inst: 'harm', vol: 0.8 },
    box: { inst: 'musicbox', echo: 0.4 },
    power: { inst: 'power', center: 47 },
    bass: { inst: 'bass' },
    pad: { inst: 'pad', center: 60 },
    drums: { inst: 'kit', vol: 0.65 },
  },
  sections: {
    // The lullaby, alone... then the drums kick the door in.
    I: { chords: 'G | C/G | G', box: slice(M.tiny.A.mel, 0, 2) + ' | rh.', pad: '@pad', drums: '............|............|s.s.s.s.SSSS' },
    A: {
      chords: M.tiny.A.chords,
      lead: M.tiny.A.mel,
      harm: tr(M.tiny.A.mel, -12),
      power: '@1e*6',
      bass: '@1e*6',
      drums: 'c.h.h.S.h.h.|[k.h.h.S.h.h.|]*6 k.h.h.S.S.SS',
    },
    B: {
      chords: M.tiny.B.chords,
      lead: M.tiny.B.mel,
      harm: tr(M.tiny.B.mel, -12),
      power: '@1e*6',
      bass: '@1e*6',
      drums: 'c.h.h.S.h.h.|[k.h.h.S.h.h.|]*6 k.h.h.S.S.SS',
    },
    // "Sorry!" One bar of music box, every time.
    S: { chords: 'G', box: 'D5q B4e D5q B4e', pad: '@pad' },
  },
  intro: ['I'],
  form: ['A', 'S', 'B', 'S', 'A', 'B'],
};

// ─── The Mothman ────────────────────────────────────────────────────────────

const mothmanTown: SongDef = {
  id: 'theme:mothman:town',
  title: 'Something in the Treeline',
  bpm: 80,
  key: 'E',
  echo: { beats: 1.5, feedback: 0.45, wet: 0.42 },
  tracks: {
    lead: { inst: 'theremin', echo: 0.45 },
    arp: { inst: 'arp', vol: 0.5, center: 57 },
    pad: { inst: 'pad', center: 58 },
    bass: { inst: 'bass', vol: 0.6 },
  },
  sections: {
    A: { chords: M.mothman.A.chords, lead: M.mothman.A.mel, arp: "@1q' 5q' 8q' 5q'", pad: '@pad', bass: '@1w' },
    B: { chords: M.mothman.B.chords, lead: M.mothman.B.mel, arp: "@1q' 5q' 8q' 5q'", pad: '@pad', bass: '@1w' },
  },
  form: ['A', 'B', 'A', 'B'],
  fx: { crickets: 0.35 },
};

const mothmanEntrance: SongDef = {
  id: 'theme:mothman',
  title: 'The Mothman',
  bpm: 100,
  key: 'E',
  echo: { beats: 0.75, feedback: 0.42, wet: 0.36 },
  tracks: {
    lead: { inst: 'theremin', echo: 0.4 },
    arp: { inst: 'arp', vol: 0.9, center: 62, pan: 0.25 },
    strings: { inst: 'strings', vol: 0.8 },
    bass: { inst: 'bassSynth' },
    drums: { inst: 'kit', vol: 0.6 },
    perc: { inst: 'kit', vol: 0.35 },
  },
  sections: {
    I: { chords: 'Em | B7', strings: '@pad', drums: 'd.......d.......|d.......d...d.d.' },
    A: {
      chords: M.mothman.A.chords,
      lead: M.mothman.A.mel,
      arp: '@[1s 5s 8s 5s]*4',
      strings: '@pad',
      bass: '@1e*8',
      drums: 'd.......d.......',
      perc: '..h...h...h...h.',
    },
    B: {
      chords: M.mothman.B.chords,
      lead: M.mothman.B.mel,
      arp: '@[1s 3s 5s 8s]*4',
      strings: '@pad',
      bass: '@1e*8',
      drums: 'd...x...d...x...',
      perc: '..h...h...h...h.',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'B'],
  fx: { wind: 0.12 },
};

// ─── "Professor" Pinfall: the Invention ─────────────────────────────────────

const ALBERTI = '@1e 3e 5e 3e 1e 5,e 1e 3e';

const professorTown: SongDef = {
  id: 'theme:professor:town',
  title: 'Invention in Pinfall',
  bpm: 92,
  key: 'D',
  tracks: {
    upper: { inst: 'harpsi', vol: 1.1, pan: 0.2 },
    lower: { inst: 'harpsi', vol: 0.9, center: 50, pan: -0.2 },
  },
  sections: {
    A: { chords: M.professor.A.chords, upper: M.professor.A.mel, lower: ALBERTI },
    B: { chords: M.professor.B.chords, upper: M.professor.B.mel, lower: ALBERTI },
  },
  form: ['A', 'B', 'A', 'B'],
};

const professorEntrance: SongDef = {
  id: 'theme:professor',
  title: 'Toccata and Pinfall',
  bpm: 132,
  key: 'D',
  tracks: {
    lead: { inst: 'lead', echo: 0.15 },
    lower: { inst: 'harpsi', vol: 0.9, center: 50 },
    organ: { inst: 'organ', vol: 0.9 },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.55 },
  },
  sections: {
    T: { chords: 'Dm:2 A7:2 | Dm', lead: 'A5t G5t A5e. rq G5s F5s E5s D5s C#5q | D5h. rq', organ: '@pad', drums: '................|c...........ssss' },
    A: { chords: M.professor.A.chords, lead: M.professor.A.mel, lower: ALBERTI, organ: '@pad', bass: '@1e*8', drums: 'k.h.s.h.k.hks.h.' },
    B: { chords: M.professor.B.chords, lead: M.professor.B.mel, lower: ALBERTI, organ: '@pad', bass: '@1e*8', drums: '[k.h.s.h.k.hks.h.|]*7 k.h.s.h.s.ssmmtt' },
  },
  intro: ['T'],
  form: ['A', 'B', 'A', 'B'],
};

// ─── Sweet Lou Bastian ──────────────────────────────────────────────────────

const louTown: SongDef = {
  id: 'theme:lou:town',
  title: 'Sweet Lou (down by Chokeslam Creek)',
  bpm: 76,
  swing16: 0.15,
  key: 'Eb',
  tracks: {
    lead: { inst: 'lead50', echo: 0.3 },
    keys: { inst: 'epiano', center: 60 },
    bass: { inst: 'bassPluck' },
    drums: { inst: 'kit', vol: 0.38 },
  },
  sections: {
    A: { chords: M.lou.A.chords, lead: M.lou.A.mel, keys: '@cq. ce re cq.', bass: '@1q. 1e 5,q Aq', drums: 'k.....k.x.....k.' },
    B: { chords: M.lou.B.chords, lead: M.lou.B.mel, keys: '@cq. ce re cq.', bass: '@1q. 1e 5,q Aq', drums: 'k.....k.x.....k.' },
  },
  form: ['A', 'B', 'A', 'B'],
  fx: { crickets: 0.1 },
};

const LOU_BASS = '@1e. 1s re 8s 7s re 5,s 6,s 1e re';

const louEntrance: SongDef = {
  id: 'theme:lou',
  title: 'Sweet Lou (1977)',
  bpm: 108,
  key: 'Eb',
  tracks: {
    lead: { inst: 'trumpet', echo: 0.2 },
    wah: { inst: 'wah', vol: 0.9, center: 60, pan: 0.25 },
    brass: { inst: 'brass', vol: 0.85 },
    bass: { inst: 'bassPluck' },
    drums: { inst: 'kit', vol: 0.55 },
  },
  sections: {
    I: { chords: 'Ebmaj7 | Bb7', wah: '@[rs cs re]*4', bass: LOU_BASS, drums: 'k.h.s.hkh.hks.h.|k.h.s.hks.s.ssss' },
    A: { chords: M.lou.A.chords, lead: M.lou.A.mel, wah: '@[rs cs re]*4', bass: LOU_BASS, drums: 'k.h.s.hkh.hks.h.' },
    B: { chords: M.lou.B.chords, lead: M.lou.B.mel, wah: '@[rs cs re]*4', brass: '@re ce! rq re ce! rq', bass: LOU_BASS, drums: 'k.h.s.hkh.hks.h.' },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'B'],
};

export const LEITMOTIF_SONGS: SongDef[] = [
  birdieTown, birdieEntrance,
  grandmaTown, grandmaEntrance,
  velvetTown, velvetEntrance,
  mariposaTown, mariposaEntrance,
  earlTown, earlEntrance,
  dexTown, dexAway, dexEntrance,
  gideonTown, gideonEntrance,
  twinsTown, twinsEntrance,
  hazelTown, hazelEntrance,
  clintTown, clintEntrance, dustDevil,
  tinyTown, tinyEntrance,
  mothmanTown, mothmanEntrance,
  professorTown, professorEntrance,
  louTown, louEntrance,
];
