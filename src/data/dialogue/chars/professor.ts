import type { DialogueSet } from '../types';

/**
 * Odessa Pruitt, "Professor" Pinfall. High school math teacher, the finest
 * technical wrestler in the territory, and a villain in public (CAST.md),
 * even in the classroom. In private: gentle, punny, the one everybody asks to
 * explain it twice. In love with Coach Patty for twelve years. At eighteen she
 * sat in the ninth row in 1983 and noticed the geometry was wrong.
 * Her 10-heart event sets 'odessa_patty' (for Patty's 10-heart line).
 */
export default {
  npc: 'professor',
  intro: [
    "Odessa Pruitt. Math, periods two through six. Professor Pinfall on Saturdays. Birdie says you're green. Green is a starting color, not a grade.",
    "I'll tell you what I tell my students: I don't care if you're right. I care whether you can show me why.",
    "Come find me when you want to learn the mat. Bring a pencil. I'm serious about the pencil.",
  ],
  introPublic: [
    "Ah. A new face. Let me guess: you think wrestling is about *strength*. Wrong. It's about geometry. Detention.",
    "Professor Pinfall. Doctor of Submission, Chair of the Department of Pain. I also teach algebra at the high school. Same thing.",
    "Run along. And stand up straight. Slouching is bad posture with a worse attitude.",
  ],
  lines: [
    // ---- Strangers, in public (villain in character)
    { text: "Wrong. Also wrong. Ah, and *that* one's wrong in a fascinating new way. Detention. For the fascination.", when: { place: ['public'], map: ['school'] }, weight: 2 },
    { text: "The hero. Charming. Your posture is a C-minus and your entrance is a D. I'd keep you after class if you were worth the chalk.", when: { place: ['public'], alignment: ['face'], flag: 'debuted' } },
    { text: "A fellow villain. Adequate. Your cheating is sloppy. Cheat with *precision*, or don't cheat at all.", when: { place: ['public'], alignment: ['heel'], flag: 'debuted' } },
    { text: "Class starts in four minutes. Latecomers receive a lecture on the cost of tardiness. It's forty minutes long. With slides.", when: { map: ['school'], time: [420, 480] } },
    { text: "Tutoring. Shh. I'm explaining the quadratic formula to a sophomore who thinks it's a conspiracy. He's half right.", when: { map: ['library'], time: [930, 1140] } },
    { text: "Birdie Malone is in her office at the Sportatorium. Go. Do not tell her I gave you directions. I have a reputation.", when: { notFlag: 'met_birdie' }, weight: 3 },
    { text: "Tonight I hand out failing grades in front of two thousand people. It's the most rewarding part of teaching.", when: { showDay: true, place: ['public', 'show'] } },
    { text: "Thursday. Coach Kowalski and I have our weekly disagreement on the mats. She will lose. She always loses. It's her best quality.", when: { weekday: [3] } },
    { text: "Sundays I'm at the vet clinic for cat adoption day. The cats are not graded. The adopters are.", when: { weekday: [6] } },
    { text: "Rain. Statistically the best day for logic puzzles. Also the worst day for my knees. The universe balances its equations.", when: { weather: ['rain', 'storm'] } },
    { text: "Snow day. School's closed. I'm grading anyway. The students don't know. They'll find out Monday. It'll be a cold Monday.", when: { weather: ['snow'] } },

    // ---- Friends, public
    { text: "Your boot is untied. In a ring, that's a liability. In a hallway, merely a tragedy.", when: { hearts: [3, 5], place: ['public'] } },
    { text: "I told my class a joke about infinity. They're still waiting for the punchline. ...That was the punchline.", when: { hearts: [3, 10] } },
    { text: "Dex Delgado failed my class twice. Third time, he got a B. He doesn't know I keep that report card in my desk. In a folder. Labeled DEX.", when: { hearts: [3, 10] } },
    { text: "Lacey Ransom booed me in the hallway today. Then she turned in a perfect proof. I let her boo. She earned it.", when: { hearts: [3, 10] } },
    { text: "I have a foster cat named Hypotenuse. He leaves for a good home Sunday. I am not going to cry. I am going to cry.", when: { hearts: [3, 10] } },
    { text: "Spring. Pi Day approaches. Tiny bakes me a pie with exactly three-point-one-four inches of crust. She measures. I watch her measure.", when: { season: [0] }, weight: 2 },
    { text: "Summer. No school. I spend it grading the universe. Mostly the universe gets a B-plus.", when: { season: [1] } },
    { text: "First week of school. Thirty new students who already hate me. Best week of the year. Fresh hate is very motivating.", when: { season: [2] } },
    { text: "Winter. My left ear aches in the cold. Forty years on the mat. It's cauliflower. I named it Euclid. It has the same number of friends.", when: { season: [3] } },

    // ---- Friends, insider
    { text: "In here I can say it plainly: a match has the structure of a sonnet. Fourteen spots. The turn at the ninth. Every time.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Chain wrestling is a conversation. Wrist. Elbow. Headlock. Answer, answer, answer. Don't interrupt your opponent. It's rude.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Coach Lou trained me in the Dungeon in '93. He sang to me while he stretched me. I've never forgiven him. I've never stopped thanking him.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Extra credit? I give the most in the county. Don't you dare tell a soul. A villain's reputation is mostly maintenance.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Tonight's finish is a cradle. Bridge high, count slow, let them believe the kickout. Then write Q.E.D. like you mean it.", when: { showDay: true, place: ['insider'] } },
    { text: "Rookies rush. Rushing is panic in sneakers. Count to three before every transition. Out loud, if you must.", when: { rank: ['rookie', 'opener'], place: ['insider'] } },
    { text: "Main event. Now teach the young ones. Explain it twice. If they still don't have it, explain it a third time, slower, and pretend it's the first.", when: { rank: ['main', 'assistant', 'pencil', 'owner'], place: ['insider'] } },
    { text: ["You and {opponent}. I charted it. Fourteen spots, the turn at the ninth, exactly where it belonged.", "Your transitions were a B. Your finish was an A-minus. The minus is for the hair."], when: { place: ['insider'], lastMatch: { minStars: 3, maxDaysAgo: 4 } } },
    { text: "You and {opponent} rushed the middle. Count to three before every transition. Out loud. I'll be in the second row mouthing it.", when: { place: ['insider'], lastMatch: { maxStars: 2.5, maxDaysAgo: 4 } } },
    { text: "Hm. I watched your little contest with {opponent}. Your geometry was adequate. Don't let it go to your head. Your head is already a C-plus.", when: { place: ['public'], lastMatch: { maxDaysAgo: 3 } }, mood: 'smug' },

    // ---- Close
    { text: "Coach Kowalski and I have been disagreeing for twelve years. She's wrong about nearly everything. I find I look forward to Thursdays.", when: { hearts: [6, 8], place: ['public'], notFlag: 'odessa_patty' } },
    { text: "I plan to retire from the ring at sixty. That's next year. I've done the math. I keep checking it. It keeps being next year.", when: { hearts: [6, 10] } },
    { text: "I keep a wall of photos at school labeled GRADUATES. Some are cats. Some are wrestlers. All of them passed.", when: { hearts: [6, 10] } },
    { text: "I was eighteen, ninth row, the night the belt broke. Something in that ring didn't add up. I've been doing the math for forty years.", when: { hearts: [6, 10], place: ['insider'] } },
    { text: "Patty's a mark. Do you see what that means? Every Thursday I hold her on those mats, and I can't tell her one true thing.", when: { hearts: [6, 10], place: ['insider'], notFlag: 'odessa_patty' }, mood: 'sad' },
    { text: ["Off the record? Her swing came down on the post. Not on Birdie. I saw the angle from the ninth row.", "A villain doesn't pull a swing. So why did she? That's the variable."], when: { hearts: [8, 10], place: ['insider'], flag: 'grandma_in_town', notFlag: 'truth_revealed' } },

    // ---- Family
    { text: "You've passed, you know. Don't let it go to your head. Your head is already a C-plus in terms of size.", when: { hearts: [9, 10], place: ['public'] } },
    { text: "If I could write one proof before I retire, it'd be about you. I've started. Four pages. The conclusion's still blank. I'm in no hurry.", when: { hearts: [9, 10], place: ['insider'] } },
    { text: "Patty held my hand at the faculty meeting. In front of the vice principal. I lost my place in the agenda. I never lose my place.", when: { flag: 'odessa_patty' }, mood: 'love', weight: 2 },
    { text: "Thursday on the mats is different now. She still loses. She just laughs more. I let her think it's because she's winning.", when: { flag: 'odessa_patty', place: ['insider'] } },

    // ---- Main story
    { text: "She pulled the swing. I knew it. Forty years I had the angle and not the reason. Now I have both and nowhere to hand it in.", when: { flag: 'truth_revealed', place: ['insider'] }, mood: 'sad' },
    { text: "The Velvet Hammers, back in the ring. I'm going to watch from the ninth row. Old habits. Better math.", when: { flag: 'reunion_done' }, mood: 'happy', weight: 3 },
  ],
  gifts: {
    loves: ['chalk', 'pie', 'paperback'],
    likes: ['teacup', 'yarn', 'coffee', 'old-program', 'tiny-cake'],
    dislikes: ['merch-sign', 'gas-hotdog', 'foam-finger'],
  },
  giftReplies: {
    love: [
      "Oh. This is correct. This is entirely correct. A-plus. If that gets out, I'll deny it in front of the whole faculty.",
      "You did your homework. I can tell. ...Don't you dare tell Patty this made my week.",
      "Q.E.D. This is a perfect gift and I can prove it. I won't. But I could.",
    ],
    like: [
      "Solid work. B-plus. Thank you.",
      "Thoughtful. A B, with room for growth.",
      "Hm. Acceptable. More than acceptable. Thank you.",
    ],
    neutral: [
      "Interesting choice. I'll grade it later. In pen.",
      "Thank you. The cats will investigate it.",
    ],
    dislike: [
      "How thoughtful. The cats will use it as a doorstop.",
      "Wrong. But wrong in a way I'll remember. That's something.",
      "A D. Only because I don't give F's for effort. I give them for everything else.",
    ],
    birthday: [
      "Spring the fourteenth. I count spring as the third month, so it's Pi Day. Don't argue. A {item}. A-plus. Infinite plus.",
      "A {item} on my birthday. I'm writing your name in my grade book under 'People Who Pay Attention.' It's a short list. Patty's on it, in pencil.",
    ],
    byItem: {
      chalk: ["Real chalk. The dense kind, not the dusty classroom sticks. (She draws a perfect circle on the nearest surface, freehand.)", "...The custodian will find that. He'll know it was me. Nobody else in this building can do a circle."],
      pie: "Pie. If it's Tiny's, the crust is exactly three-point-one-four inches. (She measures with her thumb.) It is. Of course it is.",
      paperback: "A mystery with the last page torn out. You've given me an unsolved problem. That's the kindest thing anybody's done for me all semester.",
      teacup: "A teacup. Floral. The handle's at a seventy-degree angle. I'll be thinking about that all week. In a good way.",
      yarn: "Yarn. For the cats at adoption day. Hypotenuse will unravel it into a perfect parabola. He always does.",
      coffee: "Coffee. Third period is in nine minutes. You've just saved a sophomore's life.",
      'old-program': "A 1979 program. Look at the card order. Somebody booked this with a sense of proportion. I approve of whoever held that pencil.",
      'tiny-cake': "One of Tiny's. I'll eat it in exactly three bites. Not two. Three is a better number for a cake.",
    },
    later: [
      "The {lastGift} is on my desk. A student asked if it was a bribe. I gave him extra homework. It isn't a bribe. It's a gift. There's a difference, and it's on the test.",
      "Patty saw the {lastGift} and asked who gave it to me. I said a former student. Then I realized you've never been in my class. I've decided you were.",
    ],
  },
  again: [
    "Back already? Show your work. ...Fine. Hello again.",
    "(Professor Pinfall raises one eyebrow by a precise number of degrees. You've been noted.)",
    "We've covered this material. There won't be a quiz. There might be a quiz.",
  ],
  idle: [
    "(She is grading with a red pen and the expression of someone who enjoys it.)",
    "Not now. I'm checking a proof. It's wrong. I'm enjoying how wrong.",
  ],
  birthday: { season: 0, day: 14 },
  events: [
    {
      id: 'professor-2', hearts: 2, title: 'Show Your Work',
      script: async (api) => {
        await api.narrate('Saturday morning. Odessa Pruitt appears at the edge of your backyard ring in a tweed blazer, with a clipboard and a red pen.');
        await api.say('professor', "Takedown. Single leg. Go. Pretend I'm not watching. I am watching. Go.");
        await api.narrate('You shoot. You get the leg. You also get a mouthful of canvas.');
        await api.narrate('Odessa writes on a yellow sticky note and presses it to your forehead. It says: *C-minus. Show your work.*');
        const c = await api.choose(null, [
          { label: 'How do I get an A?', value: 'how' },
          { label: 'Argue it was at least a C', value: 'argue' },
        ]);
        if (c === 'how') {
          api.hearts('professor', 30);
          await api.say('professor', 'Finally. A good question. Your hips were late. Your hand was early. Your *head* was somewhere in March.');
          await api.narrate('She walks you through it four times, slowly, link by link. Wrist, elbow, shoulder. Answer, answer, answer.');
          api.learnCard('chainwrestle');
        } else {
          api.hearts('professor', 15);
          await api.say('professor', 'Persuasive. Revised grade: C. Still minus. The minus is load-bearing.');
        }
        await api.sayMood('professor', 'happy', "Same time next Saturday. Bring a pencil. I'm serious about the pencil.");
      },
    },
    {
      id: 'professor-4', hearts: 4, title: 'The Sonnet',
      script: async (api) => {
        await api.narrate("Odessa taps your shoulder. 'Back booth, tonight. Bring a pen. Not that one. A good one.'");
        await api.fade();
        await api.narrate('The back booth. Odessa has a stack of napkins and is writing on them in tiny, perfect handwriting.');
        await api.say('professor', 'Hypothesis: a great match has the structure of a sonnet.');
        await api.say('professor', 'Fourteen spots. The first eight build the problem: feeling out, shine, heat. Then the turn, at the ninth. The comeback.');
        await api.narrate('She numbers the napkin one to fourteen. Beside the nine she draws a small, neat star.');
        await api.say('professor', 'Five more to resolve it. Near-fall, near-fall, reversal, finisher, pin. Fourteen. Every great match I have ever seen.');
        const c = await api.choose(null, [
          { label: 'What about bad matches?', value: 'bad' },
          { label: 'Can I keep the napkin?', value: 'keep' },
        ]);
        if (c === 'bad') {
          api.hearts('professor', 15);
          await api.sayMood('professor', 'smug', 'Bad matches turn on the fourth spot. Or the twelfth. Or never. Like a limerick. Nobody cries at a limerick.');
        } else {
          api.hearts('professor', 30);
          await api.narrate('She hesitates. Then she signs the bottom of it like a painting: *O. Pruitt. Q.E.D.*');
          await api.say('professor', "Frame it or don't. But do not wipe your mouth with it.");
        }
        await api.say('professor', "Wrestling's the only art where the audience writes half the poem. I've been trying to prove that for thirty years. I'm close.");
      },
    },
    {
      id: 'professor-6', hearts: 6, map: 'sportatorium', title: 'The Ninth Row', when: { showDay: true },
      script: async (api) => {
        await api.narrate('The locker room before the show. Odessa sits very straight on the bench, mortarboard in her lap, flicking the tassel.');
        await api.say('professor', "I was eighteen the first time I sat in this building. Ninth row. Next to Fenwick Thistle, who had a borrowed camcorder and terrible hair.");
        await api.say('professor', "It was the night the belt broke. 1983. You've heard the town's version.");
        await api.narrate('The tassel stops.');
        await api.say('professor', "Something in that ring didn't add up. I didn't know what. I just knew the numbers were wrong. The angles. The timing.");
        await api.sayMood('professor', 'sad', 'College for judo. Home to teach math. Trained under Coach Lou. Debuted. All of it, partly, to find out why.');
        await api.say('professor', "Forty years of math, and I'm still missing a variable.");
        const c = await api.choose(null, [
          { label: 'What do you think the variable is?', value: 'variable' },
          { label: 'Maybe some things are not math.', value: 'notmath' },
        ]);
        if (c === 'variable') {
          api.hearts('professor', 15);
          await api.say('professor', "If I knew, it'd be a constant. ...I think it's something a villain would never do. That's all I'll say without proof.");
        } else {
          api.hearts('professor', 30);
          await api.narrate('Odessa looks at you a long moment over her reading glasses.');
          await api.say('professor', "Everything is math. But some math is love. I'll grant you that. Off the record.");
        }
        await api.narrate('A school bell rings over the speakers: her music. She stands, settles the mortarboard, and becomes the Professor.');
        await api.sayMood('professor', 'smug', "Now. Let's go fail some people.");
      },
    },
    {
      id: 'professor-8', hearts: 8, title: 'How Do You Love Somebody',
      script: async (api) => {
        await api.narrate("Thursday night. Odessa is alone in the back booth with a logic puzzle she hasn't touched and a cup of tea she hasn't either.");
        await api.say('professor', 'Coach Kowalski pinned me today. For one second. Then I reversed it and won, as I do every Thursday.');
        await api.say('professor', "For that one second she was laughing. She laughs like a whistle at the end of a race. I've loved it for twelve years.");
        await api.narrate("She says it the way she'd say *seven times eight is fifty-six*. A fact she has checked too many times.");
        await api.say('professor', "But she's a mark. Every Thursday I hold her on those mats, and I can't tell her a single true thing about my life.");
        await api.sayMood('professor', 'sad', 'How do you love somebody you can\'t tell the truth to?');
        const c = await api.choose(null, [
          { label: 'Tell her who you are. Not what you do.', value: 'who' },
          { label: 'Maybe some love stays on the mats.', value: 'mats' },
        ]);
        if (c === 'who') {
          api.hearts('professor', 30);
          await api.narrate('Odessa goes very still. The red pen behind her ear seems to quiver.');
          await api.say('professor', "...Who I am. Not what I do. Those are two different proofs. I've only ever been working on one of them.");
        } else {
          api.hearts('professor', 15);
          await api.say('professor', "Maybe. It's been enough for twelve years. Mostly. On Thursdays.");
          await api.narrate('She picks up the logic puzzle and finishes it in pen without looking down.');
        }
        await api.say('professor', "Don't tell anyone I asked for advice. I'm a teacher. We give advice. We do not receive it. It's a closed system.");
      },
    },
    {
      id: 'professor-10', hearts: 10, title: 'Thursday on the Mats',
      script: async (api) => {
        await api.narrate('Odessa finds you with a legal pad full of diagrams, arrows, and one equation circled three times.');
        await api.say('professor', "I've decided. I'm going to tell Patty I love her. Not about the business. Only about the love.");
        await api.say('professor', "I can't tell her what I do. I can tell her who I am. That's the variable. It was always the variable.");
        const c = await api.choose(null, [
          { label: 'Let her win this time.', value: 'win' },
          { label: "Don't plan it. Just say it.", value: 'say' },
        ]);
        if (c === 'win') {
          api.hearts('professor', 30);
          await api.say('professor', "Let her have the pin. Yes. For the first time in twelve years. She'll know something's different before I open my mouth.");
        } else {
          api.hearts('professor', 15);
          await api.say('professor', "No plan? I'm a math teacher. ...Fine. I'll let her have the pin, and then I'll improvise. God help me. I'll improvise.");
        }
        await api.fade();
        await api.narrate('Thursday. The high school gym after practice. Floor wax, old mats, late sun through high windows. You watch from the bleachers.');
        await api.say('patty', "Same time, same place, Pruitt. This time I'm watching your hips.");
        await api.narrate('They lock up. Thirty seconds of real, beautiful grappling. Then Odessa, for the first time ever, lets her hips go a quarter-second late.');
        await api.narrate('Patty takes her down and holds her. The gym is silent. Patty looks confused. Then she looks at Odessa\'s face, and loosens her grip.');
        await api.say('professor', "Patty. I'm going to say something true, and I need you to let me finish, because I have been rehearsing it for twelve years.");
        await api.sayMood('professor', 'love', "I love you. That's all. That's the whole proof.");
        await api.narrate('Coach Patty Kowalski, who has argued with every referee in the county, says nothing at all for a long, long time.');
        await api.say('patty', '...You let me win.');
        await api.say('professor', "I let you *have* it. There's a difference. I'd explain, but I'd need a chalkboard.");
        await api.narrate("Patty laughs, the whistle at the end of the race, and doesn't get up. Neither does Odessa. You slip out of the gym quietly.");
        api.flag('odessa_patty');
      },
    },
  ],
} satisfies DialogueSet;
