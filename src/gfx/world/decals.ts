/**
 * Ground decals: the clustered, placed-by-hand detail that sits on calm
 * terrain (A1 of the charm pass). Terrain only knows its neighbours, so the
 * context lives in the map: src/world/maps/decals.ts looks at doors, fences,
 * walls, trees, rocks, curbs and lots and drops these where life happens.
 *
 * One flat object kind, 'decal', baked into the ground canvas with the rugs.
 * props: k = what it is, s = seed, w / h = size in world pixels (optional).
 *   worn    bare, trodden patch in grass (in front of doors, path mouths)
 *   scuff   foot-polished sidewalk in front of a door
 *   tufts   taller grass and clover along a fence, hedge or wall foot (w long)
 *   clover  a clover clump (white clover flowers in spring and summer)
 *   moss    a little moss on the north side of a rock, stump or trunk
 *   leaves  leaf litter under a tree (fall only; a few twigs otherwise)
 *   crack   a crack spidering out from a curb or slab joint, maybe a weed
 *   oil     an oil stain where cars stand
 * Every sprite is built once per (kind, seed, size, season) at double density.
 */
import { registerObject } from '../../world/registry';
import type { MapObject } from '../../world/types';
import { P1, R, col, dense, ell, hash2, liA, mkSpr, rng, shA, toCanvas } from '../kit';
import { getSeason, grassTones } from './terrain';

const K = 2;
/** Colour with alpha (buffers are ABGR). */
const al = (c: string | number, a: number) => ((col(c) & 0x00ffffff) | ((Math.round(a * 255) & 255) << 24)) >>> 0;
const INK = '#3a2848';

type Draw = (w: number, h: number, r: () => number, season: string) => void;

/** A blade of grass from its root upward, leaning. */
function blade(x: number, y: number, len: number, lean: number, tones: number[]): void {
  const n = Math.max(1, Math.round(len * K));
  for (let i = 0; i < n; i++) {
    const f = i / Math.max(1, n - 1);
    const t = tones[Math.min(tones.length - 1, 1 + Math.floor(f * (tones.length - 1)))];
    P1(x + lean * f * f, y - i / K, t);
  }
}
/** A fan of blades: a tuft. */
function tuft(x: number, y: number, size: number, r: () => number, tones: number[]): void {
  R(x - size * 0.6, y, size * 1.2, 0.5, al(INK, 0.22));
  const n = 3 + Math.floor(size * 1.2);
  for (let b = 0; b < n; b++) {
    const off = (b - (n - 1) / 2) / n;
    blade(x + off * size * 0.9, y, 2 + size * (1 - Math.abs(off)) * 1.2 + r() * 1.5, off * 2.4 + (r() - 0.5), tones);
  }
}
function cloverLeaf(x: number, y: number, tones: number[]): void {
  for (const [dx, dy] of [[-0.5, 0], [0.5, 0], [0, -0.5]] as [number, number][]) {
    P1(x + dx, y + dy, tones[3]);
    P1(x + dx * 2, y + dy * 2, tones[4]);
  }
  P1(x, y, tones[2]);
  P1(x + 0.5, y + 0.5, tones[1]);
}

const KINDS: Record<string, Draw> = {
  worn: (w, h, r) => {
    // a trodden oval: grass thinned to earth in the middle, ragged at the rim
    const cx = w / 2;
    const cy = h / 2;
    const seed = Math.floor(r() * 1e6);
    for (let y = 0; y < h; y += 0.5)
      for (let x = 0; x < w; x += 0.5) {
        const dx = (x - cx) / (w / 2);
        const dy = (y - cy) / (h / 2);
        const d = Math.sqrt(dx * dx + dy * dy) + (hash2(Math.floor(x * 2 / 3), Math.floor(y * 2 / 3), seed) - 0.5) * 0.35;
        if (d > 1) continue;
        const n = hash2(Math.floor(x * 2), Math.floor(y * 2), seed + 1);
        if (d < 0.5) P1(x, y, n < 0.08 ? al('#7a5e52', 0.7) : n > 0.95 ? al('#d8b488', 0.75) : al(n < 0.5 ? '#a8845e' : '#9c7a58', 0.62));
        else if (d < 0.8) {
          if (n < 0.5) P1(x, y, n < 0.25 ? al('#94785a', 0.42) : al(grassTones()[1], 0.4));
        } else if (n < 0.25) P1(x, y, al(grassTones()[1], 0.32));
      }
    // a couple of pebbles and a flattened blade or two
    for (let k = 0; k < 3; k++) {
      const x = cx + (r() - 0.5) * w * 0.5;
      const y = cy + (r() - 0.5) * h * 0.4;
      P1(x, y, '#d8c0a8');
      P1(x + 0.5, y + 0.5, al(INK, 0.4));
    }
  },
  scuff: (w, h) => {
    // the sidewalk in front of a door, polished darker by feet
    for (let y = 0; y < h; y += 0.5)
      for (let x = 0; x < w; x += 0.5) {
        const dx = (x - w / 2) / (w / 2);
        const dy = (y - h / 2) / (h / 2);
        const d = dx * dx + dy * dy;
        if (d > 1) continue;
        const k = d < 0.35 ? 0.13 : d < 0.7 ? 0.08 : 0.04;
        if (d < 0.7 || hash2(x * 2, y * 2, 9) < 0.5) P1(x, y, al(INK, k));
      }
  },
  tufts: (w, h, r, season) => {
    const tones = grassTones();
    // tufts come in little gangs with gaps, never a hedge of them
    let x = 1 + r() * 3;
    while (x < w - 1) {
      const gang = 1 + Math.floor(r() * 3);
      for (let g = 0; g < gang && x < w - 1; g++) {
        tuft(x, h - 1 - r() * 1.5, 1.6 + r() * 2.2, r, tones);
        if (season !== 'winter' && r() < 0.35) cloverLeaf(x + 2 + r() * 2, h - 1.5, tones);
        if ((season === 'spring' || season === 'summer') && r() < 0.18) {
          const fc = ['#fff6ee', '#ffe070', '#c08ae0', '#ff8fae'][Math.floor(r() * 4)];
          const fx = x + (r() - 0.5) * 3;
          const fy = h - 5 - r() * 2;
          P1(fx, fy, fc);
          P1(fx + 0.5, fy, shA(fc, 0.2));
          P1(fx, fy + 0.5, tones[1]);
        }
        if (season === 'fall' && r() < 0.3) P1(x + r() * 3, h - 2 - r() * 4, '#c8a050');
        x += 2 + r() * 3;
      }
      x += 4 + r() * 10;
    }
  },
  clover: (w, h, r, season) => {
    const tones = grassTones();
    const n = 5 + Math.floor(r() * 6);
    for (let i = 0; i < n; i++) {
      const x = w / 2 + (r() - 0.5) * (w - 3);
      const y = h / 2 + (r() - 0.5) * (h - 3);
      R(x - 0.5, y + 1, 1.5, 0.5, al(INK, 0.18));
      cloverLeaf(x, y, tones);
    }
    if (season === 'spring' || season === 'summer')
      for (let i = 0; i < 2; i++) {
        const x = w / 2 + (r() - 0.5) * (w - 4);
        const y = h / 2 + (r() - 0.5) * (h - 4) - 1;
        ell(x, y, 0.8, 0.7, '#fff4f4');
        P1(x, y - 0.5, '#ffe4ec');
        P1(x + 0.5, y + 0.5, '#f4c8d8');
      }
  },
  moss: (w, h, r) => {
    const m = ['#3f6a4a', '#4f7e4c', '#6a9a52', '#8ab860'].map((c) => col(c));
    for (let i = 0; i < 26; i++) {
      const x = w / 2 + (r() - 0.5) * (w - 1) * (0.4 + r() * 0.6);
      const y = h / 2 + (r() - 0.5) * (h - 1);
      P1(x, y, m[Math.floor(r() * 3)]);
      if (r() < 0.4) P1(x, y - 0.5, m[3]);
    }
  },
  leaves: (w, h, r, season) => {
    if (season !== 'fall') {
      // just a couple of twigs out of season
      for (let k = 0; k < 2; k++) {
        const x = w / 2 + (r() - 0.5) * w * 0.6;
        const y = h / 2 + (r() - 0.5) * h * 0.6;
        for (let i = 0; i < 4; i++) P1(x + i * 0.5, y + (i % 2) * 0.5, '#7a5448');
      }
      return;
    }
    const cs = ['#e8803a', '#d65a3a', '#f2b84a', '#b8483e', '#c8763a'];
    const n = Math.floor(w * h * 0.12);
    for (let i = 0; i < n; i++) {
      // denser toward the middle, under the canopy
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r()) * (0.4 + r() * 0.6);
      const x = w / 2 + Math.cos(a) * d * (w / 2 - 1);
      const y = h / 2 + Math.sin(a) * d * (h / 2 - 1);
      const c = cs[Math.floor(r() * cs.length)];
      P1(x + 0.5, y + 0.5, al(INK, 0.25));
      P1(x, y, c);
      P1(x + 0.5, y, shA(c, 0.15));
      if (r() < 0.5) P1(x, y - 0.5, liA(c, 0.3));
    }
  },
  crack: (w, h, r, season) => {
    // from the left edge (the curb or joint) out across the surface, forking once
    const walk = (x: number, y: number, len: number, dy: number) => {
      const pts: [number, number][] = [];
      for (let i = 0; i < len; i++) {
        P1(x, y, al(INK, 0.6));
        P1(x, y + 0.5, al('#fff4e0', 0.18));
        pts.push([x, y]);
        x += 0.5;
        if (r() < 0.45) y += (r() < 0.5 + dy ? 0.5 : -0.5);
        y = Math.max(0.5, Math.min(h - 1, y));
      }
      return pts;
    };
    const pts = walk(0, h / 2, Math.floor(w * 1.6), (r() - 0.5) * 0.3);
    const [fx, fy] = pts[Math.floor(pts.length * (0.3 + r() * 0.3))];
    walk(fx, fy, Math.floor(w * 0.6), r() < 0.5 ? 0.3 : -0.3);
    if (season !== 'winter' && r() < 0.4) {
      const [wx, wy] = pts[Math.floor(pts.length * 0.5)];
      tuft(wx, wy, 1.2, r, grassTones());
    }
  },
  crackv: (w, h, r, season) => {
    // down from the curb into the street, forking once
    const walk = (x: number, y: number, len: number, dx: number) => {
      const pts: [number, number][] = [];
      for (let i = 0; i < len; i++) {
        P1(x, y, al(INK, 0.6));
        P1(x + 0.5, y, al('#fff4e0', 0.16));
        pts.push([x, y]);
        y += 0.5;
        if (r() < 0.45) x += r() < 0.5 + dx ? 0.5 : -0.5;
        x = Math.max(0.5, Math.min(w - 1, x));
      }
      return pts;
    };
    const pts = walk(w / 2, 0, Math.floor(h * 1.6), (r() - 0.5) * 0.3);
    const [fx, fy] = pts[Math.floor(pts.length * (0.3 + r() * 0.3))];
    walk(fx, fy, Math.floor(h * 0.6), r() < 0.5 ? 0.3 : -0.3);
    if (season !== 'winter' && r() < 0.3) {
      const [wx, wy] = pts[Math.floor(pts.length * 0.25)];
      tuft(wx, wy, 1, r, grassTones());
    }
  },
  oil: (w, h, r) => {
    for (let y = 0; y < h; y += 0.5)
      for (let x = 0; x < w; x += 0.5) {
        const dx = (x - w / 2) / (w / 2);
        const dy = (y - h / 2) / (h / 2);
        const d = Math.sqrt(dx * dx + dy * dy) + (hash2(Math.floor(x), Math.floor(y), 77) - 0.5) * 0.25;
        if (d > 1) continue;
        if (d < 0.45) P1(x, y, al('#2e2238', 0.45));
        else if (d < 0.75) P1(x, y, al('#3a2c48', 0.28));
        else if (hash2(x * 2, y * 2, 78) < 0.4) P1(x, y, al(INK, 0.15));
      }
    if (r() < 0.5) {
      P1(w / 2 - 1, h / 2 - 0.5, al('#7a8ab0', 0.5));
      P1(w / 2 - 0.5, h / 2 - 0.5, al('#9a7aac', 0.5));
    }
  },
};
const SIZE: Record<string, [number, number]> = {
  worn: [22, 9],
  scuff: [20, 8],
  tufts: [32, 9],
  clover: [12, 8],
  moss: [8, 4],
  leaves: [34, 16],
  crack: [18, 8],
  crackv: [8, 16],
  oil: [12, 6],
};

const cache = new Map<string, HTMLCanvasElement>();
function decalArt(k: string, s: number, w: number, h: number, season: string): HTMLCanvasElement | null {
  const fn = KINDS[k];
  if (!fn) return null;
  const key = `${k}|${s}|${w}|${h}|${season}`;
  let c = cache.get(key);
  if (!c) {
    c = dense(K, () => toCanvas(mkSpr(w, h, () => fn(w, h, rng(s * 7919 + 13), season))));
    cache.set(key, c);
  }
  return c;
}

registerObject('decal', {
  flat: true,
  draw(ctx, o: MapObject) {
    const k = String(o.props.k ?? '');
    const [dw, dh] = SIZE[k] ?? [16, 8];
    const w = Math.max(2, Math.round(Number(o.props.w ?? dw)));
    const h = Math.max(2, Math.round(Number(o.props.h ?? dh)));
    const c = decalArt(k, Math.floor(Number(o.props.s ?? 1)), w, h, getSeason());
    if (c) ctx.drawImage(c, Math.round(o.x - w / 2), Math.round(o.y - h / 2));
  },
});
/**
 * The same art standing up: tufts that grow in front of a fence foot or a
 * trunk have to sort with the objects (drawn each frame, cached sprite), or
 * the fence would paint over them. Anchor = where the roots meet the ground.
 */
registerObject('decal-up', {
  draw(ctx, o: MapObject) {
    const k = String(o.props.k ?? '');
    const [dw, dh] = SIZE[k] ?? [16, 8];
    const w = Math.max(2, Math.round(Number(o.props.w ?? dw)));
    const h = Math.max(2, Math.round(Number(o.props.h ?? dh)));
    const c = decalArt(k, Math.floor(Number(o.props.s ?? 1)), w, h, getSeason());
    if (c) ctx.drawImage(c, Math.round(o.x - w / 2), Math.round(o.y) - h + 1);
  },
});
