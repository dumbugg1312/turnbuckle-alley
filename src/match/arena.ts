import { Rng } from '../core/rng';
import { ctx2d, makeCanvas, mix } from '../gfx/draw';
import { AK, col, curve, dth, DS, ell, hash2, HL, L, liA, mixc, mkSpr, OUT, P, R, RR, selA, shA, sprite, toCanvas, VL, type Spr } from '../gfx/kit';
import { HAIR_COLORS, SKIN_TONES } from '../gfx/look';

/**
 * The match stage at native resolution: venue backdrop, crowd, ring and lights.
 * Everything static is pre-rendered once per (venue, size); per frame the
 * stage is a handful of blits plus the animated fans and a few particles.
 */
export type Venue = 'vfw' | 'sportatorium' | 'dungeon' | 'backyard' | 'fair';

export interface RingGeo {
  cx: number;
  /** y of the mat center line (where wrestlers stand). */
  matY: number;
  /** Half-width of the ring at the front edge. */
  half: number;
  backHalf: number;
  backY: number;
  frontY: number;
  /** Corner posts (front). */
  postLX: number;
  postRX: number;
  postTopY: number;
  /** Rope heights above the front edge / back edge. */
  ropeF: number[];
  ropeB: number[];
  apronBottom: number;
}

export function ringGeo(w: number, h: number): RingGeo {
  const half = Math.round(Math.min(w * 0.37, 165));
  const matY = Math.round(h * 0.64);
  const backY = matY - 28;
  const frontY = matY + 14;
  const cx = Math.round(w / 2);
  return {
    cx, matY, half, backHalf: half - 30, backY, frontY,
    postLX: cx - half, postRX: cx + half, postTopY: frontY - 60,
    ropeF: [14, 28, 42], ropeB: [11, 22, 33], apronBottom: frontY + 30,
  };
}

const ROPES = ['#e8404e', '#f6f0f4', '#4a6ad0'];

// =====================================================================
//  Crowd
// =====================================================================

interface Fan {
  x: number;
  row: number;
  v: number;
  phase: number;
  hype: number;
  sign: string | null;
  prop: 'finger' | 'popcorn' | 'phone' | null;
  agnes?: boolean;
  /** Boos the heel (most fans) or cheers everything. */
  mark: boolean;
}
type FanState = 'sit' | 'up' | 'boo' | 'jump';

const SHIRTS = ['#d8434b', '#3f74d8', '#f4b63f', '#2fa59a', '#ff5d8f', '#6a3fa0', '#f2e6c9', '#3bb273', '#e07a3a', '#3a3448', '#82a6e2', '#9c2537', '#fbf0d9'];
const SIGNS = ['ACW!', 'EARL!', 'WOOO', 'HI MOM', 'YES!', 'BOO!', 'OLE!', '10/10', 'NEW GUY', 'PIP #1', 'FLY!', 'TAP!', 'HOT TAG', 'GO!', 'ALLEY', 'WED'];
const VARIANTS = 28;

interface FanVar {
  skin: string;
  hair: string;
  style: number;
  shirt: string;
  shirt2: string;
  kid: boolean;
  elder: boolean;
  big: boolean;
  glasses: boolean;
  cap: boolean;
  beard: boolean;
}
function fanVar(v: number): FanVar {
  const r = new Rng(1000 + v * 77);
  const kid = r.chance(0.16);
  const elder = !kid && r.chance(0.14);
  return {
    skin: r.pick(SKIN_TONES),
    hair: elder ? r.pick(['#dcdae6', '#f4f4f4', '#b8b8c4']) : r.pick(HAIR_COLORS.slice(0, 9)),
    style: r.int(0, 7),
    shirt: r.pick(SHIRTS),
    shirt2: r.pick(SHIRTS),
    kid, elder,
    big: !kid && r.chance(0.3),
    glasses: r.chance(elder ? 0.6 : 0.15),
    cap: !elder && r.chance(0.2),
    beard: !kid && r.chance(0.2),
  };
}

/** Build one fan bust (about 12x16) in a state, dimmed toward the venue's dark for its row. */
function fanSprite(v: number, state: FanState, dim: number, dark: string, prop: Fan['prop'], sign: string | null, agnes: boolean): HTMLCanvasElement {
  const key = `fan|${v}|${state}|${dim.toFixed(2)}|${dark}|${prop}|${sign}|${agnes ? 1 : 0}`;
  const f = fanVar(v);
  const s = f.kid ? 5 : f.big ? 7 : 6; // head size
  const W = 30;
  const H = 34;
  return sprite(key, W, H, () => {
    const dm = (c: string | number) => mixc(c, dark, dim);
    const skin = dm(agnes ? '#f4caa8' : f.skin);
    const skinD = dm(shA(agnes ? '#f4caa8' : f.skin, 0.32));
    const shirt = dm(agnes ? '#a888d0' : f.shirt);
    const shirtD = dm(shA(agnes ? '#a888d0' : f.shirt, 0.32));
    const shirtL = dm(liA(agnes ? '#a888d0' : f.shirt, 0.25));
    const hair = dm(agnes ? '#f6f0fa' : f.hair);
    const hairD = dm(shA(agnes ? '#f6f0fa' : f.hair, 0.3));
    const hairL = dm(liA(agnes ? '#f6f0fa' : f.hair, 0.35));
    const cx = 15;
    const baseY = H - 2; // bottom of the shoulders
    const up = state === 'up' || state === 'jump';
    const lift = state === 'jump' ? 3 : 0;
    const by = baseY - lift;
    // shoulders / torso
    const sw = s + 5;
    RR(cx - sw / 2, by - s - 2, sw, s + 3, 2, shirt);
    R(cx + sw / 2 - 2, by - s - 1, 2, s + 2, shirtD);
    HL(cx - sw / 2 + 1, cx + sw / 2 - 3, by - s - 2, shirtL);
    if (agnes) {
      // cardigan with pearls
      R(cx - 1, by - s - 2, 3, s + 3, dm('#f2a0b8'));
      for (let x = cx - 2; x <= cx + 2; x++) P(x, by - s - 1 + (Math.abs(x - cx) === 2 ? 0 : 1), dm('#fffaf0'));
    } else if (f.elder) {
      R(cx - sw / 2 + 2, by - s - 1, 1, s + 2, shirtL);
    } else if (!f.kid && hash2(v, 1) < 0.4) {
      // tee logo
      P(cx, by - s + 1, dm(f.shirt2));
      P(cx + 1, by - s + 1, dm(f.shirt2));
    }
    // arms
    const armC = f.kid || f.elder ? shirt : skin;
    if (state === 'boo') {
      // arms crossed / thumbs down
      R(cx - sw / 2, by - s + 1, sw, 2, armC);
      P(cx + sw / 2 + 1, by - s + 3, skin);
      P(cx + sw / 2 + 1, by - s + 4, skinD);
    } else if (up) {
      const raise = state === 'jump' ? 2 : 0;
      R(cx - sw / 2 - 1, by - s - 8 - raise, 2, s + 6, armC);
      R(cx - sw / 2 - 1, by - s - 10 - raise, 2, 2, skin);
      R(cx + sw / 2 - 1, by - s - 8 - raise, 2, s + 6, shA(armC, 0.25));
      R(cx + sw / 2 - 1, by - s - 10 - raise, 2, 2, skin);
    }
    // neck + head
    const hy = by - s - 2 - s - 1 + (f.kid ? 1 : 0);
    R(cx - 1, hy + s - 1, 2, 2, skinD);
    ell(cx + 0.5, hy + s / 2 + 0.5, s / 2 + 0.6, s / 2 + 0.9, skin);
    R(cx + Math.floor(s / 2) - 1, hy + 1, 2, s - 2, skinD);
    // face
    const ey = hy + Math.floor(s / 2);
    P(cx - 1, ey, AK);
    P(cx + 1, ey, AK);
    if (f.glasses || agnes) {
      HL(cx - 2, cx + 2, ey, dm(agnes ? '#e2b244' : '#3a3448'));
      P(cx - 1, ey, dm('#e6f0f6'));
      P(cx + 1, ey, dm('#e6f0f6'));
    }
    const open = up || state === 'boo' || hash2(v, 3) < 0.4;
    if (open) R(cx - 1 + (s > 5 ? 0 : 0), ey + 2, 2, s > 5 ? 2 : 1, dm('#8a2a4a'));
    else P(cx, ey + 2, dm('#a8435a'));
    if (f.beard) HL(cx - 1, cx + 1, ey + 3, hairD);
    if (f.elder || agnes) P(cx - 2, ey + 1, dm('#f29a8a'));
    // hair
    const st = agnes ? 9 : f.style;
    switch (st) {
      case 0: R(cx - Math.floor(s / 2), hy, s, 2, hair); P(cx - Math.floor(s / 2), hy + 2, hair); P(cx + Math.ceil(s / 2) - 1, hy + 2, hairD); break;
      case 1: R(cx - Math.floor(s / 2) - 1, hy, s + 2, 2, hair); R(cx - Math.floor(s / 2) - 1, hy + 2, 2, s - 1, hair); R(cx + Math.ceil(s / 2) - 1, hy + 2, 2, s - 1, hairD); break;
      case 2: R(cx - Math.floor(s / 2), hy, s, 2, hair); R(cx - 1, hy - 2, 3, 2, hair); break;
      case 3: ell(cx + 0.5, hy + 1.5, s / 2 + 1.5, s / 2 + 0.5, hair); ell(cx + 0.5, hy + s / 2 + 1, s / 2, s / 2 - 0.2, skin); P(cx - 1, ey, AK); P(cx + 1, ey, AK); break;
      case 4: R(cx - Math.floor(s / 2), hy, s, 1, hair); break;
      case 5: R(cx - Math.floor(s / 2), hy, s, 2, hair); R(cx - Math.floor(s / 2) - 2, hy + 1, 2, 4, hair); P(cx - Math.floor(s / 2) - 2, hy + 5, hairD); break;
      case 6: for (let k = 0; k < 4; k++) P(cx - 2 + k + (k & 1), hy - 1 + (k & 1), hair); R(cx - Math.floor(s / 2), hy, s, 2, hair); break;
      case 7: R(cx - Math.floor(s / 2), hy, s, 2, hair); R(cx - Math.floor(s / 2), hy + 2, 1, s - 2, hair); R(cx + Math.ceil(s / 2) - 1, hy + 2, 1, s - 2, hairD); break;
      case 9: for (const [ox, oy] of [[-2, -1], [0, -2], [2, -1], [-3, 1], [3, 1], [1, 0], [-1, 0]]) { P(cx + ox, hy + oy, hair); P(cx + ox + 1, hy + oy, hairL); } break;
      default: break;
    }
    if (f.style !== 4 && !agnes) P(cx - Math.floor(s / 2) + 1, hy, hairL);
    if (f.cap && !agnes) {
      R(cx - Math.floor(s / 2) - 1, hy, s + 2, 2, dm(f.shirt2));
      R(cx - Math.floor(s / 2), hy - 1, s, 1, dm(f.shirt2));
      HL(cx + Math.ceil(s / 2), cx + Math.ceil(s / 2) + 2, hy + 1, dm(shA(f.shirt2, 0.3)));
    }
    // props
    if (prop === 'finger' && up) {
      const fy = by - s - 16;
      RR(cx + sw / 2 - 3, fy, 6, 7, 2, dm('#ffd84a'));
      R(cx + sw / 2 - 1, fy - 3, 2, 4, dm('#ffd84a'));
      P(cx + sw / 2 - 1, fy - 3, dm('#fff0a0'));
      pixelTextSpr('1', cx + sw / 2 - 2, fy + 1, dm('#d8434b'));
    } else if (prop === 'phone' && up) {
      const py = by - s - 13;
      R(cx - sw / 2 - 2, py, 3, 5, dm('#2a2236'));
      P(cx - sw / 2 - 1, py + 1, dm('#5ff2d6'));
    } else if (prop === 'popcorn' && !up) {
      const px = cx + sw / 2 + 1;
      const py = by - s + 1;
      R(px, py, 4, 4, dm('#f6f2ea'));
      for (let k = 0; k < 4; k += 2) VL(px + k, py, py + 3, dm('#d8434b'));
      for (const [ox, oy] of [[0, -1], [2, -2], [3, -1], [1, -1]]) P(px + ox, py + oy, dm('#fff0b0'));
    }
    if (sign && up) {
      const tw = sign.length * 4 + 3;
      const sx = cx - Math.floor(tw / 2);
      const sy = by - s - 18;
      R(sx - 1, sy - 1, tw + 2, 9, dm('#2b2140'));
      R(sx, sy, tw, 7, dm(hash2(v, 5) < 0.5 ? '#fbf0d9' : '#ffe08a'));
      pixelTextSpr(sign, sx + 2, sy + 1, dm(hash2(v, 6) < 0.5 ? '#d8434b' : '#3f74d8'));
      R(cx - sw / 2 - 1, sy + 8, 2, 2, skin);
      R(cx + sw / 2 - 1, sy + 8, 2, 2, skin);
    }
  }, { outline: (c, side) => (side === 'dark' ? shA(c, 0.5) : shA(c, 0.3)) });
}

/** The 3x5 font, drawn into the current kit sprite target. */
const GLY: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011', H: '101101111101101',
  I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010', P: '110101110100100',
  Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101',
  Y: '101101010010010', Z: '111001010100111', '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110', '4': '101101111001001', '5': '111100110001110',
  '6': '011100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001110', '!': '010010010000010', '#': '101111101111101', '/': '001001010100100', ' ': '000000000000000', '?': '110001010000010',
};
function pixelTextSpr(s: string, x: number, y: number, c: number | string): void {
  s = s.toUpperCase();
  for (let i = 0; i < s.length; i++) {
    const g = GLY[s[i]] ?? GLY['?'];
    for (let p = 0; p < 15; p++) if (g[p] === '1') P(x + i * 4 + (p % 3), y + Math.floor(p / 3), c);
  }
}

export class Crowd {
  fans: Fan[] = [];
  level = 0.2; // 0..1 smoothed excitement
  jump = 0; // pop impulse
  /** 0..1 booing (heel heat). */
  boo = 0;
  private w = 0;
  private venue: Venue = 'vfw';
  flashes: { x: number; y: number; t: number }[] = [];
  chant: { text: string; t: number } | null = null;
  rows = 0;

  layout(w: number, _h: number, venue: Venue, seed = 7): void {
    if (w === this.w && venue === this.venue && this.fans.length) return;
    this.w = w;
    this.venue = venue;
    const rng = new Rng(seed);
    const rows = venue === 'vfw' ? 3 : venue === 'backyard' ? 2 : venue === 'dungeon' ? 2 : 5;
    this.rows = rows;
    const density = venue === 'vfw' ? 17 : venue === 'backyard' ? 30 : venue === 'dungeon' ? 36 : 13;
    this.fans = [];
    for (let r = 0; r < rows; r++) {
      const spacing = density - r * 0.8;
      for (let x = 6 + (r % 2) * 7; x < w - 6; x += spacing + rng.int(0, 4)) {
        if (rng.chance(venue === 'vfw' ? 0.16 : venue === 'dungeon' ? 0.3 : 0.06)) continue;
        const v = rng.int(0, VARIANTS - 1);
        const propRoll = rng.next();
        this.fans.push({
          x, row: r, v,
          phase: rng.next() * Math.PI * 2,
          hype: 0.55 + rng.next() * 0.9,
          sign: r <= 1 && rng.chance(0.09) ? rng.pick(SIGNS) : null,
          prop: r <= 2 && propRoll < 0.08 ? 'finger' : propRoll < 0.15 ? 'phone' : r === 0 && propRoll < 0.22 ? 'popcorn' : null,
          mark: rng.chance(0.85),
        });
      }
    }
    // Agnes sits front row, near the middle, purse at the ready.
    const front = this.fans.filter((f) => f.row === 0);
    if (front.length) {
      const a = front[Math.floor(front.length * 0.62)];
      a.agnes = true;
      a.sign = null;
      a.prop = null;
      a.hype = 1.2;
    }
  }

  pop(strength: number): void {
    this.jump = Math.min(1.5, this.jump + strength);
    const n = Math.round(strength * 7);
    for (let i = 0; i < n; i++) this.flashes.push({ x: Math.random() * this.w, y: Math.random(), t: 0.15 + Math.random() * 0.2 });
  }
  heelHeat(strength: number): void {
    this.boo = Math.min(1, this.boo + strength);
  }

  update(dt: number, target: number): void {
    this.level += (target - this.level) * Math.min(1, dt * 1.5);
    this.jump = Math.max(0, this.jump - dt * 1.4);
    this.boo = Math.max(0, this.boo - dt * 0.6);
    this.flashes = this.flashes.filter((f) => (f.t -= dt) > 0);
    if (this.chant) {
      this.chant.t -= dt;
      if (this.chant.t <= 0) this.chant = null;
    }
    // Ambient camera flashes when the crowd is hot.
    if (Math.random() < dt * this.level * this.level * 8) this.flashes.push({ x: Math.random() * this.w, y: Math.random(), t: 0.12 });
  }
}

// =====================================================================
//  Static layers
// =====================================================================

export interface ArenaOpts {
  venue: Venue;
  t: number;
  crowd: Crowd;
  /** 0..1 how dramatic the lighting is (finish = 1). */
  drama: number;
}

interface Statics {
  key: string;
  back: HTMLCanvasElement; // walls + bleacher steps (behind the fans)
  mid: HTMLCanvasElement; // barricade, floor, table, ring mat + apron, back posts + ropes
  front: HTMLCanvasElement; // front posts + ropes at rest
  glow: HTMLCanvasElement; // bloom for fixtures (lighter)
  beams: { c: HTMLCanvasElement; x: number; sway: number; phase: number }[];
  vignette: HTMLCanvasElement;
  rowY: number[];
  rowDim: number[];
  dark: string;
}
let statics: Statics | null = null;

function venueDark(v: Venue): string {
  return v === 'vfw' ? '#2a1a22' : v === 'dungeon' ? '#0c1c1c' : v === 'backyard' ? '#3a2a4a' : v === 'fair' ? '#1a1430' : '#1a1028';
}

function getStatics(w: number, h: number, venue: Venue, crowd: Crowd): Statics {
  const key = `${w}x${h}|${venue}`;
  if (statics && statics.key === key) return statics;
  const g = ringGeo(w, h);
  crowd.layout(w, h, venue);
  const dark = venueDark(venue);
  const rows = crowd.rows;
  const rowY: number[] = [];
  const rowDim: number[] = [];
  const crowdBase = g.backY - 36; // feet line of the front row
  for (let r = 0; r < rows; r++) {
    rowY.push(crowdBase - r * 15);
    rowDim.push(Math.min(0.78, 0.1 + r * 0.17));
  }
  const back = toCanvas(mkSpr(w, h, () => drawVenue(w, h, g, venue, rowY)));
  const mid = toCanvas(mkSpr(w, h, () => drawRingStatic(w, h, g, venue)));
  const front = toCanvas(mkSpr(w, h, () => drawFrontRopes(g, 0, 0)));
  const glow = buildGlow(w, h, g, venue);
  const beams = buildBeams(w, h, g, venue);
  const vignette = buildVignette(w, h);
  statics = { key, back, mid, front, glow, beams, vignette, rowY, rowDim, dark };
  return statics;
}

/** Everything behind the fans. */
function drawVenue(w: number, h: number, g: RingGeo, venue: Venue, rowY: number[]): void {
  const top = rowY[rowY.length - 1] - 26; // top of the back bleacher
  if (venue === 'backyard') {
    // sunset sky, trees, fence, lawn
    const sky = ['#ffd27a', '#ffa66a', '#e07a8a', '#8a5aa0', '#4a3a7a'];
    for (let y = 0; y < g.backY; y++) {
      const t = y / g.backY;
      const i = Math.min(sky.length - 2, Math.floor(t * (sky.length - 1)));
      const f = t * (sky.length - 1) - i;
      HL(0, w - 1, y, (x, yy) => (dth(x, yy, Math.round(f * 16)) ? sky[i + 1] : sky[i]));
    }
    ell(w * 0.72, g.backY - 70, 14, 14, '#fff0b0');
    ell(w * 0.72, g.backY - 70, 11, 11, '#fff8d8');
    for (let x = -10; x < w + 10; x += 26) {
      const hh = 26 + (hash2(x, 1) * 18) | 0;
      ell(x + 10, g.backY - 40 - hh / 2, 16, hh / 2, '#2d4a40');
      ell(x + 6, g.backY - 44 - hh / 2, 10, hh / 3, '#3a5e4a');
    }
    R(0, g.backY - 46, w, 26, '#8a5a3c');
    for (let x = 0; x < w; x += 7) {
      R(x, g.backY - 50, 6, 30, x % 14 ? '#9c6a48' : '#7c4c30');
      P(x + 2, g.backY - 44, '#5a3a24');
      P(x + 2, g.backY - 28, '#5a3a24');
    }
    HL(0, w - 1, g.backY - 50, '#b88060');
    R(0, g.backY - 20, w, h, '#4f8a4a');
    for (let i = 0; i < w * 2; i++) {
      const x = (hash2(i, 2) * w) | 0;
      const y = g.backY - 20 + ((hash2(i, 3) * (h - g.backY + 20)) | 0);
      P(x, y, hash2(i, 4) < 0.5 ? '#5a9a52' : '#3f7a3c');
    }
    // lawn chairs behind the ring
    for (let x = 20; x < w - 20; x += 44) {
      RR(x, g.backY - 36, 14, 10, 2, hash2(x, 9) < 0.5 ? '#3f74d8' : '#d8434b');
      R(x, g.backY - 26, 2, 8, '#dcdae6');
      R(x + 12, g.backY - 26, 2, 8, '#dcdae6');
    }
    return;
  }
  if (venue === 'dungeon') {
    // concrete block gym lit by one ghostly teal tube
    R(0, 0, w, h, '#0d1a1a');
    for (let y = 0; y < g.backY; y += 8)
      for (let x = (y / 8) % 2 ? -8 : 0; x < w; x += 16) {
        R(x, y, 15, 7, (xx, yy) => (hash2(xx, yy, 1) < 0.08 ? '#1a3a34' : '#15302c'));
        HL(x, x + 14, y, '#1e3e38');
      }
    // pipes and a boiler
    for (let x = 0; x < w; x += 1) P(x, 12 + Math.round(Math.sin(x * 0.08) * 1.2), '#2a4a44');
    R(0, 10, w, 2, '#2c4c46');
    for (let x = 30; x < w; x += 90) {
      R(x, 10, 4, 14, '#2c4c46');
      R(x - 1, 23, 6, 3, '#355a52');
    }
    RR(w - 60, g.backY - 70, 34, 50, 3, '#243e3c');
    R(w - 56, g.backY - 60, 26, 30, '#1c3230');
    for (let y = g.backY - 58; y < g.backY - 32; y += 4) HL(w - 54, w - 32, y, '#2a4a44');
    ell(w - 43, g.backY - 48, 5, 5, '#3a6a60');
    // chalkboard
    RR(30, 30, 70, 36, 2, '#4a3a2a');
    R(32, 32, 66, 32, '#1e3a30');
    pixelText2(34, 36, 'NO QUITTERS', '#9ad8c8');
    pixelText2(34, 44, 'MOP THE MAT', '#9ad8c8');
    for (let i = 0; i < 20; i++) P(34 + i * 3, 52, i % 3 ? '#6aa898' : '#1e3a30');
    // the tube light
    R(g.cx - 40, 4, 80, 3, '#9af0e0');
    R(g.cx - 42, 3, 84, 1, '#5aa89c');
    R(0, g.backY - 20, w, h, '#0f2420');
    for (let x = 0; x < w; x += 24) for (let y = g.backY - 20; y < h; y += 24) { HL(x, x + 23, y, '#0c1e1a'); VL(x, y, y + 23, '#0c1e1a'); }
    return;
  }
  if (venue === 'vfw') {
    // wood panel hall: drop ceiling, fluorescent tubes, boards with knots
    R(0, 0, w, h, '#4a2f28');
    for (let x = 0; x < w; x += 9) {
      R(x, 16, 8, g.backY - 16, (xx, yy) => {
        const n = hash2(xx, yy, 7);
        return n < 0.04 ? '#3a241e' : n > 0.96 ? '#6a4a3c' : (xx - x) === 0 ? '#3e271f' : '#5a3a2e';
      });
      VL(x + 8, 16, g.backY, '#2e1d1a');
      if (hash2(x, 11) < 0.3) {
        const ky = 30 + ((hash2(x, 12) * (g.backY - 60)) | 0);
        ell(x + 4, ky, 2, 3, '#3a241e');
        P(x + 4, ky, '#6a4a3c');
      }
    }
    R(0, 0, w, 16, '#e8ddc4');
    for (let x = 0; x < w; x += 24) { VL(x, 0, 15, '#cbb894'); HL(x, x + 23, 15, '#cbb894'); }
    for (let x = 30; x < w; x += 120) { R(x, 6, 60, 4, '#fffbe6'); R(x - 2, 5, 64, 1, '#d8d0b8'); R(x - 2, 10, 64, 1, '#d8d0b8'); }
    HL(0, w - 1, 16, '#2e1d1a');
    // bunting
    for (let x = 0; x < w; x += 12) {
      const c = ['#d8434b', '#fbf0d9', '#3f74d8'][(x / 12) % 3];
      for (let k = 0; k < 6; k++) HL(x + k, x + 11 - k, 18 + k, c);
      HL(x + 2, x + 9, 19, liA(c, 0.3));
    }
    curve(0, 17, w, 17, 3, '#dcdae6');
    // bingo board (numbers light up), exit sign, flag, a plaque
    RR(14, 30, 58, 34, 2, '#1e1426');
    R(16, 32, 54, 30, '#2a1d38');
    pixelText2(22, 34, 'BINGO', '#f4b63f');
    for (let i = 0; i < 24; i++) R(18 + (i % 8) * 6, 42 + Math.floor(i / 8) * 6, 5, 4, (i * 7) % 5 === 0 ? '#f4b63f' : '#4a3a5a');
    RR(w - 92, 26, 76, 16, 1, '#d8434b');
    R(w - 90, 28, 72, 12, '#9c2537');
    pixelText2(w - 86, 31, 'WEDNESDAY NIGHT', '#fbf0d9');
    R(w - 40, 2, 22, 9, '#2b2140');
    pixelText2(w - 38, 4, 'EXIT', '#ff7a7a');
    R(w - 30, 50, 22, 14, '#d8434b');
    for (let y = 50; y < 64; y += 2) HL(w - 30, w - 9, y, y % 4 ? '#d8434b' : '#fbf0d9');
    R(w - 30, 50, 10, 8, '#3f74d8');
    R(w - 31, 48, 1, 18, '#dcdae6');
    // a folding table with a coffee urn at the back
    R(90, g.backY - 56, 44, 3, '#8a6a4a');
    R(92, g.backY - 53, 2, 10, '#5a5a6a');
    R(130, g.backY - 53, 2, 10, '#5a5a6a');
    RR(106, g.backY - 70, 12, 14, 2, '#c8c8d8');
    P(111, g.backY - 72, '#8a8aa0');
    R(0, g.backY - 20, w, h, '#3a2620');
    // linoleum tiles
    for (let x = 0; x < w; x += 20) for (let y = g.backY - 20; y < h; y += 20) { R(x, y, 20, 20, ((x + y) / 20) % 2 ? '#3e2a24' : '#36221e'); }
  } else if (venue === 'fair') {
    // night sky, ferris wheel, striped tent wall
    R(0, 0, w, h, '#1a1430');
    for (let i = 0; i < 60; i++) P((hash2(i, 1) * w) | 0, (hash2(i, 2) * 40) | 0, hash2(i, 3) < 0.5 ? '#fff6d0' : '#8a8ac0');
    const fx = w - 70;
    const fy = 42;
    for (let a = 0; a < 16; a++) {
      const x = fx + Math.cos((a / 16) * Math.PI * 2) * 34;
      const y = fy + Math.sin((a / 16) * Math.PI * 2) * 34;
      L(fx, fy, x, y, '#3a3468');
      ell(x, y, 2, 2, ['#ff7aa8', '#7ae0ff', '#ffd36b'][a % 3]);
    }
    for (let a = 0; a < 48; a++) P(fx + Math.round(Math.cos((a / 48) * Math.PI * 2) * 34), fy + Math.round(Math.sin((a / 48) * Math.PI * 2) * 34), '#8a8ac0');
    L(fx - 20, fy + 60, fx, fy, '#3a3468');
    L(fx + 20, fy + 60, fx, fy, '#3a3468');
    // tent wall with stripes
    for (let x = 0; x < w; x += 14) R(x, 70, 14, g.backY - 70, (x / 14) % 2 ? '#d8434b' : '#fbf0d9');
    for (let k = 0; k < 6; k++) curve(0, 68 - k, w, 68 - k, 6, k < 2 ? '#f4b63f' : '#9c2537');
    // string lights with bulbs
    curve(0, 20, w, 20, 10, '#3a3448', (x, y, _t, i) => {
      if (i % 8 === 0) { P(x, y + 1, ['#ffd36b', '#ff7aa8', '#7ae0ff'][(i / 8) % 3]); P(x, y + 2, ['#ffd36b', '#ff7aa8', '#7ae0ff'][(i / 8) % 3]); }
    });
    R(0, g.backY - 20, w, h, '#4a3a2a');
    for (let i = 0; i < w * 3; i++) P((hash2(i, 5) * w) | 0, g.backY - 20 + ((hash2(i, 6) * (h - g.backY + 20)) | 0), hash2(i, 7) < 0.5 ? '#5a4a34' : '#3e3022');
  } else {
    // The Sportatorium: weathered planks, gambrel rafters, banners, string lights, a lighting truss.
    R(0, 0, w, g.backY, (x, y) => {
      const k = ((x % 9) + 9) % 9;
      let c = k === 0 ? '#7a4a4a' : k === 8 ? '#4e2f40' : '#6a3e46';
      if (hash2(x, y, 51) < 0.03) c = '#5a3442';
      return c;
    });
    const beam = (x0: number, y0: number, x1: number, y1: number) => {
      for (let k = 0; k < 4; k++) L(x0, y0 + k, x1, y1 + k, k === 0 ? '#9a6a5a' : k === 3 ? '#3a2438' : '#6e4648');
    };
    beam(-10, 52, 90, 0);
    beam(w + 10, 52, w - 90, 0);
    beam(0, 34, w, 34);
    for (let x = 30; x < w; x += 70) { R(x, 0, 5, 34, '#5e3a44'); VL(x, 0, 33, '#8a5a52'); }
    // lighting truss with par cans
    R(0, 42, w, 3, '#5a5a72');
    for (let x = 0; x < w; x += 6) P(x, 43, '#7a7a92');
    for (let x = 40; x < w; x += 80) {
      R(x - 4, 45, 9, 7, '#3a3448');
      R(x - 3, 46, 7, 5, '#5a5a72');
      R(x - 2, 50, 5, 2, ['#ff7aa8', '#7ae0ff', '#fff0c0'][Math.floor(x / 80) % 3]);
    }
    // pennant bunting
    for (let x = 4; x < w; x += 10) {
      const c = ['#e8404e', '#f6f0f4', '#4a6ad0', '#ffd050'][Math.floor((x - 4) / 10) % 4];
      for (let k = 0; k < 5; k++) HL(x + k, x + 8 - k, 38 + k, c);
    }
    // banners
    const banners: [number, string, string, string][] = [[18, '#3f8a86', '#ffd050', '83'], [w - 44, '#7a2f80', '#ffd050', '99'], [g.cx - 26, '#9c2537', '#fbf0d9', 'ACW']];
    for (const [bx, c1, c2, txt] of banners) {
      const bw = txt.length > 2 ? 52 : 26;
      R(bx, 54, bw, 26, c1);
      for (let k = 0; k < 5; k++) HL(bx + k, bx + bw - 1 - k, 80 + k, c1);
      R(bx, 54, bw, 2, shA(c1, 0.3));
      pixelText2(bx + Math.floor((bw - txt.length * 4) / 2) + 1, 60, txt, c2);
      HL(bx + 4, bx + bw - 5, 70, c2);
      HL(bx + 4, bx + bw - 5, 73, c2);
    }
    // string lights
    for (const sag of [[0, 26, w, 26, 12], [0, 28, w / 2, 24, 8], [w / 2, 24, w, 28, 8]] as [number, number, number, number, number][]) {
      curve(sag[0], sag[1], sag[2], sag[3], sag[4], '#3a2a38', (x, y, _t, i) => {
        if (i % 9 === 0) {
          const c = ['#ffd36b', '#ff7aa8', '#7ae0ff'][(i / 9) % 3];
          P(x, y + 1, c);
          P(x, y + 2, liA(c, 0.5));
        }
      });
    }
    R(0, g.backY - 20, w, h, '#1d1428');
  }
  // bleacher steps behind the ring (fans sit on these)
  const stepC = venue === 'vfw' ? '#4a3630' : '#4a3858';
  for (let r = rowY.length - 1; r >= 0; r--) {
    const y = rowY[r];
    R(0, y - 2, w, 15, mixc(stepC, venueDark(venue), r * 0.15));
    HL(0, w - 1, y - 2, mixc(liA(stepC, 0.25), venueDark(venue), r * 0.15));
    for (let x = 0; x < w; x += 24) VL(x + ((r * 7) % 24), y, y + 12, mixc(shA(stepC, 0.3), venueDark(venue), r * 0.15));
  }
  void top;
}

function pixelText2(x: number, y: number, s: string, c: string | number): void {
  pixelTextSpr(s, x, y, c);
}

/** Ringside and the ring itself (static). */
function drawRingStatic(w: number, h: number, g: RingGeo, venue: Venue): void {
  const { cx, half, backHalf, backY, frontY } = g;
  // barricade between the fans and ringside
  const by = backY - 34;
  if (venue !== 'backyard') {
    R(0, by, w, 10, venue === 'dungeon' ? '#1e3a36' : '#2f2a52');
    HL(0, w - 1, by, venue === 'dungeon' ? '#4a7a70' : '#6a6aa8');
    HL(0, w - 1, by + 1, venue === 'dungeon' ? '#2c5a52' : '#4a4a80');
    for (let x = 0; x < w; x += 14) VL(x, by + 2, by + 9, venue === 'dungeon' ? '#163028' : '#3e3a6a');
    HL(0, w - 1, by + 10, venueDark(venue));
  }
  // announce table at the back-left with Gus and the bell
  const tx = Math.max(6, cx - half - 92);
  const ty = backY - 6;
  if (venue !== 'backyard' && tx > 0) {
    const gus = gusSprite();
    DS(gus, tx + 26, ty - 32);
    R(tx, ty - 6, 70, 4, '#8a5a4a');
    HL(tx, tx + 69, ty - 6, '#c08a5a');
    R(tx + 2, ty - 2, 66, 16, '#3a3478');
    for (let xx = tx + 2; xx < tx + 68; xx += 8) VL(xx, ty - 1, ty + 13, '#332e6c');
    pixelText2(tx + 24, ty + 3, 'ACW', '#ffd560');
    // bell + mic stand + monitor
    ell(tx + 10, ty - 9, 5, 3, '#ffd050');
    HL(tx + 7, tx + 12, ty - 11, '#fff0a0');
    R(tx + 9, ty - 14, 2, 2, '#c88a2a');
    R(tx + 6, ty - 7, 9, 1, '#6a4a3a');
    R(tx + 54, ty - 18, 12, 10, '#2a2a3a');
    R(tx + 55, ty - 17, 10, 7, '#5ff2d6');
    HL(tx + 56, tx + 62, ty - 14, '#2a6a6a');
    R(tx + 48, ty - 16, 1, 10, '#5a5a6a');
    RR(tx + 46, ty - 19, 5, 4, 1, '#3a3a4a');
  }
  // ringside floor shadow under the ring
  R(cx - half - 8, frontY + 2, half * 2 + 16, 44, (x, y) => (dth(x, y, 6) ? shA(venueDark(venue), 0.2) : null));
  // mat: trapezoid with canvas texture, seams, scuffs and the logo
  const matTop = '#d2cadc';
  const matBot = '#b8aecb';
  for (let y = backY; y <= frontY; y++) {
    const tt = (y - backY) / (frontY - backY);
    const hw = Math.round(backHalf + (half - backHalf) * tt);
    R(cx - hw, y, hw * 2, 1, (x, yy) => {
      const base = mixc(matTop, matBot, tt);
      const n = hash2(x, yy, 31);
      return n < 0.05 ? shA(base, 0.12) : n > 0.96 ? liA(base, 0.25) : base;
    });
  }
  // seams
  for (const u of [0.33, 0.66]) {
    const x0 = cx - backHalf + Math.round(backHalf * 2 * u);
    const x1 = cx - half + Math.round(half * 2 * u);
    L(x0, backY, x1, frontY, (_x, _y, o) => shA(o, 0.1));
  }
  HL(cx - backHalf, cx + backHalf, backY, shA(matTop, 0.25));
  // scuffs
  for (let i = 0; i < 14; i++) {
    const sx = cx - half + 20 + ((hash2(i, 41) * (half * 2 - 40)) | 0);
    const sy = backY + 4 + ((hash2(i, 42) * (frontY - backY - 8)) | 0);
    const len = 3 + ((hash2(i, 43) * 6) | 0);
    HL(sx, sx + len, sy, (_x, _y, o) => mixc(o, '#8a7a9a', 0.35));
  }
  // logo
  const ly = Math.round((backY + frontY) / 2) + 2;
  ell(cx, ly, 30, 9, mixc('#9c2537', matBot, 0.55));
  ell(cx, ly, 27, 7, mixc('#d8434b', matBot, 0.45));
  pixelText2(cx - 5, ly - 2, 'ACW', mixc('#fbf0d9', matBot, 0.2));
  // apron skirt
  const top = frontY + 1;
  const bot = g.apronBottom;
  const skirtC = venue === 'backyard' ? '#2a2a3a' : venue === 'dungeon' ? '#1e3a36' : '#3a3478';
  R(cx - half - 3, top - 1, half * 2 + 7, 3, '#f2eef8');
  HL(cx - half - 3, cx + half + 3, top, '#c8c0e0');
  R(cx - half - 3, top + 2, half * 2 + 7, bot - top - 2, skirtC);
  for (let x = cx - half - 3; x < cx + half + 4; x++) if ((x & 7) === 0) VL(x, top + 3, bot - 1, shA(skirtC, 0.18));
  // stitching
  for (let x = cx - half; x < cx + half; x += 2) P(x, top + 4, liA(skirtC, 0.3));
  for (let x = cx - half; x < cx + half; x += 2) P(x, bot - 4, liA(skirtC, 0.3));
  HL(cx - half - 3, cx + half + 3, bot - 1, shA(skirtC, 0.5));
  HL(cx - half - 3, cx + half + 3, bot, AK);
  const banner = venue === 'backyard' ? 'BACKYARD BRAWL' : venue === 'dungeon' ? 'THE DUNGEON' : 'ALLEY CHAMPIONSHIP WRESTLING';
  const letter = venue === 'dungeon' ? '#7affd4' : '#ffd560';
  pixelText2(cx - banner.length * 2, top + 10, banner, letter);
  for (const sx of [cx - half + 8, cx + half - 14]) {
    const st = ['..#..', '.###.', '#####', '.###.', '#.#.#'];
    st.forEach((r, yy) => [...r].forEach((ch, xx) => { if (ch === '#') P(sx + xx, top + 9 + yy, '#f6f0f4'); }));
  }
  // steel steps at the front-right corner
  const sx = cx + half + 6;
  for (let k = 0; k < 3; k++) {
    R(sx + k * 4, frontY + 4 + k * 6, 16 - k * 4, 6, k === 0 ? '#5a5a72' : '#4a4a5e');
    HL(sx + k * 4, sx + 15 - k * 4 + k * 4 - 1, frontY + 4 + k * 6, '#8a8aa0');
  }
  R(sx, frontY + 4, 1, 18, '#8a8aa0');
  // back posts with turnbuckle pads, and the back ropes
  for (const s of [-1, 1]) {
    const px = cx + s * backHalf;
    post(px, backY, 50, g.ropeB, false);
  }
  for (let i = 0; i < 3; i++) {
    const y = backY - g.ropeB[i];
    curve(cx - backHalf + 2, y, cx + backHalf - 2, y, 1, ROPES[i]);
    curve(cx - backHalf + 2, y + 1, cx + backHalf - 2, y + 1, 1, shA(ROPES[i], 0.45));
    // side ropes
    for (const s of [-1, 1]) {
      L(cx + s * backHalf, y, cx + s * half, frontY - g.ropeF[i], ROPES[i]);
      L(cx + s * backHalf, y + 1, cx + s * half, frontY - g.ropeF[i] + 1, shA(ROPES[i], 0.4));
    }
  }
  void h;
}

function post(x: number, yb: number, hgt: number, ropes: number[], front: boolean): void {
  R(x - 2, yb - hgt, 5, hgt, '#9aa2c8');
  VL(x - 2, yb - hgt, yb - 1, '#d8dcf0');
  VL(x + 2, yb - hgt, yb - 1, '#5a6290');
  RR(x - 3, yb - hgt - 3, 7, 4, 1, '#e8eaf6');
  HL(x - 2, x + 2, yb - hgt - 3, '#ffffff');
  ropes.forEach((rh, i) => {
    const py = yb - rh - 3;
    const c = i === 1 ? '#ffd050' : '#d8404e';
    RR(x - 4, py, 9, 7, 2, c);
    HL(x - 3, x + 3, py, liA(c, 0.45));
    VL(x + 4, py + 1, py + 5, shA(c, 0.4));
    HL(x - 3, x + 3, py + 6, shA(c, 0.5));
    if (front) P(x, py + 3, shA(c, 0.25));
  });
}

function drawFrontRopes(g: RingGeo, t: number, shake: number): void {
  const { cx, half, frontY } = g;
  for (let i = 0; i < 3; i++) {
    const y = frontY - g.ropeF[i];
    const wob = Math.sin(t * 30 + i) * shake * 2.5;
    curve(cx - half + 2, y, cx + half - 2, y, 1.5 + wob, shA(ROPES[i], 0.45));
    curve(cx - half + 2, y - 1, cx + half - 2, y - 1, 1.5 + wob, ROPES[i]);
    curve(cx - half + 2, y - 2, cx + half - 2, y - 2, 1.5 + wob, (x, yy, o) => (o ? null : dth(x, yy, 7) ? liA(ROPES[i], 0.4) : null));
  }
  for (const s of [-1, 1]) post(cx + s * half, frontY, 60, g.ropeF, true);
}

function gusSprite(): Spr {
  return OUT(mkSpr(24, 34, () => {
    // Gus Gravel: headset, mustache, loud blazer
    const sk = '#e8a982';
    RR(3, 16, 18, 16, 3, '#c9404c');
    R(9, 16, 6, 12, '#fbf0d9');
    R(10, 18, 4, 1, '#3f74d8');
    R(11, 19, 2, 6, '#3f74d8');
    R(4, 17, 2, 14, '#9c2537');
    ell(12, 9, 6, 7, sk);
    R(15, 6, 3, 6, shA(sk, 0.3));
    R(6, 2, 12, 4, '#6a6070');
    R(6, 2, 12, 1, '#8a8aa0');
    P(9, 9, AK);
    P(14, 9, AK);
    HL(9, 14, 12, '#5a3a4a');
    HL(10, 13, 13, '#5a3a4a');
    // headset
    for (let y = 3; y <= 11; y++) P(5, y, '#2a2a3a');
    R(4, 8, 3, 4, '#3a3a4a');
    L(6, 12, 9, 14, '#2a2a3a');
    P(10, 14, '#5a5a6a');
    P(19, 7, '#2a2a3a');
  }), selA);
}

// =====================================================================
//  Lights
// =====================================================================

function buildGlow(w: number, h: number, g: RingGeo, venue: Venue): HTMLCanvasElement {
  const c = makeCanvas(w, h);
  const x = ctx2d(c);
  const glow = (gx: number, gy: number, r: number, color: string, a: number) => {
    const grd = x.createRadialGradient(gx, gy, 0, gx, gy, r);
    grd.addColorStop(0, hexA(color, a));
    grd.addColorStop(0.5, hexA(color, a * 0.35));
    grd.addColorStop(1, hexA(color, 0));
    x.fillStyle = grd;
    x.fillRect(gx - r, gy - r, r * 2, r * 2);
  };
  if (venue === 'sportatorium') {
    for (let gx = 40; gx < w; gx += 80) glow(gx, 51, 16, ['#ff7aa8', '#7ae0ff', '#fff0c0'][Math.floor(gx / 80) % 3], 0.8);
    for (let gx = 0; gx < w; gx += 9) glow(gx, 27 + Math.sin((gx / w) * Math.PI) * 12, 5, ['#ffd36b', '#ff7aa8', '#7ae0ff'][(gx / 9) % 3], 0.55);
  } else if (venue === 'vfw') {
    for (let gx = 30; gx < w; gx += 120) glow(gx + 30, 8, 40, '#fff6d8', 0.35);
    glow(w - 29, 6, 14, '#ff7a7a', 0.5);
  } else if (venue === 'dungeon') {
    glow(g.cx, 6, 90, '#7affd4', 0.45);
  } else if (venue === 'fair') {
    for (let gx = 0; gx < w; gx += 8) glow(gx, 21 + Math.sin((gx / w) * Math.PI) * 10, 5, ['#ffd36b', '#ff7aa8', '#7ae0ff'][(gx / 8) % 3], 0.5);
    glow(w - 70, 42, 50, '#ff9ad0', 0.3);
  } else {
    glow(w * 0.72, g.backY - 70, 40, '#fff0b0', 0.5);
  }
  return c;
}

function hexA(hex: string, a: number): string {
  const n = col(hex);
  return `rgba(${n & 255},${(n >>> 8) & 255},${(n >>> 16) & 255},${a.toFixed(3)})`;
}

function buildBeams(_w: number, h: number, g: RingGeo, venue: Venue): Statics['beams'] {
  if (venue === 'backyard') return [];
  const mk = (sx: number, color: string, halfW: number, alpha: number) => {
    const c = makeCanvas(halfW * 2 + 20, h);
    const x = ctx2d(c);
    const cx = halfW + 10;
    const img = x.createImageData(c.width, c.height);
    const d = img.data;
    const n = col(color);
    const ty = g.frontY + 6;
    for (let y = 0; y < c.height; y++) {
      const k = y / ty;
      const hw = 3 + (halfW - 3) * Math.min(1, k);
      for (let xx = 0; xx < c.width; xx++) {
        const dx = Math.abs(xx - cx);
        if (dx > hw) continue;
        const edge = 1 - dx / hw;
        const fall = y < ty ? 1 : Math.max(0, 1 - (y - ty) / 30);
        const a = alpha * Math.pow(edge, 0.8) * fall * (0.55 + 0.45 * (1 - k * 0.6));
        // ordered dither into 6 alpha steps for a pixel look
        const steps = Math.floor(a * 6 + (((xx & 3) * 4 + (y & 3)) % 16) / 16);
        if (steps <= 0) continue;
        const i = (y * c.width + xx) * 4;
        d[i] = n & 255;
        d[i + 1] = (n >>> 8) & 255;
        d[i + 2] = (n >>> 16) & 255;
        d[i + 3] = Math.min(255, steps * 34);
      }
    }
    x.putImageData(img, 0, 0);
    return { c, x: sx - cx, sway: 0, phase: 0 };
  };
  if (venue === 'vfw') return [{ ...mk(g.cx, '#ffe0a0', 70, 0.5), sway: 0 }];
  if (venue === 'dungeon') return [{ ...mk(g.cx, '#7affd4', 90, 0.35), sway: 0 }];
  if (venue === 'fair') return [{ ...mk(g.cx - 60, '#ffb0d0', 60, 0.4), sway: 10, phase: 0 }, { ...mk(g.cx + 60, '#b0e0ff', 60, 0.4), sway: 10, phase: 2 }];
  return [
    { ...mk(g.cx - 70, '#ff7aa8', 56, 0.55), sway: 16, phase: 0 },
    { ...mk(g.cx + 70, '#7ae0ff', 56, 0.55), sway: 16, phase: Math.PI },
    { ...mk(g.cx, '#fff0c0', 70, 0.6), sway: 4, phase: 1 },
  ];
}

function buildVignette(w: number, h: number): HTMLCanvasElement {
  const c = makeCanvas(w, h);
  const x = ctx2d(c);
  const grd = x.createRadialGradient(w / 2, h * 0.55, h * 0.35, w / 2, h * 0.55, w * 0.72);
  grd.addColorStop(0, 'rgba(10,4,20,0)');
  grd.addColorStop(0.7, 'rgba(10,4,20,0.55)');
  grd.addColorStop(1, 'rgba(10,4,20,1)');
  x.fillStyle = grd;
  x.fillRect(0, 0, w, h);
  return c;
}

/** Pre-rendered soft glow sprite (for flashes, pyro, bloom). */
const glowCache = new Map<string, HTMLCanvasElement>();
export function glowSprite(r: number, color: string): HTMLCanvasElement {
  const key = `${r}|${color}`;
  let c = glowCache.get(key);
  if (c) return c;
  c = makeCanvas(r * 2, r * 2);
  const x = ctx2d(c);
  const grd = x.createRadialGradient(r, r, 0, r, r, r);
  grd.addColorStop(0, hexA(color, 0.9));
  grd.addColorStop(0.4, hexA(color, 0.35));
  grd.addColorStop(1, hexA(color, 0));
  x.fillStyle = grd;
  x.fillRect(0, 0, r * 2, r * 2);
  glowCache.set(key, c);
  return c;
}

/** Lens flare streak for finishers. */
let flareCanvas: HTMLCanvasElement | null = null;
export function flareSprite(): HTMLCanvasElement {
  if (flareCanvas) return flareCanvas;
  const W = 160;
  const H = 40;
  const c = makeCanvas(W, H);
  const x = ctx2d(c);
  const grd = x.createLinearGradient(0, 0, W, 0);
  grd.addColorStop(0, 'rgba(255,240,200,0)');
  grd.addColorStop(0.5, 'rgba(255,250,230,0.9)');
  grd.addColorStop(1, 'rgba(255,240,200,0)');
  x.fillStyle = grd;
  x.fillRect(0, H / 2 - 1, W, 2);
  x.globalAlpha = 0.35;
  x.fillRect(0, H / 2 - 3, W, 6);
  x.globalAlpha = 1;
  for (const [ox, r, col2] of [[-40, 6, '#ff9ad0'], [30, 4, '#7ae0ff'], [55, 8, '#ffd36b']] as [number, number, string][]) {
    const g2 = x.createRadialGradient(W / 2 + ox, H / 2, 0, W / 2 + ox, H / 2, r);
    g2.addColorStop(0, hexA(col2, 0.6));
    g2.addColorStop(1, hexA(col2, 0));
    x.fillStyle = g2;
    x.fillRect(W / 2 + ox - r, H / 2 - r, r * 2, r * 2);
  }
  flareCanvas = c;
  return c;
}

// =====================================================================
//  Per-frame drawing
// =====================================================================

/** Draw everything behind the wrestlers. */
export function drawArenaBack(ctx: CanvasRenderingContext2D, w: number, h: number, o: ArenaOpts): RingGeo {
  const g = ringGeo(w, h);
  const { venue, t, crowd } = o;
  const st = getStatics(w, h, venue, crowd);
  ctx.drawImage(st.back, 0, 0);
  // Fans, back rows first.
  const level = crowd.level;
  const chantOn = !!crowd.chant;
  const chantBeat = Math.floor(t * 4) % 2 === 0;
  const dimBoost = Math.max(0, 0.08 - level * 0.08);
  for (let r = crowd.rows - 1; r >= 0; r--) {
    const baseY = st.rowY[r];
    const dim = Math.min(0.85, st.rowDim[r] + dimBoost);
    for (const f of crowd.fans) {
      if (f.row !== r) continue;
      const excite = level * f.hype;
      let state: FanState = 'sit';
      if (crowd.boo > 0.3 && f.mark && (f.hype + f.phase) % 1 < crowd.boo) state = 'boo';
      else if (chantOn) state = chantBeat === (f.phase > Math.PI) ? 'up' : 'sit';
      else if (crowd.jump > 0.8 && f.hype > 1.0) state = 'jump';
      else if (excite + crowd.jump * f.hype > 0.95 || (f.sign && excite > 0.3)) state = 'up';
      const bob = Math.sin(t * (3 + excite * 5) + f.phase) * (0.4 + excite * 1.4) + crowd.jump * f.hype * 3 * (0.5 + 0.5 * Math.sin(f.phase * 3));
      const y = Math.round(baseY - Math.max(0, bob));
      const spr = fanSprite(f.v, state, dim, st.dark, f.prop, f.sign, !!f.agnes);
      ctx.drawImage(spr, Math.round(f.x) - 16, y - 33);
      if (f.agnes) {
        // the purse swings from her raised hand
        const swing = Math.sin(t * 5) * (0.4 + excite) * 5;
        const hx = f.x + 7;
        const hy = y - 26 - (state === 'up' || state === 'jump' ? 6 : 0);
        ctx.strokeStyle = '#ffd050';
        ctx.fillStyle = '#ffd050';
        const px = hx + swing;
        const py = hy + 7 - Math.abs(swing) * 0.3;
        ctx.fillRect(Math.round((hx + px) / 2), Math.round((hy + py) / 2), 1, 1);
        ctx.fillStyle = '#d8404e';
        ctx.fillRect(Math.round(px) - 2, Math.round(py), 5, 4);
        ctx.fillStyle = '#9a2c48';
        ctx.fillRect(Math.round(px) - 2, Math.round(py) + 3, 5, 1);
        ctx.fillStyle = '#ffd050';
        ctx.fillRect(Math.round(px), Math.round(py) + 1, 1, 1);
      }
    }
  }
  // Camera flashes in the crowd.
  for (const fl of crowd.flashes) {
    const fy = st.rowY[Math.min(crowd.rows - 1, Math.floor(fl.y * crowd.rows))] - 20 - fl.y * 6;
    const k = Math.min(1, fl.t * 6);
    ctx.globalAlpha = k;
    ctx.drawImage(glowSprite(10, '#ffffff'), Math.round(fl.x) - 10, Math.round(fy) - 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(Math.round(fl.x) - 1, Math.round(fy), 3, 1);
    ctx.fillRect(Math.round(fl.x), Math.round(fy) - 1, 1, 3);
    ctx.globalAlpha = 1;
  }
  ctx.drawImage(st.mid, 0, 0);
  return g;
}

/** Ropes and front posts, drawn over the wrestlers. */
export function drawRopesFront(ctx: CanvasRenderingContext2D, g: RingGeo, t: number, shake: number, w: number, h: number, venue: Venue, crowd: Crowd): void {
  const st = getStatics(w, h, venue, crowd);
  if (shake < 0.02) {
    ctx.drawImage(st.front, 0, 0);
    return;
  }
  const spr = mkSpr(w, h, () => drawFrontRopes(g, t, shake));
  ctx.drawImage(toCanvas(spr), 0, 0);
}

/** Spotlight beams, haze, bloom, color washes and the vignette, drawn last. */
export function drawLights(ctx: CanvasRenderingContext2D, w: number, h: number, g: RingGeo, o: ArenaOpts, dust: { x: number; y: number }[]): void {
  const st = getStatics(w, h, o.venue, o.crowd);
  const heat = o.crowd.level;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // beams
  for (const b of st.beams) {
    const sway = Math.sin(o.t * 0.7 + b.phase) * b.sway;
    ctx.globalAlpha = 0.5 + o.drama * 0.35 + heat * 0.15;
    ctx.drawImage(b.c, Math.round(b.x + sway), 0);
  }
  // dust in the beams
  ctx.globalAlpha = 0.35 + o.drama * 0.2;
  ctx.fillStyle = '#fff6e0';
  for (const d of dust) ctx.fillRect(Math.round(d.x), Math.round(d.y), 1, 1);
  // fixture bloom (flickers a touch)
  ctx.globalAlpha = 0.75 + Math.sin(o.t * 9) * 0.08;
  ctx.drawImage(st.glow, 0, 0);
  // crowd heat wash
  const wash = o.venue === 'dungeon' ? '#2fa59a' : heat > 0.66 ? '#ff5d3c' : heat > 0.35 ? '#ffb040' : '#4a6ad0';
  ctx.globalAlpha = 0.04 + heat * 0.09 + o.drama * 0.04;
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, g.apronBottom);
  ctx.restore();
  // haze over the back rows (atmospheric perspective)
  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = st.dark;
  ctx.fillRect(0, 0, w, st.rowY[st.rowY.length - 1] - 10);
  ctx.globalAlpha = 0.1;
  ctx.fillRect(0, 0, w, g.backY - 40);
  ctx.restore();
  // vignette
  ctx.save();
  ctx.globalAlpha = 0.5 + o.drama * 0.35;
  ctx.drawImage(st.vignette, 0, 0);
  ctx.restore();
}

export { mix };
