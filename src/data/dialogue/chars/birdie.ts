import type { DialogueSet } from '../types';

/**
 * Bernadette "Birdie" Malone. Runs ACW, the Sportatorium, and (depending on who
 * you ask) the town. The player's booker, protector and, someday, predecessor.
 *
 * Her 1983 half surfaces slowly and never past what she knows: she believes
 * Dottie took a better offer ("Somebody always offers more"). The locker (8),
 * the depot (10). The why belongs to the main story. Before 'grandma_in_town'
 * she only ever hints that she knows whose grandkid the player is.
 */
export default {
  npc: 'birdie',
  intro: [
    "(A short woman in a crimson velvet blazer looks up from a desk buried in napkins. A chewed yellow pencil sits behind her ear.)",
    "Well, sugar. You found the office. Most folks get lost and end up in the ice machine closet. Twice.",
    "Birdie Malone. I run the show, sweep the ring, and fine the villains. Not always in that order.",
    "You want to learn this business? Be early. Listen more than you talk. And never tell a soul out there how the sausage gets made.",
    "Ring's at four. Bring tape, bring water, and bring that look you've got right now. I like that look. Go on, get.",
  ],
  introPublic: [
    "(A short woman in a crimson blazer spins on her diner stool. Every head at the counter turns with her.)",
    "New in town? Birdie Malone, Commissioner of Alley Championship Wrestling. Anybody bothers you, they answer to me.",
    "Wednesdays at the VFW, Saturdays at the Sportatorium. Come hungry, sit close, and don't you dare sit in A1. That's Agnes's.",
  ],
  lines: [
    // ---------------------------------------------------------------- Public: the Commissioner
    { text: "Welcome to Turnbuckle Alley, sugar. Water tower's a turnbuckle, the pie's a religion, and the villains get fined.", when: { hearts: [0, 2], place: ['public'] } },
    { text: "Anybody gives you trouble on Main Street, you holler for the Commissioner. I've still got a left hook and no patience.", when: { place: ['public'], alignment: ['face'] } },
    { text: ["I saw what you pulled on {opponent}. One more stunt like that and you'll be fined into next Thursday.", "(She does not wink. She would never wink on Main Street.)"], when: { place: ['public'], alignment: ['heel'], lastMatch: { maxDaysAgo: 4 } }, mood: 'angry' },
    { text: "Agnes has had seat A1 since 1971. She's hit more villains with that purse than I've fined. I've never fined her once. Never will.", when: { place: ['public'] } },
    { text: "Banned the Mountain from the building for a week once. He worked the library harder. Overdue fines went through the roof.", when: { place: ['public'] } },
    { text: "Suspended the Dust Devil twice last year. He blew right back in both times. Some weather you just can't fine.", when: { place: ['public'] } },
    { text: "Pip wrote me asking to fine the Mountain for 'being too big.' I fined him one library book. Pip was satisfied.", when: { place: ['public'] } },
    { text: "The Bruiser Twins owe the VFW a paint job. Doctor's orders, Commissioner's orders, and frankly the walls' orders.", when: { place: ['public'] } },
    { text: "I don't know one thing about the Mothman, honey, and I'd thank you not to ask me in front of Fenwick.", when: { place: ['public'] } },
    { text: "Folks still ask me about the Duchess. I tell 'em she had the best wave in the business, and she knew right where to aim it.", when: { place: ['public'], notFlag: 'truth_revealed' } },
    { text: "Was the Duchess really that bad? Worse, sugar. She was magnificent. Next question.", when: { place: ['public'], notFlag: 'truth_revealed', hearts: [3, 10] } },
    { text: "My office, Monday. Bring a donut. Not a plain one. A plain donut is how I know you don't respect me.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "(Birdie is at the counter, same stool as always, back to the booth. She raises her coffee at you without turning around.)", when: { map: ['diner'], place: ['public'], time: [700, 840] }, weight: 2 },
    { text: "The Mayor wants a permit for my pyro. I want her to stop asking. We've compromised. I keep doing it, and she keeps asking.", when: { place: ['public'] } },

    // ---------------------------------------------------------------- Insider: early, the rules
    { text: "First rule, sugar: be early. Second rule: be early. Third rule's a secret, and you get it when you're early.", when: { hearts: [0, 2], place: ['insider'], notFlag: 'debuted' } },
    { text: "Kayfabe. Carny word. Means we keep the door shut. Out there it's all real. In here, it's all love. Both are true.", when: { hearts: [0, 5], place: ['insider'] } },
    { text: "Never look at the camera, never look at the clock, and never look at Agnes's purse until it's too late.", when: { hearts: [0, 5], place: ['insider'] } },
    { text: "Promoter's tell: when he says 'trust me,' check your pockets. When he says 'we'll see,' check your contract.", when: { place: ['insider'] } },
    { text: "Paper the house, sugar. Free tickets to the first three rows, so the back row thinks it's packed. Oldest trick there is.", when: { place: ['insider'] } },
    { text: "A good promo's like a good con. You tell 'em exactly what you're going to do, and they still can't believe it when you do it.", when: { place: ['insider'] } },
    { text: ["This pencil's written every card since 1984. It's two inches long and it's got my teeth marks in it.", "Don't look at it, sugar. You'll jinx it. ...You're looking at it."], when: { place: ['insider'], rank: ['rookie', 'opener', 'undercard', 'midcard'] } },
    { text: "We don't do mean, sugar. We do ornery. Mean sends folks home sad. Ornery sends 'em home hollering. Learn the difference.", when: { place: ['insider'] } },
    { text: "Every promoter in America tried to buy me a steak once. Know why? I sold out a barn on a Tuesday in an ice storm.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Learn to sell out a barn, sugar, and nobody can ever take a thing from you. Not a city, not a company, not a lanyard.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "I don't book the Mothman. The Mothman books the Mothman. I just leave the porch light on.", when: { place: ['insider'] } },
    { text: "Nine-second clips. That's what the city had you doing? Honey, I've had sneezes longer than that with better storytelling.", when: { place: ['insider'], hearts: [0, 5] } },
    { text: "Content. Lord. A match ain't content. A match is a conversation between two people and a building.", when: { place: ['insider'] } },
    { text: "Smell that? Corporate lanyard. Somebody from the city's been sniffing around my parking lot. I can always tell.", when: { place: ['insider'] }, mood: 'angry' },

    // ---------------------------------------------------------------- Insider: the roster, gossip and love
    { text: "June says I sleep on that office couch too much. June says a lot of things. June keeps a list of them on the back of a menu.", when: { place: ['insider'] } },
    { text: "Rosa's taqueria is running on fumes and pride. Eat there. Eat there twice. Tell her I sent you and she'll overcharge you.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Dex has the city in his eyes. I've seen that look on a hundred kids. Some go, some stay. The good ones come back.", when: { place: ['insider'] } },
    { text: "Earl flinches at his own pyro every Saturday. Crowd thinks it's rage. I've never once told him to stop. It's the best thing in the show.", when: { place: ['insider'] } },
    { text: "Gideon breathes into a paper bag before the VFW. Fifty chairs. Bingo after. And he's still the best heel I've got.", when: { place: ['insider'] } },
    { text: "Hazel's knee is healed. Hazel isn't, yet. You don't rush a thing like that, sugar. You leave the door open and the lights on.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "The Dust Devil was my idea. Nobody suspects the man being insulted. Clint said yes before I finished the sentence. I wish he'd let me finish.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Those Bruiser boys argue for real half the time. The other half they're arguing about which half.", when: { place: ['insider'] } },
    { text: "Tiny charges herself the villain surcharge when I book her heel. Quarters in her own register, in public. Integrity, sugar.", when: { place: ['insider'] } },
    { text: "Lou and I fished from five till eight. He caught two. I caught a cold and a boot. Same as every Monday since '84.", when: { place: ['insider'], weekday: [0] }, weight: 2 },
    { text: "Mo's my right hand at the shows. Best referee in the territory. Ask anybody who reffed last Saturday and they'll say 'was there a ref?' I want to bite somebody.", when: { place: ['insider'] } },
    { text: "Doc still won't count anything fast. Change, pills, nothing. I've never blamed him for a thing, sugar. He's never stopped blaming himself.", when: { place: ['insider'], hearts: [6, 10] } },

    // ---------------------------------------------------------------- Show days
    { text: "Show day, sugar. Eat something, tape your wrists, and don't you peek through that curtain more than twice.", when: { showDay: true, place: ['insider'] } },
    { text: "Nervous? Good. Nerves mean you care. Fold 'em up, put 'em in your pocket, and take 'em out at the finish.", when: { showDay: true, place: ['insider'], rank: ['rookie', 'opener', 'undercard'] } },
    { text: "VFW tonight. Fifty chairs, nine-foot ceiling, bingo after. Do not climb anything. I mean it. Dex.", when: { showDay: true, weekday: [2], place: ['insider'] } },
    { text: "Saturday. Lights, pyro, confetti, and two thousand people who paid good money for a miracle. Go give 'em one.", when: { showDay: true, weekday: [5] } },
    { text: "Hear that? Doors open. That's the best sound in the world, sugar, and I've heard a baby laugh at a duck.", when: { showDay: true, place: ['show'] } },
    { text: "(Birdie's on her stool by the curtain, pencil behind her ear, cinnamon stick in her teeth. She gives you one small nod and goes back to the clipboard.)", when: { showDay: true, place: ['show'] } },
    { text: "Two thousand people out there, honey, and every one of 'em is rooting for somebody. Make sure a few of 'em are rooting for you.", when: { showDay: true, place: ['show'], rank: ['rookie', 'opener', 'undercard', 'midcard'] } },

    // ---------------------------------------------------------------- The ladder
    { text: "You debuted, sugar. Nobody can take that off you now. Your name's in Gus's shoebox forever, spelled right and everything.", when: { flag: 'debuted', rank: ['rookie', 'opener'] }, weight: 2 },
    { text: ["{finisher} on {opponent}. I saw it from the stool.", "Don't let it go to your head. Let it go to your knees, and ice 'em."], when: { place: ['insider'], lastMatch: { won: true, maxDaysAgo: 3 } }, mood: 'happy' },
    { text: ["{opponent} beat you and the room went with you anyway. I watched three people in row F stand up for a loser.", "That's money in the bank, sugar. Very small money. Very real bank."], when: { place: ['insider'], lastMatch: { won: false, minStars: 3, maxDaysAgo: 3 } } },
    { text: ["You and {opponent}. We'll talk about the middle part.", "Not today. Today you eat a sandwich. Monday we talk about the middle part."], when: { place: ['insider'], lastMatch: { maxStars: 2.5, maxDaysAgo: 3 } }, mood: 'sad' },
    { text: "Moving up the card, are we? Don't let it go to your head, sugar. Let it go to your boots.", when: { place: ['insider'], rank: ['undercard', 'midcard'] } },
    { text: "Main event. That means when it goes wrong, they look at you. And when it goes right? They look at you. Get used to being looked at.", when: { rank: ['main'], place: ['insider'] } },
    { text: "Someday this pencil's going to need a new ear to live behind. Not today. But I've been looking at your ears.", when: { rank: ['main'], place: ['insider'], hearts: [6, 10] } },
    { text: "Wednesdays are yours now. Book 'em like it's somebody's first show. For somebody in those fifty chairs, it always is.", when: { rank: ['assistant'], place: ['insider'] }, weight: 2 },
    { text: "It's your pencil now. I've still got opinions. I keep 'em in a coffee can. Tap the can if you want one.", when: { rank: ['pencil', 'owner'], place: ['insider'] }, weight: 2 },
    { text: "I slept at home last night. In a bed. June cried when I told her. She says it was onions. June doesn't keep onions.", when: { rank: ['pencil', 'owner'] } },
    { text: "Well, it's *your* pencil. ...No, no. Go on. I'm sure you know what you're doing. (She absolutely does not sound sure.)", when: { rank: ['pencil', 'owner'], place: ['insider'] } },

    // ---------------------------------------------------------------- Seasons, weather, time of day
    { text: "Thaw Brawl's coming. Spring crowd's the hungriest. They've been inside all winter watching old tapes and getting ideas.", when: { season: [0] }, weight: 2 },
    { text: "Fairgrounds Fury, sugar. Hay bales, funnel cake, and a bear who bows. If that don't move you, check your pulse.", when: { season: [1] } },
    { text: "Harvest Havoc. Every year I swear nobody goes through a hay wagon, and every year, a hay wagon.", when: { season: [2] } },
    { text: "Homecoming. Hall of Fame night. Folks ask why we've never inducted the Velvet Hammers. Next question, sugar.", when: { season: [3], notFlag: 'truth_revealed' }, mood: 'sad' },
    { text: "Rain's good for business. Nowhere else to be, and nothing on TV but city clips. Folks come to the show to feel something.", when: { weather: ['rain'] } },
    { text: ["Storm on a show day. They'll come anyway, sugar. They always come anyway.", "Hank's putting buckets under section C. Agnes brings her own."], when: { weather: ['storm'], showDay: true } },
    { text: "Wind like this, a flyer folded right lands face-up on a windshield three blocks over. Folded wrong, it's a kite.", when: { weather: ['wind'] } },
    { text: "Snow on the marquee. Spell it out anyway, I tell Hank. Folks read through snow. Folks read through anything if they want to.", when: { weather: ['snow'] } },
    { text: "Coffee's on. It's terrible. June brings me the good stuff at noon and pretends she just happened to be walking by.", when: { time: [360, 660], place: ['insider'] } },
    { text: "(Birdie is sweeping the ring and singing at the top of her lungs, mostly the wrong words.) Oh! Sugar. You heard none of that.", when: { map: ['sportatorium'], showDay: false }, weight: 2 },
    { text: "Go home, sugar. It's late. ...What? I'm going home too. Right after this. And this. And this.", when: { time: [1260, 1560] } },

    // ---------------------------------------------------------------- Deepening: hints of 1983 (her half)
    { text: "You want to ask about '83. Everybody does. Ask me something else, sugar, and I'll answer it twice.", when: { place: ['insider'], hearts: [3, 5], notFlag: 'truth_revealed' } },
    { text: "I've never watched the tape. Not once. Lou offered. Gus offered. I'd sooner eat this blazer.", when: { place: ['insider'], hearts: [3, 8], notFlag: 'truth_revealed' } },
    { text: "This blazer used to be my last ring robe. I had June cut it down. Couldn't wear it. Couldn't throw it out. So, a blazer.", when: { hearts: [3, 10] } },
    { text: ["Somebody always offers more, sugar. Remember that.", "You'll think you've got a partner for life, and somebody out there will always offer more."], when: { place: ['insider'], hearts: [6, 8], notFlag: 'truth_revealed' }, mood: 'sad' },
    { text: "You fold a flyer like somebody I used to know. Corners first. Nobody folds corners first anymore. ...Never mind me.", when: { place: ['insider'], hearts: [6, 10], notFlag: 'grandma_in_town' } },
    { text: "Got two rocking chairs on my porch. I only ever sit in the one. The other's for company. Company's running late.", when: { hearts: [6, 10], notFlag: 'reunion_done' }, mood: 'sad' },
    { text: "I count the chairs on nights I can't sleep. Four hundred and twelve. One of 'em wobbles. Row J. I've never let Hank fix it.", when: { place: ['insider'], hearts: [6, 10] } },
    { text: "Lou gave you the key? Well. He hasn't trusted anybody with that since Odessa. Don't get lost down there. I mean that literally.", when: { flag: 'lou_key', place: ['insider'] } },

    // ---------------------------------------------------------------- Grandma in town (before the truth)
    { text: "Three blocks. She's three blocks from my office. I drove the long way to the bank today. Four extra blocks to dodge three.", when: { flag: 'grandma_in_town', notFlag: 'truth_revealed', place: ['insider'] }, mood: 'sad', weight: 3 },
    { text: ["How is she? No. Don't tell me.", "...Is she eating, at least? She never ate before a show. Somebody had to make her."], when: { flag: 'grandma_in_town', notFlag: 'truth_revealed', hearts: [3, 10], place: ['insider'] }, weight: 3 },
    { text: "You've got her chin. I saw it the first day you walked in. Didn't say a word. I'm saying it now. Don't make it a thing.", when: { flag: 'grandma_in_town', hearts: [6, 10], place: ['insider'] }, weight: 3 },
    { text: "Don't say her name in my office, sugar. Not because I'm mad. Because I'll hear it all day after.", when: { flag: 'grandma_in_town', notFlag: 'truth_revealed', place: ['insider'] } },

    // ---------------------------------------------------------------- After the truth
    { text: "Forty years. She gave up forty years so I could have a contract. A contract! I'd have torn it up. She knew I'd tear it up.", when: { flag: 'truth_revealed', notFlag: 'reunion_done', place: ['insider'] }, mood: 'angry', weight: 3 },
    { text: "I'm still mad, sugar. Going to be mad a while. Turns out you can be mad and on your way over at the same time.", when: { flag: 'truth_revealed', notFlag: 'reunion_done' }, weight: 3 },
    { text: "I keep almost walking over there. I get to the corner. Then my feet forget the rest of the way.", when: { flag: 'truth_revealed', notFlag: 'reunion_done' }, mood: 'sad', weight: 3 },
    { text: "Folks are saying the Duchess regretted it. For once in their lives, folks are right. I'll deny it at the barbershop.", when: { flag: 'truth_revealed', place: ['public'] }, weight: 2 },
    { text: "Homecoming. Hall of Fame night. ...This year I'm not answering 'next question.' This year I'm answering the door.", when: { season: [3], flag: 'truth_revealed' }, mood: 'happy', weight: 2 },

    // ---------------------------------------------------------------- After the reunion
    { text: "We played gin last night. She cheated. She confessed. She won anyway. Forty years, and I still can't catch those hands.", when: { flag: 'reunion_done' }, mood: 'happy', weight: 2 },
    { text: "Two rocking chairs on the porch, sugar. Both squeak now. Loudest porch on the street. Best sound I ever heard.", when: { flag: 'reunion_done' }, mood: 'happy', weight: 2 },
    { text: "Some days she calls me Bird and thinks it's 1979. So I let it be 1979. It was a good year. We were unbeatable.", when: { flag: 'reunion_done', hearts: [3, 10] }, weight: 2 },
    { text: "Gideon does her braid Mondays. I sit in the corner pretending to read the paper. I'm not reading the paper. It's upside down.", when: { flag: 'reunion_done' } },
    { text: "She stands up every time your music hits. Every time. Whole front row stands with her. I'm going to need tissues in bulk.", when: { flag: 'reunion_done', showDay: true }, weight: 2 },

    // ---------------------------------------------------------------- Family
    { text: "Whatever happens, sugar, there's a hook in the locker room with no name on it. Hank asked who it was for. I said 'mind your business, Henrietta.'", when: { hearts: [9, 10] } },
    { text: "I've trained a hundred kids. You're the first one I'd let sweep my ring. That's a compliment. Take it and say thank you.", when: { hearts: [9, 10], place: ['insider'] } },
    { text: "If anybody from the city ever comes for you, you tell 'em the Commissioner said no. Then you tell me. Then I'll say it louder.", when: { hearts: [9, 10] } },
    { text: ["You're a villain now, sugar. Be the one they love to hate, never the one they hate to love.", "...Other way round. You know what I mean."], when: { alignment: ['heel'], place: ['insider'] } },
  ],
  gifts: {
    loves: ['coffee', 'old-program', 'polaroid', 'sheet-cake'],
    likes: ['vinyl', 'pie', 'tiny-cake', 'canvas', 'merch-sign', 'merch-tee', 'signed-photo'],
    dislikes: ['protein-shake', 'gas-hotdog', 'scrap'],
  },
  giftReplies: {
    love: [
      "Well, butter my biscuit. You noticed. Nobody notices. Come here, sugar.",
      "This is going on the corkboard, right next to the napkins that made me money.",
      "Oh, honey. I'd cry, but I'm seventy-some years old and wearing velvet. It spots.",
    ],
    like: [
      "That's sweet of you, sugar. The pencil approves.",
      "Well, look at that. I'll find a spot for it. Somewhere between the ticket rolls and the chaos.",
      "Thank you, honey. Somebody raised you right. ...Somebody sure did.",
    ],
    neutral: [
      "Huh. Well. It's the thought, sugar. I'll put it with the other thoughts.",
      "Thank you kindly. I'll find a use for it. Or Hank will.",
      "That's a gift, all right. I can tell by the way you're holding it.",
    ],
    dislike: [
      "Lovely. I'll wipe down the ring apron with it.",
      "Sugar, I've been handed worse by promoters. Not a lot worse.",
      "Bless your heart. That's Southern for 'no.'",
    ],
    birthday: [
      "My birthday? Who told you? It was June. It's always June. ...A {item}. Thank you, sugar. Truly.",
      "Marigold bedazzled my hearing aid last year. Stiff competition. ...The {item} wins. Keep that from Marigold.",
    ],
    byItem: {
      coffee: "June's coffee in a paper cup. You carried it all the way here and it's still hot. You walk fast. Good. I like a fast walker.",
      'old-program': ["Lord. 1979. Look at that pose. I had arms like a mailbox.", "Who's that in the corner of the photo, half cut off? ...Nobody, sugar. Pin it on the board."],
      polaroid: "A crowd shot. Front row, purse in the air. That's Agnes. That's always Agnes. This is going in the frame by the door.",
      'sheet-cake': "A whole sheet cake. From Tiny. For me. I'm going to eat a corner and then put it in the office fridge and guard it from Dex.",
      vinyl: "1984, says the sleeve. I know whose music this is. I'll play it on the office player when you're gone. Not while you're here.",
      pie: "Agnes's recipe. June's hands. I'm eating this at my desk with my shoes off. Shut the door on your way out.",
      'tiny-cake': "Look at it. You could lose it in a pocket. I'll eat it with the little fork from the Christmas drawer.",
      canvas: "Old ring canvas. That stain's from the Copperhead Sisters. 1981. Don't ask me how I know. I know.",
      'merch-sign': "A sign with glitter. I'm hanging it in the office where the Mayor can see it when she comes about the pyro.",
      'merch-tee': "Your shirt. I'll wear it to the bank. The bank man thinks I'm a serious person. Time he learned.",
      'signed-photo': "Signed in silver marker. I'll put it next to the one of Lou. Lou's going to pretend he doesn't mind the company.",
    },
    later: [
      "That {lastGift} is on the corkboard, sugar. Right next to the napkin that sold out the Thaw Brawl.",
      "June saw the {lastGift} and asked who it was from. I said 'nobody.' She said 'mm-hm.' June says 'mm-hm' like a judge.",
    ],
  },
  again: [
    "Still here, sugar? I'm sweeping. You can hold the dustpan or you can hold the door.",
    "I said what I said.",
    "(Birdie points at the clock with her pencil and goes back to the napkins.)",
  ],
  idle: [
    "Busy, sugar. Napkins don't book themselves.",
    "(Birdie hums the wrong words to something and waves you along with the pencil.)",
  ],
  birthday: { season: 1, day: 19 },
  events: [
    // ---------------------------------------------------------------- 2: The carny fold
    {
      id: 'birdie-2', hearts: 2, map: 'birdie-office', title: 'The Carny Fold',
      script: async (api) => {
        await api.narrate("Birdie's desk is buried under a drift of fresh flyers. SATURDAY NIGHT AT THE SPORTATORIUM, in red. Your name is near the bottom, very small.");
        await api.say('birdie', "Sit, sugar. Today you learn the most important move in this business. And it ain't a suplex.");
        await api.say('birdie', "First rule: a flyer nobody reads is a napkin. Second rule: everybody reads a flyer that lands face-up.");
        await api.narrate("Her hands move fast. Corner to crease. Crease to thumb. A half-twist, a flick. A tight little paper diamond.");
        await api.say('birdie', "Carny fold. Learned it off a fella selling miracle tonic in 1966. The tonic was turpentine. The fold was gold.");
        await api.narrate("She cranks the window open and flicks the diamond into the wind. It sails over the lot, flips once, and lands on a windshield. Face-up.");
        await api.sayMood('birdie', 'smug', "Any wind. Any windshield. Every time. Your turn.");
        const c = await api.choose('You pick up a flyer.', [
          { label: 'Fold it exactly her way', value: 'hers' },
          { label: 'Fold it your way (a paper airplane)', value: 'yours' },
        ]);
        if (c === 'hers') {
          api.hearts('birdie', 30);
          await api.narrate("Corner, crease, thumb, twist. Your diamond is lopsided. It wobbles out the window and lands face-up on Sheriff Bev's cruiser.");
          await api.sayMood('birdie', 'happy', "Ha! Face-up on the law! That's a draw, sugar. Bev'll come Saturday just to complain about it.");
        } else {
          api.hearts('birdie', 15);
          await api.narrate("Your paper airplane is a thing of beauty. It loops twice, catches a gust, and lands in Chokeslam Creek.");
          await api.say('birdie', "Well. That's a napkin with ambitions. Do it my way first, sugar. Then go invent your own. That's the order.");
        }
        await api.say('birdie', "Five hundred of these by Saturday. Every windshield from here to the county line. And one on the Mayor's car.", "Face-up. She loves pretending to be annoyed. It's the highlight of her week.");
      },
    },
    // ---------------------------------------------------------------- 4: The stool by the curtain
    {
      id: 'birdie-4', hearts: 4, map: 'sportatorium', when: { showDay: true }, title: 'A Room Breathing',
      script: async (api) => {
        await api.narrate("Show night. Behind the curtain, the building sounds like the inside of a drum. Birdie sits on her stool: pencil, clipboard, cinnamon stick.");
        await api.say('birdie', "C'mere, sugar.");
        await api.narrate("She hops down off the stool and pats the seat. Mo, passing in her stripes, stops dead and stares. Nobody sits on Birdie's stool.");
        await api.say('birdie', "One match. It's yours for one match. Now close your eyes.", "Don't look. Listen. Hear that? That's a room breathing.");
        await api.narrate("You hear it. Two thousand people murmuring. A chair scrapes. Pip, somewhere, yells BOOOO. A purse clasp snaps open: Agnes, getting ready.");
        await api.say('birdie', "When they all go quiet at once, that's heat. When they suck in a breath, there's a near-fall coming.", "And when Agnes opens that purse? God help the villain.");
        const c = await api.choose('The crowd rumbles. Something is about to happen.', [
          { label: 'Keep your eyes shut and listen', value: 'listen' },
          { label: 'Peek through the curtain', value: 'peek' },
        ]);
        if (c === 'listen') {
          api.hearts('birdie', 30);
          await api.narrate("The room goes silent. You feel it before you hear it: two thousand people taking one sharp breath together.");
          await api.narrate("Then the roar. A kickout at two and nine-tenths. You knew. You knew a whole second early.");
          await api.sayMood('birdie', 'surprised', "You heard it. You heard it before it happened.");
          await api.say('birdie', "Took me three years to learn that, sugar. Learn to hear a room and you'll never need a script.");
        } else {
          api.hearts('birdie', 15);
          await api.narrate("You crack one eye. Through the gap: the ring, the lights, a body in the air.");
          await api.sayMood('birdie', 'happy', "Peeker! I was a peeker too. Somebody used to swat me with a towel for it.");
          await api.narrate("She goes quiet for a second, looking at nothing.");
          await api.say('birdie', "...Long time ago. Close 'em, sugar. Try again.");
        }
        await api.say('birdie', "All right, off. Stool's mine. Don't get comfortable.", "...But you can borrow it sometimes.");
      },
    },
    // ---------------------------------------------------------------- 6: A light night (1985, the ice storm)
    {
      id: 'birdie-6', hearts: 6, map: 'sportatorium', when: { showDay: false }, title: 'A Light Night',
      script: async (api) => {
        await api.narrate("The Sportatorium is empty. The last house was thin, and everybody knows it. Birdie is alone up in the stands, counting chairs out loud.");
        await api.say('birdie', "...four hundred and eight. Four hundred and nine.");
        await api.say('birdie', "Oh. Hey, sugar. Don't mind me. I count 'em after a light night. Keeps my hands busy and my mouth shut.");
        const c = await api.choose(null, [
          { label: 'Take the other side and help her count', value: 'count' },
          { label: 'Tell her it was still a good show', value: 'good' },
        ]);
        if (c === 'count') {
          api.hearts('birdie', 30);
          await api.narrate("You take the far aisle. For a while it's just two voices in the empty building, counting.");
        } else {
          api.hearts('birdie', 15);
          await api.say('birdie', "It was. That's not the part that keeps me up.");
        }
        await api.say('birdie', "Saturday night, 1985. Ice on every road in the county. Furnace out. You know how many people came?");
        await api.sayMood('birdie', 'sad', "Eleven.");
        await api.say('birdie', "Agnes, in A1. A trucker who got lost. Two girls from the high school. A family from Tulsa whose car died on the highway.");
        await api.say('birdie', "Lou wanted to call it. I said no. We ran the whole card, opener to main event.", "Lou sang his verse to them like it was the moon landing. The trucker cried. He said it was the heater.");
        await api.say('birdie', "Every one of 'em paid. Every one of 'em got the whole show. The girls from the high school got Lou's towel.");
        await api.sayMood('birdie', 'happy', "Four of 'em still come. Agnes never missed one. That Tulsa family drives in every Homecoming. With their grandkids, now.");
        await api.say('birdie', "So I count the chairs, sugar. The ones with somebody in 'em. Agnes's I count twice. She'd want it noted.");
        await api.narrate("She tucks the pencil back behind her ear. \"Four hundred and ten,\" she says, and keeps going.");
      },
    },
    // ---------------------------------------------------------------- 8: Don't
    {
      id: 'birdie-8', hearts: 8, map: 'lockers', title: "Don't",
      script: async (api) => {
        if (api.hasFlag('reunion_done')) {
          await api.narrate("Birdie walks you down the locker room hallway. At the end of the row, the old locker stands open. No padlock. A fresh nameplate.");
          await api.narrate("Gold letters in Hank's careful hand: D. DUPREE.");
          await api.say('birdie', "Forty years I walked past this thing and said 'don't.' To you. To Hank. Mostly to me.");
          await api.sayMood('birdie', 'happy', "Hank wanted a new lock. I said no lock. She said fine, a latch. We compromised. It's a very loose latch.");
          const c = await api.choose('The locker is empty except for a hanger and the faint smell of lavender.', [
            { label: 'Hang your old wrist tape on the hook', value: 'hang' },
            { label: 'Close the latch gently', value: 'close' },
          ]);
          if (c === 'hang') {
            api.hearts('birdie', 30);
            await api.narrate("You loop your old wrist tape over the hook. Birdie looks at it for a long time.");
            await api.sayMood('birdie', 'love', "Good. Now there's two people's things in it. That's how a locker's supposed to be, sugar.");
          } else {
            api.hearts('birdie', 15);
            await api.say('birdie', "Easy, now. That latch has feelings. So do I, it turns out. Who knew.");
          }
          return;
        }
        if (api.hasFlag('truth_revealed')) {
          await api.narrate("Birdie walks you down the locker room hallway. At the end of the row: the padlocked locker, the nameplate scraped to bare metal.");
          await api.narrate("This time, she stops.");
          await api.say('birdie', "I know what's in there, sugar. Her robe. Hanging on the hook where she left it.");
          await api.say('birdie', "Hank changed the lock the morning after. I've had the only key for forty years. Never turned it once.");
          const c = await api.choose(null, [
            { label: 'Stand there with her', value: 'stand' },
            { label: 'Ask if she wants to open it', value: 'ask' },
          ]);
          if (c === 'stand') {
            api.hearts('birdie', 30);
            await api.narrate("You stand with her. She lays her palm flat on the cold metal door, the way you'd touch a sleeping horse.");
          } else {
            api.hearts('birdie', 15);
            await api.say('birdie', "Not yet. When she's here to see it. Not one day before.");
          }
          await api.say('birdie', "Forty years I said 'don't.' I'm working up to a different word. Give me a minute. Or a month.");
          return;
        }
        await api.narrate("Birdie walks you down the locker room hallway, talking about the tape budget. Forty keys jingle on her belt loop.");
        await api.narrate("At the end of the row is a locker you've never seen open. A padlock gone brown with age. A nameplate scraped down to bare metal.");
        await api.narrate("Birdie doesn't slow down. She doesn't look at it. Her voice doesn't change at all.");
        const c = await api.choose('You glance at the locker.', [
          { label: 'Keep walking beside her', value: 'walk' },
          { label: 'Ask whose locker it is', value: 'ask' },
          { label: 'Reach out and touch the padlock', value: 'touch' },
        ]);
        if (c === 'walk') {
          api.hearts('birdie', 30);
          await api.narrate("You keep walking. Halfway down the hall, she slips her arm through yours, still talking about tape.");
        } else if (c === 'ask') {
          api.hearts('birdie', 15);
          await api.say('birdie', "Don't.");
          await api.narrate("Just the one word. Then she takes your arm, and goes right on talking about tape like you never asked.");
        } else {
          api.hearts('birdie', -10);
          await api.sayMood('birdie', 'angry', "Don't.");
          await api.narrate("It comes out sharp as a slap. You both stand there a second, a little shocked.");
          await api.sayMood('birdie', 'sad', "...I'm sorry, sugar. I'm not mad at you. I'm mad at a lock.");
        }
        await api.narrate("Back in her office, she sits down hard and unhooks the key ring. Forty keys, spread across the napkins.");
        await api.say('birdie', "Front door. Back door. Concession stand. Fuse box. Hank's cage, which ain't finished. The ice machine closet, for reasons.");
        await api.say('birdie', "Thirty-nine of these, I could tell you what they open.");
        await api.narrate("She doesn't say anything about the fortieth. She clips the ring back on her belt, and it's very quiet in the office.");
      },
    },
    // ---------------------------------------------------------------- 10: Five minutes late
    {
      id: 'birdie-10', hearts: 10, map: 'birdie-office', when: { time: [360, 660] }, title: 'Five Minutes Late',
      script: async (api) => {
        await api.narrate("Dawn. The office smells like burnt coffee and cinnamon. Birdie nods at a ladder bolted to the wall behind the filing cabinet.");
        await api.say('birdie', "Up you go, sugar. Mind the third rung. It bites.");
        await api.narrate("The hatch opens onto the Sportatorium roof. Tar paper, a folding chair, the whole town gold in the early light. And tomatoes.");
        await api.narrate("Dozens of plants, staked and tied, growing out of old ring buckets. The kind wrestlers spit into between rounds. Scrubbed clean, every one.");
        await api.say('birdie', "Forty summers of tomatoes. June thinks I buy 'em off the Wilsons. Let her.");
        await api.say('birdie', "Sit. I'm going to tell you something I've never said out loud. Not to June. Not to Lou. Not to anybody.");
        await api.narrate("She takes the cinnamon stick out of her mouth. That's how you know.");
        await api.say('birdie', "The night she broke the belt, everybody figures I went home and cried. I did. After.");
        await api.say('birdie', "First I made Gus drive me to the bus depot. Two in the morning. I was going to drag her back by that braid.");
        await api.sayMood('birdie', 'sad', "Bus was gone. Five minutes, Gus says. Taillights at the end of the road.");
        await api.sayMood('birdie', 'sad', "I've been five minutes late for forty years, sugar.");
        const c = await api.choose(null, [
          { label: 'Take her hand', value: 'hand' },
          { label: 'Say nothing. Just sit with her.', value: 'sit' },
          { label: 'Ask what she would have said to her', value: 'ask' },
        ]);
        if (c === 'hand') {
          api.hearts('birdie', 30);
          await api.narrate("Her hand is small and rough and stronger than yours. She squeezes once, hard, like a tag.");
        } else if (c === 'sit') {
          api.hearts('birdie', 30);
          await api.narrate("You sit. Below, the town wakes up one porch light at a time. Neither of you needs to say a thing.");
        } else {
          api.hearts('birdie', 15);
          await api.say('birdie', "I told myself I'd yell. Ask her why. Ask her who offered more.", "...Or maybe just get on the bus next to her. Wherever it was going. I never did decide.");
        }
        if (api.hasFlag('reunion_done')) {
          await api.sayMood('birdie', 'happy', "I told her, you know. About the depot. She laughed till she cried. Said if she'd seen me coming she'd have hid in the bathroom.");
          await api.say('birdie', "Five minutes. Forty years. Three blocks. Some math don't ever add up, sugar. You just carry it.");
        } else if (api.hasFlag('truth_revealed')) {
          await api.say('birdie', "She doesn't know I went. Somebody ought to tell her. ...I keep getting as far as the corner.");
        } else {
          await api.say('birdie', "Don't look at me like that. I'm fine. I've had forty years to get fine.");
        }
        await api.narrate("She stands, knees cracking like kindling, and picks a tomato. She sets it in your palm, still warm from the sun.");
        await api.sayMood('birdie', 'love', "They come back every summer. Stubborn things. Like some people.");
        api.flag('birdie_roof', true);
      },
    },
  ],
} satisfies DialogueSet;
