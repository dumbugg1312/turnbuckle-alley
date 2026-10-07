import type { DialogueSet } from '../types';

/**
 * Maribel "Mo" Dizon: mail carrier, ACW senior referee, moth surveyor.
 * Romanceable. Secretly the Mothman (CAST Part 8): her lines never say so,
 * but they are full of fair-play clues (the route, the red headlamp, threes,
 * the stump, moths). Lines about it only appear after 'mothman_revealed',
 * which mothman.ts sets in its 10-heart event, and only in insider rooms.
 * Knows everyone's business through the mail and never repeats a word.
 */
export default {
  npc: 'mo',
  intro: [
    "You're the new one at the house at the end of Elm. Nine years I've delivered a tax bill there every spring. Never a person to hand it to.",
    "Mo Dizon. I carry the mail, and on show nights I carry the count. Same skill, honestly. Show up. Be exact.",
    "Birdie says you're training. Welcome. Don't lean on the ropes in front of Hank.",
    "I'll see you on the route. I see everybody on the route.",
  ],
  introPublic: [
    "Mail for the house at the end of Elm. First time in nine years it's had a person to hand it to.",
    "Maribel Dizon. Everybody says Mo. Mail carrier. On show nights, the referee. I call what I see.",
    "Your mailbox flag's broken. I'll fix it tomorrow. I fix all the flags. Nobody notices. That's fine.",
  ],
  lines: [
    // ---- Strangers, on the route
    { text: "Morning. Route's on time. Route's always on time. It's the one thing in my life that always is.", when: { hearts: [0, 2], place: ['public'] } },
    { text: "Mr. Abernathy says I missed a foot on the rope Saturday. I call what I see. Here's his pharmacy flyer.", when: { hearts: [0, 5], place: ['public'] } },
    { text: "Nine years on this route. I know every dog by name and every name by handwriting.", when: { hearts: [0, 2] } },
    { text: "The raccoon from the Sportatorium follows me every morning. I give him one cracker. He acts like it's a contract.", when: { hearts: [0, 5] } },
    { text: "See a red light on the creek road at five a.m.? That's my headlamp. Red keeps your night vision. Don't let Fenwick tell you otherwise.", when: { hearts: [0, 5] } },
    { text: "Looking for Birdie? Sportatorium office. Knock three times. She likes threes. So do I.", when: { notFlag: 'met_birdie' }, weight: 3 },
    { text: "Five a.m. on the creek road is the quietest place on earth. Just me, the fog, and a raccoon who wants my crackers.", when: { time: [270, 480] } },
    { text: "Agnes is waiting at her mailbox. It's Monday. She'll have notes on my refereeing. She always has notes.", when: { weekday: [0], time: [600, 720] } },
    { text: "Fenwick's at noon. He'll have a new theory. I'll nod. It's a big part of the job nobody trains you for.", when: { time: [660, 780], weekday: [0, 1, 2, 3, 4, 5] } },
    { text: "Poncho weather. People can see the orange from a block away. Good. A mail carrier should be seen. Somebody should.", when: { weather: ['rain', 'storm'] } },
    { text: "Wind's fighting me for the catalogs. I'm winning. I'm always winning. I have a technique.", when: { weather: ['wind'] } },
    { text: "Snow route. Twelve miles, two pairs of wool socks, one thermos. I love it more than I'm going to admit in public.", when: { weather: ['snow'] } },

    // ---- Show days and the ring
    { text: "Show tonight. Stripes are pressed. Shoes are laced. I'm impartial. I'm also hoping nobody bumps me into the timekeeper again.", when: { showDay: true, place: ['public'] } },
    { text: "VFW tonight. Bingo after. I referee both. Nobody believes me about the bingo. It gets physical.", when: { weekday: [2], showDay: true } },
    { text: "Saturday. Two thousand people and one count. I'll get it right. I always get it right.", when: { weekday: [5], showDay: true, place: ['public', 'show'] } },
    { text: "Saw you choke {opponent} on the ropes. I counted to four. You broke at four. I'll be watching for five.", when: { place: ['public'], alignment: ['heel'], lastMatch: { maxDaysAgo: 5 } } },
    { text: ["I counted your three on {opponent}. Same speed as always. One. Two. Three.", "...The three was a little louder. Nobody noticed. I noticed."], when: { place: ['insider'], lastMatch: { won: true, maxDaysAgo: 3 } }, mood: 'happy' },
    { text: "{opponent} got you. I was down there with you for the count. Your eyes were open the whole time. Mine too. People think refs blink on the count. I don't.", when: { place: ['insider'], lastMatch: { won: false, maxDaysAgo: 3 } } },
    { text: "Folks keep telling me to count faster for you. I count the same for everybody. One. Two. Three. Same speed nine years.", when: { place: ['public'], alignment: ['face'], flag: 'debuted' } },

    // ---- Friends, public
    { text: "Your fan mail's picking up. I'm not supposed to notice. I notice. There's a crayon one. I won't say who. It's Pip. I didn't say that.", when: { hearts: [3, 8], flag: 'debuted' } },
    { text: "Everybody in this town gets a seed catalog in March. Every single person. I don't know who's growing all these tomatoes.", when: { hearts: [3, 10] } },
    { text: "I know what's in an envelope by the weight and the shape. I'll never tell a soul. Except birthday cards. Those jingle.", when: { hearts: [3, 10] } },
    { text: "Agnes yelled at me about a missed call for twenty minutes today. Then she gave me a butterscotch. That's love in this town.", when: { hearts: [3, 8], place: ['public'] } },
    { text: "Spring. Every mailbox flag in town is up. It looks like the whole street's waving at me.", when: { season: [0] }, weight: 2 },
    { text: "Summer route. My farmer's tan stops so sharp at the sleeve you could set a ruler by it. I've checked.", when: { season: [1] } },
    { text: "Fall's the best route. Leaves in the mailboxes. I pick them out. Most carriers don't. Most carriers aren't me.", when: { season: [2] } },
    { text: "Winter dark at five a.m. is softer. Like the whole town's still under a blanket and I'm tiptoeing past.", when: { season: [3] } },
    { text: "Sunday. No route. I slept till seven. Felt like a criminal. Calling my mom later. She'll ask if I'm eating. I'll lie.", when: { weekday: [6] } },
    { text: "Can't talk long. Monday nights I count moths in the woods behind the water tower. Citizen science. It's a whole thing.", when: { weekday: [0], time: [1140, 1439] } },

    // ---- Friends, insider
    { text: "The ref bump is the hardest move in wrestling. You fall like nobody's catching you. Because nobody is.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Birdie tells me every finish before the show. I'm the only one who always knows. That's a lot of secrets under one striped shirt.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: ["I trained to wrestle, you know. Nine years ago. Birdie needed a ref more.", "I said yes. I always say yes. ...It was a good yes."], when: { hearts: [3, 8], place: ['insider'] } },
    { text: "The Sack of Mail. Through the ropes, to the floor, roll under the apron. Under there it's dark and quiet. Best seat in the house.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Doc says I take bumps like a sack of mail. I've decided it's a compliment. Nobody can stop me.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Refs are furniture. Good furniture. Nobody thanks the chair, but try sitting down without one.", when: { hearts: [3, 8], place: ['insider'] } },
    { text: "Finish tonight's off a ref bump. I go down around twelve minutes. Don't step on my hand. I need it for counting.", when: { showDay: true, place: ['insider'] } },
    { text: "Crooked ref for one week, max. I've got a route to walk. People need to trust the person bringing their mail.", when: { hearts: [3, 10], place: ['insider'] } },
    { text: "Openers rush. Breathe between spots. I'll be right there counting your breaths. Kidding. Mostly.", when: { rank: ['rookie', 'opener'], place: ['insider'] } },
    { text: "Main event. You know what that means for me? I'm in there for your whole story. Best seat. I don't take it for granted.", when: { rank: ['main'], place: ['insider'] } },
    { text: "You've got the pencil now. Write me a ref bump I can be proud of. Something with flair. I've got flair. It's folded up.", when: { rank: ['assistant', 'pencil', 'owner'], place: ['insider'] } },

    // ---- Close
    { text: "You're on my route every day now. Not literally. I mean I look for you. ...That came out formal. I'm keeping it.", when: { hearts: [6, 8], place: ['public'] } },
    { text: "Somebody's been leaving honey on the stump by the water tower. Fenwick's beside himself. I just deliver the mail.", when: { hearts: [6, 10] } },
    { text: "Best referee in the territory, Birdie says. Last week a man at the post office asked if I'd ever been to a match. I said a few.", when: { hearts: [6, 8], place: ['insider'] }, mood: 'sad' },
    { text: "Two hundred and twelve species behind the water tower. Everybody thinks a moth at a light is dumb. I think it's brave.", when: { hearts: [6, 14], place: ['insider'] } },
    { text: "Middle of five kids. In my family the middle one brings the paper towels. Thirty-three years old. Still bringing the paper towels.", when: { hearts: [6, 14], place: ['insider'] } },
    { text: "Under the ring is a whole other building. Crawlspace, wiring, ladders. Hank keeps one side. Nobody keeps the other. Supposedly.", when: { hearts: [6, 10], place: ['insider'] } },
    { text: "Lou's Monday envelope. Nine years. Same address, same handwriting, padded like something precious. I've never once asked.", when: { hearts: [6, 14], place: ['insider'], notFlag: 'grandma_in_town' } },
    { text: ["The Monday envelopes stopped. Nine years, never missed. They stopped the week your grandmother moved into the Bell.", "D. Dupree. I never let myself read an address twice. I read that one every Monday."], when: { hearts: [6, 14], place: ['insider'], flag: 'grandma_in_town' }, mood: 'sad' },

    // ---- Family
    { text: "I've counted ten thousand pins. I'd remember yours if I was ninety and forgot my own address.", when: { hearts: [9, 14], place: ['public'] } },
    { text: "You see me. In stripes, in the poncho, in the dark. You keep seeing me. Nobody's done that in a long time.", when: { hearts: [9, 14], place: ['insider'] }, mood: 'love' },

    // ---- After the Mothman reveal (insider rooms only, and carefully)
    { text: "Don't say it. Not even in here. Gideon has ears like a bat. ...Like a moth, actually. Moths have great ears. Look it up.", when: { flag: 'mothman_revealed', place: ['insider'] } },
    { text: "Somebody was very good at their job Saturday. Forty seconds at a time. I hear the crowd was loud. I hear Agnes fainted. Briefly.", when: { flag: 'mothman_revealed', place: ['insider'] } },
    { text: "Thanks for the honey. ...On the stump. Somebody told me about it. Somebody very grateful.", when: { flag: 'mothman_revealed', place: ['insider'] }, mood: 'love' },
    { text: "Fenwick told me a new theory today. It pupates under the ring. I said 'fascinating.' I said it with a straight face. Be proud.", when: { flag: 'mothman_revealed' } },

    // ---- Dating and married
    { text: "We're on a date. Officially. I logged it. In my head. There's a column.", when: { dating: true, place: ['public'] } },
    { text: "People at the post office keep smiling at me. It's you. It's because of you. I don't know what to do with my face.", when: { dating: true } },
    { text: "I like that you're here before the show. Steadies the count. Don't let it go to your head. It's already in mine.", when: { dating: true, place: ['insider'] } },
    { text: "Next Monday night, come count moths with me. Bring a sweater. I'll bring the good thermos. The one with no dents.", when: { dating: true } },
    { text: "Mail's here. Also me. Also I made coffee. That's three things. Good things come in threes.", when: { married: true } },
    { text: "Married to the ref. Contractually I count your pins at the same speed as everybody's. I'll count them proudly, though.", when: { married: true, place: ['insider'] } },

    // ---- Main story
    { text: "I carried her half of it every Monday for nine years and never knew. Padded envelopes. I always held them with both hands. I didn't know why.", when: { flag: 'truth_revealed', place: ['insider'] } },
    { text: "Two old ladies at the Hot Tag counter, and the whole town walking past the window slow. Nine years on this route. Best mail day ever.", when: { flag: 'reunion_done' }, mood: 'happy', weight: 3 },
  ],
  gifts: {
    loves: ['honey', 'coffee', 'feather'],
    likes: ['wildflowers', 'river-stone', 'concha', 'pie', 'lemonade'],
    dislikes: ['bait', 'scrap', 'fiber'],
  },
  giftReplies: {
    love: [
      "Oh. Oh, this is good. I'm going to think about this the whole route tomorrow. All twelve miles.",
      "I don't know where to put being thanked. I'll put it in the satchel. Right on top.",
      "You noticed. Nobody notices what the mail carrier likes. Best lunch of my year, in the truck, with this.",
    ],
    like: [
      "Thank you. That's nice. That's genuinely nice. I'm logging it.",
      "For me? Okay. Okay! That's a good day on the route.",
      "Very kind. I'll carry it carefully. I carry everything carefully.",
    ],
    neutral: [
      "Thank you. I'll find a place for it. I'm good at sorting.",
      "A package. For the mail carrier. That's a reversal. I'll allow it.",
    ],
    dislike: [
      "I carry four pounds of this a day. Please. I'm begging you.",
      "That's going in the recycling. Respectfully. On a Tuesday.",
      "I'm not going to say anything. I'm going to say thank you. Thank you. That was hard.",
    ],
    birthday: [
      "I deliver everybody's birthday cards. Mine I usually deliver to myself. And now a {item}, hand-delivered. I'm going to cry on the route.",
      "A birthday {item}. Hand-delivered. To the carrier. That's three of my favorite things at once. Threes are good.",
    ],
    byItem: {
      honey: "Fairgrounds honey. The dark kind. (She holds it up to the light like she's checking a postmark.) ...This is going somewhere very specific. Thank you.",
      coffee: "June's dawn coffee. In a thermos? You got up before five for this. Nobody gets up before five. Except me. And now you.",
      feather: ["A moth wing. Polyphemus, by the size. Where'd you... no. The creek road, near the stump. I know.", "(She puts it in her satchel, in the inside pocket, very carefully.) I'll log it. For the survey."],
      wildflowers: "Creek flowers. I'll put them in the truck, in the cupholder. The route smells like a field for a day.",
      'river-stone': "A smooth one. I'll keep it on the dash. Every route needs something to hold at a red light. We have one red light.",
      concha: "A concha. I eat these on the porch at the end of Elm, where nobody's lived for nine years. Well. Somebody lives there now.",
      pie: "Pie for lunch in the truck. Agnes is going to see the box and ask whose crust it is. Agnes will be correct.",
      lemonade: "Fair lemonade on a route day. You're a lifesaver. That's not a phrase. I've passed out on Elm in August. Twice.",
    },
    later: [
      "The {lastGift} rode the whole route with me Tuesday. Twelve miles. It's been to every house in town now.",
      "Somebody on the route asked about the {lastGift}. I said it came in the mail. That's true, kind of. You're the mail now.",
    ],
  },
  again: [
    "Still on the route. I can walk and listen. I can't walk and stop.",
    "(Mo holds up three fingers as she passes. Third time today? Second. She rounds up.)",
    "We talked. I logged it. There's a column.",
  ],
  idle: [
    "(Mo is sorting mail on the go, without looking, in perfect order.)",
    "Morning. Route's on time. Got to keep it that way.",
  ],
  birthday: { season: 1, day: 6 },
  events: [
    {
      id: 'mo-2', hearts: 2, title: 'Special Delivery',
      script: async (api) => {
        await api.narrate('Mo comes up your walk at exactly 9:02, holding one envelope out in both hands, like a flag being folded.');
        await api.say('mo', 'Hand delivery. Signature required.');
        await api.say('mo', 'I made up the signature part. Sign anyway. It\'s a moment.');
        await api.narrate("It's addressed to you in shaky blue ink. Return address: the Evening Bell Residence. Your first piece of fan mail.");
        await api.say('mo', "I'm not going to leave. I'm going to stand right here and watch your face. That's my favorite part of the whole job.");
        const c = await api.choose(null, [
          { label: 'Read it out loud', value: 'aloud' },
          { label: 'Read it quietly, then show her', value: 'quiet' },
        ]);
        if (c === 'aloud') {
          api.hearts('mo', 30);
          await api.narrate("'Dear Newcomer. I hear you will wrestle. Your posture needs work and so does your hem. I will be watching. Velma Ruiz, age 90.'");
          await api.sayMood('mo', 'happy', "Velma. She writes the Tattler about hems. You've been critiqued by a legend. Best review in town.");
        } else {
          api.hearts('mo', 15);
          await api.narrate('It\'s from Velma Ruiz, age 90, who has notes on your posture and your hem. Mo watches your face the whole time.');
          await api.sayMood('mo', 'happy', "There it is. That face. Nine years and it never gets old.");
        }
        await api.narrate("She tips an imaginary cap. By the time you look up, she's two houses down. Exactly on schedule.");
      },
    },
    {
      id: 'mo-4', hearts: 4, map: 'sportatorium', title: 'The Route', when: { showDay: true },
      script: async (api) => {
        await api.narrate('The locker room before the show. Mo sits on the bench lacing her referee shoes. Three tugs on each lace. Never two.');
        await api.say('mo', "Want to hear something stupid? I say my route in my head before every show. It calms me down. It's like a poem.");
        const c = await api.choose(null, [
          { label: 'Say it out loud. I want to hear it.', value: 'aloud' },
          { label: "That's not stupid.", value: 'kind' },
        ]);
        if (c === 'aloud') {
          api.hearts('mo', 30);
          await api.say('mo', 'Out loud? Nobody\'s ever asked. Okay. Okay.');
        } else {
          api.hearts('mo', 15);
          await api.say('mo', "It's a little stupid. I like it anyway. Here.");
        }
        await api.say('mo', 'Elm. Oak. The creek road at five. The water tower at twenty to six.');
        await api.say('mo', 'The Bell at ten. Fenwick at noon, God help me.');
        await api.narrate('She ties the last knot. Three tugs.');
        await api.say('mo', 'Same route nine years. I could walk it blind. Some mornings in the fog, I basically do.');
      },
    },
    {
      id: 'mo-6', hearts: 6, map: 'diner', title: 'Furniture',
      script: async (api) => {
        await api.narrate("After a show. The back booth. Mo's stripes are unbuttoned over a T-shirt, and she's eating June's fries one at a time, very precisely.");
        await api.say('mo', "Gus said everybody's name tonight. Big intro. Fourteen seconds each. He said mine once. Fast. 'And your referee.'");
        await api.say('mo', "It's fine. It's the job. Best referee in the territory. You know what that means?");
        await api.sayMood('mo', 'sad', 'It means nobody remembers I was there.');
        const c = await api.choose(null, [
          { label: 'I remember.', value: 'remember' },
          { label: 'Do you want them to?', value: 'want' },
        ]);
        if (c === 'remember') {
          api.hearts('mo', 30);
          await api.narrate('Mo looks at you. Then at her fries. Then at you again, like she\'s double-checking a count.');
          await api.say('mo', "...Okay. That's one person. One's a start. I'm good at counting up from one.");
        } else {
          api.hearts('mo', 15);
          await api.say('mo', "Want? I don't know. Maybe for forty seconds. Just forty seconds, once, where two thousand people can't look away.");
          await api.narrate("She says it lightly, eats another fry, and doesn't look at you.");
        }
        await api.say('mo', "June can never know I got sentimental in her booth. Rule three's about Birdie, but I think it covers me.");
      },
    },
    {
      id: 'mo-8', hearts: 8, map: 'sportatorium', title: '212 Species', when: { showDay: true },
      script: async (api) => {
        await api.narrate('After the show, Mo pulls a battered notebook from her satchel. The cover says MOTHS in careful block capitals.');
        await api.say('mo', 'Monday nights I hang a white sheet in the woods behind the water tower and shine a UV lamp on it. Then I count who shows up.');
        await api.say('mo', "Two hundred and twelve species. I send the numbers to a university. Nobody there's ever met me. I like that.");
        await api.narrate('Every moth is sketched in pencil. One fills a whole page: big, dusty brown, with two pale eye-spots on its wings.');
        await api.say('mo', "Polyphemus moth. My favorite. The eye-spots scare off birds. Up close they just look surprised. Dressed up for something.");
        await api.sayMood('mo', 'love', "People think a moth flying at a light is dumb. I think it's brave. Going toward the one bright thing, even when you look silly doing it.");
        const c = await api.choose(null, [
          { label: 'Show me the survey sometime?', value: 'show' },
          { label: "You don't look silly.", value: 'silly' },
        ]);
        if (c === 'show') {
          api.hearts('mo', 30);
          await api.say('mo', "Monday. Nine p.m. Bring a sweater and don't wear bug spray. They're shy.");
        } else {
          api.hearts('mo', 15);
          await api.say('mo', "I'm a little silly. I keep it folded up. Most days.");
        }
        await api.narrate('She tucks the notebook back in the satchel, under the mail, where she keeps the things that matter.');
      },
    },
    {
      id: 'mo-10', hearts: 10, title: 'Your Count', when: { flag: 'mothman_revealed' },
      script: async (api) => {
        await api.narrate("A note in your mailbox, block capitals, on the back of a seed catalog: SATURDAY. YOU'RE REFFING. MO HAS A COLD. COUGH COUGH.");
        await api.fade();
        await api.narrate("Saturday. Birdie hands you a striped shirt. 'Mo's sick,' she says, and chews her cinnamon stick, and very carefully does not ask.");
        await api.narrate('Main event. Twelve minutes in, the villain shoves you into the ropes. You go down. The house lights dim to amber.');
        await api.narrate('Above the ring, the old porch light clicks on by itself. Two thousand people gasp. Something unfolds from under the far apron.');
        await api.narrate('The Mothman. Wings wide. It feints once, twice, sweeps the villain up beneath the bulb, and lowers him into a cradle under the light.');
        await api.narrate('You crawl over and slap the mat. One. Two. Three. The building comes apart.');
        await api.fade();
        await api.narrate('Later. The far crawlspace under the ring. A red headlamp. Mo, in a hoodie, wing dust on her collar, absolutely beaming.');
        await api.say('mo', 'Your count was slow.');
        const c = await api.choose(null, [
          { label: 'It was a little slow.', value: 'admit' },
          { label: 'It was dramatic.', value: 'drama' },
        ]);
        if (c === 'admit') {
          api.hearts('mo', 30);
          await api.sayMood('mo', 'happy', "It was PERFECT slow. Two thousand people on their feet an extra half second. Do you know what I'd give for that half second?");
        } else {
          api.hearts('mo', 30);
          await api.sayMood('mo', 'happy', 'So dramatic. I could hear Agnes screaming from under a wing. You held that two like it owed you money.');
        }
        api.hearts('mothman', 15);
        await api.say('mo', "Nine years I've counted everybody else's three. Tonight somebody counted mine.");
        await api.sayMood('mo', 'love', "Don't tell anybody I was good. ...I was really good, though.");
      },
    },
    {
      id: 'mo-12', hearts: 12, title: 'Five A.M.', when: { dating: true },
      script: async (api) => {
        await api.narrate('4:58 a.m. Mo is waiting at your gate with two headlamps. Both red. She hands you one without a word and starts walking.');
        await api.narrate('The creek road, in fog. Mailboxes loom up and fall behind. She fills each one without looking, like a piano she knows by heart.');
        await api.say('mo', 'Water tower. Twenty to six. Exactly.');
        await api.narrate('She switches off her lamp. You switch off yours. Around the tower\'s safety light, hundreds of moths circle, silver and tireless.');
        await api.sayMood('mo', 'love', "This is my favorite part of the whole day. Nobody's ever seen it but me. ...Well. Now you.");
        await api.fade();
        await api.narrate('Six a.m. The back booth. June sets down two coffees, looks from one of you to the other, and walks off humming.');
        await api.say('mo', "Okay. Official business. Birdie said I have to ask. It's a booth question.");
        await api.say('mo', 'Us. Do we go on-screen? Villains yelling that the ref is biased, the town losing its mind? Or do we keep it ours?');
        const c = await api.choose(null, [
          { label: 'Put it on-screen', value: 'onscreen' },
          { label: 'Keep it ours', value: 'secret' },
        ]);
        api.flag('hot_tag_mo', c);
        api.hearts('mo', 30);
        if (c === 'onscreen') {
          await api.sayMood('mo', 'happy', "On-screen. Wow. Two thousand people knowing I'm sweet on somebody. I'm going to have to stand up straight for a year.");
        } else {
          await api.sayMood('mo', 'love', "Ours. Good. That suits me down to the ground. I'm very good at secrets. You have no idea.");
        }
      },
    },
    {
      id: 'mo-14', hearts: 14, map: 'sportatorium', title: 'Luna', when: { dating: true },
      script: async (api) => {
        await api.narrate("Long after the crowd's gone, Mo asks you to meet her at the ring. The house lights are off. Only the old porch light is on.");
        await api.narrate("She's sitting on the apron in her stripes, feet dangling, satchel beside her. She looks more nervous than you've ever seen her.");
        await api.say('mo', 'I had a whole speech. I practiced it on the route. Elm, Oak, creek road. I said it to forty mailboxes. They loved it.');
        await api.say('mo', 'I forgot all of it at the door.');
        await api.narrate('From the satchel she takes a small box. Inside is a brooch: a luna moth, pale green, wings like two open hands.');
        await api.say('mo', "Grown-up luna moths don't even have mouths. Did you know that? They come out for one reason. To find each other.");
        await api.narrate('She pins it on your collar, then three small tugs to check it\'s straight. Then she reaches into the satchel again.');
        await api.narrate("The Tag Rope: Hank's ring rope, braided with Marigold's thread into a turnbuckle tassel. Mo stands on the apron and holds out her hand.");
        await api.say('mo', "I've carried everybody's mail for nine years. I'd like to carry yours for the rest of it. Tag me in?");
        const c = await api.choose(null, [
          { label: 'Take her hand. Tag in.', value: 'yes' },
          { label: 'Not yet. Ask me again.', value: 'wait' },
        ]);
        if (c === 'yes') {
          api.flag('engaged_mo');
          api.hearts('mo', 30);
          await api.narrate('You slap her palm the way partners do, and then you don\'t let go. Mo laughs, big and theatrical, and it rings off two thousand empty seats.');
          await api.sayMood('mo', 'love', "One. Two. Three. That's official. I'm the referee. I'd know.");
        } else {
          await api.say('mo', "Okay. That's okay. I'll keep it in the satchel. I'm good at carrying things a long time. Same time, same porch light.");
        }
      },
    },
  ],
} satisfies DialogueSet;
