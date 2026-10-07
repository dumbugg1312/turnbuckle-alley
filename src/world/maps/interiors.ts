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
  'folding-chairs': (w) => ({ x: -w * 8, y: -6, w: w * 16, h: 5 }),
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
// Shut up since October 1983, taxes paid every year from wherever she was.
// A harvest-gold kitchen in the corner with the wall phone and the gingham
// table; the living room around the fireplace, the Polaroid of the Velvet
// Hammers over the mantel, a couch with an afghan; dust sheets still over
// the things you haven't got to yet; cobwebs in the corners. Past the wall,
// her bedroom: the quilt, the vanity with its ring of bulbs, the calendar
// still on October 1983, and the trunk with the faded gold star.
interior('grandma-house', "Grandma's House", 14, 10, 'wall-blue', 'wood', 3, [
  // kitchen
  ['kitchen-run', 2.5, 3.15, { w: 3, style: 'grandma' }],
  ['fridge', 4.5, 4.0],
  ['wall-phone', 5.5, 2.4],
  ['table', 2.6, 6.6, { variant: 1 }], ['chair-wood', 1.4, 6.9], ['chair-wood', 3.8, 6.9],
  ['cobweb', 1.375, 0.75],
  // living room
  ['fireplace', 7.5, 4.4],
  ['photo', 7.5, 1.55, { variant: 0 }, 'velvet-photo'],
  ['window', 9.4, 2.0, { variant: 1 }],
  ['tv-vcr', 9.3, 4.6, {}, 'home-tv'],
  ['rug', 7.5, 9.6, { w: 5, h: 3, variant: 1 }],
  ['couch', 7.5, 7.0, { variant: 1 }],
  ['coffee-table', 7.5, 8.5],
  ['lamp-floor', 5.4, 6.6],
  ['sunbeam', 9.9, 6.6, { len: 4 }],
  ['dust-sheet', 9.1, 8.9, { variant: 0 }],
  ['dust-sheet', 1.6, 9.3, { variant: 1 }],
  // her bedroom
  ['vanity', 11.75, 4.1],
  ['calendar', 12.2, 1.6, { year: '1983' }],
  ['window', 13.5, 2.6, { variant: 3 }],
  ['bed', 13.5, 6.2, { variant: 0 }, 'bed'],
  ['dust-sheet', 11.5, 6.7, { variant: 2 }],
  ['rug', 12.9, 9.5, { w: 3, h: 2, variant: 0 }],
  ['trunk', 11.8, 8.7, {}, 'grandma-trunk'],
  ['quilt-rack', 14.4, 8.8],
  ['cobweb', 14.625, 0.75, { flip: true }],
], {
  music: 'home',
  light: 0.88,
  abs: true,
  shape: (b) => {
    b.rect(1, 3, 4, 4, 'checker');
    b.rect(10, 3, 1, 3, 'wall-blue');
    b.rect(11, 3, 4, 7, 'carpet');
  },
});

// ---------------------------------------------------------------- The Sportatorium (arena), Birdie's office, locker room
// The ring is the altar: dead centre under a lighting truss, an entrance stage
// with a tinsel curtain at the head of the aisle, grandstands rising on both
// sides, the snack bar and the merch table along the back wall under fifty
// years of championship banners. Front row ringside: seat A1, kept empty
// since 1984, and the announce table where Gus calls every match.
interior('sportatorium', 'The Sportatorium', 30, 20, 'wall-brick', 'concrete', 14, [
  // back wall
  ['door-wall', 4, 3, { text: 'OFFICE' }, 'door-office'], ['door-wall', 28, 3, { text: 'LOCKERS' }, 'door-lockers'],
  ['exit-sign', 4, 0.7], ['exit-sign', 28, 0.7],
  ['poster', 1.7, 2.4, { variant: 3 }], ['poster', 30.3, 2.4, { variant: 4 }],
  ['banner', 6.6, 2.0, { variant: 0 }], ['banner', 8.5, 2.0, { variant: 3 }], ['banner', 10.4, 2.0, { variant: 1 }],
  ['banner', 21.6, 2.0, { variant: 2 }], ['banner', 23.5, 2.0, { variant: 4 }], ['banner', 25.4, 2.0, { variant: 5 }],
  ['concession', 8.5, 4.95, { w: 5, text: 'The snack bar. Popcorn is a quarter, same as 1979. Birdie says raising it would be "a betrayal of the people."', solid: { x: -40, y: -12, w: 80, h: 11 } }],
  ['merch-table', 23, 4.95, { w: 4, solid: { x: -32, y: -12, w: 64, h: 11 } }],
  ['extinguisher', 25.8, 2.9],
  ['entrance-stage', 16, 5.95, { w: 8, solid: { x: -64, y: -46, w: 128, h: 44 } }],
  ['stool', 11.4, 5.7],
  // the ring and its lights
  ['ring', 16, 13.6, {}, 'arena-ring'],
  ['truss', 16, 12.1],
  // grandstands
  ['grandstand', 3.375, 13, { tiers: 4, len: 7, side: 'left', solid: { x: -38, y: -112, w: 76, h: 111 } }],
  ['grandstand', 28.625, 13, { tiers: 4, len: 7, side: 'right', solid: { x: -38, y: -112, w: 76, h: 111 } }],
  // ringside: front row (seat A1 is Grandma's, if she ever comes back), announce table, the rows behind
  ['folding-chair', 10.5, 16.8], ['folding-chair', 11.5, 16.8], ['folding-chair', 12.5, 16.8], ['folding-chair', 13.5, 16.8],
  ['folding-chair', 14.5, 16.8, { reserved: true }],
  ['folding-chair', 18.5, 16.8], ['folding-chair', 19.5, 16.8], ['folding-chair', 20.5, 16.8], ['folding-chair', 21.5, 16.8],
  ['announce-table', 16.5, 15.6, {}, 'announce-table'], ['mic-stand', 18.6, 15.4],
  ['folding-chairs', 10, 17.8, { w: 4 }], ['folding-chairs', 19.5, 17.8, { w: 5 }],
  ['folding-chairs', 10.5, 18.8, { w: 5 }], ['folding-chairs', 25.5, 18.8, { w: 3 }],
  // Sweet Lou's camera, rolling since 1979
  ['camera-rig', 27.5, 15.4], ['stool', 28.5, 16.8],
  ['chair', 29.5, 18.2, {}, 'chair-arena'],
], {
  music: 'sportatorium',
  light: 0.78,
  abs: true,
  extraWarps: [
    { x: 4, y: 2, w: 1, h: 2, to: 'birdie-office', tx: 5, ty: 7, facing: 'up', door: true, label: "Birdie's office" },
    { x: 28, y: 2, w: 1, h: 2, to: 'lockers', tx: 7, ty: 8, facing: 'up', door: true, label: 'Locker room' },
  ],
});

// Wood paneling, a carny's clutter: the corkboard of feuds with red string,
// napkins full of storylines on the desk, ticket rolls, the bank's final
// notice, peppermints, the safe, boxes of flyers, the cot for late nights,
// and her fishing rod for Monday mornings with Lou.
interior('birdie-office', "Birdie's Office", 10, 8, 'wall-wood', 'carpet', 4, [
  ['corkboard', 3, 2.4, {}, 'corkboard'],
  ['photo', 5.4, 1.85, { variant: 0 }],
  ['notice', 6.9, 1.25, { lines: 'BANK|FRIDAY!!', variant: 1 }],
  ['window-blinds', 8.4, 2.7],
  ['rug', 5.5, 7.4, { w: 5, h: 2, variant: 1 }],
  ['promoter-desk', 6, 4.95, { solid: { x: -20, y: -12, w: 40, h: 11 } }, 'birdie-desk'],
  ['office-chair', 6.6, 3.7, { solid: { x: 0, y: 0, w: 0, h: 0 } }],
  ['filing-cabinet', 1.5, 4.4], ['filing-cabinet', 2.4, 4.4],
  ['trophy-case', 9.6, 4.6, {}, 'trophies'],
  ['safe', 1.6, 6.6],
  ['box-stack', 3, 7.8, { label: 'FLYERS' }],
  ['cot', 9.4, 7.75],
  ['fishing-gear', 10.5, 6.3],
  ['plant', 7.4, 7.7, { variant: 1 }],
], {
  music: 'sportatorium',
  light: 0.86,
  abs: true,
});

// Steel lockers with everyone's name on masking tape, and one padlocked locker
// that nobody has opened since 1983. The long mirror is held together with
// tape and notes; there's a shower stall in the corner, benches covered in
// boots and duffels, the taping table, tonight's card on the whiteboard, and
// in the far corner the stairs down to the Dungeon.
interior('lockers', 'Locker Room', 14, 9, 'wall-panel', 'concrete', 6, [
  ['locker', 4.375, 3.65, { w: 9, names: 'ROSA,DEX,HAZEL,EARL,TINY,GIDEON,CLINT,LACEY,PATTY', solid: { x: -54, y: -8, w: 108, h: 7 } }],
  ['locked-locker', 8.1875, 3.65, {}, 'dottie-locker'],
  ['locker', 9.3125, 3.65, { w: 2, names: 'BO,BUCK', solid: { x: -12, y: -8, w: 24, h: 7 } }],
  ['mirror-vanity', 11.5625, 3.15, { w: 3 }],
  ['shower-stall', 13.9, 4.0],
  ['wall-clock', 3, 1.05],
  ['notice', 6.2, 1.25, { lines: 'HANG YOUR TOWEL|WIN OR LOSE|-B.M.' }],
  ['notice', 9.4, 1.1, { lines: 'NO SPITTING|ON THE MAT|THIS MEANS|BUCK', variant: 1 }],
  ['floor-mat', 6, 4.95, { w: 9, h: 0.8, variant: 0 }],
  ['locker-bench', 4.5, 6.2, { w: 4, solid: { x: -32, y: -8, w: 64, h: 6 } }],
  ['locker-bench', 10.5, 6.2, { w: 3, solid: { x: -24, y: -8, w: 48, h: 6 } }],
  ['taping-table', 2.6, 8.4, {}, ],
  ['laundry-cart', 5.2, 8.6],
  ['water-cooler', 9.6, 8.6],
  ['whiteboard', 11.2, 8.75],
  ['stairs-down', 13.5, 8.2, {}, 'dungeon-stairs'],
], {
  music: 'sportatorium',
  light: 0.78,
  abs: true,
  shape: (b) => b.rect(13, 3, 2, 2, 'tile'),
});

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

// Room 7: she chose it for the window, which faces the Sportatorium marquee.
// She arranges it like a locker room: cardigans on hooks, sneakers toes-out,
// the vanity with the ring of bulbs Hank rewired, drawers Sami labelled (and
// relabelled), the memory book by her chair, the hatbox under the bed.
interior('grandma-room', 'Room 7', 8, 7, 'wall-blue', 'carpet', 3, [
  ['vanity', 1.8, 4.3],
  ['coat-hooks', 3.7, 2.55],
  ['dresser', 4, 4.4, { labels: true }],
  ['photo', 5.25, 1.55, { variant: 0 }],
  ['window', 6.4, 2.6, { variant: 3, view: 'marquee' }],
  ['tv-vcr', 6, 4.6, {}, 'grandma-tv'],
  ['bed', 7.6, 5.2, { variant: 2 }, 'grandma-bed'],
  ['quilt-rack', 8.4, 6.85],
  ['rug', 4.5, 6.8, { w: 3, h: 2, variant: 0 }],
  ['armchair', 3.5, 5.8, { variant: 3, solid: { x: 0, y: 0, w: 0, h: 0 } }, 'grandma-chair'],
  ['side-table', 1.9, 5.9],
  ['sneakers', 6.4, 6.85],
], {
  music: 'sad',
  light: 0.84,
  abs: true,
});

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

// A city studio at midnight: a steel kitchenette and a fridge that hums, the
// old TV you used to watch territory tapes on with Grandma, the city glowing
// through the window, takeout on the floor, laundry with the MaxxMedia lanyard
// on top, the mirror with a sticky note that says CALL GRANDMA, and on the
// mat, under two bills, the envelope addressed in pencil.
interior('apartment', 'Your Apartment', 10, 7, 'wall', 'wood', 4, [
  ['kitchen-run', 2, 3.15, { w: 2, style: 'steel', kettle: false }],
  ['fridge', 3.5, 4.0],
  ['poster', 4.6, 2.3, { variant: 2 }],
  ['tv-vcr', 4.7, 4.5],
  ['window', 6.5, 2.6, { variant: 1, view: 'city' }],
  ['standing-mirror', 6.2, 4.6],
  ['photo', 8.3, 1.9, { variant: 1 }],
  ['dresser', 7.4, 4.4, {}, 'apt-mirror'],
  ['bed', 9.5, 5.2, { variant: 1 }, 'apt-bed'],
  ['rug', 5.5, 6.9, { w: 3, h: 2, variant: 2 }],
  ['takeout', 3, 6.4],
  ['clothes-pile', 8.2, 6.6],
  ['plant', 1.4, 6.6, { variant: 1 }],
  ['lamp-floor', 10.4, 6.6],
  ['mail-pile', 5.6, 6.95],
], {
  music: 'city',
  light: 0.72,
  abs: true,
  shape: (b) => b.rect(1, 3, 2, 2, 'tile'),
});
