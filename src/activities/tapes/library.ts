import { audio } from '../../audio';
import { game } from '../../core/game';
import { DAY_END } from '../../core/time';
import { G } from '../../core/state';
import { el, markup } from '../../ui/dom';
import { TAPES } from './catalog';
import { spineEl } from './dig';
import { DESIGNS, HAMMERS_EDITIONS, STORY_CARDS } from './extras';
import { completion, libraryTapes, starsFor, tapesState, watchedToday } from './state';
import type { MomentDef, TapeDef } from './types';

const KIND_ICON: Record<MomentDef['reward']['kind'], string> = { move: '🃏', story: '📇', hammers: '👑', line: '🎤', design: '🧵', clue: '🔎' };

function momentLabel(m: MomentDef): string {
  const r = m.reward;
  switch (r.kind) {
    case 'move':
      return `Move: ${m.name}`;
    case 'story':
      return `Story card: ${STORY_CARDS[r.card]?.name ?? r.card}`;
    case 'hammers':
      return `Hammers edition: ${HAMMERS_EDITIONS[r.edition]?.name ?? r.edition}`;
    case 'line':
      return `${r.line === 'chant' ? 'Chant' : 'Promo'}: "${r.text}"`;
    case 'design':
      return `Gear design: ${DESIGNS[r.design]?.name ?? r.design}`;
    case 'clue':
      return `Clue: ${r.title}`;
  }
}

export function starString(n: number): string {
  return '★'.repeat(n) + '☆'.repeat(3 - n);
}

/**
 * The TAPE LIBRARY: every tape you own on a wooden shelf, with completion
 * stars. Resolves with the tape to watch, or null to turn off the TV.
 */
export function openLibrary(parent: HTMLElement, opts: { justWatched?: string; newStars?: number } = {}): Promise<TapeDef | null> {
  return new Promise((resolve) => {
    const st = tapesState();
    const tapes = libraryTapes().sort((a, b) => a.year - b.year);
    const total = TAPES.length;
    const moments = tapes.reduce((s, t) => s + completion(t).caught, 0);
    const allMoments = tapes.reduce((s, t) => s + t.moments.length, 0);
    const tooLate = G.time.minutes > DAY_END - 60;

    const root = el('div', 'tp-library-wrap');
    const box = el('div', 'tp-library panel dark');
    const head = el('div', 'tp-lib-head', el('div', 'tp-lib-title', 'TAPE LIBRARY'), el('div', 'tp-lib-count', `${tapes.length} of ${total} tapes · ${moments}/${allMoments} moments caught`));
    const close = el('button', { class: 'btn small' }, 'Turn off TV');
    close.addEventListener('click', (e) => {
      e.stopPropagation();
      done(null);
    });
    head.append(close);
    const shelf = el('div', 'tp-shelf');
    const detail = el('div', 'tp-lib-detail');
    box.append(head, el('div', 'tp-lib-body', shelf, detail));
    root.append(box);
    parent.append(root);

    let sel = Math.max(0, tapes.findIndex((t) => t.id === opts.justWatched));
    if (opts.justWatched === undefined) {
      const firstUnwatched = tapes.findIndex((t) => !st.library[t.id].watched && !watchedToday(t.id));
      if (firstUnwatched >= 0) sel = firstUnwatched;
    }
    const items = tapes.map((t, i) => {
      const item = el('div', 'tp-shelf-item');
      const sp = spineEl(t, { seed: i * 5, short: true });
      const stars = starsFor(t);
      const starEl = el('div', `tp-stars s${stars}`, starString(stars));
      if (t.id === opts.justWatched && opts.newStars) starEl.classList.add('pop');
      if (!st.library[t.id].watched) item.append(el('div', 'tp-new', 'NEW'));
      item.append(sp, starEl);
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sel === i) play();
        else {
          sel = i;
          paint();
          audio.sfx('select');
        }
      });
      shelf.append(item);
      return item;
    });

    const play = () => {
      const t = tapes[sel];
      if (!t || watchedToday(t.id) || tooLate) {
        audio.sfx('error');
        return;
      }
      audio.sfx('confirm');
      done(t);
    };

    const paint = () => {
      items.forEach((it, i) => it.classList.toggle('sel', i === sel));
      items[sel]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      detail.innerHTML = '';
      const t = tapes[sel];
      if (!t) return;
      const e = st.library[t.id];
      const { caught, total: tot } = completion(t);
      detail.append(
        el('div', 'tp-lib-name', t.title),
        el('div', 'tp-meta', `${t.year} · ${t.promo}`),
        el('div', `tp-stars big s${starsFor(t)}`, `${starString(starsFor(t))}  ${caught}/${tot} moments`),
        el('div', { class: 'tp-blurb', html: markup(t.blurb) }),
        el('div', 'tp-lib-who', `On the tape: ${t.wrestlers.join(', ')}`),
      );
      const list = el('ul', 'tp-moments');
      for (const m of t.moments) {
        const got = e.caught.includes(m.id);
        list.append(el('li', got ? 'got' : '', got ? `${KIND_ICON[m.reward.kind]} ${momentLabel(m)}` : e.watched ? '▒▒▒ lost to static (try again another day)' : '??? (unwatched)'));
      }
      detail.append(list);
      if ((st.spares[t.id] ?? 0) > 0) detail.append(el('div', 'tp-meta', `Spare copies: ${st.spares[t.id]} (for trading or gifts)`));
      const btn = el('button', { class: 'btn primary' }, '▶ Pop it in') as HTMLButtonElement;
      if (watchedToday(t.id)) {
        btn.disabled = true;
        btn.textContent = 'Rewound for tomorrow';
        detail.append(el('div', 'tp-rewind-note', 'Be kind, rewind. The heads need a rest: watch it again another day.'));
      } else if (tooLate) {
        btn.disabled = true;
        btn.textContent = 'Too late for a whole tape';
      }
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        play();
      });
      detail.append(el('div', 'tp-actions', btn, el('span', 'tp-meta', 'One tape takes about an hour.')));
    };

    const cols = () => {
      const a = items[0]?.getBoundingClientRect();
      if (!a) return 1;
      const w = shelf.getBoundingClientRect().width;
      return Math.max(1, Math.floor(w / a.width));
    };
    const offKey = game.input.onKey((_k, code) => {
      if (code === 'ArrowLeft' || code === 'KeyA') sel = Math.max(0, sel - 1);
      else if (code === 'ArrowRight' || code === 'KeyD') sel = Math.min(tapes.length - 1, sel + 1);
      else if (code === 'ArrowUp' || code === 'KeyW') sel = Math.max(0, sel - cols());
      else if (code === 'ArrowDown' || code === 'KeyS') sel = Math.min(tapes.length - 1, sel + cols());
      else if (code === 'Enter' || code === 'Space' || code === 'KeyE') return play();
      else if (code === 'Escape' || code === 'KeyX') return done(null);
      else return;
      audio.sfx('select');
      paint();
    });

    function done(t: TapeDef | null) {
      offKey();
      root.classList.add('closing');
      setTimeout(() => root.remove(), 200);
      resolve(t);
    }
    paint();
  });
}
