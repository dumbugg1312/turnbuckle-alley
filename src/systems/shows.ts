import './shows.css';
import { audio } from '../audio';
import { block, game } from '../core/game';
import { G, ext, hearts, skillLevel } from '../core/state';
import { sting } from '../core/sting';
import { absDay, BELL_TIME, isShowDay, isSupershow, SUPERSHOWS, weekday } from '../core/time';
import { NPC_BY_ID } from '../data/npcs';
import { defaultLook, type Look } from '../gfx/look';
import { MatchScene } from '../match/scene';
import type { CardType, MatchConfig, MatchResult } from '../match/types';
import { story } from '../story';
import type { Segment, ShowCard, Venue } from '../story/api';
import { banner, choose, narrate, say, toast } from '../ui/dialog';
import { el, markup, sleep, uiRoot } from '../ui/dom';
import { onEnterMap, onNewDay, onTalk, onTick } from '../world/hooks';
import { lookFor, WORLD } from '../world/scene';
import { addHearts, speakerFor } from '../world/talk';
import { chairState } from './actions';

/** Per-day show state. */
interface ShowState {
  /** Consecutive shows worked (Wednesday and Saturday). */
  streak?: number;
  /** absDay of the last show that ran (with or without the player). */
  lastShowDay: number;
  /** Tonight's card once booked. */
  card: ShowCard | null;
  cardDay: number;
  /** Whether the player worked tonight's show. */
  worked: boolean;
  /** Paper to show tomorrow. */
}
function showState(): ShowState {
  return ext<ShowState>('shows', () => ({ lastShowDay: -1, card: null, cardDay: -1, worked: false }));
}

export function venueToday(): Venue | null {
  if (!isShowDay()) return null;
  return weekday() === 2 ? 'vfw' : 'sportatorium';
}

function supershowName(): string | null {
  return isSupershow() ? SUPERSHOWS[G.time.season] : null;
}

export function tonightsCard(): ShowCard | null {
  const v = venueToday();
  if (!v) return null;
  const s = showState();
  if (s.cardDay !== absDay() || !s.card) {
    s.card = story.bookTonight(v, supershowName());
    s.cardDay = absDay();
    s.worked = false;
  }
  return s.card;
}

// ------------------------------------------------------------ match config

const STYLE_FOR_FINISHER: Record<string, string> = { power: 'powerhouse', aerial: 'highflyer', submission: 'technician', strike: 'brawler', flashy: 'showman' };

const looksMod = import.meta.glob<{ LOOKS_ALT?: Record<string, Look> }>('../data/looks.ts', { eager: true });
function ringLookFor(id: string): Look {
  const alt = Object.values(looksMod)[0]?.LOOKS_ALT;
  return alt?.[`${id}-ring`] ?? lookFor(id);
}

export function buildMatchConfig(seg: Segment, venue: Venue): MatchConfig {
  const spec = seg.match!;
  const p = G.player;
  const opp = NPC_BY_ID[spec.opponent];
  const w = opp?.wrestler;
  const taste: Partial<Record<CardType, number>> = venue === 'vfw' ? { grapple: 1.15, submission: 1.15, aerial: 0.9 } : { aerial: 1.15, taunt: 1.1, signature: 1.1 };
  return {
    player: {
      id: 'player',
      name: p.persona?.ringName || p.name,
      role: spec.playerRole,
      look: p.persona ? p.ringLook : p.look,
      style: STYLE_FOR_FINISHER[p.persona?.finisherStyle ?? 'power'] ?? 'brawler',
      chemistry: 0,
      finisherName: p.persona?.finisherName || 'Hometown Finish',
      signatureName: p.persona?.signatureName || 'Signature Slam',
      deck: [...p.deck],
      gear: [...p.gear],
      maxGas: 30 + skillLevel('strength') * 2,
      ringIq: skillLevel('ringiq'),
    },
    opponent: {
      id: spec.opponent,
      name: w?.ringName ?? opp?.short ?? spec.opponent,
      role: spec.opponentRole,
      look: ringLookFor(spec.opponent),
      style: w?.style ?? 'brawler',
      chemistry: Math.min(10, hearts(spec.opponent)),
      finisherName: w?.finisher ?? 'Finisher',
      signatureName: w?.signature ?? 'Signature',
    },
    winner: spec.winner,
    venue,
    stipulation: spec.stipulation,
    title: spec.title,
    taste,
    seed: (G.seed ^ absDay() * 7919) >>> 0,
    storyline: seg.storylineId,
  };
}

// ------------------------------------------------------------ attendance & pay

function attendance(venue: Venue): number {
  const chairs = chairState().found;
  const cap = venue === 'vfw' ? 50 + Math.floor(chairs * 0.5) : 140 + chairs * 2;
  const fans = G.player.fans;
  let base = venue === 'vfw' ? 32 : 85;
  base += Math.min(60, Math.floor(fans / 25));
  if (G.weather.today === 'rain' || G.weather.today === 'storm') base *= 0.85;
  if (supershowName()) base *= 1.6;
  return Math.max(12, Math.min(cap, Math.round(base + (Math.random() - 0.5) * 8)));
}

function pay(stars: number | null): number {
  const rankPay: Record<string, number> = { rookie: 25, opener: 35, undercard: 50, midcard: 70, main: 100, assistant: 120, pencil: 150, owner: 200 };
  const base = rankPay[G.player.rank] ?? 25;
  return stars === null ? 0 : Math.round(base + stars * 12);
}

// ------------------------------------------------------------ the show

let running = false;

/** Run tonight's show from the top. */
export async function runShow(): Promise<void> {
  if (running) return;
  const card = tonightsCard();
  const venue = venueToday();
  if (!card || !venue) return;
  running = true;
  const unblock = block();
  const s = showState();
  try {
    if (G.time.minutes < BELL_TIME) game.clock.advance(BELL_TIME - G.time.minutes);
    audio.music('show');
    audio.crowd(0.45);
    audio.crowdReact('cheer', 0.8);
    await banner(card.name.toUpperCase(), 1900, card.name.length > 22 ? 22 : 28);
    await showPoster(card, venue);
    let playerStars: number | null = null;
    let playerResult: MatchResult | null = null;
    for (const seg of card.segments) {
      if (seg.playerInvolved && seg.match) {
        await entrance(seg);
        const result = await playMatch(seg, venue);
        playerResult = result;
        playerStars = result.stars;
        story.reportMatch(seg.id, result);
        audio.music('show');
        audio.crowd(0.4);
      } else if (seg.playerInvolved) {
        // Promos / angles the player is part of.
        await segmentVignette(seg, true);
        story.reportSegment(seg.id);
      } else {
        await segmentVignette(seg, false);
        story.reportSegment(seg.id);
      }
      game.clock.advance(18);
    }
    s.worked = !!playerResult;
    if (playerResult) void import('../story-main').then((m) => m.markDebut());
    s.lastShowDay = absDay();
    // Payouts and the night summary.
    const att = attendance(venue);
    const ticket = venue === 'vfw' ? 5 : 10;
    const gate = att * ticket;
    let earned = pay(playerStars);
    // Showing up is rewarded: consecutive shows build a streak bonus.
    if (playerResult) {
      s.streak = (s.streak ?? 0) + 1;
      if (s.streak >= 2) {
        const bonus = Math.round(earned * Math.min(0.5, 0.1 * (s.streak - 1)));
        earned += bonus;
        G.player.fans += s.streak * 2;
        toast(`🔥 ${s.streak}-show streak! +$${bonus} and the fans are noticing.`);
      }
    }
    // Merch table: tees sell to the crowd.
    const tees = G.player.inventory['merch-tee'] ?? 0;
    const merchSold = Math.min(tees, Math.max(1, Math.round(att * (0.04 + Math.min(0.12, G.player.fans / 4000)))));
    if (tees > 0) {
      G.player.inventory['merch-tee'] -= merchSold;
      if (G.player.inventory['merch-tee'] <= 0) delete G.player.inventory['merch-tee'];
      earned += merchSold * 20;
      toast(`👕 Sold ${merchSold} shirts at the merch table (+$${merchSold * 20})`);
    }
    G.player.money += earned;
    if (playerResult) {
      G.player.matches++;
      if (playerResult.winner === 'player') G.player.wins++;
      G.player.bestStars = Math.max(G.player.bestStars, playerResult.stars);
      const fanGain = Math.round(playerResult.stars * 6 + playerResult.peakCrowd / 8);
      G.player.fans += fanGain;
      G.player.skills.charisma += Math.round(playerResult.stars * 8);
      G.player.skills.ringiq += Math.round(playerResult.stars * 6);
      addHearts(card.segments.find((x) => x.playerInvolved)?.match?.opponent ?? 'birdie', Math.round(playerResult.stars * 12));
    }
    G.showHistory.push({ day: absDay(), venue, attendance: att, gate, playerStars, headline: card.name, review: '' });
    await nightSummary(att, gate, earned, playerResult);
    game.clock.advance(30);
    audio.crowd(0);
  } finally {
    unblock();
    running = false;
  }
  // The insiders head to the Hot Tag.
  await afterShow();
}

function showPoster(card: ShowCard, venue: Venue): Promise<void> {
  return new Promise((resolve) => {
    const overlay = el('div', 'overlay');
    const poster = el('div', `show-poster ${venue}`);
    poster.append(el('div', 'poster-top', venue === 'vfw' ? 'VFW POST 316 PRESENTS' : 'ALLEY CHAMPIONSHIP WRESTLING PRESENTS'), el('div', 'poster-title', card.name));
    const list = el('div', 'poster-card');
    const order = [...card.segments];
    order.forEach((seg, i) => {
      const main = i === order.length - 1;
      const row = el('div', `poster-row${seg.playerInvolved ? ' you' : ''}${main ? ' main' : ''}`);
      row.append(el('span', 'poster-slot', main ? 'MAIN EVENT' : i === 0 ? 'OPENER' : seg.kind === 'match' ? 'MATCH' : seg.kind.toUpperCase()), el('span', { class: 'poster-line', html: markup(seg.title.replace(/\bYou\b/, G.player.persona?.ringName ?? G.player.name)) }));
      if (seg.match?.stipulation && seg.match.stipulation !== 'standard') row.append(el('span', 'poster-stip', seg.match.stipulation.toUpperCase()));
      list.append(row);
    });
    poster.append(list, el('div', 'poster-foot', 'BELL AT 7 · TAP TO CONTINUE'));
    overlay.append(poster);
    uiRoot().append(overlay);
    audio.sfx('results');
    const done = () => {
      overlay.remove();
      off();
      resolve();
    };
    overlay.addEventListener('click', done);
    const off = game.input.onKey((_k, c) => {
      if (c === 'Space' || c === 'Enter' || c === 'KeyE') done();
    });
  });
}

/** The pro-wrestling entrance card: name, hometown, catchphrase, theme. */
async function entrance(seg: Segment): Promise<void> {
  const p = G.player;
  const persona = p.persona;
  const spec = seg.match!;
  const opp = NPC_BY_ID[spec.opponent];
  if (spec.intro) await say(speakerFor('gus'), spec.intro);
  const overlay = el('div', 'entrance');
  const name = persona?.ringName || p.name;
  overlay.append(
    el('div', 'ent-light'),
    el('div', 'ent-from', persona?.hailingFrom ? `Hailing from ${persona.hailingFrom}` : 'Making their way to the ring'),
    el('div', 'ent-name', name),
    el('div', 'ent-nick', persona?.nickname ? `"${persona.nickname}"` : ''),
    el('div', 'ent-catch', persona?.catchphrase ? `“${persona.catchphrase}”` : ''),
  );
  uiRoot().append(overlay);
  const audioMod = (await import('../audio')) as unknown as { themeFor?: (t: unknown) => string };
  if (persona?.theme && audioMod.themeFor) audio.music(audioMod.themeFor(persona.theme), { fade: 0.2 });
  else audio.music('victory', { fade: 0.2 });
  audio.crowdReact(spec.playerRole === 'face' ? 'cheer' : 'boo', 1);
  await sleep(2600);
  overlay.classList.add('out');
  await sleep(500);
  overlay.remove();
  // Opponent's entrance (shorter).
  const o2 = el('div', 'entrance opp');
  o2.append(el('div', 'ent-light'), el('div', 'ent-from', 'And their opponent'), el('div', 'ent-name', opp?.wrestler?.ringName ?? opp?.short ?? 'Opponent'));
  uiRoot().append(o2);
  audio.music(`theme:${spec.opponent}`, { fade: 0.2 });
  audio.crowdReact(spec.opponentRole === 'face' ? 'cheer' : 'boo', 0.9);
  await sleep(1700);
  o2.classList.add('out');
  await sleep(400);
  o2.remove();
}

function playMatch(seg: Segment, venue: Venue): Promise<MatchResult> {
  return new Promise((resolve) => {
    const cfg = buildMatchConfig(seg, venue);
    const reward = G.player.matches < 2 || Math.random() < 0.6;
    import('../match/cards').then(({ rewardPool }) => {
      const pool = rewardPool(cfg.opponent.style);
      const picks: string[] = [];
      while (reward && picks.length < 3 && pool.length) {
        const c = pool[Math.floor(Math.random() * pool.length)];
        if (!picks.includes(c)) picks.push(c);
      }
      game.scenes.push(
        new MatchScene({
          config: cfg,
          intro: { title: seg.match!.title ? 'TITLE MATCH!' : 'BELL TIME!' },
          rewardChoices: picks,
          coachId: 'birdie',
          // Birdie's lines script the debut: face vs. Earl, Earl goes over.
          coach: G.flags['debuted'] || seg.match!.opponent !== 'earl' || seg.match!.winner !== 'opponent' || seg.match!.playerRole !== 'face'
            ? undefined
            : {
                lockup: 'Start slow, sugar. Lock up. Grapples and holds. Let the people settle in their seats.',
                shine: "You're the hero tonight. Get your offense in. Look at Earl's bubble: he's setting you up. Play what he calls.",
                heat: "He's cut you off. Now you *sell*. Every bump makes your comeback bigger. Play your Sell cards and DON'T fight back yet.",
                comeback: 'NOW! Fire up! Chain your moves together in one turn. Every bit of sympathy you built pays off right here.',
                stretch: 'Big moves and close calls. When you hit something big, cover him. When he covers you, kick out as LATE as you dare.',
                kickout: "He's got you pinned! Wait for it... wait for it... tap right before the 3. The later the kick-out, the bigger the pop.",
                finish: "Here comes the finish. You're losing tonight. Sell it like the world is ending, and the people will remember *you*.",
              },
          onDone: (result, rewardCard) => {
            if (rewardCard) {
              G.player.deck.push(rewardCard);
              toast('New move added to your deck!');
            }
            game.scenes.pop();
            resolve(result);
          },
        }),
      );
    });
  });
}

async function segmentVignette(seg: Segment, mine: boolean): Promise<void> {
  // Put the wrestlers in the ring on the venue map while the call plays.
  const w = WORLD;
  const ringObj = w?.map.objects.find((o) => o.kind === 'ring');
  const moved: { id: string; x: number; y: number; pose: string | null }[] = [];
  if (w && ringObj) {
    seg.participants.filter((id) => id !== 'player').slice(0, 2).forEach((id, i) => {
      const a = w.npcActor(id);
      if (a) {
        moved.push({ id, x: a.x, y: a.y, pose: a.pose });
        a.x = ringObj.x + (i === 0 ? -22 : 22);
        a.y = ringObj.y - 40;
        a.facing = i === 0 ? 'right' : 'left';
        a.pose = 'grapple';
      }
    });
  }
  const text = seg.summary ?? `${seg.title}.`;
  if (mine) {
    await narrate(text);
  } else {
    const c = await choose(speakerFor('gus'), `Up next: **${seg.title}**`, [
      { label: '👀 Watch from ringside', value: 'watch' },
      { label: '⏭ Skip to the next segment', value: 'skip' },
    ], { cancelValue: 'skip' });
    if (c === 'watch') {
      audio.crowdReact('pop', 0.7);
      await say(speakerFor('gus'), text);
      audio.crowdReact('cheer', 0.8);
    }
  }
  if (w) for (const m of moved) {
    const a = w.npcActor(m.id);
    if (a) {
      a.x = m.x;
      a.y = m.y;
      a.pose = m.pose;
    }
  }
}

function nightSummary(att: number, gate: number, earned: number, r: MatchResult | null): Promise<void> {
  return new Promise((resolve) => {
    const overlay = el('div', 'overlay');
    const box = el('div', 'modal panel night-summary');
    box.append(el('h2', {}, "That's the show!"));
    const grid = el('div', 'stat-grid');
    const stat = (v: string, l: string) => grid.append(el('div', 'stat panel', el('div', 'stat-v', v), el('div', 'stat-l', l)));
    stat(String(att), 'Attendance');
    stat(`$${gate}`, 'Gate');
    stat(r ? `${r.stars}★` : 'Night off', 'Your match');
    stat(`$${earned}`, 'Your pay');
    box.append(grid);
    if (r) box.append(el('p', 'summary-note', r.winner === 'player' ? 'Your hand got raised. Birdie nodded once, which from Birdie is a parade.' : r.stars >= 3 ? 'You lost. You also made the whole building believe. The locker room noticed.' : 'You lost, and it was a little rough out there. Everybody has those nights.'));
    const b = el('button', { class: 'btn primary' }, 'Head to the Hot Tag');
    box.append(el('div', 'menu-actions', b));
    overlay.append(box);
    uiRoot().append(overlay);
    sting('story-beat');
    const done = () => {
      overlay.remove();
      resolve();
    };
    b.addEventListener('click', done);
  });
}

async function afterShow(): Promise<void> {
  const w = WORLD;
  if (!w) return;
  game.clock.advance(Math.max(0, 22 * 60 + 15 - G.time.minutes));
  // Say it before the walk over: the diner's own enter scene (the booth) starts
  // as soon as we arrive and would otherwise play before this line.
  await narrate('After the show, the insiders pile into the back booth at the Hot Tag. Ice packs, pie, and the real story of the night.');
  await w.warpTo('diner', 15, 7, 'right');
}

// ------------------------------------------------------------ hooks

/** Birdie runs the show: talk to her at the venue to start. */
onTalk(async (npcId) => {
  if (npcId !== 'birdie') return false;
  const v = venueToday();
  if (!v || G.player.map !== v) return false;
  const s = showState();
  if (s.lastShowDay === absDay()) return false;
  if (G.time.minutes < 17 * 60) return false;
  const card = tonightsCard();
  if (!card) return false;
  // The player's *match* (a promo can come first and has no match to describe).
  const mine = card.segments.find((x) => x.playerInvolved && x.match) ?? card.segments.find((x) => x.playerInvolved);
  const sp = speakerFor('birdie');
  if (mine?.match) {
    const opp = NPC_BY_ID[mine.match.opponent];
    await say(sp, `There you are, sugar. You're working ${opp?.wrestler?.ringName ?? opp?.short} tonight. ${mine.match.winner === 'player' ? "You're going over. Don't let it go to your head." : 'You\'re putting them over. Make it look good and the people will remember you, not the finish.'}`);
  } else {
    await say(sp, "No match for you tonight, but I want you here. Watch. Learn. Carry a chair if somebody needs one.");
  }
  const c = await choose(sp, 'Ready to start the show?', [
    { label: "Let's do this", value: 'go', style: 'primary' },
    { label: 'Give me a minute', value: 'wait' },
  ], { cancelValue: 'wait' });
  if (c === 'go') await runShow();
  return true;
});

/** If you're in the building when the bell rings, the show starts. */
onTick((minutes) => {
  const v = venueToday();
  if (!v || running) return;
  const s = showState();
  if (s.lastShowDay === absDay()) return;
  if (minutes >= BELL_TIME && G.player.map === v) void runShow();
  // Missed it: the show went on without you.
  if (minutes >= 20 * 60 + 30 && G.player.map !== v) {
    const card = tonightsCard();
    if (card) {
      story.reportSkipped(card);
      s.lastShowDay = absDay();
      s.streak = 0;
      G.showHistory.push({ day: absDay(), venue: v, attendance: attendance(v), gate: 0, playerStars: null, headline: card.name, review: '' });
      toast(`The ${v === 'vfw' ? 'Wednesday' : 'Saturday'} show went on without you. You can read about it in tomorrow's Tattler.`);
    }
  }
});

/** Crowds on show night: seat fans in the venue. */
onEnterMap(async (mapId) => {
  const v = venueToday();
  if (mapId === v && G.time.minutes >= 17 * 60) {
    const s = showState();
    if (s.lastShowDay !== absDay()) {
      if (!G.flags['first_show_seen']) {
        G.flags['first_show_seen'] = true;
        audio.crowdReact('cheer', 0.6);
        await narrate(v === 'vfw' ? 'The VFW hall is packed: folding chairs, bingo cards, the smell of popcorn and floor wax. Somebody\'s grandpa is already yelling at the empty ring.' : 'The Sportatorium is alive tonight. String lights, the roar of a real crowd, and the old barn shaking on its bones.', 'Find **Birdie** when you\'re ready to start the show.');
      }
    }
  }
  return false;
});

/** The morning paper. */
onNewDay(async () => {
  const paper = story.morningPaper();
  if (paper) {
    G.ext['paper'] = paper;
    const { showPaper } = await import('./paper');
    await showPaper(paper);
  }
});

export const _dev = { defaultLook };
