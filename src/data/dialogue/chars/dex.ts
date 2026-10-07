import type { DialogueSet } from '../types';

/**
 * Dex "Dropkick" Delgado, 24. Full Nelson Fuel attendant, neon-green high-flyer,
 * secretly terrified of being small-town forever and of not being enough
 * anywhere else. Half of every check goes home to his nurse mom Marisol and his
 * little sister Luz (8, Pip's best friend). Romanceable.
 *
 * His city arc is timed by the story team. This file reads three flags it does
 * not own: 'dex_in_city' (away at MaxxMedia), 'dex_returned' (home again) and
 * 'dex_offer' (set here at 8 hearts). 'dex_advice' = 'go' | 'gimmick' | 'home'
 * records how the player told him to go, never whether.
 * Romance: 'dex_romance_onscreen' / 'dex_romance_secret' (12), 'dex_proposal_ready' (14).
 */
export default {
  npc: 'dex',
  intro: [
    "(A wiry kid in a gas station shirt is cartwheeling across the ring apron. He lands, bows, and nearly falls off.)",
    "Hey! You're the new one? Cool cool cool. Dex. Dex Delgado. Dropkick, if Gus is announcing. Dex if he's not.",
    "Don't worry. I'll make you look good in the ring. That's literally the job.",
    "Also if you're hungry, Rosa will feed you and then threaten you. It's a package deal. Come on!",
  ],
  introPublic: [
    "(A kid in a gas station shirt leaps clean over pump three, lands in a puddle, and spreads his arms.) Stuck it.",
    "Fill 'er up? Nah. I fill ARENAS. ...Okay, the VFW. It counts. Dex Delgado. Remember the name. Gus will say it a lot.",
    "Anyway. Regular or premium? (He grins.) Premium Unleaded. That's also my move. Look it up.",
  ],
  lines: [
    // ---------------------------------------------------------------- Public: cocky underdog
    { text: "Fill 'er up? Nah. I fill ARENAS. ...Okay, the VFW. It counts.", when: { hearts: [0, 2], place: ['public'], map: ['gasstation'] }, weight: 2 },
    { text: "Pump four's out. Not my fault. I'm a *flyer*, not a fixer.", when: { place: ['public'], map: ['gasstation'] } },
    { text: "(Dex is filming a flip over the air hose.) Don't move. Don't move... did you see it? No? I'm doing it again.", when: { place: ['public'], map: ['gasstation'] } },
    { text: "Hey, champ! Don't touch pump three. It's haunted. ...It's wet. It's wet and it hums.", when: { place: ['public'], alignment: ['face'] } },
    { text: "Cash only for cheaters. And no, I don't want your sunglasses. Nobody wants your sunglasses.", when: { place: ['public'], alignment: ['heel'], flag: 'debuted' }, mood: 'angry' },
    { text: "Tonight: Premium Unleaded, off the top, and Gus says my name for fourteen seconds. FOURTEEN. ...Okay. Nine. It's still a lot.", when: { showDay: true, place: ['public', 'show'] }, weight: 2 },
    { text: "(Dex is on a bench at the bus stop with his chin on his fist, watching the road.) Just checking the bus. For... reasons. Free country.", when: { place: ['public'], map: ['town'], time: [840, 900] } },
    { text: "Rosa fed me. Then she threatened me. Then she fed me again. It's like a very delicious hostage situation.", when: { place: ['public'], map: ['diner'] } },
    { text: "Gus hypes me like a racehorse. 'Dex Delgado, by Tailwind out of Gas Station.' ...He's not wrong.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "My sister Luz is eight. She thinks I can fly. I let her. ...I mean I can. A little.", when: { place: ['public'], hearts: [3, 10] }, mood: 'happy' },
    { text: "Pip beat me for the Pip-weight title again. That's six. He says it's forty. He has a chart. The chart is very convincing.", when: { place: ['public'], weekday: [6] } },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "Rain's the worst. Slippery pumps, slippery landings, slippery everything. I love it. Please never tell Hazel I said that.", when: { weather: ['rain'] } },
    { text: "Storm. The power's gonna blink. Pump four's gonna cry. Pump four always cries.", when: { weather: ['storm'] } },
    { text: "Snow! Best crash pad on Earth. The awning has a me-shaped dent in it. That was already there. Coincidence.", when: { weather: ['snow'] } },
    { text: "Wind like this and I leap, I land in Ohio. I'm not ready for Ohio.", when: { weather: ['wind'] } },
    { text: "Thaw Brawl's coming. I've got a plan. It involves a vault, two ropes, and Hank's blessing. Hank has not blessed it.", when: { season: [0] }, weight: 2 },
    { text: "Fairgrounds Fury. Hay bales are the best crash pads ever invented. Fight me. Or fall on me, either way.", when: { season: [1] } },
    { text: "Harvest Havoc. Corn maze. I'm gonna get lost on purpose and arrive via the sky.", when: { season: [2] } },
    { text: "Winter at the gas station. Freezing. I'm in cargo shorts. It's a lifestyle choice and also my only pants.", when: { season: [3] } },

    // ---------------------------------------------------------------- Insider: the real Dex
    { text: "Okay okay okay. I'm calm. Look at my hands. They're moving. They do that. Ignore the hands.", when: { place: ['insider'], showDay: true }, mood: 'surprised' },
    { text: "Hazel yells about my landings. Hazel's right. I'm going to hate how right Hazel is until I die.", when: { place: ['insider'] } },
    { text: "My channel has twelve views. Three are my mom. Two are Luz. One's me, checking. Six strangers. SIX. Birdie, that's a *crowd*.", when: { place: ['insider'], hearts: [0, 5] } },
    { text: "You cut clips for a living? Nine seconds? That's like the ultimate crowd work. Okay, you gotta teach me everything.", when: { place: ['insider'], hearts: [0, 3] }, weight: 2 },
    { text: "My mom pulls double shifts at the county hospital. Best nurse they've got. She says everything's 'fine.' Fine is a trap word.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "A guy in a lanyard came into Full Nelson yesterday. Bought a coffee. Watched me flip off the air hose. Left a *huge* tip. I'm not saying anything. I'm just saying it.", when: { place: ['insider'], hearts: [3, 7], notFlag: 'dex_offer' }, mood: 'surprised', weight: 2 },
    { text: ["If I go and I'm nothing there, then I was nothing here too, right?", "...Don't answer. Somebody's at pump two. Somebody's always at pump two."], when: { place: ['insider'], hearts: [6, 10], notFlag: 'dex_returned' }, mood: 'sad', weight: 2 },
    { text: "Birdie says some kids go and some kids stay and the good ones come back. I wanna be a good one. I just don't know which kind to start as.", when: { place: ['insider'], hearts: [3, 10], notFlag: 'dex_returned' } },
    { text: "You're new, so: land on your feet. If you can't, land on somebody soft. That's usually Earl. He's like a very large pillow with feelings.", when: { place: ['insider'], rank: ['rookie', 'opener'] } },
    { text: "Main event! Don't forget us small guys up there. I mean I'll fly up there too. But don't forget.", when: { place: ['insider'], rank: ['main', 'assistant', 'pencil', 'owner'] }, mood: 'happy' },
    { text: "The envelope's in my drawer. I haven't opened it again. I know what it says. It's everything I ever wanted. I put the stapler on it so it can't blow away. Or so I can't see it.", when: { flag: 'dex_offer', notFlag: 'dex_returned', place: ['insider'] }, mood: 'sad', weight: 3 },
    { text: "Early practice. Everything hurts. I'm doing it anyway. Hazel says that's not a philosophy, it's a symptom.", when: { place: ['insider'], time: [360, 540] } },
    { text: ["You and {opponent}! I watched from the curtain. I did the spots with you. With my shoulders.", "Mo saw me. Mo sees everything. Mo said nothing, which is worse."], when: { place: ['insider'], lastMatch: { maxDaysAgo: 3 } }, mood: 'happy' },
    { text: ["You beat me. Clean. I've rewatched it in my head nine times. On the eighth one I won. Then I woke up.", "Rematch? Rematch. Don't answer. Rematch."], when: { place: ['insider'], lastMatch: { won: true, opponent: ['dex'], maxDaysAgo: 5 } } },
    { text: "Did I hurt you? On the springboard? I came down and I felt your shoulder go and I thought, oh no. You were fine. You were fine, right?", when: { place: ['insider'], lastMatch: { won: false, opponent: ['dex'], maxDaysAgo: 5 } }, mood: 'sad' },

    // ---------------------------------------------------------------- The city
    { text: ["They call me DEXTREME. There's a guy whose whole job is my sunglasses.", "I miss bingo. Tell Luz I'm still flying."], when: { flag: 'dex_in_city' }, mood: 'sad', weight: 3 },
    { text: "Home. It smells like gas and it's perfect. (He's holding a slushie he hasn't touched. He just wanted to hold one.)", when: { flag: 'dex_returned' }, mood: 'happy', weight: 3 },
    { text: "Turns out I'm not allergic to the city. I'm allergic to being an energy drink. Big difference. Nobody tells you the difference.", when: { flag: 'dex_returned', place: ['insider'] } },
    { text: "DEXTREME is retired. I still have the sunglasses. Luz wears them to bed. She says they make the dark cooler.", when: { flag: 'dex_returned' }, mood: 'happy' },
    { text: "I came back and they'd renumbered the pumps. Pump four is pump two now. I'm handling it. I'm handling it so well.", when: { flag: 'dex_returned', hearts: [8, 14], place: ['insider'] } },

    // ---------------------------------------------------------------- Dating
    { text: "(Dex pretends he's not nervous, which is also his character, so nobody can tell. Except you.)", when: { place: ['public'], dating: true }, mood: 'love', weight: 2 },
    { text: "I wrote your initials on my wrist tape. Don't look. ...Look. It's pretty good, right?", when: { place: ['insider'], flag: 'dex_romance_secret' }, mood: 'love', weight: 2 },
    { text: "Gus keeps announcing me as 'the boy who flew home for love.' I should be mortified. I've never been so proud of a sentence.", when: { flag: 'dex_romance_onscreen' }, mood: 'happy', weight: 2 },
    { text: "Every time I stick a landing, I look for you first. Not the crowd. You. Don't make it a thing. It's already a thing.", when: { place: ['insider'], dating: true }, mood: 'love' },

    // ---------------------------------------------------------------- Family
    { text: "You know where I started. That's rare. Most people only know where I'm going.", when: { hearts: [9, 14], place: ['insider'] }, mood: 'love' },
  ],
  gifts: {
    loves: ['trading-card', 'comic', 'lemonade'],
    likes: ['gas-hotdog', 'toy-wrestler', 'chili-dog', 'corn-dog'],
    dislikes: ['teacup', 'paperback', 'fiber'],
  },
  giftReplies: {
    love: [
      "No way. No WAY. Okay. Okay okay okay. I'm going to sit on the curb for a second.",
      "I mentioned this ONE time! A month ago! This is going on my wall. Next to the thing that's already on my wall.",
      "Dude. DUDE. Okay, give me a sec. I'm going to do a flip. It's the only way I can process this.",
    ],
    like: [
      "Sweet! Thanks! This is gonna be a great day. Wait. Is it? ...Yeah. It is.",
      "Hey, nice. You're like a *real* friend. With gifts and everything.",
      "Cool cool cool. I'll put it with my other stuff. My other stuff is mostly in my car.",
    ],
    neutral: [
      "Oh! Cool. Thanks. I'll find a place for it. My car's very full.",
      "Huh! Interesting. I'll flip it later. ...I mean flip over it. Never mind.",
    ],
    dislike: [
      "Uh... thanks. I think? Is this a *settling* thing? Am I settling?",
      "Nope. Hard pass. No offense. Gonna put this in the Lost and Found behind the slushie machine.",
      "(He holds it between two fingers like something that fell out of a dumpster.) ...Gee. Thanks.",
    ],
    birthday: [
      "My birthday? Mom works, Luz draws me a card, and now a {item}. I'm doing a flip. I'm going to land it. Watch me land it.",
      "I'm usually wrestling on my birthday, so nobody gets me anything but a bump. A {item}! A real present! With no bump!",
    ],
    byItem: {
      'trading-card': ["A pack! Okay. Okay. If I'm in here I'm going to scream. ...I'm not in here.", "I'm going to be in one someday. Luz says I already am. She drew one. It's me, flying, and I'm the size of a house."],
      comic: "Wrestle-Bot vs. The Moon! Issue ONE. The moon doesn't stand a chance. Neither do I. I'm reading this behind the counter right now.",
      lemonade: "Fair lemonade. The shaken kind. I'm going to drink it slow. I'm not going to drink it slow. It's gone. Thank you.",
      'gas-hotdog': "From my own roller! Day three, by the color. I know these dogs. I know them personally. I'm eating it anyway.",
      'toy-wrestler': "He's got a bite mark on the boot! He's been through something. He's a veteran. He goes on the dashboard.",
      'chili-dog': "Chili dog! I'm gonna eat this over the trash can like a professional athlete.",
      'corn-dog': "Corn dog! Hay bales and corn dogs. That's my whole summer, on a stick.",
    },
    later: [
      "The {lastGift}'s on my dashboard. Customers ask. I tell them it's from a fan. ...You're kind of a fan. Right?",
      "Luz found the {lastGift} and asked if she could have it. I said no. I've never said no to Luz. That's how much.",
    ],
  },
  again: [
    "Still me! Pump four's still out. Some things don't change in an hour.",
    "(Dex does a little two-finger salute from behind the register. Busy-but-happy.)",
    "Okay, round two! ...I don't have a round two. I used it all on round one.",
  ],
  idle: [
    "(Dex is practicing a landing on a squashed cardboard box. He sticks it. He looks around to see if anyone saw.)",
    "Can't talk, I'm being a professional. ...For like two more minutes.",
  ],
  birthday: { season: 1, day: 24 },
  events: [
    // ---------------------------------------------------------------- 2: Stuck it
    {
      id: 'dex-2', hearts: 2, map: 'gasstation', title: 'Stuck It',
      script: async (api) => {
        await api.narrate("Full Nelson Fuel, mid-morning. Dex is wiping the same pump for the fourth time, watching you walk up like a man with a secret.");
        await api.say('dex', "Hey! Don't pump yet. Hold on. Watch this.");
        await api.narrate("He takes four steps back, takes a breath, and runs at pump three. He plants a hand on the roof, flips over the whole thing in a clean arc, and lands...");
        await api.narrate("...in the oil puddle. Both feet go out. He slides eight feet on his back and comes to a stop, arms spread, grinning at the sky.");
        await api.sayMood('dex', 'happy', "Stuck it.");
        await api.narrate("Down the street, on the bench outside the post office, a small girl in a Pip-weight championship hat applauds slowly. It's Luz. She's also eating a slushie.");
        const c = await api.choose('He lies there, covered in oil, absolutely waiting for your verdict.', [
          { label: 'Offer to film a clean retake from a better angle', value: 'film' },
          { label: 'Clap and hand him a shop rag', value: 'clap' },
          { label: '"That was a faceplant."', value: 'face' },
        ]);
        if (c === 'film') {
          api.hearts('dex', 30);
          await api.narrate("You take his cracked phone, set up on the far side of the pump, and call action. The second one's perfect. He lands it clean, in a spot with no oil, and hits a kip-up on the way to his feet.");
          await api.sayMood('dex', 'surprised', "Nobody ever films it from the *side*. That's... that's where the angle is. Where did you learn that?");
          await api.say('dex', "Here. Take the kip-up. It's yours. I got more. I've got a *lot* more.");
          api.learnCard('kipup');
        } else if (c === 'clap') {
          api.hearts('dex', 15);
          await api.narrate("You clap. He accepts the rag like a title belt, wipes his hands, and tucks it in his back pocket for the rest of the day.");
          await api.say('dex', "Stuck. It. ...I'm going to need to wash this shirt. Don't tell my boss.");
        } else {
          api.hearts('dex', -10);
          await api.sayMood('dex', 'angry', "It was a *landing*. A... slidey one.");
          await api.narrate("He gets up, a little stiff, and goes to hose off the puddle. He doesn't flip over anything else for the rest of the morning. Luz gives you a very hard look from the bench.");
        }
      },
    },
    // ---------------------------------------------------------------- 4: Twelve views
    {
      id: 'dex-4', hearts: 4, map: 'sportatorium', when: { place: ['insider'] }, title: 'Twelve Views',
      script: async (api) => {
        await api.narrate("After practice, Dex corners you by the ropes with his phone already out, screen cracked in a lightning bolt across the glass.");
        await api.say('dex', "Back booth. Now. I need somebody who knows this stuff. And I know you know it.");
        await api.fade();
        await api.narrate("The Hot Tag's back booth. Dex props the phone against the ketchup and hits play. A flip. A backflip off a wall. A cartwheel into a sprinkler. Quick cuts, thumbs-up, thumbs-down.");
        await api.say('dex', "Twelve views. Three of them are my mom. She watches it twice so it looks like six.");
        await api.say('dex', "You cut matches at MaxxMedia, right? Nine-second clips. Teach me the algorithm. I wanna be *seen*.");
        await api.narrate("He leans forward. Behind the bravado, he really, desperately wants to know.");
        const c = await api.choose('You think about nine-second clips, and about what they cost.', [
          { label: 'Teach him how to cut a *story* (setup, struggle, landing)', value: 'story' },
          { label: 'Teach him how the algorithm works (hook in two seconds, loop the ending)', value: 'algo' },
          { label: '"Twelve views? Yikes."', value: 'yikes' },
        ]);
        if (c === 'story') {
          api.hearts('dex', 30);
          await api.narrate("You walk him through it on a napkin. A flip alone is a trick. A flip after a fall is a story. The crowd doesn't clap for the landing. They clap for the *getting back up*.");
          await api.sayMood('dex', 'surprised', "Wait. So the fall is the good part?");
          await api.say('dex', "Dude. That's the best thing anyone's told me about my own life. I'm going to need a bigger napkin.");
        } else if (c === 'algo') {
          api.hearts('dex', 15);
          await api.narrate("You teach him the hook, the loop, the three-word caption. He writes it all down in the notes app, grinning.");
          await api.say('dex', "Hook, loop, caption. That's... a little sad, actually? It works, though. I'll use it. I'll also feel weird.");
        } else {
          api.hearts('dex', -10);
          await api.narrate("He laughs a half beat late. Then he turns the phone face-down, like he's hiding it.");
          await api.say('dex', "Yeah. Ha. Yikes. It's fine. It's for fun. It's fine.");
          await api.narrate("He doesn't mention the channel again for a week.");
        }
        await api.narrate("Behind the counter, June refills the ketchup, gives you a thumbs-up, and mouths: 'He's been practicing that pitch for a month.'");
      },
    },
    // ---------------------------------------------------------------- 6: The ice
    {
      id: 'dex-6', hearts: 6, map: 'sportatorium', when: { place: ['insider'] }, title: 'Half the Check',
      script: async (api) => {
        await api.narrate("Late practice. Dex goes for a missile dropkick off the second rope, and the sound he makes landing is a flat, ugly thud, like a dropped sack of flour.");
        await api.narrate("He sits up, thumbs up. Grins. Then tries to breathe in, and the grin doesn't make it.");
        await api.fade();
        await api.narrate("The locker room. Dex sits on the bench with a bag of ice pressed to his ribs, shirt off, staring at his shoes. His faux-hawk is flat for the first time all week.");
        await api.say('dex', "Hazel can't know. She'll yell. She'll be right. I'll be mad about it. It's a whole thing.");
        await api.say('dex', "My mom doesn't know how much it hurts. Mostly. She's a nurse, so she'd know in one second, so I make sure she doesn't see it. Ever.");
        await api.say('dex', "And I send half my check home. Every week. She doesn't know I know she knows about that, either. We're both just being very good at not saying things.");
        await api.sayMood('dex', 'sad', "If I take time off to heal, there's no check. If there's no check, there's no half. So I land wrong, and I get up. That's the math.");
        const c = await api.choose(null, [
          { label: '"Let Doc take a look. Right now."', value: 'doc' },
          { label: '"Your mom\'s a nurse. She\'d understand."', value: 'mom' },
          { label: '"Walk it off. Wrestlers don\'t quit."', value: 'tough' },
        ]);
        if (c === 'doc') {
          api.hearts('dex', 30);
          await api.narrate("You make the call. Doc arrives with a black bag and a grim face, takes one look, and says 'bruised, not cracked' like a man who's been holding his breath for ten minutes.");
          await api.say('dex', "...Thanks. For not letting me be the tough guy. I'm really bad at telling when I'm supposed to quit.");
        } else if (c === 'mom') {
          api.hearts('dex', 15);
          await api.narrate("He nods slowly, staring at the ice.");
          await api.say('dex', "She would. That's the scary part. She'd understand, and then she'd cut her shifts to take care of me, and I'd have made it worse. ...I'll think about it.");
        } else {
          api.hearts('dex', -10);
          await api.say('dex', "Yeah. Yeah, totally. Wrestlers don't quit.");
          await api.narrate("His voice is carefully, politely flat. He puts his shirt back on and gets up too fast. He walks out like nothing hurts, and you can hear him not wincing all the way down the hall.");
        }
        await api.narrate("Before you leave, he catches your sleeve.");
        await api.say('dex', "Hey. Thanks for... being a person who asked. Most people just clap.");
      },
    },
    // ---------------------------------------------------------------- 8: The envelope
    {
      id: 'dex-8', hearts: 8, map: 'gasstation', title: 'The Envelope',
      script: async (api) => {
        await api.narrate("Mid-morning at Full Nelson. The mail carrier walks in, sets down an envelope with both hands, and steps back as if it might go off.");
        await api.narrate("Mo, in her blues, doesn't make a joke. 'Signature required, Dex. It came priority. It's heavy.'");
        await api.narrate("He signs. His signature wobbles. The return address is embossed in gold: MAXXMEDIA TALENT DEVELOPMENT. Under it, handwritten: *Royce Penn.*");
        await api.say('dex', "Don't talk. Let me... just.");
        await api.narrate("He opens it standing at the register. Inside is a contract three pages long, a plane ticket, and a card with a glossy photo of his face. Beneath the photo, in huge letters: DEXTREME.");
        await api.sayMood('dex', 'surprised', "They already made the logo. They made a *logo*. For a guy who was cleaning a windshield an hour ago.");
        await api.say('dex', "I wanted this. Since I was twelve. I wanted this so bad I used to sleep with my sneakers on. And now it's real, and I feel like I'm gonna throw up.");
        await api.say('dex', "What would you do? Really. You were there. You know what the city does to people.");
        const c = await api.choose('Dex waits. For once, he is completely still.', [
          { label: '"Go. This is your shot. We\'ll be here."', value: 'go' },
          { label: '"Go, but don\'t let them rename you."', value: 'gimmick' },
          { label: '"Go. And know the door never closes."', value: 'home' },
        ]);
        api.flag('dex_offer', true);
        api.flag('dex_advice', c);
        if (c === 'go') {
          api.hearts('dex', 15);
          await api.say('dex', "Yeah. Yeah, okay. That's the real answer, right? That's what a friend says.");
          await api.narrate("He nods, folds the contract, and holds it against his chest. His grin is wide and a little scared.");
        } else if (c === 'gimmick') {
          api.hearts('dex', 30);
          await api.sayMood('dex', 'surprised', "...Oh. Oh no. They're totally gonna try to rename me. They already did.");
          await api.say('dex', "Okay. I'll keep my name. In my head, in my gear, wherever. They can sponsor the sunglasses. They can't sponsor me. Thank you for telling me what to watch for.");
        } else {
          api.hearts('dex', 30);
          await api.narrate("He doesn't say anything for a while. He looks around the station: the slushie machine, the faded Lotto sign, the bench where Luz sits after school.");
          await api.sayMood('dex', 'love', "That's the one thing I was too scared to ask somebody to say. Thank you. I'm going to carry that one to the airport.");
        }
        await api.narrate("He tucks the envelope into the drawer under the register, next to the spare keys and a half-eaten bag of sour gummies. He closes the drawer very gently.");
        await api.say('dex', "Luz can't find out yet. She's going to make a sign.");
      },
    },
    // ---------------------------------------------------------------- 10: The first boots
    {
      id: 'dex-10', hearts: 10, map: 'sportatorium', when: { place: ['insider'] }, title: 'Where I Started',
      script: async (api) => {
        await api.narrate("The Sportatorium, afternoon, empty. Dex sits on the apron with a shoebox in his lap. He's been sitting there a while.");
        if (api.hasFlag('dex_returned')) {
          await api.narrate("He's back. The sunglasses are in his shirt pocket instead of on his face. He looks a little older. A little steadier. Still scuffed.");
          await api.say('dex', "I did the corporate thing. Cameras, schedules, a guy whose entire job was my sunglasses. I got better. I got a lot better, actually. Hazel says my landings are 'acceptable.' She cried.");
        } else {
          await api.narrate("The MaxxMedia envelope is still in his drawer at the gas station, unsigned or maybe signed. Nobody's sure which. He's been somewhere between a yes and a no for weeks.");
          await api.say('dex', "I don't know what I'm doing. Whether I go, whether I stay. But I wanted you to have this before either one happens.");
        }
        await api.say('dex', "Open it.");
        await api.narrate("Inside the shoebox is a pair of battered high-tops. One green lace, one orange. The toes have been worn clean through, the canvas thin as paper.");
        await api.say('dex', "My first pair. I got them at the thrift store when I was fifteen. Six bucks. Every takeoff I ever made, till I could afford real boots, I made in those.");
        await api.say('dex', "The toes went first. Then the heels. I kept wearing them. I don't know why. I think I was scared that if I stopped, the flying would stop.");
        await api.sayMood('dex', 'happy', "It didn't. Turns out the flying is in the guy, not the shoes. Weird, right? Everybody tells you that, and nobody tells you it's *true*.");
        const c = await api.choose('He holds the box out.', [
          { label: 'Take the boots. Hold them in both hands.', value: 'take' },
          { label: 'Give him your own first wrist tape in exchange', value: 'trade' },
          { label: '"These are too important. You should keep them."', value: 'keep' },
        ]);
        if (c === 'take') {
          api.hearts('dex', 30);
          await api.narrate("You take the box. It weighs almost nothing, and you feel the weight of it anyway.");
          await api.say('dex', "Keep them. I want somebody to know where I started.");
        } else if (c === 'trade') {
          api.hearts('dex', 30);
          await api.narrate("You dig out the wrist tape from your first night in the ring, dirty, crooked, taped over itself six times. His eyes go wide.");
          await api.say('dex', "A *start* for a start. That's... okay, that's the best trade anyone's ever made. I'm putting this in my gear bag. It's going wherever I go.");
        } else {
          api.hearts('dex', 15);
          await api.say('dex', "No, I... that's not how it works. This isn't a loan. ...Okay. Hold them for me, then. Not the same as keeping, but I'll take it.");
        }
        await api.narrate("He laces his current pair a little tighter, hops to his feet on the apron, and, for once, steps down off it like a person. Stairs. He takes the stairs.");
        await api.say('dex', "I'm gonna go be great. Or not. Either way, I know where the front door is.");
      },
    },
    // ---------------------------------------------------------------- 12: The roof
    {
      id: 'dex-12', hearts: 12, map: 'gasstation', when: { dating: true }, title: 'The Roof',
      script: async (api) => {
        await api.narrate("Closing time at Full Nelson Fuel. The last customer leaves. Dex flips the sign, locks the register, then looks at you with an expression of enormous, theatrical casualness.");
        await api.say('dex', "So. I have this thing on the roof. A place I go. You can come. If you want. It's totally optional.");
        await api.fade();
        await api.narrate("A ladder behind the dumpster. A flat tar roof, two folding lawn chairs, and a cooler. Across town, the water tower shaped like a turnbuckle blinks its red light, slow and steady.");
        await api.say('dex', "Every four seconds. I've counted. When I can't sleep, I come up here and count. It's like a metronome for being scared.");
        await api.say('dex', "I got us slushies. This one's grape, extra ice. This one's also grape. I didn't want to guess, so I got two grapes. It's a whole strategy.");
        await api.narrate("He's sitting very upright. His knee is bouncing. He is doing an impressive impression of a guy who isn't nervous, which is his character, so nobody could tell. Except you.");
        const c = await api.choose(null, [
          { label: 'Tell him he can stop doing the bit. It\'s just you.', value: 'bit' },
          { label: 'Count the blinks with him', value: 'count' },
          { label: 'Steal his slushie', value: 'steal' },
        ]);
        if (c === 'bit') {
          api.hearts('dex', 30);
          await api.sayMood('dex', 'surprised', "...Is it that obvious? Okay. Okay. (He slumps into the chair like a puppet with the strings cut.) Oh man. That's so much better.");
        } else if (c === 'count') {
          api.hearts('dex', 30);
          await api.narrate("You count. One, two, three, four. Blink. One, two, three, four. Blink. By the seventh he's breathing in time with the light.");
          await api.say('dex', "Nobody's ever counted with me. I always thought you had to do this alone.");
        } else {
          api.hearts('dex', 15);
          await api.sayMood('dex', 'surprised', "Hey! That's the grape with *extra* ice!");
          await api.narrate("He tries to look outraged, fails, and laughs so hard he nearly falls out of his chair.");
        }
        await api.fade();
        await api.say('dex', "Okay, big question. Birdie asked me. She asks everybody. Do we tell the town? On-screen it's 'Dex Flies Home for Love.' Gus would lose his mind. Secret, and I write your initials on my wrist tape every show.");
        const s = await api.choose('How should the romance live?', [
          { label: 'On-screen: "Dex Flies Home for Love"', value: 'on' },
          { label: 'Secret: just initials on tape', value: 'secret' },
        ]);
        if (s === 'on') {
          api.flag('dex_romance_onscreen', true);
          await api.sayMood('dex', 'happy', "Oh, Gus is going to say it for a *minute*. I'm going to love it. I'm going to hate how much I love it.");
        } else {
          api.flag('dex_romance_secret', true);
          await api.sayMood('dex', 'love', "Initials. Wrist tape. Under the sleeve. Nobody'll know but me. Every show. I'm gonna look at them mid-air.");
        }
      },
    },
    // ---------------------------------------------------------------- 14: The top turnbuckle
    {
      id: 'dex-14', hearts: 14, map: 'sportatorium', when: { dating: true, place: ['insider'] }, title: 'Top Turnbuckle',
      script: async (api) => {
        await api.narrate("The Sportatorium, after hours. Every light off except the one over the ring. Dex stands in the middle in his street clothes, hands in his pockets, bouncing on the balls of his feet.");
        await api.say('dex', "Don't say anything. I practiced. I practiced in the walk-in at the gas station for a week. I'm gonna say it badly anyway.");
        await api.narrate("He climbs the ropes, then the corner post, until he's perched on the top turnbuckle. It's only six feet up, which on an empty night feels like forty. He holds out a hand to you.");
        await api.say('dex', "Come up. It's okay. I've got you. It's the one thing in the world I've never fallen off with somebody else on it.");
        await api.narrate("You climb. From up here, the whole dark building is spread out below: two thousand empty seats, the banners, the red emergency lights, the marquee glowing through the high window.");
        await api.say('dex', "I used to think the point was to fly *out* of here. Get big, get seen, get gone. And then I did go, kind of, in my head, every single night.");
        await api.say('dex', "Turns out the point's to fly *to* something. I don't want to go anywhere that you're not at the end of.");
        await api.narrate("He's gripping the post with one hand and your fingers with the other. His palm is slick. His grin has completely failed to appear.");
        const c = await api.choose(null, [
          { label: 'Lean your shoulder against his', value: 'lean' },
          { label: '"You\'re doing great. Keep going."', value: 'go' },
        ]);
        if (c === 'lean') {
          api.hearts('dex', 30);
          await api.narrate("You lean your shoulder against his. He lets out a breath as if he'd been holding it since the roof.");
        } else {
          api.hearts('dex', 15);
          await api.sayMood('dex', 'happy', "That's the first time somebody said that to me while I was actually doing the hard part and not after.");
        }
        await api.say('dex', "I'm not gonna ask you. Not tonight. You should be the one who gets to. With the rope and everything. Hank's been braiding it. I've seen the rope. I've been looking at the rope for a week.");
        await api.say('dex', "I'll say yes before you finish. Just so you know. I'm not going to wait for the whole sentence. I'm going to jump.");
        await api.sayMood('dex', 'love', "And I'm gonna land it. For once in my whole life. I can feel it.");
        api.flag('dex_proposal_ready', true);
      },
    },
  ],
} satisfies DialogueSet;
