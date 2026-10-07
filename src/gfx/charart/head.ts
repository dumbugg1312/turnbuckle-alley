import { dth, liA, mixc, P, shA, type Color } from '../kit';
import { EXTRA_SLOT } from '../look';
import type { Expr, View } from './body';
import { B, dk, pattern, X, Y } from './garments';
import { BLUSH, EYE_SHINE, EYE_WHITE, INK, LIP, LIP_DARK, ramp, tint, TONGUE, TOOTH, toneAt, type Ramp } from './palette';
import { D2R, dline, dpx, drect, formV, layer, LX, LY, oval, px, pt, rect, shape, toneIdx } from './raster';

/**
 * Head painters: skull, ears, face, facial hair, face paint, hair (every
 * style has its own silhouette), masks, hats and glasses.
 */

/** Head box in buffer pixels. */
export interface HB {
  x0: number;
  y0: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  view: View;
  /** Top row of the 2-px-tall eyes. */
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
  const tilt = B.view === 'side' ? Math.round(Math.sin((r.def.head + r.m.stoop * 6) * D2R) * 1.2) : 0;
  const eyeY = y0 + Math.round(h * 0.42) + tilt;
  const inset = w <= 8 ? 1 : 2;
  const eL = x0 + inset;
  const eR = x0 + w - inset - 2;
  const cx = x0 + w / 2;
  const faceEdge = x0 + w - 1;
  return { x0, y0, w, h, cx, cy: y0 + h / 2, view: B.view, eyeY, eL, eR, mY: eyeY + (h >= 8 ? 3 : 2), eS: faceEdge - 2, fE: faceEdge };
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
  return dx * dx + dy * dy <= 1;
}

export function headPaint(hb: HB, c: (x: number, y: number) => Color | null, grow = 0): void {
  for (let y = Math.floor(hb.y0 - grow - 1); y <= Math.ceil(hb.y0 + hb.h + grow); y++)
    for (let x = Math.floor(hb.x0 - grow - 1); x <= Math.ceil(hb.x0 + hb.w + grow); x++) if (inHead(hb, x, y, grow)) P(x, y, pt(c));
}

/** Skull: a lit sphere with the face kept readable and a jaw shadow. */
export function drawHead(hb: HB): void {
  const rp = B.skinR;
  layer({ sh: 0.3, hl: 0 });
  const rx = hb.w / 2;
  const ry = hb.h / 2;
  headPaint(hb, (x, y) => {
    const dx = (x + 0.5 - hb.cx) / rx;
    const dy = (y + 0.5 - hb.cy) / ry;
    const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
    let v = dx * LX * 0.9 + dy * LY * 0.9 + nz * 0.55 - 0.22;
    // Keep the face plane readable: only the cheek-edge and jaw fall into shadow.
    const faceRow = y >= hb.eyeY - 1 && y <= hb.mY;
    if (faceRow && Math.abs(dx) < 0.72 && v < -0.1) v = -0.1;
    let idx = toneIdx(v, hb.w >= 8);
    if (y >= hb.y0 + hb.h - 1 && idx > -1) idx = -1; // under the chin
    if (hb.view === 'side' && x >= hb.fE && y > hb.eyeY + 1) idx = Math.min(idx, 0);
    return toneAt(rp, idx);
  });
  if (B.bear) return;
  // Ears.
  const cauli = B.look.features?.includes('cauliflower');
  if (hb.view === 'front' || hb.view === 'back') {
    const ey = hb.eyeY;
    px(hb.x0 - 1, ey, rp.m);
    px(hb.x0 - 1, ey + 1, rp.d1);
    px(hb.x0 + hb.w, ey, rp.d1);
    px(hb.x0 + hb.w, ey + 1, rp.d2);
    if (cauli) px(hb.x0 - 1, ey - 1, rp.m);
  } else {
    const ex0 = Math.round(hb.cx - 2);
    rect(ex0, hb.eyeY - 1, 2, 3, (x, y) => (x === ex0 + 1 && y > hb.eyeY - 1 ? rp.d1 : rp.m));
    px(ex0 + 1, hb.eyeY, rp.d2);
    if (cauli) px(ex0 - 1, hb.eyeY, rp.m);
  }
}

// ---------------------------------------------------------------------------
//  Face
// ---------------------------------------------------------------------------

function irisOf(c: string): number {
  return mixc(INK, c, 0.5);
}

/** Face details (unlit decals). */
export function drawFace(hb: HB, expr: Expr, blink: boolean): void {
  const L = B.look;
  if (hb.view === 'back' || B.bear) return;
  const masked = L.mask && L.mask !== 'none' && L.mask !== 'domino';
  const hasGlasses = ['glasses', 'round-glasses', 'cateye', 'halfmoon', 'aviators'].some((g) => B.ex.has(g));
  const shades = B.ex.has('sunglasses');
  const iris = irisOf(L.eyeColor);
  const sk = B.skinR;
  const style = L.eyes;
  const facial = L.facial;
  const coversMouth = facial === 'walrus';
  const stache = ['mustache', 'pencil', 'handlebar', 'goatee', 'mutton', 'walrus'].includes(facial);
  const mouthY = hb.mY + (stache ? 1 : 0);
  const browC = L.hair === 'bald' || L.hair === 'buzz' ? sk.d2 : toneAt(ramp(L.hairColor, 'hair'), -1);
  const inMask = L.mask === 'luchador' || L.mask === 'half' || L.mask === 'domino';
  if (hb.view === 'side') {
    const ex0 = hb.eS;
    if (!shades && !(L.mask === 'hood' || L.mask === 'moth')) {
      eyeSide(ex0, hb.eyeY, expr, blink, iris, sk, style, hasGlasses || !!inMask);
      if (!masked) browSide(ex0, hb.eyeY, expr, browC, style);
    }
    // Nose bump, nostril and mouth.
    if (!masked || L.mask === 'half') {
      dpx(hb.fE + 1, hb.eyeY + 1, sk.m);
      dpx(hb.fE, hb.eyeY + 2, sk.d1);
    }
    if (!masked || L.mask === 'luchador' || L.mask === 'half') {
      if (!coversMouth) mouthSide(hb.fE - 2, mouthY, expr);
    }
    if (!masked && !/beard|square|wild|mutton/.test(facial) && !L.features?.includes('noblush')) dpx(ex0 - 1, hb.eyeY + 2, mixc(sk.m, BLUSH, 0.55));
    return;
  }
  // Front.
  if (!shades && L.mask !== 'hood' && L.mask !== 'moth') {
    eyeFront(hb.eL, hb.eyeY, -1, expr, blink, iris, sk, style, hasGlasses || !!inMask);
    eyeFront(hb.eR, hb.eyeY, 1, expr, blink, L.eyeColor2 ? irisOf(L.eyeColor2) : iris, sk, style, hasGlasses || !!inMask);
    if (!masked) {
      browFront(hb.eL, hb.eyeY, -1, expr, browC, style);
      browFront(hb.eR, hb.eyeY, 1, expr, browC, style);
    }
  }
  const beardy = /beard|square|wild/.test(facial);
  if (!masked || L.mask === 'half') {
    // Nose: bridge shadow between the eyes and a tip below.
    if (hb.h >= 8) {
      dpx(Math.floor(hb.cx), hb.eyeY + 2, sk.d1);
      if (hb.w >= 9) dpx(Math.floor(hb.cx) - 1, hb.eyeY + 2, sk.d1);
    }
    const blushOn = !beardy && !L.features?.includes('noblush');
    if (blushOn && !(L.paint && L.paint !== 'none' && L.paint !== 'sparkle' && L.paint !== 'heart')) {
      const bl = mixc(sk.m, BLUSH, L.features?.includes('blush') ? 0.8 : 0.5);
      dpx(hb.eL - 1, hb.eyeY + 2, bl);
      dpx(hb.eR + 2, hb.eyeY + 2, bl);
    }
    if (L.features?.includes('freckles')) {
      const fc = shA(mixc(sk.m, '#c87a4a', 0.5), 0.1);
      dpx(hb.eL, hb.eyeY + 2, fc);
      dpx(hb.eR + 1, hb.eyeY + 2, fc);
      dpx(hb.eL + 1, hb.eyeY + 3, fc);
    }
    if (L.features?.includes('beauty-mark')) dpx(hb.eR + 2, mouthY - 1, INK);
    if (L.features?.includes('bandage')) {
      dpx(hb.eL - 1, hb.eyeY - 1, '#f6e0bc');
      dpx(hb.eL, hb.eyeY - 1, '#f6e0bc');
    }
    if (L.features?.includes('flour')) {
      dpx(hb.eR + 2, hb.eyeY - 1, '#fbf6ec');
      dpx(hb.eR + 2, hb.eyeY, '#fbf6ec');
    }
    if (L.features?.includes('scar-brow')) dpx(hb.eR + 1, hb.eyeY - 2, sk.l2);
    if (L.features?.includes('scar-chin')) dpx(hb.eL, hb.mY + 1, sk.l2);
  }
  if (!coversMouth && (!masked || L.mask === 'luchador' || L.mask === 'half')) mouthFront(hb, mouthY, expr);
  if (L.features?.includes('earring') && !masked) {
    dpx(hb.x0 - 1, hb.eyeY + 2, '#ffd84a');
    dpx(hb.x0 + hb.w, hb.eyeY + 2, '#ffd84a');
  }
}

/**
 * A 2x2 eye: a shine at the top-left, ink on the anti-diagonal and the iris
 * at the bottom-right. ex0 is the left column; out is +1 for the right eye.
 */
function eyeFront(ex0: number, ey: number, out: number, expr: Expr, blink: boolean, iris: number, sk: Ramp, style: string, oneRow: boolean): void {
  const inner = out > 0 ? ex0 : ex0 + 1;
  const outer = out > 0 ? ex0 + 1 : ex0;
  const lid = sk.d2;
  if (oneRow) {
    // Inside glasses or a mask eye-hole: one row.
    if (blink || expr === 'closed' || expr === 'happy' || expr === 'grin') {
      drect(ex0, ey + 1, 2, 1, lid);
      return;
    }
    if (expr === 'pain' || expr === 'dizzy') {
      dpx(inner, ey, INK);
      dpx(outer, ey + 1, INK);
      return;
    }
    dpx(inner, ey, INK);
    dpx(outer, ey, iris);
    if (expr === 'angry' || expr === 'yell' || expr === 'focus') dpx(inner, ey - 1, INK);
    return;
  }
  if (blink || expr === 'closed') {
    drect(ex0, ey + 1, 2, 1, INK);
    return;
  }
  const open = () => {
    dpx(ex0, ey, EYE_SHINE);
    dpx(ex0 + 1, ey, INK);
    dpx(ex0, ey + 1, INK);
    dpx(ex0 + 1, ey + 1, iris);
  };
  switch (expr) {
    case 'happy':
    case 'grin':
      // Closed, curved up: a ^ of ink.
      dpx(inner, ey, INK);
      dpx(outer, ey + 1, INK);
      dpx(inner, ey + 1, lid);
      return;
    case 'pain':
      // Squeezed shut: a > shape.
      dpx(outer, ey, INK);
      dpx(inner, ey + 1, INK);
      dpx(outer, ey + 1, lid);
      return;
    case 'dizzy':
      dpx(ex0, ey, INK);
      dpx(ex0 + 1, ey + 1, INK);
      dpx(ex0 + 1, ey, EYE_WHITE);
      dpx(ex0, ey + 1, EYE_WHITE);
      return;
    case 'angry':
    case 'yell':
      // Heavy lid, glaring.
      drect(ex0, ey, 2, 1, INK);
      dpx(outer, ey + 1, iris);
      dpx(inner, ey + 1, INK);
      return;
    case 'focus':
      dpx(ex0, ey, INK);
      dpx(ex0 + 1, ey, INK);
      dpx(ex0, ey + 1, EYE_WHITE);
      dpx(ex0 + 1, ey + 1, iris);
      return;
    case 'smug':
      drect(ex0, ey, 2, 1, lid);
      dpx(ex0, ey + 1, EYE_WHITE);
      dpx(ex0 + 1, ey + 1, iris);
      return;
  }
  switch (style) {
    case 'dot':
      dpx(inner, ey, INK);
      dpx(inner, ey + 1, iris);
      return;
    case 'happy':
      dpx(inner, ey, INK);
      dpx(outer, ey + 1, INK);
      dpx(inner, ey + 1, lid);
      return;
    case 'sleepy':
      drect(ex0, ey, 2, 1, lid);
      dpx(ex0, ey + 1, INK);
      dpx(ex0 + 1, ey + 1, iris);
      return;
    case 'sharp':
      dpx(outer, ey, lid);
      dpx(inner, ey, INK);
      dpx(ex0, ey + 1, INK);
      dpx(ex0 + 1, ey + 1, iris);
      return;
    case 'wide':
      open();
      dpx(outer, ey + 1, EYE_WHITE);
      dpx(inner, ey + 1, iris);
      return;
    case 'lashes':
      open();
      dpx(outer, ey - 1, INK);
      return;
    default:
      open();
  }
}

function browFront(ex0: number, ey: number, out: number, expr: Expr, c: number, style: string): void {
  const inner = out > 0 ? ex0 : ex0 + 1;
  const outer = out > 0 ? ex0 + 1 : ex0;
  const by = ey - 1;
  switch (expr) {
    case 'angry':
    case 'yell':
    case 'focus':
      // Slanted in: the inner end dips to the eye.
      dpx(outer, by - 1, c);
      dpx(inner, by, c);
      return;
    case 'pain':
    case 'dizzy':
      dpx(outer, by, c);
      dpx(inner, by - 1, c);
      return;
    case 'smug':
      if (out > 0) {
        dpx(outer, by - 1, c);
        dpx(inner, by - 1, c);
      } else {
        dpx(outer, by, c);
        dpx(inner, by, c);
      }
      return;
    case 'happy':
    case 'grin':
      dpx(outer, by - 1, c);
      dpx(inner, by - 1, c);
      return;
  }
  if (style === 'sharp') {
    dpx(outer, by - 1, c);
    dpx(inner, by, c);
    return;
  }
  if (style === 'wide') {
    dpx(outer, by - 1, c);
    dpx(inner, by - 1, c);
    return;
  }
  if (style === 'sleepy') {
    dpx(outer, by, c);
    return;
  }
  dpx(outer, by, c);
  dpx(inner, by, c);
}

function eyeSide(ex0: number, ey: number, expr: Expr, blink: boolean, iris: number, sk: Ramp, style: string, oneRow: boolean): void {
  const lid = sk.d2;
  if (blink || expr === 'closed') {
    drect(ex0, ey + 1, 2, 1, INK);
    return;
  }
  if (expr === 'happy' || expr === 'grin' || style === 'happy') {
    dpx(ex0 + 1, ey, INK);
    dpx(ex0, ey + 1, INK);
    return;
  }
  if (expr === 'pain') {
    dpx(ex0, ey, INK);
    dpx(ex0 + 1, ey + 1, INK);
    return;
  }
  if (expr === 'dizzy') {
    dpx(ex0, ey, INK);
    dpx(ex0 + 1, ey + 1, INK);
    dpx(ex0 + 1, ey, EYE_WHITE);
    return;
  }
  if (oneRow) {
    dpx(ex0 + 1, ey, INK);
    dpx(ex0, ey, iris);
    return;
  }
  const heavy = expr === 'angry' || expr === 'yell' || expr === 'focus' || style === 'sharp' || style === 'sleepy' || expr === 'smug';
  dpx(ex0, ey, heavy ? lid : EYE_SHINE);
  dpx(ex0 + 1, ey, INK);
  dpx(ex0, ey + 1, INK);
  dpx(ex0 + 1, ey + 1, iris);
  if (style === 'lashes') dpx(ex0 + 2, ey, INK);
}

function browSide(ex0: number, ey: number, expr: Expr, c: number, style: string): void {
  const angry = expr === 'angry' || expr === 'yell' || expr === 'focus' || style === 'sharp';
  if (angry) {
    dpx(ex0, ey - 2, c);
    dpx(ex0 + 1, ey - 1, c);
    return;
  }
  const up = expr === 'happy' || expr === 'grin' || style === 'wide' ? 1 : 0;
  dpx(ex0, ey - 1 - up, c);
  dpx(ex0 + 1, ey - 1 - up, c);
}

function mouthFront(hb: HB, my: number, expr: Expr): void {
  const mx = Math.floor(hb.cx);
  const even = hb.w % 2 === 0;
  const gap = B.look.features?.includes('gap-tooth');
  const braces = B.look.features?.includes('braces');
  const x0 = even ? mx - 1 : mx - 1;
  const w = even ? 2 : 3;
  const lipD = B.bear ? INK : LIP_DARK;
  switch (expr) {
    case 'happy':
    case 'grin': {
      // Open smile: dark mouth, teeth, corners curled up.
      drect(x0, my, w, 1, lipD);
      if (w === 3) {
        dpx(x0, my - 1, LIP);
        dpx(x0 + 2, my - 1, LIP);
        dpx(x0 + 1, my, braces ? '#dcdae6' : gap ? TOOTH : expr === 'grin' ? TOOTH : lipD);
        if (expr === 'grin') drect(x0, my + 1, 3, 1, TONGUE);
      } else {
        dpx(x0 - 1, my - 1, LIP);
        dpx(x0 + 2, my - 1, LIP);
        if (braces) dpx(x0, my, '#dcdae6');
        else if (gap || expr === 'grin') dpx(x0, my, TOOTH);
      }
      return;
    }
    case 'yell':
      drect(x0 + (w === 3 ? 1 : 0), my, w === 3 ? 1 : 2, 2, lipD);
      dpx(x0 + (w === 3 ? 1 : 0), my + 1, TONGUE);
      if (w === 3) {
        dpx(x0, my, LIP);
        dpx(x0 + 2, my, LIP);
      }
      return;
    case 'pain':
      drect(x0, my, w, 1, lipD);
      dpx(x0 + (w === 3 ? 1 : 0), my, TOOTH);
      dpx(x0, my + 1, LIP);
      return;
    case 'dizzy':
      dpx(mx, my, LIP);
      dpx(mx + 1, my + 1, LIP);
      dpx(mx - 1, my + 1, LIP);
      return;
    case 'angry':
      drect(x0, my, w, 1, B.skinR.d2);
      dpx(x0, my - 1, B.skinR.d1);
      return;
    case 'smug':
      dpx(mx, my, LIP);
      dpx(mx + 1, my - 1, LIP);
      dpx(mx - 1, my, B.skinR.d1);
      return;
    case 'focus':
      drect(x0 + (w === 3 ? 1 : 0), my, w === 3 ? 1 : 2, 1, B.skinR.d2);
      return;
  }
  drect(x0 + (w === 3 ? 1 : 0), my, w === 3 ? 1 : 2, 1, LIP);
  dpx(x0 + (w === 3 ? 1 : 0), my + 1, mixc(B.skinR.m, LIP, 0.35));
}

function mouthSide(mx: number, my: number, expr: Expr): void {
  if (expr === 'yell') {
    drect(mx, my, 2, 2, LIP_DARK);
    dpx(mx, my + 1, TONGUE);
    return;
  }
  if (expr === 'happy' || expr === 'grin' || expr === 'pain') {
    drect(mx, my, 2, 1, LIP_DARK);
    dpx(mx + 1, my, expr === 'pain' ? TOOTH : LIP);
    dpx(mx, my - 1, LIP);
    return;
  }
  dpx(mx + 1, my, expr === 'angry' || expr === 'focus' ? B.skinR.d2 : LIP);
  dpx(mx + 1, my + 1, B.skinR.d1);
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
      rect(hb.x0 + 1, chin - 1, hb.w - 2, f === 'wild' ? 4 : 2, (x, y) => (y === chin + (f === 'wild' ? 2 : 0) ? hr.d1 : x > cx ? hr.d1 : hr.m));
    }
    return;
  }
  if (f === 'stubble') {
    for (let y = my - 1; y <= chin; y++)
      for (let x = hb.x0; x < hb.x0 + hb.w; x++)
        if (inHead(hb, x, y) && (hb.view === 'side' ? x > hb.cx - 1 : true) && (y > my || Math.abs(x + 0.5 - cx) > 2.2) && dth(x, y, 8)) dpx(x, y, mixc(B.skin, L.hairColor, 0.38));
    return;
  }
  layer({ sh: 0.3, hl: 0.1, cast: false, aa: false });
  // Hair paint with a lit top and a dark underside.
  const hp = (x: number, y: number, top: number, bot: number): Color => (y <= top ? hr.l1 : y >= bot ? hr.d1 : x > cx + 1 ? hr.d1 : hr.m);
  const stache = (w: number, droop: number, tips: number) => {
    if (hb.view === 'side') {
      rect(hb.x0 + hb.w - 3, my, 3, 1, (x) => (x === hb.x0 + hb.w - 1 ? hr.d1 : hr.m));
      if (droop) px(hb.x0 + hb.w - 3, my + 1, hr.d1);
      if (tips) px(hb.x0 + hb.w - 3, my - 1, hr.l1);
      return;
    }
    const x0 = Math.round(cx - w / 2);
    rect(x0, my, w, 1, (x) => (x === x0 ? hr.l1 : x > cx ? hr.d1 : hr.m));
    if (droop) {
      px(x0, my + 1, hr.m);
      px(x0 + w - 1, my + 1, hr.d1);
    }
    if (tips) {
      px(x0 - 1, my - 1, hr.l1);
      px(x0 + w, my - 1, hr.m);
    }
  };
  const beard = (extra: number, flat: boolean, wild: boolean) => {
    const top = hb.eyeY + 2;
    for (let y = hb.eyeY + 1; y <= chin + extra; y++)
      for (let x = hb.x0 - 1; x <= hb.x0 + hb.w; x++) {
        const inside = inHead(hb, x, y, 0.4) || (y > chin - 1 && Math.abs(x + 0.5 - cx) < hb.w / 2 - (flat ? 1 : 1 + (y - chin) * 0.9) - (wild && (x + y) % 2 ? 1 : 0));
        if (!inside) continue;
        if (hb.view === 'side') {
          if (x < hb.cx - 1) continue;
          if (y <= my && x > hb.x0 + hb.w - 3) continue;
          px(x, y, hp(x, y, top, chin + extra));
          continue;
        }
        const ax = Math.abs(x + 0.5 - cx);
        if (y <= my && ax < hb.w * 0.3) continue;
        if (y === hb.eyeY + 1 && ax < hb.w * 0.4) continue;
        px(x, y, wild && (x * 3 + y) % 5 === 0 ? hr.l1 : hp(x, y, top, chin + extra));
      }
  };
  switch (f) {
    case 'mustache':
      stache(4, 0, 0);
      break;
    case 'pencil':
      if (hb.view === 'side') stache(3, 0, 0);
      else {
        px(cx - 2, my, hr.d1);
        px(cx + 1, my, hr.d1);
        px(cx - 1, my, hr.m);
        px(cx, my, hr.m);
      }
      break;
    case 'walrus':
      stache(6, 1, 0);
      break;
    case 'handlebar':
      stache(4, 0, 1);
      break;
    case 'goatee':
      stache(4, 0, 0);
      if (hb.view === 'side') rect(hb.x0 + hb.w - 3, chin - 1, 2, 3, (_x, y) => (y === chin + 1 ? hr.d1 : hr.m));
      else rect(cx - 1, chin - 1, 2, 3, (x, y) => (y === chin + 1 || x > cx ? hr.d1 : hr.m));
      break;
    case 'soulpatch':
      if (hb.view === 'side') px(hb.x0 + hb.w - 2, my + 1, hr.m);
      else px(cx - 0.5, my + 1, hr.m);
      break;
    case 'mutton':
      if (hb.view === 'side') rect(hb.cx, hb.eyeY, 2, my - hb.eyeY + 2, (x) => (x === Math.round(hb.cx) ? hr.m : hr.d1));
      else {
        rect(hb.x0, hb.eyeY, 2, my - hb.eyeY + 2, (x) => (x === hb.x0 ? hr.l1 : hr.m));
        rect(hb.x0 + hb.w - 2, hb.eyeY, 2, my - hb.eyeY + 2, (x) => (x === hb.x0 + hb.w - 1 ? hr.d1 : hr.m));
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
    if (inHead(hb, x, y)) P(x, y, pt(x > hb.cx + 1 ? tint(c, -1) : c));
  };
  const side = hb.view === 'side';
  const eyes = side ? [hb.eS] : [hb.eL, hb.eR + 1];
  switch (p) {
    case 'stripes':
      for (const e of eyes) {
        pp(e - 1, ey + 2);
        pp(e, ey + 2);
        pp(e + 1, ey + 2);
      }
      break;
    case 'skull':
      for (let y = hb.y0; y < hb.y0 + hb.h; y++) for (let x = hb.x0; x < hb.x0 + hb.w; x++) if (inHead(hb, x, y) && (!side || x > hb.cx)) pp(x, y);
      for (const e of eyes) {
        pp(e - 1, ey, INK);
        pp(e, ey - 1, INK);
        pp(e + 1, ey, INK);
        pp(e, ey + 2, INK);
      }
      if (!side) {
        pp(Math.floor(hb.cx) - 1, hb.mY + 1, INK);
        pp(Math.floor(hb.cx) + 1, hb.mY + 1, INK);
      }
      break;
    case 'star': {
      const e = side ? hb.eS : hb.eR;
      for (const [dx, dy] of [[0, -2], [-1, -1], [1, -1], [-2, 0], [2, 0], [-1, 2], [1, 2], [0, 3]]) pp(e + dx, ey + dy);
      break;
    }
    case 'tribal':
      for (const e of eyes) {
        const o = side ? -1 : e === hb.eL ? -1 : 1;
        pp(e + o, ey + 2);
        pp(e + o * 2, ey + 1);
        pp(e + o * 2, ey);
        pp(e + o * 2, ey - 1);
        pp(e + o, ey - 2);
      }
      break;
    case 'tears':
      for (const e of eyes) {
        pp(e, ey + 2);
        pp(e, ey + 3);
        pp(e, ey - 1);
      }
      break;
    case 'split':
      for (let y = hb.y0; y < hb.y0 + hb.h; y++) for (let x = Math.ceil(hb.cx); x < hb.x0 + hb.w; x++) if (inHead(hb, x, y)) pp(x, y);
      break;
    case 'peak': {
      const top = hb.y0 + 1;
      const base = ey + 1;
      for (let y = top; y <= base; y++)
        for (let x = hb.x0; x < hb.x0 + hb.w; x++) {
          const ax = Math.abs(x + 0.5 - hb.cx);
          const lim = ((y - top) / (base - top)) * (hb.w / 2 + 1) + 1;
          if (ax > lim) continue;
          const snow = y < top + (base - top) * 0.42 + (x % 2 ? 0.6 : 0);
          pp(x, y, snow ? '#f4f2fa' : pc);
        }
      break;
    }
    case 'sparkle':
      for (const e of eyes) {
        pp(e - 1, ey + 2, '#fff6c0');
        pp(e + 1, ey + 3, pc);
      }
      break;
    case 'heart': {
      const e = side ? hb.eS : hb.eR;
      pp(e, ey + 2);
      pp(e + 1, ey + 2);
      pp(e, ey + 3);
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
  /** Extra volume beyond the skull (px). */
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
 * skull, shadow where the hair tucks under at the right and bottom, strand
 * lines for long styles and an accent streak.
 */
export function hairPaint(hb: HB, hc: string): (x: number, y: number) => Color {
  const acc = B.look.hairAccent;
  const hr = ramp(hc, 'hair');
  const sx = hb.x0 + Math.round(hb.w * 0.62);
  const spec = hairSpec();
  const rx = hb.w / 2 + 1;
  const ry = hb.h / 2 + 1;
  return (x: number, y: number) => {
    if (acc && (spec.top === 'spikes' || spec.top === 'faux' ? y < hb.y0 : x === sx && y < hb.y0 + hb.h * 0.45)) return tint(acc, y < hb.y0 + 1 ? 1 : 0, 'hair');
    const dx = (x + 0.5 - hb.cx) / rx;
    const dy = (y + 0.5 - hb.cy) / ry;
    const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
    let v = dx * LX + dy * LY + nz * 0.5 - 0.2;
    // Highlight band: an arc at a fixed distance from the lit pole.
    const d = Math.hypot(dx - LX * 0.55, dy - LY * 0.55);
    let idx = toneIdx(v, true);
    if (d < 0.36 && d > 0.14 && y < hb.y0 + hb.h * 0.45) idx = Math.max(idx, 1);
    if (d <= 0.14 && y < hb.y0 + hb.h * 0.4) idx = 2;
    if (spec.locs && hb.view !== 'side' && (x - hb.x0) % 2 === 0 && y > hb.y0 + 2) idx = Math.min(idx, -1);
    if (spec.curly && (x * 7 + y * 3) % 5 === 0) idx += 1;
    else if (spec.curly && (x * 3 + y * 5) % 7 === 0) idx -= 1;
    if ((spec.sides >= 3 || spec.back >= 3) && y > hb.y0 + hb.h * 0.6 && ((x * 5 + 3) % 4 === 0)) idx -= 1;
    if (y >= hb.y0 + hb.h * 0.9) idx = Math.min(idx, -1);
    return toneAt(hr, Math.max(-2, Math.min(2, idx)));
  };
}

function hairline(hb: HB, x: number, sp: HairSpec): number {
  const base = hb.y0 + hb.h * sp.capY;
  const t = (x + 0.5 - hb.x0) / hb.w;
  switch (sp.fringe) {
    case 'jag':
      return base + ((x & 1) && t > 0.2 && t < 0.8 ? 1 : 0);
    case 'partL':
      return base + t * 2.4 - 0.6;
    case 'partR':
      return base + (1 - t) * 2.4 - 0.6;
    case 'mid':
      return base + Math.abs(t - 0.5) * 4.5 - 1.2;
    case 'swoop':
      return base + t * t * 3.5 - 0.8;
    case 'bangs':
      return base + 1;
    case 'curly':
      return base + (Math.sin(x * 1.9) > 0 ? 1 : 0);
    case 'wave':
      return base + (x % 3 === 0 ? 1 : 0);
    case 'shag':
      return base + ((x * 7) % 3 === 0 ? 1 : 0) + (t > 0.3 && t < 0.7 ? 0.5 : 0);
    case 'none':
      return base - 1;
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
  const sway = B.sway;
  if (hb.view === 'front') {
    if (!masked && sp.back >= 2) {
      const len = sp.back === 2 ? hb.h * 0.2 : sp.back * 3 + sway;
      const w = hb.w + (sp.curly ? 3 : 2);
      rect(cx - w / 2, hb.cy, w, hb.h / 2 + len, paint);
    }
    if (!masked && sp.top === 'afro') oval(cx, hb.cy - 1.5, hb.w / 2 + 3, hb.h / 2 + 2.5, paint);
    if (sp.tail === 'mullet' && !masked) rect(cx - hb.w / 2 - 0.5, hb.eyeY, hb.w + 1, hb.h - (hb.eyeY - hb.y0) + 3 + sway, paint);
    if (sp.tail === 'pigtails') {
      oval(hb.x0 - 2, hb.eyeY + sway * 0.5, 2, 3, paint);
      oval(hb.x0 + hb.w + 1, hb.eyeY + sway * 0.5, 2, 3, paint);
    }
    if (sp.tail === 'pony' || sp.tail === 'longbraid') oval(hb.x0 + hb.w, hb.eyeY + 1 + sway * 0.5, 1.5, 2.5, paint);
    return;
  }
  if (hb.view === 'side') {
    if (!masked && sp.back >= 2) rect(hb.x0 - 1, hb.cy - 1, hb.w * 0.55, hb.h / 2 + (sp.back - 1) * 3 + sway, paint);
    if (!masked && sp.top === 'afro') oval(cx - 1, hb.cy - 1.5, hb.w / 2 + 3, hb.h / 2 + 2.5, paint);
    if (sp.tail === 'mullet') rect(hb.x0, hb.cy, 4, hb.h / 2 + 3 + sway, paint);
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
  drawTails(hb, sp, paint);
  if (fullMask || sp.cap === 'none') {
    if (sp.cap === 'none' && !fullMask && v !== 'back') {
      // A shine on a bald scalp.
      dpx(hb.x0 + Math.round(hb.w * 0.3), hb.y0 + 1, B.skinR.l2);
    }
    return;
  }
  const grow = 0.6 + (sp.vol ?? 0) * 0.6;
  const y0 = Math.floor(hb.y0 - grow - 2);
  for (let y = y0; y <= hb.y0 + hb.h + 1; y++)
    for (let x = hb.x0 - 3; x <= hb.x0 + hb.w + 2; x++) {
      if (!inHead(hb, x, y, grow)) continue;
      let hl: number;
      if (v === 'front') {
        hl = hairline(hb, x, sp);
        const edge = x <= hb.x0 || x >= hb.x0 + hb.w - 1;
        if (edge && sp.sides >= 1) hl = Math.max(hl, sp.sides === 1 ? hb.eyeY - 0.5 : sp.sides === 2 ? hb.y0 + hb.h - 1.5 : hb.y0 + hb.h + 2);
        if (sp.bob && (x < hb.x0 + 1 || x > hb.x0 + hb.w - 2)) hl = hb.y0 + hb.h - 0.5;
      } else if (v === 'back') {
        hl = hb.y0 + hb.h - (sp.back >= 1 ? 1.5 : 2.5);
      } else {
        const t = (x + 0.5 - hb.x0) / hb.w;
        const front = hairline(hb, hb.x0 + hb.w - 2, sp);
        const backL = hb.y0 + hb.h - (sp.back >= 1 ? 1.5 : 2.5);
        hl = t > 0.5 ? front : t < 0.28 ? backL : backL + (front - backL) * ((t - 0.28) / 0.22);
        if (Math.abs(x + 1 - hb.cx) < 1.5 && sp.sides < 2) hl = Math.min(hl, hb.eyeY - 1.5);
      }
      if (y >= hl) continue;
      if (sp.cap === 'buzz') {
        if (dth(x, y, 9) || y < hb.y0 + 1) P(x, y, pt(mixc(hc, B.skin, 0.3)));
        continue;
      }
      if (sp.cap === 'side' && v !== 'side' && Math.abs(x + 0.5 - cx) > hb.w * 0.22) {
        if (dth(x, y, 6)) P(x, y, pt(mixc(hc, B.skin, 0.45)));
        continue;
      }
      if (sp.cap === 'side' && v === 'side' && y > hb.y0 + 1) {
        if (dth(x, y, 6)) P(x, y, pt(mixc(hc, B.skin, 0.45)));
        continue;
      }
      if (sp.curly && inHead(hb, x, y, grow) && !inHead(hb, x, y, grow - 1) && (x + y) % 3 === 0) continue;
      P(x, y, pt(paint));
    }
  // Flyaway strands.
  if (sp.cap === 'full' && !sp.curly && sp.top !== 'flat' && sp.top !== 'pomp') {
    const fx = v === 'side' ? hb.x0 + 1 : hb.x0 + hb.w - 2;
    px(fx, y0 + 1, hr.m);
  }
  // Long side curtains in front of the shoulders.
  if (v === 'front' && sp.sides >= 3) {
    const len = hb.h * 0.5 + 3 + (sp.back - 3) * 2 + B.sway;
    rect(hb.x0 - 1, hb.eyeY - 2, 2, len, (x, y) => (x === hb.x0 ? hr.d1 : paint(x, y)));
    rect(hb.x0 + hb.w - 1, hb.eyeY - 2, 2, len, (x, y) => (x === hb.x0 + hb.w ? hr.d1 : paint(x, y)));
  }
  if (v === 'back' && sp.back >= 2) {
    const len = sp.back === 2 ? 2 : (sp.back - 1) * 3.5 + B.sway;
    rect(cx - hb.w / 2 - (sp.curly ? 1 : 0.5), hb.cy, hb.w + (sp.curly ? 2 : 1), hb.h / 2 + len, paint);
  }
  if (v === 'side' && sp.back >= 2) rect(hb.x0 - 1, hb.cy, hb.w * 0.45, hb.h / 2 + (sp.back - 1.5) * 3 + B.sway, paint);
  if (hatTop) return;
  // Top features.
  const top = hb.y0;
  switch (sp.top) {
    case 'bun':
      oval(cx + (v === 'side' ? -2.5 : 0), top - 1.5, 2.6, 2.2, paint);
      px(cx + (v === 'side' ? -3.5 : -1), top - 2.5, hr.l1);
      break;
    case 'topknot':
      oval(cx + (v === 'side' ? -1 : 0), top - 2, 2, 2.2, paint);
      rect(cx - 0.5 + (v === 'side' ? -1 : 0), top - 0.5, 1, 1, hr.d1);
      break;
    case 'twinbuns':
      if (v === 'side') oval(cx - 1, top - 1, 2.3, 2.2, paint);
      else {
        oval(hb.x0 + 1.5, top, 2.3, 2.2, paint);
        oval(hb.x0 + hb.w - 1.5, top, 2.3, 2.2, paint);
        px(hb.x0 + 0.5, top - 1, hr.l1);
      }
      break;
    case 'mohawk':
    case 'faux': {
      const tall = sp.top === 'mohawk' ? 5 : 2;
      if (v === 'side') {
        for (let i = 0; i < hb.w - 2; i++) {
          const x = hb.x0 + 1 + i;
          const hgt = tall - ((i + 1) % 3 === 0 ? 1 : 0) - (i < 2 ? 1 : 0);
          rect(x, top - hgt + 1, 1, hgt + 1, (xx, yy) => (yy === top - hgt + 1 ? hr.l1 : paint(xx, yy)));
        }
      } else rect(cx - 1.5, top - tall + 1, 3, tall + 2, (x, y) => (x === Math.round(cx - 1.5) ? hr.l1 : x === Math.round(cx + 0.5) ? hr.d1 : y < top - tall + 2 ? hr.l1 : paint(x, y)));
      break;
    }
    case 'spikes':
      for (let i = 0; i < 5; i++) {
        const x = hb.x0 + 1 + i * ((hb.w - 2) / 4);
        const tipY = top - 2 - (i % 2);
        shape([[x - 1.5, top + 2], [x + 1.5, top + 2], [x + (v === 'side' ? -1.5 : 0), tipY]], (xx, yy) => (yy <= tipY + 1 ? hr.l1 : paint(xx, yy)));
      }
      break;
    case 'pomp':
      if (v === 'side') {
        oval(hb.x0 + hb.w - 3.5, top - 0.5, 3.8, 3, paint);
        px(hb.x0 + hb.w - 2, top - 3, hr.l1);
      } else {
        oval(cx + 0.5, top - 0.5, hb.w / 2 - 0.5, 3, paint);
        rect(cx - hb.w / 2 + 1, top - 2, hb.w - 3, 1, (x) => (x < cx ? hr.l1 : hr.m));
      }
      break;
    case 'flat':
      rect(hb.x0 + 1, top - 2, hb.w - 2, 3, (x, y) => (y === top - 2 ? hr.l1 : x === hb.x0 + hb.w - 2 ? hr.d1 : paint(x, y)));
      break;
    case 'cowlick':
      px(cx + 1, top - 1.5, hr.m);
      px(cx + 2, top - 2.5, hr.l1);
      break;
    case 'crown':
      for (let x = hb.x0; x < hb.x0 + hb.w; x++) {
        const yb = top + 1 + (v === 'side' ? 1 : 0);
        P(x, yb, pt((x & 1) === 0 ? hr.l1 : hr.d1));
        P(x, yb - 1, pt((x & 1) === 0 ? hr.m : hr.l1));
      }
      break;
  }
}

function drawTails(hb: HB, sp: HairSpec, paint: (x: number, y: number) => Color): void {
  const v = hb.view;
  const t = sp.tail;
  if (!t) return;
  const hr = ramp(B.look.hairColor, 'hair');
  const sway = B.sway;
  const braidSeg = (x: number, y0: number, n: number) => {
    for (let i = 0; i < n; i++) {
      P(Math.round(x), Math.round(y0 + i), pt((i & 1) === 0 ? hr.l1 : hr.d1));
      P(Math.round(x) + 1, Math.round(y0 + i), pt((i & 1) === 1 ? hr.m : hr.d2));
    }
    P(Math.round(x), Math.round(y0 + n), pt(hr.d1));
  };
  if (v === 'back') {
    if (t === 'pony' || t === 'highpony') rect(hb.cx - 1, hb.y0 + (t === 'highpony' ? 1 : 3), 2, hb.h + 1 + sway, (x, y) => (x === Math.round(hb.cx) ? hr.d1 : paint(x, y)));
    if (t === 'longbraid') braidSeg(hb.cx - 1, hb.y0 + 3, hb.h + 5 + sway);
    if (t === 'braids') {
      braidSeg(hb.x0 + 1, hb.cy, hb.h * 0.5 + 4 + sway);
      braidSeg(hb.x0 + hb.w - 3, hb.cy, hb.h * 0.5 + 4 + sway);
    }
    if (t === 'pigtails') {
      oval(hb.x0 - 1, hb.eyeY - 1, 2, 3, paint);
      oval(hb.x0 + hb.w, hb.eyeY - 1, 2, 3, paint);
    }
    if (t === 'mullet') rect(hb.x0, hb.eyeY, hb.w, hb.h - (hb.eyeY - hb.y0) + 3 + sway, (x, y) => ((x * 5 + 3) % 4 === 0 && y > hb.cy ? hr.d1 : paint(x, y)));
    return;
  }
  if (v === 'side') {
    if (t === 'pony') {
      oval(hb.x0 - 1, hb.cy - 1, 1.6, 1.6, paint);
      rect(hb.x0 - 2.5, hb.cy - 1, 2, hb.h * 0.6 + sway, (x, y) => (x === Math.round(hb.x0 - 2.5) ? hr.d1 : paint(x, y)));
    }
    if (t === 'highpony') {
      oval(hb.x0, hb.y0 + 1, 1.6, 1.6, paint);
      shape([[hb.x0 - 1, hb.y0], [hb.x0 + 1, hb.y0 + 1], [hb.x0 - 3, hb.y0 + hb.h * 0.75 + sway], [hb.x0 - 4.5, hb.y0 + hb.h * 0.7 + sway]], paint);
    }
    if (t === 'longbraid') braidSeg(hb.x0 - 2, hb.cy - 1, hb.h + 3 + sway);
    if (t === 'braids') braidSeg(hb.x0 + 1, hb.cy, hb.h * 0.5 + 4 + sway);
    if (t === 'pigtails') oval(hb.x0, hb.eyeY - 1 + sway * 0.5, 2, 3, paint);
    return;
  }
  if (t === 'braids') {
    braidSeg(hb.x0 - 1, hb.eyeY - 1, hb.h * 0.5 + 5 + sway);
    braidSeg(hb.x0 + hb.w - 1, hb.eyeY - 1, hb.h * 0.5 + 5 + sway);
  }
  if (t === 'highpony') oval(hb.cx, hb.y0 - 0.5, 1.6, 1.4, paint);
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
  const eyes = side ? [hb.eS] : [hb.eL, hb.eR + 1];
  switch (pat) {
    case 'stripe':
      if (Math.abs(dx) < 1 && y < ey - 1) return acc;
      break;
    case 'flames':
      for (const e of eyes) {
        const fx = x - e;
        if (y < ey - 1 && y > ey - 4 - (Math.abs(fx) % 2) * 2 && Math.abs(fx) <= 2) return y < ey - 3 ? '#ffd84a' : acc;
      }
      break;
    case 'wings':
      for (const e of eyes) {
        const o = side ? -1 : e === hb.eL ? -1 : 1;
        const fx = (x - e) * o;
        const fy = y - ey;
        if (fx >= 0 && fx <= 3 && fy >= -3 && fy <= 1 && fy > -fx - 1.5) return (fx + fy) % 3 === 0 ? INK : acc;
      }
      break;
    case 'star':
      if ((Math.abs(dx) < 0.6 && Math.abs(ty - 3) <= 1.2) || (Math.abs(ty - 3) < 0.6 && Math.abs(dx) <= 1.6)) return acc;
      break;
    case 'teardrop':
      for (const e of eyes) if (x === e && (y === ey + 2 || y === ey + 3)) return acc;
      break;
    case 'split':
      if (dx > 0) return acc;
      break;
    case 'swirl': {
      const a = Math.atan2(y + 0.5 - hb.cy, dx) + Math.hypot(dx, y + 0.5 - hb.cy) * 0.9;
      if (Math.sin(a * 2) > 0.7) return acc;
      break;
    }
    case 'heart':
      if ((ty === 2 && Math.abs(dx) > 0.4 && Math.abs(dx) < 1.6) || (ty === 3 && Math.abs(dx) < 2) || (ty === 4 && Math.abs(dx) < 0.9)) return acc;
      break;
    case 'lightning':
      if (y < ey - 1 && Math.abs(dx - ((ty % 3) - 1)) < 0.6) return acc;
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
  const ey = hb.eyeY;
  const rx = hb.w / 2 + 0.5;
  const ry = hb.h / 2 + 0.5;
  const shadeIdx = (x: number, y: number) => {
    const dx = (x + 0.5 - hb.cx) / rx;
    const dy = (y + 0.5 - hb.cy) / ry;
    const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
    return toneIdx(dx * LX + dy * LY + nz * 0.55 - 0.22, true);
  };
  if (mk === 'domino') {
    layer({ sh: 0.3, cast: false, aa: false });
    if (back) {
      rect(hb.x0, ey - 1, hb.w, 1, mr.d1);
      return;
    }
    for (let x = side ? Math.round(hb.cx) : hb.x0; x < hb.x0 + hb.w; x++) for (let y = ey - 1; y <= ey + 1; y++) if (inHead(hb, x, y, 0.3)) P(x, y, pt(y === ey - 1 ? mr.l1 : y === ey + 1 ? mr.d1 : mr.m));
    for (const e of eyes) drect(e, ey, side ? 2 : 2, 1, EYE_WHITE);
    return;
  }
  layer({ sh: 0.3, hl: 0, cast: true });
  const lowY = mk === 'half' ? ey + 1.5 : 999;
  const grow = mk === 'moth' ? 0.9 : 0.5;
  for (let y = Math.floor(hb.y0 - 2); y <= hb.y0 + hb.h + 1; y++)
    for (let x = hb.x0 - 2; x <= hb.x0 + hb.w + 1; x++) {
      if (!inHead(hb, x, y, grow) || y > lowY) continue;
      const idx = shadeIdx(x, y);
      if (mk === 'moth') {
        const edge = !inHead(hb, x, y, grow - 1);
        P(x, y, pt(edge && dth(x, y, 8) ? '#b8a890' : toneAt(mr, idx)));
        continue;
      }
      if (mk === 'hood') {
        P(x, y, pt(toneAt(mr, Math.min(idx, 0))));
        continue;
      }
      // Luchador / half: pattern, a seam down the centre, a hem row on a half mask.
      let c: Color;
      if (back) c = Math.abs(x + 0.5 - hb.cx) < 0.6 && y > hb.cy - 2 && y % 2 === 0 ? ma : mc;
      else c = maskPattern(hb, x, y, mc, ma);
      let i2 = idx;
      if (!back && !side && Math.abs(x + 0.5 - hb.cx) < 0.6 && y < ey - 2 && (y & 1)) i2 -= 1; // stitching
      if (mk === 'half' && y > lowY - 1) i2 -= 1;
      P(x, y, pt(c === mc ? toneAt(mr, i2) : tint(c, i2)));
    }
  if (mk === 'hood') {
    shape([[hb.cx - 2, hb.y0], [hb.cx + 2, hb.y0], [hb.cx + (side ? -1 : 0), hb.y0 - 3]], (x) => (x < hb.cx ? mr.m : mr.d1));
    rect(hb.cx - hb.w / 2 - 1, hb.y0 + hb.h - 2, hb.w + 2, 3, (x, y) => (y === Math.round(hb.y0 + hb.h) ? mr.d2 : (x * 3) % 5 === 0 ? mr.d1 : mr.m));
  }
  if (back) return;
  if (mk === 'moth') {
    layer({ flat: true });
    for (const s of side ? [1] : [-1, 1]) {
      const bx = hb.cx + s * 2 + (side ? 1 : 0);
      dline(bx, hb.y0, bx + s * 2, hb.y0 - 4, mr.d1);
      dpx(bx + s * 3, hb.y0 - 4, mr.d1);
      dpx(bx + s, hb.y0 - 3, mr.d1);
    }
    for (const e of eyes) {
      drect(e, ey - 1, 2, 2, '#e8343c');
      dpx(e, ey - 1, '#ffb0a0');
    }
    return;
  }
  if (mk === 'hood') {
    for (const e of eyes) {
      drect(e, ey, 2, 1, INK);
      dpx(e + 1, ey, '#fff6ea');
    }
    return;
  }
  // Luchador / half: trimmed eye holes and (luchador) mouth hole.
  for (const e of eyes) {
    for (let yy = ey - 1; yy <= ey + 2; yy++) for (let xx = e - 1; xx <= e + 2; xx++) if (inHead(hb, xx, yy)) P(xx, yy, pt(yy === ey - 1 || xx === e - 1 ? tint(ma, 1) : tint(ma, -1)));
    drect(e, ey, 2, 2, EYE_WHITE);
  }
  if (mk === 'luchador') {
    const mx = side ? hb.x0 + hb.w - 3 : Math.floor(hb.cx) - 1;
    const mw = side ? 3 : hb.w % 2 === 0 ? 4 : 3;
    rect(mx - 1, hb.mY - 1, mw + 2, 3, (x, y) => (y === hb.mY - 1 ? tint(ma, 1) : y === hb.mY + 1 ? tint(ma, -1) : x === mx - 1 ? tint(ma, 0) : x === mx + mw ? tint(ma, -1) : B.skinR.m));
    if (B.look.maskPattern === 'fangs') {
      dpx(mx, hb.mY + 1, TOOTH);
      dpx(mx + mw - 1, hb.mY + 1, TOOTH);
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
  for (const e of B.look.extras ?? []) {
    if (EXTRA_SLOT[e.id] !== 'head') continue;
    const c = e.color;
    const a = e.accent ?? (shA(c, 0.3) as unknown as string);
    const cr = ramp(c, 'cloth');
    layer({ sh: 0.3, hl: 0, cast: true, aa: false });
    // Crown of a hat: lit on the left, shadow on the right, band row darker.
    const crownPaint = (x0: number, w: number) => (x: number, y: number): Color => {
      const t = ((x + 0.5 - x0) / w) * 2 - 1;
      return toneAt(cr, y === Math.round(top - 3) ? 1 : toneIdx(formV(t, 0, { x: 1, y: 0 }, { x: 0, y: -1 }), w >= 5));
    };
    const crown = (h: number, w = W - 2) => {
      const x0 = cx - w / 2 + (side ? -0.5 : 0);
      rect(x0, top - h + 1, w, h + 1, crownPaint(x0, w));
    };
    switch (e.id) {
      case 'hat':
        crown(4, W - 3);
        rect(cx - W / 2 - 2 + (side ? 1 : 0), top + 1, W + 4, 1, (x) => (x > cx + 1 ? cr.d1 : cr.m));
        rect(cx - (W - 3) / 2 + (side ? -0.5 : 0), top, W - 3, 1, tint(a, 0));
        break;
      case 'cowboy-hat':
        crown(4, W - 4);
        px(cx + (side ? -0.5 : 0) - 0.5, top - 3, cr.d1);
        rect(cx - W / 2 - 3, top + 1, W + 6, 1, (x) => (x > cx + 2 ? cr.d1 : x < cx - 2 ? cr.l1 : cr.m));
        if (!side) {
          px(cx - W / 2 - 3, top, cr.l1);
          px(cx + W / 2 + 2, top, cr.m);
        }
        rect(cx - (W - 4) / 2 + (side ? -0.5 : 0), top, W - 4, 1, tint(a, 0, 'leather'));
        break;
      case 'sheriff-hat':
        crown(4, W - 4);
        rect(cx - W / 2 - 3, top + 1, W + 6, 1, (x) => (x > cx + 2 ? cr.d1 : cr.m));
        px(cx - 0.5, top - 4, cr.d1);
        rect(cx - (W - 4) / 2, top, W - 4, 1, tint(a, 0, 'leather'));
        break;
      case 'cap':
        for (let y = top - 1; y < top + 4; y++) for (let x = hb.x0 - 1; x <= hb.x0 + W; x++) if (inHead(hb, x, y, 0.8)) P(x, y, pt(toneAt(cr, y === top - 1 ? 1 : x > cx + 1 ? -1 : 0)));
        px(cx - 0.5, top - 1.5, cr.d1);
        if (side) rect(hb.x0 + W - 1, top + 3, 4, 1, (x) => tint(a, x === hb.x0 + W + 2 ? -1 : 0));
        else if (!back) rect(cx - 3, top + 3, 6, 1, (x) => tint(a, x > cx ? -1 : 0));
        break;
      case 'beanie':
        for (let y = top - 2; y < top + 5; y++) for (let x = hb.x0 - 1; x <= hb.x0 + W; x++) if (inHead(hb, x, y, 1)) P(x, y, pt(y >= top + 3 ? tint(a, (x & 1) ? -1 : 0) : toneAt(cr, y === top - 2 ? 1 : x > cx + 1 ? -1 : (x + y) % 3 === 0 ? -1 : 0)));
        oval(cx + (side ? -1 : 0), top - 2.5, 1.5, 1.5, (_x, y) => tint(a, y < top - 2.5 ? 1 : 0));
        break;
      case 'bucket-hat':
        crown(3, W - 2);
        rect(cx - W / 2 - 1, top + 1, W + 2, 2, (x, y) => toneAt(cr, y === Math.round(top + 2) ? -1 : x > cx + 2 ? -1 : 0));
        rect(cx - W / 2 - 1, top + 1, W + 2, 1, tint(a, 0));
        break;
      case 'hunting-cap':
        for (let y = top - 1; y < top + 4; y++) for (let x = hb.x0 - 1; x <= hb.x0 + W; x++) if (inHead(hb, x, y, 0.8)) P(x, y, pt(tint(pattern('plaid', x, y, c, a), x > cx + 1 ? -1 : 0)));
        if (side) rect(hb.cx - 2, top + 3, 3, 4, (_x, y) => toneAt(cr, y === Math.round(top + 6) ? -1 : 0));
        else {
          rect(hb.x0 - 1, top + 3, 2, 4, (_x, y) => toneAt(cr, y === Math.round(top + 6) ? -1 : 0));
          rect(hb.x0 + W - 1, top + 3, 2, 4, (_x, y) => toneAt(cr, y === Math.round(top + 6) ? -2 : -1));
          if (!back) rect(cx - 3, top + 3, 6, 1, cr.d1);
        }
        break;
      case 'chef-hat':
        oval(cx + (side ? -1 : 0), top - 2.5, 3.2, 2.6, (x, y) => toneAt(cr, y < top - 3 ? 1 : x > cx + 1 ? -1 : (x * 3 + y) % 4 === 0 ? 1 : 0));
        rect(cx - 2.5 + (side ? -1 : 0), top - 1, 5, 2, (_x, y) => toneAt(cr, y === Math.round(top) ? -1 : 0));
        break;
      case 'mortarboard':
        crown(2, W - 4);
        rect(cx - W / 2 - 1, top - 1, W + 2, 1, (x) => toneAt(cr, x < cx ? 1 : 0));
        dline(cx + W / 2, top - 1, cx + W / 2 + 1, top + 3, tint(a, 0));
        break;
      case 'crown':
        rect(cx - 3, top - 1, 6, 2, (x, y) => tint(c, y === Math.round(top - 1) ? 1 : x > cx + 1 ? -1 : 0, 'metal'));
        for (const dx of [-3, -0.5, 2]) px(cx + dx, top - 2, tint(c, dx < 0 ? 2 : 0, 'metal'));
        if (!back) dpx(cx - 0.5, top, '#e8343c');
        break;
      case 'headband':
        for (let x = hb.x0 - 1; x <= hb.x0 + W; x++) {
          const y = Math.round(top + hb.h * 0.3);
          if (inHead(hb, x, y, 0.8)) P(x, y, pt(toneAt(cr, x > cx + 1 ? -1 : 0)));
        }
        if (side) rect(hb.x0 - 2, top + hb.h * 0.3, 2, 3 + B.sway, cr.d1);
        break;
      case 'headwrap':
        oval(cx + (side ? -1 : 0), top + 0.5, W / 2 + 1, hb.h * 0.42, (x, y) => toneAt(cr, toneIdx(formV(((x + 0.5 - cx) / (W / 2 + 1)), ((top + 0.5 - y) / (hb.h * 0.42)), { x: 1, y: 0 }, { x: 0, y: -1 }), true)));
        oval(cx + (side ? -2 : 0), top - 2, W / 2 - 1, 2.5, (x, y) => toneAt(cr, y < top - 2 ? 1 : x > cx ? -1 : 0));
        if (!back) rect(cx - 1, top - 1, 2, 2, (x) => tint(a, x < cx ? 1 : 0));
        break;
      case 'head-bandana':
        for (let y = top - 1; y < top + 3; y++) for (let x = hb.x0 - 1; x <= hb.x0 + W; x++) if (inHead(hb, x, y, 0.8)) P(x, y, pt(tint(pattern('stars', x, y, c, a), x > cx + 1 ? -1 : 0)));
        if (side) rect(hb.x0 - 2, top + 2, 2, 3 + B.sway, cr.d1);
        break;
      case 'headset':
        layer({ flat: true });
        for (let x = hb.x0; x < hb.x0 + W; x++) if (inHead(hb, x, top - 0.6, 0.9) && !inHead(hb, x, top - 1.6, 0.9)) px(x, top - 1, c);
        if (!back) dline(side ? hb.cx - 1 : hb.x0 - 1, hb.eyeY + 1, side ? hb.x0 + W - 2 : hb.cx - 2, hb.mY, c);
        break;
      case 'headlamp':
        for (let x = hb.x0 - 1; x <= hb.x0 + W; x++) if (inHead(hb, x, top + 2, 0.8)) px(x, top + 2, c);
        if (!back) {
          layer({ flat: true });
          rect(side ? hb.x0 + W - 1 : cx - 1, top + 1, 2, 2, '#4a4a5a');
          dpx(side ? hb.x0 + W : cx - 0.5, top + 1, a);
        }
        break;
      case 'flower':
        layer({ flat: true });
        rect(hb.x0 + W - 3, top + 1, 2, 2, c);
        dpx(hb.x0 + W - 2, top + 1, '#ffe48e');
        break;
      case 'pencil-ear':
        if (back) break;
        layer({ flat: false });
        dline(side ? hb.cx - 2 : hb.x0 + W, hb.eyeY - 3, side ? hb.cx : hb.x0 + W + 1, hb.eyeY, c);
        dpx(side ? hb.cx - 2 : hb.x0 + W, hb.eyeY - 3, '#e88a9a');
        break;
      case 'safety-glasses':
        rect(hb.x0, top + 1, W, 1, tint(a, 0));
        if (!back) rect(side ? hb.x0 + W - 3 : cx - 3, top + 1, side ? 3 : 6, 2, (x, y) => (y === Math.round(top + 1) && x < cx ? mixc(c, '#ffffff', 0.7) : mixc(c, '#ffffff', 0.4)));
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
    const box = (x0: number, round: boolean, cat: boolean, half: boolean) => {
      for (let y = ey - 1; y <= ey + 2; y++)
        for (let x = x0; x < x0 + 4; x++) {
          const edge = y === ey - 1 || y === ey + 2 || x === x0 || x === x0 + 3;
          const corner = (x === x0 || x === x0 + 3) && (y === ey - 1 || y === ey + 2);
          if (round && corner) continue;
          if (half && y === ey - 1) continue;
          if (edge) dpx(x, y, y === ey - 1 || x === x0 ? frameL : frame);
          else if (lens) dpx(x, y, (x + y) % 3 === 0 ? liA(lens, 0.5) : lens);
        }
      if (cat) {
        dpx(x0 - 1, ey - 2, frame);
        dpx(x0 + 4, ey - 2, frame);
      }
    };
    if (e.id === 'eyepatch') {
      if (side) dline(hb.x0 + 2, hb.y0 + 2, hb.eS, ey, INK);
      else {
        dline(hb.x0, hb.y0 + 3, hb.eR + 2, ey - 1, INK);
        drect(hb.eR - 1, ey - 1, 3, 3, INK);
      }
      continue;
    }
    if (side) {
      for (let y = ey - 1; y <= ey + 2; y++) {
        dpx(hb.eS - 1, y, frame);
        dpx(hb.eS + 2, y, frame);
      }
      dpx(hb.eS, ey - 1, frameL);
      dpx(hb.eS + 1, ey - 1, frameL);
      dpx(hb.eS, ey + 2, frame);
      dpx(hb.eS + 1, ey + 2, frame);
      if (lens) drect(hb.eS, ey, 2, 2, lens);
      dline(hb.eS - 2, ey, hb.cx - 1, ey, frame);
      continue;
    }
    const round = e.id === 'round-glasses' || e.id === 'aviators';
    box(hb.eL - 1, round, e.id === 'cateye', e.id === 'halfmoon');
    box(hb.eR - 1, round, e.id === 'cateye', e.id === 'halfmoon');
    for (let x = hb.eL + 3; x < hb.eR - 1; x++) dpx(x, ey, frame);
    if (!lens) {
      dpx(hb.eL, ey, '#e6f0ee');
      dpx(hb.eR, ey, '#e6f0ee');
    }
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
    oval(ex0, ey0, 2.3, 2.3, (x, y) => toneAt(fur, toneIdx(formV(((x + 0.5 - ex0) / 2.3), ((ey0 - y - 0.5) / 2.3), { x: 1, y: 0 }, { x: 0, y: -1 }), false)));
    px(ex0 - 0.5, ey0, inner);
  };
  if (hb.view !== 'side') {
    ear(hb.x0 + 1.5, hb.y0 + 1);
    ear(hb.x0 + hb.w - 1.5, hb.y0 + 1);
  } else ear(hb.cx - 1, hb.y0 + 0.5);
  drawHead(hb);
  if (hb.view === 'back') return;
  if (hb.view === 'front') {
    oval(hb.cx, hb.mY + 0.5, 2.8, 2, (x, y) => toneAt(muz, y > hb.mY + 1 ? -1 : x < hb.cx - 1 ? 1 : 0));
    drect(hb.cx - 1, hb.mY - 0.5, 2, 1, INK);
    dpx(hb.cx - 1, hb.mY - 0.5, '#5a4a60');
    if (expr === 'yell' || expr === 'happy' || expr === 'pain' || expr === 'grin') drect(hb.cx - 0.5, hb.mY + 1, 1, 1, LIP_DARK);
    for (const e of [hb.eL, hb.eR]) {
      if (blink || expr === 'happy' || expr === 'closed' || expr === 'grin') drect(e, hb.eyeY + 1, 2, 1, INK);
      else {
        dpx(e, hb.eyeY, EYE_SHINE);
        dpx(e + 1, hb.eyeY, INK);
        dpx(e, hb.eyeY + 1, INK);
        dpx(e + 1, hb.eyeY + 1, INK);
      }
    }
    dpx(hb.eL - 1, hb.eyeY + 2, mixc(fur.m, BLUSH, 0.4));
    dpx(hb.eR + 2, hb.eyeY + 2, mixc(fur.m, BLUSH, 0.4));
  } else {
    layer({ sh: 0.3 });
    oval(hb.x0 + hb.w, hb.mY, 2.5, 1.8, (_x, y) => toneAt(muz, y > hb.mY ? -1 : 0));
    dpx(hb.x0 + hb.w + 2, hb.mY - 1, INK);
    dpx(hb.eS, hb.eyeY, blink ? fur.d1 : EYE_SHINE);
    dpx(hb.eS + 1, hb.eyeY + (blink ? 1 : 0), INK);
    if (!blink) dpx(hb.eS, hb.eyeY + 1, INK);
  }
}

export { hairSpec, HAIR };
export type { HairSpec };
export { dk };
