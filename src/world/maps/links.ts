import { FARM } from './farm';
import { MAPS } from './index';
import { INTERIORS } from './interiors';
import { AIRSTREAM_DOOR, TOWN, TOWN_DOORS } from './town';
import './fair';

/**
 * Wire doors both ways once every map is registered: each exterior door zone
 * warps into its interior, and each interior's bottom doorway warps back out.
 */
const CHILD_ROOMS: Record<string, { parent: string; x: number; y: number }> = {
  'birdie-office': { parent: 'sportatorium', x: 4, y: 3 },
  lockers: { parent: 'sportatorium', x: 28, y: 3 },
  'grandma-room': { parent: 'sunnypines', x: 18, y: 3 },
};

let linked = false;
export function linkMaps(): void {
  if (linked) return;
  linked = true;
  for (const d of TOWN_DOORS) {
    const info = INTERIORS.find((i) => i.id === d.id);
    if (!info) continue;
    TOWN.warps.push({ x: d.zoneX, y: d.zoneY, w: d.w ?? 1, h: 1, to: d.id, tx: info.doorX, ty: info.doorY - 1, facing: 'up', door: true, label: d.label });
    MAPS.get(d.id)!.warps.push({ x: info.doorX, y: info.doorY, w: 1, h: 1, to: 'town', tx: d.zoneX, ty: d.zoneY, facing: 'down', label: 'Outside' });
  }
  // Grandma's house on the farm.
  const gh = INTERIORS.find((i) => i.id === 'grandma-house')!;
  FARM.warps.push({ x: 10, y: 10, w: 1, h: 1, to: 'grandma-house', tx: gh.doorX, ty: gh.doorY - 1, facing: 'up', door: true, label: 'Home' });
  MAPS.get('grandma-house')!.warps.push({ x: gh.doorX, y: gh.doorY, w: 1, h: 1, to: 'farm', tx: 10, ty: 10, facing: 'down', label: 'Outside' });
  // Lou's Airstream on the creek.
  const air = INTERIORS.find((i) => i.id === 'airstream')!;
  TOWN.warps.push({ x: AIRSTREAM_DOOR.x, y: AIRSTREAM_DOOR.y, w: 1, h: 1, to: 'airstream', tx: air.doorX, ty: air.doorY - 1, facing: 'up', door: true, label: "Lou's Airstream" });
  MAPS.get('airstream')!.warps.push({ x: air.doorX, y: air.doorY, w: 1, h: 1, to: 'town', tx: AIRSTREAM_DOOR.x, ty: AIRSTREAM_DOOR.y, facing: 'down', label: 'Outside' });
  // Rooms inside rooms.
  for (const [id, c] of Object.entries(CHILD_ROOMS)) {
    const info = INTERIORS.find((i) => i.id === id)!;
    MAPS.get(id)!.warps.push({ x: info.doorX, y: info.doorY, w: 1, h: 1, to: c.parent, tx: c.x, ty: c.y, facing: 'down', label: 'Back' });
  }
}
