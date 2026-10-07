/**
 * The garden's rules, with no DOM or audio, so they can be tested.
 * A plot holds one crop. Each night a watered crop grows one day; rain
 * waters everything. Ripe crops are harvested; some grow back.
 */
import type { ItemDef } from '../data/items';

export interface Crop {
  id: string;
  name: string;
  /** Seasons it can be planted in (0 Spring .. 3 Winter). */
  seasons: number[];
  /** Watered days to ripen. */
  days: number;
  /** Items per harvest. */
  yield: number;
  /** If set, the plant stays after harvest and needs this many more days. */
  regrow?: number;
  seedPrice: number;
  /** Short name for the packet: Tomato Seeds. */
  seedName: string;
  /** A line for the seed packet, in Bo's label tape. */
  packet: string;
}

export const CROPS: Record<string, Crop> = {
  tomato: { id: 'tomato', seedName: 'Tomato', name: 'Cherry Tomatoes', seasons: [0, 1], days: 4, yield: 3, regrow: 2, seedPrice: 8, packet: 'TOMATO. SPRING OR SUMMER. STAKE IT.' },
  peas: { id: 'peas', seedName: 'Snap Pea', name: 'Snap Peas', seasons: [0, 2], days: 3, yield: 3, regrow: 2, seedPrice: 6, packet: 'SNAP PEAS. COOL WEATHER. GIVE THEM SOMETHING TO CLIMB.' },
  okra: { id: 'okra', seedName: 'Okra', name: 'Okra', seasons: [1, 2], days: 5, yield: 2, regrow: 2, seedPrice: 8, packet: 'OKRA. HOT WEATHER. PICK IT SMALL.' },
  sunflower: { id: 'sunflower', seedName: 'Sunflower', name: 'Sunflower', seasons: [1], days: 5, yield: 1, seedPrice: 6, packet: 'SUNFLOWER. SUMMER. IT WILL LOOK AT YOU.' },
  pumpkin: { id: 'pumpkin', seedName: 'Pumpkin', name: 'Pumpkin', seasons: [2], days: 6, yield: 1, seedPrice: 12, packet: 'PUMPKIN. FALL. NEEDS ROOM AND PATIENCE.' },
  collards: { id: 'collards', seedName: 'Collard', name: 'Collard Greens', seasons: [2, 3], days: 4, yield: 2, regrow: 2, seedPrice: 6, packet: 'COLLARDS. FALL OR WINTER. FROST MAKES THEM SWEET.' },
};

export const seedId = (crop: string) => `seed-${crop}`;
export const cropItemId = (crop: string) => `crop-${crop}`;

export interface Plot {
  crop: string | null;
  /** Watered days grown so far. */
  grown: number;
  /** Watered today (rain counts). */
  watered: boolean;
}

export const emptyPlot = (): Plot => ({ crop: null, grown: 0, watered: false });

export function canPlant(crop: string, season: number): boolean {
  return CROPS[crop]?.seasons.includes(season) ?? false;
}

export function plant(p: Plot, crop: string, raining: boolean): void {
  p.crop = crop;
  p.grown = 0;
  p.watered = raining;
}

export function isRipe(p: Plot): boolean {
  return !!p.crop && p.grown >= (CROPS[p.crop]?.days ?? 1);
}

/** -1 empty, 0 seeds, 1 sprout, 2 young, 3 budding, 4 ripe. */
export function stageOf(p: Plot): number {
  if (!p.crop) return -1;
  const days = CROPS[p.crop]?.days ?? 1;
  if (p.grown >= days) return 4;
  if (p.grown <= 0) return 0;
  return Math.min(3, 1 + Math.floor((p.grown / days) * 3));
}

/** Overnight: a watered plant grows a day; the new day's rain waters it. */
export function growNight(p: Plot, rainingToday: boolean): void {
  if (p.crop && p.watered && !isRipe(p)) p.grown++;
  p.watered = !!p.crop && rainingToday;
}

/** Harvest a ripe plot. Returns [item id, count] or null. */
export function harvest(p: Plot): [string, number] | null {
  if (!isRipe(p) || !p.crop) return null;
  const c = CROPS[p.crop];
  const got: [string, number] = [cropItemId(c.id), c.yield];
  if (c.regrow) p.grown = Math.max(0, c.days - c.regrow);
  else Object.assign(p, emptyPlot());
  return got;
}

// ---------------------------------------------------------------- items and recipes

export const GARDEN_ITEMS: ItemDef[] = [
  ...Object.values(CROPS).map((c): ItemDef => ({
    id: seedId(c.id),
    name: `${c.seedName} Seeds`,
    desc: `A paper packet with a strip of label tape: *${c.packet}*`,
    cat: 'material',
    price: c.seedPrice,
    icon: { shape: 'paper', color: '#e6d3ac', accent: c.id === 'tomato' ? '#d8434b' : c.id === 'pumpkin' ? '#e8843a' : c.id === 'sunflower' ? '#f4b63f' : '#5c9a6e' },
  })),
  { id: 'crop-tomato', name: 'Cherry Tomatoes', desc: 'Warm from the vine. They taste like the yard smells in July.', cat: 'nature', price: 4, energy: 8, icon: { shape: 'round', color: '#e8404e', accent: '#5e8a4a' } },
  { id: 'crop-peas', name: 'Snap Peas', desc: 'They snap. That is the whole point and it is enough.', cat: 'nature', price: 3, energy: 6, icon: { shape: 'stick', color: '#9ac860', accent: '#5e8a4a' } },
  { id: 'crop-okra', name: 'Okra', desc: 'Picked small, the way Grandma would say to.', cat: 'nature', price: 5, energy: 5, icon: { shape: 'stick', color: '#6f9a5a', accent: '#a8d080' } },
  { id: 'crop-sunflower', name: 'Sunflower', desc: 'A big yellow face on a long stem. It is looking at you.', cat: 'gift', price: 10, icon: { shape: 'flower', color: '#f4c23f', accent: '#6a3a28' } },
  { id: 'crop-pumpkin', name: 'Pumpkin', desc: 'Heavy enough to be proud of. Grown at the Dupree place.', cat: 'nature', price: 14, energy: 10, icon: { shape: 'round', color: '#e8843a', accent: '#6a5a2a' } },
  { id: 'crop-collards', name: 'Collard Greens', desc: 'Big blue-green leaves, sweeter after a frost.', cat: 'nature', price: 4, energy: 6, icon: { shape: 'flower', color: '#4f7a7a', accent: '#8ab8a8' } },
  { id: 'dish-salsa', name: 'Garden Salsa', desc: 'Your tomatoes, chopped by hand. Rosa would have notes. She would also take seconds.', cat: 'food', price: 12, energy: 30, icon: { shape: 'plate', color: '#e8404e', accent: '#9ac860' } },
  { id: 'dish-gumbo', name: 'Okra Gumbo', desc: "Grandma's card says: first you make a roux, then you stand there. +Gas for your next match.", cat: 'food', price: 22, energy: 65, buff: 'gas', icon: { shape: 'plate', color: '#7a4a2a', accent: '#6f9a5a' } },
  { id: 'dish-peas', name: 'Buttered Snap Peas', desc: 'Butter, salt, a pan, a minute. That is all it takes.', cat: 'food', price: 10, energy: 28, icon: { shape: 'plate', color: '#9ac860', accent: '#f6d38a' } },
  { id: 'dish-greens', name: 'Pot Likker Greens', desc: 'Collards cooked down low and slow. Drink the broth. Nobody is watching.', cat: 'food', price: 14, energy: 45, icon: { shape: 'plate', color: '#4f7a7a', accent: '#c8a070' } },
  { id: 'dish-pumpkin-bread', name: 'Pumpkin Bread', desc: 'Dense, spiced, still warm. +Crowd for your next match.', cat: 'food', price: 20, energy: 50, buff: 'crowd', icon: { shape: 'box', color: '#c8763a', accent: '#f6d38a' } },
];

export interface Recipe {
  id: string;
  needs: [string, number][];
  /** What happens at the stove, in a sentence or two. */
  cook: string;
}

export const RECIPES: Recipe[] = [
  { id: 'dish-gumbo', needs: [['crop-okra', 1], ['crop-tomato', 1]], cook: 'You make a roux. Then you stand there. Then you keep standing there, stirring, until it goes the color of an old penny and the kitchen smells like somebody has been home all along.' },
  { id: 'dish-salsa', needs: [['crop-tomato', 2]], cook: 'You chop the tomatoes on the board with the knife marks already in it. The knife marks are older than you. They fit your knife fine.' },
  { id: 'dish-peas', needs: [['crop-peas', 2]], cook: 'Butter in the skillet, peas in the butter. It takes about as long as a song on the kitchen radio.' },
  { id: 'dish-greens', needs: [['crop-collards', 2]], cook: 'The greens go in the big pot and cook down to almost nothing. The windows fog. The house feels lived in in a way it has not for a long time.' },
  { id: 'dish-pumpkin-bread', needs: [['crop-pumpkin', 1]], cook: 'You find a loaf pan in the cupboard with a recipe taped to the bottom of it. Of course there is. The house smells like October for the rest of the day.' },
];

export function canCook(r: Recipe, has: (id: string, n: number) => boolean): boolean {
  return r.needs.every(([id, n]) => has(id, n));
}
