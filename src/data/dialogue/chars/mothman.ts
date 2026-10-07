import type { DialogueSet } from '../types';

/**
 * The Mothman. Appears only at night. Never speaks, not even in insider rooms:
 * every line is an action. Gifts are left on the Moth Stump by the water tower.
 * Secretly Referee Mo (CAST Part 8). The clue trail is all here in plain sight
 * (junk mail, a postal slip, a red light on the creek road, threes, Jobber,
 * honey, coffee) and the 10-heart event is the full reveal path: the note,
 * Jobber at dawn, the stakeout under the ring, the locker room, the promise.
 * It sets 'mothman_revealed' (read by mo.ts). The town never learns.
 */
export default {
  npc: 'mothman',
  intro: [
    'Something is perched on the water tower ladder, very still. Two red lights where eyes should be.',
    'It tilts its head at you. The antennae bob. A little dust drifts down through the safety light, glittering.',
    'You blink. The ladder is empty. Somewhere, very faintly, three soft notes, like someone humming a count.',
  ],
  lines: [
    // ---- Strangers
    { text: 'The Mothman tilts its head at you. Somewhere a porch light hums. When you blink, it\'s gone.', when: { hearts: [0, 2] }, weight: 2 },
    { text: 'It stands perfectly still under the water tower light, watching the moths circle. It does not seem to notice you. Then it does.', when: { hearts: [0, 2] } },
    { text: 'It raises one wing slowly, the way you would shade your eyes. It is looking at the moon.', when: { hearts: [0, 5] } },
    { text: 'Two red eyes. One tilt of the head. A shimmer of dust on the air. It takes one step back into the dark and is simply not there.', when: { hearts: [0, 2] } },
    { text: 'It points at you. Just points. Holds it. Then it points at the sky. You look up. When you look back, it is gone.', when: { hearts: [0, 5] } },
    { text: 'The fog on the creek road is thick at this hour. A red glow moves through it, steady and unhurried, like someone with somewhere to be.', when: { time: [240, 360] } },
    { text: 'Far off by the flea market, a flashlight beam sweeps the trees. Fenwick, on stakeout. The Mothman watches it pass. It does not move. It is very good at this.', when: { weekday: [1, 4], time: [1260, 1439] } },
    { text: 'It is Wednesday. The Mothman regards you with the patience of something that does not do Wednesdays.', when: { weekday: [2] } },
    { text: 'Saturday night. It faces the Sportatorium, where the marquee is still lit. It bows to the marquee. Then, after a moment, to you.', when: { weekday: [5] } },

    // ---- Weather and seasons
    { text: 'Rain drips off its antennae. It looks, somehow, like it has opinions about this.', when: { weather: ['rain'] } },
    { text: 'Lightning. For one white instant you see it clearly on the rail of the water tower, wings wide. Thunder. Gone.', when: { weather: ['storm'] } },
    { text: 'The wind fills its wings like sails. It leans into it, the way a kite leans into its work.', when: { weather: ['wind'] } },
    { text: 'Snow has settled on its wings. It shakes once, very dignified, and a little cloud of snow and dust drifts away.', when: { weather: ['snow'] } },
    { text: 'The first moths of spring circle the safety light. The Mothman watches them with what you would swear is pride.', when: { season: [0] }, weight: 2 },
    { text: 'Fireflies blink in the weeds. It holds very still, and a firefly lands on one antenna. Neither of them moves for a long time.', when: { season: [1] } },
    { text: 'A leaf drifts down and lands on its head. It does not remove the leaf. It wears the leaf. It seems to like the leaf.', when: { season: [2] } },
    { text: 'Your breath fogs in the cold. Its does not. It tilts its head at your little cloud, curious.', when: { season: [3] } },

    // ---- Friends
    { text: 'It tilts its head at your pocket. If you had honey, it would like to know. It is a very polite sort of looking.', when: { hearts: [3, 10] } },
    { text: 'It taps the stump three times. One. Two. Three. Then it settles back on its heels and waits, as if it has done something important.', when: { hearts: [3, 10] } },
    { text: 'A raccoon sits at its feet, holding a cracker. The Mothman and the raccoon both look at you as if you have interrupted a meeting.', when: { hearts: [3, 10] } },
    { text: 'It bows, low, wings folded. Far across the fields, at the fairgrounds fence, you are almost sure something large and round bows back.', when: { hearts: [3, 10] } },
    { text: 'A moth rests on one of its gloved fingers. It lifts the moth toward the safety light, very gently, and lets it go.', when: { hearts: [3, 10] } },
    { text: 'It looks at you a long time. Not unkind. Measuring. As if deciding which side of tonight\'s story you are on.', when: { hearts: [3, 8], alignment: ['heel'] } },
    { text: 'It gives you a small, crisp nod. The kind you would give a teammate across a ring.', when: { hearts: [3, 10], alignment: ['face'] } },
    { text: 'It is sitting on the stump with its knees drawn up, watching the town. It shifts over, just a little. There is room.', when: { hearts: [3, 10] } },

    // ---- Close
    { text: 'It sits beside you on the stump. Not touching. Just there. The safety light hums. After a while you realize it is humming too.', when: { hearts: [6, 10] } },
    { text: 'The wind picks up. It folds one wing around your shoulders for a single second. Then it unfolds it, as if that did not happen.', when: { hearts: [6, 10] } },
    { text: 'With one finger, it traces a shape in the dust on the stump: a small rectangle with a square in the corner. Then it brushes it away.', when: { hearts: [6, 10] } },
    { text: 'Its red eyes dim, then brighten. Twice. Like a blink. Like a wink. Like nothing at all.', when: { hearts: [6, 10] } },

    // ---- Family
    { text: 'It watches the town lights go out one by one beside you. When the last porch light clicks off, it looks at you, as if to say: not yet.', when: { hearts: [9, 10] } },
    { text: 'It faces the Evening Bell. One window on the second floor is still lit. It lifts a wing toward it, slowly, like a wave.', when: { hearts: [9, 10], flag: 'grandma_in_town' } },

    // ---- After the reveal (it still never speaks)
    { text: 'It holds one finger up to where its lips would be. Then, very quietly, it counts on its fingers. One. Two. Three.', when: { flag: 'mothman_revealed' } },
    { text: 'It looks both ways, very carefully. Then it bumps your shoulder with its shoulder. Exactly once.', when: { flag: 'mothman_revealed' } },
    { text: 'It tilts its head at you. You tilt yours back. Somewhere under the Sportatorium ring, an old porch-light switch is waiting.', when: { flag: 'mothman_revealed', showDay: true } },
  ],
  gifts: {
    loves: ['honey', 'coffee'],
    likes: ['wildflowers', 'feather', 'sequins', 'rhinestone', 'river-stone'],
    dislikes: ['mothman-figure', 'polaroid'],
  },
  giftReplies: {
    love: [
      'At dawn your gift is gone. In its place, a paper moth with its wings spread wide, which is how moths look when they are happy.',
      'Gone by morning. A note in block capitals: THANK YOU. THIS WAS VERY GOOD. TELL THE BEAR.',
      'Your gift is gone. On the stump, three smooth pebbles in a neat row. One. Two. Three.',
    ],
    like: [
      'Gone by morning. A single scale of dusty brown felt lies where it was.',
      'In its place at dawn, a pinecone, set very precisely in the center of the stump.',
      'It is gone. A little shimmer of dust is left behind, like a thank-you you can only see in the right light.',
    ],
    neutral: [
      'Gone by morning. Nothing in its place. Just a faint glitter of dust.',
      'It is gone. You could swear the stump looks pleased.',
    ],
    dislike: [
      'At dawn your gift is still on the stump. It has been turned, very politely, to face away from the water tower.',
      'Still there in the morning. Beside it, a note in block capitals: NO THANK YOU. (POLITELY.)',
      'It is still on the stump at dawn, with a neat strip of tape over anything that looks like it might be watching.',
    ],
    byItem: {
      honey: 'At dawn the honey is gone. The lid is on the stump, washed, dried, and set upside down so the rain will not get in. Beside it: three pebbles.',
      coffee: 'Gone by morning, cup and all. Around five-thirty a red light moves along the creek road a little faster than usual.',
      wildflowers: 'In the morning the flowers are still there, but rearranged into a perfect circle around the stump, heads pointing out, like a small crowd.',
      feather: 'The wing is gone at dawn. A note in block capitals: WHERE. (THANK YOU.) (BUT WHERE.)',
      sequins: 'Gone by morning. For a week after, the water tower ladder glitters in the safety light, one rung at a time.',
      rhinestone: 'At dawn the rhinestone is gone. That Saturday, high in the rafters, something red glints exactly once.',
      'river-stone': 'The stone is still there in the morning, but moved to the very center of the stump, with two smaller stones beside it. A family.',
    },
    later: [
      'On the stump this morning: a pinecone, a bottle cap, and a scrap of paper. The paper says, in block capitals, STILL GOOD. It means the {lastGift}.',
      'A red light on the creek road at five a.m. slows down as it passes you. Just slightly. Then it is gone into the fog.',
    ],
  },
  again: [
    'It tilts its head at you again, a little further, as if to say: still here?',
    'It is looking the other way now, very deliberately. You have been noticed. That is enough for one night.',
    'You blink. The stump is empty. On it, a single moth, which flies off as you look.',
  ],
  idle: [
    'Nothing on the stump tonight but dew and one patient moth.',
    'The safety light hums. Something in the dark beyond it does not.',
  ],
  events: [
    {
      id: 'mothman-2', hearts: 2, title: 'A Scale of Felt',
      script: async (api) => {
        await api.narrate("Night. The water tower's safety light hums. Moths circle it in slow silver loops.");
        await api.narrate('Something is crouched on the Moth Stump. Two red eyes. It has been waiting, you realize. For you.');
        await api.narrate('It tilts its head. The antennae bob. Then it unfolds from the stump in one long, silent movement and steps back into the dark.');
        await api.narrate('Your last gift is gone. In its place: one scrap of dusty brown felt, soft and frayed at the edges, like a scale from a wing.');
        const c = await api.choose(null, [
          { label: 'Keep the scale', value: 'keep' },
          { label: 'Leave something shiny in its place', value: 'leave' },
        ]);
        if (c === 'keep') {
          api.hearts('mothman', 15);
          await api.narrate('You tuck it into your pocket. Somewhere in the dark, very faintly, three soft notes, like someone humming a count.');
        } else {
          api.hearts('mothman', 30);
          await api.narrate('You polish a coin on your sleeve until it catches the light, and set it on the stump. From the trees, two red eyes blink. Slowly. Twice.');
        }
        await api.narrate("Tied to a fence post nearby, a length of Fenwick's red string flutters in the breeze. It doesn't lead anywhere. It never does.");
      },
    },
    {
      id: 'mothman-4', hearts: 4, title: 'Thank You',
      script: async (api) => {
        await api.narrate('Before dawn, mist on the creek road. It is already at the stump, sitting on its heels, holding something in both hands.');
        await api.narrate('It sets a folded paper on the stump, smooths it flat with one gloved finger, and steps back. Waiting.');
        await api.narrate('Block capitals, very neat: THANK YOU.');
        await api.narrate('You turn it over. It\'s written on the back of a junk-mail flyer. *CURRENT RESIDENT: YOU MAY ALREADY BE A WINNER.*');
        await api.narrate('The Mothman tilts its head, as if asking whether you have noticed something. Or as if hoping you have not.');
        const c = await api.choose(null, [
          { label: "Write YOU'RE WELCOME under it", value: 'write' },
          { label: 'Fold the note into your pocket', value: 'pocket' },
        ]);
        if (c === 'write') {
          api.hearts('mothman', 30);
          await api.narrate('You write it and set the note back on the stump. It picks the paper up, holds it to its chest, and bows.');
        } else {
          api.hearts('mothman', 15);
          await api.narrate('You fold it carefully into your pocket. It watches you do it, then bows, low, wings folded.');
        }
        await api.narrate('When you straighten up, it is gone. Far down the creek road, a single red light moves away through the fog, steady and unhurried.');
      },
    },
    {
      id: 'mothman-6', hearts: 6, title: 'Sorry We Missed You',
      script: async (api) => {
        await api.narrate('Night. You leave honey on the stump and step back into the shadow of the water tower to wait.');
        await api.narrate('An hour passes. Two. You must have dozed, because when you look again the honey is gone and something is perched on the stump.');
        await api.narrate('It is folding something. Its gloved fingers move fast and sure, crease, turn, crease, like hands that have folded a thousand of something.');
        await api.narrate('It sets it down and nudges it toward you: a paper moth, wings out, perfect.');
        await api.narrate('The paper is orange and official-looking. Along one wing, upside down, part of a printed word: *...SORRY WE MISS...*');
        const c = await api.choose(null, [
          { label: 'Try to fold one back for it', value: 'fold' },
          { label: 'Hold the paper moth up to the light', value: 'light' },
        ]);
        if (c === 'fold') {
          api.hearts('mothman', 30);
          await api.narrate('You try. It comes out looking like a tired bat. The Mothman takes it gravely, as if it were gold, and tucks it under one wing.');
        } else {
          api.hearts('mothman', 15);
          await api.narrate('You hold it up to the safety light. The Mothman watches you. Then, very slowly, it lifts its own hands toward the light too.');
        }
        await api.narrate('When you look down, you are alone. The paper moth is in your hand, wings spread wide, which is how moths look when they are happy.');
      },
    },
    {
      id: 'mothman-8', hearts: 8, title: 'Porch Light', when: { weekday: [5] },
      script: async (api) => {
        await api.narrate('After the Saturday show, you walk out to the water tower, still shaking. Your body hurts in the honest way. Your pride hurts worse.');
        await api.narrate('You keep replaying it. The match went sideways. The villain had you cornered. The referee was down. The crowd was groaning.');
        await api.narrate('And then the porch light over the ring clicked on by itself.');
        await api.narrate('Two thousand people screamed. The Mothman unfolded from under the apron, swept the villain off you, and was gone before the lights came up.');
        await api.narrate('But in the dark, in the middle of all of it, something found your hand on the canvas. Squeezed it once. And let go.');
        await api.narrate("Now it's here. Crouched on the stump, wings folded, red eyes dimmed low, as if it's been waiting to see if you were all right.");
        const c = await api.choose(null, [
          { label: 'Hold out your hand', value: 'hand' },
          { label: 'Say thank you', value: 'thanks' },
        ]);
        if (c === 'hand') {
          api.hearts('mothman', 30);
          await api.narrate('It looks at your hand a long time. Then it reaches out, takes it, and squeezes once. The same. Exactly the same. And lets go.');
        } else {
          api.hearts('mothman', 15);
          await api.narrate("It tilts its head. Then it taps the stump three times, gently. One. Two. Three. You're not sure why that feels like an answer.");
        }
        await api.narrate('It unfolds, bows to you, and slips back into the dark. The safety light hums. You realize you have stopped shaking.');
      },
    },
    {
      id: 'mothman-10', hearts: 10, title: 'Under the Ring',
      script: async (api) => {
        await api.narrate('No Mothman at the stump tonight. Just a note under a river stone, block capitals, on a seed catalog page: UNDER THE RING. SATURDAY. COME ALONE.');
        await api.narrate('At dawn, Jobber the raccoon is sitting at your door. He looks at you, turns, and waddles off down the creek road. You follow.');
        await api.narrate("Through the Sportatorium's loading door, under the stands, to a hatch beside the ring you've never noticed. Jobber sits on your foot and won't budge.");
        await api.fade();
        await api.narrate('Saturday. The main event. You are curled in the dark of the far crawlspace beneath the ring. Overhead, bodies hit the canvas like drums.');
        await api.narrate('The crowd roars. A body rolls in under the apron, inches from you. Referee stripes. A red headlamp clicks on.');
        await api.narrate('It\'s Mo. Her antennae are half on. She sees you. She holds very, very still.');
        await api.narrate('Then she puts one finger to her lips, reaches past you, and flips an old switch on the wall. Overhead, the porch light clicks on.');
        await api.narrate('You watch it all from underneath: the wings unfolding, two thousand people losing their minds. Forty seconds later she is back, peeling off the wings.');
        await api.say('mo', "Locker room. After. Don't tell anybody I was good.");
        await api.fade();
        await api.narrate('The empty locker room, after everyone has gone home. Mo sits on the bench in a hoodie, wing dust still glittering on her collar.');
        await api.say('mo', 'Four years ago Gus saw my poncho and headlamp in the fog and told the whole county. That month we drew two hundred and twelve people. On a Saturday.');
        await api.say('mo', "Then I found the old crawlspace, and the porch light from '79, still wired. I sewed wings on the poncho. Next month we drew four hundred and fifty.");
        await api.sayMood('mo', 'sad', 'Refs are furniture. You know what it\'s like to be furniture for nine years, and then for forty seconds be the only thing anybody can see?');
        await api.sayMood('mo', 'love', "I left you the note because you kept leaving me honey. Nobody's ever left the ref honey.");
        await api.say('mo', 'So I need you to keep it. From everybody. Even in here. Even from Birdie. Especially from Fenwick. Can you do that?');
        const c = await api.choose(null, [
          { label: 'I promise.', value: 'promise' },
          { label: 'Cross my heart, ref.', value: 'cross' },
        ]);
        api.hearts('mothman', 30);
        api.hearts('mo', 30);
        api.flag('mothman_revealed');
        if (c === 'promise') {
          await api.sayMood('mo', 'happy', 'Okay. Okay. One, two, three. Sealed.');
        } else {
          await api.sayMood('mo', 'happy', "Cross your heart. I'll hold you to it. I'm a referee. I hold everybody to everything.");
        }
      },
    },
  ],
} satisfies DialogueSet;
