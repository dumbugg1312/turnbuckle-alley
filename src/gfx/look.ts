/**
 * The appearance contract shared by the character creator, the sprite
 * renderer and every NPC definition. Style ids are strings so the renderer can
 * grow new options without touching saves; unknown ids fall back gracefully.
 *
 * Everything below `extras` is optional and was added for the full paper-doll
 * renderer (src/gfx/characters.ts). Old saves without those fields render the
 * same as before.
 */
export type BodyType = 'petite' | 'lean' | 'athletic' | 'stocky' | 'heavy' | 'giant';
export type HeadShape = 'round' | 'square' | 'long' | 'heart' | 'wide';
export type Species = 'human' | 'bear' | 'raccoon';
export type Age = 'kid' | 'teen' | 'adult' | 'elder';

export interface Extra {
  id: string;
  color: string;
  accent?: string;
  /** Optional surface pattern for capes, robes and jackets ('sequins', 'stars', 'stripes'...). */
  pattern?: string;
}

export interface Look {
  body: BodyType;
  /** Extra height in native pixels (-2..+6). Giants use the top of the range. */
  height: number;
  skin: string; // hex
  head: HeadShape;
  hair: string; // see HAIR_STYLES
  hairColor: string;
  facial: string; // see FACIAL_STYLES
  eyes: string; // see EYE_STYLES
  eyeColor: string;
  top: string; // see TOP_STYLES
  topColor: string;
  topAccent: string;
  bottom: string; // see BOTTOM_STYLES
  bottomColor: string;
  bottomAccent: string;
  shoes: string; // see SHOE_STYLES
  shoesColor: string;
  mask?: string; // see MASK_STYLES
  maskColor?: string;
  maskAccent?: string;
  paint?: string; // see PAINT_STYLES
  paintColor?: string;
  /** Layered extras like robes, capes, glasses, cardboard belts. See EXTRA_STYLES. */
  extras?: Extra[];

  // ---- optional depth (all default sensibly) ----
  /** 'human' unless it's Wanda (bear) or Jobber (raccoon). */
  species?: Species;
  /** Kids are shorter with bigger heads; elders get laugh lines in portraits. */
  age?: Age;
  /** Streak / tips color (Gideon's silver streak, Dex's bleached tips). */
  hairAccent?: string;
  /** Pattern on the mask: see MASK_PATTERNS. */
  maskPattern?: string;
  /** Pattern on the top: see PATTERNS. */
  topPattern?: string;
  /** Pattern on the bottoms: see PATTERNS. */
  bottomPattern?: string;
  /** Second eye color for heterochromia fans. */
  eyeColor2?: string;
  /** Little face details: see FEATURES. */
  features?: string[];
}

export interface StyleOption {
  id: string;
  label: string;
  /** One cozy line for the creator. */
  hint?: string;
  /** Shown first in ring-gear mode. */
  ring?: boolean;
}

// ------------------------------------------------------------------ palettes

export const SKIN_TONES = ['#ffdbc4', '#f6c3a0', '#e8a982', '#d08b62', '#b06d48', '#8d5233', '#6b3c26', '#4a2a1c'];
/** Extended skin set for the deep creator (includes a few storybook tints). */
export const SKIN_TONES_ALL = [
  '#fff0e2', '#ffdbc4', '#f9cfb0', '#f6c3a0', '#eeb48e', '#e8a982', '#dc9a70', '#d08b62', '#c27c55',
  '#b06d48', '#9c5c42', '#8d5233', '#7a4630', '#6b3c26', '#5a3222', '#4a2a1c',
];
export const HAIR_COLORS = ['#1c1418', '#3b2419', '#6a3d22', '#a0622f', '#d9a35b', '#f1d9a0', '#b8b8c4', '#f4f4f4', '#c8442e', '#e6649c', '#4d8be0', '#58b368'];
export const HAIR_COLORS_ALL = [
  '#1c1418', '#2e2030', '#3b2419', '#5b3a40', '#6a3d22', '#8a4a2a', '#a0622f', '#c47a3a', '#e07a3a',
  '#d9a35b', '#f1d9a0', '#fff0c8', '#b8b8c4', '#dcdae6', '#f4f4f4', '#c8442e', '#9a2c48', '#e6649c',
  '#b27ae0', '#6a4ab8', '#4d8be0', '#3fb0c8', '#58b368', '#f4d03f',
];
export const EYE_COLORS = ['#3a2a20', '#5a3a28', '#2b2140', '#3f6a8a', '#4a8a5a', '#8a6a3a', '#6a5a7a', '#c0503a', '#3fa0a0', '#9a7ad0'];
/**
 * Clothing swatches, arranged warm to cool. Hand-picked to sit in the Golden
 * Hour palette (no pure black, no pure white).
 */
export const CLOTH_COLORS = [
  '#fbf0d9', '#f2e6c9', '#e6d6b8', '#c8b090', '#a07850', '#7a5236', '#5a3a2e',
  '#ffd84a', '#f4b63f', '#e2903a', '#e07a3a', '#d8654a', '#e2544a', '#d8434b', '#c9404c', '#9c2537', '#7a2840',
  '#ffb0c0', '#ff5d8f', '#e87aa0', '#c8307a', '#9a3a8a', '#b27ae0', '#7a4f86', '#6a3fa0', '#4c4774',
  '#82a6e2', '#4d8be0', '#3f74d8', '#4c6ab2', '#3d5a8a', '#2c4166', '#30407c',
  '#86d2b2', '#3fb0a0', '#3f9a92', '#2fa59a', '#2d6a76', '#1d6e6b',
  '#b8d86a', '#7fbf5a', '#58b368', '#518c5c', '#3f6a4a', '#6a7a3a',
  '#ddd3dc', '#b8b8c4', '#8a8aa0', '#5a5a72', '#3a3448', '#2a2236',
];
/** Metals and shiny accents (belts, buckles, sequins). */
export const METAL_COLORS = ['#ffe48e', '#f4b63f', '#e2b244', '#dcdae6', '#b8b8c4', '#e8a07a', '#f0c8a8'];

// ------------------------------------------------------------------ options

export const BODY_TYPES: (StyleOption & { id: BodyType })[] = [
  { id: 'petite', label: 'Petite', hint: 'Small, quick, and impossible to pin down.' },
  { id: 'lean', label: 'Lean', hint: 'All springs and elbows.' },
  { id: 'athletic', label: 'Athletic', hint: 'Built for the long match.' },
  { id: 'stocky', label: 'Stocky', hint: 'Low center of gravity. Fire hydrant energy.' },
  { id: 'heavy', label: 'Heavy', hint: 'A big hug and a bigger splash.' },
  { id: 'giant', label: 'Giant', hint: 'Mind the door frames.' },
];

export const HEAD_SHAPES: (StyleOption & { id: HeadShape })[] = [
  { id: 'round', label: 'Round' },
  { id: 'square', label: 'Square' },
  { id: 'long', label: 'Long' },
  { id: 'heart', label: 'Heart' },
  { id: 'wide', label: 'Wide' },
];

export const HAIR_STYLES: StyleOption[] = [
  { id: 'short', label: 'Short', hint: 'Classic. Towel-dry in ten seconds.' },
  { id: 'buzz', label: 'Buzz', hint: 'Low maintenance, high intimidation.' },
  { id: 'bald', label: 'Bald', hint: 'Catches the spotlight beautifully.' },
  { id: 'mullet', label: 'Mullet', hint: 'Every legend needs a mullet. Or doesn\'t. Your call.' },
  { id: 'mohawk', label: 'Mohawk', hint: 'Punk rock, ring ready.' },
  { id: 'pompadour', label: 'Pompadour', hint: 'Requires a whole can of spray. Worth it.' },
  { id: 'long', label: 'Long', hint: 'Whips around beautifully on a clothesline.' },
  { id: 'ponytail', label: 'Ponytail', hint: 'Out of the face, into the fight.' },
  { id: 'highpony', label: 'High pony', hint: 'Swings like a metronome on the turnbuckle.' },
  { id: 'bun', label: 'Bun', hint: 'Practical. Holds a pencil in a pinch.' },
  { id: 'afro', label: 'Afro', hint: 'Volume is a personality.' },
  { id: 'braids', label: 'Braids', hint: 'Two braids, zero nonsense.' },
  { id: 'curly', label: 'Curly', hint: 'Humidity is your friend now.' },
  { id: 'spiky', label: 'Spiky', hint: 'Gel-forward. Hero of a cartoon.' },
  { id: 'side-part', label: 'Side part', hint: 'Respectable. Suspiciously respectable.' },
  { id: 'bob', label: 'Bob', hint: 'Chin length, cowlick optional (not optional).' },
  { id: 'pigtails', label: 'Pigtails', hint: 'Adorable. Also dangerous.' },
  { id: 'topknot', label: 'Top knot', hint: 'Zen master of the arm drag.' },
  { id: 'spacebuns', label: 'Space buns', hint: 'Two buns. Twice the bun.' },
  { id: 'crown-braid', label: 'Crown braid', hint: 'Royalty. The Duchess approves.' },
  { id: 'locs', label: 'Locs', hint: 'Long, proud, and swingy.' },
  { id: 'fauxhawk', label: 'Faux-hawk', hint: 'Mohawk for people with day jobs.' },
  { id: 'flattop', label: 'Flat top', hint: 'You could set a coffee cup on it.' },
  { id: 'wave', label: 'Finger wave', hint: 'Old Hollywood, old territory.' },
  { id: 'shaggy', label: 'Shaggy', hint: 'Rolled out of the van and into the ring.' },
  { id: 'undercut', label: 'Undercut', hint: 'Business up top, buzz on the sides.' },
  { id: 'curtains', label: 'Curtains', hint: 'Middle part, nineties heartthrob.' },
  { id: 'ponybraid', label: 'Long braid', hint: 'One long braid that swings out the back.' },
];

export const FACIAL_STYLES: StyleOption[] = [
  { id: 'none', label: 'Clean' },
  { id: 'stubble', label: 'Stubble', hint: 'Three days on the road.' },
  { id: 'mustache', label: 'Mustache' },
  { id: 'pencil', label: 'Pencil stache', hint: 'Waxed to a point.' },
  { id: 'walrus', label: 'Walrus' },
  { id: 'handlebar', label: 'Handlebar', hint: 'Cowboy certified.' },
  { id: 'goatee', label: 'Goatee' },
  { id: 'beard', label: 'Beard' },
  { id: 'square', label: 'Square beard', hint: 'Trimmed with a level.' },
  { id: 'wild', label: 'Wild beard', hint: 'Wood shavings sold separately.' },
  { id: 'mutton', label: 'Mutton chops' },
  { id: 'soulpatch', label: 'Soul patch' },
];

export const EYE_STYLES: StyleOption[] = [
  { id: 'round', label: 'Round' },
  { id: 'dot', label: 'Dot' },
  { id: 'happy', label: 'Happy', hint: 'Always mid-laugh.' },
  { id: 'sleepy', label: 'Sleepy', hint: 'Up since the 5 a.m. mail route.' },
  { id: 'sharp', label: 'Sharp', hint: 'A villain\'s squint.' },
  { id: 'wide', label: 'Wide', hint: 'Starstruck.' },
  { id: 'lashes', label: 'Lashes' },
];

export const TOP_STYLES: StyleOption[] = [
  { id: 'tee', label: 'T-shirt' },
  { id: 'tank', label: 'Tank top', ring: true },
  { id: 'singlet', label: 'Singlet', ring: true, hint: 'The classic. Very aerodynamic.' },
  { id: 'none', label: 'Shirtless', ring: true, hint: 'Baby oil not included.' },
  { id: 'bodysuit', label: 'Bodysuit', ring: true, hint: 'Long sleeves, full drama.' },
  { id: 'rashguard', label: 'Rash guard', ring: true },
  { id: 'sportsbra', label: 'Sports top', ring: true },
  { id: 'crop', label: 'Crop top', ring: true },
  { id: 'hoodie', label: 'Hoodie' },
  { id: 'jacket', label: 'Jacket', ring: true },
  { id: 'track', label: 'Track jacket' },
  { id: 'cardigan', label: 'Cardigan' },
  { id: 'flannel', label: 'Flannel', hint: 'Plaid is a lifestyle.' },
  { id: 'sweater', label: 'Sweater' },
  { id: 'blouse', label: 'Blouse' },
  { id: 'buttondown', label: 'Button-down' },
  { id: 'polo', label: 'Polo' },
  { id: 'vest', label: 'Vest top' },
  { id: 'uniform', label: 'Uniform', hint: 'Pockets on pockets.' },
  { id: 'scrubs', label: 'Scrubs' },
  { id: 'apron', label: 'Apron top' },
  { id: 'referee', label: 'Ref stripes', ring: true },
  { id: 'dress', label: 'Dress' },
];

export const BOTTOM_STYLES: StyleOption[] = [
  { id: 'jeans', label: 'Jeans' },
  { id: 'trunks', label: 'Trunks', ring: true, hint: 'Short, classic, and sparkly if you like.' },
  { id: 'tights', label: 'Long tights', ring: true },
  { id: 'shorts', label: 'Shorts', ring: true },
  { id: 'cargo', label: 'Cargo shorts', hint: 'In every weather.' },
  { id: 'sweats', label: 'Sweatpants' },
  { id: 'slacks', label: 'Slacks' },
  { id: 'wide', label: 'Wide trousers' },
  { id: 'leggings', label: 'Leggings' },
  { id: 'skirt', label: 'Skirt' },
  { id: 'longskirt', label: 'Long skirt' },
  { id: 'overalls', label: 'Overalls', ring: true },
  { id: 'kilt', label: 'Kilt', ring: true },
  { id: 'none', label: 'None (fur)' },
];

export const SHOE_STYLES: StyleOption[] = [
  { id: 'sneakers', label: 'Sneakers' },
  { id: 'hightops', label: 'High-tops' },
  { id: 'wrestling-boots', label: 'Ring boots', ring: true, hint: 'Laced to the shin.' },
  { id: 'kickpads', label: 'Kick pads', ring: true, hint: 'For the striker in you.' },
  { id: 'boots', label: 'Boots' },
  { id: 'cowboy-boots', label: 'Cowboy boots' },
  { id: 'loafers', label: 'Loafers' },
  { id: 'clogs', label: 'Clogs' },
  { id: 'sandals', label: 'Sandals' },
  { id: 'flipflops', label: 'Flip-flops' },
  { id: 'rainboots', label: 'Rain boots' },
  { id: 'barefoot', label: 'Barefoot', ring: true },
];

export const MASK_STYLES: StyleOption[] = [
  { id: 'none', label: 'No mask' },
  { id: 'luchador', label: 'Luchador', ring: true, hint: 'A sacred tradition. Laced at the back.' },
  { id: 'half', label: 'Half mask', ring: true },
  { id: 'hood', label: 'Hood', ring: true, hint: 'Executioner chic.' },
  { id: 'domino', label: 'Domino', ring: true, hint: 'Superhero on a budget.' },
  { id: 'moth', label: 'Moth hood', hint: 'Nobody knows. Nobody.' },
];

export const MASK_PATTERNS: StyleOption[] = [
  { id: 'plain', label: 'Trim' },
  { id: 'stripe', label: 'Center stripe' },
  { id: 'flames', label: 'Flames' },
  { id: 'wings', label: 'Wings' },
  { id: 'star', label: 'Star' },
  { id: 'teardrop', label: 'Teardrops' },
  { id: 'split', label: 'Split' },
  { id: 'swirl', label: 'Swirl' },
  { id: 'fangs', label: 'Fangs' },
  { id: 'heart', label: 'Heart' },
  { id: 'lightning', label: 'Lightning' },
];

export const PAINT_STYLES: StyleOption[] = [
  { id: 'none', label: 'None' },
  { id: 'stripes', label: 'War stripes' },
  { id: 'skull', label: 'Skull' },
  { id: 'star', label: 'Star eye' },
  { id: 'tribal', label: 'Swoosh' },
  { id: 'tears', label: 'Crow tears' },
  { id: 'split', label: 'Half face' },
  { id: 'peak', label: 'Snowcap', hint: 'A mountain in winter.' },
  { id: 'sparkle', label: 'Glitter' },
  { id: 'heart', label: 'Heart cheek' },
];

export const PATTERNS: StyleOption[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'stripes', label: 'Stripes' },
  { id: 'pinstripe', label: 'Pinstripe' },
  { id: 'plaid', label: 'Plaid' },
  { id: 'checker', label: 'Checker' },
  { id: 'stars', label: 'Stars' },
  { id: 'hearts', label: 'Hearts' },
  { id: 'sequins', label: 'Sequins', hint: 'Catches every light in the building.' },
  { id: 'floral', label: 'Floral' },
  { id: 'hawaiian', label: 'Hawaiian' },
  { id: 'lightning', label: 'Lightning' },
  { id: 'flames', label: 'Flames' },
  { id: 'cow', label: 'Cow print' },
  { id: 'camo', label: 'Camo' },
  { id: 'logo', label: 'Logo' },
];

/** Slot decides draw order and which extras can stack. */
export type ExtraSlot = 'back' | 'over' | 'neck' | 'waist' | 'head' | 'face' | 'arms' | 'legs' | 'hand';
export const EXTRA_STYLES: (StyleOption & { slot: ExtraSlot })[] = [
  { id: 'robe', label: 'Ring robe', slot: 'back', ring: true, hint: 'Make an entrance. Take it off slowly.' },
  { id: 'cape', label: 'Cape', slot: 'back', ring: true },
  { id: 'duster', label: 'Duster coat', slot: 'back', ring: true },
  { id: 'wings', label: 'Fabric wings', slot: 'back', ring: true, hint: 'Opens like a butterfly when you raise your arms.' },
  { id: 'moth-wings', label: 'Moth wings', slot: 'back' },
  { id: 'jacket', label: 'Open jacket', slot: 'over', ring: true },
  { id: 'blazer', label: 'Blazer', slot: 'over' },
  { id: 'cardigan', label: 'Open cardigan', slot: 'over' },
  { id: 'vest', label: 'Vest', slot: 'over' },
  { id: 'apron', label: 'Apron', slot: 'over' },
  { id: 'sash', label: 'Sash', slot: 'over' },
  { id: 'suspenders', label: 'Suspenders', slot: 'over' },
  { id: 'scarf', label: 'Scarf', slot: 'neck' },
  { id: 'bandana', label: 'Neck bandana', slot: 'neck' },
  { id: 'tie', label: 'Necktie', slot: 'neck' },
  { id: 'bowtie', label: 'Bow tie', slot: 'neck' },
  { id: 'pearls', label: 'Pearls', slot: 'neck' },
  { id: 'medal', label: 'Medal', slot: 'neck' },
  { id: 'whistle', label: 'Whistle', slot: 'neck' },
  { id: 'lanyard', label: 'Lanyard', slot: 'neck' },
  { id: 'stethoscope', label: 'Stethoscope', slot: 'neck' },
  { id: 'camera', label: 'Camera', slot: 'neck' },
  { id: 'headphones', label: 'Neck headphones', slot: 'neck' },
  { id: 'tape-measure', label: 'Tape measure', slot: 'neck' },
  { id: 'title-belt', label: 'Title belt', slot: 'waist', ring: true, hint: 'Gold, heavy, earned.' },
  { id: 'cardboard-belt', label: 'Cardboard belt', slot: 'waist', ring: true, hint: 'Undisputed in somebody\'s heart.' },
  { id: 'tool-belt', label: 'Tool belt', slot: 'waist' },
  { id: 'keys', label: 'Key ring', slot: 'waist' },
  { id: 'hat', label: 'Hat', slot: 'head' },
  { id: 'cowboy-hat', label: 'Cowboy hat', slot: 'head' },
  { id: 'cap', label: 'Ball cap', slot: 'head' },
  { id: 'beanie', label: 'Beanie', slot: 'head' },
  { id: 'bucket-hat', label: 'Bucket hat', slot: 'head' },
  { id: 'hunting-cap', label: 'Earflap cap', slot: 'head' },
  { id: 'chef-hat', label: 'Tiny chef hat', slot: 'head' },
  { id: 'mortarboard', label: 'Mortarboard', slot: 'head' },
  { id: 'sheriff-hat', label: 'Campaign hat', slot: 'head' },
  { id: 'crown', label: 'Little crown', slot: 'head' },
  { id: 'headband', label: 'Headband', slot: 'head', ring: true },
  { id: 'headwrap', label: 'Headwrap', slot: 'head' },
  { id: 'head-bandana', label: 'Bandana', slot: 'head' },
  { id: 'headset', label: 'Headset', slot: 'head' },
  { id: 'headlamp', label: 'Headlamp', slot: 'head' },
  { id: 'flower', label: 'Hair flower', slot: 'head' },
  { id: 'pencil-ear', label: 'Pencil (ear)', slot: 'head', hint: 'For writing the card.' },
  { id: 'safety-glasses', label: 'Safety glasses (up)', slot: 'head' },
  { id: 'glasses', label: 'Glasses', slot: 'face' },
  { id: 'round-glasses', label: 'Round glasses', slot: 'face' },
  { id: 'cateye', label: 'Cat-eye glasses', slot: 'face' },
  { id: 'halfmoon', label: 'Half-moons', slot: 'face' },
  { id: 'sunglasses', label: 'Sunglasses', slot: 'face', ring: true },
  { id: 'aviators', label: 'Aviators', slot: 'face' },
  { id: 'eyepatch', label: 'Eyepatch', slot: 'face' },
  { id: 'elbow-pads', label: 'Elbow pads', slot: 'arms', ring: true },
  { id: 'wrist-tape', label: 'Wrist tape', slot: 'arms', ring: true },
  { id: 'bangles', label: 'Bangles', slot: 'arms' },
  { id: 'gloves', label: 'Gloves', slot: 'arms', ring: true },
  { id: 'kneepads', label: 'Kneepads', slot: 'legs', ring: true },
  { id: 'knee-brace', label: 'Knee brace', slot: 'legs' },
  { id: 'socks', label: 'Tall socks', slot: 'legs' },
  { id: 'mic', label: 'Microphone', slot: 'hand' },
  { id: 'book', label: 'Book', slot: 'hand' },
  { id: 'purse', label: 'Purse', slot: 'hand' },
  { id: 'cane', label: 'Cane', slot: 'hand' },
  { id: 'coffee-pot', label: 'Coffee pot', slot: 'hand' },
  { id: 'clipboard', label: 'Clipboard', slot: 'hand' },
  { id: 'mirror', label: 'Hand mirror', slot: 'hand' },
  { id: 'pretzel', label: 'Pretzel', slot: 'hand' },
  { id: 'phone', label: 'Phone', slot: 'hand' },
  { id: 'scissors', label: 'Giant scissors', slot: 'hand' },
  { id: 'ukulele', label: 'Ukulele', slot: 'hand' },
];
export const EXTRA_SLOT: Record<string, ExtraSlot> = Object.fromEntries(EXTRA_STYLES.map((e) => [e.id, e.slot]));

export const FEATURES: StyleOption[] = [
  { id: 'freckles', label: 'Freckles' },
  { id: 'blush', label: 'Rosy cheeks' },
  { id: 'beauty-mark', label: 'Beauty mark' },
  { id: 'scar-brow', label: 'Brow scar' },
  { id: 'scar-chin', label: 'Chin scar' },
  { id: 'gap-tooth', label: 'Gap tooth' },
  { id: 'cauliflower', label: 'Cauliflower ear' },
  { id: 'braces', label: 'Braces' },
  { id: 'earring', label: 'Earrings' },
  { id: 'bandage', label: 'Bandage' },
  { id: 'flour', label: 'Flour smudge' },
  { id: 'notch', label: 'Notched ear' },
];

export function defaultLook(): Look {
  return {
    body: 'athletic',
    height: 0,
    skin: SKIN_TONES[2],
    head: 'round',
    hair: 'short',
    hairColor: HAIR_COLORS[2],
    facial: 'none',
    eyes: 'round',
    eyeColor: '#3a2a20',
    top: 'tee',
    topColor: '#d9544d',
    topAccent: '#f2e6c9',
    bottom: 'jeans',
    bottomColor: '#3d5a8a',
    bottomAccent: '#2c4166',
    shoes: 'sneakers',
    shoesColor: '#f2f2f2',
    extras: [],
  };
}

/** Deep copy (looks are small plain objects). */
export function cloneLook(l: Look): Look {
  return JSON.parse(JSON.stringify(l)) as Look;
}

export function hasExtra(l: Look, id: string): boolean {
  return !!l.extras?.some((e) => e.id === id);
}
