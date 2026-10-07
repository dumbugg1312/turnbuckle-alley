/**
 * Show nights, matches, training, the Dungeon and the ending.
 * The town hook comes back here as a fanfare; the Velvet Hammers theme
 * carries the finale.
 */
import type { SongDef } from '../notation';
import { DUCHESS, SHOWTIME, SHUFFLE, TOWN, VELVET } from './motifs';
import { onlyBars, slice, tr, trc } from './util';

export const sportatorium: SongDef = {
  id: 'sportatorium',
  title: 'The Empty Sportatorium',
  bpm: 76,
  key: 'Eb',
  echo: { beats: 1.5, feedback: 0.42, wet: 0.42 },
  tracks: {
    lead: { inst: 'lead50', echo: 0.5 },
    box: { inst: 'musicbox', vol: 0.85, echo: 0.5 },
    harm: { inst: 'harm12', vol: 0.55, center: 64, pan: 0.3 },
    arp: { inst: 'arp', vol: 0.65, center: 58, pan: -0.3 },
    pad: { inst: 'pad', center: 60 },
    bass: { inst: 'bass', vol: 0.8 },
  },
  sections: {
    I: { chords: 'Ebmaj7 | Bb7sus4', pad: '@pad', arp: '@1e 5e 8e 9e 3^e 9e 8e 5e' },
    A: {
      chords: 'Ebmaj7 | Cm7 | Abmaj7 | Bb7sus4 Bb7 | Ebmaj7 | Gm7 | Abmaj7 | Bb7sus4',
      lead: 'Bb4q Eb5q. F5e G5q | G5h. Eb5q | C5q Eb5q. F5e G5q | F5w | Bb4q Eb5q. F5e G5q | Bb5h. D5q | C5q. Eb5e Ab5q G5q | F5w',
      pad: '@pad',
      arp: '@1e 5e 8e 9e 3^e 9e 8e 5e',
      bass: '@1h 5,h',
    },
    B: {
      chords: 'Abmaj7 | Bb | Gm7 | Cm7 | Fm7 | Bb7 | Ebmaj7 | Bb7sus4',
      lead: 'Eb5q. C5e Ab4h | D5q. Bb4e F4h | Bb4q D5q F5q. G5e | G5h. rq | Ab5q. G5e F5q C5q | D5h. F5q | Eb5q G5q Bb5q. D6e | C6h Bb5h',
      harm: '@3w',
      pad: '@pad',
      arp: '@1e 5e 8e 9e 3^e 9e 8e 5e',
      bass: '@1h 5,h',
    },
    A2: {
      chords: 'Ebmaj7 | Cm7 | Abmaj7 | Bb7sus4 Bb7 | Ebmaj7 | Gm7 | Abmaj7 | Bb7sus4',
      box: tr('Bb4q Eb5q. F5e G5q | G5h. Eb5q | C5q Eb5q. F5e G5q | F5w | Bb4q Eb5q. F5e G5q | Bb5h. D5q | C5q. Eb5e Ab5q G5q | F5w', 12),
      pad: '@pad',
      arp: '@1e 5e 8e 9e 3^e 9e 8e 5e',
      bass: '@1h 5,h',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A2', 'B'],
};

/** Town hook in A, as a festival march. */
const SHOW_A1 = { chords: trc(TOWN.A1.chords, 7), mel: tr(TOWN.A1.mel, 7) };
const SHOW_A2 = { chords: trc(TOWN.A2.chords, 7), mel: tr(TOWN.A2.mel, 7) };

export const show: SongDef = {
  id: 'show',
  title: 'Saturday Night at the Sportatorium',
  bpm: 128,
  key: 'A',
  tracks: {
    lead: { inst: 'trumpet', echo: 0.2 },
    bell: { inst: 'bell', vol: 0.8, pan: 0.25 },
    brass: { inst: 'brass', vol: 0.85, in: 0.3 },
    harm: { inst: 'harm', vol: 0.7, center: 62, pan: -0.25 },
    arp: { inst: 'arp', vol: 0.8, center: 64, pan: 0.3, in: 0.55 },
    pad: { inst: 'pad', center: 60 },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.55 },
    perc: { inst: 'kit', vol: 0.45, in: 0.55 },
  },
  sections: {
    F: {
      chords: 'A | D/A | E/A | A',
      lead: 'E4e A4e C#5e E5e -h | F#4e A4e D5e F#5e -h | G#4e B4e E5e G#5e -h | A5w',
      brass: '@ce! re ce re cq cq',
      bass: '@1q rq 1q rq',
      drums: '[k.......s.......|]*3 c.s.s.s.ssssSSSS',
    },
    A: {
      chords: SHOW_A1.chords,
      lead: SHOW_A1.mel,
      brass: '@ce! re rq ce! re rq',
      pad: '@pad',
      bass: '@1e 1e 5,e 1e 8e 1e 5,e 1e',
      arp: '@[1s 3s 5s 8s]*4',
      drums: '[k.h.s.h.k.k.s.h.|]*7 k.h.s.h.k.s.s.ss',
      perc: 'c...............|[....p.......p...|]*7',
    },
    A2: {
      chords: SHOW_A2.chords,
      lead: SHOW_A2.mel,
      harm: '@3q. 5q. 3q',
      brass: '@ce! re rq ce! re rq',
      pad: '@pad',
      bass: '@1e 1e 5,e 1e 8e 1e 5,e 1e',
      arp: '@[1s 3s 5s 8s]*4',
      drums: '[k.h.s.h.k.k.s.h.|]*7 k.h.s.h.s.ssmmtt',
      perc: 'c...............|[....p.......p...|]*7',
    },
    B: {
      chords: SHOWTIME.B.chords,
      lead: SHOWTIME.B.mel,
      harm: '@3h 5h',
      brass: '@cq. ce re cq.',
      pad: '@pad',
      bass: '@1e*8',
      arp: '@[1s 5s 8s 5s]*4',
      drums: '[k.h.s.hkk.h.s.h.|]*7 k.h.s.h.s.ssmmtt',
      perc: 'c...............|[................|]*3 c...............|[................|]*3',
    },
    // Clap-along breakdown: the bell carries the hook, the crowd claps.
    C: {
      chords: 'A | D | F#m | E | A | D | E | E7',
      bell: '[E6e C#6q. B5e A5e B5q | rw |]*4',
      bass: '@1q 5,q 1q 5,q',
      pad: '@pad',
      drums: '[k...p...k...p...|]*7 k.p.k.p.kpkpSSSS',
    },
  },
  intro: ['F'],
  form: ['A', 'A2', 'B', 'A2', 'C', 'B'],
};

const MATCH_A =
  'A4e C#5e E5q A5q. E5e | D5e B4e G4q B4q. D5e | F#5q. E5e D5q A4q | C#5e E5e A5e G#5e A5h | F#5q. E5e C#5q A4q | D5q. E5e F#5q A5q | G#5q. F#5e E5q B4q | E5e F#5e G#5e A5e B5h';
const MATCH_C = 'F#5h. A5q | G#5h. B5q | E5q G#5q B5q C#6q | A5w | F#5q. A5e D6h | B5q. G#5e E5h | A5q. C6e F5h | B5q. D6e G5h';
const MATCH_PERC = 'c...............|[................|]*3 c...............|[................|]*2 ....p...p...pppp';

/**
 * The card match. Calm at intensity 0 (bass, soft beat, pad), full arena at 1:
 * lead from 0.12, full drums from 0.3, arpeggio from 0.5, counter-melody from
 * 0.68, brass and crashes from 0.82. A lowpass opens as it rises.
 */
export const match: SongDef = {
  id: 'match',
  title: 'Card Match',
  bpm: 140,
  key: 'A',
  intensityFilter: [2400, 16000],
  tracks: {
    bass: { inst: 'bass' },
    pad: { inst: 'pad', center: 60, out: 0.55 },
    lite: { inst: 'kit', vol: 0.42, out: 0.3 },
    drums: { inst: 'kit', vol: 0.6, in: 0.3 },
    lead: { inst: 'lead', in: 0.12, echo: 0.2 },
    arp: { inst: 'arp', in: 0.5, center: 64, pan: 0.3 },
    harm: { inst: 'harm', in: 0.68, center: 62, pan: -0.3 },
    brass: { inst: 'brass', in: 0.82, vol: 0.9 },
    perc: { inst: 'kit', vol: 0.5, in: 0.82 },
  },
  sections: {
    A: {
      chords: 'A | G | D | A | F#m | D | E | E',
      lead: MATCH_A,
      bass: '@1e*8',
      pad: '@pad',
      lite: 'k...h...k...h...',
      drums: '[k.h.s.h.k.hks.h.|]*7 k.h.s.h.s.ssmmtt',
      arp: '@[1s 3s 5s 8s]*2 [8s 5s 3s 1s]*2',
      harm: '@3q. 5q. 3q',
      brass: '@ce! re rq ce! re rq',
      perc: MATCH_PERC,
    },
    B: {
      chords: SHOW_A1.chords,
      lead: SHOW_A1.mel,
      bass: '@1e*8',
      pad: '@pad',
      lite: 'k...h...k...h...',
      drums: '[k.h.s.h.k.hks.h.|]*7 k.h.s.h.k.s.ssss',
      arp: '@[1s 3s 5s 8s]*2 [8s 5s 3s 1s]*2',
      harm: '@3q. 5q. 3q',
      brass: '@ce! re rq ce! re rq',
      perc: MATCH_PERC,
    },
    C: {
      chords: 'D | E | C#m7 | F#m | D | E | F | G',
      lead: MATCH_C,
      bass: '@1e*8',
      pad: '@pad',
      lite: 'k.......h.......',
      drums: '[k.h.s.h.k.h.s.h.|]*6 k.h.s.hks.hks.h.|s.s.ssssSSSSmmtt',
      arp: '@[1s 5s 8s 5s]*4',
      harm: '@3h 5h',
      brass: '@cq. cq. cq',
      perc: 'c...............|[................|]*3 c...............|[................|]*3',
    },
  },
  form: ['A', 'B', 'A', 'C', 'B'],
};

export const victory: SongDef = {
  id: 'victory',
  title: 'Victory!',
  bpm: 132,
  key: 'C',
  tracks: {
    lead: { inst: 'trumpet', echo: 0.2 },
    harm: { inst: 'harm', vol: 0.8 },
    brass: { inst: 'brass', vol: 0.9 },
    arp: { inst: 'arp', vol: 0.8, center: 64, pan: 0.3 },
    pad: { inst: 'pad', center: 60 },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.6 },
  },
  sections: {
    F: {
      chords: 'C | F/C | G/C | C',
      lead: 'G4e C5e E5e G5e C6q. G5e | A5q. F5e C6h | B5q. G5e D6q. B5e | C6w',
      brass: '@ce! re ce re cq. ce',
      bass: '@1q rq 1q rq',
      drums: 'k.s.k.s.k.s.k.ss|k.s.k.s.k.s.k.ss|k.s.k.s.k.s.k.ss|c...........ssss',
    },
    V: {
      chords: trc(TOWN.A2.chords, -2),
      lead: tr(TOWN.A2.mel, 10),
      harm: tr(TOWN.A2.mel, -2),
      brass: '@ce! re rq ce! re rq',
      arp: '@[1s 3s 5s 8s]*4',
      pad: '@pad',
      bass: '@1e 1e 5,e 1e 8e 1e 5,e 1e',
      drums: 'c.h.s.h.k.k.s.h.|[k.h.s.h.k.k.s.h.|]*6 k.h.s.h.s.ssmmtt',
    },
    V2: {
      chords: trc(SHOWTIME.B.chords, 3),
      lead: tr(SHOWTIME.B.mel, -9),
      brass: '@cq. ce re cq.',
      arp: '@[1s 5s 8s 5s]*4',
      pad: '@pad',
      bass: '@1e*8',
      drums: 'c.h.s.h.k.k.s.h.|[k.h.s.h.k.k.s.h.|]*6 k.h.s.h.s.ssmmtt',
    },
  },
  intro: ['F'],
  form: ['V', 'V2'],
};

export const matchEnd: SongDef = {
  id: 'match-end',
  title: 'Good Match, Kid',
  bpm: 84,
  swing: 0.08,
  key: 'F',
  tracks: {
    lead: { inst: 'lead50', echo: 0.3 },
    keys: { inst: 'epiano', center: 60 },
    strings: { inst: 'strings', vol: 0.75 },
    pad: { inst: 'pad', center: 60 },
    bass: { inst: 'bassPluck' },
    drums: { inst: 'kit', vol: 0.35 },
  },
  sections: {
    I: { chords: 'Bbmaj7 | C7sus4', keys: '@cq. ce re cq.', pad: '@pad', bass: '@1w' },
    A: { chords: trc(TOWN.A1.chords, 3), lead: tr(TOWN.A1.mel, 3), keys: '@cq. ce re cq.', pad: '@pad', bass: '@1h 5,q. Ae', drums: '....x.......x...' },
    B: { chords: trc(TOWN.B.chords, 3), lead: tr(TOWN.B.mel, 3), strings: '@pad', keys: '@cq. ce re cq.', bass: '@1h 5,h', drums: '....x.......x...' },
    A2: {
      chords: trc(TOWN.A2.chords, 3),
      lead: tr(TOWN.A2.mel, 3),
      keys: '@cq. ce re cq.',
      strings: '@pad',
      bass: '@1h 5,q. Ae',
      drums: '....x.......x..z',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A2'],
};

export const workout: SongDef = {
  id: 'workout',
  title: 'Training Montage',
  bpm: 124,
  key: 'E',
  intensityFilter: [3500, 16000],
  tracks: {
    lead: { inst: 'lead', echo: 0.2 },
    harm: { inst: 'harm', in: 0.5, center: 62, pan: -0.25 },
    power: { inst: 'power', vol: 0.9 },
    brass: { inst: 'brass', in: 0.55 },
    arp: { inst: 'arp', in: 0.75, center: 64, pan: 0.3 },
    bass: { inst: 'bass' },
    lite: { inst: 'kit', vol: 0.45, out: 0.3 },
    drums: { inst: 'kit', vol: 0.6, in: 0.3 },
    perc: { inst: 'kit', vol: 0.5, in: 0.75 },
  },
  sections: {
    I: { chords: 'E | B7sus4 B7', power: '@1e*8', bass: '@1e*8', lite: '................|s.s.s.s.ssssSSSS', drums: '................|s.s.s.s.ssssSSSS' },
    A: {
      chords: 'E | D/E | A/E | E | C#m7 | A | F#m7 | B7sus4 B7',
      lead: 'B4e E5q. F#5e G#5e B5q | A5q. F#5e D5q F#5q | E5q. C#5e A4q C#5q | B4h. rq | G#4e C#5q. D#5e E5e G#5q | A5q. G#5e E5q C#5q | F#5q. E5e C#5q A4q | E5h D#5h',
      power: '@1q. 1q. 1q',
      bass: '@1e*8',
      harm: '@3q. 5q. 3q',
      brass: '@ce! re rq ce! re rq',
      arp: '@[1s 3s 5s 8s]*4',
      lite: 'k...h...k...h...',
      drums: '[k.h.s.h.k.k.s.h.|]*7 k.h.s.h.s.ssmmtt',
      perc: 'c...............|[................|]*3',
    },
    B: {
      chords: 'A | B | G#m7 | C#m7 | A | B | C | D',
      lead: 'C#6q. B5e A5q E5q | D#6q. C#6e B5q F#5q | B5q. A5e G#5q D#5q | E5h. G#5q | A5q. B5e C#6q E6q | D#6h. F#5q | G5q. E5e C6q G5q | A5q. F#5e D6h',
      power: '@1e*8',
      bass: '@1e*8',
      harm: '@3h 5h',
      brass: '@cq. ce re cq.',
      arp: '@[1s 5s 8s 5s]*4',
      lite: 'k...h...k...h...',
      drums: '[k.h.s.h.k.k.s.h.|]*7 k.h.s.h.s.ssmmtt',
      perc: 'c...............|[................|]*3',
    },
    K: {
      chords: 'C#m7 | A | B | B',
      bass: '@1q rq 1q rq',
      power: '@1q rq 1q rq',
      arp: '@[1s 3s 5s 8s]*4',
      lite: '[k...p...k...p...|]*3 k.p.k.p.kpkpkppp',
      drums: '[k...p...k...p...|]*3 k.p.k.p.kpkpkppp',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'B', 'K'],
};

export const dungeon: SongDef = {
  id: 'dungeon',
  title: 'The Dungeon',
  bpm: 100,
  swing: 0.12,
  key: 'D',
  echo: { beats: 0.75, feedback: 0.4, wet: 0.36 },
  intensityFilter: [4500, 14000],
  tracks: {
    ghost: { inst: 'theremin', echo: 0.4 },
    xylo: { inst: 'marimba', vol: 0.9, pan: 0.2 },
    harpsi: { inst: 'harpsi', vol: 0.75, center: 60, pan: -0.25 },
    organ: { inst: 'organ', vol: 0.8, center: 60 },
    pad: { inst: 'pad', vol: 0.55, center: 58 },
    bass: { inst: 'bassPluck' },
    drums: { inst: 'kit', vol: 0.5 },
  },
  sections: {
    I: { chords: 'Dm | A7', bass: '@1e. 1s 8e 1e re 1e 5,e 6,e', drums: 'k.zxs.zxk.zks.zx' },
    A: {
      chords: 'Dm | Dm/C | Bb7 | A7 | Dm | Dm/C | G7 | A7',
      ghost: 'D5q. F5e~ A5h | G#5q~ A5q F5q D5q | Ab5q. G5e F5q D5q | E5q. C#5e A4h | D5q. F5e~ A5h | C6q. B5e A5q F5q | B5q. A5e G5q F5q | E5q G5q C#5h',
      harpsi: "@[1e' 5e' 8e' 5e']*2",
      pad: '@pad',
      bass: '@1e. 1s 8e 1e re 1e 5,e 6,e',
      drums: '[k.zxs.zxk.zks.zx|]*7 k.zxs.zxt.t.m.f.',
    },
    B: {
      chords: 'Bbmaj7 | C7 | Am7 | Dm7 | Gm7 | C7 | F | A7',
      xylo: "D5e' F5e' A5e' D6e' C6q A5q | Bb5e' G5e' E5e' C5e' Bb4q G4q | C5e' E5e' A5e' C6e' B5q A5q | F5h D5h | G5e' Bb5e' D6e' Bb5e' A5q G5q | E5e' G5e' Bb5e' C6e' Bb5q E5q | F5e' A5e' C6e' F6e' E6q C6q | C#6h A5h",
      harpsi: "@[1e' 5e' 8e' 5e']*2",
      bass: '@1q. 5,e 1q 5,q',
      drums: '[k.zxs.zxk.zks.zx|]*7 k.zxs.zxk.x.x.xx',
    },
    C: {
      chords: 'Dm | Eb | Dm | C#dim7 | Dm | Eb | Gm6 | A7',
      ghost: 'A5w | Bb5h G5h | F5w | E5h. rq | D6h C6h | Bb5h. G5q | E5h G5h | A5w',
      organ: '@pad',
      bass: '@1h 5,h',
      drums: 'k.......s.......|k.....k.s.......',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'C'],
};

// ─── The ending: the Velvet Hammers, together again ─────────────────────────

const DOTTIE_BB = { chords: trc(DUCHESS.A.chords, -7), mel: tr(DUCHESS.A.mel, -7) };
const BIRDIE_BB = { chords: trc(SHUFFLE.A.chords, 3), mel: tr(SHUFFLE.A.mel, 3) };

export const ending: SongDef = {
  id: 'ending',
  title: 'The Encore',
  bpm: 96,
  key: 'Bb',
  echo: { beats: 1.5, feedback: 0.36, wet: 0.36 },
  tracks: {
    acc: { inst: 'accordion', echo: 0.3, pan: -0.2 },
    keys: { inst: 'keys', vol: 0.95, center: 60, pan: 0.2 },
    lead: { inst: 'lead', echo: 0.3 },
    box: { inst: 'musicbox', vol: 0.85, echo: 0.45 },
    harm: { inst: 'harm', vol: 0.7, center: 62 },
    brass: { inst: 'brass', vol: 0.8 },
    strings: { inst: 'strings' },
    pad: { inst: 'pad', center: 60 },
    arp: { inst: 'arp', vol: 0.7, center: 62, pan: 0.3 },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.55 },
  },
  sections: {
    // Dottie alone: her waltz on the accordion.
    Dw: { meter: 3, chords: DOTTIE_BB.chords, acc: DOTTIE_BB.mel, pad: '@pad', bass: '@1h.' },
    // Birdie alone: her shuffle on the old square-wave piano.
    Bs: {
      swing: 0.3,
      chords: BIRDIE_BB.chords,
      keys: BIRDIE_BB.mel,
      bass: '@1q 3q 5q Aq',
      pad: '@pad',
      drums: '....x.......x...',
    },
    // Together in 6/8: Birdie takes the first half, Dottie answers.
    V: {
      meter: 3,
      chords: VELVET.A.chords,
      keys: onlyBars(VELVET.A.mel, (i) => i < 8, 3),
      acc: onlyBars(VELVET.A.mel, (i) => i >= 8, 3),
      strings: '@pad',
      bass: '@1q. 5,q.',
      arp: '@1e 5e 8e 3^e 8e 5e',
      drums: '/8 k..x..',
    },
    VB: {
      meter: 3,
      chords: VELVET.B.chords,
      lead: VELVET.B.mel,
      acc: tr(VELVET.B.mel, -12),
      strings: '@pad',
      bass: '@1q. 5,q.',
      arp: '@1e 5e 8e 3^e 8e 5e',
      drums: '/8 [k..s..|]*7 k.sss.',
    },
    // The big one (played up a step).
    V2: {
      meter: 3,
      chords: VELVET.A.chords,
      lead: VELVET.A.mel,
      harm: '@3q. 5q.',
      acc: tr(VELVET.A.mel, -12),
      brass: '@cq. rq.',
      strings: '@pad',
      bass: '@1q. 5,q.',
      arp: '@1e 5e 8e 3^e 8e 5e',
      drums: '/8 c..s..|[k..s..|]*6 k.sk.s|[k..s..|]*7 k.ssss',
    },
    // A breath: just the music box and the pad.
    V3: { meter: 3, chords: VELVET.A.chords, box: VELVET.A.mel, pad: '@pad', bass: '@1h.' },
    // The town hook, quoted at the very end.
    Tag: {
      chords: 'C | F/A | Dm7 G7 | C',
      box: tr(slice(TOWN.A1.mel, 0, 3), 10) + ' | C6h. rq',
      lead: tr(slice(TOWN.A1.mel, 0, 3), -2) + ' | C5h. rq',
      strings: '@pad',
      bass: '@1h 5,h',
      drums: '[k.......s.......|]*3 k...........s.s.',
    },
  },
  intro: ['Dw', 'Bs', 'V', 'VB'],
  form: ['V2^2', 'VB^2', 'V3^2', 'V2^2', 'Tag'],
};

export const ARENA_SONGS: SongDef[] = [sportatorium, show, match, victory, matchEnd, workout, dungeon, ending];
