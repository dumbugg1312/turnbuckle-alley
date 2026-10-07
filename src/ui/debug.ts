import { game } from '../core/game';
import { saveGame } from '../core/save';
import { G, RANKS, addItem } from '../core/state';
import { DAY_START } from '../core/time';
import { NPCS } from '../data/npcs';
import { MAPS } from '../world/maps/index';
import { WORLD } from '../world/scene';
import { addHearts } from '../world/talk';
import { toast } from './dialog';
import { el, uiRoot } from './dom';

/**
 * Developer / explorer panel. Open with the ` key, or tap the HUD clock five
 * times quickly. Lets testers jump around the year to see later content.
 */
let panel: HTMLElement | null = null;

export function toggleDebug(): void {
  if (panel) {
    panel.remove();
    panel = null;
    return;
  }
  panel = el('div', 'panel dark debug-panel');
  const add = (label: string, fn: () => void | Promise<void>) => {
    const b = el('button', { class: 'btn small' }, label);
    b.addEventListener('click', async (e) => {
      e.stopPropagation();
      await fn();
      toast(`Debug: ${label}`);
    });
    panel!.append(b);
  };
  panel.append(el('div', 'label', 'Explorer tools'));
  add('+$500', () => void (G.player.money += 500));
  add('Full energy', () => void (G.player.energy = G.player.maxEnergy));
  add('Next day (sleep)', async () => {
    const { sleep } = await import('../systems/day');
    await sleep(false);
  });
  add('+7 days', async () => {
    const { advanceCalendar } = await import('../systems/day');
    for (let i = 0; i < 7; i++) advanceCalendar();
    G.time.minutes = DAY_START;
    WORLD?.refreshObjects();
  });
  add('Time: 9 AM', () => void (G.time.minutes = 9 * 60));
  add('Time: 5:50 PM', () => void (G.time.minutes = 17 * 60 + 50));
  add('Time: 9 PM', () => void (G.time.minutes = 21 * 60));
  add('Jump to Wednesday', async () => {
    const { advanceCalendar } = await import('../systems/day');
    let guard = 0;
    do advanceCalendar();
    while ((G.time.day - 1) % 7 !== 2 && guard++ < 8);
    G.time.minutes = 17 * 60 + 40;
  });
  add('Jump to Saturday', async () => {
    const { advanceCalendar } = await import('../systems/day');
    let guard = 0;
    do advanceCalendar();
    while ((G.time.day - 1) % 7 !== 5 && guard++ < 8);
    G.time.minutes = 17 * 60 + 40;
  });
  add('Dungeon key', () => addItem('dungeon-key', 1));
  add('Rank up', () => {
    const i = RANKS.indexOf(G.player.rank);
    G.player.rank = RANKS[Math.min(RANKS.length - 1, i + 1)];
  });
  add('+2 hearts with everyone', () => NPCS.forEach((n) => addHearts(n.id, 500)));
  add('Skip intro week', () => {
    Object.assign(G.flags, { arrived: true, met_pip: true, seen_farm: true, first_night: true, met_birdie: true, debuted: true });
  });
  add('Grandma moves to town', () => void (G.flags['grandma_in_town'] = true));
  add('Toggle coords', () => void (game.debug = !game.debug));
  const sel = el('select', 'debug-select') as HTMLSelectElement;
  for (const id of MAPS.keys()) sel.append(el('option', { value: id }, id));
  sel.addEventListener('change', () => {
    const def = MAPS.get(sel.value)!;
    const w = def.warps[0];
    void WORLD?.warpTo(sel.value, w ? w.tx : 5, w ? w.ty : 5);
  });
  panel.append(el('div', 'label', 'Warp to map'), sel);
  add('Save', () => void saveGame());
  add('Close', () => toggleDebug());
  uiRoot().append(panel);
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'Backquote') toggleDebug();
});

let taps: number[] = [];
document.addEventListener('pointerup', (e) => {
  const t = e.target as HTMLElement;
  if (!t.closest?.('.hud-ticket')) return;
  const now = performance.now();
  taps = taps.filter((x) => now - x < 1500);
  taps.push(now);
  if (taps.length >= 5) {
    taps = [];
    toggleDebug();
  }
});
