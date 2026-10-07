import type { MapDef } from '../types';

/** All maps by id. Map modules call registerMap at import time. */
export const MAPS = new Map<string, MapDef>();

export function registerMap(def: MapDef): MapDef {
  MAPS.set(def.id, def);
  return def;
}

/**
 * Small builder so maps can be authored as painted rectangles instead of
 * hand-typed strings. Each terrain gets a legend character automatically.
 */
export class MapBuilder {
  w: number;
  h: number;
  private cells: string[];
  private legend: Record<string, MapDef['legend'][string]> = {};
  private rev = new Map<string, string>();
  private nextCh = 0;
  private static CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,<>?/|~';

  constructor(w: number, h: number, fill: MapDef['legend'][string]) {
    this.w = w;
    this.h = h;
    this.cells = new Array(w * h).fill(this.ch(fill));
  }

  private ch(t: MapDef['legend'][string]): string {
    if (t === 'void') return ' ';
    let c = this.rev.get(t);
    if (!c) {
      c = MapBuilder.CHARS[this.nextCh++];
      this.rev.set(t, c);
      this.legend[c] = t;
    }
    return c;
  }

  rect(x: number, y: number, w: number, h: number, t: MapDef['legend'][string]): this {
    const c = this.ch(t);
    for (let yy = Math.max(0, y); yy < Math.min(this.h, y + h); yy++) for (let xx = Math.max(0, x); xx < Math.min(this.w, x + w); xx++) this.cells[yy * this.w + xx] = c;
    return this;
  }

  set(x: number, y: number, t: MapDef['legend'][string]): this {
    return this.rect(x, y, 1, 1, t);
  }

  /** Paint a blob (rough ellipse) for ponds, flower patches, woods. */
  blob(cx: number, cy: number, rx: number, ry: number, t: MapDef['legend'][string], seed = 1): this {
    const c = this.ch(t);
    for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++)
      for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) continue;
        const jitter = (Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453) % 1;
        const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
        if (d <= 1 + Math.abs(jitter) * 0.35) this.cells[y * this.w + x] = c;
      }
    return this;
  }

  get(x: number, y: number): string {
    return this.legend[this.cells[y * this.w + x]] ?? 'void';
  }

  build(): { ground: string[]; legend: MapDef['legend'] } {
    const ground: string[] = [];
    for (let y = 0; y < this.h; y++) ground.push(this.cells.slice(y * this.w, (y + 1) * this.w).join(''));
    return { ground, legend: { ...this.legend } };
  }
}

/** Standard interior room: walls on top rows, floor, exit door-mat at the bottom. */
export function room(opts: {
  w: number;
  h: number;
  wall: MapDef['legend'][string];
  floor: MapDef['legend'][string];
  wallRows?: number;
  doorX: number;
}): MapBuilder {
  const b = new MapBuilder(opts.w + 2, opts.h + 1, 'void');
  const wr = opts.wallRows ?? 3;
  b.rect(1, 0, opts.w, wr, opts.wall);
  b.rect(1, wr, opts.w, opts.h - wr, opts.floor);
  // Doorway tile in the bottom edge.
  b.set(opts.doorX + 1, opts.h, opts.floor);
  return b;
}
