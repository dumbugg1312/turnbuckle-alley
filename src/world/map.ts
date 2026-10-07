import { ctx2d, makeCanvas } from '../gfx/draw';
import { getSeason } from '../gfx/world/terrain';
import { objectKind, terrain } from './registry';
import { TILE, type MapDef, type MapObject, type TerrainId, type Warp } from './types';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function boxesOverlap(a: Box, b: Box): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Runtime map built from a MapDef. */
export class GameMap {
  readonly def: MapDef;
  readonly id: string;
  readonly w: number;
  readonly h: number;
  readonly pxW: number;
  readonly pxH: number;
  readonly terrain: TerrainId[];
  objects: MapObject[];
  /** 1 = blocked for pathfinding, per tile. Rebuilt when objects change. */
  blocked: Uint8Array;
  private groundCanvas: HTMLCanvasElement | null = null;
  private groundSeason = '';
  private wallBoxes: Box[];

  constructor(def: MapDef) {
    this.def = def;
    this.id = def.id;
    this.h = def.ground.length;
    this.w = Math.max(...def.ground.map((r) => r.length));
    this.pxW = this.w * TILE;
    this.pxH = this.h * TILE;
    this.terrain = new Array(this.w * this.h);
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) {
        const ch = def.ground[y][x] ?? ' ';
        this.terrain[y * this.w + x] = def.legend[ch] ?? 'void';
      }
    let n = 0;
    this.objects = def.objects.map((p) => ({ id: p.id ?? `${def.id}-${p.kind}-${n++}`, kind: p.kind, x: Math.round(p.x * TILE), y: Math.round(p.y * TILE), props: { ...(p.props ?? {}) } }));
    // Variable-length props: collision depends on props.w/h, so fill it before pathfinding.
    for (const o of this.objects) {
      if (o.props.solid) continue;
      const n = Number(o.props.w ?? o.props.h ?? 3);
      if (o.kind === 'hedge') o.props.solid = { x: -n * 8, y: -10, w: n * 16, h: 10 };
      else if (o.kind === 'fence-h') o.props.solid = { x: -n * 8, y: -5, w: n * 16, h: 5 };
      else if (o.kind === 'fence-v') o.props.solid = { x: -2, y: -n * 16, w: 4, h: n * 16 };
      else if (o.kind === 'bridge-rail') o.props.solid = { x: -n * 8, y: -4, w: n * 16, h: 4 };
    }
    this.wallBoxes = (def.walls ?? []).map((wb) => ({ x: wb.x * TILE, y: wb.y * TILE, w: wb.w * TILE, h: wb.h * TILE }));
    this.blocked = new Uint8Array(this.w * this.h);
    this.rebuildBlocked();
  }

  terrainAt(tx: number, ty: number): TerrainId {
    if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return 'void';
    return this.terrain[ty * this.w + tx];
  }

  objectSolid(o: MapObject): Box | null {
    if (o.hidden) return null;
    const k = objectKind(o.kind);
    const s = (o.props.solid as Box | undefined) ?? k.solid;
    if (!s) return null;
    return { x: o.x + s.x, y: o.y + s.y, w: s.w, h: s.h };
  }

  objectHit(o: MapObject): Box | null {
    if (o.hidden) return null;
    const k = objectKind(o.kind);
    if (k.hit) return this.reachable({ x: o.x + k.hit.x, y: o.y + k.hit.y, w: k.hit.w, h: k.hit.h });
    const s = this.objectSolid(o);
    // Seats with a never-colliding solid (y far off-map) still get a normal box.
    if (!s || s.y < o.y - 9000) return this.reachable({ x: o.x - 8, y: o.y - 16, w: 16, h: 16 });
    return this.reachable({ x: s.x - 3, y: s.y - 6, w: s.w + 6, h: s.h + 9 });
  }

  /**
   * Wall-mounted things (photos, notices, menu boards) sit in the wall rows,
   * out of reach of the action probe. Stretch their box down to the first
   * floor row in front of them, unless that spot is a door.
   */
  private reachable(b: Box): Box {
    if (!this.def.indoor) return b;
    const cx = Math.floor((b.x + b.w / 2) / TILE);
    let row = Math.floor((b.y + b.h - 1) / TILE);
    let n = 0;
    while (n < 3 && this.terrainAt(cx, row).startsWith('wall')) {
      row++;
      n++;
    }
    if (n === 0 || this.terrainAt(cx, row).startsWith('wall') || this.terrainAt(cx, row) === 'void') return b;
    // Furniture under it (a counter, lockers, a bed): reach past it to the first open floor.
    for (let m = 0; m < 3 && this.blocked[row * this.w + cx] && row + 1 < this.h; m++) row++;
    const x0 = Math.floor(b.x / TILE);
    const x1 = Math.floor((b.x + b.w - 1) / TILE);
    const door = this.def.warps.some((w) => w.x <= x1 && w.x + w.w > x0 && w.y <= row && w.y + w.h > row - 1);
    if (door) return b;
    return { ...b, h: Math.max(b.h, row * TILE + 2 - b.y) };
  }

  rebuildBlocked(): void {
    this.blocked.fill(0);
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++) if (terrain(this.terrain[y * this.w + x]).solid || this.terrain[y * this.w + x] === 'void') this.blocked[y * this.w + x] = 1;
    const mark = (b: Box) => {
      const x0 = Math.floor(b.x / TILE);
      const y0 = Math.floor(b.y / TILE);
      const x1 = Math.floor((b.x + b.w - 1) / TILE);
      const y1 = Math.floor((b.y + b.h - 1) / TILE);
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) {
          if (x < 0 || y < 0 || x >= this.w || y >= this.h) continue;
          // Only block tiles mostly covered by the box, so thin props don't wall off paths.
          const cover = Math.max(0, Math.min(b.x + b.w, (x + 1) * TILE) - Math.max(b.x, x * TILE)) * Math.max(0, Math.min(b.y + b.h, (y + 1) * TILE) - Math.max(b.y, y * TILE));
          if (cover >= TILE * TILE * 0.3) this.blocked[y * this.w + x] = 1;
        }
    };
    for (const wb of this.wallBoxes) mark(wb);
    for (const o of this.objects) {
      const s = this.objectSolid(o);
      if (s) mark(s);
    }
  }

  /** True if a pixel box collides with terrain, walls or solid objects. */
  collides(b: Box, ignore?: MapObject): boolean {
    if (b.x < 0 || b.y < 0 || b.x + b.w > this.pxW || b.y + b.h > this.pxH) return true;
    const x0 = Math.floor(b.x / TILE);
    const y0 = Math.floor(b.y / TILE);
    const x1 = Math.floor((b.x + b.w - 1) / TILE);
    const y1 = Math.floor((b.y + b.h - 1) / TILE);
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const t = this.terrainAt(x, y);
        if (t === 'void' || terrain(t).solid) return true;
      }
    for (const wb of this.wallBoxes) if (boxesOverlap(b, wb)) return true;
    for (const o of this.objects) {
      if (o === ignore) continue;
      const s = this.objectSolid(o);
      if (s && boxesOverlap(b, s)) return true;
    }
    return false;
  }

  warpAt(px: number, py: number, doorsToo: boolean): Warp | null {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor(py / TILE);
    for (const w of this.def.warps) {
      if (w.door && !doorsToo) continue;
      if (tx >= w.x && tx < w.x + w.w && ty >= w.y && ty < w.y + w.h) return w;
    }
    return null;
  }

  /** Pre-render the ground layer once. */
  ground(): HTMLCanvasElement {
    // Terrain art follows the season, so a ground baked in another season is stale.
    if (this.groundCanvas && this.groundSeason === getSeason()) return this.groundCanvas;
    // Double density (D-018): dense terrain tiles land on the fine grid; the
    // tagged canvas still draws at its logical size.
    const c = makeCanvas(this.pxW * 2, this.pxH * 2);
    (c as unknown as { __k: number }).__k = 2;
    const x = ctx2d(c);
    x.setTransform(2, 0, 0, 2, 0, 0);
    for (let ty = 0; ty < this.h; ty++)
      for (let tx = 0; tx < this.w; tx++) {
        const id = this.terrain[ty * this.w + tx];
        if (id === 'void') continue;
        terrain(id).draw(x, tx * TILE, ty * TILE, tx, ty, (dx, dy) => this.terrainAt(tx + dx, ty + dy));
      }
    // Flat objects (rugs, mats) are baked into the ground too.
    for (const o of this.objects) {
      const k = objectKind(o.kind);
      if (k.flat && !o.hidden) k.draw(x, o, 0);
    }
    this.groundCanvas = c;
    this.groundSeason = getSeason();
    return c;
  }

  invalidateGround(): void {
    this.groundCanvas = null;
  }

  objectById(id: string): MapObject | undefined {
    return this.objects.find((o) => o.id === id);
  }
}
