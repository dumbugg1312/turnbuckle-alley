import { audio } from '../audio';
import { game } from '../core/game';
import { newState, setState, G, setFlag, addItem } from '../core/state';
import { sting } from '../core/sting';
import { absDay } from '../core/time';
import { STARTER_DECK } from '../match/cards';
import { BusScene } from '../scenes/bus';
import { choose, narrate, say, toast } from '../ui/dialog';
import { noteTalked, noteToday } from '../systems/daylog';
import { showLetter } from '../systems/mail';
import { findProp, placeProp } from '../systems/runtime-props';
import { syncFridge } from '../systems/surprises';
import { showEnvelopeContents } from './keepsakes';
import { PorchSky } from './porch-sky';
import { WorldScene, WORLD } from '../world/scene';
import { HAIR_COLORS, SKIN_TONES } from '../gfx/look';
import { onAction, onEnterMap, onTalk, onTick } from '../world/hooks';
import { speakerFor } from '../world/talk';
import { TILE } from '../world/types';
import { TOWN_ENTRY } from '../world/maps/town';

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

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const hint = (text: string) => {
  if (G.settings.showHints) toast(text);
};

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
    // At your desk, facing the monitor: the clip is one button away, the floor is yours to wander.
    s.player.y = 6 * TILE + 12;
    s.player.facing = 'up';
    s.time.minutes = 23 * 60 + 48;
    setState(s);
    game.scenes.transition(() => {
      game.scenes.reset(new WorldScene());
    });
  });
}

/** Tag a map object (found by id, or by kind near a tile) with an action at runtime. */
function tag(mapId: string, action: string, find: { id?: string; kind?: string; near?: [number, number] }): void {
  const w = WORLD;
  if (!w) return;
  const m = w.getMap(mapId);
  const o = m.objects.find((x) => {
    if (find.id) return x.id === find.id;
    if (x.kind !== find.kind) return false;
    if (!find.near) return true;
    return Math.abs(x.x / TILE - find.near[0]) < 0.6 && Math.abs(x.y / TILE - find.near[1]) < 0.6;
  });
  if (o) o.props.action = action;
}

// ------------------------------------------------------------ Scene 1: floor 31

/** Little things on floor 31, one line each. Your desk is where the clip gets made. */
const OFFICE_LINES: Record<string, string> = {
  'office-dana': "Dana's desk. Dana went home at six. Her screen is still looping a man falling off a ladder into a kiddie pool, nine seconds at a time.",
  'office-marcus': 'Marcus\'s desk. A sticky note on the monitor: GONE TO THE GYM (REAL). Under it, a second note: (NOT REAL).',
  'office-box': "A packed box and a mug that says WORLD'S OKAYEST EDITOR. Somebody's last day was today. Their last clip is still up: a wrestler waving to his mom in the third row.",
  'office-stats': 'The big screen. IMPRESSIONS only goes up. Down in the corner, very small: AVG. WATCH TIME 4 SEC.',
  'office-window': 'Thirty-one floors down, the city runs all the way to the edge of the dark. Somewhere out past it is a water tower shaped like a turnbuckle. Grandma used to draw it on napkins.',
  'office-vending': 'One honey bun left, hanging by a corner, refusing to fall. You respect it.',
  'office-cooler': 'The water cooler glugs once, like it has an opinion about you.',
  'office-royce-door': 'R. PENN. Through the frosted glass, a shape doing calf raises on a phone call.',
};
for (const [id, text] of Object.entries(OFFICE_LINES)) onAction(id, () => narrate(text));

function tagOffice(): void {
  const M = 'maxx-office';
  tag(M, 'office-desk', { id: 'player-desk' });
  tag(M, 'office-dana', { kind: 'cubicle', near: [4, 9.95] });
  tag(M, 'office-marcus', { kind: 'cubicle', near: [15, 6.95] });
  tag(M, 'office-box', { kind: 'cubicle', near: [16, 9.95] });
  tag(M, 'office-stats', { kind: 'stats-screen' });
  tag(M, 'office-window', { kind: 'skyline-window' });
  tag(M, 'office-vending', { kind: 'vending' });
  tag(M, 'office-cooler', { kind: 'water-cooler' });
  tag(M, 'office-royce-door', { id: 'royce-door' });
  // The window and the big screen hang on the wall, out of reach of a facing check: give them a spot on the floor.
  placeProp(M, { id: 'sx-office-window-a', kind: 'sx-hotspot-wide', x: 8 * TILE, y: 4 * TILE + 6, props: { action: 'office-window', label: 'Look' } });
  placeProp(M, { id: 'sx-office-window-b', kind: 'sx-hotspot-wide', x: 13 * TILE, y: 4 * TILE + 6, props: { action: 'office-window', label: 'Look' } });
  placeProp(M, { id: 'sx-office-stats', kind: 'sx-hotspot', x: 3 * TILE + 8, y: 4 * TILE + 6, props: { action: 'office-stats', label: 'Look' } });
}

/** Scene 1: the MaxxMedia office at midnight. Short, then it's yours to walk. */
export async function officeScene(): Promise<void> {
  const w = WORLD;
  if (!w) return;
  audio.music('city');
  tagOffice();
  await narrate('*Floor 31.* 11:48 PM. Your monitor is paused on a man halfway through standing up.');
  w.emote('royce', '!');
  await say(speakerFor('royce'), 'Twelve clips by midnight. You owe me one.');
  hint('Walk with WASD or the arrow keys, or hold a finger on the screen. Press E, or tap something, to check it.');
}

/** Your desk: pick the nine seconds. Neither is wrong; the game remembers which. */
onAction('office-desk', async () => {
  const w = WORLD;
  if (!w || !G.flags['prologue']) return;
  if (G.flags['prologue_clip']) {
    await narrate('Exported. The progress bar says DONE in a font that is trying very hard.');
    return;
  }
  const c = await choose(null, 'The match is paused in its last five minutes. Which nine seconds?', [
    { label: 'The superplex off the top rope', value: 'slam' },
    { label: 'The comeback, when the whole crowd stood up', value: 'heart' },
    { label: 'Not yet', value: 'wait' },
  ], { cancelValue: 'wait' });
  if (c === 'wait') return;
  setFlag('prologue_clip', c);
  if (c === 'heart') setFlag('prologue_heart');
  audio.sfx('card-play');
  await narrate(
    c === 'slam'
      ? 'Scrub, trim, export. Nine seconds of a man falling off the top rope, over and over, very fast, forever.'
      : 'Scrub, trim, export. Nine seconds of a man getting up off the mat, and two thousand people getting up with him.',
  );
  w.emote('royce', c === 'slam' ? '!' : '?');
  await say(speakerFor('royce'), c === 'slam' ? '*Beautiful.* That does numbers by breakfast.' : "Huh. Slow. ...Ship it. Nobody's awake anyway.");
  const arlo = speakerFor('arlo');
  w.npcActor('arlo')?.faceToward(w.player.x, w.player.y);
  noteTalked('arlo');
  await say(
    arlo,
    c === 'heart' ? "I liked your clip. The standing-up one. It did a thing to the back of my neck." : "That guy landed the superplex like a mattress. ...You've got your going-home face on.",
    "You used to watch the old territory tapes with your grandma, right? The Duchess? Go home. I'll send your last one. I'm avoiding my own clips anyway.",
  );
  await narrate('You grab your coat. The elevator stops on every floor and nobody gets on. Down on the street, a man is selling umbrellas to people who already have umbrellas.');
  await w.warpTo('apartment', 5, 6, 'up');
});

// ------------------------------------------------------------ Scene 2: the apartment

/** Scene 2: the apartment. The envelope is on the mat, at your feet. */
export async function apartmentScene(): Promise<void> {
  const w = WORLD;
  if (!w) return;
  tag('apartment', 'apt-mail', { kind: 'mail-pile' });
  tag('apartment', 'apt-mirror', { kind: 'standing-mirror' });
  // The pile lies under your feet; a hotspot just above it makes it easy to reach facing either way.
  placeProp('apartment', { id: 'sx-apt-mail', kind: 'sx-hotspot', x: 5 * TILE + 9, y: 7 * TILE - 4, props: { action: 'apt-mail', label: 'Mail' } });
  placeProp('apartment', { id: 'sx-apt-mirror', kind: 'sx-hotspot', x: 6 * TILE + 4, y: 6 * TILE, props: { action: 'apt-mirror', label: 'Mirror' } });
  await narrate('Your apartment. On the mat, under two bills and a coupon for a gym you quit, an envelope addressed in pencil, in cursive you know by heart.');
}

onAction('apt-mail', async () => {
  if (G.flags['apt_letter']) {
    await narrate('Two bills and a coupon. They can wait. They are good at it.');
    return;
  }
  setFlag('apt_letter');
  await showLetter({ id: 'grandma-first', from: 'Grandma (Dottie)', body: GRANDMA_LETTER });
  addItem('grandmas-letter', 1);
  addItem('house-key', 1);
  sting('reveal');
  await showEnvelopeContents();
  await narrate('In the mirror by the dresser, somebody in a MaxxMedia lanyard is holding a Polaroid very carefully.');
});

/** The mirror (the standing one, or the one over the dresser). */
onAction('apt-mirror', async () => {
  if (!G.flags['prologue']) return;
  if (!G.flags['apt_letter']) {
    await narrate('You, at midnight, in a MaxxMedia lanyard. There is mail on the mat.');
    return;
  }
  const c = await choose(null, 'You take off the lanyard. Who is looking back at you?', [
    { label: 'Look in the mirror (create your character)', value: 'mirror', style: 'primary' },
    { label: 'Roll with a random look', value: 'random' },
  ]);
  if (c === 'mirror') await openCreator('self');
  else randomLook();
  await narrate("You pack one bag. On the way to the depot: a gas station coffee, a candy bar, and a pack of gum, because Grandma always said you can't be nervous and chew at the same time. (You can.)");
  // The bus ride.
  game.scenes.transition(() => {
    game.scenes.reset(new BusScene(() => arrive()));
  });
});

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

// ------------------------------------------------------------ Scene 3: Pip walks you through town

/** Scene 3: stepping off the bus in Turnbuckle Alley. */
export function arrive(): void {
  delete G.flags['prologue'];
  setFlag('arrived');
  G.time = { year: 1, season: 0, day: 1, minutes: 17 * 60 + 50 };
  G.weather = { today: 'sun', tomorrow: 'sun' };
  G.player.map = 'town';
  G.player.x = TOWN_ENTRY.bus.x * TILE + 8;
  G.player.y = TOWN_ENTRY.bus.y * TILE + 12;
  G.player.facing = 'left';
  game.scenes.reset(new WorldScene());
}

export async function arrivalScene(): Promise<void> {
  const w = WORLD;
  if (!w) return;
  audio.sfx('door');
  await narrate('The bus wheezes off down Route 9, and the dust settles on *Turnbuckle Alley*.', 'Low gold sun. Somewhere, a screen door bangs. The whole town smells like cut grass and fryer oil.');
  w.spawnTemp('pip', TOWN_ENTRY.bus.x - 8, TOWN_ENTRY.bus.y - 1, 'right');
  await w.walkTo('pip', TOWN_ENTRY.bus.x - 2, TOWN_ENTRY.bus.y, 'right');
  const pip = speakerFor('pip');
  w.emote('pip', '!');
  await say(pip, 'WHOA. Are you a wrestler? You have wrestler shoulders.', "I'm Pip. I'm the undisputed Pip-weight champion of the world. *(He taps a cardboard belt with PIP on it in glitter glue.)*");
  const c = await choose(pip, 'Are you a wrestler?', [
    { label: 'Not yet. Maybe soon.', value: 'soon' },
    { label: "I'm here to find Birdie Malone.", value: 'birdie' },
  ]);
  if (c === 'soon') await say(pip, '"Not yet" is what Big Earl said before he became THE MOUNTAIN. My dad says.');
  else await say(pip, "Birdie?! She runs the WHOLE Sportatorium! She fined the Bruiser Twins forty casseroles once!");
  await say(pip, "Where are you staying? There's no hotel. There's a motel but it has a raccoon.", "...The old *Dupree* place? All the way west? Nobody's lived there since FOREVER. C'mon, I'll walk you. It's on my way. Sort of. If you go the long way.");
  noteTalked('pip');
  startTour();
  hint('Tap anywhere to walk, or use WASD or the arrow keys. Hold Shift to run.');
}

interface Stop {
  x: number;
  y: number;
  emote: string;
  lines: string[];
}
/** On Main Street's north sidewalk, in front of each place, west from the bus stop. */
const STOPS: Stop[] = [
  { x: 87, y: 29, emote: '!', lines: ["That's Gas, Bait and Snacks. Dex works there. *DROPKICK DEX.*", 'He sells me gum and lets me hold the receipt.'] },
  { x: 64, y: 29, emote: '♥', lines: ['Tallbridge Bakery. Tiny makes the cakes. She is seven feet tall and she makes them THIS big.', '*(He holds up a thumb and finger, very close together.)*'] },
  { x: 38, y: 29, emote: '!', lines: ['THE SPORTATORIUM.', "It's locked till Wednesday. If you put your ear on the door you can hear the ring creak. I do it every day. For science."] },
  { x: 10, y: 29, emote: '♪', lines: ["The Hot Tag. Get the pie. Don't get the special.", "Nobody knows what's in the special. Not even June, and June MAKES it."] },
];
const TOUR_TALK = ["C'mon! The good stuff is THIS way.", "I'm walking slow on purpose. You're welcome.", 'Do you know any holds? You can do one on me. Not a real one.'];

interface Tour {
  stop: number;
  tx: number;
  ty: number;
  walking: boolean;
  pos: { x: number; y: number };
  farSince: number;
  lastCall: number;
  asked: boolean;
}
let tour: Tour | null = null;

function pipActor() {
  const w = WORLD;
  if (!w || w.map.id !== 'town' || !tour) return null;
  let a = w.npcActor('pip');
  if (!a) {
    a = w.spawnTemp('pip', tour.pos.x, tour.pos.y, 'left') ?? undefined;
    if (!a) return null;
  }
  a.speed = 56;
  a.leaving = false;
  a.idle = 'still';
  return a;
}

function startTour(): void {
  tour = { stop: 0, tx: STOPS[0].x, ty: STOPS[0].y, walking: true, pos: { x: TOWN_ENTRY.bus.x - 2, y: TOWN_ENTRY.bus.y }, farSince: 0, lastCall: 0, asked: false };
  void runTour();
}

function endTour(): void {
  if (!tour) return;
  tour = null;
  setFlag('pip_tour_done');
}

/** Pip's position against yours, in tiles (positive = you're east of him, behind). */
function gap(): { d: number; behind: number } {
  const w = WORLD!;
  const a = w.npcActor('pip');
  if (!a) return { d: 0, behind: 0 };
  return { d: Math.hypot(w.player.x - a.x, w.player.y - a.y) / TILE, behind: (w.player.x - a.x) / TILE };
}

/** If you wander off, Pip waits, then hollers. */
function waitOrCall(now: number): boolean {
  const t = tour!;
  const { d, behind } = gap();
  const a = pipActor();
  if (!a) return true;
  if (d > 9 && behind > -4) {
    if (a.path.length) a.stop();
    a.faceToward(WORLD!.player.x, WORLD!.player.y);
    if (!t.farSince) t.farSince = now;
    if (!t.asked) {
      t.asked = true;
      WORLD!.emote('pip', '?');
    }
    if (d > 15 && now - t.farSince > 5000 && now - t.lastCall > 11000) {
      t.lastCall = now;
      WORLD!.emote('pip', '!');
      audio.blip('pip');
      toast(['Pip: "HEY! NEW KID! It\'s THIS way!"', 'Pip: "You\'re going the wrong way! Unless it\'s a shortcut! Is it a shortcut?"', 'Pip: "I\'ll wait! I\'m good at waiting! I\'m not good at waiting!"'][Math.floor(now / 1000) % 3]);
    }
    return true;
  }
  t.farSince = 0;
  t.asked = false;
  return false;
}

async function runTour(): Promise<void> {
  while (tour) {
    await wait(150);
    const t = tour;
    if (!t) return;
    const w = WORLD;
    if (!w || w.map.id !== 'town' || game.blockers > 0 || w.busy) continue;
    const a = pipActor();
    if (!a) continue;
    t.pos = { x: a.tx, y: a.ty };
    const now = performance.now();
    if (t.stop >= STOPS.length) {
      await farewell();
      return;
    }
    const s = STOPS[t.stop];
    const there = Math.abs(a.tx - s.x) <= 1 && Math.abs(a.ty - s.y) <= 1;
    if (!there) {
      if (waitOrCall(now)) continue;
      t.walking = true;
      t.tx = s.x;
      t.ty = s.y;
      a.running = Math.abs(a.tx - s.x) > 10;
      if (!a.path.length) void w.walkTo('pip', s.x, s.y, 'up');
      continue;
    }
    // At the stop: wait for you, unless you've already gone on ahead.
    t.walking = false;
    a.running = false;
    if (!a.path.length) a.facing = 'up';
    const { d, behind } = gap();
    if (behind < -7) {
      t.stop++;
      continue;
    }
    if (d > 5) {
      waitOrCall(now);
      continue;
    }
    t.stop++;
    a.facing = 'up';
    w.emote('pip', s.emote);
    w.busy = true;
    try {
      await say(speakerFor('pip'), ...s.lines);
    } finally {
      w.busy = false;
    }
  }
}

async function farewell(): Promise<void> {
  const w = WORLD;
  if (!w || !tour) return;
  // The path up to Ropewood Lane, at the west end of Main.
  Object.assign(tour, { tx: 2, ty: 28, walking: true });
  await w.walkTo('pip', 2, 28, 'up');
  if (tour) tour.walking = false;
  for (let i = 0; i < 80 && tour; i++) {
    if (w.map.id !== 'town') return endTour();
    if (gap().d < 6 && game.blockers === 0 && !w.busy) break;
    await wait(150);
  }
  if (!tour || w.map.id !== 'town') return endTour();
  w.npcActor('pip')?.faceToward(w.player.x, w.player.y);
  w.busy = true;
  try {
    await say(speakerFor('pip'), "That's me, up that path. The house with the fort.", 'I have to be in when the streetlights come on. That is the LAW.', 'Keep going west till the road gets tired. That\'s the Dupree place.');
    w.emote('pip', '♥');
    await say(speakerFor('pip'), 'WEDNESDAY IS WRESTLING!');
  } finally {
    w.busy = false;
  }
  endTour();
  const a = w.npcActor('pip');
  if (a) {
    a.speed = 60;
    a.running = true;
  }
  await w.walkTo('pip', 2, 18);
  if (w.map.id === 'town' && !tour) w.despawn('pip');
}

// Clock ticks reschedule NPCs; while Pip is leading, keep him on the tour.
onTick(() => {
  const t = tour;
  const w = WORLD;
  if (!t || !w || w.map.id !== 'town') return;
  const a = pipActor();
  if (!a) return;
  a.stop();
  if (t.walking) void w.walkTo('pip', t.tx, t.ty);
});

onTalk(async (npcId) => {
  if (npcId !== 'pip' || !tour) return false;
  await say(speakerFor('pip'), TOUR_TALK[Math.floor(Math.random() * TOUR_TALK.length)]);
  return true;
});

onEnterMap((mapId) => {
  // Back out of a shop mid-tour: Pip's still where you left him.
  if (mapId === 'town' && tour) pipActor();
  if (mapId === 'farm') {
    endTour();
    placeRocker();
  }
  return false;
});

// ------------------------------------------------------------ Scene 4: the first evening

export async function farmArrival(): Promise<void> {
  placeRocker();
  await narrate(
    'The road runs out at a blue house with a sagging porch, and a rocking chair nobody has rocked in a long time.',
    "The weeds are up to your knees. Out back, under the vines: four corner posts and a sag of rope. Grandma's ring.",
  );
}

export async function firstNight(): Promise<void> {
  syncFridge();
  await narrate('Inside: dust sheets over everything, and a kitchen calendar still turned to October 1983.', 'Somebody stuck a note to the fridge with a magnet shaped like a crawfish.');
}

const FRIDGE_NOTE = [
  "October '83.",
  "To whoever's next in this house:",
  "Fridge is empty, don't bother. The good quilt is in the trunk. The bad quilt is also in the trunk. You'll know.",
  "The rocker on the porch squeaks on the third rock, not the second. It's only the rocker.",
  'Sit a spell before bed. Somebody ought to.',
];

/** Grandma's note on the fridge (surprises.ts owns the fridge door and calls this). */
export async function readFridgeNote(): Promise<void> {
  setFlag('dottie_fridge_note');
  syncFridge();
  await showLetter({ id: 'dottie-fridge', from: 'D.', body: FRIDGE_NOTE });
}

/** The rocker on the porch, left of the door: an invisible spot to sit. */
function placeRocker(): void {
  if (!WORLD) return;
  if (findProp('farm', 'sx-porch-rocker')) return;
  placeProp('farm', { id: 'sx-porch-rocker', kind: 'sx-hotspot', x: 9 * TILE + 6, y: 11 * TILE - 2, props: { action: 'porch-rocker', label: 'Sit' } });
}
onTick(() => {
  if (WORLD?.map.id === 'farm') placeRocker();
});

const PORCH_DAY = [
  'You rock. Third rock, squeak. A truck goes by on the road and the driver lifts two fingers off the wheel at you.',
  'You sit a minute. A wasp inspects the porch light, finds it wanting, and leaves.',
  'The ring out back creaks in the wind, like it is stretching.',
  'Somewhere in town a screen door bangs. Somewhere closer, a bird says the same thing nine times.',
];

/** Fade to a scene and back, resolving once the new picture is up. */
function fadeTo(change: () => void): Promise<void> {
  return new Promise((r) => {
    if (!game.scenes.transition(() => {
      change();
      setTimeout(r, 330);
    })) {
      change();
      r();
    }
  });
}

async function porchNight(first: boolean): Promise<void> {
  audio.music('night', { fade: 1.5 });
  const sky = new PorchSky(first ? 10 : 6);
  await fadeTo(() => game.scenes.push(sky));
  // The picture tilts from the yard to the sky on its own while the lines are up.
  await wait(1600);
  await narrate(first ? 'Out past the weeds, the fireflies work the old ring like a sold-out house. On. Off. On.' : 'The fireflies are back on the ring. Same seats as last time.');
  if (first) await narrate('The rocker squeaks on the third rock. Not the second.');
  await wait(first ? 3200 : 2600);
  if (first) await narrate('Somewhere in town a screen door bangs, and a kid yells WEDNESDAY IS WRESTLING at nobody in particular.');
  else await wait(1200);
  await fadeTo(() => {
    if (game.scenes.top === sky) game.scenes.pop();
  });
  WORLD?.playMapMusic();
}

onAction('porch-rocker', async () => {
  const w = WORLD;
  if (!w) return;
  w.player.facing = 'down';
  audio.sfx('door', { volume: 0.25, pitch: 1.6 });
  const night = G.time.minutes >= 19 * 60 + 30 || G.time.minutes < 5 * 60;
  if (absDay() === 0 && !G.flags['porch_sat']) {
    await porchNight(true);
    setFlag('porch_sat');
    noteToday('porch');
    hint('The bed in the back room sleeps and saves. Days run 6 AM to 2 AM.');
    return;
  }
  if (night) {
    await porchNight(false);
    return;
  }
  await narrate(PORCH_DAY[(absDay() + Math.floor(G.time.minutes / 60)) % PORCH_DAY.length]);
  if (G.flags['porch_rest'] !== absDay()) {
    G.flags['porch_rest'] = absDay();
    G.player.energy = Math.min(G.player.maxEnergy, G.player.energy + 5);
  }
});

