import type { DialogueSet } from '../types';

/**
 * Rosa Villanueva, La Mariposa Dorada. Taqueria owner, third-generation masked
 * luchadora, romanceable.
 *
 * In public La Mariposa never speaks: gestures, the order pad, and Abuela Celia
 * "translating" from the register with generous additions. In the three rooms
 * (and her own closed taqueria after hours) Rosa is the loudest woman in town.
 *
 * Her face is hers. She shows it at 10 hearts because she chooses to, never
 * because the player asks; no option anywhere asks. Gift replies stay gestural
 * because most gifts happen at the taqueria counter.
 */
export default {
  npc: 'mariposa',
  intro: [
    "(In the back booth, La Mariposa rolls her golden mask up to her nose, takes a huge bite of a torta, and points at you with it.)",
    "Okay! You're the new one. Rosa. Rosa Villanueva. Sit, sit. In here I talk. Out there I don't. Ever. Don't make me.",
    "Abuela's mask, Abuela's recipes, Abuela's opinions. I'm the third generation of all three. Eat something. You look like a lamp.",
  ],
  introPublic: [
    "(A woman in a golden butterfly mask looks up from the comal. She says nothing. She bows, slowly, from the waist.)",
    "(An elderly woman at the register waves a spatula.) \"That's La Mariposa. She doesn't talk. I'm Celia. I talk for both of us.\"",
    "(La Mariposa points at you, then the menu, then holds up three fingers.) Celia: \"She says three tacos. You're too skinny. I agree.\"",
  ],
  lines: [
    // ---------------------------------------------------------------- Public: silent, golden, translated
    { text: ["(La Mariposa bows from the waist and sweeps one golden hand toward the menu board.)", "Abuela Celia, from the register: \"She says welcome. Sit anywhere. Not there. That's my chair.\""], when: { hearts: [0, 2], place: ['public'] } },
    { text: ["(La Mariposa points at you, then at the tamales, then holds up two fingers. Firmly.)", "Abuela: \"She says two. I say three. You're too skinny.\""], when: { place: ['public'], map: ['taqueria'] } },
    { text: "(She presses a hand over her heart and bows to you. The whole lunch counter goes quiet with respect.)", when: { place: ['public'], alignment: ['face'] } },
    { text: ["(La Mariposa turns her back on you. Slowly. Elegantly. Then slides a horchata across the counter without looking.)", "Abuela: \"She says villains pay double. I say you look thirsty. Drink.\""], when: { place: ['public'], alignment: ['heel'], map: ['taqueria'] } },
    { text: "(She points at the rain, then at a steaming bowl of pozole, then at you. The logic is airtight.)", when: { place: ['public'], weather: ['rain', 'storm', 'snow'] } },
    { text: ["(La Mariposa taps the calendar, spreads her arms like wings, and points at the door.)", "Abuela: \"She says come to the show tonight. She says it every week. I say it louder.\""], when: { place: ['public'], showDay: true } },
    { text: "(At the flea market, La Mariposa holds a tomato up to the light like a jeweler. Abuela snatches it away. A silent war begins.)", when: { place: ['public'], weekday: [0], map: ['town'] }, weight: 2 },
    { text: "(At the VFW taco table, La Mariposa slides you a taco and taps the tip jar once with a golden fingertip.)", when: { place: ['show'], weekday: [2] }, weight: 2 },
    { text: "(La Mariposa stands by the entrance ramp, perfectly still, wings folded. When she sees you, she bows. Just once.)", when: { place: ['show'], weekday: [5] } },
    { text: "(A little boy asks La Mariposa if she can really fly. She considers the question carefully, then nods once. He nearly faints.)", when: { place: ['public'] } },
    { text: ["(You mention the Mothman. Behind the mask, her eyes narrow. She makes a small fluttering gesture, then a crushing one.)", "Abuela: \"Butterflies and moths. It's an old thing. Don't get involved.\""], when: { place: ['public'] } },
    { text: "(At the name 'Gideon,' La Mariposa picks up a knife and slowly, deliberately, quarters a lime. She does not break eye contact.)", when: { place: ['public'], map: ['taqueria'] } },
    { text: "(She pipes a tiny heart in salsa verde on your plate, then quickly covers it with a tortilla, as if it never happened.)", when: { place: ['public'], hearts: [6, 10], map: ['taqueria'] } },
    { text: "(Dawn on the creek path. La Mariposa jogs past, mask on, braid swinging. She salutes without breaking stride.)", when: { place: ['public'], time: [360, 480], map: ['town'] } },
    { text: "Abuela Celia leans over the register: \"She likes you. She can't say so. She doesn't say anything. So I say.\"", when: { place: ['public'], hearts: [3, 10], map: ['taqueria'] } },
    { text: ["(La Mariposa mimes a gas pump, a sad hot dog, and then draws a big X in the air.)", "Abuela: \"She says don't eat at the gas station. Eat here. Your stomach will send a thank-you card.\""], when: { place: ['public'], map: ['taqueria'] } },
    { text: "(In the town square, La Mariposa signs a kid's cast with a golden butterfly. She draws the wings very carefully. The kid weeps.)", when: { place: ['public'], weekday: [5], map: ['town'] } },
    { text: "(La Mariposa writes on her order pad and tears off the sheet: EAT. THEN TRAIN. THEN EAT. It's a menu and a philosophy.)", when: { place: ['public'] } },
    { text: "(La Mariposa has taped a paper monarch to the taqueria window. Then another. Then thirty. Abuela pretends not to notice.)", when: { place: ['public'], season: [0] }, weight: 2 },
    { text: "(In public, La Mariposa taps her mask three times when she sees you. Abuela rolls her eyes so hard the register rattles.)", when: { place: ['public'], dating: true }, weight: 2 },

    // ---------------------------------------------------------------- Insider: Rosa, at full volume
    { text: "Okay. First of all? The jalapeños this week are a crime. Second of all, sit, sit. You're standing there like a lamp.", when: { place: ['insider'], hearts: [0, 5] } },
    { text: "You know what nobody tells you about masks? They're *hot*. Sixty-five years of my family sweating for the sake of mystery.", when: { place: ['insider'] } },
    { text: "(Rosa rolls her mask up to her nose and bites into a burrito the size of a forearm.) Mm. Don't look at my chin. My chin is not public.", when: { place: ['insider'] } },
    { text: "In public I don't talk. At all. So in here I talk for the whole week at once. You're getting Monday through Saturday. Sorry. Not sorry.", when: { place: ['insider'], hearts: [0, 5] } },
    { text: "My mom called. She asked if I'm 'still doing the thing.' The thing! Sixty-five years of lineage, and it's 'the thing.'", when: { place: ['insider'], weekday: [6, 0] }, mood: 'angry' },
    { text: "Abuela lost to the Velvet Hammers in 1979. She swears the Duchess pulled her hair. I've seen the tape. The Duchess pulled her hair.", when: { place: ['insider'] } },
    { text: "Abuela says the Duchess told her in '79, 'I'll never wrestle without Bird beside me.' Abuela thought it was a line. Then it wasn't.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "Okay, so on Corazón de Acero, Mauricio has a secret twin. Who is ALSO named Mauricio. Who raised these Mauricios? I have questions.", when: { place: ['insider'] } },
    { text: "The fryer's making a noise like a sad duck. If the fryer quits, I'm frying on a hot plate like it's 1958. Abuela would love that.", when: { place: ['insider'], hearts: [3, 8] } },
    { text: "Rules. Never put your mask on the bed. Never put your boots on the table. Never, ever let Gideon touch your hair before a match.", when: { place: ['insider'] } },
    { text: "Dex came in with no lunch again. I fed him. I threatened him. Normal Tuesday. If he moves to the city, I'll fly there and drag him home.", when: { place: ['insider'] } },
    { text: "Gideon told me something about Buck and a self-tightening turnbuckle that I am absolutely not supposed to repeat. Lean in.", when: { place: ['insider'] }, mood: 'smug' },
    { text: "Show day. Abuela blessed my boots, my mask, my wrist tape, and, for some reason, the van. Okay. Okay. I'm ready.", when: { place: ['insider'], showDay: true }, weight: 2 },
    { text: "Before I go out, I bow to all four corners. For Abuela. She bowed to four corners in Mexico City. Different building. Same corners.", when: { place: ['insider'] } },
    { text: "Two hundred stitches around the eyes of my mask. I did them all. Abuela redid forty. She says thirty-nine of mine were 'enthusiastic.'", when: { place: ['insider'] } },
    { text: "Sometimes I want to invent something. A new move. A new... anything. Then I hear Abuela: 'Respeta la tradición.' And I want it more.", when: { place: ['insider'], hearts: [3, 10] } },
    { text: "The mask isn't hiding me. Okay. A little. Mostly it itches behind the left ear. Abuela's itched there too. Three generations of one itchy ear.", when: { place: ['insider'], hearts: [6, 10] } },
    { text: "Rain means nobody drives to the taqueria. Rain means I eat my own carnitas. Rain is a financial and spiritual event.", when: { place: ['insider'], weather: ['rain', 'storm'] } },
    { text: "An armdrag is a dance where you lead. Dex leads like he's late for a bus. I told him. He said 'I AM late for a bus.' He was.", when: { place: ['insider'] } },
    { text: ["You and {opponent}! I watched from the taco table. I dropped a whole tray of al pastor at the {finisher}.", "Abuela picked up every piece and charged the VFW for it. Worth it."], when: { place: ['insider'], lastMatch: { won: true, maxDaysAgo: 3 } }, mood: 'happy' },
    { text: "{opponent} beat you and Abuela said a word in Spanish I'm not allowed to repeat. Then she wrapped you a tamal. That's her version of a hug.", when: { place: ['insider'], lastMatch: { won: false, maxDaysAgo: 3 } } },
    { text: ["(La Mariposa mimes a big fall, then claps, slowly, three times.)", "Abuela: \"She saw you and {opponent}. She says that was a real fall. She says it with her hands because she's a show-off.\""], when: { place: ['public'], lastMatch: { maxDaysAgo: 3 } } },
    { text: "Your armdrags are stiff. You're throwing a person, not a sofa. Come early tomorrow. I'll fix your hips. It'll hurt. Lovingly.", when: { place: ['insider'], rank: ['rookie', 'opener'] } },
    { text: "You're on top of the card now. Careful. The top rope's where you fly from. It's also where you fall from. Same rope.", when: { place: ['insider'], rank: ['main', 'assistant', 'pencil', 'owner'] } },
    { text: "People ask what's under the mask. A face. Two eyebrows. Strong opinions. It's not that deep. ...Okay. It's a little deep.", when: { place: ['insider'], hearts: [3, 9] } },
    { text: "Abuela's eighty-eight and still checks my headscissors. 'Tighter. Like you're holding a secret between your knees.' Every time.", when: { place: ['insider'] } },
    { text: "My mom sent a check 'for the restaurant.' I sent it back. She sent it back. Now a check just lives in the mail. Mo's sick of it.", when: { place: ['insider'], hearts: [6, 10] } },
    { text: "Okay, villain. In here you can stop scowling. Sit. Eat. Your heel face is giving me heartburn.", when: { place: ['insider'], alignment: ['heel'] } },
    { text: "Abuela goes to the Evening Bell every week to argue with the Duchess about 1979. They both come home glowing like teenagers.", when: { place: ['insider'], flag: 'grandma_in_town' }, mood: 'happy', weight: 2 },
    { text: "When Abuela's hands got too stiff for the masa, I thought, that's it, the tortillas end with her. Then she taught me with her elbows.", when: { place: ['insider'], hearts: [9, 10] } },
    { text: "You're in the lineage now. Sort of. Not the mask part. The feeding part. Abuela says that's the bigger half.", when: { hearts: [9, 10], place: ['insider'] }, mood: 'love' },
    { text: "You've seen it now. My face. Don't get weird about it. ...Okay, get a little weird. It was a big deal.", when: { place: ['insider'], flag: 'rosa_face_seen' }, mood: 'happy', weight: 2 },
    { text: "Marigold keeps texting me photos of wing stitches at midnight. I keep crying at them at midnight. We're a very healthy team.", when: { place: ['insider'], flag: 'rosa_face_seen' } },

    // ---------------------------------------------------------------- Seasons
    { text: "Monarchs come through in spring. Abuela says each one's a luchadora who never lost her mask. I don't argue. Not about that.", when: { place: ['insider'], season: [0] }, weight: 2 },
    { text: "Fairgrounds Fury. I'm doing a springboard off a hay bale this year. Hank says no. Hank will say yes. Hank always says yes eventually.", when: { place: ['insider'], season: [1] } },
    { text: "Monarchs leave in fall. Thousands of miles on paper wings. Abuela cries every year. Then she makes the pozole so hot that the whole table cries, so nobody can tell whose is whose.", when: { place: ['insider'], season: [2] } },
    { text: "Winter crowds want a warm ending. So I give them wings. Wings always feel warm. Don't ask me why. I don't know why.", when: { place: ['insider'], season: [3] } },

    // ---------------------------------------------------------------- After closing (her own taqueria, nobody else here)
    { text: "(The taqueria's closed. Rosa has her mask rolled to her nose and the books spread across a table.) Oh good, a human. Sit. Distract me.", when: { map: ['taqueria'], time: [1320, 1560] }, weight: 2 },
    { text: "Abuela's asleep upstairs. I'm doing the books and pretending the numbers are a telenovela with a happy ending. Episode forty. Still waiting.", when: { map: ['taqueria'], time: [1320, 1560] } },
    { text: "After closing is the only time I get to talk in my own restaurant. Silent all day, every day. I make up for it. Ask anyone. Ask the walls.", when: { map: ['taqueria'], time: [1320, 1560] } },

    // ---------------------------------------------------------------- Dating
    { text: "In public I can't say anything. So I made a code. Tap my mask twice: 'I'm hungry.' Three times: you. Four times: both.", when: { place: ['insider'], dating: true }, mood: 'love' },
    { text: "Abuela knows. Obviously. She knew before I knew. She's started setting a third plate. She doesn't even look up.", when: { place: ['insider'], dating: true } },
    { text: "I wrote your name on a napkin and then ate the napkin. That's not a metaphor. I panicked. Abuela saw. It's been a week.", when: { place: ['insider'], dating: true }, mood: 'happy' },
    { text: "The whole town's trying to guess who La Mariposa's mysterious admirer is. Fenwick has a corkboard. You're on it. Next to a goat.", when: { dating: true, flag: 'rosa_romance_onscreen', place: ['insider'] }, weight: 2 },
    { text: "Nobody knows. Abuela knows. My mother suspects. Gideon definitely knows and is being *insufferable* about knowing.", when: { dating: true, flag: 'rosa_romance_secret', place: ['insider'] }, weight: 2 },
  ],
  gifts: {
    loves: ['yarn', 'gold-leaf', 'wildflowers'],
    likes: ['old-program', 'polaroid', 'comic', 'rhinestone', 'sequins', 'horchata', 'teacup', 'cassette'],
    dislikes: ['feather', 'mothman-figure', 'gas-hotdog'],
  },
  giftReplies: {
    love: [
      "(She clutches it to her heart and bows twice, very low.) Abuela: \"She says you're family now. I say you were already.\"",
      "(La Mariposa spins in a full circle, wings flaring. A customer applauds.) Abuela: \"She likes it. That was a lot of liking.\"",
      "(Behind the mask, her eyes go shiny. She points at you, then the sky.) Abuela: \"She says God sent you. I say the bus did.\"",
    ],
    like: [
      "(La Mariposa nods, pleased, and tucks it under the counter.) Abuela: \"She says thank you. Also, eat something.\"",
      "(She gives you two thumbs up, then borrows one of Abuela's thumbs for a third.)",
      "(A small, gracious bow.) Abuela: \"She approves. Don't let it go to your head. Your head is big enough.\"",
    ],
    neutral: [
      "(La Mariposa tilts her head, considers it, and sets it carefully beside the register.)",
      "(She bows politely.) Abuela: \"She says thank you. She means it about seventy percent.\"",
      "(She turns it over twice, shrugs, and slides you a free horchata anyway.)",
    ],
    dislike: [
      "(Mariposa holds it at arm's length, shakes her head slowly, and drops it in the trash.) Abuela: \"She says no.\"",
      "(A long, silent stare through the mask. Abuela quietly crosses herself.)",
      "(She hands it back between two fingers, like a wet sock.)",
    ],
    birthday: [
      "(La Mariposa holds up the {item} and throws her arms wide. Her sleeve-wings unfurl.) Abuela: \"Best birthday, she says. Then she'll go cry in the walk-in. Let her.\"",
      "(She presses the {item} to her heart and doesn't move for a long moment.) Abuela: \"She's happy. Give her a minute. Give me the {item} after. I want to see.\"",
    ],
    byItem: {
      yarn: ["(She holds the yarn against her mask, measuring the color against the gold. Then she nods, fast, twice.)", "Abuela: \"She's going to restitch the eyes. Again. I'm going to redo forty. Again.\""],
      'gold-leaf': "(La Mariposa looks at the gold leaf, then at her mask, then at you. She bows so low her braid touches the counter.) Abuela: \"That's for the wings. She's going to cry on the wings.\"",
      wildflowers: "(She tucks one flower behind the strap of her mask, over her ear. Abuela opens her mouth. La Mariposa holds up one finger. Abuela closes her mouth.)",
      'old-program': "(She finds Abuela's name on the 1979 card and taps it hard, three times.) Abuela, squinting: \"I was robbed that night. The Duchess pulled my hair. Write that in the margin.\"",
      polaroid: "(La Mariposa studies the crowd in the photo, finds a tiny blur of gold at the edge, and points at it, delighted.) Abuela: \"She thinks that's her. It's a lamp.\"",
      comic: "(She flips through Wrestle-Bot vs. The Moon, stops at the moon's face, and makes the crushing butterfly gesture.) Abuela: \"She says the moon is a moth.\"",
      rhinestone: "(She holds it up to the comal light. It throws a spark on the ceiling. Abuela gasps, then pretends she was coughing.)",
      sequins: "(La Mariposa pours the sequins into the tip jar. Abuela takes them out. La Mariposa puts them back. This may go on for some time.)",
      horchata: "(She raises the horchata in a toast, lifts her mask an inch, and drinks it in one go.) Abuela: \"She says it's not as good as hers. She means it's good.\"",
      teacup: "(She sets the teacup by the register and puts one marigold petal in it.) Abuela: \"Now it's an altar. Don't touch it.\"",
      cassette: "(La Mariposa reads the label, PUMP UP JAMS 4 SAT, and does a small, perfect shimmy.) Abuela: \"She's going to play it in the kitchen. Loud. I'm going to the Bell.\"",
    },
    later: [
      "(La Mariposa points at the shelf behind the register. The {lastGift} is up there, next to a photo of Abuela in 1979.) Abuela: \"Place of honor. Don't let it go to your head.\"",
      "Abuela, from the register: \"She still has the {lastGift}. She touches it before every show. Same as the corners. Don't tell her I said.\"",
    ],
  },
  again: [
    "(La Mariposa points at you, then at a stool, then at a plate. Sit. Eat. Talking is over.)",
    "Abuela: \"Back again? She says you're welcome. I say you're hungry. We're both right.\"",
    "(La Mariposa bows, slightly less deep than last time. It means 'still here.')",
  ],
  idle: [
    "(La Mariposa is folding tortillas into perfect quarters, very fast, without looking.)",
    "(She lifts one golden hand in greeting and goes back to the comal.)",
  ],
  birthday: { season: 0, day: 5 },
  events: [
    // ---------------------------------------------------------------- 2: Initials in salsa verde
    {
      id: 'mariposa-2', hearts: 2, map: 'taqueria', title: 'Initials in Salsa Verde',
      script: async (api) => {
        await api.narrate("Lunch rush at Taqueria Mariposa. La Mariposa works the comal in silence, golden mask catching the light. Abuela Celia runs the register and the room.");
        await api.narrate("A plate slides across the counter to you. Three tacos. On the middle one, piped perfectly in salsa verde: your initials.");
        await api.say('mariposa', "(She points at the plate, then at you, then makes a small sweeping gesture, like opening a door.)");
        await api.narrate("Abuela Celia, without looking up: \"She says welcome.\"");
        await api.say('mariposa', "(Two fingers pointed at your boots. A thumbs-down. Then a pinch of air, very small.)");
        await api.narrate("Abuela: \"She says your boots are ugly and you're too skinny.\" A pause. \"Mostly that's me.\"");
        const c = await api.choose(null, [
          { label: 'Bow to La Mariposa', value: 'bow' },
          { label: 'Eat the initials taco in one bite', value: 'eat' },
        ]);
        if (c === 'bow') {
          api.hearts('mariposa', 30);
          await api.narrate("You bow. La Mariposa goes very still. Then she bows back, deeper, the formal way, turning to all four corners of the counter.");
          await api.narrate("Abuela's eyebrows climb. \"Nobody bows back. Huh.\" She stamps your receipt PAID without ringing it up.");
        } else {
          api.hearts('mariposa', 15);
          await api.narrate("You eat it in one bite. La Mariposa watches, silent, then gives a single, deeply approving nod.");
          await api.narrate("Abuela: \"Good. A person who eats. You can stay.\"");
        }
        await api.narrate("When you look down again, there's a fourth taco on your plate that you definitely didn't order.");
      },
    },
    // ---------------------------------------------------------------- 4: Forty minutes, then one question
    {
      id: 'mariposa-4', hearts: 4, map: 'sportatorium', when: { place: ['insider'] }, title: 'Forty Minutes',
      script: async (api) => {
        await api.narrate("After practice, Rosa hooks your elbow and marches you to the Hot Tag's back booth. She rolls her mask to her nose and takes one enormous bite of a torta.");
        await api.say('mariposa', "Okay. So.");
        await api.narrate("She talks for forty minutes.");
        await api.say('mariposa', "The jalapeño guy shorted me again. Four cases. FOUR. He looked me right in the mask and said 'they're seasonal.' They are not *seasonal*.");
        await api.say('mariposa', "Then my mom calls, and it's 'Mija, are you eating,' and I'm like 'I OWN A RESTAURANT,' and she's like 'That's not what I asked.'");
        await api.say('mariposa', "Then on Corazón de Acero, the nun turns out to be the evil twin. The NUN. I threw a tortilla at the TV. Abuela threw two.");
        await api.say('mariposa', "And the fryer's doing the duck noise again, and...");
        await api.narrate("She stops, mid-sentence. She sets the torta down.");
        await api.say('mariposa', "Okay. Your turn. One question. What do you want? Like, really. Out of all of it.");
        await api.narrate("And then she does something nobody in this town would believe. She goes completely quiet, and waits.");
        const c = await api.choose(null, [
          { label: 'To find out if I can really do this', value: 'can' },
          { label: 'A home. I think I came here for a home.', value: 'home' },
          { label: 'Honestly? Half of that torta.', value: 'torta' },
        ]);
        if (c === 'can') {
          api.hearts('mariposa', 30);
          await api.narrate("You tell her. The doubt, the bus ticket, the city. She doesn't interrupt once. Not once. When you finish, she nods slowly.");
          await api.say('mariposa', "You can. I've seen your armdrags. They're terrible. And you can. Both of those are true.");
        } else if (c === 'home') {
          api.hearts('mariposa', 30);
          await api.narrate("You tell her. The city, the clips, the letter, the house. She doesn't interrupt once. When you finish, she pushes her plate toward you.");
          await api.sayMood('mariposa', 'love', "Okay. Well. Then you came to the right booth.");
        } else {
          api.hearts('mariposa', 15);
          await api.narrate("She stares at you. Then she laughs so loud June drops a spoon.");
          await api.sayMood('mariposa', 'happy', "That's the most honest thing anybody's said in this booth all year. Here. Half. Answer for real next time.");
        }
        await api.narrate("Behind the counter, June catches your eye and silently mouths one word: \"Wow.\"");
      },
    },
    // ---------------------------------------------------------------- 6: Abuela's mask
    {
      id: 'mariposa-6', hearts: 6, map: 'sportatorium', when: { place: ['insider'] }, title: "Abuela's Mask",
      script: async (api) => {
        await api.narrate("The locker room after practice. Rosa sits on the bench with a cloth bundle in her lap, mask rolled up, unusually quiet.");
        await api.say('mariposa', "I'm going to show you something. You're going to hold it like it's a baby bird. Okay?");
        await api.narrate("She unwraps it. An old mask: cracked gold leather, stitched by hand. The stitches around the eyes are tiny and perfect, and a little crooked on one side.");
        await api.say('mariposa', "Abuela's. 1958. She sewed it at a kitchen table in Mexico City with a needle she borrowed from a neighbor. She never gave the needle back.");
        await api.say('mariposa', "She wore it twenty-one years. Mexico City. Monterrey. Every territory up here that would book a woman. Then she gave me the pattern.");
        await api.narrate("She holds it out to you.");
        const c = await api.choose(null, [
          { label: 'Take it in both hands, carefully', value: 'hold' },
          { label: 'Ask if you can try it on', value: 'try' },
        ]);
        if (c === 'hold') {
          api.hearts('mariposa', 30);
          await api.narrate("You take it in both hands. It's lighter than you expected, and warm, as if somebody just took it off.");
          await api.sayMood('mariposa', 'love', "Good. That's how you hold it. Abuela would like you. She'd pretend not to.");
        } else {
          api.hearts('mariposa', -10);
          await api.sayMood('mariposa', 'angry', "No.");
          await api.narrate("She takes it back. Fast, but gentle.");
          await api.say('mariposa', "...Sorry. You didn't know. In my family you don't put on somebody's mask. You earn the right to ask, and then you still don't.");
        }
        await api.say('mariposa', "People think it's a disguise. It's not. It's a promise to be bigger than yourself.");
        await api.say('mariposa', "Every time I put mine on, I'm making that promise to her. Every single time. Even at the VFW. Even when it's hot. It's always hot.");
        await api.narrate("She wraps the old mask back up, slowly, and holds the bundle against her chest for a second before she puts it away.");
      },
    },
    // ---------------------------------------------------------------- 8: Everything's fine
    {
      id: 'mariposa-8', hearts: 8, map: 'sportatorium', when: { place: ['insider'] }, title: "Everything's Fine",
      script: async (api) => {
        await api.narrate("Late, in the back booth. Rosa's mask is rolled up and her receipts are spread across the table like a losing hand of cards.");
        await api.narrate("Her phone buzzes. MAMÁ. She stares at it for two rings, then puts on a voice like sunshine.");
        await api.sayMood('mariposa', 'happy', "Mamá! Hi! Yes. Yes! Everything's fine! Busy! So busy. Line out the door. Yes, I'm eating. Love you. Bye! Bye!");
        await api.narrate("She hangs up and sets the phone face-down. Then she lowers her forehead to the table, very gently, right on top of the receipts.");
        await api.sayMood('mariposa', 'sad', "It's not fine.");
        await api.say('mariposa', "We're losing money. Every month, a little more. The fryer, the rent, the jalapeño guy. I keep feeding everybody and the numbers keep eating me.");
        await api.say('mariposa', "And I'm scared. Scared of being the Villanueva who ends it. Three generations, and it stops with the one who couldn't do math.");
        await api.say('mariposa', "And if I fight to keep the mask going, I could lose the restaurant. And the restaurant is Abuela's whole life. And mine.");
        const c = await api.choose(null, [
          { label: 'Let me look at the books with you', value: 'books' },
          { label: 'What if the whole town had a reason to rally?', value: 'rally' },
          { label: 'You should tell your mom', value: 'mom' },
        ]);
        if (c === 'books') {
          api.hearts('mariposa', 30);
          await api.narrate("You slide onto her side of the booth and pick up a receipt. She watches you for a second, then wipes her eyes and hands you a pencil.");
          await api.say('mariposa', "Okay. Okay. You take the produce. I can't look at the produce. The produce is personal.");
        } else if (c === 'rally') {
          api.hearts('mariposa', 30);
          await api.sayMood('mariposa', 'surprised', "Like what?");
          await api.narrate("You think out loud. A rival taco stand. A villain. Somebody the whole town would boycott on her behalf.");
          await api.sayMood('mariposa', 'happy', "...Gideon. Gideon would do it in a heartbeat. In sequins. Serving tacos with a complimentary hand mirror.");
          await api.say('mariposa', "The town would line up around the block just to spite him. Oh, that's evil. That's beautiful. Write it on a napkin. NOW.");
        } else {
          api.hearts('mariposa', 15);
          await api.say('mariposa', "She'd say 'I told you so.' She'd be right. Then she'd fly in with a spreadsheet and fix everything, and I'd hate it, and it'd work.");
          await api.say('mariposa', "Okay. Maybe. Not today. Next Sunday. Someday.");
        }
        await api.narrate("Before you go, she squeezes your hand, hard, the way she holds a headscissors. Tight. Like a secret she's trusting you with.");
      },
    },
    // ---------------------------------------------------------------- 10: Her face, her terms
    {
      id: 'mariposa-10', hearts: 10, map: 'sportatorium', when: { place: ['insider'] }, title: 'Carry It Forward',
      script: async (api) => {
        await api.narrate("The locker room, after everyone's gone home. One light on over the bench. Sketches cover the floor: dozens of masks, all wings, none quite the same.");
        await api.say('mariposa', "Don't step on Tuesday. Tuesday's my favorite.");
        await api.say('mariposa', "I want a new mask. My own. Still wings. Still gold. But mine.");
        await api.say('mariposa', "I don't want to just carry it. I want to carry it *forward*. Abuela carried it to me. Someday I carry it to somebody else, and it should be... more.");
        await api.say('mariposa', "Marigold will sew it. I want you to help me design it. Which is a problem, because a mask is made for a face.");
        await api.narrate("She looks at you for a long time. Then she gets up and switches off the other lights, so there's only the one, over the bench.");
        await api.say('mariposa', "Don't say anything. You never asked. Not once since you got here. That's why.");
        await api.narrate("She reaches back and unlaces the mask herself. Slowly. Like untying the ribbon on something she's been saving.");
        await api.narrate("And then you're looking at Rosa Villanueva.");
        await api.narrate("Freckles across the bridge of her nose that nobody in Turnbuckle Alley has ever seen. A dimple, only on the left. A pale band across her brow where the mask sits.");
        await api.sayMood('mariposa', 'happy', "Hi. I'm Rosa.");
        const c = await api.choose(null, [
          { label: 'Hi, Rosa.', value: 'hi' },
          { label: "You didn't have to do this.", value: 'didnt' },
          { label: 'Say nothing. Just smile.', value: 'smile' },
        ]);
        api.hearts('mariposa', 30);
        if (c === 'hi') await api.sayMood('mariposa', 'love', "Hi. ...Okay. That was easier than I thought. That was way harder than I thought. Both.");
        else if (c === 'didnt') await api.sayMood('mariposa', 'love', "I know I didn't. That's why it counts. It's mine to give. It always was.");
        else await api.sayMood('mariposa', 'love', "(She smiles back. The dimple shows up for it, right on time.) Yeah. Me too.");
        await api.say('mariposa', "You're the first person who isn't family. Abuela. My mom. Now you. Three people on Earth.");
        await api.say('mariposa', "Okay. Now you've seen what it has to fit. Help me. Wings open, wings folded, or wings in the middle of a beat?");
        const w = await api.choose('Which wings?', [
          { label: 'Wings wide open', value: 'open' },
          { label: 'Wings folded around something', value: 'folded' },
          { label: 'Wings mid-beat, about to fly', value: 'beat' },
        ]);
        api.flag('rosa_face_seen', true);
        api.flag('rosa_mask_design', w);
        if (w === 'open') await api.sayMood('mariposa', 'happy', "Open. Like Abuela's, but wider. Showing everything I've got. ...Ha. Look at me. Literally.");
        else if (w === 'folded') await api.sayMood('mariposa', 'happy', "Folded around something. Protecting it. Like a promise. Oh, I like that. Abuela can never know I like something new.");
        else await api.sayMood('mariposa', 'happy', "Mid-beat. Not landed, not gone. Going. That's... that's exactly what I am right now.");
        await api.narrate("She sketches fast, tongue between her teeth, and holds it up. It's the best one on the floor. She knows it.");
        await api.narrate("Then she laces the old mask back on, carefully, and becomes La Mariposa again. Except now you know. You'll always know.");
      },
    },
    // ---------------------------------------------------------------- 12: The fairgrounds date, then the Hot Tag
    {
      id: 'mariposa-12', hearts: 12, map: 'taqueria', when: { dating: true }, title: 'KISS?',
      script: async (api) => {
        await api.narrate("La Mariposa slides a folded note across the counter with your change: FAIRGROUNDS. 7. WEAR SHOES YOU CAN RUN IN.");
        await api.fade();
        await api.narrate("The fairgrounds at dusk, lights blinking on down the midway. La Mariposa meets you at the gate, masked and silent, with a notepad and a golf pencil.");
        await api.narrate("She can't say a single word out here. It turns out she doesn't need to.");
        await api.narrate("At the ring toss she strikes a victory pose for every ring that lands. At the corn dog stand she writes BEST IN COUNTY, crosses out COUNTY, writes WORLD.");
        await api.narrate("She performs an entire charade about Wanda the bear that you will never, ever figure out. Wanda bows to her anyway.");
        await api.narrate("Then the Ferris wheel. Your car rocks to a stop at the very top. The whole town is down there, small and gold.");
        await api.narrate("She writes something on the notepad and holds it up. KISS?");
        await api.narrate("She underlines it. Twice. Three times.");
        const c = await api.choose(null, [
          { label: 'Write YES, and underline it four times', value: 'yes' },
          { label: 'Write NOT YET, gently', value: 'wait' },
        ]);
        if (c === 'yes') {
          api.hearts('mariposa', 30);
          await api.narrate("Her shoulders shake with silent laughter. She rolls the mask up, just to the nose, just for a second, at the top of the world where nobody can see.");
          await api.narrate("When the wheel starts moving again, she's writing on the pad. You lean over to look: BEST. DATE. WORLD.");
        } else {
          api.hearts('mariposa', 15);
          await api.narrate("She reads it and nods slowly. Then she writes underneath, in careful capitals: OK. WORTH WAITING.");
          await api.narrate("She holds your hand the whole way down. That says plenty.");
        }
        await api.fade();
        await api.narrate("Later, in the back booth. Her mask is rolled up and she's eating your leftover funnel cake without asking.");
        await api.say('mariposa', "Okay. Business. Out there, in the ring. Do we...?");
        await api.say('mariposa', "On-screen, it's a 'mysterious admirer' story. The whole town tries to solve who La Mariposa's in love with. Fenwick will lose his mind.");
        await api.say('mariposa', "Or it's secret. Nobody knows. Ever. Well. Abuela knows. Abuela always knows.");
        const s = await api.choose('How should the romance live?', [
          { label: 'On-screen: the mysterious admirer', value: 'on' },
          { label: 'Secret: just us (and Abuela)', value: 'secret' },
        ]);
        if (s === 'on') {
          api.flag('rosa_romance_onscreen', true);
          await api.sayMood('mariposa', 'happy', "Oh, Fenwick's going to need a bigger corkboard. I love it. Gus is going to name it something terrible and I'm going to love that too.");
        } else {
          api.flag('rosa_romance_secret', true);
          await api.sayMood('mariposa', 'love', "Ours, then. In public I'll tap my mask three times. Nobody in the world will know what it means but you.");
        }
      },
    },
    // ---------------------------------------------------------------- 14: One light on (proposal setup)
    {
      id: 'mariposa-14', hearts: 14, map: 'sportatorium', when: { dating: true, place: ['insider'] }, title: 'One Light On',
      script: async (api) => {
        await api.narrate("The empty locker room. One light on over the bench, exactly like the night she showed you her face.");
        await api.narrate("On the bench sits a mask you've never seen finished. Gold, with the wings you chose together. Marigold's stitches, perfect. Except one, near the eye.");
        await api.say('mariposa', "Marigold made it perfect. I pulled out one stitch and redid it myself. Enthusiastic. Like Abuela says.");
        await api.say('mariposa', "Look inside.");
        await api.narrate("Inside the mask, where only the wearer would ever see, stitched in tiny gold thread: your initials.");
        await api.say('mariposa', "That's a promise. Every time I put it on, I make it. To Abuela, to my mom, to me. And to you, now.");
        await api.narrate("She unlaces the old mask and sets it aside. Rosa, freckles and dimple and all, in the one light.");
        await api.say('mariposa', "Three people on Earth have seen my face. Two of them are related to me.");
        await api.sayMood('mariposa', 'love', "I'd like to fix that. The 'not related' part.");
        await api.say('mariposa', "In my family, you don't take a mask. You earn the right to ask. ...You've earned it. Whenever you're ready. Don't make it weird.");
        await api.sayMood('mariposa', 'happy', "Okay. Make it a little weird. I'm a Villanueva. We like a little weird.");
        const c = await api.choose(null, [
          { label: 'Take her hand', value: 'hand' },
          { label: "Tell her you'll ask properly", value: 'ask' },
        ]);
        api.hearts('mariposa', 30);
        if (c === 'hand') await api.narrate("She laces her fingers through yours and holds on. Tight. Like a secret. Like a promise. It's both.");
        else await api.sayMood('mariposa', 'happy', "Properly. On the apron. With the Tag Rope. Abuela will want to watch. Abuela will want to critique your form.");
        api.flag('rosa_proposal_ready', true);
      },
    },
  ],
} satisfies DialogueSet;
