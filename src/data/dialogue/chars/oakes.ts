import type { DialogueSet } from '../types';

/**
 * Mayor Delphine Oakes, 61. Mayor of Turnbuckle Alley for twelve years. A mark:
 * to Delphine wrestling is the town's greatest civic asset and a genuine sport of
 * honor. She files formal protests against villains in triplicate, declares hero
 * victories town holidays, and presents champions with keys to the city (Hank
 * makes them; they open nothing).
 *
 * Boundless booster with a planner's brain and a pageant queen's stamina. Her
 * heart: daughter Simone, 34, in finance in the city, whose calls are getting
 * shorter. She wants a town somebody would drive home to. She was Miss Turnbuckle
 * Alley 1983 and got her crown in a church basement. She waves every dawn to a
 * figure in an orange poncho and has never once wondered about it.
 */
export default {
  npc: 'oakes',
  intro: [
    "(A tall woman with a silver afro and pageant posture, in a red pantsuit with a homemade sash reading MAYOR,",
    "extends a hand like she's presenting an award.) Delphine Oakes.",
    "Mayor. Twelve years and counting.",
    "Welcome to Turnbuckle Alley! Population two thousand and one, counting you. Landmark: the water tower. Legend: the Duchess.",
    "Snack: Agnes's pie.",
    "(She pats the gold ceremonial scissors holstered at her hip.) I cut a ribbon for every new thing.",
    "Sometimes I cut one before I know what the thing is. It saves time.",
    "If you need anything, I'm at Town Hall. If I'm not at Town Hall, I'm jogging. If I'm not jogging, I'm cutting something.",
  ],
  lines: [
    // ---------------------------------------------------------------- Civic life
    { text: "With these scissors, I declare this new trash can... OPEN FOR BUSINESS!", when: { place: ['public'], hearts: [0, 4] }, weight: 2 },
    { text: ["Every great town has three things: a landmark, a legend, and a snack. We have a turnbuckle-shaped water tower, a Duchess, and Agnes's pie.", "We are *complete.*"], when: { hearts: [0, 5] } },
    { text: "A pothole is a civic wound. I've named the one outside the diner. It's Gerald. Gerald will be filled by Friday.", when: { hearts: [0, 6], place: ['public'] } },
    { text: "Garden club's Tuesday. We've voted on tulips. The tulip faction is winning. The dahlias are in a very sullen minority.", when: { weekday: [1] } },
    { text: "Monday council meeting. We're debating the Fireworks Ordinance. The Mountain's pyro has been classified as 'weather.'", when: { weekday: [0] } },
    { text: "I present the bingo prizes at the VFW every Wednesday. Tonight's grand prize: a casserole and a very large certificate.", when: { weekday: [2] } },
    { text: "My VIP seat at the Sportatorium is a folding chair with a sash on it. Finest seat in the county. Don't tell Agnes.", when: { weekday: [5] } },
    { text: "Dawn jog complete! Three miles, two waves, one near-collision with a raccoon. He was holding a pretzel. He did not yield.", when: { time: [330, 540], map: ['town'] } },
    { text: ["Every dawn I wave to a lovely figure in an orange poncho and a red headlamp on the creek road. I've never gotten a name. Very polite.", "A little shy."], when: { hearts: [3, 10], time: [330, 600] } },
    { text: "Late night at Town Hall. A mayor's work is never done. Mostly because I keep adding to it.", when: { time: [1200, 1439] } },

    // ---------------------------------------------------------------- Her schemes
    { text: "Picture it: the World's Largest Folding Chair. Forty feet tall, welded by Hank. I have the plans. Hank has the opinions.", when: { hearts: [3, 10] }, weight: 2 },
    { text: "The tram to the fairgrounds. Eight minutes, glass sides, a gift shop. The council said 'why.' I said 'why NOT.'", when: { hearts: [3, 10] } },
    { text: ["The Wrestling Hall of Fame museum is happening. I have the dream, the plans, and the confidence. I need the building and the funding.", "We'll see."], when: { hearts: [3, 10] } },
    { text: ["I'm pursuing a sister-city pact with Abuela Celia's hometown in Mexico. Nine letters, in Spanish, with Rosa's help.", "Abuela corrected them in red. I framed them."], when: { hearts: [3, 10] } },
    { text: "A man from MaxxMedia keeps courting me with lunches. The food is excellent. The contract is a gourmet trap.", when: { hearts: [0, 6], place: ['public'] } },

    // ---------------------------------------------------------------- Her belief
    { text: "A hero in my town! I'll have Hank cut you a key to the city. It opens nothing. Hank was very clear. I'm still saying 'symbolically.'", when: { alignment: ['face'], flag: 'debuted' } },
    { text: ["Your victory over {opponent} has been entered into the municipal record. Item four, between the sewer bond and a goat.", "The goat was also a victory. A different kind."], when: { lastMatch: { won: true, maxDaysAgo: 5 }, alignment: ['face', 'tweener'] }, mood: 'happy' },
    { text: "I have drafted a formal letter to {opponent} regarding their conduct toward you at {venue}. In triplicate. One copy is scented.", when: { lastMatch: { won: false, maxDaysAgo: 5 }, alignment: ['face', 'tweener'] }, mood: 'angry' },
    { text: "As mayor, I am filing a formal complaint, in triplicate, about your conduct and your boots.", when: { alignment: ['heel'], flag: 'debuted', place: ['public'] }, weight: 2 },
    { text: "I've submitted your name for a commendation. One copy for the city, one for you, one for the pigeons.", when: { hearts: [3, 10], flag: 'debuted' } },
    { text: "Birdie Malone and I spar over permits every spring. I'd rather be fined by her than praised by anyone else.", when: { hearts: [3, 10] } },
    { text: "Sheriff Bev and I have an understanding. She arrests villains, I commemorate them. It's a partnership.", when: { hearts: [3, 10], place: ['public'] } },
    { text: "Gus announces municipal news at full volume. 'DOG LICENSES ARE DUE.' Most effective public-service campaign in state history.", when: { hearts: [3, 10] } },
    { text: ["In 1983 I was Miss Turnbuckle Alley. I was to be crowned in the ring at the big Homecoming show.", "Then the belt broke and the show vanished. I got my crown in a church basement, with a punch bowl. It was lovely. It wasn't a ring."], when: { hearts: [6, 10] }, mood: 'sad' },
    { text: "The Duchess is back in town! I filed a complaint in 1983 and never received a reply. I'd like it noted. I'd also like her autograph.", when: { flag: 'grandma_in_town', notFlag: 'truth_revealed', place: ['public'] }, mood: 'surprised' },

    // ---------------------------------------------------------------- Heart
    { text: ["Simone's in finance, in the city. She calls on Sundays. The calls are getting shorter. I tell myself it's the time zone.", "It's not a time zone."], when: { hearts: [4, 10] }, mood: 'sad' },
    { text: "Simone's building has a fountain in the parking garage. I asked if anybody sits by it. She said, 'Nobody sits, Mom.'", when: { hearts: [6, 10], place: ['public'] }, mood: 'sad' },
    { text: "I leave the porch light on every night. Simone hasn't been home since Easter. I've changed the bulb twice. I keep the receipts in a drawer.", when: { hearts: [8, 10] }, mood: 'sad' },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "Rain! Excellent for the garden, dreadful for the parade route. I'll move the parade. I'd move the *rain* if I had to.", when: { weather: ['rain'] } },
    { text: "Thaw Brawl's coming! I've drafted a proclamation. It rhymes. Don't ask me to read it. (Pause.) Do ask me to read it.", when: { season: [0] }, weight: 2 },
    { text: "Fairgrounds Fury! I present the bear with a ribbon every year. She accepts with great dignity. I was once less dignified at the same event.", when: { season: [1] } },
    { text: "Harvest Havoc! The annual hay-bale inspection is complete. All bales are structurally sound and emotionally ready.", when: { season: [2] } },
    { text: ["Homecoming. I've been to every Hall of Fame induction for twelve years. I cry at the same part every time. Nobody's ever caught me.", "You didn't see that."], when: { season: [3] } },
  ],
  gifts: {
    loves: ['lemonade', 'bouquet'],
    likes: ['polaroid', 'old-program', 'wildflowers', 'honey', 'yarn', 'funnel-cake'],
    dislikes: ['gas-hotdog', 'scrap', 'fiber'],
  },
  giftReplies: {
    love: [
      "(She clutches it to her chest, pageant posture faltering.) Is this official? It feels official. I'll frame it and file it. In that order.",
      "OH. Oh! This is exactly what the town needs. I'm taking it straight to council. I'll give you credit. In large print.",
      "This is going in the time capsule. We don't have a time capsule. We do now. I'll cut a ribbon on it.",
    ],
    like: [
      "How thoughtful! I'll put it on my desk beside the scissors. They'll be very good friends.",
      "Thank you kindly. The town and I are grateful. Mostly me. But the town, too.",
    ],
    neutral: [
      "How generous. I'll file it under 'miscellaneous civic.'",
      "Thank you! I'll find a place for it. Possibly the lost-and-found. With honor.",
    ],
    dislike: [
      "I'm going to say 'thank you' very formally, and then I'm going to put this where I don't have to see it.",
      "A gift! ...Is this in violation of the town code? I'll check. I'll check *twice.*",
      "(A pageant wave, slightly strained.) Thank you. Truly. I'll compost it. Ceremonially.",
    ],
    birthday: [
      "The fourth! My birthday! A {item}! I'm declaring today a municipal feast day. Retroactively, it always was.",
      "A birthday {item}! For the mayor! I'm cutting a ribbon on it. Hold the other end.",
    ],
    byItem: {
      lemonade: "Fair lemonade! Shaken by hand! I drank one of these in 1983 in a sash, waiting for a crown. This one tastes better. Less waiting.",
      bouquet: ["Flowers! For the mayor! (She holds them like she's been handed an award, which, in a way, she has.)", "These are going on the council table. The dahlia faction will see them and despair."],
      polaroid: "A crowd at the Sportatorium! Civic engagement! I'm putting this in the Town Hall lobby beside the zoning map. It's more inspiring than the zoning map.",
      'old-program': "A 1979 card! Look at the ad on the back: 'Visit Turnbuckle Alley!' Somebody had my job before me, and they had no budget either.",
      wildflowers: "Wildflowers from the creek. Unofficial flowers. I'll put them in an official vase.",
      honey: "Local honey! I'm going to mention this in my next proclamation. It'll rhyme with 'money.' Everything does, eventually.",
      yarn: "Yarn! I'll knit a sash. For the bear. She deserves a sash. She has more dignity than half the council.",
      'funnel-cake': "Funnel cake! Mayors are not supposed to eat funnel cake on Main Street. (She's already eating it.) Mayors are allowed to break one rule a year.",
    },
    later: [
      "The {lastGift} is on my desk at Town Hall, next to the ceremonial scissors. I've labeled it A GIFT FROM A CONSTITUENT.",
      "I mentioned the {lastGift} in council. Nobody asked. I mentioned it anyway. It's in the minutes now.",
    ],
  },
  again: [
    "Back so soon? Excellent turnout! Twice in one day! I'll note it.",
    "(Mayor Oakes is mid-ribbon. She mouths 'one second' and cuts.)",
    "We've met! I've met so many people today. I remember you, though. You're the one I've met twice.",
  ],
  idle: [
    "(Mayor Oakes is practicing a speech to a pigeon. The pigeon has heard it.)",
    "Can't stop! A ribbon is waiting! It doesn't know it yet!",
  ],
  birthday: { season: 1, day: 4 },
  events: [
    // ---------------------------------------------------------------- 2: Key to the city
    {
      id: 'oakes-2', hearts: 2, map: 'town', when: { flag: 'debuted' }, title: 'Key to the City',
      script: async (api) => {
        await api.narrate("Main Street, midmorning.", "A crowd of three (one pigeon, one Pip, and one woman in a crimson pantsuit with a sash reading MAYOR) blocks your path.", "She holds out an enormous pair of gold scissors.");
        await api.say('oakes', "Citizen! Stand where the light's good. The *town* demands it!");
        await api.narrate("She snips a ribbon across the sidewalk that wasn't there a second ago. Pip applauds. The pigeon doesn't.");
        await api.say('oakes', 'On behalf of the people of Turnbuckle Alley, I present you with this: a key to the city.');
        await api.narrate("It's a hand-cut brass key the length of your palm, still warm from Hank's workshop, a ribbon of civic red looped through the bow.");
        await api.say('oakes', "It opens nothing. Hank checked. Twice. Symbolically, it opens everything.");
        const c = await api.choose(null, [
          { label: 'Accept it solemnly, hand over heart', value: 'solemn' },
          { label: 'Ask which door it doesn\'t open', value: 'door' },
        ]);
        if (c === 'solemn') {
          api.hearts('oakes', 30);
          await api.narrate('You put your hand over your heart. The mayor does too, pageant posture perfect, lip trembling.');
          await api.sayMood('oakes', 'happy', "Twelve years. Nobody's ever put a hand over their heart. They just say thanks and eat the cookie.");
        } else {
          api.hearts('oakes', 15);
          await api.say('oakes', "All of them! That's the genius of it. No door can resist a key that tries nothing.");
        }
        await api.narrate("She tucks the scissors back into their holster and waves at the pigeon, who has not moved.", "It's not clear if she's saluting the pigeon or the idea of pigeons.");
        api.flag('oakes_key');
      },
    },
    // ---------------------------------------------------------------- 4: The scheme binder
    {
      id: 'oakes-4', hearts: 4, map: 'town', title: 'The Binder',
      script: async (api) => {
        await api.fade();
        await api.narrate("Town Hall, the mayor's office. A framed photograph of the water tower. Four filing cabinets, one labeled MISCELLANEOUS SCHEMES (BIG).");
        await api.say('oakes', 'Come. Sit. Behold, the binder.');
        await api.narrate("She opens it on the desk with both hands, like scripture. Tabbed pages: THE WORLD'S LARGEST FOLDING CHAIR. THE TRAM. THE MUSEUM.", "SISTER CITY. Each one with a hand-drawn rendering, and a tiny mayor waving from the top of it.");
        await api.say('oakes', "People say, 'Delphine, scale back.' I say a town is a promise. Promises should be tall.");
        await api.narrate("Near the back, one page isn't a scheme. It's a photograph.", "A girl of about eight, in a cardboard championship belt, scowling magnificently at the camera.");
        await api.say('oakes', "That's Simone.");
        const c = await api.choose(null, [
          { label: 'Ask about Simone', value: 'simone' },
          { label: 'Say the tram is brilliant', value: 'tram' },
        ]);
        if (c === 'simone') {
          api.hearts('oakes', 30);
          await api.say('oakes', "She's in finance, in the city. She calls on Sundays. ...She wanted to be the Duchess, at eight. A villain!", "She said villains get the best belts.");
          await api.narrate('The mayor touches the photograph with one finger and then, very quickly, turns the page.');
        } else {
          api.hearts('oakes', 15);
          await api.sayMood('oakes', 'happy', "Finally, an ally! I'll draft a ribbon. I'll draft a ribbon for the ribbon-cutting.");
        }
      },
    },
    // ---------------------------------------------------------------- 6: Simone and the short calls
    {
      id: 'oakes-6', hearts: 6, map: 'town', title: 'The Sunday Call',
      script: async (api) => {
        await api.fade();
        await api.narrate("Town Hall, after hours. One lamp. The mayor sits at her desk with a rotary phone in front of her, hands folded, not touching it.", "A clock ticks.");
        await api.say('oakes', "Sunday. Six o'clock. She'll call. She's always on time. It's the one thing I taught her.");
        await api.narrate("At six exactly the phone rings.", "Delphine lifts the receiver and her whole body changes: spine straight, smile on, voice bright as the Fourth of July.");
        await api.say('oakes', "Simone, baby! ...No, no, we're fine. The tram's going well. ...Mm-hm. ...Of course. Of course you do. ...I love you.");
        await api.narrate('The call lasts four minutes. When she hangs up, her shoulders sink an inch. It is the first time you have seen the mayor look her age.');
        await api.say('oakes', "I want this town to be big enough that she'd want to come home. Is that foolish?");
        const c = await api.choose(null, [
          { label: "It's not foolish.", value: 'notfoolish' },
          { label: "Have you told her that?", value: 'told' },
        ]);
        if (c === 'notfoolish') {
          api.hearts('oakes', 30);
          await api.narrate('She looks up at you, eyes bright, chin lifted. The pageant posture is back.');
          await api.say('oakes', "...Thank you. It's the nicest thing anyone's said in a year. And I've had a *proclamation.*");
        } else {
          api.hearts('oakes', 15);
          await api.say('oakes', "I tell her everything. Every Sunday. I just say it in a way that sounds like a weather report.");
        }
        await api.narrate('She switches off the lamp. The phone sits in the dark like a very patient animal.');
      },
    },
    // ---------------------------------------------------------------- 8: Exhibit D
    {
      id: 'oakes-8', hearts: 8, map: 'town', title: 'Exhibit D',
      script: async (api) => {
        await api.fade();
        await api.narrate("Town Hall, midday. A courier in an unseasonably clean jacket has just delivered a thick envelope embossed with a very blue logo.", "Delphine reads the cover letter aloud like a person walking toward a cliff.");
        await api.say('oakes', "A national television partnership! The town on every screen. Imagine it! Imagine Gus. On *Tuesdays.*");
        await api.say('oakes', "But there are terms. And conditions. And a document called 'Exhibit D.' I have never trusted anything called Exhibit D.");
        await api.narrate("She slides the contract across the desk. You read with her. Page 11, clause 14(c): ACW's best shows would move to a studio in the city.", "Page 23: talent shall be pooled. Page 31: regional branding to be harmonized.");
        await api.say('oakes', "'Harmonized.' (She says it like a swear.) They'd harmonize us right out of town.");
        const c = await api.choose(null, [
          { label: 'Tell her to tear it up', value: 'tear' },
          { label: 'Suggest negotiating a better deal', value: 'negotiate' },
        ]);
        if (c === 'tear') {
          api.hearts('oakes', 30);
          await api.narrate('She stands. She takes the contract in both hands. She holds it above her head for a long, theatrical second.');
        } else {
          api.hearts('oakes', 15);
          await api.say('oakes', "Negotiate? With Exhibit D? ...No. No. Some contracts you don't negotiate. You *retire* them.");
        }
        await api.narrate('She tears it in half, right down the middle, the sound like a very small thunderclap in Town Hall.');
        await api.narrate("Then she tapes both halves to the wall, side by side, under a hand-lettered sign: NEVER AGAIN. IN TRIPLICATE.");
        await api.sayMood('oakes', 'happy', "Every town needs a reminder. Mine is a ripped contract and a roll of masking tape.");
        api.flag('oakes_deal_torn');
      },
    },
    // ---------------------------------------------------------------- 10: Homecoming
    {
      id: 'oakes-10', hearts: 10, map: 'sportatorium', when: { season: [3], showDay: true }, title: 'Why Didn\'t You Tell Me',
      script: async (api) => {
        await api.narrate("Homecoming week at the Sportatorium.", "Delphine's VIP seat, a folding chair with a white sash draped across the back, has company: a second folding chair, no sash,", "set exactly three inches from the first.");
        await api.narrate("A woman in a sleek city coat sits in it, phone dark in her lap. Thirty-four.", "Her mother's cheekbones, her mother's posture, her own stunned face.");
        await api.say('oakes', "(very quietly) Simone, baby, you don't have to stay for the whole thing.");
        await api.narrate("The house lights drop. The crowd rises with a sound you can feel in your teeth. Water-tower blue sweeps the ceiling.", "Simone grips the arm of her chair.");
        await api.narrate("Halfway through the opening bout, she leans over to her mother, and you're close enough to hear.");
        await api.narrate("\"Mom. Why didn't you tell me this place was like this?\"");
        await api.say('oakes', "I did, baby. Every phone call.");
        await api.narrate("Simone stares at her mother. Then at the ring. Then she starts to laugh, one hand pressed over her mouth, her eyes wet and bright.");
        const c = await api.choose(null, [
          { label: 'Slide a spare foam finger across to Simone', value: 'finger' },
          { label: 'Give them the aisle, and a nod', value: 'nod' },
        ]);
        if (c === 'finger') {
          api.hearts('oakes', 30);
          await api.narrate("You hand Simone a foam finger. She takes it, baffled, then raises it over her head with a sheepish half smile.", "The mayor takes her hand and raises it higher.");
        } else {
          api.hearts('oakes', 15);
          await api.narrate("You step back.", "The mayor catches your eye over her daughter's shoulder and mouths the words, 'Thank you,' with the whole of her pageant face.");
        }
        await api.sayMood('oakes', 'love', "Twelve years I've been putting this town on the map. I had no idea the map was for her.");
        api.flag('oakes_simone');
      },
    },
  ],
} satisfies DialogueSet;
