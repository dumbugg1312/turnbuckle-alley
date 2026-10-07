import { audio } from '../audio';
import { getSeason } from '../gfx/world/terrain';
import type { Actor } from './actor';
import type { Box, GameMap } from './map';
import type { StepFx } from './stepfx';
import type { MapObject } from './types';

/**
 * Plants that answer to touch. Walk through reeds, brush a bush or a hedge,
 * slip behind a tree, and it wobbles (a short damped shake, applied at draw
 * time as a shear pivoting on the object's base) and lets go of a few leaves
 * or petals. Pickups borrow the same machinery for their squash before they
 * pop free. Gusts on windy days bend everything they pass.
 */

/** Damped wobble: px of lean at the top, t seconds after the touch. */
export function wobble(t: number, amp: number, freq = 24, decay = 6.5): number {
  if (t < 0) return 0;
  return amp * Math.exp(-decay * t) * Math.sin(freq * t);
}

/** Touch zones for each plant kind, relative to the object's anchor (bottom-centre), plus how it reacts. */
interface Plant {
  /** Contact box relative to the anchor. Hedges compute theirs from their length. */
  zone?: Box;
  /** Height in px of the leaning part (shear = lean / height). */
  h: number;
  amp: number;
  /** Where leaves come loose (relative y) and how wide. */
  leafY: number;
  spread: number;
  leaves: () => string[];
  /** Trees: also shiver when someone passes behind the crown. */
  behind?: Box;
}

const SEASON_LEAVES: Record<string, string[]> = {
  spring: ['#a8d878', '#c8e890', '#7ab858'],
  summer: ['#9ad070', '#b8e080', '#6aa84a'],
  fall: ['#f2a444', '#d65a3a', '#ffd050', '#c06a2a'],
  winter: ['#f6f8fc', '#e4e8f6', '#d4dcf0'],
};
const leavesNow = () => SEASON_LEAVES[getSeason()] ?? SEASON_LEAVES.summer;
const BLOSSOM = ['#ffbcd0', '#fff0f4', '#f094b4'];

export const PLANTS: Record<string, Plant> = {
  bush: { zone: { x: -11, y: -14, w: 22, h: 17 }, h: 16, amp: 2.2, leafY: -9, spread: 14, leaves: leavesNow },
  hedge: { h: 18, amp: 1.6, leafY: -12, spread: 10, leaves: () => (getSeason() === 'winter' ? SEASON_LEAVES.winter : ['#a8d878', '#c8e890', '#e8f0b0']) },
  flowerbed: { zone: { x: -13, y: -10, w: 26, h: 13 }, h: 10, amp: 1.6, leafY: -6, spread: 16, leaves: () => (getSeason() === 'winter' ? SEASON_LEAVES.winter : ['#ffb6cc', '#fff0f4', '#ffd050', '#e8434b', '#9ad070']) },
  reeds: { zone: { x: -8, y: -7, w: 16, h: 9 }, h: 16, amp: 3, leafY: -12, spread: 10, leaves: () => ['#a8d080', '#efe4cc', '#efe4cc', '#c89a70'] },
  weeds: { zone: { x: -9, y: -12, w: 18, h: 15 }, h: 14, amp: 2.4, leafY: -8, spread: 10, leaves: () => ['#a8d878', '#f6f2e8', '#f6f2e8', '#ffd050'] },
  tree: { zone: { x: -8, y: -9, w: 16, h: 11 }, h: 60, amp: 1.6, leafY: -34, spread: 30, leaves: leavesNow, behind: { x: -16, y: -26, w: 32, h: 18 } },
  'tree-pine': { zone: { x: -8, y: -9, w: 16, h: 11 }, h: 64, amp: 1.3, leafY: -30, spread: 18, leaves: () => (getSeason() === 'winter' ? SEASON_LEAVES.winter : ['#7aa878', '#a8c890', '#c8946a']), behind: { x: -11, y: -20, w: 22, h: 12 } },
  'tree-blossom': { zone: { x: -8, y: -9, w: 16, h: 11 }, h: 54, amp: 1.6, leafY: -30, spread: 28, leaves: () => (getSeason() === 'spring' ? BLOSSOM : leavesNow()), behind: { x: -15, y: -22, w: 30, h: 14 } },
};

interface Shake {
  t: number;
  amp: number;
  /** Hedges: the world x of the touch (only that stretch bends). */
  at?: number;
  /** Squash-before-break (pickups): seconds long. */
  squash?: number;
}

/** Which way and how much to draw an object right now. */
export interface Bend {
  /** Shear: px of lean per px of height (positive leans right). */
  shear: number;
  sx: number;
  sy: number;
  /** Hedges: bend only around this world x. */
  at?: number;
}

export class Foliage {
  private shakes = new Map<string, Shake>();
  /** actor|object -> seconds since the last rustle while still in contact. */
  private touching = new Map<string, number>();
  private plants: MapObject[] = [];
  private mapId = '';
  private gustSeen = new Map<string, number>();
  private gustId = 0;
  private lastGust = -1;

  private index(map: GameMap): void {
    if (this.mapId === map.id) return;
    this.mapId = map.id;
    this.plants = map.objects.filter((o) => PLANTS[o.kind]);
    this.shakes.clear();
    this.touching.clear();
  }

  /** Start a wobble on an object (amp in px at the top). */
  shake(o: MapObject, amp: number, at?: number): void {
    const s = this.shakes.get(o.id);
    // Don't restart a bigger wobble that's still going with a smaller one.
    if (s && !s.squash && s.t < 0.15 && Math.abs(s.amp) > Math.abs(amp)) return;
    this.shakes.set(o.id, { t: 0, amp, at });
  }

  /** Squash and shiver for `dur` seconds (an object about to come loose). */
  squash(o: MapObject, dur = 0.15): void {
    this.shakes.set(o.id, { t: 0, amp: 1, squash: dur });
  }

  update(dt: number, map: GameMap, actors: Actor[], player: Actor, steps: StepFx, gust: { front: number; strength: number; camX: number }): void {
    this.index(map);
    for (const [id, s] of this.shakes) {
      s.t += dt;
      if (s.t > (s.squash ?? 1.2)) this.shakes.delete(id);
    }
    const seen = new Set<string>();
    for (const a of actors) {
      if (!a.visible) continue;
      const fb = a.box();
      for (const o of this.plants) {
        if (o.hidden) continue;
        const p = PLANTS[o.kind];
        if (Math.abs(o.x - a.x) > 260 || Math.abs(o.y - a.y) > 40) continue;
        const z = this.zone(o, p);
        let touch = overlap(fb, z, 2);
        let soft = false;
        if (!touch && p.behind) {
          touch = overlap(fb, { x: o.x + p.behind.x, y: o.y + p.behind.y, w: p.behind.w, h: p.behind.h }, 0);
          soft = true;
        }
        if (!touch) continue;
        const key = a.id + '|' + o.id;
        seen.add(key);
        const since = this.touching.get(key);
        const dir = a.facing === 'left' ? -1 : a.facing === 'right' ? 1 : a.x < o.x ? 1 : -1;
        const speed = a.running ? 1.3 : 1;
        if (since === undefined) {
          // First contact: a proper rustle.
          this.touching.set(key, 0);
          if (!a.moving) continue;
          this.rustle(o, p, dir * speed * (soft ? 0.6 : 1), a.x, steps, a === player ? (soft ? 0.5 : 1) : 0, soft ? 1 : 2 + (Math.random() < 0.5 ? 1 : 0));
        } else {
          const t = since + dt;
          this.touching.set(key, t);
          // Pushing on through (or into it): keep it rustling. Walking along a hedge only rustles once.
          const into = soft || o.kind === 'reeds' || (a.facing === 'up' && a.y > o.y - 6) || (a.facing === 'down' && a.y < o.y - 8) || (o.kind !== 'hedge' && (a.facing === 'left' ? a.x > o.x : a.facing === 'right' ? a.x < o.x : false));
          if (a.moving && into && t > 0.38) {
            this.touching.set(key, 0);
            this.rustle(o, p, dir * 0.7 * speed * (soft ? 0.6 : 1), a.x, steps, a === player ? 0.5 : 0, Math.random() < 0.5 ? 1 : 0);
          }
        }
      }
    }
    for (const k of this.touching.keys()) if (!seen.has(k)) this.touching.delete(k);
    // A gust bends each plant as its leading edge passes.
    if (gust.front >= 0) {
      if (this.lastGust < 0) this.gustId++;
      const fx = gust.camX + gust.front;
      for (const o of this.plants) {
        if (o.hidden || Math.abs(o.x - fx) > 10) continue;
        if (this.gustSeen.get(o.id) === this.gustId) continue;
        this.gustSeen.set(o.id, this.gustId);
        const p = PLANTS[o.kind];
        this.shake(o, p.amp * (0.6 + gust.strength * 0.7), o.kind === 'hedge' ? fx : undefined);
        if (Math.random() < 0.35 * gust.strength) steps.leaves(o.x, o.y + p.leafY, p.leaves(), 1, p.spread, o.y + 2, 2.5);
      }
    }
    this.lastGust = gust.front;
  }

  private zone(o: MapObject, p: Plant): Box {
    if (o.kind === 'hedge') {
      const n = Math.max(1, Math.floor(Number(o.props.w ?? 3)));
      return { x: o.x - n * 8, y: o.y - 16, w: n * 16, h: 19 };
    }
    const z = p.zone!;
    return { x: o.x + z.x, y: o.y + z.y, w: z.w, h: z.h };
  }

  private rustle(o: MapObject, p: Plant, dir: number, ax: number, steps: StepFx, vol: number, leaves: number): void {
    this.shake(o, p.amp * dir, o.kind === 'hedge' ? ax : undefined);
    const lx = o.kind === 'hedge' ? ax : o.x;
    if (leaves > 0) steps.leaves(lx, o.y + p.leafY, p.leaves(), leaves, p.spread, o.y + 1, dir);
    if (vol > 0) audio.sfx('rustle', { volume: 0.3 * vol, pitch: (o.kind.startsWith('tree') ? 0.8 : 1) + Math.random() * 0.2 });
  }

  /** How to bend `o` this frame, or null to draw it as is. */
  bend(o: MapObject): Bend | null {
    const s = this.shakes.get(o.id);
    if (!s) return null;
    if (s.squash) {
      // Squash down, stretch up, shiver; the object pops free at the end.
      const k = s.t / s.squash;
      const sq = Math.sin(Math.min(1, k) * Math.PI);
      return { shear: Math.sin(s.t * 70) * 0.05, sx: 1 + 0.12 * sq, sy: 1 - 0.16 * sq + (k > 0.7 ? 0.24 * (k - 0.7) / 0.3 : 0), at: undefined };
    }
    const p = PLANTS[o.kind];
    const lean = wobble(s.t, s.amp, o.kind.startsWith('tree') ? 30 : 24, o.kind.startsWith('tree') ? 8 : 6.5);
    if (Math.abs(lean) < 0.06) return null;
    return { shear: lean / (p?.h ?? 16), sx: 1, sy: 1, at: s.at };
  }

  /** True if anything is mid-wobble (lets callers skip work). */
  get busy(): boolean {
    return this.shakes.size > 0;
  }
}

function overlap(a: Box, b: Box, pad: number): boolean {
  return a.x < b.x + b.w + pad && a.x + a.w > b.x - pad && a.y < b.y + b.h + pad && a.y + a.h > b.y - pad;
}
