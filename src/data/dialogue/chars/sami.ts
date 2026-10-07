import type { DialogueSet } from '../types';

/**
 * Sami Haddad, 31. Charge nurse at the Evening Bell Residence and Dottie's
 * companion once she moves in. A mark: he grew up an ACW fan, is a lifelong
 * Hurricane Huang superfan, and believes every word of it, including every story
 * the Duchess tells him (in kayfabe) and he writes down.
 *
 * His rule, "Don't correct. Connect.", is the game's rule for foggy days. Memory
 * loss is handled with tender honesty and no pity: love is still in the building,
 * it's the filing system that's changing. No death anywhere.
 *
 * Romanceable. 12 = Behind the Curtain (he joins the crew as a ringside medic,
 * trained by Doc: flag 'sami_curtain'); 14 = the proposal setup at Friday dance
 * night ('sami_proposal_ready'). After the curtain he gets insider lines.
 */
export default {
  npc: 'sami',
  intro: [
    "(A man in lavender scrubs looks up from a clipboard, a bear-shaped badge reel swinging at his hip.) Oh! Visitor.",
    "Welcome to the Evening Bell. I'm Sami. Charge nurse.",
    "Butterscotch? I keep a pocketful. Hard candy is eighty percent of my bedside manner.",
    "Everyone here lives in their own present tense. Sometimes it's today. Sometimes it's 1962. Come say hello to all of them.",
    "(He lowers his voice.) Hurricane Huang teaches chair yoga here on Thursdays. I'm telling you because I'll tell everyone. I can't help it.",
  ],
  lines: [
    // ---------------------------------------------------------------- Strangers and the building
    { text: "Visiting hours are nine to five, but I'm flexible about the rules and strict about the pudding.", when: { hearts: [0, 2], map: ['sunnypines'] } },
    { text: "Don't correct. Connect. It's the whole job in three words. Everything else is paperwork.", when: { hearts: [0, 5] }, weight: 2 },
    { text: "Take two. I won't tell the dentist. Hard candy is my entire personality.", when: { hearts: [0, 5] } },
    { text: "Morning rounds. Everybody gets a good morning and a song. The song is optional. The good morning is not.", when: { time: [420, 660], map: ['sunnypines'] } },
    { text: "Tiny saves me a cardamom bun every day. I tell her it's for the residents. It is, in the sense that I'm one of the residents.", when: { map: ['bakery'] } },
    { text: ["Wednesday's the VFW show. We carry the radio into the sunroom and forty people shout at a transistor. Zero volume complaints.", "It's a miracle."], when: { weekday: [2] } },
    { text: "Dance night tonight. Ukulele, a waltz or two, and Mrs. Velma critiquing everyone's footwork in a voice you can hear from the parking lot.", when: { weekday: [4] } },
    { text: "Night class tonight. Pharmacology. I'm learning the proper names for everything already in my pockets.", when: { weekday: [1, 3], time: [900, 1260] } },
    { text: ["Saturdays I'm with the radio, doing the commentary for the residents. Badly. They give me notes.", "One show a month I go in person, and I scream like a kid."], when: { weekday: [5] } },
    { text: "Dr. Halloran does house calls Thursdays. He's never rushed. I've seen him spend twenty minutes on a single sneeze.", when: { weekday: [3] } },

    // ---------------------------------------------------------------- A mark's love of the business
    { text: ["Hurricane Huang taught chair yoga here. I carried a tray of pudding in and dropped it.", "She said, 'Good form.' I've been floating since March."], when: { hearts: [0, 10] } },
    { text: ["Did you see the Dust Devil pull her hair on the radio? I yelled at the transistor. Forty residents shushed me.", "One of them was my grandfather."], when: { place: ['public'], hearts: [0, 10] } },
    { text: "My grandfather's been booing the Duchess since 1975. Now he waltzes with her on Fridays. He's never been happier to be wrong.", when: { hearts: [0, 10], notFlag: 'sami_curtain' } },
    { text: "Heard you hit the Mountain with a leg drop. Sheriff Bev ought to give you a medal. Or a casserole.", when: { alignment: ['face'], flag: 'debuted', place: ['public'] } },
    { text: "I know you're the villain on Saturdays. But you're kind to Mrs. Olander in 6A. So: mixed feelings. I'm going to boo you softly.", when: { alignment: ['heel'], hearts: [3, 10], place: ['public'] } },

    // ---------------------------------------------------------------- Friends: the work, the honesty
    { text: "Memory loss isn't forgetting what you love. It's losing the filing system. The love's still in the building. We just can't find the drawer.", when: { hearts: [3, 10] } },
    { text: ["A resident asked me why nobody had set the table for the Fourth of July. It was February. I told her. Flat. Factual.", "She looked at me like I'd turned the lights off. Now I ask, 'Who's coming? What are we cooking?' She was happy for an hour. So was I."], when: { hearts: [3, 10] } },
    { text: ["Someday I want to open a memory café. Music, coffee, an afternoon where nobody has to remember anything right.", "You just have to be in the room."], when: { hearts: [3, 10] } },
    { text: "I'm trying my teta's kibbeh. It's a work in progress. Last time it came out shaped like a cardigan.", when: { hearts: [3, 10] } },
    { text: "My parents moved to Florida. They call every Sunday to ask when I'll settle down. I say I'm settled. I have forty roommates and a ukulele.", when: { hearts: [3, 10] } },
    { text: "The hard part isn't the forgetting. It's when the fog thins in the middle of a sentence and they know. That's the part I sit with.", when: { hearts: [6, 10] }, mood: 'sad' },
    { text: "People say she's not all there anymore. She's all there. She's just in more rooms than we are.", when: { hearts: [6, 10], flag: 'grandma_in_town' } },
    { text: ["Some days she knows me. Some days she knows a nice nurse. Some days she knows Birdie, and I'm the fellow who brought Birdie her pudding.", "I answer to all of them."], when: { flag: 'grandma_in_town', hearts: [3, 10] } },
    { text: ["Her Grace relabeled her drawers again. 'CARDIGANS. NOT FOR BORROWING, LAVINIA.' Lavinia says it was a clerical error.", "Lavinia has borrowed three."], when: { flag: 'grandma_in_town', map: ['sunnypines'] }, mood: 'happy' },
    { text: "Tuesday gin rummy: the Duchess works the table. I've never seen her win by luck. I've never seen her not win.", when: { flag: 'grandma_in_town', weekday: [1] } },
    { text: "She tells me the Velvet Hammers, every night, every move. I write them down. Forty pages. I believe every word.", when: { flag: 'grandma_in_town', hearts: [3, 10] } },
    { text: "You're not 'just' a nurse. Say it to anybody else and I'll be polite. Say it to my face and I'll bring you pudding and a lecture.", when: { hearts: [6, 10] }, mood: 'smug' },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "Rainy days everyone's a little foggier. I bring the good blankets. Warm helps. It isn't medicine. It's better.", when: { weather: ['rain'] } },
    { text: "Thunder's loud for everybody here. I keep the radio low and hum along. A little tune takes the edge off a boom.", when: { weather: ['storm'] } },
    { text: "Spring. Windows open, the whole building smells like lilac and rubbing alcohol. Apparently that's what hope smells like.", when: { season: [0] } },
    { text: "Summer. Fairgrounds Fury on the radio, and the whole west wing cheers for Wanda. Mrs. Olander has a flag. A tiny bear flag.", when: { season: [1] } },
    { text: "Fall. Leaves, cider, and thirty people asking whether it's Thursday. It's Thursday. It's always Thursday for somebody.", when: { season: [2] } },
    { text: "Winter. Homecoming on the radio, everybody in sweaters. Her Grace says she's 'dressed for the crowd.' Same cardigan. She's right.", when: { season: [3] } },
    { text: "Late shift. The halls are quiet, the night-lights are on, and somewhere a waltz is being hummed. I never find out who.", when: { time: [1260, 1439], map: ['sunnypines'] } },

    // ---------------------------------------------------------------- Dating, marriage, and after the curtain
    { text: "Every resident of the Evening Bell has an opinion about us. Velma's is eleven pages. I've read it. I'm mostly grateful.", when: { dating: true, notFlag: 'sami_curtain' }, mood: 'happy' },
    { text: "You can come to dance night anytime. Don't wear anything beige. Her Grace has views.", when: { dating: true }, mood: 'love' },
    { text: ["I carry the kit now. Doc says I'm a natural.", "I told him I've been training my whole life: carrying a bag of stuff toward somebody who's down."], when: { place: ['insider'], flag: 'sami_curtain' }, mood: 'happy' },
    { text: "Jiddo can't know. He's believed for fifty years. Telling him would be like asking him to hand back the best Fridays of his life.", when: { place: ['insider'], flag: 'sami_curtain' }, mood: 'sad' },
    { text: ["Hurricane's knee. I think about it every Thursday. It was real.", "Everything around it is made of love and rope, and I've decided that's allowed."], when: { place: ['insider'], flag: 'sami_curtain' } },
    { text: "I wake up next to my tag partner. Her Grace says I'm 'overdressed for a wedding and underdressed for a title match.' I'm both.", when: { married: true }, mood: 'love' },
  ],
  gifts: {
    loves: ['cassette', 'trading-card', 'polaroid'],
    likes: ['coffee', 'concha', 'honey', 'vinyl', 'wildflowers', 'pie'],
    dislikes: ['gas-hotdog', 'protein-shake', 'fiber'],
  },
  giftReplies: {
    love: [
      "I *had* this. My cousin traded it for a yo-yo. I'm framing it. I'm going to look at it on the hard days.",
      "(He holds it in both hands, then presses it to his chest.) You don't know what this means. Actually, you do. You always do.",
      "Oh. Oh, you're... Okay. Okay. Give me a second. I'm fine. I'm a professional. I'm crying on a hallway floor.",
    ],
    like: [
      "That's so kind. I'll put it where Her Grace can see it. She'll pretend it's hers. She'll be right.",
      "Thank you. This is going on the nurses' station. It'll be gone by lunch. That's the highest compliment.",
      "For me? Thank you! I'll share it with the third floor. They'll say it's the best thing they've had all week. They're not wrong.",
    ],
    neutral: [
      "Thank you! I'll find a use for it. Everything in this building finds a use.",
      "That's thoughtful. I'll put it in my pocket with the candy. They'll get along.",
    ],
    dislike: [
      "That's very kind of you. I'm going to put it somewhere gently and never speak of it again.",
      "Thank you. ...I'm a nurse. I'm going to have thoughts about this later. Out loud. At you. Lovingly.",
    ],
    birthday: [
      "You remembered. The whole building's going to know in four minutes. Her Grace is going to demand cake and a speech. Thank you.",
      "A birthday present. I'll tell you a secret: I get nervous on mine. All those people who know my song. ...Thank you.",
    ],
  },
  birthday: { season: 1, day: 22 },
  events: [
    // ---------------------------------------------------------------- 2: Don't correct. Connect.
    {
      id: 'sami-2', hearts: 2, map: 'sunnypines', title: "Don't Correct. Connect.",
      script: async (api) => {
        await api.narrate("The Evening Bell Residence.", "Sunlight, lavender hand soap,", "and somewhere deep in the building a transistor radio playing a polka at a volume only the very wise can tolerate.");
        await api.say('sami', 'Visitor? Wonderful. Badge, clip, and this.');
        await api.narrate('He clips a laminated VISITOR badge to your shirt, then presses a butterscotch into your hand without breaking stride.', 'Lavender scrubs, a bear-shaped badge reel, eyes with laugh lines already.');
        await api.say('sami', "Rule number one. Everyone here is living in their own present tense. Sometimes it's today. Sometimes it's 1962. It doesn't matter.");
        await api.say('sami', "Don't correct. Connect.");
        await api.narrate('A resident wheels past in a cardigan and announces to no one in particular that it is time to feed the cow. Sami nods gravely.');
        await api.say('sami', "Morning, Mrs. Olander! Cow's fed. Went well. She sends her regards.");
        await api.narrate('Mrs. Olander glows, satisfied, and rolls on. Sami glances at you: see?');
        const c = await api.choose(null, [
          { label: 'Ask how he decides what to say', value: 'how' },
          { label: 'Ask if it ever gets hard', value: 'hard' },
        ]);
        if (c === 'how') {
          api.hearts('sami', 30);
          await api.say('sami', "I don't decide. I listen for what the feeling is. 'Feed the cow' means 'I'm needed.' So we feed the cow.");
        } else {
          api.hearts('sami', 15);
          await api.say('sami', "Yes. (He doesn't look away.) And it's the best thing I've ever done. Both. All the time.");
        }
        await api.narrate("Down the hall, someone starts singing along to the polka, off-key and full of joy. Sami starts humming.", "You realize he's been humming since you walked in.");
      },
    },
    // ---------------------------------------------------------------- 4: The memory book
    {
      id: 'sami-4', hearts: 4, map: 'sunnypines', when: { flag: 'grandma_in_town' }, title: 'The Memory Book',
      script: async (api) => {
        await api.narrate("The nurses' station, late afternoon. Sami pulls a fat scrapbook out from under the counter. The cover is lavender velvet.", "Somebody has glued a rhinestone to the front.");
        await api.say('sami', "I started it her first day. A memory book. Pictures, captions, whatever she wants. In her handwriting, when she can.", "Mine when her hand's tired.");
        await api.narrate("He turns to the first page. A Polaroid of Dottie on the bed in Room 7, chin up like a queen at a coronation.", "Beneath it, in firm, looping letters: ROOM 7. THE WINDOW FACES THE MARQUEE. I CHOSE IT. -D.D.");
        await api.say('sami', 'She wrote that herself. Her hand was steady for exactly one sentence. I cried in the supply closet.');
        await api.say('sami', "Pictures are bridges. We build as many as we can. The more bridges, the more ways back.");
        const c = await api.choose('He holds the book open to a blank page, and waits.', [
          { label: 'Show him the Polaroid from Grandma\'s envelope', value: 'polaroid' },
          { label: "Promise to bring photos from the shows", value: 'promise' },
        ]);
        if (c === 'polaroid') {
          api.hearts('sami', 30);
          await api.narrate('You hold up the Polaroid: two women in sequins, back to back, one belt between them. VELVET HAMMERS. 1981. NEVER BETTER.');
          await api.narrate("Sami's breath catches. He looks at it for a long, long time. He doesn't touch it.");
          await api.sayMood('sami', 'love', "Both of them. Together. ...Page one's yours, whenever you're ready. Maybe not today. Let me ask her on a bright morning.");
        } else {
          api.hearts('sami', 15);
          await api.say('sami', "Shows, tapes, crowd shots, a homemade sign. Anything with a face in it. She'll tell me the whole story from a single elbow in the corner.");
        }
        await api.narrate("He closes the book gently, like it might wake. The rhinestone catches the light.");
        api.flag('sami_book');
      },
    },
    // ---------------------------------------------------------------- 6: Dance night
    {
      id: 'sami-6', hearts: 6, map: 'sunnypines', when: { flag: 'grandma_in_town', weekday: [4] }, title: 'Dance Night',
      script: async (api) => {
        await api.narrate('Friday. Dance night at the Evening Bell.', 'The sunroom has been cleared, the lights are down to amber, and a banner hand-lettered in marker reads DANCE OR ELSE.');
        await api.narrate('Sami sits on a stool with a ukulele on a strap.', 'Across the floor, Farid, eighty-nine, in a bow tie, bows to Dottie like she is still in her ring robe.', 'She curtsies like she still has the crown braid.');
        await api.say('sami', "That's Jiddo. He booed her at every show from 1975 to 1983. He's waited forty years to ask her for a waltz.");
        await api.narrate("They waltz. Slowly. His toes are the casualty. He looks like a man who has just won the lottery and can't tell anyone.");
        await api.narrate("Then the song changes. Sami's strum slows into something minor and wandering that you don't recognize.");
        await api.narrate("In the middle of the floor Dottie stops. She tilts her head.", "And she begins to sing, in French, every word, in a clear voice that is nothing like the one she uses to boss the pudding.");
        await api.say('sami', "(quietly, to you) I found that in a box of her old programs. A lullaby. I learned it by ear. I didn't tell her. I wanted to see if...");
        await api.narrate('The song ends. The applause is loud and slightly out of sync. Dottie curtsies.');
        await api.sayMood('grandma', 'smug', "Thank you. I'll be here all week. I live here.");
        await api.fade();
        await api.narrate('The back steps, after. Sami lets out a long breath, the ukulele across his knees.');
        await api.say('sami', "You asked me once why I came home. I never really answered.");
        await api.say('sami', "In the city I was an ICU nurse. Hundreds of people. Four days, five days each. I never learned one favorite song.");
        await api.say('sami', 'I wanted to know people long enough to learn their songs.');
        const c = await api.choose(null, [
          { label: 'Tell him he learned hers', value: 'hers' },
          { label: 'Ask what his song is', value: 'his' },
        ]);
        if (c === 'hers') {
          api.hearts('sami', 30);
          await api.sayMood('sami', 'love', "...I did. Didn't I. (He laughs, wet.) Okay. Yes. That's what I'm good at.");
        } else {
          api.hearts('sami', 15);
          await api.say('sami', "Mine? Nobody's ever asked. (He strums one soft chord.) I'll tell you when I know.");
        }
      },
    },
    // ---------------------------------------------------------------- 8: A hard day
    {
      id: 'sami-8', hearts: 8, map: 'sunnypines', title: 'Back Steps',
      script: async (api) => {
        await api.narrate('A gray afternoon at the Evening Bell. You find Sami on the back steps, scrubs jacket off, badge reel hanging loose.', 'There is a butterscotch in his hand, unopened.');
        await api.say('sami', "Hey. I'm fine.");
        await api.narrate("He isn't fine. He sets the candy down on the step beside him, carefully, as if it might break.");
        await api.say('sami', "She didn't know me this morning. Dottie. I came in with her tea and she asked who I was, and whether I was with the promoter.");
        await api.say('sami', "It's happened before. It'll happen again. That's the job. I know that.");
        await api.say('sami', 'I knew it, and I still stood in the hallway holding a cup of tea for... a while.');
        await api.sayMood('sami', 'sad', 'My job is loving people while they change. Some days I\'m good at it.');
        const c = await api.choose(null, [
          { label: 'Sit beside him and say nothing', value: 'sit' },
          { label: 'Tell him what she said about him last week', value: 'tell' },
        ]);
        if (c === 'sit') {
          api.hearts('sami', 30);
          await api.narrate("You sit down on the step next to him. The wind moves the leaves. After a while his shoulder leans, very slightly, into yours.");
          await api.narrate("Neither of you says anything for a long time. It's the most useful thing either of you has done all day.");
        } else {
          api.hearts('sami', 15);
          await api.say('sami', "...She asked for 'the nice one with the candy.' Yeah. She didn't have my name. She had me.");
          await api.narrate('He wipes his eyes with the back of his wrist, and it takes him two tries.');
        }
        await api.narrate("He opens the butterscotch, snaps it in two, and presses half into your palm.");
        await api.say('sami', "It helps. It's mostly sugar and spite.");
      },
    },
    // ---------------------------------------------------------------- 10: The Memory Café
    {
      id: 'sami-10', hearts: 10, map: 'sunnypines', when: { flag: 'grandma_in_town' }, title: 'Memory Café',
      script: async (api) => {
        await api.fade();
        await api.narrate("The Hot Tag Diner, Sunday, three o'clock. June has pushed the tables into a horseshoe and spread paper tablecloths over them.", "A sign in the window, hand-lettered: MEMORY CAFÉ. FIRST ONE. FREE. COME HUNGRY.");
        await api.narrate('The room is full. Residents in their Sunday best. Families with coffee.', 'Velma critiquing every outfit in a whisper that carries to the kitchen.');
        await api.say('sami', "Okay. Okay. Deep breath. Somebody tell me this isn't a terrible idea.");
        await api.say('june', "Baby, I gave you the room for free. It's the best idea I've ever lost money on.");
        await api.narrate('Farid is already dancing, alone, between the tables.', 'Dottie takes the stool by the jukebox like it is the Sportatorium, with the whole room as her crowd.');
        await api.say('sami', "I need someone to run the record player. It has to be someone who knows when a song is ready. ...That's you.");
        const c = await api.choose('Two records on the turntable. Which one first?', [
          { label: "The cassette Farid loves, the one Sami carries", value: 'farid' },
          { label: 'A Cajun waltz, for the Duchess', value: 'waltz' },
        ]);
        if (c === 'farid') {
          api.hearts('sami', 30);
          await api.narrate('The old Arabic pop spills out of the speakers, tinny and golden. Farid freezes mid-step.', 'Then he laughs, claps once, and drags the nearest resident into a dance.');
          await api.sayMood('grandma', 'happy', "I don't know this one. Teach me. Farid, you've been hiding things from me.");
          await api.narrate('Farid teaches the Duchess the steps. She learns them in two bars. She improves on them in three.');
        } else {
          api.hearts('sami', 15);
          await api.narrate('A slow Cajun waltz fills the diner. Dottie rises from the stool, hand to her heart.');
          await api.sayMood('grandma', 'happy', "That's a good one. Who told you? ...Never mind. Sit with me, Farid. I'll lead.");
          await api.narrate('She leads. Farid lets her. He steps on his own toes just to be thorough.');
        }
        await api.narrate("Sami stands by the counter, hands pressed to his mouth. Velma says something about the lighting. Nobody is listening.", "Everybody is exactly where they are.");
        await api.say('sami', "I want to do this every month. First Sunday. Music and coffee and nobody keeping score.");
        await api.say('sami', 'Will you run the record player every time?');
        api.flag('memory_cafe');
      },
    },
    // ---------------------------------------------------------------- 12: Behind the Curtain
    {
      id: 'sami-12', hearts: 12, map: 'sunnypines', when: { dating: true }, title: 'Behind the Curtain',
      script: async (api) => {
        await api.fade();
        await api.narrate("The Sportatorium, after midnight. Sami thinks he's here for a 'medical walk-through.' He carries his kit in both arms like a baby.", "The locker room light is on.");
        await api.narrate('Birdie sits on the bench with Doc, a ticket stub with a heart punched in it in her hand. She looks at it, then at you, then at Sami.');
        await api.say('birdie', "Sit down, sugar. What I'm about to tell you is the oldest secret in this building, and it only works because nobody tells it.");
        await api.say('doc', "Mr. Haddad. I'd like you to meet the business.");
        await api.narrate("They tell him. It doesn't take long. A few sentences. The look on his face goes from polite to lost to somewhere you can't follow.");
        await api.narrate('Sami sits down very slowly on the bench, as if the world is a patient he must not startle.');
        await api.sayMood('sami', 'sad', "Hurricane's knee. Tell me the knee was real.");
        await api.say('doc', 'The knee was real.');
        await api.say('sami', '...Okay. Okay. Then the rest of it can be whatever it is.');
        await api.narrate("He starts to laugh.", "It begins small, a puff of breath, and turns into a long, helpless, shaking laugh that turns into crying with no seam between them.");
        await api.say('sami', "Every story Dottie ever told me. They were true. And not true. Both at once. She's been telling me the whole time, hasn't she?", "In the most perfect code ever written.");
        const c = await api.choose("He looks up at you, eyes bright and wet. 'Did you know? The whole time?'", [
          { label: "I couldn't tell you. I wanted to, every day.", value: 'wanted' },
          { label: "Birdie decides who comes through the curtain.", value: 'rules' },
        ]);
        if (c === 'wanted') {
          api.hearts('sami', 30);
          await api.say('sami', "...Every day. (He laughs again.) That's the nicest thing anyone's ever said to me with a kit in their lap.");
        } else {
          api.hearts('sami', 15);
          await api.say('sami', "Rules. Of course. That's the most honest answer. It's the whole business: somebody guarding a door because the room's worth it.");
        }
        await api.say('sami', "Jiddo can't know. He's believed for fifty years. Telling him would be like asking him to hand back the best Fridays of his life.");
        await api.say('doc', 'Nobody in this business will ask you to break his heart. Keeping it is your job now.');
        await api.say('birdie', "Doc's going to train you. Ringside medic. You'll sit at the table with the bag and run toward whoever goes down.", "Sound like something you're good at, sugar?");
        await api.sayMood('sami', 'happy', "It sounds like the only thing I've ever been good at.");
        api.flag('sami_curtain');
      },
    },
    // ---------------------------------------------------------------- 14: The Tag Rope (proposal setup)
    {
      id: 'sami-14', hearts: 14, map: 'sunnypines', when: { dating: true, flag: 'sami_curtain' }, title: 'The Tag Rope',
      script: async (api) => {
        await api.narrate("Friday dance night at the Evening Bell. The residents have been conspiring for a week.", "You can tell, because everybody is acting extremely normal.");
        await api.narrate('Velma is guarding the punch bowl like a bank vault. Lavinia keeps winking.', 'Dottie, at her usual table, sits with perfect queenly composure and a very obvious smirk.');
        await api.narrate("Sami sits on his stool with the ukulele, strumming a waltz, unaware.");
        await api.narrate("In the middle of the second verse, Farid appears at his elbow, reaches into his cardigan pocket, and produces a braided turnbuckle tassel,", "wound with gold thread.");
        await api.narrate("It is, precisely, the wrong moment. The whole room says 'Farid' in a whisper. He puts it back. He makes a very theatrical 'my mistake' face.");
        await api.say('sami', '...Jiddo, what was that?');
        await api.sayMood('grandma', 'smug', "A prop, dear. For a bit. The entertainment committee has a great deal of material.");
        await api.narrate("The song ends. In the quiet after, the lights drop. Farid steps forward again, with the rope.", "This time, it's the right moment, and everybody in the room knows it.");
        const c = await api.choose('Sami stands there, ukulele hanging, looking from the rope to you.', [
          { label: 'Hold out your hand, the way you reach for a tag', value: 'tag' },
          { label: 'Take his ukulele and say it in a song', value: 'song' },
        ]);
        if (c === 'tag') {
          api.hearts('sami', 30);
          await api.narrate('You hold your hand out, palm up, the way a wrestler reaches from the apron.');
          await api.narrate("Sami looks at it. At you. At Farid. At the forty-odd residents holding their breath.", "Then he laughs, wet and astonished, and slaps his hand into yours. 'Tag.'");
        } else {
          api.hearts('sami', 15);
          await api.narrate('You take the ukulele. You play four chords you half-remember and sing the worst song of your life. A resident joins in. Then twelve.');
          await api.narrate("Sami is crying before the second line. He says 'yes' before you reach the chorus. It is not a rhyme. Nobody minds.");
        }
        await api.sayMood('grandma', 'happy', "A fine match. I'd like it noted I called it.");
        await api.narrate('Velma, from the punch bowl: "The lighting could be better." The room explodes.');
        api.flag('sami_proposal_ready', true);
      },
    },
  ],
} satisfies DialogueSet;
