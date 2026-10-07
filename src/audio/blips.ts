/**
 * Dialogue text blips. Each character's voice is a pitch, a timbre and a
 * little melodic habit. Unknown voices get a stable voice from a hash of
 * their id. Rate-limited so fast text never buzzes.
 */
import type { WaveName } from './instruments';
import type { Engine } from './engine';
import { midiToFreq } from './notation';

export interface BlipVoice {
  wave: WaveName;
  /** Base MIDI pitch. */
  midi: number;
  /** Semitone choices around the base (speech-like wander). */
  steps: number[];
  /** Seconds per blip. */
  dur: number;
  vol: number;
  /** Lowpass for soft voices. */
  lp?: number;
  /** Semitones of downward glide during the blip (warm), negative = upward. */
  glide?: number;
  /** Minimum seconds between blips. */
  gap?: number;
}

const V = (o: BlipVoice) => o;

export const BLIP_VOICES: Record<string, BlipVoice> = {
  default: V({ wave: 'p25', midi: 69, steps: [0, 2, 4, 7], dur: 0.045, vol: 0.08 }),
  // The Velvet Hammers
  birdie: V({ wave: 'p50', midi: 63, steps: [0, 2, 3, 5, 7], dur: 0.06, vol: 0.085, lp: 2200, glide: 1.5 }),
  grandma: V({ wave: 'tri', midi: 69, steps: [0, 2, 4, 5], dur: 0.07, vol: 0.13, lp: 2600, glide: 1, gap: 0.075 }),
  // Wrestlers
  earl: V({ wave: 'p50', midi: 50, steps: [0, 2, 3, 5], dur: 0.085, vol: 0.1, lp: 850, glide: 1, gap: 0.09 }),
  mariposa: V({ wave: 'p25', midi: 70, steps: [0, 2, 4, 5, 7, 9], dur: 0.04, vol: 0.075, gap: 0.05 }),
  dex: V({ wave: 'p25', midi: 66, steps: [0, 3, 5, 7], dur: 0.035, vol: 0.075, gap: 0.045 }),
  gideon: V({ wave: 'p12', midi: 67, steps: [0, 4, 7, 12], dur: 0.055, vol: 0.075, glide: -1 }),
  bo: V({ wave: 'p50', midi: 55, steps: [0, 2, 5], dur: 0.06, vol: 0.085, lp: 1600 }),
  buck: V({ wave: 'p25', midi: 57, steps: [0, 3, 5, 7, 10], dur: 0.045, vol: 0.085, gap: 0.045 }),
  twins: V({ wave: 'p50', midi: 56, steps: [0, 2, 5, 7], dur: 0.055, vol: 0.085, lp: 1800 }),
  hazel: V({ wave: 'p25', midi: 68, steps: [0, 2, 4, 7], dur: 0.045, vol: 0.075 }),
  clint: V({ wave: 'p12', midi: 55, steps: [0, 2, 3, 5], dur: 0.07, vol: 0.08, lp: 1700, glide: 2, gap: 0.08 }),
  mothman: V({ wave: 'sine', midi: 76, steps: [0, 1, 6, 7], dur: 0.09, vol: 0.12, glide: -3, gap: 0.1 }),
  tiny: V({ wave: 'tri', midi: 57, steps: [0, 2, 4], dur: 0.08, vol: 0.15, lp: 1500, gap: 0.085 }),
  professor: V({ wave: 'p50', midi: 62, steps: [0, 2, 4, 5, 7], dur: 0.05, vol: 0.075, lp: 2400 }),
  lou: V({ wave: 'tri', midi: 52, steps: [0, 3, 5, 7], dur: 0.08, vol: 0.15, lp: 1400, glide: 1, gap: 0.085 }),
  // Crew
  mo: V({ wave: 'p25', midi: 64, steps: [0, 2, 4, 7], dur: 0.045, vol: 0.075 }),
  gus: V({ wave: 'p50', midi: 52, steps: [0, 5, 7, 12], dur: 0.06, vol: 0.09, lp: 2000, glide: -1 }),
  june: V({ wave: 'tri', midi: 62, steps: [0, 2, 3, 5, 7], dur: 0.065, vol: 0.13, lp: 2200 }),
  hank: V({ wave: 'p50', midi: 58, steps: [0, 2, 5], dur: 0.05, vol: 0.08, lp: 1700 }),
  marigold: V({ wave: 'p25', midi: 72, steps: [0, 2, 4, 7, 9], dur: 0.04, vol: 0.07 }),
  doc: V({ wave: 'p50', midi: 57, steps: [0, 2, 4], dur: 0.06, vol: 0.08, lp: 1900 }),
  // Marks
  pip: V({ wave: 'p12', midi: 84, steps: [0, 3, 5, 7, 10], dur: 0.028, vol: 0.06, gap: 0.04 }),
  lacey: V({ wave: 'p25', midi: 71, steps: [0, 2, 3, 7], dur: 0.04, vol: 0.07 }),
  agnes: V({ wave: 'tri', midi: 72, steps: [0, 1, 3, 5], dur: 0.06, vol: 0.12, glide: 0.5 }),
  bev: V({ wave: 'p50', midi: 60, steps: [0, 0, 2, 5], dur: 0.055, vol: 0.08, lp: 2000 }),
  patty: V({ wave: 'p25', midi: 62, steps: [0, 2, 5, 7], dur: 0.045, vol: 0.08 }),
  clementine: V({ wave: 'p12', midi: 71, steps: [0, 2, 4, 5, 7], dur: 0.042, vol: 0.065 }),
  fenwick: V({ wave: 'p12', midi: 64, steps: [0, 1, 3, 6, 8], dur: 0.04, vol: 0.07, gap: 0.045 }),
  mayor: V({ wave: 'p50', midi: 65, steps: [0, 4, 7], dur: 0.055, vol: 0.08, lp: 2400 }),
  nadia: V({ wave: 'tri', midi: 70, steps: [0, 2, 4, 7], dur: 0.05, vol: 0.12 }),
  sami: V({ wave: 'tri', midi: 63, steps: [0, 2, 4, 5], dur: 0.055, vol: 0.12 }),
  wanda: V({ wave: 'p50', midi: 45, steps: [0, 2], dur: 0.1, vol: 0.1, lp: 600, glide: 1, gap: 0.11 }),
  jobber: V({ wave: 'p12', midi: 88, steps: [0, 2, 3], dur: 0.022, vol: 0.05, gap: 0.035 }),
  arlo: V({ wave: 'p25', midi: 65, steps: [0, 2, 3, 5], dur: 0.045, vol: 0.075 }),
  royce: V({ wave: 'p12', midi: 60, steps: [0, 0, 7], dur: 0.05, vol: 0.07, lp: 2600 }),
  player: V({ wave: 'p25', midi: 67, steps: [0, 2, 4, 5, 7], dur: 0.045, vol: 0.075 }),
};

const ALIASES: Record<string, string> = {
  dottie: 'grandma',
  duchess: 'grandma',
  rosa: 'mariposa',
  odessa: 'professor',
  pinfall: 'professor',
  delphine: 'mayor',
  sheriff: 'bev',
  coach: 'patty',
  dustdevil: 'clint',
  ref: 'mo',
};

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

export function voiceFor(id: string | undefined): BlipVoice {
  const key = (id ?? 'default').toLowerCase().replace(/^npc[:_-]/, '');
  const direct = BLIP_VOICES[key] ?? BLIP_VOICES[ALIASES[key] ?? ''];
  if (direct) return direct;
  const h = hash(key);
  const waves: WaveName[] = ['p12', 'p25', 'p50', 'tri'];
  const wave = waves[h % 4];
  return {
    wave,
    midi: 58 + ((h >> 3) % 20),
    steps: [[0, 2, 4, 7], [0, 2, 3, 5], [0, 3, 5, 7], [0, 2, 5, 7]][(h >> 8) % 4],
    dur: 0.035 + ((h >> 11) % 4) * 0.01,
    vol: wave === 'tri' ? 0.12 : 0.075,
    lp: (h >> 14) % 2 ? 2400 : undefined,
  };
}

export class Blips {
  private last = 0;
  private lastStep = 0;

  constructor(private readonly eng: Engine) {}

  play(id: string | undefined): void {
    const vc = voiceFor(id);
    const ctx = this.eng.ctx;
    const now = ctx.currentTime;
    if (now - this.last < (vc.gap ?? 0.055)) return;
    this.last = now;
    // Wander like speech, avoiding the same note twice in a row.
    let i = Math.floor(Math.random() * vc.steps.length);
    if (i === this.lastStep && vc.steps.length > 1) i = (i + 1) % vc.steps.length;
    this.lastStep = i;
    const f = midiToFreq(vc.midi + vc.steps[i]) * (1 + (Math.random() - 0.5) * 0.012);
    const t = now + 0.005;
    const osc = ctx.createOscillator();
    this.eng.v.setWave(osc, vc.wave);
    osc.frequency.setValueAtTime(f, t);
    if (vc.glide) osc.frequency.linearRampToValueAtTime(f * Math.pow(2, -vc.glide / 12), t + vc.dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vc.vol, t + 0.004);
    g.gain.setValueAtTime(vc.vol, t + vc.dur * 0.6);
    g.gain.linearRampToValueAtTime(0, t + vc.dur);
    const nodes: AudioNode[] = [osc, g];
    if (vc.lp) {
      const f2 = ctx.createBiquadFilter();
      f2.type = 'lowpass';
      f2.frequency.value = vc.lp;
      osc.connect(f2);
      f2.connect(g);
      nodes.push(f2);
    } else osc.connect(g);
    g.connect(this.eng.sfxBus);
    osc.start(t);
    osc.stop(t + vc.dur + 0.02);
    osc.onended = () => {
      for (const n of nodes) {
        try {
          n.disconnect();
        } catch {
          /* ignore */
        }
      }
    };
  }
}
