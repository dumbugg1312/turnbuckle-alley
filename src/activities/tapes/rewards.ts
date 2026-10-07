import '../../match/match.css';
import { audio } from '../../audio';
import { game } from '../../core/game';
import { G } from '../../core/state';
import { sting } from '../../core/sting';
import { cardArt, TYPE_COLORS, TYPE_LABEL } from '../../match/cardart';
import { cardDef, CARDS } from '../../match/cards';
import { narrate } from '../../ui/dialog';
import { el, markup } from '../../ui/dom';
import { DESIGNS, HAMMERS_EDITIONS, STORY_CARDS, type DesignDef } from './extras';
import { applyReward } from './state';
import type { MomentDef, Reward, TapeDef } from './types';

const SLOT_COLOR: Record<string, string> = { hook: '#d8434b', twist: '#6a3fa0', stakes: '#c27a1e', payoff: '#1d6e6b', segment: '#3f74d8', wildcard: '#c8307a' };

function moveCardEl(id: string): HTMLElement {
  const d = cardDef(id);
  const [frame, deep, light] = TYPE_COLORS[d.type];
  const card = el('div', `card t-${d.type}`);
  card.style.setProperty('--frame', frame);
  card.style.setProperty('--deep', deep);
  card.style.setProperty('--light', light);
  card.append(el('div', 'cost', String(d.cost)), el('div', 'name', d.name));
  const art = cardArt(d);
  const cv = document.createElement('canvas');
  cv.width = art.width;
  cv.height = art.height;
  cv.className = 'art';
  cv.getContext('2d')!.drawImage(art, 0, 0);
  card.append(cv, el('div', 'type', TYPE_LABEL[d.type]), el('div', 'pop', d.type === 'sell' && d.sellMult ? `×${d.sellMult}` : d.pop ? `+${d.pop}` : '—'));
  return card;
}

/** A little fabric swatch for gear designs. */
export function swatch(d: DesignDef, w = 64, h = 48): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.className = 'tp-swatch';
  const x = c.getContext('2d')!;
  const [a, b, hi] = d.colors;
  x.fillStyle = a;
  x.fillRect(0, 0, w, h);
  x.fillStyle = b;
  switch (d.pattern) {
    case 'stripes':
    case 'tux':
      for (let i = 0; i < w; i += 8) x.fillRect(i, 0, 3, h);
      break;
    case 'checker':
      for (let yy = 0; yy < h; yy += 6) for (let xx = (yy / 6) % 2 ? 6 : 0; xx < w; xx += 12) x.fillRect(xx, yy, 6, 6);
      break;
    case 'plaid':
      for (let i = 0; i < w; i += 10) x.fillRect(i, 0, 3, h);
      x.globalAlpha = 0.6;
      for (let i = 0; i < h; i += 10) x.fillRect(0, i, w, 3);
      x.globalAlpha = 1;
      break;
    case 'flames':
    case 'lightning':
      for (let i = 0; i < 5; i++) {
        x.beginPath();
        x.moveTo(i * 14, h);
        x.lineTo(i * 14 + 5, h * 0.35);
        x.lineTo(i * 14 + 8, h * 0.6);
        x.lineTo(i * 14 + 12, h * 0.2);
        x.lineTo(i * 14 + 13, h);
        x.fill();
      }
      break;
    case 'wings':
    case 'moth':
      x.beginPath();
      x.ellipse(w * 0.3, h * 0.5, w * 0.22, h * 0.36, -0.4, 0, Math.PI * 2);
      x.ellipse(w * 0.7, h * 0.5, w * 0.22, h * 0.36, 0.4, 0, Math.PI * 2);
      x.fill();
      x.fillStyle = hi;
      x.fillRect(w * 0.26, h * 0.42, 5, 5);
      x.fillRect(w * 0.7, h * 0.42, 5, 5);
      break;
    case 'scales':
      for (let yy = 0; yy < h; yy += 6) for (let xx = (yy / 6) % 2 ? 4 : 0; xx < w; xx += 8) {
        x.beginPath();
        x.arc(xx, yy, 3, 0, Math.PI);
        x.fill();
      }
      break;
    case 'fringe':
      x.fillRect(0, h * 0.55, w, 3);
      for (let i = 0; i < w; i += 3) x.fillRect(i, h * 0.55, 1, h * 0.45);
      break;
    default:
      // velvet / sequins / snowflakes / stars: a scatter of highlights
      for (let i = 0; i < 40; i++) {
        x.fillStyle = i % 3 ? b : hi;
        const px = (i * 37) % w;
        const py = (i * 53) % h;
        if (d.pattern === 'snowflakes' || d.pattern === 'stars') {
          x.fillRect(px, py - 1, 1, 3);
          x.fillRect(px - 1, py, 3, 1);
        } else x.fillRect(px, py, 2, 2);
      }
  }
  x.fillStyle = 'rgba(255,255,255,0.12)';
  x.fillRect(0, 0, w, h / 3);
  return c;
}

function rewardBody(tape: TapeDef, r: Reward, summary: { title: string; detail: string }): HTMLElement {
  const body = el('div', 'tp-rw-body');
  switch (r.kind) {
    case 'story': {
      const info = STORY_CARDS[r.card];
      const card = el('div', 'tp-index');
      card.style.setProperty('--slot', SLOT_COLOR[info?.slot ?? 'hook']);
      card.append(el('div', 'tp-index-slot', `${info?.slot ?? ''} · ${r.card}`), el('div', 'tp-index-name', info?.name ?? r.card), el('div', 'tp-index-text', info?.text ?? ''));
      body.append(el('div', 'tp-rw-kind', 'STORY CARD'), card);
      break;
    }
    case 'hammers': {
      const ed = HAMMERS_EDITIONS[r.edition];
      const card = el('div', 'tp-index hammers');
      card.append(el('div', 'tp-index-slot', `HAMMERS EDITION · ${ed?.year ?? ''}`), el('div', 'tp-index-name', ed?.name ?? r.edition), el('div', 'tp-index-text', ed?.story ?? ''), el('div', 'tp-index-base', `Plays as: ${ed?.baseName ?? ''} (${ed?.base ?? ''})`));
      body.append(el('div', 'tp-rw-kind', 'A VELVET HAMMERS STORY'), card);
      break;
    }
    case 'line': {
      const card = el('div', r.line === 'chant' ? 'tp-chant' : 'tp-promo');
      card.append(el('div', {}, r.line === 'chant' ? r.text : `"${r.text}"`));
      body.append(el('div', 'tp-rw-kind', r.line === 'chant' ? 'CROWD CHANT' : 'PROMO LINE'), card);
      break;
    }
    case 'design': {
      const d = DESIGNS[r.design];
      body.append(el('div', 'tp-rw-kind', 'GEAR DESIGN'));
      if (d) body.append(el('div', 'tp-design', swatch(d), el('div', {}, el('b', {}, d.name), el('div', 'tp-meta', d.note))));
      break;
    }
    case 'clue':
      body.append(el('div', 'tp-rw-kind', 'A PIECE OF 1983'), el('div', 'tp-clue-title', r.title));
      break;
    case 'move':
      break;
  }
  body.append(el('div', { class: 'tp-rw-detail', html: markup(summary.detail) }));
  void tape;
  return body;
}

/** Freeze-frame polaroid from the CRT. */
function polaroid(src: HTMLCanvasElement, caption: string): HTMLElement {
  const p = el('div', 'tp-polaroid');
  const c = document.createElement('canvas');
  c.width = 160;
  c.height = 120;
  const x = c.getContext('2d')!;
  try {
    x.drawImage(src, 0, 0, 160, 120);
  } catch {
    x.fillStyle = '#1b34c8';
    x.fillRect(0, 0, 160, 120);
  }
  p.append(c, el('div', 'tp-polaroid-cap', caption));
  return p;
}

function waitButtons(parent: HTMLElement, buttons: { label: string; style?: string; value: string }[]): Promise<string> {
  return new Promise((resolve) => {
    const row = el('div', 'tp-actions');
    let off = () => {};
    const pick = (v: string) => {
      off();
      resolve(v);
    };
    buttons.forEach((b) => {
      const btn = el('button', { class: `btn ${b.style ?? ''}` }, b.label);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        audio.sfx('confirm');
        pick(b.value);
      });
      row.append(btn);
    });
    parent.append(row);
    off = game.input.onKey((_k, code) => {
      if (code === 'Enter' || code === 'Space' || code === 'KeyE') pick(buttons[0].value);
      else if ((code === 'Escape' || code === 'KeyX') && buttons.length > 1) pick(buttons[buttons.length - 1].value);
    });
  });
}

/**
 * Show what was caught and apply it. Move cards ask Add/Skip; everything else
 * is added straight away. Clues play their narration first.
 */
export async function showReward(parent: HTMLElement, tape: TapeDef, m: MomentDef, frame: HTMLCanvasElement, xp: number, perfect: boolean): Promise<void> {
  const rewards = [m.reward, ...(m.also ? [m.also] : [])];
  for (const r of rewards) {
    if (r.kind === 'clue') {
      sting('story-beat');
      await narrate(...r.narration);
      sting('reveal');
    } else sting(r.kind === 'hammers' ? 'reveal' : 'item-get');
    const wrap = el('div', 'tp-reward-wrap');
    const box = el('div', `tp-reward panel k-${r.kind}`);
    const head = el('div', 'tp-rw-head', el('span', 'tp-rw-caught', perfect ? 'CLEAN COPY!' : 'CAUGHT!'), el('span', 'tp-rw-name', m.name));
    const xpEl = el('div', 'tp-rw-xp', `+${xp} Ring IQ`);
    box.append(head);
    const row = el('div', 'tp-rw-row');
    row.append(polaroid(frame, `${tape.label.slice(0, 28)}`));
    if (r.kind === 'move') {
      const def = CARDS[r.card];
      const inDeck = G.player.deck.filter((c) => c.replace('+', '') === r.card).length;
      const side = el('div', 'tp-rw-body');
      side.append(el('div', 'tp-rw-kind', 'NEW MOVE'), el('div', 'tp-rw-card', def ? moveCardEl(r.card) : el('div', {}, r.card)));
      if (def) side.append(el('div', { class: 'tp-rw-detail', html: markup(`**${def.name}**: ${def.text}`) }));
      side.append(el('div', 'tp-meta', inDeck ? `You have ${inDeck} in your deck.` : `Your deck: ${G.player.deck.length} cards.`));
      row.append(side);
      box.append(row);
      if (xp > 0) box.append(xpEl);
      wrap.append(box);
      parent.append(wrap);
      const v = await waitButtons(side, [{ label: 'Add to deck', style: 'primary', value: 'add' }, { label: 'Skip', value: 'skip' }]);
      if (v === 'add' && def) {
        G.player.deck.push(r.card);
        audio.sfx('card-play');
      }
    } else {
      const summary = applyReward(tape, r);
      const body = rewardBody(tape, r, summary);
      row.append(body);
      box.append(row);
      if (xp > 0) box.append(xpEl);
      wrap.append(box);
      parent.append(wrap);
      await waitButtons(body, [{ label: r.kind === 'clue' ? 'Keep watching' : 'Nice!', style: 'primary', value: 'ok' }]);
    }
    xp = 0;
    wrap.classList.add('closing');
    setTimeout(() => wrap.remove(), 180);
  }
}
