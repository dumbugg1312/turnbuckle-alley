import { audio } from '../audio';
import { game } from '../core/game';
import { G, ext, addItem, hearts, rel } from '../core/state';
import { sting } from '../core/sting';
import { absDay, weekday } from '../core/time';
import { item } from '../data/items';
import { iconFor } from '../gfx/icons';
import { choose, narrate, say, toast } from '../ui/dialog';
import { onAction, onEnterMap, onNewDay, onTalk } from '../world/hooks';
import { WORLD } from '../world/scene';
import { speakerFor } from '../world/talk';
import { TILE, type MapObject } from '../world/types';
import { noteToday } from './daylog';
import { LETTER_READ_HOOKS, sendLetter, type Letter } from './mail';
import { morningOvernight } from './morning';
import { clearProps, placeProp, removeProp } from './runtime-props';
import { PIP_DRAWINGS, rollSurprise, type SurpriseId, type SurpriseRecord } from './surprise-pick';
import './surprise-props';

/**
 * Small morning surprises (about three mornings in ten): a pie on the sill,
 * a raccoon in the bin, Pip's drawings in the mailbox, Hank's hound asleep on
 * the porch. surprise-pick.ts decides which; this file puts it in the world
 * and handles finding it. Pip's drawings end up on Grandma's fridge.
 */
interface SurpriseState {
  history: SurpriseRecord[];
  today: { id: SurpriseId; day: number; done: boolean } | null;
  /** Pip's drawings pinned to the fridge, in the order they came. */
  drawings: number[];
  /** How many postcards Arlo has sent. */
  postcards: number;
}
export function surpriseState(): SurpriseState {
  return ext<SurpriseState>('surprises', () => ({ history: [], today: null, drawings: [], postcards: 0 }));
}

const px = (tx: number, ty: number) => ({ x: Math.round(tx * TILE), y: Math.round(ty * TILE) });
const FARM = 'farm';
const PREFIX = 'sx-s-';

function gain(id: string, n = 1): void {
  addItem(id, n);
  toast(`+${n} ${item(id).name}`, iconFor(id));
}

function finish(o?: MapObject): void {
  const s = surpriseState();
  if (s.today && !s.today.done) {
    s.today.done = true;
    noteToday(`surprise:${s.today.id}`);
  }
  if (o) {
    WORLD?.fx.burst(o.x, o.y - 6, 8, ['#fff4dc', '#f4b63f', '#c8c4d4'], { kind: 'star', speed: 30, gravity: 30 });
    removeProp(FARM, o.id);
  }
}

// ------------------------------------------------------------ Pip's drawings
export const PIP_DRAWING_TEXT: { title: string; body: string[] }[] = [
  { title: 'You, slamming a cloud', body: ['(A crayon drawing on the back of a spelling test. The test got an A.)', 'It is you, body-slamming a cloud. The cloud is labeled CLOUD.', 'Along the bottom, in silver marker: *FOR YOUR FRIDGE. EVERYBODY HAS A FRIDGE.*'] },
  { title: 'The Mountain, far away', body: ['(Crayon, both sides.)', 'Front: you and the Mountain. The Mountain is drawn very small and very far away, "so he is not scary."', 'Back: Bruiser the hermit crab, wearing a belt.'] },
  { title: 'Four hundred stick people', body: ['(The Sportatorium, packed with about four hundred stick people.)', 'One of them is circled. An arrow says *ME.* Another arrow points at the rafters and says *ALSO ME (I CLIMBED).* A third arrow says *JUST KIDDING.*'] },
  { title: 'Pie smoke', body: ["(Your house, with a lot of smoke coming out of the chimney.)", "A note on the back: *IT IS NOT ON FIRE. IT IS PIE SMOKE.*"] },
  { title: 'Third biggest', body: ['(You, holding a belt over your head, with the whole town around you, waving.)', 'Dex is the biggest. Pip is the second biggest. You are the third biggest, which he explains on the back is "still really good."'] },
  { title: 'The secret route', body: ['(A map of town. The water tower is the size of a mountain.)', 'A dotted line runs from his house to yours: *SECRET ROUTE. 14 MINUTES IF YOU RUN. 40 IF YOU STOP FOR BUGS.*'] },
  { title: 'Tag team champs', body: ['(Two people in a ring, holding their hands up. One of them has a towel cape.)', 'Title, in very large letters: *TAG TEAM CHAMPS (SOMEDAY).*'] },
  { title: 'The porch', body: ["(Grandma's porch, with the rocking chair. Somebody small is sitting in it, and somebody bigger is sitting on the step.)", 'No words on this one. Just a sun with a face, winking.'] },
];

LETTER_READ_HOOKS.push((l: Letter) => {
  const m = /^sx-pip-drawing-(\d+)-/.exec(l.id);
  if (!m) return;
  const s = surpriseState();
  const i = Number(m[1]);
  if (!s.drawings.includes(i)) s.drawings.push(i);
  noteToday('drawing');
  noteToday('surprise:pip-drawing');
  syncFridge();
  toast("Pinned to Grandma's fridge.");
});

const ARLO_POSTCARDS: string[][] = [
  ['(A postcard of the MaxxMedia tower at night. Someone has drawn a tiny wrestling ring on the roof in ballpoint.)', 'Royce asked where you went. I said "the territories" in a spooky voice. He has not asked again.', 'Your desk has a new person. He clips slams. He is fine. Send a tape. Any tape.'],
  ['(A postcard of a bridge, very blue, very empty.)', 'I watched a whole match last night. All forty minutes. On purpose. I had to lie down after.', 'The vending machine honey bun finally fell. Nobody bought it. It just let go.'],
  ['(A postcard of the city zoo. The penguin on it is circled.)', 'This penguin sold a slip on the ice better than anyone on our feed this week.', "Tell your grandma a stranger in the city says hi. She won't know who I am. That's fine. I know who she is."],
];

// ------------------------------------------------------------ what each surprise is
interface Handler {
  /** A line for the breakfast table: something you half heard around dawn. */
  overnight?: string;
  /** Mail-type surprises go straight to the mailbox. */
  mail?: (day: number) => Letter;
  /** Farm-type surprises put a prop in the yard. */
  prop?: () => { kind: string; x: number; y: number; props?: Record<string, unknown> };
  take?: (o: MapObject) => Promise<void>;
  /** Called a few times a second while you're on the farm (dist in tiles). */
  near?: (o: MapObject, dist: number, dt: number) => void;
}

const PORCH = px(11.6, 10.95);

const FLYERS = [
  'LOST: one orange cat, PILEDRIVER. Not to be confused with Agnes\'s Hubert. Hubert is home and furious about the comparison.',
  'WEDNESDAY NIGHT WRESTLING AT THE VFW. BINGO AFTER. Someone has drawn a mustache on the Mountain, and someone else a tiny title belt on the mustache.',
  'PIP-WEIGHT TITLE DEFENSE. SUNDAY. ABERNATHY BACKYARD. Challengers welcome. No adults. (Dex is allowed.)',
  "CHURCH POTLUCK, SUNDAY. Bring a dish. Agnes is bringing the pie, so don't.",
  'HAVE YOU SEEN THIS MOTH? A drawing of something enormous with wings, and REWARD underlined four times. Signed, F. Thistle.',
  'FOR SALE: one pickup, runs, mostly. Ask for Bo. Or Buck. Whichever one answers.',
];

export const HANDLERS: Record<SurpriseId, Handler> = {
  'tiny-pie': {
    overnight: 'Around six, a very tall shadow went past the kitchen window, and the whole house started to smell like cinnamon.',
    prop: () => ({ kind: 'sx-pie', ...px(12.6, 10.05), props: { lift: 10 } }),
    take: async (o) => {
      await narrate('A pie, still warm, cooling on the windowsill. A note is tucked under the tin in big, careful letters:', '*"For the Dupree window. There was always a pie in it. Felt wrong otherwise. - T.T."*');
      gain('pie', 3);
      finish(o);
    },
  },
  'raccoon-bin': {
    overnight: 'Around three: a clatter by the shed, then a very small, very guilty silence.',
    prop: () => ({ kind: 'trashcan', ...px(24.4, 9.7), props: { raccoon: true } }),
    near: (o, d) => {
      if (o.props.raccoon && d < 3.2) {
        o.props.raccoon = false;
        audio.sfx('thud', { volume: 0.5, pitch: 1.3 });
        WORLD?.fx.burst(o.x + 4, o.y - 10, 10, ['#8e7a72', '#c8c0a0', '#4e3e48'], { kind: 'dust', speed: 50, gravity: 40 });
        toast('A raccoon bails out of the bin and waddles for the trees with half a pretzel. He looks back once, offended.');
      }
    },
    take: async (o) => {
      if (o.props.raccoon) {
        o.props.raccoon = false;
        toast('A raccoon bails out of the bin and waddles for the trees with half a pretzel.');
      }
      o.props.action = undefined;
      await narrate('Somebody tipped the bin and ate every coffee filter in it. Whoever it was left a bottle cap on the lid.', 'Rent, probably.');
      finish();
    },
  },
  'pip-drawing': {
    mail: () => {
      const s = surpriseState();
      const left = PIP_DRAWING_TEXT.map((_, i) => i).filter((i) => !s.drawings.includes(i));
      const i = left[0] ?? 0;
      return { id: `sx-pip-drawing-${i}-${absDay()}`, from: 'Pip (age 10)', body: PIP_DRAWING_TEXT[i].body };
    },
  },
  'stray-chair': {
    overnight: 'Just before sunup, something out in the yard went *clang*, like a bell with no ring around it.',
    prop: () => ({ kind: 'chair', ...px(18.5, 13.4) }),
  },
  'lost-flyer': {
    prop: () => ({ kind: 'sx-flyer', ...px(35, 15.4), props: { vx: -7, phase: 0 } }),
    near: (o, _d, dt) => {
      // Drift west along the path, tumbling a little, and start over at the far end.
      const vx = Number(o.props.vx ?? -7);
      o.props.phase = Number(o.props.phase ?? 0) + dt;
      o.x += vx * dt;
      o.y = Math.round(15.4 * TILE + Math.sin(Number(o.props.phase) * 0.7) * 10);
      if (o.x < 7 * TILE) o.x = 36 * TILE;
    },
    take: async (o) => {
      const text = FLYERS[absDay() % FLYERS.length];
      await narrate('You stamp on the flyer before the wind gets it back.', text);
      finish(o);
    },
  },
  'plumb-visit': {
    overnight: 'Something warm leaned against the front door all night. It snored.',
    prop: () => ({ kind: 'sx-dog', ...px(13.6, 11.1) }),
    near: (o, d) => {
      o.props.wag = d < 4;
    },
    take: async (o) => {
      audio.sfx('heart', { volume: 0.5 });
      await narrate("Plumb, Hank's three-legged hound, thumps her tail on the boards three times. Exactly three, like she's counting.", 'She lets you scratch the good spot behind her ear, then gets up, shakes off, and trots toward town like she has an appointment.');
      if (G.relationships['hank']) rel('hank').points += 15;
      finish(o);
    },
  },
  'june-thermos': {
    overnight: 'A truck idled at the end of the drive around five, then thought better of it.',
    prop: () => ({ kind: 'sx-bundle', ...PORCH, props: { variant: 'thermos' } }),
    take: async (o) => {
      await narrate('A plaid thermos on the step, still hot. The note under it:', "*\"Saw your light on at five. Bring the thermos back when you're in. Or don't, I have nine. - J.\"*");
      gain('coffee', 2);
      finish(o);
    },
  },
  wildflowers: {
    overnight: 'Around dawn: light footsteps on the porch, a long pause, and light footsteps going away.',
    prop: () => ({ kind: 'sx-bundle', ...PORCH, props: { variant: 'flowers' } }),
    take: async (o) => {
      await narrate('Wildflowers in a coffee can on the top step. No note.', 'In the dew on the boards: a small sneaker print, and a smaller one next to it.');
      gain('wildflowers', 1);
      finish(o);
    },
  },
  'old-program': {
    prop: () => ({ kind: 'sx-bundle', ...PORCH, props: { variant: 'program' } }),
    take: async (o) => {
      await narrate('A show program from 1981, rolled tight in a rubber band. Somebody circled one match in red pen:', '*THE VELVET HAMMERS vs. THE MASKED CARDINALS.* No note. The rubber band smells faintly of fish bait.');
      gain('old-program', 1);
      finish(o);
    },
  },
  'arlo-postcard': {
    mail: (day) => {
      const s = surpriseState();
      const body = ARLO_POSTCARDS[s.postcards % ARLO_POSTCARDS.length];
      s.postcards++;
      return { id: `sx-arlo-${day}`, from: 'Arlo, from the city', body };
    },
  },
  'hank-offcuts': {
    overnight: 'Somebody set something down on the porch very quietly at dawn, then hummed the whole way back to the road.',
    prop: () => ({ kind: 'sx-bundle', ...PORCH, props: { variant: 'planks' } }),
    take: async (o) => {
      await narrate('Three good offcuts on the step, with a note nailed to the top one:', '*"Too good for the burn pile. - H."*');
      gain('plank', 3);
      finish(o);
    },
  },
  tamales: {
    prop: () => ({ kind: 'sx-bundle', ...PORCH, props: { variant: 'foil' } }),
    take: async (o) => {
      await narrate('Tamales in foil, still a little warm. A note in two hands, one neat and one shaky:', '*"Para la casa de Dottie."*');
      gain('tamales', 2);
      finish(o);
    },
  },
  'pip-cape': {
    overnight: 'The wind worked on the house all night. Something blue went past the window around four.',
    prop: () => ({ kind: 'sx-bundle', ...px(26.4, 10.7), props: { variant: 'cape' } }),
    take: async (o) => {
      await narrate('A bath towel snagged in the weeds, with a safety pin at the collar.', 'You know exactly whose cape this is.');
      G.flags['sx_pip_cape'] = 'found';
      toast('You fold the cape up for Pip.');
      finish(o);
    },
  },
  'grey-feather': {
    overnight: 'Something big settled on the porch roof around two. The boards creaked once. Then nothing.',
    prop: () => ({ kind: 'sx-bundle', ...px(9.4, 10.95), props: { variant: 'feather' } }),
    take: async (o) => {
      await narrate('A grey feather on the porch rail, longer than your forearm and soft as a sock.', 'Fenwick at the pawn shop would want to see this. Fenwick would want to see it *immediately.*');
      gain('feather', 1);
      finish(o);
    },
  },
  'honey-jar': {
    prop: () => ({ kind: 'sx-bundle', ...PORCH, props: { variant: 'honey' } }),
    take: async (o) => {
      await narrate('A jar of honey with a gingham top. The tag says:', '*"Wanda wanted you to have this. She was very clear about it. - C.R."*');
      gain('honey', 1);
      finish(o);
    },
  },
  'agnes-bulletin': {
    mail: (day) => ({
      id: `sx-agnes-${day}`,
      from: 'Agnes Pickett',
      body: [
        '(A church bulletin, folded in thirds. A butterscotch is taped to the corner.)',
        'Dear, I have circled the hymn numbers so you will know where we are. Second pew on the left.',
        'We do not stand for the Gloria. We stand for the Mountain, and only to boo.',
        'P.S. The butterscotch is for after.',
      ],
    }),
  },
};

// ------------------------------------------------------------ the morning roll

onNewDay(() => {
  const s = surpriseState();
  const day = absDay();
  s.today = null;
  const id = rollSurprise(
    {
      abs: day,
      season: G.time.season,
      weekday: weekday(),
      weather: G.weather.today,
      hearts,
      flags: G.flags,
      drawings: s.drawings.length,
      seed: G.seed,
    },
    s.history,
  );
  if (!id) return;
  if (id === 'pip-drawing' && s.drawings.length >= PIP_DRAWINGS) return;
  s.history.push({ id, day });
  if (s.history.length > 24) s.history.splice(0, s.history.length - 24);
  s.today = { id, day, done: false };
  const h = HANDLERS[id];
  if (h.overnight) morningOvernight(h.overnight);
  if (h.mail) {
    sendLetter(h.mail(day));
    s.today.done = true;
  }
});

/** Put today's surprise in the yard (or take yesterday's away). */
export function syncFarm(): void {
  const s = surpriseState();
  const t = s.today;
  // The raccoon's bin stays put for the day after he's gone; everything else leaves once found.
  const showing = t && t.day === absDay() && HANDLERS[t.id].prop && (!t.done || t.id === 'raccoon-bin');
  const active = showing && t ? `${PREFIX}${t.id}-${t.day}` : null;
  clearProps(FARM, PREFIX, active ? [active] : []);
  if (!active || !t) return;
  const spec = HANDLERS[t.id].prop!();
  const props: Record<string, unknown> = { ...(spec.props ?? {}), action: spec.kind === 'chair' || t.done ? undefined : 'sx-surprise' };
  if (t.done) props.raccoon = false;
  placeProp(FARM, { id: active, kind: spec.kind, x: spec.x, y: spec.y, props });
}

/** Grandma's note and Pip's drawings on the fridge in the house. */
export function syncFridge(): void {
  const w = WORLD;
  if (!w) return;
  const m = w.getMap('grandma-house');
  const fridge = m.objects.find((o) => o.kind === 'fridge');
  if (!fridge) return;
  fridge.props.action = 'fridge-door';
  const s = surpriseState();
  const o = placeProp('grandma-house', { id: 'sx-fridge-door', kind: 'sx-fridge', x: fridge.x, y: fridge.y + 1, props: { action: 'fridge-door' } });
  if (o) {
    // Grandma's note has been on that door since 1983.
    o.props.note = true;
    o.props.drawings = s.drawings.length;
    o.props.dy = -7;
  }
}

onAction('sx-surprise', async ({ object }) => {
  const t = surpriseState().today;
  if (!t) return;
  await HANDLERS[t.id].take?.(object);
});

/** The fridge door: Grandma's note, then whatever Pip has sent since. */
onAction('fridge-door', async () => {
  if (!G.flags['dottie_fridge_note']) {
    const { readFridgeNote } = await import('../story-main/opening');
    await readFridgeNote();
    return;
  }
  const s = surpriseState();
  const choices = [
    { label: "Grandma's note", value: -1 },
    ...s.drawings.map((i) => ({ label: `Pip: ${PIP_DRAWING_TEXT[i].title}`, value: i })),
    { label: 'Close the fridge', value: -2 },
  ];
  const pick = await choose(null, s.drawings.length ? 'The fridge door. Grandma\'s note, and Pip\'s gallery.' : "The fridge door. Grandma's note, held up by a crawfish magnet.", choices, { cancelValue: -2 });
  if (pick === -2) return;
  if (pick === -1) {
    const { readFridgeNote } = await import('../story-main/opening');
    await readFridgeNote();
    return;
  }
  await narrate(...PIP_DRAWING_TEXT[pick].body);
});

onEnterMap((mapId) => {
  if (mapId === FARM) syncFarm();
  if (mapId === 'grandma-house') syncFridge();
  return false;
});

/** Pip gets his cape back. */
onTalk(async (npcId) => {
  if (npcId !== 'pip' || G.flags['sx_pip_cape'] !== 'found') return false;
  const pip = speakerFor('pip');
  G.flags['sx_pip_cape'] = 'returned';
  WORLD?.emote('pip', '!');
  await say(pip, 'MY CAPE!', 'It blew off during a title defense. Against the WIND. The wind was totally cheating.', "...Thanks. You return stuff. That's like a hero thing.");
  rel('pip').points += 20;
  sting('item-get');
  return true;
});

// ------------------------------------------------------------ while you're on the farm
let lastT = performance.now();
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = performance.now();
    const dt = Math.min(0.5, (now - lastT) / 1000);
    lastT = now;
    const w = WORLD;
    if (!w || !w.map) return;
    if (w.map.id === 'grandma-house') {
      syncFridge();
      return;
    }
    if (w.map.id !== FARM) return;
    const s = surpriseState();
    const t = s.today;
    if (!t || t.done || t.day !== absDay()) return;
    syncFarm();
    const id = `${PREFIX}${t.id}-${t.day}`;
    const o = w.map.objects.find((x) => x.id === id);
    if (!o) return;
    // The stray chair is picked up by the ordinary chair action.
    if (t.id === 'stray-chair' && o.hidden) {
      finish();
      return;
    }
    if (game.blockers > 0) return;
    const d = Math.hypot(w.player.x - o.x, w.player.y - o.y) / TILE;
    HANDLERS[t.id].near?.(o, d, dt);
  }, 120);
}
