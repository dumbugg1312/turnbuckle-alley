/**
 * Suburbs, highway, farmland and the Route 9 approach. Morning scenes are lit
 * from the upper left; golden hour comes in low from the right, with warm rim
 * light and plum shadows thrown to the left.
 */
import { circ, col, ell, FX, FY, hash2, L, P1, poly, R, RR, rng } from '../../gfx/kit';
import { FM, FT, T, TC, TW } from '../../gfx/font';
import { art, fdth, fn01, grainH, grainV, liA, mixc, over, rgba, shA, tint, tooth, vgrad } from './paint';

const fy = (): number => FY / 2;

// ---------------------------------------------------------------- foliage
export type Light = 'morning' | 'noon' | 'golden' | 'sunset';
const LEAF: Record<Light, { deep: string; shade: string; base: string; lit: string; hi: string; dir: number; trunk: string }> = {
  morning: { deep: '#2e4a54', shade: '#3e6a5c', base: '#5a9462', lit: '#88bc6e', hi: '#c2dc8a', dir: -1, trunk: '#6a5060' },
  noon: { deep: '#2c4a4c', shade: '#3a6a50', base: '#58a058', lit: '#86c062', hi: '#bce07a', dir: -1, trunk: '#6a5058' },
  golden: { deep: '#3a3854', shade: '#4e5850', base: '#7a9446', lit: '#c4b24e', hi: '#ffd677', dir: 1, trunk: '#5a3e4e' },
  sunset: { deep: '#33304e', shade: '#4a4558', base: '#6c7450', lit: '#dc9a5e', hi: '#ffbf7e', dir: 1, trunk: '#4e3650' },
};

/** A round, clumpy deciduous tree. */
export function tree(size: number, light: Light, seed: number): HTMLCanvasElement {
  const W = Math.round(size * 2.2) + 4;
  const H = Math.round(size * 2.6) + 4;
  return art(
    `tree${size}.${light}.${seed}`,
    W,
    H,
    () => {
      const p = LEAF[light];
      const r = rng(seed * 31 + size);
      const cx = W / 2;
      const cy = size + 2;
      // trunk and a branch fork peeking through
      R(cx - 1.5, cy, 3, H - cy, grainV(p.trunk, 0.15, seed));
      R(cx + (p.dir > 0 ? 0.5 : -1.5), cy, 1, H - cy, (_x, _y, o) => (o ? liA(o, 0.25) : null));
      L(cx, cy + 4, cx - 4, cy - 2, p.trunk);
      L(cx, cy + 3, cx + 4, cy - 3, p.trunk);
      // canopy: silhouette, then shaded, mid and lit clumps by facing
      const rx = size * 1.02;
      const ry = size * 0.92;
      ell(cx, cy, rx, ry, p.deep);
      const clumps: [number, number, number][] = [];
      for (let i = 0; i < 26; i++) {
        const a = r() * Math.PI * 2;
        const d = Math.sqrt(r()) * 0.82;
        clumps.push([cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, size * (0.28 + r() * 0.22)]);
      }
      clumps.sort((a, b) => a[1] - b[1]);
      for (const [x, y, s] of clumps) {
        const nx = (x - cx) / rx;
        const ny = (y - cy) / ry;
        const facing = nx * p.dir - ny * 0.8;
        ell(x, y + 0.5, s, s * 0.85, p.shade);
        if (facing > -0.35) ell(x + p.dir * 0.5, y, s * 0.9, s * 0.78, p.base);
        if (facing > 0.25) ell(x + p.dir * s * 0.3, y - s * 0.25, s * 0.6, s * 0.5, p.lit);
      }
      // leaf tooth along every clump edge, sun flecks on the lit side
      R(0, 0, W, cy + ry + 1, (_x, _y, o) => {
        if (!o) return null;
        const n = fn01(seed);
        if (o === col(p.lit) && n > 0.86) return p.hi;
        if (o === col(p.base) && n < 0.08) return p.shade;
        if (o === col(p.shade) && n > 0.93) return p.base;
        return null;
      });
      // ragged fine-pixel leaves breaking the silhouette
      for (let i = 0; i < size * 7; i++) {
        const a = r() * Math.PI * 2;
        const x = cx + Math.cos(a) * (rx + 0.5);
        const y = cy + Math.sin(a) * (ry + 0.5);
        const facing = Math.cos(a) * p.dir - Math.sin(a) * 0.8;
        P1(x, y, facing > 0.3 ? p.lit : facing > -0.3 ? p.base : p.shade);
      }
    },
    'soft',
  );
}

/** A dark pine (highway and farm edges). */
export function pine(h: number, light: Light, seed: number): HTMLCanvasElement {
  const W = Math.round(h * 0.55) + 2;
  return art(
    `pine${h}.${light}.${seed}`,
    W,
    h,
    () => {
      const p = LEAF[light];
      const cx = W / 2;
      R(cx - 1, h - 6, 2, 6, p.trunk);
      const tiers = 5;
      for (let i = 0; i < tiers; i++) {
        const t0 = (i / tiers) * (h - 6);
        const t1 = ((i + 1.4) / tiers) * (h - 6);
        const half = ((i + 1) / tiers) * (W / 2 - 1);
        poly([[cx, t0], [cx - half, t1], [cx + half, t1]], mixc(p.deep, p.shade, 0.5));
        poly([[cx, t0], [cx + p.dir * half, t1], [cx + p.dir * half * 0.2, t1]], p.shade);
        poly([[cx + p.dir * 0.5, t0 + 1], [cx + p.dir * half * 0.9, t1 - 0.5], [cx + p.dir * half * 0.5, t1 - 0.5]], p.base);
        R(cx - half, t1 - 1, half * 2, 1, (_x, _y, o) => (o && fn01(seed + i) < 0.4 ? shA(o, 0.2) : null));
      }
      R(0, 0, W, h, (_x, _y, o) => (o === col(p.base) && fn01(seed) > 0.88 ? p.lit : null));
    },
    'soft',
  );
}

// ---------------------------------------------------------------- suburbs
const SIDING = ['#e9d6b2', '#a8c2cc', '#dba79a', '#c6d09e', '#f0e4d0', '#c4b2d4'];
const ROOF = ['#6a5a76', '#8a5852', '#566482', '#6e6a5a', '#7a5070', '#5a6a6a'];
const TRIM = '#fbf3e4';

function shingles(x: number, y: number, w: number, h: number, c: string, seed: number): void {
  R(x, y, w, h, (_x, _y, o) => {
    if (!o) return null;
    const row = Math.floor(FY / 3);
    if (FY % 3 === 2) return shA(c, 0.28);
    if ((FX + row * 3) % 7 === 0) return shA(c, 0.2);
    const n = hash2(Math.floor((FX + row * 3) / 7), row, seed);
    return n < 0.12 ? shA(c, 0.1) : n > 0.9 ? liA(c, 0.1) : c;
  });
}
function siding(x: number, y: number, w: number, h: number, c: string): void {
  R(x, y, w, h, () => (FY % 3 === 2 ? shA(c, 0.16) : FY % 3 === 0 ? liA(c, 0.12) : c));
}
function window1(x: number, y: number, w: number, h: number, shut: string | null, warm = false): void {
  R(x - 0.5, y - 0.5, w + 1, h + 1, TRIM);
  R(x, y, w, h, warm ? vgrad(y, y + h, ['#ffe6a8', '#f0b070']) : vgrad(y, y + h, ['#c4dcec', '#6a7ea8']));
  R(x + 0.5, y + 0.5, 0.5, h * 0.5, '#f4fbff');
  R(x + w / 2 - 0.25, y, 0.5, h, TRIM);
  R(x, y + h / 2 - 0.25, w, 0.5, TRIM);
  R(x - 0.5, y + h + 0.5, w + 1, 0.5, shA(TRIM, 0.35));
  if (shut) {
    R(x - 2.5, y - 0.5, 1.5, h + 1, shut);
    R(x + w + 1, y - 0.5, 1.5, h + 1, shut);
    for (let yy = y; yy < y + h; yy += 1) {
      R(x - 2.5, yy + 0.5, 1.5, 0.5, shA(shut, 0.25));
      R(x + w + 1, yy + 0.5, 1.5, 0.5, shA(shut, 0.25));
    }
  }
}
function shrub(x: number, y: number, s: number, light: Light): void {
  const p = LEAF[light];
  ell(x, y, s, s * 0.75, p.shade);
  ell(x + p.dir * s * 0.2, y - s * 0.15, s * 0.75, s * 0.5, p.base);
  ell(x + p.dir * s * 0.35, y - s * 0.35, s * 0.4, s * 0.3, p.lit);
}

/** A suburban house (mid layer). Even v = ranch, odd v = two-storey colonial. */
export function house(v: number): HTMLCanvasElement {
  const ranch = v % 2 === 0;
  const W = ranch ? 66 : 50;
  const H = ranch ? 38 : 52;
  return art(
    `sub-house${v}`,
    W,
    H,
    () => {
      const r = rng(500 + v);
      const sd = SIDING[v % SIDING.length];
      const rf = ROOF[(v * 3 + 1) % ROOF.length];
      const shut = ['#3f6a7a', '#7a3f4a', '#3f5a3f', null][v % 4];
      if (ranch) {
        const wy = 15;
        siding(2, wy, W - 4, H - wy - 2, sd);
        // garage wing on the right, a step back and darker
        R(W - 24, wy, 22, H - wy - 2, over(0.08));
        // hip roof with a deep eave
        poly([[0, wy + 1], [12, 3], [W - 12, 3], [W, wy + 1]], rf);
        shingles(0, 3, W, wy - 2, rf, v);
        poly([[0, wy + 1], [12, 3], [16, 3], [6, wy + 1]], (_x, _y, o) => (o ? liA(o, 0.2) : null));
        R(0, wy, W, 1, shA(rf, 0.45));
        R(12, 3, W - 24, 0.5, liA(rf, 0.3));
        R(2, wy + 1, W - 4, 1.5, over(0.22, 10)); // eave shadow
        // windows and a red front door with a porch light
        window1(7, wy + 5, 9, 7, shut);
        window1(20, wy + 5, 9, 7, shut, r() < 0.4);
        R(32, wy + 4, 6, H - wy - 6, ['#b8443e', '#3f6a8a', '#f2c84a'][v % 3]);
        R(32, wy + 4, 6, 0.5, TRIM);
        R(33, wy + 6, 4, 3, (_x, _y, o) => (o ? shA(o, 0.2) : null));
        P1(36.5, wy + 9.5, '#ffe6a0');
        P1(39.5, wy + 5, '#fff2c0');
        // garage door with panel lines
        R(W - 21, wy + 5, 16, H - wy - 7, '#efe6d8');
        for (let y = wy + 7; y < H - 2; y += 2.5) R(W - 21, y, 16, 0.5, '#c8bcac');
        for (let x = W - 21 + 4; x < W - 5; x += 4) R(x, wy + 5, 0.5, H - wy - 7, '#d8ccbc');
        R(W - 21, wy + 5, 16, 1, '#a89c8c');
        // basketball hoop over the garage
        R(W - 13.5, wy - 1, 5, 4, '#f6f0ea');
        R(W - 12, wy + 1, 2, 1, '#e06a4a');
        R(W - 12.5, wy + 3, 3, 0.5, '#e0784a');
        for (let i = 0; i < 3; i++) P1(W - 12.25 + i, wy + 3.5 + (i % 2) * 0.5, '#f6f0ea');
        // foundation and shrubs
        R(1, H - 2.5, W - 2, 2.5, '#9a8ea0');
        shrub(6, H - 3, 4, 'morning');
        shrub(13, H - 3, 3.5, 'morning');
        shrub(25, H - 3, 4.5, 'morning');
      } else {
        const wy = 18;
        siding(3, wy, W - 6, H - wy - 2, sd);
        // gable roof (side-on) with a brick chimney
        R(W - 13, 1, 6, 12, '#9a5a54');
        R(W - 13, 1, 6, 12, (_x, _y, o) => (FY % 3 === 0 ? shA(o, 0.25) : null));
        R(W - 14, 0, 8, 1.5, '#b8b0bc');
        poly([[0, wy + 1], [10, 4], [W - 10, 4], [W, wy + 1]], rf);
        shingles(0, 4, W, wy - 3, rf, v);
        poly([[0, wy + 1], [10, 4], [13, 4], [4, wy + 1]], (_x, _y, o) => (o ? liA(o, 0.2) : null));
        R(0, wy, W, 1, shA(rf, 0.45));
        R(3, wy + 1, W - 6, 1.5, over(0.22, 10));
        // dormer
        R(W / 2 - 4, 7, 8, 7, sd);
        poly([[W / 2 - 5.5, 8], [W / 2, 3.5], [W / 2 + 5.5, 8]], shA(rf, 0.1));
        window1(W / 2 - 2, 9, 4, 4, null);
        // two floors of windows, a portico door
        const midY = wy + (H - wy) / 2;
        R(3, midY - 1, W - 6, 0.5, shA(sd, 0.3));
        for (const x of [8, W - 16]) {
          window1(x, wy + 4, 8, 6, shut, r() < 0.3);
          window1(x, midY + 2, 8, 6, shut);
        }
        R(W / 2 - 3, midY + 1, 6, H - midY - 3, '#3f5a7a');
        R(W / 2 - 5, midY - 1, 10, 1.5, TRIM);
        R(W / 2 - 5, midY + 0.5, 1, H - midY - 3, TRIM);
        R(W / 2 + 4, midY + 0.5, 1, H - midY - 3, TRIM);
        P1(W / 2 + 2, midY + 6, '#ffe6a0');
        R(2, H - 2.5, W - 4, 2.5, '#9a8ea0');
        shrub(7, H - 3, 4, 'morning');
        shrub(W - 8, H - 3, 4, 'morning');
      }
      // morning sun from the left: lit left wall edge, shaded right edge
      R(2, 0, 1, H - 2, (_x, _y, o) => (o ? liA(o, 0.15) : null));
      R(W - 6, 0, 3, H - 2, over(0.12));
    },
    'soft',
  );
}

/** Lawn opinions, one per house (mid layer, sits on the ground). */
export function lawn(v: number): HTMLCanvasElement {
  const W = 46;
  const H = 18;
  return art(
    `sub-lawn${v}`,
    W,
    H,
    () => {
      const g = '#7aaa5c';
      const kind = v % 6;
      const y0 = H - 6;
      if (kind === 0) {
        // perfect diagonal mowing stripes and a sprinkler going
        R(0, y0, W, 6, () => ((Math.floor((FX + FY * 2) / 8) % 2) ? '#8ec466' : '#6e9e54'));
        for (let i = 0; i < 14; i++) {
          const a = (i / 13) * Math.PI;
          const x = 30 + Math.cos(a) * 9;
          const y = y0 + 2 - Math.sin(a) * 7;
          P1(x, y, '#e4f4ff');
          P1(x + 0.5, y + 0.5, '#9ad0ec');
        }
        R(29.5, y0 + 1, 1, 1.5, '#5a5a6a');
      } else if (kind === 1) {
        // three plastic flamingos
        R(0, y0, W, 6, tooth(g, 0.12, 3, 0.25));
        for (const fx of [8, 15, 21]) {
          R(fx, y0 - 3, 0.5, 5, '#3a3044');
          ell(fx + 0.5, y0 - 5, 2.2, 1.4, '#ff8ab0');
          R(fx - 1, y0 - 6, 2, 0.5, '#ffc0d4');
          R(fx + 2, y0 - 9, 0.5, 4, '#ff8ab0');
          ell(fx + 2.5, y0 - 9.5, 1, 0.8, '#ff8ab0');
          P1(fx + 3.5, y0 - 9.5, '#3a3044');
        }
      } else if (kind === 2) {
        // it's been a while: tall grass, dandelions, a FOR SALE sign
        R(0, y0, W, 6, tooth('#8aa45a', 0.18, 7, 0.35));
        for (let x = 0; x < W; x += 1) {
          const hgt = 2 + hash2(x, 9, v) * 4;
          R(x, y0 - hgt + 1, 0.5, hgt, hash2(x, 3, v) < 0.5 ? '#6a8e4a' : '#a4b45e');
          if (hash2(x, 5, v) < 0.12) P1(x, y0 - hgt + 0.5, '#ffe060');
        }
        R(30, y0 - 12, 0.5, 13, '#5a4a4a');
        R(30, y0 - 12, 9, 0.5, '#5a4a4a');
        R(33, y0 - 11.5, 0.5, 1, '#5a4a4a');
        R(37, y0 - 11.5, 0.5, 1, '#5a4a4a');
        RR(32, y0 - 10.5, 7, 6, 1, '#f6f0e6');
        R(32.5, y0 - 10, 6, 2, '#c8403c');
        T('FOR', 33, y0 - 10.5 + 0.0, '#f6f0e6', FT, {});
      } else if (kind === 3) {
        // a garden gnome battalion
        R(0, y0, W, 6, tooth(g, 0.1, 9, 0.2));
        for (let i = 0; i < 6; i++) {
          const gx = 6 + i * 6;
          ell(gx, y0 - 1, 1.5, 1.6, ['#4a6aa8', '#5a8a4a', '#a85a4a'][i % 3]);
          circ(gx, y0 - 3, 1, '#f2c8a4');
          ell(gx, y0 - 2, 1.2, 0.8, '#f6f0f0');
          poly([[gx - 1.5, y0 - 3.5], [gx, y0 - 7], [gx + 1.5, y0 - 3.5]], '#d8403c');
        }
      } else if (kind === 4) {
        // a trampoline, of course
        R(0, y0, W, 6, tooth(g, 0.1, 11, 0.2));
        for (const lx of [12, 32]) {
          L(lx, y0 - 4, lx - 2, y0 + 1, '#5a5a78');
          L(lx, y0 - 4, lx + 2, y0 + 1, '#5a5a78');
        }
        ell(22, y0 - 5, 15, 2.2, '#3a7ac8');
        ell(22, y0 - 5.3, 13, 1.5, '#3a3150');
        R(8, y0 - 5.6, 28, 0.5, '#6aa8e8');
        // a forgotten ball
        circ(40, y0 + 1, 1.5, '#e8603c');
        P1(39.5, y0 + 0.5, '#ffb08a');
      } else {
        // vegetable rows and a tomato cage
        R(0, y0, W, 6, '#8a6a5a');
        for (let x = 2; x < W - 2; x += 4) {
          ell(x + 1, y0 + 1, 1.8, 1.4, '#5a9a4a');
          P1(x + 1.5, y0 + 0.5, '#8ac460');
          if (x % 8 === 2) P1(x, y0 + 1.5, '#e8443c');
        }
        R(0, y0, W, 0.5, '#a8887a');
      }
      // white picket fence at the lot line
      for (let x = 0.5; x < 6; x += 2) {
        R(x, y0 - 6, 1, 7, TRIM);
        P1(x + 0.25, y0 - 6.5, TRIM);
      }
      R(0, y0 - 4, 6, 0.5, '#d8d0c4');
      R(0, y0 - 1.5, 6, 0.5, '#d8d0c4');
    },
    false,
  );
}

/** A tidy mailbox on a post. */
export function mailbox(v: number): HTMLCanvasElement {
  return art(`sub-mail${v}`, 8, 12, () => {
    R(3.5, 4, 1, 8, '#7a5a4a');
    RR(1, 1, 7, 4, 1, ['#3f5a8a', '#c8403c', '#5a5a6a'][v % 3]);
    R(1.5, 1.5, 6, 0.5, '#f6f0ff');
    R(6.5, 0, 0.5, 2.5, '#e8403c');
    R(6.5, 0, 1.5, 1, '#e8403c');
  });
}

/** Distant rooftops and trees (mid-far layer), tiling. */
export function suburbFar(): HTMLCanvasElement {
  const W = 300;
  const H = 26;
  return art('sub-far', W, H, () => {
    const r = rng(51);
    let x = 0;
    while (x < W) {
      if (r() < 0.32) {
        const s = 4 + r() * 4;
        const p = LEAF.morning;
        ell(x + s, H - 5 - s * 0.6, s, s * 0.8, p.shade);
        ell(x + s - 0.8, H - 6 - s * 0.7, s * 0.7, s * 0.55, p.base);
        P1(x + s - 2, H - 7 - s * 0.8, p.lit);
        x += s * 1.6;
      } else {
        const w = 12 + Math.floor(r() * 8);
        const wh = 5 + Math.floor(r() * 3);
        const sd = mixc(SIDING[Math.floor(r() * SIDING.length)], '#a8b4cc', 0.35);
        const rf = mixc(ROOF[Math.floor(r() * ROOF.length)], '#8a92b4', 0.3);
        R(x + 1, H - 4 - wh, w - 2, wh, sd);
        poly([[x - 0.5, H - 4 - wh + 0.5], [x + 3, H - 8 - wh], [x + w - 3, H - 8 - wh], [x + w + 0.5, H - 4 - wh + 0.5]], rf);
        R(x - 0.5, H - 4 - wh, w + 1, 0.5, shA(rf, 0.3));
        R(x + 3, H - wh - 2, 1.5, 1.5, '#7a8ab0');
        R(x + w - 5, H - wh - 2, 1.5, 1.5, '#7a8ab0');
        x += w + 2 + Math.floor(r() * 4);
      }
    }
    R(0, H - 4, W, 4, tooth('#7ea866', 0.12, 2, 0.2));
    R(0, H - 4, W, 0.5, '#9cc47a');
  });
}

// ---------------------------------------------------------------- highway
/** The green Route 9 guide sign (mid layer). */
export function highwaySign(): HTMLCanvasElement {
  const W = 98;
  const H = 62;
  return art(
    'hw-sign',
    W,
    H,
    () => {
      const green = '#2c7254';
      const cream = '#f4efdc';
      // two galvanized posts
      for (const px of [22, W - 26]) {
        R(px, 28, 3, H - 28, '#8a8ca8');
        R(px, 28, 1, H - 28, '#c8cade');
        R(px + 2.5, 28, 0.5, H - 28, '#5a5c78');
      }
      RR(0, 0, W, 30, 2, cream);
      RR(1, 1, W - 2, 28, 2, green);
      RR(2, 2, W - 4, 26, 1, cream);
      RR(2.5, 2.5, W - 5, 25, 1, green);
      // noon light: top edge bright, slight sheen
      R(3, 3, W - 6, 6, tint('#5aa07c', 0.35, 6));
      // route shield + WEST
      const sx = 8;
      poly([[sx, 5], [sx + 9, 5], [sx + 9, 11], [sx + 4.5, 14], [sx, 11]], cream);
      poly([[sx + 0.8, 5.8], [sx + 8.2, 5.8], [sx + 8.2, 10.6], [sx + 4.5, 13], [sx + 0.8, 10.6]], '#2b2140');
      TC('9', sx + 4.5, 6.2, cream, FT, {});
      T('WEST', sx + 13, 7, cream, FT, {});
      // destination and mileage
      T('TURNBUCKLE ALLEY', 8, 18, cream, FT, {});
      T('152', W - 20, 16, cream, FM, { bold: true });
      // reflective bead glints and a little road grime along the bottom
      R(3, 22, W - 6, 5, (_x, _y, o) => (o === col(green) && fn01(4) < 0.18 ? shA(o, 0.12) : null));
      R(0, 0, W, 30, (_x, _y, o) => (o === col(cream) && fn01(8) < 0.06 ? '#ffffff' : null));
    },
    'soft',
  );
}

/** Guardrail band on the shoulder (near layer, tiles). */
export function guardrail(light: Light): HTMLCanvasElement {
  const W = 64;
  const H = 18;
  return art(`hw-rail-${light}`, W, H, () => {
    const warm = light === 'golden' || light === 'sunset';
    const steel = warm ? '#b0a2a8' : '#a8aec4';
    const hi = warm ? '#ffe2b0' : '#eef2ff';
    for (const px of [10, 42]) {
      R(px, 5, 3, H - 5, warm ? '#7a6060' : '#7a7a94');
      R(px, 5, 1, H - 5, warm ? '#a88480' : '#a0a2bc');
      R(px + 2.5, 5, 0.5, H - 5, '#3f3654');
    }
    // W-beam: two ribs, bolts, highlight along the top rib
    R(0, 3, W, 6, steel);
    R(0, 3, W, 0.5, hi);
    R(0, 4.5, W, 1, liA(steel, 0.35));
    R(0, 6, W, 0.5, shA(steel, 0.35));
    R(0, 7, W, 1, liA(steel, 0.15));
    R(0, 8.5, W, 0.5, shA(steel, 0.5));
    for (const bx of [11.5, 43.5]) {
      P1(bx, 5.5, shA(steel, 0.5));
      P1(bx, 7, shA(steel, 0.5));
    }
    R(0, 3, W, 6, (_x, _y, o) => (o && fn01(12) < 0.04 ? shA(o, 0.15) : null));
    if (warm) R(W - 22, 3, 16, 0.5, '#ffffff');
  });
}

/** A wooden power pole. Wire anchors are at y = 3 (x = 1, 9, 17). */
export function pole(light: Light): HTMLCanvasElement {
  return art(
    `pole-${light}`,
    18,
    70,
    () => {
      const warm = light === 'golden' || light === 'sunset';
      const wood = warm ? '#7a5048' : '#7a6460';
      R(7.5, 0, 3, 70, grainV(wood, 0.14, 9));
      R(warm ? 9.5 : 7.5, 0, 1, 70, (_x, _y, o) => (o ? liA(o, warm ? 0.4 : 0.25) : null));
      R(0, 3.5, 18, 1.5, wood);
      R(0, 3.5, 18, 0.5, liA(wood, 0.3));
      L(4, 5, 8, 9, wood);
      L(14, 5, 10, 9, wood);
      for (const ix of [1, 9, 17]) {
        RR(ix - 0.75, 1.5, 1.5, 2, 1, warm ? '#9ad0a8' : '#8ac4b0');
        P1(ix - 0.5, 1.5, '#e8fff0');
      }
      if (light !== 'noon') {
        // a transformer can
        RR(10.5, 12, 5, 7, 1, '#9a9cb0');
        R(10.5, 12, 5, 0.5, '#d8daea');
        if (warm) R(14.5, 12, 1, 7, '#ffd8a0');
      }
      R(7.5, 56, 3, 14, over(0.15, 8));
    },
    false,
  );
}

/** Distant hills (far layer), tiling. Golden/sunset light rims the crests. */
export function ridge(light: Light): HTMLCanvasElement {
  const W = 640;
  const H = 50;
  return art(`ridge-${light}`, W, H, () => {
    const pal: Record<Light, [string, string, string, string]> = {
      morning: ['#9ab0c8', '#86a2b4', '#7a98a0', '#c8dcec'],
      noon: ['#96b4d0', '#80a4b0', '#6e9a96', '#d0e6f4'],
      golden: ['#b08ab0', '#9a7aa0', '#7e6a8e', '#ffd09a'],
      sunset: ['#9a6a9a', '#865a8a', '#6a4c7a', '#ffb880'],
    };
    const [back, mid, front, rim] = pal[light];
    const T2 = Math.PI * 2;
    const hb = (x: number) => 26 + Math.sin((x / W) * T2 * 2 + 1) * 9 + Math.sin((x / W) * T2 * 5) * 4 + Math.sin((x / W) * T2 * 11 + 2) * 1.5;
    const hf = (x: number) => 14 + Math.sin((x / W) * T2 * 3 + 2.4) * 6 + Math.sin((x / W) * T2 * 7 + 1) * 3 + Math.sin((x / W) * T2 * 17) * 1.2;
    for (let x = 0; x < W; x += 0.5) {
      const b = hb(x);
      const f = hf(x);
      R(x, H - b, 0.5, b, back);
      R(x, H - f, 0.5, f, mid);
      const warm = light === 'golden' || light === 'sunset';
      // rim on crests facing the sun
      const slopeB = hb(x + 1) - hb(x - 1);
      const slopeF = hf(x + 1) - hf(x - 1);
      if (warm ? slopeB < 0 : slopeB > 0) R(x, H - b, 0.5, 0.5, rim);
      if (warm ? slopeF < 0 : slopeF > 0) R(x, H - f, 0.5, 0.5, mixc(rim, mid, 0.35));
    }
    // tree texture on the near ridge, fields lower down
    R(0, 0, W, H, (_x, _y, o) => {
      if (o !== col(mid)) return null;
      const n = fn01(21);
      return n < 0.18 ? front : n > 0.95 ? liA(mid, 0.15) : null;
    });
    R(0, H - 5, W, 5, (_x, _y, o) => (o && fdth(8) ? mixc(o, front, 0.5) : null));
  });
}

// ---------------------------------------------------------------- farmland
const BARN = '#c4473f';

/** The old red gambrel barn, golden hour from the right (mid layer). */
export function barn(): HTMLCanvasElement {
  const W = 84;
  const H = 60;
  return art(
    'farm-barn',
    W,
    H,
    () => {
      const x0 = 8;
      const bw = 50;
      const wall = 30;
      const cx = x0 + bw / 2;
      const roof = '#5e4a6a';
      // lean-to shed on the right with a corrugated roof
      R(x0 + bw - 2, wall + 8, 22, H - wall - 8, grainV('#a83e40', 0.14, 3));
      poly([[x0 + bw - 3, wall + 4], [x0 + bw + 22, wall + 10], [x0 + bw + 22, wall + 12], [x0 + bw - 3, wall + 7]], '#8a8494');
      for (let x = x0 + bw; x < x0 + bw + 22; x += 1.5) R(x, wall + 4 + (x - x0 - bw + 3) * 0.24, 0.5, 3, '#b4aebc');
      R(x0 + bw + 6, wall + 14, 10, H - wall - 14, '#3c2e46');
      // main walls: weathered vertical boards
      R(x0, wall, bw, H - wall, grainV(BARN, 0.16, 1));
      for (let x = x0 + 2.5; x < x0 + bw; x += 3) R(x, wall, 0.5, H - wall, shA(BARN, 0.3));
      // gambrel gable
      poly([[x0 - 1, wall + 0.5], [x0 + 6, wall - 14], [cx, wall - 24], [x0 + bw - 6, wall - 14], [x0 + bw + 1, wall + 0.5]], roof);
      poly([[x0 + 2, wall + 0.5], [x0 + 8, wall - 12], [cx, wall - 21], [x0 + bw - 8, wall - 12], [x0 + bw - 2, wall + 0.5]], grainV(BARN, 0.16, 2));
      for (let x = x0 + 2.5; x < x0 + bw - 2; x += 3) R(x, wall - 21, 0.5, 22, (_x, _y, o) => (o && o !== col(roof) ? shA(BARN, 0.3) : null));
      // roof edge trim and a rusty drip
      for (let i = 0; i <= 1; i += 0.02) {
        const pts: [number, number][] = [[x0 - 1, wall + 0.5], [x0 + 6, wall - 14], [cx, wall - 24], [x0 + bw - 6, wall - 14], [x0 + bw + 1, wall + 0.5]];
        const seg = Math.min(3, Math.floor(i * 4));
        const k = i * 4 - seg;
        const [ax, ay] = pts[seg];
        const [bx, by] = pts[seg + 1];
        P1(ax + (bx - ax) * k, ay + (by - ay) * k, i < 0.5 ? '#8a7a96' : '#ffd9a0');
      }
      // white trim, hayloft door with hay, big X doors
      R(x0, wall, bw, 1, '#f2e6d0');
      R(x0, wall, 1, H - wall, '#f2e6d0');
      R(x0 + bw - 1, wall, 1, H - wall, '#f2e6d0');
      R(cx - 5, wall - 15, 10, 10, '#3c2a40');
      R(cx - 5, wall - 15, 10, 10, () => (fy() > wall - 9 ? (fn01(3) < 0.6 ? '#e8c060' : '#c8983e') : null));
      R(cx - 6, wall - 16, 12, 1, '#f2e6d0');
      R(cx - 6, wall - 16, 1, 12, '#f2e6d0');
      R(cx + 5, wall - 16, 1, 12, '#f2e6d0');
      const dy = wall + 6;
      R(cx - 11, dy, 22, H - dy, grainV('#a83a3c', 0.14, 5));
      R(cx - 11, dy, 22, 1, '#f2e6d0');
      R(cx - 11, dy, 1, H - dy, '#f2e6d0');
      R(cx + 10, dy, 1, H - dy, '#f2e6d0');
      R(cx - 0.5, dy, 1, H - dy, '#f2e6d0');
      L(cx - 10, dy + 1, cx - 1, H - 1, '#f2e6d0');
      L(cx - 1, dy + 1, cx - 10, H - 1, '#f2e6d0');
      L(cx + 1, dy + 1, cx + 9, H - 1, '#f2e6d0');
      L(cx + 9, dy + 1, cx + 1, H - 1, '#f2e6d0');
      // golden hour: the right side glows, the left falls into plum shadow
      R(x0, wall - 24, bw * 0.38, H, (_x, _y, o) => (o && o !== col(roof) ? mixc(shA(o, 0.25), '#6a3a6a', 0.15) : null));
      R(x0 + bw - 3, wall - 14, 4, H, (_x, _y, o) => (o && o !== col(roof) ? liA(o, 0.35) : null));
      R(x0 + bw + 18, wall + 10, 4, H, (_x, _y, o) => (o ? liA(o, 0.3) : null));
      // cupola and weathervane (a rooster, naturally)
      R(cx - 2.5, wall - 30, 5, 6, '#f2e6d0');
      R(cx - 1.5, wall - 29, 3, 3, '#3c2a40');
      poly([[cx - 4, wall - 30], [cx, wall - 34], [cx + 4, wall - 30]], roof);
      R(cx - 0.25, wall - 40, 0.5, 6, '#4a3a50');
      for (const [dx, dy2] of [[-1.5, -1], [-1, -1.5], [-0.5, -1.5], [0, -1], [0.5, -1], [1, -1.5], [1, -2], [-1, -2], [-2, -0.5]] as [number, number][]) P1(cx + dx, wall - 39 + dy2, '#4a3a50');
      // grime at the base, a few weeds
      R(x0, H - 3, bw + 22, 3, over(0.18, 8));
      for (let x = x0 - 3; x < x0 + bw + 24; x += 1.5) if (hash2(x * 2, 1, 4) < 0.4) R(x, H - 1.5 - hash2(x * 2, 2, 4) * 2, 0.5, 2.5, hash2(x * 2, 3, 4) < 0.5 ? '#c8b050' : '#7a8a40');
    },
    'soft',
  );
}

/** A grain silo. Blue Harvestore or concrete stave. */
export function silo(kind: 'stave' | 'blue', h = 56): HTMLCanvasElement {
  const W = 16;
  return art(
    `farm-silo-${kind}${h}`,
    W,
    h + 8,
    () => {
      const base = kind === 'blue' ? '#3e5a8e' : '#c8bcb4';
      const y0 = 8;
      // cylinder: shade left, glow right (sun low on the right)
      R(1, y0, W - 2, h, () => {
        const u = (FX / 2 - 1) / (W - 2);
        const shade = u < 0.3 ? shA(base, 0.35 - u * 0.6) : u > 0.82 ? liA(base, 0.45) : u > 0.62 ? liA(base, 0.2) : base;
        return shade;
      });
      R(1, y0, W - 2, h, (_x, _y, o) => (o && fn01(31) < 0.05 ? shA(o, 0.1) : null));
      for (let y = y0 + 3; y < y0 + h; y += 3) R(1, y, W - 2, 0.5, (_x, _y, o) => (o ? shA(o, 0.18) : null));
      if (kind === 'blue') {
        R(1, y0 + h * 0.18, W - 2, 1.5, '#e8e2d0');
        TC('A', W / 2, y0 + 4, '#e8e2d0', FT, {});
      }
      // dome cap
      ell(W / 2, y0 + 0.5, W / 2 - 0.5, 5, kind === 'blue' ? '#2e4470' : '#8a8494');
      ell(W / 2 + 2, y0 - 1, 3, 2.5, kind === 'blue' ? '#7a9ac8' : '#d8d2dc');
      R(W / 2 - 0.5, y0 - 6, 1, 2, '#6a6478');
      // ladder cage on the shaded side
      R(3, y0 + 2, 0.5, h - 2, '#5a5468');
      R(5, y0 + 2, 0.5, h - 2, '#5a5468');
      for (let y = y0 + 3; y < y0 + h; y += 1.5) R(3, y, 2.5, 0.5, '#5a5468');
      R(1, y0 + h - 3, W - 2, 3, over(0.2, 8));
    },
    'soft',
  );
}

/** Windmill lattice tower and tail (the wheel spins separately). Hub at (13, 7). */
export function windmillTower(): HTMLCanvasElement {
  const W = 30;
  const H = 70;
  return art(
    'farm-windmill',
    W,
    H,
    () => {
      const iron = '#6a5a6e';
      const hi = '#ffd9a0';
      // four splayed legs and cross-bracing on fine lines
      L(13, 9, 4, H - 1, iron);
      L(15, 9, 24, H - 1, iron);
      L(14, 9, 10, H - 1, shA(iron, 0.2));
      L(14, 9, 18, H - 1, liA(iron, 0.2));
      for (let y = 18; y < H - 2; y += 9) {
        const k0 = (y - 9) / (H - 10);
        const k1 = (y + 9 - 9) / (H - 10);
        const xl0 = 13 - k0 * 9;
        const xr0 = 15 + k0 * 9;
        const xl1 = 13 - k1 * 9;
        const xr1 = 15 + k1 * 9;
        L(xl0, y, xr1, y + 9, iron);
        L(xr0, y, xl1, y + 9, iron);
        R(xl0, y, xr0 - xl0, 0.5, iron);
      }
      // rim light on the sun-side leg
      L(15.5, 9, 24.5, H - 1, hi);
      // platform and the gearbox, the tail vane
      R(9, 10, 10, 1, iron);
      RR(11, 5, 6, 4, 1, '#7a6a7c');
      R(16, 5, 1, 4, hi);
      R(17, 6.5, 9, 0.5, iron);
      poly([[22, 3], [29, 2], [29, 10], [22, 9]], '#e8dccc');
      R(22, 3, 7, 1, '#c84040');
      T('A', 24, 4, '#c84040', FT, {});
      R(28.5, 2, 0.5, 8, hi);
      // concrete footings and a stock tank
      for (const fx of [3, 23]) R(fx, H - 2, 3, 2, '#b8b0b4');
      RR(-1, H - 5, 10, 5, 1, '#8a96a8');
      R(-0.5, H - 5, 9, 1, '#5a8ab8');
      R(5, H - 4.5, 3, 0.5, '#ffe2b0');
    },
    false,
  );
}

/** Windmill wheel frame f of n (18 galvanized blades, rim-lit). */
export function windmillWheel(f: number, n: number): HTMLCanvasElement {
  const D = 24;
  return art(`farm-wheel${f}/${n}`, D, D, () => {
    const c = D / 2;
    const blades = 18;
    for (let i = 0; i < blades; i++) {
      const a = ((i + f / n) / blades) * Math.PI * 2;
      const a2 = a + 0.17;
      const r0 = 3;
      const r1 = c - 0.5;
      poly(
        [
          [c + Math.cos(a) * r0, c + Math.sin(a) * r0],
          [c + Math.cos(a) * r1, c + Math.sin(a) * r1],
          [c + Math.cos(a2) * r1, c + Math.sin(a2) * r1],
          [c + Math.cos(a2) * r0 * 1.4, c + Math.sin(a2) * r0 * 1.4],
        ],
        Math.cos(a) > 0.2 ? '#f0dcc4' : Math.cos(a) < -0.4 ? '#8a7e94' : '#bab0c0',
      );
    }
    for (let i = 0; i < 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      P1(c + Math.cos(a) * (c - 0.5), c + Math.sin(a) * (c - 0.5), Math.cos(a) > 0 ? '#ffe2b0' : '#5a4e66');
      P1(c + Math.cos(a) * 6, c + Math.sin(a) * 6, '#6a5e74');
    }
    circ(c, c, 1.6, '#4a3e56');
    P1(c + 0.5, c - 0.5, '#ffd9a0');
  });
}

/** A cow. kind: 0 Holstein, 1 Jersey, 2 Holstein calf. pose: graze / look / lie. */
export function cow(kind: number, pose: 'graze' | 'look' | 'lie', v = 0): HTMLCanvasElement {
  const calf = kind === 2;
  const s = calf ? 0.72 : 1;
  const W = 22;
  const H = 14;
  return art(
    `cow${kind}.${pose}.${v}`,
    W,
    H,
    () => {
      const white = '#f6ecdc';
      const hide = kind === 1 ? '#c98a56' : white;
      const patch = '#3a3046';
      const rim = '#ffdca0';
      const shade = kind === 1 ? '#8a5450' : '#b8a8b8';
      const gy = H - 1;
      const bx = 4;
      const bw = 13 * s;
      const by = pose === 'lie' ? gy - 5 * s : gy - 9 * s;
      const bh = 5.5 * s;
      // far legs (shaded)
      if (pose !== 'lie') {
        R(bx + 1.5, by + bh - 1, 1.2 * s, gy - by - bh + 1.5, shA(hide, 0.4));
        R(bx + bw - 3, by + bh - 1, 1.2 * s, gy - by - bh + 1.5, shA(hide, 0.4));
      }
      // body
      RR(bx, by, bw, bh, 2, hide);
      ell(bx + bw - 1.5, by + bh * 0.45, 2.5 * s, bh * 0.55, hide);
      ell(bx + 1.5, by + bh * 0.5, 2.2 * s, bh * 0.5, hide);
      // Holstein patches
      if (kind !== 1) {
        const r = rng(kind * 7 + v * 13 + 3);
        for (let i = 0; i < 4; i++) ell(bx + 2 + r() * (bw - 4), by + 1 + r() * (bh - 2), 1.2 + r() * 1.6, 1 + r() * 1.2, (_x, _y, o) => (o ? patch : null));
      }
      // underside shadow, rim light along the back (sun on the right)
      R(bx, by + bh - 1.5, bw + 2, 1.5, (_x, _y, o) => (o ? (o === col(patch) ? o : shade) : null));
      R(bx + 1, by - 0.5, bw, 1, (_x, _y, o) => (o ? (o === col(patch) ? '#6a5266' : rim) : null));
      // udder
      if (!calf && pose !== 'lie') ell(bx + bw * 0.62, by + bh + 0.3, 1.3, 0.9, '#f2a8a8');
      // near legs with hooves
      if (pose !== 'lie') {
        for (const lx of [bx + 0.8, bx + bw - 2]) {
          R(lx, by + bh - 1, 1.3 * s, gy - by - bh + 1.5, hide);
          R(lx, gy - 0.5, 1.3 * s, 1, '#4a3a4a');
        }
        R(bx + bw - 2 + 1, by + bh, 0.5, gy - by - bh, rim);
      }
      // tail with a tuft
      L(bx, by + 1, bx - 1, by + bh + 1, shA(hide, 0.2));
      R(bx - 1.5, by + bh + 1, 1, 1.5, kind === 1 ? '#6a3e3a' : patch);
      // head: down in the grass, up and looking at the bus, or resting
      const hx = bx + bw + 0.5;
      const hy = pose === 'graze' ? gy - 3.5 * s : pose === 'look' ? by - 2.5 * s : by - 0.5;
      if (pose === 'graze') {
        poly([[hx - 2, by + 1], [hx + 1, by + 1.5], [hx + 2.5, hy + 1], [hx + 0.5, hy + 2]], hide);
      }
      const face = kind === 1 ? '#b87a4a' : pose === 'look' ? patch : white;
      ell(hx + 1.2, hy + 1, 1.9 * s, 1.6 * s, face);
      ell(hx + 2.4 * s, hy + 1.8 * s, 1.2 * s, 1 * s, '#f0b4ac');
      if (pose === 'look') {
        // the watcher: white blaze, ears, one shiny eye
        R(hx + 0.8, hy - 0.2, 0.7, 2.2, white);
        R(hx - 0.6, hy - 0.4, 1, 0.6, face);
        R(hx + 2.4, hy - 0.6, 1, 0.6, face);
        P1(hx + 1.8, hy + 0.6, '#1f1830');
        P1(hx + 2.1, hy + 0.4, '#ffffff');
        // horns nubs
        P1(hx + 0.5, hy - 1, '#e8dcc0');
        P1(hx + 2, hy - 1, '#e8dcc0');
      } else {
        P1(hx + 1, hy + 0.5, '#2b2140');
        R(hx - 0.3, hy - 0.2, 0.8, 0.6, face);
      }
      R(hx, hy - 0.5, 3 * s, 0.5, (_x, _y, o) => (o ? liA(o, 0.35) : null));
      // a soft contact shadow, thrown left by the low sun
      R(bx - 4, gy - 0.5, bw + 3, 1, (_x, _y, o) => (o ? null : rgba('#4a3a5a', 0.35)));
    },
    false,
  );
}

/** A round hay bale catching the light. */
export function bale(v: number): HTMLCanvasElement {
  return art(`farm-bale${v}`, 13, 11, () => {
    const hay = '#e0b25a';
    RR(1, 1, 10, 9, 3, shA(hay, 0.18));
    ell(9, 5.5, 3.3, 4.5, hay);
    for (let a = 0; a < 18; a += 0.5) {
      const r0 = a * 0.22;
      P1(9 + Math.cos(a) * r0 * 0.7, 5.5 + Math.sin(a) * r0, shA(hay, 0.25));
    }
    R(1, 1, 8, 1, liA(hay, 0.3));
    R(11, 3, 0.5, 5, '#fff0c0');
    R(1, 2, 8, 8, (_x, _y, o) => (o && fn01(v) < 0.2 ? shA(o, 0.12) : null));
    R(-1, 9.5, 8, 1, rgba('#4a3a5a', 0.35));
  });
}

/** Fence posts and barbed wire on the shoulder (near layer, tiles). */
export function farmFence(light: Light): HTMLCanvasElement {
  const W = 56;
  const H = 30;
  return art(`farm-fence-${light}`, W, H, () => {
    const wood = light === 'sunset' ? '#7a5a5a' : '#8a6a5a';
    for (const px of [6, 34]) {
      R(px, 4, 3, H - 4, grainV(wood, 0.18, px));
      R(px + 2, 4, 1, H - 4, '#ffd8a0');
      R(px, 3.5, 3, 1, liA(wood, 0.3));
    }
    for (const wy of [7, 13, 19]) {
      for (let x = 0; x < W; x += 0.5) P1(x, wy + Math.sin((x / W) * Math.PI) * 0.8, '#5a4e60');
      for (let x = 3; x < W; x += 9) {
        const y = wy + Math.sin((x / W) * Math.PI) * 0.8;
        P1(x - 0.5, y - 0.5, '#5a4e60');
        P1(x + 0.5, y + 0.5, '#5a4e60');
        P1(x + 0.5, y - 0.5, '#ffd8a0');
      }
    }
  });
}

// ---------------------------------------------------------------- ground bands
export type GroundKind = 'sub' | 'hw' | 'farm' | 'town';
/** Ground band for a zone and depth (tiles horizontally). */
export function ground(kind: GroundKind, which: 'far' | 'mid' | 'near', h: number): HTMLCanvasElement {
  const W = 128;
  return art(`g-${kind}-${which}${h}`, W, h, () => {
    const pal: Record<GroundKind, { g: string; lo: string; hi: string; tip: string }> = {
      sub: { g: '#7eaa5e', lo: '#5e8a52', hi: '#a8cc72', tip: '#cfe28c' },
      hw: { g: '#7cae58', lo: '#5a8a4c', hi: '#a6d06a', tip: '#d8ec8a' },
      farm: { g: '#9aa24e', lo: '#6a6e4a', hi: '#d0bc5a', tip: '#ffe08a' },
      town: { g: '#8e9a50', lo: '#62624e', hi: '#e0aa60', tip: '#ffcf86' },
    };
    const p = pal[kind];
    if (which === 'far') {
      if (kind === 'farm' || kind === 'town') {
        // wheat and stubble in long stripes, catching the light
        R(0, 0, W, h, () => {
          const band = Math.floor(FY / 3);
          const c = ['#e2ae58', '#c89a4c', '#b6a050', '#e8c070', '#a89a52'][band % 5];
          return fn01(band) < 0.08 ? liA(c, 0.25) : c;
        });
        R(0, 0, W, 0.5, '#ffe2a0');
      } else {
        R(0, 0, W, h, grainH(p.g, 0.12, 3));
        R(0, 0, W, 0.5, p.hi);
        for (let x = 0; x < W; x += 24) R(x, 1, 10, 1, p.lo);
      }
      return;
    }
    if (which === 'mid') {
      R(0, 0, W, h, () => {
        const n = fn01(5);
        const stripe = Math.floor(FY / 4) % 2;
        const base = stripe ? p.g : mixc(p.g, p.lo, 0.25);
        return n < 0.1 ? p.lo : n > 0.93 ? p.hi : base;
      });
      R(0, 0, W, 1, p.hi);
      if (kind === 'sub') {
        // sidewalk and curb along the bottom
        R(0, h - 7, W, 4, tooth('#c8c0c4', 0.08, 2, 0.15));
        for (let x = 0; x < W; x += 12) R(x, h - 7, 0.5, 4, '#a8a0ac');
        R(0, h - 3, W, 1, '#e0dce0');
        R(0, h - 2, W, 2, '#5a5870');
      }
      return;
    }
    // near: thick grass with blades and seed heads over a gravel shoulder
    R(0, 0, W, h, () => {
      const n = fn01(7);
      return n < 0.14 ? p.lo : n > 0.9 ? p.hi : p.g;
    });
    for (let x = 0; x < W; x += 0.5) {
      const hh = 2 + hash2(Math.floor(x * 2), 1, kind.length) * 5;
      R(x, 4 - hh + 4, 0.5, hh, hash2(Math.floor(x * 2), 2, 3) < 0.5 ? p.lo : p.g);
      if (hash2(Math.floor(x * 2), 3, 9) < 0.06) {
        P1(x, 8 - hh, p.tip);
        P1(x, 8.5 - hh, p.hi);
      }
      if ((kind === 'town' || kind === 'sub') && hash2(Math.floor(x * 2), 4, 2) < 0.02) P1(x, 9 - hh, kind === 'town' ? '#ff9a7a' : '#fff6ee');
    }
    const gy = Math.min(h - 4, 16);
    R(0, gy, W, h - gy, tooth(kind === 'sub' ? '#6e6a80' : '#8a7a7a', 0.18, 13, 0.4));
    R(0, gy, W, 0.5, over(0.3));
    for (let x = 0; x < W; x += 0.5) if (hash2(Math.floor(x * 2), 8, 1) < 0.35) R(x, gy - 1, 0.5, 1 + hash2(Math.floor(x * 2), 9, 1) * 1.5, p.g);
  });
}

// ---------------------------------------------------------------- the town
/** The water tower, a giant turnbuckle pad (mid-far layer), lit from the right. */
export function waterTower(): HTMLCanvasElement {
  const W = 34;
  const H = 72;
  return art(
    'town-watertower',
    W,
    H,
    () => {
      const cx = W / 2;
      const leg = '#6a5476';
      for (const [x0, x1] of [[cx - 10, cx - 14], [cx - 4, cx - 5], [cx + 4, cx + 5], [cx + 10, cx + 14]] as [number, number][]) {
        L(x0, 34, x1, H - 1, leg);
        L(x0 + 0.5, 34, x1 + 0.5, H - 1, x0 > cx ? '#ffc890' : '#8a7494');
      }
      for (let y = 40; y < H - 4; y += 8) {
        const k = (y - 34) / (H - 35);
        const xl = cx - 10 - k * 4;
        const xr = cx + 10 + k * 4;
        L(xl, y, xr, y + 7, '#5a4a6a');
        L(xr, y, xl, y + 7, '#5a4a6a');
        R(xl, y, xr - xl, 0.5, '#7a6a8a');
      }
      R(cx - 13, 32, 26, 1.5, '#5a4a6a');
      for (let x = cx - 13; x < cx + 13; x += 2) R(x, 30, 0.5, 2, '#7a6a8a');
      R(cx - 13, 30, 26, 0.5, '#8a7a9a');
      // the padded tank
      RR(cx - 12, 6, 24, 25, 5, '#d0414c');
      R(cx - 12, 6, 7, 25, (_x, _y, o) => (o ? shA(o, 0.25) : null));
      R(cx + 6, 8, 5, 21, (_x, _y, o) => (o ? liA(o, 0.3) : null));
      R(cx + 10, 9, 1, 19, '#ffc8a0');
      for (const sy of [12.5, 18.5, 24.5]) {
        R(cx - 11, sy, 22, 0.5, '#8a2440');
        for (let x = cx - 10; x < cx + 11; x += 1.5) P1(x, sy - 0.5, '#f08a80');
      }
      for (const sy of [9, 26]) {
        R(cx - 12.5, sy, 25, 2, '#2f2a40');
        R(cx - 12.5, sy, 25, 0.5, '#4a4460');
        R(cx + 8, sy, 4, 0.5, '#ffb890');
      }
      RR(cx - 6, 13.5, 12, 8, 1, '#fff0d8');
      TC('TA', cx, 15, '#c9404c', FT, { bold: true });
      // rope ends
      for (const [ry, c] of [[14, '#e84a5a'], [18, '#f6efe6'], [22, '#5a7ad0']] as [number, string][]) {
        L(cx - 12, ry, cx - 15, ry + 4, c);
        L(cx + 11, ry, cx + 14, ry + 4, c);
      }
      // post and cap, aviation light
      R(cx - 1.5, 0, 3, 7, '#c8c0d8');
      R(cx + 0.5, 0, 1, 7, '#ffe8c8');
      P1(cx, 0, '#ff5a5a');
    },
    'soft',
  );
}

/** A glimpse of the Sportatorium's roof over the trees (mid-far layer). */
export function sportatoriumRoof(): HTMLCanvasElement {
  const W = 92;
  const H = 46;
  return art(
    'town-sporta',
    W,
    H,
    () => {
      const cx = W / 2;
      const wall = 30;
      // gambrel roof, standing-seam plum metal with lit seams on the sun side
      poly([[4, wall], [14, wall - 13], [cx, wall - 21], [W - 14, wall - 13], [W - 4, wall]], '#5a4a6e');
      R(4, wall - 21, W - 8, 22, (_x, _y, o) => {
        if (!o) return null;
        const right = FX / 2 > cx;
        const base = right ? '#7a6a90' : '#4e4670';
        return FX % 8 === 0 ? (right ? '#b8a8c8' : '#5e5680') : FX % 8 === 7 ? shA(base, 0.2) : base;
      });
      // the red gable band with its name board
      R(10, wall, W - 20, H - wall, grainV('#c86a52', 0.15, 3));
      R(cx + 12, wall, W - cx - 22, H - wall, (_x, _y, o) => (o ? liA(o, 0.25) : null));
      RR(cx - 30, wall + 2, 60, 8, 1, '#f2d9a8');
      RR(cx - 29, wall + 3, 58, 6, 1, '#fbecc8');
      TC('SPORTATORIUM', cx, wall + 3.5, '#a8343c', FT, {});
      // string lights along the eaves
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const x = 6 + t * (W - 12);
        const y = wall + 0.5 + Math.sin(t * Math.PI * 6) * 0.8 + 0.8;
        P1(x, y, ['#ffd34a', '#ff7a6a', '#8ad0ff', '#ffe8b0'][i % 4]);
      }
      // cupola and the weathervane
      R(cx - 4, wall - 29, 8, 8, grainV('#c4473f', 0.14, 4));
      R(cx - 2.5, wall - 27, 5, 4, '#3b2a4f');
      for (let x = cx - 2.5; x < cx + 2.5; x += 1.5) R(x, wall - 27, 0.5, 4, '#fbefd2');
      poly([[cx - 6, wall - 29], [cx, wall - 34], [cx + 6, wall - 29]], '#4e4670');
      R(cx - 0.25, wall - 41, 0.5, 7, '#4a3550');
      R(cx - 2, wall - 38, 4, 0.5, '#4a3550');
      P1(cx - 1, wall - 40, '#ffd34a');
      // the trees it hides behind
      for (let i = 0; i < 9; i++) {
        const tx = 2 + i * 11 + (i % 2) * 3;
        const s = 6 + (i % 3) * 1.5;
        const p = LEAF.sunset;
        ell(tx, H - s * 0.6, s, s * 0.8, p.shade);
        ell(tx + 1, H - s * 0.8, s * 0.7, s * 0.55, p.base);
        ell(tx + 2, H - s, s * 0.4, s * 0.3, p.lit);
      }
    },
    'soft',
  );
}

/** The welcome sign at the edge of town (near layer). */
export function welcomeSign(): HTMLCanvasElement {
  const W = 158;
  const H = 94;
  return art(
    'town-welcome',
    W,
    H,
    () => {
      const wood = '#7a4a3c';
      const teal = '#2f6a5a';
      const cream = '#fbf0d9';
      const gold = '#f6d38a';
      // posts
      for (const px of [22, W - 30]) {
        R(px, 50, 8, H - 58, grainV('#6a4436', 0.16, px));
        R(px + 6, 50, 2, H - 58, (_x, _y, o) => (o ? liA(o, 0.4) : null));
        R(px, 50, 8, 3, over(0.4));
      }
      // stone planter with flowers
      RR(8, H - 12, W - 16, 12, 2, '#a8949a');
      R(8, H - 12, W - 16, 12, (_x, _y, o) => {
        if (!o) return null;
        const row = Math.floor(FY / 7);
        if (FY % 7 === 0) return '#7a6670';
        if ((FX + row * 9) % 18 === 0) return '#7a6670';
        return fn01(4) < 0.1 ? '#c8b4b8' : null;
      });
      R(8, H - 12, W - 16, 1, '#d8c4c4');
      R(W - 30, H - 11, 22, 11, (_x, _y, o) => (o ? liA(o, 0.2) : null));
      for (let x = 10; x < W - 10; x += 0.5) {
        const n = hash2(Math.floor(x * 2), 1, 77);
        const hgt = 2 + n * 4;
        R(x, H - 12 - hgt, 0.5, hgt, n < 0.5 ? '#4f7a4a' : '#6a9a4e');
        if (hash2(Math.floor(x * 2), 2, 77) < 0.22) {
          const fc = ['#ff8a5a', '#ffd34a', '#ff6a8a', '#fff2e0', '#c87ae0'][Math.floor(hash2(Math.floor(x * 2), 3, 77) * 5)];
          P1(x, H - 12 - hgt, fc);
          P1(x + 0.5, H - 12 - hgt + 0.5, fc);
          P1(x, H - 11.5 - hgt, liA(fc, 0.4));
        }
      }
      // the board: routed wood frame with an arched crest
      RR(0, 6, W, 46, 3, wood);
      ell(W / 2, 8, 36, 8, wood);
      RR(3, 9, W - 6, 40, 2, teal);
      ell(W / 2, 10, 33, 6, teal);
      R(0, 6, W, 46, (_x, _y, o) => (o === col(wood) ? (fn01(3) < 0.15 ? shA(wood, 0.15) : FY % 5 === 0 ? shA(wood, 0.08) : null) : null));
      R(3, 9, W - 6, 1, '#4f8a72');
      // the crest: a turnbuckle with three ropes
      RR(W / 2 - 5, 3, 10, 6, 2, '#c9404c');
      R(W / 2 - 4, 3.5, 8, 0.5, '#f08a80');
      R(W / 2 - 5, 5.5, 10, 0.5, '#8a2440');
      for (const [ry, c] of [[1, '#e84a5a'], [0, '#f6efe6'], [-1, '#5a7ad0']] as [number, string][]) {
        R(W / 2 - 24, 6 + ry * 1.5 - 0.5, 18, 0.5, c);
        R(W / 2 + 6, 6 + ry * 1.5 - 0.5, 18, 0.5, c);
      }
      // lettering
      TC('WELCOME TO', W / 2, 13, cream, FT, {});
      TC('TURNBUCKLE ALLEY', W / 2, 21, gold, FM, { bold: true, shadow: '#1e3e36' });
      TC('Home of the Velvet Hammers', W / 2, 33, cream, FM, {});
      TC('POP. 2,814', W / 2, 42, '#cfe8d8', FT, {});
      R(W / 2 - 30, 40, 60, 0.5, '#4f8a72');
      // golden hour: warm along the top-right, rim on the frame's sun side
      R(W - 6, 6, 6, 46, (_x, _y, o) => (o ? liA(o, 0.3) : null));
      R(0, 6, W, 1, (_x, _y, o) => (o ? liA(o, 0.35) : null));
      R(3, 9, 30, 40, (_x, _y, o) => (o === col(teal) ? shA(o, 0.12) : null));
      // the star sticker someone added
      circ(W - 16, 15, 4, '#f4b63f');
      for (let a = 0; a < 5; a++) {
        const ang = (a / 5) * Math.PI * 2 - Math.PI / 2;
        P1(W - 16 + Math.cos(ang) * 4.5, 15 + Math.sin(ang) * 4.5, '#f4b63f');
      }
      P1(W - 17, 14, '#fff2c0');
      // cast shadow on the ground, thrown left
      R(0, H - 1, W - 24, 1, rgba('#3a2a4a', 0.4));
    },
    'soft',
  );
}

export { TW };
