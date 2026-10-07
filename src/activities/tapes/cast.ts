import { defaultLook, type Extra, type Look } from '../../gfx/look';

/**
 * The people who appear on old tapes: fictional territory-era wrestlers, plus
 * townsfolk in their youth. Looks are drawn with drawCharacter on the CRT.
 */
export interface CastMember {
  name: string;
  look: Look;
}

const X = (id: string, color: string, accent?: string): Extra => ({ id, color, accent });

function mk(o: Partial<Look>): Look {
  return { ...defaultLook(), shoes: 'wrestling-boots', ...o, extras: o.extras ?? [] };
}

export const CAST: Record<string, CastMember> = {
  // ---------------- Townsfolk, young
  birdie: { name: 'Birdie Malone', look: mk({ body: 'stocky', skin: '#f6c3a0', hair: 'wave', hairColor: '#a0442a', top: 'singlet', topColor: '#b8243c', topAccent: '#f4c64f', bottom: 'tights', bottomColor: '#b8243c', bottomAccent: '#f4c64f', shoesColor: '#f2f2f2', eyes: 'sharp', extras: [X('wrist-tape', '#f2f2f8')] }) },
  dottie: { name: 'Dottie "The Duchess" Dupree', look: mk({ body: 'lean', skin: '#f2c8a4', hair: 'crown-braid', hairColor: '#3b2419', top: 'singlet', topColor: '#5b2a6e', topAccent: '#f4c64f', bottom: 'tights', bottomColor: '#5b2a6e', bottomAccent: '#f4c64f', shoesColor: '#f2f2f2', eyes: 'lashes', features: ['beauty-mark'] }) },
  'dottie-robe': { name: 'Dottie "The Duchess" Dupree', look: mk({ body: 'lean', skin: '#f2c8a4', hair: 'crown-braid', hairColor: '#3b2419', top: 'singlet', topColor: '#5b2a6e', topAccent: '#f4c64f', bottom: 'tights', bottomColor: '#5b2a6e', shoesColor: '#f2f2f2', eyes: 'lashes', extras: [X('robe', '#5b2a6e', '#f4c64f')] }) },
  'dottie-green': { name: 'Dottie "The Duchess" Dupree', look: mk({ body: 'lean', skin: '#f2c8a4', hair: 'crown-braid', hairColor: '#3b2419', top: 'singlet', topColor: '#2f8a5a', topAccent: '#f4c64f', bottom: 'tights', bottomColor: '#2f8a5a', shoesColor: '#f2f2f2', eyes: 'lashes' }) },
  lou: { name: '"Sweet Lou" Bastian', look: mk({ body: 'lean', height: 2, skin: '#6b3c26', hair: 'short', hairColor: '#1c1418', facial: 'mustache', top: 'none', bottom: 'tights', bottomColor: '#a98bd0', bottomAccent: '#fbf0d9', shoesColor: '#fbf0d9', extras: [X('robe', '#a98bd0', '#fbf0d9')] }) },
  'lou-91': { name: '"Sweet Lou" Bastian', look: mk({ body: 'lean', height: 2, skin: '#6b3c26', hair: 'short', hairColor: '#5a5a62', facial: 'mustache', top: 'none', bottom: 'tights', bottomColor: '#a98bd0', bottomAccent: '#fbf0d9', shoesColor: '#fbf0d9' }) },
  june: { name: 'Madame Midnight', look: mk({ body: 'lean', skin: '#5a3222', hair: 'bob', hairColor: '#1c1418', top: 'dress', topColor: '#241838', topAccent: '#c8c8e0', topPattern: 'sequins', bottom: 'longskirt', bottomColor: '#241838', shoes: 'sandals', shoesColor: '#c8c8e0', extras: [X('pearls', '#f2f2f8')] }) },
  danny: { name: 'Referee Danny Halloran', look: mk({ body: 'lean', skin: '#ffdbc4', hair: 'curly', hairColor: '#c8442e', top: 'referee', topColor: '#f2f2f8', bottom: 'slacks', bottomColor: '#2a2236', shoes: 'sneakers', shoesColor: '#2a2236' }) },
  mo: { name: 'Referee Mo', look: mk({ body: 'lean', skin: '#b06d48', hair: 'ponytail', hairColor: '#1c1418', top: 'referee', topColor: '#f2f2f8', bottom: 'slacks', bottomColor: '#2a2236', shoes: 'sneakers', shoesColor: '#2a2236' }) },
  ref: { name: 'the referee', look: mk({ body: 'lean', skin: '#e8a982', hair: 'buzz', hairColor: '#3b2419', top: 'referee', topColor: '#f2f2f8', bottom: 'slacks', bottomColor: '#2a2236', shoes: 'sneakers', shoesColor: '#2a2236' }) },
  celia: { name: 'La Mariposa', look: mk({ body: 'petite', skin: '#b06d48', hair: 'ponybraid', hairColor: '#1c1418', mask: 'luchador', maskColor: '#f4b63f', maskAccent: '#1e1426', maskPattern: 'wings', top: 'bodysuit', topColor: '#f4b63f', topAccent: '#1e1426', bottom: 'tights', bottomColor: '#1e1426', shoesColor: '#f4b63f', extras: [X('wings', '#f4b63f', '#1e1426')] }) },
  viuda: { name: 'La Viuda Negra', look: mk({ body: 'athletic', skin: '#d08b62', hair: 'long', hairColor: '#1c1418', mask: 'luchador', maskColor: '#1e1426', maskAccent: '#c9404c', maskPattern: 'split', top: 'bodysuit', topColor: '#1e1426', topAccent: '#c9404c', bottom: 'tights', bottomColor: '#1e1426', shoesColor: '#c9404c' }) },
  clint: { name: '"Cowboy" Clint Ransom', look: mk({ body: 'athletic', skin: '#e8a982', hair: 'mullet', hairColor: '#6a3d22', facial: 'stubble', top: 'tank', topColor: '#3fb0a0', bottom: 'jeans', bottomColor: '#3d5a8a', shoes: 'cowboy-boots', shoesColor: '#7a5236', extras: [X('cowboy-hat', '#8a5a36'), X('bandana', '#d8434b')] }) },
  odessa: { name: 'Odessa Pruitt', look: mk({ body: 'petite', skin: '#6b3c26', hair: 'bun', hairColor: '#1c1418', top: 'singlet', topColor: '#7a2840', topAccent: '#f4b63f', bottom: 'trunks', bottomColor: '#7a2840', shoesColor: '#f4b63f', extras: [X('kneepads', '#2a2236')] }) },
  mothman: { name: 'The Mothman', look: mk({ body: 'lean', height: 2, skin: '#7a6450', hair: 'bald', mask: 'moth', maskColor: '#7a6450', maskAccent: '#e2402a', top: 'bodysuit', topColor: '#7a6450', topAccent: '#b8b0a0', bottom: 'tights', bottomColor: '#5a4a3a', shoesColor: '#5a4a3a', extras: [X('moth-wings', '#7a6450', '#d8cfc0')] }) },
  gus: { name: 'Gus Gravel', look: mk({ body: 'stocky', skin: '#d08b62', hair: 'pompadour', hairColor: '#1c1418', top: 'buttondown', topColor: '#e2903a', topPattern: 'stripes', bottom: 'slacks', bottomColor: '#3a3448', shoes: 'loafers', shoesColor: '#5a3a2e', extras: [X('blazer', '#c9404c'), X('mic', '#2a2236')] }) },
  scout: { name: 'a man in a city suit', look: mk({ body: 'lean', skin: '#ffdbc4', hair: 'side-part', hairColor: '#3b2419', top: 'buttondown', topColor: '#ddd3dc', bottom: 'slacks', bottomColor: '#5a5a72', shoes: 'loafers', shoesColor: '#2a2236', extras: [X('blazer', '#5a5a72'), X('tie', '#2c4166'), X('clipboard', '#c8b090')] }) },
  venom: { name: 'Venom (Copperhead Sisters)', look: mk({ body: 'athletic', skin: '#f6c3a0', hair: 'long', hairColor: '#c8442e', top: 'singlet', topColor: '#c8743a', topAccent: '#3f6a4a', bottom: 'tights', bottomColor: '#3f6a4a', shoesColor: '#c8743a', eyes: 'sharp' }) },
  vixen: { name: 'Vixen (Copperhead Sisters)', look: mk({ body: 'athletic', skin: '#f6c3a0', hair: 'highpony', hairColor: '#c8442e', top: 'singlet', topColor: '#3f6a4a', topAccent: '#c8743a', bottom: 'tights', bottomColor: '#c8743a', shoesColor: '#3f6a4a', eyes: 'sharp' }) },
  stan: { name: 'Stan "The Hammer" Kowalski', look: mk({ body: 'heavy', skin: '#f6c3a0', hair: 'flattop', hairColor: '#6a3d22', facial: 'walrus', top: 'singlet', topColor: '#3d5a8a', bottom: 'trunks', bottomColor: '#3d5a8a', shoesColor: '#2a2236' }) },
  agnes: { name: 'Agnes Pickett', look: mk({ body: 'stocky', skin: '#ffdbc4', hair: 'bun', hairColor: '#a0622f', top: 'cardigan', topColor: '#e87aa0', bottom: 'longskirt', bottomColor: '#4c4774', shoes: 'loafers', shoesColor: '#5a3a2e', extras: [X('purse', '#7a2840')] }) },
  pip: { name: 'Pip', look: mk({ body: 'petite', height: -2, age: 'kid', skin: '#f6c3a0', hair: 'curly', hairColor: '#6a3d22', top: 'tee', topColor: '#3f74d8', topPattern: 'stripes', bottom: 'shorts', bottomColor: '#5a5a72', shoes: 'sneakers', shoesColor: '#f2f2f2', extras: [X('cape', '#e2544a'), X('cardboard-belt', '#c8b090'), X('glasses', '#2a2236')] }) },

  // ---------------- 1950s (Channel 4 Armory Wrestling)
  jack: { name: '"Gentleman" Jack Pemberton', look: mk({ body: 'lean', skin: '#ffdbc4', hair: 'side-part', hairColor: '#1c1418', facial: 'pencil', top: 'none', bottom: 'trunks', bottomColor: '#2a2236', shoesColor: '#2a2236', extras: [X('bowtie', '#c9404c')] }) },
  commodore: { name: 'The Crimson Commodore', look: mk({ body: 'heavy', skin: '#f6c3a0', hair: 'bald', mask: 'hood', maskColor: '#9c2537', top: 'singlet', topColor: '#9c2537', bottom: 'tights', bottomColor: '#9c2537', shoesColor: '#2a2236', extras: [X('cape', '#9c2537', '#f4c64f')] }) },
  ida: { name: '"Iron" Ida Kowalczyk', look: mk({ body: 'stocky', skin: '#ffdbc4', hair: 'pigtails', hairColor: '#f1d9a0', top: 'singlet', topColor: '#5a5a72', bottom: 'trunks', bottomColor: '#5a5a72', shoesColor: '#2a2236' }) },
  otis: { name: 'Big Otis Grange', look: mk({ body: 'giant', height: 5, skin: '#e8a982', hair: 'bald', facial: 'beard', hairColor: '#3b2419', top: 'singlet', topColor: '#6a7a3a', bottom: 'trunks', bottomColor: '#6a7a3a', shoesColor: '#3a3448' }) },
  vane: { name: 'Count Bartholomew Vane', look: mk({ body: 'lean', height: 3, skin: '#fff0e2', hair: 'side-part', hairColor: '#1c1418', eyes: 'sharp', top: 'none', bottom: 'tights', bottomColor: '#2a2236', shoesColor: '#2a2236', extras: [X('cape', '#2a2236', '#9c2537')] }) },
  boom: { name: '"Professor" Ignatius Boom', look: mk({ body: 'heavy', skin: '#f6c3a0', hair: 'short', hairColor: '#b8b8c4', facial: 'walrus', top: 'singlet', topColor: '#7a5236', bottom: 'trunks', bottomColor: '#7a5236', shoesColor: '#2a2236', extras: [X('round-glasses', '#2a2236')] }) },

  // ---------------- 1960s-70s
  tommy: { name: '"Thunderfoot" Tommy Akers', look: mk({ body: 'stocky', skin: '#8d5233', hair: 'afro', hairColor: '#1c1418', top: 'none', bottom: 'trunks', bottomColor: '#f4b63f', shoesColor: '#f4b63f' }) },
  zambrano: { name: 'The Amazing Zambrano', look: mk({ body: 'lean', skin: '#d08b62', hair: 'long', hairColor: '#1c1418', facial: 'handlebar', top: 'none', bottom: 'tights', bottomColor: '#6a3fa0', shoesColor: '#f4c64f', extras: [X('cape', '#6a3fa0', '#f4c64f')] }) },
  cal: { name: '"Cowtown" Cal Brody', look: mk({ body: 'heavy', skin: '#f6c3a0', hair: 'flattop', hairColor: '#a0622f', top: 'none', bottom: 'trunks', bottomColor: '#7a5236', shoesColor: '#7a5236', extras: [X('cowboy-hat', '#c8b090')] }) },
  mabel: { name: '"Moonshine" Mabel Frye', look: mk({ body: 'stocky', skin: '#ffdbc4', hair: 'curly', hairColor: '#c8442e', top: 'tank', topColor: '#f2e6c9', bottom: 'overalls', bottomColor: '#4c6ab2', shoesColor: '#5a3a2e' }) },
  thunderbolt: { name: 'Doctor Thunderbolt', look: mk({ body: 'athletic', skin: '#e8a982', hair: 'short', hairColor: '#1c1418', mask: 'half', maskColor: '#ffd84a', maskAccent: '#2a2236', maskPattern: 'lightning', top: 'singlet', topColor: '#2a2236', topAccent: '#ffd84a', bottom: 'tights', bottomColor: '#2a2236', shoesColor: '#ffd84a' }) },
  jed: { name: 'Jed Hollis (Hillbilly Hurricanes)', look: mk({ body: 'heavy', skin: '#f6c3a0', hair: 'shaggy', hairColor: '#6a3d22', facial: 'wild', top: 'tank', topColor: '#d8434b', topPattern: 'plaid', bottom: 'overalls', bottomColor: '#3d5a8a', shoes: 'boots', shoesColor: '#5a3a2e' }) },
  zeke: { name: 'Zeke Hollis (Hillbilly Hurricanes)', look: mk({ body: 'stocky', skin: '#f6c3a0', hair: 'shaggy', hairColor: '#a0622f', facial: 'beard', top: 'tank', topColor: '#518c5c', topPattern: 'plaid', bottom: 'overalls', bottomColor: '#3d5a8a', shoes: 'boots', shoesColor: '#5a3a2e' }) },
  boudreaux: { name: '"Swamp" Sullivan Boudreaux', look: mk({ body: 'heavy', skin: '#e8a982', hair: 'long', hairColor: '#3b2419', facial: 'beard', top: 'none', bottom: 'trunks', bottomColor: '#3f6a4a', shoesColor: '#3f6a4a' }) },
  orville: { name: '"Ozark" Orville Tate', look: mk({ body: 'athletic', skin: '#f6c3a0', hair: 'mullet', hairColor: '#d9a35b', facial: 'mustache', top: 'none', bottom: 'trunks', bottomColor: '#c9404c', shoesColor: '#f2f2f2' }) },
  wally: { name: '"Walleye" Wally Kowalchuk', look: mk({ body: 'heavy', skin: '#ffdbc4', hair: 'buzz', hairColor: '#f1d9a0', top: 'singlet', topColor: '#2d6a76', bottom: 'tights', bottomColor: '#2d6a76', shoesColor: '#f2f2f2', extras: [X('beanie', '#d8434b')] }) },
  nils: { name: 'Nils (Frostbite Brothers)', look: mk({ body: 'athletic', height: 2, skin: '#fff0e2', hair: 'long', hairColor: '#fff0c8', top: 'none', bottom: 'tights', bottomColor: '#9cc8f0', bottomAccent: '#f6fbff', shoesColor: '#f6fbff' }) },
  lars: { name: 'Lars (Frostbite Brothers)', look: mk({ body: 'heavy', height: 2, skin: '#fff0e2', hair: 'long', hairColor: '#f1d9a0', facial: 'beard', top: 'none', bottom: 'tights', bottomColor: '#9cc8f0', shoesColor: '#f6fbff' }) },

  // ---------------- 1980s-2000s
  rocky: { name: 'Rocky Rockwell', look: mk({ body: 'athletic', skin: '#f6c3a0', hair: 'mullet', hairColor: '#f1d9a0', top: 'none', bottom: 'tights', bottomColor: '#ff5d8f', bottomAccent: '#b8d86a', bottomPattern: 'lightning', shoesColor: '#b8d86a', extras: [X('headband', '#b8d86a')] }) },
  kingsley: { name: '"Sir" Reginald Kingsley', look: mk({ body: 'lean', skin: '#ffdbc4', hair: 'side-part', hairColor: '#d9a35b', eyes: 'sharp', top: 'singlet', topColor: '#2c4166', bottom: 'tights', bottomColor: '#2c4166', shoesColor: '#f4c64f', extras: [X('robe', '#7a2840', '#f4c64f'), X('crown', '#f4c64f')] }) },
  hotrod: { name: '"Hot Rod" Hal Hendricks', look: mk({ body: 'athletic', skin: '#e8a982', hair: 'pompadour', hairColor: '#1c1418', top: 'none', bottom: 'tights', bottomColor: '#2a2236', bottomAccent: '#e2544a', bottomPattern: 'flames', shoesColor: '#e2544a', extras: [X('sunglasses', '#2a2236')] }) },
  timber: { name: '"Big Timber" Bjorn Paulsen', look: mk({ body: 'giant', height: 4, skin: '#f6c3a0', hair: 'shaggy', hairColor: '#a0622f', facial: 'wild', top: 'flannel', topColor: '#c9404c', topPattern: 'plaid', bottom: 'jeans', bottomColor: '#3d5a8a', shoes: 'boots', shoesColor: '#5a3a2e', extras: [X('suspenders', '#2a2236')] }) },
  loretta: { name: '"Lady Lightning" Loretta Spark', look: mk({ body: 'athletic', skin: '#b06d48', hair: 'afro', hairColor: '#1c1418', top: 'sportsbra', topColor: '#ffd84a', topAccent: '#2a2236', bottom: 'tights', bottomColor: '#2a2236', bottomAccent: '#ffd84a', bottomPattern: 'lightning', shoesColor: '#ffd84a' }) },
  kai: { name: 'Kai "Tidewater Tornado" Mendoza', look: mk({ body: 'lean', skin: '#c27c55', hair: 'curtains', hairColor: '#1c1418', top: 'rashguard', topColor: '#2fa59a', bottom: 'shorts', bottomColor: '#f2f2f8', shoesColor: '#2fa59a', extras: [X('kneepads', '#2fa59a')] }) },
  melvin: { name: '"The Accountant" Melvin Sobczak', look: mk({ body: 'stocky', skin: '#ffdbc4', hair: 'side-part', hairColor: '#6a3d22', top: 'singlet', topColor: '#5a5a72', bottom: 'slacks', bottomColor: '#5a5a72', shoesColor: '#2a2236', extras: [X('glasses', '#2a2236'), X('tie', '#c9404c')] }) },
  sarge: { name: '"Sarge" Bobby Crane', look: mk({ body: 'heavy', skin: '#8d5233', hair: 'buzz', hairColor: '#1c1418', top: 'tank', topColor: '#6a7a3a', bottom: 'cargo', bottomColor: '#6a7a3a', shoes: 'boots', shoesColor: '#2a2236', extras: [X('whistle', '#c8c8e0')] }) },
  starla: { name: 'Starla Divine', look: mk({ body: 'lean', skin: '#ffdbc4', hair: 'long', hairColor: '#e6649c', top: 'crop', topColor: '#b27ae0', topPattern: 'sequins', bottom: 'tights', bottomColor: '#b27ae0', shoesColor: '#f2f2f8', extras: [X('sunglasses', '#ff5d8f')] }) },
  rocket: { name: '"Rocket" Ray Ramirez', look: mk({ body: 'lean', skin: '#d08b62', hair: 'spiky', hairColor: '#1c1418', top: 'none', bottom: 'tights', bottomColor: '#3f74d8', bottomAccent: '#f2f2f8', bottomPattern: 'stars', shoesColor: '#d8434b' }) },
  lena: { name: '"Leaping" Lena Lindqvist', look: mk({ body: 'lean', skin: '#fff0e2', hair: 'highpony', hairColor: '#fff0c8', top: 'bodysuit', topColor: '#86d2b2', bottom: 'tights', bottomColor: '#86d2b2', shoesColor: '#f2f2f8' }) },
  duke: { name: '"Duke" Delacroix', look: mk({ body: 'athletic', skin: '#6b3c26', hair: 'buzz', hairColor: '#1c1418', facial: 'goatee', top: 'none', bottom: 'tights', bottomColor: '#7a2840', shoesColor: '#f4c64f', extras: [X('title-belt', '#f4c64f')] }) },
  brick: { name: '"Brick" Barnaby', look: mk({ body: 'giant', height: 3, skin: '#e8a982', hair: 'bald', facial: 'goatee', top: 'singlet', topColor: '#c8643a', bottom: 'trunks', bottomColor: '#c8643a', shoesColor: '#2a2236' }) },
  darlene: { name: 'Darlene (Aerobics)', look: mk({ body: 'lean', skin: '#f6c3a0', hair: 'curly', hairColor: '#f1d9a0', top: 'bodysuit', topColor: '#ff5d8f', bottom: 'leggings', bottomColor: '#3fb0c8', shoes: 'sneakers', shoesColor: '#f2f2f2', extras: [X('headband', '#b8d86a')] }) },
  kid1: { name: 'a kid in a cape', look: mk({ body: 'petite', height: -2, age: 'kid', skin: '#d08b62', hair: 'short', hairColor: '#1c1418', top: 'tee', topColor: '#ffd84a', bottom: 'shorts', bottomColor: '#3d5a8a', shoes: 'sneakers', shoesColor: '#d8434b', extras: [X('cape', '#3f74d8')] }) },
  kid2: { name: 'a kid in a mask', look: mk({ body: 'petite', height: -2, age: 'kid', skin: '#ffdbc4', hair: 'shaggy', hairColor: '#a0622f', mask: 'domino', maskColor: '#2a2236', top: 'tee', topColor: '#58b368', bottom: 'shorts', bottomColor: '#5a5a72', shoes: 'sneakers', shoesColor: '#f2f2f2' }) },
  santa: { name: 'Santa (?)', look: mk({ body: 'heavy', skin: '#ffdbc4', hair: 'short', hairColor: '#f4f4f4', facial: 'wild', top: 'jacket', topColor: '#d8434b', bottom: 'slacks', bottomColor: '#d8434b', shoes: 'boots', shoesColor: '#2a2236', extras: [X('beanie', '#d8434b')] }) },
};

/** Cast lookup with a harmless fallback (unknown ids become a generic wrestler). */
export function castMember(id: string): CastMember {
  return CAST[id] ?? { name: id, look: mk({ top: 'singlet', topColor: '#5a5a72', bottom: 'trunks', bottomColor: '#5a5a72' }) };
}
