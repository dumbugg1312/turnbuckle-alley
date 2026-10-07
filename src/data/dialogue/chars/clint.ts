import type { DialogueSet } from '../types';

/**
 * "Cowboy" Clint Ransom, 52, secretly the Dust Devil. Fairgrounds caretaker and
 * Wanda's keeper. A rodeo bullfighter from Okmulgee County who became the town's
 * favorite hero, promised his daughter Lacey he'd quit, and couldn't. Birdie's
 * idea: nobody suspects the man being insulted. Nobody in town knows, and in a
 * town this size that is its own loneliness.
 *
 * Voice: laconic, dry, sentimental, bad at feelings, wonderful with animals.
 * Taps his hat brim twice when he's moved and doesn't want to say so.
 *
 * Place logic: as Clint (fairgrounds, diner, public) he is the retired hero.
 * On show nights ('show') he is the Dust Devil and the villain. The Dust Devil
 * never breaks kayfabe; Clint only does it with insiders in the three rooms.
 *
 * Flags set here: 'clint_dartboard' (6), 'clint_unmask_choice' + one of
 * 'clint_unmask_ring' / 'clint_unmask_first' (8: the story engine reads
 * 'clint_unmask_choice' as the player's say in how Lacey finds out),
 * 'clint_last_match' (10: Lacey's 10-heart scene reads it).
 */
export default {
  npc: 'clint',
  intro: [
    "(A lanky man in a straw hat sits on the locker room bench, holding a rust-and-sand mask in both hands like it might wake up.)",
    "Clint Ransom. Folks call me Cowboy. Folks call the other fella a lot of things I won't repeat in a locker room.",
    "Birdie says you can keep a secret. That's the main qualification. The rest is bumps.",
    "I run the fairgrounds. Wanda's the bear. She's polite. Come by sometime. Bring honey.",
  ],
  introPublic: [
    "(A lanky man in a straw hat leans on the fairgrounds fence, a silver handlebar mustache lifting in what might be a smile.)",
    "Clint Ransom. Fairgrounds. Retired, partner. Hat's just for shade now.",
    "That's Wanda over yonder. She's polite. She's also a bear. Respect both.",
  ],
  lines: [
    // ---------------------------------------------------------------- Public: Clint, retired
    { text: "Retired, partner. Hat's just for shade now.", when: { hearts: [0, 2], place: ['public'] }, weight: 2 },
    { text: "Wanda's polite. She's also a bear. Respect both.", when: { place: ['public'], map: ['fair'] } },
    { text: "(Clint tucks a paperback into a feed bag as you walk up.) Just... feed. (It's a western. It's always a western.)", when: { place: ['public'], map: ['fair'] } },
    { text: "Heroes are welcome at the fairgrounds. The quiet ones, especially. Wanda likes quiet.", when: { place: ['public'], alignment: ['face'] } },
    { text: "Heel, huh. Folks say you're good at it. Lacey says you're 'kind of awesome.' I'm choosing not to have heard that.", when: { place: ['public'], alignment: ['heel'], flag: 'debuted' }, mood: 'sad' },
    { text: "That Dust Devil fella calls me washed-up on the radio. Ain't a thing about him I trust. Not the mask, not the mouth. And I'd know.", when: { place: ['public'], hearts: [3, 10] }, mood: 'angry' },
    { text: "Livestock auction tonight. Back late. Wanda'll mind the fence. I never buy anything. I just like the hats.", when: { showDay: true, place: ['public'] }, weight: 2 },
    { text: "Lacey's got a meet Tuesday. Top row, hat over my heart. She waves at the whole gym, but I know who it's for.", when: { place: ['public'], weekday: [1], hearts: [3, 10] } },
    { text: "Sunday breakfast with Lacey after church. Pancakes. She steals my bacon. It's a ritual.", when: { place: ['public'], weekday: [6] } },
    { text: "Agnes Pickett's peach pie, I'd cross a state line for. She knows it, too. She brings up the state line.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "Hazel Huang came by the fairgrounds. Checked the honey. Said it was 'adequate.' Highest praise I've had all year.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "Doc Halloran cleared me for light work. Light being a relative term. I feed a bear. She's *medium.*", when: { place: ['public'], hearts: [3, 10] } },
    { text: "(He taps his hat brim twice. Doesn't say why. Doesn't look at you.)", when: { place: ['public'], hearts: [6, 10] }, mood: 'sad' },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "Rain. Wanda hates rain hats. Learned that the hard way. Don't ask what happened to the last hat.", when: { weather: ['rain'], place: ['public'] } },
    { text: "Storm's coming. I'd best go sit with Wanda. She hums when it thunders.", when: { weather: ['storm'], place: ['public'] } },
    { text: "Snow's good for the old knees and bad for the old knees. Mostly good. Wanda loves it.", when: { weather: ['snow'], place: ['public'] } },
    { text: "Wind's got a mean streak today. Reminds me of a certain masked fella.", when: { weather: ['wind'], place: ['public'] } },
    { text: "Wanda woke up this morning. First thing she did was bow at the gate. I had to go check on a fence post for a while.", when: { season: [0], place: ['public'] }, weight: 2 },
    { text: "County fair's all week. Funnel cake and a bear that bows. If that don't improve a man, nothing will.", when: { season: [1], place: ['public'] } },
    { text: "Harvest. The infield's a mess of leaves. I leave 'em. Wanda likes the crunch.", when: { season: [2], place: ['public'] } },
    { text: "Winter. Wanda's in her den. I sit outside and read her a western. She snores. Best review I ever got.", when: { season: [3], place: ['public'] } },

    // ---------------------------------------------------------------- Show nights: the Dust Devil
    { text: "That old cowboy's done. I'm what blows through after the legends dry up.", when: { place: ['show'] }, mood: 'smug', weight: 2 },
    { text: "(The Dust Devil looks right through you. He pats his duster. A small puff of cornstarch rises, and settles on your boots.)", when: { place: ['show'] }, mood: 'smug' },
    { text: "A hero. I've buried a dozen. Take a number, kid. It's in the dirt.", when: { place: ['show'], alignment: ['face'] }, mood: 'angry' },
    { text: "Another dirt thrower. Competition. Don't get any on my coat. It's a good coat.", when: { place: ['show'], alignment: ['heel'] }, mood: 'smug' },
    { text: "Tell Hurricane the Dust Devil says: partly dusty, with a chance of more dust.", when: { place: ['show'], hearts: [3, 10] }, mood: 'smug' },

    // ---------------------------------------------------------------- Insider: Clint, with the mask off
    { text: "Don't tell anybody I'm nervous. I'm supposed to be a weather event.", when: { place: ['insider'], showDay: true }, mood: 'sad', weight: 2 },
    { text: "Everything the Dust Devil says about 'that washed-up cowboy' costs me something. A nickel at a time. I'm going broke in a very specific currency.", when: { place: ['insider'], hearts: [3, 10] }, mood: 'sad' },
    { text: "Birdie's idea. 'Nobody suspects the man being insulted.' Cheapest trick in the book, and the saddest. She told me to keep it.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "I promised Lacey I'd quit. Said it at the party, over a sheet cake. Meant it. Went home and couldn't unlace the boots. Man's gotta be honest with himself, if not with his daughter.", when: { place: ['insider'], hearts: [3, 10] }, mood: 'sad' },
    { text: "Okmulgee County. Rodeo bullfighter, 1993. That buckle's from the last time I stayed on. I kept the buckle. The bull kept the hat.", when: { place: ['insider'] }, mood: 'happy' },
    { text: "I saw the Velvet Hammers on a fuzzy syndicated tape in Oklahoma. Eight years old. Told my mama I was gonna wrestle in their building. She said eat your peas. I ate my peas. And I wrestled in their building.", when: { place: ['insider'], hearts: [3, 10] }, mood: 'happy' },
    { text: "Nobody in town knows I'm the Dust Devil. In a town this size, that's its own kind of lonely. Not complaining. Telling.", when: { place: ['insider'], hearts: [6, 10] }, mood: 'sad', weight: 2 },
    { text: "Wanda doesn't know I'm the Dust Devil. ...Okay. She might. She looks at me funny when I come home smelling like cornstarch.", when: { place: ['insider'] }, mood: 'happy' },
    { text: "Doc cleared me. Watches every bump like a hawk in reading glasses. Winces on the soft ones. I ain't got the heart to tell him I like it.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "First rule of the Dust Devil: dirt in the eye is theater, not damage. Sell it right and nobody gets hurt. Sell it wrong and you're just a bad man.", when: { place: ['insider'], rank: ['rookie', 'opener'] } },
    { text: "Main event. Folks'll look at you the way they looked at me. Pick one face in the crowd. Wrestle for them.", when: { place: ['insider'], rank: ['main', 'assistant', 'pencil', 'owner'] } },
    { text: "Can't sleep when the weather's changing. Neither can Wanda. We keep each other company through the fence.", when: { time: [1320, 1560] }, mood: 'sad' },
    { text: ["You and {opponent}. I watched from the tunnel with the mask in my lap.", "You took the {finisher} like a man falling off a hay wagon. That's a compliment where I'm from."], when: { place: ['insider'], lastMatch: { maxDaysAgo: 3 } } },
    { text: "Lacey watched your match with {opponent} from the bleachers. She didn't say a word on the drive home. That's a rave, from her.", when: { place: ['insider'], lastMatch: { minStars: 3.5, maxDaysAgo: 4 } }, mood: 'happy' },

    // ---------------------------------------------------------------- After the events
    { text: "Lacey's got a dartboard with the Dust Devil's face on it. I sleep better knowing it. A man ought to be somebody's target.", when: { flag: 'clint_dartboard', place: ['insider'] }, mood: 'happy' },
    { text: "Last match is coming. I told Wanda. She bowed. She bows at everything. ...It was a *good* bow.", when: { flag: 'clint_unmask_choice', notFlag: 'clint_last_match', place: ['insider'] }, weight: 3 },
    { text: "Mask's on the nail. Hat's next to it. I look at 'em every time I walk into that room. Waiting on my girl. She'll know when she's ready. So will I.", when: { flag: 'clint_last_match', place: ['insider'] }, mood: 'sad', weight: 2 },
    { text: "I saw the Velvet Hammers in a ring, forty years late and right on time. Eight-year-old me about fell off the couch.", when: { flag: 'reunion_done', place: ['insider'] }, mood: 'happy', weight: 2 },

    // ---------------------------------------------------------------- Family
    { text: "You're the only person in town who knows both fellas. You've never once asked which one's the real one. ...Thank you. They both are.", when: { hearts: [9, 10], place: ['insider'] }, mood: 'love' },
  ],
  gifts: {
    loves: ['honey', 'pie', 'paperback'],
    likes: ['leather', 'coffee', 'vinyl', 'corn-dog', 'fish', 'polaroid'],
    dislikes: ['trading-card', 'toy-wrestler', 'foam-finger'],
  },
  giftReplies: {
    love: [
      "(He turns it over once in his big hands. Taps his hat brim twice.) Thank you, partner. I mean it.",
      "Well. That's a fine thing. You don't know. ...I'll be sitting on this one a good long while.",
      "Dang. That's a gift and a half. Wanda's gonna smell it from the fence.",
    ],
    like: [
      "Well, that's right kind. I'll put it to use.",
      "Appreciate it. A man could use more neighbors like you.",
      "Thank you kindly. It's a good one.",
    ],
    neutral: [
      "Huh. Much obliged. I'll hang the {item} on a nail. Everything out here's got a nail.",
      "Well. Wanda's going to want to smell that {item}. Everything comes through Wanda first.",
    ],
    dislike: [
      "You're a funny one. (It goes straight into the feed bag before anybody can see.)",
      "Mm. I'll put that where I'll find it. Eventually. Not soon.",
      "Where'd you get this? ...Never mind. I'll just set it down. Over here. Farther.",
    ],
    birthday: [
      "Birthday. Ain't had one noticed in a good while. ...A {item}. I'll show Wanda. She'll bow at it.",
      "Winter, the third. Cold as a cellar. (He taps his hat brim twice and puts the {item} inside his coat.)",
    ],
    byItem: {
      honey: "Fairgrounds honey. Half for Wanda, half for my coffee. ...Sixty-forty. She'll know if it's fifty-fifty. She counts by smell.",
      pie: "Peach? ...It's Agnes's. I can tell by the lattice. You didn't steal it, did you. Don't answer. I'll eat it anyway.",
      paperback: "A western? ...It's a mystery. Well. A man can branch out. I'll read it in the truck where nobody can see me guessing wrong.",
      leather: "Good strap. Oiled. I'll fix the gate latch with it. The gate's been held shut with a bootlace since April.",
      coffee: "Strong? Good. June makes it so it stands up on its own. That's how I like my coffee and my bears.",
      vinyl: "Somebody's entrance music. I'll play it for Wanda. She sways. Not to the beat. To her own idea of the beat.",
      'corn-dog': "Corn dog. I eat these walking the midway so folks think I'm on patrol. I'm not on patrol. I'm eating a corn dog.",
      fish: "Bluegill. Wanda gets the head, I get the rest. We've done it that way nine years. Neither of us has complained.",
      polaroid: "Somebody's crowd photo. I used to be in pictures like this. Front row, cheering a fella in a hat. ...I'll keep it.",
    },
    later: [
      "Wanda's been nosing at the {lastGift}. I let her. She gives it back. She's got manners.",
      "Still got the {lastGift} on the dash of the truck. Lacey asked about it. I said a friend. She said 'you have friends?'",
    ],
  },
  again: [
    "(Clint touches his hat brim once. That's 'still here.' Twice would be something else.)",
    "We talked, partner. I'm not a talker. That was most of my day's talking.",
    "Wanda wants her supper. I'd best not keep a bear waiting.",
  ],
  idle: [
    "(Clint is leaning on the fence, watching nothing in particular, the way only a man who's watched cattle can.)",
    "Afternoon. Wanda says hello. She does it by sitting down.",
  ],
  birthday: { season: 3, day: 3 },
  events: [
    // ---------------------------------------------------------------- 2: Honey on a wooden spoon
    {
      id: 'clint-2', hearts: 2, map: 'fair', title: 'Honey on a Wooden Spoon',
      script: async (api) => {
        await api.narrate("The fairgrounds at sunup. A weathered grandstand, an empty midway, and past the corn dog stand, a heavy fence around a patch of clover. Clint leans on the top rail with a coffee.");
        await api.say('clint', "Morning, partner. You're up early. Good. Wanda likes early.");
        await api.narrate("Behind the fence, something enormous, brown, and the size of a sofa sits down in the clover and looks at you with the dignified patience of a hotel concierge.");
        await api.say('clint', "That's Wanda. She's polite. She's also a bear. Respect both.");
        await api.narrate("He hands you a wooden spoon and a jar of honey. The spoon is long and smoothed with years of use.");
        await api.say('clint', "Spoon first. Hold it level. Don't flinch. She'll take it with her lips, soft as a horse. She's never once bitten a spoon. She's never once bitten anything.");
        const c = await api.choose('Wanda extends one great paw, palm up, and waits.', [
          { label: 'Bow to Wanda first, then offer the spoon', value: 'bow' },
          { label: 'Hold the spoon out steady and don\'t flinch', value: 'steady' },
          { label: 'Sneak a lick of the honey first', value: 'lick' },
        ]);
        if (c === 'bow') {
          api.hearts('clint', 30);
          await api.narrate("You bow. Wanda considers this carefully, and bows back, a slow, deep tilt of the head. Clint's mustache lifts.");
          await api.say('clint', "Manners first. Most folks skip to the honey. She'll like you for it. ...I do too.");
        } else if (c === 'steady') {
          api.hearts('clint', 30);
          await api.narrate("You hold the spoon level. Wanda's lips close over it, whiskers tickling your wrist, as soft and slow as a held breath. Then she hums, a low pleased rumble.");
          await api.say('clint', "Steady hands. That's all it takes. Funny how the whole world runs on it.");
        } else {
          api.hearts('clint', -10);
          await api.narrate("You dip a finger in the jar. Wanda sees. She stops. She looks at you for a very long, very polite time.");
          await api.say('clint', "That honey's hers, partner.");
          await api.narrate("She doesn't make a sound. She doesn't have to. She turns her back on you, and sits down facing the fence line. It lasts about twenty minutes.");
        }
        await api.say('clint', "Come by whenever. Early's best. Late's all right. Bring honey. Don't bring a camera. She finds 'em rude.");
        await api.narrate("As you leave, you see him tap the brim of his hat, twice, to nobody in particular.");
      },
    },
    // ---------------------------------------------------------------- 4: Shaking hands
    {
      id: 'clint-4', hearts: 4, map: 'fair', when: { showDay: true }, title: 'A Weather Event',
      script: async (api) => {
        await api.narrate("Show day, midafternoon. Clint is on the grandstand steps with a feed bag in his lap, staring at his hands.");
        await api.say('clint', "Ride with me. I've got a delivery for the Sportatorium. Livestock. Sit in back. Don't ask.");
        await api.fade();
        await api.narrate("The locker room, empty. Clint sets the feed bag on the bench and takes out a long black duster and a rust-and-sand mask with a swirling pattern.");
        await api.narrate("He holds the mask in both hands. They're shaking. A lot.");
        await api.say('clint', "Twenty years. Never shook once. Not on a bull. Not in front of ten thousand. And now I've got a kid with a dartboard.");
        await api.sayMood('clint', 'sad', "My hands do this before every show. I'm supposed to be a weather event. Weather doesn't shake.");
        await api.say('clint', "I keep thinking, what if she's in the building? What if she hears one of the lines I say about myself, and it's just a bit too good?");
        const c = await api.choose('The mask trembles in his fingers.', [
          { label: 'Offer to tie the strings for him', value: 'tie' },
          { label: '"I\'ve got your hat. I\'ll hold it for you."', value: 'hat' },
          { label: '"You could just stay Clint. Skip tonight."', value: 'skip' },
        ]);
        if (c === 'tie') {
          api.hearts('clint', 30);
          await api.narrate("He turns his back. You tie the knot at the back of his head, double, the way Marigold taught you. His shoulders drop an inch.");
          await api.say('clint', "Thank you, partner. Nobody's ever tied it. I've done it forty years alone.");
        } else if (c === 'hat') {
          api.hearts('clint', 30);
          await api.narrate("You take the battered straw hat and hold it against your chest. He ties the strings himself, slow, and when he turns, he's a different man. The same hands, but steady.");
          await api.say('clint', "Hold it good. That hat's been to more funerals and weddings than the preacher.");
        } else {
          api.hearts('clint', -10);
          await api.say('clint', "And break a second promise? Birdie's got my word on a last run. Lacey's got my word on a quiet life. I only get to keep one.");
          await api.narrate("He pulls the mask on, hard, and the shaking stops all at once, like a switch. It's worse.");
        }
        await api.narrate("In the doorway, the Dust Devil turns his masked head and looks at you for a moment, the tinted mesh catching the light.");
        await api.say('clint', "That fella out there ain't me. But he sure ain't nobody else, either. You saw nothing. Obliged.");
      },
    },
    // ---------------------------------------------------------------- 6: The dartboard
    {
      id: 'clint-6', hearts: 6, map: 'diner', title: 'Dead Center',
      script: async (api) => {
        await api.narrate("The Hot Tag, late morning. Clint is at the counter with a coffee and a slice of pie that Agnes would call 'decent.' He sees you and tips his head toward the back booth. The corner. Where only insiders go.");
        await api.fade();
        await api.narrate("The back booth. Clint takes off his hat and puts it crown-down on the table, for luck. From the hatband he slides a small square photograph.");
        await api.say('clint', "Polaroid. Lacey took it. She sent a copy to her mama in the city. Her mama sent it on to me. Said, 'Your daughter has your aim.'");
        await api.narrate("The Polaroid: a dartboard on a bedroom door. A rust-and-sand mask drawn on the cork in red paint. One dart, buried straight between the eyes.");
        await api.say('clint', "Dead center. Between his eyes. I mean *his* eyes. The Dust Devil's. I've been hit by chairs, bulls, a tuba once. Nothing ever got me like that dart.");
        await api.sayMood('clint', 'happy', "I've never been prouder of anything in my life. That's my girl. Twelve days of practice. I about wept into my meatloaf.");
        const c = await api.choose(null, [
          { label: '"She has your aim. You should be proud."', value: 'proud' },
          { label: '"Tell her. Tonight. She deserves to know."', value: 'tell' },
          { label: '"Maybe the Dust Devil needs a helmet."', value: 'helmet' },
        ]);
        if (c === 'proud') {
          api.hearts('clint', 30);
          await api.narrate("He taps his hat brim twice, even though his hat is sitting on the table. He realizes. He taps the table instead.");
          await api.say('clint', "I am. I surely am. Keep that between us. ...Keep all of it between us. Not yet.");
        } else if (c === 'tell') {
          api.hearts('clint', -10);
          await api.say('clint', "No.");
          await api.narrate("Just the one word. He picks up the Polaroid and tucks it back in his hat band. His eyes go distant and a little cold.");
          await api.say('clint', "Not like that. Not at a diner counter, not on a Tuesday. When she's *ready.* When I am. ...I'm sorry, partner. I know you mean well.");
        } else {
          api.hearts('clint', 15);
          await api.narrate("He laughs, a short, surprised sound, like a gate swinging open.");
          await api.say('clint', "A helmet. Ha. That's a good one. That's a... ha. I'll tell her. 'The Dust Devil's asking for a helmet.' She'll throw a harder dart.");
        }
        api.flag('clint_dartboard', true);
        await api.narrate("He puts his hat back on, squares it, and finishes his pie. It's a decent pie. He eats it like it's the best he's ever had.");
      },
    },
    // ---------------------------------------------------------------- 8: One more match
    {
      id: 'clint-8', hearts: 8, map: 'fair', title: 'The Bulldogger',
      script: async (api) => {
        await api.narrate("Sundown at the fairgrounds. Clint has Wanda's dinner bucket in one hand, a fresh paperback in the other, and an expression like a man who's been practicing a sentence all week.");
        await api.say('clint', "Walk with me. The Sportatorium. There's something I'd like to ask in a room where I'm allowed to say it.");
        await api.fade();
        await api.narrate("The locker room. Clint takes off his hat, and sets it on the bench beside the Dust Devil's mask. Together, they look almost like a conversation.");
        await api.say('clint', "I've got a last match in me. One. I know it. My knees know it. Doc knows it, and he's about to have a heart attack about it.");
        await api.say('clint', "I'd like it to be against you. I want to hit the Bulldogger one more time. My old move. Out from under the Dust Devil's coat. With my girl in the building.");
        await api.sayMood('clint', 'sad', "Lasso and the Bulldogger. The two things I was famous for before I put on a mask. I'd like to be famous for them once more.");
        await api.say('clint', "The trouble is Lacey. She's got a right to hear it from me. But I don't know how. Either I tell her first, quiet, or she finds out in the ring. Neither's good. Both's honest.");
        const c = await api.choose('Clint puts a hand on the Dust Devil mask, not picking it up.', [
          { label: 'Let it happen in the ring. In his own hands. On his terms.', value: 'ring' },
          { label: 'Tell her first. Privately. Before anybody else.', value: 'first' },
        ]);
        api.flag('clint_unmask_choice', c);
        if (c === 'ring') {
          api.hearts('clint', 30);
          api.flag('clint_unmask_ring', true);
          await api.narrate("He nods slowly, the way a man nods at a verdict he's been dreading and wanting.");
          await api.say('clint', "In the ring. In front of everybody. And she'll know I wasn't hiding. I was *protecting.* ...I hope she sees the difference.");
        } else {
          api.hearts('clint', 30);
          api.flag('clint_unmask_first', true);
          await api.narrate("He lets out a breath he's been holding since the retirement party.");
          await api.say('clint', "First. Quiet. At the kitchen table, with the pancakes. ...I've rehearsed it eighty times. I'll still say it wrong.");
        }
        await api.say('clint', "Will you be my opponent? You don't have to answer today. I'd understand if you didn't. But there isn't anybody I'd rather have across the ring.");
        const a = await api.choose(null, [
          { label: '"Yes. I\'d be honored."', value: 'yes' },
          { label: '"Yes. And I\'ll make it look like a million bucks."', value: 'million' },
        ]);
        if (a === 'yes') {
          api.hearts('clint', 15);
          await api.narrate("He takes your hand in both of his, an old rodeo handshake, firm enough to feel the bones.");
        } else {
          api.hearts('clint', 15);
          await api.sayMood('clint', 'happy', "A million bucks. Ha. That's the best thing anyone's said to me in a decade. Don't make it two. My knees can't spend that much.");
        }
        await api.narrate("He picks up his hat, puts it on, and taps the brim, twice.");
        await api.say('clint', "Obliged, partner. For the last time and the next.");
      },
    },
    // ---------------------------------------------------------------- 10: Two nails
    {
      id: 'clint-10', hearts: 10, map: 'fair', when: { flag: 'clint_unmask_choice' }, title: 'The Nail',
      script: async (api) => {
        await api.narrate("The locker room, quiet, after the last match. The grandstand's emptied. Somewhere upstairs, a custodian is whistling the harmonica part of 'Dust and Denim.'");
        await api.narrate("Clint's sitting on the bench, in his shirtsleeves, not his duster. His straw hat is on the bench next to him. The Dust Devil's mask is in his hand.");
        await api.say('clint', "It's done. All of it. The last run. Twenty years, and one very good bad man.");
        await api.narrate("He stands, stiffly. There's a nail in the wall above the benches, the kind you'd hang a coat on. He looks at it for a long time.");
        await api.narrate("He hangs the mask on it. Gently, like a thing that might wake up. Beside it, on the next nail, he hangs his battered straw hat.");
        await api.say('clint', "I'm not throwing it out. I couldn't. And I can't wear it. So it'll hang. Where folks who matter can find it.");
        if (api.hasFlag('clint_unmask_ring')) {
          await api.say('clint', "She walked out on me. In the ring. I knew she might. She hasn't been by the fairgrounds since. I want her to find all of me here when she's ready. On two nails.");
        } else {
          await api.say('clint', "I told her at the kitchen table. The pancakes got cold. She hasn't said a word to me since but 'pass the syrup.' I want her to find all of me here when she's ready. On two nails.");
        }
        await api.sayMood('clint', 'sad', "Will you leave it there? Don't move it. Don't touch it. Until she's ready to know all of it. However long that takes.");
        const c = await api.choose(null, [
          { label: '"It stays right there. I\'ll look after it."', value: 'stay' },
          { label: '"I\'ll be here when she\'s ready. Both of you."', value: 'here' },
          { label: '"Don\'t wait too long, Clint."', value: 'long' },
        ]);
        if (c === 'stay') {
          api.hearts('clint', 30);
          await api.narrate("He nods. Once. Twice. He puts a hand over his mouth, and takes it away.");
          await api.say('clint', "Thank you, partner. That's all a man needs. A place to leave a thing, and somebody who won't move it.");
        } else if (c === 'here') {
          api.hearts('clint', 30);
          await api.sayMood('clint', 'surprised', "Both of us. ...I never thought of it like that. Two fellas, one kid. And a person in the middle.");
          await api.narrate("He turns away, quickly. His hat is on the nail, so he taps his thigh twice, instead.");
        } else {
          api.hearts('clint', 15);
          await api.say('clint', "I know. Every day I keep it from her is a day I've picked wrong. I just... can't find the right one.");
        }
        api.flag('clint_last_match', true);
        await api.narrate("Before he turns off the light, he sets Wanda's honey spoon on the bench by the door. Somebody will take it to the fairgrounds. Nobody will ask why it was in a locker room.");
        await api.say('clint', "You're the first person who's ever seen both of me. I figured it'd feel like losing something. It doesn't. It feels like putting down a sack of feed.");
      },
    },
  ],
} satisfies DialogueSet;
