import { MapBuilder, registerMap } from './index';
import { contextDecals } from './decals';
import type { ObjectPlacement, Warp } from '../types';

/**
 * Turnbuckle Alley, the town, laid out at Stardew scale (DECISIONS.md D-022):
 * shops 8-12 tiles wide, houses 7-8, the Sportatorium 18, paths 2-3 tiles,
 * a 4-tile Main Street with sidewalks. Bands from north to south:
 * woods, Ropewood Lane (houses, the residence, the school), Main Street
 * (diner, hardware, the alley, the Sportatorium, taqueria, bakery, radio,
 * gas station, the bus stop at the east edge), Second Street (library,
 * tailor, clinic, studio, VFW, pawn, salon, the flea market lot), the square,
 * Chokeslam Creek and the south woods. The road west goes to the Dupree farm,
 * the road east to the fairgrounds.
 */
export const TOWN_W = 104;
export const TOWN_H = 70;

// Row plan (tile y). Buildings stand with their bottoms on these rows; the door zone is that row.
const LANE = 12; // Ropewood Lane house bottoms
const MAIN = 28; // Main Street north-side bottoms (sidewalk rows 28-29, road 30-33, sidewalk 34)
const SECOND = 44; // Second Street south-row bottoms (sidewalk 44, road 45-47, sidewalk 48)
const CREEK = 58; // sand, water 59-61, sand 62

const b = new MapBuilder(TOWN_W, TOWN_H, 'grass');
// North woods edge
b.rect(0, 0, TOWN_W, 4, 'grass-dark');
// Ropewood Lane
b.rect(0, LANE, TOWN_W, 1, 'path');
b.rect(0, LANE + 1, TOWN_W, 1, 'sidewalk');
b.rect(0, LANE + 2, TOWN_W, 2, 'road');
b.rect(0, LANE + 4, TOWN_W, 1, 'sidewalk');
// Main Street: two sidewalk rows on the shop side, four lanes of road, one sidewalk south
b.rect(0, MAIN, TOWN_W, 2, 'sidewalk');
b.rect(0, MAIN + 2, TOWN_W, 4, 'road');
b.rect(0, MAIN + 3, TOWN_W, 1, 'road-line');
b.rect(0, MAIN + 6, TOWN_W, 1, 'sidewalk');
// Crosswalks
for (const x of [27, 48, 78]) b.rect(x, MAIN + 2, 2, 4, 'crosswalk');
// The alley (between the hardware store and the Sportatorium), dead-ending at the mural
b.rect(24, 19, 5, MAIN - 19, 'brick');
// Connector paths north from Main St to Ropewood Lane
b.rect(77, LANE + 5, 2, MAIN - LANE - 5, 'path');
b.rect(1, LANE + 5, 2, MAIN - LANE - 5, 'path');
b.rect(93, LANE + 5, 2, MAIN - LANE - 5, 'path');
// Second Street
b.rect(0, SECOND, TOWN_W, 1, 'sidewalk');
b.rect(0, SECOND + 1, TOWN_W, 3, 'road');
b.rect(0, SECOND + 4, TOWN_W, 1, 'sidewalk');
for (const x of [47, 86]) b.rect(x, SECOND + 1, 2, 3, 'crosswalk');
// Paths from Main St down to Second St (between the studio and the VFW; past the lot)
b.rect(47, MAIN + 7, 2, SECOND - MAIN - 7, 'path');
b.rect(14, MAIN + 7, 2, SECOND - MAIN - 7, 'path');
// Parking lot and the flea market lot
b.rect(83, MAIN + 8, 6, SECOND - MAIN - 8, 'parking');
b.rect(89, MAIN + 7, 15, SECOND - MAIN - 7, 'gravel');
// Town square
b.rect(18, SECOND + 5, 38, 7, 'brick');
b.blob(36, SECOND + 9, 7, 2.5, 'path', 3);
b.rect(4, SECOND + 6, 11, 5, 'flowers');
b.blob(64, SECOND + 9, 5, 2, 'flowers', 9);
// Paths to the creek and the bridge
b.rect(35, SECOND + 12, 3, CREEK - SECOND - 12, 'path');
b.rect(60, SECOND + 5, 2, CREEK - SECOND - 5, 'path');
// Chokeslam Creek
b.rect(0, CREEK, TOWN_W, 1, 'sand');
b.rect(0, CREEK + 1, TOWN_W, 3, 'water');
b.rect(0, CREEK + 4, TOWN_W, 1, 'sand');
b.rect(0, CREEK + 5, TOWN_W, TOWN_H - CREEK - 5, 'grass-dark');
b.rect(35, CREEK + 1, 3, 3, 'bridge');
b.blob(12, CREEK + 2, 4, 0.8, 'shallow', 5);
b.blob(84, CREEK + 2, 5, 0.8, 'shallow', 6);

const objects: ObjectPlacement[] = [];
const warps: Warp[] = [];
const o = (kind: string, x: number, y: number, props?: Record<string, unknown>, id?: string) => objects.push({ kind, x, y, props, id });

/** Exterior door zones, filled in here and linked to interiors in maps/links.ts. */
export const TOWN_DOORS: { id: string; zoneX: number; zoneY: number; w?: number; label: string }[] = [];
/**
 * Place a building with its bottom-centre at (cx, ay) in tiles. doorDx is the
 * door centre's offset in pixels (from the building art); the door zone is the
 * tile under it. Wide double doors (w = 2) take the two tiles either side.
 */
function building(kind: string, cx: number, ay: number, doorDx: number, interior: string | null, label: string, props?: Record<string, unknown>, w = 1) {
  o(kind, cx, ay, props, `town-${kind}${props?.variant !== undefined ? '-' + props.variant : ''}-${cx}`);
  if (interior) TOWN_DOORS.push({ id: interior, zoneX: Math.floor(cx + doorDx / 16 - (w - 1) / 2), zoneY: ay, w, label });
}

// ---- North woods
for (let x = 1; x < TOWN_W; x += 5.5) o('tree-pine', x, 2.5 + (Math.floor(x) % 2) * 0.3, { variant: Math.floor(x) % 3 });
for (const x of [9.5, 26.5, 43, 58, 74, 87, 99]) o('tree', x, 5.8, { variant: Math.floor(x) % 3 });

// ---- Ropewood Lane (houses face south, bottoms on LANE)
building('b-house', 5.5, LANE, -16, 'house-abernathy', 'The Abernathys', { variant: 0 });
building('b-house', 14.5, LANE, -16, null, 'House', { variant: 1 });
building('b-birdie', 24, LANE, -24, 'birdie-house', "Birdie's House");
building('b-house', 33.5, LANE, -16, null, 'House', { variant: 2 });
building('b-house', 42.5, LANE, -16, null, 'House', { variant: 3 });
building('b-sunnypines', 55.5, LANE, 0, 'sunnypines', 'The Evening Bell Residence');
building('b-school', 71.5, LANE, 0, 'school', 'Turnbuckle Alley High');
building('b-house', 89.5, LANE, -16, null, 'House', { variant: 1 });
o('watertower', 99.5, LANE - 1);
o('mailbox', 26.6, LANE + 0.6);
o('fence-h', 6.5, LANE, { w: 3 });
o('flowerbed', 37, LANE + 0.8);
o('flowerbed', 84, LANE + 0.8);
for (const x of [10, 30, 47, 64, 81, 96]) o('lamp', x, LANE + 1.2);
o('bench', 62, LANE + 0.8);
o('bench', 80, LANE + 0.8);
o('tree-blossom', 19.2, LANE - 0.6);
o('tree-blossom', 47.6, LANE - 0.6);
o('tree-blossom', 94.5, LANE - 0.4);
o('hedge', 4, LANE + 5.2, { w: 18 });
// Back yards between the lane and the backs of the Main Street shops
for (const [x, y, v] of [[13.5, 19.6, 0], [22, 18.4, 2], [48.4, 19.2, 1], [57.5, 19.8, 0], [66.5, 18.6, 2], [71, 20.2, 1], [86, 19.4, 0], [90.5, 20.4, 2], [101, 19, 1]] as const) o('tree', x, y, { variant: v });
o('fence-h', 52, LANE + 5.4, { w: 14 });
o('fence-h', 80, LANE + 5.4, { w: 10 });
o('flowerbed', 60, LANE + 6.8);
o('picnic-table', 83, LANE + 7.5);

// ---- Main Street north side (bottoms on MAIN)
building('b-diner', 8.5, MAIN, 32, 'diner', 'Hot Tag Diner');
building('b-hardware', 19.5, MAIN, 32, 'hardware', 'Steel Chair Hardware');
building('b-sportatorium', 38, MAIN, 0, 'sportatorium', 'The Sportatorium', undefined, 2);
building('b-taqueria', 53.5, MAIN, -32, 'taqueria', 'Taqueria Mariposa');
building('b-bakery', 63, MAIN, 24, 'bakery', 'Tallbridge Bakery');
building('b-radio', 72, MAIN, -8, 'radio', 'WRSL 1340 AM');
o('radio-tower', 74.6, MAIN - 4.8);
building('b-gasstation', 85.5, MAIN, 32, 'gasstation', 'Gas · Bait · Snacks');
// The alley itself: the mural at its dead end, crates, Jobber's trash can.
o('mural', 26.5, 21.2, {}, 'velvet-mural');
o('trashcan', 24.6, 23.6, { raccoon: true }, 'jobber-can');
o('crate', 28.2, 24.2);
o('barrel', 28.4, 22.6);
o('chair', 25.6, 26.2, {}, 'chair-alley');
// Main street furniture
for (const x of [2.2, 16.6, 30.4, 58.6, 67.6, 79.6, 92.4]) o('lamp', x, MAIN + 1.2);
o('newsstand', 14.8, MAIN + 1.2, {}, 'newsstand');
o('hydrant', 48.8, MAIN + 1.3);
o('bench', 57.3, MAIN + 0.5);
o('trashcan', 66.2, MAIN + 1.2);
o('bench', 45.5, MAIN + 6.6);
o('phone-booth', 79, MAIN - 0.6, {}, 'phone-booth');
o('poster-board', 48, MAIN - 0.7, {}, 'poster-board');
o('bus-stop', 97, MAIN + 0.8, {}, 'bus-stop');
o('chair', 99.5, MAIN - 0.4, {}, 'chair-busstop');
o('tree', 96.5, MAIN - 4, { variant: 0 });
o('tree', 101.5, MAIN - 3.5, { variant: 1 });
o('tree', 75, MAIN - 7.5, { variant: 2 });
o('tree', 0.5, MAIN - 6, { variant: 1 });
o('car', 6, MAIN + 2.6, { variant: 1 });
o('pickup', 68, MAIN + 5.8, { variant: 0 });
o('car', 58, MAIN + 2.6, { variant: 2 });

// ---- South row (backs face Main St; fronts on Second St, bottoms on SECOND)
building('b-library', 7.5, SECOND, 0, 'library', 'Public Library');
building('b-tailor', 20.5, SECOND, 0, 'tailor', "Sew What? (Marigold's)");
building('b-clinic', 30.5, SECOND, 0, 'clinic', 'Halloran Chiropractic');
building('b-studio', 41.5, SECOND, 0, 'studio', 'Hurricane Physio & Yoga');
building('b-vfw', 54.5, SECOND, 0, 'vfw', 'VFW Post 316');
building('b-pawn', 66.5, SECOND, 0, 'pawn', "Fenwick's Pawn & Tapes");
building('b-salon', 77.5, SECOND, 0, 'salon', 'Gorgeous (Salon)');
// Behind the south row, along Main St's south sidewalk: hedges and shade trees
o('hedge', 3, MAIN + 7.2, { w: 10 });
o('hedge', 16, MAIN + 7.2, { w: 30 });
o('hedge', 50, MAIN + 7.2, { w: 32 });
for (const x of [1, 46.2]) o('tree', x, MAIN + 9.5, { variant: Math.floor(x) % 3 });
o('car', 85.5, MAIN + 11.6, { variant: 2 });
o('car', 85.5, MAIN + 14.6, { variant: 0 });
o('lamp', 83.4, MAIN + 8.2);
// Flea market (stalls and tape bins; busiest on weekends)
o('tent', 91.5, MAIN + 12.5, { color: 'red' });
o('tent', 96.5, MAIN + 12.5, { color: 'teal' });
o('tent', 101.5, MAIN + 12.5, { color: 'purple' });
o('tapebin', 90.5, MAIN + 14.6, { bin: 'flea' }, 'bin-flea-1');
o('tapebin', 95.5, MAIN + 14.6, { bin: 'flea' }, 'bin-flea-2');
o('tapebin', 100.5, MAIN + 14.6, { bin: 'flea' }, 'bin-flea-3');
o('crate', 93.5, MAIN + 14.8);
o('crate', 102.6, MAIN + 9);
o('sign', 89.8, MAIN + 8.4, { text: 'FLEA MARKET: SAT & SUN. Tapes, toys, treasures.' }, 'sign-flea');
for (const x of [13.4, 36, 62.5, 83.5, 99]) o('lamp', x, SECOND + 0.4);

// ---- Town square
o('gazebo', 36.5, SECOND + 10.2, {}, 'gazebo');
for (const [x, y] of [[19, SECOND + 6], [54.5, SECOND + 6], [19, SECOND + 11.5], [54.5, SECOND + 11.5]] as const) o('tree', x, y, { variant: Math.floor(x + y) % 3 });
o('bench', 29, SECOND + 6.2);
o('bench', 44, SECOND + 6.2);
o('bench', 26, SECOND + 10.6);
o('flowerbed', 31, SECOND + 11.3);
o('flowerbed', 42, SECOND + 11.3);
o('lamp', 23.5, SECOND + 8.5);
o('lamp', 49.5, SECOND + 8.5);
o('picnic-table', 8, SECOND + 8.5);
o('picnic-table', 66, SECOND + 7);
o('tree-blossom', 13.5, SECOND + 8.6);
o('tree-blossom', 70, SECOND + 9.6);
o('chair', 51, SECOND + 10.6, {}, 'chair-square');
// The meadow east of the square, down to Lou's stretch of the creek
for (const [x, y, v] of [[75, SECOND + 8, 0], [86.5, SECOND + 6.5, 1], [97.5, SECOND + 9, 2], [80.5, SECOND + 12, 1], [92, SECOND + 12.6, 0], [102, SECOND + 6, 2]] as const) o('tree', x, y, { variant: v });
o('bench', 90, SECOND + 9.4);
o('flagpole', 17.6, SECOND + 7.6);
o('sign', 16.2, SECOND + 5.6, { text: 'TOWN SQUARE. Movie nights, Fridays in summer. Dancing optional, mandatory.' });

// ---- Creek and Sweet Lou's spot
o('airstream', 66, CREEK - 0.4, {}, 'airstream');
/** Lou's door (the Airstream art puts it 18 px right of centre). */
export const AIRSTREAM_DOOR = { x: Math.floor(66 + 18 / 16), y: CREEK - 1 };
o('chair', 69.6, CREEK - 0.4, {}, 'chair-creek');
for (const x of [2, 24, 46, 78, 95]) o('reeds', x, CREEK + 0.2);
o('reeds', 10, CREEK + 4.6);
o('reeds', 58, CREEK + 4.6);
o('lilypad', 18, CREEK + 2.6);
o('lilypad', 50, CREEK + 3);
o('lilypad', 90, CREEK + 2.4);
o('rock', 42, CREEK - 0.2, { variant: 1 });
o('rock', 8, CREEK - 0.2, { variant: 0 });
o('log', 76, CREEK - 0.2);
for (let x = 2; x < TOWN_W; x += 5) o('tree-pine', x, TOWN_H - 0.8, { variant: x % 3 });
for (const x of [6, 22, 52, 70, 88]) o('tree', x, CREEK + 7.5, { variant: x % 3 });
o('sign', 38.5, CREEK + 4.8, { text: 'THE WOODS. Folks say something with wings lives out here. Folks say a lot of things.' });

// ---- Edges: west road to Grandma's place, east road to the fairgrounds
warps.push({ x: 0, y: MAIN + 2, w: 1, h: 4, to: 'farm', tx: 37, ty: 15, facing: 'left', label: "To Grandma's place" });
warps.push({ x: TOWN_W - 1, y: MAIN + 2, w: 1, h: 4, to: 'fair', tx: 1, ty: 18, facing: 'right', label: 'To the fairgrounds' });

/** Where the farm and fairgrounds roads come into town, and the bus drops you off. */
export const TOWN_ENTRY = {
  west: { x: 1, y: MAIN + 3 },
  east: { x: TOWN_W - 2, y: MAIN + 3 },
  bus: { x: 96, y: MAIN + 2 },
};

// ---- Ground decals: wear at the doors, tufts along fences, cracks off the curbs (gfx/world/decals.ts)
objects.push(
  ...contextDecals(objects, {
    at: (x, y) => (x < 0 || y < 0 || x >= TOWN_W || y >= TOWN_H ? 'void' : b.get(x, y)),
    w: TOWN_W,
    h: TOWN_H,
    doors: [...TOWN_DOORS.map((d) => ({ x: d.zoneX + ((d.w ?? 1) - 1) / 2, y: d.zoneY })), AIRSTREAM_DOOR],
    seed: 7,
  }),
);

export const TOWN = registerMap({
  id: 'town',
  name: 'Turnbuckle Alley',
  ...b.build(),
  objects,
  warps,
  music: 'town',
  outside: '#3f6a4a',
});
