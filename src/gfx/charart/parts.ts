import { liA, mixc, P, shA, type Color } from '../kit';
import { EXTRA_SLOT } from '../look';
import type { Hand } from './body';
import { armColor, B, bottomColorAt, BOOT_H, dk, ex, GF, GK, legColor, pattern, setG, shade, torsoFront, torsoSide, X, Y } from './garments';
import { INK, ramp, tint, toneAt } from './palette';
import { clamp, cyl, disc, dpx, formV, layer, lerp, line, oval, px, pt, rect, shape, toneIdx, type Pt } from './raster';

/**
 * Body painters: torso, neck, limbs, hands, feet, skirts, capes, jackets,
 * belts, neckwear and hand props. Everything is shaded from its material
 * ramp at paint time (see raster.ts).
 */
export function interp(keys: [number, number][], t: number): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++)
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      return lerp(v0, v1, (t - t0) / (t1 - t0));
    }
  return keys[keys.length - 1][1];
}

export function frontHalfWidth(t: number): number {
  const m = B.m;
  const bump = m.belly * Math.sin(Math.PI * clamp((t - 0.02) / 0.62, 0, 1));
  return interp([[0, m.hipW / 2], [0.3, m.waistW / 2], [0.74, m.shW / 2], [1, m.shW / 2 - (m.shW > 12 ? 2 : 1)]], t) + bump * 0.5;
}
export function sideEdges(t: number): [number, number] {
  const m = B.m;
  const d = m.depth;
  const bump = m.belly * Math.sin(Math.PI * clamp((t - 0.05) / 0.6, 0, 1));
  const f = interp([[0, d * 0.42], [0.3, d * 0.38], [0.55, d * 0.44], [0.8, d * 0.52], [1, d * 0.3]], t) + bump;
  const b = interp([[0, -d * 0.55], [0.22, -d * 0.5], [0.55, -d * 0.42], [0.85, -d * 0.5], [1, -d * 0.36]], t);
  return [f, b];
}

const UPV: Pt = { x: 0, y: -1 };
const LATV: Pt = { x: 1, y: 0 };

export function drawTorso(): void {
  const r = B.r;
  const m = B.m;
  const H = m.torsoH;
  const bx = B.AX + r.hip.x;
  const by = B.AY + r.hip.y + (r.def.bob ?? 0);
  layer({ sh: 0.3, hl: 0.1 });
  if (B.view !== 'side') {
    const back = B.view === 'back';
    for (let y = Math.round(by - H); y < Math.round(by); y++) {
      const ly = by - (y + 0.5);
      const hw = frontHalfWidth(ly / H);
      const x0 = Math.round(bx - hw);
      const x1 = Math.round(bx + hw);
      for (let x = x0; x < x1; x++) {
        const lx = x + 0.5 - bx;
        const base = torsoFront(back ? -lx : lx, ly, hw, back);
        const v = formV(lx / hw, (ly / H) * 2 - 1, LATV, UPV);
        P(x, y, pt(shade(base, toneIdx(v, hw >= 4))));
      }
    }
    return;
  }
  const pts: [number, number][] = [];
  const N = 8;
  const fw = r.fw;
  const up = r.up;
  const tp = (lf: number, ly: number): [number, number] => [bx + fw.x * lf + up.x * ly, by + fw.y * lf + up.y * ly];
  for (let i = 0; i <= N; i++) pts.push(tp(sideEdges(i / N)[0], (i / N) * H));
  for (let i = N; i >= 0; i--) pts.push(tp(sideEdges(i / N)[1], (i / N) * H));
  shape(pts, (x, y) => {
    const dx = x + 0.5 - bx;
    const dy = y + 0.5 - by;
    const lf = dx * fw.x + dy * fw.y;
    const ly = clamp(dx * up.x + dy * up.y, 0, H);
    const [f, b] = sideEdges(clamp(ly / H, 0, 1));
    const base = torsoSide(lf, ly, f);
    const t = ((lf - b) / Math.max(1, f - b)) * 2 - 1;
    const v = formV(t, (ly / H) * 2 - 1, fw, up);
    return shade(base, toneIdx(v, f - b >= 5));
  });
}

export function drawNeck(): void {
  const r = B.r;
  const m = B.m;
  if (m.neck <= 0) return;
  layer({ sh: 0.36, aa: false });
  const high = B.top.neck === 'high';
  const c = high ? B.look.topColor : B.skin;
  const rp = ramp(c, high ? 'cloth' : B.bear ? 'fur' : 'skin');
  const w = Math.max(2, Math.round(m.headW * 0.4));
  if (B.view !== 'side') {
    const x0 = Math.round(X(r.neck) - w / 2);
    for (let y = Math.round(Y(r.neck)) - 3; y < Math.round(Y(r.neck)) + 1; y++)
      for (let x = x0; x < x0 + w; x++) {
        const t = ((x + 0.5 - X(r.neck)) / (w / 2)) * 1;
        P(x, y, pt(toneAt(rp, toneIdx(formV(t, 0, LATV, UPV), false) - 1)));
      }
  } else {
    cyl(X(r.neck) - 0.5, Y(r.neck) + 1, X(r.head) - 0.5, Y(r.head) + 1, w + 1, w + 1, rp, { vShift: -0.25 });
  }
}

// ---- limbs ----

export function drawArm(sh: Pt, el: Pt, ha: Pt, hand: Hand, near: boolean): void {
  const m = B.m;
  const total = m.upArm + m.foreArm;
  layer({ sh: 0.3, hl: 0.06 });
  const wide = B.sleeveLen > 0.9 ? B.sleeveWide : 0;
  const w0 = m.armD + wide;
  const paint = (off: number, span: number) => (s: number, v: number, _x: number, _y: number, _c: number, t: number): Color => {
    const base = dk(armColor(off + s * span, total));
    let idx = toneIdx(v, w0 >= 4) + GF;
    if (GK === 'cloth' && w0 >= 4 && t < 0.2 && t > -0.3 && Math.floor(off + s * span) % 3 === 1) idx -= 0; // reserved for sleeve folds
    return tint(base, idx, GK);
  };
  cyl(X(sh), Y(sh), X(el), Y(el), w0, m.foreD + wide, B.skinR, { paint: paint(0, m.upArm) });
  cyl(X(el), Y(el), X(ha), Y(ha), m.foreD + wide, Math.max(2, m.foreD), B.skinR, { paint: paint(m.upArm, m.foreArm) });
  drawHand(ha, { x: ha.x - el.x, y: ha.y - el.y }, hand, near);
}

function drawHand(h: Pt, dir: Pt, kind: Hand, near: boolean): void {
  const m = B.m;
  const gl = ex('gloves');
  const base = dk(B.bear ? shA(B.skin, 0.12) : gl ? gl.color : B.skin);
  const rp = ramp(base, B.bear ? 'fur' : gl ? 'leather' : 'skin');
  const len = Math.hypot(dir.x, dir.y) || 1;
  const ux = dir.x / len;
  const uy = dir.y / len;
  const d = m.handD;
  const cx = X(h) + ux * 0.4;
  const cy = Y(h) + uy * 0.4;
  layer({ sh: 0.32, aa: d >= 3 });
  const idxAt = (x: number, y: number, rx: number, ry: number) => {
    const dx = (x + 0.5 - cx) / rx;
    const dy = (y + 0.5 - cy) / ry;
    return toneIdx(formV(dx, -dy, LATV, UPV), false);
  };
  if (kind === 'fist') {
    const rr = d / 2 + 0.35;
    oval(cx, cy, rr, rr, (x, y) => toneAt(rp, idxAt(x, y, rr, rr)));
    // Knuckle ridge across the far end, finger gap below it.
    for (let i = -1; i <= 1; i++) {
      const kx = cx + ux * (rr - 0.6) + -uy * i;
      const ky = cy + uy * (rr - 0.6) + ux * i;
      if (d >= 3) px(kx, ky, i === 0 ? rp.l1 : rp.m);
    }
    px(cx - ux * (rr - 0.6), cy - uy * (rr - 0.6), rp.d1);
    return;
  }
  if (kind === 'open' || kind === 'grab') {
    const rr = d / 2 + 0.2;
    const ex0 = kind === 'open' ? 1 : 0.5;
    oval(cx + ux * 0.3, cy + uy * 0.3, rr, rr, (x, y) => toneAt(rp, idxAt(x, y, rr, rr)));
    // Fingers fanned at the far end.
    const n = d >= 3 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const o = i - (n - 1) / 2;
      const fx = cx + ux * (rr + ex0) + -uy * o;
      const fy = cy + uy * (rr + ex0) + ux * o;
      px(fx, fy, i % 2 === 0 ? rp.m : rp.d1);
      if (kind === 'open' && i % 2 === 0 && d >= 3) px(fx + ux * 0.9, fy + uy * 0.9, rp.d1);
    }
    // Thumb on the body side.
    const side = near ? 1 : -1;
    px(cx + -uy * side * (rr + 0.4), cy + ux * side * (rr + 0.4), rp.m);
    return;
  }
  // Relaxed: a soft ball with a finger line near the far end.
  const rr = d / 2 + 0.15;
  oval(cx, cy, rr, rr + 0.3, (x, y) => toneAt(rp, idxAt(x, y, rr, rr + 0.3)));
  if (d >= 3) px(cx + ux * (rr - 0.3) + uy * 0.5, cy + uy * (rr - 0.3) - ux * 0.5, rp.d1);
}

export function drawLeg(h0: Pt, kn: Pt, an: Pt, near: boolean, outward: number): void {
  const m = B.m;
  const total = m.thigh + m.shin;
  layer({ sh: 0.3 });
  const wide = B.bot.wide ? 1 : 0;
  const paint = (off: number, span: number, dmax: number) => (s: number, v: number, _x: number, _y: number, _c: number, t: number): Color => {
    const base = dk(legColor(off + s * span, total, near));
    let idx = toneIdx(v, dmax >= 4) + GF;
    if (GK === 'denim' && dmax >= 4 && t > 0.1 && t < 0.45) idx -= 1; // outer seam
    if (GK === 'leather' && t > 0.55 && idx === 0) idx = 1; // boot shine
    return tint(base, idx, GK);
  };
  cyl(X(h0), Y(h0), X(kn), Y(kn), m.legD + wide, m.calfD + 0.5 + wide, B.skinR, { paint: paint(0, m.thigh, m.legD) });
  cyl(X(kn), Y(kn), X(an), Y(an) + 0.5, m.calfD + wide, Math.max(2, m.calfD - 1 + wide), B.skinR, { paint: paint(m.thigh, m.shin, m.calfD) });
  // Side stripe on tights / shorts / sweats.
  const L = B.look;
  if (B.bot.stripe && L.bottomAccent && L.bottomAccent !== L.bottomColor) {
    const cov = B.bot.len * total;
    const off = B.view === 'side' ? 0 : outward * (m.legD / 2 - 0.5);
    const kT = clamp(cov / m.thigh, 0, 1);
    const endA = { x: lerp(h0.x, kn.x, kT), y: lerp(h0.y, kn.y, kT) };
    const sc = dk(L.bottomAccent);
    line(X(h0) + off, Y(h0), X(endA) + off, Y(endA) - 0.5, sc);
    if (cov > m.thigh + 0.5) {
      const kS = clamp((cov - m.thigh) / m.shin, 0, 1);
      const bh = BOOT_H[L.shoes];
      const stop = bh !== undefined ? Math.min(kS, 1 - bh) : kS;
      if (stop > 0) line(X(kn) + off, Y(kn), X({ x: lerp(kn.x, an.x, stop), y: 0 }) + off, Y({ x: 0, y: lerp(kn.y, an.y, stop) }) - 0.5, sc);
    }
  }
}

const SOLE: Record<string, string> = { sneakers: '#f6eadc', hightops: '#f6eadc', clogs: '#c8a070', sandals: '#b07a50', flipflops: '#f2b84a' };

export function drawShoe(an: Pt, near: boolean): void {
  const L = B.look;
  const m = B.m;
  const st = B.bear ? 'barefoot' : L.shoes;
  const bare = st === 'barefoot' || st === 'sandals' || st === 'flipflops';
  const main = dk(bare ? B.skin : L.shoesColor);
  const rp = ramp(main, bare ? (B.bear ? 'fur' : 'skin') : st === 'sneakers' || st === 'hightops' ? 'cloth' : 'leather');
  const sole = SOLE[st] ? dk(SOLE[st]) : rp.d2;
  layer({ sh: 0.32, hl: 0, aa: false });
  const ax = X(an);
  const ay = Math.round(Y(an));
  const h = m.shoe + (st === 'clogs' ? 1 : 0);
  if (B.view !== 'side') {
    const w = Math.max(3, m.calfD + (bare ? 0 : 1));
    const x0 = Math.round(ax - w / 2);
    const top = ay - (st === 'clogs' ? 1 : 0);
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        const soleRow = j === h - 1 && !bare;
        let c: Color = soleRow ? sole : i === 0 ? rp.l1 : i === w - 1 ? rp.d1 : rp.m;
        if (soleRow && i === w - 1) c = shA(sole, 0.3);
        px(x0 + i, top + j, c);
      }
    if (st === 'sandals' || st === 'flipflops') {
      rect(x0, ay, w, 1, dk(st === 'sandals' ? '#8a5a3a' : sole));
      if (st === 'sandals') px(x0 + 1, ay - 1, dk('#8a5a3a'));
    }
    if (bare && !B.bear) for (let i = 1; i < w; i += 2) px(x0 + i, ay + h - 1, rp.d1);
    if (B.bear) for (let i = 0; i < w; i += 2) dpx(x0 + i, ay + h - 1, '#f2e6c9');
    if (B.view === 'front') {
      if (st === 'sneakers' || st === 'hightops') {
        px(x0 + Math.floor(w / 2), ay, rp.l2);
        px(x0 + w - 1, ay, dk(L.shoesColor === '#f2f2f2' ? '#d8434b' : rp.l1));
      }
      if (st === 'wrestling-boots') for (let j = 1; j <= Math.round(m.shin * 0.6); j += 2) dpx(Math.round(ax), ay - j, rp.l2);
      if (st === 'kickpads') {
        const sh = Math.round(m.shin * 0.75);
        for (let j = 1; j <= sh; j++) px(Math.round(ax) - 1, ay - j, rp.l1);
        px(Math.round(ax), ay - sh, rp.d1);
      }
      if (st === 'boots' || st === 'cowboy-boots') px(x0 + 1, ay - 1, rp.l1);
    }
    return;
  }
  // Side view: the foot points forward (+x); heel at the back.
  const fl = m.footL + (st === 'cowboy-boots' ? 1 : 0) + (bare ? -1 : 0);
  const x0 = Math.round(ax - 1.5);
  for (let j = 0; j < h; j++) {
    const top = j === 0 && h > 1;
    const soleRow = j === h - 1 && !bare;
    const wj = top ? fl - (st === 'cowboy-boots' ? 2 : 1) : fl;
    for (let i = 0; i < wj; i++) {
      let c: Color = soleRow ? sole : i === 0 ? rp.l1 : i === wj - 1 ? rp.d1 : rp.m;
      if (top && i === wj - 2 && !bare) c = rp.l1;
      if (soleRow && i === 0) c = shA(sole, 0.25);
      px(x0 + i, ay + j, c);
    }
  }
  if (st === 'cowboy-boots' || st === 'boots') rect(x0, ay + h, 2, 1, rp.d2);
  if (st === 'flipflops' || st === 'sandals') rect(x0, ay + h - 1, fl, 1, dk(sole));
  if (st === 'sneakers' || st === 'hightops') for (let i = 1; i < fl - 2; i += 2) px(x0 + i, ay, rp.l2);
  if (st === 'wrestling-boots') for (let j = 1; j <= Math.round(m.shin * 0.6); j += 2) dpx(Math.round(ax) + 1, ay - j, rp.l2);
  if (B.bear) {
    dpx(x0 + fl - 1, ay + h - 1, '#f2e6c9');
    dpx(x0 + fl - 3, ay + h - 1, '#f2e6c9');
  }
  void near;
}

export function drawSkirt(): void {
  const r = B.r;
  const m = B.m;
  const L = B.look;
  const sk = B.bot.skirt;
  if (!sk) return;
  const len = sk * (m.thigh + m.shin + m.shoe);
  const col0 = L.top === 'dress' ? L.topColor : L.bottomColor;
  const acc = L.top === 'dress' ? L.topAccent : L.bottomAccent;
  const pat = L.bottom === 'kilt' ? 'plaid' : L.top === 'dress' ? L.topPattern : L.bottomPattern;
  const bx = B.AX + r.hip.x;
  const by = B.AY + r.hip.y + (r.def.bob ?? 0) - 1;
  layer({ sh: 0.3, bottom: true });
  const paint = (x: number, y: number) => {
    const yy = y - by;
    if (yy >= len - 1) return tint(acc, 0, 'cloth');
    const base = pattern(pat, x + 64, y, col0, acc, 1, B.tw);
    const lx = x + 0.5 - bx;
    const hw = m.hipW / 2 + 1 + (yy / len) * 2;
    let idx = toneIdx(formV(lx / hw, 0, LATV, UPV), hw >= 4);
    // Pleats.
    const k = ((Math.floor(lx + 64) % 4) + 4) % 4;
    if (k === 0) idx -= 1;
    else if (k === 2 && idx === 0) idx += 1;
    if (yy < 1) idx -= 1;
    return tint(base, idx, 'cloth');
  };
  if (B.view !== 'side') {
    const w0 = m.hipW / 2 + 0.5;
    const w1 = w0 + (sk > 0.8 ? 3 : 2);
    shape([[bx - w0, by], [bx + w0, by], [bx + w1, by + len], [bx - w1, by + len]], paint);
  } else {
    const [f, b] = sideEdges(0);
    shape([[bx + b - 0.5, by], [bx + f + 0.5, by], [bx + f + 2.5, by + len], [bx + b - 2.5, by + len]], paint);
  }
}

// ---------------------------------------------------------------------------
//  Extras
// ---------------------------------------------------------------------------

/** Cloth drape painter: folds, a lit ridge and a wavy hem with the lining showing. */
function drapePaint(c: string, a: string, patId: string | undefined, x0: number, x1: number, y0: number, y1: number, lining: boolean) {
  const w = Math.max(1, x1 - x0);
  return (x: number, y: number): Color => {
    const t = ((x + 0.5 - x0) / w) * 2 - 1;
    const u = 1 - ((y - y0) / Math.max(1, y1 - y0)) * 2;
    const base = pattern(patId, x + 64, y, c, a, 1, B.tw);
    let idx = toneIdx(formV(t, u, LATV, UPV), w >= 5);
    const k = ((Math.floor(x + 64 - x0) % 5) + 5) % 5;
    if (k === 3 && w >= 6) idx -= 1;
    if (k === 1 && idx === 0 && w >= 8) idx += 1;
    const hem = y >= y1 - 1 - (((x + 64) >> 1) & 1);
    if (hem && lining) return tint(a, -1, 'cloth');
    if (y >= y1 - 1) idx -= 1;
    return tint(base, idx, 'cloth');
  };
}

/** Behind-everything extras: capes, robes, wings. */
export function drawBackExtras(): void {
  const r = B.r;
  const m = B.m;
  const view = B.view;
  const sx = X(r.neck);
  const sy = Y(r.neck) + 1;
  const floor = B.AY + r.hip.y + m.thigh + m.shin + m.shoe;
  const sway = B.sway;
  for (const e of B.look.extras ?? []) {
    if (EXTRA_SLOT[e.id] !== 'back') continue;
    const c = e.color;
    const a = e.accent ?? (shA(c, 0.25) as unknown as string);
    if (e.id === 'wings') continue; // drawn with the arms
    layer({ sh: 0.32, hl: 0.12, bottom: false, cast: false });
    if (e.id === 'moth-wings') {
      const span = m.shW + 10;
      const wingPaint = (x: number, y: number): Color => {
        const spot = Math.hypot(x - sx + (x < sx ? span * 0.35 : -span * 0.35), y - sy - 2) < 1.6;
        if (spot) return '#f2e6c9';
        const vein = (x + y * 2) % 7 === 0;
        const idx = vein ? -1 : toneIdx(formV(((x - sx) / span) * 2, 0, LATV, UPV), true);
        return tint(c, idx, 'cloth');
      };
      if (view === 'side') shape([[sx - 1, sy], [sx - 9, sy - 9], [sx - 13, sy - 2], [sx - 10, sy + 10], [sx - 3, sy + 8]], wingPaint);
      else for (const s of [-1, 1]) shape([[sx, sy], [sx + s * span * 0.55, sy - 9], [sx + s * span * 0.62, sy + 2], [sx + s * span * 0.45, sy + 14], [sx + s * 2, sy + 9]], wingPaint);
      continue;
    }
    const len = (e.id === 'cape' ? floor - sy - 2 : floor - sy - (e.id === 'duster' ? 1 : 3)) + sway;
    const hw = m.shW / 2 + 1;
    if (view === 'side') {
      const flare = r.def.open ? 6 : 3;
      const x0 = sx - m.depth / 2 - flare;
      shape([[sx - 1, sy], [sx - m.depth / 2 - 0.5, sy], [x0, sy + len], [sx + 1, sy + len]], drapePaint(c, a, e.pattern, x0, sx + 1, sy, sy + len, e.id === 'cape'));
    } else if (view === 'front') {
      shape([[sx - hw, sy], [sx + hw, sy], [sx + hw + 2, sy + len], [sx - hw - 2, sy + len]], drapePaint(shA(c, 0.1) as unknown as string, a, e.pattern, sx - hw - 2, sx + hw + 2, sy, sy + len, false));
    }
  }
}

/** Back view: capes and robes cover the back. */
function drawBackViewCover(): void {
  const r = B.r;
  const m = B.m;
  const sx = X(r.neck);
  const sy = Y(r.neck) + 1;
  const floor = B.AY + r.hip.y + m.thigh + m.shin + m.shoe;
  for (const e of B.look.extras ?? []) {
    if (!['cape', 'robe', 'duster', 'moth-wings', 'jacket', 'blazer', 'cardigan', 'vest'].includes(e.id)) continue;
    const c = e.color;
    const a = e.accent ?? (shA(c, 0.25) as unknown as string);
    layer({ sh: 0.3, hl: 0.12, bottom: true });
    const hw = m.shW / 2 + 1;
    if (e.id === 'moth-wings') {
      for (const s of [-1, 1]) shape([[sx, sy], [sx + s * (m.shW + 10) * 0.55, sy - 9], [sx + s * (m.shW + 10) * 0.62, sy + 2], [sx + s * (m.shW + 10) * 0.45, sy + 14], [sx + s * 2, sy + 9]], (x, y) => ((x + y * 2) % 7 === 0 ? tint(c, -1) : tint(c, toneIdx(formV(((x - sx) / (m.shW + 10)) * 2, 0, LATV, UPV), true))));
      continue;
    }
    if (['jacket', 'blazer', 'cardigan', 'vest'].includes(e.id)) {
      const x0 = sx - m.shW / 2;
      rect(x0, sy - 1, m.shW, m.torsoH - 1, (x, y) => {
        const base = pattern(e.pattern, x + 64, y, c, a, 1, B.tw);
        let idx = toneIdx(formV(((x + 0.5 - sx) / (m.shW / 2)), 0, LATV, UPV), true);
        if (x === Math.round(sx)) idx -= 1;
        return tint(base, idx, e.id === 'jacket' ? 'leather' : 'cloth');
      });
      continue;
    }
    const len = (e.id === 'cape' ? floor - sy - 2 : floor - sy - (e.id === 'duster' ? 1 : 3)) + B.sway;
    shape([[sx - hw, sy - 1], [sx + hw, sy - 1], [sx + hw + 2, sy + len], [sx - hw - 2, sy + len]], drapePaint(c, a, e.pattern, sx - hw - 2, sx + hw + 2, sy - 1, sy + len, e.id !== 'duster'));
  }
}

/** Front-of-torso extras (jackets, aprons, belts, neckwear). */
export function drawOverExtras(): void {
  const r = B.r;
  const m = B.m;
  const view = B.view;
  if (view === 'back') {
    drawBackViewCover();
    return;
  }
  const bx = X(r.hip);
  const by = Y(r.hip) + (r.def.bob ?? 0);
  const H = m.torsoH;
  const side = view === 'side';
  const fw = r.fw;
  const up = r.up;
  const tp = (lf: number, ly: number): [number, number] => (side ? [bx + fw.x * lf + up.x * ly, by + fw.y * lf + up.y * ly] : [bx + lf, by - ly]);
  const [fE] = side ? sideEdges(0.5) : [0];
  const floor = B.AY + r.hip.y + m.thigh + m.shin + m.shoe;
  for (const e of B.look.extras ?? []) {
    const slot = EXTRA_SLOT[e.id];
    if (slot !== 'over' && slot !== 'neck' && slot !== 'waist' && !(slot === 'back' && (e.id === 'robe' || e.id === 'duster'))) continue;
    const c = e.color;
    const a = e.accent ?? (shA(c, 0.28) as unknown as string);
    const kind = e.id === 'jacket' ? 'leather' : 'cloth';
    const paint = (x: number, y: number): Color => {
      const base = pattern(e.pattern, x + 64, y, c, a, 1, B.tw);
      const hw0 = frontHalfWidth(0.5) + 1;
      let idx = toneIdx(formV((x + 0.5 - bx) / hw0, 0, LATV, UPV), true);
      if (side) idx = toneIdx(formV(((x + 0.5 - bx) / (m.depth / 2)), 0, LATV, UPV), true);
      return tint(base, idx, kind);
    };
    layer({ sh: 0.3, hl: 0.1 });
    const hw = (ly: number) => frontHalfWidth(ly / H);
    switch (e.id) {
      case 'robe':
      case 'duster':
      case 'jacket':
      case 'blazer':
      case 'cardigan':
      case 'vest': {
        const long = e.id === 'robe' || e.id === 'duster';
        const bottom = long ? floor - by - 3 + B.sway : 0;
        if (side) {
          const [f0] = sideEdges(1);
          shape([tp(f0 - 1, H), tp(-m.depth / 2, H), tp(-m.depth / 2 - (long ? 1 : 0), -bottom), tp(fE - 1.5, -bottom)].map(([x, y]) => [x, y] as [number, number]), paint);
          if (e.id === 'robe' || e.id === 'blazer' || e.id === 'jacket') line(...tp(f0 - 1, H - 0.5), ...tp(fE - 1, H * 0.45), tint(a, 0));
        } else {
          const open = r.def.open && long ? 2 : 0;
          for (const s of [-1, 1]) {
            const inner = long ? 1.5 + open : 1.6;
            const pts: [number, number][] = [
              [bx + s * inner, by - H],
              [bx + s * (hw(H) + (long ? 1 : 0.5)), by - H + 0.5],
              [bx + s * (hw(H * 0.4) + (long ? 1.5 : 0.5)), by - H * 0.4],
              [bx + s * (hw(0) + (long ? 2.5 : 0.5)), by + bottom],
              [bx + s * (inner + (long ? 1.5 : 0)), by + bottom],
            ];
            shape(pts, (x, y) => {
              // Lining shows along the inner edge of an open front.
              const dx = Math.abs(x + 0.5 - bx);
              if (long && dx < inner + 1 && y > by - H + 1) return tint(a, -1);
              return paint(x, y);
            });
            if (e.id !== 'vest') line(bx + s * inner, by - H + 0.5, bx + s * (inner + 1.2), by - H * 0.5, tint(a, 1));
          }
          if (e.id === 'robe' && e.accent) rect(bx - hw(H) - 1, by - H - 1, hw(H) * 2 + 2, 1, tint(a, 0));
        }
        break;
      }
      case 'apron': {
        if (side) shape([tp(fE + 0.5, H * 0.75), tp(fE - 1, H * 0.75), tp(fE - 1, -m.thigh - 1), tp(fE + 1, -m.thigh - 1)], paint);
        else {
          const w = Math.max(3, m.waistW * 0.6);
          shape([[bx - w / 2 + 0.5, by - H * 0.75], [bx + w / 2 - 0.5, by - H * 0.75], [bx + w / 2 + 0.5, by + m.thigh + 1], [bx - w / 2 - 0.5, by + m.thigh + 1]], (x, y) => {
            if (y === Math.round(by + m.thigh)) return tint(c, -1);
            if (y > by - 1 && y < by + 2 && Math.abs(x + 0.5 - bx) < 2) return tint(c, -1); // pocket
            return paint(x, y);
          });
          rect(bx - hw(H * 0.35), by - H * 0.35, hw(H * 0.35) * 2, 1, tint(a, 0));
        }
        break;
      }
      case 'sash':
        if (!side) {
          line(bx + hw(H) - 1, by - H + 0.5, bx - hw(0) + 1, by - 1, tint(c, 0));
          line(bx + hw(H) - 2, by - H + 0.5, bx - hw(0), by - 1, tint(c, -1));
        }
        break;
      case 'suspenders':
        if (!side) for (const s of [-1, 1]) line(bx + s * hw(H) * 0.45, by - H, bx + s * hw(0) * 0.45, by - 2, tint(c, 0));
        else line(...tp(0, H), ...tp(1, 2), tint(c, 0));
        break;
      case 'scarf':
      case 'bandana':
        if (side) {
          rect(X(r.neck) - 2, Y(r.neck) - 1, 5, 2, (x) => tint(c, x > X(r.neck) ? -1 : 0));
          if (e.id === 'scarf') rect(X(r.neck) - 3, Y(r.neck), 2, 5 + B.sway, (_x, y) => tint(a, (y & 1) === 0 ? 0 : -1));
        } else {
          rect(bx - m.headW * 0.3, by - H - 1, m.headW * 0.6, 2, (_x, y) => tint(c, y === Math.round(by - H - 1) ? 1 : 0));
          if (e.id === 'scarf') rect(bx + 1, by - H, 2, H * 0.55 + B.sway, (_x, y) => tint(a, (y & 1) === 0 ? 0 : -1));
          else shape([[bx - 2, by - H], [bx + 2, by - H], [bx, by - H + 3]], (x) => tint(c, x > bx ? -1 : 0));
        }
        break;
      case 'tie':
        if (!side) {
          rect(bx - 0.5, by - H, 1, H * 0.62, (_x: number, y: number) => (e.accent && y % 2 ? e.accent : c));
          px(bx - 1, by - H, tint(c, 1));
          px(bx, by - H + H * 0.62 - 1, tint(c, -1));
        }
        break;
      case 'bowtie':
        if (!side) {
          rect(bx - 2, by - H, 4, 1, tint(c, 0));
          px(bx - 2, by - H + 1, tint(c, -1));
          px(bx + 1, by - H + 1, tint(c, -1));
          px(bx - 0.5, by - H, tint(c, -1));
        }
        break;
      case 'pearls':
        layer({ flat: true });
        if (!side) for (let i = -2; i <= 2; i++) dpx(bx + i - 0.5, by - H + (Math.abs(i) < 2 ? 1 : 0), i % 2 ? '#fff6ea' : '#e6d6c8');
        break;
      case 'medal':
      case 'whistle':
      case 'lanyard':
      case 'camera':
      case 'stethoscope': {
        layer({ sh: 0.2 });
        const ly2 = H * 0.45;
        const [ex0, ey0] = side ? tp(fE, ly2) : [bx - 0.5, by - ly2];
        if (!side) {
          line(bx - 2, by - H, ex0, ey0, tint(a, 0));
          line(bx + 1, by - H, ex0 + 1, ey0, tint(a, -1));
        } else line(...tp(0, H), ex0, ey0, tint(a, 0));
        if (e.id === 'medal') {
          rect(ex0 - 0.5, ey0, 2, 2, tint(c, 0, 'metal'));
          px(ex0 - 0.5, ey0, tint(c, 2, 'metal'));
        } else if (e.id === 'whistle') rect(ex0, ey0, 2, 1, tint(c, 0, 'metal'));
        else if (e.id === 'lanyard') {
          rect(ex0 - 0.5, ey0, 2, 3, '#fbf6ec');
          px(ex0 - 0.5, ey0 + 1, tint(c, 0));
        } else if (e.id === 'camera') {
          rect(ex0 - 1.5, ey0, 4, 3, (x, y) => tint(c, y === Math.round(ey0) ? 1 : x === Math.round(ex0 + 1.5) ? -1 : 0));
          dpx(ex0, ey0 + 1, '#a8c8e8');
        } else rect(ex0, ey0, 1, 2, tint(c, 0, 'metal'));
        break;
      }
      case 'headphones':
        if (side) rect(X(r.neck) - 1, Y(r.neck) - 2, 3, 3, (x, y) => tint(c, y === Math.round(Y(r.neck) - 2) ? 1 : x === Math.round(X(r.neck) + 1) ? -1 : 0));
        else {
          rect(bx - m.headW / 2 + 1, by - H - 2, 3, 3, (_x, y) => tint(c, y === Math.round(by - H - 2) ? 1 : 0));
          rect(bx + m.headW / 2 - 4, by - H - 2, 3, 3, (x, y) => tint(c, y === Math.round(by - H - 2) ? 1 : x === Math.round(bx + m.headW / 2 - 2) ? -1 : 0));
          rect(bx - m.headW / 2 + 2, by - H - 1, m.headW - 4, 1, tint(a, 0));
        }
        break;
      case 'tape-measure':
        if (!side) {
          rect(bx - hw(H) * 0.55, by - H, 1, H * 0.6, (_x, y) => (y % 3 === 0 ? tint(c, -1) : tint(c, 0)));
          rect(bx + hw(H) * 0.55 - 1, by - H, 1, H * 0.7, (_x, y) => (y % 3 === 1 ? tint(c, -1) : tint(c, 0)));
          rect(bx - hw(H) * 0.55, by - H - 1, hw(H) * 1.1, 1, tint(c, 0));
        }
        break;
      case 'title-belt':
      case 'cardboard-belt':
      case 'tool-belt':
      case 'keys': {
        const wy = by - B.bot.wb - 0.5;
        if (e.id === 'keys') {
          layer({ flat: true });
          const kx = side ? bx + fE - 1 : bx + hw(0) - 1;
          dpx(kx, wy + 1, '#dcdae6');
          dpx(kx + 1, wy + 2, '#b8b8c4');
          dpx(kx - 1, wy + 2, '#f4b63f');
          break;
        }
        const strap = e.id === 'title-belt' ? (e.accent ?? '#3a2a44') : e.id === 'cardboard-belt' ? c : (e.accent ?? '#7a5236');
        const strapPaint = (_x: number, y: number) => tint(strap, y === Math.round(wy - 1) ? 0 : -1, 'leather') as Color;
        if (side) {
          shape([tp(fE + 0.5, B.bot.wb + 1.5), tp(-m.depth / 2 - 0.5, B.bot.wb + 1.5), tp(-m.depth / 2 - 0.5, B.bot.wb - 1), tp(fE + 0.5, B.bot.wb - 1)], strapPaint);
          if (e.id !== 'tool-belt') {
            const [px0, py0] = tp(fE - 1, B.bot.wb + 2);
            const gold = e.id === 'title-belt' ? c : '#c8a070';
            rect(px0 - 1, py0, 3, 4, (x, y) => tint(gold, x === Math.round(px0 - 1) && y === Math.round(py0) ? 2 : y === Math.round(py0 + 3) ? -1 : 0, 'metal'));
          } else {
            const [px0, py0] = tp(0, B.bot.wb);
            rect(px0 - 1, py0, 3, 3, (x, y) => tint(strap, y === Math.round(py0) ? 0 : x === Math.round(px0 + 1) ? -2 : -1, 'leather'));
          }
        } else {
          const w = hw(B.bot.wb) * 2 + 1;
          rect(bx - w / 2, wy - 1, w, 2, strapPaint);
          if (e.id === 'title-belt') {
            // Centre plate with an engraved ring and a ruby, flanked by side plates.
            const g = (i: number) => tint(c, i, 'metal');
            const px0 = Math.round(bx - 3);
            const py0 = Math.round(wy - 2);
            for (let y = 0; y < 4; y++)
              for (let x = 0; x < 6; x++) {
                const edge = x === 0 || x === 5 || y === 0 || y === 3;
                let cc: Color = edge ? (x === 0 || y === 0 ? g(1) : g(-1)) : g(0);
                if (x === 1 && y === 1) cc = g(2);
                if ((x === 2 || x === 3) && (y === 1 || y === 2)) cc = x === 2 && y === 1 ? '#ff6a5a' : '#c9283a';
                if ((x === 1 || x === 4) && y === 2) cc = g(-1);
                px(px0 + x, py0 + y, cc);
              }
            for (const sx0 of [bx - w / 2 + 0.5, bx + w / 2 - 2.5]) {
              rect(sx0, wy - 1, 2, 2, (x, y) => g(x === Math.round(sx0) && y === Math.round(wy - 1) ? 1 : 0));
            }
          } else if (e.id === 'cardboard-belt') {
            rect(bx - 3, wy - 2, 6, 4, (x, y) => tint('#d9aa6a', y === Math.round(wy - 2) ? 1 : x === Math.round(bx + 2) ? -1 : 0));
            dpx(bx - 2, wy - 1, '#dcdae6');
            dpx(bx, wy - 1, '#dcdae6');
            dpx(bx + 1, wy, '#e8343c');
            dpx(bx - 1, wy, '#ffd860');
          } else {
            for (const sx0 of [bx - w / 2 + 1, bx + w / 2 - 4]) rect(sx0, wy, 3, 3, (x, y) => tint(strap, y === Math.round(wy) ? 0 : x === Math.round(sx0 + 2) ? -2 : -1, 'leather'));
            px(bx - 0.5, wy - 1, tint('#b8b8c4', 1, 'metal'));
          }
        }
        break;
      }
    }
  }
}

/** Fabric butterfly wings from wrist to waist (open when arms rise). */
export function drawWings(near: boolean): void {
  const e = ex('wings');
  if (!e) return;
  const r = B.r;
  const c = e.color;
  const a = e.accent ?? '#e2903a';
  layer({ sh: 0.3, cast: false });
  const waist = { x: X(r.hip), y: Y(r.hip) - B.m.torsoH * 0.35 };
  const paint = (x: number, y: number): Color => {
    if ((x * 3 + y * 5) % 9 === 0) return INK;
    if ((x + y) % 4 === 0) return tint(a, 0);
    return tint(c, toneIdx(formV(((x - waist.x) / 10), 0, LATV, UPV), true));
  };
  if (B.view === 'side') {
    const s = near ? r.shF : r.shB;
    const h = near ? r.haF : r.haB;
    const el = near ? r.elF : r.elB;
    shape([[X(s), Y(s)], [X(el), Y(el)], [X(h), Y(h)], [waist.x, waist.y], [waist.x - 1, waist.y + 2]], (x, y) => dk(paint(x, y)));
    return;
  }
  for (const [s, el, h] of [[r.shF, r.elF, r.haF], [r.shB, r.elB, r.haB]] as const) {
    const wx = waist.x + Math.sign(s.x - r.hip.x) * B.m.waistW * 0.4;
    shape([[X(s), Y(s)], [X(el), Y(el)], [X(h), Y(h)], [wx, waist.y + 1], [wx, waist.y - 2]], paint);
  }
}

/** Hand-held props at the near/front hand. */
export function drawHandItem(): void {
  const r = B.r;
  if (!r.def.item) return;
  const it = (B.look.extras ?? []).find((e) => EXTRA_SLOT[e.id] === 'hand');
  if (!it) return;
  const h = r.haF;
  const hx = Math.round(X(h));
  const hy = Math.round(Y(h));
  const c = it.color;
  const a = it.accent ?? (shA(c, 0.3) as unknown as string);
  layer({ sh: 0.3, hl: 0.2, aa: false });
  const t = (col: Color, i: number, k: 'cloth' | 'metal' | 'leather' = 'cloth') => tint(col, i, k);
  switch (it.id) {
    case 'mic':
      rect(hx - 0.5, hy - 4, 1, 4, (_x, y) => t('#8a8aa0', y === hy - 4 ? 1 : 0, 'metal'));
      rect(hx - 1, hy - 6, 2, 2, (x, y) => t(c, x === hx - 1 && y === hy - 6 ? 1 : -1, 'metal'));
      break;
    case 'book':
      rect(hx - 2, hy - 2, 4, 5, (x, y) => t(c, y === hy - 2 ? 1 : x === hx + 1 ? -1 : 0));
      rect(hx - 2, hy - 2, 1, 5, t(a, 0));
      dpx(hx + 1, hy - 1, '#fbf6ec');
      break;
    case 'purse':
      rect(hx - 2, hy + 1, 5, 4, (x, y) => t(c, y === hy + 1 ? 1 : x === hx + 2 ? -1 : 0, 'leather'));
      dpx(hx, hy + 2, '#ffd050');
      line(hx - 1, hy + 1, hx, hy - 1, t(a, 0, 'leather'));
      break;
    case 'cane':
      line(hx, hy, hx + 1, B.AY - 1, t(c, 0, 'leather'));
      px(hx - 1, hy, t(c, 1, 'leather'));
      px(hx, hy - 1, t(c, 1, 'leather'));
      break;
    case 'coffee-pot':
      rect(hx - 1, hy - 1, 4, 4, (x, y) => t(c, x === hx - 1 ? 1 : x === hx + 2 ? -1 : y === hy + 2 ? -1 : 0, 'metal'));
      rect(hx - 1, hy - 2, 4, 1, t(a, 0, 'metal'));
      dpx(hx, hy, '#5a3a2e');
      break;
    case 'clipboard':
      rect(hx - 2, hy - 3, 4, 5, (x, y) => t(c, y === hy - 3 ? 1 : x === hx + 1 ? -1 : 0));
      rect(hx - 1, hy - 2, 2, 3, '#fbf6ec');
      dpx(hx - 1, hy - 1, '#b8b8c4');
      dpx(hx - 0.5, hy - 3, '#b8b8c4');
      break;
    case 'mirror':
      oval(hx + 0.5, hy - 2, 1.6, 2, (x, y) => (x === hx && y === hy - 3 ? '#ffffff' : '#cfe6f0'));
      rect(hx, hy - 0.5, 1, 2, t(c, 0, 'metal'));
      break;
    case 'pretzel':
      oval(hx + 0.5, hy - 1, 1.8, 1.5, (x, y) => t(c, y === hy - 2 ? 1 : x === hx + 2 ? -1 : 0));
      dpx(hx, hy - 1, '#f6e0bc');
      dpx(hx + 1, hy - 2, '#fff6ea');
      break;
    case 'phone':
      rect(hx - 1, hy - 2, 2, 3, (x, y) => t(c, x === hx - 1 && y === hy - 2 ? 1 : -1));
      dpx(hx - 1, hy - 1, '#a8d8f0');
      dpx(hx, hy - 1, '#78b8e0');
      break;
    case 'scissors':
      rect(hx - 0.5, hy - 5, 1, 5, t(c, 0, 'metal'));
      rect(hx + 0.5, hy - 5, 1, 4, t(c, 2, 'metal'));
      px(hx - 1, hy, t(c, -1, 'metal'));
      break;
    case 'ukulele':
      oval(hx + 1, hy + 1, 2, 2.4, (x, y) => t(c, y < hy ? 1 : x > hx + 1 ? -1 : 0));
      dpx(hx + 1, hy + 1, INK);
      line(hx, hy, hx - 2, hy - 4, t(a, 0));
      break;
  }
}

/** Bear belly patch and fur speckle helper for Wanda. */
export function furSpeckle(x: number, y: number, base: Color): Color {
  return (x * 5 + y * 3) % 7 === 0 ? tint(base, -1, 'fur') : base;
}

export { setG, bottomColorAt, liA, mixc, disc };
