/**
 * Grandma's garden: five plots in the tilled patch by the house, seeds from
 * Grandma's old tin and from Steel Chair Hardware, watering, overnight growth
 * with visible stages, harvest, and cooking at the old stove.
 */
import { audio } from '../audio';
import { addItem, ext, G, hasItem } from '../core/state';
import { sting } from '../core/sting';
import { ITEMS, item } from '../data/items';
import { setPlotView } from '../gfx/world/charm';
import { iconFor } from '../gfx/icons';
import { choose, narrate, toast } from '../ui/dialog';
import { onAction, onNewDay } from '../world/hooks';
import { MAPS } from '../world/maps/index';
import '../world/maps/links';
import { WORLD } from '../world/scene';
import type { MapObject } from '../world/types';
import {
  canCook, canPlant, CROPS, emptyPlot, GARDEN_ITEMS, growNight, harvest, plant, RECIPES, seedId, stageOf, type Plot,
} from './garden-core';
import { SHOPS } from './shops';
import { placedObjects, showLore } from './lore';

export interface GardenState {
  plots: Record<string, Plot>;
  tinFound: boolean;
  /** Harvests per crop, for firsts. */
  harvested: Record<string, number>;
  watered: number;
}
export function gardenState(): GardenState {
  return ext<GardenState>('garden', () => ({ plots: {}, tinFound: false, harvested: {}, watered: 0 }));
}
export const PLOT_IDS = ['plot-0', 'plot-1', 'plot-2', 'plot-3', 'plot-4'];
function plotOf(id: string): Plot {
  const gs = gardenState();
  return (gs.plots[id] ??= emptyPlot());
}

const raining = () => G.weather.today === 'rain' || G.weather.today === 'storm';

// Items and shop stock, registered at runtime so items.ts and shops.ts stay untouched.
for (const it of GARDEN_ITEMS) ITEMS[it.id] ??= it;
for (const c of Object.values(CROPS)) if (!SHOPS.hardware.stock.includes(seedId(c.id))) SHOPS.hardware.stock.push(seedId(c.id));

setPlotView((o: MapObject) => {
  const p = gardenState().plots[o.id];
  return p ? { crop: p.crop, stage: stageOf(p), watered: p.watered } : { crop: null, stage: -1, watered: false };
});

function spend(n: number): boolean {
  if (G.player.energy < n) {
    toast("You're too tired to garden. Eat something first.");
    audio.sfx('error');
    return false;
  }
  G.player.energy -= n;
  return true;
}

function gain(id: string, n: number): void {
  addItem(id, n);
  toast(`+${n} ${item(id).name}`, iconFor(id));
}

// ---------------------------------------------------------------- the raised bed and Grandma's seed tin

onAction('garden-1', async ({ object, mapId }) => {
  const gs = gardenState();
  if (!gs.tinFound) {
    gs.tinFound = true;
    await narrate(
      "Grandma's raised bed. Somebody has kept it going: the lettuce is up and a tomato is staked in the corner. Hank, probably, or Birdie, or both, on different days.",
      'Tucked under the corner board is a coffee tin with a plastic lid. Inside, seed packets folded in wax paper, labeled in a hand you know: *TOMATOES, THE GOOD ONES. PEAS FOR BIRD.*',
      'A note at the bottom of the tin: *Plant them in the patch by the fence, cher. Seeds are patient. They will wait for you.*',
    );
    gain(seedId('tomato'), 3);
    gain(seedId('peas'), 2);
    sting('item-get');
    await narrate('The tilled patch along the fence has room for five plots. Steel Chair Hardware sells more seeds, labeled in Bo\'s tape.');
    return;
  }
  await showLore(object, mapId);
});

// ---------------------------------------------------------------- plots

async function usePlot(o: MapObject): Promise<void> {
  const p = plotOf(o.id);
  const gs = gardenState();
  if (!p.crop) {
    const season = G.time.season;
    const owned = Object.values(CROPS).filter((c) => hasItem(seedId(c.id)));
    if (!owned.length) {
      await narrate(gs.tinFound ? 'Turned soil, ready for something. You have no seeds. Steel Chair Hardware sells them.' : 'Turned soil, ready for something. Grandma\'s raised bed might have ideas.');
      return;
    }
    const opts = owned.map((c) => ({
      label: `${c.seedName} seeds (${G.player.inventory[seedId(c.id)]})`,
      value: c.id,
      hint: canPlant(c.id, season) ? `${c.days} days with water` : 'Not this season',
      disabled: !canPlant(c.id, season),
    }));
    const pick = await choose<string>(null, 'Plant something?', [...opts, { label: 'Not now', value: '' }], { cancelValue: '' });
    if (!pick || !spend(3)) return;
    addItem(seedId(pick), -1);
    plant(p, pick, raining());
    audio.sfx('dig');
    WORLD?.fx.burst(o.x, o.y - 4, 8, ['#5a3a30', '#8a6248', '#c8b090'], { kind: 'dust', speed: 30, gravity: 60 });
    toast(`Planted ${CROPS[pick].name}.${raining() ? ' The rain waters it for you.' : ' Give it some water.'}`);
    return;
  }
  const c = CROPS[p.crop];
  if (stageOf(p) >= 4) {
    const got = harvest(p);
    if (!got) return;
    audio.sfx('pickup');
    WORLD?.fx.burst(o.x, o.y - 12, 10, ['#9ac860', '#f4c23f', '#e8404e'], { kind: 'star', speed: 40, gravity: 40 });
    gain(got[0], got[1]);
    const first = !gs.harvested[c.id];
    gs.harvested[c.id] = (gs.harvested[c.id] ?? 0) + 1;
    if (c.id === 'tomato' && G.flags['fortune_tomato'] && !G.flags['fortune_tomato_done']) {
      G.flags['fortune_tomato_done'] = true;
      await narrate('Madame Fortunata\'s card said something red was coming, and that it was not trouble.', 'It was a tomato. She was right. You eat one standing in the yard, warm from the sun.');
    } else if (first) await narrate(FIRST_HARVEST[c.id] ?? `Your first ${c.name.toLowerCase()} from Grandma's yard.`);
    return;
  }
  if (!p.watered) {
    if (!spend(2)) return;
    p.watered = true;
    gs.watered++;
    audio.sfx('splash', { volume: 0.6 });
    WORLD?.fx.burst(o.x, o.y - 6, 10, ['#8ab8e8', '#cfe4ff', '#ffffff'], { kind: 'dot', speed: 30, gravity: 80 });
    if (gs.watered === 1) await narrate('You fill the dented watering can at the pump by the shed. It has a hole near the top, so you learn to fill it just below the hole.');
    else toast(`Watered the ${c.name.toLowerCase()}.`);
    return;
  }
  await narrate(GROWING[stageOf(p)]?.(c.name) ?? 'Growing.');
}

const GROWING: Record<number, (n: string) => string> = {
  0: (n) => `${n}, planted and watered. Nothing to see yet but dirt that knows something you don't.`,
  1: () => 'Two leaves. One of them is already bigger and knows it.',
  2: (n) => `The ${n.toLowerCase()} are coming along. A ladybug has moved in and seems to be in charge.`,
  3: (n) => `Nearly there. The ${n.toLowerCase()} look like they are thinking about it.`,
};

const FIRST_HARVEST: Record<string, string> = {
  tomato: 'Your first tomatoes from the yard. You eat one right there. It is warm and it tastes like the yard smells.',
  peas: 'The first peas. They snap so loud a bird looks over to see what happened.',
  okra: 'Okra, picked small. Grandma\'s card said small. You have a feeling she would check.',
  sunflower: 'You cut the sunflower and it keeps looking at you, all the way inside. It will make somebody very happy.',
  pumpkin: 'You lift the pumpkin with both arms and have to sit down on the edge of the patch afterward. Gus is weighing pumpkins at the Harvest fair. Just saying.',
  collards: 'Collards, big as dinner plates, cold from the morning. The stove inside has been waiting for exactly this.',
};

for (const id of PLOT_IDS) onAction(id, ({ object }) => usePlot(object));

onNewDay(() => {
  const gs = gardenState();
  for (const p of Object.values(gs.plots)) growNight(p, raining());
});

// ---------------------------------------------------------------- cooking at Grandma's stove

const stove = MAPS.get('grandma-house') && placedObjects(MAPS.get('grandma-house')!).find((o) => o.kind === 'kitchen-run');
if (stove) {
  onAction(stove.id, async ({ object, mapId }) => {
    const has = (id: string, n: number) => hasItem(id, n);
    const any = RECIPES.some((r) => r.needs.every(([id]) => hasItem(id)));
    if (!any) {
      await showLore(object, mapId);
      return;
    }
    const opts = RECIPES.map((r) => ({
      label: item(r.id).name,
      value: r.id,
      hint: r.needs.map(([id, n]) => `${n} ${item(id).name}`).join(' + '),
      disabled: !canCook(r, has),
    }));
    const pick = await choose<string>(null, 'Cook something from the garden?', [...opts, { label: 'Just look', value: 'look' }, { label: 'Not now', value: '' }], { cancelValue: '' });
    if (pick === 'look') {
      await showLore(object, mapId);
      return;
    }
    const r = RECIPES.find((x) => x.id === pick);
    if (!r) return;
    for (const [id, n] of r.needs) addItem(id, -n);
    audio.sfx('equipment', { volume: 0.5 });
    G.time.minutes += 30;
    await narrate(r.cook);
    gain(r.id, 1);
  });
}
