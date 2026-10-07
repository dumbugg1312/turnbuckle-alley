import { rect } from '../gfx/draw';
import type { ObjectKind, TerrainDef, TerrainId } from './types';

/**
 * Art registries. World art modules register terrain and object kinds here;
 * maps refer to them by id. Unknown ids draw a visible placeholder.
 */
export const TERRAIN = new Map<TerrainId, TerrainDef>();
export const OBJECTS = new Map<string, ObjectKind>();

export function registerTerrain(id: TerrainId, def: TerrainDef): void {
  TERRAIN.set(id, def);
}

export function registerObject(kind: string, def: ObjectKind): void {
  OBJECTS.set(kind, def);
}

const MISSING_TERRAIN: TerrainDef = {
  draw: (ctx, x, y) => {
    rect(ctx, x, y, 16, 16, '#ff00ff');
    rect(ctx, x, y, 8, 8, '#000');
    rect(ctx, x + 8, y + 8, 8, 8, '#000');
  },
};

export function terrain(id: TerrainId): TerrainDef {
  return TERRAIN.get(id) ?? MISSING_TERRAIN;
}

const MISSING_OBJECT: ObjectKind = {
  solid: { x: -8, y: -8, w: 16, h: 8 },
  draw: (ctx, o) => {
    rect(ctx, o.x - 8, o.y - 16, 16, 16, '#ff00ff');
    rect(ctx, o.x - 7, o.y - 15, 14, 14, '#2a1d38');
  },
};

export function objectKind(kind: string): ObjectKind {
  return OBJECTS.get(kind) ?? MISSING_OBJECT;
}
