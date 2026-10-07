import { dth, hash2, liA, mixc, mkSpr, P, shA, toCanvas, VG, type Color } from '../kit';
import { EXTRA_SLOT, type Look } from '../look';
import { metrics, solve, type PoseDef } from './body';
import { B, makeBC, pattern, torsoFront } from './garments';
import { hairSpec, type HairSpec } from './head';
import { BLUSH, EYE_SHINE, EYE_WHITE, INK, LIP, LIP_DARK, ramp, tint, TONGUE, TOOTH, toneAt, type Ramp } from './palette';
import { beginLayers, clamp, crop, dline, dpx, drect, finish, layer, lightPass, line, oval, px, pt, rect, setLight, shape, toneIdx, formV } from './raster';

/**
 * Painterly bust portraits for the dialogue boxes, drawn natively at the
 * requested size (designed at 64 px; u scales everything). Each expression
 * reshapes the brows, eyes and mouth; the skin, hair and cloth are painted
 * from hue-shifted ramps with a top-left key light and a cool bounce below.
 */
export type Expression = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'smug' | 'love';

const PORTRAIT_BG = ['#f7cf98', '#f2b28e', '#e2989a', '#b98aa8'];

interface PF {
  u: number;
  S: number;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  eyeY: number;
  eyeL: number;
  eyeR: number;
  eW: number;
  eH: number;
  mouthY: number;
  chin: number;
  neckY: number;
  expr: Expression;
  look: Look;
  sk: Ramp;
  hr: Ramp;
  masked: boolean;
  faceFree: boolean;
}

const LAT = { x: 1, y: 0 };
const UP = { x: 0, y: -1 };

function inFace(f: PF, x: number, y: number, grow = 0): boolean {
  const shapeId = f.look.head;
  const rx = f.rx + grow;
  const ry = f.ry + grow;
  const dx = (x + 0.5 - f.cx) / rx;
  const dy = (y + 0.5 - f.cy) / ry;
  if (shapeId === 'square' || shapeId === 'wide') {
    const r = shapeId === 'wide' ? 0.6 : 0.48;
    const ax = Math.max(0, Math.abs(dx) - (1 - r)) / r;
    const ay = Math.max(0, Math.abs(dy) - (1 - r)) / r;
    return ax * ax + ay * ay <= 1;
  }
  if (shapeId === 'heart' && dy > 0.2) return dx * dx * (1 + (dy - 0.2) * 1.5) + dy * dy <= 1;
  if (shapeId === 'long') return dx * dx * (dy > 0.3 ? 1.15 : 1) + dy * dy <= 1;
  // Round: a touch of jaw.
  if (dy > 0.45) return dx * dx * (1 + (dy - 0.45) * 0.5) + dy * dy <= 1;
  return dx * dx + dy * dy <= 1;
}

function facePaint(f: PF, grow: number, c: (x: number, y: number) => Color | null): void {
  for (let y = Math.floor(f.cy - f.ry - grow - 1); y <= Math.ceil(f.cy + f.ry + grow); y++)
    for (let x = Math.floor(f.cx - f.rx - grow - 1); x <= Math.ceil(f.cx + f.rx + grow); x++) if (inFace(f, x, y, grow)) P(x, y, pt(c));
}

/** Sphere-lit skin with dithered tone boundaries for a painterly feel. */
function skinAt(f: PF, x: number, y: number, r: Ramp, flat = 0): number {
  const dx = (x + 0.5 - f.cx) / f.rx;
  const dy = (y + 0.5 - f.cy) / f.ry;
  const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
  let v = dx * -0.62 * 0.9 + dy * -0.78 * 0.75 + nz * 0.55 - 0.2;
  // Keep the face plane in the mid tone; let the jaw and the far cheek turn away.
  if (Math.abs(dx) < 0.68 && dy > -0.6 && dy < 0.6 && v < -0.05) v = -0.05;
  if (dy > 0.72) v -= (dy - 0.72) * 1.4; // under the chin
  if (dx > 0.55 && dy > 0.1) v -= (dx - 0.55) * 0.8; // shadow cheek
  v += flat;
  // Dither across the tone boundaries.
  const band = v < -0.62 ? -2 : v < -0.18 ? -1 : v < 0.42 ? 0 : v < 0.8 ? 1 : 2;
  const edges = [-0.62, -0.18, 0.42, 0.8];
  for (const e of edges) {
    const d = v - e;
    if (Math.abs(d) < 0.07 && dth(x, y, 8)) return toneAt(r, band + (d < 0 ? 1 : -1));
  }
  return toneAt(r, band);
}

function drawPortraitBody(f: PF): void {
  const u = f.u;
  const L = f.look;
  const S = f.S;
  const m = B.m;
  const H = m.torsoH;
  const shoulderW = { petite: 24, lean: 26, athletic: 30, stocky: 34, heavy: 36, giant: 40 }[L.body] ?? 30;
  const hw0 = (shoulderW / 2) * u;
  const topY = f.neckY;
  layer({ sh: 0.28, hl: 0.1 });
  const scale = (hw0 / (m.shW / 2)) * 0.95;
  for (let y = Math.round(topY); y < S; y++) {
    const t = clamp((y - topY) / (10 * u), 0, 1);
    const hw = hw0 * (0.55 + 0.45 * Math.sqrt(t)) + (m.belly ? t * u : 0);
    for (let x = Math.round(f.cx - hw); x < Math.round(f.cx + hw); x++) {
      const lx = (x + 0.5 - f.cx) / scale;
      const ly = H - (y - topY) / scale;
      const base = torsoFront(lx, Math.max(ly, B.bot.wb + 0.6), hw / scale, false);
      const v = formV((x + 0.5 - f.cx) / hw, 1 - t * 2, LAT, UP);
      let idx = toneIdx(v, true);
      // Cloth folds radiating from the armpits.
      const fold = Math.abs(Math.abs(x + 0.5 - f.cx) - hw * (0.45 + t * 0.3));
      if (fold < 0.6 * u && t > 0.25 && L.top !== 'none') idx -= 1;
      if (dth(x, y, 6) && v > 0.35 && idx === 0) idx = 1;
      P(x, y, pt(tint(base, idx, B.top.kind ?? 'cloth')));
    }
  }
}

function drawNeck(f: PF): void {
  const u = f.u;
  const high = B.top.neck === 'high';
  const r = high ? ramp(f.look.topColor, 'cloth') : f.sk;
  layer({ sh: 0.34, aa: false });
  const nw = Math.round(f.rx * 0.62);
  const x0 = Math.round(f.cx - nw / 2);
  const y0 = Math.round(f.chin - 2 * u);
  const y1 = Math.round(f.neckY + 2 * u);
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x0 + nw; x++) {
      const t = ((x + 0.5 - f.cx) / (nw / 2));
      let idx = toneIdx(formV(t, 0, LAT, UP), true) - 1;
      if (y < f.chin + 2.5 * u) idx = Math.min(idx, -2 + (y < f.chin + 1.2 * u ? 0 : 1));
      if (!high && y === y0 + Math.round(5 * u) && Math.abs(t) < 0.4) idx = Math.max(idx, 0);
      P(x, y, pt(toneAt(r, Math.max(-2, idx))));
    }
}

function drawEars(f: PF): void {
  const u = f.u;
  layer({ sh: 0.3, aa: true });
  const ey = f.eyeY + 1.5 * u;
  const cauli = f.look.features?.includes('cauliflower');
  for (const s of [-1, 1]) {
    const ex = f.cx + s * (f.rx + 0.4 * u);
    oval(ex, ey, 2.2 * u + (cauli && s < 0 ? u * 0.6 : 0), 3.4 * u, (x, y) => toneAt(f.sk, s < 0 ? (x < ex - u ? 1 : 0) : y > ey ? -1 : 0));
    oval(ex + s * 0.2 * u, ey + 0.3 * u, 1.1 * u, 1.8 * u, toneAt(f.sk, s < 0 ? -1 : -2));
    if (f.look.features?.includes('earring')) {
      dpx(ex, ey + 3.2 * u, '#ffd84a');
      dpx(ex, ey + 4 * u, '#ffe48e');
    }
  }
}

function drawHeadSkin(f: PF): void {
  layer({ sh: 0.3, hl: 0 });
  facePaint(f, 0, (x, y) => skinAt(f, x, y, f.sk));
  // Nose: bridge light, side shadow and nostrils.
  const u = f.u;
  const nx = f.cx;
  const ny0 = f.eyeY + 1 * u;
  const ny1 = f.eyeY + 7 * u;
  if (f.faceFree) {
    for (let y = Math.round(ny0); y < Math.round(ny1); y++) {
      P(Math.round(nx - 1), y, pt(toneAt(f.sk, 1)));
      P(Math.round(nx + 1.2 * u), y, pt(toneAt(f.sk, y > ny1 - 2 * u ? -2 : -1)));
    }
    P(Math.round(nx - 2.2 * u), Math.round(ny1), pt(toneAt(f.sk, -1)));
    P(Math.round(nx + 2.2 * u), Math.round(ny1), pt(toneAt(f.sk, -2)));
    P(Math.round(nx + 1.2 * u), Math.round(ny1 + u * 0.6), pt(toneAt(f.sk, -1)));
    rect(nx - 1.2 * u, ny1 + 0.6 * u, 2.4 * u, 1, toneAt(f.sk, -1));
  }
}

function drawCheeks(f: PF): void {
  const u = f.u;
  const L = f.look;
  const beardy = /beard|square|wild/.test(L.facial);
  if (!f.faceFree || beardy) return;
  const strong = f.expr === 'love' || L.features?.includes('blush');
  const bl = mixc(f.sk.m, BLUSH, strong ? 0.75 : 0.45);
  const bl2 = mixc(f.sk.m, BLUSH, strong ? 0.5 : 0.25);
  for (const s of [-1, 1]) {
    const cx = f.cx + s * 7.5 * u;
    const cy = f.eyeY + 5.5 * u;
    for (let y = Math.round(cy - 2 * u); y <= Math.round(cy + 2 * u); y++)
      for (let x = Math.round(cx - 3.5 * u); x <= Math.round(cx + 3.5 * u); x++) {
        const d = ((x + 0.5 - cx) / (3.5 * u)) ** 2 + ((y + 0.5 - cy) / (2 * u)) ** 2;
        if (d > 1 || !inFace(f, x, y)) continue;
        if (d < 0.45) dpx(x, y, dth(x, y, 10) ? bl : bl2);
        else if (dth(x, y, 5)) dpx(x, y, bl2);
      }
  }
  if (L.features?.includes('freckles')) {
    const fc = shA(mixc(f.sk.m, '#c87a4a', 0.55), 0.1);
    for (let i = 0; i < 14; i++) {
      const s = i < 7 ? -1 : 1;
      const h = hash2(i, 3, 5);
      const h2 = hash2(i, 9, 5);
      dpx(f.cx + s * (4 + h * 7) * u, f.eyeY + (3.5 + h2 * 4) * u, fc);
    }
  }
  if (f.look.age === 'elder') {
    // Laugh lines and a soft crease under each eye.
    for (const s of [-1, 1]) {
      const ex = f.cx + s * 7 * u;
      dline(ex + s * 4 * u, f.eyeY + 2.5 * u, ex + s * 5 * u, f.eyeY + 5.5 * u, toneAt(f.sk, -1));
      dline(ex - s * 2 * u, f.eyeY + 3 * u, ex + s * 2 * u, f.eyeY + 3.2 * u, toneAt(f.sk, -1));
    }
  }
}

/** The eyes: almond sclera, a two-tone iris, pupil, shine and lids. */
function drawEyes(f: PF): void {
  const u = f.u;
  const L = f.look;
  const expr = f.expr;
  const shades = B.ex.has('sunglasses');
  if (shades) return;
  const iris = mixc(INK, L.eyeColor, 0.6);
  const iris2 = L.eyeColor2 ? mixc(INK, L.eyeColor2, 0.6) : iris;
  const style = L.eyes;
  layer({ flat: true });
  for (const s of [-1, 1]) {
    const ex = s < 0 ? f.eyeL : f.eyeR;
    const ey = f.eyeY;
    const ic = s < 0 ? iris : iris2;
    const eW = f.eW;
    const eH = f.eH;
    const lidC = toneAt(f.sk, -2);
    const closedHappy = expr === 'happy' || style === 'happy';
    const squint = expr === 'angry' || style === 'sharp' || style === 'sleepy' || expr === 'smug';
    const wide = expr === 'surprised' || style === 'wide';
    if (expr === 'love') {
      // Heart eyes.
      const hc = '#e2445c';
      const hx = ex;
      const hy = ey;
      for (let dy = -2; dy <= 3; dy++)
        for (let dx = -3; dx <= 3; dx++) {
          const ax = Math.abs(dx);
          const inside = (dy <= 0 && ax <= 3 && !(dy === -2 && (ax === 0 || ax === 3)) && !(dy === -1 && ax === 3 && false)) || (dy === 1 && ax <= 2) || (dy === 2 && ax <= 1) || (dy === 3 && ax === 0);
          if (dy === -2 && ax > 2) continue;
          if (inside) drect(hx + dx * u, hy + dy * u, u, u, dx === -2 && dy === -1 ? '#ffb0c0' : hc);
        }
      continue;
    }
    if (closedHappy) {
      // A happy arc: the lid curves up.
      for (let i = 0; i <= eW; i++) {
        const t = i / eW;
        const yy = ey - Math.sin(t * Math.PI) * 2.2 * u + 1 * u;
        drect(ex - eW / 2 + i, yy, 1, Math.max(1, Math.round(u)), INK);
      }
      dpx(ex - eW / 2 - 1, ey + 1.2 * u, lidC);
      dpx(ex + eW / 2 + 1, ey + 1.2 * u, lidC);
      continue;
    }
    // Open eye shape: an almond with its upper edge heavier.
    const h = wide ? eH + 1.4 * u : squint ? eH - 1.2 * u : eH;
    const yc = ey + (squint ? 0.4 * u : 0);
    const inEye = (x: number, y: number) => {
      const dx = (x + 0.5 - ex) / (eW / 2);
      const dy = (y + 0.5 - yc) / (h / 2);
      // Upper lid is flatter than the lower curve.
      const k = dy < 0 ? 1.15 : 1;
      return dx * dx + (dy * k) ** 2 <= 1;
    };
    for (let y = Math.floor(yc - h / 2) - 1; y <= Math.ceil(yc + h / 2) + 1; y++)
      for (let x = Math.floor(ex - eW / 2) - 1; x <= Math.ceil(ex + eW / 2) + 1; x++) {
        if (!inEye(x, y)) continue;
        const top = !inEye(x, y - 1);
        const bot = !inEye(x, y + 1);
        if (top) {
          dpx(x, y, INK);
          if (u >= 0.9 && !inEye(x, y - 2) && Math.abs(x + 0.5 - ex) < eW * 0.35) dpx(x, y + 1, INK);
        } else if (bot) dpx(x, y, toneAt(f.sk, -1));
        else dpx(x, y, y < yc - h * 0.25 ? mixc(EYE_WHITE, toneAt(f.sk, -1), 0.3) : EYE_WHITE);
      }
    // Iris and pupil.
    const look = expr === 'smug' ? s * 0.6 * u : expr === 'sad' ? 0 : 0;
    const ix = ex + look;
    const iy = yc + (expr === 'sad' ? 0.6 * u : squint ? 0.2 * u : 0);
    const ir = (wide ? 2.6 : 2.3) * u;
    oval(ix, iy, ir, ir, (x, y) => {
      if (!inEye(x, y)) return null;
      const d = Math.hypot(x + 0.5 - ix, y + 0.5 - iy) / ir;
      if (d > 0.8) return shA(ic, 0.35);
      return y > iy ? liA(ic, 0.12) : ic;
    });
    drect(ix - 0.6 * u, iy - 0.6 * u, Math.max(1, Math.round(1.4 * u)), Math.max(1, Math.round(1.4 * u)), INK);
    const sh = Math.max(1, Math.round(u));
    drect(ix - 1.6 * u, iy - 1.6 * u, sh, sh, EYE_SHINE);
    if (u >= 0.9) dpx(ix + 1.2 * u, iy + 1.2 * u, liA(ic, 0.55));
    // Lid line over the iris on heavy lids.
    if (squint) drect(ex - eW / 2, yc - h / 2 + 1, eW, 1, INK);
    // Lashes.
    if (style === 'lashes' || style === 'wide') {
      dpx(ex + s * (eW / 2 + 1), yc - h / 2 - 0.5 * u, INK);
      dpx(ex + s * (eW / 2 + 0.5), yc - h / 2 - 1.3 * u, INK);
      if (style === 'lashes') dpx(ex + s * (eW / 2 - 1), yc - h / 2 - 1.3 * u, INK);
    }
    // Tears.
    if (expr === 'sad') {
      dpx(ex + s * (eW / 2 - 0.5), yc + h / 2 + 1, '#9ad0f0');
      dpx(ex + s * (eW / 2 - 0.5), yc + h / 2 + 2, '#cfe8f8');
      dpx(ex + s * (eW / 2 - 0.5), yc + h / 2 + 3 * u, '#9ad0f0');
    }
  }
}

function drawBrows(f: PF): void {
  const u = f.u;
  const L = f.look;
  const expr = f.expr;
  const bald = L.hair === 'bald' || L.hair === 'buzz';
  const bc = bald ? toneAt(f.sk, -2) : toneAt(f.hr, L.hairColor === '#f4f4f4' || L.hairColor === '#dcdae6' ? 0 : -1);
  const bc2 = bald ? toneAt(f.sk, -1) : toneAt(f.hr, 0);
  layer({ flat: true });
  const thick = Math.max(1, Math.round(1.6 * u));
  for (const s of [-1, 1]) {
    const ex = s < 0 ? f.eyeL : f.eyeR;
    const by = f.eyeY - 5 * u;
    const w = f.eW + 2 * u;
    for (let i = 0; i <= w; i++) {
      const t = i / w;
      const inner = s < 0 ? t : 1 - t; // 1 at the nose side
      let dy = -Math.sin(t * Math.PI) * 1.2 * u; // natural arch
      switch (expr) {
        case 'angry':
          dy = inner * 3.2 * u - 1 * u;
          break;
        case 'sad':
          dy = -inner * 2.6 * u + 1.2 * u;
          break;
        case 'surprised':
          dy -= 2.2 * u;
          break;
        case 'smug':
          dy += s > 0 ? -2 * u + inner * 1.2 * u : 0.6 * u;
          break;
        case 'happy':
        case 'love':
          dy -= 1 * u;
          break;
      }
      if (L.eyes === 'sharp' && expr === 'neutral') dy += inner * 1.6 * u - 0.6 * u;
      const x = ex - w / 2 + i;
      const y = by + dy;
      drect(x, y, 1, thick, t > 0.75 ? bc2 : bc);
    }
  }
  if (L.features?.includes('scar-brow')) {
    const ex = f.eyeR;
    dline(ex + 1 * u, f.eyeY - 8 * u, ex + 2.5 * u, f.eyeY - 3 * u, toneAt(f.sk, 2));
    dline(ex + 2 * u, f.eyeY - 8 * u, ex + 3.5 * u, f.eyeY - 3 * u, toneAt(f.sk, -1));
  }
}

function drawMouth(f: PF): void {
  const u = f.u;
  const L = f.look;
  const expr = f.expr;
  if (L.facial === 'walrus') return;
  const mx = f.cx;
  const my = f.mouthY;
  const w = Math.round(9 * u);
  const x0 = Math.round(mx - w / 2);
  const lipDark = tint(LIP_DARK, 0);
  const lipLine = (dy: (t: number) => number, c: Color, thick = 1) => {
    for (let i = 0; i < w; i++) drect(x0 + i, my + dy(i / (w - 1)), 1, thick, c);
  };
  layer({ flat: true });
  const braces = L.features?.includes('braces');
  const gap = L.features?.includes('gap-tooth');
  switch (expr) {
    case 'happy':
    case 'love': {
      // Wide open smile with teeth and a tongue.
      for (let i = 0; i < w; i++) {
        const t = i / (w - 1);
        const top = my - Math.sin(t * Math.PI) * 0.8 * u;
        const bot = my + Math.sin(t * Math.PI) * 3.6 * u;
        for (let y = Math.round(top); y <= Math.round(bot); y++) {
          let c: Color = lipDark;
          if (y === Math.round(top)) c = LIP;
          else if (y < top + 2 * u) c = braces ? ((i & 1) ? '#dcdae6' : '#b8b8c4') : gap && i === Math.floor(w / 2) ? lipDark : TOOTH;
          else if (y > bot - 1.5 * u && Math.abs(t - 0.5) < 0.3) c = TONGUE;
          drect(x0 + i, y, 1, 1, c);
        }
      }
      dpx(x0 - 1, my - 0.5 * u, LIP);
      dpx(x0 + w, my - 0.5 * u, LIP);
      dpx(x0 - 1, my + 1, toneAt(f.sk, -1));
      dpx(x0 + w, my + 1, toneAt(f.sk, -1));
      break;
    }
    case 'sad':
      lipLine((t) => Math.sin(t * Math.PI) * -1.8 * u + 1.6 * u, LIP, Math.max(1, Math.round(u)));
      dpx(x0, my + 2 * u, toneAt(f.sk, -1));
      dpx(x0 + w - 1, my + 2 * u, toneAt(f.sk, -1));
      // A little trembling lower lip.
      drect(mx - 2 * u, my + 2.4 * u, 4 * u, 1, mixc(f.sk.m, LIP, 0.4));
      break;
    case 'angry':
      // Gritted teeth.
      for (let i = 0; i < w; i++) {
        drect(x0 + i, my - 0.5 * u, 1, 1, lipDark);
        drect(x0 + i, my + 0.5 * u, 1, Math.max(1, Math.round(1.6 * u)), (i + 1) % 3 === 0 ? '#e0d8d0' : TOOTH);
        drect(x0 + i, my + 2.2 * u, 1, 1, lipDark);
      }
      dpx(x0 - 1, my + 0.5 * u, lipDark);
      dpx(x0 + w, my + 0.5 * u, lipDark);
      break;
    case 'surprised':
      oval(mx, my + 1.2 * u, 2.2 * u, 2.8 * u, (_x, y) => (y > my + 2.6 * u ? TONGUE : lipDark));
      oval(mx, my + 1.2 * u, 2.8 * u, 3.4 * u, (x, y) => (Math.hypot((x + 0.5 - mx) / (2.2 * u), (y + 0.5 - my - 1.2 * u) / (2.8 * u)) > 1 ? LIP : null));
      break;
    case 'smug': {
      // Smirk: flat on the left, curled up on the right.
      for (let i = 0; i < w; i++) {
        const t = i / (w - 1);
        const dy = t > 0.6 ? -(t - 0.6) * 5 * u : 0;
        drect(x0 + i, my + dy, 1, 1, LIP);
      }
      dpx(x0 + w, my - 2.2 * u, LIP);
      drect(x0 + 1, my + 1, w - 3, 1, mixc(f.sk.m, LIP, 0.35));
      break;
    }
    default: {
      // Soft closed smile: a dark line, lighter lower lip, corner dimples.
      lipLine((t) => -Math.sin(t * Math.PI) * 0.6 * u + 0.4 * u, LIP, 1);
      drect(x0 + 1, my + 1 * u + 0.4, w - 2, Math.max(1, Math.round(u)), mixc(f.sk.m, LIP, 0.4));
      dpx(x0 - 1, my, toneAt(f.sk, -1));
      dpx(x0 + w, my, toneAt(f.sk, -1));
      if (braces) drect(x0 + 2, my + 0.5, w - 4, 1, '#dcdae6');
    }
  }
  if (L.features?.includes('beauty-mark')) dpx(f.eyeR + 3 * u, my - 2 * u, INK);
  if (L.features?.includes('scar-chin')) dline(mx - 3 * u, my + 4 * u, mx - 2 * u, my + 6 * u, toneAt(f.sk, 2));
  if (L.features?.includes('bandage')) {
    rect(f.eyeL - 5 * u, f.eyeY - 3 * u, 5 * u, 2 * u, (x) => (x % 3 === 0 ? '#eacfa6' : '#f6e0bc'));
  }
  if (L.features?.includes('flour')) {
    for (let i = 0; i < 6; i++) dpx(f.eyeR + (1 + hash2(i, 1, 2) * 5) * u, f.eyeY + (2 + hash2(i, 2, 2) * 5) * u, '#fbf6ec');
  }
}

// ---- facial hair ----

function drawFacialHair(f: PF): void {
  const u = f.u;
  const L = f.look;
  const fh = L.facial;
  if (!fh || fh === 'none' || B.bear) return;
  if (L.mask === 'luchador' || L.mask === 'hood' || L.mask === 'moth') return;
  const hr = f.hr;
  const mx = f.cx;
  const my = f.mouthY;
  const paint = (x: number, y: number, top: number): Color => {
    const idx = toneIdx(formV((x + 0.5 - mx) / f.rx, 0, LAT, UP), true);
    const strand = (x * 7 + y * 3) % 5 === 0 ? -1 : (x * 3 + y * 11) % 7 === 0 ? 1 : 0;
    const near = y < top + 1.5 * u ? 1 : 0;
    return toneAt(hr, Math.max(-2, Math.min(2, idx + strand + near)));
  };
  if (fh === 'stubble') {
    for (let y = Math.round(my - 3 * u); y < f.chin + 1; y++)
      for (let x = Math.round(f.cx - f.rx); x <= f.cx + f.rx; x++) {
        if (!inFace(f, x, y, -0.5)) continue;
        const ax = Math.abs(x + 0.5 - mx);
        if (y < my + 2 * u && ax < 5.5 * u) continue;
        if (y < my - 3 * u) continue;
        if (dth(x, y, 7)) dpx(x, y, mixc(f.sk.m, L.hairColor, 0.4));
      }
    return;
  }
  layer({ sh: 0.3, hl: 0.1, cast: false, aa: false });
  const stache = (w: number, droop: number, curl: boolean, thick = 2.2) => {
    const x0 = mx - (w / 2) * u;
    for (let i = 0; i <= w * u; i++) {
      const t = i / (w * u);
      const arch = Math.sin(t * Math.PI) * 1.2 * u;
      const d = droop ? Math.abs(t - 0.5) * 2 * droop * u : 0;
      const yy = my - 2.4 * u - arch + d;
      for (let k = 0; k < thick * u; k++) P(Math.round(x0 + i), Math.round(yy + k), pt(paint(Math.round(x0 + i), Math.round(yy + k), my - 3.6 * u)));
    }
    if (curl) {
      for (const s of [-1, 1]) {
        const tx = mx + s * (w / 2 + 1) * u;
        px(tx, my - 2.6 * u, hr.m);
        px(tx + s, my - 3.6 * u, hr.l1);
        px(tx + s * 2, my - 4.2 * u, hr.m);
      }
    }
  };
  const beard = (extra: number, flat: boolean, wild: boolean) => {
    const top = my - 3 * u;
    const bottom = f.chin + extra * u;
    for (let y = Math.round(f.eyeY + 4 * u); y <= bottom; y++)
      for (let x = Math.round(f.cx - f.rx - 2 * u); x <= f.cx + f.rx + 2 * u; x++) {
        const ax = Math.abs(x + 0.5 - mx);
        const below = y > f.chin - 2 * u;
        const w = f.rx - (flat ? 0 : (y - (f.chin - 2 * u)) * 0.5) - (wild && (x * 3 + y) % 5 === 0 ? 1.5 * u : 0);
        const inside = inFace(f, x, y, 0.8 * u) && !(below && ax > w) || (below && y <= bottom && ax < w);
        if (!inside) continue;
        // Leave the mouth and the cheeks clear.
        if (y < my + 2.5 * u && ax < 5.5 * u) continue;
        if (y < my - 1 * u && ax < f.rx * 0.72) continue;
        if (y < top && ax < f.rx * 0.9) continue;
        if (wild && y > bottom - 2 * u && (x + y) % 2) continue;
        px(x, y, paint(x, y, top));
      }
    stache(10, 0, false, 2.4);
  };
  switch (fh) {
    case 'mustache':
      stache(10, 0, false);
      break;
    case 'pencil':
      stache(9, 0, false, 1);
      break;
    case 'walrus':
      stache(13, 2.5, false, 3.2);
      break;
    case 'handlebar':
      stache(11, 0, true);
      break;
    case 'goatee':
      stache(9, 0, false);
      oval(mx, f.chin - 0.5 * u, 3 * u, 3 * u, (x, y) => (y < my + 3 * u ? null : paint(x, y, my + 3 * u)));
      break;
    case 'soulpatch':
      rect(mx - 1.5 * u, my + 3 * u, 3 * u, 2 * u, (x, y) => paint(x, y, my + 3 * u));
      break;
    case 'mutton':
      for (const s of [-1, 1]) {
        const x0 = f.cx + s * f.rx * 0.65;
        for (let y = Math.round(f.eyeY + 1 * u); y < f.chin; y++)
          for (let x = Math.round(x0 - 3 * u); x <= x0 + 3 * u; x++) if (inFace(f, x, y, 0.5 * u) && (s < 0 ? x < x0 + 1.5 * u : x > x0 - 1.5 * u)) px(x, y, paint(x, y, f.eyeY + 2 * u));
      }
      stache(10, 0, false);
      break;
    case 'square':
      beard(3, true, false);
      break;
    case 'wild':
      beard(7, false, true);
      break;
    default:
      beard(2, false, false);
  }
}

// ---- hair ----

function hairAt(f: PF, _hc: string, sp: HairSpec) {
  const hr = f.hr;
  const acc = f.look.hairAccent;
  const rx = f.rx + 2 * f.u;
  const ry = f.ry + 2 * f.u;
  const sx = f.cx + Math.round(f.rx * 0.3);
  return (x: number, y: number): Color => {
    if (acc && (sp.top === 'spikes' || sp.top === 'faux' ? y < f.cy - f.ry : Math.abs(x - sx) < 1.5 * f.u && y < f.cy)) return tint(acc, 0, 'hair');
    const dx = (x + 0.5 - f.cx) / rx;
    const dy = (y + 0.5 - f.cy) / ry;
    const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
    const v = dx * -0.62 + dy * -0.78 + nz * 0.5 - 0.2;
    let idx = toneIdx(v, true);
    const d = Math.hypot(dx + 0.34, dy + 0.43);
    if (d < 0.42 && d > 0.2) idx = Math.max(idx, 1);
    if (d <= 0.2) idx = 2;
    // Strands: slim dark and light lines following the hair direction.
    const sIdx = Math.floor((x + 100) / 2) % 4;
    const col = Math.floor((x * 1.0 + y * 0.25 + 100) / (2 * f.u));
    if (hash2(col, 1, 3) < 0.28 && y > f.cy - f.ry * 0.9) idx -= 1;
    else if (hash2(col, 2, 3) < 0.15 && idx < 2) idx += 1;
    if (sp.curly) idx += (x * 7 + y * 3) % 5 === 0 ? 1 : (x * 3 + y * 5) % 7 === 0 ? -1 : 0;
    if (sp.locs && Math.floor((x + 100) / (2.5 * f.u)) % 2 === 0 && y > f.cy - f.ry * 0.5) idx = Math.min(idx, -1);
    void sIdx;
    if (y > f.cy + f.ry * 0.6) idx = Math.min(idx, -1);
    return toneAt(hr, Math.max(-2, Math.min(2, idx)));
  };
}

function portraitHairline(f: PF, x: number, sp: HairSpec): number {
  const u = f.u;
  const top = f.cy - f.ry;
  const base = top + f.ry * 2 * (sp.capY + 0.02);
  const t = (x + 0.5 - (f.cx - f.rx)) / (f.rx * 2);
  switch (sp.fringe) {
    case 'jag':
      return base + (Math.sin(x * 1.3) > 0.2 ? 2 * u : 0) + Math.abs(t - 0.5) * 2 * u;
    case 'partL':
      return base + t * 7 * u - 2 * u;
    case 'partR':
      return base + (1 - t) * 7 * u - 2 * u;
    case 'mid':
      return base + Math.abs(t - 0.5) * 14 * u - 4 * u;
    case 'swoop':
      return base + t * t * 10 * u - 2 * u;
    case 'bangs':
      return base + 3 * u + (Math.floor(x / (2 * u)) % 2 ? u : 0);
    case 'curly':
      return base + (Math.sin(x * 1.2) + 1) * 1.6 * u;
    case 'wave':
      return base + (Math.sin(x * 0.9) + 1) * 1.4 * u;
    case 'shag':
      return base + 2 * u + (Math.sin(x * 2.1) + 1) * 1.6 * u;
    case 'none':
      return base - 2 * u;
    default:
      return base;
  }
}

function drawHairBackP(f: PF): void {
  const sp = hairSpec();
  const L = f.look;
  if (B.bear || sp.cap === 'none') return;
  const masked = L.mask === 'luchador' || L.mask === 'hood' || L.mask === 'half';
  const u = f.u;
  layer({ sh: 0.32, cast: false, aa: false });
  const paint = hairAt(f, L.hairColor, sp);
  const cx = f.cx;
  if (!masked && sp.back >= 2) {
    const w = f.rx * 2 + (sp.curly ? 8 : 5) * u;
    rect(cx - w / 2, f.cy, w, f.S - f.cy, (x, y) => (y > f.cy + f.ry + (sp.back === 2 ? 3 : 12) * u && Math.abs(x + 0.5 - cx) < f.rx * 0.6 ? null : paint(x, y)));
  }
  if (!masked && sp.top === 'afro') oval(cx, f.cy - 2 * u, f.rx + 9 * u, f.ry + 8 * u, paint);
  if (sp.tail === 'mullet' && !masked) rect(cx - f.rx - 2 * u, f.eyeY, f.rx * 2 + 4 * u, f.S - f.eyeY, (x, y) => (y > f.chin + 6 * u && Math.abs(x + 0.5 - cx) < f.rx * 0.55 ? null : paint(x, y)));
  if (sp.tail === 'pigtails' || sp.tail === 'braids') {
    for (const s of [-1, 1]) {
      const px0 = cx + s * (f.rx + 3 * u);
      if (sp.tail === 'pigtails') oval(px0, f.eyeY + 4 * u, 4 * u, 8 * u, paint);
      else for (let y = Math.round(f.eyeY); y < f.S; y++) rect(px0 - 2 * u, y, 4 * u, 1, (x) => toneAt(f.hr, Math.floor((y - f.eyeY) / (2.5 * u)) % 2 === 0 ? (x < px0 ? 1 : 0) : -1));
    }
  }
  if (sp.tail === 'pony' || sp.tail === 'longbraid' || sp.tail === 'highpony') oval(cx + f.rx * 0.9, f.cy + 2 * u, 4 * u, 7 * u, paint);
}

function drawHairP(f: PF): void {
  const sp = hairSpec();
  const L = f.look;
  if (B.bear) return;
  const u = f.u;
  const hatTop = ['hat', 'cowboy-hat', 'cap', 'beanie', 'bucket-hat', 'hunting-cap', 'sheriff-hat', 'headwrap', 'head-bandana'].some((h) => B.ex.has(h));
  const fullMask = L.mask === 'luchador' || L.mask === 'hood' || L.mask === 'half' || L.mask === 'moth';
  const hr = f.hr;
  const paint = hairAt(f, L.hairColor, sp);
  const cx = f.cx;
  layer({ sh: 0.32, hl: 0, cast: true, aa: false });
  if (fullMask || sp.cap === 'none') {
    if (sp.cap === 'none' && !fullMask) {
      // Scalp shine.
      oval(cx - f.rx * 0.35, f.cy - f.ry * 0.7, 3 * u, 1.6 * u, (x, y) => (dth(x, y, 9) ? toneAt(f.sk, 2) : null));
    }
    return;
  }
  const grow = (1.5 + (sp.vol ?? 0) * 2) * u;
  const top = f.cy - f.ry;
  for (let y = Math.floor(top - grow - 2); y <= f.cy + f.ry + 2; y++)
    for (let x = Math.floor(cx - f.rx - grow - 2); x <= cx + f.rx + grow + 2; x++) {
      if (!inFace(f, x, y, grow)) continue;
      let hl = portraitHairline(f, x, sp);
      const edge = Math.abs(x + 0.5 - cx) > f.rx * 0.78;
      if (edge && sp.sides >= 1) hl = Math.max(hl, sp.sides === 1 ? f.eyeY + 1 * u : sp.sides === 2 ? f.chin - 2 * u : f.S);
      if (sp.bob && Math.abs(x + 0.5 - cx) > f.rx * 0.9) hl = f.chin + 2 * u;
      if (y >= hl) continue;
      if (sp.cap === 'buzz') {
        if (dth(x, y, 9)) P(x, y, pt(mixc(L.hairColor, B.skin, 0.3)));
        continue;
      }
      if (sp.cap === 'side' && Math.abs(x + 0.5 - cx) > f.rx * 0.3) {
        if (dth(x, y, 6)) P(x, y, pt(mixc(L.hairColor, B.skin, 0.45)));
        continue;
      }
      if (sp.curly && !inFace(f, x, y, grow - 1.2 * u) && Math.sin(x * 1.1 + y * 0.9) > 0.3) continue;
      P(x, y, pt(paint(x, y)));
    }
  // Long curtains in front of the shoulders.
  if (sp.sides >= 3) {
    for (const s of [-1, 1]) {
      const x0 = cx + s * (f.rx - 1 * u);
      rect(x0 - 2.5 * u, f.eyeY - 4 * u, 5 * u, f.S - f.eyeY, (x, y) => (Math.abs(x + 0.5 - x0) > 1.6 * u ? toneAt(hr, -1) : paint(x, y)));
    }
  }
  if (hatTop) return;
  switch (sp.top) {
    case 'bun':
      oval(cx + 2 * u, top - 2 * u, 7 * u, 5.5 * u, paint);
      oval(cx + 1 * u, top - 3.5 * u, 2.5 * u, 1.5 * u, hr.l1);
      break;
    case 'topknot':
      oval(cx, top - 4 * u, 5 * u, 5 * u, paint);
      rect(cx - 2 * u, top - 0.5 * u, 4 * u, 1.5 * u, hr.d1);
      break;
    case 'twinbuns':
      for (const s of [-1, 1]) oval(cx + s * f.rx * 0.8, top + 1 * u, 5.5 * u, 5 * u, paint);
      break;
    case 'mohawk':
    case 'faux': {
      const tall = (sp.top === 'mohawk' ? 12 : 5) * u;
      shape([[cx - 4 * u, top + 2 * u], [cx + 4 * u, top + 2 * u], [cx + 3 * u, top - tall + 2 * u], [cx - 1 * u, top - tall], [cx - 3 * u, top - tall + 3 * u]], (x, y) => (y < top - tall + 3 * u ? hr.l1 : paint(x, y)));
      break;
    }
    case 'spikes':
      for (let i = 0; i < 6; i++) {
        const x = cx - f.rx * 0.9 + i * ((f.rx * 1.8) / 5);
        const tipY = top - (5 + (i % 2) * 2.5) * u;
        shape([[x - 3.5 * u, top + 4 * u], [x + 3.5 * u, top + 4 * u], [x + 0.5 * u, tipY]], (xx, yy) => (yy < tipY + 3 * u ? hr.l1 : paint(xx, yy)));
      }
      break;
    case 'pomp':
      oval(cx + 2 * u, top - 1 * u, f.rx - 1 * u, 7 * u, paint);
      oval(cx - 3 * u, top - 5 * u, 5 * u, 2 * u, (x, y) => (dth(x, y, 10) ? hr.l1 : null));
      break;
    case 'flat':
      rect(cx - f.rx + 1 * u, top - 5 * u, f.rx * 2 - 2 * u, 8 * u, (x, y) => (y < top - 4 * u ? hr.l1 : x > cx + f.rx * 0.7 ? hr.d1 : paint(x, y)));
      break;
    case 'cowlick':
      shape([[cx + 2 * u, top], [cx + 6 * u, top - 1 * u], [cx + 8 * u, top - 6 * u], [cx + 5 * u, top - 4 * u], [cx + 3 * u, top + 1 * u]], paint);
      break;
    case 'crown':
      for (let x = Math.round(cx - f.rx); x <= cx + f.rx; x++) {
        if (!inFace(f, x, top + 3 * u, 1.5 * u)) continue;
        const k = Math.floor((x - cx + 100) / (2.5 * u)) % 2;
        rect(x, top + 1 * u, 1, 4 * u, (_x, y) => toneAt(hr, (k === 0 ? 1 : -1) - (y > top + 3.5 * u ? 1 : 0)));
      }
      break;
  }
}

// ---- masks ----

function drawMaskP(f: PF): void {
  const L = f.look;
  const mk = L.mask;
  if (!mk || mk === 'none' || B.bear) return;
  const u = f.u;
  const mc = L.maskColor ?? '#ffd84a';
  const ma = L.maskAccent ?? '#d8307a';
  const mr = ramp(mc, 'cloth');
  const ar = ramp(ma, 'cloth');
  layer({ sh: 0.3, hl: 0, cast: true });
  const grow = 1.2 * u;
  const idxAt = (x: number, y: number) => {
    const dx = (x + 0.5 - f.cx) / (f.rx + grow);
    const dy = (y + 0.5 - f.cy) / (f.ry + grow);
    const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
    const v = dx * -0.62 + dy * -0.78 + nz * 0.55 - 0.22;
    return v < -0.55 && dth(x, y, 8) ? -2 : toneIdx(v, true);
  };
  const eyeHole = (ex: number) => {
    const eW = f.eW + 1 * u;
    const eH = f.eH + 0.6 * u;
    return (x: number, y: number) => ((x + 0.5 - ex) / (eW / 2 + 2.2 * u)) ** 2 + ((y + 0.5 - f.eyeY) / (eH / 2 + 2 * u)) ** 2;
  };
  if (mk === 'domino') {
    for (let y = Math.round(f.eyeY - 5 * u); y <= f.eyeY + 4 * u; y++)
      for (let x = Math.round(f.cx - f.rx); x <= f.cx + f.rx; x++) {
        if (!inFace(f, x, y, 0.5 * u)) continue;
        const hole = Math.min(eyeHole(f.eyeL)(x, y), eyeHole(f.eyeR)(x, y));
        if (hole < 0.55) continue;
        P(x, y, pt(toneAt(mr, hole < 0.75 ? -1 : idxAt(x, y))));
      }
    return;
  }
  const lowY = mk === 'half' ? f.mouthY - 3.5 * u : 999;
  const pat = L.maskPattern ?? 'plain';
  for (let y = Math.floor(f.cy - f.ry - grow - 1); y <= f.cy + f.ry + grow; y++)
    for (let x = Math.floor(f.cx - f.rx - grow - 1); x <= f.cx + f.rx + grow; x++) {
      if (!inFace(f, x, y, grow) || y > lowY) continue;
      const idx = idxAt(x, y);
      if (mk === 'moth') {
        const edge = !inFace(f, x, y, grow - 1.5 * u);
        P(x, y, pt(edge && dth(x, y, 8) ? '#b8a890' : toneAt(mr, idx)));
        continue;
      }
      if (mk === 'hood') {
        P(x, y, pt(toneAt(mr, Math.min(idx, 0) - ((x + y) % 5 === 0 ? 1 : 0))));
        continue;
      }
      // Luchador / half: trimmed eye holes, pattern and a stitched centre seam.
      const hL = eyeHole(f.eyeL)(x, y);
      const hR = eyeHole(f.eyeR)(x, y);
      const hole = Math.min(hL, hR);
      if (hole < 0.62) continue;
      if (hole < 0.95) {
        P(x, y, pt(toneAt(ar, hole < 0.75 ? 1 : 0)));
        continue;
      }
      let c: Color = mc;
      let i2 = idx;
      const dx = (x + 0.5 - f.cx) / u;
      const ty = (y - (f.cy - f.ry)) / u;
      const ey = (f.eyeY - (f.cy - f.ry)) / u;
      switch (pat) {
        case 'stripe':
          if (Math.abs(dx) < 2 && ty < ey - 4) c = ma;
          break;
        case 'flames':
          for (const e of [f.eyeL, f.eyeR]) {
            const fx = (x - e) / u;
            if (ty < ey - 4 && ty > ey - 10 - (Math.abs(fx) % 2) * 3 && Math.abs(fx) <= 5) c = ty < ey - 8 ? '#ffd84a' : ma;
          }
          break;
        case 'wings':
          for (const e of [f.eyeL, f.eyeR]) {
            const o = e === f.eyeL ? -1 : 1;
            const fx = ((x - e) / u) * o;
            const fy = (y - f.eyeY) / u;
            if (fx >= 3 && fx <= 10 && fy >= -8 && fy <= 2 && fy > -fx - 2 && fy < fx * 0.4 - 1) c = Math.floor((fx + fy) / 2) % 3 === 0 ? INK : ma;
          }
          break;
        case 'star':
          if ((Math.abs(dx) < 1.5 && Math.abs(ty - 8) <= 4) || (Math.abs(ty - 8) < 1.5 && Math.abs(dx) <= 4) || (Math.abs(Math.abs(dx) - Math.abs(ty - 8)) < 1 && Math.abs(dx) < 3)) c = ma;
          break;
        case 'teardrop':
          for (const e of [f.eyeL, f.eyeR]) if (Math.abs(x - e) < 1.2 * u && y > f.eyeY + 4 * u && y < f.eyeY + 9 * u) c = ma;
          break;
        case 'split':
          if (dx > 0) c = ma;
          break;
        case 'swirl': {
          const a = Math.atan2(y + 0.5 - f.cy, dx * u) + Math.hypot(dx * u, y + 0.5 - f.cy) * 0.3;
          if (Math.sin(a * 2) > 0.6) c = ma;
          break;
        }
        case 'heart':
          if (ty > 3 && ty < 10 && Math.abs(dx) < 5 && ((ty < 6 && Math.abs(Math.abs(dx) - 2.5) < 2) || (ty >= 6 && Math.abs(dx) < 9 - ty))) c = ma;
          break;
        case 'lightning':
          if (ty < ey - 3 && Math.abs(dx - ((Math.floor(ty / 3) % 2) * 3 - 1.5)) < 1.5) c = ma;
          break;
      }
      if (Math.abs(x + 0.5 - f.cx) < 0.6 * u && y < f.eyeY - 7 * u && Math.floor(y / u) % 2 === 0) i2 -= 1;
      if (mk === 'half' && y > lowY - 1.5 * u) i2 -= 1;
      P(x, y, pt(c === mc ? toneAt(mr, i2) : tint(c, i2)));
    }
  if (mk === 'hood') {
    shape([[f.cx - 6 * u, f.cy - f.ry], [f.cx + 6 * u, f.cy - f.ry], [f.cx, f.cy - f.ry - 10 * u]], (x) => (x < f.cx ? mr.m : mr.d1));
    for (const e of [f.eyeL, f.eyeR]) {
      drect(e - 4 * u, f.eyeY - 1.5 * u, 8 * u, 3 * u, INK);
      drect(e - 1 * u, f.eyeY - 0.5 * u, 2 * u, 1 * u, '#fff6ea');
    }
    return;
  }
  if (mk === 'moth') {
    layer({ flat: true });
    for (const s of [-1, 1]) {
      const bx = f.cx + s * 5 * u;
      dline(bx, f.cy - f.ry, bx + s * 5 * u, f.cy - f.ry - 12 * u, mr.d1);
      drect(bx + s * 5 * u - u, f.cy - f.ry - 13 * u, 2 * u, 2 * u, mr.d1);
    }
    for (const e of [f.eyeL, f.eyeR]) {
      oval(e, f.eyeY, 4.6 * u, 4.2 * u, '#8a2a34');
      oval(e, f.eyeY, 3.6 * u, 3.2 * u, (x, y) => (x < e - 1.5 * u && y < f.eyeY - 1 * u ? '#ffc0b0' : '#e8343c'));
    }
    return;
  }
  if (mk === 'luchador') {
    // Mouth hole trim.
    oval(f.cx, f.mouthY + 1 * u, 7 * u, 4.4 * u, (_x, y) => toneAt(ar, y < f.mouthY ? 1 : 0));
    oval(f.cx, f.mouthY + 1 * u, 5.6 * u, 3.2 * u, (x, y) => skinAt(f, x, y, f.sk));
  }
}

// ---- glasses, hats, neckwear ----

function drawGlassesP(f: PF): void {
  const g = (f.look.extras ?? []).find((e) => EXTRA_SLOT[e.id] === 'face');
  if (!g) return;
  const u = f.u;
  layer({ flat: true });
  const fw = f.eW + 4 * u;
  const fh = f.eH + 3 * u;
  const c = g.id === 'sunglasses' || g.id === 'aviators' ? (g.accent ?? '#2b2140') : g.color;
  const cL = liA(c, 0.3);
  const lens: Color | null = g.id === 'sunglasses' ? shA(g.color, 0.15) : g.id === 'aviators' ? mixc(g.color, '#ffd890', 0.4) : null;
  if (g.id === 'eyepatch') {
    dline(f.cx - f.rx, f.cy - f.ry * 0.55, f.cx + f.rx, f.eyeY - 3 * u, INK);
    dline(f.cx - f.rx, f.cy - f.ry * 0.55 + 1, f.cx + f.rx, f.eyeY - 3 * u + 1, INK);
    oval(f.eyeR, f.eyeY, fw / 2, fh / 2, INK);
    return;
  }
  for (const ex of [f.eyeL, f.eyeR]) {
    const x0 = Math.round(ex - fw / 2);
    const y0 = Math.round(f.eyeY - fh / 2);
    const round = g.id === 'round-glasses' || g.id === 'aviators';
    for (let y = y0; y < y0 + fh; y++)
      for (let x = x0; x < x0 + fw; x++) {
        let inside = true;
        let edge = y === y0 || y === y0 + Math.round(fh) - 1 || x === x0 || x === x0 + Math.round(fw) - 1;
        if (round) {
          const dx = (x + 0.5 - ex) / (fw / 2);
          const dy = (y + 0.5 - f.eyeY) / (fh / 2);
          const d = dx * dx + dy * dy;
          inside = d <= 1;
          edge = inside && d > 0.72;
        }
        if (g.id === 'aviators' && y > f.eyeY && Math.abs(x + 0.5 - ex) > fw / 2 - (y - f.eyeY) * 0.5) inside = false;
        if (g.id === 'halfmoon' && y < f.eyeY + 0.5 * u) inside = false;
        if (!inside) continue;
        if (edge) P(x, y, dcolor(x < ex && y < f.eyeY ? cL : c));
        else if (lens) P(x, y, dcolor((x + y) % 4 === 0 || (x < ex - 1 && y < f.eyeY - 1) ? liA(lens, 0.5) : lens));
        else if (x === x0 + 2 && y === y0 + 2) P(x, y, dcolor('#ffffff'));
        else if (x < ex - fw * 0.3 && y < f.eyeY - fh * 0.2 && (x + y) % 3 === 0) P(x, y, dcolor(mixc(EYE_WHITE, '#a8d8f0', 0.5)));
      }
    if (g.id === 'cateye') {
      dpx(x0 - 1, y0 - 1, c);
      dpx(x0 - 2, y0 - 2, c);
      dpx(x0 + Math.round(fw), y0 - 1, c);
      dpx(x0 + Math.round(fw) + 1, y0 - 2, c);
    }
  }
  drect(f.eyeL + fw / 2, f.eyeY - 0.5 * u, f.eyeR - f.eyeL - fw, 1, c);
  // Temple arms toward the ears.
  dline(f.eyeL - fw / 2, f.eyeY - 1, f.cx - f.rx, f.eyeY - 0.5 * u, c);
  dline(f.eyeR + fw / 2, f.eyeY - 1, f.cx + f.rx, f.eyeY - 0.5 * u, c);
}

function dcolor(c: Color): (x: number, y: number, old: number) => Color {
  return () => c;
}

function drawHatsP(f: PF): void {
  const u = f.u;
  const top = f.cy - f.ry;
  const W = f.rx * 2;
  const cx = f.cx;
  for (const e of f.look.extras ?? []) {
    if (EXTRA_SLOT[e.id] !== 'head') continue;
    const c = e.color;
    const a = e.accent ?? (shA(c, 0.3) as unknown as string);
    const cr = ramp(c, 'cloth');
    layer({ sh: 0.3, hl: 0, cast: true, aa: true });
    const crownPaint = (x0: number, w: number, y0: number) => (x: number, y: number): Color => {
      const t = ((x + 0.5 - x0) / w) * 2 - 1;
      let idx = toneIdx(formV(t, (y0 + 3 * u - y) / (4 * u), LAT, UP), true);
      if (dth(x, y, 6) && t < -0.2 && idx === 0) idx = 1;
      return toneAt(cr, idx);
    };
    const crown = (h: number, w: number, yOff = 0) => {
      const x0 = cx - w / 2;
      rect(x0, top - h + yOff, w, h + 2 * u, crownPaint(x0, w, top - h));
    };
    switch (e.id) {
      case 'hat':
        crown(10 * u, W - 6 * u);
        rect(cx - W / 2 - 5 * u, top + 2 * u, W + 10 * u, 2.5 * u, (x) => toneAt(cr, x > cx + 4 * u ? -1 : 0));
        rect(cx - (W - 6 * u) / 2, top - 0.5 * u, W - 6 * u, 2.5 * u, tint(a, 0));
        break;
      case 'cowboy-hat':
        crown(11 * u, W - 8 * u);
        px(cx, top - 10 * u, cr.d1);
        rect(cx - W / 2 - 8 * u, top + 2 * u, W + 16 * u, 2.5 * u, (x) => toneAt(cr, x > cx + 6 * u ? -1 : x < cx - 6 * u ? 1 : 0));
        shape([[cx - W / 2 - 8 * u, top + 2 * u], [cx - W / 2 - 6 * u, top - 1 * u], [cx - W / 2 - 4 * u, top + 2 * u]], cr.l1);
        shape([[cx + W / 2 + 8 * u, top + 2 * u], [cx + W / 2 + 6 * u, top - 1 * u], [cx + W / 2 + 4 * u, top + 2 * u]], cr.m);
        rect(cx - (W - 8 * u) / 2, top - 0.5 * u, W - 8 * u, 2.5 * u, tint(a, 0, 'leather'));
        break;
      case 'sheriff-hat':
        crown(11 * u, W - 8 * u);
        rect(cx - W / 2 - 8 * u, top + 2 * u, W + 16 * u, 2.5 * u, (x) => toneAt(cr, x > cx + 6 * u ? -1 : 0));
        shape([[cx - 4 * u, top - 6 * u], [cx + 4 * u, top - 6 * u], [cx, top - 12 * u]], cr.m);
        rect(cx - (W - 8 * u) / 2, top - 0.5 * u, W - 8 * u, 2.5 * u, tint(a, 0, 'leather'));
        break;
      case 'cap':
        for (let y = Math.round(top - 3 * u); y < f.eyeY - 7 * u; y++) for (let x = Math.round(cx - f.rx - 2 * u); x <= cx + f.rx + 2 * u; x++) if (inFace(f, x, y, 2 * u)) P(x, y, pt(toneAt(cr, y < top - 2 * u ? 1 : x > cx + 4 * u ? -1 : (x - cx) % 7 === 0 ? -1 : 0)));
        rect(cx - 9 * u, f.eyeY - 8 * u, 18 * u, 2.5 * u, (x, y) => tint(a, x > cx + 2 * u ? -1 : y < f.eyeY - 7 * u ? 1 : 0));
        px(cx, top - 3.5 * u, cr.d1);
        break;
      case 'beanie':
        for (let y = Math.round(top - 6 * u); y < f.eyeY - 5 * u; y++) for (let x = Math.round(cx - f.rx - 3 * u); x <= cx + f.rx + 3 * u; x++) if (inFace(f, x, y, 2.5 * u)) P(x, y, pt(y >= f.eyeY - 9 * u ? tint(a, Math.floor(x / (1.5 * u)) % 2 ? -1 : 0) : toneAt(cr, y < top - 4 * u ? 1 : x > cx + 5 * u ? -1 : Math.floor((x + y) / (2 * u)) % 3 === 0 ? -1 : 0)));
        oval(cx, top - 7 * u, 3.5 * u, 3.5 * u, (x, y) => tint(a, y < top - 8 * u ? 1 : x > cx + u ? -1 : 0));
        break;
      case 'bucket-hat':
        crown(7 * u, W - 2 * u);
        rect(cx - W / 2 - 3 * u, top + 2 * u, W + 6 * u, 4 * u, (x, y) => toneAt(cr, y > top + 4.5 * u ? -1 : x > cx + 6 * u ? -1 : 0));
        rect(cx - W / 2 - 3 * u, top + 2 * u, W + 6 * u, 1.5 * u, tint(a, 0));
        break;
      case 'hunting-cap':
        for (let y = Math.round(top - 3 * u); y < f.eyeY - 6 * u; y++) for (let x = Math.round(cx - f.rx - 2 * u); x <= cx + f.rx + 2 * u; x++) if (inFace(f, x, y, 2 * u)) P(x, y, pt(tint(pattern('plaid', x, y, c, a, 2 * u), x > cx + 4 * u ? -1 : 0)));
        for (const s of [-1, 1]) rect(cx + s * (f.rx + 1 * u) - 2.5 * u, f.eyeY - 6 * u, 5 * u, 10 * u, (_x, y) => toneAt(cr, y > f.eyeY + 2 * u ? -1 : s > 0 ? -1 : 0));
        rect(cx - 8 * u, f.eyeY - 7 * u, 16 * u, 2 * u, cr.d1);
        break;
      case 'chef-hat':
        oval(cx, top - 6 * u, 9 * u, 7 * u, (x, y) => toneAt(cr, y < top - 9 * u ? 1 : x > cx + 3 * u ? -1 : Math.floor((x + y * 0.5) / (3 * u)) % 2 ? 1 : 0));
        rect(cx - 7 * u, top - 3 * u, 14 * u, 5 * u, (x, y) => toneAt(cr, y > top + 0.5 * u ? -1 : x > cx + 4 * u ? -1 : 0));
        break;
      case 'mortarboard':
        crown(5 * u, W - 8 * u);
        shape([[cx - W / 2 - 4 * u, top - 4 * u], [cx, top - 8 * u], [cx + W / 2 + 4 * u, top - 4 * u], [cx, top - 1 * u]], (x) => toneAt(cr, x < cx ? 1 : 0));
        dline(cx + W / 2 + 2 * u, top - 4 * u, cx + W / 2 + 4 * u, top + 6 * u, tint(a, 0));
        break;
      case 'crown':
        rect(cx - 8 * u, top - 3 * u, 16 * u, 5 * u, (x, y) => tint(c, y < top - 2 * u ? 1 : x > cx + 4 * u ? -1 : 0, 'metal'));
        for (const dx of [-7, -2.5, 2, 6.5]) shape([[cx + dx * u - 1.5 * u, top - 3 * u], [cx + dx * u + 1.5 * u, top - 3 * u], [cx + dx * u, top - 7 * u]], tint(c, dx < 0 ? 2 : 0, 'metal'));
        drect(cx - 1 * u, top - 1.5 * u, 2 * u, 2 * u, '#e8343c');
        drect(cx - 5.5 * u, top - 1.5 * u, 1.5 * u, 1.5 * u, '#4d8be0');
        drect(cx + 4 * u, top - 1.5 * u, 1.5 * u, 1.5 * u, '#58b368');
        break;
      case 'headband':
        for (let y = Math.round(top + f.ry * 0.5); y < top + f.ry * 0.5 + 2.5 * u; y++) for (let x = Math.round(cx - f.rx - 2 * u); x <= cx + f.rx + 2 * u; x++) if (inFace(f, x, y, 1.6 * u)) P(x, y, pt(toneAt(cr, x > cx + 5 * u ? -1 : 0)));
        break;
      case 'headwrap':
        oval(cx, top + 2 * u, f.rx + 2.5 * u, f.ry * 0.48 + 2 * u, (x, y) => toneAt(cr, toneIdx(formV((x + 0.5 - cx) / (f.rx + 2.5 * u), (top + 2 * u - y) / (f.ry * 0.5), LAT, UP), true) - (Math.floor((x - y * 0.6) / (3 * u)) % 3 === 0 ? 1 : 0)));
        oval(cx - 4 * u, top - 4 * u, 7 * u, 5 * u, (x, y) => toneAt(cr, y < top - 6 * u ? 1 : x > cx - 2 * u ? -1 : 0));
        rect(cx - 2 * u, top - 2 * u, 4 * u, 4 * u, (x) => tint(a, x < cx ? 1 : 0));
        break;
      case 'head-bandana':
        for (let y = Math.round(top - 2 * u); y < f.eyeY - 8 * u; y++) for (let x = Math.round(cx - f.rx - 2 * u); x <= cx + f.rx + 2 * u; x++) if (inFace(f, x, y, 1.8 * u)) P(x, y, pt(tint(pattern('stars', x, y, c, a, 1.5 * u), x > cx + 4 * u ? -1 : 0)));
        break;
      case 'headset':
        layer({ flat: true });
        for (let x = Math.round(cx - f.rx); x <= cx + f.rx; x++) if (inFace(f, x, top - 1.2 * u, 2 * u) && !inFace(f, x, top - 3.2 * u, 2 * u)) drect(x, top - 2 * u, 1, 2 * u, c);
        drect(cx + f.rx - 1 * u, f.eyeY - 3 * u, 3 * u, 6 * u, c);
        dline(cx + f.rx, f.eyeY + 2 * u, cx + 4 * u, f.mouthY + 2 * u, c);
        drect(cx + 3 * u, f.mouthY + 1.5 * u, 2.5 * u, 2 * u, shA(c, 0.3));
        break;
      case 'headlamp':
        for (let y = Math.round(top + 3 * u); y < top + 5.5 * u; y++) for (let x = Math.round(cx - f.rx - 2 * u); x <= cx + f.rx + 2 * u; x++) if (inFace(f, x, y, 1.5 * u)) P(x, y, pt(toneAt(cr, x > cx + 5 * u ? -1 : 0)));
        layer({ flat: true });
        drect(cx - 3 * u, top + 2 * u, 6 * u, 5 * u, '#4a4a5a');
        drect(cx - 2 * u, top + 3 * u, 4 * u, 3 * u, a);
        dpx(cx - 1.5 * u, top + 3 * u, '#fff6ea');
        break;
      case 'flower':
        layer({ flat: true });
        for (const [dx, dy] of [[0, -2.5], [2.5, 0], [0, 2.5], [-2.5, 0]]) oval(cx + f.rx * 0.7 + dx * u, top + 4 * u + dy * u, 1.8 * u, 1.8 * u, c);
        oval(cx + f.rx * 0.7, top + 4 * u, 1.6 * u, 1.6 * u, '#ffe48e');
        break;
      case 'pencil-ear':
        layer({ flat: true });
        dline(cx + f.rx - 1 * u, f.eyeY - 7 * u, cx + f.rx + 2 * u, f.eyeY + 1 * u, c);
        dline(cx + f.rx, f.eyeY - 7 * u, cx + f.rx + 3 * u, f.eyeY + 1 * u, shA(c, 0.25));
        drect(cx + f.rx - 1.5 * u, f.eyeY - 8 * u, 2 * u, 1.5 * u, '#e88a9a');
        break;
      case 'safety-glasses':
        rect(cx - f.rx, top + 3 * u, f.rx * 2, 1.5 * u, tint(a, 0));
        rect(cx - 8 * u, top + 2.5 * u, 16 * u, 4 * u, (x, y) => (y < top + 3.5 * u && x < cx ? mixc(c, '#ffffff', 0.7) : mixc(c, '#ffffff', 0.4)));
        break;
    }
  }
}

function drawNeckwearP(f: PF): void {
  const u = f.u;
  const cx = f.cx;
  const ny = f.neckY;
  const H = 10 * u;
  for (const e of f.look.extras ?? []) {
    const slot = EXTRA_SLOT[e.id];
    if (slot !== 'neck' && slot !== 'over' && !(slot === 'back' && (e.id === 'robe' || e.id === 'duster'))) continue;
    const c = e.color;
    const a = e.accent ?? (shA(c, 0.28) as unknown as string);
    const kind = e.id === 'jacket' ? 'leather' : 'cloth';
    const cr = ramp(c, kind);
    layer({ sh: 0.3, hl: 0.1 });
    const paint = (x: number, y: number): Color => {
      const base = pattern(e.pattern, x, y, c, a, 2 * u, 0);
      let idx = toneIdx(formV((x + 0.5 - cx) / (18 * u), (ny + 6 * u - y) / (8 * u), LAT, UP), true);
      if (Math.floor((x - cx + 200) / (5 * u)) % 3 === 2 && y > ny + 4 * u) idx -= 1;
      return tint(base, idx, kind);
    };
    switch (e.id) {
      case 'robe':
      case 'duster':
      case 'jacket':
      case 'blazer':
      case 'cardigan':
      case 'vest': {
        const long = e.id === 'robe' || e.id === 'duster';
        for (const s of [-1, 1]) {
          const inner = (long ? 3.5 : 3) * u;
          const pts: [number, number][] = [
            [cx + s * inner, ny + 1 * u],
            [cx + s * (12 + (long ? 4 : 0)) * u, ny + 1 * u],
            [cx + s * 22 * u, ny + 6 * u],
            [cx + s * 22 * u, f.S],
            [cx + s * (inner + 2 * u), f.S],
          ];
          shape(pts, (x, y) => (long && Math.abs(x + 0.5 - cx) < inner + 2.5 * u ? tint(a, -1) : paint(x, y)));
          if (e.id !== 'vest') {
            // Lapel.
            shape([[cx + s * inner, ny + 1 * u], [cx + s * (inner + 6 * u), ny + 1 * u], [cx + s * (inner + 1.5 * u), ny + 9 * u]], (_x, y) => tint(long ? a : c, y < ny + 3 * u ? 1 : 0, kind));
          }
        }
        if (e.id === 'robe' && e.accent) rect(cx - 14 * u, ny - 1 * u, 28 * u, 2 * u, (x) => tint(a, x < cx ? 1 : 0));
        break;
      }
      case 'apron': {
        const w = 14 * u;
        shape([[cx - w / 2, ny + 3 * u], [cx + w / 2, ny + 3 * u], [cx + w / 2 + 2 * u, f.S], [cx - w / 2 - 2 * u, f.S]], (x, y) => (y < ny + 4.5 * u ? tint(a, 0) : paint(x, y)));
        for (const s of [-1, 1]) line(cx + s * (w / 2 - 1 * u), ny + 3 * u, cx + s * 11 * u, ny - 3 * u, tint(a, 0));
        break;
      }
      case 'sash':
        shape([[cx + 14 * u, ny], [cx + 19 * u, ny + 2 * u], [cx - 2 * u, f.S], [cx - 7 * u, f.S]], (x, y) => tint(c, (x + y) % 5 === 0 ? -1 : 0));
        break;
      case 'suspenders':
        for (const s of [-1, 1]) rect(cx + s * 7 * u - 1.2 * u, ny + 2 * u, 2.4 * u, f.S - ny, (x) => tint(c, x > cx + s * 7 * u ? -1 : 0));
        break;
      case 'scarf':
      case 'bandana': {
        oval(cx, ny + 1.5 * u, 11 * u, 4 * u, (x, y) => tint(c, y < ny ? 1 : x > cx + 5 * u ? -1 : Math.floor((x + y) / (3 * u)) % 3 === 0 ? -1 : 0));
        if (e.id === 'scarf') rect(cx + 2 * u, ny + 3 * u, 5 * u, f.S - ny, (x, y) => tint(a, Math.floor(y / (2 * u)) % 2 ? -1 : x < cx + 3 * u ? 1 : 0));
        else shape([[cx - 5 * u, ny + 2 * u], [cx + 5 * u, ny + 2 * u], [cx, ny + 10 * u]], (x) => tint(c, x > cx ? -1 : 0));
        break;
      }
      case 'tie':
        shape([[cx - 1.5 * u, ny + 1 * u], [cx + 1.5 * u, ny + 1 * u], [cx + 2.5 * u, f.S], [cx - 2.5 * u, f.S]], (x, y) => (e.accent && Math.floor((y - x) / (2 * u)) % 2 ? e.accent : tint(c, x > cx ? -1 : 0)));
        rect(cx - 2 * u, ny - 0.5 * u, 4 * u, 2.5 * u, tint(c, 1));
        break;
      case 'bowtie':
        shape([[cx - 7 * u, ny - 1 * u], [cx, ny + 1.5 * u], [cx - 7 * u, ny + 4 * u]], (_x, y) => tint(c, y < ny + 1 * u ? 0 : -1));
        shape([[cx + 7 * u, ny - 1 * u], [cx, ny + 1.5 * u], [cx + 7 * u, ny + 4 * u]], (_x, y) => tint(c, y < ny + 1 * u ? -1 : -2));
        rect(cx - 1.5 * u, ny, 3 * u, 3 * u, tint(c, 1));
        break;
      case 'pearls':
        layer({ flat: true });
        for (let i = -5; i <= 5; i++) {
          const t = i / 5;
          oval(cx + i * 2.2 * u, ny + 1.5 * u + (1 - t * t) * 4 * u, 1.3 * u, 1.3 * u, (x, y) => (x < cx + i * 2.2 * u && y < ny + 1.5 * u + (1 - t * t) * 4 * u ? '#fff6ea' : '#e6d6c8'));
        }
        break;
      case 'medal':
      case 'whistle':
      case 'lanyard':
      case 'camera':
      case 'stethoscope': {
        layer({ sh: 0.2 });
        const ey0 = ny + 12 * u;
        line(cx - 7 * u, ny - 1 * u, cx - 1 * u, ey0, tint(a, 0));
        line(cx + 7 * u, ny - 1 * u, cx + 1 * u, ey0, tint(a, -1));
        if (e.id === 'medal') oval(cx, ey0 + 2 * u, 3.2 * u, 3.2 * u, (x, y) => tint(c, x < cx - 1 * u && y < ey0 + 1.5 * u ? 2 : y > ey0 + 3 * u ? -1 : 0, 'metal'));
        else if (e.id === 'whistle') rect(cx - 2 * u, ey0, 5 * u, 2.5 * u, (_x, y) => tint(c, y < ey0 + 1 * u ? 1 : 0, 'metal'));
        else if (e.id === 'lanyard') {
          rect(cx - 3 * u, ey0, 6 * u, 7 * u, (_x, y) => (y < ey0 + 1 * u ? tint(c, 0) : '#fbf6ec'));
          rect(cx - 2 * u, ey0 + 2.5 * u, 4 * u, 1, '#8a8aa0');
          rect(cx - 2 * u, ey0 + 4.5 * u, 3 * u, 1, '#8a8aa0');
        } else if (e.id === 'camera') {
          rect(cx - 5 * u, ey0, 10 * u, 7 * u, (x, y) => tint(c, y < ey0 + 1.5 * u ? 1 : x > cx + 3 * u ? -1 : 0));
          oval(cx, ey0 + 3.5 * u, 2.4 * u, 2.4 * u, (x, y) => (x < cx - 0.5 * u && y < ey0 + 3 * u ? '#d8ecf8' : '#a8c8e8'));
        } else {
          rect(cx - 1 * u, ey0, 2 * u, 4 * u, tint(c, 0, 'metal'));
          oval(cx, ey0 + 5 * u, 2.5 * u, 2 * u, tint(c, 1, 'metal'));
        }
        break;
      }
      case 'headphones':
        for (const s of [-1, 1]) rect(cx + s * 9 * u - 3 * u, ny - 2 * u, 6 * u, 7 * u, (x, y) => toneAt(cr, y < ny - 1 * u ? 1 : x > cx + s * 9 * u + 1 * u ? -1 : 0));
        rect(cx - 7 * u, ny + 1 * u, 14 * u, 2.5 * u, (x) => tint(a, x > cx + 3 * u ? -1 : 0));
        break;
      case 'tape-measure':
        for (const s of [-1, 1]) rect(cx + s * 8 * u - 1.2 * u, ny - 1 * u, 2.4 * u, f.S - ny, (_x, y) => (Math.floor(y / (2 * u)) % 2 ? tint(c, -1) : tint(c, 0)));
        rect(cx - 9 * u, ny - 2.5 * u, 18 * u, 2 * u, tint(c, 0));
        break;
    }
  }
  void H;
}

// ---- creatures ----

function drawBearPortrait(f: PF): void {
  const u = f.u;
  const fur = f.sk;
  const muzC = mixc(f.look.skin, '#d8a878', 0.7);
  const muz = ramp(muzC, 'fur');
  const inner = mixc(f.look.skin, '#e8a0a0', 0.4);
  layer({ sh: 0.3 });
  for (const s of [-1, 1]) {
    const ex = f.cx + s * f.rx * 0.78;
    const ey = f.cy - f.ry * 0.8;
    oval(ex, ey, 6 * u, 6 * u, (x, y) => toneAt(fur, toneIdx(formV((x + 0.5 - ex) / (6 * u), (ey - y - 0.5) / (6 * u), LAT, UP), true)));
    oval(ex, ey + 0.5 * u, 3.2 * u, 3.2 * u, (_x, y) => (y < ey ? inner : shA(inner, 0.2)));
  }
  layer({ sh: 0.3 });
  facePaint(f, 0, (x, y) => {
    const c = skinAt(f, x, y, fur);
    return (x * 5 + y * 3) % 11 === 0 ? toneAt(fur, -1) : c;
  });
  oval(f.cx, f.mouthY + 1 * u, 9 * u, 6.5 * u, (x, y) => toneAt(muz, toneIdx(formV((x + 0.5 - f.cx) / (9 * u), (f.mouthY - y) / (6.5 * u), LAT, UP), true)));
  oval(f.cx, f.mouthY - 2.5 * u, 3.2 * u, 2.2 * u, (x, y) => (x < f.cx - 1 * u && y < f.mouthY - 3 * u ? '#5a4a60' : INK));
  drect(f.cx - 0.5 * u, f.mouthY, 1, 2.5 * u, toneAt(muz, -1));
  const expr = f.expr;
  if (expr === 'happy' || expr === 'love' || expr === 'surprised') oval(f.cx, f.mouthY + 3.5 * u, expr === 'surprised' ? 2.2 * u : 3.5 * u, 2 * u, (_x, y) => (y > f.mouthY + 4 * u ? TONGUE : LIP_DARK));
  else if (expr === 'angry') rect(f.cx - 3.5 * u, f.mouthY + 2.5 * u, 7 * u, 1.5 * u, (x) => (Math.floor(x / (1.5 * u)) % 2 ? TOOTH : LIP_DARK));
  else dline(f.cx - 3 * u, f.mouthY + 3 * u, f.cx + 3 * u, f.mouthY + 3 * u, toneAt(muz, -2));
  layer({ flat: true });
  for (const s of [-1, 1]) {
    const ex = s < 0 ? f.eyeL : f.eyeR;
    const ey = f.eyeY;
    if (expr === 'happy' || expr === 'love') {
      for (let i = 0; i <= 5 * u; i++) drect(ex - 2.5 * u + i, ey - Math.sin((i / (5 * u)) * Math.PI) * 2 * u + 1 * u, 1, Math.max(1, u), INK);
      continue;
    }
    const r = expr === 'surprised' ? 2.6 * u : 2.1 * u;
    oval(ex, ey, r, r + 0.4 * u, INK);
    drect(ex - 1.2 * u, ey - 1.4 * u, Math.max(1, u), Math.max(1, u), EYE_SHINE);
    if (expr === 'angry') drect(ex - 3 * u, ey - 3 * u, 6 * u, 1.5 * u, toneAt(fur, -2));
  }
  dpx(f.cx - 9 * u, f.eyeY + 4 * u, mixc(fur.m, BLUSH, 0.5));
  dpx(f.cx + 9 * u, f.eyeY + 4 * u, mixc(fur.m, BLUSH, 0.5));
  drawHatsP(f);
}

function drawRaccoonPortrait(f: PF): void {
  const u = f.u;
  const furC = f.look.skin || '#8a8aa0';
  const fur = ramp(furC, 'fur');
  const belly = ramp(mixc(furC, '#ece6ee', 0.6), 'fur');
  const mask = ramp('#3a3448', 'fur');
  const inner = mixc(furC, '#e8a0a0', 0.5);
  layer({ sh: 0.3 });
  // Ears.
  for (const s of [-1, 1]) {
    const ex = f.cx + s * f.rx * 0.72;
    const ey = f.cy - f.ry * 0.72;
    shape([[ex - 5 * u, ey + 4 * u], [ex + 5 * u, ey + 4 * u], [ex + s * 1.5 * u, ey - 8 * u]], (x, y) => toneAt(fur, x < ex - 1 * u ? 1 : y > ey ? -1 : 0));
    shape([[ex - 2.5 * u, ey + 3 * u], [ex + 2.5 * u, ey + 3 * u], [ex + s * 1 * u, ey - 4 * u]], (_x, y) => (y < ey - 1 * u ? inner : shA(inner, 0.2)));
    if (f.look.features?.includes('notch') && s > 0) shape([[ex + 1 * u, ey - 7 * u], [ex + 4 * u, ey - 7 * u], [ex + 3 * u, ey - 3 * u]], null as unknown as Color);
  }
  layer({ sh: 0.3 });
  oval(f.cx, f.cy + 1 * u, f.rx, f.ry * 0.9, (x, y) => {
    const dx = (x + 0.5 - f.cx) / f.rx;
    const dy = (y + 0.5 - f.cy - 1 * u) / (f.ry * 0.9);
    const nz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
    const v = dx * -0.62 + dy * -0.78 + nz * 0.5 - 0.2;
    const tuft = (x * 5 + y * 3) % 9 === 0;
    return toneAt(fur, toneIdx(v, true) - (tuft ? 1 : 0));
  });
  // Mask band across the eyes, white brow patches and muzzle.
  for (let y = Math.round(f.eyeY - 4 * u); y <= f.eyeY + 4 * u; y++)
    for (let x = Math.round(f.cx - f.rx); x <= f.cx + f.rx; x++) {
      const dx = (x + 0.5 - f.cx) / f.rx;
      const dy = (y + 0.5 - f.cy - 1 * u) / (f.ry * 0.9);
      if (dx * dx + dy * dy > 0.95) continue;
      const edge = Math.abs(y - f.eyeY) > 3.2 * u - Math.abs(dx) * 2 * u;
      if (edge) continue;
      P(x, y, pt(toneAt(mask, y > f.eyeY + 1 * u ? -1 : x < f.cx - 6 * u ? 1 : 0)));
    }
  for (const s of [-1, 1]) oval(f.cx + s * 7 * u, f.eyeY - 5.5 * u, 3.5 * u, 1.8 * u, '#f4f0f4');
  oval(f.cx, f.mouthY, 7 * u, 4.5 * u, (x, y) => toneAt(belly, y > f.mouthY + 1 * u ? -1 : x < f.cx - 2 * u ? 1 : 0));
  oval(f.cx, f.mouthY - 2 * u, 2.4 * u, 1.8 * u, (x, y) => (x < f.cx - 0.5 * u && y < f.mouthY - 2.5 * u ? '#5a4a60' : INK));
  const expr = f.expr;
  if (expr === 'happy' || expr === 'love' || expr === 'surprised') oval(f.cx, f.mouthY + 2.2 * u, 2.5 * u, 1.5 * u, (_x, y) => (y > f.mouthY + 2.5 * u ? TONGUE : LIP_DARK));
  else dline(f.cx - 2 * u, f.mouthY + 1.5 * u, f.cx + 2 * u, f.mouthY + 1.5 * u, toneAt(belly, -2));
  layer({ flat: true });
  for (const s of [-1, 1]) {
    const ex = s < 0 ? f.eyeL : f.eyeR;
    const ey = f.eyeY;
    if (expr === 'happy' || expr === 'love') {
      for (let i = 0; i <= 5 * u; i++) drect(ex - 2.5 * u + i, ey - Math.sin((i / (5 * u)) * Math.PI) * 2 * u + 1 * u, 1, Math.max(1, u), INK);
      continue;
    }
    const r = expr === 'surprised' ? 2.8 * u : 2.3 * u;
    oval(ex, ey, r, r, (_x, y) => (y > ey + 0.5 * u ? '#4a3a5a' : INK));
    drect(ex - 1.3 * u, ey - 1.4 * u, Math.max(1, Math.round(1.2 * u)), Math.max(1, Math.round(1.2 * u)), EYE_SHINE);
    if (expr === 'angry') drect(ex - 3 * u, ey - 3.5 * u, 6 * u, 1.5 * u, mask.d2);
  }
  if (f.look.extras?.some((e) => e.id === 'headset')) {
    const top = f.cy - f.ry;
    for (let x = Math.round(f.cx - f.rx * 0.8); x <= f.cx + f.rx * 0.8; x++) drect(x, top + 2 * u - Math.sqrt(Math.max(0, 1 - ((x - f.cx) / (f.rx * 0.8)) ** 2)) * 4 * u, 1, 2 * u, '#3a3448');
    drect(f.cx + f.rx * 0.75 - 1 * u, f.eyeY - 3 * u, 3 * u, 6 * u, '#3a3448');
    dline(f.cx + f.rx * 0.75, f.eyeY + 2 * u, f.cx + 4 * u, f.mouthY + 3 * u, '#3a3448');
  }
  if (f.look.extras?.some((e) => e.id === 'medal')) {
    layer({ sh: 0.2 });
    line(f.cx - 6 * u, f.neckY, f.cx, f.neckY + 7 * u, '#b8b8c4');
    line(f.cx + 6 * u, f.neckY, f.cx, f.neckY + 7 * u, '#8a8aa0');
    oval(f.cx, f.neckY + 9 * u, 3 * u, 3 * u, (x, y) => tint('#dcdae6', x < f.cx - 1 * u && y < f.neckY + 8 * u ? 2 : 0, 'metal'));
  }
}

// ---- entry ----

export function buildPortrait(look: Look, expr: Expression, S: number, bg: boolean): HTMLCanvasElement {
  const u = S / 64;
  const out = document.createElement('canvas');
  out.width = S;
  out.height = S;
  const octx = out.getContext('2d')!;
  octx.imageSmoothingEnabled = false;
  if (bg) {
    const bgS = mkSpr(S, S, () => {
      const stops = PORTRAIT_BG.map((c, i) => mixc(c, look.topColor || c, i === 3 ? 0.2 : 0.06));
      VG(0, 0, S, S, stops, 0.6);
      // Spotlight behind the head and a cool vignette at the bottom corners.
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) {
          const d = Math.hypot((x - S * 0.42) / (S * 0.42), (y - S * 0.36) / (S * 0.4));
          if (d < 1 && dth(x, y, Math.round((1 - d) * 9))) P(x, y, (xx, yy, o) => mixc(o, '#fff2cf', 0.5 + (xx + yy) * 0));
          const v = Math.hypot((x - S / 2) / (S * 0.6), (y - S * 0.3) / (S * 0.75));
          if (v > 1 && dth(x, y, Math.round((v - 1) * 20))) P(x, y, (_xx, _yy, o) => shA(o, 0.18));
        }
    });
    octx.drawImage(toCanvas(bgS), 0, 0);
  }
  setLight(false);
  const m = metrics(look);
  const def: PoseDef = { view: 'front', torso: 0, head: 0, armF: { a: 0, b: 0 }, armB: { a: 0, b: 0 }, legF: { a: 0, b: 0 }, legB: { a: 0, b: 0 }, expr: 'neutral' };
  const rig = solve(def, m);
  beginLayers(S, S);
  makeBC(look, m, rig, S >> 1, S - 4, 0);
  const bear = look.species === 'bear';
  const raccoon = look.species === 'raccoon';
  const wide = look.head === 'wide' || look.body === 'giant' || look.body === 'heavy' || bear;
  const long = look.head === 'long';
  const rx = (wide ? 15.5 : raccoon ? 14 : 14) * u;
  const ry = (long ? 17.5 : raccoon ? 13 : bear ? 16 : 16.5) * u;
  const cx = S / 2;
  const cy = (raccoon ? 31 : 29) * u;
  const eyeY = cy + ry * (raccoon ? 0.02 : 0.05);
  const eyeGap = (raccoon ? 6.5 : 7) * u;
  const f: PF = {
    u, S, cx, cy, rx, ry, eyeY,
    eyeL: cx - eyeGap, eyeR: cx + eyeGap,
    eW: 7 * u, eH: 5 * u,
    mouthY: cy + ry * 0.58,
    chin: cy + ry,
    neckY: cy + ry + 3 * u,
    expr, look,
    sk: ramp(look.skin, bear || raccoon ? 'fur' : 'skin'),
    hr: ramp(look.hairColor, 'hair'),
    masked: !!look.mask && look.mask !== 'none',
    faceFree: !look.mask || look.mask === 'none' || look.mask === 'domino' || look.mask === 'half',
  };
  const spr = mkSpr(S, S, () => {
    // Capes and robes behind the shoulders.
    for (const e of look.extras ?? []) {
      if (e.id !== 'cape' && e.id !== 'moth-wings' && e.id !== 'wings') continue;
      layer({ sh: 0.3, cast: false });
      const c = e.color;
      const a = e.accent ?? (shA(c, 0.25) as unknown as string);
      shape([[cx - 24 * u, f.neckY - 2 * u], [cx + 24 * u, f.neckY - 2 * u], [cx + 30 * u, S], [cx - 30 * u, S]], (x, y) => tint(pattern(e.pattern, x, y, c, a, 2 * u, 0), toneIdx(formV((x + 0.5 - cx) / (26 * u), 0, LAT, UP), true) - (Math.floor((x - cx + 200) / (6 * u)) % 3 === 0 ? 1 : 0)));
    }
    if (!raccoon) drawHairBackP(f);
    drawPortraitBody(f);
    if (raccoon) {
      drawRaccoonPortrait(f);
      return;
    }
    drawNeck(f);
    drawNeckwearP(f);
    if (bear) {
      drawBearPortrait(f);
      return;
    }
    drawEars(f);
    drawHeadSkin(f);
    if (f.faceFree) {
      drawCheeks(f);
      drawFacialHair(f);
    }
    // Face paint.
    drawPaintP(f);
    drawMaskP(f);
    if (look.mask !== 'hood' && look.mask !== 'moth') {
      drawEyes(f);
      if (!f.masked || look.mask === 'domino') drawBrows(f);
    }
    if (f.faceFree || look.mask === 'luchador') drawMouth(f);
    drawHairP(f);
    drawGlassesP(f);
    drawHatsP(f);
  });
  lightPass(spr);
  const { s: cs, ox, oy, lay, flg } = crop(spr);
  const o = finish(cs, lay, flg, true);
  octx.drawImage(toCanvas(o), ox - 1, oy - 1);
  return out;
}

function drawPaintP(f: PF): void {
  const L = f.look;
  const p = L.paint;
  if (!p || p === 'none' || !f.faceFree) return;
  const u = f.u;
  const pc = L.paintColor ?? '#fbf0d9';
  const pp = (x: number, y: number, c: Color = pc) => {
    if (inFace(f, x, y)) P(x, y, pt(x > f.cx + f.rx * 0.5 ? tint(c, -1) : c));
  };
  const eyes = [f.eyeL, f.eyeR];
  const ey = f.eyeY;
  switch (p) {
    case 'stripes':
      for (const e of eyes) for (let i = -4; i <= 4; i++) for (let k = 0; k < 2 * u; k++) pp(e + i * u, ey + 6 * u + k);
      break;
    case 'skull':
      facePaint(f, 0, (x, y) => pp(x, y) as unknown as Color);
      for (const e of eyes) oval(e, ey, 5 * u, 4.5 * u, INK);
      for (let i = -4; i <= 4; i += 2) rect(f.cx + i * u, f.mouthY, 1.2 * u, 3 * u, INK);
      break;
    case 'star':
      for (const [dx, dy] of [[0, -6], [-2, -3], [2, -3], [-6, 0], [6, 0], [-3, 5], [3, 5], [0, 8], [0, 0], [-1, -1], [1, -1], [-1, 1], [1, 1], [-3, 0], [3, 0], [0, 3], [0, -3]]) for (let k = 0; k < u; k++) pp(f.eyeR + dx * u + k, ey + dy * u);
      break;
    case 'tribal':
      for (const e of eyes) {
        const o = e === f.eyeL ? -1 : 1;
        for (let i = 0; i < 8; i++) for (let k = 0; k < 2 * u; k++) pp(e + o * (3 + i) * u + k, ey + (4 - i * 0.8) * u);
        for (let i = 0; i < 6; i++) for (let k = 0; k < 2 * u; k++) pp(e + o * (6 + i * 0.3) * u + k, ey - i * u);
      }
      break;
    case 'tears':
      for (const e of eyes) {
        rect(e - 1 * u, ey + 4 * u, 2 * u, 8 * u, pc);
        rect(e - 1 * u, ey - 7 * u, 2 * u, 3 * u, pc);
      }
      break;
    case 'split':
      for (let y = Math.round(f.cy - f.ry); y <= f.cy + f.ry; y++) for (let x = Math.round(f.cx); x <= f.cx + f.rx; x++) pp(x, y);
      break;
    case 'peak': {
      const top = f.cy - f.ry + 2 * u;
      const base = ey + 2 * u;
      for (let y = Math.round(top); y <= base; y++)
        for (let x = Math.round(f.cx - f.rx); x <= f.cx + f.rx; x++) {
          const ax = Math.abs(x + 0.5 - f.cx);
          const lim = ((y - top) / (base - top)) * (f.rx + 2 * u) + 2 * u;
          if (ax > lim) continue;
          const snow = y < top + (base - top) * 0.42 + (Math.floor(x / (2 * u)) % 2 ? 1.5 * u : 0);
          pp(x, y, snow ? '#f4f2fa' : pc);
        }
      break;
    }
    case 'sparkle':
      for (const e of eyes) for (let i = 0; i < 6; i++) dpx(e + (hash2(i, 1, 4) * 10 - 5) * u, ey + (3 + hash2(i, 2, 4) * 6) * u, i % 2 ? '#fff6c0' : pc);
      break;
    case 'heart': {
      const e = f.eyeR + 2 * u;
      const hy = ey + 6 * u;
      for (let dy = -1; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if ((dy <= 0 && Math.abs(dx) <= 2 && !(dy === -1 && dx === 0)) || (dy === 1 && Math.abs(dx) <= 1) || (dy === 2 && dx === 0)) rect(e + dx * u, hy + dy * u, u, u, pc);
      break;
    }
  }
}

export { EYE_WHITE, line };
