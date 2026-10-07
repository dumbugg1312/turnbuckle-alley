/**
 * Turnbuckle Alley music notation: a pure parser and song compiler.
 * No WebAudio here, so it runs in tests.
 *
 * ── Note tracks ─────────────────────────────────────────────────────────────
 *   C5q D5e E5 F#5 Bb4h.  r q  -q  |
 *   pitch   [A-G][#|b]?[octave]?   octave is sticky (starts at 4)
 *   rest    r
 *   tie     -        extends the previous note (or rest) by its duration
 *   chord   (C4 E4 G4)q   several pitches at once
 *   duration w h q e s t  (whole..32nd), then . (dotted) or 3 (triplet).
 *            Sticky: omit it to reuse the previous duration (starts at q).
 *   modifiers after the duration:  ! accent   ? ghost   ~ slide in from the
 *            previous note   ' staccato   _ legato
 *   |        bar line. Every bar is checked to be exactly one bar long.
 *   [ ... ]*3   repeat a group;  C4e*4  repeat one token.
 *
 * ── Templates (track text starting with @) ──────────────────────────────────
 *   Chord-relative patterns rendered against the section's chords:
 *   1 root (slash bass if any)  3 third  5 fifth  7 seventh (or octave)
 *   6 sixth  9/2 ninth  4 fourth  8 octave  c the whole chord, voice-led
 *   A chromatic approach to the next chord's root
 *   ^ octave up, , octave down (e.g. 5, is the fifth below the root)
 *   Durations, rests, ties, modifiers and repeats work as in note tracks.
 *   The template loops for the length of the section.
 *   @pad holds each chord, voice-led, for exactly as long as it lasts.
 *
 * ── Chords ──────────────────────────────────────────────────────────────────
 *   'Dmaj7 | Bm7 | Em7 A7 | D'   bars split by |, chords in a bar share it
 *   evenly unless given beats (C:3 G:1). % repeats the previous bar, . holds
 *   the previous chord. Slash chords (G/B) and N.C. are supported.
 *
 * ── Drum tracks (instrument 'kit') ──────────────────────────────────────────
 *   'k.h.s.h.k.h.s.h.|k.h.s.h.kksstmmf'  16th-note steps by default; prefix
 *   /8 /12 /16 /24 to change the grid. Each bar must have the right number of
 *   steps. Uppercase = accent. . or - = rest. See DRUM_KINDS.
 *
 * ── Sections and form ───────────────────────────────────────────────────────
 *   A section holds chords plus one string per track. A track string of
 *   '=B' reuses that track's part from section B. Patterns shorter than the
 *   section loop to fill it. Form items may transpose: 'A^2' plays A a whole
 *   step up.
 */
import { INSTRUMENTS } from './instruments';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Ev {
  /** Start, in beats (quarter notes). */
  t: number;
  /** Length in beats. */
  d: number;
  /** MIDI pitches (empty for drums). */
  n: number[];
  /** Velocity 0..1. */
  v: number;
  /** Drum kind, for drum tracks. */
  k?: string;
  /** Slide in from the previous pitch. */
  slide?: boolean;
  /** Gate override. */
  gate?: number;
}

export interface TrackDef {
  inst: string;
  vol?: number;
  pan?: number;
  /** Echo send 0..1 (default from instrument family). */
  echo?: number;
  /** Intensity at which this layer fades in (default 0). */
  in?: number;
  /** Intensity at or above which this layer fades out (default never). */
  out?: number;
  /** MIDI centre for templates. */
  center?: number;
  /** Delay in beats (for a lazy, behind-the-beat part). */
  delay?: number;
  /** Semitones. */
  transpose?: number;
  gate?: number;
}

export interface SectionDef {
  chords?: string;
  bars?: number;
  meter?: number;
  swing?: number;
  [track: string]: string | number | undefined;
}

export interface SongFx {
  /** Lowpass the whole song (Hz): porch radio, lo-fi. */
  lowpass?: number;
  /** Tape wobble depth in cents. */
  wobble?: number;
  /** Tape hiss level. */
  hiss?: number;
  /** Vinyl crackle level. */
  crackle?: number;
  /** Soft rain level. */
  rain?: number;
  /** Crickets level. */
  crickets?: number;
  /** Wind level. */
  wind?: number;
  /** Morning birdsong level. */
  birds?: number;
  /** Fluorescent-light hum level. */
  hum?: number;
}

export interface SongDef {
  id: string;
  title: string;
  bpm: number;
  /** Beats (quarter notes) per bar: 4, or 3 for both 3/4 and 6/8. */
  meter?: number;
  /** Eighth-note swing 0..0.33 (0.33 = full triplet shuffle). */
  swing?: number;
  /** Sixteenth-note swing (lo-fi, hip-hop). */
  swing16?: number;
  /** Tonic, e.g. 'D' or 'Bb'. Required when minor is set. */
  key?: string;
  /** Shift every pitch from major to the parallel minor (3, 6 and 7 lowered). */
  minor?: boolean;
  /** Loop the form (default true). Stingers set false. */
  loop?: boolean;
  tracks: Record<string, TrackDef>;
  sections: Record<string, SectionDef>;
  /** Played once before the loop. */
  intro?: string[];
  form: string[];
  fx?: SongFx;
  /** Echo on the music: delay in beats, feedback, wet level. */
  echo?: { beats?: number; feedback?: number; wet?: number };
  /** Lowpass that opens with intensity: [Hz at 0, Hz at 1]. */
  intensityFilter?: [number, number];
}

export interface CompiledTrack {
  name: string;
  def: TrackDef;
  drums: boolean;
  intro: Ev[];
  loop: Ev[];
}

export interface CompiledSong {
  id: string;
  title: string;
  bpm: number;
  meter: number;
  introBeats: number;
  loopBeats: number;
  loop: boolean;
  tracks: CompiledTrack[];
  fx: SongFx;
  echo: { beats: number; feedback: number; wet: number };
  intensityFilter?: [number, number];
  /** Where each form item starts, in beats from the very beginning. */
  marks: { name: string; beat: number }[];
}

export class NotationError extends Error {}

// ─── Pitch helpers ───────────────────────────────────────────────────────────

const LETTER_PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function pcOf(name: string): number {
  const m = /^([A-G])([#b]?)$/.exec(name.trim());
  if (!m) throw new NotationError(`bad pitch class "${name}"`);
  return (LETTER_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12;
}

/** 'C4' -> 60. */
export function noteToMidi(name: string): number {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name.trim());
  if (!m) throw new NotationError(`bad note "${name}"`);
  return 12 * (Number(m[3]) + 1) + LETTER_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}

export function midiToName(m: number): string {
  return SHARP_NAMES[((m % 12) + 12) % 12] + (Math.floor(m / 12) - 1);
}

/** Transpose every explicit pitch (letter + octave) in a note string. Write octaves on every note you plan to transpose. */
export function transposeNotes(src: string, semis: number): string {
  if (!semis) return src;
  return src.replace(/([A-G])([#b]?)(\d)/g, (_m, l: string, a: string, o: string) => midiToName(noteToMidi(l + a + o) + semis));
}

/** Transpose the roots and slash basses of a chord string. */
export function transposeChords(src: string, semis: number): string {
  if (!semis) return src;
  return src.replace(/(^|[\s|/])([A-G])([#b]?)/g, (_m, pre: string, l: string, a: string) => pre + SHARP_NAMES[(pcOf(l + a) + semis + 120) % 12]);
}

export function midiToFreq(m: number): number {
  return 440 * Math.pow(2, (m - 69) / 12);
}

// ─── Durations and tokens ────────────────────────────────────────────────────

const DUR: Record<string, number> = { w: 4, h: 2, q: 1, e: 0.5, s: 0.25, t: 0.125 };

function durOf(letter: string, mod: string | undefined, prev: number): number {
  if (!letter) return prev;
  let d = DUR[letter];
  if (mod === '.') d *= 1.5;
  else if (mod === '3') d *= 2 / 3;
  return d;
}

const EPS = 1e-6;

/** Expand [ ... ]*n groups and token*n repeats; also glue (C4 E4 G4) chords into one token. */
export function expandRepeats(src: string): string[] {
  const glued = src.replace(/\(([^)]*)\)/g, (_m, inner: string) => '(' + inner.trim().split(/\s+/).join('+') + ')');
  const spaced = glued.replace(/\[/g, ' [ ').replace(/\](\*\d+)?/g, (_m, r?: string) => ` ]${r ?? ''} `);
  const tokens = spaced.split(/\s+/).filter(Boolean);
  const walk = (i: number, depth: number): [string[], number] => {
    const out: string[] = [];
    while (i < tokens.length) {
      const tk = tokens[i];
      if (tk === '[') {
        const [inner, j] = walk(i + 1, depth + 1);
        const close = tokens[j - 1] ?? ']';
        const n = close.length > 2 ? Number(close.slice(2)) : 1;
        for (let k = 0; k < n; k++) out.push(...inner);
        i = j;
        continue;
      }
      if (tk.startsWith(']')) {
        if (depth === 0) throw new NotationError('unmatched ]');
        return [out, i + 1];
      }
      const rep = /^(.+)\*(\d+)$/.exec(tk);
      if (rep) for (let k = 0; k < Number(rep[2]); k++) out.push(rep[1]);
      else out.push(tk);
      i++;
    }
    if (depth > 0) throw new NotationError('unclosed [');
    return [out, i];
  };
  return walk(0, 0)[0];
}

function applyMods(mods: string, ev: { v: number; gate?: number; slide?: boolean }): void {
  for (const ch of mods) {
    if (ch === '!') ev.v = 1;
    else if (ch === '?') ev.v = 0.5;
    else if (ch === "'") ev.gate = 0.5;
    else if (ch === '_') ev.gate = 1;
    else if (ch === '~') ev.slide = true;
  }
}

function checkBar(start: number, now: number, beatsPerBar: number, bar: number, where: string): void {
  const len = now - start;
  if (Math.abs(len - beatsPerBar) > EPS) {
    throw new NotationError(`${where}: bar ${bar} is ${+len.toFixed(4)} beats, expected ${beatsPerBar}`);
  }
}

// ─── Note tracks ─────────────────────────────────────────────────────────────

const NOTE_RE = /^(?:\(([^)]*)\)|([A-G])([#b]?)(\d)?|(r)|(-))([whqest]?)(\.|3)?([!?~'_]*)$/;

export function parseNotes(src: string, beatsPerBar: number, where = 'notes'): { events: Ev[]; beats: number } {
  const events: Ev[] = [];
  let t = 0;
  let dur = 1;
  let oct = 4;
  let barStart = 0;
  let bar = 1;
  let last: Ev | null = null;
  let lastWasRest = false;
  for (const tk of expandRepeats(src)) {
    if (tk === '|') {
      checkBar(barStart, t, beatsPerBar, bar, where);
      barStart = t;
      bar++;
      continue;
    }
    const m = NOTE_RE.exec(tk);
    if (!m) throw new NotationError(`${where}: can't read "${tk}" in bar ${bar}`);
    dur = durOf(m[7], m[8], dur);
    if (m[6]) {
      // tie
      if (last && !lastWasRest) last.d += dur;
      t += dur;
      continue;
    }
    if (m[5]) {
      t += dur;
      lastWasRest = true;
      continue;
    }
    let pitches: number[];
    if (m[1] !== undefined) {
      pitches = m[1].split('+').filter(Boolean).map((p) => {
        const pm = /^([A-G])([#b]?)(\d)?$/.exec(p);
        if (!pm) throw new NotationError(`${where}: bad chord note "${p}"`);
        if (pm[3]) oct = Number(pm[3]);
        return 12 * (oct + 1) + LETTER_PC[pm[1]] + (pm[2] === '#' ? 1 : pm[2] === 'b' ? -1 : 0);
      });
    } else {
      if (m[4]) oct = Number(m[4]);
      pitches = [12 * (oct + 1) + LETTER_PC[m[2]] + (m[3] === '#' ? 1 : m[3] === 'b' ? -1 : 0)];
    }
    const ev: Ev = { t, d: dur, n: pitches, v: 0.8 };
    applyMods(m[9], ev);
    events.push(ev);
    last = ev;
    lastWasRest = false;
    t += dur;
  }
  if (t - barStart > EPS) checkBar(barStart, t, beatsPerBar, bar, where);
  return { events, beats: t };
}

// ─── Chords ──────────────────────────────────────────────────────────────────

export interface Chord {
  sym: string;
  root: number;
  bass: number;
  /** Intervals above the root (may exceed 12 for 9ths etc.). */
  iv: number[];
  none?: boolean;
}

const QUALITIES: Record<string, number[]> = {
  '': [0, 4, 7],
  M: [0, 4, 7],
  maj: [0, 4, 7],
  m: [0, 3, 7],
  min: [0, 3, 7],
  '-': [0, 3, 7],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  M7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  '-7': [0, 3, 7, 10],
  mM7: [0, 3, 7, 11],
  '6': [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  '9': [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  M9: [0, 4, 7, 11, 14],
  m9: [0, 3, 7, 10, 14],
  add9: [0, 4, 7, 14],
  add2: [0, 2, 4, 7],
  madd9: [0, 3, 7, 14],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  sus: [0, 5, 7],
  '7sus4': [0, 5, 7, 10],
  '7sus': [0, 5, 7, 10],
  dim: [0, 3, 6],
  o: [0, 3, 6],
  dim7: [0, 3, 6, 9],
  o7: [0, 3, 6, 9],
  m7b5: [0, 3, 6, 10],
  aug: [0, 4, 8],
  '+': [0, 4, 8],
  '7#5': [0, 4, 8, 10],
  '7b9': [0, 4, 7, 10, 13],
  '7#9': [0, 4, 7, 10, 15],
  '5': [0, 7],
  '13': [0, 4, 7, 10, 14, 21],
  '69': [0, 4, 7, 9, 14],
  m11: [0, 3, 7, 10, 14, 17],
  'maj7#11': [0, 4, 7, 11, 18],
  m69: [0, 3, 7, 9, 14],
};

export function parseChord(sym: string): Chord {
  if (sym === 'N.C.' || sym === 'NC' || sym === 'x') return { sym, root: 0, bass: 0, iv: [], none: true };
  const m = /^([A-G])([#b]?)([^/]*)(?:\/([A-G])([#b]?))?$/.exec(sym);
  if (!m) throw new NotationError(`bad chord "${sym}"`);
  const iv = QUALITIES[m[3]];
  if (!iv) throw new NotationError(`unknown chord quality "${m[3]}" in "${sym}"`);
  const root = pcOf(m[1] + m[2]);
  const bass = m[4] ? pcOf(m[4] + (m[5] ?? '')) : root;
  return { sym, root, bass, iv };
}

export interface ChordSpan {
  t: number;
  d: number;
  chord: Chord;
}

export function parseChords(src: string, beatsPerBar: number, where = 'chords'): { spans: ChordSpan[]; beats: number } {
  const bars = src.split('|').map((b) => b.trim());
  if (bars.length && bars[bars.length - 1] === '') bars.pop();
  const spans: ChordSpan[] = [];
  let prevBar: string[] = [];
  let t = 0;
  bars.forEach((barSrc, bi) => {
    let toks = barSrc.split(/\s+/).filter(Boolean);
    if (toks.length === 1 && toks[0] === '%') toks = prevBar.length ? [...prevBar] : ['.'];
    if (!toks.length) throw new NotationError(`${where}: empty bar ${bi + 1}`);
    prevBar = toks;
    const explicit = toks.map((tk) => {
      const m = /^(.+):(\d+(?:\.\d+)?)$/.exec(tk);
      return m ? { sym: m[1], beats: Number(m[2]) } : { sym: tk, beats: NaN };
    });
    const fixed = explicit.filter((e) => !isNaN(e.beats)).reduce((s, e) => s + e.beats, 0);
    const free = explicit.filter((e) => isNaN(e.beats)).length;
    const share = free ? (beatsPerBar - fixed) / free : 0;
    let used = 0;
    for (const e of explicit) {
      const d = isNaN(e.beats) ? share : e.beats;
      used += d;
      if (e.sym === '.' || e.sym === '%') {
        if (!spans.length) throw new NotationError(`${where}: nothing to hold in bar ${bi + 1}`);
        spans[spans.length - 1].d += d;
      } else {
        spans.push({ t, d, chord: parseChord(e.sym) });
      }
      t += d;
    }
    if (Math.abs(used - beatsPerBar) > EPS) throw new NotationError(`${where}: bar ${bi + 1} has ${used} beats of chords, expected ${beatsPerBar}`);
  });
  return { spans, beats: t };
}

function chordAt(spans: ChordSpan[], t: number): Chord {
  for (let i = spans.length - 1; i >= 0; i--) if (t + EPS >= spans[i].t) return spans[i].chord;
  return spans[0].chord;
}

/** Place a pitch class in the octave nearest to centre. */
export function place(pc: number, center: number): number {
  const base = center - (((center % 12) - pc + 12) % 12);
  return center - base > 6 ? base + 12 : base;
}

function degreeInterval(ch: Chord, deg: string): number {
  const has = (x: number) => ch.iv.includes(x);
  switch (deg) {
    case '3':
      return has(4) ? 4 : has(3) ? 3 : has(5) ? 5 : has(2) ? 2 : 4;
    case '5':
      return has(7) ? 7 : has(6) ? 6 : has(8) ? 8 : 7;
    case '7':
      return has(10) ? 10 : has(11) ? 11 : ch.iv.length === 4 && has(9) && has(6) ? 9 : 12;
    case '6':
      return 9;
    case '9':
    case '2':
      return has(13) ? 13 : has(15) ? 15 : has(14) ? 14 : 14;
    case '4':
      return 5;
    case '8':
      return 12;
    default:
      return 0;
  }
}

/** Voice a chord near centre, moving as little as possible from prev. */
export function voiceChord(ch: Chord, center: number, prev: number[] | null): number[] {
  if (ch.none) return [];
  let pcs = ch.iv.map((i) => (ch.root + i) % 12);
  pcs = pcs.filter((p, i) => pcs.indexOf(p) === i);
  if (pcs.length > 4) pcs = pcs.filter((_p, i) => i !== 2); // drop the fifth from big chords
  if (pcs.length > 4) pcs = pcs.slice(0, 4);
  let best: number[] = [];
  let bestScore = Infinity;
  for (let r = 0; r < pcs.length; r++) {
    const rot = [...pcs.slice(r), ...pcs.slice(0, r)];
    const v: number[] = [];
    let p = place(rot[0], center - 4);
    v.push(p);
    for (let i = 1; i < rot.length; i++) {
      let q = p + ((rot[i] - p + 120) % 12);
      if (q === p) q += 12;
      v.push(q);
      p = q;
    }
    let score: number;
    if (prev && prev.length) {
      score = 0;
      for (const n of v) score += Math.min(...prev.map((x) => Math.abs(x - n)));
      score += Math.abs(v.reduce((s, x) => s + x, 0) / v.length - center) * 0.35;
    } else score = Math.abs(v.reduce((s, x) => s + x, 0) / v.length - center);
    if (score < bestScore) {
      bestScore = score;
      best = v;
    }
  }
  return best;
}

// ─── Templates ───────────────────────────────────────────────────────────────

const TPL_RE = /^(?:([1-9]|c|A)([\^,]*)|(r)|(-))([whqest]?)(\.|3)?([!?~'_]*)$/;

interface TplTok {
  t: number;
  d: number;
  deg: string | null;
  oct: number;
  v: number;
  gate?: number;
  slide?: boolean;
}

export function parseTemplate(src: string, where = 'template'): { toks: TplTok[]; beats: number } {
  const toks: TplTok[] = [];
  let t = 0;
  let dur = 1;
  let last: TplTok | null = null;
  for (const tk of expandRepeats(src)) {
    if (tk === '|') continue;
    const m = TPL_RE.exec(tk);
    if (!m) throw new NotationError(`${where}: can't read template token "${tk}"`);
    dur = durOf(m[5], m[6], dur);
    if (m[4]) {
      if (last) last.d += dur;
      t += dur;
      continue;
    }
    if (m[3]) {
      last = null;
      t += dur;
      continue;
    }
    let oct = 0;
    for (const ch of m[2]) oct += ch === '^' ? 12 : -12;
    const tok: TplTok = { t, d: dur, deg: m[1], oct, v: 0.8 };
    applyMods(m[7], tok);
    toks.push(tok);
    last = tok;
    t += dur;
  }
  if (t <= EPS) throw new NotationError(`${where}: empty template`);
  return { toks, beats: t };
}

function renderTemplate(src: string, spans: ChordSpan[], sectionBeats: number, center: number, where: string): Ev[] {
  const out: Ev[] = [];
  if (src.trim() === 'pad') {
    let prev: number[] | null = null;
    for (const s of spans) {
      if (s.chord.none) continue;
      const v = voiceChord(s.chord, center, prev);
      prev = v;
      out.push({ t: s.t, d: s.d, n: v, v: 0.8 });
    }
    return out;
  }
  const { toks, beats } = parseTemplate(src, where);
  let prevVoicing: number[] | null = null;
  for (let base = 0; base < sectionBeats - EPS; base += beats) {
    for (const tk of toks) {
      const t = base + tk.t;
      if (t >= sectionBeats - EPS) break;
      const d = Math.min(tk.d, sectionBeats - t);
      const ch = chordAt(spans, t);
      if (ch.none) continue;
      let n: number[];
      if (tk.deg === 'c') {
        n = voiceChord(ch, center + tk.oct, prevVoicing);
        prevVoicing = n;
      } else if (tk.deg === 'A') {
        const next = chordAt(spans, t + d >= sectionBeats - EPS ? 0 : t + d);
        n = [place(next.bass, center) - 1 + tk.oct];
      } else if (tk.deg === '1') {
        n = [place(ch.bass, center) + tk.oct];
      } else {
        const r = place(ch.root, center);
        n = [r + degreeInterval(ch, tk.deg ?? '1') + tk.oct];
      }
      // Keep generated parts where small speakers can still hear them.
      n = n.map((p) => (p < 33 ? p + 12 : p > 96 ? p - 12 : p));
      const ev: Ev = { t, d, n, v: tk.v };
      if (tk.gate !== undefined) ev.gate = tk.gate;
      if (tk.slide) ev.slide = true;
      out.push(ev);
    }
  }
  return out;
}

// ─── Drums ───────────────────────────────────────────────────────────────────

/** Drum kinds for kit tracks. */
export const DRUM_KINDS: Record<string, string> = {
  k: 'kick',
  s: 'snare',
  h: 'closed hat',
  o: 'open hat',
  c: 'crash',
  t: 'low tom',
  m: 'mid tom',
  f: 'high tom',
  p: 'clap',
  x: 'rim click',
  z: 'shaker',
  b: 'cowbell',
  g: 'guiro',
  j: 'tambourine',
  n: 'thunder',
  w: 'power-tool whine',
  y: 'car horn',
  l: 'laser zap',
  d: 'heartbeat',
  u: 'stomp',
};

export function parseDrums(src: string, beatsPerBar: number, where = 'drums'): { events: Ev[]; beats: number } {
  let body = expandRepeats(src).join(' ');
  let perBeat = 4;
  const res = /^\s*\/(\d+)\s*/.exec(body);
  if (res) {
    perBeat = Number(res[1]) / 4;
    body = body.slice(res[0].length);
  }
  const stepsPerBar = Math.round(beatsPerBar * perBeat);
  const step = 1 / perBeat;
  const bars = body.replace(/\s+/g, '').split('|');
  if (bars.length > 1 && bars[bars.length - 1] === '') bars.pop();
  const events: Ev[] = [];
  let t = 0;
  bars.forEach((b, bi) => {
    if (b.length !== stepsPerBar) throw new NotationError(`${where}: bar ${bi + 1} has ${b.length} steps, expected ${stepsPerBar}`);
    for (let i = 0; i < b.length; i++) {
      const ch = b[i];
      if (ch === '.' || ch === '-') continue;
      const k = ch.toLowerCase();
      if (!DRUM_KINDS[k]) throw new NotationError(`${where}: unknown drum "${ch}" in bar ${bi + 1}`);
      events.push({ t: t + i * step, d: step, n: [], v: ch === k ? 0.72 : 1, k });
    }
    t += beatsPerBar;
  });
  return { events, beats: t };
}

// ─── Swing ───────────────────────────────────────────────────────────────────

/** Piecewise-linear time warp that delays off-beats. */
function warp(x: number, swing: number, swing16: number): number {
  let y = x;
  if (swing) {
    const b = Math.floor(y + EPS);
    const f = y - b;
    y = b + (f <= 0.5 ? f * (1 + swing) : 0.5 * (1 + swing) + (f - 0.5) * (1 - swing));
  }
  if (swing16) {
    const b = Math.floor(y * 2 + EPS) / 2;
    const f = (y - b) * 2;
    y = b + (f <= 0.5 ? f * (1 + swing16) : 0.5 * (1 + swing16) + (f - 0.5) * (1 - swing16)) / 2;
  }
  return y;
}

// ─── Compile ─────────────────────────────────────────────────────────────────

function tile(events: Ev[], len: number, total: number): Ev[] {
  if (len <= EPS) return [];
  if (len > total + EPS) throw new NotationError(`pattern is ${len} beats but the section is ${total}`);
  const out: Ev[] = [];
  for (let base = 0; base < total - EPS; base += len) {
    for (const e of events) {
      const t = base + e.t;
      if (t >= total - EPS) break;
      out.push({ ...e, t, d: Math.min(e.d, total - t), n: e.n.slice() });
    }
  }
  return out;
}

interface CompiledSection {
  beats: number;
  tracks: Map<string, Ev[]>;
}

function resolveContent(song: SongDef, secName: string, track: string): string | undefined {
  let name = secName;
  for (let hop = 0; hop < 8; hop++) {
    const sec = song.sections[name];
    if (!sec) throw new NotationError(`${song.id}: unknown section "${name}"`);
    const c = sec[track];
    if (typeof c !== 'string') return undefined;
    if (c.startsWith('=')) {
      name = c.slice(1).trim();
      continue;
    }
    return c.trim() || undefined;
  }
  throw new NotationError(`${song.id}: reference loop in ${secName}.${track}`);
}

function compileSection(song: SongDef, secName: string): CompiledSection {
  const sec = song.sections[secName];
  if (!sec) throw new NotationError(`${song.id}: unknown section "${secName}"`);
  const meter = sec.meter ?? song.meter ?? 4;
  const where = (t: string) => `${song.id}.${secName}.${t}`;
  const chords = sec.chords ? parseChords(sec.chords, meter, where('chords')) : null;
  const parsed: { name: string; def: TrackDef; kind: 'notes' | 'drums' | 'tpl'; src: string; events?: Ev[]; beats?: number }[] = [];
  for (const [name, def] of Object.entries(song.tracks)) {
    const inst = INSTRUMENTS[def.inst];
    if (!inst) throw new NotationError(`${song.id}: track ${name} uses unknown instrument "${def.inst}"`);
    const src = resolveContent(song, secName, name);
    if (!src) continue;
    if (inst.kind === 'drums') {
      const r = parseDrums(src, meter, where(name));
      parsed.push({ name, def, kind: 'drums', src, ...r });
    } else if (src.startsWith('@')) {
      if (!chords) throw new NotationError(`${where(name)}: template needs chords in the section`);
      parsed.push({ name, def, kind: 'tpl', src: src.slice(1) });
    } else {
      const r = parseNotes(src, meter, where(name));
      parsed.push({ name, def, kind: 'notes', src, ...r });
    }
  }
  let beats = sec.bars ? sec.bars * meter : chords ? chords.beats : 0;
  if (!beats) for (const p of parsed) beats = Math.max(beats, p.beats ?? 0);
  if (!beats) throw new NotationError(`${song.id}.${secName}: section has no length`);
  if (chords && Math.abs(chords.beats - beats) > EPS && !sec.bars) throw new NotationError(`${song.id}.${secName}: chords length mismatch`);
  const swing = sec.swing ?? song.swing ?? 0;
  const swing16 = song.swing16 ?? 0;
  const tracks = new Map<string, Ev[]>();
  for (const p of parsed) {
    let evs: Ev[];
    if (p.kind === 'tpl') {
      const center = p.def.center ?? INSTRUMENTS[p.def.inst].center;
      evs = renderTemplate(p.src, chords!.spans, beats, center, where(p.name));
    } else {
      try {
        evs = tile(p.events!, p.beats!, beats);
      } catch (e) {
        throw new NotationError(`${where(p.name)}: ${(e as Error).message}`);
      }
    }
    if (swing || swing16) {
      for (const e of evs) {
        const s = warp(e.t, swing, swing16);
        const end = warp(e.t + e.d, swing, swing16);
        e.t = s;
        e.d = Math.max(0.01, end - s);
      }
    }
    tracks.set(p.name, evs);
  }
  return { beats, tracks };
}

function modeMapper(song: SongDef): ((m: number) => number) | null {
  if (!song.minor) return null;
  if (!song.key) throw new NotationError(`${song.id}: minor needs a key`);
  const tonic = pcOf(song.key);
  return (m: number) => {
    const rel = (((m - tonic) % 12) + 12) % 12;
    return rel === 4 || rel === 9 || rel === 11 ? m - 1 : m;
  };
}

export function parseFormItem(item: string): { name: string; transpose: number } {
  const m = /^([A-Za-z0-9_-]+?)(?:\^(-?\d+))?$/.exec(item);
  if (!m) throw new NotationError(`bad form item "${item}"`);
  return { name: m[1], transpose: m[2] ? Number(m[2]) : 0 };
}

export function compileSong(song: SongDef): CompiledSong {
  const cache = new Map<string, CompiledSection>();
  const get = (n: string) => {
    let c = cache.get(n);
    if (!c) {
      c = compileSection(song, n);
      cache.set(n, c);
    }
    return c;
  };
  const mapMode = modeMapper(song);
  const trackNames = Object.keys(song.tracks);
  const build = (items: string[], startBeat: number, marks: { name: string; beat: number }[]) => {
    const out = new Map<string, Ev[]>(trackNames.map((n) => [n, []]));
    let t = 0;
    for (const item of items) {
      const { name, transpose } = parseFormItem(item);
      const sec = get(name);
      marks.push({ name: item, beat: startBeat + t });
      for (const [tn, evs] of sec.tracks) {
        const def = song.tracks[tn];
        const drums = INSTRUMENTS[def.inst].kind === 'drums';
        const tr = transpose + (def.transpose ?? 0);
        const delay = def.delay ?? 0;
        const list = out.get(tn)!;
        for (const e of evs) {
          const n = drums ? e.n : e.n.map((p) => (mapMode ? mapMode(p) : p) + tr);
          list.push({ ...e, t: e.t + t + delay, n });
        }
      }
      t += sec.beats;
    }
    return { beats: t, tracks: out };
  };
  const marks: { name: string; beat: number }[] = [];
  const intro = build(song.intro ?? [], 0, marks);
  const body = build(song.form, intro.beats, marks);
  const tracks: CompiledTrack[] = trackNames.map((name) => ({
    name,
    def: song.tracks[name],
    drums: INSTRUMENTS[song.tracks[name].inst].kind === 'drums',
    intro: intro.tracks.get(name)!.sort((a, b) => a.t - b.t),
    loop: body.tracks.get(name)!.sort((a, b) => a.t - b.t),
  }));
  const loop = song.loop !== false;
  return {
    id: song.id,
    title: song.title,
    bpm: song.bpm,
    meter: song.meter ?? 4,
    introBeats: loop ? intro.beats : intro.beats + body.beats,
    loopBeats: loop ? body.beats : 0,
    loop,
    tracks: loop
      ? tracks
      : tracks.map((tr) => ({ ...tr, intro: [...tr.intro, ...tr.loop.map((e) => ({ ...e, t: e.t + intro.beats }))], loop: [] })),
    fx: song.fx ?? {},
    echo: { beats: song.echo?.beats ?? 0.75, feedback: song.echo?.feedback ?? 0.32, wet: song.echo?.wet ?? 0.3 },
    intensityFilter: song.intensityFilter,
    marks,
  };
}

/** Length of a compiled song's loop (or whole length if it doesn't loop), in seconds. */
export function songSeconds(c: CompiledSong): number {
  return ((c.loop ? c.introBeats + c.loopBeats : c.introBeats) * 60) / c.bpm;
}
