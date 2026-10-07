/**
 * Insider scenes and public moments: Birdie's promotions, the back booth after
 * a show, huddles, organic turns, nudges in town and marks reacting to feuds.
 */
import { G, RANK_NAMES, type Rank } from '../../core/state';
import { sting } from '../../core/sting';
import { narrate, toast } from '../../ui/dialog';
import { addHearts } from '../../world/talk';
import { BIRDIE } from '../data/birdie';
import { promote } from '../career';
import { NameOf, PLAYER, alignOf, charState, realOf } from '../engine/cast';
import { CARD, persona } from '../engine/content';
import { applyTurn, extendStory, playRescue, wrapUp } from '../engine/run';
import { S, cal, rngFor, today, type PitchState, type QueuedScene, type Storyline } from '../engine/state';
import { render } from '../engine/text';
import { addToTin, tin } from '../engine/tin';
import { ask, line, type Mood } from './common';
import { runPitch } from './napkin';

const INSIDER_MAPS = new Set(['birdie-office', 'lockers', 'diner', 'airstream', 'birdie-house']);

function rng(salt: string) {
  return rngFor(`${salt}:${S().nextId}:${G.time.minutes}`);
}

function dailyState() {
  const s = S();
  if (s.daily.day !== today()) s.daily = { day: today(), nudged: [], marks: [], talked: [] };
  return s.daily;
}

// ------------------------------------------------------------------ promotions

export async function promotionScene(place: string): Promise<boolean> {
  const s = S();
  const r = s.career.pending;
  if (!r) return false;
  const data = BIRDIE.promotions[r];
  const insider = place === 'insider' || INSIDER_MAPS.has(G.player.map);
  const bigRank = r === 'assistant' || r === 'pencil' || r === 'owner';
  if (!insider) {
    if (bigRank) {
      await line('birdie', data?.note ?? 'My office. Bring a donut.');
      return true;
    }
    await line('birdie', data?.publicLines?.length ? data.publicLines : [`By order of the Commissioner: you're moving up the card.`], 'happy');
  } else if (data?.scene?.length) {
    for (const l of data.scene) {
      const text = render(l.text, { cast: {}, rng: rng('promo') });
      if (l.who === 'narrator') await narrate(text);
      else await line(l.who, text, (l.mood as Mood) ?? 'neutral');
    }
  } else {
    await line('birdie', ["Sit down, sugar.", `You've earned it. You're ${RANK_NAMES[r]} now.`], 'happy');
  }
  const got = promote();
  if (got) {
    sting('level-up');
    toast(`⭐ Promoted: ${RANK_NAMES[got as Rank]}`);
    if (got === 'assistant') toast('You book the Wednesday shows now. Open the corkboard in Birdie\'s office.');
    if (got === 'pencil') toast('You hold the Pencil. Every card is yours to book.');
    addHearts('birdie', 60);
  }
  return true;
}

// ------------------------------------------------------------------ queued insider scenes

async function turnScene(st: Storyline, who: string): Promise<void> {
  const c = charState(who);
  const villain = c.align === 'villain';
  if (villain) {
    await line(who, who === 'gideon'
      ? "Kid. They're CHEERING me. What if they *like* me? I'll have to be nice. In *public*."
      : who === 'earl' ? "A lady at the bakery gave me a free cruller. Tiny didn't charge the surcharge. What do we do?"
        : `Kid. They're cheering me. Agnes *waved* at me. What do we do?`, 'surprised');
  } else {
    await line(who, "They're booing me. Me. I held the door for Agnes for six years. What do we do?", 'sad');
  }
  const v = await ask<string>(who, null, [
    { label: 'Lean in', value: 'lean', hint: 'A turn at the next show. The crowd grabbed the pencil.' },
    { label: 'Fight it', value: 'fight', hint: 'Double down. A beloved villain, booed out of love.' },
    { label: 'Wait a week', value: 'wait', hint: 'If it lasts, the crowd decides.' },
  ]);
  st.decisions.push({ day: today(), what: 'turn', choice: v });
  if (v === 'lean') {
    applyTurn(who, villain ? 'hero' : 'villain', st, today());
    await line(who, villain ? "Okay. Okay. I'm going to need a nicer jacket." : 'Fine. I always wanted sunglasses indoors.', 'happy');
  } else if (v === 'fight') {
    c.sentiment = villain ? 5 : -5;
    await line(who, villain ? 'Then I will be the most lovable menace this county has ever booed.' : 'Then I grin through it.', 'smug');
  } else {
    c.streak = 1;
    await line(who, "A week. Okay. I'll try not to wave back.");
  }
}

async function huddleScene(st: Storyline): Promise<void> {
  const who = st.pitcher && st.pitcher !== 'birdie' ? st.pitcher : st.cast.hero === PLAYER ? st.cast.villain : st.cast.hero;
  const r = rng('huddle');
  await line('birdie', render(r.pick(BIRDIE.huddle.length ? BIRDIE.huddle : ["Let's talk about it, sugar. It's cooling."]), { cast: {}, rng: r }));
  await narrate(`"${st.title}" is ${st.status === 'flopping' ? 'flopping' : 'cooling'} (buzz ${st.buzz}). ${st.flopCauses.length ? `Trouble: ${st.flopCauses.map((f) => f.replace('_', ' ')).join(', ')}.` : ''}`);
  const cards = tin().map((o) => CARD[o.id]).filter((c) => c && (c.slot === 'wildcard' || (c.slot === 'twist' && !st.cards.twist)) && !(c.requires ?? []).some((q) => q.kind === 'never'));
  const choices = cards.slice(0, 5).map((c) => ({ label: `Play ${c!.name}`, value: c!.id, hint: c!.blurb }));
  choices.push({ label: 'Wrap it up', value: 'wrap', hint: 'Skip to Act III. Pay it off at the next show, no penalty.' });
  choices.push({ label: 'Let it ride', value: 'ride', hint: 'Sometimes the payoff saves everything.' });
  const v = await ask<string>(who ?? 'birdie', null, choices, 'ride');
  st.huddleOffered = false;
  if (v === 'wrap') {
    wrapUp(st, today());
    await line(who ?? 'birdie', "Can't all be classics. Pie's on me.", 'happy');
  } else if (v === 'ride') {
    await line(who ?? 'birdie', 'Ride it, then. I trust you.');
  } else if (CARD[v]) {
    playRescue(st, CARD[v], today(), r);
    st.huddleOffered = false;
    await line(who ?? 'birdie', `${CARD[v].name}? ...Oh, that's good. That's *good*.`, 'happy');
  }
}

async function runQueued(q: QueuedScene): Promise<void> {
  const s = S();
  const st = q.storyId ? s.stories.find((x) => x.id === q.storyId) ?? null : null;
  const r = rng(q.id);
  switch (q.kind) {
    case 'turn':
      if (st && q.who) await turnScene(st, q.who);
      break;
    case 'huddle':
      if (st && !st.done) await huddleScene(st);
      break;
    case 'extend':
      if (st && !st.done) {
        await line(st.pitcher ?? 'birdie', render(r.pick(BIRDIE.extend.length ? BIRDIE.extend : ["It's hot, sugar. Add a chapter?"]), { cast: {}, rng: r }), 'happy');
        const v = await ask<string>(null, `Add a chapter to "${st.title}"?`, [{ label: 'Add a chapter', value: 'yes' }, { label: 'Leave them wanting more', value: 'no' }]);
        if (v === 'yes') extendStory(st, today());
        st.decisions.push({ day: today(), what: 'extend', choice: v });
      }
      break;
    case 'offscript':
      await line('birdie', render(r.pick(BIRDIE.offScript.length ? BIRDIE.offScript : ["That wasn't the finish, sugar."]), { cast: {}, rng: r }), 'surprised');
      break;
    case 'booth':
      if (st) {
        const sh = (await import('../engine/content')).shape(st.shape);
        const ending = sh.endings.find((e) => e.id === st.ending);
        const ctx = { cast: { ...st.cast, winner: st.winner ?? 'nobody' }, rng: r };
        const text = ending?.epilogue?.length ? render(r.pick(ending.epilogue), ctx) : `Everybody pretends they didn't cry.`;
        await narrate(`The back booth, after "${st.title}".`);
        await narrate(text);
        if (st.lessons[0]) await narrate(`What we learned: ${st.lessons[0]}`);
      }
      break;
    case 'gift_card':
      if (q.who && q.card && CARD[q.card]) {
        await line(q.who, ['Did I ever tell you about the time...', `Here. Put this one in your tin. **${CARD[q.card].name}**. It's yours now.`], 'happy');
        addToTin(q.card, 'insider_story');
      }
      break;
    case 'held':
      if (st) await line(st.pitcher ?? st.cast.hero, "No rush, partner. The story's patient. We'll hold your spot.");
      break;
    case 'birdie_note':
      break;
  }
}

/** Run up to `max` queued insider scenes (optionally only ones involving `who`). */
export async function runQueuedScenes(max = 2, who?: string): Promise<number> {
  const s = S();
  let n = 0;
  while (n < max) {
    const q = s.scenes.find((x) => !who || x.who === who || (x.storyId && Object.values(s.stories.find((st) => st.id === x.storyId)?.cast ?? {}).includes(who)));
    if (!q) break;
    s.scenes = s.scenes.filter((x) => x !== q);
    await runQueued(q);
    n++;
  }
  return n;
}

// ------------------------------------------------------------------ the booth

export function waitingPitches(): PitchState[] {
  return S().pitches.filter((p) => p.status === 'waiting');
}

/** The back booth after a show: chatter, queued scenes, then whoever has an idea. */
export async function boothScene(opts: { afterShow: boolean }): Promise<boolean> {
  const s = S();
  const pitches = waitingPitches();
  const hasScenes = s.scenes.length > 0;
  if (!pitches.length && !hasScenes && !opts.afterShow) return false;
  const r = rng('booth');
  if (opts.afterShow) {
    await narrate(r.pick([
      'The back booth. Somebody\'s still got confetti in their hair. June slides a clean napkin across the table and clicks a pen.',
      'Bingo is still going next door. In the back booth, the insiders finally get to be themselves.',
      'Hot Tag Diner, after the show. Milkshakes, two straws each, and the good napkins.',
    ]));
    const chatty = [...new Set(s.shows.filter((x) => x.day === today()).flatMap((x) => x.segs.flatMap((g) => g.seg.participants)))].filter((x) => x !== PLAYER && persona(x).booth.length && x !== 'mothman');
    if (chatty.length) {
      const who = r.pick(chatty);
      await line(who, render(r.pick(persona(who).booth), { cast: {}, rng: r }), 'happy');
    }
  }
  await runQueuedScenes(3);
  if (s.career.pending && !['assistant', 'pencil', 'owner'].includes(s.career.pending)) await promotionScene('insider');
  const list = waitingPitches();
  if (!list.length) return true;
  const pick = await ask<string>(null, list.length === 1 ? `${NameOf(list[0].pitcher)} has an idea.` : 'A few people at the table have ideas.', [
    ...list.slice(0, 3).map((p) => ({ label: `Hear ${realOf(p.pitcher)} out`, value: p.id, hint: p.scope === 'consult' ? 'Their story; they want your help.' : p.scope === 'signature' ? 'A signature story.' : "You're in this one." })),
    { label: 'Just here for the pie', value: 'none', hint: 'Pitches never expire.' },
  ], 'none');
  const p = list.find((x) => x.id === pick);
  if (p) await runPitch(p);
  return true;
}

// ------------------------------------------------------------------ public nudges and marks

/** An insider with a waiting pitch hints in public, in character. */
export async function nudge(npc: string): Promise<boolean> {
  const p = waitingPitches().find((x) => x.pitcher === npc);
  if (!p) return false;
  const daily = dailyState();
  if (daily.nudged.includes(npc)) return false;
  daily.nudged.push(npc);
  p.nudgedOn = today();
  p.nudges++;
  const per = persona(npc);
  const r = rng('nudge');
  const text = render(r.pick(per.nudges.length ? per.nudges : ['*They give you a look that says: later. Somewhere private.*']), { cast: {}, rng: r });
  if (npc === 'mothman') await narrate(text.replace(/\*/g, ''));
  else await line(npc, text);
  toast(`📝 ${realOf(npc)} wants to talk shop. Find them in private: the back booth, the locker room or Birdie's office.`);
  return true;
}

const MARK_LINES: Record<string, string[]> = {
  pip: ["{villain} STINKS! ...Sorry. But {villain} stinks.", "I made a new sign! It says {hero} IS GONNA WIN. I used glitter.", "Did you SEE what {villain} did? I'm telling my dads.", "Dex says I'm still undisputed. {hero} could be undisputed too, someday."],
  agnes: ["You tell {villain} I'm saving a swing for them. Gertrude is ready.", "{hero} has lovely manners. {villain} could stand to learn some.", "I've watched since 1971, dear. {villain} is the most ornery I've seen this year."],
  bev: ["Say the word and I'll bring {villain} in. I've got a form for this.", "I've opened a case file on {villain}. Doug's on it.", "Unlawful Use of a Folding Chair. That's what I'd charge {villain} with. Twice."],
  patty: ["I timed {villain}'s last match with a stopwatch. The numbers are... fine. Unfortunately.", "{hero} and {villain}. I've got the tape in slow motion. I can't find the trick. Yet.", "It's fake. It's obviously fake. ...Did you see what {villain} did, though?"],
  fenwick: ["Follow the flour, friend. The {villain} business goes deeper than they're telling us.", "I have a theory about {hero}. It's mostly about moths, but it's a theory.", "Something's coming. The rafters were humming last Saturday."],
  oakes: ["I am filing a formal complaint about {villain}. In triplicate.", "If {hero} wins, I'm declaring a town holiday. I've already cut the ribbon. Metaphorically.", "This feud is putting Turnbuckle Alley on the map. I love it. I disapprove, officially."],
  nadia: ["{villain} hit you? Follow my finger. Did they hit your HEAD?", "I don't like {villain}. I don't like them at all. Is that allowed? It feels allowed.", "I brought you a mint. And a cold pack. Mostly the cold pack."],
  clementine: ["I'm calling it \"{story}.\" Off the record: I'm riveted. On the record: it needs more heat.", "My editorial on {villain} runs Thursday. It is devastating. You'll love it.", "Three stars so far, with upside. Don't tell {hero} I said upside."],
};

/** Marks react to running feuds (once a day, now and then). */
export async function markReaction(npc: string): Promise<boolean> {
  const lines = MARK_LINES[npc];
  if (!lines) return false;
  const daily = dailyState();
  if (daily.marks.includes(npc)) return false;
  const r = rng(`mark${npc}`);
  if (!r.chance(0.35)) {
    daily.marks.push(npc);
    return false;
  }
  daily.marks.push(npc);
  const stories = S().stories.filter((st) => !st.done && st.cast.villain !== PLAYER && st.cast.hero && st.cast.villain && st.cast.villain !== 'mothman');
  if (!stories.length) return false;
  const st = stories.find((x) => x.playerIn) ?? r.pick(stories);
  const hero = st.cast.hero === PLAYER && alignOf(PLAYER) === 'villain' ? st.cast.villain : st.cast.hero;
  const villain = st.cast.villain;
  await line(npc, render(r.pick(lines), { cast: { hero, villain }, rng: r, globals: { story: st.title } }));
  return true;
}

export function boothTime(): boolean {
  return cal.isShow(today()) && G.time.minutes >= 21 * 60 + 30;
}
