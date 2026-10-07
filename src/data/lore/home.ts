import type { LoreTable } from './index';

/** Grandma's place: the yard and the old blue house. */
export const LORE_HOME: LoreTable = {
  // ---------------------------------------------------------------- the yard
  '#clothesline': [
    { t: ["Grandma's clothesline. Two wooden pins are still clipped to it, bleached pale by forty summers, holding nothing with total commitment.", 'You leave them where they are.'], when: { first: true } },
    { t: 'The line sings a little in the wind. One note, very low, like somebody humming with their mouth closed.', when: { weather: 'wind' } },
    { t: "Rain beads along the whole length of the line and drips off in order, left to right, like it's being counted.", when: { weather: ['rain', 'storm'] } },
    { t: 'A cardinal sits on the line and bounces. It seems to be doing it on purpose.' },
    { t: 'Somebody, at some point, tied a strip of plum velvet around the post. It has gone the color of a bruise on a peach.' },
    { t: "Frost on the line, every inch. If you flick it, it rings.", when: { season: 3, from: 6, to: 10 } },
    { t: 'Grandma\'s pins are still on the line. Next to them now, two newer ones. She clipped them there herself, the day she came back, and then went inside without saying why.', when: { flag: 'calendar_turned' } },
  ],
  '#garden-1': [
    { t: 'The lettuce is coming in like a ruffled collar. Somebody has been weeding this bed when you are not looking.' },
    { t: 'A slug on the board, going nowhere at all, very slowly. You let it.' },
    { t: 'The seed marker says *TOM* in red paint, the M squeezed in at the edge like it was an afterthought.' },
    { t: 'Snow on the bed, and the carrot tops poking through it like they are checking the weather.', when: { season: 3 } },
    { t: 'Rain has filled every furrow. The lettuce looks extremely pleased with itself.', when: { weather: ['rain', 'storm'] } },
  ],
  'farm/tree-blossom': [
    { t: 'The blossom tree by the road. In spring the whole drive goes pink and stays that way for about a week.', when: { season: 0 } },
    { t: 'A rope swing hangs from the low branch. The seat is a slice of an old turnbuckle pad, *D.D.* in faded marker.', when: { first: true } },
    { t: 'The swing turns a slow half-circle in the wind and turns back.', when: { weather: 'wind' } },
    { t: 'Bare branches, one stubborn leaf. It holds on through the whole winter out of what looks like spite.', when: { season: 3 } },
  ],
  'farm/sign': [
    { t: 'Somebody has carved a tiny heart into the post below the arrow. It is very old and very small and points toward the house.', when: { again: true } },
  ],

  // ---------------------------------------------------------------- the house
  '#velvet-photo': [
    { t: ['A framed photo over the mantel: two women in sequins, back to back, a championship belt held up between them. They are laughing at something outside the frame.', 'The glass has a clean spot in one corner, the size of a thumb.'], when: { first: true } },
    { t: "The one on the left is your grandmother. She's twenty-something and looks like she has never once been told no." },
    { t: "Written on the back of the frame in pencil: *Amarillo, '79. Bird stepped on my train.*" },
    { t: 'The sun hits the glass around four. For about ten minutes the belt in the picture actually shines.', when: { from: 15.5, to: 17 } },
    { t: 'Somebody has dusted it. Not you. The clean spot in the corner is a little bigger every week.', when: { flag: 'grandma_in_town' } },
    { t: 'There is a second photo tucked into the corner of the frame now: the two of them again, white-haired, in the back booth at the Hot Tag. Same laugh.', when: { flag: 'reunion_done' } },
  ],
  'grandma-house/calendar': [
    { t: ['A wall calendar from a feed store. *OCTOBER 1983*. Nobody ever turned the page.', 'One square has a circle drawn around it in red. Nothing written in it. Just the circle.'], when: { not: 'calendar_turned' } },
    { t: "The October page has a recipe printed under the picture: *Harvest Chili*. Grandma's handwriting in the margin: *more cumin, less husband*.", when: { not: 'calendar_turned' } },
    { t: "Today's date. Grandma turned forty years of pages one at a time to get here, and the calendar has been right ever since.", when: { flag: 'calendar_turned' } },
    { t: 'On this month, in her hand: *Tape night. Sunday. Bring the good pudding.*', when: { flag: 'calendar_turned' } },
  ],
  'grandma-house/fireplace': [
    { t: 'The fireplace. Somebody stacked kindling in it a very long time ago, and it is still waiting, perfectly arranged, for a match.', when: { first: true } },
    { t: "You light it. It takes a while to remember how, and then it remembers all at once. The room gets about twenty years younger.", when: { season: [2, 3] }, sfx: 'equipment' },
    { t: 'Ash, and a curl of paper that didn\'t burn: half a show poster. *...AND THE VELVET HAMM...*' },
    { t: 'The bricks are warm all the way up. A cat would love this. You do not have a cat. The bricks are patient about it.', when: { season: [2, 3], from: 17, to: 27 } },
    { t: 'In summer the fireplace is just a dark mouth in the wall with a cricket living in it. The cricket sings at night.', when: { season: 1 } },
  ],
  'grandma-house/fridge': [
    { t: ['An old mint-green fridge that rattles every nine minutes like it has remembered something.', 'Inside: a box of baking soda dated in a year with an 8 in it, and the cold.'], when: { first: true } },
    { t: "A magnet shaped like a pecan holds up a note in Grandma's hand: *Don't eat the pralines, they are for Birdie.* The pralines are long gone. The note stays." },
    { t: 'Inside, what you bought. It looks like a lot less than it did at the store.', when: { again: true } },
    { t: 'The fridge hums along with the kitchen radio, slightly flat. They have been doing this together for a long time.' },
  ],
  'grandma-house/wall-phone': [
    { t: 'A harvest-gold rotary phone on the wall, with a cord long enough to cook dinner on. A list of numbers is taped beside it. The first one is just *B.*' },
    { t: 'You pick it up. A dial tone, steady as anything. You hang up without calling anyone, which feels like a small rudeness to the phone.' },
    { t: 'The cord is stretched long into the kitchen and kinked in one place. Somebody used to walk all the way to the stove mid-call.' },
  ],
  'grandma-house/table': [
    { t: 'A kitchen table with one short leg. A matchbook from the Hot Tag has been folded under it so long it has become part of the furniture.' },
    { t: 'Ring marks from coffee cups, a hundred of them, overlapping. Two cups, mostly. Always the same two seats.' },
    { t: 'A deck of cards in a rubber band, missing the jack of spades. There is a jack of spades drawn on an index card in its place.' },
  ],
  'grandma-house/chair-wood': [
    { t: 'A kitchen chair with a cushion tied on. The cushion is shaped exactly like somebody who sat here every morning for years.' },
    { t: 'This chair is the wobbly one. Every house has one. This one has had it since Nixon.' },
  ],
  'grandma-house/cobweb': [
    { t: 'A cobweb in the corner. The spider is at home and does not consider this your house yet.', when: { not: 'yard_cleared' } },
    { t: 'The spider has redecorated. It looks better than what you did with the living room.', when: { again: true } },
  ],
  'grandma-house/window': [
    { t: 'The glass is old enough to be wavy. The yard ripples a little when you move your head.' },
    { t: "From here you can see the ring in the backyard. It's the first thing you see from this window. Somebody put the window here on purpose.", when: { first: true } },
    { t: 'Rain on the glass. The yard melts into green and gold, and the ring posts stand up out of it like a dock.', when: { weather: ['rain', 'storm'] } },
    { t: 'Lightning bugs out in the yard, a lot of them, all blinking slightly out of time.', when: { season: 1, from: 20, to: 24 } },
    { t: 'Snow on the sill outside, a perfect little drift with one bird track across it.', when: { season: 3 } },
  ],
  'grandma-house/couch': [
    { t: 'A floral couch with a plastic cover still on one arm, as if somebody started taking it off in 1983 and got interrupted.' },
    { t: 'Down the side cushion: forty cents and a ticket stub from the Sportatorium that says *ROW A*.', when: { first: true } },
    { t: 'The couch sighs when you sit on it. Then, after a second, it sighs again, like it is thinking it over.' },
  ],
  'grandma-house/coffee-table': [
    { t: 'A glass dish of old butterscotch, all welded into one butterscotch.' },
    { t: 'A *TV Guide* from 1983, open to Saturday. Somebody circled a channel-9 listing: *TERRITORY WRESTLING, LIVE*.', when: { not: 'calendar_turned' } },
    { t: 'The TV Guide is gone. In its place, a crossword in large print, half-done in plum ink, with one answer written in very large letters: *BIRDIE*. It is not the right answer.', when: { flag: 'grandma_in_town' } },
  ],
  'grandma-house/lamp-floor': [
    { t: 'A floor lamp with a fringed shade. The pull chain has a tiny bell on the end. Every time you turn it on, it rings.' },
    { t: 'The bulb is the old warm kind. The whole room turns the color of tea.', when: { from: 17, to: 27 } },
  ],
  'grandma-house/dust-sheet': [
    { t: 'A dust sheet over something with a hard edge. You lift a corner: a sewing table. The sheet goes back down with a sigh of dust.', when: { first: true } },
    { t: 'Under this sheet, the shape of a rocking chair. It is rocking, very slightly. It was probably you.' },
    { t: 'You pull this one off. Underneath, a record cabinet. Inside it, nothing but Cajun waltzes and a single honky-tonk record in a sleeve that says *B.M.*' },
    { t: "The sheet's been folded and set on top of whatever it was covering. Somebody else has started on these, slowly.", when: { flag: 'grandma_in_town' } },
  ],
  'grandma-house/vanity': [
    { t: 'A vanity with a three-way mirror. Three of you look back. The one on the left looks the most tired.' },
    { t: 'Bobby pins in a dish, a lot of them, the kind for building a braid that can survive a match. One rhinestone earring, alone.' },
    { t: 'A lipstick worn down to a flat slant, in a shade called *Villain Red*. The tube says so. Somebody wrote it on with a label maker.' },
  ],
  '#grandma-trunk': [
    { t: 'A steamer trunk with a brass latch and a sticker from a carnival in Thibodaux. It is locked. You have a feeling the lock is not the point.', when: { first: true } },
    { t: 'Painted on the lid, small, in cracked gold: *D.D.*' },
    { t: "You rest your hand on the lid. It's cool. Something inside shifts, maybe a shoe. You don't open it.", when: { again: true } },
  ],
  'grandma-house/quilt-rack': [
    { t: 'A quilt with a pattern you have never seen anywhere else: squares of satin and sequin and plum velvet, every one cut from something that went to a show.' },
    { t: 'Up close, one square is from a referee shirt. Black and white stripes. Somebody gave that up.' },
  ],
  'grandma-house/kitchen-run': [
    { t: 'A gas range, white enamel, with a dent in the oven door the exact shape of a hip. A cast-iron skillet sits on the back burner like it lives there. It does.' },
    { t: "The skillet is seasoned black-brown and smells faintly of onions from another decade. You could cook with this. It seems to want you to." },
    { t: 'Taped inside the cupboard door: a recipe card in Grandma\'s hand. *GUMBO. First you make a roux. Then you stand there. Then you keep standing there.*' },
  ],
};
