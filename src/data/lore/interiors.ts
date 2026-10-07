import type { LoreTable } from './index';

/**
 * Every room in town. Public rooms keep kayfabe without exception; the locker
 * room, Birdie's office, her house and Lou's Airstream are insider spaces, and
 * even there the props stay quiet about how the show is made.
 */
export const LORE_INTERIORS: LoreTable = {
  // ================================================================ the Sportatorium
  'sportatorium/poster': [
    { t: ['A sun-faded poster: *THE VELVET HAMMERS, 1983*. Two women holding one belt over their heads.', 'The torn corner has been taped back on, carefully, more than once.'], when: { prop: ['variant', 3] } },
    { t: '*WANTED: COWBOY CLINT RANSOM. FOR STEALING THE SHOW. REWARD $5.* Somebody wrote *RETIRED* across it in marker. Somebody else has crossed that out, twice, hard.', when: { prop: ['variant', 4] } },
    { t: 'A poster on a nail. The nail is older than the building. Birdie says the building was built around it.' },
  ],
  'sportatorium/banner': [
    { t: '*ACW TAG CHAMPIONS, 1981*. Gold felt letters. The A in TAG came unglued in 1990 and was glued back upside down, and now that is just how it goes.', when: { prop: ['variant', 0] } },
    { t: '*TERRITORY OF THE YEAR, 1979*. Nobody knows who voted. Birdie says everybody did.', when: { prop: ['variant', 1] } },
    { t: '*SOLD OUT, 1984*. Birdie had it sewn the next morning. The building has sold out plenty of times since. She has never had another one made.', when: { prop: ['variant', 2] } },
    { t: "*WOMEN'S CHAMPIONSHIP, 1983*. There is no name stitched under it. There is room for one.", when: { prop: ['variant', 3] } },
    { t: '*MID-SOUTH, 1977*. One corner is singed. Everybody over sixty tells the story of the singe differently, and all of them were there.', when: { prop: ['variant', 4] } },
    { t: "*50 YEARS OF FIGHTS*. The 50 is a felt patch sewn over a 40. Hold it up to the light and there's a 30 under that.", when: { prop: ['variant', 5] } },
  ],
  'sportatorium/concession': [
    { t: 'Small paw prints on the glass, low down, all heading toward the pretzels.' },
  ],
  'sportatorium/merch-table': [
    { t: "T-shirts folded in stacks. The Mountain's sell out first. The kids buy them so they can be scared at home." },
    { t: 'A cash box and a roll of stickers: *I SURVIVED THE MOUNTAIN*. Somebody has added *(MOSTLY)* to the top one in ballpoint.' },
    { t: 'Your shirts are here now, three of them, folded so your face shows. A sticky note on the top one: *SIGN IT? -PIP*', when: { flag: 'debuted' } },
  ],
  'sportatorium/extinguisher': [
    { t: 'A fire extinguisher. The inspection tag is initialed every month in tiny pencil: *H.S. H.S. H.S. H.S.*, going back further than the tag should allow.' },
  ],
  'sportatorium/entrance-stage': [
    { t: ['The entrance stage and the curtain. There is a dent in the curtain rod at about seven feet.', 'Tiny hits it every show. Tiny apologizes to it every show. The rod has never once apologized back.'] },
    { t: 'Behind the curtain, a fog machine wearing a sticky note: *FOR EARL. THE GOOD FOG.*' },
    { t: 'Golden paper butterflies are caught in the curtain folds from last Saturday. Nobody shakes them out. They come down when they are ready.', when: { again: true } },
    { t: 'The house lights are down and the curtain is glowing at the edges. Something on the other side is very nearly ready.', when: { showDay: true, from: 18, to: 22 } },
  ],
  'sportatorium/stool': [
    { t: ['A wooden stool by the curtain. The varnish is gone from the top rung where somebody hooks her boots.', 'Birdie sits here every show. Nobody else does. Nobody has ever been told not to.'], when: { tile: [11, 5] } },
    { t: 'A tall stool by the camera. Clementine stands on it for photos and calls it press row.', when: { tile: [28, 16] } },
    { t: 'A stool. Somebody has carved a small bird into the seat.' },
  ],
  'sportatorium/grandstand': [
    { t: 'Wooden bleachers, every row painted a slightly different red because every row was repainted in a different year.' },
    { t: "During the day the bleachers tick as they warm up. If you close your eyes, it sounds like a crowd that's early." },
    { t: '*PIP-WEIGHT CHAMP* is carved into row F, along with the date of a title defense and the words *VS. A SCARECROW*.' },
    { t: 'Two thousand seats, and every one of them is talking at once.', when: { showDay: true, from: 18.5, to: 22 } },
  ],
  'sportatorium/folding-chair': [
    { t: ["A folding chair at ringside with a strip of masking tape: *RESERVED*.", "Madame Fortunata's card said a chair would be waiting for you. This one is not waiting for you. It is waiting very hard for somebody, though."], when: { prop: ['reserved', true], flag: 'fortune_chair', not: 'fortune_chair_done' }, set: 'fortune_chair_done' },
    { t: 'A ringside chair with a strip of masking tape: *RESERVED. A1.* The tape has been replaced so many times the chair underneath is a different color.', when: { prop: ['reserved', true] } },
    { t: 'Front row. The seat has a dent in it the shape of decades of the same person.' },
    { t: 'A program from last Saturday is folded under this chair, with every match circled and graded A through F in red.' },
    { t: 'Ringside. There is a faint scuff on the floor in front of this chair where people stamp their feet at the count of two.' },
  ],
  'sportatorium/folding-chairs': [
    { t: 'Rows of folding chairs, rubber feet in perfect lines. Birdie counted these this morning. She will count them again tonight.' },
    { t: 'Under one seat, a wad of pink gum shaped, possibly on purpose, like a heart.' },
    { t: 'Somebody has written *GO MOUNTAIN* very small on the back of one chair, and *(SORRY MOUNTAIN)* underneath.' },
  ],
  '#announce-table': [
    { t: ["Gus's announce table. A coffee ring, and a trail of pretzel crumbs heading under the skirt toward the speaker cabinet.", 'The microphone cord has clearly been in a fight. The cord is losing.'] },
    { t: "Old Thunder, Gus's chrome microphone, rests in a velvet bag. The bag has small, determined tooth marks." },
    { t: 'Under the table, in the dark, two eyes. Then a pretzel. Then nothing.', when: { from: 17, to: 27 } },
  ],
  'sportatorium/mic-stand': [
    { t: 'A ring mic on a stand. You tap it. The thump goes all the way around the empty building and comes back to you a little late.' },
  ],
  'sportatorium/camera-rig': [
    { t: 'A shoulder camera on a tripod, aimed at the ring. A strip of tape on the side: *ARCHIVE. NO CLOSE-UPS ON THE HAIR UNLESS IT IS GOOD. -G.P.*' },
    { t: 'The lens cap hangs by a string. The string has been chewed through and tied back together four separate times.' },
  ],

  // ================================================================ Birdie's office (insider)
  'birdie-office/photo': [
    { t: 'A photo of Birdie and Sweet Lou on a creek bank, both holding the same small fish. Neither one is letting go.' },
    { t: "Written on the mat under the photo in the Pencil's handwriting: *Mon. He says it's his. It is not his.*" },
  ],
  'birdie-office/notice': [
    { t: '{painted}', when: { first: true } },
    { t: ['{painted}', 'The second exclamation point is in a different pen. Somebody added it on Thursday.'] },
    { t: ['{painted}', 'Under it, a column of numbers in pencil that do not add up, then add up after an arrow and the word *CHAIRS*.'] },
  ],
  'birdie-office/window-blinds': [
    { t: 'Blinds, one slat bent at eye level. Through it: the parking lot, and the back of the marquee where the bulbs get changed.' },
    { t: 'Birdie bends that slat back into shape every few days. It never stays straight. It knows what it is for.' },
  ],
  'birdie-office/office-chair': [
    { t: 'Birdie\'s chair leans back much farther than a chair should. There is a cinnamon stick wedged in the tilt knob, holding it at exactly her angle.' },
  ],
  'birdie-office/filing-cabinet': [
    { t: 'Drawers labeled by decade in the Pencil\'s capitals. The *1980s* label has been written over so many times the paper has gone see-through.' },
    { t: 'A drawer labeled *FINES*. Index cards, alphabetical. *BRUISERS, THE: REPAINT VFW (AGAIN)*. *PRICE, G.: HAIR FLAT ONE (1) SATURDAY*.' },
    { t: 'The bottom drawer sticks. You do not force it.' },
  ],
  '#trophies': [
    { t: 'Trophies from the territory days, little gold wrestlers frozen mid-hold. In the middle, on a velvet pillow, something Birdie has turned to face the back of the case.' },
    { t: 'A trophy for *MOST IMPROVED, 1971*. Birdie has written *(by a lot)* on a piece of tape and stuck it to the base.' },
  ],
  'birdie-office/safe': [
    { t: 'A safe with the dial painted red. Hank says it holds the gate and about four hundred cinnamon sticks. Hank does not know the combination either.' },
  ],
  'birdie-office/box-stack': [
    { t: 'A box of flyers, every one folded the carny way, so it lands face-up on any windshield in any wind.' },
    { t: "You take one off the top. It's already folded. Birdie folds them while she's on hold with the bank." },
  ],
  'birdie-office/cot': [
    { t: 'A cot with a crocheted blanket folded at the foot and a pillow stitched *HOME SWEET RING*. The pillow has a dent in it. The dent is recent.' },
  ],
  'birdie-office/fishing-gear': [
    { t: 'Two rods in the corner and a tackle box with *B.M.* on one end and *S.L.* on the other. Monday mornings, rain or shine.' },
  ],
  'birdie-office/plant': [
    { t: 'A tomato plant in an old ring bucket on the windowsill, leaning hard at the light. Birdie says there are more on the roof. There are a lot more on the roof.' },
  ],

  // ================================================================ the locker room (insider)
  'lockers/locker': [
    { t: "Two lockers side by side, *BO* and *BUCK*. The wall between them is dented, from both directions, at fist height.", when: { prop: ['names', 'BO,BUCK'] } },
    { t: "A row of lockers with names on masking tape. DEX's has a bumper sticker: *NEVER STOP FLYING*. HAZEL's has a tally of days drawn in marker, a long one, still going." },
    { t: "CLINT's locker has a straw hat on the hook and nothing else. LACEY's tape is newer than the rest, and the locker under it is empty." },
    { t: "TINY's locker door has a little shelf glued inside it at the top. On the shelf, a cake the size of a button, under a thimble." },
  ],
  'lockers/mirror-vanity': [
    { t: 'A long mirror ringed with bulbs, three of them out. A Polaroid of Gideon is taped in the corner with *GOOD SIDE* and an arrow.' },
    { t: 'Somebody has written on the glass in eyeliner: *YOU LOOK GREAT. GO.* Nobody has ever wiped it off.' },
  ],
  'lockers/shower-stall': [
    { t: 'A shower that runs hot for exactly four minutes. There is a sign-up sheet taped to the tile, and the sign-up sheet is a war.' },
  ],
  'lockers/wall-clock': [
    { t: 'The locker room clock is the only clock in the building that is right. Birdie set it herself, so nobody could ever blame it.' },
  ],
  'lockers/notice': [
    { t: ['{painted}', 'There are a lot of towels on the floor. Some of them have been here since a win.'], when: { prop: ['lines', 'HANG YOUR TOWEL|WIN OR LOSE|-B.M.'] } },
    { t: ['{painted}', 'Under it, in different marker: *it was ONE time*.'], when: { prop: ['lines', 'NO SPITTING|ON THE MAT|THIS MEANS|BUCK'] } },
  ],
  'lockers/floor-mat': [
    { t: 'A rubber mat worn through in two places, right where people stand to tape their wrists.' },
  ],
  'lockers/locker-bench': [
    { t: 'A long bench. The end is covered in carved tally marks, hundreds of them, in a dozen different hands.' },
    { t: 'Somebody left a knitting project on the bench: half a scarf in rose-gold yarn, the needles crossed on top like a warning.' },
  ],
  'lockers/taping-table': [
    { t: 'Athletic tape in every color. A pink roll that only Tiny uses. A note under it: *TAKE A LITTLE, SAY SORRY*.' },
  ],
  'lockers/laundry-cart': [
    { t: "Ring gear in a canvas cart, waiting for Marigold. One sequin has escaped and is living on the floor now. It's doing fine." },
  ],
  'lockers/water-cooler': [
    { t: 'The cooler glugs like it agrees with you. A paper cone is taped to the side with a phone number written on it. It is Doc\'s number, in Doc\'s writing.' },
  ],
  'lockers/whiteboard': [
    { t: "Tonight's running order in Birdie's blocky capitals, with a time next to each name. Next to Gideon's, a time forty minutes earlier than everyone else's.", when: { showDay: true } },
    { t: 'Wiped clean except for one corner nobody erases: a little drawing of a bird in a top hat.' },
  ],

  // ================================================================ VFW Post 316
  'vfw/bandstand': [
    { t: "A bandstand with a velvet backdrop gone bald in places. The Folding Chairs played here once, after bingo. Post 316 still talks about the amp." },
    { t: 'A drum riser with a hand-painted kick drum stored under it: *THE FOLDING CHAIRS*. The second S is a lightning bolt.' },
  ],
  'vfw/trophy-case': [
    { t: 'Bowling trophies and a dartboard plaque. In the middle, on its own little stand, a bronzed folding chair. The plate says *1979*. Nobody will say what for.' },
    { t: 'A photo leans against the glass inside: the post bowling team, 1984, in matching shirts. One of them is Gus, and his shirt does not match.' },
  ],
  'vfw/photo-wall': [
    { t: 'Post members in uniform, decade by decade. In every photo from a wrestling night, the same woman sits in the front row with a black handbag, getting older across forty frames and never once letting go of the bag.' },
    { t: 'A 1970s photo of a ring set up in this room, the crowd so close they are basically in it. A man in a fez is booing with total joy.' },
  ],
  'vfw/notice': [
    { t: ['{painted}', 'The flyer says matches first. Ask a regular and they will tell you the matches are the warm-up.'] },
  ],
  '#bingo-board': [
    { t: ["The bingo board, every number a little bulb. B-4 is burnt out. When B-4 gets called, Gus says it like it's a person who let him down."] },
    { t: ["Bingo night. Somebody slides you a card and a dauber without asking. You win on N-33 with a line you didn't know you had.", "Madame Fortunata's card said you'd win a card game you didn't know you were playing. The prize is a floral teacup with a chip in it. It is perfect."], when: { weekday: 2, from: 20, to: 24, flag: 'fortune_bingo', not: 'fortune_bingo_done' }, set: 'fortune_bingo_done', give: ['teacup', 1] },
    { t: 'The board is lit up for bingo, and the room has gone quiet in a way it never goes quiet for the matches.', when: { weekday: 2, from: 20, to: 24 } },
  ],
  'vfw/canteen': [
    { t: 'The canteen window. Hot dogs and a percolator older than the post. Nacho cheese from a pump that sighs every time.' },
    { t: 'On Wednesdays a woman in a gold mask runs a taco table at the end of the canteen. She never says a word. She sells out by the second match.', when: { again: true } },
  ],
  'vfw/ring': [
    { t: 'A ring with canvas patched so many times it looks like a quilt. Fifty folding chairs fit around it if everybody breathes in.' },
    { t: "A ring this small means the front row can hear everything. Mostly they hear the ropes creak and somebody's mom yelling *GET UP*." },
    { t: 'Hank is under the apron with a flashlight and a wrench. You can tell by the humming.', when: { weekday: 2, from: 12, to: 18 } },
  ],
  'vfw/announce-table': [
    { t: 'A card table with a skirt made from a bedsheet. Gus calls the matches here, then the bingo numbers, in exactly the same voice.' },
  ],
  'vfw/mic-stand': [
    { t: 'The VFW mic has a little sticker of a bingo ball on it, and a second sticker of a bingo ball on the first sticker.' },
  ],
  'vfw/bingo-table': [
    { t: 'Long tables with paper covers, dauber dots in every color. A lucky troll doll is still taped to one corner, its hair standing straight up.' },
    { t: 'Somebody has written their name on a piece of masking tape and stuck it to this exact spot on the table. *PIP*. Then, smaller: *(LUCKY SPOT)*.' },
  ],
  'vfw/folding-chair': [
    { t: 'A folding chair stenciled *POST 316* on the back.' },
    { t: 'Under the seat, a strip of tape: *PATTY K. EVIDENCE CHAIR. DO NOT MOVE.* It has been moved. She will know.' },
    { t: 'This chair has one short leg. On match nights it rocks every time the ring shakes, like it is trying to help.' },
    { t: 'A chair with a cushion tied on, embroidered with a rose and the word *RESERVED*. Nobody reserved it. The cushion is just nicer than the chair.' },
  ],
  'vfw/chair-cart': [
    { t: 'A cart of folding chairs, fifty exactly. Birdie counted them in. Birdie will count them out.' },
  ],
  'vfw/ticket-table': [
    { t: 'A cash box and a hand stamp shaped like a turnbuckle. On Wednesdays Birdie works this door herself.' },
    { t: 'The ink pad is dry. Somebody has been stamping hands with a wet thumb and a lot of confidence.' },
  ],
  'vfw/coat-rack': [
    { t: 'Coats, and a single feather boa that has been in lost and found since the Carter administration. People wear it to bingo for luck.' },
  ],

  // ================================================================ the library
  'library/bookshelf': [
    { t: 'Every spine pushed flush, every one facing out, like a choir waiting for a note.', when: { first: true } },
    { t: 'Poetry. One slim book has a checkout card stamped every week for a year, always the same day, always returned the next.' },
    { t: 'Westerns, paperback, very worn. One came back with a feed-store receipt for a bookmark and a straw stuck in the spine.' },
    { t: 'Local history: a whole shelf about the water tower, and one thin book about everything else.' },
    { t: 'Mysteries. A sticky note on the back cover of one: *I KNOW WHO DID IT. -C.B.* Another sticky note under it: *NO YOU DON\'T.*' },
    { t: 'Picture books on the low shelves, their corners soft from small hands. A note taped inside a cover: *please read the wolf part QUIETER it is too good*.' },
  ],
  'library/notice': [
    { t: ['{painted}', 'Somebody has added in crayon: *(HE IS VERY SCARY) (COME ANYWAY)*.'], when: { prop: ['lines', 'STORYTIME|SAT 10AM|THE MOUNTAIN|READS'] } },
    { t: ['{painted}', 'It is the quietest building in America. You drop a pencil and three people look up with real fear.'], when: { prop: ['lines', 'QUIET|PLEASE'] } },
  ],
  'library/window': [
    { t: 'Sun through old glass, a long gold stripe across the reading table. A cat is asleep in it. Not the library\'s cat. Nobody knows whose.' },
    { t: 'Rain on the tall windows, and the radiators knocking. It is a very good day to be in a library.', when: { weather: ['rain', 'storm'] } },
  ],
  '#library-desk': [
    { t: 'The circulation desk. A date stamp set two weeks ahead and a jar of pencils, every one sharpened to exactly the same length.' },
    { t: 'A tiny brass bell with a card: *RING FOR HELP*. Under it, smaller: *(GENTLY)*.' },
    { t: 'A meeting-room sign-up sheet. *THURSDAY: GORGEOUS GIDEON FAN CLUB.* Next to it, in very small and very firm letters: *DENIED*.' },
  ],
  'library/card-catalog': [
    { t: 'Hundreds of little drawers. The librarian carried this whole cabinet up the front steps by himself, the week he got to town. People still bring it up.' },
    { t: 'You open a drawer at random. *WRESTLING: SEE ALSO GRUDGES. SEE ALSO FORGIVENESS (CHECKED OUT).*' },
  ],
  'library/book-cart': [
    { t: '*How to Train Your Basset Hound*, overdue, with a dog-ear that someone has very carefully un-dog-eared.' },
    { t: 'A stack of returns. On top, a pressed maple leaf, left in a book by mistake, or not by mistake.' },
  ],
  'library/globe': [
    { t: 'An old globe with countries that are not countries anymore. Somebody has inked a tiny star where Turnbuckle Alley would be, more or less, give or take a state.' },
  ],
  'library/table': [
    { t: 'A reading table. Scrabble tiles in the box lid, and a score sheet with two columns: *C.B.* and *E.O.* The margins are mostly arguing.' },
    { t: 'On Sundays this table is the knitting circle. Two people. The quietest circle in the county. A ball of rose-gold yarn is still under the chair.' },
  ],
  '#storytime-rug': [
    { t: 'A round rug with the alphabet around the edge. The Q is worn through. Everybody sits on the Q.' },
    { t: 'Twenty children sitting so still you can hear the clock. The wolf has not huffed yet. Everybody knows he is about to.', when: { weekday: 5, from: 10, to: 11 } },
  ],
  '#storytime-chair': [
    { t: 'The storytime chair, the only chair in town rated for the Mountain. Hank reinforced the legs and signed under the seat: *H.S. HOLD STEADY.*' },
  ],
  'library/lamp-floor': [
    { t: 'A green-shaded reading lamp. The pull chain has a bead shaped like a tiny book.' },
  ],
  'library/plant': [
    { t: 'A fern on a stand, enormous and well cared for. Somebody whispers to it. It is doing great.' },
  ],

  // ================================================================ Taqueria Mariposa
  'taqueria/papel-picado': [
    { t: 'Strings of cut-paper flags across the ceiling, with a butterfly cut into every one. They lift a little each time the door opens.' },
  ],
  'taqueria/kitchen-run': [
    { t: 'The flat-top hisses. A stack of tortillas wrapped in a towel, still warm. They were pressed upstairs this morning by someone with opinions about your posture.' },
    { t: 'A comal on the back burner, black and shining. A radio above it plays a telenovela, very loud, from upstairs.' },
  ],
  'taqueria/menu-board': [
    { t: 'The menu is hand-painted. Prices have been fixed with masking tape, and the masking tape has also been fixed. At the bottom: *NO SALSA FROM A JAR. NOT EVEN IN AN EMERGENCY.*' },
    { t: 'Next to the menu, a laminated card of gestures with what they mean. *HAND ON HEART: THANK YOU. POINT AT SKY: GOD IS WATCHING. POINT AT PLATE: EAT. BOW: GO IN PEACE, OR POSSIBLY YOU ARE BLOCKING THE DOOR.*' },
  ],
  'taqueria/mask-wall': [
    { t: 'Lucha masks in shadow boxes, from arena souvenirs to ones fans made out of shoe polish and nerve. The middle frame is empty except for a card: *EN USO*.' },
    { t: "A child's mask in the bottom corner, glitter glue and felt, with a crooked butterfly. The card says *Hecha por Luz, 7 años*." },
  ],
  '#abuela-photo': [
    { t: ['A little altar on the shelf: marigolds in a jar, a candle, a saint, and a photograph of a young woman in a gold mask, mid-leap, 1958.', 'That is Abuela Celia. You can hear her upstairs right now, arguing with a telenovela.'], when: { first: true } },
    { t: 'There is a fresh marigold every morning. Today\'s is a little crooked, like it was put in by someone in a hurry, wearing a mask.' },
    { t: 'A prayer card is tucked into the frame. The saint is hard to identify. The prayer is mostly about knees.' },
  ],
  'taqueria/cash-register': [
    { t: 'A sign on the register in a shaky, elegant hand: *LA MARIPOSA DOES NOT MAKE CHANGE. I DO. -C.*' },
  ],
  'taqueria/salsa-bar': [
    { t: 'Salsas from mild to a red one labeled only *NO*.' },
    { t: 'The *NO* is half empty. Somebody in this town is very brave or very confused.', when: { again: true } },
  ],
  'taqueria/table': [
    { t: 'A laminated card on the table: *PLEASE DO NOT ASK WHAT IS UNDER THE MASK. SHE CAN HEAR YOU.*' },
    { t: 'A sugar bowl shaped like a wrestling boot. The lid is the laces.' },
  ],
  'taqueria/chair-wood': [
    { t: 'Every chair is painted a different color. This one is turquoise, with a butterfly on the back that has been touched up in gold.' },
    { t: 'A yellow chair. A gold sequin is stuck in the seat paint, permanently, like it chose to stay.' },
  ],
  'taqueria/plant': [
    { t: 'A chile plant in a clay pot with three red peppers on it. A sign: *DO NOT TOUCH YOUR EYES AFTER. WE MEAN IT.*' },
  ],

  // ================================================================ Tallbridge Bakery
  'bakery/bread-rack': [
    { t: "Loaves, regular sized. They're the only regular-sized thing in the shop, and they look a little self-conscious about it." },
  ],
  'bakery/menu-board': [
    { t: ['*TINY CAKES, BIG LOVE.* Every cake listed with a price and a size, the sizes measured in coins.', 'At the bottom, in the same careful letters: *VILLAIN SURCHARGE: $1*.'] },
  ],
  'bakery/kitchen-run': [
    { t: 'Two ovens and a piping bag with a tip so fine it is basically a needle. On a wire rack, something the size of a button is cooling with great dignity.' },
    { t: 'The proofing drawer smells like vanilla and a radio is playing very softly, a music box tune, on repeat.' },
  ],
  'bakery/cash-register': [
    { t: 'Beside the register, a jar labeled *VILLAIN SURCHARGE* and a second jar labeled *SORRY*. The *SORRY* jar has more in it.' },
    { t: 'A quarter sits on top of the register, set apart. A sticky note: *MINE. FROM ME. (I WAS A VILLAIN ON TUESDAY.)*' },
  ],
  'bakery/counter': [
    { t: 'A tray of tiny cakes under glass, each with a toothpick flag naming the flavor in very, very small handwriting.' },
  ],
  'bakery/tiered-cake': [
    { t: 'A display cake, five tiers, each one smaller, until the top tier is the size of a thimble with a perfect piped rose on it.' },
  ],
  'bakery/flour-sacks': [
    { t: 'Flour sacks stamped with a mill in Wisconsin. A note is tucked under the string of the top one: *Proud of you. Eat something. -Mom*.' },
  ],
  'bakery/table': [
    { t: 'A café table set with doll-sized plates and one cake the size of a grape. It makes the table look huge.' },
  ],
  'bakery/cafe-chair': [
    { t: 'A café chair with a lavender cushion tied on. At four in the afternoon, it belongs to Agnes. At all other times it is waiting for four in the afternoon.' },
  ],
  'bakery/dollhouse': [
    { t: ['A dollhouse of the Sportatorium. Every folding chair is the size of a stamp. The ring ropes are embroidery floss.', 'Under the little announce table, a little raccoon, holding a crumb.'], when: { first: true } },
    { t: 'In the front row, seat one: a tiny old woman with a tiny black handbag, one arm raised mid-swing.' },
    { t: 'Up in the rafters, so small you almost miss it: a single bead of red glass, glowing where the light hits.' },
    { t: 'Behind the dollhouse, folded in tissue paper, one more tiny figure that has not been put inside yet.', when: { again: true } },
  ],
  'bakery/plant': [
    { t: 'A violet in a teacup on the windowsill. The teacup is the planter and the saucer is the drip tray and it is very pleased with itself.' },
  ],

  // ================================================================ WRSL 1340 AM
  'radio/foam-wall': [
    { t: 'Egg-crate foam on every wall. Somebody has written *GUS* in the foam with a fingertip. Many somebodies, many times.' },
  ],
  'radio/on-air': [
    { t: 'The *ON AIR* sign is lit. Through the glass, Gus is announcing a pancake recipe like a title change.', when: { from: 6, to: 10 } },
    { t: 'The *ON AIR* sign is lit for Porch Hour. A harmonica is crying gently into a microphone and Gus is letting it.', when: { weekday: 4, from: 19, to: 22 } },
    { t: 'Dark. Taped under it: *IF THIS IS ON, WHISPER. IF YOU ARE GUS, TRY.*' },
  ],
  'radio/notice': [
    { t: ['{painted}', 'Below it, a second card: *FRIDAY NIGHTS: PORCH HOUR. HARMONICA BY BUCK. FEELINGS BY EVERYBODY.*'] },
  ],
  'radio/poster': [
    { t: 'A Wednesday night flyer from the VFW, with the WRSL call letters squeezed in at the bottom, very small, because Gus insisted.' },
  ],
  'radio/record-shelf': [
    { t: 'Records, filed not by artist but by which wrestler they were used for. Somebody has a whole shelf.' },
    { t: 'A first pressing with a handwritten sleeve: *PLAY ON PORCH HOUR. CRY. BUCK WILL MAKE FUN. WORTH IT.*' },
  ],
  '#radio-console': [
    { t: 'A mixing board, every fader labeled in masking tape. *HORN (DEX)*. *WIND (HAZEL)*. *THUNDER (EARL, NOT BEFORE 8 AM)*. *GONG (JUNE, NEVER)*.' },
    { t: 'A coffee cup with a lid, set very far from the board, behind a line of tape on the desk labeled *THE COFFEE LINE*.' },
  ],
  'radio/mic-stand': [
    { t: 'A chrome mic stand with a dent near the base. Gus says a referee did that in 1987. The referee says otherwise.' },
  ],
  'radio/reel-to-reel': [
    { t: 'A reel-to-reel tape machine. The reel is labeled *JINGLES 1979-1983*. Gus has been meaning to put it on a cassette since 1999.' },
  ],
  'radio/couch': [
    { t: 'A couch for guests. A guest sleeps on it about once a week, usually Buck, usually after Porch Hour.' },
  ],
  'radio/lamp-floor': [
    { t: 'A floor lamp with a red bulb, for "mood," says a sticky note in Gus\'s writing. For night shows. For crying.' },
  ],

  // ================================================================ Marigold's shop
  'tailor/fabric-bolts': [
    { t: 'Bolts of fabric sorted by color, sequins at one end and wool at the other. One shelf of plum velvet has a ribbon across it: *NOT YET*.' },
  ],
  'tailor/notice': [
    { t: ['{painted}', 'Under it, smaller: *MEASURE A THIRD TIME IF IT IS GIDEON.*'] },
  ],
  'tailor/window': [
    { t: 'The display window has a dress form in a cardigan covered in enamel pins, posed like it is waving at the street.' },
  ],
  '#tailor-counter': [
    { t: 'A glass counter full of buttons, sorted by color and then by what Marigold describes as mood. A tape measure lies across the top like it fainted.' },
  ],
  '#tailor-machine': [
    { t: 'An old sewing machine with a label in shaky cursive: *VELMA*. Velma labeled it herself, before she sold the shop, which Marigold describes as a little rude.' },
  ],
  'tailor/robe-form': [
    { t: 'A dress form in half a robe, rose-gold sequins and a collar like a cathedral, pinned all over. A card: *G. FITTING TUES. DO NOT LET HIM SEE IT FIRST.*' },
  ],
  'tailor/mannequin': [
    { t: 'A mannequin in a tracksuit with a measuring tape around its neck, like it is on a smoke break from being measured.' },
  ],
  'tailor/ironing-board': [
    { t: 'An ironing board with a cover scorched in one perfect iron shape, very old. Marigold keeps it. It is a reminder, apparently.' },
  ],
  'tailor/clothing-rack': [
    { t: 'Garment bags with handwritten tags. *HAZEL: DO NOT TAKE IN THE KNEE.* *DEX: AGAIN??*' },
    { t: 'A tag: *SHERIFF K. UNIFORM, LET OUT POCKETS (MORE POCKETS)*.' },
  ],
  'tailor/standing-mirror': [
    { t: 'A three-way mirror. Marigold says your shoulders are lying to you. In this mirror you can see exactly what she means.' },
  ],

  // ================================================================ Fenwick's
  'pawn/neon': [
    { t: 'The neon buzzes. *PAWN* in yellow, *TAPES* in teal. Together they sound like a refrigerator having a dream.' },
  ],
  'pawn/vhs-shelf': [
    { t: 'VHS tapes with hand-lettered spines: *SAT 7/12/86*, *SAT 7/19/86*. Somebody out there has been very, very consistent.' },
    { t: 'A shelf roped off with velvet rope from an old movie theater. A sign: *THE ARCHIVE. LOOK WITH YOUR EYES.*' },
  ],
  'pawn/crt-stack': [
    { t: 'Televisions stacked like building blocks, all tuned to the same dead channel, so they hiss in harmony.' },
    { t: 'For a second every screen shows the same blurry shape, and then it is just snow again. Fenwick, behind you, very quietly: "Did you see it."', when: { again: true } },
  ],
  'pawn/cash-register': [
    { t: 'A sign taped to the register: *WE BUY STRANGE.* Under it, smaller: *NOT OWLS.*' },
  ],
  'pawn/sighting-map': [
    { t: ['A county map stuck with pins. Red ones for sightings: along the creek road and around the water tower, every one of them before dawn.', 'Yellow ones for "wing dust": the Evening Bell parking lot mid-morning, and right outside this shop around noon. A note in Fenwick\'s hand: *NO PATTERN. TRULY RANDOM.*'] },
    { t: 'Red string runs between nineteen pins and ends at a photo of a very large owl. The owl has a red X through it.' },
    { t: 'A new pin, still shiny. *TUES. 11:52 PM. WATER TOWER. NOTHING. BUT A GOOD NOTHING.*', when: { again: true } },
  ],
  'pawn/tv-repair': [
    { t: 'A television with its back off, the insides glowing orange. A note: *DO NOT TOUCH. IT REMEMBERS.*' },
  ],
  'pawn/birdcage': [
    { t: 'A parakeet named Static, who does the hiss between TV channels better than any TV in the shop.' },
    { t: 'Static says something that sounds a lot like *big owl*, and then looks guilty about it.', when: { again: true } },
  ],

  // ================================================================ Steel Chair Hardware
  'hardware/tool-wall': [
    { t: 'A pegboard of tools, every one traced in marker so you know where it goes back. One outline is empty: a hammer. Under the outline: *BUCK*.' },
  ],
  'hardware/riding-mower': [
    { t: 'A red riding mower with a *SOLD* sign and a second sign in label-maker tape: *DO NOT DENT. -STAN (BY PHONE, FROM ARIZONA)*.' },
  ],
  'hardware/drink-cooler': [
    { t: 'Pop on top, bait on the bottom shelf. Behind the nightcrawlers, a spiral notebook gone soft with cold. You leave it where it is.' },
  ],
  'hardware/paint-display': [
    { t: 'Paint chips, several renamed in label tape: *COMMISSIONER CRIMSON*. *DUST DEVIL DUSK*. *SEAT A1 LAVENDER*. *MIRROR MIRROR ROSE*.' },
  ],
  'hardware/shelf-goods': [
    { t: 'Duct tape in more colors than seem allowed. Nails sorted by size, then sorted again, by Bo, after Buck sorted them.' },
    { t: 'A shelf label: *HINGES*. Under it, a second label in the same tape: *THE REAL HINGES. I MOVED THEM BACK. -BO*.' },
  ],
  'hardware/chair-display': [
    { t: 'Folding chairs on display, with a tag: *RATED 300 LBS. NOT RATED FOR FEELINGS.*' },
  ],
  'hardware/barrel': [
    { t: 'A barrel of loose nails sold by the pound, with a scoop and an old produce scale. Somebody has added one gumball. Bo has not found it yet.' },
  ],

  // ================================================================ Halloran Chiropractic
  'clinic/notice': [
    { t: ['{painted}', 'Smaller, underneath: *AND YOUR NECK. ASK ABOUT NECKS.*'] },
  ],
  'clinic/spine-chart': [
    { t: 'A poster of the human spine, every vertebra labeled. Somebody has written *BO* next to one and *BUCK* next to the one right below it.' },
  ],
  'clinic/injury-board': [
    { t: 'A corkboard of patients and progress: names, colored magnets, little arrows pointing up. Bo and Buck share a magnet. Doc says it saves magnets.' },
  ],
  'clinic/counter': [
    { t: 'A juniper bonsai on the counter, clipped with enormous patience. A card: *PLEASE DO NOT TALK TO THE TREE. IT IS CONCENTRATING.*' },
  ],
  'clinic/skeleton': [
    { t: 'A teaching skeleton with a referee whistle around its neck. Name tag: *STAN*. The Bruiser twins\' father is also named Stan. Nobody has ever brought this up.' },
  ],
  'clinic/waiting-chairs': [
    { t: 'Waiting-room chairs, and a stack of magazines from a dentist\'s office in the city. Every crossword has been done in the same slow, careful pen.' },
  ],
  'clinic/water-cooler': [
    { t: 'A water cooler and a jar of butterscotch in gold wrappers. The sign: *ONE. TWO IF IT HURT.*' },
  ],
  'clinic/plant': [
    { t: 'A snake plant. The tag says it is very hard to kill. It looks like it has been tested.' },
  ],

  // ================================================================ the studio (the old bus depot)
  'studio/departures-board': [
    { t: ['The old bus depot\'s departures board, still on the wall. Every line is blank except one: *2:10 A.M. TO THE CITY*.', 'Hazel says it is calming. Everything on it already left.'], when: { first: true } },
    { t: 'The board clicks sometimes when the heat comes on, like it is about to change. It never changes.' },
    { t: '*2:10 A.M. TO THE CITY*. You know whose bus that was now. The board just keeps saying it.', when: { flag: 'truth_revealed' } },
  ],
  'studio/mirror-barre': [
    { t: 'A long mirror and a barre. The barre has a worn spot near the end, where somebody stands on one leg to think.' },
  ],
  'studio/zen-fountain': [
    { t: 'A tabletop fountain. The water goes around in a loop that goes nowhere. A card in Hazel\'s writing: *That is the point.*' },
  ],
  'studio/speed-bag': [
    { t: 'You hit the speed bag once. It hits back twice. You decide that is a draw.' },
  ],
  'studio/yoga-mat': [
    { t: 'A yoga mat rolled out for sunrise class. One corner has a name stitched on it: *SAMI (VISITOR)*. The stitching is very excited.' },
    { t: 'A mat with a dent where a knee brace rested for a long time. The dent is slowly coming out.' },
    { t: 'Class is on. Twelve people holding tree pose with the intensity of a title match.', when: { from: 6, to: 7.5 } },
  ],
  'studio/plant': [
    { t: 'A succulent in a coffee mug that says *HURRICANE SEASON*. It is the calmest thing in the room.' },
  ],

  // ================================================================ the Evening Bell Residence
  'sunnypines/birdcage': [
    { t: 'A canary named Sergeant who sings only when the television is at its loudest.' },
  ],
  'sunnypines/window': [
    { t: 'A window on the lawn and a bird feeder. The residents have named every squirrel. The fat one is *Commissioner*.' },
    { t: 'Snow on the lawn, and one set of footprints from the door to the feeder and back. Somebody fed the birds before breakfast.', when: { season: 3 } },
  ],
  'sunnypines/rocking-chair': [
    { t: 'A rocking chair with a cushion stitched *RESERVED FOR VELMA*.' },
    { t: 'The other rocking chair. Its cushion says *RESERVED FOR WHOEVER VELMA IS NOT MAD AT*.' },
  ],
  'sunnypines/side-table': [
    { t: 'A checkerboard with a game in progress and a note on top: *DO NOT TOUCH. FARID IS THINKING. (SINCE TUESDAY.)*' },
  ],
  'sunnypines/notice': [
    { t: ['{painted}', 'Somebody has crossed out *CHAIR YOGA* and written *CHAIR WRESTLING*. Somebody else crossed that out and wrote *NOT AGAIN, LAVINIA*.'] },
  ],
  '#pines-tv': [
    { t: 'A big television in a wooden cabinet, tuned to the weather. Three residents are watching it like it might turn on them.' },
    { t: 'The TV is on mute and a transistor radio is turned all the way up beside it. It is the VFW show. Everyone is facing the TV anyway.', when: { weekday: 2, from: 19, to: 22 } },
  ],
  'sunnypines/coffee-table': [
    { t: 'Large-print crosswords, done in four different handwritings. There was a disagreement about 14 Across. It is still going on, in the margins.' },
  ],
  'sunnypines/couch': [
    { t: 'A couch with a quilted throw. Under the throw, a cat who does not live here and is allowed to.' },
  ],
  'sunnypines/lamp-floor': [
    { t: 'A lamp with a pull chain and a sign: *PULL GENTLY. IT IS 90 TOO.*' },
  ],
  'sunnypines/bookshelf': [
    { t: 'Large-print westerns and romances, and a whole shelf of old Tattlers that someone has corrected in red pen, comma by comma.' },
  ],
  'sunnypines/card-table': [
    { t: 'The rummy table. A score pad: *VELMA*, *LAVINIA*, *FARID*. Farid has been losing since 2019 and keeps beautiful records of it.', when: { not: 'grandma_in_town' } },
    { t: 'The rummy score pad has a fourth column now, in plum ink: *THE DUCHESS*. She is winning by a margin that cannot be explained by luck.', when: { flag: 'grandma_in_town' } },
  ],
  'sunnypines/photo-wall': [
    { t: "The residents' photos from when they were young. A woman at a sewing machine with pins in her mouth. A man in a fez in a wrestling crowd, booing a villain with his whole heart." },
    { t: 'A newspaper photo from 1961, framed: a young woman with a press badge, scowling at a typo. *L. BEAULIEU, EDITOR.*' },
  ],
  'sunnypines/nurse-station': [
    { t: 'The nurse station. A clipboard and a jar of hard candies. Also a ukulele, which is not medical equipment but gets used like one.' },
    { t: 'A whiteboard behind the desk. *DANCE NIGHT FRI.* A heart drawn next to it, and then, very small, *please Farid not the tango again*.' },
  ],
  '#pines-piano': [
    { t: ['You pick out a melody with one finger. The upright is out of tune in a friendly way.', 'Somebody in the sunroom claps, twice, very precisely.'], song: 'lore:piano-1' },
    { t: ['Chopsticks. The whole room groans as one person.', 'You play it again. Somebody joins in on the low end without getting up from their chair. It is Farid. He is better than you.'], song: 'lore:chopsticks' },
    { t: ['A waltz comes out of your hands, a little slow. The B-flat sticks.', 'In the corner, a hand starts conducting from an armchair, one beat ahead, like it knows exactly where you are going.'], song: 'theme:grandma:town', when: { flag: 'grandma_in_town' } },
  ],
  'sunnypines/wheelchair': [
    { t: 'A spare wheelchair with a bike horn zip-tied to the armrest. On the back, in paint pen: *THE CHARIOT*.' },
  ],
  'sunnypines/plant': [
    { t: 'A spider plant with babies dangling all the way to the floor. Each one has a name on a popsicle stick.' },
  ],

  // ================================================================ Room 7
  'grandma-room/vanity': [
    { t: 'A vanity with a ring of bulbs that Hank rewired. Every bulb works. A list is taped to the mirror: *GOOD DAYS: BRAID. FOGGY DAYS: CALL GIDEON.*' },
    { t: 'A lipstick in *Villain Red*, worn to a flat slant. The same shade as the one in the old house.' },
  ],
  'grandma-room/coat-hooks': [
    { t: 'Cardigans on hooks, lined up like ring jackets. Lavender, lavender, plum, lavender.' },
  ],
  'grandma-room/dresser': [
    { t: 'Drawers labeled by Sami and then relabeled by Dottie. *CARDIGANS. NOT FOR BORROWING, LAVINIA.*' },
    { t: 'The top drawer: *SOCKS*. Crossed out. *SECRETS*. Crossed out. *SOCKS (AND A FEW SECRETS)*.' },
  ],
  'grandma-room/photo': [
    { t: 'A photo of a carnival midway at night, string lights and sawdust. A teenage girl in a borrowed singlet stands in a rope ring with her arms up, like she has just found out about the rest of her life.' },
  ],
  'grandma-room/window': [
    { t: 'From the window you can read the Sportatorium marquee. Every Saturday she reads it out loud, and then she asks who is on the card. Birdie is always on the card.' },
    { t: 'The marquee is lit end to end now, every bulb. From the bed it looks like a ship coming in.', when: { flag: 'marquee_fixed' } },
  ],
  'grandma-room/quilt-rack': [
    { t: 'A quilt that matches the one at the old house. The same velvet squares, the same striped one. Somebody made two.' },
  ],
  'grandma-room/side-table': [
    { t: 'A deck of cards in a rubber band and a sticky note: *Farid owes me 40 cents and a apology.* The grammar is on purpose.' },
  ],
  'grandma-room/sneakers': [
    { t: 'White sneakers with plum laces, lined up toes out under the chair. Ready to walk somewhere important.' },
  ],
  '#grandma-chair': [
    { t: 'Her chair faces the window, not the television.' },
  ],

  // ================================================================ the high school gym
  'school/scoreboard': [
    { t: '*HOME 0, GUESTS 0.* It says that every morning. By three-thirty it says whatever Coach Patty says it says.' },
  ],
  'school/hoop': [
    { t: 'A basketball hoop with most of the net gone. During wrestling season it is just a decoration. Coach Patty has hung a whistle off the rim.' },
  ],
  'school/banner': [
    { t: '*STATE MAT CHAMPS, 1988*. Under it, a second banner hook, empty, polished, ready.', when: { prop: ['variant', 6] } },
    { t: '*GO TURNBUCKLES*. The mascot in the corner is a turnbuckle with arms. It is flexing. It does not have a face, and somehow it is still smug.', when: { prop: ['variant', 7] } },
  ],
  '#school-trophies': [
    { t: 'Wrestling trophies, a lot of them. An empty space on the top shelf with a strip of tape: *STATE. SOMEDAY. -P.K.*' },
    { t: "A photo inside: Coach Patty's 1999 team, all scowling except one kid in the back, who is smiling so hard he's blurry." },
  ],
  'school/notice': [
    { t: ['{painted}', 'Under it, in red pen, perfect penmanship: *Looking forward to it. -O.P.*'] },
  ],
  'school/bleachers': [
    { t: 'Fold-out bleachers. *LACEY R.* carved into the third row, sanded off, carved back in deeper.' },
    { t: 'A forgotten clipboard on the bottom bench: *EVIDENCE*. The page is a drawing of a hip, from four angles, with arrows.' },
  ],
  'school/floor-mat': [
    { t: 'The wrestling mat, maroon, taped at the seams. It smells like a gym, which is a smell you either love or are about to.' },
    { t: 'Coach Patty and Ms. Pruitt are on the mat, a stopwatch between them. It is over in under a minute. Patty is asking for best of three.', when: { weekday: 3, from: 16, to: 18 } },
  ],
  'school/chair-cart': [
    { t: 'A cart of folding chairs, stenciled *PROPERTY OF TAHS*. Somebody has added *AND BIRDIE (LOAN, 1993)*.' },
  ],

  // ================================================================ Birdie's house (insider)
  'birdie-house/half-belt': [
    { t: 'A frame on the wall holds half a championship belt. The leather ends in a tear. The little brass plate below has no words on it, just a year.' },
    { t: 'She hung it right beside the light switch, so she would have to look at it every time she came home. She uses the other switch.' },
  ],
  'birdie-house/window': [
    { t: 'Through the window: the porch, and two rocking chairs. One has a cushion. The other has a little dust on the seat.' },
  ],
  'birdie-house/photo-wall': [
    { t: 'Photos, mostly of crowds. Birdie is barely in any of them. She is in the corners of a few, by the curtain, watching people watch.' },
  ],
  'birdie-house/mounted-bass': [
    { t: 'A mounted bass with a brass plate: *CAUGHT BY LOU. CLAIMED BY BIRDIE.* Under that, a second plate, newer: *STILL CLAIMED*.' },
  ],
  'birdie-house/tv-vcr': [
    { t: 'A television and a VCR with a stack of tapes beside it. The bottom one is still in its shrink-wrap, and the label says *1983*.' },
  ],
  'birdie-house/armchair': [
    { t: 'An armchair with a dent worn into it, and a crocheted cover on the arm where a coffee cup goes every night.' },
    { t: 'The other armchair. No dent. The cover on the arm is perfectly clean.' },
  ],
  'birdie-house/side-table': [
    { t: 'A jar of cinnamon sticks, and a yellow pencil worn down to the length of a thumb. Retired, by the look of it, with honors.' },
  ],
  'birdie-house/lamp-floor': [
    { t: 'A lamp with a red shade. It makes the whole room the color of a ring jacket.' },
  ],
  'birdie-house/box-stack': [
    { t: 'A box labeled *POSTERS*. The one on top has been folded so the date is on the inside.' },
  ],
  'birdie-house/plant': [
    { t: 'A tomato seedling in a coffee can, waiting to go up on the roof with the others.' },
  ],

  // ================================================================ the Abernathys
  'house-abernathy/cardboard-belt': [
    { t: ['The undisputed Pip-weight Championship of the World, on its own hook. Cardboard, silver marker, bottle caps for jewels.', 'A tally on the back: 214 successful defenses. One loss, crossed out, with *(REMATCH)* written next to it.'], when: { first: true } },
    { t: 'Every wrestler in town has signed around the edge. The middle is empty. Pip is saving it.', when: { under: { pip: 8 } } },
    { t: 'Your name is in the middle now, in silver marker. Pip traced over it twice so it would last.', when: { hearts: { pip: 8 } } },
  ],
  'house-abernathy/notice': [
    { t: ['{painted}', 'Crayon. A drawing underneath: two people in belts. One of them is Pip. The other one has your hair.'] },
  ],
  'house-abernathy/photo': [
    { t: 'Pip and his dads at a spelling bee, holding a trophy taller than Pip. Pip is also holding a sign: *I SPELLED TURNBUCKLE*.' },
  ],
  'house-abernathy/window': [
    { t: 'A window with a crayon sun taped in the corner, so it is always sunny from the inside.' },
  ],
  'house-abernathy/fridge': [
    { t: 'The fridge is covered in spelling tests. 100. 100. 100. 98, with a frowny face Pip drew himself. A schedule: *FRIDAY: PANCAKES. NOT NEGOTIABLE.*' },
  ],
  'house-abernathy/tv-vcr': [
    { t: 'A tape is sticking halfway out of the VCR. The label, in crayon: *SATURDAY. DO NOT RECORD OVER. THIS MEANS DAD.*' },
  ],
  'house-abernathy/couch': [
    { t: 'The couch is missing all its cushions. They are in the fort. The fort is in the hallway and has a sign: *NO DADS (EXCEPT FRIDAYS)*.' },
  ],
  'house-abernathy/toy-ring': [
    { t: 'A ring made from a shoebox and rubber bands. Action figures inside, mid-match. A hermit crab is serving as referee and is being very fair about it.' },
  ],
  'house-abernathy/table': [
    { t: 'A shoebox full of letters addressed to wrestlers. None of them have stamps. One on top is addressed, in careful capitals, to you.' },
  ],
  'house-abernathy/plant': [
    { t: 'A bean sprout in a cup with *PIP\'S BEAN, DO NOT WATER, I ALREADY DID* on a label.' },
  ],

  // ================================================================ Sweet Lou's Airstream (insider)
  'airstream/round-window': [
    { t: 'A porthole window over the creek. A fishing line is tied to the latch and runs straight out into the water.' },
    { t: 'Through the porthole, the creek, and a heron standing very still, like it is waiting for Lou to come out and argue.' },
  ],
  '#lou-photo': [
    { t: 'A photo of a young man in a lavender bowling shirt, singing into a ring microphone with his eyes closed. 1971.' },
    { t: 'Tucked into the corner of the frame, soft as cloth, a ticket stub. *1977. ROW A, SEAT 1.* The seat is not his.' },
  ],
  'airstream/tape-wall': [
    { t: 'Shelves of VHS tapes, every spine dated in the same patient handwriting. Saturdays. All of them, as far back as the shelf goes.' },
    { t: 'A stack of padded envelopes on the shelf, and a roll of stamps. The envelopes are already addressed. Lou has nice handwriting.', when: { again: true } },
  ],
  'airstream/dinette': [
    { t: 'A dinette with a vinyl tablecloth and a jar of lemon drops. Two cups, one for Lou and one for company. The company cup has never been used.' },
  ],
  'airstream/booth-table': [
    { t: 'A chessboard on the table, mid-game. Lou plays both sides. White is winning, and Lou seems happy for them.' },
  ],
  'airstream/record-player': [
    { t: ['You set the needle down. Crackle first, then a voice sliding between notes like it has nowhere to be.', 'The whole Airstream seems to settle an inch.'], song: 'theme:lou:town' },
    { t: ['A 45 with a handwritten label: *SWEET LOU, LIVE, 1974*. The record is warped in one spot, and every time it comes around the voice wobbles, like it remembers something.'], song: 'theme:lou' },
  ],
  'airstream/fishing-gear': [
    { t: 'A tackle box sorted by whether the lure has ever caught anything. One compartment is labeled *THE CATFISH (UNFINISHED)*.' },
  ],

  // ================================================================ the gas station
  'gasstation/drink-cooler': [
    { t: 'Pop in the cooler, and the slushie machine churning two colors. A third flavor, grape, has a handwritten tag: *DEX\'S. HANDS OFF.*' },
  ],
  'gasstation/notice': [
    { t: ['{painted}', 'Under it, in pencil: *ask about Lou price if you are Lou*.'], when: { prop: ['lines', 'BAIT|NIGHTCRAWLERS|$2 A DOZ'] } },
    { t: ['{painted}', 'Somebody has written their picks underneath: *3 3 3*. Initialed with a little drawing of a moth.'], when: { prop: ['lines', 'LOTTO|TONIGHT'] } },
  ],
  'gasstation/cash-register': [
    { t: 'A photo taped to the register: Dex mid-backflip over a gas pump. The landing is out of frame. The landing was not good.' },
  ],
  'gasstation/vending': [
    { t: 'A vending machine with one candy bar hung up halfway out, dangling by a corner. It has been there long enough that people give it directions.' },
  ],
  'gasstation/shelf-goods': [
    { t: 'Jerky next to the motor oil, and birthday cards for every relation except cousins.' },
  ],
  'gasstation/coffee-station': [
    { t: 'Coffee, burnt in a way you could set your watch by. A sign: *FREE IF YOU TELL ME I STUCK THE LANDING*.' },
  ],

  // ================================================================ Gorgeous (the salon)
  'salon/neon': [
    { t: '*GORGEOUS*, in pink neon. The second O flickers. Gideon says it is winking.' },
  ],
  'salon/velvet-chair': [
    { t: 'A red velvet chair at the back, older than everything else in the room. Nobody sits in it. A brass plate on the arm: *MISS OPAL\'S. KEEP IT.*' },
    { t: 'The velvet on the arms is worn pale where two hands held on, a long time ago, before a lot of shows.', when: { again: true } },
  ],
  'salon/salon-station': [
    { t: 'A station with a hand mirror on a chain and a postcard from Florida tucked in the frame, signed *Your Mother in Hair*.' },
    { t: 'Combs soaking in blue water. The scissors are in a velvet roll, each one in its own pocket, like a family.' },
  ],
  'salon/hood-dryer': [
    { t: 'A hood dryer from the sixties, chrome and pink. Gideon calls it the Throne. Customers do not sit in it. They ascend.' },
  ],
  'salon/armchair': [
    { t: 'A waiting chair, and on the side table a folder labeled *LIES*. Inside: newspaper reviews, every one bylined *C. Beaulieu*.' },
  ],
  'salon/counter': [
    { t: "Pomade in tins with Gideon's face on the lid. Somebody drew a mustache on one. That tin is behind the counter, in what looks like protective custody." },
  ],
  'salon/plant': [
    { t: 'An orchid, flawless, in a pot that matches the neon. Probably real. Possibly too perfect to be real. It is real.' },
  ],
};
