/**
 * Festival days and the fairground attractions.
 *
 * The four supershow Saturdays (the 27th of each season) are festival days:
 * the fair is decorated, half the town spends the late morning there, and the
 * stage hosts something. On any day the attractions work: the Ferris wheel
 * (a ride over town), Madame Fortunata (fortunes that sometimes come true),
 * Wanda's pen, and the strongman bell (a timing tap).
 */
import { audio } from '../audio';
import { game } from '../core/game';
import { addItem, ext, G, hasItem, hearts, rel, skillLevel } from '../core/state';
import { sting } from '../core/sting';
import { absDay, isSupershow } from '../core/time';
import { NPC_BY_ID, NPCS, type DayCtx, type ScheduleEntry } from '../data/npcs';
import { ITEMS, item, type ItemDef } from '../data/items';
import { setFestivalView } from '../gfx/world/charm';
import { iconFor } from '../gfx/icons';
import { choose, narrate, say, toast } from '../ui/dialog';
import { onAction, onNewDay } from '../world/hooks';
import { WORLD, WorldScene } from '../world/scene';
import { speakerFor } from '../world/talk';
import { swingFor } from '../activities/strongman/logic';
import { showLore } from './lore';
import type { Scene } from '../core/scene';

const H = (h: number, m = 0) => h * 60 + m;

// ---------------------------------------------------------------- what day is it

/** The fair's name on each season's festival day. */
export const FESTIVAL_NAMES = ['Thaw Brawl Fair', 'Fairgrounds Fury', 'Harvest Havoc Fair', 'Homecoming Lights'] as const;

export function isFestival(): boolean {
  return isSupershow();
}
export function festivalName(season = G.time.season): string {
  return FESTIVAL_NAMES[season % 4];
}

setFestivalView(() => ({ on: isFestival(), name: festivalName(), season: G.time.season % 4 }));

interface FestivalState {
  /** Absolute day of the last fortune, ferris ride, pen visit, stage show. */
  fortuneDay: number;
  fortunes: string[];
  petDay: number;
  honeyDay: number;
  stageDay: number;
  swingDay: number;
  swingsToday: number;
  bellRings: number;
  rides: number;
}
export function festivalState(): FestivalState {
  return ext<FestivalState>('festival', () => ({ fortuneDay: -1, fortunes: [], petDay: -1, honeyDay: -1, stageDay: -1, swingDay: -1, swingsToday: 0, bellRings: 0, rides: 0 }));
}

function gain(id: string, n = 1): void {
  addItem(id, n);
  toast(`+${n} ${item(id).name}`, iconFor(id));
}
function pay(n: number, what: string): boolean {
  if (G.player.money < n) {
    toast(`${what} costs $${n}. You're short.`);
    audio.sfx('error');
    return false;
  }
  G.player.money -= n;
  audio.sfx('coin');
  return true;
}

// Keepsakes from the fair, registered at runtime so items.ts stays untouched.
const FAIR_ITEMS: ItemDef[] = [
  { id: 'ribbon-bell', name: 'Bell Ringer Ribbon', desc: 'A blue ribbon from the strongman tower. HALL OF FAME, it says, in gold.', cat: 'wrestling', price: 0, icon: { shape: 'flower', color: '#4e6a93', accent: '#f4b63f' } },
  { id: 'ribbon-pumpkin', name: 'Pumpkin Weigh-Off Ribbon', desc: 'Heaviest Pumpkin, Harvest Havoc Fair. Gus read your name like a title change.', cat: 'wrestling', price: 0, icon: { shape: 'flower', color: '#e8843a', accent: '#f4b63f' } },
  { id: 'fortune-card', name: 'Fortune Card', desc: 'From Madame Fortunata. Keep it. She hates to repeat herself.', cat: 'flea', price: 1, icon: { shape: 'card', color: '#6a4f88', accent: '#f4b63f' } },
];
for (const it of FAIR_ITEMS) ITEMS[it.id] ??= it;

// ---------------------------------------------------------------- the town comes to the fair

interface FestSpot {
  id: string;
  x: number;
  y: number;
  facing?: string;
  idle?: ScheduleEntry['idle'];
  /** Only on these seasons' festivals. */
  seasons?: number[];
}

/** Who spends the festival's late morning at the fairgrounds, and where. */
export const FESTIVAL_SPOTS: FestSpot[] = [
  { id: 'pip', x: 12, y: 20, idle: 'wander' },
  { id: 'agnes', x: 21, y: 23, facing: 'down', idle: 'still' },
  { id: 'oakes', x: 26, y: 23, facing: 'down', idle: 'wave' },
  { id: 'bev', x: 12, y: 16, facing: 'right', idle: 'still' },
  { id: 'fenwick', x: 33, y: 18, idle: 'wander' },
  { id: 'nadia', x: 18, y: 22, facing: 'left', idle: 'still' },
  { id: 'clementine', x: 29, y: 22, idle: 'wander' },
  { id: 'patty', x: 36, y: 22, facing: 'right', idle: 'still' },
  { id: 'dex', x: 37, y: 18, idle: 'wander' },
  { id: 'hazel', x: 24, y: 18, idle: 'wander' },
  { id: 'marigold', x: 19, y: 16, idle: 'wander' },
  { id: 'lou', x: 33, y: 23, facing: 'down', idle: 'still' },
  { id: 'mo', x: 27, y: 19, idle: 'wander' },
  { id: 'gideon', x: 22, y: 16, idle: 'wander' },
  { id: 'sami', x: 28, y: 24, facing: 'down', idle: 'still', seasons: [3] },
  { id: 'grandma', x: 24, y: 23, facing: 'down', idle: 'still', seasons: [3] },
  { id: 'lacey', x: 24, y: 24, facing: 'down', idle: 'wave', seasons: [0] },
  { id: 'buck', x: 28, y: 23, facing: 'down', idle: 'wave', seasons: [0, 2] },
  { id: 'bo', x: 30, y: 21, idle: 'still', seasons: [2] },
  { id: 'tiny', x: 23, y: 21, facing: 'down', idle: 'still', seasons: [1] },
  { id: 'gus', x: 25, y: 24, facing: 'down', idle: 'wave' },
];
export const FESTIVAL_FROM = H(10);
export const FESTIVAL_TO = H(15, 30);

/** Wrap a schedule so that on festival days it detours through the fair. */
export function festivalSchedule(list: ScheduleEntry[], f: FestSpot, c: DayCtx): ScheduleEntry[] {
  if (!c.supershow || (f.seasons && !f.seasons.includes(c.season))) return list;
  const sorted = [...list].sort((a, b) => a.at - b.at);
  const before = sorted.filter((e) => e.at < FESTIVAL_TO);
  const resume = before[before.length - 1] ?? sorted[sorted.length - 1];
  const kept = sorted.filter((e) => e.at < FESTIVAL_FROM || e.at >= FESTIVAL_TO);
  const out: ScheduleEntry[] = [...kept, { at: FESTIVAL_FROM, map: 'fair', x: f.x, y: f.y, facing: f.facing ?? 'down', idle: f.idle ?? 'wander' }];
  if (resume && !kept.some((e) => e.at === FESTIVAL_TO)) out.push({ ...resume, at: FESTIVAL_TO });
  return out;
}

for (const f of FESTIVAL_SPOTS) {
  const def = NPC_BY_ID[f.id];
  if (!def) continue;
  const orig = def.schedule;
  def.schedule = (c) => festivalSchedule(orig(c), f, c);
}
// NPCS is the same objects; keep the reference so tree-shaking can't drop the wrap.
void NPCS.length;

onNewDay(() => {
  if (isFestival()) toast(`${festivalName()} at the fairgrounds today, 10 to 3:30. The show is tonight.`);
  const fs = festivalState();
  if (fs.swingDay !== absDay()) fs.swingsToday = 0;
});

// ---------------------------------------------------------------- the Ferris wheel

/** Who might ride with you, and what they say at the top. Public, so in character. */
export const RIDE_LINES: Record<string, string[]> = {
  agnes: ['I rode this with my sister in 1958. She screamed the whole way up.', 'She is eighty-three now and I still bring it up at Thanksgiving.'],
  lou: ['Top of the wheel, young\'un. Everybody goes quiet up here. Even me.', 'Look at that creek, shining like it has somewhere to be. It doesn\'t. Neither do we.'],
  birdie: ['There\'s the Sportatorium. Look at that roof.', 'I\'ve got forty tomato plants up there and nobody down there knows it. ...Well. Now you do, sugar.'],
  hazel: ['I don\'t love heights since the knee.', '...You can hold my hand. Just until the top. Then I\'m fine. Then I\'m great.'],
  dex: ['From up here the gas station looks like a toy.', 'I could dropkick off this thing. I won\'t. Probably. Don\'t look at me like that.'],
  gideon: ['The light up here is doing wonderful things for my profile.', '...The town, too. The town looks lovely. Second loveliest thing in the gondola.'],
  mo: ['Mo counts the streetlights out loud, in threes, and loses track at the water tower.', '"That\'s where I am at twenty to six," she says. She doesn\'t explain.'],
  gus: ['Ladies and gentlemen... from the top of the Ferris wheel... THE WHOLE TOWN!', '...Sorry. Habit. Forty years. It\'s a lot of town, though, isn\'t it?'],
  nadia: ['Nadia checked the gondola bolts twice before you got on. At the top she breathes out for the first time.', '"Okay. Okay. This is nice. You are not allowed to rock it."'],
  sami: ['"Jiddo rode this every year until he was eighty," Sami says.', '"He\'d wave at the whole town from the top like they could see him. Some of them could."'],
  clementine: ['Clementine reviews the view. "Four stars. The water tower is doing a lot of work."', '"The creek is underused. I\'ll be kinder in print."'],
  fenwick: ['Fenwick spends the whole ride scanning the tree line with binoculars.', 'At the top he lowers them and says, very softly, "Nothing. But a good nothing."'],
  bev: ['Sheriff Bev uses the height to check traffic. "One car. Two raccoons. Quiet day."', 'She sounds a little disappointed, and a little relieved, and she writes it down.'],
  patty: ['Coach Patty grips the safety bar. "This wheel is going exactly as fast as the sign says."', '"Huh." It is the closest thing to trust you have ever heard from her.'],
  oakes: ['Mayor Oakes holds out her arms over the town like she is presenting it on a game show.', '"A tram," she says. "From the square to right here. Think about it." You think about it.'],
  marigold: ['Marigold studies everyone\'s outfits from above. "From up here you can tell who hemmed their own pants."', 'They are completely delighted by this.'],
  mariposa: ['La Mariposa writes on a notepad, tears off the page and hands it to you: *THE TOWN IS SMALL FROM HERE. I LIKE IT SMALL.*', 'Then she takes the note back and keeps it.'],
  earl: ['The Mountain says nothing the whole way up.', 'At the top he points, once, at the library, and nods, like he is checking it is still there.'],
  tiny: ['Tiny folds into the gondola knees first and apologizes to it.', 'At the top she whispers, "Everything\'s small from up here. Everything," and she sounds very happy.'],
  lacey: ['Lacey points out her dad\'s truck in the lot. "He says he\'s at a livestock auction on Saturdays."', '"Comes home smelling like a gym. Auctions must be intense." She shrugs.'],
  grandma: ['"I have been higher than this, cher. Top rope, Amarillo, 1979."', 'Then she holds your sleeve the rest of the way, very lightly, like she\'s checking you\'re still there.'],
};

function viewLine(): string {
  const m = G.time.minutes;
  if (m >= H(20, 30) || m < H(5, 30)) return 'Night. The streetlights draw Main Street in dots, the marquee is lit, and the red light on the water tower blinks once, and once, and once.';
  if (m >= H(17)) return 'Golden hour. Every window on Main Street is on fire, and the creek is a long ribbon of it.';
  if (G.weather.today === 'rain' || G.weather.today === 'storm') return 'Rain over town. Everything is gray-green and soft, and the water tower wears a little cloud like a hat.';
  if (G.time.season === 3) return 'Snow on every roof. The whole town looks like it has been iced by someone very patient.';
  return 'The whole town laid out like a kitchen table: Main Street, the square, the creek bending around it, the water tower standing guard in red.';
}

/** A camera ride over town in a gondola frame. */
class FerrisRide implements Scene {
  private t = 0;
  constructor(private view: WorldScene) {}
  update(dt: number): void {
    this.t += dt;
    this.view.update(dt);
  }
  render(ctx: CanvasRenderingContext2D): void {
    this.view.render(ctx);
    const { w, h } = game.screen;
    // A slow sway, then the gondola frame: canopy, safety bar, side posts.
    const sway = Math.sin(this.t * 1.3) * 1.5;
    ctx.save();
    ctx.fillStyle = 'rgba(28,20,38,0.25)';
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
    g.addColorStop(0, 'rgba(43,33,64,0)');
    g.addColorStop(1, 'rgba(43,33,64,0.55)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#2b2140';
    ctx.fillRect(0, 0, w, 18 + sway);
    ctx.fillStyle = '#b04a3f';
    ctx.fillRect(0, 14 + sway, w, 4);
    for (let x = 0; x < w; x += 12) {
      ctx.fillStyle = x % 24 ? '#fbf0d9' : '#c9404c';
      ctx.fillRect(x, 18 + sway, 12, 5);
    }
    ctx.fillStyle = '#2b2140';
    ctx.fillRect(0, h - 22 - sway, w, 22 + sway);
    ctx.fillStyle = '#c99a48';
    ctx.fillRect(0, h - 34 - sway, w, 3);
    ctx.fillStyle = '#8a6229';
    ctx.fillRect(0, h - 31 - sway, w, 1);
    for (const x of [10, w - 14]) {
      ctx.fillStyle = '#8a6229';
      ctx.fillRect(x, 18 + sway, 4, h - 40);
      ctx.fillStyle = '#c99a48';
      ctx.fillRect(x, 18 + sway, 1, h - 40);
    }
    ctx.restore();
  }
}

function rideCompanion(): string | null {
  const here = WORLD ? [...WORLD.npcs.keys()] : [];
  let best: string | null = null;
  let bh = 1;
  for (const id of here) {
    if (!RIDE_LINES[id]) continue;
    const h = hearts(id);
    if (h > bh) {
      bh = h;
      best = id;
    }
  }
  return best;
}

async function rideFerris(): Promise<void> {
  const m = G.time.minutes;
  if (m < H(10) || m >= H(22)) {
    await narrate('The wheel is still. A chain across the ramp, and a sign in Clint\'s handwriting: *CLOSED. GO HOME. (NICELY.)*');
    return;
  }
  const c = await choose(null, 'The Ferris wheel. $3 a ride, says a cigar box on the operator\'s stool.', [
    { label: 'Ride ($3)', value: 'ride', style: 'primary' },
    { label: 'Not now', value: 'no' },
  ], { cancelValue: 'no' });
  if (c !== 'ride' || !pay(3, 'A ride')) return;
  const fs = festivalState();
  const who = rideCompanion();
  const world = WORLD;
  if (!world) return;
  const saved = { map: G.player.map, x: G.player.x, y: G.player.y, facing: G.player.facing };
  const hold: { ride: FerrisRide | null } = { ride: null };
  await new Promise<void>((resolve) => {
    const ok = game.scenes.transition(() => {
      const view = new WorldScene({ attract: { map: 'town', x0: 99, y0: 17, x1: 38, y1: 44, seconds: 18 } });
      Object.assign(G.player, saved);
      hold.ride = new FerrisRide(view);
      game.scenes.push(hold.ride);
      resolve();
    });
    if (!ok) resolve();
  });
  const ride = hold.ride;
  if (!ride) return;
  await new Promise((r) => setTimeout(r, 900));
  const first = fs.rides === 0;
  fs.rides++;
  if (who) {
    await narrate(first ? 'The gondola rocks once and then rises, and the fair shrinks to a toy under your shoes.' : 'Up you go.');
    await say(speakerFor(who), ...RIDE_LINES[who]);
    rel(who).points += 15;
  } else {
    await narrate(
      "Clint swings the gondola door shut and gives the safety bar a tug. \"Keep your hands in. Wave with your face.\"",
      'The wheel climbs, and at the very top it stops, the way it always does, for exactly long enough.',
    );
  }
  await narrate(viewLine());
  await new Promise<void>((resolve) => {
    const ok = game.scenes.transition(() => {
      if (game.scenes.top === ride) game.scenes.pop();
      resolve();
    });
    if (!ok) {
      if (game.scenes.top === ride) game.scenes.pop();
      resolve();
    }
  });
  G.time.minutes += 20;
}

onAction('ferris', () => rideFerris());

// ---------------------------------------------------------------- Madame Fortunata

interface Fortune {
  id: string;
  text: string;
  /** Flag the lore table (or a system) reads to make it come true later. */
  flag?: string;
}
export const FORTUNES: Fortune[] = [
  { id: 'bear', text: 'A BEAR WILL BOW TO YOU BEFORE A PERSON DOES.', flag: 'fortune_bear' },
  { id: 'stool', text: 'BEWARE THE THIRD STOOL FROM THE LEFT.', flag: 'fortune_stool' },
  { id: 'tomato', text: 'SOMETHING RED IS COMING. IT IS NOT TROUBLE.', flag: 'fortune_tomato' },
  { id: 'bell', text: 'THE BELL WILL RING FOR YOU ON THE SECOND TRY.', flag: 'fortune_bell' },
  { id: 'chair', text: 'A CHAIR HAS BEEN WAITING A LONG TIME. NOT FOR YOU. GO SEE IT ANYWAY.', flag: 'fortune_chair' },
  { id: 'bingo', text: 'ON A WEDNESDAY YOU WILL WIN A GAME YOU DID NOT KNOW YOU WERE PLAYING.', flag: 'fortune_bingo' },
  { id: 'knock', text: 'TWO KNOCKS MEANS ARE YOU AWAKE. LISTEN FOR WHAT COMES AFTER.' },
  { id: 'wings', text: 'SOMETHING WITH WINGS KNOWS YOUR ADDRESS.' },
  { id: 'pretzel', text: "DO NOT ACCEPT THE RACCOON'S FIRST OFFER." },
  { id: 'spoon', text: 'YOU WILL SEE YOURSELF UPSIDE DOWN IN A SPOON. IT WILL BE A GOOD DAY ANYWAY.' },
  { id: 'umbrella', text: 'BRING AN UMBRELLA. NOT FOR RAIN.' },
  { id: 'number', text: 'YOUR LUCKY NUMBER IS WHEREVER THE REFEREE STOPS.' },
];

/** The next fortune: payoffs first, then the rest, then around again. */
export function nextFortune(given: string[]): Fortune {
  return FORTUNES.find((f) => !given.includes(f.id)) ?? FORTUNES[given.length % FORTUNES.length];
}

async function fortuneTent(): Promise<void> {
  const fs = festivalState();
  const today = absDay();
  if (!G.flags['met_fortunata']) {
    G.flags['met_fortunata'] = true;
    await narrate(
      'Inside the purple tent, a glass booth with a carved wooden woman in a turban, eyes painted wide. A brass plate: *MADAME FORTUNATA. 25¢.*',
      'A smaller plate under it: *Bought from a traveling carnival that wintered here in 1958. She has not been wrong yet. She has been early.*',
    );
  }
  if (fs.fortuneDay === today) {
    await narrate('The slot has a card in it already, printed in the same tired purple ink: *ONE PER CUSTOMER PER DAY. I AM NOT A VENDING MACHINE.*');
    return;
  }
  const c = await choose(null, 'Feed Madame Fortunata? (She doesn\'t make change. $1.)', [
    { label: 'Ask for a fortune ($1)', value: 'yes', style: 'primary' },
    { label: 'Not today', value: 'no' },
  ], { cancelValue: 'no' });
  if (c !== 'yes' || !pay(1, 'A fortune')) return;
  fs.fortuneDay = today;
  const f = nextFortune(fs.fortunes);
  if (!fs.fortunes.includes(f.id)) fs.fortunes.push(f.id);
  if (f.flag) G.flags[f.flag] = true;
  audio.sfx('static', { volume: 0.4 });
  await narrate('Her glass eyes light up. A wooden hand passes over a crystal ball with a crack in it, twice, like she is making up her mind. A card slides out of the slot.');
  sting('spooky');
  await narrate(`*${f.text}*`);
  gain('fortune-card');
}

onAction('tent-fortune', () => fortuneTent());

// ---------------------------------------------------------------- Wanda's pen

async function wandaPen(): Promise<void> {
  const fs = festivalState();
  const today = absDay();
  const winter = G.time.season === 3;
  const opts = [
    ...(hasItem('honey') ? [{ label: 'Offer her honey', value: 'honey', hint: fs.honeyDay === today ? 'She has had some today' : 'From the jar, with a spoon' }] : []),
    { label: 'Scratch her back through the fence', value: 'pet', hint: 'Clint says this is allowed' },
    { label: 'Just watch her for a while', value: 'watch' },
    { label: 'Leave her be', value: 'no' },
  ];
  const c = await choose(null, winter ? "Wanda's pen. A hand-lettered sign on the gate: *WANDA (WINTER HOURS: MOSTLY NAPS).*" : "Wanda's pen. A hand-lettered sign on the gate: *WANDA. PLEASE BE POLITE. SHE IS.*", opts, { cancelValue: 'no' });
  if (c === 'no') return;
  const bow = async () => {
    WORLD?.emote('wanda', '♥');
    if (G.flags['fortune_bear'] && !G.flags['fortune_bear_done']) {
      G.flags['fortune_bear_done'] = true;
      await narrate('Wanda bows to you, a full bear bow, paws together. Nobody else has bowed to you today.', 'Madame Fortunata said a bear would get there first. Madame Fortunata is having a very good week.');
    }
  };
  if (c === 'honey') {
    if (fs.honeyDay === today) {
      await narrate('Wanda looks at the honey, then at you, then at the honey. Then she looks away, very politely, because she has already had some today and she knows it.');
      return;
    }
    fs.honeyDay = today;
    addItem('honey', -1);
    rel('wanda').points += 40;
    await narrate(
      'You hold a spoonful of honey through the fence. Wanda takes it like a duchess taking a teacup.',
      'She presses her paws together, closes her eyes, and makes a sound like a happy cello. Then she bows. You bow back. She bows deeper.',
    );
    await bow();
    return;
  }
  if (c === 'pet') {
    if (fs.petDay !== today) {
      fs.petDay = today;
      rel('wanda').points += 15;
    }
    WORLD?.emote('wanda', '♪');
    await narrate(winter
      ? 'You reach through the boards. Her coat is thick as a rug and warm underneath. She leans into your hand and makes a sleepy sound, like a cello somebody is carrying downstairs.'
      : 'You scratch the spot between her shoulders through the fence. Wanda leans, very gently, all three hundred pounds of her, against the boards near your hand.');
    await bow();
    return;
  }
  const m = G.time.minutes;
  const watch = isFestival()
    ? 'Wanda is wearing her tiny gold crown on its elastic. Every few minutes she bows to whoever is at the fence. The line to be bowed to goes past the lemonade stand.'
    : winter
      ? 'Wanda is wearing something knitted, rose-gold, with very tight stitches. She seems to know she looks good.'
      : m < H(11)
        ? 'Wanda is in her pond up to the shoulders, floating with an expression of total peace. A duck is sharing the pond and pretending not to be nervous.'
        : m < H(16)
          ? 'Wanda is asleep on her stump, sitting up, like a judge who has heard enough for one day.'
          : 'Wanda is sitting at the fence watching people go by, the way you might watch a slow river. When someone waves, she lifts one paw.';
  await narrate(watch);
}

onAction('bear-pen', () => wandaPen());

// ---------------------------------------------------------------- the strongman bell

const BELL_PRIZES = ['lemonade', 'funnel-cake', 'corn-dog', 'honey'];
const TIER_LINES = [
  'The puck hops up to *PIP-WEIGHT* and slides back down like it is embarrassed for both of you.',
  '*OPENER*. Respectable. Somebody behind you claps twice, then stops when nobody joins in.',
  '*UNDERCARD*. A kid at the fence says "ooh" and means it.',
  '*MIDCARD*. The puck hangs there for a second, thinking about the bell, and decides not today.',
  '*MAIN EVENT*. The puck taps the underside of the bell so softly it only rings in your heart.',
];

async function strongman(): Promise<void> {
  const fs = festivalState();
  const today = absDay();
  if (fs.swingDay !== today) {
    fs.swingDay = today;
    fs.swingsToday = 0;
  }
  if (!G.flags['met_strongman']) {
    G.flags['met_strongman'] = true;
    await narrate('The strongman tower: a tall red plank, a brass bell at the top, and marks painted up the side from *PIP-WEIGHT* to *HALL OF FAME*. A mallet leans against it, the handle worn smooth.', 'A coffee can on a post: *HONOR SYSTEM. $1 A SWING.*');
  }
  const c = await choose(null, 'Swing for the bell? ($1, 4 energy)', [
    { label: 'Swing', value: 'swing', style: 'primary' },
    { label: 'Not now', value: 'no' },
  ], { cancelValue: 'no' });
  if (c !== 'swing') return;
  if (G.player.energy < 4) {
    toast('Your arms are noodles. Eat something first.');
    audio.sfx('error');
    return;
  }
  if (!pay(1, 'A swing')) return;
  G.player.energy -= 4;
  fs.swingsToday++;
  const { playStrongman } = await import('../activities/strongman/game');
  const r = await playStrongman(swingFor(skillLevel('strength'), Math.random));
  G.player.skills.strength += r.rang ? 5 : 1;
  if (!r.rang) {
    await narrate(TIER_LINES[Math.min(TIER_LINES.length - 1, r.tier)]);
    return;
  }
  fs.bellRings++;
  WORLD?.fx.burst(WORLD.player.x, WORLD.player.y - 30, 16, ['#f4b63f', '#fff4dc', '#c9404c'], { kind: 'confetti', speed: 60, gravity: 50 });
  if (fs.swingsToday === 2 && G.flags['fortune_bell'] && !G.flags['fortune_bell_done']) {
    G.flags['fortune_bell_done'] = true;
    await narrate('*DING.* On the second swing, exactly like the card said.', 'Somewhere behind the purple tent, a wooden woman in a turban is not smiling, because she is carved that way, but she would be.');
  } else if (fs.bellRings === 1) {
    await narrate('*DING.* The whole midway turns around. The bell keeps humming after, a long time, like it has been waiting to say something.');
  } else await narrate(isFestival() ? '*DING.* A cheer goes up from the festival crowd, mostly from Pip.' : '*DING.* A pigeon on the stage roof takes off, offended.');
  if (fs.bellRings === 1) {
    gain('ribbon-bell');
    sting('item-get');
  } else gain(BELL_PRIZES[fs.bellRings % BELL_PRIZES.length]);
}

onAction('strongman', () => strongman());

// ---------------------------------------------------------------- the stage

async function stageShow(): Promise<boolean> {
  if (!isFestival() || G.time.minutes < FESTIVAL_FROM || G.time.minutes >= FESTIVAL_TO) return false;
  const fs = festivalState();
  const today = absDay();
  const again = fs.stageDay === today;
  fs.stageDay = today;
  const gus = speakerFor('gus');
  switch (G.time.season % 4) {
    case 0: {
      if (again) {
        await narrate('The Folding Chairs are on their third encore. Nobody asked for the third one. Everybody is staying for it.');
        return true;
      }
      await say(gus, 'Ladies and gentlemen... for the first time on a stage with an actual roof... THE FOLDING CHAIRS!');
      await narrate(
        'Lacey hits the first note on her bass and the amp cuts out. Buck, on harmonica, fills the silence with a solo that goes on for four minutes.',
        'When the amp comes back, the whole fairground is clapping on the off-beat, which is the beat Lacey wanted all along.',
      );
      gain('cassette');
      return true;
    }
    case 1: {
      if (again) {
        await narrate('The pie table is just crumbs and ribbons now. Agnes is letting people hold the blue one, briefly, supervised.');
        return true;
      }
      await say(gus, 'The county pie contest! Judged by the Honorable Mayor Delphine Oakes and her extremely large scissors!');
      await narrate(
        'Two pies left on the table. Agnes Pickett\'s cherry lattice, and Tiny Tallbridge\'s, which is the same pie, smaller, with a lattice you need a magnifying glass to admire.',
        'The Mayor tastes both and takes a long time. Then she pins the blue ribbon on Agnes, and Tiny claps the loudest of anybody, and means it, and also does not.',
      );
      gain('pie');
      return true;
    }
    case 2: {
      if (hasItem('crop-pumpkin') && !G.flags['pumpkin_ribbon']) {
        const c = await choose(gus, 'The Harvest pumpkin weigh-off! Any more entrants? Anybody? Going once...', [
          { label: 'Enter your pumpkin', value: 'yes', style: 'primary' },
          { label: 'Just watch', value: 'no' },
        ], { cancelValue: 'no' });
        if (c === 'yes') {
          G.flags['pumpkin_ribbon'] = true;
          await narrate('You set your pumpkin on the feed scale. The needle swings, wobbles, and settles past Bo\'s and past Buck\'s, which weighed exactly the same, which neither of them will discuss.');
          await say(gus, 'Ladies and gentlemen... grown in the soil of the Dupree place... your NEWWWW Harvest Havoc pumpkin champion... {ring}!');
          sting('champion');
          gain('ribbon-pumpkin');
          await narrate('Gus hands the pumpkin back. "Keep it. It\'s a champion now. Champions go home with the people who raised them."');
          return true;
        }
      }
      await narrate(again
        ? 'The weigh-off is over. Bo and Buck are standing on either side of two identical pumpkins, not speaking, both visibly proud.'
        : 'Gus calls the pumpkin weigh-off like a title fight. Bo\'s pumpkin and Buck\'s pumpkin weigh exactly the same, to the ounce. The brothers do not speak to each other until supper.');
      return true;
    }
    default: {
      if (again) {
        await narrate('The choir is doing the one about the snow again. Somebody in the back row is a full verse behind and nobody minds.');
        return true;
      }
      await narrate(
        'The Evening Bell choir, in matching scarves, with Sami on ukulele. They sing something old about a porch light left on for somebody, and half the crowd knows the words.',
        G.flags['grandma_in_town'] ? 'On the last verse, one voice from the front row sings it in French instead, a half-beat slow, on purpose. Nobody turns around. Everybody hears it.' : 'On the last verse Farid stands up in the front row to conduct, and Sami lets him.',
      );
      rel('sami').points += 10;
      return true;
    }
  }
}

onAction('fair-stage', async ({ object, mapId }) => {
  if (await stageShow()) return;
  await showLore(object, mapId);
});
