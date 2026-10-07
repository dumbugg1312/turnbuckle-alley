import type { DialogueSet } from '../types';

/**
 * Coach Patty Kowalski, 52. Amateur wrestling coach at Turnbuckle Alley High
 * for twenty-four years. Absolutely certain pro wrestling is fake. Keeps
 * trying to prove it. Never succeeds, because every attempt runs into
 * something real. Aunt of the Bruiser Twins (Bo and Buck Kowalski), which
 * makes every Thursday pot roast a cross-examination. A mark, permanently:
 * she never joins the business, and the investigation never closes.
 */
export default {
  npc: 'patty',
  intro: [
    "(A whistle blast.) You. New wrestler. Coach Patty Kowalski, Turnbuckle Alley High. Twenty-four years.",
    "I coach real wrestling. Amateur. Points, periods, a mat and a whistle. No folding chairs. You know the difference?",
    "Here's what I know. What you people do on Saturdays is fake. I just haven't proved it yet.",
    "You're new. Fresh eyes. I'll be watching you. Don't take it personally. I watch everybody. I have a clipboard.",
  ],
  lines: [
    // ---------------------------------------------------------------- the investigation
    { text: "This clipboard says EVIDENCE. Every page is a lead. Every lead is a dead end. I'm on page two hundred and six.", mood: 'smug' },
    { text: "Two TVs in my garage. Slow motion. Frame by frame. Takedown sleeps through all of it. Takedown has no curiosity." },
    { text: ["Tried to get backstage again Saturday. Mo was there. 'Staff only, Coach.'", "She's ALWAYS there. How is the mail lady always there?"], mood: 'angry' },
    { text: ["I challenged the Mountain to real grappling once. He sat down. On the mat.", "Couldn't move him for forty-five minutes. That was real. That proves NOTHING."], mood: 'angry' },
    { text: ["I send my kids to Hazel Huang for PT. Saw her knee scar once. Had to sit down.", "That knee was real. So the rest... no. Separate issue."] },
    { text: ["Asked Doc Halloran if a man could take a chair to the back and walk away.", "He said 'that's a sore subject.' Then he winked. WHAT DOES THE WINK MEAN."], mood: 'angry' },
    { text: ["Gideon ran my 5K in sequins. Finished fourth. In SEQUINS.", "Explain that, if it's all fake. ...Wait. That doesn't help me. Forget I said it."] },
    { text: "Glitter. Everywhere. In my truck. In my whistle. I don't go anywhere near Gideon and it's in my WHISTLE.", mood: 'angry' },
    { text: "New plan for Saturday: a camera inside a foam finger. Nobody suspects a foam finger. I can't stand foam fingers. I'll be wearing one for three hours. That's how close I am." },

    // ---------------------------------------------------------------- family and team
    { text: ["My nephews are the Bruiser Twins. Stan's boys. Thursday dinner, I cross-examine them over pot roast.", "Thirty years and they have never once agreed on anything. That part's real. I'd testify."] },
    { text: ["Bo says Buck started it. Buck says Bo started it.", "I asked who started it in the RING and they both said 'him.' Unbelievable. Consistent, though."] },
    { text: "My brother Stan calls from Arizona with grout advice. Every week. I don't have tile. He knows I don't have tile." },
    { text: "My dog's named Takedown. He's a mutt. Best wrestler in the house. Never once faked an injury. Except for bacon." },
    { text: ["Lacey Ransom is the best one-eighteen I've coached in twenty years.", "She's going to college on a wrestling scholarship. Not to that circus."] },
    { text: "Clint Ransom and I agree Lacey goes to college. We disagree about everything else. Politely. Terribly. Across the bleachers." },
    { text: "My team's never won state. Twenty-four years. 'This could be the year.' It's always this could be the year. Great sentence." },
    { text: ["Olympic trials alternate, 1996. Cauliflower ear to prove it.", "Real wrestling leaves marks. Mine's the left ear. It hears the kids lie better than the right one."], when: { hearts: [3, 14] } },

    // ---------------------------------------------------------------- Odessa
    { text: ["Odessa Pruitt is the most insufferable woman I've ever met.", "I think about it constantly. The insufferableness. Constantly."], mood: 'angry' },
    { text: ["Thursday. Gym mats. Pruitt. She beats me in under a minute every week.", "It proves nothing. It proves she's good. It proves... nothing."], when: { weekday: [3] } },
    { text: "Same time Thursday, Pruitt. ...Sorry. Practicing. I say it to her every week and I like to get the tone right.", when: { weekday: [0, 1, 2] } },

    // ---------------------------------------------------------------- weekly rhythm
    { text: "Meet today. Come watch if you're free. No music. No lights. Just kids and a whistle and the truth.", when: { weekday: [1] } },
    { text: "Thursday. Mats with Pruitt at three thirty, pot roast with the nephews at six. Biggest day of my week. Neither of them gets to know that.", when: { weekday: [3] } },
    { text: ["Sunday's tape day. Found a punch that missed by six inches.", "Next frame, the guy's lip is split. I didn't sleep."], when: { weekday: [6] } },
    { text: "Practice till six. I've got kids running stairs. They hate me. They'll thank me at state. Or at thirty. Either.", when: { weekday: [0, 2, 4], time: [900, 1080] } },

    // ---------------------------------------------------------------- shows
    { text: "That is NOT a legal hold in ANY federation! Ref! REF! Are you BLIND?", when: { showDay: true, place: ['show'] }, mood: 'angry' },
    { text: "Show tonight. Clipboard. Disposable camera. Stopwatch. I've been close before. Very close.", when: { showDay: true } },
    { text: "You and {opponent}. Minute four. You took a fall. I timed your breathing after. That's real breathing. I don't like it.", when: { lastMatch: { maxDaysAgo: 3 } } },
    { text: "{opponent} put you down hard. Ice, compression, elevation. Anybody tells you it's 'just a scratch,' you tell them Coach said otherwise.", when: { lastMatch: { won: false, maxDaysAgo: 3 }, hearts: [3, 14] } },
    { text: ["Your finish. The {finisher}. I watched it frame by frame. Twenty-two frames.", "Frame fourteen, your knee's an inch off. Either that's a mistake, or it's the most honest thing I've ever seen. I'm on frame fifteen."], when: { lastMatch: { won: true, maxDaysAgo: 5 } } },
    { text: "When's your first match? I've got a fresh page for you. Don't make it boring. I hate a boring page.", when: { notFlag: 'debuted' } },

    // ---------------------------------------------------------------- alignment
    { text: "A 'hero,' huh? Heroes in my sport shake hands and go home. Yours make speeches. I heard one through the gym wall once. Off the record: decent.", when: { alignment: ['face'] } },
    { text: ["So you're a 'villain' now. Fine. If it's fake, you're a nice person in a bad costume.", "If it's real... I don't want to think about it."], when: { alignment: ['heel'] } },
    { text: ["Watched your heel turn in slow motion. Eighteen times.", "The look on your face. Either you're the best actor alive or you meant it. Both are bad."], when: { alignment: ['heel'], hearts: [3, 14] } },
    { text: ["You turned on that kid. In front of Lacey. I've got it on tape.", "Forty viewings. Still makes me mad. REAL mad. Which is a problem for my whole theory."], when: { alignment: ['heel'], hearts: [0, 5], flag: 'debuted' }, mood: 'angry' },
    { text: "Gus calls you a tweener. In amateur we call that 'not committing to the shot.' Commit to the shot. Either shot.", when: { alignment: ['tweener'] } },

    // ---------------------------------------------------------------- rank
    { text: "Openers are where they put the ones who can't fake it well yet. So I'll be watching you very closely. No offense. Some offense.", when: { rank: ['rookie', 'opener'], flag: 'debuted' } },
    { text: "Main event now. Bigger stage. Harder to fake. More cameras. I've got my best camera pointed right at you.", when: { rank: ['main', 'assistant', 'pencil', 'owner'] } },

    // ---------------------------------------------------------------- seasons and weather
    { text: "State qualifiers and Thaw Brawl the same weekend. I'll be at one in a tracksuit and the other in a different tracksuit. Nobody will know.", when: { season: [0] } },
    { text: "Thaw Brawl plan: stopwatch in each hand, protractor in my teeth. I'm measuring the angle of every clothesline. Science.", when: { season: [0], showDay: true } },
    { text: "Spring rain. Indoor practice. The gym smells like mats and wet sneakers and ambition. Don't you dare put that in a candle.", when: { season: [0], weather: ['rain'] } },
    { text: "Summer camp. Forty kids, one mat, a cooler. Best two weeks of my year. I barely watched any pro tape at all. Barely.", when: { season: [1] } },
    { text: "Harvest Havoc I'm putting a camera in a hay bale. Don't tell anyone. Especially hay.", when: { season: [2] } },
    { text: "Winter's our season. Gym's warm, mats are fresh, nobody's distracted by sunshine. I love it. I'll deny saying 'love.'", when: { season: [3] } },
    { text: "Rain. The kids are running stairs. They hate me. Good. Hate's a great motivator. So's pizza. I'm bringing pizza.", when: { weather: ['rain'], season: [1, 2, 3] } },

    // ---------------------------------------------------------------- hearts
    { text: "You know what bothers me? The crowd. Two thousand people believing at once. Nobody's that good a liar. So who's lying? Me?", when: { hearts: [3, 5] } },
    { text: ["If it's fake, then what makes me stand up every single time?", "Answer me that. No. Don't. I don't want to know."], when: { hearts: [6, 14] } },
    { text: ["1983. I was a kid in the bleachers when the Duchess broke that belt.", "I thought, that's fake. No real friend could ever do that. Started right there."], when: { hearts: [6, 14], notFlag: 'truth_revealed' } },
    { text: "Twenty-four years, no state title. I keep the runner-up plaque from '09 in the truck. Under the seat. Face down. I check on it.", when: { hearts: [9, 14] } },
    { text: "Regionals still stings. But Lacey came by the house with a plate of cookies Bo made. Bo made cookies. I'm investigating that too.", when: { flag: 'patty_regionals' } },

    // ---------------------------------------------------------------- the main story
    { text: ["The Duchess was crying. In '83. Agnes has a picture.", "If it was fake, why cry? Nobody'd see it. ...Agnes saw it. Huh."], when: { flag: 'truth_revealed', notFlag: 'reunion_done' } },
    { text: "Homecoming. Velvet Hammers. I bought a ticket for research. I was standing on my chair at the finish. It was research.", when: { flag: 'reunion_done' } },

    // ---------------------------------------------------------------- life events
    { text: "Married in a ring. I checked the license at Town Hall. It's real. First real thing I've ever found in that building.", when: { married: true } },
  ],
  gifts: {
    loves: ['tape', 'protein-shake'],
    likes: ['polaroid', 'old-program', 'chalk', 'coffee', 'lemonade', 'hot-tag-special', 'fish'],
    dislikes: ['sequins', 'foam-finger', 'merch-sign', 'rhinestone'],
  },
  giftReplies: {
    love: [
      "Now THIS is useful. You're a practical person. I didn't expect that from your profession.",
      "Look at that. I'm putting this up in the wrestling room and making the kids look at it every single day.",
      "Evidence. Or a gift. Either way I'm keeping it. Thank you. Genuinely.",
    ],
    like: [
      "Practical. Good. Thanks.",
      "Huh. Thank you. Takedown says thanks. He doesn't. But he would.",
    ],
    neutral: [
      "Okay. Noted. Thank you.",
      "I'll find a use. I always find a use.",
    ],
    dislike: [
      "Glitter. You brought GLITTER near my clipboard. Get it away.",
      "Theatrics. I don't do theatrics. Take it back, please.",
      "Is this a test? Are you testing me? Who put you up to this? Was it Pruitt?",
    ],
    birthday: [
      "Pruitt sends a birthday card every year with a math problem in it. Takes me a week. You brought a {item}. Takes me a second. I like yours better. Pruitt doesn't need that information.",
      "Fifty-three. Blew the candles out in one breath. Real lungs. A {item}, too. Thanks, kid.",
    ],
    byItem: {
      tape: "Athletic tape! The real stuff! Not the shiny kind your people use for wrists that aren't hurt. ...Probably aren't hurt. I'm keeping it.",
      'protein-shake': "Chalky. Vanilla, says the label. The label is lying. I respect a lie that commits. I'll drink it at the five a.m. run and think of you, briefly, with suspicion.",
      polaroid: ["A crowd photo. Front row. (She holds it an inch from her nose.) There's a purse in the air.", "Motion blur on the purse. Real motion blur. ...That doesn't prove anything. I'm keeping it in the file."],
      'old-program': "A 1979 program. I'm going to compare the listed weights to the wrestlers in the photos. Somebody's lying about two hundred pounds.",
      chalk: "Chalk. For grip. For the bar. For the kids' hands. Not for drama. We don't do drama here. We do sets.",
      coffee: "Coffee. Black. The coaches' lounge coffee tastes like a gym bag. Thank you.",
      lemonade: "Fair lemonade. Sugar. I'll allow it. Once. It's a celebration of something. I'll figure out what.",
      'hot-tag-special': "The Special. Two eggs, hash browns, the pancake. That's a cutting-weight disaster. I'm eating it in the truck.",
      fish: "Bluegill. Takedown gets the tail. He's earned it. He took a fall off the porch this week. Real fall. I checked.",
    },
    later: [
      "The {lastGift} is pinned to the evidence board. I don't know what it's evidence of. It felt wrong to leave it off.",
      "Takedown sleeps next to the {lastGift}. He's guarding it. From what, I don't know. From the truth, probably.",
    ],
  },
  again: [
    "We talked. I've got stairs to run. Not me. The kids. Mostly the kids.",
    "(Coach Patty blows one short note on the whistle. It means 'later.' It might also mean 'hustle.')",
    "Back again? Suspicious. I'm writing that down.",
  ],
  idle: [
    "(Coach Patty is reviewing a clipboard and frowning at it like it lied.)",
    "Can't stop. Practice. No music, no lights, just the truth.",
  ],
  birthday: { season: 2, day: 3 },
  events: [
    {
      id: 'patty-2', hearts: 2, map: 'school', title: 'Fresh Eyes',
      script: async (api) => {
        await api.narrate('Coach Patty waves you over to the edge of the practice mats. She is holding a clipboard labeled EVIDENCE like it\'s a holy text.');
        await api.say('patty', "Two hundred and six pages. Slow-motion notes. Timestamps. A sketch of a ladder I'm almost sure was hollow.");
        await api.say('patty', "But I'm too close to it. Twenty-four years. I need somebody new. Somebody on the inside.");
        await api.sayMood('patty', 'smug', "You're new. Fresh eyes. So. When you're back there... tell me what you see.");
        const c = await api.choose('She clicks her pen and waits.', [
          { label: '"I see a lot of very hard work."', value: 'work' },
          { label: '"Keep digging, Coach."', value: 'dig' },
          { label: '"I see... what I see."', value: 'see' },
        ]);
        if (c === 'work') {
          await api.say('patty', "'Hard work.' Hm. That's what my kids say when they haven't done the reading.", 'Fine. Noted. Page two-oh-seven.');
          api.hearts('patty', 15);
        } else if (c === 'dig') {
          await api.sayMood('patty', 'happy', "THANK you. Finally. Somebody in this town with a spine.");
          await api.say('patty', "Everybody else tells me to 'just enjoy it.' I'm not here to enjoy it. I'm here to KNOW.");
          api.hearts('patty', 30);
        } else {
          await api.narrate('Coach Patty squints at you for a very long time.');
          await api.sayMood('patty', 'angry', "That's what Mo says. Word for word. Are you two in on something?");
          await api.say('patty', '...I like you. I don\'t trust you. Those can both be true.');
          api.hearts('patty', 15);
        }
      },
    },
    {
      id: 'patty-4', hearts: 4, title: 'The Smoking Gun',
      script: async (api) => {
        await api.narrate("Coach Patty's garage. Two TVs on milk crates. A VCR with a jog wheel. A corkboard of Polaroids. Takedown asleep on a mat.");
        await api.say('patty', "Sit. I want a witness. I found it. Twenty-four years and I FOUND it.");
        await api.narrate('She jogs the tape frame by frame. A brawler throws a right hand. In slow motion, it clearly misses. Six inches of daylight.');
        await api.sayMood('patty', 'smug', "There. Daylight. You can't hit a man through daylight.");
        await api.narrate('She clicks forward one frame. The man who got punched has a split lip. It happens sometimes. Wrestling is like that.');
        await api.narrate("Patty stares at the screen. Clicks back. Clicks forward. Back. Forward.");
        await api.sayMood('patty', 'surprised', "So I don't know. I don't KNOW.");
        const c = await api.choose(null, [
          { label: 'Rewind it one more time', value: 'rewind' },
          { label: 'Tell her some things you have to see live', value: 'live' },
        ]);
        if (c === 'rewind') {
          await api.narrate('She rewinds. Daylight. Split lip. She rewinds. Daylight. Split lip. You watch it nine times together, in silence.');
          await api.say('patty', "...Thanks for not saying anything. Everybody always says something.");
          api.hearts('patty', 30);
        } else {
          await api.say('patty', "Live. Hm. I go to every show. You think I don't watch it live?");
          await api.say('patty', "...I stand up every time. Live. That's the problem with live.");
          api.hearts('patty', 15);
        }
      },
    },
    {
      id: 'patty-6', hearts: 6, map: 'school', title: 'Thursday on the Mats', when: { weekday: [3] },
      script: async (api) => {
        await api.narrate("Thursday, three thirty. The gym is empty except for the mats, Coach Patty in her tracksuit, and Odessa Pruitt in a cardigan and socks.");
        await api.say('patty', "Today's the day, Pruitt. I've been watching your hips. I've been watching them ALL WEEK.");
        await api.say('professor', "So I noticed. Shall we?");
        await api.narrate('It takes forty-one seconds. Patty shoots. Odessa is somehow not there, and then somehow behind her, and then Patty is on her back.');
        await api.say('professor', "Wrong. Beautifully committed, though. See you Thursday, Coach.");
        await api.narrate('Odessa picks up her loafers and walks out. She does not look back. She also, you notice, smiles at the door.');
        await api.narrate('Patty stays flat on the mat, breathing hard, staring at the ceiling.');
        await api.say('patty', "She's the best technical wrestler I've ever seen. And she wastes it on that circus.", "It makes me so mad I can't sleep.");
        await api.narrate("She's smiling. She doesn't seem to know she's smiling.");
        const c = await api.choose(null, [
          { label: 'Offer her a hand up', value: 'hand' },
          { label: "Point out that she's smiling", value: 'smile' },
        ]);
        if (c === 'hand') {
          await api.narrate('She takes it. She gets up. She keeps hold of your hand a second longer than she needs to, getting her balance.');
          await api.say('patty', "Thanks. ...Forty-one seconds. That's my best this year. She'll never hear that from me.");
          api.hearts('patty', 30);
        } else {
          await api.sayMood('patty', 'angry', "I'm not smiling. This is my mad face. This is what my mad face looks like.");
          await api.say('patty', "...I'm going to go run stairs.");
          api.hearts('patty', 15);
        }
      },
    },
    {
      id: 'patty-8', hearts: 8, map: 'school', title: 'You Learn It',
      script: async (api) => {
        await api.narrate('Regionals. The gym is emptying out. Patty\'s team is in a knot by the bench, some of them crying. Lacey lost by one point.');
        await api.narrate('Patty crouches in front of them. Her voice is the steadiest thing in the building.');
        await api.say('patty', "Listen to me. Eyes up. You don't lose a match. You learn it. We go home, we watch the tape, we learn it. Okay?");
        await api.narrate('They nod. They file out. Patty watches the last of them go. Then she climbs to the top row of the bleachers, alone, and sits.');
        await api.narrate('You climb up after her.');
        await api.sayMood('patty', 'sad', "Twenty-four years. I tell them it's about learning. And it is. And then I come up here and I'm just... sad.");
        await api.say('patty', "Coaches are allowed one bleacher a season. This is mine.");
        const c = await api.choose(null, [
          { label: 'Sit with her', value: 'sit' },
          { label: 'Tell her the kids saw how she handled it', value: 'saw' },
        ]);
        if (c === 'sit') {
          await api.narrate('You sit. The custodian turns off the lights one bank at a time. Neither of you says anything until the last one.');
          await api.say('patty', "...You're all right. For a fake wrestler. Allegedly fake.");
          api.hearts('patty', 30);
        } else {
          await api.say('patty', "...Yeah. Yeah, they did. That's the job, isn't it. The part they see.");
          await api.say('patty', "Lacey'll be back next year. One point. She'll never lose by one point again. I know her.");
          api.hearts('patty', 15);
        }
        api.flag('patty_regionals');
      },
    },
    {
      id: 'patty-10', hearts: 10, map: 'sportatorium', title: 'Something Real',
      script: async (api) => {
        await api.narrate('An off day. The Sportatorium is empty, house lights up, the ring sitting alone in the middle of the floor like a stage after a play.');
        await api.narrate('Coach Patty is in a folding chair in the front row, clipboard closed on her knees. She doesn\'t seem to be taking notes.');
        await api.say('patty', "Twenty-four years.", "I'm ninety percent sure it's fake. Eighty. ...Seventy-five.");
        await api.narrate('She looks at the ring for a long time.');
        await api.sayMood('patty', 'neutral', "Something real happens in there. I just can't find where.");
        const c = await api.choose(null, [
          { label: '"All of it\'s real, Coach."', value: 'real' },
          { label: '"You found it. You stand up every time."', value: 'stand' },
        ]);
        if (c === 'real') {
          await api.narrate('She squints at you.');
          await api.sayMood('patty', 'smug', "That's exactly what Hazel says. Word for word. Very suspicious.", "...I'm writing it down anyway.");
          api.hearts('patty', 15);
        } else {
          await api.narrate("She opens her mouth to argue. Then she doesn't. She just looks at the ring.");
          await api.say('patty', "...Huh.");
          await api.narrate('She opens the EVIDENCE clipboard to a fresh page, writes one word, and closes it again before you can read it.');
          api.hearts('patty', 30);
        }
        await api.say('patty', "Don't think this means I'm done. I'm never done. Same time Saturday.");
      },
    },
  ],
} satisfies DialogueSet;
