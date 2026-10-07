import { G } from '../core/state';
import { absDay } from '../core/time';

/** Summer 22, the day Grandma moves into Room 7 (kept in step with chapters/beats.ts). */
const ARRIVAL = 49;
const ms = (id: string) => (G.flags[`ms_${id}`] === undefined ? Infinity : Number(G.flags[`ms_${id}`]));
import type { Letter } from '../systems/mail';

/** Grandma's letters through the first year. */
export const LETTERS: { when: () => boolean; letter: Letter }[] = [
  {
    when: () => false, // sent by markDebut()
    letter: {
      id: 'grandma-2',
      from: 'Grandma',
      body: [
        'Sweetheart,',
        'Mo the mail lady (is it still Mo? There was always a Mo) will bring you this. I hear you wrestled! Somebody named Agnes wrote me. She says you sold "like a dying swan." That is the highest compliment in that town.',
        "Did you find her? Don't tell me what she said. I know what she said. She said you have my chin.",
        "Eat something green. Not just pie.",
      ],
      gift: 'grandmas-chili',
    },
  },
  {
    when: () => absDay() >= 9 && !!G.flags['debuted'],
    letter: {
      id: 'grandma-3',
      from: 'Grandma',
      body: [
        'Sweetheart,',
        "I made you a list and then I lost the list, so here is what I remember of the list:",
        "1. Lou fishes at the creek every morning. Bring him bait and he'll tell you anything. Bring him coffee and he'll tell you the truth.",
        '2. Agnes sits in seat A1. Never, ever sit in seat A1.',
        "3. The ring in the backyard was built by Hank's mother. It is older than your father and in better shape.",
        "4. There was a fourth thing. It will come back to me.",
      ],
    },
  },
  {
    when: () => absDay() >= 16 && !!G.flags['debuted'],
    letter: {
      id: 'grandma-4',
      from: 'Grandma',
      body: [
        'Sweetheart,',
        'Is the mural still in the alley? Somebody painted us on that wall in 1982 and Birdie said we looked like "two sequined fire hydrants." She loved it. She pretended not to.',
        "The fourth thing: don't open the locker. Not yet. You'll know when.",
        "Some mornings the words don't come when I call them. They come later, like cats. Don't worry. I'm writing everything important down. I'm writing it to you.",
      ],
    },
  },
  {
    when: () => absDay() >= 23 && !!G.flags['debuted'],
    letter: {
      id: 'grandma-5',
      from: 'Grandma',
      body: [
        '~~Birdie,~~ Sweetheart,',
        "Ha. Look at that. I wrote her name first. Fifteen years of writing her name on every booking sheet and my hand still goes there.",
        "If you ever find old tapes at the flea market, the ones with ACW on the label, watch them for me. Tell me what you see. I remember the matches better than I remember breakfast, but it's nice to hear someone else remember them too.",
        "I'm proud of you. I should have said that first.",
      ],
    },
  },
  {
    when: () => G.time.season >= 1 && !!G.flags['debuted'],
    letter: {
      id: 'grandma-6',
      from: 'Grandma',
      body: [
        'Sweetheart,',
        "The doctors and your aunt have decided I need \"a little more help\" and a place with \"a little less stairs.\" They gave me a brochure with a lot of photos of old people laughing at salads.",
        "I asked if there was anywhere in Turnbuckle Alley. There's a place called the Evening Bell. They have a room by the end of the summer.",
        "Don't tell her. Please. Not yet.",
      ],
    },
  },
  {
    when: () => absDay() >= 41 && !!G.flags['debuted'],
    letter: {
      id: 'grandma-7',
      from: 'Grandma',
      body: [
        'Sweetheart,',
        "I'm packing. Your aunt is driving me down on the twenty-second. I asked to take the bus. Nobody listens to me about buses.",
        "I have packed my cardigans, my sneakers, a deck of cards that is not marked (it is marked), and one hatbox, which rides in my lap.",
        "Room 7 has a window. I asked which way it faces before I asked about the bathroom. The nice nurse laughed. I didn't.",
      ],
    },
  },
  {
    when: () => !!G.flags['grandma_in_town'] && absDay() >= ARRIVAL + 6,
    letter: {
      id: 'grandma-8',
      from: 'Grandma, Room 7',
      body: [
        '~~October 1979~~ Sweetheart,',
        'Sami says I could walk this to you myself. I said the mail is more dramatic. He said I am more dramatic. He is learning.',
        "The marquee lights came on last night, every bulb, even the north side, which has been dark since I don't know when. Since forever.",
        "Somebody fixed them. I won't guess who. I sat up till they went off at midnight. Don't tell her. You know who.",
      ],
    },
  },
  {
    when: () => !!G.flags['grandma_in_town'] && absDay() >= 70 && !G.flags['truth_revealed'],
    letter: {
      id: 'grandma-9',
      from: 'Grandma',
      body: [
        'Sweetheart,',
        "I lost the word for the thing you pour coffee in. I wrote 'coffee house.' Sami says that's a café. I say it's a cup with ambitions.",
        "If my letters start getting shorter, it isn't you. It's the words. They wander off like cats. Most of them come home.",
        'And if I start calling you Bird in these, let me. It is the best thing I know how to call anybody.',
      ],
    },
  },
  {
    when: () => !!G.flags['truth_revealed'] && absDay() >= ms('fa_birdie') + 1,
    letter: {
      id: 'grandma-10',
      from: 'Grandma',
      body: [
        'Chère,',
        'Lou came by. He says she shouted. He says she threw the Pencil. He says she sat on the floor.',
        "Good. She was always better shouting. It's the quiet ones you worry about.",
        "I'm frightened. Isn't that something? Forty years and three blocks, and I'm frightened of one door. Come Sunday. Bring a tape. Hold my hand.",
      ],
    },
  },
  {
    when: () => !!G.flags['reunion_set'] && !G.flags['reunion_done'],
    letter: {
      id: 'grandma-11',
      from: 'Grandma (the Duchess)',
      body: [
        'Chère,',
        "Bird says you said it would be an honor to lose to us. I cried into my pudding. Sami pretended it was the cinnamon.",
        "So lose properly. Sell the Curtsy like your ankle is made of glass. Kick out of everything until the Encore. Then stay down.",
        "I may forget the date. I won't forget a hold. The body remembers the match. Meet me in the middle of the ring.",
      ],
    },
  },
  {
    when: () => !!G.flags['credits_seen'],
    letter: {
      id: 'grandma-12',
      from: 'Grandma (Bird held the pen)',
      body: [
        'Chère,',
        'Saturday. Front row. Wave at me and I will wave back with the back of my hand, and the whole town will boo, and it will be wonderful.',
        "Some days I won't know your name. I'll know your music. I'll stand up. That's a promise, and my knees signed it too.",
        "P.S. This is Birdie. She dictated that. She cheated at gin after. Some things don't change, sugar, and thank God.",
      ],
    },
  },
];
