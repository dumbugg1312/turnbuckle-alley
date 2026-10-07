import './menu.css';
import { audio } from '../audio';
import { block, game } from '../core/game';
import { saveGame } from '../core/save';
import { G, hearts, rel, RANK_NAMES, skillLevel, addItem, type InvolvementMode, type SkillId } from '../core/state';
import { DIALOGUE } from '../data/dialogue';
import { item, ITEMS } from '../data/items';
import { NPC_BY_ID } from '../data/npcs';
import { renderPortrait } from '../gfx/characters';
import { iconFor } from '../gfx/icons';
import { TYPE_COLORS, TYPE_LABEL } from '../match/cardart';
import { cardDef } from '../match/cards';
import { lookFor } from '../world/scene';
import { toast } from './dialog';
import { el, markup, uiRoot } from './dom';

type Tab = 'bag' | 'moves' | 'people' | 'stories' | 'collection' | 'career' | 'settings';
const TABS: [Tab, string, string][] = [
  ['bag', '🎒', 'Bag'],
  ['moves', '🃏', 'Moves'],
  ['people', '♥', 'People'],
  ['stories', '📌', 'Stories'],
  ['collection', '📼', 'Collection'],
  ['career', '🏆', 'Career'],
  ['settings', '⚙', 'Settings'],
];

let open = false;

function canvasCopy(src: HTMLCanvasElement, cls: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  c.className = cls;
  c.getContext('2d')!.drawImage(src, 0, 0);
  return c;
}

export function openMenu(start: Tab = 'bag'): Promise<void> {
  if (open) return Promise.resolve();
  open = true;
  const unblock = block();
  audio.sfx('select');
  return new Promise((resolve) => {
    const overlay = el('div', 'overlay menu-overlay');
    const book = el('div', 'menu-book panel');
    const rail = el('div', 'menu-rail');
    const body = el('div', 'menu-body');
    const close = el('button', { class: 'btn small menu-close' }, '✕');
    let tab: Tab = start;
    const render = () => {
      [...rail.children].forEach((b) => b.classList.toggle('on', (b as HTMLElement).dataset.tab === tab));
      body.innerHTML = '';
      body.append(RENDER[tab](() => render()));
    };
    for (const [id, ico, label] of TABS) {
      const b = el('button', { class: 'menu-tab', 'data-tab': id }, el('span', 'ico', ico), el('span', 'lbl', label));
      b.addEventListener('click', () => {
        tab = id;
        audio.sfx('select');
        render();
      });
      rail.append(b);
    }
    const finish = () => {
      open = false;
      overlay.remove();
      off();
      unblock();
      game.input.clear();
      resolve();
    };
    close.addEventListener('click', finish);
    overlay.addEventListener('pointerdown', (e) => {
      if (e.target === overlay) finish();
    });
    const off = game.input.onKey((_k, code) => {
      if (code === 'Escape' || code === 'Tab' || code === 'KeyI' || code === 'KeyM') finish();
    });
    book.append(rail, body, close);
    overlay.append(book);
    uiRoot().append(overlay);
    render();
  });
}

const RENDER: Record<Tab, (rerender: () => void) => HTMLElement> = {
  bag: (rerender) => {
    const wrap = el('div', 'menu-page');
    wrap.append(el('h2', {}, 'Bag'), el('div', 'menu-sub', `$${G.player.money} · Energy ${Math.round(G.player.energy)}/${G.player.maxEnergy}`));
    const grid = el('div', 'item-grid');
    const detail = el('div', 'item-detail panel dark');
    const ids = Object.keys(G.player.inventory).filter((id) => G.player.inventory[id] > 0);
    if (!ids.length) grid.append(el('div', 'menu-empty', 'Empty pockets. The flea market opens on weekends.'));
    for (const id of ids) {
      const def = item(id);
      const cell = el('button', 'item-cell');
      cell.append(canvasCopy(iconFor(id), 'item-ico'), el('span', 'item-n', String(G.player.inventory[id])));
      cell.addEventListener('click', () => {
        detail.innerHTML = '';
        detail.append(el('h3', {}, def.name), el('p', {}, def.desc));
        if (id === 'trading-card') {
          const open = el('button', { class: 'btn primary small' }, 'Open pack!');
          open.addEventListener('click', async () => {
            const { usePack } = await import('../systems/cards');
            await usePack();
            rerender();
          });
          detail.append(open);
        }
        if (def.energy) {
          const eat = el('button', { class: 'btn primary small' }, `Eat (+${def.energy} energy)`);
          eat.addEventListener('click', () => {
            addItem(id, -1);
            G.player.energy = Math.min(G.player.maxEnergy, G.player.energy + def.energy!);
            audio.sfx('pickup');
            toast(`Ate ${def.name}. Energy ${Math.round(G.player.energy)}.`);
            rerender();
          });
          detail.append(eat);
        }
      });
      grid.append(cell);
    }
    wrap.append(grid, detail);
    return wrap;
  },
  moves: () => {
    const wrap = el('div', 'menu-page');
    wrap.append(el('h2', {}, 'Moveset'), el('div', 'menu-sub', `${G.player.deck.length} cards. Your deck is your wrestling style. Learn moves from tapes, trainers and the Dungeon.`));
    const list = el('div', 'move-list');
    const counts: Record<string, number> = {};
    for (const e of G.player.deck) counts[e] = (counts[e] ?? 0) + 1;
    for (const [e, n] of Object.entries(counts)) {
      let d;
      try {
        d = cardDef(e);
      } catch {
        continue;
      }
      const name = d.id === 'signature' ? G.player.persona?.signatureName ?? d.name : d.name;
      const row = el('div', 'move-row');
      row.style.setProperty('--c', TYPE_COLORS[d.type][0]);
      row.append(el('span', 'move-cost', String(d.cost)), el('span', 'move-name', `${name}${n > 1 ? ` ×${n}` : ''}`), el('span', 'move-type', TYPE_LABEL[d.type]), el('span', 'move-text', d.text));
      list.append(row);
    }
    wrap.append(list);
    return wrap;
  },
  people: () => {
    const wrap = el('div', 'menu-page');
    wrap.append(el('h2', {}, 'People'));
    const met = Object.keys(G.relationships).filter((id) => NPC_BY_ID[id]);
    if (!met.length) wrap.append(el('div', 'menu-empty', "You haven't met anyone yet. Say hi! Everybody here has a story."));
    const list = el('div', 'people-list');
    met.sort((a, b) => rel(b).points - rel(a).points);
    for (const id of met) {
      const def = NPC_BY_ID[id];
      const r = rel(id);
      const row = el('div', 'person-row');
      row.append(canvasCopy(renderPortrait(lookFor(id), 'neutral', 48), 'person-portrait'));
      const info = el('div', 'person-info');
      const h = hearts(id);
      const heartsEl = el('div', 'person-hearts');
      for (let i = 0; i < 10; i++) heartsEl.append(el('span', i < h ? 'on' : '', '♥'));
      const bday = DIALOGUE[id]?.birthday;
      const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
      info.append(
        el('div', 'person-name', def.short + (def.wrestler ? ` · ${def.wrestler.ringName}` : '')),
        el('div', 'person-role', def.role),
        heartsEl,
        el('div', 'person-flags', `${r.talkedToday ? '✓ Talked today' : '○ Not talked today'} · ${r.giftedToday ? '✓ Gift given' : '○ No gift yet'}${bday ? ` · Birthday ${seasons[bday.season]} ${bday.day}` : ''}`),
      );
      row.append(info);
      list.append(row);
    }
    wrap.append(list);
    return wrap;
  },
  stories: () => {
    const wrap = el('div', 'menu-page');
    wrap.append(el('h2', {}, 'Stories'), el('div', 'menu-sub', "Every feud, alliance and slow-burn grudge you're part of lives on Birdie's corkboard."));
    const b = el('button', { class: 'btn primary' }, "Open the corkboard");
    b.addEventListener('click', async () => {
      const { story } = await import('../story');
      await story.openJournal();
    });
    wrap.append(b);
    return wrap;
  },
  collection: () => {
    const wrap = el('div', 'menu-page');
    wrap.append(el('h2', {}, 'Collection'));
    const tapes = (G.ext['tapes'] as { library?: Record<string, unknown> } | undefined)?.library ?? {};
    const chairs = (G.ext['chairs'] as { found?: number } | undefined)?.found ?? 0;
    const cards = (G.ext['cards'] as { binder?: Record<string, number> } | undefined)?.binder ?? {};
    const grid = el('div', 'stat-grid');
    const stat = (label: string, value: string, note: string) => grid.append(el('div', 'stat panel', el('div', 'stat-v', value), el('div', 'stat-l', label), el('div', 'stat-n', note)));
    stat('Tapes', String(Object.keys(tapes).length), 'Watch them on any VCR');
    stat('Folding chairs', String(chairs), 'Each one is a seat at the show');
    stat('Trading cards', String(Object.keys(cards).length), 'Open packs from the gas station');
    wrap.append(grid);
    const binder = el('button', { class: 'btn gold' }, 'Open the card binder');
    binder.addEventListener('click', async () => {
      const { openBinder } = await import('../systems/cards');
      await openBinder();
    });
    wrap.append(el('div', 'menu-actions', binder));
    return wrap;
  },
  career: () => {
    const p = G.player;
    const wrap = el('div', 'menu-page');
    wrap.append(el('h2', {}, p.persona?.ringName ?? p.name), el('div', 'menu-sub', `${RANK_NAMES[p.rank]}${p.persona ? ` · ${p.persona.alignment === 'face' ? 'Hero' : p.persona.alignment === 'heel' ? 'Villain' : 'Tweener'}` : ''}`));
    const grid = el('div', 'stat-grid');
    const stat = (label: string, value: string, note = '') => grid.append(el('div', 'stat panel', el('div', 'stat-v', value), el('div', 'stat-l', label), note ? el('div', 'stat-n', note) : ''));
    stat('Fans', p.fans.toLocaleString());
    stat('Respect', String(p.respect), 'Earned in the locker room');
    stat('Matches', String(p.matches), `${p.wins} wins`);
    stat('Best match', p.bestStars ? `${p.bestStars}★` : '-');
    const skills: [SkillId, string][] = [['strength', 'Strength'], ['ringiq', 'Ring IQ'], ['charisma', 'Charisma'], ['craft', 'Craft'], ['story', 'Storytelling']];
    for (const [id, label] of skills) stat(label, `Lv ${skillLevel(id)}`);
    wrap.append(grid);
    if (G.showHistory.length) {
      wrap.append(el('h3', {}, 'Recent shows'));
      for (const s of G.showHistory.slice(-5).reverse()) wrap.append(el('div', 'history-row', `${s.venue === 'vfw' ? 'VFW' : 'Sportatorium'} · ${s.attendance} fans · ${s.playerStars !== null ? s.playerStars + '★' : 'night off'} · "${s.headline}"`));
    }
    return wrap;
  },
  settings: (rerender) => {
    const s = G.settings;
    const wrap = el('div', 'menu-page');
    wrap.append(el('h2', {}, 'Settings'));
    const row = (label: string, ctl: HTMLElement, hint = '') => wrap.append(el('div', 'setting-row', el('div', 'setting-l', el('div', {}, label), hint ? el('div', 'setting-h', hint) : ''), ctl));
    const seg = <T extends string>(val: T, opts: [T, string][], set: (v: T) => void) => {
      const g = el('div', 'seg');
      for (const [v, l] of opts) {
        const b = el('button', { class: `seg-b${v === val ? ' on' : ''}` }, l);
        b.addEventListener('click', () => {
          set(v);
          audio.sfx('select');
          rerender();
        });
        g.append(b);
      }
      return g;
    };
    row('Story control', seg<InvolvementMode>(s.involvement, [['ask', 'Ask me'], ['drive', 'You drive'], ['together', 'Together'], ['idea', 'My ideas']], (v) => (s.involvement = v)), 'How much you steer storylines when someone pitches one');
    row('Text speed', seg(String(s.textSpeed), [['30', 'Slow'], ['55', 'Normal'], ['90', 'Fast'], ['400', 'Instant']], (v) => (s.textSpeed = Number(v))));
    const slider = (val: number, set: (v: number) => void) => {
      const i = el('input', { type: 'range', min: 0, max: 100, value: Math.round(val * 100), class: 'slider' }) as HTMLInputElement;
      i.addEventListener('input', () => {
        set(Number(i.value) / 100);
        audio.volumes(s.music, s.sfx);
      });
      return i;
    };
    row('Music', slider(s.music, (v) => (s.music = v)));
    row('Sound', slider(s.sfx, (v) => (s.sfx = v)));
    row('Auto kick-outs', seg(s.autoKickout ? 'on' : 'off', [['off', 'Off'], ['on', 'On']], (v) => (s.autoKickout = v === 'on')), 'Skip the timing tap when you get pinned');
    row('Reduce motion', seg(s.reduceMotion ? 'on' : 'off', [['off', 'Off'], ['on', 'On']], (v) => (s.reduceMotion = v === 'on')));
    const actions = el('div', 'menu-actions');
    const save = el('button', { class: 'btn teal' }, 'Save now');
    save.addEventListener('click', () => toast(saveGame() ? 'Saved!' : "Couldn't save (storage blocked)."));
    const quit = el('button', { class: 'btn' }, 'Save & return to title');
    quit.addEventListener('click', () => {
      saveGame();
      location.hash = '';
      location.reload();
    });
    actions.append(save, quit);
    wrap.append(actions);
    return wrap;
  },
};

/** Item picker for gifts, crafting, selling. Resolves null if cancelled. */
export function pickItem(title: string, ids: string[]): Promise<string | null> {
  const unblock = block();
  return new Promise((resolve) => {
    const overlay = el('div', 'overlay');
    const box = el('div', 'modal panel pick-modal');
    box.append(el('h2', {}, title));
    const grid = el('div', 'item-grid');
    const desc = el('div', 'pick-desc', 'Tap an item.');
    const done = (v: string | null) => {
      overlay.remove();
      off();
      unblock();
      game.input.clear();
      resolve(v);
    };
    let picked: string | null = null;
    let lastType = 'mouse';
    const cells: HTMLElement[] = [];
    for (const id of ids) {
      if (!ITEMS[id]) continue;
      const cell = el('button', 'item-cell');
      cell.append(canvasCopy(iconFor(id), 'item-ico'), el('span', 'item-n', String(G.player.inventory[id] ?? 0)));
      const show = () => (desc.innerHTML = `<b>${markup(item(id).name)}</b>: ${markup(item(id).desc)}`);
      cell.addEventListener('pointerenter', show);
      cell.addEventListener('pointerdown', (e) => (lastType = e.pointerType));
      cell.addEventListener('click', () => {
        // Touch has no hover: the first tap shows what the item is, the second
        // confirms. (Otherwise one stray tap gives away or sells the wrong thing.)
        if (lastType === 'touch' && picked !== id) {
          picked = id;
          show();
          for (const c of cells) c.style.outline = '';
          cell.style.outline = '3px solid #f4b63f';
          audio.sfx('select');
          return;
        }
        audio.sfx('confirm');
        done(id);
      });
      cells.push(cell);
      grid.append(cell);
    }
    const cancel = el('button', { class: 'btn small' }, 'Never mind');
    cancel.addEventListener('click', () => done(null));
    box.append(grid, desc, el('div', 'menu-actions', cancel));
    overlay.append(box);
    uiRoot().append(overlay);
    const off = game.input.onKey((_k, code) => {
      if (code === 'Escape') done(null);
    });
  });
}
