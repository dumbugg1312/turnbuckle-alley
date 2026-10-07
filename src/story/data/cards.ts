/**
 * Story cards: all 109 napkin cards (docs/STORYLINES.md section 4) as data.
 * Contract: src/story/types.ts (CardDef). Template and tone rules are in that file's header.
 * Card templates use only {hero}, {villain}, {winner}, {loser} and the globals ({title}, {venue}).
 */

import type { CardDef, CardId } from '../types';

// ------------------------------------------------------------------ hooks (20)

const HOOKS: CardDef[] = [
  {
    id: 'HK-01', name: 'The Sneak Attack', slot: 'hook',
    blurb: `A blindside after the bell, from someone trusted or someone unseen.`,
    rarity: 'common', sources: ['starter'], tags: ['drama', 'violence_low', 'menace', 'swerve'],
    beat: {
      kind: 'angle',
      title: `Sneak attack: {villain} blindsides {hero}`,
      text: [
        `The bell had rung and the handshakes were done when {villain} hit {hero} from behind with a double axe handle. Referee Mo called it a cheap shot, loudly, to nobody in particular.`,
        `{hero} turned to wave at row one, and {villain} flattened {hero} with a clothesline from nowhere. Everyone in {venue} gasped at once.`,
      ],
      headline: [`{villain} BLINDSIDES {hero} AFTER THE BELL`, `CHEAP SHOT AFTER THE BELL SPARKS OUTRAGE`],
    },
    chants: [`CHEAP SHOT!`, `REF! REF! REF!`],
  },
  {
    id: 'HK-02', name: 'The Open Challenge', slot: 'hook',
    blurb: `"Anyone, anytime." Somebody answers who shouldn't.`,
    rarity: 'common', sources: ['starter'], tags: ['drama', 'live_mic', 'spotlight', 'improv'],
    beat: {
      kind: 'promo',
      title: `Open challenge: {villain} calls out the locker room`,
      text: [
        `{villain} seized the microphone and offered a match to anyone, anywhere, anytime. The curtain parted and {hero} walked out, which was not at all who {villain} had in mind.`,
        `"Anyone, anytime!" barked {villain} into Gus Gravel's microphone. {hero} stood up in the second row, climbed the steps, and said, "Saturday." The crowd lost its mind.`,
      ],
      headline: [`{villain} ISSUES OPEN CHALLENGE, {hero} ANSWERS`, `OPEN CHALLENGE ACCEPTED BY UNLIKELY {hero}`],
    },
    chants: [`ACCEPT IT!`, `SATURDAY! SATURDAY!`],
  },
  {
    id: 'HK-03', name: 'The Left-Hanging Handshake', slot: 'hook',
    blurb: `A hand is offered in front of everyone and refused.`,
    rarity: 'common', sources: ['starter'], tags: ['drama', 'old_school', 'slow_build'],
    beat: {
      kind: 'angle',
      title: `The handshake: {hero} offers, {villain} refuses`,
      text: [
        `{hero} held out a hand in the center of the ring, in front of the whole house. {villain} looked at it as if it were a casserole nobody had asked for, and the hand hung there a long time.`,
        `Gus Gravel asked the two to shake for the folks at home. {hero} offered. {villain} folded both arms, gave one slow shake of the head, and left {hero}'s hand hanging in the spotlight.`,
      ],
      headline: [`{villain} REFUSES {hero}'S HANDSHAKE IN FRONT OF ALL`, `OFFERED HAND LEFT HANGING IN TURNBUCKLE ALLEY`],
    },
    chants: [`SHAKE IT!`, `BOO!`],
  },
  {
    id: 'HK-04', name: 'The Crashed Entrance', slot: 'hook',
    blurb: `A big entrance is interrupted mid-song, right at the key change.`,
    rarity: 'common', sources: ['tape'], tags: ['entrance', 'drama', 'spectacle', 'menace'],
    beat: {
      kind: 'angle',
      title: `Crashed entrance: {villain} cuts off {hero}'s music`,
      text: [
        `{hero}'s theme hit the key change and the curtain was about to part when the music cut out. {villain} took the microphone and walked out in {hero}'s place.`,
        `The pyro was cued and the song was soaring. Then {villain} stepped through the smoke instead, waving to a crowd that was still singing {hero}'s theme.`,
      ],
      headline: [`{villain} CRASHES {hero}'S BIG ENTRANCE`, `ENTRANCE INTERRUPTED AT THE KEY CHANGE`],
    },
    chants: [`PLAY THE SONG!`, `LET HIM IN!`],
  },
  {
    id: 'HK-05', name: 'The Heist', slot: 'hook',
    blurb: `Something precious vanishes from backstage, and everyone's a suspect.`,
    rarity: 'common', sources: ['starter', 'insider_story'], tags: ['mystery', 'crime_kayfabe', 'comedy', 'drama'],
    beat: {
      kind: 'angle',
      title: `The heist: something of {hero}'s goes missing`,
      text: [
        `A lucky jacket, a hand-lettered sign, a velvet pouch: something precious had vanished from backstage, and the whole locker room was a lineup of suspects. {hero} looked straight at {villain}.`,
        `Sheriff Bev opened her citation book in the hallway behind the curtain. Something of {hero}'s was missing, and the only clue was a muddy boot print that matched {villain}'s.`,
      ],
      headline: [`BACKSTAGE THEFT BAFFLES SHERIFF BEV`, `{hero} POINTS FINGER AT {villain} IN BACKSTAGE HEIST`],
    },
    chants: [`THIEF!`, `CHECK HIS POCKETS!`],
  },
  {
    id: 'HK-06', name: 'Number One Contender', slot: 'hook',
    blurb: `Birdie names a contender nobody expected.`,
    rarity: 'uncommon', sources: ['insider_story'], tags: ['title', 'rules', 'drama', 'spotlight'],
    requires: [{ kind: 'title' }],
    beat: {
      kind: 'angle',
      title: `Number one contender: {hero} gets the call`,
      text: [
        `The Commissioner stepped into the ring, unfolded a sheet of paper, and named {hero} the number one contender for {title}. {villain} laughed until Referee Mo asked for quiet.`,
        `"By order of the commission," the Commissioner read, "the next challenger for {title} is {hero}." Nobody saw that coming, least of all {villain}, who stopped smiling.`,
      ],
      headline: [`{hero} NAMED NUMBER ONE CONTENDER`, `COMMISSIONER'S PICK SHOCKS {villain}`],
    },
    chants: [`NUMBER ONE!`, `WHO? HIM!`],
  },
  {
    id: 'HK-07', name: 'The Return', slot: 'hook',
    blurb: `A familiar song hits, and someone long away walks through the curtain.`,
    rarity: 'uncommon', sources: ['life_event'], tags: ['entrance', 'legacy', 'heartfelt', 'spotlight'],
    requires: [{ kind: 'returning' }],
    beat: {
      kind: 'angle',
      title: `The return: {hero} is back`,
      text: [
        `A familiar song hit the speakers and {venue} went quiet. Then the curtain opened and {hero} walked through it, back after a long absence and hardly changed. {villain} stopped mid-sentence.`,
        `Nobody had cued the music, but it played anyway, and the curtain parted on {hero}. Gus Gravel said, "Folks, I do not believe it," and he did not sound like he was working.`,
      ],
      headline: [`{hero} RETURNS TO TURNBUCKLE ALLEY`, `RETURN OF {hero} STOPS THE SHOW`],
    },
    chants: [`WELCOME BACK!`, `HE'S BACK!`],
  },
  {
    id: 'HK-08', name: 'The Diner Bet', slot: 'hook',
    blurb: `A bet made loudly at the Hot Tag counter, with witnesses.`,
    rarity: 'common', sources: ['town'], tags: ['hometown', 'comedy', 'public', 'rules'],
    beat: {
      kind: 'town',
      title: `Diner bet: {hero} and {villain} at the Hot Tag`,
      text: [
        `At the Hot Tag Diner counter, {villain} bet {hero} loudly that the next match would be over before the pie was. The whole room heard it, and the waitress wrote it down on a napkin as a receipt.`,
        `{hero} slapped a five-dollar bill on the Hot Tag counter and bet that {villain} would not show up Saturday. Everyone heard it. {villain} slid onto the next stool and covered the bet.`,
      ],
      headline: [`LOUD BET AT HOT TAG DINER DRAWS A CROWD`, `{hero} AND {villain} SHAKE ON DINER WAGER`],
    },
    chants: [`PAY UP!`, `PIE! PIE! PIE!`],
  },
  {
    id: 'HK-09', name: 'Roses in the Locker', slot: 'hook',
    blurb: `Flowers and unsigned notes start appearing on screen.`,
    rarity: 'uncommon', sources: ['fan_mail'], tags: ['romance', 'mystery', 'heartfelt', 'slow_build'],
    beat: {
      kind: 'angle',
      title: `Roses in the locker: a secret admirer for {hero}`,
      text: [
        `A single red rose was tucked into {hero}'s gear bag, with a note that said only, "Saturday, I will be watching." By the next show there was a bouquet, and Pip already had a theory.`,
        `Roses kept turning up in {hero}'s locker, one per show, each with an unsigned card in careful handwriting. {villain} was seen sniffing one backstage and denying everything.`,
      ],
      headline: [`SECRET ADMIRER LEAVES ROSES FOR {hero}`, `UNSIGNED NOTES BAFFLE LOCKER ROOM`],
    },
    chants: [`WHO'S THE ADMIRER?`, `AWWW!`],
  },
  {
    id: 'HK-10', name: 'The Mysterious Box', slot: 'hook',
    blurb: `A gift-wrapped box sits in the middle of the ring, and nobody claims it.`,
    rarity: 'uncommon', sources: ['tape'], tags: ['mystery', 'whimsy', 'spectacle', 'slow_build'],
    beat: {
      kind: 'angle',
      title: `The mysterious box: {hero} and {villain} both say it's theirs`,
      text: [
        `A gift-wrapped box sat in the middle of the ring with a bow the size of a hubcap, and nobody claimed it. Referee Mo refused to touch it. {hero} and {villain} each insisted it was theirs.`,
        `The lights came up on a box in silver paper, tied with ribbon, right in the center of the mat. The tag read only, "For whoever deserves it." {hero} looked at {villain}. {villain} looked at {hero}.`,
      ],
      headline: [`MYSTERY BOX APPEARS IN THE RING`, `{hero} AND {villain} BOTH CLAIM MYSTERY GIFT`],
    },
    chants: [`OPEN IT!`, `WHAT'S IN THE BOX?`],
  },
  {
    id: 'HK-11', name: 'The Ruined Robe', slot: 'hook',
    blurb: `A beloved robe is "destroyed" on screen. Marigold made a stunt double.`,
    rarity: 'uncommon', sources: ['insider_story'], tags: ['gear', 'drama', 'menace', 'spectacle'],
    beat: {
      kind: 'angle',
      title: `The ruined robe: {villain} tears up {hero}'s favorite`,
      text: [
        `{villain} snatched {hero}'s treasured robe from the corner post and tore it clean down the back. Marigold put a hand over her mouth in the third row, and the crowd groaned like a screen door.`,
        `Under the lights, {villain} fed {hero}'s favorite robe through the ropes and shredded it with a theatrical tug. {hero} knelt among the sequins in silence.`,
      ],
      headline: [`{villain} SHREDS {hero}'S FAVORITE ROBE`, `MARIGOLD GASPS AS ROBE IS TORN IN THE RING`],
    },
    chants: [`SHAME!`, `BOO!`],
  },
  {
    id: 'HK-12', name: 'Hometown Pride', slot: 'hook',
    blurb: `Someone says they were born here, and someone else says prove it.`,
    rarity: 'common', sources: ['town'], tags: ['hometown', 'outsider', 'comedy', 'live_mic'],
    beat: {
      kind: 'promo',
      title: `Hometown pride: {villain} says born and raised`,
      text: [
        `"Born right here on Main Street," said {villain}. {hero} folded both arms and said, "Name the street the Sportatorium is on." The pause that followed was extremely suspicious.`,
        `{villain} told the crowd {villain} was a Turnbuckle Alley native, same as {hero}. {hero} said prove it. Gus Gravel offered to check the town records, and the crowd chose to be skeptical.`,
      ],
      headline: [`{villain} CLAIMS TURNBUCKLE ALLEY ROOTS`, `{hero} DEMANDS PROOF OF HOMETOWN CLAIM`],
    },
    chants: [`PROVE IT!`, `TURNBUCKLE ALLEY!`],
  },
  {
    id: 'HK-13', name: 'Friendly Fire', slot: 'hook',
    blurb: `A move misses and hits the mover's own partner.`,
    rarity: 'common', sources: ['starter'], tags: ['tag', 'drama', 'comedy', 'violence_low'],
    requires: [{ kind: 'allies' }],
    beat: {
      kind: 'match',
      title: `Tag team action: {hero} and {villain} (a bad tag)`,
      text: [
        `{hero} swung a big boot at the opponent on the apron, and the opponent ducked. The boot caught {villain} square under the chin instead, and the two partners stared at each other.`,
        `{villain} dove off the second rope for a flying elbow and the opponent rolled aside. {hero} caught every ounce of it. The crowd went "ooh" in one long, concerned breath.`,
      ],
      headline: [`FRIENDLY FIRE SPLITS TAG TEAM`, `{hero} AND {villain} TRADE WORDS AFTER MISFIRE`],
    },
    chants: [`TAG HIM IN!`, `OOOH!`],
  },
  {
    id: 'HK-14', name: 'The Masked Stranger', slot: 'hook',
    blurb: `A masked figure appears at ringside, says nothing and leaves.`,
    rarity: 'rare', sources: ['tape'], tags: ['mask', 'mystery', 'entrance', 'spotlight'],
    requires: [{ kind: 'masked' }],
    beat: {
      kind: 'angle',
      title: `The masked stranger watches {hero} and {villain}`,
      text: [
        `A masked figure stood at the top of the aisle, arms folded, for the whole main event. The figure said nothing, nodded once toward {villain}, and was gone through the exit door.`,
        `Nobody saw the masked stranger arrive. Gus Gravel noticed the empty seat in row three was suddenly full, then not. {hero} and {villain} both swore the mask had been looking right at them.`,
      ],
      headline: [`MASKED STRANGER SEEN AT RINGSIDE`, `WHO WAS THE MASKED VISITOR?`],
    },
    chants: [`WHO IS IT?`, `TAKE A BOW!`],
  },
  {
    id: 'HK-15', name: 'The Big City Letter', slot: 'hook',
    blurb: `Someone waves a contract from the city. Are they leaving?`,
    rarity: 'uncommon', sources: ['life_event'], tags: ['big_city', 'leaving', 'drama', 'hometown'],
    beat: {
      kind: 'angle',
      title: `The big city letter: {hero} has an offer`,
      text: [
        `{hero} stepped into the ring waving an envelope with a big-city return address and an expensive stamp. Offers from the city were on the table. {villain} suddenly looked a lot less ornery.`,
        `"A contract," {hero} told the crowd, holding up the paper. "From the city." The VFW's folding chairs creaked as everyone leaned in. {villain} said nothing, which was strange.`,
      ],
      headline: [`{hero} RECEIVES BIG-CITY CONTRACT OFFER`, `WILL {hero} LEAVE TURNBUCKLE ALLEY?`],
    },
    chants: [`DON'T GO!`, `STAY! STAY!`],
  },
  {
    id: 'HK-16', name: 'The Missing Heirloom', slot: 'hook',
    blurb: `A family keepsake goes "missing" on screen.`,
    rarity: 'rare', sources: ['insider_story'], tags: ['legacy', 'family', 'mystery', 'crime_kayfabe'],
    beat: {
      kind: 'angle',
      title: `The missing heirloom: {hero}'s keepsake vanishes`,
      text: [
        `{hero}'s family keepsake, handed down through three generations, vanished from the dressing room. Sheriff Bev found one clue: a trail of glitter leading toward {villain}'s locker.`,
        `Something that had been in {hero}'s family for fifty years was gone from the gear bag. {hero} said very little, and {villain} said very loudly that it was not {villain}'s fault.`,
      ],
      headline: [`{hero}'S FAMILY HEIRLOOM VANISHES`, `SHERIFF BEV INVESTIGATES MISSING KEEPSAKE`],
    },
    chants: [`GIVE IT BACK!`, `FIND IT!`],
  },
  {
    id: 'HK-17', name: `Fenwick's Prophecy`, slot: 'hook',
    blurb: `Fenwick's latest call-in theory turns out to be weirdly specific.`,
    rarity: 'rare', sources: ['town'], tags: ['mystery', 'comedy', 'public', 'live_mic'],
    beat: {
      kind: 'wrsl',
      title: `WRSL: Fenwick has a theory about {hero} and {villain}`,
      text: [
        `Fenwick called The Gravel Pit with a theory about {hero} and {villain} that was strangely, uncomfortably specific. Gus Gravel kept saying "Uh-huh," then stopped saying it halfway through.`,
        `On WRSL 1340, Fenwick predicted that {villain} would cross {hero} before the month was out. Gus Gravel laughed. Then someone slid him a note with {villain}'s name on it.`,
      ],
      headline: [`FENWICK'S WRSL THEORY TURNS HEADS`, `CALLER PREDICTS TROUBLE FOR {hero}`],
    },
    chants: [`FENWICK WAS RIGHT!`, `TELL US MORE!`],
  },
  {
    id: 'HK-18', name: 'The Cold Locker', slot: 'hook',
    blurb: `A locker frosts over, and a whisper says a name.`,
    rarity: 'rare', sources: ['dungeon'], tags: ['supernatural', 'mystery', 'night', 'menace'],
    beat: {
      kind: 'angle',
      title: `The cold locker: frost on {hero}'s door`,
      text: [
        `Frost crept across the door of {hero}'s locker on a warm night, and a thin whisper in the hallway said the name {villain}. Hank checked the vents and found nothing at all.`,
        `{hero} opened the locker and a breath of cold air rolled out, silver and sparkling. From somewhere down the hall came a whisper: {villain}. Hank blamed the plumbing.`,
      ],
      headline: [`LOCKER FROSTS OVER IN WARM WEATHER`, `WHISPER NAMES {villain} BACKSTAGE`],
    },
    chants: [`WHO'S THERE?`, `OOOOOH!`],
  },
  {
    id: 'HK-19', name: 'The Rematch Clause', slot: 'hook',
    blurb: `An old loss nobody forgot gets a new date.`,
    rarity: 'common', sources: ['starter'], tags: ['rules', 'mat_classic', 'old_school', 'drama'],
    requires: [{ kind: 'history' }],
    beat: {
      kind: 'contract',
      title: `Rematch clause: {hero} and {villain} settle it again`,
      text: [
        `The Commissioner dug an old contract out of the filing cabinet and found a rematch clause nobody had read. {hero} and {villain} would settle it again, same ring, new date. Referee Mo sighed.`,
        `Gus Gravel read the dusty paper aloud: "...shall be entitled to one rematch." {hero} and {villain} turned and looked at each other, and neither one smiled.`,
      ],
      headline: [`REMATCH CLAUSE FOUND: {hero} VS. {villain} AGAIN`, `OLD CONTRACT FORCES SECOND MEETING`],
    },
    chants: [`RE-MATCH!`, `ONE MORE TIME!`],
  },
  {
    id: 'HK-20', name: 'The New Look', slot: 'hook',
    blurb: `Someone debuts a new gimmick and won't say why.`,
    rarity: 'uncommon', sources: ['life_event'], tags: ['gear', 'entrance', 'mystery', 'spotlight'],
    beat: {
      kind: 'angle',
      title: `The new look: {hero} debuts a new gimmick`,
      text: [
        `{hero} came through the curtain in Marigold's newest creation: new robe, new music, new name on the sign. Asked why, {hero} said, "I'm not telling." The crowd leaned in.`,
        `Nobody recognized the figure at first. Then Gus Gravel read the card: it was {hero}, with a whole new look and a very pointed stare at {villain}.`,
      ],
      headline: [`{hero} DEBUTS A BRAND-NEW LOOK`, `NEW GIMMICK RAISES QUESTIONS IN THE LOCKER ROOM`],
    },
    chants: [`NEW LOOK!`, `WHO'S THAT?`],
  },
];

// ------------------------------------------------------------------ twists (19)

const TWISTS: CardDef[] = [
  {
    id: 'TW-01', name: 'The Turn', slot: 'twist',
    blurb: `An ally turns on their partner at the worst possible moment.`,
    rarity: 'common', sources: ['starter'], tags: ['betrayal', 'tag', 'drama', 'swerve'],
    requires: [{ kind: 'allies' }],
    beat: {
      kind: 'angle',
      title: `The turn: {villain} abandons {hero}`,
      text: [
        `{hero} reached out for the hot tag, and {villain} turned and caught {hero} with a forearm instead. The crowd's gasp could have powered the lights.`,
        `Partners all night, and then at the worst moment {villain} stepped aside, held the ropes open for the other team, and watched {hero} take everything coming.`,
      ],
      headline: [`{villain} TURNS ON PARTNER {hero}`, `PARTNERSHIP SHATTERS IN THE RING`],
    },
    rescue: 15, fixes: ['no_heat'],
    chants: [`TRAITOR!`, `WHY?!`],
  },
  {
    id: 'TW-02', name: 'Change of Heart', slot: 'twist',
    blurb: `The villain saves the hero from a beating.`,
    rarity: 'common', sources: ['starter'], tags: ['heartfelt', 'swerve', 'drama', 'spotlight'],
    beat: {
      kind: 'angle',
      title: `Change of heart: {villain} comes to {hero}'s aid`,
      text: [
        `A gang of outsiders swarmed {hero} in the corner, and {villain}, after weeks of being awful, waded in and cleared the ring. Then {villain} left without saying a word.`,
        `{villain} had a folding chair raised high over {hero}. Then {villain} looked at the crowd, looked at {hero}, and swung it at the outsiders instead.`,
      ],
      headline: [`{villain} SAVES {hero} FROM BEATING`, `SHOCK: {villain} COMES TO THE RESCUE`],
    },
    rescue: 15, fixes: ['personality_mismatch'],
    chants: [`ABOUT TIME!`, `WE KNEW IT!`],
  },
  {
    id: 'TW-03', name: 'The Mystery Partner', slot: 'twist',
    blurb: `"My partner tonight is..." and nobody saw it coming.`,
    rarity: 'uncommon', sources: ['tape'], tags: ['tag', 'swerve', 'entrance', 'spectacle'],
    beat: {
      kind: 'angle',
      title: `Mystery partner: {hero} brings a surprise`,
      text: [
        `"My partner tonight," said {hero}, "is..." The lights dipped, the music started, and a surprising wrestler walked through the curtain. {villain} checked the card and found no mention of this.`,
        `{villain} had planned for everyone on the roster. Then the curtain opened on someone nobody had counted, standing beside {hero} with a grin.`,
      ],
      headline: [`{hero} UNVEILS MYSTERY PARTNER`, `SURPRISE TEAMMATE STUNS {villain}`],
    },
    rescue: 20, fixes: ['weak_matches', 'fatigue'],
    chants: [`WHO IS IT?`, `ONE MORE!`],
  },
  {
    id: 'TW-04', name: 'Half a Mask', slot: 'twist',
    blurb: `A mask is pulled halfway up, and then the lights cut out.`,
    rarity: 'rare', sources: ['tape'], tags: ['mask', 'mystery', 'swerve', 'spectacle'],
    requires: [{ kind: 'masked' }],
    beat: {
      kind: 'angle',
      title: `Half a mask: lights out on {hero} and {villain}`,
      text: [
        `{villain} and {hero} wrestled over the mask until it was halfway up, chin showing. The lights cut out. When they flickered back, the mask was in place and nobody could swear to what they had seen.`,
        `A hand hooked under the mask and pulled it halfway up, and the whole house held its breath. Then the power blinked off. When it blinked on, the mask was snug and straight.`,
      ],
      headline: [`MASK PULLED HALFWAY BEFORE LIGHTS CUT OUT`, `WHAT DID THE CROWD REALLY SEE?`],
    },
    rescue: 25, fixes: ['no_heat'],
    chants: [`TAKE IT OFF!`, `LEAVE IT ON!`],
  },
  {
    id: 'TW-05', name: 'The Ref Bump', slot: 'twist',
    blurb: `Referee Mo goes down, and anything can happen.`,
    rarity: 'common', sources: ['starter'], tags: ['rules', 'comedy', 'schmozz', 'swerve'],
    beat: {
      kind: 'match',
      title: `Ref bump: Referee Mo takes a tumble`,
      text: [
        `Referee Mo took a stray elbow meant for someone else and sat down hard against the ropes, blinking at the ceiling. {hero} and {villain} paused for one polite second, then remembered what they were doing.`,
        `A big boot missed, and Referee Mo was the one who found it. He folded onto the mat like a lawn chair, and for several long moments the match had no officials and a lot of opportunity.`,
      ],
      headline: [`REFEREE MO DOWN IN THE MIDDLE OF THE MATCH`, `REF BUMP CHANGES EVERYTHING FOR {hero} AND {villain}`],
    },
    rescue: 15, fixes: ['weak_matches'],
    chants: [`REF'S DOWN!`, `COUNT! COUNT!`],
  },
  {
    id: 'TW-06', name: 'The Long-Lost Sibling', slot: 'twist',
    blurb: `"I have a sibling nobody here has met."`,
    rarity: 'rare', sources: ['fan_mail'], tags: ['family', 'swerve', 'outsider', 'drama'],
    beat: {
      kind: 'angle',
      title: `The long-lost sibling steps out for {hero}`,
      text: [
        `"There is someone the town has never met," said {hero}, "my own sibling." A stranger in a matching jacket walked through the curtain, and Pip, in the fourth row, held up a sign that said CALLED IT.`,
        `Gus Gravel read a telegram: a long-lost sibling of {villain} was on the way to Turnbuckle Alley. Five minutes later the curtain parted and a stranger in a matching jacket stepped through.`,
      ],
      headline: [`LONG-LOST SIBLING ARRIVES IN TURNBUCKLE ALLEY`, `{hero} REVEALS A SIBLING NOBODY KNEW`],
    },
    rescue: 25, fixes: ['fatigue', 'no_heat'],
    chants: [`FAMILY!`, `CALLED IT!`],
  },
  {
    id: 'TW-07', name: 'The Double Agent', slot: 'twist',
    blurb: `The hero's ally was working for the villain all along.`,
    rarity: 'rare', sources: ['tape'], tags: ['betrayal', 'swerve', 'mystery', 'faction'],
    beat: {
      kind: 'angle',
      title: `The double agent: {hero}'s ally was {villain}'s all along`,
      text: [
        `A folded letter slipped out of a jacket pocket in the middle of the ring. {hero}'s most trusted ally had been working for {villain} the whole time. The ally studied the ceiling.`,
        `Gus Gravel read the note aloud and the room went silent: the ally who had stood beside {hero} for weeks had been reporting to {villain} all along.`,
      ],
      headline: [`DOUBLE AGENT EXPOSED IN {hero}'S CORNER`, `{hero}'S ALLY WAS {villain}'S MAN ALL ALONG`],
    },
    rescue: 25, fixes: ['fatigue'],
    chants: [`LIAR!`, `I KNEW IT!`],
  },
  {
    id: 'TW-08', name: 'June Comes Back to Ringside', slot: 'twist',
    blurb: `June returns as Madame Midnight, jeweled fan and all, and picks a client.`,
    rarity: 'rare', sources: ['insider_story'], tags: ['entrance', 'legacy', 'spotlight', 'spectacle'],
    requires: [{ kind: 'hearts', who: 'june', min: 5 }],
    beat: {
      kind: 'angle',
      title: `Madame Midnight returns and picks a client`,
      text: [
        `The lights fell and a jeweled fan snapped open at the top of the aisle. Madame Midnight, long retired, swept down in a swirl of sequins and chose {hero} as her client. "Darling," she said, "this one will need me."`,
        `A jeweled fan, a trailing cloak, and the whole house on its feet: Madame Midnight was back. She looked over {hero} and {villain}, smiled, and took {villain}'s side.`,
      ],
      headline: [`MADAME MIDNIGHT RETURNS TO RINGSIDE`, `LEGENDARY MANAGER PICKS A CLIENT`],
    },
    rescue: 25, fixes: ['no_heat', 'fatigue'],
    chants: [`MADAME! MADAME!`, `WELCOME BACK!`],
  },
  {
    id: 'TW-09', name: 'The Worked Injury', slot: 'twist',
    blurb: `The hero "goes down" (in kayfabe only) and is helped out by Doc Halloran.`,
    rarity: 'common', sources: ['insider_story'], tags: ['injury_worked', 'drama', 'menace', 'solemn'],
    beat: {
      kind: 'angle',
      title: `{hero} goes down, and Doc Halloran rushes out`,
      text: [
        `{villain} drove {hero} into the corner post, and {hero} went down clutching a knee. Doc Halloran hurried out with his black bag, and two crew members helped {hero} to the back while the house sat silent.`,
        `The crowd stopped chanting when {hero} could not get up. Doc Halloran made his calm walk down the aisle, knelt, spoke quietly, and signaled the crew to help {hero} up.`,
      ],
      headline: [`{hero} HURT IN THE RING, DOC HALLORAN RUSHES OUT`, `{villain} SILENT AS {hero} IS HELPED TO THE BACK`],
    },
    rescue: 15, fixes: ['no_heat', 'stakes_dont_matter'],
    chants: [`GET UP!`, `HANG IN THERE!`],
  },
  {
    id: 'TW-10', name: 'The Fake Retirement', slot: 'twist',
    blurb: `A tearful farewell speech, and then a return two weeks later.`,
    rarity: 'uncommon', sources: ['tape'], tags: ['leaving', 'drama', 'swerve', 'heartfelt'],
    beat: {
      kind: 'promo',
      title: `{hero} announces a retirement`,
      text: [
        `{hero} stood alone in the ring, boots tied together, and said goodbye to the town. Half the room wept into their bingo cards. {villain} cried loudest, which seemed suspicious.`,
        `"I'm hanging 'em up," {hero} said into the microphone. Marigold dabbed her eyes, Gus Gravel read a poem, and {villain} slow-clapped and then, uncomfortably, stopped.`,
      ],
      headline: [`{hero} ANNOUNCES TEARFUL RETIREMENT`, `TURNBUCKLE ALLEY SAYS GOODBYE TO {hero}`],
    },
    rescue: 20, fixes: ['stakes_dont_matter'],
    chants: [`GOODBYE!`, `ONE MORE MATCH!`],
  },
  {
    id: 'TW-11', name: 'Swerve Within a Swerve', slot: 'twist',
    blurb: `The twist everyone guessed turns out to be a decoy.`,
    rarity: 'rare', sources: ['tape'], tags: ['swerve', 'mystery', 'spectacle', 'drama'],
    beat: {
      kind: 'angle',
      title: `A swerve within a swerve for {hero} and {villain}`,
      text: [
        `{villain} made the move the whole town had predicted, and the crowd congratulated itself for guessing. Then {villain} grinned. That had been the decoy, and the real surprise stepped out right behind it.`,
        `Pip's cardboard sign had said {hero} would be betrayed, and for ten minutes it looked correct. Then the betrayal came apart in the ring, and something else entirely was underneath.`,
      ],
      headline: [`THE TWIST EVERYONE GUESSED WAS A DECOY`, `{villain} OUTFOXES THE ENTIRE TOWN`],
    },
    rescue: 25, fixes: ['fatigue'],
    chants: [`NO WAY!`, `WHAT?!`],
  },
  {
    id: 'TW-12', name: 'The Mothman Descends', slot: 'twist',
    blurb: `At a night show the lights go out, and when they return the Mothman is in the ring.`,
    rarity: 'rare', sources: ['town'], tags: ['night', 'supernatural', 'mask', 'mystery', 'spectacle'],
    requires: [{ kind: 'mothman' }, { kind: 'night' }],
    beat: {
      kind: 'angle',
      title: `The Mothman descends on {hero} and {villain}`,
      text: [
        `The lights went out all at once. When they came back, the Mothman stood in the center of the ring, wings folded, perfectly still. He did not say a word. He looked at {villain}.`,
        `The pyro sputtered, the lights fell, and a soft flutter passed over the rafters. When the lights returned, the Mothman was in the ring, facing {hero}, entirely silent.`,
      ],
      headline: [`MOTHMAN APPEARS IN THE RING AT NIGHT SHOW`, `LIGHTS OUT, MOTHMAN IN: FANS STUNNED`],
    },
    rescue: 25, fixes: ['no_heat', 'fatigue'],
    chants: [`MOTH-MAN! MOTH-MAN!`, `WHOA!`],
  },
  {
    id: 'TW-13', name: 'The Heart-to-Heart', slot: 'twist',
    blurb: `The villain tells the crowd why, and it makes sense.`,
    rarity: 'uncommon', sources: ['insider_story'], tags: ['heartfelt', 'live_mic', 'drama', 'spotlight'],
    beat: {
      kind: 'promo',
      title: `The heart-to-heart: {villain} explains why`,
      text: [
        `{villain} took the microphone, put down the usual sneer, and told the crowd why. It was a short, plain, honest speech, and the room found it made a surprising amount of sense.`,
        `"Want to know why?" asked {villain}, and for once nobody booed. {villain} explained, quietly. Agnes Pickett nodded slowly and tucked Gertrude under one arm.`,
      ],
      headline: [`{villain} FINALLY EXPLAINS FEUD WITH {hero}`, `{villain}'S HONEST SPEECH SILENCES THE ARENA`],
    },
    rescue: 20, fixes: ['personality_mismatch', 'no_heat'],
    chants: [`TELL US!`, `WE'RE LISTENING!`],
  },
  {
    id: 'TW-14', name: 'The Belt Goes Missing', slot: 'twist',
    blurb: `The title vanishes from the trophy case.`,
    rarity: 'uncommon', sources: ['tape'], tags: ['title', 'mystery', 'crime_kayfabe', 'comedy'],
    requires: [{ kind: 'title' }],
    beat: {
      kind: 'angle',
      title: `The belt goes missing from the trophy case`,
      text: [
        `{title} was gone from the trophy case, with only a smudge of boot polish where it had been. Sheriff Bev opened her citation book. {hero} and {villain} each said it was the other.`,
        `The trophy case stood open and empty. Hank swore it had been locked, Referee Mo swore he had not touched it, and {hero} and {villain} blamed each other in unison.`,
      ],
      headline: [`TITLE BELT VANISHES FROM TROPHY CASE`, `SHERIFF BEV OPENS BELT THEFT INQUIRY`],
    },
    rescue: 20, fixes: ['stakes_dont_matter'],
    chants: [`WHERE IS IT?`, `FIND THE BELT!`],
  },
  {
    id: 'TW-15', name: 'Secret Training', slot: 'twist',
    blurb: `The hero disappears and comes back with a move nobody has seen in fifty years.`,
    rarity: 'uncommon', sources: ['dungeon'], tags: ['old_school', 'mat_classic', 'mystery', 'spotlight'],
    beat: {
      kind: 'angle',
      title: `Secret training: {hero} returns with something new`,
      text: [
        `{hero} vanished for days and came back with a move nobody in Turnbuckle Alley had seen in fifty years. Gus Gravel dug out a faded photograph and read the name on the back, twice.`,
        `After a week of silence, {hero} walked through the curtain, hit {villain} with an old-school hold that made the oldest fans stand up, and said nothing at all.`,
      ],
      headline: [`{hero} RETURNS FROM TRAINING WITH LOST HOLD`, `MOVE NOT SEEN IN FIFTY YEARS STUNS THE CROWD`],
    },
    rescue: 20, fixes: ['weak_matches'],
    chants: [`OLD SCHOOL!`, `DO IT AGAIN!`],
  },
  {
    id: 'TW-16', name: 'The Legend in the Corner', slot: 'twist',
    blurb: `Sweet Lou walks out and stands in someone's corner.`,
    rarity: 'rare', sources: ['insider_story'], tags: ['legacy', 'old_school', 'entrance', 'heartfelt'],
    requires: [{ kind: 'hearts', who: 'lou', min: 5 }],
    beat: {
      kind: 'angle',
      title: `Sweet Lou stands in {hero}'s corner`,
      text: [
        `The theme music stopped halfway through. Sweet Lou walked down the aisle in his old fishing hat, stood in {hero}'s corner, and crossed his arms. {villain} swallowed.`,
        `Nobody had seen Sweet Lou ringside in years. He ducked under the rope with a thermos in one hand and stood behind {villain}, who suddenly stood a little taller.`,
      ],
      headline: [`SWEET LOU RETURNS TO RINGSIDE`, `LEGEND STANDS IN {hero}'S CORNER`],
    },
    rescue: 25, fixes: ['no_heat', 'stakes_dont_matter'],
    chants: [`SWEET LOU!`, `LOU! LOU! LOU!`],
  },
  {
    id: 'TW-17', name: 'Enemy of My Enemy', slot: 'twist',
    blurb: `Two rivals team up against a bigger threat.`,
    rarity: 'uncommon', sources: ['starter'], tags: ['tag', 'outsider', 'swerve', 'drama'],
    beat: {
      kind: 'angle',
      title: `Enemy of my enemy: {hero} and {villain} team up`,
      text: [
        `A bigger threat appeared, and {hero} and {villain}, who could not stand each other, found themselves back to back in the ring. "This changes nothing," said {villain}. "Obviously," said {hero}.`,
        `The outsiders had it coming. Now {hero} and {villain} stood shoulder to shoulder, still scowling, ready to fight everyone but each other for exactly one night.`,
      ],
      headline: [`{hero} AND {villain} FORM UNEASY ALLIANCE`, `RIVALS UNITE AGAINST COMMON FOE`],
    },
    rescue: 20, fixes: ['personality_mismatch', 'fatigue'],
    chants: [`TEAM UP!`, `ONE NIGHT ONLY!`],
  },
  {
    id: 'TW-18', name: 'The Wrong Twin', slot: 'twist',
    blurb: `"That wasn't Bo. That was Buck."`,
    rarity: 'uncommon', sources: ['life_event'], tags: ['comedy', 'swerve', 'family', 'rules'],
    requires: [{ kind: 'twins' }],
    beat: {
      kind: 'angle',
      title: `The wrong twin: that wasn't Bo, that was Buck`,
      text: [
        `"That wasn't Bo," said Referee Mo, pointing. "That was Buck." Two identical Bruiser Twins stood in the ring with identical scowls, and {hero} had no idea which was which.`,
        `One Bruiser Twin had hit {villain}, and the other had left the ring. Hank's sign-in sheet proved it was Buck who came in and not Bo. Referee Mo read it twice.`,
      ],
      headline: [`WRONG TWIN IN THE RING, REFEREE SAYS`, `BO OR BUCK? HANK'S SIGN-IN SHEET HAS ANSWERS`],
    },
    rescue: 20, fixes: ['fatigue'],
    chants: [`WHICH ONE?`, `BO! BUCK!`],
  },
  {
    id: 'TW-19', name: 'The Audible', slot: 'twist',
    blurb: `Mid-match the finish changes, and only the two in the ring know why.`,
    rarity: 'legendary', sources: ['tape'], tags: ['mat_classic', 'old_school', 'swerve', 'spotlight'],
    requires: [{ kind: 'flag', flag: 'truth_revealed' }, { kind: 'never' }],
    beat: {
      kind: 'match',
      title: `The audible: {hero} and {villain} change the finish`,
      text: [
        `Mid-match, with no warning, the finish changed. Only {hero} and {villain} knew why, and neither was telling. They exchanged a single nod and went a different way.`,
        `{hero} whispered one word into {villain}'s ear in the middle of a headlock, and the match changed course. Gus Gravel said it had to be seen to be believed.`,
      ],
      headline: [`MATCH CHANGES COURSE IN THE MIDDLE OF THE RING`, `{hero} AND {villain} SHARE A SECRET`],
    },
    rescue: 35, fixes: ['weak_matches', 'too_long'],
    chants: [`WHAT WAS THAT?`, `OLD SCHOOL!`],
  },
];

// ------------------------------------------------------------------ stakes (15)

const STAKES: CardDef[] = [
  {
    id: 'ST-01', name: 'The Title', slot: 'stakes',
    blurb: `A championship changes hands, or doesn't.`,
    rarity: 'common', sources: ['starter'], tags: ['title', 'drama', 'spotlight', 'rules'],
    requires: [{ kind: 'title' }],
    stakes: {
      outcome: 'title',
      declare: [
        `The Commissioner announced that {title} was on the line, and Hank's breakaway table crumpled the instant {hero} and {villain} signed. Hank called it a new record.`,
        `{hero} and {villain} stood nose to nose at the signing table, each holding a pen. {title} would be decided, the Commissioner said, and the table collapsed to underline it.`,
      ],
      resolve: [
        `{title} now belongs to {winner}, polished and whole, while {loser} watched from the apron.`,
        `{winner} holds {title} high, and {loser} had to settle for a handshake.`,
      ],
      headline: [`{winner} CLAIMS {title}`, `{loser} FALLS SHORT IN TITLE BID`],
    },
    chants: [`NEW CHAMP!`, `STILL CHAMP!`],
  },
  {
    id: 'ST-02', name: 'Bragging Rights', slot: 'stakes',
    blurb: `Pride. Just pride. It's plenty.`,
    rarity: 'common', sources: ['starter'], tags: ['comedy', 'hometown', 'rules', 'public'],
    stakes: {
      outcome: 'pride',
      declare: [
        `"Nothing is on the line," said {villain}, "except being right." {hero} said that was plenty, and the whole house agreed.`,
        `{hero} and {villain} shook on it at ringside: no belt, no prize, just bragging rights, and Turnbuckle Alley would remember who won.`,
      ],
      resolve: [
        `{winner} earns bragging rights, and {loser} will be reminded of it at the Hot Tag for months.`,
        `Bragging rights go to {winner}, and a certain stool at the Hot Tag counter has been quietly reassigned.`,
      ],
      headline: [`{winner} CLAIMS BRAGGING RIGHTS OVER {loser}`, `PRIDE ON THE LINE: {winner} TAKES IT`],
    },
    chants: [`WE WERE RIGHT!`, `PRIDE! PRIDE!`],
  },
  {
    id: 'ST-03', name: 'Loser Leaves Town', slot: 'stakes',
    blurb: `The loser leaves the map for a few weeks. Business covered.`,
    rarity: 'rare', sources: ['tape'], tags: ['leaving', 'drama', 'high_risk', 'hometown'],
    requires: [{ kind: 'history' }],
    stakes: {
      outcome: 'leave_town',
      declare: [
        `The Commissioner read the terms aloud: the loser leaves Turnbuckle Alley, for a while. {hero} signed. {villain} signed. Hank's table broke, and nobody laughed.`,
        `"Loser leaves town," said {villain}, and {hero} nodded. The Hot Tag Diner went quiet, and somewhere in the back a spoon hit the floor.`,
      ],
      resolve: [
        `As agreed, {loser} left Turnbuckle Alley on the morning bus with one suitcase, and the town felt the gap right away.`,
        `{loser} kept the promise and boarded the bus out of town, while {winner} watched it go and did not smile.`,
      ],
      headline: [`{loser} MUST LEAVE TURNBUCKLE ALLEY`, `{loser} BOARDS MORNING BUS AFTER DEFEAT`],
    },
    chants: [`DON'T GO!`, `COME BACK SOON!`],
  },
  {
    id: 'ST-04', name: 'Mask vs. Mask', slot: 'stakes',
    blurb: `Both masks hang above the ring.`,
    rarity: 'legendary', sources: ['tape'], tags: ['mask', 'high_risk', 'drama', 'spotlight', 'solemn'],
    requires: [{ kind: 'never' }],
    stakes: {
      outcome: 'mask',
      declare: [
        `Both masks hung from a single hook above the ring while {hero} and {villain} signed. Hank's table collapsed, and the masks swayed gently overhead.`,
        `"Mask for mask," said {hero}, and {villain} signed. Marigold carried two velvet cushions to ringside and set them down without a word.`,
      ],
      resolve: [
        `{loser} surrendered the mask to {winner} with a bow, and the whole house stood to applaud both.`,
        `The mask now belongs to {winner}, and {loser} left the ring under a respectful hush with head held high.`,
      ],
      headline: [`TWO MASKS ON THE LINE: {winner} PREVAILS`, `{loser} SURRENDERS MASK TO {winner}`],
    },
    chants: [`MASK! MASK!`, `TAKE A BOW!`],
  },
  {
    id: 'ST-05', name: 'Hair vs. Hair', slot: 'stakes',
    blurb: `Clippers on a velvet pillow.`,
    rarity: 'rare', sources: ['tape'], tags: ['hair', 'spectacle', 'drama', 'public'],
    stakes: {
      outcome: 'hair',
      declare: [
        `A pair of clippers lay on a velvet pillow in the center of the ring while {hero} and {villain} signed the papers. Marigold stood nearby with scissors in her apron.`,
        `Hank's table broke on cue. "Hair versus hair," said the Commissioner, and {hero} and {villain} nodded, each pretending not to be a little nervous.`,
      ],
      resolve: [
        `{loser}'s hair came off in three neat passes of Marigold's clippers, to applause from the whole house, and {winner} held the velvet pillow aloft like a trophy.`,
        `True to the terms, {loser} took the barber chair at center ring and let {winner} do the honors, with a drumroll from Gus Gravel.`,
      ],
      headline: [`{loser} LOSES HAIR TO {winner} IN THE RING`, `HAIR VS. HAIR ENDS WITH CLIPPERS`],
    },
    chants: [`CLIP! CLIP! CLIP!`, `HAIR! HAIR!`],
  },
  {
    id: 'ST-06', name: 'Career on the Line', slot: 'stakes',
    blurb: `Lose the match, and the boots get hung up for good.`,
    rarity: 'rare', sources: ['life_event'], tags: ['career_ending', 'drama', 'solemn', 'high_risk', 'heartfelt'],
    requires: [{ kind: 'never' }],
    stakes: {
      outcome: 'career',
      declare: [
        `"If I lose," said {hero}, "I hang up the boots for good." The house went so quiet that the coffee urn could be heard percolating.`,
        `{hero} laid a pair of laced boots on the signing table. "If I lose, they stay here." {villain} said nothing and, for once, did not smile.`,
      ],
      resolve: [
        `{loser} laced one last pair of boots and hung them from the corner post, and Turnbuckle Alley applauded for a full minute.`,
        `The career was on the line, and {loser} paid it: the boots stayed on the corner post, and {winner} was the first to bow.`,
      ],
      headline: [`CAREER ON THE LINE: {winner} DEFEATS {loser}`, `{loser} HANGS UP THE BOOTS`],
    },
    chants: [`FAREWELL!`, `ONE MORE MATCH!`],
  },
  {
    id: 'ST-07', name: 'Loser Wears the Chicken Suit', slot: 'stakes',
    blurb: `Marigold's finest poultry costume, worn for a full week.`,
    rarity: 'common', sources: ['insider_story'], tags: ['comedy', 'humiliation_light', 'whimsy', 'public'],
    stakes: {
      outcome: 'costume',
      declare: [
        `Marigold wheeled out a rolling rack: one magnificent feathered poultry costume, size adjustable. The loser, she announced, would wear it for a week of shows and errands.`,
        `Hank's table broke under the weight of the costume as Marigold set it down. "Loser wears the chicken suit," she said. {hero} and {villain} both signed immediately.`,
      ],
      resolve: [
        `{loser} will wear Marigold's finest chicken costume to every show and errand for a week, and {winner} has been named honorary head of the henhouse.`,
        `The feathers are out: {loser} strutted up the aisle in the full suit to a standing ovation from the whole house.`,
      ],
      headline: [`{loser} MUST WEAR THE CHICKEN SUIT`, `FEATHERS FLY: {winner} DEFEATS {loser}`],
    },
    chants: [`BAWK BAWK!`, `CHICKEN! CHICKEN!`],
  },
  {
    id: 'ST-08', name: 'Loser Buys the Town Pie', slot: 'stakes',
    blurb: `The loser pays for pie for everyone at the Hot Tag.`,
    rarity: 'common', sources: ['town'], tags: ['food', 'comedy', 'hometown', 'public'],
    stakes: {
      outcome: 'pie',
      declare: [
        `{hero} and {villain} shook on it at the Hot Tag counter: the loser buys pie for everyone in the diner. The cook rang the bell, and somebody cheered.`,
        `Hank's table collapsed during the signing, but the handshake held: loser buys the town pie. The Hot Tag's pie case was inspected and found to be full.`,
      ],
      resolve: [
        `{loser} bought a slice for every customer in the Hot Tag Diner, and the crowd made sure {winner} got the first piece.`,
        `{loser} opened a wallet at the Hot Tag counter and paid for pie all around, to a round of applause and a clink of forks.`,
      ],
      headline: [`{loser} BUYS PIE FOR THE WHOLE TOWN`, `LOSER PAYS FOR PIE AT HOT TAG DINER`],
    },
    chants: [`PIE! PIE! PIE!`, `PAY UP!`],
  },
  {
    id: 'ST-09', name: 'Custody', slot: 'stakes',
    blurb: `The winner gets the mascot, the jacket, the parking space or the raccoon.`,
    rarity: 'uncommon', sources: ['town'], tags: ['comedy', 'hometown', 'rules', 'public'],
    stakes: {
      outcome: 'custody',
      declare: [
        `{hero} and {villain} both claimed custody of the lucky jacket, which hung over a folding chair in the center of the ring. Hank's table broke, and the jacket did not budge.`,
        `The good parking space behind the Sportatorium had been the subject of a feud for years. Now {hero} and {villain} would settle it, with Sheriff Bev's citation book as witness.`,
      ],
      resolve: [
        `Custody of the disputed prize went to {winner}, and {loser} shook hands and asked for visiting hours.`,
        `{winner} takes custody of the prize, signed and stamped in Sheriff Bev's citation book, while {loser} gave a gracious nod.`,
      ],
      headline: [`{winner} WINS CUSTODY BATTLE IN THE RING`, `CUSTODY DISPUTE SETTLED BY {winner}`],
    },
    chants: [`GIVE IT UP!`, `FINDERS KEEPERS!`],
  },
  {
    id: 'ST-10', name: 'The Main Event Spot', slot: 'stakes',
    blurb: `The winner headlines the next supershow.`,
    rarity: 'uncommon', sources: ['insider_story'], tags: ['spotlight', 'supershow', 'rules', 'drama'],
    stakes: {
      outcome: 'main_event',
      declare: [
        `The Commissioner announced that the main event of the next supershow had one open spot, and {hero} and {villain} would fight for it. Hank's table broke on cue.`,
        `"One spot in the main event," said the Commissioner. "Two names." {hero} and {villain} looked at each other and signed without reading the fine print.`,
      ],
      resolve: [
        `{winner} will headline the next supershow, and {loser} has been promised the best seat in the house.`,
        `The main event spot is {winner}'s, and {loser} walked to the back with a long look at the rafters.`,
      ],
      headline: [`{winner} EARNS MAIN EVENT SPOT AT NEXT SUPERSHOW`, `{winner} WINS HEADLINER SLOT, {loser} SITS OUT`],
    },
    chants: [`MAIN EVENT!`, `HEADLINER!`],
  },
  {
    id: 'ST-11', name: 'The Family Name', slot: 'stakes',
    blurb: `The winner earns the right to a family name, move or robe.`,
    rarity: 'rare', sources: ['insider_story'], tags: ['legacy', 'family', 'heartfelt', 'drama'],
    stakes: {
      outcome: 'family_name',
      declare: [
        `{hero} and {villain} stood on either side of a framed photograph of an old tag team and agreed: the winner would earn the right to carry the family name.`,
        `Hank's table broke, and an old family robe was draped over the broken pieces. "Whoever wins," said the Commissioner, "wears it."`,
      ],
      resolve: [
        `{winner} earned the family name, and the whole town watched it being handed over.`,
        `The family name, move and robe now belong to {winner}, and {loser} stood and clapped.`,
      ],
      headline: [`{winner} EARNS THE FAMILY NAME`, `FAMILY LEGACY GOES TO {winner} AFTER MATCH`],
    },
    chants: [`FAMILY! FAMILY!`, `CARRY IT ON!`],
  },
  {
    id: 'ST-12', name: 'The Apology', slot: 'stakes',
    blurb: `The loser apologizes in the ring, into Gus's microphone, and means it.`,
    rarity: 'common', sources: ['starter'], tags: ['heartfelt', 'live_mic', 'drama', 'public'],
    stakes: {
      outcome: 'apology',
      declare: [
        `{villain} signed on the dotted line, and Hank's table collapsed, as always. The loser would apologize in the ring, into Gus Gravel's microphone, and mean it.`,
        `"Loser apologizes," said {hero}, "out loud, with feeling." {villain} agreed, and the table collapsed under the weight of the promise.`,
      ],
      resolve: [
        `{loser} took Gus Gravel's microphone and apologized, plainly and sincerely, and the crowd decided to forgive within seconds.`,
        `{loser} said the words into the microphone and meant them, and {winner} nodded once, which from {winner} was practically a hug.`,
      ],
      headline: [`{loser} OFFERS AN APOLOGY TO {winner}`, `{loser} APOLOGIZES ON THE MICROPHONE AFTER LOSS`],
    },
    chants: [`SAY IT!`, `APOLOGIZE!`],
  },
  {
    id: 'ST-13', name: `The Town's Honor`, slot: 'stakes',
    blurb: `Turnbuckle Alley's pride against an outsider.`,
    rarity: 'uncommon', sources: ['town'], tags: ['hometown', 'outsider', 'public', 'spotlight'],
    stakes: {
      outcome: 'town_honor',
      declare: [
        `Mayor Delphine stood on a folding chair and declared that the honor of Turnbuckle Alley was on the line. {hero} and {villain} signed, the table broke, and the town cheered anyway.`,
        `"This is for the town," Mayor Delphine said, handing {hero} and {villain} each a ribbon. "The whole town's honor."`,
      ],
      resolve: [
        `{winner} carried the honor of Turnbuckle Alley, and Mayor Delphine pinned a ribbon on the spot.`,
        `The town's honor is safe in {winner}'s hands, and {loser} was given a casserole for the road.`,
      ],
      headline: [`TOWN'S HONOR SETTLED: {winner} VICTORIOUS`, `MAYOR DELPHINE HONORS {winner} AFTER WIN`],
    },
    chants: [`TURNBUCKLE ALLEY!`, `OUR TOWN!`],
  },
  {
    id: 'ST-14', name: 'Story Hour', slot: 'stakes',
    blurb: `The loser reads at the library's Saturday story hour.`,
    rarity: 'uncommon', sources: ['insider_story'], tags: ['kids_spotlight', 'comedy', 'heartfelt', 'hometown'],
    stakes: {
      outcome: 'story_hour',
      declare: [
        `At the library desk, Big Earl set out a sign-up sheet: the loser reads at Saturday story hour. {hero} and {villain} both signed in pencil.`,
        `{hero} and {villain} agreed in front of the whole house: the loser reads picture books to the children at the library. Big Earl beamed.`,
      ],
      resolve: [
        `{loser} sat in the little chair at the library on Saturday and read picture books to a delighted circle of children, with feeling and funny voices.`,
        `{loser} read at story hour as promised, and {winner} brought a snack for the kids, which did not go unnoticed.`,
      ],
      headline: [`{loser} MUST READ AT LIBRARY STORY HOUR`, `STORY HOUR GETS A SPECIAL GUEST: {loser}`],
    },
    chants: [`READ! READ! READ!`, `ONCE UPON A TIME!`],
  },
  {
    id: 'ST-15', name: 'The Building', slot: 'stakes',
    blurb: `The losing promotion stops running shows in the county.`,
    rarity: 'legendary', sources: ['life_event'], tags: ['faction', 'drama', 'high_risk', 'solemn'],
    requires: [{ kind: 'never' }],
    stakes: {
      outcome: 'building',
      declare: [
        `Hank's table did not break this time. {hero} and {villain} signed the final contract quietly: the losing promotion would stop running shows in the county.`,
        `The Commissioner read the terms in a level voice: one promotion would remain in the county, and the other would fold its chairs. {hero} signed. {villain} signed.`,
      ],
      resolve: [
        `{loser}'s promotion folded its tent and its folding chairs, and the county would not see that name on the marquee again.`,
        `{winner}'s promotion will run the county alone, and the whole house stood to applaud {loser} on the way out the door.`,
      ],
      headline: [`RIVAL PROMOTION CLOSES AFTER FINAL SHOWDOWN`, `{winner} WINS THE COUNTY, {loser} FOLDS ITS TENT`],
    },
    chants: [`WHOLE COUNTY!`, `BRAVO!`],
  },
];

// ------------------------------------------------------------------ payoffs (24)

const PAYOFFS: CardDef[] = [
  {
    id: 'PO-01', name: 'Singles Match', slot: 'payoff',
    blurb: `One on one. A classic.`,
    rarity: 'common', sources: ['starter'], tags: ['mat_classic', 'clean_finish', 'rules', 'old_school'],
    payoff: {
      stip: 'standard',
      title: `Singles: {hero} vs. {villain}`,
      text: [
        `{hero} and {villain} traded holds for twelve minutes in {venue}, a match the old-timers in the back called textbook. {winner} hit the finisher and Referee Mo counted three over {loser}.`,
        `Nothing fancy and nothing cheap: {winner} and {loser} wrestled one hard singles match from bell to bell, and {winner} won it clean in the middle of the ring.`,
      ],
      headline: [`{winner} DEFEATS {loser} IN CLEAN SINGLES CLASSIC`, `{winner} BEATS {loser} IN TEXTBOOK MATCH`],
    },
    chants: [`THIS IS WRESTLING!`, `LET'S GO!`],
  },
  {
    id: 'PO-02', name: 'Tag Team Match', slot: 'payoff',
    blurb: `Two on two, hot tags included.`,
    rarity: 'common', sources: ['starter'], tags: ['tag', 'mat_classic', 'clean_finish', 'spectacle'],
    payoff: {
      stip: 'tag',
      title: `Tag Team: {hero}'s side vs. {villain}'s side`,
      text: [
        `Hot tags, desperate crawls and a long wait on the apron: {winner}'s team finally scored the pin on {loser}'s team in the middle of the ring, and the crowd came off its folding chairs.`,
        `Both teams worked every corner of the ring, and the hot tag brought the house down. {winner}'s side took the win over {loser}'s side with a perfectly timed double move.`,
      ],
      headline: [`{winner}'S TEAM TOPS {loser}'S IN TAG THRILLER`, `HOT TAG DECIDES IT FOR {winner}'S SIDE`],
    },
    chants: [`TAG! TAG! TAG!`, `HOT TAG!`],
  },
  {
    id: 'PO-03', name: 'Two Out of Three Falls', slot: 'payoff',
    blurb: `The old-timers' favorite: a story inside a story.`,
    rarity: 'common', sources: ['tape'], tags: ['mat_classic', 'old_school', 'slow_build', 'clean_finish'],
    payoff: {
      stip: 'two-of-three',
      title: `Two Out of Three Falls: {hero} vs. {villain}`,
      text: [
        `Three falls, three chapters. {loser} struck first, {winner} evened it up, and the deciding fall went eleven minutes before {winner} finally got the pin.`,
        `The old-timers' favorite: {winner} took the first fall, {loser} took the second, and the third was a war of attrition that {winner} won with a single pinfall.`,
      ],
      headline: [`{winner} TAKES TWO FALLS TO ONE OVER {loser}`, `FALLS SERIES GOES THE DISTANCE: {winner} WINS`],
    },
    chants: [`ONE MORE FALL!`, `TWO OUT OF THREE!`],
  },
  {
    id: 'PO-04', name: 'No Disqualification', slot: 'payoff',
    blurb: `Anything goes, within Birdie's rules. Folding chairs come into play.`,
    rarity: 'common', sources: ['starter'], tags: ['hardcore', 'violence_mid', 'schmozz', 'rules'],
    payoff: {
      stip: 'no-dq',
      title: `No Disqualification: {hero} vs. {villain}`,
      text: [
        `Referee Mo put his whistle in his pocket and the folding chairs came out. After a long, noisy fight, {winner} pinned {loser} on a pile of chairs that Hank had inspected beforehand.`,
        `Birdie's rules: anything goes, within reason. {winner} and {loser} used every folding chair in the building, and {winner} finally took the three-count.`,
      ],
      headline: [`ANYTHING GOES: {winner} OUTLASTS {loser}`, `CHAIRS FLY AS {winner} BEATS {loser}`],
    },
    chants: [`CHAIRS! CHAIRS!`, `NO DQ!`],
  },
  {
    id: 'PO-05', name: 'Steel Cage', slot: 'payoff',
    blurb: `Escape the cage Hank built.`,
    rarity: 'uncommon', sources: ['insider_story'], tags: ['cage', 'high_risk', 'spectacle', 'hardcore'],
    requires: [{ kind: 'saturday' }],
    payoff: {
      stip: 'cage',
      title: `Steel Cage: {hero} vs. {villain}`,
      text: [
        `Hank locked the door himself as safety inspector. {winner} climbed over the top and dropped to the floor first, with {loser} a moment behind, and Hank checked every bolt afterward.`,
        `The cage Hank built stood over the ring, and the fight went up the walls. {winner} was first over the top and out, and {loser} landed on the floor right behind.`,
      ],
      headline: [`{winner} ESCAPES THE CAGE, BEATS {loser}`, `HANK'S CAGE HOLDS AS {winner} CLIMBS OUT FIRST`],
    },
    chants: [`CLIMB! CLIMB!`, `GET OUT!`],
  },
  {
    id: 'PO-06', name: 'Ladder Match', slot: 'payoff',
    blurb: `The prize hangs from the rafters.`,
    rarity: 'uncommon', sources: ['tape'], tags: ['high_risk', 'spectacle', 'hardcore', 'mat_classic'],
    requires: [{ kind: 'saturday' }],
    payoff: {
      stip: 'ladder',
      title: `Ladder Match: {hero} vs. {villain}`,
      text: [
        `The prize swung from the rafters while two ladders wobbled in the ring. {winner} reached the top rung first and unhooked it, and {loser} was left holding the bottom of the ladder.`,
        `Ladders, ropes and a long reach: {winner} climbed to the prize and brought it down, with {loser} clinging to the side of the ladder a half-step too late.`,
      ],
      headline: [`{winner} CLIMBS TO VICTORY OVER {loser}`, `LADDER MATCH GOES TO {winner}`],
    },
    chants: [`CLIMB! CLIMB!`, `GRAB IT!`],
  },
  {
    id: 'PO-07', name: 'Lumberjack Match', slot: 'payoff',
    blurb: `The whole locker room surrounds the ring.`,
    rarity: 'uncommon', sources: ['tape'], tags: ['schmozz', 'spectacle', 'faction', 'violence_low'],
    payoff: {
      stip: 'lumberjack',
      title: `Lumberjack Match: {hero} vs. {villain}`,
      text: [
        `The whole locker room ringed the ring, arms folded. {loser} tumbled over the top rope and was rolled back in, and {winner} finally pinned {loser} in front of the entire roster.`,
        `A circle of wrestlers surrounded the ring so neither could escape. {winner} threw {loser} to the floor, got tossed back in by the roster, and finished it off with a pin.`,
      ],
      headline: [`THE WHOLE ROSTER WATCHES {winner} BEAT {loser}`, `LUMBERJACK MATCH ENDS IN {winner}'S FAVOR`],
    },
    chants: [`NO ESCAPE!`, `ROLL HIM IN!`],
  },
  {
    id: 'PO-08', name: 'Say Uncle', slot: 'payoff',
    blurb: `No pins. Somebody has to say it into the microphone.`,
    rarity: 'uncommon', sources: ['insider_story'], tags: ['rules', 'mat_classic', 'old_school', 'live_mic'],
    payoff: {
      stip: 'say-uncle',
      title: `Say Uncle: {hero} vs. {villain}`,
      text: [
        `No pins, no counts, only the word. {winner} locked in a hold and held it until {loser} reached for Gus Gravel's microphone and said "Uncle" in a small, honest voice.`,
        `The rules were simple: say it into the microphone. {winner} applied the hold, {loser} struggled for nearly a minute, and then said "Uncle" to a cheering house.`,
      ],
      headline: [`{loser} SAYS UNCLE TO {winner}`, `{winner} FORCES {loser} TO SAY UNCLE`],
    },
    chants: [`SAY IT!`, `UNCLE! UNCLE!`],
  },
  {
    id: 'PO-09', name: 'Last One Standing', slot: 'payoff',
    blurb: `Stay on both feet through a ten count.`,
    rarity: 'rare', sources: ['tape'], tags: ['violence_mid', 'high_risk', 'spectacle', 'mat_classic'],
    requires: [{ kind: 'saturday' }],
    payoff: {
      stip: 'last-standing',
      title: `Last One Standing: {hero} vs. {villain}`,
      text: [
        `After a long ten count, {loser} was still on the mat and {winner} was still on both feet, swaying but upright, with the whole house counting aloud.`,
        `Down, up, down, up: {winner} and {loser} kept getting back to their feet until, at last, only {winner} could answer the ten count.`,
      ],
      headline: [`{winner} IS LAST ONE STANDING OVER {loser}`, `TEN COUNT ENDS IT: {winner} DEFEATS {loser}`],
    },
    chants: [`GET UP!`, `ONE! TWO! THREE!`],
  },
  {
    id: 'PO-10', name: 'Battle Royal', slot: 'payoff',
    blurb: `Over the top rope and out.`,
    rarity: 'common', sources: ['starter'], tags: ['schmozz', 'spectacle', 'faction', 'comedy'],
    requires: [{ kind: 'participants', min: 6 }],
    payoff: {
      stip: 'battle-royal',
      title: `Battle Royal: {hero}, {villain} and the field`,
      text: [
        `Wrestlers flew over the top rope like laundry until only {winner} and {loser} remained, and {winner} sent {loser} over the top and out for the win.`,
        `A crowded ring, a flurry of elbows and eliminations galore. {winner} outlasted the field, and {loser} was the last one to go over the top rope.`,
      ],
      headline: [`{winner} WINS BATTLE ROYAL, {loser} LAST OUT`, `LAST ONE IN THE RING: {winner} OUTLASTS THE FIELD`],
    },
    chants: [`OVER THE TOP!`, `OUT! OUT! OUT!`],
  },
  {
    id: 'PO-11', name: 'Pie-Eating Contest', slot: 'payoff',
    blurb: `Tiny bakes, the contestants eat and the crowd chants. No pie in faces.`,
    rarity: 'common', sources: ['town'], tags: ['food', 'comedy', 'whimsy', 'public'],
    payoff: {
      stip: 'pie-eating',
      title: `Pie-Eating Contest: {hero} vs. {villain}`,
      text: [
        `Tiny's pies lined a long table while the crowd chanted. {winner} cleaned the last plate in nine minutes flat, a fork's width ahead of {loser}, and not one pie landed on a face.`,
        `A table of Tiny's finest, a crowd on its feet and a stopwatch. {winner} finished the final slice first, {loser} had one bite left, and the crowd gave both a hand.`,
      ],
      headline: [`TINY'S PIES DECIDE IT: {winner} TOPS {loser}`, `{winner} WINS PIE-EATING CONTEST`],
    },
    chants: [`PIE! PIE! PIE!`, `EAT! EAT! EAT!`],
  },
  {
    id: 'PO-12', name: 'Bingo Brawl', slot: 'payoff',
    blurb: `Wednesdays only. The fight spills into bingo, and the winner yells "BINGO."`,
    rarity: 'uncommon', sources: ['town'], tags: ['comedy', 'hometown', 'schmozz', 'whimsy'],
    requires: [{ kind: 'vfw' }],
    payoff: {
      stip: 'bingo-brawl',
      title: `Bingo Brawl: {hero} vs. {villain}`,
      text: [
        `The fight spilled out of the ring and into post-show bingo, folding chairs and dabbers everywhere. {winner} pinned {loser} between B-9 and N-34, then leaped up and yelled "BINGO!" Agnes checked the card twice.`,
        `Between the numbers, the brawl wound through the folding chairs of the VFW Hall. {winner} held {loser} down for the three-count and called "BINGO!" with a winning card in hand.`,
      ],
      headline: [`BINGO BRAWL: {winner} BEATS {loser}, CALLS BINGO`, `{winner} WINS AT THE VFW AND YELLS "BINGO!"`],
    },
    chants: [`BINGO! BINGO!`, `B-9! B-9!`],
  },
  {
    id: 'PO-13', name: 'Lights Out', slot: 'payoff',
    blurb: `Night only. A match in the dark with glow-stick ropes.`,
    rarity: 'rare', sources: ['tape'], tags: ['night', 'spectacle', 'menace', 'violence_low'],
    requires: [{ kind: 'night' }, { kind: 'saturday' }],
    payoff: {
      stip: 'lights-out',
      title: `Lights Out: {hero} vs. {villain}`,
      text: [
        `The lights went out, leaving only the green glow of the glow-stick ropes and the shadows of two wrestlers. When the lights returned, {winner} stood over {loser}.`,
        `In the dark, nothing could be seen but flickers of green and the sound of boots on canvas. A bell rang, the lights came on, and {winner} had the pin on {loser}.`,
      ],
      headline: [`LIGHTS OUT: {winner} BEATS {loser} IN THE DARK`, `GLOW-STICK ROPES LIGHT {winner}'S WIN`],
    },
    chants: [`LIGHTS! LIGHTS!`, `OOOOH!`],
  },
  {
    id: 'PO-14', name: `Wanda's Honey Pot`, slot: 'payoff',
    blurb: `At the fairgrounds, the first to bring Wanda her honey pot wins.`,
    rarity: 'rare', sources: ['town'], tags: ['animal', 'whimsy', 'spectacle', 'supershow', 'comedy'],
    requires: [{ kind: 'supershow', season: 1 }],
    payoff: {
      stip: 'honey-pot',
      title: `Wanda's Honey Pot: {hero} vs. {villain}`,
      text: [
        `Wanda the polite bear waited in her lawn chair at the far end of the fairgrounds. {winner} reached her first with the honey pot while {loser} was still crossing the midway, and Wanda stood, bowed to the winner and accepted the honey with perfect manners.`,
        `Across the fairgrounds, past hay bales and a funnel cake stand, {winner} outran {loser} to Wanda's chair. She bowed, the crowd applauded, and Wanda enjoyed the honey very much.`,
      ],
      headline: [`{winner} DELIVERS WANDA'S HONEY POT FIRST`, `WANDA BOWS TO {winner} AT FAIRGROUNDS FURY`],
    },
    chants: [`BEAR! BEAR! BEAR!`, `HONEY! HONEY!`],
  },
  {
    id: 'PO-15', name: 'Object on a Pole', slot: 'payoff',
    blurb: `A pickle jar, a contract or a lucky boot. First to grab it wins.`,
    rarity: 'common', sources: ['starter'], tags: ['comedy', 'whimsy', 'spectacle', 'rules'],
    payoff: {
      stip: 'object-pole',
      title: `Object on a Pole: {hero} vs. {villain}`,
      text: [
        `A pickle jar sat atop a tall pole. {winner} reached it first, with {loser} grabbing at an ankle a half-second too late. The jar stayed whole, and so did everyone's dignity.`,
        `A lucky boot hung at the top of the pole. {winner} and {loser} fought up and down the pole until {winner} yanked the boot free and held it high.`,
      ],
      headline: [`{winner} GRABS THE PRIZE ATOP THE POLE`, `{winner} OUTCLIMBS {loser} FOR THE PICKLE JAR`],
    },
    chants: [`GRAB IT!`, `HIGHER! HIGHER!`],
  },
  {
    id: 'PO-16', name: 'Pop Quiz Match', slot: 'payoff',
    blurb: `Between falls, Professor Pinfall asks a question. Right answers unlock a move.`,
    rarity: 'uncommon', sources: ['insider_story'], tags: ['comedy', 'rules', 'mat_classic', 'whimsy'],
    payoff: {
      stip: 'pop-quiz',
      title: `Pop Quiz Match: {hero} vs. {villain}`,
      text: [
        `Between falls, Professor Pinfall adjusted his glasses and asked questions about tag-team history. {winner} knew every answer and unlocked a signature move, which was enough to beat {loser}.`,
        `Professor Pinfall quizzed both wrestlers on rule books and champions. {winner} answered correctly each time, unlocked the signature move, and pinned {loser} in the third fall.`,
      ],
      headline: [`{winner} ACES POP QUIZ MATCH, BEATS {loser}`, `PROFESSOR PINFALL'S QUIZ DECIDES IT FOR {winner}`],
    },
    chants: [`ANSWER! ANSWER!`, `PROFESSOR!`],
  },
  {
    id: 'PO-17', name: 'Hardware Store Brawl', slot: 'payoff',
    blurb: `After hours at Steel Chair Hardware, with fans in folding chairs in the aisles.`,
    rarity: 'rare', sources: ['life_event'], tags: ['hardcore', 'spectacle', 'supershow', 'hometown', 'comedy'],
    requires: [{ kind: 'twins' }, { kind: 'supershow' }],
    payoff: {
      stip: 'hardware-brawl',
      title: `Hardware Store Brawl: {hero} vs. {villain}`,
      text: [
        `After closing time at Steel Chair Hardware, the fight went up and down the aisles with fans in folding chairs between the paint cans and garden hoses. {winner} won over {loser}, and the Bruiser Twins locked up afterward.`,
        `Between the lumber and the lawn furniture, {winner} and {loser} fought across Steel Chair Hardware. The Bruiser Twins kept score, and {winner} took the final fall in the paint aisle.`,
      ],
      headline: [`{winner} WINS HARDWARE STORE BRAWL OVER {loser}`, `STEEL CHAIR HARDWARE HOSTS WILD AFTER-HOURS MATCH`],
    },
    chants: [`AISLE FIVE!`, `HARDWARE! HARDWARE!`],
  },
  {
    id: 'PO-18', name: 'Iron Hour', slot: 'payoff',
    blurb: `The most falls in sixty minutes wins.`,
    rarity: 'rare', sources: ['tape'], tags: ['mat_classic', 'slow_build', 'old_school', 'clean_finish'],
    requires: [{ kind: 'saturday' }],
    payoff: {
      stip: 'iron-hour',
      title: `Iron Hour: {hero} vs. {villain}`,
      text: [
        `Sixty minutes on the clock and every second counted aloud. When the hour was up, {winner} led {loser} by a single fall, five to four.`,
        `An hour of falls, breathers and more falls. When Gus Gravel read the final tally, {winner} had edged {loser} on the clock by one fall.`,
      ],
      headline: [`IRON HOUR: {winner} EDGES {loser} BY ONE FALL`, `{winner} OUTLASTS {loser} OVER SIXTY MINUTES`],
    },
    chants: [`ONE MORE FALL!`, `SIXTY MINUTES!`],
  },
  {
    id: 'PO-19', name: 'Bandana Match', slot: 'payoff',
    blurb: `Two wrestlers tied wrist to wrist with a bandana.`,
    rarity: 'uncommon', sources: ['insider_story'], tags: ['rules', 'menace', 'old_school', 'violence_mid'],
    payoff: {
      stip: 'bandana',
      title: `Bandana Match: {hero} vs. {villain}`,
      text: [
        `Tied wrist to wrist with a red bandana, {hero} and {villain} had nowhere to go and a great deal to say. {winner} finally pinned {loser} while still attached.`,
        `The bandana held through every throw and slam. {winner} won by pinfall with {loser}'s wrist still tied, and Referee Mo untied them both, one at a time.`,
      ],
      headline: [`TIED TOGETHER: {winner} BEATS {loser}`, `BANDANA MATCH ENDS WITH {winner} ON TOP`],
    },
    chants: [`NO ESCAPE!`, `TIE IT TIGHT!`],
  },
  {
    id: 'PO-20', name: 'Haunted House Match', slot: 'payoff',
    blurb: `At Harvest Havoc, through Hank's haunted maze and into the ring.`,
    rarity: 'rare', sources: ['dungeon'], tags: ['supernatural', 'spectacle', 'supershow', 'whimsy', 'hardcore'],
    requires: [{ kind: 'supershow', season: 2 }],
    payoff: {
      stip: 'haunted-house',
      title: `Haunted House Match: {hero} vs. {villain}`,
      text: [
        `Through Hank's haunted maze of cobwebs, bedsheet ghosts and jack-o'-lanterns, the fight spilled into the ring at Harvest Havoc. {winner} came out of the maze first, and {loser} was just a step behind.`,
        `Paper bats, flickering lanterns and a hay-bale labyrinth: the fight wound through Hank's haunted house and finished in the ring. {winner} got the pin on {loser}, and the kids cheered.`,
      ],
      headline: [`{winner} SURVIVES HANK'S HAUNTED HOUSE`, `HARVEST HAVOC MAZE MATCH: {winner} BEATS {loser}`],
    },
    chants: [`HAUNTED! HAUNTED!`, `THROUGH THE MAZE!`],
  },
  {
    id: 'PO-21', name: 'Snowball Showdown', slot: 'payoff',
    blurb: `The ring is ringed with snow forts, and snowballs are power-up cards.`,
    rarity: 'uncommon', sources: ['town'], tags: ['whimsy', 'comedy', 'spectacle', 'mess'],
    requires: [{ kind: 'season', seasons: [3] }],
    payoff: {
      stip: 'snowball',
      title: `Snowball Showdown: {hero} vs. {villain}`,
      text: [
        `Snow forts ringed the ring, and every snowball was a power-up. {winner} took the last fort and delivered the winning pin on {loser}, with the crowd throwing snowballs of its own.`,
        `Fort to fort, snowball to snowball. {winner} outflanked {loser} and finished the match with a perfectly timed pile of fresh snow.`,
      ],
      headline: [`SNOWBALL SHOWDOWN: {winner} DEFEATS {loser}`, `{winner} RULES THE SNOW FORTS`],
    },
    chants: [`SNOWBALL! SNOWBALL!`, `FORT! FORT!`],
  },
  {
    id: 'PO-22', name: 'Hay Bale Brawl', slot: 'payoff',
    blurb: `Harvest Havoc's farmyard match, fought over hay bales and a pumpkin patch.`,
    rarity: 'common', sources: ['town'], tags: ['hometown', 'comedy', 'whimsy', 'spectacle'],
    requires: [{ kind: 'season', seasons: [2] }],
    payoff: {
      stip: 'hay-bale',
      title: `Hay Bale Brawl: {hero} vs. {villain}`,
      text: [
        `Harvest Havoc's farmyard match was fought over hay bales and a pumpkin patch. {winner} tossed {loser} onto a bale and got the three-count, with a scarecrow nodding in approval.`,
        `Hay bales formed the ring and a pumpkin patch the aisle. {winner} out-wrestled {loser} through the bales and won with a pin on top of the tallest one.`,
      ],
      headline: [`{winner} WINS HAY BALE BRAWL OVER {loser}`, `PUMPKIN PATCH SHOWDOWN GOES TO {winner}`],
    },
    chants: [`HAY! HAY! HAY!`, `PUMPKINS!`],
  },
  {
    id: 'PO-23', name: 'Four Corners', slot: 'payoff',
    blurb: `Three or four wrestlers at once, and the first fall wins.`,
    rarity: 'common', sources: ['starter'], tags: ['schmozz', 'spectacle', 'faction', 'comedy'],
    requires: [{ kind: 'participants', min: 3 }],
    payoff: {
      stip: 'four-corners',
      title: `Four Corners: {hero}, {villain} and company`,
      text: [
        `Wrestlers in every corner and nobody in charge, and the first fall wins. {winner} grabbed it, pinning {loser} while the others traded forearms three steps away.`,
        `A free-for-all with four corners and no tags. {winner} found an opening, covered {loser}, and Referee Mo counted three before anybody else noticed.`,
      ],
      headline: [`{winner} WINS FOUR CORNERS FREE-FOR-ALL`, `FIRST FALL GOES TO {winner} OVER {loser}`],
    },
    chants: [`FOUR CORNERS!`, `FIRST FALL!`],
  },
  {
    id: 'PO-24', name: 'The Farewell Match', slot: 'payoff',
    blurb: `The crowd meter can't drop below warm, and every ending feels earned.`,
    rarity: 'rare', sources: ['life_event'], tags: ['heartfelt', 'solemn', 'legacy', 'career_ending', 'clean_finish'],
    requires: [{ kind: 'never' }],
    payoff: {
      stip: 'farewell',
      title: `The Farewell Match: {hero} vs. {villain}`,
      text: [
        `Everyone in the building knew this was the last bell. {winner} and {loser} wrestled with all they had, and when it was over, {winner} lifted {loser}'s arm while the whole crowd sang.`,
        `Fifteen minutes with the house on its feet the whole way. {winner} won it over {loser}, and then the two stood together at center ring while the old theme song played.`,
      ],
      headline: [`FAREWELL MATCH ENDS WITH {winner} VICTORIOUS`, `TURNBUCKLE ALLEY SINGS AS A CAREER ENDS`],
    },
    chants: [`FAREWELL!`, `ONE MORE SONG!`],
  },
];

// ------------------------------------------------------------------ segments (17)

const SEGMENTS: CardDef[] = [
  {
    id: 'SG-01', name: 'In-Ring Promo', slot: 'segment',
    blurb: `A microphone, a spotlight and an opinion.`,
    rarity: 'common', sources: ['starter'], tags: ['live_mic', 'spotlight', 'rehearsed', 'drama'],
    beat: {
      kind: 'promo',
      title: `In-ring promo: {hero} has something to say`,
      text: [
        `A microphone, a spotlight and an opinion: {hero} walked to center ring and told {villain} exactly what Turnbuckle Alley thinks of that sort of behavior. The crowd agreed in advance.`,
        `{villain} took the microphone, waited out the boos, and told the house it had been wrong about {villain} from the very beginning. The house booed gladly.`,
      ],
      headline: [`{hero} TAKES THE MICROPHONE AGAINST {villain}`, `{villain} SPEAKS AND THE CROWD ANSWERS`],
    },
    chants: [`SPEAK UP!`, `WE AGREE!`],
  },
  {
    id: 'SG-02', name: 'Backstage Brawl', slot: 'segment',
    blurb: `Caught on the crew camcorder and played on the big screen.`,
    rarity: 'common', sources: ['starter'], tags: ['violence_low', 'schmozz', 'comedy', 'spectacle'],
    beat: {
      kind: 'angle',
      title: `Backstage brawl: {hero} and {villain} on the big screen`,
      text: [
        `The crew camcorder was left running in the hallway, and the footage played on the big screen: {hero} and {villain} wrestling across a snack table, a hand truck and one very surprised janitor.`,
        `Grainy footage on the screen showed {villain} and {hero} trading shoves past the vending machine, through the prop room and into a stack of Marigold's costume boxes.`,
      ],
      headline: [`BACKSTAGE BRAWL CAUGHT ON CAMCORDER`, `{hero} AND {villain} FIGHT IN THE HALLWAY`],
    },
    chants: [`REPLAY IT!`, `FIGHT! FIGHT!`],
  },
  {
    id: 'SG-03', name: 'The Run-In', slot: 'segment',
    blurb: `Someone charges the ring mid-match.`,
    rarity: 'common', sources: ['starter'], tags: ['schmozz', 'violence_low', 'spectacle', 'rules'],
    beat: {
      kind: 'run-in',
      title: `Run-in: {villain} charges the ring`,
      text: [
        `Right in the middle of the match, {villain} charged down the aisle, slid under the bottom rope, and made Referee Mo start waving both arms.`,
        `{hero} burst through the crowd and hurdled the barricade, and Referee Mo, who had only two arms, could not stop it.`,
      ],
      headline: [`{villain} RUNS IN, THE RING ERUPTS`, `RUN-IN CAUSES CHAOS AT RINGSIDE`],
    },
    chants: [`RUN-IN!`, `GET OUT OF THERE!`],
  },
  {
    id: 'SG-04', name: 'Contract Signing', slot: 'segment',
    blurb: `A table in the ring, and the table always breaks.`,
    rarity: 'uncommon', sources: ['tape'], tags: ['rules', 'spectacle', 'live_mic', 'comedy'],
    beat: {
      kind: 'contract',
      title: `Contract signing: {hero} and {villain}`,
      text: [
        `A table was set up in the ring with two chairs, a pen and a stack of paper. {hero} and {villain} signed, shouted, and then Hank's breakaway table gave way in a spectacular heap.`,
        `Gus Gravel read the terms, and the two signed. Then {villain} kicked a chair, {hero} slammed a hand on the table, and Hank's breakaway table broke exactly as designed.`,
      ],
      headline: [`{hero} AND {villain} SIGN, TABLE BREAKS`, `CONTRACT SIGNING ENDS IN SPLINTERS`],
    },
    chants: [`SIGN IT!`, `TABLE! TABLE!`],
  },
  {
    id: 'SG-05', name: 'WRSL Call-In', slot: 'segment',
    blurb: `A villain calls The Gravel Pit to gloat on air, and the hero calls back.`,
    rarity: 'uncommon', sources: ['town'], tags: ['public', 'live_mic', 'improv', 'comedy'],
    beat: {
      kind: 'wrsl',
      title: `WRSL: {villain} calls The Gravel Pit`,
      text: [
        `{villain} phoned The Gravel Pit on WRSL 1340 to gloat to the whole county. Gus Gravel put {hero} on line two, and the silence on the line was electric.`,
        `On the air, {villain} took credit for everything and told the county to listen up. {hero} called back before the commercial and said, "Saturday." Gus Gravel left the line open.`,
      ],
      headline: [`{villain} GLOATS ON WRSL, {hero} CALLS BACK`, `THE GRAVEL PIT LIGHTS UP WITH {villain} AND {hero}`],
    },
    chants: [`LINE TWO!`, `CALL HIM BACK!`],
  },
  {
    id: 'SG-06', name: 'Sit-Down Interview', slot: 'segment',
    blurb: `Two chairs at the commentary desk, and Gus asks the hard questions.`,
    rarity: 'uncommon', sources: ['tape'], tags: ['live_mic', 'drama', 'spotlight', 'rehearsed'],
    beat: {
      kind: 'interview',
      title: `Sit-down interview: Gus Gravel talks to {villain}`,
      text: [
        `Two chairs at Gus Gravel's commentary desk, and no way out. Gus asked {hero} a hard question about {villain}, and {hero} gave an honest answer that surprised everyone.`,
        `"Folks, I'm sitting down with {villain}," said Gus Gravel, and then asked a question so hard that {villain} drank the whole glass of water on the desk.`,
      ],
      headline: [`GUS GRAVEL GRILLS {villain} AT COMMENTARY DESK`, `{hero} OPENS UP IN SIT-DOWN INTERVIEW`],
    },
    chants: [`ANSWER THE QUESTION!`, `TELL THE TRUTH!`],
  },
  {
    id: 'SG-07', name: 'Autograph Table Ambush', slot: 'segment',
    blurb: `Mid-show, at the merch table. Only wrestlers are targeted, never fans.`,
    rarity: 'common', sources: ['starter'], tags: ['public', 'menace', 'schmozz', 'hometown'],
    beat: {
      kind: 'angle',
      title: `Autograph table ambush: {villain} crashes {hero}'s signing`,
      text: [
        `At the merch table, with a line of fans waiting for autographs, {villain} marched up and swept every glossy photo off the table toward {hero}. The fans stepped aside, amused and unharmed.`,
        `Mid-signing, {villain} hoisted the folding table and tipped it. {hero} stood in a confetti of 8x10 photos while the fans were quickly and politely moved to the side.`,
      ],
      headline: [`{villain} AMBUSHES {hero} AT MERCH TABLE`, `AUTOGRAPH SIGNING ENDS IN A SHOVING MATCH`],
    },
    chants: [`LET HIM SIGN!`, `BOOOO!`],
  },
  {
    id: 'SG-08', name: 'The Public Weigh-In', slot: 'segment',
    blurb: `On the feed store scale on Main Street. Agnes attends.`,
    rarity: 'uncommon', sources: ['town'], tags: ['public', 'hometown', 'comedy', 'menace'],
    beat: {
      kind: 'town',
      title: `Public weigh-in: {hero} and {villain} on Main Street`,
      text: [
        `On the old feed store scale on Main Street, {hero} and {villain} stood nose to nose while Agnes Pickett supervised with Gertrude. The needle gave up halfway, and everyone agreed to call it even.`,
        `A crowd gathered on Main Street for the weigh-in. {hero} and {villain} stepped up in turn, posed and glared. Agnes Pickett declared the scale unreliable and the glaring entirely reliable.`,
      ],
      headline: [`{hero} AND {villain} FACE OFF AT FEED STORE SCALE`, `AGNES PICKETT PRESIDES OVER WEIGH-IN`],
    },
    chants: [`MAIN STREET!`, `WEIGH THEM IN!`],
  },
  {
    id: 'SG-09', name: 'Face-Off at the Bakery', slot: 'segment',
    blurb: `A staged standoff over the last cruller at Tiny's counter.`,
    rarity: 'uncommon', sources: ['town'], tags: ['food', 'public', 'comedy', 'hometown'],
    beat: {
      kind: 'town',
      title: `Face-off at the bakery: {hero} and {villain} want the last cruller`,
      text: [
        `At Tallbridge Bakery, {hero} and {villain} reached for the last cruller at the same moment, and neither let go. Tiny, behind the counter, asked them both politely to take it outside.`,
        `{villain} paid the villain surcharge at Tallbridge Bakery without complaint. {hero} stared at the cruller case. Tiny rang the little bell, and the whole shop went still.`,
      ],
      headline: [`CRULLER STANDOFF AT TALLBRIDGE BAKERY`, `{hero} AND {villain} CLASH OVER LAST CRULLER`],
    },
    chants: [`CRULLER! CRULLER!`, `SHARE IT!`],
  },
  {
    id: 'SG-10', name: 'The Tattler Exclusive', slot: 'segment',
    blurb: `Clementine gets an "exclusive" quote and believes every word.`,
    rarity: 'uncommon', sources: ['town'], tags: ['public', 'live_mic', 'comedy', 'hometown'],
    beat: {
      kind: 'town',
      title: `Tattler exclusive: {villain} gives Clementine a quote`,
      text: [
        `{villain} gave the Tattler's Clementine an exclusive, delivered with a perfectly straight face, and she wrote down every word with great care. The quote ran on the front page.`,
        `{hero} sat for a quick interview with Clementine, who underlined every answer twice. By morning the whole county had the quote, and Lavinia had fixed its commas.`,
      ],
      headline: [`TATTLER EXCLUSIVE: {villain} SPEAKS OUT`, `CLEMENTINE LANDS FRONT-PAGE QUOTE FROM {hero}`],
    },
    chants: [`EXTRA! EXTRA!`, `READ ALL ABOUT IT!`],
  },
  {
    id: 'SG-11', name: 'The Video Package', slot: 'segment',
    blurb: `A hype video on the Sportatorium screen.`,
    rarity: 'uncommon', sources: ['life_event'], tags: ['spectacle', 'rehearsed', 'spotlight', 'entrance'],
    requires: [{ kind: 'saturday' }],
    beat: {
      kind: 'angle',
      title: `Video package: {hero} vs. {villain} on the big screen`,
      text: [
        `The Sportatorium screen lit up with a hype video: slow motion, thunder and a swelling orchestra, all about {hero} and {villain}, narrated by Gus Gravel in his deepest voice.`,
        `The lights dimmed and a video began on the big screen: highlights, close-ups, a dramatic voiceover about {villain}, and then a very long, very silent shot of {hero}.`,
      ],
      headline: [`VIDEO PACKAGE LIGHTS UP THE SPORTATORIUM`, `HYPE VIDEO PUTS {hero} AND {villain} ON SCREEN`],
    },
    chants: [`ROLL THE TAPE!`, `PLAY IT AGAIN!`],
  },
  {
    id: 'SG-12', name: 'Parking Lot Showdown', slot: 'segment',
    blurb: `After the show, under the lot's one buzzing light.`,
    rarity: 'common', sources: ['tape'], tags: ['menace', 'violence_low', 'hometown', 'slow_build'],
    beat: {
      kind: 'angle',
      title: `Parking lot showdown: {hero} and {villain} after the show`,
      text: [
        `After the show, under the lot's one buzzing streetlight, {hero} and {villain} squared off between a pickup and a parked hay wagon. Somebody honked twice, for emphasis.`,
        `The crowd had mostly gone home, but not everyone. {villain} leaned on a car door, {hero} stood in the glare of the streetlight, and the two said very few words.`,
      ],
      headline: [`{hero} AND {villain} CLASH IN THE PARKING LOT`, `STREETLIGHT SHOWDOWN AFTER THE SHOW`],
    },
    chants: [`HONK! HONK!`, `TAKE IT OUTSIDE!`],
  },
  {
    id: 'SG-13', name: 'The Suspicious Gift', slot: 'segment',
    blurb: `The villain gives the hero a present. It's a fruit basket. Or is it?`,
    rarity: 'common', sources: ['insider_story'], tags: ['mystery', 'comedy', 'prank', 'swerve'],
    beat: {
      kind: 'angle',
      title: `The suspicious gift: {villain} gives {hero} a fruit basket`,
      text: [
        `{villain} handed {hero} a wrapped present at ringside. It was a fruit basket. It looked exactly like a fruit basket. Gus Gravel kept staring at it as if it might not be.`,
        `A basket of pears and a cheerful ribbon arrived in {hero}'s locker with a note signed {villain}. The whole locker room examined it for a very long time.`,
      ],
      headline: [`{villain} SENDS {hero} A SUSPICIOUS FRUIT BASKET`, `FRUIT BASKET RAISES EYEBROWS AT RINGSIDE`],
    },
    chants: [`OPEN IT!`, `IT'S A TRAP!`],
  },
  {
    id: 'SG-14', name: 'The Training Montage', slot: 'segment',
    blurb: `The hero runs the water tower stairs at dawn while the town cheers.`,
    rarity: 'uncommon', sources: ['town'], tags: ['hometown', 'heartfelt', 'public', 'slow_build'],
    beat: {
      kind: 'town',
      title: `Training montage: {hero} runs the water tower stairs`,
      text: [
        `At dawn, {hero} ran the water tower stairs while half of Main Street cheered from below and Tallbridge Bakery handed up warm rolls.`,
        `Up one stair at a time, with the whole town counting along, {hero} reached the top of the water tower at sunrise and raised both fists to a roar from below.`,
      ],
      headline: [`{hero} TRAINS AT DAWN ON WATER TOWER STAIRS`, `TOWN CHEERS AS {hero} CLIMBS`],
    },
    chants: [`UP! UP! UP!`, `KEEP CLIMBING!`],
  },
  {
    id: 'SG-15', name: 'The Parade Float', slot: 'segment',
    blurb: `The villain's float in Mayor Delphine's parade is magnificently tacky.`,
    rarity: 'uncommon', sources: ['town'], tags: ['public', 'spectacle', 'comedy', 'hometown'],
    beat: {
      kind: 'town',
      title: `Parade float: {villain} rolls through Mayor Delphine's parade`,
      text: [
        `In Mayor Delphine's parade, {villain}'s float rolled by: sequins, a glitter cannon, and a banner with a flattering portrait. It was magnificent and tacky, and the crowd booed with great joy.`,
        `The parade stopped on Main Street when {villain}'s float arrived, trailing streamers and playing {villain}'s own theme. {hero} watched from the curb with arms folded.`,
      ],
      headline: [`{villain}'S FLOAT STEALS MAYOR'S PARADE`, `TACKY FLOAT DRAWS BOOS AND CHEERS ON MAIN STREET`],
    },
    chants: [`GLITTER! GLITTER!`, `BOOOO!`],
  },
  {
    id: 'SG-16', name: 'The Mirror Speech', slot: 'segment',
    blurb: `A villain gives a speech to a hand mirror, and the crowd heckles the mirror.`,
    rarity: 'common', sources: ['insider_story'], tags: ['comedy', 'live_mic', 'spotlight', 'whimsy'],
    beat: {
      kind: 'promo',
      title: `The mirror speech: {villain} addresses a hand mirror`,
      text: [
        `{villain} took a gold hand mirror to center ring and gave it a ten-minute speech on how magnificent {villain} was. The crowd booed the mirror.`,
        `Alone in the spotlight, {villain} held up a hand mirror, whispered sweet words to it, and was heckled, thoroughly, on the mirror's behalf.`,
      ],
      headline: [`{villain} GIVES SPEECH TO A MIRROR`, `MIRROR HECKLED AS {villain} TAKES THE MICROPHONE`],
    },
    chants: [`BOO THE MIRROR!`, `MIRROR! MIRROR!`],
  },
  {
    id: 'SG-17', name: 'Hall of Fame Moment', slot: 'segment',
    blurb: `A plaque, a speech and something nobody expected.`,
    rarity: 'rare', sources: ['life_event'], tags: ['heartfelt', 'legacy', 'spotlight', 'supershow'],
    requires: [{ kind: 'supershow', season: 3 }],
    beat: {
      kind: 'angle',
      title: `Hall of Fame moment: a plaque for {hero}`,
      text: [
        `At Homecoming, a brass plaque with {hero}'s name was hung beside the old Sportatorium photographs. Gus Gravel read a long list of accomplishments, and then the curtain parted on an unexpected guest.`,
        `A plaque was unveiled to honor {hero}, and {villain} came forward to speak. What {villain} said made the whole building go quiet, and then loud.`,
      ],
      headline: [`{hero} HONORED IN HALL OF FAME MOMENT`, `HOMECOMING PLAQUE UNVEILED FOR {hero}`],
    },
    chants: [`HALL OF FAME!`, `BRAVO!`],
  },
];

// ------------------------------------------------------------------ wildcards (14)

const WILDCARDS: CardDef[] = [
  {
    id: 'WC-01', name: 'Let the People Decide', slot: 'wildcard',
    blurb: `The crowd's cheers pick the winner. The booked finish becomes open.`,
    rarity: 'uncommon', sources: ['tape'], tags: ['public', 'improv', 'rules', 'spectacle'],
    beat: {
      kind: 'match',
      title: `Let the people decide: {hero} vs. {villain}`,
      text: [
        `Referee Mo stopped the match, stepped back and pointed at the crowd. Whichever of {hero} or {villain} drew the louder cheer would get the win, and the whole house leaned in.`,
        `Gus Gravel announced that this one belonged to the fans. Referee Mo held up a hand over each wrestler in turn, and the cheering rattled the rafters of {venue}.`,
      ],
      headline: [`CROWD GETS TO CHOOSE THE WINNER`, `FANS DECIDE {hero} VS. {villain} WITH THEIR VOICES`],
    },
    rescue: 20, fixes: ['stakes_dont_matter'],
    chants: [`LET THEM DECIDE!`, `LOUDER! LOUDER!`],
  },
  {
    id: 'WC-02', name: 'Jobber Takes a Side', slot: 'wildcard',
    blurb: `The announce-booth raccoon steals something important.`,
    rarity: 'uncommon', sources: ['town'], tags: ['animal', 'comedy', 'whimsy', 'improv'],
    beat: {
      kind: 'angle',
      title: `Jobber takes a side in {hero} vs. {villain}`,
      text: [
        `Jobber the raccoon slipped through the ropes with {villain}'s lucky robe in his teeth and ran up the aisle. {hero} said nothing and looked suspiciously pleased.`,
        `Jobber, the raccoon from the announce booth, made off with {hero}'s lucky boot, and the whole crowd cheered for the raccoon. Gus Gravel called the chase live.`,
      ],
      headline: [`JOBBER THE RACCOON STEALS THE SHOW`, `RACCOON SNATCHES LUCKY ITEM AT RINGSIDE`],
    },
    rescue: 20, fixes: ['no_heat', 'fatigue'],
    chants: [`JOB-BER! JOB-BER!`, `GET THE RACCOON!`],
  },
  {
    id: 'WC-03', name: 'Agnes Gets Involved', slot: 'wildcard',
    blurb: `Work the spot right in front of row one, and Agnes will do the rest.`,
    rarity: 'uncommon', sources: ['town'], tags: ['hometown', 'comedy', 'public', 'spotlight'],
    beat: {
      kind: 'angle',
      title: `Agnes Pickett gets involved`,
      text: [
        `{villain} leaned over the rail to taunt {hero} right in front of row one, and Agnes Pickett stood up and let Gertrude fly. The crowd's roar rattled the folding chairs.`,
        `Agnes Pickett had seen quite enough of {villain}. She marched to the apron with Gertrude held high like a mace, and Referee Mo pretended not to notice.`,
      ],
      headline: [`AGNES PICKETT SWINGS INTO ACTION AT RINGSIDE`, `GERTRUDE STRIKES: AGNES TAKES ON {villain}`],
    },
    rescue: 20, fixes: ['no_heat'],
    chants: [`AG-NES! AG-NES!`, `GET HIM, GERTRUDE!`],
  },
  {
    id: 'WC-04', name: `Sheriff Bev's Warrant`, slot: 'wildcard',
    blurb: `The villain taunts near Sheriff Bev, she tries to arrest him, and he escapes.`,
    rarity: 'uncommon', sources: ['town'], tags: ['crime_kayfabe', 'comedy', 'hometown', 'public'],
    beat: {
      kind: 'angle',
      title: `Sheriff Bev's warrant for {villain}`,
      text: [
        `Sheriff Bev strode down the aisle with her citation book open, ready to arrest {villain} for a long list of ring-related offenses. {villain} slipped out through the curtain, as always.`,
        `{villain} made a taunting remark right next to Sheriff Bev, who reached for her handcuffs and a pen. By the time the paperwork was signed, {villain} was somewhere in the parking lot.`,
      ],
      headline: [`SHERIFF BEV TRIES TO ARREST {villain} AT RINGSIDE`, `{villain} ESCAPES THE LONG ARM OF THE LAW AGAIN`],
    },
    rescue: 20, fixes: ['no_heat'],
    chants: [`ARREST HIM!`, `HE'S GETTING AWAY!`],
  },
  {
    id: 'WC-05', name: `Pip's Prediction`, slot: 'wildcard',
    blurb: `Pip's cardboard sign predicts the ending, and the wrestlers make it come true.`,
    rarity: 'uncommon', sources: ['fan_mail'], tags: ['hometown', 'kids_spotlight', 'whimsy', 'improv'],
    requires: [{ kind: 'saturday' }],
    beat: {
      kind: 'angle',
      title: `Pip's prediction about {hero} and {villain}`,
      text: [
        `Pip hoisted his cardboard sign: it predicted exactly how {hero} and {villain} would end this. Gus Gravel read it aloud, and the wrestlers looked at each other and nodded.`,
        `The sign in row one this week had a single long sentence on it, in Pip's best marker. The ring crew read it from the back. {hero} and {villain} started making it come true.`,
      ],
      headline: [`PIP'S CARDBOARD SIGN PREDICTS THE ENDING`, `FAN'S PREDICTION COMES TRUE FOR {hero} AND {villain}`],
    },
    rescue: 20, fixes: ['no_heat', 'stakes_dont_matter'],
    chants: [`PIP! PIP! PIP!`, `CALLED IT!`],
  },
  {
    id: 'WC-06', name: `Birdie's Old Trick`, slot: 'wildcard',
    blurb: `A carny swerve from Birdie's private playbook.`,
    rarity: 'rare', sources: ['insider_story'], tags: ['swerve', 'old_school', 'spectacle', 'mystery'],
    requires: [{ kind: 'hearts', who: 'birdie', min: 6 }],
    beat: {
      kind: 'angle',
      title: `The Commissioner's old trick`,
      text: [
        `The bell rang three minutes early, the lights went red, and the Commissioner strolled in with a carny grin. Nobody understood her plan, but {hero} and {villain} both ran with it.`,
        `From somewhere deep in her old carnival playbook, the Commissioner produced a trick: a flag, a hat and a bell, all swapped in one move. {hero} and {villain} could not tell whose side she was on.`,
      ],
      headline: [`COMMISSIONER PULLS A TRICK OUT OF HER HAT`, `CARNY SWERVE LEAVES {hero} AND {villain} SPEECHLESS`],
    },
    rescue: 25, fixes: ['fatigue', 'weak_matches', 'no_heat'],
    chants: [`WHAT WAS THAT?!`, `STEP RIGHT UP!`],
  },
  {
    id: 'WC-07', name: 'Rain Delay', slot: 'wildcard',
    blurb: `A storm turns an outdoor show into an improvised mud-and-tarp classic.`,
    rarity: 'common', sources: ['life_event'], tags: ['mess', 'improv', 'spectacle', 'hometown'],
    requires: [{ kind: 'supershow' }],
    beat: {
      kind: 'angle',
      title: `Rain delay: {hero} and {villain} in the mud`,
      text: [
        `A summer storm rolled over the fairgrounds, and the tarps went up over the ring. {hero} and {villain} went on anyway in an improvised mud-and-tarp classic, with the crowd under umbrellas.`,
        `The rain came down, the ring turned to soup, and nobody left. {hero} and {villain} wrestled on a slippery mat while the crowd cheered every splash.`,
      ],
      headline: [`STORM HITS FAIRGROUNDS, SHOW GOES ON ANYWAY`, `{hero} AND {villain} WRESTLE THROUGH THE RAIN`],
    },
    rescue: 15, fixes: ['no_heat'],
    chants: [`RAIN! RAIN!`, `SPLASH! SPLASH!`],
  },
  {
    id: 'WC-08', name: 'Blackout', slot: 'wildcard',
    blurb: `The power cuts mid-show, and the crew lights the ring with pickup truck headlights.`,
    rarity: 'uncommon', sources: ['life_event'], tags: ['improv', 'spectacle', 'hometown', 'whimsy'],
    beat: {
      kind: 'angle',
      title: `Blackout: {hero} and {villain} in the headlights`,
      text: [
        `The power cut out in the middle of the show. The crew pulled pickup trucks up to the doors and lit the ring with headlights, and {hero} and {villain} wrestled in the glare.`,
        `Darkness fell across {venue}, and then a row of truck headlights came on, one by one. {hero} and {villain} stared at each other in the white light and kept going.`,
      ],
      headline: [`POWER FAILS, PICKUP HEADLIGHTS SAVE THE SHOW`, `{hero} AND {villain} WRESTLE BY TRUCK LIGHT`],
    },
    rescue: 20, fixes: ['fatigue'],
    chants: [`HEADLIGHTS! HEADLIGHTS!`, `LIGHTS! LIGHTS!`],
  },
  {
    id: 'WC-09', name: 'The Second Chance', slot: 'wildcard',
    blurb: `Reshuffle a sagging Act II with new beats and the same cast.`,
    rarity: 'common', sources: ['starter'], tags: ['improv', 'swerve', 'rules'],
    beat: {
      kind: 'angle',
      title: `A second chance for {hero} and {villain}`,
      text: [
        `Gus Gravel announced a shake-up: new faces in the corner, a new rule and a reshuffled card. {hero} and {villain} were told to forget what they thought they knew.`,
        `The Commissioner stepped into the ring and tore up the old plan. Fresh stakes, fresh faces, and the same two wrestlers looking at each other in a brand-new way.`,
      ],
      headline: [`COMMISSIONER SHAKES UP THE {hero}-{villain} FEUD`, `A FRESH START FOR {hero} AND {villain}`],
    },
    rescue: 15, fixes: ['too_long', 'weak_matches'],
    chants: [`SECOND CHANCE!`, `START OVER!`],
  },
  {
    id: 'WC-10', name: 'Callback', slot: 'wildcard',
    blurb: `Bring back a bit from an old storyline, even a flop. The crowd remembers.`,
    rarity: 'uncommon', sources: ['life_event'], tags: ['legacy', 'hometown', 'heartfelt', 'old_school'],
    requires: [{ kind: 'archive' }],
    beat: {
      kind: 'angle',
      title: `Callback: {hero} and {villain} bring back an old bit`,
      text: [
        `Pip held up a sign from a story the town had mostly forgotten, and the crowd gasped as {hero} and {villain} brought back an old bit from it. It landed like a hug.`,
        `A familiar spot from a long-ago rivalry returned, line for line. The folding chairs creaked as everyone remembered, and {hero} and {villain} did not miss a word.`,
      ],
      headline: [`OLD BIT RETURNS, CROWD REMEMBERS EVERY WORD`, `{hero} AND {villain} REVIVE A FAMILIAR SPOT`],
    },
    rescue: 20, fixes: ['fatigue'],
    chants: [`I REMEMBER!`, `DO IT AGAIN!`],
  },
  {
    id: 'WC-11', name: `Coach Patty's Investigation`, slot: 'wildcard',
    blurb: `Patty shows up to prove it's fake, and whatever she checks proves it's real.`,
    rarity: 'uncommon', sources: ['town'], tags: ['hometown', 'comedy', 'public', 'rules'],
    beat: {
      kind: 'angle',
      title: `Coach Patty's investigation of {hero} and {villain}`,
      text: [
        `Coach Patty arrived with her EVIDENCE clipboard to prove, once and for all, that this was fake. She tested {villain}'s chair, {hero}'s boot and the ropes. Everything checked out as real, and she wrote that down solemnly.`,
        `Coach Patty marched down the aisle with the EVIDENCE clipboard and a stopwatch. Every test came back the same: real, real and real. The crowd cheered her thoroughness.`,
      ],
      headline: [`COACH PATTY INVESTIGATES AND FINDS EVERYTHING REAL`, `PATTY'S EVIDENCE CLIPBOARD CONFIRMS IT: IT'S REAL`],
    },
    rescue: 20, fixes: ['no_heat'],
    chants: [`SHOW US THE EVIDENCE!`, `IT'S REAL!`],
  },
  {
    id: 'WC-12', name: 'The Golden Belt', slot: 'wildcard',
    blurb: `The Dungeon's ultimate prize appears in a story.`,
    rarity: 'legendary', sources: ['dungeon'], tags: ['title', 'spectacle', 'legacy', 'mystery'],
    requires: [{ kind: 'flag', flag: 'golden_belt' }],
    beat: {
      kind: 'angle',
      title: `The Golden Belt appears at ringside`,
      text: [
        `A hush fell as the Golden Belt, the Dungeon's ultimate prize, rested on a velvet pillow at ringside. The wrestlers and the crowd alike watched {hero} and {villain} watching it.`,
        `The Golden Belt gleamed under the lights, whole and bright, and the whole room went quiet. {hero} and {villain} stared at it, and both understood that whoever left with it would be remembered.`,
      ],
      headline: [`THE GOLDEN BELT APPEARS AT RINGSIDE`, `{hero} AND {villain} EYE THE GOLDEN PRIZE`],
    },
    rescue: 35, fixes: ['stakes_dont_matter', 'no_heat'],
    chants: [`GOLDEN BELT!`, `GOLD! GOLD!`],
  },
  {
    id: 'WC-13', name: 'Grandma Stands Up', slot: 'wildcard',
    blurb: `The front row's favorite rises, and the whole room rises with her.`,
    rarity: 'legendary', sources: ['main_story'], tags: ['heartfelt', 'legacy', 'hometown', 'spotlight'],
    requires: [{ kind: 'flag', flag: 'credits_done' }],
    beat: {
      kind: 'angle',
      title: `Grandma stands up in the front row`,
      text: [
        `In the front row, in the seat that was always kept for her, Grandma rose to her feet, and one by one the whole room rose with her. {hero} and {villain} stopped what they were doing and took a bow.`,
        `{venue} went still when Grandma stood up from her front-row seat. Folding chairs scraped, and then everyone was on their feet, and nobody could say who had started the applause.`,
      ],
      headline: [`FRONT ROW STANDS, WHOLE ROOM RISES WITH IT`, `TURNBUCKLE ALLEY RISES FOR A FRONT-ROW FAVORITE`],
    },
    rescue: 35, fixes: ['stakes_dont_matter', 'no_heat', 'fatigue'],
    chants: [`GRAND-MA! GRAND-MA!`, `EVERYBODY UP!`],
  },
  {
    id: 'WC-14', name: `Fenwick's Sighting`, slot: 'wildcard',
    blurb: `Fenwick swears he saw something, and a winged shadow crosses the story.`,
    rarity: 'rare', sources: ['town'], tags: ['night', 'supernatural', 'mystery', 'comedy'],
    requires: [{ kind: 'night' }],
    beat: {
      kind: 'angle',
      title: `Fenwick's sighting over {hero} and {villain}`,
      text: [
        `Fenwick swore he saw something at the edge of the lights, a shadow with wings that crossed over {hero} and {villain} and was gone. The crowd turned. The rafters were empty.`,
        `Fenwick leapt up in the middle of row nine, pointing at the ceiling. Everyone looked. Nobody saw anything. {hero} and {villain} looked a little uneasy anyway.`,
      ],
      headline: [`FENWICK CLAIMS HE SAW A WINGED SHADOW`, `SIGHTING AT RINGSIDE: WHAT DID FENWICK SEE?`],
    },
    rescue: 25, fixes: ['no_heat', 'fatigue'],
    chants: [`WHAT WAS THAT?`, `FEN-WICK! FEN-WICK!`],
  },
];

// ------------------------------------------------------------------ the deck

export const CARDS: CardDef[] = [...HOOKS, ...TWISTS, ...STAKES, ...PAYOFFS, ...SEGMENTS, ...WILDCARDS];

/** Birdie's week-one starter deck: every card marked S in docs/STORYLINES.md section 4 (24 cards). */
export const STARTER_DECK: CardId[] = [
  'HK-01', 'HK-02', 'HK-03', 'HK-05', 'HK-13', 'HK-19',
  'TW-01', 'TW-02', 'TW-05', 'TW-17',
  'ST-01', 'ST-02', 'ST-12',
  'PO-01', 'PO-02', 'PO-04', 'PO-10', 'PO-15', 'PO-23',
  'SG-01', 'SG-02', 'SG-03', 'SG-07',
  'WC-09',
];
