import type { DialogueSet } from '../types';

/**
 * June Oyelaran, Madame Midnight (retired). Owns the Hot Tag Diner and the
 * back booth, the town's insider sanctuary. Coffee pot held like a scepter,
 * sixteen bangles, a jeweled fan in her apron. Villains get the chipped mug.
 * 1983: she drove Dottie to the 2:10 bus and has kept her white ring boots on
 * the storeroom's top shelf ever since (8 hearts, once Grandma is in town).
 */
export default {
  npc: 'june',
  intro: [
    "Sit. You look like a bus ride. Coffee first, then you can tell me your name. I'll probably already know it.",
    "June Oyelaran. This is my diner, that's my counter, and the booth in the back is everybody's and nobody's. You'll understand eventually.",
    "Birdie says you're one of ours now. Birdie says a lot of things. I'll decide for myself, baby. Drink your coffee.",
  ],
  introPublic: [
    "Welcome to the Hot Tag. Coffee's bottomless, the pie is Agnes's recipe, and the booth in the back is reserved. Always. Don't ask by who.",
    "I'm June. I own the place. Some folks call me Madame Midnight. Those folks are old and should know better. I'm reformed.",
    "Chipped mug till I know what you are. Nothing personal. Everything's personal. Drink up.",
  ],
  lines: [
    // ---- Strangers
    { text: "Coffee. Sit. You'll order when you know what you want. I already know what you want, but I like watching people figure it out.", when: { hearts: [0, 2], place: ['public'] } },
    { text: "That booth in the back? Reserved since 1987. No name on it. Gus sat in it once by mistake and apologized to it.", when: { hearts: [0, 2], place: ['public'] } },
    { text: "Chipped mug till I know what you are, baby. Nothing personal. Everything's personal.", when: { hearts: [0, 3], place: ['public'] } },
    { text: "Chipped mug. You know why.", when: { place: ['public'], alignment: ['heel'], flag: 'debuted' }, weight: 2 },
    { text: ["(She glares at you over the coffee pot.)", "That's for sport, baby. Heroes get glared at. Your eggs are coming. Extra crispy, the way heroes deserve."], when: { place: ['public'], alignment: ['face'], flag: 'debuted' } },
    { text: "You're looking for Birdie. Everybody new is looking for Birdie. Counter stool by the register, noon. Sit two stools down. She bites.", when: { notFlag: 'met_birdie' }, weight: 3 },
    { text: "Five-thirty I unlock that door and somebody's always already waiting. Usually the mail carrier. Sometimes Lou. Once, a goose.", when: { time: [330, 540] } },
    { text: "You put ketchup on those eggs and you and I are going to have a conversation.", when: { hearts: [0, 5], time: [330, 660] } },
    { text: "Jollof Friday. Sold out by one. It's getting close. You want some, or you want to stand there looking pretty?", when: { weekday: [4], time: [600, 780] }, weight: 2 },
    { text: "Jollof's gone. Told you. Sold out by one every Friday since 1987. Come early next week and bring your appetite.", when: { weekday: [4], time: [781, 1260] } },
    { text: "Closed Monday afternoons. It's my one rest. I spend it reorganizing the pantry. The cumin moves one shelf left. Nobody notices. I notice.", when: { weekday: [0] } },
    { text: "Rain brings 'em in. Wet folks want pie. Dry folks want pie too, but wet folks admit it.", when: { weather: ['rain'] } },
    { text: "Storm's knocking the power out somewhere. Diner's got a gas stove and a generator. If the world ends, it ends with breakfast.", when: { weather: ['storm'] } },
    { text: "Snow day. Half the town's at my counter and the other half's on the phone asking if I deliver. I don't. I'm thinking about it.", when: { weather: ['snow'] } },

    // ---- Show days
    { text: "Show night. I'll have WRSL on in the kitchen. I don't go, baby. Seen enough wrestling for three lifetimes. I'd rather feed it.", when: { showDay: true, place: ['public'] } },
    { text: "VFW kitchen tonight. I make the chili, Rosa makes the tacos, and we don't speak. Healthiest relationship in town.", when: { weekday: [2], showDay: true } },
    { text: "Main event now? Then you eat like a main event. Sit. I'm bringing you the Special and you're going to finish it.", when: { rank: ['main'], place: ['public'] } },

    // ---- Friends, public
    { text: "Lou takes his cobbler warm. Birdie takes her coffee black. Gus takes everything. I know everybody's order. That's my whole power.", when: { hearts: [3, 10] } },
    { text: "Bangles? Sixteen. One for every year I managed. Took 'em off once in 1994. Felt like I was floating away.", when: { hearts: [3, 10] } },
    { text: "Gus announces my specials at noon like they're title fights. I give him free pie. Best advertising money can't buy.", when: { hearts: [3, 10] } },
    { text: "This fan? Just a fan, baby. For the kitchen heat. Don't look at me like that. I'm reformed.", when: { hearts: [3, 8], place: ['public'] } },
    { text: "Sheriff Bev's eaten lunch here every day for eighteen years and never once found anything to arrest me for. Not for lack of looking.", when: { hearts: [3, 10], place: ['public'] } },
    { text: "You're single? Don't answer. I already know. I've got a list. You're on it. Don't worry. It's a good list.", when: { hearts: [3, 8], dating: false, married: false } },
    { text: "Born in Lagos. Came to Houston at twelve. Been feeding people since I could reach a stove. The wrestling was a long, sparkly detour.", when: { hearts: [3, 10] } },
    { text: "Thaw Brawl week, every table in here's a debate club. I just pour and listen. The best gossip has syrup on it.", when: { season: [0] }, weight: 2 },
    { text: "Summer, the screen door never shuts. Flies come in, gossip goes out. I swat both.", when: { season: [1] } },
    { text: "Harvest Havoc. I'll bake the pumpkin pies and listen on the radio. Somebody always cries in the second half. Usually Gus.", when: { season: [2] } },
    { text: "Winter, I keep a pot of pepper soup on the back burner. Not on the menu. It goes to whoever looks like they need it.", when: { season: [3] } },
    { text: "Here. Take this pie home. If you leave it, I'll eat it, and then I'll blame you.", when: { time: [1200, 1439], hearts: [3, 10] } },

    // ---- Friends, the back booth
    { text: ["Rule one, baby. What's said in the booth stays in the booth.", "Rule two: nobody leaves hungry. Rule three: if Birdie's crying, you didn't see it."], when: { hearts: [3, 10], place: ['insider'] }, weight: 2 },
    { text: "Madame Midnight managed the Copperhead Sisters. Most hated women in the territory. I loved every second.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "In 1982 I slapped a referee with this fan so hard he called me ma'am for a year. He's a chiropractor now. Still calls me ma'am.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "A heel manager's whole job is being the reason they boo. I was very good at being the reason.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Pitches happen in this booth because nobody can lie with a mouth full of my pie. It's science.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Sit. Eat. Talk. In that order. Then you can tell me who blew the finish. I had the radio on. Gus covered beautifully. Gus always covers beautifully.", when: { showDay: true, place: ['insider'] } },
    { text: ["You and {opponent}. I had Gus on the kitchen radio.", "I burned a grilled cheese at the {finisher}. That's your fault. You're eating it."], when: { place: ['insider'], lastMatch: { maxDaysAgo: 3 } } },
    { text: "Heard you beat {opponent}. Real mug today. Today only. Don't you dare look pleased.", when: { place: ['public'], lastMatch: { won: true, maxDaysAgo: 2 }, alignment: ['face', 'tweener'] }, mood: 'happy' },
    { text: "{opponent} beat you? Sit down. Pie first. Then you can sulk. I've got a sulking stool. It's that one. It wobbles on purpose.", when: { place: ['public'], lastMatch: { won: false, maxDaysAgo: 2 } } },
    { text: "I fed half the roster through the bad years. Birdie paid them first and herself never. Somebody had to make sure she ate.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Openers eat first in this booth. Old rule. You warm up the crowd, I warm up the plate.", when: { rank: ['rookie', 'opener'], place: ['insider'] } },
    { text: "You've got the pencil? Then you sit on the inside of this booth. Birdie's old spot. She'll pretend to mind.", when: { rank: ['assistant', 'pencil', 'owner'], place: ['insider'] } },

    // ---- Close
    { text: "Real mug today. Don't make a thing of it. ...You're making a thing of it.", when: { hearts: [6, 8], place: ['public'] } },
    { text: "You come in looking tired lately. I'm putting extra butter in things. Don't argue. I'm older and I own the butter.", when: { hearts: [6, 10] } },
    { text: "Gossip? Me? Baby, I'm a vault. I'm the vault the other vaults keep their valuables in.", when: { hearts: [6, 10], place: ['public'] } },
    { text: "Gus cried at the counter today. Somebody played his old station jingle on the radio. He was the somebody. Still cried.", when: { hearts: [6, 10] } },
    { text: "Forty years she's sat on the same stool with her back to this booth. You think I don't know what she's not looking at?", when: { hearts: [6, 10], place: ['insider'] } },
    { text: "Birdie and I have argued every day since 1987. If we ever agree on something, check us both for a fever.", when: { hearts: [6, 10], place: ['insider'] } },
    { text: "Don't let that woman sleep on her office couch again. She thinks I don't know. I can smell the Sportatorium on her collar.", when: { hearts: [6, 10], place: ['insider'] } },
    { text: ["1980, a promoter paid me half what he paid the other valets. You know why. I knew why.", "Dottie Dupree walked into his office, shut the door, and didn't come out till he paid me double."], when: { hearts: [6, 10], place: ['insider'] } },
    { text: "I've kept a lot of things for a lot of people, baby. Some of them are on shelves. Some of them are in here.", when: { hearts: [6, 10], place: ['insider'], notFlag: 'truth_revealed' } },
    { text: "Your grandmother's three blocks away and Birdie still won't walk past the Bell. I'm about to start putting pepper in her coffee.", when: { hearts: [6, 10], place: ['insider'], flag: 'grandma_in_town' } },
    { text: "Bring her in on a good day. A quiet hour. I'll set out chicory and two spoons of sugar. I remember how she takes it.", when: { hearts: [6, 10], place: ['insider'], flag: 'grandma_in_town' }, mood: 'sad' },

    // ---- Family
    { text: "You've got a seat at my counter as long as I've got a counter. That's not a figure of speech. I'll fight the bank.", when: { hearts: [9, 10], place: ['public'] } },
    { text: "You're furniture now. Know what that means? You can't leave. Furniture doesn't leave. I've checked.", when: { hearts: [9, 10], place: ['insider'] } },
    { text: "Married? In the ring? I'm catering. Don't even ask. I'm catering, and I'm doing the jollof, and it's not going to be Friday.", when: { married: true } },

    // ---- Main story
    { text: "Forty years I kept those boots and kept my mouth shut. Lord, it's good to open it.", when: { flag: 'truth_revealed', place: ['insider'] } },
    { text: "Two coffees at my counter. One black. One chicory, two sugars. Forty years late, and right on time.", when: { flag: 'reunion_done' }, mood: 'happy', weight: 3 },
  ],
  gifts: {
    loves: ['grandmas-chili', 'sequins', 'teacup'],
    likes: ['coffee', 'bouquet', 'wildflowers', 'honey', 'vinyl', 'tamales'],
    dislikes: ['gas-hotdog', 'protein-shake'],
  },
  giftReplies: {
    love: [
      "For me? You went out of your way for this? Sit down. You're eating free until Thursday.",
      "Oh, baby. Now that's taste. I'm putting this right by the register where I can look at it all day.",
      "Somebody's been paying attention. I don't get surprised often. I'm going to need a minute in the walk-in.",
    ],
    like: [
      "That's sweet of you. Sweet's not on the menu, so I'll take it.",
      "Thank you, baby. Coffee's on the house today. Just today. Don't get comfortable.",
      "Mm. Nice. I'll put it to good use.",
    ],
    neutral: [
      "Hm. Thank you. I'll find it a place. Not a good place. But a place.",
      "Well. It's the thought, baby. I'll take the thought.",
    ],
    dislike: [
      "Is this a threat?",
      "You brought that into my diner. With your hands. On purpose.",
      "Baby. I run a kitchen. Look at me. Look at what you've done.",
    ],
    birthday: [
      "Gus said it on the radio at six a.m. Twice. With a drumroll he did with his mouth. ...A {item}. Thank you, baby. Sit. I'm making you something.",
      "Sixty-seven. I've stopped counting the bangles and started counting the people who come in on this day. You're on the list. With a {item}. Underlined.",
    ],
    byItem: {
      'grandmas-chili': ["(She tastes it off the spoon. She closes her eyes.)", "Dottie's chili. From the back of the poster. You made this? ...More cumin next time. Don't change anything else. Ever."],
      sequins: "Sequins. Madame Midnight had a cape with two thousand of these on it. I sewed every one with a migraine. Look at me smiling about it.",
      teacup: "A teacup. Chipped on the lip. I'll keep it behind the counter for the regulars who are having a day. You'll know if you get it.",
      coffee: "You brought coffee. To a diner. To ME. ...It's not bad. Where'd you get it. Never mind. It's Full Nelson's. I'd know that burn anywhere.",
      bouquet: "Flowers for the counter. Bakery window? Tiny's arrangement. She puts the tall ones in back, like a team photo.",
      wildflowers: "Creek flowers. I'll put them in the ketchup bottle by the register. Nobody uses ketchup here anyway. Not if they know what's good for them.",
      honey: "Honey. For the pepper soup. Nobody knows there's honey in the pepper soup. Now you do. Look what you did.",
      vinyl: "Somebody's entrance music. I managed people who walked out to records like this. I can still hear the needle drop.",
      tamales: "Rosa's tamales. In my diner. We don't speak, Rosa and I. (She's already eating one.) We don't speak.",
    },
    later: [
      "That {lastGift} is by the register. Gus asked if it was for sale. I said everything's for sale except that.",
      "Birdie saw the {lastGift} and asked where I got it. I said 'a customer.' She said 'which one.' I poured her coffee.",
    ],
  },
  again: [
    "Refill? That's the only reason anybody comes back to the counter twice, baby.",
    "(June slides the coffee pot an inch toward you without a word. Conversation over. Coffee continues.)",
    "We talked. I've got a grill full of eggs and a Gus at table four. Later.",
  ],
  idle: [
    "(June is wiping a counter that is already clean, watching the door.)",
    "Coffee's on. Sit or don't. Either way, you're blocking the pie case.",
  ],
  birthday: { season: 1, day: 13 },
  events: [
    {
      id: 'june-2', hearts: 2, map: 'diner', title: 'The Chipped Mug',
      script: async (api) => {
        await api.narrate("June sets a mug in front of you. There's a neat half-moon chip in the rim. She doesn't let go of the coffee pot.");
        await api.say('june', 'Chipped mug till I know what you are, baby. Villains get it forever. Strangers get it till they earn better.');
        await api.say('june', 'So. What are you?');
        const c = await api.choose(null, [
          { label: 'A wrestler.', value: 'wrestler' },
          { label: 'Still figuring that out.', value: 'figuring' },
          { label: 'Hungry, honestly.', value: 'hungry' },
        ]);
        if (c === 'wrestler') {
          api.hearts('june', 15);
          await api.say('june', "Says you. Everybody's a wrestler at this counter. We'll see what you are on a Saturday.");
        } else if (c === 'figuring') {
          api.hearts('june', 30);
          await api.sayMood('june', 'happy', 'Honest answer. I like an honest answer. Most people lie to me before I pour the second cup.');
        } else {
          api.hearts('june', 30);
          await api.narrate("June's mouth twitches, which for June is a belly laugh.");
          await api.say('june', 'Now THAT I can work with.');
        }
        await api.narrate("A slice of pie arrives that you didn't order. The chipped mug stays right where it is.");
        await api.say('june', "Pie's for the honesty. Mug's for the rest. Come back tomorrow.");
      },
    },
    {
      id: 'june-4', hearts: 4, map: 'diner', title: 'Three Rules',
      script: async (api) => {
        await api.narrate('After a show. June walks past the counter, past the register, and stops at the back booth. She points at the seat across from her.');
        await api.say('june', "Sit. You've been invited. That's rarer than you think.");
        await api.say('june', 'This booth has three rules. Posted nowhere. Known by all.');
        await api.say('june', "One. What's said in the booth stays in the booth. Two. Nobody leaves hungry.");
        await api.say('june', "Three. If Birdie's crying, you didn't see it.");
        const c = await api.choose(null, [
          { label: 'Repeat all three back to her', value: 'repeat' },
          { label: 'What happens if somebody breaks one?', value: 'break' },
        ]);
        if (c === 'repeat') {
          api.hearts('june', 30);
          await api.narrate('You say all three, in order. June nods once, like a judge.');
          await api.say('june', "Good. You listen. Listening's the whole business, baby.");
        } else {
          api.hearts('june', 15);
          await api.say('june', "Nobody has. I'm sixty-six years old and I still have my fan. Draw your own conclusions.");
        }
        await api.narrate('She sets a new mug in front of you. Plain white. Not a chip on it.');
        await api.sayMood('june', 'happy', "Real mug. Don't make a thing of it. ...You're making a thing of it.");
      },
    },
    {
      id: 'june-6', hearts: 6, map: 'diner', title: 'The Fan',
      script: async (api) => {
        await api.narrate('A slow afternoon. June slides into the back booth across from you and sets down a jeweled folding fan, heavy with rhinestones.');
        await api.say('june', "Madame Midnight's fan. I slapped more referees with this than I can count. One's a chiropractor now. Still calls me ma'am.");
        await api.say('june', "1980. I'm valeting for a promoter who pays me half what he pays the other valets. You know why. I knew why.");
        await api.say('june', "I didn't say a word. I needed the work. But somebody heard about it.");
        await api.narrate('She opens the fan. Closes it. Opens it.');
        await api.say('june', "Dottie Dupree walked into that man's office, shut the door, and didn't come out for an hour. When she did, he was paying me double.");
        await api.sayMood('june', 'sad', 'Never told me what she said in there. Never brought it up again. Just bought me a coffee and asked after my mama.');
        await api.say('june', "That's who she was, baby. Whatever anybody says she did.");
        const c = await api.choose(null, [
          { label: 'What do you think happened in 1983?', value: 'ask' },
          { label: 'Just sit with her a minute', value: 'sit' },
        ]);
        if (c === 'ask') {
          api.hearts('june', 15);
          await api.say('june', "What I think and what I know are two different drawers, and one of 'em's locked. Eat your pie.");
        } else {
          api.hearts('june', 30);
          await api.narrate('You sit. The fan lies open between you. Outside, someone laughs on the sidewalk. June refills your coffee without looking.');
          await api.say('june', "...You're all right.");
        }
      },
    },
    {
      id: 'june-8', hearts: 8, map: 'diner', title: 'Top Shelf', when: { flag: 'grandma_in_town' },
      script: async (api) => {
        await api.narrate('Closing time. June flips the sign, crooks a finger at you, and walks into the storeroom.');
        await api.narrate('Flour sacks. Canned tomatoes. A ladder. She climbs it slowly, bangles chiming, all the way to the highest shelf.');
        await api.narrate('She comes down with a bundle wrapped in a red checkered tablecloth and unfolds it on a crate like an altar.');
        await api.narrate('A pair of white ring boots. Old leather, scuffed gray at the toes. The laces are still tied in a bow somebody tied a long time ago.');
        await api.say('june', "Forty years these have been on that shelf. I dust them every spring. Never once put them on. They're not mine to wear.");
        const c = await api.choose(null, [
          { label: 'Whose are they?', value: 'whose' },
          { label: 'Help her wrap them back up', value: 'wrap' },
        ]);
        if (c === 'whose') {
          api.hearts('june', 15);
          await api.say('june', "Not yet, baby. I'll tell you. But not in a storeroom, and not before I've decided I'm allowed.");
        } else {
          api.hearts('june', 30);
          await api.narrate('You fold the tablecloth corner by corner. June watches your hands the whole time.');
          await api.say('june', "Gentle. Good. You'd be surprised how few people are gentle with old things.");
        }
        await api.narrate('She climbs back up and sets them on the highest shelf, exactly where they were, toes out.');
        await api.sayMood('june', 'sad', "Somebody's going to need these again. I always knew it. I just didn't know it'd be you who walked in my door.");
      },
    },
    {
      id: 'june-10', hearts: 10, map: 'diner', title: 'Furniture',
      script: async (api) => {
        await api.narrate("Late. Everybody's gone home. June sits across from you in the back booth with a pocketknife and a look you've never seen on her: shy.");
        await api.say('june', 'You know what these are?');
        await api.narrate('She runs a finger along the edge of the table. Carved into the wood, worn soft by forty years of elbows: *B.M. D.D. J.O. S.L.*');
        await api.say('june', "Birdie. Dottie. Me. Sweet Lou. 1981, the night they won the belt. Dottie carved. Birdie held the flashlight. Lou sang.");
        await api.say('june', "When I bought this place in '87, the bank called the booth a fixture. I called it family. I won.");
        await api.narrate('She opens the knife and hands it to you, handle first.');
        await api.say('june', "Go on. Right there, next to mine. Nobody's been added since.");
        const c = await api.choose(null, [
          { label: 'Carve your initials', value: 'carve' },
          { label: 'Ask her to carve them for you', value: 'her' },
        ]);
        api.hearts('june', 30);
        if (c === 'carve') {
          await api.narrate("You carve slowly. It comes out crooked. June doesn't say one word about the crooked part, which is how you know she loves you.");
        } else {
          await api.narrate('June takes the knife back and carves your initials in neat, fierce strokes beside her own. Then she blows the sawdust away.');
        }
        await api.sayMood('june', 'happy', "Now you're furniture. Congratulations. Furniture doesn't leave, baby. I've checked.");
      },
    },
  ],
} satisfies DialogueSet;
