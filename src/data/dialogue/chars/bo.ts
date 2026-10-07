import type { DialogueSet } from '../types';

/**
 * Bo Bruiser (Bo Kowalski), 33, the careful twin. Co-owner of Steel Chair
 * Hardware with Buck. Older by four minutes and has mentioned it about nine
 * thousand times. Label-maker holstered like a sidearm. Took ballet until
 * fourteen and quit the week Buck laughed (Buck does not remember). Does the
 * books at two a.m. so Buck won't worry.
 *
 * Their real surname is Kowalski; Coach Patty is their aunt, so every Thursday
 * pot roast is conducted in kayfabe. In public they boycott Tiny's bakery; at
 * night they buy cupcakes through the back door.
 *
 * Flags set here: 'bo_books' (4), 'bo_ballet' (6), 'bo_offer' (8), 'bo_stay' (10).
 * 'twins_wall' is the joint 10-heart event ("Same Wall"); it needs Buck's
 * 'buck_notebook' and lives here because it is delivered to Bo.
 */
export default {
  npc: 'bo',
  intro: [
    "(A square-bearded man with a label maker holstered at his hip is labeling a stack of towels. The label reads: TOWELS (CLEAN).)",
    "Bo Kowalski. In public I'm Bo Bruiser. Older by four minutes, if anyone asks. Someone always asks.",
    "The brawling is Buck's idea. The yelling at each other is real. You can't fake a brother.",
    "If you need a toolbox, I'll sell you one. If you need a label, I'll make you one. I am extremely available for labels.",
  ],
  introPublic: [
    "(Behind the hardware counter, a man with a square-trimmed beard and a red flannel looks up. His label maker clicks like a drawn sword.)",
    "Steel Chair Hardware. Aisle four, bottom shelf. If that chair's for the Mountain, it's rated for three hundred pounds. Not his feelings.",
    "Don't touch the labels. The labels are a system. The system is load-bearing.",
  ],
  lines: [
    // ---------------------------------------------------------------- Public: the store, the boycott
    { text: "Aisle four, bottom shelf. And if that chair's for the Mountain, it's rated for three hundred pounds. Not his feelings.", when: { hearts: [0, 2], place: ['public'], map: ['hardware'] }, weight: 2 },
    { text: "Buck is wrong. Whatever he said. I'm older by four minutes. I was right *first.*", when: { place: ['public'] } },
    { text: "(Bo is labeling the labels.) Don't touch the labels. The labels are a system. The system is *load-bearing.*", when: { place: ['public'], map: ['hardware'] } },
    { text: "Hero. Fine. Rope is two dollars a foot. Heroes pay more. There's no sign. The sign is in my heart.", when: { place: ['public'], alignment: ['face'] }, mood: 'smug' },
    { text: "A villain. We have a discount: ten percent. We also have a *rival* discount. It's zero. It's for you.", when: { place: ['public'], alignment: ['heel'], flag: 'debuted' }, mood: 'smug' },
    { text: "We do not patronize Tallbridge Bakery. A villain surcharge is an *insult.* We've never once been inside. There is a back door. I've never seen it.", when: { place: ['public'] } },
    { text: "Thursday dinner at my aunt's. Pot roast. She asks if the Bruiser thing is 'fake.' I say it's the realest thing I've ever done. She says that's not an answer.", when: { place: ['public'], hearts: [3, 10], weekday: [3] }, weight: 2 },
    { text: "Friday night Buck plays harmonica on the radio. With Gus. I listen with the radio facing the wall, so it doesn't look like listening.", when: { place: ['public'], hearts: [3, 10], weekday: [4] } },
    { text: "Tonight: Measure Twice, Cut Once. And if Buck's late for the tag again, I'm hitting *him.*", when: { showDay: true, place: ['public', 'show'] }, weight: 2 },
    { text: "Hank is in the back workshop borrowing our clamps again. She treats us like nephews. We *are* nephews who keep borrowing clamps.", when: { place: ['public'], hearts: [3, 10] } },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "Umbrellas are up nine percent since Monday. Buck thinks it's his window sign. His window sign says UMBRELLAS? with a question mark.", when: { weather: ['rain'] } },
    { text: "Storm. We have four hundred tarps. Buck says that's too many. Buck has never been in a storm. Buck has been in every storm. He forgets.", when: { weather: ['storm'] } },
    { text: "Man came in at six for rock salt, in slippers. I sold him salt and boots. He thanked me for the boots more. People always thank you for the boots.", when: { weather: ['snow'] } },
    { text: "Wind took the OPEN flag down Main Street again. Pip brought it back and asked for a reward. I printed him a label. PIP (HELPFUL). He wore it to school.", when: { weather: ['wind'] } },
    { text: "Hank bought forty feet of lumber 'for ring repairs' and asked me not to write down the ring part. I wrote it down. I write everything down.", when: { season: [0] }, weight: 2 },
    { text: "Buck's been sleeping on the roof since June. For the breeze, he says. The breeze is a box fan on my extension cord. My good one. The orange one.", when: { season: [1] } },
    { text: "Inventory's in three weeks. I've marked it on three calendars, in case two of them are lying.", when: { season: [2] } },
    { text: "I've bought Buck a tape measure every Christmas for nine years. He's lost all nine. This year I'm not wrapping it. I'm handing it to him with a look.", when: { season: [3] } },

    // ---------------------------------------------------------------- Insider: Bo, unlabeled
    { text: "I do inventory at night. It's calming. Nothing in the ledger is on fire.", when: { place: ['insider'], hearts: [0, 3] } },
    { text: "In here I can say it: I love inventory. Counting things makes me feel like the world *has* an end.", when: { place: ['insider'] } },
    { text: "Buck's 'self-tightening turnbuckle' tightened itself around Marigold's good scissors. I'm not saying it's his fault. I'm saying I labeled it FUTURE LAWSUIT.", when: { place: ['insider'] }, mood: 'happy' },
    { text: "We buy cupcakes from Tiny's back door. Twelve at a time. Buck eats nine. I count. Tiny knows I count. She puts in a thirteenth so the count comes out wrong.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Dinner at Aunt Patty's: we argue for real. She's never gotten a straight answer about the Bruiser thing because there isn't one. There's a crooked one. It's ours.", when: { place: ['insider'] } },
    { text: "Stan and Donna call weekly from Arizona with grout advice. We don't have a tile floor. They know. They offer it anyway. It's love.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Dad always said the Velvet Hammers 'have to get mended someday, or this town never will.' He sold Hank her first table saw that winter. Dad's never wrong about tools.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Buck's songs live in the bait fridge. I've read every one. They're all sad. I've never told him they're good. ...They're good. I'd never say it to his face. His face would be unbearable for a month.", when: { place: ['insider'], hearts: [6, 10] } },
    { text: "Sundays Buck goes fishing and writes songs; I do inventory. It's the best day of our week. We're apart and we're both happy. We'd deny it at the same time, in two different keys.", when: { place: ['insider'], hearts: [6, 10], weekday: [6] } },
    { text: "Rule one of the Bruiser Twins: argue in public. Rule two: never in front of Pip. He thinks it's a real fight. He cries. It's terrible.", when: { place: ['insider'] } },
    { text: "You're new. Measure twice, cut once. In the ring that means: check your landing twice, take the bump once. Also, check your wrist tape twice.", when: { place: ['insider'], rank: ['rookie', 'opener'] } },
    { text: "Main event. That's a lot of inventory to carry. Label it. It helps. It always helps.", when: { place: ['insider'], rank: ['main', 'assistant', 'pencil', 'owner'] } },
    { text: "Show day. Buck's late. Buck is always late. And somehow he has never missed a tag. It's *infuriating.*", when: { place: ['insider'], showDay: true }, mood: 'angry' },
    { text: "Thin wall in the duplex. Buck's side is the loud side. Mine's the one with the rules. We don't knock anymore.", when: { place: ['insider'], hearts: [6, 10], notFlag: 'twins_wall' }, mood: 'sad', weight: 2 },

    // ---------------------------------------------------------------- After the events
    { text: "Don't look at the numbers. The numbers and I have an understanding: they don't call me, I don't call them.", when: { flag: 'bo_books', place: ['insider'], notFlag: 'bo_stay' } },
    { text: "Fifth position. Don't. Don't say it. It's a *stance.* A very specific stance.", when: { flag: 'bo_ballet', place: ['insider'] }, mood: 'smug' },
    { text: "The letter's in my drawer, under the staples. I haven't told him. I'll tell him. After the show. After the *next* show.", when: { flag: 'bo_offer', notFlag: 'bo_stay', place: ['insider'] }, mood: 'sad', weight: 3 },
    { text: "I told him. It took four hours, two sandwiches, and a minor argument about whose turn it was to talk. He asked me to stay. That's all I wanted. I know. I'm ridiculous.", when: { flag: 'bo_stay', place: ['insider'] }, mood: 'happy', weight: 2 },
    { text: "We knock now. Two and three. I won't say what they mean. ...You know what they mean.", when: { flag: 'twins_wall', place: ['insider'] }, mood: 'love', weight: 3 },
    { text: "He's the only person alive who knows what I sounded like before my voice dropped. He does an impression. It's accurate. I hate it.", when: { hearts: [9, 10], place: ['insider'] } },
    { text: ["You beat us. I've written down how.", "Page three of the notebook is the word 'how', underlined twice. Buck added a drawing. It's a duck. I don't know why it's a duck."], when: { place: ['insider'], lastMatch: { won: true, opponent: ['bo', 'buck'], maxDaysAgo: 5 } } },
    { text: "I timed you and {opponent}: sixteen minutes, four seconds. Buck says fifteen. Buck's stopwatch has a dent in it.", when: { place: ['insider'], lastMatch: { maxDaysAgo: 3 } } },
  ],
  gifts: {
    loves: ['tape', 'vinyl', 'coffee'],
    likes: ['chalk', 'plank', 'old-program', 'pie'],
    dislikes: ['fiber', 'scrap', 'funnel-cake'],
  },
  giftReplies: {
    love: [
      "(He inspects it, turns it a quarter turn, and nods.) Perfect. This goes *exactly* here. I'll label the spot.",
      "You absolute professional. ...I'm going to alphabetize something. Quickly. Don't watch.",
      "Nobody ever gets me the right thing. They get me *a* thing. You got me *the* thing. I'm adding you to the file. Under 'good.'",
    ],
    like: [
      "That's useful. I'll find a drawer. I have exactly one drawer left.",
      "Hm. Yes. Acceptable. More than acceptable. I'll write you a receipt.",
      "Thank you. It's thoughtful. It's also, somehow, the right size.",
    ],
    neutral: [
      "I'll... inventory it. Someday. It'll be a good day.",
      "Ah. A gift. I'll make a label for it. 'GIFT (SEE ME).'",
    ],
    dislike: [
      "This is *messy.* It's unlabeled. I can't accept something that isn't labeled.",
      "I'm sure it's lovely. I'll be sure not to look at it.",
      "Please. Take it back. My shelves are in a state of grace.",
    ],
    birthday: [
      "Our birthday. I was born four minutes earlier, which means I get thanked first. ...Thank you for the {item}. I've labeled it already. In my head.",
      "Summer, the second. Buck will say it's his day. It's both. I've checked the certificate. He's on the second line.",
    ],
    byItem: {
      tape: "Athletic tape. The good roll, with the tear-edge that actually tears. You know how rare that is? Buck doesn't. Buck uses his teeth.",
      vinyl: "1984 pressing. The sleeve has a coffee ring. I'm not going to clean it. Somebody had coffee listening to this. That's provenance.",
      coffee: "Black. No sugar. You noticed. Nobody notices. Buck puts sugar in mine to see if I'll say something. I always say something.",
      chalk: "Chalk. I'll put it in the bin marked CHALK. It's been empty since March. The bin will be relieved.",
      plank: "Good straight board. Barely a knot. I'm going to stand it in the corner and not use it for a while. A man can admire a board.",
      'old-program': "1979 card. Look at the margins on this thing. Somebody printed this with a ruler and a prayer.",
      pie: "Pie. I'll split it with Buck exactly down the middle. I have a tool for that. He'll still say mine's bigger.",
    },
    later: [
      "The {lastGift} has a label now. It says {lastGift} (FROM A FRIEND). I went back and forth on FRIEND. I kept it.",
      "Buck asked about the {lastGift}. I said it's mine. He said 'whose?' I said MINE. We've been doing that for three days.",
    ],
  },
  again: [
    "We spoke. I've logged it. Is this a follow-up?",
    "(Bo holds up the label maker and prints something without looking. It says BUSY.)",
    "Aisle four, bottom shelf. Whatever it is. It's usually aisle four.",
  ],
  idle: [
    "(Bo is restacking paint cans so the labels all face the same way.)",
    "Buck's in the back. Or the roof. Or the creek. I'll find him at closing. I always find him at closing.",
  ],
  birthday: { season: 1, day: 2 },
  events: [
    // ---------------------------------------------------------------- 2: FEELINGS (EMPTY)
    {
      id: 'bo-2', hearts: 2, map: 'hardware', title: 'Feelings (Empty)',
      script: async (api) => {
        await api.narrate("Steel Chair Hardware. You come in for a hammer and a cheap red toolbox, for the backyard ring. Bo sets them on the counter side by side and clears his throat.");
        await api.say('bo', "May I? It's a small thing. It will take four minutes.");
        await api.narrate("He unholsters the label maker. Click-click-click. HAMMER. NAILS (BRIGHT). NAILS (DULL). TAPE. Every drawer. Every compartment. Then the bottom drawer.");
        await api.narrate("*FEELINGS (EMPTY).*");
        await api.say('bo', "It's a joke. It's a very good joke. The drawer is empty. I checked.");
        await api.narrate("From the stockroom, a voice: \"BO! IT'S IN AISLE FOUR, NOT AISLE NINE!\" Bo doesn't move. \"It's in aisle *nine*,\" he mutters.");
        const c = await api.choose('Bo hands you the toolbox with both hands, like a plaque.', [
          { label: 'Put your receipt in the FEELINGS drawer', value: 'fill' },
          { label: 'Laugh. "That\'s a good joke."', value: 'laugh' },
          { label: 'Peel the label off the drawer', value: 'peel' },
        ]);
        if (c === 'fill') {
          api.hearts('bo', 30);
          await api.narrate("You fold the receipt in half and tuck it in the bottom drawer. Bo stares. In the history of the label, nothing has ever been in that drawer.");
          await api.say('bo', "...That's the first time. In the system. Ever. I'm going to need to relabel it. 'FEELINGS (ONE).'");
        } else if (c === 'laugh') {
          api.hearts('bo', 15);
          await api.sayMood('bo', 'happy', "Thank you. It's the best one I've got. The rest are about washers.");
        } else {
          api.hearts('bo', -10);
          await api.narrate("You peel the label off, thumbnail under the corner. Bo watches, motionless, as it comes away.");
          await api.say('bo', "It's... fine. It was a joke. I'll print another. It's fine.");
          await api.narrate("He doesn't print another. He puts the label maker back in its holster, slowly, and it's the first time you've seen him do it without clicking it twice.");
        }
        await api.narrate("As you go, you notice a tiny second label on the inside of the lid, almost hidden: *WELCOME. (IF YOU'RE STAYING.)*");
      },
    },
    // ---------------------------------------------------------------- 4: Two a.m.
    {
      id: 'bo-4', hearts: 4, map: 'hardware', title: 'Two A.M.',
      script: async (api) => {
        await api.narrate("A slow afternoon at the store. Bo flips the ledger closed the second you walk in, slides it under the counter, and says nothing for four seconds.");
        await api.say('bo', "Come by after close. The back office. Buck doesn't need to know. Buck doesn't need to know *anything.*");
        await api.fade();
        await api.narrate("Two a.m. The shop is dark except for a desk lamp in the back office. Over your head, through the ceiling, the faint sound of a man snoring like a tractor.");
        await api.say('bo', "That's Buck. It's the most reassuring sound I know. And the most expensive.");
        await api.narrate("He opens the ledger. Column after column of black ink, then a line of red ink, then more.");
        await api.say('bo', "The numbers aren't great. Not terrible. Aisle nine's been slow. The big box on Route Nine undercuts us on everything but advice. We win on advice. You can't pay rent in advice.");
        await api.say('bo', "I do the books at two. Every night. He sleeps. I don't want him to worry. Buck worries *loudly.* The whole building would know by breakfast.");
        const c = await api.choose(null, [
          { label: '"Let me look at the numbers with you."', value: 'look' },
          { label: '"What if the Sportatorium bought its chairs from you? By the dozen?"', value: 'idea' },
          { label: '"Tell Buck. He\'s your brother."', value: 'tell' },
        ]);
        if (c === 'look') {
          api.hearts('bo', 30);
          await api.narrate("You pull up a stool. The two of you go line by line until the sky outside the shop window starts to go gray.");
          await api.say('bo', "Nobody has ever looked at the ledger with me. It's a very intimate document. I'm not sure how I feel. ...I feel good. The ledger can find out on its own.");
        } else if (c === 'idea') {
          api.hearts('bo', 30);
          await api.sayMood('bo', 'surprised', "Birdie's *always* short on chairs. A standing order. A contract. With an invoice.");
          await api.say('bo', "I'd have to label every one of them. ...I would love that so much. I'm going to call her at nine. At eight fifty-nine, I'm going to rehearse.");
        } else {
          api.hearts('bo', 15);
          await api.say('bo', "I know. I'll tell him. Soon. When there's something to tell that isn't just a number. ...Soon.");
        }
        api.flag('bo_books', true);
        await api.narrate("When you leave, you hear a floorboard creak overhead, and a sleepy voice through the ceiling: \"BO? You up?\" Bo looks at the ceiling, and at you. He puts a finger to his lips.");
        await api.say('bo', "(Calling up, easy and bored.) Just the ice machine! Go back to sleep!");
      },
    },
    // ---------------------------------------------------------------- 6: Fifth position
    {
      id: 'bo-6', hearts: 6, map: 'hardware', when: { showDay: true }, title: 'Fifth Position',
      script: async (api) => {
        await api.narrate("Show day. Bo shoves the twins' shared tool belt into your arms before opening, already halfway back to his office.");
        await api.say('bo', "Take that to the Sportatorium for me, would you? Locker room. I'll be along. Don't wait. ...Actually do wait. Don't. Wait. I mean it either way.");
        await api.fade();
        await api.narrate("The locker room is empty, except for faint music from somewhere behind the lockers, and a rhythmic *thump, thump* of something light and controlled.");
        await api.narrate("In the clear space behind the benches, Bo is standing in fifth position. Plié. Relevé. A slow, perfect port de bras. His red flannel is on a hook. His arms are doing something the word 'hardware' cannot describe.");
        await api.narrate("He sees you in the mirror and freezes mid-movement. For a long moment he doesn't breathe.");
        await api.say('bo', "...Fourteen. Until I was fourteen. Then I quit. It's a stretch. It's a *stance.* It's a very specific stance.");
        await api.say('bo', "You will swear on the tool belt you didn't see this. Say it. I mean the oath.");
        const c = await api.choose(null, [
          { label: '"I swear. Not a word. Ever."', value: 'swear' },
          { label: '"That was beautiful. You should keep doing it."', value: 'beautiful' },
          { label: '"Does Buck know?"', value: 'buck' },
        ]);
        if (c === 'swear') {
          api.hearts('bo', 30);
          await api.narrate("You put a hand on the tool belt, solemnly. Bo exhales for the first time in a minute, and the hint of a smile appears.");
          await api.say('bo', "Thank you. I do it before every show. It's the only way my knees agree to the Inventory. They like to know there's a point.");
        } else if (c === 'beautiful') {
          api.hearts('bo', 30);
          await api.narrate("He turns away, and fusses with the barre for a while, which is actually a bench.");
          await api.sayMood('bo', 'sad', "Thank you. I'd like to think it's... good. I haven't had anyone to ask since I was fourteen.");
        } else {
          api.hearts('bo', -10);
          await api.sayMood('bo', 'angry', "No. And he never will. He laughed once, you understand? *Once.* I was fourteen. He doesn't even remember.");
          await api.narrate("He sits on the bench, stiff-backed, shoes still on. You've never seen him look so completely out of order.");
          await api.say('bo', "...I'm sorry. I'm not mad at you. I'm mad at a laugh from nineteen years ago.");
        }
        api.flag('bo_ballet', true);
        await api.narrate("Bo returns to the hook, pulls on the flannel, and re-holsters the label maker. He is, once again, a hardware store.");
        await api.say('bo', "There's a VHS in my drawer, 'The Nutcracker, 1987.' I've watched it forty times. The sugar plum fairy's footwork is a *masterclass in inventory.*");
      },
    },
    // ---------------------------------------------------------------- 8: BigBox
    {
      id: 'bo-8', hearts: 8, map: 'hardware', title: 'Security',
      script: async (api) => {
        await api.narrate("Bo flips the sign to BACK IN FIFTEEN MINUTES (A LIE), sets a thick envelope in front of you, and says only: \"Hot Tag. Back booth. I need to say this out loud to someone who isn't Buck.\"");
        await api.fade();
        await api.narrate("The back booth. June has put a plate of oatmeal raisin cookies in front of Bo without being asked. He stares at them like a verdict.");
        await api.say('bo', "BigBox Home & Garden. In the city. They want me as Regional Hardware Manager. Salary. Benefits. A *dental plan.* A label maker the size of a toaster.");
        await api.say('bo', "I haven't told Buck. I... have told no one. This is the telling.");
        await api.say('bo', "It's security. Real security. I wouldn't count down to the first of the month at two in the morning. I wouldn't have to count anything but things I *like.*");
        await api.sayMood('bo', 'sad', "And I'd leave. And he'd be here. With the store and the wall and the thing we don't knock on.");
        const c = await api.choose(null, [
          { label: 'Just listen. Say nothing. Let him talk it out.', value: 'listen' },
          { label: '"Sleep on it. Don\'t decide at two a.m."', value: 'sleep' },
          { label: '"Take it. Security is security."', value: 'take' },
        ]);
        if (c === 'listen') {
          api.hearts('bo', 30);
          await api.narrate("You listen. He talks for twenty minutes. At the end, he realizes he hasn't once said the word 'want.'");
          await api.say('bo', "Huh. I didn't say what I want. Not once. That's... a noticeable gap in the inventory.");
        } else if (c === 'sleep') {
          api.hearts('bo', 15);
          await api.say('bo', "Sound advice. I'll put it in the 'later' folder. The 'later' folder is very full.");
        } else {
          api.hearts('bo', -10);
          await api.say('bo', "Right. Security. That's... a reasonable position.");
          await api.narrate("He nods, once, with the careful politeness of a man who was hoping for a different answer, and slides the envelope back into his flannel. He doesn't eat the cookies.");
        }
        api.flag('bo_offer', true);
        await api.say('bo', "Don't tell him. Not yet. I'll tell him. After the show. After the *next* show.");
      },
    },
    // ---------------------------------------------------------------- 10: Ask me to stay
    {
      id: 'bo-10', hearts: 10, map: 'hardware', title: 'Stay',
      script: async (api) => {
        await api.narrate("Bo's waiting behind the counter, ledger in one hand, the BigBox envelope in the other. He's wearing a pressed shirt. For him, that's armor.");
        await api.say('bo', "I'm telling him today. I'd like you here. As a witness. Or a buffer. Either's acceptable.");
        await api.narrate("From the stockroom, Buck comes out wiping sawdust off his hands, humming something sad. He stops when he sees two faces.");
        await api.say('buck', "...What. What did I do. Whatever it is, Bo started it.");
        await api.say('bo', "Nothing. Sit. Please. I have to tell you something, and I've rehearsed it, and I'm going to say it wrong.");
        await api.narrate("He puts the envelope on the counter. He explains it all, from the beginning. The manager's job. The dental plan. The salary. It takes four hours, two sandwiches, and a minor argument about whose turn it is to talk.");
        await api.narrate("When he finishes, the store is quiet. Buck is staring at the envelope. His face has lost its jokes.");
        await api.say('buck', "...Do you want to go?");
        await api.narrate("Bo opens his mouth, and nothing comes out. The ledger shakes in his hand.");
        const c = await api.choose('Bo looks at you. Buck looks at the floor.', [
          { label: 'Say nothing. This is theirs.', value: 'silent' },
          { label: '"Bo. Say what you want."', value: 'say' },
        ]);
        if (c === 'silent') {
          api.hearts('bo', 30);
          await api.narrate("You stay out of it. It's the hardest thing you've done all week.");
        } else {
          api.hearts('bo', 15);
          await api.narrate("Bo nods to you, a quick, grateful flick of the head. You've handed him a lever.");
        }
        await api.say('bo', "I don't want to go. I never did. I wanted... I wanted you to *ask me to stay.* That's all. That's the whole inventory. I wanted you to ask.");
        await api.sayMood('buck', 'sad', "...Stay. Bo. *Stay.* You idiot. I'd... I'd be a disaster. I'd put my hat on backwards. Constantly.");
        await api.narrate("They look at each other across the counter. Neither moves. Then, at the same moment, as if on a signal, they both reach for a high-five and miss, and it turns into a very awkward, very hard hug that knocks over a rack of washers.");
        await api.say('bo', "I'll have to restock that. ...I don't care. Leave it.");
        api.flag('bo_stay', true);
        await api.narrate("Bo drops the BigBox envelope in the shredder. It takes four sheets at a time, and it takes a long time. He doesn't take his eyes off it.");
      },
    },
    // ---------------------------------------------------------------- Joint (needs Buck's 10): Same Wall
    {
      id: 'twins-same-wall', hearts: 10, map: 'hardware', when: { flag: 'buck_notebook' }, title: 'Same Wall',
      script: async (api) => {
        await api.narrate("You hand Bo a battered spiral notebook, still cold from the bait fridge. He turns the pages carefully, as he'd handle any fragile inventory, and stops on the last one.");
        await api.say('bo', "'Same Wall.' He wrote this about me.");
        await api.narrate("He reads it aloud, very quietly, his thumb under each line.");
        await api.say('bo', "'There's a wall between our rooms, thin as a dime. I can hear you in the dark, hear you snore all the time.'");
        await api.say('bo', "'Two knocks used to ask, *you awake?* back then. And three said, *me too.* I'd give anything to knock again.'");
        await api.narrate("He closes the book. For a very long time, Bo doesn't speak. Then he takes the label maker from his belt, sets it down on the counter, and says:");
        await api.say('bo', "Come by tonight. After close. I need a witness. ...Bring a pillow. This may take some time.");
        await api.fade();
        await api.narrate("The landing above the store, late. Two doors side by side, one red, one blue, a thin wall between them. You sit on the top stair in the dark. A strip of light shows under each door.");
        await api.narrate("Silence. A clock ticks somewhere. Then, from behind the red door: two knocks. Careful. Even. Measured, as if someone had tested the weight of the fist first.");
        await api.narrate("Nothing. A long pause. Nine seconds. You count them.");
        await api.narrate("Then from the blue door, three knocks. Fast, loud, a little out of rhythm. Followed by a muffled 'ow,' as if someone had hit a stud.");
        await api.narrate("From both sides of the wall, at once, two very different laughs.");
        await api.narrate("Both doors open. Bo, in pressed pajamas. Buck, in a sweater with a hole in the elbow. They look at each other across the landing, as if for the first time in years.");
        await api.say('bo', "You awake?");
        await api.say('buck', "Obviously.");
        const c = await api.choose('They both turn to look at you on the stair.', [
          { label: 'Stay. Accept the cocoa.', value: 'stay' },
          { label: 'Slip quietly out and give them the landing', value: 'slip' },
        ]);
        if (c === 'stay') {
          api.hearts('bo', 30);
          await api.say('bo', "I'm making cocoa. Don't touch the labels.");
          await api.say('buck', "Bo. It's a mug. It's *his* mug. Let him have the mug.");
          await api.narrate("You spend an hour on the landing with two brothers and one pot of cocoa, and the whole time, neither stops talking.");
        } else {
          api.hearts('bo', 30);
          await api.narrate("You get up as softly as you can. At the bottom of the stairs, you hear Bo's voice, careful: \"Do you want cocoa?\" And Buck's: \"Do I want cocoa. Bo. *Bo.*\"");
        }
        api.flag('twins_wall', true);
      },
    },
  ],
} satisfies DialogueSet;
