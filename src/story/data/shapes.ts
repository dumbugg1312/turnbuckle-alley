/**
 * The 31 story shapes (docs/STORYLINES.md section 5). Contract: ../types.ts.
 *
 * How the engine assembles a storyline from a shape:
 *   Act I   = [hook-card beat] + acts[0]
 *   Act II  = acts[1] + segment-card beats + [twist-card beat] + [stakes declaration]
 *   Act III = acts[2] + [payoff match] + chosen ending (text, epilogue)
 * So these beats are the connective tissue: they never stage the hook, twist,
 * stakes declaration or payoff match themselves.
 *
 * Conventions used here:
 *   - Every shape has 'hero' and 'villain' roles. 'hero' is the protagonist and
 *     'villain' the antagonist (for respect stories, simply the opponent).
 *   - `align` is the side the role works by the payoff. 'any' marks roles that may
 *     be cast from either side or change sides during the story (the betrayer-to-be
 *     in a Fall from Grace, the redeemer in a Redemption, a respect opponent).
 *   - Beats that name an optional role are themselves optional.
 *   - Public text never names the person inside a disguise before the reveal
 *     (the Ornery Twin, the Haunted Locker's echo, the Secret Admirer).
 *   - The booth beat in acts[2] is played after the payoff, so it never assumes
 *     who won; the ending's epilogue carries the result.
 *   - Cryptid Hunt casts the Mothman as 'villain' (align 'any', masked) and never uses {villain.real}.
 */

import type { ShapeDef } from '../types';

export const SHAPES: ShapeDef[] = [
  // ------------------------------------------------------------ 5.1 The Betrayal
  {
    id: 'betrayal',
    name: 'The Betrayal',
    register: 'heartbreak, then catharsis',
    blurb: 'Partners win together, small cracks show, and one of them turns. Does the one who leaves come back?',
    tags: ['betrayal', 'drama', 'tag', 'heartfelt'],
    roles: [
      { key: 'hero', label: 'The Betrayed', align: 'hero', player: true },
      { key: 'villain', label: 'The Betrayer', align: 'villain', player: true },
      { key: 'ally', label: 'The New Ally', align: 'hero', optional: true, player: true },
    ],
    length: [4, 5, 6],
    cards: {
      hook: ['HK-13', 'HK-03', 'HK-15', 'HK-08'],
      twist: ['TW-01', 'TW-07', 'TW-08', 'TW-13'],
      stakes: ['ST-02', 'ST-03', 'ST-01', 'ST-12'],
      payoff: ['PO-05', 'PO-07', 'PO-19', 'PO-04'],
    },
    twistAt: 'end_act2',
    needs: ['allies'],
    acts: [
      [
        {
          key: 'partners_win', kind: 'match', purpose: 'establish',
          sides: [['hero', 'villain'], ['@any', '@any']], winner: 0,
          title: 'Tag match: {hero} & {villain} in action',
          text: [
            '{hero} and {villain} ran their double-team like a square dance and won in under eight minutes. They hugged on the turnbuckle while Gus called them the team this town was waiting for.',
            'A hot tag, a {hero.finisher}, and a three count that {villain} counted along with from the apron. Afterward the two of them posed back to back while the whole building took pictures.',
            '{villain} broke up a pin with one second to spare, then tagged in and finished it. The crowd chanted both names, one after the other, all the way to the curtain.',
          ],
          headline: ['{hero} AND {villain}: TOGETHER, UNSTOPPABLE', 'PARTNERS SWEEP THE CARD; CROWD CALLS IT FATE'],
        },
        {
          key: 'matching_shirts', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'Main Street',
          title: 'Partnership shirts sell out',
          text: [
            'Matching {hero} and {villain} shirts sold out at the merch table by intermission. By Tuesday half of Main Street was wearing them, including Sheriff Bev, who wore hers under the uniform "for morale."',
            'Pip talked his dads into buying both shirts so he could wear one over the other. Tallbridge Bakery added a half-lemon, half-chocolate cupcake to the case and called it The Partnership.',
            'Agnes Pickett was seen at the post office in a shirt with both names on it, tucked neatly into her church skirt. She informed the clerk that teamwork is a Christian value.',
          ],
          headline: ['PARTNERSHIP SHIRTS SELL OUT; REPRINT ORDERED', 'TOWN GOES TWO-FOR-ONE ON TAG TEAM FEVER'],
        },
      ],
      [
        {
          key: 'missed_tag', kind: 'match', purpose: 'heat',
          sides: [['hero', 'villain'], ['@any', '@any']], winner: 1,
          title: 'Tag match: {hero} & {villain} vs. a hungry pair',
          text: [
            '{hero} reached for the tag with the whole building screaming, and {villain} was a half step late. The pin came a breath later. {villain} blamed a slippery hand. Nobody in row one bought it.',
            'Friendly fire: a big swing from {villain} sailed past an opponent and caught {hero} flush. The other team took the gift. {villain} helped {hero} up afterward, slowly, and did not say sorry.',
            'They lost a match they should have won. Up the aisle {hero} kept talking and {villain} kept walking, three steps ahead and not looking back.',
          ],
          headline: ['THE TAG THAT NEVER CAME', 'TROUBLE IN PARADISE? PARTNERS FALL AT THE VFW'],
        },
        {
          key: 'i_carry_this_team', kind: 'wrsl', purpose: 'wrsl', roles: ['villain'],
          title: '{villain} calls The Gravel Pit',
          text: [
            '{villain} called The Gravel Pit to talk about the team and said "I" eleven times and "we" once. Gus counted on the air, then went quiet and played a sad song.',
            'Gus asked {villain} on WRSL whether the partnership was solid. There was a long pause on the line. "Next caller," said {villain}, and hung up.',
            '"I carry that team," {villain} told the Gravel Pit audience. "Somebody has to." Forty-one listeners called in to disagree before 8 a.m.',
          ],
          headline: ['"I CARRY THAT TEAM": A WRSL CALL RAISES EYEBROWS'],
        },
        {
          key: 'fist_bump', kind: 'angle', purpose: 'tease', roles: ['hero', 'villain'],
          title: 'Backstage: {hero} & {villain}',
          text: [
            'The crew camcorder caught {hero} offering a fist bump in the hallway. {villain} looked at it, looked at the camera, and walked past. The Sportatorium let out one long "ooooh."',
            'On the big screen: {hero} laughing in the locker room, and {villain} alone in the corner, staring at the empty hook on the wall where a belt would hang.',
            'Two chairs, one microphone, a backstage interview. {hero} answered every question. {villain} answered none and left before the end.',
          ],
          headline: ['THE FIST BUMP LEFT HANGING', 'SILENCE IN THE HALLWAY: WHAT IS {villain} THINKING?'],
        },
        {
          key: 'new_friend', kind: 'run-in', purpose: 'tease', roles: ['ally', 'hero'], optional: true,
          title: '{ally} checks on {hero}',
          text: [
            'When {hero} was left down on the mat after the bell, it was {ally}, not a partner, who came down the aisle with a towel and a hand up.',
            '{ally} ran in to break up a two-on-one beatdown on {hero}, then looked around for {hero}\'s partner. So did everyone else.',
          ],
          headline: ['{ally} THERE WHEN IT COUNTED'],
        },
      ],
      [
        {
          key: 'surcharge', kind: 'town', purpose: 'town', roles: ['villain'],
          place: 'Tallbridge Bakery',
          title: 'A new name on the surcharge board',
          text: [
            'Thursday morning the bakery price board read VILLAIN SURCHARGE: $1 (YES, {villain}). By noon somebody had added, in smaller chalk: AND SHAME ON YOU.',
            'Pip drew a mustache on {villain}\'s half of the team poster outside the hardware store and taped a note over the other half: STILL MY HERO. Then he made the mustache bigger.',
            'Agnes Pickett carried her partnership shirt to the church rummage sale, folded it once, and handed it over. "One owner," she said. "Lightly betrayed."',
          ],
          headline: ['BAKERY CHALKS A NEW NAME ON THE SURCHARGE BOARD', 'PIP DRAWS A MUSTACHE: "HE KNOWS WHAT HE DID"'],
        },
        {
          key: 'signing', kind: 'contract', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'Contract signing: {hero} & {villain}',
          text: [
            'They sat across the table they used to sit at side by side. {villain} signed first and slid the pen back without looking up. {hero} flipped the table. It broke, as tables do.',
            '"Why?" was all {hero} asked. {villain} leaned into the microphone, said "Ask the mirror," and signed with a flourish. The table did not survive the next ten seconds.',
            '{hero} brought the old team photo and set it on the table. {villain} signed right across their two faces. Hank\'s table went down in two pieces and so did the mood.',
          ],
          headline: ['TABLE BROKEN; PARTNERSHIP, TOO', 'CONTRACT SIGNED ACROSS THE OLD TEAM PHOTO'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{villain.real} split a milkshake with {hero.real} and asked the only question that mattered: "They hated me, right? Like, really?" They really did. {villain.real} ordered a second milkshake to celebrate.',
            'June slid two forks across. {hero.real} and {villain.real} shared one slice of pie and argued happily about who sold the turn better. Birdie\'s only note: "Does the one who leaves come back? Think on it."',
            '{villain.real} admitted the hardest part was the hallway walk-past. "My hand almost fist-bumped on its own." {hero.real} said the almost was the best part.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'betrayed_wins', label: 'Justice for the betrayed', winner: 'hero', weight: 0.55,
        text: [
          '{hero} stood alone in the ring, and the crowd made sure it didn\'t feel that way.',
          '{villain} watched from the aisle, half behind the curtain, and looked back once before leaving.',
        ],
        epilogue: [
          '{hero.real} kept the win and offered {villain.real} the last fry. "The look back at the curtain wasn\'t in the plan." "It was in mine," said {villain.real}. Birdie wrote RETURN? on a napkin and pocketed it.',
          '"Catharsis," said Gus, wiping his eyes. "That\'s what that was." {villain.real} grinned. "Give it six months. They\'ll want me back."',
        ],
        headline: ['{hero} GETS EVEN; TRAITOR SENT PACKING', 'JUSTICE FOR THE BETRAYED'],
      },
      {
        id: 'betrayer_wins', label: 'The traitor prevails', winner: 'villain', weight: 0.25,
        text: [
          '{villain} raised both arms into a wall of boos and wore every one of them like a medal.',
          '{villain} left with the win and the old team shirt draped over one shoulder like a trophy.',
        ],
        epilogue: [
          '"Sorry," said {villain.real}, not sorry at all and very proud. {hero.real} was already sketching the rematch on the back of a menu.',
          'The booth agreed that leaving it open was right. {hero.real} took the loss like a pro and a second slice of pie like a champion.',
        ],
        headline: ['THE TRAITOR PREVAILS', '{villain} WINS UGLY; TOWN DEMANDS A REMATCH'],
      },
      {
        id: 'looks_back', label: 'The hand comes back', winner: 'hero', weight: 0.2,
        turn: { who: 'villain', to: 'hero' },
        text: [
          'Afterward {villain} came back down the aisle, picked the old team shirt up off the mat, and held out a hand. This time {hero} took it.',
          'The handshake {villain} refused all month finally came, in the middle of the ring, and the building stood up for it.',
        ],
        epilogue: [
          'Nobody had planned the handshake. Birdie just said "Huh," and then, "Let\'s see where that goes." {villain.real} looked almost relieved.',
          '{hero.real} said it felt like getting a friend back, which, in the story, it was. {villain.real} kept repeating, "They cheered. They actually cheered."',
        ],
        headline: ['THE HANDSHAKE: IS {villain} SORRY?', 'TRAITOR LOOKS BACK; CROWD GOES SOFT'],
      },
    ],
    gusWords: ['Turncoat', 'Heartbreak', 'Backstab', 'Split', 'Bust-Up', 'Double-Cross', 'Partners', 'Breakaway'],
    wants: [
      'I want them to love us as a team, so it hurts when we split.',
      'I want to break this town\'s heart, and then I want to earn it back.',
      'I want to be the one who leaves, and I want them to wonder why.',
      '{villain.real} and I are good. I want to see how good we are at pretending we aren\'t.',
    ],
    background: true,
    playerRoles: ['hero', 'villain', 'ally'],
  },

  // ------------------------------------------------------------ 5.2 The Underdog Title Chase
  {
    id: 'underdog_title',
    name: 'The Underdog Title Chase',
    register: 'hope and scrappy joy',
    blurb: 'A long shot keeps getting up, the champion keeps ducking, and the whole town wants to count the pin.',
    tags: ['title', 'heartfelt', 'spotlight', 'slow_build'],
    roles: [
      { key: 'hero', label: 'The Underdog', align: 'hero', player: true },
      { key: 'villain', label: 'The Champion', align: 'villain', player: true, champion: 'heavyweight' },
      { key: 'mentor', label: 'The Mentor', align: 'hero', optional: true, player: true },
    ],
    length: [5, 6, 8],
    cards: {
      hook: ['HK-02', 'HK-06', 'HK-19'],
      twist: ['TW-05', 'TW-15', 'TW-16', 'TW-12'],
      stakes: ['ST-01', 'ST-10'],
      payoff: ['PO-06', 'PO-09', 'PO-03', 'PO-18'],
    },
    twistAt: 'end_act2',
    needs: ['title'],
    acts: [
      [
        {
          key: 'steals_show', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 1,
          title: '{hero} in action',
          text: [
            '{hero} lost, technically. In practice {hero} kicked out of everything for fifteen minutes and got a standing ovation on the way to the back, which is not what usually happens to the loser.',
            'The pin came at the end of the best match of the night, and the building chanted {hero}\'s name anyway. {hero} limped up the aisle slapping every hand that reached out.',
            'Six near-falls, one {hero.signature} off the top, and a loss by a hair. Gus said into the microphone, "Folks, I have seen losing. That was not losing."',
          ],
          headline: ['{hero} LOSES, WINS EVERYTHING ELSE', 'STANDING OVATION FOR THE NIGHT\'S LOSER'],
        },
        {
          key: 'homemade_gear', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'the elementary school playground',
          title: 'Homemade gear at recess',
          text: [
            'Kids showed up to recess in homemade versions of {hero}\'s gear: dish towel capes, paper wristbands, and one cardboard belt that was not Pip\'s. Pip approved it anyway.',
            'Sidewalk chalk outside the library: a stick figure of {hero} holding a belt overhead, and in the corner a very small, very grumpy {villain} whose crown is falling off.',
            'Pip held a new sign at the bus stop all week: {hero} 4 CHAMP. He held it on Saturday too, when there was no bus.',
          ],
          headline: ['RECESS GOES {hero}', 'SIDEWALK CHALK PICKS A CHAMPION'],
        },
      ],
      [
        {
          key: 'the_dodge', kind: 'promo', purpose: 'heat', roles: ['villain'],
          title: 'In-ring address: {villain}',
          text: [
            '{villain} came out with the belt, thanked the crowd for its patience, and explained that a title defense against {hero} was impossible this month due to a salon appointment.',
            '{villain} produced a doctor\'s note. The note said "Champion is too busy." It was signed by {villain}. Referee Mo read it twice and handed it back.',
            '"I don\'t defend this belt against hobbies," said {villain}, polishing it with a hanky. Agnes Pickett stood up. {villain} sat down behind the ring post until she did too.',
          ],
          headline: ['CHAMPION DUCKS; CITES "SALON APPOINTMENT"', 'CHAMP\'S DOCTOR\'S NOTE SIGNED BY CHAMP'],
        },
        {
          key: 'earn_the_shot', kind: 'match', purpose: 'segment',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} vs. a midcard bruiser',
          text: [
            'Step one of earning the shot: {hero} took everything a much bigger opponent had, then hit {hero.finisher} out of nowhere. The VFW chairs rattled.',
            '{hero} won a gauntlet of two, back to back, with no rest between. The second pin was so close Mo checked her own hand afterward.',
          ],
          headline: ['{hero} ONE STEP CLOSER', 'GAUNTLET CONQUERED; THE SHOT IS EARNED'],
        },
        {
          key: 'so_close', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['villain']], winner: 1, cheat: true,
          title: 'Title match: {villain} (c) vs. {hero}',
          text: [
            '{hero} had the champion beat until {villain} found the ropes with both feet and Mo, untangling Jobber from the ring apron, never saw it. One more try.',
            'A handful of tights, a three count, and {villain} was out the door with the belt before the bell stopped ringing. {hero} sat in the middle of the ring for a long time.',
            '{villain} got a foot on the bottom rope at two and nine-tenths, then rolled {hero} up with the other foot on the middle rope. The crowd counted along and then booed what it had counted.',
          ],
          headline: ['SO CLOSE: CHAMP ESCAPES WITH FEET ON ROPES', '"ONE MORE TRY," SAYS {hero}'],
        },
        {
          key: 'gloat', kind: 'wrsl', purpose: 'wrsl', roles: ['villain'],
          title: '{villain} calls The Gravel Pit',
          text: [
            '"Close only counts in horseshoes," {villain} told The Gravel Pit, "and I don\'t play horseshoes." Gus asked if the champion had looked at the replay. Click.',
            '{villain} called WRSL to request a song dedication to {villain}. Gus played it, then played {hero}\'s entrance music twice in a row "by accident."',
          ],
          headline: ['CHAMP GLOATS ON AIR; GUS PLAYS THE WRONG SONG'],
        },
        {
          key: 'stopwatch', kind: 'town', purpose: 'town', roles: ['hero'], optional: true,
          place: 'the high school track',
          title: 'Coach Patty times the underdog',
          text: [
            'Coach Patty clocked {hero} running sprints and wrote the time on her EVIDENCE clipboard. Then she shook the stopwatch and clocked it again. Same number. She went home early.',
            'Coach Patty watched {hero} do push-ups on the track for an hour, looking for a trick. She found none and, without meaning to, counted out loud.',
          ],
          headline: ['COACH PATTY\'S STOPWATCH: "IT CAN\'T BE RIGHT"'],
        },
      ],
      [
        {
          key: 'water_tower_stairs', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the water tower stairs',
          title: 'The water tower stairs at dawn',
          text: [
            'At dawn {hero} ran the water tower stairs, top to bottom and back, while half the town cheered from the grass below. Mayor Oakes brought a cowbell.',
            'By the fifth lap up the water tower, Pip was running the bottom flight alongside {hero} in his towel cape. By the eighth, so was Sheriff Bev\'s basset hound.',
          ],
          headline: ['THE STAIRS AT DAWN: TOWN TURNS OUT FOR {hero}', 'COWBELL, CAPES AND A BASSET HOUND'],
        },
        {
          key: 'face_off', kind: 'angle', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'Face-off: {hero} & {villain}',
          text: [
            '{villain} held the belt up between them, right at eye level, and said "Look all you want." {hero} looked, and then looked at {villain}, and did not blink.',
            'No words. {hero} walked to the center of the ring, pointed at the belt, then at the rafters, and left. {villain} spent the rest of the segment explaining that it meant nothing.',
            '{villain} offered a handshake and yanked it back. {hero} had never offered one in the first place. The Sportatorium laughed so hard Gus had to wait.',
          ],
          headline: ['NOSE TO NOSE, AND NOBODY BLINKED', '{hero} POINTS AT THE BELT'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{villain.real} confessed the hanky bit was improvised. "I panicked and polished." {hero.real} laughed so hard June brought water. The hanky is now framed by the register.',
            '{hero.real} asked if the chase had dragged. Birdie stirred her coffee. "Sugar, they ran the stairs with you. Nothing dragged."',
            '{villain.real} showed {hero.real} a kid\'s drawing someone left at the merch table: a tiny {villain.real} with a crown falling off. "I\'m keeping it. It\'s the best review I ever got."',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'underdog_wins', label: 'The whole town counts the pin', winner: 'hero', weight: 0.65,
        text: [
          'The whole town counted the three, and Gus\'s voice cracked on the last one.',
          'Pip was over the barricade before anyone could stop him, cardboard belt held high next to the real one.',
        ],
        epilogue: [
          '{hero.real} set the belt on the table between the ketchup and the mustard and just looked at it. Birdie let the silence go on. "You earned the chase, sugar. The belt was the easy part."',
          '{villain.real} raised a milkshake. "To the worst salon appointment of my life." The booth clinked glasses. {hero.real} never once let go of the belt.',
        ],
        headline: ['AND NEW! {hero} DOES IT', 'THE TOWN COUNTED THREE'],
      },
      {
        id: 'respect_loss', label: 'Lost the match, won the town', winner: 'villain', weight: 0.25,
        text: [
          '{villain} kept the belt, and for one second, so quick only row one saw it, nodded at {hero}.',
          'The champion escaped with the belt, but the building gave {hero} the ovation. Someone started a "ONE MORE TIME" chant, and it hasn\'t really stopped.',
        ],
        epilogue: [
          'Birdie wrote REMATCH CLAUSE on a napkin and slid it to {hero.real}. "Next time they\'ll want it even more. Next time is the point."',
          '{hero.real} wasn\'t sad. "Did the nod read?" It read. {villain.real} practiced it twice in the mirror before the show.',
        ],
        headline: ['CHAMP RETAINS; CROWD SAYS "ONE MORE TIME"', '{hero} FALLS SHORT, STANDS TALL'],
      },
      {
        id: 'stolen_again', label: 'Robbed again', winner: 'villain', weight: 0.1,
        text: [
          '{villain} escaped with the belt and a grin, and the crowd started booing before the bell finished ringing.',
        ],
        epilogue: [
          '"We save the happy ending for when they can\'t stand it anymore," Birdie said. {hero.real} nodded, already hungry for it.',
          '{villain.real} slid a cruller across to {hero.real}. "Peace offering." It came with the villain surcharge.',
        ],
        headline: ['ROBBED! CHAMP ESCAPES AGAIN', 'TOWN DEMANDS JUSTICE FOR {hero}'],
      },
    ],
    gusWords: ['Long Shot', 'Underdog', 'Chase', 'Dream', 'Gold', 'Scrapper', 'Climb', 'Hope'],
    wants: [
      'I want to get my hands on a title.',
      'I want the kids at recess wearing my gear.',
      'I want to lose so well they beg for the rematch.',
      'I want to be the champion they can\'t wait to see lose. {hero.real} can be the one who does it.',
    ],
    background: true,
    playerRoles: ['hero', 'villain', 'mentor'],
  },

  // ------------------------------------------------------------ 5.3 The Mentor and the Student
  {
    id: 'mentor_student',
    name: 'The Mentor and the Student',
    register: 'warm and bittersweet',
    blurb: 'A reluctant legend takes a green kid under their wing, then the student has to stand alone.',
    tags: ['legacy', 'heartfelt', 'old_school', 'slow_build'],
    roles: [
      { key: 'hero', label: 'The Student', align: 'hero', player: true },
      { key: 'mentor', label: 'The Mentor', align: 'hero' },
      { key: 'villain', label: 'The Antagonist', align: 'villain' },
    ],
    length: [4, 6, 8],
    cards: {
      hook: ['HK-01', 'HK-02', 'HK-20'],
      twist: ['TW-15', 'TW-16', 'TW-01'],
      stakes: ['ST-11', 'ST-02'],
      payoff: ['PO-01', 'PO-03', 'PO-08'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'beatdown', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['villain']], winner: 1,
          title: '{hero} vs. {villain}',
          text: [
            '{villain} beat {hero} and kept going after the bell, until {mentor} walked down the aisle slowly, like someone who had promised to stay out of this, and stood in the way.',
            'It was over fast. When {villain} went to the top rope for more, {mentor} was already on the apron. {villain} thought about it, and climbed down.',
            '{villain} pinned {hero} with one foot and waved to the crowd. {mentor} came over the barricade from row three and helped {hero} up without a word.',
          ],
          headline: ['{mentor} STEPS IN', 'A LEGEND LEAVES THE CROWD TO SAVE {hero}'],
        },
        {
          key: 'courthouse_lawn', kind: 'town', purpose: 'town', roles: ['mentor', 'hero'],
          place: 'the courthouse lawn',
          title: 'Training on the courthouse lawn',
          text: [
            '{mentor} trained {hero} on the courthouse lawn at noon: footwork, falls, the old way. A crowd gathered on the benches. Coach Patty took notes "for the record."',
            '{mentor} made {hero} carry a sack of feed from Lorraine\'s store to the water tower and back "for posture." Main Street applauded every trip.',
            'Kids lined the fence to watch {mentor} drill {hero} on the same three moves for an hour. By the end the kids could do them too, on the grass, very carefully.',
          ],
          headline: ['A LEGEND IS TRAINING SOMEBODY', 'OLD-SCHOOL LESSONS ON THE COURTHOUSE LAWN'],
        },
      ],
      [
        {
          key: 'learns_the_move', kind: 'match', purpose: 'segment',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            '{hero} won with {mentor.signature}, and the old-timers in the crowd gasped like they had seen a ghost of a good memory. {mentor} nodded once from the corner.',
            'It wasn\'t pretty until it was. {hero} hit {mentor.signature} clean in the center of the ring, and Gus shouted the move\'s name before he could stop himself.',
          ],
          headline: ['{hero} HITS THE OLD MOVE', 'THE STUDENT IS LEARNING'],
        },
        {
          key: 'mentor_ambushed', kind: 'angle', purpose: 'heat', roles: ['villain', 'mentor'],
          title: 'Parking lot: {villain} & {mentor}',
          text: [
            'The camcorder caught {villain} cornering {mentor} under the parking lot\'s one buzzing light and shoving the legend into a stack of folding chairs. The Sportatorium went silent, then furious.',
            '{villain} snatched {mentor}\'s old jacket off the coat hook and wore it to the ring, too big in the shoulders, mocking the walk. Agnes Pickett asked to be let over the barricade.',
          ],
          headline: ['{villain} AMBUSHES A LEGEND', 'THE JACKET: {villain} GOES TOO FAR'],
        },
        {
          key: 'alone', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['villain']], winner: 1, cheat: true,
          title: '{hero} vs. {villain}',
          text: [
            'With nobody in the corner, {hero} kept looking back at the empty stool. {villain} noticed, and won with a thumb to the eye while Mo checked the turnbuckle.',
            '{hero} fought alone and fought well, right up until {villain} used the ropes for leverage. Gus called it "a robbery with a referee present."',
          ],
          headline: ['ALONE IN THE RING, {hero} FALLS', 'THE EMPTY CORNER'],
        },
        {
          key: 'old_timer', kind: 'wrsl', purpose: 'wrsl', roles: ['villain'],
          title: '{villain} calls The Gravel Pit', optional: true,
          text: [
            '{villain} called The Gravel Pit to say the old-timer should get a hobby. "Fishing. Knitting. Not my business." Gus read the callers\' replies on air for an hour.',
            '"Lessons are for school," {villain} told WRSL. "I\'m the test." Coach Patty called in to say that was not how tests work, then hung up before anyone could ask her why she was listening.',
          ],
          headline: ['"THE OLD-TIMER SHOULD GET A HOBBY"'],
        },
      ],
      [
        {
          key: 'the_gift', kind: 'promo', purpose: 'gohome', roles: ['mentor', 'hero'],
          title: 'In the ring: {mentor} & {hero}',
          text: [
            '{mentor} took the microphone and didn\'t talk about the match. Talked about being young, and scared, and somebody believing anyway. Then handed it to {hero}, who said "Saturday" and nothing else.',
            '{mentor} laced {hero}\'s boots in the center of the ring, double knots, the way it\'s been done for fifty years. The building was so quiet Gus whispered.',
          ],
          headline: ['THE LACES: A LEGEND\'S BLESSING', '"SATURDAY," SAYS {hero}'],
        },
        {
          key: 'whole_town_watches', kind: 'town', purpose: 'town', roles: ['mentor', 'hero'], optional: true,
          place: 'Main Street',
          title: 'The last lesson',
          text: [
            'The last lesson happened in the street outside the Hot Tag, and somehow everyone knew. Lorraine closed the feed store for twenty minutes so nobody would miss it.',
            'Agnes Pickett brought {hero} a butterscotch from Gertrude and said, "Listen to your teacher, dear." {mentor} said, "Listen to Agnes."',
          ],
          headline: ['MAIN STREET STOPS FOR THE LAST LESSON'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['mentor', 'hero'],
          title: 'The back booth',
          text: [
            '{mentor.real} admitted that teaching the move on camera felt like handing over a piece of themselves. "Good piece, though. You did it justice." {hero.real} pretended not to tear up.',
            '{hero.real} asked {mentor.real} who taught them. {mentor.real} took a long time to answer, then told the whole story, and June didn\'t close up until it was done.',
            'Birdie sat down with three coffees. "Somebody did that for me once." She didn\'t say who. Nobody asked.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'with_the_move', label: 'The student wins with the mentor\'s move', winner: 'hero', weight: 0.7,
        text: [
          '{hero} won it with {mentor.signature}, and afterward {mentor} took off a piece of gear and fastened it on {hero}.',
          'In the corner, {mentor} counted the three under their breath, then climbed in and raised {hero}\'s hand.',
        ],
        epilogue: [
          '{hero.real} wore the gear into the booth and didn\'t take it off all night. {mentor.real} kept saying "It looks better on you" like it hurt and helped at the same time.',
          '"That move\'s yours now," {mentor.real} said. "Don\'t let anybody tell you it was mine first." Birdie, from the next booth: "It was mine first." Everyone laughed.',
        ],
        headline: ['THE STUDENT BECOMES THE MASTER', 'THE HANDOVER: A LEGEND PASSES IT ON'],
      },
      {
        id: 'stood_tall', label: 'Lost the match, found the nerve', winner: 'villain', weight: 0.2,
        text: [
          '{villain} won, but {hero} got up after every single blow, and {mentor} was the first one on their feet applauding.',
        ],
        epilogue: [
          '{mentor.real} told {hero.real} that the getting-up was the lesson. "Winning\'s easy to teach. That part isn\'t."',
          '{villain.real} shook {hero.real}\'s hand under the table. "You made me look like a monster. Thanks."',
        ],
        headline: ['{hero} FALLS BUT KEEPS GETTING UP', 'THE LESSON NOBODY FORGETS'],
      },
      {
        id: 'mentor_turns', label: 'The mentor turns', winner: 'villain', weight: 0.1,
        turn: { who: 'mentor', to: 'villain' },
        text: [
          'At the worst moment {mentor} slid a chair into the ring, not to {hero}, but to {villain}. The building has not been that quiet in years.',
        ],
        epilogue: [
          '{mentor.real} apologized to {hero.real} for real, nine times, for the fake betrayal. {hero.real} said, "Are you kidding? That was the best night of my life."',
          'Birdie looked at the napkin. "Well. Now you two have a feud for the ages." {mentor.real} and {hero.real} shook on it over pie.',
        ],
        headline: ['SAY IT ISN\'T SO: {mentor} TURNS', 'THE TEACHER SOLD THE STUDENT OUT'],
      },
    ],
    gusWords: ['Lesson', 'Mentor', 'Legacy', 'Apprentice', 'Old School', 'Blessing', 'Torch', 'Laces'],
    wants: [
      'I want to learn from the best, and I want the town to watch me learn.',
      'I want to pass something on before I\'m done.',
      'I want a kid in my corner I believe in.',
      '{mentor.real} has one move nobody does anymore. I want to be the one who brings it back.',
    ],
    background: true,
    playerRoles: ['hero'],
  },

  // ------------------------------------------------------------ 5.4 The Masked Mystery
  {
    id: 'masked_mystery',
    name: 'The Masked Mystery',
    register: 'intrigue and whimsy',
    blurb: 'A masked figure keeps turning up around one wrestler, never speaking. Helper or menace? The town has theories.',
    tags: ['mask', 'mystery', 'whimsy', 'slow_build'],
    roles: [
      { key: 'hero', label: 'The Target', align: 'hero', player: true },
      { key: 'villain', label: 'The Masked Figure', align: 'any', masked: true },
      { key: 'herring', label: 'The Suspect', align: 'any', optional: true, player: true },
    ],
    length: [4, 5, 6],
    cards: {
      hook: ['HK-14', 'HK-10', 'HK-17'],
      twist: ['TW-04', 'TW-03', 'TW-11', 'TW-12'],
      stakes: ['ST-04', 'ST-02', 'ST-09'],
      payoff: ['PO-13', 'PO-01', 'PO-23'],
    },
    twistAt: 'end_act2',
    needs: ['masked'],
    acts: [
      [
        {
          key: 'slow_clap', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            '{hero} won the opener, and when the lights came up, {villain} was standing at the top of the ramp, silent, applauding slowly. Then the curtain swallowed the mask again.',
            'Halfway through {hero}\'s match the whole front row turned around. {villain} was sitting in the last row of bleachers, perfectly still, watching. By the pin, the seat was empty.',
          ],
          headline: ['THE MASK WAS WATCHING', 'WHAT DOES {villain} WANT WITH {hero}?'],
        },
        {
          key: 'fenwick_theories', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the flea market',
          title: 'Fenwick has theories',
          text: [
            'Fenwick pinned a photo of the mask to his corkboard and connected it with red string to {hero}, the water tower, and a jar of pickles. "Follow the pickles," he whispered. "Nobody ever follows the pickles."',
            'Fenwick\'s chalkboard at the flea market: WHY {hero}? Underneath, three theories, one of them involving the moon. Pip copied all three into his notebook.',
            'Fenwick sold out of every tape with a masked wrestler on the cover by 10 a.m. "Research," customers told him. He gave them all a discount.',
          ],
          headline: ['FENWICK: "FOLLOW THE PICKLES"', 'FLEA MARKET ABUZZ OVER THE MASK'],
        },
      ],
      [
        {
          key: 'helping_hand', kind: 'run-in', purpose: 'segment', roles: ['villain', 'hero'],
          title: 'Run-in: {villain}',
          text: [
            'When two opponents ganged up on {hero}, {villain} slid into the ring, cleared it without a word, and was gone before Gus found the microphone.',
            '{villain} appeared on the apron, handed {hero} a dropped wristband, and dropped back down to the floor. Nobody knows what it meant. Everybody has an opinion.',
          ],
          headline: ['THE MASK INTERVENES: FRIEND OR FOE?', 'SILENT SAVE STUNS THE SPORTATORIUM'],
        },
        {
          key: 'costly_trip', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['@any']], winner: 1,
          title: '{hero} in action',
          text: [
            '{hero} had the match won until a gloved hand reached up from under the ring and tugged an ankle. When {hero} looked under the apron, there was nobody there.',
            'The lights flickered at the worst moment. When they steadied, {villain} was standing in {hero}\'s corner, and {hero} was being pinned. Then the corner was empty.',
          ],
          headline: ['A GLOVED HAND COSTS {hero}', 'THE MASK GIVETH, THE MASK TRIPPETH'],
        },
        {
          key: 'accusation', kind: 'interview', purpose: 'segment', roles: ['hero', 'herring'], optional: true,
          title: 'Sit-down interview: {hero} & {herring}',
          text: [
            '{hero} accused {herring} on camera, pointing out that {herring} is never in the building when the mask is. {herring} said that\'s called having a life.',
            'Gus asked {herring} straight out: "Is it you under there?" {herring} took a long sip of water, said "No comment," and winked. The Tattler poll changed overnight.',
          ],
          headline: ['IS IT {herring}? "NO COMMENT"', '{hero} POINTS A FINGER'],
        },
        {
          key: 'tattler_poll', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the Turnbuckle Tattler office',
          title: 'The Tattler poll',
          text: [
            'The Tattler\'s WHO IS IT? poll got 412 ballots, more than the last mayoral race. Clementine printed every answer, including the eleven votes for "a very determined owl."',
            'Clementine stayed up past 2 a.m. counting write-ins for the Tattler poll. Mayor Oakes demanded a recount on behalf of her own theory, which she would not disclose.',
          ],
          headline: ['WHO IS IT? TATTLER POLL BREAKS RECORDS', '11 VOTES FOR "A VERY DETERMINED OWL"'],
        },
      ],
      [
        {
          key: 'calling_out', kind: 'promo', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'In-ring address: {hero}',
          text: [
            '{hero} called the mask out by name and demanded an answer. The lights went down. When they came back, a single folded note sat on the turnbuckle: a drawing of the ring, and a date.',
            '"Whoever you are under there," {hero} started, and stopped, because {villain} was suddenly standing at the top of the ramp, nodding once. Challenge accepted, apparently.',
          ],
          headline: ['THE MASK ANSWERS WITH A NOTE', 'A SILENT NOD SEALS IT'],
        },
        {
          key: 'pip_guess', kind: 'town', purpose: 'town', roles: ['hero'], optional: true,
          place: 'outside Steel Chair Hardware',
          title: 'Pip\'s sign of the week',
          text: [
            'Pip\'s new sign outside the hardware store: IT\'S MY SUBSTITUTE TEACHER. He has no evidence. He has a feeling.',
            'Pip\'s sign this week reads WHOEVER YOU ARE, GOOD LUCK. When asked who it was for, he said, "Both of them. Probably."',
          ],
          headline: ['PIP\'S PREDICTION: THE SUBSTITUTE TEACHER'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{villain.real} took the mask off in the booth and let out a breath that lasted ten seconds. "Do you know how hard it is to clap slowly? I counted. I counted out loud inside the mask."',
            '{hero.real} read the Tattler poll results aloud. {villain.real} laughed hardest at the owl. Birdie wanted to know who voted for her. "Nobody, sugar." "Good."',
            'June set down a plate of fries and a straw long enough to drink through a mask. Nobody explained how she knew. June always knows.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'mystery_kept', label: 'The mystery stays', winner: 'hero', weight: 0.45,
        text: [
          '{villain} rolled out under the bottom rope, still masked, bowed once from the ramp, and was gone. The mystery stays a mystery.',
          'When the lights came up, the mask was gone. A single wristband lay on the mat where {villain} had been standing.',
        ],
        epilogue: [
          'Everyone agreed the town is happier not knowing. {villain.real} called it "the best non-answer I ever gave."',
          'Fenwick was spotted at the door afterward with a notebook, interviewing the parking lot. Inside, {hero.real} and {villain.real} toasted the owl.',
        ],
        headline: ['THE MASK VANISHES; QUESTIONS REMAIN', 'WHO WAS IT? NOBODY KNOWS, AND THAT\'S FINE'],
      },
      {
        id: 'mask_wins', label: 'The mask takes it', winner: 'villain', weight: 0.3,
        text: [
          '{villain} stood over {hero} for a long moment, then offered a gloved hand, and left without waiting to see if {hero} took it.',
          '{villain} won, and the silence afterward was louder than any promo.',
        ],
        epilogue: [
          '{hero.real} said losing to someone who never said a word was the strangest compliment. {villain.real} signed the napkin with a little drawing instead of a name.',
          'Birdie loved it. "Leave a door open. They\'ll talk about that mask till Homecoming."',
        ],
        headline: ['SILENT VICTORY: THE MASK PREVAILS', '{villain} WINS WITHOUT A WORD'],
      },
      {
        id: 'helper_all_along', label: 'A friend all along', winner: 'hero', weight: 0.25,
        turn: { who: 'villain', to: 'hero' },
        text: [
          'Afterward {villain} raised {hero}\'s hand, then pointed to the old trip spot under the ring: it had been a test. The town decided the mask was a guardian all along.',
        ],
        epilogue: [
          '{villain.real} admitted the "test" idea came to them halfway up the aisle. {hero.real} said it was the best retcon in Sportatorium history.',
          'Gus wanted to know what the mask was testing for. Nobody knew. Birdie said that was the beauty of it.',
        ],
        headline: ['THE MASK WAS A FRIEND ALL ALONG', 'GUARDIAN IN DISGUISE?'],
      },
    ],
    gusWords: ['Mystery', 'Mask', 'Riddle', 'Stranger', 'Whodunit', 'Shadow', 'Enigma', 'Secret'],
    wants: [
      'I want the whole town guessing.',
      'I want a mystery that never fully gets solved.',
      'I want somebody watching over me, and I want nobody to know if it\'s good or bad.',
      'I want Fenwick to get a new corkboard out of this.',
    ],
    background: true,
    playerRoles: ['hero', 'herring'],
  },

  // ------------------------------------------------------------ 5.5 The Tag Team Breakup
  {
    id: 'tag_breakup',
    name: 'The Tag Team Breakup',
    register: 'comic-tragic',
    blurb: 'Best friends who can\'t stop bickering finally split, and the whole town picks a side. A reunion is never far off.',
    tags: ['tag', 'comedy', 'drama', 'betrayal'],
    roles: [
      { key: 'hero', label: 'Partner A', align: 'hero', player: true },
      { key: 'villain', label: 'Partner B', align: 'villain', player: true },
      { key: 'wedge', label: 'The Wedge', align: 'any', optional: true, player: true },
    ],
    length: [4, 5, 6],
    cards: {
      hook: ['HK-13', 'HK-08'],
      twist: ['TW-01', 'TW-18', 'TW-08', 'TW-07'],
      stakes: ['ST-09', 'ST-02', 'ST-03'],
      payoff: ['PO-01', 'PO-19', 'PO-17', 'PO-05'],
    },
    twistAt: 'end_act2',
    needs: ['allies'],
    acts: [
      [
        {
          key: 'win_and_bicker', kind: 'match', purpose: 'establish',
          sides: [['hero', 'villain'], ['@any', '@any']], winner: 0,
          title: 'Tag match: {hero} & {villain} in action',
          text: [
            '{hero} and {villain} won, then argued all the way up the aisle about whose tag won it. Gus followed them with the microphone. Neither noticed.',
            'A perfect double-team, a three count, and then a five-minute disagreement in the ring about whose idea the double-team was. The crowd cheered both sides of the argument.',
            'They won with their finisher and celebrated by bumping chests so hard they both fell over. Each blamed the other. The VFW loved every second.',
          ],
          headline: ['WINNERS STILL ARGUING', 'TEAM WINS; DEBATE CONTINUES'],
        },
        {
          key: 'fraying', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'Marigold\'s shop window',
          title: 'The matching jackets fray',
          text: [
            'Marigold\'s shop window displayed the team\'s matching jackets "in for repairs." One sleeve was noticeably shorter. Each partner blamed the other\'s elbow.',
            'The team\'s matching boots came to Marigold\'s shop separately, two days apart, each with a note: "Fix mine first."',
          ],
          headline: ['TEAM JACKETS IN FOR REPAIRS; SLEEVES UNEVEN'],
        },
      ],
      [
        {
          key: 'friendly_fire', kind: 'match', purpose: 'heat',
          sides: [['hero', 'villain'], ['@any', '@any']], winner: 1,
          title: 'Tag match: {hero} & {villain} vs. a rival pair',
          text: [
            '{villain} went for a dive and landed squarely on {hero}. {hero} went for an elbow and landed squarely on {villain}. Their opponents just watched, then covered them both.',
            'They missed three tags in a row. On the fourth, they slapped hands so hard both of them shook out their wrists, glaring, while the other team rolled them up.',
          ],
          headline: ['FRIENDLY FIRE, TIMES THREE', 'MISSED TAGS DOOM THE PARTNERS'],
        },
        {
          key: 'whispers', kind: 'promo', purpose: 'segment', roles: ['wedge', 'villain'], optional: true,
          title: 'Backstage: {wedge} & {villain}',
          text: [
            'On the big screen, {wedge} leaned in close to {villain} and whispered something. {villain} looked toward {hero}\'s locker. The crowd yelled at the screen.',
            '{wedge} handed {villain} a new jacket, single, no partner name on the back. {villain} held it up and did not say no.',
          ],
          headline: ['WHAT DID {wedge} WHISPER?', 'A NEW JACKET WITH ONLY ONE NAME'],
        },
        {
          key: 'tape_line', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'the Hot Tag Diner',
          title: 'The counter divides',
          text: [
            'June ran a strip of masking tape down the middle of the Hot Tag counter: Team {hero} on stools one through six, Team {villain} on seven through twelve. Sheriff Bev ate standing up, out of neutrality.',
            'Steel Chair Hardware printed two shirts, Team {hero} and Team {villain}, and stacked them on opposite ends of the store. Both sold out. The register had to be split too.',
            'The fourth-grade lunch table split down the middle. Pip refused to sit on either side and ate on the floor with his cardboard belt as a placemat.',
          ],
          headline: ['TOWN DIVIDED: PICK A STOOL', 'TEAM SHIRTS SELL OUT AT BOTH ENDS'],
        },
        {
          key: 'on_air_spat', kind: 'wrsl', purpose: 'wrsl', roles: ['villain', 'hero'], optional: true,
          title: 'The Gravel Pit: dueling call-ins',
          text: [
            '{villain} called The Gravel Pit to air grievances. Ninety seconds later {hero} called in to air counter-grievances. Gus put them both on the line and went to get coffee.',
            'Listeners heard {villain} insist on WRSL that {hero} always takes the good chair in the van. {hero} called in to say the chair is objectively worse. Gus called a recess.',
          ],
          headline: ['THE VAN CHAIR CONTROVERSY'],
        },
      ],
      [
        {
          key: 'sit_down', kind: 'interview', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'Sit-down interview: {hero} & {villain}',
          text: [
            'Gus\'s sit-down with the former partners: two chairs pushed as far apart as the desk allows. {hero} brought up the time {villain} forgot the music. {villain} brought up everything else.',
            'Gus asked one question, "What happened?" They both answered at once for four straight minutes. Gus nodded, said "I see," and put on his headphones.',
          ],
          headline: ['SIT-DOWN TURNS STAND-UP', 'FOUR MINUTES OF GRIEVANCES'],
        },
        {
          key: 'pip_both_shirts', kind: 'town', purpose: 'town', roles: ['hero', 'villain'], optional: true,
          place: 'Main Street',
          title: 'Pip refuses to choose',
          text: [
            'Pip wore both team shirts at once, one over the other, and announced to Main Street that he refuses to choose. Agnes Pickett told him that was very mature, and then chose.',
            'Pip\'s cardboard sign: THEY\'LL MAKE UP (PROBABLY). Clementine photographed it for the front page and wrote "We can only hope."',
          ],
          headline: ['PIP REFUSES TO CHOOSE', '"THEY\'LL MAKE UP (PROBABLY)"'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{hero.real} and {villain.real} shared a milkshake with two straws, which is how they argue for real, and agreed the van chair bit was the best thing either of them has ever done.',
            '{villain.real} admitted the sleeve thing was real. "Marigold measured wrong." Marigold, from the counter: "I measured perfect." They argued about it happily until close.',
            'Birdie asked whether they wanted to plant a reunion. They answered at the same time, "Obviously," and then argued about who said it first.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'hero_wins', label: 'Partner A wins the split', winner: 'hero', weight: 0.4,
        text: [
          '{hero} won it, then stood in the ring looking at the empty spot where {villain} used to stand for the post-match pose.',
          '{villain} lay on the mat for a while after the pin. {hero} walked over, almost offered a hand, and decided not to. Not yet.',
        ],
        epilogue: [
          '"So when\'s the reunion?" June asked. "Eight weeks," said {hero.real}. "Six," said {villain.real}. They\'re already arguing about it.',
          '{villain.real} bought {hero.real} a slice of pie "for the win." It came with a note: "Enjoy it while it lasts."',
        ],
        headline: ['{hero} WINS THE SPLIT', 'THE BREAKUP IS FINAL (FOR NOW)'],
      },
      {
        id: 'villain_wins', label: 'Partner B wins the split', winner: 'villain', weight: 0.25,
        text: [
          '{villain} won and celebrated alone, posing at the corner where the team used to pose together, and the crowd booed every flex.',
        ],
        epilogue: [
          '{villain.real} said the loneliest part of the night was the double pose with nobody there. "I\'m keeping that. It\'s sad. It\'s good sad."',
          '{hero.real} promised to win the reunion match. {villain.real} promised to be late for it.',
        ],
        headline: ['{villain} GOES IT ALONE', 'SOLO ACT TRIUMPHS'],
      },
      {
        id: 'nobody_wins', label: 'Double count-out, double milkshake', winner: null, weight: 0.35,
        text: [
          'Neither one would let the other win. They brawled up the aisle, past the merch table, and out the door, and Mo counted them both out. The crowd went home happy and divided.',
          'A double pin, both shoulders down, both hands raised. The scorecard says tie. The town says it isn\'t over.',
        ],
        epilogue: [
          'Nobody pins anybody clean. {hero.real} and {villain.real} agreed on that before the napkin was even signed. They agreed on it again over two straws and one milkshake.',
          'Birdie wrote REUNION on the napkin and underlined it twice. "Give it a season. They\'ll beg."',
        ],
        headline: ['NO WINNER, NO PEACE', 'COUNTED OUT IN THE PARKING LOT'],
      },
    ],
    gusWords: ['Breakup', 'Split', 'Kerfuffle', 'Spat', 'Divorce', 'Squabble', 'Tape Line', 'Van Chair'],
    wants: [
      'I want everybody in town to pick a side.',
      'I want the funniest breakup this building has ever seen.',
      'I want to split up with {villain.real} so we can get back together in the spring.',
      'I want to fight about the van chair in front of two thousand people.',
    ],
    background: true,
    playerRoles: ['hero', 'villain', 'wedge'],
  },

  // ------------------------------------------------------------ 5.6 The Reunion
  {
    id: 'reunion',
    name: 'The Reunion',
    register: 'joyful and teary',
    blurb: 'Two old partners who stopped speaking get beaten one at a time, until one of them finally runs in.',
    tags: ['tag', 'heartfelt', 'legacy', 'entrance'],
    roles: [
      { key: 'hero', label: 'Estranged Partner A', align: 'hero', player: true },
      { key: 'ally', label: 'Estranged Partner B', align: 'hero', player: true },
      { key: 'villain', label: 'The Common Enemy', align: 'villain', player: true },
    ],
    length: [3, 4, 5],
    cards: {
      hook: ['HK-07', 'HK-19'],
      twist: ['TW-02', 'TW-17', 'TW-16'],
      stakes: ['ST-01', 'ST-13'],
      payoff: ['PO-02', 'PO-04'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'beats_hero', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['villain']], winner: 1, cheat: true,
          title: '{hero} vs. {villain}',
          text: [
            '{villain} beat {hero} with a handful of trunks and a smirk. When someone from the back came to help, {hero} waved them off. "I don\'t need anybody."',
            '{villain} won with a thumb to the eye. {hero} refused a hand up from the referee, from Gus, and from a kid at the barricade, and walked to the back alone.',
          ],
          headline: ['{villain} TOPPLES {hero}', '"I DON\'T NEED ANYBODY," SAYS {hero}'],
        },
        {
          key: 'beats_ally', kind: 'match', purpose: 'establish',
          sides: [['ally'], ['villain']], winner: 1, cheat: true,
          title: '{ally} vs. {villain}',
          text: [
            'One week later, same story: {villain} beat {ally} with feet on the ropes, and {ally} refused help too. Two people too proud to call each other. The crowd knows the number.',
            '{villain} pinned {ally} and then pointed into the crowd, at the spot where {hero} sat. "Two down," {villain} said. "Neither of them noticed."',
          ],
          headline: ['TWO DOWN: {villain} CLAIMS ANOTHER', '{ally} FALLS, REFUSES HELP'],
        },
        {
          key: 'two_milkshakes', kind: 'town', purpose: 'town', roles: ['hero', 'ally'],
          place: 'the Hot Tag Diner',
          title: 'Opposite ends of the counter',
          text: [
            '{hero} and {ally} sat at opposite ends of the Hot Tag counter, and June set two milkshakes in the middle out of old habit. Neither moved. The milkshakes melted.',
            'The old team photo still hangs by the Hot Tag register. Both of them were seen looking at it on the same morning, ten minutes apart. June noticed. June notices everything.',
          ],
          headline: ['TWO STOOLS, TWO MILKSHAKES, NO WORDS'],
        },
      ],
      [
        {
          key: 'not_yet', kind: 'angle', purpose: 'heat', roles: ['hero', 'ally', 'villain'],
          title: 'Run-in attempt: {hero}',
          text: [
            '{villain} had {ally} trapped in the corner. {hero} came through the curtain, all the way down the aisle, up the steps, and stopped at the apron. Not yet. The crowd groaned like one person.',
            '{hero} watched {villain} beat on {ally} from the top of the ramp, fists tight, and walked back through the curtain. Agnes Pickett yelled "COWARD!" and then, softer, "Oh, honey."',
          ],
          headline: ['SO CLOSE: {hero} STOPS AT THE APRON', 'THE RUN-IN THAT WASN\'T'],
        },
        {
          key: 'old_sign', kind: 'town', purpose: 'town', roles: ['hero', 'ally'],
          place: 'Agnes Pickett\'s porch',
          title: 'Agnes finds her old sign',
          text: [
            'Agnes Pickett dug her old sign out of the attic, the one with both their names, faded but legible. She sat on her porch and re-inked every letter. "Just in case," she told the mail carrier.',
            'Gus played the old team\'s entrance music on The Gravel Pit "by accident," then played it again. The phone lines lit up with people who remembered exactly where they were the first time.',
          ],
          headline: ['AGNES DUSTS OFF THE OLD SIGN', 'WRSL PLAYS THE OLD SONG, TWICE'],
        },
        {
          key: 'has_beens', kind: 'wrsl', purpose: 'wrsl', roles: ['villain'],
          title: '{villain} calls The Gravel Pit',
          text: [
            '"Two has-beens make one has-been," {villain} told The Gravel Pit. Gus said that wasn\'t how math worked. {villain} said it was now.',
            '{villain} called WRSL to request the old team\'s song "so I can laugh at it." Gus refused and played a polka instead. {villain} hung up angrier than when the call started.',
          ],
          headline: ['"TWO HAS-BEENS MAKE ONE HAS-BEEN"'],
        },
        {
          key: 'finally', kind: 'run-in', purpose: 'segment', roles: ['hero', 'ally', 'villain'],
          title: 'Run-in: {hero}',
          text: [
            'The old music hit, and this time {hero} didn\'t stop at the apron. One clothesline, one lift, and {ally} on {hero}\'s shoulder, and the whole building on its feet.',
            '{hero} slid into the ring, pulled {villain} off {ally}, and offered a hand down. {ally} looked at it for a long moment. Then took it. Gus had to put the microphone down.',
          ],
          headline: ['THE OLD MUSIC HITS!', 'A HAND OFFERED, A HAND TAKEN'],
        },
      ],
      [
        {
          key: 'together_promo', kind: 'promo', purpose: 'gohome', roles: ['hero', 'ally'],
          title: 'In the ring: {hero} & {ally}',
          text: [
            'Standing together in the ring for the first time in ages, {hero} and {ally} finished each other\'s sentences, then laughed, then did it again on purpose.',
            '{hero} started to apologize. {ally} took the microphone and said "Later. Saturday first." The crowd started the old chant without being asked.',
          ],
          headline: ['TOGETHER AGAIN: "SATURDAY FIRST"', 'THE OLD CHANT RETURNS'],
        },
        {
          key: 'photo_back_up', kind: 'town', purpose: 'town', roles: ['hero', 'ally'], optional: true,
          place: 'the Hot Tag Diner',
          title: 'The photo comes back out',
          text: [
            'The old team photo moved from beside the Hot Tag register to the front window. June claims she just dusted it. Main Street stopped to look all day.',
            'Kids at recess tried the old double-team move on the playground, very slowly, on the soft part. The recess aide counted three.',
          ],
          headline: ['THE PHOTO IN THE WINDOW'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'ally', 'villain'],
          title: 'The back booth',
          text: [
            '{hero.real} and {ally.real} sat on the same side of the booth for the first time in the story. {villain.real} sat across and said, "Finally. Do you know how lonely it is beating you up one at a time?"',
            '{ally.real} admitted the stopping-at-the-apron week was the hardest to watch. {hero.real} admitted it was harder to do. June brought two milkshakes and one plate of fries, as always.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'old_move', label: 'Reunited and it feels so good', winner: 'hero', weight: 0.75,
        text: [
          '{hero} and {ally} finished it with their old double-team move, the one nobody had seen in years, and Agnes held her re-inked sign over her head.',
          'The old double-team landed exactly like it used to, and the three count was so loud nobody heard the bell.',
        ],
        epilogue: [
          '{hero.real} said the old move felt like riding a bike, if the bike was a person. {ally.real} said nobody has ever said anything sweeter to them.',
          'Birdie raised her coffee. "To teams. The real ones." {villain.real} raised a milkshake and said, "To being the reason."',
        ],
        headline: ['REUNITED! THE OLD MOVE RETURNS', 'AGNES WAS RIGHT TO KEEP THE SIGN'],
      },
      {
        id: 'still_together', label: 'Lost the match, kept the team', winner: 'villain', weight: 0.25,
        text: [
          '{villain} stole the win, but {hero} and {ally} walked up the aisle together, arms around each other, and the crowd clapped them all the way through the curtain.',
        ],
        epilogue: [
          '"We lost," said {ally.real}. "We lost together," said {hero.real}. June said that was the saddest happy thing she\'d heard all year.',
          '{villain.real} pointed out that a heel winning keeps the team hungry. Birdie agreed, and wrote REMATCH under the napkin\'s ketchup stain.',
        ],
        headline: ['{villain} WINS; THE TEAM ENDURES', 'TOGETHER, EVEN IN DEFEAT'],
      },
    ],
    gusWords: ['Reunion', 'Homecoming', 'Old Flame', 'Encore', 'Together', 'Second Wind', 'Old Song'],
    wants: [
      'I want to get the old team back together.',
      'I want Agnes to bring her old sign.',
      'I want the crowd to remember who we were.',
      '{ally.real} and I haven\'t been in a ring together in too long. I want them to feel it when we are.',
    ],
    background: true,
    playerRoles: ['hero', 'ally', 'villain'],
  },

  // ------------------------------------------------------------ 5.7 The Retirement Tour
  {
    id: 'retirement_tour',
    name: 'The Retirement Tour',
    register: 'bittersweet and grateful',
    blurb: 'A beloved veteran announces one last lap, every stop on the tour is a thank-you, and the farewell is a party.',
    tags: ['leaving', 'heartfelt', 'legacy', 'old_school'],
    roles: [
      { key: 'hero', label: 'The Retiree', align: 'hero', player: true },
      { key: 'villain', label: 'The Final Opponent', align: 'any', player: true },
      { key: 'successor', label: 'The Successor', align: 'hero', optional: true, player: true },
    ],
    length: [6, 8, 10],
    cards: {
      hook: ['HK-07', 'HK-19'],
      twist: ['TW-16', 'TW-13'],
      stakes: ['ST-06', 'ST-11'],
      payoff: ['PO-24', 'PO-03', 'PO-19'],
    },
    twistAt: 'end_act2',
    needs: ['retiring'],
    acts: [
      [
        {
          key: 'first_stop', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero}: first stop on the tour',
          text: [
            '{hero} won the first stop of the farewell lap, then walked the whole ring slapping hands, because every row had earned it. Gus said the VFW had never been this loud for a thank-you.',
            'A clean win with {hero.finisher}, and then {hero} did something new: bowed to all four sides of the ring, slowly. By the third side half the room had stopped clapping to wipe their eyes.',
          ],
          headline: ['{hero} BEGINS THE FAREWELL LAP', 'FIRST STOP ON THE TOUR: A STANDING OVATION'],
        },
        {
          key: 'day_in_honor', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the courthouse steps',
          title: 'A Day in {hero}\'s honor',
          text: [
            'Mayor Oakes read a proclamation on the courthouse steps declaring a Day in honor of {hero}, then ran out of breath at the fourth "whereas." The crowd finished the list for her.',
            'The Hot Tag Diner named a sandwich after {hero}, the bakery iced {hero.their} name on a sheet cake, and Agnes Pickett pressed a butterscotch into {hero.their} hand. "For the road," she said.',
          ],
          headline: ['MAYOR OAKES DECLARES A DAY FOR {hero}', 'TOWN NAMES A SANDWICH FOR {hero}'],
        },
      ],
      [
        {
          key: 'old_rival', kind: 'match', purpose: 'segment',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} vs. an old rival',
          text: [
            'An old rival came back for one night. They shook hands before the bell, then tried to take each other\'s heads off for twelve minutes, which is how respect looks in this building.',
            'The old rival got in one last cheap shot, grinned, and apologized to the crowd. {hero} laughed so hard the finish had to wait, then hit {hero.finisher} like a gift.',
          ],
          headline: ['{hero} AND AN OLD RIVAL SHARE ONE LAST NIGHT', 'RESPECT, WITH ELBOWS'],
        },
        {
          key: 'thank_you_roll', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the Hot Tag Diner',
          title: 'A roll of thank-yous',
          text: [
            'June taped a roll of paper down the Hot Tag counter so people could write thank-yous to {hero}. By closing it had reached the pie case, and Sheriff Bev had added, in careful print, "Thank you for your service."',
            'Kids at recess held a farewell parade for {hero}, with a kazoo band and a very slow wagon. Coach Patty timed it. It ran eleven minutes over, and she did not mind a bit.',
          ],
          headline: ['A ROLL OF THANK-YOUS REACHES THE PIE CASE', 'RECESS THROWS {hero} A PARADE'],
        },
        {
          key: 'earns_the_spot', kind: 'match', purpose: 'segment',
          sides: [['villain'], ['@any']], winner: 0,
          title: '{villain} earns the final spot',
          text: [
            '{villain} beat a string of challengers to earn the farewell spot, and was gracious about it, mostly. When Gus asked how it felt, {villain} said, "Like I had better not blow it."',
            '{villain} won a hard one and pointed at the poster of {hero} on the wall. Not a threat. A promise: the best night of the tour, no shortcuts.',
          ],
          headline: ['{villain} EARNS THE FINAL SPOT', '{villain} PROMISES {hero} A WORTHY FAREWELL'],
        },
        {
          key: 'notebook', kind: 'angle', purpose: 'tease', roles: ['successor', 'hero'], optional: true,
          title: 'Backstage: {hero} & {successor}',
          text: [
            'The camcorder caught {hero} showing {successor} the old entrance walk, one slow lap around the empty ring. {successor} copied every step, then added a small bow of {successor.their} own.',
            '{hero} slid a worn notebook across a table to {successor}: years of match notes, in pencil. {successor} turned a single page and read it for a very long time.',
          ],
          headline: ['{successor} STUDIES AT {hero}\'S SIDE', 'A NOTEBOOK CHANGES HANDS'],
        },
      ],
      [
        {
          key: 'one_old_pen', kind: 'contract', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'Contract signing: {hero} & {villain}',
          text: [
            '{hero} signed the farewell contract with the same pen used for the very first one, all those years ago. {villain} signed under it and added, "I\'ll try to be a good ending." The room clapped.',
            'They signed side by side, and {hero} slid the pen across with both hands, like a gift. {villain} bowed, and for a moment neither could find a way to be mean, so Gus filled the silence.',
          ],
          headline: ['THE FAREWELL CONTRACT IS SIGNED', '{hero} AND {villain} SIGN WITH ONE OLD PEN'],
        },
        {
          key: 'lobby_banner', kind: 'town', purpose: 'town', roles: ['hero'], optional: true,
          place: 'the Sportatorium lobby',
          title: 'The banner goes up',
          text: [
            'Marigold hung a banner across the Sportatorium lobby, hand-stitched, one letter per volunteer. Agnes Pickett sewed the exclamation point and informed everyone it was the best part.',
            'Hank Szabo was seen measuring a spot on the lobby wall for a plaque and swearing the tape measure to secrecy. By noon the entire town knew.',
          ],
          headline: ['A BANNER GOES UP FOR {hero}', 'A SPOT ON THE LOBBY WALL IS MEASURED'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{hero.real} ordered the last milkshake of the tour and made it last an hour. {villain.real} said the hardest part was not crying in the middle of a hold. "That\'s how you know it\'s a good match," said {hero.real}.',
            'Birdie slid a napkin across the table: a drawing of a curtain call with everybody on it. "Nobody leaves," she said. "They just move to the front row." {hero.real} kept the napkin.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'goes_out_a_winner', label: 'The legend goes out on top', winner: 'hero', weight: 0.5,
        text: [
          '{hero} won the farewell, and the whole roster came out from the back to form a tunnel, hand over hand, all the way to the curtain.',
          '{hero} raised both arms and held them there while the crowd chanted {hero.their} name. Nobody wanted the night to end, so it didn\'t, for a while.',
        ],
        epilogue: [
          '{hero.real} wore the winner\'s smile into the booth and made {villain.real} a promise: "Cameo. Someday. When you least expect it." Birdie wrote CAMEO on a napkin and slid it into her pocket.',
          '{villain.real} toasted with a milkshake. "You made me look like a million bucks." {hero.real}: "I had help." June brought fries for the whole roster.',
        ],
        headline: ['{hero} GOES OUT ON TOP', 'A TUNNEL OF HANDS FOR A LEGEND'],
      },
      {
        id: 'goes_out_a_gentleman', label: 'The torch lands in the right hands', winner: 'villain', weight: 0.4,
        text: [
          '{villain} won, then did the one thing nobody expected: knelt, and held {hero}\'s hand up in the air while the building rose.',
          '{hero} lost the farewell and took the loudest ovation of the year. Mo called it the best loss in Sportatorium history.',
        ],
        epilogue: [
          '{hero.real} said losing felt like setting down a heavy bag. "A really nice bag." {villain.real} could not stop apologizing until Birdie put a milkshake in front of {villain.real}.',
          'Birdie wrote PLAQUE on a napkin. "Next Homecoming. And a front-row seat for as long as you want it." {hero.real} said that would do just fine.',
        ],
        headline: ['{hero} STEPS ASIDE, CROWD ON ITS FEET', '{villain} WINS, THEN BOWS TO A LEGEND'],
      },
      {
        id: 'curtain_call', label: 'Everybody comes out', winner: null, weight: 0.1,
        text: [
          'The bell rang at the time limit with both still standing, and the whole locker room came out for the curtain call. Mo did not announce a winner. Nobody asked her to.',
          'Neither would go down, and neither would stop smiling. When the bell rang, Gus called it a draw and a half.',
        ],
        epilogue: [
          '{hero.real} and {villain.real} agreed a draw was the only ending that fit. Birdie added the night to the wall of framed programs, in a frame slightly too big, on purpose.',
          'June set out the good plates for the whole roster. {hero.real} signed the tablecloth. It is still there.',
        ],
        headline: ['THE FAREWELL ENDS IN A DRAW AND A HUG', 'EVERYBODY COMES OUT FOR THE CURTAIN CALL'],
      },
    ],
    gusWords: ['Farewell', 'Last Lap', 'Encore', 'Thank You', 'Curtain Call', 'Last Bell', 'Boots', 'Standing Ovation'],
    wants: [
      'I want to leave while they\'re still cheering.',
      'I want every old rival to shake my hand one more time.',
      'I want to find somebody worth handing my notebook to.',
    ],
    background: false,
    playerRoles: ['hero', 'villain', 'successor'],
  },

  // ------------------------------------------------------------ 5.8 The Comeback
  {
    id: 'comeback',
    name: 'The Comeback',
    register: 'perseverance and quiet triumph',
    blurb: 'Someone returns rusty, someone else has taken their spot, and the town helps them earn it back the slow way.',
    tags: ['heartfelt', 'spotlight', 'slow_build', 'entrance'],
    roles: [
      { key: 'hero', label: 'The Returning Wrestler', align: 'hero', player: true },
      { key: 'villain', label: 'The One Who Took Their Spot', align: 'villain', player: true },
    ],
    length: [4, 6, 8],
    cards: {
      hook: ['HK-07', 'HK-19'],
      twist: ['TW-09', 'TW-15', 'TW-16'],
      stakes: ['ST-01', 'ST-02'],
      payoff: ['PO-09', 'PO-01', 'PO-03'],
    },
    twistAt: 'end_act2',
    needs: ['returning'],
    acts: [
      [
        {
          key: 'rusty_return', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} returns',
          text: [
            '{hero} came back to a standing ovation and spent the first five minutes remembering where the ropes were. A rusty {hero.finisher} still did the job, and the crowd cheered like it had been polished.',
            'The first match back was a little slow, a little stiff, and absolutely adored. {hero} took the win and then stood in the aisle for a while, just listening to the room.',
          ],
          headline: ['{hero} IS BACK', 'THE RETURN: RUSTY AND ADORED'],
        },
        {
          key: 'welcome_back', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'Main Street',
          title: 'Welcome back, Main Street style',
          text: [
            'Lorraine hung a WELCOME BACK banner across the feed store, and Pip taped a smaller one beneath it: ABOUT TIME. Main Street honked at {hero} all the way to the diner.',
            'Coach Patty marched down Main Street and handed {hero} a sports bottle labeled SIP SLOWLY. "Doctor\'s orders," she said, "and mine." Doc Halloran, behind her, nodded approvingly.',
          ],
          headline: ['WELCOME BACK BANNERS FILL MAIN STREET', 'COACH PATTY ISSUES {hero} A WATER BOTTLE'],
        },
      ],
      [
        {
          key: 'old_news', kind: 'promo', purpose: 'heat', roles: ['villain', 'hero'],
          title: 'In-ring address: {villain}',
          text: [
            '{villain} told the crowd that {hero}\'s comeback was old news and held up a newspaper to prove it. It was an old newspaper. It had a meatloaf recipe on the front.',
            '"This is my spot now," said {villain}, standing in the middle of the ring. "Yes, I measured." Gus said on the air that he hoped {villain} had brought a tape measure.',
          ],
          headline: ['{villain} CALLS THE COMEBACK "OLD NEWS"', 'THE NEWSPAPER HAD A MEATLOAF RECIPE'],
        },
        {
          key: 'grinds_it_out', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['villain']], winner: 1,
          title: '{hero} vs. {villain}',
          text: [
            '{villain} went after the spot {hero} was protecting, and the whole building winced. It took eighteen minutes of patient, rude grinding, but {villain} won it clean and had the grace not to gloat. Much.',
            '{villain} set a brutal pace and kept it, because {hero} was still catching up to the speed of the ring. The loss was close, and the crowd stood up for {hero} anyway.',
          ],
          headline: ['{villain} OUTLASTS {hero}; COMEBACK STALLS', '{hero} FALLS SHORT, STILL STANDING'],
        },
        {
          key: 'doc_clears', kind: 'angle', purpose: 'tease', roles: ['hero'],
          title: 'Ringside: Doc Halloran',
          text: [
            'Doc Halloran climbed onto the apron mid-show and held up a laminated card reading CLEARED. {hero} did a little skip, which Doc insisted was not medically necessary.',
            'Doc took the microphone, said "{hero} is ready," and nothing else, then asked whether anybody had a spare cough drop. The building gave {hero} the loudest cheer of the month.',
          ],
          headline: ['DOC HALLORAN: "{hero} IS CLEARED"', 'A LAMINATED CARD SAYS CLEARED'],
        },
        {
          key: 'dawn_laps', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the Sportatorium parking lot',
          title: 'Dawn laps in the parking lot',
          text: [
            'At dawn {hero} ran laps around the Sportatorium lot, and one by one the town turned up with thermoses. By lap nine Agnes Pickett was calling out splits from a lawn chair.',
            'Sheriff Bev\'s basset hound ran the first lap beside {hero}, walked the second, and slept through the third. Coach Patty timed all three and filed the results under PROGRESS.',
          ],
          headline: ['TOWN TURNS OUT FOR {hero}\'S DAWN LAPS', 'BASSET HOUND PACES THE COMEBACK'],
        },
      ],
      [
        {
          key: 'new_business', kind: 'promo', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'In-ring address: {hero}',
          text: [
            '"Old news," {hero} said slowly, tasting the words. "Well, I\'m back to make some new." The crowd was on its feet before {hero} finished the sentence.',
            '{hero} walked to the center of the ring, set one boot down, and said, "This spot is the one that matters." Then {hero} pointed at {villain} and said, "You can have the rest."',
          ],
          headline: ['"NEW BUSINESS," SAYS {hero}', '{hero} DRAWS A LINE AT CENTER RING'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{hero.real} admitted the first night back was terrifying in a good way. "You were so rusty I could hear you in row three." {villain.real} said that was a favor, and ordered pie for both.',
            'Birdie reviewed the crowd meter on a napkin. "They love an underdog, sugar, but they love a comeback more." {hero.real} asked if she meant that. She said it twice.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'comeback_complete', label: 'Back on top', winner: 'hero', weight: 0.65,
        text: [
          '{hero} hit {hero.finisher} like the time away never happened, and Doc Halloran leaned over the barricade and clapped with both hands.',
          'The three count was so loud that Gus, for once, did not call it. He just held the microphone out to the crowd.',
        ],
        epilogue: [
          '{hero.real} held the win in both hands like a warm plate. "I forgot how heavy this was." Birdie: "It\'s lighter with company." Nobody spoke for a full minute, which at the Hot Tag is a record.',
          '{villain.real} bought the milkshakes and made sure nobody saw. June saw.',
        ],
        headline: ['{hero} IS BACK, AND BACK ON TOP', 'THE COMEBACK IS COMPLETE'],
      },
      {
        id: 'won_the_crowd', label: 'Lost the match, won the room', winner: 'villain', weight: 0.35,
        text: [
          '{villain} got the win, but the crowd gave its ovation to {hero}, and everybody in the building knew who had really come back.',
          'It was close. When {villain} raised an arm, the building cheered the loser instead and chanted "WELCOME BACK" until the lights went down.',
        ],
        epilogue: [
          '{hero.real} said it was strange to lose and feel like the winner. "You gave me the best night I\'ve had in a year." {villain.real}: "I know. I felt the crowd leaving my pocket."',
          'Birdie wrote REMATCH on a napkin and pushed it to {hero.real}. "They\'ll want this one. It\'s okay to lose on the way up."',
        ],
        headline: ['{villain} WINS; THE CROWD GIVES IT TO {hero}', '"WELCOME BACK" ECHOES AFTER A LOSS'],
      },
    ],
    gusWords: ['Comeback', 'Return', 'Second Wind', 'Rust', 'Grit', 'Encore', 'Rising', 'Welcome Back'],
    wants: [
      'I want the crowd to remember me, and then forget I was ever gone.',
      'I want one more run, and I want to earn it the slow way.',
      'I want to prove I\'m not old news.',
    ],
    background: false,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.9 The Hometown Hero
  {
    id: 'hometown_hero',
    name: 'The Hometown Hero',
    register: 'pride and community',
    blurb: 'A doubter says "prove it," the whole town takes it personally, and Saturday becomes a parade.',
    tags: ['hometown', 'heartfelt', 'spotlight', 'public'],
    roles: [
      { key: 'hero', label: 'The Hometown Hero', align: 'hero', player: true },
      { key: 'villain', label: 'The Doubter', align: 'any', player: true },
    ],
    length: [3, 4, 6],
    cards: {
      hook: ['HK-12', 'HK-02'],
      twist: ['TW-17', 'TW-02'],
      stakes: ['ST-13', 'ST-02', 'ST-03'],
      payoff: ['PO-01', 'PO-22', 'PO-21'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'hometown_pride', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            'The whole VFW chanted {hero}\'s name from bell to bell, and an old gym teacher in row two cried openly and blamed allergies. {hero} won, and waved to every row.',
            '{hero} came out to a homemade banner reading MAIN STREET\'S OWN, held up by six people who had never met until that morning. {hero} won and waved at the banner twice.',
          ],
          headline: ['{hero} WINS AS THE VFW SINGS ITS NAME', 'MAIN STREET\'S OWN COMES HOME TO WIN'],
        },
        {
          key: 'yearbook', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the Turnbuckle Tattler office',
          title: 'The yearbook photo',
          text: [
            'Clementine ran {hero}\'s old yearbook photo on the front page with the caption MOST LIKELY TO SUPLEX THE SCIENCE FAIR. Three classmates called to say it was a very accurate prediction.',
            'Half the town dug out old yearbooks and brought them to the Tattler office. Clementine printed every one, including {hero} in a paper crown next to a pie. "Nobody asked for this," she wrote. "And yet."',
          ],
          headline: ['TATTLER DIGS UP {hero}\'S YEARBOOK PHOTO', 'MOST LIKELY TO SUPLEX THE SCIENCE FAIR'],
        },
      ],
      [
        {
          key: 'prove_it', kind: 'interview', purpose: 'heat', roles: ['villain', 'hero'],
          title: 'Sit-down interview: {villain} & {hero}',
          text: [
            'Gus asked {villain} about the hometown crowd. "Loud," said {villain}. "Loud isn\'t good. Prove it." {hero} smiled and said nothing, which got an even louder cheer.',
            '{villain} told Gus a hometown crowd will cheer anything that stands still long enough. {hero} stood completely still and the crowd cheered, and {villain} left the interview a little early.',
          ],
          headline: ['"PROVE IT," {villain} TELLS THE HOMETOWN', 'CROWD CHEERS {hero} FOR STANDING STILL'],
        },
        {
          key: 'teapot', kind: 'wrsl', purpose: 'wrsl', roles: ['villain'],
          title: '{villain} calls The Gravel Pit',
          text: [
            '{villain} called The Gravel Pit and described the water tower as "a very large teapot with ambitions." Gus put on sad music, and three listeners called back with their own tower stories.',
            '"I\'ve seen taller towers on a chess board," {villain} told WRSL. Gus said, very calmly, that the line was now open for apologies. It stayed open all afternoon.',
          ],
          headline: ['{villain} CALLS THE WATER TOWER A TEAPOT', 'WRSL LINES LIGHT UP TO DEFEND THE TOWER'],
        },
        {
          key: 'mayor_weighs_in', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'the courthouse steps',
          title: 'The Mayor weighs in',
          text: [
            'Mayor Oakes held a press conference on the courthouse steps to defend the water tower. Coach Patty stepped up beside her and vouched for {hero}: "I had them in third period. Never once late."',
            'Mayor Oakes issued a statement: "The water tower has stood here longer than anybody has been insulting it." Coach Patty added that {hero} always did the homework, and the extra credit.',
          ],
          headline: ['MAYOR OAKES DEFENDS THE WATER TOWER', 'COACH PATTY VOUCHES: "NEVER ONCE LATE"'],
        },
        {
          key: 'earn_it', kind: 'match', purpose: 'segment',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            '{hero} took on all comers with half the town on its feet and won with {hero.finisher}. Behind the barricade somebody\'s grandmother rang a cowbell the whole time.',
            'It was a hard, ugly win, the kind you earn in your own hometown with every neighbor watching. {hero} bowed to the crowd, and the crowd stood up for the bow.',
          ],
          headline: ['{hero} PROVES IT', 'ANOTHER WIN FOR THE HOMETOWN'],
        },
      ],
      [
        {
          key: 'foot_of_the_tower', kind: 'angle', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'Face-off: {hero} & {villain}',
          text: [
            '{hero} and {villain} met at the foot of the water tower for the cameras. {villain} reached up and tapped the ladder as if testing it, and Mayor Oakes cleared her throat very loudly from the back.',
            '{villain} looked up at the water tower for a long moment. "Fine," {villain} said. "It\'s a tall teapot." Half the crowd cheered. The other half went back to booing, out of habit.',
          ],
          headline: ['FACE-OFF AT THE FOOT OF THE WATER TOWER', '{villain} ADMITS: "A TALL TEAPOT"'],
        },
        {
          key: 'rehearsal', kind: 'town', purpose: 'town', roles: ['hero'], optional: true,
          place: 'Main Street',
          title: 'Main Street rehearses',
          text: [
            'Mayor Oakes rehearsed a speech on Main Street for an audience of pigeons, with two sets of notes, and was heard to say, "Whatever happens, we are proud." The pigeons applauded, or left.',
            'Marigold stitched a very large ribbon and set it in her shop window with a sign: NOT FOR SALE (YET). Main Street walked by it twice. Pip walked by it four times.',
          ],
          headline: ['MAYOR REHEARSES FOR AN AUDIENCE OF PIGEONS', 'A VERY LARGE RIBBON APPEARS IN A WINDOW'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{villain.real} confessed the teapot line took three tries to say with a straight face. {hero.real} said the best part was the Mayor\'s cough. June served pie to the whole booth, on the house, in honor of the tower.',
            '{hero.real} said a hometown story felt like wearing a favorite sweater. Birdie said she had waited years for somebody to say so, and added it to the framed napkin she keeps in her desk.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'key_to_the_city', label: 'Mayor Oakes hands over the key', winner: 'hero', weight: 0.55,
        text: [
          'Mayor Oakes climbed into the ring with a gold-painted key the size of a tennis racket and presented it to {hero}, and the crowd made a sound Gus could only call "town-shaped."',
          'The key to the city, in front of the whole VFW. {hero} held it above {hero.their} head like a belt.',
        ],
        epilogue: [
          '{hero.real} hung the key over the booth. June said it would stay there as long as the booth did. Nobody asked how long that would be.',
          '{villain.real} offered a toast: "To the water tower." Everybody drank. The water tower, being a tower, said nothing.',
        ],
        headline: ['MAYOR OAKES HANDS {hero} THE KEY TO THE CITY', 'THE HOMETOWN HEARS ITS NAME'],
      },
      {
        id: 'doubter_converted', label: 'The doubter comes around', winner: 'hero', weight: 0.25,
        turn: { who: 'villain', to: 'hero' },
        text: [
          '{villain} lost, stood up, and said into the microphone, "Fine. It\'s a good town." The building held its breath, and then roared.',
          '{villain} climbed to the second rope and applauded {hero}. Mayor Oakes struck the water tower insult from the record on the spot.',
        ],
        epilogue: [
          '{villain.real} said the hardest part was saying "good town" in front of everybody. "I meant it, though." Birdie wrote it on a napkin and put it in her pocket.',
          '{hero.real} offered {villain.real} a slice of butterscotch pie, and {villain.real} accepted. Agnes Pickett was seen nodding approvingly from the next booth.',
        ],
        headline: ['{villain} DECLARES IT A GOOD TOWN', 'THE DOUBTER COMES AROUND'],
      },
      {
        id: 'tough_night', label: 'Lost the match, kept the town', winner: 'villain', weight: 0.2,
        text: [
          '{villain} won, but {hero} got an ovation louder than any victory, and Mayor Oakes presented the key to the city anyway, "for effort, and for being from here."',
          'It wasn\'t {hero}\'s night, and nobody in the building cared. They chanted {hero.their} name until the janitor flicked the lights.',
        ],
        epilogue: [
          '{hero.real} said losing in front of the hometown is the best way to lose. "They didn\'t let me feel it for one second." {villain.real}: "I felt it for you."',
          'Birdie scribbled REMATCH, then crossed it out. "No. Let this one sit. Let them love you for a week."',
        ],
        headline: ['{villain} WINS, BUT THE TOWN KEEPS {hero}', 'A KEY TO THE CITY FOR A LOSING EFFORT'],
      },
    ],
    gusWords: ['Hometown', 'Homegrown', 'Pride', 'Local Legend', 'Key to the City', 'Prove It', 'Main Street', 'Water Tower'],
    wants: [
      'I want to show this town I\'m worth every cheer.',
      'I want somebody to doubt me out loud so I can answer in front of everybody.',
      'I want the key to the city, and I\'ll settle for a parade.',
    ],
    background: true,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.10 The Ornery Twin
  {
    id: 'ornery_twin',
    name: 'The Ornery Twin',
    register: 'comedy and mystery',
    blurb: 'The hero is seen in two places at once, a look-alike keeps turning up, and nobody here is evil. The twin is just ornery and a little lonely.',
    tags: ['mystery', 'comedy', 'whimsy', 'swerve'],
    roles: [
      { key: 'hero', label: 'The Original', align: 'hero', player: true },
      { key: 'villain', label: 'The Twin', align: 'any', player: true },
      { key: 'bystander', label: 'The Confused Bystander', align: 'any', optional: true, player: true },
    ],
    length: [3, 4, 5],
    cards: {
      hook: ['HK-20', 'HK-14'],
      twist: ['TW-06', 'TW-11', 'TW-18'],
      stakes: ['ST-11', 'ST-09'],
      payoff: ['PO-01', 'PO-02', 'PO-13'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'third_row', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            '{hero} won, but kept glancing at the third row, where somebody in identical gear was leaving. The crowd turned to look, and the seat was empty, which got a very small round of applause.',
            'Halfway through the match Gus announced {hero}\'s entrance music. {hero} was already in the ring. The curtain opened, and the crowd saw nobody there. Mo checked the tape twice.',
          ],
          headline: ['{hero} WINS; WHO WAS IN THE THIRD ROW?', 'THE ENTRANCE THAT BROUGHT NOBODY'],
        },
        {
          key: 'line_cutter', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'Tallbridge Bakery',
          title: 'Two places at once',
          text: [
            'At 9:02 someone who looked exactly like {hero} cut the line at the bakery. At 9:02, {hero} was at the gym. Both facts have witnesses, and the line has opinions.',
            'The bakery swears {hero} bought the last cruller at 8:15 and said not a word. The gym swears {hero} was lifting at 8:15 and said plenty. Sheriff Bev has opened a folder marked CRULLER MATTER.',
          ],
          headline: ['{hero} SEEN AT BAKERY AND GYM AT ONCE', 'THE CRULLER MATTER: A FOLDER IS OPENED'],
        },
      ],
      [
        {
          key: 'mirror_hallway', kind: 'angle', purpose: 'segment', roles: ['hero', 'villain'],
          title: 'Backstage: {hero}',
          text: [
            'The camcorder caught {hero} walking toward a long hallway mirror, and someone in matching gear walking toward it from the other side. When they reached the glass, only one of them was there.',
            'Two sets of boots under the locker room door, two voices saying "No, YOU go first," and then the door opened and only {hero} walked out, looking confused. The Sportatorium made one long "whoa."',
          ],
          headline: ['THE MIRROR HALLWAY: TWO OF {hero}?', 'TWO SETS OF BOOTS, ONE {hero}'],
        },
        {
          key: 'two_heroes', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['@any']], winner: null,
          title: '{hero} in action',
          text: [
            'Gus introduced {hero} from the aisle. Then Gus introduced {hero} from the ring. Mo looked at both, put down the bell, and declared a no contest on grounds of confusion.',
            'The opponent climbed the ropes and pointed at a figure in the far corner wearing {hero}\'s gear. By the time the crowd looked back, the ring was a schmozz and Mo had lost count of everything.',
          ],
          headline: ['TWO OF THEM? MO CALLS NO CONTEST', 'REFEREE CALLS MATCH "TOO CONFUSING"'],
        },
        {
          key: 'bev_detains', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'Main Street',
          title: 'Sheriff Bev arrests the wrong one',
          text: [
            'Sheriff Bev stopped {hero} outside the hardware store over the bakery cruller incident. {hero} explained the alibi. Sheriff Bev wrote it down, nodded, and detained {hero} anyway, politely, "for questioning."',
            'Sheriff Bev walked {hero} toward the courthouse in the gentlest custody. Halfway there, someone who looked exactly like {hero} waved from across the street. Bev put down her pen. "That\'s a problem," she said.',
          ],
          headline: ['SHERIFF BEV DETAINS {hero} OVER CRULLER', 'WRONG {hero}? BEV "HAS QUESTIONS"'],
        },
        {
          key: 'confused_morning', kind: 'angle', purpose: 'tease', roles: ['bystander', 'hero'], optional: true,
          title: 'Backstage: {bystander} & {hero}',
          text: [
            '{bystander} said good morning to {hero} in the hallway, and ten seconds later said good morning to {hero} again, from the other end. {bystander} then stood very still for some time.',
            '{bystander} followed one {hero} into the locker room and the other {hero} out. By the end of the segment {bystander} had asked three different people if the building was tilting.',
          ],
          headline: ['{bystander} HAS A VERY CONFUSING MORNING'],
        },
      ],
      [
        {
          key: 'bring_your_own_boots', kind: 'promo', purpose: 'gohome', roles: ['hero'],
          title: 'In-ring address: {hero}',
          text: [
            '"Whoever you are," {hero} told the empty second row, "I\'m not mad. I\'m curious. Saturday, bring your own boots." A single sock came flying out of the dark, and the crowd erupted.',
            '{hero} looked into the camera and politely asked the look-alike to come forward. The lights went down. When they came back, a folded note sat at center ring: SATURDAY. MATCHING JACKETS OPTIONAL.',
          ],
          headline: ['"BRING YOUR OWN BOOTS," SAYS {hero}', 'A NOTE AT CENTER RING: "SATURDAY"'],
        },
        {
          key: 'double_order', kind: 'town', purpose: 'town', roles: ['hero'], optional: true,
          place: 'the Hot Tag Diner',
          title: 'Two orders, one hero',
          text: [
            'June received two identical orders for {hero}\'s usual, one at the counter and one by phone, at the exact same moment. She delivered both with one raised eyebrow.',
            'The Hot Tag put out two milkshakes, two straws and one empty stool. By closing the stool was still empty and both milkshakes were gone. June is saying nothing.',
          ],
          headline: ['TWO ORDERS, ONE {hero}, AND JUNE SAYS NOTHING', 'THE EMPTY STOOL STRIKES AGAIN'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{villain.real} said the bakery bit was the funniest thing {villain.real} had ever done. "I really did want that cruller." {hero.real} paid for it, which seemed only fair.',
            'Birdie asked who came up with the entrance-music trick. Both answered at once, then pointed at each other. June put two forks in one slice of pie and told them to share.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'twin_noticed', label: 'The twin is finally noticed', winner: 'hero', weight: 0.4,
        text: [
          '{villain} stepped forward in matching gear and said, "I just wanted somebody to notice me." The building went quiet, and then {hero} grinned and said, "We noticed."',
          'When the music stopped, {villain} bowed, and {hero} bowed back. For the first time all month there were two people in the ring who looked alike, and nobody asked which was which.',
        ],
        epilogue: [
          '{villain.real} said the bakery line was the loneliest part. "Everybody looked at you, never at me." {hero.real}: "I looked." {villain.real}: "I know. That\'s why I cut."',
          'Birdie wrote TAG PARTNER? on a napkin. {hero.real} and {villain.real} pointed at each other and said "Maybe," at the same time.',
        ],
        headline: ['THE TWIN: "I JUST WANTED TO BE NOTICED"', '{hero} AND {villain}: TWO OF A KIND'],
      },
      {
        id: 'twin_wins', label: 'The twin steals the night', winner: 'villain', weight: 0.25,
        text: [
          '{villain} won, then took a bow and a half, one for the win and half for finally being seen. Nobody booed. Not even {hero}, who was still a little confused.',
          'The win got a bigger cheer than anyone expected, and {villain} didn\'t know what to do with it. {villain} stood there blinking until Mo handed over a towel.',
        ],
        epilogue: [
          '{villain.real} said the cheer was the best sound ever. "I think I want to do that again." Birdie put REMATCH in the corner of the napkin and nobody argued.',
          '{hero.real} said losing to {villain.real} felt like losing to a very funny mirror. Both agreed the rematch had to be soon.',
        ],
        headline: ['THE TWIN STEALS THE NIGHT', '{villain} WINS; CROWD CHEERS THE LOOK-ALIKE'],
      },
      {
        id: 'partners', label: 'The twin joins the team', winner: 'hero', weight: 0.35,
        turn: { who: 'villain', to: 'hero' },
        text: [
          'After the bell {villain} offered a hand, and {hero} pulled {villain} up. The two of them posed together, and the crowd decided right then which side it was on: both.',
          '{hero} handed {villain} a matching jacket, a real one this time, sized right. {villain} put it on and held both arms out, speechless.',
        ],
        epilogue: [
          '{hero.real} and {villain.real} announced a tag team on the spot and promptly argued over the name. Birdie gave them a week.',
          'June added a second stool next to {hero.real}\'s at the Hot Tag counter, with {villain.real}\'s name on a strip of masking tape.',
        ],
        headline: ['THE TWIN JOINS THE TEAM', 'TWO OF THEM, ONE TAG TEAM'],
      },
    ],
    gusWords: ['Double', 'Look-Alike', 'Mirror', 'Twin', 'Mix-Up', 'Two of Them', 'Line Cutter', 'Cruller Matter'],
    wants: [
      'I want the town arguing about which one of us is the real me.',
      'I want to be in two places at once.',
      'I want to hand Sheriff Bev the strangest case of her career.',
    ],
    background: true,
    playerRoles: ['hero', 'villain', 'bystander'],
  },

  // ------------------------------------------------------------ 5.11 The Stolen Belt
  {
    id: 'stolen_belt',
    name: 'The Stolen Belt',
    register: 'caper comedy',
    blurb: 'The belt goes missing, Sheriff Bev opens a case file, and a suspiciously belt-shaped figure keeps turning up around town.',
    tags: ['title', 'comedy', 'crime_kayfabe', 'whimsy'],
    roles: [
      { key: 'hero', label: 'The Champion', align: 'hero', player: true, champion: 'heavyweight' },
      { key: 'villain', label: 'The Thief', align: 'villain', player: true },
      { key: 'detective', label: 'The Detective', align: 'any', optional: true },
    ],
    length: [3, 4, 5],
    cards: {
      hook: ['HK-05', 'HK-10'],
      twist: ['TW-14', 'TW-11', 'TW-03'],
      stakes: ['ST-01', 'ST-09'],
      payoff: ['PO-15', 'PO-06', 'PO-04'],
    },
    twistAt: 'end_act2',
    needs: ['title'],
    acts: [
      [
        {
          key: 'bare_waist', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            '{hero} wrestled in a plain robe with an empty hook where the belt used to hang, and won anyway, mostly out of stubbornness. Gus said a champion without a belt is just a very good wrestler, "which is worse."',
            'Every time {hero} reached for the belt at {hero.their} waist, there was nothing there. The crowd laughed, then applauded, then chanted "FIND IT" until the bell.',
          ],
          headline: ['{hero} WINS WITHOUT THE BELT', 'CROWD CHANTS "FIND IT"'],
        },
        {
          key: 'case_file', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the Sheriff\'s office',
          title: 'Sheriff Bev opens a case file',
          text: [
            'Sheriff Bev opened a case file on the missing belt and taped a drawing of it to her door. Her basset hound was assigned to the case, and promptly sat on the drawing.',
            'A hand-lettered sign went up at the sheriff\'s office: MISSING, ONE BELT, GOLD, VERY SHINY. Within the hour the line to give tips ran past the courthouse, and most of the tips were about donuts.',
          ],
          headline: ['SHERIFF BEV OPENS A CASE FILE ON THE BELT', 'BASSET HOUND ASSIGNED; SITS ON THE EVIDENCE'],
        },
      ],
      [
        {
          key: 'bakery_sighting', kind: 'town', purpose: 'town', roles: ['villain'],
          place: 'Tallbridge Bakery',
          title: 'The belt buys a donut',
          text: [
            'A figure in sunglasses walked into the bakery wearing the missing belt over a raincoat and ordered a cruller "for a friend." The figure moved exactly like {villain}. {villain}, when asked, said "Who?"',
            'Somebody in a trench coat, a fake mustache and a championship belt bought a donut at 7 a.m. and paid in exact change. Witnesses agree the figure looked a great deal like {villain}.',
          ],
          headline: ['BELT SPOTTED AT BAKERY, BUYING A DONUT', 'THE FIGURE LOOKED A LOT LIKE {villain}'],
        },
        {
          key: 'clue_call', kind: 'wrsl', purpose: 'wrsl', roles: ['hero'],
          title: '{hero} calls The Gravel Pit',
          text: [
            '{hero} called The Gravel Pit to say the belt was "gone, and I\'m not mad, I\'m just ready to be." Gus read Sheriff Bev\'s clue list on the air: a crumb, a footprint, and a note that says only "ha."',
            '"Call this number if you\'ve seen a belt," {hero} told WRSL, and recited the Sportatorium phone number twice by accident. By noon Gus had taken sixty-one calls, nine about the belt.',
          ],
          headline: ['CHAMP ASKS WRSL TO HELP FIND THE BELT', 'SIXTY-ONE CALLS, NINE ABOUT THE BELT'],
        },
        {
          key: 'parade_float', kind: 'town', purpose: 'town', roles: ['villain'],
          place: 'Main Street',
          title: 'The belt in the parade',
          text: [
            'Entry fourteen in the Founders Day parade was a float with one sign, NOTHING TO SEE HERE, and the missing belt on a papier-mache owl. The driver wore a mustache and a trench coat. Sheriff Bev took notes.',
            'The belt turned up hanging from the fourth rung of the water tower ladder with a sign: CAUGHT YOU LOOKING. Half of Main Street gathered at the base and pointed. The other half took pictures.',
          ],
          headline: ['BELT SPOTTED ON A PARADE FLOAT', 'THE BELT ON THE WATER TOWER LADDER'],
        },
        {
          key: 'stakeout', kind: 'angle', purpose: 'tease', roles: ['detective', 'villain'], optional: true,
          title: 'Stakeout: {detective}',
          text: [
            '{detective} hid behind the merch table with binoculars and a very small hat. {villain} walked right past twice, whistling. {detective} wrote down "suspicious whistling."',
            '{detective} dusted the gym for clues and found a donut crumb, a nameless fingerprint and a trophy that had been quietly moved two inches to the left. The case deepened.',
          ],
          headline: ['{detective} CRACKS THE CASE (ALMOST)', 'THE CLUE: A TROPHY MOVED TWO INCHES'],
        },
      ],
      [
        {
          key: 'return_terms', kind: 'contract', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'Contract signing: {hero} & {villain}',
          text: [
            '{villain} slid a ransom note across the table, written in crayon: ONE MATCH, THEN THE BELT GOES HOME. {hero} signed with a pen on a chain, and Sheriff Bev stamped the page as evidence.',
            '{villain} offered to return the belt for one fair match and a promise that nobody would bring up the donut. {hero} agreed to the match and made no promises about the donut.',
          ],
          headline: ['THE THIEF NAMES THE TERMS: ONE MATCH', 'RANSOM NOTE WRITTEN IN CRAYON'],
        },
        {
          key: 'bev_deadline', kind: 'town', purpose: 'town', roles: ['hero', 'villain'], optional: true,
          place: 'the courthouse steps',
          title: 'Sheriff Bev sets a deadline',
          text: [
            'Sheriff Bev stood on the courthouse steps and announced that the case would be "closed on Saturday, one way or another." Her basset hound nodded, or yawned.',
            'Mayor Oakes ordered the town to leave the water tower ladder alone, "for everyone\'s safety, and the ladder\'s dignity." Main Street obeyed with great reluctance.',
          ],
          headline: ['SHERIFF BEV: CASE CLOSED SATURDAY', 'MAYOR PROTECTS THE LADDER\'S DIGNITY'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{villain.real} confessed the trench coat came from the lost and found. "It had a name tag." {hero.real} asked whose, and {villain.real} said, "Gus." Gus, from the next booth, said nothing and went pink.',
            'June set a plate of donuts in the middle of the table and said "Evidence." Everyone took one. Birdie declared the case closed and the donuts open.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'champion_reclaims', label: 'The belt goes home', winner: 'hero', weight: 0.55,
        text: [
          '{hero} reclaimed the belt, polished it on a sleeve and buckled it back on. It came home whole and shiny, with a ribbon around it and a note: SORRY. (NOT SORRY.)',
          'The belt returned to {hero}\'s waist in front of the whole building, in perfect condition, and Sheriff Bev stamped the case file SOLVED with enormous satisfaction.',
        ],
        epilogue: [
          '{hero.real} wore the belt into the booth and refused to take it off, even to eat. "Never again do I leave it unattended." June, passing: "It\'s on your waist." "I know. I\'m checking."',
          'Birdie closed the real case file and put it in a drawer marked CAPERS. "Every town needs one a year."',
        ],
        headline: ['THE BELT IS HOME; CASE SOLVED', '{hero} GETS THE BELT BACK, WHOLE AND SHINY'],
      },
      {
        id: 'caper_pays_off', label: 'The thief wins it fair', winner: 'villain', weight: 0.3,
        text: [
          '{villain} won, and this time everything was above board: a referee, a signed receipt and Sheriff Bev\'s blessing. The belt was in perfect condition. "Finders keepers," said {villain}, "fair and square."',
          '{villain} held the belt overhead for one proud second, then handed it to Mo for inspection. No dents, no scratches. The crowd booed so loudly it almost counted as applause.',
        ],
        epilogue: [
          '{villain.real} said stealing the belt was easy, but winning it was the part that counted. {hero.real} said that was the nicest thing a thief has ever said.',
          '{hero.real} took the loss gracefully and the receipt ungracefully. "Rematch clause." Birdie wrote it on a napkin and slid it back.',
        ],
        headline: ['THE THIEF WINS IT FAIR AND SQUARE', '{villain} TAKES THE BELT; SHERIFF SIGNS OFF'],
      },
      {
        id: 'community_service', label: 'Case closed, sentence served', winner: 'hero', weight: 0.15,
        text: [
          'The belt came home, and Sheriff Bev sentenced {villain} to one week of polishing every trophy in the Sportatorium lobby. {villain} accepted the sentence with only slight grumbling.',
        ],
        epilogue: [
          '{villain.real} polished for four days and then admitted to liking it. "There\'s something calming about a very shiny thing." Birdie filed the line in her napkin drawer.',
          'June served the sentence a free milkshake. "Time off for good behavior," she said.',
        ],
        headline: ['THIEF SENTENCED TO TROPHY POLISHING', 'SHERIFF BEV CLOSES THE CASE WITH A TOOTHBRUSH'],
      },
    ],
    gusWords: ['Heist', 'Caper', 'Missing Belt', 'Case File', 'Sticky Fingers', 'Whodunit', 'Lost and Found', 'Trench Coat'],
    wants: [
      'I want Sheriff Bev to get the biggest case of her career.',
      'I want to wear a championship belt through the bakery and have the whole town pretend not to notice.',
      'I want the town playing detective for a month.',
    ],
    background: true,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.12 The Secret Admirer
  {
    id: 'secret_admirer',
    name: 'The Secret Admirer',
    register: 'sweet, funny and romantic',
    blurb: 'Roses show up in a locker, notes appear on the big screen, and the whole town guesses who they are from.',
    tags: ['romance', 'whimsy', 'heartfelt', 'mystery'],
    roles: [
      { key: 'hero', label: 'The Admired', align: 'hero', player: true },
      { key: 'villain', label: 'The Secret Admirer', align: 'any', player: true },
      { key: 'decoy', label: 'The Decoy Suspect', align: 'any', optional: true, player: true },
    ],
    length: [3, 4, 6],
    cards: {
      hook: ['HK-09', 'HK-10'],
      twist: ['TW-03', 'TW-11', 'TW-02'],
      stakes: ['ST-09', 'ST-02'],
      payoff: ['PO-02', 'PO-23'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'swooning_win', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            '{hero} won, then found a single rose on the top turnbuckle with no card. {hero} held it through the whole post-match interview while Gus tried, and failed, to ask about anything else.',
            'Someone had tucked a note into the corner pad: "You were wonderful tonight." {hero} blushed so hard that Mo asked if the lights were too warm. The VFW swooned in unison.',
          ],
          headline: ['A ROSE ON THE TURNBUCKLE FOR {hero}', '{hero} BLUSHES; THE VFW SWOONS'],
        },
        {
          key: 'rose_cupcakes', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'Main Street',
          title: 'Main Street swoons',
          text: [
            'The bakery added a rose-petal cupcake to the case in honor of the mystery and sold out by ten. Agnes Pickett studied the handwriting on the card "for science."',
            'Lorraine\'s feed store reported selling a single sunflower to someone in a very obvious hat, and refused to say more. "Professional ethics," she said, and went back to sorting seed packets.',
          ],
          headline: ['BAKERY ADDS ROSE CUPCAKE; MYSTERY DEEPENS', 'A SUNFLOWER, A HAT, AND NO NAMES'],
        },
      ],
      [
        {
          key: 'whistle_help', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            'With {hero} down and the count at eight, someone whistled three notes of {hero}\'s entrance song from the cheap seats, and {hero} was up on both feet. Nobody could find the whistler.',
            'A towel sailed into {hero}\'s corner from the crowd just when it was needed, with a tiny heart drawn in one corner. {hero} won a minute later and kissed the towel.',
          ],
          headline: ['A MYSTERY WHISTLE SAVES {hero}', 'A TOWEL WITH A TINY HEART'],
        },
        {
          key: 'dedication', kind: 'wrsl', purpose: 'wrsl', roles: ['hero'],
          title: 'A dedication on The Gravel Pit',
          text: [
            'A caller with a voice disguised by a kazoo dedicated a slow song to {hero} on The Gravel Pit and hung up. Gus played it all the way through without commentary, which for Gus is a love letter.',
            'Gus took a call from "a friend" who asked for one song and no questions. He played it, then spent the hour taking guesses from listeners. Nobody guessed right, and several guessed Gus.',
          ],
          headline: ['MYSTERY DEDICATION ON THE GRAVEL PIT', 'LISTENERS GUESS; SEVERAL GUESS GUS'],
        },
        {
          key: 'bridge_club_pool', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'Agnes Pickett\'s porch',
          title: 'The bridge club opens a pool',
          text: [
            'Agnes Pickett\'s bridge club opened a pool on the identity of the admirer, stakes in butterscotch. By Wednesday there were forty-one entries, three of which were Gertrude\'s cat.',
            'The bridge club penciled in eleven names and one very sincere "maybe." Clementine kept the ledger, and refused to say whether her own name was in it.',
          ],
          headline: ['BRIDGE CLUB OPENS A POOL ON THE ADMIRER', 'FORTY-ONE ENTRIES; THREE ARE A CAT'],
        },
        {
          key: 'decoy_certain', kind: 'interview', purpose: 'segment', roles: ['decoy', 'hero'], optional: true,
          title: 'Sit-down interview: {decoy} & {hero}',
          text: [
            'Gus asked {decoy} if the roses were from a certain someone. "Obviously it\'s me," said {decoy}. "Who else leaves flowers for a person of my caliber?" {hero} said nothing, kindly.',
            '{decoy} arrived with a bouquet and a speech for "the admirer," and was informed it wasn\'t {decoy}. {decoy} asked for a second opinion, and then a third.',
          ],
          headline: ['{decoy} IS SURE THE ROSES ARE FOR {decoy}', 'THE DECOY WANTS A SECOND OPINION'],
        },
      ],
      [
        {
          key: 'last_note', kind: 'angle', purpose: 'gohome', roles: ['hero'],
          title: 'Big screen: a final note',
          text: [
            'The big screen lit up with a single hand-lettered note: SATURDAY. LOOK UP. The crowd gasped, and {hero} stared at the rafters, then at the exits, then at the rafters again.',
            'A bouquet arrived at ringside addressed to {hero}, with a tag that read I WON\'T HIDE MUCH LONGER. Gus read it out twice, once for each side of the building.',
          ],
          headline: ['"SATURDAY. LOOK UP." A FINAL NOTE FOR {hero}', 'THE ADMIRER PROMISES NOT TO HIDE MUCH LONGER'],
        },
        {
          key: 'ribbon_shortage', kind: 'town', purpose: 'town', roles: ['hero'], optional: true,
          place: 'Main Street',
          title: 'Main Street runs out of ribbon',
          text: [
            'Steel Chair Hardware ran out of ribbon and Lorraine ran out of sunflowers, all in the same afternoon. Both declined to say who the customers were.',
            'Coach Patty was seen at the courthouse in a very nice scarf, humming. Asked about the mystery, she said she had no idea, and blushed in a general sort of way.',
          ],
          headline: ['MAIN STREET RUNS OUT OF RIBBON', 'COACH PATTY WEARS A NICE SCARF; HUMS'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{villain.real} confessed to whistling off-key on purpose so nobody would recognize it. {hero.real} said the whistle was the most romantic noise in Sportatorium history. Gus, again, claimed credit.',
            'Birdie asked the only question that matters: real, or part of the show? {hero.real} and {villain.real} answered at the same time with two different answers, and June cut the pie into two perfectly equal slices.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'sweet_yes', label: 'The feeling is returned', winner: 'hero', weight: 0.55,
        text: [
          '{villain} stepped into the light with the last note in hand, and the VFW lost its collective mind. {hero} said yes in front of everybody, then asked if the roses could be a tag-team thing.',
          'The reveal got a gasp, then a cheer, then a second gasp when {hero} took the microphone and said, "I hoped it was you." Agnes Pickett handed out tissues from her purse.',
        ],
        epilogue: [
          '{hero.real} and {villain.real} shared a milkshake with two straws, which is the oldest way to say yes. June put the rose from the turnbuckle in a tiny vase on their table.',
          'Birdie wrote TAG TEAM? on a napkin. They both said "Obviously," then argued about who said it first, which seemed like a good sign.',
        ],
        headline: ['THE ADMIRER REVEALED; {hero} SAYS YES', 'LOVE NOTE LEADS TO TAG TEAM'],
      },
      {
        id: 'gentle_friends', label: 'Kindly declined, friends for life', winner: 'hero', weight: 0.45,
        text: [
          '{villain} stepped forward and {hero} listened to every word, then took both of {villain}\'s hands and said, kindly, "I\'m honored. I think we\'re better as friends." The crowd sighed warmly and clapped.',
          'The reveal ended in a hug instead of a kiss, and everybody in the VFW understood. {villain} bowed. {hero} bowed back. The ovation lasted longer than most matches.',
        ],
        epilogue: [
          '{villain.real} said it was the nicest no ever delivered. "I\'m still glad I did it." {hero.real} said the whistle would always be the best thing anyone had done for {hero.them}.',
          'Birdie moved the napkin from ROMANCE to FRIENDS and underlined it twice. "That\'s the best kind of ending. They\'re still in the story."',
        ],
        headline: ['THE ADMIRER IS REVEALED; A HUG, NOT A KISS', '{hero} AND {villain}: BEST OF FRIENDS'],
      },
    ],
    gusWords: ['Roses', 'Secret Admirer', 'Love Note', 'Crush', 'Sweet Nothings', 'Valentine', 'Whistle', 'Mystery Flowers'],
    wants: [
      'I want somebody to leave roses in my locker.',
      'I want to send flowers to {hero.real} and never sign the card.',
      'I want a whole town guessing, and a whistle that gives nothing away.',
    ],
    background: true,
    playerRoles: ['hero', 'villain', 'decoy'],
  },

  // ------------------------------------------------------------ 5.13 The Family Feud
  {
    id: 'family_feud',
    name: 'The Family Feud',
    register: 'loud and loving',
    blurb: 'Relatives fight over the family move, the whole town picks a side, and the dinner table has the last word.',
    tags: ['family', 'comedy', 'heartfelt', 'hometown'],
    roles: [
      { key: 'hero', label: 'Family Member A', align: 'hero', player: true },
      { key: 'villain', label: 'Family Member B', align: 'villain', player: true },
      { key: 'mediator', label: 'The Mediator', align: 'any', optional: true },
    ],
    length: [4, 5, 6],
    cards: {
      hook: ['HK-16', 'HK-08'],
      twist: ['TW-06', 'TW-18', 'TW-08'],
      stakes: ['ST-11', 'ST-09', 'ST-08'],
      payoff: ['PO-03', 'PO-02', 'PO-17'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'same_move', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['villain']], winner: null,
          title: '{hero} vs. {villain}',
          text: [
            '{hero} and {villain} hit the family move at the exact same instant and both went down. Mo counted them both down, then both up, then gave up counting. Each swore the move belonged to them.',
            'Neither would let the other win, and neither would admit what the argument was about. It ended when both slid out of the ring at once and Mo declared a no contest on principle.',
          ],
          headline: ['{hero} AND {villain} FIGHT OVER THE FAMILY MOVE', 'NO CONTEST; THE ARGUMENT CONTINUES'],
        },
        {
          key: 'taqueria_spat', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'the taqueria',
          title: 'A public spat at the taqueria',
          text: [
            '{hero} and {villain} had a very public argument at the taqueria over who invented the family move. The cook slid a plate of tacos between them, and both pushed it toward the other.',
            'The argument started over a recipe, moved to the move, and ended in a debate about a parking space. The whole taqueria stopped chewing. Somebody started a slow clap and thought better of it.',
          ],
          headline: ['{hero} AND {villain} FEUD AT THE TAQUERIA', 'THE FAMILY ARGUMENT SPILLS INTO LUNCH'],
        },
      ],
      [
        {
          key: 'relatives_arrive', kind: 'angle', purpose: 'heat', roles: ['hero', 'villain'],
          title: 'Ringside: the relatives arrive',
          text: [
            'Two grandmothers sat on opposite sides of the aisle with homemade signs, one for each side of the family. When the match started they traded a single tight nod, which is the loudest thing a grandmother can do.',
            'A cousin drove in from two counties over with a van full of relatives and a banner that read ASK OUR AUNT. Nobody knew which side the aunt was on. The aunt, interviewed, said "Yes."',
          ],
          headline: ['RELATIVES ARRIVE; THE FAMILY TAKES SIDES', 'ASK OUR AUNT: A BANNER APPEARS'],
        },
        {
          key: 'photo_wall', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'the taqueria',
          title: 'The family photos turn',
          text: [
            'Somebody turned all the old family photos on the taqueria wall to face the wall. Agnes Pickett turned them back. Somebody turned them again. By closing the photos were spinning.',
            'The Tattler printed an old photo of {hero} and {villain} sharing one popsicle under the caption WHAT HAPPENED? The phone rang for an hour with family members insisting it was not about the popsicle.',
          ],
          headline: ['PHOTOS ON THE TAQUERIA WALL: A TUG OF WAR', 'TATTLER PRINTS THE POPSICLE PHOTO'],
        },
        {
          key: 'sibling_scuffle', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['villain']], winner: 1,
          title: '{hero} vs. {villain}',
          text: [
            '{villain} won with the family move, then spent a full minute telling the crowd who invented it. {hero} kept trying to interrupt and was lovingly ignored.',
            'It was a loud, familiar, ugly sort of match, every hold borrowed from a family barbecue. {villain} got the pin and offered a handshake. {hero} took it, and squeezed.',
          ],
          headline: ['{villain} WINS THE FAMILY ROUND', '{hero} DEMANDS A RECOUNT AND AN APOLOGY'],
        },
        {
          key: 'family_meeting', kind: 'interview', purpose: 'segment', roles: ['mediator', 'hero', 'villain'], optional: true,
          title: 'Sit-down interview: {mediator}, {hero} & {villain}',
          text: [
            '{mediator} sat between {hero} and {villain} with a cup of tea and a very patient face. By the fourth minute {mediator} was holding the tea in both hands like a shield.',
            '{mediator} proposed a compromise: both could claim the move, take turns at the family table, and share the credit. They said no at the same time, then glared at each other for agreeing.',
          ],
          headline: ['{mediator} TRIES TO KEEP THE PEACE', 'COMPROMISE REJECTED BY BOTH SIDES'],
        },
      ],
      [
        {
          key: 'napkin_contract', kind: 'contract', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'Contract signing: {hero} & {villain}',
          text: [
            'They signed on a paper napkin between two plates of enchiladas, and each insisted the other sign first. The napkin got a salsa stain, which the taqueria says is legally binding.',
            '{hero} and {villain} signed with matching pens and a matching glare. The cook, watching from the kitchen window, mouthed "Please be nice at Thanksgiving." Both nodded. Neither meant it.',
          ],
          headline: ['THE FAMILY SIGNS ON A NAPKIN', 'SALSA STAIN MAKES IT LEGALLY BINDING'],
        },
        {
          key: 'potluck', kind: 'town', purpose: 'town', roles: ['hero', 'villain'], optional: true,
          place: 'the Hot Tag Diner',
          title: 'The charity potluck',
          text: [
            'The Hot Tag held a charity potluck with two casserole tables, one for each side of the family. By seven both tables were empty and both sides were quietly asking for the other\'s recipe.',
            'Both sides of the family sent a dessert to the other with a note: NOT AN APOLOGY. Both desserts were delicious. June says she has seen this before.',
          ],
          headline: ['TWO CASSEROLE TABLES, ONE QUIET RECIPE SWAP', 'DESSERTS EXCHANGED; NO APOLOGIES ISSUED'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{hero.real} and {villain.real} shared one plate of tacos and fought over the last one. Birdie said it was the best argument she had ever witnessed, and not a bad review either.',
            '{villain.real} admitted the popsicle photo was the saddest thing in the story. {hero.real} said it was still about the popsicle. They laughed so hard June brought water.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'hero_wins', label: 'The family name goes to A', winner: 'hero', weight: 0.4,
        text: [
          '{hero} won it for the family name, and {villain} was the first to hug {hero}, while insisting the hug was strategic.',
          'The three count rang out and both grandmothers stood up at once, pointed at the ring, and said "That one is ours." Neither said which one.',
        ],
        epilogue: [
          '{hero.real} and {villain.real} decided the family name was big enough for two. They also decided to fight about it again at Thanksgiving.',
          'Birdie asked whether they were done. "For now." "Until Thanksgiving." "Until Thanksgiving."',
        ],
        headline: ['{hero} WINS THE FAMILY NAME', 'GROUP HUG IN THE RING'],
      },
      {
        id: 'villain_wins', label: 'The family name goes to B', winner: 'villain', weight: 0.3,
        text: [
          '{villain} won and called the entire family into the ring, then pointed at {hero} and said, "You too." {hero} came, grumbling.',
          'The win was loud, long and shared with two grandmothers, a cousin and one aunt. {hero} watched from the apron, smiling in spite of everything.',
        ],
        epilogue: [
          '{villain.real} said winning was less fun than expected without {hero.real} there to gloat at. {hero.real} said that was the nicest thing {villain.real} had said in weeks.',
          '{hero.real} promised a rematch at Thanksgiving. {villain.real} promised to bring pie, to lower the guard.',
        ],
        headline: ['{villain} WINS THE FAMILY NAME', 'FAMILY CELEBRATES; {hero} SULKS, LOVINGLY'],
      },
      {
        id: 'thanksgiving', label: 'No winner, one big hug', winner: null, weight: 0.3,
        text: [
          'Neither could finish it. In the middle of the match the whole family climbed into the ring for one very large group hug, and Mo counted nothing at all.',
          'A double count-out, then a double hug, then a triple hug when somebody\'s aunt joined in. The scorecard says no contest. The family says dinner is at six.',
        ],
        epilogue: [
          '"We\'ll fight about it again at Thanksgiving," said {hero.real}. "I\'ll bring the pie," said {villain.real}. June said that was the best kind of ending.',
          'Birdie wrote THANKSGIVING on a napkin and pinned it to the calendar. "Mark it."',
        ],
        headline: ['NO WINNER; ONE VERY LARGE FAMILY HUG', 'THE FEUD ENDS AT THE DINNER TABLE'],
      },
    ],
    gusWords: ['Feud', 'Family Matters', 'Kinfolk', 'Family Recipe', 'Thanksgiving', 'In-Laws', 'Family Name', 'Popsicle'],
    wants: [
      'I want to fight about the family move in front of two thousand people.',
      'I want every cousin in the front row.',
      'I want to win the family name, and then share it.',
    ],
    background: true,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.14 The Outsider Invasion
  {
    id: 'outsider_invasion',
    name: 'The Outsider Invasion',
    register: 'rally-the-town spectacle',
    blurb: 'Strangers in matching jackets crash the card, the town gets loud, and Main Street fills with homemade armor.',
    tags: ['outsider', 'faction', 'spectacle', 'schmozz'],
    roles: [
      { key: 'hero', label: 'The Town Defender', align: 'hero', player: true },
      { key: 'villain', label: 'The Invader Leader', align: 'villain', player: true },
      { key: 'invader', label: 'The Invader', align: 'villain', optional: true, player: true },
      { key: 'traitor', label: 'The Local Who Joins Them', align: 'any', optional: true, player: true },
    ],
    length: [5, 6, 8],
    cards: {
      hook: ['HK-01', 'HK-15'],
      twist: ['TW-01', 'TW-07', 'TW-17'],
      stakes: ['ST-13', 'ST-03', 'ST-15'],
      payoff: ['PO-07', 'PO-10', 'PO-02'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'jackets_arrive', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['villain']], winner: 1, cheat: true,
          title: '{hero} vs. {villain}',
          text: [
            'Two strangers in matching jackets stood on the apron and distracted Mo while {villain} won with a handful of tights. Nobody knew who they were. Everybody knew whose side they were on.',
            '{villain} won with help from a pack of outsiders in matching jackets, and then the whole pack stayed to pose. The jackets were the color of a fire hydrant. The posing had a very confident chin.',
          ],
          headline: ['STRANGERS IN MATCHING JACKETS CRASH THE VFW', '{villain} WINS WITH HELP FROM OUTSIDERS'],
        },
        {
          key: 'tattler_extra', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'the Turnbuckle Tattler office',
          title: 'The Tattler prints an extra',
          text: [
            'Clementine printed an EXTRA edition by noon: INVADERS! The front page had three exclamation points and a photo of someone\'s elbow. Main Street bought out every copy by lunch.',
            'Clementine ran the headline INVADERS IN JACKETS and a sidebar titled WHAT TO DO IF YOU SEE A JACKET. The sidebar said "Wave." It was the whole sidebar.',
          ],
          headline: ['TATTLER PRINTS AN EXTRA: "INVADERS!"', 'WHAT TO DO IF YOU SEE A JACKET: "WAVE"'],
        },
      ],
      [
        {
          key: 'diner_ketchup', kind: 'town', purpose: 'town', roles: ['villain'],
          place: 'the Hot Tag Diner',
          title: 'The jackets at the diner',
          text: [
            'The jackets took over the Hot Tag counter, ordered pancakes and covered them in ketchup in front of June. June served them with the face of a woman filing a complaint with the universe.',
            'One of the invaders refused to return Wanda\'s polite bow, and Wanda bowed again, slower, to make a point. The whole diner watched. Nobody has ever won a bowing contest against Wanda.',
          ],
          headline: ['INVADERS PUT KETCHUP ON PANCAKES; JUNE STUNNED', 'WANDA OUT-BOWS THE INVASION'],
        },
        {
          key: 'sweep', kind: 'match', purpose: 'segment',
          sides: [['villain'], ['@any']], winner: 0,
          title: '{villain} in action',
          text: [
            '{villain} flattened a local favorite in seven minutes and then stood on the ropes waving a tiny flag at the crowd. The crowd answered with a long, loud, wounded boo.',
            'The outsiders won three matches in a row, and each time the jacket gang piled into the ring to pose. By the third, the posing had a choreographer.',
          ],
          headline: ['INVADERS WIN AGAIN; JACKET GANG STRIKES A POSE', '{villain} WAVES A TINY FLAG AT THE VFW'],
        },
        {
          key: 'town_meeting', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the courthouse steps',
          title: 'The emergency town meeting',
          text: [
            'Mayor Oakes called an emergency town meeting. Four hundred folding chairs filled the courthouse lawn, and Agnes Pickett knitted a scarf in the town colors at speed, in the town spirit.',
            'The meeting lasted three hours and produced one resolution: "We will not be rude, but we will be loud." Coach Patty seconded it with a whistle, and {hero} was applauded for standing up first.',
          ],
          headline: ['MAYOR OAKES CALLS AN EMERGENCY TOWN MEETING', '"NOT RUDE, BUT LOUD": TOWN ADOPTS A MOTTO'],
        },
        {
          key: 'jacket_offer', kind: 'angle', purpose: 'tease', roles: ['traitor', 'villain'], optional: true,
          title: 'Backstage: {traitor} & {villain}',
          text: [
            'On the big screen, {traitor} stood very close to {villain} in a hallway, then took a jacket off a hook and held it up. The Sportatorium said "Don\'t," with one voice.',
            '{villain} offered {traitor} a jacket in {traitor.their} size, with {traitor.their} name already stitched on the back. {traitor} looked at it for a long time. The crowd looked at {traitor}.',
          ],
          headline: ['{traitor} EYES A JACKET; TOWN HOLDS ITS BREATH', 'A JACKET WITH {traitor}\'S NAME ON THE BACK'],
        },
      ],
      [
        {
          key: 'honor_signing', kind: 'contract', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'Contract signing: {hero} & {villain}',
          text: [
            'They signed on the courthouse steps in front of the whole town, with Mayor Oakes holding the pen and Agnes Pickett holding the table. "For the honor of Turnbuckle Alley," said {hero}. {villain} said, "For the jackets."',
            '{hero} and {villain} signed beside a very small town banner and a very large pie. The pie was for after, if anybody was still speaking to anybody.',
          ],
          headline: ['THE TOWN\'S HONOR IS SIGNED ON THE COURTHOUSE STEPS', '"FOR THE TOWN" MEETS "FOR THE JACKETS"'],
        },
        {
          key: 'homemade_jackets', kind: 'town', purpose: 'town', roles: ['hero'], optional: true,
          place: 'Main Street',
          title: 'Main Street goes Defender',
          text: [
            'By Friday Main Street was full of homemade DEFENDER jackets made of dish towels, bedsheets and, in one case, a tablecloth. Pip made one out of a cereal box and wore it with tremendous authority.',
            'Marigold ran up forty DEFENDER jackets overnight and refused payment. "Just win," she said, in the voice of a woman who had been pinning hems for forty hours.',
          ],
          headline: ['MAIN STREET GOES DEFENDER: HOMEMADE JACKETS', 'MARIGOLD SEWS FORTY JACKETS OVERNIGHT'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{villain.real} apologized for the ketchup. "It was the only line I had." June said the pancakes would never be the same. {hero.real} said the ketchup was the bravest thing anybody did all month.',
            'Birdie called the whole cast to the booth and ordered a round of milkshakes in three colors. "Nobody gets to be an outsider for long in this town. It\'s a rule. I just made it."',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'town_honor_saved', label: 'The town holds the line', winner: 'hero', weight: 0.5,
        text: [
          'The town\'s defenders won it, and the whole VFW stood up and sang the one song everyone knows, loudly, off-key and with great feeling.',
          '{hero} stood in the center of the ring with the town banner while the jackets watched with folded arms. Then one of them, very slowly, began to clap.',
        ],
        epilogue: [
          '{hero.real} raised a milkshake to the room. "For the town." "For the town," said everyone, including {villain.real}, who added, "And the jackets."',
          'Birdie wrote OPEN DOOR on a napkin. "They can visit anytime. They just have to wave."',
        ],
        headline: ['THE TOWN HOLDS THE LINE; INVADERS HALTED', 'TURNBUCKLE ALLEY STANDS TOGETHER'],
      },
      {
        id: 'invaders_prevail', label: 'The jackets stay', winner: 'villain', weight: 0.25,
        text: [
          '{villain} won it, and the jackets took over the ring in a jubilant, strictly choreographed celebration. Somebody ran a jacket up the flagpole. It was a very nice jacket.',
          'The invaders held the ring and the room, and the crowd booed with great dignity. Then, in a gesture nobody expected, {villain} bowed to the town.',
        ],
        epilogue: [
          '{villain.real} told the booth the jackets weren\'t going anywhere. "We like it here. The pancakes are terrible." June looked at {villain.real} for a very long time.',
          '{hero.real} promised a rematch with the whole town behind it. Birdie said it was the best thing she had heard all month.',
        ],
        headline: ['INVADERS PREVAIL; THE JACKETS STAY', 'TOWN LOSES THE BATTLE, KEEPS ITS VOICE'],
      },
      {
        id: 'friends_in_jackets', label: 'The invaders become friends', winner: 'hero', weight: 0.25,
        turn: { who: 'villain', to: 'hero' },
        text: [
          'After the bell {villain} took off the jacket and handed it to {hero}. {hero} gave back a DEFENDER jacket in return. The crowd cheered a very strange trade.',
          'The jackets and the town shook hands in the ring, row by row, as Gus read the names. By the end nobody could say who had been invading whom.',
        ],
        epilogue: [
          '{villain.real} admitted the jackets liked the town. "We want to stay. If that\'s okay." Birdie said it was a very good question and she would get back to them.',
          'June gave the invaders a free pancake each, no ketchup. They ate it with the look of people who knew better.',
        ],
        headline: ['INVADERS BECOME FRIENDS; JACKETS TRADED', 'THE INVASION ENDS IN A HANDSHAKE'],
      },
    ],
    gusWords: ['Invasion', 'Jackets', 'Outsiders', 'Siege', 'Town Honor', 'Strangers', 'Hostile Takeover', 'Last Stand'],
    wants: [
      'I want the whole town standing behind me when the strangers come.',
      'I want to lead the invasion and be gloriously ornery about it.',
      'I want Main Street full of homemade jackets.',
    ],
    background: true,
    playerRoles: ['hero', 'villain', 'invader', 'traitor'],
  },

  // ------------------------------------------------------------ 5.15 Loser Leaves Town
  {
    id: 'loser_leaves',
    name: 'Loser Leaves Town',
    register: 'high drama with a real absence',
    blurb: 'An old feud comes to a head, the town begs both rivals to stay, and the loser takes a road trip they will talk about for years.',
    tags: ['leaving', 'drama', 'heartfelt', 'hometown'],
    roles: [
      { key: 'hero', label: 'Rival A', align: 'hero', player: true },
      { key: 'villain', label: 'Rival B', align: 'villain', player: true },
    ],
    length: [4, 5, 6],
    cards: {
      hook: ['HK-19'],
      twist: ['TW-11', 'TW-10'],
      stakes: ['ST-03'],
      payoff: ['PO-05', 'PO-09', 'PO-18'],
    },
    twistAt: 'end_act2',
    needs: ['history'],
    acts: [
      [
        {
          key: 'old_footage', kind: 'angle', purpose: 'establish', roles: ['hero', 'villain'],
          title: 'Old footage: {hero} & {villain}',
          text: [
            'The big screen played old footage of {hero} and {villain} at their worst and best, and the building watched in a strange hush. At the end the two of them stared at each other across the ring and did not look away.',
            'The tape of their last war rolled on the Sportatorium screen. Both stood at ringside and watched every second. When it ended neither said a word, and the building understood.',
          ],
          headline: ['OLD FOOTAGE REOPENS A FEUD', '{hero} AND {villain} WATCH THE TAPE'],
        },
        {
          key: 'old_poster', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'Steel Chair Hardware',
          title: 'The old poster comes back',
          text: [
            'Steel Chair Hardware put the old poster from their last war back in the window, laminated, and Agnes Pickett stopped on the sidewalk to recall exactly what she had been wearing that night.',
            'Half the old-timers on Main Street swore they had seen it coming. The other half said they had seen it coming first. By noon the sidewalk was a debate club.',
          ],
          headline: ['OLD POSTER RETURNS TO THE WINDOW', 'MAIN STREET REMEMBERS THE LAST WAR'],
        },
      ],
      [
        {
          key: 'standoff', kind: 'angle', purpose: 'heat', roles: ['hero', 'villain'],
          title: 'Parking lot: {hero} & {villain}',
          text: [
            '{hero} and {villain} came face to face in the Sportatorium parking lot, nose to nose in the headlights. Neither spoke. Somebody\'s car alarm went off, and neither of them flinched.',
            'The camcorder caught a shouting match across the loading dock that ended with {villain} pointing at {hero}\'s car and {hero} pointing at {villain}\'s. Mo separated them with a clipboard.',
          ],
          headline: ['PARKING LOT STANDOFF: NOBODY BLINKS', 'MO SEPARATES THE RIVALS WITH A CLIPBOARD'],
        },
        {
          key: 'dont_go', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'Main Street',
          title: '"Don\'t go" signs',
          text: [
            'DON\'T GO signs appeared on every lamppost on Main Street, in crayon, in marker and, on the bakery door, in icing. Nobody said whom they were for. Everybody knew.',
            'Pip stood on a milk crate with a cardboard sign that read PLEASE DON\'T GO (EITHER OF YOU). Agnes Pickett added a smaller one beneath: AND I MEAN IT.',
          ],
          headline: ['"DON\'T GO" SIGNS APPEAR ON MAIN STREET', 'PIP: "PLEASE DON\'T GO (EITHER OF YOU)"'],
        },
        {
          key: 'tune_up', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['villain']], winner: 1, cheat: true,
          title: '{hero} vs. {villain}',
          text: [
            '{villain} won with a foot on the ropes and strolled up the aisle waving, like a person who has packed for either outcome. {hero} watched without moving.',
            '{hero} had it, until {villain} found the ropes with both feet and Mo, checking the clock, missed it. The two of them stared at each other long after the bell.',
          ],
          headline: ['{villain} WINS ON THE ROPES; STAKES RISE', 'BOTH RIVALS STARE LONG AFTER THE BELL'],
        },
        {
          key: 'farewell_song', kind: 'wrsl', purpose: 'wrsl', roles: ['villain'], optional: true,
          title: '{villain} calls The Gravel Pit',
          text: [
            '{villain} called The Gravel Pit to ask Gus to pick a farewell song, then rejected seventeen. Gus said it was the longest request in WRSL history, and played the eighteenth.',
            '"I just want everyone to think about what they\'ll miss," {villain} told WRSL. Gus asked what that was. "Me," said {villain}, and then, softer, "Maybe a little." Click.',
          ],
          headline: ['{villain} REJECTS SEVENTEEN FAREWELL SONGS', '"THINK ABOUT WHAT YOU\'LL MISS," SAYS {villain}'],
        },
      ],
      [
        {
          key: 'last_words', kind: 'promo', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'In-ring address: {hero} & {villain}',
          text: [
            '{hero} and {villain} shared one microphone for the first time all month. "Whoever goes," said {hero}, "goes with a handshake." {villain}: "Whoever stays gets the good chair." The VFW could not decide to cheer or cry.',
            'Both rivals thanked the town, together, then each said they planned to win. "Don\'t go!" somebody shouted. "I\'ll be back," said {villain}. "I\'ll be back," said {hero}. "We\'ll see who," said both.',
          ],
          headline: ['"WHOEVER GOES, GOES WITH A HANDSHAKE"', 'BOTH RIVALS PROMISE: "I\'LL BE BACK"'],
        },
        {
          key: 'two_bags', kind: 'town', purpose: 'town', roles: ['hero', 'villain'], optional: true,
          place: 'the Sportatorium back door',
          title: 'Two bags by the door',
          text: [
            'Somebody taped the same sign to the Sportatorium door twice: GOOD LUCK, SEE YOU SOON, BOTH OF YOU. The tape was crooked. Whoever did it was crying a little, probably.',
            'Two duffel bags appeared in two cars outside the Sportatorium, one blue and one red, each packed with a very small pillow. Sheriff Bev wrote down the license plates "for the fond memories."',
          ],
          headline: ['TWO PACKED BAGS AT THE SPORTATORIUM', 'A SIGN ON THE DOOR: "SEE YOU SOON, BOTH OF YOU"'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            'A packed duffel waited by the booth door, and both of them kept glancing at it. "Two to six weeks," said Birdie. "Postcards are mandatory." {hero.real} promised to mail one. {villain.real} promised two.',
            '{hero.real} and {villain.real} split a milkshake in total silence, then said "Thanks" at the exact same moment. June brought a third straw, for the road.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'villain_leaves', label: 'Rival B hits the road', winner: 'hero', weight: 0.5,
        text: [
          '{hero} won, and {villain} carried a duffel up the aisle, stopping at the curtain to wave. The crowd waved back, and Gus had to step away from the microphone for a moment.',
          '{villain} left the ring to a standing ovation and a hundred hand-drawn farewell cards. The sign went up on the shop door the next morning: GONE FISHIN\'. COUSIN\'S GOT IT.',
        ],
        epilogue: [
          '{villain.real} left with a sleeping bag, a thermos and a promise to write. {hero.real} was already drafting a reply in the booth. June said the first postcard would arrive in a week.',
          'Birdie pinned a calendar to the wall with a red circle three weeks out. "Back by then," she said. "Or I send Gus after you."',
        ],
        headline: ['{villain} LEAVES TOWN; {hero} WINS', 'GONE FISHIN\': {villain} HITS THE ROAD'],
      },
      {
        id: 'hero_leaves', label: 'Rival A hits the road', winner: 'villain', weight: 0.5,
        text: [
          '{villain} won, and {hero} took the walk up the aisle alone with a duffel and a wave. Halfway there {hero} stopped, turned and bowed. The whole building bowed back.',
          '{hero} left to a standing ovation and a shower of paper airplanes, each one a note. The next morning the shop door read: GONE FISHIN\'. COUSIN\'S GOT IT.',
        ],
        epilogue: [
          '{hero.real} packed light and left a note on the booth: "Back soon. Keep my stool." {villain.real} sat on the stool for a minute, then moved, out of respect.',
          'Birdie pinned a calendar to the wall with a red circle three weeks out. "Back by then," she said. "Or I send {villain.real} after you."',
        ],
        headline: ['{hero} LEAVES TOWN; {villain} WINS', 'GONE FISHIN\': {hero} HITS THE ROAD'],
      },
    ],
    gusWords: ['Last Stand', 'Goodbye (For Now)', 'Road Trip', 'Don\'t Go', 'Gone Fishin\'', 'Farewell', 'Send-Off', 'Postcards'],
    wants: [
      'I want the town begging one of us to stay.',
      'I want a feud so good that one of us has to leave over it.',
      'I want to take a road trip and come back with a story.',
    ],
    background: true,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.16 The Haunted Locker
  {
    id: 'haunted_locker',
    name: 'The Haunted Locker',
    register: 'spooky-cozy whimsy',
    blurb: 'A locker frosts over, the bell rings by itself, and the Sportatorium has an echo of a great match that wants one more night.',
    tags: ['supernatural', 'whimsy', 'mystery', 'spotlight'],
    roles: [
      { key: 'hero', label: 'The Haunted', align: 'hero', player: true },
      { key: 'villain', label: 'The Echo', align: 'any', player: true },
      { key: 'skeptic', label: 'The Skeptic', align: 'any', optional: true },
    ],
    length: [3, 4, 5],
    cards: {
      hook: ['HK-18', 'HK-17'],
      twist: ['TW-12', 'TW-11'],
      stakes: ['ST-02', 'ST-09'],
      payoff: ['PO-20', 'PO-13'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'flicker', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            'Halfway through {hero}\'s match the lights flickered, the bell rang by itself, and the whole VFW looked up. {hero} won in the dark and said afterward, "I\'d like a word with whoever rang that."',
            'A cold breeze crossed the ring during {hero}\'s entrance, though every door was shut. {hero} wrapped up the win quickly and found the locker frosted over, inside, in the shape of a small, old-fashioned bow tie.',
          ],
          headline: ['THE BELL RINGS BY ITSELF AT THE VFW', 'A FROSTED LOCKER IN THE SHAPE OF A BOW TIE'],
        },
        {
          key: 'fenwick_patty', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the Sportatorium parking lot',
          title: 'Fenwick has a theory',
          text: [
            'Fenwick set up a card table in the parking lot with a thermometer, a tuba and a hand-lettered sign: I HAVE A THEORY. Coach Patty arrived with a clipboard to debunk it, and has so far debunked the tuba.',
            'Coach Patty measured the temperature in {hero}\'s locker and wrote "Cold." Fenwick wrote "VERY cold." Coach Patty underlined her own note twice, then crossed it out and wrote "Draft."',
          ],
          headline: ['FENWICK HAS A THEORY; COACH PATTY HAS A CLIPBOARD', 'THE LOCKER IS COLD; COACH PATTY BLAMES A DRAFT'],
        },
      ],
      [
        {
          key: 'strange_match', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['@any']], winner: 1,
          title: '{hero} in action',
          text: [
            'The lights went out at the worst possible moment, the bell rang on its own, and when they came back on {hero}\'s opponent was pinning {hero} from an angle nobody could explain.',
            '{hero} had the match won when a very old, very faint entrance song drifted through the speakers. {hero} looked around, the opponent rolled {hero} up, and Mo rang the bell with a careful hand.',
          ],
          headline: ['THE LIGHTS GO OUT; THE BELL RINGS ITSELF', '{hero} DISTRACTED BY A VERY OLD SONG'],
        },
        {
          key: 'stakeout', kind: 'angle', purpose: 'tease', roles: ['skeptic', 'hero'], optional: true,
          title: 'Overnight stakeout: {skeptic}',
          text: [
            '{skeptic} spent the night in the Sportatorium with a thermos and a flashlight to disprove the whole thing. By 2 a.m. {skeptic} was sitting on a stack of folding chairs with every light on, humming.',
            'The camcorder caught {skeptic} backing slowly out of the locker room, still holding a clipboard, saying "That\'s a perfectly normal draft" to nobody in particular, several times.',
          ],
          headline: ['{skeptic} SPENDS THE NIGHT IN THE SPORTATORIUM', '"A PERFECTLY NORMAL DRAFT," SAYS {skeptic}'],
        },
        {
          key: 'echo_gifts', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the Sportatorium back door',
          title: 'Gifts for the echo',
          text: [
            'Pip left a pair of tiny cardboard wristbands outside the locker room door as a welcome gift for whatever was in there. In the morning they were tied around the doorknob in a very tidy bow.',
            'The Hot Tag sent over a slice of pie for "the guest." In the morning the plate was clean and the fork had been set down exactly parallel to it. June says that is not her doing.',
          ],
          headline: ['PIP LEAVES A GIFT FOR THE ECHO; IT TIES A BOW', 'PIE GOES MISSING; FORK RETURNED NEATLY'],
        },
        {
          key: 'echo_hotline', kind: 'wrsl', purpose: 'wrsl', roles: ['hero'],
          title: 'The Gravel Pit: echo sightings',
          text: [
            'Gus opened the phones for echo sightings and took ninety calls, eighty-nine of them about the same cold spot by the popcorn machine. The ninetieth was Coach Patty, calling to say it was a draft.',
            'Callers described a faint old entrance song, a very polite chill and a flicker in the VFW lights at exactly 9:14. Gus said it sounded like an echo of a great match, and played that match\'s theme, just in case.',
          ],
          headline: ['THE GRAVEL PIT TAKES CALLS ABOUT AN ECHO', 'NINETY CALLS, ONE COLD SPOT, ONE DRAFT'],
        },
      ],
      [
        {
          key: 'hero_challenges', kind: 'promo', purpose: 'gohome', roles: ['hero'],
          title: 'In-ring address: {hero}',
          text: [
            '{hero} stood in the center of the ring and addressed the rafters: "If you want a match, show up Saturday. I\'ll save you a good spot." The lights flickered once, in what the crowd agreed was a yes.',
            '"I don\'t believe in echoes," {hero} told the crowd, "but I do believe in a very good opponent." Every light in the building went out for one second and came back on with a tiny cheer.',
          ],
          headline: ['{hero} CHALLENGES THE ECHO TO A MATCH', 'THE LIGHTS FLICKER IN REPLY'],
        },
        {
          key: 'diner_specials', kind: 'town', purpose: 'town', roles: ['hero'], optional: true,
          place: 'the Hot Tag Diner',
          title: 'The Echo Special',
          text: [
            'June added an Echo Special to the board: a pancake shaped like a bow tie. Fenwick would not confirm or deny whether the shape was accurate, and ordered two.',
            'Mayor Oakes issued a statement that the Sportatorium was "perfectly safe, and also very interesting." Agnes Pickett left a thermos of tea at the back door for the echo, "in case it\'s the type."',
          ],
          headline: ['HOT TAG ADDS THE BOW-TIE PANCAKE', 'MAYOR: "PERFECTLY SAFE, AND ALSO VERY INTERESTING"'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{villain.real} wiped the frost-paint off a very old costume and admitted the bow tie was the whole idea. "Nobody ever gets frightened by a bow tie." {hero.real} said that was exactly why it worked.',
            'Birdie asked who had come up with the bell trick. Hank Szabo raised a hand from the next booth, covered in cobwebs. "It\'s on a string," Hank said. "It\'s always on a string."',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'echo_revealed', label: 'The echo is a wrestler in old gear', winner: 'hero', weight: 0.5,
        text: [
          'When the lights came back the echo stood center ring in old-timey gear, bowing to the crowd. {villain} pulled off a faded cap and said, "I just wanted one more big night." The VFW cheered.',
          '{hero} won in the dark, and when the lights returned a very dusty wrestler in old-fashioned gear was shaking {hero}\'s hand. It was {villain}, grinning from ear to ear.',
        ],
        epilogue: [
          '{villain.real} said the old gear still smelled like a great match. "Mothballs and glory." {hero.real} said nobody had ever wanted a rematch so much.',
          'Fenwick wrote EXPLAINED on his corkboard, crossed it out and wrote MOSTLY. Coach Patty put her clipboard away without a word.',
        ],
        headline: ['THE ECHO REVEALED: A WRESTLER IN OLD GEAR', 'THE SPORTATORIUM ECHO WAS {villain}'],
      },
      {
        id: 'echo_wins', label: 'The echo has the last word', winner: 'villain', weight: 0.3,
        text: [
          '{villain} won it in the dark and took a bow, in old-timey gear, to a crowd that did not know whether to laugh, cheer or look under the ring. It did all three.',
          'The echo took the match, and the bell rang a final time on its own, in what the crowd agreed sounded very much like approval. {villain} tipped a faded cap and left through the crowd.',
        ],
        epilogue: [
          '{villain.real} said winning in costume was the best night ever. "I even got the bell to ring." Hank Szabo said nothing and studied the ceiling.',
          '{hero.real} said losing to an echo was an honor. Birdie said the echo had asked her, politely, for a rematch.',
        ],
        headline: ['THE ECHO WINS THE NIGHT', 'AN OLD-FASHIONED WIN IN THE DARK'],
      },
      {
        id: 'one_more_match', label: 'The echo stays for one more', winner: 'hero', weight: 0.2,
        turn: { who: 'villain', to: 'hero' },
        text: [
          'After the bell {hero} and {villain} stood side by side in the dim light as the whole crowd applauded, and the old bell rang once more, very softly, as though in thanks.',
          '{villain} bowed to the rafters, to the crowd and to {hero}, and the lights came back on. For the first time all month the locker was warm.',
        ],
        epilogue: [
          '{villain.real} said the old building had a lot of great matches left in it. "They just needed someone to ring the bell." {hero.real} said the bell had better be on a string.',
          'Birdie wrote ECHO CLUB on a napkin and underlined it. "Harvest Havoc. Every year. Bring a thermos."',
        ],
        headline: ['THE ECHO STAYS FOR ONE MORE MATCH', 'LOCKER WARM FOR THE FIRST TIME ALL MONTH'],
      },
    ],
    gusWords: ['Echo', 'Cold Locker', 'Haunting', 'Lights Out', 'Old Gear', 'Whispers', 'Bow Tie', 'Night Shift'],
    wants: [
      'I want a spooky story that\'s cozy at the center.',
      'I want Coach Patty to say "I can\'t explain that."',
      'I want to be chased down a hallway by something very polite.',
    ],
    background: true,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.17 The Worked Shoot
  {
    id: 'worked_shoot',
    name: 'The Worked Shoot',
    register: 'raw, honest and cathartic',
    blurb: 'A promo goes off the rails with something true underneath, the town can feel it, and two friends have to clear the air for real.',
    tags: ['drama', 'live_mic', 'real_life', 'heartfelt'],
    roles: [
      { key: 'hero', label: 'The Aggrieved', align: 'hero', player: true },
      { key: 'villain', label: 'The Other Side', align: 'villain', player: true },
    ],
    length: [3, 4, 6],
    cards: {
      hook: ['HK-03', 'HK-08', 'HK-19'],
      twist: ['TW-13', 'TW-17', 'TW-18'],
      stakes: ['ST-12', 'ST-02', 'ST-09'],
      payoff: ['PO-03', 'PO-08', 'PO-17'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'off_script', kind: 'promo', purpose: 'establish', roles: ['hero', 'villain'],
          title: 'In-ring address: {hero}',
          text: [
            '{hero} started the usual address, stopped halfway, and said what was really on {hero.their} mind about {villain}. The room went so quiet that Gus forgot to talk, and Mo took one slow step toward the ring.',
            '{villain} cut {hero} off in the middle of the address, and the two of them said things in the ring that nobody had ever heard them say. Somebody in row six whispered, "That sounded real." Several people agreed.',
          ],
          headline: ['{hero} SAYS WHAT {hero} REALLY THINKS', 'SILENCE FALLS OVER THE VFW AS TEMPERS FLARE'],
        },
        {
          key: 'main_street_talks', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'Main Street',
          title: 'Main Street talks of nothing else',
          text: [
            'Main Street talked about nothing else. At the post office Agnes Pickett told the clerk, "I have been to a lot of arguments, and that one was real." Three people nodded, and one mailed a letter without a stamp.',
            'Lorraine refused to take sides at the feed store and put up a sign: NOT MY BUSINESS (IT IS A LITTLE MY BUSINESS). By noon the sign had been signed by forty customers.',
          ],
          headline: ['TOWN TALKS OF NOTHING ELSE: "THAT WAS REAL"', 'FEED STORE: "NOT MY BUSINESS (A LITTLE MY BUSINESS)"'],
        },
      ],
      [
        {
          key: 'honest_grievances', kind: 'interview', purpose: 'heat', roles: ['hero', 'villain'],
          title: 'Sit-down interview: {hero} & {villain}',
          text: [
            'Gus asked each of them one plain question: "What are you really upset about?" The answers came out slow, honest and a little shaky, and the interview ran an hour over without anyone looking at the clock.',
            '{hero} said {villain} never listened. {villain} said {hero} never asked. The room had never been so quiet for a sit-down, and Gus, for once, did not fill the silence.',
          ],
          headline: ['"WHAT ARE YOU REALLY UPSET ABOUT?"', 'AN HONEST INTERVIEW RUNS AN HOUR LONG'],
        },
        {
          key: 'sincere_match', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['villain']], winner: 1,
          title: '{hero} vs. {villain}',
          text: [
            'Neither pulled a punch, and the building felt every one. {villain} won by a hair after twenty minutes, then stood over {hero} for a long moment, breathing hard, not gloating.',
            'It was loud, rough and entirely sincere. {villain} got the pin, and when the bell rang neither of them moved for a long time. Mo checked on both before raising a hand.',
          ],
          headline: ['{villain} WINS THE HARDEST-HITTING MATCH OF THE YEAR', 'NEITHER MOVES AFTER THE BELL'],
        },
        {
          key: 'two_calls', kind: 'wrsl', purpose: 'wrsl', roles: ['hero', 'villain'],
          title: 'The Gravel Pit: two calls',
          text: [
            'Gus had both of them on hold at once and tried a conference line. It lasted forty seconds, every one of them on the air. Gus ended the call with a long, shaky "Wow."',
            '{hero} called The Gravel Pit to say what had gone unsaid. {villain} called in to say the same thing, in the same words, from the other side. Gus said, quietly, "You two should talk." Nobody laughed.',
          ],
          headline: ['TWO CALLS, ONE GRIEVANCE, ZERO LAUGHS', 'GUS: "YOU TWO SHOULD TALK"'],
        },
        {
          key: 'diner_split', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'the Hot Tag Diner',
          title: 'The diner splits down the middle',
          text: [
            'The Hot Tag split down the middle without a word: window booths for {hero}, the counter for {villain}. June put the sugar in the exact center and told both sides to share. For once, they did, in silence.',
            'Pip held up two signs, one for each side, and swapped them every ten minutes to stay fair. By noon he was exhausted and perfectly neutral.',
          ],
          headline: ['THE HOT TAG SPLITS DOWN THE MIDDLE', 'PIP HOLDS TWO SIGNS AND STAYS NEUTRAL'],
        },
      ],
      [
        {
          key: 'signing_in_silence', kind: 'contract', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'Contract signing: {hero} & {villain}',
          text: [
            '{hero} and {villain} signed in total silence. {villain} slid the pen across. {hero} took it without looking up. The pen was handed back a little more gently than it had been handed over.',
            'Each signed the same page, in the same room, and neither said a word. At the very end {villain} said, quietly, "Saturday." {hero} nodded. It was the first thing they had agreed on in a month.',
          ],
          headline: ['CONTRACT SIGNED IN TOTAL SILENCE', 'THE FIRST THING THEY AGREE ON: SATURDAY'],
        },
        {
          key: 'pips_sign', kind: 'town', purpose: 'town', roles: ['hero', 'villain'], optional: true,
          place: 'the bus stop',
          title: 'Pip\'s sign of the week',
          text: [
            'Pip\'s cardboard sign at the bus stop this week: TALK IT OUT, THEN FIGHT IT OUT. A passing bus driver honked in agreement and then, thinking about it, honked again.',
            'Somebody left two milkshakes on the Sportatorium steps with a note: DRINK THESE TOGETHER, OR DON\'T, BUT DON\'T WASTE THEM. Neither has been touched. Sheriff Bev has logged them as "a statement."',
          ],
          headline: ['PIP: "TALK IT OUT, THEN FIGHT IT OUT"', 'TWO MILKSHAKES LEFT ON THE STEPS'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The air clears',
          text: [
            '{hero.real} and {villain.real} stayed after close and finally said all of it, quietly, with no crowd. It took an hour. At the end they shook hands, then hugged, then ordered pie.',
            'June set down one milkshake with two straws and walked away. By the second sip {hero.real} and {villain.real} were laughing about the worst of it, and by the last they were planning to repaint the diner sign.',
            'Birdie put the key to the booth on the table and said, "Take all the time you need." They did. When June opened up at six, both were asleep on the same side of the booth and the pie was gone.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'hero_wins', label: 'Partner A takes the night', winner: 'hero', weight: 0.4,
        text: [
          '{hero} won, and neither of them could bring themselves to celebrate. {hero} offered {villain} a hand up, and this time it was taken without a word.',
          'The three count rang out and the building exhaled. {hero} knelt beside {villain} for a long moment, and the cheers, when they came, were soft, grateful and long.',
        ],
        epilogue: [
          '{hero.real} and {villain.real} shook on it in the booth. "No more hard feelings." "Some," said {villain.real}. "Some," agreed {hero.real}. June brought pie, which helped.',
          'Birdie wrote CLEAR on a napkin and drew a little sun beside it. "Whatever you two do next, do it together."',
        ],
        headline: ['{hero} WINS A HARD-FOUGHT BATTLE', 'THE VFW EXHALES'],
      },
      {
        id: 'villain_wins', label: 'Partner B takes the night', winner: 'villain', weight: 0.4,
        text: [
          '{villain} won, and the first thing {villain} did was lean over and say something quiet in {hero}\'s ear. {hero} laughed, wet-eyed, and nodded. The crowd had no idea what had been said.',
          '{villain} took the win without a single flex and held {hero}\'s hand up afterward. The crowd, which had come for a fight, got something better and did not know what to call it.',
        ],
        epilogue: [
          '{villain.real} said the quiet thing was "I\'m sorry about March." {hero.real} said March had been forgotten by April.',
          'June gave them a milkshake with two straws and a bill with two names, split perfectly down the middle.',
        ],
        headline: ['{villain} WINS, THEN WHISPERS TO {hero}', 'A WIN WITHOUT A SINGLE FLEX'],
      },
      {
        id: 'handshake', label: 'No winner, one handshake', winner: null, weight: 0.2,
        text: [
          'It ended in a no contest when both of them stopped swinging at the same moment, breathing hard, and shook hands in the middle of the ring. The building made a sound it had never made before.',
          'Neither would finish it. Both walked to the center, looked at each other, laughed, and walked up the aisle together, arguing happily about who started it.',
        ],
        epilogue: [
          '{hero.real} and {villain.real} repainted the diner sign the next morning, one letter each. June supervised, with pie.',
          'Birdie called it the cleanest no contest she had ever seen. "That\'s a keeper," she said, and meant both of them.',
        ],
        headline: ['NO CONTEST: RIVALS SHAKE HANDS IN THE RING', 'THE FEUD ENDS WITH A LAUGH'],
      },
    ],
    gusWords: ['Straight Talk', 'Unfiltered', 'Grievance', 'Honest Truth', 'Clear the Air', 'Hard Words', 'Plain Speaking', 'The Reckoning'],
    wants: [
      'I want to say what I really think, and then fix it over pie.',
      'I want a fight the crowd can feel is real, and a friend at the end of it.',
      'I want {villain.real} and me to finally have the talk.',
    ],
    background: true,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.18 The Redemption
  {
    id: 'redemption',
    name: 'The Redemption',
    register: 'forgiveness and warmth',
    blurb: 'A villain gets abandoned, does something kind on camera, and spends the rest of the story earning back a town that keeps the surcharge board up.',
    tags: ['heartfelt', 'drama', 'tag', 'slow_build'],
    roles: [
      { key: 'hero', label: 'The Wronged Hero', align: 'hero', player: true },
      { key: 'villain', label: 'The Redeeming Villain', align: 'any', player: true },
      { key: 'doubter', label: 'The Doubter', align: 'any', optional: true },
    ],
    length: [4, 5, 6],
    cards: {
      hook: ['HK-01', 'HK-07'],
      twist: ['TW-02', 'TW-13', 'TW-17'],
      stakes: ['ST-12', 'ST-02'],
      payoff: ['PO-02', 'PO-07'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'abandoned', kind: 'match', purpose: 'establish',
          sides: [['villain', '@any'], ['@any', '@any']], winner: 1,
          title: 'Tag match: {villain} & partner in action',
          text: [
            '{villain}\'s partner walked out in the middle of the match and left {villain} alone to take the pin. {villain} stared at the empty corner for a long time after the bell.',
            'A tag match, a hot tag that never came, and a partner who had somewhere better to be. {villain} took the loss alone and, going up the aisle, did not boo back at the boos.',
          ],
          headline: ['{villain}\'S PARTNER WALKS OUT MID-MATCH', 'ABANDONED IN THE RING'],
        },
        {
          key: 'kind_camera', kind: 'angle', purpose: 'tease', roles: ['villain'],
          title: 'Backstage: {villain}',
          text: [
            'The crew camcorder caught {villain} in the hallway holding the door for a delivery driver, then carrying the driver\'s box to the loading dock. When {villain} noticed the lens, {villain} said, "Delete that."',
            'Late at night the camcorder caught {villain} taping a kid\'s abandoned cardboard belt carefully back together in the empty ring and leaving it on the apron with a note: GOOD WORK.',
          ],
          headline: ['{villain} CAUGHT BEING KIND ON CAMERA', 'THE CAMCORDER CATCHES A GOOD DEED'],
        },
      ],
      [
        {
          key: 'offer_refused', kind: 'angle', purpose: 'heat', roles: ['villain', 'hero'],
          title: 'Backstage: {villain} & {hero}',
          text: [
            '{villain} offered {hero} a hand up after a rough match. {hero} looked at it, looked at {villain}, and got up alone. {villain} nodded, as though that had been fair.',
            '{villain} left a bouquet of grocery-store carnations in {hero}\'s locker. {hero} returned it with a note: NOT YET. {villain} read it twice and put it in a pocket.',
          ],
          headline: ['{hero} TURNS DOWN {villain}\'S HELPING HAND', 'CARNATIONS RETURNED: "NOT YET"'],
        },
        {
          key: 'surcharge_stays', kind: 'town', purpose: 'town', roles: ['villain'],
          place: 'Tallbridge Bakery',
          title: 'The surcharge stays up',
          text: [
            'The bakery board still read VILLAIN SURCHARGE: $1 (YES, {villain}). Underneath, a customer had chalked: BUT SOMEONE HELD A DOOR. The chalk was rubbed out within the hour.',
            'Agnes Pickett told Main Street that people can change. Main Street asked her to say it again, slower. She did. The surcharge board stayed exactly as it was.',
          ],
          headline: ['SURCHARGE STAYS UP, FOR NOW', 'AGNES: "PEOPLE CAN CHANGE." MAIN STREET: "SLOWER."'],
        },
        {
          key: 'unwelcome_help', kind: 'run-in', purpose: 'segment', roles: ['villain', 'hero'],
          title: 'Run-in: {villain}',
          text: [
            'When two opponents jumped {hero} from behind, {villain} came down the aisle, cleared the ring and offered a hand again. {hero} shouted, "I didn\'t ask for help!" and then, quietly, "Thanks."',
            '{villain} slid into the ring in time to stop a double-team, then held both hands up and walked out backward. {hero} watched {villain} go and could not decide what to feel.',
          ],
          headline: ['{villain} RUNS IN TO HELP {hero}; HELP NOT WELCOME', 'A SECOND RESCUE AND A QUIET "THANKS"'],
        },
        {
          key: 'doubter_asks', kind: 'interview', purpose: 'segment', roles: ['doubter', 'villain'], optional: true,
          title: 'Sit-down interview: {doubter} & {villain}',
          text: [
            '{doubter} sat across from {villain} and said, "Once a villain, always a villain." {villain} answered, "Then I\'ll be an excellent one to have around." {doubter} had no reply.',
            '{doubter} asked on camera whether the kindness was a trick. {villain} said, "If it is, it\'s the best one I ever pulled." The audience went "ooh." Nobody could tell.',
          ],
          headline: ['{doubter} ASKS: IS IT A TRICK?', '"ONCE A VILLAIN," SAYS {doubter}'],
        },
      ],
      [
        {
          key: 'proposal', kind: 'promo', purpose: 'gohome', roles: ['villain', 'hero'],
          title: 'In-ring address: {villain}',
          text: [
            '{villain} took the microphone and asked for one thing: a tag match, together, against the partner who walked out. "You don\'t have to forgive me," said {villain}. "Just stand next to me for ten minutes."',
            '{hero} took the microphone from {villain}, held it for a long time, and said, "Saturday." The crowd, which had been holding its breath for a month, finally breathed.',
          ],
          headline: ['A TEAM-UP IS PROPOSED; {hero} SAYS "SATURDAY"', '"STAND NEXT TO ME FOR TEN MINUTES"'],
        },
        {
          key: 'name_wiped', kind: 'town', purpose: 'town', roles: ['villain'],
          place: 'Tallbridge Bakery',
          title: 'The name is wiped off',
          text: [
            'On Thursday morning the bakery board read VILLAIN SURCHARGE: $1 (YES, ______). The name had been wiped clean. Nobody saw who did it. The chalk was still in the sponge.',
            'The bakery quietly slipped {villain} a free cruller and a note: PENDING REVIEW. The board still said surcharge, but the line next to it was blank, and the whole shop knew why.',
          ],
          headline: ['THE SURCHARGE BOARD GOES BLANK', 'BAKERY: "PENDING REVIEW"'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{villain.real} admitted the carnation scene was the hardest to play. "I almost cried in the grocery store." {hero.real} said it had worked. "I almost kept them."',
            'Birdie asked, "Are we good?" {hero.real} and {villain.real} looked at each other. "We\'re getting there," said {hero.real}. June set down two forks and one slice of pie, and said it was the right size.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'redeemed', label: 'Forgiven, and welcome', winner: 'hero', weight: 0.7,
        turn: { who: 'villain', to: 'hero' },
        text: [
          'The old partner went down, and {hero} and {villain} stood together in the middle of the ring. {hero} lifted {villain}\'s hand, and the crowd, which had waited a month for this, roared.',
          '{villain} turned to {hero}, and {hero} held out a hand and said, "Welcome back." The old partner looked for a friend in the crowd. The crowd was busy cheering.',
        ],
        epilogue: [
          'The bakery board read VILLAIN SURCHARGE: $0 (NOBODY). The bakery framed the old chalk and hung it by the register.',
          '{villain.real} paid for pie and left a very large tip. June said it was too much. {villain.real} said, "I\'m catching up."',
        ],
        headline: ['{villain} IS FORGIVEN; THE SURCHARGE COMES OFF', 'A TAG TEAM FOR THE AGES'],
      },
      {
        id: 'earned_trust', label: 'Trust, but not yet friends', winner: 'hero', weight: 0.3,
        text: [
          'They won together, and afterward {hero} shook {villain}\'s hand once, firmly, and said, "That was a start." It was the nicest sentence the VFW had heard all year.',
          '{villain} stood in the ring, waiting to be thanked. {hero} nodded. That was all. It was enough, and the building knew it.',
        ],
        epilogue: [
          '{hero.real} told {villain.real} not to get comfortable. "We\'re not there." "Not yet," said {villain.real}. Birdie wrote YET on a napkin and underlined it twice.',
          'The bakery board changed to VILLAIN SURCHARGE: 50 CENTS (YES, {villain}). It was the first discount in a year.',
        ],
        headline: ['{hero} AND {villain} WIN TOGETHER: "A START"', 'THE SURCHARGE DROPS TO 50 CENTS'],
      },
    ],
    gusWords: ['Redemption', 'Second Chance', 'Change of Heart', 'Clean Slate', 'Olive Branch', 'Amends', 'Fresh Start', 'Surcharge'],
    wants: [
      'I want to stop being the bad guy, and I want them to let me.',
      'I want to earn back the bakery surcharge one kind deed at a time.',
      'I want {hero.real} to let me help, whether {hero.real} wants me or not.',
    ],
    background: true,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.19 The Fall from Grace
  {
    id: 'fall_from_grace',
    name: 'The Fall from Grace',
    register: 'dramatic, "I didn\'t see that coming"',
    blurb: 'A hero loses the big one, a smooth talker offers a shortcut, and an old friend waits at the bottom with a hand out.',
    tags: ['drama', 'betrayal', 'heartfelt', 'slow_build'],
    roles: [
      { key: 'hero', label: 'The Old Friend', align: 'hero', player: true },
      { key: 'villain', label: 'The Falling Hero', align: 'any', player: true },
      { key: 'manager', label: 'The Tempter', align: 'villain', optional: true },
    ],
    length: [4, 5, 6],
    cards: {
      hook: ['HK-15', 'HK-03'],
      twist: ['TW-01', 'TW-08', 'TW-07'],
      stakes: ['ST-01', 'ST-11'],
      payoff: ['PO-04', 'PO-05'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'big_loss', kind: 'match', purpose: 'establish',
          sides: [['villain'], ['@any']], winner: 1,
          title: '{villain} in action',
          text: [
            '{villain} lost the biggest match of the year by a single count, then kicked a folding chair on the way out and apologized to it. The chair, according to the Tattler, accepted.',
            'The loss was close and loud, and {villain} took it hard. Up the aisle {villain} stopped at the curtain, turned, and stared at the ring for a very long time, as if the ring owed an explanation.',
          ],
          headline: ['{villain} LOSES THE BIG ONE', '{villain} KICKS A CHAIR, THEN APOLOGIZES'],
        },
        {
          key: 'chin_up', kind: 'town', purpose: 'town', roles: ['villain'],
          place: 'Main Street',
          title: 'Chin up, Main Street',
          text: [
            '{villain} walked down Main Street without looking up, past the old victory mural, past the bakery, past Pip\'s sign: CHIN UP. Pip held it higher as {villain} passed.',
            'Coach Patty fell into step beside {villain} on Main Street and said nothing for three blocks. At the corner she said, "Everybody loses." {villain} said, "I know." She said, "Then stop looking like you don\'t."',
          ],
          headline: ['{villain} WALKS MAIN STREET WITHOUT LOOKING UP', 'PIP\'S SIGN: "CHIN UP"'],
        },
      ],
      [
        {
          key: 'shortcut_offer', kind: 'angle', purpose: 'tease', roles: ['manager', 'villain'], optional: true,
          title: 'Backstage: {manager} & {villain}',
          text: [
            '{manager} leaned against the locker room door in a very sharp suit and offered {villain} a shortcut. "Nobody has to know," said {manager}. {villain} did not say no, and the camera noticed.',
            '{manager} slid a glossy brochure across the table: THE FAST LANE. {villain} flipped through it twice and tucked it into a jacket pocket. The Sportatorium made a long, quiet "oh no."',
          ],
          headline: ['{manager} OFFERS {villain} A SHORTCUT', 'THE FAST LANE BROCHURE'],
        },
        {
          key: 'cheap_win', kind: 'match', purpose: 'heat',
          sides: [['villain'], ['@any']], winner: 0, cheat: true,
          title: '{villain} in action',
          text: [
            '{villain} won with a handful of tights and a referee who was looking the wrong way. The boos were new, and {villain} did not enjoy them as much as expected.',
            '{villain} pinned the opponent with both feet on the ropes and raised an arm in victory. Nobody cheered. In the aisle, someone said very clearly, "That was not you."',
          ],
          headline: ['{villain} WINS ON THE ROPES; CROWD TURNS', 'A CHEAP WIN AND A NEW SOUND: BOOS'],
        },
        {
          key: 'friend_confronts', kind: 'angle', purpose: 'segment', roles: ['hero', 'villain'],
          title: 'Backstage: {hero} & {villain}',
          text: [
            '{hero} waited for {villain} in the hallway and asked, plainly, "Is this who you want to be?" {villain} looked at the floor, then at {hero}, then walked past.',
            '{hero} held out the old shirt from their best night. {villain} looked at it for a long moment and said, "That was a long time ago." {hero} said, "It was Tuesday."',
          ],
          headline: ['{hero} CONFRONTS {villain} IN THE HALLWAY', '"IT WAS TUESDAY"'],
        },
        {
          key: 'say_it_isnt_so', kind: 'town', purpose: 'town', roles: ['villain'],
          place: 'outside Steel Chair Hardware',
          title: '"Say it isn\'t so"',
          text: [
            'Pip\'s sign outside the hardware store this week: SAY IT ISN\'T SO. He held it for five hours and left only when his dads brought lunch.',
            'Agnes Pickett told the post office she was "disappointed, but not surprised, but also surprised." Lorraine put a hand on her shoulder. Main Street held a long, thoughtful silence.',
          ],
          headline: ['PIP\'S SIGN: "SAY IT ISN\'T SO"', 'AGNES: "DISAPPOINTED, BUT ALSO SURPRISED"'],
        },
      ],
      [
        {
          key: 'last_offer', kind: 'promo', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'In-ring address: {hero}',
          text: [
            '{hero} stood in the ring with the old shirt and said, "I\'m not mad. I\'m saving you a spot. If you want it, you know where it is." Then {hero} laid the shirt over the second rope and left.',
            '{hero} took the microphone and said, "Whatever you do Saturday, you\'re still my friend." The building went silent, and {villain} looked at the floor.',
          ],
          headline: ['"I\'M SAVING YOU A SPOT," SAYS {hero}', 'THE OLD SHIRT ON THE SECOND ROPE'],
        },
        {
          key: 'come_home', kind: 'town', purpose: 'town', roles: ['villain'], optional: true,
          place: 'Main Street',
          title: 'A banner over the mural',
          text: [
            'A hand-painted banner appeared over the old victory mural on Main Street: COME HOME. Nobody saw who hung it. Agnes Pickett held the ladder, for a minute, "just for a minute."',
            'Marigold stitched a patch for the old jacket and set it in her window, sewn on straight and tidy, with a tag that read FOR WHENEVER. She said she did not know who it was for. She did.',
          ],
          headline: ['"COME HOME" BANNER GOES UP ON MAIN STREET', 'A PATCH IN THE WINDOW, FOR WHENEVER'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{villain.real} confessed the chair apology had been improvised. "I really did say sorry. I felt it." {hero.real} said the chair had received a card.',
            'Birdie put down her cup. "Being the villain is harder than it looks, isn\'t it, sugar?" {villain.real} said it had been the hardest role of the year.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'friend_wins', label: 'The friend holds the line', winner: 'hero', weight: 0.35,
        text: [
          '{hero} won it and did not celebrate. {hero} knelt next to {villain} and said something nobody could hear. The crowd was quiet, then cheered, softly.',
          'The three count rang out. {hero} stayed beside {villain} until Mo asked them to clear the ring, and then waited for {villain} at the curtain.',
        ],
        epilogue: [
          '{hero.real} said the win felt like a loss. "I only wanted you back." {villain.real} said, "I know," and then, "Not yet, but soon." Birdie wrote SOON on a napkin and slid it across.',
          '{villain.real} took the shirt from the second rope and kept it in the locker. "For whenever." Birdie smiled into her coffee.',
        ],
        headline: ['{hero} WINS, THEN WAITS AT THE CURTAIN', 'A WIN THAT FEELS LIKE A LOSS'],
      },
      {
        id: 'falls_all_the_way', label: 'The fall is complete', winner: 'villain', weight: 0.35,
        text: [
          '{villain} won it with the cheap trick still in hand, and the boos came down like rain. {villain} stood in the center of the ring and, for one second, looked like the loneliest person in the Sportatorium.',
          '{villain} left with the win and without a glance back, and the old shirt stayed on the second rope. Gus, very quietly, did not say a word.',
        ],
        epilogue: [
          '{villain.real} said the boos were real and the loneliness was not, but it sure felt that way. {hero.real} said the door was still open. {villain.real} said, "I know. That\'s the hard part."',
          'Birdie wrote TURN BACK? on a napkin and put it in a drawer. "That one\'s for later."',
        ],
        headline: ['THE FALL IS COMPLETE', '{villain} WINS; THE OLD SHIRT STAYS BEHIND'],
      },
      {
        id: 'turns_back', label: 'Turned back at the last second', winner: 'hero', weight: 0.3,
        turn: { who: 'villain', to: 'hero' },
        text: [
          'At the last second {villain} dropped the cheap trick, let {hero} win clean, and looked up with a very tired smile. The crowd, which had been angry for a month, remembered who it loved.',
          '{villain} pulled the old shirt off the second rope, held it up to the crowd, and put it on. The VFW exploded. Gus took off his headphones for the first time in weeks.',
        ],
        epilogue: [
          '{villain.real} said turning back was the best decision of the year. "I was tired of the boos." {hero.real} said, "I was tired of the quiet." June put out a pie for the whole table.',
          '{hero.real} and {villain.real} hugged in the booth for a very long time. Birdie said she had not seen a hug that big since the Reunion.',
        ],
        headline: ['{villain} TURNS BACK AT THE LAST SECOND', 'THE OLD SHIRT IS WORN AGAIN'],
      },
    ],
    gusWords: ['Fall from Grace', 'Shortcut', 'Temptation', 'Say It Isn\'t So', 'Slippery Slope', 'Crossroads', 'Cheap Win', 'Fast Lane'],
    wants: [
      'I want to fall, and I want to see who catches me.',
      'I want the whole town to say "say it isn\'t so."',
      'I want to take the shortcut and find out what it costs.',
    ],
    background: true,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.20 The Odd Couple
  {
    id: 'odd_couple',
    name: 'The Odd Couple',
    register: 'buddy comedy',
    blurb: 'Two people who cannot stand each other get stuck as a team, and somewhere between the flyers and the fries it starts to click.',
    tags: ['tag', 'comedy', 'whimsy', 'heartfelt'],
    roles: [
      { key: 'hero', label: 'Partner A', align: 'hero', player: true },
      { key: 'ally', label: 'Partner B', align: 'hero', player: true },
      { key: 'villain', label: 'The Champions', align: 'villain', player: true },
    ],
    length: [3, 4, 5],
    cards: {
      hook: ['HK-08', 'HK-06', 'HK-13'],
      twist: ['TW-17', 'TW-02'],
      stakes: ['ST-01', 'ST-07'],
      payoff: ['PO-02', 'PO-11', 'PO-12'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'mismatched_debut', kind: 'match', purpose: 'establish',
          sides: [['hero', 'ally'], ['@any', '@any']], winner: 1,
          title: 'Tag match: {hero} & {ally} in action',
          text: [
            '{hero} and {ally} lost their first match as a team in four minutes, mostly because each kept trying to do the other\'s job. Birdie watched from the aisle with her coffee and a very small smile.',
            'They tagged each other at exactly the wrong times, argued about the right times, and ended up tagging the referee. Mo shook it off and counted the pin on both of them.',
          ],
          headline: ['{hero} AND {ally}: A TEAM THAT WILL NOT WORK', 'THE ODD COUPLE LOSES IN FOUR MINUTES'],
        },
        {
          key: 'same_booth', kind: 'town', purpose: 'town', roles: ['hero', 'ally'],
          place: 'the Hot Tag Diner',
          title: 'One booth, two checks',
          text: [
            'By order of Commissioner Birdie, June sat {hero} and {ally} in the same booth. They asked for separate checks, then separate napkins, then, finally, separate ends of the booth.',
            '{hero} ordered a salad. {ally} ordered a double cheeseburger. They spent the meal explaining to the whole diner exactly what was wrong with the other\'s choice, and by the end they had split the fries.',
          ],
          headline: ['BIRDIE SEATS THE ODD COUPLE TOGETHER', 'SEPARATE CHECKS, SEPARATE NAPKINS, ONE BOOTH'],
        },
      ],
      [
        {
          key: 'hang_flyers', kind: 'angle', purpose: 'segment', roles: ['hero', 'ally'],
          title: 'Fairgrounds: {hero} & {ally}',
          text: [
            'Birdie sent {hero} and {ally} to the fairgrounds to hang flyers together. The camcorder caught a forty-minute argument about staple spacing and one very small high five that did not quite connect.',
            '{hero} measured every flyer with a ruler. {ally} taped them up with a hammer. They stood back, looked at the wall, and agreed, for the first time, that it looked pretty good. Then they argued about why.',
          ],
          headline: ['THE ODD COUPLE HANG FLYERS AT THE FAIRGROUNDS', 'AN ARGUMENT ABOUT STAPLE SPACING'],
        },
        {
          key: 'click', kind: 'match', purpose: 'heat',
          sides: [['hero', 'ally'], ['@any', '@any']], winner: 0,
          title: 'Tag match: {hero} & {ally}',
          text: [
            'They won by accident: {hero} missed a dive, {ally} caught the opponent on the way down, and the three count came before anybody noticed. They stared at each other in shock, then high-fived and missed.',
            'A double-team neither had planned worked perfectly. {hero} blamed luck. {ally} blamed {hero}. The crowd, which had started to like them, cheered the argument.',
          ],
          headline: ['THE ODD COUPLE WINS BY ACCIDENT', 'A HIGH FIVE THAT JUST MISSES'],
        },
        {
          key: 'champs_scoff', kind: 'promo', purpose: 'heat', roles: ['villain'],
          title: 'In-ring address: {villain}',
          text: [
            '{villain} and the champions laughed at the odd couple for a full minute. "Those two couldn\'t agree on a lunch order," said {villain}. Then, thoughtfully: "Actually, that\'s a good bit."',
            '{villain} called the odd couple "a very expensive coincidence" and accepted the challenge. Gus asked what that meant. {villain} said, "It means yes."',
          ],
          headline: ['CHAMPIONS LAUGH AT THE ODD COUPLE', '"A VERY EXPENSIVE COINCIDENCE," SAYS {villain}'],
        },
        {
          key: 'odd_cupcake', kind: 'town', purpose: 'town', roles: ['hero', 'ally'],
          place: 'Tallbridge Bakery',
          title: 'The Odd Couple Cupcake',
          text: [
            'The bakery introduced the Odd Couple Cupcake, one half vanilla and one half jalapeno, in honor of the new team. It sold out by eleven, and returning customers said both halves were a surprise.',
            'Coach Patty ran a recess pool on whether the odd couple would last: six kids said yes, six said no, and one wrote "snacks." Coach Patty counted that as a yes.',
          ],
          headline: ['BAKERY INTRODUCES THE ODD COUPLE CUPCAKE', 'RECESS POOL: WILL THEY LAST?'],
        },
      ],
      [
        {
          key: 'in_sync', kind: 'interview', purpose: 'gohome', roles: ['hero', 'ally'],
          title: 'Sit-down interview: {hero} & {ally}',
          text: [
            'Gus asked how they felt about Saturday. {hero} and {ally} answered in sync, to the syllable, and then glared at each other for having done so.',
            '{hero} started a sentence, {ally} finished it, and neither noticed. Gus pointed it out. They said "No we didn\'t" at the same time. The crowd lost it.',
          ],
          headline: ['THE ODD COUPLE FINISH EACH OTHER\'S SENTENCES', '"NO WE DIDN\'T," THEY SAY IN UNISON'],
        },
        {
          key: 'recess_high_five', kind: 'town', purpose: 'town', roles: ['hero', 'ally'], optional: true,
          place: 'the elementary school playground',
          title: 'The Odd Couple High Five',
          text: [
            'Kids at recess invented the Odd Couple High Five, a complicated motion that ends in a very small, very satisfying clap. By Thursday the whole playground could do it.',
            'Pip appeared at the playground with two cardboard belts and tried to make the odd couple shake on it. The recess aide declared it "the best partnership of the year."',
          ],
          headline: ['THE ODD COUPLE HIGH FIVE HITS RECESS', 'PIP BRINGS TWO BELTS TO A HANDSHAKE'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'ally'],
          title: 'The back booth',
          text: [
            '{hero.real} and {ally.real} sat on opposite sides of the booth and agreed the other was a pain. Then {hero.real} slid the fries to the middle without a word, and {ally.real} took one.',
            'Birdie asked whether the Diner Bet had been rigged. "Obviously," said {hero.real}. "Obviously," said {ally.real}. Birdie sipped her coffee and said nothing, which is how she says yes.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'high_five_lands', label: 'The high five connects', winner: 'hero', weight: 0.65,
        text: [
          '{hero} and {ally} won it together, then turned to each other and, for the first time, the high five landed. The crowd was so loud that nobody heard it.',
          'The three count was loud, the pose was awkward and the high five was perfect. {hero} looked at {ally}. {ally} looked at {hero}. They both said, "Don\'t say anything."',
        ],
        epilogue: [
          '{hero.real} admitted {ally.real} was not so bad. {ally.real} said {hero.real} was fine, "for a morning person." June put two milkshakes on one tab.',
          'Birdie wrote KEEP THEM TOGETHER on a napkin and put it in her pocket. "Who knew," she said. She knew.',
        ],
        headline: ['THE ODD COUPLE WINS; THE HIGH FIVE LANDS', 'AWKWARD POSE, PERFECT HIGH FIVE'],
      },
      {
        id: 'champions_retain', label: 'Lost, but the high five landed', winner: 'villain', weight: 0.35,
        text: [
          '{villain} took the match, but when {hero} and {ally} left the ring they turned together and the high five connected at last, with a loud, wonderful smack. The crowd cheered the loss.',
          'The champions kept it, and the odd couple walked away arm in arm, laughing. Nobody could say who had won the night.',
        ],
        epilogue: [
          '{ally.real} said losing together was better than winning alone. {hero.real} said never to repeat that. They shook hands, then high-fived, then did it again.',
          '{villain.real} offered a rematch at a better time. Birdie said she would put it on a napkin. She already had.',
        ],
        headline: ['CHAMPIONS RETAIN; ODD COUPLE STAYS TOGETHER', 'A LOSS, A LAUGH AND A HIGH FIVE'],
      },
    ],
    gusWords: ['Odd Couple', 'Mismatch', 'Flyers', 'High Five', 'Buddy System', 'Opposites', 'Diner Bet', 'Staple Spacing'],
    wants: [
      'I want to be stuck with somebody I can\'t stand and find out they\'re wonderful.',
      'I want the high five that finally connects.',
      'I want to lose a bet to {ally.real} and see what happens.',
    ],
    background: true,
    playerRoles: ['hero', 'ally', 'villain'],
  },

  // ------------------------------------------------------------ 5.21 The Big City Dream
  {
    id: 'big_city_dream',
    name: 'The Big City Dream',
    register: 'bittersweet, then home',
    blurb: 'A letter from the big city arrives, the town begs a dreamer to stay or to come home, and nobody ever leaves forever.',
    tags: ['big_city', 'leaving', 'heartfelt', 'hometown'],
    roles: [
      { key: 'hero', label: 'The Dreamer', align: 'hero', player: true },
      { key: 'villain', label: 'The Town Loyalist', align: 'any', player: true },
      { key: 'manager', label: 'The City Rep', align: 'villain', optional: true },
    ],
    length: [6, 8, 10],
    cards: {
      hook: ['HK-15', 'HK-07'],
      twist: ['TW-10', 'TW-02', 'TW-13'],
      stakes: ['ST-13', 'ST-03'],
      payoff: ['PO-06', 'PO-01'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'wins_with_doubt', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            '{hero} won a good one and stood in the corner afterward looking up at the rafters, past the banners, as though at a distant skyline. Gus noticed and, for once, said nothing.',
            'The crowd chanted {hero}\'s name, and {hero} smiled and waved and kept one hand in a pocket, holding something folded. Mo noticed, and politely looked at the rafters too.',
          ],
          headline: ['{hero} WINS, GAZES AT THE RAFTERS', 'A FOLDED LETTER IN {hero}\'S POCKET'],
        },
        {
          key: 'mayors_plea', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the courthouse steps',
          title: 'The Mayor\'s plea',
          text: [
            'Mayor Oakes stood on the courthouse steps and made a plea: "Whatever the big city offers, we have a water tower." The crowd cheered. The water tower, being modest, did not comment.',
            'Pip held up a sign at the bus stop with a very long face drawn on it: DON\'T FORGET US (WE\'LL NEVER FORGET YOU). The bus driver slowed to read it and nearly missed the turn.',
          ],
          headline: ['MAYOR OAKES PLEADS: "WE HAVE A WATER TOWER"', 'PIP\'S LONG FACE AND LONG SIGN'],
        },
      ],
      [
        {
          key: 'farewell_match', kind: 'match', purpose: 'segment',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            '{hero} wrestled every match like it might be the last, and the crowd answered in kind. Every hand reached out in the aisle, and {hero} slapped them all and did not look away from a single face.',
            'It was a farewell tour in everything but name: hand-drawn cards, crooked banners and a crowd that sang the entrance music by heart. {hero} had to wait out the cheering before the pin.',
          ],
          headline: ['{hero}\'S FAREWELL TOUR PACKS THE VFW', 'THE CROWD SINGS {hero}\'S ENTRANCE MUSIC'],
        },
        {
          key: 'skyline_cake', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'Tallbridge Bakery',
          title: 'A cake with a skyline',
          text: [
            'The bakery iced a cake for {hero} with a very small skyline on top and a very large bus. Underneath: SAFE TRAVELS. Several customers cried into the frosting, or so the staff reported.',
            'Lorraine packed a care package for {hero}: twine, a tin of mints and a seed packet labeled PLANT THIS WHEREVER YOU END UP. "Come back and tell us how it grew," she said.',
          ],
          headline: ['BAKERY ICES A SKYLINE FOR {hero}', 'LORRAINE PACKS A CARE PACKAGE'],
        },
        {
          key: 'last_night_vfw', kind: 'angle', purpose: 'heat', roles: ['hero', 'villain'],
          title: 'The last night at the VFW',
          text: [
            'After the final bell the crowd stayed, and {hero} and {villain} stayed too, sitting on the apron with their feet dangling. Nobody spoke for a long time, and nobody left.',
            '{villain} walked over, took the microphone and said, "Don\'t go." Not an order. Not quite a request. {hero} said, "I know," and the building made a sound that wasn\'t clapping.',
          ],
          headline: ['THE LAST NIGHT AT THE VFW', '{villain}: "DON\'T GO"'],
        },
        {
          key: 'city_rep', kind: 'angle', purpose: 'tease', roles: ['manager', 'hero'], optional: true,
          title: 'Ringside: {manager}',
          text: [
            '{manager} sat in row one in a very nice suit, took notes on a very small pad, and answered every question from the crowd with "We\'ll see." The crowd found that deeply suspicious.',
            '{manager} approached {hero} after the match and handed over a business card embossed in gold. "The big city is waiting," said {manager}. {hero} looked at the card, and the card looked at {hero}.',
          ],
          headline: ['A CITY REP APPEARS IN ROW ONE', 'A GOLD-EMBOSSED CARD FOR {hero}'],
        },
      ],
      [
        {
          key: 'every_road', kind: 'promo', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'In-ring address: {hero}',
          text: [
            '{hero} took the microphone and said, "I\'ve looked at every road out of here, and every one of them goes back to Main Street." The VFW rose row by row and applauded for a very long time.',
            '"I went looking for the world," said {hero}, "and found out it has a Hot Tag Diner in every direction." {villain} laughed, covered {villain.their} face, and clapped.',
          ],
          headline: ['"EVERY ROAD LEADS BACK TO MAIN STREET"', '{hero} GETS A STANDING OVATION'],
        },
        {
          key: 'new_moves_sign', kind: 'town', purpose: 'town', roles: ['hero'], optional: true,
          place: 'the bus stop',
          title: 'Pip\'s sign at the bus stop',
          text: [
            'Pip\'s sign at the bus stop: SAME TOWN. SAME YOU. NEW MOVES. He taped a second sign beneath it: AND I\'M STILL NOT FORGETTING.',
            'Coach Patty timed the bus from the city to the stop, three times, and declared the commute "perfectly acceptable." Nobody had asked.',
          ],
          headline: ['PIP\'S SIGN: "SAME TOWN. SAME YOU. NEW MOVES."', 'COACH PATTY TIMES THE BUS'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{hero.real} set a postcard with a skyline on the table. "I almost mailed this to you." {villain.real} turned it over. It said, in very neat handwriting: WISH YOU WERE HERE. "I was," said {villain.real}.',
            'Birdie set her coffee down. "Nobody leaves forever, sugar. Not in my town." {hero.real} said that was good, because {hero.real} had no plans to try.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'new_moves_win', label: 'Home with new moves', winner: 'hero', weight: 0.5,
        text: [
          '{hero} won with a move nobody in the building had seen, finished with a flourish and a bow the crowd had to see to believe. Mayor Oakes cried openly.',
          'The new moves worked, and so did the old ones. {hero} raised both arms to a standing crowd and, for the first time in weeks, did not look at the rafters.',
        ],
        epilogue: [
          '{hero.real} put the postcard on the booth wall next to the old photos. "Best of both worlds." Birdie said it was a very small world, and she meant that kindly.',
          '{villain.real} paid for the milkshakes. "Welcome home." {hero.real}: "Thank you for keeping the lights on."',
        ],
        headline: ['{hero} COMES HOME WITH NEW MOVES', 'MAYOR OAKES WEEPS AT A WINNING RETURN'],
      },
      {
        id: 'loyalist_wins', label: 'The town raised a tough one', winner: 'villain', weight: 0.3,
        text: [
          '{villain} won it, and the first person to hug {villain} was {hero}. "The town raised somebody tough," {hero} said into the microphone. The crowd agreed, loudly.',
          '{villain} held the win up and handed it right back, pulling {hero} to {hero.their} feet and raising both their hands together. A winner, a loser and one very proud town.',
        ],
        epilogue: [
          '{hero.real} said losing at home felt like winning in the city. {villain.real} said that was the nicest insult ever delivered.',
          'Birdie wrote RETURN TICKET on a napkin. "In case anyone ever needs one," she said.',
        ],
        headline: ['{villain} WINS; THE TOWN RAISED SOMEBODY TOUGH', '{hero} CONGRATULATES THE HOMETOWN CHAMP'],
      },
      {
        id: 'together', label: 'Together at last', winner: 'hero', weight: 0.2,
        turn: { who: 'villain', to: 'hero' },
        text: [
          '{hero} and {villain} stood side by side as the final bell rang, one coming home and one never having left, and the building wouldn\'t stop shouting both names.',
          'Two heroes, one jacket each, and a standing ovation. The big city was a long way off. Right here, it was just Saturday.',
        ],
        epilogue: [
          '{hero.real} and {villain.real} announced a tag team and an argument about its name in the same sentence. Birdie gave them a week.',
          'June added a second stool next to {hero.real}\'s. "For the one who stayed," she said.',
        ],
        headline: ['{hero} AND {villain} TEAM UP AT LAST', 'ONE CAME HOME, ONE NEVER LEFT: TOGETHER'],
      },
    ],
    gusWords: ['Big City', 'Skyline', 'Bus Ticket', 'Homecoming', 'The Letter', 'Going Places', 'Return Ticket', 'Dream'],
    wants: [
      'I want a shot at the big city, and I want this town to let me go.',
      'I want to come home better than I left.',
      'I want to be the one who stays and keeps the lights on.',
    ],
    background: false,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.22 The Manager's War
  {
    id: 'managers_war',
    name: 'The Manager\'s War',
    register: 'scheming, with 80s flair',
    blurb: 'Two managers with clipboards and megaphones fight over a client, and the clients get to settle it while the managers are tied together at ringside.',
    tags: ['comedy', 'old_school', 'spectacle', 'rules'],
    roles: [
      { key: 'hero', label: 'The Hero\'s Client', align: 'hero', player: true },
      { key: 'villain', label: 'The Rival Client', align: 'villain', player: true },
      { key: 'manager', label: 'Manager A', align: 'hero', player: true },
      { key: 'rival_manager', label: 'Manager B', align: 'villain', player: true },
    ],
    length: [4, 5, 6],
    cards: {
      hook: ['HK-06', 'HK-14'],
      twist: ['TW-08', 'TW-07', 'TW-01'],
      stakes: ['ST-09', 'ST-02'],
      payoff: ['PO-07', 'PO-02', 'PO-05'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'ringside_clipboard', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            '{hero} won with {manager} at ringside, shouting instructions through a megaphone and holding up a clipboard of diagrams. Across the aisle {rival_manager} watched with narrowed eyes and a very small notepad.',
            '{manager} counted the pin louder than Mo did, which Mo noted. {hero} took the win, {rival_manager} took notes, and neither manager would look at the other.',
          ],
          headline: ['{manager} MAKES A BIG IMPRESSION AT RINGSIDE', '{hero} WINS; MANAGERS EXCHANGE GLARES'],
        },
        {
          key: 'satin_arrival', kind: 'town', purpose: 'town', roles: ['rival_manager', 'villain'],
          place: 'Main Street',
          title: 'A manager arrives in satin',
          text: [
            '{rival_manager} strolled down Main Street in a satin jacket, followed by {villain} carrying two suitcases and a very large trophy. Pip asked for an autograph on his cardboard belt and was given one, with a flourish.',
            '{rival_manager} took the best table at the diner, ordered one coffee and demanded a second pot "for the client." {villain} was seen carrying the suitcases to the car, again, and not complaining. Much.',
          ],
          headline: ['A NEW MANAGER ARRIVES IN SATIN', 'PIP GETS AN AUTOGRAPH ON HIS CARDBOARD BELT'],
        },
      ],
      [
        {
          key: 'interference', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['villain']], winner: 1, cheat: true,
          title: '{hero} vs. {villain}',
          text: [
            '{hero} had {villain} beaten until {rival_manager} flung a clipboard at the ropes and distracted Mo for exactly one second. {villain} won, and {rival_manager} bowed to the crowd for no reason.',
            '{rival_manager} climbed on the apron to argue a rules question with Mo. While Mo explained the rules, {villain} rolled up {hero} for the win. {manager} was furious and made a clipboard note of it.',
          ],
          headline: ['{rival_manager} INTERFERES; {villain} WINS', 'A RULES QUESTION COSTS {hero} THE MATCH'],
        },
        {
          key: 'dueling_promos', kind: 'promo', purpose: 'segment', roles: ['manager', 'rival_manager'],
          title: 'In the ring: {manager} & {rival_manager}',
          text: [
            '{manager} and {rival_manager} stood nose to nose on the ring apron and traded insults for six minutes, each more elaborate than the last. Gus awarded {rival_manager} the round for best use of the word "nefarious."',
            'Dueling promos: each manager held a megaphone and shouted at the other through it until both megaphones squealed. Mo took them away and gave them back at the end of the show.',
          ],
          headline: ['MANAGERS TRADE INSULTS FOR SIX STRAIGHT MINUTES', 'MO CONFISCATES BOTH MEGAPHONES'],
        },
        {
          key: 'custody_notices', kind: 'town', purpose: 'town', roles: ['manager', 'rival_manager'],
          place: 'Steel Chair Hardware',
          title: 'The custody notices',
          text: [
            'Both managers pinned notices to the community board at Steel Chair Hardware: LOST, ONE PROMISING CLIENT, WILL NOT BE RETURNED. Both clients were standing outside, waiting for a ride.',
            'A custody fight broke out on the sidewalk: each manager insisted the other\'s client had signed the wrong napkin. Sheriff Bev listened for three minutes and ruled, "I\'m not touching this."',
          ],
          headline: ['MANAGERS POST "LOST CLIENT" NOTICES', 'SHERIFF BEV: "I\'M NOT TOUCHING THIS"'],
        },
        {
          key: 'manager_call', kind: 'wrsl', purpose: 'wrsl', roles: ['rival_manager', 'villain'], optional: true,
          title: '{rival_manager} calls The Gravel Pit',
          text: [
            '{rival_manager} called The Gravel Pit to speak "on behalf of my client, who is unavailable, because I said so." Gus pointed out that {villain} was sitting right there in the studio. "Resting," said {rival_manager}.',
            '{rival_manager} offered Gus a management contract live on the air. Gus said no. {rival_manager} offered a better one. Gus said no again, then asked, off the air, what the better one included.',
          ],
          headline: ['{rival_manager} CALLS IN "FOR MY CLIENT"', 'GUS TURNS DOWN A MANAGEMENT CONTRACT'],
        },
      ],
      [
        {
          key: 'managers_sign', kind: 'contract', purpose: 'gohome', roles: ['manager', 'rival_manager', 'hero', 'villain'],
          title: 'Contract signing: {manager} & {rival_manager}',
          text: [
            'The managers signed for their clients with matching pens and matching glares, each trying to sign first. The ink ran together, and the result was a document nobody could read. Mo declared it binding.',
            '{manager} and {rival_manager} agreed to the stipulation, then each tried to rewrite it in their own favor. Mo took the pen away and wrote "Good luck" at the bottom.',
          ],
          headline: ['MANAGERS SIGN FOR THEIR CLIENTS; INK RUNS', 'MO TAKES THE PEN AND WRITES "GOOD LUCK"'],
        },
        {
          key: 'bandana_rush', kind: 'town', purpose: 'town', roles: ['manager', 'rival_manager'], optional: true,
          place: 'Main Street',
          title: 'Main Street prepares',
          text: [
            'Marigold sold out of bandanas in a single morning. Agnes Pickett bought four "for the church picnic," and did not elaborate.',
            'A very large crate rolled down Main Street on a flatbed, labeled SHARK CAGE (NO SHARK). Half the town followed it to the Sportatorium and stood outside, politely.',
          ],
          headline: ['MARIGOLD SELLS OUT OF BANDANAS', 'A CRATE LABELED "SHARK CAGE (NO SHARK)"'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'manager', 'rival_manager'],
          title: 'The back booth',
          text: [
            '{manager.real} confessed the megaphone was borrowed from the PTA. "It had a name label." {hero.real} said it was the best tool any manager had ever used, and asked if it could be returned.',
            'Birdie asked who picked the satin jackets. Both managers raised a hand at once. June served one milkshake in a cup marked MANAGER and another marked OTHER MANAGER, and watched with interest.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'client_wins', label: 'The hero\'s client wins', winner: 'hero', weight: 0.45,
        text: [
          '{hero} won it, and {manager} leaped into the ring with the megaphone and shouted "I TOLD YOU SO" at the building, the sky and Mo.',
          'The three count was clean, the managers were rattled and the clipboards flew. {manager} took the credit, {hero} took the win and the crowd took the show.',
        ],
        epilogue: [
          '{manager.real} swore the whole thing was a plan. {hero.real} swore it was a miracle. They agreed it was a plan that needed a miracle.',
          '{rival_manager.real} bought {manager.real} a coffee with a note: BEST MANAGER I\'VE LOST TO. {manager.real} wore the note proudly.',
        ],
        headline: ['{hero} WINS; {manager} SHOUTS "I TOLD YOU SO"', 'CLIPBOARDS FLY AT THE VFW'],
      },
      {
        id: 'rival_wins', label: 'The rival client wins', winner: 'villain', weight: 0.35,
        text: [
          '{villain} won, and {rival_manager} accepted the crowd\'s boos like a standing ovation, then bowed to each section in turn. Mo checked the time and sighed.',
          '{rival_manager} lifted {villain}\'s arm and announced to the building, "The finest client in the history of clients." {villain} looked a little surprised and a little proud.',
        ],
        epilogue: [
          '{rival_manager.real} said the cage was the most fun of the decade. {manager.real} said that was no excuse for the bandanas.',
          '{villain.real} thanked {rival_manager.real} for the megaphone. {rival_manager.real} said it was borrowed.',
        ],
        headline: ['{villain} WINS; {rival_manager} BOWS TO THE BOOS', '"THE FINEST CLIENT IN THE HISTORY OF CLIENTS"'],
      },
      {
        id: 'stalemate', label: 'Double count-out, tied together', winner: null, weight: 0.2,
        text: [
          'It ended in a double count-out with both managers still tied together at ringside, hopping toward the exit in perfect unison. The crowd cheered. The managers did not.',
          'Neither client could get the pin, and both managers got stuck together in the rope with a bandana. By the time Mo untangled them the show was over and everyone was laughing.',
        ],
        epilogue: [
          '{manager.real} and {rival_manager.real} walked out of the Sportatorium still tied together by a bandana, arguing about who was leading. June held the door.',
          'Birdie wrote PARTNERS? on a napkin. Both managers saw it. Both said "Never," in unison.',
        ],
        headline: ['DOUBLE COUNT-OUT; MANAGERS STILL TIED TOGETHER', 'THE MANAGERS WALK OUT IN UNISON'],
      },
    ],
    gusWords: ['Manager\'s War', 'Clipboard', 'Megaphone', 'Custody', 'Schemers', 'Ringside', 'Satin Jackets', 'Hustle'],
    wants: [
      'I want to manage somebody and be unbearable about it.',
      'I want to win a custody battle over a client who never asked.',
      'I want a megaphone, and a reason to use it.',
    ],
    background: true,
    playerRoles: ['hero', 'villain', 'manager', 'rival_manager'],
  },

  // ------------------------------------------------------------ 5.23 The Tournament
  {
    id: 'tournament',
    name: 'The Tournament',
    register: 'sporting spectacle',
    blurb: 'A bracket goes up in the diner window, the town bets in pies, and a dark horse keeps winning when nobody is looking.',
    tags: ['title', 'spectacle', 'spotlight', 'clean_finish'],
    roles: [
      { key: 'hero', label: 'The Dark Horse', align: 'hero', player: true },
      { key: 'villain', label: 'The Favorite', align: 'villain', player: true },
      { key: 'entrant', label: 'The Semifinalist', align: 'any', optional: true, player: true },
    ],
    length: [3, 4, 6],
    cards: {
      hook: ['HK-06', 'HK-02'],
      twist: ['TW-03', 'TW-05', 'TW-15'],
      stakes: ['ST-01', 'ST-10'],
      payoff: ['PO-01', 'PO-02', 'PO-23'],
    },
    twistAt: 'midpoint',
    acts: [
      [
        {
          key: 'first_round', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 0,
          title: 'Round one: {hero}',
          text: [
            '{hero} won round one, quietly, in the middle of the card, while the crowd was busy checking the bracket. Gus said {hero} had "snuck up on everyone, including the bracket."',
            'Nobody had put a pie on {hero}. {hero} won anyway, in eleven minutes, and left the ring while the crowd went back to its popcorn. Mo wrote the result down twice.',
          ],
          headline: ['{hero} QUIETLY WINS ROUND ONE', 'NOBODY PUT A PIE ON {hero}'],
        },
        {
          key: 'bracket_goes_up', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'the Hot Tag Diner',
          title: 'The bracket goes up',
          text: [
            'The tournament bracket went up in the Hot Tag window, four feet wide and drawn in marker. By noon half the town stood outside with a pencil, and three people had been caught trying to fill it in with pie bets.',
            'The Tattler printed the bracket on the front page, with Clementine\'s predictions in the margins. Her pick for the winner was "a very close race." The town agreed it was the most accurate thing she had ever written.',
          ],
          headline: ['BRACKET GOES UP IN THE HOT TAG WINDOW', 'TATTLER PREDICTS "A VERY CLOSE RACE"'],
        },
      ],
      [
        {
          key: 'dark_horse_run', kind: 'match', purpose: 'segment',
          sides: [['hero'], ['@any']], winner: 0,
          title: 'Round two: {hero}',
          text: [
            '{hero} beat a top seed in the sort of match that gets talked about until Christmas. The crowd, which had barely noticed {hero} in round one, stood for the final three count.',
            'The bracket was supposed to be easy. {hero} made it hard, and then made it beautiful. When the bell rang, the pie bets at the Hot Tag were officially rewritten.',
          ],
          headline: ['{hero} STUNS A TOP SEED', 'THE PIE BETS ARE REWRITTEN'],
        },
        {
          key: 'favorite_advances', kind: 'match', purpose: 'heat',
          sides: [['villain'], ['@any']], winner: 0, cheat: true,
          title: 'Round two: {villain}',
          text: [
            '{villain} advanced with one foot on the ropes and a look of immense innocence. Mo missed it. The crowd did not, and the boos could be heard from the parking lot.',
            '{villain} won by a roll-up with a handful of tights and then took a very formal bow. "The bracket," {villain} announced, "is a formality."',
          ],
          headline: ['{villain} ADVANCES ON THE ROPES', '"THE BRACKET IS A FORMALITY," SAYS {villain}'],
        },
        {
          key: 'pie_chalkboard', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'Tallbridge Bakery',
          title: 'The pie-odds chalkboard',
          text: [
            'The bakery put up a pie-odds chalkboard. By Thursday it read: DARK HORSE, 12 PIES; FAVORITE, 14 PIES; AGNES PICKETT, 3 PIES ON THE DARK HORSE, AND SHE IS NOT SAYING WHY.',
            'Mayor Oakes declared the pie pool "a local custom" and, on advice from Coach Patty, capped it at three pies a person. Agnes Pickett rounded up to four.',
          ],
          headline: ['BAKERY\'S PIE ODDS: THE DARK HORSE GAINS', 'MAYOR CAPS THE PIE POOL AT THREE PER PERSON'],
        },
        {
          key: 'eliminated_coach', kind: 'angle', purpose: 'tease', roles: ['entrant', 'hero'], optional: true,
          title: 'Ringside: {entrant}',
          text: [
            '{entrant} was knocked out of the bracket, then took a seat in {hero}\'s corner with a clipboard and a great deal of advice. "You\'re doing great," said {entrant}. "Do exactly what I did, but better."',
            'After being eliminated, {entrant} hung a hand-lettered banner at ringside: GO {hero}. The banner was crooked. {entrant} refused to fix it, for authenticity.',
          ],
          headline: ['ELIMINATED {entrant} BACKS {hero}', 'A CROOKED BANNER FOR THE DARK HORSE'],
        },
      ],
      [
        {
          key: 'bracket_unveiled', kind: 'angle', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'The bracket: {hero} & {villain}',
          text: [
            'Gus unveiled a giant bracket with both finalists\' names on the last line, and the two of them stood beneath it nose to nose as the crowd chanted both names in turn.',
            '{hero} and {villain} posed for the cameras in front of the final line of the bracket, each holding a very large pie. Neither would share. The crowd roared.',
          ],
          headline: ['THE FINAL TWO STAND BENEATH THE BRACKET', 'A PIE EACH, AND NO SHARING'],
        },
        {
          key: 'banner_measured', kind: 'town', purpose: 'town', roles: ['hero', 'villain'], optional: true,
          place: 'Main Street',
          title: 'Main Street gets ready',
          text: [
            'The Hot Tag built a pie rack in the window to hold every wager on the finalists. It filled by Friday. June stood guard with a spatula.',
            'Hank Szabo was seen measuring the Sportatorium floor for a very large banner and humming something that sounded like a marching band. The whole town already knew.',
          ],
          headline: ['A PIE RACK FOR EVERY WAGER', 'A BANNER IS MEASURED FOR SATURDAY'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{hero.real} admitted the bracket had been the best part. "A whole wall of people to beat, in order." {villain.real} said the bracket had been the most stressful part. "I could never read it from across the room."',
            'Birdie divided a slice of pie among the whole bracket on a napkin map. "Everyone gets a piece," she said. "Even the ones who lost round one. Especially them."',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'dark_horse_wins', label: 'The dark horse takes it all', winner: 'hero', weight: 0.55,
        text: [
          'The dark horse took it all, and the Sportatorium shook. Gus lost his voice, found it, and lost it again. The pies at the Hot Tag were paid out by morning.',
          '{hero} raised both arms as the crowd chanted the name nobody had picked. Agnes Pickett stood on her chair and shouted, "I TOLD YOU." She had told nobody.',
        ],
        epilogue: [
          '{hero.real} said the surprise was the best part. "I got to be surprised, too." {villain.real} said that was the nicest thing a favorite had ever been told.',
          'June served the winner the largest pie she had ever baked. The bracket stayed in the window until the marker faded.',
        ],
        headline: ['THE DARK HORSE TAKES THE TOURNAMENT', '{hero} WINS IT ALL; AGNES: "I TOLD YOU"'],
      },
      {
        id: 'favorite_wins', label: 'The favorite holds on', winner: 'villain', weight: 0.45,
        text: [
          '{villain} won it all and accepted the boos as a tribute, then, when the cheering started up for {hero}, quietly joined in. "Good run," {villain} said into the microphone.',
          'The favorite took the final, and the bracket was retired to the Hot Tag wall of fame. {hero} got the ovation. {villain} got the trophy and the sympathy.',
        ],
        epilogue: [
          '{villain.real} said the hardest part of being the favorite was being the favorite. {hero.real} said that sounded like a very cute problem.',
          'Birdie wrote NEXT YEAR on a napkin and drew a very small bracket. "Better start practicing."',
        ],
        headline: ['{villain} WINS THE TOURNAMENT', 'THE FAVORITE PRAISES THE DARK HORSE'],
      },
    ],
    gusWords: ['Tournament', 'Bracket', 'Dark Horse', 'Gauntlet', 'Pie Pool', 'Cinderella Run', 'Final Round', 'Top Seed'],
    wants: [
      'I want to be the long shot nobody put a pie on.',
      'I want a bracket so big it needs its own wall.',
      'I want the whole town arguing over the bracket.',
    ],
    background: true,
    playerRoles: ['hero', 'villain', 'entrant'],
  },

  // ------------------------------------------------------------ 5.24 The Prank War
  {
    id: 'prank_war',
    name: 'The Prank War',
    register: 'pure comedy',
    blurb: 'A rubber chicken in a boot, glitter in a robe, and a mustache on the water tower. Only ever insiders, never a mark.',
    tags: ['prank', 'comedy', 'whimsy', 'mess'],
    roles: [
      { key: 'hero', label: 'Prankster A', align: 'hero', player: true },
      { key: 'villain', label: 'Prankster B', align: 'villain', player: true },
      { key: 'collateral', label: 'The Collateral', align: 'any', optional: true },
    ],
    length: [2, 3, 4],
    cards: {
      hook: ['HK-10', 'HK-08'],
      twist: ['TW-11', 'TW-03'],
      stakes: ['ST-07', 'ST-08'],
      payoff: ['PO-11', 'PO-15', 'PO-12'],
    },
    twistAt: 'midpoint',
    acts: [
      [
        {
          key: 'glitter_robe', kind: 'match', purpose: 'establish',
          sides: [['villain'], ['@any']], winner: 0,
          title: '{villain} in action',
          text: [
            '{villain} made a grand entrance in a robe that rained glitter with every step, then stood confused in the ring for a full minute, sparkling, until the bell. {villain} won while visibly shedding.',
            'The glitter robe never stopped. Every time {villain} threw a punch, a small cloud went up. The crowd loved it, the referee hated it, and the opponent sneezed for a week.',
          ],
          headline: ['{villain} WINS IN A ROBE THAT RAINS GLITTER', 'THE SPARKLING MYSTERY OF THE ROBE'],
        },
        {
          key: 'glitter_trail', kind: 'town', purpose: 'town', roles: ['villain', 'hero'],
          place: 'Main Street',
          title: 'Following the glitter',
          text: [
            'Pip followed a trail of glitter from the Sportatorium, down Main Street, to a very small rubber chicken sitting on the curb. He photographed it and sealed it in an envelope marked EVIDENCE.',
            'Sheriff Bev swept the Sportatorium steps with a tiny broom and filed a report titled GLITTER: A NUISANCE. Her basset hound licked the report, for evidence.',
          ],
          headline: ['PIP FOLLOWS A GLITTER TRAIL TO A RUBBER CHICKEN', 'SHERIFF BEV FILES A REPORT ON GLITTER'],
        },
      ],
      [
        {
          key: 'mustache_banner', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'the water tower',
          title: 'A mustache on the water tower',
          text: [
            'Overnight a very large, removable mustache banner appeared on the water tower. Mayor Oakes stood at the base for a full minute with her arms crossed, then laughed out loud and told the crew to leave it up through Sunday.',
            'Sheriff Bev investigated the water tower mustache with a magnifying glass, a ladder and a tray of donuts. She concluded it was "definitely felt, definitely glued, and definitely a very fine mustache."',
          ],
          headline: ['A MUSTACHE APPEARS ON THE WATER TOWER', 'MAYOR OAKES LAUGHS, LEAVES IT UP THROUGH SUNDAY'],
        },
        {
          key: 'kazoo_entrance', kind: 'angle', purpose: 'segment', roles: ['hero', 'villain'],
          title: 'Entrance: {hero} & {villain}',
          text: [
            '{hero}\'s entrance music was swapped for a kazoo ensemble that played the whole way down the aisle. {hero} walked with great dignity, and the crowd followed along, humming.',
            '{villain} walked out to a kazoo version of {villain.their} own theme, then stopped halfway down the aisle and looked at the ceiling, thinking hard about who had done this. The ceiling did not say.',
          ],
          headline: ['KAZOO ENTRANCE STUNS THE VFW', 'THE THEME SONG IS ALL KAZOOS'],
        },
        {
          key: 'mutual_match', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['villain']], winner: null,
          title: '{hero} vs. {villain}',
          text: [
            'The match ended in a no contest when a rubber chicken dropped from the rafters onto the ring and both competitors stopped to examine it. Mo declared it "mutual."',
            'It was a great match until a trapdoor in the ring spat out an enormous cloud of confetti. Neither wrestler could see. Mo called it for neither, and the crowd was laughing too hard to complain.',
          ],
          headline: ['RUBBER CHICKEN FALLS; MATCH DECLARED "MUTUAL"', 'CONFETTI CLOUD ENDS A GREAT MATCH'],
        },
        {
          key: 'collateral_hit', kind: 'angle', purpose: 'tease', roles: ['collateral', 'villain'], optional: true,
          title: 'Ringside: {collateral}',
          text: [
            '{collateral} sat on a very polite whoopee cushion and declared it the funniest thing since the Thaw Brawl. Then, privately, {collateral} swore revenge on both of them.',
            '{collateral} got a tiny bit of glitter in {collateral.their} hair and has not been the same since. Whoever did it should know that {collateral} noticed, and has promised to mention it often.',
          ],
          headline: ['{collateral} SITS ON A WHOOPEE CUSHION', '{collateral} PROMISES REVENGE ON BOTH'],
        },
      ],
      [
        {
          key: 'bev_questions', kind: 'interview', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'Sit-down interview: {hero} & {villain}',
          text: [
            'Sheriff Bev lined them up on folding chairs with a clipboard and asked each to explain themselves. Both pointed at the other, at the same time, and said, "It was them." Sheriff Bev wrote it down twice.',
            'Sheriff Bev produced a rubber chicken as Exhibit A and a glitter robe as Exhibit B. The two pranksters looked at each other, then at the exhibits, and said in unison, "Never seen them."',
          ],
          headline: ['SHERIFF BEV QUESTIONS THE PRANKSTERS', 'EXHIBIT A: A RUBBER CHICKEN'],
        },
        {
          key: 'chicken_window', kind: 'town', purpose: 'town', roles: ['hero', 'villain'], optional: true,
          place: 'Steel Chair Hardware',
          title: 'The chicken appears',
          text: [
            'A rubber chicken appeared in the window of Steel Chair Hardware, wearing a small mustache and a very serious expression. Nobody claimed it. Nobody took it down.',
            'A tiny chicken suit was spotted on the Sportatorium flagpole at dawn, flapping in the breeze. The town applauded when the sun came up behind it.',
          ],
          headline: ['A CHICKEN WITH A MUSTACHE APPEARS IN A WINDOW', 'A CHICKEN SUIT FLIES FROM THE FLAGPOLE'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{hero.real} and {villain.real} divided the confetti by color and laughed so hard June brought a bucket. "Whoever started it," said {hero.real}. "You," said {villain.real}. "No, you," said {hero.real}.',
            '{villain.real} confessed the water tower mustache was the best thing either of them had done. {hero.real} said Mayor Oakes had asked for it to stay up through Sunday. {villain.real} took a bow in the booth.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'hero_wins', label: 'Prankster A takes the chicken', winner: 'hero', weight: 0.4,
        text: [
          '{hero} won and held the rubber chicken overhead like a trophy while the whole VFW honked. {villain} bowed, then tried to steal the chicken, then bowed again.',
          'The three count was drowned out by kazoos, and the winner was announced in song. {hero} took the win and {villain} took the chicken, and both seemed happy.',
        ],
        epilogue: [
          '{hero.real} and {villain.real} agreed to a truce, which lasted four minutes. Then somebody found glitter in the booth.',
          'Birdie wrote PRANK WAR II on a napkin and put it in a drawer. "For the sequel," she said. "Maybe a pie."',
        ],
        headline: ['{hero} WINS THE PRANK WAR', 'THE RUBBER CHICKEN CHANGES HANDS'],
      },
      {
        id: 'villain_wins', label: 'Prankster B takes the chicken', winner: 'villain', weight: 0.4,
        text: [
          '{villain} won, and the crowd cheered so loudly the glitter fell from the rafters on cue. {hero} sat in the middle of it, shaking out a sock and laughing.',
          '{villain} took the win with a flourish and a very small kazoo solo. {hero} shook {villain}\'s hand and found a rubber chicken in it. The VFW erupted.',
        ],
        epilogue: [
          '{villain.real} said the kazoo solo was the best thing anyone had ever done on that ring floor. {hero.real} said the chicken in the handshake was the best. Both agreed the other was wrong.',
          'Birdie said the rubber chicken would be retired to the framed napkin wall, with honors.',
        ],
        headline: ['{villain} WINS THE PRANK WAR', 'A CHICKEN IN THE HANDSHAKE'],
      },
      {
        id: 'draw', label: 'A draw and a mess', winner: null, weight: 0.2,
        text: [
          'The match ended when a bucket of confetti landed on both wrestlers at once. Mo declared it a draw, a mess and, officially, "a Wednesday."',
          'Neither would let the other win, and neither would let the other lose. They shook hands, then both reached for a rubber chicken, and the ring became a very bad pillow fight.',
        ],
        epilogue: [
          '{hero.real} and {villain.real} agreed the draw was the funniest ending. Gus asked whether they knew who had done the water tower. "Yes," said both. They would not say.',
          'Birdie called the prank war a classic and put it on the wall. She also swept up the glitter herself, out of respect.',
        ],
        headline: ['A DRAW, A MESS AND A WEDNESDAY', 'PRANK WAR ENDS IN A DOUBLE CHICKEN'],
      },
    ],
    gusWords: ['Prank War', 'Rubber Chicken', 'Glitter Bomb', 'Shenanigans', 'Kazoo', 'Mustache Caper', 'Tomfoolery', 'Chicken Suit'],
    wants: [
      'I want to put a rubber chicken in {villain.real}\'s boot and not get caught.',
      'I want the silliest war this building has ever seen.',
      'I want Mayor Oakes to laugh at the water tower.',
    ],
    background: true,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.25 The Gentle Monster
  {
    id: 'gentle_monster',
    name: 'The Gentle Monster',
    register: 'a tender reveal',
    blurb: 'The monster flattens everyone, then the camcorder catches something softer, and the whole crowd learns what a smile can do.',
    tags: ['heartfelt', 'menace', 'whimsy', 'slow_build'],
    roles: [
      { key: 'hero', label: 'The Underdog', align: 'hero', player: true },
      { key: 'villain', label: 'The Monster', align: 'villain', player: true },
    ],
    length: [4, 5, 6],
    cards: {
      hook: ['HK-02', 'HK-01'],
      twist: ['TW-13', 'TW-02'],
      stakes: ['ST-14', 'ST-12'],
      payoff: ['PO-09', 'PO-01'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'flattens_everyone', kind: 'match', purpose: 'establish',
          sides: [['villain'], ['@any']], winner: 0,
          title: '{villain} in action',
          text: [
            '{villain} flattened an opponent in under three minutes, then stood in the middle of the ring with arms folded, looking for the next. Nobody in the first six rows wanted to make eye contact.',
            'It was a very short match and a very long silence afterward. {villain} walked to the back without a word, and the people in the aisle leaned away, politely, in unison.',
          ],
          headline: ['{villain} FLATTENS ANOTHER ONE', 'A VERY SHORT MATCH AND A VERY LONG SILENCE'],
        },
        {
          key: 'wide_berth', kind: 'town', purpose: 'town', roles: ['villain'],
          place: 'Main Street',
          title: 'Main Street gives a wide berth',
          text: [
            'Main Street went quiet when {villain} walked past. Lorraine turned her OPEN sign to CLOSED, then, ashamed, back to OPEN. Nobody was sure what they were nervous about. Everybody was sure.',
            'Coach Patty took one look at {villain} coming down the sidewalk and, without breaking stride, crossed to the other side of the street and straightened her whistle. {villain} nodded respectfully and kept walking.',
          ],
          headline: ['MAIN STREET GOES QUIET FOR {villain}', 'LORRAINE FLIPS HER SIGN TWICE'],
        },
      ],
      [
        {
          key: 'lost_kid', kind: 'angle', purpose: 'tease', roles: ['villain'],
          title: 'Backstage: {villain}',
          text: [
            'The camcorder caught {villain} at the concession stand kneeling beside a lost kid, holding a tiny hand until the parents came running. The kid waved goodbye. {villain} waved back, then checked who had noticed.',
            'On the big screen: {villain} crouched in the hallway, gently untangling a kid\'s balloon from a ceiling fan, then handing it back with a small, serious bow. The Sportatorium said "aww" in unison, then looked embarrassed.',
          ],
          headline: ['CAMERA CATCHES {villain} HELPING A LOST KID', 'A BALLOON, A BOW AND AN "AWW"'],
        },
        {
          key: 'bakery_puzzled', kind: 'town', purpose: 'town', roles: ['villain'],
          place: 'Tallbridge Bakery',
          title: 'The bakery is puzzled',
          text: [
            '{villain} bought a dozen cupcakes at the bakery, said "Thank you" and left a tip. The bakery, which had braced for the worst, reviewed the security tape three times and found nothing but manners.',
            'The bakery staff stared at {villain}\'s tip, a crisp bill and a note that said FOR THE NICE CUPCAKES, for a long, puzzled minute. The note is now framed by the register.',
          ],
          headline: ['{villain} THANKS THE BAKERY; STAFF STUNNED', 'A TIP, A NOTE AND A PUZZLED BAKERY'],
        },
        {
          key: 'i_saw_you_smile', kind: 'promo', purpose: 'heat', roles: ['hero', 'villain'],
          title: 'In-ring address: {hero}',
          text: [
            '"I saw you smile," {hero} told {villain} into the microphone. "At the concession stand. I was there." The building went quiet. {villain} took one slow step backward and then, very slightly, did not look away.',
            '{hero} held up a small, blurry photo of {villain} holding a lost kid\'s hand. "That\'s not a monster," said {hero}. "I\'m not worried about that." {villain} looked at the photo, then at the floor.',
          ],
          headline: ['"I SAW YOU SMILE," SAYS {hero}', '{hero} PRODUCES A PHOTO AND A THEORY'],
        },
        {
          key: 'wins_gently', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['villain']], winner: 1,
          title: '{hero} vs. {villain}',
          text: [
            '{villain} won it clean, then picked {hero} up off the mat and set {hero} on {hero.their} feet with one hand, very carefully, like carrying something fragile. The crowd had no idea what to do with that.',
            'It was a hard match, and {villain} won with a pin and a very quiet "good fight" that only the front row heard. {hero} nodded. The front row has not stopped talking about it.',
          ],
          headline: ['{villain} WINS, THEN LIFTS {hero} UP', 'A QUIET "GOOD FIGHT" IN THE FRONT ROW'],
        },
      ],
      [
        {
          key: 'held_out_hand', kind: 'angle', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'Face-off: {hero} & {villain}',
          text: [
            '{hero} walked to the center of the ring and held out a hand. {villain} stared at it for a very long time, as though it were a puzzle, and the building held its breath.',
            'They stood nose to nose and nobody breathed. Then {villain} reached into a pocket, took out a small crumpled napkin and handed it to {hero}. It said GOOD LUCK. The crowd lost its mind.',
          ],
          headline: ['{hero} OFFERS A HAND; {villain} STARES', 'A NAPKIN SAYS "GOOD LUCK"'],
        },
        {
          key: 'thank_you_cards', kind: 'town', purpose: 'town', roles: ['villain'], optional: true,
          place: 'the elementary school',
          title: 'Thank-you cards',
          text: [
            'A fourth-grade class drew thank-you cards for {villain} and slid them under the Sportatorium door: crayon suns, crayon hearts, one crayon sandwich. Pip drew the sandwich. The card was addressed "To the Nice One."',
            'A long line of kids with drawings formed outside the Sportatorium back door. {villain} accepted each card with a solemn nod and tucked every one into a pocket. By the end the pocket was a stack.',
          ],
          headline: ['KIDS MAIL THANK-YOU CARDS TO {villain}', 'A CRAYON SANDWICH FOR "THE NICE ONE"'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{villain.real} confessed the hardest part was keeping a straight face at the concession stand. "That kid was so small, and so sure of me." {hero.real} said that was exactly why it worked.',
            'Birdie asked if the smile had been in the plan. {villain.real} said no, it had slipped out. "I think I\'m in trouble with the villain union." June, setting down a pie, said she could vouch.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'underdog_wins', label: 'The underdog wins, and the monster smiles', winner: 'hero', weight: 0.4,
        text: [
          '{hero} won it, and {villain} was the first to extend a hand. The whole building held its breath as it was taken. Then {villain} smiled, a very small, very real smile, and the crowd stood.',
          'The three count rang out. {villain} looked at {hero} for a long time, nodded once, and bowed. The VFW applauded for a long time, partly for {hero}, mostly for the nod.',
        ],
        epilogue: [
          '{hero.real} said the smile was worth the match. {villain.real} said it had been an accident. June said it was the best accident the booth had ever seen.',
          'Birdie wrote SOFT SIDE on a napkin and drew a heart beside it. "Careful," she said. "Don\'t tell anyone I did that."',
        ],
        headline: ['{hero} WINS; {villain} SMILES', 'A SMALL, REAL SMILE AT THE VFW'],
      },
      {
        id: 'monster_wins_gently', label: 'The monster wins, and bows', winner: 'villain', weight: 0.3,
        text: [
          '{villain} won, then did something nobody in the building had ever seen: bowed to {hero}, deeply, and offered a hand up. {hero} took it. The room held very still, then roared.',
          '{villain} took the win and gave back the ovation, pointing at {hero} and then at the crowd. The monster, it turns out, knows how to share.',
        ],
        epilogue: [
          '{villain.real} told the booth it was just manners. {hero.real} said manners looked very good on {villain.real}. June served a milkshake with extra whipped cream and no comment.',
          'Birdie wrote TURN? on a napkin and underlined it. "Let the crowd decide," she said.',
        ],
        headline: ['{villain} WINS, THEN BOWS TO {hero}', 'THE MONSTER SHARES THE OVATION'],
      },
      {
        id: 'heart_revealed', label: 'The heart is out, and the crowd turns', winner: 'hero', weight: 0.3,
        turn: { who: 'villain', to: 'hero' },
        text: [
          'After the bell {villain} lifted {hero}\'s arm and then, with a small shy motion, took off a glove and shook {hero}\'s hand. The crowd, which had spent a month keeping its distance, began to cheer, and could not stop.',
          '{villain} walked out of the ring to a standing ovation, wiped one eye with the back of a glove, and said, to nobody in particular, "I like you all." Then {villain} left quickly, before it could get worse.',
        ],
        epilogue: [
          '{villain.real} said the crowd turning was the best thing and the worst thing at once. "I have a reputation." {hero.real} said it was safe, the Tattler would never print the truth.',
          'Birdie put the napkin in her pocket. "Let them love you, sugar. It\'s not as scary as it looks."',
        ],
        headline: ['THE MONSTER HAS A HEART; CROWD TURNS', '{villain}: "I LIKE YOU ALL"'],
      },
    ],
    gusWords: ['Soft Side', 'Monster', 'Tender', 'Smile', 'Gentle', 'Lost and Found', 'Heart of Gold', 'Hidden Heart'],
    wants: [
      'I want everybody to keep a respectful distance, right up until they don\'t.',
      'I want to be the monster everybody secretly loves.',
      'I want a story that ends with me being really, really nice.',
    ],
    background: true,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.26 The Rookie's First Win
  {
    id: 'rookie_first_win',
    name: 'The Rookie\'s First Win',
    register: 'pure triumph',
    blurb: 'A rookie keeps losing, the town keeps counting, and one Wednesday the confetti finally flies.',
    tags: ['spotlight', 'heartfelt', 'comedy', 'clean_finish'],
    roles: [
      { key: 'hero', label: 'The Rookie', align: 'hero', player: true },
      { key: 'villain', label: 'The Veteran', align: 'any' },
    ],
    length: [2, 3, 4],
    cards: {
      hook: ['HK-02', 'HK-03'],
      twist: ['TW-05', 'TW-02'],
      stakes: ['ST-02', 'ST-12'],
      payoff: ['PO-01', 'PO-12'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'another_loss', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 1,
          title: '{hero} in action',
          text: [
            '{hero} lost again, bravely, in the opener, and waved at the crowd as though it had been a victory lap. The W column on the Hot Tag whiteboard stayed empty. The L column ran out of room.',
            '{hero} gave everything, got up three times and lost with a small, graceful bow. The crowd cheered the effort and then, just a little, the bow.',
          ],
          headline: ['{hero} LOSES AGAIN, WAVES ANYWAY', 'ANOTHER LOSS; THE W COLUMN STAYS EMPTY'],
        },
        {
          key: 'record_board', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the Hot Tag Diner',
          title: 'The record board',
          text: [
            'June updated {hero}\'s record on the whiteboard behind the Hot Tag register, this time with a tiny heart in the empty W column, just in case. Customers have started touching it for luck.',
            'The record board at the Hot Tag now includes a column for "moral victories." {hero} leads it by a wide margin. Clementine put it in the Tattler under the headline NOT A LOSS, REALLY.',
          ],
          headline: ['JUNE ADDS A TINY HEART TO THE W COLUMN', 'NEW COLUMN ON THE BOARD: MORAL VICTORIES'],
        },
      ],
      [
        {
          key: 'veteran_taunts', kind: 'promo', purpose: 'heat', roles: ['villain', 'hero'],
          title: 'In-ring address: {villain}',
          text: [
            '{villain} told the crowd, "I\'ve won so many matches I forgot one of them. Good luck, kid." Then {villain} gave {hero} a very small, very sincere thumbs-up that the cameras were not meant to catch.',
            '{villain} offered {hero} a head start of one full minute in Saturday\'s match. "You\'ll need it," said {villain}. Then, a little quieter: "I\'d take it."',
          ],
          headline: ['{villain} OFFERS {hero} A ONE-MINUTE HEAD START', '"I\'D TAKE IT," SAYS {villain}'],
        },
        {
          key: 'near_miss', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['@any']], winner: 1,
          title: '{hero} in action',
          text: [
            '{hero} kicked out at two and nine-tenths, then almost pulled off a roll-up, and lost by a hair. The crowd groaned like one person.',
            'So close: {hero} hit the best move of the night and the opponent kicked out at two. The next move was a mistake, and the pin was quick. {hero} sat up afterward and said, "Next time."',
          ],
          headline: ['{hero} LOSES BY A HAIR: "NEXT TIME"', 'TWO AND NINE-TENTHS: SO CLOSE'],
        },
        {
          key: 'todays_the_day', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'Main Street',
          title: '"Today\'s the day"',
          text: [
            'Pip\'s sign appeared on every lamppost on Main Street: TODAY\'S THE DAY. Agnes Pickett wrote "I\'ve been saying that for weeks" underneath, in pen, and signed it.',
            'Main Street rallied: Lorraine put a pie on the feed store counter marked FOR THE WIN, Steel Chair Hardware gave away free bandanas and Coach Patty ran a small clinic on roll-ups on the sidewalk, in her whistle voice.',
          ],
          headline: ['"TODAY\'S THE DAY": PIP\'S SIGN ON EVERY LAMPPOST', 'MAIN STREET RALLIES BEHIND {hero}'],
        },
        {
          key: 'fan_club', kind: 'angle', purpose: 'tease', roles: ['hero'],
          title: 'Ringside: the fan club',
          text: [
            'The Rookie Fan Club marched down the aisle with signs, a kazoo and a banner: {hero} IS A WINNER IN OUR HEARTS. Agnes Pickett, club president, led the chant and dared anyone to boo.',
            'Agnes Pickett took a seat in the front row with a knitting bag and a look of grim determination. She finished one sleeve during the entrance and one sock during the match, and never stopped cheering.',
          ],
          headline: ['AGNES PICKETT LEADS THE {hero} FAN CLUB', 'A SIGN IN THE FRONT ROW: "WINNER IN OUR HEARTS"'],
        },
      ],
      [
        {
          key: 'napkin_challenge', kind: 'contract', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'Contract signing: {hero} & {villain}',
          text: [
            '{villain} slid a paper napkin across the table with the match terms written on it. {hero} signed it with a borrowed pen, and Gus announced it was the most binding napkin in history.',
            'They signed in front of a hand-drawn W on the wall. {villain} said, "May the better one win." {hero} said, "I will." It came out smaller than {hero} had planned, and louder than anyone expected.',
          ],
          headline: ['THE MOST BINDING NAPKIN IN HISTORY', '"I WILL," SAYS {hero}'],
        },
        {
          key: 'mystery_box', kind: 'town', purpose: 'town', roles: ['hero'], optional: true,
          place: 'Main Street',
          title: 'The mystery box',
          text: [
            'Hank Szabo was seen carrying a very large box marked DO NOT OPEN (YET) into the Sportatorium. Pip stood outside and guarded it from a safe distance for six hours.',
            'Marigold finished a sash in the window: A WINNER, in gold thread, with a ribbon. She said it was "just in case," and put a second sash beside it that said TRY AGAIN, "also just in case."',
          ],
          headline: ['A BOX MARKED "DO NOT OPEN (YET)"', 'TWO SASHES IN THE WINDOW, JUST IN CASE'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{hero.real} said being the lovable loser for a month was oddly wonderful. {villain.real} said being the gruff veteran was the hard part, because it meant being gruff to somebody so nice.',
            'Birdie reviewed the whiteboard behind the register. "Whatever the number is now," she said, "I\'m proud of every column." June handed {hero.real} a milkshake with a tiny paper flag in it.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'clean_win', label: 'A clean first win', winner: 'hero', weight: 0.45,
        text: [
          '{hero} won clean, in the middle of the ring, with one move and one count and no help. For a moment nobody in the VFW moved. Then confetti fell from the rafters, on a Wednesday, which Birdie allowed "just this once."',
          'The three count rang out, and {hero} stood very still, not quite believing it. Then Mo raised {hero}\'s arm, and the roar was so loud the confetti cannon went off early, on a Wednesday.',
        ],
        epilogue: [
          '{hero.real} put a gold star in the W column with a very steady hand. June wrote the date underneath. Birdie said confetti on a Wednesday was a once-in-a-lifetime thing, and not to expect it twice.',
          '{villain.real} paid for the milkshakes and asked to be remembered as the one who lost to the best rookie in town. "Write that down."',
        ],
        headline: ['THE W COLUMN IS NO LONGER EMPTY', '{hero} GETS THE FIRST WIN; CONFETTI ON A WEDNESDAY'],
      },
      {
        id: 'roll_up', label: 'A roll-up for the books', winner: 'hero', weight: 0.4,
        text: [
          '{hero} caught {villain} in a roll-up so quick that even the referee had to check twice, and then Mo\'s hand came down for the three. The VFW exploded, and so did Gus.',
          'It was a small roll-up and a very large win. {hero} sat up, looked at the crowd, and put both hands on {hero.their} head in complete disbelief. Agnes Pickett cried into her knitting.',
        ],
        epilogue: [
          '{villain.real} swore the roll-up was a mistake. "I let it happen." {hero.real} said that was exactly what a veteran is supposed to say. June wrote WIN in the W column with the thickest marker.',
          'Birdie let the confetti fall for a full minute. "Nobody tell the Wednesday," she said.',
        ],
        headline: ['{hero} WINS BY ROLL-UP; VFW ERUPTS', 'THE FIRST WIN IS OFFICIALLY IN THE BOOKS'],
      },
      {
        id: 'one_more_week', label: 'So close, one more week', winner: 'villain', weight: 0.15,
        text: [
          '{villain} won a hard one, then put an arm around {hero} and told the crowd it was, in the veteran\'s honest opinion, the best loss the building had seen.',
          '{hero} lost by a hair again, and the building gave a standing ovation anyway, with Pip leading the chant.',
        ],
        epilogue: [
          '{hero.real} said losing felt different now, "like the win is already on its way." {villain.real} said that was how it always felt, right before it arrived.',
          'June wrote SOON in the W column in pencil and held up the eraser, just in case.',
        ],
        headline: ['{villain} WINS; THE CROWD KEEPS {hero} ON ITS FEET', 'A BRAVE LOSS EARNS AN OVATION'],
      },
    ],
    gusWords: ['First Win', 'Oh-and-Plenty', 'Rookie', 'Today\'s the Day', 'W Column', 'Long Time Coming', 'Underdog', 'Confetti'],
    wants: [
      'I want to get my first win and have the whole town lose its mind.',
      'I want to be the veteran who lets a rookie find out how good they are.',
      'I want confetti on a Wednesday.',
    ],
    background: false,
    playerRoles: ['hero'],
  },

  // ------------------------------------------------------------ 5.27 The Legacy
  {
    id: 'legacy',
    name: 'The Legacy',
    register: 'generational and moving',
    blurb: 'A family heirloom goes missing, a challenger claims the name, and an heir learns what it weighs.',
    tags: ['legacy', 'family', 'heartfelt', 'old_school'],
    roles: [
      { key: 'hero', label: 'The Heir', align: 'hero', player: true },
      { key: 'villain', label: 'The Challenger', align: 'villain', player: true },
      { key: 'holder', label: 'The Legacy Holder', align: 'hero' },
    ],
    length: [5, 6, 8],
    cards: {
      hook: ['HK-16', 'HK-07'],
      twist: ['TW-16', 'TW-15', 'TW-04'],
      stakes: ['ST-11', 'ST-04'],
      payoff: ['PO-03', 'PO-24', 'PO-01'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'heirloom_displayed', kind: 'angle', purpose: 'establish', roles: ['holder', 'hero'],
          title: 'In the lobby: {holder} & {hero}',
          text: [
            '{holder} unveiled the family heirloom in a glass case in the Sportatorium lobby and told its story to a hushed crowd, while {hero} stood nearby, listening as though hearing it for the first time.',
            '{holder} lifted the heirloom from its velvet cushion, turned it in the light and set it gently back in the case. "Everything we are is in here," said {holder}. {hero} looked at it for a long time.',
          ],
          headline: ['THE FAMILY HEIRLOOM GOES ON DISPLAY', '"EVERYTHING WE ARE IS IN HERE," SAYS {holder}'],
        },
        {
          key: 'empty_case', kind: 'town', purpose: 'town', roles: ['holder', 'hero'],
          place: 'the Sportatorium lobby',
          title: 'The empty case',
          text: [
            'By Saturday morning the glass case in the lobby was empty. Agnes Pickett laid a handkerchief on the velvet where the heirloom had been and stood guard until Sheriff Bev arrived, and then stood guard some more.',
            'The lobby filled with townspeople staring at the empty case. Sheriff Bev dusted it for prints and found only a faint smudge in the shape of a very determined thumb.',
          ],
          headline: ['THE HEIRLOOM VANISHES FROM ITS CASE', 'AGNES GUARDS AN EMPTY CASE'],
        },
      ],
      [
        {
          key: 'challenger_claims', kind: 'promo', purpose: 'heat', roles: ['villain'],
          title: 'In-ring address: {villain}',
          text: [
            '{villain} stood in the center of the ring, held up a velvet cushion, and declared that the legacy was "up for grabs." Nobody was sure whether {villain} had the heirloom. Everybody was sure {villain} wanted it.',
            '"Legacy is not inherited," said {villain}. "It\'s taken." Agnes Pickett, in row three, said very loudly that it was not, and that {villain} could stop cradling that velvet cushion.',
          ],
          headline: ['{villain} CLAIMS THE LEGACY IS "UP FOR GRABS"', '"LEGACY IS NOT INHERITED," SAYS {villain}'],
        },
        {
          key: 'family_stories', kind: 'town', purpose: 'town', roles: ['holder', 'hero'],
          place: 'the Hot Tag Diner',
          title: 'Family stories at the counter',
          text: [
            'Old-timers swapped stories at the Hot Tag counter about {holder}\'s family: who won what, who wore the heirloom, and who once left it in a snowbank and found it in spring. The diner listened like a congregation.',
            'Somebody brought a box of old photographs to the diner, {holder}\'s family at every stage of the legacy. {hero} turned each one over to find a date and a name. June refilled the coffee, quietly, until midnight.',
          ],
          headline: ['OLD-TIMERS SWAP FAMILY STORIES AT THE HOT TAG', 'A BOX OF OLD PHOTOGRAPHS, A NAME ON EVERY BACK'],
        },
        {
          key: 'heir_trains', kind: 'angle', purpose: 'segment', roles: ['hero', 'holder'],
          title: 'Training: {hero} & {holder}',
          text: [
            '{holder} walked {hero} through the family move in the empty ring, one step at a time, hand over hand, the way it had been taught to {holder}. The camcorder let the tape run all night.',
            '{hero} fell three times trying the move and got up four. {holder} said nothing. The fifth time {hero} landed it clean, and {holder} wiped one eye and pretended to adjust the lights.',
          ],
          headline: ['{holder} TEACHES {hero} THE FAMILY MOVE', 'THE FIFTH TIME IS THE CHARM'],
        },
        {
          key: 'heir_loses', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['villain']], winner: 1,
          title: '{hero} vs. {villain}',
          text: [
            '{villain} won with a move that looked an awful lot like the family\'s own, done a little wrong and a little proud. {hero} lay on the mat and stared at the rafters, where the family banners hung.',
            '{hero} fought for the family name with everything and fell short by one count. The crowd stood, because it was the name they had come to see, and because the fight had been worthy of it.',
          ],
          headline: ['{villain} WINS THE FIRST ROUND OF THE LEGACY', '{hero} FALLS BY ONE COUNT'],
        },
      ],
      [
        {
          key: 'blessing', kind: 'promo', purpose: 'gohome', roles: ['holder', 'hero'],
          title: 'In the ring: {holder} & {hero}',
          text: [
            '{holder} took the microphone and spoke for exactly one minute about what the name meant. Then {holder} handed {hero} a small, old, worn piece of cloth from the heirloom\'s case and said, "It was always yours."',
            '{holder} held {hero}\'s hand up in front of the crowd and said, "The name is not what we were. It is what we do next." The building stood and applauded for a very long time.',
          ],
          headline: ['{holder} GIVES {hero} A BLESSING', '"THE NAME IS WHAT WE DO NEXT"'],
        },
        {
          key: 'family_banner', kind: 'town', purpose: 'town', roles: ['hero'], optional: true,
          place: 'Main Street',
          title: 'The family banner',
          text: [
            'Marigold stitched the family name onto a banner for her window, one letter per generation, each in a different thread. She said the last letter was still blank, "for the next one."',
            'The elementary school drew a family tree with every wrestler who ever wore the name. It stopped at {hero}, with a large empty branch beside it. Somebody had drawn a very small, very hopeful bird on it.',
          ],
          headline: ['A BANNER WITH THE FAMILY NAME GOES UP', 'A FAMILY TREE WITH ROOM TO GROW'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'holder', 'villain'],
          title: 'The back booth',
          text: [
            '{holder.real} admitted the heirloom had been in a coat closet the whole time. "I wanted you to feel the weight of looking for it." {hero.real} said it was the lightest thing {hero.real} had ever carried.',
            '{villain.real} returned the velvet cushion with a nervous cough. "It was a prop." Birdie said every great legacy has a Challenger, and every Challenger needs a cushion.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'passed_down', label: 'The legacy is passed down', winner: 'hero', weight: 0.6,
        text: [
          '{hero} won it for the family name, and {holder} stepped into the ring and placed the heirloom in {hero}\'s hands, whole, polished and exactly as it had always been. The building stood in silence, then did the opposite.',
          'The three count rang out, and {holder} came through the ropes with a worn old piece of the family\'s past and put it on {hero}. It fit as if it had been waiting.',
        ],
        epilogue: [
          '{hero.real} wore the heirloom into the booth and sat very straight. "Heavy," said {hero.real}. "Good heavy," said {holder.real}. Birdie wrote PASSED DOWN on a napkin and slid it into the family album.',
          '{villain.real} shook {hero.real}\'s hand across the booth. "Best challenge I ever made." June said every legacy needs one.',
        ],
        headline: ['THE LEGACY IS PASSED DOWN', '{hero} WINS IT FOR THE FAMILY NAME'],
      },
      {
        id: 'challenger_wins', label: 'The challenger wins, with respect', winner: 'villain', weight: 0.25,
        text: [
          '{villain} won it, held the heirloom up for one second, and then, to everyone\'s surprise, handed it back to {holder}, whole and polished, with a bow. "It was only ever on loan," said {villain}.',
          '{villain} took the win and gave the legacy back before the bell finished ringing. The crowd, which had booed all month, did not know what to do with its hands and applauded.',
        ],
        epilogue: [
          '{villain.real} said the legacy was too heavy to keep and too beautiful to drop. {holder.real} said that was the right answer in the wrong order.',
          '{hero.real} promised to win it back next year. Birdie wrote REMATCH on the last page of the family album.',
        ],
        headline: ['{villain} WINS, THEN RETURNS THE HEIRLOOM', 'THE CHALLENGER BOWS: "ONLY ON LOAN"'],
      },
      {
        id: 'shared_legacy', label: 'The legacy is shared', winner: 'hero', weight: 0.15,
        turn: { who: 'villain', to: 'hero' },
        text: [
          '{hero} won, and {holder} offered the heirloom to {hero} and then, quietly, a second piece of it to {villain}. The building did not know what it was seeing until the applause began.',
          'After the bell {hero} held out a hand to {villain}, and {holder} placed the heirloom in both of theirs. "It belongs to the one who carries it," said {holder}. "It is a heavy thing. Share it."',
        ],
        epilogue: [
          '{hero.real} and {villain.real} carried the heirloom into the booth together, one on each side, like a very large cake. June said she had never seen such a thing.',
          'Birdie wrote FAMILY on a napkin. "Some legacies have room."',
        ],
        headline: ['THE LEGACY IS SHARED; A RIVAL JOINS THE NAME', '{hero} AND {villain} CARRY THE HEIRLOOM TOGETHER'],
      },
    ],
    gusWords: ['Legacy', 'Heirloom', 'Family Name', 'Inheritance', 'Torch', 'Heritage', 'Hand-Me-Down', 'Lineage'],
    wants: [
      'I want to carry my family\'s name somewhere new.',
      'I want to hand down something that matters.',
      'I want someone to challenge what\'s ours, so I can show them what it means.',
    ],
    background: false,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.28 The Wedding
  {
    id: 'wedding',
    name: 'The Wedding',
    register: 'joy',
    blurb: 'A proposal in the ring, a tower of tiny cakes, and a comic objection to the peonies that turns out to be a gift.',
    tags: ['romance', 'heartfelt', 'whimsy', 'spectacle'],
    roles: [
      { key: 'hero', label: 'Partner One', align: 'hero', player: true },
      { key: 'partner', label: 'Partner Two', align: 'hero', player: true },
      { key: 'villain', label: 'The Objector', align: 'villain', player: true },
      { key: 'officiant', label: 'The Officiant', align: 'any' },
    ],
    length: [3, 4, 5],
    cards: {
      hook: ['HK-09'],
      twist: ['TW-02', 'TW-03'],
      stakes: ['ST-02'],
      payoff: ['PO-02'],
    },
    twistAt: 'finish',
    needs: ['romance'],
    acts: [
      [
        {
          key: 'engaged_win', kind: 'match', purpose: 'establish',
          sides: [['hero', 'partner'], ['@any', '@any']], winner: 0,
          title: 'Tag match: {hero} & {partner} in action',
          text: [
            '{hero} and {partner} won their first match as a newly engaged team and spent the post-match pose staring at each other instead of the crowd. Mo had to remind them the bell had rung.',
            'The team won in six minutes and celebrated for ten. {hero} held up a left hand, {partner} held up a left hand, and the crowd screamed so loudly nobody could say who was proposing to whom.',
          ],
          headline: ['{hero} AND {partner} WIN, ENGAGED', 'THE ENGAGED TEAM CAN\'T STOP SMILING'],
        },
        {
          key: 'town_goes_wild', kind: 'town', purpose: 'town', roles: ['hero', 'partner'],
          place: 'Main Street',
          title: 'Main Street goes wild',
          text: [
            'Main Street honked in a long, unbroken line when the news spread. Pip taped a sign to the bus stop: IT\'S ABOUT TIME. The bus driver read it aloud to nobody and then honked, too.',
            'Agnes Pickett cried openly at the post office and then pretended she had a cold. Gertrude sent over a bag of butterscotch with a note: FOR THE HONEYMOON, OR WHENEVER.',
          ],
          headline: ['MAIN STREET HONKS FOR THE ENGAGED COUPLE', 'PIP\'S SIGN: "IT\'S ABOUT TIME"'],
        },
      ],
      [
        {
          key: 'marigold_sews', kind: 'town', purpose: 'town', roles: ['hero', 'partner'],
          place: 'Marigold\'s shop',
          title: 'Marigold sews the wedding gear',
          text: [
            'Marigold sewed matching wedding gear for the ring, two outfits that were different in every way and somehow perfectly the same. She pinned a note to each: FOR THE BIG DAY. LAUNDER GENTLY.',
            'A line formed outside Marigold\'s shop to watch her stitch the veil and the sash. She charged no admission. Sheriff Bev held the door and, at one point, a spool.',
          ],
          headline: ['MARIGOLD SEWS THE WEDDING GEAR', 'A LINE FORMS TO WATCH THE VEIL BEING STITCHED'],
        },
        {
          key: 'cake_tower', kind: 'town', purpose: 'town', roles: ['hero', 'partner'],
          place: 'Tallbridge Bakery',
          title: 'The tower of tiny cakes',
          text: [
            'The bakery began building a tower of tiny cakes, one for every person who had ever cheered at the VFW. By Thursday it reached the ceiling, and Mayor Oakes was asked to hold the ladder.',
            'Coach Patty timed the cake tower\'s construction with a stopwatch and found the pace "acceptable, even beautiful." She was asked to stop timing the cakes. She did not.',
          ],
          headline: ['THE BAKERY BUILDS A TOWER OF TINY CAKES', 'THE CAKE TOWER REACHES THE CEILING'],
        },
        {
          key: 'floral_objection', kind: 'angle', purpose: 'heat', roles: ['villain', 'hero'],
          title: 'Ringside: {villain}',
          text: [
            '{villain} marched down the aisle with a clipboard and filed a formal objection, in writing, to the floral arrangements. "Too many peonies," said {villain}. A moment later, undecided: "Not enough peonies."',
            '{villain} stood at ringside and objected, loudly and in full sentences, to the color scheme, the seating chart and the music. "Everything is perfect," {villain} added, "and I object to it."',
          ],
          headline: ['{villain} OBJECTS TO THE FLOWERS', '"TOO MANY PEONIES," SAYS {villain}'],
        },
        {
          key: 'rehearsal', kind: 'angle', purpose: 'tease', roles: ['officiant', 'hero', 'partner'],
          title: 'Rehearsal: {officiant}',
          text: [
            '{officiant} rehearsed the ceremony from a stack of index cards, got every name right and cried at the word "love." {hero} and {partner} passed tissues, then stood very still and held hands.',
            '{officiant} practiced "You may now kiss" four times in the empty ring and then, very quietly, tried the other one: "You may now high-five." {hero} and {partner} laughed so hard they had to sit down.',
          ],
          headline: ['{officiant} REHEARSES THE CEREMONY', '"YOU MAY NOW HIGH-FIVE"'],
        },
      ],
      [
        {
          key: 'ceremony', kind: 'angle', purpose: 'gohome', roles: ['hero', 'partner', 'officiant', 'villain'],
          title: 'The wedding in the ring',
          text: [
            '{officiant} stood center ring in a flower crown as {hero} and {partner} stepped under an arch of paper peonies. The whole VFW went silent. A small voice in row four whispered, "Is this real?" "Yes," said her grandmother.',
            '{officiant} asked if anyone objected. {villain} rose, cleared {villain.their} throat and said, "Only to how beautiful this is." Then {villain} sat down, and the whole building cried and cheered.',
          ],
          headline: ['THE WEDDING IN THE RING', '"ONLY TO HOW BEAUTIFUL THIS IS"'],
        },
        {
          key: 'courthouse_polish', kind: 'town', purpose: 'town', roles: ['hero', 'partner'], optional: true,
          place: 'the courthouse steps',
          title: 'The steps get polished',
          text: [
            'Mayor Oakes polished the courthouse steps for photos and told every pigeon to leave, politely, by name. By noon the pigeons had returned. By two they were in the photos.',
            'Agnes Pickett wore her largest hat to the rehearsal and informed the whole street that it was "a hat with a purpose." Nobody asked what purpose. Everybody applauded the hat.',
          ],
          headline: ['MAYOR OAKES POLISHES THE STEPS FOR PHOTOS', 'AGNES PICKETT WEARS A HAT "WITH A PURPOSE"'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'partner', 'villain'],
          title: 'The back booth',
          text: [
            '{hero.real} and {partner.real} sat in the booth in matching wedding gear, sharing one slice of cake with two forks. "Best day ever," said {hero.real}. "Best day so far," said {partner.real}.',
            '{villain.real} presented a gift-wrapped box and admitted the peony thing had been very nearly sincere. "I had to object to something. It\'s how I show love." Birdie set the box on the table with great ceremony.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'newlyweds_win', label: 'The newlyweds win', winner: 'hero', weight: 0.6,
        text: [
          '{hero} and {partner} won the celebration match and then danced across the ring while the whole VFW sang, off-key and with feeling. {villain} presented a gift: two peonies as big as championship belts, made of papier-mache.',
          'The celebration match ended with the happy couple on top, and {villain} stepped up with a gift: a small, perfect peony vase engraved TO YOUR NEXT CHAPTER. The whole building cried, and then cheered.',
        ],
        epilogue: [
          '{hero.real} and {partner.real} announced a new tag team name before the cake was cut: a very long one, with a hyphen. Birdie said she would make room on the wall.',
          '{villain.real} admitted the objection to the flowers had been the best part of the whole month. "Objection withdrawn," said {villain.real}. "With hugs."',
        ],
        headline: ['NEWLYWEDS WIN; THE OBJECTOR BRINGS A GIFT', 'A WEDDING, A WIN AND A PEONY VASE'],
      },
      {
        id: 'objector_wins_hugs', label: 'The objector wins, and hugs everyone', winner: 'villain', weight: 0.25,
        text: [
          '{villain} won the celebration match by a hair, and the first one to hug {villain} was {hero}. {partner} brought the cake. The building cheered as though everyone had won, which, officially, they had.',
          '{villain} took the pin, and when the bell rang the newlyweds lifted {villain}\'s arms together in the center of the ring, and the VFW cheered the objection, and the gift, and the day.',
        ],
        epilogue: [
          '{villain.real} said winning at someone else\'s wedding was a privilege. {partner.real} said the privilege was cake. June served it on three plates.',
          '{hero.real} said the match was almost as good as the wedding. {partner.real} said "Almost."',
        ],
        headline: ['{villain} WINS THE CELEBRATION; HUGS ALL AROUND', 'THE OBJECTION BECOMES A GIFT'],
      },
      {
        id: 'first_dance', label: 'The match becomes a first dance', winner: null, weight: 0.15,
        text: [
          'The celebration match turned into a dance halfway through, when the music changed and nobody could remember who was supposed to be fighting. Mo raised both arms and declared a draw to music.',
          'The match dissolved into a first dance, with the whole roster joining in a very large, very awkward circle. Gus called it "the longest tag match in history, and the best."',
        ],
        epilogue: [
          '{hero.real} and {partner.real} danced until the music stopped and then danced some more. Birdie put the whole night on a napkin and then, very quietly, in a frame.',
          '{villain.real} danced with Birdie, which nobody had ever seen. Both denied it.',
        ],
        headline: ['THE CELEBRATION MATCH BECOMES A FIRST DANCE', 'MO DECLARES A DRAW TO MUSIC'],
      },
    ],
    gusWords: ['Wedding', 'Vows', 'I Do', 'Happily Ever After', 'Bouquet', 'Peonies', 'Cake Tower', 'Objection'],
    wants: [
      'I want to get married in the ring.',
      'I want the whole town in the front row, and a comic objection to the flowers.',
      'I want to be the objector who ends up giving the best gift.',
    ],
    background: false,
    playerRoles: ['hero', 'partner', 'villain'],
  },

  // ------------------------------------------------------------ 5.29 The Cryptid Hunt
  {
    id: 'cryptid_hunt',
    name: 'The Cryptid Hunt',
    register: 'whimsical mystery',
    blurb: 'A hunter vows to catch the Mothman, the town turns out for night stakeouts, and the only thing found is a very small dusty wing scale.',
    tags: ['mystery', 'supernatural', 'night', 'whimsy'],
    roles: [
      { key: 'hero', label: 'The Hunter', align: 'hero', player: true },
      { key: 'villain', label: 'The Mothman', align: 'any', masked: true },
      { key: 'skeptic', label: 'The Skeptic', align: 'any', optional: true },
    ],
    length: [3, 4, 5],
    cards: {
      hook: ['HK-17', 'HK-14'],
      twist: ['TW-12'],
      stakes: ['ST-02', 'ST-09'],
      payoff: ['PO-13'],
    },
    twistAt: 'end_act2',
    needs: ['mothman', 'night'],
    acts: [
      [
        {
          key: 'confident_win', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            '{hero} won the opener and used the post-match interview to announce that the Mothman would be caught, and, if possible, thanked. Somewhere in the rafters a very large shadow shifted.',
            '"I\'m going to find out who that is," {hero} told the cameras. A moth landed on the microphone. {hero} stared at it for a long moment, then very politely moved it to the ropes.',
          ],
          headline: ['{hero} VOWS TO CATCH THE MOTHMAN', 'A MOTH ON THE MICROPHONE'],
        },
        {
          key: 'fenwick_corner', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the flea market',
          title: 'Fenwick offers a prophecy',
          text: [
            'Fenwick set up a card table at the flea market with a map of the water tower, nine pins, a very thorough diagram of moth flight patterns and a sign: PROPHECY, FREE. Nobody left with an answer. Everybody left with a pin.',
            'Fenwick handed {hero} a pair of binoculars, a thermos and a small paper bag marked FOR EMERGENCIES. {hero} opened the bag. It contained one moth-shaped cookie. "In case it gets cold," said Fenwick.',
          ],
          headline: ['FENWICK OFFERS PROPHECY AT THE FLEA MARKET', 'A MOTH-SHAPED COOKIE FOR EMERGENCIES'],
        },
      ],
      [
        {
          key: 'water_tower_stakeout', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the water tower',
          title: 'The water tower stakeout',
          text: [
            'At dusk {hero} took up a post at the base of the water tower with a thermos and a flashlight. Mayor Oakes brought folding chairs and popcorn for the town, "so the stakeout has an audience." By ten the field was full.',
            'The stakeout drew half the town to the water tower field. Sheriff Bev\'s basset hound stared at the sky with great concentration, and every time something flapped, four hundred people said "Shh."',
          ],
          headline: ['TOWN TURNS OUT FOR {hero}\'S STAKEOUT', 'FOUR HUNDRED PEOPLE SAY "SHH" TO A MOTH'],
        },
        {
          key: 'sighting', kind: 'run-in', purpose: 'segment', roles: ['villain', 'hero'],
          title: 'Run-in: {villain}',
          text: [
            'The lights dipped and a masked shape appeared on the apron, silent and still. {villain} tilted {villain.their} head at {hero}, the way a curious bird might, and was gone before the lights came back.',
            '{villain} stood at the top of the aisle for exactly ten seconds, wings folded, and watched the ring. {hero} stood very still. When the lights came up, a single wing-shaped shadow lingered on the wall, and then did not.',
          ],
          headline: ['THE MOTHMAN APPEARS ON THE APRON', 'TEN SECONDS AT THE TOP OF THE AISLE'],
        },
        {
          key: 'spooked_match', kind: 'match', purpose: 'heat',
          sides: [['hero'], ['@any']], winner: 1,
          title: '{hero} in action',
          text: [
            '{hero} had the match won when a shadow with wings crossed the ring lights. {hero} looked up, the opponent rolled {hero} up, and the pin was over before the shadow was.',
            '{hero} kept glancing at the rafters, expecting wings, and missed a cover that should not have been missed. Afterward {hero} told Gus on the air that the Mothman had "a very unfair sense of timing."',
          ],
          headline: ['{hero} DISTRACTED BY A SHADOW, LOSES', '"A VERY UNFAIR SENSE OF TIMING"'],
        },
        {
          key: 'skeptic_scoffs', kind: 'interview', purpose: 'segment', roles: ['skeptic', 'hero'], optional: true,
          title: 'Sit-down interview: {skeptic} & {hero}',
          text: [
            '{skeptic} told Gus on camera that the Mothman was a kite, a tarp and a very good imagination. "I can explain every bit of this," said {skeptic}. Something flapped outside, and {skeptic} did not finish the sentence.',
            '{skeptic} sat down with {hero} and a clipboard to review the sightings. After forty minutes {skeptic} had run out of explanations and begun, quietly, to sketch a wing.',
          ],
          headline: ['{skeptic}: "IT\'S A KITE"', '{skeptic} RUNS OUT OF EXPLANATIONS'],
        },
      ],
      [
        {
          key: 'trap_set', kind: 'angle', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'The trap: {hero}',
          text: [
            '{hero} rigged a spotlight and a net above the ring and waited. The lights went out, the net fell on nothing, and a folded note appeared on the top turnbuckle: a drawing of the ring, a moon and a tiny, polite wave.',
            '{hero} left a trap at center ring: a plate of cookies, a flashlight and a very large bucket. At dawn the bucket was undisturbed, the cookies were gone, and the flashlight was pointing at the moon.',
          ],
          headline: ['THE TRAP IS SPRUNG; THE MOTHMAN LEAVES A NOTE', 'COOKIES GONE; THE BUCKET IS UNDISTURBED'],
        },
        {
          key: 'diner_special', kind: 'town', purpose: 'town', roles: ['hero'], optional: true,
          place: 'the Hot Tag Diner',
          title: 'The Mothman Special',
          text: [
            'June added a Mothman Special to the board, a moth-shaped pancake with a very small cup of syrup and a warning: DO NOT STARE AT THE LIGHTS. Fenwick refused to say whether the shape was accurate.',
            'The Tattler\'s fishing column mentioned, in passing, a very large moth on the pier at dusk. "Biggest I ever saw," said the angler, "and the quietest." The Hot Tag stopped talking for a very long minute.',
          ],
          headline: ['HOT TAG ADDS THE MOTHMAN SPECIAL', 'A VERY QUIET MOTH ON THE PIER'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero'],
          title: 'The back booth',
          text: [
            '{hero.real} sat down in the booth with a tired grin and a very large thermos. "I think I\'m getting closer." Birdie slid over a napkin with a tiny drawing of a moth on it. Nobody had seen who left it.',
            'June set down a plate of fries and a bowl of very small, very round cookies. Fenwick, from the next booth, said they were "an offering." {hero.real} ate two. They tasted like cinnamon and, faintly, like the moon.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'wing_scale', label: 'A single dusty wing scale', winner: 'hero', weight: 0.5,
        text: [
          'The lights went out, the lights came back, and the ring was empty except for one small, dusty wing scale on the center mat. {hero} held it up. The VFW stood and cheered, and nobody asked for more.',
          '{hero} won in the dark, then knelt, picked up a single shimmering scale and held it high. The crowd roared. The mystery stayed exactly as it was, which was exactly right.',
        ],
        epilogue: [
          '{hero.real} kept the scale in a small glass jar on the booth table. "I\'ll never know," said {hero.real}. "And I love that." Fenwick wrote SOLVED (NOT SOLVED) on his corkboard.',
          'Birdie put the scale in a frame next to a napkin that said NIGHT. "The best mysteries stay a little bit lost," she said.',
        ],
        headline: ['{hero} WINS; ONLY A WING SCALE REMAINS', 'THE MOTHMAN LEAVES NOTHING BUT A SCALE'],
      },
      {
        id: 'mothman_wins', label: 'The Mothman keeps the night', winner: 'villain', weight: 0.3,
        text: [
          '{villain} won it in the dark, stood over {hero} for one quiet second, then tilted {villain.their} head and faded into the rafters. The VFW sat in the dark for a moment, and then clapped.',
          '{hero} lost to a shadow, and when the lights came up found a thermos of warm cocoa on the apron with a note: GOOD HUNT. The crowd gave {hero} a standing ovation for it.',
        ],
        epilogue: [
          '{hero.real} said losing to the Mothman was the best night of the year. "I\'d do it again. Probably tomorrow." June said the cocoa recipe was hers and she did not know how it got there.',
          'Fenwick wrote LOST on his corkboard, crossed it out and wrote FOUND (BY NO ONE). Coach Patty took a very deep breath and said nothing.',
        ],
        headline: ['THE MOTHMAN WINS THE NIGHT', 'A THERMOS OF COCOA AND A NOTE: "GOOD HUNT"'],
      },
      {
        id: 'friendly_wings', label: 'The Mothman becomes an ally', winner: null, weight: 0.2,
        turn: { who: 'villain', to: 'hero' },
        text: [
          'The lights came up and {hero} and {villain} stood side by side in the center of the ring, facing the crowd. {villain} gave one slow bow. {hero} bowed back. The VFW went quiet, and then very loud.',
          'Neither won, neither lost. {villain} lifted one wing as though in greeting, and {hero} lifted a hand. For one moment the whole building waved at the Mothman. The Mothman waved back.',
        ],
        epilogue: [
          '{hero.real} told the booth the Mothman had never really been a menace. "Just a very late guest." Birdie wrote ALLY? on a napkin, then, in smaller letters, WELCOME.',
          'Fenwick framed his corkboard and hung it at the flea market. "I always said it was friendly," he said. He had always said the opposite.',
        ],
        headline: ['THE MOTHMAN BECOMES AN ALLY', 'HUNTER AND MOTHMAN STAND SIDE BY SIDE'],
      },
    ],
    gusWords: ['Cryptid', 'Moth Hunt', 'Wing Scale', 'Stakeout', 'Night Watch', 'Moonlight', 'Fenwick\'s Prophecy', 'Flutter'],
    wants: [
      'I want to unmask the Mothman, and I want to fail beautifully.',
      'I want a night stakeout with thermoses and moths.',
      'I want Fenwick to say "I told you so" just once.',
    ],
    background: true,
    playerRoles: ['hero'],
  },

  // ------------------------------------------------------------ 5.30 The Reinvention
  {
    id: 'reinvention',
    name: 'The Reinvention',
    register: 'self-discovery and fun',
    blurb: 'A brand-new look walks down the aisle, an old rival insists "I know it\'s you," and the town learns to love the new version.',
    tags: ['spotlight', 'entrance', 'gear', 'whimsy'],
    roles: [
      { key: 'hero', label: 'The Reinventor', align: 'hero', player: true },
      { key: 'villain', label: 'The Old Rival', align: 'any', player: true },
      { key: 'ally', label: 'The Supporter', align: 'hero', optional: true },
    ],
    length: [3, 4, 5],
    cards: {
      hook: ['HK-20', 'HK-14'],
      twist: ['TW-11', 'TW-02'],
      stakes: ['ST-11', 'ST-02'],
      payoff: ['PO-01', 'PO-23'],
    },
    twistAt: 'end_act2',
    acts: [
      [
        {
          key: 'new_look_debut', kind: 'match', purpose: 'establish',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            'A brand-new look walked down the aisle to music nobody recognized, and the VFW murmured, "Who is that?" By the second minute they were chanting something. By the fifth, they had figured out what.',
            '{hero} debuted a new look to a completely quiet room. Every head turned. Every hand went to a chin. The crowd, to its credit, applauded a full ten seconds before remembering to be suspicious.',
          ],
          headline: ['A NEW LOOK AT THE VFW; NOBODY KNOWS WHO', '"WHO IS THAT?" THE VFW WANTS TO KNOW'],
        },
        {
          key: 'who_is_that', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'Steel Chair Hardware',
          title: 'Who is that?',
          text: [
            'A line formed at the hardware store counter to ask the clerk who the new wrestler was. Coach Patty asked three times whether {hero} was new in town. {hero} said yes, politely, three times.',
            'Agnes Pickett squinted at {hero} across Main Street and announced, "I know that walk." She did not know that walk. She said it again, just in case.',
          ],
          headline: ['COACH PATTY ASKS THREE TIMES IF {hero} IS NEW', 'AGNES PICKETT: "I KNOW THAT WALK"'],
        },
      ],
      [
        {
          key: 'i_know_its_you', kind: 'interview', purpose: 'heat', roles: ['villain', 'hero'],
          title: 'Sit-down interview: {villain} & {hero}',
          text: [
            '"I know it\'s you," {villain} told Gus on camera. "Under there. I\'ve seen that stance. That elbow." {hero} said calmly that {villain} must be thinking of somebody else, and then did the elbow.',
            'Gus asked {villain} how sure {villain} was. "Ninety percent," said {villain}. "Ninety-five." Then, very quietly, to the camera: "I\'d bet my boots." {hero} said nothing and adjusted a cuff.',
          ],
          headline: ['"I KNOW IT\'S YOU," SAYS {villain}', '{hero} DENIES, THEN DOES THE ELBOW'],
        },
        {
          key: 'fans_adjust', kind: 'town', purpose: 'town', roles: ['hero'],
          place: 'the Sportatorium merch table',
          title: 'The fans adjust',
          text: [
            'At the merch table longtime fans re-lettered their old shirts with markers and tape and a great many questions. One had a new name stitched onto a sleeve by hand, in dark thread, "just in case it\'s the right one."',
            'The merch table sold out of fresh patches in an hour. Several people bought two, "one for the old, one for the new." The cashier called it the most thoughtful stampede she had ever seen.',
          ],
          headline: ['FANS RE-LETTER THEIR OLD SHIRTS', 'THE MERCH TABLE SELLS OUT OF PATCHES'],
        },
        {
          key: 'new_move', kind: 'match', purpose: 'segment',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            '{hero} debuted a new move, a high, slow, graceful arc that made the crowd say "oh" together, and the old fans took it in the way you take in a stranger who turns out to be a friend.',
            'It was a different wrestler out there, a little bolder, a little quicker, a little more of a showman. The win came with a move nobody had seen, and for the first time all month the VFW cheered the new look on purpose.',
          ],
          headline: ['{hero} DEBUTS A NEW MOVE; THE VFW SAYS "OH"', 'THE NEW LOOK EARNS ITS FIRST CHEER'],
        },
        {
          key: 'supporter_stitches', kind: 'angle', purpose: 'tease', roles: ['ally', 'hero'], optional: true,
          title: 'Backstage: {ally} & {hero}',
          text: [
            '{ally} sat on an upturned crate with a needle and a patch, stitching a final detail onto {hero}\'s new look. "It looks like you," said {ally}. "The you that\'s coming." {hero} tried not to look pleased.',
            '{ally} held a hand mirror up in the empty ring and told {hero}, "Say it out loud. Say who you are now." {hero} said it. The ring did not fall down. The mirror did not crack.',
          ],
          headline: ['{ally} STITCHES THE FINAL DETAIL', '"SAY WHO YOU ARE NOW"'],
        },
      ],
      [
        {
          key: 'new_self_promo', kind: 'promo', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'In-ring address: {hero}',
          text: [
            '"I\'m not who I was," said {hero}, "and I\'m not done becoming who I\'ll be." {villain} stood at ringside, arms folded, trying very hard not to look impressed, and failing.',
            '{hero} took the microphone and said, "You think you know me. Good. Come Saturday, you\'ll find out how wrong that is." The crowd erupted, and so, from ringside, did {villain}\'s eyebrows.',
          ],
          headline: ['"I\'M NOT WHO I WAS," SAYS {hero}', '{villain} FAILS NOT TO BE IMPRESSED'],
        },
        {
          key: 'old_jacket', kind: 'town', purpose: 'town', roles: ['hero'], optional: true,
          place: 'Main Street',
          title: 'The old jacket waits',
          text: [
            'An old jacket, a very familiar one, hung folded in a shop window on Main Street with a note: FOR WHENEVER. Nobody claimed it. Nobody moved it. The shopkeeper dusted it every morning.',
            'The hardware store window displayed a pair of old boots and a pair of new boots side by side with a sign: BOTH FIT. Pip stood in front of them for an hour, deciding which he liked better, and bought neither.',
          ],
          headline: ['AN OLD JACKET WAITS IN A MAIN STREET WINDOW', 'OLD BOOTS, NEW BOOTS: "BOTH FIT"'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{villain.real} admitted knowing from the very first stance. "It was the elbow. It\'s always the elbow." {hero.real} said the elbow was the one thing {hero.real} had not tried to change. "You can\'t take everything."',
            'Birdie leaned in. "Which one\'s the real you, sugar?" {hero.real} thought for a moment and said, "Whichever one finishes the milkshake." June took the glass away. "Whichever one pays."',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'new_self_wins', label: 'The new self wins the room', winner: 'hero', weight: 0.6,
        text: [
          'The new self took it, in front of a crowd that had decided somewhere between the second and fifth minute to love every inch of it. {hero} raised both arms and felt, for the first time, completely at home in the new look.',
          '{hero} won, and {villain} was the first to extend a hand. "Ninety-five percent," said {villain}. "Now a hundred." The crowd applauded the math.',
        ],
        epilogue: [
          '{hero.real} said it felt like trying on a favorite sweater that hadn\'t been invented yet. {villain.real} said the stance was exactly the same. "That\'s how I knew."',
          'Birdie wrote NEW CHAPTER on a napkin, drew a little bookmark beside it, and put it in her pocket.',
        ],
        headline: ['A NEW LOOK, A NEW WIN', '{villain}: "NINETY-FIVE PERCENT. NOW A HUNDRED."'],
      },
      {
        id: 'rival_respects', label: 'The old rival comes around', winner: 'villain', weight: 0.2,
        text: [
          '{villain} won it and then raised {hero}\'s arm and told the crowd, "That\'s a whole new person, and I like them." The VFW, which had never heard {villain} say anything like that, roared.',
          '{villain} took the pin, and then, with a small, grudging bow, tipped an imaginary hat. "Whoever you are now," said {villain}, "keep going."',
        ],
        epilogue: [
          '{villain.real} said the new look had earned it. "I still think it\'s you. I like the new you better." {hero.real} bought {villain.real} a milkshake for that.',
          'Birdie wrote RESPECT on a napkin and underlined it.',
        ],
        headline: ['{villain} WINS, THEN RAISES {hero}\'S ARM', '"KEEP GOING," SAYS THE OLD RIVAL'],
      },
      {
        id: 'old_self_one_night', label: 'The old self returns for one night', winner: 'hero', weight: 0.2,
        text: [
          'For one night only {hero} walked out in the old look, to the old music, and the building went completely, utterly wild. {hero} won, took a bow, and said, "That one was for you. The new one is for me."',
          'The old gear came out for a single night, and the old fans sang every word of the old entrance music. {hero} won it with the old move, then changed back backstage to cheers audible in the parking lot.',
        ],
        epilogue: [
          '{hero.real} said wearing the old look one last time was like visiting a house you used to live in. "I waved to the walls." Birdie said that was all the goodbye a house needs.',
          '{villain.real} sat in row one in an old shirt from the first show and clapped for a very long time. Nobody asked why.',
        ],
        headline: ['{hero} WEARS THE OLD LOOK FOR ONE NIGHT', 'THE OLD MUSIC RETURNS FOR A SINGLE NIGHT'],
      },
    ],
    gusWords: ['New Look', 'Reinvention', 'Makeover', 'Fresh Face', 'Plot Twist', 'Evolution', 'New Chapter', 'Who\'s That'],
    wants: [
      'I want to start over and see if anybody notices.',
      'I want a whole new look, and I want my old rival to say "I know it\'s you."',
      'I want to prove I\'m more than the person they remember.',
    ],
    background: false,
    playerRoles: ['hero', 'villain'],
  },

  // ------------------------------------------------------------ 5.31 The Grudge Match
  {
    id: 'grudge_match',
    name: 'The Grudge Match',
    register: 'fiery old rivals',
    blurb: 'Two old rivals meet again, the town remembers every detail, and this time the stipulation is bigger.',
    tags: ['drama', 'mat_classic', 'old_school', 'menace'],
    roles: [
      { key: 'hero', label: 'Rival A', align: 'hero', player: true },
      { key: 'villain', label: 'Rival B', align: 'villain', player: true },
    ],
    length: [3, 4, 6],
    cards: {
      hook: ['HK-19', 'HK-03'],
      twist: ['TW-11', 'TW-17'],
      stakes: ['ST-03', 'ST-05', 'ST-06'],
      payoff: ['PO-05', 'PO-18', 'PO-09'],
    },
    twistAt: 'end_act2',
    needs: ['history'],
    acts: [
      [
        {
          key: 'old_footage', kind: 'angle', purpose: 'establish', roles: ['hero', 'villain'],
          title: 'Old footage: {hero} & {villain}',
          text: [
            'The big screen replayed the last time {hero} and {villain} met, in grainy glory, with every cheer and every elbow. When the tape ended nobody moved. {hero} looked at {villain}. {villain} looked at {hero}.',
            'Old footage rolled and a hush fell over the VFW. At the very end the camera caught both of them in the same shot, watching each other watch themselves, and the whole room let out a breath.',
          ],
          headline: ['OLD FOOTAGE REPLAYED; THE RIVALS REMEMBER', 'THE TAPE ENDS; NOBODY MOVES'],
        },
        {
          key: 'poster_returns', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'the Sportatorium lobby',
          title: 'The old poster goes back up',
          text: [
            'The old match poster came out of storage and went up in the Sportatorium lobby, in the same frame, with the same coffee ring. Agnes Pickett stood in front of it for a long time and said, "I was there."',
            'Hank Szabo was seen carrying the old ringside bell up from the basement and polishing it with a very small cloth. "Just in case," Hank said, to nobody.',
          ],
          headline: ['THE OLD MATCH POSTER GOES BACK UP', 'THE OLD BELL GETS A POLISH'],
        },
      ],
      [
        {
          key: 'old_wounds', kind: 'promo', purpose: 'heat', roles: ['villain', 'hero'],
          title: 'In-ring address: {villain}',
          text: [
            '{villain} stood in the ring and listed every grievance from the last time, in order, with dates. {hero} listened to all of them, said "Fair," and then listed a few {villain} had missed.',
            '"You remember the last time," said {villain}. "I\'ve thought about it every day." {hero} said, "So have I." They stared at each other for an uncomfortably long moment, and neither blinked.',
          ],
          headline: ['{villain} LISTS EVERY GRIEVANCE, WITH DATES', '"I\'VE THOUGHT ABOUT IT EVERY DAY"'],
        },
        {
          key: 'the_spot', kind: 'angle', purpose: 'segment', roles: ['hero', 'villain'],
          title: 'The spot: {hero} & {villain}',
          text: [
            '{hero} and {villain} met at the corner of the VFW parking lot where the last feud ended and stood there, face to face, in complete silence. A passing truck honked. Neither moved.',
            'The camcorder caught the two of them standing on the exact tile where the old match had ended, pointing at it and arguing about whose tile it was. Mo marked it with chalk.',
          ],
          headline: ['RIVALS MEET ON THE SPOT WHERE IT ENDED', 'MO CHALKS THE TILE'],
        },
        {
          key: 'tune_up', kind: 'match', purpose: 'segment',
          sides: [['hero'], ['@any']], winner: 0,
          title: '{hero} in action',
          text: [
            '{hero} won an angry, focused tune-up match and looked straight at {villain} at ringside through the whole three count. {villain} held the stare and did not clap.',
            'It was a vicious little tune-up. {hero} won it, then pointed at {villain} with one finger and nothing else, no words, no gestures. The VFW got the message.',
          ],
          headline: ['{hero} WINS A TUNE-UP, STARES DOWN {villain}', 'ONE FINGER, NO WORDS'],
        },
        {
          key: 'old_regulars', kind: 'town', purpose: 'town', roles: ['hero', 'villain'],
          place: 'the Hot Tag Diner',
          title: 'The old regulars return',
          text: [
            'The four old-timers who watched the last match from stools five through eight at the Hot Tag reclaimed them, in the same order, and ordered the same pie. They refused all comment. They were extremely pleased.',
            'June hung a framed photo from the last match behind the register, face out, for the first time in years. Customers stopped to look at it on their way in, and some on their way out, too.',
          ],
          headline: ['OLD-TIMERS RECLAIM STOOLS FIVE THROUGH EIGHT', 'THE OLD PHOTO COMES OUT AT THE HOT TAG'],
        },
      ],
      [
        {
          key: 'bigger_contract', kind: 'contract', purpose: 'gohome', roles: ['hero', 'villain'],
          title: 'Contract signing: {hero} & {villain}',
          text: [
            '{hero} and {villain} agreed to a stipulation bigger than the last, and signed with the same pen, at the same table, with the same stare. "Bigger this time," said {villain}. "Much," said {hero}.',
            'The contract was longer than the last one, with more clauses and a footnote nobody read aloud. Both signed. Mo, who had read the footnote, quietly left the room and came back with a clipboard.',
          ],
          headline: ['A BIGGER MATCH THAN LAST TIME IS SIGNED', 'MO READS THE FOOTNOTE AND LEAVES THE ROOM'],
        },
        {
          key: 'bev_advisory', kind: 'town', purpose: 'town', roles: ['hero', 'villain'], optional: true,
          place: 'Main Street',
          title: 'Main Street braces',
          text: [
            'Sheriff Bev issued a noise advisory for Saturday: "It\'s going to be loud. Bring earplugs and a snack." The line for earplugs at the hardware store was out the door.',
            'Mayor Oakes declared Saturday "a day of historical significance, and parking restrictions." Coach Patty added that anybody who parked on the lawn would be timed.',
          ],
          headline: ['SHERIFF BEV ISSUES A NOISE ADVISORY FOR SATURDAY', 'MAYOR OAKES DECLARES A DAY OF HISTORICAL SIGNIFICANCE'],
        },
        {
          key: 'booth', kind: 'booth', purpose: 'epilogue', roles: ['hero', 'villain'],
          title: 'The back booth',
          text: [
            '{hero.real} and {villain.real} watched the old tape in the booth with the sound off and a milkshake each. "I\'d forgotten that thing I did with the ropes," said {villain.real}. "I hadn\'t," said {hero.real}.',
            'Birdie asked whether they wanted to finish it for good or leave the door open. They looked at each other for a long time. "Open," said {hero.real}. "Cracked," said {villain.real}. June cut the pie into two uneven pieces.',
          ],
        },
      ],
    ],
    endings: [
      {
        id: 'hero_wins', label: 'Rival A takes round two', winner: 'hero', weight: 0.4,
        text: [
          '{hero} won the rematch, and when it was over {hero} did not celebrate. {hero} looked at the spot where the old match had ended, nodded to it, and left the ring.',
          'The three count rang out. {villain} lay on the mat for a long time, then rose and offered {hero} a very small, very real nod. The crowd saw it. The crowd was moved.',
        ],
        epilogue: [
          '{hero.real} said the rematch felt like finishing a sentence. "A long one." {villain.real} said the sentence had a very good ending and a very bad middle.',
          'The four old-timers on stools five through eight wrote the date on a napkin and passed it down the row. It is now behind the register.',
        ],
        headline: ['{hero} WINS THE REMATCH', 'OLD-TIMERS ON STOOLS FIVE TO EIGHT APPROVE'],
      },
      {
        id: 'villain_wins', label: 'Rival B takes round two', winner: 'villain', weight: 0.4,
        text: [
          '{villain} won the rematch, then picked up the old ringside bell and rang it once, slowly, to the crowd. {hero} watched from the apron and did not look away.',
          '{villain} won it and, for once, did not gloat. {villain} walked to {hero}, said something nobody could hear, and walked away. {hero} nodded. The door, it seemed, was still open.',
        ],
        epilogue: [
          '{villain.real} said the quiet thing was "Not bad." {hero.real} said it was the nicest thing {villain.real} had ever said, and the most irritating.',
          'Birdie wrote ROUND THREE on a napkin and underlined it twice. "Give it a year," she said.',
        ],
        headline: ['{villain} WINS THE REMATCH', 'THE OLD BELL RINGS FOR {villain}'],
      },
      {
        id: 'finally_over', label: 'Finished for good, with a handshake', winner: 'hero', weight: 0.2,
        text: [
          '{hero} won, and {villain} was the first to offer a hand. "Enough," {villain} said into the microphone. "That\'s enough." The crowd cheered the sentence, the handshake and the end of a very long thing.',
          'After the bell the two of them walked to the old chalk tile on the floor and wiped it away together with their hands, laughing. Mo watched and, privately, felt a little bit lost.',
        ],
        epilogue: [
          '{hero.real} and {villain.real} went to the Hot Tag together and sat on stools five and six. The old-timers looked up from their pie, nodded and went back to it.',
          'Birdie hung the framed photo of the old match on the wall of the booth. "Finished," she said, "and remembered."',
        ],
        headline: ['THE GRUDGE ENDS WITH A HANDSHAKE', 'RIVALS WIPE THE OLD CHALK AWAY TOGETHER'],
      },
    ],
    gusWords: ['Grudge', 'Rematch', 'Unfinished Business', 'Old Wounds', 'Round Two', 'Old Scores', 'Reckoning', 'Sequel'],
    wants: [
      'I want a rematch for the ages.',
      'I want to finish what we started.',
      'I want the old-timers on stools five through eight to say "I knew it."',
    ],
    background: true,
    playerRoles: ['hero', 'villain'],
  },
];
