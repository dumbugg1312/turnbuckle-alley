import { audio } from '../audio';
import { game } from '../core/game';
import { newState, setState, G, setFlag, addItem } from '../core/state';
import { sting } from '../core/sting';
import { BACKGROUND_CARDS, STARTER_DECK } from '../match/cards';
import { BusScene } from '../scenes/bus';
import { choose, narrate, say, toast } from '../ui/dialog';
import { showLetter } from '../systems/mail';
import { WorldScene, WORLD } from '../world/scene';
import { HAIR_COLORS, SKIN_TONES } from '../gfx/look';
import { speakerFor } from '../world/talk';
import { TILE } from '../world/types';

/** Optional modules from other teams, loaded if present. */
const creatorMod = import.meta.glob<{ creatorScene?: (mode: 'self' | 'ring', onDone: () => void) => import('../core/scene').Scene }>('../scenes/creator.ts');

export async function openCreator(mode: 'self' | 'ring'): Promise<void> {
  const loader = Object.values(creatorMod)[0];
  if (!loader) return;
  const m = await loader();
  if (!m.creatorScene) return;
  await new Promise<void>((resolve) => {
    game.scenes.push(
      m.creatorScene!(mode, () => {
        game.scenes.pop();
        resolve();
      }),
    );
  });
}

const GRANDMA_LETTER = [
  'Sweetheart,',
  "I know you're busy in that big city, cutting up other people's matches into little pieces. I watched one of your clips. It was very short.",
  "I'm writing because some days the words are slippery for me now, and I want to put these down while they're holding still.",
  "**Go see Birdie.** Birdie Malone, at the Sportatorium in Turnbuckle Alley. Learn everything she knows. She knows *everything*, the stubborn old mule.",
  "The key is to my old house. I never sold it. Couldn't. The bus ticket is because I know you, and you'll think about this for a year if I let you.",
  "And one more thing: *don't tell her I sent you.*",
];

/** New Game: the city prologue. */
export function startNewGame(): void {
  void import('../systems').then(() => {
    const s = newState((Math.random() * 2 ** 31) | 0);
    s.flags['prologue'] = true;
    s.player.deck = [...STARTER_DECK];
    s.player.map = 'maxx-office';
    s.player.x = 7 * TILE + 8;
    s.player.y = 8 * TILE + 12;
    s.player.facing = 'up';
    s.time.minutes = 23 * 60 + 48;
    setState(s);
    game.scenes.transition(() => {
      game.scenes.reset(new WorldScene());
    });
  });
}

/** Scene 1: the MaxxMedia office at midnight. */
export async function officeScene(): Promise<void> {
  const w = WORLD;
  if (!w) return;
  audio.music('city');
  await narrate('*The City.* Floor 31 of the MaxxMedia tower. 11:48 PM.', 'Your monitor shows a wrestling match: two people pouring everything they have into the last five minutes of a show. Your job is to find the nine seconds the algorithm likes.');
  const royce = speakerFor('royce');
  await w.walkTo('royce', 9, 7, 'left');
  await say(royce, "Twelve clips by midnight. Slams, flips, falls. Faces hitting mats.", "Nobody watches the selling. Nobody watches the part where they *look at each other.* Cut it.");
  const c = await choose(null, 'Which nine seconds do you clip?', [
    { label: 'The superplex off the top rope', value: 'slam', hint: 'Royce will love it' },
    { label: 'The comeback, when the whole crowd stood up', value: 'heart', hint: 'The real story' },
  ]);
  if (c === 'slam') {
    await say(royce, '*Beautiful.* Twelve million impressions by breakfast. See? You get it.');
    await narrate('You do get it. That\'s the problem.');
  } else {
    await say(royce, "...That's a man standing up slowly. That's not content, that's a *mood*. Redo it.");
    setFlag('prologue_heart');
  }
  await w.walkTo('royce', 18, 4, 'left');
  w.despawn('royce');
  const arlo = speakerFor('arlo');
  await say(arlo, c === 'heart' ? "For what it's worth, I liked your clip. The standing-up one. It made the back of my neck do a thing." : "You okay? You've got the face you make when you clip something you hate.");
  await say(arlo, "You used to watch the old stuff with your grandma, right? The territory tapes? You told me about her once. The Duchess.", "...Go home. I'll finish your last clip. I'm in a giving mood and also I'm avoiding my own clips.");
  await narrate('You grab your coat. The elevator takes a long time. The city is very bright and very loud and nobody looks up.');
  await w.warpTo('apartment', 5, 6, 'up');
}

/** Scene 2: the apartment, the letter, the mirror. */
export async function apartmentScene(): Promise<void> {
  const w = WORLD;
  if (!w) return;
  await narrate('Your apartment. A pile of mail on the mat: two bills, a coupon, and one envelope addressed by hand, in pencil, in cursive you know by heart.');
  await showLetter({ id: 'grandma-first', from: 'Grandma (Dottie)', body: GRANDMA_LETTER });
  addItem('grandmas-letter', 1);
  addItem('house-key', 1);
  sting('reveal');
  await narrate(
    'Tucked inside: a bus ticket, an old brass key with a faded blue ribbon, and a Polaroid.',
    'Two women in sequined 80s ring gear, back to back, holding one championship belt between them. On the back, in younger handwriting: *The Velvet Hammers. 1981. Never better.*',
  );
  await narrate('The mirror by your dresser catches you staring.');
  const c = await choose(null, 'Who is looking back at you?', [
    { label: '🪞 Look in the mirror (create your character)', value: 'mirror', style: 'primary' },
    { label: 'Roll with a random look', value: 'random' },
  ]);
  if (c === 'mirror') await openCreator('self');
  else randomLook();
  await narrate('You pack one bag. On the way to the depot you buy a gas station coffee, a candy bar, and one deep breath of courage.');
  G.player.deck = [...STARTER_DECK, ...(BACKGROUND_CARDS[G.player.background] ?? [])];
  // The bus ride.
  game.scenes.transition(() => {
    game.scenes.reset(new BusScene(() => arrive()));
  });
}

function randomLook(): void {
  const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
  const l = G.player.look;
  l.skin = pick(SKIN_TONES);
  l.hairColor = pick(HAIR_COLORS.slice(0, 8));
  l.hair = pick(['short', 'curly', 'ponytail', 'bun', 'afro', 'side-part', 'braids', 'bob', 'mullet']);
  l.topColor = pick(['#d8434b', '#3f9a92', '#3f74d8', '#f4b63f', '#6a3fa0', '#5c9a6e', '#e07b39']);
  l.body = pick(['lean', 'athletic', 'stocky'] as const);
  if (G.player.name === 'Rookie') G.player.name = pick(['Sam', 'Jo', 'Remy', 'Casey', 'Morgan', 'Ari', 'Dakota', 'Rowan']);
}

/** Scene 3: stepping off the bus in Turnbuckle Alley. */
export function arrive(): void {
  delete G.flags['prologue'];
  setFlag('arrived');
  G.time = { year: 1, season: 0, day: 1, minutes: 17 * 60 + 40 };
  G.weather = { today: 'sun', tomorrow: 'sun' };
  G.player.map = 'town';
  G.player.x = 60 * TILE + 8;
  G.player.y = 25 * TILE + 12;
  G.player.facing = 'left';
  game.scenes.reset(new WorldScene());
}

export async function arrivalScene(): Promise<void> {
  const w = WORLD;
  if (!w) return;
  audio.sfx('door');
  await narrate('The bus wheezes away down Route 9, and the dust settles on *Turnbuckle Alley*.', 'The sun is low and gold. Somewhere, a screen door bangs. The whole town smells like cut grass and fryer oil.');
  w.spawnTemp('pip', 52, 24, 'right');
  await w.walkTo('pip', 58, 25, 'right');
  const pip = speakerFor('pip');
  await say(pip, 'WHOA. Are you a wrestler? You have wrestler shoulders.', "I'm Pip. I'm the undisputed Pip-weight champion of the world. *(He taps a cardboard belt with PIP painted on it in glitter glue.)*");
  const c = await choose(pip, 'Are you a wrestler?', [
    { label: "Not yet. Maybe soon.", value: 'soon' },
    { label: "I'm here to find Birdie Malone.", value: 'birdie' },
  ]);
  if (c === 'soon') await say(pip, '"Not yet" is what Big Earl said before he became THE MOUNTAIN. That\'s what my dad says.');
  else await say(pip, "Birdie?! She runs the WHOLE Sportatorium! She's the Commissioner! She fined the Bruiser Twins forty casseroles once!");
  await say(pip, "Where are you staying? There's no hotel. There's a motel but it has a raccoon.", '...The old *Dupree* place? Past the Sportatorium, all the way west? Nobody\'s lived there since FOREVER. My dad says it\'s haunted by a really good wrestler.');
  await say(pip, "I gotta go, it's dinner. Bye! Welcome to Turnbuckle Alley! Wednesday is wrestling!");
  await w.walkTo('pip', 46, 25);
  w.despawn('pip');
  toast(G.settings.showHints ? 'Tap anywhere to walk, or use WASD/arrows. Head west to the Dupree place.' : '');
}

export async function farmArrival(): Promise<void> {
  await narrate(
    'The Dupree place sits at the end of the road like it has been waiting with its hands folded.',
    "A blue house with a sagging porch. A yard gone wild. And in the middle of the weeds, half-swallowed by vines: a wrestling ring. Grandma's backyard ring.",
  );
}

export async function firstNight(): Promise<void> {
  await narrate(
    "Inside, dust sheets over everything and a calendar on the wall still turned to October 1983.",
    'On the mantel, the same Polaroid as yours, in a frame. Two women, one belt.',
    'The bed creaks like it remembers you. Get some sleep. Tomorrow you find Birdie.',
  );
  if (G.settings.showHints) toast('Check the bed to sleep and save. Days run 6 AM to 2 AM.');
}
