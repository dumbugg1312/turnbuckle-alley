import type { DialogueSet } from '../types';

/**
 * Dorothy "Dottie" Dupree, the Duchess. The player's grandmother.
 *
 * Before 'grandma_in_town' she exists as Sunday payphone calls at the Hot Tag
 * and letters in plum ink. After it, Evening Bell (map 'sunnypines', the
 * sunroom, full of marks) and her own room ('grandma-room'). Both count as
 * public places, so she speaks emotional truth there but never business truth;
 * that waits for the back booth.
 *
 * Memory: good days and foggy days, never a meter. Foggy lines lean toward late
 * afternoon and evening. She sometimes calls the player "Bird." The humor is
 * always her wit, never her confusion. On foggy days there is no wrong answer.
 */
export default {
  npc: 'grandma',
  intro: [
    "(Grandma Dottie sits very straight on the edge of the bed, cardigan buttoned one button off. She sees you and lights up like a marquee.)",
    "There you are. Come here, chère. Let me look at you. ...Stand up straight. There. Now you look like somebody.",
    "You walk like her now. All shoulders, like the floor owes you money. She ruined you. Good.",
    "Sit. Tell me everything. And if I ask you twice, tell me twice. I'm worth it.",
  ],
  lines: [
    // ---------------------------------------------------------------- Before she moves: the Sunday payphone
    { text: "(The payphone crackles.) Chère! Is the water tower still shaped like a turnbuckle? Don't lie to me. Describe the bolts.", when: { notFlag: 'grandma_in_town', hearts: [0, 5] }, mood: 'happy', weight: 2 },
    { text: "Does June still burn the toast? She burned it on purpose once, in '82, so a promoter would leave. He left. He never came back.", when: { notFlag: 'grandma_in_town' } },
    { text: "Tell me about the house. Does the porch swing still hold? Sit in it for me. Gently. That swing is older than your knees.", when: { notFlag: 'grandma_in_town', hearts: [0, 5] } },
    { text: "Did you eat today? You didn't. I can hear you not eating. There's a whole diner wrapped around that phone, chère.", when: { notFlag: 'grandma_in_town' } },
    { text: "I hear a limp in your voice. Fifty years of listening to wrestlers walk down hallways. Ice it. Then call me. No. Sunday.", when: { notFlag: 'grandma_in_town', flag: 'debuted' } },
    { text: ["Does she still wear that awful jacket? The red velvet one?", "...Good. Good. Don't tell her I asked."], when: { notFlag: 'grandma_in_town' }, mood: 'sad' },
    { text: "What did Birdie teach you this week? Say it back to me. ...Ha! She stole that from me in 1974. Don't tell her I said so.", when: { notFlag: 'grandma_in_town', flag: 'met_birdie' } },
    { text: "My neighbor plays her stories so loud I know every soap opera in America. Everybody in them has amnesia. Very relatable, chère.", when: { notFlag: 'grandma_in_town', hearts: [3, 10] }, mood: 'smug' },
    { text: "Raining there too? Same storm, I bet. Everything goes through Turnbuckle Alley first, then it comes to me. Always has.", when: { notFlag: 'grandma_in_town', weather: ['rain', 'storm'] } },
    { text: "It's a show day. I can hear it in your voice. Go. Tape your wrists. Call me Sunday and tell me every single thing.", when: { notFlag: 'grandma_in_town', showDay: true } },
    { text: "You DEBUTED? And you're telling me on a payphone? Chère. Describe every second. Start with the walk to the ring.", when: { notFlag: 'grandma_in_town', flag: 'debuted', rank: ['rookie', 'opener'] }, mood: 'surprised', weight: 3 },
    { text: "Is Agnes still in A1? Still swinging that purse? She hit me with it once. Best shot anybody ever landed on me, and I mean that.", when: { notFlag: 'grandma_in_town' } },
    { text: "I was the showboat, you know. Bird threw the punches, and I made them beg for them. That's a team. Two halves of one good idea.", when: { notFlag: 'grandma_in_town', hearts: [3, 10] } },
    { text: "Sometimes I lose a word. Like a sock in the wash. It turns up later, in a sleeve. Don't fuss, chère. I don't.", when: { notFlag: 'grandma_in_town', hearts: [3, 10] } },
    { text: "I keep a calendar by the phone with every Saturday circled. I don't need it. I just like circling them. It's like booking a show.", when: { notFlag: 'grandma_in_town', hearts: [6, 10] } },
    { text: ["(A long pause on the line.)", "...I'm here. I was just listening to the diner behind you. The forks. The bell on the door. I missed the forks."], when: { notFlag: 'grandma_in_town', hearts: [6, 10] }, mood: 'love' },
    { text: ["(A letter, in plum ink.)", "'Chère. Enclosed: one recipe (chili), one dollar (jukebox), one opinion (stand up straight). Love, G.'"], when: { notFlag: 'grandma_in_town', hearts: [0, 5] } },
    { text: ["(A postcard of the city skyline. On the back, in plum ink:)", "'Ugly. Come home for me. Kidding. Stay right where you are. Learn everything. D.'"], when: { notFlag: 'grandma_in_town' } },
    { text: ["(A letter, in plum ink.)", "'Did the azaleas come up by the porch? I planted them in 1976. Tell them I said they're doing fine. They like to hear it.'"], when: { notFlag: 'grandma_in_town', season: [0] }, weight: 2 },
    { text: ["(A letter, in plum ink, the handwriting a little larger than last time.)", "'I watched the snow and thought of you. Wear the scarf. You don't have the scarf. Buy a scarf. G.'"], when: { notFlag: 'grandma_in_town', season: [3] }, weight: 2 },

    // ---------------------------------------------------------------- Evening Bell: her room, good days
    { text: "A room with a window. I can read the marquee from my bed, chère. Saturday's card, every letter. Best seat in town.", when: { flag: 'grandma_in_town', map: ['grandma-room'], hearts: [0, 5] } },
    { text: "Sami labeled my drawers. I relabeled them. 'CARDIGANS. NOT FOR BORROWING, LAVINIA.' She knows what she did.", when: { flag: 'grandma_in_town' }, mood: 'smug' },
    { text: "(She glances at the hatbox under the bed, the way you check that a door is locked.) Don't mind me. Old habit.", when: { flag: 'grandma_in_town', map: ['grandma-room'], hearts: [3, 10] } },
    { text: "Hank rewired that vanity for me. Bulbs all the way around. A girl ought to see herself the way the crowd does. Lit.", when: { flag: 'grandma_in_town', map: ['grandma-room'] } },
    { text: "I lined my sneakers up toes out, like a locker room. Sami asked why. I said so I can leave in a hurry. He laughed. I didn't.", when: { flag: 'grandma_in_town', map: ['grandma-room'], hearts: [3, 10] } },
    { text: "The body remembers the match, chère. The mind's just the girl who writes it all down, and some days she's lazy.", when: { flag: 'grandma_in_town' } },
    { text: "Don't quiz me. 'Do you remember me?' Of course I do. I remember everybody. Some days I just can't find the file.", when: { flag: 'grandma_in_town' } },
    { text: "I can't tell you what I had for breakfast. I can tell you every hold in the Fairgrounds Riot of '79. Choose your priorities, chère.", when: { flag: 'grandma_in_town' }, mood: 'smug' },
    { text: "They brought me eggs this morning. There's egg on the fork, so either I ate them or the fork did. I'm choosing to believe in myself.", when: { flag: 'grandma_in_town', time: [360, 720] } },
    { text: "I cheat at gin rummy, chère. I only confess when I win. So I'm always confessing. It's very good for the soul.", when: { flag: 'grandma_in_town' } },
    { text: "You walk different now. Like the floor owes you money. That's Birdie in your hips, chère. Good. Keep it.", when: { flag: 'grandma_in_town', hearts: [3, 10] } },
    { text: "Is she still sweeping the ring herself? Singing? Off-key? ...Ha. She never could find a note with both hands and a map.", when: { flag: 'grandma_in_town', notFlag: 'reunion_done' }, mood: 'happy' },
    { text: "When the marquee lights come on, I say goodnight to them. Don't you tell anybody. Especially not the marquee.", when: { flag: 'grandma_in_town', notFlag: 'reunion_done', time: [1080, 1560] } },
    { text: "Three blocks. I walked to the corner today. You can see her back door from there. I stood a while. Then I came home.", when: { flag: 'grandma_in_town', notFlag: 'truth_revealed', hearts: [3, 10] }, mood: 'sad', weight: 2 },
    { text: "Don't tell her I'm here. She knows. The whole town knows. But don't you be the one to tell her.", when: { flag: 'grandma_in_town', notFlag: 'truth_revealed' } },
    { text: "I'm sorry. That's the only line I'd change, if they let me rewrite the whole card. Just the last line. Make it 'I'm sorry.'", when: { flag: 'grandma_in_town', notFlag: 'truth_revealed', hearts: [6, 10] }, mood: 'sad', weight: 2 },

    // ---------------------------------------------------------------- Evening Bell: the weekly rhythm
    { text: "Monday. Hair day. Gideon comes at ten and treats me like visiting royalty. I let him. It's accurate.", when: { flag: 'grandma_in_town', weekday: [0] }, mood: 'smug' },
    { text: "Gin. Again. I'd apologize, Farid, but the Duchess never apologizes. It's in my contract.", when: { flag: 'grandma_in_town', weekday: [1], map: ['sunnypines'] }, mood: 'smug', weight: 2 },
    { text: "Tuesday is rummy. I work the table like a manager works a ringside. Velma suspects. Lavinia knows. Farid adores me. I win.", when: { flag: 'grandma_in_town', weekday: [1] } },
    { text: "Wednesday! Turn the radio up, chère. Gus calls a match like a horse race. I'd know that voice in a hurricane.", when: { flag: 'grandma_in_town', weekday: [2] }, mood: 'happy' },
    { text: "Thursday chair yoga. Typhoon goes for the stretch... the Duchess REVERSES. She hates it when I narrate. She loves it.", when: { flag: 'grandma_in_town', weekday: [3] }, mood: 'happy' },
    { text: "Friday's dance night. Farid has waited since 1975 to have his toes stepped on by the Duchess. I'm a giver.", when: { flag: 'grandma_in_town', weekday: [4] } },
    { text: "Saturday. The marquee lights come on at dusk. I watch for them like a girl watching for headlights. Sit. Watch with me.", when: { flag: 'grandma_in_town', weekday: [5], map: ['grandma-room'], notFlag: 'reunion_done' }, mood: 'love', weight: 2 },
    { text: "Read me the card, chère. My eyes are fine. I just like it in your voice. ...Is her name on it? Of course it is. It always is.", when: { flag: 'grandma_in_town', weekday: [5], notFlag: 'reunion_done' }, weight: 2 },
    { text: "Sunday. Did you bring a tape? Don't tell me which one. Put it in. I'll tell you which one.", when: { flag: 'grandma_in_town', weekday: [6] }, mood: 'happy', weight: 2 },

    // ---------------------------------------------------------------- The sunroom (marks everywhere; the Duchess is on)
    { text: "(The Duchess lifts her chin at a passing visitor and gives the back-of-the-hand wave. Somebody boos on reflex. She glows.)", when: { flag: 'grandma_in_town', map: ['sunnypines'] }, weight: 2 },
    { text: "Sami calls me a model resident. I've never been a model anything, chère. I was a villain. The very best one.", when: { flag: 'grandma_in_town', map: ['sunnypines'] }, mood: 'smug' },
    { text: "Farid says the Duchess had a broken heart, not a black one. Farid's been wrong about the weather for sixty years. Farid is sweet.", when: { flag: 'grandma_in_town', map: ['sunnypines'] } },
    { text: "I negotiated with the promoter. Chocolate pudding Tuesdays AND Thursdays. Tapioca is a heel move, and I told her so to her face.", when: { flag: 'grandma_in_town', map: ['sunnypines'] }, mood: 'smug' },
    { text: "Velma made our robes, you know. Mine had a train. Velma swears I tripped on it in '81. Velma is a liar and a genius.", when: { flag: 'grandma_in_town', map: ['sunnypines'] } },
    { text: "Lavinia started the Tattler. She still corrects my grammar. I still correct her posture. Fifty years of it. We're square.", when: { flag: 'grandma_in_town', map: ['sunnypines'] } },

    // ---------------------------------------------------------------- Foggy days (no wrong answers)
    { text: "Bird? You're early. Help me with my braid. My hands won't do what I tell them today.", when: { flag: 'grandma_in_town', time: [900, 1560] }, mood: 'sad' },
    { text: "Have you seen my boots, Bird? The white ones. We're on third tonight, and Agnes will never let me forget it if I go out in sneakers.", when: { flag: 'grandma_in_town', time: [900, 1560], hearts: [3, 10] } },
    { text: "There you are. I saved you the good half of the mirror. You always take too long with your hair, Bird.", when: { flag: 'grandma_in_town', time: [900, 1560], hearts: [3, 10] }, mood: 'love' },
    { text: "What year is it, chère? ...No. Don't tell me. If I'm wrong, let me be wrong a little longer. It's a nice year.", when: { flag: 'grandma_in_town', hearts: [3, 10] }, mood: 'sad' },
    { text: "I had breakfast. Or I meant to. The intention counts, chère. In breakfast and in love.", when: { flag: 'grandma_in_town' } },
    { text: ["Bird, the bus is...", "(She stops. She looks at you for a long moment, and starts over.) Never mind. Sit down, chère. Tell me about your day. Slowly."], when: { flag: 'grandma_in_town', hearts: [6, 10], notFlag: 'truth_revealed', time: [900, 1560] }, mood: 'sad' },
    { text: "Is it Saturday? It feels like Saturday. Everything's lit up inside me like a marquee, and I can't find the switch.", when: { flag: 'grandma_in_town', time: [900, 1560] } },

    // ---------------------------------------------------------------- The back booth (the only place for business truth)
    { text: "June still sets out chicory and two sugars without asking. Forty years. That isn't a diner, chère. That's a vow.", when: { map: ['diner'], place: ['insider'] }, mood: 'love', weight: 2 },
    { text: "In here I can say it. I watched every Saturday. Every single one. I watched her get old on me one show at a time.", when: { map: ['diner'], place: ['insider'], hearts: [6, 10], notFlag: 'truth_revealed' }, mood: 'sad', weight: 2 },
    { text: "Forty years I watched her on Lou's tapes, chère. Every Saturday. She got old on me one VHS at a time.", when: { map: ['diner'], place: ['insider'], flag: 'truth_revealed' }, mood: 'sad', weight: 3 },
    { text: "The finish was supposed to be hers. She'd turn on me, they'd boo her for six weeks, and we'd make up at Homecoming. I changed one line.", when: { map: ['diner'], place: ['insider'], flag: 'truth_revealed' }, weight: 2 },

    // ---------------------------------------------------------------- Your career
    { text: "I heard your match on the radio. You stalled too long before the comeback. Then you came back. That's the whole job, chère.", when: { flag: 'grandma_in_town', showDay: false, rank: ['opener', 'undercard', 'midcard'] } },
    { text: "Main event? My grandbaby? Somebody find Lavinia. I want it in the paper. Above the fold. In a bigger font than the weather.", when: { rank: ['main'] }, mood: 'happy', weight: 2 },
    { text: "They gave you the pencil. Bird's pencil. She's chewed on that thing since 1984. Hold it like it's still warm.", when: { rank: ['pencil', 'owner'] }, mood: 'love', weight: 2 },
    { text: "A hero. Well. Somebody in this family had to be. Wave at the children, chère. Mean it every time.", when: { alignment: ['face'], flag: 'debuted' } },
    { text: "A villain! Oh, chère. Let me teach you the wave. Back of the hand. Like you're shooing away a duck you love.", when: { alignment: ['heel'], flag: 'debuted' }, mood: 'happy' },

    // ---------------------------------------------------------------- Seasons and weather (in town)
    { text: "Snow. Bird and I drove through a blizzard to Shreveport once for a crowd of thirty. Best thirty people in Louisiana.", when: { flag: 'grandma_in_town', weather: ['snow'] } },
    { text: "Rain on the window. Sounds like a crowd before the bell. All that patter, waiting for something to happen.", when: { flag: 'grandma_in_town', weather: ['rain'] } },
    { text: "Spring. The azaleas outside are showing off. I respect it. Everybody deserves an entrance.", when: { flag: 'grandma_in_town', season: [0] } },
    { text: "Fairgrounds Fury! We wrestled in the mud in '79 and won a cow. Nobody believes that part. We did win a cow.", when: { flag: 'grandma_in_town', season: [1] }, mood: 'happy' },
    { text: "Harvest Havoc. Somebody always goes through a hay wagon. In my day it was whoever I'd put there.", when: { flag: 'grandma_in_town', season: [2] }, mood: 'smug' },
    { text: "Homecoming's coming. They induct a legend every year. Never us. ...Never mind, chère. Pass the pudding.", when: { flag: 'grandma_in_town', season: [3], notFlag: 'truth_revealed' }, mood: 'sad' },

    // ---------------------------------------------------------------- After the truth
    { text: "She knows now. Lou says she shouted. Good. She was always better shouting. It's the quiet ones you worry about.", when: { flag: 'truth_revealed', notFlag: 'reunion_done' }, weight: 3 },
    { text: "I'm frightened, chère. Isn't that something? Forty years and three blocks, and I'm frightened of one door.", when: { flag: 'truth_revealed', notFlag: 'reunion_done' }, mood: 'sad', weight: 3 },
    { text: ["She went to the depot. Five minutes, chère. Five minutes.", "I sat on that bus with my forehead on the glass, and she was five minutes behind me the whole way."], when: { flag: 'truth_revealed', notFlag: 'reunion_done', hearts: [6, 10] }, mood: 'sad', weight: 2 },

    // ---------------------------------------------------------------- After the reunion
    { text: "She came by. Sat in the chair by the window. We didn't talk much. Didn't have to. It's like a hold, chère. You just feel it.", when: { flag: 'reunion_done' }, mood: 'love', weight: 3 },
    { text: "Bird cheats at gin now. She learned from watching me. Took her forty years, but she learned.", when: { flag: 'reunion_done' }, mood: 'smug', weight: 2 },
    { text: "Saturdays I sit in the front row next to Agnes. Agnes hit me with her purse in 1983. Now she saves my seat. That's a town, chère.", when: { flag: 'reunion_done' }, mood: 'happy', weight: 2 },
    { text: "Bird was here. Or she's coming. Either way, chère, set out two cups.", when: { flag: 'reunion_done', time: [900, 1560] }, mood: 'love' },
    { text: "When your music hits, I stand up. I don't always know why. My knees know. The body remembers, chère.", when: { flag: 'reunion_done', hearts: [6, 10] }, mood: 'love', weight: 2 },

    // ---------------------------------------------------------------- Family
    { text: "Whatever I forget, chère, I won't forget you. I might lose your name. Never you. You're filed somewhere I don't lose things.", when: { hearts: [9, 10] }, mood: 'love' },
    { text: "If I call you Birdie, it isn't a mistake. It's the highest compliment I know. Let it be one.", when: { hearts: [9, 10], flag: 'grandma_in_town' }, mood: 'love' },
    { text: "Lâche pas, chère. Don't let go. My mama said it to me on Bayou Lafourche. I'm saying it to you. Say it to somebody someday.", when: { hearts: [9, 10] } },
    { text: "Go home, chère. The marquee went dark an hour ago. I'll go to sleep the minute you leave. That's a liar's promise, but it's a sweet one.", when: { flag: 'grandma_in_town', time: [1260, 1560] } },
  ],
  gifts: {
    loves: ['old-program', 'tiny-cake', 'coffee', 'polaroid', 'grandmas-chili'],
    likes: ['bouquet', 'wildflowers', 'teacup', 'paperback', 'merch-sign', 'pie', 'vinyl'],
    dislikes: ['blank-tee', 'gas-hotdog', 'protein-shake'],
  },
  giftReplies: {
    love: [
      "Oh, chère. Sit, sit. Now I owe you, and the Duchess always pays her debts. Eventually. With interest.",
      "Well! Look at you, knowing exactly what an old woman wants. Somebody raised you right. I'll take the credit.",
      "This goes on the vanity, where the bulbs can see it. Thank you, chère. Truly.",
    ],
    like: [
      "How lovely. You have taste. You get that from me.",
      "Thank you, chère. Put it by the window, where I can see it and the marquee at the same time.",
      "Ha! Good. Now help me hide it from Lavinia.",
    ],
    neutral: [
      "Thank you, chère. It's the thought. I'll keep the thought somewhere safe.",
      "Mm. Well. I've been handed stranger things by promoters. Thank you.",
      "How kind. Set it there. No, there. ...There. Perfect.",
    ],
    dislike: [
      "Well. I'll treasure it the day I retire from being looked at, chère.",
      "The Duchess accepts this gift. The Duchess will be regifting it to Farid.",
      "Chère. I love you. Take this back.",
    ],
    birthday: [
      "My birthday? You remembered. I didn't. That's the arrangement now, chère, and I like it very much.",
      "Seventy-some years and they still make a fuss. Make a bigger one. I'm the Duchess.",
      "Thank you, chère. Now sing. Badly. I'll sing worse. It's tradition.",
    ],
  },
  birthday: { season: 3, day: 9 },
  events: [
    // ---------------------------------------------------------------- 2: Sunday, six o'clock
    {
      id: 'grandma-2', hearts: 2, title: "Don't Tell Her I Asked",
      script: async (api) => {
        const away = !api.hasFlag('grandma_in_town');
        if (away) {
          await api.narrate("Sunday, six o'clock. The payphone at the end of the Hot Tag counter rings. June looks at it, then at you, and goes back to her crossword.");
          await api.narrate("You pick up. Static, then a voice like a velvet curtain coming down.");
          await api.sayMood('grandma', 'happy', "Chère! You found the phone. June still keeps it by the pie case? Of course she does. June never moves anything.");
          await api.say('grandma', "Tell me everything. Is the water tower still that shape? Describe the bolts. Don't skip any.");
        } else {
          await api.narrate("Sunday evening at the Evening Bell. Grandma sits at her window. Over the rooftops, the turnbuckle water tower blinks its red light.");
          await api.say('grandma', "Chère. I can see it from here, but tell me anyway. The water tower. Is it still that shape up close? Describe the bolts.");
        }
        const a = await api.choose(null, [
          { label: "It's a turnbuckle. Red pad and all.", value: 'pad' },
          { label: 'It leans a little now.', value: 'lean' },
        ]);
        if (a === 'pad') await api.sayMood('grandma', 'happy', "Red! They kept it red. Lavinia fought the town council for that red in 1971. Write that down somewhere.");
        else await api.sayMood('grandma', 'happy', "Leaning! Ha. Aren't we all, chère. It leaned in '79, too. Somebody always fixes it. This town is held up by somebodies.");
        await api.say('grandma', "And June. Does she still burn the toast?");
        if (away) {
          await api.narrate("Behind the counter, June calmly scrapes a black slice of toast into the trash without looking up.");
          await api.say('grandma', "...I'll take that silence as a yes.");
          await api.narrate("A pause on the line. You can hear her deciding whether to ask the next thing.");
        } else {
          await api.say('grandma', "Don't answer. I know she does. Some things you don't need to see to know.");
          await api.narrate("She doesn't look away from the window. You can see her deciding whether to ask the next thing.");
        }
        await api.say('grandma', "And Birdie. Does she still wear that awful jacket? The red velvet one?");
        const b = await api.choose(null, [
          { label: 'Every single day.', value: 'every' },
          { label: 'She looks good in it, honestly.', value: 'good' },
          { label: 'Why do you want to know?', value: 'why' },
        ]);
        if (b === 'every') {
          api.hearts('grandma', 30);
          await api.sayMood('grandma', 'love', "Good. (A long breath.) Good.");
        } else if (b === 'good') {
          api.hearts('grandma', 30);
          await api.sayMood('grandma', 'love', "She always did. That was the awful part.");
        } else {
          api.hearts('grandma', 15);
          await api.sayMood('grandma', 'smug', "Because I'm nosy, chère. Old women are allowed. It's in the bylaws.");
        }
        await api.sayMood('grandma', 'sad', "Don't tell her I asked.");
        if (away) await api.narrate("The line clicks. A moment later June sets down a cup of chicory coffee in front of you, two sugars, without a word.");
        else await api.narrate("She keeps looking at the marquee for a while after that. You let her.");
      },
    },
    // ---------------------------------------------------------------- 4: Moving day
    {
      id: 'grandma-4', hearts: 4, map: 'grandma-room', when: { flag: 'grandma_in_town' }, title: 'There She Is',
      script: async (api) => {
        await api.narrate("Moving day at the Evening Bell. Boxes everywhere. Sami is labeling drawers. Grandma supervises from a chair like a promoter at a weigh-in.");
        await api.say('sami', "Mrs. Dupree, where would you like the hatbox?");
        await api.say('grandma', "I'll take that one, Sami. Thank you.");
        await api.narrate("She says it lightly. She holds it like it's full of eggs. Or a heartbeat.");
        const c = await api.choose(null, [
          { label: 'Carry everything except the hatbox', value: 'rest' },
          { label: 'Offer to carry the hatbox for her', value: 'offer' },
        ]);
        if (c === 'rest') {
          api.hearts('grandma', 30);
          await api.narrate("You carry the cardigans, the sneakers, the vanity bulbs, and never once reach for the hatbox. She notices. She notices everything.");
          await api.sayMood('grandma', 'love', "You're a good one, chère. You don't fuss. Fussing is for linens.");
        } else {
          api.hearts('grandma', 15);
          await api.say('grandma', "Everything else, chère. Not that. That one's mine to carry.");
          await api.narrate("She pats your hand twice, the way you'd pat a horse that meant well.");
        }
        await api.narrate("She slides the hatbox under the bed. Then she checks that it's there, the way you check a locked door.");
        await api.say('grandma', "Sami offered me the room by the garden. Very nice. Roses. Lovely. I said no.");
        await api.say('grandma', "This one has the window.");
        await api.narrate("She points. Three blocks away, over the rooftops, the Sportatorium marquee.");
        await api.narrate("She leans forward on the bed and reads the Saturday card aloud, slowly, letter by letter, like scripture.");
        await api.say('grandma', "Saturday night... main event... and presiding... Commissioner... Birdie... Malone.");
        await api.sayMood('grandma', 'love', "Well.");
        await api.sayMood('grandma', 'sad', "There she is.");
        await api.narrate("She doesn't say anything else for a while. Neither do you. Across town, the marquee hums.");
      },
    },
    // ---------------------------------------------------------------- 6: The first tape night
    {
      id: 'grandma-6', hearts: 6, map: 'grandma-room', when: { flag: 'grandma_in_town', weekday: [6] }, title: 'Tape Night',
      script: async (api) => {
        await api.narrate("Sunday night. Sami wheels in the old AV cart. The VCR clicks, hums, and swallows the tape.");
        await api.narrate("Static. Then a ring, a crowd, and a date blinking in the corner of the screen: 1978.");
        await api.sayMood('grandma', 'happy', "Oh. Oh, chère. Sit. Not there. There. I'll tell you every move before it happens.");
        await api.narrate("She does. Her lips move half a second ahead of the tape. Headlock. Whip. Duck. The crowd on the screen roars exactly when she nods.");
        await api.say('grandma', "Watch Bird here. She's going for the arm... there. And here's me, waving at Agnes. I always waved at Agnes.");
        await api.narrate("Suddenly she laughs, a real laugh, bright as a bell. On the screen, nothing seems funny at all.");
        await api.say('sami', "What? What happened?");
        await api.sayMood('grandma', 'smug', "Bird stepped on my hair. Right there. She swore for forty-five years she never did. And there's the proof.");
        await api.narrate("The tape ends. The screen goes blue. She blinks at it for a long moment.");
        await api.say('grandma', "Chère. Did I eat dinner?");
        const c = await api.choose('She looks at you, waiting. There is no wrong answer.', [
          { label: "You had the meatloaf. You called it 'adequate.'", value: 'remind' },
          { label: "Let's find out together.", value: 'together' },
          { label: "Sami's bringing pudding either way.", value: 'pudding' },
        ]);
        api.hearts('grandma', 30);
        if (c === 'remind') await api.sayMood('grandma', 'happy', "Adequate. Yes. That sounds like me. Good.");
        else if (c === 'together') await api.sayMood('grandma', 'love', "Together. Yes. I like that better than knowing.");
        else await api.sayMood('grandma', 'happy', "Pudding! Then it doesn't matter. Sami, you heard the child.");
        await api.say('sami', "Pudding it is. Chocolate. And I'm bringing two, Mrs. Dupree, because I know you.");
        await api.fade();
        await api.narrate("Twenty minutes later the pudding is gone. So is Sami's. She won it off him at gin rummy in four hands.");
        await api.sayMood('grandma', 'smug', "I'd apologize, Sami, but the Duchess never apologizes. It's in my contract.");
        await api.say('sami', "One of these days I'm going to figure out how you do that.");
        await api.sayMood('grandma', 'smug', "No, chère. You aren't.");
      },
    },
    // ---------------------------------------------------------------- 8: A foggy afternoon
    {
      id: 'grandma-8', hearts: 8, map: 'grandma-room', when: { flag: 'grandma_in_town', time: [780, 1320] }, title: 'Bird',
      script: async (api) => {
        await api.narrate("Late afternoon. The curtains are half drawn. Grandma sits on the edge of the bed, her braid half done, looking at the window.");
        await api.narrate("She turns when you come in, and her whole face changes. It's a look she has never given you before.");
        await api.sayMood('grandma', 'love', "Bird. There you are. You're late. You're always late.");
        await api.narrate("You remember what Sami told you on her first day here. Don't correct. Connect.");
        await api.say('grandma', "Sit with me.");
        const a = await api.choose(null, [
          { label: "Play along: \"Sorry I'm late, Dot.\"", value: 'play' },
          { label: "Gently: \"It's me, Grandma. It's {name}.\"", value: 'remind' },
          { label: 'Just sit beside her.', value: 'sit' },
        ]);
        api.hearts('grandma', 15);
        if (a === 'play') {
          await api.sayMood('grandma', 'sad', "Dot. Nobody's called me that in a long time.");
        } else if (a === 'remind') {
          await api.narrate("She studies your face for a long moment, like a tape that won't track.");
          await api.say('grandma', "...Of course it is. Of course. You have her shoulders.", "Sit anyway. Let me say it to you. It's practice.");
        } else {
          await api.narrate("You sit. She leans her head on your shoulder like it's an old habit. Like it's been waiting for a shoulder at exactly this height.");
        }
        await api.say('grandma', "I have to ask you something, and you have to answer me true.");
        await api.sayMood('grandma', 'sad', "You were supposed to go.");
        await api.sayMood('grandma', 'sad', "Why didn't you go?");
        await api.narrate("The question hangs in the room. It's forty years old. It isn't yours to answer, and somehow you're the only one here to hear it.");
        const b = await api.choose(null, [
          { label: 'Take her hand.', value: 'hand' },
          { label: "Say: \"I'm here now.\"", value: 'here' },
          { label: 'Hum the waltz she sings over the dishes.', value: 'hum' },
        ]);
        api.hearts('grandma', 15);
        if (b === 'hand') {
          await api.narrate("She takes your hand in both of hers. Her crooked pinky hooks yours, the way it must have hooked someone else's, a long time ago.");
        } else if (b === 'here') {
          await api.sayMood('grandma', 'love', "Here now. Yes. That's... that's something. That isn't nothing, Bird.");
        } else {
          await api.narrate("You hum the first bars of her dishwater waltz, badly, the way she does on purpose. She laughs, and sings the next line in French. Worse.");
        }
        await api.narrate("Her eyes close. Her breathing slows. A few minutes later she's asleep, still holding on.");
        await api.narrate("Outside the window, three blocks away, the marquee flickers on for the evening.");
        await api.narrate("It's the first piece of the truth. She said it to the wrong person. Somehow, that person was also the right one.");
      },
    },
    // ---------------------------------------------------------------- 10: The body remembers
    {
      id: 'grandma-10', hearts: 10, map: 'grandma-room', when: { flag: 'truth_revealed', time: [360, 840] }, title: 'The Body Remembers',
      script: async (api) => {
        await api.narrate("A bright, clear morning. Sun on the window, sun on the marquee. Grandma is dressed, braid done, cardigan buttoned right.");
        await api.say('grandma', "Close the door, chère. Good. Now hand me the hatbox.");
        await api.narrate("You've never seen her let anyone touch it. She waits with her hands out, like a girl waiting for a corsage.");
        await api.narrate("Inside, wrapped in a plum scarf: half a championship belt. Gold plate, broken clean. The leather worn soft by forty years of one hand.");
        await api.say('grandma', "Some nights I forget why it's in there. I never forget that it is.");
        await api.say('grandma', "I've had a run of good days, chère. I don't know how many more I've got in a row. So I'm spending them.");
        await api.say('grandma', "Train me. One more.");
        const c = await api.choose(null, [
          { label: 'When do we start?', value: 'start' },
          { label: 'Are you sure you\'re ready?', value: 'sure' },
        ]);
        if (c === 'start') {
          api.hearts('grandma', 30);
          await api.sayMood('grandma', 'happy', "Ha! That's my grandbaby. Today. After lunch. You'll remind me about lunch.");
        } else {
          api.hearts('grandma', 15);
          await api.say('grandma', "Never been surer of anything, chère. Don't ask me twice. I might forget the answer and say something sensible.");
        }
        await api.say('grandma', "The body remembers the match. Even when the rest of me gets lost on the way there.");
        await api.say('grandma', "Some days I'll forget your name. I'll never forget a hold. So we start with the holds, and we work our way back to the names.");
        await api.narrate("She stands, straight as a ring post, and sinks into a slow, perfect curtsy. Her hand hooks your ankle. You're on the bed before you know it.");
        await api.narrate("She's grinning like it's 1979.");
        await api.sayMood('grandma', 'smug', "The Curtsy. Lesson one.");
        await api.sayMood('grandma', 'love', "You'll learn it three Sundays running, chère. When you already know it, don't tell me. Let me teach it to you anyway.");
        api.flag('grandma_training', true);
      },
    },
  ],
} satisfies DialogueSet;
