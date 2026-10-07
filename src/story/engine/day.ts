/**
 * The daily tick (§15.5 onDayStart) and the opening state of a fresh save.
 */
import { G } from '../../core/state';
import { HAZEL_CLEARED_DAY, OLD_HISTORY, TITLE_DEFS, WRESTLERS } from '../data/roster';
import { T } from '../tuning';
import type { TitleId } from '../types';
import { charState } from './cast';
import { checkPromotion, weeklyCareer } from '../career';
import { generateBackground } from './generate';
import { closeShow, runOffscreen } from './book';
import { dailyPitchTriggers } from './pitch';
import { archiveFinished, resolveBeat, simulateStars, storyRng } from './run';
import { S, cal, notice, pushNews, rngFor, storyLog, today, type Storyline } from './state';
import { grantStarterDeck, syncTin } from './tin';
import { isShowBeat } from './generate';
import { renderOne, renderPre } from './text';
import { storyCtx } from './run';
import { shape as shapeOf, CARD } from './content';

/** Opening storylines: the town is mid-feud when the player arrives. */
const OPENING: { shape: string; fixed: Record<string, string>; offset: number }[] = [
  { shape: 'underdog_title', fixed: { hero: 'mariposa', villain: 'gideon' }, offset: -9 },
  { shape: 'gentle_monster', fixed: { villain: 'earl', hero: 'tiny' }, offset: -5 },
  { shape: 'tag_breakup', fixed: {}, offset: -12 },
  { shape: 'grudge_match', fixed: { hero: 'dex', villain: 'professor' }, offset: -2 },
];

export function ensureInit(): void {
  const s = S();
  if (s.init) return;
  s.init = true;
  const day = Math.max(0, today());
  s.lastDay = day - 1;
  for (const w of WRESTLERS) charState(w);
  for (const [id, def] of Object.entries(TITLE_DEFS) as [TitleId, (typeof TITLE_DEFS)[TitleId]][]) {
    s.titles[id] = { id, name: def.name, holders: [...def.holders], since: day - 40, prestige: def.prestige, defenses: 4, lineage: [{ holders: [...def.holders], won: day - 40, how: 'before your time' }] };
  }
  for (const [a, b] of OLD_HISTORY) s.cool.pairs[[a, b].sort().join('|')] = 1;
  charState('hazel').injuredUntil = day + HAZEL_CLEARED_DAY;
  grantStarterDeck();
  s.flags.starterNotice = 1;
  // Opening feuds, already underway.
  for (const o of OPENING) {
    const rng = rngFor(`open${o.shape}`, 0);
    let st = generateBackground(day + o.offset, rng, { shapeId: o.shape, fixed: o.fixed }) ?? generateBackground(day + o.offset, rng, { fixed: o.fixed });
    if (!st) st = generateBackground(day + o.offset, rng);
    if (!st) continue;
    s.stories.push(st);
    fastForward(st, day);
  }
  for (let i = 0; i < 2 && s.stories.length < T.backgroundTarget; i++) {
    const st = generateBackground(day, rngFor(`openx${i}`, 0));
    if (st) s.stories.push(st);
  }
}

/** Beats before today happened before the player arrived. */
function fastForward(st: Storyline, day: number): void {
  for (const b of st.beats) {
    if (b.day >= day || b.status !== 'pending') continue;
    const rng = storyRng(st, `ff${b.id}`);
    const ids = Object.values(st.cast);
    if (b.purpose === 'payoff') {
      b.day = cal.nextShow(day);
      continue;
    }
    resolveBeat(st, b, { stars: simulateStars(ids, st, b.purpose, b.kind, rng, b.day), attended: false, simulated: true });
    const ctx = storyCtx(st, rng, b);
    const def = b.src.from === 'shape' ? shapeOf(st.shape).acts[b.src.act]?.[b.src.idx] : undefined;
    const text = def ? renderOne(def.text, ctx) : b.src.from === 'card' ? renderPre(CARD[b.src.card]?.beat?.text, ctx) : '';
    if (text) storyLog(st, text, b.day);
  }
}

/** Run every day from the last processed day up to `day` (inclusive). Safe to call often. */
export function processDay(day = today()): void {
  ensureInit();
  const s = S();
  if (day <= s.lastDay) return;
  for (let d = s.lastDay + 1; d <= day; d++) {
    const y = d - 1;
    // Last night's show: simulate it if nobody ran it, close it if it's still open.
    if (y >= 0 && cal.isShow(y)) {
      const rec = s.shows.find((r) => r.day === y);
      if (!rec) runOffscreen(y);
      else closeShow(rec);
    }
    // Off-card beats (town moments, WRSL call-ins, the booth) up to yesterday.
    for (const st of s.stories) {
      for (const b of st.beats) {
        if (b.status !== 'pending' || isShowBeat(b) || b.day > y) continue;
        if (b.kind === 'booth' && st.beats.some((x) => x.purpose === 'payoff' && x.status === 'pending')) continue;
        const rng = storyRng(st, `off${b.id}`);
        resolveBeat(st, b, { stars: 3, attended: false, simulated: true });
        const ctx = storyCtx(st, rng, b);
        const def = b.src.from === 'shape' ? shapeOf(st.shape).acts[b.src.act]?.[b.src.idx] : b.src.from === 'card' ? undefined : undefined;
        const card = b.src.from === 'card' ? CARD[b.src.card]?.beat : undefined;
        const text = renderPre(def?.text ?? card?.text, ctx);
        const head = renderPre(def?.headline ?? card?.headline, ctx);
        b.text = text;
        b.headline = head;
        if (text) storyLog(st, text, b.day);
        if (b.kind !== 'booth' && text) pushNews({ headline: head || st.title.toUpperCase(), text, storyId: st.id, weight: b.kind === 'wrsl' ? 3 : 4, day: b.day });
      }
    }
    dailyTick(d);
    s.lastDay = d;
  }
}

function dailyTick(day: number): void {
  const s = S();
  syncTin();
  archiveFinished(day);
  // People come back.
  for (const w of WRESTLERS) {
    const c = charState(w);
    if (c.injuredUntil !== undefined && day >= c.injuredUntil) {
      c.injuredUntil = undefined;
      if (w === 'hazel' && !s.flags.hazelCleared) {
        s.flags.hazelCleared = day;
        s.flags.returning = 'hazel';
        pushNews({ headline: 'HURRICANE WATCH ISSUED', text: 'Doc Halloran was seen leaving the Eye of the Storm studio with a signed form and a small smile. Sheriff Bev has put up signs.', weight: 6, day });
      }
    }
    if (c.awayUntil !== undefined && day >= c.awayUntil) {
      c.awayUntil = undefined;
      s.flags.returning = w;
      pushNews({ headline: 'LOOK WHO\'S BACK', text: 'A familiar truck was parked on Main Street this morning. The "Gone fishin\'" sign is down.', weight: 5, day });
    }
  }
  // Keep the roster busy with background stories.
  const bg = s.stories.filter((st) => !st.done && st.scope === 'background').length;
  if (bg < T.backgroundTarget) {
    const rng = rngFor('bg', day);
    const seed = s.seeds.find((x) => day >= x.after);
    let st: Storyline | null = null;
    if (seed) {
      s.seeds = s.seeds.filter((x) => x !== seed);
      st = generateBackground(day, rng, { shapeId: seed.shape, fixed: seed.cast });
    }
    st ??= generateBackground(day, rng);
    if (st) s.stories.push(st);
  }
  if (cal.weekday(day) === 0) weeklyTick(day);
  dailyPitchTriggers(day);
  checkPromotion();
  if (s.flags.starterNotice === 1 && G.flags['met_birdie']) {
    s.flags.starterNotice = 2;
    notice('Birdie left 24 index cards in your Recipe Tin: "The oldest tricks in the book, sugar."');
  }
}

function weeklyTick(day: number): void {
  const s = S();
  weeklyCareer();
  for (const t of Object.values(s.titles)) {
    const weeks = (day - t.since) / 7;
    if (weeks >= 6 && weeks <= 20) t.prestige = Math.min(100, t.prestige + 1);
    if (weeks > 20) t.prestige = Math.max(0, t.prestige - 1);
  }
  for (const w of WRESTLERS) {
    const c = charState(w);
    // Crowds forget a little every week: sentiment drifts back toward where the alignment sits.
    const home = c.align === 'hero' ? 45 : c.align === 'villain' ? -40 : 10;
    c.sentiment = Math.round(c.sentiment + (home - c.sentiment) * 0.2);
    const idle = c.lastMatch === undefined ? 7 : day - c.lastMatch;
    c.morale = Math.max(20, Math.min(100, c.morale + (idle > 10 ? -4 : 2)));
  }
}
