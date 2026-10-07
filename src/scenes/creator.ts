/**
 * The character creator.
 *  - 'self': the prologue, getting ready in the city apartment mirror.
 *  - 'ring': week one at Marigold's sewing shop; ring gear and persona.
 * Shallow path: Roll me one + presets + Looks great. Deep path: tabs.
 */
import './creator.css';
import { audio } from '../audio';
import * as audioModule from '../audio';
import { game } from '../core/game';
import type { Scene } from '../core/scene';
import { G, type Alignment, type BackgroundId, type Dir, type Persona } from '../core/state';
import { characterSize, characterSprite, type Pose } from '../gfx/characters';
import { dth, ell, hash2, mkSpr, R, RR, shA, toCanvas, VG } from '../gfx/kit';
import {
  BODY_TYPES, BOTTOM_STYLES, CLOTH_COLORS, cloneLook, EXTRA_SLOT, EXTRA_STYLES, EYE_COLORS, EYE_STYLES, FACIAL_STYLES, FEATURES,
  HAIR_COLORS_ALL, HAIR_STYLES, HEAD_SHAPES, MASK_PATTERNS, MASK_STYLES, METAL_COLORS, PAINT_STYLES, PATTERNS, SHOE_STYLES,
  SKIN_TONES_ALL, TOP_STYLES, type Extra, type Look,
} from '../gfx/look';
import { el, uiRoot } from '../ui/dom';

// ================================================================ tables (presets, palettes, generators)

export const BACKGROUNDS: { id: BackgroundId; label: string; blurb: string; icon: string }[] = [
  { id: 'backyard', label: 'Backyard Wrestler', icon: '🛝', blurb: 'Trampolines, garden-hose ropes and a video channel with 41 subscribers. Scrappy, fearless, a little bruised.' },
  { id: 'amateur', label: 'College Amateur Champ', icon: '🥇', blurb: 'You know every hold in the book and a few that aren\'t. Mat wrestling comes easy.' },
  { id: 'theater', label: 'Theater Kid', icon: '🎭', blurb: 'You can cry on cue and project to the back row. Promos and crowd work are your stage.' },
  { id: 'gymrat', label: 'Gym Rat', icon: '🏋️', blurb: 'Five a.m. alarms, protein shakes, and a deadlift record you mention too often. Strong from day one.' },
  { id: 'superfan', label: 'Superfan', icon: '📼', blurb: 'You\'ve watched every match since you could hold a remote. You know the story before it happens.' },
];

export const ALIGNMENTS: { id: Alignment; label: string; blurb: string }[] = [
  { id: 'face', label: 'Hero (face)', blurb: 'Kids high-five you outside the bakery and Agnes saves you a cookie. You win the crowd by being good.' },
  { id: 'heel', label: 'Villain (heel)', blurb: 'The bakery charges you extra and you love it. Agnes keeps her purse ready. You win the crowd by being booed.' },
  { id: 'tweener', label: 'Somewhere between', blurb: 'Nobody\'s sure whose side you\'re on, including you. Unpredictable is a flavor too.' },
];

export const FINISHER_STYLES: { id: Persona['finisherStyle']; label: string; blurb: string }[] = [
  { id: 'power', label: 'Power', blurb: 'Lift them up, put them down. Loudly.' },
  { id: 'aerial', label: 'Aerial', blurb: 'From the top rope, with feeling.' },
  { id: 'submission', label: 'Submission', blurb: 'Tie them in a knot until they say "uncle."' },
  { id: 'strike', label: 'Strike', blurb: 'One perfect kick. Lights out.' },
  { id: 'flashy', label: 'Flashy', blurb: 'Spins, flips, and a wink for the camera.' },
];

export const ENTRANCE_WALKS = [
  { id: 'strut', label: 'Strut' },
  { id: 'sprint', label: 'Sprint to the ring' },
  { id: 'swagger', label: 'Slow swagger' },
  { id: 'stomp', label: 'Monster stomp' },
  { id: 'skip', label: 'Skip and wave' },
  { id: 'glide', label: 'Mysterious glide' },
  { id: 'highfive', label: 'High-five the front row' },
];
export const ENTRANCE_TAUNTS = [
  { id: 'point', label: 'Point to the crowd' },
  { id: 'flex', label: 'Double flex' },
  { id: 'bow', label: 'Deep bow' },
  { id: 'belt', label: 'Raise the belt' },
  { id: 'cup-ear', label: 'Cup your ear' },
  { id: 'twirl', label: 'Twirl' },
  { id: 'shush', label: 'Shush the boos' },
];
export const PYRO = [
  { id: 'none', label: 'None' },
  { id: 'sparks', label: 'Sparks' },
  { id: 'confetti', label: 'Confetti' },
  { id: 'fireworks', label: 'Fireworks' },
  { id: 'smoke', label: 'Smoke' },
];
export const LIGHT_COLORS = ['#f4b63f', '#ff5d8f', '#3fb0c8', '#58b368', '#b27ae0', '#e2544a', '#fff1c2', '#4d8be0'];
export const THEME_STYLES = ['rock', 'synth', 'funk', 'country', 'orchestral', 'hiphop', 'metal', 'lucha', 'disco', 'spooky'];
export const THEME_LABELS: Record<string, string> = {
  rock: 'Rock', synth: 'Synth', funk: 'Funk', country: 'Country', orchestral: 'Orchestral', hiphop: 'Hip-hop', metal: 'Metal', lucha: 'Lucha', disco: 'Disco', spooky: 'Spooky',
};

/** Coordinated outfit palettes: [top, accent, bottom, bottomAccent, shoes]. */
export const PALETTES: [string, string, string, string, string][] = [
  ['#d8434b', '#fbf0d9', '#3d5a8a', '#2c4166', '#fbf0d9'],
  ['#3f9a92', '#f6d38a', '#4c4774', '#36325c', '#e2544a'],
  ['#f4b63f', '#2b2140', '#2a2236', '#f4b63f', '#2b2140'],
  ['#ff5d8f', '#ffe48e', '#3a3448', '#ff5d8f', '#fbf0d9'],
  ['#4d8be0', '#fbf0d9', '#2c4166', '#4d8be0', '#dcdae6'],
  ['#58b368', '#f2e6c9', '#5a3a2e', '#3a2a20', '#7a5236'],
  ['#9a3a8a', '#ffd84a', '#2a2236', '#9a3a8a', '#ffd84a'],
  ['#e2903a', '#2b2140', '#3d5a8a', '#2c4166', '#3a3448'],
  ['#fbf0d9', '#d8434b', '#7a5236', '#5a3a2e', '#7a5236'],
  ['#5a5a72', '#82a6e2', '#3a3448', '#2a2236', '#f4f2fa'],
  ['#86d2b2', '#2d6a76', '#e6d6b8', '#c8b090', '#e87aa0'],
  ['#c9404c', '#f4b63f', '#2b2140', '#c9404c', '#f4b63f'],
  ['#b27ae0', '#fff1c2', '#4c4774', '#b27ae0', '#fbf0d9'],
  ['#7a2840', '#f2e6c9', '#3a3448', '#7a2840', '#3a3448'],
  ['#3a3448', '#ff5d8f', '#3a3448', '#ff5d8f', '#3a3448'],
  ['#2fa59a', '#f4b63f', '#1d6e6b', '#f4b63f', '#fbf0d9'],
];
export const NATURAL_HAIR = ['#1c1418', '#2e2030', '#3b2419', '#5b3a40', '#6a3d22', '#8a4a2a', '#a0622f', '#c47a3a', '#e07a3a', '#d9a35b', '#f1d9a0', '#b8b8c4', '#f4f4f4'];
export const FUN_HAIR = ['#e6649c', '#4d8be0', '#58b368', '#b27ae0', '#3fb0c8', '#c8442e', '#f4d03f'];

export interface Preset {
  id: string;
  label: string;
  blurb: string;
  self: Partial<Look>;
  ring: Partial<Look>;
  persona?: Partial<Persona>;
}
const ex = (id: string, color: string, accent?: string, pattern?: string): Extra => ({ id, color, ...(accent ? { accent } : {}), ...(pattern ? { pattern } : {}) });

export const PRESETS: Preset[] = [
  {
    id: 'hometown', label: 'Hometown Hero', blurb: 'Big heart, bigger smile. The town\'s favorite kid.',
    self: { body: 'athletic', hair: 'short', facial: 'none', eyes: 'happy', top: 'tee', topColor: '#d8434b', topAccent: '#fbf0d9', topPattern: 'logo', bottom: 'jeans', bottomColor: '#3d5a8a', bottomAccent: '#2c4166', shoes: 'sneakers', shoesColor: '#fbf0d9', extras: [ex('cap', '#3f74d8', '#fbf0d9')] },
    ring: { top: 'tank', topColor: '#d8434b', topAccent: '#fbf0d9', bottom: 'tights', bottomColor: '#3f74d8', bottomAccent: '#fbf0d9', bottomPattern: 'stars', shoes: 'wrestling-boots', shoesColor: '#fbf0d9', mask: 'none', paint: 'none', extras: [ex('kneepads', '#fbf0d9'), ex('wrist-tape', '#fbf0d9')] },
    persona: { alignment: 'face', finisherStyle: 'power' },
  },
  {
    id: 'masked', label: 'Masked Mystery', blurb: 'Nobody knows who you are. That\'s the whole point.',
    self: { body: 'lean', hair: 'shaggy', eyes: 'sharp', top: 'hoodie', topColor: '#3a3448', topAccent: '#ff5d8f', bottom: 'jeans', bottomColor: '#2a2236', bottomAccent: '#2a2236', shoes: 'hightops', shoesColor: '#3a3448', extras: [ex('sunglasses', '#3a3448')] },
    ring: { top: 'bodysuit', topColor: '#2a2236', topAccent: '#ff5d8f', bottom: 'tights', bottomColor: '#2a2236', bottomAccent: '#ff5d8f', shoes: 'wrestling-boots', shoesColor: '#2a2236', mask: 'luchador', maskColor: '#2a2236', maskAccent: '#ff5d8f', maskPattern: 'flames', paint: 'none', extras: [ex('cape', '#2a2236', '#ff5d8f')] },
    persona: { alignment: 'tweener', finisherStyle: 'aerial' },
  },
  {
    id: 'sequins', label: 'Sequined Show-Off', blurb: 'If it doesn\'t sparkle, why bother?',
    self: { body: 'lean', hair: 'pompadour', eyes: 'lashes', top: 'blouse', topColor: '#ff5d8f', topAccent: '#ffe48e', topPattern: 'sequins', bottom: 'slacks', bottomColor: '#f2e6c9', bottomAccent: '#e6d6b8', shoes: 'loafers', shoesColor: '#f4b63f', extras: [ex('sunglasses', '#f4b63f', '#2b2140')] },
    ring: { top: 'none', bottom: 'trunks', bottomColor: '#ff5d8f', bottomAccent: '#ffe48e', bottomPattern: 'sequins', shoes: 'wrestling-boots', shoesColor: '#ffe48e', mask: 'none', paint: 'sparkle', paintColor: '#ffe48e', extras: [ex('robe', '#ff5d8f', '#ffe48e', 'sequins')] },
    persona: { alignment: 'heel', finisherStyle: 'flashy' },
  },
  {
    id: 'country', label: 'Big Country', blurb: 'Raised on biscuits and barn chores. Says "ma\'am" to referees.',
    self: { body: 'heavy', height: 3, hair: 'short', facial: 'beard', top: 'flannel', topColor: '#c9404c', topAccent: '#5a2034', bottom: 'jeans', bottomColor: '#3d5a8a', bottomAccent: '#7a5236', shoes: 'cowboy-boots', shoesColor: '#7a5236', extras: [ex('cowboy-hat', '#d9aa6a', '#7a5236')] },
    ring: { top: 'none', bottom: 'overalls', bottomColor: '#3d5a8a', bottomAccent: '#c9404c', shoes: 'cowboy-boots', shoesColor: '#7a5236', mask: 'none', paint: 'none', extras: [ex('cowboy-hat', '#d9aa6a', '#7a5236'), ex('bandana', '#c9404c')] },
    persona: { alignment: 'face', finisherStyle: 'power' },
  },
  {
    id: 'tiny', label: 'Tiny Terror', blurb: 'Pocket-sized. Bites ankles. Wins anyway.',
    self: { body: 'petite', height: -2, hair: 'spacebuns', eyes: 'wide', top: 'crop', topColor: '#58b368', topAccent: '#2b2140', bottom: 'shorts', bottomColor: '#2b2140', bottomAccent: '#58b368', shoes: 'hightops', shoesColor: '#58b368', extras: [] },
    ring: { top: 'sportsbra', topColor: '#58b368', topAccent: '#2b2140', bottom: 'shorts', bottomColor: '#2b2140', bottomAccent: '#58b368', bottomPattern: 'lightning', shoes: 'kickpads', shoesColor: '#58b368', mask: 'none', paint: 'stripes', paintColor: '#2b2140', extras: [ex('wrist-tape', '#fbf0d9'), ex('kneepads', '#2b2140')] },
    persona: { alignment: 'tweener', finisherStyle: 'strike' },
  },
  {
    id: 'gentle', label: 'Gentle Giant', blurb: 'Seven feet of soft-spoken kindness. Do not upset the giant.',
    self: { body: 'giant', height: 5, hair: 'bald', facial: 'beard', eyes: 'happy', top: 'sweater', topColor: '#6f8f4a', topAccent: '#4f6a38', bottom: 'slacks', bottomColor: '#7c5249', bottomAccent: '#5a3a46', shoes: 'sneakers', shoesColor: '#4a3042', extras: [ex('round-glasses', '#eab64e')] },
    ring: { top: 'singlet', topColor: '#5a5a72', topAccent: '#f4f2fa', bottom: 'tights', bottomColor: '#5a5a72', bottomAccent: '#f4f2fa', shoes: 'wrestling-boots', shoesColor: '#6f8f4a', mask: 'none', paint: 'none', extras: [] },
    persona: { alignment: 'face', finisherStyle: 'power' },
  },
  {
    id: 'punk', label: 'Punk Rock Flyer', blurb: 'Safety pins, sneakers, and a moonsault off anything taller than a chair.',
    self: { body: 'lean', hair: 'mohawk', hairColor: '#e6649c', eyes: 'sharp', top: 'tee', topColor: '#3a3448', topAccent: '#e6649c', topPattern: 'logo', bottom: 'jeans', bottomColor: '#3a3448', bottomAccent: '#2a2236', shoes: 'hightops', shoesColor: '#d8434b', extras: [ex('jacket', '#2a2236', '#e6649c')] },
    ring: { top: 'none', bottom: 'tights', bottomColor: '#3a3448', bottomAccent: '#e6649c', bottomPattern: 'checker', shoes: 'wrestling-boots', shoesColor: '#d8434b', mask: 'none', paint: 'tears', paintColor: '#2b2140', extras: [ex('kneepads', '#3a3448'), ex('elbow-pads', '#3a3448')] },
    persona: { alignment: 'tweener', finisherStyle: 'aerial' },
  },
  {
    id: 'technician', label: 'Old-School Technician', blurb: 'Plain black trunks. Perfect form. Respects the handshake.',
    self: { body: 'athletic', hair: 'side-part', facial: 'mustache', eyes: 'round', top: 'polo', topColor: '#7a2840', topAccent: '#f2e6c9', bottom: 'slacks', bottomColor: '#5a5a72', bottomAccent: '#3a3448', shoes: 'loafers', shoesColor: '#5a3a2e', extras: [] },
    ring: { top: 'none', bottom: 'trunks', bottomColor: '#2a2236', bottomAccent: '#2a2236', shoes: 'wrestling-boots', shoesColor: '#2a2236', mask: 'none', paint: 'none', extras: [ex('kneepads', '#2a2236')] },
    persona: { alignment: 'face', finisherStyle: 'submission' },
  },
  {
    id: 'disco', label: 'Disco Daydream', blurb: 'Saturday night forever. The mirror ball follows you home.',
    self: { body: 'lean', hair: 'afro', eyes: 'lashes', top: 'buttondown', topColor: '#b27ae0', topAccent: '#ffe48e', topPattern: 'sequins', bottom: 'wide', bottomColor: '#fbf0d9', bottomAccent: '#e6d6b8', shoes: 'loafers', shoesColor: '#ffe48e', extras: [ex('aviators', '#f4b63f', '#c27a1e')] },
    ring: { top: 'bodysuit', topColor: '#b27ae0', topAccent: '#ffe48e', topPattern: 'sequins', bottom: 'tights', bottomColor: '#b27ae0', bottomAccent: '#ffe48e', shoes: 'wrestling-boots', shoesColor: '#ffe48e', mask: 'none', paint: 'star', paintColor: '#ffe48e', extras: [ex('cape', '#ffe48e', '#b27ae0', 'stars')] },
    persona: { alignment: 'face', finisherStyle: 'flashy' },
  },
  {
    id: 'strongman', label: 'Small-Town Strongman', blurb: 'Bends horseshoes for the county fair. Mustache non-negotiable.',
    self: { body: 'stocky', height: 1, hair: 'buzz', facial: 'handlebar', top: 'tank', topColor: '#fbf0d9', topAccent: '#d8434b', bottom: 'slacks', bottomColor: '#5a3a2e', bottomAccent: '#3a2a20', shoes: 'boots', shoesColor: '#3a2a20', extras: [ex('suspenders', '#d8434b')] },
    ring: { top: 'singlet', topColor: '#d8434b', topAccent: '#fbf0d9', topPattern: 'stripes', bottom: 'tights', bottomColor: '#d8434b', bottomAccent: '#fbf0d9', shoes: 'wrestling-boots', shoesColor: '#3a2a20', mask: 'none', paint: 'none', extras: [ex('wrist-tape', '#fbf0d9')] },
    persona: { alignment: 'face', finisherStyle: 'power' },
  },
  {
    id: 'creep', label: 'Creature of the Night', blurb: 'Fog machine on standby. Speaks only in riddles (and please/thank you).',
    self: { body: 'lean', height: 2, hair: 'long', hairColor: '#1c1418', eyes: 'sleepy', top: 'sweater', topColor: '#2a2236', topAccent: '#5a5a72', bottom: 'jeans', bottomColor: '#2a2236', bottomAccent: '#2a2236', shoes: 'boots', shoesColor: '#2a2236', extras: [ex('scarf', '#7a2840', '#5a2034')] },
    ring: { top: 'none', bottom: 'tights', bottomColor: '#2a2236', bottomAccent: '#7a2840', shoes: 'wrestling-boots', shoesColor: '#2a2236', mask: 'none', paint: 'skull', paintColor: '#f4f2fa', extras: [ex('duster', '#2a2236', '#7a2840')] },
    persona: { alignment: 'heel', finisherStyle: 'submission' },
  },
  {
    id: 'cheer', label: 'Cheerleader of Chaos', blurb: 'Pom-pom energy, folding-chair follow-through.',
    self: { body: 'athletic', hair: 'highpony', eyes: 'happy', top: 'track', topColor: '#ff5d8f', topAccent: '#fbf0d9', bottom: 'skirt', bottomColor: '#fbf0d9', bottomAccent: '#ff5d8f', shoes: 'sneakers', shoesColor: '#fbf0d9', extras: [ex('headband', '#fbf0d9')] },
    ring: { top: 'crop', topColor: '#ff5d8f', topAccent: '#fbf0d9', topPattern: 'hearts', bottom: 'shorts', bottomColor: '#fbf0d9', bottomAccent: '#ff5d8f', shoes: 'wrestling-boots', shoesColor: '#ff5d8f', mask: 'none', paint: 'heart', paintColor: '#ff5d8f', extras: [ex('headband', '#fbf0d9'), ex('kneepads', '#ff5d8f')] },
    persona: { alignment: 'heel', finisherStyle: 'flashy' },
  },
];

// ---------------------------------------------------------------- generators

const ADJ = ['Velvet', 'Golden', 'Gentle', 'Thunderous', 'Suspicious', 'Unstoppable', 'Midnight', 'Rusty', 'Sparkly', 'Humble', 'Notorious', 'Electric', 'Cosmic', 'Haunted', 'Polite', 'Grumpy', 'Sweet', 'Majestic', 'Hometown', 'Pocket-Sized', 'Legendary', 'Neon', 'Sequined', 'Feral', 'Cozy', 'Turbo', 'Atomic', 'Cinnamon', 'Barnyard', 'Southern-Fried', 'Lunar', 'Disco', 'Iron', 'Rubber', 'Funky', 'Gilded', 'Stormy', 'Mild-Mannered', 'Overdue', 'Wild', 'Ultra', 'Fluffy', 'Ominous', 'Retired (Not Really)', 'Moonlit', 'Buttered', 'Righteous', 'Bashful', 'Unbreakable', 'Lukewarm'];
const NOUN = ['Jackhammer', 'Tornado', 'Librarian', 'Avalanche', 'Mountain', 'Waffle', 'Comet', 'Biscuit', 'Bulldozer', 'Butterfly', 'Gargoyle', 'Thunderbolt', 'Lumberjack', 'Pancake', 'Possum', 'Meteor', 'Cowboy', 'Haymaker', 'Chandelier', 'Wrecking Ball', 'Accountant', 'Tiger', 'Lighthouse', 'Hurricane', 'Hammer', 'Phantom', 'Crowbar', 'Dynamo', 'Grizzly', 'Mailbox', 'Casserole', 'Cannonball', 'Zamboni', 'Saxophone', 'Volcano', 'Raccoon', 'Tractor', 'Gator', 'Trombone', 'Tumbleweed', 'Snowplow', 'Cupcake', 'Lawn Gnome', 'Stampede', 'Lasagna', 'Sasquatch', 'Toaster', 'Moose'];
const TITLE = ['Captain', 'Doctor', 'Lady', 'Lord', 'Big', 'Little', 'Mister', 'Madame', 'Professor', 'Coach', 'Baron', 'Duke', 'Duchess', 'Grandmaster', 'Agent', 'Count', 'Chef', 'Admiral', 'Sir', 'Dame', 'Judge', 'Reverend of Rasslin\''];
const PUN = ['Kayfabe', 'Lariat', 'Suplex', 'Dropkick', 'Moonsault', 'Clothesline', 'Turnbuckle', 'Piledriver', 'Headlock', 'Backbreaker', 'Bodyslam', 'Crossface', 'Powerbomb', 'Spinebuster', 'Figure-Four', 'Gutwrench', 'Bulldog', 'Elbowdrop', 'Hip Toss', 'Armbar', 'Sleeper', 'Facebuster', 'Neckbreaker', 'Snapmare'];
const LAST = ['McGee', 'Thunderpants', 'Von Hammerstein', 'Valentine', 'Montgomery', 'Delacroix', 'Buttons', 'Steele', 'Goldberry', 'Featherstone', 'Lovejoy', 'Crumble'];

const pick = <T,>(a: readonly T[], r = Math.random): T => a[Math.floor(r() * a.length)];

export function genRingName(realName = ''): string {
  const first = realName.trim().split(/\s+/)[0] || 'Rookie';
  const n = Math.random();
  if (n < 0.28) return `The ${pick(ADJ)} ${pick(NOUN)}`;
  if (n < 0.5) return `${pick(TITLE)} ${pick(PUN)}`;
  if (n < 0.62) return `${pick(ADJ)} ${pick(PUN)}`;
  if (n < 0.72) return `${first} the ${pick(NOUN)}`;
  if (n < 0.82) return `"${pick(ADJ)}" ${first} ${pick(LAST)}`;
  if (n < 0.9) return `${pick(TITLE)} ${pick(NOUN)}`;
  return `${pick(NOUN)} ${pick(LAST)}`;
}

const NICK = [
  'The Pride of {town}', 'The People\'s {noun}', 'The {adj} One', 'Saturday Night\'s Main Event', 'The Hardest-Working Rookie in the Business',
  'The Hometown Hurricane', 'The Eighth Wonder of the Alley', 'The Human Highlight Reel', 'The Sultan of Suplex', 'The Duke of Dropkicks',
  'The Wizard of Ahhs', 'The Last Honest Heel', 'The Folding Chair Philosopher', 'The Sweetheart of the Squared Circle', 'The {adj} Sensation',
  'Mr. or Ms. Wednesday Night', 'The Bingo Hall Legend', 'The Turnbuckle Troubadour', 'The Undisputed Champion of Brunch', 'The Weather Report (Stormy)',
  'The Kid from the Bus Station', 'Your Grandma\'s Favorite', 'The Night Shift', 'Everybody\'s Cousin', 'The {noun} With a Heart of Gold',
];
export function genNickname(): string {
  return pick(NICK).replace('{town}', pick(['Turnbuckle Alley', 'the Big City', 'Chokeslam Creek', 'Exit 41', 'the VFW'])).replace('{noun}', pick(NOUN)).replace('{adj}', pick(ADJ));
}

const FROM = [
  'Parts Unknown', 'a Waffle House in Tulsa', 'right here in Turnbuckle Alley!', 'the top rope', 'somewhere over the turnbuckle', 'Grandma\'s basement',
  'a very large haystack', 'the Moon (allegedly)', 'beautiful downtown Nowhere', 'Parts Slightly Known', 'the Bermuda Triangle', 'the fourth dimension',
  'a truck stop off I-40', 'your worst nightmare (and also Ohio)', 'the back booth at the Hot Tag Diner', 'the Big City, and glad to leave it',
  'a lighthouse somewhere foggy', 'Parts Unknown, Kentucky', 'the bottom of the Dungeon', 'a bowling alley that never closes', 'the county fair, 1998',
  'a VHS tape found at the flea market', 'Chokeslam Creek', 'the cereal aisle', 'the last row of the Sportatorium',
];
export function genHailingFrom(): string {
  return pick(FROM);
}

export const CATCHPHRASES = [
  'Ring the bell!', 'Somebody get me a chair!', 'You can\'t teach heart!', 'Feel the rumble!', 'Lights out, Alley!', 'Hug it out or tap it out!',
  'One, two, three, and I\'m free!', 'Nobody puts me in the corner!', 'Hit the music!', 'Bring your own chair!', 'I came, I saw, I suplexed.',
  'Can you smell what the bakery\'s cooking?', 'That\'s the bottom line, sugar!', 'Check the tape!', 'Mama didn\'t raise a jobber!', 'See you at the VFW!',
  'Ding ding, it\'s go time!', 'Turn it up!', 'Say "uncle"!', 'Who wants seconds?',
];

const SIG_MOVES = ['Suplex', 'Lariat', 'Drop', 'Driver', 'Bomb', 'Splash', 'Slam', 'Cutter', 'Kick', 'Elbow', 'Clutch', 'Stretch', 'Bulldog', 'Spear', 'Twister', 'Express', 'Special', 'Surprise', 'Sunset Flip', 'Hug'];
const FIN: Record<string, string[]> = {
  power: ['Bomb', 'Driver', 'Slam', 'Press', 'Avalanche', 'Earthquake', 'Landslide', 'Piledriver'],
  aerial: ['Moonsault', 'Splash', 'Elbow', 'Swan Dive', 'Comet', 'Shooting Star', 'Frog Splash', 'Dive'],
  submission: ['Lock', 'Clutch', 'Crossface', 'Stretch', 'Sleeper', 'Hold', 'Crab', 'Pretzel'],
  strike: ['Kick', 'Lariat', 'Knee', 'Superkick', 'Haymaker', 'Elbow', 'Uppercut', 'Headbutt'],
  flashy: ['Cutter', 'Twister', 'Spin', 'Rana', 'Showstopper', 'Encore', 'Grand Finale', 'Pirouette'],
};
const FIN_FUN: Record<string, string[]> = {
  power: ['The Overdue Notice', 'Gravy Train', 'The Tax Audit', 'Last Call', 'The Mortgage'],
  aerial: ['The Kite String', 'Wish Upon a Turnbuckle', 'Gravity Optional', 'The Paper Airplane'],
  submission: ['The Pretzel Logic', 'Grandma\'s Hug', 'The Long Goodbye', 'The Group Project'],
  strike: ['Lights Out', 'The Doorbell', 'Sweet Dreams', 'The Early Bedtime'],
  flashy: ['The Encore', 'The Red Carpet', 'The Mic Drop', 'Jazz Hands'],
};
export function genSignature(): string {
  const n = Math.random();
  if (n < 0.5) return `${pick(ADJ)} ${pick(SIG_MOVES)}`;
  if (n < 0.8) return `${pick(NOUN)} ${pick(SIG_MOVES)}`;
  return `The ${pick(PUN)} ${pick(SIG_MOVES)}`;
}
export function genFinisher(style: string): string {
  const n = Math.random();
  const list = FIN[style] ?? FIN.power;
  if (n < 0.35) return pick(FIN_FUN[style] ?? FIN_FUN.power);
  if (n < 0.7) return `${pick(ADJ)} ${pick(list)}`;
  return `The ${pick(NOUN)} ${pick(list)}`;
}

export const FLAVOR = {
  self: ['Every legend needs a mullet. Or doesn\'t. Your call.', 'The mirror has seen worse. Probably.', 'Big day. Bus leaves at seven.', 'Grandma would say "stand up straight, chère."'],
  ring: ['Marigold has pins in their mouth and opinions in their heart.', 'Sequins are a structural element.', 'A cape is just a hug that follows you.', 'The robe makes the entrance. The entrance makes the legend.'],
};
// ================================================================ creator scene

const audioAny = audioModule as unknown as {
  previewTheme?: (t: { style: string; tempo: number; seed: number }, o?: { bars?: number }) => void;
  stopPreview?: () => void;
};

type Mode = 'self' | 'ring';
type TabId = 'you' | 'body' | 'face' | 'hair' | 'outfit' | 'extras' | 'gear' | 'mask' | 'robe' | 'persona' | 'moves' | 'entrance' | 'theme';

const SELF_TABS: [TabId, string][] = [['you', 'You'], ['body', 'Body'], ['face', 'Face'], ['hair', 'Hair'], ['outfit', 'Outfit'], ['extras', 'Extras']];
const RING_TABS: [TabId, string][] = [['gear', 'Gear'], ['mask', 'Mask'], ['robe', 'Robe & belts'], ['hair', 'Hair'], ['persona', 'Persona'], ['moves', 'Moves'], ['entrance', 'Entrance'], ['theme', 'Theme']];

const CIV_TOPS = ['tee', 'hoodie', 'flannel', 'sweater', 'cardigan', 'buttondown', 'polo', 'track', 'blouse', 'tank', 'crop', 'rashguard', 'jacket', 'vest'];
const CIV_BOTTOMS = ['jeans', 'slacks', 'shorts', 'cargo', 'sweats', 'wide', 'skirt', 'leggings', 'overalls', 'longskirt'];
const CIV_SHOES = ['sneakers', 'hightops', 'boots', 'loafers', 'sandals', 'cowboy-boots', 'clogs'];
const RING_TOPS_LIST = ['singlet', 'tank', 'none', 'bodysuit', 'rashguard', 'sportsbra', 'crop', 'jacket'];
const RING_BOTTOMS_LIST = ['trunks', 'tights', 'shorts', 'kilt', 'overalls'];
const FUN_PATTERNS = ['stars', 'stripes', 'flames', 'lightning', 'sequins', 'checker', 'hearts', 'plaid'];

const SLOT_LABEL: Record<string, string> = { head: 'Hats & hair things', face: 'Glasses', neck: 'Around the neck', over: 'Layers', waist: 'Belts', arms: 'Arms', legs: 'Legs', hand: 'In hand', back: 'Back' };

const rr = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
const chance = (p: number) => Math.random() < p;
function weighted<T>(items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let v = Math.random() * total;
  for (const [it, w] of items) if ((v -= w) <= 0) return it;
  return items[0][0];
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  kind: 'spark' | 'confetti' | 'smoke' | 'star';
  size: number;
}

class CreatorScene implements Scene {
  private mode: Mode;
  private onDone: () => void;
  private look: Look;
  private name: string;
  private pronouns: string;
  private background: BackgroundId;
  private persona: Persona;
  private tab: TabId;
  private root: HTMLElement | null = null;
  private bodyEl: HTMLElement | null = null;
  private tabsEl: HTMLElement | null = null;
  private stageEl: HTMLElement | null = null;
  private t = 0;
  private dirIdx = 0;
  private manualDir = -1;
  private manualUntil = 0;
  private entranceT = -1;
  private nextEntrance = 7;
  private particles: Particle[] = [];
  private bg: HTMLCanvasElement | null = null;
  private mirror: HTMLCanvasElement | null = null;
  private mirrorKey = '';
  private bgKey = '';
  private offKey: (() => void) | null = null;
  private presetId = '';
  private finished = false;

  constructor(mode: Mode, onDone: () => void) {
    this.mode = mode;
    this.onDone = onDone;
    const P = G.player;
    this.name = P.name && P.name !== 'Rookie' ? P.name : '';
    this.pronouns = P.pronouns || 'they';
    this.background = P.background || 'backyard';
    this.tab = mode === 'self' ? 'you' : 'gear';
    if (mode === 'self') {
      this.look = cloneLook(P.look);
    } else {
      const base = cloneLook(P.look);
      if (P.persona) this.look = { ...cloneLook(P.ringLook), ...this.bodyOf(base) };
      else this.look = this.applyRingPart(base, PRESETS[0].ring);
    }
    this.persona = P.persona ? JSON.parse(JSON.stringify(P.persona)) : this.freshPersona();
  }

  // ------------------------------------------------------------ data helpers

  private bodyOf(l: Look): Partial<Look> {
    return { body: l.body, height: l.height, skin: l.skin, head: l.head, eyes: l.eyes, eyeColor: l.eyeColor, eyeColor2: l.eyeColor2, features: l.features, age: l.age, species: l.species, facial: l.facial };
  }

  private applyRingPart(base: Look, part: Partial<Look>): Look {
    // Ring gear replaces clothes; keep the hair unless the preset styles it.
    const keep = this.bodyOf(base);
    const out: Look = { ...base, ...part, ...keep, extras: [...(part.extras ?? [])] };
    if (part.hair) out.hair = part.hair;
    if (part.hairColor) out.hairColor = part.hairColor;
    return out;
  }

  private freshPersona(): Persona {
    const style = rr(FINISHER_STYLES).id;
    return {
      ringName: genRingName(this.name || G.player.name),
      nickname: genNickname(),
      hailingFrom: genHailingFrom(),
      catchphrase: rr(CATCHPHRASES),
      alignment: 'face',
      signatureName: genSignature(),
      finisherName: genFinisher(style),
      finisherStyle: style,
      entrance: { walk: 'strut', taunt: 'point', pyro: 'sparks', light: LIGHT_COLORS[0] },
      theme: { style: rr(THEME_STYLES), tempo: 120 + Math.floor(Math.random() * 40), seed: Math.floor(Math.random() * 99999) },
    };
  }

  private set(p: Partial<Look>): void {
    this.look = { ...this.look, ...p };
    this.renderTab();
  }

  private extra(id: string): Extra | undefined {
    return this.look.extras?.find((e) => e.id === id);
  }

  private toggleExtra(id: string, color?: string): void {
    const ex0 = this.look.extras ?? [];
    if (ex0.some((e) => e.id === id)) this.look = { ...this.look, extras: ex0.filter((e) => e.id !== id) };
    else {
      const slot = EXTRA_SLOT[id];
      // One item per exclusive slot (one hat, one pair of glasses, one hand prop, one back piece).
      const exclusive = slot === 'head' || slot === 'face' || slot === 'hand' || slot === 'back' || slot === 'waist';
      const kept = exclusive ? ex0.filter((e) => EXTRA_SLOT[e.id] !== slot || (slot === 'head' && ['pencil-ear', 'flower', 'headband'].includes(e.id) !== ['pencil-ear', 'flower', 'headband'].includes(id))) : ex0;
      const c = color ?? this.defaultExtraColor(id);
      this.look = { ...this.look, extras: [...kept, { id, color: c, accent: shAhex(c) }] };
    }
    this.renderTab();
  }

  private defaultExtraColor(id: string): string {
    const d: Record<string, string> = { 'title-belt': '#f4b63f', 'cardboard-belt': '#d9aa6a', 'pencil-ear': '#ffd84a', glasses: '#3a3448', 'round-glasses': '#8a4a2a', sunglasses: '#3a3448', aviators: '#e2b244', cateye: '#c9404c', halfmoon: '#c8a070', pearls: '#fff6ea', crown: '#f4b63f', 'wrist-tape': '#fbf0d9', kneepads: '#3a3448', 'elbow-pads': '#3a3448', mic: '#dcdae6', book: '#c9404c', cane: '#8a5a3a', 'chef-hat': '#fbf6ec', headlamp: '#3a3448', medal: '#dcdae6' };
    return d[id] ?? this.look.topAccent ?? '#d8434b';
  }

  private setExtraColor(id: string, color: string, accent = false): void {
    this.look = { ...this.look, extras: (this.look.extras ?? []).map((e) => (e.id === id ? (accent ? { ...e, accent: color } : { ...e, color, accent: e.accent && e.accent !== shAhex(e.color) ? e.accent : shAhex(color) }) : e)) };
    this.renderTab();
  }

  // ------------------------------------------------------------ randomizers

  private rollSelf(): void {
    const body = weighted<Look['body']>([['athletic', 3], ['lean', 3], ['petite', 2], ['stocky', 2], ['heavy', 2], ['giant', 1]]);
    const pal = rr(PALETTES);
    const top = rr(CIV_TOPS);
    const extras: Extra[] = [];
    if (chance(0.32)) extras.push({ id: rr(['glasses', 'round-glasses', 'sunglasses', 'cateye']), color: rr(['#3a3448', '#8a4a2a', '#c9404c', '#e2b244', '#4c6ab2']) });
    if (chance(0.22)) extras.push({ id: rr(['cap', 'beanie', 'bucket-hat', 'headband']), color: pal[1], accent: pal[0] });
    if (chance(0.15)) extras.push({ id: rr(['scarf', 'headphones', 'bandana']), color: pal[1], accent: pal[0] });
    if (chance(0.18) && !['jacket', 'cardigan', 'vest'].includes(top)) extras.push({ id: rr(['jacket', 'cardigan', 'vest']), color: rr(CLOTH_COLORS), accent: pal[1] });
    const hair = chance(0.05) ? 'bald' : rr(HAIR_STYLES).id;
    const features: string[] = [];
    if (chance(0.25)) features.push('freckles');
    if (chance(0.1)) features.push('beauty-mark');
    this.look = {
      ...this.look,
      body,
      height: body === 'giant' ? 4 + Math.floor(Math.random() * 3) : Math.floor(Math.random() * 5) - 2,
      skin: rr(SKIN_TONES_ALL),
      head: rr(HEAD_SHAPES).id,
      hair,
      hairColor: chance(0.82) ? rr(NATURAL_HAIR) : rr(FUN_HAIR),
      hairAccent: chance(0.1) ? rr(FUN_HAIR) : undefined,
      facial: chance(0.3) ? rr(FACIAL_STYLES).id : 'none',
      eyes: rr(EYE_STYLES).id,
      eyeColor: rr(EYE_COLORS),
      top,
      topColor: pal[0],
      topAccent: pal[1],
      topPattern: top === 'flannel' ? 'plaid' : chance(0.2) ? rr(['stripes', 'stars', 'floral', 'logo', 'hearts', 'checker']) : undefined,
      bottom: rr(CIV_BOTTOMS),
      bottomColor: pal[2],
      bottomAccent: pal[3],
      bottomPattern: undefined,
      shoes: rr(CIV_SHOES),
      shoesColor: pal[4],
      mask: 'none',
      paint: 'none',
      features,
      extras,
    };
  }

  private rollRing(): void {
    const pal = rr(PALETTES);
    const extras: Extra[] = [];
    if (chance(0.5)) extras.push({ id: 'kneepads', color: rr([pal[1], pal[2], '#3a3448']) });
    if (chance(0.3)) extras.push({ id: 'elbow-pads', color: pal[2] });
    if (chance(0.4)) extras.push({ id: 'wrist-tape', color: '#fbf0d9' });
    if (chance(0.38)) {
      const id = weighted([['robe', 5], ['cape', 3], ['jacket', 2], ['duster', 1]]);
      extras.push({ id, color: pal[0], accent: pal[1], pattern: chance(0.4) ? 'sequins' : chance(0.3) ? rr(FUN_PATTERNS) : undefined });
    }
    if (chance(0.12)) extras.push({ id: 'headband', color: pal[1] });
    const masked = chance(0.28);
    const mask = masked ? weighted([['luchador', 6], ['half', 1.5], ['hood', 1], ['domino', 1.5]]) : 'none';
    const top = rr(RING_TOPS_LIST);
    this.look = {
      ...this.look,
      top,
      topColor: pal[0],
      topAccent: pal[1],
      topPattern: chance(0.3) ? rr(FUN_PATTERNS) : undefined,
      bottom: rr(RING_BOTTOMS_LIST),
      bottomColor: chance(0.5) ? pal[0] : pal[2],
      bottomAccent: pal[1],
      bottomPattern: chance(0.35) ? rr(FUN_PATTERNS) : undefined,
      shoes: weighted([['wrestling-boots', 7], ['kickpads', 2], ['barefoot', 1]]),
      shoesColor: pal[4],
      mask,
      maskColor: pal[0],
      maskAccent: pal[1],
      maskPattern: rr(MASK_PATTERNS).id,
      paint: !masked && chance(0.22) ? rr(PAINT_STYLES.slice(1)).id : 'none',
      paintColor: rr(['#fbf0d9', '#2b2140', pal[1], '#d8434b']),
      extras,
    };
    const style = rr(FINISHER_STYLES).id;
    this.persona = {
      ringName: genRingName(this.name || G.player.name),
      nickname: genNickname(),
      hailingFrom: genHailingFrom(),
      catchphrase: rr(CATCHPHRASES),
      alignment: rr(ALIGNMENTS).id,
      signatureName: genSignature(),
      finisherName: genFinisher(style),
      finisherStyle: style,
      entrance: { walk: rr(ENTRANCE_WALKS).id, taunt: rr(ENTRANCE_TAUNTS).id, pyro: rr(PYRO.slice(1)).id, light: rr(LIGHT_COLORS) },
      theme: { style: rr(THEME_STYLES), tempo: 90 + Math.floor(Math.random() * 80), seed: Math.floor(Math.random() * 99999) },
    };
  }

  private roll(): void {
    if (this.mode === 'self') this.rollSelf();
    else this.rollRing();
    this.presetId = '';
    this.burst(14);
    audio.sfx('pop');
    this.renderAll();
  }

  private applyPreset(p: Preset): void {
    this.presetId = p.id;
    if (this.mode === 'self') {
      this.look = { ...this.look, ...p.self, topPattern: p.self.topPattern, bottomPattern: p.self.bottomPattern, extras: [...(p.self.extras ?? [])] };
    } else {
      this.look = this.applyRingPart(this.look, p.ring);
      this.look.topPattern = p.ring.topPattern;
      this.look.bottomPattern = p.ring.bottomPattern;
      const style = p.persona?.finisherStyle ?? this.persona.finisherStyle;
      this.persona = { ...this.persona, ...p.persona, finisherStyle: style, finisherName: genFinisher(style) };
    }
    this.burst(10);
    audio.sfx('select');
    this.renderAll();
  }

  // ------------------------------------------------------------ lifecycle

  enter(): void {
    this.buildDom();
    this.offKey = game.input.onKey((key, code) => {
      if (code === 'ArrowLeft') this.rotate(-1);
      else if (code === 'ArrowRight') this.rotate(1);
      else if (key === 'r' || key === 'R') this.roll();
    });
  }

  exit(): void {
    this.root?.remove();
    this.root = null;
    this.offKey?.();
    audioAny.stopPreview?.();
  }

  private rotate(d: number): void {
    const cur = this.manualDir >= 0 ? this.manualDir : this.dirIdx;
    this.manualDir = (cur + d + 4) % 4;
    this.manualUntil = this.t + 6;
  }

  private finish(): void {
    if (this.finished) return;
    this.finished = true;
    const P = G.player;
    if (this.mode === 'self') {
      P.name = this.name.trim() || 'Rookie';
      P.pronouns = this.pronouns.trim() || 'they';
      P.background = this.background;
      P.look = cloneLook(this.look);
      if (!P.persona) P.ringLook = { ...cloneLook(P.ringLook), ...this.bodyOf(this.look), hair: this.look.hair, hairColor: this.look.hairColor, hairAccent: this.look.hairAccent };
    } else {
      P.ringLook = cloneLook(this.look);
      const pr = this.persona;
      P.persona = {
        ...pr,
        ringName: pr.ringName.trim() || genRingName(P.name),
        nickname: pr.nickname.trim() || genNickname(),
        hailingFrom: pr.hailingFrom.trim() || 'Parts Unknown',
        catchphrase: pr.catchphrase.trim() || 'Ring the bell!',
        signatureName: pr.signatureName.trim() || genSignature(),
        finisherName: pr.finisherName.trim() || genFinisher(pr.finisherStyle),
      };
    }
    audio.sfx('confirm');
    audioAny.stopPreview?.();
    this.onDone();
  }

  // ------------------------------------------------------------ DOM

  private buildDom(): void {
    const root = el('div', `cr-root cr-${this.mode}`);
    const stage = el('div', 'cr-stage');
    stage.addEventListener('click', () => this.rotate(1));
    const rotL = el('button', { class: 'cr-rot left', 'aria-label': 'Turn left', onclick: (e: Event) => { e.stopPropagation(); this.rotate(-1); } }, '⟲');
    const rotR = el('button', { class: 'cr-rot right', 'aria-label': 'Turn right', onclick: (e: Event) => { e.stopPropagation(); this.rotate(1); } }, '⟳');
    stage.append(rotL, rotR);
    const panel = el('div', 'cr-panel panel');
    const head = el('div', 'cr-head');
    head.append(
      el('div', 'cr-title display', this.mode === 'self' ? 'Getting ready' : 'Ring gear'),
      el('div', 'cr-sub', this.mode === 'self' ? 'The bathroom mirror in your city apartment. ' + rr(FLAVOR.self) : 'Marigold\'s sewing shop, Turnbuckle Alley. ' + rr(FLAVOR.ring)),
    );
    const quick = el('div', 'cr-quick');
    const rollBtn = el('button', { class: 'btn gold cr-roll', onclick: () => this.roll() }, '🎲 Roll me one');
    const presets = el('div', 'cr-presets');
    for (const p of PRESETS) {
      const b = el('button', { class: 'cr-preset', 'data-id': p.id, onclick: () => this.applyPreset(p) }, el('b', {}, p.label), el('span', {}, p.blurb));
      presets.append(b);
    }
    quick.append(rollBtn, presets);
    const tabs = el('div', 'cr-tabs');
    const scroll = el('div', 'cr-scroll');
    const body = el('div', 'cr-body');
    scroll.append(quick, tabs, body);
    const foot = el('div', 'cr-foot');
    foot.append(
      el('span', 'cr-foot-hint label', this.mode === 'self' ? 'Shallow or deep. Both are fine.' : 'You can visit Marigold anytime.'),
      el('button', { class: 'btn primary cr-done', onclick: () => this.finish() }, 'Looks great →'),
    );
    panel.append(head, scroll, foot);
    root.append(stage, panel);
    uiRoot().append(root);
    this.root = root;
    this.bodyEl = body;
    this.tabsEl = tabs;
    this.stageEl = stage;
    this.renderAll();
  }

  private renderAll(): void {
    if (!this.root) return;
    this.root.querySelectorAll<HTMLElement>('.cr-preset').forEach((b) => b.classList.toggle('on', b.dataset.id === this.presetId));
    this.renderTabs();
    this.renderTab();
  }

  private renderTabs(): void {
    const tabs = this.tabsEl;
    if (!tabs) return;
    tabs.innerHTML = '';
    for (const [id, label] of this.mode === 'self' ? SELF_TABS : RING_TABS) {
      tabs.append(el('button', { class: `cr-tab${this.tab === id ? ' on' : ''}`, onclick: () => { this.tab = id; this.renderTabs(); this.renderTab(); } }, label));
    }
  }

  private renderTab(): void {
    const body = this.bodyEl;
    if (!body) return;
    body.innerHTML = '';
    const L = this.look;
    const add = (...n: Node[]) => body.append(...n);
    switch (this.tab) {
      case 'you':
        add(this.textRow('Name', this.name, 'What should Grandma call you?', (v) => (this.name = v), 24));
        add(this.chipRow('Pronouns', [{ id: 'they', label: 'they/them' }, { id: 'she', label: 'she/her' }, { id: 'he', label: 'he/him' }, { id: 'custom', label: 'custom' }], ['they', 'she', 'he'].includes(this.pronouns) ? this.pronouns : 'custom', (v) => { this.pronouns = v === 'custom' ? '' : v; this.renderTab(); }));
        if (!['they', 'she', 'he'].includes(this.pronouns)) add(this.textRow('Your pronouns', this.pronouns, 'e.g. xe/xem', (v) => (this.pronouns = v), 20));
        add(this.section('Where you\'re coming from'));
        {
          const grid = el('div', 'cr-cards');
          for (const b of BACKGROUNDS) grid.append(el('button', { class: `cr-card${this.background === b.id ? ' on' : ''}`, onclick: () => { this.background = b.id; this.renderTab(); } }, el('b', {}, `${b.icon} ${b.label}`), el('span', {}, b.blurb)));
          add(grid);
        }
        break;
      case 'body':
        add(this.chipRow('Build', BODY_TYPES, L.body, (v) => this.set({ body: v as Look['body'], height: v === 'giant' ? Math.max(L.height, 4) : Math.min(L.height, 4) }), true));
        add(this.sliderRow('Height', -2, L.body === 'giant' ? 8 : 6, L.height, (v) => this.set({ height: v }), (v) => (v < 0 ? 'Compact' : v === 0 ? 'Average' : v < 4 ? 'Tall' : 'Very tall')));
        add(this.swatchRow('Skin', SKIN_TONES_ALL, L.skin, (c) => this.set({ skin: c })));
        add(this.chipRow('Head', HEAD_SHAPES, L.head, (v) => this.set({ head: v as Look['head'] })));
        add(this.chipRow('Age', [{ id: 'adult', label: 'Adult' }, { id: 'elder', label: 'Seasoned' }], L.age === 'elder' ? 'elder' : 'adult', (v) => this.set({ age: v === 'elder' ? 'elder' : undefined })));
        break;
      case 'face':
        add(this.chipRow('Eyes', EYE_STYLES, L.eyes, (v) => this.set({ eyes: v }), true));
        add(this.swatchRow('Eye color', EYE_COLORS, L.eyeColor, (c) => this.set({ eyeColor: c })));
        add(this.chipRow('Facial hair', FACIAL_STYLES, L.facial, (v) => this.set({ facial: v }), true));
        add(this.toggleRow('Little details', FEATURES.filter((f) => f.id !== 'notch'), L.features ?? [], (id) => { const f = new Set(L.features ?? []); if (f.has(id)) f.delete(id); else f.add(id); this.set({ features: [...f] }); }));
        if (this.mode === 'self') add(this.chipRow('Face paint (bold!)', PAINT_STYLES, L.paint ?? 'none', (v) => this.set({ paint: v, paintColor: L.paintColor ?? '#fbf0d9' })));
        break;
      case 'hair':
        add(this.chipRow('Style', HAIR_STYLES, L.hair, (v) => this.set({ hair: v }), true));
        add(this.swatchRow('Color', HAIR_COLORS_ALL, L.hairColor, (c) => this.set({ hairColor: c })));
        add(this.swatchRow('Streak / tips', HAIR_COLORS_ALL, L.hairAccent ?? '', (c) => this.set({ hairAccent: c || undefined }), true));
        if (this.mode === 'ring') {
          add(this.chipRow('Facial hair', FACIAL_STYLES, L.facial, (v) => this.set({ facial: v })));
        }
        break;
      case 'outfit':
        add(this.chipRow('Top', TOP_STYLES, L.top, (v) => this.set({ top: v, topPattern: v === 'flannel' ? 'plaid' : L.topPattern === 'plaid' ? undefined : L.topPattern }), true));
        add(this.swatchRow('Top color', CLOTH_COLORS, L.topColor, (c) => this.set({ topColor: c })));
        add(this.swatchRow('Top accent', CLOTH_COLORS, L.topAccent, (c) => this.set({ topAccent: c })));
        add(this.chipRow('Top pattern', PATTERNS, L.topPattern ?? 'solid', (v) => this.set({ topPattern: v === 'solid' ? undefined : v })));
        add(this.chipRow('Bottoms', BOTTOM_STYLES.filter((b) => b.id !== 'none'), L.bottom, (v) => this.set({ bottom: v }), true));
        add(this.swatchRow('Bottoms color', CLOTH_COLORS, L.bottomColor, (c) => this.set({ bottomColor: c })));
        add(this.swatchRow('Bottoms accent', CLOTH_COLORS, L.bottomAccent, (c) => this.set({ bottomAccent: c })));
        add(this.chipRow('Shoes', SHOE_STYLES, L.shoes, (v) => this.set({ shoes: v })));
        add(this.swatchRow('Shoe color', CLOTH_COLORS, L.shoesColor, (c) => this.set({ shoesColor: c })));
        break;
      case 'extras':
        for (const slot of ['face', 'head', 'neck', 'over', 'hand', 'waist', 'back'] as const) {
          const opts = EXTRA_STYLES.filter((e) => e.slot === slot && !['moth-wings', 'wings'].includes(e.id));
          add(this.extraGroup(SLOT_LABEL[slot], opts));
        }
        break;
      case 'gear':
        add(this.chipRow('Top', TOP_STYLES.filter((t) => t.ring), L.top, (v) => this.set({ top: v }), true));
        add(this.swatchRow('Main color', CLOTH_COLORS, L.topColor, (c) => this.set({ topColor: c })));
        add(this.swatchRow('Trim', CLOTH_COLORS.concat(METAL_COLORS), L.topAccent, (c) => this.set({ topAccent: c })));
        add(this.chipRow('Top pattern', PATTERNS, L.topPattern ?? 'solid', (v) => this.set({ topPattern: v === 'solid' ? undefined : v })));
        add(this.chipRow('Tights & trunks', BOTTOM_STYLES.filter((b) => b.ring), L.bottom, (v) => this.set({ bottom: v }), true));
        add(this.swatchRow('Tights color', CLOTH_COLORS, L.bottomColor, (c) => this.set({ bottomColor: c })));
        add(this.swatchRow('Stripe / trim', CLOTH_COLORS.concat(METAL_COLORS), L.bottomAccent, (c) => this.set({ bottomAccent: c })));
        add(this.chipRow('Tights pattern', PATTERNS, L.bottomPattern ?? 'solid', (v) => this.set({ bottomPattern: v === 'solid' ? undefined : v })));
        add(this.chipRow('Boots', SHOE_STYLES.filter((s) => s.ring || s.id === 'sneakers' || s.id === 'cowboy-boots'), L.shoes, (v) => this.set({ shoes: v })));
        add(this.swatchRow('Boot color', CLOTH_COLORS.concat(METAL_COLORS), L.shoesColor, (c) => this.set({ shoesColor: c })));
        add(this.extraGroup('Pads & tape', EXTRA_STYLES.filter((e) => ['kneepads', 'elbow-pads', 'wrist-tape', 'gloves', 'knee-brace', 'headband', 'sunglasses'].includes(e.id))));
        break;
      case 'mask':
        add(this.chipRow('Mask', MASK_STYLES.filter((m) => m.id !== 'moth'), L.mask ?? 'none', (v) => this.set({ mask: v, maskColor: L.maskColor ?? L.topColor, maskAccent: L.maskAccent ?? L.topAccent }), true));
        if (L.mask && L.mask !== 'none') {
          add(this.swatchRow('Mask color', CLOTH_COLORS.concat(METAL_COLORS), L.maskColor ?? L.topColor, (c) => this.set({ maskColor: c })));
          add(this.swatchRow('Mask accent', CLOTH_COLORS.concat(METAL_COLORS), L.maskAccent ?? L.topAccent, (c) => this.set({ maskAccent: c })));
          if (L.mask === 'luchador' || L.mask === 'half') add(this.chipRow('Design', MASK_PATTERNS, L.maskPattern ?? 'plain', (v) => this.set({ maskPattern: v })));
          add(el('p', 'cr-note', 'A mask is a promise. In public, it never comes off.'));
        }
        add(this.chipRow('Face paint', PAINT_STYLES, L.paint ?? 'none', (v) => this.set({ paint: v, paintColor: L.paintColor ?? '#fbf0d9' }), true));
        if (L.paint && L.paint !== 'none') add(this.swatchRow('Paint color', ['#fbf0d9', '#f4f2fa', '#2b2140', '#d8434b', '#f4b63f', '#3fb0c8', '#58b368', '#ff5d8f', '#b27ae0', '#8a8aa0'], L.paintColor ?? '#fbf0d9', (c) => this.set({ paintColor: c })));
        break;
      case 'robe':
        add(this.extraGroup('Entrance wear', EXTRA_STYLES.filter((e) => ['robe', 'cape', 'jacket', 'duster', 'wings'].includes(e.id)), true));
        add(this.extraGroup('Belts', EXTRA_STYLES.filter((e) => ['title-belt', 'cardboard-belt'].includes(e.id))));
        add(this.extraGroup('Accessories', EXTRA_STYLES.filter((e) => ['crown', 'cowboy-hat', 'bandana', 'scarf', 'mic', 'aviators', 'pearls'].includes(e.id))));
        break;
      case 'persona': {
        const pr = this.persona;
        add(this.textRow('Ring name', pr.ringName, 'The Velvet Jackhammer', (v) => (pr.ringName = v), 32, () => { pr.ringName = genRingName(this.name || G.player.name); this.renderTab(); }));
        add(this.textRow('Nickname', pr.nickname, 'The Pride of Turnbuckle Alley', (v) => (pr.nickname = v), 40, () => { pr.nickname = genNickname(); this.renderTab(); }));
        add(this.textRow('Hailing from', pr.hailingFrom, 'Parts Unknown', (v) => (pr.hailingFrom = v), 44, () => { pr.hailingFrom = genHailingFrom(); this.renderTab(); }));
        add(this.textRow('Catchphrase', pr.catchphrase, 'Ring the bell!', (v) => (pr.catchphrase = v), 48, () => { pr.catchphrase = rr(CATCHPHRASES); this.renderTab(); }));
        {
          const sug = el('div', 'cr-suggest');
          for (const c of CATCHPHRASES.slice().sort(() => Math.random() - 0.5).slice(0, 5)) sug.append(el('button', { class: 'cr-chip small', onclick: () => { pr.catchphrase = c; this.renderTab(); } }, c));
          add(sug);
        }
        add(this.section('Which side are you on?'));
        const grid = el('div', 'cr-cards three');
        for (const a of ALIGNMENTS) grid.append(el('button', { class: `cr-card${pr.alignment === a.id ? ' on' : ''} al-${a.id}`, onclick: () => { pr.alignment = a.id; this.renderTab(); } }, el('b', {}, a.label), el('span', {}, a.blurb)));
        add(grid);
        break;
      }
      case 'moves': {
        const pr = this.persona;
        add(this.textRow('Signature move', pr.signatureName, 'Hometown Spinebuster', (v) => (pr.signatureName = v), 36, () => { pr.signatureName = genSignature(); this.renderTab(); }));
        add(this.section('Finisher style'));
        const grid = el('div', 'cr-cards five');
        for (const f of FINISHER_STYLES) grid.append(el('button', { class: `cr-card small${pr.finisherStyle === f.id ? ' on' : ''}`, onclick: () => { pr.finisherStyle = f.id; pr.finisherName = genFinisher(f.id); this.renderTab(); } }, el('b', {}, f.label), el('span', {}, f.blurb)));
        add(grid);
        add(this.textRow('Finisher name', pr.finisherName, 'The Overdue Notice', (v) => (pr.finisherName = v), 36, () => { pr.finisherName = genFinisher(pr.finisherStyle); this.renderTab(); }));
        add(el('p', 'cr-note', 'Your finisher becomes a card in your deck. Name it something the whole Sportatorium can chant.'));
        break;
      }
      case 'entrance': {
        const en = this.persona.entrance;
        add(this.chipRow('Walk', ENTRANCE_WALKS, en.walk, (v) => { en.walk = v; this.renderTab(); this.startEntrance(); }));
        add(this.chipRow('Taunt', ENTRANCE_TAUNTS, en.taunt, (v) => { en.taunt = v; this.renderTab(); this.startEntrance(); }));
        add(this.chipRow('Pyro', PYRO, en.pyro, (v) => { en.pyro = v; this.renderTab(); this.startEntrance(); }));
        add(this.swatchRow('Spotlight', LIGHT_COLORS, en.light, (c) => { en.light = c; this.renderTab(); this.startEntrance(); }));
        add(el('button', { class: 'btn teal cr-wide', onclick: () => this.startEntrance() }, '▶ Run the entrance'));
        break;
      }
      case 'theme': {
        const th = this.persona.theme;
        add(this.chipRow('Style', THEME_STYLES.map((s) => ({ id: s, label: THEME_LABELS[s] ?? s })), th.style, (v) => { th.style = v; this.renderTab(); this.playTheme(); }));
        add(this.sliderRow('Tempo', 70, 180, th.tempo, (v) => { th.tempo = v; }, (v) => `${v} bpm`, () => this.playTheme()));
        const row = el('div', 'cr-btnrow');
        row.append(
          el('button', { class: 'btn teal', onclick: () => this.playTheme() }, '▶ Play'),
          el('button', { class: 'btn gold', onclick: () => { th.seed = Math.floor(Math.random() * 99999); this.renderTab(); this.playTheme(); } }, '🎲 Remix'),
          el('button', { class: 'btn small', onclick: () => audioAny.stopPreview?.() }, '■ Stop'),
        );
        add(row);
        add(el('p', 'cr-note', `Remix #${th.seed}. Gus will play this every time you walk out. Every. Single. Time.`));
        break;
      }
    }
  }

  private playTheme(): void {
    try {
      audio.unlock();
      audioAny.previewTheme?.({ ...this.persona.theme }, { bars: 8 });
    } catch {
      /* audio is optional */
    }
  }

  // ------------------------------------------------------------ controls

  private section(text: string): HTMLElement {
    return el('div', 'cr-section label', text);
  }

  private chipRow(label: string, opts: { id: string; label: string; hint?: string }[], cur: string, pick: (v: string) => void, showHint = false): HTMLElement {
    const row = el('div', 'cr-row');
    const head = el('div', 'cr-row-head');
    const idx = Math.max(0, opts.findIndex((o) => o.id === cur));
    const curOpt = opts[idx];
    const step = (d: number) => pick(opts[(idx + d + opts.length) % opts.length].id);
    head.append(
      el('span', 'cr-label label', label),
      el('span', 'cr-arrows', el('button', { class: 'cr-arrow', 'aria-label': 'Previous', onclick: () => step(-1) }, '‹'), el('span', 'cr-cur', curOpt?.label ?? cur), el('button', { class: 'cr-arrow', 'aria-label': 'Next', onclick: () => step(1) }, '›')),
    );
    row.append(head);
    if (showHint && curOpt?.hint) row.append(el('div', 'cr-hint', curOpt.hint));
    const chips = el('div', 'cr-chips');
    for (const o of opts) chips.append(el('button', { class: `cr-chip${o.id === cur ? ' on' : ''}`, onclick: () => pick(o.id) }, o.label));
    row.append(chips);
    return row;
  }

  private swatchRow(label: string, colors: string[], cur: string, pick: (c: string) => void, allowNone = false): HTMLElement {
    const row = el('div', 'cr-row');
    row.append(el('div', 'cr-row-head', el('span', 'cr-label label', label)));
    const sw = el('div', 'cr-swatches');
    if (allowNone) sw.append(el('button', { class: `cr-swatch none${!cur ? ' on' : ''}`, 'aria-label': 'None', onclick: () => pick('') }, '∅'));
    for (const c of colors) {
      const b = el('button', { class: `cr-swatch${c.toLowerCase() === (cur ?? '').toLowerCase() ? ' on' : ''}`, 'aria-label': c, onclick: () => pick(c) });
      b.style.setProperty('--c', c);
      sw.append(b);
    }
    row.append(sw);
    return row;
  }

  private sliderRow(label: string, min: number, max: number, cur: number, set: (v: number) => void, fmt: (v: number) => string, commit?: () => void): HTMLElement {
    const row = el('div', 'cr-row');
    const val = el('span', 'cr-cur', fmt(cur));
    row.append(el('div', 'cr-row-head', el('span', 'cr-label label', label), val));
    const input = el('input', { type: 'range', min, max, step: 1, value: cur, class: 'cr-slider' });
    input.addEventListener('input', () => {
      const v = Number(input.value);
      val.textContent = fmt(v);
      set(v);
    });
    if (commit) input.addEventListener('change', commit);
    row.append(input);
    return row;
  }

  private textRow(label: string, value: string, placeholder: string, set: (v: string) => void, max: number, gen?: () => void): HTMLElement {
    const row = el('div', 'cr-row');
    row.append(el('div', 'cr-row-head', el('span', 'cr-label label', label)));
    const wrap = el('div', 'cr-textwrap');
    const input = el('input', { type: 'text', value, placeholder, maxlength: max, class: 'cr-text', autocomplete: 'off', spellcheck: 'false' });
    input.addEventListener('input', () => set(input.value));
    input.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if ((e as KeyboardEvent).key === 'Enter') input.blur();
    });
    wrap.append(input);
    if (gen) wrap.append(el('button', { class: 'btn gold small cr-gen', 'aria-label': `Generate ${label}`, onclick: gen }, '🎲'));
    row.append(wrap);
    return row;
  }

  private toggleRow(label: string, opts: { id: string; label: string }[], on: string[], toggle: (id: string) => void): HTMLElement {
    const row = el('div', 'cr-row');
    row.append(el('div', 'cr-row-head', el('span', 'cr-label label', label)));
    const chips = el('div', 'cr-chips');
    for (const o of opts) chips.append(el('button', { class: `cr-chip${on.includes(o.id) ? ' on' : ''}`, onclick: () => toggle(o.id) }, o.label));
    row.append(chips);
    return row;
  }

  private extraGroup(label: string, opts: { id: string; label: string; hint?: string }[], withPattern = false): HTMLElement {
    const row = el('div', 'cr-row');
    row.append(el('div', 'cr-row-head', el('span', 'cr-label label', label)));
    const chips = el('div', 'cr-chips');
    for (const o of opts) chips.append(el('button', { class: `cr-chip${this.extra(o.id) ? ' on' : ''}`, onclick: () => this.toggleExtra(o.id) }, o.label));
    row.append(chips);
    for (const o of opts) {
      const e = this.extra(o.id);
      if (!e) continue;
      const sub = el('div', 'cr-subrow');
      sub.append(this.swatchRow(`${o.label} color`, CLOTH_COLORS.concat(METAL_COLORS), e.color, (c) => this.setExtraColor(o.id, c)));
      if (withPattern) {
        sub.append(this.swatchRow(`${o.label} trim`, CLOTH_COLORS.concat(METAL_COLORS), e.accent ?? '', (c) => this.setExtraColor(o.id, c, true)));
        sub.append(this.chipRow(`${o.label} pattern`, PATTERNS, e.pattern ?? 'solid', (v) => { this.look = { ...this.look, extras: (this.look.extras ?? []).map((x) => (x.id === o.id ? { ...x, pattern: v === 'solid' ? undefined : v } : x)) }; this.renderTab(); }));
      }
      row.append(sub);
    }
    return row;
  }

  // ------------------------------------------------------------ preview

  private startEntrance(): void {
    if (this.mode !== 'ring') return;
    this.entranceT = 0;
    this.particles.length = 0;
  }

  private burst(n: number): void {
    const a = this.stageArea();
    for (let i = 0; i < n; i++) {
      this.particles.push({ x: a.x + a.w / 2 + (Math.random() - 0.5) * 30, y: a.y + a.h * 0.6, vx: (Math.random() - 0.5) * 90, vy: -40 - Math.random() * 70, life: 0, max: 0.8 + Math.random() * 0.5, color: rr(['#f4b63f', '#ff5d8f', '#fff1c2', '#3fb0c8']), kind: 'star', size: 1 });
    }
  }

  private stageArea(): { x: number; y: number; w: number; h: number } {
    const W = game.screen.w;
    const H = game.screen.h;
    const panel = this.root?.querySelector('.cr-panel') as HTMLElement | null;
    const k = game.screen.cssPerNative;
    if (!panel) return { x: 0, y: 0, w: W * 0.45, h: H };
    const r = panel.getBoundingClientRect();
    if (r.top > window.innerHeight * 0.25) return { x: 0, y: 0, w: W, h: Math.floor(r.top / k) };
    return { x: 0, y: 0, w: Math.max(80, Math.floor(r.left / k)), h: H };
  }

  update(dt: number): void {
    this.t += dt;
    this.dirIdx = Math.floor(this.t / 2.2) % 4;
    if (this.mode === 'ring') {
      if (this.entranceT >= 0) {
        this.entranceT += dt;
        if (this.entranceT > 5.2) {
          this.entranceT = -1;
          this.nextEntrance = this.t + 14;
        }
      } else if (this.t > this.nextEntrance) this.startEntrance();
    }
    this.spawnPyro(dt);
    for (const p of this.particles) {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'confetti') {
        p.vx = Math.sin((p.life + p.size) * 4) * 18;
        p.vy = 26;
      } else if (p.kind === 'smoke') {
        p.vy *= 0.97;
        p.size += dt * 6;
      } else p.vy += 120 * dt;
    }
    this.particles = this.particles.filter((p) => p.life < p.max);
  }

  private spawnPyro(dt: number): void {
    if (this.mode !== 'ring' || this.entranceT < 0) return;
    const pyro = this.persona.entrance.pyro;
    const a = this.stageArea();
    const floorY = a.y + a.h * 0.78;
    const et = this.entranceT;
    if (pyro === 'none' || et < 0.5) return;
    const rate = et > 2.4 && et < 3.4 ? 3 : 1;
    if (pyro === 'sparks') {
      for (let i = 0; i < 3 * rate; i++)
        for (const sx of [a.x + a.w * 0.18, a.x + a.w * 0.82]) this.particles.push({ x: sx, y: floorY, vx: (Math.random() - 0.5) * 30, vy: -90 - Math.random() * 70, life: 0, max: 0.7 + Math.random() * 0.4, color: rr(['#ffd84a', '#fff1c2', '#f4b63f', '#e2903a']), kind: 'spark', size: 1 });
    } else if (pyro === 'confetti') {
      if (Math.random() < dt * 40 * rate) this.particles.push({ x: a.x + Math.random() * a.w, y: a.y - 2, vx: 0, vy: 26, life: 0, max: 4, color: rr(['#ff5d8f', '#f4b63f', '#3fb0c8', '#58b368', '#b27ae0', '#fbf0d9']), kind: 'confetti', size: Math.random() * 6 });
    } else if (pyro === 'fireworks') {
      if (Math.random() < dt * 2.2 * rate) {
        const cx = a.x + a.w * (0.2 + Math.random() * 0.6);
        const cy = a.y + a.h * (0.12 + Math.random() * 0.25);
        const c = rr(['#ff5d8f', '#f4b63f', '#3fb0c8', '#58b368', '#fff1c2']);
        for (let i = 0; i < 22; i++) {
          const ang = (i / 22) * Math.PI * 2;
          const sp = 40 + Math.random() * 20;
          this.particles.push({ x: cx, y: cy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, life: 0, max: 0.9, color: c, kind: 'spark', size: 1 });
        }
      }
    } else if (pyro === 'smoke') {
      if (Math.random() < dt * 16) this.particles.push({ x: a.x + Math.random() * a.w, y: floorY + 2, vx: (Math.random() - 0.5) * 8, vy: -8 - Math.random() * 8, life: 0, max: 3, color: '#d8d0e8', kind: 'smoke', size: 4 + Math.random() * 4 });
    }
  }

  private backdrop(W: number, H: number): HTMLCanvasElement {
    const key = `${W}x${H}:${this.mode}`;
    if (this.bg && this.bgKey === key) return this.bg;
    const self = this.mode === 'self';
    const spr = mkSpr(W, H, () => {
      const floorY = Math.floor(H * 0.74);
      if (self) {
        VG(0, 0, W, floorY, ['#e8c8a8', '#d8a890', '#b88a98'], 0.6);
        for (let x = 0; x < W; x += 12) R(x, 0, 2, floorY, (xx, yy, o) => (dth(xx, yy, 6) ? shA(o, 0.06) : o));
        R(0, floorY - 6, W, 6, '#9a6a5a');
        R(0, floorY - 6, W, 1, '#c88a72');
        VG(0, floorY, W, H - floorY, ['#a8745a', '#7a4e40'], 0.5);
        for (let y = floorY + 3; y < H; y += 5) R(0, y, W, 1, (xx, yy, o) => (hash2(xx >> 4, yy, 3) > 0.15 ? shA(o, 0.12) : o));
        // Night window with city lights.
        const wx = Math.floor(W * 0.06);
        const wy = Math.floor(H * 0.12);
        const ww = Math.max(40, Math.floor(W * 0.16));
        const wh = Math.floor(H * 0.32);
        RR(wx - 2, wy - 2, ww + 4, wh + 4, 2, '#5b3f6b');
        VG(wx, wy, ww, wh, ['#2a2050', '#4a3a78', '#8a5a8a'], 0.6);
        for (let i = 0; i < 9; i++) {
          const bx = wx + Math.floor((i / 9) * ww);
          const bh = Math.floor(wh * (0.25 + hash2(i, 1, 9) * 0.5));
          R(bx, wy + wh - bh, Math.ceil(ww / 9) + 1, bh, '#2b2140');
          for (let j = 0; j < bh - 3; j += 3) if (hash2(i, j, 4) > 0.55) R(bx + 1 + (j % 2), wy + wh - bh + 2 + j, 1, 1, '#ffd890');
        }
        R(wx + Math.floor(ww / 2), wy, 1, wh, '#5b3f6b');
        // Plant.
        const px0 = Math.floor(W * 0.86);
        RR(px0, floorY - 14, 12, 14, 2, '#c8603a');
        for (let i = 0; i < 7; i++) ell(px0 + 6 + Math.cos(i) * 6, floorY - 20 - Math.sin(i * 1.7) * 6, 4, 2.5, i % 2 ? '#58b368' : '#3f8a5a');
      } else {
        VG(0, 0, W, floorY, ['#3a2a54', '#5b3f6b', '#7a4f86'], 0.6);
        // Curtains.
        for (const side of [0, 1]) {
          const cx0 = side ? W - Math.floor(W * 0.14) : 0;
          R(cx0, 0, Math.floor(W * 0.14), floorY, (xx) => ((xx >> 2) % 2 ? '#9c2537' : '#c9404c'));
          R(cx0, 0, Math.floor(W * 0.14), 3, '#f4b63f');
        }
        // Spool shelves and a mannequin silhouette.
        for (let i = 0; i < 6; i++) RR(Math.floor(W * 0.18) + i * 7, Math.floor(H * 0.18), 5, 8, 1, ['#e2544a', '#3fb0c8', '#f4b63f', '#58b368', '#b27ae0', '#ff5d8f'][i]);
        R(Math.floor(W * 0.17), Math.floor(H * 0.18) + 8, 46, 2, '#5a3a46');
        // Stage floor.
        VG(0, floorY, W, H - floorY, ['#4a3a5a', '#2a2236'], 0.5);
        for (let x = 0; x < W; x += 8) R(x, floorY, 1, H - floorY, (_xx, _yy, o) => shA(o, 0.15));
        R(0, floorY, W, 1, '#8a6a9a');
      }
    });
    this.bg = toCanvas(spr);
    this.bgKey = key;
    return this.bg;
  }

  render(ctx: CanvasRenderingContext2D): void {
    const W = game.screen.w;
    const H = game.screen.h;
    ctx.drawImage(this.backdrop(W, H), 0, 0);
    const a = this.stageArea();
    const floorY = Math.min(Math.floor(a.y + a.h * 0.78), H - 26);
    const size = characterSize(this.look);
    const k = Math.max(2, Math.min(4, Math.floor((a.h * 0.42) / Math.max(26, size.h)), Math.floor((a.w * 0.55) / Math.max(18, size.w)), Math.floor((floorY - 24) / Math.max(26, size.h + 6))));
    let cx = Math.floor(a.x + a.w / 2);
    // Pose and facing for the showcase.
    const dirs: Dir[] = ['down', 'left', 'up', 'right'];
    const manual = this.manualDir >= 0 && this.t < this.manualUntil;
    let facing: Dir = dirs[manual ? this.manualDir : this.dirIdx];
    let pose: Pose = 'idle';
    let frame = 0;
    if (this.mode === 'self') {
      const cyc = Math.floor(this.t / 2.2) % 8;
      if (!manual && cyc === 5) pose = 'wave';
      if (!manual && (cyc === 1 || cyc === 3)) {
        pose = 'walk';
        frame = Math.floor(this.t * 8);
      }
    } else if (this.entranceT >= 0) {
      const et = this.entranceT;
      const walkDur = this.persona.entrance.walk === 'sprint' ? 0.9 : this.persona.entrance.walk === 'swagger' || this.persona.entrance.walk === 'glide' ? 2.4 : 1.8;
      if (et < 0.6 + walkDur) {
        const k2 = Math.max(0, (et - 0.6) / walkDur);
        cx = Math.floor(lerpN(a.x + a.w + 24, a.x + a.w / 2, 1 - (1 - k2) * (1 - k2)));
        facing = 'left';
        pose = 'walk';
        frame = Math.floor(et * (this.persona.entrance.walk === 'sprint' ? 14 : 8));
      } else {
        facing = 'down';
        const tt = this.persona.entrance.taunt;
        pose = tt === 'flex' || tt === 'shush' ? 'taunt' : tt === 'belt' || tt === 'cup-ear' ? 'celebrate' : tt === 'point' ? 'wave' : tt === 'twirl' ? 'fireup' : 'idle';
      }
    } else if (!manual) {
      const seq: [Pose, Dir][] = [['idle', 'down'], ['taunt', 'down'], ['idle', 'right'], ['strike', 'right'], ['celebrate', 'down'], ['kick', 'left'], ['fireup', 'down'], ['idle', 'up'], ['grapple', 'right'], ['idle', 'left']];
      const [p0, d0] = seq[Math.floor(this.t / 1.8) % seq.length];
      pose = p0;
      facing = d0;
    }
    if (this.mode === 'self') {
      const mh = Math.min(Math.floor(a.h * 0.86), Math.round(size.h * k * 1.3));
      const mw = Math.round(mh * 0.62);
      const key = `${mw}x${mh}`;
      if (!this.mirror || this.mirrorKey !== key) {
        this.mirror = toCanvas(mkSpr(mw, mh, () => {
          ell(mw / 2, mh / 2, mw / 2, mh / 2, '#a8743a');
          ell(mw / 2, mh / 2, mw / 2 - 1, mh / 2 - 1, '#d8a85a');
          ell(mw / 2, mh / 2, mw / 2 - 3, mh / 2 - 3, (xx, yy) => (dth(xx, yy, 3) ? '#d8e4ea' : '#c4d4e0'));
          ell(mw * 0.34, mh * 0.3, mw * 0.07, mh * 0.14, '#eef4f8');
          ell(mw * 0.42, mh * 0.18, mw * 0.03, mh * 0.05, '#eef4f8');
        }));
        this.mirrorKey = key;
      }
      ctx.drawImage(this.mirror, cx - (mw >> 1), floorY - mh + Math.round(k * 2));
    }
    // Lights for the entrance.
    if (this.mode === 'ring' && this.entranceT >= 0) {
      const et = this.entranceT;
      const dim = Math.min(1, et * 2) * (et > 4.6 ? Math.max(0, 1 - (et - 4.6) * 2) : 1);
      ctx.globalAlpha = 0.55 * dim;
      ctx.fillStyle = '#0b0712';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 0.28 * dim;
      ctx.fillStyle = this.persona.entrance.light;
      const sweep = Math.sin(et * 2.2) * a.w * 0.2;
      ctx.beginPath();
      ctx.moveTo(cx + sweep - 4, a.y);
      ctx.lineTo(cx + sweep + 4, a.y);
      ctx.lineTo(cx + 30 * (k / 3), floorY + 3);
      ctx.lineTo(cx - 30 * (k / 3), floorY + 3);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    // Shadow.
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#2b2140';
    const sw = Math.round(size.w * k * 0.7);
    ctx.fillRect(cx - (sw >> 1), floorY - k, sw, k * 2);
    ctx.globalAlpha = 1;
    const spr = characterSprite(this.look, { facing, pose, frame, t: this.t });
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(spr.canvas, cx - spr.ax * k, floorY - spr.ay * k, spr.canvas.width * k, spr.canvas.height * k);
    // Particles.
    for (const p of this.particles) {
      const fade = 1 - p.life / p.max;
      ctx.globalAlpha = p.kind === 'smoke' ? fade * 0.35 : Math.min(1, fade * 1.6);
      ctx.fillStyle = p.color;
      if (p.kind === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'confetti') ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, (Math.floor(p.life * 8) & 1) + 1);
      else if (p.kind === 'star') {
        ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y), 3, 1);
        ctx.fillRect(Math.round(p.x), Math.round(p.y) - 1, 1, 3);
      } else ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1);
    }
    ctx.globalAlpha = 1;
    // Name plate (ring mode).
    if (this.mode === 'ring' && this.stageEl) {
      this.stageEl.dataset.name = this.persona.ringName;
    }
  }
}

function lerpN(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function shAhex(c: string): string {
  const n = shA(c, 0.28);
  return '#' + [n & 255, (n >>> 8) & 255, (n >>> 16) & 255].map((v) => v.toString(16).padStart(2, '0')).join('');
}

/** The character creator: 'self' in the prologue mirror, 'ring' at Marigold's shop. */
export function creatorScene(mode: 'self' | 'ring', onDone: () => void): Scene {
  return new CreatorScene(mode, onDone);
}
