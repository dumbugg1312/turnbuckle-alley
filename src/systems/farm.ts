import { audio } from '../audio';
import { G, ext, addItem, hasItem } from '../core/state';
import { sting } from '../core/sting';
import { absDay } from '../core/time';
import { item } from '../data/items';
import { choose, narrate, say, toast } from '../ui/dialog';
import { onAction, onEnterMap, onTalk } from '../world/hooks';
import { WORLD, worldState } from '../world/scene';
import { speakerFor } from '../world/talk';

/** Grandma's yard: Hank's builds, training equipment, the merch press. */
interface FarmState {
  built: string[];
  /** Merch press: day it was loaded and how many shirts. */
  pressDay: number;
  pressCount: number;
  /** Last day each piece of equipment was used (one workout per day each). */
  used: Record<string, number>;
}
export function farmState(): FarmState {
  return ext<FarmState>('farm', () => ({ built: [], pressDay: -1, pressCount: 0, used: {} }));
}

const BUILDS: { id: string; name: string; desc: string; money: number; mats: [string, number][]; needs?: () => boolean }[] = [
  { id: 'ring', name: "Restore Grandma's ring", desc: 'New ropes, a fresh canvas, tightened turnbuckles. Your own ring to train in.', money: 150, mats: [['plank', 6], ['fiber', 8]], needs: () => !!G.flags['yard_cleared'] },
  { id: 'eq-heavybag', name: 'Heavy bag', desc: 'Strikes training. +Strength, chance to upgrade a strike card.', money: 120, mats: [['leather', 2], ['tape', 2]] },
  { id: 'eq-tires', name: 'Tire stack', desc: 'Flip tires like a farm strongman. Big +Strength.', money: 80, mats: [['scrap', 3]] },
  { id: 'eq-bench', name: 'Weight bench', desc: 'Iron and patience. +Strength, +max Gas over time.', money: 160, mats: [['iron', 3]] },
  { id: 'eq-trampoline', name: 'Trampoline', desc: '"It\'s for aerial training," you tell everyone. +Ring IQ, chance to upgrade an aerial card.', money: 140, mats: [['canvas', 2], ['rope', 1]] },
  { id: 'eq-speedbag', name: 'Speed bag', desc: 'Rhythm and timing. +Ring IQ.', money: 90, mats: [['leather', 1], ['tape', 1]] },
  { id: 'eq-press', name: 'T-shirt press', desc: 'Load blank tees at night; wake up to merch. Sells at shows.', money: 200, mats: [['iron', 2], ['plank', 2]] },
];

/** Hide unbuilt equipment whenever the farm loads. */
onEnterMap((mapId) => {
  if (mapId !== 'farm') return false;
  const fs = farmState();
  const ws = worldState();
  for (const b of BUILDS) {
    if (!b.id.startsWith('eq-')) continue;
    if (fs.built.includes(b.id)) delete ws.hidden[b.id];
    else ws.hidden[b.id] = -1;
  }
  ws.ringState = fs.built.includes('ring') ? 'clean' : ws.ringState === 'deluxe' ? 'deluxe' : 'overgrown';
  WORLD?.refreshObjects();
  return false;
});

/** Hank's workshop: talk to Hank to build things for the yard. */
onTalk(async (npcId, place) => {
  if (npcId !== 'hank') return false;
  if (place === 'show') return false;
  const fs = farmState();
  const h = speakerFor('hank');
  if (!G.flags['met_hank_builds']) {
    G.flags['met_hank_builds'] = true;
    await say(h, "Dupree's grandkid. I built that backyard ring with my mother when I was nineteen. Pine posts, Navy surplus rope.", "Clear that yard and bring me lumber, and I'll make it sing again. Anything else you want out there, I can build. For a price. Materials too, I'm not a wizard.");
  }
  const options = BUILDS.filter((b) => !fs.built.includes(b.id)).map((b) => {
    const can = (b.needs?.() ?? true) && G.player.money >= b.money && b.mats.every(([id, n]) => hasItem(id, n));
    const cost = `$${b.money}, ${b.mats.map(([id, n]) => `${n} ${item(id).name}`).join(', ')}`;
    return { label: `${b.name}`, value: b.id, hint: `${cost}${b.needs && !b.needs() ? ' · clear the yard first' : ''}`, disabled: !can };
  });
  const c = await choose(h, 'What are we building?', [...options, { label: 'Just saying hi', value: 'hi' }], { cancelValue: 'hi' });
  if (c === 'hi') return false;
  const b = BUILDS.find((x) => x.id === c)!;
  G.player.money -= b.money;
  for (const [id, n] of b.mats) addItem(id, -n);
  fs.built.push(b.id);
  audio.sfx('equipment');
  sting('item-get');
  if (b.id === 'ring') {
    await say(h, "Give me a day. That ring's going to be the prettiest thing in the county. After me.");
    worldState().ringState = 'clean';
    await narrate("The next morning, Grandma's ring stands in the yard like it did in 1975: tight ropes, white canvas, and a fresh *D.D.* on the turnbuckle pad. Hank's touch.");
  } else await say(h, `${b.name}, coming up. It'll be in your yard tomorrow morning.`);
  return true;
});

function workout(id: string, energy: number, apply: () => string): Promise<void> | void {
  const fs = farmState();
  if (fs.used[id] === absDay()) {
    toast("You've already trained on this today. Muscles need sleep too.");
    return;
  }
  if (G.player.energy < energy) {
    toast("Too tired to train. Eat something!");
    return;
  }
  G.player.energy -= energy;
  fs.used[id] = absDay();
  audio.sfx('equipment');
  WORLD?.fx.burst(WORLD.player.x, WORLD.player.y - 16, 8, ['#fff4dc', '#f4b63f'], { kind: 'star', speed: 30, gravity: 30 });
  toast(apply());
}

/** Upgrade a random card of a type in the deck (adds '+'). */
function upgradeOne(types: string[]): string | null {
  const deck = G.player.deck;
  const cands = deck.map((e, i) => ({ e, i })).filter(({ e }) => !e.endsWith('+') && types.some((t) => cardType(e) === t));
  if (!cands.length) return null;
  const pick = cands[Math.floor(Math.random() * cands.length)];
  deck[pick.i] = pick.e + '+';
  return pick.e;
}
let cardTypes: Record<string, string> = {};
void import('../match/cards').then((m) => {
  cardTypes = Object.fromEntries(Object.values(m.CARDS).map((c) => [c.id, c.type]));
});
function cardType(entry: string): string {
  return cardTypes[entry.replace('+', '')] ?? '';
}

onAction('eq-heavybag', () =>
  workout('eq-heavybag', 10, () => {
    G.player.skills.strength += 14;
    const up = Math.random() < 0.35 ? upgradeOne(['strike']) : null;
    return up ? `Thwack! Thwack! Your ${up} got sharper (upgraded!).` : 'Thwack, thwack, thwack. +Strength';
  }),
);
onAction('eq-tires', () =>
  workout('eq-tires', 12, () => {
    G.player.skills.strength += 20;
    return 'You flip the tire across the yard and back. A cow somewhere moos in respect. +Strength';
  }),
);
onAction('eq-bench', () =>
  workout('eq-bench', 12, () => {
    G.player.skills.strength += 16;
    return 'Iron goes up, iron comes down. +Strength';
  }),
);
onAction('eq-trampoline', () =>
  workout('eq-trampoline', 8, () => {
    G.player.skills.ringiq += 12;
    const up = Math.random() < 0.35 ? upgradeOne(['aerial', 'setup']) : null;
    return up ? `You land a perfect flip! ${up} upgraded!` : 'Boing. Boing. BOING. +Ring IQ';
  }),
);
onAction('eq-speedbag', () =>
  workout('eq-speedbag', 6, () => {
    G.player.skills.ringiq += 10;
    return 'Ba-da-ba-da-ba-da. Rhythm is everything. +Ring IQ';
  }),
);

onAction('eq-press', async () => {
  const fs = farmState();
  if (fs.pressCount > 0 && fs.pressDay < absDay()) {
    addItem('merch-tee', fs.pressCount);
    toast(`👕 Collected ${fs.pressCount} merch tees! They'll sell at your next show.`);
    audio.sfx('pickup');
    fs.pressCount = 0;
    return;
  }
  if (fs.pressCount > 0) {
    await narrate('The press is working. Your shirts will be ready tomorrow morning.');
    return;
  }
  const blanks = G.player.inventory['blank-tee'] ?? 0;
  if (!blanks) {
    await narrate('The T-shirt press needs blank tees. Steel Chair Hardware sells them.');
    return;
  }
  const n = Math.min(blanks, 6);
  addItem('blank-tee', -n);
  fs.pressCount = n;
  fs.pressDay = absDay();
  audio.sfx('equipment');
  toast(`Loaded ${n} blank tees with your face on them. Ready tomorrow.`);
});
