import type { DialogueSet } from '../types';

/**
 * Wanda, about 14. A very polite wrestling bear who lives behind the fairgrounds
 * grandstand, beside the beehives (hence the honey). Nine-time defending
 * Fairgrounds Heavyweight Champion. A mark: she believes everything, purely, and
 * every year she wins her title defense, gently, with Clint and Nadia right there.
 *
 * Wanda does not speak. Her lines are narrated body language in (parentheses),
 * with Clint, her keeper, sometimes translating. She bows before and after
 * everything. She dens from first frost until Thaw Brawl and wakes for it on cue.
 * No kayfabe to keep: she is the kindest believer in the cast.
 */
export default {
  npc: 'wanda',
  intro: [
    "(On a tree stump arranged exactly like an armchair sits a round,",
    "glossy black bear with a tan muzzle and a tiny gold crown on an elastic band.",
    "She looks at you with very polite eyes.)",
    "(She puts her front paws together and bows slowly from the waist. It is the most courteous thing anyone has ever done to you.)",
    "Clint, leaning on the fence: \"That's Wanda. Nine-time Fairgrounds Heavyweight Champion. Bow back. She'll wait all day.\"",
    "(You bow. Wanda bows deeper. You bow deeper. Clint sighs.)",
  ],
  lines: [
    // ---------------------------------------------------------------- Strangers: the etiquette of bowing
    { text: "(Wanda bows. You bow. Wanda bows deeper. Clint sighs.)", when: { hearts: [0, 4] }, weight: 2 },
    { text: "(Wanda sits on her stump like a person in an armchair, paws on her knees, and watches you with polite interest.)", when: { hearts: [0, 4] } },
    { text: "(Wanda offers one paw through the fence, palm up, like a handshake.) Clint: \"She wants to meet you properly.\"", when: { hearts: [0, 2] } },
    { text: "(Clint passes you a spoon of honey.) \"Hold it out flat. Let her take it. Don't offer it like a dare.\"", when: { hearts: [2, 6] } },
    { text: "(Wanda drags her championship belt over in her mouth, like a retriever with a newspaper, sets it at your feet, and waits to be admired.)", when: { hearts: [3, 10] } },
    { text: "(Wanda opens her mouth wide and polite, and waits. Nobody's there. She waits anyway.) Clint: \"She's expecting the vet.\"", when: { hearts: [3, 10] } },
    { text: "(A cardboard belt hangs on the fence post with a note: BEAR. I WILL RETURN. -PIP. Wanda sits next to it, guarding it.)", when: { hearts: [3, 10] } },
    { text: "(Wanda looks past you toward the fairgrounds gate, then back.) Clint: \"She's waiting on Lacey. Lacey's late. Lacey's always late.\"", when: { hearts: [3, 10], time: [840, 1020] } },

    // ---------------------------------------------------------------- The day
    { text: "(Wanda yawns, a pink and ivory yawn of tremendous size, and bows to the sunrise.)", when: { time: [330, 540] } },
    { text: "(Wanda is asleep on her stump, snoring softly. One paw twitches. She is dreaming about honey.)", when: { time: [780, 960] } },
    { text: "(Wanda sits at the fence and watches people go by, like a very large, very well-mannered neighbor on a porch.)", when: { time: [1020, 1200] } },
    { text: ["(On a misty morning, Wanda stands at the fence, staring into the fog. She bows at nothing and holds it.", "Something in the mist might bow back.)"], when: { time: [330, 450] } },

    // ---------------------------------------------------------------- Show days
    { text: "(Wanda sees the crowd gathering and sits up straight. She adjusts the tiny crown with one paw.) Clint: \"She knows when it's a show.\"", when: { showDay: true } },
    { text: "(A distant crack of pyro from the show. Wanda flinches, covers her ears, and gives you a look of enormous, bear-sized reproach.)", when: { showDay: true, time: [1080, 1380] } },
    { text: "(Agnes arrives with her purse. Wanda straightens. Agnes straightens. They regard each other like two champions at a weigh-in.)", when: { season: [1], showDay: true } },

    // ---------------------------------------------------------------- Alignment and rank
    { text: "(Wanda bows and tucks her paws together, like someone at church.) Clint: \"She says you're all right.\"", when: { alignment: ['face'], hearts: [0, 10] } },
    { text: "(Wanda regards your scowl with polite concern. Then she bows anyway. It's the nicest thing anyone's done for you all week.)", when: { alignment: ['heel'] } },
    { text: "(Wanda bows to you, deeper than before, front paws together.) Clint: \"That's the full bow. She doesn't give that out for a lunch order.\"", when: { rank: ['main', 'assistant', 'pencil', 'owner'] } },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "(Wanda regards your rain hat with deep, polite suspicion.)", when: { weather: ['rain'] }, weight: 2 },
    { text: ["(Thunder. Wanda covers both ears with her paws and hums, a low note, like a cello that is sulking.) Clint: \"Hum something back.", "She likes it.\""], when: { weather: ['storm'] } },
    { text: "(Wanda lies on her back on the sunny stump, all four paws in the air, a very polite sunbather.)", when: { weather: ['sun'], season: [0, 1, 2] } },
    { text: ["(Wanda stretches, yawns, and ambles to the fence with a sleepy, hopeful look,", "like someone who hasn't had breakfast in a whole season.) Clint: \"She hasn't.\""], when: { season: [0] }, weight: 2 },
    { text: "(Wanda sits in the pond up to her chest, watching a dragonfly with the focus of a retired judge.)", when: { season: [1] } },
    { text: ["(Wanda is eating an apple with both paws, slowly, seriously, like she is signing a treaty.) Clint: \"Fattening up. Frost's coming.", "She can feel it.\""], when: { season: [2] }, weight: 2 },
    { text: "(Under a heap of pine boughs, a mound of black fur rises and falls. Clint, softly: \"Don't wake her. She'll be up for Thaw Brawl.\")", when: { season: [3] }, weight: 3 },
    { text: "(A snow-dusted mound twitches. One sleepy paw emerges, bows once at nothing in particular, and retreats.)", when: { season: [3], weather: ['snow'] } },

    // ---------------------------------------------------------------- Heart
    { text: "(Wanda sits beside you at the fence and leans, very gently, all three hundred pounds of her, against the boards near your shoulder.)", when: { hearts: [6, 10] }, mood: 'love' },
    { text: ["(Wanda presses her forehead to the fence post near your hand and holds it there, a long, warm second.) Clint: \"That's a bear hug.", "She can't reach you through the fence. She's doing her best.\""], when: { hearts: [9, 10] }, mood: 'love' },
    { text: ["(Wanda hears the word 'Hammers' on the radio and does a slow, triumphant lap with her belt in her mouth.) Clint: \"Heard they won.", "She's very happy for them.\""], when: { flag: 'reunion_done' }, mood: 'happy' },
    { text: "(Wanda sees you and your partner at the fence. She bows to you both, then to the space between you.)", when: { married: true }, mood: 'love' },
  ],
  gifts: {
    loves: ['honey', 'pie', 'fish'],
    likes: ['corn-dog', 'funnel-cake', 'concha', 'lemonade', 'wildflowers', 'river-stone'],
    dislikes: ['gas-hotdog', 'protein-shake', 'coffee'],
  },
  giftReplies: {
    love: [
      "(Wanda presses her paws together, closes her eyes, and makes a sound like a happy cello.)",
      "(She takes it with both paws, bows to you, bows to the gift, and bows to Clint for supervising.)",
      "(Wanda holds it over her head like a championship belt, then, very politely, begins to enjoy it.)",
    ],
    like: [
      "(Wanda accepts it with a small bow, then pats the fence post twice. Thank you.)",
      "(She sniffs it, considers it, and nods. A nod from Wanda is practically a handshake.)",
      "(A gentle paw touches your hand through the fence. That's a thank-you.)",
    ],
    neutral: [
      "(Wanda looks at it. Looks at you. Sets it carefully on her stump. Later a raccoon will find it.)",
      "(She bows politely and returns to the stump, holding it like a library book.)",
    ],
    dislike: [
      "(Wanda sniffs it, recoils half a step, and bows apologetically, as if declining a very rude invitation.)",
      "(She covers her nose with one paw and looks at Clint for help.)",
      "(Wanda pushes it back toward you with a single claw. Politely. Firmly.)",
    ],
    birthday: [
      "(Wanda hears the word 'birthday' and bows so deeply she nearly tips into the pond. Then she bows to the {item}.) Clint: \"She knows. She's been practicing.\"",
      "(Wanda holds the {item} to her chest and rocks side to side, humming.) Clint: \"Birthday dance. Don't mention it. She's shy.\"",
    ],
    byItem: {
      honey: ["(Wanda takes the jar in both paws, bows to it, and does not open it. She waits.)", "Clint: \"She's waiting for the spoon. She has *manners.*\" (He hands over the spoon. She bows to the spoon.)"],
      pie: "(Wanda eats the pie in very small, very careful bites, holding the plate level with one paw, like a lady at a garden party.)",
      fish: "(Wanda takes the bluegill, carries it to the pond, rinses it once, bows to you, and eats it facing politely away.)",
      'corn-dog': "(Wanda eats the corn and gives the stick back to you. Clean. Clint: \"She returns the stick. Every time. I don't know who taught her.\")",
      'funnel-cake': "(Wanda gets powdered sugar on her nose and doesn't notice. Nobody tells her. It's the best afternoon of everyone's week.)",
      concha: "(Wanda holds the concha up to the sun like she's checking a coin, then eats the sugar top first, exactly like Pip does.)",
      lemonade: "(Wanda drinks the lemonade from the cup, very carefully, and makes a face at the sour. Then she bows, out of fairness.)",
      wildflowers: "(Wanda sniffs the flowers for a long time, sneezes once, bows, and places them on the stump beside her crown.)",
      'river-stone': "(Wanda rolls the stone between her paws, then sets it on the fence post next to Pip's cardboard belt. A collection.)",
    },
    later: [
      "(Wanda has the {lastGift} on her stump, beside the crown. Every so often she checks that it's still there.) Clint: \"She shows it to the ponies.\"",
      "Clint: \"She's been sleeping with the {lastGift} under her chin. Don't make it a thing. She's shy.\"",
    ],
  },
  again: [
    "(Wanda bows again. You bow again. Clint, from the fence: \"You two could do this till sundown.\")",
    "(Wanda turns around on her stump so her back is to you. Not rude. Just finished.)",
    "(Wanda lifts one paw a few inches. It's a wave, by bear standards.)",
  ],
  idle: [
    "(Wanda is asleep on her stump. Her crown has slipped over one ear.)",
    "(Wanda is watching a butterfly. She is not available for further comment.)",
  ],
  birthday: { season: 2, day: 14 },
  events: [
    // ---------------------------------------------------------------- 2: The honey spoon
    {
      id: 'wanda-2', hearts: 2, map: 'fair', title: 'The Honey Spoon',
      script: async (api) => {
        await api.narrate("The fairgrounds. Behind the grandstand, a wooded enclosure, a pond, and a tree stump arranged exactly like an armchair.", "On the stump sits three hundred pounds of glossy black bear in a tiny gold crown.");
        await api.narrate("Clint leans on the fence with a honey jar in one hand and a wooden spoon in the other. He passes you the spoon.");
        await api.say('clint', "Hold it out flat. Let her take it. Don't offer it like a dare.");
        await api.narrate("Wanda rises, ambles over, and stops a respectful distance from the fence. She looks at the spoon. She looks at you. Then she bows.");
        await api.narrate("You bow back. She bows deeper. You bow deeper. She bows so deep that her crown slips over one ear.");
        const c = await api.choose('This could go on forever.', [
          { label: 'Keep bowing', value: 'bow' },
          { label: 'Hold out the honey and wait', value: 'honey' },
        ]);
        if (c === 'bow') {
          api.hearts('wanda', 30);
          await api.narrate("You bow. She bows. You bow. She bows. A small crowd gathers. Someone starts a slow clap.", "It's a very serious duel, and neither of you will be the first to stand up.");
          await api.say('clint', "Okay. Okay, that's enough. You'll be here until Thaw Brawl.");
        } else {
          api.hearts('wanda', 15);
          await api.narrate("You hold the spoon steady and wait.", "Wanda straightens, delicately wraps a paw around your wrist, and takes the honey with her tongue like it's a communion wafer.");
          await api.narrate("She closes her eyes. Her whole body goes soft. Then she bows, once more, to the spoon.");
        }
        await api.say('clint', "She likes you. She doesn't bow that long for just anybody. She didn't bow that long for the mayor.");
        await api.narrate("Wanda settles onto her stump with a small, satisfied huff and re-crowns herself with one paw.");
      },
    },
    // ---------------------------------------------------------------- 4: The pinecone
    {
      id: 'wanda-4', hearts: 4, map: 'fair', title: 'The Pinecone',
      script: async (api) => {
        await api.narrate("An afternoon at the fairgrounds. Wanda is waiting at the fence when you arrive, which is unusual.", "She is holding something between her paws, very carefully, like a person carrying a full cup of tea.");
        await api.narrate("She ambles to the fence, sets it down at your feet, and steps back with great ceremony.");
        await api.narrate("It's a pinecone. A perfect one. Dusted with a little honey.");
        await api.narrate("Wanda sits. She folds her paws. She waits.");
        await api.say('clint', "She don't give pinecones to just anybody.");
        const c = await api.choose(null, [
          { label: 'Accept it with a deep bow, and keep it', value: 'bow' },
          { label: 'Ask Clint what it means', value: 'ask' },
        ]);
        if (c === 'bow') {
          api.hearts('wanda', 30);
          await api.narrate("You pick up the pinecone with both hands and bow so low your hair brushes the dirt. Wanda's ears go forward.", "She bows back, deeper, then covers her face with one paw, shy.");
          await api.say('clint', "...Huh. Never seen her do that part.");
        } else {
          api.hearts('wanda', 15);
          await api.say('clint', "It means you're on her list. It's a short list. I'm on it. The vet's on it. The pond's on it. ...You're on it.");
        }
        await api.narrate("Wanda picks up another pinecone from beside her stump and starts to chew it, thoughtfully,", "like a small fellow who has just made a friend and isn't sure what to do next.");
      },
    },
    // ---------------------------------------------------------------- 6: Thunder
    {
      id: 'wanda-6', hearts: 6, map: 'fair', when: { weather: ['storm'] }, title: 'Thunder',
      script: async (api) => {
        await api.narrate("A thunderstorm rolls in over the fairgrounds. The sky is the color of an old bruise. The pavilion's tin roof drums.");
        await api.narrate("Clint's truck is gone. A note is pinned to the fence: AT THE SPORTATORIUM. BACK SOON. DON'T FEED HER ANYTHING BUT HONEY.");
        await api.narrate("In the far corner of the enclosure, pressed into the den, is a heap of black fur. It's shaking.");
        await api.narrate("You walk to the fence and sit down in the wet grass. Wanda's eyes roll toward you: huge, wet, polite even now.");
        await api.narrate("Thunder cracks. She covers both ears with her paws and makes a tiny, thin sound that doesn't suit a three-hundred-pound bear.");
        const c = await api.choose(null, [
          { label: 'Hum her theme, a slow, polite waltz', value: 'hum' },
          { label: 'Talk quietly, about nothing', value: 'talk' },
        ]);
        if (c === 'hum') {
          api.hearts('wanda', 30);
          await api.narrate("You hum. A lumbering, sweet little waltz, tuba and glockenspiel in your throat.", "Every fourth bar you pause, the way the music does, like a bow.");
          await api.narrate("Wanda's ears turn toward you. Slowly, one step at a time, she creeps along the fence line until she's sitting inches from you.");
        } else {
          api.hearts('wanda', 15);
          await api.narrate("You tell her about the weather, and the pond, and a very good sandwich you once had. She doesn't understand a word.", "She understands the tune of it.");
          await api.narrate("She creeps across the grass, one cautious paw at a time, until she's pressed against the boards beside you.");
        }
        await api.narrate("Thunder rolls again. She doesn't flinch. She lets her cheek rest on the top rail.", "Then, very gently, she presses one paw against the fence board right beside your hand, and falls asleep.");
        await api.narrate("When Clint's truck pulls in, soaked and apologetic, he finds the two of you like that. He takes off his hat.");
        await api.say('clint', "...Huh. She never lets anybody do that.");
        api.flag('wanda_storm');
      },
    },
    // ---------------------------------------------------------------- 8: The challenger
    {
      id: 'wanda-8', hearts: 8, map: 'fair', when: { season: [1] }, title: 'The Challenger',
      script: async (api) => {
        await api.narrate("Fairgrounds Fury. The grandstand is packed.", "A ring has been set up in the middle of the field, with a bale of hay at each corner and a folding chair marked VIP (BEAR) in one.");
        await api.say('gus', "LADIES AND GENTLEMEN, YOUR REIGNING, DEFENDING, NINE-TIME FAIRGROUNDS HEAVYWEIGHT CHAMPION... WAAAAANDAAAAA!");
        await api.narrate("Wanda walks out, crown straight, belt in her mouth. She bows to the north corner. The south. The east. The west. She bows to you.");
        await api.narrate("In the front row, Clint and Nadia exchange a look: he with a honey spoon, she with a first-aid kit and an unreadable expression.");
        await api.narrate("She has chosen you as her challenger. You are, apparently, the first one in years she picked herself.");
        const c = await api.choose('The bell rings. Wanda bows. She waits.', [
          { label: 'Make a dramatic speech to the bear', value: 'speech' },
          { label: 'Hit her with your best dropkick', value: 'dropkick' },
        ]);
        if (c === 'speech') {
          api.hearts('wanda', 30);
          await api.narrate("You give the speech of your life. Honor. Home. The pursuit of honey. Wanda listens with enormous attention, one paw to her chest.", "When you finish, she bows, then, very gently, scoops you into a hug.");
        } else {
          api.hearts('wanda', 15);
          await api.narrate("You fly. You connect.", "Wanda staggers back one step, turns, regards you with great respect, bows, and then, very gently, scoops you into a hug.");
        }
        await api.say('gus', "AND THE CHAMPION RETAINS! ONE! TWO! THREE! THE BEAR IS UNDEFEATED! WANDA! WANDA! WANDA!");
        await api.narrate("You lie in the hay, held like a very large and very proud toddler. Wanda sets you down with a bow. Then she hands you something.");
        await api.narrate("A pinecone. A perfect one. A consolation prize, from the champion to the challenger.");
        await api.say('clint', "Nine defenses. Nine challengers. Nine pinecones. ...You're the only one she ever bowed to twice.");
        api.flag('wanda_challenger');
      },
    },
    // ---------------------------------------------------------------- 10: The first morning of spring
    {
      id: 'wanda-10', hearts: 10, map: 'fair', when: { season: [0] }, title: 'The Wake-Up',
      script: async (api) => {
        await api.narrate("Dawn on the first thaw of spring. Mist hangs over the fairgrounds pond. The enclosure is still.", "Under the pine boughs, a heap of black fur has stopped rising and falling.");
        await api.narrate("Clint stands at the fence with his hat in his hands, not saying anything, which is how he says everything.");
        await api.narrate("Something moves. One enormous paw. A snout. An ear.");
        await api.narrate("Wanda emerges from the den and blinks at the sun for a long, long time, like someone who has forgotten what light is for. She stretches.", "She yawns. She shakes a winter's worth of needles from her fur.");
        await api.narrate("She doesn't go toward the stump. She doesn't go toward the pond or the beehives.", "She ambles to the fence, across the whole enclosure, and stops in front of you.");
        await api.narrate("Wanda looks at you. Then she puts her paws together, and bows.");
        const c = await api.choose(null, [
          { label: 'Bow back, as low as you can go', value: 'low' },
          { label: 'Hold up a spoon of honey', value: 'honey' },
        ]);
        if (c === 'low') {
          api.hearts('wanda', 30);
          await api.narrate("You bow so low your forehead nearly touches the fence rail. Wanda holds hers.", "For a very long moment, neither of you moves, two creatures at either end of a winter, saying hello.");
        } else {
          api.hearts('wanda', 15);
          await api.narrate("You hold up the spoon. She looks at it, then at you, then she takes it so gently you don't feel a thing.", "She bows, again, this time to the honey.");
        }
        await api.say('clint', "She came out and looked for you before she looked for breakfast. Fourteen years I've known her. First time.");
        await api.narrate("Behind you, small boots crunch up the path. Pip, belt on, sign aloft: 'WANDA! WANDA, YOU'RE UP!", "I MADE A SIGN!' Wanda turns toward the sound, ears forward. She bows to Pip too.");
        api.flag('wanda_ten');
      },
    },
  ],
} satisfies DialogueSet;
