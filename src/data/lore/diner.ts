import type { LoreTable } from './index';

/** The Hot Tag Diner. The front is public; the back booth has its own action. */
export const LORE_DINER: LoreTable = {
  '#jukebox': [
    { t: ['You drop a quarter in and press B4. *Sugar\'s Shuffle*: a piano that has had a long day and is fine about it.', 'Somebody at the counter starts tapping a spoon on the off-beat and does not seem to know it.'], song: 'theme:birdie:town', sfx: 'coin' },
    { t: ['A2. *Sugar Drop*. Old soul, all crackle and slide.', 'From the kitchen, without looking, June reaches over and turns it up one notch.'], song: 'theme:lou:town', sfx: 'coin' },
    { t: ['C7. *Dust and Denim*. A harmonica walks in and sits down.', 'Two men at the counter set their coffee down at the same moment, then pretend they did not.'], song: 'theme:clint:town', sfx: 'coin' },
    { t: ['F1. *Mirror, Mirror*, the slow version. Bossa nova and brushed snare.', 'A woman in a booth checks her reflection in a spoon, sighs, and checks again.'], song: 'theme:gideon:town', sfx: 'coin' },
    { t: ['D5. The button is less worn than all the others. *The Duchess Waltz*.', 'June stops pouring, for one bar, and then she pours.'], song: 'theme:grandma:town', sfx: 'coin', when: { again: true } },
    { t: ['G3. *Never Stop Flying*, the skate-park version.', 'The record skips once in the same place, like it is also trying a trick it has not landed yet.'], song: 'theme:dex:town', sfx: 'coin', when: { again: true } },
  ],
  'diner/photo-wall': [
    { t: ['A wall of photos in mismatched frames. Wrestlers at the counter, mostly, eating like they meant it.', "One is Birdie in 1979 with a cinnamon stick behind her ear and a black eye she's clearly proud of."], when: { first: true } },
    { t: 'A photo of June in sequins and a midnight-blue headwrap, glaring straight down the lens. The caption, typed on a label: *MANAGEMENT*.' },
    { t: 'Gus at the counter, mid-sentence, a tuna melt held up like a title belt. The flash caught his whole mustache.' },
    { t: 'A newspaper clipping from 1996: a young woman with a buzz cut on a podium, one step down from the top, squinting at the photographer like she suspects him of something. Coach Patty, before she was Coach.' },
    { t: 'A Polaroid of the Mountain eating a single tiny cake with two fingers. Under it, in June\'s hand: *DO NOT ASK HIM ABOUT IT.*' },
    { t: ["There's a new one. A Polaroid of you, mid-air, blurry from the waist down. Somebody took it from row C.", 'June wrote *{ring}* on the white strip in marker. She spelled it right on the second try. You can see the first try under the second.'], when: { wins: 1 } },
    { t: 'A ticket stub from your debut, pinned up at the edge. June wrote the date on it. She got the date right and the name almost right.', when: { flag: 'debuted' } },
    { t: 'A photo of two white-haired women in the back booth, one with a crown braid, one with a cinnamon stick. They are both talking at once.', when: { flag: 'reunion_done' } },
  ],
  'diner/fan-case': [
    { t: ['Under glass: a jeweled folding fan, black lace and rhinestones. A typed card beside it: *1982. Used on three referees and one promoter. Reformed.*', "The glass has fingerprints on the outside at about a child's height."] },
    { t: 'The fan has one rib mended with gold thread. Very neat stitches. The rhinestone at the tip is newer than the others.' },
    { t: 'A second card has been added under the first, in a different typewriter: *Reformed is a strong word. -J.O.*', when: { again: true } },
  ],
  'diner/menu-board': [
    { t: '*TODAY: HOT TAG SPECIAL. CHILI DOG. PIE (ASK).* The letters are the push-in kind, and the Q has been replaced by an O with a paperclip.' },
    { t: '*FRIDAY: JOLLOF RICE. SELLS OUT BY ONE. DO NOT ARGUE WITH ME ABOUT THIS.*', when: { weekday: 4 } },
    { t: 'Under the prices, small: *VILLAINS PAY THE SAME. THEY JUST DRINK OUT OF THE CHIPPED MUG.*' },
    { t: "At the very bottom, a line somebody keeps trying to remove and June keeps putting back: *TOAST (WE DON'T BURN IT ANYMORE)*." },
  ],
  'diner/wall-clock': [
    { t: 'A neon clock, red ring, chrome face. It runs four minutes fast. Everybody in town knows to subtract.' },
    { t: 'Ten past nothing. The second hand catches on the six every time and has to think about it.' },
    { t: "It's late. The neon is the brightest thing in the room, and June has started stacking chairs around the people still sitting in them.", when: { from: 21, to: 27 } },
  ],
  'diner/neon': [
    { t: '*PIE*, in pink neon. The E flickers. It has always flickered. June says if it ever stops she will know something is wrong with the pie.' },
    { t: 'Pink light all over the counter. The coffee looks like a sunset in every cup.', when: { from: 18, to: 27 } },
  ],
  'diner/pass-window': [
    { t: 'The kitchen pass. An order wheel, three tickets clipped on, one of them just says *GUS* and a drawing of a fish.' },
    { t: 'A bell on the ledge. You do not ring it. Ringing it is for June. Everybody knows that without being told.' },
    { t: 'Through the pass you can see the cook flip four eggs at once and not look at any of them.', when: { from: 6, to: 11 } },
  ],
  'diner/door-wall': [
    { t: 'The swinging kitchen door has a porthole window, a scuff at boot height, and a handwritten sign: *IN* on one side, *ALSO IN* on the other.' },
  ],
  'diner/back-bar': [
    { t: 'Pie under glass domes. Beside the cherry lattice, a county fair ribbon and a card: *AGNES\'S RECIPE.* Tiny has seen the card. Tiny looks at the ceiling when she walks past it.' },
    { t: 'The coffee machine gurgles like it has an opinion. June pats it once on the side, like a horse.' },
    { t: 'A stack of mugs, all the same, and one on its own shelf. Chipped at the lip. Nobody touches it unless June hands it to them.' },
  ],
  'diner/cash-register': [
    { t: 'A brass register that goes *ka-CHUNK*. Taped to the drawer, a dollar bill signed by every wrestler in town and one raccoon paw print.' },
    { t: 'A jar by the register: *TIPS. OR THEORIES.* Fenwick has left a theory folded into a very small triangle.' },
  ],
  'diner/stool': [
    { t: 'A chrome stool with a red seat. This one has a duct-tape X on it. It is Birdie\'s. It has been Birdie\'s since 1987.', when: { tile: [4, 7] } },
    { t: ["The third stool from the left. It wobbles. Not a lot. Just enough to let you know.", "Madame Fortunata's card said to beware it. She was right, in a small way."], when: { tile: [5, 7], flag: 'fortune_stool', not: 'fortune_stool_done' }, set: 'fortune_stool_done' },
    { t: 'You spin the stool once. It makes a long squeak that runs up a whole octave.' },
    { t: 'The vinyl has been patched with a different red. It is the only thing in the diner June did not choose.' },
    { t: 'This stool sits a quarter inch lower than the others. Hank leveled every stool in here in 1994 and refuses to discuss this one.' },
  ],
  'diner/booth-table': [
    { t: 'A booth table with a paper placemat: *HOW MANY FOLDING CHAIRS CAN YOU FIND?* Somebody has circled forty-one in crayon.' },
    { t: 'Salt, pepper, a hot sauce with no label that June makes herself, and a dish of creamers stacked into a tower by someone waiting a long time.' },
    { t: 'A napkin with a sketch on it: two little figures on a ring apron, one tagging the other. Ballpoint. Somebody was good at hands.' },
  ],
  'diner/booth-seat': [
    { t: 'Red vinyl, cracked at the seams and taped over with care. It sighs when you sit down.' },
    { t: 'Down the crack of the seat: one french fry from a previous administration.' },
    { t: 'Teal vinyl. Warm from the window. Somebody spent a whole afternoon here; the seat still remembers the shape of their thinking.' },
  ],
  'diner/coat-rack': [
    { t: 'A coat rack with a rain bonnet on it, folded into a perfect triangle, and a cardigan that has more pins on it than a map.' },
    { t: 'A straw cowboy hat on the top peg. It turns up at the same hour every morning and is gone by twelve-thirty.', when: { from: 11, to: 12.5 } },
    { t: 'Coats on every peg, still wet. The floor under the rack is a puddle with a towel pretending to help.', when: { weather: ['rain', 'storm'] } },
  ],
  'diner/gumball': [
    { t: 'A gumball machine full of mostly white ones. The red ones are the good ones and everyone in town is after them.' },
    { t: 'You turn the crank. Nothing. You turn it again. A white one, and a bottle cap that should not be in there.' },
  ],
  'diner/plant': [
    { t: 'A pothos that has climbed the window frame and is halfway across the ceiling. June says it is going somewhere. She is letting it.' },
  ],
  'diner/payphone': [
    { t: 'On Sundays around six, the regulars leave this end of the counter empty. Nobody explains why. Nobody needs to.', when: { weekday: 6 } },
  ],
};
