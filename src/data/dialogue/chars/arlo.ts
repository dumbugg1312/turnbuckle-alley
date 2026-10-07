import type { DialogueSet } from '../types';

/**
 * Arlo Finch, 28. The player's MaxxMedia desk neighbor (prologue, flag
 * 'prologue') who quits in the fall of Year 1 and opens Rewind, a VHS repair and
 * restoration shop, in town (flag 'arlo_in_town'). A mark: he believes every match
 * and every rivalry completely, which is exactly why the clip floor is breaking
 * his heart. He has rated every match he has ever seen on a spreadsheet: nine
 * thousand rows, and one gap at 1983.
 *
 * Romanceable. 12 = Behind the Curtain (he joins the crew as ACW's video
 * producer: flag 'arlo_curtain'; the new spreadsheet column is TRUST); 14 = the
 * proposal setup, a two-hour tape in Rewind's window ('arlo_proposal_ready').
 * 2 has a prologue version and a town fallback ('arlo_2_seen' keeps them apart).
 */
export default {
  npc: 'arlo',
  intro: [
    "(A tall, gangly man with curly red hair and enormous headphones pokes his head over the cubicle wall.) Oh, hey. Midnight shift buddy.",
    "Arlo, if the name's slipped you. It slips people.",
    "Nine seconds. They want a forty-minute match in nine seconds. I timed a referee's three-count once. It's longer than that.",
    "I keep a spreadsheet of every match I've ever seen. Nine thousand rows. My sister calls it 'a lot.' I call it 'nearly complete.'",
    "Noodles? I always make too many. It's a gift. I'm told that's how gifts work.",
  ],
  lines: [
    // ---------------------------------------------------------------- The prologue: the clip floor
    { text: "Nine seconds. They want a forty-minute match in nine seconds. That's not a clip. That's a crime scene.", when: { flag: 'prologue' }, weight: 2 },
    { text: ["You can't cut a story into nine seconds. The comeback IS the story.", "I say this at every meeting. They write 'Arlo: passionate' on a sticky note."], when: { flag: 'prologue' } },
    { text: "Nine thousand rows. Every match since I was nine. Don't make that face. You've got a spreadsheet too. Yours is just inside your head.", when: { flag: 'prologue' } },
    { text: "(He slurps noodles over his keyboard.) Hydration. Protein. Sodium. A balanced meal, if you squint.", when: { flag: 'prologue' } },
    { text: ["I saw a match last night that made me cry in the break room. The janitor patted my shoulder.", "'Wrestling, huh?' 'Wrestling.' 'Yeah.' Best conversation of my week."], when: { flag: 'prologue' } },
    { text: ["Royce says retention. I hear 'attention span.' I hear 'we've decided people don't have any.'", "He brought me soup when I had the flu. Good soup. From the place with the line. I'm so angry about the soup."], when: { flag: 'prologue' } },
    { text: "Your grandma was the Duchess? THE Duchess? There's one gap in my spreadsheet. 1983. Nobody's got a clean tape of the Broken Belt. Not one.", when: { flag: 'prologue' } },

    // ---------------------------------------------------------------- Town: Rewind
    { text: "Welcome to Rewind! Please be kind! There's a sign! I made the sign!", when: { notFlag: 'prologue', hearts: [0, 2], map: ['pawn'] }, weight: 2 },
    { text: "In the city I watched wrestling to feel something. Here I just... feel something. Walking to the bakery. Isn't that weird?", when: { notFlag: 'prologue', hearts: [3, 10] } },
    { text: "Tiny knows my name. The baker. She asked how my mother was. I almost cried over a scone.", when: { notFlag: 'prologue' } },
    { text: "A VCR is a rotating drum that writes magnetic memories. Mine's making a sound like a goose. I'm in love with this problem.", when: { notFlag: 'prologue', map: ['pawn'] } },
    { text: "Vertical video? I physically can't. My hands shake. Ask me about aspect ratios and I'll weep.", when: { notFlag: 'prologue' } },
    { text: "A 4.5 isn't an opinion. It's a feeling with a decimal.", when: { notFlag: 'prologue', hearts: [0, 5] } },
    { text: "Dex's VFW match got a 4.5. He framed the row. He FRAMED a spreadsheet row. Best review I ever got.", when: { notFlag: 'prologue', hearts: [3, 10] }, mood: 'happy' },
    { text: "Fenwick says the Mothman has a favorite VCR. I told him the Mothman has a favorite everything. We argue. It's the best part of my day.", when: { notFlag: 'prologue', hearts: [3, 10] } },
    { text: "Royce kept my forty-page resignation letter. It's mostly star ratings. I don't know whether to be flattered or sued.", when: { notFlag: 'prologue', hearts: [3, 10] } },
    { text: ["There's a gap in my spreadsheet. 1983. Fenwick says he has a crowd tape, but the flood ruined it at the swing. I keep asking to see it.", "He keeps saying it's 'not ready.'"], when: { map: ['pawn'], notFlag: 'truth_revealed', hearts: [3, 10] } },

    // ---------------------------------------------------------------- Town: the week and the shows
    { text: "Monday's restoration day. Shop's closed, but I'm in the back with a soldering iron and a pot of noodles. Knock like you mean it.", when: { notFlag: 'prologue', weekday: [0] } },
    { text: ["Sundays I'm at the flea market with Fenwick. He's looking for a Mothman tape. I'm looking for a rare tape label.", "We stand next to each other for four hours trading insults. It's a beautiful friendship."], when: { notFlag: 'prologue', weekday: [6] } },
    { text: ["I take a clipboard to the VFW. The VFW lady asked if I was with the health department. I said I was here to rate the show.", "She gave me bingo."], when: { notFlag: 'prologue', weekday: [2] } },
    { text: ["Third row on the aisle. Rating every bout. The Mountain didn't even blink at the pyro last week. That man is ice.", "4.0, deducted for being terrifying."], when: { notFlag: 'prologue', weekday: [5], place: ['public', 'show'] } },
    { text: "Are you wrestling tonight? I'm already nervous. I brought a highlighter in your color.", when: { notFlag: 'prologue', showDay: true, hearts: [3, 10] } },
    { text: "You and {opponent} at {venue}: {stars}. I didn't cry. I saved it for the car. I don't have a car. I saved it for the bus.", when: { notFlag: 'prologue', alignment: ['face', 'tweener'], lastMatch: { minStars: 3, maxDaysAgo: 5 } } },
    { text: ["You and {opponent}: {stars}. I'm sorry. I don't round up. My hands won't let me.", "The opening was a 4. Something in the middle wandered off. I wrote 'where did it go' in the notes column."], when: { notFlag: 'prologue', lastMatch: { maxStars: 2.5, maxDaysAgo: 5 } } },
    { text: "I know you're a villain now. I rated you and {opponent} a {stars}. I can separate the art from the artist. I wrote that in the cell, in case I forget.", when: { notFlag: 'prologue', alignment: ['heel'], lastMatch: { minStars: 3, maxDaysAgo: 5 } } },
    { text: "{finisher}. I rewound it in my head on the walk home and tripped on a curb. Worth it. Bruise is a 4.", when: { notFlag: 'prologue', lastMatch: { won: true, minStars: 3.5, maxDaysAgo: 3 } }, mood: 'happy' },
    { text: "You're main-eventing! The rating isn't in my spreadsheet yet. I left the cell blank. I'm scared of the number.", when: { notFlag: 'prologue', rank: ['main'] } },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "Rainy Saturday, Rewind, a CRT, instant noodles. That's the entire plot of my favorite movie. I'm living it.", when: { notFlag: 'prologue', weather: ['rain'] } },
    { text: "Thaw Brawl's in spring. I've got a clipboard, a thermos, and three highlighters. Don't make fun of the highlighters.", when: { notFlag: 'prologue', season: [0] } },
    { text: ["Fairgrounds Fury: bears, funnel cake, a ring in a field. I give Wanda's title defense a 5.0 every year. Nobody argues.", "You can't argue with a bear."], when: { notFlag: 'prologue', season: [1] } },
    { text: "Harvest Havoc. Hay bales, pyro, a man launched into a pumpkin. 4.9. The pumpkin was a 5.", when: { notFlag: 'prologue', season: [2] } },
    { text: "Homecoming's coming. I've never seen so many people so excited about so many tape recorders.", when: { notFlag: 'prologue', season: [3] } },

    // ---------------------------------------------------------------- Story, romance, after the curtain
    { text: "The bootleg's in the safe. The restored one. It's the first thing I've ever had a safe for.", when: { flag: 'arlo_frame' }, mood: 'sad' },
    { text: ["Frame 4,410. She was crying. She REGRETTED it. The second she did it. ...I'm saying that like a theory.", "It's the most obvious thing in the world."], when: { flag: 'truth_revealed', notFlag: 'reunion_done', hearts: [6, 10] }, mood: 'sad' },
    { text: "I made you a mixtape. A tape tape. It has three songs and forty minutes of me describing why the songs are good.", when: { dating: true }, mood: 'love' },
    { text: "I wake up, and I can walk to a bakery and see you, and I rate the day a 5.0. I don't do that. I never do that.", when: { dating: true, flag: 'arlo_curtain' }, mood: 'love' },
    { text: "Nine thousand rows, and every one of them is two people trusting each other not to get hurt. I just had to find the right column.", when: { place: ['insider'], flag: 'arlo_curtain' } },
    { text: ["I used to wonder how a match could be so perfect and so... impossible. Now I know. It's trust, rehearsed. Rehearsed trust.", "I'm going to cry again."], when: { place: ['insider'], flag: 'arlo_curtain' }, mood: 'happy' },
    { text: "Tag partner! I'm somebody's tag partner! I'm on the right side of the camera for once!", when: { married: true }, mood: 'love' },
  ],
  gifts: {
    loves: ['cassette', 'old-program', 'vinyl'],
    likes: ['tape', 'scrap', 'toy-wrestler', 'coffee', 'comic', 'chili-dog'],
    dislikes: ['gas-hotdog', 'protein-shake', 'merch-tee'],
  },
  giftReplies: {
    love: [
      "Mold on the reel, a crease at forty minutes, a label I've never seen. It's PERFECT. I'm going to save you. Yes, I'm talking to the tape.",
      "(He clutches it to his chest and stares at the ceiling for a moment.) I need to sit down. Don't look at me. I'm having a feeling.",
      "Is this... where did you find... no. Say nothing. I'm going to cry, and I'd like to do it with some mystery.",
    ],
    like: [
      "Oh! That's great! Thank you! I'm going to put a label on it. A label that says 'from {name}.' In the good font.",
      "That's so thoughtful. I'm going to use it immediately, and also keep it forever. Both. Simultaneously.",
      "Thank you! The label maker's going to have a field day. It's been waiting for a good occasion.",
    ],
    neutral: [
      "Oh! A gift! Thank you! I'll put it somewhere safe. Like the safe. I have one now.",
      "Thank you! I'm going to rate this a 4.0. Which, for me, is the highest compliment for something I don't understand yet.",
    ],
    dislike: [
      "(He holds it out at arm's length.) A shirt with a face on it? That's... that's content. Sorry. I'm sorry. Thank you.",
      "Thank you! I... okay. I'm going to put this somewhere I can't see it. I'll be fine. Give me a minute and a noodle.",
      "I'm going to be very brave and say 'thank you,' and then I'm going to put it under a pile of VCRs.",
    ],
    birthday: [
      "A {item}. On my birthday. Everyone else remembers the day my spreadsheet crashed. That's April. This is better than April.",
      "I rate birthdays. Last year was a 2.1 (cake fell on the bus). This one just went to a 4.6 and the {item} is why.",
    ],
    byItem: {
      cassette: "'PUMP UP JAMS 4 SAT.' Somebody had a Saturday they needed pumping up for. I'm going to find out what was on it. Carefully. With gloves.",
      'old-program': "1979! Look at the card. Look at the PACING of this card. Somebody booked this with a pencil and a lot of coffee.",
      vinyl: "Somebody's entrance music, pressed in 1984. Side B has a scratch at the bridge. Of course it does. The bridge is the best part.",
      tape: "Athletic tape! I'm going to fix my headphones with it. A trainer would weep. Let them weep.",
      scrap: "Scrap metal. Yes. I need a bracket for the tape heads. This is a bracket. It doesn't know it yet.",
      'toy-wrestler': "He's got a chew mark on the boot. Somebody's dog loved him. I'm going to give him a shelf next to the good VCR.",
      coffee: "June's coffee. I'm going to drink it standing up in front of the drum heads, like a professional.",
      comic: "Wrestle-Bot vs. The Moon. Issue one. The moon has no chance. I'm rating it before I read it.",
      'chili-dog': "A chili dog in a paper boat. I'm going to eat this over the sink so the tapes never know.",
    },
    later: [
      "I'm still using the {lastGift}. I gave it a row in the spreadsheet. It's doing very well.",
      "The {lastGift} lives on the counter now. Customers ask about it. I tell them it's from you. Some of them don't know who you are. I explain.",
    ],
  },
  again: [
    "I'm mid-rewind. Talk in ninety seconds? Eighty-nine?",
    "(Arlo holds up a tape and a screwdriver, as if that answers it. It does, a bit.)",
    "Still me! Same Arlo. I haven't changed in the last hour. I checked the spreadsheet.",
  ],
  idle: [
    "(Arlo is wearing one headphone and humming a commercial jingle from 1989.)",
    "(He's labeling something. The label maker clicks like a very small typewriter.)",
  ],
  birthday: { season: 3, day: 3 },
  events: [
    // ---------------------------------------------------------------- 2 (prologue): The comeback is the story
    {
      id: 'arlo-2', hearts: 2, map: 'maxx-office', when: { flag: 'prologue' }, title: 'Nine Seconds',
      script: async (api) => {
        await api.narrate('Floor 31, MaxxMedia, past midnight.', 'The cubicle wall between your desk and Arlo\'s is covered in sticky notes: his, mostly in caps, mostly about comebacks.');
        await api.narrate('Something slides over the top of the wall: a paper bowl, half full of instant noodles, with a plastic fork.');
        await api.say('arlo', "Half. I only ate half. It's a gift. Take it.");
        await api.narrate('He leans around the partition, headphones askew, glasses crooked.');
        await api.say('arlo', "They made me cut the Thaw Brawl comeback down to nine seconds. I cut out the comeback. There is no comeback in nine seconds.", "There's a guy getting hit and a guy getting up. That's a hiccup with a ref.");
        await api.narrate("He looks like he might cry. (He often does. He does it freely, without apology.)");
        const c = await api.choose(null, [
          { label: "Tell him he's right. The comeback is the story.", value: 'right' },
          { label: 'Eat the noodles. They look good.', value: 'noodles' },
        ]);
        if (c === 'right') {
          api.hearts('arlo', 30);
          await api.sayMood('arlo', 'happy', "(He tears up.) Nobody here says that. Nobody. They say 'great retention.' Thank you. Thank you.");
        } else {
          api.hearts('arlo', 15);
          await api.say('arlo', "They're mediocre. But they're yours now. That makes them better.");
        }
        await api.narrate("He ducks back behind the wall. A moment later, over the divider, a very small voice: \"Eight-point-five. For the noodles. You took a bite.\"");
        api.flag('arlo_2_seen');
      },
    },
    // ---------------------------------------------------------------- 2 (town fallback)
    {
      id: 'arlo-2b', hearts: 2, map: 'pawn', when: { notFlag: 'arlo_2_seen' }, title: 'Sign Painter',
      script: async (api) => {
        await api.narrate("The old video store on Main Street. Dust, shelves, one CRT on a milk crate, and a banner still mostly paint.", "Arlo stands on a stepladder with a label maker in one hand and a brush in the other.");
        await api.say('arlo', "Don't look at the sign! It's not done. It says REWIND, but the second W is a rumor.");
        await api.say('arlo', "I quit MaxxMedia. Forty pages. A forty-page resignation letter. Mostly star ratings.");
        await api.narrate("He climbs down, wipes paint on his cardigan, and stares at his own hands. He is, you realize, terrified.");
        await api.say('arlo', "Everybody here knows my name, and I don't know how I'm supposed to feel about that.");
        const c = await api.choose(null, [
          { label: "Tell him you're proud of him", value: 'proud' },
          { label: 'Ask what the letter said', value: 'letter' },
        ]);
        if (c === 'proud') {
          api.hearts('arlo', 30);
          await api.sayMood('arlo', 'happy', "(His eyes go bright.) ...I'm going to put that on a label and wear it.");
        } else {
          api.hearts('arlo', 15);
          await api.say('arlo', "Page one: 'I quit.' Pages two through forty: why Thaw Brawl deserves a 4.8. Royce framed it. I think that was a joke.", "I hope that was a joke.");
        }
        api.flag('arlo_2_seen');
      },
    },
    // ---------------------------------------------------------------- 4: Grand opening
    {
      id: 'arlo-4', hearts: 4, map: 'pawn', title: 'Grand Opening',
      script: async (api) => {
        await api.narrate("Rewind's grand opening. A banner: WE FIX WHAT YOU'RE SCARED TO WATCH. Three folding chairs.", "A platter of grocery-store cookies, arranged with the care of a surgeon.");
        await api.narrate('Three customers: you, Fenwick, and Pip. Arlo is overjoyed.');
        await api.say('arlo', "Welcome, welcome, welcome! Thank you for being the first three people in the history of this store!");
        await api.say('fenwick', "I'm only here to find out what you know about the Mothman.");
        await api.say('arlo', "Everything! Nothing! It's complicated! There's a sign!");
        await api.say('pip', 'Do you have any wrestling?');
        await api.sayMood('arlo', 'happy', '(He points to every shelf in the building.) All of it.');
        await api.narrate("Pip walks the aisles with the reverence of a pilgrim. Fenwick studies the ceiling for cryptids.", "Arlo stands in the middle of the shop, arms spread, like a man who has just landed on a very small moon.");
        const c = await api.choose(null, [
          { label: 'Applaud like it\'s a sold-out main event', value: 'clap' },
          { label: 'Rent the first tape', value: 'rent' },
        ]);
        if (c === 'clap') {
          api.hearts('arlo', 30);
          await api.narrate('You clap. Pip joins in. Fenwick, after a pause, claps once, sharply, like a man ruling on a matter. Arlo bursts into tears.');
          await api.say('arlo', "I'm fine! I'm fine! The cookies are just emotional!");
        } else {
          api.hearts('arlo', 15);
          await api.say('arlo', "My first sale! A dollar! I'm going to frame it! I have so many frames now!");
        }
      },
    },
    // ---------------------------------------------------------------- 6: Nine thousand rows
    {
      id: 'arlo-6', hearts: 6, map: 'pawn', title: 'Nine Thousand Rows',
      script: async (api) => {
        await api.narrate('Rewind, after closing. The CRT hums. Arlo has dragged two folding chairs together and put a laptop on a milk crate between them.');
        await api.say('arlo', 'I have never shown anybody this. Okay. Okay. Here.');
        await api.narrate('A spreadsheet. Nine thousand rows. Columns: DATE, MATCH, CROWD, PACING, SELLING, STORY, RATING. Every row in tiny, careful type.', 'A decade of Saturdays.');
        await api.say('arlo', "Highest rating in the whole sheet. Row 8,214. A five-point-oh. I've given three fives in my life. This is the first one.");
        await api.narrate('He scrolls. The row reads: TURNBUCKLE ALLEY. SPORTATORIUM. BOOTLEG. (VELVET HAMMERS?) 5.0.');
        await api.say('arlo', "The tape's so fuzzy I can't see who they're wrestling. It cuts out at minute forty.", "It's two women in a barn in front of six hundred people and they look at each other like...");
        await api.say('arlo', "That's why I came here. I wanted to live where that happened.");
        await api.narrate('He looks at you. Slowly, he does the math. His face goes the color of his hair.');
        await api.sayMood('arlo', 'surprised', "Oh no. The Hammers. Your grandma. I have rated your grandmother's footwork. For a decade. I have a COLUMN.");
        const c = await api.choose(null, [
          { label: "Tell him you'll tell Grandma. She'll love it.", value: 'tell' },
          { label: 'Ask him to rate her curtsy', value: 'curtsy' },
        ]);
        if (c === 'tell') {
          api.hearts('arlo', 30);
          await api.say('arlo', "Don't! ...Do. ...She'll hate it. ...Tell her it's a 5.0. Tell her I said the curtsy was a 5.0.");
        } else {
          api.hearts('arlo', 15);
          await api.say('arlo', "Curtsy: 5.0. I have a separate column. (He covers his face.) I have a separate column for the curtsy.");
        }
        await api.narrate("The tape on the CRT fuzzes out. Arlo doesn't touch it. He's just looking at the screen like it might blink.");
        api.flag('arlo_sheet');
      },
    },
    // ---------------------------------------------------------------- 8: The tape you've hunted for ten years
    {
      id: 'arlo-8', hearts: 8, map: 'pawn', title: 'Ten Years',
      script: async (api) => {
        await api.narrate("You've brought him a bin tape from the flea market: mold on the casing, label peeled off, a crease across the middle of the reel.", "Arlo takes it like it's an injured bird.");
        await api.say('arlo', 'Hold it. Hold it level. Okay. Okay. Give me an hour and a head-cleaning kit and some prayer.');
        await api.fade();
        await api.narrate("The CRT flickers. A barn full of people. A bell. Two women walking to the ring, back to back, chins up like they own the building.");
        await api.narrate("Arlo sits down very slowly. He takes his glasses off. He puts them back on.");
        await api.say('arlo', "It's the rest of it. It's the second half of the bootleg. The one that cuts out at minute forty. I've been hunting this for ten years.");
        await api.narrate("He is crying freely, without apology, with his hands over his mouth.");
        await api.say('arlo', "I quit my job with no plan. No plan. I have a shop with a misspelled sign and a pot of noodles. I'm terrified every single day.");
        await api.sayMood('arlo', 'happy', "And I have never been happier. I didn't know both could happen at once.");
        const c = await api.choose(null, [
          { label: 'Pull up the second folding chair', value: 'stay' },
          { label: "Tell him you'll give him some room", value: 'room' },
        ]);
        if (c === 'stay') {
          api.hearts('arlo', 30);
          await api.narrate('You sit. The tape plays on. Neither of you speaks for fifty-one minutes.', 'When it ends, the two women bow, and Arlo, quietly, puts a hand over yours on the arm of the chair.');
        } else {
          api.hearts('arlo', 15);
          await api.say('arlo', "No. Stay. Please. I mean, only if you want to. Stay.");
          await api.narrate('You stay.');
        }
        api.flag('arlo_ten_years');
      },
    },
    // ---------------------------------------------------------------- 10: Frame 4,410
    {
      id: 'arlo-10', hearts: 10, map: 'pawn', when: { flag: 'grandma_in_town' }, title: 'Frame 4,410',
      script: async (api) => {
        await api.narrate("Rewind, after hours. The blinds are down. On the counter sits a battered VHS with a water-stained label in Fenwick's handwriting: NOV '83.", "DO NOT. Underneath, in Arlo's: DO.");
        await api.say('fenwick', "Forty years. A basement flood. A tape that wouldn't track at exactly the swing.", "And a man with a head-cleaning kit and no sense of self-preservation.");
        await api.say('arlo', 'Three weeks of work. I think... I think I got it. Come see.');
        await api.narrate('The CRT crackles. The grain clears. A crowd. A ring. Two women in sequins and a belt between them, and then a swing, too fast to follow.', 'Arlo pauses it.');
        await api.say('fenwick', "The belt hits the ring post. Look. Before Birdie. It hits the steel, and then it breaks.");
        await api.say('arlo', "She didn't mean to hit her. A villain doesn't miss. A villain with a broken heart misses.");
        await api.narrate("He steps through the tape, one frame at a time. Click. Click. Click.", "On frame 4,410, Dottie is at the edge of the ring, a half-belt in her hand.");
        await api.narrate("She is crying. And her lips are moving.");
        await api.sayMood('arlo', 'sad', "She regretted it. She regretted it the second she did it.");
        await api.narrate('He says it like a fan who has just solved a mystery. He has no idea how right he is.');
        const c = await api.choose("Arlo's finger hovers over PLAY. Fenwick's hand is on the eject button.", [
          { label: "Ask them to hold it until the time's right", value: 'hold' },
          { label: 'Ask to freeze on 4,410 and look longer', value: 'look' },
        ]);
        if (c === 'hold') {
          api.hearts('arlo', 30);
          await api.say('arlo', "...No. You're right. It's your family's. It's hers. We don't show it till you say.");
          await api.say('fenwick', 'Locked in the safe. The Mothman could not crack it. I tried.');
        } else {
          api.hearts('arlo', 15);
          await api.narrate('You hold on frame 4,410. The Duchess, mid-sob, mouthing a word nobody can read. For a long time, nobody in the room says anything at all.');
        }
        api.flag('arlo_frame');
      },
    },
    // ---------------------------------------------------------------- 12: Behind the Curtain
    {
      id: 'arlo-12', hearts: 12, map: 'pawn', when: { dating: true }, title: 'Behind the Curtain',
      script: async (api) => {
        await api.narrate("Rewind, after closing.", "Arlo is mid-sentence about aspect ratios when Birdie Malone walks in, a ticket stub in her hand with a heart punched out of it.");
        await api.say('birdie', "Pull the blinds, sugar. You're about to learn something nobody learns by watching.");
        await api.narrate("She tells him. It takes four minutes. Arlo stops talking. For the first time in his life, Arlo has nothing to say.");
        await api.narrate("He takes off his glasses. He sets them on the counter.", "He walks out the front door and down Main Street in his cardigan, and keeps walking, and does not look back.");
        await api.narrate("Birdie watches him go. She is not worried. She has seen this walk before. It's a walk that goes toward something.");
        await api.fade();
        await api.narrate("The next evening. The Hot Tag's back booth.", "Arlo slides in with his laptop and a face like somebody who has not slept and has not cried recently and is about to do both.");
        await api.say('arlo', "I spent all day thinking about it. About everything. The spreadsheet. The nine thousand rows.");
        await api.say('arlo', "I thought I was rating fights. I wasn't. I was rating people trusting each other.");
        await api.narrate('He turns the laptop around. A new column on the spreadsheet, in bold at the top of the sheet: TRUST.');
        const c = await api.choose(null, [
          { label: "Tell him the spreadsheet's the truest thing in the business", value: 'true' },
          { label: "Ask what the first TRUST row is", value: 'row' },
        ]);
        if (c === 'true') {
          api.hearts('arlo', 30);
          await api.narrate("He covers his face with both hands. His shoulders shake. When he looks up, he's laughing and crying and grateful.");
          await api.say('arlo', "You're the only person who'd say that. Of course you are.");
        } else {
          api.hearts('arlo', 15);
          await api.say('arlo', "Dex's VFW match. 5.0. Obviously. He trusted a stranger to catch him from fourteen feet. I've never trusted anybody from fourteen inches.");
        }
        await api.say('birdie', "Shop's got a corner for a camera, sugar. ACW needs a video producer. Somebody who knows what a comeback is.");
        await api.sayMood('arlo', 'happy', "I'll do it. I'll do it for free. I'll do it for noodles.");
        api.flag('arlo_curtain');
      },
    },
    // ---------------------------------------------------------------- 14: Two hours, not nine seconds (proposal setup)
    {
      id: 'arlo-14', hearts: 14, map: 'pawn', when: { dating: true, flag: 'arlo_curtain' }, title: 'Not Nine Seconds',
      script: async (api) => {
        await api.narrate("Rewind, dusk.", "A little crowd has gathered outside the front window: Pip with his belt, Fenwick with a thermos, Tiny with an ominously large box,", "a handful of neighbors in the amber light.");
        await api.narrate('The CRT in the window is on. Arlo stands beside it, sweating through his cardigan, remote clutched in both hands like a microphone.');
        await api.say('arlo', "I made you a tape. I edited it myself. It might be a little long.");
        await api.narrate("The picture comes up: the cubicle wall. A bowl of noodles sliding over the top. Your face, startled, in a fluorescent hum.");
        await api.narrate("Then the bus. Then a backyard ring overgrown with weeds. Then a bag of dropped pretzels. Then Dex mid-flip.", "Then your first Saturday, your first match, your first win. Every moment since the clip floor.");
        await api.narrate("It goes on. And on. People start to sit down on the curb. The movie is not nine seconds long. It is two hours.");
        await api.say('arlo', "Because that's the thing about you. You can't cut it down. The comeback is the story. You are the story.");
        await api.narrate('He turns off the tape. The screen glows blue. He holds out the Tag Rope, braided, wound in gold thread.', 'His hand is shaking so hard the tassel dances.');
        const c = await api.choose('The whole street is holding its breath.', [
          { label: 'Hold out your hand, the way you reach for a tag', value: 'tag' },
          { label: 'Cry, nod, and keep nodding for a full two minutes', value: 'nod' },
        ]);
        if (c === 'tag') {
          api.hearts('arlo', 30);
          await api.narrate("You step up and hold your hand out, palm up, as if from the apron. Arlo stares at it.", "Then he laughs, one wet burst, and slaps his hand into yours. 'Tag.'");
        } else {
          api.hearts('arlo', 15);
          await api.narrate("You nod. And nod. By minute two Arlo is nodding too. Pip, in the crowd, says very loudly: 'IS THAT A YES?'");
          await api.say('arlo', "It's a yes! It's a yes! Somebody write it down!");
        }
        await api.narrate("From the curb, Fenwick gravely checks his watch. 'Two hours. Twelve minutes. A new record.'");
        api.flag('arlo_proposal_ready', true);
      },
    },
  ],
} satisfies DialogueSet;
