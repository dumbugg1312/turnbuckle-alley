import { liA, mixc, P, shA, type Color } from '../kit';
import { EXTRA_SLOT } from '../look';
import { K, shoulderDropOf, type Hand } from './body';
import { armColor, B, bottomColorAt, BOOT_H, dk, ex, GF, GK, legColor, pattern, setG, shade, torsoFront, torsoSide, X, Y } from './garments';
import { INK, ramp, tint, toneAt } from './palette';
import { clamp, cyl, disc, dpx, drect, formV, layer, lerp, line, oval, px, pt, rect, shape, toneIdx, type Pt } from './raster';

/**
 * Body painters at art resolution (K art pixels per native pixel): torso,
 * neck, limbs, hands, feet, skirts, capes, jackets, belts, neckwear and hand
 * props. Garment shaders work in native units, so painters divide by K when
 * asking them for a colour.
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

/** Like interp, but eased between keys so a profile has no corners. */
export function interpSmooth(keys: [number, number][], t: number): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++)
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1];
      const [t1, v1] = keys[i];
      const u = (t - t0) / (t1 - t0);
      return lerp(v0, v1, u * u * (3 - 2 * u));
    }
  return keys[keys.length - 1][1];
}

export function frontHalfWidth(t: number): number {
  const m = B.m;
  const bump = m.belly * Math.sin(Math.PI * clamp((t - 0.02) / 0.62, 0, 1));
  // The chest stops short of the deltoids; the arms' rounded caps finish the shoulder line.
  const chest = m.shW / 2 - m.armD * 0.3;
  const body = interp([[0, m.hipW / 2], [0.3, m.waistW / 2], [0.7, chest]], t) + bump * 0.5;
  return Math.min(body, shoulderSlope((1 - t) * m.torsoH));
}

/**
 * Half width of the trapezius line `d` art px below the top of the torso: it
 * leaves the neck and rolls down and out to the shoulder, rather than the flat,
 * square top that read as a toy figure.
 */
export function shoulderSlope(d: number): number {
  const m = B.m;
  const neck = Math.max(2 * K, Math.round(m.headW * 0.42)) / 2 + 0.5 * K;
  const chest = m.shW / 2 - m.armD * 0.3;
  const drop = shoulderDrop(m);
  const k = clamp(d / drop, 0, 1);
  return neck + (chest - neck) * Math.sqrt(k) * (1.15 - 0.15 * k);
}

/** How far the shoulder line falls from the neck to the shoulder point (art px). */
export function shoulderDrop(m: { shW: number; torsoH: number }): number {
  return shoulderDropOf(m, K);
}
export function sideEdges(t: number): [number, number] {
  const m = B.m;
  const d = m.depth;
  const bump = m.belly * Math.sin(Math.PI * clamp((t - 0.05) / 0.6, 0, 1));
  const f = interp([[0, d * 0.42], [0.3, d * 0.38], [0.55, d * 0.44], [0.8, d * 0.52], [1, d * 0.3]], t) + bump;
  // The back is an S, not a plank: the seat curves out at the hips, the
  // small of the back curves in at the waist, the upper back rounds out over
  // the shoulder blades and rolls in to the base of the neck.
  const b = interpSmooth([[0, -d * 0.6], [0.34, -d * 0.36], [0.78, -d * 0.6], [1, -d * 0.36]], t);
  return [f, b];
}

/** Side view: how far the seat hangs below the hip joint (art px). */
function seatDrop(): number {
  return Math.max(K, B.m.torsoH * 0.12);
}

const UPV: Pt = { x: 0, y: -1 };
const LATV: Pt = { x: 1, y: 0 };

export function drawTorso(): void {
  const r = B.r;
  const m = B.m;
  const H = m.torsoH;
  const bx = B.AX + r.hip.x;
  const by = B.AY + r.hip.y + (r.def.bob ?? 0) * K;
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
        const base = torsoFront((back ? -lx : lx) / K, ly / K, hw / K, back);
        const v = formV(lx / hw, (ly / H) * 2 - 1, LATV, UPV);
        P(x, y, pt(shade(base, toneIdx(v, hw >= 4 * K))));
      }
    }
    return;
  }
  const pts: [number, number][] = [];
  const N = 14;
  const fw = r.fw;
  const up = r.up;
  const tp = (lf: number, ly: number): [number, number] => [bx + fw.x * lf + up.x * ly, by + fw.y * lf + up.y * ly];
  // The seat: a rounded bulge below the hip joint, over the top of the thigh,
  // so the line of the back flows into the legs instead of dropping straight.
  const seat = seatDrop();
  const [f0, b0] = sideEdges(0);
  pts.push(tp(f0 * 0.2, -seat * 0.7));
  for (let i = 0; i <= N; i++) pts.push(tp(sideEdges(i / N)[0], (i / N) * H));
  for (let i = N; i >= 0; i--) pts.push(tp(sideEdges(i / N)[1], (i / N) * H));
  // A quarter ellipse from the back of the hips round under the seat.
  for (let i = 1; i <= 5; i++) {
    const a = (i / 5) * (Math.PI / 2);
    pts.push(tp(b0 * (0.45 + 0.55 * Math.cos(a)), -seat * Math.sin(a)));
  }
  shape(pts, (x, y) => {
    const dx = x + 0.5 - bx;
    const dy = y + 0.5 - by;
    const lf = dx * fw.x + dy * fw.y;
    const ly = clamp(dx * up.x + dy * up.y, 0, H);
    const [f, b] = sideEdges(clamp(ly / H, 0, 1));
    const base = torsoSide(lf / K, ly / K, f / K);
    const t = ((lf - b) / Math.max(1, f - b)) * 2 - 1;
    const v = formV(t, (ly / H) * 2 - 1, fw, up);
    return shade(base, toneIdx(v, f - b >= 5 * K));
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
  const w = Math.max(2 * K, Math.round(m.headW * 0.42));
  if (B.view !== 'side') {
    const x0 = Math.round(X(r.neck) - w / 2);
    const y1 = Math.round(Y(r.neck)) + K;
    for (let y = y1 - 4 * K; y < y1; y++)
      for (let x = x0; x < x0 + w; x++) {
        const t = (x + 0.5 - X(r.neck)) / (w / 2);
        let idx = toneIdx(formV(t, 0, LATV, UPV), true) - 1;
        // Tendon lines either side of the throat.
        if (!high && Math.abs(Math.abs(t) - 0.45) < 0.12 && y > y1 - 3 * K) idx -= 1;
        P(x, y, pt(toneAt(rp, Math.max(-2, idx))));
      }
  } else {
    cyl(X(r.neck) - 0.5 * K, Y(r.neck) + K, X(r.head) - 0.5 * K, Y(r.head) + K, w + K, w + K, rp, { vShift: -0.25 });
  }
}

// ---- limbs ----

export function drawArm(sh: Pt, el: Pt, ha: Pt, hand: Hand, near: boolean): void {
  const m = B.m;
  const total = m.upArm + m.foreArm;
  layer({ sh: 0.3, hl: 0.06 });
  const wide = B.sleeveLen > 0.9 ? B.sleeveWide * K : 0;
  const w0 = m.armD + wide;
  // Front / back: the edge of the arm that lies against the body below the
  // deltoid takes a shadow crease, so arm and torso read as separate forms.
  const front = B.view !== 'side';
  const towardBody = Math.sign(X(B.r.hip) - X(sh)) || 1;
  const paint = (off: number, span: number, dmax: number) => (s: number, v: number, x: number, _y: number, _c: number, t: number): Color => {
    const base = dk(armColor((off + s * span) / K, total / K));
    let idx = toneIdx(v, dmax >= 4 * K) + GF;
    if (front && Math.abs(t) > 0.55 && off + s * span > m.armD * 0.6) {
      const a0 = off === 0 ? sh : el;
      const a1 = off === 0 ? el : ha;
      const axis = X(a0) + (X(a1) - X(a0)) * s;
      if (Math.sign(x + 0.5 - axis) === towardBody) idx = Math.min(idx, -1);
    }
    // A lit seam along a sleeve, a crease where the sleeve ends.
    if (GK !== 'skin' && GK !== 'fur' && dmax >= 5 * K) {
      const col = Math.floor(((t + 1) / 2) * dmax);
      if (col === Math.floor(dmax * 0.3) && idx === 0) idx = 1;
    }
    return tint(base, idx, GK);
  };
  cyl(X(sh), Y(sh), X(el), Y(el), w0, m.foreD + wide, B.skinR, { paint: paint(0, m.upArm, w0) });
  cyl(X(el), Y(el), X(ha), Y(ha), m.foreD + wide, Math.max(2 * K, m.foreD), B.skinR, { paint: paint(m.upArm, m.foreArm, m.foreD + wide) });
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
  const cx = X(h) + ux * 0.4 * K;
  const cy = Y(h) + uy * 0.4 * K;
  const side = near ? 1 : -1;
  layer({ sh: 0.32, aa: d >= 3 * K });
  const idxAt = (x: number, y: number, rx: number, ry: number) => {
    const dx = (x + 0.5 - cx) / rx;
    const dy = (y + 0.5 - cy) / ry;
    return toneIdx(formV(dx, -dy, LATV, UPV), d >= 3 * K);
  };
  // Perpendicular (to the body side).
  const px0 = -uy * side;
  const py0 = ux * side;
  if (kind === 'fist') {
    const rr = d / 2 + 0.35 * K;
    oval(cx, cy, rr, rr, (x, y) => toneAt(rp, idxAt(x, y, rr, rr)));
    // Knuckles across the far end with finger breaks between them.
    const n = d >= 3 * K ? 4 : 3;
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * (d / n);
      const kx = cx + ux * (rr - 0.8 * K) - uy * o;
      const ky = cy + uy * (rr - 0.8 * K) + ux * o;
      px(kx, ky, i % 2 === 0 ? rp.l1 : rp.m);
      px(kx + ux, ky + uy, rp.d1);
    }
    // Thumb folded over the fingers.
    rect(cx + px0 * (rr - 1.2 * K) - 0.5 * K, cy + py0 * (rr - 1.2 * K) - 0.5 * K, K, K, rp.m);
    px(cx + px0 * (rr - 1.2 * K) + K - 1, cy + py0 * (rr - 1.2 * K) + K - 1, rp.d1);
    return;
  }
  if (kind === 'open' || kind === 'grab') {
    const rr = d / 2 + 0.2 * K;
    const reach = kind === 'open' ? 1.2 * K : 0.6 * K;
    oval(cx + ux * 0.3 * K, cy + uy * 0.3 * K, rr, rr, (x, y) => toneAt(rp, idxAt(x, y, rr, rr)));
    // Fingers fanned at the far end, one art pixel each with tone breaks.
    const n = d >= 3 * K ? 4 : 3;
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * 1.1;
      const lenF = reach + (i === 0 || i === n - 1 ? 0 : 0.5 * K);
      for (let s = 0; s <= lenF; s++) {
        const fx = cx + ux * (rr - 0.5 * K + s) - uy * o;
        const fy = cy + uy * (rr - 0.5 * K + s) + ux * o;
        px(fx, fy, i % 2 === 0 ? (s > lenF - 1 ? rp.d1 : rp.m) : rp.d1);
      }
    }
    // Thumb on the body side.
    rect(cx + px0 * (rr + 0.2 * K) - 0.5 * K, cy + py0 * (rr + 0.2 * K) - 0.5 * K, K, K, rp.m);
    px(cx + px0 * (rr + 0.2 * K) + ux * K, cy + py0 * (rr + 0.2 * K) + uy * K, rp.d1);
    return;
  }
  // Relaxed: a soft ball with a finger line near the far end and a thumb.
  // A hanging hand is longer than it is wide, a touch narrower than the wrist ball it used to be.
  const rr = d / 2 - 0.15 * K;
  oval(cx + ux * 0.2 * K, cy + uy * 0.2 * K, rr, rr + 0.6 * K, (x, y) => toneAt(rp, idxAt(x, y, rr, rr + 0.6 * K)));
  if (d >= 3 * K) {
    for (let i = -1; i <= 1; i++) px(cx + ux * (rr - 0.6 * K) - uy * i * 1.1, cy + uy * (rr - 0.6 * K) + ux * i * 1.1, i === 0 ? rp.d1 : rp.m);
    px(cx + px0 * (rr - 0.4 * K) - ux * 0.4 * K, cy + py0 * (rr - 0.4 * K) - uy * 0.4 * K, rp.l1);
  }
}

export function drawLeg(h0: Pt, kn: Pt, an: Pt, near: boolean, outward: number): void {
  const m = B.m;
  const total = m.thigh + m.shin;
  layer({ sh: 0.3 });
  const wide = B.bot.wide ? K : 0;
  const paint = (off: number, span: number, dmax: number) => (s: number, v: number, _x: number, _y: number, _c: number, t: number): Color => {
    const base = dk(legColor((off + s * span) / K, total / K, near));
    let idx = toneIdx(v, dmax >= 4 * K) + GF;
    const col = Math.floor(((t + 1) / 2) * dmax);
    if (GK === 'denim' && dmax >= 4 * K && col === Math.floor(dmax * 0.62)) idx -= 1; // outer seam
    if (GK === 'leather' && col === dmax - 1 && idx === 0) idx = 1; // boot shine
    return tint(base, idx, GK);
  };
  // Side view: the thigh is nearly as deep as the hips where it leaves the
  // seat and tapers to the knee, so the back flows down into the leg.
  const thighTop = B.view === 'side' ? Math.max(m.legD, m.depth * 0.85) + wide : m.legD + wide;
  cyl(X(h0), Y(h0), X(kn), Y(kn), thighTop, m.calfD + 0.5 * K + wide, B.skinR, { paint: paint(0, m.thigh, thighTop) });
  cyl(X(kn), Y(kn), X(an), Y(an) + 0.5 * K, m.calfD + wide, Math.max(2 * K, m.calfD - K + wide), B.skinR, { paint: paint(m.thigh, m.shin, m.calfD + wide) });
  // Side stripe on tights / shorts / sweats (one native pixel wide).
  const L = B.look;
  if (B.bot.stripe && L.bottomAccent && L.bottomAccent !== L.bottomColor) {
    const cov = (B.bot.len * total) / 1;
    const off = B.view === 'side' ? 0 : outward * (m.legD / 2 - 0.5 * K);
    const kT = clamp(cov / m.thigh, 0, 1);
    const endA = { x: lerp(h0.x, kn.x, kT), y: lerp(h0.y, kn.y, kT) };
    const sc = dk(L.bottomAccent);
    const sc2 = tint(sc, -1);
    for (let i = 0; i < K; i++) {
      line(X(h0) + off + i, Y(h0), X(endA) + off + i, Y(endA) - 0.5 * K, i === K - 1 ? sc2 : sc);
      if (cov > m.thigh + 0.5 * K) {
        const kS = clamp((cov - m.thigh) / m.shin, 0, 1);
        const bh = BOOT_H[L.shoes];
        const stop = bh !== undefined ? Math.min(kS, 1 - bh) : kS;
        if (stop > 0) line(X(kn) + off + i, Y(kn), X({ x: lerp(kn.x, an.x, stop), y: 0 }) + off + i, Y({ x: 0, y: lerp(kn.y, an.y, stop) }) - 0.5 * K, i === K - 1 ? sc2 : sc);
      }
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
  const soleD = shA(sole, 0.3);
  layer({ sh: 0.32, hl: 0, aa: false });
  const ax = X(an);
  const ay = Math.round(Y(an));
  const h = m.shoe + (st === 'clogs' ? K : 0);
  const soleH = bare ? 0 : Math.max(1, Math.round(K * 0.75));
  if (B.view !== 'side') {
    const w = Math.max(3 * K, m.calfD + (bare ? 0 : K));
    const x0 = Math.round(ax - w / 2);
    const top = ay - (st === 'clogs' ? K : 0);
    for (let j = 0; j < h; j++)
      for (let i = 0; i < w; i++) {
        const soleRow = j >= h - soleH;
        let c: Color = soleRow ? (j === h - 1 ? soleD : sole) : i < K ? rp.l1 : i >= w - K ? rp.d1 : rp.m;
        if (soleRow && i >= w - K) c = soleD;
        if (!soleRow && j === 0 && i >= K && i < w - K) c = rp.l1; // toe cap catches the light
        px(x0 + i, top + j, c);
      }
    if (st === 'sandals' || st === 'flipflops') {
      rect(x0, ay, w, K, dk(st === 'sandals' ? '#8a5a3a' : sole));
      if (st === 'sandals') rect(x0 + K, ay - K, w - 2 * K, 1, dk('#8a5a3a'));
      else rect(x0 + Math.floor(w / 2), ay - 1, 1, K, dk(sole));
    }
    if (bare && !B.bear) for (let i = K; i < w; i += 2) px(x0 + i, ay + h - 1, rp.d1); // toes
    if (B.bear) for (let i = 0; i < w; i += 2) dpx(x0 + i, ay + h - 1, '#f2e6c9');
    if (B.view === 'front') {
      if (st === 'sneakers' || st === 'hightops') {
        rect(x0 + Math.floor(w / 2) - 1, ay, 2, 1, rp.l2);
        rect(x0 + w - K, ay, K, 1, dk(L.shoesColor === '#f2f2f2' ? '#d8434b' : rp.l1));
        // Lace crosses up the ankle.
        for (let j = 1; j <= Math.round(m.shin * 0.22); j += 2) dpx(Math.round(ax) - 1 + (j & 2 ? 1 : 0), ay - j, rp.l2);
      }
      if (st === 'wrestling-boots') for (let j = 1; j <= Math.round(m.shin * 0.6); j += 2) drect(Math.round(ax) - 1, ay - j, 2, 1, rp.l2);
      if (st === 'kickpads') {
        const sh = Math.round(m.shin * 0.75);
        rect(Math.round(ax) - K, ay - sh, 2 * K, sh, (x, y) => (y === ay - sh ? rp.d1 : x === Math.round(ax) - K ? rp.l1 : rp.m));
        for (let j = 2; j < sh; j += 3) drect(Math.round(ax) - K, ay - j, 2 * K, 1, rp.d1);
      }
      if (st === 'boots' || st === 'cowboy-boots') rect(x0 + K, ay - K, K, 1, rp.l1);
    }
    return;
  }
  // Side view: the foot points forward (+x); heel at the back.
  const fl = m.footL + (st === 'cowboy-boots' ? K : 0) + (bare ? -K : 0);
  const x0 = Math.round(ax - 1.5 * K);
  for (let j = 0; j < h; j++) {
    const soleRow = j >= h - soleH;
    const toeIn = Math.max(0, Math.round((h - 1 - j) * 0.8));
    const wj = soleRow ? fl : fl - toeIn - (st === 'cowboy-boots' ? 1 : 0);
    for (let i = 0; i < wj; i++) {
      let c: Color = soleRow ? (j === h - 1 ? soleD : sole) : i < K ? rp.l1 : i >= wj - K ? rp.d1 : rp.m;
      if (!soleRow && j === 0 && i >= K) c = rp.l1;
      if (soleRow && i < K) c = soleD;
      px(x0 + i, ay + j, c);
    }
  }
  if (st === 'cowboy-boots' || st === 'boots') rect(x0, ay + h, 2 * K, K, rp.d2); // heel
  if (st === 'flipflops' || st === 'sandals') rect(x0, ay + h - 1, fl, 1, dk(sole));
  if (st === 'sneakers' || st === 'hightops') for (let i = K; i < fl - 2 * K; i += 2) px(x0 + i, ay, rp.l2);
  if (st === 'wrestling-boots') for (let j = 1; j <= Math.round(m.shin * 0.6); j += 2) drect(Math.round(ax) + 1, ay - j, 2, 1, rp.l2);
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
  const by = B.AY + r.hip.y + (r.def.bob ?? 0) * K - K;
  layer({ sh: 0.3, bottom: true });
  const paint = (x: number, y: number) => {
    const yy = y - by;
    if (yy >= len - K) return tint(acc, yy >= len - 1 ? -1 : 0, 'cloth');
    const base = pattern(pat, (x + 64) / K, y / K, col0, acc, 1, B.tw);
    const lx = x + 0.5 - bx;
    const hw = m.hipW / 2 + K + (yy / len) * 2 * K;
    let idx = toneIdx(formV(lx / hw, 0, LATV, UPV), hw >= 4 * K);
    // Pleats: a dark fold every six art pixels with a lit ridge beside it.
    const k = ((Math.floor(lx + 64) % 6) + 6) % 6;
    if (k === 0) idx -= 1;
    else if (k === 3 && idx === 0) idx += 1;
    if (yy < K) idx -= 1;
    return tint(base, idx, 'cloth');
  };
  if (B.view !== 'side') {
    const w0 = m.hipW / 2 + 0.5 * K;
    const w1 = w0 + (sk > 0.8 ? 3 : 2) * K;
    shape([[bx - w0, by], [bx + w0, by], [bx + w1, by + len], [bx - w1, by + len]], paint);
  } else {
    const [f, b] = sideEdges(0);
    shape([[bx + b - 0.5 * K, by], [bx + f + 0.5 * K, by], [bx + f + 2.5 * K, by + len], [bx + b - 2.5 * K, by + len]], paint);
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
    const base = pattern(patId, (x + 64) / K, y / K, c, a, 1, B.tw);
    let idx = toneIdx(formV(t, u, LATV, UPV), w >= 5 * K);
    const k = ((Math.floor(x + 64 - x0) % (5 * K)) + 5 * K) % (5 * K);
    if (k === 3 * K && w >= 6 * K) idx -= 1;
    if (k === K && idx === 0 && w >= 8 * K) idx += 1;
    const wave = (((x + 64) >> 2) & 1) * K;
    const hem = y >= y1 - K - wave;
    if (hem && lining) return tint(a, y >= y1 - 1 - wave ? -2 : -1, 'cloth');
    if (y >= y1 - K) idx -= 1;
    return tint(base, idx, 'cloth');
  };
}

/** Behind-everything extras: capes, robes, wings. */
export function drawBackExtras(): void {
  const r = B.r;
  const m = B.m;
  const view = B.view;
  const sx = X(r.neck);
  const sy = Y(r.neck) + K;
  const floor = B.AY + r.hip.y + m.thigh + m.shin + m.shoe;
  const sway = B.sway * K;
  for (const e of B.look.extras ?? []) {
    if (EXTRA_SLOT[e.id] !== 'back') continue;
    const c = e.color;
    const a = e.accent ?? (shA(c, 0.25) as unknown as string);
    if (e.id === 'wings') continue; // drawn with the arms
    layer({ sh: 0.32, hl: 0.12, bottom: false, cast: false });
    if (e.id === 'moth-wings') {
      const span = m.shW + 10 * K;
      const wingPaint = (x: number, y: number): Color => {
        const spot = Math.hypot(x - sx + (x < sx ? span * 0.35 : -span * 0.35), y - sy - 2 * K) < 1.6 * K;
        if (spot) return Math.hypot(x - sx + (x < sx ? span * 0.35 : -span * 0.35), y - sy - 2 * K) < 0.8 * K ? '#f2e6c9' : '#d8c8a8';
        const vein = ((x + y * 2) >> 1) % 7 === 0;
        const idx = vein ? -1 : toneIdx(formV(((x - sx) / span) * 2, 0, LATV, UPV), true);
        return tint(c, idx, 'cloth');
      };
      if (view === 'side') shape([[sx - K, sy], [sx - 9 * K, sy - 9 * K], [sx - 13 * K, sy - 2 * K], [sx - 10 * K, sy + 10 * K], [sx - 3 * K, sy + 8 * K]], wingPaint);
      else for (const s of [-1, 1]) shape([[sx, sy], [sx + s * span * 0.55, sy - 9 * K], [sx + s * span * 0.62, sy + 2 * K], [sx + s * span * 0.45, sy + 14 * K], [sx + s * 2 * K, sy + 9 * K]], wingPaint);
      continue;
    }
    const len = (e.id === 'cape' ? floor - sy - 2 * K : floor - sy - (e.id === 'duster' ? 1 : 3) * K) + sway;
    const hw = m.shW / 2 + K;
    if (view === 'side') {
      const flare = (r.def.open ? 6 : 3) * K;
      const x0 = sx - m.depth / 2 - flare;
      shape([[sx - K, sy], [sx - m.depth / 2 - 0.5 * K, sy], [x0, sy + len], [sx + K, sy + len]], drapePaint(c, a, e.pattern, x0, sx + K, sy, sy + len, e.id === 'cape'));
    } else if (view === 'front') {
      shape([[sx - hw, sy], [sx + hw, sy], [sx + hw + 2 * K, sy + len], [sx - hw - 2 * K, sy + len]], drapePaint(shA(c, 0.1) as unknown as string, a, e.pattern, sx - hw - 2 * K, sx + hw + 2 * K, sy, sy + len, false));
    }
  }
}

/** Back view: capes and robes cover the back. */
function drawBackViewCover(): void {
  const r = B.r;
  const m = B.m;
  const sx = X(r.neck);
  const sy = Y(r.neck) + K;
  const floor = B.AY + r.hip.y + m.thigh + m.shin + m.shoe;
  for (const e of B.look.extras ?? []) {
    if (!['cape', 'robe', 'duster', 'moth-wings', 'jacket', 'blazer', 'cardigan', 'vest'].includes(e.id)) continue;
    const c = e.color;
    const a = e.accent ?? (shA(c, 0.25) as unknown as string);
    layer({ sh: 0.3, hl: 0.12, bottom: true });
    const hw = m.shW / 2 + K;
    if (e.id === 'moth-wings') {
      const span = m.shW + 10 * K;
      for (const s of [-1, 1]) shape([[sx, sy], [sx + s * span * 0.55, sy - 9 * K], [sx + s * span * 0.62, sy + 2 * K], [sx + s * span * 0.45, sy + 14 * K], [sx + s * 2 * K, sy + 9 * K]], (x, y) => (((x + y * 2) >> 1) % 7 === 0 ? tint(c, -1) : tint(c, toneIdx(formV(((x - sx) / span) * 2, 0, LATV, UPV), true))));
      continue;
    }
    if (['jacket', 'blazer', 'cardigan', 'vest'].includes(e.id)) {
      const top = sy - K;
      const half = (y: number) => frontHalfWidth(1 - (y + 0.5 - top) / m.torsoH) + 0.5 * K;
      rect(sx - m.shW / 2 - K, top, m.shW + 2 * K, m.torsoH - K, (x, y) => {
        if (Math.abs(x + 0.5 - sx) > half(y)) return null;
        const base = pattern(e.pattern, (x + 64) / K, y / K, c, a, 1, B.tw);
        let idx = toneIdx(formV((x + 0.5 - sx) / (m.shW / 2), 0, LATV, UPV), true);
        if (x === Math.round(sx)) idx -= 1;
        if (y === Math.round(sy + m.torsoH * 0.3) && Math.abs(x + 0.5 - sx) < m.shW * 0.3) idx += 1;
        return tint(base, idx, e.id === 'jacket' ? 'leather' : 'cloth');
      });
      continue;
    }
    const len = (e.id === 'cape' ? floor - sy - 2 * K : floor - sy - (e.id === 'duster' ? 1 : 3) * K) + B.sway * K;
    shape([[sx - hw, sy - K], [sx + hw, sy - K], [sx + hw + 2 * K, sy + len], [sx - hw - 2 * K, sy + len]], drapePaint(c, a, e.pattern, sx - hw - 2 * K, sx + hw + 2 * K, sy - K, sy + len, e.id !== 'duster'));
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
  const by = Y(r.hip) + (r.def.bob ?? 0) * K;
  const H = m.torsoH;
  const side = view === 'side';
  const fw = r.fw;
  const up = r.up;
  const tp = (lf: number, ly: number): [number, number] => (side ? [bx + fw.x * lf + up.x * ly, by + fw.y * lf + up.y * ly] : [bx + lf, by - ly]);
  const [fE] = side ? sideEdges(0.5) : [0];
  const floor = B.AY + r.hip.y + m.thigh + m.shin + m.shoe;
  const wb = B.bot.wb * K;
  for (const e of B.look.extras ?? []) {
    const slot = EXTRA_SLOT[e.id];
    if (slot !== 'over' && slot !== 'neck' && slot !== 'waist' && !(slot === 'back' && (e.id === 'robe' || e.id === 'duster'))) continue;
    const c = e.color;
    const a = e.accent ?? (shA(c, 0.28) as unknown as string);
    const kind = e.id === 'jacket' ? 'leather' : 'cloth';
    const paint = (x: number, y: number): Color => {
      const base = pattern(e.pattern, (x + 64) / K, y / K, c, a, 1, B.tw);
      const hw0 = frontHalfWidth(0.5) + K;
      let idx = toneIdx(formV((x + 0.5 - bx) / hw0, 0, LATV, UPV), true);
      if (side) idx = toneIdx(formV((x + 0.5 - bx) / (m.depth / 2), 0, LATV, UPV), true);
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
        const bottom = long ? floor - by - 3 * K + B.sway * K : 0;
        if (side) {
          const [f0] = sideEdges(1);
          // The back of the coat follows the curve of the back (D-028), then
          // hangs from the seat; long coats flare a little toward the hem.
          const backPts: [number, number][] = [];
          // Cloth bridges the small of the back, so it takes half the body's curve.
          for (let i = 12; i >= 0; i--) backPts.push(tp((sideEdges(i / 12)[1] - m.depth * 0.5) * 0.5 - 0.5 * K, (i / 12) * H));
          const [, bSeat] = sideEdges(0);
          backPts.push(long ? tp(bSeat - 1.5 * K, -bottom) : tp(bSeat * 0.9 - 0.5 * K, -bottom - seatDrop() * 0.6));
          shape([tp(f0 - K, H), ...backPts, tp(fE - 1.5 * K, -bottom)], paint);
          if (e.id === 'robe' || e.id === 'blazer' || e.id === 'jacket') line(...tp(f0 - K, H - 0.5 * K), ...tp(fE - K, H * 0.45), tint(a, 0));
        } else {
          const open = r.def.open && long ? 2 * K : 0;
          for (const s of [-1, 1]) {
            const inner = (long ? 1.5 : 1.6) * K + open;
            const pts: [number, number][] = [
              [bx + s * inner, by - H],
              [bx + s * (hw(H) + (long ? 1 : 0.5) * K), by - H + 0.5 * K],
              [bx + s * (hw(H - shoulderDrop(m)) + (long ? 1 : 0.5) * K), by - H + shoulderDrop(m)],
              [bx + s * (hw(H * 0.4) + (long ? 1.5 : 0.5) * K), by - H * 0.4],
              [bx + s * (hw(0) + (long ? 2.5 : 0.5) * K), by + bottom],
              [bx + s * (inner + (long ? 1.5 : 0) * K), by + bottom],
            ];
            shape(pts, (x, y) => {
              const dx = Math.abs(x + 0.5 - bx);
              // Lining along the inner edge of an open front; a dark edge line.
              if (long && dx < inner + K && y > by - H + K) return tint(a, -1);
              if (!long && dx < inner + 1) return tint(c, -1, kind);
              return paint(x, y);
            });
            if (e.id !== 'vest') {
              // Lapel: a lit fold from the collar down to mid chest.
              shape([[bx + s * inner, by - H + 0.5 * K], [bx + s * (inner + 2.5 * K), by - H + 0.5 * K], [bx + s * (inner + 0.6 * K), by - H * 0.5]], (_x, y) => tint(long ? a : c, y < by - H + 1.5 * K ? 1 : 0, kind));
            }
            // Buttons on blazers and cardigans.
            if (e.id === 'blazer' || e.id === 'cardigan') for (let b = 0; b < 2; b++) drect(bx + s * (inner + 0.3 * K) - (s < 0 ? K : 0), by - H * (0.45 - b * 0.18), K, K, b === 0 ? tint(a, 1) : tint(a, 0));
          }
          if (e.id === 'robe' && e.accent) rect(bx - hw(H) - K, by - H - K, hw(H) * 2 + 2 * K, K, (x) => tint(a, x < bx ? 1 : 0));
        }
        break;
      }
      case 'apron': {
        if (side) shape([tp(fE + 0.5 * K, H * 0.75), tp(fE - K, H * 0.75), tp(fE - K, -m.thigh - K), tp(fE + K, -m.thigh - K)], paint);
        else {
          const w = Math.max(3 * K, m.waistW * 0.6);
          shape([[bx - w / 2 + 0.5 * K, by - H * 0.75], [bx + w / 2 - 0.5 * K, by - H * 0.75], [bx + w / 2 + 0.5 * K, by + m.thigh + K], [bx - w / 2 - 0.5 * K, by + m.thigh + K]], (x, y) => {
            if (y >= Math.round(by + m.thigh)) return tint(c, -1);
            // Pocket with a stitched edge.
            const pdx = Math.abs(x + 0.5 - bx);
            if (y > by - K && y < by + 2.5 * K && pdx < 2.5 * K) return tint(c, y === Math.round(by - K + 1) || pdx > 2.5 * K - 1 ? -1 : 0);
            return paint(x, y);
          });
          rect(bx - hw(H * 0.35), by - H * 0.35, hw(H * 0.35) * 2, K, (_x, y) => tint(a, y === Math.round(by - H * 0.35) ? 1 : 0));
          // Neck strap.
          for (const s of [-1, 1]) line(bx + s * (w / 2 - K), by - H * 0.75, bx + s * 1.5 * K, by - H - K, tint(a, 0));
        }
        break;
      }
      case 'sash':
        if (!side) {
          for (let i = 0; i < 2 * K; i++) line(bx + hw(H) - K + i, by - H + 0.5 * K, bx - hw(0) + K + i, by - K, tint(c, i < K ? 0 : -1));
        }
        break;
      case 'suspenders':
        if (!side) for (const s of [-1, 1]) for (let i = 0; i < K; i++) line(bx + s * hw(H) * 0.45 + i, by - H, bx + s * hw(0) * 0.45 + i, by - 2 * K, tint(c, i ? -1 : 0));
        else for (let i = 0; i < K; i++) line(...tp(i, H), ...tp(K + i, 2 * K), tint(c, i ? -1 : 0));
        break;
      case 'scarf':
      case 'bandana':
        if (side) {
          rect(X(r.neck) - 2 * K, Y(r.neck) - K, 5 * K, 2 * K, (x, y) => tint(c, x > X(r.neck) ? -1 : y < Y(r.neck) ? 1 : 0));
          if (e.id === 'scarf') rect(X(r.neck) - 3 * K, Y(r.neck), 2 * K, 5 * K + B.sway * K, (_x, y) => tint(a, Math.floor(y / K) % 2 === 0 ? 0 : -1));
        } else {
          rect(bx - m.headW * 0.3, by - H - K, m.headW * 0.6, 2 * K, (x, y) => tint(c, y < by - H ? 1 : Math.floor((x - bx + 64) / K) % 3 === 0 ? -1 : 0));
          if (e.id === 'scarf') rect(bx + K, by - H, 2 * K, H * 0.55 + B.sway * K, (x, y) => tint(a, Math.floor(y / K) % 2 === 0 ? (x < bx + 2 * K ? 1 : 0) : -1));
          else shape([[bx - 2 * K, by - H], [bx + 2 * K, by - H], [bx, by - H + 3 * K]], (x) => tint(c, x > bx ? -1 : 0));
        }
        break;
      case 'tie':
        if (!side) {
          rect(bx - 0.5 * K, by - H, K, H * 0.62, (x: number, y: number) => (e.accent && Math.floor(y / K) % 2 ? e.accent : tint(c, x >= bx ? -1 : 0)));
          rect(bx - K, by - H, 2 * K, K, (x) => tint(c, x < bx ? 1 : 0));
          px(bx, by - H + H * 0.62 - 1, tint(c, -1));
        }
        break;
      case 'bowtie':
        if (!side) {
          rect(bx - 2 * K, by - H, 4 * K, K, (x) => tint(c, x < bx ? 0 : -1));
          rect(bx - 2 * K, by - H + K, K, K, tint(c, -1));
          rect(bx + K, by - H + K, K, K, tint(c, -2));
          rect(bx - 0.5 * K, by - H, K, K, tint(c, 1));
        }
        break;
      case 'pearls':
        layer({ flat: true });
        if (!side) for (let i = -2; i <= 2; i++) {
          const pxx = bx + i * K - 0.5 * K;
          const pyy = by - H + (Math.abs(i) < 2 ? K : 0);
          drect(pxx, pyy, K, K, '#e6d6c8');
          dpx(pxx, pyy, '#fff6ea');
        }
        break;
      case 'medal':
      case 'whistle':
      case 'lanyard':
      case 'camera':
      case 'stethoscope': {
        layer({ sh: 0.2 });
        const ly2 = H * 0.45;
        const [ex0, ey0] = side ? tp(fE, ly2) : [bx - 0.5 * K, by - ly2];
        if (!side) {
          line(bx - 2 * K, by - H, ex0, ey0, tint(a, 0));
          line(bx + K, by - H, ex0 + K, ey0, tint(a, -1));
        } else line(...tp(0, H), ex0, ey0, tint(a, 0));
        if (e.id === 'medal') {
          disc(ex0 + 0.5 * K, ey0 + K, 2 * K, (x, y) => tint(c, x < ex0 && y < ey0 + K ? 2 : y > ey0 + 1.5 * K ? -1 : 0, 'metal'));
        } else if (e.id === 'whistle') rect(ex0, ey0, 2 * K, K, (_x, y) => tint(c, y === Math.round(ey0) ? 1 : 0, 'metal'));
        else if (e.id === 'lanyard') {
          rect(ex0 - 0.5 * K, ey0, 2 * K, 3 * K, '#fbf6ec');
          rect(ex0 - 0.5 * K, ey0, 2 * K, 1, tint(c, 0));
          rect(ex0, ey0 + K, K, 1, '#8a8aa0');
        } else if (e.id === 'camera') {
          rect(ex0 - 1.5 * K, ey0, 4 * K, 3 * K, (x, y) => tint(c, y < ey0 + 1 ? 1 : x >= ex0 + 1.5 * K ? -1 : 0));
          disc(ex0 + 0.5 * K, ey0 + 1.5 * K, 1.4 * K, (x, y) => (x < ex0 && y < ey0 + 1.5 * K ? '#d8ecf8' : '#a8c8e8'));
        } else rect(ex0, ey0, K, 2 * K, tint(c, 0, 'metal'));
        break;
      }
      case 'headphones':
        if (side) rect(X(r.neck) - K, Y(r.neck) - 2 * K, 3 * K, 3 * K, (x, y) => tint(c, y < Y(r.neck) - 2 * K + 1 ? 1 : x >= X(r.neck) + K ? -1 : 0));
        else {
          rect(bx - m.headW / 2 + K, by - H - 2 * K, 3 * K, 3 * K, (_x, y) => tint(c, y < by - H - 2 * K + 1 ? 1 : 0));
          rect(bx + m.headW / 2 - 4 * K, by - H - 2 * K, 3 * K, 3 * K, (x, y) => tint(c, y < by - H - 2 * K + 1 ? 1 : x >= bx + m.headW / 2 - 2 * K ? -1 : 0));
          rect(bx - m.headW / 2 + 2 * K, by - H - K, m.headW - 4 * K, K, tint(a, 0));
        }
        break;
      case 'tape-measure':
        if (!side) {
          rect(bx - hw(H) * 0.55, by - H, K, H * 0.6, (_x, y) => (Math.floor(y / K) % 3 === 0 ? tint(c, -1) : tint(c, 0)));
          rect(bx + hw(H) * 0.55 - K, by - H, K, H * 0.7, (_x, y) => (Math.floor(y / K) % 3 === 1 ? tint(c, -1) : tint(c, 0)));
          rect(bx - hw(H) * 0.55, by - H - K, hw(H) * 1.1, K, tint(c, 0));
        }
        break;
      case 'title-belt':
      case 'cardboard-belt':
      case 'tool-belt':
      case 'keys': {
        const wy = by - wb - 0.5 * K;
        if (e.id === 'keys') {
          layer({ flat: true });
          const kx = side ? bx + fE - K : bx + hw(0) - K;
          drect(kx, wy + K, K, K, '#dcdae6');
          drect(kx + K, wy + 2 * K, K, K, '#b8b8c4');
          drect(kx - K, wy + 2 * K, K, K, '#f4b63f');
          dpx(kx, wy + K, '#fbf6ec');
          break;
        }
        const strap = e.id === 'title-belt' ? (e.accent ?? '#3a2a44') : e.id === 'cardboard-belt' ? c : (e.accent ?? '#7a5236');
        const strapPaint = (_x: number, y: number) => tint(strap, y < wy - K + 1 ? 0 : y >= wy + K - 1 ? -2 : -1, 'leather') as Color;
        if (side) {
          shape([tp(fE + 0.5 * K, wb + 1.5 * K), tp(-m.depth / 2 - 0.5 * K, wb + 1.5 * K), tp(-m.depth / 2 - 0.5 * K, wb - K), tp(fE + 0.5 * K, wb - K)], strapPaint);
          if (e.id !== 'tool-belt') {
            const [px0, py0] = tp(fE - K, wb + 2 * K);
            const gold = e.id === 'title-belt' ? c : '#c8a070';
            rect(px0 - K, py0, 3 * K, 4 * K, (x, y) => tint(gold, x < px0 - K + 1 || y < py0 + 1 ? 1 : y >= py0 + 4 * K - 1 || x >= px0 + 2 * K - 1 ? -1 : 0, 'metal'));
          } else {
            const [px0, py0] = tp(0, wb);
            rect(px0 - K, py0, 3 * K, 3 * K, (x, y) => tint(strap, y < py0 + 1 ? 0 : x >= px0 + 2 * K - 1 ? -2 : -1, 'leather'));
          }
        } else {
          const w = hw(wb) * 2 + K;
          rect(bx - w / 2, wy - K, w, 2 * K, strapPaint);
          if (e.id === 'title-belt') {
            // Centre plate with a bevel, an engraved ring and a ruby, flanked by side plates.
            const g = (i: number) => tint(c, i, 'metal');
            const pw = 6 * K;
            const ph = 4 * K;
            const px0 = Math.round(bx - pw / 2);
            const py0 = Math.round(wy - 2 * K);
            for (let y = 0; y < ph; y++)
              for (let x = 0; x < pw; x++) {
                const edge = x === 0 || x === pw - 1 || y === 0 || y === ph - 1;
                let cc: Color = edge ? (x === 0 || y === 0 ? g(1) : g(-1)) : g(0);
                if (x === 1 && y === 1) cc = g(2);
                const rdx = x - (pw / 2 - 0.5);
                const rdy = y - (ph / 2 - 0.5);
                const rr = Math.hypot(rdx / (pw / 2 - 1.5), rdy / (ph / 2 - 1.2));
                if (rr > 0.78 && rr < 1.02 && !edge) cc = rdx + rdy < 0 ? g(2) : g(-1); // engraved ring
                if (Math.abs(rdx) < 1.1 && Math.abs(rdy) < 1.1) cc = rdx < 0 && rdy < 0 ? '#ff6a5a' : '#c9283a';
                if ((x === 2 || x === pw - 3) && y === ph - 2) cc = g(-1);
                px(px0 + x, py0 + y, cc);
              }
            for (const sx0 of [bx - w / 2 + 0.5 * K, bx + w / 2 - 2.5 * K]) {
              rect(sx0, wy - K, 2 * K, 2 * K, (x, y) => g(x < sx0 + 1 || y < wy - K + 1 ? 1 : x >= sx0 + 2 * K - 1 ? -1 : 0));
            }
          } else if (e.id === 'cardboard-belt') {
            rect(bx - 3 * K, wy - 2 * K, 6 * K, 4 * K, (x, y) => tint('#d9aa6a', y < wy - 2 * K + 1 ? 1 : x >= bx + 3 * K - 1 ? -1 : (x + y) % 5 === 0 ? -1 : 0));
            drect(bx - 2 * K, wy - K, K, K, '#dcdae6');
            drect(bx, wy - K, K, K, '#dcdae6');
            drect(bx + K, wy, K, K, '#e8343c');
            drect(bx - K, wy, K, K, '#ffd860');
          } else {
            for (const sx0 of [bx - w / 2 + K, bx + w / 2 - 4 * K]) rect(sx0, wy, 3 * K, 3 * K, (x, y) => tint(strap, y < wy + 1 ? 0 : x >= sx0 + 3 * K - 1 ? -2 : -1, 'leather'));
            rect(bx - 0.5 * K, wy - K, K, K, tint('#b8b8c4', 1, 'metal'));
            // A hammer handle poking out of a pocket.
            rect(bx - w / 2 + 2 * K, wy - 2 * K, 1, 2 * K, tint('#a07850', 0));
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
    const gx = Math.floor(x / K);
    const gy = Math.floor(y / K);
    if ((gx * 3 + gy * 5) % 9 === 0) return INK;
    if ((gx + gy) % 4 === 0) return tint(a, 0);
    return tint(c, toneIdx(formV((x - waist.x) / (10 * K), 0, LATV, UPV), true));
  };
  if (B.view === 'side') {
    const s = near ? r.shF : r.shB;
    const h = near ? r.haF : r.haB;
    const el = near ? r.elF : r.elB;
    shape([[X(s), Y(s)], [X(el), Y(el)], [X(h), Y(h)], [waist.x, waist.y], [waist.x - K, waist.y + 2 * K]], (x, y) => dk(paint(x, y)));
    return;
  }
  for (const [s, el, h] of [[r.shF, r.elF, r.haF], [r.shB, r.elB, r.haB]] as const) {
    const wx = waist.x + Math.sign(s.x - r.hip.x) * B.m.waistW * 0.4;
    shape([[X(s), Y(s)], [X(el), Y(el)], [X(h), Y(h)], [wx, waist.y + K], [wx, waist.y - 2 * K]], paint);
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
  const k = K;
  switch (it.id) {
    case 'mic':
      rect(hx - 0.5 * k, hy - 4 * k, k, 4 * k, (x, y) => t('#8a8aa0', y < hy - 4 * k + 1 ? 1 : x >= hx + 0.5 * k - 1 ? -1 : 0, 'metal'));
      disc(hx, hy - 5 * k, 2.5 * k, (x, y) => t(c, x < hx - 0.5 * k && y < hy - 5 * k ? 1 : (x + y) % 2 ? -1 : 0, 'metal'));
      break;
    case 'book':
      rect(hx - 2 * k, hy - 2 * k, 4 * k, 5 * k, (x, y) => t(c, y < hy - 2 * k + 1 ? 1 : x >= hx + 2 * k - 1 ? -1 : 0));
      rect(hx - 2 * k, hy - 2 * k, k, 5 * k, t(a, 0));
      rect(hx + 2 * k - 1, hy - 1.5 * k, 1, 4 * k, '#fbf6ec');
      rect(hx - 0.5 * k, hy - 0.5 * k, k, 1, t(a, 1));
      break;
    case 'purse':
      rect(hx - 2 * k, hy + k, 5 * k, 4 * k, (x, y) => t(c, y < hy + k + 1 ? 1 : x >= hx + 3 * k - 1 ? -1 : 0, 'leather'));
      rect(hx - 2 * k, hy + 2.5 * k, 5 * k, 1, t(c, -1, 'leather'));
      drect(hx, hy + 2 * k, k, k, '#ffd050');
      line(hx - k, hy + k, hx, hy - k, t(a, 0, 'leather'));
      line(hx + 2 * k, hy + k, hx + k, hy - k, t(a, 0, 'leather'));
      break;
    case 'cane':
      for (let i = 0; i < k; i++) line(hx + i, hy, hx + k + i, B.AY - 1, t(c, i ? -1 : 0, 'leather'));
      rect(hx - k, hy - k, 2 * k, k, (x) => t(c, x < hx ? 1 : 0, 'leather'));
      rect(hx - 0.5 * k, B.AY - 1 - k, 2 * k, k, '#b8b8c4');
      break;
    case 'coffee-pot':
      rect(hx - k, hy - k, 4 * k, 4 * k, (x, y) => t(c, x < hx - k + 1 ? 1 : x >= hx + 3 * k - 1 ? -1 : y >= hy + 3 * k - 1 ? -1 : 0, 'metal'));
      rect(hx - k, hy - 2 * k, 4 * k, k, t(a, 0, 'metal'));
      rect(hx - 0.5 * k, hy, 2 * k, 2 * k, '#5a3a2e');
      rect(hx + 3 * k, hy - 0.5 * k, 1, 2 * k, t(c, -1, 'metal'));
      break;
    case 'clipboard':
      rect(hx - 2 * k, hy - 3 * k, 4 * k, 5 * k, (x, y) => t(c, y < hy - 3 * k + 1 ? 1 : x >= hx + 2 * k - 1 ? -1 : 0));
      rect(hx - 1.5 * k, hy - 2 * k, 3 * k, 3.5 * k, '#fbf6ec');
      for (let i = 0; i < 3; i++) rect(hx - k, hy - 1.5 * k + i * k, 2 * k - 1, 1, '#b8b8c4');
      rect(hx - 0.5 * k, hy - 3 * k, k, 1, '#8a8aa0');
      break;
    case 'mirror':
      disc(hx + 0.5 * k, hy - 2 * k, 3.4 * k, (x, y) => (Math.hypot(x - hx - 0.5 * k + 0.5, y - hy + 2 * k + 0.5) > 1.2 * k ? t(c, x < hx ? 1 : 0, 'metal') : x < hx && y < hy - 2 * k ? '#ffffff' : '#cfe6f0'));
      rect(hx, hy - 0.5 * k, k, 2 * k, t(c, 0, 'metal'));
      break;
    case 'pretzel':
      disc(hx + 0.5 * k, hy - k, 3.5 * k, (x, y) => t(c, y < hy - 2 * k ? 1 : x >= hx + 2 * k ? -1 : 0));
      drect(hx - 0.5 * k, hy - k, k, k, '#f6e0bc');
      drect(hx + k, hy - 2 * k, k, k, '#fff6ea');
      dpx(hx + 2 * k, hy, '#fff6ea');
      break;
    case 'phone':
      rect(hx - k, hy - 2 * k, 2 * k, 3 * k, (x, y) => t(c, x < hx - k + 1 && y < hy - 2 * k + 1 ? 1 : -1));
      rect(hx - k + 1, hy - 2 * k + 1, 2 * k - 2, 3 * k - 2, (x, y) => (x < hx && y < hy - k ? '#a8d8f0' : '#78b8e0'));
      break;
    case 'scissors':
      rect(hx - 0.5 * k, hy - 5 * k, k, 5 * k, t(c, 0, 'metal'));
      rect(hx + 0.5 * k, hy - 5 * k, k, 4 * k, t(c, 2, 'metal'));
      disc(hx - 0.5 * k, hy + 0.5 * k, 1.6 * k, t(c, -1, 'metal'));
      disc(hx + 1.5 * k, hy + 0.5 * k, 1.6 * k, t(c, -1, 'metal'));
      break;
    case 'ukulele':
      oval(hx + k, hy + k, 2 * k, 2.4 * k, (x, y) => t(c, y < hy ? 1 : x > hx + k ? -1 : 0));
      disc(hx + k, hy + k, 1.2 * k, INK);
      for (let i = 0; i < k; i++) line(hx + i, hy, hx - 2 * k + i, hy - 4 * k, t(a, i ? -1 : 0));
      rect(hx - 2.5 * k, hy - 5 * k, 1.5 * k, 1.5 * k, t(a, 0));
      break;
  }
}

/** Bear belly patch and fur speckle helper for Wanda. */
export function furSpeckle(x: number, y: number, base: Color): Color {
  return (x * 5 + y * 3) % 7 === 0 ? tint(base, -1, 'fur') : base;
}

export { setG, bottomColorAt, liA, mixc, disc };
