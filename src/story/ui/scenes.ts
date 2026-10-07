/**
 * Insider scenes and public moments: Birdie's promotions, the back booth after
 * a show, huddles, organic turns, nudges in town and marks reacting to feuds.
 */
import { G, RANK_NAMES, type Rank } from '../../core/state';
import { sting } from '../../core/sting';
import { narrate, toast } from '../../ui/dialog';
import { NPC_BY_ID } from '../../data/npcs';
import { fillMemory, lastMatch } from '../../world/memory';
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

/**
 * Back-booth talk after a show, built from what actually happened tonight:
 * who won, how good it was, whose finisher ended it. Keys: beat (they beat
 * you), fell (you beat them), won / lost (their own match with {other}).
 * {finisher} is the move that ended your match, {stars} Mo's star count.
 */
type BoothVoice = { beat: [good: string[], rough: string[]]; fell: [good: string[], rough: string[]]; won: string[]; lost: string[] };
const BOOTH: Record<string, BoothVoice> = {
  dex: {
    beat: [["You kicked out of my springboard and I nearly forgot what came next. I came up with something. Pretty sure it was a cartwheel."], ["We stepped on each other twice. Both times my fault. I was looking at the crowd. I'm always looking at the crowd."]],
    fell: [["{finisher}. On me. You put me down so clean I heard Pip gasp from the floor."], ["I went down for {finisher} a beat early. You covered for me. I owe you a milkshake. Two straws."]],
    won: ["Beat {other} tonight. Hazel watched from the curtain. She said 'acceptable' and then she clapped once, which is new."],
    lost: ["{other} pinned me clean and I'm still smiling about it. Don't ask me why. Ask my ribs."],
  },
  earl: {
    beat: [["You fell for me like the floor owed you money. I said sorry after. You said 'for what.' I liked that."], ["I lowered you a little hard on the second one. Sorry. I told the mat sorry too."]],
    fell: [["{finisher}. I went over like a bookshelf. The front row moved their drinks. Courteous people."], ["I was late on the fall. I counted wrong in my head. I count pages better than seconds."]],
    won: ["I beat {other}. I said nothing at all on the mic. Gus says it was my best promo."],
    lost: ["{other} beat me. I took the long way to the floor so the kids could see it coming."],
  },
  gideon: {
    beat: [["You made my finish look *expensive*, darling. I'll be insufferable for a week. Longer if Clementine is kind."], ["You were behind me on the spots tonight. I could hear you thinking. Think less. Be gorgeous."]],
    fell: [["{finisher}, and I landed on my good side. You thought of my good side. That's the nicest thing a person has done for me in months."], ["You beat me and my hair moved wrong on the way down. I'm not blaming you. I'm blaming the fan by the door."]],
    won: ["Beat {other}. Somebody in row two booed me so hard their hat came off. I'm keeping the memory in a drawer."],
    lost: ["{other} got me. I lay there an extra second because the light was doing something lovely on the sequins."],
  },
  mariposa: {
    beat: [["My abuela watched your fall from the second row. She says you dropped like a quinceañera cake. That's good. I think it's good."], ["You missed the rope on the tope. I caught you anyway. Next time, look for me. I'll be there."]],
    fell: [["{finisher}. You put me down and the mask didn't move an inch. That's trust. I'm going to eat four tacos about it."], ["We were loose tonight. I was tired. Six hours at the plancha before bell time. That's mine, not yours."]],
    won: ["Beat {other}. Abuela says my headscissors were 'a little American' again. I'm taking it as a note."],
    lost: ["{other} pinned me. The kids in front were crying. I waved on the way out so they'd know I'm okay."],
  },
  hazel: {
    beat: [["That was clean. Your feet were under you every time. I could tell from the sound."], ["You landed flat on the second bump. Ice it tonight. Then come to the studio at seven and I'll show you why."]],
    fell: [["{finisher}. You protected my knee the whole way down and didn't make a show of it. Thank you."], ["You beat me, and I'm sore in a way I don't like. Not your fault. The left side's still learning."]],
    won: ["Got the win over {other}. I counted my breathing the whole time. Four in, four out. Nobody could tell."],
    lost: ["{other} beat me. It was the right finish. I keep having to remind the competitive part of me."],
  },
  tiny: {
    beat: [["You bumped for my big boot like it was a truck. Earl clapped from the back. He never claps. He forgets his hands."], ["I squashed you a little too much on the corner. Sorry! I brought you a cake. It's in my pocket. It's flat now."]],
    fell: [["{finisher}! I went down like a wedding cake on a hot day. Slowly, then all at once. The crowd loved it."], ["You beat me and I think I fell on the cake I had in my boot. Tonight was not a cake night."]],
    won: ["I beat {other}! The villain surcharge jar is full. I'm giving it to the VFW for chairs."],
    lost: ["{other} beat me fair. Somebody yelled that my cakes are too small. I yelled back that they're the right size. They are."],
  },
  bo: {
    beat: [["That was the tidiest match I've worked all month. I wrote down the timing. I write everything down."], ["You were a beat behind on the double-team. Buck says it was me. I have the notes. It was a little bit me."]],
    fell: [["{finisher}. On a Bruiser. Buck's going to write a song about it and I'm going to have to hear it."], ["You beat us and I tripped on Buck's tape measure on the apron. It was in his boot. Why was it in his boot."]],
    won: ["We beat {other}. Buck hugged me in the ring. On camera. In public. Our dad called."],
    lost: ["{other} beat us. Buck says it's character growth. I say we owe the VFW a chair."],
  },
  buck: {
    beat: [["That was a SONG. That match had a chorus. You came in on the second verse like you'd heard it before."], ["We stepped on each other's feet so many times it was basically line dancing. Not good line dancing."]],
    fell: [["{finisher}! I'm writing it down. Not the match. A song about the match. It's in G."], ["You beat me and I lost my tape measure somewhere in the third row. If you see it, it's Bo's."]],
    won: ["We beat {other}! Bo let me do the pose. Bo never lets me do the pose."],
    lost: ["{other} got us. I've got a sad song for it already. Two, actually. One's for Bo."],
  },
  clint: {
    beat: [["You took that clothesline like a pro. I mean that the old way. Like somebody who's been doing this since leather was the only kind of boot."], ["You caught a little too much of the rope. Get Doc to look at your back before Monday. Humor an old man."]],
    fell: [["{finisher}. That's a real finish. Lacey'd have stood up for it, if she ever stood up for anything I'm in."], ["You beat me and my knees made a noise I've only ever heard from a screen door. Doc will hear about it. Doc hears about everything."]],
    won: ["Beat {other} tonight. Wanda watched from the truck. She doesn't clap, but she leans."],
    lost: ["{other} put me down. At my age you take a pin like a nap. Gratefully."],
  },
  professor: {
    beat: [["Seventeen minutes, and every hold had a reason. You'd be surprised how rare that is. You'd be surprised what I grade."], ["Your arm drag was sloppy. I say that because you're capable of a clean one. I've seen it. Fix it by Wednesday."]],
    fell: [["{finisher}. I was in the right place for it and so were you. That's geometry, and it's very satisfying."], ["You beat me and we both rushed the finish. I'm deducting points from myself. Half a point. I'm generous."]],
    won: ["Beat {other}. Coach Kowalski was in the second row, timing it. I lost a little focus. I won anyway. Don't put that in a story."],
    lost: ["{other} got me with a small package. I taught that to a sophomore once. Everything comes back around."],
  },
  lou: {
    beat: [["You let an old man look good. That's a skill, sugar. That's half the business."], ["Little rough tonight. That's alright. I had rough ones for six years. Then I had good ones for thirty."]],
    fell: [["{finisher}. Took it like I was twenty. I'll feel it like I'm seventy-seven. Worth it."], ["You beat me and I forgot the next spot. Not your fault. Some nights the old songs come in and the new ones go out."]],
    won: ["Beat {other}. Sang a verse on the way out. Agnes sang the harmony. She's flat. It was perfect."],
    lost: ["{other} put me down. I stayed down long enough for the kids to worry and short enough for Doc not to."],
  },
};

const BOOTH_ANY: BoothVoice = {
  beat: [["Good match. You made my finish look like it meant something."], ["We were off tonight. Both of us. Next one we'll be on."]],
  fell: [["{finisher}. Clean. I've got nothing to say about it, and that's a compliment."], ["You beat me. It was a little loose. Let's go over it Monday."]],
  won: ["Got the win over {other}. I'll take it."],
  lost: ["{other} beat me tonight. It was the right call."],
};

const BIRDIE_ON_YOU: { won: boolean; good: boolean; text: string[] }[] = [
  { won: true, good: true, text: ["{finisher}, and the whole building came up off the bleachers like somebody pulled a string. {stars} stars from where I sat, and I sat on the cheap stool."] },
  { won: true, good: false, text: ["Hand raised. {stars} stars, from where I sat. The back row was checking their watches in the middle, sugar. I saw a man wind his."] },
  { won: false, good: true, text: ["You lost to {opponent} and two kids by the curtain cried into the same napkin. {stars} stars. June wants the napkin back."] },
  { won: false, good: false, text: ["{opponent} beat you, and the middle sagged like a porch. We'll go through it Monday. Eat your pie first."] },
];

function boothTalk(shows: { segs: { seg: { participants: string[]; playerInvolved: boolean }; sides?: string[][]; winnerSide?: number | null }[] }[], r: ReturnType<typeof rng>): { who: string; text: string; mood: Mood } | null {
  const fill = (t: string, extra: Record<string, string> = {}) => fillMemory(t, 'birdie', extra);
  const m = lastMatch();
  const tonight = m && m.day === today() ? m : null;
  const booths = (id: string) => id !== PLAYER && id !== 'mothman' && !!NPC_BY_ID[id]?.insider;
  if (tonight && booths(tonight.opponent) && r.chance(0.7)) {
    const v = BOOTH[tonight.opponent] ?? BOOTH_ANY;
    const good = tonight.stars >= 3;
    const set = tonight.won ? v.fell : v.beat;
    return { who: tonight.opponent, text: fill(r.pick(set[good ? 0 : 1])), mood: good ? 'happy' : 'neutral' };
  }
  if (tonight) {
    const good = tonight.stars >= 3;
    const pick = BIRDIE_ON_YOU.find((b) => b.won === tonight.won && b.good === good)!;
    return { who: 'birdie', text: fill(r.pick(pick.text)), mood: good ? 'happy' : 'neutral' };
  }
  // Night off for you: somebody talks about their own match.
  const segs = shows.flatMap((x) => x.segs).filter((g) => !g.seg.playerInvolved && g.sides && g.winnerSide != null);
  const g = segs.length ? r.pick(segs) : null;
  if (!g || !g.sides) return null;
  const who = g.sides.flat().find(booths);
  if (!who) return null;
  const mine = g.sides.findIndex((side) => side.includes(who));
  const other = g.sides.filter((_, i) => i !== mine).flat()[0];
  const v = BOOTH[who] ?? BOOTH_ANY;
  const won = g.winnerSide === mine;
  return { who, text: fill(r.pick(won ? v.won : v.lost), { other: NameOf(other ?? 'somebody') }), mood: won ? 'happy' : 'neutral' };
}

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
    const talk = boothTalk(s.shows.filter((x) => x.day === today()), r);
    if (talk) await line(talk.who, talk.text, talk.mood);
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
