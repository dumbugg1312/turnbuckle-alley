import type { DialogueSet } from '../types';

/**
 * "Gorgeous" Gideon Price, 34. Owner of Gorgeous by Gideon, the hair salon;
 * rose-gold sequined villain with a towering collar, a hand mirror and a Hair
 * Clause in every contract he has ever signed. Romanceable.
 *
 * Public: vain, even at work (three compliments before he lifts the scissors).
 * Insider: anxious, perfectionist, a knitter and a wonderful listener who gives
 * the most precise compliments in town. Tuesdays at noon he talks to his
 * therapist and does not care who knows (so he says so in public too).
 *
 * The red velvet chair at the back of the salon was Dottie's: Miss Opal did her
 * crown braid before every show from 1970 to 1983. Gideon relearns it from a
 * 1981 photo and does it Mondays at Evening Bell.
 *
 * Flags set here: 'gideon_hair_book' (8), 'gideon_hair_match' (10),
 * 'gideon_romance_onscreen' / 'gideon_romance_secret' (12), 'gideon_proposal_ready' (14).
 */
export default {
  npc: 'gideon',
  intro: [
    "(A tall man in a soft gray hoodie is sitting on the floor of the locker room, knitting. The pompadour is, somehow, still perfect.)",
    "Oh! Hello. Don't mind the yarn. Gideon. Price. I'm told the *Gorgeous* part is a lot. In here you can call me Gideon. Out there, you'll have to be *worthy*.",
    "I'll be a nightmare to you in public. It's nothing personal. It's *branding*. I hope you'll forgive me before we ever have to discuss it.",
    "I do a very good haircut. Come by the salon. Bring three compliments. I'll know if they're sincere.",
  ],
  introPublic: [
    "(A tall man in a rose-gold sequined robe lowers a hand mirror and looks at you the way a jeweler looks at a chipped diamond.)",
    "You're staring. Understandable. Gideon Price. *Gorgeous* Gideon, to the people who've earned the adjective. You're welcome for the view.",
    "Do come in. Compliment me. Three times. Sincerely. *Then* we'll discuss your split ends.",
  ],
  lines: [
    // ---------------------------------------------------------------- Public: the salon, the robe
    { text: "Compliment me. Three times. Sincerely. *Then* we'll discuss your split ends.", when: { hearts: [0, 2], place: ['public'], map: ['salon'] }, weight: 2 },
    { text: "I don't do walk-ins. I do miracles by appointment. ...Sit. I've had a cancellation. Don't thank me. *Gasp.*", when: { place: ['public'], map: ['salon'] } },
    { text: "(Gideon checks his reflection in a spoon, a teapot and your left eye.) Flawless. As usual. You're welcome.", when: { place: ['public'] } },
    { text: "A hero. How *dreadfully* wholesome. You'll want the 'Boy Next Door.' Forty dollars and a lecture on ambition.", when: { place: ['public'], alignment: ['face'] }, mood: 'smug' },
    { text: "A fellow villain! Darling, sit. Professional courtesy. The first cut is free. The second is a *favor*, and I'll remind you of it.", when: { place: ['public'], alignment: ['heel'], flag: 'debuted' }, mood: 'smug' },
    { text: "Tuesday at noon I am unavailable. My therapist, darling. She's *devoted*. Clementine printed it. I framed it.", when: { place: ['public'], weekday: [1] } },
    { text: "Humidity is the enemy. Do not speak to me of humidity. ...Do not speak. I am recalibrating.", when: { place: ['public'] } },
    { text: "A foam finger is just static with a god complex. Don't bring one into my salon. Don't bring one into my *life*.", when: { place: ['public'] } },
    { text: "That woman and her butterfly. All wings and no *conditioner*. Do not mention her taqueria in my presence. I'll be at the counter by noon.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "Clementine gave my entrance two stars. *Two.* She wrote that it 'lacked humility.' It's an entrance, darling, not a monastery.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "Tonight, darling, I will be *devastating*. Do try to survive it. Bring a cardigan. The wind from my hair is considerable.", when: { showDay: true, place: ['public', 'show'] }, weight: 2 },
    { text: "A postcard from Miss Opal. 'The hair's good here too, Gideon. Not as good as yours.' Signed 'Your Mother in Hair.' I will not be weeping in a public salon.", when: { place: ['public'], hearts: [3, 10], map: ['salon'] }, mood: 'sad' },
    { text: "Mondays I do hair at Evening Bell. Visiting royalty. ...Don't tell. I haven't *lost* my edge. I've *lent* it to the residents.", when: { flag: 'grandma_in_town', weekday: [0], place: ['public'] }, mood: 'smug' },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "Rain. *Frizz.* Do not make eye contact. I'm composing myself.", when: { weather: ['rain'], place: ['public'] } },
    { text: "Storm. Static. Every hair on my head is a lightning rod and I'm the only one who understands it.", when: { weather: ['storm'], place: ['public'] } },
    { text: "Snow. Dry air. Nature's flat iron. I loathe it. ...It's *gorgeous.* I hate that it's gorgeous.", when: { weather: ['snow'], place: ['public'] } },
    { text: "Wind is a personal attack on my pompadour. I take it personally. I've filed a complaint with the Mayor.", when: { weather: ['wind'], place: ['public'] } },
    { text: "Spring. The season of the rebrand. Everyone wants bangs. Nobody wants the *consequences* of bangs.", when: { season: [0], place: ['public'] }, weight: 2 },
    { text: "Summer, the fairgrounds. Do you know what humidity does to a champagne highlight? *Tragedy.*", when: { season: [1], place: ['public'] } },
    { text: "Harvest Havoc. The *hair* goes on the line this year. I've been *very* brave about it. I've been nauseated since July.", when: { season: [2] }, mood: 'sad' },
    { text: "Winter. Homecoming. My robe has a train, darling. Do *not* step on the train.", when: { season: [3], place: ['public'] } },

    // ---------------------------------------------------------------- Insider: the real Gideon
    { text: "Do you ever feel like if you stop performing for one second, everybody will see the seams? No? Just me? Great. Fantastic. Pass the bag.", when: { place: ['insider'], hearts: [0, 5] }, weight: 2 },
    { text: "I knit. In case you wondered. Mostly scarves. Occasionally small hats for a cat that doesn't exist yet.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "A compliment should be precise. 'You look nice' is a sedative. 'The way you tilt your head when you're lying' is a *gift.*", when: { place: ['insider'] } },
    { text: "Hazel taught me box breathing. In for four, hold four, out four, hold four. I've done it eleven thousand times and I still use the bag. Redundancy, darling.", when: { place: ['insider'] } },
    { text: "Tuesdays at noon I talk to someone who's paid to be kind to me. Best money I've ever spent. Don't tell the Mountain. He's on the waiting list.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Every contract I've ever signed has the Hair Clause. Birdie reads it aloud every Christmas. She laughs until she coughs.", when: { place: ['insider'] } },
    { text: "There's a bag in my gear bag. There's always a bag in my gear bag. It's the single most professional thing I own.", when: { place: ['insider'], showDay: true }, mood: 'sad' },
    { text: "You're new, so, first rule: nobody can use a nerve you've already named out loud. Say it. 'I'm terrified.' Then go do the thing.", when: { place: ['insider'], rank: ['rookie', 'opener'] } },
    { text: "Main event. They'll look at you the way they look at me. Find something small and true to hold on to. For me it's the hum of the hairdryer.", when: { place: ['insider'], rank: ['main', 'assistant', 'pencil', 'owner'] } },
    { text: "Earl's beard oil is *theatrical suffering*. He apologizes to the comb. I forgive him by the third pass.", when: { place: ['insider'], hearts: [3, 10] }, mood: 'happy' },
    { text: "Rosa and I feud *beautifully.* We gossip in the back booth immediately after. The feud's real. The friendship's realer.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Dex bleached his tips with a sports drink and a hairdryer. It's awful. I've never been prouder of anything.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Clementine's reviews live in a folder labeled LIES. Last month I added a ribbon. I read them twice. The nice one, three times.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "(Gideon is rearranging the combs by color for the third time.) Oh. Hello. I'm fine. I'm *organizing.*", when: { time: [1320, 1560] }, weight: 2 },

    // ---------------------------------------------------------------- Close: the book, the chair
    { text: "Miss Opal left me the red velvet chair. I don't let anyone else sit in it. I tell them it's *broken.* It's not broken. It's reserved.", when: { place: ['insider'], hearts: [6, 10] } },
    { text: "The hair book is in the safe. I'm told I'm allowed to feel proud of it. I'm practicing.", when: { flag: 'gideon_hair_book', place: ['insider'] } },
    { text: "I learned the crown braid from a 1981 photograph. Seventeen attempts. On a wig head. On Marigold. On Jobber. Don't ask about Jobber.", when: { place: ['insider'], flag: 'grandma_in_town' }, mood: 'happy', weight: 2 },
    { text: "Her hands were shaking this morning, so I did the braid slowly. We pretended it was a *performance.* I'm very good at pretending it's a performance.", when: { place: ['insider'], flag: 'grandma_in_town', weekday: [0] }, mood: 'sad', weight: 2 },
    { text: "The Hair Match is coming. I'm terrified. I'm also *thrilled.* Neither of those is the least bit helpful.", when: { flag: 'gideon_hair_match', place: ['insider'], season: [2] } },
    { text: "She wore the braid. I did it Monday, eleven minutes. Her hands were steady. I let mine shake.", when: { flag: 'reunion_done', place: ['insider'] }, mood: 'happy', weight: 2 },

    // ---------------------------------------------------------------- Dating
    { text: "(Gideon makes the waiter take forty photos of his good side. Under the table, his other hand is shaking, and holding yours.)", when: { dating: true, place: ['public'], map: ['diner'] }, weight: 2 },
    { text: "You make me feel like I could take off the robe and still be the main event. ...I'm not sure I've ever said that out loud.", when: { dating: true, place: ['insider'] }, mood: 'love' },
    { text: "I did your hair before the show again. Don't tell the mirror it wasn't for it. It gets jealous.", when: { place: ['insider'], flag: 'gideon_romance_secret' }, mood: 'love', weight: 2 },
    { text: "The valentine segment is mortifying. Tonight I read a sonnet about my own eyebrow. They booed. I've never been so happy.", when: { flag: 'gideon_romance_onscreen' }, mood: 'happy', weight: 2 },

    // ---------------------------------------------------------------- Family
    { text: "If they're looking at the hair, they aren't looking at me. You look at me. I've noticed. It's... a lot. A *good* lot.", when: { hearts: [9, 14], place: ['insider'] }, mood: 'love' },
  ],
  gifts: {
    loves: ['teacup', 'bouquet', 'merch-sign', 'rhinestone'],
    likes: ['sequins', 'yarn', 'wildflowers', 'tiny-cake', 'vinyl'],
    dislikes: ['foam-finger', 'polaroid', 'bait'],
  },
  giftReplies: {
    love: [
      "(He presses a hand to his chest.) Darling. You have *taste.* I'd give you a haircut for free. I'd give you *two.*",
      "I'm not crying. It's the hairspray. (He's holding it in both hands, and there's no hairspray within forty feet.)",
      "Oh. Oh, *no.* You've gone and been precise. I can't be flip about this. I'll write you a compliment card by Friday. It will be seven pages.",
    ],
    like: [
      "How *thoughtful.* I'll treasure it for a respectable length of time.",
      "Darling. Lovely. I'll put it somewhere tasteful. Like next to a mirror.",
      "A gift! For *me!* (He checks himself in a spoon to see how that looks.) Devastating.",
    ],
    neutral: [
      "...Interesting. A bold choice. I'll admire it from across the room.",
      "How *unexpected.* I'll find a use for it. Possibly as a doorstop with dignity.",
    ],
    dislike: [
      "Darling. No. (He holds it between two fingers.) My aura is perfectly balanced and you've *tilted* it.",
      "I will accept this graciously and put it in a drawer I'll never open. That's a promise.",
      "Static. You have brought static into my *salon.*",
    ],
    birthday: [
      "My birthday! You remembered! Miss Opal sends a postcard every year signed 'Your Mother in Hair.' This year there are *two* of you. ...Don't tell the mirror. It's jealous.",
      "The fourteenth of winter. A coronation, really. And you came with a gift. Sit. I'm going to do something *magnificent* with your hair.",
    ],
  },
  birthday: { season: 3, day: 14 },
  events: [
    // ---------------------------------------------------------------- 2: Three compliments
    {
      id: 'gideon-2', hearts: 2, map: 'salon', title: 'Three Compliments',
      script: async (api) => {
        await api.narrate("Gorgeous by Gideon. Rose-gold light, a red velvet chair at the back, and a hand-lettered sign: HAIRCUTS BY APPOINTMENT. COMPLIMENTS BY NECESSITY.");
        await api.say('gideon', "Sit. No. Stand first. I need to see you walk. ...Fine. Sit.");
        await api.narrate("He whips a cape around your shoulders and arranges your hair with two fingers, the way a jeweler turns a gem.");
        await api.say('gideon', "Before the scissors, there are rules. You will compliment me. Three times. *Sincerely.* I'll know.");
        await api.say('player', "Your robe is... very shiny.");
        await api.say('gideon', "Weak. Next.");
        await api.say('player', "Your hair is incredible.");
        await api.say('gideon', "Predictable. One more, darling. Make it count.");
        const c = await api.choose('Gideon holds the scissors an inch from your head. He is waiting.', [
          { label: '"You make a room feel like a movie just started."', value: 'specific' },
          { label: '"You\'re really, really good-looking."', value: 'generic' },
          { label: '"Your whole look is... fantastic. Very, very good."', value: 'fake' },
        ]);
        if (c === 'specific') {
          api.hearts('gideon', 30);
          await api.narrate("The scissors stop. In the mirror, you see his face do something he clearly didn't plan.");
          await api.sayMood('gideon', 'surprised', "...That was *precise.* Do you know how long it's been since anyone was precise?");
        } else if (c === 'generic') {
          api.hearts('gideon', 15);
          await api.say('gideon', "Accurate. Unimaginative. But accurate. I'll allow it. *Just.*");
        } else {
          api.hearts('gideon', -10);
          await api.sayMood('gideon', 'angry', "Insincere. I can smell it. It smells like a gas station.");
          await api.narrate("He points the scissors at the door. Not a threat. A request. It takes a long and awkward ten minutes before he'll even look at you.");
          await api.say('gideon', "...Fine. Sit. But I'm only doing it because I can't stand to see a head like that go to waste.");
        }
        await api.narrate("He spins you away from the mirror and cuts for twenty minutes in total silence. It's the first silence you've heard from him. His hands never shake once.");
        await api.say('gideon', "There. Done. Don't look yet. I'll be in the back. Look at it alone. You deserve a moment with yourself.");
        await api.narrate("He leaves. The chair spins you to face the mirror. It's the best haircut of your life. On the glass, in lipstick: *You're welcome. (And thank you.)*");
      },
    },
    // ---------------------------------------------------------------- 4: Fifty folding chairs
    {
      id: 'gideon-4', hearts: 4, map: 'salon', when: { weekday: [2] }, title: 'Fifty Folding Chairs',
      script: async (api) => {
        await api.narrate("Wednesday afternoon. The salon's empty, the sign turned to BACK IN FIVE MINUTES. Gideon's at his station, folding the same towel for the eleventh time.");
        await api.say('gideon', "Walk with me. The Hot Tag. I'm about to have a *moment* and I would like it to be near pie.");
        await api.fade();
        await api.narrate("The back booth. A paper lunch bag is already on the table, crumpled and soft with use. Gideon sits down, pressing it to his mouth, and breathes in and out like a leaky tire.");
        await api.say('gideon', "Fifty folding chairs. Bingo after. And I'm hyperventilating like it's a coronation.");
        await api.narrate("He laughs, breathlessly. The laugh turns into a wheeze. The robe's rose-gold sequins shiver.");
        await api.say('gideon', "It's the *small* shows. Two thousand people at the Sportatorium is a blur. At the VFW they can see my face. They can see my *eyebrow.*");
        const c = await api.choose('He lowers the bag and looks at you, eyes wet and wide.', [
          { label: 'Breathe with him: in for four, hold four, out four', value: 'breathe' },
          { label: '"I\'m terrified before every show, too."', value: 'nervous' },
          { label: 'Take the bag. Solemnly breathe into it yourself.', value: 'bag' },
        ]);
        if (c === 'breathe') {
          api.hearts('gideon', 30);
          await api.narrate("You breathe. In for four. Hold. Out. After the third round, his shoulders drop an inch. After the sixth, two.");
          await api.say('gideon', "Hazel taught me that. I do it eleven times a day. I'd just never done it with *company.*");
        } else if (c === 'nervous') {
          api.hearts('gideon', 30);
          await api.sayMood('gideon', 'surprised', "You are? You *look* so... you walk out there like... oh. Oh, we're all just doing a very convincing impression of a person.");
          await api.say('gideon', "I'm going to think about that for the rest of my life. Thank you for telling me.");
        } else {
          api.hearts('gideon', 15);
          await api.narrate("You take the bag and breathe into it with great ceremony. Gideon stares. Then he laughs so hard he has to put his forehead on the table.");
          await api.say('gideon', "That's... that was *disgusting*, and it was the nicest thing that's happened to me this week.");
        }
        await api.say('gideon', "Right. Right! Let me fix my face. If anyone asks, I was visiting the pie. The pie was *emotionally supportive.*");
        await api.narrate("He pats his pompadour into place, checks it in the back of a spoon, and stands. He's two inches taller than he was five minutes ago.");
      },
    },
    // ---------------------------------------------------------------- 6: The breathing beat
    {
      id: 'gideon-6', hearts: 6, map: 'salon', when: { weekday: [5] }, title: 'The Breathing Beat',
      script: async (api) => {
        await api.narrate("Saturday. Gideon turns the salon sign early, and his face is the color of a slightly overdone biscuit.");
        await api.say('gideon', "Walk me to the Sportatorium. I walk faster if somebody's talking. Talk about anything. Moths. Spaghetti.");
        await api.fade();
        await api.narrate("The locker room. He locks the door, turns the mirror to the wall, sits on the floor in his sequins, and puts both hands over his face. His whole body is shaking.");
        await api.sayMood('gideon', 'sad', "I can't. I can't go out there. Two thousand people. I'm going to forget everything, I'm going to trip on the robe, they're going to see...");
        await api.narrate("He doesn't finish the sentence. He is breathing too fast. His fingers are leaving dents in his own pompadour.");
        const c = await api.choose('There is no wrong way to help. You just have to pick a rhythm.', [
          { label: 'Count out loud with him: four in, four hold, four out', value: 'count' },
          { label: 'Hum the slow bossa nova from the salon radio', value: 'hum' },
          { label: 'Turn the mirror around. "Look. You\'re still *you.*"', value: 'mirror' },
        ]);
        if (c === 'count') {
          api.hearts('gideon', 30);
          await api.narrate("You kneel next to him and count, low and slow. In, two, three, four. Hold. Out. By the fifth cycle his hands come down from his face. By the eighth, he's breathing along.");
        } else if (c === 'hum') {
          api.hearts('gideon', 30);
          await api.narrate("You hum the bossa nova. Badly. He listens. A corner of his mouth lifts, the shaking eases, and by the second chorus he's humming the counter-melody.");
        } else {
          api.hearts('gideon', 15);
          await api.narrate("You turn the mirror. He flinches, looks, flinches, looks again. It's not quite a help. But the second look is longer.");
        }
        await api.say('gideon', "...Thank you. There's nothing I can do about the fact that people see me. But I can do a *very good job* of being seen.");
        await api.narrate("He stands. He checks his hair. He adjusts the collar. Then he steps out into the corridor, and at the end of it the crowd's roar swells like a wave.");
        await api.narrate("Later, from the curtain, you watch him make his entrance. Three full stops on the ramp to fix his hair. On the third, he glances over his shoulder at the curtain. At you. Then he turns, and he's magnificent.");
      },
    },
    // ---------------------------------------------------------------- 8: The hair book
    {
      id: 'gideon-8', hearts: 8, map: 'salon', title: 'The Hair Book',
      script: async (api) => {
        await api.narrate("Closing time. Gideon turns the sign, dims the rose-gold lights to plain gold, and opens a small safe behind the red velvet chair.");
        await api.say('gideon', "I've never shown anyone this. Not Hazel. Not Miss Opal. Not the therapist. She *suspects*.");
        await api.narrate("He sets a fat, battered ledger on the counter. On the cover, in marker gone brown with age: HAIR.");
        await api.narrate("Inside: a page for every hairstyle since he was nine. Little drawings, notes, photographs taped in at the corners.");
        await api.say('gideon', "Age nine. First page. 'MOP.' Written in red crayon on my desk, by somebody else. I copied it into the book myself. If I wrote it down first, it couldn't ambush me.");
        await api.say('gideon', "Eleven: 'The Bowl.' Thirteen: 'The Terrible Thing With The Gel.' Fifteen: the first pompadour. 'Nobody laughed. I checked.'");
        await api.say('gideon', "Every page is armor. The hair is armor. If they're looking at the hair, they're not looking at me.");
        await api.sayMood('gideon', 'sad', "The last page has been blank for a year. I keep thinking I'll write something. But all I can think of is, 'Here is the man under it.'");
        const c = await api.choose(null, [
          { label: '"I\'m looking at you. I always have been."', value: 'look' },
          { label: 'Ask if you can add a page, in your own handwriting', value: 'page' },
          { label: '"Great armor. Honestly. The best in the business."', value: 'armor' },
        ]);
        if (c === 'look') {
          api.hearts('gideon', 30);
          await api.narrate("He doesn't speak. He picks up his hand mirror, then puts it face-down on the counter.");
          await api.say('gideon', "I know. I've noticed. It's... a lot. It's a *very good* lot.");
        } else if (c === 'page') {
          api.hearts('gideon', 30);
          await api.narrate("He hands you his best pen, silver, from his pocket. You write one line on the blank page and don't show him. He closes the book before he can read it.");
          await api.say('gideon', "I'll read it tonight. Alone. With the lights off. And possibly a bag.");
        } else {
          api.hearts('gideon', 15);
          await api.narrate("He laughs, startled, and presses the book to his chest. It's not the answer he was hoping for, but it's an honest one.");
          await api.say('gideon', "Armor is armor. I'll take the compliment. And I'll keep thinking about the other thing.");
        }
        api.flag('gideon_hair_book', true);
        await api.narrate("He locks the book back in the safe, spins the dial, and rests his forehead on the cold steel for a moment.");
        await api.say('gideon', "Thank you for not laughing. Mop. That's... that was a long time ago. I think I'm allowed to say it now.");
      },
    },
    // ---------------------------------------------------------------- 10: In his corner
    {
      id: 'gideon-10', hearts: 10, map: 'salon', title: 'The Last Person Who Saw Me Gorgeous',
      script: async (api) => {
        await api.narrate("A flyer is pinned to the salon mirror, in Birdie's blocky handwriting: HAIR VS. HAIR. HARVEST HAVOC. GIDEON PRICE vs. TBD.");
        await api.narrate("Gideon is staring at it in the glass, three feet behind his own reflection, not moving at all.");
        await api.say('gideon', "Birdie asked me yesterday. I said yes before my mouth knew what it was agreeing to.");
        await api.say('gideon', "It'll be fine. I know it'll be fine. There's a clause. There's *always* a clause. Birdie will discover the Hair Clause at the last second. Or Jobber will steal the clippers. Or the power will go out.");
        await api.sayMood('gideon', 'sad', "But what if there isn't, this once? What if the lights stay on, and the clippers work, and I stand there in front of two thousand people without it?");
        await api.say('gideon', "I'd like somebody in my corner. Not a second. Not a handler. A person.");
        await api.say('gideon', "If it goes wrong, you'll be the last person who saw me gorgeous.");
        const c = await api.choose(null, [
          { label: '"I\'ll be in your corner. All the way."', value: 'corner' },
          { label: '"I\'ll carry the mirror. You can look at me instead."', value: 'mirror' },
          { label: '"You have the Hair Clause. Nothing will happen."', value: 'clause' },
        ]);
        if (c === 'corner') {
          api.hearts('gideon', 30);
          await api.narrate("He nods. It takes him a very long time to get his face under control.");
          await api.sayMood('gideon', 'love', "Then I'm not afraid of losing the hair. I'm afraid of how much I'm going to cry at the end. That's... a much more *comfortable* fear.");
        } else if (c === 'mirror') {
          api.hearts('gideon', 30);
          await api.narrate("He laughs, and then he has to sit down in the red velvet chair.");
          await api.say('gideon', "You are going to be the *worst* mirror-bearer in the history of the sport. And I wouldn't trade you for a thousand mirrors.");
        } else {
          api.hearts('gideon', 15);
          await api.narrate("He laughs, but it isn't quite right.");
          await api.say('gideon', "Contracts aren't magic, darling. A clause is just a piece of paper somebody hopes works. ...But thank you. It's a lovely thing to say.");
        }
        api.flag('gideon_hair_match', true);
        await api.say('gideon', "Harvest Havoc. Bring a handkerchief. A big one. For me. Possibly for the Mountain.");
      },
    },
    // ---------------------------------------------------------------- 12: The first date
    {
      id: 'gideon-12', hearts: 12, map: 'salon', when: { dating: true }, title: 'Forty Photos',
      script: async (api) => {
        await api.narrate("A card slides across the salon counter, pressed in rose-gold ink: THE HOT TAG. SEVEN. WEAR SOMETHING WORTHY OF ME.");
        await api.fade();
        await api.narrate("The Hot Tag, front window booth. Gideon is in full rose-gold, with his hand mirror, his collar, and the posture of a man being photographed by the universe.");
        await api.narrate("A new waiter approaches, trembling.");
        await api.sayMood('gideon', 'smug', "Photograph me. My good side. No, the other good side. Forty photographs. I'll tell you when to stop. I won't.");
        await api.narrate("Forty photos later, the waiter is sweating. The diner is a standing ovation of horrified customers. Gideon preens through it all.");
        const c = await api.choose('Under the table, something touches your knee. His fingers. They are shaking badly.', [
          { label: 'Offer to take the photos yourself', value: 'photos' },
          { label: 'Play along: "Darling, I\'m the plus-one of the century."', value: 'play' },
        ]);
        if (c === 'photos') {
          api.hearts('gideon', 30);
          await api.narrate("You take the waiter's phone. You take forty photos. You find his good side. You find his other good side. Under the table, his hand turns over and holds yours.");
        } else {
          api.hearts('gideon', 15);
          await api.narrate("He's *thrilled.* In character, it's a delight. For a few minutes you're both completely, ridiculously insufferable. A child at the counter starts to cry.");
        }
        await api.fade();
        await api.narrate("The back booth, after closing. The robe's off. The soft gray hoodie is on. His hand is still shaking, and he takes yours without looking at it.");
        await api.say('gideon', "I'm sorry about the photos. I'm not sorry. Both. I'm... I needed to see if I could hold it together. In public. With you.");
        await api.say('gideon', "And I could. I did. And then I had to take your hand, because the rest of it was too much.");
        await api.say('gideon', "Birdie asked. Do we tell the town? On-screen: 'Gorgeous Gideon Is In LOVE,' with a ringside valentine the crowd boos lovingly. Or... it's ours. I do your hair before every show. Nobody has to know why.");
        const s = await api.choose('How should the romance live?', [
          { label: 'On-screen: "Gorgeous Gideon Is In LOVE"', value: 'on' },
          { label: 'Secret: I do your hair before every show', value: 'secret' },
        ]);
        if (s === 'on') {
          api.flag('gideon_romance_onscreen', true);
          await api.sayMood('gideon', 'happy', "A valentine segment. They're going to boo me *so lovingly.* I've never been booed with affection before. I'll write a sonnet about my eyebrow.");
        } else {
          api.flag('gideon_romance_secret', true);
          await api.sayMood('gideon', 'love', "Ours, then. Every show. The best haircut in the state, and the only audience that matters is the one who knows what it's for.");
        }
      },
    },
    // ---------------------------------------------------------------- 14: The silver scissors
    {
      id: 'gideon-14', hearts: 14, map: 'salon', when: { dating: true }, title: 'The Red Velvet Chair',
      script: async (api) => {
        await api.narrate("After closing. The rose-gold lights are low. Gideon is sitting in the red velvet chair. He never sits in the red velvet chair.");
        await api.say('gideon', "Miss Opal sold me this place for a dollar and a promise. Keep the chair. I never asked why.");
        await api.say('gideon', "It took me three years to find out. Before every show from 1970 to 1983, she did one woman's braid in this chair.");
        await api.say('gideon', "Your grandmother. The Duchess. Thirteen years. A crown braid, in this very chair, before she walked out like she owned the building.");
        await api.narrate("He's stroking the velvet arm, absently.");
        await api.say('gideon', "I didn't tell you. When we met. It wasn't mine to tell. And then it was too late, and then I was too in love with you to want to be anything but honest.");
        await api.narrate("He leaves the chair and opens a velvet case. Inside lie a pair of silver scissors, thin as a whisper, polished to a mirror.");
        await api.say('gideon', "Miss Opal's. They've never touched my own hair. Not once. Nobody's allowed.");
        await api.say('gideon', "If I ever hand them to you, and say 'one lock,' I'm asking you everything. I wanted you to know what it means before I do it.");
        const c = await api.choose(null, [
          { label: 'Take his hand and say "I understand"', value: 'understand' },
          { label: 'Tell him he doesn\'t have to hurry', value: 'time' },
        ]);
        if (c === 'understand') {
          api.hearts('gideon', 30);
          await api.narrate("He nods. He doesn't speak. He just holds on and lets you feel his pulse, fast and fluttering, through his thumb.");
        } else {
          api.hearts('gideon', 15);
          await api.sayMood('gideon', 'happy', "I won't. But thank you. A man in my condition tends to *hurry* when he's terrified. You've got a lovely way of slowing me down.");
        }
        await api.narrate("Before you go, he hands you a long, soft scarf, in rose gold and plum. 'Your colors,' he says, 'whether you've noticed or not.' Forty-one rows. It took him a month.");
        await api.say('gideon', "I knit it between clients. And at three in the morning. It's wool. It's warm. And it's a very small piece of me you can wear out in public.");
        api.flag('gideon_proposal_ready', true);
      },
    },
  ],
} satisfies DialogueSet;
