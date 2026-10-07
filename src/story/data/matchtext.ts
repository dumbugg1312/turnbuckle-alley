/**
 * Background (non-story) match text: openers by style pair, finishes, color,
 * promos, crew segments, and Birdie's backstage notes. Match summaries are all
 * kayfabe. Openers are written to read the same whichever wrestler is {a} or {b}.
 * Tone rules: src/story/types.ts.
 */
import type { MatchTextData } from '../types';

export const MATCH_TEXT: MatchTextData = {
  // ------------------------------------------------------------------ openers
  // Keys: two styles, sorted alphabetically, joined by "|". Never says who won.
  openers: {
    'brawler|brawler': [
      `{a} and {b} skipped the handshake, and the first forearm landed before the echo of the bell had finished.`,
      `Two brawlers, one ring, and no appetite for a lecture: {a} and {b} went straight to work.`,
    ],
    'brawler|giant': [
      `{a} and {b} collided in the middle like a freight train meeting a stubborn gate, and the front row leaned back as one.`,
      `A scrapper's elbows against a giant's reach: {a} and {b} each decided the other was the problem.`,
    ],
    'brawler|highflyer': [
      `One of them wanted this on the mat and the other wanted it in the rafters, so {a} and {b} compromised by doing both.`,
      `{a} and {b} traded forearms on the ground and flips in the air, and the crowd could not decide where to look.`,
    ],
    'brawler|luchador': [
      `{a} and {b} blended rough elbows with quick footwork, and the crowd learned a new kind of rhythm.`,
      `It started as a scrap, turned into a dance, then turned back into a scrap, as {a} and {b} traded fast holds and faster forearms.`,
    ],
    'brawler|powerhouse': [
      `{a} and {b} began with a shoving match that rattled the ring posts, and neither one gave an inch.`,
      `A scrapper and a powerhouse, and the opening minutes were mostly slams, shoves, and the occasional stern look.`,
    ],
    'brawler|rookie': [
      `{a} and {b} shook hands, and one of them was visibly trying to remember the plan while the other was already throwing elbows.`,
      `The bell rang for a tough scrapper and a newcomer, and the crowd cheered the nerve as much as the moves.`,
    ],
    'brawler|showman': [
      `{a} and {b} came out swinging, one with fists and one with flair, and the crowd could not tell who was louder.`,
      `A brawl broke out in the middle of a fashion show. {a} and {b} each insisted it was the other's idea.`,
    ],
    'brawler|technician': [
      `{a} and {b} began with a collar-and-elbow tie-up that turned into a scrap and then back into a chess match.`,
      `Rough hands met careful ones as {a} and {b} traded holds and elbows, and neither gave an inch.`,
    ],
    'giant|giant': [
      `The ring creaked twice as {a} and {b} stepped through the ropes, and Hank Szabo was seen nodding her approval from the apron.`,
      `Two giants met in the middle and neither moved. The crowd held its breath for four full seconds.`,
    ],
    'giant|highflyer': [
      `{a} and {b} played a game of tag with very different rules, one from the rope and one from the floor.`,
      `Reach against altitude: {a} and {b} spent the opening minutes finding out which was higher.`,
    ],
    'giant|luchador': [
      `{a} and {b} began with a slow stomp and a fast spin, and the crowd was surprised by how well the two went together.`,
      `A heavy step met a quick turn, and {a} and {b} spent the opening minutes trying to find each other.`,
    ],
    'giant|powerhouse': [
      `{a} and {b} lined up like two walls deciding which one was the door, and the crowd gasped at the first collision.`,
      `{a} and {b} locked up, and the ring made a sound like a barn settling.`,
    ],
    'giant|rookie': [
      `The crowd cheered the sheer nerve of the matchup before a single hold was applied: a newcomer facing a giant.`,
      `{a} and {b} met in the center, and the whole room found itself rooting for the underdog, whoever that turned out to be.`,
    ],
    'giant|showman': [
      `{a} and {b} entered to very different music, one with a stomp and one with a strut, and the crowd cheered both.`,
      `Sequins met steady strides as {a} and {b} circled, and nobody could say who owned the spotlight.`,
    ],
    'giant|technician': [
      `{a} and {b} began at arm's length and ended up finishing each other's thoughts: reach against wristlock, power against patience.`,
      `A slow, heavy tie-up met a quick, careful counter, and {a} and {b} spent the opening minutes writing each other's lesson plan.`,
    ],
    'highflyer|highflyer': [
      `{a} and {b} went to the ropes at the same time, and the crowd gasped as two flips crossed in the air.`,
      `Two aerial artists in one ring: {a} and {b} treated the top rope like a bus stop.`,
    ],
    'highflyer|luchador': [
      `{a} and {b} started at a sprint and never slowed down, and the crowd needed a moment to catch up.`,
      `Flips met spins, spins met leaps, and {a} and {b} had the crowd's necks turning like weather vanes.`,
    ],
    'highflyer|powerhouse': [
      `{a} and {b} went at it at the bell: one eyeing the top rope, the other planning to be there when the first came down.`,
      `Speed against strength: {a} and {b} spent the opening minutes finding out whether you can outrun a slam.`,
    ],
    'highflyer|rookie': [
      `{a} and {b} began in a flurry of nerves and cartwheels, and the crowd cheered the effort as much as the execution.`,
      `The newcomer was determined, the flyer was gracious, and {a} and {b} gave the crowd a lovely, bouncy start.`,
    ],
    'highflyer|showman': [
      `{a} and {b} each ran the ropes and struck a pose, and the crowd could not tell which was the opening act.`,
      `A spotlight hunt: {a} and {b} spent the opening minutes trying to leap higher and shine brighter.`,
    ],
    'highflyer|technician': [
      `{a} and {b} began with a lock-up and a leap, and the crowd found itself watching the mat and the rafters at the same time.`,
      `Science met altitude: {a} and {b} spent the opening minutes finding out whether you can pin down someone who keeps leaving the ground.`,
    ],
    'luchador|luchador': [
      `{a} and {b} began with a quick handshake and a quicker spin, and the crowd settled in for a lesson in rhythm.`,
      `Two masters of motion, one ring: {a} and {b} moved like a conversation in a language the crowd almost understood.`,
    ],
    'luchador|powerhouse': [
      `{a} and {b} danced around each other until the first big slam, and then the dance became a different dance.`,
      `Quick hands met a heavy grip, and {a} and {b} spent the opening minutes finding out which would give way first.`,
    ],
    'luchador|rookie': [
      `{a} and {b} stepped through the ropes, and the crowd leaned in: a veteran of the fast-moving art and a newcomer eager to learn it.`,
      `{a} and {b} circled each other, one with practiced grace and the other with beginner's grit.`,
    ],
    'luchador|showman': [
      `{a} and {b} each struck a pose, then a second pose, then a third, and the crowd gave all of them applause.`,
      `Flash met flow as {a} and {b} entered, and the front row did not know whether to clap or take notes.`,
    ],
    'luchador|technician': [
      `{a} and {b} traded holds so quickly that the crowd needed a moment to see where one ended and the next began.`,
      `A quick spin met a careful counter, and {a} and {b} spent the opening minutes writing each other's notes in midair.`,
    ],
    'powerhouse|powerhouse': [
      `{a} and {b} locked up, and the building hummed as two forces tried to move the same boulder.`,
      `{a} and {b} met in the center with a thud you could feel in your fillings.`,
    ],
    'powerhouse|rookie': [
      `{a} and {b} began in a slow circle, and the crowd cheered the newcomer's courage louder than the veteran's strength.`,
      `The bell rang for a powerhouse veteran and a newcomer, and the crowd rooted for the newcomer with all its heart.`,
    ],
    'powerhouse|showman': [
      `{a} and {b} came out in a cloud of confidence, and the front row could not decide whether to cheer or take photographs.`,
      `A show of strength against a strength of show: {a} and {b} spent the opening minutes finding out which was louder.`,
    ],
    'powerhouse|technician': [
      `{a} and {b} spent the opening minutes feeling out strength against science, with neither giving an inch.`,
      `A grip met a counter, and {a} and {b} each looked mildly offended.`,
    ],
    'rookie|rookie': [
      `{a} and {b} came out with equal parts nerves and heart, and the crowd cheered every single move as though it were the first.`,
      `Two newcomers took the ring at the same time, then stopped, politely, to let the other go first.`,
    ],
    'rookie|showman': [
      `{a} and {b} began with a bow and a pose, and the crowd cheered the nerve and the flair about equally.`,
      `The showman gave the newcomer a gracious little nod and then, to be fair, took the spotlight for a moment.`,
    ],
    'rookie|technician': [
      `{a} and {b} began with a gentle lock-up, a lesson delivered in real time, and the crowd approved of both teacher and student.`,
      `{a} and {b} spent the opening minutes shaking out nerves and tying up arms, and the crowd got a good look at both.`,
    ],
    'showman|showman': [
      `{a} and {b} each tried to out-strut the other on the way to the ring, and the first round was fought with eyebrows.`,
      `Two spotlights, one ring: {a} and {b} bowed, preened, and bowed again before a single hold was applied.`,
    ],
    'showman|technician': [
      `{a} and {b} began with a bow, a strut and a wristlock, and the crowd was not sure whether to applaud the show or the science.`,
      `Flash met focus as {a} and {b} circled; one struck a pose and the other struck up a chain of holds.`,
    ],
    'technician|technician': [
      `{a} and {b} began with a lock-up so polite that the front row applauded the handshake.`,
      `A chess match with elbows: {a} and {b} spent the opening minutes locking, countering, unlocking and looking pleased.`,
    ],
    any: [
      `The bell rang, and {a} and {b} circled each other beneath the lights.`,
      `{a} and {b} shook hands, and the crowd settled in for what looked like a good one.`,
      `{a} and {b} locked up in the center of the ring as Agnes Pickett clutched her purse.`,
      `The crowd rose for {a} and {b}, and the folding chairs rattled along with them.`,
      `{a} and {b} began cautiously, feeling each other out while Gus Gravel called the action hold by hold.`,
      `From the opening bell, {a} and {b} gave the crowd something to talk about on the drive home.`,
      `{a} and {b} nodded to Referee Mo, and the match began without further ceremony.`,
      `The two traded early shots, with {a.signature} from {a} answered at once by {b.signature} from {b}.`,
      `{a} and {b} came out fast, the way you do when the front row is watching.`,
      `A hush fell as {a} and {b} faced off, and then somebody coughed, and the match began.`,
      `{a} and {b} circled twice, grappled once, and gave the crowd a very good reason to cheer for the next ten minutes.`,
      `{a} and {b} locked eyes, then arms, and the room went quiet for a moment before the noise came back.`,
      `Pip Abernathy held up a sign for {a}. Someone in the next row held up a sign for {b}. The match began in a friendly clash of cardboard.`,
      `{a} stared across the ring at {b} and decided to take {b.them} seriously, and the bell rang on the decision.`,
      `Both {a} and {b} had a plan. Neither plan survived the first minute, and that was the best part.`,
    ],
  },

  // ------------------------------------------------------------------ finishes
  finishes: {
    clean: [
      `{winner} finished it with {winner.finisher}, and the referee counted three over {loser}.`,
      `A final {winner.signature} set up {winner.finisher}, and {loser} had no answer. One, two, three.`,
      `{winner} caught {loser} coming in and turned it into {winner.finisher}. The crowd was on its feet before the count.`,
      `After a long back-and-forth, {winner} found the opening and delivered {winner.finisher}. A clean pinfall, bright and loud.`,
      `{loser} kicked out of {winner.signature} once, but could not escape {winner.finisher}. The bell rang and the building shook.`,
      `{winner} hit {winner.finisher} and hooked the leg. Referee Mo counted it slowly, carefully and correctly.`,
      `{winner} outlasted {loser}, then outwrestled {loser}, then won it with {winner.finisher}. Fair and square.`,
      `The final moments belonged to {winner}, who landed {winner.signature}, then {winner.finisher}, and covered for the win.`,
      `{loser} fought hard to the very end, but {winner.finisher} was one step too many. {winner} offered a nod, which, for {winner}, is practically a handshake.`,
      `{winner} wrestled the whole match without a wasted move, and {winner.finisher} was the period at the end of the sentence.`,
      `A beautiful exchange ended with {winner.finisher}, a count of three, and a standing ovation for both {winner} and {loser}.`,
      `{winner} won it with {winner.finisher}, and Agnes Pickett, who had been holding her purse in the air, lowered it in respect. It is her highest honor.`,
    ],
    cheat: [
      `While Referee Mo was turned toward the far side, {winner} hooked the ropes for leverage and pinned {loser}. The crowd howled; Mo, informed later, was furious.`,
      `{winner} grabbed a fistful of tights and held on for the three. The crowd booed so loudly that Gus Gravel had to cup his headset.`,
      `Referee Mo was distracted by a loose turnbuckle pad, and {winner} used the moment to tuck a foot on the ropes and steal the win from {loser}.`,
      `{winner} landed {winner.finisher}, tucked a foot on the bottom rope, and covered. Mo counted three, unaware, and the crowd made its opinion known.`,
      `A sneaky handful of tights and a well-timed shove, and {winner} had the pin. Agnes Pickett was on her feet, purse raised, outraged.`,
      `{winner} pointed at nothing, Referee Mo turned to look at nothing, and {loser} paid for it. One, two, three, and the boos shook the rafters.`,
      `{winner} used the ropes for leverage in plain sight of everyone but the referee, and won it. Pip Abernathy's sign read UNFAIR.`,
      `While Mo was picking up a folding chair that had mysteriously appeared, {winner} rolled up {loser} with a fistful of tights. Sheriff Bev took notes.`,
      `{winner} hooked the leg and then, to be safe, the ropes. Referee Mo counted three, looked at the ropes, looked at {winner}, and looked at the rest of us.`,
      `A shove here, a pulled pair of tights there, and {winner} stole it. Even the folding chairs seemed to boo.`,
      `{loser} was nearly there when {winner} slid a boot onto the ropes and pinned. Mo had her back turned. The whole building had not.`,
      `{winner} cheated, and cheated cheerfully, and won. By the end the boos had turned into a kind of grudging chant.`,
    ],
    upset: [
      `Nobody saw it coming, least of all {loser}. {winner} rolled up the favorite for a stunning three-count, and the crowd erupted.`,
      `{winner} hit {winner.finisher} out of nowhere, and the building was louder than it had been all night. Upset of the season, said Gus Gravel.`,
      `{loser} was the clear favorite. {winner} had not been told, and won it with {winner.finisher}.`,
      `A tiny opening and a huge heart: {winner} slipped out of trouble, rolled {loser} into a pin, and shocked everyone, including {winner}.`,
      `{winner} kicked out of everything {loser} had and then won it with {winner.finisher}. Agnes Pickett was on her feet.`,
      `Nobody had picked {winner}, so nobody had a sign ready for {winner}, so the crowd improvised. Cardboard appeared from nowhere.`,
      `{loser} turned to the crowd to celebrate a little early, and {winner} took advantage with a small package and a loud count.`,
      `The underdog became the top dog in a single spectacular moment. {winner.finisher} did it, and the whole building knew it.`,
    ],
    tag: [
      `{winner} made the hot tag and cleaned house, and {loser} had nowhere left to run.`,
      `A double-team finish sealed it for {winner}: {winner.finisher}, then one, two, three.`,
      `{loser} tried a double-team of their own, but {winner} was a step ahead, and the crowd roared as the bell rang.`,
      `{winner} found their rhythm, tagged in, tagged out, tagged in again, and finished {loser} with a perfectly timed {winner.finisher}.`,
      `The tag team of the evening, {winner}, left {loser} reeling and the audience roaring.`,
      `{winner} won it with teamwork, communication, and a tiny bit of showing off.`,
      `The legal man tagged the other in, the other tagged the first back in, and the referee was dizzy by the end. {winner} won it.`,
      `{winner} took the match when the hot tag came, and the crowd came with it. {loser} was left wondering where the third and fourth hands had come from.`,
    ],
    title: [
      `With {title} at stake, {winner} refused to give an inch, and {winner.finisher} settled it.`,
      `{winner} hit {winner.finisher} and the count was three. {title} went home with {winner}.`,
      `{loser} gave everything for {title}, but {winner.finisher} was too much. The crowd stood for both.`,
      `{title} was on the line, and {winner} treated it that way, with every move sharp and every counter on time.`,
      `In a match for {title}, {winner} and {loser} left nothing in the ring, and {winner} had the last word.`,
      `For {title}, {winner} hit {winner.signature} and then {winner.finisher}. The bell rang and the hall rose.`,
      `{winner} secured {title} with a final {winner.finisher}, and Gus Gravel's voice cracked on the announcement.`,
      `It was close, and then it wasn't. {winner.finisher} did it, and {title} belonged to {winner}.`,
    ],
    noContest: [
      `The bell rang, then rang again, then rang a third time as Jobber ran off with the hammer. Referee Mo called it a no contest, mostly out of confusion.`,
      `The two were still exchanging blows when the clock ran out, and Gus Gravel announced a draw to polite, confused applause.`,
      `Both wrestlers tumbled over the top rope, wandered into the crowd, and were counted out together. Agnes Pickett, seated nearby, was not displeased.`,
      `A flicker of the lights at the worst moment gave the referee pause, and the match was called off. The crowd cheered the lights.`,
      `A folding chair appeared out of nowhere, Referee Mo threw the match out, and nobody could say whose chair it was.`,
      `Sheriff Bev stepped into the ring to deliver a citation, and in the confusion the match was declared a no contest. The citation was for excessive hullabaloo.`,
    ],
  },

  // ------------------------------------------------------------------ color
  color: [
    `Agnes Pickett swung her purse, Gertrude, at the nearest villain. The villain ducked. Gertrude did not forgive.`,
    `Pip Abernathy raised his cardboard belt over his head, and the whole row behind him sat a little straighter.`,
    `Coach Patty Kowalski scribbled on her EVIDENCE clipboard and muttered something about angles.`,
    `Sheriff Bev wrote a citation, tore it off, and handed it to a very confused usher.`,
    `Jobber the raccoon stole Gus Gravel's headset and was last seen heading for the exit, wearing it.`,
    `Somewhere next door, bingo was warming up, and a faint, hopeful "B-7" drifted through the wall.`,
    `Tiny Tallbridge gave a kid in the front row a tiny cake. The kid thanked her, then thanked the cake.`,
    `The popcorn machine made a happy noise, and the crowd sighed with relief.`,
    `A man in row D fell asleep for exactly one minute and was woken by his own cheering.`,
    `Lacey Ransom drummed on the back of a folding chair during the entrances. The chair held up admirably.`,
    `Deputy Doug the basset hound walked the center aisle at his own pace and took a seat. He was thoroughly well behaved.`,
    `Fenwick Thistle checked the ceiling for any sign of the Mothman. He found none, and found that suspicious.`,
    `Mayor Oakes clapped along with a ribbon in her hand, just in case.`,
    `A baby giggled at the loudest moment of the match, and the whole front row giggled with her.`,
    `Hank Szabo checked the bolts on the ring post. Then she checked them again. Then she nodded, satisfied.`,
    `Referee Mo checked her watch twice, cleared her throat, and counted the way only Referee Mo can.`,
    `A kid in the third row held a sign that read BEARS FOR BETTER SNACKS.`,
    `A gentleman in the back row stood on his folding chair, was told to sit, sat, and then stood again.`,
    `Gus Gravel's voice rose half an octave at the best part, which he blamed on the microphone.`,
    `Marigold Iyer straightened a cape from the aisle with a look that could press a collar.`,
    `Dr. Nadia, in the audience, winced in sympathy and then applauded.`,
    `June Oyelaran sent a tray of pies to the back row, and the back row suddenly had a very good view.`,
    `Doc Halloran leaned forward in his seat, frowned at a landing, and made a mental note about posture.`,
    `A pigeon made it into the rafters and stayed for the whole match, a loyal fan.`,
    `Commissioner Birdie watched from the curtain with her arms folded and the faintest smile, which is how you know.`,
  ],

  // ------------------------------------------------------------------ promos
  promos: [
    `{a} grabbed the microphone and informed {b}, and the building, that Saturday would be a lesson in humility. The building cheered for {b} anyway.`,
    `{a} stood nose to nose with {b} and said, in front of the entire front row, that this town had room for only one.`,
    `{a} promised {b} a night nobody would forget, and then, in a clearly ornery gesture, adjusted the microphone to the wrong height.`,
    `{a} took the microphone from Gus Gravel, which Gus allowed, and challenged {b} to a match in front of the whole town.`,
    `{a} declared that {b} had been getting by on charm for too long. The crowd was split on whether this was a compliment.`,
    `{a} climbed to the second rope and shouted at {b} until the ushers politely asked for a lower volume.`,
    `{a} reminded {b} of a promise, and then, with great drama, reminded {b} of another one, and a third.`,
    `{a} told {b} that the ring was too small for the both of them. Hank Szabo, listening, made a note.`,
    `{a} offered {b} a handshake, then withdrew it, then offered it again. The crowd lost track of who was winning.`,
    `{a} announced that {b} would be put in a hold so tight that Hank would need a new measuring tape. Hank came to look.`,
    `{a} told {b} to bring a friend, then looked around for one, and found Pip Abernathy, who respectfully declined.`,
    `{a} stared at {b} for a very long time. Nobody breathed. Then {a} said "Boo," and left.`,
  ],

  // ------------------------------------------------------------------ crew segments
  crew: [
    {
      title: `Sugar's Fines`,
      text: [
        `Commissioner Birdie took the microphone and read out this week's Sugar's Fines: one dollar for a late entrance, two for a rude gesture, and five for any wrestler who made Gus Gravel's headset fall off. All fines go to the bake sale.`,
        `The Commissioner issued her weekly fines from a clipboard, to groans and applause: three dollars for chair-related misconduct and one for excessive strutting. Every fine goes to the school gym fund, and every fine was paid.`,
      ],
      participants: ['birdie'],
    },
    {
      title: `Gus Gravel's Sit-Down`,
      text: [
        `Gus Gravel set up two folding chairs in the center of the ring and interviewed Agnes Pickett, front row since 1971. She had opinions, a purse, and no questions for him.`,
        `Gus sat down with a very nervous front-row fan for a live interview. The fan asked the questions, and Gus answered every one of them at length.`,
      ],
      participants: ['gus'],
    },
    {
      title: `A Key to the City`,
      text: [
        `Mayor Delphine Oakes presented the ring with a ceremonial key to the city, to loud applause. Hank Szabo tried it in three doors and a toolbox, and it opened none of them.`,
        `Mayor Oakes unveiled a very large golden key to the city. The key opens nothing, as Gus explained, and the mayor beamed with pride.`,
      ],
      participants: ['gus', 'hank'],
    },
    {
      title: `Hank Unveils a Prop`,
      text: [
        `Hank Szabo rolled out a new prop under a bedsheet: a six-foot oak ladder with a very proud little flag. The crowd clapped; Hank bowed once, curtly, and left.`,
        `Hank unveiled a new table, an upgrade from last month's table. Gus announced it as "a table of great character," and Hank allowed the description.`,
      ],
      participants: ['hank'],
    },
    {
      title: `Mo's Special Delivery`,
      text: [
        `Referee Mo Dizon, still in her mail carrier's cap, handed a very official envelope to the front row. It was addressed to "Whomever It May Concern," and the front row concerned itself immediately.`,
        `Mo marched to ringside with a special-delivery package and called out a name. Nobody answered. She waited, then left it with Agnes.`,
      ],
      participants: ['mo'],
    },
    {
      title: `Marigold's Gear Reveal`,
      text: [
        `Marigold Iyer unveiled a new robe with four hundred hand-stitched sequins and one very secret pocket. The crowd gasped; Marigold took a small bow and pinned a loose thread.`,
        `Marigold held up a new cape for the whole building to see. It is reversible, washable, and, according to Marigold, nearly indestructible, which is a promise.`,
      ],
      participants: ['marigold'],
    },
    {
      title: `The Pip-weight Title`,
      text: [
        `Pip Abernathy defended the Pip-weight title against Dex Delgado, who took a gentle arm drag and rolled around the ring for a full minute. Pip retained, the crowd roared, and Dex shook Pip's hand with real respect.`,
        `In a title match nobody forgot, Pip Abernathy knocked Dex over with a tiny shoulder tackle. Dex stayed down for what felt like a minute and a half, and rose to a standing ovation.`,
      ],
      participants: ['dex'],
    },
    {
      title: `June's Pie Auction`,
      text: [
        `June Oyelaran auctioned off three pies for the school gym fund, with commentary. The cherry went for forty dollars, the apple for thirty, and the sweet potato for a standing ovation.`,
        `June raised the gavel (a rolling pin) for the Hot Tag Diner's pie auction. Every pie sold, and one sold twice, to the same person, who apologized.`,
      ],
      participants: ['june'],
    },
    {
      title: `Doc's Stretch`,
      text: [
        `Doc Halloran led the entire crowd in a seventh-inning-style stretch, with advice on posture and a gentle reminder to breathe. Everyone sat down a little straighter.`,
        `Doc Halloran offered free posture checks to anyone in the front row. Forty people lined up, and the ring crew, in solidarity, lined up behind them.`,
      ],
      participants: ['doc'],
    },
    {
      title: `Bingo Preview`,
      text: [
        `Gus Gravel announced the first three numbers of tonight's bingo before the show, as a warm-up. The crowd shouted "B-9!" and was told it was too early.`,
        `A volunteer from the VFW read out a sample bingo card to rousing cheers. Nobody won, and everybody leaned in.`,
      ],
      participants: ['gus'],
      venue: 'vfw',
    },
    {
      title: `The Sportatorium Raffle`,
      text: [
        `Commissioner Birdie drew the Sportatorium raffle: first prize, a free pie every week for a month from the Hot Tag Diner. June Oyelaran presented the first pie personally.`,
        `Birdie spun the raffle drum and drew a ticket. The winner took home a casserole, and the whole row stood to cheer.`,
      ],
      participants: ['birdie', 'june'],
      venue: 'sportatorium',
    },
    {
      title: `Mo's Counting Lesson`,
      text: [
        `Referee Mo taught the crowd to count to three, in unison, with arm motions. It took four tries and some argument about where the "two" goes.`,
        `Mo, to settle a long-standing argument, led the crowd in a slow, clear count of one, two, three. The crowd found the experience educational.`,
      ],
      participants: ['mo'],
    },
    {
      title: `Hank Polishes the Belt`,
      text: [
        `Hank Szabo spent five minutes polishing a championship belt in the middle of the ring, one buckle at a time. The crowd watched in total silence, and then applauded the buckle.`,
        `Hank held the championship belt up to the rafters, polished it with a cloth, and set it on a stand. The belt gleamed, and the crowd gleamed back.`,
      ],
      participants: ['hank'],
    },
    {
      title: `Lost and Found`,
      text: [
        `Gus Gravel read out the lost-and-found: two mittens, one umbrella, a set of keys, and a cardboard belt. The belt was claimed instantly, by a very excited fan, with joy.`,
        `Mo Dizon, who knows where everything goes, matched three lost items with their owners in under a minute. Gus announced each reunion like a title change.`,
      ],
      participants: ['gus', 'mo'],
    },
  ],

  // ------------------------------------------------------------------ player intros (Gus)
  playerIntros: [
    `Ladies and gentlemen, {player} steps into the ring, facing {opp}, who has brought {opp.finisher} and does not appear to be sorry.`,
    `Introducing {player}, hometown hopeful, against {opp}, whose {opp.finisher} has been described as "something to see" by those who saw it.`,
    `The crowd rises for {player}, and the crowd rises for {opp}, and the crowd, frankly, is going to need a chair.`,
    `{player} versus {opp}! One of them has a plan. The other has {opp.finisher}. I will let you decide which is more impressive.`,
    `Tonight, in the ring, {player} faces {opp}. Remember that {opp.finisher} is coming, and you have been warned by someone with a microphone.`,
    `From the front row to the very back, the whole room holds its breath: {player} against {opp}, and the first fall belongs to whoever blinks last.`,
    `{player}, the pride of Turnbuckle Alley, meets {opp}, who is respected, admired, and very well rested.`,
    `In this corner, {player}, with heart and a very good pair of boots. In that corner, {opp}, with {opp.finisher} and a look.`,
    `{player} has trained for this. {opp} has trained for this longer. Somewhere, Commissioner Birdie is smiling at the curtain.`,
    `Folks, we have a good one: {player} versus {opp}, and Agnes Pickett has already raised her purse in a gesture of undecided support.`,
    `Let's hear it for {player}! And let's hear it, slightly less warmly, for {opp}, who has brought {opp.finisher} and a great deal of confidence.`,
    `{player} walks to the ring. {opp} waits. The bell is about to ring, and I, Gus Gravel, am sweating through my headset.`,
    `It's {player} against {opp} tonight, and Pip Abernathy has already made two signs, in case it goes both ways.`,
    `Ladies and gentlemen, the next attraction: {player} meets {opp}. Please keep your hands, and your popcorn, outside the ring ropes.`,
  ],

  // ------------------------------------------------------------------ Birdie before a booked loss
  putOverNotes: [
    `Tonight you lose to {opp.real}, {name}. Lose pretty. The folks remember who made the winner look like a million bucks.`,
    `Make {opp} look like a million bucks, sugar. You'll get it back tenfold. That's not a prediction, it's a carny promise.`,
    `You're going down to {opp.real} tonight. Take it like a champion and shake {opp.real}'s hand like you mean it. Respect travels.`,
    `{opp.real} has earned this one, and you're going to give it to them. The ones who give are the ones we remember.`,
    `Losing's just lending, sugar. You lend {opp} the night, and some night down the road, somebody lends it back.`,
    `Sell it, {name}. Sell every move {opp} throws. The better you sell, the bigger {opp.real}'s night, and the bigger your name gets.`,
    `Take {opp.real}'s finisher like it's the best thing that ever happened to you. Bonus: it'll look like it was.`,
    `This one's {opp.real}'s. Not because you're not good, but because the town needs to believe in {opp}, and you're the one who can make 'em.`,
    `A good loss is a gift, kid. Hand it over with both hands, and {opp.real} will remember it long after Saturday.`,
    `Put {opp} over, {name}. Folks think you're giving something away. You are. That's the point.`,
    `Remember what I told you: nobody asks who lost the best match of the night. They ask who was in it.`,
    `Lose with your whole heart tonight. {opp.real} won't forget it, the crowd won't forget it, and neither will I.`,
  ],

  // ------------------------------------------------------------------ Birdie before a booked win
  winNotes: [
    `Tonight's yours, {name}. Win it graceful, and shake the loser's hand. The folks are watching how you win.`,
    `You've earned this one. Don't gloat. Gloating's for the villains, and they're better at it.`,
    `Take it, sugar. A win's a lovely thing, so enjoy it, but don't let it go to your head. There's a lot of Saturday left.`,
    `This one's yours, {name}. Go out there and make the crowd glad they came.`,
    `I'm booking you to win, and I want you to look surprised. Not too surprised. Just enough that the front row believes it.`,
    `A win tonight, {name}. Be humble in the ring and louder at the diner.`,
    `Tonight you win. Tomorrow you buy the loser a pie. That's the arrangement.`,
    `You're winning tonight, kid. Remember who helped you get here, and say thank you out loud. It costs nothing, and it works.`,
  ],
};
