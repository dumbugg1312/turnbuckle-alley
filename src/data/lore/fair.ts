import type { LoreTable } from './index';

/**
 * The fairgrounds' small things. The attractions themselves (the wheel, the
 * bell, Madame Fortunata, Wanda's pen, the stage) live in systems/festival.ts.
 */
export const LORE_FAIR: LoreTable = {
  'fair/bench': [
    { t: 'A bench facing the stage. Somebody has scratched a scoreboard into the paint: *AGNES 9, TINY 0*. The 0 has been gone over so many times it is a hole.' },
    { t: 'A paper boat of funnel cake sugar on the slats, no funnel cake. Something small and organized got here first.' },
    { t: 'The bench is cool from the shade of the wheel. Every few seconds a gondola shadow slides over your shoes.', when: { from: 10, to: 18 } },
    { t: 'Frost on the bench, and a hand-knitted cushion tied to it with a note: *FOR WHOEVER. -G.* The stitches are perfect.', when: { season: 3 } },
  ],
  'fair/lamp': [
    { t: 'A fairground lamp with a hook for a lantern. On festival days there is a lantern. Today there is a bird.', when: { festival: false } },
    { t: 'Paper lanterns strung from this lamp to the next one, warm and slightly crooked. Clint hung them. You can tell because they are all exactly at hat height.', when: { festival: true } },
    { t: 'Moths around the glass. A lot of them. One of them is very big and you decide not to think about it.', when: { from: 21, to: 27 } },
  ],
  'fair/trashcan': [
    { t: 'A trash can with a lid that latches. A laminated sign: *BEAR-PROOF*. Under it, in marker, smaller: *JOBBER, PLEASE.*' },
  ],
  '#fair-stage': [
    { t: 'The outdoor stage, empty. A broom leans against a speaker. The painted banner still says *FAIRGROUNDS FURY* in letters you could read from the Ferris wheel.' },
    { t: 'You stand on the stage for a second. The boards give a little. Somewhere a dog barks, which is the whole audience.' },
    { t: 'Pinned to the stage post: a sign-up sheet for the next festival. *THE FOLDING CHAIRS (AGAIN). AGNES (PIE). BO (PUMPKIN). BUCK (BIGGER PUMPKIN).*' },
    { t: 'Rain drums on the stage roof. A family of sparrows has the whole venue to themselves.', when: { weather: ['rain', 'storm'] } },
    { t: 'Strings of bulbs over the stage, mostly working. The show is tonight at the Sportatorium, but this is where the town warms up.', when: { festival: true } },
  ],
  '#tent-games': [
    { t: 'The games tent. Ring toss onto milk bottles, and a dartboard with balloons. The prizes are stuffed bears in tiny gold crowns.', when: { festival: false } },
    { t: ["The games tent is open and loud. A kid is throwing rings at milk bottles with the focus of a surgeon.", 'Every prize on the wall is a stuffed bear in a tiny gold crown. Wanda is watching them through the fence and seems to approve.'], when: { festival: true } },
    { t: 'You throw three rings. Two bounce. One lands, and wobbles for a long time, and stays. The man at the booth hands you a bear. It is the size of a thumb and bows when you squeeze it.', when: { festival: true, again: true }, set: 'won_tiny_bear' },
  ],
};
