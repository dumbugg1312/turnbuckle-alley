import type { DialogueSet } from '../types';

/**
 * Daniel "Doc" Halloran, 67. Chiropractor (Halloran Chiropractic: "We've Got
 * Your Back") and, in 1983, the referee. Insider, never romanceable. Gentle,
 * worried, meticulous, helplessly punny, and slow on purpose: since the Night of
 * the Broken Belt he refuses to count anything fast.
 *
 * In public he treats worked injuries with total solemnity. In the three rooms he
 * is the person who knows what everyone's body has really cost them. He holds
 * 1983 piece #7: the whisper ("Don't stop me, Danny. And count it fast."), told at
 * 8 hearts once Grandma is in town ('doc_whisper'). At 10 he asks to count the
 * Homecoming main event (gated on 'truth_revealed').
 */
export default {
  npc: 'doc',
  intro: [
    "(He takes your wrist between two fingers, eyes on an old wristwatch, lips moving slowly.) Daniel Halloran. Doc. Pulse is fine.",
    "Posture is a crime.",
    "In here I can say it plainly. Red is real, blue is art, and I keep the board honest.",
    "Come see me before your smile does. The ones who hide it are the ones I worry about.",
  ],
  introPublic: [
    "Halloran Chiropractic. We've Got Your Back. (He peers over half-moon glasses.) You walk with a bit of a lean, young person.",
    "Sit. No rush. There's never a rush. ...Butterscotch? The gold wrappers. They're the good kind.",
    "Saturday Strains are walk-ins, nine to noon. Please, no 'quick question' at the grocery store. The cantaloupes are listening.",
  ],
  lines: [
    // ---------------------------------------------------------------- Public: solemn about worked injuries
    { text: "Matching neck braces. Doctor's orders. And no hugging each other for a week, it's bad for the vertebrae.", when: { place: ['public'], map: ['clinic'] }, weight: 2 },
    { text: "Mr. Price's pinky is shattered. Tragic. He has requested a rose-gold cast. I stock white. We've compromised on pale pink.", when: { place: ['public'] } },
    { text: "I've told Mr. Odom: anger is a tension in the trapezius. I've prescribed chamomile and a long walk. He growled. A very gentle growl.", when: { place: ['public'] } },
    { text: "Never hurry a spine. Spines have been rushed enough. (He winds his wristwatch.)", when: { hearts: [0, 5] } },
    { text: "I'd call that a spineless excuse, but I try not to be rude to vertebrae.", when: { hearts: [0, 5], place: ['public'] } },
    { text: ["Oh, I refereed once. A lifetime ago. Quit the night of the... well. You've heard the story.", "Everyone's heard the story. I'd rather talk about your lumbar."], when: { hearts: [3, 10], place: ['public'] } },
    { text: "Medic table, ringside, tonight. If you're hurt, wave. If you're not hurt, wave anyway. It's polite.", when: { showDay: true, place: ['public', 'show'] } },
    { text: "Chair shots. By my chart, most spinal compressions in this county trace back to you, young person. Don't make me laminate it.", when: { place: ['public'], alignment: ['heel'], flag: 'debuted' } },
    { text: "Heard you took a dropkick. Come in Monday and I'll adjust you. No charge for heroes. Small charge for heroes' friends.", when: { place: ['public'], alignment: ['face'], flag: 'debuted' } },
    { text: ["Thursdays are house calls at the Evening Bell. They ask me to fix everything. Last week a gentleman asked me to fix a Tuesday.", "I referred him to the calendar."], when: { weekday: [3] } },
    { text: "Rain. Barometric pressure drops, and so do my appointments. Everyone aches at home, in dignity.", when: { weather: ['rain', 'storm'] } },
    { text: "Spring. Everyone's out gardening. Everyone's back goes out. It's a seasonal tradition, like the robin.", when: { season: [0] } },
    { text: "Summer. I buy a jar of fairgrounds honey a week, for my tea. Medicinal. Mostly.", when: { season: [1] } },
    { text: "Fall. Leaf-raking injuries. Raking is a twist, a reach and a regret.", when: { season: [2] } },
    { text: "Winter. Cold shortens muscles and lengthens queues. Wear a scarf. A scarf is an adjustment you can do yourself.", when: { season: [3] } },
    { text: "Morning posture check. Shoulders down. Down. Further. There. You look like someone who trusts the chair.", when: { time: [360, 600] } },
    { text: "Late. Go home. Sleep is the cheapest adjustment there is.", when: { time: [1260, 1439] } },

    // ---------------------------------------------------------------- Insider: red and blue
    { text: "Red's real. Blue's art. Never let anybody paint your red blue.", when: { place: ['insider'], hearts: [3, 10] }, weight: 2 },
    { text: "Birdie has a red on her left shoulder from 1982. She's never once asked me to erase it. Says it's her autograph.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Hazel's knee. Red. She tells everyone it's blue. I can tell the difference by the way she stands.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Clint's neck. Fifty-two. He pretends it's villain-tough. I've cleared him. I watch every bump anyway. That's the arrangement.", when: { place: ['insider'] } },
    { text: "The worst thing in this business isn't the bumps. It's the quiet ones. The knees. The ones people bury in smiles.", when: { place: ['insider'] } },
    { text: "The juniper put out a new shoot. I trimmed it by one-sixteenth. Slowly. A slow cut heals cleaner.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Sundays are for the juniper. I talk to it. It listens better than most.", when: { place: ['insider'], weekday: [6] } },
    { text: "First year bumps: land flat, tuck the chin. Chin tucked is neck saved. Say it with me. ...You didn't say it.", when: { place: ['insider'], rank: ['rookie', 'opener'] } },
    { text: "Main event. Longer matches, bigger rooms, fewer breaks. Hydrate. Stretch. Don't lie to me about your lower back.", when: { place: ['insider'], rank: ['main', 'assistant', 'pencil', 'owner'] } },
    { text: "In here you can unclench your jaw. It's been in character since Tuesday. I can hear it.", when: { place: ['insider'], alignment: ['heel'] } },
    { text: ["I've counted to three ten thousand times in my life.", "I'd give back nine thousand nine hundred and ninety-nine of them to have that one again."], when: { place: ['insider'], hearts: [6, 10], notFlag: 'truth_revealed' }, mood: 'sad' },
    { text: ["I visit Dottie Thursdays. She always asks about my hands. 'Still slow, Danny?' 'Still slow, Dot.'", "She says it's the only reliable thing in the building."], when: { place: ['insider'], flag: 'grandma_in_town', hearts: [3, 10] } },
    { text: "She's never mentioned that night. Neither have I. We discuss her hip.", when: { place: ['insider'], flag: 'grandma_in_town', hearts: [6, 10], notFlag: 'truth_revealed' }, mood: 'sad' },
    { text: "Mo says she'll hand me the count at Homecoming. Slow, I told her. She said, 'Doc, that's the only way you do it.'", when: { place: ['insider'], flag: 'truth_revealed', hearts: [9, 10] } },
    { text: "Forty years I thought I'd helped break something. Turns out I helped carry it. Slowly, of course. I do everything slowly.", when: { place: ['insider'], flag: 'truth_revealed' }, mood: 'happy' },
    { text: "I counted the one that brought them back. Slow. The whole town counted with me. I've never heard that many people be patient at once.", when: { flag: 'reunion_done' }, mood: 'love', weight: 3 },
  ],
  gifts: {
    loves: ['honey', 'old-program', 'river-stone'],
    likes: ['vinyl', 'teacup', 'wildflowers', 'polaroid'],
    dislikes: ['protein-shake', 'gas-hotdog', 'paperback'],
  },
  giftReplies: {
    love: [
      "(He holds it with both hands, the way he'd hold a sleeping cat.) Oh. That's the good kind. You're a fine judge of character.",
      "I'll keep this by the juniper. They'll get along. Slowly.",
      "(He studies it for a very long time, then sets it down as if it might wake.) Thank you. I'll... take my time with this one.",
    ],
    like: [
      "Thank you. Thoughtful. And nobody asked me to crack anything for it. Refreshing.",
      "That's kind. I'll enjoy it at a reasonable pace.",
    ],
    neutral: [
      "Ah. Well. Thank you. I'm sure it's good for somebody's back.",
      "How nice. I'll find a spot for it. Possibly the shelf. Possibly the spine of the shelf.",
    ],
    dislike: [
      "I'm a chiropractor, not a jet engine.",
      "Ah. Thank you. I'll keep it far from my patients.",
      "(He sets it down very gently, very far away.) I appreciate the thought. I'd appreciate it more from a distance.",
    ],
    birthday: [
      "You remembered. I'll have to sit down. Slowly. Thank you.",
      "Another year. I've stopped counting them fast. Thank you, young person.",
    ],
  },
  birthday: { season: 3, day: 12 },
  events: [
    // ---------------------------------------------------------------- 2: An inch taller
    {
      id: 'doc-2', hearts: 2, map: 'clinic', title: 'An Inch Taller',
      script: async (api) => {
        await api.narrate("Halloran Chiropractic. WE'VE GOT YOUR BACK.", "A waiting room with one ficus, one magazine from 1998,", "and a ceiling clock Doc refuses to fix because it's right twice a day and he respects that.");
        await api.say('doc', "Up on the table. No rush. There's never a rush.");
        await api.narrate('He walks his fingers down your spine, humming something jazzy and slow. A butterscotch wrapper crinkles in his cardigan pocket.');
        await api.say('doc', 'Hm. Slight rotation, lumbar region. From carrying something heavy. Not lumber. Something else. People always carry something else.');
        await api.narrate('One hand on your shoulder, the other at your hip, and CRACK. It echoes down Main Street. A pigeon leaves.');
        await api.say('doc', 'There. An inch taller and two inches more honest.');
        const c = await api.choose(null, [
          { label: 'Ask how he knew what you were carrying', value: 'how' },
          { label: 'Say you already feel lighter', value: 'light' },
        ]);
        if (c === 'how') {
          api.hearts('doc', 30);
          await api.say('doc', "Posture is a diary, young person. I read it for a living. ...I won't read it aloud. That would be rude.");
        } else {
          api.hearts('doc', 15);
          await api.say('doc', "Good. That's the whole job. Nobody comes in for a cure. They come in to feel lighter for a slow afternoon.");
        }
        await api.narrate('He presses a butterscotch into your palm, gold wrapper, and pats it closed.');
        await api.say('doc', 'The good kind. Mind the stairs on your way out. One at a time.');
      },
    },
    // ---------------------------------------------------------------- 4: Red and blue
    {
      id: 'doc-4', hearts: 4, map: 'clinic', title: 'Red and Blue',
      script: async (api) => {
        await api.narrate('Doc turns the clinic sign: BACK IN A SLOW MINUTE. He closes the blinds one slat at a time, then crooks a finger at you.');
        await api.say('doc', "Walk with me. At my pace. It's the only pace I have.");
        await api.fade();
        await api.narrate("The locker room. By the first-aid cabinet hangs a long whiteboard: INJURY BOARD. Names in two colors of marker. Red and blue.");
        await api.say('doc', "Red's real. Blue's art.");
        await api.narrate("The Bruiser Twins: blue, blue. Gideon's pinky: blue, circled in rose-gold. Hazel's knee: red. Dex has a small red question mark.", "Clint, red, very small.");
        await api.say('doc', "Blue is what the crowd sees. Red is what the body knows. I keep both so I never confuse them. Never let anybody paint your red blue.");
        await api.narrate('He uncaps a marker, pauses, and looks at you over his half-moon glasses.');
        await api.say('doc', 'Anything hurting that I should know about? Truthfully. This is the one room where the truthful answer is the cheap one.');
        const c = await api.choose(null, [
          { label: "My left shoulder's been aching since the last match", value: 'red' },
          { label: "Nothing. I'm fine.", value: 'blue' },
        ]);
        if (c === 'red') {
          api.hearts('doc', 30);
          await api.narrate('He writes your name in red, slowly, in neat block letters, and underlines it once.');
          await api.sayMood('doc', 'happy', 'Thank you. That one word just saved you three weeks.');
        } else {
          await api.narrate('He writes your name in blue. Slower. Then he lets the marker hover for a moment.');
          await api.say('doc', "Blue, then. I'll ask again Thursday. And Friday. Blue is allowed to turn red. I'll keep the eraser warm.");
        }
      },
    },
    // ---------------------------------------------------------------- 6: Forty years of slow
    {
      id: 'doc-6', hearts: 6, map: 'town', title: 'Forty Years of Slow',
      script: async (api) => {
        await api.narrate('Early evening. Doc sits on the gazebo bench with a thermos of chamomile, winding his wristwatch the way other people check their phones.', 'He slides over to make room.');
        await api.say('doc', "Walk me to the Hot Tag? June's pie closes at eight, and I'm slow.");
        await api.fade();
        await api.narrate('The back booth. June sets down chamomile and a slice of pie without asking. Doc stirs his tea for a very long time.');
        await api.say('doc', "I keep a juniper. A little bonsai, on the sill at home. Twenty-eight inches of nothing, if you measure by ambition.");
        await api.say('doc', 'I planted it in November of 1983. The month I stopped refereeing. I wanted something to do with my hands that could not be rushed.');
        await api.say('doc', 'Forty years of slow. Only thing I ever did right without hurrying.');
        await api.narrate('He turns his wristwatch a quarter turn on his wrist, then back.');
        await api.sayMood('doc', 'sad', "I counted a three once, young person. A long time ago. I'd give a great deal to have it back.");
        const c = await api.choose(null, [
          { label: 'Ask to see the juniper', value: 'tree' },
          { label: 'Ask what happened that night', value: 'night' },
        ]);
        if (c === 'tree') {
          api.hearts('doc', 30);
          await api.say('doc', "...Sunday. Ten o'clock. Bring nothing. I'll show you how to water it: one slow spoon at a time.");
        } else {
          api.hearts('doc', 15);
          await api.say('doc', "I'll tell you. I promise I will. When I've figured out how to say it slowly enough that it stops being so loud.");
        }
        api.flag('doc_juniper');
      },
    },
    // ---------------------------------------------------------------- 8: The whisper
    {
      id: 'doc-8', hearts: 8, map: 'clinic', when: { flag: 'grandma_in_town' }, title: 'The Whisper',
      script: async (api) => {
        await api.narrate("Closing time. Doc pins a note to the clinic door in his careful hand: BACK TOMORROW, SLOWLY.", "He hands you his umbrella, though it isn't raining.");
        await api.fade();
        await api.narrate('The Hot Tag, after hours. June has turned the sign and left one light on over the back booth. Doc has not touched his tea.');
        await api.say('doc', "I'm going to tell you something I've never told anyone. I'd like you to let me get to the end before you say anything.");
        await api.say('doc', "November '83. The Broken Belt. I was twenty-seven.", "I was the referee, and I thought it was a gimmick like any other, until Dottie raised that belt.");
        await api.say('doc', "She leaned in close, over Birdie, where the mic couldn't catch it. Not to Birdie. To me. She said...");
        await api.narrate("Doc closes his eyes. When he speaks, his voice is somebody else's: low, shaky, theatrical and not theatrical at all.");
        await api.sayMood('doc', 'sad', '"Don\'t stop me, Danny. And count it fast."');
        await api.narrate('The booth is very quiet. Somewhere in the kitchen, a pan settles.');
        await api.say('doc', "She was crying. I saw it. The Duchess, mid-swing, crying. And I counted it fast. One, two, three. Like she asked.");
        await api.say('doc', "I walked out that night and never refereed again. Forty years I've wondered what I helped break, and why she asked me to help.");
        const c = await api.choose('Doc finally opens his eyes.', [
          { label: 'Take his hand', value: 'hand' },
          { label: "Ask: 'Did she ever say why?'", value: 'why' },
        ]);
        if (c === 'hand') {
          api.hearts('doc', 30);
          await api.narrate('Doc looks at your hand on his, as if checking it for fractures. Then he turns his palm over and holds on.');
        } else {
          api.hearts('doc', 15);
          await api.say('doc', "No. Never. Thursdays I adjust her hip and she tells me about the pudding. Neither of us has said a word about it.", "Forty years of not saying it, side by side.");
        }
        await api.say('doc', "Don't tell Birdie. Not yet. It isn't mine to pour. I've carried it like a full cup, slowly, and I'd like to hand it to the right person.");
        api.flag('doc_whisper');
      },
    },
    // ---------------------------------------------------------------- 10: The count
    {
      id: 'doc-10', hearts: 10, map: 'clinic', when: { flag: 'truth_revealed' }, title: 'The Count',
      script: async (api) => {
        await api.narrate("After hours.", "Doc is waiting at the clinic door with a flat box tied in string, and he opens it with the care of a man defusing a very polite bomb.");
        await api.narrate("Inside, folded in tissue: a referee's shirt. Black and white stripes. Pressed. Smelling faintly of cedar, and of 1983.");
        await api.say('doc', "I kept it. I told myself it was for the moths. It was for me.");
        await api.say('doc', "I'd like to ask for something. The Homecoming main event. The count.");
        await api.sayMood('doc', 'sad', "I counted the three that ended them. I'd like to count the one that brings them back.");
        await api.narrate('He takes off his half-moon glasses and polishes them, slowly, a long while. It is how Doc cries.');
        const c = await api.choose(null, [
          { label: "Say yes, and offer to practice the count with him", value: 'practice' },
          { label: "Say you'll ask Birdie first", value: 'ask' },
        ]);
        if (c === 'practice') {
          api.hearts('doc', 30);
          await api.say('doc', "Practice? Young person, I've been practicing for forty years. ...But I'd like that. Slowly. Bring a pillow.");
          await api.narrate('He counts to three with you on the clinic table, slapping the vinyl: one. Two. Three. Each one lasts a full breath.', 'You both hold the last one.');
        } else {
          api.hearts('doc', 15);
          await api.say('doc', "Of course. I'll ask her myself. In writing. In perhaps three weeks. I want to get the handwriting right.");
        }
        await api.narrate("He folds the shirt back into its tissue, and for the first time since you've known him, he doesn't wind his watch.");
        api.flag('doc_referee');
      },
    },
  ],
} satisfies DialogueSet;
