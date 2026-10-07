import { audio } from '../audio';
import { G, ext } from '../core/state';
import { absDay } from '../core/time';
import { choose, narrate, say } from '../ui/dialog';
import { speakerFor } from '../world/talk';

/** Payphone calls with Grandma. One call a day; what she says grows with the story. */
interface PhoneState {
  lastCall: number;
  calls: number;
}
function phoneState(): PhoneState {
  return ext<PhoneState>('phone', () => ({ lastCall: -1, calls: 0 }));
}

const CALLS: ((name: string) => string[])[] = [
  (n) => [`${n}! Is that you? You sound like you're in a tin can. Oh, it's the payphone by the gas station. That payphone has been there since Nixon.`, "Tell me everything. No, tell me the *important* thing: did the crowd stand up?"],
  () => ['Lou called me. Lou never calls. He said you sold an elbow like it owed you money. I laughed so hard the nurse came in.', "Is she eating? Birdie forgets to eat when there's a show. She'll live on cinnamon sticks and spite."],
  () => ["I had a dream we were in the Sportatorium and it was 1979 and the roof leaked right onto the ring and we wrestled anyway, sliding all over, and the people *loved* it.", "...That wasn't a dream, actually. That was a Tuesday."],
  () => ["Sweetheart, what day is it? No, don't tell me. I like guessing. It's... Thursday.", "It's not Thursday, is it. That's alright. It'll be Thursday eventually."],
  () => ['Do you know what a hope spot is? Of course you do. Little burst of offense right before the bad guy cuts you off again. The crowd *knows* it won\'t last. They cheer anyway.', 'That\'s the whole business, sweetheart. People cheering for something they know won\'t last. That\'s the whole thing.'],
  () => ["You held that headlock too long Saturday. Your shoulders dropped before the comeback. I could see it from...", "...From Agnes's letter. She describes everything. Agnes would have made a wonderful referee. Don't tell her."],
  () => ["I put my shoes in the refrigerator this morning. Nice and cold. Very refreshing for the feet.", "Don't laugh. ...Alright, laugh. I did. The nurse did. Even the shoes looked amused."],
  () => ["Is the marquee still on the corner? Does it still spell her name with the little star over the i?", "There's no i in Birdie's... there is, isn't there. Two. Listen to me. I knew that for forty years."],
];

/** Once Grandma lives three blocks away, the call goes to the Evening Bell front desk. */
const TOWN_CALLS: string[][] = [
  ["Chère, you're calling me from the phone booth? I'm three blocks away. I can practically hear you not visiting.", 'Come Sunday. Bring a tape. Bring yourself.'],
  ["What day is it? No, let me guess. ...I'm not going to guess. I'm going to ask Sami, and pretend I knew.", "Sami says it's a weekday. Sami is very diplomatic."],
  ['The marquee says your name tonight. Third from the top. I read it twice to make sure, and once more because I liked it.'],
  ["I called you Bird yesterday. Sami told me. I'm sorry, chère.", "...No, I'm not. If I'm going to mix you up with anybody, it might as well be the best one."],
];
const TRUTH_CALLS: string[][] = [
  ["Did she eat today? You'd tell me if she didn't eat. Somebody has to make her eat.", "Forty years and I'm still worrying about Birdie Malone's lunch. Some jobs you never retire from."],
  ["She walked past the Bell this morning. Lavinia saw. She stopped on the steps, then she kept walking.", "That's alright. I did the same thing at her corner all summer. We're slow learners, chère. Very thorough, though."],
];
const AFTER_CALLS: string[][] = [
  ["(Birdie answers Room 7's phone.) Dupree residence, sort of. She's asleep in the chair, sugar. Don't you worry. I've got her.", 'I always did have her. Took me a while to get here, is all.'],
  ["(Birdie answers.) She cheated me out of eleven dollars at gin and called me Bird nine times. Best afternoon I've had since 1983.", 'Come by Sunday. She wants to teach you the Curtsy again. Let her.'],
  ['Chère! Was it Saturday? It was. I stood up. I didn\'t know why, and then the music told me. Your music.', 'The body remembers. Ring the bell for me.'],
];

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
  ps.lastCall = absDay();
  const g = speakerFor('grandma');
  const name = G.player.name;
  const lines = CALLS[Math.min(ps.calls, CALLS.length - 1)](name);
  const stagePool = G.flags['reunion_done'] ? AFTER_CALLS : G.flags['truth_revealed'] ? TRUTH_CALLS : G.flags['grandma_in_town'] ? TOWN_CALLS : null;
  if (stagePool) {
    if (G.flags['grandma_in_town'] && !G.flags['reunion_done']) await say(speakerFor('sami'), 'Evening Bell, Sami speaking. ...Oh! Hold on. Your Grace? It\'s for you. It\'s your favorite.');
    await say(G.flags['reunion_done'] && ps.calls % 3 !== 2 ? speakerFor('birdie') : g, ...stagePool[ps.calls % stagePool.length]);
  } else if (ps.calls >= CALLS.length) {
    const extra = [
      ["Is it Saturday? I always know when it's Saturday. My knees know.", 'Go make somebody look like a million bucks.'],
      ['Tell me about the people. Not the matches. The *people*. Who sat in the front row?'],
      ["I'm fine, I'm fine. They have pudding here. I'm in a war with the pudding."],
    ];
    await say(g, ...extra[ps.calls % extra.length]);
  } else await say(g, ...lines);
  ps.calls++;
  const end = await choose(g, null, [
    { label: '"I love you, Grandma."', value: 'love' },
    { label: '"I\'ll call again soon."', value: 'soon' },
  ]);
  await say(g, end === 'love' ? 'I love you more. That is a scientific fact. Bye, sweetheart.' : "You'd better. Bye, sweetheart. Ring the bell for me.");
}
