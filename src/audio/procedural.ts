/**
 * Procedural entrance themes for the player's wrestler. Pure and
 * deterministic: the same { style, tempo, seed } always writes the same
 * song, in the same notation as the hand-written soundtrack.
 *
 * Structure: a 2-bar intro hit, then A (motif, motif sequenced, climb,
 * cadence home), A2 (with a harmony line), B (a new motif, ending on the
 * dominant) and A2 again.
 */
import type { SectionDef, SongDef, SongFx, TrackDef } from './notation';
import { midiToName, pcOf } from './notation';

export const THEME_STYLES = ['rock', 'synth', 'funk', 'country', 'orchestral', 'hiphop', 'metal', 'lucha', 'disco', 'spooky'] as const;
export type ThemeStyle = (typeof THEME_STYLES)[number];

export interface SeedTheme {
  style: string;
  tempo: number;
  seed: number;
}

type Rng = () => number;

function mulberry32(a: number): Rng {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

const pick = <T>(r: Rng, xs: readonly T[]): T => xs[Math.floor(r() * xs.length) % xs.length];

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  harmonic: [0, 2, 3, 5, 7, 8, 11],
};

interface Layer {
  inst: string;
  tpl: string[];
  vol?: number;
  center?: number;
  pan?: number;
}

interface Style {
  keys: string[];
  mode: keyof typeof SCALES;
  meter: 3 | 4;
  swing?: number;
  swing16?: number;
  /** 4-bar progression cells in Roman numerals. */
  progA: string[][];
  progB: string[][];
  lead: string;
  leadCenter: number;
  harm?: { inst: string; mode: 'third' | 'octave' };
  bass: Layer;
  comp?: Layer;
  arp?: Layer;
  pad?: string;
  drums: string[];
  fill: string;
  perc?: string[];
  /** Grid prefix for drum strings (e.g. '/8 '). */
  grid?: string;
  /** Rhythm cells (beats per note, negative = rest), each one bar long. */
  rhythms: number[][];
  /** Cadence bar cells: the last note lands home. */
  endings: number[][];
  leap: number;
  fx?: SongFx;
}

const R4 = {
  plain: [
    [1, 1, 1, 1],
    [0.5, 0.5, 1, 1, 1],
    [1, 0.5, 0.5, 1, 1],
    [1.5, 0.5, 1, 1],
    [0.5, 0.5, 0.5, 0.5, 1, 1],
    [1, 1, 2],
    [1.5, 0.5, 2],
    [0.5, 1, 0.5, 1, 1],
  ],
  endings: [[4], [2, 2], [1, 1, 2], [3, -1]],
};

const STYLES: Record<ThemeStyle, Style> = {
  rock: {
    keys: ['E', 'A', 'D', 'G'],
    mode: 'mixolydian',
    meter: 4,
    progA: [['I', 'bVII', 'IV', 'I'], ['I', 'V', 'vi', 'IV'], ['I', 'IV', 'I', 'V'], ['vi', 'IV', 'I', 'V']],
    progB: [['IV', 'V', 'vi', 'I'], ['IV', 'I', 'V', 'V'], ['bVI', 'bVII', 'I', 'I'], ['ii', 'IV', 'V', 'V']],
    lead: 'lead',
    leadCenter: 72,
    harm: { inst: 'harm', mode: 'third' },
    bass: { inst: 'bass', tpl: ['@1e*8', '@1q. 1e 1q 1q'] },
    comp: { inst: 'power', tpl: ['@1q. 1q. 1q', '@1e*8', '@1h 1q 1q'], vol: 0.9 },
    drums: ['k.h.s.h.k.k.s.h.', 'k.h.s.h.k.hks.h.'],
    fill: 'k.h.s.h.s.ssmmtt',
    rhythms: [...R4.plain, [-0.5, 0.5, 1, 1, 1]],
    endings: R4.endings,
    leap: 0.25,
  },
  synth: {
    keys: ['A', 'C', 'F#', 'D', 'E'],
    mode: 'minor',
    meter: 4,
    progA: [['i', 'bVI', 'bIII', 'bVII'], ['i', 'iv', 'bVI', 'V'], ['i', 'bVII', 'bVI', 'bVII']],
    progB: [['bVI', 'bVII', 'i', 'i'], ['iv', 'v', 'bVI', 'bVII'], ['bIII', 'bVII', 'iv', 'V']],
    lead: 'lead50',
    leadCenter: 72,
    harm: { inst: 'harm12', mode: 'octave' },
    bass: { inst: 'bassSynth', tpl: ['@[1e 1^e]*4', '@1e*8'] },
    arp: { inst: 'arp', tpl: ['@[1s 5s 8s 5s]*4', '@[1s 3s 5s 8s]*4', '@[1s 5s 8s 3^s]*4'], center: 64, pan: 0.3 },
    pad: 'strings',
    drums: ['k...k...k...k...'],
    perc: ['..h.p.h...h.p.h.', '..o.p.o...o.p.o.'],
    fill: 'k...k...k.k.kkkk',
    rhythms: [
      [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1],
      [0.75, 0.75, 0.5, 1, 1],
      [1.5, 1.5, 1],
      [0.5, 1, 0.5, 1, 1],
      [0.25, 0.25, 0.5, 1, 2],
      [1, 1, 1, 1],
    ],
    endings: R4.endings,
    leap: 0.3,
  },
  funk: {
    keys: ['E', 'A', 'D', 'G'],
    mode: 'dorian',
    meter: 4,
    swing16: 0.1,
    progA: [['i7', 'IV7', 'i7', 'IV7'], ['i7', 'i7', 'IV9', 'IV9'], ['i7', 'iv7', 'i7', 'bVII7']],
    progB: [['bVII', 'IV', 'i7', 'i7'], ['iv7', 'bVII7', 'i7', 'i7'], ['bIIImaj7', 'IV7', 'v7', 'i7']],
    lead: 'lead',
    leadCenter: 70,
    bass: { inst: 'bassPluck', tpl: ['@1e. 1s re 8s 7s re 5,s 6,s 1e re', '@1e re 1s 1s re 8e 7e 5,e re'] },
    comp: { inst: 'wah', tpl: ['@[rs cs re]*4', '@[re cs cs]*4'], vol: 0.9, center: 60 },
    drums: ['k.h.s.hkh.hks.h.', 'k.h.s.h.khk.s.hk'],
    fill: 'k.h.s.hks.s.ssss',
    rhythms: [
      [0.25, 0.25, 0.5, 0.25, 0.75, 1, 1],
      [0.5, 0.25, 0.25, -0.5, 0.5, 1, 1],
      [-0.25, 0.25, 0.5, 0.5, 0.5, 0.75, 0.25, 1],
      [0.75, 0.25, 0.5, 0.5, 1, 1],
      [0.5, 0.5, -0.5, 0.5, 1, 1],
    ],
    endings: [[2, -2], [1, 1, -2], [0.5, 0.5, 1, -2]],
    leap: 0.2,
  },
  country: {
    keys: ['G', 'A', 'D', 'C', 'E'],
    mode: 'major',
    meter: 4,
    swing: 0.2,
    progA: [['I', 'I', 'IV', 'I'], ['I', 'IV', 'V7', 'I'], ['I', 'vi', 'IV', 'V7']],
    progB: [['IV', 'IV', 'I', 'I'], ['V7', 'V7', 'I', 'I'], ['IV', 'I', 'II7', 'V7']],
    lead: 'lead12',
    leadCenter: 69,
    harm: { inst: 'fiddle', mode: 'third' },
    bass: { inst: 'bassPluck', tpl: ['@1q 5,q 1q 5,q', '@1q rq 5,q rq'] },
    comp: { inst: 'pluck', tpl: ['@rq cq rq cq', '@re ce re ce re ce re ce'], vol: 0.8, center: 60 },
    drums: ['k.x.s.x.k.x.s.x.', 'k.j.s.j.k.j.s.j.'],
    fill: 'k.x.s.x.s.s.ssss',
    rhythms: [[1, 1, 1, 1], [0.5, 0.5, 1, 0.5, 0.5, 1], [1.5, 0.5, 1, 1], [1, 0.5, 0.5, 2], [0.5, 0.5, 0.5, 0.5, 2]],
    endings: R4.endings,
    leap: 0.2,
  },
  orchestral: {
    keys: ['C', 'D', 'Bb', 'Eb', 'F'],
    mode: 'major',
    meter: 4,
    progA: [['I', 'V', 'vi', 'iii'], ['I', 'IV', 'V', 'I'], ['I', 'vi', 'ii', 'V']],
    progB: [['IV', 'V', 'iii', 'vi'], ['ii', 'V', 'I', 'vi'], ['bVI', 'bVII', 'I', 'I']],
    lead: 'trumpet',
    leadCenter: 72,
    harm: { inst: 'harm', mode: 'third' },
    bass: { inst: 'bass', tpl: ['@1h 5,h', '@1q. 1e 5,h'] },
    comp: { inst: 'brass', tpl: ['@ch. cq', '@cq. ce ch'], vol: 0.8 },
    pad: 'strings',
    drums: ['t.......t...s.s.', 't...s...t...s.ss'],
    perc: ['c...............|................|................|................'],
    fill: 't.t.m.m.f.f.ssss',
    rhythms: [[2, 1, 1], [1.5, 0.5, 2], [1, 1, 2], [3, 1], [1, 0.5, 0.5, 1, 1], [0.75, 0.25, 1, 2]],
    endings: [[4], [2, 2], [3, -1]],
    leap: 0.3,
  },
  hiphop: {
    keys: ['C', 'F', 'G', 'A', 'D'],
    mode: 'dorian',
    meter: 4,
    swing16: 0.22,
    progA: [['i7', 'iv7', 'i7', 'iv7'], ['i9', 'bVImaj7', 'iv7', 'V7'], ['i7', 'bVImaj7', 'bIIImaj7', 'bVII7']],
    progB: [['bVImaj7', 'bVII7', 'i7', 'i7'], ['iv9', 'bVII9', 'bIIImaj7', 'V7']],
    lead: 'bell',
    leadCenter: 76,
    bass: { inst: 'bassPluck', tpl: ['@1q. 5,e rq 1e 5,e', '@1q. 1e rh'] },
    comp: { inst: 'epiano', tpl: ['@cq. ce rh', '@rh cq. ce'], center: 60 },
    drums: ['k...s..k..k.s...|k...s..k..k.s.k.'],
    perc: ['h.h.h.hhh.h.h.hh'],
    fill: 'k...s..k..k.s.ss',
    rhythms: [[-1, 0.5, 0.5, 1, 1], [0.75, 0.75, 0.5, 2], [0.5, 0.5, -0.5, 0.5, 1, 1], [1.5, 0.5, -1, 1]],
    endings: [[2, -2], [3, -1], [1, 1, -2]],
    leap: 0.25,
    fx: { crackle: 0.1 },
  },
  metal: {
    keys: ['E', 'D', 'C#', 'B'],
    mode: 'minor',
    meter: 4,
    progA: [['i', 'bVI', 'bVII', 'i'], ['i', 'bII', 'i', 'bVII'], ['i', 'iv', 'V', 'i']],
    progB: [['bVI', 'bVII', 'V', 'V'], ['iv', 'bVI', 'V', 'i']],
    lead: 'lead',
    leadCenter: 71,
    harm: { inst: 'harm', mode: 'third' },
    bass: { inst: 'bass', tpl: ['@1e*8'] },
    comp: { inst: 'power', tpl: ['@[1s 1s 1e]*4', '@1e*8'], vol: 0.95 },
    drums: ['kkhkskhkkkhkskhk', 'k.k.s.k.k.k.s.k.'],
    fill: 'kkkkssssmmmmtttt',
    rhythms: [[0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5], [0.25, 0.25, 0.5, 1, 1, 1], [1, 1, 0.5, 0.5, 1], [1.5, 0.5, 1, 1]],
    endings: R4.endings,
    leap: 0.3,
  },
  lucha: {
    keys: ['A', 'D', 'G', 'E'],
    mode: 'harmonic',
    meter: 4,
    progA: [['i', 'iv', 'V7', 'i'], ['i', 'i', 'V7', 'V7'], ['i', 'bVII', 'bVI', 'V7']],
    progB: [['bIII', 'bVII', 'iv', 'V7'], ['bVI', 'bIII', 'V7', 'i'], ['iv', 'i', 'V7', 'i']],
    lead: 'trumpet',
    leadCenter: 72,
    harm: { inst: 'brass', mode: 'third' },
    bass: { inst: 'bassPluck', tpl: ['@1q 5,e 5,e 1q 5,q'] },
    comp: { inst: 'pluck', tpl: ['@re ce re ce re ce re ce'], vol: 0.75, center: 60 },
    drums: ['k.b.k.bbk.b.k.bb'],
    perc: ['g.ggg.ggg.ggg.gg'],
    fill: 'k.b.k.bbs.s.ssss',
    rhythms: [[1.5, 0.5, 1.5, 0.5], [0.5, 0.5, 0.5, 0.5, 1, 1], [1, 0.5, 0.5, 1, 1], [0.75, 0.25, 1, 2]],
    endings: R4.endings,
    leap: 0.25,
  },
  disco: {
    keys: ['A', 'F', 'C', 'G', 'D'],
    mode: 'dorian',
    meter: 4,
    progA: [['i7', 'iv7', 'i7', 'iv7'], ['i7', 'iv7', 'bVII7', 'bIIImaj7'], ['i7', 'i7', 'iv9', 'V7']],
    progB: [['bVImaj7', 'bVII', 'i7', 'i7'], ['iv7', 'V7', 'i7', 'bVImaj7']],
    lead: 'lead50',
    leadCenter: 74,
    harm: { inst: 'harm12', mode: 'octave' },
    bass: { inst: 'bassSynth', tpl: ['@[1e 1^e]*4'] },
    arp: { inst: 'bell', tpl: ['@[1s 5s 8s 5s]*4', '@[1s 3s 5s 8s]*4'], vol: 0.55, center: 62, pan: 0.3 },
    pad: 'strings',
    drums: ['k...k...k...k...'],
    perc: ['..o.p.o...o.p.o.'],
    fill: 'k...k...k.p.pppp',
    rhythms: [[0.5, 0.5, 1, 0.5, 0.5, 1], [1.5, 0.5, 1, 1], [0.5, 1, 0.5, 2], [-0.5, 0.5, 0.5, 0.5, 1, 1]],
    endings: R4.endings,
    leap: 0.25,
  },
  spooky: {
    keys: ['D', 'E', 'C', 'A'],
    mode: 'harmonic',
    meter: 3,
    progA: [['i', 'iv', 'V7', 'i'], ['i', 'bVI', 'iio', 'V7'], ['i', 'V7', 'i', 'V7']],
    progB: [['iv', 'i', 'bVI', 'V7'], ['bVI', 'iv', 'V7', 'V7']],
    lead: 'theremin',
    leadCenter: 72,
    bass: { inst: 'bassPluck', tpl: ['@1q 5,q 5,q', '@1q rh'] },
    comp: { inst: 'harpsi', tpl: ["@rq cq' cq'"], vol: 0.8, center: 60 },
    grid: '/8 ',
    drums: ['k.x.x.', 'k.t.t.'],
    fill: 'k.xxxx',
    rhythms: [[1, 1, 1], [2, 1], [1.5, 0.5, 1], [0.5, 0.5, 1, 1], [1, 0.5, 0.5, 1]],
    endings: [[3], [2, 1], [2, -1]],
    leap: 0.3,
    fx: { wind: 0.06 },
  },
};

// ─── Harmony ────────────────────────────────────────────────────────────────

const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const DEG: Record<string, number> = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 };

interface ChordInfo {
  sym: string;
  /** Absolute pitch classes of the chord. */
  pcs: number[];
}

function roman(rn: string, keyPc: number): ChordInfo {
  const m = /^(b|#)?(VII|VI|V|IV|III|II|I|vii|vi|v|iv|iii|ii|i)(.*)$/.exec(rn);
  if (!m) throw new Error(`bad numeral ${rn}`);
  const acc = m[1] === 'b' ? -1 : m[1] === '#' ? 1 : 0;
  const minor = m[2] === m[2].toLowerCase();
  const suf = m[3];
  const root = (keyPc + DEG[m[2].toUpperCase()] + acc + 12) % 12;
  let q: string;
  if (minor) q = suf === 'o' ? 'dim' : suf === 'ø' ? 'm7b5' : suf === '7' ? 'm7' : suf === '9' ? 'm9' : 'm' + suf;
  else q = suf;
  const iv: Record<string, number[]> = {
    '': [0, 4, 7],
    '7': [0, 4, 7, 10],
    maj7: [0, 4, 7, 11],
    '9': [0, 4, 7, 10, 2],
    m: [0, 3, 7],
    m7: [0, 3, 7, 10],
    m9: [0, 3, 7, 10, 2],
    dim: [0, 3, 6],
    m7b5: [0, 3, 6, 10],
  };
  const ints = iv[q] ?? [0, 4, 7];
  return { sym: FLAT_NAMES[root] + q, pcs: ints.map((i) => (root + i) % 12) };
}

// ─── Melody ─────────────────────────────────────────────────────────────────

interface Note {
  d: number;
  p: number | null;
}

class Writer {
  readonly scaleAbs: number[];

  constructor(
    private readonly r: Rng,
    readonly keyPc: number,
    readonly scale: number[],
    readonly lo: number,
    readonly hi: number,
    private readonly leap: number,
  ) {
    this.scaleAbs = [];
    for (let m = lo - 12; m <= hi + 12; m++) if (scale.includes((((m - keyPc) % 12) + 12) % 12)) this.scaleAbs.push(m);
  }

  /** Chord tones in range (chromatic chord tones too, e.g. the raised 7th in minor). */
  private chordTones(ch: ChordInfo): number[] {
    const out: number[] = [];
    for (let m = this.lo; m <= this.hi; m++) if (ch.pcs.includes(m % 12)) out.push(m);
    return out;
  }

  nearestChordTone(ch: ChordInfo, near: number): number {
    const ct = this.chordTones(ch);
    let best = ct[0] ?? near;
    for (const m of ct) if (Math.abs(m - near) < Math.abs(best - near)) best = m;
    return best;
  }

  private stepFrom(p: number, steps: number): number {
    let i = this.scaleAbs.indexOf(p);
    if (i < 0) {
      i = this.scaleAbs.findIndex((m) => m >= p);
      if (i < 0) i = this.scaleAbs.length - 1;
    }
    const j = Math.max(0, Math.min(this.scaleAbs.length - 1, i + steps));
    return Math.max(this.lo - 2, Math.min(this.hi + 2, this.scaleAbs[j]));
  }

  /** Write one bar of melody over a chord, continuing from prev. */
  bar(rhythm: number[], ch: ChordInfo, prev: number, meter: number, state: { dir: number }): { notes: Note[]; last: number } {
    const r = this.r;
    const notes: Note[] = [];
    let t = 0;
    let p = prev;
    for (const d of rhythm) {
      if (d < 0) {
        notes.push({ d: -d, p: null });
        t += -d;
        continue;
      }
      const strong = Math.abs(t - Math.round(t)) < 1e-6 && (meter === 3 ? t === 0 : t % 2 === 0);
      const onBeat = Math.abs(t - Math.round(t)) < 1e-6;
      if (p >= this.hi - 1) state.dir = -1;
      else if (p <= this.lo + 1) state.dir = 1;
      else if (r() < 0.22) state.dir = -state.dir;
      if (strong || (onBeat && r() < 0.55)) {
        const ct = this.chordTones(ch);
        if (r() < this.leap) {
          const far = ct.filter((m) => (m - p) * state.dir >= 5 && Math.abs(m - p) <= 9);
          p = far.length ? pick(r, far) : this.nearestChordTone(ch, p + state.dir * 3);
        } else {
          const near = ct.filter((m) => m !== p).sort((a, b) => Math.abs(a - (p + state.dir * 2)) - Math.abs(b - (p + state.dir * 2)));
          p = near.length ? (r() < 0.7 ? near[0] : near[Math.min(1, near.length - 1)]) : p;
        }
      } else {
        p = this.stepFrom(p, state.dir * (r() < 0.82 ? 1 : 2));
      }
      notes.push({ d, p });
      t += d;
    }
    return { notes, last: p };
  }

  /** Re-play a bar's contour from a new starting chord tone (a sequence). */
  sequence(src: Note[], ch: ChordInfo, near: number, meter: number): { notes: Note[]; last: number } {
    const firstP = src.find((n) => n.p !== null)?.p ?? near;
    let start = this.nearestChordTone(ch, near);
    if (start === firstP && this.r() < 0.5) start = this.nearestChordTone(ch, near + 3);
    const shift = this.scaleAbs.indexOf(start) - this.scaleAbs.indexOf(this.nearestScale(firstP));
    let t = 0;
    let last = near;
    const out: Note[] = src.map((n) => {
      const res: Note = { d: n.d, p: null };
      if (n.p !== null) {
        let p = this.stepFrom(this.nearestScale(n.p), shift);
        const onBeat = Math.abs(t - Math.round(t)) < 1e-6 && (meter === 3 ? t === 0 : t % 2 === 0);
        if (onBeat) p = this.nearestChordTone(ch, p);
        res.p = p;
        last = p;
      }
      t += n.d;
      return res;
    });
    return { notes: out, last };
  }

  private nearestScale(p: number): number {
    let best = this.scaleAbs[0];
    for (const m of this.scaleAbs) if (Math.abs(m - p) < Math.abs(best - p)) best = m;
    return best;
  }

  /** The cadence bar: a short approach, then a long note on the target. */
  cadence(cell: number[], ch: ChordInfo, prev: number, targetPc: number): Note[] {
    const notes: Note[] = [];
    const sounding = cell.filter((d) => d > 0).length;
    let p = prev;
    let k = 0;
    const target = (() => {
      const c = Array.from({ length: this.hi - this.lo + 1 }, (_, i) => this.lo + i).filter((m) => ((m % 12) + 12) % 12 === targetPc);
      let best = c[0] ?? prev;
      for (const m of c) if (Math.abs(m - prev) < Math.abs(best - prev)) best = m;
      return best;
    })();
    for (const d of cell) {
      if (d < 0) {
        notes.push({ d: -d, p: null });
        continue;
      }
      k++;
      if (k === sounding) p = target;
      else p = this.nearestChordTone(ch, p + (target > p ? 2 : -2));
      notes.push({ d, p });
    }
    return notes;
  }
}

const DUR_TOKENS: [number, string][] = [
  [4, 'w'],
  [3, 'h.'],
  [2, 'h'],
  [1.5, 'q.'],
  [1, 'q'],
  [0.75, 'e.'],
  [0.5, 'e'],
  [0.25, 's'],
  [0.125, 't'],
];

function durParts(d: number): string[] {
  const out: string[] = [];
  let left = d;
  for (const [v, s] of DUR_TOKENS) {
    while (left >= v - 1e-6) {
      out.push(s);
      left -= v;
    }
  }
  return out.length ? out : ['t'];
}

function renderBar(notes: Note[]): string {
  const toks: string[] = [];
  for (const n of notes) {
    const parts = durParts(n.d);
    if (n.p === null) for (const p of parts) toks.push('r' + p);
    else {
      toks.push(midiToName(n.p) + parts[0]);
      for (const p of parts.slice(1)) toks.push('-' + p);
    }
  }
  return toks.join(' ');
}

function harmonize(w: Writer, bars: Note[][], mode: 'third' | 'octave'): string {
  return bars
    .map((b) =>
      renderBar(
        b.map((n) => {
          if (n.p === null) return n;
          if (mode === 'octave') return { d: n.d, p: n.p - 12 };
          const i = w.scaleAbs.indexOf(n.p);
          return { d: n.d, p: i >= 2 ? w.scaleAbs[i - 2] : n.p - 4 };
        }),
      ),
    )
    .join(' | ');
}

// ─── The song ───────────────────────────────────────────────────────────────

function normStyle(s: string): ThemeStyle {
  const k = (s || '').toLowerCase().trim() as ThemeStyle;
  return (THEME_STYLES as readonly string[]).includes(k) ? k : THEME_STYLES[hashStr(k) % THEME_STYLES.length];
}

export function themeId(st: SeedTheme): string {
  const style = normStyle(st.style);
  const tempo = Math.round(Math.max(60, Math.min(200, Number.isFinite(st.tempo) && st.tempo > 0 ? st.tempo : 120)));
  const seed = Math.floor(Math.abs(Number.isFinite(st.seed) ? st.seed : 0)) >>> 0;
  return `gen:${style}:${tempo}:${seed}`;
}

export function generateTheme(st: SeedTheme): SongDef {
  const id = themeId(st);
  const [, styleName, tempoS, seedS] = id.split(':');
  const style = styleName as ThemeStyle;
  const S = STYLES[style];
  const tempo = Number(tempoS);
  const seed = Number(seedS);
  const r = mulberry32(seed ^ hashStr(style) ^ Math.imul(tempo, 2654435761));
  const meter = S.meter;
  const key = pick(r, S.keys);
  const keyPc = pcOf(key);
  const scale = SCALES[S.mode];
  const tonicMinor = S.mode !== 'major' && S.mode !== 'mixolydian';

  const cellA = pick(r, S.progA);
  const cellA2 = pick(r, S.progA);
  const cellB = pick(r, S.progB);
  const cellB2 = pick(r, S.progB);
  const I = tonicMinor ? 'i' : 'I';
  const V = S.mode === 'mixolydian' ? 'bVII' : 'V';
  const progA = [...cellA, ...cellA2.slice(0, 2), V, I];
  const progB = [...cellB, ...cellB2.slice(0, 3), 'V'];
  const chA = progA.map((n) => roman(n, keyPc));
  const chB = progB.map((n) => roman(n, keyPc));

  const c = S.leadCenter;
  const w = new Writer(r, keyPc, scale, c - 8, c + 10, S.leap);

  // A: motif, motif sequenced, climb, cadence home.
  const rh1 = pick(r, S.rhythms);
  const rh2 = pick(r, S.rhythms);
  const rh3 = pick(r, S.rhythms);
  const rh4 = pick(r, S.rhythms);
  const state = { dir: 1 };
  let p = w.nearestChordTone(chA[0], c - 2);
  const a: Note[][] = [];
  let res = w.bar(rh1, chA[0], p, meter, state);
  a.push(res.notes);
  res = w.bar(rh2, chA[1], res.last, meter, state);
  a.push(res.notes);
  res = w.sequence(a[0], chA[2], res.last, meter);
  a.push(res.notes);
  res = w.sequence(a[1], chA[3], res.last, meter);
  a.push(res.notes);
  state.dir = 1;
  res = w.bar(rh3, chA[4], res.last, meter, state);
  a.push(res.notes);
  res = w.bar(rh4, chA[5], res.last, meter, state);
  a.push(res.notes);
  res = w.bar(pick(r, S.rhythms), chA[6], res.last, meter, state);
  a.push(res.notes);
  a.push(w.cadence(pick(r, S.endings), chA[7], res.last, keyPc));

  // B: a new motif from higher up, ending on the dominant.
  const rb1 = pick(r, S.rhythms);
  const rb2 = pick(r, S.rhythms);
  const b: Note[][] = [];
  state.dir = -1;
  p = w.nearestChordTone(chB[0], c + 5);
  res = w.bar(rb1, chB[0], p, meter, state);
  b.push(res.notes);
  res = w.bar(rb2, chB[1], res.last, meter, state);
  b.push(res.notes);
  res = w.sequence(b[0], chB[2], res.last, meter);
  b.push(res.notes);
  res = w.sequence(b[1], chB[3], res.last, meter);
  b.push(res.notes);
  res = w.sequence(b[0], chB[4], res.last, meter);
  b.push(res.notes);
  res = w.bar(pick(r, S.rhythms), chB[5], res.last, meter, state);
  b.push(res.notes);
  res = w.bar(pick(r, S.rhythms), chB[6], res.last, meter, state);
  b.push(res.notes);
  b.push(w.cadence(pick(r, S.endings), chB[7], res.last, (keyPc + 7) % 12));

  const mel = (bars: Note[][]) => bars.map(renderBar).join(' | ');
  const chords = (cs: ChordInfo[]) => cs.map((x) => x.sym).join(' | ');
  const grid = S.grid ?? '';
  const beat = pick(r, S.drums);
  const beatBars = beat.split('|').length;
  const drums = `${grid}[${beat}|]*${Math.max(1, Math.floor(7 / beatBars))}${beatBars === 1 ? '' : ` ${beat.split('|')[0]}|`} ${S.fill}`;

  const tracks: Record<string, TrackDef> = {
    lead: { inst: S.lead, echo: 0.22 },
    bass: { inst: S.bass.inst },
    drums: { inst: 'kit', vol: 0.58 },
  };
  if (S.harm) tracks.harm = { inst: S.harm.inst, vol: 0.75, pan: -0.2 };
  if (S.comp) tracks.comp = { inst: S.comp.inst, vol: S.comp.vol ?? 0.85, center: S.comp.center, pan: S.comp.pan };
  if (S.arp) tracks.arp = { inst: S.arp.inst, vol: S.arp.vol ?? 0.85, center: S.arp.center, pan: S.arp.pan };
  if (S.pad) tracks.pad = { inst: S.pad, vol: 0.9 };
  if (S.perc) tracks.perc = { inst: 'kit', vol: 0.45 };

  const bassTpl = pick(r, S.bass.tpl);
  const compTpl = S.comp ? pick(r, S.comp.tpl) : undefined;
  const arpTpl = S.arp ? pick(r, S.arp.tpl) : undefined;
  const perc = S.perc ? pick(r, S.perc) : undefined;
  const common = (cs: ChordInfo[]): SectionDef => ({
    chords: chords(cs),
    bass: bassTpl,
    comp: compTpl,
    arp: arpTpl,
    pad: S.pad ? '@pad' : undefined,
    drums,
    perc: perc ? grid + perc : undefined,
  });

  const introChords = `${chA[0].sym} | ${roman(V, keyPc).sym}`;
  const rollBar = meter === 3 ? (grid ? 's.ssSS' : 's.s.s.ssSSSS') : 's.s.s.s.ssssSSSS';
  const crashBar = meter === 3 ? (grid ? 'c.....' : 'c...........') : 'c...............';
  const sections: Record<string, SectionDef> = {
    I: {
      chords: introChords,
      comp: S.comp ? (meter === 3 ? '@cq rh' : '@cq rq rh') : undefined,
      pad: S.pad ? '@pad' : undefined,
      arp: arpTpl,
      bass: meter === 3 ? '@1q rh' : '@1q rq rh',
      drums: `${grid}${crashBar}|${rollBar}`,
    },
    A: { ...common(chA), lead: mel(a) },
    A2: { ...common(chA), lead: mel(a), harm: S.harm ? harmonize(w, a, S.harm.mode) : undefined },
    B: { ...common(chB), lead: mel(b), harm: S.harm ? harmonize(w, b, S.harm.mode) : undefined },
  };

  return {
    id,
    title: `Entrance (${style}, ${tempo} bpm)`,
    bpm: tempo,
    meter,
    swing: S.swing,
    swing16: S.swing16,
    key,
    tracks,
    sections,
    intro: ['I'],
    form: ['A', 'A2', 'B', 'A2'],
    fx: S.fx,
  };
}
