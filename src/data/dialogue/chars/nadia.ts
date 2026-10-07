import type { DialogueSet } from '../types';

/**
 * Dr. Nadia Rahimi, 30. The new veterinarian at Bramble Creek Animal Clinic.
 * A mark: horrified by wrestling and unable to stop going. She researches
 * concussions, sends care packages after big matches, and once lectured the
 * Dust Devil on head injuries. She believes your feuds are real.
 *
 * Earnest, anxious, warm, protective to the point of ferocity, quietly brilliant.
 * Eldest of four in an Afghan-American family; plays cello; lives with Biscuit, a
 * gray cat with one folded ear. Wanda is her first big case and her favorite
 * patient. She is working on believing she belongs here.
 *
 * Romanceable. 12 = Behind the Curtain (referee in training under Mo; relief,
 * fury, fascination: 'nadia_curtain'); 14 = the proposal setup at the clinic, where
 * Biscuit is wearing the Tag Rope ('nadia_proposal_ready').
 */
export default {
  npc: 'nadia',
  intro: [
    "(A tall woman in cow-print scrubs and rubber boots nearly collides with you, a pencil skewered through her messy bun.) Oh! Sorry! Dr.",
    "Rahimi. Nadia. The new vet. Bramble Creek Animal Clinic. Please don't tell the farmers I said 'new.'",
    "(She checks your pupils with a penlight before you can react.) Pupils fine. You look like a person who gets hit with chairs.",
    "Everyone here looks like that. I carry a first-aid kit now.",
    "I'm not saying I'm worried about you. I'm saying I have fourteen bandages and I'm very good with a splint.",
    "Sorry. I do this. Hello. Welcome to town. Is that a bruise?",
  ],
  lines: [
    // ---------------------------------------------------------------- Strangers
    { text: "That man hit you with a CHAIR. A CHAIR! Why is everyone CLAPPING?", when: { flag: 'debuted', weekday: [3, 6] }, weight: 2 },
    { text: "I carry a first-aid kit everywhere now. For you. Don't make that face. It's a good kit. It has a lollipop.", when: { hearts: [0, 5] } },
    { text: "I researched concussions last night. Four hours. A concussion is basically the brain bouncing in a jar. Don't bounce. Please.", when: { hearts: [0, 5] } },
    { text: ["The Mountain reached the high shelf for me at the grocery store. Then he nodded. Gently. I don't understand that man.", "He's a menace with excellent manners."], when: { hearts: [0, 6] } },
    { text: ["The farmers keep saying 'Dr. Bramble would've done it this way.' Dr. Bramble retired to Florida to fish. I love Dr. Bramble.", "I've also never wanted so badly to be a fish."], when: { hearts: [0, 4] } },
    { text: ["Biscuit is a gray cat with one folded ear and the soul of a retired boxer. He sits on my cello. I've stopped moving him.", "It's a collaboration."], when: { hearts: [0, 10] } },

    // ---------------------------------------------------------------- Her animals and neighbors
    { text: ["Wanda has the best manners of any patient I've ever had. She opens her mouth, she waits, she bows.", "I've known people with worse bedside manner."], when: { hearts: [0, 10] } },
    { text: "I've been trying to vaccinate Jobber for a year. A YEAR. He knows the carrier. He knows my car. He has begun sending... looks.", when: { hearts: [0, 10] }, mood: 'angry' },
    { text: "Deputy Doug's a basset hound with gravitas. He sits in my waiting room like a magistrate. Bev says he's 'good for morale.' He is.", when: { hearts: [3, 10] } },
    { text: "Ms. Pruitt does adoption days at my clinic. She brings math worksheets for the cats. I don't ask. The cats appear to enjoy them.", when: { hearts: [3, 10] } },
    { text: ["Dr. Halloran and I trade terrible vet-and-chiropractor jokes. Last week: 'I'd treat your dog's back, but he's a little ruff.' I laughed.", "It was an emergency laugh."], when: { hearts: [3, 10] } },
    { text: "Wanda's checkup is Saturday mornings. She's the only patient who thanks me with a hug. It's a medical risk and a professional highlight.", when: { map: ['fair'] } },
    { text: "Sami hums when he works. I hum when I'm nervous. Together we make a very worried choir.", when: { hearts: [3, 10], weekday: [4] } },
    { text: ["I play at the Evening Bell on Fridays with Sami. Mostly waltzes. Mrs. Velma critiques my vibrato. She's right. She's always right.", "It's frightening."], when: { weekday: [4] } },

    // ---------------------------------------------------------------- Her family and her fear
    { text: ["I'm the eldest of four. My parents have a bakery two hours away. They call every night to ask if I'm eating.", "I'm holding a cardamom cookie right now."], when: { hearts: [3, 10] } },
    { text: "In the city I was one of forty vets. Here I'm THE vet. If I'm not good enough, there's nobody else. That's terrifying. It's also why I stay.", when: { hearts: [6, 10] }, mood: 'sad' },
    { text: ["I used to think I'd move back when this was over. Now I'm not sure what 'over' is. I bought a second cello stand.", "That's practically a mortgage."], when: { hearts: [6, 10] }, mood: 'happy' },

    // ---------------------------------------------------------------- Show days and worry
    { text: ["I'm bringing the kit, two ice packs and a juice box. For everyone. Even the villains. Especially the villains.", "They're the ones who fall the furthest."], when: { showDay: true, weekday: [5] } },
    { text: "VFW tonight. First-aid kit in my lap. Birdie says I'm the best-prepared audience she's ever had. I'm choosing to take it as praise.", when: { weekday: [2] } },
    { text: "You won! Good. I mean, you won, so he lost, so that's a man hurt? But he deserved it. I think. Is it okay to cheer? I'll cheer quietly.", when: { alignment: ['face'], flag: 'debuted', weekday: [3, 6] } },
    { text: "You hit someone from behind. I have notes. I'm going to organize them by body part.", when: { alignment: ['heel'], flag: 'debuted', place: ['public'] }, weight: 2 },
    { text: "I'm not telling you to quit. I'm telling you to ice. Twenty on, twenty off. Please.", when: { hearts: [3, 10], flag: 'debuted' } },
    { text: ["Main event? That's longer matches, bigger bumps. I'm not thrilled. I made you a care package. It has a heating pad and a note.", "The note says 'be careful' forty times."], when: { rank: ['main', 'assistant', 'pencil', 'owner'], hearts: [3, 10] } },

    // ---------------------------------------------------------------- Weather and seasons
    { text: "Rain's hard on old hips and nervous cats. I keep the clinic warm. It's a vet rule: pets feel your weather.", when: { weather: ['rain'] } },
    { text: "Spring. Every newborn arrives at once: calves, lambs, kittens. I haven't slept since March. I've never been happier.", when: { season: [0] }, weight: 2 },
    { text: "Fairgrounds Fury. Wanda's annual title defense. My medical team's on standby. It's me. And Clint. And a honey spoon.", when: { season: [1] } },
    { text: "Fall. Every pet wants to eat leaves. I don't know why. They all look so guilty afterward.", when: { season: [2] } },
    { text: "Winter. Wanda dens. I check on her once a week with a stethoscope and an apology. She sleeps through both.", when: { season: [3] } },

    // ---------------------------------------------------------------- After the story beats
    { text: "Your grandmother hummed every note. Every note! I still don't know how.", when: { flag: 'nadia_cello' }, mood: 'sad' },
    { text: "I stitched a man's eyebrow at two in the morning and it turns out the cut was planned. Not the stitches. The cut. I'm fine. I'm FINE.", when: { flag: 'nadia_curtain', place: ['insider'] }, mood: 'surprised' },
    { text: ["The Mountain reached the high shelf for me again. This time I said thank you. He whispered 'you're welcome.' We've become friends.", "I cried a little."], when: { flag: 'nadia_curtain', place: ['insider'] }, mood: 'happy' },
    { text: "I keep a spare lollipop in my coat for you. It's the most romantic thing I've ever done.", when: { dating: true }, mood: 'love' },
    { text: "Married to a wrestler. I check the lineup like a weather report. 'Today: forty percent chance of chairs.'", when: { married: true } },
  ],
  gifts: {
    loves: ['honey', 'yarn', 'polaroid'],
    likes: ['teacup', 'concha', 'wildflowers', 'bouquet', 'tape'],
    dislikes: ['gas-hotdog', 'bait', 'toy-wrestler'],
  },
  giftReplies: {
    love: [
      "Oh. Oh, this is... okay. I'm going to play something for you right now, and you're not allowed to leave.",
      "(She holds it to her chest, eyes shining.) Do you know what this means to someone whose entire social life is a cat and a bear?",
      "This is perfect. This is the nicest thing a patient's owner has ever not-given me. I mean you're not an owner. I mean thank you.",
    ],
    like: [
      "That's so sweet. I'm going to put it by the cello where I can see it.",
      "For me? Thank you! I'm going to bring it to the clinic. Everyone will be so jealous. Especially Biscuit.",
    ],
    neutral: [
      "Oh! Thank you! That's kind. I'll find a spot for it. Probably next to something with fur.",
      "A gift! You didn't have to. I mean, I'm glad you did. I mean I'm... thank you!",
    ],
    dislike: [
      "Oh no. Is that... did something chew this? Which animal? I have to know. For the record.",
      "Thank you! I'm going to... put this somewhere a cat can't get to it. Everything's a cat problem eventually.",
      "I appreciate the thought. I'm also going to wash my hands for four minutes. Nothing personal.",
    ],
    birthday: [
      "You remembered my birthday?! I only told my mother, who told my aunt, who... oh. It was a very public secret. Thank you.",
      "A birthday present! I'm going to cry in the supply closet, and then I'm going to bring cardamom cookies to the whole waiting room.",
    ],
  },
  birthday: { season: 2, day: 21 },
  events: [
    // ---------------------------------------------------------------- 2: Follow my finger
    {
      id: 'nadia-2', hearts: 2, map: 'town', when: { flag: 'debuted' }, title: 'Follow My Finger',
      script: async (api) => {
        await api.narrate("Outside the Sportatorium, after your first match. The crowd is pouring into the night.", "Someone grabs your arm, spins you around, and aims a penlight directly into your left eye.");
        await api.say('nadia', "Follow my finger. Don't move your head. Follow... did he hit your head? He hit your HEAD.");
        await api.narrate("Scrubs printed with cartoon cows. Rubber boots. A cardigan with treat-shaped bulges in every pocket. A pencil skewered through a messy bun.");
        await api.say('nadia', "I'm Dr. Rahimi. I'm a vet. I know! I know. But I'm the only doctor in the parking lot, and you're a mammal.");
        await api.narrate("She makes you follow her finger left, right, up. She smells faintly of chamomile and goat.");
        await api.say('nadia', "Pupils equal. Reactive. Who hit you? Was it that man? I'll find him. I'll lecture him. I'll lecture him on neuroscience.");
        const c = await api.choose(null, [
          { label: 'Hold still and let her finish', value: 'still' },
          { label: "Tell her it's part of the job", value: 'job' },
        ]);
        if (c === 'still') {
          api.hearts('nadia', 30);
          await api.sayMood('nadia', 'happy', "Thank you. Thank you for letting me. Nobody ever lets me. They say 'I'm fine' and fall over.");
        } else {
          api.hearts('nadia', 15);
          await api.sayMood('nadia', 'surprised', "It's PART OF THE JOB? Who writes that job? ...I'm writing a letter.");
        }
        await api.narrate("She presses a lollipop into your hand and a business card: BRAMBLE CREEK ANIMAL CLINIC. AFTER HOURS: KNOCK, THEN KNOCK LOUDER.", "She is gone into the crowd before you can say a word.");
      },
    },
    // ---------------------------------------------------------------- 4: Open wide
    {
      id: 'nadia-4', hearts: 4, map: 'fair', title: 'Open Wide',
      script: async (api) => {
        await api.narrate("The fairgrounds, morning mist rising off the pond. Clint leans on the fence with a honey spoon and an expression of enormous patience.", "Nadia kneels in front of three hundred pounds of black bear.");
        await api.say('nadia', "Okay, Wanda. Big smile. Show me the molars. It's just me.");
        await api.narrate("Wanda bows. Then she opens her mouth wide and polite, like a patient at a very elegant dentist, and waits.");
        await api.say('nadia', "(whispering) Oh, she's so good. Look at that. Perfect. Zero tartar. You've been brushing, haven't you? You've been...");
        await api.say('clint', "Ma'am, she eats honey off a spoon. She doesn't brush.");
        await api.say('clint', "She don't open up for just anybody, though. I'll tell you that.");
        await api.narrate("Nadia has gone very still. She is, you realize, trying not to cry in front of a bear.");
        await api.say('nadia', "She trusts me. The bear trusts me. The farmers won't, but the BEAR...");
        const c = await api.choose(null, [
          { label: "Tell her the bear's never wrong", value: 'never' },
          { label: 'Hand her a tissue and say nothing', value: 'tissue' },
        ]);
        if (c === 'never') {
          api.hearts('nadia', 30);
          await api.sayMood('nadia', 'happy', "Wanda's never wrong. (She sniffles.) That's a clinical fact now. I'm putting it in the chart.");
        } else {
          api.hearts('nadia', 15);
          await api.narrate("She takes the tissue.", "Wanda, in the background, closes her mouth, bows, and places one enormous paw on the fence post, as close to a hug as she can reach.");
        }
        await api.narrate("Wanda bows to both of you. It's the deepest bow you've seen her give. Clint takes off his hat.");
      },
    },
    // ---------------------------------------------------------------- 6: Never Dr. Bramble
    {
      id: 'nadia-6', hearts: 6, map: 'clinic', title: 'Never Dr. Bramble',
      script: async (api) => {
        await api.fade();
        await api.narrate("Bramble Creek Animal Clinic, after hours. One lamp on. A gray cat with a folded ear glares from the reception desk.", "In the exam room, Nadia sits on the tile with her back against a cabinet, face buried in a very large cat.");
        await api.say('nadia', "I'm fine. Everything's fine. Biscuit and I are having a moment.");
        await api.narrate("You sit down on the tile beside her. Biscuit shifts two inches closer, which for him is an embrace.");
        await api.say('nadia', "Mr. Hadley said it to my face today. 'You'll never be Dr. Bramble.' Then he thanked me for the calf. At the SAME TIME.");
        await api.say('nadia', "I did stitches at two a.m. in a barn with a flashlight in my teeth. And I'll never be Dr. Bramble. I know. I know he's right. I'm not him.", "I'm worse. I'm earlier. I'm... I'm *new.*");
        await api.narrate("She sniffles. Biscuit headbutts her chin with the weary air of a man doing a long overdue job.");
        const c = await api.choose(null, [
          { label: "Tell her the calf is walking because of her", value: 'calf' },
          { label: 'Just sit with her', value: 'sit' },
        ]);
        if (c === 'calf') {
          api.hearts('nadia', 30);
          await api.say('nadia', "...He did thank me. Mr. Hadley doesn't thank anybody. He barely thanks his own dog.");
          await api.sayMood('nadia', 'happy', "The calf was standing by six. She's walking now. She has no idea who Dr. Bramble is. She thinks I'm the one who matters.");
        } else {
          api.hearts('nadia', 15);
          await api.narrate("You stay. Neither of you says anything. After a while, her head tips against your shoulder.", "Biscuit crawls, with great reluctance, into both your laps.");
          await api.say('nadia', "...You're warm. I like that. That's a clinical observation.");
        }
        await api.narrate("The lamp hums. Somewhere in the back, a goat bleats at nothing. For the first time all week, Nadia laughs.");
      },
    },
    // ---------------------------------------------------------------- 8: Every note
    {
      id: 'nadia-8', hearts: 8, when: { flag: 'grandma_in_town', weekday: [4] }, title: 'Every Note',
      script: async (api) => {
        await api.narrate("Friday night in the Evening Bell sunroom. Sami on ukulele, Nadia on cello, the gentlest string duet in the county.", "A dozen residents in folding chairs. In the front, Dottie, hands folded in her lap, looking at nothing, at the window.");
        await api.narrate("It's one of the foggy ones. She asked Sami twice who was playing.");
        await api.narrate("Nadia lifts her bow. The piece is a slow French song arranged for cello. She picked it from her old student books.", "She's never played it for anyone.");
        await api.narrate("Halfway through, a small sound beside the music. Dottie's eyes are closed.", "She is humming, every note, a half-beat ahead, the way she'd call a match.");
        await api.narrate("Nadia's bow falters. Sami, without breaking his strum, nods at her to keep going. She does.");
        await api.fade();
        await api.narrate("The parking lot, after. Nadia sits on the bumper of her mud-spattered truck, the cello case beside her like a sleeping passenger.", "She's crying quietly.");
        await api.say('nadia', "She knew every note. How did she know every note?");
        const c = await api.choose(null, [
          { label: "Tell her what Sami says: music stays when names don't", value: 'sami' },
          { label: 'Sit down beside her and say nothing', value: 'sit' },
        ]);
        if (c === 'sami') {
          api.hearts('nadia', 30);
          await api.say('nadia', "...That's the kindest thing I've ever heard. And it's unbearable. Both. Sami would say both.");
        } else {
          api.hearts('nadia', 15);
          await api.narrate("You sit on the bumper next to her. The truck creaks. The stars come out over the Evening Bell, one window at a time.");
        }
        await api.say('nadia', "I'm going to play it again next Friday. And the Friday after. Until she knows she knows it.");
        api.flag('nadia_cello');
      },
    },
    // ---------------------------------------------------------------- 10: Please stop
    {
      id: 'nadia-10', hearts: 10, title: 'Please Stop',
      script: async (api) => {
        await api.narrate("A rainy night. The clinic's lit window. Nadia waits for you on the back steps with a thermos and an umbrella she isn't using.");
        await api.say('nadia', "I need to ask you something. I need you not to make a joke.");
        await api.say('nadia', "I've watched you get hit with chairs. I've watched you get thrown off ropes. I've stitched your eyebrow. I've lain awake...");
        await api.say('nadia', "Please stop wrestling. I know that's not fair. I know it's your whole life now. I can't watch you get hurt.");
        await api.narrate("You can't tell her the truth. Not yet. It isn't yours to tell. But there is a true thing you can say.");
        const c = await api.choose('The rain keeps falling on the steps between you.', [
          { label: "I'm careful. I trust the people in that ring with my life.", value: 'trust' },
          { label: "I can't stop. But I'll let you ice me after every match.", value: 'ice' },
        ]);
        if (c === 'trust') {
          api.hearts('nadia', 30);
          await api.narrate('She looks at you for a long time. The rain beads on her pencil, her bun, her eyelashes.');
          await api.say('nadia', "...Okay. Okay. I'm going to trust that. I'm choosing to. That's a choice. I'm making it.");
        } else {
          api.hearts('nadia', 15);
          await api.say('nadia', "Ice after every match. In writing. And vegetables. ...Fine. Okay. I choose to trust you. That's a choice. I'm making it.");
        }
        await api.narrate("She hands you the thermos. It's cardamom tea, the way her mother makes it. A rubber-booted foot nudges yours.", "She carries the first-aid kit in anyway.");
        api.flag('nadia_trust');
      },
    },
    // ---------------------------------------------------------------- 12: Behind the Curtain
    {
      id: 'nadia-12', hearts: 12, map: 'clinic', when: { dating: true }, title: 'Behind the Curtain',
      script: async (api) => {
        await api.fade();
        await api.narrate("The Sportatorium locker room, after midnight.", "Nadia stands in the middle of it in her cow scrubs, holding her first-aid kit in both arms, looking at Birdie and Mo,", "who are looking at her.");
        await api.say('birdie', "Sit down, sugar. You've been crossing the street for a year. I'd like to explain why you didn't have to.");
        await api.narrate("They tell her. It takes about four minutes. Nadia's face does a number of things, in order.");
        await api.sayMood('nadia', 'surprised', "He's not trying to HURT you?");
        await api.say('mo', "Nobody's trying to hurt anybody. That's the whole job.");
        await api.narrate("She starts to laugh, and for one second it's pure relief, bright and shaky. Then the laugh stops. Her eyes narrow.");
        await api.sayMood('nadia', 'angry', "I stitched your eyebrow at two in the morning!");
        await api.say('mo', "That cut was real. Dex clipped the corner on a bad landing. The stitches were real, Doc.");
        await api.say('nadia', "...Okay. Okay. That's... I'll allow that.");
        await api.narrate("There is a pause. Her fury cools, and something else rises behind it, a bright, hungry light.");
        await api.sayMood('nadia', 'happy', "Wait. How do you land? Where do you tuck? Is it the hip or the shoulder? Show me. SHOW me.");
        await api.say('nadia', "Wait. The Mountain is NICE? I've been crossing the street for a YEAR.");
        const c = await api.choose("She turns to you. 'Did you know the whole time?'", [
          { label: "I wanted to tell you. Every day.", value: 'wanted' },
          { label: "It wasn't mine to tell.", value: 'notmine' },
        ]);
        if (c === 'wanted') {
          api.hearts('nadia', 30);
          await api.say('nadia', "(She exhales.) I'd have been furious if you'd told me. I'd have been furious if you hadn't. I'm choosing to be furious a *little.*");
        } else {
          api.hearts('nadia', 15);
          await api.say('nadia', "That's... a very fair answer. I hate that it's a fair answer. I'm going to be mad about it later, in a very organized way.");
        }
        await api.say('mo', "Dr. Rahimi. Ever want to learn to count to three?");
        await api.sayMood('nadia', 'happy', "I have a whistle in my pocket from my first-aid kit. I've never used it. Where do I stand?");
        api.flag('nadia_curtain');
      },
    },
    // ---------------------------------------------------------------- 14: Biscuit in the Tag Rope (proposal setup)
    {
      id: 'nadia-14', hearts: 14, map: 'clinic', when: { dating: true, flag: 'nadia_curtain' }, title: 'The Tag Rope',
      script: async (api) => {
        await api.narrate("The clinic, closing time. The rope is in your pocket: braided, wound in gold thread, heavy as a promise. You've been rehearsing for a week.", "You had a speech. You had a whole speech.");
        await api.say('nadia', "Oh, good, you're here. Come in. I have an emergency in exam room two. Biscuit's... well, you'll see.");
        await api.narrate("In exam room two, Biscuit sits on the steel table like a very small, very furious king.", "Around his neck, as a collar, hangs a turnbuckle tassel in gold thread.");
        await api.say('nadia', "He found it in your bag. I'm sorry. He does that. He took it and he wore it and he won't give it back.");
        await api.narrate("You look at the cat. The cat looks at you. His one folded ear flattens in outrage.");
        await api.sayMood('nadia', 'happy', "I know what it is. Mo told me. Marigold told Mo. Everyone knows. I'd like it noted I've been rehearsing my answer for six weeks.");
        await api.narrate("She steps close, hands tucked into her scrubs pockets, cheeks the color of her boots.");
        const c = await api.choose('Biscuit glares between you.', [
          { label: 'Hold out your hand over the cat, the way you reach for a tag', value: 'tag' },
          { label: "Formally ask Biscuit's permission", value: 'cat' },
        ]);
        if (c === 'tag') {
          api.hearts('nadia', 30);
          await api.narrate("You hold out your hand over the glaring cat, palm up. Nadia stares at it.", "Then she slaps it, smartly, like a wrestler on the apron, and laughs until she cries.");
          await api.say('nadia', "Tag. Yes. Tag. Biscuit, say something.");
          await api.narrate('Biscuit does not.');
        } else {
          api.hearts('nadia', 15);
          await api.narrate("You solemnly ask Biscuit. He considers it. He turns his back and begins to wash. Nadia, laughing, says: 'That's a yes.", "He always says yes to bribes.'");
        }
        await api.narrate("Biscuit, still wearing the Tag Rope, jumps off the table and stalks out of the exam room with wounded dignity.");
        api.flag('nadia_proposal_ready', true);
      },
    },
  ],
} satisfies DialogueSet;
