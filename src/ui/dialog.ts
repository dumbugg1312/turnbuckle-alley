import { audio } from '../audio';
import { block, game } from '../core/game';
import { G } from '../core/state';
import { el, markup, uiRoot } from './dom';
import { fmt } from './text';

export interface Speaker {
  name: string;
  /** Small caption after the name, e.g. "Ring name". */
  sub?: string;
  color?: string;
  portrait?: HTMLCanvasElement | (() => HTMLCanvasElement) | null;
  portraitBg?: string;
  voice?: string;
}

export interface Choice<T = string> {
  label: string;
  value: T;
  hint?: string;
  disabled?: boolean;
  style?: 'primary' | 'gold' | 'teal';
}

let current: HTMLElement | null = null;

/** requestAnimationFrame that still ticks in hidden tabs (rAF pauses there). */
export function nextFrame(fn: (t: number) => void): void {
  if (document.hidden) setTimeout(() => fn(performance.now()), 16);
  else requestAnimationFrame(fn);
}

function makePortrait(sp: Speaker | null): HTMLElement | null {
  if (!sp?.portrait) return null;
  const src = typeof sp.portrait === 'function' ? sp.portrait() : sp.portrait;
  const box = el('div', 'portrait');
  if (sp.portraitBg) box.style.setProperty('--portrait-bg', sp.portraitBg);
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  c.getContext('2d')!.drawImage(src, 0, 0);
  box.append(c);
  return box;
}

function buildBox(sp: Speaker | null): { wrap: HTMLElement; box: HTMLElement; text: HTMLElement } {
  const wrap = el('div', 'dialog-wrap');
  const box = el('div', 'dialog panel');
  if (sp) {
    const plate = el('div', 'nameplate', sp.name);
    if (sp.sub) plate.append(el('small', {}, sp.sub));
    if (sp.color) box.style.setProperty('--name-bg', sp.color);
    box.append(plate);
  }
  const p = makePortrait(sp);
  if (p) box.append(p);
  const text = el('div', 'text');
  box.append(text);
  wrap.append(box);
  return { wrap, box, text };
}

/** Typewriter text into a node. Resolves when fully shown. Tap to finish early. */
function typeInto(node: HTMLElement, raw: string, sp: Speaker | null, skip: { now: boolean }): Promise<void> {
  const html = markup(raw);
  // Split into tags and characters so markup survives the typewriter.
  const tokens = html.match(/<[^>]+>|&[a-z#0-9]+;|[\s\S]/g) ?? [];
  const visibleCount = tokens.filter((t) => !t.startsWith('<')).length;
  const cps = G.settings.textSpeed;
  return new Promise((resolve) => {
    let shown = 0;
    let acc = 0;
    let last = performance.now();
    let blipCounter = 0;
    const step = (now: number) => {
      acc += ((now - last) / 1000) * cps;
      last = now;
      if (skip.now || cps >= 200) shown = visibleCount;
      else {
        const add = Math.floor(acc);
        if (add > 0) {
          acc -= add;
          shown = Math.min(visibleCount, shown + add);
          blipCounter += add;
          if (blipCounter >= 2) {
            blipCounter = 0;
            audio.blip(sp?.voice ?? 'default');
          }
        }
      }
      let count = 0;
      let out = '';
      for (const t of tokens) {
        if (t.startsWith('<')) out += t;
        else if (count < shown) {
          out += t;
          count++;
        } else break;
      }
      // Close any open tags left dangling by the cut.
      const open = (out.match(/<(em|b)>/g) ?? []).length - (out.match(/<\/(em|b)>/g) ?? []).length;
      if (open > 0) out += '</em>'.repeat(open);
      node.innerHTML = out;
      if (shown >= visibleCount) resolve();
      else nextFrame(step);
    };
    nextFrame(step);
  });
}

function waitAdvance(target: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      target.removeEventListener('pointerup', onTap);
      offKey();
      resolve();
    };
    const onTap = (e: Event) => {
      e.stopPropagation();
      finish();
    };
    target.addEventListener('pointerup', onTap);
    const offKey = game.input.onKey((_k, code) => {
      if (code === 'Space' || code === 'Enter' || code === 'KeyE' || code === 'KeyZ' || code === 'Escape' || code === 'KeyX') finish();
    });
  });
}

/**
 * Show one or more lines from a speaker. Each string is one box; the player
 * taps (or presses E/Space) to advance. World time pauses while it is open.
 */
export async function say(sp: Speaker | null, ...lines: string[]): Promise<void> {
  const unblock = block();
  try {
    for (const line of lines) {
      current?.remove();
      const { wrap, box, text } = buildBox(sp);
      current = wrap;
      uiRoot().append(wrap);
      const skip = { now: false };
      const skipper = () => (skip.now = true);
      box.addEventListener('pointerup', skipper);
      const offKey = game.input.onKey((_k, code) => {
        if (code === 'Space' || code === 'Enter' || code === 'KeyE' || code === 'KeyZ') skip.now = true;
      });
      await typeInto(text, fmt(line), sp, skip);
      box.removeEventListener('pointerup', skipper);
      offKey();
      await new Promise((r) => setTimeout(r, 90));
      const more = el('div', 'more');
      box.append(more);
      await waitAdvance(box.parentElement ? wrap : box);
      audio.sfx('blip-advance');
    }
  } finally {
    current?.remove();
    current = null;
    game.input.clear();
    unblock();
  }
}

/**
 * Ask a question. Shows the prompt (optional) with choices stacked above the
 * box. Keyboard: arrows + E/Space; touch: tap a choice.
 */
export async function choose<T = string>(sp: Speaker | null, prompt: string | null, choices: Choice<T>[], opts: { cancelValue?: T } = {}): Promise<T> {
  const unblock = block();
  try {
    current?.remove();
    const { wrap, box, text } = buildBox(sp);
    current = wrap;
    uiRoot().append(wrap);
    if (prompt) {
      const skip = { now: false };
      box.addEventListener('pointerup', () => (skip.now = true));
      await typeInto(text, fmt(prompt), sp, skip);
    } else {
      box.style.display = 'none';
    }
    const list = el('div', 'choices');
    wrap.insertBefore(list, box);
    let focus = choices.findIndex((c) => !c.disabled);
    const buttons = choices.map((c, i) => {
      const b = el('button', { class: `btn ${c.style ?? ''}` });
      b.innerHTML = markup(fmt(c.label)) + (c.hint ? `<span class="hint">${markup(fmt(c.hint))}</span>` : '');
      if (c.disabled) b.disabled = true;
      b.addEventListener('pointerenter', () => {
        focus = i;
        paint();
      });
      list.append(b);
      return b;
    });
    const paint = () => buttons.forEach((b, i) => b.classList.toggle('focus', i === focus));
    paint();
    return await new Promise<T>((resolve) => {
      // Every option disabled: nothing could ever be picked, so never hang on it.
      if (focus < 0) {
        console.warn('[choose] every option is disabled:', prompt);
        resolve(opts.cancelValue !== undefined ? opts.cancelValue : choices[0].value);
        return;
      }
      const pickIdx = (i: number) => {
        if (!choices[i] || choices[i].disabled) return;
        audio.sfx('confirm');
        cleanup();
        resolve(choices[i].value);
      };
      buttons.forEach((b, i) => b.addEventListener('click', (e) => {
        e.stopPropagation();
        pickIdx(i);
      }));
      const offKey = game.input.onKey((_k, code) => {
        if (code === 'ArrowDown' || code === 'KeyS') {
          do focus = (focus + 1) % choices.length;
          while (choices[focus].disabled);
          audio.sfx('select');
          paint();
        } else if (code === 'ArrowUp' || code === 'KeyW') {
          do focus = (focus - 1 + choices.length) % choices.length;
          while (choices[focus].disabled);
          audio.sfx('select');
          paint();
        } else if (code === 'Space' || code === 'Enter' || code === 'KeyE' || code === 'KeyZ') pickIdx(focus);
        else if ((code === 'Escape' || code === 'KeyX') && opts.cancelValue !== undefined) {
          cleanup();
          resolve(opts.cancelValue);
        }
      });
      const cleanup = () => offKey();
    });
  } finally {
    current?.remove();
    current = null;
    game.input.clear();
    unblock();
  }
}

/** Narration with no speaker. */
export function narrate(...lines: string[]): Promise<void> {
  return say(null, ...lines);
}

/** Brief non-blocking notification in the corner. */
export function toast(text: string, icon?: HTMLCanvasElement): void {
  let box = uiRoot().querySelector<HTMLElement>('.toasts');
  if (!box) {
    box = el('div', 'toasts');
    uiRoot().append(box);
  }
  const t = el('div', 'toast panel');
  if (icon) {
    const c = document.createElement('canvas');
    c.width = icon.width;
    c.height = icon.height;
    c.className = 'ico';
    c.getContext('2d')!.drawImage(icon, 0, 0);
    t.append(c);
  }
  t.append(el('span', { html: markup(fmt(text)) }));
  box.append(t);
  setTimeout(() => t.remove(), 3200);
}

/** Big centered banner text (e.g. "WEDNESDAY NIGHT!"). */
export async function banner(text: string, ms = 1600, size = 34): Promise<void> {
  // A ribbon that unrolls across the screen: measured, not a cartoon slam.
  const b = el('div', { class: 'big-banner', style: `font-size: calc(var(--u) * ${(size * 0.6).toFixed(1)})` }, text);
  b.animate(
    [
      { transform: 'translate(-50%,-50%) scaleX(0.6)', opacity: 0 },
      { transform: 'translate(-50%,-50%) scaleX(1)', opacity: 1, offset: 0.14 },
      { transform: 'translate(-50%,-50%) scaleX(1)', opacity: 1, offset: 0.82 },
      { transform: 'translate(-50%,-50%) translateY(-6px)', opacity: 0 },
    ],
    { duration: ms, easing: 'ease-out' },
  );
  uiRoot().append(b);
  await new Promise((r) => setTimeout(r, ms));
  b.remove();
}
