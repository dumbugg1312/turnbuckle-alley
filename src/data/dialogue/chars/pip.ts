import type { DialogueSet } from '../types';

/**
 * Pip Abernathy, 10. Fourth grader, superfan, and the undisputed Pip-weight
 * Champion of the World (cardboard division). A mark: every match is real,
 * every hero is his hero, and every villain gets booed and then waved at.
 * Never romanceable.
 */
export default {
  npc: 'pip',
  intro: [
    "HALT! Who goes there? ...Oh. You're new. Nobody's ever new.",
    "I'm Pip Abernathy. Fourth grade. Undisputed Pip-weight Champion of the WORLD.",
    "It's cardboard. But the jewels are real bottle caps. That's the realest part.",
    "Are you a wrestler? You've got wrestler shoulders. Dad says I'll get them too if I drink my milk.",
    "If you ARE a wrestler, you have to be a good one. A hero one. I'll know. I always know.",
  ],
  lines: [
    // ---------------------------------------------------------------- anytime
    { text: ["Two hundred and fourteen title defenses. Luz, Jobber, a scarecrow, and Dex.", "Dex almost had me. Dex ALWAYS almost has me."], mood: 'smug' },
    { text: "Spell 'suplex.' S-U-P-L-E-X. I'm the best speller in fourth grade. I practice on wrestling words.", mood: 'happy' },
    { text: ["I have a hermit crab named Bruiser. He moved into a new shell yesterday.", "It's a really big deal. For him."] },
    { text: "Three hundred and eight bottle caps. The gold ones go on the belt. The rest go in a jar called the Vault." },
    { text: "Dad drives the school bus and Papa runs the pharmacy. So I'm always on time AND I never have a cold.", mood: 'happy' },
    { text: ["The Mountain reads at storytime on Saturdays. I sit in the front row.", "I'm not scared. I'm just... sitting near the door. In case."], mood: 'surprised' },
    { text: ["I don't like the dark. But if there's a Mothman out there, then somebody's watching out.", "So it's fine. It's mostly fine."] },
    { text: "Agnes lets me hold Gertrude at intermission. Gertrude is her purse. It's heavier than it looks. I'm not allowed to look inside." },
    { text: "Tiny gives me a tiny cake every show. She says don't eat it in one bite. I can't help it. It's TINY.", mood: 'happy' },
    { text: ["Jobber is my rival. I gave him a bottle-cap medal because he never wins anything.", "Now he thinks HE'S the champion. He's not. I am."], mood: 'smug' },
    { text: "Lacey babysits me sometimes. Some people say she lets me win at arm-wrestling. Those people are wrong and also Lacey." },
    { text: "I want to wrestle Wanda. Dad says no. Papa says no. But Wanda bowed at me, so I think SHE said yes." },
    { text: "Luz is my best friend and my number one contender. She's Dex's sister. She thinks Dex can fly. He CAN, a little.", mood: 'happy' },
    { text: ["Dex is my hero. He lost the Pip-weight title to me eleven times.", "He cries every time. Real tears. That's how you know I'm strong."] },
    { text: "When I was little I thought the water tower was a giant turnbuckle for a giant wrestler. ...I still think that. A little." },
    { text: ["Luz and I built a fort with a ring inside. The ropes are jump ropes. The turnbuckles are pillows.", "Dad says it's a fire hazard. Papa says it's art."] },
    { text: ["Dad lets me sit right behind him on the bus. I announce every stop.", "NOW ARRIVING... ELM STREET! The big kids hate it. Dad loves it."], mood: 'happy' },
    { text: "Papa says the pharmacy is like a wrestling ring. People come in hurting and you help them back up. I think he made that up for me." },
    { text: "I'm in the spelling bee next week. If I win, I'm holding the dictionary over my head. It's heavy. I've been practicing." },
    { text: "When something good happens, you hold your belt over your head. That's the rule. I did it at lunch today. It was pizza." },

    // ---------------------------------------------------------------- strangers
    { text: "You're the new one! Everybody's talking about you. Agnes says you have nice manners. That's the biggest thing Agnes says.", when: { hearts: [0, 2] } },
    { text: "I'm not supposed to talk to strangers. But you're not a stranger. You're a wrestler. That's different. I checked.", when: { hearts: [0, 2] } },
    { text: "When's your first match? I'll make a sign. I just need to know how to spell your name. And if you like glitter.", when: { notFlag: 'debuted' }, mood: 'happy' },

    // ---------------------------------------------------------------- friends
    { text: "You're my second favorite wrestler. Dex is first. ...Okay, you're tied. Don't tell Dex.", when: { hearts: [3, 5] }, mood: 'happy' },
    { text: ["I write letters to every wrestler in town. Every week. I keep them in a shoebox.", "...I don't mail them. Don't tell anybody."], when: { hearts: [3, 5], notFlag: 'pip_letter_mailed' } },
    { text: "I'm still undisputed. You tried. Rematch anytime. I've been doing extra push-ups. Thirteen now.", when: { flag: 'pip_title_match' }, mood: 'smug' },
    { text: ["Mo carried my letter to Dex herself. She called me SIR.", "And Dex wrote back! 'Keep flying, champ.' It's in a sleeve. And another sleeve."], when: { flag: 'pip_letter_mailed' }, mood: 'love' },

    // ---------------------------------------------------------------- close
    { text: "I put your picture on my wall. Next to Dex. And next to Bruiser's tank. Bruiser likes looking at it. I can tell.", when: { hearts: [6, 8] }, mood: 'happy' },
    { text: ["Kids at school still call me Pip-squeak sometimes.", "But then I remember I have a belt. And I have you. That's two things they don't have."], when: { hearts: [6, 10], flag: 'pip_six' } },
    { text: ["Dad says being brave is being scared and doing it anyway.", "So I'm basically brave all the time."], when: { hearts: [6, 10] } },
    { text: "Every wrestler signed my belt around the edge. You're in the middle. That's the main event spot.", when: { flag: 'pip_belt_signed' }, mood: 'love' },

    // ---------------------------------------------------------------- family
    { text: ["When I grow up I'm gonna wrestle you. And you're gonna let me win.", "No. You're gonna NOT let me win, and I'm gonna win anyway."], when: { hearts: [9, 14] }, mood: 'smug' },
    { text: "Being champion is fun. But having somebody to show the belt to is funner. That's you. You're the somebody.", when: { hearts: [9, 14] }, mood: 'love' },
    { text: "Papa says having a grown-up friend is good, because they remember stuff you forget. Like where you put your other shoe.", when: { hearts: [9, 14] } },

    // ---------------------------------------------------------------- alignment
    { text: "You're a hero, right? You have to be. You held the door for Agnes.", when: { alignment: ['face'] }, mood: 'happy' },
    { text: "When you win, I hold my belt up too. So it's like we both win. That's allowed. I checked the rules. I wrote the rules.", when: { alignment: ['face'], flag: 'debuted' }, mood: 'happy' },
    { text: "BOOOO! ...Hi. BOOOO!", when: { alignment: ['heel'] }, mood: 'angry' },
    { text: "My dads say I'm not supposed to wave at villains. But you waved first. So I can wave back. That's the rule.", when: { alignment: ['heel'], hearts: [0, 4] } },
    { text: ["Why'd you go villain? Was somebody mean to you first?", "Papa says people are usually mean because somebody was mean to them first."], when: { alignment: ['heel'], hearts: [3, 14] }, mood: 'sad' },
    { text: ["I can't believe you'd do that to him! He was your FRIEND! He was nice to EVERYBODY!", "...Do you still wanna arm-wrestle, though? Just regular?"], when: { alignment: ['heel'], hearts: [0, 6], flag: 'debuted' }, mood: 'angry' },
    { text: ["I still boo you. I have to. It's the rules. But I boo you the nicest.", "Listen. ...booooo. See? That one had love in it."], when: { alignment: ['heel'], hearts: [6, 14] }, mood: 'love' },
    { text: "Dad says you're a tweener. That means in between. Like the cream in a cookie. That's the best part.", when: { alignment: ['tweener'] }, mood: 'happy' },

    // ---------------------------------------------------------------- rank
    { text: "You're in the first match! The first match is the most important. Because it's FIRST. Everybody's still awake.", when: { rank: ['rookie', 'opener'], flag: 'debuted' } },
    { text: "You're in the middle of the card now. The middle is where the snack break is. That's good real estate.", when: { rank: ['undercard', 'midcard'] } },
    { text: "You're the MAIN EVENT now! The last match! That's the most important, because it's LAST. Everybody stays up.", when: { rank: ['main', 'assistant', 'pencil', 'owner'] }, mood: 'surprised' },

    // ---------------------------------------------------------------- matches and worry
    { text: "You got hit SO hard. Papa says ice, twenty minutes on, twenty off. He's a pharmacist. You can trust him.", when: { flag: 'debuted', weekday: [3, 6], hearts: [2, 14] }, mood: 'sad' },
    { text: ["I saw your match! When you did the thing? And then the OTHER thing?", "I fell off my chair. On purpose. Mostly on purpose."], when: { flag: 'debuted', weekday: [3, 6] }, mood: 'happy' },
    { text: "When you lost I booed the other guy so hard Papa had to give me a cough drop. Are you okay? Is your arm okay?", when: { flag: 'debuted', weekday: [3, 6], alignment: ['face', 'tweener'] }, mood: 'sad' },

    // ---------------------------------------------------------------- show days
    { text: "It's a SHOW DAY! I made a sign. It has your name on it. I spelled it right. I checked three times.", when: { showDay: true, hearts: [3, 14], flag: 'debuted' }, mood: 'happy' },
    { text: ["VFW tonight! I win one bingo card every single week.", "Papa says it's luck. It's not luck. It's skill. The VFW lady says shh."], when: { weekday: [2] }, mood: 'smug' },
    { text: "Saturday is the Sportatorium! Row C, two seats from Agnes. I'll be the one standing on my chair. Don't tell Dad.", when: { weekday: [5] }, mood: 'happy' },
    { text: "Are you nervous? I'd be nervous. I'm nervous FOR you. Here. Hold the belt for a second. It helps.", when: { showDay: true, place: ['show'], hearts: [3, 14] } },
    { text: "Dad says I can stay up till nine on show nights. I'm gonna stay up till nine-oh-ONE.", when: { showDay: true, time: [1020, 1259] }, mood: 'smug' },

    // ---------------------------------------------------------------- days and weather
    { text: "Twelve push-ups and a glass of milk. For the bones. I did mine. Did you do yours?", when: { time: [360, 600] } },
    { text: "It's Friday! Pancake night! Papa makes them shaped like belts. Dad says they look like rectangles. Dad's wrong.", when: { weekday: [4] }, mood: 'happy' },
    { text: ["We learned fractions today. I already knew halves.", "Because of that belt that got broken in half a long time ago. Everybody knows that one."], when: { weekday: [0, 1, 2, 3, 4], time: [900, 1080] } },
    { text: "Shh. We're in the library. The Mountain lives here. ...He's the librarian. But ALSO I think he lives in the walls.", when: { map: ['library'] }, mood: 'surprised' },
    { text: "It's spring! Thaw Brawl is coming! I'm making a sign so big it needs two sticks. Dad says one stick. We're negotiating.", when: { season: [0] }, mood: 'happy' },
    { text: "Spring rain makes the puddles big enough for a splash off the top rope. Bruiser and I tested it. Don't tell Papa.", when: { season: [0], weather: ['rain'] } },
    { text: "Wanda's awake! She slept all winter and woke up for Thaw Brawl. Papa says that's lucky. I say she wanted good seats.", when: { season: [0] } },
    { text: "Fairgrounds Fury is in summer! Wanda defends her title! I'm sitting right by the fence so I can bow back.", when: { season: [1] }, mood: 'happy' },
    { text: "Harvest Havoc is coming. Last year somebody got thrown into a hay bale. It was the best thing I ever saw in my life.", when: { season: [2] } },
    { text: "It's cold. I wear my belt over my coat now. Champions don't get cold. Champions get a LITTLE cold.", when: { season: [3] } },
    { text: "Homecoming has a Hall of Fame. I'm gonna be in it someday. The cardboard wing.", when: { season: [3] }, mood: 'smug' },
    { text: "I'm not scared of thunder. I'm just checking under things. For reasons. The Mothman probably likes storms. That helps.", when: { weather: ['storm'] }, mood: 'surprised' },
    { text: "Sunny! Perfect day for a title defense. Want to go? No? Okay. Just know I'm ready. I'm always ready.", when: { weather: ['sun'] } },

    // ---------------------------------------------------------------- the main story, as a kid hears it
    { text: "You met Birdie? She's the COMMISSIONER. She once fined the Bruiser Twins a whole VFW paint job. That's the most money there is.", when: { flag: 'met_birdie', notFlag: 'grandma_in_town' } },
    { text: ["There's a new old lady at the Evening Bell. Agnes says she's the Duchess.", "THE Duchess. From the belt story! Is she scary? She waved at me backwards."], when: { flag: 'grandma_in_town', notFlag: 'truth_revealed' }, mood: 'surprised' },
    { text: ["Agnes says the Duchess was crying the whole time, back then. Villains don't cry.", "So maybe she wasn't a villain. Maybe she was just really, really sad."], when: { flag: 'truth_revealed', notFlag: 'reunion_done' } },
    { text: ["The Velvet Hammers WON! Agnes cried! Papa cried! Dad cried twice!", "I didn't cry. I just had a lot of feelings come out of my eyes."], when: { flag: 'reunion_done' }, mood: 'happy' },
    { text: "The Duchess sits next to Agnes now. When your music plays she stands up. So I stand up. So everybody stands up. That's how it works.", when: { flag: 'reunion_done' }, mood: 'love' },

    // ---------------------------------------------------------------- life events
    { text: "Dad says when you get married you get a tag partner forever. That's the best rule in all of wrestling.", when: { married: true }, mood: 'love' },
  ],
  gifts: {
    loves: ['trading-card', 'foam-finger', 'signed-photo', 'tiny-cake', 'merch-sign'],
    likes: ['comic', 'toy-wrestler', 'funnel-cake', 'corn-dog', 'lemonade', 'sheet-cake', 'merch-tee', 'polaroid'],
    dislikes: ['fiber', 'coffee', 'bait'],
  },
  giftReplies: {
    love: [
      "WHAT. WHAT! Is this for ME? I'm putting it in a sleeve. And then ANOTHER sleeve.",
      "This is the best day of my whole entire life. Until the next one. But this one's winning right now.",
      "I'm holding it over my head. That's what you do with the best stuff. That's the rule.",
    ],
    like: [
      "Cool! That's going on my shelf. The good shelf. Not the shelf with the rocks.",
      "Thanks! Bruiser says thanks too. He's a hermit crab, so he says it really quiet.",
      "Nice! I'm gonna show Luz. She's gonna be SO jealous. Good.",
    ],
    neutral: [
      "Okay! I'll find a place for it. Maybe the fort.",
      "Huh. Thanks! Can I pretend it's from a wrestler? Wait. It IS from a wrestler.",
    ],
    dislike: [
      "Is this... grown-up stuff? It smells like grown-up stuff.",
      "Um. I'm gonna give this to Jobber. He likes weird things. No offense.",
      "It's touching my other stuff. I don't like when stuff touches.",
    ],
    birthday: [
      "You remembered my BIRTHDAY? I'm eleven! That's double digits AND a palindrome!",
      "Best birthday ever! Papa's making belt pancakes tonight. You can come. Dad says you can. I already asked.",
    ],
  },
  birthday: { season: 0, day: 9 },
  events: [
    {
      id: 'pip-2', hearts: 2, map: 'town', title: 'Title on the Line',
      script: async (api) => {
        await api.narrate('Pip plants himself in the middle of the sidewalk. Towel cape. Taped glasses. Cardboard belt over one shoulder.');
        await api.sayMood('pip', 'angry', "{ring}! I hereby challenge you! For the Undisputed Pip-weight Championship of the WORLD!");
        await api.say('pip', 'Rules. No biting. No hair pulling. And if a car comes, we pause.');
        await api.narrate('He sinks into what he believes is a wrestling stance. It is mostly a lunge. He holds it with enormous dignity.');
        const c = await api.choose('Pip circles you, very seriously.', [
          { label: 'Wrestle to win', value: 'win' },
          { label: 'Take the most dramatic fall of your life', value: 'lose' },
        ]);
        if (c === 'win') {
          await api.narrate('You scoop him up, gently, and lay him on the grass. You count to three. He stares at the sky.');
          await api.sayMood('pip', 'sad', '...New champion.');
          await api.narrate('It lasts exactly four seconds. Then he sits bolt upright.');
          await api.sayMood('pip', 'angry', 'REMATCH. I demand a rematch. Best two out of three hundred.');
          await api.say('pip', "You can hold the belt till then. Carefully. The caps come off if you're rough.");
          api.hearts('pip', 15);
        } else {
          await api.narrate('He bumps you with one shoulder. You stagger. You sell an invisible elbow. You fall onto the lawn like a tree in a storm.');
          await api.say('pip', 'ONE! TWO! THREE!');
          await api.narrate('He counts it himself, holds the belt over his head, and takes off running around the block.');
          await api.narrate('A minute later he comes around the far corner, still running, still holding it up.');
          await api.sayMood('pip', 'happy', 'STILL... UNDISPUTED!');
          api.hearts('pip', 30);
        }
        api.flag('pip_title_match');
      },
    },
    {
      id: 'pip-4', hearts: 4, title: 'Dear Wrestler',
      script: async (api) => {
        await api.narrate('Pip is sitting on the library steps with a shoebox in his lap. The lid says TOP SECRET. Underneath, smaller: (OPEN IF FRIEND).');
        await api.say('pip', "You're a friend. So you can look.");
        await api.narrate('It is full of letters. Hundreds. Every wrestler in town, every week, in silver marker. Some have drawings. Most have stickers.');
        await api.say('pip', "I write them every Sunday. But I never mail them.", "What if they're dumb? What if Dex reads it and thinks I'm a baby?");
        const c = await api.choose('Pip holds the lid very tight.', [
          { label: "Offer to help him mail one", value: 'mail' },
          { label: "Tell him they're perfect just the way they are", value: 'keep' },
        ]);
        if (c === 'mail') {
          await api.narrate('He thinks about it for a long time. Then he digs out one envelope: TO DEX "DROPKICK" DELGADO. FULL NELSON FUEL. VERY IMPORTANT.');
          await api.fade();
          await api.narrate('The blue mailbox on Main Street. Pip holds the letter with both hands. Down the block comes Mo, satchel on her shoulder.');
          await api.say('mo', 'Is that outgoing mail, sir?');
          await api.narrate('Pip nods. He cannot speak. Mo takes off her cap, accepts the envelope, and holds it up to the light like a title belt.');
          await api.say('mo', 'Hand-delivered. Today. I will personally watch him open it.');
          await api.narrate('She tips her cap and walks on. Pip watches her go.');
          await api.sayMood('pip', 'love', "...She called me SIR.");
          api.hearts('pip', 30);
          api.flag('pip_letter_mailed');
        } else {
          await api.narrate('Pip looks down at the box. Then at you. Then he puts the lid back on, slowly, like it holds something alive.');
          await api.say('pip', "Okay. Maybe someday. When I'm brave enough.", "...You're the first person who ever saw them. That counts as mailing one. A little.");
          api.hearts('pip', 15);
        }
      },
    },
    {
      id: 'pip-6', hearts: 6, map: 'town', title: 'Pip-squeak',
      script: async (api) => {
        await api.narrate('Pip is sitting on a swing in the square, not swinging. The belt is in his lap instead of around his waist.');
        await api.say('pip', "Some kids at school call me Pip-squeak.");
        await api.say('pip', "Because I'm the smallest in fourth grade. Even smaller than Hannah, and Hannah skipped a grade.");
        await api.narrate('He turns the belt over in his hands. One of the bottle caps is coming loose.');
        await api.sayMood('pip', 'sad', "But if I'm champion of something, then it doesn't matter that I'm small. That's how belts work. Right?");
        const c = await api.choose(null, [
          { label: "The belt isn't why you matter.", value: 'true' },
          { label: 'Every champion started out small.', value: 'small' },
          { label: 'Want me to have a word with those kids?', value: 'word' },
        ], 'pip');
        if (c === 'true') {
          await api.say('pip', "...Then what is?");
          await api.narrate("So you tell him. He's the best speller in fourth grade. He boos the Mountain and goes to storytime anyway. He holds the door for Agnes.");
          await api.narrate("He made a fan sign for someone he'd known four days. He writes to every wrestler in town, every single week.");
          await api.say('pip', "...That's a lot of things.");
          await api.sayMood('pip', 'love', "That's like a whole other belt. A belt made of things.");
          api.hearts('pip', 30);
        } else if (c === 'small') {
          await api.sayMood('pip', 'surprised', 'Even the Mountain?');
          await api.narrate('You nod. Even the Mountain was a baby once.');
          await api.say('pip', "...A really big baby. Probably they needed two strollers.", "Okay. I feel better. A medium amount.");
          api.hearts('pip', 15);
        } else {
          await api.sayMood('pip', 'surprised', "No! Then they'll know I told!");
          await api.say('pip', "...But thanks. That's what a tag partner would say. That's a good thing to know.");
          api.hearts('pip', 0);
        }
        await api.narrate('He presses the loose bottle cap back into place with his thumb, very hard, until it holds.');
        api.flag('pip_six');
      },
    },
    {
      id: 'pip-8', hearts: 8, title: 'Sign the Belt',
      script: async (api) => {
        await api.narrate('Pip holds out the belt with both arms, like it weighs a hundred pounds. In his other fist is a silver marker.');
        await api.say('pip', 'Everybody signed it. Look.');
        await api.narrate("Around the edge: Dex, in huge letters. Tiny, with a little cake. A gold butterfly with no name at all. Birdie: KEEP SWINGING, SUGAR.");
        await api.narrate('Down in one corner, very small, a single growly letter E, and next to it a drawing of a tiny bird.');
        await api.say('pip', "The Mountain growled the whole time he signed. Then he drew a bird. I don't get it either.");
        await api.narrate('The middle of the belt is empty. He has kept it clean. You can tell he has had to fight to keep it clean.');
        await api.sayMood('pip', 'love', 'I saved the middle for you.');
        const c = await api.choose('What do you write?', [
          { label: 'Your ring name, nice and big', value: 'big' },
          { label: '"To the champ. From your friend."', value: 'friend' },
        ]);
        if (c === 'big') {
          await api.narrate('You sign {ring} right across the middle, big enough to read from row C.');
          await api.sayMood('pip', 'happy', "BIG! That's how main eventers sign! Everybody's gonna see it!");
          api.hearts('pip', 15);
        } else {
          await api.narrate('You write it slowly, in your best handwriting. Pip watches every letter.');
          await api.narrate("He doesn't say anything for a while. He just holds the belt and looks at it.");
          await api.sayMood('pip', 'love', '...That one is the best one.');
          api.hearts('pip', 30);
        }
        api.flag('pip_belt_signed');
      },
    },
    {
      id: 'pip-10', hearts: 10, map: 'sportatorium', title: 'My Hero Is My Friend',
      when: { showDay: true, weekday: [5], place: ['show'], alignment: ['face', 'tweener'], notFlag: 'pip_ten' },
      script: async (api) => {
        await api.narrate('Saturday night. The house lights drop. Your music hits, and two thousand people turn toward the curtain.');
        await api.narrate('You walk out into the noise. Halfway down the aisle, something in row C catches your eye.');
        await api.narrate("Pip is standing on his chair. Dad has one hand on his back. Papa has the other. He's holding up a sign.");
        await api.narrate('A crayon drawing of two people, both wearing belts, holding hands. Underneath, in silver marker: MY HERO IS MY FRIEND.');
        const c = await api.choose('The music is still playing. The crowd is still roaring.', [
          { label: 'Stop and point right at him', value: 'point' },
          { label: 'Hold your arms over your head, like a belt', value: 'belt' },
        ]);
        if (c === 'point') {
          await api.narrate('You stop in the aisle and point. Pip points back so hard he nearly falls off the chair. Both dads catch him.');
          api.hearts('pip', 15);
        } else {
          await api.narrate('You raise both arms over your head, holding an invisible belt. In row C, Pip raises his cardboard one. For a second, you match.');
          api.hearts('pip', 30);
        }
        await api.fade();
        await api.narrate('After the show, by the merch table, Pip finds you. The sign is rolled up under his arm, a little bent from all the waving.');
        await api.sayMood('pip', 'happy', 'Did you see it? Did you SEE it?');
        await api.say('pip', "Papa helped with the letters. I did the drawing. That's you. That's me. We both have belts, because in drawings you can.");
        await api.say('pip', 'You can keep it. ...No. I want to keep it.', "You can VISIT it. Anytime. It's going over my bed.");
        api.flag('pip_ten');
      },
    },
    {
      id: 'pip-10-heel', hearts: 10, map: 'sportatorium', title: 'Boo (But)',
      when: { showDay: true, weekday: [5], place: ['show'], alignment: ['heel'], notFlag: 'pip_ten' },
      script: async (api) => {
        await api.narrate('Saturday night. Your music hits, and two thousand people boo you, which is exactly how it is supposed to go.');
        await api.narrate('Halfway down the aisle, you spot row C. Pip is standing on his chair, booing louder than anyone in the building.');
        await api.narrate('He is holding up a sign. It says BOOOOOOO!! in silver marker, with extra O\'s squeezed in at the end.');
        await api.narrate('Then he flips it over. The back says, in smaller letters: (BUT YOU\'RE MY FRIEND).');
        const c = await api.choose('The crowd is still booing. Pip is still booing. He is also grinning.', [
          { label: 'Snarl at the crowd, then wink at him', value: 'wink' },
          { label: 'Stop and give him a small, villainous bow', value: 'bow' },
        ]);
        if (c === 'wink') {
          await api.narrate('You snarl at row B. Row B boos harder. Then you catch Pip\'s eye and wink. He boos so happily that Papa has to steady him.');
          api.hearts('pip', 15);
        } else {
          await api.narrate('You stop in the aisle and bow to row C, one hand on your heart, very much a villain. Pip bows back without stopping booing.');
          api.hearts('pip', 30);
        }
        await api.fade();
        await api.narrate('After the show, by the merch table, Pip finds you. His voice is completely gone. He talks anyway.');
        await api.say('pip', "I had to boo. It's the rules. I booed you the most of anybody.");
        await api.say('pip', "But I made the other side so you'd know.", "Dad says villains need friends the most. Because everybody's booing.");
        await api.sayMood('pip', 'love', "So I'm your friend. The booing kind. That's the best kind, probably.");
        api.flag('pip_ten');
      },
    },
  ],
} satisfies DialogueSet;
