import { type MapBuilder, registerMap, room } from './index';
import { objectKind } from '../registry';
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

type Box = { x: number; y: number; w: number; h: number };
/** A solid that never collides: for seats NPCs sit on (their sit spot is the seat's own tile). */
const NOSOLID: Box = { x: 0, y: -99999, w: 0, h: 0 };

/**
 * Snap a piece of furniture's collision box to whole tiles. The pathfinding
 * grid only blocks tiles a box mostly covers, while the player's feet collide
 * with every pixel; a box that pokes a few pixels into the next tile turns that
 * tile into a trap the pathfinder walks into and gets stuck on. Snapping keeps
 * the tiles a piece really stands on (5+ px of overlap) and frees the rest.
 * Evaluated lazily (when the map is built at runtime) so the art's own solids,
 * registered by the art modules, are known by then.
 */
function snapSolid(kind: string, ax: number, ay: number, given: Box | undefined): Box | undefined {
  const s = given ?? objectKind(kind).solid;
  if (!s) return undefined;
  if (s.y <= -9999 || s.w <= 0 || s.h <= 0) return NOSOLID;
  const span = (a: number, b: number): [number, number] | null => {
    let lo: number | null = null;
    let hi = 0;
    let best = 0;
    let bo = 0;
    for (let t = Math.floor(a / 16); t * 16 < b; t++) {
      const ov = Math.min(b, (t + 1) * 16) - Math.max(a, t * 16);
      if (ov > bo) {
        bo = ov;
        best = t;
      }
      if (ov >= 5) {
        if (lo === null) lo = t;
        hi = t;
      }
    }
    if (lo !== null) return [lo, hi];
    return bo >= 2 ? [best, best] : null;
  };
  const sx = span(ax + s.x, ax + s.x + s.w);
  const sy = span(ay + s.y, ay + s.y + s.h);
  if (!sx || !sy) return NOSOLID;
  return { x: sx[0] * 16 - ax, y: sy[0] * 16 - ay, w: (sx[1] - sx[0] + 1) * 16, h: (sy[1] - sy[0] + 1) * 16 };
}

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
    const pr: Record<string, unknown> = props ? { ...props } : {};
    const wide = WIDE[kind];
    let given = pr.solid as Box | undefined;
    if (wide && given == null) given = wide(Number(pr.w ?? 3)) ?? undefined;
    if (opts.abs) {
      // grid-snapped collision, resolved when the map is built (see snapSolid)
      const ax = Math.round((x + dx) * 16);
      const ay = Math.round(y * 16);
      delete pr.solid;
      Object.defineProperty(pr, 'solid', { enumerable: true, configurable: true, get: () => snapSolid(kind, ax, ay, given) });
    } else if (given) pr.solid = given;
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
  ['announce-table', 16.5, 15.6, { solid: { x: -12, y: -11, w: 24, h: 10 } }, 'announce-table'], ['mic-stand', 18.6, 15.4],
  ['folding-chairs', 10, 17.8, { w: 4 }], ['folding-chairs', 19.5, 17.8, { w: 5 }],
  ['folding-chairs', 10.5, 18.8, { w: 5 }], ['folding-chairs', 25.5, 18.8, { w: 3 }],
  // Sweet Lou's camera, rolling since 1979
  ['camera-rig', 27.5, 15.4], ['stool', 28.5, 16.8],
  ['chair', 30.5, 18.9, {}, 'chair-arena'],
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
  ['office-chair', 6.6, 3.7, { solid: NOSOLID }],
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
// Wood paneling and a portable ring in the middle of the bingo hall. The
// bandstand with its velvet curtain, flags and podium on the left; the
// canteen (coffee, sheet cake, pickled eggs, pull-tabs) on the right; the
// honour wall of portraits and the bingo board above the ring; bingo tables
// set up on both sides; chairs stacked on dollies; a card table at the door.
interior('vfw', 'VFW Post 316', 24, 15, 'wall-wood', 'wood-dark', 11, [
  ['bandstand', 3.5, 5.95, { w: 5, solid: { x: -40, y: -46, w: 80, h: 44 } }],
  ['trophy-case', 7, 4.6],
  ['photo-wall', 10.6, 2.6, { variant: 2 }],
  ['notice', 13, 1.35, { lines: 'BINGO WED|AFTER THE|MATCHES', variant: 1 }],
  ['bingo-board', 15.6, 2.6, {}, 'bingo-board'],
  ['canteen', 21.5, 4.95, { w: 6, solid: { x: -48, y: -12, w: 96, h: 11 } }],
  ['ring', 13, 10, {}, 'vfw-ring'],
  ['announce-table', 13, 11.6], ['mic-stand', 15.3, 11.4],
  // bingo tables, both sides
  ['bingo-table', 3, 7.6, { w: 3, solid: { x: -24, y: -9, w: 48, h: 7 } }], ['bingo-table', 3, 9.4, { w: 3, solid: { x: -24, y: -9, w: 48, h: 7 } }],
  ['folding-chair', 1.5, 8.6], ['folding-chair', 2.5, 8.6], ['folding-chair', 3.5, 8.6],
  ['folding-chair', 1.5, 10.4], ['folding-chair', 2.5, 10.4], ['folding-chair', 3.5, 10.4],
  ['bingo-table', 21.5, 7.6, { w: 3, solid: { x: -24, y: -9, w: 48, h: 7 } }], ['bingo-table', 21.5, 9.4, { w: 3, solid: { x: -24, y: -9, w: 48, h: 7 } }],
  ['folding-chair', 20.5, 8.6], ['folding-chair', 21.5, 8.6], ['folding-chair', 22.5, 8.6],
  ['folding-chair', 20.5, 10.4], ['folding-chair', 21.5, 10.4], ['folding-chair', 22.5, 10.4],
  // ringside front row
  ['folding-chair', 4.5, 13.8], ['folding-chair', 5.5, 13.8], ['folding-chair', 6.5, 13.8], ['folding-chair', 7.5, 13.8], ['folding-chair', 8.5, 13.8],
  ['folding-chair', 17.5, 13.8], ['folding-chair', 18.5, 13.8], ['folding-chair', 19.5, 13.8], ['folding-chair', 20.5, 13.8],
  // by the door
  ['chair-cart', 1.7, 14.7], ['chair-cart', 24.2, 14.7],
  ['ticket-table', 16.5, 14.6],
  ['coat-rack', 10.4, 14.6],
], { music: 'show', light: 0.84, abs: true });

// ---------------------------------------------------------------- Shops and homes
// The quietest building in America: shelves along the walls and a row of
// stacks, Earl's circulation desk, the card catalog he carried up the steps
// alone, a globe, the returns cart, a reading table, and the storytime
// corner with the big armchair where the Mountain reads on Saturdays.
interior('library', 'Public Library', 16, 11, 'wall', 'carpet', 7, [
  ['bookshelf', 2, 4.6, { variant: 0 }], ['bookshelf', 4, 4.6, { variant: 1 }], ['bookshelf', 6, 4.6, { variant: 0 }],
  ['bookshelf', 13, 4.6, { variant: 1 }], ['bookshelf', 15, 4.6, { variant: 0 }],
  ['notice', 3, 1.6, { lines: 'STORYTIME|SAT 10AM|THE MOUNTAIN|READS', variant: 2 }],
  ['window', 8.2, 2.6, { variant: 1 }], ['window', 10.8, 2.6, { variant: 1 }],
  ['notice', 9.5, 0.95, { lines: 'QUIET|PLEASE' }],
  ['counter', 9.5, 4.95, { w: 3, style: 'wood' }, 'library-desk'],
  ['bookshelf', 13, 6.95, { variant: 0 }], ['bookshelf', 15, 6.95, { variant: 1 }],
  ['card-catalog', 6.5, 6.6],
  ['book-cart', 10.6, 6.7],
  ['globe', 1.6, 6.7],
  ['table', 12, 8.95, { variant: 0 }],
  ['rug', 3, 9.8, { w: 4, h: 2, variant: 3 }, 'storytime-rug'],
  ['armchair', 4.5, 7.8, { variant: 2, solid: NOSOLID }, 'storytime-chair'],
  ['lamp-floor', 6.1, 9.6],
  ['plant', 16.4, 10.4, { variant: 0 }],
], { music: 'home', light: 0.92, abs: true });

interior('taqueria', 'Taqueria Mariposa', 14, 9, 'wall-pink', 'tile', 6, [
  ['papel-picado', 8, 0.95, { w: 14 }],
  ['kitchen-run', 3.5, 3.15, { w: 4, style: 'taqueria', kettle: false }],
  ['menu-board', 8.6, 1.65, { menu: 'taq' }],
  ['mask-wall', 11.2, 2.1],
  ['ofrenda', 13.6, 2.95, {}, 'abuela-photo'],
  ['counter', 5, 4.95, { w: 6, style: 'tile' }, 'taq-counter'],
  ['cash-register', 2.6, 4.15],
  ['salsa-bar', 13.2, 5.6],
  ['table', 3.5, 7.6, { variant: 0 }], ['chair-wood', 2.1, 7.9], ['chair-wood', 4.9, 7.9],
  ['table', 11.5, 7.6, { variant: 1 }], ['chair-wood', 10.1, 7.9], ['chair-wood', 12.9, 7.9],
  ['plant', 1.4, 8.6, { variant: 0 }], ['plant', 14.4, 8.6, { variant: 2 }],
], { music: 'diner', light: 0.92, abs: true });

// Tiny's bakery: the glass case, racks of bread up the wall, the menu (the
// "heel cake" costs villains extra), the three-tier showpiece under its dome,
// flour sacks, a cafe table by the window, and her dollhouse bakery where
// every pie is the size of a pea.
interior('bakery', 'Tallbridge Bakery', 12, 8, 'wall', 'checker', 5, [
  ['bread-rack', 3.5, 2.95, { w: 4 }],
  ['menu-board', 8.5, 1.5, { menu: 'bakery' }],
  ['kitchen-run', 11, 3.15, { w: 3, style: 'bakery' }],
  ['display-case', 5, 4.95, {}, 'bakery-case'],
  ['counter', 8.5, 4.95, { w: 3, style: 'wood' }],
  ['cash-register', 9.2, 4.15],
  ['tiered-cake', 1.6, 5.6],
  ['flour-sacks', 12.2, 5.4],
  ['table', 9.5, 6.1, { variant: 1, solid: { x: -16, y: -14, w: 32, h: 12 } }],
  ['cafe-chair', 9.5, 6.8],
  ['dollhouse', 11.9, 7.7],
  ['plant', 1.4, 7.6, { variant: 2 }],
], { music: 'diner', light: 0.94, abs: true });

// WRSL 1340 AM, home of The Gravel Pit: egg-crate foam on every wall, the ON
// AIR light, Gus's console and his chrome microphone Old Thunder, a wall of
// LPs, the reel-to-reel turning, a couch for guests who never sit down.
interior('radio', 'WRSL 1340 AM', 10, 8, 'wall-panel', 'carpet', 4, [
  ['foam-wall', 5.5, 2.6, { w: 10 }],
  ['on-air', 5.5, 0.8],
  ['notice', 8.6, 1.9, { lines: 'THE GRAVEL PIT|6 TO 10 AM|WRSL 1340' }],
  ['poster', 3, 2.3, { variant: 5 }],
  ['record-shelf', 2.2, 4.7],
  ['radio-console', 6, 4.95, {}, 'radio-console'],
  ['mic-stand', 6.5, 5.7, { solid: NOSOLID }],
  ['reel-to-reel', 9.6, 4.9],
  ['couch', 8.5, 7.4, { variant: 2 }],
  ['lamp-floor', 1.5, 7.4],
], { music: 'diner', light: 0.82, abs: true });

interior('tailor', "Sew What? (Marigold's)", 12, 8, 'wall-pink', 'wood', 5, [
  ['fabric-bolts', 3, 2.95, { w: 4 }],
  ['notice', 9.2, 1.4, { lines: 'MEASURE TWICE|CUT ONCE|-M.', variant: 2 }],
  ['window', 6.4, 2.6, { variant: 0, view: 'street' }],
  ['counter', 7, 4.95, { w: 4, style: 'wood' }, 'tailor-counter'],
  ['sewing-machine', 10.5, 4.6, {}, 'tailor-machine'],
  ['robe-form', 12.3, 4.7],
  ['mannequin', 1.6, 5.6],
  ['ironing-board', 8.6, 6.6],
  ['clothing-rack', 3, 7.4], ['clothing-rack', 10.6, 7.6],
  ['standing-mirror', 12.4, 7.6],
], { music: 'creator', light: 0.92, abs: true });

// Fenwick's shop: walls of VHS, a stack of TVs all tuned to static, the
// glass counter, the trading-card shelf for Pip, the tape bin. Past the
// brick wall, the famous back room: the Mothman sighting map with red
// string, the repair bench, and Static the parakeet.
interior('pawn', "Fenwick's Pawn & Tapes", 12, 9, 'wall-brick', 'wood-dark', 5, [
  ['neon', 2.6, 1.3, { sign: 'PAWN', color: '#ffd050' }],
  ['neon', 6.4, 1.3, { sign: 'TAPES', color: '#5ff2d6' }],
  ['vhs-shelf', 2, 4.6], ['vhs-shelf', 4.4, 4.6],
  ['crt-stack', 7.4, 4.8],
  ['counter', 6, 6.95, { w: 4, style: 'glass' }, 'pawn-counter'],
  ['cash-register', 7.4, 6.15],
  ['shelf-goods', 3.5, 7.9, { w: 3 }, 'card-shelf'],
  // the back room
  ['sighting-map', 11.1, 2.6],
  ['tv-repair', 11.2, 4.9],
  ['birdcage', 12.4, 7.2],
  ['tapebin', 10.8, 7.9, { bin: 'fenwick' }, 'bin-fenwick'],
], {
  music: 'tapes',
  light: 0.8,
  abs: true,
  shape: (b) => b.rect(9, 3, 1, 3, 'wall-brick'),
});

// Steel Chair Hardware, est. 1979 by Stan Kowalski: the tool wall behind the
// counter, the official ACW chair on sale (the dented one circled), paint
// cans in a pyramid, the riding mower Stan made them promise not to dent,
// the bait fridge, an aisle of odds and ends.
interior('hardware', 'Steel Chair Hardware', 12, 9, 'wall-brick', 'concrete', 5, [
  ['tool-wall', 7.5, 2.75, { w: 5 }],
  ['counter', 7.5, 4.95, { w: 5, style: 'wood' }, 'hardware-counter'],
  ['cash-register', 8.8, 4.15],
  ['riding-mower', 2.4, 4.95],
  ['drink-cooler', 12.5, 3.9, { w: 1, solid: { x: -8, y: -6, w: 16, h: 5 } }],
  ['paint-display', 11.6, 6.8],
  ['shelf-goods', 3, 8.6, { w: 3 }],
  ['shelf-goods', 9, 6.6, { w: 3 }],
  ['chair-display', 10.8, 8.7],
  ['barrel', 7.9, 8.6],
], { music: 'diner', light: 0.9, abs: true });

// Halloran Chiropractic, "We've Got Your Back": the reception desk with a jar
// of butterscotch, the adjusting table, a spine chart, the injury board that
// only insiders can read, a skeleton in a neck brace, the waiting chairs.
interior('clinic', 'Halloran Chiropractic', 10, 8, 'wall', 'tile', 4, [
  ['notice', 3, 1.3, { lines: "WE'VE GOT|YOUR BACK", variant: 0 }],
  ['spine-chart', 6, 2.6],
  ['injury-board', 9.2, 2.3],
  ['counter', 3, 4.95, { w: 2, style: 'wood' }],
  ['exam-table', 7.5, 4.9, {}, 'exam-table'],
  ['skeleton', 10.4, 5.4],
  ['plant', 1.4, 5.8, { variant: 1 }],
  ['waiting-chairs', 3.4, 7.7],
  ['water-cooler', 10.4, 7.6],
], { music: 'home', light: 0.95, abs: true });

// Eye of the Storm, in the old bus depot: the departures board still frozen
// on its last bus (2:10 AM, to the city), a mirror wall with a barre, yoga
// mats, the speed bag, a little fountain trickling, plants everywhere.
interior('studio', 'Hurricane Physio & Yoga', 10, 8, 'wall-blue', 'wood', 4, [
  ['departures-board', 3.6, 1.75],
  ['mirror-barre', 8.6, 2.45, { w: 3 }],
  ['zen-fountain', 1.6, 4.7],
  ['speed-bag', 10, 4.6],
  ['yoga-mat', 3.5, 6.6], ['yoga-mat', 5.5, 6.6], ['yoga-mat', 8, 6.6],
  ['plant', 1.4, 7.4, { variant: 0 }], ['plant', 10.4, 7.4, { variant: 1 }], ['plant', 6.6, 4.4, { variant: 2 }],
], { music: 'home', light: 0.95, abs: true });

interior('sunnypines', 'The Evening Bell Residence', 18, 10, 'wall', 'carpet', 8, [
  ['birdcage', 1.7, 4.8],
  ['window', 4.2, 2.6, { variant: 2 }], ['window', 6.8, 2.6, { variant: 2 }],
  ['rocking-chair', 4.5, 6.8, { solid: NOSOLID }], ['rocking-chair', 6.5, 6.8, { solid: NOSOLID }],
  ['side-table', 5.5, 6.6],
  ['notice', 9, 1.6, { lines: 'TODAY|BINGO 2PM|CHAIR YOGA|MOVIE 7PM', variant: 1 }],
  ['tv-lounge', 11.6, 4.8, {}, 'pines-tv'],
  ['coffee-table', 11.6, 6.6],
  ['rug', 11.6, 9.6, { w: 5, h: 4, variant: 3 }],
  ['couch', 11.6, 8.4, { variant: 3 }],
  ['lamp-floor', 8.6, 7.2],
  ['bookshelf', 9.2, 4.6, { variant: 1 }],
  ['card-table', 3.5, 9.1],
  ['photo-wall', 14.2, 2.6, { variant: 3 }],
  ['nurse-station', 15.5, 5.95, { w: 3, solid: { x: -24, y: -17, w: 48, h: 16 } }],
  ['door-wall', 18, 3, { text: 'ROOM 7', variant: 1 }, 'door-room7'],
  ['piano', 15.5, 8.8, {}, 'pines-piano'],
  ['wheelchair', 13.3, 9.5],
  ['plant', 1.4, 9.4, { variant: 2 }], ['plant', 18.4, 9.4, { variant: 0 }],
], {
  music: 'home',
  light: 0.92,
  abs: true,
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
  ['armchair', 3.5, 5.8, { variant: 3, solid: NOSOLID }, 'grandma-chair'],
  ['side-table', 1.9, 5.9],
  ['sneakers', 6.4, 6.85],
], {
  music: 'sad',
  light: 0.84,
  abs: true,
});

// The high school gym: bleachers on both sides, the hoop and the scoreboard,
// state championship banners, the trophy case, and blue wrestling mats rolled
// out in the middle for Thursday's "debate" between Coach Patty and Odessa.
interior('school', 'Turnbuckle Alley High Gym', 18, 12, 'wall-panel', 'wood', 8, [
  ['scoreboard', 5, 1.5],
  ['hoop', 9.5, 2.7],
  ['banner', 13.4, 2.1, { variant: 6 }], ['banner', 15.4, 2.1, { variant: 7 }],
  ['trophy-case', 17.2, 4.6, {}, 'school-trophies'],
  ['notice', 2.4, 1.4, { lines: 'THURSDAY|MATS 4PM|-COACH', variant: 1 }],
  ['bleachers', 3.5, 7.6, { w: 5, solid: { x: -40, y: -32, w: 80, h: 31 } }],
  ['bleachers', 16.5, 7.6, { w: 5, solid: { x: -40, y: -32, w: 80, h: 31 } }],
  ['floor-mat', 9.5, 11.4, { w: 6, h: 4, variant: 1 }],
  ['chair-cart', 1.7, 11.6],
], { music: 'workout', light: 0.95, abs: true });

// Birdie's house, where she only ever sits in one of the two chairs: her
// recliner and the empty one with the afghan folded on it, the lamp in the
// window she leaves on, her half of the belt in a shadow box she never
// mentions, Lou's bass on a plaque, boxes of posters, an unmade bed.
interior('birdie-house', "Birdie's House", 12, 8, 'wall-pink', 'wood', 4, [
  ['half-belt', 4.6, 2.2],
  ['window', 6.8, 2.6, { variant: 2 }],
  ['photo-wall', 9.6, 2.6, { variant: 1 }],
  ['mounted-bass', 11.9, 1.4],
  ['tv-vcr', 2.2, 4.4],
  ['armchair', 3.5, 5.8, { variant: 0, solid: NOSOLID }],
  ['side-table', 4.65, 5.9],
  ['armchair', 5.8, 5.8, { variant: 1 }],
  ['lamp-floor', 7.4, 4.8],
  ['rug', 5, 7.6, { w: 5, h: 2, variant: 0 }],
  ['bed', 11.5, 6.6, { variant: 1 }],
  ['box-stack', 8.8, 7.7, { label: 'POSTERS' }],
  ['plant', 1.4, 7.6, { variant: 1 }],
], { music: 'home', light: 0.86, abs: true });

// The Abernathys': Pip's shoebox wrestling ring on the floor mid-match, his
// cardboard championship belt taped to the wall, the TV he watches every
// show on, crayon drawings, the kitchen table, the couch.
interior('house-abernathy', "The Abernathys' House", 10, 7, 'wall', 'wood', 4, [
  ['cardboard-belt', 5, 1.8],
  ['notice', 2.6, 1.6, { lines: 'MY HERO|IS MY|FRIEND', variant: 2 }],
  ['photo', 9.8, 1.8, { variant: 1 }],
  ['window', 7.5, 2.6, { variant: 0 }],
  ['fridge', 1.6, 4.0],
  ['tv-vcr', 3.2, 4.4],
  ['couch', 7.5, 4.4, { variant: 2 }],
  ['rug', 5.5, 7, { w: 4, h: 2, variant: 2 }],
  ['toy-ring', 4.6, 6.6],
  ['table', 9.4, 6.6, { variant: 1 }],
  ['plant', 10.4, 6.6, { variant: 2 }],
], { music: 'home', light: 0.92, abs: true });

// The Biscuit, Sweet Lou's Airstream by Chokeslam Creek: round windows that
// glow blue on Saturday nights, forty years of hand-labelled tapes on the
// wall, two VCRs dubbing under the TV with a padded mailer waiting, the
// lavender dinette, 45s on the record player, a narrow bed, his rod and bucket.
interior('airstream', "Sweet Lou's Airstream", 9, 5, 'wall-wood', 'wood', 3, [
  ['round-window', 1.9, 1.3],
  ['photo', 3.9, 1.2, { variant: 3 }, 'lou-photo'],
  ['tape-wall', 6.6, 1.65, { w: 3, rows: 2 }],
  ['round-window', 9.2, 1.3],
  ['dinette', 3, 3.55],
  ['booth-table', 3, 4.6, { w: 2, solid: { x: -14, y: -9, w: 28, h: 8 } }],
  ['dub-station', 6.3, 3.6, {}, 'lou-tv'],
  ['record-player', 5, 4.85],
  ['bed', 8.6, 4.2, { variant: 1 }, 'lou-bed'],
  ['fishing-gear', 9.6, 4.8],
], { music: 'home', light: 0.82, abs: true, wallRows: 2 });

interior('gasstation', 'Gas · Bait · Snacks', 10, 7, 'wall', 'tile', 4, [
  ['drink-cooler', 2.5, 3.9, { w: 3, solid: { x: -24, y: -6, w: 48, h: 5 } }],
  ['notice', 6.3, 1.4, { lines: 'BAIT|NIGHTCRAWLERS|$2 A DOZ' }],
  ['notice', 8.8, 1.3, { lines: 'LOTTO|TONIGHT', variant: 1 }],
  ['counter', 7.5, 4.95, { w: 4, style: 'wood' }, 'gas-counter'],
  ['cash-register', 8.6, 4.15],
  ['vending', 10.4, 4.6],
  ['shelf-goods', 3, 6.4, { w: 3 }],
  ['coffee-station', 9.4, 6.5],
], { music: 'diner', light: 0.9, abs: true });

// Gorgeous by Gideon: two stations with gold mirrors ringed in bulbs, the
// chairs, a pink bonnet dryer, a glass counter of product, his name in pink
// neon, and at the back the red velvet chair that was Dottie's, a plum scarf
// folded on the seat.
interior('salon', 'Gorgeous (Salon)', 10, 7, 'wall-pink', 'checker', 4, [
  ['neon', 5.5, 1.3, { sign: 'GORGEOUS', color: '#ff5d8f' }],
  ['velvet-chair', 1.6, 4.7],
  ['salon-station', 3.6, 4.4, { variant: 0 }], ['salon-station', 7.4, 4.4, { variant: 1 }],
  ['hood-dryer', 9.6, 4.7],
  ['armchair', 3.6, 6.6, { variant: 3 }, 'salon-chair-1'], ['armchair', 7.4, 6.6, { variant: 3 }, 'salon-chair-2'],
  ['counter', 9.6, 6.6, { w: 2, style: 'glass' }],
  ['plant', 1.4, 6.6, { variant: 2 }],
], { music: 'creator', light: 0.92, abs: true });

// ---------------------------------------------------------------- The city prologue
// Floor 31 at 11:48 PM: a wall of glass onto the city with the MaxxMedia
// billboard glowing on a tower, the numbers on the big screen only going up,
// cubicles lit by nine-second clips on a loop (yours has the Polaroid pinned
// to it; one is abandoned with a box packed), energy-drink pyramids,
// beanbags nobody sits on, and Royce's door at the end.
interior('maxx-office', 'MaxxMedia, Floor 31', 20, 10, 'wall-panel', 'carpet', 9, [
  ['stats-screen', 2.6, 2.3],
  ['skyline-window', 10.5, 2.95, { w: 12 }],
  ['door-wall', 18, 3, { text: 'R. PENN', variant: 2 }, 'royce-door'],
  ['notice', 20.3, 1.4, { lines: 'ENGAGEMENT|IS|EVERYTHING' }],
  ['filing-cabinet', 1.5, 4.4], ['filing-cabinet', 2.4, 4.4],
  ['cubicle', 7, 6.95, { mine: true, solid: { x: -20, y: -20, w: 40, h: 8 } }, 'player-desk'],
  ['cubicle', 11, 6.95, { solid: { x: -20, y: -20, w: 40, h: 8 } }, 'arlo-desk'],
  ['cubicle', 15, 6.95, { empty: true, solid: { x: -20, y: -20, w: 40, h: 8 } }],
  ['cubicle', 4, 9.95, { solid: { x: -20, y: -20, w: 40, h: 8 } }],
  ['cubicle', 16, 9.95, { empty: true, solid: { x: -20, y: -20, w: 40, h: 8 } }],
  ['vending', 20.4, 5],
  ['water-cooler', 20.4, 7.7],
  ['beanbag', 12.4, 9.5], ['beanbag', 13.6, 9.7, { variant: 1 }],
  ['plant', 1.4, 9.4, { variant: 1 }],
], { music: 'city', light: 0.72, abs: true });

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
