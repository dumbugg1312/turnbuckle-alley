import type { Dir } from '../core/state';

export const TILE = 16;

/** Terrain ids used in map ground layers. */
export type TerrainId =
  | 'grass' | 'grass-dark' | 'flowers' | 'dirt' | 'path' | 'sidewalk' | 'road' | 'road-line' | 'crosswalk'
  | 'brick' | 'water' | 'sand' | 'wood' | 'wood-dark' | 'tile' | 'checker' | 'carpet' | 'carpet-red' | 'mat'
  | 'concrete' | 'gravel' | 'void' | 'stone' | 'dungeon' | 'rubber' | 'parking' | 'bridge' | 'tilled' | 'snow'
  | 'wall' | 'wall-wood' | 'wall-brick' | 'wall-dungeon' | 'wall-panel' | 'wall-pink' | 'wall-blue' | 'shallow' | 'deep-water' | 'mud' | 'dirt-dark';

export interface TerrainDef {
  solid?: boolean;
  /** Footstep sound variant. */
  step?: 'soft' | 'hard' | 'wood' | 'water';
  /** Draw one 16x16 tile at (x, y). n = neighbor ids for edge blending. */
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, tx: number, ty: number, n: NeighborFn) => void;
}

export type NeighborFn = (dx: number, dy: number) => TerrainId;

/** A thing placed on a map: building, prop, furniture, collectible. */
export interface MapObject {
  id: string;
  kind: string;
  /** Pixel position of the object's anchor (bottom-center for most). */
  x: number;
  y: number;
  props: Record<string, unknown>;
  /** Hidden objects are not drawn or collided (e.g. collected chairs). */
  hidden?: boolean;
}

export interface ObjectKind {
  /** Collision rectangle relative to the anchor (pixels). Omit for none. */
  solid?: { x: number; y: number; w: number; h: number };
  /** Interaction area relative to the anchor; defaults to solid expanded. */
  hit?: { x: number; y: number; w: number; h: number };
  /** Y used for depth sorting, relative to anchor (default 0). */
  sortY?: number;
  /** Draw flat under entities (rugs, mats, shadows). */
  flat?: boolean;
  /** Draw above everything (rooftops overhanging, tree canopies). */
  above?: boolean;
  draw: (ctx: CanvasRenderingContext2D, o: MapObject, t: number) => void;
  /** Light sources this object emits at night (relative positions). */
  lights?: (o: MapObject) => { x: number; y: number; r: number; color: string }[];
  /** Short label shown when you can interact ("Talk", "Open", "Read"). */
  label?: (o: MapObject) => string | null;
}

export interface ObjectPlacement {
  kind: string;
  x: number;
  y: number;
  id?: string;
  props?: Record<string, unknown>;
}

export interface Warp {
  /** Tile rectangle that triggers the warp. */
  x: number;
  y: number;
  w: number;
  h: number;
  to: string;
  /** Destination tile. */
  tx: number;
  ty: number;
  facing?: Dir;
  /** Requires pressing interact (doors) instead of walking onto it. */
  door?: boolean;
  /** Return a message to block the warp (locked doors, closed shops). */
  locked?: () => string | null;
  label?: string;
}

export interface MapDef {
  id: string;
  name: string;
  /** Ground rows; each character is looked up in legend. */
  ground: string[];
  legend: Record<string, TerrainId>;
  /** Placements in tile units: (x, y) is the anchor, usually bottom-center. */
  objects: ObjectPlacement[];
  warps: Warp[];
  music?: string | (() => string);
  indoor?: boolean;
  /** Indoor maps are lit by their own light level (0 dark .. 1 bright). */
  indoorLight?: number;
  /** Background color outside the map bounds. */
  outside?: string;
  /** Extra solid tile rectangles (walls drawn by objects). */
  walls?: { x: number; y: number; w: number; h: number }[];
}
