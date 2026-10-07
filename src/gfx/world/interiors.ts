/**
 * Interior furniture and wall decor (Golden Hour Storybook).
 *
 * Every sprite is built once with the pixel kit and cached; draw() only blits.
 * Objects are front-facing 3/4 views: a lighter top surface over a front face,
 * lit from the top-left, with selective coloured outlines (never black) and a
 * soft plum floor shadow falling to the lower right.
 *
 * Anchor = bottom-centre of the footprint. Wall-mounted pieces (window,
 * poster, photo, calendar, corkboard, torch, door-wall) are not solid.
 */
import { noteCaster } from '../../world/atmosphere';
import { registerObject } from '../../world/registry';
import type { MapObject, ObjectKind } from '../../world/types';
import { FT, T, TC, TW } from '../font';
import { AK, type Color, circ, col, curve, DS, dth, ell, GP, hash2, HL, L, liA, mixc, mkSpr, OUT, P, poly, R, rng, RR, RRB, selA, shA, type Spr, toCanvas, VL } from '../kit';

// ================================================================ build + cache

export interface Built {
  c: HTMLCanvasElement;
  ox: number;
  oy: number;
}
export type Shape = ['e', number, number, number, number] | ['r', number, number, number, number];

const BUILT = new Map<string, Built>();

/** Plum shadow pixel with alpha (buffers are ABGR). */
export const SH = (a: number) => ((a << 24) | (0x40 << 16) | (0x21 << 8) | 0x2b) >>> 0;
/** Arbitrary colour with alpha. */
export function alpha(c: Color, a: number): number {
  return ((col(c) & 0x00ffffff) | ((a & 255) << 24)) >>> 0;
}

export interface ArtOpts {
  /** Selective outline (default true). */
  outline?: boolean;
  /** Floor shadow shapes in body coordinates (may reach PAD px outside). */
  shadow?: Shape[];
  /** Shadow strength 0..255. */
  shA?: number;
  /** Extra overlay drawn after the outline (glows that should not be outlined). */
  over?: () => void;
}
const PAD = 5;

/**
 * Build-and-cache an object sprite. body() draws into a w x h box whose
 * bottom-centre is the anchor. Returns the canvas and its offset from the anchor.
 */
export function art(key: string, w: number, h: number, body: () => void, o: ArtOpts = {}): Built {
  const hit = BUILT.get(key);
  if (hit) return hit;
  let s: Spr = mkSpr(w, h, body);
  const outlined = o.outline !== false;
  if (outlined) s = OUT(s, selA);
  const off = outlined ? 1 : 0;
  const W = w + PAD * 2;
  const H = h + PAD * 2;
  let mask: Spr | null = null;
  if (o.shadow) {
    const shp = o.shadow;
    mask = mkSpr(W, H, () => {
      for (const sh of shp) {
        if (sh[0] === 'e') ell(sh[1] + PAD, sh[2] + PAD, sh[3], sh[4], 1);
        else R(sh[1] + PAD, sh[2] + PAD, sh[3], sh[4], 1);
      }
    });
  }
  const a = o.shA ?? 92;
  const fin = mkSpr(W, H, () => {
    if (mask) {
      const m = mask;
      const at = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : m.d[y * W + x]);
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          if (!at(x, y)) continue;
          const edge = !at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1);
          if (edge ? dth(x, y, 8) : true) P(x, y, SH(edge ? Math.round(a * 0.8) : a));
        }
    }
    DS(s, PAD - off, PAD - off);
    if (o.over) {
      // overlay works in body coordinates
      const sub = mkSpr(w, h, o.over);
      DS(sub, PAD, PAD);
    }
  });
  const b: Built = { c: toCanvas(fin), ox: -Math.floor(w / 2) - PAD, oy: -h - PAD };
  BUILT.set(key, b);
  return b;
}

export function blit(ctx: CanvasRenderingContext2D, o: MapObject, b: Built, dx = 0, dy = 0): void {
  const x = Math.round(o.x + b.ox + dx);
  const y = Math.round(o.y + b.oy + dy);
  ctx.drawImage(b.c, x, y);
  noteCaster(b.c, x, y);
}

/** Integer prop with a default (for props.w / props.h). */
export function num(o: MapObject, k: string, d: number): number {
  const v = Number(o.props[k]);
  return Number.isFinite(v) && v >= 1 ? Math.round(v) : d;
}
export function variant(o: MapObject, n: number): number {
  const v = Math.floor(Number(o.props.variant) || 0);
  return ((v % n) + n) % n;
}
export const frame = (t: number, n: number, fps: number, phase = 0) => Math.floor(t * fps + phase) % n;
/** Stable per-object phase so identical props don't animate in lockstep. */
export const phaseOf = (o: MapObject) => ((o.x * 7 + o.y * 13) % 97) / 9.7;

export function light(o: MapObject, dx: number, dy: number, r: number, color: string) {
  return { x: o.x + dx, y: o.y + dy, r, color };
}

// ================================================================ palette + materials

export const PAL = {
  cream: '#fbf0d9',
  cream2: '#f2dfbd',
  cream3: '#d9bf9a',
  red: '#e2544a',
  red2: '#c9404c',
  red3: '#a7384c',
  teal: '#5ec0a8',
  teal2: '#3f9a92',
  teal3: '#2d6a76',
  butter: '#fff1c2',
  butter2: '#f6d38a',
  butter3: '#e2b244',
  pink: '#ff94b4',
  pink2: '#ff5d8f',
  pink3: '#c8307a',
  gold: '#f4b63f',
  gold2: '#ffd050',
  gold3: '#c88a2a',
  plum: '#5b3f6b',
  plum2: '#4a3550',
  steel: '#f2eef6',
  steel2: '#d8dcf0',
  steel3: '#9aa2c8',
  steel4: '#6e688e',
  steel5: '#4e4870',
  leaf: '#8ab868',
  leaf2: '#6f9a5a',
  leaf3: '#4f7a5a',
  leaf4: '#355a4a',
};
export interface Wood {
  l: Color;
  b: Color;
  s: Color;
  d: Color;
}
export const HONEY: Wood = { l: '#eab673', b: '#c98a4b', s: '#9a5f3c', d: '#6e3f38' };
export const WALNUT: Wood = { l: '#b47c54', b: '#8a5640', s: '#663c36', d: '#472a34' };
export const OAK: Wood = { l: '#f0cc94', b: '#d8a86e', s: '#ac7a50', d: '#7a5040' };
export const CHERRY: Wood = { l: '#d8805e', b: '#b05a44', s: '#843e3c', d: '#5a2a36' };

/** Wood grain fill. */
export function grain(x: number, y: number, w: number, h: number, wd: Wood, seed: number, vertical = false): void {
  R(x, y, w, h, (X, Y) => {
    const g = vertical ? hash2(X, Y >> 2, seed) : hash2(X >> 2, Y, seed);
    return g < 0.12 ? shA(wd.b, 0.12) : g > 0.92 ? liA(wd.b, 0.14) : wd.b;
  });
}
/** Bevelled panel: light top-left edges, dark bottom-right. */
export function bevel(x: number, y: number, w: number, h: number, c: Color, k = 1): void {
  R(x, y, w, h, c);
  HL(x, x + w - 1, y, liA(c, 0.3 * k));
  VL(x, y, y + h - 1, liA(c, 0.18 * k));
  HL(x, x + w - 1, y + h - 1, shA(c, 0.3 * k));
  VL(x + w - 1, y, y + h - 1, shA(c, 0.22 * k));
}
/** A 3/4 view box: top surface `top` px deep over a front face. */
export function box3(x: number, y: number, w: number, h: number, top: number, c: Color, topC?: Color): void {
  const tc = topC ?? liA(c, 0.2);
  R(x, y, w, top, tc);
  HL(x, x + w - 1, y, liA(tc, 0.3));
  R(x, y + top, w, h - top, c);
  HL(x, x + w - 1, y + top, shA(c, 0.16));
  VL(x + w - 1, y + top, y + h - 1, shA(c, 0.2));
  HL(x, x + w - 1, y + h - 1, shA(c, 0.3));
}
/** Glass reflection streaks over a rect (call after drawing what's behind). */
export function glare(x: number, y: number, w: number, h: number, k = 0.35): void {
  for (let yy = 0; yy < h; yy++)
    for (let xx = 0; xx < w; xx++) {
      const s = (xx + yy * 0.9) % 22;
      if (s > 3 && s < 5) P(x + xx, y + yy, (_a, _b, o) => (o ? mixc(o, '#fff6dc', k) : o));
      else if (s > 6 && s < 7) P(x + xx, y + yy, (_a, _b, o) => (o ? mixc(o, '#fff6dc', k * 0.6) : o));
    }
}
/** Pixel-grid stamp: rows of chars mapped through pal. */
export function stampRows(rows: string[], pal: Record<string, Color>, x: number, y: number): void {
  rows.forEach((r, yy) => {
    for (let xx = 0; xx < r.length; xx++) {
      const c = pal[r[xx]];
      if (c != null) P(x + xx, y + yy, c);
    }
  });
}
/** A row of book spines. */
export function books(x: number, y: number, w: number, h: number, seed: number): void {
  const r = rng(seed);
  const cols = ['#c9424f', '#4c6ab2', '#e2b244', '#518c5c', '#c070a0', '#3f9a92', '#e2844a', '#8a5aa8', '#f2e2c4', '#6e4a3a'];
  let xx = x;
  while (xx < x + w) {
    const bw = 1 + Math.floor(r() * 3);
    if (r() < 0.08 && xx + 3 < x + w) {
      // a book leaning over
      L(xx, y + h - 1, xx + 2, y + h - 1 - Math.min(h - 1, 4), cols[Math.floor(r() * cols.length)]);
      L(xx + 1, y + h - 1, xx + 3, y + h - 1 - Math.min(h - 1, 4), cols[Math.floor(r() * cols.length)]);
      xx += 4;
      continue;
    }
    const bh = h - Math.floor(r() * 3);
    const c = cols[Math.floor(r() * cols.length)];
    const ww = Math.min(bw, x + w - xx);
    R(xx, y + h - bh, ww, bh, c);
    VL(xx, y + h - bh, y + h - 1, liA(c, 0.25));
    if (bh > 3 && r() < 0.6) HL(xx, xx + ww - 1, y + h - bh + 1, r() < 0.5 ? '#f6d38a' : shA(c, 0.3));
    xx += ww;
  }
}
/** Small tape strip. */
function tape(x: number, y: number, w = 4): void {
  R(x, y, w, 2, '#f6eed2');
  P(x + w - 1, y + 1, '#e2d6b4');
}
/** Tiny sparkle cross. */
export function sparkle(x: number, y: number, big = false): void {
  P(x, y, '#ffffff');
  P(x - 1, y, '#fff2b0');
  P(x + 1, y, '#fff2b0');
  P(x, y - 1, '#fff2b0');
  P(x, y + 1, '#fff2b0');
  if (big) {
    P(x - 2, y, '#fff8e0');
    P(x + 2, y, '#fff8e0');
    P(x, y - 2, '#fff8e0');
    P(x, y + 2, '#fff8e0');
  }
}
/** Drop shadow strip for wall-hung things (right + bottom). */
function wallShadow(x: number, y: number, w: number, h: number): void {
  VL(x + w, y + 1, y + h, SH(80));
  HL(x + 1, x + w, y + h, SH(80));
}

function reg(kind: string, def: ObjectKind): void {
  registerObject(kind, def);
}

// ================================================================ doors & wall features

reg('door-mat', {
  flat: true,
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'door-mat',
        16,
        8,
        () => {
          RR(0, 0, 16, 8, 2, '#8a5a3e');
          RR(1, 1, 14, 6, 1, '#d8a466');
          R(1, 1, 14, 6, (x, y, c) => (c && (x + y) % 3 === 0 ? '#c89058' : c));
          R(2, 2, 12, 4, (x, y, c) => (c && (x + y * 2) % 4 === 1 ? '#e6b878' : c));
          // a little red heart woven in the middle
          stampRows(['.#.#.', '#####', '.###.', '..#..'], { '#': '#d8434b' }, 6, 2);
          P(7, 2, '#ff8a8a');
          // frayed fringe
          for (let x = 1; x < 15; x += 2) {
            P(x, 0, '#b07a4a');
            P(x + 1, 7, '#b07a4a');
          }
        },
        { outline: false },
      ),
    ),
});

const CURTAINS: [Color, Color, Color][] = [
  ['#e88a9a', '#f6b4bc', '#b85a72'],
  ['#5ec0a8', '#9ce0c8', '#2d8a82'],
  ['#f6d38a', '#fff1c2', '#c8963a'],
  ['#9a7ad0', '#c4a8ea', '#6a4aa0'],
];
reg('window', {
  draw: (ctx, o) => {
    const v = variant(o, 4);
    blit(
      ctx,
      o,
      art(`window|${v}`, 24, 20, () => {
        const [cb, cl, cd] = CURTAINS[v];
        // frame
        R(2, 2, 20, 15, '#fbf0d9');
        HL(2, 21, 2, '#ffffff');
        VL(21, 2, 16, '#d6c2a4');
        // sky + far hills through the glass
        const gx = 4;
        const gy = 4;
        const gw = 16;
        const gh = 11;
        for (let yy = 0; yy < gh; yy++) {
          const t = yy / (gh - 1);
          const c = t < 0.35 ? mixc('#8cc4e4', '#b8dcec', t / 0.35) : t < 0.75 ? mixc('#b8dcec', '#fde2b0', (t - 0.35) / 0.4) : '#fde6b4';
          R(gx, gy + yy, gw, 1, (x, y) => (dth(x, y, 6) && t > 0.3 && t < 0.8 ? mixc(c, '#fff0d0', 0.3) : c));
        }
        // sun glow in the corner + a cloud
        circ(gx + 13, gy + 2, 2.5, '#fff6d8');
        P(gx + 13, gy + 2, '#ffffff');
        ell(gx + 4, gy + 3, 3, 1.3, '#ffffff');
        ell(gx + 6, gy + 2.6, 2, 1.2, '#fff8ec');
        // hills and a tiny tree line
        for (let x = 0; x < gw; x++) {
          const hy = Math.round(gy + 8 + Math.sin((x + 2) * 0.5) * 1.2);
          VL(gx + x, hy, gy + gh - 1, '#8fb87a');
          P(gx + x, hy, '#b4d48e');
        }
        ell(gx + 3, gy + 8, 2, 2, '#5e8a5a');
        ell(gx + 11, gy + 9, 2.5, 2, '#6a9a5e');
        glare(gx, gy, gw, gh, 0.4);
        // mullions
        VL(11, 4, 14, '#efe2c8');
        VL(12, 4, 14, '#d6c2a4');
        HL(4, 19, 9, '#efe2c8');
        // curtain rod with finials
        HL(0, 23, 1, PAL.gold3);
        P(0, 0, PAL.gold2);
        P(23, 0, PAL.gold2);
        HL(1, 22, 0, (x) => (x % 3 === 0 ? PAL.gold2 : null));
        // gathered curtains, tied back
        for (const [x0, dir] of [
          [0, 1],
          [23, -1],
        ] as [number, number][]) {
          for (let y = 2; y < 17; y++) {
            const tie = 10;
            const bulge = y < tie ? Math.round(((y - 2) / (tie - 2)) * 1) : y === tie ? 0 : Math.min(2, y - tie);
            const wdt = y === tie ? 3 : 4 + bulge;
            for (let k = 0; k < wdt; k++) {
              const x = x0 + dir * k;
              const c = k === wdt - 1 ? cd : (k + y) % 3 === 0 ? cl : cb;
              P(x, y, c);
            }
          }
          HL(Math.min(x0, x0 + dir * 3), Math.max(x0, x0 + dir * 3), 10, PAL.gold2);
        }
        // sill with a little succulent
        R(1, 17, 22, 2, '#fff4e0');
        HL(1, 22, 19, '#cdb898');
        R(16, 14, 4, 3, '#d27a52');
        HL(16, 19, 14, '#e8996a');
        P(17, 13, '#7aa860');
        P(18, 12, '#9ac870');
        P(19, 13, '#5e8a5a');
        P(16, 13, '#5e8a5a');
      }),
    );
  },
});

// ---------------------------------------------------------------- posters
function posterBody(v: number): void {
  const papers = ['#ff94b4', '#7a4f96', '#2f2a52', '#f6e6c8', '#f2c27a', '#fbefd8'];
  const p = papers[v];
  R(0, 0, 16, 20, p);
  R(0, 0, 16, 20, (x, y, o) => (hash2(x, y, 4 + v) < 0.06 ? mixc(o, '#c9a0a0', 0.25) : o));
  switch (v) {
    case 0: {
      // La Mariposa Dorada: a gold luchadora mask framed by butterfly wings
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        L(8, 8, 8 + Math.cos(a) * 12, 8 + Math.sin(a) * 12, '#ffb0c8');
      }
      for (const s of [-1, 1]) {
        ell(8 + s * 5.5, 9, 3, 3.2, '#ffd050');
        ell(8 + s * 5.8, 9, 1.6, 1.8, '#ff8a3a');
        ell(8 + s * 4.5, 13, 2.2, 1.6, '#f2a83a');
        P(8 + s * 7, 8, '#3ac0b0');
      }
      stampRows(
        [
          '...tttt...',
          '..tyyyyt..',
          '.tyyyyyyt.',
          '.yppyyppy.',
          'ypwkpypwky',
          'ypppyypppy',
          '.yyyyyyyy.',
          '.yyssssyy.',
          '..ysmmsy..',
          '...yyyy...',
        ],
        { t: '#3ac0b0', p: '#c8307a', y: '#ffd34a', w: '#fff6d0', k: AK, s: '#d8956a', m: '#9a2a4a' },
        3,
        3,
      );
      P(5, 4, '#fff6c0');
      R(0, 15, 16, 5, '#c8307a');
      HL(0, 15, 15, '#e8509a');
      TC('VIVA', 8, 15, '#fff4dc', FT, {});
      break;
    }
    case 1: {
      // The Mountain: a giant flexing, red eyes, huge beard
      R(0, 0, 16, 5, '#4e2f68');
      TC('BIG', 8, 0, '#ffd560', FT, {});
      const pl = '#2f1f48';
      ell(8, 15, 7, 4, pl);
      R(1, 8, 3, 6, pl);
      R(12, 8, 3, 6, pl);
      circ(2.5, 7.5, 2, pl);
      circ(13.5, 7.5, 2, pl);
      ell(8, 10, 3.5, 4, pl);
      ell(8, 13, 3.5, 2.5, '#b89aa8');
      P(7, 9, '#ff5a50');
      P(9, 9, '#ff5a50');
      ell(5, 13, 1.5, 1.5, '#5a3e7a');
      R(0, 18, 16, 2, '#ffd560');
      break;
    }
    case 2: {
      // Gorgeous Gideon: golden pompadour, sequins, a sneer
      for (let k = 0; k < 14; k++) {
        const x = Math.floor(hash2(k, 2, 9) * 16);
        const y = Math.floor(hash2(k, 3, 9) * 20);
        P(x, y, k % 3 ? '#ff8ad8' : '#ffffff');
      }
      ell(8, 16, 6, 4, '#b448a8');
      for (let x = 3; x < 14; x += 2) P(x, 15 + (x % 4 === 1 ? 1 : 0), '#ffd8f8');
      RR(5, 6, 6, 7, 2, '#f2b48a');
      ell(8, 5, 4.5, 2.5, '#ffe07a');
      ell(7, 4, 3, 1.5, '#fff6c8');
      P(6, 9, AK);
      P(9, 9, AK);
      HL(7, 9, 11, '#7a2a4a');
      P(9, 10, '#7a2a4a');
      TC('GG', 8, 0, '#ffd050', FT, {});
      sparkle(13, 4);
      break;
    }
    case 3: {
      // The Velvet Hammers, 1983: two women raising one belt (retro, faded)
      R(0, 0, 16, 5, '#c8405a');
      TC('VH', 8, 0, '#fff0d8', FT, {});
      for (const [x, hair, suit] of [
        [4, '#3a2440', '#7a3a8a'],
        [11, '#e8b860', '#3a6aa8'],
      ] as [number, Color, Color][]) {
        R(x - 2, 12, 4, 5, suit);
        RR(x - 2, 8, 4, 4, 1, '#e6ab84');
        R(x - 2, 7, 4, 2, hair);
        P(x - 3, 8, hair);
        P(x + 2, 8, hair);
        R(x - 2, 17, 2, 2, suit);
        R(x + 1, 17, 1, 2, suit);
      }
      // arms up, holding the belt between them
      L(3, 12, 6, 6, '#e6ab84');
      L(12, 12, 9, 6, '#e6ab84');
      R(5, 5, 6, 2, '#ffd050');
      R(7, 4, 2, 4, '#ffe48e');
      TC('1983', 8, 15, '#fff0d8', FT, {});
      // sun-faded
      R(0, 0, 16, 20, (x, y, o) => (dth(x, y, 3) ? mixc(o, '#f6e6c8', 0.3) : o));
      break;
    }
    case 4: {
      // Cowboy Clint Ransom: wanted-poster style
      R(0, 0, 16, 20, (_x, y, o) => (y > 15 ? '#c8763a' : o));
      for (let x = 0; x < 16; x++) if (x % 2 === 0) P(x, 0, '#a8582a');
      // hat
      ell(8, 6, 7, 1.5, '#6a3e2e');
      RR(4, 2, 8, 4, 2, '#8a5238');
      HL(4, 11, 5, '#c8962a');
      // face + bandana + moustache
      RR(5, 7, 6, 5, 1, '#e6ab84');
      P(6, 8, AK);
      P(9, 8, AK);
      HL(6, 9, 10, '#6a3e2e');
      R(4, 12, 8, 3, '#d8434b');
      P(6, 13, '#fff0d8');
      P(9, 13, '#fff0d8');
      // star badge + lasso loop
      stampRows(['.#.', '###', '#.#'], { '#': '#ffd050' }, 12, 13);
      curve(1, 15, 4, 18, 1, '#e8c890');
      TC('$5', 8, 16, '#4a2a2a', FT, {});
      break;
    }
    default: {
      // "Wednesday Night Wrestling" flyer from the VFW
      R(0, 0, 16, 6, '#3f8a86');
      TC('WED', 8, 0, '#fff4dc', FT, {});
      T('NITE', 1, 6, '#d8434b', FT, {});
      // tiny ring
      R(3, 13, 10, 3, '#3a3478');
      R(3, 12, 10, 1, '#e2dcec');
      for (const x of [3, 12]) VL(x, 9, 12, '#9aa2c8');
      HL(4, 11, 10, '#e8404e');
      HL(4, 11, 11, '#f6f0f4');
      // "text" lines + tear-off tabs
      HL(2, 13, 17, '#a8a0b8');
      for (let x = 1; x < 16; x += 3) VL(x, 18, 19, '#c8c0d0');
      break;
    }
  }
}
reg('poster', {
  draw: (ctx, o) => {
    const v = variant(o, 6);
    blit(
      ctx,
      o,
      art(
        `poster|${v}`,
        17,
        21,
        () => {
          posterBody(v);
          // curled corner + tape + shadow
          P(15, 19, '#d8b0a0');
          P(14, 19, mixc(GP(14, 19), '#ffffff', 0.4));
          P(15, 18, mixc(GP(15, 18), '#ffffff', 0.4));
          wallShadow(0, 0, 16, 20);
          tape(0, 0, 3);
          tape(13, 0, 3);
        },
        { outline: false },
      ),
    );
  },
});

reg('photo', {
  draw: (ctx, o) => {
    const v = variant(o, 5);
    blit(
      ctx,
      o,
      art(
        `photo|${v}`,
        13,
        13,
        () => {
          const frames: Color[] = [PAL.gold2, '#8a5640', '#f6f0e6', PAL.gold2, '#5a3a4a'];
          const fr = frames[v];
          // nail + string
          L(6, 0, 2, 3, '#8a7a7a');
          L(6, 0, 10, 3, '#8a7a7a');
          P(6, 0, '#5a4a5a');
          RRB(0, 2, 12, 10, 1, shA(fr, 0.3), fr);
          HL(1, 10, 3, liA(fr, 0.4));
          const x = 2;
          const y = 4;
          switch (v) {
            case 0: // the Velvet Hammers, sepia
              R(x, y, 8, 6, '#e8c8a0');
              R(x + 1, y + 1, 2, 2, '#6a4a3a');
              R(x + 1, y + 3, 2, 3, '#a85a5a');
              R(x + 5, y + 1, 2, 2, '#c89a5a');
              R(x + 5, y + 3, 2, 3, '#5a6a9a');
              HL(x + 2, x + 6, y + 2, '#f2c050');
              break;
            case 1: // family on the porch
              R(x, y, 8, 6, '#9cc8e0');
              R(x, y + 4, 8, 2, '#7aa860');
              for (const [px, c] of [
                [1, '#d8434b'],
                [3, '#3f9a92'],
                [5, '#f6d38a'],
              ] as [number, Color][]) {
                P(x + px, y + 2, '#e6ab84');
                R(x + px, y + 3, 1 + (px === 3 ? 1 : 0), 2, c);
              }
              break;
            case 2: // sunset over Chokeslam Creek
              R(x, y, 8, 2, '#f0a890');
              R(x, y + 2, 8, 1, '#fcd8a0');
              R(x, y + 3, 8, 3, '#5a7ab0');
              circ(x + 5, y + 3, 1.2, '#fff4c0');
              HL(x + 1, x + 6, y + 4, '#8aa8d0');
              break;
            case 3: // holding up a title belt
              R(x, y, 8, 6, '#3a3058');
              P(x + 4, y + 1, '#e6ab84');
              R(x + 3, y + 2, 3, 3, '#d8434b');
              R(x + 1, y + 2, 7, 1, '#ffd050');
              P(x + 4, y + 2, '#fff0a0');
              break;
            default: // a sleepy dog
              R(x, y, 8, 6, '#f2dfbd');
              ell(x + 4, y + 4, 3, 1.6, '#c88a5a');
              P(x + 2, y + 2, '#a86a3a');
              P(x + 2, y + 3, '#c88a5a');
              P(x + 1, y + 3, AK);
          }
          glare(x, y, 8, 6, 0.3);
          wallShadow(0, 2, 12, 10);
        },
        { outline: false },
      ),
    );
  },
});

reg('calendar', {
  label: () => 'Check',
  hit: { x: -10, y: -8, w: 20, h: 22 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'calendar',
        13,
        15,
        () => {
          P(6, 0, '#5a4a5a');
          L(6, 0, 3, 2, '#8a7a7a');
          L(6, 0, 9, 2, '#8a7a7a');
          R(0, 2, 12, 12, '#fbf6ea');
          // picture: a ring at sunset
          R(0, 2, 12, 5, '#f0a890');
          R(0, 5, 12, 2, '#3a3478');
          HL(1, 10, 4, '#e8404e');
          VL(1, 3, 5, '#e2dcec');
          VL(10, 3, 5, '#e2dcec');
          // spiral binding
          for (let x = 1; x < 12; x += 2) P(x, 2, '#9aa2c8');
          // day grid, Wednesdays and Saturdays circled for show nights
          for (let r = 0; r < 3; r++)
            for (let c = 0; c < 5; c++) {
              const x = 1 + c * 2;
              const y = 8 + r * 2;
              P(x, y, '#a8a0b8');
            }
          for (let r = 0; r < 3; r++) {
            P(5, 8 + r * 2, '#d8434b');
            P(9, 8 + r * 2, '#d8434b');
          }
          P(4, 8, '#ff6a6a');
          P(6, 8, '#ff6a6a');
          wallShadow(0, 2, 12, 12);
        },
        { outline: false },
      ),
    ),
});

// ---------------------------------------------------------------- door set into a wall
reg('door-wall', {
  draw: (ctx, o) => {
    const text = String(o.props.text ?? '').toUpperCase();
    const v = variant(o, 3);
    blit(
      ctx,
      o,
      art(
        `door-wall|${v}|${text}`,
        32,
        32,
        () => {
          const wd = [HONEY, WALNUT, OAK][v];
          const cx = 16;
          const x0 = cx - 8;
          // casing / frame
          R(x0, 4, 16, 28, '#fbf0d9');
          HL(x0, x0 + 15, 4, '#ffffff');
          VL(x0 + 15, 4, 31, '#d6c2a4');
          // dark doorway reveal + the door
          R(x0 + 2, 6, 12, 26, wd.d);
          grain(x0 + 2, 6, 12, 26, wd, 31 + v, true);
          VL(x0 + 2, 6, 31, wd.l);
          VL(x0 + 13, 6, 31, wd.s);
          HL(x0 + 2, x0 + 13, 6, wd.l);
          // two raised panels
          for (const [py, ph] of [
            [9, 8],
            [20, 9],
          ] as [number, number][]) {
            R(x0 + 4, py, 8, ph, shA(wd.b, 0.08));
            HL(x0 + 4, x0 + 11, py, wd.s);
            VL(x0 + 4, py, py + ph - 1, wd.s);
            HL(x0 + 4, x0 + 11, py + ph - 1, wd.l);
            VL(x0 + 11, py, py + ph - 1, wd.l);
          }
          // brass knob + kick plate
          circ(x0 + 11.5, 19.5, 1.3, PAL.gold2);
          P(x0 + 11, 19, '#fff4c0');
          P(x0 + 12, 20, PAL.gold3);
          R(x0 + 3, 29, 10, 2, '#d8c0a0');
          HL(x0 + 3, x0 + 12, 29, '#f2e2c8');
          // threshold shadow
          HL(x0 + 2, x0 + 13, 31, shA(wd.d, 0.3));
          // name plate (may be wider than the door, mounted over the frame)
          if (text) {
            const tw = TW(text, FT, {});
            const pw = Math.min(32, tw + 5);
            const px = Math.round(cx - pw / 2);
            RRB(px, 0, pw, 8, 1, '#7a5a3a', PAL.gold2);
            HL(px + 1, px + pw - 2, 1, '#fff0a0');
            HL(px + 1, px + pw - 2, 6, PAL.gold3);
            TC(text, cx, 2, '#4a2a2a', FT, {});
            P(px + 1, 4, '#b8802a');
            P(px + pw - 2, 4, '#b8802a');
          }
        },
        { outline: false },
      ),
    );
  },
});

// ================================================================ home

const QUILTS: Color[][] = [
  ['#e2726a', '#f6d38a', '#5ec0a8', '#fbf0d9', '#b08ad0', '#f29a8a'],
  ['#5a7ab8', '#fbf0d9', '#8ab0e0', '#f6d38a', '#3f5a98', '#c8d8f0'],
  ['#ff94b4', '#fbf0d9', '#f6b4bc', '#9ce0c8', '#e8789a', '#fff1c2'],
];
reg('bed', {
  solid: { x: -12, y: -32, w: 24, h: 30 },
  label: () => 'Sleep',
  draw: (ctx, o) => {
    const v = variant(o, 3);
    blit(
      ctx,
      o,
      art(
        `bed|${v}`,
        24,
        36,
        () => {
          const wd = v === 1 ? WALNUT : HONEY;
          // headboard with a carved heart
          RR(1, 1, 22, 11, 3, wd.b);
          grain(2, 2, 20, 9, wd, 51, true);
          HL(3, 20, 1, wd.l);
          HL(2, 21, 2, liA(wd.b, 0.15));
          R(3, 4, 18, 6, shA(wd.b, 0.1));
          stampRows(['.#.#.', '#####', '.###.', '..#..'], { '#': v === 2 ? '#e8789a' : '#d8434b' }, 10, 5);
          for (const x of [0, 21]) {
            R(x, 2, 3, 32, wd.b);
            VL(x, 2, 33, wd.l);
            VL(x + 2, 2, 33, wd.s);
            circ(x + 1.5, 1.5, 1.6, wd.l);
          }
          // mattress top
          const q = QUILTS[v];
          R(3, 10, 18, 22, '#f6f0e6');
          // pillows
          for (const px of [4, 12]) {
            RR(px, 10, 8, 5, 2, '#fffaf0');
            HL(px + 1, px + 6, 14, '#ddd2c8');
            P(px + 1, 11, '#ffffff');
          }
          // folded-down sheet
          R(3, 15, 18, 3, '#fbf6ee');
          HL(3, 20, 17, '#d8cdc4');
          for (let x = 4; x < 20; x += 2) P(x, 16, '#e6dcd2');
          // patchwork quilt (hangs over the sides)
          for (let y = 18; y < 32; y++)
            for (let x = 2; x < 22; x++) {
              const k = (Math.floor((x - 2) / 4) + Math.floor((y - 18) / 4) * 2) % q.length;
              let c: Color = q[k];
              if ((x - 2) % 4 === 0 || (y - 18) % 4 === 0) c = shA(c, 0.08);
              if (((x - 2) % 4 === 2 && (y - 18) % 4 === 2) || hash2(x, y, 52) < 0.04) c = liA(c, 0.35);
              if (x < 3 || x > 20) c = shA(c, 0.22);
              P(x, y, c);
            }
          HL(2, 21, 18, liA(q[0], 0.3));
          // footboard
          R(1, 30, 22, 5, wd.b);
          grain(1, 30, 22, 5, wd, 53);
          HL(1, 22, 30, wd.l);
          HL(1, 22, 34, wd.d);
          for (const x of [0, 21]) {
            R(x, 29, 3, 7, wd.b);
            VL(x, 29, 35, wd.l);
            P(x + 1, 28, wd.l);
          }
        },
        { shadow: [['r', 3, 30, 23, 7]] },
      ),
    );
  },
});

reg('dresser', {
  solid: { x: -12, y: -10, w: 24, h: 9 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'dresser',
        24,
        24,
        () => {
          const wd = CHERRY;
          // top surface + doily + trinkets
          box3(0, 6, 24, 16, 4, wd.b, wd.l);
          grain(1, 11, 22, 10, wd, 61);
          ell(8, 8, 5, 1.5, '#fff8f0');
          for (let x = 4; x < 13; x += 2) P(x, 9, '#e8dcd0');
          // framed photo
          RRB(4, 0, 7, 8, 1, PAL.gold3, PAL.gold2);
          R(5, 1, 5, 5, '#e8c8a0');
          P(6, 2, '#6a4a3a');
          R(6, 3, 1, 2, '#a85a5a');
          P(8, 2, '#c89a5a');
          R(8, 3, 1, 2, '#5a6a9a');
          // perfume bottle + jewellery box
          R(15, 4, 3, 4, '#ff94b4');
          P(16, 3, PAL.gold2);
          P(15, 5, '#ffd0e0');
          R(19, 6, 4, 3, '#3f9a92');
          HL(19, 22, 6, '#7fd0b8');
          // drawers
          for (const [y, h] of [
            [11, 3],
            [15, 3],
            [19, 2],
          ] as [number, number][]) {
            if (y === 11) {
              bevel(2, y, 9, h, shA(wd.b, 0.05));
              bevel(13, y, 9, h, shA(wd.b, 0.05));
              P(6, y + 1, PAL.gold2);
              P(17, y + 1, PAL.gold2);
            } else {
              bevel(2, y, 20, h, shA(wd.b, 0.05));
              P(7, y + 1, PAL.gold2);
              P(16, y + 1, PAL.gold2);
            }
          }
          // feet
          R(1, 22, 2, 2, wd.d);
          R(21, 22, 2, 2, wd.d);
        },
        { shadow: [['r', 2, 20, 24, 5]] },
      ),
    ),
});

function crtScreen(x: number, y: number, w: number, h: number, f: number, show: 'match' | 'soap'): void {
  // glow base
  const bg = f % 2 ? '#4a7ab0' : '#4f80b8';
  R(x, y, w, h, bg);
  if (show === 'match') {
    // a tiny ring: mat, ropes, two wrestlers trading places
    R(x, y + h - 4, w, 4, '#e2dcec');
    HL(x, x + w - 1, y + h - 5, '#e8404e');
    HL(x, x + w - 1, y + h - 7, '#f6f0f4');
    VL(x + 1, y + h - 8, y + h - 1, '#c8c8e0');
    VL(x + w - 2, y + h - 8, y + h - 1, '#c8c8e0');
    const ax = x + 3 + [0, 1, 2, 1][f];
    const bx = x + w - 5 - [1, 0, 1, 2][f];
    R(ax, y + h - 7, 2, 4, '#d8434b');
    P(ax, y + h - 8, '#e6ab84');
    R(bx, y + h - 7 + (f === 2 ? 2 : 0), 2, f === 2 ? 2 : 4, '#ffd050');
    P(bx, y + h - 8 + (f === 2 ? 2 : 0), '#e6ab84');
    // crowd dots up top
    for (let k = 0; k < w; k += 2) P(x + k, y + 1 + ((k + f) % 3 === 0 ? 1 : 0), ['#f6d38a', '#ff94b4', '#9ce0c8'][(k + f) % 3]);
  } else {
    // a soap opera: two heads in a dramatic close-up
    R(x, y, w, h, '#b07aa8');
    R(x + 2, y + 2, 4, 5, '#e6ab84');
    R(x + 2, y + 1, 4, 2, '#5a3a40');
    R(x + w - 6, y + 3, 4, 5, '#c88a5e');
    R(x + w - 6, y + 2, 4, 2, '#e8c070');
    if (f % 2) P(x + w / 2, y + 4, '#ff6a8a');
  }
  // scanlines + rolling static band + curved glass glare
  for (let yy = 0; yy < h; yy += 2) R(x, y + yy, w, 1, (_a, _b, o) => mixc(o, '#1e2a48', 0.18));
  const band = y + ((f * 3) % h);
  R(x, band, w, 1, (xx, _b, o) => (hash2(xx, f, 7) < 0.5 ? mixc(o, '#ffffff', 0.45) : o));
  P(x, y, '#2a2440');
  P(x + w - 1, y, '#2a2440');
  P(x, y + h - 1, '#2a2440');
  P(x + w - 1, y + h - 1, '#2a2440');
  P(x + 1, y + 1, '#d8f0ff');
  P(x + 2, y + 1, '#a8d0f0');
  P(x + 1, y + 2, '#a8d0f0');
}

reg('tv-vcr', {
  solid: { x: -11, y: -9, w: 22, h: 8 },
  label: () => 'Watch',
  lights: (o) => [light(o, -2, -17, 40, '#8fd0ff')],
  draw: (ctx, o, t) => {
    const f = frame(t, 4, 5, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `tv-vcr|${f}`,
        24,
        28,
        () => {
          // low wooden stand with the VCR and a stack of tapes
          box3(1, 18, 22, 10, 2, WALNUT.b, WALNUT.l);
          R(3, 21, 18, 6, '#3a2834');
          R(4, 21, 16, 3, '#3a3450');
          HL(4, 19, 21, '#5a5470');
          HL(6, 13, 22, '#24202e');
          // 12:00 blinking, forever
          if (f < 2) {
            R(15, 22, 4, 1, '#ff5a50');
            P(17, 22, '#2a1a20');
          }
          for (let k = 0; k < 3; k++) {
            R(5 + k * 5, 25, 4, 2, ['#2b2140', '#3a2f50', '#2b2140'][k]);
            HL(6 + k * 5, 7 + k * 5, 25, ['#f6d38a', '#ff94b4', '#9ce0c8'][k]);
          }
          // the CRT in a wood-grain cabinet
          RR(2, 5, 20, 14, 2, '#8a5a3e');
          grain(3, 6, 18, 12, { l: '#c08a5a', b: '#a06a44', s: '#7a4a38', d: '#5a3434' }, 71);
          HL(3, 20, 5, '#c89a6a');
          RR(3, 6, 13, 11, 2, '#2a2440');
          crtScreen(4, 7, 11, 9, f, 'match');
          // dial panel
          R(17, 7, 4, 10, '#d8c8b0');
          circ(19, 9, 1.2, '#5a4a5a');
          circ(19, 13, 1.2, '#5a4a5a');
          P(19, 9, '#a89aa8');
          HL(17, 20, 16, '#b8a890');
          // rabbit ears
          L(10, 4, 6, 0, '#9aa2c8');
          L(12, 4, 17, 0, '#9aa2c8');
          P(6, 0, '#d8dcf0');
          P(17, 0, '#d8dcf0');
          R(9, 3, 4, 2, '#4e4870');
        },
        { shadow: [['r', 3, 25, 22, 4]] },
      ),
    );
  },
});

const SOFAS: [Color, Color][] = [
  ['#c86a6a', '#f6d38a'],
  ['#4f9a92', '#f29a8a'],
  ['#d8a040', '#5a7ab8'],
  ['#7a5a8a', '#f6d38a'],
];
function afghan(x: number, y: number, w: number, h: number): void {
  const cs = ['#e2b244', '#3f9a92', '#e88a9a', '#fbf0d9'];
  for (let yy = 0; yy < h; yy++)
    for (let xx = 0; xx < w; xx++) {
      const band = Math.floor((yy + Math.abs(((xx + 2) % 4) - 2)) / 2) % cs.length;
      P(x + xx, y + yy, cs[band]);
    }
  for (let xx = 0; xx < w; xx += 2) P(x + xx, y + h, cs[0]);
}
/** Upholstered seating: back, cushions, rolled arms with scrolls, pleated skirt. */
function sofa(w: number, c: Color, acc: Color, seats: number, wings: boolean): void {
  const lc = liA(c, 0.24);
  const llc = liA(c, 0.42);
  const dc = shA(c, 0.2);
  const ddc = shA(c, 0.36);
  const aw = 7;
  // back
  RR(3, 0, w - 6, 11, 3, c);
  HL(5, w - 6, 0, llc);
  HL(4, w - 5, 1, lc);
  const inner = (w - 2 * aw) / seats;
  for (let i = 0; i < seats; i++) {
    const x0 = Math.round(aw + i * inner);
    const x1 = Math.round(aw + (i + 1) * inner) - 1;
    if (i > 0) VL(x0, 2, 9, dc);
    // tufting buttons
    for (let x = x0 + 3; x < x1 - 1; x += 5) {
      P(x, 4, ddc);
      P(x - 1, 3, lc);
    }
  }
  HL(aw, w - aw - 1, 9, dc);
  HL(aw, w - aw - 1, 10, ddc);
  // seat cushions
  for (let i = 0; i < seats; i++) {
    const x0 = Math.round(aw + i * inner);
    const x1 = Math.round(aw + (i + 1) * inner) - 1;
    R(x0, 11, x1 - x0 + 1, 3, lc);
    HL(x0, x1, 11, llc);
    HL(x0, x1, 13, liA(c, 0.5));
    if (i > 0) VL(x0, 11, 13, dc);
  }
  // front face + pleated skirt
  R(aw - 2, 14, w - 2 * aw + 4, 3, c);
  HL(aw - 2, w - aw + 1, 14, ddc);
  R(aw - 2, 17, w - 2 * aw + 4, 2, dc);
  for (let x = aw - 1; x < w - aw + 2; x += 3) VL(x, 17, 18, ddc);
  // rolled arms (wings rise higher on a wingback)
  for (const [x, side] of [
    [0, 0],
    [w - aw, 1],
  ] as [number, number][]) {
    const top = wings ? 1 : 5;
    RR(x, top, aw, 19 - top, 3, side ? dc : c);
    HL(x + 1, x + aw - 2, top, llc);
    R(x + 1, top + 1, aw - 2, 2, side ? c : lc);
    // scroll on the arm front
    circ(x + aw / 2, 12, 2.2, side ? ddc : dc);
    circ(x + aw / 2, 12, 1.2, side ? c : lc);
    P(x + (side ? 1 : aw - 2), top + 3, side ? ddc : dc);
  }
  void acc;
}
reg('couch', {
  solid: { x: -20, y: -14, w: 40, h: 13 },
  draw: (ctx, o) => {
    const v = variant(o, 4);
    blit(
      ctx,
      o,
      art(
        `couch|${v}`,
        40,
        20,
        () => {
          const [c, acc] = SOFAS[v];
          sofa(40, c, acc, 2, false);
          R(2, 19, 2, 1, WALNUT.d);
          R(36, 19, 2, 1, WALNUT.d);
          // a square throw pillow, a little crooked, with tassels
          poly(
            [
              [9, 4],
              [15, 3],
              [16, 10],
              [10, 11],
            ],
            acc,
          );
          L(10, 4, 15, 3, liA(acc, 0.4));
          L(16, 10, 10, 11, shA(acc, 0.3));
          P(12, 7, shA(acc, 0.2));
          for (const [x, y] of [
            [8, 4],
            [15, 2],
            [17, 10],
            [9, 11],
          ])
            P(x, y, PAL.gold2);
          // knitted afghan draped over the back and right arm
          afghan(27, 1, 8, 12);
          for (let y = 1; y < 13; y++) P(35, y + (y & 1), '#e2b244');
        },
        { shadow: [['r', 3, 15, 39, 6]] },
      ),
    );
  },
});

reg('armchair', {
  solid: { x: -10, y: -12, w: 20, h: 11 },
  draw: (ctx, o) => {
    const v = variant(o, 4);
    blit(
      ctx,
      o,
      art(
        `armchair|${v}`,
        20,
        20,
        () => {
          const [c, acc] = SOFAS[v];
          sofa(20, c, acc, 1, true);
          // lace doily over the back
          for (let x = 7; x < 13; x++) {
            P(x, 2, '#fffaf0');
            P(x, 3, (x & 1) === 0 ? '#fffaf0' : '#efe4da');
          }
          P(8, 4, '#efe4da');
          P(11, 4, '#efe4da');
          R(1, 19, 2, 1, WALNUT.d);
          R(17, 19, 2, 1, WALNUT.d);
        },
        { shadow: [['r', 2, 14, 19, 6]] },
      ),
    );
  },
});

function rugBody(v: number, W: number, H: number): void {
  if (v === 0) {
    // braided oval rag rug
    const cs = ['#c86a6a', '#f6d38a', '#3f9a92', '#fbf0d9', '#8a6aa8', '#e2844a'];
    const cx = W / 2;
    const cy = H / 2;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const d = Math.hypot((x + 0.5 - cx) / (W / 2), (y + 0.5 - cy) / (H / 2));
        if (d > 1) continue;
        const ring = Math.floor((1 - d) * Math.min(W, H) * 0.32);
        const k = ring % cs.length;
        let c: Color = cs[k];
        // braid texture: dither each ring into its neighbour
        if ((x + y + ring) % 3 === 0) c = mixc(c, cs[(k + 1) % cs.length], 0.35);
        if (d > 0.94) c = shA(c, 0.25);
        P(x, y, c);
      }
  } else if (v === 1) {
    // persian: border, field, medallion
    R(0, 0, W, H, '#2f3a6a');
    R(1, 1, W - 2, H - 2, '#c9a24a');
    R(2, 2, W - 4, H - 4, '#2f3a6a');
    for (let x = 3; x < W - 3; x += 2) {
      P(x, 2, '#e8c870');
      P(x, H - 3, '#e8c870');
    }
    R(4, 4, W - 8, H - 8, '#a8343e');
    R(4, 4, W - 8, H - 8, (x, y, o) => (hash2(x, y, 91) < 0.06 ? shA(o, 0.15) : (x + y) % 6 === 0 ? mixc(o, '#c84a4a', 0.5) : o));
    const cx = W / 2 - 0.5;
    const cy = H / 2 - 0.5;
    const rx = Math.max(4, W / 4);
    const ry = Math.max(3, H / 4);
    for (let y = 4; y < H - 4; y++)
      for (let x = 4; x < W - 4; x++) {
        const d = Math.abs((x - cx) / rx) + Math.abs((y - cy) / ry);
        if (d < 1) P(x, y, d < 0.45 ? '#e8c870' : d < 0.62 ? '#2f3a6a' : '#f2e2c4');
      }
    for (const [x, y] of [
      [6, 6],
      [W - 7, 6],
      [6, H - 7],
      [W - 7, H - 7],
    ])
      stampRows(['.#.', '###', '.#.'], { '#': '#e8c870' }, x - 1, y - 1);
    // fringe on the short ends
    for (let y = 1; y < H - 1; y += 2) {
      P(0, y, '#f2e2c4');
      P(W - 1, y, '#f2e2c4');
    }
  } else if (v === 2) {
    // striped rag runner
    const cs = ['#3f9a92', '#fbf0d9', '#e2844a', '#fbf0d9', '#5a7ab8', '#f6d38a', '#c86a6a', '#fbf0d9'];
    for (let y = 0; y < H; y++) {
      const c = cs[Math.floor(y / 2) % cs.length];
      R(1, y, W - 2, 1, (x) => (hash2(x, y, 92) < 0.18 ? mixc(c, '#ffffff', 0.25) : hash2(x, y, 93) < 0.1 ? shA(c, 0.15) : c));
    }
    for (let y = 0; y < H; y += 2) {
      P(0, y, '#efe2c8');
      P(W - 1, y + 1, '#efe2c8');
    }
  } else {
    // harlequin diamonds, teal and cream
    R(0, 0, W, H, '#2d6a76');
    for (let y = 2; y < H - 2; y++)
      for (let x = 2; x < W - 2; x++) {
        const u = Math.floor((x + y) / 6);
        const w2 = Math.floor((x - y + 600) / 6);
        P(x, y, (u + w2) % 2 ? '#e8dcc0' : '#5ec0a8');
      }
    for (let x = 1; x < W - 1; x++) {
      P(x, 1, '#f6d38a');
      P(x, H - 2, '#f6d38a');
    }
    for (let y = 1; y < H - 1; y++) {
      P(1, y, '#f6d38a');
      P(W - 2, y, '#f6d38a');
    }
  }
}
reg('rug', {
  flat: true,
  draw: (ctx, o) => {
    const v = variant(o, 4);
    const W = num(o, 'w', 3) * 16;
    const H = num(o, 'h', 3) * 16;
    blit(ctx, o, art(`rug|${v}|${W}x${H}`, W, H, () => rugBody(v, W, H), { outline: false }));
  },
});

reg('table', {
  solid: { x: -16, y: -14, w: 32, h: 12 },
  draw: (ctx, o) => {
    const v = variant(o, 2);
    blit(
      ctx,
      o,
      art(
        `table|${v}`,
        32,
        20,
        () => {
          const wd = HONEY;
          // legs
          for (const x of [2, 27]) {
            R(x, 12, 3, 8, wd.b);
            VL(x, 12, 19, wd.l);
            VL(x + 2, 12, 19, wd.s);
          }
          for (const x of [6, 23]) R(x, 12, 2, 5, wd.d);
          if (v === 0) {
            // wood top with a lace runner, fruit bowl and a vase of daisies
            box3(0, 5, 32, 10, 7, wd.b, wd.l);
            grain(1, 6, 30, 6, { ...wd, b: wd.l }, 81);
            R(4, 7, 24, 3, '#fffaf0');
            for (let x = 4; x < 28; x += 2) {
              P(x, 10, '#efe4d8');
              P(x + 1, 6, '#efe4d8');
            }
            ell(10, 7, 4, 2, '#5a7ab8');
            ell(10, 6, 3, 1.5, '#e2544a');
            P(8, 5, '#f6d38a');
            P(11, 5, '#8ab868');
            P(12, 6, '#f29a3a');
            R(21, 3, 3, 5, '#3f9a92');
            P(21, 4, '#7fd0b8');
            for (const [x, y] of [
              [20, 1],
              [22, 0],
              [24, 1],
              [23, 2],
            ])
              stampRows(['.w.', 'wyw', '.w.'], { w: '#ffffff', y: '#f6d38a' }, x - 1, y);
          } else {
            // red gingham cloth with a scalloped hem, and a cooling pie
            R(0, 5, 32, 7, '#fbf0d9');
            for (let y = 5; y < 15; y++)
              for (let x = 0; x < 32; x++) {
                if (y >= 12 && (x % 4 === 0 || x % 4 === 3) && y === 14) continue;
                const a = Math.floor(x / 2) % 2;
                const b = Math.floor(y / 2) % 2;
                P(x, y, a && b ? '#c9404c' : a || b ? '#ee8a8a' : '#fff4ec');
              }
            HL(0, 31, 11, (x) => (x % 2 ? '#a8343e' : null));
            ell(16, 7, 6, 2.2, '#e8b060');
            ell(16, 6.6, 5, 1.6, '#d89040');
            for (let x = 12; x < 21; x += 2) P(x, 7, '#a8343e');
            P(14, 6, '#fff0c0');
            P(17, 3, '#ffffff');
            P(18, 2, '#ffffff');
            P(16, 1, '#f6f0f4');
          }
        },
        { shadow: [['r', 3, 15, 31, 6]] },
      ),
    );
  },
});

reg('chair-wood', {
  solid: { x: -5, y: -6, w: 10, h: 5 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'chair-wood',
        12,
        16,
        () => {
          const wd = HONEY;
          // back: posts, top rail, spindles
          R(1, 0, 2, 9, wd.b);
          R(9, 0, 2, 9, wd.s);
          RR(1, 0, 10, 3, 1, wd.b);
          HL(2, 9, 0, wd.l);
          for (const x of [4, 6, 8]) VL(x, 3, 7, x === 8 ? wd.s : wd.b);
          // seat with a gingham cushion
          box3(0, 7, 12, 4, 3, wd.b, wd.l);
          RR(2, 7, 8, 3, 1, '#ee8a8a');
          P(3, 8, '#c9404c');
          P(5, 8, '#fff4ec');
          P(7, 8, '#c9404c');
          // legs
          R(1, 11, 2, 5, wd.b);
          R(9, 11, 2, 5, wd.s);
          HL(3, 8, 13, wd.s);
        },
        { shadow: [['r', 2, 12, 11, 4]] },
      ),
    ),
});

reg('bookshelf', {
  solid: { x: -16, y: -10, w: 32, h: 9 },
  draw: (ctx, o) => {
    const v = variant(o, 2);
    blit(
      ctx,
      o,
      art(
        `bookshelf|${v}`,
        32,
        32,
        () => {
          const wd = v ? HONEY : WALNUT;
          R(1, 2, 30, 30, wd.b);
          grain(1, 2, 30, 30, wd, 101, true);
          // cornice
          R(0, 0, 32, 3, wd.l);
          HL(0, 31, 0, liA(wd.l, 0.3));
          HL(0, 31, 2, wd.s);
          // shelf cavities
          const shelves = [3, 10, 17, 24];
          shelves.forEach((y, i) => {
            R(3, y + 1, 26, 6, wd.d);
            books(3, y + 1, 26, 6, 300 + i * 17 + v * 5);
            HL(2, 29, y + 7, wd.l);
            HL(2, 29, y + 8, wd.s);
          });
          // knick-knacks over the books
          // a little gold trophy
          R(21, 7, 5, 4, wd.d);
          R(22, 9, 3, 2, PAL.gold3);
          ell(23.5, 7.5, 2, 1.6, PAL.gold2);
          P(23, 7, '#fff4c0');
          // a framed photo and a VHS tape lying flat
          R(5, 13, 6, 5, wd.d);
          RRB(5, 12, 5, 5, 0, PAL.gold3, '#9cc8e0');
          P(7, 14, '#e6ab84');
          R(18, 22, 8, 2, '#2b2140');
          HL(19, 24, 22, '#f6d38a');
          // a trailing pothos on top
          ell(26, 0, 4, 1.5, '#d27a52');
          for (const [x, y] of [
            [24, -1],
            [27, -1],
            [29, 0],
            [30, 2],
            [30, 4],
            [29, 6],
            [23, 0],
          ])
            P(x, Math.max(0, y), x % 2 ? '#6f9a5a' : '#8ab868');
          VL(30, 1, 7, '#5e8a5a');
          // plinth
          R(1, 30, 30, 2, wd.d);
          HL(1, 30, 30, wd.s);
        },
        { shadow: [['r', 3, 27, 31, 6]] },
      ),
    );
  },
});

reg('trunk', {
  solid: { x: -12, y: -10, w: 24, h: 9 },
  label: () => 'Open',
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'trunk',
        24,
        16,
        () => {
          const base = '#6e3e3a';
          // domed lid seen from above, then the lid front
          RR(0, 0, 24, 6, 2, '#8a5240');
          HL(2, 21, 0, '#b07258');
          R(1, 1, 22, 2, (x, y) => (hash2(x, y, 111) < 0.15 ? '#7a4638' : '#9a5c46'));
          R(0, 5, 24, 2, '#5a3036');
          // body
          R(0, 7, 24, 9, base);
          R(0, 7, 24, 9, (x, y, o) => (hash2(x >> 1, y, 112) < 0.12 ? shA(o, 0.12) : o));
          HL(0, 23, 7, '#8a5246');
          HL(0, 23, 15, '#4a2834');
          // leather straps
          for (const x of [5, 17]) {
            R(x, 0, 2, 16, '#a8703e');
            VL(x, 0, 15, '#c8905a');
            R(x - 1, 10, 4, 2, PAL.gold3);
            P(x, 10, PAL.gold2);
          }
          // brass corners + lock
          for (const [x, y] of [
            [0, 0],
            [21, 0],
            [0, 13],
            [21, 13],
          ])
            R(x, y, 3, 3, PAL.gold3);
          P(0, 0, PAL.gold2);
          P(21, 13, '#8a5a2a');
          R(10, 6, 4, 4, PAL.gold2);
          HL(10, 13, 6, '#fff0a0');
          P(11, 8, AK);
          P(12, 8, AK);
          P(11, 9, AK);
          // the faded gold star of "The Duchess" on the lid
          stampRows(['..#..', '.###.', '#####', '.###.', '.#.#.'], { '#': '#d8b860' }, 9, 0);
          P(11, 1, '#f6e09a');
          // travel stickers and her initials, worn thin
          RR(1, 9, 4, 4, 1, '#c8505a');
          P(2, 10, '#f6e0c0');
          R(19, 8, 4, 3, '#3f8a86');
          P(20, 9, '#e8f0d8');
          T('DD', 9, 11, '#c8a890', FT, {});
        },
        { shadow: [['r', 2, 12, 24, 6]] },
      ),
    ),
});

export function flame(f: number, x: number, y: number, s = 1, pal = ['#d8434b', '#f2903a', '#ffd050', '#fff4c0']): void {
  // a 4-frame flicker built from stacked teardrops
  const sway = [0, 1, 0, -1][f];
  const hgt = [8, 9, 7, 9][f] * s;
  const lobes: [number, number, number][] = [
    [-3 * s, 0, 0.7],
    [3 * s, 0, 0.75],
    [0, 0, 1],
  ];
  lobes.forEach(([dx, , k], i) => {
    const h2 = hgt * k * (i === 2 ? 1 : [0.8, 0.65, 0.9, 0.7][(f + i) % 4]);
    const cx = x + dx + sway * (i === 2 ? 1 : 0.5);
    for (let yy = 0; yy < h2; yy++) {
      const tt = yy / h2;
      const w = (1 - tt) * 2.6 * s * k + 0.4;
      const ox = sway * tt * 1.5;
      for (let xx = Math.round(cx - w + ox); xx <= Math.round(cx + w + ox); xx++) {
        const dc = Math.abs(xx - cx - ox) / Math.max(0.5, w);
        const c = tt > 0.8 || dc > 0.75 ? pal[0] : tt > 0.55 || dc > 0.5 ? pal[1] : tt > 0.25 || dc > 0.25 ? pal[2] : pal[3];
        P(xx, y - yy, c);
      }
    }
  });
  // embers
  P(x - 2 + f, y - hgt - 2, pal[2]);
  P(x + 3 - f, y - hgt - 4 + (f & 1), pal[1]);
}

reg('fireplace', {
  solid: { x: -16, y: -10, w: 32, h: 9 },
  lights: (o) => [light(o, 0, -10, 70, '#ffa850')],
  draw: (ctx, o, t) => {
    const f = frame(t, 4, 7, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `fireplace|${f}`,
        32,
        32,
        () => {
          // brick surround
          R(1, 8, 30, 22, '#b24f46');
          for (let y = 8; y < 30; y++)
            for (let x = 1; x < 31; x++) {
              const row = (y - 8) >> 2;
              const off = row & 1 ? 3 : 0;
              if ((y - 8) % 4 === 3 || (x + off) % 6 === 0) P(x, y, '#d6b6a0');
              else if (hash2((x + off) / 6 | 0, row, 121) < 0.25) P(x, y, '#9a3f40');
            }
          // arched firebox
          R(8, 16, 16, 13, '#2a1f30');
          ell(16, 16, 8, 4, '#2a1f30');
          for (let x = 8; x < 24; x++) P(x, 28, '#3a2834');
          // glow on the inner walls
          R(9, 18, 14, 10, (x, y, o) => (dth(x, y, 6) ? mixc(o, '#a8402a', 0.5) : o));
          // logs + fire
          R(10, 26, 12, 2, '#6a3e30');
          L(10, 27, 21, 25, '#8a5240');
          P(21, 25, '#f2903a');
          flame(f, 16, 26, 1);
          // stone hearth
          R(0, 29, 32, 3, '#e8dcc8');
          HL(0, 31, 29, '#fff6e6');
          HL(0, 31, 31, '#b8a898');
          for (let x = 5; x < 32; x += 9) VL(x, 30, 31, '#c8b8a8');
          // wooden mantel
          R(0, 5, 32, 4, '#8a5640');
          HL(0, 31, 5, '#b47c54');
          HL(0, 31, 8, '#5a3434');
          // on the mantel: a clock, candles, a photo
          RR(13, 0, 6, 5, 2, '#c88a5a');
          circ(16, 2.5, 1.6, '#fbf0d9');
          P(16, 2, AK);
          P(17, 2, AK);
          for (const x of [3, 28]) {
            R(x, 2, 2, 3, '#fbf0d9');
            P(x, 1, f % 2 ? '#ffd050' : '#fff4c0');
          }
          RRB(21, 1, 5, 4, 0, PAL.gold3, '#e8c8a0');
          P(23, 2, '#6a4a3a');
          R(7, 3, 3, 2, '#3f9a92');
        },
        {
          shadow: [['r', 2, 29, 31, 5]],
          over: () => {
            // warm light spilling onto the hearth
            for (let k = 0; k < 3; k++) HL(9 - k, 22 + k, 29 + k, (x, y) => (dth(x, y, 10 - k * 3) ? mixc('#fff0c8', '#ffd890', 0.5) : null));
          },
        },
      ),
    );
  },
});

reg('piano', {
  solid: { x: -16, y: -12, w: 32, h: 11 },
  label: () => 'Play',
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'piano',
        32,
        28,
        () => {
          const wd = WALNUT;
          // top lid with a vase and photo
          R(0, 3, 32, 3, wd.l);
          HL(0, 31, 3, liA(wd.l, 0.3));
          R(4, 0, 3, 4, '#c8505a');
          P(4, 0, '#ff94b4');
          P(6, 0, '#ffd050');
          RRB(23, 0, 5, 4, 0, PAL.gold3, '#9cc8e0');
          // upper case with carved music desk
          R(0, 6, 32, 9, wd.b);
          grain(1, 6, 30, 9, wd, 131, true);
          R(4, 7, 24, 6, wd.s);
          // sheet music
          R(10, 7, 6, 5, '#fbf6ea');
          R(16, 7, 6, 5, '#f2ead8');
          for (const y of [8, 10]) {
            HL(11, 15, y, '#8a7a8a');
            HL(17, 21, y, '#8a7a8a');
          }
          P(12, 9, AK);
          P(18, 9, AK);
          // candle sconces
          for (const x of [2, 29]) {
            P(x, 9, PAL.gold2);
            R(x, 7, 1, 2, '#fbf0d9');
          }
          // keyboard
          R(0, 15, 32, 4, wd.d);
          R(2, 15, 28, 3, '#fbf6ea');
          for (let x = 2; x < 30; x += 2) P(x, 17, '#d8d0c4');
          for (let x = 3; x < 30; x++) {
            const k = (x - 3) % 7;
            if (k === 0 || k === 1 || k === 3 || k === 4 || k === 5) P(x, 15, AK);
          }
          HL(2, 29, 18, wd.s);
          // lower case + pedals + toes
          R(1, 19, 30, 7, wd.b);
          grain(1, 19, 30, 7, wd, 132, true);
          R(4, 20, 24, 5, shA(wd.b, 0.08));
          HL(4, 27, 20, wd.s);
          for (const x of [13, 16, 19]) R(x, 25, 2, 1, PAL.gold2);
          R(0, 24, 3, 4, wd.b);
          R(29, 24, 3, 4, wd.s);
          HL(1, 30, 26, wd.d);
        },
        { shadow: [['r', 2, 24, 31, 6]] },
      ),
    ),
});

reg('plant', {
  solid: { x: -5, y: -5, w: 10, h: 4 },
  draw: (ctx, o) => {
    const v = variant(o, 3);
    blit(
      ctx,
      o,
      art(
        `plant|${v}`,
        12,
        20,
        () => {
          // terracotta pot on a saucer
          R(1, 18, 10, 2, '#a85a42');
          poly(
            [
              [2, 13],
              [10, 13],
              [9, 18],
              [3, 18],
            ],
            '#d27a52',
          );
          R(1, 12, 10, 2, '#e8996a');
          HL(1, 10, 12, '#f6b88a');
          VL(9, 14, 17, '#a85a42');
          P(3, 15, '#e8996a');
          HL(2, 9, 12, (x) => (x % 3 === 0 ? '#5a3a30' : null));
          if (v === 0) {
            // fern: arching fronds
            const fronds: [number, number, number][] = [
              [-5, -2, 2],
              [5, -2, 2],
              [-3, -6, 1],
              [3, -6, 1],
              [0, -9, 0],
              [-5, -6, 3],
              [5, -6, 3],
            ];
            for (const [dx, dy, s] of fronds)
              curve(6, 12, 6 + dx, 12 + dy - 2, -s, '#5e8a5a', (x, y, tt, i) => {
                if (i % 2 === 0 && tt > 0.2) {
                  P(x - 1, y, '#8ab868');
                  P(x + 1, y, '#6f9a5a');
                }
              });
            P(6, 2, '#9ac870');
          } else if (v === 1) {
            // snake plant: tall striped blades
            for (const [x, h, c] of [
              [3, 9, '#4f7a5a'],
              [5, 12, '#6f9a5a'],
              [7, 10, '#5e8a5a'],
              [9, 7, '#6f9a5a'],
              [6, 6, '#8ab868'],
            ] as [number, number, Color][]) {
              R(x, 12 - h, 2, h, c);
              P(x, 12 - h, liA(c, 0.3));
              VL(x + 1, 13 - h, 11, '#c8d070');
              for (let y = 13 - h; y < 12; y += 3) P(x, y, shA(c, 0.25));
            }
          } else {
            // flowering geranium
            for (const [x, y, r] of [
              [3, 9, 2.5],
              [8, 8, 2.8],
              [6, 5, 2.5],
              [4, 6, 2],
            ] as [number, number, number][]) {
              circ(x, y, r, '#6f9a5a');
              circ(x - 0.5, y - 0.5, r * 0.6, '#8ab868');
            }
            for (const [x, y] of [
              [5, 2],
              [9, 4],
              [2, 5],
              [7, 7],
            ])
              stampRows(['.r.', 'rRr', '.r.'], { r: '#e8505a', R: '#ffb0b0' }, x - 1, y - 1);
          }
        },
        { shadow: [['e', 7, 19, 5, 2]] },
      ),
    );
  },
});

reg('lamp-floor', {
  solid: { x: -4, y: -4, w: 8, h: 3 },
  lights: (o) => [light(o, 0, -22, 54, '#ffd890')],
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'lamp-floor',
        10,
        28,
        () => {
          // base + brass pole
          ell(5, 26.5, 4, 1.5, '#8a6a3a');
          HL(2, 7, 26, '#c8a050');
          R(4, 9, 2, 17, PAL.gold3);
          VL(4, 9, 25, PAL.gold2);
          R(3, 17, 4, 1, PAL.gold2);
          // pleated fabric shade with fringe
          poly(
            [
              [2.5, 0],
              [7.5, 0],
              [10, 9],
              [0, 9],
            ],
            '#f6d38a',
          );
          for (let x = 1; x < 10; x += 2) VL(x, 2, 8, '#e8c070');
          HL(3, 6, 0, '#fff1c2');
          HL(0, 9, 9, '#d8a050');
          for (let x = 0; x < 10; x += 2) P(x, 10, '#c88a2a');
        },
        {
          shadow: [['e', 6, 27, 4, 1.5]],
          over: () => {
            // bulb glow under the shade
            HL(2, 7, 8, '#fff6d0');
            P(4, 7, '#ffffff');
            P(5, 7, '#fffbe8');
          },
        },
      ),
    ),
});

// ================================================================ kitchen

/**
 * Kinds whose footprint depends on props.w fill in props.solid (the engine's
 * per-instance override) the first time they draw, unless the map set one.
 */
function ensureSolid(o: MapObject, s: { x: number; y: number; w: number; h: number }): void {
  if (o.props.solid == null) o.props.solid = s;
}

reg('fridge', {
  solid: { x: -7, y: -8, w: 14, h: 7 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'fridge',
        16,
        32,
        () => {
          const c = '#a9d8bf';
          RR(1, 0, 14, 31, 4, c);
          RR(1, 0, 14, 3, 2, liA(c, 0.4));
          VL(2, 2, 28, liA(c, 0.3));
          R(12, 3, 3, 26, shA(c, 0.12));
          VL(14, 3, 28, shA(c, 0.25));
          // freezer / fridge seam
          HL(1, 14, 10, shA(c, 0.35));
          HL(1, 14, 11, liA(c, 0.35));
          // chrome handles
          for (const [y0, y1] of [
            [4, 8],
            [13, 21],
          ]) {
            R(11, y0, 2, y1 - y0, '#f2eef6');
            VL(12, y0, y1 - 1, '#9aa2c8');
          }
          // badge
          R(4, 2, 5, 1, '#f2eef6');
          // magnets: a crayon drawing, a Polaroid, a show schedule
          R(3, 13, 6, 5, '#fffaf0');
          L(4, 16, 6, 14, '#e2544a');
          P(7, 15, '#4c6ab2');
          P(4, 14, '#f6d38a');
          P(6, 12, '#d8434b');
          R(4, 20, 5, 6, '#fbf6ea');
          R(5, 21, 3, 3, '#9cc8e0');
          P(6, 22, '#e6ab84');
          P(6, 19, '#3f9a92');
          R(3, 5, 4, 3, '#fff4dc');
          HL(3, 6, 5, '#3f8a86');
          P(4, 7, '#c9404c');
          circ(9, 7, 1, '#ffd050');
          circ(8, 25, 1, '#ff94b4');
          // kick grille
          R(2, 28, 12, 3, shA(c, 0.5));
          for (let x = 3; x < 14; x += 2) VL(x, 29, 30, shA(c, 0.65));
        },
        { shadow: [['r', 3, 27, 15, 6]] },
      ),
    ),
});

reg('stove', {
  solid: { x: -8, y: -9, w: 16, h: 8 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'stove',
        16,
        20,
        () => {
          const c = '#f4ead6';
          // backsplash with a clock
          R(0, 0, 16, 4, '#efe2c8');
          HL(0, 15, 0, '#fffaf0');
          circ(8, 2, 1.4, '#3f9a92');
          P(8, 2, '#fffaf0');
          // cooktop seen from above
          R(0, 4, 16, 6, '#fbf6ea');
          HL(0, 15, 4, '#ffffff');
          for (const [x, y] of [
            [4, 6],
            [11, 6],
            [4, 8.5],
            [11, 8.5],
          ]) {
            ell(x, y, 2.6, 1.3, '#4a3a4a');
            ell(x, y, 1.6, 0.7, '#6a5a6a');
          }
          // teal kettle steaming gently
          ell(11, 6, 2.6, 2, '#3f9a92');
          P(10, 5, '#7fd0b8');
          R(10, 3, 3, 1, '#2d6a76');
          P(14, 5, '#3f9a92');
          // front: knobs + oven door with a warm window
          R(0, 10, 16, 9, c);
          HL(0, 15, 10, shA(c, 0.15));
          for (let x = 2; x < 15; x += 3) P(x, 11, '#5a4a5a');
          R(2, 12, 12, 6, '#d8c8b0');
          R(3, 13, 10, 4, '#3a2834');
          R(4, 14, 8, 2, '#8a4a3a');
          HL(4, 11, 14, '#c86a3a');
          HL(2, 13, 12, '#f2eef6');
          VL(15, 10, 18, shA(c, 0.2));
          R(1, 19, 2, 1, '#5a4a5a');
          R(13, 19, 2, 1, '#5a4a5a');
        },
        { shadow: [['r', 2, 16, 16, 5]] },
      ),
    ),
});

reg('sink', {
  solid: { x: -8, y: -9, w: 16, h: 8 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'sink',
        16,
        20,
        () => {
          // tiled backsplash
          R(0, 0, 16, 4, '#e8f4ec');
          for (let x = 0; x < 16; x += 4) VL(x, 0, 3, '#c8dcd4');
          HL(0, 15, 2, '#c8dcd4');
          // counter top with the basin
          R(0, 4, 16, 6, '#f6ecd8');
          HL(0, 15, 4, '#fffaf0');
          RR(3, 5, 10, 4, 1, '#9aa2c8');
          RR(4, 5, 8, 3, 1, '#c8cce0');
          HL(4, 11, 7, '#d8dcf0');
          // gooseneck faucet
          VL(8, 1, 4, '#d8dcf0');
          HL(8, 10, 1, '#d8dcf0');
          P(10, 2, '#9aa2c8');
          P(6, 4, '#d8434b');
          P(10, 4, '#4c6ab2');
          // soap + sponge
          R(13, 2, 2, 3, '#7fd0b8');
          P(13, 1, '#3f9a92');
          R(1, 7, 2, 2, '#f6d38a');
          // cabinet doors with a gingham dish towel
          R(0, 10, 16, 9, '#5ec0a8');
          HL(0, 15, 10, '#3f9a92');
          VL(8, 11, 18, '#2d8a82');
          bevel(1, 11, 6, 7, '#6ccab2', 0.6);
          bevel(9, 11, 6, 7, '#6ccab2', 0.6);
          P(6, 13, PAL.gold2);
          P(10, 13, PAL.gold2);
          R(9, 12, 4, 6, '#fff4ec');
          for (let y = 12; y < 18; y++) for (let x = 9; x < 13; x++) if ((x + y) % 2 === 0) P(x, y, '#e8505a');
          HL(0, 15, 18, '#2d6a76');
          R(0, 19, 16, 1, '#24485a');
        },
        { shadow: [['r', 2, 16, 16, 5]] },
      ),
    ),
});

// ================================================================ diner

type CounterStyle = 'diner' | 'tile' | 'glass' | 'wood';
function counterStyle(o: MapObject): CounterStyle {
  const s = o.props.style;
  if (s === 'diner' || s === 'tile' || s === 'glass' || s === 'wood') return s;
  if (o.id.includes('diner')) return 'diner';
  if (o.id.includes('taq')) return 'tile';
  if (o.id.includes('pawn')) return 'glass';
  return 'wood';
}
function stoolArt(x: number, y: number, seat: Color): void {
  // diner stool, 10 x 12 at (x, y)
  ell(x + 5, y + 2.5, 5, 2.5, shA(seat, 0.2));
  ell(x + 5, y + 2, 4.5, 2, seat);
  ell(x + 4, y + 1.5, 2.5, 1, liA(seat, 0.4));
  R(x + 1, y + 3, 8, 2, '#d8dcf0');
  HL(x + 1, x + 8, y + 4, '#9aa2c8');
  R(x + 4, y + 5, 2, 5, '#d8dcf0');
  VL(x + 5, y + 5, y + 9, '#9aa2c8');
  HL(x + 3, x + 6, y + 8, '#f2eef6');
  ell(x + 5, y + 10.5, 3.5, 1.4, '#9aa2c8');
  HL(x + 3, x + 6, y + 10, '#f2eef6');
}
function counterItem(k: number, x: number, y: number, style: CounterStyle): void {
  // y = the counter-top surface baseline
  const pick = Math.floor(k * 4.6);
  if (style === 'diner' || style === 'tile') {
    if (pick === 0) {
      // pie under a glass dome
      ell(x, y - 1, 4, 1.4, '#f2eef6');
      ell(x, y - 2, 3, 1.2, '#e8b060');
      P(x - 1, y - 2, '#a8343e');
      ell(x, y - 4, 3.6, 3.2, (_a, _b, o) => (o ? mixc(o, '#e8f4ff', 0.35) : alpha('#e8f4ff', 110)));
      P(x - 1, y - 6, '#ffffff');
      P(x, y - 8, '#d8dcf0');
    } else if (pick === 1) {
      // napkin dispenser + sugar shaker
      R(x - 3, y - 4, 4, 4, '#d8dcf0');
      R(x - 2, y - 5, 2, 1, '#ffffff');
      R(x + 2, y - 4, 2, 4, '#f6f0f4');
      R(x + 2, y - 5, 2, 1, '#9aa2c8');
    } else if (pick === 2) {
      // coffee cup + saucer
      ell(x, y - 0.5, 3, 1, '#fbf6ea');
      R(x - 1, y - 3, 3, 3, '#ffffff');
      P(x + 2, y - 2, '#ffffff');
      P(x, y - 3, '#6a3a2a');
      P(x, y - 5, '#f2eef6');
    } else if (pick === 3) {
      // ketchup + mustard
      R(x - 2, y - 5, 2, 5, '#d8434b');
      P(x - 2, y - 6, '#f6f0f4');
      R(x + 1, y - 5, 2, 5, '#ffd050');
      P(x + 1, y - 6, '#c88a2a');
    }
  } else {
    if (pick === 0) {
      // service bell
      ell(x, y - 2, 2.5, 2, PAL.gold2);
      P(x - 1, y - 3, '#fff4c0');
      P(x, y - 4, PAL.gold3);
      HL(x - 3, x + 3, y, PAL.gold3);
    } else if (pick === 1) {
      // candy jar
      R(x - 2, y - 5, 5, 5, '#e8f4ff');
      R(x - 2, y - 3, 5, 3, '#ff94b4');
      P(x - 1, y - 3, '#ffd050');
      P(x + 1, y - 2, '#5ec0a8');
      R(x - 2, y - 6, 5, 1, '#d8434b');
    } else if (pick === 2) {
      // stack of little boxes
      R(x - 3, y - 3, 5, 3, '#c89a5a');
      R(x - 2, y - 5, 4, 2, '#e8c070');
      HL(x - 3, x + 1, y - 3, '#e8b878');
    }
  }
}
reg('counter', {
  solid: { x: -24, y: -15, w: 48, h: 14 },
  draw: (ctx, o) => {
    const n = num(o, 'w', 3);
    const W = n * 16;
    const style = counterStyle(o);
    const stools = o.props.stools === true;
    ensureSolid(o, { x: -W / 2, y: stools ? -16 : -15, w: W, h: stools ? 15 : 14 });
    // 8 px of headroom above the 20 px counter for the things standing on it
    blit(
      ctx,
      o,
      art(
        `counter|${n}|${style}|${stools ? 1 : 0}|${o.id.length}`,
        W,
        28,
        () => {
          const seed = o.id.length * 31 + n;
          const y0 = 8;
          // counter top (8 px deep) + front lip
          const top = style === 'wood' ? '#e8c890' : style === 'glass' ? '#e8f0f4' : '#f6ecd8';
          R(0, y0, W, 8, top);
          HL(0, W - 1, y0, liA(top, 0.5));
          if (style === 'diner' || style === 'tile')
            // boomerang laminate, very faint
            R(0, y0 + 1, W, 6, (x, y, c) => {
              const h = hash2(x, y, 141);
              return h < 0.018 ? '#9cd8c4' : h > 0.982 ? '#f6b4bc' : (x + y * 3) % 11 === 0 ? mixc(c, '#e8dcc4', 0.6) : c;
            });
          else if (style === 'wood') grain(0, y0 + 1, W, 6, { ...OAK, b: top }, 142);
          HL(0, W - 1, y0 + 7, '#f2eef6');
          HL(0, W - 1, y0 + 8, '#a89cc0');
          const fy = y0 + 9;
          // front face
          if (style === 'diner') {
            // mint enamel panels like the diner's facade, cherry band, chrome, kick plate
            R(0, fy, W, 2, '#d0484f');
            HL(0, W - 1, fy, '#e8706a');
            for (let y = fy + 2; y < fy + 8; y++)
              for (let x = 0; x < W; x++) P(x, y, x % 16 === 0 ? '#cdebd5' : x % 16 === 15 ? '#7fb2a6' : '#a9d8bf');
            HL(0, W - 1, fy + 2, '#e2f6e2');
            R(0, fy + 8, W, 1, '#f2eef6');
            R(0, fy + 9, W, 2, '#c9404c');
            HL(0, W - 1, fy + 10, '#8e2c4c');
          } else if (style === 'tile') {
            // talavera tiles
            for (let ty = fy; ty < fy + 10; ty += 5)
              for (let tx = 0; tx < W; tx += 5) {
                R(tx, ty, 5, 5, '#fbf6ea');
                const k = (tx / 5 + (ty - fy) / 5) % 3;
                const c = k === 0 ? '#2f6ab0' : k === 1 ? '#e8a030' : '#3f9a92';
                P(tx + 2, ty + 2, c);
                P(tx + 1, ty + 2, c);
                P(tx + 3, ty + 2, c);
                P(tx + 2, ty + 1, c);
                P(tx + 2, ty + 3, c);
                P(tx, ty, '#d8c8b0');
              }
            R(0, fy + 10, W, 1, '#8a5a4a');
          } else if (style === 'glass') {
            // glass display counter full of odds and ends
            R(0, fy, W, 11, '#4a3a4a');
            R(1, fy, W - 2, 8, '#3a3a5a');
            const r = rng(seed);
            for (let x = 3; x < W - 3; x += 4 + Math.floor(r() * 3)) {
              const c = ['#ffd050', '#d8dcf0', '#ff94b4', '#5ec0a8', '#e2544a', '#2b2140'][Math.floor(r() * 6)];
              const t = r();
              if (t < 0.3) circ(x, fy + 5, 1.5, c);
              else if (t < 0.6) R(x - 1, fy + 3, 3, 4, c);
              else {
                R(x - 2, fy + 5, 5, 2, '#2b2140');
                HL(x - 1, x + 1, fy + 5, c);
              }
            }
            glare(1, fy, W - 2, 8, 0.4);
            R(0, fy + 8, W, 3, '#5a4050');
            HL(0, W - 1, fy + 8, '#8a6a7a');
          } else {
            R(0, fy, W, 11, HONEY.b);
            grain(0, fy, W, 11, HONEY, 143, true);
            for (let x = 2; x + 12 <= W; x += 16) {
              R(x, fy + 2, 12, 6, shA(HONEY.b, 0.08));
              HL(x, x + 11, fy + 2, HONEY.s);
              VL(x, fy + 2, fy + 7, HONEY.s);
              HL(x, x + 11, fy + 7, HONEY.l);
              VL(x + 11, fy + 2, fy + 7, HONEY.l);
            }
            R(0, fy + 9, W, 2, HONEY.d);
          }
          VL(W - 1, fy, fy + 10, (_x, _y, c) => shA(c, 0.22));
          // things standing on top (every other section at least)
          for (let i = 0; i < n; i++) {
            const k = hash2(i, seed, 144);
            if (i % 2 === 0 || k < 0.4) counterItem(hash2(i, seed, 145), i * 16 + 8 + ((i * 5) % 3) - 1, y0 + 6, style);
          }
          if (stools) for (let i = 0; i < n; i++) stoolArt(i * 16 + 3, y0 + 8, '#d8434b');
        },
        { shadow: [['r', 2, 25, W + 1, 5]] },
      ),
    );
  },
});

reg('stool', {
  solid: { x: -4, y: -4, w: 8, h: 3 },
  draw: (ctx, o) => blit(ctx, o, art('stool', 10, 12, () => stoolArt(0, 0, '#d8434b'), { shadow: [['e', 6, 11, 4, 1.5]] })),
});

reg('booth', {
  solid: { x: -16, y: -15, w: 32, h: 14 },
  draw: (ctx, o) => {
    const teal = o.props.variant === 'teal' || o.props.variant === 1;
    blit(
      ctx,
      o,
      art(
        `booth|${teal ? 't' : 'r'}`,
        32,
        28,
        () => {
          const c = teal ? '#3f9a92' : '#d0444f';
          const lc = liA(c, 0.28);
          const dc = shA(c, 0.24);
          // two benches facing each other, tall tufted backs on the outside
          for (const [x0, dir] of [
            [0, 1],
            [31, -1],
          ] as [number, number][]) {
            const bx = dir > 0 ? x0 : x0 - 4;
            RR(bx, 0, 5, 27, 2, c);
            VL(bx + (dir > 0 ? 0 : 4), 2, 25, dir > 0 ? lc : dc);
            for (let y = 3; y < 24; y += 5) P(bx + 2, y, dc);
            HL(bx + 1, bx + 3, 0, liA(c, 0.45));
            // seat cushion
            const sx = dir > 0 ? x0 + 5 : x0 - 9;
            R(sx, 11, 5, 9, lc);
            HL(sx, sx + 4, 11, liA(c, 0.45));
            R(sx, 20, 5, 6, c);
            HL(sx, sx + 4, 20, dc);
            // chrome trim along the base
            HL(bx, bx + 4, 26, '#f2eef6');
            HL(sx, sx + 4, 26, '#d8dcf0');
            HL(bx, sx + 4 > bx ? Math.max(bx + 4, sx + 4) : bx + 4, 27, '#9aa2c8');
          }
          // table: laminate top with chrome edge on a pedestal
          R(15, 18, 2, 8, '#d8dcf0');
          VL(16, 18, 25, '#9aa2c8');
          ell(16, 26.5, 4, 1.3, '#9aa2c8');
          R(10, 9, 12, 8, '#f6ecd8');
          R(10, 9, 12, 8, (x, y, cc) => (hash2(x, y, 151) < 0.06 ? (teal ? '#ff94b4' : '#5ec0a8') : cc));
          HL(10, 21, 9, '#fffaf0');
          HL(10, 21, 16, '#f2eef6');
          HL(10, 21, 17, '#a89cc0');
          // napkin dispenser, ketchup, mustard, two coffees and a slice of pie
          R(15, 7, 3, 3, '#d8dcf0');
          P(16, 6, '#ffffff');
          R(12, 7, 1, 3, '#d8434b');
          P(12, 6, '#f6f0f4');
          R(19, 7, 1, 3, '#ffd050');
          ell(12, 13, 1.6, 1, '#ffffff');
          P(12, 13, '#6a3a2a');
          ell(20, 12, 1.6, 1, '#ffffff');
          P(20, 12, '#6a3a2a');
          poly(
            [
              [15, 13],
              [19, 14],
              [15, 15],
            ],
            '#e8b060',
          );
          P(15, 13, '#a8343e');
        },
        { shadow: [['r', 2, 22, 31, 6]] },
      ),
    );
  },
});

const JUKE_LIGHTS = ['#ff5d8f', '#ffd050', '#5ff2d6', '#a888ff', '#ff8a5a'];
reg('jukebox', {
  solid: { x: -10, y: -8, w: 20, h: 7 },
  label: () => 'Play',
  lights: (o) => [light(o, 0, -18, 46, '#ff7ab8'), light(o, 0, -6, 30, '#5ff2d6')],
  draw: (ctx, o, t) => {
    const f = frame(t, 5, 6, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `jukebox|${f}`,
        20,
        28,
        () => {
          const wd = CHERRY;
          // cabinet with an arched crown
          R(0, 8, 20, 18, wd.b);
          ell(10, 9, 10, 9, wd.b);
          grain(1, 9, 18, 16, wd, 161, true);
          ell(10, 9, 8, 7, wd.d);
          // bubble-tube arch of cycling colour
          for (let k = 0; k < 15; k++) {
            const a = Math.PI + (k / 14) * Math.PI;
            const x = 10 + Math.cos(a) * 8.6;
            const y = 9 + Math.sin(a) * 7.6;
            const c = JUKE_LIGHTS[(k + f) % JUKE_LIGHTS.length];
            P(x, y, c);
            P(x + (x < 10 ? 0.6 : -0.6), y + 0.6, liA(c, 0.4));
          }
          // record window: the 45 spinning behind glass
          ell(10, 9, 6, 5, '#2a2440');
          ell(10, 9, 4, 2.2, '#3a3450');
          ell(10, 9, 1.4, 0.8, ['#ff5d8f', '#ffd050', '#ff5d8f', '#5ff2d6', '#ffd050'][f]);
          P(7 + (f % 3), 8, '#6a6a8a');
          glare(4, 4, 12, 10, 0.25);
          // title strips + buttons
          R(3, 13, 14, 4, '#fbf6ea');
          for (let y = 13; y < 17; y++) HL(4, 15, y, (x) => (x % 5 === 0 ? '#e8b8b8' : y % 2 ? '#d8434b' : null));
          for (let x = 3; x < 17; x += 2) P(x, 17, x % 4 === 1 ? '#ffd050' : '#f2eef6');
          // chrome grille with coloured backlight
          R(3, 18, 14, 7, '#3a2440');
          for (let y = 18; y < 25; y++)
            for (let x = 3; x < 17; x++) if ((x + y) % 3 === 0) P(x, y, (x + f) % 2 ? '#d8dcf0' : '#9aa2c8');
          R(3, 18, 14, 7, (x, y, c) => (dth(x, y, 4) ? mixc(c, JUKE_LIGHTS[(f + 2) % 5], 0.5) : c));
          // side light pillars
          for (const x of [1, 18]) for (let y = 10; y < 25; y++) P(x, y, JUKE_LIGHTS[(Math.floor(y / 3) + f + (x > 9 ? 2 : 0)) % 5]);
          // base
          R(0, 25, 20, 3, wd.d);
          HL(0, 19, 25, '#f2eef6');
        },
        { shadow: [['r', 2, 24, 20, 5]] },
      ),
    );
  },
});

reg('cash-register', {
  // sits on a counter top: sort just after the counter it rests on
  sortY: 14,
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art('cash-register', 12, 12, () => {
        const g = '#e2b244';
        const gl = '#ffe48e';
        const gd = '#a8762a';
        // pop-up price flags
        R(2, 0, 3, 2, '#fbf6ea');
        P(3, 0, '#d8434b');
        P(3, 1, '#d8434b');
        R(6, 1, 3, 1, '#fbf6ea');
        P(7, 1, '#3f9a92');
        // ornate brass body
        RR(1, 2, 10, 6, 1, g);
        HL(2, 9, 2, gl);
        R(2, 3, 8, 2, '#2a2440');
        HL(3, 8, 3, '#7fe8a8');
        for (let x = 2; x < 10; x += 2) {
          P(x, 6, '#fbf6ea');
          P(x + 1, 7, '#fbf6ea');
        }
        // drawer
        R(0, 8, 12, 4, gd);
        HL(0, 11, 8, g);
        HL(4, 7, 10, gl);
        // crank
        P(11, 4, gd);
        P(11, 5, '#fbf6ea');
      }),
    ),
});

// ================================================================ shops

function goods(x: number, y: number, w: number, k: number): void {
  // one 16-px shelf section of merchandise, sitting on baseline y
  const r = rng(Math.floor(k * 100000));
  const kind = Math.floor(r() * 6);
  let xx = x + 1;
  while (xx < x + w - 2) {
    switch (kind) {
      case 0: {
        // tin cans with labels
        const c = ['#d8434b', '#3f9a92', '#f6d38a', '#5a7ab8'][Math.floor(r() * 4)];
        R(xx, y - 4, 3, 4, '#d8dcf0');
        R(xx, y - 3, 3, 2, c);
        P(xx, y - 4, '#ffffff');
        xx += 3;
        break;
      }
      case 1: {
        // cereal / soap boxes
        const c = ['#e2844a', '#5ec0a8', '#ff94b4', '#ffd050'][Math.floor(r() * 4)];
        R(xx, y - 6, 4, 6, c);
        HL(xx, xx + 3, y - 6, liA(c, 0.4));
        P(xx + 1, y - 4, '#fffaf0');
        VL(xx + 3, y - 5, y - 1, shA(c, 0.25));
        xx += 4;
        break;
      }
      case 2: {
        // glass jars of preserves
        const c = ['#c9404c', '#e8a030', '#8a5aa8', '#6f9a5a'][Math.floor(r() * 4)];
        R(xx, y - 4, 3, 4, c);
        R(xx, y - 5, 3, 1, '#f6d38a');
        P(xx, y - 3, '#ffffff');
        xx += 4;
        break;
      }
      case 3: {
        // paint cans
        const c = ['#e05a5a', '#4a8ad0', '#f2c050', '#6fb070', '#c070c0'][Math.floor(r() * 5)];
        R(xx, y - 4, 4, 4, c);
        HL(xx, xx + 3, y - 4, '#e8e4f0');
        P(xx + 1, y - 2, '#fff4e0');
        xx += 5;
        break;
      }
      case 4: {
        // bottles
        const c = ['#6f9a5a', '#a8603a', '#5a7ab8', '#e2544a'][Math.floor(r() * 4)];
        R(xx, y - 4, 2, 4, c);
        P(xx, y - 5, c);
        P(xx, y - 6, '#d8c8b0');
        P(xx, y - 3, liA(c, 0.5));
        xx += 3;
        break;
      }
      default: {
        // trading-card packs and boxes (the town's card craze)
        const c = ['#ff5d8f', '#5ff2d6', '#ffd050', '#a888ff'][Math.floor(r() * 4)];
        R(xx, y - 5, 3, 5, c);
        P(xx + 1, y - 4, '#ffffff');
        HL(xx, xx + 2, y - 1, shA(c, 0.3));
        xx += 3;
        break;
      }
    }
  }
  // price tag
  R(x + 6, y + 1, 3, 2, '#fffaf0');
  P(x + 7, y + 1, '#d8434b');
}
reg('shelf-goods', {
  solid: { x: -24, y: -10, w: 48, h: 9 },
  draw: (ctx, o) => {
    const n = num(o, 'w', 3);
    const W = n * 16;
    ensureSolid(o, { x: -W / 2, y: -10, w: W, h: 9 });
    blit(
      ctx,
      o,
      art(
        `shelf-goods|${n}|${o.id.length}`,
        W,
        32,
        () => {
          const wd = OAK;
          const seed = o.id.length * 13 + n;
          R(0, 1, W, 30, wd.d);
          R(1, 2, W - 2, 28, shA(wd.d, 0.15));
          for (const y of [10, 20, 29]) {
            R(0, y, W, 2, wd.b);
            HL(0, W - 1, y, wd.l);
          }
          R(0, 0, W, 2, wd.l);
          HL(0, W - 1, 0, liA(wd.l, 0.3));
          for (let x = 0; x <= W - 2; x += 16) {
            R(x, 0, 2, 32, wd.b);
            VL(x, 0, 31, wd.l);
          }
          R(W - 2, 0, 2, 32, wd.s);
          for (let i = 0; i < n; i++)
            for (const y of [10, 20, 29]) goods(i * 16 + 2, y, 14, hash2(i, y, seed));
        },
        { shadow: [['r', 2, 27, W + 1, 6]] },
      ),
    );
  },
});

reg('display-case', {
  solid: { x: -16, y: -12, w: 32, h: 11 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'display-case',
        32,
        20,
        () => {
          // pastel base
          R(0, 12, 32, 8, '#f6c8cc');
          HL(0, 31, 12, '#fbe2e2');
          for (let x = 2; x < 32; x += 6) VL(x, 14, 18, '#e8a8b0');
          R(0, 19, 32, 1, '#c88a96');
          // glass case: top glass, then two tiers of tiny cakes
          R(0, 0, 32, 12, '#d8eef0');
          R(1, 4, 30, 8, '#fbf6ea');
          HL(1, 30, 8, '#d8c8b0');
          // top tier: tiny layer cakes with cherries
          for (const [x, c] of [
            [3, '#ff94b4'],
            [10, '#fff1c2'],
            [17, '#9ce0c8'],
            [24, '#c8a0e8'],
          ] as [number, Color][]) {
            R(x, 5, 4, 3, c);
            HL(x, x + 3, 6, '#fffaf0');
            HL(x, x + 3, 5, liA(c, 0.35));
            P(x + 1, 4, '#d8434b');
          }
          // bottom tier: cupcakes, a pie, cookies
          for (const x of [3, 7]) {
            R(x, 10, 3, 2, '#c8905a');
            ell(x + 1.5, 9.5, 2, 1.3, x === 3 ? '#ff94b4' : '#fffaf0');
            P(x + 1, 8, '#ffd050');
          }
          ell(16, 10.5, 4, 1.4, '#e8b060');
          HL(13, 19, 10, '#a8343e');
          for (const x of [23, 26, 29]) {
            circ(x, 10.5, 1.2, '#d8a060');
            P(x, 10, '#6a3a2a');
          }
          // tiny price tags
          for (const x of [4, 18, 25]) P(x, 11, '#ffffff');
          glare(0, 0, 32, 12, 0.3);
          HL(0, 31, 0, '#ffffff');
          HL(0, 31, 3, '#b8d8dc');
          VL(0, 0, 11, '#f2eef6');
          VL(31, 0, 11, '#9aa2c8');
        },
        { shadow: [['r', 2, 17, 31, 5]] },
      ),
    ),
});

function tapeSpines(x: number, y: number, w: number, h: number, seed: number): void {
  const r = rng(seed);
  for (let xx = x; xx < x + w; xx += 2) {
    const black = r() < 0.75;
    const c = black ? (r() < 0.5 ? '#2b2140' : '#3a2f50') : ['#f6f0e6', '#d8434b', '#3f9a92'][Math.floor(r() * 3)];
    R(xx, y, 2, h, c);
    const lab = ['#f6d38a', '#ff94b4', '#9ce0c8', '#fbf6ea', '#ffd050'][Math.floor(r() * 5)];
    VL(xx, y + 1, y + h - 2, lab);
    if (r() < 0.3) P(xx + 1, y + 1, '#d8434b');
  }
}
reg('vhs-shelf', {
  solid: { x: -16, y: -10, w: 32, h: 9 },
  draw: (ctx, o) => {
    const v = variant(o, 2) + (o.x % 2);
    blit(
      ctx,
      o,
      art(
        `vhs-shelf|${v}`,
        32,
        32,
        () => {
          const wd = WALNUT;
          R(0, 2, 32, 30, wd.b);
          grain(0, 2, 32, 30, wd, 171, true);
          // hand-lettered sign on top
          RR(6, 0, 20, 6, 1, '#fff4dc');
          TC('TAPES', 16, 1, '#c9404c', FT, {});
          for (const [y, i] of [
            [7, 0],
            [15, 1],
            [23, 2],
          ] as [number, number][]) {
            R(2, y, 28, 7, wd.d);
            tapeSpines(2, y + 1, 28, 6, 200 + i * 7 + v * 31);
            HL(1, 30, y + 7, wd.l);
          }
          // face-out boxes with wrestler art
          R(18, 15, 6, 7, '#7a4f96');
          R(19, 16, 4, 3, '#ffd050');
          P(20, 19, '#e6ab84');
          R(20, 20, 2, 2, '#d8434b');
          R(5, 23, 6, 7, '#3f8a86');
          R(6, 24, 4, 2, '#fff4dc');
          P(8, 27, '#ffd050');
          // a NEW! sticker
          RR(22, 6, 9, 5, 1, '#ffd050');
          T('NEW', 23, 6, '#c9404c', FT, {});
          R(0, 30, 32, 2, wd.d);
        },
        { shadow: [['r', 2, 27, 31, 6]] },
      ),
    );
  },
});

reg('crt-stack', {
  // often placed on desks: sort just after the furniture it rests on
  sortY: 14,
  solid: { x: -12, y: -8, w: 24, h: 7 },
  lights: (o) => [light(o, 0, -16, 30, '#9fe0ff')],
  draw: (ctx, o, t) => {
    const f = frame(t, 4, 8, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `crt-stack|${f}`,
        24,
        28,
        () => {
          // big console TV at the bottom: colour bars
          RR(0, 14, 24, 14, 2, '#8a5a3e');
          grain(1, 15, 22, 12, { l: '#c08a5a', b: '#a06a44', s: '#7a4a38', d: '#5a3434' }, 181);
          RR(2, 16, 15, 10, 2, '#2a2440');
          const bars = ['#f6f0f4', '#ffd050', '#5ff2d6', '#6fd070', '#ff5dc8', '#e8404e', '#4a6ad0'];
          for (let k = 0; k < 7; k++) R(3 + k * 2, 17, 2, 6, bars[k]);
          R(3, 23, 13, 2, '#2a2440');
          if (f === 1) HL(3, 15, 19, '#ffffff');
          R(18, 17, 4, 8, '#d8c8b0');
          circ(20, 19, 1, '#5a4a5a');
          circ(20, 22, 1, '#5a4a5a');
          // middle: grey monitor full of static
          RR(3, 5, 17, 10, 2, '#b8b0c8');
          HL(4, 18, 5, '#d8d4e4');
          R(5, 7, 11, 7, '#3a3a52');
          R(5, 7, 11, 7, (x, y) => {
            const h = hash2(x, y, 182 + f);
            return h < 0.35 ? '#d8dcf0' : h < 0.6 ? '#8a90b0' : '#4a4a68';
          });
          P(17, 8, '#e8404e');
          R(17, 10, 2, 3, '#9a92b0');
          // top: little red portable with antenna, a test card glow
          RR(7, 0, 10, 6, 1, '#d8434b');
          HL(8, 15, 0, '#ff8a80');
          R(8, 1, 6, 4, '#2a2440');
          R(9, 2, 4, 2, f % 2 ? '#5ff2d6' : '#4ad8c0');
          P(15, 2, '#ffd050');
          L(16, 0, 19, -3, '#9aa2c8');
        },
        { shadow: [['r', 2, 24, 24, 5]] },
      ),
    );
  },
});

const GARMENTS: [Color, Color, string][] = [
  ['#b448a8', '#ffd8f8', 'robe'],
  ['#5a7ab8', '#8ab0e0', 'jacket'],
  ['#d8434b', '#ff8a80', 'singlet'],
  ['#e8b860', '#7a4a2a', 'leopard'],
  ['#2b2140', '#ffd050', 'cape'],
  ['#3f9a92', '#9ce0c8', 'jacket'],
];
reg('clothing-rack', {
  solid: { x: -11, y: -4, w: 22, h: 3 },
  draw: (ctx, o) => {
    const v = variant(o, 3) + (o.x % 3);
    blit(
      ctx,
      o,
      art(
        `clothing-rack|${v}`,
        24,
        24,
        () => {
          // chrome rack on casters
          VL(1, 2, 21, '#d8dcf0');
          VL(22, 2, 21, '#9aa2c8');
          HL(0, 23, 2, '#f2eef6');
          HL(0, 23, 3, '#9aa2c8');
          HL(0, 23, 21, '#9aa2c8');
          for (const x of [0, 2, 21, 23]) P(x, 23, '#4e4870');
          // garments on hangers
          for (let i = 0; i < 5; i++) {
            const [c, c2, type] = GARMENTS[(i + v) % GARMENTS.length];
            const x = 3 + i * 4;
            P(x + 1, 1, '#9aa2c8');
            HL(x, x + 2, 4, '#c8c0d8');
            const len = type === 'robe' || type === 'cape' ? 15 : type === 'singlet' ? 9 : 11;
            R(x - 1, 5, 5, len, c);
            VL(x - 1, 5, 4 + len, liA(c, 0.25));
            VL(x + 3, 5, 4 + len, shA(c, 0.25));
            if (type === 'robe') for (let k = 0; k < 6; k++) P(x - 1 + ((k * 3) % 5), 6 + k * 2, k % 2 ? '#ffffff' : c2);
            else if (type === 'leopard') for (let k = 0; k < 5; k++) P(x + (k % 3), 7 + k * 2, c2);
            else if (type === 'cape') HL(x - 1, x + 3, 4 + len, c2);
            else if (type === 'singlet') {
              P(x + 1, 5, shA(c, 0.4));
              HL(x, x + 2, 9, c2);
            } else VL(x + 1, 6, 4 + len, c2);
          }
          // price tag
          R(13, 15, 3, 2, '#fffaf0');
          P(14, 14, '#c8c0d8');
        },
        { shadow: [['r', 1, 20, 24, 5]] },
      ),
    );
  },
});

reg('mannequin', {
  solid: { x: -4, y: -4, w: 8, h: 3 },
  draw: (ctx, o) => {
    const v = variant(o, 2) ^ (o.x % 2);
    blit(
      ctx,
      o,
      art(
        `mannequin|${v}`,
        12,
        28,
        () => {
          // tripod stand
          VL(6, 20, 25, '#6a4a3a');
          L(6, 25, 2, 27, '#6a4a3a');
          L(6, 25, 10, 27, '#5a3a30');
          // dress form
          const robe = v ? '#3f9a92' : '#b448a8';
          const trim = v ? '#ffd050' : '#ffd8f8';
          R(5, 0, 2, 2, '#c8b8a8');
          RR(2, 2, 8, 6, 2, '#efe2d0');
          // sequined robe with gold lapels
          poly(
            [
              [2, 4],
              [10, 4],
              [11, 21],
              [1, 21],
            ],
            robe,
          );
          L(4, 4, 6, 12, trim);
          L(8, 4, 6, 12, trim);
          VL(6, 12, 20, shA(robe, 0.3));
          for (let k = 0; k < 12; k++) {
            const x = 2 + Math.floor(hash2(k, 1, 191 + v) * 9);
            const y = 6 + Math.floor(hash2(k, 2, 191 + v) * 15);
            P(x, y, k % 3 ? liA(robe, 0.5) : '#ffffff');
          }
          VL(10, 6, 20, shA(robe, 0.25));
          HL(1, 11, 21, trim);
          // a yellow measuring tape slung around the neck
          VL(3, 3, 10, '#ffd050');
          VL(9, 3, 8, '#ffd050');
          P(3, 6, '#2b2140');
          P(9, 5, '#2b2140');
          // pincushion "head"
          circ(6, 0.5, 1.6, '#d8434b');
          P(5, -1, '#d8dcf0');
        },
        { shadow: [['e', 7, 27, 4, 1.5]] },
      ),
    );
  },
});

// ================================================================ office

reg('desk', {
  solid: { x: -16, y: -13, w: 32, h: 12 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'desk',
        32,
        20,
        () => {
          const wd = WALNUT;
          // top surface
          R(0, 2, 32, 7, wd.l);
          grain(0, 3, 32, 5, { ...wd, b: wd.l }, 201);
          HL(0, 31, 2, liA(wd.l, 0.3));
          // green blotter + papers + pencil
          R(9, 4, 12, 4, '#4f7a5a');
          HL(9, 20, 4, '#6f9a6a');
          R(11, 3, 6, 4, '#fbf6ea');
          HL(12, 15, 4, '#a8a0b8');
          HL(12, 14, 5, '#a8a0b8');
          L(18, 6, 21, 5, '#ffd050');
          P(21, 5, '#e88a9a');
          // rotary phone
          R(2, 3, 6, 4, '#c9404c');
          RR(1, 1, 8, 3, 1, '#d8434b');
          HL(2, 7, 1, '#ff8a80');
          circ(5, 5, 1.2, '#fbf6ea');
          // coffee mug + rolodex
          R(24, 2, 3, 4, '#fbf6ea');
          P(27, 3, '#fbf6ea');
          P(25, 2, '#6a3a2a');
          HL(24, 26, 4, '#d8434b');
          R(28, 4, 3, 3, '#4e4870');
          HL(28, 30, 3, '#fbf6ea');
          // front with drawers + modesty panel
          R(0, 9, 32, 9, wd.b);
          grain(0, 9, 32, 9, wd, 202, true);
          HL(0, 31, 9, wd.s);
          for (const x of [1, 23]) {
            bevel(x, 10, 8, 3, shA(wd.b, 0.05));
            bevel(x, 14, 8, 3, shA(wd.b, 0.05));
            P(x + 4, 11, PAL.gold2);
            P(x + 4, 15, PAL.gold2);
          }
          R(10, 10, 12, 7, shA(wd.b, 0.15));
          R(0, 18, 32, 2, wd.d);
        },
        { shadow: [['r', 2, 16, 32, 5]] },
      ),
    ),
});

reg('office-chair', {
  solid: { x: -5, y: -5, w: 10, h: 4 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'office-chair',
        12,
        14,
        () => {
          const c = '#7a3a4a';
          // tufted leather back
          RR(1, 0, 10, 7, 2, c);
          HL(3, 8, 0, liA(c, 0.35));
          for (const x of [3, 6, 9]) P(x, 3, shA(c, 0.3));
          VL(10, 2, 6, shA(c, 0.25));
          // seat + arms
          R(1, 7, 10, 2, liA(c, 0.22));
          R(0, 6, 1, 3, '#4e4870');
          R(11, 6, 1, 3, '#4e4870');
          // swivel post + star base on casters
          R(5, 9, 2, 3, '#9aa2c8');
          HL(1, 10, 12, '#6e688e');
          for (const x of [1, 5, 10]) P(x, 13, AK);
        },
        { shadow: [['e', 7, 13, 5, 1.5]] },
      ),
    ),
});

reg('filing-cabinet', {
  solid: { x: -7, y: -7, w: 14, h: 6 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'filing-cabinet',
        14,
        24,
        () => {
          const c = '#8a9a7a';
          // folders piled on top + a little cactus
          R(1, 0, 7, 3, '#f6d38a');
          HL(1, 7, 0, '#fff1c2');
          R(2, 1, 6, 1, '#e8b860');
          R(10, 0, 3, 3, '#d27a52');
          P(11, -1, '#6f9a5a');
          // body
          R(0, 3, 14, 21, c);
          HL(0, 13, 3, liA(c, 0.35));
          VL(13, 3, 23, shA(c, 0.25));
          for (const y of [5, 11, 17]) {
            bevel(1, y, 12, 5, liA(c, 0.08), 0.8);
            R(4, y + 1, 6, 2, '#fbf6ea');
            HL(5, 8, y + 1, '#a8a0b8');
            R(5, y + 3, 4, 1, '#d8dcf0');
          }
          // a drawer left slightly open, papers sticking out
          R(1, 11, 12, 1, shA(c, 0.4));
          HL(3, 10, 10, '#fbf6ea');
          P(6, 9, '#fbf6ea');
          R(0, 23, 14, 1, shA(c, 0.45));
        },
        { shadow: [['r', 2, 20, 14, 6]] },
      ),
    ),
});

reg('corkboard', {
  label: () => 'Read',
  hit: { x: -16, y: -8, w: 32, h: 26 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'corkboard',
        33,
        25,
        () => {
          // wooden frame + cork
          R(0, 0, 32, 24, '#8a5640');
          HL(0, 31, 0, '#b47c54');
          HL(0, 31, 23, '#5a3434');
          R(2, 2, 28, 20, '#c8925a');
          R(2, 2, 28, 20, (x, y, c) => {
            const h = hash2(x, y, 211);
            return h < 0.18 ? '#b07a48' : h > 0.9 ? '#dca870' : c;
          });
          // header card: this week's card
          R(10, 2, 12, 4, '#fff4dc');
          T('SAT', 11, 2, '#c9404c', FT, {});
          P(21, 3, '#3f9a92');
          // index cards (the matches being booked)
          const cards: [number, number, Color][] = [
            [3, 7, '#fbf6ea'],
            [3, 14, '#fff1c2'],
            [11, 9, '#fbf6ea'],
            [20, 8, '#e8f4ff'],
            [21, 15, '#fbf6ea'],
            [12, 16, '#ffe0e8'],
          ];
          for (const [x, y, c] of cards) {
            R(x, y, 7, 5, c);
            HL(x + 1, x + 5, y + 2, '#a8a0b8');
            HL(x + 1, x + 4, y + 3, '#a8a0b8');
            HL(x, x + 6, y, '#d8434b');
          }
          // Polaroids
          for (const [x, y, c] of [
            [26, 3, '#e6ab84'],
            [26, 11, '#8a5aa8'],
          ] as [number, number, Color][]) {
            R(x, y, 4, 5, '#fffaf0');
            R(x, y, 4, 3, c);
            P(x + 1, y + 1, '#2b2140');
          }
          // red string linking the feud
          L(6, 9, 14, 11, '#e8303e');
          L(14, 11, 23, 10, '#e8303e');
          L(23, 10, 24, 17, '#e8303e');
          L(14, 11, 15, 18, '#e8303e');
          L(6, 16, 15, 18, '#e8303e');
          // push pins
          for (const [x, y, c] of [
            [6, 8, '#ffd050'],
            [14, 10, '#3f9a92'],
            [23, 9, '#ff5d8f'],
            [6, 15, '#4c6ab2'],
            [24, 16, '#ffd050'],
            [15, 17, '#d8434b'],
            [27, 3, '#d8434b'],
            [16, 2, '#4c6ab2'],
          ] as [number, number, Color][]) {
            P(x, y, c);
            P(x + 1, y + 1, SH(120));
          }
          // a sticky note: "DON'T TELL D."
          R(3, 2, 5, 4, '#ff94b4');
          HL(4, 6, 3, '#c8307a');
          wallShadow(0, 0, 32, 24);
        },
        { outline: false },
      ),
    ),
});

reg('trophy-case', {
  solid: { x: -16, y: -10, w: 32, h: 9 },
  draw: (ctx, o) => {
    const half = o.props.halfBelt === true || o.id === 'trophies';
    blit(
      ctx,
      o,
      art(
        `trophy-case|${half ? 1 : 0}`,
        32,
        32,
        () => {
          const wd = CHERRY;
          R(0, 0, 32, 32, wd.b);
          grain(0, 0, 32, 32, wd, 221, true);
          HL(0, 31, 0, wd.l);
          // glass cabinet interior with lights
          R(2, 2, 28, 24, '#5a3a5a');
          R(2, 2, 28, 3, '#7a5a7a');
          for (const y of [13, 25]) {
            HL(2, 29, y, '#e8f0f4');
            HL(2, 29, y + 1, '#9a8aa8');
          }
          // trophies on the shelves
          const cup = (x: number, y: number, h: number) => {
            R(x - 1, y - 2, 3, 2, '#7a4a3a');
            VL(x, y - h + 3, y - 3, PAL.gold3);
            ell(x, y - h + 2, 2.4, 2, PAL.gold2);
            P(x - 1, y - h + 1, '#fff4c0');
            P(x - 3, y - h + 2, PAL.gold3);
            P(x + 3, y - h + 2, PAL.gold3);
          };
          cup(6, 13, 9);
          cup(26, 13, 7);
          cup(5, 25, 6);
          cup(27, 25, 8);
          cup(21, 25, 5);
          if (half) {
            // Birdie's half of the broken belt, on a velvet pillow
            RR(10, 6, 12, 6, 2, '#7a2a48');
            R(10, 7, 6, 3, '#3a2830');
            R(15, 6, 5, 5, PAL.gold2);
            HL(15, 19, 6, '#fff0a0');
            P(17, 8, '#d8434b');
            // the jagged broken edge
            for (let y = 6; y <= 10; y++) P(20 + (y % 2), y, PAL.gold3);
            stampRows(['.#.', '###', '.#.'], { '#': '#fff4c0' }, 16, 7);
          } else {
            // a championship belt
            R(9, 8, 14, 3, '#3a2830');
            ell(16, 9.5, 4, 3, PAL.gold2);
            P(15, 8, '#fff0a0');
            P(16, 9, '#d8434b');
          }
          // framed photo + plaque on the lower shelf
          R(10, 19, 6, 6, PAL.gold3);
          R(11, 20, 4, 4, '#e8c8a0');
          P(12, 21, '#6a4a3a');
          R(16, 22, 3, 3, '#3a2830');
          HL(16, 18, 23, PAL.gold2);
          glare(2, 2, 28, 24, 0.22);
          VL(16, 2, 25, '#9a8aa8');
          P(15, 15, PAL.gold2);
          P(17, 15, PAL.gold2);
          // base
          R(0, 27, 32, 5, shA(wd.b, 0.1));
          HL(0, 31, 27, wd.l);
          HL(0, 31, 31, wd.d);
        },
        { shadow: [['r', 2, 27, 31, 6]] },
      ),
    );
  },
});

// ================================================================ arena

function lockerUnit(x: number, base: Color, k: number): void {
  // one 12 x 28 locker door at x
  const lc = liA(base, 0.25);
  const dc = shA(base, 0.25);
  R(x, 0, 12, 28, base);
  VL(x, 0, 27, lc);
  VL(x + 11, 0, 27, dc);
  HL(x, x + 11, 0, liA(base, 0.4));
  // vents
  for (const y of [3, 5, 7]) HL(x + 3, x + 8, y, shA(base, 0.4));
  for (const y of [20, 22]) HL(x + 3, x + 8, y, shA(base, 0.4));
  // number plate + handle
  R(x + 4, 10, 4, 3, '#d8dcf0');
  P(x + 5, 11, '#4e4870');
  P(x + 6, 11, '#4e4870');
  R(x + 9, 13, 1, 4, '#d8dcf0');
  P(x + 9, 14, '#6e688e');
  R(x, 25, 12, 3, shA(base, 0.45));
  // a little lived-in detail on some doors
  if (k < 0.18) {
    // band sticker
    RR(x + 2, 15, 5, 4, 1, '#ffd050');
    P(x + 3, 16, '#d8434b');
  } else if (k > 0.85) {
    // towel hanging from the vent
    R(x + 2, 5, 4, 8, '#fbf6ea');
    HL(x + 2, x + 5, 10, '#d8434b');
  } else if (k > 0.7 && k < 0.78) {
    // dent
    P(x + 6, 17, dc);
    P(x + 7, 18, lc);
  }
}
reg('locker', {
  solid: { x: -18, y: -8, w: 36, h: 7 },
  draw: (ctx, o) => {
    const n = num(o, 'w', 3);
    const W = n * 12;
    ensureSolid(o, { x: -Math.floor(W / 2), y: -8, w: W, h: 7 });
    blit(
      ctx,
      o,
      art(
        `locker|${n}|${o.x % 7}`,
        W,
        28,
        () => {
          for (let i = 0; i < n; i++) lockerUnit(i * 12, i % 2 ? '#4f8a9a' : '#5694a2', hash2(i, o.x % 7, 231));
        },
        { shadow: [['r', 2, 24, W + 1, 5]] },
      ),
    );
  },
});

reg('locked-locker', {
  solid: { x: -6, y: -8, w: 12, h: 7 },
  label: () => 'Look',
  draw: (ctx, o, t) => {
    const f = (t + phaseOf(o)) % 6 < 0.25 ? 1 : 0;
    blit(
      ctx,
      o,
      art(
        `locked-locker|${f}`,
        12,
        28,
        () => {
          // the same locker as the rest, but older: faded paint, dust, 40 years shut
          lockerUnit(0, '#6a8a92', 0.5);
          R(0, 0, 12, 28, (x, y, c) => (hash2(x, y, 241) < 0.12 ? mixc(c, '#b8b0a8', 0.35) : c));
          HL(0, 11, 0, '#c8c0b8');
          // a dried rose tucked into the vent
          L(4, 5, 7, 2, '#5a6a4a');
          P(7, 1, '#a8344a');
          P(8, 2, '#8a2a40');
          // faded masking-tape label "D.D."
          R(2, 9, 8, 4, '#e8dcb8');
          P(9, 9, '#d8cca8');
          T('DD', 3, 9, '#9a7a6a', FT, {});
          // heavy brass padlock through the latch
          R(8, 14, 1, 3, '#9aa2c8');
          circ(9, 17.5, 1.6, '#9aa2c8');
          RR(7, 17, 5, 5, 1, PAL.gold3);
          HL(8, 10, 17, PAL.gold2);
          P(9, 19, AK);
          P(9, 20, AK);
          if (f) sparkle(8, 17);
        },
        { shadow: [['r', 2, 24, 13, 5]] },
      ),
    );
  },
});

reg('bleachers', {
  solid: { x: -24, y: -32, w: 48, h: 31 },
  draw: (ctx, o) => {
    const n = num(o, 'w', 3);
    const W = n * 16;
    ensureSolid(o, { x: -W / 2, y: -32, w: W, h: 31 });
    blit(
      ctx,
      o,
      art(
        `bleachers|${n}`,
        W,
        40,
        () => {
          // steel understructure seen between the risers
          R(0, 4, W, 36, '#3a3450');
          for (let x = 2; x < W; x += 10) {
            L(x, 39, x + 8, 6, '#5a5470');
            L(x + 8, 39, x, 6, '#4a4462');
          }
          // three rows: each a seat plank and a riser, stepping down toward us
          for (let r = 0; r < 3; r++) {
            const y = r * 12;
            const wd = r === 1 ? OAK : HONEY;
            R(0, y, W, 4, wd.l);
            HL(0, W - 1, y, liA(wd.l, 0.3));
            for (let x = 0; x < W; x += 24) P(x + 5 + r * 3, y + 1, wd.s);
            R(0, y + 4, W, 3, wd.b);
            HL(0, W - 1, y + 6, wd.d);
            // painted row numbers + gum + a forgotten foam finger
            for (let x = 4; x < W; x += 16) P(x, y + 5, '#fff4dc');
            R(0, y + 7, W, 5, (xx, yy) => (dth(xx, yy, 6) ? '#2f2a44' : '#3a3450'));
          }
          if (W >= 48) {
            R(W - 12, 9, 3, 5, '#ffd050');
            P(W - 12, 8, '#ffd050');
            P(W - 11, 10, '#c88a2a');
          }
          P(8, 13, '#ff94b4');
          // chrome rails at the ends
          for (const x of [0, W - 1]) VL(x, 0, 39, x ? '#6e688e' : '#d8dcf0');
        },
        { shadow: [['r', 2, 36, W + 1, 5]] },
      ),
    );
  },
});

function foldingChairBack(x: number, y: number, k: number): void {
  // steel folding chair seen from behind (8 x 16)
  const c = k < 0.5 ? '#9aa2c8' : '#a8a0c0';
  RR(x, y, 8, 5, 1, c);
  HL(x + 1, x + 6, y, '#d8dcf0');
  R(x + 1, y + 1, 6, 3, shA(c, 0.25));
  VL(x, y + 4, y + 15, c);
  VL(x + 7, y + 4, y + 15, shA(c, 0.3));
  R(x, y + 7, 8, 2, '#d8dcf0');
  HL(x, x + 7, y + 9, shA(c, 0.35));
  L(x + 1, y + 10, x + 2, y + 15, shA(c, 0.25));
  L(x + 6, y + 10, x + 5, y + 15, shA(c, 0.35));
  // the odd ACW sticker or someone's jacket left on a seat
  if (k > 0.88) {
    R(x + 1, y + 1, 6, 4, '#d8434b');
    P(x + 2, y + 2, '#ff8a80');
  } else if (k > 0.8) P(x + 3, y + 2, '#ffd050');
}
reg('folding-chairs', {
  solid: { x: -24, y: -6, w: 48, h: 5 },
  draw: (ctx, o) => {
    const n = num(o, 'w', 3);
    const W = n * 16;
    ensureSolid(o, { x: -W / 2, y: -6, w: W, h: 5 });
    blit(
      ctx,
      o,
      art(
        `folding-chairs|${n}|${o.y % 5}`,
        W,
        16,
        () => {
          for (let i = 0; i < n * 2; i++) foldingChairBack(i * 8, 0, hash2(i, o.y % 5, 251));
        },
        { shadow: [['r', 1, 13, W + 1, 4]] },
      ),
    );
  },
});

/** Ring construction shared by the indoor ring (big) and Grandma's backyard ring. */
export interface RingStyle {
  W: number;
  H: number;
  /** Mat rectangle (top surface). */
  mx: number;
  my: number;
  mw: number;
  mh: number;
  apron: number;
  ropes: Color[];
  sag: number;
  post: [Color, Color, Color];
  pads: Color[];
  mat: Color;
  skirt: Color;
  postH: number;
}
export function ringPost(x: number, yb: number, h: number, st: RingStyle, front: boolean): void {
  const [pl, pb, pd] = st.post;
  R(x - 1, yb - h, 4, h, pb);
  VL(x - 1, yb - h, yb - 1, pl);
  VL(x + 2, yb - h, yb - 1, pd);
  RR(x - 2, yb - h - 2, 6, 3, 1, liA(pl, 0.3));
  const step = Math.floor((h - 4) / 3);
  for (let i = 0; i < 3; i++) {
    const py = yb - 4 - step * (i + 1) + (front ? 0 : 1);
    const c = st.pads[i];
    RR(x - 2, py, 6, 4, 1, c);
    HL(x - 1, x + 2, py, liA(c, 0.45));
    VL(x + 3, py + 1, py + 2, shA(c, 0.35));
  }
}
export function ropeY(yb: number, h: number, i: number, front: boolean): number {
  const step = Math.floor((h - 4) / 3);
  return yb - 4 - step * (i + 1) + (front ? 0 : 1) + 1;
}
export function drawRing(st: RingStyle, matDeco: () => void, apronDeco: () => void): void {
  const { mx, my, mw, mh } = st;
  const x0 = mx;
  const x1 = mx + mw - 1;
  const yB = my;
  const yF = my + mh;
  // mat (top surface) + canvas texture
  R(mx, my, mw, mh, st.mat);
  R(mx, my, mw, mh, (x, y, c) => {
    const h = hash2(x, y, 261);
    return h < 0.04 ? shA(c, 0.06) : h > 0.97 ? liA(c, 0.12) : c;
  });
  HL(mx, x1, my, shA(st.mat, 0.18));
  matDeco();
  // back posts + back and side ropes
  ringPost(x0 + 1, yB, st.postH - 4, st, false);
  ringPost(x1 - 2, yB, st.postH - 4, st, false);
  for (let i = 0; i < 3; i++) {
    const yb = ropeY(yB, st.postH - 4, i, false);
    const yf = ropeY(yF, st.postH, i, true);
    curve(x0 + 4, yb, x1 - 3, yb, st.sag, st.ropes[i]);
    curve(x0 + 4, yb + 1, x1 - 3, yb + 1, st.sag, shA(st.ropes[i], 0.4));
    L(x0 + 1, yb, x0, yf, st.ropes[i]);
    L(x1 - 1, yb, x1, yf, shA(st.ropes[i], 0.15));
  }
  // apron (front face)
  R(mx - 2, yF, mw + 4, 2, liA(st.mat, 0.3));
  R(mx - 2, yF + 2, mw + 4, st.apron - 2, st.skirt);
  for (let x = mx - 2; x < mx + mw + 2; x++) if ((x & 7) === 0) VL(x, yF + 3, yF + st.apron - 1, shA(st.skirt, 0.12));
  HL(mx - 2, mx + mw + 1, yF + st.apron - 1, shA(st.skirt, 0.35));
  apronDeco();
  // front posts + front ropes
  ringPost(x0, yF + 2, st.postH, st, true);
  ringPost(x1 - 1, yF + 2, st.postH, st, true);
  for (let i = 0; i < 3; i++) {
    const yf = ropeY(yF + 2, st.postH, i, true);
    curve(x0 + 3, yf, x1 - 2, yf, st.sag, st.ropes[i]);
    curve(x0 + 3, yf + 1, x1 - 2, yf + 1, st.sag, shA(st.ropes[i], 0.4));
  }
}

const RING_IN: RingStyle = {
  W: 160,
  H: 112,
  mx: 8,
  my: 30,
  mw: 144,
  mh: 56,
  apron: 26,
  ropes: ['#e8404e', '#f6f0f4', '#4a6ad0'],
  sag: 0,
  post: ['#d8dcf0', '#9aa2c8', '#5a6290'],
  pads: ['#d8404e', '#f6f0f4', '#4a6ad0'],
  mat: '#e2dcec',
  skirt: '#3a3478',
  postH: 30,
};
reg('ring', {
  solid: { x: -80, y: -28, w: 160, h: 27 },
  // sorts by the back edge of the mat: wrestlers on the mat draw over it
  sortY: -86,
  lights: (o) => [light(o, 0, -60, 110, '#fff0d0')],
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'ring',
        160,
        112,
        () => {
          const st = RING_IN;
          drawRing(
            st,
            () => {
              // ACW logo in the centre of the canvas, scuffs, a sweat mark
              const cx = 80;
              const cy = 58;
              ell(cx, cy, 26, 11, '#d0c6de');
              ell(cx, cy, 24, 10, '#e8e2f0');
              ell(cx, cy, 20, 8, '#d8cee6');
              T('ACW', cx - 15, cy - 4, '#b8a8cc', FT, { bold: true, ls: 4 });
              T('ACW', cx - 15, cy - 5, '#7a6aa8', FT, { bold: true, ls: 4 });
              HL(cx - 16, cx + 15, cy + 3, '#c8b8d8');
              for (const [x, y] of [
                [30, 40],
                [118, 64],
                [52, 72],
              ])
                ell(x, y, 3, 1, '#d6cee2');
            },
            () => {
              const y = st.my + st.mh + 2;
              TC('ALLEY CHAMPIONSHIP WRESTLING', 80, y + 9, '#ffd560', FT, { sp: 1 });
              HL(26, 133, y + 16, '#5a52a0');
              for (const sx of [12, 143]) stampRows(['..#..', '.###.', '#####', '.###.', '.#.#.'], { '#': '#f6f0f4' }, sx, y + 8);
              // ringside steel steps at the front-right corner
              R(140, y + 14, 14, 3, '#9aa2c8');
              R(142, y + 17, 12, 3, '#8a8aaa');
              R(144, y + 20, 10, 3, '#7a7a9a');
              HL(140, 153, y + 14, '#d8dcf0');
            },
          );
        },
        { shadow: [['r', 4, 106, 158, 8]] },
      ),
    ),
});

reg('bingo-board', {
  draw: (ctx, o, t) => {
    const f = frame(t, 2, 1.2, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `bingo-board|${f}`,
        33,
        25,
        () => {
          R(0, 0, 32, 24, '#3a2a4a');
          HL(0, 31, 0, '#5a4a6a');
          R(1, 1, 30, 22, '#2a2038');
          const letters = 'BINGO';
          const hdr = ['#e8404e', '#ffd050', '#5ec0a8', '#4a6ad0', '#ff94b4'];
          for (let i = 0; i < 5; i++) {
            R(2 + i * 6, 2, 5, 6, hdr[i]);
            T(letters[i], 3 + i * 6, 2, '#fff4dc', FT, {});
          }
          // number lamps: the called ones glow butter yellow
          for (let r = 0; r < 4; r++)
            for (let c = 0; c < 5; c++) {
              const on = hash2(r, c, 271) < 0.4 || (f && r === 2 && c === 3);
              const x = 3 + c * 6;
              const y = 10 + r * 3;
              R(x, y, 3, 2, on ? '#ffe48e' : '#4a3a5a');
              if (on) P(x, y, '#fffbe0');
            }
          // "B-7!" last called
          R(22, 21, 9, 2, '#3a2a4a');
          wallShadow(0, 0, 32, 24);
        },
        { outline: false },
      ),
    );
  },
  lights: (o) => [light(o, 0, -12, 26, '#ffe48e')],
});

reg('mic-stand', {
  solid: { x: -3, y: -3, w: 6, h: 2 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'mic-stand',
        8,
        24,
        () => {
          ell(4, 22.5, 3.5, 1.4, '#4e4870');
          HL(2, 5, 22, '#9aa2c8');
          VL(4, 6, 22, '#d8dcf0');
          VL(5, 8, 22, '#6e688e');
          R(3, 13, 3, 1, '#9aa2c8');
          // the mic, with a coiled red cord
          RR(2, 0, 4, 6, 1, '#4e4870');
          R(3, 1, 2, 3, '#9aa2c8');
          P(3, 1, '#d8dcf0');
          curve(5, 6, 7, 22, 2, '#d8434b');
        },
        { shadow: [['e', 5, 23, 4, 1.4]] },
      ),
    ),
});

reg('announce-table', {
  solid: { x: -16, y: -11, w: 32, h: 10 },
  draw: (ctx, o, t) => {
    const blink = (t + phaseOf(o)) % 5 < 0.15 ? 1 : 0;
    const peek = Math.floor((t + phaseOf(o)) / 7) % 3 !== 2 ? 1 : 0;
    blit(
      ctx,
      o,
      art(
        `announce-table|${blink}|${peek}`,
        32,
        20,
        () => {
          // table top: the bell, a monitor, papers, the headset
          R(0, 4, 32, 4, '#8a5a4a');
          HL(0, 31, 4, '#c08a5a');
          ell(6, 4, 3.5, 2, PAL.gold2);
          HL(4, 7, 3, '#fff0a0');
          R(5, 1, 2, 2, PAL.gold3);
          R(3, 6, 7, 1, '#6a4a3a');
          R(20, 0, 9, 6, '#2a2a3a');
          R(21, 1, 7, 4, '#5ff2d6');
          HL(22, 26, 3, '#2a6a6a');
          R(12, 5, 6, 2, '#fbf6ea');
          HL(13, 16, 5, '#a8a0b8');
          // headset
          curve(9, 2, 15, 2, -2, '#2a2a3a');
          P(9, 3, '#4a4a5a');
          P(15, 3, '#4a4a5a');
          // navy skirt with gold ACW
          R(1, 8, 30, 12, '#3a3478');
          for (let x = 2; x < 31; x += 6) VL(x, 9, 19, '#332e6c');
          HL(1, 30, 8, '#5a52a0');
          TC('ACW', 16, 10, '#ffd560', FT, { ls: 1 });
          // Jobber the raccoon peeking out from under the skirt
          if (peek) {
            const jx = 21;
            const jy = 15;
            R(jx, jy, 8, 4, '#8e7a72');
            P(jx, jy - 1, '#8e7a72');
            P(jx + 7, jy - 1, '#8e7a72');
            R(jx + 1, jy + 1, 6, 1, AK);
            P(jx + 2, jy + 1, blink ? AK : '#fffbe0');
            P(jx + 5, jy + 1, blink ? AK : '#fffbe0');
            HL(jx + 1, jx + 6, jy, '#f2e6d6');
            P(jx + 3, jy + 3, AK);
            P(jx + 4, jy + 3, AK);
          }
        },
        { shadow: [['r', 2, 17, 32, 5]] },
      ),
    );
  },
});

reg('stairs-down', {
  hit: { x: -16, y: -24, w: 32, h: 26 },
  label: () => 'Descend',
  // a hole in the floor: everyone walks/draws over it
  sortY: -40,
  lights: (o) => [light(o, 0, -10, 40, '#5effa0')],
  draw: (ctx, o, t) => {
    const f = frame(t, 4, 3, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `stairs-down|${f}`,
        32,
        24,
        () => {
          // a stone well in the floor: cut-stone rim, then steps narrowing into the dark
          RR(0, 0, 32, 24, 3, '#8a86a0');
          R(0, 0, 32, 24, (x, y, c) => (c && ((x >> 2) + (y >> 2)) % 2 === 0 ? shA(c, 0.1) : c));
          for (const x of [8, 16, 24]) VL(x, 0, 2, '#5a5670');
          HL(2, 29, 0, '#aaa6c0');
          // the pit
          R(3, 3, 26, 19, '#14201c');
          // steps: each lower step is narrower, darker, and lit green from below
          for (let s = 0; s < 6; s++) {
            const y = 3 + s * 3;
            const inset = s;
            const k = s / 5;
            const c = mixc('#8a86a0', '#2a4a3a', k);
            R(3 + inset, y, 26 - inset * 2, 2, c);
            HL(3 + inset, 28 - inset, y, liA(c, 0.25));
            R(3 + inset, y + 2, 26 - inset * 2, 1, shA(c, 0.45));
          }
          // side walls of the stairwell in shadow
          for (let y = 3; y < 22; y++) {
            const inset = Math.min(5, Math.floor((y - 3) / 3));
            HL(3, 2 + inset, y, '#2e2a40');
            HL(29 - inset, 28, y, '#24202e');
          }
          // the green glow breathing up from below
          const g = [6, 9, 12, 9][f];
          R(8, 16, 16, 6, (x, y, c) => (dth(x, y, g - (21 - y) * 2) ? mixc(c, '#5effa0', 0.55) : c));
          HL(9, 22, 21, f % 2 ? '#9dffc8' : '#5effa0');
          for (let k = 0; k < 3; k++) P(10 + k * 5 + (f % 2), 19 - ((f + k) % 3) * 2, '#c8ffe0');
          // moss and a cobweb on the rim
          for (const x of [1, 2, 29, 30]) P(x, 22, '#6f9a5a');
          P(4, 2, '#6f9a5a');
          P(1, 1, '#c8c4dc');
          P(2, 2, '#c8c4dc');
          P(3, 1, '#c8c4dc');
        },
        { outline: false },
      ),
    );
  },
});

// ================================================================ radio, clinic, studio, retirement home

reg('radio-console', {
  solid: { x: -16, y: -12, w: 32, h: 11 },
  label: () => 'Broadcast',
  lights: (o) => [light(o, 10, -16, 22, '#ff5050')],
  draw: (ctx, o, t) => {
    const f = frame(t, 4, 4, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `radio-console|${f}`,
        32,
        20,
        () => {
          // reel-to-reel deck at the back left
          R(1, 0, 13, 9, '#d8c8b0');
          HL(1, 13, 0, '#f2e6d0');
          for (const cx of [4, 10]) {
            circ(cx, 4, 2.6, '#4e4870');
            circ(cx, 4, 1, '#d8dcf0');
            const a = (f / 4) * Math.PI * 2 + cx;
            P(cx + Math.round(Math.cos(a) * 2), 4 + Math.round(Math.sin(a) * 2), '#9aa2c8');
          }
          // VU meters with dancing needles + ON AIR sign
          R(16, 0, 14, 5, '#2a2440');
          for (const [x, k] of [
            [17, 0],
            [24, 1],
          ] as [number, number][]) {
            R(x, 1, 6, 3, '#f6e0a0');
            L(x + 3, 3, x + 1 + ((f + k * 2) % 4), 1, '#d8434b');
          }
          R(18, -1, 10, 1, '#2a2440');
          // console desk with sliders and knobs
          R(0, 9, 32, 4, '#5a5470');
          HL(0, 31, 9, '#7a7490');
          for (let i = 0; i < 8; i++) {
            const x = 2 + i * 3;
            VL(x, 10, 12, '#2a2440');
            P(x, 10 + ((i * 7 + f) % 3), i % 3 === 0 ? '#ffd050' : '#d8dcf0');
          }
          for (let x = 27; x < 31; x += 2) P(x, 10, '#ff5d8f');
          // desk front with WRSL plate
          R(0, 13, 32, 7, WALNUT.b);
          HL(0, 31, 13, WALNUT.l);
          R(9, 14, 14, 5, '#2a2440');
          TC('WRSL', 16, 14, '#ffd050', FT, {});
          // the big broadcast mic on a boom
          L(26, 4, 22, -2, '#9aa2c8');
          RR(20, -4, 4, 5, 1, '#4e4870');
          P(21, -3, '#9aa2c8');
        },
        {
          shadow: [['r', 2, 17, 32, 5]],
          over: () => {
            // ON AIR lamp (unoutlined glow)
            R(18, 0, 10, 1, f % 2 ? '#ff5050' : '#ff7a6a');
          },
        },
      ),
    );
  },
});

reg('exam-table', {
  solid: { x: -16, y: -11, w: 32, h: 10 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'exam-table',
        32,
        16,
        () => {
          const c = '#3f9a92';
          // padded top with a face cradle and a strip of paper
          RR(0, 2, 32, 7, 2, c);
          HL(2, 29, 2, liA(c, 0.4));
          R(2, 3, 28, 4, liA(c, 0.15));
          for (const x of [10, 20]) VL(x, 3, 7, shA(c, 0.25));
          R(5, 3, 22, 4, '#fbf6ea');
          HL(5, 26, 6, '#e0d8cc');
          RR(26, 0, 6, 4, 2, shA(c, 0.1));
          ell(29, 1.5, 1.5, 0.8, AK);
          // paper roll + rolled towel
          R(0, 3, 3, 4, '#fbf6ea');
          VL(1, 3, 6, '#d8d0c4');
          R(13, 1, 6, 2, '#ffd8e0');
          // chrome base + adjustment lever
          R(1, 9, 30, 2, '#d8dcf0');
          HL(1, 30, 10, '#9aa2c8');
          for (const x of [3, 27]) {
            R(x, 11, 2, 4, '#9aa2c8');
            R(x - 1, 15, 4, 1, '#4e4870');
          }
          L(16, 11, 19, 14, '#6e688e');
          P(19, 14, '#d8434b');
        },
        { shadow: [['r', 2, 12, 32, 5]] },
      ),
    ),
});

reg('yoga-mat', {
  flat: true,
  draw: (ctx, o) => {
    const v = variant(o, 3) ^ (o.x % 3);
    blit(
      ctx,
      o,
      art(
        `yoga-mat|${v % 3}`,
        16,
        32,
        () => {
          const c = ['#9ac0a0', '#b8a0d8', '#f0a890'][v % 3];
          RR(2, 0, 12, 31, 1, c);
          R(3, 1, 10, 29, (x, y, cc) => ((x + y) % 4 === 0 ? shA(cc, 0.08) : cc));
          VL(2, 1, 29, liA(c, 0.3));
          VL(13, 1, 29, shA(c, 0.25));
          // a lotus print at the top and a little rolled end at the bottom
          stampRows(['.#.#.', '#.#.#', '.###.'], { '#': liA(c, 0.5) }, 5, 3);
          RR(2, 27, 12, 4, 2, shA(c, 0.12));
          HL(3, 12, 28, liA(c, 0.25));
          // a folded towel + a foam block beside it
          R(9, 18, 4, 3, '#fbf6ea');
          HL(9, 12, 19, '#e0d8cc');
        },
        { outline: false, shadow: [['r', 3, 1, 12, 31]], shA: 50 },
      ),
    );
  },
});

reg('rocking-chair', {
  solid: { x: -7, y: -6, w: 14, h: 5 },
  draw: (ctx, o, t) => {
    // slow, gentle rocking
    const f = Math.round(Math.sin(t * 1.4 + phaseOf(o)) * 1);
    blit(
      ctx,
      o,
      art(
        `rocking-chair|${f}`,
        16,
        20,
        () => {
          const wd = WALNUT;
          const dx = f;
          // tall spindle back
          R(2 + dx, 0, 2, 12, wd.b);
          R(12 + dx, 0, 2, 12, wd.s);
          RR(2 + dx, 0, 12, 3, 1, wd.b);
          HL(3 + dx, 12 + dx, 0, wd.l);
          for (const x of [5, 8, 11]) VL(x + dx, 3, 10, x === 11 ? wd.s : wd.b);
          // knitted blanket over the back
          for (let y = 2; y < 8; y++) HL(4 + dx, 11 + dx, y, (x) => ((x + y) % 3 === 0 ? '#e88a9a' : (x + y) % 3 === 1 ? '#f6d38a' : '#9ce0c8'));
          // seat with a cushion, arms
          R(1, 10, 14, 3, wd.l);
          RR(3, 9, 10, 3, 1, '#c86a6a');
          R(0, 8, 2, 5, wd.b);
          R(14, 8, 2, 5, wd.s);
          // legs on curved runners
          R(2, 13, 2, 4, wd.b);
          R(12, 13, 2, 4, wd.s);
          curve(0, 17 - f, 16, 17 + f, 1, wd.d);
          curve(0, 18 - f, 16, 18 + f, 1, wd.s);
        },
        { shadow: [['r', 1, 16, 16, 4]] },
      ),
    );
  },
});

reg('tv-lounge', {
  solid: { x: -12, y: -9, w: 24, h: 8 },
  label: () => 'Watch',
  lights: (o) => [light(o, 0, -16, 44, '#a0d8ff')],
  draw: (ctx, o, t) => {
    const f = frame(t, 4, 3, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `tv-lounge|${f}`,
        24,
        24,
        () => {
          // big wooden console set on legs, with a doily and a vase of flowers on top
          RR(0, 3, 24, 17, 2, '#8a5a3e');
          grain(1, 4, 22, 15, { l: '#c08a5a', b: '#a06a44', s: '#7a4a38', d: '#5a3434' }, 291);
          HL(1, 22, 3, '#c89a6a');
          ell(17, 3, 5, 1.2, '#fffaf0');
          R(16, -2, 3, 5, '#5ec0a8');
          P(15, -3, '#ff94b4');
          P(17, -4, '#ffd050');
          P(19, -3, '#ff94b4');
          RR(2, 5, 15, 12, 2, '#2a2440');
          crtScreen(3, 6, 13, 10, f, 'soap');
          // speaker cloth + knobs
          R(18, 6, 4, 11, '#d8c8b0');
          for (let y = 7; y < 16; y += 2) HL(18, 21, y, '#b8a890');
          circ(20, 8, 1, '#5a4a5a');
          // legs
          for (const x of [2, 20]) R(x, 20, 2, 4, '#5a3434');
        },
        { shadow: [['r', 2, 20, 24, 5]] },
      ),
    );
  },
});

// ================================================================ dungeon

reg('dungeon-door', {
  label: () => 'Enter',
  hit: { x: -14, y: -12, w: 28, h: 16 },
  lights: (o) => [light(o, 0, -14, 34, '#5effa0')],
  draw: (ctx, o, t) => {
    const f = frame(t, 4, 3, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `dungeon-door|${f}`,
        32,
        40,
        () => {
          // stone arch of big uneven blocks
          poly(
            [
              [0, 40],
              [0, 14],
              [4, 5],
              [10, 1],
              [16, 0],
              [22, 1],
              [28, 5],
              [32, 14],
              [32, 40],
            ],
            '#5a5670',
          );
          for (let k = 0; k < 11; k++) {
            const a = Math.PI + (k / 10) * Math.PI;
            const x = 16 + Math.cos(a) * 14;
            const y = 16 + Math.sin(a) * 14;
            L(16 + Math.cos(a) * 9, 16 + Math.sin(a) * 9, x, y, '#2e2a40');
          }
          for (const y of [22, 30]) {
            HL(0, 3, y, '#2e2a40');
            HL(28, 31, y, '#2e2a40');
          }
          // the door: dark planks, iron bands with rivets, rounded top
          ell(16, 16, 10, 10, '#3a2430');
          R(6, 16, 20, 24, '#3a2430');
          for (let x = 7; x < 26; x += 4) VL(x, 8, 39, '#4e3040');
          for (const y of [14, 28]) {
            HL(6, 25, y, '#4e4870');
            HL(6, 25, y + 1, '#6e688e');
            for (let x = 8; x < 25; x += 4) P(x, y, '#9aa2c8');
          }
          // friendly skull knocker with a ring
          R(14, 18, 4, 3, '#e8e0cc');
          P(15, 19, AK);
          P(17, 19, AK);
          R(15, 21, 2, 1, '#d8ceb8');
          circ(16, 23.5, 1.8, '#9aa2c8');
          P(16, 23, '#3a2430');
          // glowing keyhole
          P(22, 22, '#5effa0');
          P(22, 23, '#5effa0');
          P(22, 24, f % 2 ? '#c8ffe0' : '#5effa0');
          // moss + green light leaking under the door
          for (let x = 0; x < 32; x += 3) P(x, 39 - (x % 2), '#6f9a5a');
          for (let x = 2; x < 32; x += 7) P(x, 6 + (x % 5), '#4e7a52');
          HL(7, 24, 39, [ '#3a8a5a', '#4ab070', '#5effa0', '#4ab070'][f]);
        },
        { shadow: [['r', 4, 37, 28, 5]] },
      ),
    );
  },
});

reg('torch', {
  lights: (o) => [light(o, 0, -12, 48, '#5effa0')],
  draw: (ctx, o, t) => {
    const f = frame(t, 4, 8, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `torch|${f}`,
        8,
        16,
        () => {
          // iron bracket + wooden handle
          R(3, 9, 2, 7, '#6a4a3a');
          VL(3, 9, 15, '#8a6a4a');
          R(1, 13, 6, 2, '#4e4870');
          HL(1, 6, 13, '#6e688e');
          R(2, 8, 4, 2, '#4e4870');
          // spooky green flame
          flame(f, 4, 8, 0.7, ['#2e8a5a', '#4ad08a', '#9dffc8', '#e8fff0']);
        },
        { outline: false },
      ),
    );
  },
});

// @@END@@
