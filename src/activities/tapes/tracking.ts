import type { Wobble } from './types';

/**
 * The VHS tracking mini-game, as pure logic (the watch scene draws it, tests
 * simulate it). Like Stardew's fishing bar: hold to push the tracking bar up,
 * let go and it falls. Keep the wobbling clear zone inside the bar to fill the
 * catch meter; off it, the meter drains and the picture rolls.
 *
 * Units: the gauge runs 0 (bottom) to 1 (top).
 */
export interface TrackingTuning {
  barSize: number;
  difficulty: number; // 0..1
  wobble: Wobble;
}

export const TUNE = {
  thrust: 3.1, // gauge/s² while held
  gravity: 2.7, // gauge/s² falling
  maxUp: 1.15,
  maxDown: 1.35,
  bounce: 0.42,
  startMeter: 0.3,
  grace: 1.1, // seconds before the meter can drain
  timeLimit: 30,
};

export function barSizeFor(ringIqLevel: number): number {
  return Math.min(0.44, 0.27 + ringIqLevel * 0.016);
}

export function difficultyFor(level: number): number {
  return [0.1, 0.1, 0.32, 0.56, 0.78, 0.92][Math.max(0, Math.min(5, Math.round(level)))];
}

export class Tracking {
  bar = 0.05;
  vel = 0;
  zone = 0.5;
  zoneVel = 0;
  target = 0.5;
  meter = TUNE.startMeter;
  t = 0;
  perfect = true;
  done: 'caught' | 'lost' | null = null;
  private nextMove = 0.6;
  private rnd: () => number;

  constructor(public tune: TrackingTuning, seed = 1) {
    let s = seed >>> 0 || 1;
    this.rnd = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    this.zone = 0.35 + this.rnd() * 0.3;
    this.target = this.zone;
    this.bar = Math.max(0, this.zone - tune.barSize / 2);
  }

  get barSize(): number {
    return this.tune.barSize;
  }

  /** Is the clear zone inside the tracking bar? */
  get onTarget(): boolean {
    return this.zone >= this.bar - 0.012 && this.zone <= this.bar + this.barSize + 0.012;
  }

  /** 0 = perfectly clear picture, 1 = rolling garbage. */
  get distortion(): number {
    const c = this.bar + this.barSize / 2;
    const d = Math.abs(this.zone - c) - this.barSize / 2;
    if (d <= 0) return Math.max(0, (Math.abs(this.zone - c) / (this.barSize / 2)) * 0.18);
    return Math.min(1, 0.25 + d * 3.2);
  }

  step(dt: number, holding: boolean): void {
    if (this.done) return;
    this.t += dt;
    // ---- the player's bar
    this.vel += (holding ? TUNE.thrust : -TUNE.gravity) * dt;
    this.vel = Math.max(-TUNE.maxDown, Math.min(TUNE.maxUp, this.vel));
    this.bar += this.vel * dt;
    if (this.bar < 0) {
      this.bar = 0;
      this.vel = this.vel < -0.3 ? -this.vel * TUNE.bounce : 0;
    }
    if (this.bar + this.barSize > 1) {
      this.bar = 1 - this.barSize;
      this.vel = Math.min(0, this.vel) * 0.2;
    }
    // ---- the clear zone (the "fish")
    const d = this.tune.difficulty;
    this.nextMove -= dt;
    if (this.nextMove <= 0) {
      const w = this.tune.wobble;
      let span = 0.2 + d * 0.55;
      if (w === 'dart') span += 0.12;
      let t = this.zone + (this.rnd() * 2 - 1) * span;
      if (w === 'sinker') t -= 0.12 * this.rnd();
      if (w === 'floater') t += 0.12 * this.rnd();
      this.target = Math.max(0.05, Math.min(0.95, t));
      const base = w === 'dart' ? 0.35 + this.rnd() * 1.1 : w === 'smooth' ? 1.0 + this.rnd() * 1.4 : 0.55 + this.rnd() * 1.3;
      this.nextMove = base * (1.25 - d * 0.55);
    }
    const k = (w: Wobble) => (w === 'dart' ? 9 : w === 'smooth' ? 2.2 : 4.2);
    const pull = k(this.tune.wobble) * (0.6 + d * 0.9);
    const desired = (this.target - this.zone) * pull;
    const resp = this.tune.wobble === 'smooth' ? 3 : 5 + d * 5;
    this.zoneVel += (desired - this.zoneVel) * Math.min(1, dt * resp);
    // a little nervous jitter on harder moments
    const jitter = Math.sin(this.t * (9 + d * 13)) * d * 0.05 + Math.sin(this.t * 23.7) * d * 0.02;
    this.zone += (this.zoneVel + jitter) * dt;
    if (this.zone < 0.03) {
      this.zone = 0.03;
      this.zoneVel = Math.abs(this.zoneVel) * 0.5;
    }
    if (this.zone > 0.97) {
      this.zone = 0.97;
      this.zoneVel = -Math.abs(this.zoneVel) * 0.5;
    }
    // ---- the catch meter
    const fill = 0.21 - d * 0.045;
    const drain = 0.11 + d * 0.15;
    if (this.onTarget) this.meter += fill * dt;
    else if (this.t > TUNE.grace) {
      this.meter -= drain * dt;
      this.perfect = false;
    }
    if (this.meter >= 1) {
      this.meter = 1;
      this.done = 'caught';
    } else if (this.meter <= 0 || this.t > TUNE.timeLimit) {
      this.meter = Math.max(0, this.meter);
      this.done = 'lost';
    }
  }
}
