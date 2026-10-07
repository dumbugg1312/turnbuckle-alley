/**
 * The Dungeon's eras. Every five floors the basement remembers a different
 * gym: a 1930s carnival tent, a 1950s territory gym, a 70s boxing gym, an 80s
 * aerobics studio, a 90s garage and finally the Haunted Locker Room. Below the
 * Golden Ring (floor 30) the eras repeat as "encores" with stronger palettes.
 *
 * Pure data, no DOM: the floor generator and the tests import this.
 */

export type EraId = 'carnival' | 'territory' | 'boxing' | 'aerobics' | 'garage' | 'haunted';

/** Equipment kinds you can work like rocks in a mine. */
export type NodeKind =
  // everywhere
  | 'heavy-bag' | 'tire-stack' | 'dumbbell-rack' | 'medicine-ball' | 'rope-climb' | 'sandbag' | 'kettlebell' | 'rowing-machine' | 'chalk-bucket'
  // 1930s carnival
  | 'high-striker' | 'globe-barbell' | 'club-bells'
  // 1950s territory
  | 'grapple-dummy' | 'pulley-weights' | 'ring-post'
  // 1970s boxing
  | 'speed-bag' | 'jump-rope' | 'ring-corner'
  // 1980s aerobics
  | 'step-deck' | 'boombox' | 'exercise-bike'
  // 1990s garage
  | 'sledge-tire' | 'chain-drape' | 'cinder-blocks'
  // haunted
  | 'rattling-locker' | 'towel-cart' | 'trophy-heap'
  // the Golden Ring
  | 'gilded-kettlebell';

export interface NodeDef {
  name: string;
  /** Footprint width in tiles (height is always 1). */
  w: 1 | 2;
  /** 1 small, 2 medium, 3 big. Reps to finish = weight * 2 (a good hit is 2 reps). */
  weight: 1 | 2 | 3;
  /** Total energy for the whole set at a steady pace (2–4). */
  cost: number;
  /** What the player shouts / does. */
  verb: string;
  /** Pose while working it. */
  pose: 'strike' | 'kick' | 'lift' | 'grapple' | 'climb' | 'taunt';
  /** Materials this equipment tends to drop more of. */
  affinity: string[];
}

export const NODES: Record<NodeKind, NodeDef> = {
  'heavy-bag': { name: 'Heavy Bag', w: 1, weight: 3, cost: 4, verb: 'PUNCH!', pose: 'strike', affinity: ['tape', 'leather'] },
  'tire-stack': { name: 'Tire Stack', w: 1, weight: 3, cost: 4, verb: 'FLIP!', pose: 'lift', affinity: ['iron', 'rope'] },
  'dumbbell-rack': { name: 'Dumbbell Rack', w: 2, weight: 2, cost: 3, verb: 'CURL!', pose: 'lift', affinity: ['iron'] },
  'medicine-ball': { name: 'Medicine Ball', w: 1, weight: 1, cost: 2, verb: 'SLAM!', pose: 'lift', affinity: ['leather', 'canvas'] },
  'rope-climb': { name: 'Climbing Rope', w: 1, weight: 2, cost: 3, verb: 'CLIMB!', pose: 'climb', affinity: ['rope'] },
  sandbag: { name: 'Sandbag', w: 1, weight: 1, cost: 2, verb: 'HEAVE!', pose: 'lift', affinity: ['canvas'] },
  kettlebell: { name: 'Kettlebell', w: 1, weight: 1, cost: 2, verb: 'SWING!', pose: 'lift', affinity: ['iron'] },
  'rowing-machine': { name: 'Rowing Machine', w: 2, weight: 2, cost: 3, verb: 'ROW!', pose: 'grapple', affinity: ['rope', 'canvas'] },
  'chalk-bucket': { name: 'Chalk Bucket', w: 1, weight: 1, cost: 2, verb: 'CHALK UP!', pose: 'taunt', affinity: ['chalk'] },
  'high-striker': { name: 'High Striker', w: 1, weight: 3, cost: 4, verb: 'RING IT!', pose: 'strike', affinity: ['iron', 'sequins'] },
  'globe-barbell': { name: 'Globe Barbell', w: 2, weight: 3, cost: 4, verb: 'PRESS!', pose: 'lift', affinity: ['iron'] },
  'club-bells': { name: 'Club Bells', w: 1, weight: 2, cost: 3, verb: 'TWIRL!', pose: 'taunt', affinity: ['canvas', 'tape'] },
  'grapple-dummy': { name: 'Grappling Dummy', w: 1, weight: 2, cost: 3, verb: 'SUPLEX!', pose: 'grapple', affinity: ['canvas', 'leather'] },
  'pulley-weights': { name: 'Pulley Weights', w: 1, weight: 2, cost: 3, verb: 'PULL!', pose: 'grapple', affinity: ['rope', 'iron'] },
  'ring-post': { name: 'Ring Post', w: 1, weight: 3, cost: 4, verb: 'RUN THE ROPES!', pose: 'kick', affinity: ['rope', 'canvas'] },
  'speed-bag': { name: 'Speed Bag', w: 1, weight: 1, cost: 2, verb: 'RAT-A-TAT!', pose: 'strike', affinity: ['leather'] },
  'jump-rope': { name: 'Jump Rope', w: 1, weight: 1, cost: 2, verb: 'SKIP!', pose: 'taunt', affinity: ['rope', 'leather'] },
  'ring-corner': { name: 'Ring Corner', w: 1, weight: 3, cost: 4, verb: 'TEN PUNCHES!', pose: 'strike', affinity: ['rope', 'canvas', 'tape'] },
  'step-deck': { name: 'Aerobic Step', w: 1, weight: 1, cost: 2, verb: 'STEP!', pose: 'kick', affinity: ['sequins', 'canvas'] },
  boombox: { name: 'Boombox', w: 1, weight: 1, cost: 2, verb: 'FEEL IT!', pose: 'taunt', affinity: ['sequins'] },
  'exercise-bike': { name: 'Exercise Bike', w: 1, weight: 2, cost: 3, verb: 'PEDAL!', pose: 'kick', affinity: ['iron', 'sequins'] },
  'sledge-tire': { name: 'Sledge & Tire', w: 2, weight: 3, cost: 4, verb: 'SMASH!', pose: 'strike', affinity: ['iron', 'rope'] },
  'chain-drape': { name: 'Chain Drape', w: 1, weight: 2, cost: 3, verb: 'HAUL!', pose: 'grapple', affinity: ['iron'] },
  'cinder-blocks': { name: 'Cinder Blocks', w: 1, weight: 2, cost: 3, verb: 'LIFT!', pose: 'lift', affinity: ['iron', 'chalk'] },
  'rattling-locker': { name: 'Rattling Locker', w: 1, weight: 3, cost: 4, verb: 'PRY!', pose: 'grapple', affinity: ['leather', 'rhinestone'] },
  'towel-cart': { name: 'Towel Cart', w: 1, weight: 2, cost: 3, verb: 'PUSH!', pose: 'grapple', affinity: ['canvas', 'tape'] },
  'trophy-heap': { name: 'Trophy Heap', w: 1, weight: 2, cost: 3, verb: 'POLISH!', pose: 'taunt', affinity: ['gold-leaf', 'rhinestone'] },
  'gilded-kettlebell': { name: 'Gilded Kettlebell', w: 1, weight: 2, cost: 3, verb: 'SWING!', pose: 'lift', affinity: ['gold-leaf'] },
};

export type DecorKind =
  | 'barrel' | 'hay-bale' | 'pedestal' | 'bench' | 'water-cooler' | 'stool-bucket' | 'potted-palm' | 'vhs-stack'
  | 'couch' | 'mini-fridge' | 'tv-cart' | 'towel-pile' | 'candelabra' | 'pillar' | 'crate' | 'camcorder';

export interface EraDef {
  id: EraId;
  name: string;
  year: string;
  /** Equipment weights for this era. */
  nodes: Partial<Record<NodeKind, number>>;
  /** Solid floor props. */
  decor: DecorKind[];
  /** Line shown the first time you reach this era. */
  arrive: string;
}

export const ERAS: Record<EraId, EraDef> = {
  carnival: {
    id: 'carnival',
    name: 'The Carnival Tent',
    year: '1938',
    nodes: { 'high-striker': 3, 'globe-barbell': 3, 'club-bells': 3, sandbag: 3, 'medicine-ball': 3, kettlebell: 2, 'chalk-bucket': 3, 'rope-climb': 2, 'tire-stack': 1 },
    decor: ['barrel', 'hay-bale', 'pedestal', 'crate'],
    arrive: 'Striped canvas, sawdust underfoot, and a calliope playing somewhere just out of earshot. Floor one of the old athletic show.',
  },
  territory: {
    id: 'territory',
    name: 'The Territory Gym',
    year: '1954',
    nodes: { 'grapple-dummy': 3, 'pulley-weights': 3, 'ring-post': 2, 'medicine-ball': 3, 'dumbbell-rack': 2, 'rope-climb': 2, 'chalk-bucket': 2, sandbag: 1, kettlebell: 1 },
    decor: ['bench', 'water-cooler', 'crate', 'pillar'],
    arrive: 'The sawdust gives way to polished maple. Somewhere a radio is calling a ballgame from 1954, and someone is losing to the hometown kid.',
  },
  boxing: {
    id: 'boxing',
    name: 'The Sweatbox Boxing Gym',
    year: '1974',
    nodes: { 'heavy-bag': 4, 'speed-bag': 3, 'jump-rope': 2, 'ring-corner': 2, 'medicine-ball': 2, 'dumbbell-rack': 2, 'chalk-bucket': 1, 'tire-stack': 1 },
    decor: ['stool-bucket', 'bench', 'pillar', 'crate'],
    arrive: 'Brick walls sweating through forty coats of paint. A round bell dings for nobody. The air is ninety percent liniment.',
  },
  aerobics: {
    id: 'aerobics',
    name: 'The Neon Aerobics Studio',
    year: '1984',
    nodes: { 'step-deck': 4, boombox: 2, 'exercise-bike': 3, 'rowing-machine': 2, 'dumbbell-rack': 2, kettlebell: 2, 'medicine-ball': 1 },
    decor: ['potted-palm', 'vhs-stack', 'bench', 'pillar'],
    arrive: 'Mirrors on every wall, pastel everything, and a neon sign that buzzes FEEL THE BURN. Somebody left their leg warmers. Forty years ago.',
  },
  garage: {
    id: 'garage',
    name: 'The Garage Gym',
    year: '1996',
    nodes: { 'sledge-tire': 3, 'tire-stack': 3, 'chain-drape': 2, 'cinder-blocks': 3, 'heavy-bag': 2, sandbag: 2, kettlebell: 2 },
    decor: ['couch', 'mini-fridge', 'tv-cart', 'camcorder', 'crate'],
    arrive: 'Oil-stained concrete, spray-painted cinderblock and a camcorder on a tripod with its red light blinking. Somebody here was going to be famous on tape.',
  },
  haunted: {
    id: 'haunted',
    name: 'The Haunted Locker Room',
    year: '????',
    nodes: { 'rattling-locker': 4, 'towel-cart': 2, 'trophy-heap': 2, 'heavy-bag': 1, kettlebell: 1, 'medicine-ball': 1, 'dumbbell-rack': 1 },
    decor: ['towel-pile', 'candelabra', 'bench', 'pillar'],
    arrive: 'Rows of dented lockers, a drip that keeps perfect time, and a mist that hangs right at boot height. Every locker door is ajar. Every one of them sighs.',
  },
};

export const ERA_ORDER: EraId[] = ['carnival', 'territory', 'boxing', 'aerobics', 'garage', 'haunted'];

/** The bottom of the Dungeon (for now): the Golden Ring. */
export const GOLDEN_FLOOR = 30;

/** Which era a floor belongs to, plus how many times the eras have looped. */
export function eraFor(floor: number): { era: EraDef; encore: number } {
  const f = Math.max(1, Math.floor(floor));
  if (f <= GOLDEN_FLOOR) return { era: ERAS[ERA_ORDER[Math.min(5, Math.floor((f - 1) / 5))]], encore: 0 };
  const k = f - GOLDEN_FLOOR - 1;
  return { era: ERAS[ERA_ORDER[Math.floor(k / 5) % 6]], encore: 1 + Math.floor(k / 30) };
}

/** "Floor 7 · The Territory Gym" style title. */
export function floorTitle(floor: number): string {
  if (floor === GOLDEN_FLOOR) return 'The Golden Ring';
  const { era, encore } = eraFor(floor);
  return encore ? `${era.name} (Encore${encore > 1 ? ' ' + encore : ''})` : era.name;
}

/** Floors with a freight elevator checkpoint. */
export function isElevatorFloor(floor: number): boolean {
  return floor % 5 === 0;
}
