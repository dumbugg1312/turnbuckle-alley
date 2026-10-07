/**
 * The Booking Board (§13): Assistant Booker books Wednesdays, the Pencil books
 * everything. Story beats due that night are pinned in place; the booker fills
 * the rest of the card, picks winners and stipulations, and asks Birdie's two cents.
 */
import { audio } from '../../audio';
import { el } from '../../ui/dom';
import { toast } from '../../ui/dialog';
import { BIRDIE } from '../data/birdie';
import { WRESTLERS } from '../data/roster';
import { canBook } from '../career';
import { NameOf, PLAYER, alignOf, canWrestle, levelOf } from '../engine/cast';
import { CARD, shape as shapeOf } from '../engine/content';
import { backgroundShapes, isShowBeat } from '../engine/generate';
import { playerHired } from '../engine/book';
import { S, cal, rngFor, today, type PlannedSeg } from '../engine/state';
import { render } from '../engine/text';
import { tin } from '../engine/tin';
import type { Stip, TitleId } from '../types';
import { portrait } from './common';

interface Editing {
  day: number;
  segs: PlannedSeg[];
  sel: { row: number; side: number } | null;
  said: string;
}
let editing: Editing | null = null;

function bookableDays(): number[] {
  const out: number[] = [];
  let d = today();
  if (!cal.isShow(d) || S().shows.some((r) => r.day === d)) d = cal.nextShow(d);
  for (let i = 0; i < 8 && out.length < 2; i++) {
    if (canBook(d) && !S().shows.some((r) => r.day === d)) out.push(d);
    d = cal.nextShow(d);
  }
  return out;
}

function storyRows(day: number): { title: string; ids: string[] }[] {
  const out: { title: string; ids: string[] }[] = [];
  for (const st of S().stories) {
    if (st.done) continue;
    const b = st.beats.find((x) => x.status === 'pending' && isShowBeat(x));
    if (!b || b.day > day) continue;
    const roles = b.sides ? b.sides.flat() : b.roles ?? ['hero', 'villain'];
    const ids = roles.map((r) => st.cast[r]).filter((x): x is string => !!x);
    const label = b.purpose === 'payoff' ? `PAYOFF (${CARD[st.cards.payoff]?.name})`
      : b.title ?? (b.src.from === 'card' ? (b.src.part === 'declare' ? `stakes: ${CARD[b.src.card]?.name}` : CARD[b.src.card]?.name) : undefined)
      ?? ({ heat: 'a dirty win', establish: 'a statement win', segment: 'words are exchanged', gohome: 'the final face-off', tease: 'a tease' } as Record<string, string>)[b.purpose] ?? b.purpose;
    out.push({ title: `${st.title}: ${label}`, ids });
  }
  return out;
}

function roster(day: number): string[] {
  const r = WRESTLERS.filter((w) => w !== 'lou' && canWrestle(w, day)) as string[];
  if (playerHired()) r.unshift(PLAYER);
  return r;
}

function stipOptions(day: number): { value: Stip; label: string }[] {
  const vfw = cal.isWed(day);
  const out: { value: Stip; label: string }[] = [{ value: 'standard', label: 'Standard' }];
  for (const o of tin()) {
    const c = CARD[o.id];
    const stip = c?.payoff?.stip;
    if (!stip || stip === 'standard' || stip === 'farewell') continue;
    if (vfw && ['cage', 'ladder', 'last-standing', 'iron-hour', 'lights-out', 'haunted-house', 'honey-pot', 'hardware-brawl'].includes(stip)) continue;
    if (!vfw && stip === 'bingo-brawl') continue;
    if (!out.some((x) => x.value === stip)) out.push({ value: stip, label: c!.name });
  }
  return out;
}

function autoFill(e: Editing): void {
  const rng = rngFor(`autofill${e.day}${e.segs.length}`);
  const used = new Set([...storyRows(e.day).flatMap((r) => r.ids), ...e.segs.flatMap((s) => s.sides.flat())]);
  const free = roster(e.day).filter((w) => !used.has(w));
  const target = cal.isWed(e.day) ? 4 : cal.isSuper(e.day) ? 7 : 5;
  const total = () => e.segs.length + storyRows(e.day).length;
  while (free.length >= 2 && total() < target) {
    const a = free.includes(PLAYER) ? PLAYER : rng.pick(free);
    free.splice(free.indexOf(a), 1);
    const opp = free.filter((w) => alignOf(w) !== alignOf(a));
    const b = opp.length ? rng.pick(opp) : rng.pick(free);
    free.splice(free.indexOf(b), 1);
    e.segs.push({ kind: 'match', sides: [[a], [b]], winnerSide: levelOf(a) >= levelOf(b) ? 0 : 1, stip: 'standard' });
  }
}

function twoCents(e: Editing): string {
  const rng = rngFor(`cents${e.day}${e.segs.length}`);
  const T = BIRDIE.twoCents;
  const pick = (pool: string[], fb: string) => render(rng.pick(pool.length ? pool : [fb]), { cast: {}, rng });
  const ids = e.segs.flatMap((s) => s.sides.flat()).concat(storyRows(e.day).flatMap((r) => r.ids));
  if (!e.segs.length && !storyRows(e.day).length) return pick(T.empty, "An empty card is a quiet room, sugar.");
  if (!ids.some((x) => alignOf(x) === 'villain')) return pick(T.noVillains, 'Nobody to boo, sugar.');
  if (!ids.some((x) => alignOf(x) === 'hero')) return pick(T.noHeroes, 'Agnes is running out of purse.');
  const stips = e.segs.map((s) => s.stip).filter((x) => x !== 'standard');
  if (stips.length !== new Set(stips).size) return pick(T.repetitive, 'Same trick twice in one night? They\'ll notice.');
  const lvl = (s: PlannedSeg) => s.sides.flat().reduce((a, x) => a + levelOf(x), 0) / Math.max(1, s.sides.flat().length);
  if (e.segs.length >= 2) {
    if (lvl(e.segs[0]) < 3) return pick(T.weakOpener, 'Open hot, sugar.');
    const last = e.segs[e.segs.length - 1];
    if (e.segs.some((s) => lvl(s) > lvl(last)) && !storyRows(e.day).length) return pick(T.flatMain, 'Save the best for last.');
  }
  return pick(T.good, "That'll draw. Don't tell anybody I said so.");
}

export function renderBooking(opts: { rerender: () => void; startStory: (hero: string, villain: string, shapeId: string) => void }): HTMLElement {
  const wrap = el('div');
  const days = bookableDays();
  wrap.append(el('h2', 'cork-title', 'The Booking Board'));
  if (!days.length) {
    wrap.append(el('div', 'cork-empty', 'Nothing to book right now. (Assistant Bookers book Wednesdays; the Pencil books everything.)'));
    return wrap;
  }
  if (!editing || !days.includes(editing.day)) {
    const d = days[0];
    const saved = S().plans[String(d)];
    editing = { day: d, segs: saved ? saved.segs.map((x) => ({ ...x, sides: x.sides.map((s) => [...s]) })) : [], sel: null, said: '' };
  }
  const e = editing;
  const venue = cal.isWed(e.day) ? 'VFW Hall' : cal.isSuper(e.day) ? ['Thaw Brawl', 'Fairgrounds Fury', 'Harvest Havoc', 'Homecoming'][cal.season(e.day)] : 'the Sportatorium';
  wrap.append(el('div', 'cork-sub', `${cal.relLabel(e.day, today())} at ${venue} (${cal.dayLabel(e.day)}). Tap an empty spot, then a wrestler. Tap a wrestler on the card to make them the winner.`));
  if (days.length > 1) {
    const sw = el('div', 'btn-row');
    for (const d of days) {
      const b = el('button', { class: `btn small${d === e.day ? ' gold' : ''}` }, cal.dayLabel(d));
      b.addEventListener('click', (ev) => { ev.stopPropagation(); editing = null; S().flags.bookDay = d; editing = { day: d, segs: S().plans[String(d)]?.segs.map((x) => ({ ...x, sides: x.sides.map((s) => [...s]) })) ?? [], sel: null, said: '' }; opts.rerender(); });
      sw.append(b);
    }
    wrap.append(sw);
  }
  const board = el('div', 'board');
  const card = el('div', 'board-card');
  const side = el('div');
  board.append(card, side);
  wrap.append(board);

  const used = new Set([...storyRows(e.day).flatMap((r) => r.ids), ...e.segs.flatMap((s) => s.sides.flat())]);
  for (const r of storyRows(e.day)) {
    const row = el('div', { class: 'bslot story', 'data-pos': 'STORY' });
    row.append(el('span', {}, `📌 ${r.title}`));
    for (const id of r.ids) {
      const c = el('span', 'chip');
      c.append(portrait(id), NameOf(id));
      row.append(c);
    }
    card.append(row);
  }
  const titles = Object.values(S().titles);
  e.segs.forEach((s, ri) => {
    const isMain = ri === e.segs.length - 1 && !storyRows(e.day).length;
    const row = el('div', { class: `bslot${isMain ? ' main' : ''}`, 'data-pos': ri === 0 ? 'OPENER' : isMain ? 'MAIN' : String(ri + 1) });
    s.sides.forEach((sd, si) => {
      if (si > 0) row.append(el('b', {}, 'vs.'));
      const group = el('span', 'side');
      for (const id of sd) {
        const c = el('button', `chip${s.winnerSide === si ? ' win' : ''}`);
        c.append(portrait(id), NameOf(id));
        c.title = 'Tap: make this side the winner. Long press: remove.';
        c.addEventListener('click', (ev) => { ev.stopPropagation(); s.winnerSide = si; audio.sfx('select'); opts.rerender(); });
        c.addEventListener('contextmenu', (ev) => { ev.preventDefault(); sd.splice(sd.indexOf(id), 1); opts.rerender(); });
        group.append(c);
      }
      if (sd.length < 2) {
        const empty = el('button', `chip empty${e.sel?.row === ri && e.sel.side === si ? ' sel' : ''}`, sd.length ? '+ partner' : '+ wrestler');
        empty.addEventListener('click', (ev) => { ev.stopPropagation(); e.sel = { row: ri, side: si }; opts.rerender(); });
        group.append(empty);
      }
      row.append(group);
    });
    const stip = el('select') as HTMLSelectElement;
    for (const o of stipOptions(e.day)) stip.append(el('option', { value: o.value, ...(o.value === s.stip ? { selected: true } : {}) }, o.label));
    stip.addEventListener('change', () => { s.stip = stip.value as Stip; });
    stip.addEventListener('click', (ev) => ev.stopPropagation());
    row.append(stip);
    const ids = s.sides.flat();
    const tOpts = titles.filter((t) => t.holders.some((h) => ids.includes(h)) && (t.id !== 'wednesday' || cal.isWed(e.day)));
    if (tOpts.length) {
      const ts = el('select') as HTMLSelectElement;
      ts.append(el('option', { value: '' }, 'No title'));
      for (const t of tOpts) ts.append(el('option', { value: t.id, ...(s.titleId === t.id ? { selected: true } : {}) }, `🏆 ${t.name.replace(/^the ACW /, '')}`));
      ts.addEventListener('change', () => { s.titleId = (ts.value || undefined) as TitleId | undefined; });
      ts.addEventListener('click', (ev) => ev.stopPropagation());
      row.append(ts);
    }
    const x = el('button', { class: 'btn small x' }, '✕');
    x.addEventListener('click', (ev) => { ev.stopPropagation(); e.segs.splice(ri, 1); e.sel = null; opts.rerender(); });
    row.append(x);
    card.append(row);
  });
  const btns = el('div', 'btn-row');
  const add = el('button', { class: 'btn small' }, '+ Match');
  add.addEventListener('click', (ev) => { ev.stopPropagation(); e.segs.push({ kind: 'match', sides: [[], []], winnerSide: 0, stip: 'standard' }); e.sel = { row: e.segs.length - 1, side: 0 }; opts.rerender(); });
  const fill = el('button', { class: 'btn small teal' }, 'Fill the holes');
  fill.addEventListener('click', (ev) => { ev.stopPropagation(); autoFill(e); opts.rerender(); });
  const save = el('button', { class: 'btn primary' }, 'Lock in the card');
  save.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const segs = e.segs.filter((s) => s.sides.every((x) => x.length > 0));
    S().plans[String(e.day)] = { day: e.day, segs, savedOn: today() };
    audio.sfx('confirm');
    toast(`Card locked in for ${cal.dayLabel(e.day)}. Birdie fills any holes.`);
  });
  btns.append(add, fill, save);
  card.append(btns);

  // Side panel: roster strip + Birdie's two cents + start a story.
  side.append(el('div', { class: 'cork-sub', style: 'margin:0 0 calc(var(--u)*2)' }, e.sel ? 'Pick a wrestler for that spot:' : 'The roster'));
  const strip = el('div', 'roster-strip');
  for (const w of roster(e.day)) {
    const c = el('button', `chip${used.has(w) ? ' used' : ''}`);
    c.append(portrait(w), NameOf(w));
    c.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (!e.sel || used.has(w)) return;
      e.segs[e.sel.row]?.sides[e.sel.side]?.push(w);
      const s = e.segs[e.sel.row];
      e.sel = s && s.sides[1].length === 0 ? { row: e.sel.row, side: 1 } : null;
      audio.sfx('select');
      opts.rerender();
    });
    strip.append(c);
  }
  side.append(strip);
  const mug = el('div', { class: 'mug', style: 'margin-top:calc(var(--u)*6)' });
  const cup = el('button', { class: 'cup', title: "Birdie's two cents" });
  cup.addEventListener('click', (ev) => { ev.stopPropagation(); e.said = twoCents(e); opts.rerender(); });
  mug.append(cup, el('div', 'said', e.said || "Tap my mug and I'll read your card, sugar. I never veto anymore. I just *sigh*."));
  side.append(mug);
  // Start a story between any two wrestlers.
  const ss = el('div', { class: 'paper-sheet', style: 'margin-top:calc(var(--u)*6)' });
  ss.append(el('h4', {}, 'Start a story'));
  const hero = el('select') as HTMLSelectElement;
  const vil = el('select') as HTMLSelectElement;
  const sh = el('select') as HTMLSelectElement;
  for (const w of WRESTLERS) if (w !== 'lou') {
    hero.append(el('option', { value: w }, `Hero: ${NameOf(w)}`));
    vil.append(el('option', { value: w }, `Villain: ${NameOf(w)}`));
  }
  vil.selectedIndex = 1;
  for (const s of backgroundShapes()) sh.append(el('option', { value: s.id }, shapeOf(s.id).name));
  const go = el('button', { class: 'btn small primary' }, 'Draw up a napkin');
  go.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (hero.value === vil.value) return toast('Two different people, sugar.');
    opts.startStory(hero.value, vil.value, sh.value);
  });
  for (const x of [hero, vil, sh]) x.addEventListener('click', (ev) => ev.stopPropagation());
  ss.append(el('div', 'settings-opts', hero, vil, sh, go));
  side.append(ss);
  return wrap;
}
