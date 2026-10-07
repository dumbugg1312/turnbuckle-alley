import './cards.css';
import { audio } from '../audio';
import { block, game } from '../core/game';
import { G, ext, addItem } from '../core/state';
import { sting } from '../core/sting';
import { NPCS } from '../data/npcs';
import { renderPortrait } from '../gfx/characters';
import { toast } from '../ui/dialog';
import { el, uiRoot } from '../ui/dom';
import { lookFor } from '../world/scene';

/**
 * Turnbuckle Alley trading cards: every resident and legend has a card, with
 * shiny (holo) variants. Packs come from the gas station and Fenwick's.
 */
export interface TCard {
  id: string;
  npc: string | null;
  name: string;
  title: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legend';
  flavor: string;
}

const LEGENDS: TCard[] = [
  { id: 'legend-velvet', npc: 'birdie', name: 'The Velvet Hammers', title: '1981 Tag Champions', rarity: 'legend', flavor: 'Two women, one belt. Never better.' },
  { id: 'legend-duchess', npc: 'grandma', name: '"The Duchess" Dottie Dupree', title: 'Hall of Fame (someday)', rarity: 'legend', flavor: 'She made them beg, then she made them believe.' },
  { id: 'legend-lou', npc: 'lou', name: 'Sweet Lou Bastian', title: '1970s Legend', rarity: 'legend', flavor: 'Atomic elbow, sugar-sweet smile.' },
  { id: 'legend-midnight', npc: 'june', name: 'Madame Midnight', title: '1980s Manager', rarity: 'rare', flavor: 'Never lost an argument with a referee. Never won one, either.' },
];

function buildCatalog(): TCard[] {
  const list: TCard[] = [];
  for (const n of NPCS) {
    if (n.id === 'royce' || n.id === 'arlo' || n.id === 'grandma') continue;
    const wrestler = n.wrestler;
    list.push({
      id: `card-${n.id}`,
      npc: n.id,
      name: wrestler?.ringName ?? n.short,
      title: wrestler ? `${wrestler.role === 'face' ? 'Fan Favorite' : 'Villain'} · ${wrestler.style}` : n.role,
      rarity: wrestler ? (wrestler.level >= 4 ? 'rare' : 'uncommon') : 'common',
      flavor: wrestler ? `Finisher: ${wrestler.finisher}` : n.role,
    });
  }
  return [...list, ...LEGENDS];
}
export const CARD_CATALOG: TCard[] = buildCatalog();

interface CardState {
  binder: Record<string, number>;
  holo: string[];
}
export function cardState(): CardState {
  return ext<CardState>('cards', () => ({ binder: {}, holo: [] }));
}

function roll(): { card: TCard; holo: boolean } {
  const r = Math.random();
  const tier: TCard['rarity'] = r < 0.03 ? 'legend' : r < 0.18 ? 'rare' : r < 0.5 ? 'uncommon' : 'common';
  let pool = CARD_CATALOG.filter((c) => c.rarity === tier);
  if (!pool.length) pool = CARD_CATALOG;
  return { card: pool[Math.floor(Math.random() * pool.length)], holo: Math.random() < 0.06 };
}

function cardEl(c: TCard, holo: boolean, owned = true): HTMLElement {
  const d = el('div', `tcard r-${c.rarity}${holo ? ' holo' : ''}${owned ? '' : ' missing'}`);
  const art = el('div', 'tcard-art');
  if (owned && c.npc) {
    const p = renderPortrait(lookFor(c.npc), 'happy', 48);
    const cv = document.createElement('canvas');
    cv.width = p.width;
    cv.height = p.height;
    cv.getContext('2d')!.drawImage(p, 0, 0);
    art.append(cv);
  } else art.append(el('div', 'tcard-q', '?'));
  // Non-wrestlers use their role for both lines; don't print it twice.
  const flavor = owned && c.flavor !== c.title ? c.flavor : '';
  d.append(art, el('div', 'tcard-name', owned ? c.name : '???'), el('div', 'tcard-title', owned ? c.title : ''), el('div', 'tcard-flavor', flavor), el('div', 'tcard-rar', c.rarity.toUpperCase()));
  return d;
}

/** Open one pack: five cards flip over one by one. */
export function openPack(): Promise<void> {
  const unblock = block();
  const cs = cardState();
  const pulls = Array.from({ length: 5 }, roll);
  return new Promise((resolve) => {
    const overlay = el('div', 'overlay');
    const box = el('div', 'pack-open');
    box.append(el('div', 'pack-title', 'TURNBUCKLE ALLEY · SERIES 1'));
    const row = el('div', 'pack-row');
    pulls.forEach((p, i) => {
      const slot = el('div', 'pack-slot');
      const back = el('div', 'tcard back', el('div', 'tcard-back-logo', 'TA'));
      slot.append(back);
      row.append(slot);
      setTimeout(() => {
        const isNew = !cs.binder[p.card.id];
        cs.binder[p.card.id] = (cs.binder[p.card.id] ?? 0) + 1;
        if (p.holo && !cs.holo.includes(p.card.id)) cs.holo.push(p.card.id);
        const face = cardEl(p.card, p.holo);
        if (isNew) face.append(el('div', 'tcard-new', 'NEW!'));
        slot.innerHTML = '';
        slot.append(face);
        audio.sfx(p.card.rarity === 'legend' || p.holo ? 'star' : 'card-draw', { pitch: 1 + i * 0.08 });
        if (p.card.rarity === 'legend' || p.holo) sting('item-get');
      }, 500 + i * 450);
    });
    const done = el('button', { class: 'btn primary' }, 'Into the binder');
    done.style.opacity = '0';
    setTimeout(() => (done.style.opacity = '1'), 500 + 5 * 450);
    done.addEventListener('click', () => {
      overlay.remove();
      unblock();
      game.input.clear();
      const owned = Object.keys(cs.binder).length;
      toast(`Binder: ${owned}/${CARD_CATALOG.length} cards`);
      resolve();
    });
    box.append(row, done);
    overlay.append(box);
    uiRoot().append(overlay);
  });
}

export function openBinder(): Promise<void> {
  const unblock = block();
  const cs = cardState();
  return new Promise((resolve) => {
    const overlay = el('div', 'overlay');
    const box = el('div', 'modal panel binder');
    const owned = CARD_CATALOG.filter((c) => cs.binder[c.id]).length;
    box.append(el('h2', {}, `Card Binder · ${owned}/${CARD_CATALOG.length}`));
    const grid = el('div', 'binder-grid');
    for (const c of CARD_CATALOG) grid.append(cardEl(c, cs.holo.includes(c.id), !!cs.binder[c.id]));
    const close = el('button', { class: 'btn' }, 'Close');
    let closed = false;
    const finish = () => {
      if (closed) return;
      closed = true;
      overlay.remove();
      off();
      unblock();
      game.input.clear();
      resolve();
    };
    close.addEventListener('click', finish);
    const off = game.input.onKey((_k, code) => {
      if (code === 'Escape') finish();
    });
    box.append(grid, el('div', 'menu-actions', close));
    overlay.append(box);
    uiRoot().append(overlay);
  });
}

/** Called from the bag when using a pack. */
export async function usePack(): Promise<void> {
  if ((G.player.inventory['trading-card'] ?? 0) <= 0) return;
  addItem('trading-card', -1);
  await openPack();
}
