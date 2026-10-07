/**
 * Interior wall terrains (Golden Hour Storybook), painted at double density
 * (D-018): every 16x16 wall tile is a 32x32 art-pixel sprite. Every wall id
 * is solid.
 *
 * A wall tile works out its role from its neighbours:
 *  - "face" tiles have floor somewhere below them (within 4 tiles). They draw
 *    the wall's front: wallpaper / boards / brick, a crown molding on the top
 *    row, and a chair rail, wainscot and baseboard on the bottom row.
 *  - "cap" tiles (no floor below: side walls, the bottom wall, thick walls)
 *    draw the top of the wall seen from above, a dark frame around the room.
 *
 * Patterns are computed in fine pixels of (wrapped) world space so they run
 * seamlessly across tiles; X wraps every 8 tiles (256 fine px) and Y every 4
 * (128), so every period divides those. Every tile is cached as a dense canvas.
 *
 * Shadows onto the floor: the ground is pre-rendered row by row, so the floor
 * tile below a wall is drawn after it and would cover anything painted there.
 * Wall tiles therefore queue their floor shadow in a microtask that runs right
 * after the synchronous ground pass, on the same canvas and transform.
 */
import { registerTerrain } from '../../world/registry';
import type { NeighborFn, TerrainId } from '../../world/types';
import { AK, type Color, col, dense, dth, GP, hash2, liA, mixc, mkSpr, P1, shA, toCanvas } from '../kit';
import { isFineTarget } from './terrain';

type Edge = 'none' | 'open' | 'void' | 'cap';
type Side = 'wall' | 'open' | 'void';

/** Fine pixels per tile. */
const TS = 32;

interface FaceInfo {
  row: number;
  crown: boolean;
  L: Edge;
  Rt: Edge;
  /** Fine wrapped world coords of the tile's top-left. */
  X0: number;
  Y0: number;
  seed: number;
}

interface Style {
  id: TerrainId;
  seed: number;
  /** Main wall material at a fine wrapped world pixel. */
  paper: (X: number, Y: number, v: number) => Color;
  /** Bottom-row overlay (chair rail, wainscot, baseboard); j is the fine row in the tile. */
  lower: (X: number, j: number, v: number) => Color | null;
  /** Top-row overlay (wall top + crown molding), fine rows 0..crownH-1. */
  crown: (X: number, j: number, v: number) => Color | null;
  crownH: number;
  /** Wall-top colours: base, lit lip, dark lip. */
  cap: [Color, Color, Color];
  /** Texture on the wall top. */
  capTex?: (X: number, Y: number, v: number, base: Color) => Color | null;
  /** Vertical corner trim: lit, dark. */
  trim: [Color, Color];
  deco?: (f: FaceInfo) => void;
}

const isWall = (id: TerrainId) => id.startsWith('wall');
const mod = (a: number, m: number) => ((a % m) + m) % m;
/** Paint / read one fine pixel by fine tile coordinates. */
const F = (i: number, j: number, c: Color) => P1(i / 2, j / 2, c);
const G = (i: number, j: number) => GP(i / 2, j / 2);
const FR = (i: number, j: number, w: number, h: number, c: Color) => {
  for (let y = j; y < j + h; y++) for (let x = i; x < i + w; x++) F(x, y, c);
};

/** Value noise on a lattice that wraps every px by py cells (matches the tile wrap). */
function pnoise(x: number, y: number, px: number, py: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  let u = x - xi;
  let v = y - yi;
  u = u * u * (3 - 2 * u);
  v = v * v * (3 - 2 * v);
  const h = (a: number, b: number) => hash2(mod(a, px), mod(b, py), seed);
  const a = h(xi, yi);
  const b = h(xi + 1, yi);
  const c = h(xi, yi + 1);
  const d = h(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/** Rows of wall below this one before the floor (0 = bottom row of a face), or -1 for caps / non-walls. */
function faceRow(n: NeighborFn, dx: number, dy: number): number {
  if (!isWall(n(dx, dy))) return -1;
  for (let k = 1; k <= 4; k++) {
    const id = n(dx, dy + k);
    if (!isWall(id)) return id === 'void' ? -1 : k - 1;
  }
  return -1;
}

function faceEdge(n: NeighborFn, dx: number): Edge {
  const id = n(dx, 0);
  if (id === 'void') return 'void';
  if (!isWall(id)) return 'open';
  return faceRow(n, dx, 0) >= 0 ? 'none' : 'cap';
}

function capSide(n: NeighborFn, dx: number, dy: number): Side {
  const id = n(dx, dy);
  if (id === 'void') return 'void';
  return isWall(id) ? 'wall' : 'open';
}

// ---------------------------------------------------------------- caching + deferred shadows

const cache = new Map<string, HTMLCanvasElement>();
function tile(key: string, fn: () => void, w = 16, h = 16): HTMLCanvasElement {
  let c = cache.get(key);
  if (!c) {
    c = toCanvas(dense(2, () => mkSpr(w, h, fn)));
    cache.set(key, c);
  }
  return c;
}
/** Box-filtered 1x copies for targets without fine pixels. */
const coarse = new WeakMap<HTMLCanvasElement, HTMLCanvasElement>();
function blit(ctx: CanvasRenderingContext2D, c: HTMLCanvasElement, x: number, y: number): void {
  if (isFineTarget(ctx)) {
    ctx.drawImage(c, x, y);
    return;
  }
  let s = coarse.get(c);
  if (!s) {
    s = document.createElement('canvas');
    s.width = c.width / 2;
    s.height = c.height / 2;
    const sx = s.getContext('2d')!;
    sx.imageSmoothingEnabled = true;
    sx.drawImage(c, 0, 0);
    coarse.set(c, s);
  }
  ctx.drawImage(s, x, y);
}

/** Plum shadow pixel with alpha (buffers are ABGR). */
const SH = (a: number) => ((a << 24) | (0x40 << 16) | (0x21 << 8) | 0x2b) >>> 0;

/** Soft AO cast onto the floor below a wall: 6 world rows, fine dithered. */
const shadowBelow = () =>
  tile(
    'wall-shadow-below',
    () => {
      const rows: [number, number][] = [
        [150, 16], [134, 16], [116, 16], [100, 15], [88, 13], [78, 11], [70, 9], [64, 7], [58, 5], [52, 4], [48, 3], [44, 2],
      ];
      rows.forEach(([a, lvl], j) => {
        for (let i = 0; i < TS; i++) if (dth(i, j, lvl)) F(i, j, SH(a));
      });
    },
    16,
    6,
  );
const shadowRight = () =>
  tile(
    'wall-shadow-right',
    () => {
      const cols: [number, number][] = [
        [130, 16], [112, 15], [96, 13], [84, 10], [72, 7], [62, 5], [54, 3], [48, 2],
      ];
      cols.forEach(([a, lvl], i) => {
        for (let j = 0; j < TS; j++) if (dth(i, j, lvl)) F(i, j, SH(a));
      });
    },
    4,
    16,
  );

let pending: (() => void)[] = [];
function later(ctx: CanvasRenderingContext2D, fn: (c: CanvasRenderingContext2D) => void): void {
  const m = ctx.getTransform();
  pending.push(() => {
    ctx.save();
    ctx.setTransform(m);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    fn(ctx);
    ctx.restore();
  });
  if (pending.length === 1)
    queueMicrotask(() => {
      const list = pending;
      pending = [];
      for (const f of list) f();
    });
}

// ---------------------------------------------------------------- tile painters

function paintFace(st: Style, f: FaceInfo): void {
  const { X0, Y0, row, crown } = f;
  for (let j = 0; j < TS; j++)
    for (let i = 0; i < TS; i++) {
      const X = X0 + i;
      const Y = Y0 + j;
      const v = hash2(X, Y, st.seed);
      let c: Color = st.paper(X, Y, v);
      if (row === 0) {
        const lo = st.lower(X, j, v);
        if (lo != null) c = lo;
      }
      if (crown) {
        if (j < st.crownH) {
          const cr = st.crown(X, j, v);
          if (cr != null) c = cr;
        } else if (j === st.crownH) c = shA(c, 0.24);
        else if (j === st.crownH + 1) c = shA(c, 0.16);
        else if (j === st.crownH + 2 && dth(i, j, 10)) c = shA(c, 0.1);
        else if (j === st.crownH + 3 && dth(i, j, 5)) c = shA(c, 0.07);
      }
      F(i, j, c);
    }
  st.deco?.(f);
  const top = crown ? 4 : 0;
  // left end of the wall: a lit corner bead
  if (f.L === 'open' || f.L === 'void') {
    for (let j = 0; j < TS; j++) {
      F(0, j, f.L === 'void' ? AK : st.cap[0]);
      F(1, j, f.L === 'void' ? AK : shA(st.cap[0], 0.2));
    }
    for (let j = top; j < TS; j++) {
      F(2, j, liA(st.trim[0], 0.2));
      F(3, j, st.trim[0]);
      F(4, j, shA(G(4, j), 0.12));
    }
  } else if (f.L === 'cap') {
    const ks = [0.3, 0.22, 0.15, 0.1, 0.06];
    for (let j = 0; j < TS; j++) ks.forEach((k, i) => (i < 3 || dth(i, j, 8)) && F(i, j, shA(G(i, j), k)));
  }
  // right end (away from the light)
  if (f.Rt === 'open' || f.Rt === 'void') {
    for (let j = 0; j < TS; j++) {
      F(31, j, f.Rt === 'void' ? AK : st.cap[2]);
      F(30, j, f.Rt === 'void' ? AK : st.cap[2]);
    }
    for (let j = top; j < TS; j++) {
      F(29, j, st.trim[1]);
      F(28, j, liA(st.trim[1], 0.1));
      F(27, j, shA(G(27, j), 0.1));
    }
  } else if (f.Rt === 'cap') {
    const ks = [0.34, 0.24, 0.16, 0.08];
    for (let j = 0; j < TS; j++) ks.forEach((k, i) => (i < 3 || dth(i, j, 8)) && F(31 - i, j, shA(G(31 - i, j), k)));
  }
}

function paintCap(st: Style, X0: number, Y0: number, up: Side, down: Side, left: Side, right: Side): void {
  const [base, lit, dark] = st.cap;
  for (let j = 0; j < TS; j++)
    for (let i = 0; i < TS; i++) {
      const X = X0 + i;
      const Y = Y0 + j;
      const v = hash2(X, Y, st.seed + 7);
      let c: Color = base;
      const t = st.capTex?.(X, Y, v, base);
      if (t != null) c = t;
      else if (v < 0.05) c = shA(base, 0.12);
      else if (v > 0.965) c = liA(base, 0.1);
      // soft tonal drift on the wall top
      if (pnoise(X / 16, Y / 16, 16, 8, st.seed) > 0.68 && dth(i, j, 8)) c = shA(c, 0.08);
      F(i, j, c);
    }
  // lips where the wall top meets the room
  if (up === 'open') {
    for (let i = 0; i < TS; i++) {
      F(i, 0, liA(lit, 0.2));
      F(i, 1, lit);
      F(i, 2, liA(base, 0.1));
    }
  } else if (up === 'void') for (let i = 0; i < TS; i++) F(i, 0, AK);
  if (left === 'open') {
    for (let j = 0; j < TS; j++) {
      F(0, j, liA(lit, 0.15));
      F(1, j, lit);
    }
  } else if (left === 'void') for (let j = 0; j < TS; j++) F(0, j, AK);
  if (right === 'open') {
    for (let j = 0; j < TS; j++) {
      F(31, j, shA(dark, 0.1));
      F(30, j, dark);
      F(29, j, shA(base, 0.12));
    }
  } else if (right === 'void') for (let j = 0; j < TS; j++) F(31, j, AK);
  if (down === 'open') {
    // the end of a wall run: show a sliver of its face + baseboard
    for (let i = 0; i < TS; i++) {
      F(i, 18, liA(lit, 0.2));
      F(i, 19, lit);
    }
    for (let j = 20; j < TS; j++)
      for (let i = 0; i < TS; i++) {
        const X = X0 + i;
        const v = hash2(X, Y0 + j, st.seed);
        let c: Color = st.paper(X, Y0 + j, v);
        if (j >= 25) c = st.lower(X, j, v) ?? c;
        if (j === 20) c = shA(c, 0.24);
        else if (j === 21) c = shA(c, 0.12);
        F(i, j, c);
      }
    if (left !== 'wall') for (let j = 18; j < TS; j++) F(0, j, left === 'void' ? AK : base);
    if (right !== 'wall') for (let j = 18; j < TS; j++) F(31, j, right === 'void' ? AK : dark);
  } else if (down === 'void') for (let i = 0; i < TS; i++) F(i, 31, AK);
}

function makeDraw(st: Style) {
  return (ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, n: NeighborFn) => {
    const sx = mod(tx, 8);
    const sy = mod(ty, 4);
    const row = faceRow(n, 0, 0);
    if (row >= 0) {
      const f: FaceInfo = { row, crown: faceRow(n, 0, -1) < 0, L: faceEdge(n, -1), Rt: faceEdge(n, 1), X0: sx * TS, Y0: sy * TS, seed: Math.floor(hash2(tx, ty, 91) * 4) & 3 };
      const key = `${st.id}|f${row}${f.crown ? 'c' : ''}${f.L}${f.Rt}|${sx},${sy},${f.seed}`;
      blit(ctx, tile(key, () => paintFace(st, f)), x, y);
      if (row === 0) later(ctx, (c) => blit(c, shadowBelow(), x, y + 16));
    } else {
      const up = capSide(n, 0, -1);
      const down = capSide(n, 0, 1);
      const left = capSide(n, -1, 0);
      const right = capSide(n, 1, 0);
      const key = `${st.id}|c${up}${down}${left}${right}|${sx},${sy}`;
      blit(ctx, tile(key, () => paintCap(st, sx * TS, sy * TS, up, down, left, right)), x, y);
      if (right === 'open') later(ctx, (c) => blit(c, shadowRight(), x + 16, y));
      if (down === 'open') later(ctx, (c) => blit(c, shadowBelow(), x, y + 16));
    }
  };
}

// ---------------------------------------------------------------- shared trim builders

interface RailPal { hi: Color; body: Color; lo: Color; under: Color }
interface BasePal { hi: Color; bead: Color; body: Color; lo: Color; floor: Color }
/** Chair rail rows 6..11 (null elsewhere). */
function rail(j: number, p: RailPal, X: number): Color | null {
  if (j === 6) return liA(p.hi, 0.25);
  if (j === 7) return p.hi;
  if (j === 8 || j === 9) return mod(X, 64) === 0 ? shA(p.body, 0.15) : p.body;
  if (j === 10) return p.lo;
  if (j === 11) return p.under;
  return null;
}
/** Baseboard rows 25..31 with scuffs and a dark contact line. */
function baseboard(j: number, p: BasePal, X: number, v: number): Color | null {
  if (j === 25) return p.hi;
  if (j === 26) return p.bead;
  if (j === 31) return p.floor;
  if (j >= 27) {
    // shoe scuffs low on the board
    if (j >= 28 && hash2(X >> 2, j >> 1, 77) < 0.06) return shA(p.body, 0.2);
    if (j === 30) return p.lo;
    return v < 0.04 ? shA(p.body, 0.08) : v > 0.97 ? liA(p.body, 0.12) : p.body;
  }
  return null;
}
interface CrownPal { lip: Color; cap: Color; capD: Color; hi: Color; body: Color; dentL: Color; dentD: Color; under: Color }
/** Wall top band (rows 0..3) and a crown molding with dentils (rows 4..9). */
function crownOf(p: CrownPal, dent = 6) {
  return (X: number, j: number, v: number): Color | null => {
    if (j === 0) return p.lip;
    if (j === 1 || j === 2) return v < 0.06 ? shA(p.cap, 0.1) : p.cap;
    if (j === 3) return p.capD;
    if (j === 4) return liA(p.hi, 0.2);
    if (j === 5) return p.hi;
    if (j === 6 || j === 7) {
      const d = mod(X, dent);
      return d === 0 ? p.dentD : d === 1 ? liA(p.dentL, 0.2) : j === 7 && d === dent - 1 ? shA(p.dentL, 0.1) : p.dentL;
    }
    if (j === 8) return p.body;
    if (j === 9) return p.under;
    return null;
  };
}

/** Raised panel wainscot rows 12..24 (32-px panels). */
function panel(X: number, j: number, v: number, c: { base: Color; lit: Color; dark: Color; groove: Color; frame: Color; under: Color }): Color {
  const xm = mod(X, 32);
  if (j === 12) return c.under;
  if (xm === 0) return c.groove;
  if (xm === 1) return liA(c.frame, 0.2);
  if (xm >= 4 && xm <= 28 && j >= 14 && j <= 23) {
    if (j === 14 || xm === 4) return c.lit;
    if (j === 23 || xm === 28) return c.dark;
    if (j === 15 || xm === 5) return liA(c.base, 0.12);
    if (j === 22 || xm === 27) return shA(c.base, 0.08);
    // a soft vertical sheen on the field
    if (mod(xm - 9, 32) < 2 && dth(X, j, 8)) return liA(c.base, 0.1);
    return v < 0.05 ? shA(c.base, 0.06) : c.base;
  }
  if (j === 24) return shA(c.frame, 0.12);
  return c.frame;
}
/** Beadboard wainscot rows 12..24. */
function beadboard(X: number, j: number, v: number, c: { base: Color; groove: Color; lit: Color; top: Color }): Color {
  if (j === 12) return c.top;
  const m = mod(X, 6);
  if (m === 0) return c.groove;
  if (m === 1) return c.lit;
  if (m === 5 && dth(X, j, 8)) return shA(c.base, 0.06);
  if (j >= 22 && dth(X, j, (j - 21) * 3)) return shA(c.base, 0.06);
  return v < 0.04 ? shA(c.base, 0.05) : c.base;
}
/** A small motif stamp tiled on a half-drop grid; returns the char at a pixel. */
function motif(X: number, Y: number, rows: string[], per: number, ox: number, oy: number): string {
  for (const [ax, ay] of [[ox, oy], [ox + per / 2, oy + per / 2]]) {
    const dx = mod(X - ax, per);
    const dy = mod(Y - ay, per);
    if (dy < rows.length && dx < rows[dy].length) {
      const ch = rows[dy][dx];
      if (ch !== '.') return ch;
    }
  }
  return '.';
}

// ---------------------------------------------------------------- styles

const SPRIG = ['..pP...', '.pcPp..', '..pd...', '...s.l.', '.l.sL..', '..Ls...'];

const CREAM: Style = {
  id: 'wall',
  seed: 11,
  paper: (X, Y, v) => {
    const m = motif(X, Y, SPRIG, 32, 6, 5);
    if (m === 'c') return '#d9967c';
    if (m === 'p') return '#f0c6a0';
    if (m === 'P' || m === 'd') return '#dca486';
    if (m === 's') return '#a4ae80';
    if (m === 'l') return '#b8c48e';
    if (m === 'L') return '#94a274';
    // fine pinstripes and an aged, slightly stained paper
    const xm = mod(X, 16);
    let c: Color = xm === 0 ? '#ead3ab' : xm === 1 ? '#efdcb8' : xm === 8 ? '#f8eacc' : '#f3e2c0';
    if (pnoise(X / 32, Y / 16, 8, 8, 12) > 0.66 && dth(X, Y, 7)) c = '#ead5b0';
    if (v < 0.035) return '#ecd7b2';
    if (v > 0.985) return '#fbf0d8';
    return c;
  },
  lower: (X, j, v) => {
    if (j <= 5) return null;
    const r = rail(j, { hi: '#fff6e2', body: '#ecd6ac', lo: '#c4a282', under: '#9c7c6c' }, X);
    if (r) return r;
    if (j <= 24) return panel(X, j, v, { base: '#7cb4a2', lit: '#aed8c2', dark: '#4f8584', groove: '#3f6a70', frame: '#69a194', under: '#4f8784' });
    return baseboard(j, { hi: '#fff4dc', bead: '#d8bc94', body: '#eed6ae', lo: '#c8a882', floor: '#8a6a60' }, X, v);
  },
  crown: crownOf({ lip: '#86636e', cap: '#5e4252', capD: '#3e2a40', hi: '#fff4dc', body: '#d8b890', dentL: '#eed7ae', dentD: '#b08a6c', under: '#b8946e' }),
  crownH: 10,
  cap: ['#5e4252', '#86636e', '#3e2a40'],
  capTex: (X, Y, v, base) => (mod(X + (mod(Y >> 4, 2) ? 16 : 0), 32) === 0 && mod(Y, 16) < 15 ? shA(base, 0.1) : mod(Y, 16) === 15 ? shA(base, 0.14) : v < 0.05 ? liA(base, 0.06) : null),
  trim: ['#fff4dc', '#c8a482'],
};

/** Vertical board colour at a fine pixel (shared by the wood face and its cap ends). */
function woodBoard(X: number, Y: number, v: number): Color {
  const xm = mod(X, 16);
  const board = Math.floor(X / 16);
  const tone = hash2(mod(board, 16), 3, 23);
  const base = tone < 0.33 ? '#a86c46' : tone < 0.66 ? '#b0744a' : '#9e6442';
  if (xm === 0) return '#4e3030';
  if (xm === 1) return '#6e4236';
  if (xm === 2) return '#c8925e';
  if (xm === 15) return '#86523e';
  // a knot now and then, with grain bending around it
  const seg = Math.floor(Y / 32);
  const kn = hash2(mod(board, 16), mod(seg, 4), 25);
  let bend = 0;
  if (kn < 0.16) {
    const kx = 6 + Math.floor(kn * 30);
    const ky = 8 + (Math.floor(kn * 997) % 16);
    const dx = (xm - kx) / 2.2;
    const dy = (mod(Y, 32) - ky) / 3.6;
    const e = dx * dx + dy * dy;
    if (e <= 0.35) return '#5a3434';
    if (e <= 1) return e < 0.6 ? '#7a4a38' : dy < 0 && dx < 0 ? liA(base, 0.12) : shA(base, 0.2);
    bend = (dx < 0 ? -1 : 1) * 2.4 * Math.exp(-e * 0.5);
  }
  // grain lines running down the board, gently wavy
  const g = Math.sin((xm + bend + pnoise(board * 2, Y / 8, 32, 16, 24) * 4) * 1.55 + tone * 7);
  if (g > 0.86) return shA(base, 0.16);
  if (g < -0.88) return liA(base, 0.09);
  // nail heads near the top and bottom of each run
  if (xm === 8 && mod(Y, 64) === 5) return '#3e2630';
  if (xm === 9 && mod(Y, 64) === 5) return '#c08a5a';
  // varnish sheen
  if (mod(X - 40, 128) < 6 && dth(X, Y, 6)) return liA(base, 0.14);
  return v < 0.03 ? shA(base, 0.08) : base;
}

const WOOD: Style = {
  id: 'wall-wood',
  seed: 23,
  paper: woodBoard,
  lower: (X, j, v) => {
    if (j <= 5) return null;
    const r = rail(j, { hi: '#e8b67a', body: '#b0744a', lo: '#7a4a38', under: '#4e3034' }, X);
    if (r) return r;
    if (j <= 24) {
      // horizontal walnut planks with butt joints and grain
      const pl = j < 18 ? 0 : 1;
      const pj = j - (pl ? 18 : 12);
      const base = pl ? '#7c4c3a' : '#88543e';
      if (pj === 0) return pl ? '#4a2c32' : '#5a3634';
      if (pj === 1) return '#a06850';
      if (pj === 6) return shA(base, 0.16);
      const jx = mod(X + (pl ? 21 : 3), 48);
      if (jx === 0) return '#4a2c32';
      if (jx === 1) return liA(base, 0.14);
      const g = Math.sin(X * 0.21 + pj * 1.9 + pnoise(X / 8, pl * 7, 32, 14, 26) * 6);
      if (g > 0.9) return shA(base, 0.14);
      return v < 0.06 ? shA(base, 0.1) : base;
    }
    return baseboard(j, { hi: '#d49c66', bead: '#8a5640', body: '#6e4234', lo: '#56343a', floor: '#3a2232' }, X, v);
  },
  crown: crownOf({ lip: '#74504a', cap: '#4f3238', capD: '#33202e', hi: '#e8b67a', body: '#8a5640', dentL: '#b07448', dentD: '#5e3a36', under: '#6a4034' }),
  crownH: 10,
  cap: ['#4f3238', '#74504a', '#33202e'],
  capTex: (X, Y, v, base) => (mod(Y, 10) === 0 ? shA(base, 0.2) : mod(Y, 10) === 1 ? liA(base, 0.06) : mod(X + Math.floor(Y / 10) * 13, 40) === 0 ? shA(base, 0.16) : v < 0.06 ? liA(base, 0.08) : null),
  trim: ['#d29a66', '#6a4034'],
};

const BRICK_TONES = ['#94403f', '#c05c4a', '#b24f46', '#b24f46', '#a8584e', '#d27a5c', '#b8564a', '#9e4844'];
/** Running-bond brick at a fine pixel: 16x8 fine bricks, recessed mortar, chips and soot. */
function brickColor(X: number, Y: number, v: number, seed: number): Color {
  const row = Y >> 3;
  const yr = Y & 7;
  const off = row & 1 ? 8 : 0;
  const bx = (X + off) >> 4;
  const xr = (X + off) & 15;
  const id = mod(bx, 16) * 31 + mod(row, 16);
  // mortar: in shadow right under each brick, paler in the head joints
  if (yr === 7) return v < 0.25 ? '#a4887e' : '#b49888';
  if (xr === 15) return v < 0.2 ? '#bca090' : '#ccb09e';
  const r = hash2(id, 1, seed);
  let c: Color = BRICK_TONES[Math.floor(r * BRICK_TONES.length)];
  // a chipped corner showing mortar and a shadowed break
  const ch = hash2(id, 2, seed);
  if (ch < 0.14) {
    const cx = ch < 0.07 ? 0 : 14;
    const d = Math.abs(xr - cx) + yr;
    if (d < 2) return '#ccb09e';
    if (d === 2) return shA(c, 0.3);
  }
  // fired-clay texture: blotches, pores and a soft vertical gradient
  const bl = pnoise(X / 4, Y / 4, 64, 32, seed + id);
  if (bl > 0.7) c = shA(c, 0.12);
  else if (bl < 0.22) c = liA(c, 0.08);
  if (yr === 0) c = liA(c, 0.2);
  else if (xr === 0) c = liA(c, 0.1);
  else if (yr === 6) c = shA(c, 0.2);
  else if (xr === 14) c = shA(c, 0.12);
  if (v < 0.06) c = shA(c, 0.16);
  else if (v > 0.97) c = liA(c, 0.16);
  return c;
}

const BRICK: Style = {
  id: 'wall-brick',
  seed: 37,
  paper: (X, Y, v) => {
    let c = brickColor(X, Y, v, 37);
    // soot and age drifting across the wall
    if (pnoise(X / 32, Y / 16, 8, 8, 38) > 0.64 && dth(X, Y, 6)) c = shA(c, 0.1);
    return c;
  },
  lower: (X, j, v) => {
    if (j < 14) return null;
    if (j < 24) {
      // grime and pale efflorescence rising from the floor
      const c = brickColor(X, j + 96, v, 37);
      const e = pnoise(X / 8, j / 4, 32, 8, 39);
      if (j > 17 && e > 0.62 && dth(X, j, (j - 15) * 2)) return mixc(c, '#e8dcd2', 0.4);
      return dth(X, j, (j - 13) * 1.4) ? shA(c, 0.14) : c;
    }
    // concrete plinth
    if (j === 24) return '#e2d2ca';
    if (j === 25) return '#c6b4b0';
    if (j === 31) return '#5e4a5c';
    if (j === 30) return '#7e6a7a';
    if (hash2(X >> 2, j, 40) < 0.05) return '#8a7884';
    return v < 0.1 ? '#968490' : v > 0.93 ? '#bcaab0' : '#a8969e';
  },
  crown: (X, j, v) => {
    // a steel lintel with rivets under the wall top
    if (j === 0) return '#7e4e52';
    if (j <= 2) return v < 0.08 ? '#4a2c38' : '#583440';
    if (j === 3) return '#2b2440';
    if (j === 4) return '#b4b4d0';
    if (j === 5) return '#8a8aae';
    if (j === 6 || j === 7) {
      const r = mod(X, 16);
      if (r === 8) return j === 6 ? '#e4e4f4' : '#4a4668';
      if (r === 9) return '#5e5a80';
      return j === 6 ? '#74749a' : '#6a6a90';
    }
    if (j === 8) return '#504c70';
    if (j === 9) return '#3a3656';
    return null;
  },
  crownH: 10,
  cap: ['#583440', '#7e4e52', '#38222e'],
  capTex: (X, Y, v, base) => ((Y & 7) === 7 || ((X + ((Y >> 3) & 1 ? 8 : 0)) & 15) === 15 ? shA(base, 0.22) : (Y & 7) === 0 ? liA(base, 0.08) : v < 0.08 ? liA(base, 0.06) : null),
  trim: ['#d6b6a0', '#7a3c42'],
  deco: (f) => {
    // an old iron anchor plate bleeding a rust streak down the brick
    const k = hash2(f.X0, f.Y0 + f.seed, 41);
    if (k < 0.14 && !(f.row === 0 && f.crown)) {
      const ax = 6 + Math.floor(k * 60);
      const ay = f.crown ? 13 : 4;
      FR(ax, ay, 4, 3, '#4a3e52');
      F(ax, ay, '#8a7e96');
      F(ax + 3, ay + 2, '#2e2638');
      F(ax + 1, ay + 1, '#6a5e78');
      const len = Math.min(8 + Math.floor(k * 40), (f.row === 0 ? 13 : TS) - ay - 3);
      for (let y = ay + 3; y < ay + 3 + len; y++) {
        const fade = (y - ay - 3) / len;
        for (let i = 0; i < 3; i++) {
          const x = ax + i + (y > ay + 8 && i === 2 ? 1 : 0);
          if (dth(x, y, Math.round(15 - fade * 13 - (i === 1 ? 0 : 5)))) F(x, y, mixc(G(x, y), i === 1 ? col('#6e3a2c') : col('#c8844a'), i === 1 ? 0.7 : 0.5));
        }
      }
    }
  },
};

const PANEL: Style = {
  id: 'wall-panel',
  seed: 41,
  paper: (X, Y, v) => {
    const row = Y >> 4;
    const yr = Y & 15;
    const off = row & 1 ? 16 : 0;
    const xr = (X + off) & 31;
    if (yr === 15 || xr === 31) return '#262c48';
    if (yr === 14 || xr === 30) return '#323b58';
    // rivets in each panel's corners
    if ((xr === 2 || xr === 28) && (yr === 2 || yr === 12)) return '#7a88ae';
    if ((xr === 3 || xr === 29) && (yr === 3 || yr === 13)) return '#262c48';
    let c: Color = '#3f4d6e';
    if (yr === 0) c = '#5a6890';
    else if (yr === 1) c = '#4c5a80';
    else if (xr === 0) c = '#4b5980';
    else if (yr === 13) c = '#38445f';
    // dents and scuffs in the paint
    const s = pnoise(X / 8, Y / 8, 32, 16, 42);
    if (s > 0.74) c = shA(c, 0.1);
    else if (s < 0.18 && dth(X, Y, 6)) c = liA(c, 0.08);
    if (v < 0.05) c = '#46557a';
    else if (v > 0.985) c = '#303b58';
    return c;
  },
  lower: (X, j, v) => {
    if (j <= 3) return null;
    // the gym's painted stripe band
    if (j === 4) return '#c88a2a';
    if (j <= 6) return '#f4b63f';
    if (j <= 8) return '#ee6a5a';
    if (j <= 13) return v < 0.04 ? '#c83a46' : hash2(X >> 3, 9, 43) < 0.08 && j > 10 && dth(X, j, 6) ? '#b83442' : '#d8434b';
    if (j <= 15) return '#a7384c';
    if (j <= 17) return '#f4b63f';
    if (j <= 19) return '#8a6a3a';
    if (j <= 24) return null;
    // a scuffed kick plate
    if (j === 25) return '#6e6890';
    if (j <= 27) return hash2(X >> 2, j, 44) < 0.1 ? '#3a3452' : '#4a4462';
    if (j <= 29) return '#342e4a';
    if (j === 30) return '#2a2440';
    return AK;
  },
  crown: (X, j) => {
    if (j === 0) return '#4a5070';
    if (j <= 2) return '#2c3046';
    if (j === 3) return '#1f2236';
    if (j === 4) return '#8a94b2';
    if (j === 5) return '#566082';
    // conduit pipe with brackets
    const br = mod(X, 64);
    const brk = br < 4;
    if (j === 6) return brk ? '#4a5070' : '#3a4060';
    if (j === 7) return brk ? '#5a6080' : '#f0f2fc';
    if (j === 8) return brk ? '#3a3f58' : '#d8dcf0';
    if (j === 9 || j === 10) return brk ? (br === 1 && j === 9 ? '#9aa2c8' : '#3a3f58') : '#9aa2c8';
    if (j === 11) return brk ? '#2a2e44' : '#6a72a0';
    if (j === 12) return '#2e3450';
    return '#36405e';
  },
  crownH: 14,
  cap: ['#2c3046', '#4a5070', '#1e2034'],
  capTex: (X, Y, v, base) => ((Y & 15) === 15 || ((X + ((Y >> 4) & 1 ? 16 : 0)) & 31) === 31 ? shA(base, 0.22) : (Y & 15) === 0 ? liA(base, 0.1) : v < 0.06 ? liA(base, 0.1) : null),
  trim: ['#6a7698', '#262a40'],
  deco: (f) => {
    // rust weeping from a few rivets
    for (let j = 0; j < TS; j++)
      for (let i = 0; i < TS; i++) {
        const X = f.X0 + i;
        const Y = f.Y0 + j;
        const yr = Y & 15;
        const xr = (X + ((Y >> 4) & 1 ? 16 : 0)) & 31;
        if (!((xr === 2 || xr === 28) && (yr === 2 || yr === 12))) continue;
        if (hash2(X, Y + f.seed, 46) > 0.22) continue;
        const len = Math.min(4 + Math.floor(hash2(X, Y, 47) * 10), TS - 1 - j);
        for (let d = 1; d <= len; d++) {
          const lvl = Math.round(14 - (d / len) * 12);
          if (dth(i, j + d, lvl)) F(i, j + d, mixc(G(i, j + d), col('#b8683a'), 0.7));
          if (d > 2 && dth(i + 1, j + d, lvl - 6)) F(i + 1, j + d, mixc(G(i + 1, j + d), col('#8a5040'), 0.45));
        }
      }
  },
};

const ROSE = ['.rR.', 'rhrR', 'RrRd', '.dd.', 'l..L'];
const PINK: Style = {
  id: 'wall-pink',
  seed: 53,
  paper: (X, Y, v) => {
    const m = motif(X, Y, ROSE, 32, 9, 9);
    if (m === 'h') return '#f6a6bc';
    if (m === 'r') return '#e8789a';
    if (m === 'R') return '#c8406a';
    if (m === 'd') return '#a8345a';
    if (m === 'l') return '#7aa078';
    if (m === 'L') return '#5e8462';
    const xm = mod(X, 16);
    if (xm <= 3) return v < 0.05 ? '#f6cccc' : '#fadada';
    if (xm === 4) return '#eaa4b0';
    if (xm === 15) return '#f0b2bc';
    if (v < 0.04) return '#f0b0bc';
    return '#f4bac4';
  },
  lower: (X, j, v) => {
    if (j <= 5) return null;
    const r = rail(j, { hi: '#fff6ee', body: '#f0d4d2', lo: '#c08c98', under: '#a8707e' }, X);
    if (r) return r;
    if (j <= 24) return beadboard(X, j, v, { base: '#fbe9e4', groove: '#e0bcbe', lit: '#fff6f2', top: '#d6aab2' });
    return baseboard(j, { hi: '#fff4ee', bead: '#e2bcc0', body: '#f2d6d6', lo: '#d0a8b0', floor: '#8a5a6e' }, X, v);
  },
  crown: (X, j, v) => {
    if (j <= 3) return crownOf({ lip: '#94607c', cap: '#6a3a58', capD: '#46263e', hi: '#fff6ee', body: '#f4dad6', dentL: '#f4dad6', dentD: '#d8b0b4', under: '#e8c4c4' })(X, j, v);
    if (j === 4) return '#fffaf4';
    if (j === 5) return '#fff6ee';
    if (j === 6) return '#f4dad6';
    // a scalloped lace border
    const xm = mod(X, 8);
    if (j === 7) return '#f4dad6';
    if (j === 8) return xm >= 1 && xm <= 6 ? '#ecc8c8' : null;
    if (j === 9) return xm >= 2 && xm <= 5 ? '#e0b4b8' : null;
    return null;
  },
  crownH: 10,
  cap: ['#6a3a58', '#94607c', '#46263e'],
  trim: ['#fff6ee', '#c08c98'],
};

const BLUE: Style = {
  id: 'wall-blue',
  seed: 67,
  paper: (X, Y, v) => {
    // a fine trellis with little blossoms where it crosses
    const a = mod(X + Y, 32);
    const b = mod(X - Y, 32);
    if ((a === 0 && b === 0) || (a === 16 && b === 16)) return '#ee98a6';
    if ((a <= 1 && b <= 1) || (a >= 15 && a <= 17 && b >= 15 && b <= 17)) return '#f6ecd8';
    if (a === 0 || b === 0) return '#8296c0';
    if (a === 1 || b === 1) return '#a0b2d6';
    if (a === 2 && b === 2) return '#6f9a8a';
    if (v > 0.97) return '#a2b4d8';
    if (v < 0.04) return '#8aa0c8';
    return '#93a8cf';
  },
  lower: (X, j, v) => {
    if (j <= 5) return null;
    const r = rail(j, { hi: '#e0aa74', body: '#b07850', lo: '#7a4c40', under: '#5a3a48' }, X);
    if (r) return r;
    if (j <= 24) return beadboard(X, j, v, { base: '#f4e8d0', groove: '#d8c6a4', lit: '#fffaea', top: '#c8b89a' });
    return baseboard(j, { hi: '#fff4dc', bead: '#d4c2a4', body: '#e8dac0', lo: '#c8b498', floor: '#7a6a72' }, X, v);
  },
  crown: crownOf({ lip: '#62648a', cap: '#3e3e62', capD: '#2a2a48', hi: '#f6ecd8', body: '#d8ccb6', dentL: '#e8dcc4', dentD: '#a49a94', under: '#9a96b0' }, 4),
  crownH: 10,
  cap: ['#3e3e62', '#62648a', '#2a2a48'],
  trim: ['#f6ecd8', '#6a7aa8'],
};

function stoneTone(X: number, Y: number, seed: number): { tone: Color; xr: number; yr: number; bx: number; row: number } {
  const row = Y >> 4;
  const yr = Y & 15;
  const off = row & 1 ? 16 : 6;
  const bx = (X + off) >> 5;
  const xr = (X + off) & 31;
  const r = hash2(mod(bx, 8), mod(row, 8), seed);
  const tone = r < 0.25 ? '#5a5670' : r < 0.5 ? '#625c78' : r < 0.75 ? '#524e68' : '#6a6680';
  return { tone, xr, yr, bx, row };
}

const DUNGEON: Style = {
  id: 'wall-dungeon',
  seed: 79,
  paper: (X, Y, v) => {
    const s = stoneTone(X, Y, 79);
    const { xr, yr } = s;
    if (yr >= 14 || xr >= 30) {
      // deep mortar, with moss creeping along it
      if (hash2(X >> 2, Y >> 1, 80) < 0.3) return v < 0.5 ? '#4e7a52' : '#3e6248';
      return yr === 14 || xr === 30 ? '#2e2a40' : '#24202f';
    }
    const corner = (xr <= 1 || xr >= 28) && (yr <= 1 || yr >= 12);
    if (corner && (xr === 0 || xr === 29 || yr === 0 || yr === 13)) return '#3a3550';
    let c: Color = s.tone;
    // moss on the top face of each block
    if (yr <= 1) c = hash2(X >> 1, Y, 81) < 0.4 ? (yr === 0 ? '#7aa860' : '#5e8a52') : liA(s.tone, 0.18);
    else if (xr <= 1) c = liA(s.tone, 0.1);
    else if (yr >= 12) c = shA(s.tone, yr === 13 ? 0.28 : 0.16);
    else if (xr >= 28) c = shA(s.tone, 0.14);
    // pitted face
    const pit = pnoise(X / 4, Y / 4, 64, 32, 82 + mod(s.bx, 8));
    if (pit > 0.72) c = shA(c, 0.14);
    else if (pit < 0.2) c = liA(c, 0.07);
    // hairline crack on some stones
    const cr = hash2(mod(s.bx, 8), mod(s.row, 8), 82);
    if (cr < 0.24 && yr > 1 && yr < 12 && xr === 8 + (Math.floor(cr * 60) % 14) + (yr >> 2)) c = '#2e2a40';
    if (v < 0.06) c = shA(c, 0.12);
    else if (v > 0.97) c = liA(c, 0.12);
    return c;
  },
  lower: (X, j, v) => {
    if (j < 20) return null;
    if (j === 31) return v < 0.3 ? '#2e5a4a' : '#1e2a32';
    if (j === 30) return '#24323a';
    // moss rising from the damp floor
    const m = hash2(X, j, 83);
    if (m < (j - 19) * 0.08) return m < 0.05 ? '#9ac870' : m < 0.2 ? '#6f9a5a' : '#4e7a52';
    return null;
  },
  crown: (X, j, v) => {
    if (j === 0) return '#45405a';
    if (j <= 2) return '#2a2636';
    if (j === 3) return '#1a1824';
    if (j === 4) return v < 0.18 ? '#5e5a72' : '#8a86a0';
    if (j === 5) return v < 0.18 ? '#4e4a62' : '#6e6a86';
    if (j <= 7) return hash2(X >> 1, 6, 84) < 0.45 ? (j === 6 ? '#7aa860' : '#5e8a52') : '#5a5670';
    return hash2(X >> 1, j, 84) < 0.3 ? '#4e7a52' : null;
  },
  crownH: 10,
  cap: ['#2a2734', '#45405a', '#1a1824'],
  capTex: (X, Y, v, base) => {
    const m = pnoise(X / 8, Y / 8, 32, 16, 85);
    if (m > 0.66 && hash2(X >> 1, Y >> 1, 89) < 0.75) return v < 0.4 ? '#34503e' : '#3e6248';
    if ((Y & 15) >= 15 || ((X + ((Y >> 4) & 1 ? 16 : 6)) & 31) >= 31) return shA(base, 0.25);
    return null;
  },
  trim: ['#7a7690', '#2e2a40'],
  deco: (f) => {
    const k = hash2(f.X0, f.Y0 + f.seed, 86);
    if (f.crown) {
      // ivy and moss trailing down from the top lip, leaf by leaf
      for (let i = 2; i < 30; i++) {
        const d = hash2(f.X0 + i, f.Y0, 87);
        if (d > 0.2) continue;
        const len = 3 + Math.floor(d * 70);
        let x = i;
        for (let y = 9; y < Math.min(TS, 9 + len); y++) {
          F(x, y, '#3e6248');
          if (hash2(x, y, 88) < 0.35) {
            const side = hash2(y, x, 89) < 0.5 ? -1 : 1;
            F(x + side, y, '#6f9a5a');
            F(x + side, y - 1, '#9ac870');
          }
          if (hash2(x, y, 90) < 0.2) x += hash2(y, i, 92) < 0.5 ? -1 : 1;
        }
        if (d < 0.05) F(x, Math.min(TS - 1, 9 + len), '#9dffc8');
      }
      // cobwebs in the corners where the wall ends
      const web = (cx: number, dir: number) => {
        const W1 = '#d0ccdf';
        const W2 = '#9a96b4';
        for (let t = 0; t < 13; t++) {
          F(cx + dir * t, 4, W2);
          F(cx, 4 + t, W2);
          if (t < 10) F(cx + dir * t, 4 + t, W1);
        }
        // sagging threads between the spokes
        for (const r of [4, 7, 10]) {
          for (let a = 0; a <= r; a++) {
            const sag = Math.round(Math.sin((a / r) * Math.PI) * 1.2);
            F(cx + dir * (r - a + sag), 4 + a + sag, W1);
          }
        }
      };
      if (f.L !== 'none') web(2, 1);
      if (f.Rt !== 'none') web(29, -1);
    }
    // a faintly glowing crack (the Dungeon is alive)
    if (k < 0.2 && !f.crown) {
      let x = 6 + Math.floor(k * 80);
      for (let y = 5; y < 24; y++) {
        F(x, y, '#1e3a32');
        if (y > 8 && y < 20) {
          F(x, y, y % 5 === 0 ? '#e0fff0' : '#8dffc0');
          F(x + 1, y, '#3a7a62');
        }
        x += hash2(x, y, 88) < 0.4 ? 1 : hash2(y, x, 93) < 0.2 ? -1 : 0;
      }
    }
    // a little glowing mushroom at the foot of the wall
    if (f.row === 0 && k > 0.6 && k < 0.85) {
      const mx = 4 + Math.floor((k - 0.6) * 88);
      FR(mx + 2, 24, 2, 5, '#e0d8c8');
      F(mx + 3, 25, '#b8b0a4');
      FR(mx, 22, 6, 2, '#7fe8a8');
      FR(mx + 1, 21, 4, 1, '#a8f4c4');
      F(mx + 2, 21, '#e0fff0');
      FR(mx, 23, 6, 1, '#4ab884');
    }
    // an ammonite fossil set into the stone (old, curious, harmless)
    if (f.row === 1 && k > 0.93) {
      const cx = 14;
      const cy = 12;
      for (let a = 0; a < 26; a++) {
        const t = a * 0.42;
        const r = 0.6 + t * 0.62;
        F(Math.round(cx + Math.cos(t) * r), Math.round(cy + Math.sin(t) * r), a % 3 === 0 ? '#c8c0b0' : '#a49c94');
      }
      F(cx, cy, '#e8e0cc');
    }
  },
};

for (const st of [CREAM, WOOD, BRICK, PANEL, PINK, BLUE, DUNGEON]) registerTerrain(st.id, { solid: true, step: 'hard', draw: makeDraw(st) });
