import { WORLD } from '../world/scene';
import type { MapObject } from '../world/types';

/**
 * Props placed into a map at runtime (surprises, the porch rocker hotspot,
 * the drawings on the fridge), without touching the map files. They are not
 * saved: whoever owns one puts it back from its own state when the map is
 * entered. Ids should start with 'sx-' so they never collide with map ids.
 */
export function placeProp(mapId: string, o: MapObject): MapObject | null {
  const w = WORLD;
  if (!w) return null;
  const m = w.getMap(mapId);
  const have = m.objects.find((x) => x.id === o.id);
  if (have) return have;
  m.objects.push(o);
  m.rebuildBlocked();
  return o;
}

export function removeProp(mapId: string, id: string): void {
  const w = WORLD;
  if (!w) return;
  const m = w.getMap(mapId);
  const i = m.objects.findIndex((x) => x.id === id);
  if (i < 0) return;
  m.objects.splice(i, 1);
  m.rebuildBlocked();
}

/** Remove every runtime prop on a map whose id starts with prefix, except the ids kept. */
export function clearProps(mapId: string, prefix: string, keep: string[] = []): void {
  const w = WORLD;
  if (!w) return;
  const m = w.getMap(mapId);
  const before = m.objects.length;
  m.objects = m.objects.filter((x) => !x.id.startsWith(prefix) || keep.includes(x.id));
  if (m.objects.length !== before) m.rebuildBlocked();
}

export function findProp(mapId: string, id: string): MapObject | undefined {
  return WORLD?.getMap(mapId).objects.find((x) => x.id === id);
}
