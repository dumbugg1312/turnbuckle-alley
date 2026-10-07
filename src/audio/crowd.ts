/**
 * The crowd: a cosy bed of filtered console noise that follows the crowd
 * level, plus one-shot reactions built from formant-filtered "voices".
 */
import type { Engine } from './engine';

export type CrowdReaction = 'pop' | 'boo' | 'gasp' | 'chant' | 'laugh' | 'cheer' | 'count';

/** Vowel formants (F1, F2) in Hz. */
const VOWELS = {
  oo: [320, 800],
  oh: [480, 900],
  ah: [750, 1200],
  uh: [600, 1150],
  ay: [550, 1800],
} as const;

interface Bed {
  srcs: AudioBufferSourceNode[];
  murmur: GainNode;
  roar: GainNode;
  roarFilter: BiquadFilterNode;
  low: GainNode;
  swell: GainNode;
}

export class Crowd {
  private target = 0;
  private applied = -1;
  private bed: Bed | null = null;
  private zeroSince = 0;
  private nextSwell = 0;
  private nextLife = 0;

  constructor(private readonly eng: Engine) {}

  /** Cheap: called every frame. The work happens in tick(). */
  setLevel(level: number): void {
    this.target = level > 0 ? Math.min(1, level) : 0;
  }

  tick(now: number): void {
    const l = this.target;
    if (l > 0.001 && !this.bed) this.startBed();
    const bed = this.bed;
    if (!bed) return;
    if (Math.abs(l - this.applied) > 0.008) {
      this.applied = l;
      bed.murmur.gain.setTargetAtTime(0.16 * Math.sqrt(l), now, 0.35);
      bed.roar.gain.setTargetAtTime(0.13 * Math.pow(l, 1.6), now, 0.35);
      bed.low.gain.setTargetAtTime(0.09 * l, now, 0.4);
      bed.roarFilter.frequency.setTargetAtTime(1150 + l * 900, now, 0.4);
    }
    if (l <= 0.001) {
      if (!this.zeroSince) this.zeroSince = now;
      else if (now - this.zeroSince > 3) this.stopBed();
      return;
    }
    this.zeroSince = 0;
    if (now >= this.nextSwell) {
      bed.swell.gain.setTargetAtTime(0.75 + Math.random() * 0.45, now, 0.7);
      this.nextSwell = now + 0.9 + Math.random() * 2;
    }
    // A little life: stray claps and the odd whistle when the room is warm.
    if (l > 0.4 && now >= this.nextLife) {
      const t = now + 0.05;
      const n = 1 + Math.floor(Math.random() * 3 * l);
      for (let i = 0; i < n; i++) this.clap(t + i * (0.18 + Math.random() * 0.1), 0.05 * l);
      if (l > 0.7 && Math.random() < 0.25) this.whistle(t + Math.random() * 0.3, 0.025 * l);
      this.nextLife = now + 0.4 + Math.random() * (1.6 - l);
    }
  }

  private startBed(): void {
    const ctx = this.eng.ctx;
    const v = this.eng.v;
    const dest = this.eng.crowdBus;
    const swell = ctx.createGain();
    swell.gain.value = 1;
    swell.connect(dest);
    const mk = (kind: 'white' | 'chip', type: BiquadFilterType, f: number, q: number, rate = 1) => {
      const src = ctx.createBufferSource();
      src.buffer = v.noise[kind];
      src.loop = true;
      src.playbackRate.value = rate;
      const filt = ctx.createBiquadFilter();
      filt.type = type;
      filt.frequency.value = f;
      filt.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = 0;
      src.connect(filt);
      filt.connect(g);
      g.connect(swell);
      src.start(ctx.currentTime, Math.random());
      return { src, filt, g };
    };
    const murmur = mk('chip', 'bandpass', 560, 0.9, 0.5);
    const roar = mk('white', 'bandpass', 1300, 0.7);
    const low = mk('chip', 'lowpass', 260, 0.5, 0.35);
    this.bed = { srcs: [murmur.src, roar.src, low.src], murmur: murmur.g, roar: roar.g, roarFilter: roar.filt, low: low.g, swell };
    this.applied = -1;
  }

  private stopBed(): void {
    const bed = this.bed;
    if (!bed) return;
    this.bed = null;
    for (const s of bed.srcs) {
      try {
        s.stop();
        s.disconnect();
      } catch {
        /* ignore */
      }
    }
    try {
      bed.swell.disconnect();
    } catch {
      /* ignore */
    }
    this.zeroSince = 0;
  }

  private clap(t: number, vol: number): void {
    const v = this.eng.v;
    const dest = this.eng.crowdBus;
    for (let i = 0; i < 2; i++) v.noiseHit({ buf: 'white', t: t + i * 0.008, dur: 0.05, vol, type: 'bandpass', f: 1300 + Math.random() * 700, q: 1.2, tc: 0.012, dest });
  }

  private whistle(t: number, vol: number): void {
    const f = 1700 + Math.random() * 500;
    this.eng.v.tone({ wave: 'sine', f, f2: f * 1.45, t, dur: 0.45, vol, a: 0.05, hold: 0.15, tc: 0.08, vib: 20, dest: this.eng.crowdBus });
  }

  /** A choir of crowd voices: detuned saws through two formant filters. */
  private voices(
    t: number,
    o: { vowel: keyof typeof VOWELS; f0: number; n: number; att: number; hold: number; rel: number; vol: number; glide?: number; toVowel?: keyof typeof VOWELS },
  ): void {
    const ctx = this.eng.ctx;
    const dest = this.eng.crowdBus;
    const mix = ctx.createGain();
    mix.gain.value = 1 / Math.sqrt(o.n);
    const [f1, f2] = VOWELS[o.vowel];
    const end = t + o.att + o.hold + o.rel * 3;
    const b1 = ctx.createBiquadFilter();
    b1.type = 'bandpass';
    b1.Q.value = 3.5;
    b1.frequency.setValueAtTime(f1, t);
    const b2 = ctx.createBiquadFilter();
    b2.type = 'bandpass';
    b2.Q.value = 5;
    b2.frequency.setValueAtTime(f2, t);
    if (o.toVowel) {
      const [g1, g2] = VOWELS[o.toVowel];
      b1.frequency.linearRampToValueAtTime(g1, t + o.att + o.hold);
      b2.frequency.linearRampToValueAtTime(g2, t + o.att + o.hold);
    }
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(o.vol, t + o.att);
    env.gain.setValueAtTime(o.vol, t + o.att + o.hold);
    env.gain.setTargetAtTime(0, t + o.att + o.hold, o.rel);
    const b2g = ctx.createGain();
    b2g.gain.value = 0.7;
    mix.connect(b1);
    mix.connect(b2);
    b1.connect(env);
    b2.connect(b2g);
    b2g.connect(env);
    env.connect(dest);
    const oscs: OscillatorNode[] = [];
    for (let i = 0; i < o.n; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      // Half the crowd an octave-ish up.
      const base = o.f0 * (i % 2 ? 1.85 : 1) * (1 + (Math.random() - 0.5) * 0.12);
      osc.frequency.setValueAtTime(base, t);
      if (o.glide) osc.frequency.exponentialRampToValueAtTime(base * o.glide, t + o.att + o.hold + o.rel);
      osc.detune.value = (Math.random() - 0.5) * 30;
      osc.connect(mix);
      osc.start(t + Math.random() * 0.04);
      osc.stop(end);
      oscs.push(osc);
    }
    oscs[0].onended = () => {
      for (const n of [...oscs, mix, b1, b2, b2g, env]) {
        try {
          n.disconnect();
        } catch {
          /* ignore */
        }
      }
    };
  }

  react(kind: CrowdReaction, strength = 0.7): void {
    const s = Math.max(0.1, Math.min(1.5, strength));
    const v = this.eng.v;
    const dest = this.eng.crowdBus;
    const t = this.eng.now + 0.02;
    switch (kind) {
      case 'pop': {
        v.noiseHit({ buf: 'white', t, dur: 2.2, vol: 0.2 * s, a: 0.12, hold: 0.35 * s, type: 'bandpass', f: 1700, q: 0.6, tc: 0.45, dest });
        this.voices(t, { vowel: 'ah', f0: 230, n: 6, att: 0.08, hold: 0.3 + 0.2 * s, rel: 0.45, vol: 0.11 * s, glide: 1.08 });
        const claps = Math.round(8 + 18 * s);
        for (let i = 0; i < claps; i++) this.clap(t + 0.1 + Math.random() * 1.6 * Math.sqrt(Math.random()), 0.06 * s * (1 - i / claps / 2));
        for (let i = 0; i < 1 + Math.round(2 * s); i++) this.whistle(t + 0.1 + Math.random() * 0.6, 0.03 * s);
        break;
      }
      case 'cheer': {
        v.noiseHit({ buf: 'white', t, dur: 3.5, vol: 0.18 * s, a: 0.25, hold: 1 + s, type: 'bandpass', f: 1600, q: 0.55, tc: 0.6, dest });
        this.voices(t, { vowel: 'ay', f0: 220, n: 6, att: 0.2, hold: 0.9 + s * 0.6, rel: 0.6, vol: 0.08 * s, glide: 1.05, toVowel: 'ah' });
        const claps = Math.round(18 + 22 * s);
        for (let i = 0; i < claps; i++) this.clap(t + 0.15 + Math.random() * 2.6, 0.05 * s);
        for (let i = 0; i < 2 + Math.round(2 * s); i++) this.whistle(t + 0.2 + Math.random() * 1.6, 0.028 * s);
        break;
      }
      case 'boo': {
        this.voices(t, { vowel: 'oo', f0: 125, n: 8, att: 0.28, hold: 0.5 + 0.6 * s, rel: 0.6, vol: 0.16 * s, glide: 0.92 });
        v.noiseHit({ buf: 'chip', t, dur: 1.8, vol: 0.08 * s, a: 0.25, hold: 0.5, type: 'lowpass', f: 520, tc: 0.4, rate: 0.5, dest });
        break;
      }
      case 'gasp': {
        v.noiseHit({ buf: 'white', t, dur: 0.45, vol: 0.16 * s, a: 0.03, type: 'bandpass', f: 800, f2: 2400, q: 1.1, tc: 0.1, dest });
        this.voices(t, { vowel: 'oh', f0: 250, n: 6, att: 0.04, hold: 0.1, rel: 0.22, vol: 0.09 * s, glide: 1.28 });
        break;
      }
      case 'chant': {
        // Clap-clap, clap-clap-clap... then a big "WOOO".
        const beat = 0.25;
        const pattern = [0, 1, 3, 4, 5];
        const reps = s > 0.8 ? 2 : 1;
        for (let r = 0; r < reps; r++) {
          for (const p of pattern) {
            const ct = t + (r * 8 + p) * beat;
            for (let h = 0; h < 4; h++) this.clap(ct + Math.random() * 0.025, 0.07 * s);
          }
        }
        const wt = t + reps * 8 * beat;
        this.voices(wt, { vowel: 'oo', f0: 210, n: 7, att: 0.06, hold: 0.3, rel: 0.4, vol: 0.12 * s, glide: 1.6, toVowel: 'oh' });
        break;
      }
      case 'laugh': {
        for (let i = 0; i < 5; i++) {
          this.voices(t + i * 0.16, { vowel: 'ah', f0: 260 * (1 - i * 0.04), n: 4, att: 0.02, hold: 0.05, rel: 0.07, vol: 0.08 * s * (1 - i * 0.12) });
        }
        v.noiseHit({ buf: 'white', t, dur: 0.9, vol: 0.05 * s, a: 0.05, hold: 0.4, type: 'bandpass', f: 1400, q: 0.8, tc: 0.15, dest });
        break;
      }
      case 'count': {
        // The whole building yells "ONE!" (louder each count).
        this.voices(t, { vowel: 'uh', f0: 165 * (0.92 + s * 0.12), n: 7, att: 0.03, hold: 0.12, rel: 0.3, vol: (0.06 + 0.09 * s), glide: 0.9, toVowel: 'oo' });
        v.noiseHit({ buf: 'white', t, dur: 0.5, vol: 0.06 * s, a: 0.02, type: 'bandpass', f: 1200, q: 0.8, tc: 0.12, dest });
        break;
      }
      default:
        break;
    }
  }
}
