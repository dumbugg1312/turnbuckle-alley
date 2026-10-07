import type { DialogueSet } from '../types';

/**
 * Fenwick Thistle, 58. Proprietor of Fenwick's Tape Vault & Mothman Research
 * Annex: a flea market stall with a famous back room. Repaired televisions on
 * Main Street for twenty-five years. Unofficial historian of every tape in
 * the county. Believes everything: the matches, and the Mothman. Whispers
 * whenever he discusses it. Has never once been awake at 5 a.m., which is the
 * whole problem. In love with Tiny Tallbridge; has never finished a sentence
 * about it. A mark. His Mothman clues are real clues (see CAST.md Part 8).
 */
export default {
  npc: 'fenwick',
  intro: [
    "Welcome, welcome, to Fenwick's Tape Vault and Mothman Research Annex! Mind the cables. And the Annex. Mostly the Annex.",
    "Fenwick Thistle. Twenty-five years fixing televisions on Main Street. Now I fix the past, one tape at a time.",
    "Every tape in this county has passed through these hands. Weddings. Bake-offs. Matches. One very confusing christening.",
    "(He leans in and lowers his voice to a whisper.) And if you ever see something in the rafters on a Saturday night...",
    "...you come to me first. Not the Sheriff. Me.",
  ],
  lines: [
    // ---------------------------------------------------------------- the stall
    { text: ["Fifty cents. Or a quarter if you've seen something strange in the rafters.", "You HAVE? Sit down. SIT DOWN."], mood: 'surprised' },
    { text: "VHS is warm. DVDs are cold. Streaming is weather. You can't hold weather. You can hold a tape. You can hold it right to your chest." },
    { text: "Tape tip: never store them flat. Spine up, like little books. Tapes have feelings. Well. Tapes have tension. Same thing." },
    { text: "This is Static, my parakeet. Named for the sound a TV makes when it's thinking. He says 'tracking' and 'oh no.' Mostly 'oh no.'", mood: 'happy' },
    { text: "Which house on Elm had the first color television? The Purcells, 1966. Folks came from three streets over to watch the weather." },
    { text: ["Somewhere out there is the 1979 Haunted House match. Unaired. The night they hung the porch light.", "I would give my left loupe."] },
    { text: "Pip comes by on Saturdays. I give him trading cards. Free. Keep that quiet. He's my apprentice. He has the eye. Mostly the eye." },
    { text: "Thermos soup. Tomato. I bring it everywhere. Stakeouts, flea market, the dentist. A man should be prepared to stay a while." },
    { text: ["Want a tape about the old days? Bins in the back. Dig.", "The good ones are always under the bad ones. Under the bowling videos. It's always under the bowling videos."] },
    { text: "I'll fix anything with a picture tube. Anything. I fixed the Mayor's TV in 2009 and she cut a ribbon on it. On the TV." },

    // ---------------------------------------------------------------- the Mothman (always whispered)
    { text: ["(whispering) Current theory: the Mothman pupates. Beneath the ring. Between shows.", "Like a cocoon. I can't prove it. I can't DISprove it either."] },
    { text: "(whispering) It has moods. You can tell by the wings. Fluttery means happy. Very still means... I don't know yet. It's very still a lot." },
    { text: ["(whispering) It only comes when the story needs it. Think about that.", "A cryptid with TASTE. That's rarer than the cryptid."] },
    { text: ["(whispering) Have you noticed it never comes on Wednesdays? Never at the VFW.", "I have a theory. Interdimensional bingo conflicts."] },
    { text: ["Everyone says it's out at dawn. I have never once been awake at dawn. I've tried.", "My body simply won't. It's a medical thing. It's a pillow thing."], mood: 'sad' },
    { text: ["I tell Mo my newest theory every day at noon when she brings the mail.", "She nods. Very politely. I think she's quietly coming around."], mood: 'happy' },
    { text: "If you're about to tell me it's a big owl, I can see it in your face. Don't. Owls don't have porch lights.", mood: 'angry' },
    { text: "Sheriff Bev and I trade Mothman intel. She calls my methods crude. I call hers crude. We meet Thursdays. Very professional." },
    { text: "Clementine won't print my Mothman column. Except once. April first. She said it was 'thematically appropriate.' It was not a joke." },

    // ---------------------------------------------------------------- Tiny
    { text: "Tiny Tallbridge is... she's... the bakery is very... I should... soup? Do you want soup?", mood: 'surprised' },
    { text: ["Have you had one of Tiny's cakes? So small. You hold it like you'd hold a... like a... like something you...", "Never mind. It's a nice cake."] },

    // ---------------------------------------------------------------- weekly rhythm
    { text: "Water tower stakeout tonight, nine to midnight. Soup, binoculars, Static on my shoulder. I'll see it this time.", when: { weekday: [1, 4], time: [600, 1259] }, mood: 'happy' },
    { text: "(whispering) Stakeout. Don't wave. You'll scare it. It doesn't scare. You'll scare ME.", when: { time: [1260, 1439] } },
    { text: "Back room days, Monday to Thursday. Splicing, cleaning, restoring. Sundays I'm at the stall. You'll find me. Follow the hum.", when: { weekday: [0, 1, 2, 3], map: ['pawn'] } },
    { text: "Flea market Saturday! Get here before eight. That's when the good bins come out. After eight it's mostly bowling trophies.", when: { weekday: [5, 6], time: [360, 600] } },

    // ---------------------------------------------------------------- shows
    { text: "Saturday! Binoculars charged. Rafters mapped. If the porch light comes on tonight, I'm getting the clearest photo in history.", when: { weekday: [5] }, mood: 'happy' },
    { text: ["I think I saw it last night. In the rafters. Forty seconds! I got a photo.", "It's mostly my thumb. But the thumb is pointing right AT it."], when: { weekday: [6] }, mood: 'surprised' },
    { text: "{opponent} gave you a nasty bump. I have a VCR head cleaner, but that's for tapes. For people I recommend soup. I have soup.", when: { lastMatch: { won: false, maxDaysAgo: 3 }, hearts: [2, 14] } },
    { text: ["(whispering) Your match with {opponent}. Did you feel a draft? Around the ninth minute? From above?", "No? ...Hm. I'm writing 'no draft' with a question mark."], when: { lastMatch: { venue: ['sportatorium'], maxDaysAgo: 4 } } },

    // ---------------------------------------------------------------- alignment
    { text: "You're a hero! The Mothman favors heroes. Statistically. I've charted it. It helps whoever the crowd most needs helped. Often you.", when: { alignment: ['face'] } },
    { text: "Villain, eh? Careful. The Mothman's been known to side against villains. Not always. It has moods. But often.", when: { alignment: ['heel'] } },
    { text: "I don't judge. I sell tapes to everybody. Villains, heroes, a man who only wants weather reports from 1974. Lovely man.", when: { alignment: ['heel'], hearts: [3, 14] } },
    { text: "A tweener! Like the Mothman. Neither hero nor villain. In between. In the dusk. Hmm. Where were YOU at 10:40 Saturday?", when: { alignment: ['tweener'] }, mood: 'smug' },

    // ---------------------------------------------------------------- rank
    { text: "Main event! You'll be on tape now. Real tape. Somebody will dub you onto a blank and keep you in a shoebox forever. That's immortality.", when: { rank: ['main', 'assistant', 'pencil', 'owner'] }, mood: 'happy' },

    // ---------------------------------------------------------------- seasons and weather
    { text: "Spring cleaning season! People throw out tapes. People throw out HISTORY. I drive around with the truck window down, listening for the crunch.", when: { season: [0] } },
    { text: "Spring fog off the creek. Prime sighting weather. I'll be up all night. Well. Till midnight. Midnight is all night, for me.", when: { season: [0] } },
    { text: "Spring rain! Basements flood, folks haul out boxes, and the boxes have tapes in them. I'm not happy about the floods. I'm happy about the boxes.", when: { season: [0], weather: ['rain'] } },
    { text: "Summer fireflies wreck my sighting map. Every blink's a red pin. I have to hand-sort them. It takes all of August.", when: { season: [1] } },
    { text: "Creek fog every night this month. I made a sighting calendar. You can have one. October is just the word FOG, thirty-one times, in my best hand.", when: { season: [2] } },
    { text: "The flea market's half empty in the cold. Just me, the hand warmers, and a man selling one boot. Bless him. I hope he finds the other buyer.", when: { season: [3] } },
    { text: "A storm knocks the power out, and suddenly everyone remembers they own a VCR. Best week of my year, a good blackout.", when: { weather: ['storm'] }, mood: 'happy' },

    // ---------------------------------------------------------------- hearts
    { text: "You have kind eyes. I've said that already? I'll say it again. It's in the file.", when: { hearts: [3, 5] } },
    { text: ["I was a teenager in the ninth row in 1983, with a borrowed camcorder. Odessa Pruitt sat next to me.", "She kept saying 'the angle's wrong.' I thought she meant my camera."], when: { hearts: [4, 14], notFlag: 'truth_revealed' } },
    { text: ["One tape I can't fix. My crowd tape from 1983. The flood got it in '97, right at the moment. Right at the swing.", "Cookie tin, silica packets. I keep trying."], when: { hearts: [5, 14], notFlag: 'truth_revealed' }, mood: 'sad' },
    { text: ["When the shop closed, folks stopped seeing me. Walked right past.", "But the Mothman? Everybody's always looking for the Mothman."], when: { hearts: [6, 14] } },
    { text: "You're the first person in years who came to the back room and didn't check the time. I noticed. I notice everything. Except dawn.", when: { hearts: [9, 14] }, mood: 'love' },
    { text: "She said 'oh.' Like that. 'Oh.' I'm going to remember that 'oh' till I'm a hundred and four.", when: { flag: 'fen_sprinkles' }, mood: 'love' },
    { text: "FRIEND. On the stump. I still have it. Sheriff Bev laminated it for me. She didn't ask a single question. She was very moved.", when: { flag: 'fen_friend' }, mood: 'love' },

    // ---------------------------------------------------------------- the main story
    { text: ["The Duchess is in town! I have nineteen of her matches. Nineteen!", "If anybody knew anybody who wanted to bring her a tape... there'd be a discount."], when: { flag: 'grandma_in_town', notFlag: 'truth_revealed' }, mood: 'surprised' },
    { text: ["The crowd tape! Restored! Frame 4,410. She was CRYING.", "I filmed it and never knew. Forty years in a cookie tin, waiting."], when: { flag: 'truth_revealed' }, mood: 'surprised' },
    { text: "I taped Homecoming. Three cameras. Every angle. No flood's getting this one. Four cookie tins, in four different houses.", when: { flag: 'reunion_done' }, mood: 'happy' },

    // ---------------------------------------------------------------- life events
    { text: "I taped your wedding! From the rafters. Not for the Mothman. Well. Partly for the Mothman. Mostly for you. You looked wonderful.", when: { married: true }, mood: 'love' },
  ],
  gifts: {
    loves: ['mothman-figure', 'feather', 'polaroid'],
    likes: ['old-program', 'cassette', 'vinyl', 'comic', 'coffee', 'toy-wrestler', 'scrap', 'river-stone'],
    dislikes: ['protein-shake', 'sequins', 'fiber'],
  },
  giftReplies: {
    love: [
      "I need to sit. I need to sit and also lie down.",
      "Oh. Oh, friend. This goes in the Annex. Under glass. Next to the good soup.",
      "Static! Static, LOOK. ...He says 'oh no.' That means he loves it.",
    ],
    like: [
      "Ooh! A fine find. I'll catalog it tonight. By flashlight. For atmosphere.",
      "Thank you, friend! This has history in it. I can feel it. Like a warm tape.",
    ],
    neutral: [
      "Hm! Interesting. I'll put it in the Interesting bin. It's a very big bin.",
      "Thank you! I'm sure it means something. Most things do, eventually.",
    ],
    dislike: [
      "Oh. Oh no. This is the DVD of gifts.",
      "I appreciate the thought. Static doesn't. Static says 'oh no.'",
      "You're going to tell me this is a big owl too, aren't you.",
    ],
    birthday: [
      "My birthday! Mo brought a card with a moth on it this morning. Funny coincidence. And now a {item}! Two gifts! Static, we're POPULAR.",
      "Fifty-nine! And still no clear photo. A {item}, though. This is the year, friend. I can feel it in the tracking.",
    ],
    byItem: {
      'mothman-figure': ["The eyes glow. THE EYES GLOW.", "(He turns off the stall lamp and holds it up in the dark, and doesn't say anything for a long time.)"],
      feather: ["Is that... a wing? This SIZE?", "(whispering) Where. When. Which way was the wind. No. Don't say it here. Static is listening and Static talks."],
      polaroid: "A blurry crowd, the flash late, somebody's purse in the air. Look at the top left corner. LOOK at it. ...It's a light fixture. It's probably a light fixture.",
      'old-program': "A 1979 program! I'll file it with the tapes from that season. They'll keep each other company. They're from the same year. They'll have things to say.",
      cassette: "A mixtape. Saturday pump-up jams. I'll digitize it. No I won't. I'll play it in the van like a civilized man.",
      vinyl: "1984 pressing. Grooves are clean. Somebody loved this and also owned a dust jacket. That's rare. That's a responsible kind of love.",
      comic: "Wrestle-Bot vs. The Moon! Issue one! The moon has a face on the cover. Faces on the moon are a whole separate theory. I'll tell you on Thursday.",
      coffee: "Coffee! For the stakeout. I'll last till half past twelve now. That's practically dawn.",
      'toy-wrestler': "A vintage figure! Bendable. Chewed on the boot. I can date him by the chew. That's a 1986 chew.",
      scrap: "Scrap metal. I'll make an antenna. For... reasons. Reception reasons. Rafters reasons.",
      'river-stone': "From the creek? Near the water tower? (He holds it to his ear.) ...Nothing. Worth checking.",
    },
    later: [
      "(whispering) The {lastGift} is in the Annex. Under glass. Next to the good soup thermos.",
      "Static's been saying a new word since you gave me the {lastGift}. It's 'oh.' Just 'oh.' I think he's moved.",
    ],
  },
  again: [
    "(whispering) Back so soon? Were you followed? ...By anything with wings?",
    "Static says 'oh no.' That means 'welcome back.' Mostly.",
    "I'm in the middle of rewinding. Rewinding can't be rushed. Well, it can. It's called fast-forward. That's different.",
  ],
  idle: [
    "(Fenwick is holding a tape up to the light, squinting at the ribbon like it owes him an answer.)",
    "Fifty cents a tape. A quarter if you've seen something. Have you seen something? No? Fifty cents.",
  ],
  birthday: { season: 2, day: 26 },
  events: [
    {
      id: 'fenwick-2', hearts: 2, title: 'The Boards',
      script: async (api) => {
        await api.narrate("Fenwick sells you a tape from the bottom of a bin for a quarter. It's a 1981 bake-off. He wraps it in newspaper like a fish.");
        await api.narrate('Then he stops, studies your face through yellow aviator glasses, and lowers his voice.');
        await api.say('fenwick', "You have kind eyes. You may see the boards.");
        await api.narrate('The back room. Three corkboards, floor to ceiling. Photos that are mostly fog. Index cards. Red string, everywhere, like a web.');
        await api.narrate('A binder on the table is labeled DOSSIER, VOL. 1. It is forty pages thick. On the shelf behind it: VOL. 2, VOL. 3.');
        await api.say('fenwick', '(whispering) Nobody laughs back here. That\'s the rule. Out there, fine. In here, we ask questions.');
        const c = await api.choose('Fenwick watches your face, a little nervous.', [
          { label: 'Whisper back', value: 'whisper' },
          { label: 'Ask about the red string', value: 'string' },
        ]);
        if (c === 'whisper') {
          await api.narrate('You lower your voice to match his. His eyes go wide behind the yellow lenses.');
          await api.sayMood('fenwick', 'love', "(whispering) You WHISPERED. Nobody whispers back. Twenty years, and nobody ever whispers back.");
          api.hearts('fenwick', 30);
        } else {
          await api.say('fenwick', "Connections! Every string is a connection. That one's a sighting to a weather report. That one's a sighting to a sandwich.");
          await api.say('fenwick', "...The sandwich one may be a mistake. I was very hungry that week.");
          api.hearts('fenwick', 15);
        }
      },
    },
    {
      id: 'fenwick-4', hearts: 4, map: 'pawn', title: 'The Sighting Map',
      script: async (api) => {
        await api.narrate('Fenwick unrolls a county map across his workbench and weighs the corners down with a soup thermos, a VCR, Static, and you.');
        await api.say('fenwick', "Every confirmed sighting in four years. Every pin's a witness. Gus. The milkman. Sheriff Bev, once, very reluctantly.");
        await api.narrate('Red pins along the creek road. A cluster around the water tower. Three in the Evening Bell parking lot. Several at the flea market, around noon.');
        await api.sayMood('fenwick', 'surprised', "No pattern. Truly random. Truly ALIEN.");
        await api.narrate("You look at the pins for a long time. The creek road, then the tower, then the Bell, then the market. Something about it tugs at you, like a route.");
        const c = await api.choose(null, [
          { label: 'Say it almost looks like a pattern', value: 'pattern' },
          { label: 'Agree it is truly alien', value: 'alien' },
        ]);
        if (c === 'pattern') {
          await api.sayMood('fenwick', 'surprised', "A pattern! You see it too! Interdimensional ley lines! I KNEW the flea market was a nexus!");
          await api.say('fenwick', "It's the funnel-cake grease. It conducts something. I'm going to need more string.");
          api.hearts('fenwick', 15);
        } else {
          await api.narrate('Fenwick grabs your hand and shakes it with both of his.');
          await api.sayMood('fenwick', 'happy', "Truly alien. Finally, a colleague. Static, we have a COLLEAGUE.");
          await api.narrate("Static says 'oh no.'");
          api.hearts('fenwick', 30);
        }
        api.flag('mothclue_map');
      },
    },
    {
      id: 'fenwick-6', hearts: 6, map: 'pawn', title: 'Something Wonderful',
      script: async (api) => {
        await api.narrate('A slow afternoon in the back room. Fenwick is cleaning tape heads with a cotton swab, very gently, the way you would clean a bird.');
        await api.say('fenwick', "Folks laugh at me. About the Mothman. I know they do. I don't mind. Mostly.");
        await api.say('fenwick', "When the repair shop closed, I'd walk down Main Street and people would look right through me. Like I'd already left.");
        await api.narrate('He sets the swab down.');
        await api.say('fenwick', "And then one morning Gus says on the radio he saw something on the creek road. Something nobody could explain.");
        await api.sayMood('fenwick', 'love', "If the Mothman's real, then a small place can hold something wonderful without anybody needing to understand it.", 'And so can I.');
        const c = await api.choose(null, [
          { label: 'Tell him you see him', value: 'see' },
          { label: 'Ask him about the old repair shop', value: 'shop' },
        ]);
        if (c === 'see') {
          await api.narrate("Fenwick takes off his yellow glasses and cleans them for a long time. Longer than glasses need.");
          await api.say('fenwick', "...Well. Well, now. That's two of us, then. You and the Mothman.");
          api.hearts('fenwick', 30);
        } else {
          await api.say('fenwick', "Thistle TV and Radio. Green awning. A bell over the door that played the first four notes of a doorbell. On purpose.");
          await api.say('fenwick', "I kept the bell. It's on the stall now. Didn't you notice? Nobody notices. ...You'll notice now.");
          api.hearts('fenwick', 15);
        }
      },
    },
    {
      id: 'fenwick-8', hearts: 8, title: 'The Sprinkles',
      script: async (api) => {
        await api.narrate('Fenwick is holding a small glass jar with both hands. Inside: sprinkles in colors nobody has made since the Carter administration.');
        await api.say('fenwick', "1974. Rainbow nonpareils. Original jar. I found them three years ago. I've been saving them for... for... someone who...");
        await api.say('fenwick', "...Would you walk with me? To the bakery? Just walk. You don't have to do anything. Just be... adjacent.");
        await api.fade();
        await api.narrate("Tallbridge Bakery. The bell over the door. Through the window, Tiny is piping a rose onto a cake the size of a coin, tongue between her teeth.");
        await api.narrate('Fenwick stops on the sidewalk. He turns around. He turns back. He turns around again.');
        await api.sayMood('fenwick', 'sad', "I can't. I can't. She's working. She's busy. She's so... it's so... I'll come back. In a year.");
        const c = await api.choose('Fenwick is about to bolt.', [
          { label: 'Open the door and walk in with him', value: 'walk' },
          { label: 'Tell him three years is long enough', value: 'talk' },
        ]);
        if (c === 'walk') {
          await api.narrate('You open the door. The bell rings. Now he has to. You walk in beside him, close enough that your shoulders touch.');
          api.hearts('fenwick', 30);
        } else {
          await api.narrate('He looks at the jar. He looks at you. He takes a breath that lasts most of a minute, and he opens the door himself.');
          api.hearts('fenwick', 15);
        }
        await api.narrate('Tiny looks up. Fenwick holds out the jar at arm\'s length, like a man returning a library book that is very overdue.');
        await api.say('fenwick', "These are... for... they're from 1974... you're very... the cakes are... I...");
        await api.narrate('Tiny takes the jar. She holds it up to the window. The colors catch the light.');
        await api.say('tiny', '...Oh.');
        await api.narrate("It's a small word. It comes out soft and surprised and a little wobbly. Fenwick will remember it for the rest of his life.");
        await api.say('tiny', "They don't make these colors anymore. You kept these for three years?", "...Sit down, Fenwick. I'm making you a cake. A regular one. Well. My regular.");
        api.flag('fen_sprinkles');
      },
    },
    {
      id: 'fenwick-10', hearts: 10, title: 'Friend',
      script: async (api) => {
        await api.narrate('Fenwick grabs your sleeve. He looks like he has not slept, which turns out to be exactly the case.');
        await api.say('fenwick', "I did it. Fourteen alarms. Static helped. I'm going to be awake at five a.m. Tomorrow. At the water tower. Come with me?");
        await api.fade();
        await api.narrate('Five in the morning. Fog off the creek, thick as cotton. The water tower is a gray shape overhead, its safety light blinking.');
        await api.narrate('Fenwick is wrapped in three scarves, holding his thermos like a lantern. He is vibrating with awake.');
        await api.say('fenwick', "(whispering) So THIS is dawn. It's very... damp. Why didn't anyone tell me it's so damp.");
        await api.narrate('Somewhere far down the creek road, a small red light bobs along in the fog and is gone. Fenwick, pouring soup, does not see it.');
        await api.narrate('By the tower is the Moth Stump, where Fenwick has left offerings for four years. On it, this morning, something is waiting.');
        await api.narrate('A paper moth, folded expertly, wings spread wide. On one wing, in neat block capitals, a single word.');
        await api.narrate('FRIEND.');
        await api.narrate("Fenwick picks it up with both hands. He doesn't say anything. He sits down on the wet grass, right there, and cries.");
        await api.say('fenwick', "...Four years. I never even saw it. And it saw me.");
        const c = await api.choose(null, [
          { label: 'Sit down on the wet grass next to him', value: 'sit' },
          { label: 'Ask if he wants to show Sheriff Bev', value: 'bev' },
        ]);
        if (c === 'sit') {
          await api.narrate("You sit. It's very damp. He offers you half his soup. You watch the fog lift off the creek together until the sun is all the way up.");
          api.hearts('fenwick', 30);
        } else {
          await api.say('fenwick', "No. Not this one. Not the boards, not the dossier. This one's just mine.", '...And yours. You were here. You can know.');
          api.hearts('fenwick', 15);
        }
        await api.say('fenwick', "Don't tell anyone. They'd want to analyze it. I don't want to analyze it. I want to keep it.");
        api.flag('fen_friend');
      },
    },
  ],
} satisfies DialogueSet;
