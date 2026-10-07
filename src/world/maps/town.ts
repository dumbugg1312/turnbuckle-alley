import { MapBuilder, registerMap } from './index';
import type { ObjectPlacement, Warp } from '../types';

/**
 * Turnbuckle Alley, the town. Bands from north to south:
 * woods, Ropewood Lane (houses), Main Street (diner, hardware, the alley,
 * the Sportatorium, taqueria, bakery, radio), Second Street (library,
 * tailor, clinic, studio, VFW, pawn, flea market), the square, Chokeslam Creek.
 */
export const TOWN_W = 64;
export const TOWN_H = 56;

const b = new MapBuilder(TOWN_W, TOWN_H, 'grass');
// North woods edge
b.rect(0, 0, TOWN_W, 3, 'grass-dark');
// Ropewood Lane
b.rect(0, 11, TOWN_W, 1, 'path');
b.rect(0, 12, TOWN_W, 1, 'sidewalk');
b.rect(0, 13, TOWN_W, 2, 'road');
b.rect(0, 15, TOWN_W, 1, 'sidewalk');
// Main Street
b.rect(0, 23, TOWN_W, 2, 'sidewalk');
b.rect(0, 25, TOWN_W, 3, 'road');
b.rect(0, 26, TOWN_W, 1, 'road-line');
b.rect(0, 28, TOWN_W, 1, 'sidewalk');
// Crosswalks
b.rect(17, 25, 2, 3, 'crosswalk');
b.rect(35, 25, 2, 3, 'crosswalk');
// The alley (between hardware and the Sportatorium)
b.rect(14, 16, 5, 7, 'brick');
// Connector paths north from Main St to Ropewood Lane
b.rect(46, 16, 2, 7, 'path');
// Second Street
b.rect(0, 38, TOWN_W, 1, 'sidewalk');
b.rect(0, 39, TOWN_W, 2, 'road');
b.rect(0, 41, TOWN_W, 1, 'sidewalk');
b.rect(34, 29, 2, 9, 'path');
// Parking lot and flea market lot
b.rect(40, 31, 5, 7, 'parking');
b.rect(46, 30, 16, 8, 'gravel');
// Town square
b.rect(12, 42, 24, 6, 'brick');
b.blob(23, 45, 6, 2.5, 'path', 3);
b.rect(4, 42, 7, 5, 'flowers');
b.blob(42, 45, 4, 2, 'flowers', 9);
// Path to the creek and the bridge
b.rect(22, 48, 3, 1, 'path');
b.rect(40, 42, 2, 6, 'path');
// Chokeslam Creek
b.rect(0, 48, TOWN_W, 1, 'sand');
b.rect(0, 49, TOWN_W, 3, 'water');
b.rect(0, 52, TOWN_W, 1, 'sand');
b.rect(0, 53, TOWN_W, 3, 'grass-dark');
b.rect(22, 49, 3, 3, 'bridge');
b.blob(10, 50, 3, 0.8, 'shallow', 5);
b.blob(54, 50, 4, 0.8, 'shallow', 6);

const objects: ObjectPlacement[] = [];
const warps: Warp[] = [];
const o = (kind: string, x: number, y: number, props?: Record<string, unknown>, id?: string) => objects.push({ kind, x, y, props, id });

/** Exterior door zones, filled in here and linked to interiors in maps/links.ts. */
export const TOWN_DOORS: { id: string; zoneX: number; zoneY: number; label: string }[] = [];
function building(kind: string, cx: number, ay: number, doorDx: number, interior: string | null, label: string, props?: Record<string, unknown>) {
  o(kind, cx, ay, props, `town-${kind}${props?.variant !== undefined ? '-' + props.variant : ''}-${cx}`);
  if (interior) TOWN_DOORS.push({ id: interior, zoneX: Math.floor(cx + doorDx / 16), zoneY: ay, label });
}

// ---- Ropewood Lane (houses face south, bottoms at y=11)
building('b-house', 4, 11, -12, 'house-abernathy', 'The Abernathys', { variant: 0 });
building('b-house', 9, 11, -12, null, 'House', { variant: 1 });
building('b-birdie', 15, 11, -16, 'birdie-house', "Birdie's House");
building('b-house', 21, 11, -12, null, 'House', { variant: 2 });
building('b-house', 26, 11, -12, null, 'House', { variant: 3 });
building('b-sunnypines', 34, 11, 0, 'sunnypines', 'The Evening Bell Residence');
building('b-school', 45.5, 11, 0, 'school', 'Turnbuckle Alley High');
o('watertower', 56, 10);
for (const x of [1, 6.5, 12, 18, 23.5, 29, 39.5, 51, 61]) o('tree-pine', x, 2.5 + (x % 2) * 0.3, { variant: Math.floor(x) % 3 });
for (const x of [3, 10, 20, 27, 52, 59]) o('tree', x, 5.5, { variant: Math.floor(x) % 3 });
o('mailbox', 13.2, 11.6);
o('fence-h', 3, 11, { w: 3 });
o('flowerbed', 26, 11.8);
o('lamp', 8, 12.2);
o('lamp', 30, 12.2);
o('lamp', 50, 12.2);
o('bench', 40, 11.8);
o('tree-blossom', 38.5, 10.4);
o('tree-blossom', 29.2, 10.4);

// ---- Main Street north side (bottoms at y=23)
building('b-diner', 6, 23, 24, 'diner', 'Hot Tag Diner');
building('b-hardware', 11.5, 23, 16, 'hardware', 'Steel Chair Hardware');
building('b-sportatorium', 24.5, 23, 0, 'sportatorium', 'The Sportatorium');
building('b-taqueria', 32.5, 23, -16, 'taqueria', 'Taqueria Mariposa');
building('b-bakery', 37.5, 23, 16, 'bakery', 'Tallbridge Bakery');
building('b-radio', 42, 23, 0, 'radio', 'WRSL 1340 AM');
o('radio-tower', 44.8, 22.4);
// The alley itself: the mural at its dead end, crates, Jobber's trash can.
o('mural', 16.5, 18.2, {}, 'velvet-mural');
o('trashcan', 14.6, 20.6, { raccoon: true }, 'jobber-can');
o('crate', 18.2, 21.2);
o('barrel', 18.4, 19.6);
o('chair', 15.6, 22.2, {}, 'chair-alley');
// Main street furniture
o('lamp', 2.2, 24.2);
o('lamp', 16, 24.2);
o('lamp', 29.8, 24.2);
o('lamp', 44, 24.2);
o('lamp', 59.5, 24.2);
o('newsstand', 9.6, 24.2, {}, 'newsstand');
o('hydrant', 19.2, 24.3);
o('bench', 34, 24.3);
o('trashcan', 40.5, 24.2);
o('phone-booth', 49, 23.4, {}, 'phone-booth');
o('bus-stop', 61, 23.8, {}, 'bus-stop');
building('b-gasstation', 54, 23, 32, 'gasstation', 'Gas · Bait · Snacks');
o('tree', 49.5, 19.5, { variant: 1 });
o('tree', 61.5, 20, { variant: 0 });
o('poster-board', 47.2, 23.3, {}, 'poster-board');
o('car', 4, 25.6, { variant: 1 });
o('pickup', 47, 27.8, { variant: 0 });
o('chair', 59, 21.6, {}, 'chair-busstop');

// ---- South row (backs face Main St; fronts on Second St, bottoms at y=38)
building('b-library', 6, 38, 0, 'library', 'Public Library');
building('b-tailor', 11, 38, 0, 'tailor', "Sew What? (Marigold's)");
building('b-clinic', 15, 38, 0, 'clinic', 'Halloran Chiropractic');
building('b-studio', 19, 38, 0, 'studio', 'Hurricane Physio & Yoga');
building('b-vfw', 25.5, 38, 0, 'vfw', 'VFW Post 316');
o('flagpole', 29.6, 37.6);
building('b-pawn', 32, 38, 0, 'pawn', "Fenwick's Pawn & Tapes");
building('b-salon', 38, 38, 0, 'salon', 'Gorgeous (Salon)');
for (const x of [1, 3.5, 21.2]) o('tree', x, 31, { variant: 1 });
o('hedge', 9, 30, { w: 10 });
o('car', 42.5, 33.6, { variant: 2 });
o('lamp', 40.4, 31.2);
// Flea market (stalls and tape bins; busiest on weekends)
o('tent', 49, 33.5, { color: 'red' });
o('tent', 54.5, 33.5, { color: 'teal' });
o('tent', 60, 33.5, { color: 'purple' });
o('tapebin', 48, 35.6, { bin: 'flea' }, 'bin-flea-1');
o('tapebin', 53.5, 35.6, { bin: 'flea' }, 'bin-flea-2');
o('tapebin', 59, 35.6, { bin: 'flea' }, 'bin-flea-3');
o('crate', 51.5, 36);
o('sign', 46.8, 37.4, { text: 'FLEA MARKET: SAT & SUN. Tapes, toys, treasures.' }, 'sign-flea');
o('lamp', 8, 38.4);
o('lamp', 22, 38.4);
o('lamp', 45.5, 38.4);

// ---- Town square
o('gazebo', 23.5, 46.2, {}, 'gazebo');
for (const [x, y] of [[13, 43], [34.5, 43], [13, 47], [34.5, 47]] as const) o('tree', x, y, { variant: (x + y) % 3 });
o('bench', 17, 43.2);
o('bench', 30, 43.2);
o('flowerbed', 19, 47.3);
o('flowerbed', 28, 47.3);
o('lamp', 15.5, 44.5);
o('lamp', 31.5, 44.5);
o('picnic-table', 6, 45);
o('tree-blossom', 9, 44.6);
o('chair', 34, 46.6, {}, 'chair-square');
o('sign', 11.6, 42.6, { text: 'TOWN SQUARE. Movie nights, Fridays in summer. Dancing optional, mandatory.' });

// ---- Creek and Sweet Lou's spot
o('airstream', 45, 47.6, {}, 'airstream');
o('chair', 48.6, 47.6, {}, 'chair-creek');
o('reeds', 2, 48.2);
o('reeds', 8, 52.6);
o('reeds', 31, 48.2);
o('reeds', 58, 48.2);
o('lilypad', 14, 50.6);
o('lilypad', 37, 51);
o('rock', 28, 47.8, { variant: 1 });
o('log', 52, 47.8);
for (const x of [2, 7, 12, 17, 28, 33, 39, 46, 51, 57, 62]) o('tree-pine', x, 55.2, { variant: x % 3 });
o('sign', 25.5, 52.8, { text: 'THE WOODS. Folks say something with wings lives out here. Folks say a lot of things.' });

// ---- Edges: west road to Grandma's place, east road to the fairgrounds
warps.push({ x: 0, y: 25, w: 1, h: 3, to: 'farm', tx: 37, ty: 15, facing: 'left', label: "To Grandma's place" });
warps.push({ x: TOWN_W - 1, y: 25, w: 1, h: 3, to: 'fair', tx: 1, ty: 18, facing: 'right', label: 'To the fairgrounds' });

export const TOWN = registerMap({
  id: 'town',
  name: 'Turnbuckle Alley',
  ...b.build(),
  objects,
  warps,
  music: 'town',
  outside: '#3f6a4a',
});
