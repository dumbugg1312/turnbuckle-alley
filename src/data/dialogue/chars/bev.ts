import type { DialogueSet } from '../types';

/**
 * Sheriff Beverly "Bev" Kincaid, 56. County sheriff for eighteen years in a
 * town with nearly no crime, which makes wrestling the only crime wave she's
 * got. Has a warrant (and a homemade citation form) ready for every villain,
 * pink fuzzy handcuffs, and Deputy Doug, a basset hound with the gravitas of
 * a judge. Married to Lorraine, who runs the feed store. A mark.
 */
export default {
  npc: 'bev',
  intro: [
    "Afternoon. Sheriff Beverly Kincaid. The basset hound is Deputy Doug. He's on duty. Don't pet him. ...Fine. Once.",
    "You're the new wrestler. I've started a file on you. It's thin. Thin is good. Let's keep it thin.",
    "This is a quiet town. Our crime rate is nearly zero, and most of that's a raccoon.",
    "The rest is wrestling. If anybody in that ring breaks the law on you, you come see me. I've got a form for it.",
  ],
  lines: [
    // ---------------------------------------------------------------- anytime
    { text: "I write my own citation forms. Unlawful Use of a Folding Chair. Interference in a Sanctioned Contest. Hair Pulling, Aggravated." },
    { text: ["Never made an arrest at a show. Birdie always says 'sanctioned athletic jurisdiction' and 'he's already been fined.'", "I'm looking into both of those phrases."], mood: 'angry' },
    { text: "Deputy Doug's been on the force six years. Never chased a thing. Never needed to. Bad guys look at him and just feel judged." },
    { text: ["The handcuffs are pink and fuzzy. Lorraine's idea of a joke.", "Never needed real ones. One day, the Dust Devil. One day."] },
    { text: "The Dust Devil is Public Enemy Number One. Throwing sand. Mocking a retired man. Wearing a mask in a public place. That's three counts.", mood: 'angry' },
    { text: ["The Mothman is a Person of Interest. Trespassing in rafters after hours.", "Fenwick says it's interdimensional. I say it's trespassing. We agree to disagree, monthly."] },
    { text: "My Most Wanted board's got red string on it. The Bruiser Twins are connected to everything. Hardware's a gateway business." },
    { text: "Lorraine runs the feed store. She thinks I'm the funniest person alive. I have never once told a joke. I don't understand it either." },
    { text: "Agnes Pickett's my most reliable informant. Last week she called in Gideon for 'looking smug near a hydrant.' I took the report." },
    { text: ["I drive Farid Haddad to the eye doctor on Thursdays. Don't spread that around.", "Sheriff's got a reputation to keep. For sternness."] },
    { text: "Missing goat on the Purcell place. Found her on the church roof. Nobody knows how. I've got theories. All of them are goat." },
    { text: "The Bruiser Twins tried to cut the line at the Hot Tag. I gave them a verbal warning. They said 'okay.' Hardened criminals." },
    { text: "That's not a donut in my hand. It's a sunflower seed. I don't eat donuts. It's a stereotype, and I won't have it.", mood: 'angry' },
    { text: ["Our jail has two cells. Cell one is the Christmas parade float.", "Cell two is ready. Cell two has been ready for eighteen years."] },
    { text: "When's your first match? I'll be at the barricade. I like to be at a person's first match. Things happen at first matches.", when: { notFlag: 'debuted' } },

    // ---------------------------------------------------------------- the chair
    { text: "That fella hit you with a chair. I saw it. Say the word and I'll have him in cell two by supper.", when: { flag: 'debuted' }, mood: 'angry' },
    { text: "Saturday's chair shot has been logged into evidence. Birdie wouldn't let me take the chair. I took a photo of the chair.", when: { flag: 'debuted', weekday: [6] } },
    { text: ["Still got that form you signed. It's in a folder. The folder's in a drawer.", "Forms don't expire. I made sure of it. I wrote the form."], when: { flag: 'bev_form' }, mood: 'smug' },

    // ---------------------------------------------------------------- weekly rhythm
    { text: "Sunday's church, then the feed store with Lorraine. I stack the salt licks. Most peaceful hour of my week.", when: { weekday: [6] } },
    { text: "Rain means I work the school crossing at three. Kids splash me. I write them a warning. The warning is a sticker.", when: { weather: ['rain'], weekday: [0, 1, 2, 3, 4] } },
    { text: "Lunch at the Hot Tag. June puts the villains' coffee in a chipped mug. I've never asked her to. I've never needed to.", when: { time: [690, 810] } },
    { text: "Evening patrol. I check thirty-one porches, two barns and the water tower. Every night. The water tower has never done anything. Yet.", when: { time: [1200, 1439] } },

    // ---------------------------------------------------------------- show days
    { text: "Ringside barricade tonight, cuffs ready. If anyone so much as looks at a chair, I'm over that rail.", when: { weekday: [5] }, mood: 'angry' },
    { text: "VFW tonight. I stand at the back wall, arms folded. Best place to see everything. Also the bingo board.", when: { weekday: [2] } },
    { text: "I'm right here at the barricade. If it gets out of hand, you roll out to my side. My side has jurisdiction.", when: { showDay: true, place: ['show'], alignment: ['face', 'tweener'] } },
    { text: "Sir! SIR! That is a FOLDING CHAIR and it is FOR SITTING!", when: { showDay: true, place: ['show'] }, mood: 'angry' },
    { text: "I'm watching you tonight. Both eyes. Doug's watching you too, and his eyes are very disappointed.", when: { showDay: true, place: ['show'], alignment: ['heel'] } },

    // ---------------------------------------------------------------- alignment
    { text: "You're a good egg. Tell you what, I'll keep an extra eye on your matches. I've only got two eyes, but I'll find another one.", when: { alignment: ['face'] } },
    { text: "Sheriff's office has received eleven complaints about your conduct. Nine are from Agnes. The other two are also Agnes.", when: { alignment: ['heel'] } },
    { text: ["I can't believe you'd turn on that sweet kid. I watched it from the barricade.", "I had the cuffs halfway out. Birdie looked at me. I put them back."], when: { alignment: ['heel'], hearts: [0, 5], flag: 'debuted' }, mood: 'angry' },
    { text: "You're on the board now. Middle row. I put up a nice photo, at least. You've got a good side. You're using it for crime.", when: { alignment: ['heel'], hearts: [3, 14] } },
    { text: "Off the record, I think you're a decent person making bad choices in a ring. On the record, you're a menace. Both go in the file.", when: { alignment: ['heel'], hearts: [6, 14] } },
    { text: "Can't figure you out. One week you're shaking hands, the next you're using the ropes. I've opened a file called 'Undecided.'", when: { alignment: ['tweener'] } },

    // ---------------------------------------------------------------- rank
    { text: "Rookies get picked on. I've seen it. Somebody gives you trouble in that opener, you write it down. Dates and times.", when: { rank: ['rookie', 'opener'], flag: 'debuted' } },
    { text: "Main event, huh. More eyes on you, more trouble finds you. I've doubled patrols on Saturday nights. That means me, twice.", when: { rank: ['main', 'assistant', 'pencil', 'owner'] } },

    // ---------------------------------------------------------------- seasons and weather
    { text: "Thaw Brawl's the first big crowd since winter. More folks, more pickpockets. We've never had a pickpocket. I'm ready anyway.", when: { season: [0] } },
    { text: "Spring means the tomatoes go in. And spring means the raccoon starts his rounds. We both know how this ends. I plant extra.", when: { season: [0] } },
    { text: "Wanda woke up for spring. I drove out to make sure. Not my jurisdiction. She bowed at the cruiser. I flashed the lights back.", when: { season: [0], time: [360, 840] }, mood: 'happy' },
    { text: "Fairgrounds Fury's a crowd-control nightmare. Last year a funnel cake went missing. Never solved. It keeps me up.", when: { season: [1] } },
    { text: "Halloween safety walk is coming. Last year a kid dressed as the Dust Devil. I made him promise to use his powers for good.", when: { season: [2] } },
    { text: "Homecoming is the one night I don't mind working late. Something about the Hall of Fame. Gets me in the throat. Allergies.", when: { season: [3] } },
    { text: "Storm like this, I drive the back roads checking on the old folks. Thirty-one porches. Everybody's fine. Everybody gets a wave.", when: { weather: ['storm'] } },

    // ---------------------------------------------------------------- hearts
    { text: "Have a sunflower seed. Ranch. I'd offer Doug one, but he's on duty.", when: { hearts: [3, 5] } },
    { text: ["Eighteen years, and the worst crime in town is tomato theft.", "I know it's a raccoon. I've always known. I just like having a case."], when: { hearts: [6, 14] } },
    { text: ["1983. I was thirteen, up in the bleachers, the night the Duchess broke that belt.", "That's the night I decided bad people don't get to get away with things."], when: { hearts: [6, 14], notFlag: 'truth_revealed' } },
    { text: "You know what Lorraine said? 'You talk about that wrestler more than you talk about the goat.' I talk about that goat a LOT.", when: { hearts: [9, 14] }, mood: 'happy' },
    { text: "Deputy {ring}. Still got the star? Wear it with pride. Maybe not in the ring. Conflict of interest.", when: { flag: 'bev_badge' }, mood: 'smug' },

    // ---------------------------------------------------------------- the main story
    { text: ["Heard the Duchess moved into the Evening Bell. I've driven past four times. Keeping an eye. Professionally.", "She waved at me. With the back of her hand."], when: { flag: 'grandma_in_town', notFlag: 'truth_revealed' }, mood: 'angry' },
    { text: ["Took the Duchess down off my board this morning. Top corner, forty years.", "Didn't feel how I thought it would. Some cases you close by understanding them."], when: { flag: 'truth_revealed' } },
    { text: "Velvet Hammers back together. I stood at the barricade and didn't try to arrest a soul all night. Best shift of my life.", when: { flag: 'reunion_done' }, mood: 'happy' },

    // ---------------------------------------------------------------- life events
    { text: "Congratulations on the wedding. I cried. Lorraine cried. Doug howled through the vows. He does that.", when: { married: true }, mood: 'love' },
  ],
  gifts: {
    loves: ['paperback', 'feather', 'hot-tag-special'],
    likes: ['coffee', 'honey', 'chili-dog', 'polaroid', 'river-stone', 'fish'],
    dislikes: ['sequins', 'gas-hotdog', 'scrap'],
  },
  giftReplies: {
    love: [
      "Well, I'll be. You're a good egg. Doug, say thank you. (Doug does not.)",
      "This is going in evidence. Personal evidence. The good drawer.",
      "That's real thoughtful. I'm going to stand here a second and be professional about it.",
    ],
    like: [
      "Much obliged. Lorraine'll want to see this.",
      "Thank you kindly. I'll log it. Gifts get logged. That's policy. It's my policy.",
    ],
    neutral: [
      "Huh. Thank you. I'll find a drawer for it.",
      "Well. That's an item, all right. Appreciated.",
    ],
    dislike: [
      "I'm going to pretend this didn't happen. That's me being generous.",
      "No, thank you. And I'm writing down that you tried.",
      "This looks like something I'd confiscate from a Bruiser.",
    ],
    birthday: [
      "You remembered? Lorraine's making a cake. Doug already ate part of it. He's under investigation.",
      "Fifty-seven. Still no arrest at a show. This is the year. Thanks, kid.",
    ],
  },
  birthday: { season: 1, day: 15 },
  events: [
    {
      id: 'bev-2', hearts: 2, map: 'town', title: 'The Form', when: { flag: 'debuted' },
      script: async (api) => {
        await api.narrate('Sheriff Bev steps out in front of you on Main Street and pushes her aviators up onto her hat. That means it\'s serious.');
        await api.say('bev', "That fella hit you with a chair on Saturday. In front of two thousand witnesses and a basset hound.");
        await api.narrate('She produces a form from one of her many pockets. It is filled out in tidy block capitals. UNLAWFUL USE OF A FOLDING CHAIR (FIRST DEGREE).');
        await api.say('bev', "I've done the paperwork. All I need is your signature. Right here. Next to Doug's paw print.");
        await api.narrate("There is, in fact, a paw print. Doug looks up at you with the solemn patience of the law.");
        const c = await api.choose('She holds out a pen.', [
          { label: 'Sign it', value: 'sign' },
          { label: "Thank her, but say you'll settle it in the ring", value: 'ring' },
        ]);
        if (c === 'sign') {
          await api.narrate('You sign. Bev looks at your signature like it\'s a winning lottery ticket.');
          await api.sayMood('bev', 'happy', "I'll file this in triplicate. Birdie's going to say 'sanctioned athletic jurisdiction.'", "I'll be ready this time. I've been reading up.");
          api.hearts('bev', 30);
        } else {
          await api.say('bev', "'Settle it in the ring.' That's what they all say.");
          await api.narrate('She folds the form in quarters and tucks it into her breast pocket, over her heart.');
          await api.say('bev', "I'll keep it on file. Forms don't expire. I made sure of that. I wrote the form.");
          api.hearts('bev', 15);
        }
        api.flag('bev_form');
      },
    },
    {
      id: 'bev-4', hearts: 4, title: 'Most Wanted',
      script: async (api) => {
        await api.narrate("The sheriff's office. Two cells. Cell one is full of Christmas parade float. Cell two is empty and spotless, waiting.");
        await api.narrate("One whole wall is a corkboard. Photos, index cards, and so much red string it looks like a web knitted by a very angry spider.");
        await api.say('bev', "The Most Wanted board. Took me six years. Don't touch the string. The string is load-bearing.");
        await api.narrate('The Dust Devil sits in the center, circled three times. Gideon: VANITY (AGGRAVATED). The Mountain: MENACING A LIBRARY.');
        await api.narrate('Up in one corner is a single blurry photo of something winged against a fog. The card underneath: PERSON OF INTEREST (?).');
        const c = await api.choose('Bev waits, arms folded, clearly proud.', [
          { label: 'Ask about the blurry photo', value: 'moth' },
          { label: "Ask what's on the back of the board", value: 'back' },
        ]);
        if (c === 'moth') {
          await api.say('bev', "Took that myself. Twenty to six in the morning, by the water tower. Coming off night patrol.");
          await api.say('bev', "It looked right at me. Tilted its head. Polite, almost. Then the fog came in and it was gone.");
          await api.sayMood('bev', 'neutral', "Fenwick wants a copy. I told him it's evidence. He cried a little. I made him a copy.");
          api.hearts('bev', 30);
        } else {
          await api.narrate('She hesitates. Then she unhooks the board and turns it around. The back has its own heading, in marker: GOOD EGGS.');
          await api.narrate("Pip, in his towel cape. Agnes, mid-swing. Wanda, bowing. Doug. A photo of Lorraine, laughing at something off camera.");
          await api.say('bev', "Everybody needs a list of who they're protecting. Otherwise you're just angry at a wall.");
          api.hearts('bev', 15);
        }
      },
    },
    {
      id: 'bev-6', hearts: 6, title: 'Not at This Time', when: { weekday: [6] },
      script: async (api) => {
        await api.narrate('Sunday at the feed store. Lorraine is at the register. Bev, out of uniform, is stacking salt licks with great care.');
        await api.say('bev', "Did you know I applied to be a detective once? In the city. Big department. Burglary division. I had a tie picked out.");
        await api.say('bev', "Got a letter back. 'Not at this time.' I kept it. It's in my desk, under the good stapler.");
        await api.narrate('She sets another salt lick on the stack and squares it up exactly.');
        await api.say('bev', "Turned out fine. Town needs somebody keeping an eye on things. Even if the things are mostly raccoons.");
        await api.narrate("At the register, Lorraine snorts. \"She's been practicing that line all week.\"");
        const c = await api.choose(null, [
          { label: "Tell her it was the city's loss", value: 'loss' },
          { label: 'Ask what she would have been like as a detective', value: 'ask' },
        ]);
        if (c === 'loss') {
          await api.sayMood('bev', 'happy', "City's loss. I like that. I'm going to say that to the goat.");
          api.hearts('bev', 15);
        } else {
          await api.narrate('She thinks about it for a long time. Long enough that Doug lies down.');
          await api.say('bev', "Tired. Good at it. Lonely, probably.");
          await api.narrate('She looks over at Lorraine, who is pretending not to listen, badly.');
          await api.sayMood('bev', 'love', "Wouldn't have met her, either. City doesn't have feed stores. I checked.");
          api.hearts('bev', 30);
        }
      },
    },
    {
      id: 'bev-8', hearts: 8, map: 'fair', title: 'Twenty Minutes',
      script: async (api) => {
        await api.narrate("A busy afternoon at the fairgrounds. Then Pip's dad Marcus is running down the midway, calling Pip's name. Pip's other dad is right behind.");
        await api.narrate('Sheriff Bev is there before the second call is finished.');
        await api.say('bev', "Marcus. Theo. Look at me. He's ten, he's got light-up shoes, and this fairground's got one gate. We'll have him in ten minutes.");
        await api.say('bev', "{name}, take the barns. I've got the midway. Doug's got everything else.");
        await api.narrate("It's not ten minutes. It's twenty. Twenty long minutes of calling and looking under things.");
        await api.narrate("Then, by her fence, you notice Wanda. She is standing very still, staring hard at the funnel-cake stand. Pointing with her whole nose.");
        await api.narrate("Behind the stand, curled on a pile of flattened boxes, cardboard belt for a pillow, Pip is fast asleep.");
        await api.narrate("Bev kneels and wakes him like it's the most ordinary thing in the world. \"Hey, champ. Your dads want to know about your title defense.\"");
        await api.narrate("She walks him back holding his hand. She's calm, and kind, and perfect. Then she hands him over and walks behind the grandstand.");
        await api.narrate('When you find her, she is sitting on an overturned bucket. Her hands are shaking. She looks at them like they belong to someone else.');
        await api.sayMood('bev', 'sad', "That's the job, kid. The twenty minutes. The rest is paperwork and wrestling.");
        const c = await api.choose(null, [
          { label: 'Take her hands and hold them steady', value: 'hands' },
          { label: 'Hand her a sunflower seed', value: 'seed' },
        ]);
        if (c === 'hands') {
          await api.narrate("You hold her hands until they stop. It takes a while. She doesn't pull away.");
          await api.say('bev', "...Thank you. Don't tell Lorraine. She'll make me talk about it. ...I'll tell her myself.");
          api.hearts('bev', 30);
        } else {
          await api.narrate('She takes it. Looks at it. Laughs, once, wet.');
          await api.say('bev', "Ranch. ...You're a good egg.");
          api.hearts('bev', 15);
        }
        await api.narrate("At the fence, Wanda bows to the sheriff. Very deeply. Bev, after a moment, tips her hat back.");
      },
    },
    {
      id: 'bev-10', hearts: 10, title: 'Deputy',
      script: async (api) => {
        await api.narrate('Sheriff Bev clears her throat. She has clearly rehearsed this. Doug, beside her, is sitting very straight.');
        await api.say('bev', "Lorraine wants to see the Grand Canyon next spring. Two weeks. I haven't taken two weeks off in eighteen years.");
        await api.say('bev', "Somebody's got to keep an eye on this town while I'm gone.");
        await api.narrate('She holds out a tin star. It is from a cereal box. It has been laminated, carefully, with no bubbles.');
        const c = await api.choose('The star catches the light.', [
          { label: 'Raise your right hand', value: 'raise' },
          { label: 'Ask what the duties are', value: 'duties' },
        ]);
        if (c === 'raise') {
          await api.narrate('You raise your right hand. Bev blinks, hard, then raises hers. Doug, unprompted, raises a paw.');
          await api.sayMood('bev', 'love', "Do you solemnly swear to keep an eye on things. ...That's it. That's the whole oath. I wrote it.");
          api.hearts('bev', 30);
        } else {
          await api.say('bev', "Water my tomatoes. Check on Agnes. Drive Mr. Haddad Thursdays. Watch for the raccoon.");
          await api.sayMood('bev', 'smug', "Don't arrest the raccoon. He's a regular. We have an understanding.");
          api.hearts('bev', 15);
        }
        await api.narrate('She pins the star on you herself, and steps back to look at it, and pulls her aviators down so you cannot see her eyes.');
        api.flag('bev_badge');
      },
    },
  ],
} satisfies DialogueSet;
