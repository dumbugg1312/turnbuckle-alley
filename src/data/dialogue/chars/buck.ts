import type { DialogueSet } from '../types';

/**
 * Buck Bruiser (Buck Kowalski), 33, the chaotic twin. Wild beard, wood shavings,
 * a pencil behind each ear, a whittling knife on a lanyard, and a notebook of
 * very sad country songs hidden in the bait fridge. "Everybody thinks I'm the
 * easy one. Easy is just what loud looks like from outside."
 *
 * Public: bickering brawler who boycotts Tiny's bakery. Insider: a brother who'd
 * walk into traffic for Bo and would rather do that than say so.
 *
 * Flags set here: 'buck_gadget' (6), 'buck_store' (8), 'buck_notebook' (10).
 * 'buck_notebook' unlocks the joint twins' event ("Same Wall"), which lives in
 * bo.ts because the notebook is delivered to Bo.
 */
export default {
  npc: 'buck',
  intro: [
    "(A wild-bearded man in an untucked blue flannel is playing harmonica on a cereal box. He stops and waves with both hands.)",
    "Buck! Kowalski! Bruiser! Whatever, I answer to all of 'em. You're the new one! Bo says no harmonica in the store. He says it echoes.",
    "...He's right. It echoes beautifully.",
    "If you need a hammer, a song, or a bad idea, I'm your guy. Bo does all the other things.",
  ],
  introPublic: [
    "(A man with wood shavings in his beard grins over the hardware counter.) Steel Chair Hardware! Buck Bruiser! The fun one! ...Bo calls himself the right one. We're both right. Loudly.",
    "He's wrong about everything. I haven't heard what he said yet, but I'm sure of it.",
    "Whatever you need, we've got it. Whatever Bo says we don't have, we do. It's in the back. Next to the minnows.",
  ],
  lines: [
    // ---------------------------------------------------------------- Public: loud, charming, wrong
    { text: "Bo's wrong. Whatever he said. I wasn't there, but he's wrong.", when: { hearts: [0, 2], place: ['public'] }, weight: 2 },
    { text: "Don't touch the harmonica display. It's not for sale. ...It's for sale. It's *very* for sale. Don't touch it.", when: { place: ['public'], map: ['hardware'] } },
    { text: "Self-tightening turnbuckle. I'm so close. I just need one more spring and a *stronger Bo.*", when: { place: ['public'] } },
    { text: "Hero! Want a chair? Bo says no chairs. I say *yes* chairs. We're a house divided and also a store.", when: { place: ['public'], alignment: ['face'] } },
    { text: "A villain! Finally, somebody I can high-five without a lecture. ...Bo's got rules about high-fives. There's a laminated card.", when: { place: ['public'], alignment: ['heel'], flag: 'debuted' }, mood: 'happy' },
    { text: "We boycott Tiny's bakery. It's an *outrage.* A dollar surcharge just for being us. ...Anyway she makes a mean cupcake. I'm told. By others.", when: { place: ['public'] } },
    { text: "I wrote a song once about a hammer. Three verses and no hope. Gus says it's a classic.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "Pot roast at Aunt Patty's on Thursdays. She asks if we're 'really fighting.' We say yes. We're not lying. We're just not telling the whole... thing.", when: { place: ['public'], hearts: [3, 10], weekday: [3] }, weight: 2 },
    { text: "Porch Hour with Gus on Fridays. I play harmonica. He talks over it. It's *the best.*", when: { place: ['public'], weekday: [4] }, weight: 2 },
    { text: "Tonight! Tag-team! Me, the guy I've known since birth, and about nine hundred opinions.", when: { showDay: true, place: ['public', 'show'] }, weight: 2 },
    { text: "Hank's in the back using my clamps. She says they're hers. They're mine. She says I lent them. I didn't. I did. I forget.", when: { place: ['public'], hearts: [3, 10], map: ['hardware'] } },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "Rain! Best fishing weather. Also best 'sit in the back of the store and write sad songs' weather. Both are productive.", when: { weather: ['rain'] } },
    { text: "Storm. Power's out. Bo labels everything with a flashlight in his teeth. It's the best thing I've ever seen.", when: { weather: ['storm'] } },
    { text: "Snow. The harmonica sounds better in the cold. Don't ask me why. It just sounds more lonely.", when: { weather: ['snow'] } },
    { text: "Wind! Every tool in the store's a wind chime. Bo hates it. I love it. It's like a very metal choir.", when: { weather: ['wind'] } },
    { text: "Bo thinks he lost his tape measures. They're in my glovebox. Nine of 'em. Measuring nothing. Keeping each other company.", when: { season: [0] }, weight: 2 },
    { text: "Porch Hour in summer, Gus leaves the station door open and the whole street gets my harmonica. Mrs. Purcell yelled AGAIN once. I took it as a request.", when: { season: [1] } },
    { text: "Fall's the sad season. I write four songs a week. Bo says it's 'a lot of content.' He means it as a compliment. It isn't one.", when: { season: [2] } },
    { text: "June does chili on Fridays once it gets cold. I'd fight a bear for a bowl. Wanda would win. She'd bow first. Then she'd win.", when: { season: [3] } },

    // ---------------------------------------------------------------- Insider: Buck, a little quieter
    { text: "Everybody thinks I'm the easy one. Easy's just what loud looks like from outside.", when: { place: ['insider'], hearts: [3, 10] }, weight: 2 },
    { text: "I write my songs in a notebook I keep in the bait fridge. So Bo won't look. He'd never look in a bait fridge. He's got standards.", when: { place: ['insider'], hearts: [3, 7] } },
    { text: "Cupcakes from Tiny's back door. Twelve. Bo eats three, I eat nine. He counts. He thinks I don't know he counts.", when: { place: ['insider'] }, mood: 'happy' },
    { text: "In public I boycott her bakery. In private I'm a regular. She calls me 'Mr. Blue.' She keeps a tab. The tab has a *name.*", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Turnbuckle's coming along. It tightened *itself* this morning. Then it tightened Bo's hat to the post. He's not talking to me. Again.", when: { place: ['insider'], notFlag: 'buck_gadget' }, mood: 'happy' },
    { text: "The wall's thin. I can hear Bo's alarm at 5:40. Then 5:42. Then 5:44. He hits snooze. He's the careful one. *Ha.*", when: { place: ['insider'], hearts: [6, 10], notFlag: 'twins_wall' } },
    { text: "Sundays I fish. I don't catch anything. That's not the point. The point's the sad song. Bo's doing inventory. We're both happy. Far apart. It's a *system.*", when: { place: ['insider'], weekday: [6] } },
    { text: "Dad calls from Arizona: 'How's the grout?' We have no grout. He tells us anyway. It's the only way he knows how to say 'I love you.'", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Dad always said the Velvet Hammers 'have to get mended someday, or this town never will.' Every Thanksgiving. Bo rolls his eyes. I never do.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Nobody tells you being the funny one is a job. A very tiring job. The pay's all in laughs. You can't pay rent in laughs. Bo's checked.", when: { place: ['insider'], hearts: [6, 10] } },
    { text: "You're new. Hit hard, tag fast, and never, ever let Bo see the invoice.", when: { place: ['insider'], rank: ['rookie', 'opener'] } },
    { text: "Top of the card! Bo's gonna want a chart. I'll bring a song.", when: { place: ['insider'], rank: ['main', 'assistant', 'pencil', 'owner'] }, mood: 'happy' },
    { text: "Pregame ritual. Bo labels the tool belt, I take the labels off, Bo puts them back, we both say 'measure twice.' Then we fight over the belt. Same every time.", when: { place: ['insider'], showDay: true }, mood: 'happy' },
    { text: "Late. Bo's asleep. I can hear him through the wall. He snores in three-quarter time. I wrote it down once. It's a waltz.", when: { time: [1320, 1560], place: ['insider'] }, mood: 'sad' },
    { text: ["You and {opponent}! I hummed the whole match. Under my breath. Bo elbowed me twice.", "There's a song in it. Minor key. Don't worry, you're the part that goes up."], when: { place: ['insider'], lastMatch: { maxDaysAgo: 3 } }, mood: 'happy' },
    { text: "You beat us! I've already got a verse about it. Bo wants it to rhyme 'Bruiser' with 'loser.' I said that's too easy. He said that's the point.", when: { place: ['insider'], lastMatch: { won: true, opponent: ['bo', 'buck'], maxDaysAgo: 5 } } },

    // ---------------------------------------------------------------- After the events
    { text: "The turnbuckle works. *Ka-chunk.* Every time. It's beautiful. I'm going to put it in a museum. Bo wants to put it in an invoice.", when: { flag: 'buck_gadget', place: ['insider'] }, mood: 'happy' },
    { text: "If the store goes, so do we. That's what I keep thinking. ...I know. Dramatic. I'm a songwriter.", when: { flag: 'buck_store', notFlag: 'twins_wall', place: ['insider'] }, mood: 'sad', weight: 2 },
    { text: "You gave it to him? ...What'd he say? No. Don't tell me. He knocked, didn't he? ...He knocked.", when: { flag: 'buck_notebook', notFlag: 'twins_wall', place: ['insider'] }, mood: 'surprised', weight: 3 },
    { text: "We knock now. Two. Three. It's not a code. It's just a *yes.*", when: { flag: 'twins_wall', place: ['insider'] }, mood: 'love', weight: 3 },
    { text: "I asked him to stay. The easiest hard thing I ever did. I should've done it years ago.", when: { flag: 'bo_stay', place: ['insider'] }, mood: 'happy', weight: 2 },
    { text: "Bo's the careful one. He'd never say it, but I think he's afraid I'd be fine without him. Which is *hilarious.* I'd put my hat on backwards. Constantly.", when: { hearts: [9, 10], place: ['insider'] } },
  ],
  gifts: {
    loves: ['cassette', 'vinyl', 'chili-dog'],
    likes: ['plank', 'scrap', 'tape', 'corn-dog', 'tamales'],
    dislikes: ['foam-finger', 'paperback', 'protein-shake'],
  },
  giftReplies: {
    love: [
      "NO. WAY. (He grabs it with both hands and nearly drops it.) Bo's gonna be so jealous. I'm not telling him. ...I'm telling him. I'm telling everybody.",
      "That's the sad-song kind of perfect! I've got a whole notebook of songs that need exactly this!",
      "You're a *gem.* A rare, mostly unbreakable gem. Bo's gonna want to catalog you. Don't let him.",
    ],
    like: [
      "Hey, nice! I'll use it. Or lose it. We'll see which comes first!",
      "Thanks, friend. It'll go in the bait fridge. That's where the good things go.",
      "Sweet! This'll make a great prop. Or a snack. Or a prop that's *also* a snack.",
    ],
    neutral: [
      "Ha! Thanks! I'll put it with the rest of my stuff. Bo'll organize it into oblivion.",
      "Oh! A gift! I'm not sure what it's *for*, but I like that it's *for me.*",
    ],
    dislike: [
      "Huh. Yeah. No. I'm giving this to Bo. He likes things like this. Sad things. Beige things.",
      "(He holds it at arm's length.) I'm going to be polite and put this in the back of a very deep drawer.",
      "This has *instructions.* I don't do instructions. We're not friends anymore. Kidding! Kinda.",
    ],
    birthday: [
      "(He hugs you with one arm, {item} in the other. It's like being hugged by a very friendly tree.) Bo got thanked first. He always gets thanked first. Mine's louder.",
      "Summer the second! Bo and I don't speak till midnight, then we hug. It's a *tradition.* You're getting your hug early, for the {item}.",
    ],
    byItem: {
      cassette: "A mixtape! PUMP UP JAMS 4 SAT! Some kid made this for a Saturday. I'm gonna listen to it on a Tuesday. Out of respect.",
      vinyl: "Vinyl! 1984! Bo's gonna say we don't have a record player. We DO. It's in the back. Under the minnows.",
      'chili-dog': "(He eats it in four bites, standing up, before saying thank you.) ...Thank you. Sorry. That was a *good* chili dog.",
      plank: "A board! I'm gonna make a bird feeder. Or a shelf. Or a bird feeder that's also a shelf. The birds can sort it out.",
      scrap: "Scrap! This is turnbuckle money. This is the spring I needed. I'm not saying it'll work. I'm saying it'll go *ka-chunk.*",
      tape: "Tape. I'm gonna tape my harmonica to my hat. Hands-free. Bo's gonna hate it so much.",
      'corn-dog': "Corn dog! Fair food on a regular day! You're a rebel! I love a rebel!",
      tamales: "Rosa's tamales. Still warm. I'm gonna eat one and hide one in the bait fridge for later. Next to the songs.",
    },
    later: [
      "Still got the {lastGift}. Bo tried to label it. I peeled the label off. He put it back. It's a whole *thing* now.",
      "I wrote a song about the {lastGift}. Two verses. It's not sad, for once. Gus says it's 'unsettling.'",
    ],
  },
  again: [
    "Back already! Missed me! ...You missed Bo. Everybody misses Bo. He's in aisle four.",
    "(Buck plays two notes on the harmonica that clearly mean 'later.')",
    "I'm in the middle of a song. It's about you now. Sorry. It happens.",
  ],
  idle: [
    "(Buck is whittling something that might be a duck.)",
    "Hey! Can't stop. Bo's counting something and I'm the thing.",
  ],
  birthday: { season: 1, day: 2 },
  events: [
    // ---------------------------------------------------------------- 2: Breakaway chair
    {
      id: 'buck-2', hearts: 2, map: 'hardware', title: 'Breakaway Chair',
      script: async (api) => {
        await api.narrate("Steel Chair Hardware, a quiet hour. Buck is whittling at the counter, tongue between his teeth, shavings in his beard. He holds up something tiny between two fingers.");
        await api.say('buck', "Hold out your hand. Flat. Don't breathe on it. I made you something.");
        await api.narrate("He sets it on your palm. A folding chair, carved from a clothespin, complete with miniature hinges. It's the most delicate thing you've ever seen. It sits there for a second.");
        await api.narrate("Then, with a small, regretful *click*, it falls into three pieces.");
        await api.say('buck', "...Breakaway chair. On purpose. It's the most advanced piece of woodwork in the state.");
        await api.narrate("It was not on purpose. Through the stockroom door, a voice calls out: \"IT WAS NOT ON PURPOSE.\" Buck shouts back, without turning: \"IT WAS ON PURPOSE, BO.\"");
        const c = await api.choose('Three pieces of clothespin sit on your palm.', [
          { label: 'Fix it with a strip of athletic tape', value: 'fix' },
          { label: '"Breakaway chair. A masterpiece."', value: 'masterpiece' },
          { label: '"Your whittling needs work."', value: 'bad' },
        ]);
        if (c === 'fix') {
          api.hearts('buck', 30);
          await api.narrate("You wrap a tiny strip of tape around the broken hinge. The chair stands up. It's lopsided and a little ugly, and it works.");
          await api.sayMood('buck', 'surprised', "A TAPE CHAIR. It's got structural *soul.* Do you know what you just did? You made it better. It's going on the wall.");
        } else if (c === 'masterpiece') {
          api.hearts('buck', 15);
          await api.narrate("You say it with all the gravity you can muster. Buck puts a hand on his heart.");
          await api.say('buck', "Finally. Someone who understands the art. Take it. Put it on your mantel. Put it on your tombstone. Whatever you want.");
        } else {
          api.hearts('buck', -10);
          await api.say('buck', "Oh. Yeah. Yeah, no, you're right. It's... not my best. I'll go write a song about it.");
          await api.narrate("He laughs, loud and quick, the way a person laughs to get ahead of a joke. Then he goes to the back of the store and doesn't come out for twenty minutes. You hear a harmonica. It's in a minor key.");
        }
        await api.narrate("As you leave, you notice the shelf behind the counter: a row of tiny hand-carved things. A hammer, a boot, a tiny wrestling ring. Each with a label in Bo's neat print: *BUCK'S. (DO NOT TOUCH.)* Some of the labels look newer than others.");
      },
    },
    // ---------------------------------------------------------------- 4: Steel Chair Heart
    {
      id: 'buck-4', hearts: 4, map: 'diner', title: 'Steel Chair Heart',
      script: async (api) => {
        await api.narrate("Late. The Hot Tag is nearly empty. Buck slides into the back booth with a cereal box tucked under one arm, a harmonica in his teeth, and a grin that's mostly nerves.");
        await api.say('buck', "Don't say anything yet. I wrote you a song. Nobody's heard it. Not Bo. Not Gus. Not the fish.");
        await api.narrate("He puts the cereal box on the table, knocks a beat on it with two spoons, and starts to play. The harmonica is low and mournful, like a train a long way off.");
        await api.narrate("Then he sings, not loud, which isn't like him at all:");
        await api.say('buck', "'I've got a steel chair heart. It's been swung and it's been thrown. It's dented in the corners and it's rusted to the bone.'");
        await api.say('buck', "'But you can set it down in any room and it will hold you up. Just don't ask it to say so. It's a chair. It's *tough.*'");
        await api.narrate("The harmonica dips, swells, and trails off into the quiet. June has stopped wiping the counter, and is pretending not to have.");
        const c = await api.choose(null, [
          { label: 'Hum the harmonica line with him on the second pass', value: 'sing' },
          { label: '"Who\'s it about?"', value: 'ask' },
          { label: '"It needs a key change."', value: 'critic' },
        ]);
        if (c === 'sing') {
          api.hearts('buck', 30);
          await api.narrate("You hum it back, a little flat. He plays it again, slower, and stops looking at the table and starts looking at you.");
          await api.say('buck', "Nobody ever hums along. They clap. Clapping's fine. Humming's *better.*");
        } else if (c === 'ask') {
          api.hearts('buck', 15);
          await api.say('buck', "A chair. It's about a chair. A very *tough* chair. Next question.");
          await api.narrate("He taps the cereal box twice, fast, and doesn't look up.");
        } else {
          api.hearts('buck', -10);
          await api.say('buck', "...A key change. Yeah. Sure. Everybody's a critic. Tell Bo. He'd love that. He'd make a chart.");
          await api.narrate("He puts the harmonica in his pocket and the cereal box under his arm. He doesn't play for the rest of the night.");
        }
        await api.narrate("Behind the counter, June sets down a bowl of chili in front of Buck without a word. On the house. He stares at it a long moment before he picks up the spoon.");
      },
    },
    // ---------------------------------------------------------------- 6: Ka-chunk
    {
      id: 'buck-6', hearts: 6, map: 'hardware', when: { showDay: true }, title: 'Ka-Chunk',
      script: async (api) => {
        await api.narrate("Show day, early. Buck grabs your sleeve the second you walk in, eyes huge, voice a whisper. \"It's done. It's DONE. Come on. Don't talk. Don't walk loud. It's sensitive.\"");
        await api.fade();
        await api.narrate("The locker room, empty and quiet. On the bench is a vise, and in the vise a steel turnbuckle covered in springs, with a hand-drawn label: *SELF-TIGHTENING (PROBABLY).*");
        await api.say('buck', "Watch. I loosen it. Like it's a *really* bad day for a ring. And then...");
        await api.narrate("He flicks it with a finger. The springs hum. The whole assembly whirrs, and clamps down with a bright, solid *ka-CHUNK.*");
        await api.sayMood('buck', 'happy', "KA-CHUNK! It WORKS! It tightens *itself!* Hank's gonna cry. Hank doesn't cry. Hank's gonna *leak!*");
        await api.narrate("He spins to the empty bench beside him, arms open, mouth already making the first word.");
        await api.say('buck', "Bo! Bo, look, it...");
        await api.narrate("There's nobody there. They aren't speaking this week. The hat incident. Buck's arms drop slowly.");
        await api.sayMood('buck', 'sad', "I built it for him, you know. For when he's up on the top rope and the pad slips. He'd have loved to measure it. He'd have written a number on it.");
        const c = await api.choose(null, [
          { label: '"Go tell him. Right now."', value: 'tell' },
          { label: '"Measure it first. Bring him a number."', value: 'measure' },
          { label: '"Give it a day. He\'ll come around."', value: 'wait' },
        ]);
        if (c === 'tell') {
          api.hearts('buck', 30);
          await api.narrate("He nods, picks up the vise like a newborn, and marches out. Down the hall you hear: \"BO!\" \"WHAT.\" \"LOOK.\" A long silence. \"...Is that rated?\"");
        } else if (c === 'measure') {
          api.hearts('buck', 30);
          await api.narrate("You find a tape measure (Bo's, labeled) and measure it together. Four and three-sixteenths inches. Buck writes it on his hand in marker.");
          await api.say('buck', "A NUMBER. That's the ticket. He'll *love* a number. That's the best idea anyone's ever had about my brother.");
        } else {
          api.hearts('buck', 15);
          await api.say('buck', "Yeah. A day. He always does. He just... takes his time. Like a tide. A very annoying tide.");
        }
        api.flag('buck_gadget', true);
        await api.narrate("The turnbuckle sits in the vise, humming softly, still warm from the ka-chunk. It looks, for a moment, like a very small, very proud animal.");
      },
    },
    // ---------------------------------------------------------------- 8: The tool crate
    {
      id: 'buck-8', hearts: 8, map: 'diner', title: 'The Tool Crate',
      script: async (api) => {
        await api.narrate("The Hot Tag, late. Buck is already in the back booth with his harmonica on the table, unplayed. No cereal box. No grin. He looks about ten years younger and twenty years more tired.");
        await api.say('buck', "Sit. Please. I don't have a bit. I've been trying all day to think of a bit, and I don't have one. That's... that's new.");
        await api.say('buck', "Dad built the store in '79. Mom painted the sign. When Bo and I were five, there was a storm, and our power went out, and we slept in the biggest tool crate in the back. It was the safest place in the world.");
        await api.say('buck', "That crate's still there. Under the paint thinner. I check on it every Sunday. Bo doesn't know.");
        await api.sayMood('buck', 'sad', "The store's the last thing left of how it was when we were kids. Everything else grew up and went to Arizona. If the store goes, so does the crate, and the sign, and...");
        await api.say('buck', "...I don't know what we are, after. Two guys who punch each other.");
        const c = await api.choose(null, [
          { label: '"We\'ll keep it open. Together."', value: 'keep' },
          { label: '"Bring the crate upstairs. Where you can see it."', value: 'crate' },
          { label: '"Wow. You really were a hardware kid."', value: 'joke' },
        ]);
        if (c === 'keep') {
          api.hearts('buck', 30);
          await api.narrate("You say it plainly. He nods, once, hard, the way you'd close a gate.");
          await api.say('buck', "Together. Yeah. That's the right word. It's the one I never use. I hit people. I don't... *together.*");
        } else if (c === 'crate') {
          api.hearts('buck', 30);
          await api.sayMood('buck', 'surprised', "Upstairs. Where I can *see* it. ...Why have I been going down there every Sunday like it's a *grave?* It's a crate. It's a *good* crate.");
          await api.say('buck', "I'll carry it up this weekend. Bo'll want to label it. For once, I'm gonna let him.");
        } else {
          api.hearts('buck', -10);
          await api.say('buck', "Ha. Yeah. A hardware kid. Ha. That's... that's me.");
          await api.narrate("He picks up the harmonica and puts it down again. He's smiling the way he smiles for a crowd. It's the wrong smile for a booth.");
        }
        api.flag('buck_store', true);
        await api.say('buck', "Keep the crate between us. He'd label it. And then I'd have to tell him why it matters. And then I'd say it wrong.");
      },
    },
    // ---------------------------------------------------------------- 10: The bait fridge
    {
      id: 'buck-10', hearts: 10, map: 'hardware', title: 'The Bait Fridge',
      script: async (api) => {
        await api.narrate("The back of the store, after closing. Buck pulls you past the paint thinner (and a tool crate, you notice, that has been wiped clean) to a humming white fridge marked LIVE BAIT.");
        await api.say('buck', "Don't ask why. It's a very good hiding place. Bo thinks 'live bait' is a legal liability.");
        await api.narrate("Behind a bucket of minnows, in a freezer bag, is a battered spiral notebook. The cover has a strip of label-maker tape across it: *BUCK'S. (DO NOT OPEN.)*");
        await api.say('buck', "Bo labeled it in 2011, when he found it. He's never opened it. Fourteen years. That's... that's love, I think. Nobody *respects* a label like that.");
        await api.say('buck', "There's about two hundred songs in there. They're all sad. They're about trucks and dogs and lost rodeos. Don't read 'em in front of me.");
        await api.narrate("He flips to the last page and turns the notebook toward you, as if it might bite.");
        await api.say('buck', "This one's about Bo. 'Same Wall.' I wrote it fourteen times. I can't hand it to him. If I hand it to him, it's real. If it's real, I'd have to... say stuff.");
        await api.say('buck', "Would you? Give it to him. Please. You don't have to say anything. Just put it in his hands.");
        const c = await api.choose(null, [
          { label: '"I\'ll give it to him. I promise."', value: 'promise' },
          { label: '"Can I read it first?"', value: 'read' },
        ]);
        if (c === 'promise') {
          api.hearts('buck', 30);
          await api.narrate("You take the notebook in both hands. It's cold and a little damp, and it weighs almost nothing.");
          await api.say('buck', "Okay. Okay okay okay. If he laughs, tell me. If he doesn't, *definitely* tell me.");
        } else {
          api.hearts('buck', 15);
          await api.narrate("You read it standing in the cold glow of the bait fridge. It's short. It's the best thing you've read all year.");
          await api.say('buck', "...Well? No. Wait. Okay. Say it. No. ...Was it okay?");
          await api.narrate("You tell him it was okay. His face does something complicated.");
        }
        api.flag('buck_notebook', true);
        await api.say('buck', "Wait. Before you go. Is the minnow bucket supposed to be cold? Actually, don't answer that. I need to go lie down.");
        await api.narrate("He puts the freezer bag in your hands, shuts the fridge on the minnows, and wanders off down aisle nine like a man who's just handed over a kidney.");
      },
    },
  ],
} satisfies DialogueSet;
