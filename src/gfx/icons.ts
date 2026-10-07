import { item, type ItemDef } from '../data/items';
import { AK, ell, liA, OUT, P, poly, R, RR, selA, shA, mkSpr, toCanvas } from './kit';

/** 16x16 item icons drawn from each item's icon descriptor. Cached. */
const cache = new Map<string, HTMLCanvasElement>();

export function iconFor(id: string): HTMLCanvasElement {
  const hit = cache.get(id);
  if (hit) return hit;
  const def = item(id);
  const c = toCanvas(OUT(mkSpr(14, 14, () => drawIcon(def)), selA));
  cache.set(id, c);
  return c;
}

function drawIcon(def: ItemDef): void {
  const c = def.icon.color;
  const a = def.icon.accent ?? shA(c, 0.4);
  const d = shA(c, 0.35);
  const l = liA(c, 0.45);
  switch (def.icon.shape) {
    case 'round':
      ell(7, 7, 6, 6, c);
      ell(6, 6, 3, 3, l);
      ell(9, 9, 2, 2, d);
      P(5, 4, '#fff8e0');
      break;
    case 'cup':
      R(3, 4, 8, 8, c);
      R(3, 4, 8, 2, a);
      R(11, 6, 2, 4, c);
      R(4, 10, 6, 2, d);
      P(4, 6, l);
      break;
    case 'box':
      R(2, 3, 10, 9, c);
      R(2, 3, 10, 2, l);
      R(6, 3, 2, 9, a);
      R(2, 10, 10, 2, d);
      break;
    case 'card':
      RR(3, 1, 8, 12, 1, c);
      RR(4, 2, 6, 6, 1, l);
      R(4, 9, 6, 1, a);
      R(4, 11, 4, 1, a);
      break;
    case 'tape':
      R(1, 3, 12, 8, '#2a2a3a');
      R(2, 4, 10, 3, a);
      ell(4.5, 8.5, 1.5, 1.5, '#9a9ab0');
      ell(9.5, 8.5, 1.5, 1.5, '#9a9ab0');
      break;
    case 'bottle':
      R(5, 1, 4, 3, a);
      R(3, 4, 8, 9, c);
      R(4, 5, 2, 6, l);
      R(3, 11, 8, 2, d);
      break;
    case 'flower':
      R(6, 7, 2, 7, '#5c9a6e');
      for (const [x, y] of [[4, 4], [9, 4], [4, 8], [9, 8], [6.5, 2]]) ell(x, y, 2.2, 2.2, c);
      ell(6.8, 6, 1.6, 1.6, a);
      break;
    case 'gem':
      poly([[7, 1], [12, 5], [7, 13], [2, 5]], c);
      poly([[7, 1], [12, 5], [7, 6], [2, 5]], l);
      P(5, 4, '#ffffff');
      break;
    case 'belt':
      R(0, 5, 14, 5, a);
      ell(7, 7.5, 4, 4, c);
      ell(7, 7.5, 2, 2, l);
      break;
    case 'paper':
      R(3, 1, 9, 12, c);
      R(4, 3, 6, 1, a);
      R(4, 5, 7, 1, a);
      R(4, 7, 5, 1, a);
      R(3, 11, 9, 2, d);
      break;
    case 'bag':
      RR(2, 4, 10, 9, 2, c);
      R(5, 2, 4, 3, a);
      break;
    case 'stick':
      R(6, 1, 3, 12, c);
      R(7, 1, 1, 12, l);
      R(5, 9, 5, 4, a);
      break;
    case 'heart':
      ell(4.5, 5, 3, 3, c);
      ell(9.5, 5, 3, 3, c);
      poly([[1.5, 6], [12.5, 6], [7, 13]], c);
      break;
    case 'star':
      poly([[7, 0], [9, 5], [14, 5], [10, 8], [12, 13], [7, 10], [2, 13], [4, 8], [0, 5], [5, 5]], c);
      P(6, 4, l);
      break;
    case 'key':
      ell(4, 5, 3, 3, c);
      ell(4, 5, 1, 1, AK);
      R(6, 5, 7, 2, c);
      R(10, 7, 1, 3, c);
      R(12, 7, 1, 2, c);
      R(2, 2, 1, 1, a);
      break;
    case 'shirt':
      poly([[2, 3], [5, 1], [9, 1], [12, 3], [11, 6], [10, 5], [10, 13], [4, 13], [4, 5], [3, 6]], c);
      R(5, 6, 4, 3, a);
      break;
    case 'plate':
      ell(7, 9, 7, 4, '#f6eadc');
      ell(7, 8, 5, 3, c);
      ell(6, 7, 2, 1.5, a);
      break;
    case 'can':
      R(3, 3, 8, 10, c);
      R(3, 3, 8, 2, a);
      R(4, 6, 2, 5, l);
      break;
  }
}
