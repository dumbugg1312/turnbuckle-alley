import './paper.css';
import { audio } from '../audio';
import { block, game } from '../core/game';
import { ext } from '../core/state';
import { narrate } from '../ui/dialog';
import { el, markup, uiRoot } from '../ui/dom';
import { fmt } from '../ui/text';

/** Letters in Grandma's mailbox: from Grandma, Birdie, fans, the town. */
export interface Letter {
  id: string;
  from: string;
  body: string[];
  /** Item attached (id). */
  gift?: string;
}
export interface MailState {
  inbox: Letter[];
  read: string[];
}
export function mailState(): MailState {
  return ext<MailState>('mail', () => ({ inbox: [], read: [] }));
}

export function sendLetter(l: Letter): void {
  const s = mailState();
  if (s.read.includes(l.id) || s.inbox.some((x) => x.id === l.id)) return;
  s.inbox.push(l);
}

export async function checkMail(): Promise<void> {
  const s = mailState();
  if (!s.inbox.length) {
    await narrate(['The mailbox is empty. A spider has moved in.', 'Nothing today. Mo will be by tomorrow.', 'Empty, except for a coupon for the Hot Tag Diner. (Expired in 1997.)'][Math.floor(Math.random() * 3)]);
    return;
  }
  while (s.inbox.length) {
    const l = s.inbox.shift()!;
    s.read.push(l.id);
    await showLetter(l);
    if (l.gift) {
      const { addItem } = await import('../core/state');
      addItem(l.gift, 1);
      // Tell the player they actually got something.
      const [{ toast }, { item }, { iconFor }] = await Promise.all([import('../ui/dialog'), import('../data/items'), import('../gfx/icons')]);
      toast(`Got ${item(l.gift).name}`, iconFor(l.gift));
    }
  }
}

export function showLetter(l: Letter): Promise<void> {
  const unblock = block();
  audio.sfx('pickup');
  return new Promise((resolve) => {
    const overlay = el('div', 'overlay');
    const sheet = el('div', 'tattler letter');
    sheet.style.transform = 'rotate(1deg)';
    sheet.style.fontFamily = "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive";
    for (const p of l.body) sheet.append(el('p', { html: markup(fmt(p)), style: 'font-size: calc(var(--u) * 8.5); line-height: 1.45; margin: 0 0 calc(var(--u) * 4)' }));
    sheet.append(el('p', { html: markup(fmt(`- ${l.from}`)), style: 'text-align: right; font-size: calc(var(--u) * 9)' }));
    sheet.append(el('div', 'tattler-foot', 'Tap to fold the letter'));
    let folding = false;
    const done = () => {
      if (folding) return;
      folding = true;
      off();
      void foldAway(sheet).then(() => {
        overlay.remove();
        unblock();
        game.input.clear();
        resolve();
      });
    };
    overlay.addEventListener('click', done);
    const off = game.input.onKey((_k, c) => {
      if (c === 'Space' || c === 'Enter' || c === 'Escape' || c === 'KeyE') done();
    });
    overlay.append(sheet);
    uiRoot().append(overlay);
  });
}

/**
 * Fold a letter in thirds: crease lines appear, the bottom panel folds up,
 * the top panel folds down over it, and the folded letter drops away.
 */
function foldAway(sheet: HTMLElement): Promise<void> {
  const r = sheet.getBoundingClientRect();
  const tilt = sheet.style.transform || 'none';
  const stage = el('div', 'fold-stage');
  Object.assign(stage.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, transform: tilt });
  const slice = (i: number): HTMLElement => {
    const c = sheet.cloneNode(true) as HTMLElement;
    c.classList.add('fold-slice', `fold-${['top', 'mid', 'bot'][i]}`);
    Object.assign(c.style, { width: `${r.width}px`, height: `${r.height}px`, maxHeight: 'none', transform: '', animation: 'none' });
    c.scrollTop = sheet.scrollTop;
    if (i !== 1) c.append(el('div', 'fold-back'));
    return c;
  };
  stage.append(slice(1), slice(2), slice(0), el('div', 'fold-crease c1'), el('div', 'fold-crease c2'));
  sheet.parentElement?.append(stage);
  sheet.style.visibility = 'hidden';
  audio.sfx('card-draw', { pitch: 0.8 });
  setTimeout(() => audio.sfx('card-draw', { pitch: 0.9 }), 330);
  setTimeout(() => audio.sfx('pickup', { pitch: 0.7 }), 700);
  return new Promise((res) => setTimeout(res, 1050));
}
