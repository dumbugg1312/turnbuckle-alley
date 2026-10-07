/**
 * Grandma's backyard (Golden Hour Storybook): debris to clear, the old
 * backyard ring in its three states, training equipment, merch machines and
 * the yard bits. Built at double density (D-018) with the dense helpers from
 * props.ts and sized against a 30 px adult (D-019); draw() only blits.
 */
import { registerObject } from '../../world/registry';
import type { MapObject, ObjectKind } from '../../world/types';
import { FT, T, TC } from '../font';
import { AK, type Color, circ, ell, FX, FY, hash2, liA, mixc, P, P1, poly, R, rng, RR, shA } from '../kit';
import { blit as blitArt, SH1, SH2, type Art } from './buildings';
import { frame, HONEY, light, OAK, PAL, phaseOf, sparkle, variant, WALNUT, type Wood } from './interiors';
import { bolt, cylPaint, dart, fd, fh, fx, fy, glassF, H1, KK, L1, ramp, shadowF, TF, TFC, tuftsF, V1, woodPaint, woodPaintV } from './props';

function reg(kind: string, def: ObjectKind): void {
  registerObject(kind, def);
}
const clearLabel = (o: MapObject) => (o.props.debris ? 'Clear' : null);

// ================================================================ build + cache
type Shape = ['e', number, number, number, number] | ['r', number, number, number, number];
interface FarmArt {
  outline?: boolean;
  /** Ground shadow shapes in body coordinates (ellipses / rects). */
  shadow?: Shape[];
}
/** Dense build-and-cache with a 5 px pad for the baked ground shadow. */
function art(key: string, w: number, h: number, body: () => void, o: FarmArt = {}): Art {
  return dart('farm|' + key, w, h, body, {
    outline: o.outline,
    pad: [5, 5, 5, 5],
    shadow: o.shadow
      ? (ox, oy) => {
          for (const s of o.shadow!) {
            if (s[0] === 'e') shadowF(ox + s[1], oy + s[2], s[3], s[4]);
            else {
              const y0 = oy + s[2];
              const h = s[4];
              // contact-dark at the top, fading out with distance
              R(ox + s[1], y0, s[3], h, () => {
                const v = (fy() - y0) / h;
                return v < 0.35 ? SH1 : fd(Math.round((1 - v) * 15)) ? SH2 : null;
              });
            }
          }
        }
      : undefined,
  });
}
const blit = (ctx: CanvasRenderingContext2D, o: MapObject, a: Art) => blitArt(ctx, a, o);
const tufts = (x0: number, x1: number, y: number, seed: number, dens = 0.5) => tuftsF(x0, x1, y + 0.5, seed, dens * 0.8);
/** Planks with grain, a shaded underside and nail heads. */
function plank(x: number, y: number, w: number, h: number, wd: Wood, seed: number, nails = true): void {
  R(x, y, w, h, woodPaint(wd.b, seed, 0.18));
  H1(x, x + w, y, wd.l);
  H1(x, x + w, y + h - 0.5, wd.d);
  if (nails) {
    bolt(x + 0.5, y + h / 2 - 0.25, '#8a8498');
    bolt(x + w - 1, y + h / 2 - 0.25, '#8a8498');
  }
}

// ================================================================ debris

reg('weeds', {
  solid: { x: -6, y: -5, w: 12, h: 4 },
  label: clearLabel,
  draw: (ctx, o) => {
    const v = variant(o, 3);
    blit(
      ctx,
      o,
      art(
        `weeds|${v}`,
        16,
        16,
        () => {
          if (v === 0) {
            // tall grass clump with a dandelion and one gone to seed
            const r = rng(11);
            for (let i = 0; i < 26; i++) {
              const x = 2 + r() * 12;
              const h = 5 + r() * 9;
              const lean = (x - 8) * 0.35 + (r() - 0.5) * 2;
              const c = ['#4f7a5a', '#5e8a5a', '#6f9a5a', '#8ab868'][Math.floor(r() * 4)];
              L1(x, 15.5, x + lean, 15.5 - h, c);
              P1(x + lean, 15.5 - h, '#b4d48e');
            }
            L1(8, 15, 8.5, 4, '#6f9a5a');
            for (let a = 0; a < Math.PI * 2; a += 0.6) P1(8.5 + Math.cos(a) * 1.6, 3 + Math.sin(a) * 1.2, a < 3 ? '#ffe070' : '#e2b244');
            ell(8.5, 3, 1, 0.8, '#ffd050');
            P1(8, 2.5, '#fff1c2');
            L1(11, 15, 11.5, 6, '#6f9a5a');
            for (let a = 0; a < Math.PI * 2; a += 0.5) P1(11.5 + Math.cos(a) * 1.5, 5 + Math.sin(a) * 1.5, '#f6f2ea');
            P1(11.5, 5, '#c8b8a0');
            R(2, 15, 12, 1, '#4f7a5a');
          } else if (v === 1) {
            // thistle: spiky lobed leaves and a purple brush flower
            for (const [x, y, s] of [[3.5, 13, -1], [12.5, 13, 1], [5, 9, -1], [11, 9, 1]] as [number, number, number][]) {
              poly([[8, y + 1], [x, y - 2], [x - s, y - 3], [x + s * 1.5, y - 1], [8, y]], '#5e8a5a');
              L1(8, y + 0.5, x - s * 0.5, y - 2.5, '#8ab868');
              for (let k = 0; k < 3; k++) P1(8 + (x - 8) * (0.4 + k * 0.25), y - 1 - k * 0.6 - 0.5, '#d8e8b0');
            }
            V1(7.75, 4, 15.5, '#4f7a5a');
            ell(8, 4.5, 2.2, 1.8, '#7a9a58');
            for (let k = 0; k < 6; k++) P1(6.5 + k * 0.5, 4 + (k % 2) * 0.5, '#5a7a4a');
            for (let x = 5.5; x <= 10.5; x += 0.5) {
              const top = 2.5 - Math.cos((x - 8) * 0.6) * 1.2;
              V1(x, top, 3.5, ((x * 2) | 0) % 2 ? '#b070d0' : '#d090f0');
            }
            P1(8, 1, '#e8b0ff');
          } else {
            // bramble mound with tiny white flowers and blackberries
            ell(8, 11, 7.5, 5, '#3f6a50');
            ell(7.5, 10.5, 6.5, 4.2, () => (fh(31, 2, 1) < 0.3 ? '#5e8a5a' : fh(32) < 0.2 ? '#8ab868' : '#6f9a5a'));
            ell(6, 9, 3, 1.8, () => (fh(33, 2, 1) < 0.4 ? '#8ab868' : '#a8cc78'));
            for (const [x, y] of [[4, 9], [9, 7], [12, 11], [6, 13], [11, 8]]) {
              for (const [dx, dy] of [[0, -0.5], [-0.5, 0], [0.5, 0], [0, 0.5]]) P1(x + dx, y + dy, '#fffaf0');
              P1(x, y, '#ffd050');
            }
            for (const [x, y] of [[13, 12], [3, 12], [7, 11.5]]) {
              ell(x, y, 0.7, 0.7, '#4a2a48');
              P1(x - 0.5, y - 0.5, '#a870a8');
            }
            // thorny canes arcing out
            L1(1, 14, 3, 8, '#7a4a48');
            L1(15, 14, 13.5, 7, '#7a4a48');
            P1(2, 10.5, '#c8a090');
          }
        },
        { shadow: [['e', 9, 15, 6, 2]] },
      ),
    );
  },
});

reg('junk', {
  solid: { x: -11, y: -10, w: 22, h: 9 },
  label: clearLabel,
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'junk',
        24,
        20,
        () => {
          // an old washing machine on its side: enamel, rust blooms, a porthole
          RR(1, 4, 13, 14, 2, cylPaint(1, 13, '#e0d8c8'));
          R(1, 4, 13, 14, (_x, _y, c) => {
            if (!c) return c;
            const h = hash2(FX >> 1, FY >> 1, 301);
            return h < 0.12 ? '#a85a3a' : h < 0.2 ? '#c8784a' : h > 0.97 ? '#f6f0e4' : c;
          });
          // rust streaks running down from the seams
          for (const sx of [3, 9.5]) for (let y = 5; y < 17; y += 0.5) if (hash2(sx * 2, y * 2, 305) < 0.6) P1(sx, y, '#b8683a');
          H1(2, 13, 4, '#fbf4e8');
          circ(7.5, 11, 4, '#8a84a8');
          circ(7.5, 11, 3.2, '#4a4462');
          glassF(5, 8.5, 5, 5, '#5a6a90', undefined, 0.8);
          circ(7.5, 11, 3.2, (_x, _y, c) => c);
          P1(6, 9.5, '#d8e0f8');
          R(1, 17, 13, 1, '#8a7a7a');
          // a wood-grain TV with a cracked screen and rabbit ears
          RR(12, 8, 11, 10, 1, woodPaint('#8a5a3e', 307));
          H1(12.5, 22.5, 8, '#b07a54');
          RR(13, 9, 7, 6.5, 1, '#3a3a4e');
          glassF(13.5, 9.5, 6, 5.5, '#4a4a60', undefined, 0.6);
          L1(14.5, 10, 17, 12.5, '#c8d0e8');
          L1(17, 12.5, 19, 11, '#c8d0e8');
          L1(17, 12.5, 16, 15, '#9aa2c8');
          circ(21, 11, 0.8, '#d8c8b0');
          circ(21, 13.5, 0.6, '#d8c8b0');
          L1(17, 8, 15, 4.5, '#9aa2c8');
          L1(18, 8, 21, 5, '#9aa2c8');
          // hubcap, a lone boot, a coil of garden hose
          ell(19, 18, 3, 1.4, '#c8cce0');
          ell(19, 17.8, 2, 0.8, '#eef0fa');
          P1(18, 17.5, '#ffffff');
          R(2, 1, 4, 3, woodPaint('#6a3e30', 309));
          R(5, 2, 2.5, 2, '#5a3428');
          H1(2, 7.5, 3.5, '#3a2428');
          for (let k = 0; k < 3; k++) ell(11, 4.5, 3 - k * 0.8, 1.6 - k * 0.4, k % 2 ? '#2f6a4a' : '#3f8a5a');
          ell(11, 4.5, 0.8, 0.4, '#5aa070');
          // weeds growing through it all
          tufts(0, 24, 19, 303, 0.6);
          L1(15, 7, 15.5, 2, '#6f9a5a');
          P1(15.5, 1.5, '#ffd050');
        },
        { shadow: [['r', 2, 16, 23, 5]] },
      ),
    ),
});

reg('stone', {
  solid: { x: -7, y: -7, w: 14, h: 6 },
  label: clearLabel,
  draw: (ctx, o) => {
    const v = variant(o, 2);
    blit(
      ctx,
      o,
      art(
        `stone|${v}`,
        16,
        14,
        () => {
          const rp = ramp(v ? '#9a92a8' : '#a8a0b0');
          const pts: [number, number][] = [[1, 13], [1, 8], [4, 3], [9, 1], [13, 3], [15, 8], [15, 13]];
          poly(pts, () => {
            // faceted planes: top-left lit, right face shaded, granite speckle
            const x = fx();
            const y = fy();
            let s = x + y * 0.6 < 9 ? 0.9 : x > 11.5 ? 0.3 : y > 9 ? 0.45 : 0.62;
            s += (fh(311 + v, 1, 1) - 0.5) * 0.25;
            return rp[s < 0.2 ? 0 : s < 0.42 ? 1 : s < 0.72 ? 2 : s < 0.92 ? 3 : 4];
          });
          L1(4, 3.5, 9, 1.5, rp[4]);
          L1(6, 8, 9, 11, rp[0]);
          L1(9, 11, 8.5, 13, rp[0]);
          L1(11.5, 4, 12, 13, rp[1]);
          // moss cap and lichen
          ell(9.5, 2.5, 3, 1, () => (fh(313, 2, 1) < 0.5 ? '#6f9a5a' : '#8ab868'));
          P1(4, 10, '#d8d0a0');
          P1(4.5, 10.5, '#e8e0b0');
          tufts(0, 16, 13, 311 + v, 0.5);
        },
        { shadow: [['e', 9, 13, 7, 2]] },
      ),
    );
  },
});

reg('stump', {
  solid: { x: -7, y: -8, w: 14, h: 7 },
  label: clearLabel,
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'stump',
        16,
        14,
        () => {
          // bark sides with deep furrows and flaring roots
          R(2, 4, 12, 8.5, () => {
            const u = (fx() - 2) / 12;
            let s = u < 0.18 ? 0.9 : u < 0.55 ? 0.6 : u < 0.82 ? 0.35 : 0.15;
            if (hash2(FX, FY >> 2, 321) < 0.25) s -= 0.25;
            const rp = ramp('#7a4a38');
            return rp[s < 0.2 ? 0 : s < 0.42 ? 1 : s < 0.72 ? 2 : s < 0.92 ? 3 : 4];
          });
          poly([[-0.5, 13], [2, 8.5], [4, 13]], '#8a5a44');
          L1(0, 12.5, 2, 9, '#a8704f');
          poly([[12, 13], [14, 8.5], [16.5, 13]], '#5e3830');
          poly([[6, 13], [7.5, 11], [9, 13]], '#6a4030');
          // cut top: growth rings, a radial crack, sap and an axe notch
          ell(8, 4, 6, 2.6, '#d8a870');
          for (let k = 1; k < 6; k++) {
            const t = k / 6;
            for (let a = 0; a < Math.PI * 2; a += 0.12) P1(8 + Math.cos(a) * 6 * t, 4 + Math.sin(a) * 2.6 * t, k % 2 ? '#c08a5a' : '#e6bc84');
          }
          P1(8, 4, '#8a5a3e');
          L1(8, 4, 13, 3, '#6e4430');
          L1(8.5, 4.5, 4, 6, '#8a5a3e');
          P1(5, 3, '#f2c88a');
          poly([[12, 2.5], [14, 3.5], [13, 5]], '#a8784e');
          // a little family of mushrooms at the foot
          for (const [x, s] of [[11, 1.2], [12.8, 0.9], [3.5, 0.8]] as [number, number][]) {
            V1(x, 12 - s, 12.5, '#f2eade');
            ell(x + 0.25, 11.5 - s * 1.2, s * 1.3, s * 0.7, '#d8434b');
            P1(x - 0.25, 11.2 - s * 1.4, '#ffffff');
            P1(x + 0.5, 11.5 - s * 1.2, '#ffe0d8');
          }
          tufts(0, 16, 13, 321, 0.5);
        },
        { shadow: [['e', 9, 13, 7, 2]] },
      ),
    ),
});

reg('old-tire', {
  solid: { x: -7, y: -7, w: 14, h: 6 },
  label: clearLabel,
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'old-tire',
        16,
        12,
        () => {
          // a tyre lying flat: tread blocks, sidewall lettering, rainwater in the middle
          ell(8, 7, 7.5, 4.5, '#3a3448');
          ell(8, 6.5, 7, 4, '#4e4862');
          for (let k = 0; k < 28; k++) {
            const a = (k / 28) * Math.PI * 2;
            P1(8 + Math.cos(a) * 6.75, 6.5 + Math.sin(a) * 3.8, k % 2 ? '#3a3448' : '#2b2140');
          }
          for (let a = 3.6; a < 5.6; a += 0.22) P1(8 + Math.cos(a) * 5.4, 6.5 + Math.sin(a) * 2.9, '#7a7498');
          ell(8, 6.5, 3.6, 1.8, '#2b2140');
          ell(8, 6.8, 3, 1.3, '#5a7ab0');
          H1(6.5, 9, 6.5, '#a8c8f0');
          P1(9.5, 7, '#d8e8ff');
          // weeds poking through the hole, a leaf floating
          L1(9, 6, 9.5, 2, '#6f9a5a');
          P1(10, 2, '#8ab868');
          P1(6.5, 7, '#e07a3a');
          tufts(0, 16, 11, 331, 0.4);
        },
        { shadow: [['e', 9, 10, 7, 2]] },
      ),
    ),
});

// ================================================================ the backyard ring

type RingState = 'overgrown' | 'clean' | 'deluxe';
function ringState(o: MapObject): RingState {
  const s = o.props.state;
  return s === 'clean' || s === 'deluxe' ? s : 'overgrown';
}
const LED = ['#ff5d8f', '#ffd050', '#5ff2d6', '#a888ff'];
/** Smooth value noise in 0..1 (for soft weathering patches). */
function vn(x: number, y: number, seed = 341): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const tx = x - xi;
  const ty = y - yi;
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
}
const STAR = ['....#....', '...###...', '#########', '.#######.', '..#####..', '.##...##.', '##.....##'];
/** Ring geometry (kept from the original layout so solids and sorting don't move). */
const RG = { W: 96, H: 72, mx: 6, my: 15, mw: 84, mh: 37, apron: 18, postH: 17 };
const ropeY = (yb: number, h: number, i: number, front: boolean) => yb - 4 - Math.floor((h - 4) / 3) * (i + 1) + (front ? 0 : 1) + 1;

/** One rope: a lit top fibre, the rope colour, a shaded underside, tape wraps. */
function rope(x0: number, y0: number, x1: number, y1: number, sag: number, c: Color, tape: Color | null, frayed: boolean): void {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * KK * 1.5);
  const lit = liA(c, 0.45);
  const dk = shA(c, 0.4);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t + sag * 4 * t * (1 - t);
    // a slow twist: every few fine pixels the lit fibre dips
    const tw = Math.floor(i / 3) % 3 === 0;
    P1(x, y, tw ? c : lit);
    P1(x, y + 0.5, c);
    P1(x, y + 1, dk);
    if (frayed && hash2(i, 7, 401) < 0.05) P1(x, y + 1.5, mixc(c, '#e8dcc8', 0.5));
  }
  if (tape) {
    for (const tt of [0.5]) {
      const x = x0 + (x1 - x0) * tt;
      const y = y0 + (y1 - y0) * tt + sag * 4 * tt * (1 - tt);
      R(x - 1, y - 0.5, 2, 2, tape);
      H1(x - 1, x + 1, y - 0.5, liA(tape, 0.5));
      V1(x + 0.5, y, y + 1.5, shA(tape, 0.3));
    }
  }
}
/** A steel corner post with three turnbuckle pads (or bare, rusted turnbuckles). */
function ringPost(x: number, yb: number, h: number, state: RingState, front: boolean, seed: number): void {
  const over = state === 'overgrown';
  const steel = over ? '#9a8a8a' : state === 'deluxe' ? '#e8e8f2' : '#b8bcd8';
  R(x - 1.5, yb - h, 4.5, h, shA(steel, 0.65));
  R(x - 1, yb - h, 3.5, h, cylPaint(x - 1, 3.5, steel));
  // post cap
  RR(x - 1.5, yb - h - 1.5, 4.5, 2.5, 1, ramp(steel)[3]);
  H1(x - 1, x + 2.5, yb - h - 1.5, ramp(steel)[4]);
  if (over) for (let y = yb - h; y < yb; y += 0.5) if (hash2(x * 2, y * 2, seed) < 0.18) P1(x + (hash2(y * 2, x, seed) < 0.5 ? -0.5 : 1.5), y, '#a8603a');
  const pads = over ? ['#8a5a5a', '#c8b8a0', '#5a5a7a'] : ['#d8404e', '#f6f0f4', '#4a6ad0'];
  const step = Math.floor((h - 4) / 3);
  for (let i = 0; i < 3; i++) {
    const py = yb - 4 - step * (i + 1) + (front ? 0 : 1);
    if (over && i === (seed % 3)) {
      // pad long gone: the bare turnbuckle, eye bolts and a rusty barrel
      R(x - 1.5, py + 0.5, 4.5, 2, '#8a7a7a');
      H1(x - 1.5, x + 3, py + 0.5, '#c8b8b0');
      ell(x - 1.5, py + 1.5, 0.8, 0.8, '#6a6a7a');
      ell(x + 3, py + 1.5, 0.8, 0.8, '#6a6a7a');
      P1(x + 0.5, py + 1.5, '#a8603a');
      continue;
    }
    const c = pads[i];
    const rp = ramp(c);
    RR(x - 2, py, 5.5, 4, 1, () => {
      const u = (fx() - (x - 2)) / 5.5;
      const v = (fy() - py) / 4;
      const s = 0.85 - u * 0.55 - v * 0.25;
      return rp[s < 0.2 ? 0 : s < 0.42 ? 1 : s < 0.72 ? 2 : s < 0.92 ? 3 : 4];
    });
    // stitched seam and the lace-up back
    H1(x - 1.5, x + 3, py + 2, shA(c, 0.25));
    for (let k = 0; k < 4; k++) P1(x - 1.25 + k * 1.25, py + 2, liA(c, 0.5));
    if (over) {
      // faded, split, duct-taped
      P1(x + 2, py + 3, '#e8dcc8');
      if (i === 1) R(x - 1, py + 0.5, 2.5, 1.5, '#b8b8c8');
    }
  }
}
function backyardRing(state: RingState, f: number): void {
  const over = state === 'overgrown';
  const deluxe = state === 'deluxe';
  const { mx, my, mw, mh, apron, postH } = RG;
  const x0 = mx;
  const x1 = mx + mw - 1;
  const yF = my + mh;
  const matC = over ? '#cbbfa8' : '#efe6d6';
  const mp = ramp(matC);
  // ---- the mat: woven canvas, darker under the back ropes
  R(mx, my, mw, mh, () => {
    const weave = (FX + (FY >> 1)) % 4 === 0 || (FY + (FX >> 1)) % 5 === 0;
    let s = 0.68 + (weave ? -0.06 : 0) + (fh(261, 3, 3) - 0.5) * 0.06;
    const dy = fy() - my;
    if (dy < 2.5) s -= 0.2 * (1 - dy / 2.5);
    const dx = Math.min(fx() - mx, mx + mw - fx());
    if (dx < 2) s -= 0.12;
    return mp[s < 0.2 ? 0 : s < 0.42 ? 1 : s < 0.75 ? 2 : s < 0.92 ? 3 : 4];
  });
  if (over) {
    // stains: water rings, rust drips from the corners, moss, leaf litter, a tear
    // sun-bleached and weather-browned in soft patches (smooth value noise, dithered)
    R(mx, my, mw, mh, (_x, _y, c) => {
      const n = vn(fx() / 7, fy() / 5);
      if (n < 0.3) return fd(Math.round((0.3 - n) * 50)) ? mixc(c, '#a89a80', 0.4) : c;
      if (n > 0.75) return fd(Math.round((n - 0.75) * 50)) ? mixc(c, '#e6dcc6', 0.5) : c;
      return c;
    });
    for (const [cx, cy, r] of [[28, 30, 7], [70, 22, 5], [52, 44, 4]] as [number, number, number][]) {
      ell(cx, cy, r, r * 0.5, (_x, _y, c) => mixc(c, '#9a8a6a', 0.22));
      for (let a = 0; a < Math.PI * 2; a += 0.08) P1(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.5, mixc(matC, '#7a6a50', 0.55));
    }
    for (const [sx, sy] of [[mx + 3, my + 1], [x1 - 4, my + 1]]) for (let k = 0; k < 6; k += 0.5) P1(sx + Math.sin(k) * 0.5, sy + k, '#b8784a');
    const r = rng(342);
    for (let k = 0; k < 40; k++) {
      const x = mx + 2 + r() * (mw - 4);
      const y = my + 2 + r() * (mh - 4);
      const c = ['#d8843a', '#c8603a', '#e8b050', '#a8582a'][k % 4];
      P1(x, y, c);
      P1(x + 0.5, y, shA(c, 0.2));
      if (k % 3 === 0) P1(x, y + 0.5, liA(c, 0.3));
    }
    ell(64, 40, 6, 3, () => (fh(343, 2, 1) < 0.4 ? '#6a8a50' : '#7a9a5a'));
    ell(63, 39.5, 4, 1.8, () => (fh(344, 2, 1) < 0.4 ? '#8ab060' : '#9ac070'));
    // a tear in the canvas with grass pushing through
    poly([[44, 22], [52, 23.5], [51.5, 25], [45, 23.5]], '#7a6a50');
    L1(44, 22, 52, 23.5, '#e8dcc4');
    tufts(45, 51.5, 24.5, 343, 0.9);
    // the faded painted star from Grandma's day
    STAR.forEach((row, yy) => {
      for (let xx = 0; xx < row.length; xx++) if (row[xx] === '#') R(44 + xx, 27 + yy, 1, 1, (_x, _y, c) => (fh(345) < 0.25 ? c : mixc(c, '#d8b070', 0.6)));
    });
  } else {
    // repainted Duchess star with a lit edge, boot scuffs, a sweat mark
    const sc = deluxe ? '#ffd050' : '#f2b84a';
    STAR.forEach((row, yy) => {
      for (let xx = 0; xx < row.length; xx++) if (row[xx] === '#') R(44 + xx, 27 + yy, 1, 1, yy < 3 ? liA(sc, 0.2) : sc);
    });
    P1(48, 27.5, '#fff4c0');
    for (const [x, y] of [[30, 38], [62, 25], [56, 46], [22, 26]]) {
      L1(x, y, x + 2, y + 0.5, mp[1]);
      P1(x + 1, y + 1, mp[1]);
    }
    ell(36, 44, 2.5, 1, (_x, _y, c) => mixc(c, '#c8bca8', 0.3));
    H1(mx + 3, mx + mw - 4, my + mh - 3, '#ddd2c0');
    if (deluxe) {
      ell(48, 30, 18, 8, (_x, _y, c) => (fd(3) ? mixc(c, '#d8cce8', 0.5) : c));
      for (let a = 0; a < Math.PI * 2; a += 0.05) P1(48 + Math.cos(a) * 18, 30 + Math.sin(a) * 8, '#c8b8e0');
    }
  }
  // ---- back posts, back ropes, side ropes
  const ropes: Color[] = over ? ['#a87a6a', '#c8bcae', '#7a7a9a'] : ['#e8404e', '#f6f0f4', '#4a6ad0'];
  const tapes: (Color | null)[] = over ? [null, '#b8b8c8', null] : ['#f6f0f4', '#e8404e', '#f6f0f4'];
  const sag = over ? 3 : 0.5;
  ringPost(x0 + 1, my, postH - 4, state, false, 1);
  ringPost(x1 - 2, my, postH - 4, state, false, 2);
  for (let i = 0; i < 3; i++) {
    const yb = ropeY(my, postH - 4, i, false);
    const yf = ropeY(yF + 2, postH, i, true);
    rope(x0 + 4, yb, x1 - 3, yb, sag, ropes[i], tapes[i], over);
    rope(x0 + 1, yb, x0, yf, 0, ropes[i], null, over);
    rope(x1 - 1, yb, x1, yf, 0, shA(ropes[i], 0.12), null, over);
  }
  // ---- apron: canvas lip, then the skirt with soft folds
  const skirt = over ? '#5a5a7a' : deluxe ? '#3a3478' : '#4a5a9a';
  const sp = ramp(skirt);
  R(mx - 2, yF, mw + 4, 2, () => (fy() < yF + 0.5 ? mp[4] : mp[3]));
  R(mx - 2, yF + 2, mw + 4, apron - 2, () => {
    const x = fx();
    const fold = Math.sin(x * 0.75) * 0.6 + Math.sin(x * 0.31 + 1) * 0.35;
    const v = (fy() - yF - 2) / (apron - 2);
    let s = 0.6 + fold * 0.24 - v * 0.16;
    if (v < 0.08) s -= 0.25; // shadow under the lip
    return sp[s < 0.2 ? 0 : s < 0.42 ? 1 : s < 0.72 ? 2 : s < 0.92 ? 3 : 4];
  });
  H1(mx - 2, mx + mw + 2, yF + apron - 0.5, shA(skirt, 0.7));
  V1(mx - 2, yF, yF + apron, shA(skirt, 0.6));
  V1(mx + mw + 1.5, yF, yF + apron, shA(skirt, 0.75));
  V1(mx - 0.5, my, yF, shA(matC, 0.45));
  V1(mx + mw, my, yF, shA(matC, 0.55));
  for (let x = mx - 1; x < mx + mw + 2; x += 1.5) P1(x, yF + apron - 1.5, sp[3]);
  const y = yF + 2;
  if (over) {
    // torn, faded skirt: patches, a hole, mud splash, the old hand-painted name barely there
    R(mx - 2, y + 2, mw + 4, apron - 4, (_x, _y, c) => {
      const n = vn(fx() / 6, fy() / 4, 344);
      return n > 0.62 && fd(Math.round((n - 0.62) * 60)) ? mixc(c, '#9a9ab0', 0.45) : c;
    });
    T('DUPREE', 30, y + 6, (_x: number, _y: number, c: number) => (fh(346) < 0.35 ? c : '#7a7a96'), FT, { ls: 2 });
    R(16, y + 4, 6, 5, '#8a6a5a');
    for (let k = 0; k < 6; k += 1) P1(16 + k, y + 4, '#c8a888');
    for (let k = 0; k < 5; k += 1) P1(16, y + 4 + k, '#c8a888');
    poly([[70, y + 9], [74, y + 8.5], [73.5, y + 13], [70.5, y + 12.5]], AK);
    L1(70, y + 9, 74, y + 8.5, '#8a8aa0');
    R(mx - 2, y + 12, mw + 4, 4, (_x, _y, c) => (fd(fy() > y + 14 ? 10 : 5) ? mixc(c, '#7a5a40', 0.6) : c));
    tufts(mx - 2, mx + mw + 2, y + apron - 3, 345, 0.7);
  } else {
    TC(deluxe ? 'THE DUCHESS' : 'DUPREE', 48, y + 6, deluxe ? '#ffd560' : '#f2c860', FT, { ls: deluxe ? 0 : 1 });
    H1(30, 66, y + 12.5, deluxe ? '#ffd560' : sp[3]);
    for (const sx of [12, 80]) {
      ['..#..', '.###.', '#####', '.###.', '.#.#.'].forEach((row, yy) => {
        for (let xx = 0; xx < 5; xx++) if (row[xx] === '#') P(sx + xx, y + 5 + yy, '#f6f0f4');
      });
    }
    // steel ring steps at the front-right corner
    R(82, y + 9, 10, 2, cylPaint(82, 10, '#9aa2c8'));
    R(84, y + 11, 8, 2, cylPaint(84, 8, '#8a8aaa'));
    R(86, y + 13, 6, 2, cylPaint(86, 6, '#7a7a9a'));
    for (const sy of [9, 11, 13]) H1(82 + (sy - 9), 92, y + sy, '#e8ecf8');
  }
  // ---- front posts and front ropes
  ringPost(x0, yF + 2, postH, state, true, 3);
  ringPost(x1 - 1, yF + 2, postH, state, true, 4);
  for (let i = 0; i < 3; i++) {
    const yf = ropeY(yF + 2, postH, i, true);
    rope(x0 + 3, yf, x1 - 2, yf, sag, ropes[i], tapes[i], over);
  }
  if (over) {
    // vines climbing the posts and wrapping the ropes, a bird's nest on a turnbuckle
    const vine = (x: number, y0: number, y1: number, seed: number) => {
      for (let yy = y0; yy < y1; yy += 0.5) {
        const dx = Math.sin(yy * 0.8 + seed) * 1.5;
        P1(x + dx, yy, '#4f7a5a');
        if (((yy * 2) | 0) % 5 === seed % 5) {
          ell(x + dx - 0.8, yy, 0.8, 0.5, '#6f9a5a');
          P1(x + dx - 1, yy - 0.5, '#8ab868');
        }
      }
    };
    vine(6, 34, 70, 1);
    vine(89, 36, 70, 2);
    vine(8, 0, 14, 3);
    const frontRope = ropeY(yF + 2, postH, 0, true);
    for (let x = 12; x < 86; x += 0.5) {
      const t = (x - 9) / 78;
      const yy = frontRope + sag * 4 * t * (1 - t) + Math.sin(x * 0.7) * 1;
      if (((x * 2) | 0) % 3 === 0) P1(x, yy, ((x * 2) | 0) % 9 === 0 ? '#8ab868' : '#4f7a5a');
      if (((x * 2) | 0) % 23 === 0) {
        ell(x, yy - 0.5, 0.8, 0.6, '#ff94b4');
        P1(x, yy - 0.5, '#fff0f4');
      }
    }
    // nest with three speckled eggs on the back-right turnbuckle
    ell(87, 6, 4, 1.8, () => (fh(347, 2, 1) < 0.5 ? '#8a6a4a' : '#a8845a'));
    for (let a = 0; a < Math.PI * 2; a += 0.4) P1(87 + Math.cos(a) * 4.2, 6 + Math.sin(a) * 1.9, '#c8a878');
    ell(87, 5.5, 3, 1, '#5a4030');
    for (const [ex, ey] of [[86, 5], [88, 5], [87, 4.5]]) {
      ell(ex, ey, 0.8, 0.6, '#c8e8f0');
      P1(ex - 0.5, ey - 0.5, '#f0faff');
      P1(ex + 0.25, ey, '#8aa8b8');
    }
    tufts(0, 96, 71, 346, 0.8);
  } else if (deluxe) {
    // LED post caps cycling through colours + string lights between the back posts
    const backTop = my - (postH - 4) - 2;
    const frontTop = yF + 2 - postH - 2;
    for (const [x, yy] of [[x0 + 1, backTop], [x1 - 2, backTop], [x0, frontTop], [x1 - 1, frontTop]] as [number, number][]) {
      const c = LED[(f + x) % 4];
      RR(x - 2, yy, 6, 3, 1, c);
      H1(x - 1, x + 3, yy, '#ffffff');
      ell(x + 1, yy + 1.5, 1.2, 0.8, liA(c, 0.6));
    }
    const n = 80;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const lx = x0 + 4 + (x1 - 3 - x0 - 4) * t;
      const ly = backTop + 2 + 5 * 4 * t * (1 - t);
      P1(lx, ly, '#4a3550');
      if (i % 7 === 3) {
        const c = LED[(((i / 7) | 0) + f) % 4];
        ell(lx, ly + 1.2, 0.8, 1, c);
        P1(lx - 0.25, ly + 0.8, '#ffffff');
      }
    }
  }
}

reg('backyard-ring', {
  solid: { x: -48, y: -20, w: 96, h: 20 },
  // sorts by the back edge of the mat so anyone on the mat draws over it
  sortY: -58,
  lights: (o) =>
    ringState(o) === 'deluxe'
      ? [light(o, -41, -60, 26, '#ff7ab8'), light(o, 39, -60, 26, '#5ff2d6'), light(o, -42, -22, 26, '#ffd050'), light(o, 40, -22, 26, '#a888ff'), light(o, 0, -60, 40, '#ffe8b0')]
      : [],
  draw: (ctx, o, t) => {
    const s = ringState(o);
    const f = s === 'deluxe' ? frame(t, 4, 2, phaseOf(o)) : 0;
    // no auto-outline: it would fill the thin gaps between the ropes; edges are inked by hand
    blit(ctx, o, art(`backyard-ring|${s}|${f}`, 96, 72, () => backyardRing(s, f), { outline: false, shadow: [['r', 3, 68, 95, 6]] }));
  },
});

// ================================================================ training equipment

reg('heavy-bag', {
  solid: { x: -7, y: -5, w: 14, h: 4 },
  label: () => 'Train',
  draw: (ctx, o, t) => {
    const f = Math.round(Math.sin(t * 1.8 + phaseOf(o)) * 1.6) / 2;
    blit(
      ctx,
      o,
      art(
        `heavy-bag|${f}`,
        18,
        34,
        () => {
          // a homemade gallows stand: post, arm, diagonal brace, sandbag foot
          R(1, 2, 2.5, 31, woodPaintV(HONEY.b, 351));
          V1(1, 2, 33, HONEY.l);
          V1(3, 2, 33, HONEY.d);
          R(0, 1.5, 16, 2.5, woodPaint(HONEY.b, 352));
          H1(0, 16, 1.5, HONEY.l);
          H1(0, 16, 3.5, HONEY.d);
          L1(3.5, 9, 8, 4, HONEY.s);
          L1(3.5, 9.5, 8.5, 4, HONEY.l);
          bolt(2, 3, '#c8c4d8');
          bolt(5.5, 6.5, '#c8c4d8');
          RR(-0.5, 30.5, 6, 3, 1, () => (fh(353, 2, 1) < 0.3 ? '#a89470' : '#c8b088'));
          H1(0, 5, 30.5, '#e0cca0');
          // chain: alternating links on the fine grid
          const cx = 12 + f;
          for (let k = 0; k < 5; k++) {
            const ly = 4 + k * 1;
            if (k % 2) V1(12 + (f * k) / 5, ly, ly + 1, '#c8c4d8');
            else ell(12 + (f * k) / 5, ly + 0.5, 0.6, 0.6, '#9aa2c8');
          }
          // red leather bag: stitched seams, two tape bands, a patch, the old ACW logo
          const bx = cx - 4.5;
          const rp = ramp('#c9404c');
          RR(bx, 9, 9, 21, 3, () => {
            const u = (fx() - bx) / 9;
            let s = u < 0.15 ? 0.7 : u < 0.4 ? 0.92 : u < 0.65 ? 0.66 : u < 0.86 ? 0.4 : 0.18;
            s += (fh(354, 2, 2) - 0.5) * 0.08;
            return rp[s < 0.2 ? 0 : s < 0.42 ? 1 : s < 0.72 ? 2 : s < 0.92 ? 3 : 4];
          });
          ell(cx, 9.5, 3.5, 1, rp[3]);
          for (let yy = 10; yy < 29; yy += 1) P1(bx + 6, yy, rp[0]);
          for (const yy of [12, 25]) {
            R(bx, yy, 9, 2, cylPaint(bx, 9, '#e8e2d8'));
            H1(bx, bx + 9, yy, '#ffffff');
            for (let k = 0; k < 4; k++) P1(bx + 1 + k * 2, yy + 1.5, '#b8b0a4');
          }
          R(bx + 1.5, 21, 3, 2.5, '#7a2a3a');
          for (let k = 0; k < 3; k += 0.5) P1(bx + 1.5 + k, 21, '#e8a0a0');
          T('A', bx + 3, 15.5, '#ffd050', FT, {});
          tufts(0, 18, 33, 351, 0.4);
        },
        { shadow: [['e', 12, 33, 6, 2], ['e', 3, 33, 4, 1.4]] },
      ),
    );
  },
});

function tire(x: number, y: number, w: number, seed: number): void {
  // a tyre on its side in 3/4: tread band with blocks, sidewall, dark hole
  ell(x + w / 2, y + 3.5, w / 2, 3.5, '#3a3448');
  R(x + 0.5, y + 3, w - 1, 3, () => {
    const u = (fx() - x) / w;
    const block = Math.floor(FX / 2) % 2 === 0 && ((FY & 1) === 0);
    let c = u < 0.2 ? '#5a5272' : u < 0.7 ? '#463e5a' : '#3a3448';
    if (block) c = '#2b2140';
    return c;
  });
  ell(x + w / 2, y + 6, w / 2 - 0.5, 1.2, '#3a3448');
  ell(x + w / 2, y + 2.4, w / 2 - 0.5, 3, '#524a6a');
  ell(x + w / 2, y + 2.4, w / 2 - 3.5, 1.5, '#2b2140');
  for (let a = 3.4; a < 5.8; a += 0.2) P1(x + w / 2 + Math.cos(a) * (w / 2 - 1.6), y + 2.4 + Math.sin(a) * 2.1, '#7a7498');
  H1(x + 3, x + 7, y + 0.5, '#8a84a8');
  void seed;
}
reg('tire-stack', {
  solid: { x: -9, y: -8, w: 18, h: 7 },
  label: () => 'Train',
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'tire-stack',
        20,
        20,
        () => {
          tire(1, 12, 18, 1);
          tire(2, 7, 16, 2);
          tire(1, 2, 18, 3);
          // a painted white stripe on the top tyre, a water bottle, a sledgehammer leaning on
          for (let a = 3.5; a < 5.9; a += 0.08) P1(10 + Math.cos(a) * 7.6, 4.4 + Math.sin(a) * 2.6, '#fbf6ea');
          R(15, 0, 2, 4.5, cylPaint(15, 2, '#5ec0a8'));
          R(15.25, -0.5, 1.5, 0.75, '#fbf6ea');
          L1(-0.5, 19, 2, 9, HONEY.s);
          L1(0, 19, 2.5, 9, HONEY.l);
          R(0.5, 7.5, 3.5, 2, cylPaint(0.5, 3.5, '#6e688e'));
          tufts(0, 20, 19, 361, 0.5);
        },
        { shadow: [['e', 12, 18, 9, 2.5]] },
      ),
    ),
});

reg('weight-bench', {
  solid: { x: -15, y: -10, w: 30, h: 9 },
  label: () => 'Train',
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'weight-bench',
        32,
        20,
        () => {
          // steel uprights with J-hooks
          for (const x of [7, 24]) {
            R(x, 2, 2, 14, cylPaint(x, 2, '#b8bcd8'));
            R(x - 1, 5.5, 4, 1, '#6e688e');
            H1(x - 1, x + 3, 5.5, '#d8dcf0');
          }
          // chrome bar with knurling, collars and mismatched plates
          R(0, 4, 32, 1.5, () => (fy() < 4.5 ? '#f6f8ff' : FX % 2 && fy() < 5 ? '#9aa2c8' : '#c8cce0'));
          for (const [x, c, h] of [[1, '#d8434b', 9], [3.5, '#3a3448', 6.5], [26.5, '#3a3448', 6.5], [29, '#4a6ad0', 9]] as [number, Color, number][]) {
            const rp = ramp(c);
            RR(x, 4.75 - h / 2, 2.5, h, 1, cylPaint(x, 2.5, c));
            H1(x + 0.5, x + 2, 4.75 - h / 2, rp[4]);
            P1(x + 1, 4.5, '#2b2140');
          }
          for (const x of [5.5, 25.5]) R(x, 3.5, 1, 2.5, '#9aa2c8');
          // padded vinyl bench with piping, a split seam showing foam
          RR(9, 9, 14, 4, 1, () => (fy() < 10 ? '#ff7a70' : fh(371, 2, 1) < 0.08 ? '#c03848' : '#d8434b'));
          H1(9.5, 22.5, 9, '#ffb0a0');
          H1(9.5, 22.5, 12.5, '#8e2c48');
          for (let x = 10; x < 22; x += 1.5) P1(x, 11.5, '#ff8a80');
          L1(17, 10, 19.5, 11, '#f6e8b0');
          P1(18, 10.5, '#fff8d0');
          R(9, 13, 14, 1.5, '#a8344a');
          // frame and feet
          R(11, 14.5, 2, 4.5, cylPaint(11, 2, '#8a84a8'));
          R(19, 14.5, 2, 4.5, cylPaint(19, 2, '#8a84a8'));
          R(8, 18.5, 17, 1, '#4e4870');
          H1(8, 25, 18.5, '#8a84a8');
          // a striped towel draped on the end
          poly([[20, 8], [24, 8], [24.5, 13], [20.5, 13.5]], '#fbf6ea');
          H1(20, 24.2, 10.5, '#3f9a92');
          H1(20, 24.3, 11.5, '#3f9a92');
          L1(23.5, 8.5, 24, 13, '#d8d0c4');
          tufts(0, 32, 19, 371, 0.4);
        },
        { shadow: [['r', 2, 16, 31, 5]] },
      ),
    ),
});

reg('trampoline', {
  solid: { x: -15, y: -12, w: 30, h: 11 },
  label: () => 'Train',
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'trampoline',
        32,
        20,
        () => {
          // W-legs
          for (const x of [3, 15, 27]) {
            R(x, 10, 2, 9, cylPaint(x, 2, '#9aa2c8'));
            R(x - 1, 18.5, 4, 1, '#4e4870');
          }
          // padded frame ring with stitched panels
          ell(16, 8, 15.5, 7.5, '#2f6ac0');
          ell(16, 7.5, 15, 7, () => {
            const a = Math.atan2(fy() - 7.5, fx() - 16);
            const panel = Math.floor((a + Math.PI) / (Math.PI / 6)) % 2 === 0;
            const lit = fy() < 6 ? 1 : 0;
            return lit ? (panel ? '#7ab0f0' : '#6aa4ec') : panel ? '#5a9ae8' : '#4a8ae0';
          });
          // springs: a ring of short zig-zag coils
          ell(16, 8, 12.5, 5.5, '#c8cce0');
          for (let k = 0; k < 40; k++) {
            const a = (k / 40) * Math.PI * 2;
            P1(16 + Math.cos(a) * 12, 8 + Math.sin(a) * 5.2, k % 2 ? '#8a84a8' : '#eef0fa');
            P1(16 + Math.cos(a) * 11.5, 8 + Math.sin(a) * 4.9, k % 2 ? '#eef0fa' : '#8a84a8');
          }
          // woven black bed with a sun sheen
          ell(16, 8, 11, 4.4, () => ((FX + FY) % 3 === 0 ? '#3a3050' : '#2b2140'));
          ell(13.5, 6.8, 6, 1.8, () => (fd(6) ? '#4a4068' : '#3a3050'));
          // star sticker on the pad, a dropped sneaker
          for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]) R(4 + dx, 9 + dy, 1, 1, '#ffd050');
          RR(26, 17, 4.5, 2, 1, '#fbf6ea');
          R(26, 18.5, 4.5, 0.5, '#d8434b');
          P1(27, 17, '#3a3448');
          tufts(0, 32, 19, 381, 0.3);
        },
        { shadow: [['e', 18, 17, 15, 3]] },
      ),
    ),
});

reg('rope-lane', {
  flat: true,
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'rope-lane',
        48,
        16,
        () => {
          // agility rope ladder pegged into the grass, cones at either end
          for (const y of [3, 12]) rope(4, y, 43, y, 0.4, '#e8c070', null, false);
          for (let x = 6; x < 44; x += 6) {
            R(x, 4, 1.5, 8, cylPaint(x, 1.5, '#e8404e'));
          }
          for (const [x, y] of [[4, 3.5], [43, 3.5], [4, 12.5], [43, 12.5]]) {
            ell(x, y, 0.7, 0.7, '#6e688e');
            P1(x - 0.25, y - 0.25, '#d8dcf0');
          }
          for (const x of [1, 46]) {
            poly([[x - 1.5, 11], [x, 4.5], [x + 1, 4.5], [x + 2.5, 11]], cylPaint(x - 1.5, 4, '#ff8a3a'));
            H1(x - 1, x + 2, 7.5, '#fbf6ea');
            H1(x - 1, x + 2, 8, '#fbf6ea');
            R(x - 2, 10.5, 5.5, 1, '#c8602a');
          }
        },
        { outline: false },
      ),
    ),
});

reg('speed-bag', {
  solid: { x: -6, y: -4, w: 12, h: 3 },
  label: () => 'Train',
  draw: (ctx, o, t) => {
    const f = frame(t, 3, 6, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `speed-bag|${f}`,
        16,
        28,
        () => {
          // steel post, round walnut rebound board, swivel, bouncing teardrop bag
          R(2, 4, 2, 23, cylPaint(2, 2, '#9aa2c8'));
          RR(0, 26, 6, 2, 1, '#4e4870');
          H1(0.5, 5.5, 26, '#8a84a8');
          ell(8, 4.5, 7, 1.8, WALNUT.d);
          ell(8, 4, 7, 1.6, woodPaint(WALNUT.b, 391));
          ell(7, 3.5, 4.5, 0.8, WALNUT.l);
          R(9.5, 5.5, 1, 1, '#c8c4d8');
          const off = [0, 2, -1][f];
          const bx = 10 + off;
          L1(10, 6.5, bx, 8, '#9aa2c8');
          const rp = ramp('#d8434b');
          ell(bx, 10.5, 2.4, 3.2, () => {
            const s = 0.8 - (fx() - bx) * 0.25 - (fy() - 10.5) * 0.12;
            return rp[s < 0.2 ? 0 : s < 0.42 ? 1 : s < 0.72 ? 2 : s < 0.92 ? 3 : 4];
          });
          V1(bx, 8, 13.5, rp[0]);
          P1(bx - 1, 9, '#ffc0b0');
          if (f === 1) {
            // a blur of motion lines
            P1(14, 8, '#fff4c0');
            P1(15, 10, '#fff4c0');
            P1(14.5, 12, '#fff4c0');
          }
          tufts(0, 8, 27, 393, 0.4);
        },
        { shadow: [['e', 4, 27, 4, 1.4]] },
      ),
    );
  },
});

// ================================================================ machines

reg('merch-press', {
  solid: { x: -11, y: -9, w: 22, h: 8 },
  label: (o) => (o.props.ready ? 'Collect' : 'Use'),
  lights: (o) => (o.props.ready ? [light(o, 0, -14, 24, '#fff0b0')] : []),
  draw: (ctx, o, t) => {
    const ready = !!o.props.ready;
    const f = ready ? frame(t, 8, 6, phaseOf(o)) : 0;
    blit(
      ctx,
      o,
      art(
        `merch-press|${ready ? 1 : 0}|${f}`,
        24,
        24,
        () => {
          // a sawhorse workbench with an oak top
          R(0, 12, 24, 3, woodPaint(OAK.l, 401));
          H1(0, 24, 12, liA(OAK.l, 0.3));
          R(0, 15, 24, 1.5, OAK.s);
          for (const x of [1, 21]) {
            L1(x, 16.5, x - 0.5, 24, OAK.b);
            L1(x + 1.5, 16.5, x + 2, 24, OAK.s);
          }
          H1(2, 22, 21, OAK.s);
          // clamshell heat press: base platen, hinge arm, upper platen
          R(4, 9, 16, 3, cylPaint(4, 16, '#5a5478'));
          H1(4, 20, 9, '#8a84a8');
          if (ready) {
            R(4, 2, 16, 3, () => (fy() < 2.5 ? '#f2f4ff' : fy() < 4 ? '#c8cce0' : '#9aa2c8'));
            L1(19, 4, 22, 0, '#6e688e');
            // a finished shirt on the platen: red tee with a gold star
            const sc = '#e8404e';
            poly([[7, 6], [10, 5], [14, 5], [17, 6], [18, 8], [16, 9], [16, 11], [8, 11], [8, 9], [6, 8]], sc);
            L1(10, 5.2, 14, 5.2, '#fbf6ea');
            L1(8.5, 9, 8.5, 11, shA(sc, 0.25));
            L1(15.5, 9, 15.5, 11, shA(sc, 0.25));
            for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]]) R(11 + dx, 7 + dy, 1, 1, '#ffd050');
            P1(12, 7, '#fff4c0');
          } else {
            R(4, 6, 16, 3, () => (fy() < 6.5 ? '#f2f4ff' : fy() < 8 ? '#c8cce0' : '#9aa2c8'));
            L1(18, 6, 22, 2, '#6e688e');
            // a stack of blank shirts waiting beside it
            for (let k = 0; k < 3; k++) {
              R(0.5, 9.5 - k * 1, 3.5, 1, k % 2 ? '#e0d8cc' : '#fbf6ea');
            }
          }
          // control box: dial, indicator light, temperature gauge
          R(20, 7, 4, 5, '#3a3448');
          H1(20, 24, 7, '#5a5478');
          ell(21, 8.5, 0.6, 0.6, ready ? '#7fe8a8' : '#ff5050');
          P1(20.75, 8.25, '#ffffff');
          circ(22.5, 10.25, 0.9, '#d8dcf0');
          P1(22.5, 10, '#d8434b');
          RR(21, 0, 3, 3, 1, '#2b2140');
          P1(22, 0.5, '#6e688e');
          if (ready && f < 3) sparkle(15 - f, 6, f === 1);
        },
        { shadow: [['r', 2, 21, 23, 4]] },
      ),
    );
  },
});

reg('sewing-machine', {
  solid: { x: -9, y: -8, w: 18, h: 7 },
  label: () => 'Sew',
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'sewing-machine',
        20,
        20,
        () => {
          // treadle table with iron scroll legs
          R(0, 10, 20, 3, woodPaint(WALNUT.l, 411));
          H1(0, 20, 10, liA(WALNUT.l, 0.3));
          R(0, 13, 20, 2, WALNUT.s);
          for (const x of [1, 17]) {
            L1(x, 15, x + 1.5, 19.5, '#3a3448');
            L1(x + 1.5, 15, x, 19.5, '#3a3448');
            circ(x + 0.75, 17.25, 0.6, '#3a3448');
          }
          R(5, 17, 10, 2, '#4e4870');
          for (let x = 5.5; x < 15; x += 1) V1(x, 17, 19, '#6e688e');
          // vintage mint machine with gold decals
          const mint = '#a9d8bf';
          R(3, 6, 14, 4, cylPaint(3, 14, mint));
          R(3, 2, 4, 5, cylPaint(3, 4, mint));
          R(3, 2, 12, 3, () => (fy() < 2.5 ? '#e8f8f0' : mint));
          R(13, 5, 2, 4, '#7fb2a6');
          V1(14, 5, 8, '#d8dcf0');
          P1(14, 9, '#d8dcf0');
          for (let x = 8; x < 13; x += 0.5) if (((x * 2) | 0) % 3) P1(x, 3, PAL.gold2);
          P1(4, 7, PAL.gold2);
          P1(4.5, 7.5, PAL.gold3);
          // hand wheel + spool of red thread
          circ(4, 4, 1.6, '#9aa2c8');
          circ(4, 4, 0.6, '#d8dcf0');
          R(9, 0, 2, 2, '#d8434b');
          H1(9, 11, 0, '#ff8a80');
          L1(10, 2, 13.5, 5, '#d8434b');
          // sequined purple fabric under the needle
          R(9, 9, 9, 2, () => (fh(413) < 0.2 ? '#ffd8f8' : fh(414) < 0.1 ? '#ffffff' : '#b448a8'));
          // pin cushion
          circ(1.5, 9, 1.4, '#d8434b');
          P1(1, 8, '#d8dcf0');
          P1(2, 8.5, '#ffd050');
        },
        { shadow: [['r', 2, 17, 19, 4]] },
      ),
    ),
});

// ================================================================ yard

reg('garden-bed', {
  solid: { x: -16, y: -9, w: 32, h: 8 },
  draw: (ctx, o) =>
    blit(
      ctx,
      o,
      art(
        'garden-bed',
        32,
        16,
        () => {
          const wd = HONEY;
          // raised bed: back plank, crumbly dark soil with clods and furrows
          plank(0, 4, 32, 2, wd, 401, false);
          R(1.5, 5.5, 29, 7, () => {
            const furrow = Math.floor(fy() * 2) % 4 === 0;
            const h = fh(402, 2, 1);
            return furrow ? '#4a2c28' : h < 0.18 ? '#6e4a3a' : h > 0.94 ? '#8a6248' : '#5a3a30';
          });
          // lettuce heads: ruffled leaves with pale veins
          for (const x of [5, 9.5]) {
            ell(x, 8, 2.4, 2, '#5e8a4a');
            ell(x - 0.3, 7.5, 2, 1.6, () => (fh(403, 1, 1) < 0.3 ? '#a8d080' : '#8ab868'));
            ell(x - 0.5, 7.2, 1, 0.8, '#c8e8a0');
            L1(x - 1.5, 8.5, x, 7, '#d8f0b8');
            L1(x + 1.5, 8.5, x, 7, '#d8f0b8');
          }
          // carrots: feathery tops and orange shoulders peeking out
          for (const x of [14, 16, 18]) {
            for (let k = 0; k < 4; k++) {
              const a = -Math.PI / 2 + (k - 1.5) * 0.45;
              L1(x, 9, x + Math.cos(a) * 3.5, 9 + Math.sin(a) * 4, k % 2 ? '#6f9a5a' : '#8ab868');
              P1(x + Math.cos(a) * 3.5, 9 + Math.sin(a) * 4, '#b4d48e');
            }
            R(x - 0.5, 9.5, 1.5, 1.5, '#e8843a');
            H1(x - 0.5, x + 1, 9.5, '#ffb070');
          }
          // a staked tomato plant with ripe and green fruit
          V1(25, 0, 9.5, '#c8a070');
          V1(25.5, 0, 9.5, '#a8804e');
          ell(25, 4, 3.4, 3.4, '#4f7a4a');
          ell(24.5, 3.5, 2.6, 2.6, () => (fh(404, 2, 1) < 0.35 ? '#7aa858' : '#5e8a5a'));
          P1(23.5, 2, '#9ac870');
          for (const [x, y, ripe] of [[23, 5, 1], [26.5, 3, 1], [27, 6, 0], [24, 7, 1]] as [number, number, number][]) {
            ell(x, y, 0.9, 0.9, ripe ? '#e8404e' : '#9ac860');
            P1(x - 0.5, y - 0.5, ripe ? '#ffb0a0' : '#d8f0a0');
            P1(x, y - 1, '#4f7a4a');
          }
          // front plank with grain and nails, corner posts
          plank(0, 12, 32, 4, wd, 405);
          for (const x of [0, 15, 30]) {
            R(x, 4, 2, 12, woodPaintV(wd.s, 406 + x));
            V1(x, 4, 16, wd.b);
          }
          // a hand-painted seed marker and a trowel
          R(26, 0.5, 6, 3, '#fbf6ea');
          H1(26, 32, 3, '#d8d0c4');
          TF('TOM', 26.5, 1, '#d8434b');
          V1(28.75, 3.5, 8, '#c8a070');
          L1(10.5, 4, 13, 2, '#9aa2c8');
          R(12.5, 1, 1.5, 1.5, '#d8434b');
        },
        { shadow: [['r', 2, 13, 31, 4]] },
      ),
    ),
});

reg('clothesline', {
  label: () => null,
  draw: (ctx, o, t) => {
    const f = frame(t, 2, 1.5, phaseOf(o));
    blit(
      ctx,
      o,
      art(
        `clothesline|${f}`,
        48,
        32,
        () => {
          // two weathered T-posts and a sagging line
          for (const x of [2, 45]) {
            R(x, 4, 2, 28, woodPaintV('#a89a90', 421 + x));
            V1(x, 4, 32, '#d8c8c0');
            R(x - 2, 4, 6, 2, woodPaint('#a89a90', 423 + x));
            H1(x - 2, x + 4, 4, '#d8c8c0');
            bolt(x + 0.5, 5, '#c8c4d8');
          }
          const sag = (x: number) => 6 + 4 * 4 * ((x - 3) / 43) * (1 - (x - 3) / 43);
          for (let x = 3; x <= 46; x += 0.5) {
            P1(x, sag(x), '#f2ece0');
            P1(x, sag(x) + 0.5, '#b8b0a4');
          }
          // laundry pegged on, gently swaying: a singlet, a towel, socks, Grandma's flowered apron
          const sway = f ? 0.5 : 0;
          const hang = (x: number, w: number, h: number, c: Color, deco: (x0: number, y0: number) => void) => {
            const y0 = sag(x + w / 2) + 0.5;
            const rp = ramp(c);
            poly([[x, y0], [x + w, y0], [x + w + sway, y0 + h], [x + sway, y0 + h]], () => {
              const u = (fx() - x) / w;
              // soft vertical folds, lit on the left
              const fold = Math.sin(u * 9) * 0.5 + 0.5;
              const s = 0.75 - u * 0.25 + fold * 0.15 - ((fy() - y0) / h) * 0.15;
              return rp[s < 0.2 ? 0 : s < 0.42 ? 1 : s < 0.72 ? 2 : s < 0.92 ? 3 : 4];
            });
            H1(x, x + w, y0, rp[4]);
            H1(x + sway, x + w + sway, y0 + h - 0.5, rp[1]);
            for (const px of [x + 0.5, x + w - 1.5]) {
              R(px, y0 - 1, 1, 2, '#c8a070');
              V1(px, y0 - 1, y0 + 1, '#e8c890');
            }
            deco(x, y0);
          };
          hang(6, 7, 11, '#d8434b', (x, y) => {
            R(x + 2, y, 3, 2, '#f2ece0');
            H1(x, x + 7, y + 6, '#ffd050');
            H1(x, x + 7, y + 6.5, '#ffd050');
          });
          hang(15, 9, 9, '#5ec0a8', (x, y) => {
            H1(x, x + 9, y + 6, '#fbf6ea');
            H1(x, x + 9, y + 7, '#fbf6ea');
            for (let k = 0; k < 9; k += 1) P1(x + k + sway, y + 9, '#fbf6ea');
          });
          hang(26, 3, 5, '#fbf6ea', (x, y) => R(x, y + 4, 3.5, 1, '#d8434b'));
          hang(30, 3, 5, '#f6d38a', (x, y) => R(x, y + 4, 3.5, 1, '#4a6ad0'));
          hang(35, 8, 12, '#93a8cf', (x, y) => {
            for (let k = 0; k < 9; k++) {
              const fx0 = x + 1 + ((k * 3) % 7);
              const fy0 = y + 2 + k * 1.2;
              P1(fx0, fy0, k % 2 ? '#f6ecd8' : '#ee98a6');
              P1(fx0 + 0.5, fy0, '#ffd050');
            }
            H1(x + 1, x + 7, y + 5, '#fbf6ea');
            L1(x + 1, y + 5, x - 1, y + 9, '#fbf6ea');
          });
          // wicker laundry basket + tufts
          RR(19, 25, 10, 6, 2, '#d8a870');
          R(19.5, 25.5, 9, 5, () => ((FX + (FY >> 1)) % 3 === 0 ? '#b8885a' : (FY & 1) ? '#c89868' : '#e0b480'));
          H1(19.5, 28.5, 25, '#f0c890');
          R(20, 23, 8, 3, '#fbf6ea');
          L1(20, 23.5, 27, 24.5, '#e0d8cc');
          ell(23, 23.5, 1, 0.6, '#ff94b4');
          tufts(0, 48, 31, 411, 0.4);
        },
        { shadow: [['e', 4, 31, 3, 1.4], ['e', 47, 31, 3, 1.4], ['r', 20, 29, 11, 3]] },
      ),
    );
  },
});

reg('mailbox-home', {
  solid: { x: -4, y: -4, w: 8, h: 3 },
  label: () => 'Check',
  draw: (ctx, o, t) => {
    const flag = Math.floor((t + phaseOf(o)) / 3) % 4 !== 3 ? 1 : 0;
    blit(
      ctx,
      o,
      art(
        `mailbox-home|${flag}`,
        13,
        22,
        () => {
          // weathered post, crosspiece, a morning glory vine climbing it
          R(5, 9, 2.5, 13, woodPaintV('#8a6a4a', 431));
          V1(5, 9, 22, '#b08c62');
          V1(7, 9, 22, '#5e4434');
          R(3, 9, 7, 1.5, woodPaint('#8a6a4a', 432));
          for (let y = 11; y < 21; y += 0.5) {
            const dx = Math.sin(y * 1.1) * 1.4;
            P1(6 + dx, y, '#4f7a5a');
            if (((y * 2) | 0) % 5 === 0) {
              ell(6 + dx + 0.8, y, 0.7, 0.5, '#6f9a5a');
            }
          }
          ell(7.8, 13, 0.8, 0.8, '#7a8ae0');
          P1(7.8, 13, '#fff4f8');
          ell(4.5, 17, 0.7, 0.7, '#b078d8');
          // rural mailbox: rounded top, faded blue paint, rust, DUPREE stencil, red flag
          const B = '#7a8ab8';
          const rp = ramp(B);
          RR(0, 1, 12, 8.5, 3, () => {
            const v = (fy() - 1) / 8.5;
            let s = v < 0.15 ? 1 : v < 0.35 ? 0.85 : v < 0.7 ? 0.62 : 0.38;
            if (fh(433, 2, 2) < 0.08) return '#b0a0a0';
            if (fh(434, 1, 3) < 0.04) return '#a8603a';
            s += (fh(435, 3, 1) - 0.5) * 0.06;
            return rp[s < 0.2 ? 0 : s < 0.42 ? 1 : s < 0.72 ? 2 : s < 0.92 ? 3 : 4];
          });
          // the door on the front end, its latch, a rust bloom at the hinge
          R(0, 2, 2, 7, rp[1]);
          V1(0, 2.5, 8.5, rp[3]);
          R(1.5, 4.5, 0.5, 1, '#d8dcf0');
          P1(1, 8.5, '#a8603a');
          TFC('DUPREE', 7, 4.5, '#eef0fa');
          H1(2, 12, 8.75, rp[0]);
          if (flag) {
            R(11, 0, 1, 5, '#a8303a');
            R(11, 0, 2.5, 2, '#e8404e');
            H1(11, 13.5, 0, '#ff8a80');
          } else {
            R(11, 5, 2.5, 1, '#d8434b');
            H1(11, 13.5, 5, '#ff8a80');
          }
          tufts(2, 11, 21, 422, 0.6);
        },
        { shadow: [['e', 7, 21, 4, 1.5]] },
      ),
    );
  },
});
