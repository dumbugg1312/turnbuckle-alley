import type { DialogueSet } from '../types';

/**
 * Jobber, about 4. The raccoon who lives in the Sportatorium announce booth (and,
 * in town, in the alley trash can). Steals pretzels, loses every fight with Gus
 * over the microphone cord, raids Sheriff Bev's tomatoes at dusk, and trails Mo
 * along the creek road at dawn for crackers.
 *
 * Jobber does not speak. His lines are narrated action in (parentheses), plus
 * chitters ("brrt"). A mark in the purest sense: he believes every match is a
 * fight over pretzels, and he's not entirely wrong. His whole arc is about finally
 * winning something (6 hearts). He is NOT registered in npcs.ts yet; he is
 * reachable via the alley trash can ('jobber-can' -> talkTo('jobber', 'public')),
 * so heart events here carry no 'map' and stage their own scene changes.
 *
 * His 8-heart stash holds a Mothman clue; his 10-heart walk ends at the hatch under
 * the ring. 'jobber-10b' is the quiet sequel once 'mothman_revealed' is set.
 */
export default {
  npc: 'jobber',
  intro: [
    "(The trash can lid lifts half an inch. A pair of bandit eyes glints in the dark.)",
    "(A small gray raccoon emerges: notched ear, bottle-cap medal on a string, a tiny headset made from a hair clip, and, of course, a pretzel.",
    "He looks you up and down like a promoter sizing up a rookie.)",
    "(He chitters once, a sound like a very small engine clearing its throat. Then he holds out one paw, palm up. Your move.)",
  ],
  lines: [
    // ---------------------------------------------------------------- Strangers
    { text: "(Jobber steals your pretzel, looks you straight in the eye, and eats it slowly.)", when: { hearts: [0, 6] }, weight: 2 },
    { text: "(A pair of bandit eyes glows from inside the trash can. A tiny chitter: 'Brrt?')", when: { hearts: [0, 3] } },
    { text: "(Jobber pops out of the lid and holds up one paw, palm out. He wants a snack. He wants it respectfully.)", when: { hearts: [0, 4] } },
    { text: "(Jobber turns the bottle-cap medal on its string so the shiny side faces you. It's Pip's medal. He's very proud. He is not the champion.)", when: { hearts: [0, 10] } },
    { text: "(Jobber holds Pip's medal in both paws and polishes it on his belly, seriously, like a title-holder ahead of a defense.)", when: { hearts: [3, 10] } },
    { text: ["(Jobber sees a woman in cartoon-cow scrubs two blocks away. In one fluid motion he is back in the trash can. The lid closes.", "A tiny, muffled: 'brrt.')"], when: { hearts: [0, 10] } },

    // ---------------------------------------------------------------- The day
    { text: "(Jobber snores in the trash can. A tail the size of a feather duster waves lazily, like a flag at a very sleepy parade.)", when: { time: [540, 1020] } },
    { text: "(Jobber peeks out at dusk, rubbing his paws together like a tiny villain. Somewhere, Sheriff Bev's tomatoes feel a chill.)", when: { time: [1020, 1200] }, weight: 2 },
    { text: "(Jobber wears a very small tomato-leaf crown, with the smugness of a raccoon who has committed no crimes.)", when: { time: [1020, 1260], hearts: [3, 10] } },
    { text: ["(Jobber trots along the creek road behind Mo's mail cart, tiny and determined.", "Mo hands a cracker back over her shoulder without turning around.)"], when: { time: [330, 450] }, weight: 2 },
    { text: "(Tiny tosses a pretzel stick from the bakery doorway. Jobber catches it, bows, and vanishes in one motion.)", when: { time: [450, 600], hearts: [2, 10] } },

    // ---------------------------------------------------------------- Show days
    { text: "(Jobber hangs from the edge of the announce booth, eyeing a popcorn bucket with the focus of a man planning a heist.)", when: { showDay: true }, weight: 2 },
    { text: ["(Gus and Jobber are locked in a tug-of-war over the microphone cord.) Gus: \"Give it back! It's MY cord!\" Jobber: \"Brrrt.\"", "It is, increasingly, Jobber's cord."], when: { showDay: true, hearts: [3, 10] } },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "(Jobber, sodden, crouches under the lid like a hat. 'Brrt.' It's an accusation, aimed at the weather.)", when: { weather: ['rain'] } },
    { text: "(A thunderclap. The lid slams shut. Silence. Slowly, one paw raises the lid half an inch. A second thunderclap. The lid slams shut again.)", when: { weather: ['storm'] } },
    { text: "(Jobber has built a nest of newspaper in the trash can and is wearing a single sock as a scarf. He regards the snow with grave contempt.)", when: { weather: ['snow'] } },
    { text: "(Jobber lies belly-up on top of the trash can in the sun. He is a rug. A slightly judgmental rug.)", when: { weather: ['sun'] } },
    { text: "(Jobber carries a dandelion in his mouth like a diplomat on a mission. He offers it to a passing pigeon. The pigeon declines.)", when: { season: [0] } },
    { text: ["(Jobber follows a passerby with a corn dog for two entire blocks, not even hiding. The passerby hands over a bite.", "It's a protection racket.)"], when: { season: [1] } },
    { text: "(Jobber has found a pile of acorns and is sorting them by size. He carries the largest to the trash can like a trophy.)", when: { season: [2] } },
    { text: "(The bottle-cap medal wears a tiny scarf of tinsel. Gus did that. Gus will deny it.)", when: { season: [3] } },

    // ---------------------------------------------------------------- Alignment, rank, heart
    { text: "(Jobber sniffs your boot, shrugs, and steals a lace. Villain or hero, a lace is a lace.)", when: { alignment: ['heel'] } },
    { text: "(Jobber hops up, taps your boot, and offers you half a pretzel. He's been waiting for a hero. He's prepared to share.)", when: { alignment: ['face'], hearts: [3, 10] } },
    { text: "(Jobber salutes you, small paw to the mask, then shoves a pretzel at your chest as tribute. He has decided you outrank him.)", when: { rank: ['main', 'assistant', 'pencil', 'owner'] } },
    { text: "(Jobber drops a single shiny bottle cap on your foot and scampers off. In raccoon, it is a contract.)", when: { hearts: [3, 6] } },
    { text: "(Jobber climbs your leg to your shoulder and rides along for an entire block like a very opinionated scarf.)", when: { hearts: [6, 10] }, mood: 'happy' },
    { text: "(Jobber curls up in the crook of your elbow and goes to sleep. His paws twitch. He is dreaming about a microphone cord. This time he wins.)", when: { hearts: [9, 10] }, mood: 'love' },

    // ---------------------------------------------------------------- Story
    { text: ["(Jobber leaves a shiny bottle cap on the Evening Bell's front step. It stays there for weeks.", "The residents have started leaving him crackers.)"], when: { flag: 'grandma_in_town' } },
    { text: ["(Jobber holds a pretzel above his head like a championship belt, on top of the announce booth. The Hammers won.", "He's celebrating on behalf of a species.)"], when: { flag: 'reunion_done' }, mood: 'happy', weight: 3 },
  ],
  gifts: {
    loves: ['rhinestone', 'fish', 'sequins'],
    likes: ['corn-dog', 'chili-dog', 'funnel-cake', 'gas-hotdog', 'concha'],
    dislikes: ['tape', 'protein-shake', 'coffee'],
  },
  giftReplies: {
    love: [
      "(Jobber holds it over his head like a championship belt, then runs a full lap of the trash can.)",
      "(He clutches it to his chest, chitters wildly, and bows. He has seen Wanda bow. He is still learning.)",
      "(Jobber takes it in both paws, sniffs it, hides it under his chin, and gives you a look of complete, shining loyalty.)",
    ],
    like: [
      "(Jobber takes it, sniffs it, nods once, and stuffs it into his cheek.)",
      "(He chitters approvingly and offers you a bottle cap in exchange. A fair trade, by his standards.)",
      "(A small, sticky paw pats your hand. Thank you.)",
    ],
    neutral: [
      "(Jobber sniffs it, shrugs, and rolls it into the trash can for later consideration.)",
      "(He holds it up to the light, turns it over, and tucks it under one arm like a newspaper. A 'maybe.')",
    ],
    dislike: [
      "(Jobber sniffs it, decides it smells vaguely of vet, and leaves the building.)",
      "(He drops it as if it were hot, wipes his paws on his chest, and gives you a look of profound betrayal.)",
      "(Jobber pushes it away with one finger, climbs back into the trash can, and shuts the lid. The conversation is over.)",
    ],
    birthday: [
      "(Jobber hears the word 'birthday' and runs three fast circles, ending in a somersault. He doesn't know what it is. He's thrilled anyway.)",
      "(He accepts the gift, climbs your shoulder, and, with the dignity of a tiny king, eats it there.)",
    ],
  },
  birthday: { season: 0, day: 17 },
  events: [
    // ---------------------------------------------------------------- 2: Eye contact
    {
      id: 'jobber-2', hearts: 2, map: 'town', title: 'Eye Contact',
      script: async (api) => {
        await api.narrate("The alley, midmorning. You have a pretzel. A pair of bandit eyes has noticed.");
        await api.narrate("The trash can lid lifts half an inch. A paw emerges, curls, and vanishes with your pretzel before your brain has registered the crime.");
        await api.narrate("You peer in. A small gray raccoon sits among cans and cardboard: notched ear, bottle cap on a string, a tiny headset made from a hair clip.", "He is holding your pretzel. He is looking directly at you.");
        await api.narrate("Neither of you moves. A very long moment of eye contact. A flyer flutters down the alley.");
        const c = await api.choose(null, [
          { label: 'Hold his gaze and say nothing', value: 'gaze' },
          { label: 'Ask him, politely, to return it', value: 'ask' },
        ]);
        if (c === 'gaze') {
          api.hearts('jobber', 30);
          await api.narrate("You hold it. He holds it. A bead of sweat runs down your neck.", "Slowly, never breaking eye contact, Jobber breaks the pretzel in two with one precise paw-snap.");
          await api.narrate("He sets half on the rim of the trash can. Then he returns to his half, and eats it slowly, as if nothing had occurred.");
        } else {
          api.hearts('jobber', 15);
          await api.narrate("You ask, nicely. He chitters. It's a long speech.", "Eventually, with ceremony, he sets the empty wrapper on the lid, and then half a pretzel next to it.");
        }
        await api.narrate("You take the half. It's a little damp. It's, you decide, the most hard-won pretzel in the history of the alley.");
        await api.narrate("When you look up, the lid is already closed. From inside the can, faint and unmistakable, comes a long, contented crunch.");
      },
    },
    // ---------------------------------------------------------------- 4: The bottle cap
    {
      id: 'jobber-4', hearts: 4, title: 'The Bottle Cap',
      script: async (api) => {
        await api.narrate("Jobber hops out of the trash can and waddles up the alley, glancing back every few steps to make sure you're following. You follow.", "It seems rude not to.");
        await api.fade();
        await api.narrate("The Sportatorium announce booth, dim, smelling of popcorn and microphone foam.", "Gus sits at the console with his headphones around his neck, mid-sandwich.");
        await api.narrate("Jobber climbs to the edge of the console, ceremonially removes something from behind his ear, and sets it carefully at your feet.");
        await api.narrate("A bottle cap. Silver. Dented. Polished to a shine.");
        await api.say('gus', "Three years. Three YEARS. He's never given me anything.");
        await api.say('gus', "I gave him a name! I gave him a headset! I gave him my entire pastrami sandwich, twice!");
        const c = await api.choose('Jobber watches you, whiskers twitching.', [
          { label: 'Pocket the cap and thank Jobber formally', value: 'thank' },
          { label: 'Offer the cap to Gus', value: 'gus' },
        ]);
        if (c === 'thank') {
          api.hearts('jobber', 30);
          await api.narrate("You pick up the cap, hold it to the light like a precious gem, and bow.", "Jobber stands straight up on his hind legs and bows back, nearly falling over.");
          await api.say('gus', "...He's never bowed. He's never. What did you DO.");
        } else {
          api.hearts('jobber', 15);
          await api.narrate("You hold the cap out toward Gus. He stares at it, nearly weeping.");
          await api.say('gus', "Don't you dare. He gave it to YOU. ...But thank you. That means more than you know.");
        }
        await api.narrate("Jobber settles onto your boot like a small furry paperweight. In the dark, one tiny paw is wrapped around the microphone cord, just in case.");
      },
    },
    // ---------------------------------------------------------------- 6: The upset
    {
      id: 'jobber-6', hearts: 6, when: { showDay: true }, title: 'The Upset',
      script: async (api) => {
        await api.narrate("Jobber tugs your sleeve, and for once he isn't asking for a snack.", "You follow him into the Sportatorium and up the stairs to the announce booth. The house lights are dimming. The show's about to start.");
        await api.narrate("Gus, headset on, rolls his shoulders like a man going to war. The microphone cord lies coiled between the console and the wall.", "Jobber looks at it. Gus looks at Jobber.");
        await api.say('gus', "Not tonight, my friend. Tonight is Saturday. Tonight is a show.");
        await api.narrate("Jobber chitters, low and ominous. Then he launches.");
        await api.say('gus', "LADIES AND GENTLEMEN... the cord... it's... no. NO. GET OFF THE... JOBBER... the cord is... it's... oh my...");
        await api.narrate("The tug-of-war goes on for a full ten seconds. It is the longest ten seconds in broadcast history. Then Gus's grip slips, just an inch.");
        await api.narrate("Jobber wins. The cord goes slack in his paws. He staggers backward into a stack of programs, eyes wide, stunned, a champion in free-fall.");
        await api.narrate("In the speakers, or in your head, a sneaky little tune, tiptoeing pizzicato, finishes its fanfare for the first time ever.", "Two triumphant bars. All the way to the end.");
        await api.say('gus', "He... he won. He WON.");
        const c = await api.choose('Jobber looks at you, mortified and ecstatic.', [
          { label: 'Cheer like it\'s a title change', value: 'cheer' },
          { label: 'Quietly slide Gus a spare cord', value: 'cord' },
        ]);
        if (c === 'cheer') {
          api.hearts('jobber', 30);
          await api.narrate("You throw both arms in the air and roar. In the booth, Gus, after one long beat, joins you.", "Jobber stands up on his hind legs and holds the cord over his head like a championship belt.");
        } else {
          api.hearts('jobber', 15);
          await api.narrate("You slide a spare cord across the console. Gus takes it in both hands, stares at it, and then, slowly, hands it back.");
          await api.say('gus', "Let him have it. Just this once.");
        }
        api.flag('jobber_won');
      },
    },
    // ---------------------------------------------------------------- 8: The stash
    {
      id: 'jobber-8', hearts: 8, title: 'The Stash',
      script: async (api) => {
        await api.narrate("At dusk Jobber leads you through the Sportatorium's side door and up to the announce booth. He stops at the speaker cabinet in the corner.", "He looks at you. He opens the door with one paw.");
        await api.narrate("It's a nest.", "And inside the nest, arranged with the care of a museum curator: bottle caps, a bingo dauber, one sock, and a crumpled postal slip.");
        await api.narrate("Jobber stands guard over each item in turn, chittering a little biography of it: this cap is from the Mountain's match;", "this sock is from the bakery; this dauber is from the VFW.");
        await api.narrate("You've been invited into the treasury. You can tell. It's the most honest thing anyone has ever shown you.");
        const c = await api.choose('Jobber waits to see what you will do.', [
          { label: 'Admire every item, one by one', value: 'admire' },
          { label: 'Pick up the postal slip for a closer look', value: 'slip' },
        ]);
        if (c === 'admire') {
          api.hearts('jobber', 30);
          await api.narrate("You admire the bottle caps. You admire the sock. You admire the dauber.", "Jobber preens with every nod, tail puffing, until he's about twice his size.");
        } else {
          api.hearts('jobber', 15);
          await api.narrate("You reach for the slip. Jobber lunges and snatches it back, hissing. Then he looks at you, thinks it over, and, grudgingly, lets you see.");
          await api.narrate("SORRY WE MISSED YOU, it says, in a postal printer's clean sans. Under 'Item,' a smudge of shimmer on the pink paper.", "It glitters on your thumb like dust off a very large moth.");
        }
        await api.narrate("Jobber pats the slip back into place, tucks the sock around it, and shuts the cabinet door with one paw.", "He sits down on your foot, satisfied.");
        api.flag('jobber_stash');
      },
    },
    // ---------------------------------------------------------------- 10: The creek road
    {
      id: 'jobber-10', hearts: 10, when: { notFlag: 'mothman_revealed' }, title: 'The Creek Road',
      script: async (api) => {
        await api.narrate("Dawn. A scratching at the door.", "You open it and Jobber is on the step with a pretzel in one paw and a bottle cap in the other, as if he's brought a delegation.");
        await api.narrate("He turns and waddles off down the creek road. He looks back. You follow.");
        await api.fade();
        await api.narrate("Fog on the water. The road is empty except for the sound of a bicycle bell and a mail cart rattling ahead.", "Jobber trots behind it at a respectful distance, pretending not to.");
        await api.say('mo', "(without turning around) Morning, Jobber. ...Morning, {name}. You're up early.");
        await api.narrate("A cracker flies back over her shoulder. Jobber catches it, bows, and tucks it in his cheek.", "Then he peels off the road, leaving the mail cart to rattle on into the fog.");
        await api.narrate("He leads you through the Sportatorium's loading door, down a dark hall, to a hatch beside the ring you have never noticed.");
        await api.narrate("He stops. He turns. He looks at you with eyes like two black buttons. Then he sits on your foot and will not move.");
        const c = await api.choose(null, [
          { label: 'Sit down beside him, in the dark', value: 'sit' },
          { label: 'Scratch behind his ears', value: 'scratch' },
        ]);
        if (c === 'sit') {
          api.hearts('jobber', 30);
          await api.narrate("You sit on the cold concrete beside the hatch. Jobber climbs into your lap and curls up.", "Behind the wood, something old and warm hums, faintly, like a porch light.");
        } else {
          api.hearts('jobber', 15);
          await api.narrate("You scratch behind his ears. His eyes close. A very small purr-like noise comes out of him. His foot stays on yours.");
        }
        await api.narrate("He isn't showing you what's inside. You realize it slowly. He's guarding it. He's telling you he trusts you to guard it too.");
        api.flag('jobber_hatch');
      },
    },
    // ---------------------------------------------------------------- 10b: The quiet sequel
    {
      id: 'jobber-10b', hearts: 10, when: { flag: 'mothman_revealed' }, title: 'He Knew',
      script: async (api) => {
        await api.narrate("Dawn on the creek road. Mist on the water.", "Jobber is on the fencepost where the mail cart always passes, a pretzel in one paw and something shiny in the other.");
        await api.narrate("You sit down on the bank beside the post. Jobber hops off, circles you once, and drops the bottle cap in your lap.");
        await api.narrate("Down the road comes the rattle of a mail cart. Mo, in her postal cap, rolls to a stop without a word and puts a cracker on the post.", "Jobber takes it, bows, and sits with it between his paws.");
        await api.say('mo', "Four years he's followed me. He figured it out before anybody. He never told a soul.");
        await api.say('mo', "Don't say it to his face. He'll get a big head. Best colleague I've ever had.");
        await api.narrate("Jobber, who is certainly not listening, puffs out his chest with great concentration.");
        const c = await api.choose(null, [
          { label: 'Give Jobber the last of your pretzel', value: 'pretzel' },
          { label: 'Salute them both', value: 'salute' },
        ]);
        if (c === 'pretzel') {
          api.hearts('jobber', 30);
          await api.narrate("You hold it out. Jobber takes it, holds it over his head like a championship belt, and gives you a look of complete, shining loyalty.");
        } else {
          api.hearts('jobber', 15);
          await api.narrate("You salute. Mo salutes. Jobber, a half-second late, salutes with a cracker. It's the most solemn ceremony the creek road has ever seen.");
        }
        await api.narrate("Mo clicks the cart into gear, and rolls on into the mist. Jobber trots behind her, keeping a respectful distance.", "He doesn't need to look back. He knows exactly where you are.");
        api.flag('jobber_knew');
      },
    },
  ],
} satisfies DialogueSet;
