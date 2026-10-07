import type { DialogueSet } from '../types';

/**
 * Tamsin "Tiny" Tallbridge, 39. Seven feet tall, owner of Tallbridge Bakery
 * ("Tiny Cakes, Big Love"), a hero who apologizes before she hits. Very nearly
 * the same person in and out of the ring (which is a relief to her), sharper and
 * more competitive than people expect: eight county-fair pie contests lost to
 * Agnes Pickett's cherry lattice. Makes her cakes small because it's something
 * in the world she can hold without breaking it.
 *
 * Public price board includes "Villain Surcharge: $1". When she's booked as a
 * villain she charges herself, in public, putting quarters in her own register.
 *
 * Flags set here: 'tiny_pie_plan' (4), 'tiny_dollhouse' (6), 'tiny_fenwick' (8),
 * 'tiny_pie' = 'cherry' | 'peach' (10).
 * 1983: her dollhouse Duchess is the first time in forty years anybody put
 * Dottie back inside the Sportatorium.
 */
export default {
  npc: 'tiny',
  intro: [
    "(A seven-foot woman in a pink apron the size of a bedsheet bonks her head on the locker room doorframe. She apologizes to it.)",
    "Sorry! Sorry. Tamsin. Tiny. Tamsin Tallbridge. Everybody calls me Tiny. It's a joke. It's a *good* joke. Then I make them cake.",
    "I bake in the mornings and wrestle on Saturdays. I'm very sorry about the second one. In advance. For whoever's across from me.",
    "Come by the bakery. Mind the doorframe. I'll make you something so small it's a secret.",
  ],
  introPublic: [
    "(A seven-foot woman in a pink apron ducks under the bakery doorway with great ceremony, and bonks the other one. She apologizes to it.)",
    "Tamsin Tallbridge! Tiny, to everybody who's ever met me. Welcome to Tallbridge Bakery. Tiny Cakes, Big Love.",
    "Villain surcharge is a dollar. Sorry! Sorry. It's the rules. I didn't make the... okay, I made the rules.",
  ],
  lines: [
    // ---------------------------------------------------------------- Public: the bakery
    { text: "Villain surcharge is a dollar. Sorry! Sorry. It's the rules. I didn't make the... okay, I made the rules.", when: { hearts: [0, 2], place: ['public'], map: ['bakery'] }, weight: 2 },
    { text: "(Tiny ducks under the doorframe with great ceremony, and bonks the other one. She apologizes to it.) Sorry! Sorry. We're working on it.", when: { place: ['public'], map: ['bakery'] } },
    { text: "A hero! Hero's price. That's the regular price. I only *say* 'hero's price' to heroes. It makes everybody feel nice.", when: { place: ['public'], alignment: ['face'] }, mood: 'happy' },
    { text: ["A villain. That'll be a dollar. Sorry! Sorry!", "(She clinks four quarters into her own register to demonstrate. Fair is fair.)"], when: { place: ['public'], alignment: ['heel'], flag: 'debuted' } },
    { text: "Tiny Cakes, Big Love. It's on the sign. The sign is accurate.", when: { place: ['public'], map: ['bakery'] } },
    { text: "Tamsin Tallbridge. The name's a joke. Everybody laughs. Then I make them cake. It works every time.", when: { place: ['public'], hearts: [0, 5] } },
    { text: "Agnes Pickett's cherry lattice has beaten me at the county fair eight years running. I'm not bitter. I'm *baking.*", when: { place: ['public'], hearts: [3, 10] }, weight: 2 },
    { text: "Pip gets a tiny cake at every show. First in line. He salutes. I salute back. It's a thing.", when: { place: ['public'], hearts: [3, 10] }, mood: 'happy' },
    { text: "Fenwick brought me sprinkles again. Rare ones, from somewhere. He started a sentence. He didn't finish it. He never finishes. ...It's a nice sentence, whatever it was.", when: { place: ['public'], hearts: [3, 10], notFlag: 'tiny_fenwick' } },
    { text: "Mondays Earl and I do deliveries in the tiny van. It's tiny for *regular* people. For us it's a clown car. We've been very professional about it.", when: { place: ['public'], weekday: [0] } },
    { text: "The Bruiser Twins have never set foot in my bakery. Not once. (A box labeled 'B&B' sits on the back counter. It's twelve cupcakes. It's always twelve cupcakes.)", when: { place: ['public'], hearts: [3, 10], map: ['bakery'] } },
    { text: "Tonight I bake the concession cakes and then I wrestle. Sorry! Sorry. In advance. For whoever's across from me.", when: { showDay: true, place: ['public', 'show'] }, weight: 2 },
    { text: "I send petits fours to Evening Bell on Fridays. A lady in lavender sends back notes. 'Too much lemon.' 'Perfect lemon.' Toughest critic I've ever had. I've saved every one.", when: { place: ['public'], flag: 'grandma_in_town', weekday: [4] }, mood: 'happy', weight: 2 },
    { text: "Earl's coming at three. Thirty tiny cakes. He eats them one at a time, in silence. It's the most intense thing I've ever watched.", when: { place: ['public'], map: ['bakery'], hearts: [3, 10] } },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "Rain. Everybody wants something warm. Today it's cinnamon rolls. Tomorrow, tiny pot pies. I'm *adaptable.*", when: { weather: ['rain'], place: ['public'] } },
    { text: "Storm. The oven's the warmest room in town. Come sit. I'll bring you a tiny cake and a blanket the size of a sheet.", when: { weather: ['storm'], place: ['public'] } },
    { text: "Snow. I bake at four and make footprints on the walk. They're *very* big footprints. Kids follow them. It's a game.", when: { weather: ['snow'], place: ['public'] } },
    { text: "Wind. Everything's blowing. My hat. My braids. A tray of macarons. ...Okay, that was *forty* macarons.", when: { weather: ['wind'], place: ['public'] } },
    { text: "Sugared violets take three days. You paint every petal with egg white and a brush the size of an eyelash. I'm *so* good at patience. Sorry. I'm bragging.", when: { season: [0], place: ['public'] }, weight: 2 },
    { text: "County fair week. I'm entering a cherry pie *and* a lemon. Agnes enters a lattice. I enter hope. Sorry. And a little rage.", when: { season: [1], place: ['public'] } },
    { text: "Somebody ordered a pumpkin tiny cake and a pumpkin *large* cake under the same name. I think it's Earl. I think it's Earl twice.", when: { season: [2], place: ['public'] } },
    { text: "Winter. Homecoming cakes. Four hundred tiny cakes, each with a tiny pennant. I count them twice. Sorry! Habit.", when: { season: [3], place: ['public'] } },

    // ---------------------------------------------------------------- Insider: Tiny, a little sharper
    { text: "Between you and me? I'm sharper than people expect. 'Tiny' sounds like sprinkles. I'm not. I'm a spreadsheet in a pink apron.", when: { place: ['insider'] }, weight: 2 },
    { text: "Tuck-In isn't a finisher. It's a lullaby. I tuck them in, I sit on them, I pat their head. Birdie says it's the most disrespectful finish in the business. The crowd *loves* it.", when: { place: ['insider'] } },
    { text: "I bonk the curtain rod every Saturday. Every single show. Hank raised it twice. Now she's tied a pom-pom on it so I see it coming. It's pink. She says it's red. It's pink.", when: { place: ['insider'] }, mood: 'happy' },
    { text: "Every chair in town creaks when I sit down. It's a conversation. Most of them say 'sorry.' I say it back.", when: { place: ['insider'] } },
    { text: "Do you know what it's like to go through a doorway sideways for thirty-nine years? I'm not complaining. I'm *describing.* It's a very good doorway skill.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "I make them small because nothing else in my life is. Something in this world that fits in my hand and doesn't break. You get that?", when: { place: ['insider'], hearts: [6, 10] }, mood: 'sad', weight: 2 },
    { text: "My family's dairy farm in Wisconsin. Everyone's under six feet. They bring it up at Christmas. 'Where did we get you?' 'The mailman, Aunt Joan.' It's tradition.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "You're new, so: the apology is the move. 'Sorry! Sorry!' before the hit is half the sell. Make the crowd feel bad for *wanting* it.", when: { place: ['insider'], rank: ['rookie', 'opener'] } },
    { text: "Main event. When it goes right, they remember the ending. When it goes wrong, they remember you. I keep a list of my wrong ones on the fridge, under a croissant magnet.", when: { place: ['insider'], rank: ['main', 'assistant', 'pencil', 'owner'] } },
    { text: ["You and {opponent}! I watched from behind the curtain with a tray of cakes. I ate one at the {finisher}. Out of nerves.", "Then I ate one out of joy. Sorry. Two cakes. The tray's lopsided now."], when: { place: ['insider'], lastMatch: { won: true, maxDaysAgo: 3 } }, mood: 'happy' },
    { text: "{opponent} beat you. Sorry! Sorry. Here. (She produces a cake the size of a button from her apron pocket.) It's for losing. I keep losing cakes on me.", when: { lastMatch: { won: false, maxDaysAgo: 3 } } },
    { text: "Show day. I bake at four, nap at eight, wrestle at eight-thirty. Best schedule I've ever had. The bakery thinks I'm napping till nine. The bakery is very trusting.", when: { place: ['insider'], showDay: true }, mood: 'happy' },
    { text: "Four a.m. is the best hour. The ovens are warm, the street's empty, everything I bake is the first of its kind. ...Sorry. Poetry. It's the butter.", when: { time: [240, 420], place: ['public', 'insider'] }, weight: 2 },

    // ---------------------------------------------------------------- After the events
    { text: "I'm going to beat Agnes. I'm going to do it honestly, with a lattice, on a Tuesday. ...Sorry. I'm very *determined* today.", when: { flag: 'tiny_pie_plan', place: ['insider'], notFlag: 'tiny_pie' } },
    { text: "The dollhouse is coming along. Birdie's porch has a new rocking chair. The Duchess has a lavender cardigan. It's all very cozy. I might move in. I'd fit in the *kitchen.*", when: { flag: 'tiny_dollhouse', place: ['insider'] }, mood: 'happy', weight: 2 },
    { text: "I think Fenwick likes me. I think he has for three years. I think he's been trying to say it. I'm not helping. Am I helping? Am I *supposed* to help?", when: { place: ['insider'], hearts: [6, 10], notFlag: 'tiny_fenwick' }, mood: 'surprised' },
    { text: "Fenwick asked me. I mean he *started* to. I said yes before the end of the sentence. I've never won an argument that fast.", when: { flag: 'tiny_fenwick', place: ['insider'] }, mood: 'love', weight: 2 },
    { text: "The little pie went in Agnes's purse, next to her rain bonnet. She carries it everywhere. Last week she showed it to the *Mayor.*", when: { flag: 'tiny_pie', place: ['insider'] }, mood: 'happy', weight: 2 },
    { text: "She sat in the front row, right next to Agnes, and *both* of them stood up when the music hit. I almost dropped my apron.", when: { flag: 'reunion_done', place: ['insider'] }, mood: 'happy' },

    // ---------------------------------------------------------------- Family
    { text: "You're the one person who's never offered me a stepladder as a joke. That's love. I'm just saying it's love.", when: { hearts: [9, 10], place: ['insider'] }, mood: 'love' },
  ],
  gifts: {
    loves: ['toy-wrestler', 'wildflowers', 'sequins', 'rhinestone'],
    likes: ['honey', 'teacup', 'concha', 'coffee', 'comic'],
    dislikes: ['pie', 'protein-shake', 'gas-hotdog'],
  },
  giftReplies: {
    love: [
      "A teeny... (She holds it up to the light with both enormous hands, tender as anything.) It's going in the dollhouse. The dollhouse has a *porch.* I have a dollhouse porch.",
      "Oh! Sorry, I'm... (She dabs her eyes with the corner of an apron the size of a bedsheet.) It's perfect. It's the exact right size. Do you know how rare that is for me?",
      "You found *the* thing! Nobody finds the thing. I'm going to bake you something so small you'll need a magnifying glass to find it.",
    ],
    like: [
      "Oh, that's lovely! Thank you! I'll find a spot for it. A *large* spot. Sorry. Habit.",
      "Aw! You didn't have to! ...Sorry. You did. That's lovely. Thank you.",
      "I'll treasure it. Or at least keep it away from the oven.",
    ],
    neutral: [
      "Oh! A gift! Thank you! I'll find a use for it. Everything's good in a cake, eventually.",
      "Aw. Thank you. I'll put it with the others. I have a drawer. It's a big drawer. It's mostly sprinkles.",
    ],
    dislike: [
      "Ha. Ha ha. Good one. (She sets it down very carefully.) That's the ninth one this year.",
      "Sorry! Sorry, I just... no. No, thank you. I'll put it... outside.",
      "(She holds it between two enormous fingers.) Is this a joke? I get a lot of jokes. I'd like it to not be one.",
    ],
    birthday: [
      "A birthday {item}? For *me?* I usually bake my own cake. Then nobody sings, because it's four in the morning. ...Thank you.",
      "Summer, the seventeenth! County fair week. I'm always too busy to celebrate. And now a {item}. Sorry! There's frosting on it now. That's my fault.",
    ],
    byItem: {
      'toy-wrestler': ["(She holds the figure in her palm like a baby bird.) He's going in the dollhouse. On the porch. In the rocking chair.", "Sorry. He's very small. He's the right size. Do you know how rare the right size is?"],
      wildflowers: "Violets? There are violets in here! I'm going to sugar them. Three days. You'll have to come back for the reveal.",
      sequins: "Sequins! They look exactly like rare sprinkles. Sorry! I'm not going to put them on a cake. ...I'm going to put ONE on a cake. Nobody eat that one.",
      rhinestone: "A rhinestone. I'll set it on top of the Homecoming cake like a tiny chandelier. Four hundred cakes, one jewel. The rest will be jealous. Cakes get jealous.",
      honey: "Honey. Wildflower honey. I'll glaze something tiny with it. Something you'd need a magnifying glass to admire properly.",
      teacup: "A teacup! I'll bake a cake *inside* it. A teacup cake. Sorry, it's the only thing in this shop that's ever been too big for me to bake in.",
      concha: "Rosa's concha. She's a good baker. Better than me at bread. Sorry. It's true. I'm going to eat it in the walk-in where nobody can see me admitting it.",
      coffee: "Coffee at four a.m. is the best coffee. Coffee at four p.m. is the second best. You've just made my four p.m.",
      comic: "Wrestle-Bot vs. The Moon! I'm going to make a Wrestle-Bot cake. In fondant. He'll be two inches tall. The moon will be a cookie.",
    },
    later: [
      "The {lastGift} is in the shop window now. People keep asking if it's for sale. I say no. Sorry! Some things in a bakery are for the baker.",
      "I made a tiny {lastGift} out of fondant and put it on a cake. Nobody knew what it was. Earl knew. Earl ate it in two bites.",
    ],
  },
  again: [
    "Sorry! Sorry. I'm in the middle of a frosting. You can watch. Watching's allowed.",
    "(Tiny waves with a piping bag. A small rose of frosting lands on the counter. She apologizes to it.)",
    "We talked! I have nine trays in the oven. Nine. I counted them out loud so they'd know.",
  ],
  idle: [
    "(Tiny is frosting a cake the size of a coin with a pair of tweezers, breathing very carefully.)",
    "Mind the doorframe! ...Oh. You did. Good. Better than me.",
  ],
  birthday: { season: 1, day: 17 },
  events: [
    // ---------------------------------------------------------------- 2: A cake smaller than a coin
    {
      id: 'tiny-2', hearts: 2, map: 'bakery', title: 'Smaller Than a Coin',
      script: async (api) => {
        await api.narrate("Tallbridge Bakery. Pastel pink walls, a bell on the door, and a price board with a canon line in bubble letters: VILLAIN SURCHARGE: $1. The doorframe has a dent in it at forehead height.");
        await api.say('tiny', "Sorry! Sorry. Welcome! Sit. Don't move. Don't blink. I'm going to try something.");
        await api.narrate("She takes a cake from the cooling rack. It is smaller than a coin. She holds it between two fingers like a jeweler, lowers her half-moon glasses, and picks up a piping bag with a tip the size of a pin.");
        await api.say('tiny', "I do a face on every new friend. This is your nose. Noses are the hardest. Don't ask me about ears.");
        await api.narrate("It takes her twelve minutes. Her huge hands don't shake once. When she finishes, she sets the cake on your palm.");
        await api.say('tiny', "That's you. Don't eat it in one bite.");
        const c = await api.choose('A cake smaller than a coin, with your face on it, sits on your palm.', [
          { label: 'Eat it in four careful bites', value: 'four' },
          { label: 'Eat it in one bite', value: 'one' },
          { label: '"Do you have anything bigger?"', value: 'bigger' },
        ]);
        if (c === 'four') {
          api.hearts('tiny', 30);
          await api.narrate("You take four tiny bites, slowly. Tiny watches with her hands clasped, her whole face lit up.");
          await api.sayMood('tiny', 'happy', "FOUR! Nobody's ever done four! Do you know how hard it is to eat something that small in four? It's an *art form.*");
        } else if (c === 'one') {
          api.hearts('tiny', 15);
          await api.narrate("You eat it in one bite. Tiny watches, hands clasped, and her face does a long, slow fall.");
          await api.say('tiny', "...You ate it in one bite. Twelve minutes of work, gone in one. Everybody does. It's the dream, honestly. Sorry! I'm fine. I'm *fine.*");
        } else {
          api.hearts('tiny', -10);
          await api.narrate("Tiny looks from you to the cake to the sign over her head: TINY CAKES, BIG LOVE. The silence has a texture.");
          await api.say('tiny', "I have a sheet cake. It's still small. ...Sorry! Sorry. Of course. Sorry.");
          await api.narrate("She goes back to the counter and wipes it down. It's already clean.");
        }
        await api.say('tiny', "Come by anytime. Mind the doorframe. It's been very patient with me.");
      },
    },
    // ---------------------------------------------------------------- 4: Eight years
    {
      id: 'tiny-4', hearts: 4, map: 'bakery', title: 'Eight Years Running',
      script: async (api) => {
        await api.narrate("Closing time at the bakery. Tiny flips the sign and takes off her tiny chef's hat. She looks at you across the counter. She's carrying a flat of eight cakes and a secret.");
        await api.say('tiny', "Hot Tag. Back booth. I need to say something out loud to someone who won't hold it against me.");
        await api.fade();
        await api.narrate("The back booth. Tiny orders three things, then a fourth, then apologizes to the waitress for the number of things. She talks for ten solid minutes about doorways.");
        await api.say('tiny', "A doorway is just a bet that you'll fit. I've lost that bet at the library, the post office, and my own *grandmother's church.* I've learned to be graceful about being the bet that lost.");
        await api.narrate("She eats half a roll. Her voice drops.");
        await api.say('tiny', "I've lost the county fair pie contest to Agnes Pickett eight years running. Eight. Her lattice is a perfect cross-hatch. It's so tight it hums. Mine's... lovely. Mine's *fine.* And fine doesn't win.");
        await api.sayMood('tiny', 'sad', "I'm not mad at Agnes. I'm mad that I want a ribbon this much. It's embarrassing. I'm thirty-nine. I can lift a refrigerator. And I lie awake over a ribbon.");
        const c = await api.choose(null, [
          { label: '"Let me taste-test every crust. For science."', value: 'taste' },
          { label: '"Ask Agnes for her tips."', value: 'ask' },
          { label: '"It\'s just a ribbon."', value: 'ribbon' },
        ]);
        if (c === 'taste') {
          api.hearts('tiny', 30);
          await api.sayMood('tiny', 'happy', "You'd do that? Eat pie? For eight weeks? For *me?* Oh, you're a hero. You're a gluttonous hero. Sorry! A *dedicated* hero.");
        } else if (c === 'ask') {
          api.hearts('tiny', 30);
          await api.sayMood('tiny', 'surprised', "Ask... Agnes. Ask the champion. For her *secrets.* That's terrifying. It's also brilliant. It's brilliant and terrifying. Both.");
        } else {
          api.hearts('tiny', -10);
          await api.narrate("Tiny sets down her roll. The booth gets very quiet.");
          await api.say('tiny', "It's not *just.* It's eight years. It's eight Augusts of being second best at the thing that I love. ...Sorry. I know you meant well.");
        }
        api.flag('tiny_pie_plan', true);
        await api.narrate("Behind the counter, June slides a small, slightly burnt slice of pie in front of Tiny without a word. Tiny stares at it. Then she laughs, big and warm and wet, and eats it in three bites.");
      },
    },
    // ---------------------------------------------------------------- 6: The dollhouse
    {
      id: 'tiny-6', hearts: 6, map: 'bakery', title: 'The Dollhouse',
      script: async (api) => {
        await api.narrate("After close. Tiny wipes the last counter, slings her pink apron on a hook, and says, quickly, in the voice of a woman jumping off a cliff: \"Do you want to see something? It's in the locker room. It's... sort of private.\"");
        await api.fade();
        await api.narrate("The locker room. Tiny's locker is a double-height unit Hank built for her, tall enough to hold a spare apron and, on the bottom shelf, something under a cloth.");
        await api.narrate("She draws the cloth away.");
        await api.narrate("A dollhouse. A perfect, intricate miniature of the Sportatorium. Two thousand seats, each folded from a scrap of paper. A ring with real, tiny ropes. A marquee with the Saturday card in tweezers-and-ink lettering.");
        await api.say('tiny', "I make them in the evenings. When the bakery's quiet. There's a tiny Birdie, see, with a pencil the size of a grain of rice. A tiny Agnes in A1. A tiny Earl with a pencil in his beard. A tiny Pip, with a belt.");
        await api.narrate("She turns the whole house, gently, to show the back row. There, among the bleachers, one small figure in a long plum velvet robe, a crown braid, a lavender sash.");
        await api.say('tiny', "I painted her from an old photo at the pawn shop. Birdie doesn't know I made a Duchess. I didn't know where else to put her.");
        await api.sayMood('tiny', 'sad', "Nobody's put her back in the Sportatorium in forty years. And I did. In a *dollhouse.* Is that stupid?");
        const c = await api.choose('The tiny Duchess stands alone in the back row of the bleachers.', [
          { label: 'Pick her up carefully and move her next to tiny Birdie', value: 'move' },
          { label: 'Hold her in your palm and say she belongs here', value: 'hold' },
          { label: '"Your secret\'s safe with me."', value: 'secret' },
        ]);
        if (c === 'move') {
          api.hearts('tiny', 30);
          await api.narrate("You lift the tiny Duchess with two fingers and set her down on the bench beside the tiny Birdie, who's holding her pencil. Tiny's breath catches.");
          await api.say('tiny', "I wasn't brave enough. I kept putting her in the back. Like it wasn't my place. ...It's exactly the right spot. Oh. Oh no. I'm going to need a minute.");
        } else if (c === 'hold') {
          api.hearts('tiny', 30);
          await api.narrate("You hold the tiny figure in your palm. Her velvet robe is real velvet, a scrap a tailor would have thrown out.");
          await api.say('tiny', "That's the velvet from Marigold's scrap bin. She gave it to me without asking what for. ...I think she knew.");
        } else {
          api.hearts('tiny', 15);
          await api.say('tiny', "Thank you. I wanted somebody to know. ...Not Birdie, not yet. When it's *time.* I don't know when that is. A baker's good at time. This is a different kind.");
        }
        api.flag('tiny_dollhouse', true);
        await api.narrate("She covers the dollhouse with its cloth, the way you'd tuck in a very small, very large family.");
        await api.say('tiny', "If anybody laughs at me for it, I'll apologize and then I'll sit on them. Sorry. I mean it kindly.");
      },
    },
    // ---------------------------------------------------------------- 8: Never been asked
    {
      id: 'tiny-8', hearts: 8, map: 'bakery', title: 'Three Years of Sprinkles',
      script: async (api) => {
        await api.narrate("Late. The bakery's warm and smells of vanilla. Tiny has a mug of tea in both hands, and she's staring at a small paper bag on the counter. It's full of rainbow sprinkles. Rare ones. You can tell by how gently she holds it.");
        await api.say('tiny', "Hot Tag. Back booth. Please. I can't do this at the counter. It's too bright.");
        await api.fade();
        await api.narrate("The back booth. Tiny sets the bag of sprinkles between you like an exhibit.");
        await api.say('tiny', "Nobody's ever asked me on a date. Not once. Thirty-nine years.");
        await api.say('tiny', "I think people assume I'm not interested. Or they're scared of the height. Or both. I've heard 'she's intimidating.' *I'm* intimidating. I bake things that fit in a thimble.");
        await api.narrate("She turns the sprinkle bag in her hands. You know something she doesn't, or something she half-knows and won't let herself believe.");
        const c = await api.choose('Tiny looks at the bag, and then, finally, at you.', [
          { label: '"Fenwick has liked you for three years."', value: 'tell' },
          { label: '"Would you *want* to be asked?"', value: 'ask' },
          { label: 'Say nothing. It\'s not yours to say.', value: 'silent' },
        ]);
        if (c === 'tell') {
          api.hearts('tiny', 30);
          await api.sayMood('tiny', 'surprised', "He... the *sprinkles.* The *sentences.* He's never finished a sentence in my life. I thought... and then I *doubted.* Three *years?*");
          await api.say('tiny', "Oh. Oh no. What do I *do?* I have a gift for hospitality but no gift for this.");
        } else if (c === 'ask') {
          api.hearts('tiny', 30);
          await api.narrate("She takes a long time to answer.");
          await api.say('tiny', "Yes. I think I would. By somebody who isn't scared of the doorframe. By somebody who'd finish the sentence.");
        } else {
          api.hearts('tiny', 15);
          await api.narrate("You say nothing. She studies your face and, for a moment, you can tell she's reading the whole thing in what you don't say.");
          await api.say('tiny', "...You know something. Wait. Not yet. I don't want to *know* yet. I want to *find out.* There's a difference.");
        }
        api.flag('tiny_fenwick', true);
        await api.narrate("She picks up the bag of sprinkles and holds it against her chest. It rattles faintly.");
        await api.say('tiny', "I'm going to bake him something so small it needs a microscope. And I'm going to hand it over without saying a word. I think that's how we talk.");
      },
    },
    // ---------------------------------------------------------------- 10: The blue ribbon
    {
      id: 'tiny-10', hearts: 10, map: 'bakery', title: 'A Pie the Size of a Quarter',
      script: async (api) => {
        await api.narrate("The county fair, pie tent. A long white table of entries, each with a little card. Tiny stands at the end, apron on, dwarfing everything including the tent pole, a lattice-topped cherry pie in front of her.");
        await api.narrate("Down the line, a judge with a clipboard bends over each pie. Agnes Pickett sits at the front of the crowd in a folding chair, purse on her knee, expression that of a person who has already been told.");
        await api.narrate("The judge reaches Tiny's pie. Cuts it. Tastes it. Straightens. Picks up a blue ribbon.");
        await api.narrate("There's a very long second. Then the judge says: \"First place. Tamsin Tallbridge.\"");
        await api.sayMood('tiny', 'surprised', "...Me? Sorry. Me?");
        await api.narrate("The tent bursts into applause. Tiny's hand goes to her mouth. Then Agnes is standing in front of her, all five feet of her, purse over one arm, hand extended.");
        await api.say('tiny', "Agnes. I... I'm so sorry. I don't know what to say.");
        await api.narrate("Agnes shakes her hand. Her grip is firm and brief.");
        await api.say('agnes', "Your lattice has gotten tighter. I'm *worried,* dear. ...Well done. Eight years. I was beginning to feel guilty.");
        await api.say('tiny', "I thought I'd feel it. The thing I've wanted for eight years. And I just feel... sad. Is that awful?");
        await api.narrate("Agnes looks up at her for a long moment. Then she snaps open Gertrude and takes out a butterscotch.");
        await api.say('agnes', "Nobody likes losing, dear. But I'll tell you a secret. I only ever practiced for the one trying to beat me. You made me better. Take the butterscotch.");
        await api.say('tiny', "I think I liked losing to you better. It gave me somebody to bake *at.* ...Now I've got nobody.");
        const c = await api.choose('Agnes holds out the butterscotch. Tiny takes it: seven feet of baker holding one small candy.', [
          { label: '"Bake her a pie. A very small one."', value: 'small' },
          { label: '"Ask her for a rematch next year."', value: 'rematch' },
        ]);
        api.hearts('tiny', 30);
        if (c === 'small') {
          await api.sayMood('tiny', 'happy', "A pie. A *tiny* one. The size of a quarter. With a lattice, a real lattice, nine strips, woven with tweezers.");
          await api.narrate("She asks what kind. You think about Agnes's famous pie.");
          const k = await api.choose('Which filling?', [
            { label: "Cherry, Agnes's own recipe", value: 'cherry' },
            { label: 'Peach', value: 'peach' },
          ]);
          api.flag('tiny_pie', k);
          if (k === 'cherry') await api.say('tiny', "Her own recipe. In her own lattice. That's a real challenge. And a tribute. Both. I'll *hum* while I do it.");
          else await api.say('tiny', "Peach. She'd never say it's her favorite. She'd say it's 'decent.' I'll take 'decent' from her over a medal from anyone.");
        } else {
          api.flag('tiny_pie', 'cherry');
          await api.say('agnes', "Next August, dear. Bring a ruler. I'll bring Gertrude.");
          await api.say('tiny', "A rematch. I'd be honored. I'd be *terrified.* Both. I'll bring a lattice. And, if it's all right, a very small pie.");
        }
        await api.fade();
        await api.narrate("The next morning, Agnes Pickett receives a lattice-topped pie the size of a quarter. It comes in a velvet-lined box, with a tiny handwritten card: *Thanks for eight years of second place. ~T.*");
        await api.narrate("She turns it over twice with a magnifying glass she keeps in her purse. She doesn't speak. Then she tucks it carefully into the purse, beside her rain bonnet.");
        await api.say('tiny', "She carries it everywhere. Everywhere. I saw it at the post office. She showed it to a *stranger.*");
      },
    },
  ],
} satisfies DialogueSet;
