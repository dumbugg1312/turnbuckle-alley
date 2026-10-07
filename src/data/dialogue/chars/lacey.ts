import type { DialogueSet } from '../types';

/**
 * Lacey Ransom, 16. High school junior, bassist for The Folding Chairs,
 * 118-pound amateur wrestler for Coach Patty, and Cowboy Clint's daughter.
 * She hates the masked Dust Devil with her whole body and has no idea he's
 * her dad. A mark until her 10-heart event, when she becomes the player's
 * first trainee and learns the truth in the locker room. Never romanceable.
 *
 * Her 10-heart event waits on the flag 'clint_last_match' (set when Clint's
 * last match is done and trainees unlock).
 */
export default {
  npc: 'lacey',
  intro: [
    "Hey. You're the new wrestler, right? The city one. Everybody's talking about you like you're weather.",
    "Lacey Ransom. Yeah. THAT Ransom. Cowboy Clint's my dad. He's retired. Don't bring it up, he gets weird.",
    "Here's the deal. If you ever get in a ring with the Dust Devil, you hurt him. For my dad. Deal?",
    "...Cool. Deal. I gotta go feed a bear. That's not a metaphor. See you around, city.",
  ],
  lines: [
    // ---------------------------------------------------------------- anytime
    { text: "I wrestle one-eighteen for Coach Patty. Qualified for state as a sophomore. So yeah, I could probably take you. Probably.", mood: 'smug' },
    { text: ["My band's called The Folding Chairs. I play bass. We've had two shows.", "One was in a basement. The other one was also kind of a basement."] },
    { text: ["Ms. Pruitt wrote 'wrong in a fascinating new way' on my algebra quiz.", "What does that even MEAN. She's evil. Like, clinically."], mood: 'angry' },
    { text: ["The Dust Devil called my dad a 'washed-up cowboy' on the radio.", "I threw a shoe at the radio. It was my shoe. Worth it."], mood: 'angry' },
    { text: "I have a dartboard with the Dust Devil's face on it. My aim's excellent. Ask the Dust Devil. Well. Ask his face.", mood: 'smug' },
    { text: "Dad promised he'd quit after the concussion. And he did. Now he mows the infield and talks to a bear. It's a good life. He deserves it." },
    { text: "Dad's at a livestock auction again tonight. He never buys anything. I think he just likes the hats." },
    { text: "Wanda's my best friend. Don't laugh. She's a great listener and she has never once told me to smile more." },
    { text: ["Coach says pro wrestling's fake. I told her my dad's knees are real.", "She said 'that's a separate issue.' It is NOT a separate issue."], mood: 'angry' },
    { text: "Coach wants me wrestling in college. Dad wants me wrestling in college. Everybody does, except me. I want the Sportatorium." },
    { text: "I babysit Pip sometimes. I let him win at arm-wrestling. If you tell him, I'll deny it and then I'll pin you." },
    { text: "Know what I can't stand? Any sentence that starts with 'Girls don't.' I've pinned people for less. I've pinned people for 'girls usually.'", mood: 'angry' },
    { text: "Don't call me sweetheart. Last guy who did it at a meet got a cradle he'll be telling his grandkids about.", when: { hearts: [0, 2] }, mood: 'angry' },
    { text: "When's your first match? I'll bring a sign. If it's against the Dust Devil I'll bring two.", when: { notFlag: 'debuted' } },

    // ---------------------------------------------------------------- weekly rhythm
    { text: "Meet today. If I pin the girl from Pell's Crossing I'm getting a cherry slushie the size of my head.", when: { weekday: [1] } },
    { text: "Band practice tonight in the hardware store basement. Buck plays harmonica on one song. Then every song becomes that song.", when: { weekday: [4] } },
    { text: ["I call my mom on Sundays. She lives in the city with Gary. Gary's a dentist.", "He's fine. He's annoyingly fine."], when: { weekday: [6], time: [1020, 1320] } },
    { text: "Practice ran long. Coach made us do sprawls till Becca saw the light. Now I gotta go help Dad with Wanda's dinner. She eats before we do.", when: { weekday: [0, 2, 3, 4], time: [1020, 1260] } },

    // ---------------------------------------------------------------- show days
    { text: "New sign tonight. DUST DEVIL = DUST BUNNY. Pip helped with the letters. He did the B's backwards. It's a style now.", when: { showDay: true }, mood: 'smug' },
    { text: "If the Dust Devil comes out tonight, I'm not responsible for what I yell. Gus already warned me twice.", when: { showDay: true, place: ['show'] }, mood: 'angry' },
    { text: ["Did you hear his promo? He said Cowboy Clint 'couldn't rope a parked car.'", "My dad roped a BULL. In '93. There's a buckle."], when: { weekday: [3, 6] }, mood: 'angry' },
    { text: "{opponent} gave you a nasty bump. Ice it. And don't let anybody tell you to walk it off. Walking it off is how Dad got his knees.", when: { lastMatch: { won: false, maxDaysAgo: 3 }, hearts: [2, 14] } },
    { text: ["I was in the bleachers for you and {opponent}. I yelled so much Coach Patty moved seats.", "She moved back. She wanted to see the {finisher}. She'll deny that."], when: { lastMatch: { won: true, maxDaysAgo: 3 } }, mood: 'smug' },

    // ---------------------------------------------------------------- alignment
    { text: "You're one of the good ones. I can tell. You've got that face like you'd help somebody's dad up off the mat.", when: { alignment: ['face'] } },
    { text: "So you're a villain now. Cool. Cool cool cool. Just so you know, I have a dartboard and a LOT of free time.", when: { alignment: ['heel'], hearts: [0, 5] }, mood: 'angry' },
    { text: ["I don't get it. You're nice to Wanda. Wanda doesn't bow to just anybody.", "So why are you doing the bad guy stuff?"], when: { alignment: ['heel'], hearts: [3, 14] }, mood: 'sad' },
    { text: "You're a villain and you're my friend. I've decided I'm allowed one of those. ONE. The Dust Devil doesn't get to apply.", when: { alignment: ['heel'], hearts: [6, 14] } },
    { text: "Gus calls you a tweener. My dad was never a tweener. He was a hero all the way down. ...You're fine, though. You're hero-adjacent.", when: { alignment: ['tweener'] } },

    // ---------------------------------------------------------------- rank
    { text: "Main event now, huh? Dad was main event for like ten years. He says look at one person in the crowd and wrestle for them. Pick somebody.", when: { rank: ['main', 'assistant', 'pencil', 'owner'] } },
    { text: "Openers are the hardest match, Dad says. Cold crowd. You gotta light the fire. No pressure. Okay, some pressure.", when: { rank: ['rookie', 'opener'], flag: 'debuted' } },

    // ---------------------------------------------------------------- seasons and weather
    { text: "State qualifiers in three weeks. I've been sleeping in my headgear. Not on purpose. I keep forgetting it's on.", when: { season: [0] }, mood: 'happy' },
    { text: "Wanda woke up this morning, walked straight to the fence and bowed at me. Five months asleep and her manners are still better than Gary's.", when: { season: [0], time: [360, 720] }, mood: 'happy' },
    { text: "Spring rain means no outdoor runs, so Coach makes us run the bleachers. I can feel my soul in my calves.", when: { season: [0], weather: ['rain'] } },
    { text: "Summer I work the concession window at the fair. Free corn dogs. Ask for the one on the left. It's always better. Don't ask why.", when: { season: [1] } },
    { text: "Fall's when the band plays the VFW after bingo. Last time somebody yelled 'B-12' in the middle of our ballad. It honestly helped.", when: { season: [2] } },
    { text: "Wanda's in her den. I go sit outside it and tell her stuff. She snores. It's like therapy, but warmer.", when: { season: [3] } },
    { text: "Rain cancels practice, so I'm at the fairgrounds. Wanda hates rain hats. I wore one once. She didn't speak to me for a week.", when: { weather: ['rain'] } },

    // ---------------------------------------------------------------- hearts
    { text: "You're okay, city. For a wrestler. Dad says wrestlers are all a little crazy. He'd know. He was the craziest one.", when: { hearts: [3, 5] } },
    { text: ["Can I ask you something? Do you think a girl my size could make it? In the pros?", "...Don't answer. I just wanted to hear myself ask it out loud."], when: { hearts: [6, 8] } },
    { text: "Thanks for sitting with me. In the bleachers. I don't usually cry. I usually throw things. Crying's way less satisfying.", when: { flag: 'lacey_six', notFlag: 'lacey_trainee' } },
    { text: "When I go pro I'm wearing Dad's bandana and doing his Bulldogger off the top rope. A version he could never do. If he hears I said 'never' he'll do it at fifty-three out of spite.", when: { hearts: [9, 14], notFlag: 'lacey_trainee' }, mood: 'smug' },
    { text: "You're like the only grown-up who talks to me like I'm a person and not a problem. Just saying. Don't make it weird.", when: { hearts: [9, 14] }, mood: 'love' },
    { text: "Those drills you showed me? I used the single-leg at the meet Tuesday. Coach asked where I learned it. I said YouTube. You're welcome.", when: { flag: 'lacey_drills', notFlag: 'lacey_trainee' }, mood: 'smug' },

    // ---------------------------------------------------------------- the main story
    { text: ["Agnes showed me a picture of the Duchess crying, back in '83.", "I always thought she was the worst person ever. Now I don't know what I think."], when: { flag: 'truth_revealed', notFlag: 'reunion_done' } },
    { text: "The Velvet Hammers, man. Forty years and they still came back. I cried in the bleachers. Dad cried in the truck. We've agreed nobody cried.", when: { flag: 'reunion_done' } },

    // ---------------------------------------------------------------- through the curtain (after her 10-heart event)
    { text: ["He made fun of himself. For two whole years. So I wouldn't know.", "I'm still kind of mad. I'm also the proudest I've ever been."], when: { flag: 'lacey_trainee', place: ['insider'] } },
    { text: "Ms. Pruitt is the PROFESSOR. I've been booing my algebra teacher for two years. She gave me an A-minus anyway. Respect.", when: { flag: 'lacey_trainee', place: ['insider'] }, mood: 'surprised' },
    { text: "Dad and I have a signal now. He taps his mask twice. I tap my bandana twice. Nobody out there will ever know. Pip almost knows. Pip taps his hat twice now. Pip doesn't own a hat.", when: { flag: 'lacey_trainee', place: ['insider'] }, mood: 'love' },
    { text: "I still throw darts at the Dust Devil's face. Dad asked me not to stop. He says it's the best review he ever got.", when: { flag: 'lacey_trainee', place: ['insider'] }, mood: 'happy' },
  ],
  gifts: {
    loves: ['trading-card', 'vinyl', 'cassette'],
    likes: ['honey', 'lemonade', 'corn-dog', 'tape', 'protein-shake', 'merch-sign', 'comic'],
    dislikes: ['teacup', 'gas-hotdog', 'fiber'],
  },
  giftReplies: {
    love: [
      "No way. NO WAY. This is going in my wallet and never coming out.",
      "Okay, you get it. You actually get it. I'm gonna be weird about this for like a week.",
      "Shut up. This is perfect. I mean thanks. I mean shut up, it's perfect.",
    ],
    like: [
      "Nice. Thanks, city.",
      "Cool. Wanda's gonna be jealous. She's jealous of everything I own.",
      "Oh, sick. The band can use this. The band can use anything, honestly.",
    ],
    neutral: [
      "Huh. Okay. Thanks, I guess?",
      "I'll find a use for it. Pip will, anyway. Pip turns everything into a title.",
    ],
    dislike: [
      "Did somebody tell you girls like this stuff? Who told you that? I need a name.",
      "Pass. Hard pass. No offense. Some offense.",
      "...Yeah, I'm gonna give this to Jobber. He'll appreciate it. He's got no standards.",
    ],
    birthday: [
      "Dad forgot till noon. He made it up with pancakes shaped like Wanda. They looked like potatoes. You brought a {item}. You win. He's going to hear about it.",
      "Seventeen. One more year closer to the Sportatorium. And a {item}. Thanks, city. Seriously.",
    ],
    byItem: {
      'trading-card': "A pack! If there's a Cowboy Clint rookie in here I'm going to lose my mind. ...There isn't. There's a Bruiser. There's always a Bruiser.",
      vinyl: "A record. 1984. Somebody's entrance music. I'm going to learn the bass line by Friday and play it at the VFW and nobody will know why they're crying.",
      cassette: "PUMP UP JAMS 4 SAT. Some kid made this. Some kid like me. I'm gonna listen to it on the bus to Pell's Crossing.",
      honey: "Honey sticks? No, a whole jar. Wanda's gonna smell this on me from the parking lot.",
      lemonade: "Fair lemonade! The shaken kind. You have to drink it fast before the ice gives up.",
      'corn-dog': "The one on the left? ...You got the one on the left. You listened.",
      tape: "Tape. For my fingers. Bass strings eat them. Wrestling eats them. Everything eats my fingers.",
      'protein-shake': "Chocolate? It's chocolate. I'm going to drink it in front of Becca so she knows I'm serious.",
      'merch-sign': "A sign! For the bleachers! I'm adding a Dust Devil insult on the back. Don't read the back.",
      comic: "Wrestle-Bot vs. The Moon. The moon's going down. I can tell from the cover. The moon has no ground game.",
    },
    later: [
      "The {lastGift} is in my locker at school. Becca asked about it. I said 'a wrestler gave it to me.' She didn't believe me. Her loss.",
      "I told Wanda about the {lastGift}. She sniffed my hand for like a full minute. That's a yes.",
    ],
  },
  again: [
    "Still here, city? I've got sprawls in ten.",
    "(Lacey pops one earbud out, raises her eyebrows, and waits. It's very efficient.)",
    "We talked. That's my daily allowance of talking to adults. It's a small allowance.",
  ],
  idle: [
    "(Lacey is tapping a bass line on her knee, mouthing the count.)",
    "Hey. Can't stop. Wanda's dinner. She eats before we do.",
  ],
  birthday: { season: 2, day: 17 },
  events: [
    {
      id: 'lacey-2', hearts: 2, map: 'fair', title: 'Next Time',
      script: async (api) => {
        await api.narrate('Lacey slaps her elbow down on a picnic table by the concession window, hand open, chin up.');
        await api.sayMood('lacey', 'smug', "Arm-wrestle. Right now. Everybody says wrestlers are strong. Prove it, city.");
        await api.narrate('Her grip is like a vise that went to state.');
        const c = await api.choose('She is a lot stronger than she looks.', [
          { label: 'Go all out', value: 'all' },
          { label: 'Ease off and let her win', value: 'let' },
        ]);
        if (c === 'all') {
          await api.narrate("It takes everything you have. Her knuckles go white. Your arm shakes. For one long second, you're sure she has you.");
          await api.narrate('Then, barely, an inch at a time, you put her hand down on the table.');
          await api.narrate("She stares at it. Then she cracks her knuckles, one hand, then the other. Exactly like her father. She doesn't know that.");
          await api.sayMood('lacey', 'happy', 'Next time.');
          api.hearts('lacey', 30);
        } else {
          await api.narrate('You let your arm drift down. She pins it. Then she looks at your face, and her eyes narrow.');
          await api.sayMood('lacey', 'angry', "Did you just LET me win? Don't you dare. Don't you EVER let me win.");
          await api.say('lacey', "Rematch. Tomorrow. And this time you try, or I'm telling Wanda.");
          api.hearts('lacey', -10);
        }
      },
    },
    {
      id: 'lacey-4', hearts: 4, map: 'fair', title: 'The Scrapbook',
      script: async (api) => {
        await api.narrate("Lacey is on the steps of the caretaker's cottage with a scrapbook so full it's held shut by a bungee cord.");
        await api.say('lacey', "Okay. This is embarrassing. Every Tattler clipping about my dad since 1998. Don't laugh.");
        await api.narrate("Cowboy Clint's debut, with a brown mustache. A title win. A retirement party at the VFW, with sheet cake. Every page is careful.");
        await api.say('lacey', 'Wanna see something MORE embarrassing?');
        await api.narrate('She unzips her bass case. Tucked in the lid, next to the spare strings, is a small dartboard.', "The Dust Devil's face is on it. It is full of holes.");
        await api.sayMood('lacey', 'smug', 'Travel dartboard. For emergencies.');
        const c = await api.choose('She holds out a dart.', [
          { label: 'Take a throw', value: 'throw' },
          { label: 'Tell her she has great aim', value: 'aim' },
        ]);
        if (c === 'throw') {
          await api.narrate('You throw. It hits the Dust Devil right between the eyes. Lacey whoops so loud a horse somewhere whinnies back.');
          await api.sayMood('lacey', 'happy', 'BULLSEYE! Okay. Okay, you can stay.');
          api.hearts('lacey', 30);
        } else {
          await api.sayMood('lacey', 'smug', "I know. I practice. It's very therapeutic. Ms. Pruitt is next, if she gives me another B-minus.");
          api.hearts('lacey', 15);
        }
        await api.narrate("Across the fairgrounds, a screen door bangs. You hear Clint whistling an old harmonica tune on his way out to Wanda's pen.");
        await api.say('lacey', "Don't tell Dad about the dartboard. He'd just get all quiet and weird about it. He always does.");
      },
    },
    {
      id: 'lacey-6', hearts: 6, map: 'sportatorium', title: 'The Bleachers',
      when: { showDay: true, place: ['show'] },
      script: async (api) => {
        await api.narrate('Intermission. Half the crowd is in the concession line. The Dust Devil cut a promo in the first half, and the building is still buzzing.');
        await api.narrate("Lacey is alone in the top row of the bleachers, her dad's red bandana wound tight around one fist.");
        await api.say('lacey', "Did you hear him? The Dust Devil? He said Cowboy Clint 'retired because he got scared.'", 'In front of everybody.');
        await api.narrate('Her voice cracks on the last word. She looks away, hard, like the scoreboard owes her money.');
        await api.sayMood('lacey', 'sad', "I don't even know why it hurts this much. Dad doesn't care. I told him and he LAUGHED.");
        await api.say('lacey', "He just tapped his hat twice and laughed. Like it was nothing.");
        await api.narrate("You know exactly why it hurts. You know who taps twice, and what's under the mask, and what it costs him.");
        await api.narrate("And you can't say one word of it.");
        const c = await api.choose('Lacey wipes her face with the bandana, angrily.', [
          { label: 'Sit down next to her and say nothing', value: 'sit' },
          { label: "Tell her her dad is lucky to have her", value: 'lucky' },
        ]);
        if (c === 'sit') {
          await api.narrate('You sit. You don\'t say anything. After a while she leans her shoulder against yours, just a little, the way Wanda leans on a fence.');
          api.hearts('lacey', 30);
        } else {
          await api.say('lacey', '...Yeah. He is. Somebody has to defend him, since he won\'t do it himself.');
          api.hearts('lacey', 15);
        }
        await api.sayMood('lacey', 'sad', "Dad promised he'd quit, and he did. So why do I still look for his truck in the parking lot every Saturday?");
        await api.narrate("Down below, the bell rings for the second half. Neither of you moves right away.");
        api.flag('lacey_six');
      },
    },
    {
      id: 'lacey-8', hearts: 8, map: 'farm', title: 'Train Me',
      script: async (api) => {
        await api.narrate("Lacey is waiting by the backyard ring when you come out, bass case on her back, singlet under her flannel.");
        await api.say('lacey', "Okay. I've been thinking about this for like a year, so just let me say it.");
        await api.sayMood('lacey', 'neutral', "Train me. For real. Pro style. Dad'll say no. Coach'll say no. You won't. I know you won't.");
        await api.narrate("She cracks her knuckles. She is trying very hard to look like she doesn't care what you say.");
        const c = await api.choose('Clint has made his answer clear. This one isn\'t yours to give. Not yet.', [
          { label: '"Not yet. But I\'ll be here when it\'s time."', value: 'notyet' },
          { label: 'Run amateur drills with her in the yard', value: 'drills' },
        ]);
        if (c === 'notyet') {
          await api.narrate('She stares at you. You can see her deciding whether to be furious.');
          await api.say('lacey', '..."When it\'s time." Not "never." You said when.');
          await api.sayMood('lacey', 'happy', "Okay. I'm holding you to when, city. I'm writing it down.");
          api.hearts('lacey', 15);
        } else {
          await api.narrate("You don't promise anything. You just climb through the ropes and show her a better single-leg.");
          await api.narrate("Then a sprawl. Then the single-leg again, until the sun's going down and you're both covered in backyard.");
          await api.sayMood('lacey', 'happy', "This isn't a yes. I know it's not a yes. ...It's a really good not-no, though.");
          api.hearts('lacey', 30);
          api.flag('lacey_drills');
        }
      },
    },
    {
      id: 'lacey-10', hearts: 10, title: 'The Mask on the Nail',
      when: { flag: 'clint_last_match', notFlag: 'lacey_trainee' },
      script: async (api) => {
        await api.narrate("The permission form is signed. Clint's signature goes downhill at the end, like his hand was shaking. It was.");
        await api.narrate('Birdie meets you both at the locker room door. She looks at Lacey for a long time over her rhinestone glasses.');
        await api.say('birdie', "Sugar, once you walk through here, you're in the business. What you see in this room stays in this room. Forever.");
        await api.say('lacey', "Yes, ma'am.");
        await api.say('birdie', 'Then come on in. Welcome home.');
        await api.narrate('Lacey walks in looking at everything at once. The benches. The tape. Ms. Pruitt in a mortarboard, who nods at her. Then she stops.');
        await api.narrate("On a nail by the far lockers hangs a rust-and-sand mask with a swirling pattern. The Dust Devil's mask.");
        await api.narrate("Next to it, on the next nail, hangs a battered straw cowboy hat.");
        await api.narrate("She doesn't say anything. For a long, long time, she doesn't say anything at all.");
        await api.sayMood('lacey', 'sad', '...He made fun of himself. For two whole years. So I wouldn\'t know.');
        await api.narrate('Then she laughs. Then she cries. Then she does both at once, and wipes her face with the bandana on her wrist.');
        await api.say('lacey', "Every promo. Every 'washed-up cowboy.' That was HIM. He was protecting me from... him.");
        await api.sayMood('lacey', 'surprised', "...Can I try it on? The mask? Is that allowed?");
        const c = await api.choose(null, [
          { label: 'Take it off the nail and hand it to her', value: 'hand' },
          { label: '"That\'s his to give."', value: 'his' },
        ], 'lacey');
        if (c === 'hand') {
          await api.narrate("You lift it down and hand it over. She pulls it on. It's far too big. The eyeholes sit on her eyebrows.");
          await api.narrate('She looks at herself in the mirror for a long moment, and then taps the mask twice with two fingers.');
          await api.sayMood('lacey', 'happy', "It smells like cornstarch and his aftershave. That's so gross. That's so HIM.");
          api.hearts('lacey', 15);
        } else {
          await api.narrate('A throat clears behind you. Clint is in the doorway, hat in his hands, not quite looking at either of you.');
          await api.say('clint', "...Go on, kiddo. Try it on. It's about time somebody wore it who means it.");
          await api.narrate('She pulls it on. It is far too big. Clint taps his hat brim twice. She taps her bandana twice back.');
          api.hearts('lacey', 30);
        }
        await api.sayMood('lacey', 'love', "Okay. Okay. When do we start? Today? Can we start today?");
        api.flag('lacey_trainee');
      },
    },
  ],
} satisfies DialogueSet;
