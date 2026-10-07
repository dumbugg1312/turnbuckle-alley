import type { DialogueSet } from '../types';

/**
 * "Sweet Lou" Bastian. 1970s legend, the Biscuit by Chokeslam Creek, the
 * Dungeon key on a fishing lanyard, and a forty-year secret he mails every
 * Monday. Hands the player a spare Dungeon key at 4 hearts (flag 'lou_key').
 * Holds 1983 pieces #1-#3 (CAST Part 9): the hallway is told at 8 hearts once
 * Grandma is in town; the tapes are only ever hinted at until 'truth_revealed'.
 */
export default {
  npc: 'lou',
  intro: [
    "Well, look at you. Birdie said a new one came in on the bus. Didn't say you'd have that chin.",
    "...Sorry. You put me in mind of somebody. Old men see ghosts in good posture. Louis Bastian. Sweet Lou, to them that remember.",
    "I keep the key to what's under the locker room. You'll want it someday. Someday ain't today. Today, you sit.",
    "Fish don't bite for impatient people, young'un. Neither does a crowd. Come see me at the creek. Neither of us is in a hurry.",
  ],
  introPublic: [
    "Mornin'. You're standing in my best shadow, but I'll allow it. You've got a kind face. And a familiar chin.",
    "Sweet Lou Bastian. Used to sing to the crowd before every match. Now I sing to bluegill. They don't throw anything.",
    "Pull up a rock. The creek's got all day, and so do I.",
  ],
  lines: [
    // ---- Strangers
    { text: "Fish don't bite for impatient people. Neither does a crowd. Sit. Neither of us is in a hurry.", when: { hearts: [0, 2], map: ['town'] } },
    { text: "I walk the slowest in town and somehow get everywhere first. Fifty years. Nobody's figured it out. Least of all me.", when: { hearts: [0, 2] } },
    { text: ["There's a catfish in this creek owes me a rematch.", "Ask me about him sometime. Not today. Today I'm resting up for him."], when: { hearts: [0, 2], map: ['town'] } },
    { text: "That humming? That's me. Doctor says it's good for the lungs. I say it's good for the fish. They like a tune.", when: { hearts: [0, 5] } },
    { text: "My trailer's called the Biscuit. On account of the shape, the color, and how I love it more than is reasonable.", when: { hearts: [0, 5] } },
    { text: "Lookin' for Birdie? Sportatorium, back office. Follow the sound of somebody being told no.", when: { notFlag: 'met_birdie' }, weight: 3 },
    { text: "Dawn's the honest hour. Fish are hungry, the town's asleep, and nobody's asked me for an autograph yet.", when: { time: [300, 540], map: ['town'] } },
    { text: "(He yawns.) You caught me between a nap and a nap. What can I do you for?", when: { time: [780, 900] } },
    { text: "Late for you to be out. Frogs are loud tonight. They think they're the main event. Go on home, young'un.", when: { time: [1260, 1439] } },

    // ---- Weather and seasons
    { text: "Rain's when the creek tells its stories. Come back with a better hat and I'll tell you one of mine.", when: { weather: ['rain'] } },
    { text: "Lightnin' on the water. Up the bank, young'un. Legends don't get struck, but you ain't a legend yet.", when: { weather: ['storm'] } },
    { text: "Wind's tryin' to steal my hat again. Lot of good lures on this hat. Wind's got taste.", when: { weather: ['wind'] } },
    { text: "Snow on the creek. Fish slow down, I slow down, the whole world slows down to my speed. Finally.", when: { weather: ['snow'] } },
    { text: "Spring's when the creek wakes up. Thaw Brawl and the bluegill both. Everything comes up for air.", when: { season: [0] }, weight: 2 },
    { text: "First warm mornin' of spring, Birdie and me caught eleven fish and threw back twelve. Don't ask me the math. Ask Odessa.", when: { season: [0], hearts: [3, 10] } },
    { text: "Summer, the creek smells like a warm penny. Best smell there is. Don't tell June. She thinks it's her cobbler.", when: { season: [1] } },
    { text: "Leaves come down the creek like little boats. I name 'em. That red one's Gus. Loud color.", when: { season: [2] } },
    { text: "Cold keeps the fish honest. They don't bite unless they mean it. Neither do I.", when: { season: [3] } },

    // ---- The week
    { text: "Monday mornin's Birdie fishes right here with me. She don't talk, I don't talk. Best conversation in town.", when: { weekday: [0], time: [300, 600] } },
    { text: "Post office at ten on Mondays. Rain or shine. Don't look at me like that. An old man's allowed his mail.", when: { weekday: [0], time: [480, 660] } },
    { text: "Sundays Earl sits right there and sketches me. I try to hold still. Mostly I fall asleep. He says that's the good drawing.", when: { weekday: [6] } },
    { text: "Legends table at the VFW tonight. Two chairs, one me, and Agnes Pickett watching from the front row like a hawk in a cardigan.", when: { weekday: [2], showDay: true } },
    { text: "Saturday. I'll be at the legends table by the merch. Come say hey. Bring a pen. I always lose mine.", when: { weekday: [5], place: ['public'] } },
    { text: "Got my good shirt on. Lavender. Silk. I been told it makes me look like a sunset. I been told it by me.", when: { showDay: true, place: ['public', 'show'], hearts: [3, 10] } },

    // ---- Around town (friends)
    { text: "In '71 I wrestled a fella so big he had his own weather. Rained on his side of the ring only. True story. Mostly true.", when: { hearts: [3, 10] } },
    { text: "Odessa still calls me Coach Lou. Forty years on. Best student I ever had. Worst fisherman. Too much math in her cast.", when: { hearts: [3, 10] } },
    { text: "Taught Earl to fish. Big man, gentle hands. He apologizes to every worm. Every one. By name.", when: { hearts: [3, 10] } },
    { text: "The Mothman? Bowed to me once on the creek road, five in the mornin'. I bowed back. Seemed only polite.", when: { hearts: [3, 10] } },
    { text: "Gus plays my old record on the radio every birthday. I pretend to be embarrassed. I ain't. I turn it up.", when: { hearts: [3, 10] } },
    { text: "Hum before you talk. Gives the words time to put their shoes on.", when: { hearts: [3, 8] } },
    { text: "That elbow you took Saturday. I felt it in my teeth. You got back up, though. That's the part folks remember.", when: { hearts: [3, 8], place: ['public'], flag: 'debuted' } },
    { text: "Heard you been cuttin' corners in that ring. I'll say a prayer for your soul and your opponent's kidneys.", when: { place: ['public'], alignment: ['heel'], flag: 'debuted' } },
    { text: "Kids round here are wearing your colors. Don't you ever let 'em down, hear? That's the whole job.", when: { place: ['public'], alignment: ['face'], flag: 'debuted' } },
    { text: "Openers set the table. Don't try to eat the whole meal in the first match. Leave 'em hungry for the next one.", when: { rank: ['rookie', 'opener'] } },

    // ---- Insider: shop talk
    { text: "In the booth I can say it plain: you carry your shoulders like they're borrowed. Drop 'em. Let the crowd come to you.", when: { hearts: [3, 5], place: ['insider'] } },
    { text: "Learn to stall, young'un. Not lazy. Patient. Let the bait sit. The bite always comes to them that wait.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "The Serenade's just a sleeper with a lullaby. Hum it right and two thousand people lean in. A crowd'll hold its breath for a song.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Back in my day the heel and me drove town to town in the same car. One rule: whoever's driving picks the radio.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Big crowd tonight. Here's the trick: when they're loud, go slow. When they're quiet, go slower. Make 'em lean in.", when: { showDay: true, place: ['insider'] } },
    { text: "You keep askin' about this key with your eyes. Patience. A key ought to know whose pocket it's goin' to.", when: { place: ['insider'], notFlag: 'lou_key' } },
    { text: "How's the Dungeon treatin' you? The '70s floor still smell like Brut and liniment? Good. Some things oughtn't change.", when: { flag: 'lou_key', place: ['insider'] } },
    { text: "Every floor down there's a gym from a different decade. Nobody built it that deep. It got deeper the more folks trained. Don't think on it.", when: { flag: 'lou_key', place: ['insider'] } },
    { text: "If young me on the '70s floor gets mouthy, tell him old me said hush. He won't listen. He never did.", when: { flag: 'lou_key', place: ['insider'] } },
    { text: "They say there's a Golden Belt at the very bottom. I never got there. Got to the '50s floor once and took a nap.", when: { flag: 'lou_key', place: ['insider'] } },
    { text: "Main event now. Look at you. Remember: the bigger the room, the slower you go. Big rooms need time to hear you.", when: { rank: ['main'], place: ['insider'] } },
    { text: "Birdie gave you the pencil. Hm. She chewed that thing for forty years. Wash it first.", when: { rank: ['assistant', 'pencil', 'owner'], place: ['insider'] } },

    // ---- Close
    { text: "Agnes Pickett waved at me from the bakery. With her whole hand. ...I'm seventy-seven. My heart oughta know better.", when: { hearts: [6, 8], place: ['public'] } },
    { text: "You're coming round more than the fish do. I don't mind. Just saying the fish are jealous.", when: { hearts: [6, 10] } },
    { text: "When I was young I thought a legend was somebody everybody remembered. Turns out it's somebody who remembers everybody.", when: { hearts: [6, 10], place: ['public'] } },
    { text: "Some promises get heavier every year, young'un. You carry 'em anyway. That's what makes 'em promises.", when: { hearts: [6, 10], place: ['insider'] } },
    { text: ["You stand like somebody I knew. Weight on the back foot, chin up like a dare.", "...Never mind me. Old men see ghosts."], when: { hearts: [6, 8], place: ['insider'], notFlag: 'grandma_in_town' } },
    { text: "After the booth tonight I got work at the Biscuit. Long night. Don't come knockin'. I won't hear you over the machines.", when: { weekday: [5], hearts: [6, 10], place: ['insider'] } },
    { text: "Birdie's never watched the tape of '83. Never will. I watched it once. Once was plenty for a lifetime.", when: { hearts: [6, 10], place: ['insider'], notFlag: 'truth_revealed' } },
    { text: "June's back booth has heard more truth than any church in the county. Don't tell the pastor. He thinks he's winning.", when: { hearts: [6, 10], place: ['insider'] } },
    { text: "Danny Halloran tends that little tree like it might forgive him someday. Maybe it will. Trees are patient.", when: { hearts: [6, 10], place: ['insider'] } },
    { text: ["Your grandmama always did walk like she owned the building.", "Still does, I hear. You tell her Lou says hey. She'll know which Lou."], when: { hearts: [6, 10], place: ['insider'], flag: 'grandma_in_town' } },

    // ---- Family
    { text: "Folks call me a legend. A legend's just an old man folks ain't done talking about yet. Keep talking about me, would you?", when: { hearts: [9, 10], place: ['public'] } },
    { text: "Whatever's coming down the creek, young'un, I'm glad it's you standing on the bank for it.", when: { hearts: [9, 10], place: ['insider'] } },
    { text: "Some mail don't need a stamp anymore. It can walk three blocks. ...Don't mind me. I'm just humming.", when: { hearts: [9, 10], place: ['insider'], flag: 'grandma_in_town' } },

    // ---- Main story
    { text: ["Forty years I carried that by myself. Every Monday.", "You took half the weight off and never even asked me to. Thank you, young'un."], when: { flag: 'truth_revealed', place: ['insider'] }, mood: 'sad' },
    { text: "Saw 'em at the Hot Tag counter. Two stools. Side by side. Forty years I waited to see two stools, young'un. Lord.", when: { flag: 'reunion_done' }, mood: 'happy', weight: 3 },
  ],
  gifts: {
    loves: ['vinyl', 'pie', 'polaroid'],
    likes: ['coffee', 'bait', 'fish', 'lemonade', 'river-stone', 'old-program', 'honey'],
    dislikes: ['gas-hotdog', 'protein-shake', 'scrap'],
  },
  giftReplies: {
    love: [
      "Now that's a gift. You don't know what this is worth to me. ...And you're not gonna ask, are you? Good. That's good.",
      "Lord, you're trying to make an old man propose to somebody. Thank you, young'un. From the bottom of my boots.",
      "Look at that. I'm gonna enjoy this so slow the creek'll get bored waiting on me.",
    ],
    like: [
      "Well, ain't you sweet. Thank you kindly.",
      "That'll do me fine. That'll do me just fine.",
      "Thank you, young'un. The fish'll be jealous.",
    ],
    neutral: [
      "Oh! Well. Thank you. I'll find it a place in the Biscuit. Everything finds a place eventually.",
      "Hm. Thank you kindly. I'm sure it's somebody's favorite thing.",
    ],
    dislike: [
      "I'm gonna be polite about this, 'cause my mama raised me to. Thank you. I think.",
      "I'll set this aside. Way aside. Way, way over there by the creek.",
      "Young'un, I been called old-timer, and it hurt less. But thank you for thinking of me.",
    ],
    birthday: [
      "You remembered! Seventy-some years and folks still remember. I'm gonna hum all day. You can't stop me.",
      "A birthday present for Sweet Lou. Lord. Come by the creek tonight, I'll sing you a verse. Just one. My voice is a rumor these days.",
    ],
  },
  birthday: { season: 3, day: 19 },
  events: [
    {
      id: 'lou-2', hearts: 2, map: 'town', title: 'Two Falls Out of Three',
      script: async (api) => {
        await api.narrate('Dawn on Chokeslam Creek. Mist on the water. Lou hands you a rod with a cork handle worn smooth as a river stone.');
        await api.say('lou', "Easy now. Don't throw it. Let it go. A cast is just a promise you make to the water.");
        await api.narrate('Your first cast lands in a bush. Your second lands in the creek, which Lou applauds like a title change.');
        await api.say('lou', 'See that deep spot under the willow? Lives a catfish there. Big as a church pew. I wrestled him once. Summer of \'74.');
        await api.say('lou', 'Two falls out of three. I took the first with a Sugar Drop, right off the bank. Prettiest suplex this creek ever saw.');
        await api.sayMood('lou', 'smug', 'Catfish took the second fall. Dirty. Used the current.');
        const c = await api.choose('Lou waits, perfectly serious.', [
          { label: 'Who took the third fall?', value: 'third' },
          { label: 'How does a catfish pin anybody?', value: 'how' },
        ]);
        if (c === 'third') {
          api.hearts('lou', 30);
          await api.say('lou', "Ain't happened yet. He keeps ducking me. Forty-nine years.");
          await api.sayMood('lou', 'happy', "But I'm patient, young'un. Most patient man in this county. You keep fishing with me, you'll see that rematch.");
        } else {
          api.hearts('lou', 15);
          await api.say('lou', 'With great difficulty and terrible sportsmanship.');
          await api.narrate("He laughs until he coughs, then wipes his eyes with the back of his hand.");
          await api.say('lou', "You're all right. You ask the right wrong questions.");
        }
        await api.narrate('A bluegill takes your line. Lou hums the whole time you reel it in, like a little entrance theme just for the fish.');
        api.give('fish');
      },
    },
    {
      id: 'lou-4', hearts: 4, map: 'town', title: 'The Key',
      script: async (api) => {
        await api.narrate("Lou isn't fishing today. He's waiting on the bank with an old lantern, unlit, in the middle of a sunny afternoon.");
        await api.say('lou', "Walk with me, young'un. Slow. You'll get there first anyway.");
        await api.fade();
        await api.narrate("The empty locker room. Behind the last row of lockers, an iron door you'd swear wasn't there yesterday. It's breathing, a little.");
        await api.say('lou', "This here's the Dungeon. Every floor's a gym from a different time. Nobody built it this deep. It just kept getting deeper.");
        await api.narrate('He lights the lantern. The first flight of stairs smells like rope burn, liniment, and somebody\'s cologne from 1976.');
        await api.say('lou', "That's Brut. The '70s floor always smells like Brut. Some things you don't fix.");
        await api.narrate('At the bottom: a ring with red-taped ropes, and a young man in a lavender robe, shimmering at the edges, stretching. An echo.');
        await api.sayMood('lou', 'happy', 'Look at that hair. Look at it. I was *beautiful*.');
        await api.narrate('The echo of young Sweet Lou bows to you, then raises his fists, grinning. Old Lou leans on his catfish cane, delighted.');
        const c = await api.choose('The echo wants a fall.', [
          { label: 'Give him everything you have', value: 'hard' },
          { label: 'Let him show off first', value: 'patient' },
        ]);
        if (c === 'hard') {
          api.hearts('lou', 15);
          await api.narrate('You charge. The echo sidesteps like smoke and sings you a lullaby in a sleeper hold. You wake up on the mat. Lou is crying laughing.');
          await api.say('lou', "Ha! He did that to everybody. Next time, don't rush him. Nobody ever beat me by hurrying.");
        } else {
          api.hearts('lou', 30);
          await api.narrate('You circle. You wait. The echo struts, croons, and finally overreaches, and you roll him up for two before he fades like breath on glass.');
          await api.say('lou', "There it is. You waited for it. That's the whole secret, young'un. Let 'em bite.");
        }
        await api.narrate('Back at the top of the stairs, Lou touches the iron key around his neck. Then he reaches into his shirt pocket for a second one.');
        await api.say('lou', 'Had Hank cut me a spare. A key ought to have a spare, and a spare ought to belong to somebody worth trusting.');
        if (!api.hasFlag('lou_key')) {
          api.give('dungeon-key');
          api.flag('lou_key');
        }
        await api.narrate("It's heavy, iron, and a little warm. When he presses it into your palm, he winks.");
        await api.sayMood('lou', 'happy', "Go as deep as you like. Come up when you're hungry. And if young me gets mouthy, tell him old me said hush.");
      },
    },
    {
      id: 'lou-6', hearts: 6, map: 'diner', title: 'The Second Verse',
      script: async (api) => {
        await api.narrate("Lou nudges you toward the back booth with the tip of his cane, which means it isn't a counter kind of conversation.");
        await api.say('lou', 'Agnes Pickett came by the creek this morning. Brought me a thermos of coffee. Said she was in the neighborhood.');
        await api.say('lou', "She lives clear on the other side of town, young'un. There ain't a neighborhood.");
        await api.narrate('He turns his cup in a slow circle on the table.');
        await api.say('lou', "I been sweet on that woman since 1977. She sat in A1 and cried when I lost the title, and I've been hers ever since.");
        await api.say('lou', "But she thinks I'm a legend. Hero of the territory. And I'm just a man who naps in a trailer and loses his reading glasses.");
        await api.sayMood('lou', 'sad', "What if she gets close and finds out there ain't any more to me than that?");
        const c = await api.choose(null, [
          { label: 'She brought you coffee. She already knows you.', value: 'knows' },
          { label: 'Then let her find out slowly.', value: 'slow' },
        ]);
        if (c === 'knows') {
          api.hearts('lou', 30);
          await api.narrate('Lou opens his mouth. Closes it. Hums one bar of something old.');
          await api.say('lou', "...Lord. You may be right. That's worse. That means I been scared of nothing for forty-six years.");
        } else {
          api.hearts('lou', 15);
          await api.say('lou', "Slow. I can do slow. Slow's the only speed I got left.");
        }
        await api.say('lou', "I wrote her a song once. A second verse to my old entrance tune. Never sang it for anybody. Not once.");
        await api.sayMood('lou', 'happy', "Maybe someday. Maybe in front of the whole town, if I get brave. Don't tell her. Tell her I said hey.");
      },
    },
    {
      id: 'lou-8', hearts: 8, map: 'diner', title: 'The Hallway', when: { flag: 'grandma_in_town' },
      script: async (api) => {
        await api.narrate("Late. The back booth is empty except for you, Lou, and two cups of coffee that went cold an hour ago.");
        await api.say('lou', "I'm gonna tell you a thing, young'un. Part of a thing. You'll know why I'm stopping when I stop.");
        await api.say('lou', "Fall of '83. I'm coming down the hall past Birdie's office. Door's cracked. She's on the phone with the big national outfit.");
        await api.say('lou', "And she says, plain as day: 'Not without Dot. Then the answer's no.' And she hangs up.");
        await api.narrate('Lou\'s hands are flat on the table. He looks at them like they belong to somebody else.');
        await api.say('lou', 'Dottie was standing in that hallway. Right outside the door. She heard every word. I saw her face change.');
        await api.sayMood('lou', 'sad', "Seen a lot of faces change in fifty years. Never one like that. Like a house deciding to fall so the folks inside could get out.");
        await api.narrate('He stops. The jukebox clicks over to nothing.');
        await api.say('lou', "That's all I'll say, young'un. I made a promise, and I'm old enough to keep it.");
        const c = await api.choose(null, [
          { label: 'What happened next?', value: 'press' },
          { label: 'Thank you for telling me this much.', value: 'thank' },
        ]);
        if (c === 'press') {
          await api.say('lou', "Next, the sun came up. That's what always happens next. ...Don't ask me twice. I might answer, and I'd never forgive myself.");
        } else {
          api.hearts('lou', 30);
          await api.narrate("Something in Lou's shoulders lets go.");
          await api.sayMood('lou', 'love', "You're her grandbaby, all right. Same way of sitting with a hard thing. Go on home, now. I'll get the check.");
        }
      },
    },
    {
      id: 'lou-10', hearts: 10, map: 'airstream', title: 'Blue Windows',
      script: async (api) => {
        await api.narrate('Past midnight. Every window of the Biscuit glows blue. Inside, two VCRs hum side by side on a shelf above the sink.');
        await api.say('lou', 'Come in, come in. Mind the cables. And the cat. There ain\'t a cat. Mind it anyway. It\'s a habit.');
        await api.narrate("Tonight's show plays on a little television. On the shelf, blank tapes wait in their sleeves. Six. Seven. Dozens.");
        await api.say('lou', "Every Saturday since the fall of '83, I make a copy. Never missed one. Ice storms, my bad hip, the year the creek came up.");
        if (api.hasFlag('truth_revealed')) {
          await api.say('lou', "You know who for, now. Lord, it's a relief to say it in my own kitchen. Forty years of Mondays at the post office.");
          await api.sayMood('lou', 'sad', 'She watched every one. Every Saturday Birdie ever worked. Watched her get old one tape at a time.');
        } else {
          await api.say('lou', "Don't ask me who for. Ask me what for.");
          const q = await api.choose(null, [
            { label: 'What for?', value: 'what' },
            { label: "I won't ask.", value: 'quiet' },
          ]);
          if (q === 'what') {
            api.hearts('lou', 15);
            await api.say('lou', 'Love, young\'un. Same as everything. Same as the fish and the songs and this whole dang business.');
          } else {
            api.hearts('lou', 30);
            await api.say('lou', "Good. That's good. You'll know when it's time to know. Somebody'll tell you, and it won't be me.");
          }
        }
        await api.narrate('The left VCR clicks and ejects. Then the right. Then a third machine you hadn\'t noticed, tucked under the others.');
        await api.say('lou', "This one's yours. Tonight's show. Your match is on it.");
        await api.sayMood('lou', 'happy', "Forty years I been making copies of this town. Never once made one for somebody standing right here in my kitchen.");
        await api.narrate('The label says, in his careful slanted hand: SATURDAY. And underneath, smaller: *Somebody worth trusting.*');
        const c = await api.choose(null, [
          { label: 'Watch it with him', value: 'watch' },
          { label: 'Ask him to teach you the Serenade', value: 'song' },
        ]);
        if (c === 'watch') {
          api.hearts('lou', 30);
          await api.narrate("You watch your own match on Lou's little TV. He hums your entrance music under his breath. He knows every note.");
        } else {
          api.hearts('lou', 15);
          api.learnCard('sleeper');
          await api.say('lou', "Lullaby first, then the hold. Folks think it's the other way round. Folks are wrong. Now hum it back to me.");
        }
      },
    },
  ],
} satisfies DialogueSet;
