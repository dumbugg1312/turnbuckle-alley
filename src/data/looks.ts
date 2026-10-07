import { defaultLook, type Extra, type Look } from '../gfx/look';

/**
 * Every cast member's appearance (docs/CAST.md art notes), keyed by lowercase
 * id. LOOKS is how each character appears around town; LOOKS_ALT holds ring
 * gear, private (three rooms) outfits and story variants.
 *
 * Kayfabe note: masked characters wear their masks in LOOKS. The unmasked
 * Rosa (`mariposa-unmasked`) is only for her 10-heart event.
 */

function L(p: Partial<Look>): Look {
  return { ...defaultLook(), extras: [], ...p };
}
const x = (id: string, color: string, accent?: string, pattern?: string): Extra => {
  const e: Extra = { id, color };
  if (accent) e.accent = accent;
  if (pattern) e.pattern = pattern;
  return e;
};
/** Copy a look with changes; extras replace (pass `plus` to append). */
function alt(base: Look, p: Partial<Look>, plus: Extra[] = []): Look {
  return { ...base, ...p, extras: [...(p.extras ?? base.extras ?? []), ...plus] };
}

// ---------------------------------------------------------------- the Velvet Hammers

const grandma = L({
  body: 'petite', height: -1, age: 'elder', skin: '#f6c3a0', head: 'heart',
  hair: 'crown-braid', hairColor: '#dcdae6', eyes: 'lashes', eyeColor: '#6a5a7a',
  top: 'cardigan', topColor: '#b8a0d8', topAccent: '#7a4f86',
  bottom: 'slacks', bottomColor: '#e6d6b8', bottomAccent: '#c8b090',
  shoes: 'sneakers', shoesColor: '#fbf0d9',
  features: ['earring', 'scar-brow'],
  extras: [x('glasses', '#e2b244'), x('pearls', '#fff6ea')],
});

const birdie = L({
  body: 'stocky', height: -2, age: 'elder', skin: '#f6c3a0', head: 'round',
  hair: 'wave', hairColor: '#f4f4f4', hairAccent: '#c8442e', eyes: 'happy', eyeColor: '#5a3a28',
  top: 'tee', topColor: '#fbf0d9', topAccent: '#d8434b', topPattern: 'logo',
  bottom: 'jeans', bottomColor: '#3d5a8a', bottomAccent: '#2c4166',
  shoes: 'wrestling-boots', shoesColor: '#ddd3dc',
  features: ['gap-tooth'],
  extras: [x('blazer', '#9c2537', '#f4b63f'), x('cateye', '#f4b63f'), x('pencil-ear', '#ffd84a'), x('keys', '#dcdae6')],
});

// ---------------------------------------------------------------- wrestlers

const mariposa = L({
  body: 'stocky', height: 0, skin: '#c27c55', head: 'round',
  hair: 'ponybraid', hairColor: '#1c1418', eyes: 'lashes', eyeColor: '#5a3a28',
  mask: 'luchador', maskColor: '#ffd84a', maskAccent: '#e2903a', maskPattern: 'wings',
  top: 'track', topColor: '#f4b63f', topAccent: '#2b2140',
  bottom: 'jeans', bottomColor: '#3a3448', bottomAccent: '#2a2236',
  shoes: 'flipflops', shoesColor: '#e2903a',
  extras: [x('apron', '#f2e6c9', '#c8b090')],
});

const earl = L({
  body: 'giant', height: 6, skin: '#7a4630', head: 'round',
  hair: 'bald', hairColor: '#6a6070', facial: 'beard', eyes: 'happy', eyeColor: '#3a2a20',
  top: 'buttondown', topColor: '#4f9c9a', topAccent: '#2f6a78',
  bottom: 'slacks', bottomColor: '#7c5249', bottomAccent: '#5a3a46',
  shoes: 'sneakers', shoesColor: '#4a3042',
  extras: [x('cardigan', '#6f8f4a', '#4f6a38'), x('round-glasses', '#eab64e'), x('book', '#c9424f', '#e2b244')],
});

const dex = L({
  body: 'lean', height: 1, skin: '#b06d48', head: 'long',
  hair: 'fauxhawk', hairColor: '#2e2030', hairAccent: '#f1d9a0', eyes: 'wide', eyeColor: '#5a3a28',
  top: 'uniform', topColor: '#5a7aa0', topAccent: '#b8d86a',
  bottom: 'cargo', bottomColor: '#a07850', bottomAccent: '#7a5236',
  shoes: 'hightops', shoesColor: '#e2903a',
  features: ['scar-chin'],
  extras: [x('phone', '#3a3448')],
});

const gideon = L({
  body: 'lean', height: 3, skin: '#9c5c42', head: 'long',
  hair: 'pompadour', hairColor: '#c47a3a', hairAccent: '#dcdae6', eyes: 'lashes', eyeColor: '#5a3a28',
  top: 'buttondown', topColor: '#ffb0c0', topAccent: '#f0c8a8',
  bottom: 'slacks', bottomColor: '#f2e6c9', bottomAccent: '#e6d6b8',
  shoes: 'loafers', shoesColor: '#e8a07a',
  features: ['beauty-mark'],
  extras: [x('mirror', '#e8a07a')],
});

const bo = L({
  body: 'stocky', height: 1, skin: '#e8a982', head: 'square',
  hair: 'short', hairColor: '#6a3d22', facial: 'square', eyes: 'round', eyeColor: '#3f6a8a',
  top: 'flannel', topColor: '#d8434b', topAccent: '#7a2840',
  bottom: 'jeans', bottomColor: '#3d5a8a', bottomAccent: '#2c4166',
  shoes: 'boots', shoesColor: '#7a5236',
  extras: [x('safety-glasses', '#e6f0ee', '#3a3448'), x('apron', '#a07850', '#7a5236')],
});

const buck = L({
  body: 'stocky', height: 1, skin: '#e8a982', head: 'square',
  hair: 'shaggy', hairColor: '#6a3d22', facial: 'wild', eyes: 'happy', eyeColor: '#3f6a8a',
  top: 'flannel', topColor: '#3f74d8', topAccent: '#2c4166',
  bottom: 'jeans', bottomColor: '#3d5a8a', bottomAccent: '#2c4166',
  shoes: 'boots', shoesColor: '#7a5236',
  extras: [x('pencil-ear', '#ffd84a')],
});

const hazel = L({
  body: 'athletic', height: 1, skin: '#f6c3a0', head: 'heart',
  hair: 'highpony', hairColor: '#1c1418', hairAccent: '#4d8be0', eyes: 'sharp', eyeColor: '#3a2a20',
  top: 'hoodie', topColor: '#5a5a72', topAccent: '#82a6e2',
  bottom: 'leggings', bottomColor: '#3a3448', bottomAccent: '#2a2236',
  shoes: 'sneakers', shoesColor: '#f4f2fa',
  extras: [x('knee-brace', '#2a2236'), x('bangles', '#58b368')],
});

const clint = L({
  body: 'lean', height: 4, skin: '#d08b62', head: 'long',
  hair: 'short', hairColor: '#b8b8c4', facial: 'handlebar', eyes: 'sleepy', eyeColor: '#3f6a8a',
  top: 'buttondown', topColor: '#4c6ab2', topAccent: '#f2e6c9',
  bottom: 'jeans', bottomColor: '#3d5a8a', bottomAccent: '#7a5236',
  shoes: 'cowboy-boots', shoesColor: '#7a5236',
  extras: [x('cowboy-hat', '#d9aa6a', '#7a5236'), x('bandana', '#d8434b')],
});

const mothman = L({
  body: 'stocky', height: 0, skin: '#c27c55', head: 'round',
  hair: 'bob', hairColor: '#2e2030',
  mask: 'moth', maskColor: '#8a7a6a', maskAccent: '#e8343c',
  top: 'bodysuit', topColor: '#7a6a5a', topAccent: '#5a4a3a', topPattern: 'camo',
  bottom: 'tights', bottomColor: '#6a5a4a', bottomAccent: '#5a4a3a',
  shoes: 'boots', shoesColor: '#4a3a2e',
  extras: [x('moth-wings', '#a08a6a', '#f2e6c9')],
});

const tiny = L({
  body: 'giant', height: 8, skin: '#ffdbc4', head: 'round',
  hair: 'braids', hairColor: '#e8a070', eyes: 'happy', eyeColor: '#4a8a5a',
  top: 'tee', topColor: '#fbf0d9', topAccent: '#ffb0c0',
  bottom: 'wide', bottomColor: '#e6d6b8', bottomAccent: '#c8b090',
  shoes: 'clogs', shoesColor: '#e87aa0',
  features: ['freckles', 'flour'],
  extras: [x('apron', '#ffb0c0', '#fbf0d9'), x('halfmoon', '#c8a070'), x('chef-hat', '#fbf6ec')],
});

const professor = L({
  body: 'petite', height: -2, age: 'elder', skin: '#6b3c26', head: 'round',
  hair: 'short', hairColor: '#dcdae6', eyes: 'sharp', eyeColor: '#3a2a20',
  top: 'sweater', topColor: '#7a2840', topAccent: '#5a2034',
  bottom: 'slacks', bottomColor: '#5a3a2e', bottomAccent: '#3a2a20',
  shoes: 'loafers', shoesColor: '#5a3a2e',
  features: ['cauliflower'],
  extras: [x('blazer', '#8a6a4a', '#5a4030', 'plaid'), x('glasses', '#c9404c'), x('pencil-ear', '#d8434b')],
});

const lou = L({
  body: 'lean', height: 3, age: 'elder', skin: '#4a2a1c', head: 'long',
  hair: 'short', hairColor: '#f4f4f4', facial: 'beard', eyes: 'sleepy', eyeColor: '#3a2a20',
  top: 'buttondown', topColor: '#b8a0d8', topAccent: '#fbf0d9',
  bottom: 'slacks', bottomColor: '#e6d6b8', bottomAccent: '#c8b090',
  shoes: 'loafers', shoesColor: '#7a5236',
  extras: [x('bucket-hat', '#7a8a5a', '#e2903a'), x('glasses', '#c8c0d8'), x('lanyard', '#5a5a72', '#3f6a4a'), x('cane', '#8a5a3a')],
});

// ---------------------------------------------------------------- crew

const mo = L({
  body: 'stocky', height: -1, skin: '#c27c55', head: 'round',
  hair: 'bob', hairColor: '#2e2030', eyes: 'round', eyeColor: '#3a2a20',
  top: 'uniform', topColor: '#82a6e2', topAccent: '#30407c',
  bottom: 'shorts', bottomColor: '#30407c', bottomAccent: '#30407c',
  shoes: 'sneakers', shoesColor: '#3a3448',
  extras: [x('headlamp', '#3a3448', '#e8343c'), x('lanyard', '#e2903a', '#e2903a')],
});

const gus = L({
  body: 'heavy', height: 0, age: 'elder', skin: '#e8a982', head: 'round',
  hair: 'ponytail', hairColor: '#b8b8c4', facial: 'pencil', eyes: 'round', eyeColor: '#3a2a20',
  top: 'buttondown', topColor: '#3fb0a0', topAccent: '#ff5d8f', topPattern: 'hawaiian',
  bottom: 'slacks', bottomColor: '#2a2236', bottomAccent: '#1e1426',
  shoes: 'loafers', shoesColor: '#2a2236',
  extras: [x('blazer', '#2a2236', '#fbf0d9'), x('headphones', '#3a3448', '#f4b63f'), x('mic', '#dcdae6')],
});

const june = L({
  body: 'lean', height: 4, age: 'elder', skin: '#6b3c26', head: 'long',
  hair: 'locs', hairColor: '#dcdae6', eyes: 'lashes', eyeColor: '#3a2a20',
  top: 'blouse', topColor: '#2a2236', topAccent: '#8a8aa0', topPattern: 'sequins',
  bottom: 'slacks', bottomColor: '#2a2236', bottomAccent: '#1e1426',
  shoes: 'loafers', shoesColor: '#d8434b',
  extras: [x('headwrap', '#d8434b', '#f4b63f'), x('cateye', '#dcdae6'), x('apron', '#fbf0d9', '#d8434b'), x('bangles', '#f4b63f'), x('coffee-pot', '#dcdae6', '#3a3448')],
});

const hank = L({
  body: 'stocky', height: -2, age: 'elder', skin: '#f6c3a0', head: 'square',
  hair: 'buzz', hairColor: '#dcdae6', eyes: 'sharp', eyeColor: '#4a8a5a',
  top: 'tee', topColor: '#ffd84a', topAccent: '#e2b244',
  bottom: 'overalls', bottomColor: '#3d5a8a', bottomAccent: '#2c4166',
  shoes: 'boots', shoesColor: '#7a5236',
  extras: [x('safety-glasses', '#e6f0ee', '#f4b63f'), x('pencil-ear', '#ffd84a'), x('tool-belt', '#a07850', '#7a5236')],
});

const marigold = L({
  body: 'lean', height: 3, skin: '#9c5c42', head: 'heart',
  hair: 'curly', hairColor: '#2e2030', hairAccent: '#ffe48e', eyes: 'round', eyeColor: '#5a3a28',
  top: 'tee', topColor: '#7a2840', topAccent: '#5a2034',
  bottom: 'wide', bottomColor: '#6a3fa0', bottomAccent: '#4c2a7a',
  shoes: 'sneakers', shoesColor: '#e87aa0',
  extras: [x('cardigan', '#f4b63f', '#c27a1e', 'stars'), x('round-glasses', '#8a4a2a'), x('tape-measure', '#ffd84a')],
});

const doc = L({
  body: 'lean', height: 4, age: 'elder', skin: '#f6c3a0', head: 'long',
  hair: 'side-part', hairColor: '#f4f4f4', facial: 'walrus', eyes: 'sleepy', eyeColor: '#3f6a8a',
  top: 'buttondown', topColor: '#fbf0d9', topAccent: '#e6d6b8',
  bottom: 'slacks', bottomColor: '#7a5236', bottomAccent: '#5a3a2e',
  shoes: 'loafers', shoesColor: '#5a3a2e',
  extras: [x('cardigan', '#8a5a3a', '#6a4028'), x('tie', '#2b2140', '#f4f2fa'), x('halfmoon', '#c8a070')],
});

// ---------------------------------------------------------------- marks

const pip = L({
  body: 'petite', height: 0, age: 'kid', skin: '#f8cfaa', head: 'round',
  hair: 'spiky', hairColor: '#e07a3a', eyes: 'wide', eyeColor: '#3f6a8a',
  top: 'tee', topColor: '#4a7ac8', topAccent: '#fff6ea', topPattern: 'stripes',
  bottom: 'shorts', bottomColor: '#5a6aa8', bottomAccent: '#3f4a80',
  shoes: 'sneakers', shoesColor: '#e05a4a',
  features: ['gap-tooth', 'freckles'],
  extras: [x('cape', '#86d2b2', '#3f9a92'), x('round-glasses', '#4a4a6a'), x('cardboard-belt', '#d9aa6a')],
});

const lacey = L({
  body: 'lean', height: 2, age: 'teen', skin: '#ffdbc4', head: 'long',
  hair: 'shaggy', hairColor: '#3b2419', eyes: 'sharp', eyeColor: '#3f6a8a',
  top: 'tee', topColor: '#3a3448', topAccent: '#d8434b', topPattern: 'logo',
  bottom: 'jeans', bottomColor: '#3a3448', bottomAccent: '#2a2236',
  shoes: 'hightops', shoesColor: '#3a3448',
  features: ['braces', 'blush'],
  extras: [x('vest', '#9c2537', '#3a3448', 'plaid'), x('wrist-tape', '#d8434b')],
});

const agnes = L({
  body: 'petite', height: -2, age: 'elder', skin: '#f6cfae', head: 'round',
  hair: 'curly', hairColor: '#d8c8f0', eyes: 'sharp', eyeColor: '#6a5a7a',
  top: 'dress', topColor: '#a888d0', topAccent: '#f2927e', topPattern: 'floral',
  bottom: 'longskirt', bottomColor: '#a888d0', bottomAccent: '#8a6ab0',
  shoes: 'loafers', shoesColor: '#5a4a6a',
  extras: [x('cardigan', '#c8b8e8', '#a898c8'), x('round-glasses', '#a8a0c8'), x('pearls', '#fff6ea'), x('purse', '#2a2236', '#ffd050')],
});

const bev = L({
  body: 'athletic', height: 4, skin: '#d08b62', head: 'square',
  hair: 'bun', hairColor: '#3b2419', eyes: 'sharp', eyeColor: '#3a2a20',
  top: 'uniform', topColor: '#c8b090', topAccent: '#7a5236',
  bottom: 'slacks', bottomColor: '#a08a6a', bottomAccent: '#7a6a4a',
  shoes: 'boots', shoesColor: '#3a2a20',
  extras: [x('sheriff-hat', '#b09060', '#5a3a2e'), x('aviators', '#dcdae6', '#8a8aa0'), x('medal', '#f4b63f', '#c8b090')],
});

const patty = L({
  body: 'stocky', height: 0, skin: '#f6c3a0', head: 'square',
  hair: 'buzz', hairColor: '#b8b8c4', eyes: 'sharp', eyeColor: '#3f6a8a',
  top: 'track', topColor: '#7a2840', topAccent: '#fbf0d9',
  bottom: 'sweats', bottomColor: '#7a2840', bottomAccent: '#fbf0d9',
  shoes: 'sneakers', shoesColor: '#f4f2fa',
  features: ['cauliflower'],
  extras: [x('whistle', '#dcdae6', '#dcdae6'), x('clipboard', '#c8a070')],
});

const clementine = L({
  body: 'petite', height: 0, skin: '#ffdbc4', head: 'heart',
  hair: 'bob', hairColor: '#a0622f', eyes: 'round', eyeColor: '#4a8a5a',
  top: 'blouse', topColor: '#ddd3dc', topAccent: '#b8b8c4',
  bottom: 'skirt', bottomColor: '#5a5a72', bottomAccent: '#3a3448',
  shoes: 'hightops', shoesColor: '#4c6ab2',
  features: ['freckles'],
  extras: [x('round-glasses', '#c8c0d8'), x('scarf', '#e07a3a', '#c8603a'), x('camera', '#3a3448', '#3a3448')],
});

const fenwick = L({
  body: 'petite', height: 0, age: 'elder', skin: '#f6c3a0', head: 'long',
  hair: 'shaggy', hairColor: '#f4f4f4', eyes: 'wide', eyeColor: '#6a5a7a',
  top: 'buttondown', topColor: '#a07850', topAccent: '#7a5236',
  bottom: 'slacks', bottomColor: '#8a5a3a', bottomAccent: '#6a4028',
  shoes: 'boots', shoesColor: '#5a3a2e',
  extras: [x('hunting-cap', '#c9404c', '#3a3448'), x('aviators', '#e2b244', '#8a6a3a'), x('vest', '#8a8a5a', '#6a6a3a')],
});

const oakes = L({
  body: 'lean', height: 4, age: 'elder', skin: '#6b3c26', head: 'long',
  hair: 'afro', hairColor: '#dcdae6', eyes: 'lashes', eyeColor: '#3a2a20',
  top: 'jacket', topColor: '#d8434b', topAccent: '#fbf0d9',
  bottom: 'slacks', bottomColor: '#d8434b', bottomAccent: '#9c2537',
  shoes: 'loafers', shoesColor: '#9c2537',
  features: ['earring'],
  extras: [x('sash', '#fbf0d9'), x('scissors', '#f4b63f')],
});

const nadia = L({
  body: 'lean', height: 4, skin: '#d08b62', head: 'long',
  hair: 'bun', hairColor: '#1c1418', eyes: 'round', eyeColor: '#5a3a28',
  top: 'scrubs', topColor: '#3fb0a0', topAccent: '#fbf0d9', topPattern: 'cow',
  bottom: 'slacks', bottomColor: '#3fb0a0', bottomAccent: '#2d8a80',
  shoes: 'rainboots', shoesColor: '#7a5236',
  features: ['bandage'],
  extras: [x('cardigan', '#f4d03f', '#c8a02a'), x('stethoscope', '#8a8aa0', '#3a3448'), x('pencil-ear', '#ffd84a')],
});

const sami = L({
  body: 'stocky', height: 1, skin: '#c49a6c', head: 'round',
  hair: 'curly', hairColor: '#1c1418', facial: 'beard', eyes: 'happy', eyeColor: '#5a3a28',
  top: 'scrubs', topColor: '#b8a0d8', topAccent: '#9a80c0',
  bottom: 'slacks', bottomColor: '#b8a0d8', bottomAccent: '#9a80c0',
  shoes: 'clogs', shoesColor: '#6a7a3a',
  extras: [x('lanyard', '#f4b63f', '#f4b63f')],
});

const wanda = L({
  species: 'bear', body: 'heavy', height: 2, skin: '#3a3040', head: 'round',
  hair: 'bald', hairColor: '#3a3040', eyes: 'round', eyeColor: '#2b2140',
  top: 'none', topColor: '#3a3040', topAccent: '#3a3040',
  bottom: 'none', bottomColor: '#3a3040', bottomAccent: '#3a3040',
  shoes: 'barefoot', shoesColor: '#3a3040',
  extras: [x('crown', '#f4b63f', '#e8343c')],
});

const jobber = L({
  species: 'raccoon', body: 'petite', height: -2, skin: '#8a8aa0', head: 'round',
  hair: 'bald', hairColor: '#8a8aa0',
  top: 'none', bottom: 'none', shoes: 'barefoot',
  features: ['notch'],
  extras: [x('medal', '#dcdae6', '#b8b8c4'), x('headset', '#3a3448'), x('pretzel', '#c87a3a')],
});

// ---------------------------------------------------------------- the city

const arlo = L({
  body: 'lean', height: 5, skin: '#ffdbc4', head: 'long',
  hair: 'curly', hairColor: '#c8442e', eyes: 'round', eyeColor: '#4a8a5a',
  top: 'tee', topColor: '#3a3448', topAccent: '#f4b63f', topPattern: 'logo',
  bottom: 'jeans', bottomColor: '#4c4774', bottomAccent: '#36325c',
  shoes: 'sneakers', shoesColor: '#f2e6c9',
  features: ['freckles'],
  extras: [x('cardigan', '#6a7a3a', '#4a5a2a'), x('glasses', '#2b2140'), x('headphones', '#3a3448', '#e2544a')],
});

const royce = L({
  body: 'lean', height: 3, skin: '#f6c3a0', head: 'square',
  hair: 'side-part', hairColor: '#6a3d22', hairAccent: '#b8b8c4', eyes: 'sharp', eyeColor: '#3f6a8a',
  top: 'buttondown', topColor: '#dcdae6', topAccent: '#b8b8c4',
  bottom: 'slacks', bottomColor: '#5a5a72', bottomAccent: '#3a3448',
  shoes: 'sneakers', shoesColor: '#fbf6ec',
  extras: [x('vest', '#3f74d8', '#2c4166'), x('lanyard', '#d8434b', '#d8434b'), x('phone', '#3a3448')],
});

export const LOOKS: Record<string, Look> = {
  grandma, dottie: grandma, birdie,
  mariposa, earl, dex, gideon, bo, buck, hazel, clint, mothman, tiny, professor, lou,
  mo, gus, june, hank, marigold, doc,
  pip, lacey, agnes, bev, patty, clementine, fenwick, oakes, nadia, sami, wanda, jobber,
  arlo, royce,
};

export const LOOKS_ALT: Record<string, Look> = {
  // Homecoming: the plum robe from the locker.
  'grandma-robe': alt(grandma, { top: 'singlet', topColor: '#6a2a5a', topAccent: '#e2b244', bottom: 'tights', bottomColor: '#6a2a5a', bottomAccent: '#e2b244', shoes: 'wrestling-boots', shoesColor: '#fbf0d9', extras: [x('robe', '#6a2a5a', '#e2b244', 'sequins'), x('pearls', '#fff6ea')] }),
  'birdie-ring': alt(birdie, { top: 'singlet', topColor: '#9c2537', topAccent: '#f4b63f', bottom: 'tights', bottomColor: '#9c2537', bottomAccent: '#f4b63f', extras: [x('cateye', '#f4b63f')] }),
  'mariposa-ring': alt(mariposa, { top: 'bodysuit', topColor: '#f4b63f', topAccent: '#2b2140', bottom: 'tights', bottomColor: '#2b2140', bottomAccent: '#f4b63f', shoes: 'wrestling-boots', shoesColor: '#2b2140', extras: [x('wings', '#f4b63f', '#e2903a')] }),
  'mariposa-unmasked': alt(mariposa, { mask: 'none' }),
  'earl-ring': alt(earl, { top: 'singlet', topColor: '#5a5a72', topAccent: '#f4f2fa', bottom: 'tights', bottomColor: '#5a5a72', bottomAccent: '#f4f2fa', shoes: 'wrestling-boots', shoesColor: '#6f8f4a', paint: 'peak', paintColor: '#8a8aa0', extras: [] }),
  'dex-ring': alt(dex, { top: 'none', bottom: 'tights', bottomColor: '#b8d86a', bottomAccent: '#e2903a', shoes: 'wrestling-boots', shoesColor: '#e2903a', extras: [x('kneepads', '#f2e6c9'), x('wrist-tape', '#f2e6c9')] }),
  'gideon-ring': alt(gideon, { top: 'none', bottom: 'trunks', bottomColor: '#e88a9a', bottomAccent: '#ffe48e', bottomPattern: 'sequins', shoes: 'wrestling-boots', shoesColor: '#f0c8a8', paint: 'sparkle', paintColor: '#ffe48e', extras: [x('robe', '#e88a9a', '#ffe48e', 'sequins')] }),
  'gideon-private': alt(gideon, { top: 'hoodie', topColor: '#b8b8c4', topAccent: '#8a8aa0', bottom: 'sweats', bottomColor: '#5a5a72', bottomAccent: '#5a5a72', shoes: 'sneakers', shoesColor: '#f2f2f2', extras: [] }),
  'bo-ring': alt(bo, { top: 'none', bottom: 'overalls', bottomColor: '#3d5a8a', bottomAccent: '#d8434b', shoes: 'wrestling-boots', shoesColor: '#7a5236', extras: [x('tool-belt', '#a07850', '#7a5236')] }),
  'buck-ring': alt(buck, { top: 'none', bottom: 'overalls', bottomColor: '#3d5a8a', bottomAccent: '#3f74d8', shoes: 'wrestling-boots', shoesColor: '#7a5236', extras: [] }),
  'hazel-ring': alt(hazel, { top: 'sportsbra', topColor: '#3f74d8', topAccent: '#dcdae6', bottom: 'tights', bottomColor: '#3f74d8', bottomAccent: '#dcdae6', bottomPattern: 'lightning', shoes: 'kickpads', shoesColor: '#f4f2fa', extras: [x('knee-brace', '#2a2236'), x('wrist-tape', '#dcdae6')] }),
  // The Dust Devil (Clint's secret). Never shown unmasked in public.
  'clint-ring': alt(clint, { mask: 'luchador', maskColor: '#c8603a', maskAccent: '#e6c890', maskPattern: 'swirl', facial: 'none', top: 'tank', topColor: '#2a2236', topAccent: '#c8603a', bottom: 'tights', bottomColor: '#2a2236', bottomAccent: '#c8603a', shoes: 'wrestling-boots', shoesColor: '#3a3448', extras: [x('duster', '#2a2236', '#c8603a')] }),
  'tiny-ring': alt(tiny, { top: 'singlet', topColor: '#ffb0c0', topAccent: '#fbf0d9', topPattern: 'logo', bottom: 'tights', bottomColor: '#ffb0c0', bottomAccent: '#fbf0d9', shoes: 'wrestling-boots', shoesColor: '#fbf0d9', extras: [x('kneepads', '#fbf0d9'), x('chef-hat', '#fbf6ec')] }),
  'professor-ring': alt(professor, { top: 'singlet', topColor: '#7a2840', topAccent: '#5a2034', bottom: 'tights', bottomColor: '#7a2840', bottomAccent: '#3f6a4a', shoes: 'wrestling-boots', shoesColor: '#2a2236', extras: [x('robe', '#2a2236', '#7a2840'), x('mortarboard', '#2a2236', '#ffd84a')] }),
  'mo-ref': alt(mo, { top: 'referee', topColor: '#f4f2fa', topAccent: '#2b2140', bottom: 'slacks', bottomColor: '#2b2140', bottomAccent: '#1e1426', shoes: 'sneakers', shoesColor: '#2b2140', extras: [] }),
  'mo-poncho': alt(mo, { top: 'hoodie', topColor: '#e2763a', topAccent: '#f4d03f' }),
  'lacey-singlet': alt(lacey, { top: 'singlet', topColor: '#7a2840', topAccent: '#fbf0d9', bottom: 'tights', bottomColor: '#7a2840', bottomAccent: '#fbf0d9', shoes: 'wrestling-boots', shoesColor: '#3a3448', extras: [x('wrist-tape', '#d8434b'), x('headband', '#3a3448')] }),
  'arlo-city': alt(arlo, {}, [x('lanyard', '#4d8be0', '#4d8be0')]),
  'arlo-shop': alt(arlo, { extras: [x('apron', '#5a5a72', '#fbf0d9'), x('glasses', '#2b2140'), x('headphones', '#3a3448', '#e2544a')] }),
  'pip-champ': alt(pip, { extras: [x('cape', '#86d2b2', '#3f9a92'), x('round-glasses', '#4a4a6a'), x('title-belt', '#f4b63f', '#3a3448')] }),
};

/** Nameplate colors for dialogue boxes (signature colors from CAST.md). */
export const NPC_COLORS: Record<string, string> = {
  grandma: '#7a4f86', dottie: '#7a4f86', birdie: '#c9404c',
  mariposa: '#e2903a', earl: '#5a7a4a', dex: '#5aa04a', gideon: '#d87a8a', bo: '#c9404c', buck: '#3f74d8',
  hazel: '#3f74d8', clint: '#4c6ab2', mothman: '#8a6a5a', tiny: '#e87aa0', professor: '#7a2840', lou: '#8a70b8',
  mo: '#3f74d8', gus: '#c27a1e', june: '#c9404c', hank: '#c8a02a', marigold: '#e2903a', doc: '#2fa59a',
  pip: '#e05a4a', lacey: '#3a3448', agnes: '#8a6ab0', bev: '#a07850', patty: '#7a2840', clementine: '#e07a3a',
  fenwick: '#8a5a3a', oakes: '#d8434b', nadia: '#2fa59a', sami: '#8a70b8', wanda: '#c27a1e', jobber: '#6a6a80',
  arlo: '#5a7a4a', royce: '#3f74d8', 'dust-devil': '#c8603a',
};

/** Look by id, falling back through alt variants and then a neutral default. */
export function getLook(id: string): Look {
  return LOOKS[id] ?? LOOKS_ALT[id] ?? defaultLook();
}
