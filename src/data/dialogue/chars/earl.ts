import type { DialogueSet } from '../types';

/**
 * Earl Odom, "Big Earl The Mountain". Town librarian, 6'8" monster villain,
 * gentle reader of poetry, secret author of a children's book called
 * *How to Hug a Mountain*. Romanceable.
 *
 * Public: terse, rumbling, menacing in the quietest building in America.
 * Insider: whispers, apologizes to chairs, draws the same sparrow two hundred
 * times. His reveals trigger from the library (where he actually is) and fade
 * to the back booth / locker room, the way the other rooms do.
 *
 * Flags set here: 'earl_book_read' (8), 'earl_book' = 'own' | 'pebble' (10),
 * plus 'earl_gentle_turn' (own name: seeds The Gentle Turn) or 'earl_pebble'
 * (pen name: the mystery author E. O. Pebble). Romance: 'earl_romance_onscreen'
 * / 'earl_romance_secret' (12), 'earl_proposal_ready' (14).
 */
export default {
  npc: 'earl',
  intro: [
    "(A very large man in a moss-green cardigan sits on a very small stool, holding a paperback like it might break.)",
    "Oh. Hello. Sorry. Earl. Odom. You're the new one. ...That's rude, you have a name. Birdie said it. I forgot it. I'm sorry.",
    "The Mountain is a coat. I put it on Saturdays. I'm sorry in advance for the shoulder. I'll set you down like glass.",
    "If you need a book, I have a library. If you need quiet, I have a library. Come by. Please. Sorry. Come by.",
  ],
  introPublic: [
    "(A man the size of a refrigerator looks up from the circulation desk. A tiny pencil is tucked in his beard. The room goes silent.)",
    "...Library closes at five.",
    "Cards are free. Fines are not. Return your books.",
    "...Welcome. (He says it like a threat. A shelf behind him rattles.)",
  ],
  lines: [
    // ---------------------------------------------------------------- Public: the Mountain at the desk
    { text: "Library closes at five. You have... four minutes.", when: { hearts: [0, 2], place: ['public'], map: ['library'] }, weight: 2 },
    { text: ["Shh.", "(He did not say it loudly. A shelf rattles three rows over anyway.)"], when: { place: ['public'], map: ['library'] } },
    { text: "Your book. Is overdue. By... six days. The Mountain does not forget. The Mountain has a... spreadsheet.", when: { place: ['public'], map: ['library'] } },
    { text: "A hero. In my library. Keep... your voice... down. Heroes are loud. Books are not.", when: { place: ['public'], alignment: ['face'] }, mood: 'angry' },
    { text: "A villain. Good. Overdue is overdue. Respect that, and we will not have... a problem.", when: { place: ['public'], alignment: ['heel'], flag: 'debuted' }, mood: 'smug' },
    { text: ["And then the wolf... *huffed*.", "(Twenty children hold their breath. One of them is Pip. Pip has not blinked since 10:02.)"], when: { place: ['public'], weekday: [5], time: [540, 660], map: ['library'] }, weight: 3 },
    { text: "Coach Kowalski tried to move me once. Forty-five minutes. I did not stand up. I did not... need to.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "The boy with the cardboard belt. Front row. Every Saturday. He does not blink. I... respect him. Do not tell him.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "Monday. Deliveries. The bakery van. It is... small. I am... folded. We do not speak of it.", when: { place: ['public'], weekday: [0] } },
    { text: "Tonight I climb. Everyone else... falls.", when: { showDay: true, place: ['public', 'show'] }, mood: 'angry', weight: 2 },
    { text: "(Earl is on the gazebo bench, reading. A pigeon sits on his knee. When he sees you, he sets it down. Gently. Then he glares.)", when: { place: ['public'], map: ['town'], time: [1110, 1320] } },
    { text: "The library keeps WRSL's old program logs. Fall of 1983 has a spot that never aired. 'Velvet Hammers Rematch.' Paid. Unplayed. I have read it until the page went soft.", when: { place: ['public'], hearts: [3, 10], notFlag: 'truth_revealed' }, mood: 'sad' },

    // ---------------------------------------------------------------- Public: weather and seasons
    { text: "Rain. Good. Fewer... interruptions.", when: { place: ['public'], weather: ['rain'] } },
    { text: "The sky is clearing its throat. Be quiet. It's... almost finished.", when: { place: ['public'], weather: ['storm'] } },
    { text: "Snow. A blanket. For the books. And for... the Mountain.", when: { place: ['public'], weather: ['snow'] } },
    { text: "Wind. The pages are... restless. I do not approve.", when: { place: ['public'], weather: ['wind'] } },
    { text: "Someone returned a gardening book with a pressed tulip in chapter four. I have... left it there. It is the best part of the chapter.", when: { place: ['public'], season: [0] }, weight: 2 },
    { text: "Summer reading. Forty children signed up. Thirty-nine finished. The fortieth is Pip. He is reading the wrestling almanac again. With notes. In the margins. In PEN.", when: { place: ['public'], season: [1] } },
    { text: "The leaves on the reading-room sill. Do not touch them. I am... pressing them. All of them. For... reasons.", when: { place: ['public'], season: [2] } },
    { text: "The radiator in the stacks knocks twice, then sighs. I have sat beside it every winter for nine years. We have... an understanding.", when: { place: ['public'], season: [3] } },

    // ---------------------------------------------------------------- Insider: Earl, whispering
    { text: "Hi. Sorry. About all the growling. It's a lot. I'm just going to sit down. Is this chair okay? Sorry, chair.", when: { place: ['insider'], hearts: [0, 5] }, weight: 2 },
    { text: "I apologize to chairs. I know. They don't mind. I think. They don't say.", when: { place: ['insider'] } },
    { text: "I flinch at my own pyro every Saturday. Birdie says never stop. The crowd thinks it's rage. It's a very big bang.", when: { place: ['insider'] }, mood: 'happy' },
    { text: "I look for my pencil for an hour. It's in my beard. It has been in my beard. I've never once checked the beard first.", when: { place: ['insider'] }, mood: 'happy' },
    { text: "Tiny made me thirty tiny cakes. I counted them. I ate them. I counted again. The numbers matched. A good day.", when: { place: ['insider'], hearts: [3, 10] }, mood: 'happy' },
    { text: "Lou taught me to fish. I apologize to every worm. He says that's why they bite. Out of courtesy.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "I've been reading a poem about a heron. Four lines. I've read it forty times. It gets bigger every time.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "In the Delta, my grandmother read aloud on the porch every night. Whole street came. Storytime isn't a gimmick. It's an inheritance.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "You're new, so: sell big for me. I can't really *throw* you. I mostly lower you. Fall like it hurts and I'll make it look good.", when: { place: ['insider'], rank: ['rookie', 'opener'] } },
    { text: "Main event. Be gentle with the small ones on the way up. They get big. Everybody does, eventually.", when: { place: ['insider'], rank: ['main', 'assistant', 'pencil', 'owner'] } },
    { text: "Show day. My hands are shaking. Don't tell the Mountain. He thinks he's made of stone.", when: { place: ['insider'], showDay: true }, mood: 'sad' },
    { text: "Rain on the library roof is the best sound there is. Better than pyro. Hank would argue. Hank argues with rain.", when: { place: ['insider'], weather: ['rain'] } },
    { text: ["You and {opponent}. I watched from the curtain with my fingers in my ears for the pyro.", "You went over the top rope like a... dropped coat. A good coat. Sorry. It was a compliment. It sounded better in my head."], when: { place: ['insider'], lastMatch: { maxDaysAgo: 3 } } },
    { text: "I set you down like glass. I counted. One, two, glass. Are your shoulders... alright? I think about the shoulders.", when: { place: ['insider'], lastMatch: { won: false, opponent: ['earl'], maxDaysAgo: 5 } }, mood: 'sad' },
    { text: "You beat the Mountain. The Mountain has... feelings about it. Earl is very proud of you. Earl had pie.", when: { place: ['insider'], lastMatch: { won: true, opponent: ['earl'], maxDaysAgo: 5 } }, mood: 'happy' },
    { text: "The Mountain... remembers {venue}. The Mountain... is not finished with you.", when: { place: ['public'], lastMatch: { won: true, opponent: ['earl'], maxDaysAgo: 7 } }, mood: 'angry' },
    { text: "It's late. The library at night is full of people. They're all inside the books. Don't say hi. They're shy.", when: { time: [1320, 1560] }, weight: 2 },

    // ---------------------------------------------------------------- Close: the sparrow, the book
    { text: "A person my size learns to take up less room. Then Birdie says, take up *all* of it, on Saturdays. Nicest thing anyone ever said to me.", when: { place: ['insider'], hearts: [6, 10] } },
    { text: "I'm working on something. A small thing. ...No. Not yet. It isn't done being small.", when: { place: ['insider'], hearts: [5, 7], notFlag: 'earl_book_read' } },
    { text: "You're the only one who's heard the whole book. Tiny can't know. She'll want to bake it.", when: { flag: 'earl_book_read', place: ['insider'], notFlag: 'earl_book' }, mood: 'happy' },
    { text: "The crowd cheered me Saturday. I didn't know what to do with my hands. Dex had to show me. Over the head, he said. Like a person.", when: { flag: 'earl_gentle_turn', place: ['insider'] }, mood: 'happy', weight: 2 },
    { text: "'E. O. Pebble.' It's a good name. Small. Round. Fits in a pocket. Sheriff Bev cried at the window display. I cried in the stacks. Quietly.", when: { flag: 'earl_pebble', place: ['insider'] }, mood: 'happy', weight: 2 },
    { text: "Sheriff Bev asked me for a pen. She says she wants to arrest whoever wrote the sparrow book for making her cry on duty. I... said I'd look into it.", when: { flag: 'earl_pebble', place: ['public'] } },
    { text: "People ask me how a monster wrote a sparrow. I tell them the Mountain has... a lot of room. Birds like room.", when: { flag: 'earl_gentle_turn', place: ['public'] }, mood: 'sad' },

    // ---------------------------------------------------------------- Dating
    { text: "(Earl slides a napkin across the table. A tiny pencil drawing: two figures, one very large, a sparrow on his shoulder.)", when: { place: ['insider'], dating: true }, mood: 'love', weight: 2 },
    { text: "(He orders tea like a threat.) 'Tea. Hot. Now.' ... 'Two.' ... (Whispered, to the waitress's retreating back.) 'Please.'", when: { place: ['public'], dating: true, map: ['diner'] }, weight: 2 },
    { text: "(He shushes you across the library with his entire face. It is a shush that means *I'm glad you're here*. You can tell by the pause.)", when: { place: ['public'], dating: true, map: ['library'] }, weight: 2 },
    { text: "I have a shush that means 'I'm thinking about you.' It's a very small shush. I've been using it all week. Nobody has noticed.", when: { place: ['insider'], dating: true }, mood: 'love' },

    // ---------------------------------------------------------------- After the story
    { text: "I read to the Evening Bell on Sundays now. A small woman in a lavender cardigan critiques my pacing. She says I rush the dramatic pause. I have never rushed anything in my life.", when: { flag: 'grandma_in_town', place: ['insider'] }, mood: 'happy' },
    { text: "I put on the Mountain, and I look at the front row, and there's a woman in a plum robe standing up. It's very hard to be menacing in that light.", when: { flag: 'reunion_done', place: ['insider'] }, mood: 'happy' },

    // ---------------------------------------------------------------- Family
    { text: "You can stay as long as you like. That's... the whole library policy, actually. I should have put it on a sign.", when: { hearts: [9, 14], place: ['insider'] }, mood: 'love' },
    { text: "When people cross the street, I used to think it was fear. Now I think some of them are just making room for me. I'd like to believe that. You helped.", when: { hearts: [9, 14], place: ['insider'] } },
  ],
  gifts: {
    loves: ['wildflowers', 'tiny-cake', 'teacup'],
    likes: ['honey', 'comic', 'old-program', 'river-stone', 'cassette'],
    dislikes: ['protein-shake', 'paperback', 'foam-finger'],
  },
  giftReplies: {
    love: [
      "(He holds it in both hands, the way you'd hold a baby bird. His glasses fog.) This goes in the good drawer. The one with the sparrows.",
      "Oh. Oh no. I'm going to be... I need a minute. Sorry. Please keep talking so I can pretend I'm not doing this.",
      "Nobody gives me things that are the right size. This is the right size. How did you know? ...Don't answer. I want it to stay a mystery.",
    ],
    like: [
      "Thank you. That's very kind. I'll take good care of it. I take good care of everything. It's a condition.",
      "A gift. For me. (He glances around the library for the person you must have meant.) ...Thank you.",
      "That's lovely. I'll put it where I can see it. Between the sparrows and the stapler.",
    ],
    neutral: [
      "Oh. Thank you. I'll find a shelf. Everything has a shelf.",
      "That's thoughtful. I'm not sure what it is. I'll shelve it under 'thoughtful.'",
    ],
    dislike: [
      "...Oh. Thank you. I will put this somewhere. Far. Sorry. Not sorry. Sorry.",
      "(He holds it at arm's length, wearing the expression he saves for dog-eared pages.) It's the thought. It is. I'm *sure* it is.",
      "Please don't take this the wrong way. I'm going to put this in the donation bin. Gently. With an apology.",
    ],
    birthday: [
      "My birthday. Usually I sit in the library after close with a cake I bought myself. Tiny sends thirty small ones. And now a {item}. I'm... going to have to sit on the floor.",
      "The eighth of fall. The leaves are at their best. (He holds the {item} up to the window light, as though it might have a watermark.) ...Thank you. Truly.",
    ],
    byItem: {
      wildflowers: "From the creek bank. The little blue ones are speedwell. The yellow ones are... I don't know. I'm going to find out. Tonight. In the botany section.",
      'tiny-cake': ["(He holds it on one fingertip.) Thirty is a reasonable number of these. One is... a gift.", "I am going to eat it in two bites. Tiny says one. Tiny is wrong. It deserves two."],
      teacup: "Chipped. Floral. Just big enough for chamomile and one... small sorrow. I'll use it at the desk. The Mountain does not drink from teacups. Earl does.",
      honey: "Honey. For the chamomile. The chamomile has been very lonely.",
      comic: "Wrestle-Bot vs. The Moon. ...I am going to file this under astronomy, and wait to see who finds it.",
      'old-program': "1979. Look at the program's typeface. Someone chose it on purpose. I'll put it in the archive box marked DO NOT LEND. It's a small box.",
      'river-stone': "Smooth. Cool. It fits my palm. Most things don't. I'll use it as a paperweight for the sparrow drawings.",
      cassette: "A mixtape. I'll play it at the desk after close. Quietly. Very quietly. The library has... rules, and I wrote some of them.",
    },
    later: [
      "The {lastGift} is on the circulation desk. A child asked if it was overdue. I said it was... on loan. Permanently.",
      "I drew the {lastGift}. Next to a sparrow. The sparrow is looking at it. I think the sparrow approves.",
    ],
  },
  again: [
    "(Earl lifts one huge hand an inch off the desk. Hello again. Quietly.)",
    "Sorry. I'm... reshelving. Talk while I walk? I walk very slowly in the poetry section.",
    "Still here. Me too. Five more minutes until close. You can... stay for them.",
  ],
  idle: [
    "(Earl is stamping return dates with enormous care. Each one lands exactly straight.)",
    "...Shh. (It's a friendly shush. You can tell by the pause.)",
  ],
  birthday: { season: 2, day: 8 },
  events: [
    // ---------------------------------------------------------------- 2: The shush
    {
      id: 'earl-2', hearts: 2, map: 'library', title: 'The Shush',
      script: async (api) => {
        await api.narrate("The Turnbuckle Alley Public Library. Quiet as a held breath. You push the heavy door and return a book you haven't finished.");
        await api.narrate("Behind the desk, something large looks up. Then it keeps looking up, and up, and up.");
        await api.sayMood('earl', 'angry', "Shhh.");
        await api.narrate("You hadn't said a word. The sound rolls out of him like a landslide. Three spines fall over on the nearest shelf.");
        await api.say('earl', "Library... closes at five. You have four minutes. Choose... wisely.");
        await api.narrate("You grab the first book in reach. He stamps it so gently the stamp makes no sound at all.");
        await api.say('earl', "Due in two weeks. Do not. Dog-ear.");
        await api.narrate("Outside on the steps, you open the book. A bookmark falls out. A thin strip of paper, in tiny, perfect handwriting:");
        await api.narrate("*sorry about the shush. welcome to town. (E.)*");
        const c = await api.choose('Through the window, a very large man is pretending not to watch you read it.', [
          { label: 'Write "great shush, thank you" on the back and post it through the return slot', value: 'reply' },
          { label: 'Give him a little wave through the glass', value: 'wave' },
          { label: 'Go back in and loudly call him a big softie', value: 'softie' },
        ]);
        if (c === 'reply') {
          api.hearts('earl', 30);
          await api.narrate("You slide the slip through the return slot. Through the window you watch a giant pick it up, read it, and put one huge hand over his mouth.");
          await api.narrate("Then he checks the empty room, one corner at a time, to make sure nobody saw him smile.");
        } else if (c === 'wave') {
          api.hearts('earl', 15);
          await api.narrate("You wave. He freezes. Slowly, one enormous hand lifts about an inch off the desk. That's a wave. It's the smallest wave you've ever seen.");
          await api.narrate("You will think about it all week.");
        } else {
          api.hearts('earl', -10);
          await api.narrate("You push back through the door and announce, to a full reading room, that the Mountain is a big softie.");
          await api.sayMood('earl', 'angry', "The Mountain... is not... soft.");
          await api.narrate("Nine patrons look at you. One of them is Mayor Oakes. Earl won't meet your eyes for the rest of the day, and you suspect it's not the act.");
        }
      },
    },
    // ---------------------------------------------------------------- 4: Two hundred sparrows
    {
      id: 'earl-4', hearts: 4, map: 'library', title: 'Two Hundred Sparrows',
      script: async (api) => {
        await api.narrate("At closing, Earl flips the sign and tilts his head at the door. Just a quarter of an inch. You've learned to read it: *Hot Tag. Back booth.*");
        await api.fade();
        await api.narrate("The back booth. June has already set down a pot of chamomile and a plate of nothing, and then she vanishes. Earl wedges himself in. The booth creaks. He apologizes to it.");
        await api.say('earl', "I'm going to show you something stupid. You can laugh. People laugh. It's okay.");
        await api.narrate("He sets a battered sketchbook on the table and opens it, slowly, like a surgeon. Page after page, a small brown bird. Hundreds of them.");
        await api.say('earl', "Two hundred. Give or take. Same sparrow. I draw her every night. I can't get her to look... brave.");
        await api.say('earl', "Wings are easy. Brave is... hard. Which one looks brave?");
        const c = await api.choose('He turns the pages. Three of them are paper-clipped.', [
          { label: 'The one with her chest puffed out', value: 'puffed' },
          { label: 'The one with one foot lifted, eyes wide, beak open', value: 'shaky' },
          { label: 'The tiny one perched on the edge of a huge dark shape', value: 'small' },
        ]);
        if (c === 'puffed') {
          api.hearts('earl', 15);
          await api.say('earl', "Puffed up. Showing off. That's a Mountain kind of brave. I like it. But I think she's only pretending in that one.");
        } else if (c === 'shaky') {
          api.hearts('earl', 30);
          await api.sayMood('earl', 'surprised', "...Yes. That one. She's scared. Look at her foot. And she's going anyway.");
          await api.say('earl', "I drew that my first week here. Ten years ago. A motel off the highway, the night after I carried the card catalog up the library steps and Birdie was waiting at the top.");
        } else {
          api.hearts('earl', 30);
          await api.sayMood('earl', 'surprised', "The little one. On the big shape. That's her on the mountain. ...How did you know that's the one I can't draw?");
        }
        await api.say('earl', "Please. Nobody can know. The Mountain doesn't draw birds.");
        await api.narrate("He closes the sketchbook. Then, very carefully, he tears out the page you picked and slides it across the table.");
        api.flag('earl_sparrow', c);
        await api.say('earl', "Keep it. So there's a copy that isn't in my head.");
      },
    },
    // ---------------------------------------------------------------- 6: The only place being big is useful
    {
      id: 'earl-6', hearts: 6, map: 'library', title: 'A Coat I Put On',
      script: async (api) => {
        await api.narrate("Closing time. Earl doesn't flip the sign. He stands at the door with his coat in his hands, not putting it on.");
        await api.say('earl', "Walk with me? The Sportatorium. The locker room. I need somewhere... quiet that isn't quiet *here*.");
        await api.fade();
        await api.narrate("The locker room, empty. Earl sits on a bench. The bench creaks. He says 'sorry' to the bench and doesn't notice that he did.");
        await api.say('earl', "I was twelve. Six-foot-four. A substitute teacher called the principal because there was a 'grown man' in the back of sixth grade.");
        await api.say('earl', "People started crossing the street. I started walking on the edge of the sidewalk so I'd take up less. I got very good at it.");
        await api.say('earl', "When Birdie said, 'take up *all* of it on Saturdays,' I thought she was joking. She wasn't.");
        await api.sayMood('earl', 'sad', "The Mountain is the only place being big is useful. Everywhere else I'm just trying not to knock things over.");
        const c = await api.choose(null, [
          { label: 'Sit down on the bench next to him. It creaks. You both ignore it.', value: 'sit' },
          { label: '"You take up exactly as much room as you\'re supposed to."', value: 'room' },
          { label: '"Then lean into it. People respect big."', value: 'lean' },
        ]);
        if (c === 'sit') {
          api.hearts('earl', 30);
          await api.narrate("You sit. The bench protests. You both ignore it. After a minute, he lets out a breath so long it ruffles a flyer on the wall.");
          await api.say('earl', "Thank you. Nobody's ever... sat *with* me. They sit near. It's not the same.");
        } else if (c === 'room') {
          api.hearts('earl', 30);
          await api.narrate("He turns the sentence over like a leaf. Then he takes off his tiny glasses and wipes them on his cardigan, though there's nothing on them.");
          await api.say('earl', "...Exactly as much. I'm going to think about that on the walk home. I might think about it for a month.");
        } else {
          api.hearts('earl', -10);
          await api.narrate("He nods slowly, like he's heard it before. Probably he has.");
          await api.say('earl', "People... respected it. They also crossed the street. Thank you for the advice.");
          await api.narrate("He says it like a polite door closing. He puts his coat on and says nothing else for a long time.");
        }
        await api.say('earl', "I'm okay. Really. The Mountain's good work. I just wanted somebody to know what's under the coat.");
        await api.narrate("When he stands, the bench sighs with relief. He says 'sorry' to that, too.");
      },
    },
    // ---------------------------------------------------------------- 8: How to Hug a Mountain
    {
      id: 'earl-8', hearts: 8, map: 'library', title: 'How to Hug a Mountain',
      script: async (api) => {
        await api.narrate("A manila folder sits on the circulation desk. A sticky note: BACK BOOTH. 9 P.M. COME ALONE. (E.) The 'alone' is underlined three times, then crossed out, then re-underlined.");
        await api.fade();
        await api.narrate("The back booth. June has been asked to turn off the jukebox. She does, and then stays at the counter, polishing the same glass, not even pretending not to listen.");
        await api.say('earl', "It's finished. Eighteen pages. I... would like to read it to somebody. Out loud. For the first time.");
        await api.narrate("He reads in a whisper so soft that June leans over the counter to hear. It sounds like someone telling a secret to a candle.");
        await api.say('earl', "'Once there was a mountain nobody climbed, because it looked too scary. Its shadow covered a valley, and the valley held its breath.'");
        await api.say('earl', "'One spring, a sparrow landed on the mountain's shoulder. \"Aren't you afraid of me?\" asked the mountain. \"Terrified,\" said the sparrow. \"But you have the best view.\"'");
        await api.narrate("He turns the pages. The sparrow builds a nest in the crook of the Mountain's shoulder. The valley slowly breathes out. By the last page, Earl is gripping the folder with both hands.");
        await api.say('earl', "'And the mountain, who had never once been held, stood very still, the way you do when something small trusts you. And that is how to hug a mountain. You don't squeeze. You...'");
        await api.narrate("His voice gives out. He tries again. It comes out as air. He tries a third time, and just puts his huge hand flat on the page.");
        const c = await api.choose(null, [
          { label: 'Wait. Say nothing. Let him have the ending.', value: 'wait' },
          { label: 'Say the last two words for him, very quietly', value: 'say' },
          { label: 'Ask what the sparrow\'s name is', value: 'name' },
        ]);
        if (c === 'wait') {
          api.hearts('earl', 30);
          await api.narrate("You wait. Behind the counter, June's polishing stops. Earl takes a long, shaky breath.");
          await api.sayMood('earl', 'sad', "You stay.");
          await api.narrate("That's all he says. It's enough.");
        } else if (c === 'say') {
          api.hearts('earl', 15);
          await api.say('player', "...You stay.");
          await api.narrate("He nods, eyes shining, and closes the folder. He's grateful. But you suspect the ending was his to say, and you took the one thing from him he'd carried the longest.");
        } else {
          api.hearts('earl', 30);
          await api.sayMood('earl', 'surprised', "She doesn't have one. I never... she's just 'her.' Do you think she'd want one?");
          await api.say('earl', "I'll let her pick. When she's ready. Thank you for asking *her*, and not me.");
        }
        api.flag('earl_book_read', true);
        await api.narrate("As you leave, June sets a slice of pie in front of Earl without a word and goes to wipe a table that is already clean. She wipes it for a long time.");
      },
    },
    // ---------------------------------------------------------------- 10: Own name, or Pebble
    {
      id: 'earl-10', hearts: 10, map: 'library', title: 'E. O. Pebble',
      script: async (api) => {
        await api.narrate("The library after hours. Chairs up on the tables, the sign turned. Earl waits at the circulation desk with an envelope with a Memphis postmark.");
        await api.say('earl', "A children's press. They want it. They want... *Sparrow.* They said it twice. They said it is 'a rare thing.'");
        await api.say('earl', "The letter has one question. 'Author name?' And I've been standing here for an hour.");
        await api.say('earl', "If it's my name, the Mountain has to change. The town will ask how a monster wrote a sparrow. Maybe the Mountain turns. Maybe... they cheer.");
        await api.say('earl', "If it's a pen name, the Mountain stays whole. Nobody has to be afraid of anyone. And somebody called someone else gets to be gentle in public.");
        await api.narrate("He lays both hands flat on the desk. Even sitting, he's looking nearly level with you.");
        await api.sayMood('earl', 'sad', "People usually decide this kind of thing for me by being scared. I'd like to try deciding it with somebody who isn't.");
        const c = await api.choose('Earl waits. The radiator ticks.', [
          { label: 'Put your own name on it. Let them see Earl.', value: 'own' },
          { label: 'A pen name. Keep the Mountain whole.', value: 'pebble' },
        ]);
        if (c === 'own') {
          api.hearts('earl', 30);
          api.flag('earl_book', 'own');
          api.flag('earl_gentle_turn', true);
          await api.narrate("He picks up a pen. His hand is shaking so badly he has to hold his wrist with the other hand. 'Earl Odom,' he writes, very carefully, in the box.");
          await api.say('earl', "On Saturday Gus is going to say something. I don't know what. Birdie's going to have an idea. She's had this idea for ten years.");
          await api.sayMood('earl', 'happy', "I have no idea what to do with my hands. Please never leave. I'm going to need someone to show me.");
        } else {
          api.hearts('earl', 30);
          api.flag('earl_book', 'pebble');
          api.flag('earl_pebble', true);
          await api.narrate("He picks up a pen, thinks, and smiles for the first time all night. 'E. O. Pebble,' he writes in the box.");
          await api.say('earl', "A pebble's small. And round. And a mountain's mostly pebbles, if you think about it.");
          await api.sayMood('earl', 'happy', "When it's in the library window, I'll stand across the street. In a hat. Nobody will ever know the Mountain is crying at a book.");
        }
        await api.narrate("He seals the envelope. Then he sets his huge hand on top of it, and it stays there a long time, as if it might fly away.");
        await api.say('earl', "Thank you. For the question. Not the answer. The question.");
      },
    },
    // ---------------------------------------------------------------- 12: The Hot Tag, in character
    {
      id: 'earl-12', hearts: 12, map: 'library', when: { dating: true }, title: 'Tea. Hot. Now.',
      script: async (api) => {
        await api.narrate("A note is taped to the circulation desk in neat block letters: HOT TAG. SEVEN. BRING NO BOOKS. (E.)");
        await api.fade();
        await api.narrate("The Hot Tag Diner, front booth. Every head in the room turns. Earl sits in a freshly ironed cardigan, glaring at the napkin dispenser like it's offended him.");
        await api.narrate("A new waitress approaches, pad shaking in her hand.");
        await api.sayMood('earl', 'angry', "Tea. Hot. Now.");
        await api.narrate("She flees. He lets out a breath through his nose that ruffles three menus.");
        await api.narrate("Something nudges your knee under the table. A folded napkin. On it, in pencil: two small figures at a table, a sparrow on the big one's shoulder.");
        await api.narrate("Then another. And another. By the time the tea arrives (delivered by June herself, with a face like she's seen a ghost), there are thirteen.");
        const c = await api.choose('Above the table, the Mountain is glaring at the sugar bowl. Under it, his hand is shaking.', [
          { label: 'Reach under the table and hold his hand', value: 'hand' },
          { label: 'Draw one back on a napkin', value: 'draw' },
          { label: 'Hold the glare. Stay in character. Make a toddler cry.', value: 'glare' },
        ]);
        if (c === 'hand') {
          api.hearts('earl', 30);
          await api.narrate("A hand that holds library books like matchbooks closes around yours as carefully as it has ever closed around anything.");
          await api.narrate("Above the table, he glares at the sugar bowl as if it owes him money.");
        } else if (c === 'draw') {
          api.hearts('earl', 30);
          await api.narrate("You sketch something awful. A lumpy Mountain with a lumpy You on its shoulder. You slide it under.");
          await api.narrate("A long silence. Then, from across the table, a very quiet sound that's definitely not a sob.");
        } else {
          api.hearts('earl', 15);
          await api.narrate("You glare. He glares. A child in the next booth bursts into tears. Under the table, a fourteenth drawing arrives: the two of you, glaring, with a sparrow looking mortified.");
        }
        await api.fade();
        await api.narrate("Later, the back booth, tea cold. Earl has finally rolled up his sleeves. His voice has dropped to the whisper you've come to love.");
        await api.say('earl', "Birdie asked me a question. She asks everybody. Do we... tell the town?");
        await api.say('earl', "On-screen: 'The Mountain Has a Weakness.' The whole town finds out. Bev would probably want to arrest... the weakness. Clementine would write a review of it.");
        await api.say('earl', "Or it's ours. And we have whole conversations in library shushes. I have a shush that means 'I'm thinking about you.' I've been using it all week.");
        const s = await api.choose('How should the romance live?', [
          { label: 'On-screen: "The Mountain Has a Weakness"', value: 'on' },
          { label: 'Secret: just us, in shushes', value: 'secret' },
        ]);
        if (s === 'on') {
          api.flag('earl_romance_onscreen', true);
          await api.sayMood('earl', 'happy', "Oh, no. Oh, that's going to be so loud. ...Okay. Let them be loud. I'll be quiet right next to you.");
        } else {
          api.flag('earl_romance_secret', true);
          await api.sayMood('earl', 'love', "Ours, then. (A shush, almost too soft to hear.) That one. That one means yes.");
        }
      },
    },
    // ---------------------------------------------------------------- 14: A new last page
    {
      id: 'earl-14', hearts: 14, map: 'library', when: { dating: true }, title: 'A Second Sparrow',
      script: async (api) => {
        await api.narrate("The library, long after closing. Earl is waiting by the door, in the cardigan with the best elbow patches, holding a single sheet of paper.");
        await api.say('earl', "Walk with me. The locker room. Just for a minute. I want to read you something where the walls have heard the worst of me and kept it.");
        await api.fade();
        await api.narrate("The locker room, one light on. He sits. The bench creaks. For once, he doesn't apologize to it.");
        await api.say('earl', "The book has a new last page. I wrote it Tuesday. I didn't show Gideon. I didn't show Tiny. It isn't for a press.");
        await api.say('earl', "'The next spring, the sparrow came back to the mountain's shoulder. She'd brought somebody. \"This is the one I told you about,\" she said.'");
        await api.say('earl', "'And the mountain, who had never held anything in his life, found that he was holding two.'");
        await api.narrate("His voice goes. This time he doesn't try to get it back. He hands you the page and lets the rest be quiet.");
        await api.say('earl', "'You don't squeeze. You stay. And if you're lucky, somebody stays back.'");
        const c = await api.choose(null, [
          { label: 'Take his hand and say "I\'m staying"', value: 'stay' },
          { label: 'Tell him he wrote it perfectly', value: 'perfect' },
        ]);
        if (c === 'stay') {
          api.hearts('earl', 30);
          await api.narrate("His hand closes around yours the way you hold a bird that has decided to trust you.");
          await api.sayMood('earl', 'love', "That's the first time anyone has ever said that to me and meant it in the right direction.");
        } else {
          api.hearts('earl', 15);
          await api.sayMood('earl', 'happy', "Thank you. I rewrote the 'two' thirty times. It was always going to be two.");
        }
        await api.say('earl', "Hank's been braiding a rope. I'm told it's a rope you hold out. On the apron. Like a tag. I'm very good at being tagged. I just... stand there. And let it land.");
        await api.say('earl', "When you're ready. I'll have already apologized to the ring ropes. Take your time. Mountains are good at waiting.");
        api.flag('earl_proposal_ready', true);
      },
    },
  ],
} satisfies DialogueSet;
