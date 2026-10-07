import type { Dir } from '../../core/state';
import { mixc, P, shA, type Spr, mkSpr, type Color } from '../kit';
import type { Look } from '../look';
import { K, type Pose } from './body';
import { EYE_SHINE, INK, LIP_DARK, ramp, toneAt, type Ramp } from './palette';
import { beginLayers, cyl, dline, dpx, drect, formV, layer, oval, pt, rect, shape, toneIdx, type Src } from './raster';

/**
 * Jobber the raccoon: a small, round, very fluffy creature with a ringed
 * tail, a bandit mask, a cream muzzle and tiny clever hands. Walks on all
 * fours, sits up to beg, stands on hind legs to celebrate. Designed in native
 * pixels on a 32-px sheet and painted at K art pixels per native pixel.
 */
export const RACCOON_SHEET = 32;

export function buildRaccoon(look: Look, pose: Pose, facing: Dir, frame: number, blink: boolean): Spr {
  const S = RACCOON_SHEET * K;
  beginLayers(S, S);
  const k = K;
  const fur = look.skin || '#8a8aa0';
  const fr = ramp(fur, 'fur');
  const farR = ramp(shA(fur, 0.2), 'fur');
  const bellyC = mixc(fur, '#ece6ee', 0.6);
  const br = ramp(bellyC, 'fur');
  const maskC = '#3a3448';
  const mr = ramp(maskC, 'fur');
  const tr = ramp('#3a3448', 'fur');
  const earIn = mixc(fur, '#e8a0a0', 0.5);
  const side = facing === 'left' || facing === 'right';
  const standing = pose === 'celebrate' || pose === 'taunt' || pose === 'wave' || pose === 'fireup';
  const lying = pose === 'down' || pose === 'pinned' || pose === 'lifted';
  const ex0 = look.extras ?? [];
  const LAT = { x: 1, y: 0 };
  const UP = { x: 0, y: -1 };
  // Scaled primitives: coordinates in native sheet units.
  const R = (v: number) => Math.round(v * k);
  const OV = (cx: number, cy: number, rx: number, ry: number, c: Src) => oval(cx * k, cy * k, rx * k, ry * k, c);
  const RC = (x: number, y: number, w: number, h: number, c: Src) => rect(x * k, y * k, w * k, h * k, c);
  const DR = (x: number, y: number, w: number, h: number, c: Color) => drect(x * k, y * k, Math.max(1, w * k), Math.max(1, h * k), c);
  const DP = (x: number, y: number, c: Color) => DR(x, y, 0.5, 0.5, c);
  const SH = (pts: [number, number][], c: Src) => shape(pts.map(([x, y]) => [x * k, y * k] as [number, number]), c);
  const CY = (x0: number, y0: number, x1: number, y1: number, d0: number, d1: number, r: Ramp) => cyl(x0 * k, y0 * k, x1 * k, y1 * k, d0 * k, d1 * k, r);
  const DL = (x0: number, y0: number, x1: number, y1: number, c: Color) => dline(x0 * k, y0 * k, x1 * k, y1 * k, c);
  const furAt = (cx: number, cy: number, rx: number, ry: number, r = fr) => (x: number, y: number) => {
    const dx = (x + 0.5 - cx * k) / (rx * k);
    const dy = (y + 0.5 - cy * k) / (ry * k);
    let idx = toneIdx(formV(dx, -dy, LAT, UP), rx * k >= 3 * k);
    // Fur tufts: short dark ticks and the odd lit hair along the lower half.
    if ((x * 5 + y * 3) % 7 === 0 && idx === 0) idx = -1;
    else if ((x * 3 + y * 7) % 11 === 0 && dy > 0 && idx < 1) idx += 1;
    return toneAt(r, idx);
  };
  const ring = (cx: number, cy: number, d: number, dark: boolean) => {
    const r = dark ? tr : fr;
    OV(cx, cy, d / 2, d / 2, furAt(cx, cy, d / 2, d / 2, r));
  };
  const eyeAt = (x: number, y: number, blinkNow: boolean, closedC: Color) => {
    // A 3-px eye at K = 2: ink with a shine and a lower lid glint.
    const n = Math.max(2, Math.round(1.5 * k));
    if (blinkNow) {
      drect(R(x) - 1, R(y) + n - 2, n + 1, 1, closedC);
      return;
    }
    drect(R(x) - 1, R(y) - 1, n + 1, n + 1, INK);
    dpx(R(x) - 1, R(y) - 1, EYE_SHINE);
    dpx(R(x) + n - 1, R(y) + n - 1, '#5a4a7a');
  };
  return mkSpr(S, S, () => {
    const by = RACCOON_SHEET - 6;
    if (side && !standing && !lying) {
      // On all fours, facing right.
      const f = frame & 3;
      const lift = pose === 'walk' ? [0, 1, 0, 1][f] : 0;
      layer({ sh: 0.3 });
      // Ringed tail curling up behind.
      for (let i = 0; i < 9; i++) {
        const x = 9 - i * 0.75;
        const y = by - 4 - i * 0.9 + Math.sin(i * 0.6) * 0.8;
        ring(x, y, 3.4 - i * 0.12, Math.floor(i / 2) % 2 === 1);
      }
      layer({ sh: 0.3 });
      const legs = pose === 'walk' ? [[-1, 1], [1, -1], [-1, 1], [1, -1]][f] : [0, 0];
      for (const [lx, sw, far] of [[11, legs[0], 1], [14, legs[1], 0], [19, legs[1], 1], [22, legs[0], 0]] as const) {
        CY(lx + 0.5, by - 4, lx + 0.5 + sw, by - 1, 2, 2, far ? farR : fr);
        RC(lx + sw - 0.5, by - 1.5, 2, 1, far ? mr.d1 : mr.m); // paw
        DP(lx + sw, by - 1, far ? mr.d2 : mr.d1);
      }
      layer({ sh: 0.3 });
      OV(16.5, by - 5 - lift * 0.5, 7, 3.6, furAt(16.5, by - 5, 7, 3.6));
      OV(16, by - 3.5 - lift * 0.5, 4.5, 1.6, furAt(16, by - 3.5, 4.5, 1.6, br));
      layer({ sh: 0.3 });
      const hy = by - 7 - lift * 0.5;
      OV(23.5, hy, 3.8, 3.3, furAt(23.5, hy, 3.8, 3.3));
      SH([[21, hy - 2.5], [22.5, hy - 5.5], [24, hy - 2.5]], (x, y) => (Math.abs(x - 22.4 * k) < 0.6 * k && y > (hy - 5) * k ? earIn : x < 22 * k ? fr.l1 : fr.m));
      RC(22, hy - 1, 5, 2, (x, y) => toneAt(mr, y < (hy - 1) * k + 1 ? 0 : -1));
      RC(22.5, hy - 2, 1.5, 0.5, '#f4f0f4'); // brow patch
      OV(27, hy + 1, 1.7, 1.3, (x, y) => toneAt(br, y > (hy + 1) * k ? -1 : 0));
      DR(27.5, hy + 0.2, 1, 0.8, INK);
      DP(27.5, hy + 0.2, '#5a4a60');
      eyeAt(24.5, hy - 1, blink, mr.d1);
      if (look.features?.includes('notch')) RC(22, hy - 4.5, 0.5, 1, null);
      if (ex0.some((e) => e.id === 'headset')) DL(21, hy - 3, 26, hy - 3, '#3a3448');
    } else if (lying) {
      layer({ sh: 0.3 });
      OV(16, by - 3, 8, 3, furAt(16, by - 3, 8, 3));
      OV(16, by - 3.5, 5, 1.6, furAt(16, by - 3.5, 5, 1.6, br));
      OV(24, by - 4, 3.5, 3, furAt(24, by - 4, 3.5, 3));
      RC(22.5, by - 5, 4, 1.5, (x, y) => toneAt(mr, y < (by - 5) * k + 1 ? 0 : -1));
      eyeAt(24, by - 5, false, mr.d1);
      for (let i = 0; i < 6; i++) ring(7 - i, by - 2 - (i % 2), 2.6, i % 2 === 1);
      for (const lx of [12, 15, 18, 21]) RC(lx, by - 7, 1, 2, (x, y) => (y < (by - 7) * k + 1 ? fr.m : fr.d1));
      SH([[26, by - 6], [27, by - 8.5], [28, by - 6]], (x) => (x < 27 * k ? fr.l1 : fr.m));
    } else {
      // Sitting up (front or back), or standing with arms raised.
      const back = facing === 'up';
      const up = standing ? 3 : 0;
      layer({ sh: 0.3 });
      for (let i = 0; i < 8; i++) ring(22 + Math.sin(i * 0.5) * 1.5, by - 1 - i * 1.15, 3.2, Math.floor(i / 2) % 2 === 1);
      layer({ sh: 0.3 });
      OV(16, by - 5 - up, 5.2, 5.5 + up * 0.4, furAt(16, by - 5 - up, 5.2, 5.5));
      if (!back) OV(16, by - 4.5 - up, 3, 3.8, furAt(16, by - 4.5 - up, 3, 3.8, br));
      RC(12, by - 1, 3, 1, (x, y) => (y < (by - 1) * k + 1 ? mr.m : mr.d1));
      RC(17, by - 1, 3, 1, (x, y) => (y < (by - 1) * k + 1 ? mr.m : mr.d1));
      layer({ sh: 0.3 });
      if (standing) {
        CY(11, by - 9 - up, 9, by - 15 - (frame & 1), 2, 2, fr);
        CY(21, by - 9 - up, 23, by - 15 - (frame & 1 ? 0 : 1), 2, 2, fr);
        RC(8.5, by - 16.5 - (frame & 1), 1.5, 1, mr.m);
        RC(22.5, by - 16.5 - (frame & 1 ? 0 : 1), 1.5, 1, mr.m);
      } else {
        RC(13, by - 7, 2, 2, (x, y) => (y < (by - 6) * k ? fr.m : x < 14 * k ? mr.m : mr.d1));
        RC(17, by - 7, 2, 2, (x, y) => (y < (by - 6) * k ? fr.m : x < 18 * k ? mr.m : mr.d1));
      }
      layer({ sh: 0.3 });
      const hy = by - 13 - up;
      OV(16, hy, 4.8, 3.9, furAt(16, hy, 4.8, 3.9));
      SH([[11.5, hy - 1], [12.5, hy - 5.5], [14.5, hy - 2.5]], (x, y) => (Math.abs(x - 12.6 * k) < 0.6 * k && y > (hy - 5) * k && y < (hy - 2) * k ? earIn : fr.l1));
      SH([[17.5, hy - 2.5], [19.5, hy - 5.5], [20.5, hy - 1]], (x, y) => (Math.abs(x - 19.4 * k) < 0.6 * k && y > (hy - 5) * k && y < (hy - 2) * k ? earIn : fr.m));
      if (look.features?.includes('notch')) RC(19, hy - 5, 0.5, 1, null);
      if (!back) {
        RC(12, hy - 1, 8, 2, (x, y) => toneAt(mr, y < (hy - 1) * k + 1 ? 0 : -1));
        // Brow patches and the cream muzzle.
        RC(12.5, hy - 2, 1.5, 0.5, '#f4f0f4');
        RC(18, hy - 2, 1.5, 0.5, '#f4f0f4');
        OV(16, hy + 2, 2.2, 1.5, (x, y) => toneAt(br, y > (hy + 2) * k ? -1 : 0));
        DR(15.5, hy + 1, 1, 0.8, INK);
        DP(15.5, hy + 1, '#5a4a60');
        eyeAt(13.5, hy - 0.5, blink, mr.d1);
        eyeAt(17.5, hy - 0.5, blink, mr.d1);
        if (pose === 'celebrate' || pose === 'wave') DR(15.5, hy + 2.5, 1, 0.5, LIP_DARK);
        if (ex0.some((e) => e.id === 'medal')) {
          DL(15, by - 9 - up, 16, by - 8 - up, '#8a8aa0');
          DR(15, by - 8 - up, 1, 1, '#b8b8c4');
          DP(15, by - 8 - up, '#f0eef4');
        }
        if (ex0.some((e) => e.id === 'pretzel') && !standing) {
          RC(14, by - 8, 4, 2, (x, y) => (y < (by - 8) * k + 1 ? '#e0924a' : (x + y) % 3 === 0 ? '#a85a28' : '#b86a30'));
          DP(15, by - 8, '#f6e0bc');
          DP(16, by - 7, '#fff6ea');
        }
      }
      if (ex0.some((e) => e.id === 'headset')) {
        DL(12, hy - 2, 20, hy - 2, '#3a3448');
        if (!back) {
          DR(12, hy - 1.5, 0.5, 2, '#3a3448');
          DL(12, hy + 1, 14, hy + 2.5, '#3a3448');
        }
      }
    }
    void pt;
    void P;
  });
}
