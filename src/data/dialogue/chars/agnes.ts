import type { DialogueSet } from '../types';

/**
 * Agnes Pickett, 80. Seat A1 at every show since 1971, retired switchboard
 * operator, county pie champion, and owner of Gertrude, a 1966 patent-leather
 * handbag that has met eleven villains. Lives at the Evening Bell Residence
 * (map 'sunnypines') with Hubert the cat and the rose beds she commandeered.
 * A mark. She was in A1 the Night of the Broken Belt, and she has a photo.
 */
export default {
  npc: 'agnes',
  intro: [
    "You'll be the new one. I can tell by the shoes. Nobody in this town owns shoes that clean.",
    "Agnes Pickett. Seat A1, every show since 1971. And this is Gertrude.",
    "Gertrude is a handbag, dear. Patent leather, 1966. She and I have met eleven villains. Personally. Up close.",
    "I ran the telephone switchboard here for twenty-eight years. I know every family in this county. Soon I'll know yours.",
    "Welcome to Turnbuckle Alley. Stand up straight, wipe your feet, and never turn your back on the ring.",
  ],
  lines: [
    // ---------------------------------------------------------------- anytime
    { text: "What's in Gertrude? Butterscotch, tissues, a rain bonnet, spare glasses, and the church bulletin. No brick. Whatever the Bruisers say." },
    { text: ["Eleven villains since 1971. I keep a list.", "I don't need to keep a list, dear. I remember every one. I just like the list."], mood: 'smug' },
    { text: "I ran the switchboard from 1961 to 1989. I listened to nothing and heard everything. There's a difference, dear." },
    { text: ["I had my gallbladder out on a Thursday in 1979 and I was in A1 on Saturday.", "The doctor came with me. He booed beautifully."], mood: 'smug' },
    { text: ["They let me bring Hubert to the Evening Bell. There was a vote. Thirty-one to two.", "I know who the two were. I ran a switchboard."] },
    { text: "My cat Hubert thinks he's a dog. He fetches. He growls at the mail. He's the only one in the building who does. Maribel deserves better." },
    { text: ["Every rose in the Evening Bell garden is named for a hero. The yellow climber is Mariposa.", "The stubborn one by the drainpipe is Birdie Malone."] },
    { text: ["County pie champion. Cherry lattice. Tiny Tallbridge is coming for my crown.", "I respect her. I'll never tell her. That's how respect works."] },
    { text: "Sheriff Bev and I have an arrangement. I phone in villain sightings. She writes them down. Nothing ever happens. It's very satisfying." },
    { text: ["Sweet Lou Bastian is the finest man alive.", "That's not an opinion, dear. It's arithmetic. I've been checking the figures since 1977."] },
    { text: "Birdie Malone has kept seat A1 for me since 1984. Somebody offered to buy it once. She told them where to put the offer. Good woman." },
    { text: ["I write the Tattler about lax refereeing. Clementine prints about half.", "The other half, she says, 'contain language.' They contain the truth."] },
    { text: "The Abernathy boy holds Gertrude at intermission. He's the only person alive I trust with her. He has a very serious face for ten." },
    { text: ["Madame Midnight. I hit her with Gertrude in 1982. Now she serves my eggs at the Hot Tag.", "We've never discussed it. The eggs are very good."] },
    { text: ["The Velvet Hammers. Birdie threw the punches and the Duchess made you beg for them.", "I never saw two people move like one person, before or since."] },
    { text: "Don't call me sweetie. I was sweet once, in 1952. It didn't take.", when: { hearts: [0, 4] }, mood: 'angry' },
    { text: "That raccoon took a butterscotch right out of my hand in the front row. He said thank you, I think. I've decided he did.", when: { map: ['sportatorium'] } },

    // ---------------------------------------------------------------- weekly rhythm
    { text: ["Sunday is church and then canasta. I pray for the heroes by name.", "Then I take everyone's money at canasta. The Lord understands."], when: { weekday: [6] }, mood: 'smug' },
    { text: "My nephew in Ohio calls every Sunday. 'Aunt Agnes, are you eating?' I'm eating. I don't tell him it's mostly butterscotch.", when: { weekday: [6], time: [960, 1320] } },
    { text: ["Monday at eleven I wait at my mailbox to tell Maribel about the calls she missed on Saturday.", "She says 'I call what I see.' She sees nothing."], when: { weekday: [0] }, mood: 'angry' },
    { text: "Rummage sale prep. Thirty years I've run it. People donate things I sold them in 1994. It's the circle of life, dear.", when: { weekday: [1, 2, 3, 4], time: [720, 1020] } },
    { text: "Good morning. I've already done the roses, read the bulletin and written the Tattler. You're late, whatever you're doing.", when: { time: [360, 600] } },

    // ---------------------------------------------------------------- show days
    { text: "I'm going in early. Two hours early, A1, like always. Somebody has to see the ring before anyone's been thrown out of it.", when: { weekday: [5], time: [720, 1080] } },
    { text: "The VFW tonight. Fifty folding chairs and bingo. I prefer the Sportatorium, but a villain is a villain at any venue.", when: { weekday: [2] } },
    { text: "Are you on tonight? Then I'm watching. If anybody hits you with a chair, I'll be over that railing. Don't think I won't.", when: { showDay: true, place: ['show'], alignment: ['face', 'tweener'] } },
    { text: "If you come anywhere near row A tonight, I'd like you to know Gertrude has been polished.", when: { showDay: true, place: ['show'], alignment: ['heel'] }, mood: 'angry' },
    { text: "That referee missed three things on Saturday. Three. I've written them down. The Tattler will hear about all three.", when: { weekday: [6], flag: 'debuted' }, mood: 'angry' },
    { text: ["You took a hard fall, dear. Ice it and say your prayers.", "I said some for you. Two Our Fathers and a 'give 'em what for.'"], when: { weekday: [3, 6], flag: 'debuted', hearts: [3, 14] }, mood: 'sad' },

    // ---------------------------------------------------------------- alignment
    { text: "You're a good one. I can see it. You remind me of Lou in '77, except Lou had better posture. Stand up straight.", when: { alignment: ['face'] } },
    { text: "I prayed for {ring} by name on Sunday. Pastor Gail asked me how to spell it. I spelled it twice. Loudly.", when: { alignment: ['face'], hearts: [3, 14] }, mood: 'happy' },
    { text: "I know what you are. I've watched what you do. Gertrude has watched what you do.", when: { alignment: ['heel'], hearts: [0, 2] }, mood: 'angry' },
    { text: "You ought to be ASHAMED. I'd ring your grandmother if I knew who she was. I'd find out. I have ways.", when: { alignment: ['heel'], hearts: [0, 5] }, mood: 'angry' },
    { text: ["I cannot BELIEVE you'd do that to that sweet boy. In front of children.", "In front of ME. In front of Gertrude."], when: { alignment: ['heel'], hearts: [0, 5], flag: 'debuted' }, mood: 'angry' },
    { text: "I've decided you're a villain who was raised right and took a wrong turn. That means you can be saved. I'm keeping Gertrude handy anyway.", when: { alignment: ['heel'], hearts: [3, 14] } },
    { text: "I still swing at you, dear. Every Saturday. You'd be insulted if I didn't. It's the swing of someone who cares.", when: { alignment: ['heel'], hearts: [6, 14] }, mood: 'love' },
    { text: "Gus calls you a 'tweener.' In my day we called that 'making up your mind.' Make it up, dear. Gertrude is getting restless.", when: { alignment: ['tweener'] } },

    // ---------------------------------------------------------------- rank
    { text: "You open the show? Lou told me he started in the opener too. 1966. Eleven people and a dog. He wore lavender even then.", when: { rank: ['rookie', 'opener'], flag: 'debuted' } },
    { text: "Main event. Well. I knew. I knew back when you were in the opener. I'm never wrong about these things, dear. Ask Lou.", when: { rank: ['main', 'assistant', 'pencil', 'owner'] }, mood: 'smug' },

    // ---------------------------------------------------------------- seasons and weather
    { text: "Spring. The roses are waking up and so is that bear. Thaw Brawl's coming. I've got a new brooch to earn.", when: { season: [0] }, mood: 'happy' },
    { text: "Thaw Brawl is where the year's feuds begin. I keep a fresh page in my notebook for each one. I've already started three.", when: { season: [0] } },
    { text: "Spring rain is good for roses and bad for perms. I'll take the trade. Gertrude has the rain bonnet.", when: { season: [0], weather: ['rain'] } },
    { text: "Fairgrounds Fury. Pie contest in the morning, villains at night. The most important day of the year for a woman like me.", when: { season: [1] } },
    { text: "Harvest Havoc. I knitted Gertrude a little cozy for it. She doesn't need one. She likes it.", when: { season: [2] } },
    { text: "Homecoming. Every year I hope it's Lou's turn for the Hall of Fame. Every year I bring a handkerchief anyway.", when: { season: [3] } },
    { text: "Rain bonnet. A lady is always prepared, dear. For weather and for villains.", when: { weather: ['rain'] } },
    { text: "A storm like this, the switchboard used to light up like Christmas. Everyone wanted to tell somebody the lights went out.", when: { weather: ['storm'] } },

    // ---------------------------------------------------------------- friends
    { text: "Have a butterscotch. No, take two. You're thin. Wrestling is no excuse for being thin.", when: { hearts: [3, 5] } },
    { text: ["My brooches. One for every anniversary show. Forty-some now.", "The cardigan weighs nine pounds. I'll wear it as long as I can lift it."], when: { hearts: [3, 14] } },
    { text: ["Do you happen to know if Sweet Lou is keeping company with anyone?", "I only ask for the church directory. We like it to be accurate."], when: { hearts: [3, 14] }, mood: 'surprised' },
    { text: "I was in A1 the night the belt broke. 1983. I don't talk about it, dear. Ask me again when I like you more.", when: { hearts: [3, 5], notFlag: 'agnes_photo' } },

    // ---------------------------------------------------------------- close
    { text: "When you're my age, dear, people think you've seen it all. I haven't. That's why I keep coming.", when: { hearts: [6, 14] } },
    { text: ["I never married. I had a career, I had wrestling, and I had my roses. That was plenty.", "...It was mostly plenty."], when: { hearts: [6, 14] } },
    { text: ["Lou used to sing a verse to the crowd before every match. I know every word of the second verse.", "Don't you dare tell him."], when: { hearts: [6, 14] }, mood: 'love' },
    { text: ["That referee in '83 counted three like he had a bus to catch.", "I wrote the Tattler about it. They printed it, too. Page four."], when: { hearts: [6, 14] }, mood: 'angry' },
    { text: "I keep thinking about that photo. Villains don't cry. I've watched since 1971. That one has bothered me for forty years.", when: { flag: 'agnes_photo', notFlag: 'truth_revealed' } },
    { text: "Of course I stayed. Ohio has wrestling, I'm told. It isn't MY wrestling. And Hubert would never forgive the drive.", when: { flag: 'agnes_stays' }, mood: 'smug' },

    // ---------------------------------------------------------------- family
    { text: "I've sat in A1 for over fifty years, and I think I like the shows better since you came. Don't let it go to your head.", when: { hearts: [9, 14] }, mood: 'love' },
    { text: "I pray for the heroes by name. You've been on the list a while now. I've moved you up, right after Lou. That's a promotion.", when: { hearts: [9, 14], alignment: ['face', 'tweener'] }, mood: 'happy' },
    { text: "I pray for the villains too, you know. Separate list. Shorter. You're at the top of it, dear. That's love, in its way.", when: { hearts: [9, 14], alignment: ['heel'] } },
    { text: "Do you still have my stub? Good. Keep it in your wallet, not your pocket. Pockets are for tissues and nonsense.", when: { flag: 'agnes_stub' } },

    // ---------------------------------------------------------------- the Duchess, down the hall
    { text: ["That woman has moved into Room 7. The Duchess. Down MY hall.", "I've asked to sit at a different lunch table for the rest of my natural life."], when: { flag: 'grandma_in_town', notFlag: 'truth_revealed', hearts: [0, 5] }, mood: 'angry' },
    { text: "She beat Velma at rummy four times on Tuesday. Cheated, obviously. Can't prove it. That's how you know she's good.", when: { flag: 'grandma_in_town', notFlag: 'reunion_done' } },
    { text: "The Duchess waltzed with Farid Haddad on Friday night. Villains don't waltz like that. I don't know what to do with it.", when: { flag: 'grandma_in_town', notFlag: 'truth_revealed' } },
    { text: ["I see you visiting Room 7. I won't ask.", "I ran a switchboard twenty-eight years, dear. I know how not to hear things."], when: { flag: 'grandma_in_town', hearts: [4, 14] } },
    { text: ["I passed her in the hall this morning. She said, 'Good morning, A1.'", "She remembered my SEAT. Forty years. I didn't swing. I was too surprised."], when: { flag: 'grandma_in_town', hearts: [6, 14], notFlag: 'reunion_done' }, mood: 'surprised' },
    { text: ["So she was crying because she was sorry. All this time.", "I had it right there in my Bible, dear. Forty years of looking at it."], when: { flag: 'truth_revealed', notFlag: 'reunion_done' }, mood: 'sad' },
    { text: ["I took Gertrude down to Room 7. I didn't swing. I just sat.", "Neither of us said a word. Best conversation I've had in years."], when: { flag: 'truth_revealed', notFlag: 'reunion_done', hearts: [6, 14] } },
    { text: "The Velvet Hammers. Forty years, and they won it right in front of me. I stood up first and sat down last. Ask anyone.", when: { flag: 'reunion_done' }, mood: 'happy' },
    { text: ["She sits next to me now. A1 and A2. I told her, 'I've hated you for forty years, Duchess.'", "'Sit down. I saved you a seat.'"], when: { flag: 'reunion_done' }, mood: 'love' },
    { text: "She doesn't always know who I am. But she always knows where the ring is. That's enough, dear. That's the important part.", when: { flag: 'reunion_done', hearts: [6, 14] } },

    // ---------------------------------------------------------------- life events
    { text: "A wedding in the ring. I cried into Gertrude. Don't tell anyone. She's waterproof, mostly.", when: { married: true }, mood: 'love' },
  ],
  gifts: {
    loves: ['signed-photo', 'old-program', 'teacup', 'bouquet'],
    likes: ['pie', 'polaroid', 'wildflowers', 'paperback', 'honey', 'coffee', 'concha', 'yarn'],
    dislikes: ['gas-hotdog', 'protein-shake', 'scrap', 'bait'],
  },
  giftReplies: {
    love: [
      "Oh. Oh, my. Well. I'll put this somewhere private. My nightstand. No. My Bible. No. Goodness.",
      "Oh, dear. You've made an old woman's whole week. I'll tell my nephew. He'll be jealous. Good.",
      "This goes straight into Gertrude. That's where I keep the things that matter.",
    ],
    like: [
      "That's very thoughtful, dear. Sit up straight while I thank you. There. Thank you.",
      "How lovely. You were raised right. Whoever raised you, I'd like to shake their hand.",
      "Very nice. I'll show it to Hubert. He'll pretend not to care. He's a cat with a dog's job.",
    ],
    neutral: [
      "Well. Thank you, dear. It'll be useful to someone at the rummage sale.",
      "How kind. I'll find a place for it. I find a place for everything. Ask Gertrude.",
    ],
    dislike: [
      "Goodness. No. Take that away before Gertrude sees it.",
      "I don't know what you think I am, dear, but I'm not THAT.",
      "Is this a joke? I've heard better jokes from the Bruiser Twins, and they don't tell jokes.",
    ],
    birthday: [
      "You remembered. At my age, birthdays are mostly a list of people who forgot. You're not on the list.",
      "Eighty-one. Don't say it out loud. Gertrude doesn't know.",
    ],
  },
  birthday: { season: 3, day: 6 },
  events: [
    {
      id: 'agnes-2', hearts: 2, title: 'A Butterscotch from Gertrude',
      when: { showDay: true, place: ['show'], alignment: ['face', 'tweener'], notFlag: 'agnes_two' },
      script: async (api) => {
        await api.narrate('Intermission. Agnes is bolt upright in the front row, Gertrude on her knees. She sees you and crooks one finger.');
        await api.narrate("Gertrude's clasp opens with a snap like a judge's gavel. Agnes produces a butterscotch in a gold wrapper.");
        await api.say('agnes', "For you. For being polite to Pip. He told me. He tells me everything, so be careful.");
        await api.say('agnes', "But understand me, dear. If you ever turn villain, you'll meet the same purse as the rest of them.");
        await api.sayMood('agnes', 'smug', "Gertrude doesn't play favorites. Gertrude doesn't even have favorites. I have favorites. Gertrude has a job.");
        const c = await api.choose(null, [
          { label: 'Take the butterscotch and thank her', value: 'thank' },
          { label: "Promise you'll never give her a reason", value: 'promise' },
        ], 'agnes');
        if (c === 'thank') {
          await api.say('agnes', 'Manners. Good. Now sit up straight, the second half is about to start.');
          api.hearts('agnes', 15);
        } else {
          await api.narrate('Agnes looks at you over her glasses for a long moment. Then she snaps Gertrude shut.');
          await api.sayMood('agnes', 'happy', "Good. I'll hold you to that. Gertrude will hold you to that.");
          api.hearts('agnes', 30);
        }
        api.flag('agnes_two');
      },
    },
    {
      id: 'agnes-2-heel', hearts: 2, title: 'A Butterscotch, Then the Purse',
      when: { showDay: true, place: ['show'], alignment: ['heel'], notFlag: 'agnes_two' },
      script: async (api) => {
        await api.narrate('Intermission. Agnes sees you passing the front row and rises to her full height, which is not very high and somehow enormous.');
        await api.say('agnes', "I don't give butterscotch to villains.");
        await api.narrate('The clasp of Gertrude snaps open. She holds out a butterscotch in a gold wrapper.');
        await api.say('agnes', "I'm giving you one anyway, because Pip says you helped him find his other shoe. And then I'm going to swing.");
        const c = await api.choose('Gertrude is already in her other hand.', [
          { label: 'Take the butterscotch and run', value: 'run' },
          { label: 'Bow your head and accept your punishment', value: 'bow' },
        ]);
        if (c === 'run') {
          await api.narrate('You snatch it and duck. Gertrude whistles past your ear. The front row cheers like it was a near-fall.');
          await api.sayMood('agnes', 'angry', "Next time, dear! There's ALWAYS a next time!");
          api.hearts('agnes', 15);
        } else {
          await api.narrate('You lower your head. Agnes considers you. Then she taps the top of your head with Gertrude, very lightly. Once.');
          await api.sayMood('agnes', 'smug', "There. Now you've been forgiven AND punished. That's how it's done. Go on.");
          api.hearts('agnes', 30);
        }
        api.flag('agnes_two');
      },
    },
    {
      id: 'agnes-4', hearts: 4, map: 'sunnypines', title: 'The Rose Beds',
      script: async (api) => {
        await api.narrate('The garden behind the Evening Bell. Agnes kneels on a folded cardigan between two rows of roses, Hubert supervising from a bench.');
        await api.say('agnes', 'Every one of these is named after a hero. I name them when they bloom. Hand me those shears.');
        await api.narrate('She points them out one by one. A tight gold bud: Mariposa. A climbing white one, all thorns: Hurricane.', 'A red one bent at the knee: Cowboy Clint.');
        await api.say('agnes', 'And the one by the drainpipe that blooms whether I water it or not: Birdie Malone.');
        await api.narrate('There is one rose she has not mentioned. Lavender. Perfect. Clearly her favorite. The little wooden stake in front of it says SWEET LOU.');
        await api.narrate('She sees you see it. A deep blush climbs from her collar to her perm.');
        await api.sayMood('agnes', 'surprised', 'Aphids. This year the aphids are simply unbearable.');
        const c = await api.choose('Agnes is suddenly very busy with the aphids.', [
          { label: 'Ask about the aphids', value: 'aphids' },
          { label: 'Ask about the lavender rose', value: 'lou' },
        ]);
        if (c === 'aphids') {
          await api.narrate('She explains aphids to you for eight minutes, in detail, with great relief. You learn a lot about soap spray.');
          await api.say('agnes', '...Thank you, dear. You have good manners. Somebody raised you well.');
          api.hearts('agnes', 30);
        } else {
          await api.say('agnes', "That's a variety. It's called that. It came that way. From the catalog.");
          await api.narrate('It did not come that way. The handwriting on the stake is hers.');
          await api.sayMood('agnes', 'love', "...He sang to the crowd before every match in 1977. That's all. A woman can name a rose.");
          api.hearts('agnes', 15);
        }
        await api.narrate('Before you go, she points at an empty bed at the end of the row, freshly turned.');
        await api.say('agnes', "That one's for the next hero. There's a waiting list. I'm watching it closely.");
      },
    },
    {
      id: 'agnes-6', hearts: 6, map: 'sunnypines', title: "Villains Don't Cry",
      script: async (api) => {
        await api.narrate("Agnes's room at the Evening Bell. Hubert asleep on the radiator. A Bible on the nightstand, thick with things tucked between its pages.");
        await api.say('agnes', "You asked me about 1983 once. I said ask me when I like you more. Well. Sit down.");
        await api.say('agnes', 'The Velvet Hammers against the Copperhead Sisters. Madame Midnight at ringside. Homecoming six weeks off.');
        await api.say('agnes', 'Birdie went to the ropes. And the Duchess picked up the belt. Their belt. And she swung it.');
        await api.sayMood('agnes', 'sad', "It broke in two. I heard it from A1. Like a branch going in an ice storm.");
        await api.say('agnes', "Then that referee counted three like he had a bus to catch. And it was over. Fifteen years of those two. Over.");
        await api.narrate('She turns her glasses over in her hands.');
        await api.say('agnes', 'She came up the aisle with half the belt. Right past me. So I stood up and I hit her with Gertrude. Best swing of my life.');
        await api.say('agnes', "And she looked at me, dear. And she was crying. Not villain crying. Not for show. The real kind.");
        await api.say('agnes', "I had my little pocket camera. I don't know why. I took her picture at the curtain.");
        await api.narrate('She opens the Bible to the Psalms. Inside is a small square photo, gone orange at the edges.');
        await api.narrate("A woman at a red curtain. Half a championship belt in one hand. Chin up. Face wet. Looking back over her shoulder, toward the ring.");
        await api.narrate("You know that face. It's on the Polaroid that came with Grandma's letter. Forty years younger. Crying.");
        await api.say('agnes', "Villains don't cry, dear. I've watched since 1971. That one has bothered me for forty years.");
        const c = await api.choose('Agnes holds the photo out so you can see.', [
          { label: 'Ask if you can look closer', value: 'look' },
          { label: "Say maybe she wasn't a villain at all", value: 'maybe' },
        ]);
        if (c === 'look') {
          await api.narrate("You hold it to the lamp. A crown braid. One rhinestone earring. And her eyes aren't on the crowd. They're on someone in the ring.");
          await api.say('agnes', "You see it too. She's looking at Birdie. Who looks back at somebody they just betrayed?");
          api.hearts('agnes', 30);
        } else {
          await api.sayMood('agnes', 'sad', "Then what was she?");
          await api.say('agnes', "...Don't answer. I've had forty years to think of one, and I don't have it either.");
          api.hearts('agnes', 15);
        }
        await api.narrate('She tucks the photo back into the Psalms and closes the Bible with both hands.');
        api.flag('agnes_photo');
      },
    },
    {
      id: 'agnes-8', hearts: 8, map: 'sunnypines', title: 'Ohio',
      script: async (api) => {
        await api.narrate('Agnes is in the Evening Bell sunroom with a brochure on her lap. On the cover, a building with a putting green and a fountain.');
        await api.say('agnes', "My nephew Dennis. In Ohio. He's found a lovely place near him. He's very proud of it.");
        await api.say('agnes', "It has a putting green. I don't putt. It has a 'great room.' I don't know what that is. It has no A1.");
        await api.narrate('She smooths the brochure flat, then smooths it again.');
        await api.say('agnes', "He says I'm getting older. I told him that's been going on for some time.", 'What do you think, dear? Honestly.');
        const c = await api.choose(null, [
          { label: 'Tell her A1 needs her', value: 'a1' },
          { label: 'Tell her family matters, whatever she decides', value: 'family' },
          { label: 'Point out that Ohio has wrestling too', value: 'ohio' },
        ], 'agnes');
        if (c === 'a1') {
          await api.sayMood('agnes', 'happy', "A1 needs me. Yes. That's exactly it. Somebody has to sit there and mean it.");
          api.hearts('agnes', 30);
        } else if (c === 'family') {
          await api.say('agnes', "It does. It does. And this town is my family too, isn't it. Fifty-five years of it.");
          api.hearts('agnes', 15);
        } else {
          await api.sayMood('agnes', 'smug', "It does. It isn't MY wrestling.");
          api.hearts('agnes', 0);
        }
        await api.narrate('She folds the brochure in half, then in quarters, and tucks it into Gertrude, where it will never be seen again.');
        await api.say('agnes', "Of course I'm staying. I always was. I just wanted somebody to tell me I was right.");
        await api.narrate('She picks up the sunroom telephone and dials from memory.');
        await api.sayMood('agnes', 'smug', "Dennis? It's your Aunt Agnes. Sit down, dear.");
        api.flag('agnes_stays');
      },
    },
    {
      id: 'agnes-10', hearts: 10, map: 'sportatorium', title: 'Seat A1, 1971',
      when: { showDay: true, weekday: [5], place: ['show'] },
      script: async (api) => {
        await api.narrate('Saturday, well before the bell. The seats are still empty except for the ring crew and one small woman in A1.');
        await api.say('agnes', "Come here, dear. Sit in A2. Nobody's in it yet.");
        await api.narrate('Gertrude snaps open. From the inside pocket, under the rain bonnet, Agnes takes out a ticket stub. Soft as cloth. ADMIT ONE. A1.');
        await api.say('agnes', "May, 1971. My first show. A friend dragged me. I wore white gloves. Imagine.");
        await api.say('agnes', "A girl named Birdie Malone, nineteen years old, threw a punch so hard the whole front row stood up. I went home and bought a season ticket.");
        await api.narrate('Across the ring, Birdie comes out of the curtain with her clipboard, sees the two of you, and lifts her chin.');
        await api.say('birdie', "Agnes. A1's yours till this building falls down, sugar. And then I'll build you a new one with a ramp.");
        await api.say('agnes', "Commissioner.");
        await api.narrate('Birdie goes back through the curtain. Agnes presses the stub into your hand and folds your fingers over it.');
        await api.sayMood('agnes', 'love', "I've got A1 as long as I can climb those steps. And Birdie's promised the ramp after.", 'You keep this. Somebody young ought to have it.');
        const c = await api.choose('The stub is warm from being in the purse.', [
          { label: 'Promise to keep it safe', value: 'keep' },
          { label: "Say you'll only hold onto it for her", value: 'hold' },
        ]);
        if (c === 'keep') {
          await api.say('agnes', "I know you will. I don't give things to people who won't. Fifty-five years, I've never been wrong.");
          api.hearts('agnes', 30);
        } else {
          await api.sayMood('agnes', 'smug', "Hold it, keep it, it's the same thing at my age, dear. Don't argue with an old woman in her own seat.");
          api.hearts('agnes', 15);
        }
        await api.narrate('She snaps Gertrude shut, settles back into A1, and folds her hands. The house lights are still up. She is already watching the ring.');
        api.flag('agnes_stub');
      },
    },
  ],
} satisfies DialogueSet;
