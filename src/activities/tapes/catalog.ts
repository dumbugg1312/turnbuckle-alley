import type { MomentDef, Reward, TapeDef } from './types';

/**
 * The tape catalog. Every promotion, wrestler and broadcast here is fictional.
 * Townsfolk appear in their youth: Birdie and Dottie (the Velvet Hammers),
 * Sweet Lou, June as Madame Midnight, Doc refereeing as "Danny", Abuela Celia
 * as La Mariposa, Gus on the microphone, Odessa's debut and Clint's rookie year.
 *
 * Main-story clue flags set by catching moments:
 *   clue_hammers_1 .. clue_hammers_5  (Velvet Hammers tapes, gated in order)
 *   clue_1983_lean, clue_1983_clang, clue_1983_tears  (the 1983 broadcast)
 *   clue_lou_dedication  (Lou's Last Stand)
 *   clue_mothman_refbump (the Mothman's first match; for the Mothman notebook)
 * The 1983 broadcast needs flag 'tape_quest_ready' (set by the main story, or
 * automatically once all five Hammers clues are caught).
 */

// ---------------------------------------------------------------- helpers
type Opt = Partial<Omit<MomentDef, 'id' | 'name' | 'reward'>>;
const m = (id: string, name: string, reward: Reward, o: Opt = {}): MomentDef => ({ id, name, reward, ...o });
const mv = (id: string, name: string, card: string, o?: Opt) => m(id, name, { kind: 'move', card }, o);
const sc = (id: string, name: string, card: string, o?: Opt) => m(id, name, { kind: 'story', card }, o);
const hm = (id: string, name: string, edition: string, o?: Opt) => m(id, name, { kind: 'hammers', edition }, o);
const pr = (id: string, name: string, text: string, o?: Opt) => m(id, name, { kind: 'line', text, line: 'promo' }, { spot: 'promo', ...o });
const ch = (id: string, name: string, text: string, o?: Opt) => m(id, name, { kind: 'line', text, line: 'chant' }, { spot: 'crowd', ...o });
const ds = (id: string, name: string, design: string, o?: Opt) => m(id, name, { kind: 'design', design }, { spot: 'entrance', ...o });
const cl = (id: string, name: string, flag: string, title: string, narration: string[], o?: Opt) => m(id, name, { kind: 'clue', flag, title, narration }, o);

export const TAPES: TapeDef[] = [
  // ======================================================== COMMON
  {
    id: 'acw-sat-041279', label: 'ACW SAT NITE 4/12/79  2nd gen', title: 'ACW Saturday Night 4/12/79 (2nd gen copy)',
    rarity: 'common', year: 1979, promo: 'Alley Championship Wrestling', price: 3, bins: ['flea', 'yard-sale'],
    wrestlers: ['"Thunderfoot" Tommy Akers', '"Cowtown" Cal Brody', 'Referee Danny Halloran'], cast: ['tommy', 'cal'], ref: 'danny',
    venue: 'sportatorium', format: 'broadcast', gen: 2, card: 'ACW SATURDAY NIGHT', spine: { kind: 'bare' }, stickers: ['SP'],
    blurb: 'Somebody copied a copy. The colors have gone soft, like an old T-shirt.',
    moments: [
      mv('clothesline', 'Thunderfoot\'s clothesline', 'clothesline', { call: 'TOMMY TURNS HIM INSIDE OUT!' }),
      pr('cowtown', 'Cal Brody\'s promo', "Where I come from, we don't lose. We just run out of daylight."),
    ],
  },
  {
    id: 'pip-birthday', label: "PIP'S 7th BDAY!!! (+wrestling taped over it)", title: "Pip's Birthday + Wrestling Taped Over It",
    rarity: 'common', year: 2023, promo: 'Home video', price: 1, bins: ['yard-sale', 'flea'],
    wrestlers: ['Pip (age 7)', 'Rocky Rockwell', '"Hot Rod" Hal Hendricks'], cast: ['rocky', 'hotrod'],
    venue: 'sportatorium', format: 'camcorder', gen: 1, spine: { kind: 'white' }, stickers: ['DO NOT ERASE'],
    blurb: 'Pip blows out seven candles, and then, mid-wish, it cuts to a 1986 match somebody recorded over the rest.',
    moments: [
      ch('pip-weight', 'The birthday chant', 'PIP-WEIGHT CHAM-PI-ON!', { spot: 'birthday', who: ['pip', 'kid1'], difficulty: 1, wobble: 'smooth' }),
      mv('hiptoss', 'The taped-over hip toss', 'hiptoss'),
    ],
  },
  {
    id: 'tristate-1', label: 'TRI-STATE SPECTACULAR  tape 1 of 7', title: 'Tri-State Wrestling Spectacular: Tape 1 of 7',
    rarity: 'common', year: 1986, promo: 'Tri-State Wrestling', price: 4, bins: ['flea'],
    wrestlers: ['"Hot Rod" Hal Hendricks', '"The Accountant" Melvin Sobczak'], cast: ['hotrod', 'melvin'],
    venue: 'arena', format: 'retail', gen: 1, card: 'TRI-STATE SPECTACULAR', spine: { kind: 'retail', color: '#2c4166', ink: '#f4b63f' }, stickers: ['1 OF 7'],
    blurb: 'Seven tapes in the set. Collect them all, the box says. Nobody ever has.',
    moments: [
      mv('tenpunch', 'Ten in the corner', 'tenpunch', { call: 'THE CROWD COUNTS ALONG!' }),
      ds('flames', "Hot Rod's flame tights", 'flame-boots'),
    ],
  },
  {
    id: 'tristate-3', label: 'Tri-State Wrestling Spectacular: Tape 3 of 7', title: 'Tri-State Wrestling Spectacular: Tape 3 of 7',
    rarity: 'common', year: 1986, promo: 'Tri-State Wrestling', price: 4, bins: ['flea', 'library'],
    wrestlers: ['"Lady Lightning" Loretta Spark', 'Starla Divine'], cast: ['loretta', 'starla'],
    venue: 'arena', format: 'retail', gen: 1, card: 'TRI-STATE SPECTACULAR', spine: { kind: 'retail', color: '#2c4166', ink: '#f4b63f' }, stickers: ['3 OF 7'],
    blurb: 'The middle of the set, where the good matches hide.',
    moments: [
      mv('germansuplex', 'Lady Lightning\'s German suplex', 'germansuplex'),
      ch('lightning', 'The lightning chant', 'LIGHT-NING! *stomp stomp* LIGHT-NING!'),
    ],
  },
  {
    id: 'tristate-5', label: 'Tri-State tape 4 of 7 (its actually 5)', title: 'Tri-State Wrestling Spectacular: Tape 5 of 7 (labeled 4)',
    rarity: 'common', year: 1986, promo: 'Tri-State Wrestling', price: 3, bins: ['flea', 'yard-sale'],
    wrestlers: ['"Rocket" Ray Ramirez', '"Sarge" Bobby Crane'], cast: ['rocket', 'sarge'],
    venue: 'arena', format: 'retail', gen: 1, card: 'TRI-STATE SPECTACULAR', spine: { kind: 'retail', color: '#2c4166', ink: '#f4b63f' }, stickers: ['4 OF 7?'],
    blurb: 'The sleeve says 4. The tape says 5. Somebody at a sleepover mixed them up in 1987.',
    moments: [
      mv('missiledropkick', 'Rocket Ray off the top', 'missiledropkick'),
      pr('sarge', "Sarge's promo", 'Drop and give me twenty, maggot! Twenty minutes of the best wrestling you ever saw!'),
    ],
  },
  {
    id: 'vfw-bingo-88', label: 'VFW WED 3/9/88 (bingo audio 20 min)', title: 'VFW Wednesday 3/9/88 (Bingo Audio for 20 Minutes)',
    rarity: 'common', year: 1988, promo: 'Alley Championship Wrestling', price: 2, bins: ['flea', 'yard-sale'],
    wrestlers: ['"Brick" Barnaby', '"The Accountant" Melvin Sobczak'], cast: ['brick', 'melvin'],
    venue: 'vfw', format: 'camcorder', gen: 2, spine: { kind: 'bare' }, stickers: ['EP'],
    blurb: 'Whoever was filming forgot to stop for bingo. B-7. B-7. Somebody yells it twice.',
    moments: [
      mv('struggle', 'The Accountant fights the hold', 'struggle', { spot: 'hold', who: ['brick', 'melvin'] }),
      ch('bingo', 'The bingo chant', 'BIN-GO! BIN-GO!'),
    ],
  },
  {
    id: 'armory-54', label: 'CH.4 ARMORY WRESTLING 1954 (kinescope dub)', title: 'Channel 4 Armory Wrestling, 1954 (Kinescope Dub)',
    rarity: 'common', year: 1954, promo: 'Channel 4 Armory Wrestling', price: 3, bins: ['flea', 'library'],
    wrestlers: ['"Gentleman" Jack Pemberton', '"Professor" Ignatius Boom'], cast: ['jack', 'boom'],
    venue: 'armory', format: 'kinescope', gen: 3, card: 'ARMORY WRESTLING', spine: { kind: 'white' }, tint: 'bw',
    blurb: 'Filmed off a TV screen with a movie camera in 1954, then copied to VHS in 1985. It shows.',
    moments: [
      mv('headlock', 'A gentleman\'s headlock', 'headlock', { wobble: 'smooth' }),
      pr('breeding', "Gentleman Jack's address", 'A man of breeding never pulls hair. He merely relocates it.'),
    ],
  },
  {
    id: 'armory-57', label: "ARMORY '57  Jack vs Commodore", title: "Armory Wrestling '57: Gentleman Jack vs. the Crimson Commodore",
    rarity: 'common', year: 1957, promo: 'Channel 4 Armory Wrestling', price: 4, bins: ['flea', 'library'],
    wrestlers: ['"Gentleman" Jack Pemberton', 'The Crimson Commodore'], cast: ['jack', 'commodore'],
    venue: 'armory', format: 'kinescope', gen: 3, card: 'ARMORY WRESTLING', spine: { kind: 'white' }, tint: 'bw',
    blurb: 'The Commodore wore a cape to the ring and a hat to the bank. Both were crimson.',
    moments: [
      mv('armdrag', 'The armdrag heard round the armory', 'armdrag'),
      ds('tux', "Gentleman Jack's tuxedo trunks", 'tux-trunks', { who: ['jack', 'commodore'] }),
    ],
  },
  {
    id: 'bayou-77', label: "BAYOU BRAWL spring '77 (EP sorry)", title: "Bayou Brawl Wrestling, Spring '77 (EP Speed, Sorry)",
    rarity: 'common', year: 1977, promo: 'Bayou Brawl Wrestling', price: 3, bins: ['flea', 'fenwick'], weather: 'rain',
    wrestlers: ['"Swamp" Sullivan Boudreaux', '"Thunderfoot" Tommy Akers'], cast: ['boudreaux', 'tommy'],
    venue: 'arena', format: 'broadcast', gen: 3, card: 'BAYOU BRAWL', spine: { kind: 'bare' }, stickers: ['EP'],
    blurb: 'Recorded at the slowest speed to fit six hours on one tape. Everyone sounds like they have a cold.',
    moments: [
      mv('bigboot', "Swamp's big boot", 'bigboot'),
      pr('swamp', "Swamp Sullivan's promo", 'I been wrestlin\' gators since I was six. Gators don\'t tap, cher. Neither do I.'),
    ],
  },
  {
    id: 'ozark-92', label: 'OZARK THUNDER sat morning 92', title: 'Ozark Thunder Wrestling, Saturday Morning 1992',
    rarity: 'common', year: 1992, promo: 'Ozark Thunder Wrestling', price: 3, bins: ['flea', 'yard-sale'],
    wrestlers: ['"Ozark" Orville Tate', '"Duke" Delacroix'], cast: ['orville', 'duke'],
    venue: 'studio', format: 'broadcast', gen: 1, card: 'OZARK THUNDER', spine: { kind: 'bare' },
    blurb: 'Taped right after the cartoons. There is a cereal commercial between every fall.',
    moments: [
      mv('stinger', 'The corner splash', 'stinger'),
      pr('thunder', "Orville's promo", "Ozark Thunder doesn't roll, brother. It STAMPEDES."),
    ],
  },
  {
    id: 'greatlakes-85', label: "GREAT LAKES ICE FISHING INVITATIONAL '85", title: "Great Lakes Grapple Club '85: The Ice Fishing Invitational",
    rarity: 'common', year: 1985, promo: 'Great Lakes Grapple Club', price: 4, bins: ['flea'], seasons: [3, 0], weather: 'snow',
    wrestlers: ['"Walleye" Wally Kowalchuk', '"Big Timber" Bjorn Paulsen'], cast: ['wally', 'timber'],
    venue: 'gym', format: 'broadcast', gen: 2, card: 'GREAT LAKES GRAPPLE', spine: { kind: 'clamshell', color: '#9cc8f0' },
    blurb: 'Wrestling on a frozen lake. Halfway through, the ring starts to tilt.',
    moments: [
      mv('bostoncrab', "Walleye's Boston crab", 'bostoncrab'),
      ch('ice', 'The ice chant', 'IT\'S GON-NA CRACK! IT\'S GON-NA CRACK!'),
    ],
  },
  {
    id: 'acw-sat-86', label: 'ACW SAT 7/19/86 + weather', title: 'ACW Saturday 7/19/86 + the Weather Report',
    rarity: 'common', year: 1986, promo: 'Alley Championship Wrestling', price: 3, bins: ['flea', 'yard-sale'],
    wrestlers: ['"Rocket" Ray Ramirez', '"Sir" Reginald Kingsley'], cast: ['rocket', 'kingsley'],
    venue: 'sportatorium', format: 'broadcast', gen: 1, card: 'ACW SATURDAY NIGHT', spine: { kind: 'bare' }, stickers: ['SP'],
    blurb: 'Birdie\'s second year with the pencil. The weatherman predicts "a hot one." He means the main event.',
    moments: [
      mv('dropkick', 'Rocket Ray\'s dropkick', 'dropkick'),
      pr('kingsley', "Sir Reginald's address", 'Kneel, peasants. Or sit. Sitting is also acceptable. Your knees, your choice.'),
    ],
  },
  {
    id: 'beach-94', label: "TIDEWATER beach blanket brawl '94", title: "Tidewater Wrestling: Beach Blanket Brawl '94",
    rarity: 'common', year: 1994, promo: 'Tidewater Wrestling', price: 3, bins: ['flea', 'yard-sale'], seasons: [1],
    wrestlers: ['Kai "Tidewater Tornado" Mendoza', '"Leaping" Lena Lindqvist'], cast: ['kai', 'lena'],
    venue: 'fairgrounds', format: 'broadcast', gen: 1, card: 'BEACH BLANKET BRAWL', spine: { kind: 'clamshell', color: '#3fb0c8' },
    blurb: 'A ring on the sand. Lena springboards off a lifeguard chair at one point. Allegedly.',
    moments: [
      mv('springboard', 'Springboard off the lifeguard chair', 'springboard'),
      ds('neon', 'Neon beach gear', 'neon-90s', { who: ['kai', 'lena'] }),
    ],
  },
  {
    id: 'county-fair-89', label: 'county fair wrestling 89 (from bleachers)', title: 'County Fair Wrestling \'89 (Filmed from the Bleachers)',
    rarity: 'common', year: 1989, promo: 'Home video', price: 2, bins: ['yard-sale', 'flea'], seasons: [1, 2],
    wrestlers: ['"Brick" Barnaby', '"Ozark" Orville Tate'], cast: ['brick', 'orville'],
    venue: 'fairgrounds', format: 'camcorder', gen: 1, spine: { kind: 'white' },
    blurb: 'Shaky, sunburned and wonderful. Somebody gets a corn dog in frame every two minutes.',
    moments: [
      sc('parking', 'The fight spills into the parking lot', 'SG-12', { spot: 'parking' }),
      mv('hiptoss2', 'The fairground hip toss', 'hiptoss'),
    ],
  },
  {
    id: 'acw-91-gameshow', label: 'ACW 2/2/91 (game show over semi main!!)', title: 'ACW 2/2/91 (Somebody Taped a Game Show Over the Semi-Main)',
    rarity: 'common', year: 1991, promo: 'Alley Championship Wrestling', price: 2, bins: ['flea', 'yard-sale'],
    wrestlers: ['"Duke" Delacroix', '"Hot Rod" Hal Hendricks'], cast: ['duke', 'hotrod'],
    venue: 'sportatorium', format: 'broadcast', gen: 1, card: 'ACW SATURDAY NIGHT', spine: { kind: 'bare' },
    blurb: 'A match, then twelve minutes of contestants spinning a big wheel, then the end of a different match.',
    moments: [
      mv('rollup', 'The schoolboy out of nowhere', 'rollup'),
      ch('spin', 'The crowd chants at the wrong show', 'BIG MON-EY! NO WHAMS! ...wait, wrong show.'),
    ],
  },
  {
    id: 'darlene-aerobics', label: "Darlene's Aerobics Vol 2  (wrestling at end)", title: "Darlene's Aerobics Vol. 2 (Wrestling Recorded Over the Last 20 Minutes)",
    rarity: 'common', year: 1987, promo: 'Retail + home recording', price: 1, bins: ['yard-sale', 'flea'],
    wrestlers: ['Darlene (aerobics)', '"Leaping" Lena Lindqvist', 'Starla Divine'], cast: ['lena', 'starla'],
    venue: 'studio', format: 'retail', gen: 1, card: "DARLENE'S AEROBICS", spine: { kind: 'retail', color: '#ff5d8f', ink: '#fbf0d9' },
    blurb: 'Forty minutes of grapevines and leg lifts. Then, mercifully, Lena Lindqvist.',
    moments: [
      mv('kipup', 'And kip... up!', 'kipup', { who: ['darlene', 'lena'] }),
      pr('feel-burn', "Darlene's pep talk", 'Feel the burn! Feel the burn! Now feel the BODY SLAM!', { who: ['darlene', 'lena'] }),
    ],
  },
  {
    id: 'prairie-81', label: "PRAIRIE HEARTLAND tag team tuesdays '81", title: "Prairie Heartland Wrestling '81: Tag Team Tuesdays",
    rarity: 'common', year: 1981, promo: 'Prairie Heartland Wrestling', price: 3, bins: ['flea', 'library'],
    wrestlers: ['The Hillbilly Hurricanes (Jed & Zeke Hollis)', '"Cowtown" Cal Brody'], cast: ['jed', 'cal'],
    venue: 'barn', format: 'broadcast', gen: 2, card: 'PRAIRIE HEARTLAND', spine: { kind: 'bare' },
    blurb: 'A whole tape of tag matches in a county barn. The cows are audible.',
    moments: [
      mv('chainwrestle', 'Chain wrestling on the hay', 'chainwrestle'),
      ch('yeehaw', 'The barn chant', 'HUR-RI-CANES! *stomp stomp clap*'),
    ],
  },
  {
    id: 'magnolia-75', label: 'MAGNOLIA STATE 1975 (dubbed from 2-inch)', title: 'Magnolia State Wrestling 1975 (Dubbed from 2-Inch Studio Tape)',
    rarity: 'common', year: 1975, promo: 'Magnolia State Wrestling', price: 4, bins: ['flea', 'fenwick'],
    wrestlers: ['The Amazing Zambrano', '"Moonshine" Mabel Frye'], cast: ['zambrano', 'mabel'],
    venue: 'studio', format: 'broadcast', gen: 2, card: 'MAGNOLIA STATE', spine: { kind: 'white' }, tint: 'warm',
    blurb: 'Studio wrestling: forty folding chairs, a painted backdrop and a lot of sweat.',
    moments: [
      mv('sleeper', 'The Amazing Zambrano\'s sleeper', 'sleeper', { wobble: 'smooth' }),
      pr('mabel', "Moonshine Mabel's promo", "Mama didn't raise a quitter. Mama raised a suplex."),
    ],
  },
  {
    id: 'wrsl-simulcast-84', label: 'WRSL 1340 wrestling hour  radio w/ slides', title: 'WRSL 1340 Wrestling Hour: Radio Simulcast with Slideshow (1984)',
    rarity: 'common', year: 1984, promo: 'WRSL 1340 AM', price: 2, bins: ['flea', 'library'],
    wrestlers: ['Gus Gravel (announcing)', '"Thunderfoot" Tommy Akers', '"Sir" Reginald Kingsley'], cast: ['tommy', 'kingsley'],
    venue: 'studio', format: 'radio', gen: 1, card: 'WRSL 1340 AM', spine: { kind: 'bare' },
    blurb: 'Young Gus Gravel calling a match on the radio while somebody clicks through slides of it. Somehow it works.',
    moments: [
      pr('gus-call', "Young Gus Gravel's call", "HE'S GOT HIM UP! HE'S GOT HIM UP! SOMEBODY CALL HIS MOTHER!", { who: ['gus', 'tommy'] }),
      ch('wrsl', 'The station ID jingle', 'W-R-S-L! Thirteen-forty, turn it up!', { spot: 'promo', who: ['gus', 'kingsley'] }),
    ],
  },
  {
    id: 'acw-wed-97', label: 'ACW WED 97  (flood?? smells ok)', title: 'ACW Wednesday 1997 (Possibly Flood Damaged; Smells Fine)',
    rarity: 'common', year: 1997, promo: 'Alley Championship Wrestling', price: 2, bins: ['flea', 'fenwick', 'dump'], weatherOnly: 'rain',
    wrestlers: ['"Sarge" Bobby Crane', 'Kai "Tidewater Tornado" Mendoza'], cast: ['sarge', 'kai'],
    venue: 'vfw', format: 'camcorder', gen: 3, spine: { kind: 'scraped' }, stickers: ['WET?'],
    blurb: 'Only turns up on rainy days, when folks clean out their basements. The picture swims a little.',
    moments: [
      mv('jab', 'Quick jabs in the VFW', 'jab'),
      ch('vfw', 'The VFW chant', 'FIF-TY CHAIRS! FIF-TY CHAIRS!'),
    ],
  },
  {
    id: 'backyard-99', label: 'BACKYARD FED CHAMPIONSHIP summer 99', title: 'Backyard Federation Championship, Summer \'99',
    rarity: 'common', year: 1999, promo: 'Home video', price: 1, bins: ['yard-sale', 'flea'], seasons: [1],
    wrestlers: ['Two kids, a trampoline and a cardboard belt'], cast: ['kid1', 'kid2'],
    venue: 'backyard', format: 'camcorder', gen: 1, spine: { kind: 'white' },
    blurb: 'A trampoline, a garden hose, and the most sincere wrestling you will ever see.',
    moments: [
      mv('crossbody', 'Crossbody off the trampoline', 'crossbody', { difficulty: 1 }),
      ds('checker', 'Checkered pajama tights', 'checker-flag'),
    ],
  },
  {
    id: 'holiday-87', label: "ACW HOLIDAY SPECTACULAR '87 (santa gets involved)", title: "ACW Holiday Spectacular '87 (Santa Gets Involved)",
    rarity: 'common', year: 1987, promo: 'Alley Championship Wrestling', price: 3, bins: ['flea', 'yard-sale'], seasons: [3],
    wrestlers: ['"Brick" Barnaby', 'Santa (allegedly)'], cast: ['brick', 'santa'],
    venue: 'sportatorium', format: 'broadcast', gen: 1, card: 'HOLIDAY SPECTACULAR', spine: { kind: 'clamshell', color: '#d8434b' },
    blurb: 'Santa runs in during the main event. Birdie fined him a sleigh.',
    moments: [
      mv('woo', 'Santa poses for the crowd', 'woo', { who: ['santa', 'brick'] }),
      ch('santa', 'The holiday chant', 'SAN-TA! SAN-TA! *jingle jingle*'),
    ],
  },
  {
    id: 'dont-tape-over', label: "DON'T TAPE OVER", title: "\"DON'T TAPE OVER\" (Someone Taped Over It)",
    rarity: 'common', year: 1990, promo: 'Mostly a soap opera', price: 2, bins: ['flea', 'yard-sale', 'dump'], mystery: true,
    wrestlers: ['A soap opera', '"Duke" Delacroix', '"The Accountant" Melvin Sobczak'], cast: ['duke', 'melvin'],
    venue: 'sportatorium', format: 'broadcast', gen: 2, spine: { kind: 'bare' }, stickers: ['DO NOT ERASE'],
    blurb: 'Two hours of a soap opera and six minutes of a wrestling match. The soap opera has more betrayals.',
    moments: [
      mv('distract', 'Arguing with the referee', 'distract'),
      sc('crashed', 'Somebody cuts the music', 'HK-04', { spot: 'entrance' }),
    ],
  },
  {
    id: 'hometown-95', label: 'Hometown Heroes Showcase 95 VFW', title: "Hometown Heroes Showcase '95 (VFW)",
    rarity: 'common', year: 1995, promo: 'Alley Championship Wrestling', price: 3, bins: ['flea'],
    wrestlers: ['"Rocket" Ray Ramirez', '"Big Timber" Bjorn Paulsen'], cast: ['rocket', 'timber'],
    venue: 'vfw', format: 'camcorder', gen: 1, spine: { kind: 'bare' },
    blurb: 'A whole card of local kids getting their first shot. Every one of them sells like it\'s the last night on earth.',
    moments: [
      mv('hopespot', 'The hope spot', 'hopespot'),
      ch('home', 'The hometown chant', 'HOME-TOWN! HOME-TOWN!'),
    ],
  },
  {
    id: 'kowalski-workout', label: "Get Fit w/ Stan Kowalski  public access '79", title: 'Get Fit with Stan "The Hammer" Kowalski (Public Access, 1979)',
    rarity: 'common', year: 1979, promo: 'Public access', price: 2, bins: ['flea', 'library'],
    wrestlers: ['Stan "The Hammer" Kowalski (the Bruiser Twins\' dad)'], cast: ['stan', 'stan'],
    venue: 'studio', format: 'broadcast', gen: 2, card: 'GET FIT!', spine: { kind: 'white' }, tint: 'warm',
    blurb: 'The twins\' dad teaches push-ups to a camera. He keeps saying "and that\'s how you get mended."',
    moments: [
      mv('ironlungs', 'Breathe from the belly', 'ironlungs', { spot: 'taunt', difficulty: 1, wobble: 'smooth' }),
      pr('stan', "Stan's advice", 'Lift with your legs, wrestle with your heart, and call your mother on Sundays.'),
    ],
  },
  {
    id: 'color-bars', label: 'color bars (2 hrs)', title: 'Color Bars, Two Hours (???)',
    rarity: 'common', year: 1988, promo: 'Unknown', price: 1, bins: ['flea', 'dump', 'yard-sale'],
    wrestlers: ['Color bars', 'Something at the very end'], cast: ['loretta', 'rocky'],
    venue: 'studio', format: 'broadcast', gen: 1, spine: { kind: 'bare' },
    blurb: 'Two hours of color bars and a steady BEEEEP. Fenwick swears there\'s something at the end.',
    moments: [
      mv('askcrowd', 'Something under the bars', 'askcrowd', { spot: 'bars' }),
      mv('superkick-bars', 'The thing at the very end', 'superkick', { difficulty: 3, wobble: 'dart' }),
    ],
  },
  {
    id: 'acw-wrestlerama-83', label: 'ACW Wrestle-Rama 6/83 (undercard only)', title: 'ACW Wrestle-Rama 6/83 (Undercard Only)',
    rarity: 'common', year: 1983, promo: 'Alley Championship Wrestling', price: 4, bins: ['flea', 'fenwick'],
    wrestlers: ['"Hot Rod" Hal Hendricks', '"Swamp" Sullivan Boudreaux', 'Referee Danny Halloran'], cast: ['hotrod', 'boudreaux'], ref: 'danny',
    venue: 'sportatorium', format: 'broadcast', gen: 2, card: 'WRESTLE-RAMA', spine: { kind: 'bare' }, stickers: ['SP'],
    blurb: 'The tape runs out right before the Velvet Hammers come out. Of course it does.',
    moments: [
      mv('clothesline83', 'Hot Rod\'s clothesline', 'clothesline'),
      ch('hammers-tease', 'The crowd, waiting for the main event', 'WE WANT HAM-MERS! WE WANT HAM-MERS!'),
    ],
  },

  // ======================================================== UNCOMMON
  {
    id: 'tristate-7', label: 'TRI-STATE tape 7 of 7 — THE GOOD ONE', title: 'Tri-State Wrestling Spectacular: Tape 7 of 7 (The Good One)',
    rarity: 'uncommon', year: 1986, promo: 'Tri-State Wrestling', price: 9, bins: ['flea', 'fenwick'],
    wrestlers: ['"Rocket" Ray Ramirez', '"Hot Rod" Hal Hendricks', '"Lady Lightning" Loretta Spark'], cast: ['rocket', 'hotrod'],
    venue: 'arena', format: 'retail', gen: 1, card: 'TRI-STATE SPECTACULAR', spine: { kind: 'retail', color: '#2c4166', ink: '#f4b63f' }, stickers: ['7 OF 7'],
    blurb: 'The finale. A ladder, a briefcase and a man in flame tights reaching for both.',
    moments: [
      sc('ladder', 'The briefcase hangs from the rafters', 'PO-06', { spot: 'ladder' }),
      mv('frogsplash', 'Off the top of the ladder', 'frogsplash'),
      ch('ladder-chant', 'The ladder chant', 'CLIMB! CLIMB! CLIMB!'),
    ],
  },
  {
    id: 'lumberjack-91', label: "BIG TIMBER lumberjack night '91", title: "Big Timber Wrestling '91: Lumberjack Night",
    rarity: 'uncommon', year: 1991, promo: 'Big Timber Wrestling', price: 8, bins: ['flea', 'fenwick'], seasons: [2, 3],
    wrestlers: ['"Big Timber" Bjorn Paulsen', '"Sarge" Bobby Crane'], cast: ['timber', 'sarge'],
    venue: 'barn', format: 'broadcast', gen: 2, card: 'LUMBERJACK NIGHT', spine: { kind: 'clamshell', color: '#518c5c' },
    blurb: 'Every wrestler in the territory, in flannel, standing around the ring. Some of them brought axes. (Foam.)',
    moments: [
      sc('lumberjacks', 'The whole locker room surrounds the ring', 'PO-07', { spot: 'crowd' }),
      mv('lariat', 'The timber lariat', 'lariat'),
      ds('plaid', 'Lumberjack plaid', 'harvest-plaid'),
    ],
  },
  {
    id: 'thaw-brawl-81', label: "THAW BRAWL '81", title: "Thaw Brawl '81",
    rarity: 'uncommon', year: 1981, promo: 'Alley Championship Wrestling', price: 12, bins: ['flea', 'fenwick'], seasons: [0],
    wrestlers: ['The Velvet Hammers (Dottie Dupree & Birdie Malone)', 'The Hillbilly Hurricanes', 'Referee Danny Halloran'], cast: ['dottie-green', 'jed'], ref: 'danny',
    venue: 'sportatorium', format: 'broadcast', gen: 2, card: "THAW BRAWL '81", spine: { kind: 'bare' }, stickers: ['SP', 'BE KIND REWIND'],
    blurb: 'Dottie wore green that night and everybody said it was bad luck. Grandma would tell you every move before it happens.',
    moments: [
      ds('green', "Dottie's green", 'thaw-green', { who: ['dottie-green', 'birdie'] }),
      mv('figurefour', 'The Duchess applies the figure-four', 'figurefour', { who: ['dottie-green', 'jed'] }),
      ch('hammers', 'The Hammers chant', "LET'S GO HAM-MERS! *clap clap clapclapclap*"),
    ],
  },
  {
    id: 'midnight-mailbag-84', label: "Madame Midnight's Mailbag 1984", title: "Madame Midnight's Mailbag (Local TV, 1984)",
    rarity: 'uncommon', year: 1984, promo: 'Channel 9 local', price: 10, bins: ['flea', 'fenwick'],
    wrestlers: ['Madame Midnight (June Oyelaran)', 'The Copperhead Sisters'], cast: ['june', 'venom'],
    venue: 'studio', format: 'broadcast', gen: 1, card: 'MIDNIGHT MAILBAG', spine: { kind: 'bare' },
    blurb: 'June, in sequins, answering hate mail on live TV with a jeweled fan and a smile that could curdle milk.',
    moments: [
      pr('midnight', 'Madame Midnight answers a letter', "My clients don't lose, darling. They simply experience delayed victory.", { who: ['june', 'venom'] }),
      sc('partner', 'Her mystery client is revealed', 'TW-03', { spot: 'entrance', who: ['vixen', 'june'] }),
      ds('sequins', "Madame Midnight's sequins", 'midnight-sequins', { who: ['june', 'vixen'] }),
    ],
  },
  {
    id: 'copperheads-82', label: 'COPPERHEAD SISTERS promo reel 82', title: 'The Copperhead Sisters: Venom & Vixen (1982 Promo Reel)',
    rarity: 'uncommon', year: 1982, promo: 'Alley Championship Wrestling', price: 9, bins: ['fenwick', 'flea'],
    wrestlers: ['The Copperhead Sisters (Venom & Vixen)', 'Madame Midnight'], cast: ['venom', 'vixen'], ringside: 'june',
    venue: 'sportatorium', format: 'broadcast', gen: 2, card: 'COPPERHEAD SISTERS', spine: { kind: 'bare' },
    blurb: 'The Velvet Hammers\' greatest rivals, hissing at the camera. They were sweethearts backstage. (Don\'t tell anybody.)',
    moments: [
      mv('choke', 'Choked on the ropes (break at four!)', 'choke'),
      ds('scales', 'Copperhead scales', 'copperhead'),
      pr('venom', "Venom's promo", 'Sssstep into our ring, Hammers. We shed our skin every Saturday.'),
    ],
  },
  {
    id: 'lou-sings-74', label: "SWEET LOU SINGS! (and wrestles) '74", title: 'Sweet Lou Sings! (And Wrestles) 1974',
    rarity: 'uncommon', year: 1974, promo: 'Alley Championship Wrestling', price: 11, bins: ['fenwick', 'flea'],
    wrestlers: ['"Sweet Lou" Bastian', 'Count Bartholomew Vane'], cast: ['lou', 'vane'],
    venue: 'sportatorium', format: 'broadcast', gen: 2, card: 'SATURDAY WRESTLING', spine: { kind: 'white' }, tint: 'warm',
    blurb: 'Lou croons one verse to the crowd before every match. Somebody in seat A1 knows all the words.',
    moments: [
      ch('one-more', 'The crowd begs for another verse', 'ONE MORE SONG! ONE MORE SONG!', { spot: 'song', who: ['lou', 'vane'] }),
      mv('strut', 'Lou\'s gentleman strut', 'strut'),
      ds('lavender', 'Lavender silk', 'lou-lavender', { who: ['lou', 'vane'] }),
    ],
  },
  {
    id: 'clint-rookie-93', label: "COWBOY CLINT rookie yr  OZARK THUNDER '93", title: "Cowboy Clint Ransom's Rookie Year (Ozark Thunder '93)",
    rarity: 'uncommon', year: 1993, promo: 'Ozark Thunder Wrestling', price: 8, bins: ['flea', 'yard-sale'],
    wrestlers: ['"Cowboy" Clint Ransom (rookie)', '"Ozark" Orville Tate'], cast: ['clint', 'orville'],
    venue: 'barn', format: 'broadcast', gen: 1, card: 'OZARK THUNDER', spine: { kind: 'bare' },
    blurb: 'Twenty-year-old Clint, all hat and heart. Lacey would pretend she hated this tape and then watch it eleven times.',
    moments: [
      pr('hat', "Rookie Clint's first promo", 'The only thing bigger than my heart is my hat, and my hat is ENORMOUS.'),
      mv('lariat93', 'The rookie lariat', 'lariat'),
      ds('fringe', 'Rookie fringe', 'cowboy-fringe'),
    ],
  },
  {
    id: 'odessa-debut-90', label: 'Odessa Pruitt debut VFW 1990', title: 'Odessa Pruitt Debut, VFW 1990',
    rarity: 'uncommon', year: 1990, promo: 'Alley Championship Wrestling', price: 9, bins: ['flea', 'fenwick', 'library'],
    wrestlers: ['Odessa Pruitt (later "Professor" Pinfall)', '"The Accountant" Melvin Sobczak'], cast: ['odessa', 'melvin'],
    venue: 'vfw', format: 'camcorder', gen: 1, spine: { kind: 'bare' },
    blurb: 'Before she was the Professor. Two out of three falls, and she wins the third with a move she calls "a proof."',
    moments: [
      sc('falls', 'The third fall', 'PO-03', { spot: 'pin' }),
      mv('german90', 'A bridging German suplex', 'germansuplex'),
    ],
  },
  {
    id: 'contract-88', label: 'ACW contract signing gone wrong 88', title: 'ACW Contract Signing Gone Wrong (1988)',
    rarity: 'uncommon', year: 1988, promo: 'Alley Championship Wrestling', price: 8, bins: ['flea', 'fenwick'],
    wrestlers: ['"Duke" Delacroix', '"Brick" Barnaby'], cast: ['duke', 'brick'],
    venue: 'sportatorium', format: 'broadcast', gen: 1, card: 'CONTRACT SIGNING', spine: { kind: 'bare' },
    blurb: 'A table in the ring, a pen, two signatures and, inevitably, the table.',
    moments: [
      sc('table', 'The table always breaks', 'SG-04', { spot: 'table' }),
      mv('bigbump', 'Through the table', 'bigbump', { spot: 'sell' }),
    ],
  },
  {
    id: 'gus-sitdown-86', label: 'SIT DOWN WITH GUS 1986', title: 'Sit Down with Gus Gravel (1986)',
    rarity: 'uncommon', year: 1986, promo: 'WRSL / Channel 9', price: 7, bins: ['flea', 'library'],
    wrestlers: ['Gus Gravel', '"Sir" Reginald Kingsley'], cast: ['gus', 'kingsley'],
    venue: 'studio', format: 'broadcast', gen: 1, card: 'SIT DOWN WITH GUS', spine: { kind: 'bare' },
    blurb: 'Two chairs and the hard questions. Sir Reginald walks out twice and comes back twice.',
    moments: [
      sc('interview', 'Gus asks the hard question', 'SG-06', { spot: 'promo', who: ['gus', 'kingsley'] }),
      pr('reggie', "Sir Reginald's answer", "I'm not saying I'm the greatest. I'm saying the greatest asked for MY autograph.", { who: ['kingsley', 'gus'] }),
    ],
  },
  {
    id: 'farewell-89', label: "Rocky Rockwell FINAL FAREWELL 89 (lol)", title: '"The Final Farewell" of Rocky Rockwell (1989, Back in Two Weeks)',
    rarity: 'uncommon', year: 1989, promo: 'Tri-State Wrestling', price: 7, bins: ['flea', 'yard-sale'],
    wrestlers: ['Rocky Rockwell', '"Sarge" Bobby Crane'], cast: ['rocky', 'sarge'],
    venue: 'arena', format: 'broadcast', gen: 1, card: 'THE FINAL FAREWELL', spine: { kind: 'clamshell', color: '#ff5d8f' },
    blurb: 'He cried. The crowd cried. Two weeks later his music hit and they cried again, but angrier.',
    moments: [
      sc('retire', 'The tearful farewell speech', 'TW-10', { spot: 'promo' }),
      pr('rocky', "Rocky's farewell", "This isn't goodbye. It's see you later. Probably in about two weeks."),
    ],
  },
  {
    id: 'belt-missing-80', label: "WHERE'S THE BELT? ACW 1980", title: "Where's the Belt? (ACW, 1980)",
    rarity: 'uncommon', year: 1980, promo: 'Alley Championship Wrestling', price: 9, bins: ['flea', 'fenwick'],
    wrestlers: ['"Thunderfoot" Tommy Akers', 'Count Bartholomew Vane', 'Referee Danny Halloran'], cast: ['tommy', 'vane'], ref: 'danny',
    venue: 'sportatorium', format: 'broadcast', gen: 2, card: 'ACW SATURDAY NIGHT', spine: { kind: 'bare' },
    blurb: 'The title vanishes from the trophy case. Every wrestler is a suspect. The Count has a very large cape.',
    moments: [
      sc('missing', 'The trophy case is empty', 'TW-14', { spot: 'belt-missing' }),
      mv('rake', 'The Count rakes the eyes', 'rake', { who: ['vane', 'tommy'] }),
    ],
  },
  {
    id: 'cut-the-music-85', label: "PRAIRIE HEARTLAND '85 somebody cut the music", title: "Prairie Heartland '85: Somebody Cut the Music",
    rarity: 'uncommon', year: 1985, promo: 'Prairie Heartland Wrestling', price: 6, bins: ['flea'],
    wrestlers: ['"Hot Rod" Hal Hendricks', '"Swamp" Sullivan Boudreaux'], cast: ['hotrod', 'boudreaux'],
    venue: 'barn', format: 'broadcast', gen: 2, card: 'PRAIRIE HEARTLAND', spine: { kind: 'bare' },
    blurb: 'Hot Rod\'s entrance music stops dead at the key change. He stands there in his sunglasses for a very long time.',
    moments: [
      sc('crashed85', 'The music stops at the key change', 'HK-04', { spot: 'entrance' }),
      mv('superkick85', 'The superkick that ends it', 'superkick'),
    ],
  },
  {
    id: 'mystery-box-84', label: 'MYSTERIOUS BOX SAGA pts 1-3 (1984)', title: 'The Mysterious Box Saga, Parts 1–3 (1984)',
    rarity: 'uncommon', year: 1984, promo: 'Alley Championship Wrestling', price: 8, bins: ['flea', 'fenwick'],
    wrestlers: ['"Big Timber" Bjorn Paulsen', '"Sir" Reginald Kingsley'], cast: ['timber', 'kingsley'],
    venue: 'sportatorium', format: 'broadcast', gen: 2, card: 'ACW SATURDAY NIGHT', spine: { kind: 'bare' },
    blurb: 'A gift-wrapped box in the middle of the ring for three straight weeks. Nobody claims it. Week three: it ticks.',
    moments: [
      sc('box', 'The box in the ring', 'HK-10', { spot: 'box' }),
      mv('distract84', 'Distracting the referee', 'distract'),
      ch('open', 'The crowd wants it opened', 'O-PEN THE BOX! O-PEN THE BOX!'),
    ],
  },
  {
    id: 'people-decide-96', label: "TIDEWATER '96 call-in vote", title: "Let the People Decide (Tidewater '96 Call-In Vote)",
    rarity: 'uncommon', year: 1996, promo: 'Tidewater Wrestling', price: 7, bins: ['flea', 'library'],
    wrestlers: ['Kai "Tidewater Tornado" Mendoza', 'Starla Divine'], cast: ['kai', 'starla'],
    venue: 'arena', format: 'broadcast', gen: 1, card: 'YOU DECIDE!', spine: { kind: 'clamshell', color: '#2fa59a' },
    blurb: 'Viewers called a 1-900 number to pick the winner. The phone lines melted. Kai won by eleven votes.',
    moments: [
      sc('vote', 'The crowd picks the winner', 'WC-01', { spot: 'crowd' }),
      mv('hurricanrana96', "Kai's hurricanrana", 'hurricanrana'),
    ],
  },
  {
    id: 'greatlakes-gauntlet-88', label: "GREAT LAKES GAUNTLET '88", title: "Great Lakes Gauntlet '88",
    rarity: 'uncommon', year: 1988, promo: 'Great Lakes Grapple Club', price: 9, bins: ['flea', 'fenwick'],
    wrestlers: ['"Walleye" Wally Kowalchuk', '"Brick" Barnaby', '"Leaping" Lena Lindqvist'], cast: ['wally', 'brick'],
    venue: 'gym', format: 'broadcast', gen: 1, card: 'GREAT LAKES GAUNTLET', spine: { kind: 'bare' },
    blurb: 'One wrestler against five, one after another. Wally runs out of breath around number four and wins anyway.',
    moments: [
      mv('powerbomb', 'The gauntlet powerbomb', 'powerbomb', { who: ['brick', 'wally'] }),
      mv('spinebuster', "Wally's spinebuster", 'spinebuster'),
    ],
  },
  {
    id: 'arena-norte-71', label: 'ARENA DEL NORTE 1971 (no english)', title: 'Arena del Norte 1971 (No English Commentary)',
    rarity: 'uncommon', year: 1971, promo: 'Arena del Norte', price: 10, bins: ['fenwick', 'flea'],
    wrestlers: ['La Mariposa (Celia Villanueva)', 'Doctor Thunderbolt'], cast: ['celia', 'thunderbolt'],
    venue: 'arena', format: 'broadcast', gen: 3, card: 'ARENA DEL NORTE', spine: { kind: 'white' }, tint: 'warm',
    blurb: 'Abuela Celia, thirteen years into her career and spinning like a top. Rosa would want to see this.',
    moments: [
      mv('hurricanrana71', 'La Mariposa\'s hurricanrana', 'hurricanrana'),
      mv('tope', 'Tope through the ropes', 'tope', { spot: 'dive' }),
    ],
  },
  {
    id: 'fairgrounds-fury-91', label: "FAIRGROUNDS FURY '91 (smells like corn dogs)", title: "Fairgrounds Fury '91 (The Tape Smells Like Corn Dogs)",
    rarity: 'uncommon', year: 1991, promo: 'Alley Championship Wrestling', price: 10, bins: ['flea', 'fenwick'], seasons: [1],
    wrestlers: ['"Rocket" Ray Ramirez', '"Duke" Delacroix'], cast: ['rocket', 'duke'],
    venue: 'fairgrounds', format: 'broadcast', gen: 1, card: "FAIRGROUNDS FURY '91", spine: { kind: 'bare' }, stickers: ['BE KIND REWIND'],
    blurb: 'Summer supershow under the grandstand lights. A frog splash from a hay wagon.',
    moments: [
      mv('frogsplash91', 'Frog splash off the hay wagon', 'frogsplash'),
      ch('fury', 'The fairgrounds chant', 'FU-RY! FU-RY! *corn dog raised high*'),
    ],
  },
  {
    id: 'harvest-havoc-84', label: "HARVEST HAVOC '84", title: "Harvest Havoc '84",
    rarity: 'uncommon', year: 1984, promo: 'Alley Championship Wrestling', price: 10, bins: ['flea', 'fenwick'], seasons: [2],
    wrestlers: ['The Hillbilly Hurricanes', '"Moonshine" Mabel Frye'], cast: ['zeke', 'mabel'],
    venue: 'barn', format: 'broadcast', gen: 2, card: "HARVEST HAVOC '84", spine: { kind: 'bare' },
    blurb: 'Birdie\'s first Harvest Havoc with the pencil. There is a pumpkin in the ring and nobody knows why.',
    moments: [
      ds('harvest', 'Harvest plaid', 'harvest-plaid'),
      mv('superkick84', 'The pumpkin-patch superkick', 'superkick'),
    ],
  },

  // ======================================================== RARE
  {
    id: 'velvet-gloves-76', label: "VELVET GLOVES — open challenge '76", title: "Velvet Gloves: The Hammers' First Open Challenge (1976)",
    rarity: 'rare', year: 1976, promo: 'Alley Championship Wrestling', price: 22, bins: ['fenwick', 'flea'],
    wrestlers: ['The Velvet Hammers (Dottie Dupree & Birdie Malone)', 'The Hillbilly Hurricanes'], cast: ['birdie', 'zeke'],
    venue: 'sportatorium', format: 'broadcast', gen: 2, card: 'SATURDAY WRESTLING', spine: { kind: 'white' }, stickers: ['MASTER'], tint: 'warm',
    blurb: 'Two women issue an open challenge. Two men think it will be easy. It is not easy.',
    moments: [
      hm('gloves', 'The challenge is answered', 'hm-velvet-gloves', { spot: 'promo', who: ['dottie', 'birdie'] }),
      mv('tenpunch76', 'Birdie throws the punches', 'tenpunch', { who: ['birdie', 'zeke'] }),
      ch('hammers76', 'The first Hammers chant', "LET'S GO HAM-MERS!"),
    ],
  },
  {
    id: 'fairgrounds-riot-79', label: "FAIRGROUNDS RIOT '79  (rain!!)", title: "The Fairgrounds Riot of '79",
    rarity: 'rare', year: 1979, promo: 'Alley Championship Wrestling', price: 25, bins: ['fenwick', 'flea'], weather: 'rain',
    requires: { minOwned: 3 },
    wrestlers: ['The Velvet Hammers', 'The Copperhead Sisters', 'Gus Gravel (ringside)', 'Referee Danny Halloran'], cast: ['dottie', 'venom'], ref: 'danny',
    venue: 'fairgrounds', format: 'broadcast', gen: 2, card: 'SUMMER SPECTACULAR', spine: { kind: 'bare' }, stickers: ['SP'],
    blurb: 'A thunderstorm, a collapsed tarp, and the best match either of them ever had, in the mud.',
    moments: [
      hm('riot', 'The tarp comes down', 'hm-fairgrounds-riot', { spot: 'mud' }),
      cl('never-without', 'Gus\'s microphone, after', 'clue_hammers_1', 'Never without Bird', [
        'Mud to the elbows, rain coming down sideways, Dottie grabs Gus\'s microphone before he can ask a single question.',
        '"Write this down, Gus. I will never wrestle without Bird beside me. Not for any money in the world."',
        'Birdie laughs and shoves her. Dottie doesn\'t laugh. She meant every word.',
        'Four years later, she walked out of that same building alone. You rewind the tape and watch her face again.',
      ], { spot: 'promo', who: ['dottie', 'gus'], difficulty: 3 }),
      mv('hopespot79', 'A hope spot in the mud', 'hopespot', { spot: 'mud' }),
    ],
  },
  {
    id: 'duchess-crowns-80', label: 'THE DUCHESS CROWNS HERSELF 1980', title: 'The Duchess Crowns Herself (1980)',
    rarity: 'rare', year: 1980, promo: 'Alley Championship Wrestling', price: 24, bins: ['fenwick'],
    wrestlers: ['Dottie "The Duchess" Dupree', '"Iron" Ida Kowalczyk (in her last run)', 'Birdie Malone (ringside)'], cast: ['dottie-robe', 'ida'], ref: 'danny', ringside: 'birdie',
    venue: 'sportatorium', format: 'broadcast', gen: 2, card: 'SINGLES TITLE', spine: { kind: 'bare' },
    blurb: "Dottie wins the territory's singles title and, before the music even stops, hands it to Birdie to hold.",
    moments: [
      hm('crown', 'She hands Birdie the belt', 'hm-duchess-crowns', { spot: 'closeup-belt', who: ['dottie-robe', 'birdie'] }),
      pr('duchess', "The Duchess's victory speech", 'The Duchess does not lose. The Duchess occasionally permits others to win.', { who: ['dottie-robe', 'gus'] }),
      mv('rollup80', 'The Royal Decree (a cradle, a wave)', 'rollup', { spot: 'pin', who: ['dottie', 'ida'] }),
    ],
  },
  {
    id: 'original-recipe-81', label: "ORIGINAL RECIPE  birdie's switcheroo 81", title: "Original Recipe: Birdie's Switcheroo (1981)",
    rarity: 'rare', year: 1981, promo: 'Alley Championship Wrestling', price: 22, bins: ['fenwick', 'flea'],
    wrestlers: ['The Velvet Hammers', 'The Frostbite Brothers'], cast: ['birdie', 'nils'], ref: 'danny',
    venue: 'sportatorium', format: 'broadcast', gen: 2, card: 'ACW SATURDAY NIGHT', spine: { kind: 'bare' },
    blurb: 'The first time Birdie\'s famous switcheroo ever worked. Danny Halloran never saw it coming. Nobody did.',
    moments: [
      hm('recipe', 'The switcheroo', 'hm-original-recipe', { spot: 'taunt' }),
      mv('reversal', 'Birdie reverses everything', 'reversal'),
    ],
  },
  {
    id: 'hot-tag-82', label: "THE HOT TAG heard round the county 82", title: "The Hot Tag Heard 'Round the County (1982)",
    rarity: 'rare', year: 1982, promo: 'Alley Championship Wrestling', price: 26, bins: ['fenwick', 'flea'],
    wrestlers: ['The Velvet Hammers', 'The Copperhead Sisters', 'Madame Midnight (managing)'], cast: ['birdie', 'vixen'], ref: 'danny', ringside: 'june',
    venue: 'sportatorium', format: 'broadcast', gen: 2, card: 'ACW SATURDAY NIGHT', spine: { kind: 'bare' }, stickers: ['BE KIND REWIND'],
    blurb: 'Dottie crawls, reaches, and makes the tag the whole county felt. June\'s diner is named after this exact second.',
    moments: [
      hm('tag', 'The hot tag', 'hm-hot-tag', { spot: 'strike' }),
      ch('hot-tag', 'The crowd, on its feet', 'HOT TAG! HOT TAG! HOT TAG!'),
      mv('missile82', 'Hammer Down off the second rope', 'missiledropkick', { spot: 'aerial', who: ['birdie', 'vixen'] }),
    ],
  },
  {
    id: 'acw-082083', label: 'ACW SAT 8/20/83', title: 'ACW Saturday Night 8/20/83',
    rarity: 'rare', year: 1983, promo: 'Alley Championship Wrestling', price: 20, bins: ['fenwick', 'flea'],
    requires: { flags: ['clue_hammers_2'], minOwned: 10 },
    wrestlers: ['The Velvet Hammers', 'The Frostbite Brothers', 'Referee Danny Halloran'], cast: ['birdie', 'lars'], ref: 'danny',
    venue: 'sportatorium', format: 'broadcast', gen: 2, card: 'ACW SATURDAY NIGHT', spine: { kind: 'bare' }, stickers: ['SP'],
    blurb: 'A summer Saturday in 1983, the last good one. There is a stranger in the front row.',
    moments: [
      mv('superplex', 'The Hammers\' superplex', 'superplex', { who: ['birdie', 'lars'] }),
      cl('scout', 'The man in the front row', 'clue_hammers_3', 'The man in the city suit', [
        'Between falls, the hard camera drifts to the front row. A man in a gray city suit, a notepad on his knee.',
        'Everyone around him is screaming. He isn\'t. He only writes when Birdie is in the ring.',
        'When Dottie hits the Curtsy, he doesn\'t even look up.',
        'Somebody from the big city came all this way to watch Birdie Malone. Just Birdie.',
      ], { spot: 'scout', who: ['scout', 'birdie'], difficulty: 4, wobble: 'dart' }),
    ],
  },
  {
    id: 'acw-102983', label: 'ACW SAT 10/29/83  "trouble in velvet"', title: 'ACW Saturday Night 10/29/83: "Trouble in Velvet"',
    rarity: 'rare', year: 1983, promo: 'Alley Championship Wrestling', price: 24, bins: ['fenwick'],
    requires: { flags: ['clue_hammers_3'], minOwned: 14 },
    wrestlers: ['Birdie Malone', 'Dottie Dupree', 'The Copperhead Sisters'], cast: ['birdie', 'dottie'], ref: 'danny',
    venue: 'sportatorium', format: 'broadcast', gen: 2, card: 'ACW SATURDAY NIGHT', spine: { kind: 'bare' },
    blurb: 'One week before the Night of the Broken Belt. Something is being set up, and everyone in the building can feel it.',
    moments: [
      hm('breakup', 'The booking sheet, as written', 'hm-planned-breakup', { spot: 'promo', who: ['birdie', 'dottie'] }),
      cl('trouble', "Birdie's backstage promo", 'clue_hammers_4', 'Trouble in Velvet', [
        'A backstage promo, lit like a confession booth. Birdie, alone, glaring past the camera.',
        '"Every night it\'s DOTTIE, DOTTIE, DOTTIE. Maybe this town forgot who throws the punches."',
        'It\'s a good promo. It\'s also not how Birdie talks. Somebody wrote it for her.',
        'The breakup was booked. And Birdie was the one who was supposed to turn.',
      ], { spot: 'promo', who: ['birdie', 'scout'], difficulty: 4, wobble: 'sinker' }),
    ],
  },
  {
    id: 'loser-leaves-87', label: "LOSER LEAVES TOWN  otis vs boudreaux '87", title: "Loser Leaves Town: Big Otis Grange vs. Swamp Sullivan (1987)",
    rarity: 'rare', year: 1987, promo: 'Bayou Brawl Wrestling', price: 20, bins: ['fenwick', 'flea'], weather: 'rain',
    wrestlers: ['Big Otis Grange (one last time)', '"Swamp" Sullivan Boudreaux'], cast: ['otis', 'boudreaux'],
    venue: 'arena', format: 'broadcast', gen: 2, card: 'LOSER LEAVES TOWN', spine: { kind: 'bare' },
    blurb: 'Otis lost and actually left. He opened a bait shop in Arizona and sends Swamp a postcard every Christmas.',
    moments: [
      sc('leaves', 'The loser walks out the door', 'ST-03', { spot: 'aisle', who: ['otis', 'boudreaux'] }),
      mv('gorillapress', 'Big Otis\'s gorilla press', 'gorillapress', { spot: 'lift' }),
    ],
  },
  {
    id: 'hair-vs-hair-92', label: "HAIR vs HAIR tidewater 92 (somebody cried)", title: "Hair vs. Hair, Tidewater '92 (Somebody Cried)",
    rarity: 'rare', year: 1992, promo: 'Tidewater Wrestling', price: 21, bins: ['fenwick', 'flea'],
    wrestlers: ['Starla Divine', 'Rocky Rockwell'], cast: ['starla', 'rocky'],
    venue: 'arena', format: 'broadcast', gen: 1, card: 'HAIR VS. HAIR', spine: { kind: 'clamshell', color: '#b27ae0' },
    blurb: 'Clippers on a velvet pillow. Gideon would not survive watching this. Do not show Gideon this.',
    moments: [
      sc('clippers', 'Clippers on a velvet pillow', 'ST-05', { spot: 'promo' }),
      mv('ddt', 'The DDT that decides it', 'ddt'),
      ds('neon92', 'Glam sequins', 'neon-90s'),
    ],
  },
  {
    id: 'half-mask-78', label: "THE MASKED STRANGER of '78", title: "The Masked Stranger of '78",
    rarity: 'rare', year: 1978, promo: 'Magnolia State Wrestling', price: 20, bins: ['fenwick'],
    wrestlers: ['Doctor Thunderbolt', 'The Amazing Zambrano'], cast: ['thunderbolt', 'zambrano'],
    venue: 'studio', format: 'broadcast', gen: 3, card: 'MAGNOLIA STATE', spine: { kind: 'white' }, tint: 'warm',
    blurb: 'Zambrano gets the mask halfway up, the studio lights cut out, and when they come back, the Doctor is gone.',
    moments: [
      sc('halfmask', 'The mask comes halfway up', 'TW-04', { spot: 'mask' }),
      mv('moonsault', 'Thunderbolt\'s moonsault', 'moonsault', { who: ['thunderbolt', 'zambrano'] }),
    ],
  },
  {
    id: 'last-standing-90', label: "LAST ONE STANDING great lakes 90", title: "Last One Standing: Great Lakes '90",
    rarity: 'rare', year: 1990, promo: 'Great Lakes Grapple Club', price: 19, bins: ['fenwick', 'flea'], seasons: [3, 0],
    wrestlers: ['"Big Timber" Bjorn Paulsen', '"Walleye" Wally Kowalchuk'], cast: ['timber', 'wally'],
    venue: 'gym', format: 'broadcast', gen: 1, card: 'LAST ONE STANDING', spine: { kind: 'bare' },
    blurb: 'Two big men, a ten count, and the slowest, most heroic stand-up in the history of the Great Lakes.',
    moments: [
      sc('standing', 'Up at nine', 'PO-09', { spot: 'sell' }),
      mv('giantswing', 'The giant swing (the crowd counts the spins)', 'giantswing', { spot: 'spin' }),
    ],
  },
  {
    id: 'swerve-86', label: "TRI-STATE '86 nobody saw it coming", title: "Swerve Within a Swerve (Tri-State '86)",
    rarity: 'rare', year: 1986, promo: 'Tri-State Wrestling', price: 19, bins: ['fenwick', 'flea'],
    wrestlers: ['"Sir" Reginald Kingsley', '"Hot Rod" Hal Hendricks', '"Lady Lightning" Loretta Spark'], cast: ['kingsley', 'hotrod'],
    venue: 'arena', format: 'broadcast', gen: 1, card: 'TRI-STATE', spine: { kind: 'bare' },
    blurb: 'Everyone guessed the twist. The twist was that they guessed. Melvin the Accountant still won\'t talk about it.',
    moments: [
      sc('swerve', 'The twist behind the twist', 'TW-11', { spot: 'entrance' }),
      mv('workhorse', 'Working the whole match', 'workhorse', { spot: 'strike' }),
    ],
  },
  {
    id: 'double-agent-85', label: "BAYOU BRAWL '85 the double agent", title: "The Double Agent (Bayou Brawl '85)",
    rarity: 'rare', year: 1985, promo: 'Bayou Brawl Wrestling', price: 20, bins: ['fenwick'], weather: 'rain',
    wrestlers: ['"Swamp" Sullivan Boudreaux', '"Duke" Delacroix'], cast: ['duke', 'boudreaux'],
    venue: 'arena', format: 'broadcast', gen: 2, card: 'BAYOU BRAWL', spine: { kind: 'bare' },
    blurb: 'Duke spent six months as Swamp\'s loyal partner. Six months! He was working for the other side the whole time.',
    moments: [
      sc('agent', 'The partner turns', 'TW-07', { spot: 'strike' }),
      mv('beg', 'Begging for mercy (they fall for it)', 'beg', { spot: 'sell' }),
    ],
  },

  // ======================================================== LEGENDARY
  {
    id: 'blizzard-bowl-78', label: "BLIZZARD BOWL '78 (the barn one)", title: "Blizzard Bowl '78",
    rarity: 'legendary', year: 1978, promo: 'Alley Championship Wrestling', price: 65, bins: ['fenwick'], seasons: [3], weather: 'snow',
    wrestlers: ['The Velvet Hammers', 'The Frostbite Brothers (Nils & Lars)', 'Sweet Lou Bastian (guest referee)'], cast: ['birdie', 'nils'], ref: 'lou',
    venue: 'barn', format: 'broadcast', gen: 2, card: "BLIZZARD BOWL '78", spine: { kind: 'clamshell', color: '#9cc8f0' }, stickers: ['MASTER'],
    blurb: 'A Tuesday, an ice storm and a barn sold out to the rafters. The heat went out. Nobody left. Birdie still talks about it.',
    moments: [
      ch('heat', 'The heater dies', 'WE WANT HEAT! WE WANT HEAT!', { spot: 'snow' }),
      sc('lights-out', 'The power fails, the trucks pull up', 'PO-13', { spot: 'lights-out' }),
      mv('giantswing78', 'Birdie swings a Frostbite Brother', 'giantswing', { spot: 'spin', who: ['birdie', 'lars'] }),
      ds('snowflake', 'Snowflake robes', 'blizzard-flake', { who: ['dottie-robe', 'birdie'] }),
    ],
  },
  {
    id: 'hammers-gold-81', label: "VELVET HAMMERS WIN THE GOLD  homecoming 81", title: "The Velvet Hammers Win the Gold (Homecoming '81)",
    rarity: 'legendary', year: 1981, promo: 'Alley Championship Wrestling', price: 70, bins: ['fenwick'],
    requires: { flags: ['clue_hammers_1'], minOwned: 6 },
    wrestlers: ['The Velvet Hammers (Dottie Dupree & Birdie Malone)', 'The Copperhead Sisters', 'Madame Midnight', 'Referee Danny Halloran'], cast: ['dottie', 'venom'], ref: 'danny', ringside: 'june',
    venue: 'sportatorium', format: 'broadcast', gen: 1, card: "HOMECOMING '81", spine: { kind: 'bare' }, stickers: ['MASTER', 'DO NOT ERASE'],
    blurb: 'The night they won the tag titles. The Sportatorium shook so hard the water tower rang like a bell.',
    moments: [
      mv('decree', 'The Royal Decree', 'rollup', { spot: 'pin', who: ['dottie', 'venom'] }),
      cl('rhinestone', 'The new belt, held between them', 'clue_hammers_2', 'The red rhinestone', [
        'The camera pushes in on the new belt, held up between two pairs of hands: plum glove on the left, crimson on the right.',
        'Dead center of the gold plate sits a single red rhinestone, winking in the ring lights.',
        'Dottie leans into Gus\'s microphone. "Half of everything I\'ve got is hers. Always was."',
        'Half of everything. You can\'t stop hearing it.',
      ], { spot: 'closeup-belt', who: ['dottie', 'birdie'], difficulty: 4, wobble: 'mixed' }),
      ds('velvet', 'The 1981 robes', 'velvet-81', { who: ['dottie-robe', 'birdie'] }),
      ch('hammers81', 'Homecoming, on its feet', "LET'S GO HAM-MERS! LET'S GO HAM-MERS!"),
    ],
  },
  {
    id: 'teardown-cam-83', label: 'DO NOT TAPE OVER — H.S.', title: 'Ring Crew Camcorder, VFW Teardown, 11/2/83',
    rarity: 'legendary', year: 1983, promo: 'Ring crew camcorder', price: 55, bins: ['fenwick', 'flea'], mystery: true,
    requires: { flags: ['clue_hammers_4'], minOwned: 18 },
    wrestlers: ['Dottie Dupree', 'Birdie Malone', 'a rolled-up gym mat'], cast: ['dottie', 'birdie'],
    venue: 'vfw', format: 'camcorder', gen: 1, spine: { kind: 'bare' }, stickers: ['DO NOT ERASE'],
    blurb: 'Seventeen-year-old Hank left the crew camcorder running on a ladder after a Wednesday show. Three days before the Night.',
    moments: [
      cl('encore', 'After the chairs are stacked', 'clue_hammers_5', 'The Encore', [
        'The VFW, after the chairs are stacked. Work lights. The crew camcorder sits forgotten on a ladder.',
        'Dottie and Birdie walk through a move on the bare mat, slow, laughing, a rolled-up gym mat standing in for the poor opponent.',
        'Curtsy. Cradle. Hold the legs. They finish with their hands joined across the mat, and Dottie says, "Homecoming. They\'ll lose their minds."',
        'Three days before the Night of the Broken Belt, they were rehearsing a reunion. Neither one of them was planning to leave.',
      ], { spot: 'teardown', difficulty: 4, wobble: 'floater' }),
      mv('cradle', 'Curtsy into a cradle', 'rollup', { spot: 'teardown' }),
      ch('giggle', 'Birdie laughing so hard she sits down', 'AGAIN! AGAIN! (Birdie, wheezing)', { spot: 'teardown' }),
    ],
  },
  {
    id: 'broken-belt-83', label: 'BROKEN BELT 11/5/83 — DON\'T', title: 'The Night of the Broken Belt (Channel 9 Broadcast, 11/5/83, Damaged)',
    rarity: 'legendary', year: 1983, promo: 'Alley Championship Wrestling', price: 90, bins: ['fenwick'],
    requires: { flags: ['tape_quest_ready'], minOwned: 20 },
    wrestlers: ['The Velvet Hammers', 'The Copperhead Sisters', 'Madame Midnight', 'Referee Danny Halloran', 'Gus Gravel (commentary)'], cast: ['dottie', 'birdie'], ref: 'danny', ringside: 'june',
    venue: 'sportatorium', format: 'broadcast', gen: 4, card: 'ACW SATURDAY NIGHT', spine: { kind: 'scraped' }, stickers: ['DO NOT ERASE'],
    blurb: 'The lost broadcast. Water-damaged, wrinkled at the worst possible spot, and the only copy anybody knows of.',
    moments: [
      cl('lean', 'Dottie leans to the referee', 'clue_1983_lean', 'A whisper', [
        'Right before the swing, Dottie leans close to young Danny Halloran and says something into his ear.',
        'The audio is gone, eaten by the tape. But you can see Danny\'s face go white.',
        'Whatever she said, he heard it. And he didn\'t stop her.',
      ], { spot: 'broken-belt', who: ['dottie', 'danny'], difficulty: 5, wobble: 'dart' }),
      cl('clang', 'The swing', 'clue_1983_clang', 'Metal on metal', [
        'The picture tears apart the instant the belt comes down. Static, then nothing.',
        'But the audio comes back for half a second, and you hear it clearly: CLANG. Metal on metal.',
        'A title belt hitting a person doesn\'t make that sound.',
      ], { spot: 'broken-belt', difficulty: 5, wobble: 'mixed' }),
      m('audible', 'The finish changes', { kind: 'story', card: 'TW-19' }, { spot: 'broken-belt', difficulty: 4, wobble: 'sinker', also: { kind: 'hammers', edition: 'hm-audible' } }),
      cl('aisle', 'The walk up the aisle', 'clue_1983_tears', 'Villains don\'t cry', [
        'The camera follows the Duchess up the aisle, half a belt in her hand. A purse catches her on the shoulder: seat A1.',
        'For one second she turns toward the lens. Her face is wet.',
        'Gus, on commentary, can barely talk: "Dottie... why?"',
        'You sit in the blue light of the TV for a long time after the tape runs out.',
      ], { spot: 'aisle', who: ['dottie', 'agnes'], difficulty: 5, wobble: 'floater' }),
    ],
  },
  {
    id: 'lous-last-stand-91', label: "LOU'S LAST STAND 6/15/91", title: "Lou's Last Stand (Sportatorium, 6/15/91)",
    rarity: 'legendary', year: 1991, promo: 'Alley Championship Wrestling', price: 60, bins: ['fenwick', 'flea'],
    wrestlers: ['"Sweet Lou" Bastian (retirement match)', '"Sir" Reginald Kingsley', 'Agnes Pickett (seat A1)'], cast: ['lou-91', 'kingsley'], ringside: 'agnes',
    venue: 'sportatorium', format: 'broadcast', gen: 1, card: "LOU'S LAST STAND", spine: { kind: 'bare' }, stickers: ['MASTER', 'BE KIND REWIND'],
    blurb: 'Twenty-five years, one last song, and an hour-long classic. Seat A1 knows every word and doesn\'t sing a single one out loud.',
    moments: [
      cl('dedication', 'One last verse', 'clue_lou_dedication', 'For somebody far away', [
        'Before the bell, Lou takes the microphone and sings one verse, soft, the way he always did. In seat A1, Agnes mouths every word.',
        'Then he looks straight down the camera lens.',
        '"This one\'s for somebody watching at home, far away. You know who you are. Every Saturday, darlin\'. Every single one."',
        'Who was Sweet Lou singing to, in 1991? Somebody he knew would see this tape.',
      ], { spot: 'song', who: ['lou-91', 'agnes'], difficulty: 3, wobble: 'smooth' }),
      sc('iron', 'Sixty minutes, all of them perfect', 'PO-18', { spot: 'hold' }),
      mv('serenade', 'The Serenade (a sleeper and a lullaby)', 'sleeper', { spot: 'hold', who: ['lou-91', 'kingsley'] }),
      ch('one-more-91', 'The whole building', 'ONE MORE SONG! ONE MORE SONG!', { spot: 'song' }),
    ],
  },
  {
    id: 'mothman-first', label: 'SAT NITE bleacher cam  "WHAT IS THAT"', title: "The Mothman's First Match (Bleacher Cam, Four Years Ago)",
    rarity: 'legendary', year: 2022, promo: 'Home video', price: 58, bins: ['flea', 'yard-sale', 'fenwick'],
    requires: { minOwned: 8 },
    wrestlers: ['The Mothman (debut)', '"Brick" Barnaby', 'Referee Mo'], cast: ['brick', 'rocky'], ref: 'mo',
    venue: 'sportatorium', format: 'camcorder', gen: 1, spine: { kind: 'white' }, stickers: ['DO NOT ERASE'],
    blurb: 'Filmed from the bleachers by somebody\'s nephew on a camcorder older than he was. 212 people were there. Then 450. Then everyone.',
    moments: [
      m('porch', 'The porch light clicks on', { kind: 'design', design: 'moth-dust' }, { spot: 'porch-light', who: ['mothman', 'brick'], difficulty: 4, wobble: 'floater' }),
      sc('stranger', 'Something unfolds from under the ring', 'HK-14', { spot: 'porch-light', who: ['mothman', 'brick'] }),
      cl('refbump', 'Where was the referee?', 'clue_mothman_refbump', 'Where was the referee?', [
        'The Mothman hits the Porch Light under the bare bulb and lowers the big man into a cradle. The bleacher kid forgets to breathe. So do you.',
        'Then you notice the corner of the frame: Referee Mo, flat on the mat the whole time, out cold from a stray elbow.',
        'She comes to and counts the pin just as the house lights come back up. Lucky timing.',
        '(You jot it down. Fenwick would want to know.)',
      ], { spot: 'porch-light', who: ['mothman', 'mo'], difficulty: 4, wobble: 'dart' }),
      ch('mothman', 'The first chant ever', 'MOTH-MAN! MOTH-MAN! MOTH-MAN!', { spot: 'crowd' }),
    ],
  },
  {
    id: 'haunted-house-79', label: 'HAUNTED HOUSE MATCH 79 (unaired!!!)', title: 'The Haunted House Match (1979, Unaired)',
    rarity: 'legendary', year: 1979, promo: 'Alley Championship Wrestling', price: 75, bins: ['fenwick'], seasons: [2],
    wrestlers: ['"Sweet Lou" Bastian', 'Count Bartholomew Vane', 'Referee Danny Halloran'], cast: ['lou', 'vane'], ref: 'danny',
    venue: 'sportatorium', format: 'broadcast', gen: 3, card: 'HAUNTED HOUSE', spine: { kind: 'white' }, stickers: ['UNAIRED'],
    blurb: 'The night the porch light was hung over the ring, and never taken down. Fenwick has hunted this tape for thirty years.',
    moments: [
      ds('porch', 'The bulb on the cord', 'porch-light', { spot: 'porch-light', who: ['vane', 'lou'] }),
      sc('dark', 'The lights go out', 'PO-13', { spot: 'lights-out' }),
      ch('boo', 'Two thousand people go BOO', 'BOOOOOO! (the friendly kind)', { spot: 'crowd' }),
    ],
  },
  {
    id: 'mariposa-62', label: 'LA MARIPOSA vs LA VIUDA NEGRA 1962  máscara contra máscara', title: 'La Mariposa vs. La Viuda Negra: Máscara contra Máscara (1962)',
    rarity: 'legendary', year: 1962, promo: 'Arena del Norte', price: 80, bins: ['fenwick'],
    wrestlers: ['La Mariposa (Celia Villanueva, Rosa\'s abuela)', 'La Viuda Negra'], cast: ['celia', 'viuda'],
    venue: 'arena', format: 'kinescope', gen: 3, card: 'MÁSCARA CONTRA MÁSCARA', spine: { kind: 'white' }, tint: 'bw',
    blurb: 'Both masks hang above the ring. Abuela Celia, four years into her career, flies. Rosa is going to cry into the carnitas.',
    moments: [
      sc('masks', 'Both masks hang above the ring', 'ST-04', { spot: 'mask', who: ['celia', 'viuda'] }),
      mv('alas', 'Alas de Oro', 'crossbody', { spot: 'aerial', who: ['celia', 'viuda'] }),
      pr('promise', "La Mariposa's words, after", "It's not a disguise. It's a promise to be bigger than yourself.", { who: ['celia', 'viuda'] }),
      ds('mariposa', 'The 1962 mask', 'mariposa-62', { who: ['celia', 'viuda'] }),
    ],
  },
];

export const TAPE_BY_ID: Record<string, TapeDef> = Object.fromEntries(TAPES.map((t) => [t.id, t]));

export function tapeDef(id: string): TapeDef | undefined {
  return TAPE_BY_ID[id];
}

/** Every main-story flag a tape can set, for other systems to look up. */
export const CLUE_FLAGS: string[] = TAPES.flatMap((t) => t.moments.map((mo) => (mo.reward.kind === 'clue' ? mo.reward.flag : null)).filter((f): f is string => !!f));
