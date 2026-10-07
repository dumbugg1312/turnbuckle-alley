/**
 * Shared bits for the storyline UI: speakers with portraits, index cards.
 */
import './story.css';
import { G } from '../../core/state';
import { renderPortrait } from '../../gfx/characters';
import { el } from '../../ui/dom';
import { say, choose, type Choice, type Speaker } from '../../ui/dialog';
import { lookFor } from '../../world/scene';
import { speakerFor } from '../../world/talk';
import type { CardDef } from '../types';
import type { Reaction } from '../engine/content';
import { NameOf, PLAYER } from '../engine/cast';

export type Mood = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'smug' | 'love';

export function sp(id: string, mood: Mood = 'neutral'): Speaker | null {
  if (id === 'narrator') return null;
  const s = speakerFor(id, mood);
  if (!s) return s;
  const orig = s.portrait;
  // A broken look must never break a story scene: fall back to a simple portrait.
  return {
    ...s,
    portrait: () => {
      try {
        const p = typeof orig === 'function' ? orig() : orig;
        if (p) return p;
      } catch {
        /* fall through */
      }
      return portrait(id);
    },
  };
}

export async function line(id: string, text: string | string[], mood: Mood = 'neutral'): Promise<void> {
  const lines = Array.isArray(text) ? text : [text];
  await say(sp(id, mood), ...lines.filter(Boolean));
}

export async function ask<T = string>(id: string | null, prompt: string | null, choices: Choice<T>[], cancel?: T): Promise<T> {
  return choose(id ? sp(id) : null, prompt, choices, cancel !== undefined ? { cancelValue: cancel } : {});
}

const portraitCache = new Map<string, HTMLCanvasElement>();
export function portrait(id: string): HTMLCanvasElement {
  const key = id === PLAYER ? `player:${G.player.name}` : id;
  let src = portraitCache.get(key);
  if (!src) {
    try {
      src = renderPortrait(id === PLAYER ? G.player.look : lookFor(id), 'neutral', 48);
    } catch {
      src = fallbackPortrait(id);
    }
    portraitCache.set(key, src);
  }
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  c.getContext('2d')!.drawImage(src, 0, 0);
  return c;
}

/** A simple initial-on-a-circle portrait if the paper doll can't render (incomplete look). */
function fallbackPortrait(id: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 48;
  c.height = 48;
  const g = c.getContext('2d')!;
  g.fillStyle = '#f6d7a8';
  g.fillRect(0, 0, 48, 48);
  g.fillStyle = id === PLAYER ? '#2fa59a' : '#d8434b';
  g.beginPath();
  g.arc(24, 26, 16, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#fff6e6';
  g.font = 'bold 18px monospace';
  g.textAlign = 'center';
  g.fillText(NameOf(id).replace(/^The /, '').charAt(0), 24, 33);
  return c;
}

export function face(id: string, cls = 'napkin-face'): HTMLElement {
  const f = el('div', { class: cls, title: NameOf(id) });
  f.append(portrait(id));
  f.dataset.who = id;
  return f;
}

const SLOT_NAME: Record<string, string> = { hook: 'HOOK', twist: 'TWIST', stakes: 'STAKES', payoff: 'PAYOFF', segment: 'SEGMENT', wildcard: 'WILDCARD' };
const RARITY_PIPS: Record<string, string> = { common: '●', uncommon: '●●', rare: '●●●', legendary: '★' };

export function cardEl(c: CardDef, opts: { mini?: boolean; stars?: number; facedown?: boolean; illegal?: boolean; redThread?: boolean; badge?: string; onClick?: () => void } = {}): HTMLElement {
  const b = el(opts.onClick ? 'button' : 'div', { class: `icard${opts.mini ? ' mini' : ''}${opts.facedown ? ' facedown' : ''}${opts.illegal ? ' illegal' : ''}` });
  b.dataset.slot = c.slot;
  b.dataset.card = c.id;
  if (opts.facedown) {
    b.append(el('div', 'cname', opts.mini ? '?' : 'Face down'));
    if (!opts.mini) b.append(el('div', { class: 'cblurb', style: 'color:#fff6e6;text-align:center;margin:0' }, "They've got a secret."));
  } else {
    b.append(el('span', 'slotname', SLOT_NAME[c.slot] ?? c.slot.toUpperCase()), el('span', 'cid', c.id), el('div', 'cname', c.name), el('div', 'cblurb', c.blurb));
    b.append(el('span', 'pips', (opts.stars ? '★'.repeat(opts.stars) + ' ' : '') + RARITY_PIPS[c.rarity]));
    if (opts.badge) b.append(el('span', 'badge', opts.badge));
    if (opts.redThread) b.append(el('span', { class: 'redthread', title: 'Someone at this table has a red line here' }));
  }
  if (opts.onClick) b.addEventListener('click', (e) => { e.stopPropagation(); opts.onClick!(); });
  return b;
}

export function reactionStamp(r: Reaction): HTMLElement {
  const icon = { love: '♥', fine: '✓', counter: '↺', soft_no: '✋', red_line: '✖' }[r];
  return el('span', { class: `react-stamp ${r}`, title: r.replace('_', ' ') }, icon);
}

export function moodFor(r: Reaction): Mood {
  return r === 'love' ? 'happy' : r === 'fine' ? 'neutral' : r === 'red_line' ? 'angry' : r === 'soft_no' ? 'sad' : 'smug';
}

export function nextFrame(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => r()));
}
