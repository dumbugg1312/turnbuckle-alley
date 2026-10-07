import type { DialogueSet } from '../types';

/**
 * Henrietta "Hank" Szabo, 57. Ring builder, carpenter, beltmaker. Insider (crew),
 * never romanceable. Few words, all exact. In public she is simply Hank, the
 * carpenter who builds sturdy rings for violent people; in the three rooms she
 * talks about rings the way musicians talk about instruments.
 *
 * 1983 (CAST Part 9): at seventeen she found the red rhinestone from the belt's
 * center plate under the ring the morning after, and changed the lock on
 * Dottie's locker for Birdie without asking why. The jewel is told at 8 hearts
 * once Grandma is in town ('hank_rhinestone'); the lock is only ever hinted at.
 * Plumb is her three-legged hound and goes everywhere she does.
 */
export default {
  npc: 'hank',
  intro: [
    "(Hank taps a level against your boot, studies the bubble, and nods.) Szabo. Henrietta. Hank. I build the rings.",
    "Don't lean on the ropes. Everybody leans. Don't.",
    "In here I can say the rest. A ring's a drum, kid. Every bump plays it. You'll learn to listen.",
    "That's Plumb. Three legs. Better balance than you.",
  ],
  introPublic: [
    "(She doesn't look up from the plank.) Hank. I build the rings. Table broke 'cause the Mountain's heavy, ma'am. I build 'em sturdy.",
    "...You're the Dupree kid. I built that backyard ring with my mother. Pine posts. Navy rope. Good ring.",
    "Don't lean on the ropes.",
    "(A three-legged hound sits on your foot.) That's Plumb. He's allowed.",
  ],
  lines: [
    // ---------------------------------------------------------------- Public: the carpenter
    { text: "Table broke 'cause the Mountain's heavy, ma'am. I build 'em sturdy. He's sturdier.", when: { place: ['public'] } },
    { text: ["Measure twice. Cut once.", "Measure once more. That's the whole trade."], when: { hearts: [0, 4], place: ['public'] } },
    { text: ["(She taps a plank with a knuckle and listens.)", "Pine's cheap. Walnut's honest. Oak lies a little."], when: { hearts: [0, 5], place: ['public'] } },
    { text: ["(Plumb leans his whole weight against your shin, on three legs, perfectly balanced.)", "Don't feel sorry for him. He doesn't."], when: { hearts: [0, 6] } },
    { text: "The mayor orders keys to the city by the dozen. I cut 'em from brass blanks. They open nothing. Opening nothing is harder than it sounds.", when: { hearts: [3, 10], place: ['public'] } },
    { text: "Need a hand carrying lumber? Don't talk while you carry. Talking drops planks.", when: { hearts: [3, 8], place: ['public'] } },
    { text: "Heard you hit somebody with a chair. One of mine? Bring it back. I'll fix the leg. Chairs have feelings. Mostly in the legs.", when: { place: ['public'], alignment: ['heel'], flag: 'debuted' } },
    { text: "Saw you hit the ropes Saturday. They held. That's me. (She goes back to sanding.)", when: { place: ['public'], alignment: ['face'], flag: 'debuted' } },
    { text: "Ring's up. Ropes are tight. Whatever happens tonight, it's not the ring's fault.", when: { showDay: true, place: ['public', 'show'] }, weight: 2 },
    { text: ["Cribbage with Gus tonight.", "He counts fifteen-two, fifteen-four, and then a number I've never heard. I count his counting."], when: { weekday: [6] } },
    { text: "Seven a.m. Best light for sanding. Worst light for conversation.", when: { time: [400, 540] } },
    { text: "Rain's hard on canvas. Good on a tin roof. Hold still a second and listen.", when: { weather: ['rain'] } },
    { text: "Storm coming. Plumb's already under the ring. Smarter than the forecast.", when: { weather: ['storm'] } },

    // ---------------------------------------------------------------- Seasons
    { text: "Thaw. Wood moves when it thaws. Everything moves. I check the bolts twice.", when: { season: [0] }, weight: 2 },
    { text: "Hot. Canvas goes soft in the heat. I tighten the ring at dawn. Folks think it's magic. It's a wrench.", when: { season: [1] } },
    { text: "Leaves in the ring skirt every October. Every October I say I'll build a roof. Every October it rains.", when: { season: [2] } },
    { text: "Cold shrinks rope. A ring tuned in January is loose by July. You tune for the weather, same as a banjo.", when: { season: [3] } },

    // ---------------------------------------------------------------- Insider: the instrument
    { text: "Every ring has a voice. This one's a little flat on the north side. I've been meaning to fix it since 1994.", when: { place: ['insider'] }, weight: 2 },
    { text: ["Tightened the ropes till they sang one note. B-flat.", "Wrestlers feel it in their feet. They don't know why they like this ring. That's why."], when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Scored the breakaway tables at an eighth of an inch. Splits like a cracker. Nobody's been hurt on one of mine. I'd eat the saw first.", when: { place: ['insider'] } },
    { text: "Mariposa's butterflies: four hundred paper wings on a pulley. Took eleven tries to make them fall like they meant it.", when: { place: ['insider'] } },
    { text: "The Dust Devil's tumbleweeds are chicken wire and good intentions. I weigh each one. They have to roll slow enough to look sad.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "The Twins get real sparks off that grinder. Fake danger, real sparks. I measure the distance with my pinky. Quarter inch. Always.", when: { place: ['insider'] } },
    { text: "Lost the tip of this pinky to a table saw in '91. Now it's a quarter-inch gauge. Handy. Wouldn't recommend.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "(Humming something low and Hungarian.) My mother's. A wedding song about a tree. Everything she sang was about a tree.", when: { place: ['insider'] } },
    { text: "Plumb found a bent nail under the apron. Three legs and a metal detector. Best crew I've got.", when: { place: ['insider'] } },
    { text: "Somebody keeps the '79 porch-light wiring under the ring in perfect order. Neat splices. Good heat shrink. I've never asked who.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Bump from the middle, not the edge. The middle rings. The edge only thuds.", when: { place: ['insider'], rank: ['rookie', 'opener'] } },
    { text: "Main event. I re-tensioned the north ropes for you. Don't tell the others. They'll all want it.", when: { place: ['insider'], rank: ['main', 'assistant', 'pencil', 'owner'] } },
    { text: "Walk the apron before the doors open. Learn the boards. Boards remember where you land.", when: { place: ['insider'], showDay: true } },
    { text: "Ever wonder what the canvas feels like from the bottom? I do. ...Never mind. Hand me the wrench.", when: { place: ['insider'], hearts: [6, 10] }, mood: 'sad' },
    { text: "Changed one lock in my life without asking why. I was seventeen. Some questions are load-bearing.", when: { place: ['insider'], hearts: [6, 10], flag: 'grandma_in_town', notFlag: 'truth_revealed' } },
    { text: "Rewired Dottie's vanity at the Evening Bell. Bulbs all the way around. She called me Henrietta. Nobody calls me Henrietta. I let her.", when: { place: ['insider'], flag: 'grandma_in_town' }, mood: 'happy' },
    { text: "I let three people touch my chisels. Plumb, who can't. Gus, who shouldn't. And you.", when: { place: ['insider'], hearts: [9, 10] }, mood: 'happy' },
    { text: "Set the rhinestone back in the plate myself. Fit like it never left. Forty years in a jar and it still knew its seat.", when: { flag: 'reunion_done', place: ['insider'] }, mood: 'happy', weight: 3 },
  ],
  gifts: {
    loves: ['plank', 'iron', 'rope'],
    likes: ['coffee', 'canvas', 'leather', 'tape', 'chili-dog'],
    dislikes: ['fiber', 'gas-hotdog', 'merch-sign'],
  },
  giftReplies: {
    love: [
      "(She runs a thumb along it, squints, holds it to the light.) That's real good. That's a belt plate. Or a box for something that matters.",
      "Hm. (A long look. A small nod.) You pick well. Don't tell the dog. He picks by smell.",
      "(Hank sets it on the high shelf, where she keeps the things she's saving.) ...Thank you. I mean it. I say it once a year.",
    ],
    like: [
      "Useful. Thank you.",
      "Good. Plumb says so too. (Plumb says nothing, but wags.)",
      "That'll do fine. Fits a pocket. I have fourteen.",
    ],
    neutral: [
      "Hm. Okay. Thank you.",
      "I'll put it somewhere. Probably a pocket.",
      "(She weighs it in her hand, checking its tolerances.) ...Sure.",
    ],
    dislike: [
      "No.",
      "(She looks at it. She looks at you. She looks at it again.) No.",
      "That'll go in the stove. Respectfully.",
    ],
    birthday: [
      "You remembered. (She clears her throat, twice.) Plumb, that's a birthday. Look alive.",
      "Another year, still plumb. Thank you. I'll put a candle in a nail hole. It's tradition. I just made it one.",
    ],
  },
  birthday: { season: 1, day: 27 },
  events: [
    // ---------------------------------------------------------------- 2: Every chair is a seat
    {
      id: 'hank-2', hearts: 2, map: 'sportatorium', title: 'Every Chair Is a Seat',
      script: async (api) => {
        await api.narrate('The Sportatorium, early. Rows of folding chairs, half unfolded. Hank is flat on her back under one with a wood-burning pen.', 'Plumb snores in the sawdust.');
        await api.say('hank', 'Sit.');
        await api.narrate('She points to a wooden folding chair, the old kind, hinges oiled. Burned into the seat in neat block capitals: {name}.', 'The edges are sanded round as river stones.');
        await api.say('hank', "Every chair's a seat at the show. Now one's yours.");
        await api.narrate('She says it flat, like a measurement. Her ears have gone pink.');
        const c = await api.choose(null, [
          { label: 'Sit down in it, carefully, and say nothing', value: 'sit' },
          { label: 'Ask which chair is hers', value: 'hers' },
          { label: 'Offer to pay for it', value: 'pay' },
        ]);
        if (c === 'sit') {
          api.hearts('hank', 30);
          await api.narrate('You lower yourself onto the seat. It holds. It holds like it was built for exactly your weight, which, you realize, it was.');
          await api.sayMood('hank', 'happy', '...Good. Chairs like to be sat in. That is all they ask.');
        } else if (c === 'hers') {
          api.hearts('hank', 15);
          await api.say('hank', "Third row, aisle. Got a lean. Nobody sits there. Plumb's allowed.");
          await api.narrate('She points without looking. A scuffed chair, worn pale on the arms. It does lean, very slightly, toward the ring.');
        } else {
          await api.narrate('You hold out some money. Hank looks at it for a long moment. Then she folds your fingers over it, with surprising gentleness.');
          await api.say('hank', "It's a chair. Not a transaction.");
        }
        await api.narrate("She slides back under the next chair. From beneath it, muffled:");
        await api.say('hank', "Don't lean back too far. I didn't sand that part.");
        api.flag('hank_chair');
      },
    },
    // ---------------------------------------------------------------- 4: A ring is a drum
    {
      id: 'hank-4', hearts: 4, map: 'sportatorium', title: 'A Ring Is a Drum',
      script: async (api) => {
        await api.narrate('Hank crooks a finger at you and walks toward the locker room without looking back.', 'Plumb trots after on three legs, like a metronome with a limp.');
        await api.fade();
        await api.narrate("Behind the benches sits the old practice ring Birdie won't let anyone throw out. Hank has pulled back the skirt.", "Underneath: springs, planks and iron, like the inside of a piano.");
        await api.say('hank', 'Every ring is a drum. Skin on top. Resonance underneath. Every bump plays it. Lie down.');
        await api.narrate('You lie flat on the canvas, arms out. Hank sets one boot on the apron and bounces, once.');
        await api.narrate('The whole ring answers with a deep, round note you feel in your sternum. It really does sound like a drum.');
        await api.say('hank', "Hear that? That's a good floor. Nobody's lying to nobody.");
        const c = await api.choose('Hank bounces the apron again, slower.', [
          { label: 'Close your eyes and just listen', value: 'listen' },
          { label: 'Bounce back at her', value: 'bounce' },
        ]);
        if (c === 'listen') {
          api.hearts('hank', 30);
          await api.narrate('You close your eyes. The note rolls through the canvas, through your back, down to your boots.', 'Somewhere above you, very softly, Hank starts to hum it.');
          await api.say('hank', "B-flat. That's the one. Most folks never hear it. They're too busy landing.");
        } else {
          api.hearts('hank', 15);
          await api.narrate('You hop up and bounce on the canvas. Hank wobbles. Plumb barks once.');
          await api.say('hank', "That's a drum solo. Nobody asked for a drum solo.");
          await api.narrate('She is, very slightly, smiling. It passes quickly. Like a comet.');
        }
        await api.say('hank', 'Learn the middle. That is where it rings.');
      },
    },
    // ---------------------------------------------------------------- 6: Never took a bump
    {
      id: 'hank-6', hearts: 6, map: 'diner', title: 'Never Took a Bump',
      script: async (api) => {
        await api.narrate('The back booth, late. June sets down two slices of pie and goes away without a word. Plumb has claimed the bench under the table.', 'Hank turns her fork over, like a tool she is inspecting.');
        await api.say('hank', 'Built a thousand rings. Never took a bump in one.');
        await api.narrate('She says it like a joke. She waits for you to laugh. You can tell she has said it like a joke for a very long time.');
        await api.narrate('It is not a joke. It has never been a joke.');
        const c = await api.choose(null, [
          { label: 'Laugh with her, gently', value: 'laugh' },
          { label: "Ask: 'Do you want to?'", value: 'want' },
          { label: "Offer to spot her", value: 'spot' },
        ]);
        if (c === 'laugh') {
          await api.say('hank', "Yeah. Joke. Good one.");
          await api.narrate("She eats her pie in silence. The silence has a shape, and the shape is a thousand rings.");
        } else if (c === 'want') {
          api.hearts('hank', 30);
          await api.narrate('Hank puts the fork down. It takes her a long time. The longest pause in the history of the Hot Tag Diner, which is saying something.');
          await api.sayMood('hank', 'sad', "...Maybe. Fifty-seven years old. I've watched ten thousand people fall on my floor. I've never once been the one the ring caught.");
          await api.say('hank', "Doc would have to stand by. And Plumb. Plumb would have to be somewhere he can't see.");
          api.flag('hank_bump_wish');
        } else {
          api.hearts('hank', 15);
          await api.say('hank', "You couldn't catch a cold. ...Thanks.");
        }
        await api.narrate('Plumb thumps his tail once against the floor. It sounds a little like a drum.');
      },
    },
    // ---------------------------------------------------------------- 8: The jar of screws
    {
      id: 'hank-8', hearts: 8, title: 'Jar of Screws', when: { flag: 'grandma_in_town' },
      script: async (api) => {
        await api.narrate("Closing time at Steel Chair Hardware. Hank waits by the back door, wiping her hands on her overalls. \"Come on. Something to show you.\"");
        await api.fade();
        await api.narrate("Her workshop. Sawdust turned gold in the lamplight.", "On the workbench: a pickle jar full of old screws, bent nails, a cabinet knob, a single brass gear.");
        await api.say('hank', 'Forty years of things I found sweeping up. Never threw one out.');
        await api.narrate('She tips the jar. Everything slides in a rattling avalanche. From the very bottom she picks out one thing and holds it to the lamp.');
        await api.narrate('A red rhinestone the size of your thumbnail, chipped on one edge. It throws a drop of red light across the wall like a tiny sunset.');
        await api.say('hank', "Morning after the Broken Belt. I was seventeen. On the crew. Sweeping under the ring. This was in the sawdust.");
        await api.say('hank', "Center plate. Right out of the middle of the belt. I knew what it was the second I saw it.");
        await api.narrate('She turns it over once between thick fingers, the way she turns everything: for flaws, and for what it could still become.');
        await api.say('hank', "Same morning, Birdie asked me for a lock. Dottie's locker. One key, hers. Only lock I ever put in without asking why.");
        await api.say('hank', "Rest isn't mine to say. But I kept this. Seemed like somebody ought to keep one piece.");
        const c = await api.choose('She holds it out toward you, then stops, hand in the air.', [
          { label: "Ask what she'll do with it", value: 'ask' },
          { label: 'Close her fingers back around it', value: 'close' },
        ]);
        if (c === 'ask') {
          api.hearts('hank', 15);
          await api.say('hank', "Put it back. When it's time. A belt's only a belt with all its jewels. I can wait. I've got a jar.");
        } else {
          api.hearts('hank', 30);
          await api.narrate("You fold her fingers closed over the stone. It's hers to hold until the day it isn't.");
          await api.sayMood('hank', 'love', "...Not a thing I say a lot. Thank you.");
        }
        api.flag('hank_rhinestone');
      },
    },
    // ---------------------------------------------------------------- 10: You pick the wood
    {
      id: 'hank-10', hearts: 10, title: 'You Pick the Wood',
      script: async (api) => {
        await api.narrate("Her workshop at dawn. Three planks lean against the bench: walnut, oak, pine. A pencil behind each of Hank's ears.", "She has been up all night, and it shows only in the sawdust on her eyebrows.");
        await api.say('hank', "I've got a question. Don't answer fast.");
        await api.say('hank', "Someday you'll start a town. Somebody always does. A town needs a ring before it needs a name.");
        await api.say('hank', "I'd like to build the first one. With you. Not for. With.");
        await api.say('hank', "Let's make the next one together. You pick the wood.");
        const c = await api.choose('Three planks. One chance to be wrong, which is not possible.', [
          { label: 'Pine', value: 'pine', hint: "Like Grandma's backyard ring" },
          { label: 'Oak', value: 'oak' },
          { label: 'Walnut', value: 'walnut' },
        ]);
        if (c === 'pine') {
          api.hearts('hank', 30);
          await api.sayMood('hank', 'happy', "Pine. (She grins. It happens once a year.) Same as your grandmother's yard. Soft enough to forgive. Hard enough to hold. Good answer.");
        } else if (c === 'oak') {
          api.hearts('hank', 15);
          await api.say('hank', "Oak. Takes a bump and doesn't remember it. Good for a first town. Good for a first anything.");
        } else {
          api.hearts('hank', 15);
          await api.say('hank', "Walnut. Expensive. Honest. Nobody's ever picked walnut for a ring. ...I'm going to enjoy this.");
        }
        await api.narrate("She drags her pencil across the nearest plank and starts to sketch: a square, four posts, a tiny arrow marked NORTH.", "Under it, in small block capitals: OURS.");
        await api.say('hank', "Every ring I ever built, I built alone. Plumb, you witnessed that.");
        api.give('plank', 3);
        api.flag('hank_new_ring');
      },
    },
  ],
} satisfies DialogueSet;
