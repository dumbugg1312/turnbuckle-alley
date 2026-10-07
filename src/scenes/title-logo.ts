/**
 * The title logo, painted in code like everything else: a championship belt
 * with TURNBUCKLE on a red ribbon across the gold plate and a big chunky
 * ALLEY under it, the whole thing hung a little crooked, like a fight poster
 * tacked up by someone in a hurry. Built once at double density (D-018).
 */
import { AK, DS, FX, FY, OUT, P1, R, RR, circ, col, dense, ell, hash2, liA, mixc, mkSpr, poly, shA, toCanvas, type Spr } from '../gfx/kit';
import { FM, FT, glyph } from '../gfx/font';

const K = 2;
/** Logical size of the logo. */
export const LOGO_W = 264;
export const LOGO_H = 122;
const CX = LOGO_W / 2;

const fx = () => (FX + 0.5) / K;
const fy = () => (FY + 0.5) / K;

type G = { w: number; rows: string[] };
const gl = (f: unknown, ch: string) => glyph(f, ch) as G | null;

/** Width in cells of a word in a font. */
function cellsW(s: string, f: unknown, sp = 1): number {
  let w = 0;
  for (const ch of s) {
    const g = gl(f, ch);
    w += (g ? g.w : 2) + sp;
  }
  return w - sp;
}

/**
 * Chunky letters: every glyph cell becomes an s x s block whose outer
 * corners are nipped off by a fine pixel, lit on top, darker underneath,
 * with a solid extrusion down-right. Letters sit on a slightly wandering
 * baseline (jit, in logical pixels).
 */
function bigWord(s: string, x0: number, y0: number, sc: number, fill: [string, string, string], extrude: string, depth: number, jit: number[]): void {
  const cellsOf: [number, number][] = [];
  let cx = 0;
  let i = 0;
  for (const ch of s) {
    const g = gl(FM, ch);
    if (!g) {
      cx += 3;
      continue;
    }
    const dy = jit[i % jit.length];
    g.rows.forEach((row, r) => {
      for (let c = 0; c < row.length; c++) if (row[c] === '#') cellsOf.push([x0 + (cx + c) * sc, y0 + r * sc + dy]);
    });
    cx += g.w + 1;
    i++;
  }
  const has = new Set(cellsOf.map(([x, y]) => `${x},${y}`));
  const at = (x: number, y: number) => has.has(`${x},${y}`);
  // extrusion first, stepping down-right in fine pixels
  for (let d = depth; d >= 0.5; d -= 0.5)
    for (const [x, y] of cellsOf) R(x + d * 0.5, y + d, sc, sc, d > depth - 0.6 ? shA(extrude, 0.3) : extrude);
  const [top, mid, bot] = fill.map(col);
  for (const [x, y] of cellsOf) {
    const up = at(x, y - sc);
    const dn = at(x, y + sc);
    const lf = at(x - sc, y);
    const rt = at(x + sc, y);
    R(x, y, sc, sc, () => {
      // a gradient down the whole word, so the letters read as one painted piece
      const t = (fy() - y0) / (7 * sc);
      let c = t < 0.45 ? mixc(top, mid, t / 0.45) : mixc(mid, bot, (t - 0.45) / 0.55);
      const lx = fx() - x;
      const ly = fy() - y;
      const e = 1 / K;
      if (!up && ly < e) c = liA(c, 0.55);
      else if (!up && ly < 2 * e && !lf && lx < e) c = liA(c, 0.3);
      if (!dn && ly > sc - e) c = shA(c, 0.16);
      if (!rt && lx > sc - e && !(!up && ly < e)) c = shA(c, 0.1);
      // flecks of worn paint
      if (hash2(FX, FY, 31) < 0.025) c = shA(c, 0.12);
      return c;
    });
    // nip outer corners so the blocks read as hand-cut, not stamped
    const e = 1 / K;
    if (!up && !lf && !at(x - sc, y - sc)) P1(x, y, 0);
    if (!up && !rt && !at(x + sc, y - sc)) P1(x + sc - e, y, 0);
  }
}

/** Shade a polygon field like hammered gold: sunburst engraving, lit from the top-left. */
function goldField(pts: [number, number][], cx: number, cy: number, rays: number, base = '#f2b440'): void {
  const b = col(base);
  poly(pts, () => {
    const dx = fx() - cx;
    const dy = fy() - cy;
    const a = Math.atan2(dy, dx);
    const band = Math.floor(((a + Math.PI) / (Math.PI * 2)) * rays) % 2;
    const light = -(dx * 0.6 + dy) / 70;
    let c = band ? shA(b, 0.06) : liA(b, 0.12);
    c = light > 0 ? liA(c, Math.min(0.4, light * 0.6)) : shA(c, Math.min(0.3, -light * 0.45));
    if (hash2(FX >> 1, FY >> 1, 7) < 0.04) c = liA(c, 0.25);
    return c;
  });
}
/** A polygon grown or shrunk around (cx, cy). */
const grow = (pts: [number, number][], cx: number, cy: number, d: number): [number, number][] =>
  pts.map(([x, y]) => {
    const l = Math.hypot(x - cx, y - cy) || 1;
    return [x + ((x - cx) / l) * d, y + ((y - cy) / l) * d * 0.8];
  });
function rivet(x: number, y: number): void {
  circ(x, y, 1.6, '#a86a28');
  circ(x - 0.25, y - 0.25, 1.1, '#ffe090');
  P1(x - 0.5, y - 0.5, '#fffbe8');
}
function gem(x: number, y: number, r: number, c: string): void {
  circ(x, y, r + 1.2, '#a86a28');
  circ(x, y, r + 0.6, '#ffe8a0');
  circ(x, y, r, shA(c, 0.25));
  circ(x - 0.4, y - 0.4, r - 0.8, c);
  ell(x - r * 0.35, y - r * 0.4, r * 0.35, r * 0.25, liA(c, 0.7));
  P1(x - r * 0.4, y - r * 0.45, '#ffffff');
}

function body(): void {
  const cy = 62;
  // ---- the leather strap, running off both sides
  const sy0 = 48;
  const sy1 = 76;
  RR(2, sy0, LOGO_W - 4, sy1 - sy0, 4, () => {
    const t = (fy() - sy0) / (sy1 - sy0);
    let c = col(t < 0.15 ? '#9a3a4a' : t < 0.8 ? '#7a2a3e' : '#5a1e34');
    if (hash2(FX >> 1, FY, 41) < 0.08) c = shA(c, 0.12);
    if (hash2(FX, FY >> 2, 42) < 0.03) c = liA(c, 0.12);
    return c;
  });
  for (let x = 6; x < LOGO_W - 6; x += 2.5) {
    R(x, sy0 + 2.5, 1.5, 0.5, '#e6b070');
    R(x, sy1 - 3, 1.5, 0.5, '#d8a060');
  }
  // buckle holes on the right end, worn with use
  for (const hx of [LOGO_W - 12, LOGO_W - 20]) {
    ell(hx, (sy0 + sy1) / 2, 1.6, 2.2, '#3a1828');
    P1(hx - 0.5, (sy0 + sy1) / 2 + 1.5, '#9a3a4a');
  }
  // ---- side plates
  for (const [x0, gc] of [[18, '#e2544a'], [LOGO_W - 60, '#2fa59a']] as [number, string][]) {
    const pts: [number, number][] = [[x0 + 4, cy - 18], [x0 + 38, cy - 18], [x0 + 42, cy - 14], [x0 + 42, cy + 14], [x0 + 38, cy + 18], [x0 + 4, cy + 18], [x0, cy + 14], [x0, cy - 14]];
    poly(pts, '#a86a28');
    goldField(grow(pts, x0 + 21, cy, -1.5), x0 + 21, cy, 18);
    poly(grow(pts, x0 + 21, cy, -4.5), '#d89a38');
    goldField(grow(pts, x0 + 21, cy, -5.5), x0 + 21, cy, 18, '#f6c454');
    gem(x0 + 21, cy, 5.5, gc);
    for (const [rx, ry] of [[x0 + 5, cy - 13], [x0 + 37, cy - 13], [x0 + 5, cy + 13], [x0 + 37, cy + 13]]) rivet(rx, ry);
  }
  // ---- the main plate: a stretched octagon
  const P: [number, number][] = [[CX - 54, 14], [CX + 54, 14], [CX + 74, 34], [CX + 74, 92], [CX + 54, 112], [CX - 54, 112], [CX - 74, 92], [CX - 74, 34]];
  poly(grow(P, CX, cy, 1.5), '#8a5420');
  poly(P, '#b8782a');
  goldField(grow(P, CX, cy, -2), CX, cy, 40);
  // bevel: lit top-left rim, shaded bottom-right
  poly(grow(P, CX, cy, -5), '#c8862e');
  goldField(grow(P, CX, cy, -6), CX, cy, 40, '#f6c050');
  // engraved laurel dots around the field
  for (let k = 0; k < 64; k++) {
    const a = (k / 64) * Math.PI * 2;
    const x = CX + Math.cos(a) * 64;
    const y = cy + Math.sin(a) * 40;
    if (y > 24 && y < 104) P1(x, y, k % 2 ? '#c8862e' : '#fff0b0');
  }
  for (const [rx, ry] of [[CX - 52, 20], [CX + 52, 20], [CX - 52, 106], [CX + 52, 106], [CX - 70, 62], [CX + 70, 62]]) rivet(rx, ry);
  // ---- the star crest on top
  const star: [number, number][] = [];
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const r = k % 2 ? 5 : 11;
    star.push([CX + Math.cos(a) * r, 12 + Math.sin(a) * r]);
  }
  poly(grow(star, CX, 12, 1.2), '#8a5420');
  poly(star, () => {
    const l = -(fx() - CX) * 0.5 - (fy() - 12);
    return l > 3 ? '#fff4c0' : l > -2 ? '#f6c454' : '#d0902e';
  });
  gem(CX, 12, 2.6, '#ff5d8f');
  // ---- red ribbon across the plate, tails tucked behind
  const ry0 = 25;
  const ry1 = 47;
  for (const s of [-1, 1]) {
    const e = CX + s * 122;
    const b = CX + s * 98;
    poly([[b, ry0 + 6], [e, ry0 + 6], [e - s * 7, (ry0 + ry1) / 2 + 5], [e, ry1 + 6], [b, ry1 + 6]], '#a8303e');
    poly([[b, ry1], [b + s * 6, ry1 + 6], [b, ry1 + 6]], '#6a1e34');
  }
  R(CX - 104, ry0, 208, ry1 - ry0, () => {
    const t = (fy() - ry0) / (ry1 - ry0);
    let c = col(t < 0.08 ? '#ff8a76' : t < 0.2 ? '#ec5a52' : t < 0.85 ? '#d8434b' : '#a8303e');
    // the cloth puckers a little: soft vertical folds
    const fold = Math.sin(fx() * 0.21) * 0.5 + 0.5;
    if (t > 0.2 && t < 0.85) c = fold > 0.75 ? liA(c, 0.08) : fold < 0.2 ? shA(c, 0.08) : c;
    return c;
  });
  // ---- TURNBUCKLE on the ribbon, ALLEY on the gold
  const s1 = 3;
  const w1 = cellsW('TURNBUCKLE', FM) * s1;
  const s2 = 4;
  const w2 = cellsW('ALLEY', FM) * s2;
  const letters = mkSpr(LOGO_W, LOGO_H, () => {
    bigWord('TURNBUCKLE', Math.round(CX - w1 / 2), ry0 + 1, s1, ['#fff8e6', '#fbe6b4', '#f2c46a'], '#5a1e3a', 2, [0, -0.5, 0.5, 0, -0.5, 0, 0.5, -0.5, 0, 0.5]);
    bigWord('ALLEY', Math.round(CX - w2 / 2) - 1, 53, s2, ['#fff8e6', '#fde8b8', '#f6c060'], '#c03a44', 3, [0.5, -0.5, 0, 0.5, -1]);
  });
  DS(OUT(letters, () => AK), -1, -1);
  // ---- the subtitle on a plum ribbon under the plate
  const sub = 'A COZY WRESTLING LIFE';
  const sw = cellsW(sub, FT) + 0;
  const bx0 = CX - sw / 2 - 9;
  const bx1 = CX + sw / 2 + 9;
  const by0 = 104;
  const by1 = 116;
  for (const [b, e, s] of [[bx0, bx0 - 12, -1], [bx1, bx1 + 12, 1]] as [number, number, number][]) poly([[b, by0 + 3], [e, by0 + 3], [e - s * 4, (by0 + by1) / 2 + 2], [e, by1 + 3], [b, by1 + 3]], '#2e2246');
  R(bx0, by0, bx1 - bx0, by1 - by0, () => {
    const t = (fy() - by0) / (by1 - by0);
    return t < 0.1 ? '#6a5a8a' : t > 0.88 ? '#2e2246' : '#3e3060';
  });
  R(bx0, by0 + 1, bx1 - bx0, 0.5, '#f4b63f');
  R(bx0, by1 - 1.5, bx1 - bx0, 0.5, '#c8862e');
  for (const pass of [0, 1]) {
    let tx = Math.round(CX - sw / 2);
    for (const ch of sub) {
      const g = gl(FT, ch);
      if (!g) {
        tx += 2;
        continue;
      }
      g.rows.forEach((row, r) => {
        for (let c = 0; c < row.length; c++) {
          if (row[c] !== '#') continue;
          if (pass === 0) R(tx + c + 0.5, by0 + 4 + r, 1, 1, '#1e1630');
          else R(tx + c, by0 + 3.5 + r, 1, 1, r === 0 ? '#fff8e6' : '#fbf0d9');
        }
      });
      tx += g.w + 1;
    }
  }
}

/** Shift every fine column up or down so the whole logo hangs a little crooked. */
function shear(s: Spr, slope: number): Spr {
  const pad = Math.ceil(Math.abs(slope) * s.w * 0.5) + 2;
  const h = s.h + pad * 2;
  const d = new Uint32Array(s.w * h);
  for (let x = 0; x < s.w; x++) {
    const off = Math.round((x - s.w / 2) * slope) + pad;
    for (let y = 0; y < s.h; y++) {
      const c = s.d[y * s.w + x];
      if (c) d[(y + off) * s.w + x] = c;
    }
  }
  return { w: s.w, h, d, k: s.k };
}

export interface Logo {
  /** The logo, dense canvas (draws at logical size). */
  cv: HTMLCanvasElement;
  /** Plum silhouette for the drop shadow. */
  shadow: HTMLCanvasElement;
  /** Pixels for the shine pass (fine). */
  px: Uint32Array;
  bright: Uint32Array;
  fw: number;
  fh: number;
  /** Logical size. */
  w: number;
  h: number;
}
let cached: Logo | null = null;
export function titleLogo(): Logo {
  if (cached) return cached;
  cached = dense(K, () => {
    let s = mkSpr(LOGO_W, LOGO_H, body);
    s = shear(s, -0.035);
    s = OUT(s, (c, side) => (side === 'dark' ? AK : shA(c, 0.72)));
    const cv = toCanvas(s);
    const sil = { ...s, d: s.d.map((c) => (c >>> 24 ? col('#2b2140') : 0)) };
    const bright = s.d.map((c) => (c >>> 24 ? liA(c, 0.6) : 0));
    return { cv, shadow: toCanvas(sil), px: s.d, bright, fw: s.w, fh: s.h, w: s.w / K, h: s.h / K };
  });
  return cached;
}

/** The logo with a shine band across it at position p (0..1), written into a reusable canvas. */
let work: { cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; img: ImageData; d: Uint32Array } | null = null;
export function shineFrame(L: Logo, p: number): HTMLCanvasElement {
  if (!work) {
    const cv = document.createElement('canvas');
    cv.width = L.fw;
    cv.height = L.fh;
    (cv as unknown as { __k: number }).__k = K;
    const ctx = cv.getContext('2d', { willReadFrequently: true })!;
    const img = ctx.createImageData(L.fw, L.fh);
    work = { cv, ctx, img, d: new Uint32Array(img.data.buffer) };
  }
  const { d } = work;
  d.set(L.px);
  // a diagonal band (and a thin trailing glint) sweeping left to right
  const span = L.fw + L.fh * 0.7;
  const c0 = -40 + p * (span + 80);
  for (let y = 0; y < L.fh; y++) {
    const row = y * L.fw;
    const base = c0 - y * 0.7;
    const x0 = Math.max(0, Math.floor(base - 34));
    const x1 = Math.min(L.fw, Math.ceil(base + 4));
    for (let x = x0; x < x1; x++) {
      const u = x - base;
      if ((u > -12 && u < 0) || (u > -30 && u < -26)) {
        const i = row + x;
        if (L.px[i]) d[i] = L.bright[i];
      }
    }
  }
  work.ctx.putImageData(work.img, 0, 0);
  return work.cv;
}
