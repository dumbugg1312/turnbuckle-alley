import { audio } from '../audio';
import { G, ext } from '../core/state';
import { absDay, isShowDay, weekday } from '../core/time';
import { choose, narrate, say } from '../ui/dialog';
import { fillMemory, lastMatch, type MatchMemory } from '../world/memory';
import { speakerFor } from '../world/talk';

/**
 * Payphone calls with Grandma. One call a day. She talks about your real week:
 * the match you just had (as she heard it), how long it's been since you
 * called, the weather, show day. A handful of fixed calls carry the story.
 */
interface PhoneState {
  lastCall: number;
  calls: number;
  /** Day of the last match she has already talked about. */
  heardMatch?: number;
  /** Fixed calls already made. */
  fixed?: number;
}
function phoneState(): PhoneState {
  return ext<PhoneState>('phone', () => ({ lastCall: -1, calls: 0 }));
}

type Stage = 'away' | 'town' | 'truth' | 'after';
function stage(): Stage {
  return G.flags['reunion_done'] ? 'after' : G.flags['truth_revealed'] ? 'truth' : G.flags['grandma_in_town'] ? 'town' : 'away';
}

/** The first call, then story calls that come round in order between the others. */
const FIRST = (n: string) => [`${n}! Is that you? You sound like you're in a tin can. Oh, it's the payphone by the gas station. That payphone has been there since Nixon.`, 'Tell me everything. No, tell me the *important* thing first: did the crowd stand up?'];
const FIXED_AWAY: string[][] = [
  ["I had a dream we were in the Sportatorium and it was 1979 and the roof leaked right onto the ring and we wrestled anyway, sliding all over, and the people *loved* it.", "...That wasn't a dream, actually. That was a Tuesday."],
  ["Is she eating? Birdie forgets to eat when there's a show. She'll live on cinnamon sticks and spite.", "Don't answer that. I'm not supposed to ask. Ask me about my pudding instead."],
  ["I put my shoes in the refrigerator this morning. Nice and cold. Very refreshing for the feet.", "Don't laugh. ...Alright, laugh. I did. The nurse did. Even the shoes looked amused."],
  ["Is the marquee still on the corner? Does it still spell her name with the little star over the i?", "There's no i in Birdie's... there is, isn't there. Two. Listen to me. I knew that for forty years."],
  ["Sweetheart, what day is it? No, wait. I like guessing. It's... Thursday.", `Is it? ...Then I'm a genius, and I'd like that written down somewhere official.`],
];
const FIXED_TOWN: string[][] = [
  ["Chère, you're calling me from the phone booth? I'm three blocks away. I can practically hear you not visiting.", 'Come Sunday. Bring a tape. Bring yourself.'],
  ["I called you Bird yesterday. Sami told me. I'm sorry, chère.", "...No, I'm not. If I'm going to mix you up with anybody, it might as well be her."],
];
const FIXED_TRUTH: string[][] = [
  ["She walked past the Bell this morning. Lavinia saw. She stopped on the steps, then she kept walking.", "That's alright. I did the same thing at her corner all summer. Slow learners, the both of us. Very thorough, though."],
  ["Did she eat today? You'd tell me if she didn't eat. Somebody has to make her eat.", "Forty years and I'm still worrying about Birdie Malone's lunch."],
];
const FIXED_AFTER: string[][] = [
  ["(Birdie answers Room 7's phone.) Dupree residence, sort of. She's asleep in the chair, sugar. Don't you worry. I've got her.", "She's got a blanket over her knees she says is too scratchy. She hasn't taken it off in two hours."],
  ["(Birdie answers.) She cheated me out of nine dollars at gin and called me Bird all afternoon. Best afternoon I've had since 1983.", 'Come by Sunday. She wants to teach you the Curtsy again. Let her.'],
];

/** How she heard about it, depending on where she is. */
function source(m: MatchMemory, st: Stage, calls: number): string {
  if (st === 'after') return m.venue === 'vfw' ? 'Bird drove me to the VFW. I had a bingo card and I didn\'t look at it once.' : 'I was there! Second row. Bird held my elbow the whole time, which I allowed.';
  if (st === 'town' || st === 'truth') {
    return m.venue === 'sportatorium' ? "I heard it from my window, chère. The Sportatorium is louder than you'd think from three blocks. Sami told me which roar was yours." : 'Sami went to bingo at the VFW so he could tell me. He came back with a casserole dish that isn\'t his.';
  }
  const away = [
    "Agnes wrote me. Four pages, both sides, and she drew the ring.",
    'Lou called. Lou never calls. He let it ring nine times so I\'d know it was him.',
    'Agnes sent me the Tattler, folded down to your part, with a paper clip on it like a medal.',
  ];
  return away[calls % away.length];
}

/** What she says about your last match. Specific to what happened. */
function matchCall(m: MatchMemory, st: Stage, calls: number): string[] {
  const good = m.stars >= 3;
  const big = m.highlights.find((h) => h.includes('2.9'));
  const out = [source(m, st, calls)];
  if (m.won && m.title) out.push(`You won the belt. Off {opponent}. I made the nurse read it twice, then I made her read it to the man in 4B, who is deaf, so she had to read it loud.`);
  else if (m.won && good) out.push("You beat {opponent} with the {finisher}. Agnes underlined it. Agnes doesn't underline. She says underlining is for people who can't write.");
  else if (m.won) out.push("You won, she says. She says it with a comma after it. Agnes's commas carry a lot of weight.", 'The man behind her fell asleep in the middle part. She woke him up for the finish. She\'s very fair.');
  else if (good) out.push("You lost to {opponent}, and the whole front row stood up for you anyway. Oh, I lost like that for years. Those are the ones they keep.");
  else out.push("It sounds like a hard one. I'm not going to ask about the match.", 'I\'m going to ask if you ate after. ...You did not. I can hear that you did not.');
  if (big) out.push('And a kickout at two and nine-tenths. I yelled. The nurse came running. I told her it was a spider.');
  if (st === 'after') out.push(m.won ? 'I booed the other one. Out of habit. Bird says I can\'t do that anymore. I said watch me.' : 'Bird says you sold it right. I say you sold it beautiful. We\'re both correct.');
  return out;
}

/** Calls about the rest of your week, when there's no match to talk about. */
function weekCall(st: Stage, sinceCall: number, calls: number): string[] | null {
  const m = lastMatch();
  if (sinceCall >= 10) return ['There you are. I had the nurse check the phone was plugged in. Twice.', "I'm not cross. I'm writing it in my book, that's all. 'Tuesday: still not cross.'"];
  if (isShowDay() && G.time.minutes < 19 * 60) return [weekday() === 2 ? 'Wednesday. The VFW. Fifty chairs and a nine-foot ceiling. Don\'t climb anything.' : 'Saturday. I can feel it in my knees. They always knew Saturday before I did.', 'Go stand in the hallway before the bell and just listen. Tell me what it sounds like, after.'];
  if (G.weather.today === 'rain' || G.weather.today === 'storm') return ["Is it raining there too? It's raining here. I'm watching it run down the window like it's late for something.", st === 'away' ? 'The Sportatorium roof leaks over section C. Or it did. Tell Hank I said section C. He\'ll know.' : 'Section C is leaking, I bet. Tell Hank. Tell him I said so.'];
  if (G.flags['debuted'] && (!m || absDay() - m.day > 10)) return ["You haven't wrestled in a while. Agnes noticed. Agnes notices everything, and then she writes it to me.", 'Are you hurt? Are you sulking? Both are allowed. Pick one and tell me.'];
  if (calls % 4 === 3) return ['Tell me about the people. Not the matches. The *people*. Who sat in the front row? What were they eating?'];
  return null;
}

export async function callGrandma(): Promise<void> {
  const ps = phoneState();
  if (G.player.money < 1) {
    await narrate("It's a quarter for a call. You don't have a quarter. You don't have anything.");
    return;
  }
  if (ps.lastCall === absDay()) {
    await narrate('You already called today. She was tired. Let her rest.');
    return;
  }
  const c = await choose(null, 'The payphone. Grandma\'s number is written on the back of her letter.', [
    { label: 'Call Grandma (25¢)', value: 'call', style: 'primary' },
    { label: 'Hang up', value: 'no' },
  ], { cancelValue: 'no' });
  if (c !== 'call') return;
  G.player.money -= 1;
  audio.sfx('coin');
  const sinceCall = ps.lastCall < 0 ? 0 : absDay() - ps.lastCall;
  ps.lastCall = absDay();
  const g = speakerFor('grandma');
  const st = stage();
  if (st === 'town' || st === 'truth') await say(speakerFor('sami'), "Evening Bell, Sami speaking. ...Oh! Hold on. Your Grace? It's for you. It's your favorite.");

  const m = lastMatch();
  const fresh = m && m.day > (ps.heardMatch ?? -1) && absDay() - m.day <= 4 ? m : null;
  const fixedPool = st === 'after' ? FIXED_AFTER : st === 'truth' ? FIXED_TRUTH : st === 'town' ? FIXED_TOWN : FIXED_AWAY;
  let lines: string[];
  let who = g;
  if (ps.calls === 0) lines = FIRST(G.player.name);
  else if (fresh) {
    ps.heardMatch = fresh.day;
    lines = matchCall(fresh, st, ps.calls).map((t) => fillMemory(t, 'grandma'));
  } else {
    // Every other call without news is one of the story calls, in order.
    const week = ps.calls % 2 === 0 ? weekCall(st, sinceCall, ps.calls) : null;
    const k = ps.fixed ?? 0;
    if (week) lines = week;
    else {
      lines = fixedPool[k % fixedPool.length];
      ps.fixed = k + 1;
      if (st === 'after' && lines[0].startsWith('(Birdie')) who = speakerFor('birdie');
    }
  }
  await say(who, ...lines);
  ps.calls++;
  if (who !== g) return;
  const end = await choose(g, null, [
    { label: '"I love you, Grandma."', value: 'love' },
    { label: '"I\'ll call again soon."', value: 'soon' },
  ]);
  await say(g, end === 'love' ? 'I love you more. I checked. Bye, sweetheart.' : "You'd better. Bye, sweetheart. Ring the bell for me.");
}
