/**
 * Low-level synthesis: band-limited pulse waves, the console triangle, three
 * flavours of noise, an instrument note player and the drum kit. Everything
 * else (music, sfx, crowd, blips) is built from these.
 */
import type { InstrumentDef, WaveName } from './instruments';
import { midiToFreq } from './notation';

export type NoiseKind = 'white' | 'chip' | 'metal';

export interface ToneOpts {
  wave: WaveName;
  /** Start frequency (Hz). */
  f: number;
  /** End frequency for a sweep. */
  f2?: number;
  /** Sweep curve. */
  curve?: 'exp' | 'lin';
  /** Sweep time (defaults to dur). */
  sweep?: number;
  t: number;
  dur: number;
  vol: number;
  a?: number;
  /** Decay time constant (default dur / 4). */
  tc?: number;
  /** Hold at full level until this long after the attack. */
  hold?: number;
  detune?: number;
  /** Vibrato depth in cents. */
  vib?: number;
  dest: AudioNode;
}

export interface NoiseOpts {
  buf?: NoiseKind;
  t: number;
  dur: number;
  vol: number;
  a?: number;
  tc?: number;
  hold?: number;
  type?: BiquadFilterType;
  f?: number;
  f2?: number;
  q?: number;
  rate?: number;
  dest: AudioNode;
}

export interface NoteOpts {
  /** Slide in from this MIDI pitch. */
  from?: number | null;
  /** Tape wobble (a gain node fed by a slow LFO, in cents). */
  wobble?: AudioNode | null;
}

function pulseWave(ctx: BaseAudioContext, duty: number): PeriodicWave {
  const n = 48;
  const real = new Float32Array(n + 1);
  const imag = new Float32Array(n + 1);
  for (let k = 1; k <= n; k++) {
    // A gentle roll-off keeps the squares bright but never harsh.
    const roll = 1 / (1 + (k / 24) ** 2);
    real[k] = (Math.sin(2 * Math.PI * k * duty) / (Math.PI * k)) * roll;
    imag[k] = ((1 - Math.cos(2 * Math.PI * k * duty)) / (Math.PI * k)) * roll;
  }
  return ctx.createPeriodicWave(real, imag);
}

/** The 4-bit stepped triangle of old consoles: a triangle with a faint buzz. */
function steppedTriangle(ctx: BaseAudioContext): PeriodicWave {
  const N = 32;
  const s: number[] = [];
  for (let i = 0; i < N; i++) s.push(((i < 16 ? 15 - i : i - 16) / 7.5) - 1);
  const n = 40;
  const real = new Float32Array(n + 1);
  const imag = new Float32Array(n + 1);
  for (let k = 1; k <= n; k++) {
    let a = 0;
    let b = 0;
    for (let i = 0; i < N; i++) {
      const t0 = (2 * Math.PI * k * i) / N;
      const t1 = (2 * Math.PI * k * (i + 1)) / N;
      a += s[i] * (Math.sin(t1) - Math.sin(t0));
      b += s[i] * (Math.cos(t0) - Math.cos(t1));
    }
    real[k] = a / (Math.PI * k);
    imag[k] = b / (Math.PI * k);
  }
  return ctx.createPeriodicWave(real, imag);
}

function noiseBuffer(ctx: BaseAudioContext, kind: NoiseKind): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * 1.5);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  if (kind === 'white') {
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  // Console LFSR noise: 'chip' is the long 15-bit mode, 'metal' the short
  // 93-step mode that sounds tonal and clanky.
  let lfsr = 1;
  const hold = kind === 'chip' ? 2 : 3;
  const tap = kind === 'chip' ? 1 : 6;
  let v = 0;
  for (let i = 0; i < len; i++) {
    if (i % hold === 0) {
      const bit = (lfsr ^ (lfsr >> tap)) & 1;
      lfsr = (lfsr >> 1) | (bit << 14);
      v = lfsr & 1 ? 0.8 : -0.8;
    }
    d[i] = v;
  }
  return buf;
}

function cleanup(src: AudioScheduledSourceNode, nodes: AudioNode[], extra?: () => void): void {
  src.onended = () => {
    for (const n of nodes) {
      try {
        n.disconnect();
      } catch {
        /* already gone */
      }
    }
    extra?.();
  };
}

export class Voices {
  private readonly waves = new Map<WaveName, PeriodicWave>();
  readonly noise: Record<NoiseKind, AudioBuffer>;
  /** ±1 sine LFOs for vibrato. */
  readonly vib: OscillatorNode;
  readonly vibSlow: OscillatorNode;
  /** Slow tape-wobble LFO (±1). */
  readonly wobbleLfo: OscillatorNode;

  constructor(readonly ctx: BaseAudioContext) {
    this.waves.set('p12', pulseWave(ctx, 0.125));
    this.waves.set('p25', pulseWave(ctx, 0.25));
    this.waves.set('p50', pulseWave(ctx, 0.5));
    this.waves.set('ntri', steppedTriangle(ctx));
    this.noise = { white: noiseBuffer(ctx, 'white'), chip: noiseBuffer(ctx, 'chip'), metal: noiseBuffer(ctx, 'metal') };
    const lfo = (f: number) => {
      const o = ctx.createOscillator();
      o.frequency.value = f;
      o.start();
      return o;
    };
    this.vib = lfo(5.6);
    this.vibSlow = lfo(4.2);
    this.wobbleLfo = lfo(0.55);
  }

  setWave(osc: OscillatorNode, w: WaveName): void {
    const pw = this.waves.get(w);
    if (pw) osc.setPeriodicWave(pw);
    else osc.type = w === 'tri' ? 'triangle' : w === 'saw' ? 'sawtooth' : 'sine';
  }

  /** Play one instrument note (or chord). */
  note(inst: InstrumentDef, pitches: number[], t: number, dur: number, vel: number, dest: AudioNode, o: NoteOpts = {}): void {
    if (!pitches.length) return;
    const ctx = this.ctx;
    const peak = (inst.gain * vel) / Math.sqrt(pitches.length);
    if (peak <= 0.0005) return;
    const len = Math.max(0.03, dur);
    const end = t + len;
    const env = ctx.createGain();
    const g = env.gain;
    g.setValueAtTime(0, t);
    g.linearRampToValueAtTime(peak, t + inst.a);
    if (inst.s < 0.999) g.setTargetAtTime(peak * inst.s, t + inst.a, Math.max(0.01, inst.d / 3));
    const relStart = Math.max(end, t + inst.a);
    g.setTargetAtTime(0, relStart, Math.max(0.005, inst.r / 3));
    let stopAt = relStart + inst.r * 2 + 0.03;
    if (inst.s < 0.001) stopAt = Math.min(stopAt, t + inst.a + inst.d * 2 + 0.03);
    env.connect(dest);
    const nodes: AudioNode[] = [env];
    let input: AudioNode = env;
    if (inst.filter) {
      const f = ctx.createBiquadFilter();
      f.type = inst.filter.type;
      f.Q.value = inst.filter.q ?? 0.7;
      if (inst.filter.env) {
        f.frequency.setValueAtTime(Math.min(18000, inst.filter.f * inst.filter.env), t);
        f.frequency.setTargetAtTime(inst.filter.f, t, (inst.filter.envTime ?? 0.1) / 3);
      } else f.frequency.value = inst.filter.f;
      f.connect(env);
      nodes.push(f);
      input = f;
    }
    let vg: GainNode | null = null;
    if (inst.vib && len > inst.vib.delay + 0.05) {
      vg = ctx.createGain();
      vg.gain.setValueAtTime(0, t + inst.vib.delay);
      vg.gain.linearRampToValueAtTime(inst.vib.depth, t + inst.vib.delay + 0.25);
      (inst.vib.slow ? this.vibSlow : this.vib).connect(vg);
      nodes.push(vg);
    }
    const oscs: OscillatorNode[] = [];
    for (const p of pitches) {
      for (const L of inst.layers) {
        const osc = ctx.createOscillator();
        this.setWave(osc, L.wave);
        const semi = L.semi ?? 0;
        const f = midiToFreq(p + semi);
        if (o.from != null && inst.slide) {
          osc.frequency.setValueAtTime(midiToFreq(o.from + semi), t);
          osc.frequency.exponentialRampToValueAtTime(f, t + inst.slide);
        } else osc.frequency.setValueAtTime(f, t);
        const det = L.detune ?? 0;
        if (inst.scoop) {
          osc.detune.setValueAtTime(det - inst.scoop, t);
          osc.detune.linearRampToValueAtTime(det, t + 0.06);
        } else if (det) osc.detune.setValueAtTime(det, t);
        if (vg) vg.connect(osc.detune);
        if (o.wobble) o.wobble.connect(osc.detune);
        let out: AudioNode = osc;
        if (L.gain !== undefined && L.gain !== 1) {
          const lg = ctx.createGain();
          lg.gain.value = L.gain;
          osc.connect(lg);
          nodes.push(lg);
          out = lg;
        }
        out.connect(input);
        osc.start(t);
        osc.stop(stopAt);
        oscs.push(osc);
        nodes.push(osc);
      }
    }
    const lfo = inst.vib ? (inst.vib.slow ? this.vibSlow : this.vib) : null;
    const wob = o.wobble ?? null;
    cleanup(oscs[0], nodes, () => {
      if (vg && lfo) {
        try {
          lfo.disconnect(vg);
        } catch {
          /* ignore */
        }
      }
      if (wob) for (const osc of oscs) {
        try {
          wob.disconnect(osc.detune);
        } catch {
          /* ignore */
        }
      }
    });
  }

  /** A simple enveloped oscillator, for sfx and drums. */
  tone(o: ToneOpts): OscillatorNode {
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    this.setWave(osc, o.wave);
    osc.frequency.setValueAtTime(o.f, o.t);
    if (o.f2 !== undefined) {
      const sweepEnd = o.t + (o.sweep ?? o.dur);
      if (o.curve === 'lin') osc.frequency.linearRampToValueAtTime(o.f2, sweepEnd);
      else osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.f2), sweepEnd);
    }
    if (o.detune) osc.detune.value = o.detune;
    const g = ctx.createGain();
    const a = o.a ?? 0.004;
    g.gain.setValueAtTime(0, o.t);
    g.gain.linearRampToValueAtTime(o.vol, o.t + a);
    const holdEnd = o.t + a + (o.hold ?? 0);
    if (o.hold) g.gain.setValueAtTime(o.vol, holdEnd);
    g.gain.setTargetAtTime(0, holdEnd, o.tc ?? Math.max(0.005, (o.dur - a) / 4));
    osc.connect(g);
    g.connect(o.dest);
    const nodes: AudioNode[] = [osc, g];
    let vg: GainNode | null = null;
    if (o.vib) {
      vg = ctx.createGain();
      vg.gain.value = o.vib;
      this.vib.connect(vg);
      vg.connect(osc.detune);
      nodes.push(vg);
    }
    osc.start(o.t);
    osc.stop(o.t + o.dur + 0.05);
    cleanup(osc, nodes, () => {
      if (vg) {
        try {
          this.vib.disconnect(vg);
        } catch {
          /* ignore */
        }
      }
    });
    return osc;
  }

  /** A burst of filtered noise. */
  noiseHit(o: NoiseOpts): AudioBufferSourceNode {
    const ctx = this.ctx;
    const src = ctx.createBufferSource();
    const buf = this.noise[o.buf ?? 'white'];
    src.buffer = buf;
    if (o.rate) src.playbackRate.value = o.rate;
    const g = ctx.createGain();
    const a = o.a ?? 0.002;
    g.gain.setValueAtTime(0, o.t);
    g.gain.linearRampToValueAtTime(o.vol, o.t + a);
    const holdEnd = o.t + a + (o.hold ?? 0);
    if (o.hold) g.gain.setValueAtTime(o.vol, holdEnd);
    g.gain.setTargetAtTime(0, holdEnd, o.tc ?? Math.max(0.004, (o.dur - a) / 4));
    const nodes: AudioNode[] = [src, g];
    let head: AudioNode = src;
    if (o.type) {
      const f = ctx.createBiquadFilter();
      f.type = o.type;
      f.frequency.setValueAtTime(o.f ?? 1000, o.t);
      if (o.f2 !== undefined) f.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), o.t + o.dur);
      f.Q.value = o.q ?? 0.8;
      src.connect(f);
      head = f;
      nodes.push(f);
    }
    head.connect(g);
    g.connect(o.dest);
    const offset = Math.random() * Math.max(0, buf.duration - o.dur - 0.1);
    src.start(o.t, offset);
    src.stop(o.t + o.dur + 0.05);
    cleanup(src, nodes);
    return src;
  }

  /** One hit from the drum kit (see DRUM_KINDS in notation.ts). */
  drum(k: string, t: number, vel: number, dest: AudioNode): void {
    const v = vel;
    switch (k) {
      case 'k':
        this.tone({ wave: 'sine', f: 140, f2: 46, sweep: 0.09, t, dur: 0.32, vol: 0.85 * v, tc: 0.07, dest });
        this.noiseHit({ buf: 'chip', t, dur: 0.012, vol: 0.12 * v, type: 'lowpass', f: 2200, dest });
        break;
      case 'u': // stomp: a fat, low thud
        this.tone({ wave: 'sine', f: 110, f2: 42, sweep: 0.12, t, dur: 0.35, vol: 0.9 * v, tc: 0.09, dest });
        this.noiseHit({ buf: 'chip', t, dur: 0.08, vol: 0.22 * v, type: 'lowpass', f: 500, dest });
        break;
      case 's':
        this.noiseHit({ buf: 'chip', t, dur: 0.16, vol: 0.42 * v, type: 'bandpass', f: 1900, q: 0.7, tc: 0.045, dest });
        this.tone({ wave: 'tri', f: 200, f2: 150, t, dur: 0.09, vol: 0.28 * v, tc: 0.03, dest });
        break;
      case 'h':
        this.noiseHit({ buf: 'metal', t, dur: 0.05, vol: 0.16 * v, type: 'highpass', f: 7000, tc: 0.014, dest });
        break;
      case 'o':
        this.noiseHit({ buf: 'metal', t, dur: 0.3, vol: 0.13 * v, type: 'highpass', f: 6500, tc: 0.08, dest });
        break;
      case 'c':
        this.noiseHit({ buf: 'white', t, dur: 1.4, vol: 0.2 * v, type: 'highpass', f: 3800, tc: 0.38, dest });
        this.noiseHit({ buf: 'metal', t, dur: 0.8, vol: 0.06 * v, type: 'highpass', f: 5000, tc: 0.25, dest });
        break;
      case 't':
      case 'm':
      case 'f': {
        const f0 = k === 't' ? 105 : k === 'm' ? 145 : 195;
        this.tone({ wave: 'ntri', f: f0, f2: f0 * 0.6, sweep: 0.22, t, dur: 0.3, vol: 0.55 * v, tc: 0.08, dest });
        this.noiseHit({ buf: 'chip', t, dur: 0.03, vol: 0.08 * v, type: 'lowpass', f: 1500, dest });
        break;
      }
      case 'p':
        for (let i = 0; i < 3; i++) this.noiseHit({ buf: 'white', t: t + i * 0.011, dur: i === 2 ? 0.14 : 0.012, vol: 0.32 * v, type: 'bandpass', f: 1250, q: 1.1, tc: i === 2 ? 0.04 : 0.004, dest });
        break;
      case 'x':
        this.tone({ wave: 'p50', f: 1650, t, dur: 0.03, vol: 0.09 * v, tc: 0.008, dest });
        this.noiseHit({ buf: 'chip', t, dur: 0.02, vol: 0.12 * v, type: 'bandpass', f: 2600, q: 2, dest });
        break;
      case 'z':
        this.noiseHit({ buf: 'white', t, dur: 0.07, vol: 0.09 * v, a: 0.012, type: 'highpass', f: 5200, tc: 0.018, dest });
        break;
      case 'b':
        this.tone({ wave: 'p50', f: 545, t, dur: 0.14, vol: 0.07 * v, tc: 0.04, dest });
        this.tone({ wave: 'p50', f: 815, t, dur: 0.14, vol: 0.06 * v, tc: 0.035, dest });
        break;
      case 'g':
        for (let i = 0; i < 5; i++) this.noiseHit({ buf: 'white', t: t + i * 0.018, dur: 0.016, vol: 0.07 * v, type: 'bandpass', f: 3200, q: 3, tc: 0.006, dest });
        break;
      case 'j':
        this.noiseHit({ buf: 'metal', t, dur: 0.14, vol: 0.12 * v, type: 'highpass', f: 6000, tc: 0.035, dest });
        this.noiseHit({ buf: 'white', t: t + 0.02, dur: 0.1, vol: 0.06 * v, type: 'highpass', f: 8000, tc: 0.03, dest });
        break;
      case 'n':
        this.noiseHit({ buf: 'white', t, dur: 2.2, vol: 0.5 * v, a: 0.04, type: 'lowpass', f: 600, f2: 120, tc: 0.5, dest });
        this.noiseHit({ buf: 'chip', t, dur: 0.25, vol: 0.18 * v, type: 'lowpass', f: 1500, tc: 0.06, dest });
        break;
      case 'w':
        this.tone({ wave: 'p25', f: 520, f2: 1500, sweep: 0.4, t, dur: 0.45, vol: 0.05 * v, a: 0.03, hold: 0.3, tc: 0.04, vib: 30, dest });
        this.noiseHit({ buf: 'metal', t, dur: 0.45, vol: 0.04 * v, a: 0.03, type: 'bandpass', f: 2500, f2: 4500, q: 2, hold: 0.3, tc: 0.04, dest });
        break;
      case 'y':
        this.tone({ wave: 'p50', f: 349, t, dur: 0.22, vol: 0.08 * v, hold: 0.14, tc: 0.025, dest });
        this.tone({ wave: 'p50', f: 440, t, dur: 0.22, vol: 0.07 * v, hold: 0.14, tc: 0.025, dest });
        break;
      case 'l':
        this.tone({ wave: 'p12', f: 1600, f2: 180, t, dur: 0.14, vol: 0.08 * v, tc: 0.04, dest });
        break;
      case 'd':
        this.tone({ wave: 'sine', f: 75, f2: 45, t, dur: 0.18, vol: 0.7 * v, tc: 0.05, dest });
        this.tone({ wave: 'sine', f: 68, f2: 42, t: t + 0.17, dur: 0.22, vol: 0.5 * v, tc: 0.06, dest });
        break;
      default:
        break;
    }
  }
}
