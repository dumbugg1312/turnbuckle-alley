import type { DialogueSet } from '../types';

/**
 * Gus Gravel, 63. Ring announcer for ACW and host of The Gravel Pit (WRSL 1340
 * AM, 6 to 10 a.m.). Born Augusto Gravina in Pittsburgh; "Gravel" is a typo on
 * his first ring card that he never corrected. Hypes everything, calls
 * storylines as news, officially neutral and unofficially a shameless homer.
 * Weeps at every retirement, wedding and title change. Keeps every ring card
 * since 1983 in shoeboxes, one per year.
 *
 * Roommate and nemesis: Jobber the raccoon, who lives in the announce booth.
 *
 * 1983: his ninth show was the Night of the Broken Belt. His handwritten ring
 * card for that night reads "VELVET HAMMERS vs. COPPERHEAD SISTERS. Finish:
 * B. turns on D." (shown at 6 hearts). At 2:15 a.m. he drove Birdie to the bus
 * depot; the 2:10 was already pulling out ("Turn around. And Gus? This never
 * happened."). He tells it at 8 hearts once Grandma is in town.
 *
 * Flags set here: 'gus_ring_card' (6), 'gus_depot' (8), 'gus_old_thunder' (10).
 */
export default {
  npc: 'gus',
  intro: [
    "(A round, bearded man in a tuxedo jacket and a Hawaiian shirt is hugging a chrome microphone and whispering to it.)",
    "AUGUSTO GRAVINA! Gus Gravel to the *world!* ...Sorry. Habit. Hi. I'm Gus.",
    "I announce the shows. And the radio. And, on occasion, my lunch order. Old Thunder here does most of the work.",
    "In here I talk like a human. Out there I'm the voice of Turnbuckle Alley. Don't get *used* to it. ...Okay. Get used to it.",
  ],
  introPublic: [
    "(A round man in a tuxedo jacket and a loud Hawaiian shirt rises from the diner counter, one hand on a chrome microphone, and bellows:)",
    "LADIES AND GENTLEMEN! A *new face!* ...in the *Hot Tag Diner!* ...weighing in at *one very surprised newcomer!*",
    "Gus Gravel! Ring announcer! WRSL, six to ten! The voice you've been hearing in your *kitchens!* ...I'll get you a spotlight.",
  ],
  lines: [
    // ---------------------------------------------------------------- Public: the voice of the Alley
    { text: "Ladies and gentlemen... from the kitchen... weighing in at one tuna melt... and a side of SLAW!", when: { hearts: [0, 2], place: ['public'], map: ['diner'] }, weight: 3 },
    { text: "It's six a.m. in Turnbuckle Alley, sixty-one degrees, and the Mountain has not been seen since Saturday. Lock your doors, folks. Return your library books.", when: { place: ['public'], map: ['radio'], time: [360, 600] }, weight: 3 },
    { text: "(Gus lowers Old Thunder and stage-whispers.) I'm neutral. Officially. *Unofficially:* go get 'em.", when: { place: ['public'], alignment: ['face'] }, mood: 'happy' },
    { text: ["(Gus's voice drops, ominous.) Ladies and gentlemen... the *scoundrel* has *arrived.*", "...Neutral. I'm neutral. That was a neutral ominous."], when: { place: ['public'], alignment: ['heel'], flag: 'debuted' } },
    { text: "I announced my own lunch order at full ring volume yesterday. The Hot Tag applauded. June did not.", when: { place: ['public'] } },
    { text: "Tonight at the VFW! Fifty folding chairs! Bingo after! And a ring card I've been rehearsing since Monday!", when: { showDay: true, weekday: [2], place: ['public', 'show'] }, weight: 3 },
    { text: "Tonight, the SPORTATORIUM! Lights! Pyro! Confetti! And me, in a spotlight Hank swears is not a fire hazard!", when: { showDay: true, weekday: [5], place: ['public', 'show'] }, weight: 3 },
    { text: "The Mayor wants me to announce the new stop sign at Main and Second. I said yes. 'AND... NEWWWW... STOP SIGN!' It's a *tremendous* stop sign.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "Jobber and I fought over the microphone cord last night. He won. He always wins. Old Thunder thinks it was a draw. I let him think it.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "I read Clementine's reviews on air in a mournful voice. 'Two stars,' I intone. 'A snooze.' The listeners *love* it. She hates it. Best segment on the station.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "Sunday cribbage with Hank in the back room. She's beaten me fourteen hundred times. I'm one loss away from a lifetime achievement.", when: { place: ['public'], weekday: [6] } },
    { text: "Hazel Huang's forecasts. 'A storm front of one, with scattered kicks.' She writes them, I read them. We're a meteorological team.", when: { place: ['public'], hearts: [3, 10] } },
    { text: "Porch Hour! Fridays! Buck on harmonica! Me on talking! The best hour of radio in the county, and the only hour with a *harmonica.*", when: { place: ['public'], weekday: [4] }, weight: 2 },
    { text: "Pip Abernathy comes to the station Saturday mornings to 'check the weather.' I let him say the temperature on air. 'It's, uh, sixty. Degrees.' I've never been prouder of a number.", when: { place: ['public'], weekday: [5], hearts: [3, 10] }, mood: 'happy' },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "Rain! 'The sky weeps for the Mountain,' I said on air. Then I remembered Earl listens. He sent a note: 'Thank you.' I cried.", when: { weather: ['rain'], place: ['public'] } },
    { text: "Storm! Stay in, folks. Tune to 1340 AM. And for goodness' sake, leave the Bruisers' tarps alone.", when: { weather: ['storm'], place: ['public'] } },
    { text: "Snow day! Schools closed! The Gravel Pit's open! I'm the *only* thing in the county that works in a snowstorm!", when: { weather: ['snow'], place: ['public'] } },
    { text: "Wind advisory! Secure your hats! Secure your children! Secure the Mountain's library cards!", when: { weather: ['wind'], place: ['public'] } },
    { text: "Thaw Brawl's coming! I'm practicing the Big Intro in the shower. The water's very impressed.", when: { season: [0], place: ['public'] }, weight: 2 },
    { text: "Fairgrounds Fury! A bear that bows! The most *polite* main event in the history of bears!", when: { season: [1], place: ['public'] } },
    { text: "Harvest Havoc! Hay wagons! Pumpkins! I'm told there's a hay wagon in the main event. I wasn't consulted. I'm *thrilled.*", when: { season: [2], place: ['public'] } },
    { text: "Homecoming! Hall of Fame night! I weep before the first bell. Every year. It's in my contract. ...I wrote the clause.", when: { season: [3], place: ['public'] } },

    // ---------------------------------------------------------------- Insider: Gus, indoor voice
    { text: "Augusto Gravina, born Pittsburgh. Gus Gravel, born on a ring card with a typo. Guess which one got the better jobs.", when: { place: ['insider'], hearts: [0, 5] }, weight: 2 },
    { text: "The Big Intro. Fourteen seconds for a name. The secret's the vowels. You stretch the vowels, never the consonants. Consonants are *structural.*", when: { place: ['insider'] } },
    { text: "Jobber lives in my announce booth. He's a raccoon. He's my roommate. He steals my sandwiches. I've never been happier.", when: { place: ['insider'] }, mood: 'happy' },
    { text: "I cry at every retirement, wedding and title change. I'm told it's unprofessional. I'm told this by people who are also crying.", when: { place: ['insider'] }, mood: 'happy' },
    { text: "Forty shoeboxes in the booth. One per year. Every ring card. It's the best archive nobody asked for.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Forty years I've been saying other people's names into a microphone. Best job in the world. Nobody ever says yours back, though.", when: { place: ['insider'], hearts: [6, 10] }, mood: 'sad', weight: 2 },
    { text: "Hank beats me at cribbage so I'll keep coming back. I know that. She knows I know. We never discuss it.", when: { place: ['insider'], hearts: [6, 10] } },
    { text: ["On the Pit this morning I said '{opponent}' and '{ring}' in the same sentence and my coffee went cold.", "I called the {finisher} from memory. Twice. Jobber knocked over the mug. It was *radio.*"], when: { place: ['public'], lastMatch: { won: true, maxDaysAgo: 3 } }, mood: 'happy' },
    { text: "Read the results on air this morning. '{opponent} over {ring}.' I said it neutral. I'm *neutral.* My voice cracked on the second word. Neutrally.", when: { place: ['public'], lastMatch: { won: false, maxDaysAgo: 3 } } },
    { text: "I put your match card in the shoebox last night. You and {opponent}, {venue}. Name spelled right. I checked it twice. I checked it a third time for luck.", when: { place: ['insider'], lastMatch: { maxDaysAgo: 4 } } },
    { text: "Late-night radio, kid. The best audience is one person at a kitchen table in the dark. I do a show for her. She's probably asleep. I do it anyway.", when: { place: ['insider'], time: [1200, 1560] }, weight: 2 },
    { text: "You're new. When I say your name, don't look at the crowd. Pick one person. Make them the only person. The rest will follow.", when: { place: ['insider'], rank: ['rookie', 'opener'] } },
    { text: "Main event! I'll stretch your name till the rafters beg. Don't blink. I once held a name for nineteen seconds. The man fainted. He was *thrilled.*", when: { place: ['insider'], rank: ['main', 'assistant', 'pencil', 'owner'] }, mood: 'happy' },
    { text: "Show day. Throat's warm, cards are in order, and I've checked the spotlight, which Hank says is 'a joke.' I say it's a *spotlight.*", when: { place: ['insider'], showDay: true } },
    { text: "Tiny sends a tiny cake to the booth every show. Jobber eats it. I pretend I don't see. It's our arrangement.", when: { place: ['insider'], hearts: [3, 10] } },

    // ---------------------------------------------------------------- After the events, and the main story
    { text: "The first card ever. My name's wrong on it. It's still the proudest thing I own.", when: { place: ['insider'], hearts: [6, 10] } },
    { text: "That card from '83. The one with the finish. I keep it in the bottom of the box, face-down. I look at it once a year. I looked at it twice this year.", when: { flag: 'gus_ring_card', notFlag: 'gus_depot', place: ['insider'] }, mood: 'sad', weight: 2 },
    { text: "A lady at Evening Bell listens to my show every morning on a transistor radio. Sami told me. She calls in sometimes as 'a concerned listener.' I know the voice. I put her on hold. I'm saving her for the top of the hour.", when: { flag: 'grandma_in_town', place: ['insider'], hearts: [6, 10] }, mood: 'happy', weight: 2 },
    { text: "I said it out loud. The depot. Forty years. And the building didn't fall down. Huh.", when: { flag: 'gus_depot', place: ['insider'] }, mood: 'sad', weight: 2 },
    { text: "Old Thunder's yours for the Hall of Fame call. I'm just holding the cord. That's all the job ever was, kid. Holding the cord, and letting the right name through.", when: { flag: 'gus_old_thunder', place: ['insider'] }, mood: 'love', weight: 2 },
    { text: "That night, I couldn't call the finish. I just held the microphone, and Birdie and the Duchess walked out together, and the whole building said it for me.", when: { flag: 'reunion_done', place: ['insider'] }, mood: 'love', weight: 3 },
  ],
  gifts: {
    loves: ['vinyl', 'cassette', 'merch-tee'],
    likes: ['honey', 'concha', 'old-program', 'signed-photo', 'coffee', 'polaroid'],
    dislikes: ['bait', 'scrap', 'fiber'],
  },
  giftReplies: {
    love: [
      "LADIES AND GENTLEMEN... a gift! For *ME!* (He claps his own hands.) I'll treasure it for *forever* and a half!",
      "Look at that! ...I'm going to cry on the air. Buck will make fun of me. Worth it.",
      "(Gus clutches it to his chest, voice cracking.) Nobody gives a man a thing like this. Nobody. You've made my *year.*",
    ],
    like: [
      "Well, WELL! Thank you, kid! I'll put it right next to the microphone!",
      "Ha! A fine present! The kind that makes a good day *better!*",
      "Splendid! Thanks! I'll announce it on Monday. ...Don't worry. I'll be tasteful. Mostly.",
    ],
    neutral: [
      "A GIFT! For the announcer! ...What is it? I'll put it in the booth. Jobber will investigate.",
      "Why, thank you! I'll find a use. Or Jobber will.",
    ],
    dislike: [
      "...Dead air. (A long, theatrical pause.) You've given me *dead air.*",
      "Thank you. I'll announce that I received it. In a very small voice.",
      "Mm. I'll put this somewhere I don't have to announce it.",
    ],
    birthday: [
      "LADIES AND GENTLEMEN, on this, the first day of fall... a {item}! For the birthday boy! (He's already tearing up.) Sixty-four years old and *undefeated* at birthdays.",
      "The first of fall. First show of the season. First *everything.* And a {item}. I'll announce you at every intro this week. You can't stop me. I own the microphone.",
    ],
    byItem: {
      vinyl: ["A RECORD! Ladies and gentlemen, a 1984 pressing! (He reads the label.) ...Oh, I know this one.", "I played it on air the week it came out. Somebody's entrance music. I'll play it Monday. I'll say where I got it."],
      cassette: "A mixtape! PUMP UP JAMS 4 SAT! Some kid's Saturday, in my hands! I'm putting it on the Porch Hour. Buck will harmonize. Buck harmonizes with *everything.*",
      'merch-tee': "YOUR SHIRT! I'm wearing it to the station under the Hawaiian. Nobody will see it. *I'll* know. Jobber will know.",
      honey: "Honey! For the throat! A voice like mine is a public utility, kid. You've just maintained the infrastructure.",
      concha: "A concha! Rosa's! The pink kind! I'll eat it on air. The listeners love chewing sounds. They don't. I do.",
      'old-program': "1979! Look who's on the card! ...Look who announced it. That's not me. That's Hal Buckner. He had a voice like a bathtub. I was so jealous I could spit.",
      'signed-photo': "Signed! In silver! It's going on the booth wall, right above Jobber's bed, where he can resent it.",
      coffee: "Coffee! For the six a.m.! You know what's on the radio at six a.m.? ME. Because of COFFEE.",
      polaroid: "A crowd shot! The front row on its feet! I can hear it from here. You can hear a photo, if you were there. I was there. I'm always there.",
    },
    later: [
      "I mentioned the {lastGift} on the Pit this morning. 'A gift from a listener.' Three people called in to ask who. I said: a *friend of the program.*",
      "Jobber's been sleeping next to the {lastGift}. In the booth. I don't have the heart to move him. He looks so *official.*",
    ],
  },
  again: [
    "And we're BACK! ...Sorry. Old habit. What'd I miss? Nothing. We just talked.",
    "(Gus taps the microphone twice. Off the air. Indoor voice.) Still here, kid. Still here.",
    "Ladies and gentlemen, a RETURN APPEARANCE! (quietly) I'm on in four minutes.",
  ],
  idle: [
    "(Gus is reading a ring card to himself, lips moving, stretching every vowel.)",
    "Can't chat. Jobber's got the mic cord again and I'm negotiating.",
  ],
  birthday: { season: 2, day: 1 },
  events: [
    // ---------------------------------------------------------------- 2: The Big Intro, at the Hot Tag
    {
      id: 'gus-2', hearts: 2, map: 'diner', title: 'The Big Intro',
      script: async (api) => {
        await api.narrate("The Hot Tag at noon. The lunch rush is at full roar, forks clinking, a baby crying in booth six. You walk through the door, and a voice cuts through all of it.");
        await api.say('gus', "LADIES... AND... GENTLEMEN!");
        await api.narrate("The room freezes mid-bite. At the counter, a round man in a tuxedo jacket has risen from his stool with a chrome microphone, and June, without being asked, flicks the pendant lamp over your head. It lights you like a stage.");
        await api.say('gus', "Standing at a height of... *roughly five-foot-something!* Weighing in at one very *determined* hundred-and-some pounds! Hailing from the *MYSTERIOUS CITY!*");
        await api.say('gus', "...{ring}!!!");
        await api.narrate("He holds the last vowel for fourteen seconds. A man at the back stands up. A woman faints, a little, on purpose. The entire diner is clapping.");
        const c = await api.choose('Gus lowers the microphone, beaming, waiting for your reaction.', [
          { label: 'Take a deep, ridiculous bow', value: 'bow' },
          { label: 'Boo him. Loudly. In character.', value: 'boo' },
          { label: '"Actually, I\'m five-nine."', value: 'stats' },
        ]);
        if (c === 'bow') {
          api.hearts('gus', 30);
          await api.narrate("You bow. Gus wipes his eyes with his sleeve and mouths 'beautiful.' Somebody throws a napkin like confetti.");
          await api.say('gus', "A bow! The new ones never bow! Oh, I'll announce you a *thousand* times. I'll announce you at your wedding!");
        } else if (c === 'boo') {
          api.hearts('gus', 30);
          await api.narrate("You boo. The diner joins in. Gus grips his microphone in rapture.");
          await api.say('gus', "A *heckler!* The best kind! The *loving* kind! I'm going to cry! I'm going to cry on a *tuna melt!*");
        } else {
          api.hearts('gus', -10);
          await api.narrate("There's a pause. Gus lowers the microphone slowly.");
          await api.say('gus', "Five-nine. It doesn't *ring.*");
          await api.narrate("He sits back down. The napkin dispenser gets a long, baleful stare. He doesn't announce anyone else for the rest of lunch.");
        }
        await api.narrate("Behind the counter, June catches your eye, rolls her eyes with great, affectionate tolerance, and slides a cup of coffee in front of your seat before you've sat.");
      },
    },
    // ---------------------------------------------------------------- 4: The weather
    {
      id: 'gus-4', hearts: 4, map: 'radio', when: { time: [360, 600] }, title: 'Rhyme or Reason',
      script: async (api) => {
        await api.narrate("WRSL 1340 AM, a cramped, wood-paneled studio that smells like coffee and carpet. A red ON AIR sign glows. A fat chrome microphone sits on a stand. In the corner, a raccoon is asleep on a stack of ring cards.");
        await api.say('gus', "(Whispering.) That's Jobber. Don't wake him. He's my engineer.");
        await api.say('gus', "I'm live in forty seconds. Pull up the stool. You're doing the weather.");
        await api.narrate("He slides a weather card across the desk. On it, in his looping handwriting, today's forecast. Beneath, in smaller letters, he's scrawled: *(Rhyme encouraged.)* Underlined three times.");
        await api.narrate("The red light blinks. Gus grips the microphone, and his voice drops two octaves into pure honey.");
        await api.say('gus', "Good morning, Turnbuckle Alley! This is the *Gravel Pit!* And joining me, a *very special guest,* with today's forecast. Take it away.");
        const c = await api.choose('Gus points at you. The red light is on. Four hundred kitchen radios across town are listening.', [
          { label: 'Read it in rhyme', value: 'rhyme' },
          { label: 'Read it like a villain promo', value: 'villain' },
          { label: 'Read it straight. Just the facts.', value: 'straight' },
        ]);
        if (c === 'rhyme') {
          api.hearts('gus', 30);
          await api.say('player', "It's a quarter to seven in the Alley, and the sky's a gentle gray. So grab a coat, and bring a smile, and have a splendid day.");
          await api.say('player', "If thunder rolls in later, don't you panic, don't you flee. It's only the Mountain clearing his throat. Return your books by three.");
          await api.narrate("Gus, hand pressed to his chest, mouths 'a poet.' A tear slides down into his beard.");
        } else if (c === 'villain') {
          api.hearts('gus', 30);
          await api.say('player', "Today's forecast... the sun has been *dealt with.* The clouds... will *answer.* And the wind... is *unlisted.* Dress accordingly.");
          await api.narrate("Gus slaps the desk. Jobber wakes up, sees you, hisses, and goes back to sleep.");
        } else {
          api.hearts('gus', 15);
          await api.say('player', "Partly cloudy. Sixty-one. Winds from the west. Chance of rain this afternoon.");
          await api.narrate("There's a very long, very silent beat. Gus leans toward the microphone and speaks in a voice of deep reverence.");
          await api.say('gus', "Accurate. Efficient. As dull as dishwater. ...I *love* it. This station needs one honest man.");
        }
        await api.narrate("The phone line blinks. Gus presses a button. A very small, very serious voice crackles through the speaker: \"That was the best weather *ever.*\" It's Pip. Pip is calling from the school office. He has been told not to.");
        await api.say('gus', "That's a five-star review, folks. That's the first five-star review I've ever gotten for a *forecast.*");
      },
    },
    // ---------------------------------------------------------------- 6: Ring cards
    {
      id: 'gus-6', hearts: 6, map: 'diner', title: 'Misspelled',
      script: async (api) => {
        await api.narrate("Gus is at the Hot Tag counter with a battered shoebox under his arm, and, for the first time since you've known him, he is not announcing anything. He tilts his head at the back booth.");
        await api.fade();
        await api.narrate("The back booth. He sets the shoebox on the table. Taped to the lid, in faded marker: 1983.");
        await api.say('gus', "Forty boxes. This is the one that matters. I'm going to show you two cards. One's silly. One isn't.");
        await api.narrate("He lifts out a curling piece of cardboard stained with a perfect coffee ring. The handwriting is shaky, a boy's printing: *TONIGHT: DAN THE MAN vs. THE ROOKIE. ANNOUNCER: GUS GRAVEL.*");
        await api.say('gus', "My first card. The regular announcer lost his voice on a Tuesday, so Birdie handed me the microphone. I'd been on the ring crew a year. I was terrified. I wrote the card myself.");
        await api.say('gus', "Know what's wrong with it? My name. I'm Gravina. Augusto Gravina. I wrote it down wrong, in my own hand, from nerves. Birdie read it out. The crowd cheered 'Gravel.' I never corrected it.");
        await api.sayMood('gus', 'happy', "Gravel's a better name than Gravina. It's got *texture.* It's the best typo I ever got.");
        await api.narrate("He sets the card down, very gently. Then he reaches back into the box and stops.");
        await api.say('gus', "The second one's from my ninth show. October. 1983.");
        await api.narrate("He takes out a card. A single line, in firm, round handwriting, and a coffee ring that wasn't there on the first. He turns it face-up on the table.");
        await api.narrate("*VELVET HAMMERS vs. COPPERHEAD SISTERS. FINISH: B. TURNS ON D.*");
        await api.say('gus', "That was the plan. That was the finish. A breakup. Birdie turns on Dottie. We were building to a reunion at Homecoming. The Encore. It was all booked.");
        await api.sayMood('gus', 'sad', "That's not what happened.");
        const c = await api.choose('The card sits between you, in the light from the booth lamp.', [
          { label: '"So why did she change it?"', value: 'why' },
          { label: 'Ask if you can hold it', value: 'hold' },
          { label: 'Say nothing. Let him have the silence.', value: 'quiet' },
        ]);
        if (c === 'why') {
          api.hearts('gus', 15);
          await api.say('gus', "I don't know, kid. Forty years I've asked myself. I wrote the card. I was *there.* I still don't know.");
        } else if (c === 'hold') {
          api.hearts('gus', 30);
          await api.narrate("He nods. You lift the card by its edges, the way you'd hold a photograph of someone you've never met.");
          await api.say('gus', "That's the handwriting of a kid who thought he knew how a story ended. I've never been so wrong in my life.");
        } else {
          api.hearts('gus', 30);
          await api.narrate("You don't say a word. He looks at the card for a long time. For once, there's no microphone for him to hold on to.");
          await api.say('gus', "...Thank you. Nobody ever lets me be quiet. They keep waiting for the next announcement.");
        }
        api.flag('gus_ring_card', true);
        await api.narrate("He puts the first card back in the box, and the second one face-down at the very bottom.");
        await api.say('gus', "Don't tell Birdie I showed you. She's never asked to see it. That's the part I can't get past.");
      },
    },
    // ---------------------------------------------------------------- 8: The depot
    {
      id: 'gus-8', hearts: 8, map: 'diner', when: { flag: 'grandma_in_town' }, title: 'Two-Fifteen',
      script: async (api) => {
        await api.narrate("Gus takes the stool beside you at the counter, orders a black coffee, and says nothing. This is, for Gus, a medical event.");
        await api.say('gus', "Back booth. I'd like to say something in the indoor voice. Will you? I don't think I can say it in any other.");
        await api.fade();
        await api.narrate("The back booth. No microphone. No shoebox. Just a man in a Hawaiian shirt, with both hands flat on the table.");
        await api.say('gus', "October, 1983. My ninth show. After the belt, after the Duchess walked out through the crowd, I went to the back. Birdie was standing by the curtain. She was white as the canvas.");
        await api.say('gus', "She said, 'Gus. Drive me.' I said where. She said, 'Just drive.'");
        await api.narrate("He turns his coffee cup a quarter-turn, then another.");
        await api.say('gus', "Two a.m. The bus depot. Her whole face was saying *hurry.* I hurried. Every light was green. I've gone over the route a thousand times.");
        await api.say('gus', "We got there at two-fifteen. The two-ten was already pulling out. The taillights were at the end of the road.");
        await api.sayMood('gus', 'sad', "Birdie got out of the car. Stood there. Took one step toward it. And stopped.");
        await api.say('gus', "She got back in. She said, 'Turn around.' And then, very quietly: 'And Gus? This never happened.'");
        await api.say('gus', "I've kept it forty years. It's the only promise I ever kept that made me sad.");
        const c = await api.choose(null, [
          { label: '"It wasn\'t your fault, Gus."', value: 'fault' },
          { label: '"It stays between us."', value: 'promise' },
          { label: '"Why tell me now?"', value: 'why' },
        ]);
        if (c === 'fault') {
          api.hearts('gus', 30);
          await api.narrate("Gus pulls his big 1970s headphones off his neck and sets them on the table. His hands are shaking.");
          await api.say('gus', "Five minutes. That's all it was. I think I could've been faster. I've never said that out loud. ...It's something, hearing somebody say 'it wasn't.'");
        } else if (c === 'promise') {
          api.hearts('gus', 30);
          await api.say('gus', "Thank you. I wasn't sure I could be the one to tell it. I just knew it was getting too heavy to keep.");
        } else {
          api.hearts('gus', 15);
          await api.say('gus', "Because I don't think it's a secret anymore, kid. I think it's a debt. And I think you're the one who knows who to pay it to.");
        }
        api.flag('gus_depot', true);
        await api.narrate("He stands, and for a moment you think he'll announce something. He doesn't. He just rests a hand on your shoulder, very briefly, the way you'd touch a good luck charm.");
        await api.say('gus', "She can't hear it from me. Not yet. When she's ready, she'll tell it herself. She's got a better voice for it than mine.");
      },
    },
    // ---------------------------------------------------------------- 10: Old Thunder
    {
      id: 'gus-10', hearts: 10, map: 'radio', title: 'Say Your Own Name',
      script: async (api) => {
        await api.narrate("The WRSL booth, dusk. The ON AIR sign is dark. Jobber is asleep on the ring cards. Gus sits in the big chair holding Old Thunder across his knees, like a man cradling something with a pulse.");
        await api.say('gus', "Homecoming's coming. The Hall of Fame broadcast. Forty years I've done it alone. I'd like a co-host. I'd like it to be you.");
        await api.say('gus', "You'll read the inductees. You'll say the hard names. I'll do the vowels. We'll do the tears together.");
        await api.narrate("He turns the microphone over in his hands. The chrome is worn through at the grip, a dull patch the shape of a thumb.");
        await api.say('gus', "This is Old Thunder. Ring announcer's mic since 1971. I've never let anybody else hold it. Not the Mayor. Not the Pope. I've never *met* the Pope.");
        await api.narrate("He holds it out to you.");
        await api.say('gus', "Say your own name into it, kid. Like you mean it.");
        const c = await api.choose('The microphone is warm from his hands.', [
          { label: 'Say your ring name, big and ridiculous', value: 'ring' },
          { label: 'Say your real name. Quietly.', value: 'name' },
          { label: 'Say *his* name. "Ladies and gentlemen... Gus Gravel."', value: 'gus' },
        ]);
        api.hearts('gus', 30);
        if (c === 'ring') {
          await api.narrate("You draw a breath, stretch every vowel, and let it go. The little studio shakes. Jobber falls off the ring cards.");
          await api.say('gus', "The *Big Intro!* You did the Big Intro! Fourteen seconds! Do you know what that means? You're *family!*");
        } else if (c === 'name') {
          await api.narrate("You say it low, plain, the way you'd tell someone across a kitchen table.");
          await api.narrate("Gus's lips part. He doesn't speak. He has never, in forty years, heard his microphone sound like that.");
          await api.say('gus', "...That's the best one I ever heard. And it wasn't loud.");
        } else {
          await api.narrate("You grip the microphone, stand, and give it everything: every vowel, every consonant, the whole fourteen seconds, aimed straight at the man in the Hawaiian shirt.");
          await api.say('player', "LADIES... AND... GENTLEMEN... *GUS... GRAVEL!*");
          await api.narrate("Gus doesn't move. A tear runs down into his waxed mustache. Then another. His shoulders begin to shake.");
          await api.sayMood('gus', 'sad', "Forty years. Forty years I've said every name in this building. And nobody... nobody ever...");
          await api.say('gus', "Thank you. Oh, kid. Thank you. That's the first time anybody's ever said it *back.*");
        }
        api.flag('gus_old_thunder', true);
        await api.narrate("He takes the microphone from you gently, wipes the grip on his sleeve, and sets it on the desk between you, an equal distance from each.");
        await api.say('gus', "Hall of Fame night. You and me. And Old Thunder. And, if the stars are kind, two women who haven't been in the same building in forty years.");
        await api.narrate("He looks at the dark red light of the ON AIR sign for a moment, as if it might come on by itself.");
      },
    },
  ],
} satisfies DialogueSet;
