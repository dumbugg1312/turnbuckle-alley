/**
 * Running storylines (§8, §9, §15.5 onBeatResolved): buzz, crowd sentiment,
 * organic turns, flops and saves, extensions, endings and the archive.
 */
import { G, RANKS } from '../../core/state';
import { Rng } from '../../core/rng';
import { TATTLER } from '../data/tattler';
import { T } from '../tuning';
import type { CardDef, FlopCause, StoryAlign, TitleId } from '../types';
import { PLAYER, alignOf, charState, levelOf, nameOf, nudgeSentiment } from './cast';
import { CARD, persona, shape as shapeOf } from './content';
import { genericBeat, isShowBeat, slideStory } from './generate';
import { S, cal, clamp, newId, notice, pushNews, storyLog, today, type Archived, type BeatState, type Storyline } from './state';
import { render, renderOne, type RenderCtx } from './text';
import { addToTin } from './tin';

export function storyRng(st: Storyline, salt: string | number): Rng {
  return new Rng((st.seed ^ (typeof salt === 'number' ? salt * 2654435761 : hashStr(salt))) >>> 0);
}
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function titleInStory(st: Storyline): TitleId | undefined {
  const s = S();
  if (CARD[st.cards.stakes]?.stakes?.outcome !== 'title') return undefined;
  const tag = CARD[st.cards.payoff]?.payoff?.stip === 'tag';
  const cast = Object.values(st.cast);
  for (const t of Object.values(s.titles)) {
    if ((t.id === 'tag') !== tag) continue;
    if (t.holders.some((h) => cast.includes(h))) return t.id;
  }
  return undefined;
}

export function storyCtx(st: Storyline, rng: Rng, beat?: BeatState, extra: Record<string, string | string[]> = {}): RenderCtx {
  const cast: Record<string, string | string[]> = { ...st.cast, ...extra };
  if (beat?.outsiders) for (const [k, v] of Object.entries(beat.outsiders)) cast[k] = v;
  const tid = titleInStory(st);
  const venueDay = beat?.day ?? today();
  return {
    cast,
    rng,
    globals: {
      title: tid ? S().titles[tid]?.name ?? 'the title' : 'bragging rights',
      venue: cal.isSuper(venueDay) ? ['Thaw Brawl', 'Fairgrounds Fury', 'Harvest Havoc', 'Homecoming'][cal.season(venueDay)] : cal.isWed(venueDay) ? 'the VFW Hall' : 'the Sportatorium',
      story: st.title,
      hook: CARD[st.cards.hook]?.name ?? 'the hook',
      twist: st.cards.twist ? CARD[st.cards.twist]?.name ?? 'the twist' : 'no twist',
      stakes: CARD[st.cards.stakes]?.name ?? 'pride',
      payoff: CARD[st.cards.payoff]?.name ?? 'the payoff',
    },
  };
}

// ------------------------------------------------------------------ resolution

export interface ResolveInput {
  stars: number;
  attended: boolean;
  /** Side index that actually won (matches), if known. */
  actualWinner?: number | null;
  simulated?: boolean;
}

function statusOf(buzz: number): Storyline['status'] {
  if (buzz >= T.hot) return 'hot';
  if (buzz >= T.steady) return 'steady';
  if (buzz >= T.cooling) return 'cooling';
  return 'flopping';
}

function idsOfSide(st: Storyline, beat: BeatState, side: string[]): string[] {
  return side.map((r) => (r.startsWith('@') ? beat.outsiders?.[r] : st.cast[r])).filter((x): x is string => !!x);
}

export function resolveBeat(st: Storyline, beat: BeatState, inp: ResolveInput): void {
  if (beat.status !== 'pending') return;
  const day = Math.max(beat.day, 0);
  beat.status = 'done';
  const rng = storyRng(st, `r${beat.id}`);
  const isMatch = beat.kind === 'match';
  const stars = clamp(inp.stars, 0.5, 5);
  if (isShowBeat(beat)) beat.stars = Math.round(stars * 4) / 4;

  // Buzz (§8.2).
  let delta = 0;
  if (isShowBeat(beat)) {
    delta += T.buzzPerStar * (stars - 2.5);
    const chants = stars >= 4.5 ? 3 : stars >= 4 ? 2 : stars >= 3.5 ? 1 : 0;
    delta += T.buzzChant * chants;
    if (cal.isSuper(day) && beat.purpose === 'payoff') delta += 10;
  } else if (beat.kind === 'town' || beat.kind === 'wrsl') {
    delta += rng.int(1, 4);
  }
  if (beat.purpose === 'twist' && st.status !== 'hot') delta += 4;
  st.buzz = clamp(Math.round(st.buzz + delta), st.buzzFloor, 100);
  st.peakBuzz = Math.max(st.peakBuzz, st.buzz);
  if (isMatch) st.stars.push(beat.stars ?? stars);

  // Crowd sentiment.
  if (isMatch && beat.sides) {
    const winSide = inp.actualWinner !== undefined ? inp.actualWinner : beat.winner;
    beat.sides.forEach((side, i) => {
      for (const id of idsOfSide(st, beat, side)) {
        if (id === PLAYER) continue;
        const a = alignOf(id);
        const p = persona(id);
        const won = winSide === i;
        let d = 0;
        if (a === 'hero') d = 1.5 + (stars - 3) * 3 + (won ? 2 : -1);
        else if (a === 'villain') d = (won && beat.cheat ? -8 : won ? -4 : -2) + (stars >= 4 ? 5 : 0) + p.lovable * 2.2;
        else d = (stars - 3) * 4 + p.lovable;
        nudgeSentiment(id, d + rng.int(-2, 2));
        const c = charState(id);
        c.matches++;
        if (won) c.wins++;
        c.lastMatch = day;
      }
    });
  } else if (isShowBeat(beat) || beat.kind === 'town') {
    for (const r of beat.roles ?? []) {
      const id = st.cast[r];
      if (!id || id === PLAYER) continue;
      const a = alignOf(id);
      nudgeSentiment(id, a === 'villain' ? -3 + persona(id).lovable * 1.6 : 3);
    }
  }

  // Twist reveal for a secret twist.
  if (beat.purpose === 'twist') {
    st.twistRevealed = true;
    if (st.secretTwist && st.playerIn) notice(`The face-down card flips: ${CARD[st.cards.twist ?? '']?.name ?? 'a twist'}!`);
  }

  // Off script (§15.7).
  if (isMatch && inp.actualWinner !== undefined && beat.winner !== undefined && inp.actualWinner !== beat.winner && beat.winner !== null && inp.actualWinner !== null) {
    if (!st.stamps.includes('off_script')) st.stamps.push('off_script');
    beat.winner = inp.actualWinner;
    if (st.playerIn) queueScene('offscript', st, day);
    S().career.ledger += stars >= 3.75 ? 2 : -1;
    storyLog(st, 'The finish went off script. The story adapts.', day);
  }

  // Status and pressure.
  st.status = statusOf(st.buzz);
  st.lowStreak = st.buzz < T.cooling ? st.lowStreak + 1 : 0;
  if (stars < 2 && isMatch) addFlopCause(st, 'weak_matches');
  checkTurnPressure(st, day, rng);
  if (st.lowStreak >= 2 && st.saves < T.maxSaves && beat.purpose !== 'payoff') handleFlop(st, day, rng);
  if (beat.act === 2 && isLastShowBeatOfAct2(st, beat) && st.buzz >= T.hot && !st.extended) handleExtension(st, day, rng);

  if (beat.purpose === 'payoff') resolveEnding(st, beat, inp, rng);
}

function addFlopCause(st: Storyline, c: FlopCause): void {
  if (!st.flopCauses.includes(c)) st.flopCauses.push(c);
}

function isLastShowBeatOfAct2(st: Storyline, beat: BeatState): boolean {
  const act2 = st.beats.filter((b) => b.act === 2 && isShowBeat(b));
  return act2[act2.length - 1] === beat;
}

export function queueScene(kind: 'turn' | 'huddle' | 'extend' | 'offscript' | 'booth' | 'gift_card' | 'birdie_note' | 'held', st: Storyline | null, day: number, extra: { who?: string; card?: string } = {}): void {
  const s = S();
  if (st && s.scenes.some((q) => q.kind === kind && q.storyId === st.id)) return;
  s.scenes.push({ id: newId('sc'), kind, storyId: st?.id, day, who: extra.who, card: extra.card });
  if (s.scenes.length > 12) s.scenes.shift();
}

// ------------------------------------------------------------------ organic turns (§8.3)

function checkTurnPressure(st: Storyline, day: number, rng: Rng): void {
  for (const id of new Set(Object.values(st.cast))) {
    if (id === PLAYER || id === 'mothman') continue;
    const c = charState(id);
    const a = c.align;
    const pressured = (a === 'villain' && c.sentiment > T.turnVillainAbove) || (a === 'hero' && c.sentiment < T.turnHeroBelow);
    c.streak = pressured ? c.streak + 1 : 0;
    if (c.streak < T.turnStreak) continue;
    if (c.turnOffered !== undefined && day - c.turnOffered < 21) continue;
    c.turnOffered = day;
    if (st.playerIn || st.scope === 'consult' || st.scope === 'board') {
      queueScene('turn', st, day, { who: id });
    } else {
      const roll = rng.next();
      if (roll < 0.5) applyTurn(id, a === 'villain' ? (rng.chance(0.5) ? 'hero' : 'tweener') : 'villain', st, day);
      else if (roll < 0.8) storyLog(st, `${nameOf(id)} is becoming a beloved villain: booed out of love.`, day);
    }
  }
}

export function applyTurn(id: string, to: StoryAlign, st: Storyline | null, day: number): void {
  const c = charState(id);
  if (c.align === to) return;
  c.align = to;
  c.streak = 0;
  c.sentiment = to === 'villain' ? Math.min(c.sentiment, -20) : Math.max(c.sentiment, 25);
  const rng = new Rng((day * 7919 + id.length * 104729) >>> 0);
  const head = render(rng.pick(TATTLER.turnHeadlines.length ? TATTLER.turnHeadlines : ['THE PEOPLE HAVE SPOKEN']), { cast: { who: id }, rng });
  pushNews({ headline: head, text: `${cap(nameOf(id))} has a new way of walking to the ring. The crowd decided, and the crowd is never wrong.`, storyId: st?.id, weight: 7, day });
  if (st) {
    if (!st.stamps.includes('crowd_turn')) st.stamps.push('crowd_turn');
    storyLog(st, `The crowd turned ${nameOf(id)} ${to}.`, day);
  }
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ------------------------------------------------------------------ flops (§9)

function handleFlop(st: Storyline, day: number, rng: Rng): void {
  if (!st.flopCauses.length) addFlopCause(st, st.buzz < 20 ? 'no_heat' : 'weak_matches');
  if (st.playerIn || st.scope === 'consult' || st.scope === 'board') {
    if (!st.huddleOffered) {
      st.huddleOffered = true;
      queueScene('huddle', st, day);
    }
    return;
  }
  const roll = rng.next();
  if (roll < 0.5) {
    const wc = rng.pick(['WC-03', 'WC-04', 'WC-11', 'WC-02', 'WC-09', 'TW-05', 'WC-08'].filter((x) => CARD[x]));
    if (wc) playRescue(st, CARD[wc], day, rng);
  } else if (roll < 0.75) wrapUp(st, day);
}

export function rescuePower(st: Storyline, c: CardDef): number {
  let p = c.rescue ?? T.rescueByRarity[c.rarity];
  if (c.fixes?.some((f) => st.flopCauses.includes(f))) p += 10;
  return p;
}

/** Play a twist or wildcard at a huddle. */
export function playRescue(st: Storyline, c: CardDef, day: number, rng: Rng): void {
  const power = rescuePower(st, c);
  st.buzz = clamp(st.buzz + power, st.buzzFloor, 100);
  st.status = statusOf(st.buzz);
  st.saves++;
  st.lowStreak = 0;
  if (!st.stamps.includes('saved')) st.stamps.push('saved');
  st.saved = true;
  storyLog(st, `Huddle: ${c.name} played. The story perks up (+${power} buzz).`, day);
  // The wildcard becomes a beat at the next show.
  if (c.beat) {
    const next = st.beats.find((b) => b.status === 'pending' && isShowBeat(b) && b.purpose !== 'payoff');
    const b: BeatState = {
      id: `${st.id}-w${st.saves}`, act: 2, kind: c.beat.kind === 'town' || c.beat.kind === 'wrsl' ? c.beat.kind : c.beat.kind, purpose: 'twist',
      src: { from: 'card', card: c.id, part: 'beat' }, day: next?.day ?? cal.nextShow(day), status: 'pending', roles: ['hero', 'villain'],
    };
    if (b.kind === 'match') {
      b.sides = [['hero'], ['villain']];
      b.winner = 0;
    }
    if (next && isShowBeat(b)) {
      const idx = st.beats.indexOf(next);
      st.beats.splice(idx, 0, b);
      slideStory(st, b.day);
    } else st.beats.splice(st.beats.findIndex((x) => x.status === 'pending'), 0, b);
  }
  st.decisions.push({ day, what: 'huddle', choice: c.name });
  S().flags[`retract_${st.id}`] = true;
  void rng;
}

/** Skip to Act III: drop the remaining Act II beats, pay it off at the next show. */
export function wrapUp(st: Storyline, day: number): void {
  st.beats = st.beats.filter((b) => !(b.status === 'pending' && b.act === 2));
  const payoff = st.beats.find((b) => b.purpose === 'payoff');
  if (payoff && payoff.status === 'pending') {
    const go = st.beats.find((b) => b.purpose === 'gohome' && b.status === 'pending');
    if (go) st.beats = st.beats.filter((b) => b !== go);
    payoff.day = Math.min(payoff.day, cal.nextShow(day));
    for (const b of st.beats) if (b.status === 'pending' && b.act === 3 && !isShowBeat(b)) b.day = Math.max(payoff.day, b.kind === 'booth' ? payoff.day : payoff.day + 1);
    st.end = payoff.day;
  }
  if (!st.stamps.includes('wrapped')) st.stamps.push('wrapped');
  storyLog(st, 'Wrapped early. Pay it off at the next show, no hard feelings.', day);
}

// ------------------------------------------------------------------ extension (§8.4)

function handleExtension(st: Storyline, day: number, rng: Rng): void {
  if (st.extendOffered) return;
  st.extendOffered = true;
  if (st.playerIn || st.scope === 'consult') {
    queueScene('extend', st, day);
    return;
  }
  if (rng.chance(0.4)) extendStory(st, day);
}

export function extendStory(st: Storyline, day: number): void {
  if (st.extended) return;
  st.extended = true;
  if (!st.stamps.includes('extended')) st.stamps.push('extended');
  const payoffIdx = st.beats.findIndex((b) => b.purpose === 'payoff');
  const gohomeIdx = st.beats.findIndex((b) => b.purpose === 'gohome' && b.status === 'pending');
  const at = gohomeIdx >= 0 ? gohomeIdx : payoffIdx;
  const extra = [genericBeat('brawl', 2), genericBeat('heat', 2)];
  extra.forEach((b, i) => {
    b.id = `${st.id}-x${i}`;
    b.day = day;
  });
  st.beats.splice(at, 0, ...extra);
  slideStory(st, day);
  st.weeks += 1;
  storyLog(st, 'Added a chapter. The crowd wants more.', day);
}

// ------------------------------------------------------------------ endings

function resolveEnding(st: Storyline, beat: BeatState, inp: ResolveInput, rng: Rng): void {
  const sh = shapeOf(st.shape);
  const winSide = inp.actualWinner !== undefined ? inp.actualWinner : beat.winner;
  const winnerIds = winSide === null || winSide === undefined || !beat.sides?.[winSide] ? [] : idsOfSide(st, beat, beat.sides[winSide]);
  const winRole = winnerIds.length ? Object.entries(st.cast).find(([, v]) => v === winnerIds[0])?.[0] : undefined;
  let ending = sh.endings.find((e) => e.id === st.ending);
  if (!ending || (ending.winner ?? null) !== (winRole ?? null)) ending = sh.endings.find((e) => (e.winner ?? null) === (winRole ?? null)) ?? ending ?? sh.endings[0];
  if (ending) st.ending = ending.id;
  st.winner = winnerIds[0];
  const day = beat.day;
  const s = S();

  // Stakes.
  const stakes = CARD[st.cards.stakes];
  const loserSide = winSide === 0 ? 1 : 0;
  const loserIds = beat.sides?.[loserSide] ? idsOfSide(st, beat, beat.sides[loserSide]) : [];
  if (stakes?.stakes && winnerIds.length) {
    switch (stakes.stakes.outcome) {
      case 'title': {
        const tid = titleInStory(st);
        if (tid) changeTitle(tid, winnerIds, day, `${CARD[st.cards.payoff]?.name ?? 'a match'} (${st.title})`);
        break;
      }
      case 'leave_town':
        for (const id of loserIds) if (id !== PLAYER) {
          const weeks = rng.int(2, 4);
          charState(id).awayUntil = day + weeks * 7;
          s.flags[`away_${id}`] = day + weeks * 7;
          pushNews({ headline: `${nameOf(id).toUpperCase()} LEAVES TOWN`, text: `A sign on the door reads "Gone fishin'. Cousin's got it." The town is already making DON'T GO signs.`, weight: 6, day });
        }
        break;
      case 'costume':
        for (const id of loserIds) s.flags[`chicken_${id}`] = day + 7;
        break;
      case 'career':
        for (const id of loserIds) if (id !== PLAYER && st.signature) {
          s.flags[`retired_${id}`] = day;
          pushNews({ headline: `${nameOf(id).toUpperCase()} HANGS UP THE BOOTS`, text: 'A standing ovation that lasted through two encores and one very emotional Gus Gravel. They will still be around town. They promised.', weight: 9, day });
        }
        break;
      case 'main_event':
        for (const id of winnerIds) s.flags[`main_${id}`] = day;
        break;
      default:
        break;
    }
  }
  if (ending?.turn) {
    const who = st.cast[ending.turn.who];
    if (who && who !== PLAYER) applyTurn(who, ending.turn.to, st, day);
  }
  // Twins never pin each other clean: if they met, it's always a schmozz in the record.
  const avg = st.stars.length ? st.stars.reduce((a, b) => a + b, 0) / st.stars.length : 3;
  if (st.saved) storyLog(st, 'Saved! The comeback of a story.', day);
  storyLog(st, `Paid off: ${ending?.label ?? 'the end'}${st.winner ? `. ${cap(nameOf(st.winner))} wins.` : '.'}`, day);
  const ctx = storyCtx(st, rng, beat, { winner: winnerIds.length ? winnerIds : ['nobody'], loser: loserIds.length ? loserIds : ['nobody'] });
  const head = renderOne(ending?.headline, ctx, `${st.title.toUpperCase()}: IT'S OVER`);
  st.headlines.push(head);
  pushNews({ headline: head, text: renderOne(ending?.text, ctx, ''), storyId: st.id, weight: 9, day });

  // Rewards for the player.
  if (st.playerIn) {
    G.player.respect += T.respect.storyDone + (avg >= 3.5 ? T.respect.storyGreat : 0);
    s.career.ledger += avg >= 3.5 ? 6 : avg >= 2.5 ? 3 : 1;
    s.career.completed++;
    G.player.skills.story = (G.player.skills.story ?? 0) + 60 + Math.round(avg * 15);
    notice(`Storyline complete: "${st.title}" (+respect)`);
  } else if (st.scope === 'consult' || st.scope === 'board') {
    G.player.respect += T.respect.consultDone;
    s.career.ledger += avg >= 3.5 ? 4 : 2;
    s.career.consults++;
    G.player.skills.story = (G.player.skills.story ?? 0) + 30;
  }
  if (st.saved && (st.playerIn || st.scope !== 'background')) s.career.ledger += 3;
  if (avg < 2.4) st.lessons.push(lessonFor(st));
  // Callbacks: a finished story becomes a card the crowd will remember.
  if (st.playerIn || st.scope === 'consult' || st.scope === 'board') addToTin('WC-10', 'life_event', true);
  // The one who leaves comes back (§5.1).
  if ((sh.id === 'betrayal' || sh.id === 'tag_breakup') && !st.cast.hero.startsWith('player') && rng.chance(0.5) && !s.seeds.some((x) => x.cast.hero === st.cast.hero)) {
    s.seeds.push({ shape: 'reunion', cast: { hero: st.cast.hero, villain: st.cast.villain }, after: day + 42 });
  }
  // Pair history.
  const key = [st.cast.hero, st.cast.villain].sort().join('|');
  s.cool.pairs[key] = (s.cool.pairs[key] ?? 0) + 1;
  // Booth epilogue scene for the player.
  if (st.playerIn || st.scope === 'consult') queueScene('booth', st, day);
  st.done = true;
}

function lessonFor(st: Storyline): string {
  const notes = [
    'The Wednesday crowd doesn\'t want homework.',
    'Somebody has to bring the fire.',
    'Stakes only work if somebody cares.',
    'Short and sweet beats long and limp.',
    'Two gentle souls make a gentle feud. Add an ornery one.',
    'The crowd remembers what you did last month. Change the recipe.',
  ];
  const map: Partial<Record<FlopCause, number>> = { no_heat: 1, stakes_dont_matter: 2, too_long: 3, personality_mismatch: 4, fatigue: 5, weak_matches: 0 };
  return notes[map[st.flopCauses[0] ?? 'weak_matches'] ?? 0];
}

export function changeTitle(tid: TitleId, holders: string[], day: number, how: string): void {
  const t = S().titles[tid];
  if (!t || !holders.length) return;
  if ((tid === 'tag') !== (holders.length >= 2)) return;
  const holdersKey = [...holders].sort().join('|');
  if ([...t.holders].sort().join('|') === holdersKey) {
    t.defenses++;
    t.prestige = clamp(t.prestige + 2, 0, 100);
    return;
  }
  const last = t.lineage[t.lineage.length - 1];
  if (last) last.lost = day;
  if (day - t.since < 21) t.prestige = clamp(t.prestige - 8, 0, 100);
  if (cal.isSuper(day)) t.prestige = clamp(t.prestige + 6, 0, 100);
  t.holders = [...holders];
  t.since = day;
  t.defenses = 0;
  t.lineage.push({ holders: [...holders], won: day, how });
  pushNews({ headline: `NEW CHAMPION${holders.length > 1 ? 'S' : ''}!`, text: `${cap(holders.map(nameOf).join(' & '))} won ${t.name}. Mayor Oakes is already looking for a key to the city.`, weight: 8, day });
  if (holders.includes(PLAYER)) notice(`You won ${t.name.replace(/^the /, 'the ')}!`);
}

/** Move finished stories into the archive (after their epilogue beats). */
export function archiveFinished(day: number): void {
  const s = S();
  const keep: Storyline[] = [];
  for (const st of s.stories) {
    const pending = st.beats.filter((b) => b.status === 'pending');
    const payoffDone = st.beats.find((b) => b.purpose === 'payoff')?.status === 'done';
    if (!st.done && !payoffDone) {
      keep.push(st);
      continue;
    }
    if (pending.length && day <= st.end + 3) {
      keep.push(st);
      continue;
    }
    for (const b of pending) b.status = 'skipped';
    const sh = shapeOf(st.shape);
    const avg = st.stars.length ? st.stars.reduce((a, b) => a + b, 0) / st.stars.length : 0;
    const a: Archived = {
      id: st.id, title: st.title, shape: st.shape, scope: st.scope, cast: st.cast, cards: st.cards, start: st.start, end: st.end,
      ending: st.ending, endingLabel: sh.endings.find((e) => e.id === st.ending)?.label ?? 'The end', winner: st.winner,
      bestStars: st.stars.length ? Math.max(...st.stars) : 0, avgStars: Math.round(avg * 100) / 100, peakBuzz: st.peakBuzz,
      headlines: st.headlines.slice(-4), stamps: st.stamps, signatures: st.signatures, playerIn: st.playerIn,
      lesson: st.lessons[0], pitcher: st.pitcher,
    };
    s.archive.push(a);
  }
  s.stories = keep;
  if (s.archive.length > 400) s.archive.splice(0, s.archive.length - 400);
}

// ------------------------------------------------------------------ simulation

/** Offscreen star rating for a segment (§15.5 simulateBeat). */
export function simulateStars(ids: string[], st: Storyline | null, purpose: string, kind: string, rng: Rng, day: number): number {
  const lv = ids.length ? ids.reduce((a, id) => a + levelOf(id), 0) / ids.length : 3;
  let base = kind === 'match' ? 2.1 + lv * 0.28 : 2.4 + lv * 0.2;
  if (st) base += (st.buzz - 50) / 45;
  if (purpose === 'payoff') base += 0.45;
  if (cal.isSuper(day)) base += 0.25;
  if (kind === 'match' && ids.length >= 2) {
    const key = [ids[0], ids[1]].sort().join('|');
    base += Math.min(0.3, (S().cool.pairs[key] ?? 0) * 0.08);
  }
  // Box-Muller normal noise.
  const u = Math.max(1e-6, rng.next());
  const v = rng.next();
  const n = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return clamp(Math.round((base + n * 0.6) * 4) / 4, 0.75, 5);
}

export function ranksAbove(min: string): boolean {
  return RANKS.indexOf(G.player.rank) >= RANKS.indexOf(min as (typeof RANKS)[number]);
}
