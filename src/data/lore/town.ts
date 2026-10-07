import type { LoreTable } from './index';

/**
 * Main Street, the lanes, the square and the creek. Everything here is in
 * public: props never let on how the show is made.
 */
export const LORE_TOWN: LoreTable = {
  // ---------------------------------------------------------------- Main Street furniture
  'town/lamp': [
    { t: 'A cast-iron streetlamp. A little plaque at the base says 1938 and, under that, someone has scratched *1939?*', when: { first: true } },
    { t: ['Moths. A real crowd of them, going around and around the glass like it owes them money.', "Fenwick would want a count. You count nine and lose track at the tenth."], when: { from: 20, to: 27 } },
    { t: 'A flyer taped to the post: *LOST CAT. ANSWERS TO "PILEDRIVER." DOES NOT ANSWER.*' },
    { t: "A gray ribbon tied to the post. It was probably red last Homecoming. It's still trying." },
    { t: 'The paint on the post is worn bare at exactly hip height, where everybody leans to wait for somebody.' },
    { t: 'Rain runs down the lamp in one thin string and drips off the scroll at the top, always the same spot.', when: { weather: ['rain', 'storm'] } },
    { t: "Somebody's knitted a cozy for the post. Rose-gold yarn. Very tight stitches. Nobody in town will say who.", when: { season: 3 } },
    { t: 'The lamp hums. It has a note, a flat B, and once you hear it you hear it all the way down the street.', when: { from: 18, to: 27 } },
  ],
  'town/bench': [
    { t: 'A green bench with a small brass plate: *DONATED BY STEEL CHAIR HARDWARE, 1986. SIT DOWN.*', when: { first: true } },
    { t: 'A crossword folded into quarters on the slats. Four answers filled in, all in pen, one of them wrong with total confidence.' },
    { t: 'Carved into the armrest: *B + B*. Under it, in a different knife: *(brothers, obviously)*.' },
    { t: 'The bench is warm. Somebody just left. There is a butterscotch wrapper folded into a very small, very neat square.' },
    { t: 'Wet. There is a little pond in the dip where everyone sits, and a leaf sailing it.', when: { weather: ['rain', 'storm'] } },
    { t: 'Frost on the slats. You can see the shape of the last person who sat here, mostly the elbows.', when: { season: 3, from: 6, to: 11 } },
    { t: "Somebody left half a sandwich in wax paper with a note: *FOR WHOEVER'S HUNGRY. NOT JOBBER.* A corner is already missing.", when: { from: 11, to: 15 } },
  ],
  'town/flowerbed': [
    { t: 'A plastic stake: *TURNBUCKLE ALLEY GARDEN CLUB*. In smaller marker underneath: *AND AGNES*.', when: { first: true } },
    { t: 'Tulips, red and yellow, in very straight rows. Somebody measured.', when: { season: 0 } },
    { t: "Zinnias gone wild. A bee is working one flower so hard the stem's bent double.", when: { season: 1 } },
    { t: 'Mums in rust and gold. One pot is labeled *HAZEL* in ballpoint. It is the sturdiest one.', when: { season: 2 } },
    { t: 'Burlap over the beds, tied off with twine, like the flowers are wearing coats to wait for spring.', when: { season: 3 } },
    { t: 'Somebody has tucked a tiny wooden sign in the dirt: *PLEASE DO NOT PICK. THESE ARE FOR LOOKING.* The handwriting is careful and huge.' },
    { t: "There's a rose in here that clearly isn't supposed to be. It's doing great." },
  ],
  'town/tree-blossom': [
    { t: 'The blossoms are out. Every breeze takes a few and drops them on whoever is standing underneath, which is you.', when: { season: 0 } },
    { t: 'Full summer green. A kite string is tangled in the top branches, faded to the color of nothing.', when: { season: 1 } },
    { t: 'The leaves have gone copper. A single blossom is open way out of season and looks a little embarrassed about it.', when: { season: 2 } },
    { t: 'Bare branches with a light string wrapped around the trunk. Two bulbs are out. The rest are making up for it.', when: { season: 3 } },
    { t: "Somebody nailed a birdhouse up here, painted like the Sportatorium. The birds don't seem to mind the marquee." },
  ],
  'town/picnic-table': [
    { t: 'Initials carved all over it. *L.R.* with a lightning bolt. *P.A. CHAMP*, twice. *BO*, and next to it *BUCK* with the U fixed into an O and back. And way down in the corner, very small, *E.O.*' },
    { t: 'A checkers game left mid-play. Red is losing slowly and with dignity.' },
    { t: 'A sticky ring where a lemonade sat. An ant is investigating it like a crime scene.', when: { season: 1 } },
    { t: 'Someone has written *RESERVED FOR FRIDAY MOVIE NIGHT* on a paper plate and weighted it with a rock. It is Tuesday.', when: { weekday: [0, 1, 2, 3] } },
  ],
  'town/hydrant': [
    { t: 'A fire hydrant painted gold, with a little championship plate stenciled on the cap. Somebody is very proud of this hydrant.' },
    { t: 'Deputy Doug stops here every single time. Sheriff Bev waits. It is part of the patrol.', when: { again: true } },
  ],
  'town/trashcan': [
    { t: "A tag is still zip-tied to the handle: *OPENED BY MAYOR D. OAKES*. The ribbon she cut is inside. She kept the scissors." },
    { t: 'A new lid. The old lid had tooth marks along the rim, small ones, in a very determined pattern.' },
  ],
  'town/crate': [
    { t: '*STEEL CHAIR HARDWARE* stenciled on the side. Inside, one sock and a bottle cap, arranged around a pretzel like a museum display.', when: { tile: [28, 24] } },
    { t: 'A crate of records priced in grease pencil. Everything is a dollar except one, which is *NOT FOR SALE (ASK)*.' },
    { t: 'Stacked board games. The checkers are all here. The chess set is missing a queen and has a thimble standing in for her.' },
  ],
  'town/barrel': [
    { t: 'A rain barrel. Floating on top, a rubber duck that somebody keeps rescuing and somebody else keeps putting back.' },
    { t: "Full to the brim. The duck's riding it out.", when: { weather: ['rain', 'storm'] } },
  ],
  'town/car': [
    { t: 'A hatchback with a bumper sticker: *MY OTHER CAR IS A FOLDING CHAIR*.', when: { tile: [6, 30] } },
    { t: "A parking ticket under the wiper, on one of Sheriff Bev's homemade forms. *VIOLATION: PARKED LIKE A VILLAIN.*", when: { tile: [58, 30] } },
    { t: 'A station wagon with a dashboard hula girl. A ring card from 1991 is wedged in the visor, soft as cloth.' },
    { t: 'Fogged windows. Somebody has drawn a moth on the inside of the glass with one finger.', when: { from: 6, to: 9 } },
    { t: 'A tiny wrestler figure is glued to the dash, mid-dropkick, forever.' },
  ],
  'town/pickup': [
    { t: 'A pickup with a bed full of folding chairs, bungee-corded down in a stack that would make an engineer cry.' },
    { t: 'The tailgate has a name burned into it with a woodburning pen: *HANK*. Then, smaller: *(DO NOT LEAN)*.' },
    { t: 'A three-legged hound is asleep in the cab with his chin on the steering wheel. He opens one eye and closes it again.', when: { from: 7, to: 17 } },
  ],
  'town/tent': [
    { t: 'Zipped shut. A paper sign: *BACK SATURDAY. -F.* Then a second sign, newer: *OR SUNDAY.*', when: { weekday: [0, 1, 2, 3, 4] } },
    { t: 'Under the canvas, lunchboxes and 45s. Also a velvet painting of a bear in a crown, priced at $400, crossed out to $4.', when: { weekday: [5, 6] } },
    { t: 'A hand-lettered card pinned to the flap: *HAGGLING ENCOURAGED. WHINING NOT.*', when: { weekday: [5, 6] } },
    { t: 'Rain drums on the canvas. Everyone under the tent is pretending they meant to stay this long.', when: { weather: ['rain', 'storm'], weekday: [5, 6] } },
  ],
  'town/radio-tower': [
    { t: "WRSL 1340's antenna. A sign on the fence: *DANGER: HIGH VOLTAGE*. Below, in marker: *AND HIGH SPIRITS. -GUS*." },
    { t: "Between six and ten you can hear Gus faintly through the fence wire. Not a figure of speech. Put your ear near it. He's doing the weather.", when: { from: 6, to: 10 } },
    { t: 'The red light at the top blinks once a second, all night, like it is keeping time for something slow.', when: { from: 20, to: 27 } },
  ],
  'town/watertower': [
    { t: ["The water tower, painted like a turnbuckle pad: red, with a white stripe and big padding bolts that are really just paint.", "Up close the paint is three or four coats thick. Somebody touches it up every few years, by hand, from a very tall ladder."], when: { first: true } },
    { t: 'The red safety light on top blinks. Fenwick swears it blinks in threes. You watch it for a while. It blinks in ones.', when: { from: 19, to: 27 } },
    { t: "At the base, a flat stump with a jar lid on it, and on the lid a single cracker. Nobody here will say who it's for." },
    { t: 'Icicles hang off the painted bolts like the tower grew a beard for the season.', when: { season: 3 } },
    { t: 'Fog has swallowed the top half. The turnbuckle disappears into it, which is somehow worse.', when: { from: 5, to: 8 } },
    { t: "A white sheet is pinned between two trees behind the tower, with a lamp set up in front of it. It's for counting moths. Someone left a clipboard: *MON. 212 SPECIES TO DATE.*", when: { weekday: 0, from: 19, to: 27 } },
    { t: 'Somebody has written *THE MOTHMAN WAS HERE* in chalk on the leg. Underneath, in different chalk: *IT KNOWS WHAT IT DID.*', when: { again: true } },
  ],
  'town/mailbox': [
    { t: '*MALONE* in stick-on letters. The N fell off years ago and somebody drew it back in with a carpenter\'s pencil.' },
    { t: 'The little flag is up, but the box is empty. Birdie puts the flag up so the mail carrier will stop and talk.', when: { from: 9, to: 14 } },
    { t: 'Rusted at the hinge. Inside, a seed catalog addressed to Agnes Pickett. Wrong box. It happens every spring.', when: { season: 0 } },
  ],
  'town/reeds': [
    { t: 'Cattails. A dragonfly is having the busiest morning of anybody in town.', when: { season: [0, 1] } },
    { t: 'The cattails have gone to fluff and are letting go of it a little at a time.', when: { season: [2, 3] } },
    { t: 'Something plops into the water just out of sight. Lou would say it was a bluegill. Fenwick would say something else.' },
    { t: 'A red-winged blackbird holds on to a reed and announces itself to the creek.', when: { season: [0, 1], from: 6, to: 12 } },
  ],
  'town/rock': [
    { t: "A smooth gray rock, warm on top. A perfect skipping stone is wedged under it. Lou says you leave the good ones where they are." },
    { t: 'Somebody painted a tiny butterfly on it in gold. Then the creek tried to take the paint back, and only half-won.' },
  ],
  'town/log': [
    { t: 'Carved deep in the bark: *LOU 1, CATFISH 1*. Space has been left for a third mark.' },
    { t: 'A turtle on the log. It looks at you, decides you are not interesting, and goes back to being a turtle.', when: { season: [0, 1] } },
  ],
  '#gazebo': [
    { t: ['The gazebo. Fresh white paint on the rails, and green paint showing through underneath, worn down to the wood where people hold on.', 'Somebody has hung a little bell from the roof beam. It makes no sound. The clapper is missing.'], when: { first: true } },
    { t: 'A bedsheet is pinned across one side for Friday movie night. In the bottom corner somebody has drawn a very small moth.', when: { season: 1 } },
    { t: 'Snow on the roof and none on the floor. The gazebo is a small dry room in the middle of everything.', when: { season: 3 } },
    { t: 'A sheet-music stand left behind from a concert. The page on it says *PORCH HOUR STANDARDS* and has a coffee ring for a coda.' },
    { t: 'Rain pours off the roof in a curtain on all eight sides. It is very loud in here and very dry.', when: { weather: ['rain', 'storm'] } },
    { t: 'A couple from out of town is taking a picture. The husband is wearing a Mountain T-shirt and keeps glancing over his shoulder.', when: { flag: 'debuted', weekday: 5 } },
  ],
  'town/flagpole': [
    { t: 'The town flag: a water tower on a green field. Somebody sewed it by hand. The tower leans left.' },
    { t: 'The rope pings against the pole. Ping. Ping. It does this all day and nobody here hears it anymore.', when: { weather: 'wind' } },
    { t: 'At the base, a brass plate: *THIS FLAGPOLE WAS OPENED BY MAYOR D. OAKES*. It is a flagpole. It was already open.' },
  ],
};
