import type { DialogueSet } from '../types';

/**
 * Royce Penn, 41. The player's MaxxMedia boss (Senior Manager, Short-Form
 * Engagement) in the prologue (flag 'prologue'); in town, the big city's recruiter
 * and, late, the face of the rival promotion. Insider (corporate): he knows how
 * the stories get written down, and that is exactly what drained the magic out of
 * it for him. He is NOT a villain. The pressure is institutional: the algorithm,
 * the metrics, an unseen board.
 *
 * Secretly sentimental and lonely. Divorced (amicably), daughter Maddie, 9. His dad
 * took him to territory shows in Pell's Crossing; there's a foam finger in his
 * desk drawer. His watch buzzes every eleven seconds and gets no signal in town;
 * he keeps checking anyway. Late-game lines key off 'reunion_done'.
 */
export default {
  npc: 'royce',
  intro: [
    "(A lean man in a MaxxMedia quarter-zip glances at his watch, then at you, then at his watch.) Royce Penn.",
    "Senior Manager, Short-Form Engagement. We've met. Several times. Probably in a metrics review.",
    "Great cut last night. Retention's up eleven percent. Can we get it to eight seconds? Seven?",
    "I'm told I come across as intense. I'm told this by a smartwatch. It buzzes whenever I say something intense.",
  ],
  introPublic: [
    "(A man in a spotless quarter-zip and spotlessly clean sneakers picks his way across the gravel like it's a minefield.) Royce Penn.",
    "MaxxMedia. We're... you know what? Is there a signal anywhere in this town?",
    "I asked the diner. The woman handed me a cup of coffee and said, 'Honey, no.' It's a very effective customer service.",
    "I'm here for a talent. A scouting trip. Strictly business. Please don't mention it to the baker; she gave me a bun and it was alarming.",
  ],
  lines: [
    // ---------------------------------------------------------------- The prologue: the clip floor
    { text: "Great cut. Retention's up eleven percent. Can we get it to eight seconds? Seven? What if there's no match, just the pin?", when: { flag: 'prologue' }, weight: 2 },
    { text: "Your numbers are top decile. Do you know what that means? People watch your cuts and don't leave. That's rarer than you'd think.", when: { flag: 'prologue' } },
    { text: "Clip floor is a team sport. Be a team player. That's not a threat. It's a pamphlet.", when: { flag: 'prologue' } },
    { text: "(His watch buzzes. He checks it. It buzzes again. He checks it again.) Eleven seconds. Always eleven. I don't know why.", when: { flag: 'prologue' } },
    { text: "Don't take it personally. The algorithm doesn't have a heart. It has a retention cliff.", when: { flag: 'prologue' } },
    { text: "Go home. Sleep. Come back with fresh eyes. Preferably with fewer feelings.", when: { flag: 'prologue' } },

    // ---------------------------------------------------------------- Town: the recruiter, out of his element
    { text: "We need your eye. That's all I'm saying. Your old desk, a raise, a window. The offer's open.", when: { notFlag: 'prologue', hearts: [0, 5], place: ['public'] }, weight: 2 },
    { text: "Dex has talent. That kid can fly. MaxxMedia can give him a platform. A real one. I'm not here to take anybody. I'm here to open a door.", when: { notFlag: 'prologue', hearts: [0, 5], place: ['public'] } },
    { text: "These sneakers have never touched gravel. I'd like to say they've seen worse. They haven't.", when: { notFlag: 'prologue', hearts: [0, 4] } },
    { text: ["A folding chair. At a professional event. With no lumbar support. I've been sitting at a 74-degree angle for two hours. I've asked Doc.", "He laughed. Slowly."], when: { showDay: true, notFlag: 'prologue' } },
    { text: "Your shows are loud and organic. I mean authentic. Nobody here knows what an engagement funnel is, and the crowd still leans in.", when: { notFlag: 'prologue', place: ['public', 'show'], hearts: [3, 10] } },
    { text: "The motel has a leak shaped like Ohio. I named it Bartholomew. We're not speaking.", when: { notFlag: 'prologue', weather: ['rain', 'storm'] } },
    { text: "The diner woman gave me a chipped mug. She said it's 'for people who think they're special.' I think it was personal.", when: { notFlag: 'prologue', hearts: [3, 10] } },
    { text: "My daughter Maddie's nine. She loves wrestling more than I do now. Which, fair. She'd love this place.", when: { notFlag: 'prologue', hearts: [3, 10] }, mood: 'happy' },
    { text: ["I grew up in a town like this. Pell's Crossing, two counties over. A feed store, a church, and a Friday night show at the VFW.", "It all came back in the car."], when: { notFlag: 'prologue', hearts: [3, 10] } },
    { text: "A funnel cake. At a fairground. In the sun. I'm eating it. I'm telling no one. If you tell anyone, I'll file a report on myself.", when: { notFlag: 'prologue', hearts: [3, 8], map: ['fair'] } },

    // ---------------------------------------------------------------- Seasons
    { text: "Spring here is a lot of greenery. Something is blooming at the motel that's pollinating my entire face.", when: { notFlag: 'prologue', season: [0] } },
    { text: "Fairgrounds Fury: the one weekend a year I park my phone in the car. I wrote 'ironically' on the calendar. In pencil.", when: { notFlag: 'prologue', season: [1], hearts: [3, 10] } },
    { text: "Fall here is a real season. Leaves, apples, a pumpkin the size of a love seat. In the city fall just means we change the lanyard color.", when: { notFlag: 'prologue', season: [2] } },
    { text: "Winter. A Homecoming, a Hall of Fame. The company would call it a 'legacy content moment.' Please remember I didn't say that out loud.", when: { notFlag: 'prologue', season: [3] } },

    // ---------------------------------------------------------------- Rank and alignment
    { text: "You've got heat. Actual crowd heat. We pay consultants for that. You do it with a sneer. Respect.", when: { place: ['public'], alignment: ['heel'], flag: 'debuted', notFlag: 'prologue' } },
    { text: ["The crowd's chanting your name. In the metrics world that's nothing. We can't measure it.", "It's the best thing I've ever seen not be measured."], when: { place: ['public'], alignment: ['face'], flag: 'debuted', notFlag: 'prologue' } },
    { text: "Main event. The numbers are... let me look. (His watch buzzes. He doesn't check it.) No. I'm not going to look. I'm just going to watch.", when: { rank: ['main'], notFlag: 'prologue' }, mood: 'happy' },

    // ---------------------------------------------------------------- Insider: the man upstairs
    { text: ["Arlo had a spreadsheet of every match he'd ever seen. Eleven thousand rows. He believed every one.", "I envied him so much I couldn't look at him."], when: { place: ['insider'], hearts: [6, 10] }, mood: 'sad' },
    { text: ["Thirty-first floor, they write it down. The stories. Dates, finishes, beats. I used to believe, you know. All of it.", "Then they promoted me to the floor where they write it down."], when: { place: ['insider'], hearts: [6, 10] }, mood: 'sad' },
    { text: "I keep a foam finger in my desk drawer. Number one. I was nine. My dad took me to Pell's Crossing. Don't tell anyone.", when: { place: ['insider'], hearts: [6, 10] } },
    { text: "Birdie Malone can smell a corporate lanyard from the county line. I don't know why I find that so comforting.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Maddie told her mother she wants to live here. Her mother said 'we'll see.' Maddie said, 'Mom, that's what you say when it's already yes.'", when: { place: ['insider'], hearts: [8, 10] }, mood: 'happy' },

    // ---------------------------------------------------------------- Late game: Heartland and after
    { text: "Per my last email, your title shot has been... reprioritized.", when: { flag: 'reunion_done', place: ['public'], notFlag: 'royce_box' } },
    { text: "(He fixes his lanyard like a lasso.) The Quarterly Review is concluded. You'll receive notes. Many notes. In triplicate.", when: { flag: 'reunion_done', place: ['public'], notFlag: 'royce_box' } },
    { text: "Wasn't me. I mean, it was. It's a character. The Executive. He's a monster. I like him. Don't tell Birdie.", when: { flag: 'reunion_done', place: ['insider'], notFlag: 'royce_box' }, mood: 'smug' },
    { text: "The foam finger's on my desk now. Not in the drawer. On the desk. In the open. Where people can see it.", when: { flag: 'royce_box' }, mood: 'happy', weight: 3 },
  ],
  gifts: {
    loves: ['foam-finger', 'polaroid', 'cassette', 'tiny-cake'],
    likes: ['funnel-cake', 'coffee', 'corn-dog', 'chili-dog'],
    dislikes: ['teacup', 'gas-hotdog', 'bait'],
  },
  giftReplies: {
    love: [
      "(He holds it very still. His watch buzzes. He doesn't check it.) I had one of these. Almost exactly this. I was nine.",
      "This is... (His voice catches.) Where did you find this? No. Don't tell me. I'm going to keep it in a drawer and look at it.",
      "(He turns it over once, reverently.) I haven't thought about that in thirty years. Thank you. That's... thank you.",
    ],
    like: [
      "Oh. That's a very efficient gift. I mean that as a compliment. It's the highest one I've got.",
      "Thank you. I'm going to enjoy this at a normal, non-optimized pace.",
    ],
    neutral: [
      "Thank you. I'll add it to the pile. There's a pile.",
      "A gift. Okay. That's thoughtful. I'm going to need a moment to process the feeling.",
    ],
    dislike: [
      "...Is this a bit? Is everyone in this town doing a bit?",
      "Thank you. I'll put this somewhere I won't look at it. A drawer. A different drawer.",
      "(He holds it at arm's length.) Per my last email, I don't want this. ...I didn't send an email. I'm just. Thank you.",
    ],
    birthday: [
      "You remembered my birthday? I didn't even... okay. Okay. I'm putting a pin in this. A very positive pin.",
      "Maddie says you should come to cake. I said you're busy. She said, 'Dad, ask.' So. I'm asking.",
    ],
  },
  birthday: { season: 2, day: 11 },
  events: [
    // ---------------------------------------------------------------- 2 (prologue): Close the door
    {
      id: 'royce-2', hearts: 2, map: 'maxx-office', when: { flag: 'prologue' }, title: 'Close the Door',
      script: async (api) => {
        await api.narrate("The glass office on the clip floor. Royce stands facing a window of city lights, tumbler in hand.", "The tumbler says: WINNERS ARE JUST LOSERS WHO KEPT CLICKING.");
        await api.say('royce', "Come in. Close the door. Don't sit. Sitting is a commitment.");
        await api.say('royce', "Your retention numbers. Top decile. Do you understand what that means?");
        await api.say('royce', "People watch your cuts and don't leave. In this building, that's the closest thing we have to a miracle.");
        await api.narrate("His watch buzzes. He glances at it, then at you, then, with visible effort, at neither.");
        await api.say('royce', "I'm going to ask you something that has nothing to do with work. And I need you not to write it down.");
        await api.say('royce', "Have you ever been to a territory show? A real one. A VFW hall. Folding chairs. Somebody's uncle running the sound.");
        const c = await api.choose(null, [
          { label: 'Tell him about watching tapes with your grandmother', value: 'tapes' },
          { label: 'Say no, never. Ask why he asked.', value: 'no' },
        ]);
        if (c === 'tapes') {
          api.hearts('royce', 30);
          await api.narrate('He is quiet for four seconds. His watch buzzes twice. He lets it.');
          await api.sayMood('royce', 'happy', "...Huh. Okay. That's good for you. That's really good for you.");
        } else {
          api.hearts('royce', 15);
          await api.say('royce', "No reason. A memory. A foam finger. It's nothing.");
        }
        await api.say('royce', "Never mind. Close the door.");
        api.flag('royce_2_seen');
      },
    },
    // ---------------------------------------------------------------- 4: The chipped mug
    {
      id: 'royce-4', hearts: 4, map: 'diner', title: 'The Chipped Mug',
      script: async (api) => {
        await api.narrate("The Hot Tag Diner. Royce, in a MaxxMedia quarter-zip and spotless sneakers, perches on a counter stool like a heron on a milk crate.", "June sets a mug in front of him without a word.");
        await api.narrate("It's chipped at the handle. It reads WORLD'S OKAYEST CUSTOMER. Every head at the counter has turned very slightly toward him.");
        await api.say('royce', "...Why is everyone looking at me?");
        await api.narrate("Gus, at the end of the counter, mimes a tiny, solemn salute. Mo lowers her fork. Somewhere in the kitchen, a spatula stops.");
        await api.say('june', "That's the mug, baby. Last man who sat there said 'synergy' to me. That's why the handle's gone.");
        await api.say('royce', "The mug is for... what? Is it a... does it have a meaning?");
        const c = await api.choose('Everyone is waiting. So is Royce.', [
          { label: "Tell him it's an audition. Drink the whole thing.", value: 'audition' },
          { label: "Tell him June hasn't decided about him yet.", value: 'decide' },
        ]);
        if (c === 'audition') {
          api.hearts('royce', 30);
          await api.narrate("You explain: nobody gets the good mug until they've finished the chipped one. It means you've been seen. It means June is considering you.");
          await api.narrate('Royce stares at the mug. Then at June.', 'Then he starts to laugh, a real one, from somewhere deep in a ribcage that has not been used for this in years.');
          await api.sayMood('royce', 'happy', "I'm going to drink the whole thing. I'm going to drink it like it's the last drink in the world.");
        } else {
          api.hearts('royce', 15);
          await api.say('royce', "So I'm... on probation? In a diner? That's... that's the most honest performance review I've ever had.");
          await api.narrate('He takes a sip. His eyebrows go up. He takes another.');
        }
        await api.narrate("His watch buzzes. He doesn't check it. In the corner of the booth, Gus nods slowly, like a man witnessing a title change.");
        api.flag('royce_mug');
      },
    },
    // ---------------------------------------------------------------- 6: The bleachers
    {
      id: 'royce-6', hearts: 6, map: 'fair', title: 'Pell\'s Crossing',
      script: async (api) => {
        await api.narrate('The fairgrounds, long after the crowd has thinned.', 'You find Royce on the top row of the grandstand with a funnel cake in his lap, powdered sugar all over his quarter-zip,', 'looking at the empty ring.');
        await api.say('royce', "Don't tell anyone about the funnel cake. I'll deny it. I'll deny it on the stand.");
        await api.narrate('He tears off a piece and hands it to you without looking, an act of tiny surrender.');
        await api.say('royce', "I grew up in Pell's Crossing. Two counties over. My dad drove a truck.", "On Fridays, he took me to the VFW and we watched people in capes hit each other with folding chairs.");
        await api.say('royce', "I had a foam finger. Number one. I held it up for two hours and my arm fell asleep and I wouldn't put it down.");
        await api.sayMood('royce', 'sad', "I used to believe it. All of it. Then I got promoted to the floor where they write it down.");
        const c = await api.choose(null, [
          { label: 'Sit down and share the funnel cake', value: 'share' },
          { label: 'Ask if he still has the foam finger', value: 'finger' },
        ]);
        if (c === 'share') {
          api.hearts('royce', 30);
          await api.narrate('You sit. You eat funnel cake. Under the grandstand lights, the two of you watch an empty ring.');
          await api.say('royce', "I haven't sat still like this in... I don't know. Since the divorce. The nice one. We're still friends.");
        } else {
          api.hearts('royce', 15);
          await api.say('royce', "Desk drawer. Bottom left. I check on it. ...That's insane. Forget I said that.");
        }
        await api.narrate("His watch buzzes. He looks at it. He turns it off. It is the first time you've seen him do that.");
        api.flag('royce_pells');
      },
    },
    // ---------------------------------------------------------------- 8: Maddie
    {
      id: 'royce-8', hearts: 8, map: 'sportatorium', when: { showDay: true, weekday: [5] }, title: 'Maddie',
      script: async (api) => {
        await api.narrate("A Saturday at the Sportatorium. Royce sits in the third row on a cushion he swears is for his back.", "Next to him, a nine-year-old in a homemade cardboard belt is screaming at a villain with the force of a small hurricane.");
        await api.say('royce', "Maddie. Maddie! Indoor voice! ...Okay, it's a wrestling show. Outdoor voice. Maddie, that's a leg drop.");
        await api.narrate("She doesn't hear him. She is completely, utterly alive. Her whole body is a fist, a held breath, a hallelujah.");
        await api.narrate('She spots you between bouts and gasps, wide-eyed.');
        await api.narrate("\"You're the one with the ring name! You're my second favorite! My first is the Mountain, because I think he's secretly nice!\"");
        await api.fade();
        await api.narrate("After the show, by the merch table. Maddie sleeps on her father's shoulder, hoarse and sticky, the belt crooked on her chest.", "Royce stands still so he won't wake her.");
        await api.say('royce', "On the way out she told me she wants to live here. I said it's a long drive. She said, 'Dad, that's the point.'");
        await api.say('royce', "I sat in a folding chair for four hours and my daughter looked at me like I was somebody. And I didn't do anything. I just sat there.", "And she looked at me.");
        await api.sayMood('royce', 'sad', "Is it possible to get it back? The feeling?");
        const c = await api.choose(null, [
          { label: "Say yes. He never lost it. He kept it in a drawer.", value: 'drawer' },
          { label: "Say you don't get it back. You let it in.", value: 'letin' },
        ]);
        if (c === 'drawer') {
          api.hearts('royce', 30);
          await api.narrate("He doesn't say anything.", "But he hitches Maddie a little higher on his shoulder, and his hand finds the back of her head, very gently, and stays there.");
        } else {
          api.hearts('royce', 15);
          await api.say('royce', "Let it in. (He turns it over, like a data point.) ...That's not very actionable. I love it.");
        }
        api.flag('royce_maddie');
      },
    },
    // ---------------------------------------------------------------- 10: The cardboard box
    {
      id: 'royce-10', hearts: 10, when: { flag: 'reunion_done' }, title: 'The Cardboard Box',
      script: async (api) => {
        await api.narrate("A knock at your door, late, in a drizzle.", "You open it and find Royce Penn on the step, a cardboard box in both arms, hair uncharacteristically unflattened, lanyard nowhere.");
        await api.say('royce', "I resigned. Or I was let go. It's a distinction without a difference, which I'd put in a memo, if I had a memo.");
        await api.narrate("He sets the box on the porch rail. Inside: a foam finger, number one, faded to the color of old pennies.", "A forty-page letter, mostly star ratings. A dozen crayon drawings in the careful loops of a nine-year-old.");
        await api.say('royce', "Arlo's letter. Maddie's drawings. My dad's foam finger. They were in the desk. I... they were the only things I wanted.");
        await api.narrate("His watch buzzes. He takes it off, wraps it in the lanyard, and sets it carefully on top of the box.");
        await api.say('royce', "I want to build something that lasts longer than nine seconds.");
        await api.sayMood('royce', 'sad', "Will you teach me?");
        const c = await api.choose(null, [
          { label: "Say yes. Hand him a broom. 'First, you sweep the ring.'", value: 'yes' },
          { label: "Say you'll think about it. Make tea.", value: 'think' },
        ]);
        if (c === 'yes') {
          api.hearts('royce', 30);
          await api.narrate("He takes the broom like it's a sword. He looks at it, then you, then the broom again.");
          await api.sayMood('royce', 'happy', "I've been a vice president of three departments. I've never swept anything. ...I'll be very good at it.");
        } else {
          api.hearts('royce', 15);
          await api.say('royce', "Take your time. I've got... (He glances at his wrist. There's no watch. He laughs.) ...time. I've got time.");
        }
        await api.narrate("Somewhere down the creek road a dog barks twice. The drizzle stops.");
        api.flag('royce_box', true);
      },
    },
  ],
} satisfies DialogueSet;
