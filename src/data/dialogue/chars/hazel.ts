import type { DialogueSet } from '../types';

/**
 * Hazel "Hurricane" Huang, 34. Owner of Eye of the Storm (physical therapy and
 * yoga) in the old bus depot; former ACW Women's Champion (611 days), coming
 * back from a torn ACL at Thaw Brawl two years ago. The knee is healed. She is
 * not sure she is. Romanceable.
 *
 * Public: intense, competitive, all business, a forecast of doom. Insider: wry,
 * warm, dry as a cracker, scared that if she fails, everyone will watch.
 * Counts everything. Hates "Are you sure you should be doing that?"
 *
 * The studio's departures board is frozen on "2:10 A.M. TO THE CITY"; she thinks
 * it is calming ("everything on it already left"). The player will know whose
 * bus that was. 1983 clue: ambient, never stated here.
 *
 * Flags set here: 'hazel_belt' (6), 'hazel_spot' (8), 'hazel_still_water' =
 * 'patient' | 'counter' (10), 'hazel_romance_onscreen' / 'hazel_romance_secret'
 * (12), 'hazel_proposal_ready' (14).
 */
export default {
  npc: 'hazel',
  intro: [
    "(A woman in a high ponytail and a knee brace stands on one leg in the empty ring, eyes closed, testing the knee.)",
    "Hazel Huang. Hurricane, on the card. I'm told you're the new one. Welcome.",
    "I'm not cleared to wrestle yet. I'm here to watch, to teach, and to glare at landings. You'll hear me before you see me. That's a promise or a threat. Depends on your landing.",
    "If you ever want to learn how to *breathe* in a ring, come by the studio. Six a.m. Bring a mat. Leave your ego at the door. It won't fit through.",
  ],
  introPublic: [
    "(A woman in storm-blue gear is leading a sunrise class. She stops mid-stretch, turns, and looks you over like a forecast.)",
    "Breathe in. Hold it. Hold it. You call that holding it?",
    "Hazel Huang. Eye of the Storm. Class starts at six *exactly.* Not a minute early, not a minute late. Early is just late in a costume.",
  ],
  lines: [
    // ---------------------------------------------------------------- Public: Hurricane
    { text: "Breathe in. Hold it. Hold it. You call that holding it?", when: { hearts: [0, 2], place: ['public'], map: ['studio'], time: [360, 600] }, weight: 3 },
    { text: "(To Coach Patty, across the street.) 'All of it's real, Coach. Every single minute.' (Patty throws her hands in the air.)", when: { place: ['public'], map: ['town'] } },
    { text: "Champion material. Weight on the balls of your feet. A hero's posture says: *I'm not scared of the storm.*", when: { place: ['public'], alignment: ['face'] } },
    { text: "A cheat. Fine. Cheat all you want. The weather doesn't care about cheaters. The weather *wins.*", when: { place: ['public'], alignment: ['heel'], flag: 'debuted' }, mood: 'angry' },
    { text: "Tonight I'm at the commentary desk. Don't mistake that for retirement. It's a *watch.*", when: { showDay: true, place: ['public', 'show'] }, weight: 2 },
    { text: "Don't ask me if I should be doing something. I know my body. I count the days. Everyone else counts calories.", when: { place: ['public'], hearts: [0, 5] } },
    { text: "Gus read my forecast on the air. 'Hurricane Huang: a storm front of one, with scattered kicks.' I've never been prouder of anything.", when: { place: ['public'], hearts: [3, 10] }, mood: 'happy' },
    { text: "Doc says I'm cleared for 'light activity.' He defines 'light' as a feather. I define it as cardio. We've agreed to disagree. Loudly.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "Coach Kowalski sends me her wrestlers for PT. She never looks at the scar. She looks at the wall.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "Dex Delgado came off-axis again. Come here, Dex. Let me explain gravity to you. With my elbow.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "The Dust Devil keeps calling in to Gus with counter-forecasts. 'Partly dusty with a chance of Hurricane's defeat.' I'm going to destroy him on air.", when: { place: ['public'], hearts: [3, 10] }, mood: 'angry' },
    { text: "Mahjong Tuesdays at Evening Bell. The residents are ruthless. I lose forty dollars a month and I wouldn't trade it for a title.", when: { place: ['public'], weekday: [1] }, weight: 2 },
    { text: "My parents call after every show. 'Are you being careful?' I'm in a commentary booth. The most dangerous thing here is a microphone cord.", when: { place: ['public'], hearts: [3, 10], showDay: true } },
    { text: "The departures board in my studio is frozen. Last one says '2:10 A.M. To the City.' It's calming. Everything on it already left.", when: { place: ['public'], map: ['studio'] }, weight: 2 },
    { text: ["You're staring at the board. It's fine, everybody does.", "You look like it means something. ...Does it?"], when: { place: ['public'], map: ['studio'], flag: 'grandma_in_town' }, weight: 3 },
    { text: "Thursday chair yoga at Evening Bell. A woman in plum narrates every stretch like a title match. 'She's going for the hamstring... the Duchess REVERSES.'", when: { place: ['public'], weekday: [3], flag: 'grandma_in_town' }, weight: 3, mood: 'happy' },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "Rain. Good. Everyone's got a little storm in them. Let it fall.", when: { weather: ['rain'], place: ['public'] } },
    { text: "Storm. The sky's practicing. I respect the work.", when: { weather: ['storm'], place: ['public'] } },
    { text: "Snow. The quiet storm. Breathe it in. It'll tell you what you're carrying.", when: { weather: ['snow'], place: ['public'] } },
    { text: "Wind picks up at three. The forecast is always right when I'm the one issuing it.", when: { weather: ['wind'], place: ['public'] } },
    { text: "Thaw Brawl. Two years, nearly. I'm not counting. I'm *forecasting.*", when: { season: [0], place: ['public'] }, weight: 2 },
    { text: "Summer thunderstorm. My favorite. The best match I never wrestled.", when: { season: [1], place: ['public'] } },
    { text: "Fall's the best training weather. Cold enough to sharpen, warm enough to forgive.", when: { season: [2], place: ['public'] } },
    { text: "Winter yoga. We do it in sweaters. It's a very good imitation of a spa. Don't let anyone tell you otherwise.", when: { season: [3], place: ['public'] } },

    // ---------------------------------------------------------------- Insider: Hazel, at last, a person
    { text: "Six hundred and eleven days as champion. Seven hundred and thirty since the knee. I count both. I don't know which number's winning.", when: { place: ['insider'], hearts: [3, 10] }, weight: 2 },
    { text: "The knee's healed. I keep saying that. It's true. But healed and trusted are different things. Healed is a fact. Trusted is a *relationship.*", when: { place: ['insider'], hearts: [6, 10] } },
    { text: "Gideon taught me to accept a compliment. I'm at about twenty percent. Last week somebody said I looked nice and I only said 'no' twice.", when: { place: ['insider'], hearts: [3, 10] }, mood: 'happy' },
    { text: "Doc doesn't want me back yet. He's right. I hate it. Don't tell him he's right.", when: { place: ['insider'] } },
    { text: "I yell at Dex because I know what a bad landing costs. He thinks it's tough love. It's *terrified* love.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Clint brings me honey for my knee tea. Don't tell anyone. We have a feud. A feud with honey in it is very confusing for the sheriff.", when: { place: ['insider'], hearts: [3, 10] }, mood: 'happy' },
    { text: "The trick to mahjong is the same as the trick to wrestling: let the other person think they're winning until they're out of tiles.", when: { place: ['insider'] } },
    { text: "You're new, so: breathe out on impact. Everybody says breathe in. In is for *before.* Out is for *survive.*", when: { place: ['insider'], rank: ['rookie', 'opener'] } },
    { text: "Main event. Everything gets bigger up there. Landings, too. Land smaller than you look.", when: { place: ['insider'], rank: ['main', 'assistant', 'pencil', 'owner'] } },
    { text: "Show day. I do my stretches at five. My knee does its own at five-oh-five. We don't discuss the gap.", when: { place: ['insider'], showDay: true } },
    { text: "Rain's good for the knee, bad for the knee, then good again. It's a barometer with a grudge.", when: { place: ['insider'], weather: ['rain'] } },
    { text: "Storms don't scare me. The knee does. And, apparently, failing in front of people. Which, historically, is a lot of people.", when: { place: ['insider'], weather: ['storm'] }, mood: 'sad' },
    { text: "I've been staring at this belt bag for twenty minutes. It's zipped. I haven't touched it. I'm winning, I think.", when: { time: [1320, 1560], place: ['insider'], notFlag: 'hazel_belt' }, mood: 'sad' },

    // ---------------------------------------------------------------- After the events
    { text: "The belt's still in the bag. But I've started leaving the bag on the shelf where I can see it. It's tiny progress. I take tiny progress.", when: { flag: 'hazel_belt', place: ['insider'], notFlag: 'hazel_still_water' } },
    { text: "You spotted me. I'm still thinking about the part where nothing broke. It was a very nice part.", when: { flag: 'hazel_spot', place: ['insider'], notFlag: 'hazel_still_water' }, mood: 'happy' },
    { text: "I've been practicing the first move of Still Water in the mirror. It isn't a fight. It's a *conversation.* The opponent can win. They just have to listen.", when: { flag: 'hazel_still_water', place: ['insider'] }, weight: 2 },
    { text: "Dottie calls me Typhoon. I answer to it. I don't know why. She says it with such *authority.*", when: { flag: 'grandma_in_town', place: ['insider'], hearts: [3, 10] }, mood: 'happy' },
    { text: "She did chair yoga yesterday and announced her own 'Duchess reverses!' mid-stretch. The whole room applauded. I applaud, too, every time.", when: { flag: 'reunion_done', place: ['insider'] }, mood: 'happy', weight: 2 },

    // ---------------------------------------------------------------- Dating
    { text: "(From the commentary desk, she taps the desk twice when you walk past. It's the closest thing to a wave you'll get.)", when: { dating: true, place: ['show', 'public'], showDay: true }, weight: 2 },
    { text: "I tape your wrists before every show. Don't tell the mirror. Don't tell Gideon. Gideon's going to cry.", when: { flag: 'hazel_romance_secret', place: ['insider'] }, mood: 'love', weight: 2 },
    { text: "'Calm Before the Storm.' That's what they're calling us. Gus says it every Saturday. I want to throw something. I don't. I smile.", when: { flag: 'hazel_romance_onscreen' }, mood: 'happy', weight: 2 },
    { text: "I made that class longer so you'd stay. I'll deny it. I'll also do it again.", when: { dating: true, place: ['insider'] }, mood: 'love' },

    // ---------------------------------------------------------------- Family
    { text: "You're one of the very few people who doesn't ask if I'm okay. You ask what I need. It's a tiny difference. It's the whole difference.", when: { hearts: [9, 14], place: ['insider'] }, mood: 'love' },
  ],
  gifts: {
    loves: ['teacup', 'polaroid', 'river-stone'],
    likes: ['honey', 'rope', 'tape', 'horchata', 'coffee'],
    dislikes: ['bouquet', 'gas-hotdog', 'foam-finger'],
  },
  giftReplies: {
    love: [
      "(She takes it, studies it, and goes very still.) You notice things. Stop noticing things. It's rude. ...(She's smiling.)",
      "I'm going to pretend I'm not moved. I'm very good at it. I've had practice. ...Thank you.",
      "Seven hundred and thirty days of 'are you sure.' And you just *gave* me something. No 'are you sure.' Thank you.",
    ],
    like: [
      "That's thoughtful. I'll use it. I use everything. Waste is the opposite of discipline.",
      "Nice. Thank you. I'll put it with the other useful things.",
      "(A small, rare, crooked smile.) You didn't have to. I'm glad you did.",
    ],
    neutral: [
      "Thank you. I'll find a place for it. The studio has a lot of places.",
      "Hm. Interesting. I'll consider it. Possibly while holding a plank.",
    ],
    dislike: [
      "I've been well for a year. I'm just scared. There's no gift for that.",
      "Thank you. I'll put it somewhere I don't have to look at it. That's not a statement. It's logistics.",
      "(She holds it between thumb and forefinger.) Is this a *get-well* gift? Because I'm *well.*",
    ],
    birthday: [
      "My birthday. I'm not good at these. People ask what I'm *recovering* from. You asked what I'd like. ...Thank you.",
      "Fall, the twelfth. Hurricane season, technically. Fitting. ...Thank you for bringing a gift and not a *concern.*",
    ],
  },
  birthday: { season: 2, day: 12 },
  events: [
    // ---------------------------------------------------------------- 2: Where your center isn't
    {
      id: 'hazel-2', hearts: 2, map: 'studio', when: { time: [380, 720] }, title: "Where Your Center Isn't",
      script: async (api) => {
        await api.narrate("Sunrise at Eye of the Storm. A converted bus depot with high windows, bamboo mats, and a long board on the wall whose last line is frozen: 2:10 A.M. TO THE CITY.");
        await api.say('hazel', "Warrior two. Hold. Hold it. Hold it. You call that holding it?");
        await api.narrate("You hold it. Your legs are shaking. Hazel walks the line of mats with her hands behind her back, one knee in a brace, not a sound from her footsteps.");
        await api.say('hazel', "You're standing like you're apologizing to the floor. Chest up. Sink the hip. Shoulders loose.");
        await api.narrate("She stops in front of you. She raises one finger. She places it, lightly, on your shoulder blade.");
        await api.narrate("You fall over. Not gracefully.");
        await api.say('hazel', "Good. Now you know where your center isn't.");
        const c = await api.choose('You are lying on a bamboo mat, looking at the ceiling.', [
          { label: 'Get up and say "Again."', value: 'again' },
          { label: 'Laugh. Stay down a minute.', value: 'laugh' },
          { label: '"That wasn\'t fair. You pushed me."', value: 'unfair' },
        ]);
        if (c === 'again') {
          api.hearts('hazel', 30);
          await api.narrate("You scramble back to your feet and plant your stance. A very slight, very rare tilt appears at the corner of her mouth.");
          await api.say('hazel', "Good. Most people stay down and make excuses. You got up. Everything else is detail.");
        } else if (c === 'laugh') {
          api.hearts('hazel', 15);
          await api.narrate("You laugh, staring at the rafters. She watches you for a second, nods, and moves on to the next mat.");
          await api.say('hazel', "Laughing's fine. Staying down's fine. For a minute. After a minute it's a decision.");
        } else {
          api.hearts('hazel', -10);
          await api.say('hazel', "I touched you. With one finger. That's physics, not fairness.");
          await api.narrate("She turns, and the line of mats goes very quiet. You feel the temperature in the studio drop by about four degrees.");
        }
        await api.say('hazel', "Six a.m. tomorrow. Bring water. Leave your ego at the door. It won't fit through anyway.");
      },
    },
    // ---------------------------------------------------------------- 4: Three hops
    {
      id: 'hazel-4', hearts: 4, map: 'studio', title: 'Three Hops',
      script: async (api) => {
        await api.narrate("After close, Hazel is writing a number on the studio whiteboard. 731. She underlines it. Then she turns and looks at you for a long moment.");
        await api.say('hazel', "I'm going to show you something I don't show people. Hot Tag. The back booth. They have a hallway behind it where nobody looks.");
        await api.fade();
        await api.narrate("The back booth, then the narrow hall behind it, linoleum and the smell of old fryer oil. June, at the counter, has suddenly become very interested in a clean spoon.");
        await api.say('hazel', "It's called the single-leg hop test. Doc does it every month. Three hops, one leg, no hands. If the knee's *trusted,* it takes four seconds.");
        await api.say('hazel', "I've never done it for a person who wasn't Doc.");
        await api.narrate("She steps to the middle of the hall, lifts her right leg, and bends the left. Her breath goes slow and even.");
        await api.narrate("One hop. Clean. Two hops. Clean. On the third, she lands and her whole face winces, a half-second flash, and goes still again.");
        await api.say('hazel', "Seven hundred and thirty-one days. Tomorrow's thirty-two. I always know the number. I wake up with it.");
        const c = await api.choose(null, [
          { label: 'Stand close, hands ready, not touching', value: 'spot' },
          { label: 'Count the hops out loud with her, on the next try', value: 'count' },
          { label: '"Are you sure you should be doing that?"', value: 'sure' },
        ]);
        if (c === 'spot') {
          api.hearts('hazel', 30);
          await api.narrate("You stand close, palms up, an inch from her elbow. You don't touch. She notices. She nods, once, and hops again.");
          await api.say('hazel', "That's what a spotter does. Be *near.* Don't be *under.* Most people can't tell the difference. You can.");
        } else if (c === 'count') {
          api.hearts('hazel', 30);
          await api.narrate("You count. One. Two. Three. She hops in time. On three, she winces again, but this time she exhales, and the wince passes through her like weather.");
          await api.say('hazel', "Better. That one was a four. ...I'm saying it was. I don't have a scale. I'm saying it.");
        } else {
          api.hearts('hazel', -10);
          await api.narrate("The hall goes silent. She lowers her foot. Her jaw does something quiet and hard.");
          await api.say('hazel', "...I knew somebody would. I've been well for a year. I'm just scared. There's no flower for that.");
          await api.narrate("She picks up her jacket and leaves through the kitchen door. The number is still on the whiteboard when you pass the studio the next morning.");
        }
        await api.narrate("Back in the booth, June sets down a mug of oolong she definitely didn't make for you. She says it's on the house, and she says it to the wall.");
      },
    },
    // ---------------------------------------------------------------- 6: The belt bag
    {
      id: 'hazel-6', hearts: 6, map: 'studio', title: 'Zipped',
      script: async (api) => {
        await api.narrate("Closing time. Hazel stands at the window of the studio with her arms folded, looking at the Sportatorium's roof three blocks off, red in the dusk.");
        await api.say('hazel', "Come with me. The locker room. I need to put something down, and I can only do it in there.");
        await api.fade();
        await api.narrate("The locker room, empty. Hazel sets a long black gear bag on the bench. It has a heavy zipper and a luggage tag in her handwriting: H. HUANG. DO NOT OPEN.");
        await api.say('hazel', "It's the belt. The Women's Title. Six hundred and eleven days. It's been in that bag since the night of the knee. I haven't unzipped it once.");
        await api.say('hazel', "If I look at it, I'll try something stupid. I know me. I know exactly how stupid.");
        await api.sayMood('hazel', 'sad', "I could take it out right now. Hold it. Put it on. But then I'd have to be the person it was made for. And I'm not sure that person's still in here.");
        const c = await api.choose('The bag sits on the bench between you. The zipper catches the light.', [
          { label: 'Sit down beside the bag. Say nothing.', value: 'sit' },
          { label: 'Ask what the belt meant to her', value: 'ask' },
          { label: '"Open it. Just look. You\'ll feel better."', value: 'open' },
        ]);
        if (c === 'sit') {
          api.hearts('hazel', 30);
          await api.narrate("You sit. The bench takes both your weights. Hazel sits a minute later, on the other side of the bag. Nobody speaks. The hum of the building is the only sound.");
          await api.say('hazel', "...That's the first time anyone's sat with the bag. Usually they sit with *me.* This is better.");
        } else if (c === 'ask') {
          api.hearts('hazel', 30);
          await api.narrate("She rests her hand on the bag, flat, the way you'd put a hand on a sleeping dog.");
          await api.say('hazel', "Every one of those days, I earned. Every title defense was somebody I had to be better than. And every day since the knee, I've been afraid I'd have to earn it all again.");
          await api.say('hazel', "That's not what the belt means. It's what I'm *afraid* it means. I'm working on the difference.");
        } else {
          api.hearts('hazel', -10);
          await api.narrate("You reach for the zipper. Her hand lands on yours so fast you barely see it move. Her grip is iron.");
          await api.say('hazel', "No.");
          await api.narrate("She lets go. She's shaking, very slightly. She takes a deep, deliberate breath and doesn't look at the bag or at you.");
          await api.say('hazel', "I'm sorry. That was... not your fault. It's *my* bag. I get to say when.");
        }
        api.flag('hazel_belt', true);
        await api.narrate("When she stands, she moves the bag, not into her locker, but onto the shelf above it, in plain sight. Her hand lingers on the strap.");
        await api.say('hazel', "Not today. But I'm going to start leaving it where I can see it. That's step one. Step one's very small. I told you. I count everything.");
      },
    },
    // ---------------------------------------------------------------- 8: The 1990s floor
    {
      id: 'hazel-8', hearts: 8, map: 'studio', when: { weekday: [6] }, title: 'Eighteen Inches',
      script: async (api) => {
        await api.narrate("Sunday. Hazel locks the studio, slings a gym bag over her shoulder, and walks you to the Sportatorium without a word. At the back of the locker room is a steel door you've seen before, and a staircase that goes down further than a staircase should.");
        await api.fade();
        await api.narrate("The Dungeon, the nineties floor. Neon-pink wall stripes, a boombox on a milk crate, rubber floor mats in teal and purple. It smells faintly of Aqua Net and effort.");
        await api.say('hazel', "I rehab here Sundays. Nobody else comes to this floor. The '90s are unfashionable down here, which suits me.");
        await api.narrate("She sets a low box on the mat, no higher than a stair. She climbs onto it, in her brace, and turns to look at you with a very level expression.");
        await api.say('hazel', "Eighteen inches. A little hop and a landing. That's all. I've been doing it alone for two months. I want somebody to watch this time.");
        const c = await api.choose('She asks you, without asking you, to spot her.', [
          { label: 'Stand close, hands ready, but not touching', value: 'spot' },
          { label: '"Let\'s get Doc down here first."', value: 'doc' },
        ]);
        if (c === 'doc') {
          api.hearts('hazel', -10);
          await api.narrate("She goes cold. She steps down from the box.");
          await api.say('hazel', "Then you're not spotting me. I'll do it alone. Like I've been doing.");
          await api.narrate("She waits for you to leave. You wait for her to look up. Neither happens. After a while she does the hop anyway, and lands perfectly, and says nothing at all.");
          return;
        }
        api.hearts('hazel', 15);
        await api.narrate("You step up close, hands loose at your sides. She breathes in, out, in. She hops.");
        await api.narrate("She lands. And the left knee gives out. Just a half-inch. Just a buckle. She goes down onto the mat, and you catch her elbow without thinking.");
        await api.narrate("There's a long silence. Then Hazel starts to laugh.");
        await api.narrate("Then she's crying. Then she's laughing again, both hands over her face, her whole body shaking on a teal-and-purple mat.");
        await api.say('hazel', "It *buckled.* It actually buckled. Nothing broke. ...Nothing *hurts.* It just *buckled.* I've been scared of that for two years. And it's... *okay.*");
        const d = await api.choose(null, [
          { label: 'Sit down on the mat next to her', value: 'sit' },
          { label: "\"I won't tell Doc. But if it hurts tomorrow, you tell him.\"", value: 'promise' },
        ]);
        if (d === 'sit') {
          api.hearts('hazel', 15);
          await api.narrate("You sit. Neither of you speaks. The boombox hums. After a while, her shoulder tips against yours.");
        } else {
          api.hearts('hazel', 15);
          await api.say('hazel', "Deal. If it hurts tomorrow, I'll tell him myself. ...Probably. I'll *probably* tell him myself.");
          await api.narrate("She almost smiles. It's the first time you've seen her not count something.");
        }
        api.flag('hazel_spot', true);
        await api.say('hazel', "Thank you. For being *near.* Not under. ...I told you that was the difference.");
      },
    },
    // ---------------------------------------------------------------- 10: The quiet part in the middle
    {
      id: 'hazel-10', hearts: 10, map: 'studio', title: 'Still Water',
      script: async (api) => {
        await api.narrate("Evening at the studio. The mats are pushed into a ring-sized square, and Hazel sits in the middle of it with a notebook of drawn-out stick figures, each one in a different grappling position.");
        await api.say('hazel', "I'm coming back. Not as the old Hurricane. The Hurricane's finisher was a corkscrew dive to the floor. I will never do it again. I've made peace with that. It took eleven months.");
        await api.say('hazel', "I want a new one. A finisher that doesn't ask my knee for anything. A hold. Something grounded.");
        await api.say('hazel', "I don't want to be the storm anymore. I want to be the quiet part in the middle.");
        await api.narrate("She turns the notebook toward you. A figure kneeling, an arm trapped, a second figure's head tilted in a crossface. In the margin, in her tiny printing: *STILL WATER?*");
        await api.say('hazel', "It's an arm-trap crossface. But the *how* matters. How does it start? That's where I want you. That's the part I can't see.");
        const c = await api.choose('Hazel waits. The studio is very quiet.', [
          { label: 'She waits. She lets them come to her. The trap closes around their own momentum.', value: 'patient' },
          { label: 'She answers the Category Five. Every kick turns into the first link of the hold.', value: 'counter' },
        ]);
        api.hearts('hazel', 30);
        api.flag('hazel_still_water', c);
        if (c === 'patient') {
          await api.sayMood('hazel', 'surprised', "Waiting. I've never been good at that. I always went to the storm. ...She waits. She lets *them* be the storm.");
          await api.say('hazel', "That's the whole thing, isn't it? You stand in the middle, and everything comes to you, and it doesn't knock you down.");
        } else {
          await api.sayMood('hazel', 'happy', "Category Five. Five kicks. And on the fifth, I don't throw it. I *catch* it. Ha. That's... that's it. That's so *me.*");
          await api.say('hazel', "Everything I've ever done to somebody becomes the first step of holding them still. I want the crowd to *feel* that.");
        }
        await api.narrate("You work through it, link by link, for the rest of the evening. She traps your arm for a demonstration, slowly. The hold is firm and kind at the same time.");
        await api.say('hazel', "Tap when you want. Nobody taps from this one fast. That's the point. It doesn't hurt. It just waits until you're ready to stop.");
        await api.narrate("She releases. Under the frozen board that says 2:10 A.M. TO THE CITY, she writes one line on the whiteboard, over the number: *Still Water. Built with {name}.*");
        await api.say('hazel', "Don't tell Gideon I got a name card done before I got a bedtime. He'll want one for his hair.");
      },
    },
    // ---------------------------------------------------------------- 12: Tree pose
    {
      id: 'hazel-12', hearts: 12, map: 'studio', when: { dating: true }, title: 'Tree Pose',
      script: async (api) => {
        await api.narrate("A card on your doorstep, in tiny, upright printing: SUNRISE CLASS. SIX. BRING WATER. BRING NO EXPECTATIONS.");
        await api.fade();
        await api.narrate("Six a.m. at Eye of the Storm. You are the only student. A single lamp is on. Hazel is in her storm-blue, the picture of professional neutrality.");
        await api.say('hazel', "Tree pose. One leg. Hands overhead. We'll begin. I'll tell you when to stop.");
        await api.narrate("Ten minutes in, she says nothing. At twenty, she adjusts your wrist with a single finger. At forty, your standing leg is trembling like a plucked string.");
        const c = await api.choose('Minute fifty. You can no longer feel your toes.', [
          { label: 'Hold it. All sixty minutes.', value: 'hold' },
          { label: 'Wobble and tip over, on purpose', value: 'wobble' },
        ]);
        if (c === 'hold') {
          api.hearts('hazel', 30);
          await api.narrate("You hold. She comes to stand in front of you at the end, studying your face for any sign of surrender, and finds none.");
          await api.say('hazel', "Sixty minutes. Hurricane intensity. Most people tap out at thirty. ...I made the class longer. So you'd stay. I'll deny it.");
        } else {
          api.hearts('hazel', 15);
          await api.narrate("You tip over with great and obvious theatricality. Hazel looks at you on the mat. The corner of her mouth moves.");
          await api.say('hazel', "Good. Now you know where your center isn't. Again.");
          await api.narrate("She helps you up. She holds your elbow a second longer than she needs to.");
        }
        await api.fade();
        await api.narrate("The back booth, after. She's holding her oolong with both hands, looking at it, not at you.");
        await api.say('hazel', "Birdie asked me a question. She asks everyone. Do we go on-screen? 'Calm Before the Storm.' You in my corner for the comeback. Gus calls it every week.");
        await api.say('hazel', "Or it's ours. I tape your wrists before every show. Nobody knows. It's... I think it's the quietest thing I could do for somebody.");
        const s = await api.choose('How should the romance live?', [
          { label: 'On-screen: "Calm Before the Storm"', value: 'on' },
          { label: 'Secret: she tapes your wrists', value: 'secret' },
        ]);
        if (s === 'on') {
          api.flag('hazel_romance_onscreen', true);
          await api.sayMood('hazel', 'happy', "Okay. In my corner. For the comeback. I'll try not to want to throw things. I make no promises about the microphone.");
        } else {
          api.flag('hazel_romance_secret', true);
          await api.sayMood('hazel', 'love', "Tape. Your wrists. Before every show. Nobody in the world will know what it means but us. I'll count every single one.");
        }
      },
    },
    // ---------------------------------------------------------------- 14: Named for you
    {
      id: 'hazel-14', hearts: 14, map: 'studio', when: { dating: true }, title: 'The Eye',
      script: async (api) => {
        await api.narrate("The studio after closing. Hazel has pushed the mats into a square and left one light on. She's in a plain gray hoodie. She has a very small card in her hand, and she's holding it with both.");
        await api.say('hazel', "I finished the finisher. Still Water. The whole thing, start to finish. You're the first person who's seen it. Not Doc. Not Gideon. Not Birdie.");
        await api.narrate("She kneels on the mat and sets herself. She slides one arm gently under yours. Slowly, she goes through every link, every breath. At the center, she pauses, and the room is perfectly still.");
        await api.say('hazel', "That pause. The step where I stop, and breathe, and let them come to me. I've had a name for it for weeks.");
        await api.narrate("She hands you the card. In her tiny, careful printing: *The {name}.*");
        await api.say('hazel', "It's the moment I realized I wasn't alone in the middle. I wanted it to have your name. If it's all right. It's all right if it isn't.");
        if (api.hasFlag('grandma_in_town')) {
          await api.narrate("Above her shoulder, the frozen departures board still says 2:10 A.M. TO THE CITY. You've begun to look at it differently, and you can't say why.");
        }
        const c = await api.choose(null, [
          { label: 'Take her hand. Tell her it\'s the best name anything has ever had.', value: 'hand' },
          { label: 'Tap out of the hold. "Obviously. Obviously yes."', value: 'tap' },
        ]);
        if (c === 'hand') {
          api.hearts('hazel', 30);
          await api.narrate("She holds on. Her grip is steady. It always is.");
        } else {
          api.hearts('hazel', 30);
          await api.sayMood('hazel', 'happy', "You tapped. Nobody taps from this one fast. ...That's how I know I got it right.");
        }
        await api.say('hazel', "Hank's braiding a rope. Gideon told me. I'm not supposed to know. I'll act surprised. I'll be *very good* at it. I've practiced.");
        await api.say('hazel', "When you ask, I'll answer quickly. I count everything. I've been counting the days to this one, and I've never once lost count.");
        api.flag('hazel_proposal_ready', true);
      },
    },
  ],
} satisfies DialogueSet;
