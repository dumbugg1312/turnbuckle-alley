import type { DialogueSet } from '../types';

/**
 * Clementine Beaulieu, 31. Editor, reporter, photographer, typesetter and
 * delivery person of the Turnbuckle Tattler, the town's only critic. Writes
 * devastating reviews because she cares too much. Her great-aunt Lavinia
 * founded the paper in 1961 and writes her a letter about commas every week
 * from the Evening Bell. A mark and romanceable: at 14 hearts she comes
 * through the curtain (flag 'clem_curtain') and discovers she's been
 * reviewing theater for nine years, and was right.
 */
export default {
  npc: 'clementine',
  intro: [
    "Hold still. Don't smile. Smiling is for brochures. (A camera shutter clicks.)",
    "Clementine Beaulieu. Editor, reporter, photographer, typesetter and delivery of the Turnbuckle Tattler. Yes. All of them.",
    "You're the new wrestler. The town wants to know three things. Who you are, what you want, and whether you can sell a comeback.",
    "I'll find out the first two myself. The third I'll see from press row. (She taps her pencil against your chest like a sword.)",
    "Don't disappoint me. I'll print it.",
  ],
  lines: [
    // ---------------------------------------------------------------- the paper
    { text: ["I don't give stars. Matches earn them.", "Some matches earn negative stars, but the press won't print a minus sign. I've asked."], mood: 'smug' },
    { text: "The Tattler's printed on a 1962 press in the basement. It's older than the Mayor and twice as stubborn." },
    { text: ["My great-aunt Lavinia founded the Tattler in 1961. She lives at the Evening Bell now.", "She writes me a letter every week about my commas."] },
    { text: ["Lavinia's letter this week: 'Dear Editor, your Oxford comma is a cry for help.'", "Signed 'A Concerned Reader.' Every week. Like I don't know her handwriting."], mood: 'angry' },
    { text: "Call me 'the paper girl' one more time and your name goes in the lost-and-found column. Under 'manners, missing.'", mood: 'angry', when: { hearts: [0, 4] } },
    { text: "Don't say 'content' in my office. We print stories. Content is what you find at the bottom of a drawer.", mood: 'angry' },
    { text: "Gorgeous Gideon keeps my reviews in a folder labeled LIES. I know because he showed me. Twice. Slowly." },
    { text: "Gus reads my reviews on the radio in a voice like a rainy Tuesday. It doubles their impact. I've never thanked him." },
    { text: "I panned the Mountain's match and raved about the library's new poetry display in the same issue. Both reviews were correct." },
    { text: "This week's front page: the zoning board, a bake sale result, and the goat on the church roof. The goat is doing well. Quote to follow." },
    { text: ["When a storyline drags, I call it a snooze. In print. Everyone reads it, wrestlers included.", "Somebody has to tell the truth about tension."] },
    { text: ["The archive in the basement goes back to 1961. Every issue.", "November 1983 is the one people ask about. VELVET BETRAYAL. Lavinia wrote it."] },
    { text: "Agnes Pickett has sent the Tattler a letter about refereeing every week since 1971. I've run four hundred of them. She considers that half." },
    { text: "Your first match is the one I'll remember you by. No pressure. I'll be in press row with a sharpened pencil and no mercy.", when: { notFlag: 'debuted' } },

    // ---------------------------------------------------------------- reviews of you
    { text: ["{stars} stars, you and {opponent}. The heat segment dragged and the comeback was rushed.", "The {finisher}, however, was journalism."], when: { lastMatch: { maxStars: 3, maxDaysAgo: 3 } }, mood: 'smug' },
    { text: "The VFW review is set. {stars} stars for you and {opponent}. You looked at the bingo board during the heat. I saw it. Agnes saw it. The bingo board saw it.", when: { lastMatch: { venue: ['vfw'], maxDaysAgo: 2 } } },
    { text: "Tomorrow's headline is already typeset. I won't say what it says. I'll say it has an exclamation point. I don't hand those out.", when: { lastMatch: { venue: ['sportatorium'], minStars: 3.5, maxDaysAgo: 1 }, hearts: [3, 14] }, mood: 'happy' },
    { text: ["{opponent} beat you and I gave it {stars} stars. Readers wrote in. Two of them were furious with me.", "One was Agnes. The other was also Agnes, on her nephew's stationery."], when: { lastMatch: { won: false, minStars: 3, maxDaysAgo: 4 } } },

    // ---------------------------------------------------------------- weekly rhythm
    { text: "Print night. I'll be in the basement till two. If you hear swearing, it's the press. If you hear crying, it's also the press.", when: { weekday: [3] } },
    { text: "Delivered four hundred papers by bicycle before six. Agnes was waiting at her curb with a correction. Before the paper landed.", when: { weekday: [4], time: [360, 720] } },
    { text: "Sunday. I'm off to receive Lavinia's letter in person. She likes to watch me read it. She likes to watch me wince.", when: { weekday: [6] } },
    { text: "Scrabble at the library tonight. Earl beats me every week with words like 'qi.' In silence. Menacingly. I can't concentrate.", when: { weekday: [1] } },
    { text: "Show day. Press row, front left, sharpened pencils in a cup. Somebody's going to earn a headline tonight. Somebody else, a snooze.", when: { showDay: true } },

    // ---------------------------------------------------------------- alignment
    { text: "Heroes are easy to write. Everybody roots for them. The trick is making them interesting. You're interesting. That's an assessment.", when: { alignment: ['face'] } },
    { text: "You've turned villain. Good. Villains give better quotes. Say something terrible. I'll set it in bold.", when: { alignment: ['heel'], hearts: [3, 14] }, mood: 'smug' },
    { text: ["Your turn on that poor boy was the cheapest, most cowardly thing I've seen in that building.", "The headline's already set. You earned every letter."], when: { alignment: ['heel'], hearts: [0, 5], flag: 'debuted' }, mood: 'angry' },
    { text: "I wrote three paragraphs on your heel turn and cut all three. 'Shocking' is lazy. You weren't lazy. You were ruthless. Four stars.", when: { alignment: ['heel'], hearts: [6, 14] } },
    { text: "Readers write in about you. Half say hero, half say villain. Agnes says both, underlined twice.", when: { alignment: ['tweener'] } },

    // ---------------------------------------------------------------- rank
    { text: "Openers are a critic's favorite secret. Nobody's watching yet, so everybody tries. Don't stop trying when they start watching.", when: { rank: ['rookie', 'opener'], flag: 'debuted' } },
    { text: "Main event. Bigger font. Front page. Every mistake you make now, I'll spell correctly.", when: { rank: ['main', 'assistant', 'pencil', 'owner'] }, mood: 'smug' },

    // ---------------------------------------------------------------- seasons and weather
    { text: "The Thaw Brawl issue is my biggest of the year. I'll sell out. Then the Tattler will lose money anyway, but proudly.", when: { season: [0] } },
    { text: "The zoning board woke up the same week as the bear. Both are angry about the creek. I have never had so much to write about at once.", when: { season: [0] }, mood: 'happy' },
    { text: "Spring rain gets into the press room. Everything prints with a slight lean, like the paper's tired of standing up.", when: { season: [0], weather: ['rain'] } },
    { text: "Fairgrounds Fury. I cover it from the grandstand with funnel cake on my notebook. Every summer review smells like powdered sugar.", when: { season: [1] } },
    { text: "Harvest Havoc is where feuds come to finish. I've already written three headlines. I'll use one. The others go in a drawer.", when: { season: [2] } },
    { text: "Homecoming. The Hall of Fame issue. I write every induction like it's the most important thing I'll ever write. Then I cry at the press.", when: { season: [3] } },

    // ---------------------------------------------------------------- hearts
    { text: "You're becoming a recurring character in my paper. Readers ask about you. I tell them I'm 'monitoring the situation.'", when: { hearts: [3, 5] } },
    { text: ["I had an offer from a city paper once. Captions. For photos of salads.", "I came home on the bus and reviewed a pie. Four stars. It made me so happy I had to lie down."], when: { hearts: [3, 14] } },
    { text: ["I keep a carbon of every issue in the basement. Four hundred boxes.", "When the furnace floods, I carry 1983 upstairs first. Then the rest. Then the cat, who is fine, and furious."], when: { hearts: [6, 14] } },
    { text: ["I've been writing a mystery novel for six years. About a small-town editor who solves crimes.", "Nobody calls her the paper girl. It's fiction."], when: { hearts: [6, 14] } },
    { text: "Lavinia asked about you. 'Is that the one you keep mentioning?' I said I don't keep mentioning anyone. She circled 'keep' in red.", when: { hearts: [6, 14] }, mood: 'surprised' },
    { text: "That quarter-page ad of yours is still running. It's the only ad we have that people clip out. I don't know how I feel about that.", when: { flag: 'clem_ad' } },
    { text: "I'm still not over you reading my margins. Nobody reads my margins. The margins are where I keep the screaming.", when: { flag: 'clem_notebook' }, mood: 'love' },

    // ---------------------------------------------------------------- dating
    { text: "Press row is better with you in it. Even when you're in the ring. Especially then. I review you twice as hard. It's affection.", when: { dating: true }, mood: 'love' },
    { text: "I wrote a sentence about you last night and threw out the whole notebook. Not because it was bad. Because it was good.", when: { dating: true }, mood: 'love' },
    { text: "Our dates count as research. I've filed every one of them under 'Features.'", when: { dating: true }, mood: 'smug' },
    { text: ["When you get hurt in there, my handwriting goes. Just stops. I have a page from last month that's one long line.", "Be more careful. That's an editorial."], when: { dating: true, notFlag: 'clem_curtain' }, mood: 'sad' },

    // ---------------------------------------------------------------- through the curtain
    { text: ["Nine years of reviewing theater. I was RIGHT.", "Every 'that felt rehearsed' was a compliment and I didn't even know it."], when: { flag: 'clem_curtain', place: ['insider'] }, mood: 'happy' },
    { text: "I'm issuing private corrections. Gideon's Hair Match from three years ago? I owed him a full star. He wept. He wants it in writing.", when: { flag: 'clem_curtain', place: ['insider'] }, mood: 'smug' },
    { text: "Gus lets me do color now. I said 'this is a clinic' on air and Birdie gave me a thumbs-up through the curtain. I'm unbearable about it.", when: { flag: 'clem_curtain', place: ['insider'] }, mood: 'happy' },
    { text: "In public I still review it all as a sporting event. Same voice, same stars. It's the best-kept secret I've ever been trusted with.", when: { flag: 'clem_curtain', place: ['insider'] } },

    // ---------------------------------------------------------------- the main story
    { text: ["Lavinia told me she once ran a two-inch item small, on purpose, 'so only the right person would find it.'", "She wouldn't say who. She's ninety-four. She's earned a secret."], when: { flag: 'truth_revealed', hearts: [4, 14] } },
    { text: "Homecoming headline: VELVET HAMMERS WIN. No question mark. I set the type an hour before the bell. Never been so sure of anything.", when: { flag: 'reunion_done' }, mood: 'happy' },

    // ---------------------------------------------------------------- married
    { text: "Married. To a wrestler. Lavinia's letter said, 'About time. Also fix your semicolons.' That's her blessing.", when: { married: true }, mood: 'love' },
    { text: "Our wedding got five stars in the Tattler. I recused myself. Lavinia wrote the review. She docked half a star for my veil.", when: { married: true }, mood: 'smug' },
  ],
  gifts: {
    loves: ['paperback', 'polaroid', 'bouquet'],
    likes: ['old-program', 'coffee', 'teacup', 'pie', 'wildflowers', 'cassette', 'concha', 'vinyl'],
    dislikes: ['gas-hotdog', 'scrap', 'foam-finger', 'fiber'],
  },
  giftReplies: {
    love: [
      "Oh. Oh, I'm going to write something terrible and beautiful about this.",
      "You found this for me? Print me a retraction of every mean thing I ever thought about you. Front page.",
      "Five stars. No notes. I have only... give me a minute.",
    ],
    like: [
      "Thoughtful. Three and a half stars. That's very high, from me.",
      "Thank you. I'm noting it in the record. The good record.",
    ],
    neutral: [
      "Hm. Thank you. It's... a thing. I'll find it a column.",
      "Two stars. Charming effort. Weak follow-through.",
    ],
    dislike: [
      "This is a typo in object form.",
      "No. Absolutely not. I'm returning this to sender. The sender is you.",
      "One star, and that's for the wrapping.",
    ],
    birthday: [
      "Lavinia's birthday letter just said 'Another year, another comma splice.' You brought a {item}. You win. Narrowly.",
      "I don't celebrate birthdays. I cover them. ...Fine. Exception. A {item}. Front page, below the fold.",
    ],
    byItem: {
      paperback: "A mystery with the last page torn out. That's the cruelest thing anyone's ever handed me. I'll be up all night. Thank you.",
      polaroid: ["A crowd shot, badly framed, flash too late. The woman in front has a purse raised.", "This is the best photograph anyone's taken in this county in ten years and I hate that I didn't take it."],
      bouquet: "From the bakery window. Somebody saw you buy these. It'll be in the gossip column by Thursday. I write the gossip column. I'll be fair.",
      'old-program': "1979. The typesetting on this is criminal. I love it. Look at the kerning on MALONE.",
      coffee: "Coffee. Thank you. I'm on my fourth. This is my fifth. Stop me at seven.",
      teacup: "Chipped. I'll keep paperclips in it. The paperclips have been in a mayonnaise jar, and they've been very patient.",
      pie: "June's pie. I'm going to eat it over the layout table and get crumbs in the classifieds. Readers will assume it's a code.",
      wildflowers: "I'll put them in the jar on the press. Everything I print this week will smell faintly of creek. I'm choosing to be fine with it.",
      cassette: "PUMP UP JAMS 4 SAT. I need to know who made this. That's not a gift, that's a lead.",
      concha: "Rosa's concha. I eat the sugar shell first and leave a trail across the desk like a slug with a sweet tooth.",
      vinyl: "Somebody's entrance music. I'll play it while I write the review. If it's good, I'll be meaner. Good music raises standards.",
    },
    later: [
      "The {lastGift} made it into a sentence this week. Page three. You'll have to find it. It's hidden in a review of the bake sale.",
      "Lavinia saw the {lastGift} on my desk and wrote me a letter about it. Two paragraphs. No commas. She's trying to tell me something.",
    ],
  },
  again: [
    "On deadline. Say it in fewer words. ...Fewer than that.",
    "(Clementine raises her pencil without looking up. It means 'later.' It also means 'you're in my light.')",
    "We've covered this. I don't run the same story twice in a day.",
  ],
  idle: [
    "(Clementine is reading a galley proof with a red pencil in her teeth.)",
    "No comment. That's a joke. I always have a comment. I just don't have time for it.",
  ],
  birthday: { season: 3, day: 20 },
  events: [
    {
      id: 'clementine-2', hearts: 2, title: 'Improved',
      script: async (api) => {
        await api.narrate('Friday morning, the Tattler lands on your porch with a thump. Page three. A photo of you mid-blink.');
        await api.narrate(`Under it, in bold: "I came to Turnbuckle Alley for the comeback."`);
        await api.narrate("You don't remember saying that. You said you came for the coffee, and also because the bus stopped here.");
        await api.narrate('Clementine is coasting by on her bicycle, newspaper bag over one shoulder. She brakes beside you.');
        await api.sayMood('clementine', 'smug', "I improved it. You're welcome.");
        const c = await api.choose(null, [
          { label: 'Thank her', value: 'thank' },
          { label: '"I\'d have said it, if I\'d thought of it."', value: 'said' },
        ]);
        if (c === 'thank') {
          await api.say('clementine', "Most people threaten to sue. You're refreshingly low-maintenance. I'll keep that in mind.");
          api.hearts('clementine', 15);
        } else {
          await api.narrate('She looks at you over her round glasses, surprised.');
          await api.say('clementine', "That's what everybody says. That's the whole job. I find the sentence you were reaching for.");
          await api.sayMood('clementine', 'happy', "You'd be amazed how often people mean better than they say.");
          api.hearts('clementine', 30);
        }
        await api.narrate('She pushes off. Thirty feet down the road, a rolled-up Tattler lands perfectly on the Purcells\' welcome mat.');
      },
    },
    {
      id: 'clementine-4', hearts: 4, title: 'Print Night', when: { weekday: [3], time: [1200, 1439] },
      script: async (api) => {
        await api.narrate('One in the morning, the Tattler basement. One bare bulb, a mountain of newsprint, and a 1962 press the size of a pickup truck.');
        await api.say('clementine', "Don't touch anything. Okay. Touch that. That's the feed. When I say go, push. Not yet. Not yet...");
        await api.narrate('The press groans, clanks, and wheezes to life with a sound like a freight train clearing its throat.');
        const c = await api.choose('Clementine shouts something over the noise.', [
          { label: 'Push the feed', value: 'push' },
          { label: 'Pull the big lever', value: 'lever' },
        ]);
        if (c === 'push') {
          await api.narrate('You push. Paper flies through. Then it flies through faster. Then it flies through sideways, and ink sprays across both of you.');
          api.hearts('clementine', 15);
        } else {
          await api.narrate('You pull the big lever. It was not the lever. A fountain of ink erupts from the drum and lands mostly on Clementine.');
          api.hearts('clementine', 30);
        }
        await api.narrate("She stands there, dripping, ink on her glasses, ink in her bangs, ink in a perfect stripe across her nose.");
        await api.narrate("And then she laughs. Really laughs. Bent over, hands on her knees, the kind of laugh you can't hear from press row.");
        await api.sayMood('clementine', 'happy', "Oh, God. Oh, look at us. We look like a correction.");
        await api.say('clementine', "...Nobody's ever stayed for print night before. Okay. Again. And this time, the feed.");
      },
    },
    {
      id: 'clementine-6', hearts: 6, title: 'The Ledger',
      script: async (api) => {
        await api.narrate("The Tattler office, after hours. Clementine is at her desk with a green ledger open in front of her. She doesn't hear you come in.");
        await api.narrate('When she does, she starts to close it. Then she stops, and turns it around so you can see.');
        await api.say('clementine', "Every week for two years. Red. Every single week. I've been covering it out of my savings.");
        await api.say('clementine', "Lavinia doesn't know. Nobody knows. My savings are now roughly the price of a nice bicycle. Which I already have.");
        await api.sayMood('clementine', 'sad', "But a town without a paper forgets what happened to it. And then it forgets it was a town.");
        const c = await api.choose(null, [
          { label: 'Buy a quarter-page ad for your merch ($40)', value: 'ad' },
          { label: 'Tell her the whole town reads every word', value: 'reads' },
        ]);
        if (c === 'ad') {
          api.money(-40);
          await api.say('clementine', "That's charity. I don't take charity.");
          await api.narrate('You point out that it is an ad, and ads are what newspapers are for.');
          await api.sayMood('clementine', 'love', "...Quarter page. Above the fold. And I'm writing the copy, because yours will be terrible.");
          api.hearts('clementine', 30);
          api.flag('clem_ad');
        } else {
          await api.say('clementine', "They do. They really do. Agnes reads it with a red pen. Bev reads it twice. Pip reads it out loud on the bus.");
          await api.say('clementine', "...That helps. It doesn't help the ledger, but it helps.");
          api.hearts('clementine', 15);
        }
      },
    },
    {
      id: 'clementine-8', hearts: 8, title: 'The Margins',
      script: async (api) => {
        await api.narrate('Press row, after the building has emptied. Clementine is still in her seat, notebook closed on her knees, not writing.');
        await api.say('clementine', "Can I tell you something off the record? Actually off. Not 'off but I'll paraphrase it later.'");
        await api.say('clementine', "I write harsh reviews because good matches make me cry. In public. In press row. And I can't stand anyone seeing.");
        await api.narrate('She opens the notebook and holds it out. It is her page from your last match.');
        await api.narrate('The first half is tidy shorthand, times, spots, stars. Then the handwriting gets bigger. Then it stops. The margins are smudged, and wavy, and wet.');
        await api.sayMood('clementine', 'sad', "That's you. That's what you did to my notebook.");
        const c = await api.choose(null, [
          { label: "Promise you won't tell anyone", value: 'promise' },
          { label: 'Ask her to read you the page', value: 'read' },
        ]);
        if (c === 'promise') {
          await api.say('clementine', "Good. Because I will deny it in print. I have a printing press. You have a fan sign.");
          api.hearts('clementine', 15);
        } else {
          await api.narrate("She hesitates. Then she reads it out loud, quietly, in her reviewing voice, which wobbles.");
          await api.say('clementine', "'The comeback began at 9:14. I stopped taking notes at 9:15.'", "...That's it. That's the whole review.");
          await api.sayMood('clementine', 'love', "It's the best thing I've ever written, and I can't print it.");
          api.hearts('clementine', 30);
        }
        api.flag('clem_notebook');
      },
    },
    {
      id: 'clementine-10', hearts: 10, map: 'sunnypines', title: 'Proud of You', when: { weekday: [6] },
      script: async (api) => {
        await api.narrate("Sunday at the Evening Bell. Lavinia Beaulieu, ninety-four, sits by the window in a cardigan with a 1961 press badge pinned to it.");
        await api.narrate('She hands Clementine an envelope, the way she has every Sunday for nine years. Letters to the Editor, in old, sharp handwriting.');
        await api.say('clementine', "Here we go. Let's see. Commas, commas, a semicolon I'll never live down...");
        await api.narrate('She unfolds it. She stops. She reads it again. There are no complaints about commas. There is one line.');
        await api.narrate("Proud of you. L.B.");
        await api.narrate("Clementine looks at it for a long time. Then she folds it very carefully, stands up, and says she needs some air.");
        await api.narrate("Lavinia watches her go. She turns her sharp old eyes on you.");
        await api.narrate(`"Nine years I've corrected that child's commas," Lavinia says. "She's never once needed it. Don't tell her."`);
        const c = await api.choose(null, [
          { label: 'Go after Clementine', value: 'follow' },
          { label: 'Stay and thank Lavinia', value: 'stay' },
        ]);
        if (c === 'follow') {
          await api.narrate('You find her in the garden, sitting on a bench by the roses with the letter held flat against her chest.');
          await api.sayMood('clementine', 'love', "Nine years. ...She'll be back to the commas next week. I hope. I'd miss them.");
          await api.say('clementine', "Thank you for coming out here. You always come out here. Did you know that? You always do.");
          api.hearts('clementine', 30);
        } else {
          await api.narrate(`Lavinia's mouth twitches. "If word gets out I can be nice," she says, "it will ruin my brand."`);
          await api.narrate('When Clementine comes back in, eyes pink, Lavinia is already complaining loudly about the font size of the bake sale results.');
          api.hearts('clementine', 15);
        }
      },
    },
    {
      id: 'clementine-12', hearts: 12, map: 'sportatorium', title: 'Press Row', when: { dating: true, showDay: true, weekday: [5], place: ['show'] },
      script: async (api) => {
        await api.narrate("Saturday. You're not booked tonight. Clementine has saved you the seat next to hers in press row, with a pencil already sharpened for you.");
        await api.say('clementine', "Rules. Whisper only. No cheering. Press doesn't cheer. Press... observes, loudly, in its heart.");
        await api.narrate('The opener starts. She leans in, close, and reviews it into your ear in a whisper. Every spot. Every miss. Every save.');
        await api.say('clementine', "Watch his feet. He's setting up the... there. Lovely. Half a star for that alone. He'll never hear it from me.");
        await api.narrate('By the main event she has stopped writing. By the finish she is gripping your sleeve. When the three-count hits, she makes a small noise.');
        await api.narrate("It is, very nearly, a cheer. She claps a hand over her mouth and looks around to see if anyone noticed.");
        const c = await api.choose('Clementine is pretending nothing happened.', [
          { label: 'Give HER five stars', value: 'stars' },
          { label: 'Steal her pencil and write in her notebook', value: 'pencil' },
        ]);
        if (c === 'stars') {
          await api.narrate("You lean in and whisper it. Five stars. No notes.");
          await api.sayMood('clementine', 'love', "...That's my line. You can't use my line.", "...Use it again.");
          api.hearts('clementine', 30);
        } else {
          await api.narrate('You take her pencil and write one word in the margin of her notebook. She reads it. She goes the color of her scarf.');
          await api.sayMood('clementine', 'surprised', "Four words and a comma splice. ...I'm keeping it.");
          api.hearts('clementine', 15);
        }
      },
    },
    {
      id: 'clementine-14', hearts: 14, title: 'Behind the Curtain', when: { dating: true, notFlag: 'clem_curtain' },
      script: async (api) => {
        await api.narrate("Birdie's office. Forty keys on her belt, the Pencil behind her ear, a cinnamon stick going slowly soft in the corner of her mouth.");
        await api.say('birdie', "So. The critic. You want to bring the critic through the curtain.");
        await api.say('birdie', "Sugar, I've read every review she ever wrote. Even the mean ones. Especially the mean ones.");
        await api.say('birdie', "She sees the work. Always has. She just never knew there was work to see.", "...Bring her in. Gently.");
        await api.fade();
        await api.narrate("The locker room. Clementine stands just inside the door, notebook clutched to her chest, looking at everything at once.");
        await api.narrate("Gideon, in a hoodie, knitting. The Mountain, reading glasses on, whispering an apology to a bench. A whiteboard: tonight's finishes.");
        await api.narrate('She reads the whiteboard. She reads it again.');
        await api.sayMood('clementine', 'surprised', "So it's... written? The finishes are... written?");
        await api.say('clementine', "I've been reviewing THEATER? For nine years?");
        await api.narrate('A long silence. You can almost hear her flipping back through every review she ever wrote.');
        await api.sayMood('clementine', 'happy', "...Oh my God. I've been RIGHT.");
        await api.say('clementine', "Every 'that felt rehearsed.' Every 'beautifully paced.' I was reviewing the ART. I was always reviewing the art!");
        await api.narrate('Then her face falls.');
        await api.sayMood('clementine', 'sad', "Oh no. Oh no, the star ratings. Gideon. I gave Gideon two stars for a match that was PERFECT.");
        const c = await api.choose('Clementine is spiraling, a little.', [
          { label: 'Take her hand and let her breathe', value: 'hand' },
          { label: 'Hand her a fresh notebook', value: 'notebook' },
        ]);
        if (c === 'hand') {
          await api.narrate("She grips your hand like a press rail. Slowly, the spiral stops. She looks around the room again, and this time she's smiling.");
          await api.say('clementine', "Okay. Okay. I'm in the business. I'm... in. Nobody outside this room will ever know. And I'll know everything.");
          api.hearts('clementine', 30);
        } else {
          await api.narrate("She takes it, opens it to the first page, and writes CORRECTIONS across the top in block capitals. She underlines it twice.");
          await api.say('clementine', "I'm going to apologize to every person in this room. Privately. With revised ratings. This will take a week.");
          api.hearts('clementine', 15);
        }
        await api.narrate("On the way out, she stops in the doorway and looks back at you, ink smudge on her nose, eyes bright.");
        await api.sayMood('clementine', 'love', "For the record? If you ever want to ask me something important, put it in print. I'll know it's real if it's spelled right.");
        api.flag('clem_curtain');
      },
    },
  ],
} satisfies DialogueSet;
