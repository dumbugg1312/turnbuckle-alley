/**
 * The napkin board (§2.5): a diner napkin with hand-drawn slots
 * (Hook -> Hero/Villain -> Twist -> Stakes -> Payoff -> Length), story cards as
 * little index cards, coffee-ring forecasts, signatures, and Birdie's verdict.
 */
import { G } from '../../core/state';
import { audio } from '../../audio';
import { block } from '../../core/game';
import { sting } from '../../core/sting';
import { el, uiRoot } from '../../ui/dom';
import { narrate, toast } from '../../ui/dialog';
import { addHearts } from '../../world/talk';
import type { CardDef } from '../types';
import { NameOf, PLAYER, alignOf, realOf } from '../engine/cast';
import { CARD, barksFor, persona, shape as shapeOf, storytellingLevel, type Judgment } from '../engine/content';
import {
  applyTweaks, birdieReview, draftNPCs, forecast, headline, learnRedLine, newDraft, offersFor, pitcherFill, place, plead, rankAtLeast,
  reactAll, shelvePitch, signDraft, spinTo, tinFor, type Draft, type Mode, type Plea,
} from '../engine/pitch';
import { S, notice, rngFor, today, type PitchState } from '../engine/state';
import { render } from '../engine/text';
import { ask, cardEl, face, line, moodFor, reactionStamp } from './common';
import type { Rng } from '../../core/rng';

type SlotKey = 'hook' | 'cast' | 'twist' | 'stakes' | 'payoff' | 'weeks';
const ORDER: SlotKey[] = ['hook', 'cast', 'twist', 'stakes', 'payoff', 'weeks'];
const LABEL: Record<SlotKey, string> = { hook: 'HOOK', cast: 'HERO / VILLAIN', twist: 'TWIST', stakes: 'STAKES', payoff: 'PAYOFF', weeks: 'LENGTH' };

interface Btn { label: string; value: string; style?: 'primary' | 'gold' | 'teal'; disabled?: boolean; hint?: string }

/** Thrown when the player folds the napkin up mid-pitch ("Can we talk later?"). */
class FoldedUp extends Error {}
const LATER = '__later__';

export class NapkinBoard {
  root: HTMLElement;
  private stage: HTMLElement;
  private napkin: HTMLElement;
  private head: HTMLElement;
  private slots: HTMLElement;
  private foot: HTMLElement;
  private tray: HTMLElement;
  private actions: HTMLElement;
  private active: SlotKey | null = null;
  private stamps: Partial<Record<SlotKey, HTMLElement>> = {};
  private sigs: HTMLElement | null = null;
  private unblock: () => void;
  private resolvePick: ((v: CardDef | string) => void) | null = null;

  constructor(public d: Draft, opts: { gold?: boolean } = {}) {
    this.unblock = block();
    this.root = el('div', 'overlay napkin-overlay');
    this.stage = el('div', 'napkin-stage');
    this.napkin = el('div', `napkin${opts.gold ? ' gold' : ''}`);
    this.head = el('div', 'napkin-head');
    this.slots = el('div', 'napkin-slots');
    this.foot = el('div', 'napkin-foot');
    const later = el('button', { class: 'btn small napkin-later', title: 'Fold it up. The pitch waits for you.' }, 'Later ✕');
    later.addEventListener('click', (e) => {
      e.stopPropagation();
      const r = this.resolvePick;
      this.resolvePick = null;
      this.tray.replaceChildren();
      this.actions.replaceChildren();
      r?.(LATER);
    });
    this.napkin.append(el('div', 'ketchup'), later, this.head, this.slots, this.foot);
    this.tray = el('div', 'tray');
    this.actions = el('div', 'napkin-actions');
    this.stage.append(this.napkin, this.tray, this.actions);
    this.root.append(this.stage);
    uiRoot().append(this.root);
    audio.sfx('page');
    this.render();
  }

  close(): void {
    this.root.remove();
    this.unblock();
  }

  render(): void {
    const d = this.d;
    const sh = shapeOf(d.shape);
    // Head: faces around the napkin, the want, the mode.
    this.head.replaceChildren();
    const faces = el('div', 'faces');
    for (const who of draftNPCs(d)) faces.append(face(who));
    const want = el('div', 'napkin-want');
    want.append(el('b', {}, sh.name), d.pitch.want ? `"${d.pitch.want}"` : sh.blurb);
    const modeName = { drive: 'YOU DRIVE', together: 'BUILD IT TOGETHER', idea: "I'VE GOT AN IDEA" }[d.mode];
    this.head.append(faces, want, el('span', 'napkin-mode', modeName));
    // Slots.
    this.slots.replaceChildren();
    ORDER.forEach((k, i) => {
      if (i > 0) this.slots.append(el('span', 'nslot-arrow', '➝'));
      const box = el('div', { class: `nslot${this.active === k ? ' active' : ''}` });
      box.dataset.slot = k;
      box.append(el('span', 'nslot-label', LABEL[k]));
      if (k === 'cast') {
        const pair = el('div', 'cast-pair');
        const hero = d.cast.hero;
        const vil = d.cast.villain;
        pair.append(el('div', 'who', face(hero), el('span', {}, NameOf(hero))), el('div', 'vs', 'vs'), el('div', 'who', face(vil), el('span', {}, NameOf(vil))));
        box.append(pair);
      } else if (k === 'weeks') {
        box.append(el('div', 'weeks-dial', String(d.weeks), el('small', {}, d.weeks <= 3 ? 'SHORT' : d.weeks <= 6 ? 'STANDARD' : d.weeks <= 10 ? 'EPIC' : 'SAGA')));
      } else {
        const id = d.cards[k];
        const c = id ? CARD[id] : undefined;
        if (c) {
          const facedown = k === 'twist' && d.secretTwist && d.mode === 'drive';
          const ce = cardEl(c, { mini: true, facedown, stars: S().tin.find((o) => o.id === c.id)?.stars });
          box.append(ce);
          const st = this.stamps[k];
          if (st) ce.append(st);
        } else box.append(el('div', 'nslot-empty', k === 'twist' && d.cards.hook && d.cards.stakes ? '—' : '?'));
      }
      this.slots.append(box);
    });
    this.renderForecast();
    this.active && this.slots.querySelector<HTMLElement>(`[data-slot="${this.active}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  renderForecast(): void {
    const f = forecast(this.d);
    const lvl = storytellingLevel();
    this.foot.replaceChildren();
    const rings = el('div', 'rings');
    const shown = lvl >= 3 ? 5 : 1;
    for (let i = 0; i < 5; i++) {
      const r = el('span', { class: `ring${i < f.rings ? (lvl >= 3 ? '' : ' faint') : ' off'}`, style: `--r:${(i * 37) % 20 - 10}deg` });
      if (i < shown || i < f.rings) rings.append(r);
    }
    const txt = el('div', 'forecast-text', f.feeling);
    if (f.tip) txt.append(el('i', {}, f.tip));
    this.foot.append(rings, txt);
    if (f.fatigue) this.foot.append(el('span', { class: 'yawn', title: 'The crowd has seen some of this lately' }, 'YAWN'));
    this.sigs = el('div', 'sigs');
    this.foot.append(this.sigs);
  }

  setActive(k: SlotKey | null): void {
    this.active = k;
    this.render();
  }

  stamp(k: SlotKey, j: Judgment | undefined): void {
    if (!j) {
      delete this.stamps[k];
      return;
    }
    this.stamps[k] = reactionStamp(j.reaction);
    this.render();
    for (const f of this.head.querySelectorAll<HTMLElement>('.napkin-face')) {
      f.classList.toggle('lit', f.dataset.who === j.who && j.reaction === 'love');
      f.classList.toggle('wince', f.dataset.who === j.who && (j.reaction === 'counter' || j.reaction === 'soft_no' || j.reaction === 'red_line'));
    }
  }

  shake(k: SlotKey): void {
    this.slots.querySelector(`[data-slot="${k}"] .icard`)?.classList.add('shake');
  }

  /** Show index cards in the tray; resolves with the chosen card or an extra button's value. */
  async pick(items: { card: CardDef; illegal?: boolean; redThread?: boolean; stars?: number; badge?: string }[], extras: Btn[] = [], note?: string): Promise<CardDef | string> {
    const v = await this.rawPick(items, extras, note);
    if (v === LATER) throw new FoldedUp();
    return v;
  }

  private rawPick(items: { card: CardDef; illegal?: boolean; redThread?: boolean; stars?: number; badge?: string }[], extras: Btn[] = [], note?: string): Promise<CardDef | string> {
    return new Promise<CardDef | string>((resolve) => {
      this.resolvePick = resolve;
      this.tray.replaceChildren();
      this.actions.replaceChildren();
      const done = (v: CardDef | string) => {
        this.resolvePick = null;
        audio.sfx('confirm');
        this.tray.replaceChildren();
        this.actions.replaceChildren();
        resolve(v);
      };
      if (note) this.tray.append(el('div', 'tray-note', note));
      for (const it of items) {
        this.tray.append(cardEl(it.card, { illegal: it.illegal, redThread: it.redThread, stars: it.stars, badge: it.badge, onClick: () => done(it.card) }));
      }
      for (const x of extras) {
        const b = el('button', { class: `btn ${x.style ?? ''}` }, x.label) as HTMLButtonElement;
        if (x.hint) b.title = x.hint;
        b.disabled = !!x.disabled;
        b.addEventListener('click', (e) => { e.stopPropagation(); done(x.value); });
        this.actions.append(b);
      }
    });
  }

  /** Big buttons under the napkin. */
  async choice(btns: Btn[]): Promise<string> {
    const v = await this.pick([], btns);
    return typeof v === 'string' ? v : v.id;
  }

  async sign(ids: string[]): Promise<void> {
    if (!this.sigs) return;
    const colors = ['#2f3f8f', '#9c2537', '#1d6e6b', '#6a3fa0', '#3a2a44', '#c27a1e'];
    let i = 0;
    for (const id of ids) {
      if (id === 'mothman') {
        this.sigs.append(el('span', { class: 'sig', style: `color:#6b5a48;--r:${-6 + i * 3}deg` }, '🦋'.replace('🦋', '⋀⋀')));
      } else if (id === 'buck' && i % 2 === 0) {
        this.sigs.append(el('span', { class: 'sig thumb', title: 'A ketchup thumbprint is a valid signature.' }));
      } else {
        this.sigs.append(el('span', { class: 'sig', style: `color:${colors[i % colors.length]};--r:${-7 + ((i * 5) % 12)}deg` }, id === PLAYER ? G.player.name : realOf(id)));
      }
      i++;
      audio.sfx('blip');
      await new Promise((r) => setTimeout(r, 260));
    }
  }

  approved(text = 'APPROVED', teal = false): void {
    this.napkin.append(el('div', `stamp-approved${teal ? ' teal' : ''}`, text));
    sting('level-up');
  }
}

// ------------------------------------------------------------------ the conversation

function pitchLine(c: CardDef, slot: string): string {
  const lead = { hook: 'It starts with', twist: 'Then the twist:', stakes: "What's on the line:", payoff: 'And it ends with' }[slot] ?? '';
  return `${lead} **${c.name}**. ${c.blurb}`;
}

async function sayReaction(j: Judgment): Promise<void> {
  const b = barksFor(j.who);
  const rng = rngFor(`bark${j.who}${j.card}${S().nextId}`);
  const pool = j.reaction === 'love' ? b.love : j.reaction === 'fine' ? b.fine : j.reaction === 'counter' ? b.counter : b.softNo;
  await line(j.who, render(rng.pick(pool), { cast: {}, rng }), moodFor(j.reaction));
}

/** Everyone reacts; handles red lines, counters and talk-throughs. Returns false if the card was taken back. */
async function react(board: NapkinBoard, d: Draft, slot: 'hook' | 'twist' | 'stakes' | 'payoff', c: CardDef, rng: Rng): Promise<boolean> {
  const js = reactAll(d, c);
  d.judgments = d.judgments.filter((j) => j.card !== c.id).concat(js);
  const top = headline(js);
  if (!top) return true;
  board.stamp(slot, top);
  if (top.reaction === 'red_line') {
    learnRedLine(top);
    board.shake(slot);
    audio.sfx('error');
    await line(top.who, top.redLine?.line ?? 'No.', 'angry');
    place(d, slot, undefined);
    board.stamp(slot, undefined);
    board.render();
    const counter = top.counter ? CARD[top.counter] : undefined;
    if (counter) {
      if (top.spin) await line(top.who, top.spin.line, 'smug');
      else await line(top.who, `How about **${counter.name}** instead?`);
      const v = await board.choice([{ label: `Take ${counter.name}`, value: 'take', style: 'primary' }, { label: 'Try another card', value: 'other' }]);
      if (v === 'take') {
        spinTo(d, { ...top, counter: counter.id }, slot);
        const again = reactAll(d, counter);
        d.judgments = d.judgments.concat(again);
        board.stamp(slot, headline(again));
        return true;
      }
    }
    return false;
  }
  if (top.reaction === 'counter' || top.reaction === 'soft_no') {
    await sayReaction(top);
    const counter = top.counter ? CARD[top.counter] : undefined;
    if (top.spin) await line(top.who, top.spin.line, 'smug');
    const who = realOf(top.who);
    const btns: Btn[] = [];
    if (counter) btns.push({ label: `Take ${counter.name}`, value: 'take', style: 'teal' });
    btns.push({ label: top.canTalk ? `Talk it through (${who}'s listening)` : `Talk it through (${who}'s not ready for that)`, value: 'talk', disabled: !top.canTalk, hint: top.canTalk ? '' : 'Maybe with more trust, or more Storytelling.' });
    btns.push({ label: 'Try another card', value: 'other' });
    const v = await board.choice(btns);
    if (v === 'take' && counter) {
      spinTo(d, top, slot);
      board.stamp(slot, { ...top, reaction: 'love', card: counter.id });
      return true;
    }
    if (v === 'talk') {
      d.talkedThrough.push(top.who);
      addHearts(top.who, 15);
      G.player.skills.story = (G.player.skills.story ?? 0) + 15;
      await line(top.who, rng.pick(["...Okay. Okay, I see it now.", "Fine. You're right. Don't let it go to your head.", 'Huh. When you put it like that.']), 'happy');
      board.stamp(slot, { ...top, reaction: 'fine' });
      return true;
    }
    place(d, slot, undefined);
    board.stamp(slot, undefined);
    board.render();
    return false;
  }
  if (top.reaction === 'love' || rng.chance(0.35)) await sayReaction(top);
  return true;
}

async function chooseWeeks(board: NapkinBoard, d: Draft): Promise<void> {
  const sh = shapeOf(d.shape);
  const [lo, def, hi] = sh.length;
  const opts = [...new Set([lo, def, Math.min(hi, rankAtLeast('midcard') ? hi : Math.min(hi, 6))])].sort((a, b) => a - b);
  board.setActive('weeks');
  const v = await board.choice(opts.map((w) => ({ label: `${w} weeks${w === def ? ' (usual)' : ''}`, value: String(w), style: w === d.weeks ? 'gold' : undefined })));
  d.weeks = Number(v);
  board.render();
}

async function fillSlotTogether(board: NapkinBoard, d: Draft, slot: 'hook' | 'twist' | 'stakes' | 'payoff', rng: Rng): Promise<void> {
  const maxRedraws = Math.min(3, 1 + Math.floor((storytellingLevel() - 1) / 2));
  for (let guard = 0; guard < 8; guard++) {
    board.setActive(slot);
    const offers = offersFor(d, slot, rng);
    const extras: Btn[] = [];
    if (d.redraws < maxRedraws) extras.push({ label: `Show me more (${maxRedraws - d.redraws})`, value: 'more' });
    extras.push({ label: 'From my Tin…', value: 'tin' });
    if (slot === 'twist') extras.push({ label: 'No twist', value: 'none' });
    const v = await board.pick(offers.map((c) => ({ card: c, badge: S().tin.some((o) => o.id === c.id) ? 'YOUR TIN' : realOf(d.pitch.pitcher).toUpperCase() })), extras, offers.length ? undefined : 'Nothing fits here.');
    if (v === 'more') {
      d.redraws++;
      continue;
    }
    if (v === 'none') {
      place(d, slot, undefined);
      board.render();
      return;
    }
    let c: CardDef | undefined;
    if (v === 'tin') {
      const items = tinFor(d, slot);
      const p = await board.pick(items.map((x) => ({ card: x.card, illegal: !x.legal, redThread: x.knownRedLine, stars: x.stars })), [{ label: 'Back', value: 'back' }], items.length ? undefined : 'Your tin has nothing for this slot yet.');
      if (typeof p === 'string') continue;
      c = p;
    } else if (typeof v !== 'string') c = v;
    if (!c) continue;
    place(d, slot, c.id, { fromPitcher: !S().tin.some((o) => o.id === c!.id) });
    board.render();
    if (await react(board, d, slot, c, rng)) return;
  }
}

async function fillSlotIdea(board: NapkinBoard, d: Draft, slot: 'hook' | 'twist' | 'stakes' | 'payoff', rng: Rng): Promise<void> {
  for (let guard = 0; guard < 10; guard++) {
    board.setActive(slot);
    const items = tinFor(d, slot);
    const extras: Btn[] = slot === 'twist' ? [{ label: 'No twist', value: 'none' }] : [];
    if (!items.some((x) => x.legal)) extras.push({ label: `Let ${realOf(d.pitch.pitcher)} pick`, value: 'theirs', style: 'teal' });
    const v = await board.pick(items.map((x) => ({ card: x.card, illegal: !x.legal, redThread: x.knownRedLine, stars: x.stars })), extras, 'Your Recipe Tin');
    if (v === 'none') {
      place(d, slot, undefined);
      board.render();
      return;
    }
    if (v === 'theirs') {
      const offers = offersFor(d, slot, rng);
      if (offers[0]) {
        place(d, slot, offers[0].id, { fromPitcher: true });
        board.render();
        await react(board, d, slot, offers[0], rng);
      }
      return;
    }
    if (typeof v === 'string') continue;
    if (!items.find((x) => x.card.id === v.id)?.legal) {
      audio.sfx('error');
      toast("That card can't go on this napkin right now.");
      continue;
    }
    place(d, slot, v.id);
    board.render();
    if (await react(board, d, slot, v, rng)) return;
  }
}

async function useNudge(board: NapkinBoard, d: Draft, rng: Rng): Promise<void> {
  const which = await board.choice([
    { label: 'Hook', value: 'hook' }, { label: 'Twist', value: 'twist' }, { label: 'Stakes', value: 'stakes' }, { label: 'Payoff', value: 'payoff' }, { label: 'Never mind', value: 'back' },
  ]);
  if (which === 'back') return;
  d.nudgeUsed = true;
  const slot = which as 'hook' | 'twist' | 'stakes' | 'payoff';
  await fillSlotTogether(board, d, slot, rng);
}

async function birdieVerdict(board: NapkinBoard, d: Draft, rng: Rng): Promise<'approved' | 'vetoed' | 'shelved'> {
  if (rankAtLeast('pencil')) {
    board.approved('BOOKED', true);
    await line('birdie', "Your pencil, sugar. I'll just be over here with my coffee and my opinions.", 'smug');
    return 'approved';
  }
  if (G.player.map === 'birdie-office') await narrate('Birdie reads the napkin twice, then once more with her glasses pushed up.');
  else await narrate("June slides the napkin down the counter to Birdie's usual stool. Birdie reads it twice.");
  const v = birdieReview(d, rng);
  if (v.verdict === 'approve') {
    board.approved();
    await line('birdie', v.line, 'happy');
    return 'approved';
  }
  if (v.verdict === 'veto') {
    await line('birdie', v.line, 'sad');
    S().pitches = S().pitches.filter((p) => p.id !== d.pitch.id);
    notice('Vetoed. The cards go back in your Tin.');
    return 'vetoed';
  }
  if (v.verdict === 'not_yet') {
    await line('birdie', v.line);
    shelvePitch(d, { day: today() + 21 });
    board.approved('GOLD STAR', true);
    notice('Not yet: the napkin gets a gold star on the corkboard. It will come back.');
    return 'shelved';
  }
  await line('birdie', v.line);
  if (v.tweaks.length) await narrate(`Birdie's tweak: ${v.tweaks.map((t) => t.label).join('; ')}.`);
  const c = await ask<string>('birdie', null, [
    { label: 'Fair enough', value: 'accept', style: 'primary' },
    { label: 'Plead your case', value: 'plead' },
  ]);
  if (c === 'plead') {
    const arg = await ask<Plea>(null, 'What do you argue?', [
      { label: 'The crowd', value: 'crowd', hint: "They'll eat it up." },
      { label: 'The heart', value: 'heart', hint: 'It matters to the people in it.' },
      { label: 'The roster', value: 'roster', hint: 'It fits the card and spreads the butter.' },
      { label: 'The history', value: 'history', hint: 'The town remembers. Use it.' },
    ]);
    const res = plead(v, arg, rng);
    await line('birdie', res.line, res.won ? 'happy' : 'neutral');
    if (!res.won) applyTweaks(d, v);
  } else {
    applyTweaks(d, v);
    S().career.ledger += 1;
  }
  board.render();
  board.approved();
  return 'approved';
}

/** The whole sit-down: want -> involvement -> napkin -> shake -> Birdie -> calendar. */
export async function runPitch(p: PitchState): Promise<boolean> {
  const rng = rngFor(`pitch${p.id}:${S().nextId}`);
  const pitcher = p.pitcher;
  const per = persona(pitcher);
  if (p.scope !== 'board') {
    await line(pitcher, render(rng.pick(per.opener), { cast: {}, rng }), 'happy');
    await line(pitcher, p.want);
  }
  // Choose involvement (§2.6). The player's default is listed first.
  const def = G.settings.involvement;
  const opts: { label: string; value: Mode | 'later'; hint: string }[] = [
    { label: '"You drive. Tell me everything."', value: 'drive', hint: 'They fill the napkin. You get one nudge.' },
    { label: '"Let\'s build it together."', value: 'together', hint: 'Pick from their ideas and your Tin, slot by slot.' },
    { label: '"I\'ve got an idea."', value: 'idea', hint: 'You fill every slot from your Recipe Tin.' },
  ];
  if (def !== 'ask') {
    const i = opts.findIndex((o) => o.value === def);
    if (i > 0) opts.unshift(...opts.splice(i, 1));
    opts[0].hint += ' (your usual)';
  }
  let mode: Mode = 'idea';
  if (p.scope === 'board') mode = 'idea';
  else {
    const pick = await ask<Mode | 'later'>(null, null, [...opts.map((o) => ({ label: o.label, value: o.value, hint: o.hint })), { label: 'Can we talk later?', value: 'later', hint: 'Pitches never expire.' }], 'later');
    if (pick === 'later') {
      await line(pitcher, rng.pick(['No rush. It keeps.', "Whenever you're ready. I'll save you a napkin.", 'Still thinking about it, whenever you are.']));
      return false;
    }
    mode = pick;
  }
  const d = newDraft(p, mode);
  const board = new NapkinBoard(d, { gold: !!p.signature });
  try {
    if (mode === 'drive') {
      const secret = await board.choice([{ label: 'Tell me everything', value: 'no', style: 'primary' }, { label: 'Keep the twist a secret from me', value: 'yes' }]);
      d.secretTwist = secret === 'yes';
      pitcherFill(d, rng);
      for (const slot of ['hook', 'twist', 'stakes', 'payoff'] as const) {
        const id = d.cards[slot];
        if (!id) continue;
        board.setActive(slot);
        if (slot === 'twist' && d.secretTwist) await line(pitcher, "And the twist... nope. You'll see it when the crowd does.", 'smug');
        else await line(pitcher, pitchLine(CARD[id], slot));
        const loveJ = d.judgments.find((j) => j.card === id && j.reaction === 'love' && j.who !== pitcher);
        if (loveJ) {
          board.stamp(slot, loveJ);
          await sayReaction(loveJ);
        }
      }
      board.setActive('weeks');
      await line(pitcher, `${d.weeks} weeks, start to finish.`);
      for (;;) {
        board.setActive(null);
        const v = await board.choice([
          { label: 'Love it. Shake on it.', value: 'sign', style: 'primary' },
          { label: 'Use my nudge (swap one card)', value: 'nudge', disabled: d.nudgeUsed },
          { label: 'Can I sleep on it?', value: 'later' },
        ]);
        if (v === 'nudge') {
          await useNudge(board, d, rng);
          continue;
        }
        if (v === 'later') {
          shelvePitch(d, { day: today() });
          p.status = 'waiting';
          await line(pitcher, 'Take your time. The napkin will keep.');
          return false;
        }
        break;
      }
      addHearts(pitcher, 40);
    } else {
      for (const slot of ['hook', 'twist', 'stakes', 'payoff'] as const) {
        if (p.locked?.[slot]) continue;
        if (mode === 'together') await fillSlotTogether(board, d, slot, rng);
        else await fillSlotIdea(board, d, slot, rng);
      }
      await chooseWeeks(board, d);
      board.setActive(null);
      const v = await board.choice([
        { label: 'Shake on it', value: 'sign', style: 'primary' },
        { label: 'Actually... you drive', value: 'drive' },
        { label: 'Let me sleep on it', value: 'later' },
      ]);
      if (v === 'later') {
        shelvePitch(d, { day: today() });
        p.status = 'waiting';
        await line(pitcher, 'It keeps. Napkins are patient.');
        return false;
      }
      if (v === 'drive') {
        pitcherFill(d, rng);
        board.render();
        await line(pitcher, 'Leave the rest to me.', 'happy');
      }
      addHearts(pitcher, mode === 'together' ? 30 : 20);
    }
    if (!d.cards.hook || !d.cards.stakes || !d.cards.payoff) pitcherFill(d, rng);
    board.render();
    await board.sign([...draftNPCs(d), PLAYER]);
    await line(pitcher, render(rng.pick(per.signoff), { cast: {}, rng }), 'happy');
    const verdict = p.scope === 'consult' || p.scope === 'for_you' || p.scope === 'signature' || (p.scope === 'board' && !rankAtLeast('pencil')) ? await birdieVerdict(board, d, rng) : 'approved';
    if (verdict !== 'approved') {
      await new Promise((r) => setTimeout(r, 500));
      return false;
    }
    const st = signDraft(d, rng);
    if (st) {
      const first = st.beats.find((b) => b.status === 'pending');
      toast(`📌 "${st.title}" is on the corkboard. ${first ? `First beat: ${first.day === today() ? 'tonight' : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][((first.day % 7) + 7) % 7]}.` : ''}`);
      if (alignOf(PLAYER) === 'hero' && st.cast.villain === PLAYER) toast('You are the villain in this one. Ornery, never mean.');
    }
    await new Promise((r) => setTimeout(r, 700));
    return !!st;
  } catch (err) {
    if (!(err instanceof FoldedUp)) throw err;
    shelvePitch(d, { day: today() });
    p.status = 'waiting';
    board.close();
    await line(pitcher, rng.pick(['No rush. The napkin keeps.', "Fold it up. We'll finish it in the booth sometime.", 'Whenever you are. I saved our spot.']));
    return false;
  } finally {
    board.close();
  }
}
