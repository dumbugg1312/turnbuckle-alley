/**
 * Sound effects, all synthesized. Each entry is a tiny recipe built from
 * tones and noise bursts. Unknown ids are ignored silently.
 */
import type { Engine } from './engine';
import type { NoiseOpts, ToneOpts } from './voices';

interface Kit {
  /** Tone at an offset (seconds) from the sfx start; f, f2 scaled by pitch, vol by volume. */
  tone(at: number, o: Omit<ToneOpts, 't' | 'dest'>): void;
  noise(at: number, o: Omit<NoiseOpts, 't' | 'dest'>): void;
  /** A struck metal object: inharmonic sine partials. */
  metal(at: number, f: number, ratios: number[], vols: number[], tc: number): void;
}

type Recipe = (k: Kit) => void;

const NOTE = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export const SFX: Record<string, Recipe> = {
  // ─── UI ───────────────────────────────────────────────────────────────────
  'blip-advance': (k) => {
    k.tone(0, { wave: 'p25', f: 1320, dur: 0.05, vol: 0.06, tc: 0.012 });
    k.tone(0.03, { wave: 'p25', f: 1760, dur: 0.05, vol: 0.045, tc: 0.014 });
  },
  select: (k) => k.tone(0, { wave: 'p12', f: 1100, dur: 0.035, vol: 0.07, tc: 0.01 }),
  confirm: (k) => {
    k.tone(0, { wave: 'p25', f: 660, dur: 0.07, vol: 0.09, tc: 0.02 });
    k.tone(0.065, { wave: 'p25', f: 990, dur: 0.14, vol: 0.09, tc: 0.04 });
  },
  cancel: (k) => {
    k.tone(0, { wave: 'p25', f: 620, dur: 0.07, vol: 0.08, tc: 0.02 });
    k.tone(0.06, { wave: 'p25', f: 415, dur: 0.12, vol: 0.08, tc: 0.035 });
  },
  error: (k) => {
    k.tone(0, { wave: 'p50', f: 196, dur: 0.09, vol: 0.08, hold: 0.04, tc: 0.02 });
    k.tone(0.12, { wave: 'p50', f: 185, dur: 0.16, vol: 0.08, hold: 0.06, tc: 0.03 });
  },
  open: (k) => {
    k.tone(0, { wave: 'tri', f: 523, f2: 784, dur: 0.1, vol: 0.12, tc: 0.03 });
    k.tone(0.05, { wave: 'p12', f: 1046, dur: 0.08, vol: 0.03, tc: 0.02 });
  },
  close: (k) => k.tone(0, { wave: 'tri', f: 784, f2: 523, dur: 0.1, vol: 0.12, tc: 0.03 }),
  tick: (k) => k.noise(0, { buf: 'metal', dur: 0.02, vol: 0.06, type: 'highpass', f: 3000, tc: 0.005 }),
  pop: (k) => k.tone(0, { wave: 'sine', f: 400, f2: 1200, sweep: 0.05, dur: 0.08, vol: 0.14, tc: 0.02 }),

  // ─── World ────────────────────────────────────────────────────────────────
  step: (k) => {
    k.noise(0, { buf: 'chip', dur: 0.05, vol: 0.11, type: 'lowpass', f: 420 + Math.random() * 120, tc: 0.012 });
    k.tone(0, { wave: 'tri', f: 95 + Math.random() * 15, f2: 60, dur: 0.05, vol: 0.08, tc: 0.015 });
  },
  // Surface footsteps (world/stepfx.ts stepSound picks one from the terrain).
  // Grass: a soft brush of blades over a muffled heel.
  'step-grass': (k) => {
    k.noise(0, { buf: 'white', dur: 0.09, vol: 0.07, a: 0.012, type: 'bandpass', f: 2400 + Math.random() * 900, q: 0.8, tc: 0.025 });
    k.noise(0.01, { buf: 'chip', dur: 0.05, vol: 0.06, type: 'lowpass', f: 300, tc: 0.014 });
  },
  // Packed dirt and paths: a dull scuff with a few grains.
  'step-dirt': (k) => {
    k.noise(0, { buf: 'chip', dur: 0.06, vol: 0.1, type: 'lowpass', f: 650 + Math.random() * 150, tc: 0.016 });
    k.noise(0.008, { buf: 'white', dur: 0.05, vol: 0.035, type: 'bandpass', f: 1800, q: 1.2, tc: 0.012 });
    k.tone(0, { wave: 'tri', f: 85 + Math.random() * 10, f2: 55, dur: 0.05, vol: 0.06, tc: 0.014 });
  },
  // Gravel: a crunch made of tiny stones shifting.
  'step-gravel': (k) => {
    for (let i = 0; i < 4; i++) {
      const at = i * 0.011 + Math.random() * 0.006;
      k.noise(at, { buf: 'chip', dur: 0.025, vol: 0.06 - i * 0.008, type: 'bandpass', f: 1500 + Math.random() * 1600, q: 2, tc: 0.007 });
    }
    k.noise(0, { buf: 'chip', dur: 0.05, vol: 0.07, type: 'lowpass', f: 500, tc: 0.014 });
  },
  // Sidewalk, brick, road: a crisp heel tap.
  'step-stone': (k) => {
    k.noise(0, { buf: 'chip', dur: 0.03, vol: 0.08, type: 'highpass', f: 1400 + Math.random() * 400, tc: 0.007 });
    k.tone(0, { wave: 'tri', f: 150 + Math.random() * 20, f2: 95, dur: 0.04, vol: 0.075, tc: 0.011 });
    k.noise(0.004, { buf: 'chip', dur: 0.04, vol: 0.06, type: 'lowpass', f: 700, tc: 0.01 });
  },
  // Floorboards and the bridge: a hollow knock with a little ring.
  'step-wood': (k) => {
    const f = 190 + Math.random() * 30;
    k.tone(0, { wave: 'tri', f, f2: f * 0.7, dur: 0.08, vol: 0.1, tc: 0.022 });
    k.tone(0, { wave: 'sine', f: f * 2.6, dur: 0.06, vol: 0.022, tc: 0.016 });
    k.noise(0, { buf: 'chip', dur: 0.04, vol: 0.06, type: 'lowpass', f: 900, tc: 0.01 });
  },
  // Carpet, mats, rubber: barely there.
  'step-carpet': (k) => {
    k.noise(0, { buf: 'white', dur: 0.06, vol: 0.05, a: 0.01, type: 'lowpass', f: 380, tc: 0.018 });
    k.tone(0, { wave: 'sine', f: 75, f2: 55, dur: 0.05, vol: 0.05, tc: 0.016 });
  },
  // Lino and checkerboard tile: a bright little click.
  'step-tile': (k) => {
    k.noise(0, { buf: 'metal', dur: 0.02, vol: 0.05, type: 'highpass', f: 3200, tc: 0.005 });
    k.tone(0, { wave: 'tri', f: 210 + Math.random() * 30, f2: 140, dur: 0.035, vol: 0.07, tc: 0.009 });
  },
  // Fresh snow: a soft squeaky crunch.
  'step-snow': (k) => {
    k.noise(0, { buf: 'white', dur: 0.11, vol: 0.075, a: 0.02, type: 'bandpass', f: 900, f2: 1500, q: 1.6, tc: 0.03 });
    for (let i = 0; i < 3; i++) k.noise(0.02 + i * 0.018, { buf: 'chip', dur: 0.02, vol: 0.03, type: 'bandpass', f: 2600 + Math.random() * 800, q: 3, tc: 0.006 });
  },
  // Shallows, mud and puddles: a little slosh.
  'step-water': (k) => {
    k.noise(0, { buf: 'white', dur: 0.12, vol: 0.08, a: 0.008, type: 'lowpass', f: 2600, f2: 700, tc: 0.03 });
    const f = 900 + Math.random() * 500;
    k.tone(0.03, { wave: 'sine', f, f2: f * 1.5, dur: 0.04, vol: 0.03, tc: 0.01 });
  },
  // Leaves brushed aside.
  rustle: (k) => {
    k.noise(0, { buf: 'white', dur: 0.16, vol: 0.06, a: 0.03, type: 'bandpass', f: 3200, f2: 2200, q: 0.9, tc: 0.04 });
    k.noise(0.05, { buf: 'white', dur: 0.12, vol: 0.04, a: 0.02, type: 'bandpass', f: 4200, q: 1.2, tc: 0.03 });
    k.noise(0.02, { buf: 'chip', dur: 0.06, vol: 0.025, type: 'highpass', f: 2500, tc: 0.012 });
  },
  // Wings: a sparrow's soft flutter as it takes off.
  flutter: (k) => {
    for (let i = 0; i < 5; i++) {
      const at = i * 0.042 + Math.random() * 0.01;
      k.noise(at, { buf: 'white', dur: 0.035, vol: 0.05 * (1 - i * 0.13), a: 0.006, type: 'bandpass', f: 1300 + Math.random() * 500, q: 1.1, tc: 0.01 });
    }
  },
  // A cat's purr: a low, rolling motor.
  purr: (k) => {
    for (let i = 0; i < 9; i++) {
      const at = i * 0.075;
      const swell = Math.sin((i / 8) * Math.PI);
      k.noise(at, { buf: 'chip', dur: 0.06, vol: 0.05 + swell * 0.06, a: 0.015, type: 'lowpass', f: 240, tc: 0.02 });
      k.tone(at, { wave: 'sine', f: 52 + (i % 2) * 4, dur: 0.06, vol: 0.05 + swell * 0.05, a: 0.015, tc: 0.02 });
    }
  },
  // A fish breaking the surface.
  plip: (k) => {
    k.tone(0, { wave: 'sine', f: 700, f2: 1500, sweep: 0.05, dur: 0.07, vol: 0.06, tc: 0.02 });
    k.noise(0.01, { buf: 'white', dur: 0.12, vol: 0.05, type: 'lowpass', f: 2200, f2: 800, tc: 0.03 });
  },
  // Thunder: a crack, then a long low roll (the drum kit's thunder, stretched for the sky).
  thunder: (k) => {
    k.noise(0, { buf: 'chip', dur: 0.3, vol: 0.2, a: 0.01, type: 'lowpass', f: 1600, f2: 400, tc: 0.08 });
    k.noise(0.05, { buf: 'white', dur: 3.2, vol: 0.42, a: 0.12, type: 'lowpass', f: 520, f2: 90, tc: 0.75 });
    k.noise(0.4, { buf: 'white', dur: 2.4, vol: 0.2, a: 0.3, type: 'lowpass', f: 260, f2: 70, tc: 0.6 });
    k.tone(0.06, { wave: 'sine', f: 48, f2: 34, sweep: 1.5, dur: 2.2, vol: 0.18, a: 0.2, tc: 0.6 });
  },
  // Pulling a weed or lifting a stone: the give-way moment before it pops free.
  yank: (k) => {
    k.noise(0, { buf: 'white', dur: 0.12, vol: 0.08, a: 0.04, type: 'bandpass', f: 500, f2: 1400, q: 1.4, tc: 0.03 });
    k.tone(0.1, { wave: 'sine', f: 300, f2: 700, sweep: 0.05, dur: 0.06, vol: 0.06, tc: 0.016 });
  },
  door: (k) => {
    k.tone(0, { wave: 'p12', f: 290, f2: 380, curve: 'lin', dur: 0.3, vol: 0.022, a: 0.05, hold: 0.15, tc: 0.04, vib: 40 });
    k.noise(0.28, { buf: 'chip', dur: 0.12, vol: 0.22, type: 'lowpass', f: 320, tc: 0.03 });
    k.tone(0.28, { wave: 'tri', f: 82, f2: 52, dur: 0.14, vol: 0.2, tc: 0.04 });
  },
  pickup: (k) => {
    k.tone(0, { wave: 'p25', f: 520, f2: 1040, sweep: 0.07, dur: 0.09, vol: 0.07, tc: 0.025 });
    k.tone(0.08, { wave: 'p25', f: 1560, dur: 0.1, vol: 0.045, tc: 0.03 });
  },
  gift: (k) => {
    [784, 988, 1175].forEach((f, i) => {
      k.tone(i * 0.09, { wave: 'tri', f, dur: 0.6, vol: 0.11, tc: 0.15 });
      k.tone(i * 0.09, { wave: 'sine', f: f * 2, dur: 0.4, vol: 0.025, tc: 0.1 });
    });
  },
  heart: (k) => {
    k.tone(0, { wave: 'sine', f: 110, f2: 80, dur: 0.12, vol: 0.22, tc: 0.035 });
    k.tone(0.16, { wave: 'sine', f: 100, f2: 70, dur: 0.14, vol: 0.18, tc: 0.04 });
    k.tone(0.1, { wave: 'p12', f: 1319, dur: 0.35, vol: 0.035, tc: 0.08 });
    k.tone(0.2, { wave: 'p12', f: 1760, dur: 0.45, vol: 0.035, tc: 0.1 });
  },
  coin: (k) => {
    k.tone(0, { wave: 'p25', f: 988, dur: 0.08, vol: 0.08, hold: 0.05, tc: 0.01 });
    k.tone(0.07, { wave: 'p25', f: 1319, dur: 0.4, vol: 0.08, tc: 0.08 });
  },
  sleep: (k) => {
    [784, 659, 523].forEach((f, i) => k.tone(i * 0.3, { wave: 'sine', f, dur: 0.7, vol: 0.08, a: 0.02, tc: 0.2 }));
    k.noise(0, { buf: 'white', dur: 1.3, vol: 0.025, a: 0.35, hold: 0.3, type: 'lowpass', f: 900, tc: 0.25 });
  },
  rooster: (k) => {
    k.tone(0, { wave: 'p25', f: 600, f2: 880, dur: 0.13, vol: 0.07, hold: 0.08, tc: 0.02 });
    k.tone(0.15, { wave: 'p25', f: 820, dur: 0.1, vol: 0.07, hold: 0.06, tc: 0.02 });
    k.tone(0.27, { wave: 'p25', f: 880, f2: 1150, dur: 0.17, vol: 0.075, hold: 0.12, tc: 0.02 });
    k.tone(0.46, { wave: 'p25', f: 1100, f2: 720, sweep: 0.5, dur: 0.55, vol: 0.075, hold: 0.4, tc: 0.05, vib: 25 });
    k.tone(0.46, { wave: 'p12', f: 2200, f2: 1440, sweep: 0.5, dur: 0.55, vol: 0.02, hold: 0.4, tc: 0.05 });
  },
  splash: (k) => {
    k.noise(0, { buf: 'white', dur: 0.6, vol: 0.22, a: 0.01, type: 'lowpass', f: 3500, f2: 500, tc: 0.15 });
    for (let i = 0; i < 4; i++) {
      const f = 1100 + Math.random() * 700;
      k.tone(0.1 + Math.random() * 0.4, { wave: 'sine', f, f2: f * 1.6, dur: 0.05, vol: 0.05, tc: 0.012 });
    }
  },
  dig: (k) => {
    k.noise(0, { buf: 'chip', dur: 0.14, vol: 0.25, type: 'bandpass', f: 650, q: 1, tc: 0.04 });
    k.noise(0.02, { buf: 'metal', dur: 0.08, vol: 0.05, type: 'highpass', f: 3000, tc: 0.02 });
  },
  thud: (k) => {
    k.tone(0, { wave: 'sine', f: 95, f2: 42, dur: 0.26, vol: 0.42, tc: 0.07 });
    k.noise(0, { buf: 'chip', dur: 0.15, vol: 0.22, type: 'lowpass', f: 260, tc: 0.04 });
  },
  swing: (k) => k.noise(0, { buf: 'white', dur: 0.2, vol: 0.13, a: 0.05, type: 'bandpass', f: 900, f2: 3000, q: 1.3, tc: 0.04 }),
  equipment: (k) => {
    k.metal(0, 523, [1, 1.59, 2.43, 3.31], [0.07, 0.05, 0.035, 0.025], 0.12);
    k.noise(0, { buf: 'chip', dur: 0.1, vol: 0.18, type: 'lowpass', f: 600, tc: 0.03 });
  },
  chair: (k) => {
    k.metal(0, 810, [1, 1.52, 2.44, 3.33], [0.06, 0.05, 0.04, 0.03], 0.09);
    k.noise(0, { buf: 'metal', dur: 0.12, vol: 0.14, type: 'bandpass', f: 2200, q: 2, tc: 0.03 });
    k.noise(0, { buf: 'chip', dur: 0.08, vol: 0.14, type: 'lowpass', f: 420, tc: 0.025 });
    k.metal(0.09, 858, [1, 1.52, 2.44], [0.04, 0.03, 0.025], 0.07);
    k.noise(0.09, { buf: 'metal', dur: 0.08, vol: 0.08, type: 'bandpass', f: 2600, q: 2, tc: 0.02 });
  },

  // ─── Tapes ────────────────────────────────────────────────────────────────
  'tape-in': (k) => {
    k.noise(0, { buf: 'chip', dur: 0.08, vol: 0.28, type: 'lowpass', f: 520, tc: 0.02 });
    k.tone(0.05, { wave: 'p12', f: 2200, dur: 0.02, vol: 0.045, tc: 0.005 });
    k.tone(0.1, { wave: 'p50', f: 55, f2: 78, dur: 0.38, vol: 0.06, a: 0.05, hold: 0.2, tc: 0.05 });
    k.noise(0.1, { buf: 'white', dur: 0.32, vol: 0.02, a: 0.04, hold: 0.2, type: 'bandpass', f: 3000, tc: 0.04 });
  },
  static: (k) => {
    k.noise(0, { buf: 'metal', dur: 0.5, vol: 0.1, hold: 0.35, type: 'bandpass', f: 3500, q: 0.7, tc: 0.05 });
    k.noise(0, { buf: 'white', dur: 0.5, vol: 0.045, hold: 0.35, type: 'highpass', f: 2000, tc: 0.05 });
  },
  tracking: (k) => {
    k.tone(0, { wave: 'sine', f: 300, f2: 900, curve: 'lin', dur: 0.5, vol: 0.045, hold: 0.35, tc: 0.05, vib: 80 });
    k.noise(0, { buf: 'white', dur: 0.55, vol: 0.06, hold: 0.3, type: 'bandpass', f: 600, f2: 3000, q: 3, tc: 0.06 });
  },

  // ─── Match ────────────────────────────────────────────────────────────────
  hit: (k) => {
    k.noise(0, { buf: 'chip', dur: 0.09, vol: 0.3, type: 'bandpass', f: 1100, q: 0.9, tc: 0.025 });
    k.tone(0, { wave: 'tri', f: 160, f2: 60, dur: 0.12, vol: 0.32, tc: 0.035 });
    k.tone(0, { wave: 'sine', f: 90, f2: 40, dur: 0.1, vol: 0.32, tc: 0.03 });
  },
  slam: (k) => {
    k.tone(0, { wave: 'sine', f: 120, f2: 34, sweep: 0.3, dur: 0.42, vol: 0.55, tc: 0.12 });
    k.noise(0, { buf: 'chip', dur: 0.35, vol: 0.32, type: 'lowpass', f: 900, f2: 200, tc: 0.09 });
    k.noise(0.01, { buf: 'metal', dur: 0.25, vol: 0.045, type: 'highpass', f: 3000, tc: 0.08 });
    k.noise(0, { buf: 'white', dur: 0.12, vol: 0.18, type: 'bandpass', f: 450, q: 1, tc: 0.03 });
  },
  grab: (k) => {
    k.noise(0, { buf: 'white', dur: 0.035, vol: 0.11, type: 'bandpass', f: 2200, q: 1.2, tc: 0.01 });
    k.noise(0.05, { buf: 'white', dur: 0.035, vol: 0.09, type: 'bandpass', f: 1900, q: 1.2, tc: 0.01 });
    k.tone(0, { wave: 'tri', f: 220, f2: 180, dur: 0.05, vol: 0.06, tc: 0.015 });
  },
  whoosh: (k) => k.noise(0, { buf: 'white', dur: 0.32, vol: 0.15, a: 0.1, hold: 0.05, type: 'bandpass', f: 500, f2: 2400, q: 1.2, tc: 0.07 }),
  kickout: (k) => {
    k.tone(0, { wave: 'p25', f: 300, f2: 900, dur: 0.15, vol: 0.09, tc: 0.05 });
    k.noise(0, { buf: 'white', dur: 0.2, vol: 0.1, a: 0.03, type: 'bandpass', f: 800, f2: 3000, tc: 0.05 });
  },
  count: (k) => {
    k.noise(0, { buf: 'chip', dur: 0.07, vol: 0.36, type: 'bandpass', f: 900, q: 1.5, tc: 0.018 });
    k.tone(0, { wave: 'tri', f: 190, f2: 80, dur: 0.09, vol: 0.28, tc: 0.025 });
  },
  // The ring bell: ding ding ding.
  bell: (k) => {
    for (let i = 0; i < 3; i++) {
      const at = i * 0.17;
      const g = 1 - i * 0.12;
      k.metal(at, 1046, [1, 2.0, 2.76, 4.07, 5.4], [0.11 * g, 0.04 * g, 0.065 * g, 0.032 * g, 0.022 * g], 0.4);
      k.noise(at, { buf: 'metal', dur: 0.04, vol: 0.07 * g, type: 'highpass', f: 4000, tc: 0.01 });
      k.tone(at, { wave: 'p12', f: 2093, dur: 0.03, vol: 0.04 * g, tc: 0.008 });
    }
  },
  'card-play': (k) => {
    k.noise(0, { buf: 'white', dur: 0.08, vol: 0.1, a: 0.01, type: 'highpass', f: 3000, f2: 6000, tc: 0.02 });
    k.tone(0.02, { wave: 'p25', f: 740, f2: 1100, dur: 0.07, vol: 0.05, tc: 0.02 });
  },
  'card-draw': (k) => {
    k.noise(0, { buf: 'white', dur: 0.05, vol: 0.07, a: 0.005, type: 'highpass', f: 5000, tc: 0.012 });
    k.tone(0.03, { wave: 'p12', f: 1500, dur: 0.03, vol: 0.035, tc: 0.008 });
  },
  phase: (k) => {
    [523, 659, 784, 1046].forEach((f, i) => k.tone(i * 0.06, { wave: 'p25', f, dur: 0.14, vol: 0.065, tc: 0.04 }));
    k.tone(0.18, { wave: 'sine', f: 2093, dur: 0.6, vol: 0.03, tc: 0.15 });
  },
  beat: (k) => {
    k.tone(0, { wave: 'tri', f: 1319, dur: 0.4, vol: 0.11, tc: 0.1 });
    k.tone(0.14, { wave: 'tri', f: 988, dur: 0.5, vol: 0.11, tc: 0.14 });
  },
  star: (k) => {
    [1568, 2093, 2637].forEach((f, i) => k.tone(i * 0.04, { wave: 'sine', f, dur: 0.3, vol: 0.055, tc: 0.07 }));
    k.tone(0.1, { wave: 'p12', f: 3136, dur: 0.15, vol: 0.018, tc: 0.04 });
  },
  results: (k) => {
    [523, 659, 784, 1046].forEach((f, i) => k.tone(i * 0.08, { wave: 'p25', f, dur: 0.22, vol: 0.07, tc: 0.06 }));
    k.tone(0.24, { wave: 'tri', f: 131, dur: 0.5, vol: 0.2, tc: 0.15 });
    k.tone(0.24, { wave: 'p50', f: 659, dur: 0.6, vol: 0.035, hold: 0.2, tc: 0.12 });
    k.tone(0.24, { wave: 'p50', f: 784, dur: 0.6, vol: 0.035, hold: 0.2, tc: 0.12 });
  },
  botch: (k) => {
    k.noise(0, { buf: 'chip', dur: 0.12, vol: 0.2, type: 'lowpass', f: 300, tc: 0.03 });
    k.tone(0.02, { wave: 'p50', f: 330, f2: 300, dur: 0.22, vol: 0.07, hold: 0.12, tc: 0.03, vib: 25 });
    k.tone(0.26, { wave: 'p50', f: 294, f2: 220, dur: 0.5, vol: 0.07, hold: 0.3, tc: 0.06, vib: 35 });
  },
  taunt: (k) => {
    k.tone(0, { wave: 'p12', f: 500, f2: 900, sweep: 0.1, dur: 0.12, vol: 0.065, tc: 0.03 });
    k.tone(0.12, { wave: 'p12', f: 900, f2: 650, dur: 0.16, vol: 0.065, tc: 0.04 });
  },
  fireup: (k) => {
    const scale = [0, 2, 4, 7, 9];
    for (let i = 0; i < 12; i++) {
      const m = 60 + scale[i % 5] + 12 * Math.floor(i / 5);
      k.tone(i * 0.035, { wave: 'p25', f: NOTE(m), dur: 0.06, vol: 0.055, tc: 0.02 });
    }
    k.noise(0, { buf: 'white', dur: 0.5, vol: 0.07, a: 0.32, type: 'bandpass', f: 400, f2: 4000, tc: 0.06 });
  },
  'finisher-wind': (k) => {
    k.tone(0, { wave: 'p25', f: 180, f2: 900, dur: 0.9, vol: 0.06, a: 0.1, hold: 0.6, tc: 0.05, vib: 60 });
    k.noise(0, { buf: 'white', dur: 0.9, vol: 0.07, a: 0.6, hold: 0.2, type: 'bandpass', f: 300, f2: 3500, tc: 0.04 });
    k.tone(0.9, { wave: 'sine', f: 2093, dur: 0.45, vol: 0.055, tc: 0.12 });
  },
};

export class Sfx {
  private readonly last = new Map<string, number>();

  constructor(private readonly eng: Engine) {}

  play(id: string, pitch = 1, volume = 1): void {
    const recipe = SFX[id];
    if (!recipe) return;
    const now = this.eng.now;
    // The same sound twice in the same instant only adds volume.
    if (now - (this.last.get(id) ?? -1) < 0.025) return;
    this.last.set(id, now);
    const t = now + 0.005;
    const v = this.eng.v;
    const dest = this.eng.sfxBus;
    const p = pitch > 0 ? pitch : 1;
    const vol = Math.max(0, volume);
    const kit: Kit = {
      tone: (at, o) => {
        v.tone({ ...o, f: o.f * p, f2: o.f2 !== undefined ? o.f2 * p : undefined, vol: o.vol * vol, t: t + at, dest });
      },
      noise: (at, o) => {
        v.noiseHit({ ...o, f: o.f !== undefined ? o.f * p : undefined, f2: o.f2 !== undefined ? o.f2 * p : undefined, vol: o.vol * vol, t: t + at, dest });
      },
      metal: (at, f, ratios, vols, tc) => {
        ratios.forEach((r, i) => v.tone({ wave: 'sine', f: f * r * p, t: t + at, dur: tc * 5, vol: (vols[i] ?? 0.02) * vol, a: 0.002, tc: tc / (1 + i * 0.3), dest }));
      },
    };
    recipe(kit);
  }
}

export const SFX_IDS = Object.keys(SFX);
