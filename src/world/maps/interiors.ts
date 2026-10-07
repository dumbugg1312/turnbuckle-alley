import { type MapBuilder, registerMap, room } from './index';
import type { ObjectPlacement, TerrainId, Warp } from '../types';

/**
 * Every indoor room. Rooms are built with room(): side columns are void,
 * the top rows are wall, and the doorway sits in the bottom edge at doorX+1.
 * A room can then be reshaped (alcoves, stepped walls, floor zones) with
 * opts.shape, which paints straight onto the MapBuilder in map tiles.
 * Interiors list their own furniture; doors to town are linked in links.ts.
 *
 * Coordinates: older rooms list furniture in room coordinates (x is shifted
 * one tile right for the void column). Rooms built with opts.abs use plain
 * map tiles, the same numbers NPC schedules and story scenes use.
 */
export interface InteriorInfo {
  id: string;
  /** Doorway tile (bottom edge) in this map. */
  doorX: number;
  doorY: number;
}
export const INTERIORS: InteriorInfo[] = [];

type P = [kind: string, x: number, y: number, props?: Record<string, unknown>, id?: string];

/**
 * Collision for furniture whose width comes from props.w (in tiles). The
 * pathfinding grid is built before anything is drawn, so solids have to be
 * known here rather than set lazily by the art.
 */
const WIDE: Record<string, (w: number) => { x: number; y: number; w: number; h: number } | null> = {
  counter: (w) => ({ x: -w * 8, y: -15, w: w * 16, h: 14 }),
  'booth-seat': (w) => ({ x: -w * 8 + 1, y: -12, w: w * 16 - 2, h: 10 }),
  'booth-table': (w) => ({ x: -w * 8 + 2, y: -15, w: w * 16 - 4, h: 11 }),
};

interface InteriorOpts {
  music?: string;
  light?: number;
  extraWarps?: Warp[];
  wallRows?: number;
  /** Reshape the room after the basic box is laid (map tile coordinates). */
  shape?: (b: MapBuilder) => void;
  /** Furniture is listed in map tiles (no void-column shift). */
  abs?: boolean;
}

function interior(id: string, name: string, w: number, h: number, wall: TerrainId, floor: TerrainId, doorX: number, items: P[], opts: InteriorOpts = {}) {
  const rb = room({ w, h, wall, floor, doorX, wallRows: opts.wallRows ?? 3 });
  opts.shape?.(rb);
  const dx = opts.abs ? 0 : 1;
  const objects: ObjectPlacement[] = items.map(([kind, x, y, props, oid]) => {
    const pr = props ? { ...props } : undefined;
    const wide = WIDE[kind];
    if (wide && pr && pr.solid == null) {
      const sol = wide(Number(pr.w ?? 3));
      if (sol) pr.solid = sol;
    }
    return { kind, x: x + dx, y, props: pr, id: oid };
  });
  objects.push({ kind: 'door-mat', x: doorX + 1.5, y: h - 0.0, id: `${id}-mat` });
  registerMap({
    id,
    name,
    ...rb.build(),
    objects,
    warps: [...(opts.extraWarps ?? [])],
    music: opts.music ?? 'home',
    indoor: true,
    indoorLight: opts.light ?? 0.95,
    outside: '#1d1626',
  });
  INTERIORS.push({ id, doorX: doorX + 1, doorY: h });
}

// ---------------------------------------------------------------- Grandma's house
interior('grandma-house', "Grandma's House", 14, 10, 'wall-blue', 'wood', 3, [
  ['window', 3.5, 2.6], ['window', 9.5, 2.6], ['photo', 6.5, 2.2, { variant: 0 }, 'velvet-photo'], ['calendar', 12, 2.2],
  ['bed', 12.5, 6.2, {}, 'bed'], ['dresser', 10.2, 4.4],
  ['tv-vcr', 1.2, 4.6, {}, 'home-tv'], ['couch', 3, 7.3], ['rug', 3, 8.2, { w: 4, h: 2, variant: 1 }],
  ['fireplace', 7, 4.4], ['bookshelf', 13.6, 9.2], ['trunk', 9.5, 8.6, {}, 'grandma-trunk'],
  ['plant', 0.6, 9.4], ['lamp-floor', 5.4, 6.4],
], { music: 'home', light: 0.9 });

// ---------------------------------------------------------------- The Sportatorium (arena), Birdie's office, locker room
interior('sportatorium', 'The Sportatorium', 30, 20, 'wall-brick', 'concrete', 14, [
  ['ring', 15, 13.6, {}, 'arena-ring'],
  ['bleachers', 3.5, 13, { w: 5 }], ['bleachers', 26.5, 13, { w: 5 }],
  ['folding-chairs', 9, 16.4, { w: 5 }], ['folding-chairs', 21, 16.4, { w: 5 }], ['folding-chairs', 9, 18, { w: 5 }], ['folding-chairs', 21, 18, { w: 5 }],
  ['announce-table', 15, 15.6, {}, 'announce-table'],
  ['poster', 8, 2.2, { variant: 0 }], ['poster', 12, 2.2, { variant: 1 }], ['poster', 18, 2.2, { variant: 2 }], ['poster', 22, 2.2, { variant: 3 }],
  ['door-wall', 3, 3, { text: 'OFFICE' }, 'door-office'], ['door-wall', 27, 3, { text: 'LOCKERS' }, 'door-lockers'],
  ['torch', 0.4, 2.6], ['mic-stand', 18.5, 15.2],
  ['chair', 28.5, 18.2, {}, 'chair-arena'],
], {
  music: 'sportatorium',
  light: 0.8,
  extraWarps: [
    { x: 4, y: 2, w: 1, h: 2, to: 'birdie-office', tx: 5, ty: 7, facing: 'up', door: true, label: "Birdie's office" },
    { x: 28, y: 2, w: 1, h: 2, to: 'lockers', tx: 7, ty: 8, facing: 'up', door: true, label: 'Locker room' },
  ],
});

interior('birdie-office', "Birdie's Office", 10, 8, 'wall-pink', 'carpet', 4, [
  ['corkboard', 5, 2.4, {}, 'corkboard'], ['photo', 2, 2.1, { variant: 1 }], ['poster', 8.6, 2.3, { variant: 3 }],
  ['desk', 5, 4.8, {}, 'birdie-desk'], ['office-chair', 5, 4.0], ['filing-cabinet', 1, 4.4], ['trophy-case', 8.6, 4.6, {}, 'trophies'], ['plant', 0.8, 7.4],
  ['rug', 3, 7, { w: 4, h: 1, variant: 2 }],
], {
  music: 'sportatorium',
  extraWarps: [],
});

interior('lockers', 'Locker Room', 14, 9, 'wall-panel', 'rubber', 6, [
  ['locker', 3.5, 3.6, { w: 6 }], ['locked-locker', 7.2, 3.6, {}, 'dottie-locker'], ['locker', 10.5, 3.6, { w: 5 }],
  ['bench', 5, 6], ['bench', 10, 6],
  ['stairs-down', 12.5, 8.2, {}, 'dungeon-stairs'],
  ['poster', 1, 2.4, { variant: 4 }], ['plant', 0.6, 8.4],
], { music: 'sportatorium', light: 0.75 });

// ---------------------------------------------------------------- Hot Tag Diner
// June Oyelaran's place since '87. The counter splits the room: June's side
// (kitchen door, order window, the back bar under the menu) and the regulars'
// side (eight stools, booths along the front windows). The right-hand corner
// steps forward into its own pink-papered nook: the back booth, where every
// storyline in town gets pitched, under forty years of signed photos.
interior('diner', 'Hot Tag Diner', 18, 11, 'wall-wood', 'checker', 8, [
  // June's side of the counter
  ['door-wall', 2, 3, { swing: true, plate: 'KITCHEN', variant: 1 }],
  ['pass-window', 4.6, 2.75],
  ['back-bar', 9.5, 3.1, { w: 6, items: '013254', shelf: false }],
  ['menu-board', 9.5, 1.3],
  ['wall-clock', 12.3, 1.25, { neon: true }],
  ['floor-mat', 7.5, 4.9, { w: 9, h: 0.8, variant: 0 }],
  ['counter', 7, 6.95, { w: 10, style: 'diner' }, 'diner-counter'],
  ['cash-register', 10.5, 6.15],
  ['stool', 3.5, 7.8], ['stool', 4.5, 7.8], ['stool', 5.5, 7.8], ['stool', 6.5, 7.8],
  ['stool', 7.5, 7.8], ['stool', 8.5, 7.8], ['stool', 9.5, 7.8], ['stool', 10.5, 7.8],
  ['pendant', 4, 6.3, { variant: 0 }], ['pendant', 7.5, 6.3, { variant: 1 }], ['pendant', 11, 6.3, { variant: 0 }],
  // the back-booth nook
  ['neon', 14.6, 2.3, { sign: 'PIE', color: '#ff5d8f' }],
  ['jukebox', 13.6, 4.9, {}, 'jukebox'],
  ['photo-wall', 16.1, 3.5, { variant: 0 }],
  ['fan-case', 17.6, 1.95],
  ['payphone', 18.35, 3.95, { text: 'The diner payphone. "JUNE 555-0187" is scrawled on the wall beside it, which is funny, because this is June\'s phone.' }],
  ['back-booth', 15.75, 6.6, {}, 'back-booth'],
  ['pendant', 15.4, 6.2, { variant: 2, color: '#ffc880' }],
  // booths along the front windows: regulars sit on row 9 with their backs to you, facing the table
  ['booth-table', 2, 9.25, { w: 2 }], ['booth-seat', 2, 10.95, { w: 2, variant: 'red', worn: true }],
  ['booth-table', 5, 9.25, { w: 2 }], ['booth-seat', 5, 10.95, { w: 2, variant: 'teal' }],
  ['booth-table', 14.5, 9.25, { w: 3 }], ['booth-seat', 14.5, 10.95, { w: 3, variant: 'red' }],
  ['booth-table', 17, 9.25, { w: 2 }], ['booth-seat', 17, 10.95, { w: 2, variant: 'teal', worn: true }],
  ['pendant', 2, 9.1, { variant: 1 }], ['pendant', 5, 9.1, { variant: 0 }], ['pendant', 14.5, 9.1, { variant: 1 }], ['pendant', 17, 9.1, { variant: 0 }],
  // by the door
  ['coat-rack', 6.6, 10.7],
  ['gumball', 11.5, 10.6],
  ['plant', 12.4, 10.7, { variant: 1 }],
], {
  music: 'diner',
  light: 0.88,
  abs: true,
  shape: (b) => {
    // the back-booth nook steps forward one tile and wears its own wallpaper
    b.rect(13, 0, 6, 1, 'void');
    b.rect(13, 1, 6, 3, 'wall-pink');
    b.rect(13, 4, 6, 4, 'wood');
    // kitchen tile on June's side of the counter, rubber mats where she stands all day
    b.rect(1, 3, 12, 3, 'tile');
  },
});

// ---------------------------------------------------------------- VFW Hall (Wednesday shows)
interior('vfw', 'VFW Post 316', 24, 15, 'wall-wood', 'wood-dark', 11, [
  ['ring', 12, 10, {}, 'vfw-ring'],
  ['folding-chairs', 4, 12.4, { w: 5 }], ['folding-chairs', 20, 12.4, { w: 5 }], ['folding-chairs', 4, 14, { w: 5 }], ['folding-chairs', 20, 14, { w: 5 }],
  ['bingo-board', 3, 2.6, {}, 'bingo-board'], ['window', 8, 2.6], ['window', 16, 2.6], ['poster', 21, 2.3, { variant: 5 }], ['photo', 11.5, 2.1, { variant: 3 }],
  ['announce-table', 12, 11.6], ['trophy-case', 22.5, 5], ['table', 21, 8.4], ['chair-wood', 21, 7.4],
], { music: 'show', light: 0.85 });

// ---------------------------------------------------------------- Shops and homes
interior('library', 'Public Library', 16, 11, 'wall', 'carpet', 7, [
  ['bookshelf', 2, 4.6], ['bookshelf', 5, 4.6], ['bookshelf', 11, 4.6], ['bookshelf', 14, 4.6],
  ['desk', 8, 4.6, {}, 'library-desk'], ['office-chair', 8, 3.8],
  ['rug', 2, 8.4, { w: 4, h: 2, variant: 3 }, 'storytime-rug'], ['armchair', 4, 7.6, {}, 'storytime-chair'],
  ['table', 12, 8.4], ['chair-wood', 11, 8.6], ['chair-wood', 13, 8.6],
  ['window', 4, 2.6], ['window', 11, 2.6], ['plant', 15.4, 10.4], ['lamp-floor', 0.6, 7.4],
], { music: 'home' });

interior('taqueria', 'Taqueria Mariposa', 14, 9, 'wall-pink', 'tile', 6, [
  ['counter', 4, 4.6, { w: 6 }, 'taq-counter'], ['cash-register', 2, 3.8], ['stove', 10.5, 4.4], ['fridge', 12.6, 4.4],
  ['table', 3, 7.4], ['chair-wood', 2, 7.6], ['chair-wood', 4, 7.6], ['table', 10, 7.4], ['chair-wood', 9, 7.6], ['chair-wood', 11, 7.6],
  ['poster', 7, 2.2, { variant: 0 }], ['photo', 11, 2.1, { variant: 4 }, 'abuela-photo'], ['plant', 0.6, 8.4], ['plant', 13.4, 8.4],
], { music: 'diner' });

interior('bakery', 'Tallbridge Bakery', 12, 8, 'wall', 'checker', 5, [
  ['display-case', 4, 4.6, {}, 'bakery-case'], ['counter', 8.5, 4.6, { w: 3 }], ['cash-register', 9, 3.8], ['stove', 1, 4.4],
  ['table', 9.5, 7], ['chair-wood', 8.5, 7.2], ['window', 4, 2.6], ['plant', 11.4, 7.4],
], { music: 'diner' });

interior('radio', 'WRSL 1340 AM', 10, 8, 'wall-panel', 'carpet', 4, [
  ['radio-console', 5, 4.6, {}, 'radio-console'], ['mic-stand', 7.4, 4.8], ['office-chair', 5, 5.6], ['filing-cabinet', 1, 4.4], ['crt-stack', 9, 4.8],
  ['poster', 3, 2.3, { variant: 2 }], ['poster', 7.5, 2.3, { variant: 5 }],
], { music: 'diner', light: 0.85 });

interior('tailor', "Sew What? (Marigold's)", 12, 8, 'wall-pink', 'wood', 5, [
  ['counter', 6, 4.6, { w: 4 }, 'tailor-counter'], ['sewing-machine', 9.5, 4.6, {}, 'tailor-machine'], ['mannequin', 1.5, 5], ['mannequin', 11, 5],
  ['clothing-rack', 3, 7.4], ['clothing-rack', 9, 7.4], ['window', 6, 2.6], ['photo', 2.5, 2.1, { variant: 5 }],
], { music: 'creator' });

interior('pawn', "Fenwick's Pawn & Tapes", 12, 9, 'wall-brick', 'wood-dark', 5, [
  ['vhs-shelf', 2, 4.8], ['vhs-shelf', 10, 4.8], ['crt-stack', 6, 4.8], ['counter', 6, 6.6, { w: 3 }, 'pawn-counter'], ['cash-register', 6.4, 5.8],
  ['shelf-goods', 2.5, 8.4, { w: 3 }, 'card-shelf'], ['tapebin', 10.5, 8.4, { bin: 'fenwick' }, 'bin-fenwick'], ['poster', 4, 2.3, { variant: 1 }],
], { music: 'tapes', light: 0.8 });

interior('hardware', 'Steel Chair Hardware', 12, 9, 'wall-brick', 'concrete', 5, [
  ['shelf-goods', 2.5, 4.8, { w: 3 }], ['shelf-goods', 9.5, 4.8, { w: 3 }], ['counter', 6, 5, { w: 3 }, 'hardware-counter'], ['cash-register', 6.5, 4.2],
  ['folding-chairs', 3, 8, { w: 3 }], ['crate', 10, 8], ['barrel', 11, 7.6], ['poster', 6, 2.3, { variant: 4 }],
], { music: 'diner' });

interior('clinic', 'Halloran Chiropractic', 10, 8, 'wall', 'tile', 4, [
  ['exam-table', 6.5, 4.8, {}, 'exam-table'], ['desk', 2.5, 4.8], ['office-chair', 2.5, 4.0], ['plant', 9.4, 7.4], ['poster', 5, 2.3, { variant: 4 }], ['window', 8, 2.6],
], { music: 'home' });

interior('studio', 'Hurricane Physio & Yoga', 10, 8, 'wall-blue', 'wood', 4, [
  ['yoga-mat', 2.5, 6.6], ['yoga-mat', 4.5, 6.6], ['yoga-mat', 7.5, 6.6], ['plant', 0.6, 4.4], ['plant', 9.4, 4.4], ['window', 5, 2.6], ['speed-bag', 8.5, 4.6],
], { music: 'home' });

interior('sunnypines', 'The Evening Bell Residence', 18, 10, 'wall', 'carpet', 8, [
  ['rocking-chair', 3, 5], ['rocking-chair', 5, 5], ['tv-lounge', 9, 4.8, {}, 'pines-tv'], ['couch', 9, 7.4], ['piano', 15.5, 4.8, {}, 'pines-piano'],
  ['table', 14, 8], ['chair-wood', 13, 8.2], ['chair-wood', 15, 8.2], ['window', 4, 2.6], ['window', 13, 2.6], ['plant', 0.6, 9.4], ['plant', 17.4, 9.4],
  ['door-wall', 17, 3, { text: 'ROOM 7' }, 'door-room7'],
], {
  music: 'home',
  extraWarps: [{ x: 18, y: 2, w: 1, h: 2, to: 'grandma-room', tx: 4, ty: 6, facing: 'up', door: true, label: 'Room 7' }],
});

interior('grandma-room', 'Room 7', 8, 7, 'wall-blue', 'carpet', 3, [
  ['bed', 6.5, 5.2, {}, 'grandma-bed'], ['armchair', 2, 5, {}, 'grandma-chair'], ['tv-vcr', 1, 3.8, {}, 'grandma-tv'], ['window', 5, 2.6], ['photo', 3, 2.1, { variant: 0 }], ['plant', 7.4, 6.4],
], { music: 'sad' });

interior('school', 'Turnbuckle Alley High Gym', 18, 12, 'wall-panel', 'mat', 8, [
  ['bleachers', 3, 6, { w: 5 }], ['bleachers', 15, 6, { w: 5 }], ['trophy-case', 9, 4.4, {}, 'school-trophies'], ['poster', 6, 2.3, { variant: 4 }], ['poster', 12, 2.3, { variant: 2 }],
], { music: 'workout' });

interior('birdie-house', "Birdie's House", 12, 8, 'wall-pink', 'wood', 4, [
  ['couch', 3, 6], ['tv-vcr', 1, 4.4], ['armchair', 6, 5], ['bed', 10.5, 5.2], ['photo', 4, 2.1, { variant: 1 }], ['window', 7.5, 2.6], ['plant', 11.4, 7.4], ['rug', 2, 7, { w: 4, h: 1, variant: 0 }],
], { music: 'home' });

interior('house-abernathy', "The Abernathys' House", 10, 7, 'wall', 'wood', 4, [
  ['couch', 3, 5], ['table', 7, 5.4], ['chair-wood', 6, 5.6], ['chair-wood', 8, 5.6], ['tv-vcr', 1, 4.2], ['window', 5, 2.6], ['plant', 9.4, 6.4],
], { music: 'home' });

interior('airstream', "Sweet Lou's Airstream", 9, 5, 'wall-wood', 'wood', 3, [
  ['bed', 7.5, 4.2, {}, 'lou-bed'], ['table', 2, 4.4], ['tv-vcr', 0.8, 3.6, {}, 'lou-tv'], ['photo', 4.5, 1.9, { variant: 3 }, 'lou-photo'],
], { music: 'home', wallRows: 2 });

interior('gasstation', 'Gas · Bait · Snacks', 10, 7, 'wall', 'tile', 4, [
  ['counter', 6.5, 4.6, { w: 4 }, 'gas-counter'], ['cash-register', 7, 3.8], ['shelf-goods', 2, 6.4, { w: 3 }], ['vending', 9.4, 4.6], ['fridge', 0.6, 4.2], ['poster', 4, 2.3, { variant: 2 }],
], { music: 'diner' });

interior('salon', 'Gorgeous (Salon)', 10, 7, 'wall-pink', 'checker', 4, [
  ['dresser', 2, 4.4], ['armchair', 2, 5.6, {}, 'salon-chair-1'], ['dresser', 6, 4.4], ['armchair', 6, 5.6, {}, 'salon-chair-2'], ['counter', 9, 6.4, { w: 2 }], ['plant', 0.6, 6.4], ['poster', 4, 2.3, { variant: 2 }], ['photo', 8, 2.1, { variant: 5 }],
], { music: 'creator' });

// ---------------------------------------------------------------- The city prologue
interior('maxx-office', 'MaxxMedia, Floor 31', 20, 10, 'wall-panel', 'carpet', 9, [
  ['window', 3, 2.6], ['window', 7, 2.6], ['window', 11, 2.6], ['window', 15, 2.6], ['poster', 18.5, 2.3, { variant: 2 }],
  ['desk', 6, 6, {}, 'player-desk'], ['crt-stack', 6, 5.2], ['office-chair', 6, 7],
  ['desk', 10, 6, {}, 'arlo-desk'], ['crt-stack', 10, 5.2], ['office-chair', 10, 7],
  ['desk', 14, 6], ['crt-stack', 14, 5.2], ['office-chair', 14, 7],
  ['desk', 6, 9.4], ['desk', 14, 9.4], ['filing-cabinet', 1, 4.4], ['filing-cabinet', 2, 4.4], ['vending', 19, 5], ['plant', 0.6, 9.4],
  ['door-wall', 17, 3, { text: 'R. PENN' }, 'royce-door'],
], { music: 'city', light: 0.92 });

interior('apartment', 'Your Apartment', 10, 7, 'wall', 'wood', 4, [
  ['bed', 8.5, 5.2, {}, 'apt-bed'], ['tv-vcr', 1, 4.2], ['couch', 3, 6], ['window', 5, 2.6], ['dresser', 6.5, 4.2, {}, 'apt-mirror'], ['plant', 9.4, 6.4], ['door-mat', 4.5, 7],
], { music: 'city', light: 0.75 });
