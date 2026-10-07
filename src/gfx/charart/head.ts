import { dth, liA, mixc, P, shA, type Color } from '../kit';
import { EXTRA_SLOT } from '../look';
import { K, type Expr, type View } from './body';
import { B, dk, pattern, X, Y } from './garments';
import { BLUSH, EYE_SHINE, EYE_WHITE, INK, LIP, LIP_DARK, ramp, tint, TONGUE, TOOTH, toneAt, type Ramp } from './palette';
import { D2R, dline, dpx, drect, formV, layer, LX, LY, oval, px, pt, rect, shape, toneIdx } from './raster';

/**
 * Head painters at art resolution (K art pixels per native pixel): skull,
 * ears, face, facial hair, face paint, hair (every style has its own
 * silhouette), masks, hats and glasses.
 */

/** Eye box: EW wide, EH tall (4 x 3 at K = 2). */
const EW = 2 * K;
const EH = K + 1;
/** Side-view eye width. */
const EWS = K + 1;

/** Head box in buffer pixels. */
export interface HB {
  x0: number;
  y0: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  view: View;
  /** Top row of the eyes. */
  eyeY: number;
  /** Left columns of the left and right eyes. */
  eL: number;
  eR: number;
  mY: number;
  /** Side view: left column of the single visible eye. */
  eS: number;
  /** Side view: last face column. */
  fE: number;
}

export function headBox(): HB {
  const r = B.r;
  const m = B.m;
  const w = m.headW;
  const h = m.headH;
  const x0 = Math.round(X(r.head) - w / 2);
  const y0 = Math.round(Y(r.head) - h / 2);
  const tilt = B.view === 'side' ? Math.round(Math.sin((r.def.head + r.m.stoop * 6) * D2R) * 1.2 * K) : 0;
  const eyeY = y0 + Math.round(h * 0.38) + tilt;
  const inset = w <= 7.5 * K ? K : Math.round(1.5 * K);
  const eL = x0 + inset;
  const eR = x0 + w - inset - EW;
  const cx = x0 + w / 2;
  const faceEdge = x0 + w - 1;
  return { x0, y0, w, h, cx, cy: y0 + h / 2, view: B.view, eyeY, eL, eR, mY: eyeY + (h >= 8 * K ? 3 * K : Math.round(2.5 * K)), eS: faceEdge - 2 * K, fE: faceEdge };
}

/** Is (x, y) inside the head silhouette? */
export function inHead(hb: HB, x: number, y: number, grow = 0): boolean {
  const shapeId = B.look.head;
  const rx = hb.w / 2 + grow;
  const ry = hb.h / 2 + grow;
  const dx = (x + 0.5 - hb.cx) / rx;
  const dy = (y + 0.5 - hb.cy) / ry;
  if (B.view === 'side') {
    // Profile: a rounder skull at the back, a flatter face and a jaw.
    const k = dx > 0 ? 1.12 : 1;
    if (dy > 0.3 && dx > 0.2) return (dx * 1.25) ** 2 + dy * dy <= 1;
    return (dx * k) ** 2 + dy * dy <= 1;
  }
  if (shapeId === 'square' || shapeId === 'wide') {
    const r = shapeId === 'wide' ? 0.62 : 0.5;
    const ax = Math.max(0, Math.abs(dx) - (1 - r)) / r;
    const ay = Math.max(0, Math.abs(dy) - (1 - r)) / r;
    return ax * ax + ay * ay <= 1;
  }
  if (shapeId === 'heart' && dy > 0.3) return dx * dx * (1 + (dy - 0.3) * 1.7) + dy * dy <= 1;
  if (shapeId === 'long') return dx * dx * (dy > 0.2 ? 1.1 : 1) + dy * dy <= 1;
  // Round: a touch of jaw so the chin is not a perfect ball.
  if (dy > 0.5) return dx * dx * (1 + (dy - 0.5) * 0.4) + dy * dy <= 1;
  return dx * dx + dy * dy <= 1;
}

export function headPaint(hb: HB, c: (x: number, y: number) => Color | null, grow = 0): void {
  for (let y = Math.floor(hb.y0 - grow - 1); y <= Math.ceil(hb.y0 + hb.h + grow); y++)
    for (let x = Math.floor(hb.x0 - grow - 1); x <= Math.ceil(hb.x0 + hb.w + grow); x++) if (inHead(hb, x, y, grow)) P(x, y, pt(c));
}

/** Skull: a lit sphere with the face plane kept readable, a cheek plane and a jaw shadow. */
export function drawHead(hb: HB): void {
  const rp = B.skinR;
  layer({ sh: 0.3, hl: 0 });
  const rx = hb.w / 2;
  const ry = hb.h / 2;
  const side = hb.view === 'side';
  headPaint(hb, (x, y) => {
    const dx = (x + 0.5 - hb.cx) / rx;
    const dy = (y + 0.5 - hb.cy) / ry;
    const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
    let v = dx * LX * 0.9 + dy * LY * 0.9 + nz * 0.55 - 0.22;
    // Keep the face plane readable: only the cheek edge and jaw fall into shadow.
    const faceRow = y >= hb.eyeY - K && y <= hb.mY + K;
    if (faceRow && Math.abs(dx) < 0.72 && v < -0.1) v = -0.1;
    let idx = toneIdx(v, hb.w >= 8 * K);
    // Cheekbone catching the light, and a soft plane under the far cheek.
    if (!side && dx < -0.3 && dx > -0.62 && dy > 0.05 && dy < 0.32 && idx === 0 && dth(x, y, 9)) idx = 1;
    if (!side && dx > 0.3 && dx < 0.7 && dy > 0.15 && dy < 0.5 && idx === 0 && dth(x, y, 6)) idx = -1;
    if (y >= hb.y0 + hb.h - K && idx > -1) idx = -1; // under the chin
    if (side && x >= hb.fE && y > hb.eyeY + K) idx = Math.min(idx, 0);
    return toneAt(rp, idx);
  });
  if (B.bear) return;
  // Ears: a lit rim, a darker bowl, a lobe.
  const cauli = B.look.features?.includes('cauliflower');
  if (hb.view === 'front' || hb.view === 'back') {
    const ey = hb.eyeY;
    for (const s of [-1, 1]) {
      const ex = s < 0 ? hb.x0 - K : hb.x0 + hb.w;
      rect(ex, ey, K, 2 * K, (x, y) => {
        const outer = s < 0 ? x === ex : x === ex + K - 1;
        if (y >= ey + 2 * K - 1) return rp.d1;
        if (outer) return s < 0 ? rp.l1 : rp.d1;
        return y === ey ? rp.m : s < 0 ? rp.d1 : rp.d2;
      });
      if (cauli && s < 0) rect(ex - 1, ey - 1, K, K, rp.m);
    }
  } else {
    const ex0 = Math.round(hb.cx - 1.5 * K);
    const ew = Math.round(1.5 * K);
    rect(ex0, hb.eyeY - Math.round(0.5 * K), ew, Math.round(2.5 * K), (x, y) => (x === ex0 ? rp.l1 : y > hb.eyeY + 1.5 * K ? rp.d1 : x >= ex0 + ew - 1 ? rp.m : rp.d1));
    rect(ex0 + 1, hb.eyeY, ew - 2 || 1, K, rp.d2);
    if (cauli) rect(ex0 - 1, hb.eyeY, 1, K, rp.m);
  }
}

// ---------------------------------------------------------------------------
//  Face
// ---------------------------------------------------------------------------

function irisOf(c: string): number {
  return mixc(INK, c, 0.55);
}

/** Face details (unlit decals). */
export function drawFace(hb: HB, expr: Expr, blink: boolean): void {
  const L = B.look;
  if (hb.view === 'back' || B.bear) return;
  const masked = L.mask && L.mask !== 'none' && L.mask !== 'domino';
  const shades = B.ex.has('sunglasses');
  const iris = irisOf(L.eyeColor);
  const sk = B.skinR;
  const style = L.eyes;
  const facial = L.facial;
  const coversMouth = facial === 'walrus';
  const stache = ['mustache', 'pencil', 'handlebar', 'goatee', 'mutton', 'walrus'].includes(facial);
  const mouthY = hb.mY + (stache ? K : 0);
  const browC = L.hair === 'bald' || L.hair === 'buzz' ? sk.d2 : toneAt(ramp(L.hairColor, 'hair'), -1);
  const fcx = Math.floor(hb.cx);
  if (hb.view === 'side') {
    const ex0 = hb.eS;
    if (!shades && !(L.mask === 'hood' || L.mask === 'moth')) {
      eyeSide(ex0, hb.eyeY, expr, blink, iris, sk, style);
      if (!masked) browSide(ex0, hb.eyeY, expr, browC, style);
    }
    // Nose: a bump with a lit ridge, and a nostril shadow.
    if (!masked || L.mask === 'half') {
      dpx(hb.fE + 1, hb.eyeY + 2, sk.m);
      dpx(hb.fE + 1, hb.eyeY + 3, sk.l1);
      if (K > 1) dpx(hb.fE + 2, hb.eyeY + 3, sk.m);
      dpx(hb.fE, hb.eyeY + 2 + K, sk.d1);
      dpx(hb.fE + 1, hb.eyeY + 2 + K, sk.d2);
    }
    if (!masked || L.mask === 'luchador' || L.mask === 'half') {
      if (!coversMouth) mouthSide(hb.fE - K - 1, mouthY, expr);
    }
    if (!masked && !/beard|square|wild|mutton/.test(facial) && !L.features?.includes('noblush')) {
      const bl = mixc(sk.m, BLUSH, 0.5);
      dpx(ex0 - 1, hb.eyeY + EH + 1, bl);
      dpx(ex0 - 2, hb.eyeY + EH + 2, bl);
    }
    return;
  }
  // Front.
  if (!shades && L.mask !== 'hood' && L.mask !== 'moth') {
    eyeFront(hb.eL, hb.eyeY, -1, expr, blink, iris, sk, style);
    eyeFront(hb.eR, hb.eyeY, 1, expr, blink, L.eyeColor2 ? irisOf(L.eyeColor2) : iris, sk, style);
    if (!masked) {
      browFront(hb.eL, hb.eyeY, -1, expr, browC, style);
      browFront(hb.eR, hb.eyeY, 1, expr, browC, style);
    }
  }
  const beardy = /beard|square|wild/.test(facial);
  if (!masked || L.mask === 'half') {
    // Nose: bridge light between the eyes, a lit tip and a shadow under it.
    const ny = hb.eyeY + EH + (hb.h >= 8 * K ? 1 : 0);
    dpx(fcx - 1, hb.eyeY + 1, sk.l1);
    dpx(fcx - 1, ny - 1, sk.l1);
    dpx(fcx - 1, ny, sk.d1);
    dpx(fcx, ny, sk.d2);
    if (hb.w >= 8 * K) dpx(fcx + 1, ny, sk.d1);
    const blushOn = !beardy && !L.features?.includes('noblush');
    if (blushOn && !(L.paint && L.paint !== 'none' && L.paint !== 'sparkle' && L.paint !== 'heart')) {
      const strong = L.features?.includes('blush');
      const bl = mixc(sk.m, BLUSH, strong ? 0.8 : 0.5);
      const bl2 = mixc(sk.m, BLUSH, strong ? 0.5 : 0.28);
      for (const [bx0, byy] of [[hb.eL - 1, hb.eyeY + EH + 1], [hb.eR + EW - 1, hb.eyeY + EH + 1]] as const) {
        dpx(bx0, byy, bl);
        dpx(bx0 + 1, byy, bl2);
        dpx(bx0, byy + 1, bl2);
        dpx(bx0 + 1, byy + 1, bl);
      }
    }
    if (L.features?.includes('freckles')) {
      const fc = shA(mixc(sk.m, '#c87a4a', 0.5), 0.1);
      for (const [dx, dy] of [[0, 0], [2, 1], [-1, 1], [1, 2]]) {
        dpx(hb.eL + 1 + dx, hb.eyeY + EH + 1 + dy, fc);
        dpx(hb.eR + EW - 2 - dx, hb.eyeY + EH + 1 + dy, fc);
      }
    }
    if (L.features?.includes('beauty-mark')) dpx(hb.eR + EW, mouthY - 1, INK);
    if (L.features?.includes('bandage')) {
      drect(hb.eL - 1, hb.eyeY + EH + 1, EW, K, '#f6e0bc');
      drect(hb.eL, hb.eyeY + EH + 1 + (K >> 1), EW - 2, 1, '#eacfa6');
    }
    if (L.features?.includes('flour')) {
      dpx(hb.eR + EW, hb.eyeY - 1, '#fbf6ec');
      dpx(hb.eR + EW + 1, hb.eyeY, '#fbf6ec');
      dpx(hb.eR + EW, hb.eyeY + 1, '#fbf6ec');
    }
    if (L.features?.includes('scar-brow')) {
      dpx(hb.eR + EW - 1, hb.eyeY - 3, sk.l2);
      dpx(hb.eR + EW, hb.eyeY - 4, sk.l2);
    }
    if (L.features?.includes('scar-chin')) {
      dpx(hb.eL + 1, mouthY + 2, sk.l2);
      dpx(hb.eL + 2, mouthY + 3, sk.l2);
    }
  }
  if (!coversMouth && (!masked || L.mask === 'luchador' || L.mask === 'half')) mouthFront(hb, mouthY, expr);
  if (L.features?.includes('earring') && !masked) {
    for (const ex of [hb.x0 - K, hb.x0 + hb.w + K - 1]) {
      dpx(ex, hb.eyeY + 2 * K, '#ffd84a');
      dpx(ex, hb.eyeY + 2 * K - 1, '#fff0a0');
    }
  }
}

/**
 * The eye: a 4 x 3 box with an ink upper lid, whites, a two-tone iris with a
 * catchlight at its top-left. ex0 is the left column; out is +1 for the right eye.
 */
function eyeFront(ex0: number, ey: number, out: number, expr: Expr, blink: boolean, iris: number, sk: Ramp, style: string): void {
  const inner = out > 0 ? ex0 : ex0 + EW - 1;
  const outer = out > 0 ? ex0 + EW - 1 : ex0;
  const lid = sk.d2;
  const irisD = shA(iris, 0.35);
  const ix = ex0 + Math.floor((EW - 2) / 2); // iris left column
  const lidRow = (y: number) => drect(ex0, y, EW, 1, INK);
  const whitesRow = (y: number) => drect(ex0, y, EW, 1, EYE_WHITE);
  const irisRows = (y: number) => {
    whitesRow(y);
    whitesRow(y + 1);
    dpx(ix, y, EYE_SHINE);
    dpx(ix + 1, y, iris);
    dpx(ix, y + 1, iris);
    dpx(ix + 1, y + 1, irisD);
  };
  const open = () => {
    lidRow(ey);
    irisRows(ey + 1);
  };
  const lashes = () => {
    dpx(outer + out, ey, INK);
    dpx(outer + out, ey - 1, INK);
  };
  if (blink || expr === 'closed') {
    drect(ex0, ey + EH - 1, EW, 1, INK);
    if (style === 'lashes') dpx(outer + out, ey + EH, INK);
    return;
  }
  switch (expr) {
    case 'happy':
    case 'grin':
      // Closed and curved up: a ^ of ink with a soft lid under it.
      dpx(ex0 + 1, ey, INK);
      dpx(ex0 + EW - 2, ey, INK);
      dpx(ex0, ey + 1, INK);
      dpx(ex0 + EW - 1, ey + 1, INK);
      drect(ex0 + 1, ey + 1, EW - 2, 1, lid);
      return;
    case 'pain':
      // Squeezed shut: a > shape pointing inward.
      dpx(outer, ey, INK);
      drect(ex0 + 1, ey + 1, EW - 2, 1, INK);
      dpx(outer, ey + 2, INK);
      return;
    case 'dizzy':
      whitesRow(ey);
      whitesRow(ey + 1);
      whitesRow(ey + 2);
      dpx(ex0, ey, INK);
      dpx(ex0 + EW - 1, ey, INK);
      dpx(ex0 + 1, ey + 1, INK);
      dpx(ex0 + EW - 2, ey + 1, INK);
      dpx(ex0, ey + 2, INK);
      dpx(ex0 + EW - 1, ey + 2, INK);
      return;
    case 'angry':
    case 'yell':
      // Heavy lid slanting down toward the nose.
      lidRow(ey);
      irisRows(ey + 1);
      dpx(inner, ey + 1, INK);
      dpx(inner - out, ey + 1, INK);
      return;
    case 'focus':
      lidRow(ey);
      irisRows(ey + 1);
      dpx(outer, ey + 1, lid);
      dpx(inner, ey + 1, lid);
      return;
    case 'smug':
      lidRow(ey);
      drect(ex0, ey + 1, EW, 1, lid);
      whitesRow(ey + 2);
      dpx(ix, ey + 2, iris);
      dpx(ix + 1, ey + 2, irisD);
      return;
  }
  switch (style) {
    case 'dot':
      drect(ix, ey, 2, 1, INK);
      dpx(ix, ey + 1, EYE_SHINE);
      dpx(ix + 1, ey + 1, iris);
      dpx(ix, ey + 2, iris);
      dpx(ix + 1, ey + 2, irisD);
      return;
    case 'happy':
      dpx(ex0 + 1, ey, INK);
      dpx(ex0 + EW - 2, ey, INK);
      dpx(ex0, ey + 1, INK);
      dpx(ex0 + EW - 1, ey + 1, INK);
      drect(ex0 + 1, ey + 1, EW - 2, 1, lid);
      return;
    case 'sleepy':
      lidRow(ey);
      drect(ex0, ey + 1, EW, 1, lid);
      whitesRow(ey + 2);
      dpx(ix, ey + 2, iris);
      dpx(ix + 1, ey + 2, irisD);
      dpx(outer, ey + 1, INK);
      return;
    case 'sharp':
      lidRow(ey);
      irisRows(ey + 1);
      dpx(inner, ey + 1, INK);
      return;
    case 'wide':
      lidRow(ey - 1);
      irisRows(ey);
      whitesRow(ey + 2);
      dpx(ix, ey + 2, irisD);
      return;
    case 'lashes':
      open();
      lashes();
      return;
    default:
      open();
  }
}

function browFront(ex0: number, ey: number, out: number, expr: Expr, c: number, style: string): void {
  const by = ey - 2;
  const w = EW + 1;
  // t runs 0 at the outer end to 1 at the nose.
  let f: (t: number) => number = (t) => (t > 0.15 && t < 0.6 ? -1 : 0);
  switch (expr) {
    case 'angry':
    case 'yell':
    case 'focus':
      f = (t) => Math.round(t * 2) - 1;
      break;
    case 'pain':
    case 'dizzy':
      f = (t) => (t > 0.6 ? -1 : t < 0.3 ? 1 : 0);
      break;
    case 'smug':
      f = out > 0 ? (t) => -1 - (t > 0.5 ? 1 : 0) : () => 0;
      break;
    case 'happy':
    case 'grin':
      f = (t) => -1 - (t > 0.2 && t < 0.7 ? 1 : 0);
      break;
    default:
      if (style === 'sharp') f = (t) => Math.round(t * 1.5) - 1;
      else if (style === 'wide') f = (t) => -1 - (t > 0.2 && t < 0.7 ? 1 : 0);
      else if (style === 'sleepy') f = () => 1;
  }
  for (let i = 0; i < w; i++) {
    const t = i / (w - 1);
    const x = out > 0 ? ex0 + EW - w + i : ex0 + w - 1 - i; // outer -> inner
    const xx = out > 0 ? ex0 + i - (w - EW) + (w - EW) : x;
    dpx(out > 0 ? ex0 + EW - 1 - (w - 1 - i) + 0 : xx, by + f(t), c);
  }
}

function eyeSide(ex0: number, ey: number, expr: Expr, blink: boolean, iris: number, sk: Ramp, style: string): void {
  const lid = sk.d2;
  const irisD = shA(iris, 0.35);
  const front = ex0 + EWS - 1;
  if (blink || expr === 'closed') {
    drect(ex0, ey + EH - 1, EWS, 1, INK);
    return;
  }
  if (expr === 'happy' || expr === 'grin' || style === 'happy') {
    dpx(ex0 + 1, ey, INK);
    dpx(ex0, ey + 1, INK);
    dpx(front, ey + 1, INK);
    return;
  }
  if (expr === 'pain') {
    dpx(front, ey, INK);
    dpx(ex0 + 1, ey + 1, INK);
    dpx(front, ey + 2, INK);
    return;
  }
  if (expr === 'dizzy') {
    drect(ex0, ey, EWS, EH, EYE_WHITE);
    dpx(ex0, ey, INK);
    dpx(front, ey, INK);
    dpx(ex0 + 1, ey + 1, INK);
    dpx(ex0, ey + 2, INK);
    dpx(front, ey + 2, INK);
    return;
  }
  const heavy = expr === 'angry' || expr === 'yell' || style === 'sharp';
  const half = style === 'sleepy' || expr === 'smug' || expr === 'focus';
  drect(ex0, ey, EWS, 1, INK);
  drect(ex0, ey + 1, EWS, EH - 1, EYE_WHITE);
  const iy = half ? ey + 2 : ey + 1;
  if (half) drect(ex0, ey + 1, EWS, 1, lid);
  dpx(ex0 + 1, iy, half ? iris : EYE_SHINE);
  dpx(front, iy, half ? irisD : iris);
  if (!half) {
    dpx(ex0 + 1, iy + 1, iris);
    dpx(front, iy + 1, irisD);
  }
  if (heavy) dpx(front, ey + 1, INK);
  if (style === 'lashes') {
    dpx(front + 1, ey, INK);
    dpx(front + 1, ey - 1, INK);
  }
}

function browSide(ex0: number, ey: number, expr: Expr, c: number, style: string): void {
  const angry = expr === 'angry' || expr === 'yell' || expr === 'focus' || style === 'sharp';
  const w = EWS + 1;
  const up = expr === 'happy' || expr === 'grin' || style === 'wide' ? 1 : style === 'sleepy' ? -1 : 0;
  for (let i = 0; i < w; i++) {
    const t = i / (w - 1); // back -> front
    let dy = -up;
    if (angry) dy += Math.round(t * 2) - 1;
    else if (expr === 'pain' || expr === 'dizzy') dy += t > 0.6 ? -1 : 0;
    else dy += t > 0.2 && t < 0.6 ? -1 : 0;
    dpx(ex0 - 1 + i, ey - 2 + dy, c);
  }
}

function mouthFront(hb: HB, my: number, expr: Expr): void {
  const fcx = Math.floor(hb.cx);
  const gap = B.look.features?.includes('gap-tooth');
  const braces = B.look.features?.includes('braces');
  const sk = B.skinR;
  const lipD = LIP_DARK;
  const lower = mixc(sk.m, LIP, 0.38);
  const x0 = fcx - K; // 4-wide mouth at K = 2
  const w = 2 * K;
  const toothRow = (x: number, y: number, n: number) => {
    for (let i = 0; i < n; i++) dpx(x + i, y, braces ? (i & 1 ? '#b8b8c4' : '#dcdae6') : gap && i === Math.floor(n / 2) ? lipD : i & 1 ? '#efe6dc' : TOOTH);
  };
  switch (expr) {
    case 'happy':
    case 'grin': {
      // Open smile: corners up, upper teeth, dark interior, tongue.
      dpx(x0 - 1, my - 1, LIP);
      dpx(x0 + w, my - 1, LIP);
      dpx(x0 - 1, my, lipD);
      dpx(x0 + w, my, lipD);
      toothRow(x0, my, w);
      drect(x0, my + 1, w, 1, lipD);
      if (expr === 'grin' || K > 1) {
        drect(x0 + 1, my + 2, w - 2, 1, TONGUE);
        dpx(x0, my + 2, lipD);
        dpx(x0 + w - 1, my + 2, lipD);
      }
      dpx(x0 - 2, my, sk.d1);
      dpx(x0 + w + 1, my, sk.d1);
      return;
    }
    case 'yell':
      drect(x0, my, w, EH + 1, lipD);
      toothRow(x0 + 1, my, w - 2);
      drect(x0 + 1, my + 2, w - 2, 1, TONGUE);
      dpx(x0 - 1, my + 1, LIP);
      dpx(x0 + w, my + 1, LIP);
      return;
    case 'pain':
      drect(x0 - 1, my, w + 2, 1, lipD);
      toothRow(x0 - 1, my + 1, w + 2);
      drect(x0 - 1, my + 2, w + 2, 1, lipD);
      dpx(x0 - 2, my + 1, LIP);
      dpx(x0 + w + 1, my + 1, LIP);
      return;
    case 'dizzy':
      for (let i = 0; i < w + 1; i++) dpx(x0 - 1 + i, my + (i & 1), LIP);
      return;
    case 'angry':
      drect(x0, my, w, 1, lipD);
      toothRow(x0, my + 1, w);
      drect(x0, my + 2, w, 1, lipD);
      dpx(x0 - 1, my + 2, lipD);
      dpx(x0 + w, my + 2, lipD);
      return;
    case 'smug':
      drect(x0 - 1, my, w, 1, LIP);
      dpx(x0 + w - 1, my - 1, LIP);
      dpx(x0 + w, my - 2, lipD);
      drect(x0, my + 1, w - 2, 1, lower);
      return;
    case 'focus':
      drect(x0, my, w, 1, sk.d2);
      return;
  }
  // Neutral: a dark centre line, lip colour at the ends, a soft lower lip.
  dpx(x0, my, LIP);
  drect(x0 + 1, my, w - 2, 1, lipD);
  dpx(x0 + w - 1, my, LIP);
  drect(x0 + 1, my + 1, w - 2, 1, lower);
  dpx(x0 - 1, my, sk.d1);
  dpx(x0 + w, my, sk.d1);
}

function mouthSide(mx: number, my: number, expr: Expr): void {
  const sk = B.skinR;
  const lower = mixc(sk.m, LIP, 0.38);
  if (expr === 'yell') {
    drect(mx, my, K + 1, K + 1, LIP_DARK);
    dpx(mx + 1, my, TOOTH);
    drect(mx + 1, my + K, K, 1, TONGUE);
    return;
  }
  if (expr === 'happy' || expr === 'grin' || expr === 'pain') {
    drect(mx, my, K + 1, 1, LIP_DARK);
    dpx(mx + K, my, expr === 'pain' ? TOOTH : LIP);
    dpx(mx + 1, my, TOOTH);
    dpx(mx, my - 1, LIP);
    drect(mx + 1, my + 1, K, 1, LIP_DARK);
    return;
  }
  if (expr === 'angry' || expr === 'focus') {
    drect(mx + 1, my, K, 1, sk.d2);
    dpx(mx, my + 1, sk.d1);
    return;
  }
  drect(mx + 1, my, K, 1, LIP);
  dpx(mx + K, my, LIP_DARK);
  drect(mx + 1, my + 1, K, 1, lower);
  dpx(mx, my, sk.d1);
}

// ---------------------------------------------------------------------------
//  Facial hair
// ---------------------------------------------------------------------------

export function drawFacial(hb: HB): void {
  const L = B.look;
  const f = L.facial;
  if (!f || f === 'none' || B.bear) return;
  if (L.mask === 'luchador' || L.mask === 'hood' || L.mask === 'moth') return;
  const hr = ramp(L.hairColor, 'hair');
  const my = hb.mY;
  const cx = hb.cx;
  const chin = hb.y0 + hb.h - 1;
  if (hb.view === 'back') {
    if (/beard|square|wild/.test(f)) {
      layer({ sh: 0.3, cast: false });
      const ext = f === 'wild' ? 4 * K : 2 * K;
      rect(hb.x0 + K, chin - K, hb.w - 2 * K, ext, (x, y) => (y >= chin - K + ext - 1 ? hr.d1 : x > cx ? hr.d1 : (x * 3 + y) % 5 === 0 ? hr.l1 : hr.m));
    }
    return;
  }
  if (f === 'stubble') {
    for (let y = my - K; y <= chin; y++)
      for (let x = hb.x0; x < hb.x0 + hb.w; x++)
        if (inHead(hb, x, y) && (hb.view === 'side' ? x > hb.cx - K : true) && (y > my + 1 || Math.abs(x + 0.5 - cx) > 2.2 * K) && dth(x, y, 7)) dpx(x, y, mixc(B.skin, L.hairColor, 0.4));
    return;
  }
  layer({ sh: 0.3, hl: 0.1, cast: false, aa: false });
  // Hair paint with a lit top, a dark underside and strand breaks.
  const hp = (x: number, y: number, top: number, bot: number): Color => {
    if (y <= top + K - 1) return hr.l1;
    if (y >= bot - K + 1) return hr.d1;
    if ((x * 7 + y * 3) % 5 === 0) return hr.d1;
    if ((x * 3 + y * 11) % 7 === 0) return hr.l1;
    return x > cx + K ? hr.d1 : hr.m;
  };
  const stache = (w: number, droop: number, tips: number, thick = K) => {
    if (hb.view === 'side') {
      const sx = hb.x0 + hb.w - 3 * K;
      rect(sx, my - 1, 3 * K, thick, (x, y) => (y === my - 1 ? hr.l1 : x >= sx + 3 * K - 1 ? hr.d1 : hr.m));
      if (droop) rect(sx, my - 1 + thick, K, droop * K, hr.d1);
      if (tips) rect(sx - 1, my - 2, K, 1, hr.l1);
      return;
    }
    const x0 = Math.round(cx - (w * K) / 2);
    const ww = w * K;
    rect(x0, my - 1, ww, thick, (x, y) => (y === my - 1 ? hr.l1 : x === x0 ? hr.l1 : x >= x0 + ww - 1 || x > cx + K ? hr.d1 : (x * 3 + y) % 5 === 0 ? hr.l1 : hr.m));
    if (droop) {
      rect(x0, my - 1 + thick, K, droop * K, hr.m);
      rect(x0 + ww - K, my - 1 + thick, K, droop * K, hr.d1);
    }
    if (tips) {
      rect(x0 - K, my - K, K, 1, hr.l1);
      rect(x0 - K, my - K - 1, 1, 1, hr.m);
      rect(x0 + ww, my - K, K, 1, hr.m);
      rect(x0 + ww + K - 1, my - K - 1, 1, 1, hr.d1);
    }
  };
  const beard = (extra: number, flat: boolean, wild: boolean) => {
    const top = hb.eyeY + 2 * K;
    const bot = chin + extra * K;
    for (let y = hb.eyeY + K; y <= bot; y++)
      for (let x = hb.x0 - K; x <= hb.x0 + hb.w + K; x++) {
        const below = y > chin - K;
        const jaw = hb.w / 2 - (flat ? K : K + (y - chin) * 0.9) - (wild && (((x + y) >> 1) & 1) ? K : 0);
        const inside = inHead(hb, x, y, 0.4 * K) || (below && Math.abs(x + 0.5 - cx) < jaw);
        if (!inside) continue;
        if (hb.view === 'side') {
          if (x < hb.cx - K) continue;
          if (y <= my + 1 && x > hb.x0 + hb.w - 3 * K) continue;
          px(x, y, hp(x, y, top, bot));
          continue;
        }
        const ax = Math.abs(x + 0.5 - cx);
        if (y <= my + 1 && ax < hb.w * 0.3) continue;
        if (y < hb.eyeY + 2 * K && ax < hb.w * 0.4) continue;
        px(x, y, wild && (x * 3 + y) % 5 === 0 ? hr.l1 : hp(x, y, top, bot));
      }
  };
  switch (f) {
    case 'mustache':
      stache(4, 0, 0);
      break;
    case 'pencil':
      stache(4, 0, 0, 1);
      break;
    case 'walrus':
      stache(6, 1, 0, K + 1);
      break;
    case 'handlebar':
      stache(4, 0, 1);
      break;
    case 'goatee':
      stache(4, 0, 0);
      if (hb.view === 'side') rect(hb.x0 + hb.w - 3 * K, chin - K, 2 * K, 3 * K, (_x, y) => (y >= chin + K ? hr.d1 : hr.m));
      else rect(cx - K, chin - K, 2 * K, 3 * K, (x, y) => (y >= chin + K || x >= cx + K - 1 ? hr.d1 : x === Math.round(cx - K) ? hr.l1 : hr.m));
      break;
    case 'soulpatch':
      if (hb.view === 'side') rect(hb.x0 + hb.w - 2 * K, my + K, K, K, hr.m);
      else rect(cx - 0.5 * K, my + K, K, K, (x) => (x < cx ? hr.m : hr.d1));
      break;
    case 'mutton':
      if (hb.view === 'side') rect(hb.cx, hb.eyeY, 2 * K, my - hb.eyeY + 2 * K, (x) => (x < hb.cx + K ? hr.m : hr.d1));
      else {
        rect(hb.x0, hb.eyeY, 2 * K, my - hb.eyeY + 2 * K, (x, y) => (x < hb.x0 + 1 ? hr.l1 : (x * 3 + y) % 5 === 0 ? hr.l1 : hr.m));
        rect(hb.x0 + hb.w - 2 * K, hb.eyeY, 2 * K, my - hb.eyeY + 2 * K, (x, y) => (x >= hb.x0 + hb.w - 1 ? hr.d2 : (x * 3 + y) % 5 === 0 ? hr.m : hr.d1));
      }
      stache(4, 0, 0);
      break;
    case 'square':
      beard(2, true, false);
      break;
    case 'wild':
      beard(4, false, true);
      break;
    default:
      beard(1, false, false);
  }
}

// ---------------------------------------------------------------------------
//  Face paint (painted into the head layer)
// ---------------------------------------------------------------------------

export function drawPaint(hb: HB): void {
  const L = B.look;
  const p = L.paint;
  if (!p || p === 'none' || hb.view === 'back' || B.bear) return;
  if (L.mask === 'luchador' || L.mask === 'hood' || L.mask === 'moth') return;
  const pc = L.paintColor ?? '#fbf0d9';
  const ey = hb.eyeY;
  const pp = (x: number, y: number, c: Color = pc) => {
    if (inHead(hb, x, y)) P(x, y, pt(x > hb.cx + K ? tint(c, -1) : c));
  };
  /** A native-pixel-sized block at a native offset from (bx, by). */
  const blk = (bx: number, by: number, dx: number, dy: number, c: Color = pc) => {
    for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) pp(bx + dx * K + i, by + dy * K + j, c);
  };
  const side = hb.view === 'side';
  const eyes = side ? [hb.eS] : [hb.eL, hb.eR];
  const ec = (e: number) => e + Math.floor(EW / 2) - K; // block origin centred on the eye
  switch (p) {
    case 'stripes':
      for (const e of eyes) for (let i = -1; i <= 1; i++) blk(ec(e), ey + EH, i, 1);
      break;
    case 'skull':
      for (let y = hb.y0; y < hb.y0 + hb.h; y++) for (let x = hb.x0; x < hb.x0 + hb.w; x++) if (inHead(hb, x, y) && (!side || x > hb.cx)) pp(x, y);
      for (const e of eyes) {
        for (let y = ey - 1; y <= ey + EH; y++) for (let x = e - 1; x <= e + EW; x++) pp(x, y, INK);
      }
      if (!side) for (let i = -2; i <= 1; i++) if (i !== -1 && i !== 0) for (let j = 0; j < K; j++) pp(Math.floor(hb.cx) + i * K + j, hb.mY + K, INK), pp(Math.floor(hb.cx) + i * K + j, hb.mY + K + 1, INK);
      break;
    case 'star': {
      const e = ec(side ? hb.eS : hb.eR);
      for (const [dx, dy] of [[0, -2], [-1, -1], [1, -1], [-2, 0], [2, 0], [-1, 2], [1, 2], [0, 3], [0, 0], [-1, 0], [1, 0], [0, 1], [0, -1]]) blk(e, ey, dx, dy);
      break;
    }
    case 'tribal':
      for (const e of eyes) {
        const o = side ? -1 : e === hb.eL ? -1 : 1;
        const bx = ec(e);
        blk(bx, ey, o, 2);
        blk(bx, ey, o * 2, 1);
        blk(bx, ey, o * 2, 0);
        blk(bx, ey, o * 2, -1);
        blk(bx, ey, o, -2);
      }
      break;
    case 'tears':
      for (const e of eyes) {
        const bx = ec(e);
        blk(bx, ey + EH, 0, 0);
        blk(bx, ey + EH, 0, 1);
        blk(bx, ey, 0, -2);
      }
      break;
    case 'split':
      for (let y = hb.y0; y < hb.y0 + hb.h; y++) for (let x = Math.ceil(hb.cx); x < hb.x0 + hb.w; x++) if (inHead(hb, x, y)) pp(x, y);
      break;
    case 'peak': {
      const top = hb.y0 + K;
      const base = ey + K;
      for (let y = top; y <= base; y++)
        for (let x = hb.x0; x < hb.x0 + hb.w; x++) {
          const ax = Math.abs(x + 0.5 - hb.cx);
          const lim = ((y - top) / (base - top)) * (hb.w / 2 + K) + K;
          if (ax > lim) continue;
          const snow = y < top + (base - top) * 0.42 + (Math.floor(x / K) % 2 ? 0.6 * K : 0);
          pp(x, y, snow ? '#f4f2fa' : pc);
        }
      break;
    }
    case 'sparkle':
      for (const e of eyes) {
        const bx = ec(e);
        pp(bx - K, ey + EH + 1, '#fff6c0');
        pp(bx - K + 1, ey + EH + 2, '#fff6c0');
        pp(bx + K + 1, ey + EH + 3, pc);
        pp(bx + 2 * K, ey + EH + 2, pc);
      }
      break;
    case 'heart': {
      const bx = ec(side ? hb.eS : hb.eR);
      const hy = ey + EH + 1;
      for (const [dx, dy] of [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1], [1, 2]]) if (K > 1) pp(bx + dx, hy + dy);
      if (K > 1) {
        pp(bx + 1, hy + 1);
        pp(bx + 3, hy + 1);
        pp(bx + 2, hy + 2);
      }
      break;
    }
  }
}

// ---------------------------------------------------------------------------
//  Hair
// ---------------------------------------------------------------------------

type Fringe = 'flat' | 'jag' | 'partL' | 'partR' | 'mid' | 'swoop' | 'none' | 'curly' | 'bangs' | 'wave' | 'shag';
interface HairSpec {
  cap: 'full' | 'buzz' | 'none' | 'side';
  fringe: Fringe;
  /** Hairline height as a fraction of the head (front). */
  capY: number;
  /** Side coverage: 0 above the ears, 1 to the ears, 2 to the jaw, 3 past the shoulders. */
  sides: number;
  /** Back length: 0 nape, 1 neck, 2 shoulders, 3 long. */
  back: number;
  /** Extra volume beyond the skull (native px). */
  vol?: number;
  top?: 'bun' | 'mohawk' | 'spikes' | 'pomp' | 'topknot' | 'twinbuns' | 'crown' | 'faux' | 'flat' | 'cowlick' | 'afro';
  tail?: 'pony' | 'highpony' | 'pigtails' | 'braids' | 'mullet' | 'longbraid';
  curly?: boolean;
  locs?: boolean;
  /** Bob-style ends curl in under the jaw. */
  bob?: boolean;
}
const HAIR: Record<string, HairSpec> = {
  short: { cap: 'full', fringe: 'jag', capY: 0.36, sides: 1, back: 1, vol: 0.6 },
  buzz: { cap: 'buzz', fringe: 'flat', capY: 0.3, sides: 0, back: 0 },
  bald: { cap: 'none', fringe: 'none', capY: 0, sides: 0, back: 0 },
  mullet: { cap: 'full', fringe: 'jag', capY: 0.34, sides: 1, back: 1, tail: 'mullet', vol: 0.6 },
  mohawk: { cap: 'side', fringe: 'none', capY: 0.3, sides: 0, back: 0, top: 'mohawk' },
  pompadour: { cap: 'full', fringe: 'none', capY: 0.3, sides: 1, back: 1, top: 'pomp' },
  long: { cap: 'full', fringe: 'mid', capY: 0.34, sides: 3, back: 3, vol: 0.8 },
  ponytail: { cap: 'full', fringe: 'none', capY: 0.32, sides: 0, back: 1, tail: 'pony', vol: 0.5 },
  highpony: { cap: 'full', fringe: 'none', capY: 0.3, sides: 0, back: 1, tail: 'highpony', vol: 0.5 },
  bun: { cap: 'full', fringe: 'none', capY: 0.32, sides: 0, back: 1, top: 'bun', vol: 0.5 },
  afro: { cap: 'full', fringe: 'curly', capY: 0.36, sides: 1, back: 1, top: 'afro', curly: true },
  braids: { cap: 'full', fringe: 'mid', capY: 0.34, sides: 0, back: 1, tail: 'braids', vol: 0.5 },
  curly: { cap: 'full', fringe: 'curly', capY: 0.4, sides: 2, back: 2, vol: 1.6, curly: true },
  spiky: { cap: 'full', fringe: 'jag', capY: 0.36, sides: 1, back: 1, top: 'spikes' },
  'side-part': { cap: 'full', fringe: 'partL', capY: 0.34, sides: 1, back: 1, vol: 0.5 },
  bob: { cap: 'full', fringe: 'bangs', capY: 0.4, sides: 2, back: 2, top: 'cowlick', vol: 1, bob: true },
  pigtails: { cap: 'full', fringe: 'bangs', capY: 0.38, sides: 1, back: 1, tail: 'pigtails', vol: 0.6 },
  topknot: { cap: 'full', fringe: 'none', capY: 0.3, sides: 0, back: 1, top: 'topknot', vol: 0.4 },
  spacebuns: { cap: 'full', fringe: 'mid', capY: 0.34, sides: 0, back: 1, top: 'twinbuns', vol: 0.4 },
  'crown-braid': { cap: 'full', fringe: 'none', capY: 0.3, sides: 0, back: 1, top: 'crown', vol: 0.4 },
  locs: { cap: 'full', fringe: 'mid', capY: 0.34, sides: 3, back: 3, vol: 1.2, locs: true },
  fauxhawk: { cap: 'side', fringe: 'none', capY: 0.3, sides: 0, back: 0, top: 'faux' },
  flattop: { cap: 'full', fringe: 'flat', capY: 0.3, sides: 0, back: 0, top: 'flat' },
  wave: { cap: 'full', fringe: 'wave', capY: 0.36, sides: 1, back: 1, vol: 1 },
  shaggy: { cap: 'full', fringe: 'shag', capY: 0.44, sides: 2, back: 2, vol: 1 },
  undercut: { cap: 'side', fringe: 'swoop', capY: 0.36, sides: 0, back: 0, vol: 0.8 },
  curtains: { cap: 'full', fringe: 'mid', capY: 0.4, sides: 2, back: 1, vol: 0.6 },
  ponybraid: { cap: 'full', fringe: 'none', capY: 0.32, sides: 0, back: 1, tail: 'longbraid', vol: 0.5 },
};

function hairSpec(): HairSpec {
  return HAIR[B.look.hair] ?? HAIR.short;
}

/**
 * Hair colour with volume shading: a highlight arc over the upper-left of the
 * skull, shadow where the hair tucks under at the right and bottom, clump and
 * strand lines, and an accent streak.
 */
export function hairPaint(hb: HB, hc: string): (x: number, y: number) => Color {
  const acc = B.look.hairAccent;
  const hr = ramp(hc, 'hair');
  const sx = hb.x0 + Math.round(hb.w * 0.62);
  const spec = hairSpec();
  const rx = hb.w / 2 + K;
  const ry = hb.h / 2 + K;
  return (x: number, y: number) => {
    if (acc && (spec.top === 'spikes' || spec.top === 'faux' ? y < hb.y0 : Math.abs(x - sx) < K && y < hb.y0 + hb.h * 0.45)) return tint(acc, y < hb.y0 + K ? 1 : 0, 'hair');
    const dx = (x + 0.5 - hb.cx) / rx;
    const dy = (y + 0.5 - hb.cy) / ry;
    const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
    const v = dx * LX + dy * LY + nz * 0.5 - 0.2;
    // Highlight band: an arc at a fixed distance from the lit pole, broken into clumps.
    const d = Math.hypot(dx - LX * 0.55, dy - LY * 0.55);
    let idx = toneIdx(v, true);
    const clump = Math.floor((x * 0.8 + y * 0.4 + 64) / (1.5 * K)) % 3;
    if (d < 0.36 && d > 0.14 && y < hb.y0 + hb.h * 0.45 && clump !== 1) idx = Math.max(idx, 1);
    if (d <= 0.14 && y < hb.y0 + hb.h * 0.4) idx = 2;
    // Strand lines: thin darker partings every few columns, following the fall of the hair.
    const col = Math.floor((x + y * 0.3 + 64) / 1);
    if (col % (3 * K) === 0 && y > hb.y0 + K) idx -= 1;
    if (spec.locs && hb.view !== 'side' && Math.floor((x - hb.x0) / K) % 2 === 0 && y > hb.y0 + 2 * K) idx = Math.min(idx, -1);
    if (spec.curly && (x * 7 + y * 3) % 5 === 0) idx += 1;
    else if (spec.curly && (x * 3 + y * 5) % 7 === 0) idx -= 1;
    if (y >= hb.y0 + hb.h * 0.9) idx = Math.min(idx, -1);
    return toneAt(hr, Math.max(-2, Math.min(2, idx)));
  };
}

function hairline(hb: HB, x: number, sp: HairSpec): number {
  const base = hb.y0 + hb.h * sp.capY;
  const t = (x + 0.5 - hb.x0) / hb.w;
  const xn = Math.floor(x / K);
  switch (sp.fringe) {
    case 'jag':
      return base + ((xn & 1) && t > 0.2 && t < 0.8 ? K : 0) + (t > 0.35 && t < 0.65 && (xn % 3 === 0) ? 1 : 0);
    case 'partL':
      return base + (t * 2.4 - 0.6) * K;
    case 'partR':
      return base + ((1 - t) * 2.4 - 0.6) * K;
    case 'mid':
      return base + (Math.abs(t - 0.5) * 4.5 - 1.2) * K;
    case 'swoop':
      return base + (t * t * 3.5 - 0.8) * K;
    case 'bangs':
      return base + K + (xn % 3 === 0 ? 1 : 0);
    case 'curly':
      return base + (Math.sin(x * 0.95) > 0 ? K : 0);
    case 'wave':
      return base + (xn % 3 === 0 ? K : 0);
    case 'shag':
      return base + ((xn * 7) % 3 === 0 ? K : 0) + (t > 0.3 && t < 0.7 ? 0.5 * K : 0);
    case 'none':
      return base - K;
    default:
      return base;
  }
}

/** Behind-the-head hair (front and side views). */
export function drawHairBack(hb: HB): void {
  const sp = hairSpec();
  const L = B.look;
  if (B.bear || sp.cap === 'none') return;
  const masked = L.mask === 'luchador' || L.mask === 'hood' || L.mask === 'half';
  const hc = L.hairColor;
  layer({ sh: 0.32, cast: false, aa: false });
  const paint = hairPaint(hb, hc);
  const cx = hb.cx;
  const sway = B.sway * K;
  if (hb.view === 'front') {
    if (!masked && sp.back >= 2) {
      const len = sp.back === 2 ? hb.h * 0.2 : sp.back * 3 * K + sway;
      const w = hb.w + (sp.curly ? 3 : 2) * K;
      rect(cx - w / 2, hb.cy, w, hb.h / 2 + len, paint);
    }
    if (!masked && sp.top === 'afro') oval(cx, hb.cy - 1.5 * K, hb.w / 2 + 3 * K, hb.h / 2 + 2.5 * K, paint);
    if (sp.tail === 'mullet' && !masked) rect(cx - hb.w / 2 - 0.5 * K, hb.eyeY, hb.w + K, hb.h - (hb.eyeY - hb.y0) + 3 * K + sway, paint);
    if (sp.tail === 'pigtails') {
      oval(hb.x0 - 2 * K, hb.eyeY + sway * 0.5, 2 * K, 3 * K, paint);
      oval(hb.x0 + hb.w + K, hb.eyeY + sway * 0.5, 2 * K, 3 * K, paint);
    }
    if (sp.tail === 'pony' || sp.tail === 'longbraid') oval(hb.x0 + hb.w, hb.eyeY + K + sway * 0.5, 1.5 * K, 2.5 * K, paint);
    return;
  }
  if (hb.view === 'side') {
    if (!masked && sp.back >= 2) rect(hb.x0 - K, hb.cy - K, hb.w * 0.55, hb.h / 2 + (sp.back - 1) * 3 * K + sway, paint);
    if (!masked && sp.top === 'afro') oval(cx - K, hb.cy - 1.5 * K, hb.w / 2 + 3 * K, hb.h / 2 + 2.5 * K, paint);
    if (sp.tail === 'mullet') rect(hb.x0, hb.cy, 4 * K, hb.h / 2 + 3 * K + sway, paint);
  }
}

/** Main hair layer, drawn over the head. */
export function drawHair(hb: HB): void {
  const sp = hairSpec();
  const L = B.look;
  if (B.bear) return;
  const hatTop = ['hat', 'cowboy-hat', 'cap', 'beanie', 'bucket-hat', 'hunting-cap', 'sheriff-hat', 'headwrap', 'head-bandana'].some((h) => B.ex.has(h));
  const fullMask = L.mask === 'luchador' || L.mask === 'hood' || L.mask === 'half' || L.mask === 'moth';
  const hc = L.hairColor;
  const hr = ramp(hc, 'hair');
  const paint = hairPaint(hb, hc);
  const cx = hb.cx;
  layer({ sh: 0.32, hl: 0, cast: true, aa: false });
  const v = hb.view;
  const sway = B.sway * K;
  drawTails(hb, sp, paint);
  if (fullMask || sp.cap === 'none') {
    if (sp.cap === 'none' && !fullMask && v !== 'back') {
      // A shine on a bald scalp.
      const sx = hb.x0 + Math.round(hb.w * 0.3);
      drect(sx, hb.y0 + K, K, 1, B.skinR.l2);
      dpx(sx + K, hb.y0 + K + 1, B.skinR.l2);
    }
    return;
  }
  const grow = (0.6 + (sp.vol ?? 0) * 0.6) * K;
  const y0 = Math.floor(hb.y0 - grow - 2 * K);
  for (let y = y0; y <= hb.y0 + hb.h + K; y++)
    for (let x = hb.x0 - 3 * K; x <= hb.x0 + hb.w + 2 * K; x++) {
      if (!inHead(hb, x, y, grow)) continue;
      let hl: number;
      if (v === 'front') {
        hl = hairline(hb, x, sp);
        const edge = x < hb.x0 + K || x >= hb.x0 + hb.w - K;
        if (edge && sp.sides >= 1) hl = Math.max(hl, sp.sides === 1 ? hb.eyeY - 0.5 * K : sp.sides === 2 ? hb.y0 + hb.h - 1.5 * K : hb.y0 + hb.h + 2 * K);
        if (sp.bob && (x < hb.x0 + K || x > hb.x0 + hb.w - 1 - K)) hl = hb.y0 + hb.h - 0.5 * K;
      } else if (v === 'back') {
        hl = hb.y0 + hb.h - (sp.back >= 1 ? 1.5 : 2.5) * K;
      } else {
        const t = (x + 0.5 - hb.x0) / hb.w;
        const front = hairline(hb, hb.x0 + hb.w - 2 * K, sp);
        const backL = hb.y0 + hb.h - (sp.back >= 1 ? 1.5 : 2.5) * K;
        hl = t > 0.5 ? front : t < 0.28 ? backL : backL + (front - backL) * ((t - 0.28) / 0.22);
        if (Math.abs(x + K - hb.cx) < 1.5 * K && sp.sides < 2) hl = Math.min(hl, hb.eyeY - 1.5 * K);
      }
      if (y >= hl) continue;
      if (sp.cap === 'buzz') {
        if (dth(x, y, 9) || y < hb.y0 + K) P(x, y, pt(mixc(hc, B.skin, 0.3)));
        continue;
      }
      if (sp.cap === 'side' && v !== 'side' && Math.abs(x + 0.5 - cx) > hb.w * 0.22) {
        if (dth(x, y, 6)) P(x, y, pt(mixc(hc, B.skin, 0.45)));
        continue;
      }
      if (sp.cap === 'side' && v === 'side' && y > hb.y0 + K) {
        if (dth(x, y, 6)) P(x, y, pt(mixc(hc, B.skin, 0.45)));
        continue;
      }
      if (sp.curly && inHead(hb, x, y, grow) && !inHead(hb, x, y, grow - K) && (x + y) % 3 === 0) continue;
      P(x, y, pt(paint));
    }
  // Flyaway strands.
  if (sp.cap === 'full' && !sp.curly && sp.top !== 'flat' && sp.top !== 'pomp') {
    const fx = v === 'side' ? hb.x0 + K : hb.x0 + hb.w - 2 * K;
    px(fx, y0 + K, hr.m);
    px(fx + 1, y0 + K - 1, hr.m);
    px(fx + 2, y0 + K - 2, hr.l1);
    px(fx - K, y0 + K + 1, hr.d1);
  }
  // Long side curtains in front of the shoulders.
  if (v === 'front' && sp.sides >= 3) {
    const len = hb.h * 0.5 + 3 * K + (sp.back - 3) * 2 * K + sway;
    rect(hb.x0 - K, hb.eyeY - 2 * K, 2 * K, len, (x, y) => (x >= hb.x0 ? hr.d1 : paint(x, y)));
    rect(hb.x0 + hb.w - K, hb.eyeY - 2 * K, 2 * K, len, (x, y) => (x >= hb.x0 + hb.w ? hr.d1 : paint(x, y)));
  }
  if (v === 'back' && sp.back >= 2) {
    const len = sp.back === 2 ? 2 * K : (sp.back - 1) * 3.5 * K + sway;
    rect(cx - hb.w / 2 - (sp.curly ? 1 : 0.5) * K, hb.cy, hb.w + (sp.curly ? 2 : 1) * K, hb.h / 2 + len, paint);
  }
  if (v === 'side' && sp.back >= 2) rect(hb.x0 - K, hb.cy, hb.w * 0.45, hb.h / 2 + (sp.back - 1.5) * 3 * K + sway, paint);
  if (hatTop) return;
  // Top features.
  const top = hb.y0;
  switch (sp.top) {
    case 'bun':
      oval(cx + (v === 'side' ? -2.5 * K : 0), top - 1.5 * K, 2.6 * K, 2.2 * K, paint);
      rect(cx + (v === 'side' ? -3.5 * K : -K), top - 2.5 * K, K, 1, hr.l1);
      break;
    case 'topknot':
      oval(cx + (v === 'side' ? -K : 0), top - 2 * K, 2 * K, 2.2 * K, paint);
      rect(cx - 0.5 * K + (v === 'side' ? -K : 0), top - 0.5 * K, K, 1, hr.d1);
      rect(cx - 0.5 * K + (v === 'side' ? -K : 0), top - 0.5 * K + 1, K, 1, hr.d2);
      break;
    case 'twinbuns':
      if (v === 'side') oval(cx - K, top - K, 2.3 * K, 2.2 * K, paint);
      else {
        oval(hb.x0 + 1.5 * K, top, 2.3 * K, 2.2 * K, paint);
        oval(hb.x0 + hb.w - 1.5 * K, top, 2.3 * K, 2.2 * K, paint);
        rect(hb.x0 + 0.5 * K, top - K, K, 1, hr.l1);
      }
      break;
    case 'mohawk':
    case 'faux': {
      const tall = (sp.top === 'mohawk' ? 5 : 2) * K;
      if (v === 'side') {
        for (let i = 0; i < hb.w - 2 * K; i++) {
          const x = hb.x0 + K + i;
          const hgt = tall - ((Math.floor(i / K) + 1) % 3 === 0 ? K : 0) - (i < 2 * K ? K : 0);
          rect(x, top - hgt + K, 1, hgt + K, (xx, yy) => (yy < top - hgt + 2 * K ? hr.l1 : paint(xx, yy)));
        }
      } else rect(cx - 1.5 * K, top - tall + K, 3 * K, tall + 2 * K, (x, y) => (x < cx - 1.5 * K + K ? hr.l1 : x >= cx + 0.5 * K ? hr.d1 : y < top - tall + 2 * K ? hr.l1 : paint(x, y)));
      break;
    }
    case 'spikes':
      for (let i = 0; i < 5; i++) {
        const x = hb.x0 + K + i * ((hb.w - 2 * K) / 4);
        const tipY = top - (2 + (i % 2)) * K;
        shape([[x - 1.5 * K, top + 2 * K], [x + 1.5 * K, top + 2 * K], [x + (v === 'side' ? -1.5 * K : 0), tipY]], (xx, yy) => (yy <= tipY + K ? hr.l1 : xx > x ? hr.d1 : paint(xx, yy)));
      }
      break;
    case 'pomp':
      if (v === 'side') {
        oval(hb.x0 + hb.w - 3.5 * K, top - 0.5 * K, 3.8 * K, 3 * K, paint);
        rect(hb.x0 + hb.w - 3 * K, top - 3 * K, 2 * K, 1, hr.l1);
      } else {
        oval(cx + 0.5 * K, top - 0.5 * K, hb.w / 2 - 0.5 * K, 3 * K, paint);
        rect(cx - hb.w / 2 + K, top - 2 * K, hb.w - 3 * K, 1, (x) => (x < cx ? hr.l1 : hr.m));
        rect(cx - hb.w / 2 + 2 * K, top - 2 * K + 1, hb.w - 5 * K, 1, (x) => (x < cx ? hr.l2 : hr.l1));
      }
      break;
    case 'flat':
      rect(hb.x0 + K, top - 2 * K, hb.w - 2 * K, 3 * K, (x, y) => (y < top - 2 * K + 1 ? hr.l1 : x >= hb.x0 + hb.w - 2 * K ? hr.d1 : (x % (2 * K) === 0 ? hr.d1 : paint(x, y))));
      break;
    case 'cowlick':
      rect(cx + K, top - 1.5 * K, K, 1, hr.m);
      rect(cx + 2 * K - 1, top - 2.5 * K, K, 1, hr.l1);
      px(cx + 2 * K + 1, top - 2.5 * K - 1, hr.l1);
      break;
    case 'crown':
      for (let x = hb.x0; x < hb.x0 + hb.w; x++) {
        const yb = top + K + (v === 'side' ? K : 0);
        const knot = Math.floor((x - hb.x0) / K) & 1;
        rect(x, yb - K + 1, 1, K, knot === 0 ? hr.l1 : hr.d1);
        rect(x, yb - 2 * K + 1, 1, K, knot === 0 ? hr.m : hr.l1);
      }
      break;
  }
}

function drawTails(hb: HB, sp: HairSpec, paint: (x: number, y: number) => Color): void {
  const v = hb.view;
  const t = sp.tail;
  if (!t) return;
  const hr = ramp(B.look.hairColor, 'hair');
  const sway = B.sway * K;
  const braidSeg = (x: number, y0: number, n: number) => {
    const bx = Math.round(x);
    for (let i = 0; i < n; i++) {
      const knot = Math.floor(i / K) & 1;
      for (let j = 0; j < 2 * K; j++) {
        const left = j < K;
        P(bx + j, Math.round(y0 + i), pt(knot === 0 ? (left ? hr.l1 : hr.d1) : left ? hr.d2 : hr.m));
      }
    }
    rect(bx, Math.round(y0 + n), 2 * K, 1, hr.d1);
  };
  if (v === 'back') {
    if (t === 'pony' || t === 'highpony') rect(hb.cx - K, hb.y0 + (t === 'highpony' ? K : 3 * K), 2 * K, hb.h + K + sway, (x, y) => (x >= Math.round(hb.cx) ? hr.d1 : paint(x, y)));
    if (t === 'longbraid') braidSeg(hb.cx - K, hb.y0 + 3 * K, hb.h + 5 * K + sway);
    if (t === 'braids') {
      braidSeg(hb.x0 + K, hb.cy, hb.h * 0.5 + 4 * K + sway);
      braidSeg(hb.x0 + hb.w - 3 * K, hb.cy, hb.h * 0.5 + 4 * K + sway);
    }
    if (t === 'pigtails') {
      oval(hb.x0 - K, hb.eyeY - K, 2 * K, 3 * K, paint);
      oval(hb.x0 + hb.w, hb.eyeY - K, 2 * K, 3 * K, paint);
    }
    if (t === 'mullet') rect(hb.x0, hb.eyeY, hb.w, hb.h - (hb.eyeY - hb.y0) + 3 * K + sway, (x, y) => ((x * 5 + 3) % (4 * K) === 0 && y > hb.cy ? hr.d1 : paint(x, y)));
    return;
  }
  if (v === 'side') {
    if (t === 'pony') {
      oval(hb.x0 - K, hb.cy - K, 1.6 * K, 1.6 * K, paint);
      rect(hb.x0 - 2.5 * K, hb.cy - K, 2 * K, hb.h * 0.6 + sway, (x, y) => (x < hb.x0 - 2.5 * K + 1 ? hr.d1 : paint(x, y)));
    }
    if (t === 'highpony') {
      oval(hb.x0, hb.y0 + K, 1.6 * K, 1.6 * K, paint);
      shape([[hb.x0 - K, hb.y0], [hb.x0 + K, hb.y0 + K], [hb.x0 - 3 * K, hb.y0 + hb.h * 0.75 + sway], [hb.x0 - 4.5 * K, hb.y0 + hb.h * 0.7 + sway]], paint);
    }
    if (t === 'longbraid') braidSeg(hb.x0 - 2 * K, hb.cy - K, hb.h + 3 * K + sway);
    if (t === 'braids') braidSeg(hb.x0 + K, hb.cy, hb.h * 0.5 + 4 * K + sway);
    if (t === 'pigtails') oval(hb.x0, hb.eyeY - K + sway * 0.5, 2 * K, 3 * K, paint);
    return;
  }
  if (t === 'braids') {
    braidSeg(hb.x0 - K, hb.eyeY - K, hb.h * 0.5 + 5 * K + sway);
    braidSeg(hb.x0 + hb.w - K, hb.eyeY - K, hb.h * 0.5 + 5 * K + sway);
  }
  if (t === 'highpony') oval(hb.cx, hb.y0 - 0.5 * K, 1.6 * K, 1.4 * K, paint);
}

// ---------------------------------------------------------------------------
//  Masks
// ---------------------------------------------------------------------------

function maskPattern(hb: HB, x: number, y: number, base: string, acc: string): Color {
  const pat = B.look.maskPattern ?? 'plain';
  const dx = x + 0.5 - hb.cx;
  const ty = y - hb.y0;
  const ey = hb.eyeY;
  const side = hb.view === 'side';
  const eyes = side ? [hb.eS + 1] : [hb.eL + K - 1, hb.eR + K];
  switch (pat) {
    case 'stripe':
      if (Math.abs(dx) < K && y < ey - K) return acc;
      break;
    case 'flames':
      for (const e of eyes) {
        const fx = (x - e) / K;
        if (y < ey - K && y > ey - (4 + (Math.abs(Math.floor(fx)) % 2) * 2) * K && Math.abs(fx) <= 2.5) return y < ey - 3 * K ? '#ffd84a' : acc;
      }
      break;
    case 'wings':
      for (const e of eyes) {
        const o = side ? -1 : e < hb.cx ? -1 : 1;
        const fx = ((x - e) * o) / K;
        const fy = (y - ey) / K;
        if (fx >= 0.5 && fx <= 3.5 && fy >= -3 && fy <= 1 && fy > -fx - 1.5) return (Math.floor(fx) + Math.floor(fy)) % 3 === 0 ? INK : acc;
      }
      break;
    case 'star':
      if ((Math.abs(dx) < 0.6 * K && Math.abs(ty - 3 * K) <= 1.2 * K) || (Math.abs(ty - 3 * K) < 0.6 * K && Math.abs(dx) <= 1.6 * K)) return acc;
      break;
    case 'teardrop':
      for (const e of eyes) if (Math.abs(x + 0.5 - e) < 0.6 * K && y >= ey + EH + 1 && y < ey + EH + 1 + 2 * K) return acc;
      break;
    case 'split':
      if (dx > 0) return acc;
      break;
    case 'swirl': {
      const a = Math.atan2(y + 0.5 - hb.cy, dx) + (Math.hypot(dx, y + 0.5 - hb.cy) * 0.9) / K;
      if (Math.sin(a * 2) > 0.7) return acc;
      break;
    }
    case 'heart': {
      const tn = ty / K;
      if ((tn >= 2 && tn < 3 && Math.abs(dx) > 0.4 * K && Math.abs(dx) < 1.6 * K) || (tn >= 3 && tn < 4 && Math.abs(dx) < 2 * K) || (tn >= 4 && tn < 5 && Math.abs(dx) < 0.9 * K)) return acc;
      break;
    }
    case 'lightning':
      if (y < ey - K && Math.abs(dx - ((Math.floor(ty / K) % 3) - 1) * K) < 0.6 * K) return acc;
      break;
  }
  return base;
}

export function drawMask(hb: HB): void {
  const L = B.look;
  const mk = L.mask;
  if (!mk || mk === 'none' || B.bear) return;
  const mc = L.maskColor ?? '#ffd84a';
  const ma = L.maskAccent ?? '#d8307a';
  const mr = ramp(mc, 'cloth');
  const side = hb.view === 'side';
  const back = hb.view === 'back';
  const eyes = side ? [hb.eS] : [hb.eL, hb.eR];
  const eyeW = side ? EWS : EW;
  const ey = hb.eyeY;
  const rx = hb.w / 2 + 0.5 * K;
  const ry = hb.h / 2 + 0.5 * K;
  const shadeIdx = (x: number, y: number) => {
    const dx = (x + 0.5 - hb.cx) / rx;
    const dy = (y + 0.5 - hb.cy) / ry;
    const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
    return toneIdx(dx * LX + dy * LY + nz * 0.55 - 0.22, true);
  };
  if (mk === 'domino') {
    layer({ sh: 0.3, cast: false, aa: false });
    if (back) {
      rect(hb.x0, ey - K, hb.w, K, mr.d1);
      return;
    }
    for (let x = side ? Math.round(hb.cx) : hb.x0; x < hb.x0 + hb.w; x++) for (let y = ey - K; y <= ey + EH - 1 + K; y++) if (inHead(hb, x, y, 0.3 * K)) P(x, y, pt(y < ey ? mr.l1 : y >= ey + EH ? mr.d1 : mr.m));
    for (const e of eyes) drect(e, ey, eyeW, EH, EYE_WHITE);
    return;
  }
  layer({ sh: 0.3, hl: 0, cast: true });
  const lowY = mk === 'half' ? ey + EH + 0.5 * K : 999;
  const grow = mk === 'moth' ? 0.9 * K : 0.5 * K;
  for (let y = Math.floor(hb.y0 - 2 * K); y <= hb.y0 + hb.h + K; y++)
    for (let x = hb.x0 - 2 * K; x <= hb.x0 + hb.w + K; x++) {
      if (!inHead(hb, x, y, grow) || y > lowY) continue;
      const idx = shadeIdx(x, y);
      if (mk === 'moth') {
        const edge = !inHead(hb, x, y, grow - K);
        P(x, y, pt(edge && dth(x, y, 8) ? '#b8a890' : toneAt(mr, idx - ((x * 3 + y * 5) % 11 === 0 ? 1 : 0))));
        continue;
      }
      if (mk === 'hood') {
        P(x, y, pt(toneAt(mr, Math.min(idx, 0) - (Math.floor((x + y * 0.5 + 64) / (3 * K)) % 3 === 0 && y > hb.cy ? 1 : 0))));
        continue;
      }
      // Luchador / half: pattern, a stitched seam down the centre, a hem row on a half mask.
      let c: Color;
      if (back) c = Math.abs(x + 0.5 - hb.cx) < 0.6 * K && y > hb.cy - 2 * K && Math.floor(y / K) % 2 === 0 ? ma : mc;
      else c = maskPattern(hb, x, y, mc, ma);
      let i2 = idx;
      if (!back && !side && x === Math.floor(hb.cx) - 1 && y < ey - 2 * K && (y & 1)) i2 -= 1; // stitching
      if (mk === 'half' && y > lowY - K) i2 -= 1;
      P(x, y, pt(c === mc ? toneAt(mr, i2) : tint(c, i2)));
    }
  if (mk === 'hood') {
    shape([[hb.cx - 2 * K, hb.y0], [hb.cx + 2 * K, hb.y0], [hb.cx + (side ? -K : 0), hb.y0 - 3 * K]], (x) => (x < hb.cx ? mr.m : mr.d1));
    rect(hb.cx - hb.w / 2 - K, hb.y0 + hb.h - 2 * K, hb.w + 2 * K, 3 * K, (x, y) => (y >= Math.round(hb.y0 + hb.h) ? mr.d2 : Math.floor((x + 64) / K) % 5 === 0 ? mr.d1 : mr.m));
  }
  if (back) return;
  if (mk === 'moth') {
    layer({ flat: true });
    for (const s of side ? [1] : [-1, 1]) {
      const bx = hb.cx + s * 2 * K + (side ? K : 0);
      dline(bx, hb.y0, bx + s * 2 * K, hb.y0 - 4 * K, mr.d1);
      dline(bx + 1, hb.y0, bx + s * 2 * K + 1, hb.y0 - 4 * K, mr.d2);
      drect(bx + s * 3 * K - (s < 0 ? K - 1 : 0), hb.y0 - 4 * K - 1, K, K, mr.d1);
      dpx(bx + s * K, hb.y0 - 3 * K, mr.d1);
    }
    for (const e of eyes) {
      drect(e - 1, ey - 1, eyeW + 2, EH + 2, '#8a2a34');
      drect(e, ey, eyeW, EH, '#e8343c');
      dpx(e, ey, '#ffb0a0');
      dpx(e + 1, ey, '#ff8080');
    }
    return;
  }
  if (mk === 'hood') {
    for (const e of eyes) {
      drect(e - 1, ey, eyeW + 2, K, INK);
      drect(e + 1, ey, K, 1, '#fff6ea');
    }
    return;
  }
  // Luchador / half: trimmed eye holes and (luchador) mouth hole.
  for (const e of eyes) {
    for (let yy = ey - K; yy <= ey + EH - 1 + K; yy++) for (let xx = e - K; xx <= e + eyeW - 1 + K; xx++) if (inHead(hb, xx, yy)) P(xx, yy, pt(yy < ey || xx < e ? tint(ma, 1) : yy >= ey + EH + K - 1 || xx >= e + eyeW + K - 1 ? tint(ma, -1) : tint(ma, 0)));
    drect(e, ey, eyeW, EH, EYE_WHITE);
  }
  if (mk === 'luchador') {
    const mx = side ? hb.x0 + hb.w - 3 * K : Math.floor(hb.cx) - K;
    const mw = side ? 3 * K : 2 * K;
    rect(mx - K, hb.mY - K, mw + 2 * K, 2 + 2 * K, (x, y) => (y < hb.mY ? tint(ma, 1) : y >= hb.mY + 2 ? tint(ma, -1) : x < mx ? tint(ma, 0) : x >= mx + mw ? tint(ma, -1) : B.skinR.m));
    if (B.look.maskPattern === 'fangs') {
      drect(mx, hb.mY, 1, 2, TOOTH);
      drect(mx + mw - 1, hb.mY, 1, 2, TOOTH);
    }
  }
}

// ---------------------------------------------------------------------------
//  Head extras: hats and face wear
// ---------------------------------------------------------------------------

export function drawHeadExtras(hb: HB): void {
  const side = hb.view === 'side';
  const back = hb.view === 'back';
  const cx = hb.cx;
  const top = hb.y0;
  const W = hb.w;
  const k = K;
  for (const e of B.look.extras ?? []) {
    if (EXTRA_SLOT[e.id] !== 'head') continue;
    const c = e.color;
    const a = e.accent ?? (shA(c, 0.3) as unknown as string);
    const cr = ramp(c, 'cloth');
    layer({ sh: 0.3, hl: 0, cast: true, aa: false });
    // Crown of a hat: lit on the left, shadow on the right, a lit top row.
    const crownPaint = (x0: number, w: number, y0: number) => (x: number, y: number): Color => {
      const t = ((x + 0.5 - x0) / w) * 2 - 1;
      let idx = toneIdx(formV(t, 0, { x: 1, y: 0 }, { x: 0, y: -1 }), w >= 5 * k);
      if (y < y0 + 1) idx = 1;
      if (Math.floor((x - x0 + 64) / (2 * k)) % 4 === 3 && idx === 0 && w >= 8 * k) idx = -1; // cloth crease
      return toneAt(cr, idx);
    };
    const crown = (h: number, w = W - 2 * k) => {
      const x0 = cx - w / 2 + (side ? -0.5 * k : 0);
      rect(x0, top - h + k, w, h + k, crownPaint(x0, w, top - h + k));
    };
    const brim = (x0: number, w: number, y: number, h: number, kind: 'cloth' | 'leather' = 'cloth') =>
      rect(x0, y, w, h, (x, yy) => tint(c, yy >= y + h - 1 ? -2 : x > cx + 2 * k ? -1 : x < cx - 2 * k && yy === Math.round(y) ? 1 : 0, kind));
    switch (e.id) {
      case 'hat':
        crown(4 * k, W - 3 * k);
        brim(cx - W / 2 - 2 * k + (side ? k : 0), W + 4 * k, top + k, k);
        rect(cx - (W - 3 * k) / 2 + (side ? -0.5 * k : 0), top, W - 3 * k, k, (x, y) => tint(a, y === Math.round(top) ? 1 : 0));
        break;
      case 'cowboy-hat':
        crown(4 * k, W - 4 * k);
        rect(cx - 0.5 * k + (side ? -0.5 * k : 0), top - 3 * k, k, k, cr.d1); // crown dent
        brim(cx - W / 2 - 3 * k, W + 6 * k, top + k, k, 'leather');
        if (!side) {
          rect(cx - W / 2 - 3 * k, top, k, k, cr.l1);
          rect(cx + W / 2 + 2 * k, top, k, k, cr.m);
        }
        rect(cx - (W - 4 * k) / 2 + (side ? -0.5 * k : 0), top, W - 4 * k, k, (x, y) => tint(a, y === Math.round(top) ? 1 : (x - cx + 64) % (2 * k) === 0 ? -1 : 0, 'leather'));
        break;
      case 'sheriff-hat':
        crown(4 * k, W - 4 * k);
        brim(cx - W / 2 - 3 * k, W + 6 * k, top + k, k, 'leather');
        shape([[cx - 1.5 * k, top - 3 * k + 1], [cx + 1.5 * k, top - 3 * k + 1], [cx, top - 5 * k]], (x) => (x < cx ? cr.m : cr.d1));
        rect(cx - (W - 4 * k) / 2, top, W - 4 * k, k, tint(a, 0, 'leather'));
        break;
      case 'cap':
        for (let y = top - k; y < top + 4 * k; y++) for (let x = hb.x0 - k; x <= hb.x0 + W; x++) if (inHead(hb, x, y, 0.8 * k)) P(x, y, pt(toneAt(cr, y < top - k + 1 ? 1 : x > cx + k ? -1 : Math.floor((x - cx + 64) / (2.5 * k)) % 3 === 0 ? -1 : 0)));
        rect(cx - 0.5 * k, top - 1.5 * k, k, k, cr.d1); // button
        if (side) rect(hb.x0 + W - k, top + 3 * k, 4 * k, k, (x, y) => tint(a, y >= top + 4 * k - 1 ? -1 : x >= hb.x0 + W + 2 * k ? -1 : 0));
        else if (!back) rect(cx - 3 * k, top + 3 * k, 6 * k, k, (x, y) => tint(a, y >= top + 4 * k - 1 ? -1 : x > cx ? -1 : 0));
        break;
      case 'beanie':
        for (let y = top - 2 * k; y < top + 5 * k; y++) for (let x = hb.x0 - k; x <= hb.x0 + W; x++) if (inHead(hb, x, y, k)) P(x, y, pt(y >= top + 3 * k ? tint(a, Math.floor((x + 64) / k) & 1 ? -1 : 0) : toneAt(cr, y < top - 2 * k + 1 ? 1 : x > cx + k ? -1 : Math.floor((x + y + 64) / k) % 3 === 0 ? -1 : 0)));
        oval(cx + (side ? -k : 0), top - 2.5 * k, 1.5 * k, 1.5 * k, (x, y) => tint(a, y < top - 2.5 * k ? 1 : (x + y) % 2 ? -1 : 0));
        break;
      case 'bucket-hat':
        crown(3 * k, W - 2 * k);
        rect(cx - W / 2 - k, top + k, W + 2 * k, 2 * k, (x, y) => toneAt(cr, y >= top + 3 * k - 1 ? -2 : y >= top + 2 * k ? -1 : x > cx + 2 * k ? -1 : 0));
        rect(cx - W / 2 - k, top + k, W + 2 * k, k, tint(a, 0));
        break;
      case 'hunting-cap':
        for (let y = top - k; y < top + 4 * k; y++) for (let x = hb.x0 - k; x <= hb.x0 + W; x++) if (inHead(hb, x, y, 0.8 * k)) P(x, y, pt(tint(pattern('plaid', x / k, y / k, c, a), x > cx + k ? -1 : 0)));
        if (side) rect(hb.cx - 2 * k, top + 3 * k, 3 * k, 4 * k, (_x, y) => toneAt(cr, y >= top + 7 * k - 1 ? -1 : 0));
        else {
          rect(hb.x0 - k, top + 3 * k, 2 * k, 4 * k, (_x, y) => toneAt(cr, y >= top + 7 * k - 1 ? -1 : 0));
          rect(hb.x0 + W - k, top + 3 * k, 2 * k, 4 * k, (_x, y) => toneAt(cr, y >= top + 7 * k - 1 ? -2 : -1));
          if (!back) rect(cx - 3 * k, top + 3 * k, 6 * k, k, cr.d1);
        }
        break;
      case 'chef-hat':
        oval(cx + (side ? -k : 0), top - 2.5 * k, 3.2 * k, 2.6 * k, (x, y) => toneAt(cr, y < top - 4 * k ? 1 : x > cx + k ? -1 : Math.floor((x * 3 + y + 64) / (2 * k)) % 4 === 0 ? 1 : 0));
        rect(cx - 2.5 * k + (side ? -k : 0), top - k, 5 * k, 2 * k, (_x, y) => toneAt(cr, y >= Math.round(top) ? -1 : 0));
        break;
      case 'mortarboard':
        crown(2 * k, W - 4 * k);
        rect(cx - W / 2 - k, top - k, W + 2 * k, k, (x, y) => toneAt(cr, x < cx && y < top - k + 1 ? 1 : 0));
        dline(cx + W / 2, top - k, cx + W / 2 + k, top + 3 * k, tint(a, 0));
        drect(cx + W / 2 + k - 1, top + 3 * k, k, k, tint(a, 1));
        break;
      case 'crown':
        rect(cx - 3 * k, top - k, 6 * k, 2 * k, (x, y) => tint(c, y < top - k + 1 ? 1 : x > cx + k ? -1 : 0, 'metal'));
        for (const dx of [-3, -0.5, 2]) shape([[cx + dx * k - 0.5, top - k + 0.5], [cx + dx * k + k + 0.5, top - k + 0.5], [cx + dx * k + 0.5 * k, top - 2.5 * k]], tint(c, dx < 0 ? 2 : 0, 'metal'));
        if (!back) {
          drect(cx - 0.5 * k, top, k, k, '#e8343c');
          dpx(cx - 0.5 * k, top, '#ff8a7a');
          dpx(cx - 2.5 * k, top + 0.5 * k, '#4d8be0');
          dpx(cx + 1.5 * k, top + 0.5 * k, '#58b368');
        }
        break;
      case 'headband':
        for (let x = hb.x0 - k; x <= hb.x0 + W; x++) {
          const y = Math.round(top + hb.h * 0.3);
          for (let j = 0; j < k; j++) if (inHead(hb, x, y + j, 0.8 * k)) P(x, y + j, pt(toneAt(cr, j === k - 1 ? -1 : x > cx + k ? -1 : 0)));
        }
        if (side) rect(hb.x0 - 2 * k, top + hb.h * 0.3, 2 * k, 3 * k + B.sway * k, (x) => (x < hb.x0 - 2 * k + 1 ? cr.d1 : cr.m));
        break;
      case 'headwrap':
        oval(cx + (side ? -k : 0), top + 0.5 * k, W / 2 + k, hb.h * 0.42, (x, y) => toneAt(cr, toneIdx(formV((x + 0.5 - cx) / (W / 2 + k), (top + 0.5 * k - y) / (hb.h * 0.42), { x: 1, y: 0 }, { x: 0, y: -1 }), true) - (Math.floor((x - y * 0.6 + 64) / (2 * k)) % 3 === 0 ? 1 : 0)));
        oval(cx + (side ? -2 * k : 0), top - 2 * k, W / 2 - k, 2.5 * k, (x, y) => toneAt(cr, y < top - 3 * k ? 1 : x > cx ? -1 : 0));
        if (!back) rect(cx - k, top - k, 2 * k, 2 * k, (x, y) => tint(a, x < cx && y < top ? 1 : 0));
        break;
      case 'head-bandana':
        for (let y = top - k; y < top + 3 * k; y++) for (let x = hb.x0 - k; x <= hb.x0 + W; x++) if (inHead(hb, x, y, 0.8 * k)) P(x, y, pt(tint(pattern('stars', x / k, y / k, c, a), x > cx + k ? -1 : 0)));
        if (side) rect(hb.x0 - 2 * k, top + 2 * k, 2 * k, 3 * k + B.sway * k, (x) => (x < hb.x0 - 2 * k + 1 ? cr.d1 : cr.m));
        break;
      case 'headset':
        layer({ flat: true });
        for (let x = hb.x0; x < hb.x0 + W; x++) if (inHead(hb, x, top - 0.6 * k, 0.9 * k) && !inHead(hb, x, top - 1.6 * k, 0.9 * k)) drect(x, top - k, 1, k, c);
        if (!back) {
          drect(side ? hb.cx - 1.5 * k : hb.x0 - k, hb.eyeY - k, k, 3 * k, c);
          dline(side ? hb.cx - k : hb.x0 - 0.5 * k, hb.eyeY + k, side ? hb.x0 + W - 2 * k : hb.cx - 2 * k, hb.mY, c);
          drect(side ? hb.x0 + W - 2 * k : hb.cx - 2.5 * k, hb.mY - 1, k, k, shA(c, 0.3));
        }
        break;
      case 'headlamp':
        for (let x = hb.x0 - k; x <= hb.x0 + W; x++) if (inHead(hb, x, top + 2 * k, 0.8 * k)) drect(x, top + 2 * k, 1, k, c);
        if (!back) {
          layer({ flat: true });
          drect(side ? hb.x0 + W - k : cx - k, top + k, 2 * k, 2 * k, '#4a4a5a');
          drect(side ? hb.x0 + W - k + 1 : cx - k + 1, top + k + 1, 2 * k - 2, 2 * k - 2, a);
          dpx(side ? hb.x0 + W - k + 1 : cx - k + 1, top + k + 1, '#fff6ea');
        }
        break;
      case 'flower':
        layer({ flat: true });
        for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) drect(hb.x0 + W - 2.5 * k + dx * k, top + 1.5 * k + dy * k, k, k, c);
        drect(hb.x0 + W - 2.5 * k, top + 1.5 * k, k, k, '#ffe48e');
        break;
      case 'pencil-ear':
        if (back) break;
        layer({ flat: false });
        dline(side ? hb.cx - 2 * k : hb.x0 + W, hb.eyeY - 3 * k, side ? hb.cx : hb.x0 + W + k, hb.eyeY, c);
        dline(side ? hb.cx - 2 * k + 1 : hb.x0 + W + 1, hb.eyeY - 3 * k, side ? hb.cx + 1 : hb.x0 + W + k + 1, hb.eyeY, shA(c, 0.25));
        drect(side ? hb.cx - 2 * k : hb.x0 + W, hb.eyeY - 3 * k - 1, k, 1, '#e88a9a');
        break;
      case 'safety-glasses':
        rect(hb.x0, top + k, W, k, (x, y) => tint(a, y === Math.round(top + k) ? 0 : -1));
        if (!back) rect(side ? hb.x0 + W - 3 * k : cx - 3 * k, top + k, side ? 3 * k : 6 * k, 2 * k, (x, y) => (y === Math.round(top + k) && x < cx ? mixc(c, '#ffffff', 0.7) : mixc(c, '#ffffff', 0.4)));
        break;
    }
  }
}

export function drawFaceExtras(hb: HB): void {
  if (hb.view === 'back' || B.bear) return;
  const side = hb.view === 'side';
  const ey = hb.eyeY;
  for (const e of B.look.extras ?? []) {
    if (EXTRA_SLOT[e.id] !== 'face') continue;
    const c = e.color;
    layer({ flat: true });
    const lens = (e.id === 'sunglasses' ? shA(c, 0.15) : e.id === 'aviators' ? mixc(c, '#ffd890', 0.4) : null) as Color | null;
    const frame = e.id === 'sunglasses' || e.id === 'aviators' ? (e.accent ?? '#2b2140') : c;
    const frameL = liA(frame, 0.25);
    const fw = (side ? EWS : EW) + 2;
    const fh = EH + 2;
    const box = (x0: number, round: boolean, cat: boolean, half: boolean) => {
      const y0 = ey - 1;
      for (let y = y0; y < y0 + fh; y++)
        for (let x = x0; x < x0 + fw; x++) {
          const edge = y === y0 || y === y0 + fh - 1 || x === x0 || x === x0 + fw - 1;
          const corner = (x === x0 || x === x0 + fw - 1) && (y === y0 || y === y0 + fh - 1);
          if (round && corner) continue;
          if (half && y < ey + 1) continue;
          if (edge) dpx(x, y, y === y0 || x === x0 ? frameL : frame);
          else if (lens) dpx(x, y, (x - x0) + (y - y0) === 2 || (x - x0) + (y - y0) === 3 ? liA(lens, 0.5) : lens);
          else if ((x === x0 + 1 && y === y0 + 1) || (x === x0 + 2 && y === y0 + 1)) dpx(x, y, '#e6f0ee');
        }
      if (cat) {
        dpx(x0 - 1, y0 - 1, frame);
        dpx(x0 + fw, y0 - 1, frame);
        dpx(x0 + fw + 1, y0 - 2, frame);
      }
    };
    if (e.id === 'eyepatch') {
      if (side) {
        dline(hb.x0 + 2 * K, hb.y0 + 2 * K, hb.eS, ey, INK);
        drect(hb.eS - 1, ey - 1, EWS + 2, EH + 2, INK);
      } else {
        dline(hb.x0, hb.y0 + 3 * K, hb.eR + EW + 1, ey - 1, INK);
        drect(hb.eR - 1, ey - 1, EW + 2, EH + 2, INK);
        dpx(hb.eR, ey, '#3a3050');
      }
      continue;
    }
    if (side) {
      box(hb.eS - 1, e.id === 'round-glasses' || e.id === 'aviators', e.id === 'cateye', e.id === 'halfmoon');
      dline(hb.eS - 2, ey, hb.cx - K, ey + 1, frame);
      continue;
    }
    const round = e.id === 'round-glasses' || e.id === 'aviators';
    box(hb.eL - 1, round, e.id === 'cateye', e.id === 'halfmoon');
    box(hb.eR - 1, round, e.id === 'cateye', e.id === 'halfmoon');
    for (let x = hb.eL + EW + 1; x < hb.eR - 1; x++) dpx(x, ey, frame);
    dline(hb.eL - 2, ey, hb.x0, ey + 1, frame);
    dline(hb.eR + EW + 1, ey, hb.x0 + hb.w - 1, ey + 1, frame);
  }
}

// ---------------------------------------------------------------------------
//  Bear head (Wanda)
// ---------------------------------------------------------------------------

export function drawBearHead(hb: HB, expr: Expr, blink: boolean): void {
  const fur = B.skinR;
  const muzC = mixc(B.skin, '#d8a878', 0.7);
  const muz = ramp(muzC, 'fur');
  const inner = mixc(B.skin, '#e8a0a0', 0.4);
  layer({ sh: 0.3, hl: 0 });
  const ear = (ex0: number, ey0: number) => {
    const r = 2.3 * K;
    oval(ex0, ey0, r, r, (x, y) => toneAt(fur, toneIdx(formV((x + 0.5 - ex0) / r, (ey0 - y - 0.5) / r, { x: 1, y: 0 }, { x: 0, y: -1 }), true) - ((x * 5 + y * 3) % 9 === 0 ? 1 : 0)));
    oval(ex0, ey0 + 0.3 * K, r * 0.5, r * 0.5, (x, y) => (y < ey0 ? inner : shA(inner, 0.2)));
  };
  if (hb.view !== 'side') {
    ear(hb.x0 + 1.5 * K, hb.y0 + K);
    ear(hb.x0 + hb.w - 1.5 * K, hb.y0 + K);
  } else ear(hb.cx - K, hb.y0 + 0.5 * K);
  drawHead(hb);
  if (hb.view === 'back') return;
  const eyeDot = (e: number, ey: number) => {
    const n = EH;
    drect(e + (EW - n) / 2, ey, n, n, INK);
    dpx(e + (EW - n) / 2, ey, EYE_SHINE);
    dpx(e + (EW - n) / 2 + 1, ey, '#5a4a60');
  };
  if (hb.view === 'front') {
    oval(hb.cx, hb.mY + 0.5 * K, 2.8 * K, 2 * K, (x, y) => toneAt(muz, y > hb.mY + K ? -1 : x < hb.cx - K ? 1 : 0));
    drect(hb.cx - K, hb.mY - 0.5 * K, 2 * K, K, INK);
    dpx(hb.cx - K, hb.mY - 0.5 * K, '#5a4a60');
    drect(hb.cx - 0.5, hb.mY + 0.5 * K, 1, K, toneAt(muz, -1));
    if (expr === 'yell' || expr === 'happy' || expr === 'pain' || expr === 'grin') drect(hb.cx - K, hb.mY + 1.5 * K, 2 * K, K, LIP_DARK);
    for (const e of [hb.eL, hb.eR]) {
      if (blink || expr === 'happy' || expr === 'closed' || expr === 'grin') drect(e, hb.eyeY + EH - 1, EW, 1, INK);
      else eyeDot(e, hb.eyeY);
    }
    const bl = mixc(fur.m, BLUSH, 0.4);
    drect(hb.eL - K, hb.eyeY + EH + 1, K, 1, bl);
    drect(hb.eR + EW, hb.eyeY + EH + 1, K, 1, bl);
  } else {
    layer({ sh: 0.3 });
    oval(hb.x0 + hb.w, hb.mY, 2.5 * K, 1.8 * K, (x, y) => toneAt(muz, y > hb.mY ? -1 : 0));
    drect(hb.x0 + hb.w + K, hb.mY - K, K, K, INK);
    dpx(hb.x0 + hb.w + K, hb.mY - K, '#5a4a60');
    if (blink) drect(hb.eS, hb.eyeY + EH - 1, EWS, 1, INK);
    else {
      drect(hb.eS, hb.eyeY, EWS, EH, INK);
      dpx(hb.eS, hb.eyeY, EYE_SHINE);
    }
  }
}

export { hairSpec, HAIR };
export type { HairSpec };
export { dk };
