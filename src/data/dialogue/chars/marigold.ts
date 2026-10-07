import type { DialogueSet } from '../types';

/**
 * Marigold Iyer (they/them). Iyer Alterations & Gear, formerly Velma's. Makes
 * every piece of ring gear in town, and the ring persona creator happens at
 * their shop. Romanceable. Publicly "doesn't follow wrestling" (the funniest
 * lie in town). Keeps the ACW quilt with one empty square, saved for the
 * player. 1983: Velma's pattern book holds Dottie's margin note (Act II).
 */
export default {
  npc: 'marigold',
  intro: [
    "Oh! You're the new one. Stand there. No, there. Light's better. Hm. Hm. Okay. Your left shoulder sits higher than your right.",
    "Marigold Iyer. They/them. Gear. All of it. Robes, tights, masks, the Dust Devil's duster. If it moves in that ring, I sewed it.",
    "Whenever you figure out who you are in there, come to the shop. A name, a look, a walk. We'll build it. I'll make it true in thread.",
    "Sorry, I have pins in my mouth. I always have pins in my mouth. It's fine. I've only swallowed one. Twice.",
  ],
  introPublic: [
    "Welcome to Iyer Alterations and Gear! Formerly Velma's. Hems, zippers, prom dresses, and, um, costumes. For the local athletes.",
    "Marigold. They/them. I don't follow wrestling. I just sew. Hold still. Your collar is having a crisis.",
    "If you ever need anything stitched, or a whole new look, come by. I'm very good. I'm also very cheap, which my parents say is the problem.",
  ],
  lines: [
    // ---- Strangers, the shop
    { text: "I don't follow wrestling. I just sew. Is the Dust Devil's mask too tight, do you think? Just asking. Professionally.", when: { hearts: [0, 5], place: ['public'] }, weight: 2 },
    { text: "Your hem's coming down on the left. Don't move. I can fix it from here. I can fix most things from here.", when: { hearts: [0, 2] } },
    { text: "People think I'm the costume person. I'm not. I'm the *gear* person. Costumes are for Halloween. Gear has to survive.", when: { hearts: [0, 5] } },
    { text: "Velma owned this shop for fifty years. She visits from the Bell to tell me my stitches are crooked. They're *slightly* crooked.", when: { hearts: [0, 5] } },
    { text: "No gear yet? You can't walk out there in that. I mean you *can*. People will just think you're a very brave customer.", when: { notFlag: 'debuted' }, weight: 2 },
    { text: "Before a debut you need a look. Before a look you need a *you*. Come sit in the fitting chair when you're ready. We'll find you.", when: { notFlag: 'debuted', map: ['tailor'] }, weight: 2 },
    { text: "Looking for Birdie? Sportatorium. She'll be wearing the crimson blazer. I've been begging her to let me reline it for four years.", when: { notFlag: 'met_birdie' }, weight: 3 },
    { text: "Coffee hasn't kicked in. Don't ask me anything hard. Don't ask me to pick a thread. Every thread is beautiful at eight a.m.", when: { time: [420, 600] } },
    { text: "Late-night stitching. The shop's warm, the street's quiet, and I'm three hundred sequins into something wonderful.", when: { time: [1200, 1439] } },
    { text: "Mondays I see Velma at the Bell. She inspects my cuffs with a magnifying glass. I bring her cardamom cookies so she goes easy.", when: { weekday: [0] } },
    { text: "Flea market! I found a velvet curtain from a 1960s movie theater. I'm going to make something out of it. Possibly a life.", when: { weekday: [5, 6], time: [540, 780] } },
    { text: "Rain! Good. Nobody comes in, so I get to work on the quilt. I'm supposed to want customers. I want the quilt.", when: { weather: ['rain'] } },
    { text: "Snow day. I'm hand-beading. The radiator clanks like a metronome. I love it here so much it makes my teeth hurt.", when: { weather: ['snow'] } },
    { text: "Wind's blowing sequins down Main Street again. If you see something sparkle in a gutter, it's mine. Bring it back. I'll pay you in hems.", when: { weather: ['wind'] } },

    // ---- Alignment and shows (public, kayfabe intact)
    { text: "A villain. Mm. Okay. You need black. Not black-black. *Bruise* black, with a little shine. Villains should glint.", when: { place: ['public'], alignment: ['heel'] } },
    { text: "You're a hero, so we're thinking colors you can see from the back row. Bright, honest, washable. Heroes sweat honest.", when: { place: ['public'], alignment: ['face'] } },
    { text: "Show night! Not that I'd know. I just happen to have a repair kit, forty safety pins and a seam ripper. Coincidence.", when: { showDay: true, place: ['public'] } },

    // ---- Friends, public
    { text: "You carry your bag on your left shoulder. Stop that. You'll end up with a crooked robe and a crooked life.", when: { hearts: [3, 5] } },
    { text: "Gideon came in for sequins again. We argued about rose gold for an hour. He won. He always wins. I let him think I let him.", when: { hearts: [3, 10] } },
    { text: "La Mariposa came in for a fitting. Silent, as always. She communicated an entire opinion about my hem with one eyebrow.", when: { hearts: [3, 10], place: ['public'] } },
    { text: "My parents emailed me another job listing. 'Senior Designer, Activewear.' In the city. I'm going to answer it by sewing a sleeve.", when: { hearts: [3, 8] } },
    { text: "Spring means everybody wants a new look for Thaw Brawl. I've been awake since Tuesday. What day is it? No. Keep it. I'll panic.", when: { season: [0] }, weight: 2 },
    { text: "Summer gear has to breathe. Dex sweats through new spandex in nine minutes. I've timed him. I've timed everybody. I have a chart.", when: { season: [1] } },
    { text: "Somebody sold a corduroy jacket at the flea market with a bus ticket from 1981 in the pocket. I'm turning the jacket into elbow pads. I'm keeping the ticket.", when: { season: [2] } },
    { text: "Winter is robe season. Homecoming robes. I have a sketchbook of Hall of Fame robes for every legend in town. Just in case.", when: { season: [3] } },
    { text: "Openers don't get robes. Doesn't matter. You get a jacket. A jacket is just a robe that's still learning.", when: { rank: ['rookie', 'opener'] } },
    { text: "Main event? Then you need a robe. Not a jacket. A ROBE. With a collar people can see from the parking lot.", when: { rank: ['main'] } },

    // ---- Friends, insider
    { text: "In here I can say it: I know every wrestler's measurements. Earl's inseam is a state secret. I'll take it with me forever.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Gear is the first thing the crowd believes. Gideon's collar gets a pop before he's through the curtain. The collar has never wrestled a day in its life.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: ["You and {opponent}. Your left knee pad slid on the second bump. I saw it from the curtain and made a noise.", "Bring it in. I'll put a second strap on it. Don't argue. I made a noise."], when: { place: ['insider'], lastMatch: { maxDaysAgo: 3 } } },
    { text: "The Quick Change is tear-away seams, magnets, and me behind the curtain counting to three. Every reveal you've ever loved is a hem.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "I cry at entrances. When the robe catches the light on the ramp, I cry. Gideon caught me once. He cried too. We don't talk about it.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Hank does the metal, I do the leather. Every title belt in town is half hers, half mine. We've never once agreed on a buckle.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Bharatanatyam taught me everything. My mom's students spun and jumped and stomped. If gear survives a recital, it survives a suplex.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: ["Whoever made the Mothman's wings used a running stitch on a load-bearing seam.", "I lie awake about it. I'd fix it in ten minutes. Nobody will tell me who to ask."], when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Arms up. I'm sewing you in. Don't breathe. Okay, breathe a little. Okay, that's too much breathing.", when: { showDay: true, place: ['insider'] } },
    { text: "You're booking now? Book a fashion show. Thaw Brawl. A runway. A battle royal ON the runway. Please. I'm begging.", when: { rank: ['assistant', 'pencil', 'owner'], place: ['insider'] } },

    // ---- Close
    { text: "I made you something. It's a pocket square. In your colors. It's nothing. It took nine hours. It's nothing.", when: { hearts: [6, 8] } },
    { text: "You stood up straighter today. I noticed. I notice shoulders. I'm noticing yours. Professionally. Mostly.", when: { hearts: [6, 8], place: ['public'] } },
    { text: "Quiet day at the shop. I don't mind. I'd rather have one good fitting than ten fast ones. My accountant minds. I don't have an accountant.", when: { hearts: [6, 10], place: ['public'] } },
    { text: "The shop barely breaks even. My parents email me spreadsheets. I email them photos of capes. I think we're saying the same thing.", when: { hearts: [6, 10], place: ['insider'] } },
    { text: "One square left on the quilt. Still saving it. You'll see. Don't look at it. You're looking at it.", when: { hearts: [6, 10], place: ['insider'] } },
    { text: "Velma says I sew like I'm apologizing. I say I sew like I'm *asking*. She says that's what apologizing is. Three years we've been on this.", when: { hearts: [6, 14] } },
    { text: ["Velma's old pattern book has the Velvet Hammers' measurements. And a note in somebody else's handwriting, fall of '83.", "'Let Birdie's out an inch. She'll be eating better in the big city.' Why does that make me so sad?"], when: { hearts: [6, 14], place: ['insider'], flag: 'grandma_in_town' }, mood: 'sad' },
    { text: "Your grandmother's measurements are in Velma's book. I'd love to make her something. Plum. Velvet. Something with a train.", when: { hearts: [6, 14], flag: 'grandma_in_town' } },

    // ---- Family
    { text: "I've started signing your gear. Tiny initials inside the hem. Only on the pieces I'm proudest of. Don't check. ...You're checking.", when: { hearts: [9, 14] } },
    { text: "You're my favorite person to dress. Don't tell Gideon. He'd sulk for a week. Then redo his whole look. Actually, tell Gideon.", when: { hearts: [9, 14], place: ['insider'] } },

    // ---- Dating and married
    { text: "We're on a date. I'm going to be normal. I'm not going to fix your collar. ...I'm fixing your collar.", when: { dating: true, place: ['public'] } },
    { text: "People keep winking at me at the counter. Is it the cardigan? It's you. It's because of you. I'm going to sew something to calm down.", when: { dating: true } },
    { text: "I keep a swatch of everything you've worn. That's not weird. That's archival. Okay, it's a little weird.", when: { dating: true, place: ['insider'] } },
    { text: "Stay while I close up? I'll put the radio on. You can watch me pin a hem. It's very romantic. If you're me.", when: { dating: true } },
    { text: "My spouse, everybody! Their gear is by me! Their shoulders are by me too, now. Fixed them. Took a year.", when: { married: true, place: ['public'] } },
    { text: "Tag gear. A marigold on your hip and you on mine. Hank says it's the most sentimental thing she's ever seen. She cried at a belt once.", when: { married: true, place: ['insider'] } },

    // ---- Main story
    { text: "I understand the note now. She let it out an inch because she thought she'd never see it fit.", when: { flag: 'truth_revealed', place: ['insider'] }, mood: 'sad' },
    { text: "Velma's going to supervise the robe from a chair. She's ninety. She's going to yell at me the whole time. I've never been happier.", when: { flag: 'reunion_done' }, mood: 'happy', weight: 3 },
  ],
  gifts: {
    loves: ['rhinestone', 'canvas', 'yarn'],
    likes: ['sequins', 'leather', 'blank-tee', 'teacup', 'wildflowers', 'gold-leaf'],
    dislikes: ['foam-finger', 'scrap', 'gas-hotdog'],
  },
  giftReplies: {
    love: [
      "Wait. Wait. Do you know what I could... sit down. I need to touch it and not talk for a minute.",
      "This is going in the quilt. Or a robe. Or a robe and then the quilt. Or I'm going to frame it. I'm going to need a day.",
      "Oh, you have *taste*. I knew it. I could tell from your collar. Your collar is terrible, but your taste is impeccable.",
    ],
    like: [
      "Oh, that's lovely! I can use this. I can use everything, but I can use this *especially*.",
      "For me? Thank you! It's going straight on the cutting table where I can see it.",
      "Ooh. Good find. You've got an eye. A rough eye. But an eye.",
    ],
    neutral: [
      "Thank you! I'll... think of something. I always think of something.",
      "Hm. Okay. I'm going to stare at this until it tells me what it wants to be.",
    ],
    dislike: [
      "Listen. *Listen.* I'm going to say thank you, and you're going to know what I mean.",
      "That's... a safety pin of a gift. It holds. It's not a permanent fix.",
      "I'm going to put this in the back. In a box. With the cheap satin. Where it can't hurt anybody.",
    ],
    birthday: [
      "A {item}! On my birthday! I'm going to wear it today. Even if it isn't wearable. ESPECIALLY if it isn't wearable.",
      "People bring me things to fix. Nobody brings me a {item} just because. Oh, I'm going to cry on a hem. It's fine. It's a practice hem.",
    ],
    byItem: {
      rhinestone: ["From down there? (They hold it to the window.) Look at the cut. Somebody cut this by hand.", "This is going on a collar. Yours. Don't argue. I've already decided where."],
      canvas: "Old ring canvas! The weave on this... it's from the Sportatorium's '80s ring, the one with the soft corner. It's going in the quilt. Corner square.",
      yarn: "Pink yarn. I'm going to make a mask lining. Or a scarf for Velma. She'll say the stitches are crooked. They will be, a little. On purpose. For her.",
      sequins: "A handful of sequins. They'll be in my hair till spring. My mom will find one at Diwali and ask questions.",
      leather: "Leather strap. Good hide, no cracks. I'll make you a wrist cuff. You'll pretend it's for support. It's for looks.",
      'blank-tee': "A blank tee! A blank tee is a promise. I'm going to make it say something terrible and wonderful.",
      teacup: "A teacup. I'll keep pins in it. Every tailor's pin cup is a teacup. That's a rule. I made it, but it's a rule.",
      wildflowers: "Wildflowers! The blue ones are exactly the blue of the Mothman's porch light. I'm going to match a thread to them.",
      'gold-leaf': "Gold leaf. For a belt. Hank's going to want it. Hank can't have it. Hank can have half.",
    },
    later: [
      "I used the {lastGift}. Well. I used part of it. The other part is in the quilt now. You're in the quilt. Sort of.",
      "Velma asked where the {lastGift} came from and I turned red. I don't turn red. I'm not telling you what I told her.",
    ],
  },
  again: [
    "(Marigold mumbles through a mouthful of pins. It's probably 'hello again.' It could be 'hold still.')",
    "Back so soon? Your collar must be in crisis again. ...It is. Come here.",
    "We talked! I'm mid-hem. If I stop now this sleeve will never forgive me.",
  ],
  idle: [
    "(Marigold is pinning a hem on a dress form, humming, and has not noticed you yet.)",
    "Hold still. No, not you. The fabric. The fabric's being difficult.",
  ],
  birthday: { season: 2, day: 16 },
  events: [
    {
      id: 'marigold-2', hearts: 2, map: 'tailor', title: 'Measure Twice',
      script: async (api) => {
        await api.narrate('You step into Iyer Alterations and Gear. Before the bell over the door stops ringing, Marigold has a tape measure around your ribs.');
        await api.say('marigold', "Don't move. Thirty-eight. Hm. Twenty-two. Oh, interesting. Hold your arm out. No, like you mean it.");
        await api.narrate('They mutter numbers around a mouthful of pins and write them on the back of their hand.');
        await api.sayMood('marigold', 'surprised', 'Your left shoulder sits higher than your right. Do you carry a bag on it? Stop that.');
        const c = await api.choose(null, [
          { label: 'Hold perfectly still', value: 'still' },
          { label: 'What are you measuring me for?', value: 'ask' },
        ]);
        if (c === 'still') {
          api.hearts('marigold', 30);
          await api.say('marigold', "Oh, you're GOOD at standing still. Do you know how rare that is? Gideon vibrates. The twins argue. Earl apologizes to the tape.");
        } else {
          api.hearts('marigold', 15);
          await api.say('marigold', 'For? Nothing. Everything. Someday. I like having people\'s numbers. Everybody needs a robe in a hurry eventually.');
        }
        await api.narrate('They spit the pins into a little tomato pincushion and write your name at the top of a fresh index card.');
        await api.sayMood('marigold', 'happy', "There. You're in the box. Everybody important is in the box. Come back when you know who you are in that ring.");
      },
    },
    {
      id: 'marigold-4', hearts: 4, title: 'The Quilt',
      script: async (api) => {
        await api.narrate("Marigold catches your sleeve. 'Back booth. Tonight. I have to show you something or I'll explode.'");
        await api.fade();
        await api.narrate('The back booth. Marigold unrolls a quilt across the whole table, over the edge, and into June\'s lap. June allows it.');
        await api.say('marigold', 'The ACW quilt. Every square is a scrap of gear I made. Every robe, every pair of tights, every mask. I keep a piece of everything.');
        await api.say('marigold', "That's the Mountain's first snowcap. That's the Dust Devil's duster. And this, look, look, this tiny sequin? Gideon's very first robe.");
        await api.say('marigold', "He cried when I asked for it. Then he gave me two. I only used one. The other's in my wallet. He doesn't know.");
        await api.narrate('In the middle of the quilt, one square is empty. Bare backing, stitched neatly around the edges, waiting.');
        const c = await api.choose(null, [
          { label: "What's the empty square for?", value: 'ask' },
          { label: 'Smooth it flat with your hand', value: 'touch' },
        ]);
        if (c === 'ask') {
          api.hearts('marigold', 15);
          await api.sayMood('marigold', 'smug', "Saving it. You'll see.");
        } else {
          api.hearts('marigold', 30);
          await api.narrate('Marigold goes very quiet, which is the loudest thing they\'ve done all night.');
          await api.sayMood('marigold', 'love', "...Saving it. You'll see.");
        }
        await api.say('marigold', "It's going to take years. That's fine. Good things should take years. Help me fold it? Corners first. Always corners first.");
      },
    },
    {
      id: 'marigold-6', hearts: 6, map: 'sportatorium', title: 'Rip', when: { showDay: true },
      script: async (api) => {
        await api.narrate("An hour before showtime, a sound from the locker room like a sail tearing in half, then a scream that can only be Gideon's.");
        await api.say('gideon', "It's GONE. The back. The whole back. I can feel AIR. Gorgeous people do not feel AIR.");
        await api.narrate('His rose-gold robe has split from hem to collar. Marigold is already there, kit open, pins in mouth, eyes enormous.');
        await api.say('marigold', 'Okay! Okay. This is fine. This is fine. Somebody hold a light. You. Hold the lamp. Higher. HIGHER.');
        const c = await api.choose(null, [
          { label: 'Hold the lamp rock steady', value: 'lamp' },
          { label: 'Talk Gideon down while they sew', value: 'talk' },
        ]);
        api.hearts('marigold', 30);
        if (c === 'lamp') {
          await api.narrate('You hold the lamp so still your arm burns. Marigold sews like a hummingbird: tiny stitches, fast, perfect, muttering the whole time.');
        } else {
          await api.narrate('You tell Gideon his hair has never looked better. He breathes. You tell him again. He breathes slower. Marigold\'s needle flies.');
        }
        await api.say('gideon', 'Is it bad? Tell me the truth. Lie to me. Tell me the truth.');
        await api.say('marigold', "Done. Turn. Spin. ...It's better than before. I hate that. I hate that it's better.");
        await api.narrate('Gideon spins once at the mirror and sweeps toward the curtain like a king. Marigold sits down on the bench, shaking, and starts to laugh.');
        await api.sayMood('marigold', 'happy', 'Ten minutes. A whole robe. On a moving Gideon. Lamp and needle, you and me. Somebody write that down.');
      },
    },
    {
      id: 'marigold-8', hearts: 8, title: 'Real Work',
      script: async (api) => {
        await api.narrate('Marigold texts you a single word, BOOTH, and then, a second later, PLEASE.');
        await api.fade();
        await api.narrate("The back booth. A cup of chai going cold, a phone face-down on the table, and pins in Marigold's mouth they've forgotten about.");
        await api.say('marigold', "My parents emailed me another job listing. 'Senior Designer, Performance Wear.' In the city. Benefits. A desk. A *window*.");
        await api.say('marigold', "They send one every week. I've never applied. Not once. I just read them and sew something.");
        await api.say('marigold', "The shop barely breaks even. I know. Everybody knows. Velma knows, and she can't see her own hand.");
        await api.sayMood('marigold', 'sad', "They keep saying 'real' design. Like this isn't real. Like a robe two thousand people believe in isn't real.");
        const c = await api.choose(null, [
          { label: 'This is real design. Maybe the realest.', value: 'real' },
          { label: 'Would you ever want to go?', value: 'go' },
        ]);
        if (c === 'real') {
          api.hearts('marigold', 30);
          await api.narrate('Marigold takes the pins out of their mouth one at a time and sets them in a little row on the napkin.');
          await api.say('marigold', '...Say that again. Slower. I\'m going to embroider it on something.');
        } else {
          api.hearts('marigold', 15);
          await api.say('marigold', 'Sometimes. On the bad weeks. Then somebody walks to the ring in something I made and the building goes quiet, and I think: no. Here.');
        }
        await api.say('marigold', "Thank you for not telling me what to do. Everybody tells me what to do. You asked. That's rarer than silk velvet.");
      },
    },
    {
      id: 'marigold-10', hearts: 10, map: 'tailor', title: 'Someday Robe',
      script: async (api) => {
        await api.narrate('After closing. The shop lamps are low. Marigold has cleared the big cutting table and opened a fresh sketchbook to a blank page.');
        await api.say('marigold', "I have a sketchbook of Hall of Fame robes. One for every legend in town. Lou's is lavender. Birdie's is crimson, collar like a castle.");
        await api.say('marigold', "I want to start yours. Not for now. For someday. I want it ready. I don't want somebody else doing it in a hurry.");
        const c = await api.choose(null, [
          { label: 'Sketch it together', value: 'together' },
          { label: 'Surprise me', value: 'surprise' },
        ]);
        if (c === 'together') {
          api.hearts('marigold', 30);
          await api.narrate('You sketch for two hours. You argue about the collar; they win. You win the hem. The lining, you agree, should be a secret.');
        } else {
          api.hearts('marigold', 15);
          await api.say('marigold', "Surprise you? Oh no. Oh no, that's so much pressure. ...Okay. Okay. I'm going to need nine years and a nap.");
        }
        await api.narrate('When it\'s done, they cut a scrap from a bolt of fabric, the color you landed on, and tuck it into the back of the sketchbook.');
        await api.say('marigold', 'This is for the quilt. The empty square. It was always for a piece of yours.');
        await api.sayMood('marigold', 'love', "I didn't want to say it before. In case you left. You didn't leave.");
      },
    },
    {
      id: 'marigold-12', hearts: 12, title: 'The Terrible Jacket', when: { dating: true },
      script: async (api) => {
        await api.narrate('The flea market, Saturday morning. Your first official date. Marigold is vibrating.');
        await api.say('marigold', "I'm going to be normal. I'm going to look at things and buy nothing and be normal. Oh my GOD, look at that jacket.");
        await api.narrate("Mustard corduroy, lavender satin lining, three buttons missing, one sleeve longer than the other. It's terrible.");
        await api.say('marigold', "Five dollars! It's hideous. It's perfect. Put it on. Put it on, put it on, put it on.");
        await api.narrate('You spend the rest of the date standing between the stalls while Marigold pins it on you, pins in mouth, until it isn\'t terrible anymore.');
        await api.narrate('Fenwick sells you lemonade. Pip asks if you\'re getting married. Marigold swallows a pin and is fine.');
        await api.fade();
        await api.narrate("Afterward, the back booth. The jacket's on your shoulders and Marigold can't stop looking at it. Or at you.");
        await api.say('marigold', 'Okay. Booth question. Birdie told me I have to ask. Do we put us on-screen? Or keep it ours?');
        await api.say('marigold', "On-screen, I'd be your valet, in an outfit I design. Secret, I'd stitch a tiny marigold inside every hem you own.");
        const c = await api.choose(null, [
          { label: 'On-screen. Be my valet.', value: 'onscreen' },
          { label: 'Secret. Stitch the marigolds.', value: 'secret' },
        ]);
        api.flag('hot_tag_marigold', c);
        api.hearts('marigold', 30);
        if (c === 'onscreen') {
          await api.sayMood('marigold', 'happy', "A valet! I'm going to need a cape. Two capes. A cape for the cape.");
        } else {
          await api.sayMood('marigold', 'love', "Every hem. Every single one. You'll never see them. You'll just know they're there.");
        }
      },
    },
    {
      id: 'marigold-14', hearts: 14, map: 'tailor', title: 'The Tag Rope', when: { dating: true },
      script: async (api) => {
        await api.narrate('Marigold has closed the shop early on a Saturday, which has never happened. The sign on the door says BACK SOON (PROBABLY).');
        await api.narrate('Inside, the ACW quilt hangs across the back wall. Every square is full now except one, still empty.');
        await api.say('marigold', "Hank made the rope. I did the thread. It's tradition. She's been teasing me for a month. She cried in the workshop. Hank never cries.");
        await api.narrate("In their hands: the Tag Rope, a braided turnbuckle tassel, red rope wound tight with marigold-orange thread. The wrap is lumpy in one spot.");
        await api.say('marigold', "There's something inside the wrap. A strip of fabric. From your robe. The someday one. The piece for the empty square.");
        await api.say('marigold', "I couldn't decide where it belonged. The quilt, or here. So I thought, maybe both. Maybe the square stays empty until...");
        await api.narrate('They step up onto the little fitting platform, where they\'ve pinned a hundred hems, and hold out their hand like a partner on the apron.');
        await api.say('marigold', "I've measured everybody in this town. You're the only one I want to keep fitting for. For the rest of it. Tag me in?");
        const c = await api.choose(null, [
          { label: 'Take the tag', value: 'yes' },
          { label: 'Not yet', value: 'wait' },
        ]);
        if (c === 'yes') {
          api.flag('engaged_marigold');
          api.hearts('marigold', 30);
          await api.narrate('You take their hand. Marigold makes a sound that is half laugh, half sob, and entirely unprofessional.');
          await api.sayMood('marigold', 'love', "The square stays empty until the wedding. Then it gets the last piece, and the quilt is done. Then we start a new one.");
        } else {
          await api.say('marigold', "That's okay. Really. Good things take years. I'll keep it on the cutting table where I can see it. I'm patient. With fabric, anyway.");
        }
      },
    },
  ],
} satisfies DialogueSet;
