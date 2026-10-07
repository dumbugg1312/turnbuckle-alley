/**
 * The everyday soundtrack: town, home, the diner, rain, night, the prologue.
 * Relaxed and warm. The town hook and the Duchess Waltz carry most of it.
 */
import type { SongDef } from '../notation';
import { DUCHESS, TOWN, VELVET } from './motifs';
import { onlyBars, tr, trc } from './util';

const TOWN_DRUMS = '[k.z.x.z.k.z.x.z.|]*7 k.z.x.z.k.zzx.xx';

export const town: SongDef = {
  id: 'town',
  title: 'Turnbuckle Alley',
  bpm: 100,
  swing: 0.14,
  key: 'D',
  tracks: {
    lead: { inst: 'lead', echo: 0.22 },
    flute: { inst: 'lead50', echo: 0.3 },
    bell: { inst: 'musicbox', vol: 0.75, echo: 0.4, pan: 0.2, center: 60 },
    harm: { inst: 'harm', vol: 0.75, center: 62, pan: -0.25 },
    arp: { inst: 'arp', vol: 0.8, center: 55, pan: 0.3 },
    pad: { inst: 'pad', center: 60 },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.5 },
  },
  sections: {
    I: {
      chords: 'D | G/B | Em7 | A7sus4 A7',
      bell: 'rw | rw | A5e F#6q. E6e D6e E6q | D6h rh',
      pad: '@pad',
      bass: '@1h 5,h',
      arp: '@1e 5e 8e 3^e 5^e 3^e 8e 5e',
    },
    A1: { chords: TOWN.A1.chords, lead: TOWN.A1.mel, harm: '@rh 5q 3q', pad: '@pad', bass: '@1q. 5,e 1q Aq', drums: TOWN_DRUMS },
    A2: {
      chords: TOWN.A2.chords,
      lead: TOWN.A2.mel,
      harm: '@rh 5q 3q',
      arp: '@1e 5e 8e 3^e 5^e 3^e 8e 5e',
      pad: '@pad',
      bass: '@1q. 5,e 1q Aq',
      drums: TOWN_DRUMS,
    },
    B: {
      chords: TOWN.B.chords,
      lead: TOWN.B.mel,
      arp: '@[1e 5e 8e 5e]*2',
      pad: '@pad',
      bass: '@1h 5,q Aq',
      drums: '[k.zzx.z.k.zzx.z.|]*7 k.zzx.z.k.zzxxxx',
    },
    C: {
      chords: TOWN.C.chords,
      flute: TOWN.C.mel,
      bell: "@rh 8^e' 5^e' 3^q",
      pad: '@pad',
      bass: '@1q 5,q 3q 5q',
      drums: 'k.......x.......',
    },
  },
  intro: ['I'],
  form: ['A1', 'A2', 'B', 'A2', 'C', 'B', 'A2'],
  fx: { birds: 0.22 },
};

export const townEvening: SongDef = {
  id: 'town-evening',
  title: 'Golden Hour on Main Street',
  bpm: 84,
  swing: 0.1,
  key: 'D',
  echo: { beats: 0.75, feedback: 0.36, wet: 0.34 },
  tracks: {
    lead: { inst: 'lead50', echo: 0.3 },
    keys: { inst: 'epiano', vol: 0.9, center: 60 },
    harm: { inst: 'harm12', vol: 0.6, center: 66, pan: 0.25 },
    pad: { inst: 'pad', center: 60 },
    bass: { inst: 'bassPluck', vol: 0.9 },
    drums: { inst: 'kit', vol: 0.4 },
  },
  sections: {
    I: { chords: 'Dmaj7 | A7sus4', keys: '@cq. ce re cq.', pad: '@pad', bass: '@1w' },
    A1: {
      chords: 'Dmaj7 | G/B | Em7 A7 | D6 | Bm7 | Gmaj7 | Em7 | A7sus4 A7',
      lead: TOWN.A1.mel,
      keys: '@cq. ce re cq.',
      pad: '@pad',
      bass: '@1h 5,q. Ae',
      drums: '....x.......x...',
    },
    A2: {
      chords: 'Dmaj7 | G/B | Em7 A7 | D6 | Bm7 | G Gm6 | D/A A7 | D',
      lead: TOWN.A2.mel,
      keys: '@cq. ce re cq.',
      harm: '@rh 3h',
      pad: '@pad',
      bass: '@1h 5,q. Ae',
      drums: '....x.......x..z',
    },
    B: {
      chords: 'Cmaj7 | Bm7 | Gmaj7 | A7sus4 A7 | Cmaj7 | Bm7 E7 | Gm6 | A7',
      lead: 'E5q. G5e B5h | A5q. F#5e D5h | B4q D5q F#5q. E5e | D5h C#5h | E5q. G5e C6q B5q | A5q F#5q G#5q. B5e | Bb5h. G5e E5e | E5q. C#5e A4h',
      keys: '@cq. ce re cq.',
      pad: '@pad',
      bass: '@1h 5,h',
      drums: '....x.......x...',
    },
    C: { chords: TOWN.C.chords, lead: TOWN.C.mel, keys: '@ch ch', harm: '@3w', pad: '@pad', bass: '@1h 5,h' },
  },
  intro: ['I'],
  form: ['A1', 'A2', 'B', 'A2', 'C'],
  fx: { crickets: 0.12, birds: 0.05 },
};

export const rain: SongDef = {
  id: 'rain',
  title: 'Rain on the Porch Roof',
  bpm: 76,
  swing16: 0.18,
  key: 'D',
  echo: { beats: 0.75, feedback: 0.4, wet: 0.36 },
  tracks: {
    box: { inst: 'musicbox', echo: 0.45, pan: 0.15, center: 60 },
    lead: { inst: 'lead50', vol: 0.9, echo: 0.3 },
    keys: { inst: 'epiano', center: 60 },
    pad: { inst: 'pad', center: 62 },
    bass: { inst: 'bassPluck', vol: 0.8 },
    drums: { inst: 'kit', vol: 0.32 },
  },
  sections: {
    I: { chords: 'Dmaj9 | A13', keys: '@cq. ce rh', pad: '@pad', bass: '@1w' },
    A: {
      chords: 'Dmaj9 | G/B | Em9 A13 | Dmaj7 | Bm9 | Gmaj7 | Em7 | A7sus4 A7',
      box: tr(TOWN.A1.mel, 12),
      keys: '@cq. ce rh',
      pad: '@pad',
      bass: '@1h. 5,q',
      drums: '....x.......x..z',
    },
    B: {
      chords: 'Gmaj7 | F#m7 | Em9 | Dmaj7 | Gmaj7 | F#m7 Bm7 | Em7 | A7sus4',
      lead: 'D6e B5e F#5q -h | C#6e A5e E5q -h | B5e G5e D5q -q E5q | F#5w | D6e B5e F#5q -q A5q | A5q. F#5e D5q. C#5e | B4h E5q G5q | F#5h E5h',
      keys: '@cq. ce rh',
      pad: '@pad',
      bass: '@1h 5,h',
      drums: '....x.......x...',
    },
    A2: {
      chords: 'Dmaj9 | G/B | Em9 A13 | Dmaj7 | Bm9 | G Gm6 | D/A A7 | Dmaj9',
      lead: TOWN.A2.mel,
      box: "@rw | rh 8^q' 5^q'",
      keys: '@cq. ce rh',
      pad: '@pad',
      bass: '@1h. 5,q',
      drums: '....x.......x..z',
    },
    B2: {
      chords: 'Gmaj7 | F#m7 | Em9 | Dmaj7 | Gmaj7 | F#m7 Bm7 | Em7 | A7sus4',
      box: 'D6e B5e F#5q -h | C#6e A5e E5q -h | B5e G5e D5q -q E5q | F#5w | D6e B5e F#5q -q A5q | A5q. F#5e D5q. C#5e | B4h E5q G5q | F#5h E5h',
      keys: '@cq. ce rh',
      pad: '@pad',
      bass: '@1h 5,h',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A2', 'B2'],
  fx: { rain: 0.32 },
};

const NIGHT_A = 'C5q A5h. | G5q. F5e D5h | Bb4q D5q G5q F5q | E5h. rq | C5q A5h. | Bb5q. A5e F5h | G5q. F5e D5q Bb4q | C5h. rq';
const NIGHT_B = 'F5h. Ab5q | G5q Eb5q A5h | F5h D5h | Db5h. G4q | C5q E5q G5h | F5h. A5q | Bb5h A5q G5q | F5h. G4q';

export const night: SongDef = {
  id: 'night',
  title: 'Fireflies Over the Water Tower',
  bpm: 66,
  key: 'F',
  echo: { beats: 1.5, feedback: 0.4, wet: 0.4 },
  tracks: {
    box: { inst: 'musicbox', echo: 0.5 },
    whistle: { inst: 'whistle', vol: 0.75, echo: 0.4 },
    arp: { inst: 'arp', vol: 0.5, center: 55, pan: -0.3 },
    pad: { inst: 'pad', vol: 0.9, center: 60 },
    bass: { inst: 'bassPluck', vol: 0.55 },
  },
  sections: {
    A: { chords: 'Fmaj7 | Bbmaj7 | Gm7 C7sus4 | Fmaj7 | Dm7 | Bbmaj7 | Gm7 | C7sus4 C7', box: tr(NIGHT_A, 12), pad: '@pad', bass: '@1h 5,h' },
    B: {
      chords: 'Dbmaj7 | Cm7 F7 | Bbmaj7 | Bbm6 | Am7 | Dm7 | Gm7 | C7sus4',
      whistle: NIGHT_B,
      arp: '@1e 5e 8e 5e 3^e 5e 8e 5e',
      pad: '@pad',
      bass: '@1h 5,h',
    },
    A2: {
      chords: 'Fmaj7 | Bbmaj7 | Gm7 C7sus4 | Fmaj7 | Dm7 | Bbmaj7 | Gm7 | C7sus4 C7',
      box: tr(NIGHT_A, 12),
      whistle: '@rw | 3h 5h',
      pad: '@pad',
      bass: '@1h 5,h',
    },
  },
  form: ['A', 'B', 'A2', 'B'],
  fx: { crickets: 0.45 },
};

export const home: SongDef = {
  id: 'home',
  title: "Grandma's House",
  bpm: 80,
  meter: 3,
  key: 'F',
  tracks: {
    lead: { inst: 'whistle', echo: 0.25 },
    flute: { inst: 'lead50', vol: 0.95, echo: 0.25 },
    box: { inst: 'musicbox', vol: 0.9, echo: 0.35 },
    keys: { inst: 'keys', vol: 0.65, center: 62 },
    harm: { inst: 'harm12', vol: 0.55, center: 66, pan: 0.3 },
    pad: { inst: 'pad', vol: 0.8, center: 60 },
    bass: { inst: 'bassPluck', vol: 0.9 },
  },
  sections: {
    I: { chords: 'F | C7', keys: '@rq cq cq', bass: '@1q rh', pad: '@pad' },
    A: { chords: DUCHESS.A.chords, lead: DUCHESS.A.mel, keys: '@rq cq cq', bass: '@1q rh 5,q rh', pad: '@pad' },
    B: { chords: DUCHESS.B.chords, flute: DUCHESS.B.mel, keys: '@rq cq cq', harm: '@3h.', bass: '@1q rh 5,q rh', pad: '@pad' },
    C: {
      chords: 'Bbmaj7 | Am7 | Gm7 | C7 | Bbmaj7 | Am7 D7 | Gm7 | C7sus4 C7',
      box: 'D5q F5q A5q | G5h. | F5q Bb4q D5q | E5h. | D5q F5q A5q | C6q. A5e F#5q | G5q. F5e D5q | C5h.',
      keys: '@rq cq cq',
      bass: '@1q rh 5,q rh',
      pad: '@pad',
    },
    A2: { chords: DUCHESS.A.chords, box: DUCHESS.A.mel, harm: '@3h.', keys: '@rq cq cq', bass: '@1q rh 5,q rh', pad: '@pad' },
  },
  intro: ['I'],
  form: ['A', 'B', 'C', 'A2', 'B'],
};

export const sad: SongDef = {
  id: 'sad',
  title: 'The Body Remembers',
  bpm: 63,
  meter: 3,
  key: 'F',
  echo: { beats: 1, feedback: 0.4, wet: 0.38 },
  tracks: {
    lead: { inst: 'fiddle', echo: 0.32 },
    box: { inst: 'musicbox', vol: 0.65, echo: 0.5, center: 58 },
    strings: { inst: 'strings', vol: 0.9 },
    pad: { inst: 'pad', center: 60 },
    bass: { inst: 'bass', vol: 0.6 },
  },
  sections: {
    I: { chords: 'Dm | Bbmaj7', pad: '@pad', box: 'A5h. | F5h.' },
    A: { chords: 'Dm | Bbmaj7 | Gm7 | F/A | C | C7 | Bbmaj7 | Dm', lead: DUCHESS.A.mel, pad: '@pad', bass: '@1h.' },
    B: { chords: DUCHESS.B.chords, lead: DUCHESS.B.mel, strings: '@pad', box: "@rq 5^q' 3^q'", bass: '@1h.' },
    // On foggy days one phrase drops out, and the melody waits for it.
    A2: {
      chords: 'Dm | Bbmaj7 | Gm7 | F/A | C | C7 | Bbmaj7 | Dm',
      lead: onlyBars(DUCHESS.A.mel, (i) => i !== 4 && i !== 5, 3),
      pad: '@pad',
      bass: '@1h.',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A2', 'B'],
};

export const title: SongDef = {
  id: 'title',
  title: 'Turnbuckle Alley',
  bpm: 84,
  key: 'Bb',
  echo: { beats: 0.75, feedback: 0.38, wet: 0.34 },
  tracks: {
    lead: { inst: 'lead', echo: 0.3 },
    box: { inst: 'musicbox', echo: 0.45, pan: 0.15 },
    harm: { inst: 'harm', vol: 0.75, center: 62, pan: -0.25 },
    brass: { inst: 'brass', vol: 0.7 },
    strings: { inst: 'strings', vol: 0.9 },
    pad: { inst: 'pad', center: 60 },
    arp: { inst: 'arp', vol: 0.75, center: 58, pan: 0.3 },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.5 },
  },
  sections: {
    I: { chords: 'Bb | Gm7 | Ebmaj7 | F7sus4', box: 'F5q Bb5q. C6e D6q | F6h. D6q | Eb6q. D6e C6q Bb5q | C6w', pad: '@pad' },
    A: {
      chords: 'Bb | F/A | Gm7 | Ebmaj7 | Bb/D | Eb | Cm7 | F7sus4 F7',
      lead: 'F4q Bb4q. C5e D5q | C5h. F4q | Bb4q D5q. Eb5e F5q | G5h. F5q | F5q. D5e Bb4q D5q | Eb5q. G5e Bb5q G5q | F5q. Eb5e D5q C5q | Bb4h A4h',
      pad: '@pad',
      arp: '@[1e 5e 8e 5e]*2',
      bass: '@1q. 5,e 1h',
      drums: 'k.....k.s.......',
    },
    B: {
      chords: 'Eb | F | Dm7 Gm | Cm7 F | Eb | F | Gb | Ab',
      lead: 'G5q. F5e Eb5q Bb4q | C5q. D5e Eb5q F5q | F5q. A5e Bb5q D5q | Eb5q. D5e C5q A4q | Bb4q Eb5q G5q Bb5q | C6h. A5q | Bb5q. Ab5e Gb5q Db5q | Eb5q Ab5q C6h',
      brass: '@ch. cq',
      strings: '@pad',
      arp: '@[1e 5e 8e 5e]*2',
      bass: '@1q. 5,e 1q 5,q',
      drums: '[k.h.s.h.k.h.s.h.|]*7 k.h.s.h.s.ssmmtt',
    },
    C: {
      chords: 'Gm7 | Ebmaj7 | Bb/D | Cm7 F7 | Gm7 | Ebmaj7 | Cm7 | F7sus4',
      box: 'D5e G5q. A5e Bb5e -q | G5w | F5e Bb5q. C6e D6e -q | C6h A5h | D5e G5q. A5e Bb5e -q | Bb5q. G5e Eb6h | D6q. C6e Bb5q G5q | F5w',
      pad: '@pad',
      bass: '@1w',
    },
    A2: {
      chords: 'Bb | F/A | Gm7 | Ebmaj7 | Bb/D | Eb | Cm7 | F7sus4 F7',
      lead: 'F4q Bb4q. C5e D5q | C5h. F4q | Bb4q D5q. Eb5e F5q | G5h. F5q | F5q. D5e Bb4q D5q | Eb5q. G5e Bb5q G5q | F5q. Eb5e D5q C5q | Bb4h A4h',
      harm: '@3q. 5q. 3q',
      strings: '@pad',
      arp: '@[1e 5e 8e 5e]*2',
      bass: '@1q. 5,e 1q 5,q',
      drums: '[k.h.s.h.k.h.s.h.|]*7 k.h.s.h.k.hks.ss',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'C', 'A2', 'B'],
};

export const city: SongDef = {
  id: 'city',
  title: 'MaxxMedia, Floor 31',
  bpm: 108,
  key: 'A',
  tracks: {
    lead: { inst: 'lead12', vol: 0.75, echo: 0.35 },
    box: { inst: 'musicbox', vol: 0.9, echo: 0.5 },
    arp: { inst: 'arp', vol: 0.85, center: 64, pan: 0.2 },
    strings: { inst: 'strings', vol: 0.75 },
    bass: { inst: 'bassSynth', vol: 0.7 },
    drums: { inst: 'kit', vol: 0.35 },
  },
  sections: {
    I: { chords: 'Am9 | Fmaj7', arp: '@[1s 5s 8s 5s 9s 5s 8s 5s]*2' },
    A: {
      chords: 'Am9 | Fmaj7 | C | G/B | Am9 | Fmaj7 | C | G/B',
      lead: 'rq E5q B5q A5q | G5h. E5q | C5w | rh D5q B4q | rq E5q B5q A5q | G5q. A5e E5h | G5q. E5e C5h | D5w',
      arp: '@[1s 5s 8s 5s 9s 5s 8s 5s]*2',
      bass: '@[1e re]*4',
      drums: 'x...h...x...h...',
    },
    A2: {
      chords: 'Am9 | Fmaj7 | C | G/B | Am9 | Fmaj7 | C | G/B',
      lead: 'rq E5q B5q A5q | G5h. E5q | C5w | rh D5q B4q | rq E5q B5q A5q | G5q. A5e E5h | G5q. E5e C5h | D5w',
      arp: '@[1s 5s 8s 5s 9s 5s 8s 5s]*2',
      strings: '@pad',
      bass: '@[1e re]*4',
      drums: 'x...h...x...h...',
    },
    // The letter: Grandma's Velvet cell, faint, from somewhere far away.
    B: {
      chords: 'Fmaj7 | G | Em7 | Am7 | Fmaj7 | G | Dm7 | E7sus4 E7',
      box: 'G5e C6q. D6e E6e -q | D6h. B5q | G5q. E5e B5h | A5w | G5e C6q. D6e E6e -q | F6h. D6q | C6q. A5e F5h | E5h G#5h',
      arp: '@[1s 5s 8s 5s 9s 5s 8s 5s]*2',
      strings: '@pad',
      bass: '@1h 1h',
    },
  },
  intro: ['I'],
  form: ['A', 'A2', 'B', 'A2'],
  fx: { lowpass: 5200, hum: 0.05 },
};

export const bus: SongDef = {
  id: 'bus',
  title: 'The Long Bus Home',
  bpm: 112,
  key: 'G',
  tracks: {
    lead: { inst: 'lead', echo: 0.2 },
    harm: { inst: 'harm', vol: 0.75, center: 62, pan: -0.25 },
    arp: { inst: 'arp', vol: 0.7, center: 60, pan: 0.3 },
    pad: { inst: 'pad', center: 60 },
    bass: { inst: 'bass' },
    drums: { inst: 'kit', vol: 0.5 },
    perc: { inst: 'kit', vol: 0.3 },
  },
  sections: {
    I: { chords: 'G | D/F#', bass: '@1e*8', drums: 'k.h.k.h.k.h.k.hh', arp: '@[1e 5e]*4' },
    A: {
      chords: 'G | D/F# | Em7 | Cadd9 | G | D/F# | Cadd9 | D',
      lead: 'B4q D5q G5q. F#5e | E5q. D5e A4h | B4q E5q G5q. F#5e | E5h D5h | B4q D5q G5q. A5e | B5q. A5e F#5h | G5q. E5e D5q C5q | D5h. rq',
      pad: '@pad',
      bass: '@1e*8',
      arp: '@[1e 5e]*4',
      drums: '[k.h.s.h.k.h.s.h.|]*7 k.h.s.h.k.hks.ss',
      perc: 'z.z.z.z.z.z.z.z.',
    },
    B: {
      chords: 'Em | C | G | D | Em | C | A7 | D',
      lead: 'G5q. F#5e E5q B4q | C5q. D5e E5q G5q | D5q. B4e G4q B4q | A4h. rq | G5q. F#5e E5q B5q | C6q. B5e G5q E5q | C#5q E5q G5q A5q | F#5h. rq',
      harm: '@3h 5h',
      pad: '@pad',
      bass: '@1e*8',
      arp: '@[1e 5e 8e 5e]*2',
      drums: '[k.h.s.h.k.h.s.h.|]*7 k.h.s.h.s.ssmmtt',
      perc: 'z.z.z.z.z.z.z.z.',
    },
    // Arrival: the countryside opens up and the town hook appears.
    C: {
      chords: TOWN.A1.chords,
      lead: TOWN.A1.mel,
      harm: '@rh 5q 3q',
      pad: '@pad',
      bass: '@1q. 5,e 1q Aq',
      arp: '@1e 5e 8e 3^e 5^e 3^e 8e 5e',
      drums: '[k.z.x.z.k.z.x.z.|]*7 k.z.x.z.k.zzx.xx',
    },
    T: { chords: 'Am7 D7', bass: '@1e*8', drums: 'k.h.s.h.s.s.ssss' },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'B', 'C', 'T'],
  fx: { birds: 0.08 },
};

export const diner: SongDef = {
  id: 'diner',
  title: 'Hot Tag Diner Jukebox',
  bpm: 120,
  swing: 0.3,
  key: 'C',
  tracks: {
    lead: { inst: 'trumpet', vol: 0.85, echo: 0.2 },
    keys: { inst: 'keys', vol: 0.8, center: 62 },
    organ: { inst: 'organ', vol: 0.75, center: 64 },
    bass: { inst: 'bassPluck' },
    drums: { inst: 'kit', vol: 0.45 },
  },
  sections: {
    I: { chords: 'C | G7', keys: '@ce*8', bass: '@1q 3q 5q Aq', drums: 'k.h.s.h.k.h.s.hh' },
    A: {
      chords: 'C | Am | F | G7 | C | Am | F G7 | C',
      lead: 'E5q. G5e -q E5q | A5q. G5e E5q C5q | F5q A5q C6q A5q | G5h. rq | E5q. G5e -q E5q | A5q. C6e A5q G5q | F5q A5q G5q B4q | C5h. rq',
      keys: '@ce*8',
      bass: '@1q 3q 5q Aq',
      drums: 'k.h.s.h.k.h.s.h.',
    },
    A2: {
      chords: 'C | Am | F | G7 | C | Am | F G7 | C',
      lead: 'E5q. G5e -q E5q | A5q. G5e E5q C5q | F5q A5q C6q A5q | G5h. rq | E5q. G5e -q E5q | A5q. C6e A5q G5q | F5q A5q G5q B4q | C5h. rq',
      keys: '@ce*8',
      organ: '@pad',
      bass: '@1q 3q 5q Aq',
      drums: 'k.h.s.h.k.h.s.h.',
    },
    B: {
      chords: 'F | Fm6 | C/G | A7 | Dm7 | G7 | C A7 | Dm7 G7',
      lead: 'A5q. G5e F5q C5q | Ab5q. G5e F5q D5q | E5h G5h | A5q. G5e E5q C#5q | D5q F5q A5q C6q | B5q. A5e G5q F5q | E5q G5q C#5q E5q | D5q F5q B4q D5q',
      keys: '@ce*8',
      organ: '@pad',
      bass: '@1q 3q 5q Aq',
      drums: '[k.h.s.h.k.h.s.h.|]*7 k.h.s.h.k.s.s.ss',
    },
    // The jukebox's cover of the town theme.
    C: {
      chords: trc(TOWN.A1.chords, -2),
      lead: tr(TOWN.A1.mel, -2),
      keys: '@ce*8',
      bass: '@1q 3q 5q Aq',
      drums: 'k.h.s.h.k.h.s.h.',
    },
  },
  intro: ['I'],
  form: ['A', 'A2', 'B', 'A', 'C', 'B', 'A2'],
  fx: { crackle: 0.12 },
};

export const tapes: SongDef = {
  id: 'tapes',
  title: 'Tape Bin Daydream',
  bpm: 76,
  swing16: 0.24,
  key: 'F',
  echo: { beats: 0.75, feedback: 0.42, wet: 0.36 },
  tracks: {
    lead: { inst: 'lead50', vol: 0.95, echo: 0.35 },
    keys: { inst: 'epiano', center: 60 },
    bass: { inst: 'bassPluck', vol: 0.85 },
    drums: { inst: 'kit', vol: 0.42 },
    perc: { inst: 'kit', vol: 0.25 },
  },
  sections: {
    A: {
      chords: 'Fmaj7 | Em7 A7 | Dm7 | Cm7 F7 | Bbmaj7 | Am7 D7 | Gm7 | C7sus4',
      lead: 'C5e F5q. G5e A5e -q | G5q. E5e C#5h | D5e F5e A5e C6e -h | Bb5q. G5e A5h | D5e F5q. A5e Bb5e -q | C6q. A5e F#5h | G5q. F5e D5q Bb4q | C5w',
      keys: '@cq. ce rh',
      bass: '@1q. 5,e rq 1e 5,e',
      drums: 'k...s..k..k.s...|k...s..k..k.s.k.',
      perc: 'h.h.h.hhh.h.h.hh',
    },
    B: {
      chords: 'Bbmaj7 | Bbm6 | Am7 | Dm7 | Gm7 | C7 | Fmaj7 | C7sus4',
      lead: 'D5h. F5q | Db5h. Bb4q | C5q. E5e G5h | F5q. E5e D5h | Bb4e D5e F5e A5e -h | G5q. E5e C5h | A5w | G5h. rq',
      keys: '@cq. ce rh',
      bass: '@1q. 5,e rq 1e 5,e',
      drums: 'k...s..k..k.s...|k...s..k..k.s.k.',
      perc: 'h.h.h.hhh.h.h.hh',
    },
  },
  form: ['A', 'B', 'A', 'B'],
  fx: { wobble: 16, hiss: 0.05, lowpass: 3400 },
};

export const creator: SongDef = {
  id: 'creator',
  title: 'Make Your Wrestler',
  bpm: 116,
  swing: 0.2,
  key: 'C',
  tracks: {
    lead: { inst: 'marimba', echo: 0.2 },
    kazoo: { inst: 'lead12', vol: 0.9, echo: 0.15 },
    guitar: { inst: 'pluck', vol: 0.85, center: 60 },
    pad: { inst: 'pad', vol: 0.6, center: 62 },
    bass: { inst: 'bassPluck' },
    drums: { inst: 'kit', vol: 0.45 },
  },
  sections: {
    I: { chords: 'Cmaj7 | G7', guitar: '@cq. ce re ce cq', bass: '@1q. 5,e 1q 5,q', drums: 'k.zzx.zzk.zzx.zz' },
    A: {
      chords: 'Cmaj7 | A7 | Dm7 | G7 | Em7 | A7 | Dm7 G7 | Cmaj7',
      lead: 'E5e G5e B5e G5e A5q E5q | G5e C#5e E5e G5e A5h | F5e A5e C6e A5e B5q A5q | G5q. F5e D5q B4q | E5e G5e B5e D6e C6q B5q | A5e C#6e E6e C#6e A5q G5q | F5q A5q G5q F5q | E5q G5e C6e -h',
      guitar: '@cq. ce re ce cq',
      bass: '@1q. 5,e 1q 5,q',
      drums: 'k.zzx.zzk.zzx.zz',
    },
    B: {
      chords: 'Fmaj7 | Fm6 | Em7 | A7 | Dm7 | G7 | E7 A7 | D7 G7',
      lead: 'A5q. C6e A5q F5q | Ab5q. C6e Ab5q F5q | G5q. B5e G5q E5q | C#6q. A5e G5q E5q | F5e A5e C6e E6e D6q C6q | B5q. A5e G5q F5q | G#5q B5q G5q C#5q | F#5q A5q F5q B4q',
      guitar: '@cq. ce re ce cq',
      pad: '@pad',
      bass: '@1q. 5,e 1q 5,q',
      drums: '[k.zzx.zzk.zzx.zz|]*7 k.zzx.zzk.x.x.xx',
    },
    A2: {
      chords: 'Cmaj7 | A7 | Dm7 | G7 | Em7 | A7 | Dm7 G7 | Cmaj7',
      kazoo: 'E5e G5e B5e G5e A5q E5q | G5e C#5e E5e G5e A5h | F5e A5e C6e A5e B5q A5q | G5q. F5e D5q B4q | E5e G5e B5e D6e C6q B5q | A5e C#6e E6e C#6e A5q G5q | F5q A5q G5q F5q | E5q G5e C6e -h',
      guitar: '@cq. ce re ce cq',
      bass: '@1q. 5,e 1q 5,q',
      drums: 'k.zzx.zzk.zzx.zz',
    },
    C: {
      chords: 'Abmaj7 | Bb7 | Cmaj7 | Am7 | Abmaj7 | Bb7 | Dm7 | G7',
      lead: 'C6q. Bb5e G5q Eb5q | D6q. C6e Ab5q F5q | E6q. D6e B5q G5q | A5h. C6q | Eb6q. C6e G5q Eb5q | F6q. D6e Bb5q Ab5q | F5e A5e C6e A5e D6q C6q | B5q. G5e F5q D5q',
      guitar: '@cq. ce re ce cq',
      pad: '@pad',
      bass: '@1q. 5,e 1q 5,q',
      drums: 'k.zzx.zzk.zzx.zz',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A2', 'C', 'B', 'A'],
};

export const fair: SongDef = {
  id: 'fair',
  title: 'Fairgrounds Calliope',
  bpm: 152,
  meter: 3,
  key: 'F',
  tracks: {
    lead: { inst: 'calliope', echo: 0.15 },
    glock: { inst: 'bell', vol: 0.6, pan: 0.3, center: 62 },
    oom: { inst: 'bass' },
    pah: { inst: 'keys', vol: 0.75, center: 62 },
    drums: { inst: 'kit', vol: 0.45 },
  },
  sections: {
    I: { chords: 'F | C7', oom: '@1q rh 5,q rh', pah: '@rq cq cq', drums: 'k...s...s...' },
    A: {
      chords: 'F | F | C7 | C7 | C7 | C7 | F | F | F | F7 | Bb | Bbm | F/C | D7 | G7 C7 | F',
      lead: 'A4q C5q F5q | E5q. F5e A5q | G5q. F#5e G5q | E5h. | Bb4q C5q E5q | D5q. C#5e D5q | C5q A4q F4q | A4h. | A4q C5q F5q | A5q. G#5e A5q | Bb5q. A5e G5q | Db6h. | C6q A5q F5q | F#5q. G5e A5q | B5q. Bb5q. | A5q F5q rq',
      oom: '@1q rh 5,q rh',
      pah: '@rq cq cq',
      drums: '[k...s...s...|]*15 k...s.s.sss.',
    },
    B: {
      chords: 'Bb | Bb | F | F | C7 | C7 | F | F',
      lead: 'D5q F5q Bb5q | D6q. C6e Bb5q | A5q F5q C5q | A5h. | G5q. A5e Bb5q | C6q Bb5q G5q | A5q. G5e F5q | F5h.',
      glock: "@rq 5^q' 3^q'",
      oom: '@1q rh 5,q rh',
      pah: '@rq cq cq',
      drums: 'k...s...s...',
    },
    // The funhouse.
    C: {
      chords: 'Dm | A7 | Dm | A7 | Dm | Gm | A7 | Dm',
      lead: 'D5q F5q A5q | G5q. F5e E5q | F5q A5q D6q | C#6h. | D6q C6q A5q | Bb5q. A5e G5q | E5q. F5e G5q | D5h.',
      oom: '@1q rh 5,q rh',
      pah: '@rq cq cq',
      drums: 'k...t...t...',
    },
  },
  intro: ['I'],
  form: ['A', 'B', 'A', 'C', 'B'],
};

/** Grandma's waltz quietly in the background of the Evening Bell (retirement home). */
export const eveningBell: SongDef = {
  id: 'evening-bell',
  title: 'The Evening Bell',
  bpm: 72,
  meter: 3,
  key: 'F',
  tracks: {
    box: { inst: 'musicbox', vol: 0.9, echo: 0.45 },
    pad: { inst: 'pad', center: 60 },
    bass: { inst: 'bassPluck', vol: 0.6 },
    harm: { inst: 'harm12', vol: 0.45, center: 64 },
  },
  sections: {
    A: { chords: DUCHESS.A.chords, box: DUCHESS.A.mel, pad: '@pad', bass: '@1q rh' },
    B: { chords: DUCHESS.B.chords, box: DUCHESS.B.mel, harm: '@3h.', pad: '@pad', bass: '@1q rh' },
    V: { chords: trc(VELVET.B.chords, -5), box: tr(VELVET.B.mel, -5), pad: '@pad', bass: '@1h.' },
  },
  form: ['A', 'B', 'A', 'V'],
};

export const WORLD_SONGS: SongDef[] = [town, townEvening, rain, night, home, sad, title, city, bus, diner, tapes, creator, fair, eveningBell];
