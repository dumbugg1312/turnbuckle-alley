/**
 * Instrument presets: pure data, no WebAudio. Every song draws from this one
 * palette so the whole soundtrack sounds like the same little console.
 *
 * Waves: p12 / p25 / p50 are pulse waves (12.5 / 25 / 50% duty), ntri is the
 * slightly stepped console triangle, sine / tri / saw are the plain shapes.
 */

export type WaveName = 'p12' | 'p25' | 'p50' | 'ntri' | 'tri' | 'sine' | 'saw';

export interface Layer {
  wave: WaveName;
  /** Semitone offset from the played note (12 = octave up, 7 = fifth). */
  semi?: number;
  /** Detune in cents (for chorus-y beating). */
  detune?: number;
  /** Relative level of this layer. */
  gain?: number;
}

export interface InstrumentDef {
  kind: 'tone' | 'drums';
  layers: Layer[];
  /** Attack seconds. */
  a: number;
  /** Decay time (seconds to fall most of the way to sustain). */
  d: number;
  /** Sustain level 0..1 (0 = plucked, decays to silence). */
  s: number;
  /** Release seconds. */
  r: number;
  /** Peak level before track volume and velocity. */
  gain: number;
  /** Vibrato: rate is fixed by the engine's shared LFO; depth in cents, delay in seconds. */
  vib?: { depth: number; delay: number; slow?: boolean };
  /** Portamento seconds for notes marked with ~. */
  slide?: number;
  /** Cents below pitch the note scoops up from (brass). */
  scoop?: number;
  /** Per-note filter. env multiplies the cutoff at note start, settling over envTime. */
  filter?: { type: BiquadFilterType; f: number; q?: number; env?: number; envTime?: number };
  /** Fraction of the written length that sounds (default 0.92). */
  gate?: number;
  /** Default MIDI centre for chord-relative templates on tracks using this instrument. */
  center: number;
}

const tone = (o: Partial<InstrumentDef> & { layers: Layer[] }): InstrumentDef => ({
  kind: 'tone',
  a: 0.01,
  d: 0.3,
  s: 0.7,
  r: 0.08,
  gain: 0.2,
  center: 66,
  ...o,
});

export const INSTRUMENTS: Record<string, InstrumentDef> = {
  /** The main melody voice: a 25% pulse with delayed vibrato. */
  lead: tone({ layers: [{ wave: 'p25' }], a: 0.008, d: 0.35, s: 0.72, r: 0.09, gain: 0.2, vib: { depth: 11, delay: 0.2 }, slide: 0.06, center: 72 }),
  /** Hollow, flute-like square. */
  lead50: tone({ layers: [{ wave: 'p50' }], a: 0.02, d: 0.4, s: 0.75, r: 0.12, gain: 0.17, vib: { depth: 13, delay: 0.22 }, slide: 0.07, center: 72 }),
  /** Thin and nasal: harmonica, kazoo, accordion reed. */
  lead12: tone({ layers: [{ wave: 'p12' }], a: 0.012, d: 0.3, s: 0.7, r: 0.08, gain: 0.17, vib: { depth: 16, delay: 0.16 }, slide: 0.05, center: 72 }),
  /** Counter-melody square, sits behind the lead. */
  harm: tone({ layers: [{ wave: 'p50' }], a: 0.012, d: 0.3, s: 0.6, r: 0.08, gain: 0.12, vib: { depth: 8, delay: 0.25 }, center: 64 }),
  harm12: tone({ layers: [{ wave: 'p12' }], a: 0.01, d: 0.25, s: 0.55, r: 0.07, gain: 0.12, vib: { depth: 8, delay: 0.25 }, center: 66 }),
  /** Short arpeggio blips. */
  arp: tone({ layers: [{ wave: 'p12' }], a: 0.003, d: 0.09, s: 0.25, r: 0.04, gain: 0.085, gate: 0.6, center: 70 }),
  arp25: tone({ layers: [{ wave: 'p25' }], a: 0.003, d: 0.1, s: 0.2, r: 0.04, gain: 0.08, gate: 0.6, center: 70 }),
  /** Plucked string: banjo, guitar, mandolin. */
  pluck: tone({ layers: [{ wave: 'p25' }], a: 0.002, d: 0.22, s: 0, r: 0.05, gain: 0.18, center: 64 }),
  /** Mallet: marimba / xylophone. */
  marimba: tone({ layers: [{ wave: 'tri' }, { wave: 'sine', semi: 12, gain: 0.35 }], a: 0.002, d: 0.32, s: 0, r: 0.06, gain: 0.32, center: 72 }),
  /** Music box: sine with a bright overtone and a long ring. */
  musicbox: tone({ layers: [{ wave: 'sine' }, { wave: 'sine', semi: 24, gain: 0.18 }, { wave: 'tri', semi: 12, gain: 0.12 }], a: 0.002, d: 0.9, s: 0, r: 0.2, gain: 0.24, center: 79 }),
  /** Celesta-ish bell for sparkles. */
  bell: tone({ layers: [{ wave: 'sine' }, { wave: 'sine', semi: 19, gain: 0.25 }], a: 0.002, d: 0.6, s: 0, r: 0.15, gain: 0.18, center: 84 }),
  /** Console triangle bass. */
  bass: tone({ layers: [{ wave: 'ntri' }], a: 0.006, d: 0.3, s: 0.9, r: 0.05, gain: 0.42, center: 42 }),
  /** Bouncier bass that decays a bit (country, funk, bossa). */
  bassPluck: tone({ layers: [{ wave: 'ntri' }], a: 0.004, d: 0.28, s: 0.35, r: 0.05, gain: 0.46, center: 42 }),
  /** Big soft tuba for Earl. */
  tuba: tone({ layers: [{ wave: 'ntri' }, { wave: 'p50', semi: 12, gain: 0.08 }], a: 0.035, d: 0.4, s: 0.8, r: 0.1, gain: 0.44, scoop: 40, center: 41 }),
  /** Synth bass for disco and synthwave. */
  bassSynth: tone({ layers: [{ wave: 'p50', gain: 0.5 }, { wave: 'ntri', gain: 0.9 }], a: 0.004, d: 0.18, s: 0.5, r: 0.04, gain: 0.3, filter: { type: 'lowpass', f: 700, q: 2, env: 3, envTime: 0.12 }, center: 40 }),
  /** The soft sine pad that makes things cosy. */
  pad: tone({ layers: [{ wave: 'sine', detune: -6 }, { wave: 'sine', detune: 6 }, { wave: 'tri', gain: 0.25 }], a: 0.45, d: 1.2, s: 0.85, r: 0.9, gain: 0.075, center: 62 }),
  /** Brighter ensemble pad. */
  strings: tone({ layers: [{ wave: 'p50', detune: -7 }, { wave: 'p25', detune: 7, gain: 0.7 }], a: 0.28, d: 1, s: 0.85, r: 0.5, gain: 0.05, vib: { depth: 7, delay: 0.3, slow: true }, filter: { type: 'lowpass', f: 2200, q: 0.5 }, center: 64 }),
  /** Warm organ. */
  organ: tone({ layers: [{ wave: 'p50' }, { wave: 'sine', semi: 12, gain: 0.6 }, { wave: 'sine', semi: -12, gain: 0.5 }], a: 0.015, d: 0.4, s: 0.95, r: 0.12, gain: 0.055, filter: { type: 'lowpass', f: 2400, q: 0.4 }, center: 62 }),
  /** Brass stabs and trumpets: scoops into the note, filter opens. */
  brass: tone({ layers: [{ wave: 'p25' }, { wave: 'p50', detune: 9, gain: 0.6 }], a: 0.02, d: 0.25, s: 0.7, r: 0.09, gain: 0.11, scoop: 60, vib: { depth: 10, delay: 0.25 }, filter: { type: 'lowpass', f: 2600, q: 1, env: 0.35, envTime: 0.08 }, center: 67 }),
  /** Solo trumpet line. */
  trumpet: tone({ layers: [{ wave: 'p25' }, { wave: 'p12', detune: 6, gain: 0.4 }], a: 0.018, d: 0.3, s: 0.8, r: 0.08, gain: 0.17, scoop: 50, vib: { depth: 16, delay: 0.18 }, filter: { type: 'lowpass', f: 3200, q: 0.8, env: 0.4, envTime: 0.07 }, slide: 0.06, center: 74 }),
  /** Power chord: root plus fifth plus low octave, guitar-ish. */
  power: tone({ layers: [{ wave: 'p50' }, { wave: 'p25', semi: 7, gain: 0.8 }, { wave: 'p50', semi: -12, gain: 0.5 }], a: 0.004, d: 0.25, s: 0.6, r: 0.06, gain: 0.085, filter: { type: 'lowpass', f: 2000, q: 1.2, env: 1.8, envTime: 0.1 }, center: 52 }),
  /** Accordion: two reeds slightly apart. */
  accordion: tone({ layers: [{ wave: 'p12' }, { wave: 'p25', detune: 9, gain: 0.7 }], a: 0.035, d: 0.4, s: 0.88, r: 0.08, gain: 0.12, vib: { depth: 5, delay: 0.1, slow: true }, center: 70 }),
  /** Fiddle: triangle with a bowed attack and singing vibrato. */
  fiddle: tone({ layers: [{ wave: 'tri' }, { wave: 'p12', gain: 0.18 }], a: 0.06, d: 0.4, s: 0.85, r: 0.12, gain: 0.3, vib: { depth: 18, delay: 0.12 }, slide: 0.08, center: 70 }),
  /** Whistle / ocarina. */
  whistle: tone({ layers: [{ wave: 'sine' }, { wave: 'tri', gain: 0.3 }], a: 0.04, d: 0.4, s: 0.85, r: 0.12, gain: 0.26, vib: { depth: 14, delay: 0.18 }, slide: 0.08, center: 76 }),
  /** Theremin for spooky things. */
  theremin: tone({ layers: [{ wave: 'sine' }], a: 0.09, d: 0.5, s: 0.9, r: 0.2, gain: 0.26, vib: { depth: 26, delay: 0.05 }, slide: 0.14, center: 74 }),
  /** Honky-tonk piano on square waves: two detuned pulses. */
  keys: tone({ layers: [{ wave: 'p25' }, { wave: 'p25', detune: 14, gain: 0.8 }], a: 0.003, d: 0.45, s: 0.22, r: 0.08, gain: 0.12, center: 62 }),
  /** Harpsichord pluck. */
  harpsi: tone({ layers: [{ wave: 'p12' }, { wave: 'p25', semi: 12, gain: 0.3 }], a: 0.002, d: 0.35, s: 0.08, r: 0.06, gain: 0.14, center: 66 }),
  /** Electric piano: sine with a little bell. */
  epiano: tone({ layers: [{ wave: 'sine' }, { wave: 'tri', semi: 12, gain: 0.18 }, { wave: 'sine', semi: 24, gain: 0.06 }], a: 0.004, d: 0.9, s: 0.35, r: 0.25, gain: 0.13, center: 62 }),
  /** Wah guitar for Sweet Lou's funk. */
  wah: tone({ layers: [{ wave: 'p25' }], a: 0.004, d: 0.2, s: 0.5, r: 0.05, gain: 0.16, filter: { type: 'bandpass', f: 900, q: 3, env: 3, envTime: 0.14 }, center: 64 }),
  /** One soft triangle, for standing in the eye of the storm. */
  softtri: tone({ layers: [{ wave: 'tri' }, { wave: 'sine', semi: 12, gain: 0.12 }], a: 0.06, d: 0.6, s: 0.85, r: 0.25, gain: 0.3, vib: { depth: 7, delay: 0.3 }, slide: 0.08, center: 70 }),
  /** Steam calliope: hollow square plus a reedy octave and a wobbly vibrato. */
  calliope: tone({ layers: [{ wave: 'p50' }, { wave: 'p12', semi: 12, gain: 0.45 }], a: 0.012, d: 0.3, s: 0.8, r: 0.07, gain: 0.13, vib: { depth: 24, delay: 0.05 }, center: 72 }),
  /** Drum kit on the noise channel. */
  kit: { kind: 'drums', layers: [], a: 0, d: 0, s: 0, r: 0, gain: 1, center: 0 },
};

export function getInstrument(name: string): InstrumentDef | undefined {
  return INSTRUMENTS[name];
}
