/**
 * The Turnbuckle Tattler (§9.5): Clementine's review of the last show,
 * storyline news written as real events, and small-town items.
 */
import { G } from '../../core/state';
import type { Paper } from '../api';
import { TATTLER } from '../data/tattler';
import type { ReviewTier, TownItem } from '../types';
import { S, cal, rngFor, today, type ShowRecord } from './state';
import { closeShow } from './book';
import { render, renderOne, type RenderCtx } from './text';
import { sideName } from './cast';

function tierOf(stars: number): ReviewTier {
  if (stars < 2) return 'snooze';
  if (stars < 3) return 'meh';
  if (stars < 3.7) return 'solid';
  if (stars < 4.5) return 'great';
  return 'rave';
}

function stripTitle(t: string): string {
  return t.replace(/\s*\([^)]*\)\s*$/, '');
}

function remember(key: string): boolean {
  const s = S();
  if (s.recentText.includes(key)) return false;
  s.recentText.push(key);
  if (s.recentText.length > 120) s.recentText.splice(0, s.recentText.length - 120);
  return true;
}

function pickFresh<T>(items: T[], key: (t: T) => string, rng: ReturnType<typeof rngFor>, weight: (t: T) => number = () => 1): T | undefined {
  const fresh = items.filter((t) => !S().recentText.includes(key(t)));
  const pool = fresh.length ? fresh : items;
  if (!pool.length) return undefined;
  const pick = rng.weighted(pool, weight);
  remember(key(pick));
  return pick;
}

function townItems(day: number, n: number, rng: ReturnType<typeof rngFor>): string[] {
  const season = cal.season(day);
  const wd = cal.weekday(day);
  const ok = TATTLER.townItems.filter((t: TownItem) => (!t.season || t.season.includes(season)) && (!t.weekday || t.weekday.includes(wd)));
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const it = pickFresh(ok.filter((t) => !out.includes(t.text)), (t) => `town:${t.text.slice(0, 40)}`, rng, (t) => (t.weight ?? 1) * (t.season ? 1.6 : 1));
    if (it) out.push(render(it.text, { cast: {}, rng }));
  }
  return out;
}

function sideBar(day: number, rng: ReturnType<typeof rngFor>): string | null {
  const s = S();
  const villains = s.stories.flatMap((st) => (st.done ? [] : [st.cast.villain])).filter((v) => v && v !== 'player');
  const heroes = s.stories.flatMap((st) => (st.done ? [] : [st.cast.hero])).filter((v) => v && v !== 'player');
  const ctx: RenderCtx = { cast: { villain: villains.length ? rng.pick(villains) : 'gideon', hero: heroes.length ? rng.pick(heroes) : 'tiny' }, rng };
  const kinds: [string, string[]][] = [
    ['POLICE BLOTTER', TATTLER.blotter],
    ['LETTERS TO THE EDITOR', TATTLER.letters],
    ["PIP'S SIGN OF THE WEEK", TATTLER.pipSigns],
    ['RINGSIDE STARS', TATTLER.horoscopes],
    ["SWEET LOU'S FISHING REPORT", TATTLER.fishing],
    ["FENWICK'S MOTHMAN CORNER", TATTLER.mothman],
    ['ADVERTISEMENT', TATTLER.ads],
  ];
  const k = kinds[(day + rng.int(0, 2)) % kinds.length];
  if (!k[1]?.length) return null;
  const line = pickFresh(k[1], (t) => `${k[0]}:${t.slice(0, 40)}`, rng);
  return line ? `${k[0]}: ${render(line, ctx)}` : null;
}

function unreviewed(): ShowRecord | undefined {
  const s = S();
  return [...s.shows].reverse().find((r) => !r.reviewed && r.day <= today());
}

function reviewText(show: ShowRecord, rng: ReturnType<typeof rngFor>): { stars: number; text: string; tier: ReviewTier } {
  const stars = show.rating ?? 2.5;
  const tier = tierOf(stars);
  const rated = show.segs.filter((r) => r.stars !== undefined);
  const best = [...rated].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))[0];
  const worst = [...rated].sort((a, b) => (a.stars ?? 0) - (b.stars ?? 0))[0];
  const main = show.segs[show.segs.length - 1];
  const crowd = show.venue === 'vfw' ? rng.pick(['rowdy', 'packed', 'bingo-hungry', 'loyal']) : rng.pick(['packed', 'roaring', 'sold-out', 'hoarse']);
  const ctx: RenderCtx = {
    cast: {},
    rng,
    globals: {
      show: show.name, best: stripTitle(best?.seg.title ?? main?.seg.title ?? 'the main event'), worst: stripTitle(worst?.seg.title ?? 'the opener'),
      mainEvent: stripTitle(main?.seg.title ?? 'the main event'), venue: show.venue === 'vfw' ? 'the VFW Hall' : 'the Sportatorium', crowd,
    },
  };
  let text = renderOne(TATTLER.reviews[tier], ctx, 'A night of wrestling occurred.');
  const saved = S().stories.concat().find((st) => S().flags[`retract_${st.id}`] === true && show.segs.some((r) => r.storyId === st.id));
  if (saved) {
    S().flags[`retract_${saved.id}`] = 'done';
    text = renderOne(TATTLER.retractions, ctx, 'I take it back. ALL OF IT.') + ' ' + text;
  }
  return { stars, text, tier };
}

/** Tomorrow morning's paper (cached per show/day so repeat calls agree). */
export function composePaper(): Paper | null {
  const s = S();
  const day = today();
  let show = unreviewed();
  if (show && !show.closed) closeShow(show);
  show = unreviewed();
  const key = show ? `show${show.day}` : `day${day}`;
  if (s.paper && s.paper.key === key) return s.paper.paper;
  const news = s.news.filter((n) => n.day >= day - 4).sort((a, b) => b.weight - a.weight);
  if (!show && !news.length && !(cal.weekday(day) === 6 || cal.weekday(day) === 3)) {
    s.paper = { day, key, paper: null };
    return null;
  }
  if (!show && !news.length && s.shows.length === 0) {
    s.paper = { day, key, paper: null };
    return null;
  }
  const rng = rngFor(`paper${key}`, day);
  const body: string[] = [];
  let headline = '';
  let review: Paper['review'];
  if (show) {
    const r = reviewText(show, rng);
    review = { stars: r.stars, text: r.text };
    show.reviewed = true;
    const main = show.segs[show.segs.length - 1];
    const storyHead = show.segs.filter((x) => x.headline && x.storyId).sort((a, b) => (S().stories.find((st) => st.id === b.storyId)?.buzz ?? 0) - (S().stories.find((st) => st.id === a.storyId)?.buzz ?? 0));
    const payoff = show.segs.find((x) => x.storyId && S().stories.find((st) => st.id === x.storyId)?.beats.find((b) => b.id === x.beatId)?.purpose === 'payoff');
    const lead = payoff ?? storyHead[0];
    const mw = main?.sides && main.winnerSide !== null && main.winnerSide !== undefined ? sideName(main.sides[main.winnerSide]) : 'everybody';
    const ml = main?.sides && main.winnerSide !== null && main.winnerSide !== undefined ? sideName(main.sides.filter((_, i) => i !== main.winnerSide).flat()) : 'nobody';
    headline = lead?.headline && rng.chance(0.7)
      ? lead.headline
      : render(rng.pick(TATTLER.showHeadlines[r.tier].length ? TATTLER.showHeadlines[r.tier] : ['{show} IN REVIEW']), { cast: {}, rng, globals: { show: show.name.toUpperCase(), mainWinner: mw.toUpperCase(), mainLoser: ml.toUpperCase() } });
    if (main?.seg.summary && !main.seg.playerInvolved) body.push(`MAIN EVENT: ${main.seg.summary}`);
    else if (main?.seg.playerInvolved && main.stars !== undefined) body.push(`MAIN EVENT: ${stripTitle(main.seg.title)}. ${main.playerWon ? 'The hometown newcomer had their hand raised.' : 'A valiant effort; the crowd stood anyway.'}`);
    for (const seg of show.segs.slice(0, -1)) {
      if (body.length >= 3) break;
      if (seg.storyId && seg.seg.summary && seg !== main) body.push(`${seg.headline ? seg.headline + ' ' : ''}${seg.seg.summary}`);
    }
  }
  for (const n of news) {
    if (body.length >= (show ? 4 : 3)) break;
    if (!remember(`news:${n.headline}:${n.day}`)) continue;
    if (!headline) headline = n.headline;
    else body.push(`${n.headline}: ${n.text}`.replace(/: $/, ''));
  }
  s.news = s.news.filter((n) => n.day > day);
  if (!headline) headline = render(rng.pick(TATTLER.storyHeadlines.town ?? ['A QUIET DAY IN TURNBUCKLE ALLEY']), { cast: { hero: 'tiny', villain: 'gideon' }, rng, globals: { story: 'the week' } });
  const items = townItems(day, show ? 2 : 3, rng);
  if (items.length) body.push(`AROUND TOWN: ${items.join(' ')}`);
  const side = sideBar(day, rng);
  if (side) body.push(side);
  const paper: Paper = { headline: headline.toUpperCase(), body, review };
  s.paper = { day, key, paper };
  void G;
  return paper;
}
