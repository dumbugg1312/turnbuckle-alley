import type { Dir } from '../../core/state';
import { mixc, P, shA, type Spr, mkSpr } from '../kit';
import type { Look } from '../look';
import type { Pose } from './body';
import { EYE_SHINE, INK, LIP_DARK, ramp, toneAt } from './palette';
import { beginLayers, cyl, dline, dpx, drect, formV, layer, oval, px, pt, rect, shape, toneIdx } from './raster';

/**
 * Jobber the raccoon: a small, round, very fluffy creature with a ringed
 * tail, a bandit mask, a cream muzzle and tiny clever hands. Walks on all
 * fours, sits up to beg, stands on hind legs to celebrate.
 */
export function buildRaccoon(look: Look, pose: Pose, facing: Dir, frame: number, blink: boolean): Spr {
  const S = 32;
  beginLayers(S, S);
  const fur = look.skin || '#8a8aa0';
  const fr = ramp(fur, 'fur');
  const bellyC = mixc(fur, '#ece6ee', 0.6);
  const br = ramp(bellyC, 'fur');
  const maskC = '#3a3448';
  const mr = ramp(maskC, 'fur');
  const tailD = '#3a3448';
  const earIn = mixc(fur, '#e8a0a0', 0.5);
  const side = facing === 'left' || facing === 'right';
  const standing = pose === 'celebrate' || pose === 'taunt' || pose === 'wave' || pose === 'fireup';
  const lying = pose === 'down' || pose === 'pinned' || pose === 'lifted';
  const ex0 = look.extras ?? [];
  const LAT = { x: 1, y: 0 };
  const UP = { x: 0, y: -1 };
  const furAt = (cx: number, cy: number, rx: number, ry: number, r = fr) => (x: number, y: number) => {
    const dx = (x + 0.5 - cx) / rx;
    const dy = (y + 0.5 - cy) / ry;
    let idx = toneIdx(formV(dx, -dy, LAT, UP), rx >= 3);
    if ((x * 5 + y * 3) % 7 === 0 && idx === 0) idx = -1; // fur tufts
    return toneAt(r, idx);
  };
  const ring = (cx: number, cy: number, d: number, dark: boolean) => {
    const r = dark ? ramp(tailD, 'fur') : fr;
    oval(cx, cy, d / 2, d / 2, furAt(cx, cy, d / 2, d / 2, r));
  };
  return mkSpr(S, S, () => {
    const by = S - 6;
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
        cyl(lx + 0.5, by - 4, lx + 0.5 + sw, by - 1, 2, 2, far ? ramp(shA(fur, 0.2), 'fur') : fr);
        px(lx + sw, by - 1, far ? mr.d1 : mr.m);
      }
      layer({ sh: 0.3 });
      oval(16.5, by - 5 - lift * 0.5, 7, 3.6, furAt(16.5, by - 5, 7, 3.6));
      oval(16, by - 3.5 - lift * 0.5, 4.5, 1.6, furAt(16, by - 3.5, 4.5, 1.6, br));
      layer({ sh: 0.3 });
      const hy = by - 7 - lift * 0.5;
      oval(23.5, hy, 3.8, 3.3, furAt(23.5, hy, 3.8, 3.3));
      shape([[21, hy - 2.5], [22.5, hy - 5.5], [24, hy - 2.5]], (x, y) => (x === 22 && y > hy - 5 ? earIn : fr.m));
      rect(22, hy - 1, 5, 2, (_x, y) => toneAt(mr, y === Math.round(hy - 1) ? 0 : -1));
      dpx(23, hy - 2, '#f4f0f4');
      oval(27, hy + 1, 1.7, 1.3, (_x, y) => toneAt(br, y > hy + 1 ? -1 : 0));
      dpx(28, hy + 0.5, INK);
      dpx(24.5, hy - 1 + (blink ? 1 : 0), blink ? mr.d1 : EYE_SHINE);
      if (!blink) dpx(25.5, hy - 1, INK);
      if (look.features?.includes('notch')) P(22, hy - 4, null);
      if (ex0.some((e) => e.id === 'headset')) dline(21, hy - 3, 26, hy - 3, '#3a3448');
    } else if (lying) {
      layer({ sh: 0.3 });
      oval(16, by - 3, 8, 3, furAt(16, by - 3, 8, 3));
      oval(16, by - 3.5, 5, 1.6, furAt(16, by - 3.5, 5, 1.6, br));
      oval(24, by - 4, 3.5, 3, furAt(24, by - 4, 3.5, 3));
      rect(22.5, by - 5, 4, 1.5, mr.m);
      dpx(24, by - 5, EYE_SHINE);
      dpx(25, by - 5, INK);
      for (let i = 0; i < 6; i++) ring(7 - i, by - 2 - (i % 2), 2.6, i % 2 === 1);
      for (const lx of [12, 15, 18, 21]) rect(lx, by - 7, 1, 2, fr.d1);
      shape([[26, by - 6], [27, by - 8.5], [28, by - 6]], fr.m);
    } else {
      // Sitting up (front or back), or standing with arms raised.
      const back = facing === 'up';
      const up = standing ? 3 : 0;
      layer({ sh: 0.3 });
      for (let i = 0; i < 8; i++) ring(22 + Math.sin(i * 0.5) * 1.5, by - 1 - i * 1.15, 3.2, Math.floor(i / 2) % 2 === 1);
      layer({ sh: 0.3 });
      oval(16, by - 5 - up, 5.2, 5.5 + up * 0.4, furAt(16, by - 5 - up, 5.2, 5.5));
      if (!back) oval(16, by - 4.5 - up, 3, 3.8, furAt(16, by - 4.5 - up, 3, 3.8, br));
      rect(12, by - 1, 3, 1, mr.d1);
      rect(17, by - 1, 3, 1, mr.d1);
      layer({ sh: 0.3 });
      if (standing) {
        cyl(11, by - 9 - up, 9, by - 15 - (frame & 1), 2, 2, fr);
        cyl(21, by - 9 - up, 23, by - 15 - (frame & 1 ? 0 : 1), 2, 2, fr);
        px(9, by - 16 - (frame & 1), mr.m);
        px(23, by - 16 - (frame & 1 ? 0 : 1), mr.m);
      } else {
        rect(13, by - 7, 2, 2, (_x, y) => (y === by - 7 ? fr.m : mr.m));
        rect(17, by - 7, 2, 2, (_x, y) => (y === by - 7 ? fr.m : mr.d1));
      }
      layer({ sh: 0.3 });
      const hy = by - 13 - up;
      oval(16, hy, 4.8, 3.9, furAt(16, hy, 4.8, 3.9));
      shape([[11.5, hy - 1], [12.5, hy - 5.5], [14.5, hy - 2.5]], (x, y) => (x === 12 && y > hy - 5 && y < hy - 2 ? earIn : fr.l1));
      shape([[17.5, hy - 2.5], [19.5, hy - 5.5], [20.5, hy - 1]], (x, y) => (x === 19 && y > hy - 5 && y < hy - 2 ? earIn : fr.m));
      if (look.features?.includes('notch')) P(19, hy - 5, null);
      if (!back) {
        rect(12, hy - 1, 8, 2, (_x, y) => toneAt(mr, y === Math.round(hy - 1) ? 0 : -1));
        // Brow patches.
        dpx(13, hy - 2, '#f4f0f4');
        dpx(18, hy - 2, '#f4f0f4');
        oval(16, hy + 2, 2.2, 1.5, (_x, y) => toneAt(br, y > hy + 2 ? -1 : 0));
        dpx(15.5, hy + 1.2, INK);
        if (blink) {
          drect(13, hy, 2, 1, mr.d1);
          drect(17, hy, 2, 1, mr.d1);
        } else {
          dpx(13, hy - 1, EYE_SHINE);
          dpx(14, hy - 1, INK);
          dpx(13, hy, INK);
          dpx(14, hy, '#6a5a7a');
          dpx(17, hy - 1, EYE_SHINE);
          dpx(18, hy - 1, INK);
          dpx(17, hy, INK);
          dpx(18, hy, '#6a5a7a');
        }
        if (pose === 'celebrate' || pose === 'wave') dpx(16, hy + 2.5, LIP_DARK);
        if (ex0.some((e) => e.id === 'medal')) {
          dpx(15, by - 8 - up, '#f0eef4');
          dpx(16, by - 8 - up, '#b8b8c4');
          dpx(15.5, by - 9 - up, '#8a8aa0');
        }
        if (ex0.some((e) => e.id === 'pretzel') && !standing) {
          rect(14, by - 8, 4, 2, (_x, y) => (y === by - 8 ? '#e0924a' : '#b86a30'));
          dpx(15, by - 8, '#f6e0bc');
          dpx(16, by - 7, '#fff6ea');
        }
      }
      if (ex0.some((e) => e.id === 'headset')) {
        dline(12, hy - 2, 20, hy - 2, '#3a3448');
        if (!back) dpx(12, hy + 1, '#3a3448');
      }
    }
    void pt;
  });
}
