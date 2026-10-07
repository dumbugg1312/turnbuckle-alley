import type { GameMap } from './map';

/** A* over the map's blocked grid with 8-way moves (no corner cutting). Returns tile path excluding start. */
export function findPath(map: GameMap, sx: number, sy: number, gx: number, gy: number, maxNodes = 4000): { x: number; y: number }[] | null {
  const W = map.w;
  const H = map.h;
  if (gx < 0 || gy < 0 || gx >= W || gy >= H) return null;
  const blocked = (x: number, y: number) => x < 0 || y < 0 || x >= W || y >= H || map.blocked[y * W + x] === 1;
  // If the goal is blocked, aim for the nearest open neighbor.
  if (blocked(gx, gy)) {
    let best: [number, number] | null = null;
    let bd = Infinity;
    for (let r = 1; r <= 2 && !best; r++)
      for (let dy = -r; dy <= r; dy++)
        for (let dx = -r; dx <= r; dx++) {
          const nx = gx + dx;
          const ny = gy + dy;
          if (blocked(nx, ny)) continue;
          const d = Math.hypot(nx - sx, ny - sy) + Math.hypot(dx, dy) * 2;
          if (d < bd) {
            bd = d;
            best = [nx, ny];
          }
        }
    if (!best) return null;
    [gx, gy] = best;
  }
  if (sx === gx && sy === gy) return [];
  const key = (x: number, y: number) => y * W + x;
  const g = new Map<number, number>();
  const came = new Map<number, number>();
  const open: { k: number; f: number }[] = [];
  const h = (x: number, y: number) => {
    const dx = Math.abs(x - gx);
    const dy = Math.abs(y - gy);
    return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
  };
  const sk = key(sx, sy);
  g.set(sk, 0);
  open.push({ k: sk, f: h(sx, sy) });
  let nodes = 0;
  while (open.length && nodes++ < maxNodes) {
    let bi = 0;
    for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
    const cur = open.splice(bi, 1)[0];
    const cx = cur.k % W;
    const cy = Math.floor(cur.k / W);
    if (cx === gx && cy === gy) {
      const path: { x: number; y: number }[] = [];
      let k = cur.k;
      while (k !== sk) {
        path.push({ x: k % W, y: Math.floor(k / W) });
        k = came.get(k)!;
      }
      return path.reverse();
    }
    const cg = g.get(cur.k)!;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cx + dx;
        const ny = cy + dy;
        if (blocked(nx, ny)) continue;
        if (dx && dy && (blocked(cx + dx, cy) || blocked(cx, cy + dy))) continue;
        const nk = key(nx, ny);
        const ng = cg + (dx && dy ? Math.SQRT2 : 1);
        if (ng < (g.get(nk) ?? Infinity)) {
          g.set(nk, ng);
          came.set(nk, cur.k);
          open.push({ k: nk, f: ng + h(nx, ny) });
        }
      }
  }
  return null;
}
