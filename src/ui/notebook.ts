import '../systems/paper.css';
import './notebook.css';
import { audio } from '../audio';
import { block, game } from '../core/game';
import type { Weather } from '../core/state';
import { NPC_BY_ID } from '../data/npcs';
import { renderPortrait } from '../gfx/characters';
import type { Paper } from '../story/api';
import type { DaySummary } from '../systems/daylog';
import type { NightLine } from '../systems/goodnight-lines';
import type { Letter } from '../systems/mail';
import { lookFor } from '../world/scene';
import { el, markup, uiRoot } from './dom';
import { fmt } from './text';

/** Close an overlay on a tap anywhere or the usual keys. */
function dismissable(overlay: HTMLElement, onDone: () => void, ignore?: (t: EventTarget | null) => boolean): () => void {
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    overlay.removeEventListener('click', onClick);
    off();
    onDone();
  };
  const onClick = (e: Event) => {
    if (ignore?.(e.target)) return;
    finish();
  };
  overlay.addEventListener('click', onClick);
  const off = game.input.onKey((_k, c) => {
    if (ignore?.(null)) return;
    if (c === 'Space' || c === 'Enter' || c === 'Escape' || c === 'KeyE') finish();
  });
  return finish;
}

function stars(n: number): string {
  return '★'.repeat(Math.floor(n)) + (n % 1 >= 0.5 ? '½' : '');
}

export interface GoodnightPage {
  dateLine: string;
  /** "Spring 1, Year 1" */
  subLine: string;
  summary: DaySummary;
  line: NightLine;
  passedOut: boolean;
}

/** One page of Grandma's notebook: your day, and a line of hers. Tap to close. */
export function showGoodnight(p: GoodnightPage): Promise<void> {
  const unblock = block();
  audio.sfx('card-draw', { pitch: 0.7 });
  return new Promise((resolve) => {
    const overlay = el('div', 'overlay gn-overlay');
    const page = el('div', 'tattler notebook');
    page.append(el('div', 'nb-date nb-hand', p.dateLine, el('small', {}, p.subLine)));
    const s = p.summary;
    const row = (k: string, v: Node | string) => el('div', 'nb-row', el('div', 'nb-k', k), el('div', 'nb-v nb-hand', v));

    const m = s.moneyDelta;
    page.append(row('Money', m > 0 ? `Came out $${m} ahead.` : m < 0 ? `Spent $${-m}.` : "Didn't spend a cent."));

    if (s.talked.length) {
      const people = el('div', 'nb-people');
      for (const id of s.talked.slice(0, 8)) {
        const def = NPC_BY_ID[id];
        if (!def) continue;
        const src = renderPortrait(lookFor(id), 'happy', 32);
        const c = document.createElement('canvas');
        c.width = src.width;
        c.height = src.height;
        c.getContext('2d')!.drawImage(src, 0, 0);
        people.append(el('div', `nb-person nb-hand${s.newPeople.includes(id) ? ' new' : ''}`, c, el('span', {}, def.short)));
      }
      if (s.talked.length > 8) people.append(el('div', 'nb-person nb-hand', el('span', {}, `and ${s.talked.length - 8} more`)));
      page.append(el('div', 'nb-row', el('div', 'nb-k', 'Talked with'), el('div', 'nb-v', people)));
    } else {
      page.append(row('Talked with', 'Nobody. The yard counts.'));
    }

    if (s.chairs > 0) page.append(row('Chairs', s.chairs === 1 ? 'One folding chair.' : `${s.chairs} folding chairs.`));

    const show = s.show;
    if (show && show.stars !== null) {
      const where = show.venue === 'vfw' ? 'the VFW' : 'the Sportatorium';
      const v = el('span', { html: markup(`${s.wins > 0 ? 'Won' : 'Lost'} at ${where}. The crowd gave it *${stars(show.stars) || '½'}*`) });
      page.append(row('In the ring', v));
    } else if (show?.missed) {
      page.append(row('In the ring', 'Missed the show. Read about it tomorrow.'));
    } else if (show) {
      page.append(row('In the ring', `Watched from the back at ${show.venue === 'vfw' ? 'the VFW' : 'the Sportatorium'}.`));
    } else if (s.matches > 0) {
      page.append(row('In the ring', s.matches === 1 ? 'One match, nobody watching but Birdie.' : `${s.matches} matches.`));
    }
    if (p.passedOut) page.append(row('Bedtime', 'Fell asleep in my boots.'));

    const margin = el('div', 'nb-margin');
    margin.append(el('span', 'nb-when', `On an older page · ${p.line.date}`), el('span', { class: 'nb-hand', html: markup(fmt(p.line.text)) }));
    page.append(margin, el('div', 'tattler-foot', 'Tap to close the notebook'));
    overlay.append(page);
    uiRoot().append(overlay);
    dismissable(overlay, () => {
      overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-in' }).onfinish = () => {
        overlay.remove();
        unblock();
        game.input.clear();
        resolve();
      };
    });
  });
}

const WEATHER_WORDS: Record<Weather, [string, string]> = {
  sun: ['Fair skies', 'fair'],
  rain: ['Rain on the porch roof', 'rain'],
  storm: ['A storm rolling in', 'storms'],
  wind: ['Windy', 'wind'],
  snow: ['Snow', 'snow'],
};

export interface BreakfastTable {
  weekday: string;
  date: string;
  today: Weather;
  tomorrow: Weather;
  showLine: string | null;
  lines: string[];
  paper: Paper | null;
  letters: Letter[];
  openPaper: (p: Paper) => Promise<void>;
  openLetter: (l: Letter) => Promise<void>;
}

/**
 * The kitchen table in the morning: the date, the sky, the Tattler folded
 * by your plate, and today's letters as envelopes. One spread instead of a
 * chain of pop-ups. Resolves when you start the day.
 */
export function showBreakfast(t: BreakfastTable): Promise<void> {
  const unblock = block();
  return new Promise((resolve) => {
    const overlay = el('div', 'overlay bf-overlay');
    const table = el('div', 'tattler breakfast');
    const cal = el('div', 'bf-cal', el('div', 'bf-day', t.weekday), el('div', 'bf-date', t.date));
    const [now] = WEATHER_WORDS[t.today];
    const weather = el('div', { class: 'bf-weather', html: markup(`*${now}* this morning. Gus on WRSL says ${WEATHER_WORDS[t.tomorrow][1]} tomorrow.`).replace(/<em>/g, '<b>').replace(/<\/em>/g, '</b>') });
    table.append(el('div', 'bf-top', cal, weather));
    if (t.showLine) table.append(el('div', 'bf-show', t.showLine));
    if (t.lines.length) {
      const lines = el('div', 'bf-lines');
      for (const ln of t.lines) lines.append(el('p', { html: markup(fmt(ln)) }));
      table.append(lines);
    }
    let busy = false;
    const items = el('div', 'bf-items');
    const mailNote = el('span', 'label', t.letters.length ? 'Unopened mail waits in the mailbox' : '');
    if (t.paper) {
      const paper = t.paper;
      const b = el('button', 'bf-paper', el('div', 'bf-mast', 'The Turnbuckle Tattler'), el('div', 'bf-head', paper.headline), el('div', 'bf-read', 'Read it'));
      b.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (busy) return;
        busy = true;
        await t.openPaper(paper);
        busy = false;
      });
      items.append(b);
    }
    for (const l of t.letters) {
      const b = el('button', 'bf-env', el('span', 'bf-from', 'From'), el('span', { html: markup(fmt(l.from)) }));
      b.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (busy) return;
        busy = true;
        await t.openLetter(l);
        b.classList.add('opened');
        if (!items.querySelector('.bf-env:not(.opened)')) mailNote.textContent = '';
        busy = false;
      });
      items.append(b);
    }
    if (items.childElementCount) table.append(items);
    const go = el('button', { class: 'btn primary' }, 'Start the day');
    table.append(el('div', 'bf-foot', mailNote, go));
    overlay.append(table);
    uiRoot().append(overlay);
    audio.sfx('pickup', { pitch: 0.85 });
    const finish = dismissable(
      overlay,
      () => {
        overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in' }).onfinish = () => {
          overlay.remove();
          unblock();
          game.input.clear();
          resolve();
        };
      },
      // Taps on the table itself (reading the paper, opening mail) don't end breakfast; the overlay around it does.
      (target) => busy || (target instanceof Node && table.contains(target) && target !== table),
    );
    go.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!busy) finish();
    });
  });
}
