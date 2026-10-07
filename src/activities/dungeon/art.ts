/**
 * Dungeon art, drawn with the pixel kit in the Golden Hour Storybook style:
 * hue-shifted shading, selective outlines, plum ink (never black). Every
 * sprite is built once and cached; the room's floor and walls are baked into
 * a single canvas per floor.
 */
import { AK, circ, col, curve, DS, dth, ell, hash2, HL, liA, mixc, mkSpr, OUT, P, poly, R, RR, selA, shA, toCanvas, VL, type Color, type Spr } from '../../gfx/kit';
import { FT, T, TC, TW } from '../../gfx/font';
import type { DecorKind, EraId, NodeKind } from './eras';
import { T_FLOOR, tileAt, type FloorPlan } from './gen';

export interface Built {
  c: HTMLCanvasElement;
  /** Offset from the anchor (bottom-centre) to the canvas top-left. */
  ox: number;
  oy: number;
  /** Body height (for hit tests). */
  h: number;
}

const PAD = 4;
const CACHE = new Map<string, Built>();
/** Plum shadow pixel with alpha (buffers are ABGR). */
const SH = (a: number) => ((a << 24) | (0x40 << 16) | (0x21 << 8) | 0x2b) >>> 0;
export const plum = AK;

function build(key: string, w: number, h: number, body: () => void, shadow: [number, number, number, number] | null = [w / 2, h - 1, w / 2, 3], outline = true): Built {
  const hit = CACHE.get(key);
  if (hit) return hit;
  let s: Spr = mkSpr(w, h, body);
  if (outline) s = OUT(s, selA);
  const off = outline ? 1 : 0;
  const W = w + PAD * 2;
  const H = h + PAD * 2;
  const fin = mkSpr(W, H, () => {
    if (shadow) {
      const [cx, cy, rx, ry] = shadow;
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const dx = (x + 0.5 - cx - PAD) / rx;
          const dy = (y + 0.5 - cy - PAD) / ry;
          const d = dx * dx + dy * dy;
          if (d <= 1) P(x, y, SH(d > 0.6 ? (dth(x, y, 8) ? 70 : 0) : 90));
        }
    }
    DS(s, PAD - off, PAD - off);
  });
  const b: Built = { c: toCanvas(fin), ox: -Math.floor(w / 2) - PAD, oy: -h - PAD, h };
  CACHE.set(key, b);
  return b;
}

// ------------------------------------------------------------------ shared bits

const IRON = '#565070';
const IRON_L = '#8a86a4';
const LEATHER = '#a24a3c';
const CANVAS = '#d8c8a0';
const ROPE = '#d8b878';
const GOLD = '#f4b63f';
const GOLD_L = '#ffe48e';

function ropeV(x: number, y0: number, y1: number, c = ROPE): void {
  for (let y = y0; y <= y1; y++) {
    P(x, y, (y & 3) < 2 ? c : shA(c, 0.25));
    P(x + 1, y, (y & 3) < 2 ? shA(c, 0.25) : liA(c, 0.2));
  }
}
function bell(cx: number, by: number, c: Color): void {
  // a kettlebell sitting on the floor at by
  ell(cx, by - 4, 5, 4.5, c);
  RR(cx - 3, by - 12, 7, 5, 2, c);
  R(cx - 1, by - 10, 3, 2, 0);
  ell(cx - 2, by - 6, 1.5, 1.5, liA(c, 0.35));
  HL(cx - 3, cx + 3, by - 1, shA(c, 0.3));
}

// ------------------------------------------------------------------ equipment

type Body = { w: number; h: number; draw: () => void; shadow?: [number, number, number, number] | null };

const NODE_ART: Record<NodeKind, () => Body> = {
  'heavy-bag': () => ({
    w: 14, h: 36,
    shadow: [7, 34, 6, 2],
    draw: () => {
      VL(7, 0, 5, '#9a96b4');
      VL(6, 1, 4, '#6a6688');
      R(4, 5, 7, 2, IRON);
      RR(2, 7, 11, 24, 3, LEATHER);
      R(3, 8, 2, 21, liA(LEATHER, 0.3));
      R(10, 8, 2, 21, shA(LEATHER, 0.25));
      R(2, 11, 11, 2, '#efe6d2');
      R(2, 25, 11, 2, '#efe6d2');
      P(4, 11, '#fffaf0');
      R(5, 16, 5, 4, shA(LEATHER, 0.12));
    },
  }),
  'tire-stack': () => ({
    w: 22, h: 21,
    draw: () => {
      for (let i = 0; i < 3; i++) {
        const y = 15 - i * 5;
        ell(11, y, 10.5, 4.5, '#4a4258');
        for (let x = 2; x < 21; x += 2) P(x, y + 3, '#3a3448');
        HL(2, 20, y - 1, '#6a6280');
      }
      ell(11, 5, 4.5, 1.8, '#2e2a3c');
      P(5, 4, '#8a84a0');
    },
  }),
  'dumbbell-rack': () => ({
    w: 30, h: 17,
    draw: () => {
      R(1, 10, 28, 3, '#9a6a48');
      HL(1, 28, 10, '#c08a5c');
      VL(3, 10, 16, '#7a5038');
      VL(26, 10, 16, '#7a5038');
      R(1, 4, 28, 2, '#8a5a40');
      const cs = ['#d8434b', '#3f74d8', '#2fa59a', '#f4b63f'];
      for (let i = 0; i < 4; i++) {
        const x = 3 + i * 7;
        HL(x, x + 4, 8, IRON_L);
        R(x - 1, 6, 2, 4, cs[i]);
        R(x + 4, 6, 2, 4, cs[i]);
        HL(x, x + 4, 2, IRON_L);
        R(x - 1, 0, 2, 4, shA(cs[i], 0.2));
        R(x + 4, 0, 2, 4, shA(cs[i], 0.2));
      }
    },
  }),
  'medicine-ball': () => ({
    w: 12, h: 12,
    draw: () => {
      circ(6, 6, 5.5, '#8a5a3a');
      ell(5, 5, 3, 3, '#a8704a');
      VL(6, 1, 11, '#5e3a2e');
      curve(1, 6, 11, 6, 2, '#5e3a2e');
      P(4, 3, '#e8c09a');
    },
  }),
  'rope-climb': () => ({
    w: 12, h: 48,
    shadow: [6, 46, 6, 2],
    draw: () => {
      ropeV(5, 0, 40);
      for (const y of [12, 22, 32]) R(4, y, 4, 3, shA(ROPE, 0.15));
      ell(6, 44, 5.5, 3, ROPE);
      ell(6, 43, 3, 1.5, shA(ROPE, 0.3));
    },
  }),
  sandbag: () => ({
    w: 16, h: 11,
    draw: () => {
      RR(1, 2, 14, 9, 3, '#b8a070');
      R(2, 3, 12, 2, liA('#b8a070', 0.3));
      R(7, 0, 2, 3, '#7a6a48');
      HL(3, 12, 9, shA('#b8a070', 0.25));
      R(4, 5, 8, 2, '#8a7650');
    },
  }),
  kettlebell: () => ({ w: 12, h: 13, draw: () => bell(6, 13, '#4e4660') }),
  'gilded-kettlebell': () => ({
    w: 12, h: 13,
    draw: () => {
      bell(6, 13, GOLD);
      P(3, 6, '#fff8d8');
    },
  }),
  'rowing-machine': () => ({
    w: 30, h: 14,
    draw: () => {
      R(2, 9, 26, 2, IRON_L);
      HL(2, 27, 11, IRON);
      circ(24, 7, 5, '#3f74d8');
      circ(24, 7, 2, '#9ac0f0');
      RR(8, 6, 7, 3, 1, '#d8434b');
      R(2, 11, 2, 3, IRON);
      R(26, 11, 2, 3, IRON);
      HL(18, 22, 5, '#2b2140');
      R(16, 4, 2, 4, '#c8c4dc');
    },
  }),
  'chalk-bucket': () => ({
    w: 12, h: 12,
    draw: () => {
      poly([[1, 4], [11, 4], [10, 12], [2, 12]], '#9a9ab0');
      R(2, 5, 2, 6, '#c8c8d8');
      ell(6, 4, 5, 2, '#f6f6f6');
      ell(6, 3, 3, 1.5, '#ffffff');
      HL(1, 10, 7, '#7a7a90');
    },
  }),
  'high-striker': () => ({
    w: 16, h: 50,
    shadow: [8, 48, 7, 2],
    draw: () => {
      R(6, 6, 4, 40, '#f2e2c4');
      for (let y = 8; y < 44; y += 4) HL(6, 9, y, y < 18 ? '#d8434b' : y < 32 ? GOLD : '#2fa59a');
      VL(10, 6, 45, shA('#f2e2c4', 0.3));
      circ(8, 4, 4, GOLD);
      ell(7, 3, 2, 1.5, GOLD_L);
      R(2, 45, 12, 4, '#9a6a48');
      HL(2, 13, 45, '#c08a5c');
      R(7, 40, 3, 4, '#d8434b');
      L2(13, 30, 15, 46, '#7a5038');
      R(12, 28, 4, 3, '#8a8aa0');
    },
  }),
  'globe-barbell': () => ({
    w: 30, h: 17,
    draw: () => {
      R(5, 13, 3, 4, '#7a5038');
      R(22, 13, 3, 4, '#7a5038');
      HL(4, 25, 8, IRON_L);
      HL(4, 25, 9, IRON);
      circ(4, 8, 4.5, '#3a3448');
      circ(26, 8, 4.5, '#3a3448');
      P(3, 6, '#8a86a4');
      P(25, 6, '#8a86a4');
      T('1000', 11, 11, GOLD, FT);
    },
  }),
  'club-bells': () => ({
    w: 14, h: 20,
    draw: () => {
      R(1, 16, 12, 4, '#7a5038');
      HL(1, 12, 16, '#a87050');
      for (let i = 0; i < 3; i++) {
        const x = 3 + i * 4;
        ell(x, 11, 1.8, 4.5, '#f2e2c4');
        R(x - 1, 2, 2, 6, '#f2e2c4');
        HL(x - 1, x + 1, 9, '#d8434b');
        HL(x - 1, x + 1, 12, '#d8434b');
        P(x - 1, 1, '#c8b090');
      }
    },
  }),
  'grapple-dummy': () => ({
    w: 14, h: 28,
    draw: () => {
      R(6, 22, 2, 4, '#7a5038');
      R(3, 26, 8, 2, '#7a5038');
      RR(3, 9, 8, 13, 2, CANVAS);
      R(0, 10, 3, 8, CANVAS);
      R(11, 10, 3, 8, CANVAS);
      circ(7, 5, 4, CANVAS);
      P(5, 4, AK);
      P(8, 4, AK);
      HL(5, 8, 7, '#8a6a4a');
      VL(7, 10, 20, '#a89070');
      for (let y = 11; y < 21; y += 2) P(6, y, '#a89070');
    },
  }),
  'pulley-weights': () => ({
    w: 14, h: 36,
    draw: () => {
      R(1, 0, 2, 36, IRON);
      R(11, 0, 2, 36, IRON);
      HL(1, 12, 0, IRON_L);
      circ(7, 3, 2, IRON_L);
      VL(7, 5, 18, '#e8e4d8');
      for (let i = 0; i < 6; i++) R(3, 22 + i * 2, 8, 2, i & 1 ? '#3a3448' : '#4e4660');
      R(5, 18, 4, 2, '#d8434b');
      HL(3, 10, 34, '#7a5038');
    },
  }),
  'ring-post': () => ({
    w: 16, h: 32,
    draw: () => {
      R(6, 2, 4, 30, '#c8c4dc');
      VL(9, 2, 31, '#8a86a4');
      for (const [y, c] of [[6, '#d8434b'], [13, '#f6f0f4'], [20, '#3f74d8']] as [number, string][]) {
        RR(4, y, 8, 5, 1, c);
        HL(0, 3, y + 2, c);
        HL(12, 15, y + 2, c);
      }
    },
  }),
  'speed-bag': () => ({
    w: 14, h: 28,
    draw: () => {
      R(0, 0, 14, 3, '#9a6a48');
      HL(0, 13, 0, '#c08a5c');
      ell(7, 8, 3.5, 5, LEATHER);
      ell(6, 6, 1.5, 2.5, liA(LEATHER, 0.35));
      VL(7, 3, 4, IRON);
      R(6, 13, 2, 15, IRON);
      R(3, 26, 8, 2, IRON);
    },
  }),
  'jump-rope': () => ({
    w: 12, h: 22,
    draw: () => {
      R(5, 2, 2, 20, '#7a5038');
      R(2, 20, 8, 2, '#7a5038');
      HL(3, 8, 3, IRON_L);
      curve(3, 4, 9, 4, 13, '#d8434b');
      R(2, 4, 2, 4, '#3a3448');
      R(8, 4, 2, 4, '#3a3448');
    },
  }),
  'ring-corner': () => ({
    w: 24, h: 32,
    draw: () => {
      R(2, 4, 4, 28, '#d8434b');
      VL(5, 4, 31, shA('#d8434b', 0.3));
      for (let i = 0; i < 3; i++) {
        const y = 9 + i * 7;
        RR(1, y - 1, 6, 4, 1, '#f6f0f4');
        HL(7, 23, y + 1, '#f6f0f4');
        HL(7, 23, y + 2, '#c8c4dc');
      }
      R(14, 26, 6, 2, '#9a6a48');
      R(15, 28, 1, 4, '#7a5038');
      R(18, 28, 1, 4, '#7a5038');
    },
  }),
  'step-deck': () => ({
    w: 20, h: 9,
    draw: () => {
      RR(1, 0, 18, 5, 2, '#5ed8c8');
      HL(2, 17, 1, '#a8f0e4');
      R(1, 5, 4, 4, '#ff7aa8');
      R(15, 5, 4, 4, '#ff7aa8');
      R(5, 5, 10, 2, '#3a9a92');
    },
  }),
  boombox: () => ({
    w: 18, h: 12,
    draw: () => {
      RR(0, 3, 18, 9, 2, '#b8b4c8');
      HL(4, 13, 0, '#8a86a4');
      VL(4, 0, 3, '#8a86a4');
      VL(13, 0, 3, '#8a86a4');
      circ(4, 8, 3, '#3a3448');
      circ(14, 8, 3, '#3a3448');
      circ(4, 8, 1, '#ff5d8f');
      circ(14, 8, 1, '#5ed8f8');
      R(7, 5, 4, 3, '#2b2140');
      HL(7, 10, 9, '#ff5d8f');
    },
  }),
  'exercise-bike': () => ({
    w: 18, h: 20,
    draw: () => {
      circ(5, 14, 5, '#ff7aa8');
      circ(5, 14, 2, '#ffd0e0');
      L2(5, 14, 12, 6, '#e85d98');
      L2(12, 6, 14, 19, '#e85d98');
      R(10, 4, 5, 2, '#2b2140');
      R(14, 0, 2, 5, '#c8c4dc');
      HL(13, 17, 0, '#5ed8c8');
      R(2, 19, 15, 1, '#b8b4c8');
    },
  }),
  'sledge-tire': () => ({
    w: 32, h: 18,
    draw: () => {
      ell(14, 11, 13, 6.5, '#3a3448');
      ell(14, 10, 12, 5.5, '#4a4258');
      ell(14, 10, 6, 2.5, '#2b2140');
      for (let x = 3; x < 26; x += 3) P(x, 15, '#2e2a3c');
      L2(24, 0, 29, 16, '#9a6a48');
      R(21, 0, 7, 4, IRON);
      HL(21, 27, 0, IRON_L);
    },
  }),
  'chain-drape': () => ({
    w: 16, h: 32,
    draw: () => {
      R(0, 0, 16, 3, '#7a5038');
      R(0, 3, 2, 29, '#7a5038');
      R(14, 3, 2, 29, '#7a5038');
      for (const x of [4, 8, 11]) for (let y = 3; y < 26 - (x & 3) * 2; y += 3) {
        P(x, y, IRON_L);
        P(x, y + 1, IRON);
        P(x + ((y >> 1) & 1), y + 2, IRON_L);
      }
    },
  }),
  'cinder-blocks': () => ({
    w: 16, h: 15,
    draw: () => {
      for (const [x, y] of [[0, 8], [8, 8], [4, 1]] as [number, number][]) {
        R(x, y, 8, 7, '#a8a4b0');
        HL(x, x + 7, y, '#c8c4d0');
        R(x + 1, y + 2, 2, 3, '#6a6676');
        R(x + 5, y + 2, 2, 3, '#6a6676');
      }
      R(9, 10, 5, 2, '#ff5d8f');
    },
  }),
  'rattling-locker': () => ({
    w: 12, h: 32,
    draw: () => {
      R(0, 0, 12, 32, '#5a8a8a');
      R(1, 1, 10, 30, '#6a9e9a');
      for (let y = 3; y < 9; y += 2) HL(3, 8, y, '#3e6464');
      R(9, 14, 1, 4, '#c8c4dc');
      R(10, 1, 1, 30, '#2b2140');
      VL(11, 2, 30, '#7affd4');
      T('13', 3, 22, '#e8e4d8', FT);
    },
  }),
  'towel-cart': () => ({
    w: 16, h: 18,
    draw: () => {
      R(1, 6, 14, 10, '#8a86a4');
      for (let x = 2; x < 15; x += 2) VL(x, 7, 15, '#b8b4c8');
      for (let i = 0; i < 3; i++) RR(2 + i * 4, 1 + (i & 1), 5, 6, 1, ['#f6f0f4', '#ff9ec0', '#9ad8f0'][i]);
      circ(3, 17, 1, '#2b2140');
      circ(13, 17, 1, '#2b2140');
    },
  }),
  'trophy-heap': () => ({
    w: 16, h: 16,
    draw: () => {
      ell(8, 13, 7.5, 3, '#c27a1e');
      for (const [x, y, s] of [[4, 6, 1], [11, 4, 1], [8, 2, 0]] as [number, number, number][]) {
        R(x - 1, y + 4, 3, 4, GOLD);
        ell(x, y + 2, 2.5 + s, 2.5, GOLD);
        P(x - 1, y + 1, GOLD_L);
        R(x - 2, y + 8, 5, 2, '#8a5a3a');
      }
      P(13, 11, '#fff8d8');
    },
  }),
};

function L2(x0: number, y0: number, x1: number, y1: number, c: Color): void {
  // 2px thick line
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= n; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / n);
    const y = Math.round(y0 + ((y1 - y0) * i) / n);
    P(x, y, c);
    P(x + 1, y, shA(c, 0.2));
  }
}

export function nodeSprite(kind: NodeKind): Built {
  const b = NODE_ART[kind]();
  return build(`node:${kind}`, b.w, b.h, b.draw, b.shadow === undefined ? [b.w / 2, b.h - 1, b.w / 2 + 1, 3] : b.shadow);
}

// ------------------------------------------------------------------ props

const PROP_ART: Record<DecorKind, (era: EraId, seed: number) => Body> = {
  barrel: () => ({ w: 12, h: 15, draw: () => {
    RR(0, 0, 12, 15, 3, '#9a6a48');
    R(2, 1, 2, 13, '#c08a5c');
    HL(0, 11, 3, IRON);
    HL(0, 11, 11, IRON);
    ell(6, 1, 5, 1.5, '#7a5038');
  } }),
  'hay-bale': () => ({ w: 16, h: 11, draw: () => {
    R(0, 2, 16, 9, '#e0c070');
    for (let x = 1; x < 16; x += 2) VL(x, 3, 10, '#c8a050');
    HL(0, 15, 2, '#f0d890');
    VL(5, 2, 10, '#9a6a48');
    VL(11, 2, 10, '#9a6a48');
  } }),
  pedestal: (_e, seed) => ({ w: 14, h: 12, draw: () => {
    if (seed === 31) {
      // the Golden Belt's pedestal
      R(2, 3, 10, 9, '#5a3a6a');
      R(1, 1, 12, 3, GOLD);
      HL(1, 12, 1, GOLD_L);
      R(3, 6, 8, 1, '#7a5a8a');
      return;
    }
    ell(7, 3, 6.5, 2.5, '#f2e2c4');
    R(1, 3, 12, 8, '#d8434b');
    for (let x = 2; x < 13; x += 4) R(x, 3, 2, 8, '#f2e2c4');
    HL(1, 12, 10, '#9c2537');
    ell(7, 3, 6.5, 2.5, GOLD);
    ell(7, 2, 4, 1.2, GOLD_L);
  } }),
  bench: () => ({ w: 16, h: 9, draw: () => {
    R(0, 2, 16, 3, '#9a6a48');
    HL(0, 15, 2, '#c08a5c');
    R(1, 5, 2, 4, '#7a5038');
    R(13, 5, 2, 4, '#7a5038');
    R(5, 3, 6, 1, '#f6f0f4');
  } }),
  'water-cooler': () => ({ w: 10, h: 22, draw: () => {
    R(1, 9, 8, 13, '#e8e4d8');
    R(2, 10, 2, 10, '#ffffff');
    ell(5, 5, 4, 5, '#9ad8f0');
    ell(4, 4, 1.5, 2.5, '#d8f4ff');
    R(4, 13, 2, 2, '#3f74d8');
  } }),
  'stool-bucket': () => ({ w: 14, h: 12, draw: () => {
    R(1, 3, 8, 2, '#9a6a48');
    VL(2, 5, 11, '#7a5038');
    VL(8, 5, 11, '#7a5038');
    poly([[9, 6], [14, 6], [13, 12], [10, 12]], '#9a9ab0');
    ell(11.5, 6, 2.5, 1, '#6ac0e0');
    R(2, 0, 5, 3, '#f6f0f4');
  } }),
  'potted-palm': () => ({ w: 14, h: 24, draw: () => {
    poly([[3, 16], [11, 16], [10, 24], [4, 24]], '#ff7aa8');
    HL(3, 10, 17, '#ffb0c8');
    for (const [dx, dy] of [[-6, -3], [6, -4], [-4, -8], [5, -9], [0, -11]]) {
      L2(7, 16, 7 + dx, 8 + dy, '#3fae7a');
      ell(7 + dx, 8 + dy, 2.5, 1.5, '#5ed89a');
    }
  } }),
  'vhs-stack': () => ({ w: 10, h: 13, draw: () => {
    for (let i = 0; i < 5; i++) {
      R(0 + (i & 1), 10 - i * 2.5, 9, 3, ['#2b2140', '#3a3448'][i & 1]);
      R(2 + (i & 1), 11 - i * 2.5, 5, 1, ['#ff5d8f', '#5ed8f8', '#f4b63f', '#fbf0d9', '#b27ae0'][i]);
    }
  } }),
  couch: () => ({ w: 18, h: 14, draw: () => {
    R(0, 4, 18, 10, '#6a7a3a');
    R(2, 1, 14, 6, '#7a8a4a');
    for (let x = 1; x < 18; x += 3) VL(x, 5, 13, '#8a9a5a');
    for (let y = 5; y < 14; y += 3) HL(0, 17, y, '#5a6a32');
    R(0, 4, 3, 10, '#5a6a32');
    R(15, 4, 3, 10, '#5a6a32');
  } }),
  'mini-fridge': () => ({ w: 11, h: 15, draw: () => {
    RR(0, 0, 11, 15, 1, '#e8e4d8');
    HL(0, 10, 5, '#a8a4b8');
    R(8, 2, 1, 2, '#8a86a4');
    R(8, 7, 1, 3, '#8a86a4');
    R(2, 8, 4, 3, '#ff5d8f');
  } }),
  'tv-cart': () => ({ w: 16, h: 22, draw: () => {
    R(1, 12, 14, 2, IRON);
    VL(2, 14, 21, IRON);
    VL(13, 14, 21, IRON);
    RR(0, 0, 16, 12, 2, '#4a4258');
    R(2, 2, 10, 8, '#8ab0c0');
    for (let y = 2; y < 10; y++) for (let x = 2; x < 12; x++) if (hash2(x, y, 9) < 0.4) P(x, y, '#c8e0e8');
    R(13, 3, 2, 2, '#d8434b');
  } }),
  'towel-pile': () => ({ w: 14, h: 9, draw: () => {
    RR(0, 4, 14, 5, 2, '#f6f0f4');
    RR(2, 1, 10, 4, 2, '#9ad8f0');
    HL(1, 12, 6, '#d8d4e4');
  } }),
  candelabra: () => ({ w: 10, h: 24, draw: () => {
    R(4, 8, 2, 14, GOLD);
    R(2, 21, 6, 3, '#c27a1e');
    HL(1, 8, 9, GOLD);
    for (const x of [1, 4, 8]) {
      R(x, 4, 2, 5, '#f6f0f4');
    }
  } }),
  pillar: (era, seed) => ({ w: 14, h: 44, shadow: [7, 43, 7, 2.5], draw: () => pillarArt(seed === 30 ? 'golden' : era) }),
  crate: () => ({ w: 12, h: 12, draw: () => {
    R(0, 0, 12, 12, '#b07a50');
    R(1, 1, 10, 10, '#c48a5c');
    L2(1, 1, 9, 10, '#9a6a48');
    HL(0, 11, 0, '#d8a070');
  } }),
  camcorder: () => ({ w: 12, h: 22, draw: () => {
    L2(6, 9, 1, 21, '#3a3448');
    L2(6, 9, 10, 21, '#3a3448');
    VL(6, 9, 21, '#4a4258');
    RR(1, 2, 10, 7, 1, '#3a3448');
    R(9, 3, 3, 4, '#4a4258');
    circ(11, 5, 1.5, '#8ab0c0');
    P(2, 3, '#ff3d5a');
  } }),
};

function pillarArt(era: EraId | 'golden'): void {
  switch (era) {
    case 'carnival':
      R(5, 0, 4, 44, '#c08a5c');
      VL(5, 0, 43, '#e0aa74');
      VL(8, 0, 43, '#8a5a40');
      for (let y = 4; y < 40; y += 8) HL(5, 8, y, '#d8434b');
      L2(0, 44, 5, 8, ROPE);
      L2(13, 44, 8, 8, ROPE);
      break;
    case 'boxing':
      R(2, 0, 10, 44, '#a84a40');
      for (let y = 0; y < 44; y += 4) {
        HL(2, 11, y, '#6a4a4a');
        VL(y & 4 ? 6 : 9, y, y + 3, '#6a4a4a');
      }
      R(3, 16, 8, 10, '#f2e2c4');
      T('GYM', 3, 18, '#d8434b', FT);
      break;
    case 'aerobics':
      R(2, 0, 10, 44, '#c8d0e8');
      L2(3, 40, 10, 4, '#ffffff');
      VL(2, 0, 43, '#ff7aa8');
      VL(11, 0, 43, '#5ed8f8');
      break;
    case 'haunted':
      R(3, 0, 8, 44, '#b8b0c4');
      VL(4, 0, 43, '#d8d0e0');
      R(1, 0, 12, 3, '#9a92a8');
      R(1, 41, 12, 3, '#9a92a8');
      L2(9, 10, 6, 22, '#6a6278');
      break;
    case 'golden':
      R(5, 0, 5, 44, GOLD);
      VL(5, 0, 43, GOLD_L);
      VL(9, 0, 43, '#c27a1e');
      for (let i = 0; i < 3; i++) RR(3, 10 + i * 8, 9, 5, 1, ['#d8434b', '#fbf0d9', '#3f74d8'][i]);
      break;
    default:
      // territory and garage: a steel column with rivets (and graffiti in the garage)
      R(4, 0, 6, 44, '#7a8494');
      VL(4, 0, 43, '#a8b0c0');
      VL(9, 0, 43, '#5a6070');
      R(2, 0, 10, 3, '#5a6070');
      R(2, 41, 10, 3, '#5a6070');
      for (let y = 6; y < 40; y += 6) P(7, y, '#c8d0dc');
      if (era === 'garage') {
        R(4, 18, 6, 2, '#ff5d8f');
        R(5, 22, 5, 2, '#5ed8f8');
      }
  }
}

export function propSprite(kind: DecorKind, era: EraId, seed: number): Built {
  const b = PROP_ART[kind](era, seed);
  const key = `prop:${kind}:${kind === 'pillar' || kind === 'pedestal' ? era + (seed === 30 || seed === 31 ? seed : '') : ''}`;
  return build(key, b.w, b.h, b.draw, b.shadow === undefined ? [b.w / 2, b.h - 1, b.w / 2 + 1, 3] : b.shadow);
}

// ------------------------------------------------------------------ small sprites

export function trapdoorSprite(open: number): Built {
  const k = Math.round(open * 3);
  return build(`trap:${k}`, 16, 16, () => {
    R(0, 0, 16, 16, '#5a3a2e');
    R(1, 1, 14, 14, '#1a1226');
    if (k < 3) {
      // the lid swinging open
      const h = 14 - k * 4;
      R(1, 15 - h, 14, h, '#9a6a48');
      for (let x = 2; x < 15; x += 4) VL(x, 15 - h, 14, '#7a5038');
      R(6, 15 - Math.ceil(h / 2), 4, 1, GOLD);
    } else {
      for (let y = 2; y < 15; y += 3) HL(4, 11, y, '#6a4a3a');
      VL(4, 2, 14, '#7a5a48');
      VL(11, 2, 14, '#7a5a48');
      ell(8, 9, 4, 3, (x, y) => (dth(x, y, 6) ? '#f4b63f' : null));
    }
  }, null, false);
}

export function ropeLadder(): Built {
  return build('rope-up', 12, 70, () => {
    ropeV(1, 0, 66);
    ropeV(9, 0, 66);
    for (let y = 6; y < 66; y += 7) HL(2, 8, y, '#a87850');
    ell(6, 68, 6, 2, ROPE);
  }, [6, 69, 7, 2]);
}

/** The Golden Belt itself. */
export function beltSprite(): Built {
  return build('golden-belt', 26, 12, () => {
    RR(0, 3, 26, 6, 2, '#8a4a2a');
    HL(1, 24, 4, '#a85e36');
    RR(7, 0, 12, 12, 3, GOLD);
    RR(8, 1, 10, 10, 2, GOLD_L);
    ell(13, 6, 3.5, 3.5, GOLD);
    P(13, 3, '#ffffff');
    circ(13, 6, 1.4, '#ff5d8f');
    R(3, 5, 2, 2, GOLD);
    R(21, 5, 2, 2, GOLD);
  }, null);
}

// ------------------------------------------------------------------ text sprites

const TEXT = new Map<string, HTMLCanvasElement>();
/** Pixel text with a plum outline, cached. big = proportional font, else tiny caps. */
export function textSprite(s: string, color: string, big = true, outline: string = AK): HTMLCanvasElement {
  const key = `${s}|${color}|${big}|${outline}`;
  const hit = TEXT.get(key);
  if (hit) return hit;
  const f = big ? undefined : FT;
  const w = TW(s, f ?? undefined) + 4;
  const h = (big ? 10 : 7) + 2;
  const c = toCanvas(mkSpr(w, h, () => T(s, 2, 2, color, f, { outline, bold: big })));
  TEXT.set(key, c);
  return c;
}

// ------------------------------------------------------------------ room baking

interface EraLook {
  floor: (x: number, y: number) => Color;
  face: (x: number, r: number) => Color; // r = px above the floor line (1..32)
  crown: (x: number, r: number) => Color; // r = 1..16 above the face
  cap: string;
  /** Void color around the room. */
  outside: string;
  /** Darkness tint for lighting. */
  dark: string;
  /** Torch light color. */
  light: string;
  /** Flat decoration on the floor. */
  flat: (x: number, y: number, fx: number, fy: number, fw: number, fh: number, seed: number) => Color | null;
  /** Wall slot decoration. */
  wall: (x0: number, y0: number, w: number, seed: number) => void;
}

const stripe = (x: number, w: number) => Math.floor(x / w) & 1;

const LOOKS: Record<EraId | 'golden', EraLook> = {
  carnival: {
    floor: (x, y) => {
      const n = hash2(x, y, 11);
      const patch = hash2(x >> 3, y >> 3, 12);
      let c: Color = patch < 0.3 ? '#a87850' : '#c99a62';
      if (n < 0.08) c = '#e8c890';
      else if (n < 0.14) c = '#8e6248';
      else if (n < 0.2) c = liA(c, 0.15);
      return c;
    },
    face: (x, r) => {
      const red = stripe(x, 6) === 0;
      let c: Color = red ? '#c8484e' : '#f2e2c4';
      const fold = (x % 6 === 5) || (x % 6 === 0);
      if (fold) c = shA(c, 0.18);
      if (r < 4) c = shA(c, 0.3);
      if (r > 28) c = shA(c, 0.12);
      return c;
    },
    crown: (x, r) => {
      // scalloped valance with gold fringe
      const s = Math.abs(((x % 12) - 6)) / 6;
      if (r < 4 + s * 4) return r < 2 + s * 4 ? GOLD : '#c8484e';
      return r > 13 ? '#3a2438' : stripe(x, 6) ? '#d8b070' : '#a83a48';
    },
    cap: '#4a2e38',
    outside: '#1a1020',
    dark: 'rgba(26,14,30,',
    light: '#ffb860',
    flat: (x, y, fx, fy, fw, fh) => {
      // a ring of fresh sawdust
      const cx = fx + fw / 2;
      const cy = fy + fh / 2;
      const d = Math.hypot((x - cx) / (fw / 2), (y - cy) / (fh / 2));
      if (d > 1) return null;
      return d > 0.82 ? '#f2d8a0' : hash2(x, y, 13) < 0.2 ? '#e8c890' : '#d8b078';
    },
    wall: (x0, y0, w, seed) => {
      if (w === 2) {
        R(x0 + 2, y0 + 3, 28, 22, '#f2e2c4');
        R(x0 + 3, y0 + 4, 26, 4, '#d8434b');
        TC(seed & 1 ? 'STRONGMAN' : 'TEST YOUR', x0 + 16, y0 + 5, '#fbf0d9', FT);
        TC(seed & 1 ? 'LIVE!' : 'STRENGTH', x0 + 16, y0 + 18, '#d8434b', FT);
        circ(x0 + 16, y0 + 13, 3, '#8a5a3a');
        HL(x0 + 9, x0 + 23, y0 + 12, '#3a3448');
        circ(x0 + 9, y0 + 12, 2, '#3a3448');
        circ(x0 + 23, y0 + 12, 2, '#3a3448');
      } else {
        // pennant string
        for (let i = 0; i < 4; i++) {
          const c = ['#d8434b', '#f4b63f', '#3f74d8', '#2fa59a'][(i + seed) % 4];
          for (let k = 0; k < 4; k++) HL(x0 + i * 4 + k / 2, x0 + i * 4 + 3 - k / 2, y0 + 6 + k, c);
        }
        HL(x0, x0 + 15, y0 + 5, '#7a5038');
      }
    },
  },
  territory: {
    floor: (x, y) => {
      const row = Math.floor(y / 5);
      const off = Math.floor(hash2(row, 0, 21) * 48);
      const seam = (x + off) % 48 === 0;
      const ly = y % 5;
      const tone = hash2(Math.floor((x + off) / 48), row, 22);
      let c: Color = tone < 0.33 ? '#c88e52' : tone < 0.66 ? '#d09a5a' : '#bc8448';
      if (ly === 4 || seam) c = '#7a4e3a';
      else if (ly === 0) c = liA(c, 0.15);
      else if (hash2(x >> 2, y, 23) < 0.1) c = shA(c, 0.1);
      return c;
    },
    face: (x, r) => {
      if (r <= 2) return '#4a3a3a';
      if (r <= 16) {
        // green painted cinderblock
        const by = (r - 3) % 6;
        const bx = (x + (Math.floor((r - 3) / 6) & 1 ? 8 : 0)) % 16;
        if (by === 5 || bx === 0) return '#3e6450';
        return by === 0 ? '#7aa684' : '#5e8a6a';
      }
      if (r <= 18) return r === 18 ? '#c08a5c' : '#7a5038';
      return hash2(x, r, 24) < 0.05 ? '#d8ccb0' : r > 30 ? '#d0c4a8' : '#e8dcc0';
    },
    crown: (x, r) => (r < 4 ? '#7a5038' : r < 6 ? '#5a3a30' : x % 32 < 3 ? '#4a3028' : '#3a2a30'),
    cap: '#3a2a30',
    outside: '#14101c',
    dark: 'rgba(20,14,26,',
    light: '#ffd890',
    flat: (x, y, fx, fy, fw, fh) => {
      // a wrestling mat with a center circle
      const lx = x - fx;
      const ly = y - fy;
      if (lx === 0 || ly === 0 || lx === fw - 1 || ly === fh - 1) return '#5a2a3a';
      const d = Math.hypot(lx - fw / 2, (ly - fh / 2) * 1.4);
      if (Math.abs(d - Math.min(fw, fh * 1.4) * 0.3) < 1) return '#f2e2c4';
      return '#9c3a48';
    },
    wall: (x0, y0, w, seed) => {
      if (w === 2) {
        // chalkboard with tonight's card
        R(x0 + 1, y0 + 2, 30, 20, '#7a5038');
        R(x0 + 2, y0 + 3, 28, 18, '#3e5a4a');
        T('TONITE', x0 + 4, y0 + 5, '#f2f2e8', FT);
        HL(x0 + 4, x0 + 22, y0 + 12, '#c8d0c0');
        HL(x0 + 4, x0 + 18, y0 + 15, '#c8d0c0');
        HL(x0 + 4, x0 + 25, y0 + 18, '#c8d0c0');
      } else if (seed % 3 === 0) {
        circ(x0 + 8, y0 + 10, 5, '#f2f2e8');
        circ(x0 + 8, y0 + 10, 5.5, (_xx, _yy, o) => (o === col('#f2f2e8') ? null : '#4a3028'));
        VL(x0 + 8, y0 + 7, y0 + 10, AK);
        HL(x0 + 8, x0 + 10, y0 + 10, AK);
      } else {
        R(x0 + 3, y0 + 3, 10, 13, '#c08a5c');
        R(x0 + 4, y0 + 4, 8, 11, '#e8dcc0');
        ell(x0 + 8, y0 + 8, 2, 2, '#6a5a5a');
        R(x0 + 6, y0 + 10, 4, 4, '#6a5a5a');
      }
    },
  },
  boxing: {
    floor: (x, y) => {
      const n = hash2(x, y, 31);
      const p = hash2(x >> 4, y >> 4, 32);
      let c: Color = p < 0.4 ? '#8a8296' : '#948ca0';
      if (n < 0.06) c = '#7a7286';
      else if (n > 0.96) c = '#a8a0b4';
      if ((x + y * 3) % 61 === 0) c = '#6a6276';
      return c;
    },
    face: (x, r) => {
      if (r <= 2) return '#4a3036';
      const row = Math.floor((r - 3) / 4);
      const ly = (r - 3) % 4;
      const bx = (x + (row & 1 ? 4 : 0)) % 8;
      if (ly === 3 || bx === 0) return '#6a4a4a';
      const t = hash2(Math.floor((x + (row & 1 ? 4 : 0)) / 8), row, 33);
      let c: Color = t < 0.3 ? '#a84a40' : t < 0.7 ? '#b8564a' : '#9a4038';
      if (hash2(x >> 3, r >> 3, 34) < 0.12) c = '#e0d0b8';
      return ly === 0 ? liA(c, 0.12) : c;
    },
    crown: (x, r) => (r < 3 ? '#4a3a4a' : r < 6 && x % 40 < 30 ? '#6a6680' : '#2e2434'),
    cap: '#2e2434',
    outside: '#120e18',
    dark: 'rgba(18,12,24,',
    light: '#ffe0a0',
    flat: (x, y, fx, fy, fw, fh) => {
      // faded painted lines
      if (x - fx === 0 || y - fy === 0 || x - fx === fw - 1 || y - fy === fh - 1) return hash2(x, y, 35) < 0.7 ? '#c84a4a' : null;
      return null;
    },
    wall: (x0, y0, w, seed) => {
      if (w === 2) {
        R(x0 + 2, y0 + 2, 28, 24, '#f4d860');
        R(x0 + 3, y0 + 3, 26, 6, '#d8434b');
        TC('FRIDAY', x0 + 16, y0 + 4, '#fbf0d9', FT);
        TC('NITE', x0 + 16, y0 + 11, '#2b2140', FT);
        TC('FIGHTS', x0 + 16, y0 + 18, '#d8434b', FT);
      } else if (seed & 1) {
        // a mirror
        R(x0 + 2, y0 + 3, 12, 24, '#c8c4dc');
        R(x0 + 3, y0 + 4, 10, 22, '#8a9ab8');
        L2(x0 + 4, y0 + 20, x0 + 10, y0 + 6, '#c8d8f0');
      } else {
        R(x0 + 2, y0 + 6, 12, 8, '#f2e2c4');
        TC('NO', x0 + 8, y0 + 7, '#d8434b', FT);
        R(x0 + 2, y0 + 14, 12, 7, '#f2e2c4');
        TC('SPIT', x0 + 8, y0 + 15, '#d8434b', FT);
      }
    },
  },
  aerobics: {
    floor: (x, y) => {
      const c: Color = '#b8a0d0';
      const cell = hash2(x >> 4, y >> 4, 41);
      const lx = x & 15;
      const ly = y & 15;
      if (cell < 0.2 && Math.abs(ly - 8 - Math.round(Math.sin(lx * 0.8) * 2)) < 1) return '#5ed8c8';
      if (cell > 0.8 && ly > 4 && ly < 11 && Math.abs(lx - 8) < (ly - 4) * 0.7) return '#ff7aa8';
      if (cell > 0.45 && cell < 0.55 && (lx - 8) ** 2 + (ly - 8) ** 2 < 5) return '#f4d860';
      return hash2(x, y, 42) < 0.05 ? '#c8b4dc' : c;
    },
    face: (x, r) => {
      if (r <= 2) return '#6a4a7a';
      if (r <= 20) {
        // mirror panels with diagonal sheen
        if (x % 24 === 0) return '#e8e4f0';
        const sheen = (x + r * 2) % 24;
        return sheen < 2 ? '#e8f0ff' : sheen < 5 ? '#a8b8e0' : '#8a9ac8';
      }
      if (r === 21) return '#e8e4f0';
      return r < 25 ? '#ffb0c8' : r < 29 ? '#ffd0a8' : '#a8f0d8';
    },
    crown: (_x, r) => (r < 3 ? '#ff5d8f' : r < 4 ? '#ffd0e0' : '#4a3a6a'),
    cap: '#4a3a6a',
    outside: '#1a1028',
    dark: 'rgba(30,14,44,',
    light: '#ff9ad8',
    flat: (x, y, fx, fy, fw, fh) => {
      const lx = x - fx;
      const ly = y - fy;
      if (lx < 1 || ly < 1 || lx > fw - 2 || ly > fh - 2) return '#3a9a92';
      return (lx + ly) % 8 < 4 ? '#5ed8c8' : '#4ac0b4';
    },
    wall: (x0, y0, w, seed) => {
      if (w === 2) {
        // neon sign
        R(x0 + 1, y0 + 6, 30, 14, '#2b2140');
        TC('FEEL THE', x0 + 16, y0 + 7, '#ff9ad8', FT);
        TC('BURN', x0 + 16, y0 + 13, '#9af0ff', FT);
      } else {
        // leg warmers on a hook
        HL(x0 + 3, x0 + 12, y0 + 6, '#c8c4dc');
        R(x0 + 4, y0 + 7, 3, 10, seed & 1 ? '#ff7aa8' : '#5ed8c8');
        R(x0 + 9, y0 + 7, 3, 10, seed & 1 ? '#f4d860' : '#b27ae0');
        for (let y = y0 + 8; y < y0 + 17; y += 2) {
          HL(x0 + 4, x0 + 6, y, '#ffffff');
          HL(x0 + 9, x0 + 11, y, '#ffffff');
        }
      }
    },
  },
  garage: {
    floor: (x, y) => {
      const n = hash2(x, y, 51);
      const oil = Math.hypot(((x % 96) - 48) / 30, ((y % 80) - 40) / 18) + hash2(x >> 2, y >> 2, 52) * 0.4;
      let c: Color = '#8e8a80';
      if (oil < 0.9) c = oil < 0.6 ? '#5e5468' : '#6e6670';
      if (x % 64 === 0 || y % 64 === 0) c = '#6a6670';
      if (n < 0.05) c = shA(c, 0.12);
      return c;
    },
    face: (x, r) => {
      if (r <= 2) return '#4a4656';
      const row = Math.floor((r - 3) / 6);
      const ly = (r - 3) % 6;
      const bx = (x + (row & 1 ? 8 : 0)) % 16;
      if (ly === 5 || bx === 0) return '#5a6070';
      return ly === 0 ? '#9aa4b4' : '#7a8494';
    },
    crown: (x, r) => (x % 24 < 3 && r < 14 ? '#7a5038' : r < 2 ? '#3a3448' : '#2a2634'),
    cap: '#2a2634',
    outside: '#100e16',
    dark: 'rgba(16,14,22,',
    light: '#ffe070',
    flat: (x, y, fx, fy, fw, fh) => {
      // an old mattress (backyard wrestling!)
      const lx = x - fx;
      const ly = y - fy;
      if (lx === 0 || ly === 0 || lx === fw - 1 || ly === fh - 1) return '#9a8aa0';
      if (lx % 8 === 4 && ly % 6 === 3) return '#a89ab0';
      return hash2(x >> 3, y >> 3, 53) < 0.15 ? '#c8b880' : '#d8d0e0';
    },
    wall: (x0, y0, w, seed) => {
      if (w === 2) {
        // roll-up garage door
        R(x0 + 1, y0 - 2, 30, 30, '#9aa4b4');
        for (let y = y0 - 1; y < y0 + 28; y += 3) HL(x0 + 1, x0 + 30, y, '#6a7484');
        R(x0 + 13, y0 + 24, 6, 2, '#4a4656');
      } else {
        // a graffiti tag
        const cs = ['#ff5d8f', '#5ed8f8', '#f4d860', '#7fe08a'];
        const c = cs[seed % 4];
        T(['RAW', 'BYW', 'ALY', '4EVA', 'OW!'][seed % 5], x0 + 1, y0 + 8, c, FT, { outline: '#2b2140' });
        VL(x0 + 4, y0 + 15, y0 + 18, c);
      }
    },
  },
  haunted: {
    floor: (x, y) => {
      const t = ((x >> 3) + (y >> 3)) & 1;
      let c: Color = t ? '#7a9a88' : '#d8d2b8';
      if ((x & 7) === 7 || (y & 7) === 7) c = '#5a6a62';
      const crack = hash2(x >> 3, y >> 3, 61);
      if (crack < 0.12 && ((x & 7) === ((y & 7) + Math.floor(crack * 30)) % 8)) c = '#4a5450';
      if (hash2(x, y, 62) < 0.04) c = shA(c, 0.2);
      return c;
    },
    face: (x, r) => {
      // a row of lockers
      if (r <= 2) return '#2e3a3e';
      const lx = x % 10;
      const t = hash2(Math.floor(x / 10), 0, 63);
      const base = t < 0.5 ? '#5a8a8a' : t < 0.8 ? '#6a6a8e' : '#7a8a6a';
      if (lx === 0) return '#2e3a3e';
      if (lx === 9) return shA(base, 0.3);
      if (r > 22 && r < 28 && r % 2 === 0 && lx > 2 && lx < 8) return shA(base, 0.4);
      if (lx === 7 && r > 12 && r < 16) return '#c8c4dc';
      if (r === 31 || r === 32) return '#2e3a3e';
      return lx === 1 ? liA(base, 0.15) : base;
    },
    crown: (x, r) => (r < 3 ? '#4a4a5a' : ((x >> 2) + (r >> 2)) & 1 ? '#8a9a90' : '#6a7a70'),
    cap: '#24282e',
    outside: '#0c0e14',
    dark: 'rgba(10,20,22,',
    light: '#9affc8',
    flat: (x, y, fx, fy, fw, fh) => {
      const d = Math.hypot((x - fx - fw / 2) / (fw / 2), (y - fy - fh / 2) / (fh / 2));
      if (d > 1) return null;
      return d > 0.8 ? '#4a6a6a' : hash2(x, y, 64) < 0.08 ? '#9affd8' : '#3a5a62';
    },
    wall: (x0, y0, w, seed) => {
      if (w === 2) {
        // a mirror with BOO in the steam
        R(x0 + 4, y0 + 2, 24, 18, '#c8c4dc');
        R(x0 + 5, y0 + 3, 22, 16, '#a8c0c8');
        TC('BOO', x0 + 16, y0 + 8, '#f2fff8', FT);
      } else if (seed & 1) {
        // cobweb
        for (let t = 0; t < 8; t++) {
          P(x0 + 1 + t, y0 + 1, '#c8c4dc');
          P(x0 + 1, y0 + 1 + t, '#c8c4dc');
          if (t < 6) P(x0 + 1 + t, y0 + 1 + t, '#e8e4f0');
        }
      } else {
        R(x0 + 3, y0 + 8, 10, 6, '#e8e0cc');
        T('B.M.', x0 + 4, y0 + 9, '#5a3a40', FT);
      }
    },
  },
  golden: {
    floor: (x, y) => {
      const c: Color = hash2(x, y, 71) < 0.06 ? '#4a3858' : '#3a2a4a';
      return (x + y) % 16 === 0 ? '#44325a' : c;
    },
    face: (_x, r) => {
      // bleachers full of (ghostly) fans are drawn live; this is the stand
      if (r <= 2) return '#2a1e34';
      const row = Math.floor((r - 3) / 7);
      const ly = (r - 3) % 7;
      if (ly === 0) return '#7a5a8a';
      return row & 1 ? '#4a3a5a' : '#54406a';
    },
    crown: (x, r) => (r < 3 ? GOLD : r < 5 ? '#c27a1e' : x % 20 < 2 ? '#5a4a6a' : '#22182c'),
    cap: '#22182c',
    outside: '#0c0812',
    dark: 'rgba(18,10,26,',
    light: '#ffd870',
    flat: () => null,
    wall: () => {},
  },
};

export function eraLook(plan: FloorPlan): EraLook {
  return plan.golden ? LOOKS.golden : LOOKS[plan.eraId];
}

/** Bake the floor, walls, wall decoration, flats and the stairs into one canvas. */
export function bakeRoom(plan: FloorPlan): HTMLCanvasElement {
  const lk = eraLook(plan);
  const W = plan.w * 16;
  const H = plan.h * 16;
  const isF = (tx: number, ty: number) => tileAt(plan, tx, ty) === T_FLOOR;
  const spr = mkSpr(W, H, () => {
    R(0, 0, W, H, lk.outside);
    for (let ty = 0; ty < plan.h; ty++)
      for (let tx = 0; tx < plan.w; tx++) {
        const x0 = tx * 16;
        const y0 = ty * 16;
        if (isF(tx, ty)) {
          R(x0, y0, 16, 16, (x, y) => lk.floor(x, y));
          continue;
        }
        // distance to the floor below
        let d = -1;
        for (let k = 1; k <= 3; k++) if (isF(tx, ty + k)) {
          d = k - 1;
          break;
        } else if (tileAt(plan, tx, ty + k) !== 2) break;
        if (d >= 0 && d <= 2) {
          const floorLine = (ty + d + 1) * 16;
          R(x0, y0, 16, 16, (x, y) => {
            const r = floorLine - y;
            return r <= 32 ? lk.face(x, r) : lk.crown(x, r - 32);
          });
        } else {
          R(x0, y0, 16, 16, (x, y) => (hash2(x >> 2, y >> 2, 99) < 0.1 ? shA(lk.cap, 0.2) : lk.cap));
          // lit lip toward the room
          if (isF(tx + 1, ty)) VL(x0 + 15, y0, y0 + 15, liA(lk.cap, 0.25));
          if (isF(tx - 1, ty)) VL(x0, y0, y0 + 15, liA(lk.cap, 0.18));
          if (isF(tx, ty - 1)) HL(x0, x0 + 15, y0, liA(lk.cap, 0.3));
        }
      }
    // contact shadows on the floor along walls
    for (let ty = 0; ty < plan.h; ty++)
      for (let tx = 0; tx < plan.w; tx++) {
        if (!isF(tx, ty)) continue;
        const x0 = tx * 16;
        const y0 = ty * 16;
        if (!isF(tx, ty - 1)) for (let k = 0; k < 5; k++) R(x0, y0 + k, 16, 1, (x, y, o) => (dth(x, y, 12 - k * 3) ? shA(o, 0.35) : null));
        if (!isF(tx - 1, ty)) for (let k = 0; k < 3; k++) R(x0 + k, y0, 1, 16, (x, y, o) => (dth(x, y, 10 - k * 3) ? shA(o, 0.3) : null));
        if (!isF(tx + 1, ty)) R(x0 + 15, y0, 1, 16, (_x, _y, o) => shA(o, 0.2));
      }
    // flats
    for (const f of plan.flats)
      R(f.tx * 16, f.ty * 16, f.w * 16, f.h * 16, (x, y) => lk.flat(Math.floor(x / 2), Math.floor(y / 2), f.tx * 8, f.ty * 8, f.w * 8, f.h * 8, f.seed));
    // scattered floor clutter + glowing cracks (the Dungeon is alive)
    const r = rngLite(plan.floor * 977 + plan.day);
    for (let i = 0; i < plan.w * plan.h * 0.12; i++) {
      const tx = Math.floor(r() * plan.w);
      const ty = Math.floor(r() * plan.h);
      if (!isF(tx, ty)) continue;
      const x = tx * 16 + Math.floor(r() * 14);
      const y = ty * 16 + Math.floor(r() * 14);
      const k = r();
      if (k < 0.25) {
        let cx = x;
        for (let j = 0; j < 5; j++) {
          P(cx, y + (j & 1), '#2e3a3a');
          if (j > 0 && j < 4) P(cx, y + (j & 1) - 1, '#5ad8a0');
          cx++;
        }
      } else if (k < 0.5) P(x, y, '#9affd0');
      else if (k < 0.7) {
        P(x, y, liA(lk.floor(x, y), 0.4));
        P(x + 1, y, liA(lk.floor(x, y), 0.25));
      }
    }
    // wall decoration slots
    for (const s of plan.wall) lk.wall(s.tx * 16, (s.ty - 1) * 16 + 2, s.w, s.seed);
    // torch sconces
    for (const t of plan.torches) {
      const x = t.x * 16 + 8;
      const y = t.y * 16 + 4;
      R(x - 2, y + 4, 4, 5, '#5a4a5a');
      HL(x - 3, x + 2, y + 4, '#8a7a8a');
      R(x - 1, y + 9, 2, 3, '#4a3a4a');
    }
    // the stone stairs back up (floor 1)
    if (plan.up === 'stairs') {
      const x0 = plan.entry.x * 16 - 4;
      const yb = plan.entry.y * 16;
      R(x0, yb - 36, 24, 36, '#1a1224');
      for (let i = 0; i < 6; i++) {
        const y = yb - 6 - i * 5;
        R(x0 + 1 + i, y, 22 - i * 2, 5, i & 1 ? '#6a6278' : '#7a7288');
        HL(x0 + 1 + i, x0 + 22 - i, y, '#9a92a8');
      }
      R(x0 - 2, yb - 38, 2, 38, '#4a4256');
      R(x0 + 24, yb - 38, 2, 38, '#4a4256');
      HL(x0 - 2, x0 + 25, yb - 38, '#6a6278');
    }
  });
  let c = toCanvas(spr);
  if (plan.encore > 0) c = encoreGrade(c, plan.encore);
  return c;
}

/** Encore floors: the same eras, cranked to a midnight-neon palette. */
function encoreGrade(src: HTMLCanvasElement, k: number): HTMLCanvasElement {
  const x = src.getContext('2d')!;
  const img = x.getImageData(0, 0, src.width, src.height);
  const d = img.data;
  const s = Math.min(1, 0.35 + k * 0.15);
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const l = (r + g + b) / 3;
    // push saturation up and tint toward violet-magenta
    d[i] = Math.min(255, l + (r - l) * (1 + s) + 18 * s);
    d[i + 1] = Math.max(0, l + (g - l) * (1 + s) - 14 * s);
    d[i + 2] = Math.min(255, l + (b - l) * (1 + s) + 30 * s);
  }
  x.putImageData(img, 0, 0);
  return src;
}

function rngLite(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Palette helper for the scene. */
export function mixHex(a: Color, b: Color, t: number): number {
  return mixc(a, b, t);
}
