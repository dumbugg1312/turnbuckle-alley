/**
 * Every item in the game: gifts, food, crafting materials, collectibles.
 * Icons are drawn procedurally from `icon` (see src/gfx/icons.ts).
 */
export type ItemCat = 'food' | 'material' | 'flea' | 'nature' | 'wrestling' | 'gift' | 'tape' | 'card' | 'key' | 'merch';

export interface ItemDef {
  id: string;
  name: string;
  desc: string;
  cat: ItemCat;
  price: number; // buy price; sells for half
  /** How people say it in passing, without an article ("Polaroid", "slice of pie"). Defaults to the name in lower case. */
  said?: string;
  /** Energy restored when eaten. */
  energy?: number;
  /** Match buff when eaten on a show day. */
  buff?: 'gas' | 'energy' | 'crowd' | 'draw';
  icon: { shape: 'round' | 'cup' | 'box' | 'card' | 'tape' | 'bottle' | 'flower' | 'gem' | 'belt' | 'paper' | 'bag' | 'stick' | 'heart' | 'star' | 'key' | 'shirt' | 'plate' | 'can'; color: string; accent?: string };
}

const L: ItemDef[] = [
  // ---- Food
  { id: 'coffee', name: 'Diner Coffee', desc: "June's coffee. Bottomless, bitter, beloved.", cat: 'food', price: 3, energy: 15, icon: { shape: 'cup', color: '#f6eadc', accent: '#5b3a2a' } },
  { id: 'pie', name: 'Slice of Pie', desc: "Agnes's county-champion recipe, baked by June.", cat: 'food', price: 6, energy: 30, icon: { shape: 'plate', color: '#e6a24a', accent: '#d8434b' } },
  { id: 'hot-tag-special', name: 'The Hot Tag Special', desc: 'Two eggs, hash browns, a pancake the size of a turnbuckle pad.', cat: 'food', price: 12, energy: 60, buff: 'gas', icon: { shape: 'plate', color: '#f6d38a', accent: '#d8434b' } },
  { id: 'chili-dog', name: 'Chili Dog', desc: 'The concession stand classic. A paper boat of joy.', cat: 'food', price: 5, energy: 25, icon: { shape: 'plate', color: '#c8643a', accent: '#f6d38a' } },
  { id: 'tamales', name: 'Tamales', desc: "Rosa's abuela's recipe. Wrapped like presents.", cat: 'food', price: 8, energy: 40, buff: 'gas', icon: { shape: 'plate', color: '#e8c87a', accent: '#5c9a6e' } },
  { id: 'horchata', name: 'Horchata', desc: 'Cinnamon, rice, cold. Rosa swears it fixes everything.', cat: 'food', price: 4, energy: 15, icon: { shape: 'cup', color: '#fbf0d9', accent: '#c88a4a' } },
  { id: 'concha', name: 'Concha', desc: 'Sweet bread with a seashell top.', cat: 'food', price: 3, energy: 15, icon: { shape: 'round', color: '#f2b2c8', accent: '#e6a24a' } },
  { id: 'tiny-cake', name: 'Tiny Cake', desc: 'A cake the size of a thimble, frosted with tweezers by a seven-foot woman.', cat: 'food', price: 4, energy: 12, buff: 'crowd', icon: { shape: 'round', color: '#ff9ec0', accent: '#fff4dc' } },
  { id: 'sheet-cake', name: 'Celebration Sheet Cake', desc: "Tiny's biggest cake. Still small.", cat: 'food', price: 25, energy: 50, icon: { shape: 'box', color: '#fff4dc', accent: '#ff5d8f' } },
  { id: 'gas-hotdog', name: 'Gas Station Hot Dog', desc: '+1 Energy, -1 Dignity. It has been rolling since Tuesday.', cat: 'food', price: 2, energy: 10, icon: { shape: 'stick', color: '#c8643a', accent: '#f6d38a' } },
  { id: 'protein-shake', name: 'Protein Shake', desc: 'Chalky. Heroic.', cat: 'food', price: 6, energy: 30, buff: 'gas', icon: { shape: 'bottle', color: '#b8a0d8', accent: '#fbf0d9' } },
  { id: 'lemonade', name: 'Fair Lemonade', desc: 'Shaken by hand, sweet enough to make your teeth ring the bell.', cat: 'food', price: 3, energy: 12, icon: { shape: 'cup', color: '#f6e27a', accent: '#d8434b' } },
  { id: 'corn-dog', name: 'Corn Dog', desc: 'Fairgrounds royalty.', cat: 'food', price: 4, energy: 20, icon: { shape: 'stick', color: '#e6a24a', accent: '#c8643a' } },
  { id: 'funnel-cake', name: 'Funnel Cake', desc: 'Powdered sugar snowstorm.', cat: 'food', price: 5, energy: 25, buff: 'crowd', icon: { shape: 'plate', color: '#f6d38a', accent: '#fff' } },
  { id: 'honey', name: 'Jar of Honey', desc: "Wanda's favorite. She says please.", cat: 'food', price: 8, energy: 20, icon: { shape: 'bottle', color: '#f4b63f', accent: '#c27a1e' } },
  { id: 'grandmas-chili', name: "Grandma's Chili", desc: "Dottie's recipe from the back of an old show poster. +Gas for your next match.", cat: 'food', price: 0, energy: 70, buff: 'gas', icon: { shape: 'plate', color: '#a8342a', accent: '#f6d38a' } },
  { id: 'bait', name: 'Bait', desc: 'From the gas station. Lou says the creek fish like it "fresh-ish."', cat: 'food', price: 2, icon: { shape: 'can', color: '#6a8a5a', accent: '#c8643a' } },
  // ---- Crafting materials (mostly from the Dungeon)
  { id: 'tape', name: 'Athletic Tape', desc: 'Every wrestler goes through miles of it.', cat: 'material', price: 4, icon: { shape: 'round', color: '#f2f2f8', accent: '#b8b8c8' } },
  { id: 'chalk', name: 'Chalk', desc: 'For grip. For drama.', cat: 'material', price: 3, icon: { shape: 'box', color: '#f6f6f6', accent: '#c8c8d8' } },
  { id: 'canvas', name: 'Canvas Scrap', desc: 'Old ring canvas. Smells like history.', cat: 'material', price: 6, icon: { shape: 'paper', color: '#d9dbe8', accent: '#9a9ab0' } },
  { id: 'iron', name: 'Old Iron', desc: 'Dungeon weights, rusted soft. Hank can work with this.', cat: 'material', price: 8, icon: { shape: 'gem', color: '#8a8aa0', accent: '#5a5a70' } },
  { id: 'leather', name: 'Leather Strap', desc: 'For boots, belts and big ideas.', cat: 'material', price: 10, icon: { shape: 'stick', color: '#8a4a2a', accent: '#c8843a' } },
  { id: 'sequins', name: 'Sequins', desc: 'A handful of glitter that never fully leaves.', cat: 'material', price: 12, icon: { shape: 'gem', color: '#ff7aa8', accent: '#ffe0f0' } },
  { id: 'rhinestone', name: 'Rhinestone', desc: 'Deep-Dungeon sparkle.', cat: 'material', price: 25, icon: { shape: 'gem', color: '#9ae0ff', accent: '#ffffff' } },
  { id: 'gold-leaf', name: 'Gold Leaf', desc: 'For title belts. Handle like a secret.', cat: 'material', price: 40, icon: { shape: 'paper', color: '#f4b63f', accent: '#fff0a0' } },
  { id: 'rope', name: 'Ring Rope', desc: 'A length of real ring rope. Bouncy.', cat: 'material', price: 15, icon: { shape: 'stick', color: '#d8434b', accent: '#f2f2f8' } },
  { id: 'plank', name: 'Lumber', desc: 'Hank-approved boards for building.', cat: 'material', price: 5, icon: { shape: 'stick', color: '#c8944a', accent: '#8a5a2a' } },
  { id: 'scrap', name: 'Scrap Metal', desc: 'From clearing the yard. Useful, eventually.', cat: 'material', price: 2, icon: { shape: 'gem', color: '#9a9ab0', accent: '#6a6a80' } },
  { id: 'fiber', name: 'Weeds & Fiber', desc: "You pulled these out of Grandma's ring. You deserve a medal.", cat: 'material', price: 1, icon: { shape: 'flower', color: '#6a9a4a', accent: '#3f6a3a' } },
  { id: 'blank-tee', name: 'Blank T-Shirt', desc: 'Ready for the merch press.', cat: 'material', price: 5, icon: { shape: 'shirt', color: '#f6f6f6', accent: '#c8c8d8' } },
  // ---- Flea market and town finds
  { id: 'foam-finger', name: 'Foam Finger', desc: "#1, says the finger. It's right.", cat: 'wrestling', price: 8, icon: { shape: 'stick', color: '#f4b63f', accent: '#d8434b' } },
  { id: 'old-program', name: 'Old Show Program', desc: 'A 1979 ACW program. Birdie is on the cover, flexing.', cat: 'wrestling', price: 10, icon: { shape: 'paper', color: '#fbf0d9', accent: '#d8434b' } },
  { id: 'signed-photo', name: 'Signed Photo', desc: 'An 8x10 glossy, signed in silver marker.', cat: 'wrestling', price: 15, icon: { shape: 'paper', color: '#f6eadc', accent: '#9a9ab0' } },
  { id: 'toy-wrestler', name: 'Vintage Action Figure', desc: 'Bendable. Slightly chewed.', cat: 'flea', price: 12, icon: { shape: 'star', color: '#3f74d8', accent: '#f4b63f' } },
  { id: 'vinyl', name: 'Vinyl Record', desc: 'Somebody\'s entrance music, pressed in 1984.', cat: 'flea', price: 10, icon: { shape: 'round', color: '#2a2a3a', accent: '#d8434b' } },
  { id: 'paperback', name: 'Paperback Mystery', desc: 'Missing the last page. Of course.', cat: 'flea', price: 4, icon: { shape: 'box', color: '#5c9a6e', accent: '#fbf0d9' } },
  { id: 'teacup', name: 'Floral Teacup', desc: 'Chipped, beautiful.', cat: 'flea', price: 6, icon: { shape: 'cup', color: '#fbf0d9', accent: '#ff9ec0' } },
  { id: 'yarn', name: 'Ball of Yarn', desc: 'For mask stitching, or a cat.', cat: 'flea', price: 4, icon: { shape: 'round', color: '#ff7aa8', accent: '#d8434b' } },
  { id: 'comic', name: 'Comic Book', desc: '"Wrestle-Bot vs. The Moon." Issue #1.', cat: 'flea', price: 5, icon: { shape: 'paper', color: '#f4b63f', accent: '#3f74d8' } },
  { id: 'cassette', name: 'Mixtape', desc: 'Handwritten label: "PUMP UP JAMS 4 SAT".', cat: 'flea', price: 3, icon: { shape: 'tape', color: '#2a2a3a', accent: '#f6d38a' } },
  { id: 'polaroid', name: 'Old Polaroid', desc: 'A blurry crowd. Someone in the front row has a purse raised.', cat: 'flea', price: 5, icon: { shape: 'paper', color: '#f6f6f6', accent: '#6a8ab0' } },
  { id: 'mothman-figure', name: 'Mothman Figurine', desc: 'Glow-in-the-dark eyes. Fenwick would kill for this. (Not literally. Nobody here kills anybody.)', cat: 'flea', price: 20, icon: { shape: 'star', color: '#4a3a5a', accent: '#ff3d5a' } },
  { id: 'trading-card', name: 'Trading Card Pack', desc: 'Five cards, one stick of ancient gum.', cat: 'card', price: 10, icon: { shape: 'card', color: '#d8434b', accent: '#f4b63f' } },
  // ---- Nature
  { id: 'wildflowers', name: 'Wildflowers', desc: 'Picked by the creek.', cat: 'nature', price: 3, icon: { shape: 'flower', color: '#ff9ec0', accent: '#f6d38a' } },
  { id: 'bouquet', name: 'Bouquet', desc: 'From the bakery window. Means something.', cat: 'gift', price: 30, icon: { shape: 'flower', color: '#d8434b', accent: '#ff9ec0' } },
  { id: 'river-stone', name: 'Smooth River Stone', desc: 'Perfect for skipping. Lou says keep it.', cat: 'nature', price: 2, icon: { shape: 'round', color: '#9a9ab0', accent: '#c8c8d8' } },
  { id: 'feather', name: 'Big Moth Wing', desc: "Is that... a wing? It's dusty and soft. Fenwick needs to see this.", cat: 'nature', price: 1, icon: { shape: 'flower', color: '#b8a090', accent: '#6a5a4a' } },
  { id: 'fish', name: 'Creek Bluegill', desc: "Caught with Lou. Tiny, proud.", cat: 'nature', price: 6, energy: 15, icon: { shape: 'round', color: '#3f9a92', accent: '#f6d38a' } },
  // ---- Merch
  { id: 'merch-tee', name: 'Your Merch Tee', desc: 'Your face. Your catchphrase. Your rent.', cat: 'merch', price: 20, icon: { shape: 'shirt', color: '#d8434b', accent: '#f4b63f' } },
  { id: 'merch-sign', name: 'Fan Sign', desc: 'Hand-painted. Glitter optional (not optional).', cat: 'merch', price: 12, icon: { shape: 'paper', color: '#fbf0d9', accent: '#ff5d8f' } },
  // ---- Key items
  { id: 'grandmas-letter', name: "Grandma's Letter", desc: '"Go see Birdie. Learn everything she knows. Don\'t tell her I sent you."', cat: 'key', price: 0, icon: { shape: 'paper', color: '#fbf0d9', accent: '#5b3a40' } },
  { id: 'house-key', name: 'Old House Key', desc: "Grandma's. A little ribbon tied on it, faded blue.", cat: 'key', price: 0, icon: { shape: 'key', color: '#c8a04a', accent: '#6a8ab0' } },
  { id: 'dungeon-key', name: 'Dungeon Key', desc: 'Heavy, iron, and a little warm. Lou gave you this with a wink.', cat: 'key', price: 0, icon: { shape: 'key', color: '#7a8a7a', accent: '#7affd4' } },
  { id: 'golden-belt', name: 'The Golden Belt', desc: 'From the bottom of the Dungeon. Initials on the back plate: B.M. & D.D., 1979. It hums, faintly, like a crowd.', cat: 'key', price: 0, icon: { shape: 'belt', color: '#f4b63f', accent: '#fff0a0' } },
  { id: 'belt-half', name: 'Half a Title Belt', desc: 'Gold plate, broken clean in two. Initials scratched in the leather: D.D.', cat: 'key', price: 0, icon: { shape: 'belt', color: '#f4b63f', accent: '#8a4a2a' } },
];

export const ITEMS: Record<string, ItemDef> = Object.fromEntries(L.map((i) => [i.id, i]));

export function item(id: string): ItemDef {
  return ITEMS[id] ?? { id, name: id, desc: '', cat: 'flea', price: 1, icon: { shape: 'box', color: '#9a9ab0' } };
}
