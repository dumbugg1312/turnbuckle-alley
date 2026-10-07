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
import { FT, glyph, T, TC, TW } from '../font';
import { AK, type Color, circ, col, curve, dense, DS, dth, ell, FX, FY, GP, hash2, HL, L, liA, mixc, mkSpr, OUT, P, P1, type Paint, poly, R, rng, RR, RRB, selA, shA, type Spr, toCanvas, VG, VL } from '../kit';

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
  /**
   * Fine-pixel finish (default on for interiors via iart): a half-pixel rim
   * light along top/left silhouette edges, a soft occlusion line along the
   * bottom/right, and a faint material grain so no fill reads as flat colour.
   */
  polish?: boolean;
}

/** Fine-pixel finish pass over a dense sprite buffer (see ArtOpts.polish). */
function polishSpr(s: Spr, seed: number): void {
  const { w, h, d } = s;
  const src = d.slice();
  const op = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && src[y * w + x] >>> 24 === 255;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const c = src[i];
      if (c >>> 24 !== 255) continue;
      let out: number = c;
      if (!op(x, y - 1)) out = liA(out, 0.2);
      else if (!op(x - 1, y)) out = liA(out, 0.09);
      if (!op(x, y + 1)) out = shA(out, 0.14);
      else if (!op(x + 1, y)) out = shA(out, 0.08);
      const n = hash2(x, y, seed);
      if (n < 0.055) out = shA(out, 0.06);
      else if (n > 0.965) out = liA(out, 0.07);
      d[i] = out;
    }
}
const seedOf = (k: string) => {
  let hh = 7;
  for (let i = 0; i < k.length; i++) hh = (hh * 31 + k.charCodeAt(i)) | 0;
  return hh & 0xffff;
};
const PAD = 5;

/** Art density for every object sprite (DECISIONS.md D-018): world-pixel coords, 2x fine pixels. */
export const ART_K = 2;

/**
 * Build-and-cache an object sprite. body() draws into a w x h box whose
 * bottom-centre is the anchor. Returns the canvas and its offset from the anchor.
 * Built at double density: body() still uses world-pixel coordinates, and can
 * add half-pixel detail with fractional coordinates, P1(), and FX/FY.
 */
export function art(key: string, w: number, h: number, body: () => void, o: ArtOpts = {}): Built {
  const hit = BUILT.get(key);
  if (hit) return hit;
  return dense(ART_K, () => {
    const K = ART_K;
    let s: Spr = mkSpr(w, h, body);
    if (o.polish) polishSpr(s, seedOf(key));
    const outlined = o.outline !== false;
    if (outlined) s = OUT(s, selA);
    const off = outlined ? 1 : 0;
    const W = w + PAD * 2;
    const H = h + PAD * 2;
    const FW = W * K;
    const FH = H * K;
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
        const at = (x: number, y: number) => (x < 0 || y < 0 || x >= FW || y >= FH ? 0 : m.d[y * FW + x]);
        for (let y = 0; y < FH; y++)
          for (let x = 0; x < FW; x++) {
            if (!at(x, y)) continue;
            // Two fine rings of dithered falloff, then the solid core.
            const e1 = !at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1);
            const e2 = !e1 && (!at(x - 2, y) || !at(x + 2, y) || !at(x, y - 2) || !at(x, y + 2));
            if (e1) {
              if (dth(x, y, 6)) P1(x / K, y / K, SH(Math.round(a * 0.7)));
            } else if (e2) P1(x / K, y / K, SH(Math.round(a * 0.85)));
            else P1(x / K, y / K, SH(a));
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
  });
}

/** Interior art: art() with the fine-pixel finish on. */
function iart(key: string, w: number, h: number, body: () => void, o: ArtOpts = {}): Built {
  return art(key, w, h, body, { polish: true, ...o });
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
  // Drawn each frame under everything (not baked into the 1x ground) so its fine pixels survive.
  sortY: -4096,
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
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
/** What a window looks out on (props.view): the default hills, the marquee, the city, the street. */
function windowView(view: string, gx: number, gy: number, gw: number, gh: number): void {
  if (view === 'marquee') {
    // dusk over the rooftops, and the Sportatorium marquee lit up across the street
    VG(gx, gy, gw, gh, ['#5a4a8a', '#c87a9a', '#f6b88a']);
    R(gx, gy + 7, gw, gh - 7, '#4a3a5a');
    for (let x = 0; x < gw; x += 3) R(gx + x, gy + 6 + (x % 2), 2, 2, '#3a2c4a');
    R(gx + 2, gy + 3, 12, 6, '#2b2140');
    R(gx + 2.5, gy + 3.5, 11, 5, '#3a3478');
    tinyC('SAT ACW', gx + 8, gy + 4.2, '#ffd050');
    for (let x = gx + 2.5; x < gx + 14; x += 1.5) {
      P1(x, gy + 3.2, '#fff4c0');
      P1(x + 0.5, gy + 8.5, '#fff4c0');
    }
    for (let k = 0; k < 6; k++) P1(gx + 1 + k * 2.6, gy + 9.5 + (k % 2), '#ffe08a');
    P1(gx + 13, gy + 1, '#ffffff');
    return;
  }
  if (view === 'city') {
    VG(gx, gy, gw, gh, ['#7a9ad0', '#b8c8e8', '#f0d8c8']);
    for (let k = 0; k < 6; k++) {
      const bh = 4 + hash2(k, 7, 501) * (gh - 3);
      const bx = gx + k * 2.8;
      R(bx, gy + gh - bh, 2.4, bh, k % 2 ? '#5a6a90' : '#6a7aa0');
      for (let w = 1; w < bh - 1; w += 1.5) if (hash2(k, w * 3, 502) < 0.45) P1(bx + 0.5 + (w % 2), gy + gh - bh + w, '#ffe8a8');
    }
    return;
  }
  if (view === 'street') {
    VG(gx, gy, gw, gh * 0.55, ['#9cc8e8', '#d8ecf4']);
    R(gx, gy + gh * 0.55, gw, gh * 0.45, '#c87a5a');
    R(gx, gy + gh * 0.55, gw, gh * 0.45, (_a, _b, o2) => (o2 && (FY % 3 === 0 || FX % 7 === 0) ? '#a85a4a' : o2));
    R(gx + 3, gy + gh * 0.55 + 1.5, 4, 3, '#ffe08a');
    R(gx + 10, gy + gh * 0.55 + 1.5, 4, 3, '#9cc8e0');
    return;
  }
}
reg('window', {
  draw: (ctx, o) => {
    const v = variant(o, 4);
    const view = String(o.props.view ?? '');
    blit(
      ctx,
      o,
      iart(`window|${v}|${view}`, 24, 20, () => {
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
        if (view) windowView(view, gx, gy, gw, gh);
        fglare(gx, gy, gw, gh, 0.32);
        // mullions (a single picture pane for the views worth looking at)
        if (view === 'marquee') {
          // one big pane: nothing between her and the marquee
        } else if (view === 'city') {
          V1(11.75, 4, 15, '#efe2c8');
        } else {
          VL(11, 4, 14, '#efe2c8');
          VL(12, 4, 14, '#d6c2a4');
          HL(4, 19, 9, '#efe2c8');
        }
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
      iart(
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
      iart(
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
      iart(
        `calendar|${String(o.props.year ?? '')}`,
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
          if (o.props.year) {
            // stopped on a month forty years ago: yellowed, one date ringed hard in red
            R(0, 2, 12, 12, (_a, _b, o2) => (o2 && dth(FX, FY, 5) ? mixc(o2, '#e8d8a8', 0.35) : o2));
            R(1, 5.5, 10, 2, '#fbf6ea');
            tinyC(`OCT ${String(o.props.year)}`, 6, 5.6, '#a8343e');
            ell(9, 12, 1.8, 1.4, (_a, _b, o2) => o2);
            for (let k = 0; k < 10; k++) P1(9 + Math.cos(k * 0.63) * 1.6, 12 + Math.sin(k * 0.63) * 1.2, '#d8202e');
          }
          wallShadow(0, 2, 12, 12);
        },
        { outline: false },
      ),
    ),
});

// ---------------------------------------------------------------- door set into a wall
reg('door-wall', {
  draw: (ctx, o) => {
    const text = String(o.props.plate ?? o.props.text ?? '').toUpperCase();
    const v = variant(o, 3);
    const swing = o.props.swing === true;
    blit(
      ctx,
      o,
      iart(
        `door-wall|${v}|${text}|${swing ? 's' : ''}`,
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
          for (const [py, ph] of (swing ? [] : [
            [9, 8],
            [20, 9],
          ]) as [number, number][]) {
            R(x0 + 4, py, 8, ph, shA(wd.b, 0.08));
            HL(x0 + 4, x0 + 11, py, wd.s);
            VL(x0 + 4, py, py + ph - 1, wd.s);
            HL(x0 + 4, x0 + 11, py + ph - 1, wd.l);
            VL(x0 + 11, py, py + ph - 1, wd.l);
          }
          if (swing) {
            // a kitchen swing door: porthole window onto a warm kitchen, steel push plate
            circ(cx, 13, 4.2, '#9aa2c8');
            circ(cx, 13, 3.4, '#c8cce4');
            circ(cx, 13, 2.8, '#a85a3a');
            ell(cx, 14.2, 2.6, 1.2, '#d8803a');
            P1(cx - 1, 12, '#ffd8a0');
            L1(cx - 2, 12.5, cx - 0.5, 11, '#fff4e0');
            R(x0 + 3, 20, 10, 3, '#c8cce4');
            H1(x0 + 3, x0 + 13, 20, '#ffffff');
            for (const rx of [x0 + 3.5, x0 + 12.5]) P1(rx, 21.5, '#6e688e');
          }
          // brass knob + kick plate
          if (!swing) circ(x0 + 11.5, 19.5, 1.3, PAL.gold2);
          if (!swing) {
            P(x0 + 11, 19, '#fff4c0');
            P(x0 + 12, 20, PAL.gold3);
          }
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
      iart(
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
      iart(
        `dresser|${o.props.labels ? 1 : 0}`,
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
          if (o.props.labels) {
            // Sami's label-maker tape on every drawer
            for (const [cx, ly0, txt] of [[6.5, 11.5, 'SOCKS'], [17.5, 11.5, 'HATS'], [12, 15.5, 'CARDIGANS'], [12, 19.5, 'NO LAVINIA']] as [number, number, string][]) {
              const w = tinyW(txt) + 1;
              R(cx - w / 2, ly0, w, 2.5, '#2b2140');
              tinyC(txt, cx, ly0 + 0.1, '#f2eef6');
            }
          }
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
      iart(
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
      iart(
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
      iart(
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
  // Drawn each frame under everything (not baked into the 1x ground) so its fine pixels survive.
  sortY: -4096,
  draw: (ctx, o) => {
    const v = variant(o, 4);
    const W = num(o, 'w', 3) * 16;
    const H = num(o, 'h', 3) * 16;
    blit(ctx, o, iart(`rug|${v}|${W}x${H}`, W, H, () => rugBody(v, W, H), { outline: false }));
  },
});

reg('table', {
  solid: { x: -16, y: -14, w: 32, h: 12 },
  draw: (ctx, o) => {
    const v = variant(o, 2);
    blit(
      ctx,
      o,
      iart(
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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

// ---------------------------------------------------------------- Grandma's house and other homes

/** White dust sheets thrown over furniture forty years ago: armchair, tall thing, side table. */
reg('dust-sheet', {
  solid: { x: -8, y: -6, w: 16, h: 5 },
  draw: (ctx, o) => {
    const v = variant(o, 3);
    const W = [22, 14, 18][v];
    const H = [20, 30, 14][v];
    blit(
      ctx,
      o,
      iart(
        `dust-sheet|${v}`,
        W,
        H,
        () => {
          const sheet = '#efe8dc';
          // silhouette of whatever is underneath
          if (v === 0) {
            // an armchair: wings, a sagging seat, the sheet pooling on the floor
            poly([[2, 4], [5, 1], [17, 1], [20, 4], [21, 12], [22, 19], [0, 19], [1, 12]], sheet);
          } else if (v === 1) {
            // something tall: a standing mirror or a coat rack
            poly([[5, 0], [9, 0], [11, 8], [12, 22], [14, 29], [0, 29], [2, 22], [3, 8]], sheet);
          } else {
            // a side table with a lamp on it
            poly([[7, 0], [11, 0], [12, 4], [17, 6], [18, 13], [0, 13], [1, 6], [6, 4]], sheet);
          }
          // folds: soft shading that falls away from the light, crease lines, dust on top
          R(0, 0, W, H, (_a, _b, o2) => {
            if (!o2) return o2;
            const x = lx();
            const y = ly();
            const fold = Math.sin(x * 1.1 + Math.sin(y * 0.4) * 2) * 0.5 + 0.5;
            let c = mixc('#fbf6ee', '#c8bcb0', fold * 0.45 + (y / H) * 0.35 + (x / W) * 0.15);
            if (y < 4 && hash2(FX, FY, 461) < 0.25) c = mixc(c, '#b8b0a4', 0.35);
            if (hash2(FX, FY, 462) < 0.02) c = shA(c, 0.12);
            return c;
          });
          for (let k = 0; k < 4; k++) {
            const fx0 = W * (0.2 + 0.2 * k);
            L1(fx0, H * 0.35, fx0 + (k % 2 ? 1.5 : -1.5), H - 0.5, '#bfb2a4');
          }
          // the hem pools on the floor
          H1(0, W, H - 0.5, '#a89c90');
          for (let x = 0.5; x < W; x += 3) P1(x, H - 1, '#d8ccc0');
        },
        { shadow: [['r', 0, H - 3, W, 4]] },
      ),
    );
  },
});

/** A cobweb in a wall corner (props.flip for the right-hand corner). */
reg('cobweb', {
  draw: (ctx, o) => {
    const flip = o.props.flip === true;
    blit(
      ctx,
      o,
      iart(
        `cobweb|${flip ? 1 : 0}`,
        12,
        12,
        () => {
          const X = (x: number) => (flip ? 12 - x : x);
          const c = alpha('#f2eef6', 170);
          for (let k = 0; k < 5; k++) {
            const a = (k / 4) * (Math.PI / 2);
            L1(X(0), 0, X(Math.cos(a) * 11), Math.sin(a) * 11, c);
          }
          for (const r0 of [3, 5.5, 8, 10.5]) {
            let px = X(r0);
            let py = 0;
            for (let k = 1; k <= 4; k++) {
              const a = (k / 4) * (Math.PI / 2);
              const nx = X(Math.cos(a) * r0 * (0.92 + (k % 2) * 0.08));
              const ny = Math.sin(a) * r0 * (0.92 + (k % 2) * 0.08);
              L1(px, py, nx, ny, c);
              px = nx;
              py = ny;
            }
          }
          P1(X(6), 5, '#5a4a5a');
          P1(X(6.5), 5, '#3a2c3a');
        },
        { outline: false },
      ),
    );
  },
});

/** A shaft of window light with dust motes drifting in it (drawn over everything, very faint). */
reg('sunbeam', {
  above: true,
  draw: (ctx, o, t) => {
    const f = frame(t, 8, 2, phaseOf(o));
    const len = num(o, 'len', 4);
    blit(
      ctx,
      o,
      iart(
        `sunbeam|${f}|${len}`,
        28,
        len * 16,
        () => {
          const H = len * 16;
          // a parallelogram falling down-right from the window
          for (let y = 0; y < H; y += 0.5) {
            const t2 = y / H;
            const x0 = 2 + t2 * 8;
            const w = 14 + t2 * 4;
            R(x0, y, w, 0.5, () => (dth(FX, FY, Math.round(3 - t2 * 2)) ? alpha('#fff4d0', 70) : null));
          }
          // motes
          for (let k = 0; k < 12; k++) {
            const mx = 4 + hash2(k, 1, 471) * 18 + hash2(k, 2, 471) * (H / 16) * 2;
            const my = (hash2(k, 3, 471) * H + f * 2 + k * 3) % H;
            P1(mx + (my / H) * 8, my, alpha('#ffffff', 200));
          }
        },
        { outline: false },
      ),
    );
  },
});

/** A run of kitchen counters against the back wall, upper cabinets climbing the wall. */
const KITCHENS: Record<string, { cab: Color; top: Color; tile: Color; tile2: Color }> = {
  grandma: { cab: '#f2d68a', top: '#e8e0d0', tile: '#fbf6ea', tile2: '#d8a040' },
  taqueria: { cab: '#3f8a86', top: '#e8dcc4', tile: '#fbf6ea', tile2: '#2f6ab0' },
  bakery: { cab: '#f2c8d0', top: '#fbf6ea', tile: '#fbf6ea', tile2: '#e88a9a' },
  steel: { cab: '#c8cce0', top: '#f2eef6', tile: '#e8eef2', tile2: '#9aa2c8' },
};
reg('kitchen-run', {
  draw: (ctx, o, t) => {
    const n = num(o, 'w', 3);
    const W = n * 16;
    const style = String(o.props.style ?? 'grandma');
    const k = KITCHENS[style] ?? KITCHENS.grandma;
    const steam = frame(t, 4, 3, phaseOf(o));
    const kettle = o.props.kettle !== false;
    blit(
      ctx,
      o,
      iart(
        `kitchen-run|${n}|${style}|${kettle ? steam : 'x'}`,
        W,
        38,
        () => {
          // tiled backsplash with a fine grout grid and a border of accent tiles
          R(0, 12, W, 10, k.tile);
          R(0, 12, W, 10, (_a, _b, o2) => (o2 && (FX % 6 === 0 || FY % 6 === 0) ? shA(k.tile, 0.12) : o2));
          for (let x = 0; x < W; x += 3) R(x, 12, 1.5, 1.5, k.tile2);
          // upper cabinets with little knobs; one door ajar showing the good dishes
          for (let x = 0; x < W; x += 16) {
            R(x + 0.5, 0, 15, 11, k.cab);
            R(x + 1.5, 1, 6, 9, liA(k.cab, 0.08));
            R(x + 8.5, 1, 6, 9, liA(k.cab, 0.08));
            H1(x + 1.5, x + 7.5, 1, liA(k.cab, 0.4));
            H1(x + 8.5, x + 14.5, 1, liA(k.cab, 0.4));
            V1(x + 8, 0, 11, shA(k.cab, 0.35));
            P1(x + 7, 8, '#9aa2c8');
            P1(x + 9, 8, '#9aa2c8');
            H1(x + 0.5, x + 15.5, 10.5, shA(k.cab, 0.35));
          }
          if (n >= 2) {
            R(17.5, 1, 6, 9, '#4a3a4a');
            for (let i = 0; i < 3; i++) ell(20.5, 3 + i * 2.5, 2.4, 0.8, i % 2 ? '#fbf6ea' : '#9cc8e0');
            poly([[23.5, 1], [26, 2], [26, 11], [23.5, 10]], liA(k.cab, 0.15));
          }
          // worktop
          R(0, 22, W, 2.5, k.top);
          H1(0, W, 22, '#ffffff');
          chrome(0, 24.5, W, 0.8, false);
          // sink in the middle with a gooseneck tap and a dish rack
          const sx = Math.floor(n / 2) * 16 + 2;
          R(sx, 22.5, 12, 1.8, '#9aa2c8');
          chrome(sx + 5, 18, 1, 4.5);
          L1(sx + 5.5, 18, sx + 8, 18.5, '#c8cce4');
          for (let i = 0; i < 4; i++) ell(sx + 14 + i * 1.6, 20.5, 0.6, 2, i % 2 ? '#fbf6ea' : '#e8dcd0');
          // canisters, a kettle on the left
          if (kettle) {
            ell(5, 21, 3.5, 2, '#d8434b');
            R(2, 18, 6, 3, '#d8434b');
            ell(5, 18, 2.5, 1, '#e8706a');
            L1(8, 19, 10, 17.5, '#d8434b');
            for (let s2 = 0; s2 < 3; s2++) P1(10.5 + s2 * 0.6, 16.5 - s2 * 1.3 - (steam % 2) * 0.5, alpha('#ffffff', 170 - s2 * 40));
          }
          for (let i = 0; i < 3; i++) {
            const cx = W - 14 + i * 4;
            R(cx, 22 - (4 - i), 3, 4 - i, '#fbf6ea');
            H1(cx, cx + 3, 22 - (4 - i), shA(k.tile2, 0.1));
            R(cx, 20 - (3 - i), 3, 0.8, k.tile2);
          }
          // base cabinets, a dish towel over the oven-door handle
          R(0, 25.3, W, 12.7, k.cab);
          for (let x = 0; x < W; x += 16) {
            R(x + 1.5, 26.5, 13, 9.5, liA(k.cab, 0.06));
            H1(x + 1.5, x + 14.5, 26.5, liA(k.cab, 0.35));
            V1(x + 14.5, 26.5, 36, shA(k.cab, 0.3));
            R(x + 6, 28, 4, 0.8, '#9aa2c8');
          }
          R(4, 28.5, 4, 6, '#fbf6ea');
          R(4, 30, 4, 1, '#d8434b');
          R(0, 36.5, W, 1.5, shA(k.cab, 0.5));
        },
        { outline: false },
      ),
    );
  },
});

reg('wall-phone', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'wall-phone',
        10,
        24,
        () => {
          // a harvest-gold rotary wall phone with a cord long enough to cook dinner on
          RR(1, 0, 8, 12, 1, '#d8a040');
          R(1.5, 0.5, 7, 11, (_a, _b) => mixc('#f2c060', '#b8802a', (lx() - 1.5) / 7));
          circ(5, 7, 2.6, '#fbf6ea');
          for (let k = 0; k < 10; k++) P1(5 + Math.cos(k * 0.62) * 1.8, 7 + Math.sin(k * 0.62) * 1.8, '#5a4a3a');
          P1(5, 7, '#d8a040');
          RR(0, 1, 2.5, 9, 1, '#c8902a');
          for (let i = 0; i < 18; i++) {
            const cy = 11 + i * 0.7;
            P1(1.2 + Math.sin(i * 1.7) * 0.9 + i * 0.1, cy, '#c8902a');
          }
          // a list pinned beside it in Grandma's hand
          R(6, 14, 4, 5.5, '#fbf6ea');
          H1(6.5, 9.5, 15, '#a89cc0');
          H1(6.5, 9, 16, '#a89cc0');
          H1(6.5, 9.5, 17, '#a89cc0');
        },
        { outline: false },
      ),
    ),
});

/** A vanity table with a round mirror ringed in bulbs (Grandma's; later, Room 7's). */
reg('vanity', {
  solid: { x: -10, y: -6, w: 20, h: 5 },
  lights: (o) => [light(o, 0, -24, 36, '#fff0d0')],
  draw: (ctx, o) => {
    const covered = o.props.covered === true;
    blit(
      ctx,
      o,
      iart(
        `vanity|${covered ? 1 : 0}`,
        24,
        36,
        () => {
          const wd = CHERRY;
          // round mirror, a ring of bulbs, photos tucked in the frame
          circ(12, 10, 10, '#e8c870');
          circ(12, 10, 9, '#c8a050');
          circ(12, 10, 8, '#8ab0c0');
          VG(4, 2, 16, 16, ['#a8c8d8', '#7aa0b8', '#5a7a98']);
          R(0, 0, 24, 20, (_a, _b, o2) => (Math.hypot(lx() - 12, ly() - 10) > 8 && Math.hypot(lx() - 12, ly() - 10) < 8.6 ? '#c8a050' : o2));
          R(0, 0, 24, 20, (_a, _b, o2) => (Math.hypot(lx() - 12, ly() - 10) > 10.2 ? 0 : o2));
          fglare(4, 2, 16, 16, 0.3);
          for (let k = 0; k < 12; k++) {
            const a = (k / 12) * Math.PI * 2;
            ell(12 + Math.cos(a) * 9.5, 10 + Math.sin(a) * 9.5, 1, 1, covered ? '#d8d0c0' : '#fff6dc');
          }
          if (!covered) {
            R(15, 4, 4, 5, '#fbf6ea');
            R(15.5, 4.5, 3, 3, '#e8c8a0');
            ell(16.3, 5.5, 0.6, 0.6, '#6a4a3a');
            ell(17.6, 5.5, 0.6, 0.6, '#c89a5a');
          }
          // the table: cherry, three drawers, a kidney-shaped skirt
          R(0, 19, 24, 3, wd.l);
          fgrain(0, 19, 24, 3, { ...wd, b: wd.l }, 481);
          H1(0, 24, 19, liA(wd.l, 0.4));
          R(1, 22, 22, 8, wd.b);
          fgrain(1, 22, 22, 8, wd, 482, true);
          for (const dx0 of [2, 9, 16]) {
            R(dx0, 23, 6, 3, shA(wd.b, 0.06));
            H1(dx0, dx0 + 6, 23, liA(wd.b, 0.25));
            P1(dx0 + 3, 24.5, PAL.gold2);
          }
          for (const lx0 of [1.5, 21]) R(lx0, 30, 1.5, 6, wd.d);
          // perfume bottles, a powder puff, a wig on a foam head (platinum, for the ring)
          R(3, 16.5, 2, 2.5, '#ff94b4');
          P1(3.5, 16, PAL.gold2);
          R(6, 17, 1.5, 2, '#c8e0f0');
          ell(19, 18.2, 2, 0.8, '#ffd8e0');
          if (!covered) {
            ell(9.5, 15.5, 2.5, 2.8, '#e8e0d4');
            ell(9.5, 13.8, 3, 2.2, '#f6ecd0');
            for (let k = 0; k < 6; k++) P1(7 + k, 13.5 + (k % 2) * 0.5, '#fff8e8');
          }
          if (covered) {
            // a sheet thrown over the mirror and half sliding off
            poly([[2, 1], [22, 2], [21, 14], [14, 18], [3, 12]], '#efe8dc');
            L1(8, 3, 9, 15, '#c8bcb0');
            L1(15, 3, 15.5, 16, '#c8bcb0');
          }
        },
        { shadow: [['r', 1, 33, 23, 4]] },
      ),
    );
  },
});

reg('coffee-table', {
  solid: { x: -12, y: -7, w: 24, h: 6 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'coffee-table',
        26,
        14,
        () => {
          const wd = WALNUT;
          // low oval table, a lace doily, a candy dish, TV guides from 1983, reading glasses
          for (const lx0 of [3, 21]) R(lx0, 7, 2, 7, wd.d);
          ell(13, 5, 13, 4.5, wd.b);
          ell(13, 4.5, 12.5, 4, wd.l);
          fgrain(1, 1, 24, 7, { ...wd, b: wd.l }, 491);
          R(0, 0, 26, 10, (_a, _b, o2) => (o2 && Math.hypot((lx() - 13) / 12.5, (ly() - 4.5) / 4) > 1 && ly() < 6 ? 0 : o2));
          ell(13, 8.2, 12, 1.6, wd.s);
          ell(10, 4.5, 4.5, 2, '#fffaf0');
          for (let k = 0; k < 12; k++) P1(10 + Math.cos(k * 0.52) * 4.2, 4.5 + Math.sin(k * 0.52) * 1.9, '#e8dcd0');
          ell(10, 4, 2, 1, '#9cc8e0');
          for (let k = 0; k < 5; k++) P1(9 + k * 0.5, 3.8, k % 2 ? '#d8434b' : '#ffd050');
          R(16, 2.5, 6, 4, '#fbf6ea');
          R(16, 2.5, 6, 1.5, '#d8434b');
          tinyT('TV', 16.5, 4.2, '#3a2c3a');
          R(16.5, 1.5, 6, 4, '#fbf6ea');
          R(16.5, 1.5, 6, 1.2, '#3f6ab0');
          ell(5, 3.5, 1, 0.7, '#4e4870');
          ell(7.2, 3.5, 1, 0.7, '#4e4870');
          H1(5.5, 6.5, 3.5, '#4e4870');
        },
        { shadow: [['e', 13, 12, 12, 2]] },
      ),
    ),
});

/** A blanket ladder hung with folded quilts, and Grandma's hatbox at its foot. */
reg('quilt-rack', {
  solid: { x: -7, y: -4, w: 14, h: 3 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'quilt-rack',
        16,
        30,
        () => {
          const wd = OAK;
          for (const rx of [2, 12]) {
            R(rx, 0, 2, 28, wd.b);
            V1(rx, 0, 28, wd.l);
          }
          for (const ry of [4, 12, 20]) R(2, ry, 12, 1.2, wd.s);
          const qs = QUILTS;
          [3.5, 11.5, 19.5].forEach((qy, i) => {
            const q = qs[i % qs.length];
            R(1, qy, 14, 6 - i, (_a, _b) => q[(Math.floor(lx() / 2.5) + Math.floor((ly() - qy) / 2.5) * 2) % q.length]);
            H1(1, 15, qy, liA(q[0], 0.4));
            H1(1, 15, qy + 6 - i - 0.5, shA(q[1], 0.3));
          });
          // the hatbox
          ell(8, 27.5, 6, 2, '#5a3a6a');
          R(2, 23.5, 12, 4, '#7a4a8a');
          ell(8, 23.5, 6, 2, '#9a6aaa');
          H1(2, 14, 25, '#ffd050');
        },
        { shadow: [['e', 8, 29, 7, 1.5]] },
      ),
    ),
});


/** Wall hooks: cardigans in a row, one plum scarf. */
reg('coat-hooks', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'coat-hooks',
        26,
        22,
        () => {
          R(0, 1, 26, 2, OAK.b);
          H1(0, 26, 1, OAK.l);
          const cs: Color[] = ['#c8a8d8', '#e8c870', '#9cc8b8', '#5a3a6a'];
          cs.forEach((c, i) => {
            const x = 2 + i * 6;
            P1(x + 2, 3, PAL.gold2);
            if (i === 3) {
              // the plum scarf
              poly([[x + 1, 3], [x + 3, 3], [x + 3.5, 16], [x + 2, 18], [x + 1.5, 16]], c);
              for (let k = 0; k < 3; k++) P1(x + 2 + k * 0.5, 18.5, c);
              return;
            }
            poly([[x, 4], [x + 4, 4], [x + 5, 18], [x - 1, 18]], c);
            R(x - 1, 4, 6, 14, (_a, _b, o2) => (o2 && FY % 2 === 0 ? shA(o2, 0.08) : o2));
            V1(x + 2, 5, 18, shA(c, 0.3));
            for (let k = 0; k < 4; k++) P1(x + 2.5, 7 + k * 3, '#fbf6ea');
            H1(x - 1, x + 5, 17.5, shA(c, 0.25));
          });
          V1(26, 2, 20, SH(60));
        },
        { outline: false },
      ),
    ),
});

/** Sneakers lined up toes out, the way you line up boots in a locker room. */
reg('sneakers', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'sneakers',
        22,
        6,
        () => {
          const cs: Color[] = ['#fbf6ea', '#c8a8d8', '#9cc8e0'];
          cs.forEach((c, i) => {
            for (const dx of [0, 3]) {
              const x = 1 + i * 7 + dx;
              RR(x, 0.5, 2.6, 5, 1, c);
              R(x, 4, 2.6, 1.2, '#e8dcd0');
              P1(x + 1, 1.5, '#5a4a6a');
              P1(x + 1, 2.5, '#5a4a6a');
            }
          });
        },
        { shadow: [['r', 0, 4, 22, 2]] },
      ),
    ),
});

/** A little side table: reading lamp and the memory book Sami keeps with her. */
reg('side-table', {
  solid: { x: -5, y: -4, w: 10, h: 3 },
  lights: (o) => [light(o, -1, -18, 30, '#ffe0a0')],
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'side-table',
        14,
        24,
        () => {
          const wd = WALNUT;
          // lamp
          R(5.5, 6, 1, 6, PAL.gold3);
          poly([[3, 0], [9, 0], [10.5, 6], [1.5, 6]], '#f2c8d0');
          H1(3, 9, 0, '#ffe8ee');
          for (let x = 2.5; x < 10; x += 1.5) V1(x, 1.5, 6, '#e0a8b8');
          // tabletop with the memory book, a deck of cards, peppermints
          R(0, 12, 14, 2, wd.l);
          H1(0, 14, 12, liA(wd.l, 0.4));
          R(1, 9.5, 7, 2.5, '#7a4a8a');
          H1(1, 8, 9.5, '#9a6aaa');
          R(1.5, 11.5, 6, 0.5, '#fbf6ea');
          tinyT('MEMORY', 1.5, 10, '#ffd050');
          R(9, 10.5, 3, 1.5, '#d8434b');
          R(9.2, 10, 2.6, 0.6, '#fbf6ea');
          R(1, 14, 12, 8, wd.b);
          fgrain(1, 14, 12, 8, wd, 511, true);
          H1(1, 13, 14, wd.s);
          R(5, 16, 4, 1, PAL.gold2);
          for (const lx0 of [1.5, 11]) R(lx0, 22, 1.5, 2, wd.d);
        },
        {
          shadow: [['r', 1, 21, 13, 3]],
          over: () => {
            R(2, 6, 8, 2, () => (dth(FX, FY, 4) ? alpha('#fff0c0', 110) : null));
          },
        },
      ),
    ),
});


/** A tall cheval mirror on a stand: the one you look into before you leave the city. */
reg('standing-mirror', {
  solid: { x: -5, y: -4, w: 10, h: 3 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'standing-mirror',
        14,
        30,
        () => {
          const wd = WALNUT;
          // stand legs and pivots
          L1(2, 29, 4, 20, wd.s);
          L1(12, 29, 10, 20, wd.s);
          R(1, 8, 1.5, 21, wd.b);
          R(11.5, 8, 1.5, 21, wd.b);
          ell(1.8, 13, 1, 1, PAL.gold2);
          ell(12.2, 13, 1, 1, PAL.gold2);
          // oval frame and glass with a long glint
          ell(7, 13, 5, 11, wd.l);
          ell(7, 13, 4.2, 10.2, wd.d);
          ell(7, 13, 3.6, 9.5, '#8ab0c0');
          R(2, 2, 10, 22, (_a, _b, o2) => {
            if (!o2 || Math.hypot((lx() - 7) / 3.6, (ly() - 13) / 9.5) > 1) return o2;
            return mixc('#b8d8e8', '#5a7a98', (ly() - 3.5) / 19 * 0.7 + (lx() - 3.4) / 7.2 * 0.3);
          });
          L1(5, 6, 6.5, 4, '#ffffff');
          L1(4.5, 9, 7.5, 5, '#e8f8ff');
          // a sticky note on the frame: "CALL GRANDMA"
          R(8.5, 19, 4, 3.5, '#fff4a0');
          H1(9, 12, 20, '#c9404c');
          H1(9, 11.5, 21, '#c9404c');
        },
        { shadow: [['e', 7, 29, 6, 1.4]] },
      ),
    ),
});

/** The mail on the mat: two bills, a coupon, and one envelope addressed in pencil. */
reg('mail-pile', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'mail-pile',
        14,
        7,
        () => {
          poly([[0, 3], [6, 1.5], [7, 5.5], [1, 7]], '#fbf6ea');
          H1(1, 5, 3.5, '#c9404c');
          poly([[5, 2], [11, 0.5], [12, 4], [6, 5.5]], '#e8f0f8');
          R(7, 2, 2.5, 1, '#3f6ab0');
          poly([[3, 4], [10, 3], [10.5, 6.5], [3.5, 7]], '#f2e2c4');
          L1(4, 5, 7, 4.7, '#7a6a5a');
          L1(4.5, 5.8, 8, 5.4, '#7a6a5a');
          R(8.5, 3.6, 1.2, 1.2, '#c9404c');
          R(10.5, 4, 3.5, 2.5, '#ffd050');
        },
        { outline: false },
      ),
    ),
});

/** Takeout boxes and cans: city dinners. */
reg('takeout', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'takeout',
        18,
        9,
        () => {
          // pizza box with a grease spot, a noodle carton with chopsticks, two energy drinks
          R(0, 3, 10, 5, '#d8b888');
          R(0, 3, 10, 1.2, '#e8cc9c');
          ell(6, 5.5, 1.6, 1, '#c09868');
          tinyT('PIZZA', 1, 5, '#c9404c');
          poly([[11, 3], [15, 3], [14.5, 8], [11.5, 8]], '#fbf6ea');
          R(12, 5, 2, 1.2, '#c9404c');
          L1(13, 3, 14.5, -0.5, '#c8a060');
          L1(13.6, 3, 15.4, 0, '#c8a060');
          for (const cx of [15.5, 17]) {
            R(cx, 4, 1.4, 4, '#5fd0a8');
            R(cx, 4, 1.4, 0.6, '#c8cce4');
          }
        },
        { shadow: [['r', 0, 7, 18, 2]] },
      ),
    ),
});

/** A heap of laundry with the MaxxMedia lanyard on top. */
reg('clothes-pile', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'clothes-pile',
        16,
        9,
        () => {
          ell(8, 6, 8, 3, '#5a6a90');
          ell(5, 5, 4, 2.5, '#d8434b');
          ell(11, 4.5, 4, 2.4, '#e8e0d4');
          ell(8, 3.5, 3.5, 2, '#3a3450');
          R(2, 5, 12, 4, (_a, _b, o2) => (o2 && hash2(FX, FY, 521) < 0.08 ? shA(o2, 0.15) : o2));
          curve(4, 2.5, 12, 3, 2, '#3f6ab0');
          R(10.5, 4, 2.5, 3, '#fbf6ea');
          R(10.5, 4, 2.5, 1, '#3f6ab0');
        },
        { shadow: [['e', 8, 8, 8, 1.5]] },
      ),
    ),
});

// ---------------------------------------------------------------- the Evening Bell Residence

/** A card table mid-game of rummy: the score pad says Velma is cheating again. */
reg('card-table', {
  solid: { x: -12, y: -9, w: 24, h: 8 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'card-table',
        28,
        20,
        () => {
          // three chairs around it, seen from behind and the sides
          for (const [cx, cy] of [[3, 2], [25, 2]] as [number, number][]) {
            R(cx - 2, cy, 4, 9, HONEY.b);
            H1(cx - 2, cx + 2, cy, HONEY.l);
          }
          for (const lx0 of [5, 22]) R(lx0, 11, 1.5, 8, '#6e688e');
          R(4, 4, 20, 8, '#2f6a52');
          R(4.5, 4.5, 19, 7, (_a, _b, o2) => (o2 && hash2(FX, FY, 581) < 0.06 ? shA(o2, 0.12) : o2));
          H1(4, 24, 4, '#5fa882');
          R(4, 12, 20, 1.5, '#1e4a3a');
          // a fanned hand, the discard pile, the stock, the score pad, peppermints
          for (let k = 0; k < 5; k++) {
            const a = -0.6 + k * 0.3;
            const cx = 8 + Math.sin(a) * 2;
            R(cx, 6.5 - Math.cos(a) * 1, 2.2, 3, '#fbf6ea');
            P1(cx + 0.5, 7, k % 2 ? '#c9404c' : '#2b2140');
          }
          R(13, 6, 2.5, 3.5, '#fbf6ea');
          P1(13.5, 6.5, '#c9404c');
          R(16, 6.5, 2.5, 3.5, '#3a4a8a');
          R(16.3, 6.8, 2, 3, (_a, _b, o2) => (o2 && (FX + FY) % 2 === 0 ? '#5a6aaa' : o2));
          R(19.5, 6, 3.5, 4.5, '#fff4a0');
          for (let k = 0; k < 3; k++) H1(20, 22.5, 7 + k * 1.2, '#7a6a5a');
          tinyT('V?', 20, 6.2, '#c9404c');
          for (let k = 0; k < 3; k++) {
            ell(6 + k * 1.5, 11, 0.7, 0.7, '#fbf6ea');
            P1(6 + k * 1.5, 11, '#d8434b');
          }
        },
        { shadow: [['r', 2, 17, 26, 3]] },
      ),
    ),
});

/** The nurses' station: a sign-in book, a bell, a vase of gardenias, Sami's mug. */
reg('nurse-station', {
  draw: (ctx, o) => {
    const n = num(o, 'w', 3);
    const W = n * 16;
    blit(
      ctx,
      o,
      iart(
        `nurse-station|${n}`,
        W,
        24,
        () => {
          // raised ledge
          R(0, 4, W, 3, '#e8dcc4');
          H1(0, W, 4, '#fff6e6');
          R(0, 7, W, 17, '#9cc8b8');
          R(0, 7, W, 17, (_a, _b) => mixc('#b8dccc', '#7aa898', (ly() - 7) / 17));
          for (let x = 0; x < W; x += 8) V1(x, 8, 23, '#8ab8a8');
          H1(0, W, 23.5, '#5a8a7a');
          R(W / 2 - 10, 10, 20, 5, '#fbf6ea');
          tinyC('EVENING BELL', W / 2, 11, '#3a6a5a');
          // on the ledge: sign-in book with a pen on a chain, the bell, gardenias, Sami's mug
          R(3, 1.5, 9, 3, '#fbf6ea');
          V1(7.5, 1.5, 4.5, '#c8c0b8');
          for (let k = 0; k < 2; k++) H1(4, 7, 2.5 + k, '#a89cc0');
          L1(11, 3, 13, 0.5, '#3f6ab0');
          ell(17, 3, 2, 1.4, PAL.gold2);
          P1(16.5, 2.5, '#fff4c0');
          R(16.5, 1, 1, 1, PAL.gold3);
          R(W - 12, -1, 3, 5, alpha('#e8f4ff', 190));
          for (const [fx, fy] of [[W - 12.5, -2.5], [W - 10, -3], [W - 11.5, -4.5]] as [number, number][]) {
            ell(fx, fy, 1.4, 1.2, '#fffaf0');
            P1(fx, fy, '#f6e8a0');
          }
          L1(W - 11, 0, W - 12.5, -2, '#5a8a4a');
          mug(W - 6, 1, '#ff94b4');
          tinyT('S', W - 5.5, 1.5, '#fbf6ea');
        },
        { shadow: [['r', 1, 21, W, 4]] },
      ),
    );
  },
});

/** A birdcage on a stand with a canary in it. */
reg('birdcage', {
  solid: { x: -4, y: -3, w: 8, h: 2 },
  draw: (ctx, o, t) => {
    const hop = frame(t, 6, 2, phaseOf(o));
    blit(
      ctx,
      o,
      iart(
        `birdcage|${hop}`,
        14,
        32,
        () => {
          // stand
          chrome(6.5, 14, 1, 16);
          for (const s2 of [-1, 1]) L1(7, 29, 7 + s2 * 4, 31.5, '#9aa2c8');
          // cage: domed top, fine wire bars, a perch, seed cup, the canary
          ell(7, 4, 6, 4, (_a, _b, o2) => o2);
          for (let k = 0; k <= 10; k++) {
            const x = 1.5 + k * 1.1;
            const top = 4 - Math.sqrt(Math.max(0, 1 - ((x - 7) / 5.6) ** 2)) * 3.5;
            V1(x, top, 13, PAL.gold2);
          }
          for (let k = 0; k < 14; k++) P1(7 + Math.cos(Math.PI + (k / 13) * Math.PI) * 5.6, 4 + Math.sin(Math.PI + (k / 13) * Math.PI) * 3.5, PAL.gold3);
          ell(7, 0, 1, 1, PAL.gold2);
          R(1, 12.5, 12, 1.5, PAL.gold3);
          H1(2, 12, 9, '#8a5640');
          const by = hop === 3 ? 7 : 8;
          ell(6, by - 0.5, 1.6, 1.2, '#ffd84a');
          ell(7.2, by - 1.5, 0.9, 0.9, '#ffe070');
          P1(7.6, by - 1.7, AK);
          P1(8.2, by - 1.4, '#f2903a');
          P1(4.6, by, '#e8b830');
          R(9.5, 10.5, 2, 1.5, '#9cc8e0');
        },
        { shadow: [['e', 7, 31, 5, 1.2]] },
      ),
    );
  },
});

reg('wheelchair', {
  solid: { x: -6, y: -5, w: 12, h: 4 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'wheelchair',
        16,
        18,
        () => {
          // big wheels with fine spokes, a plum seat, a crocheted blanket folded over the back
          for (const wx of [3, 13]) {
            circ(wx, 11, 5, '#6e688e');
            circ(wx, 11, 4.3, 0);
            for (let k = 0; k < 8; k++) L1(wx, 11, wx + Math.cos(k * 0.785) * 4.3, 11 + Math.sin(k * 0.785) * 4.3, '#c8cce4');
            circ(wx, 11, 0.8, '#9aa2c8');
          }
          R(4, 2, 8, 6, '#6a3a7a');
          R(4, 8, 8, 3, '#7a4a8a');
          chrome(3.5, 1, 1, 10);
          chrome(11.5, 1, 1, 10);
          afghan(5, 2, 6, 4);
          for (const cx of [5, 11]) ell(cx, 16.5, 1, 1, '#2b2140');
        },
        { shadow: [['e', 8, 17, 7, 1.4]] },
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
      iart(
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
      iart(
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
      iart(
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

// ================================================================ fine detail (double density helpers)
// Every helper takes world-pixel coordinates; inside art() the buffer is 2x,
// so FX/FY (fine pixel coords) and P1() reach the half pixels.

/** Logical (world) coordinate of the fine pixel a paint callback is filling. */
const lx = () => (FX + 0.5) / ART_K;
const ly = () => (FY + 0.5) / ART_K;

/** Half-size lettering: FT glyphs in fine pixels (about 1.5 x 2.5 world px each). */
export function tinyT(s: string, x: number, y: number, c: Paint): number {
  let cx = x;
  for (const ch of s) {
    if (ch === ' ') {
      cx += 1.5;
      continue;
    }
    const g = glyph(FT, ch) as { w: number; rows: string[] } | null;
    if (!g) continue;
    g.rows.forEach((row, r) => {
      for (let i = 0; i < row.length; i++) if (row[i] === '#') P1(cx + i * 0.5, y + r * 0.5, c);
    });
    cx += (g.w + 1) * 0.5;
  }
  return cx;
}
export function tinyW(s: string): number {
  let w = 0;
  for (const ch of s) {
    if (ch === ' ') w += 1.5;
    else {
      const g = glyph(FT, ch) as { w: number } | null;
      if (g) w += (g.w + 1) * 0.5;
    }
  }
  return Math.max(0, w - 0.5);
}
export const tinyC = (s: string, cx: number, y: number, c: Paint) => tinyT(s, cx - tinyW(s) / 2, y, c);

/** A one-fine-pixel line (Bresenham on the fine grid). */
export function L1(x0: number, y0: number, x1: number, y1: number, c: Paint): void {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * ART_K * 1.5));
  for (let i = 0; i <= n; i++) P1(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, c);
}
/** Fine horizontal / vertical hairlines. */
export const H1 = (x0: number, x1: number, y: number, c: Paint) => R(x0, y, x1 - x0, 1 / ART_K, c);
export const V1 = (x: number, y0: number, y1: number, c: Paint) => R(x, y0, 1 / ART_K, y1 - y0, c);

/** Fine wood grain: wavy rings, pores and the odd knot (horizontal boards by default). */
export function fgrain(x: number, y: number, w: number, h: number, wd: Wood, seed: number, vertical = false): void {
  const knot = hash2(seed, 3, 77) < 0.6 ? [x + w * (0.2 + 0.6 * hash2(seed, 1, 78)), y + h * (0.25 + 0.5 * hash2(seed, 2, 79))] : null;
  R(x, y, w, h, () => {
    const u = vertical ? FY : FX;
    let v = vertical ? FX : FY;
    if (knot) {
      const dx = lx() - knot[0];
      const dy = ly() - knot[1];
      const d = Math.hypot(dx * (vertical ? 1.6 : 0.6), dy * (vertical ? 0.6 : 1.6));
      if (d < 1.1) return shA(wd.b, 0.32);
      if (d < 4) v += Math.round((4 - d) * 0.9 * Math.sign(vertical ? dx : dy));
    }
    const vv = v + Math.round(Math.sin(u * 0.07 + hash2(v >> 3, 1, seed) * 6.3) * 1.4);
    const t = hash2(7, vv, seed);
    const n = hash2(FX, FY, seed + 1);
    if (t < 0.16) return n < 0.7 ? shA(wd.b, 0.14) : shA(wd.b, 0.08);
    if (t > 0.86) return n < 0.6 ? liA(wd.b, 0.1) : wd.b;
    if (n < 0.025) return shA(wd.b, 0.2);
    return wd.b;
  });
}

const CHROME = ['#5e5880', '#9aa2c8', '#e4e8f8', '#ffffff', '#c8cce4', '#8a86aa', '#6e688e', '#a8b0d0'];
/** Polished chrome: a tube or band shaded across its width (vertical = shaded left to right). */
export function chrome(x: number, y: number, w: number, h: number, vertical = true): void {
  R(x, y, w, h, () => {
    const t = vertical ? (lx() - x) / w : (ly() - y) / h;
    return CHROME[Math.min(CHROME.length - 1, Math.floor(t * CHROME.length))];
  });
}

/** Channel-tufted vinyl: convex vertical channels, fine seams, a sheen near the top. */
export function vinyl(x: number, y: number, w: number, h: number, c: Color, chan = 4, horizontal = false): void {
  const top = liA(c, 0.26);
  const bot = shA(c, 0.22);
  R(x, y, w, h, () => {
    const a = horizontal ? ly() - y : lx() - x;
    const b = horizontal ? (lx() - x) / w : (ly() - y) / h;
    const k = (a % chan) / chan;
    if (k < 0.5 / chan) return shA(c, 0.38);
    const bulge = 1 - Math.abs(k - 0.5) * 2;
    let col0 = mixc(top, bot, horizontal ? Math.abs(b - 0.45) * 1.4 : b);
    col0 = mixc(col0, liA(c, 0.42), Math.max(0, bulge - 0.55) * (horizontal ? 0.9 : 1.2 - b));
    if (bulge < 0.25) col0 = shA(col0, 0.12);
    return col0;
  });
}

/** Diagonal glass reflections in fine pixels (call after painting what's behind the glass). */
export function fglare(x: number, y: number, w: number, h: number, k = 0.4): void {
  R(x, y, w, h, (_a, _b, o) => {
    if (!o) return o;
    const s = (FX + FY * 0.8) % 34;
    if (s > 4 && s < 7) return mixc(o, '#fff8e4', k);
    if (s > 9 && s < 10) return mixc(o, '#fff8e4', k * 0.6);
    return o;
  });
}

/** Soft dithered shade over what's already there (ambient occlusion, cast shade). */
export function shade(x: number, y: number, w: number, h: number, k: number, lvl = 16): void {
  R(x, y, w, h, (_a, _b, o) => (o && dth(FX, FY, lvl) ? shA(o, k) : o));
}
export function glow(x: number, y: number, w: number, h: number, c: Color, k: number, lvl = 16): void {
  R(x, y, w, h, (_a, _b, o) => (o && dth(FX, FY, lvl) ? mixc(o, c, k) : o));
}

/** A framed picture with a tiny painted scene. kind picks the subject. */
export type PicKind = 'wrestler' | 'team' | 'crowd' | 'landscape' | 'portrait' | 'belt' | 'family';
export function miniPic(x: number, y: number, w: number, h: number, seed: number, kind: PicKind): void {
  const r = rng(seed);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const skin = pick(['#f2c09a', '#e6ab84', '#c88a5e', '#9a6448', '#f6d0b0']);
  const hair = pick(['#3a2440', '#e8b860', '#6a3e2e', '#d8d0d8', '#a83a2a', '#2b2140']);
  const gear = pick(['#d8434b', '#3f6ab0', '#7a3a8a', '#e2b244', '#3f9a92', '#f2eef6']);
  if (kind === 'landscape') {
    R(x, y, w, h * 0.5, '#9cc8e8');
    R(x, y + h * 0.35, w, h * 0.2, '#fcd8a8');
    R(x, y + h * 0.5, w, h * 0.5, '#7aa860');
    ell(x + w * 0.7, y + h * 0.35, w * 0.12, w * 0.12, '#fff4c0');
    for (let i = 0; i < w; i += 0.5) P1(x + i, y + h * 0.5 - Math.abs(Math.sin(i * 0.9 + seed)) * h * 0.12, '#6a9a5e');
    return;
  }
  // backdrop: photo-studio blue, arena dark, or a faded sepia
  const bg = kind === 'family' ? '#e8d0a8' : kind === 'crowd' ? '#3a3058' : pick(['#5a7ab0', '#3a3058', '#8a5a7a', '#c8a070']);
  VG(x, y, w, h, [liA(bg, 0.15), bg, shA(bg, 0.2)]);
  if (kind === 'crowd') {
    for (let i = 0; i < w * 2; i++) P1(x + i * 0.5, y + h * 0.55 + (i % 3) * 0.5, pick(['#f6d38a', '#ff94b4', '#9ce0c8', '#fff4dc']));
    R(x, y + h * 0.72, w, h * 0.28, '#e2dcec');
    H1(x, x + w, y + h * 0.7, '#e8404e');
    return;
  }
  const figures = kind === 'team' || kind === 'family' ? (kind === 'family' ? 3 : 2) : 1;
  for (let f = 0; f < figures; f++) {
    const cx = x + (w * (f + 0.5)) / figures;
    const s = Math.min(h / 9, (w / figures) / 4.5);
    const sk = f === 0 ? skin : pick(['#f2c09a', '#e6ab84', '#c88a5e', '#9a6448']);
    const hr = f === 0 ? hair : pick(['#3a2440', '#e8b860', '#6a3e2e', '#d8d0d8']);
    const gr = f === 0 ? gear : pick(['#d8434b', '#3f6ab0', '#7a3a8a', '#e2b244', '#3f9a92']);
    // shoulders, head, hair
    ell(cx, y + h - s * 1.2, s * 2.1, s * 1.8, gr);
    ell(cx, y + h - s * 4.2, s * 1.15, s * 1.35, sk);
    ell(cx, y + h - s * 5.1, s * 1.25, s * 0.75, hr);
    P1(cx - s * 0.45, y + h - s * 4.2, AK);
    P1(cx + s * 0.35, y + h - s * 4.2, AK);
    if (kind === 'wrestler' || kind === 'team') {
      // flexing arms
      ell(cx - s * 2.2, y + h - s * 3, s * 0.7, s * 1.2, sk);
      ell(cx + s * 2.2, y + h - s * 3, s * 0.7, s * 1.2, sk);
    }
  }
  if (kind === 'belt' || kind === 'team') {
    R(x + w * 0.25, y + h * 0.62, w * 0.5, h * 0.14, '#ffd050');
    ell(x + w * 0.5, y + h * 0.69, w * 0.1, h * 0.12, '#fff0a0');
  }
}

/** A marker signature scrawled across a photo: a looping fine line. */
export function signature(x: number, y: number, w: number, seed: number, c: Color = '#2b2140'): void {
  const r = rng(seed);
  let px = x;
  let py = y + r() * 1.5;
  const n = Math.floor(w * 3);
  for (let i = 0; i < n; i++) {
    const nx = x + (w * (i + 1)) / n;
    const ny = y + Math.sin(i * 1.7 + r() * 2) * 1.1 + (i === 0 ? -1.5 : 0);
    L1(px, py, nx, ny, c);
    px = nx;
    py = ny;
  }
  L1(x + w * 0.1, y + 2, x + w * 0.9, y + 1.5, c);
}

/** A picture frame: moulding, mat, the scene, glass glare, a nail shadow. */
export function frameBox(x: number, y: number, w: number, h: number, fr: Color, seed: number, kind: PicKind, mat = true, sig = false): void {
  RR(x, y, w, h, 1, shA(fr, 0.35));
  R(x + 0.5, y + 0.5, w - 1, h - 1, fr);
  H1(x + 0.5, x + w - 0.5, y + 0.5, liA(fr, 0.45));
  V1(x + 0.5, y + 0.5, y + h - 0.5, liA(fr, 0.25));
  H1(x + 0.5, x + w - 0.5, y + h - 1, shA(fr, 0.25));
  const m = mat ? 1.5 : 1;
  if (mat) R(x + 1, y + 1, w - 2, h - 2, '#fbf3e2');
  miniPic(x + m, y + m, w - 2 * m, h - 2 * m, seed, kind);
  if (sig) signature(x + m + 0.5, y + h - m - 2.5, w - 2 * m - 1, seed + 5, hash2(seed, 0, 3) < 0.5 ? '#2b2140' : '#c8307a');
  fglare(x + m, y + m, w - 2 * m, h - 2 * m, 0.22);
  V1(x + w, y + 1, y + h + 0.5, SH(70));
  H1(x + 1, x + w + 0.5, y + h, SH(70));
}

/** Tiny potted succulent / sprig, 4 px wide. */
export function sprig(x: number, y: number): void {
  R(x, y + 2, 3, 2, '#d27a52');
  H1(x, x + 3, y + 2, '#f0a078');
  P1(x + 1, y + 1.5, '#6f9a5a');
  P1(x + 1.5, y + 1, '#8ab868');
  P1(x + 0.5, y + 1, '#5e8a5a');
  P1(x + 2, y + 1.5, '#8ab868');
  P1(x + 1.5, y + 0.5, '#9ac870');
}

/** A diner mug (2.5 x 3) with an optional chip in the rim. */
export function mug(x: number, y: number, c: Color = '#fbf6ea', chip = false): void {
  R(x, y, 2.5, 3, c);
  V1(x, y, y + 3, liA(c, 0.4));
  V1(x + 2, y, y + 3, shA(c, 0.18));
  H1(x, x + 2.5, y, shA(c, 0.3));
  P1(x + 2.5, y + 1, c);
  P1(x + 3, y + 1.5, c);
  P1(x + 2.5, y + 2, c);
  if (chip) P1(x + 1, y, '#a89cc0');
}

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
  // diner stool, 10 x 12 at (x, y): tufted vinyl cap with piping, chrome skirt, pedestal and foot ring
  ell(x + 5, y + 2.6, 5, 2.6, shA(seat, 0.28));
  ell(x + 5, y + 2.1, 4.6, 2.1, seat);
  ell(x + 4.2, y + 1.5, 2.6, 1, liA(seat, 0.35));
  ell(x + 3.8, y + 1.2, 1.2, 0.5, liA(seat, 0.6));
  P1(x + 5, y + 2, shA(seat, 0.45));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    P1(x + 5 + Math.cos(a) * 2.6, y + 2.1 + Math.sin(a) * 1.1, shA(seat, 0.25));
  }
  chrome(x + 0.5, y + 3.2, 9, 1.8);
  H1(x + 0.5, x + 9.5, y + 4.8, '#6e688e');
  chrome(x + 4, y + 5, 2, 5);
  ell(x + 5, y + 7.6, 3.2, 0.8, '#9aa2c8');
  H1(x + 2.2, x + 7.8, y + 7.4, '#f2eef6');
  ell(x + 5, y + 10.6, 3.6, 1.3, '#6e688e');
  ell(x + 5, y + 10.3, 3.2, 1, '#c8cce4');
  H1(x + 3, x + 6, y + 9.7, '#ffffff');
}
function counterItem(k: number, x: number, y: number, style: CounterStyle): void {
  // y = the counter-top surface baseline
  const pick = Math.floor(k * 5);
  if (style === 'diner' || style === 'tile') {
    if (pick === 0) {
      // a slice of pie on a plate, fork resting, under a little glass dome
      ell(x, y - 0.8, 4, 1.3, '#e4e8f8');
      ell(x, y - 1.1, 3.2, 0.9, '#fbf6ea');
      poly([[x - 2, y - 1.5], [x + 2, y - 2.5], [x + 1.5, y - 0.8]], '#e8b060');
      H1(x - 2, x + 2, y - 2.6, '#c87830');
      P1(x - 1, y - 2, '#a8343e');
      L1(x + 2.5, y - 1, x + 3.5, y - 1.5, '#c8cce4');
      ell(x, y - 3.5, 3.8, 3.4, (_a, _b, o) => (o ? mixc(o, '#e8f4ff', 0.28) : alpha('#e8f4ff', 70)));
      L1(x - 2.5, y - 4, x - 1.5, y - 6, '#ffffff');
      R(x - 0.5, y - 7.5, 1, 1, '#c8cce4');
    } else if (pick === 1) {
      // chrome napkin dispenser + glass sugar pourer
      chrome(x - 3.5, y - 4, 4, 4);
      R(x - 3, y - 5, 3, 1.2, '#ffffff');
      H1(x - 3, x, y - 5, '#e8e0d8');
      R(x + 1.5, y - 4, 2.5, 4, alpha('#e8f4ff', 190));
      R(x + 1.5, y - 2.5, 2.5, 2.5, '#fbf6ea');
      chrome(x + 1.5, y - 5, 2.5, 1);
      P1(x + 3.5, y - 5.5, '#9aa2c8');
    } else if (pick === 2) {
      // coffee on a saucer, still steaming
      ell(x, y - 0.6, 3, 1, '#e8e0d4');
      mug(x - 1.5, y - 3.5, '#fbf6ea');
      P1(x - 0.5, y - 3.5, '#6a3a2a');
      P1(x, y - 3.5, '#8a5a3a');
      for (let k = 0; k < 4; k++) P1(x - 0.5 + Math.sin(k * 1.4) * 0.6, y - 4.5 - k * 0.8, alpha('#ffffff', 170 - k * 35));
    } else if (pick === 3) {
      // ketchup + mustard squeeze bottles
      R(x - 2.5, y - 5, 2, 5, '#d8434b');
      V1(x - 2.5, y - 5, y, '#f08080');
      poly([[x - 2.5, y - 5], [x - 0.5, y - 5], [x - 1.25, y - 7]], '#f6f0f4');
      R(x + 0.5, y - 5, 2, 5, '#ffd050');
      V1(x + 0.5, y - 5, y, '#fff0a0');
      poly([[x + 0.5, y - 5], [x + 2.5, y - 5], [x + 1.5, y - 7]], '#c88a2a');
    } else {
      // a folded menu tent: CHILI FRIDAY
      poly([[x - 3, y], [x + 3, y], [x + 2, y - 5], [x - 2, y - 5]], '#fbf6ea');
      H1(x - 2, x + 2, y - 5, '#ffffff');
      R(x - 2, y - 4, 4, 1, '#c9404c');
      H1(x - 1.5, x + 1.5, y - 2.5, '#a89cc0');
      H1(x - 1.5, x + 1, y - 1.5, '#a89cc0');
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
      iart(
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
            // boomerang laminate in fine pixels: little tan boomerangs, mint and pink flecks
            R(0, y0 + 1, W, 6, (_x, _y, c) => {
              const h = hash2(FX, FY, 141);
              if (h < 0.014) return '#7fcfb6';
              if (h > 0.986) return '#f29ab4';
              const bx = ((FX % 14) + 14) % 14;
              const by = ((FY + Math.floor(FX / 14) * 5) % 9 + 9) % 9;
              if ((bx === by + 2 && by < 4) || (bx === 9 - by && by < 4 && by > 0)) return mixc(c!, '#d8c4a0', 0.55);
              return c;
            });
          else if (style === 'wood') grain(0, y0 + 1, W, 6, { ...OAK, b: top }, 142);
          chrome(0, y0 + 7, W, 2, false);
          const fy = y0 + 9;
          // front face
          if (style === 'diner') {
            // cherry band, mint enamel panels with fine bevels and rivets, chrome strips, kick plate
            R(0, fy, W, 2, '#d0484f');
            H1(0, W, fy, '#f08a84');
            H1(0, W, fy + 1.5, '#a8343e');
            R(0, fy + 2, W, 6, '#a9d8bf');
            for (let px = 0; px < W; px += 16) {
              R(px + 0.5, fy + 2.5, 15, 5, (_a, _b) => mixc('#bfe6cf', '#93c8ad', (ly() - fy - 2.5) / 5));
              H1(px + 0.5, px + 15.5, fy + 2.5, '#e6f8ea');
              V1(px + 0.5, fy + 2.5, fy + 7.5, '#d6f2df');
              V1(px + 15, fy + 2.5, fy + 7.5, '#6e9e92');
              H1(px + 0.5, px + 15.5, fy + 7.5, '#7fae9e');
              for (const rx of [px + 1.5, px + 14]) for (const ry of [fy + 3.5, fy + 6.5]) P1(rx, ry, '#f2eef6');
              // scuffs where knees and shoes have met the panel for forty years
              for (let k = 0; k < 3; k++) if (hash2(px, k, 147) < 0.5) H1(px + 3 + k * 4, px + 4.5 + k * 4, fy + 6.5 + (k % 2) * 0.5, '#7fae9e');
            }
            chrome(0, fy + 8, W, 1, false);
            R(0, fy + 9, W, 2, '#c9404c');
            H1(0, W, fy + 9, '#e8706a');
            H1(0, W, fy + 10.5, '#8e2c4c');
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
  // Not solid: regulars sit on these (their sit spot is the stool's own tile).
  draw: (ctx, o) => blit(ctx, o, iart('stool', 10, 12, () => stoolArt(0, 0, '#d8434b'), { shadow: [['e', 6, 11, 4, 1.5]] })),
});

reg('booth', {
  solid: { x: -16, y: -15, w: 32, h: 14 },
  draw: (ctx, o) => {
    const teal = o.props.variant === 'teal' || o.props.variant === 1;
    blit(
      ctx,
      o,
      iart(
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
      iart(
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
      iart('cash-register', 12, 12, () => {
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

// ---------------------------------------------------------------- the Hot Tag, piece by piece

const STEEL = { l: '#f2eef6', b: '#c8cce0', s: '#9a9ec0', d: '#6e688e' };

/** Stainless worktop with brushed fine streaks. */
function steelTop(x: number, y: number, w: number, h: number): void {
  R(x, y, w, h, () => {
    const n = hash2(FX >> 2, FY, 211);
    return n < 0.3 ? STEEL.b : n < 0.75 ? mixc(STEEL.b, STEEL.l, 0.4) : STEEL.l;
  });
  H1(x, x + w, y, '#ffffff');
  H1(x, x + w, y + h - 0.5, STEEL.s);
}

/** Things on the back bar, one 16-px slot each. y = worktop surface. */
function backBarSlot(k: number, x: number, y: number): void {
  switch (k) {
    case 0: {
      // twin coffee urns: chrome drums, black spigots, red "ready" lights
      for (const ux of [x + 1, x + 8.5]) {
        chrome(ux, y - 13, 6.5, 12);
        RR(ux - 0.5, y - 14.5, 7.5, 2, 1, '#9aa2c8');
        H1(ux, ux + 6.5, y - 14.5, '#ffffff');
        R(ux + 2.5, y - 16, 1.5, 1.5, AK);
        R(ux + 2.5, y - 4, 1.5, 2, AK);
        P1(ux + 3, y - 2, '#6a4030');
        P1(ux + 1, y - 10, '#ff5a50');
        P1(ux + 1, y - 9.5, '#ffb0a0');
        R(ux + 1, y - 7.5, 4.5, 2, '#fbf6ea');
        tinyT('HOT', ux + 1.5, y - 7.3, '#c9404c');
      }
      break;
    }
    case 1: {
      // mint milkshake mixer with a steel cup, and a stack of glasses
      RR(x + 2, y - 13, 6, 4, 2, '#9ce0c8');
      R(x + 4, y - 9, 2, 7, '#9ce0c8');
      V1(x + 4, y - 9, y - 2, '#d4f6e8');
      RR(x + 1.5, y - 2.5, 7, 2.5, 1, '#7fd0b8');
      H1(x + 2, x + 8, y - 2.5, '#c8f4e4');
      chrome(x + 3, y - 8.5, 4, 5.5);
      P1(x + 7, y - 11.5, '#ff5a50');
      for (let i = 0; i < 3; i++) {
        R(x + 10 + i * 0.5, y - 3 - i * 3, 4, 3, alpha('#e8f4ff', 150));
        H1(x + 10 + i * 0.5, x + 14 + i * 0.5, y - 3 - i * 3, '#ffffff');
      }
      break;
    }
    case 2: {
      // cake stand under a glass dome: June's peach cobbler, one slice gone
      ell(x + 8, y - 1, 6, 1.4, '#e4e8f8');
      R(x + 7, y - 3, 2, 2, '#c8cce4');
      ell(x + 8, y - 3.5, 5.5, 1.5, '#f2eef6');
      ell(x + 8, y - 5, 4.5, 2, '#e8a050');
      ell(x + 8, y - 5.6, 4, 1.4, '#f2c070');
      for (let i = 0; i < 6; i++) P1(x + 5 + i, y - 5.5 + (i % 2) * 0.5, '#c87830');
      poly([[x + 8, y - 5.5], [x + 12.5, y - 6], [x + 12, y - 4]], '#d8c8b8');
      ell(x + 8, y - 7, 6, 6, (_a, _b, o) => (o ? mixc(o, '#e8f4ff', 0.3) : alpha('#e8f4ff', 70)));
      L1(x + 4, y - 9, x + 5, y - 11.5, '#ffffff');
      R(x + 7.5, y - 14, 1, 1.5, '#c8cce4');
      break;
    }
    case 3: {
      // mug tree: the regulars' mugs, each a different colour; a tray of clean cups
      R(x + 7.5, y - 15, 1, 15, '#8a5640');
      ell(x + 8, y - 0.5, 4, 1, '#6e3f38');
      const cs = ['#d8434b', '#3f9a92', '#ffd050', '#fbf6ea', '#7a5aa8', '#5a7ab8'];
      for (let i = 0; i < 6; i++) {
        const side = i % 2 ? 1 : -1;
        const my = y - 13 + Math.floor(i / 2) * 4;
        L1(x + 8, my + 1, x + 8 + side * 2, my, '#6e3f38');
        mug(x + (side > 0 ? 10 : 3.5), my, cs[i]);
      }
      break;
    }
    case 4: {
      // stacked plates, a squeeze-bottle caddy, the toaster that burns everything
      for (let i = 0; i < 5; i++) {
        ell(x + 4, y - 1 - i * 1.2, 3.5, 1, i % 2 ? '#f2eef6' : '#fbf6ea');
        H1(x + 1, x + 7, y - 1.5 - i * 1.2, '#d8dcf0');
      }
      RR(x + 8.5, y - 6, 7, 6, 2, '#d8dcf0');
      chrome(x + 9, y - 5.5, 6, 5);
      R(x + 10, y - 7, 1.5, 1, AK);
      R(x + 13, y - 7, 1.5, 1, AK);
      R(x + 15, y - 4, 1, 1.5, AK);
      P1(x + 10.5, y - 7.5, '#6a3a2a');
      break;
    }
    case 5: {
      // candy jars and a tip jar with a hand-lettered label
      for (const [jx, c] of [[x + 1, '#ff94b4'], [x + 5.5, '#ffd050']] as [number, Color][]) {
        R(jx, y - 6, 4, 6, alpha('#e8f4ff', 160));
        R(jx + 0.5, y - 4, 3, 3.5, c);
        for (let i = 0; i < 6; i++) P1(jx + 0.5 + (i % 3), y - 3.5 + Math.floor(i / 3), i % 2 ? liA(c, 0.4) : shA(c, 0.2));
        R(jx - 0.5, y - 7, 5, 1.5, '#d8434b');
        V1(jx + 0.5, y - 6, y - 0.5, '#ffffff');
      }
      R(x + 10.5, y - 7, 4.5, 7, alpha('#e8f4ff', 150));
      R(x + 11, y - 3, 3.5, 2.5, '#8ab868');
      R(x + 10.5, y - 5.5, 4.5, 2, '#fbf6ea');
      tinyT('TIPS', x + 10.5, y - 5.3, '#c9404c');
      break;
    }
    default: {
      // a little black-and-white TV with the wrestling on, rabbit ears up
      RR(x + 2, y - 10, 11, 10, 1, '#4e4870');
      R(x + 3, y - 9, 7, 6.5, '#2a2440');
      R(x + 3.5, y - 8.5, 6, 5.5, '#c8d0d8');
      R(x + 3.5, y - 5, 6, 2, '#e8e8ec');
      H1(x + 3.5, x + 9.5, y - 5.5, '#8a8a98');
      P1(x + 5, y - 6.5, '#4a4a58');
      P1(x + 7.5, y - 7, '#6a6a78');
      fglare(x + 3.5, y - 8.5, 6, 5.5, 0.3);
      P1(x + 11, y - 8, '#c8cce4');
      P1(x + 11, y - 6, '#c8cce4');
      L1(x + 6, y - 10, x + 3, y - 15, '#c8cce4');
      L1(x + 8, y - 10, x + 12, y - 14, '#c8cce4');
    }
  }
}

reg('back-bar', {
  // Stands against the back wall: anchor sits on the floor line, art rises up the wall.
  draw: (ctx, o) => {
    const n = num(o, 'w', 6);
    const W = n * 16;
    const order = String(o.props.items ?? '0123456');
    const shelf = o.props.shelf !== false;
    blit(
      ctx,
      o,
      iart(
        `back-bar|${n}|${order}|${shelf ? 1 : 0}`,
        W,
        34,
        () => {
          const wd = WALNUT;
          // wall shelf on two brackets, lined with the good syrup and a radio
          if (shelf) {
          R(1, 6, W - 2, 2, wd.l);
          fgrain(1, 6, W - 2, 2, { ...wd, b: wd.l }, 301);
          H1(1, W - 1, 6, liA(wd.l, 0.4));
          H1(1, W - 1, 8, SH(90));
          for (const bx of [4, W - 6]) {
            poly([[bx, 8], [bx + 2, 8], [bx + 2, 12]], wd.s);
          }
          for (let x = 3; x < W - 4; x += 3) {
            const k = hash2(x, 1, 302);
            if (k < 0.35) {
              R(x, 2.5, 2, 3.5, ['#a83a2a', '#c88a2a', '#5a8a3a'][Math.floor(k * 9) % 3]);
              R(x + 0.5, 1.5, 1, 1, '#fbf6ea');
              V1(x, 2.5, 6, '#ffffff');
            } else if (k < 0.55) {
              R(x - 0.5, 2, 3, 4, '#fbf6ea');
              R(x - 0.5, 3, 3, 1.5, ['#d8434b', '#3f6ab0'][Math.floor(k * 10) % 2]);
            } else if (k < 0.62 && x < W - 10) {
              RR(x, 2, 6, 4, 1, '#c88a5a');
              R(x + 0.5, 3, 3, 2, '#e8d8b0');
              P1(x + 4.5, 3.5, AK);
              x += 4;
            }
          }
          }
          // worktop and lower cabinets
          const ty = 20;
          steelTop(0, ty, W, 3);
          R(0, ty + 3, W, 11, wd.b);
          fgrain(0, ty + 3, W, 11, wd, 303, true);
          for (let x = 1; x + 14 <= W; x += 16) {
            R(x + 1, ty + 4.5, 13, 7, shA(wd.b, 0.06));
            H1(x + 1, x + 14, ty + 4.5, wd.s);
            V1(x + 1, ty + 4.5, ty + 11.5, wd.s);
            H1(x + 1, x + 14, ty + 11, liA(wd.b, 0.25));
            V1(x + 13.5, ty + 4.5, ty + 11.5, liA(wd.b, 0.2));
            R(x + 6.5, ty + 6, 2, 1, PAL.gold2);
            P1(x + 6.5, ty + 6, '#fff4c0');
          }
          chrome(0, ty + 12.5, W, 1.5, false);
          // the things on top, one per slot
          for (let i = 0; i < n; i++) backBarSlot(Number(order[i % order.length]), i * 16, ty);
          // contact shade under the shelf and where the bar meets the wall
          shade(0, ty - 1, W, 1, 0.12, 8);
        },
        { outline: false },
      ),
    );
  },
});

reg('pass-window', {
  lights: (o) => [light(o, 0, -10, 34, '#ff9a5a')],
  draw: (ctx, o, t) => {
    const f = frame(t, 4, 4, phaseOf(o));
    blit(
      ctx,
      o,
      iart(
        `pass-window|${f}`,
        34,
        26,
        () => {
          // stainless frame set into the wall
          R(0, 2, 34, 22, STEEL.s);
          R(1, 3, 32, 20, STEEL.b);
          H1(1, 33, 3, '#ffffff');
          // the kitchen beyond: warm and busy
          VG(3, 5, 28, 13, ['#6a3a3a', '#8a4a3a', '#a85a3a']);
          R(3, 5, 28, 2, '#4a2a34');
          // tiled back wall and a hanging ladle rail
          R(3, 7, 28, 6, (_a, _b, o2) => ((FX % 6 === 0 || FY % 6 === 0) && o2 ? shA(o2, 0.12) : o2));
          H1(4, 30, 7.5, '#c8cce4');
          for (const hx of [7, 10, 13]) {
            V1(hx, 7.5, 10, '#9aa2c8');
            ell(hx, 10.5, 1, 0.8, '#c8cce4');
          }
          // flat-top flare and steam
          R(18, 12, 12, 4, '#2a2440');
          glow(18, 10, 12, 3, '#ffb060', 0.35, 8 + f * 2);
          for (let i = 0; i < 3; i++) {
            const sx = 20 + i * 4 + (f + i) % 2;
            for (let k = 0; k < 4; k++) P1(sx + Math.sin(k + f + i) * 0.7, 10 - k * 1.2 - (f % 2) * 0.5, alpha('#fff4e8', 140 - k * 30));
          }
          // heat lamps: red glow over the ledge
          R(4, 13, 26, 1.5, '#3a2440');
          for (const lx0 of [8, 20]) {
            RR(lx0, 13, 6, 2, 1, '#c9404c');
            H1(lx0 + 1, lx0 + 5, 15, '#ffb0a0');
          }
          glow(3, 15, 28, 4, '#ff7a50', 0.3, 10);
          // the ledge: two plates up, a ticket rail, the bell
          steelTop(1, 18, 32, 3);
          ell(10, 18, 4, 1.4, '#fbf6ea');
          ell(10, 17.5, 2.5, 0.9, '#e8b060');
          P1(9, 17, '#5a8a3a');
          P1(11, 17.5, '#d8434b');
          ell(21, 18, 4, 1.4, '#fbf6ea');
          ell(21, 17.4, 2.8, 1, '#c87850');
          P1(20, 17, '#f6d38a');
          ell(29, 17.5, 1.8, 1.4, PAL.gold2);
          P1(28.5, 16.8, '#fff4c0');
          P1(29, 15.8, PAL.gold3);
          // order tickets clipped to the rail, one fluttering
          H1(2, 32, 4, '#9aa2c8');
          for (let i = 0; i < 6; i++) {
            const tx = 4 + i * 4.5;
            const fl = i === 3 && f % 2 ? 0.5 : 0;
            R(tx, 4.5, 3, 4 + fl, '#fbf6ea');
            H1(tx + 0.5, tx + 2.5, 5.5, '#a89cc0');
            H1(tx + 0.5, tx + 2, 6.5, '#a89cc0');
            if (i % 2) H1(tx + 0.5, tx + 2, 7.5, '#c9404c');
            P1(tx + 1.5, 4, '#6e688e');
          }
          fglare(3, 5, 28, 13, 0.08);
          // ORDER UP plate on the frame
          R(11, 0, 12, 3, '#c9404c');
          H1(11, 23, 0, '#e8706a');
          tinyC('ORDER UP', 17, 0.4, '#fff4dc');
          V1(34, 3, 24, SH(70));
          H1(1, 34, 24, SH(80));
        },
        { outline: false },
      ),
    );
  },
});

const MENU_LINES = [
  ['COFFEE', '.50'],
  ['PIE', '1.25'],
  ['PILEDRIVER', '3.99'],
  ['FRI CHILI', '1.50'],
];
reg('menu-board', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'menu-board',
        40,
        17,
        () => {
          const wd = OAK;
          R(0, 0, 40, 17, wd.s);
          R(0.5, 0.5, 39, 16, wd.b);
          fgrain(0.5, 0.5, 39, 16, wd, 311);
          // black felt letterboard with its fine grooves
          R(2, 3.5, 36, 12, '#2a2638');
          R(2, 3.5, 36, 12, (_a, _b, o2) => (FY % 2 === 0 && o2 ? '#332e44' : o2));
          R(2, 0.5, 36, 2.5, '#c9404c');
          H1(2, 38, 0.5, '#e8706a');
          tinyC('THE HOT TAG', 20, 0.8, '#fff4dc');
          MENU_LINES.forEach(([a, b], i) => {
            const yy = 4.5 + i * 3;
            tinyT(a, 3.5, yy, '#f2eef6');
            tinyT(b, 36.5 - tinyW(b), yy, '#ffd050');
            for (let x = 4 + tinyW(a) + 0.5; x < 35.5 - tinyW(b); x += 1) P1(x, yy + 2, '#6e688e');
          });
          // a letter fell crooked; someone tucked a polaroid in the corner
          P1(30, 11, '#f2eef6');
          R(34, 11, 4, 5, '#fbf6ea');
          R(34.5, 11.5, 3, 2.5, '#9cc8e0');
          ell(36, 13, 0.8, 0.8, '#e6ab84');
          V1(40, 1, 17, SH(70));
          H1(1, 40, 17, SH(80));
        },
        { outline: false },
      ),
    ),
});

/** Signed 8x10s hung salon-style; each variant tells a different room's story. */
const PHOTO_WALLS: [number, number, number, number, PicKind][][] = [
  // 0: the diner's wall of fame, all signed to June
  [[0, 3, 9, 11, 'wrestler'], [10, 0, 11, 9, 'team'], [10, 10, 7, 8, 'wrestler'], [22, 2, 8, 10, 'belt'], [18, 13, 9, 7, 'crowd'], [31, 0, 9, 12, 'wrestler'], [28, 13, 10, 8, 'team']],
  // 1: arena legends
  [[0, 0, 10, 13, 'wrestler'], [11, 2, 12, 9, 'crowd'], [24, 0, 9, 12, 'belt'], [11, 12, 9, 9, 'team'], [21, 13, 11, 8, 'wrestler'], [34, 3, 7, 10, 'wrestler']],
  // 2: the VFW honor wall (portraits)
  [[0, 2, 8, 10, 'portrait'], [9, 0, 8, 10, 'portrait'], [18, 2, 8, 10, 'portrait'], [27, 0, 8, 10, 'portrait'], [4, 13, 10, 8, 'landscape'], [16, 12, 12, 9, 'family'], [30, 12, 8, 9, 'portrait']],
  // 3: a family's hallway
  [[0, 1, 10, 8, 'family'], [11, 0, 7, 9, 'portrait'], [19, 2, 9, 7, 'landscape'], [3, 10, 8, 10, 'portrait'], [13, 11, 11, 9, 'family'], [26, 10, 8, 10, 'wrestler']],
];
const FRAME_COLS: Color[] = [PAL.gold2, '#2b2140', '#8a5640', '#f6f0e6', '#c9404c', '#5a3a4a', PAL.gold3];
reg('photo-wall', {
  draw: (ctx, o) => {
    const v = variant(o, PHOTO_WALLS.length);
    blit(
      ctx,
      o,
      iart(
        `photo-wall|${v}`,
        42,
        22,
        () => {
          PHOTO_WALLS[v].forEach(([x, y, w, h, kind], i) => {
            const fr = FRAME_COLS[(i * 3 + v) % FRAME_COLS.length];
            frameBox(x, y, w, h, fr, 400 + v * 31 + i * 7, kind, i % 3 !== 1, v < 2);
          });
        },
        { outline: false },
      ),
    );
  },
});

/** Neon tubing: glyphs traced in a bright core with a soft halo. */
reg('neon', {
  lights: (o) => [light(o, 0, -8, 40, String(o.props.color ?? '#ff5d8f'))],
  draw: (ctx, o, t) => {
    const text = String(o.props.sign ?? 'OPEN').toUpperCase();
    const c = String(o.props.color ?? '#ff5d8f');
    // a buzzing flicker every few seconds
    const fl = Math.sin(t * 1.3 + phaseOf(o)) > 0.97 ? 1 : 0;
    const w = TW(text, FT, { bold: true }) + 8;
    blit(
      ctx,
      o,
      iart(
        `neon|${text}|${c}|${fl}`,
        w,
        13,
        () => {
          // backing rail + mounting standoffs
          R(1, 11.5, w - 2, 1, '#4e4870');
          for (let x = 3; x < w - 2; x += 8) P1(x, 11, '#9aa2c8');
          T(text, 4, 3, fl ? shA(c, 0.5) : liA(c, 0.3), FT, { bold: true });
          if (!fl) {
            // hot white core where the tube is brightest, then a fine halo around every tube
            R(4, 3, w - 8, 6, (_a, _b, o2) => (o2 && (FX + FY) % 3 === 0 ? '#fff6fa' : o2));
            const lit: [number, number][] = [];
            for (let fy = 0; fy < 26; fy++) for (let fx = 0; fx < w * 2; fx++) if (GP(fx / 2, fy / 2) >>> 24 === 255 && fy < 20) lit.push([fx, fy]);
            const halo = new Set<number>();
            for (const [fx, fy] of lit) for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (dx * dx + dy * dy <= 5) halo.add((fy + dy) * 1000 + fx + dx);
            for (const k of halo) {
              const fx = k % 1000;
              const fy = Math.floor(k / 1000);
              if (fx < 0 || fy < 0 || GP(fx / 2, fy / 2)) continue;
              P1(fx / 2, fy / 2, alpha(c, 90));
            }
          }
        },
        { outline: false },
      ),
    );
  },
});

reg('pendant', {
  // Hangs from the ceiling: the anchor is the floor spot beneath it (where the
  // light pools); the shade floats 30 px up, above everyone's heads.
  above: true,
  lights: (o) => [light(o, 0, -6, 46, String(o.props.color ?? '#ffd890'))],
  draw: (ctx, o) => {
    const v = variant(o, 3);
    blit(
      ctx,
      o,
      iart(
        `pendant|${v}`,
        14,
        64,
        () => {
          const shadeC = [PAL.red2, PAL.teal2, '#2f6a52'][v];
          V1(7, 0, 22, '#4e4870');
          V1(7.5, 0, 22, '#7a7498');
          R(6, 21, 2, 2, '#c8cce4');
          // enamel dome, white lining, a glowing bulb
          poly([[3.5, 23], [10.5, 23], [14, 30], [0, 30]], shadeC);
          ell(7, 23.5, 3.5, 1.4, shadeC);
          H1(4, 10, 23, liA(shadeC, 0.55));
          R(1, 25, 3, 4, (_a, _b, o2) => (o2 ? liA(o2, 0.3) : o2));
          R(10, 25, 4, 5, (_a, _b, o2) => (o2 ? shA(o2, 0.2) : o2));
          H1(0, 14, 29.5, shA(shadeC, 0.35));
        },
        {
          outline: false,
          over: () => {
            ell(7, 30.5, 5.5, 1.3, '#fff6dc');
            ell(7, 30.7, 2.6, 0.8, '#ffffff');
            R(1, 31.5, 12, 2.5, () => (dth(FX, FY, 4) ? alpha('#fff0c0', 110) : null));
          },
        },
      ),
    );
  },
});

const BOOTH_COLS: Record<string, Color> = { red: '#cf3f4c', teal: '#3f9a92', mint: '#6cbca0', gold: '#d8a040' };
/**
 * A booth bench seen from the aisle: the back of the bench faces you, and the
 * regulars sitting on it (facing the table to the north) show their heads and
 * shoulders over the padded top roll.
 */
reg('booth-seat', {
  draw: (ctx, o) => {
    const n = num(o, 'w', 2);
    const W = n * 16;
    const cname = String(o.props.variant ?? 'red');
    const c = BOOTH_COLS[cname] ?? BOOTH_COLS.red;
    const worn = o.props.worn === true;
    blit(
      ctx,
      o,
      iart(
        `booth-seat|${n}|${cname}|${worn ? 1 : 0}`,
        W,
        28,
        () => {
          const wd = WALNUT;
          // padded top roll, channel-tufted, catching the pendant light
          RR(0, 0, W, 6, 2, c);
          vinyl(0.5, 0.5, W - 1, 5, c, 4);
          H1(1.5, W - 1.5, 0.5, liA(c, 0.55));
          H1(0.5, W - 0.5, 5.5, shA(c, 0.45));
          for (let x = 2; x < W - 1; x += 4) P1(x, 3, shA(c, 0.5));
          // the bench's wooden back: raised panels, scuffed where shoes kick it
          R(0.5, 6, W - 1, 18, wd.b);
          fgrain(0.5, 6, W - 1, 18, wd, 321 + n, true);
          for (let x = 2; x + 12 <= W; x += 16) {
            const pw = Math.min(12, W - x - 2);
            R(x, 8, pw, 12, shA(wd.b, 0.06));
            H1(x, x + pw, 8, wd.s);
            V1(x, 8, 20, wd.s);
            H1(x, x + pw, 19.5, liA(wd.b, 0.25));
            V1(x + pw - 0.5, 8, 20, liA(wd.b, 0.2));
          }
          shade(0.5, 6, W - 1, 1.5, 0.25, 12);
          // chrome kick strip and the floor rail
          chrome(0, 23.5, W, 1.5, false);
          R(0.5, 25, W - 1, 3, shA(wd.b, 0.3));
          for (let x = 3; x < W - 3; x += 2.5) if (hash2(x * 2, 0, 322) < 0.4) H1(x, x + 1, 26, shA(wd.b, 0.45));
          // end caps
          R(0, 6, 1, 19, wd.d);
          R(W - 1, 6, 1, 19, wd.d);
          if (worn) {
            // a split in the top roll, mended with red tape; somebody's initials scratched in
            const tx = W - 10;
            R(tx, 1, 4.5, 2, '#e8706a');
            H1(tx, tx + 4.5, 1, '#ffb0a0');
            tinyT('LV', 4, 14, shA(wd.b, 0.4));
          }
        },
        { shadow: [['r', 1, 25, W, 4]] },
      ),
    );
  },
});

reg('booth-table', {
  draw: (ctx, o) => {
    const n = num(o, 'w', 2);
    const W = n * 16 - 4;
    const seed = Math.floor(o.x * 3 + o.y * 7);
    blit(
      ctx,
      o,
      iart(
        `booth-table|${n}|${seed % 5}`,
        W,
        18,
        () => {
          // pedestal on a chrome foot
          chrome(W / 2 - 1.5, 11, 3, 6);
          ell(W / 2, 17, 4, 1, '#9aa2c8');
          // boomerang laminate top with a chrome edge band
          R(0, 3, W, 8, '#f6ecd8');
          R(0, 3, W, 8, (_a, _b, o2) => {
            const h = hash2(FX, FY, 331);
            if (h < 0.012) return '#5ec0a8';
            if (h > 0.988) return '#ff94b4';
            const b = (FX * 3 + FY * 5) % 37;
            return b === 0 || b === 1 ? mixc(o2!, '#e8d8bc', 0.7) : o2;
          });
          H1(0, W, 3, '#fffaf0');
          chrome(0, 10, W, 2, false);
          // what's on it changes table to table
          const k = seed % 5;
          chrome(W / 2 - 1.5, 1, 3, 3.5);
          R(W / 2 - 1, 0, 2, 1, '#ffffff');
          R(W / 2 + 2, 1.5, 1, 3, '#d8434b');
          P1(W / 2 + 2.25, 1, '#f6f0f4');
          R(W / 2 + 3.5, 1.5, 1, 3, '#ffd050');
          if (k !== 2) {
            ell(5, 7, 2.5, 1.2, '#e8e0d4');
            mug(3.5, 4.5, '#fbf6ea', k === 0);
            P1(4.5, 5, '#6a3a2a');
          }
          if (k === 1 || k === 3) {
            ell(W - 6, 7, 3.5, 1.6, '#fbf6ea');
            poly([[W - 8, 6.5], [W - 4.5, 7.5], [W - 8, 8]], '#e8b060');
            P1(W - 8, 6.5, '#a8343e');
          }
          if (k === 2 || k === 4) {
            R(W - 9, 4.5, 6, 4, '#fbf6ea');
            H1(W - 8.5, W - 3.5, 5.5, '#a89cc0');
            H1(W - 8.5, W - 4.5, 6.5, '#a89cc0');
            signature(W - 8.5, 6.5, 4, seed, '#3f6ab0');
          }
        },
        { shadow: [['r', 1, 14, W, 4]] },
      ),
    );
  },
});

/**
 * The back booth: a wraparound corner banquette, the table they carved their
 * initials into in 1981, and the napkins every storyline starts on.
 */
reg('back-booth', {
  label: () => 'Sit',
  hit: { x: -26, y: -24, w: 44, h: 26 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'back-booth',
        60,
        38,
        () => {
          const c = '#cf3f4c';
          const wd = WALNUT;
          // tall booth back in profile on the right (her side), seat facing left
          R(50, 0, 8, 38, wd.b);
          fgrain(50, 0, 8, 38, wd, 341, true);
          H1(50, 58, 0, liA(wd.l, 0.3));
          vinyl(46, 2, 5, 26, c, 3, true);
          V1(46, 2, 28, liA(c, 0.4));
          // her seat: deep cushion, worn shiny where forty years of Birdie sat
          R(38, 22, 13, 7, liA(c, 0.15));
          vinyl(38, 22, 13, 7, c, 7, true);
          ell(44, 24.5, 3.5, 1.2, liA(c, 0.5));
          chrome(38, 29, 13, 1.5, false);
          R(38, 30.5, 13, 7, shA(wd.b, 0.15));
          fgrain(38, 30.5, 13, 7, wd, 342, true);
          // the far bench on the left, lower, for whoever's being pitched to
          R(0, 14, 7, 24, wd.b);
          fgrain(0, 14, 7, 24, wd, 343, true);
          vinyl(4, 15, 4, 14, c, 3, true);
          R(4, 25, 9, 5, liA(c, 0.12));
          vinyl(4, 25, 9, 5, c, 5, true);
          chrome(4, 30, 9, 1.2, false);
          R(4, 31.2, 9, 6.8, shA(wd.b, 0.15));
          // the table: walnut, initials carved into the near edge
          R(23, 26, 2.5, 11, wd.s);
          V1(23, 26, 37, wd.b);
          ell(24, 37, 5, 1, wd.d);
          R(12, 15, 25, 10, wd.l);
          fgrain(12, 15, 25, 10, { ...wd, b: wd.l }, 344);
          H1(12, 37, 15, liA(wd.l, 0.35));
          R(12, 25, 25, 2, wd.b);
          H1(12, 37, 26.5, wd.d);
          tinyT('BM DD JO SL', 13.5, 21.5, shA(wd.l, 0.45));
          // red checkered cloth runner, napkins scrawled with plans, two coffees, the sugar
          R(14, 16, 10, 4, (_a, _b) => ((Math.floor(lx() - 14) + Math.floor(ly() - 16)) % 2 ? '#c9404c' : '#fff4ec'));
          for (const [nx, ny, rot] of [[27, 16, 0], [30, 18, 1]] as [number, number, number][]) {
            R(nx, ny, 5, 4, '#fbf6ea');
            H1(nx, nx + 5, ny + 4, '#d8cdc4');
            L1(nx + 0.5, ny + 1, nx + 4, ny + 1 + rot * 0.5, '#3f6ab0');
            L1(nx + 1, ny + 2, nx + 2.5, ny + 3, '#3f6ab0');
            L1(nx + 2.5, ny + 3, nx + 4, ny + 2, '#3f6ab0');
          }
          mug(17, 13.5, '#fbf6ea', true);
          P1(18, 14, '#6a3a2a');
          mug(33, 13, '#d8434b');
          P1(34, 13.5, '#6a3a2a');
          R(25, 11.5, 2, 3.5, alpha('#e8f4ff', 200));
          R(25, 13, 2, 2, '#fbf6ea');
          R(24.5, 11, 3, 1, '#c8cce4');
          // a little brass RESERVED tent that June never takes down
          poly([[19, 19], [23, 19], [22, 16], [20, 16]], PAL.gold2);
          H1(20, 22, 16, '#fff0a0');
          // shadow under the table
          shade(12, 27, 25, 2, 0.2, 10);
        },
        { shadow: [['r', 2, 30, 58, 8]] },
      ),
    ),
});

/** Flat floor mats: kitchen anti-fatigue rubber, gym mats, entry runners. Size in tiles (w, h). */
reg('floor-mat', {
  // Drawn each frame under everything (not baked into the 1x ground) so its fine pixels survive.
  sortY: -4096,
  draw: (ctx, o) => {
    const W = num(o, 'w', 3) * 16;
    const H = Math.max(6, Number(o.props.h ?? 1) * 16);
    const v = variant(o, 3);
    blit(
      ctx,
      o,
      iart(
        `floor-mat|${v}|${W}x${H}`,
        W,
        H,
        () => {
          if (v === 0) {
            // dark teal rubber with a honeycomb of drain holes and bevelled edges
            RR(0, 0, W, H, 2, '#2f4a52');
            R(1, 1, W - 2, H - 2, (_a, _b) => {
              const cx = ((FX % 6) + 6) % 6;
              const cy = ((FY + (Math.floor(FX / 6) % 2) * 3) % 6 + 6) % 6;
              if (cx >= 2 && cx <= 3 && cy >= 2 && cy <= 3) return '#1e3038';
              if (cx === 1 && cy === 1) return '#4a6a70';
              return '#365a62';
            });
            H1(1, W - 1, 0.5, '#5a8088');
            H1(1, W - 1, H - 1, '#1e3038');
          } else if (v === 1) {
            // a blue gym mat with stitched seams
            R(0, 0, W, H, '#3f6ab0');
            R(0, 0, W, H, (_a, _b) => mixc('#5a84c8', '#3a5ea0', (ly() / H) * 0.8 + hash2(FX >> 1, FY >> 1, 5) * 0.2));
            for (let x = 16; x < W; x += 16) V1(x, 0, H, '#2f4e88');
            for (let x = 0; x < W; x += 1.5) P1(x, 1, '#8aa8e0');
            H1(0, W, H - 0.5, '#2a4478');
          } else {
            // a woven entry runner, frayed at the ends
            R(0, 0, W, H, '#8a5a3e');
            R(0.5, 0.5, W - 1, H - 1, (_a, _b) => ((FX + FY * 2) % 4 < 2 ? '#c89058' : '#b07a4a'));
            for (let x = 0; x < W; x += 1) {
              P1(x, 0, '#d8a466');
              P1(x + 0.5, H - 0.5, '#d8a466');
            }
          }
        },
        { outline: false },
      ),
    );
  },
});

reg('coat-rack', {
  solid: { x: -4, y: -3, w: 8, h: 2 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'coat-rack',
        16,
        32,
        () => {
          const wd = WALNUT;
          // turned post on a tripod foot
          R(7, 3, 2, 26, wd.b);
          V1(7, 3, 29, wd.l);
          V1(8.5, 3, 29, wd.s);
          ell(8, 2.5, 1.6, 1.4, wd.l);
          for (const [dx, dy] of [[-4, 2], [4, 2], [0, 1]] as [number, number][]) L1(8, 28, 8 + dx, 29 + dy, wd.s);
          // pegs
          for (const s of [-1, 1]) L1(8, 5, 8 + s * 4, 4, wd.l);
          // Birdie's loud plaid jacket (everyone hates it; she knows)
          poly([[5, 5], [11, 5], [12.5, 17], [3.5, 17]], '#d8a040');
          R(3.5, 5, 9, 12, (_a, _b, o2) => {
            if (!o2) return o2;
            const X = Math.floor(lx() * 2);
            const Y = Math.floor(ly() * 2);
            if (X % 6 === 0 || Y % 6 === 0) return '#c9404c';
            if ((X + 3) % 6 === 0 || (Y + 3) % 6 === 0) return '#2f6a52';
            return o2;
          });
          poly([[7, 5], [9, 5], [8, 9]], '#fbf6ea');
          V1(8, 9, 17, shA('#d8a040', 0.4));
          // a cowboy hat on the other peg, and an umbrella leaning on the foot
          ell(12, 4, 3.5, 1, '#8a5238');
          RR(10, 1, 4, 3, 1, '#a8603e');
          H1(10, 14, 3, '#c8962a');
          L1(2, 30, 4, 18, '#3f6ab0');
          poly([[3, 18], [5.5, 18], [5, 25], [3.5, 25]], '#3f6ab0');
          P1(4, 17.5, '#9aa2c8');
        },
        { shadow: [['e', 8, 30, 5, 1.6]] },
      ),
    ),
});

reg('gumball', {
  solid: { x: -4, y: -3, w: 8, h: 2 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'gumball',
        10,
        22,
        () => {
          // red cast stand, glass globe of gumballs, chrome crank
          poly([[3, 12], [7, 12], [8, 21], [2, 21]], PAL.red2);
          V1(3.5, 12, 21, '#e8706a');
          ell(5, 21, 3.5, 1, PAL.red3);
          RR(2, 9, 6, 4, 1, PAL.red2);
          chrome(3.5, 10, 3, 2);
          ell(5, 5, 4.5, 4.5, alpha('#e8f4ff', 200));
          const cs = ['#ff5d8f', '#ffd050', '#5ec0a8', '#5a7ab8', '#fbf6ea', '#e2844a'];
          for (let i = 0; i < 26; i++) {
            const a = hash2(i, 1, 351) * Math.PI * 2;
            const r0 = Math.sqrt(hash2(i, 2, 351)) * 3.4;
            const gx = 5 + Math.cos(a) * r0;
            const gy = 5.8 + Math.sin(a) * r0 * 0.8;
            if (gy < 3) continue;
            P1(gx, gy, cs[i % cs.length]);
            P1(gx + 0.5, gy, cs[i % cs.length]);
            P1(gx, gy + 0.5, shA(cs[i % cs.length], 0.2));
          }
          L1(2.5, 3, 3.5, 1.8, '#ffffff');
          RR(3, 0, 4, 1.5, 1, PAL.red2);
          R(4, 15, 2, 1.5, '#2a2440');
          tinyC('1C', 5, 17, '#fff4dc');
        },
        { shadow: [['e', 5, 21, 4, 1.2]] },
      ),
    ),
});

reg('payphone', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'payphone',
        18,
        26,
        () => {
          // scribbles on the wall around it: numbers, a heart, a tally
          tinyT('JUNE 555 0187', 0, 0, '#5a4a6a');
          L1(1, 4, 3, 5, '#3f6ab0');
          L1(3, 5, 5, 3.5, '#3f6ab0');
          for (let i = 0; i < 5; i++) V1(13 + i * 0.75, 3, 5.5, '#a83a2a');
          L1(12.5, 5, 16.5, 3.5, '#a83a2a');
          // the steel box
          RR(3, 6, 12, 18, 1, STEEL.d);
          chrome(3.5, 6.5, 11, 17);
          R(5, 9, 8, 6, '#3a3450');
          for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) R(5.5 + k * 2.5, 9.5 + r * 1.4, 1.6, 0.9, '#e4e8f8');
          R(6, 16.5, 6, 2.5, '#fbf6ea');
          tinyC('LOCAL 25C', 9, 16.8, '#c9404c');
          R(12, 19.5, 1.5, 1.5, AK);
          P1(12.5, 7.5, AK);
          R(6.5, 21, 5, 1.5, '#4e4870');
          // handset on the hook, coiled cord swinging down
          RR(1, 7, 3, 12, 1, '#2b2140');
          V1(1.5, 8, 18, '#5a4a6a');
          for (let i = 0; i < 7; i++) {
            const cy = 19 + i * 0.9;
            P1(2 + Math.sin(i * 1.6) * 0.8, cy, '#2b2140');
            P1(2.5 + Math.sin(i * 1.6) * 0.8, cy + 0.4, '#5a4a6a');
          }
          V1(18, 7, 24, SH(70));
          H1(4, 18, 24, SH(80));
        },
        { outline: false },
      ),
    ),
});

reg('fan-case', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'fan-case',
        20,
        15,
        () => {
          // a shadow box: black velvet, Madame Midnight's rhinestone fan spread open
          R(0, 0, 20, 15, '#2b2140');
          R(1, 1, 18, 13, '#3a2850');
          for (let k = 0; k < 13; k++) {
            const a = Math.PI * (1.05 + (k / 12) * 0.9);
            const x1 = 10 + Math.cos(a) * 8;
            const y1 = 12 + Math.sin(a) * 9;
            L1(10, 12, x1, y1, k % 2 ? '#1e1830' : '#4a3a5a');
            P1(x1, y1, k % 3 ? '#fff4fc' : '#ff94b4');
            P1(10 + Math.cos(a) * 6, 12 + Math.sin(a) * 6.8, '#d8dcf0');
          }
          for (let k = 0; k < 9; k++) {
            const a = Math.PI * (1.08 + (k / 8) * 0.84);
            P1(10 + Math.cos(a) * 4, 12 + Math.sin(a) * 4.5, '#ffffff');
          }
          ell(10, 12, 1, 1, PAL.gold2);
          R(5, 13, 10, 1.5, PAL.gold2);
          tinyC('MME MIDNIGHT', 10, 13, '#5a3a2a');
          fglare(1, 1, 18, 12, 0.18);
          V1(20, 1, 15, SH(70));
          H1(1, 20, 15, SH(80));
        },
        { outline: false },
      ),
    ),
});

reg('wall-clock', {
  lights: (o) => (o.props.neon ? [light(o, 0, -6, 26, '#5ff2d6')] : []),
  draw: (ctx, o, t) => {
    const neon = o.props.neon === true;
    // hands follow the real game clock is overkill; a slow sweep reads as alive
    const m = Math.floor(t / 4) % 12;
    blit(
      ctx,
      o,
      iart(
        `wall-clock|${neon ? 1 : 0}|${m}`,
        14,
        14,
        () => {
          ell(7, 7, 7, 7, neon ? '#2b2140' : '#c8cce4');
          ell(7, 7, 6, 6, neon ? '#5ff2d6' : '#9aa2c8');
          ell(7, 7, 5.3, 5.3, '#fbf6ea');
          for (let k = 0; k < 12; k++) {
            const a = (k / 12) * Math.PI * 2;
            P1(7 + Math.cos(a) * 4.5, 7 + Math.sin(a) * 4.5, k % 3 ? '#a89cc0' : '#2b2140');
          }
          const am = (m / 12) * Math.PI * 2 - Math.PI / 2;
          L1(7, 7, 7 + Math.cos(am) * 4, 7 + Math.sin(am) * 4, '#2b2140');
          L1(7, 7, 7 + Math.cos(-1.1) * 2.8, 7 + Math.sin(-1.1) * 2.8, '#2b2140');
          P1(7, 7, '#c9404c');
          if (neon) tinyC('HOT TAG', 7, 9, '#c9404c');
          fglare(2, 2, 10, 10, 0.2);
        },
        { outline: false },
      ),
    );
  },
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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

// ---------------------------------------------------------------- Birdie's office and other working rooms

/** Birdie's desk: napkins with whole storylines on them, ticket rolls, the bank's final notice. */
reg('promoter-desk', {
  label: () => 'Look',
  lights: (o) => [light(o, 14, -22, 30, '#ffe0a0')],
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'promoter-desk',
        42,
        26,
        () => {
          const wd = WALNUT;
          // the top: walnut with a leather blotter, buried
          R(0, 6, 42, 8, wd.l);
          fgrain(0, 6, 42, 8, { ...wd, b: wd.l }, 441);
          H1(0, 42, 6, liA(wd.l, 0.4));
          R(9, 7, 18, 6, '#3f6a4a');
          H1(9, 27, 7, '#5f8a6a');
          // napkins scrawled with storylines: arrows, names, a circled "TITLE?"
          const nap: [number, number][] = [[10, 6.5], [15, 8], [20, 6], [12, 10]];
          nap.forEach(([nx, ny], i) => {
            R(nx, ny, 6, 5, '#fbf6ea');
            H1(nx, nx + 6, ny + 5, '#d8cdc4');
            L1(nx + 0.5, ny + 1.5, nx + 3, ny + 1.5, '#3f6ab0');
            L1(nx + 3, ny + 1.5, nx + 5, ny + 3, '#3f6ab0');
            P1(nx + 4.5, ny + 3.5, '#3f6ab0');
            if (i === 2) ell(nx + 3, ny + 3.2, 2.2, 1.2, (_a, _b, o2) => o2);
            if (i % 2) L1(nx + 1, ny + 3.5, nx + 3, ny + 3.5, '#c9404c');
          });
          // ticket rolls: red and blue, one unspooled across the desk
          for (const [tx, c] of [[30, '#d8434b'], [34, '#3f6ab0']] as [number, Color][]) {
            ell(tx, 6.5, 2, 2, c);
            ell(tx, 6.5, 0.8, 0.8, '#fbf6ea');
            P1(tx - 0.5, 5.5, liA(c, 0.4));
          }
          for (let x = 30; x > 22; x -= 1.5) R(x - 1.5, 9 + Math.sin(x) * 0.5, 1.4, 1.6, '#d8434b');
          // the bank letter with a red stamp
          R(28, 9.5, 6, 4, '#fbf6ea');
          R(29, 10.5, 3, 1.5, alpha('#c9404c', 200));
          // rotary phone, mug, a dish of peppermints
          RR(1, 3, 8, 3.5, 1, '#2b2140');
          RR(1.5, 6, 7, 3.5, 1, '#3a3050');
          circ(5, 7.8, 1.3, '#d8dcf0');
          for (let k = 0; k < 8; k++) P1(5 + Math.cos(k * 0.8) * 0.9, 7.8 + Math.sin(k * 0.8) * 0.9, '#3a3050');
          mug(36.5, 9, '#fbf6ea', true);
          P1(37.5, 9.5, '#6a3a2a');
          ell(4, 12, 2.5, 1, '#e4e8f8');
          for (let k = 0; k < 4; k++) {
            P1(2.8 + k * 0.8, 11.6, k % 2 ? '#d8434b' : '#fbf6ea');
            P1(3 + k * 0.8, 12, '#fbf6ea');
          }
          // green banker's lamp
          R(37.5, 0.5, 1, 5, PAL.gold3);
          poly([[33.5, 1], [41.5, 1], [42, 3.5], [33, 3.5]], '#2f6a52');
          H1(34, 41, 1, '#5fa882');
          ell(38, 6, 2.5, 0.8, PAL.gold3);
          // front: drawers (the bottom left one sticks: it's ajar) and a brass nameplate
          R(0, 14, 42, 10, wd.b);
          fgrain(0, 14, 42, 10, wd, 442, true);
          H1(0, 42, 14, wd.s);
          for (const dx0 of [1, 32]) {
            for (const dy0 of [15, 19.5]) {
              R(dx0, dy0, 9, 4, shA(wd.b, 0.06));
              H1(dx0, dx0 + 9, dy0, liA(wd.b, 0.2));
              H1(dx0, dx0 + 9, dy0 + 3.5, shA(wd.b, 0.35));
              R(dx0 + 3.5, dy0 + 1.5, 2, 0.8, PAL.gold2);
            }
          }
          R(1, 23, 9, 1, shA(wd.b, 0.5));
          R(1.5, 22.5, 8, 0.6, '#fbf6ea');
          R(12, 15.5, 18, 7, shA(wd.b, 0.15));
          R(11.5, 16.5, 19, 3.5, PAL.gold2);
          H1(11.5, 30.5, 16.5, '#fff0a0');
          H1(11.5, 30.5, 19.5, PAL.gold3);
          tinyC('B. MALONE', 21, 17.2, '#5a3a2a');
          R(0, 24, 42, 2, wd.d);
        },
        {
          shadow: [['r', 2, 22, 42, 5]],
          over: () => {
            ell(38, 4.2, 3.5, 0.8, '#fff6dc');
            R(34, 5, 8, 4, () => (dth(FX, FY, 3) ? alpha('#fff0c0', 90) : null));
          },
        },
      ),
    ),
});

/** A window with venetian blinds half-open, slatted daylight. */
reg('window-blinds', {
  lights: (o) => [light(o, 0, -6, 34, '#fff4d8')],
  draw: (ctx, o) => {
    const v = variant(o, 2);
    blit(
      ctx,
      o,
      iart(
        `window-blinds|${v}`,
        24,
        22,
        () => {
          // painted frame, sky and a brick wall across the alley (or the city, high up)
          R(0, 0, 24, 20, '#fbf0d9');
          H1(0, 24, 0, '#ffffff');
          V1(23.5, 0, 20, '#d6c2a4');
          if (v === 0) {
            VG(2, 2, 20, 16, ['#a8d4ec', '#d8ecf4', '#f6e2c0']);
            R(2, 10, 20, 8, '#b85a4a');
            R(2, 10, 20, 8, (_a, _b, o2) => (o2 && (FY % 4 === 0 || (FX + (Math.floor(FY / 4) % 2) * 4) % 8 === 0) ? '#d8a890' : o2));
            R(14, 6, 1, 4, '#4e4870');
            H1(8, 22, 6, '#4e4870');
          } else {
            VG(2, 2, 20, 16, ['#5a7ab8', '#8aa8d8', '#e8c0a8']);
            for (let k = 0; k < 7; k++) {
              const bh = 4 + hash2(k, 1, 451) * 9;
              R(2 + k * 3, 18 - bh, 2.5, bh, '#3a3a5a');
              for (let w = 0; w < bh - 1; w += 1.5) if (hash2(k, w * 2, 452) < 0.4) P1(2.5 + k * 3 + (w % 2), 18 - bh + 1 + w, '#ffe08a');
            }
          }
          fglare(2, 2, 20, 16, 0.25);
          // the blinds: fine slats, lower half drawn, cords dangling
          for (let y = 2; y < 11; y += 1) {
            H1(2, 22, y, '#f2eee4');
            H1(2, 22, y + 0.5, '#c8c0b0');
          }
          R(1.5, 1, 21, 1.5, '#e8e0d0');
          V1(5, 11, 16, '#c8c0b0');
          P1(5, 16, '#a89878');
          V1(19, 11, 14, '#c8c0b0');
          // sill with a dusty plant
          R(0, 18, 24, 2, '#fff4e0');
          H1(0, 24, 20, '#cdb898');
          sprig(17, 14.5);
          V1(24, 1, 21, SH(70));
          H1(1, 24, 21, SH(70));
        },
        { outline: false },
      ),
    );
  },
});

reg('safe', {
  solid: { x: -7, y: -6, w: 14, h: 5 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'safe',
        16,
        20,
        () => {
          // a squat iron safe on casters, gold pinstripes, a dial nobody remembers
          RR(0, 0, 16, 18, 2, '#3a4250');
          R(0.5, 0.5, 15, 17, (_a, _b) => mixc('#56607a', '#2e3442', (ly() / 17) * 0.7 + (lx() / 15) * 0.3));
          H1(1, 15, 0.5, '#8a96b0');
          R(2, 2, 12, 13, (_a, _b, o2) => o2);
          for (const [x0, y0, w, h] of [[2, 2, 12, 13]] as [number, number, number, number][]) {
            H1(x0, x0 + w, y0, PAL.gold2);
            H1(x0, x0 + w, y0 + h, PAL.gold3);
            V1(x0, y0, y0 + h, PAL.gold2);
            V1(x0 + w, y0, y0 + h, PAL.gold3);
          }
          tinyC('ACW', 8, 3.5, PAL.gold2);
          circ(8, 9.5, 2.5, '#c8cce4');
          circ(8, 9.5, 1.8, '#2b2140');
          for (let k = 0; k < 12; k++) P1(8 + Math.cos(k / 1.9) * 2.2, 9.5 + Math.sin(k / 1.9) * 2.2, '#9aa2c8');
          P1(8, 8, '#ffffff');
          chrome(11.5, 11.5, 1, 3);
          for (const cx of [2, 14]) ell(cx, 18.6, 1.3, 1.3, '#2b2140');
        },
        { shadow: [['e', 8, 19, 7, 1.5]] },
      ),
    ),
});

/** A stack of cardboard boxes (props.label). */
reg('box-stack', {
  solid: { x: -9, y: -6, w: 18, h: 5 },
  draw: (ctx, o) => {
    const label = String(o.props.label ?? 'FLYERS').toUpperCase();
    blit(
      ctx,
      o,
      iart(
        `box-stack|${label}`,
        20,
        22,
        () => {
          const box = (x: number, y: number, w: number, h: number, c: Color, lab: string) => {
            R(x, y, w, h, c);
            R(x, y, w, 2, liA(c, 0.25));
            H1(x, x + w, y, liA(c, 0.45));
            V1(x + w / 2, y, y + 2, shA(c, 0.3));
            R(x + w / 2 - 1, y + 2, 2, h - 2, alpha('#e8d8a8', 180));
            V1(x + w - 0.5, y, y + h, shA(c, 0.25));
            if (lab) tinyC(lab, x + w / 2, y + h / 2, '#3a2c3a');
          };
          box(1, 10, 18, 12, '#c8a070', label);
          box(3, 2, 13, 9, '#b89060', '');
          // a flyer escaping the top box
          poly([[9, 1], [15, 0], [16, 4], [10, 5]], '#ffd050');
          L1(11, 2, 14, 1.5, '#c9404c');
          L1(11, 3, 14.5, 2.5, '#3a3478');
        },
        { shadow: [['r', 1, 19, 20, 4]] },
      ),
    );
  },
});

reg('cot', {
  solid: { x: -15, y: -9, w: 30, h: 8 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'cot',
        32,
        16,
        () => {
          // army cot where Birdie sleeps after the late shows; a crocheted blanket, one sneaker
          for (const lx0 of [2, 29]) {
            L1(lx0, 8, lx0 - 1, 15, '#5a6a4a');
            L1(lx0, 8, lx0 + 1, 15, '#4a5a3a');
          }
          R(0, 4, 32, 6, '#6a7a52');
          R(0.5, 4.5, 31, 5, (_a, _b) => mixc('#8a9a6a', '#5a6a42', (ly() - 4.5) / 5));
          RR(1, 2, 8, 4, 1, '#fbf6ea');
          H1(2, 8, 2, '#ffffff');
          afghan(10, 3, 20, 6);
          R(0, 9.5, 32, 1, '#4a5a3a');
          ell(24, 14.5, 2.5, 1.2, '#fbf6ea');
          H1(22, 26, 14, '#d8434b');
        },
        { shadow: [['r', 1, 12, 32, 4]] },
      ),
    ),
});

reg('fishing-gear', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'fishing-gear',
        14,
        30,
        () => {
          // rod leaning on the wall, line wound, a red-and-white bobber; tackle box and bucket
          L1(9, 29, 13, 0, '#8a5640');
          L1(9.5, 29, 13.5, 0, '#c08a5a');
          ell(10, 22, 1.4, 1.4, '#9aa2c8');
          L1(13, 0.5, 12, 8, alpha('#e8f4ff', 200));
          ell(12, 9, 1, 1, '#d8434b');
          P1(12, 9.5, '#fbf6ea');
          R(0, 22, 9, 6, '#2f6a52');
          H1(0, 9, 22, '#5fa882');
          R(3.5, 21, 2, 1, '#9aa2c8');
          R(0, 24.5, 9, 0.5, '#1e4a3a');
          R(7, 24, 6, 6, '#9aa2c8');
          chrome(7, 24, 6, 6);
          L1(7, 24, 10, 21, '#6e688e');
          L1(10, 21, 13, 24, '#6e688e');
        },
        { shadow: [['e', 7, 29, 6, 1.5]] },
      ),
    ),
});

// ---------------------------------------------------------------- MaxxMedia, floor 31

/** Floor-to-ceiling glass onto the city at midnight; a MaxxMedia billboard glows on a tower. */
reg('skyline-window', {
  lights: (o) => [light(o, 0, -10, 60, '#a8c0ff')],
  draw: (ctx, o, t) => {
    const n = num(o, 'w', 10);
    const W = n * 16;
    const blink = frame(t, 2, 0.5, phaseOf(o));
    blit(
      ctx,
      o,
      iart(
        `skyline-window|${n}|${blink}`,
        W,
        44,
        () => {
          // night sky with a faint orange city glow at the horizon
          VG(0, 0, W, 44, ['#1e1a3a', '#2a2a5a', '#5a3a6a', '#c8705a']);
          for (let k = 0; k < W / 3; k++) P1(hash2(k, 1, 561) * W, hash2(k, 2, 561) * 14, alpha('#fff8e8', 160));
          // far towers, then near towers, windows lit at random
          for (const [layer, col0, min, max] of [[0, '#3a3a68', 14, 28], [1, '#2a2850', 20, 40]] as [number, Color, number, number][]) {
            let x = -2;
            let k = 0;
            while (x < W) {
              const bw = 6 + hash2(k, layer, 562) * 10;
              const bh = min + hash2(k, layer + 5, 562) * (max - min);
              R(x, 44 - bh, bw, bh, col0);
              if (hash2(k, layer, 563) < 0.3) R(x + bw / 2 - 0.5, 44 - bh - 4, 1, 4, col0);
              for (let wy = 44 - bh + 2; wy < 43; wy += 2) for (let wx = x + 1; wx < x + bw - 1; wx += 1.5) if (hash2(Math.floor(wx * 2), Math.floor(wy * 2), 564 + layer) < (layer ? 0.28 : 0.18)) P1(wx, wy, layer ? '#ffe8a8' : '#c8b88a');
              x += bw + (layer ? 1 : 2);
              k++;
            }
          }
          // the MaxxMedia billboard: a giant red M on a tower, and a red aircraft light blinking
          const bx = W * 0.62;
          R(bx, 10, 22, 10, '#2b2140');
          R(bx + 0.5, 10.5, 21, 9, '#d8203a');
          tinyC('MAXXMEDIA', bx + 11, 12.8, '#fff4f0');
          for (let x = bx + 1; x < bx + 21; x += 2) P1(x, 19.5, '#ffb0b0');
          if (blink) ell(W * 0.2, 7, 0.8, 0.8, '#ff3a3a');
          // mullions every two tiles, a reflection of the office lights in the glass
          for (let x = 0; x <= W; x += 32) chrome(Math.min(W - 1.5, x), 0, 1.5, 44);
          chrome(0, 0, W, 1.5, false);
          R(0, 30, W, 1, alpha('#c8d0f0', 80));
          fglare(0, 0, W, 44, 0.12);
        },
        { outline: false },
      ),
    );
  },
});

const CLIP_COLS = ['#d8434b', '#3f6ab0', '#ffd050', '#5ec0a8'];
/** A cubicle: fabric partition, a monitor full of nine-second clips, the detritus of crunch. */
reg('cubicle', {
  draw: (ctx, o, t) => {
    const empty = o.props.empty === true;
    const mine = o.props.mine === true;
    const f = frame(t, 4, 2, phaseOf(o));
    blit(
      ctx,
      o,
      iart(
        `cubicle|${empty ? 'e' : mine ? 'm' : 'w'}|${f}`,
        40,
        34,
        () => {
          // grey-blue fabric partition with an aluminium cap
          R(0, 0, 40, 16, '#6a7090');
          R(0.5, 1, 39, 15, (_a, _b) => (hash2(FX, FY, 571) < 0.18 ? '#5e6484' : '#6a7090'));
          chrome(0, 0, 40, 1.2, false);
          // pinned to it: sticky notes, a printout, and (on yours) a Polaroid of the Velvet Hammers
          const notes: Color[] = ['#fff4a0', '#ffc8d8', '#c8f0d8'];
          for (let k = 0; k < 3; k++) {
            R(3 + k * 5, 3 + (k % 2), 4, 4, notes[k]);
            H1(3.5 + k * 5, 6.5 + k * 5, 4.5 + (k % 2), '#a89cc0');
          }
          R(28, 2, 7, 9, '#fbf6ea');
          for (let k = 0; k < 4; k++) H1(29, 34, 4 + k * 1.6, '#a8a0b8');
          tinyT('KPI', 29, 2.2, '#d8203a');
          if (mine) {
            R(19, 3, 5, 6, '#fffaf0');
            R(19.5, 3.5, 4, 3.5, '#e8c8a0');
            ell(20.6, 5, 0.6, 0.6, '#6a4a3a');
            ell(22.4, 5, 0.6, 0.6, '#c89a5a');
          }
          // the desk: white laminate, monitor on an arm, keyboard, cold coffee
          R(0, 16, 40, 4, '#e8eaf2');
          H1(0, 40, 16, '#ffffff');
          R(0, 20, 40, 1.2, '#9aa2c8');
          for (const lx0 of [1, 37.5]) R(lx0, 21, 1.5, 13, '#c8cce0');
          if (!empty) {
            RR(12, 4, 16, 11, 1, '#2b2140');
            R(13, 5, 14, 9, '#1e2a48');
            // a clip on a loop: two wrestlers, a scrub bar, a view counter climbing
            R(13, 10, 14, 4, '#e2dcec');
            H1(13, 27, 9.5, '#e8404e');
            R(15 + f, 6.5 + (f === 2 ? 1 : 0), 2, 3, CLIP_COLS[0]);
            R(22 - f, 6.5, 2, 3, CLIP_COLS[1]);
            R(13, 13, 14, 1, '#2b2140');
            R(13, 13, 3 + f * 3, 1, '#ff3a5a');
            tinyT(`${9 - f}S`, 13.5, 5.2, '#fff4f0');
            fglare(13, 5, 14, 9, 0.15);
            R(19, 15, 2, 1.5, '#4e4870');
            R(14, 17, 12, 2, '#3a3450');
            for (let x = 14.5; x < 25.5; x += 1) P1(x, 17.5, '#6e688e');
            mug(30, 16, '#fbf6ea');
            P1(31, 16.5, '#6a3a2a');
            // energy drink cans in a pyramid
            for (const [cx, cy] of [[4, 17], [6, 17], [5, 14.5]] as [number, number][]) {
              R(cx, cy, 1.6, 2.5, '#5fd0a8');
              R(cx, cy, 1.6, 0.5, '#c8cce4');
            }
          } else {
            // abandoned: a cardboard box, a dead plant, the monitor dark
            RR(12, 4, 16, 11, 1, '#2b2140');
            R(13, 5, 14, 9, '#1a1830');
            fglare(13, 5, 14, 9, 0.12);
            R(28, 13, 8, 6, '#c8a070');
            H1(28, 36, 13, '#e8c090');
            R(3, 15, 3, 2, '#d27a52');
            L1(4.5, 15, 3.5, 12, '#8a7a4a');
            L1(4.5, 15, 6, 12.5, '#8a7a4a');
          }
          // the office chair in front, pushed back
          RR(15, 22, 10, 6, 2, '#3a3450');
          R(16, 23, 8, 4, '#4e4870');
          R(19.5, 28, 1, 3, '#9aa2c8');
          H1(15, 25, 31, '#6e688e');
          for (const cx of [15.5, 20, 24.5]) P1(cx, 31.5, AK);
        },
        { shadow: [['r', 1, 30, 40, 4]] },
      ),
    );
  },
});

/** The big wall screen: tonight's numbers, a line that only goes up. */
reg('stats-screen', {
  lights: (o) => [light(o, 0, -10, 40, '#7ab0ff')],
  draw: (ctx, o, t) => {
    const f = frame(t, 4, 1, phaseOf(o));
    blit(
      ctx,
      o,
      iart(
        `stats-screen|${f}`,
        34,
        22,
        () => {
          RR(0, 0, 34, 22, 1, '#2b2140');
          R(1, 1, 32, 20, '#141a34');
          tinyT('VIEWS', 2, 2, '#7ab0ff');
          tinyT(`12,00${4 + f},33${f}`, 2, 5, '#fff4f0');
          // bar chart and a line chart
          for (let k = 0; k < 7; k++) {
            const bh = 2 + ((k * 7 + f * 3) % 9);
            R(3 + k * 2.5, 19 - bh, 1.8, bh, k === 6 ? '#ff3a5a' : '#3f6ab0');
          }
          let py = 18;
          for (let x = 21; x < 32; x += 1) {
            const ny = 18 - (x - 21) * 0.9 - Math.sin(x + f) * 0.8;
            L1(x - 1, py, x, ny, '#5fd0a8');
            py = ny;
          }
          tinyT('+9S', 23, 2, '#ff3a5a');
          fglare(1, 1, 32, 20, 0.08);
        },
        { outline: false },
      ),
    );
  },
});

reg('beanbag', {
  draw: (ctx, o) => {
    const v = variant(o, 3);
    blit(
      ctx,
      o,
      iart(
        `beanbag|${v}`,
        16,
        12,
        () => {
          const c = ['#d8203a', '#3f6ab0', '#5ec0a8'][v];
          ell(8, 7, 7.5, 5, shA(c, 0.25));
          ell(8, 6.5, 7, 4.5, c);
          ell(6, 4.5, 3.5, 2, liA(c, 0.3));
          L1(4, 6, 9, 9, shA(c, 0.35));
          L1(11, 4, 12, 9, shA(c, 0.3));
          tinyC('M', 9, 6.5, '#fbf6ea');
        },
        { shadow: [['e', 8, 11, 7, 1.5]] },
      ),
    );
  },
});

reg('trophy-case', {
  solid: { x: -16, y: -10, w: 32, h: 9 },
  draw: (ctx, o) => {
    const half = o.props.halfBelt === true || o.id === 'trophies';
    blit(
      ctx,
      o,
      iart(
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

// ---------------------------------------------------------------- the locker room

/** One 12 x 30 steel locker door with a masking-tape name strip, in fine detail. */
function lockerDoor(x: number, base: Color, k: number, name: string, old = false): void {
  const lc = liA(base, 0.22);
  const dc = shA(base, 0.25);
  R(x, 0, 12, 30, base);
  R(x + 0.5, 0.5, 11, 29, (_a, _b) => {
    // baked enamel: a soft vertical sheen, fine orange-peel speckle
    const t = (lx() - x) / 12;
    let c = mixc(lc, dc, Math.min(1, Math.abs(t - 0.3) * 1.6));
    const h = hash2(FX, FY, 233 + Math.floor(k * 100));
    if (h < 0.05) c = shA(c, 0.08);
    else if (h > 0.97) c = liA(c, 0.12);
    return c;
  });
  V1(x, 0, 30, liA(base, 0.35));
  V1(x + 11.5, 0, 30, shA(base, 0.4));
  H1(x, x + 12, 0, liA(base, 0.45));
  // louvred vents top and bottom
  for (const vy of [2.5, 4, 5.5, 23, 24.5]) {
    H1(x + 3, x + 9, vy, shA(base, 0.5));
    H1(x + 3, x + 9, vy + 0.5, liA(base, 0.3));
  }
  // latch handle and a number plate
  chrome(x + 9, 13, 1.5, 5);
  R(x + 4.5, 13.5, 3, 2, '#d8dcf0');
  tinyC(String(10 + Math.floor(k * 89)), x + 6, 13.6, '#4e4870');
  R(x, 27, 12, 3, shA(base, 0.45));
  H1(x, x + 12, 27, shA(base, 0.25));
  // lived-in touches
  if (k < 0.15) {
    // a band sticker and a strip of athletic tape
    RR(x + 2, 17, 5, 4, 1, '#ffd050');
    P1(x + 3.5, 18.5, '#d8434b');
    R(x + 6, 19, 4, 1, '#fbf6ea');
  } else if (k > 0.85) {
    // a towel hung through the vent
    R(x + 2, 4, 4, 9, '#fbf6ea');
    H1(x + 2, x + 6, 10, '#d8434b');
    V1(x + 5.5, 4, 13, '#d8d0c8');
  } else if (k > 0.6 && k < 0.7) {
    // a dent from somebody's bad night
    ell(x + 6.5, 20, 1.6, 1.2, dc);
    L1(x + 5.5, 19, x + 7, 21, lc);
  } else if (k > 0.35 && k < 0.45) {
    // a Polaroid tucked in the frame
    R(x + 7, 16, 4, 4.5, '#fbf6ea');
    R(x + 7.5, 16.5, 3, 2.5, '#9cc8e0');
    ell(x + 9, 18, 0.8, 0.8, '#e6ab84');
  }
  // name strip: masking tape and marker
  if (name) {
    R(x + 1.5, 8.5, 9, 3, old ? '#e2d4b0' : '#f2e6c4');
    H1(x + 1.5, x + 10.5, 8.5, '#fff6dc');
    P1(x + 10, 11, '#d8c8a0');
    tinyC(name.slice(0, 6), x + 6, 9, old ? '#9a7a6a' : '#3a2c3a');
  }
}
reg('locker', {
  solid: { x: -18, y: -8, w: 36, h: 7 },
  draw: (ctx, o) => {
    const n = num(o, 'w', 3);
    const W = n * 12;
    const names = String(o.props.names ?? '').split(',');
    ensureSolid(o, { x: -Math.floor(W / 2), y: -8, w: W, h: 7 });
    blit(
      ctx,
      o,
      iart(
        `locker|${n}|${o.x % 7}|${names.join(',')}`,
        W,
        31,
        () => {
          for (let i = 0; i < n; i++) lockerDoor(i * 12, i % 2 ? '#4f8a9a' : '#5694a2', hash2(i, o.x % 7, 231), (names[i] ?? '').trim());
          // a steel bench-top cap running along the bank
          chrome(0, 30, W, 1, false);
        },
        { shadow: [['r', 2, 26, W + 1, 5]] },
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
      iart(
        `locked-locker|${f}`,
        12,
        31,
        () => {
          // the same locker as the rest, but older: faded paint, dust, forty years shut
          lockerDoor(0, '#6a8a92', 0.5, 'D.D.', true);
          R(0, 0, 12, 30, (_a, _b, c) => (c && hash2(FX, FY, 241) < 0.14 ? mixc(c, '#b8b0a8', 0.4) : c));
          H1(0, 12, 0, '#c8c0b8');
          H1(0, 12, 0.5, '#d8d0c8');
          // a dried rose tucked into the vent
          L1(4, 6, 7, 2, '#5a6a4a');
          ell(7.5, 1.6, 1.1, 1, '#a8344a');
          P1(7, 1, '#c8506a');
          P1(8, 2.5, '#6a2a3a');
          // heavy brass padlock through the latch, a little sparkle now and then
          chrome(8.5, 14.5, 1, 3);
          circ(9.5, 18, 1.5, '#9aa2c8');
          circ(9.5, 18, 0.8, '#6a8a92');
          RR(7.5, 18, 4.5, 5, 1, PAL.gold3);
          H1(8, 11.5, 18, PAL.gold2);
          V1(8, 18.5, 22.5, '#ffe48e');
          P1(9.5, 20, AK);
          P1(9.5, 20.5, AK);
          P1(9.5, 21, AK);
          if (f) sparkle(8, 18);
        },
        { shadow: [['r', 2, 26, 13, 5]] },
      ),
    );
  },
});

/** The long locker-room mirror: a vanity bulb strip, taped notes, a crack in one corner. */
reg('mirror-vanity', {
  lights: (o) => [light(o, 0, -26, 40, '#fff0c8')],
  draw: (ctx, o) => {
    const n = num(o, 'w', 3);
    const W = n * 16;
    blit(
      ctx,
      o,
      iart(
        `mirror-vanity|${n}`,
        W,
        40,
        () => {
          // the glass: the room reflected dim and teal, with long diagonal glare
          R(1, 3, W - 2, 22, '#c8cce4');
          VG(2, 4, W - 4, 20, ['#8ab0b8', '#6a9098', '#4e6a78']);
          for (let x = 4; x < W - 4; x += 6) R(x, 14, 4, 10, alpha('#4f8a9a', 160));
          fglare(2, 4, W - 4, 20, 0.35);
          // a crack spidering out of the bottom-left corner, held together with tape
          L1(2.5, 23, 7, 17, '#e8f4ff');
          L1(5, 20, 9, 21, '#e8f4ff');
          L1(4, 21.5, 3, 16, '#e8f4ff');
          R(4.5, 18.5, 5, 1.5, alpha('#f2e6c4', 220));
          // bulbs along the top
          R(0, 0, W, 3.5, '#4e4870');
          for (let x = 3; x < W - 2; x += 5) {
            ell(x, 1.8, 1.4, 1.4, '#fff6dc');
            P1(x - 0.5, 1.2, '#ffffff');
          }
          // taped-up notes, photos, a match card, a lipstick heart
          const notes: [number, number, Color][] = [[W - 12, 5, '#fff4a0'], [W - 7, 7, '#fbf6ea'], [10, 5, '#ffc8d8'], [W / 2 - 2, 4.5, '#fbf6ea']];
          notes.forEach(([nx, ny, c], i) => {
            R(nx, ny, 5, 5.5, c);
            H1(nx + 0.5, nx + 4.5, ny + 2, '#a89cc0');
            H1(nx + 0.5, nx + 3.5, ny + 3, '#a89cc0');
            R(nx + 1.5, ny - 0.5, 2, 1, alpha('#f2e6c4', 230));
            if (i === 3) {
              R(nx + 0.5, ny + 0.5, 4, 2.5, '#9cc8e0');
              ell(nx + 2.5, ny + 2, 0.8, 0.8, '#e6ab84');
            }
          });
          L1(W / 2 + 6, 15, W / 2 + 7.5, 13.5, '#d8304a');
          L1(W / 2 + 7.5, 13.5, W / 2 + 9, 15, '#d8304a');
          L1(W / 2 + 6, 15, W / 2 + 7.5, 17, '#d8304a');
          L1(W / 2 + 9, 15, W / 2 + 7.5, 17, '#d8304a');
          tinyT('BE GREAT', 6, 19.5, '#d8304a');
          // the counter: laminate top, hair spray, a can of baby powder, tape rolls, Gideon's comb
          R(0, 25, W, 3, '#e8dcc4');
          H1(0, W, 25, '#fff6e6');
          R(0, 28, W, 12, '#7a5a4a');
          fgrain(0, 28, W, 12, WALNUT, 411, true);
          for (let x = 2; x + 12 <= W; x += 16) {
            H1(x, x + 12, 29.5, shA(WALNUT.b, 0.3));
            V1(x, 29.5, 38, shA(WALNUT.b, 0.3));
            R(x + 5, 32, 2, 1, PAL.gold2);
          }
          R(4, 20, 2, 5, '#c9404c');
          R(4, 19.5, 2, 1, '#9aa2c8');
          R(8, 21, 3, 4, '#fbf6ea');
          tinyT('BABY', 8, 22, '#5a7ab8');
          for (let k = 0; k < 3; k++) {
            ell(W - 18 + k * 4, 23.5, 1.6, 1.6, '#fbf6ea');
            ell(W - 18 + k * 4, 23.5, 0.6, 0.6, '#c8c0b8');
          }
          R(W / 2 - 4, 23.5, 7, 1, '#2b2140');
          for (let x = W / 2 - 4; x < W / 2 + 3; x += 0.5) P1(x, 24.5, '#2b2140');
        },
        { outline: false },
      ),
    );
  },
});

reg('shower-stall', {
  draw: (ctx, o, t) => {
    const drip = frame(t, 6, 3, phaseOf(o));
    blit(
      ctx,
      o,
      iart(
        `shower-stall|${drip}`,
        26,
        44,
        () => {
          // white tile surround with fine grout, a chrome head and a striped curtain half drawn
          R(0, 0, 26, 40, '#e8eef2');
          R(0, 0, 26, 40, (_a, _b, o2) => (o2 && (FX % 8 === 0 || FY % 8 === 0) ? '#c8d0dc' : o2));
          R(0, 32, 26, 8, '#9cc8c8');
          R(0, 32, 26, 8, (_a, _b, o2) => (o2 && (FX % 6 === 0 || FY % 6 === 0) ? '#7aa8a8' : o2));
          chrome(14, 4, 1.5, 6);
          chrome(10, 3, 6, 1.5, false);
          ell(10, 5, 2.5, 1, '#c8cce4');
          for (let k = 0; k < 3; k++) {
            const dy = 7 + ((drip + k * 2) % 6) * 4;
            if (dy < 32) P1(9 + k, dy, '#9cd8f0');
          }
          chrome(16, 18, 4, 1.5, false);
          ell(18, 18.7, 1.3, 1.3, '#d8434b');
          // curtain rod + curtain
          chrome(0, 1, 26, 1, false);
          for (let x = 0; x < 9; x += 0.5) {
            const fold = Math.sin(x * 1.6) * 0.5 + 0.5;
            const c = Math.floor(x / 2) % 2 ? '#fbf6ea' : '#3f9a92';
            V1(x, 2, 36 - fold * 2, mixc(c, shA(c, 0.3), fold));
          }
          for (let x = 0; x < 9; x += 1.5) P1(x, 1.5, '#9aa2c8');
          // drain, a bar of soap, flip-flops left behind
          ell(15, 38, 2, 0.8, '#6e688e');
          RR(20, 35.5, 3, 1.5, 1, '#ffc8d8');
          ell(5, 41, 1.5, 2.5, '#5a7ab8');
          ell(8, 41.5, 1.5, 2.5, '#5a7ab8');
          // threshold lip
          R(0, 40, 26, 4, '#d8dcf0');
          H1(0, 26, 40, '#ffffff');
          H1(0, 26, 43.5, '#9aa2c8');
        },
        { outline: false },
      ),
    );
  },
});

reg('locker-bench', {
  draw: (ctx, o) => {
    const n = num(o, 'w', 3);
    const W = n * 16;
    const seed = Math.floor(o.x + o.y * 3);
    blit(
      ctx,
      o,
      iart(
        `locker-bench|${n}|${seed % 4}`,
        W,
        16,
        () => {
          // varnished maple plank on steel pedestals
          for (const lx0 of [3, W - 6]) {
            chrome(lx0, 8, 3, 7);
            ell(lx0 + 1.5, 15, 3, 0.8, '#6e688e');
          }
          R(0, 4, W, 4, OAK.l);
          fgrain(0, 4, W, 4, { ...OAK, b: OAK.l }, 421 + seed);
          H1(0, W, 4, liA(OAK.l, 0.45));
          R(0, 8, W, 1.5, OAK.s);
          H1(0, W, 9.5, shA(OAK.s, 0.3));
          // whatever got left on it today
          const r = rng(seed * 13 + 7);
          let x = 2 + r() * 4;
          while (x < W - 8) {
            const k = Math.floor(r() * 5);
            if (k === 0) {
              // gym duffel
              RR(x, 0, 10, 5, 2, '#3a3478');
              H1(x + 1, x + 9, 0.5, '#5a52a0');
              chrome(x + 2, 2, 6, 0.6, false);
              L1(x + 2, 0.5, x + 5, -1.5, '#2b2140');
              L1(x + 5, -1.5, x + 8, 0.5, '#2b2140');
              x += 12;
            } else if (k === 1) {
              // folded towel
              R(x, 2, 7, 2.5, '#fbf6ea');
              H1(x, x + 7, 3.5, '#d8434b');
              x += 9;
            } else if (k === 2) {
              // a pair of ring boots, laces dangling
              for (const bx of [x, x + 3.5]) {
                R(bx, -1, 3, 5, '#2b2140');
                H1(bx, bx + 3, -1, '#5a4a6a');
                for (let i = 0; i < 3; i++) P1(bx + 1.5, i * 1.2, '#fbf6ea');
              }
              x += 9;
            } else if (k === 3) {
              // athletic tape rolls and scissors
              for (let i = 0; i < 2; i++) {
                ell(x + 1.5 + i * 3.5, 2.5, 1.5, 1.5, '#fbf6ea');
                ell(x + 1.5 + i * 3.5, 2.5, 0.6, 0.6, '#c8c0b8');
              }
              L1(x + 7, 3.5, x + 9, 2, '#9aa2c8');
              x += 11;
            } else {
              // a sports drink
              R(x, -0.5, 2, 4.5, '#ff8a3a');
              R(x, -1, 2, 1, '#fbf6ea');
              x += 5;
            }
          }
        },
        { shadow: [['r', 1, 13, W, 4]] },
      ),
    );
  },
});

reg('taping-table', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'taping-table',
        32,
        20,
        () => {
          // padded trainer's table: tan vinyl, chrome legs, a paper roll, tape and an ice bucket
          for (const lx0 of [2, 28]) chrome(lx0, 10, 2, 10);
          RR(0, 3, 32, 8, 2, '#c8905a');
          vinyl(0.5, 3.5, 31, 7, '#c8905a', 8, true);
          R(3, 4, 20, 6, '#fbf6ea');
          H1(3, 23, 4, '#ffffff');
          V1(23, 4, 10, '#d8d0c8');
          ell(26.5, 6, 2, 1.4, '#e8e0d4');
          for (let k = 0; k < 4; k++) {
            ell(5 + k * 3.5, 6.5, 1.4, 1.4, k === 3 ? '#ffd050' : '#fbf6ea');
            ell(5 + k * 3.5, 6.5, 0.5, 0.5, '#c8c0b8');
          }
          // ice bucket under the table
          R(10, 13, 7, 6, '#9aa2c8');
          chrome(10, 13, 7, 6);
          for (let k = 0; k < 4; k++) P1(11 + k * 1.5, 12.5, '#e8f8ff');
          R(0, 11, 32, 1, shA('#c8905a', 0.45));
        },
        { shadow: [['r', 1, 17, 32, 4]] },
      ),
    ),
});

reg('laundry-cart', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'laundry-cart',
        18,
        16,
        () => {
          // canvas hamper on a steel frame, heaped with towels
          chrome(1, 3, 16, 1.5, false);
          R(1.5, 4.5, 15, 8, '#c8b898');
          R(1.5, 4.5, 15, 8, (_a, _b, o2) => (o2 && (FX + FY * 3) % 7 === 0 ? shA(o2, 0.1) : o2));
          for (let k = 0; k < 6; k++) ell(3.5 + k * 2.3, 3 - (k % 2), 2.4, 1.6, k % 3 ? '#fbf6ea' : '#e8dcd0');
          H1(4, 7, 2.5, '#d8434b');
          tinyC('ACW', 9, 7, '#6a5a4a');
          for (const wx of [2.5, 15.5]) ell(wx, 14.5, 1.3, 1.3, '#2b2140');
          V1(2.5, 12.5, 14, '#9aa2c8');
          V1(15.5, 12.5, 14, '#9aa2c8');
        },
        { shadow: [['e', 9, 15, 8, 1.6]] },
      ),
    ),
});

reg('water-cooler', {
  draw: (ctx, o, t) => {
    const b = frame(t, 8, 1, phaseOf(o));
    blit(
      ctx,
      o,
      iart(
        `water-cooler|${b === 0 ? 1 : 0}`,
        10,
        24,
        () => {
          // blue jug upside down, a glug of a bubble now and then, the paper-cup dispenser
          ell(5, 4.5, 4, 4.5, alpha('#7ab8e8', 210));
          R(1, 4, 8, 4, alpha('#7ab8e8', 210));
          R(3.5, 8, 3, 2, '#5a90c8');
          L1(2, 1.5, 3, 7, '#d8f0ff');
          if (b === 0) ell(5, 5, 0.8, 0.8, '#e8f8ff');
          RR(1, 10, 8, 14, 1, '#f2eef6');
          R(1.5, 10.5, 7, 13, (_a, _b) => mixc('#ffffff', '#c8cce4', (lx() - 1.5) / 7));
          R(2.5, 12, 2, 1.5, '#5a7ab8');
          R(5.5, 12, 2, 1.5, '#d8434b');
          R(2, 14.5, 6, 1, '#9aa2c8');
          R(9, 12, 1.5, 6, '#e8e0d4');
          H1(1, 9, 23.5, '#9aa2c8');
        },
        { shadow: [['e', 5, 23, 4, 1.2]] },
      ),
    );
  },
});

/** A rolling whiteboard: tonight's card in Birdie's handwriting. */
reg('whiteboard', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'whiteboard',
        28,
        30,
        () => {
          chrome(2, 18, 1.5, 11);
          chrome(24.5, 18, 1.5, 11);
          for (const wx of [2.5, 25]) ell(wx, 29, 1.6, 1, '#2b2140');
          R(0, 0, 28, 19, '#c8cce4');
          R(0.5, 0.5, 27, 18, '#fbfcff');
          fglare(0.5, 0.5, 27, 18, 0.12);
          tinyC('TONIGHT', 14, 1.2, '#c9404c');
          const lines = ['ROSA V EARL', 'DEX V BO', 'HAZEL V ?', 'MAIN: YOU'];
          lines.forEach((ln, i) => tinyT(ln, 2, 4.5 + i * 3, i === 3 ? '#3f6ab0' : '#2b2140'));
          L1(20, 11, 26, 9, '#2b2140');
          ell(23, 14, 2.5, 1.6, (_a, _b, o2) => o2);
          tinyT('NO', 21, 13.5, '#c9404c');
          L1(20.5, 15, 25, 13, '#c9404c');
          R(2, 17.5, 24, 1.5, '#9aa2c8');
          R(6, 16.5, 4, 1, '#2b2140');
          R(12, 16.5, 4, 1, '#c9404c');
        },
        { shadow: [['r', 2, 27, 26, 3]] },
      ),
    ),
});

/** A paper notice pinned to a wall: tiny hand-lettered lines (props.lines, '|' separated). */
reg('notice', {
  draw: (ctx, o) => {
    const lines = String(o.props.lines ?? 'NOTICE').toUpperCase().split('|');
    const v = variant(o, 3);
    const w = Math.max(10, Math.ceil(Math.max(...lines.map(tinyW)) + 4));
    const h = lines.length * 3 + 3;
    blit(
      ctx,
      o,
      iart(
        `notice|${v}|${lines.join('|')}`,
        w + 1,
        h + 1,
        () => {
          const paper = ['#fbf6ea', '#fff4a0', '#ffd8e0'][v];
          R(0, 0, w, h, paper);
          R(0, 0, w, h, (_a, _b, o2) => (o2 && hash2(FX, FY, 431) < 0.04 ? shA(o2, 0.06) : o2));
          lines.forEach((ln, i) => tinyC(ln, w / 2, 1.5 + i * 3, i === 0 ? '#c9404c' : '#3a2c3a'));
          ell(w / 2, 0.6, 0.8, 0.8, '#d8434b');
          P1(w - 1, h - 1, shA(paper, 0.2));
          V1(w, 1, h + 1, SH(70));
          H1(1, w + 1, h, SH(70));
        },
        { outline: false },
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
      iart(
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
      iart(
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
      iart(
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
              // canvas weave in fine pixels, a few boot scuffs and taped seams
              R(st.mx, st.my + 1, st.mw, st.mh - 1, (_a, _b, o2) => {
                if (!o2) return o2;
                const h = hash2(FX, FY, 263);
                if ((FX + FY) % 4 === 0 && h < 0.5) return shA(o2, 0.04);
                if (h > 0.985) return liA(o2, 0.18);
                return o2;
              });
              for (const [x, y, w] of [[40, 52, 6], [100, 44, 5], [70, 76, 7], [124, 74, 4]] as [number, number, number][]) L1(x, y, x + w, y + 0.5, '#c4b8d4');
              H1(st.mx + 2, st.mx + st.mw - 2, st.my + st.mh / 2, '#dcd4e6');
            },
            () => {
              const y = st.my + st.mh + 2;
              TC('ALLEY CHAMPIONSHIP WRESTLING', 80, y + 9, '#ffd560', FT, { sp: 1 });
              HL(26, 133, y + 16, '#5a52a0');
              for (const sx of [12, 143]) stampRows(['..#..', '.###.', '#####', '.###.', '.#.#.'], { '#': '#f6f0f4' }, sx, y + 8);
              // gold trim along the apron, the skirt's velvet nap
              H1(st.mx - 2, st.mx + st.mw + 2, y + 0.5, '#ffd560');
              H1(st.mx - 2, st.mx + st.mw + 2, y + st.apron - 3, '#c8a040');
              R(st.mx - 2, y + 1, st.mw + 4, st.apron - 4, (_a, _b, o2) => (o2 && hash2(FX, FY, 264) < 0.06 ? liA(o2, 0.12) : o2));
              // ringside steel steps at the front-right corner
              for (let i = 0; i < 3; i++) {
                chrome(140 + i * 2, y + 14 + i * 3, 14 - i * 2, 3, false);
                H1(140 + i * 2, 154, y + 14 + i * 3, '#ffffff');
                for (let x = 141 + i * 2; x < 153; x += 2) P1(x, y + 15.5 + i * 3, '#6e688e');
              }
            },
          );
        },
        { shadow: [['r', 4, 106, 158, 8]] },
      ),
    ),
});

// ---------------------------------------------------------------- the Sportatorium, piece by piece

/**
 * Side grandstand facing the ring: tiers run north-south and step up away from
 * the ring (left stands rise to the west, right stands to the east). Seen in
 * 3/4, each tier's plank top is lifted by its height and its south end shows
 * as a step in the silhouette. Footprint: (tiers*18+4) px wide, len tiles deep.
 */
reg('grandstand', {
  draw: (ctx, o) => {
    const T = num(o, 'tiers', 4);
    const len = num(o, 'len', 7);
    const right = o.props.side === 'right';
    const tw = 18;
    const lift = 8;
    const W = T * tw + 4;
    const L = len * 16;
    const H = L + T * lift + 10;
    blit(
      ctx,
      o,
      iart(
        `grandstand|${T}|${len}|${right ? 'r' : 'l'}`,
        W,
        H,
        () => {
          // X maps "distance from the ring side" to sprite x
          const X = (x: number, w: number) => (right ? x : W - x - w);
          const base = H; // floor line (south edge of the footprint)
          const topY = (t: number) => base - L - (t + 1) * lift + 2;
          for (let t = T - 1; t >= 0; t--) {
            const x = X(2 + t * tw, tw);
            const y = topY(t);
            const wd = t % 2 ? OAK : HONEY;
            // the south end of the tier: a riser face as tall as the tier is high, steel legs under it
            const fh = (t + 1) * lift - 2;
            R(x, y + L, tw, fh, '#2f2a44');
            R(x, y + L, tw, 4, shA(wd.b, 0.15));
            fgrain(x, y + L, tw, 4, { ...wd, b: shA(wd.b, 0.15) }, 360 + t, false);
            H1(x, x + tw, y + L, liA(wd.b, 0.25));
            for (const lxx of [x + 1, x + tw - 2.5]) chrome(lxx, y + L + 4, 1.5, fh - 4);
            if (fh > 8) {
              L1(x + 2, y + L + fh - 1, x + tw - 2, y + L + 5, '#6e688e');
              L1(x + tw - 2, y + L + fh - 1, x + 2, y + L + 5, '#5a5478');
            }
            tinyC('ABCDEF'[t], x + tw / 2, y + L + 0.8, '#fff4dc');
            // the top: seat plank away from the ring, foot plank toward it, a dark gap between
            const seatX = right ? x + 9 : x;
            const footX = right ? x : x + 10;
            R(x, y, tw, L, '#2f2a44');
            R(footX, y, 8, L, shA(wd.l, 0.18));
            fgrain(footX, y, 8, L, { ...wd, b: shA(wd.l, 0.18) }, 370 + t, true);
            R(seatX, y, 9, L, wd.l);
            fgrain(seatX, y, 9, L, { ...wd, b: wd.l }, 380 + t, true);
            // rounded seat nosing catches the light; the riser of the next tier up throws a shadow
            V1(right ? seatX + 0.5 : seatX + 8.5, y, y + L, liA(wd.l, 0.45));
            const riserX = right ? x + tw - 1.5 : x;
            if (t < T - 1) {
              R(riserX, y, 1.5, L, shA(wd.b, 0.35));
              V1(right ? riserX - 0.5 : riserX + 1.5, y, y + L, shA(wd.l, 0.3));
            }
            H1(x, x + tw, y, liA(wd.l, 0.3));
            // board joints, bolt heads and painted seat numbers every tile
            for (let yy = 8; yy < L; yy += 16) {
              H1(seatX, seatX + 9, y + yy, shA(wd.l, 0.28));
              H1(footX, footX + 8, y + yy + 4, shA(wd.l, 0.35));
              P1(seatX + 1.5, y + yy - 1, '#9aa2c8');
              P1(seatX + 7, y + yy - 1, '#9aa2c8');
            }
            for (let k = 0; k < len; k++) tinyT(String(k + 1), seatX + 3, y + k * 16 + 3, shA(wd.l, 0.4));
          }
          // a chrome guard rail along the top tier
          const tx = X(2 + (T - 1) * tw, tw);
          const ty = topY(T - 1);
          const railX = right ? tx + tw - 2 : tx + 1;
          for (let yy = 0; yy <= L; yy += 16) {
            chrome(railX, ty + yy - 9, 1.5, 9);
          }
          chrome(railX - 0.5, ty - 10, 2.5, 1.5, false);
          R(railX - 0.5, ty - 10, 2.5, L + 2, (_a, _b) => CHROME[2 + (Math.floor(FY / 3) % 2)]);
          // leftovers from last Saturday: a foam finger, a popcorn box, a program, a jacket
          const r = rng(len * 7 + T + (right ? 50 : 0));
          for (let k = 0; k < 5; k++) {
            const t = Math.floor(r() * T);
            const sx = X(2 + t * tw, tw) + (right ? 9 : 1) + r() * 6;
            const sy = topY(t) + 6 + r() * (L - 14);
            const kind = k % 4;
            if (kind === 0) {
              poly([[sx, sy + 6], [sx + 3, sy + 6], [sx + 3, sy + 2], [sx + 1.5, sy - 1], [sx, sy + 2]], '#ffd050');
              V1(sx + 1.5, sy - 1, sy + 2, '#c88a2a');
            } else if (kind === 1) {
              poly([[sx, sy], [sx + 3, sy], [sx + 2.5, sy + 4], [sx + 0.5, sy + 4]], '#fbf6ea');
              for (let i = 0; i < 3; i++) V1(sx + 0.5 + i, sy, sy + 4, '#d8434b');
              for (let i = 0; i < 4; i++) P1(sx + i * 0.8, sy - 0.5, '#fff4c0');
            } else if (kind === 2) {
              R(sx, sy, 3.5, 4.5, '#fbf6ea');
              R(sx, sy, 3.5, 1.5, '#3a3478');
              P1(sx + 1.5, sy + 2.5, '#d8434b');
            } else {
              RR(sx - 1, sy, 6, 8, 1, '#3f6ab0');
              V1(sx + 2, sy, sy + 8, '#2f4e88');
              P1(sx + 1, sy + 2, '#ffd050');
            }
          }
        },
        { shadow: [['r', 2, H - 4, W, 6]] },
      ),
    );
  },
});

/** The entrance stage at the head of the aisle: tinsel curtain, marquee, speaker stacks. */
reg('entrance-stage', {
  lights: (o) => [light(o, 0, -40, 60, '#ffb8e0'), light(o, -48, -20, 30, '#a8c8ff'), light(o, 48, -20, 30, '#a8c8ff')],
  draw: (ctx, o, t) => {
    const n = num(o, 'w', 8);
    const W = n * 16;
    const f = frame(t, 4, 5, phaseOf(o));
    blit(
      ctx,
      o,
      iart(
        `entrance-stage|${n}|${f}`,
        W,
        90,
        () => {
          const cx = W / 2;
          // backdrop frame: black flats either side of the curtain
          R(6, 8, W - 12, 42, '#231c34');
          // the tinsel curtain: thousands of fine silver/gold/pink strands, parted at the middle
          const cw = W - 28;
          const x0 = 14;
          R(x0, 10, cw, 40, () => {
            const sx = lx() - x0;
            const gap = Math.abs(sx - cw / 2) < 3 + (f % 2) * 0.5;
            if (gap) return mixc('#3a2850', '#6a3a7a', (ly() - 10) / 40);
            const strand = hash2(FX, 0, 391);
            const tw2 = hash2(FX, FY >> 2, 392 + f);
            const base = strand < 0.35 ? '#c8cce4' : strand < 0.6 ? '#e8c060' : strand < 0.8 ? '#ff94c8' : '#9aa2c8';
            const k = (ly() - 10) / 40;
            let c: Color = mixc(base, shA(base, 0.35), k * 0.6);
            if (tw2 > 0.93) c = '#ffffff';
            else if (tw2 < 0.25) c = shA(c, 0.25);
            return c;
          });
          // a glow spilling through the part
          glow(cx - 6, 18, 12, 32, '#ffd8f0', 0.3, 8);
          // marquee header with chasing bulbs
          RR(x0 - 4, 0, cw + 8, 10, 2, '#3a3478');
          R(x0 - 3, 1, cw + 6, 8, '#2f2a62');
          T('ACW', cx - 11, 2, '#ffd050', FT, { bold: true, ls: 2 });
          H1(x0 - 3, x0 + cw + 3, 1, '#5a52a0');
          for (let x = x0 - 2; x < x0 + cw + 3; x += 3) {
            const on = Math.floor(x / 3 + f) % 3 === 0;
            P1(x, 0.5, on ? '#fff4c0' : '#c8a050');
            P1(x + 0.5, 9.5, on ? '#c8a050' : '#fff4c0');
          }
          for (const sx of [x0 + 2, x0 + cw - 8]) {
            for (let k = 0; k < 5; k++) P1(sx + k * 1.5, 4.5, (k + f) % 2 ? '#ff94c8' : '#5ff2d6');
          }
          // speaker stacks on both ends
          for (const sx of [0, W - 12]) {
            R(sx, 22, 12, 30, '#2b2140');
            for (const sy of [24, 34, 44]) {
              RR(sx + 1, sy, 10, 9, 1, '#3a3050');
              circ(sx + 6, sy + 4.5, 3.4, '#1e1830');
              circ(sx + 6, sy + 4.5, 2, '#4e4870');
              P1(sx + 5, sy + 3.5, '#9aa2c8');
            }
            H1(sx, sx + 12, 22, '#5a5070');
          }
          // the stage deck: planks running across, scuffed in the middle where everyone walks
          const dy = 50;
          R(4, dy, W - 8, 30, HONEY.b);
          fgrain(4, dy, W - 8, 30, HONEY, 393);
          for (let y = dy + 5; y < dy + 30; y += 5) H1(4, W - 4, y, shA(HONEY.b, 0.22));
          glow(cx - 14, dy, 28, 30, '#f6e2c0', 0.25, 6);
          // gaffer tape marks for the wrestlers' entrance spots
          for (const [mx, my] of [[cx - 20, dy + 12], [cx + 18, dy + 12], [cx, dy + 22]] as [number, number][]) {
            R(mx - 2, my, 4, 0.8, '#e8e0d0');
            R(mx - 0.4, my - 1.6, 0.8, 4, '#e8e0d0');
          }
          // front lip with a skirt of black velvet and a row of footlights
          R(2, 80, W - 4, 10, '#2b2140');
          R(2, 80, W - 4, 2, '#4a3a5a');
          for (let x = 6; x < W - 6; x += 6) {
            ell(x, 81, 1.4, 0.8, f % 2 ? '#fff0c0' : '#ffe08a');
          }
          for (let x = 4; x < W - 4; x += 3) V1(x, 83, 90, '#3a2c4a');
          // steps down to the aisle at the centre
          for (let i = 0; i < 3; i++) {
            R(cx - 10 + i, 80 + i * 3.3, 20 - 2 * i, 3.3, i % 2 ? '#9aa2c8' : '#c8cce4');
            H1(cx - 10 + i, cx + 10 - i, 80 + i * 3.3, '#ffffff');
          }
        },
        { outline: false, shadow: [['r', 2, 86, W - 2, 6]] },
      ),
    );
  },
});

const SNACK_MENU: [string, string][] = [
  ['POPCORN', '25C'],
  ['HOT DOG', '50C'],
  ['ORANGE DRINK', '25C'],
  ['NACHOS', '75C'],
];
reg('concession', {
  lights: (o) => [light(o, -24, -18, 34, '#ffd070')],
  label: () => 'Look',
  draw: (ctx, o, t) => {
    const n = num(o, 'w', 5);
    const W = n * 16;
    const f = frame(t, 4, 6, phaseOf(o));
    blit(
      ctx,
      o,
      iart(
        `concession|${n}|${f}`,
        W,
        48,
        () => {
          // menu board on the wall behind
          R(8, 0, W - 16, 16, '#3a2c3a');
          R(9, 1, W - 18, 14, '#f6ecd8');
          tinyC('SNACK BAR', W / 2, 1.5, '#c9404c');
          SNACK_MENU.forEach(([a, b], i) => {
            const yy = 4.6 + i * 2.75;
            tinyT(a, 11, yy, '#3a2c3a');
            tinyT(b, W - 11 - tinyW(b), yy, '#3f6ab0');
          });
          // striped awning with a scalloped hem
          R(0, 16, W, 6, (_a, _b) => (Math.floor(lx() / 4) % 2 ? '#fbf6ea' : '#d8434b'));
          H1(0, W, 16, '#ffb0a0');
          for (let x = 0; x < W; x += 4) ell(x + 2, 22, 2, 1.4, Math.floor(x / 4) % 2 ? '#fbf6ea' : '#d8434b');
          shade(0, 23.5, W, 2, 0.25, 10);
          // popcorn machine: red frame, glass, a heap of popcorn, the kettle glowing
          const px = 3;
          R(px, 22, 16, 15, '#c9404c');
          R(px + 1, 23, 14, 12, alpha('#fff4dc', 120));
          R(px + 1, 30, 14, 5, '#ffe08a');
          for (let i = 0; i < 40; i++) P1(px + 1.5 + hash2(i, 1, 395) * 13, 29 + hash2(i, 2, 395) * 6, hash2(i, 3, 395) < 0.5 ? '#fff8e0' : '#f6d38a');
          ell(px + 8, 25.5, 3, 1.6, '#9aa2c8');
          glow(px + 1, 23, 14, 7, '#ffd070', 0.35, 6 + f);
          for (let k = 0; k < 3; k++) P1(px + 5 + k * 3 + (f % 2) * 0.5, 27 + ((k + f) % 3), '#fff8e0');
          tinyC('POPCORN', px + 8, 23.3, '#fff4dc');
          fglare(px + 1, 23, 14, 12, 0.2);
          // soda fountain with three taps, and a stack of cups
          chrome(24, 28, 12, 9);
          for (let k = 0; k < 3; k++) {
            R(25.5 + k * 3.5, 26, 2, 2, ['#ff8a3a', '#6a3a2a', '#d8434b'][k]);
            V1(26.5 + k * 3.5, 33, 35, AK);
          }
          for (let k = 0; k < 4; k++) R(38, 36 - k * 1.6, 3, 1.6, k % 2 ? '#fbf6ea' : '#e8e0d4');
          // hot dogs turning on the roller
          R(44, 33, 14, 4, '#9aa2c8');
          for (let k = 0; k < 4; k++) {
            const hx = 45 + k * 3.3;
            ell(hx + 1, 34.5, 1.3, 0.8, '#c8603a');
            P1(hx + 0.5 + ((k + f) % 2) * 0.5, 34, '#f08a5a');
          }
          // napkins, mustard, a tip cup
          R(W - 18, 32, 4, 5, '#fbf6ea');
          R(W - 13, 31, 2, 6, '#ffd050');
          R(W - 9, 33, 3.5, 4, alpha('#e8f4ff', 170));
          // the counter: worn red top, cream-and-red front with SNACKS in hand-painted letters
          R(0, 37, W, 2, '#a8343e');
          H1(0, W, 37, '#e8706a');
          R(0, 39, W, 9, '#f2e2c4');
          for (let x = 0; x < W; x += 8) R(x, 39, 1, 9, '#e8d0a8');
          T('SNACKS', W / 2 - 14, 41, '#c9404c', FT, {});
          H1(0, W, 47.5, '#8a5a4a');
        },
        { shadow: [['r', 2, 45, W, 5]] },
      ),
    );
  },
});

reg('merch-table', {
  draw: (ctx, o) => {
    const n = num(o, 'w', 4);
    const W = n * 16;
    blit(
      ctx,
      o,
      iart(
        `merch-table|${n}`,
        W,
        40,
        () => {
          // pegboard on the wall with shirts and foam fingers hung up
          R(2, 0, W - 4, 22, '#c8a878');
          R(2, 0, W - 4, 22, (_a, _b, o2) => (FX % 4 === 1 && FY % 4 === 1 ? '#8a6a48' : o2));
          const shirts: Color[] = ['#3a3478', '#d8434b', '#fbf6ea', '#3f9a92', '#2b2140'];
          for (let k = 0; k < Math.floor((W - 8) / 12); k++) {
            const sx = 5 + k * 12;
            const c = shirts[k % shirts.length];
            poly([[sx, 3], [sx + 3, 2], [sx + 7, 2], [sx + 10, 3], [sx + 10, 6], [sx + 8, 6], [sx + 8, 14], [sx + 2, 14], [sx + 2, 6], [sx, 6]], c);
            tinyC(k % 2 ? 'ACW' : 'VH', sx + 5, 6.5, k % 3 === 2 ? '#c9404c' : '#ffd050');
            P1(sx + 5, 1.5, '#9aa2c8');
          }
          for (let k = 0; k < 2; k++) {
            const fx = W - 14 + k * 6;
            poly([[fx, 21], [fx + 4, 21], [fx + 4, 16], [fx + 2, 14], [fx, 16]], k ? '#ffd050' : '#5ec0a8');
          }
          // the folding table under a cloth, stacked shirts, 8x10s, a cash box
          R(0, 24, W, 3, '#f6f0f4');
          R(0, 27, W, 10, '#3a3478');
          for (let x = 2; x < W; x += 5) V1(x, 27, 37, '#332e6c');
          tinyC('ALLEY CHAMPIONSHIP WRESTLING', W / 2, 30, '#ffd050');
          for (let k = 0; k < 3; k++) {
            const sx = 3 + k * 9;
            for (let i = 0; i < 3; i++) R(sx, 23.5 - i * 1.2, 7, 1.2, i % 2 ? liA(shirts[k], 0.2) : shirts[k]);
          }
          for (let k = 0; k < 3; k++) frameBox(W - 30 + k * 7, 18.5, 6, 6, '#f6f0f4', 470 + k, k === 1 ? 'team' : 'wrestler', false, true);
          R(W - 9, 21, 7, 3.5, '#4e8a5a');
          H1(W - 9, W - 2, 21, '#7ab88a');
          R(W - 6.5, 22, 2, 1, PAL.gold2);
          // hand-lettered price card
          R(W / 2 - 6, 19, 12, 5, '#fbf6ea');
          tinyC('8X10 $2', W / 2, 19.6, '#3a2c3a');
          tinyC('SIGNED $3', W / 2, 21.8, '#c9404c');
          R(1, 37, 2, 3, '#6e688e');
          R(W - 3, 37, 2, 3, '#6e688e');
        },
        { shadow: [['r', 1, 35, W, 5]] },
      ),
    );
  },
});

const BANNERS: [Color, Color, string[]][] = [
  ['#3a3478', '#ffd050', ['ACW', 'TAG', 'CHAMP', '1981']],
  ['#c9404c', '#fbf6ea', ['TERR', 'OF THE', 'YEAR', '1979']],
  ['#2f6a52', '#ffd050', ['SOLD', 'OUT', '1984']],
  ['#5a3a7a', '#ff94c8', ['WOMENS', 'CHAMP', '1983']],
  ['#2b2140', '#c8cce4', ['MID', 'SOUTH', '1977']],
  ['#d8a040', '#3a2c3a', ['50', 'YEARS', 'OF', 'FIGHTS']],
];
reg('banner', {
  draw: (ctx, o, t) => {
    const v = variant(o, BANNERS.length);
    const sway = Math.sin(t * 0.8 + phaseOf(o)) > 0.6 ? 1 : 0;
    blit(
      ctx,
      o,
      iart(
        `banner|${v}|${sway}`,
        14,
        30,
        () => {
          const [bg, fg, lines] = BANNERS[v];
          chrome(0, 0, 14, 1.5, false);
          P1(0, 0.5, '#ffffff');
          poly([[1, 1.5], [13, 1.5], [13 + sway * 0.5, 26], [7 + sway * 0.5, 29], [1 + sway * 0.5, 26]], bg);
          // a gold border stitched near the edge, a faint fold crease
          poly([[2, 2.5], [12, 2.5], [12 + sway * 0.5, 25.4], [7 + sway * 0.5, 27.8], [2 + sway * 0.5, 25.4]], (_a, _b, o2) => o2);
          V1(1.5, 2, 26, fg);
          V1(12.5 + sway * 0.5, 2, 26, fg);
          R(1, 1.5, 12, 30, (_a, _b, o2) => (o2 && Math.abs(lx() - 7) < 0.3 ? shA(o2, 0.15) : o2));
          lines.forEach((ln, i) => tinyC(ln, 7 + sway * 0.25, 4 + i * 4, fg));
          for (let k = 0; k < 3; k++) P1(5 + k * 2, 22.5, fg);
          shade(1, 1.5, 12, 2, 0.2, 8);
        },
        { outline: false },
      ),
    );
  },
});

/** The lighting truss over the ring (hangs from the rafters, drawn above everything). */
reg('truss', {
  above: true,
  lights: (o) => [light(o, -50, -12, 46, '#fff4e0'), light(o, 50, -12, 46, '#fff4e0'), light(o, 0, -4, 64, '#fff0d8')],
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'truss',
        176,
        100,
        () => {
          // a box truss: top + bottom chords with a zig-zag web, in dark steel with a lit top edge
          const girder = (x0: number, y0: number, x1: number, y1: number, d: number) => {
            const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 4));
            for (let i = 0; i < n; i++) {
              const a = i / n;
              const b = (i + 1) / n;
              const ax = x0 + (x1 - x0) * a;
              const ay = y0 + (y1 - y0) * a;
              const bx = x0 + (x1 - x0) * b;
              const by = y0 + (y1 - y0) * b;
              L1(ax, ay, bx, by + d, '#5a5478');
              L1(ax, ay + d, bx, by, '#4e4870');
            }
            L1(x0, y0, x1, y1, '#3a3450');
            L1(x0, y0 - 0.5, x1, y1 - 0.5, '#c8cce4');
            L1(x0, y0 + d, x1, y1 + d, '#2b2140');
            L1(x0, y0 + d + 0.5, x1, y1 + d + 0.5, '#3a3450');
          };
          // chains up into the dark rafters
          for (const cx of [10, 166]) for (let y = 0; y < 30; y += 1) P1(cx + (y % 2) * 0.5, y, '#6e688e');
          girder(10, 30, 166, 30, 2.5);
          girder(10, 30, 4, 52, 2.5);
          girder(166, 30, 172, 52, 2.5);
          // par cans on the back chord (small, far) and the front chord (big, near)
          for (const cx of [30, 66, 110, 146]) {
            R(cx - 0.5, 33, 1, 1.5, '#4e4870');
            RR(cx - 2, 34.5, 4, 4, 1, '#2b2140');
            ell(cx, 38.5, 1.6, 0.6, '#fff6dc');
          }
          girder(4, 52, 172, 52, 3);
          for (const cx of [22, 62, 114, 154]) {
            R(cx - 0.5, 55.5, 1, 2, '#4e4870');
            RR(cx - 3, 57, 6, 6, 1, '#2b2140');
            H1(cx - 3, cx + 3, 57, '#5a5070');
            V1(cx - 2.5, 58, 62, '#4e4870');
            ell(cx, 63, 2.6, 1, '#fff6dc');
            P1(cx, 63, '#ffffff');
          }
          // a faded ACW banner zip-tied to the front chord
          R(76, 53.5, 24, 7, '#3a3478');
          H1(76, 100, 53.5, '#5a52a0');
          tinyC('ACW', 88, 55.5, '#ffd050');
          P1(77, 53, '#9aa2c8');
          P1(99, 53, '#9aa2c8');
        },
        {
          outline: false,
          over: () => {
            // soft beams falling to the canvas
            for (const cx of [22, 62, 114, 154]) {
              for (let y = 64; y < 98; y++) {
                const t = (y - 64) / 34;
                const w = 2.5 + t * 7;
                const ox = (88 - cx) * t * 0.25;
                R(cx + ox - w, y, w * 2, 1, () => (dth(FX, FY, Math.round(5 - t * 3)) ? alpha('#fff8e8', 80) : null));
              }
            }
          },
        },
      ),
    ),
});

reg('folding-chair', {
  draw: (ctx, o) => {
    const reserved = o.props.reserved === true;
    const k = hash2(o.x, o.y, 401);
    blit(
      ctx,
      o,
      iart(
        `folding-chair|${reserved ? 'r' : Math.floor(k * 4)}`,
        10,
        17,
        () => {
          const c = k < 0.5 ? '#a8b0d0' : '#b0a8c8';
          // backrest seen from behind, seat, splayed legs, cross bar
          RR(1, 0, 8, 5.5, 1, c);
          R(1.5, 0.5, 7, 4.5, (_a, _b) => mixc(liA(c, 0.25), shA(c, 0.2), (ly() - 0.5) / 4.5));
          H1(1.5, 8.5, 0.5, '#ffffff');
          chrome(1, 5.5, 1, 11);
          chrome(8, 5.5, 1, 11);
          R(0.5, 8, 9, 2.5, liA(c, 0.15));
          H1(0.5, 9.5, 8, '#f2eef6');
          H1(0.5, 9.5, 10.5, shA(c, 0.4));
          L1(2, 11, 3, 16.5, shA(c, 0.25));
          L1(7.5, 11, 6.5, 16.5, shA(c, 0.35));
          H1(2.5, 7.5, 14, shA(c, 0.3));
          if (reserved) {
            // Seat A1: kept empty since 1984; a card taped to the back and a rose on the seat
            R(2.5, 1, 5, 3.5, '#fbf6ea');
            tinyC('A1', 5, 1.6, '#c9404c');
            L1(3, 9.5, 7, 8.5, '#3a6a3a');
            ell(7.5, 8.5, 1.1, 0.9, '#c8304a');
            P1(7.5, 8, '#ff6a8a');
          } else if (k > 0.85) {
            R(2, 1, 6, 4, '#d8434b');
            tinyC('ACW', 5, 1.8, '#fff4dc');
          }
        },
        { shadow: [['e', 5.5, 16, 4.5, 1.4]] },
      ),
    );
  },
});

reg('camera-rig', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'camera-rig',
        16,
        26,
        () => {
          // Sweet Lou's tripod and the shoulder camcorder that has taped every show since 1979
          L1(8, 12, 3, 25, '#4e4870');
          L1(8, 12, 13, 25, '#6e688e');
          L1(8, 12, 8, 25.5, '#5a5070');
          R(7, 11, 2, 2, '#2b2140');
          RR(3, 4, 10, 7, 1, '#3a3450');
          R(3.5, 4.5, 9, 2, '#4e4870');
          ell(3, 7.5, 2, 2.3, '#2b2140');
          ell(2.6, 7.5, 1.2, 1.5, '#5a7ab0');
          P1(2.2, 7, '#c8e0ff');
          R(9, 2, 4, 2.5, '#2b2140');
          P1(12, 5, '#ff3a3a');
          tinyT('VHS', 6, 8, '#c8cce4');
          // a milk crate of labelled tapes at its foot
          R(9, 19, 7, 6, '#3f6ab0');
          for (let k = 0; k < 4; k++) R(9.5 + k * 1.6, 18, 1.4, 4, k % 2 ? '#2b2140' : '#3a3050');
          for (let k = 0; k < 4; k++) H1(9.5 + k * 1.6, 10.9 + k * 1.6, 18.5, '#fbf6ea');
          R(9, 21, 7, 4, (_a, _b, o2) => (o2 && (FX + FY) % 3 === 0 ? '#2f4e88' : o2));
        },
        { shadow: [['e', 8, 25, 6, 1.6]] },
      ),
    ),
});

reg('exit-sign', {
  lights: (o) => [light(o, 0, -4, 18, '#ff5040')],
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'exit-sign',
        18,
        7,
        () => {
          R(0, 0, 18, 7, '#3a3450');
          R(0.5, 0.5, 17, 6, '#fbf6ea');
          TC('EXIT', 9, 1, '#e83a3a', FT, {});
        },
        { outline: false },
      ),
    ),
});

reg('extinguisher', {
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'extinguisher',
        8,
        16,
        () => {
          R(1, 0, 6, 2, '#c9404c');
          tinyC('FIRE', 4, 0.2, '#fff4dc');
          RR(2, 4, 4, 11, 1, '#d8434b');
          V1(2.5, 5, 14, '#ff8a80');
          R(2.5, 3, 3, 1.5, '#2b2140');
          L1(5, 3.5, 7, 6, '#2b2140');
          R(2.5, 8, 3, 2.5, '#fbf6ea');
          H1(2, 6, 15, '#8e2c4c');
        },
        { outline: false },
      ),
    ),
});

// ---------------------------------------------------------------- VFW Post 316

/** A US-style flag on a pole: drawn as a generic striped flag with a starfield (no text). */
function flagOnPole(x: number, y: number, h: number, kind: 'stripes' | 'post', wave: number): void {
  chrome(x, y, 1, h);
  ell(x + 0.5, y - 0.5, 1, 1, PAL.gold2);
  const fw = 9;
  const fh = 6;
  for (let i = 0; i < fw * 2; i++) {
    const fx = x + 1 + i * 0.5;
    const off = Math.sin(i * 0.5 + wave) * 0.6;
    for (let j = 0; j < fh * 2; j++) {
      const fy = y + 1 + j * 0.5 + off;
      let c: Color;
      if (kind === 'stripes') {
        if (i < 8 && j < 6) c = (i + j) % 3 === 0 ? '#fbf6ea' : '#3a4a8a';
        else c = Math.floor(j / 1.7) % 2 ? '#fbf6ea' : '#c9404c';
      } else {
        c = j < 3 ? '#ffd050' : '#2f4e88';
        if (i > 6 && i < 11 && j > 3 && j < 9) c = (i + j) % 2 ? '#ffd050' : '#fbf6ea';
      }
      P1(fx, fy, shA(c, Math.max(0, off) * 0.25));
    }
  }
}

/** The little bandstand: red velvet curtain, flags, the podium with the post's emblem. */
reg('bandstand', {
  draw: (ctx, o, t) => {
    const n = num(o, 'w', 5);
    const W = n * 16;
    const wave = frame(t, 4, 2, phaseOf(o));
    blit(
      ctx,
      o,
      iart(
        `bandstand|${n}|${wave}`,
        W,
        80,
        () => {
          // velvet curtain with deep folds and a gold fringe, climbing the wall
          R(2, 0, W - 4, 56, () => {
            const f2 = Math.sin(lx() * 1.3) * 0.5 + 0.5;
            return mixc('#d8405a', '#6a1a30', f2 * 0.75 + (ly() / 56) * 0.2);
          });
          R(2, 0, W - 4, 5, '#8a2034');
          for (let x = 2; x < W - 2; x += 4) ell(x + 2, 5, 2, 1.4, '#a8283c');
          H1(2, W - 2, 0, PAL.gold2);
          for (let x = 2; x < W - 2; x += 1) P1(x, 6.5 + (x % 2) * 0.5, PAL.gold3);
          // red, white and blue bunting swag
          for (let k = 0; k < 3; k++) {
            const x0 = 4 + k * ((W - 8) / 3);
            const x1 = x0 + (W - 8) / 3;
            curve(x0, 9, x1, 9, 3, ['#c9404c', '#fbf6ea', '#3a4a8a'][k]);
            curve(x0, 10, x1, 10, 3, ['#c9404c', '#fbf6ea', '#3a4a8a'][(k + 1) % 3]);
          }
          // flags either side, poles standing on the deck
          flagOnPole(5, 18, 40, 'stripes', wave);
          flagOnPole(W - 15, 18, 40, 'post', wave + 1);
          // the stage deck and its front skirt
          R(0, 56, W, 14, OAK.b);
          fgrain(0, 56, W, 14, OAK, 531);
          for (let y = 60; y < 70; y += 4) H1(0, W, y, shA(OAK.b, 0.2));
          shade(0, 56, W, 2, 0.3, 10);
          R(0, 70, W, 10, '#3a3478');
          for (let x = 0; x < W; x += 4) V1(x, 70, 80, '#2f2a62');
          H1(0, W, 70, '#5a52a0');
          tinyC('VFW POST 316', W / 2, 73, '#ffd050');
          // podium with the emblem, a microphone, a glass of water
          const px = W / 2;
          poly([[px - 6, 48], [px + 6, 48], [px + 5, 66], [px - 5, 66]], WALNUT.b);
          fgrain(px - 6, 48, 12, 18, WALNUT, 532, true);
          H1(px - 6, px + 6, 48, WALNUT.l);
          circ(px, 55, 3, PAL.gold2);
          circ(px, 55, 2.2, '#3a4a8a');
          for (let k = 0; k < 5; k++) P1(px + Math.cos(k * 1.26 - 1.57) * 1.3, 55 + Math.sin(k * 1.26 - 1.57) * 1.3, '#fbf6ea');
          L1(px + 2, 48, px + 4, 43, '#2b2140');
          ell(px + 4, 42.5, 0.9, 1.2, '#4e4870');
          R(px - 4.5, 46, 1.5, 2, alpha('#e8f4ff', 200));
        },
        { outline: false, shadow: [['r', 1, 76, W, 5]] },
      ),
    );
  },
});

/** The canteen: coffee, sheet cake, a jar of pickled eggs nobody admits to eating. */
reg('canteen', {
  draw: (ctx, o, t) => {
    const n = num(o, 'w', 6);
    const W = n * 16;
    const steam = frame(t, 4, 3, phaseOf(o));
    blit(
      ctx,
      o,
      iart(
        `canteen|${n}|${steam}`,
        W,
        44,
        () => {
          // sign board
          R(W / 2 - 22, 0, 44, 8, WALNUT.b);
          R(W / 2 - 21, 1, 42, 6, '#2f4e88');
          tinyC('POST 316 CANTEEN', W / 2, 2.2, '#ffd050');
          // shelf of mugs with members' names, a raffle drum, a pull-tab box
          R(2, 12, W - 4, 1.5, WALNUT.l);
          for (let x = 4; x < W - 6; x += 4.5) mug(x, 9, ['#fbf6ea', '#3a4a8a', '#c9404c', '#2f6a52'][Math.floor(x) % 4]);
          // counter
          R(0, 26, W, 3, '#e8dcc4');
          H1(0, W, 26, '#fff6e6');
          R(0, 29, W, 15, WALNUT.b);
          fgrain(0, 29, W, 15, WALNUT, 541, true);
          for (let x = 2; x + 12 <= W; x += 16) {
            R(x, 31, 12, 10, shA(WALNUT.b, 0.08));
            H1(x, x + 12, 31, liA(WALNUT.b, 0.2));
            V1(x + 11.5, 31, 41, shA(WALNUT.b, 0.3));
          }
          chrome(0, 42, W, 1.2, false);
          // coffee urn (steaming), stacked cups, a sheet cake with frosted stars, pickled eggs, the raffle drum
          chrome(3, 15, 7, 11);
          R(5.5, 13.5, 2, 1.5, AK);
          for (let k = 0; k < 3; k++) P1(6.5 + Math.sin(k + steam) * 0.6, 12.5 - k * 1.2, alpha('#ffffff', 160 - k * 40));
          for (let k = 0; k < 5; k++) R(12, 25 - k * 1.5, 3, 1.5, k % 2 ? '#fbf6ea' : '#e8e0d4');
          R(18, 22, 16, 4, '#fbf6ea');
          R(18, 22, 16, 1, '#ffe8f0');
          for (let k = 0; k < 4; k++) P1(20 + k * 3.5, 23.5, k % 2 ? '#c9404c' : '#3a4a8a');
          H1(18, 34, 25.5, '#c9404c');
          poly([[22, 22], [24, 21], [24.5, 22]], '#c8a050');
          R(37, 17, 6, 9, alpha('#e8f4ff', 170));
          for (let k = 0; k < 5; k++) ell(39 + (k % 2) * 2, 24 - k * 1.5, 1.2, 0.9, '#fbf6ea');
          R(36.5, 16, 7, 1.5, '#c8a050');
          tinyT('EGGS', 37.5, 18.5, '#7a5a3a');
          if (W >= 80) {
            ell(W - 14, 21, 6, 4, '#c8cce4');
            ell(W - 14, 21, 5, 3, '#9aa2c8');
            for (let k = 0; k < 6; k++) R(W - 18 + k * 1.4, 19.5 + (k % 2), 1, 0.8, k % 2 ? '#ffd050' : '#ff94b4');
            chrome(W - 8, 20, 3, 1, false);
            L1(W - 21, 25, W - 17, 23, '#6e688e');
            L1(W - 7, 25, W - 11, 23, '#6e688e');
            R(W - 30, 19, 7, 7, '#c9404c');
            tinyT('TABS', W - 29.5, 21, '#fff4dc');
          }
        },
        { shadow: [['r', 1, 40, W, 5]] },
      ),
    );
  },
});

/** A folding table set for bingo: cards, daubers in every colour, coffee, a lucky troll. */
reg('bingo-table', {
  draw: (ctx, o) => {
    const n = num(o, 'w', 3);
    const W = n * 16;
    const seed = Math.floor(o.x * 3 + o.y);
    blit(
      ctx,
      o,
      iart(
        `bingo-table|${n}|${seed % 3}`,
        W,
        16,
        () => {
          for (const lx0 of [2, W - 4]) {
            L1(lx0, 8, lx0 - 1, 15.5, '#6e688e');
            L1(lx0 + 1, 8, lx0 + 2, 15.5, '#9aa2c8');
          }
          R(0, 1, W, 7, '#e8e0d0');
          H1(0, W, 1, '#fffaf0');
          R(0, 8, W, 1.5, '#a8a0b8');
          const r = rng(seed * 11);
          for (let x = 2; x < W - 6; x += 7) {
            // a bingo card with a few daubed squares
            R(x, 2, 5.5, 5, '#fbf6ea');
            for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++) if (r() < 0.3) P1(x + 0.5 + i, 3 + j, ['#ff5d8f', '#5ec0a8', '#a888ff', '#ffd050'][(i + j + seed) % 4]);
            R(x, 2, 5.5, 0.8, '#c9404c');
            // dauber
            R(x + 5.6, 0, 1.4, 4, ['#ff5d8f', '#5ec0a8', '#a888ff', '#ffd050'][Math.floor(r() * 4)]);
            R(x + 5.6, -0.5, 1.4, 0.8, '#fbf6ea');
          }
          mug(W - 5, 3, '#fbf6ea');
          if (seed % 3 === 0) {
            // the lucky troll with the electric pink hair
            R(4, 0.5, 2, 2.5, '#9a7a5a');
            for (let k = 0; k < 4; k++) L1(5, 0.5, 3.5 + k, -2.5, '#ff5d8f');
          }
        },
        { shadow: [['r', 1, 13, W, 3]] },
      ),
    );
  },
});

/** Folding chairs stacked on a dolly, waiting for Wednesday. */
reg('chair-cart', {
  solid: { x: -10, y: -6, w: 20, h: 5 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'chair-cart',
        22,
        24,
        () => {
          for (let k = 0; k < 9; k++) {
            const y = 2 + k * 2;
            const c = k % 2 ? '#a8b0d0' : '#9aa2c8';
            R(2, y, 18, 1.4, c);
            H1(2, 20, y, liA(c, 0.4));
            P1(3 + (k % 3), y + 0.5, shA(c, 0.3));
          }
          chrome(1, 0, 1.2, 21);
          chrome(19.8, 0, 1.2, 21);
          R(0, 20, 22, 2, '#4e4870');
          for (const wx of [3, 19]) ell(wx, 22.5, 1.5, 1.5, '#2b2140');
        },
        { shadow: [['r', 0, 21, 22, 3]] },
      ),
    ),
});

/** A card table at the door: the cash box, a roll of tickets, a hand stamp. */
reg('ticket-table', {
  solid: { x: -14, y: -6, w: 28, h: 5 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      iart(
        'ticket-table',
        30,
        16,
        () => {
          for (const lx0 of [2, 26]) R(lx0, 8, 1.5, 8, '#6e688e');
          R(0, 2, 30, 6, '#2f6a52');
          R(0.5, 2.5, 29, 5, (_a, _b, o2) => (o2 && hash2(FX, FY, 551) < 0.08 ? shA(o2, 0.12) : o2));
          H1(0, 30, 2, '#5fa882');
          R(0, 8, 30, 1, '#1e4a3a');
          R(3, 1, 8, 4, '#4e8a5a');
          H1(3, 11, 1, '#7ab88a');
          R(6, 2, 2, 0.8, PAL.gold2);
          ell(16, 3.5, 2.5, 2.5, '#d8434b');
          ell(16, 3.5, 1, 1, '#fbf6ea');
          for (let x = 17.5; x < 24; x += 1.6) R(x, 4.5, 1.4, 1.6, '#d8434b');
          R(25, 1.5, 3, 3, '#4e4870');
          R(25.5, 4, 2, 1, '#c9404c');
          R(4, 9.5, 10, 4, '#fbf6ea');
          tinyC('$3 ADULT', 9, 10, '#3a2c3a');
          tinyC('KIDS FREE', 9, 12, '#c9404c');
        },
        { shadow: [['r', 1, 13, 30, 3]] },
      ),
    ),
});

reg('bingo-board', {
  draw: (ctx, o, t) => {
    const f = frame(t, 2, 1.2, phaseOf(o));
    blit(
      ctx,
      o,
      iart(
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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
  // Drawn each frame under everything (not baked into the 1x ground) so its fine pixels survive.
  sortY: -4096,
  draw: (ctx, o) => {
    const v = variant(o, 3) ^ (o.x % 3);
    blit(
      ctx,
      o,
      iart(
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
      iart(
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
      iart(
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
      iart(
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
      iart(
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
