import { audio } from '../audio';
import { G, ext, addItem, hasItem } from '../core/state';
import { sting } from '../core/sting';
import { item } from '../data/items';
import { iconFor } from '../gfx/icons';
import { choose, narrate, say, toast } from '../ui/dialog';
import { onAction } from '../world/hooks';
import { WORLD, worldState } from '../world/scene';
import { speakerFor, talkTo } from '../world/talk';
import { openShop } from './shops';
import { sleep } from './day';

/** Folding chairs: the town's forageable. Every chair is a seat at the show. */
export interface ChairState {
  found: number;
}
export function chairState(): ChairState {
  return ext<ChairState>('chairs', () => ({ found: 0 }));
}

/**
 * Add items to the bag. When they come out of something in the world, they
 * pop out of it and fly into your hands (with a "+1" over your head);
 * otherwise a toast says what you got.
 */
function gain(id: string, n = 1, from?: { x: number; y: number }, delay = 0): void {
  addItem(id, n);
  if (from && WORLD) WORLD.flyPickup(iconFor(id), from.x, from.y - 6, n, item(id).name, delay);
  else toast(`+${n} ${item(id).name}`, iconFor(id));
}

function spendEnergy(n: number): boolean {
  if (G.player.energy < n) {
    toast("You're too tired. Eat something or call it a night.");
    audio.sfx('error');
    return false;
  }
  G.player.energy -= n;
  return true;
}

// ---- Bed
onAction('bed', async () => {
  const c = await choose(null, 'Go to bed and end the day?', [
    { label: 'Sleep', value: 'yes', style: 'primary' },
    { label: 'Not yet', value: 'no' },
  ], { cancelValue: 'no' });
  if (c === 'yes') await sleep(false);
});

// ---- Folding chairs
onAction('chair', async ({ object }) => {
  const cs = chairState();
  cs.found++;
  // Lift it, fold it (CLACK), and it flies into your arms.
  if (WORLD) await WORLD.breakObject(object, { pose: 'lift' });
  audio.sfx('chair');
  WORLD?.flyObject(object, `Chair #${cs.found}`);
  WORLD?.hideObject(object, 5 + Math.floor(Math.random() * 4));
  WORLD?.fx.burst(object.x, object.y - 6, 10, ['#f8f6fc', '#cfcae0', '#f4b63f'], { kind: 'star', speed: 40, gravity: 40 });
  const lines = [
    'A perfectly good folding chair! Into the collection it goes.',
    "A steel chair, a little dented. It's seen things.",
    'Another chair for the Sportatorium. Somebody will sit in this and scream.',
    'You fold the chair with a satisfying CLACK.',
  ];
  toast(`Folding chair #${cs.found}! (${lines[cs.found % lines.length]})`);
  sting('item-get');
});

// ---- Yard debris on the farm
/** bits: what flies off as it comes loose (leaf-like bits that settle on the ground). */
const DEBRIS: Record<string, { energy: number; loot: [string, number][]; sound: string; text: string; pose: 'grapple' | 'lift'; bits: string[] }> = {
  weeds: { energy: 2, loot: [['fiber', 1]], sound: 'dig', text: 'You yank the weeds out by the roots.', pose: 'grapple', bits: ['#6a9a4a', '#8ab868', '#a0784a', '#f6f2e8'] },
  junk: { energy: 6, loot: [['scrap', 2], ['plank', 1]], sound: 'thud', text: 'You haul the junk pile apart. Somewhere in here was a toaster.', pose: 'lift', bits: ['#9a9ab0', '#a8704f', '#c8944a', '#6a6a80'] },
  stone: { energy: 4, loot: [['river-stone', 1]], sound: 'thud', text: 'You roll the stone out of the way.', pose: 'grapple', bits: ['#a8a2b8', '#8a8498', '#a0784a', '#6a9a4a'] },
  stump: { energy: 6, loot: [['plank', 2]], sound: 'thud', text: 'The stump finally gives.', pose: 'grapple', bits: ['#c8944a', '#8a5a2a', '#e0b878', '#a0784a'] },
  'old-tire': { energy: 3, loot: [['scrap', 1]], sound: 'thud', text: 'An old tire. You stack it by the shed. (Tire flips later? Tire flips later.)', pose: 'lift', bits: ['#5a5470', '#a0784a', '#6a9a4a'] },
};
for (const [kind, d] of Object.entries(DEBRIS)) {
  onAction(kind, async ({ object }) => {
    if (!spendEnergy(d.energy)) return;
    // Reach in, it shudders and squashes, then gives way.
    if (WORLD) await WORLD.breakObject(object, { pose: d.pose, bits: d.bits });
    audio.sfx(d.sound);
    WORLD?.fx.burst(object.x, object.y - 4, 8, ['#6a9a4a', '#a0784a', '#c8c0a0'], { kind: 'dust', speed: 40, gravity: 60 });
    WORLD?.hideObject(object);
    d.loot.forEach(([id, n], i) => gain(id, n, object, i * 0.12));
    G.player.skills.strength += 3;
    const ws = worldState();
    const cleared = Object.keys(ws.hidden).filter((k) => k.startsWith('debris-')).length;
    if (cleared === 1) await narrate(d.text, "Grandma's yard has been waiting a long time for someone to do this.");
    if (cleared === 23 && !G.flags['yard_cleared']) {
      G.flags['yard_cleared'] = true;
      sting('story-beat');
      await narrate('The yard is clear. For the first time in forty years, you can see the whole ring.', 'Hank would know how to fix those ropes.');
    }
  });
}

// ---- Grandma's backyard ring
onAction('backyard-ring', async () => {
  const ws = worldState();
  if (ws.ringState === 'overgrown') {
    await narrate(
      "Grandma's backyard ring. The ropes sag under vines, the canvas is a carpet of leaves, and one turnbuckle pad says *D.D.* in faded marker.",
      G.flags['yard_cleared'] ? 'Hank at the Sportatorium could fix this up.' : 'Clearing the yard around it feels like the right first step.',
    );
    return;
  }
  const c = await choose(null, 'Train in the backyard ring?', [
    { label: 'Run the ropes (10 energy)', value: 'ropes', hint: '+Strength, +Ring IQ' },
    { label: 'Practice bumps (8 energy)', value: 'bumps', hint: 'Get better at selling' },
    { label: 'Not now', value: 'no' },
  ], { cancelValue: 'no' });
  if (c === 'no') return;
  if (!spendEnergy(c === 'ropes' ? 10 : 8)) return;
  audio.sfx('equipment');
  if (c === 'ropes') {
    G.player.skills.strength += 12;
    G.player.skills.ringiq += 8;
    toast('You run the ropes until your back is a lattice of rope burns. +Strength +Ring IQ');
  } else {
    G.player.skills.ringiq += 10;
    G.player.skills.charisma += 4;
    toast('Thud. Thud. Thud. Every bump a little prettier. +Ring IQ');
  }
});

// ---- Shops (counters)
const COUNTER_SHOPS: Record<string, string> = {
  'diner-counter': 'diner', 'taq-counter': 'taqueria', 'bakery-case': 'bakery', 'gas-counter': 'gasstation',
  'hardware-counter': 'hardware', 'pawn-counter': 'pawn', 'card-shelf': 'pawn', 'stand-corndog': 'fair', 'stand-lemonade': 'fair', 'stand-funnel': 'fair',
};
for (const [id, shop] of Object.entries(COUNTER_SHOPS)) onAction(id, () => openShop(shop));

// ---- Little interactions around town
onAction('jukebox', async () => {
  audio.sfx('coin');
  await narrate('You drop a quarter in. The jukebox clunks, whirs, and plays something with a lot of saxophone.');
});
onAction('velvet-mural', async () => {
  await narrate(
    'A mural on the alley wall: two women in sequined 80s gear, back to back, holding one championship belt between them.',
    '*THE VELVET HAMMERS*, it says, in letters that have been repainted many times. Someone keeps it fresh.',
  );
  if (!G.flags['saw_mural']) G.flags['saw_mural'] = true;
});
onAction('jobber-can', () => talkTo('jobber', 'public'));
onAction('dottie-locker', async () => {
  await narrate("A single locker, padlocked. A strip of tape on the door reads *D.D.* in Birdie's handwriting, the ink gone soft with age.", "Nobody's opened it in a very long time.");
});
onAction('bus-stop', async () => {
  await narrate('ROUTE 9: TURNBUCKLE ALLEY ↔ THE CITY. Departs 8:00 AM daily.', 'Someone has scratched "DEX WAS HERE" into the bench. Several times.');
});
onAction('newsstand', async () => {
  const paper = (G.ext['paper'] as { headline: string; body: string[]; review?: { stars: number; text: string } } | undefined) ?? null;
  if (!paper) {
    await narrate('THE TURNBUCKLE TATTLER. "Bake Sale Raises $214 for New Bleachers." Nothing about wrestling today.');
    return;
  }
  const { showPaper } = await import('./paper');
  await showPaper(paper);
});
onAction('poster-board', async () => {
  await narrate('The community board: a lost cat named "Piledriver", a church potluck, a flyer for *WEDNESDAY NIGHT WRESTLING AT THE VFW. BINGO AFTER.*', 'Someone has drawn a mustache on the flyer, then someone else has drawn a tiny title belt on the mustache.');
});
onAction('home-mailbox', async () => {
  const { checkMail } = await import('./mail');
  await checkMail();
});
onAction('phone-booth', async () => {
  const { callGrandma } = await import('../story-main/phone');
  await callGrandma();
});
onAction('stairs-down', async () => {
  if (!hasItem('dungeon-key')) {
    await narrate('Stone stairs going down behind a rusted gate. A faint green glow. Cold air that smells like chalk and old canvas.', 'The gate is locked with a heavy iron padlock. Someone in town must have the key.');
    return;
  }
  G.flags['dungeon_visited'] = true;
  const { enterDungeon } = await import('../activities/dungeon-entry');
  await enterDungeon();
});
for (const tv of ['home-tv', 'lou-tv', 'grandma-tv']) {
  onAction(tv, async () => {
    const { watchTapes } = await import('../activities/tapes-entry');
    await watchTapes();
  });
}
onAction('tapebin', async ({ object }) => {
  const { digBin } = await import('../activities/tapes-entry');
  await digBin(String(object.props.bin ?? 'flea'), object);
});
onAction('arena-ring', async () => {
  const c = await choose(null, "The Sportatorium ring. It's quiet in here during the day.", [
    { label: 'Run the ropes (10 energy)', value: 'ropes' },
    { label: 'Just look', value: 'look' },
  ], { cancelValue: 'look' });
  if (c === 'ropes') {
    if (!spendEnergy(10)) return;
    audio.sfx('equipment');
    G.player.skills.strength += 10;
    G.player.skills.ringiq += 10;
    toast('The ropes bite. The mat thumps. It sounds like home. +Strength +Ring IQ');
  } else await narrate('Forty years of footprints on this canvas. Some of them were your grandmother\'s.');
});
onAction('exam-table', async () => {
  await say(speakerFor('doc'), "Hop up. Let's see that spine.");
  if (G.player.money < 20) {
    await say(speakerFor('doc'), "Twenty bucks for an adjustment, but I'll put it on your tab. Ha. I don't do tabs. Come back later.");
    return;
  }
  const c = await choose(null, 'Get an adjustment? ($20, restores 40 energy)', [{ label: 'Yes please', value: 'y' }, { label: 'No thanks', value: 'n' }], { cancelValue: 'n' });
  if (c === 'y') {
    G.player.money -= 20;
    G.player.energy = Math.min(G.player.maxEnergy, G.player.energy + 40);
    audio.sfx('slam', { volume: 0.4 });
    toast('CRACK. You feel two inches taller. +40 energy');
  }
});
