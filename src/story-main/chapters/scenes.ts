import { G, ext, hearts, rel } from '../../core/state';
import { sting } from '../../core/sting';
import { DIALOGUE } from '../../data/dialogue';
import { NPCS, NPC_BY_ID } from '../../data/npcs';
import { showLetter } from '../../systems/mail';
import { toast } from '../../ui/dialog';
import { makeApi } from '../../world/talk';
import { WORLD } from '../../world/scene';
import { done } from './beats';
import { cast, exit, heart, M, markDone, music, N, pick, playerTile, S, stage } from './stage';

/**
 * Scene scripts for the main story after week one, keyed by beat id
 * (see beats.ts for when each one fires). A script may return false to mean
 * "not now" (the beat stays open). Kayfabe: business truth is only spoken in
 * the back booth, the locker room, Birdie's office, the Airstream, or behind a
 * closed door in a private home (Room 7, Birdie's porch).
 */
export type SceneFn = () => Promise<boolean | void>;

const showWorked = () => !!(G.ext['shows'] as { worked?: boolean } | undefined)?.worked;

// ====================================================================== SPRING

async function spMural(): Promise<void> {
  await N('Halfway down Main Street, the smell of fresh paint drifts out of the alley.');
  await stage('town', 26, 24, 'up', [['birdie', 27, 22, 'up']]);
  await N('Birdie Malone is on a stepladder at the Velvet Hammers mural, touching up a sequin with a brush the size of a pencil.');
  await M('birdie', 'happy', "Hold the ladder, sugar. Gus held it last year and sneezed. The Duchess had a mustache till April.");
  await N('Up close, the two painted women stand back to back, one belt between them. One face is fresh gold. The other, she paints slower.');
  await S('birdie', 'Every spring before Thaw Brawl. Rain gets in. Kids lean their bikes on it.', "Folks ask why I keep the Duchess up there after what she did. Broke my heart and a perfectly good belt in front of two thousand people.");
  await S('birdie', "You don't paint over history, sugar. You keep it clean, so the kids know what it cost.");
  await N("She dabs the painted Duchess's cheek. Then again, though it didn't need it.");
  const c = await pick(null, [
    { label: '"She looks like me."', value: 'me' },
    { label: 'Just hold the ladder.', value: 'hold' },
    { label: '"Do you miss her?"', value: 'miss' },
  ]);
  if (c === 'me') {
    await S('birdie', "She looks like a villain, sugar. Hand me the gold.");
    await M('birdie', 'sad', "...You've got the chin. That's all. Lots of folks have a chin.");
  } else if (c === 'hold') {
    await N('You hold the ladder. She paints. A kid on a bike boos the mural on reflex as he passes. Birdie nods at him, approving.');
    heart('birdie', 10);
  } else {
    await S('birdie', "Miss her? I'm the Commissioner, sugar. I don't miss. I fine.");
    await N('She repaints the crown braid three times.');
  }
  await S('birdie', 'There. Good as 1982. Now scram. I have to go yell at a bank.');
  heart('birdie', 20);
  G.flags['saw_mural'] = true;
  await WORLD?.walkTo('birdie', 27, 29);
  exit('birdie');
}

async function spLocker(): Promise<void> {
  if (G.player.map !== 'lockers') {
    await N('From the locker room, Birdie hollers: "Sugar! Bring me the tape gun!"');
    await stage('lockers', 7, 7, 'up');
  }
  cast([['birdie', 8, 4, 'up']]);
  await N('The locker room is empty except for Birdie. She stands at the padlocked locker at the end of the row, one hand flat on the door.');
  await N("She isn't doing anything. Just standing there, the way you'd stand at a window. A floorboard creaks under you, and she snaps her hand back.");
  const c = await pick(null, [
    { label: '"Whose locker is that?"', value: 'ask' },
    { label: '"Sorry. I didn\'t mean to..."', value: 'sorry' },
    { label: 'Reach for the padlock', value: 'touch' },
  ]);
  if (c === 'ask') {
    await M('birdie', 'sad', "Don't.");
    await N("Just the one word. Not angry. Tired, like a door that's been holding something shut a long time.");
    heart('birdie', 15);
  } else if (c === 'sorry') {
    await S('birdie', "You didn't. I was checking the hinges.");
    await N('There are no hinges on that side.');
    heart('birdie', 20);
  } else {
    await M('birdie', 'angry', "*Don't.*");
    await N("It cracks across the room like the ring bell. Then her face falls.");
    await M('birdie', 'sad', "...Sorry, sugar. That lock's forty years old. It don't like strangers.");
  }
  await S('birdie', "Every locker in here's got somebody's name on it. That one's spoken for.", 'Now go tighten your boots. They squeak. I can hear you coming from the parking lot.');
  await N('On your way out you look back. The nameplate is scraped to bare metal. Under the padlock, a strip of old tape in faded ink: *D.D.*');
  exit('birdie');
}

async function spAgnes(): Promise<void> {
  await N('Agnes Pickett is in seat A1, two hours early, Gertrude upright in her lap like a loaded cannon. She pats the air beside her.');
  await S('agnes', "You. The new one. Sit a minute. Not there, dear. That's A2. Gertrude sits in A2.");
  await S('agnes', "Do you know who you look like? Don't tell me. I've sat here since 1971. I know every face that ever walked that aisle.");
  await S('agnes', '1983. Homecoming six weeks off. The Velvet Hammers, best team God ever made. And the Duchess turned on Birdie Malone.');
  await S('agnes', "Two thousand people went quiet. You've never heard that many people go quiet. It's louder than cheering, dear.");
  await S('agnes', 'Birdie lay there in the ring and nobody moved. Then a little boy in the balcony started to cry, and that set us all off.');
  await S('agnes', 'The Duchess came up this aisle, right past this seat. So I stood up. Gertrude and I did our duty.');
  const c = await pick(null, [
    { label: '"Good for you."', value: 'good' },
    { label: '"Did she say anything?"', value: 'say' },
  ]);
  if (c === 'good') await M('agnes', 'smug', "Thank you. Best swing of my life. I'd do it tonight.");
  else {
    await S('agnes', 'Say anything? No. She...');
    await N("Agnes stops. Her hand tightens on Gertrude's clasp.");
  }
  await M('agnes', 'sad', "There was something else. Something I've never told a soul. Ask me again when you've known me longer, dear.");
  await S('agnes', 'Now go on. Bell is at seven, and you have a face to make worth booing. Or cheering. Whichever you are this week.');
  heart('agnes', 25);
  G.flags['agnes_1983_asked'] = true;
}

async function spLou(): Promise<void> {
  const inTown = G.player.map === 'town' && !WORLD?.npcActor('lou');
  if (inTown) {
    const t = playerTile();
    cast([['lou', t.x + 1, t.y, 'left']]);
    await N('Monday morning. Sweet Lou comes up Main Street at his slow, slow pace, humming, a padded envelope under one arm.');
  } else {
    await N("Lou is packing up his tackle box. Tucked in the lid, under the lures: a padded envelope, about as thick as a videotape.");
  }
  await N('A gust off the creek flips the envelope out of his hands. It lands at your feet, address side up.');
  await N('The ink has run in the damp. A city street, a city zip code, and a name that starts *D. D-* before the water took the rest.');
  const c = await pick(null, [
    { label: 'Hand it straight back', value: 'back' },
    { label: 'Look closer', value: 'look' },
  ]);
  if (c === 'back') {
    await N('You hand it back without looking twice. Lou holds your eyes a long moment.');
    await S('lou', "Thank you, young'un. Some mail don't need reading.");
    heart('lou', 15);
  } else {
    await N('Before you can squint, a hand with a fishing-callused thumb takes it back. Gently.');
    await S('lou', "Ah-ah. Federal offense. Mo'd have to arrest us both, and she hates paperwork.");
  }
  await S('lou', "Mondays at ten, rain or shine. Forty years I've mailed the same thing to the same somebody.");
  const d = await pick(null, [
    { label: '"What\'s in it?"', value: 'what' },
    { label: '"Who\'s it for?"', value: 'who' },
  ]);
  if (d === 'what') await S('lou', "Saturday night. That's all. A little piece of Saturday night.");
  else await S('lou', 'Somebody who likes to know how the show went.');
  await M('lou', 'sad', "Some folks can't come home, so you mail home to them. One tape at a time.");
  await S('lou', "Don't go telling Birdie you saw this. She's got enough on her mind. And so, I think, have you.");
  heart('lou', 20);
  if (inTown) exit('lou');
}

async function spThawBrawl(): Promise<void> {
  const tonight = G.time.day === 27;
  await N(tonight ? 'Thaw Brawl is in the books. The back booth is loud with ice packs and pie.' : 'The morning after Thaw Brawl, Birdie catches your sleeve.');
  if (showWorked() || !tonight) {
    await N("Earlier, flat on the mat mid-match, you'd looked up at the curtain. Birdie was on her stool, pencil in her teeth, not moving.");
    await N('Not watching the match. Watching you. Like she was seeing somebody else wear your face, and could not look away.');
  } else {
    await N("You watched from the curtain with Birdie tonight. Twice you caught her looking at you instead of the ring.");
  }
  if (tonight) {
    await stage('diner', 15, 6, 'right', [['birdie', 16, 6, 'left']]);
    await N('Later, when the booth empties, Birdie slides in across from you.');
  }
  await S('birdie', 'Good show, sugar. That comeback. You waited half a second longer than anybody I ever trained.');
  await S('birdie', 'Only one other person I knew could wait like that. Let the whole building hold its breath, and then...');
  await N('She stops. Takes the cinnamon stick out of her mouth. Puts it back.');
  await S('birdie', 'Your grandmother ever tell you about...');
  const c = await pick(null, [
    { label: '"Tell me about her."', value: 'tell' },
    { label: '"She never says much about you either."', value: 'never' },
    { label: 'Wait.', value: 'wait' },
  ]);
  if (c === 'tell') await M('birdie', 'sad', "No. Not tonight. This booth's heard enough about Dottie Dupree to last it.");
  else if (c === 'never') {
    await M('birdie', 'sad', "...No. I don't suppose she would.");
    await N("It lands somewhere you didn't aim it.");
  } else await N('You wait. She almost says it. You can see it get as far as her teeth.');
  await S('birdie', "Forget it. I'm an old woman, it's past my bedtime. Go home, sugar. You were good tonight.");
  await N("She leaves cash for two coffees and doesn't drink hers. June pours it back in the pot. \"Every time,\" June says, to nobody.");
  heart('birdie', 20);
  exit('birdie');
}

// ====================================================================== SUMMER

async function suRumor(): Promise<void> {
  if (G.player.map !== 'birdie-office') {
    await N('Birdie crooks a finger at you. "Office, sugar."');
    await stage('birdie-office', 5, 6, 'up');
  }
  cast([['birdie', 6, 3, 'down']]);
  await N("Birdie is sharpening the Pencil. It doesn't need sharpening. It's down to a stub.");
  await S('birdie', 'Evening Bell called. Wanted to know if we still do a senior discount. For a new resident, moving in end of summer. From the city.');
  await N('The pencil snaps.');
  await S('birdie', 'Agnes told June. June told Lou. Lou told the creek, and the creek told me. Small towns, sugar.');
  const c = await pick(null, [
    { label: '"I didn\'t know how to tell you."', value: 'tell' },
    { label: '"She asked me not to."', value: 'asked' },
  ]);
  if (c === 'tell') await S('birdie', 'Nobody ever does. Must be the family trait.');
  else await M('birdie', 'sad', 'Course she did.');
  await S('birdie', 'Three blocks. She could have picked Florida. Florida has a whole ocean to look at.', "Fine. Free country. I'll take the long way to the bank.");
  heart('birdie', 15);
  exit('birdie');
}

async function suJune(): Promise<void> {
  await N('June catches your eye over the coffee pot and tips her head at the back booth. "Sit, baby."');
  await stage('diner', 15, 6, 'right', [['june', 16, 6, 'left']]);
  await S('june', "Evening Bell called me yesterday. That nice nurse, Farid Haddad's grandson. Asked how a new resident takes her coffee.");
  await S('june', "I said chicory, two sugars, and don't you dare stir it for her. She stirs it herself. Counterclockwise.");
  await M('june', 'sad', "Forty years, and I didn't have to think. It was just sitting in me, waiting to be asked.");
  const c = await pick(null, [
    { label: '"You knew her well."', value: 'knew' },
    { label: '"Will you go see her?"', value: 'go' },
  ]);
  if (c === 'knew') await S('june', "I drove her somewhere, once. Long time ago. That's all I'll say with the jukebox listening.");
  else await S('june', "I'll go when she can come here. This booth has her initials carved in it. She ought to see they held.");
  await M('june', 'love', "She's coming home, baby. You understand me? Whatever else happens. She's coming home.");
  heart('june', 25);
  exit('june');
}

async function suArrival(): Promise<void> {
  G.flags['grandma_in_town'] = true;
  await N('A note was slipped under the front door in the night, in tidy nurse printing.');
  await showLetter({
    id: 'sami-arrival',
    from: 'Sami Haddad, RN · The Evening Bell',
    body: [
      'To the grandchild of Mrs. Dorothy Dupree:',
      'Your grandmother arrived this morning and is settling into Room 7. She chose it herself, for the window.',
      'She asked for you by name, twice. She asked about Birdie once, then told me to forget she asked.',
      'P.S. She has already beaten me at gin rummy. I watched the whole time. I still do not know how.',
    ],
  });
  sting('story-beat');
  toast('Grandma has moved into the Evening Bell on Ropewood Lane. Room 7.');
}

async function suSami(): Promise<void> {
  cast([['sami', 9, 7, 'down']]);
  await N('The Evening Bell smells like lavender, floor wax and somebody\'s pot roast. A piano plays two notes, then gives up.');
  await S('sami', "You must be {name}. You have her... everything. The chin. The walk. Please don't do the wave. Agnes is right there.");
  await N('In the corner, Agnes lowers her crossword to glare at nothing in particular.');
  await S('sami', "Sami Haddad, charge nurse. (He clips a visitor's badge to your shirt and presses a butterscotch into your hand.)");
  await S('sami', "She's having a good day. But good days have weather, so here's the one rule.");
  await S('sami', "If she calls you another name, or thinks it's another year, don't fix it. Go where she is. Meet her there.");
  await M('sami', 'happy', "Don't correct. Connect. That's the whole job. That's every job, honestly.");
  const c = await pick(null, [
    { label: '"Is she okay?"', value: 'ok' },
    { label: '"Thank you for looking after her."', value: 'thanks' },
  ]);
  if (c === 'ok') {
    await S('sami', "She called the activities director 'the promoter' and negotiated for pudding. She's the Duchess. She's okay.");
    await M('sami', 'sad', "Some days are harder. Today isn't one of them.");
  } else await M('sami', 'love', 'Are you kidding? I grew up booing her. Now I bring her coffee. Ten-year-old me would pass out.');
  await S('sami', 'Room 7. End of the hall. Knock twice. She likes an entrance.');
  heart('sami', 30);
  exit('sami');
  await N('You walk down the hall. Knock twice.');
  await stage('grandma-room', 4, 6, 'up');
  markDone('su_room7');
  await room7();
}

async function room7(): Promise<void> {
  cast([['grandma', 3, 5, 'down']]);
  music('theme:grandma');
  await N('Room 7. She has been here since morning. The boxes have not.');
  // The dialogue team's moving-day heart event is this exact scene: play it here, once, for everyone.
  const ev = DIALOGUE['grandma']?.events.find((e) => e.id === 'grandma-4');
  const seen = rel('grandma').eventsSeen;
  if (ev && !seen.includes(ev.id)) {
    seen.push(ev.id);
    await ev.script(makeApi('grandma'));
  } else {
    await M('grandma', 'love', 'There you are. Come here, chère. Let me look at you.');
    await N('She points out the window. Three blocks away, over the rooftops: the Sportatorium marquee.');
    await M('grandma', 'sad', 'Saturday night... presiding... Commissioner Birdie Malone.', 'Well. There she is.');
  }
  await N('Later, Sami walks you to the door. He keeps his voice low.');
  await S('sami', 'She asked which room faces the Sportatorium before she asked where the bathroom was.');
  await S('sami', 'Come Sundays if you can. Tape night. Old matches bring her all the way back sometimes. You will see.');
  heart('grandma', 30);
}

async function suCorner(): Promise<void> {
  await N('On your way down Ropewood Lane, you see her.');
  await stage('town', 36, 16, 'left', [['grandma', 33, 16, 'down']]);
  await N('A small, straight-backed woman in a lavender cardigan stands on the corner, very still.');
  await N("From here, between two roofs, you can see the Sportatorium's back door. The one the wrestlers use.");
  const c = await pick(null, [
    { label: 'Go stand with her', value: 'stand' },
    { label: 'Let her be', value: 'leave' },
  ]);
  if (c === 'stand') {
    await N("You stand beside her. She takes your arm without looking, like she knew you'd come.");
    await S('grandma', 'One block on good days, chère. Exactly one. Then I turn around.');
    await M('grandma', 'sad', "Silly. It's a door. I've seen doors.");
    heart('grandma', 20);
  } else await N('You stay where you are. After a while she nods, once, to nobody.');
  await N('Down the block, the back door opens. Someone in a crimson blazer steps out to shake a coffee can of cinnamon sticks into the bin.');
  await N("Neither woman moves. If either one saw the other, neither lets on. The door closes. Grandma turns and walks home, back straight.");
  exit('grandma');
}

async function suFury(): Promise<void> {
  const tonight = G.time.day === 27;
  await N(tonight ? 'Fairgrounds Fury is over. Hay in everybody\'s hair. The back booth smells like funnel cake and liniment.' : 'The morning after Fairgrounds Fury, you find the insiders lingering over breakfast in the back booth.');
  await stage('diner', 15, 6, 'right', [['birdie', 16, 7, 'left'], ['hank', 16, 5, 'left']]);
  await S('birdie', 'Hank. The marquee. Half those bulbs have been dark since the Reagan administration.');
  await S('hank', "Since '94. North side. I've been meaning to.");
  await S('birdie', 'Every bulb. Monday. All of them.');
  await S('hank', "That's three hundred bulbs, Birdie.");
  await S('birdie', "It's a marquee, Hank. It's supposed to light up. That's the whole point of a marquee.");
  await N('Nobody says anything. Lou stirs his coffee very slowly. June studies the ceiling.');
  await N('Everybody in the booth knows which window faces that marquee. Nobody says Room 7.');
  await S('birdie', 'What are you looking at, sugar? Eat your pie.');
  G.flags['marquee_fixed'] = true;
  heart('birdie', 20);
  heart('hank', 15);
  exit('birdie', 'hank');
}

// ------------------------------------------------------------ Grandma's tape memories (Room 7, door closed)

async function memoryIntro(n: number): Promise<void> {
  const clues = [1, 2, 3, 4, 5].filter((i) => G.flags[`clue_hammers_${i}`]).length;
  music('theme:grandma');
  if (clues >= n) await N('You slide a Velvet Hammers tape into the VCR. Sami closes the door on his way out. The past comes up blue.');
  else await N("A good day. Grandma is sitting up, braid done, cardigan buttoned right. Sami closes the door on his way out. She wants to talk.");
}

async function mem1(): Promise<void> {
  await memoryIntro(1);
  await S('grandma', "Give me your hands. No, like this. Bird's left, my right.");
  await N('She crosses your wrists over hers in an old tag-team grip, and holds on.');
  await S('grandma', "We had a new move for the rematch. Homecoming '83. We drilled it in the Dungeon at five in the morning for a month.");
  await S('grandma', 'I trip them with a curtsy. Bird rolls them up. I hold the legs. And we finish with our hands joined, right across the chest.');
  await M('grandma', 'happy', "We called it the Encore. Last thing anybody'd see, and they'd beg for it again.");
  await M('grandma', 'sad', 'We never got to do it. Not once. Not in front of anybody.');
  const c = await pick(null, [
    { label: '"Show me."', value: 'show' },
    { label: '"Why not?"', value: 'why' },
  ]);
  if (c === 'show') await N('She walks you through it on the bedspread with two salt shakers and a pudding cup. The pudding cup is the opponent. It loses.');
  else {
    await S('grandma', "Oh, chère. Because I'm a very good villain.");
    await N("She says it lightly. Her hands don't let go of yours.");
  }
  await S('grandma', "If I ever forget everything else, ask me about the Encore. The body remembers. I'll know it.");
  G.flags['knows_encore'] = true;
  heart('grandma', 20);
}

async function mem2(): Promise<void> {
  await memoryIntro(2);
  await N('On the screen, the young Velvet Hammers win, and Birdie lifts Dottie clean off the mat.');
  await S('grandma', "Fall of '83. I was walking past her office. Door open a crack. She was on the telephone with New York.");
  await S('grandma', 'A national company. Television. Real money. They wanted her. Just her. Not the team.');
  await M('grandma', 'sad', "And she said, 'Not without Dot. Then the answer's no.' And she hung up on New York like she was swatting a fly.");
  const c = await pick(null, [
    { label: '"She loved you."', value: 'loved' },
    { label: '"What did you do?"', value: 'what' },
  ]);
  if (c === 'loved') await M('grandma', 'love', 'She was a fool. The best kind. The kind you would do anything for.');
  else await S('grandma', 'I sat in the ladies\' room for an hour. Then I went out and wrestled a very good match.');
  await S('grandma', 'I knew right then she would never go. Not while I was standing in the doorway.');
  await N('She watches the blue screen a long time after the tape ends.');
  heart('grandma', 20);
}

async function mem3(): Promise<void> {
  await memoryIntro(3);
  await N("Tonight she's somewhere else before the tape even starts, rubbing her own wrist like it's cold.");
  await S('grandma', "Cold at the depot. I'd left my coat in the locker. You can't go back for your coat when you're the villain, chère.");
  await S('grandma', "June drove me. Not one word the whole way. At the depot I gave her my boots. I said, 'I won't be needing these.'");
  await M('grandma', 'sad', 'The two-ten to the city. I sat in the back with my forehead on the glass. She\'ll hate me now, I thought. Good. Now she\'ll go.');
  const c = await pick(null, [
    { label: 'Take her hand', value: 'hand' },
    { label: '"Did you look back?"', value: 'back' },
  ]);
  if (c === 'hand') await N("Her hand is cold. You hold it until it isn't.");
  else await S('grandma', 'Every mile, chère. Nothing out there but dark. I looked anyway.');
  await S('grandma', "...Is my robe still in that locker? The plum one. Somebody ought to check on my robe.");
  heart('grandma', 20);
}

async function mem4(): Promise<void> {
  await memoryIntro(4);
  await N('She is at the window, reading the marquee. Every bulb is lit now, even the north side.');
  await S('grandma', 'Two weeks after, in the city. A furnished room over a laundromat. Everything smelled like soap and other people\'s Sundays.');
  await S('grandma', "I wrote Lou. 'Send me the shows. Don't you dare tell her where I am.'");
  await S('grandma', 'Then a padded envelope came. Saturday night at the Sportatorium. And there she was, on the card. Still there.');
  await M('grandma', 'sad', 'She never went. I gave her the whole world, and she stayed in Turnbuckle Alley and swept the ring.');
  await M('grandma', 'love', 'I watched every one, chère. Forty years of Saturdays. I watched her go gray one tape at a time.');
  const c = await pick(null, [
    { label: '"She still sweeps it. Every day."', value: 'sweep' },
    { label: '"Why didn\'t you come back?"', value: 'why' },
  ]);
  if (c === 'sweep') await M('grandma', 'happy', 'Singing? Off-key? ...Good. Good.');
  else await S('grandma', "I'd broken it, chère. You don't walk back into a thing you broke. You watch from far away and hope it mends.");
  heart('grandma', 20);
}

async function mem5(): Promise<void> {
  await memoryIntro(5);
  await N('The curtains are half drawn. She is holding a folded scrap of paper, soft as cloth from handling.');
  await S('grandma', 'Lou wrote me back, that first time. Two words. I carried them in my wallet for forty years.');
  await N('She unfolds it. The paper is blank. The pencil wore away years ago, under her thumb.');
  await M('grandma', 'sad', "I know what they meant, chère. I can't find the words. Isn't that something? Forty years, and I can't find them.");
  const opts: { label: string; value: string }[] = [
    { label: '"You know what they meant."', value: 'ok' },
    { label: 'Just sit with her', value: 'sit' },
  ];
  if (done(G.flags, 'fa_lou')) opts.unshift({ label: 'Say them: "She stayed."', value: 'say' });
  const c = await pick(null, opts);
  if (c === 'say') {
    await N('She goes very still.');
    await M('grandma', 'love', '...She stayed.', "Yes. Those are them. Oh, chère. Those are them.");
    heart('grandma', 40);
  } else if (c === 'ok') await M('grandma', 'love', 'I do. I do know. That is the part I kept.');
  else await N('You sit with her. She smooths the blank paper on her knee, again and again, like a cat.');
  await N('She folds the paper and puts it back in her cardigan pocket, where it lives.');
  heart('grandma', 20);
}

// ====================================================================== FALL

async function faLou(): Promise<void> {
  if (G.player.map !== 'airstream') {
    await S('lou', "Walk an old man home, young'un. My hip says rain, and my heart says talk.");
    await stage('airstream', 4, 4, 'up');
  }
  cast([['lou', 2, 3, 'down']]);
  await N('Inside the Biscuit, two VCRs sit side by side on a shelf above the sink. Both dark.');
  await S('lou', 'Mo came by Monday. First Monday in nine years I didn\'t hand her an envelope. She didn\'t ask. Mo never asks.');
  await S('lou', 'Every Saturday since the fall of \'83, I dub the show. Every Monday at ten I mailed it to a furnished room in the city.');
  await M('lou', 'sad', 'To your grandmama. Every show Birdie ever ran. Two thousand and some tapes.');
  await S('lou', "Two weeks after she left, a letter came. 'Send me the shows. Don't you dare tell her where I am.' And at the bottom, littler:");
  await S('lou', "'Is she gone yet?'");
  await N("Lou's hands are flat on the table, like he's still holding the letter down.");
  await S('lou', 'I wrote back two words. Took me all night to pick them. "She stayed."');
  const c = await pick(null, [
    { label: '"Why would Grandma ask that?"', value: 'why' },
    { label: '"You carried this for forty years."', value: 'kept' },
  ]);
  if (c === 'why') await S('lou', "That ain't mine to tell. Ask Doc what she said to him in that ring. Ask Gus where he drove that night.");
  else {
    await M('lou', 'sad', "Some promises get heavier every year. You carry 'em anyway.");
    await S('lou', "But she's three blocks off now. I reckon a promise can walk three blocks.");
  }
  await S('lou', "Doc. Gus. Hank. They each hold a piece. Tell 'em Lou says it's time.");
  heart('lou', 30);
}

async function faDoc(): Promise<void> {
  await N('Doc takes your arm and walks you to the Hot Tag, slowly, the way he does everything.');
  await stage('diner', 15, 6, 'right', [['doc', 16, 6, 'left']]);
  await S('doc', "I was twenty-seven. Danny Halloran, referee. That match was supposed to be easy.");
  await S('doc', 'The finish was Birdie\'s. She turns on Dottie, the Copperheads get the pin, six weeks of heat, and a big reunion at Homecoming.');
  await S('doc', 'Birdie goes to the ropes for her cue. But Dottie picks up the belt first, and leans in close. Not to Birdie. To me.');
  await M('doc', 'sad', "'Don't stop me, Danny. And count it fast.'");
  await S('doc', 'She was crying, kid. Under the lights. And she swung that belt at the ring post, not at Birdie.');
  await S('doc', 'It hit the steel and broke clean in two. Only the pieces touched Birdie. She aimed it. She was protecting her.');
  await S('doc', 'I counted it fast, like she asked. Then I walked out of that building and never counted another match.');
  await M('doc', 'sad', "Forty years I've believed I helped break something. I never knew why she asked. Do you?");
  const c = await pick(null, [
    { label: '"She did it so Birdie would go."', value: 'go' },
    { label: '"I\'m still finding out."', value: 'finding' },
  ]);
  if (c === 'go') {
    await N('Doc takes off his half-moon glasses and holds them a long time.');
    await M('doc', 'sad', "...Then I didn't break it. I helped her give it away. That's different. Tell me that's different.");
  } else await S('doc', 'Then find it, kid. Slowly. Some things you do not rush.');
  await S('doc', "I planted a juniper that November. Gave my hands something slow to do. It's doing fine. Forty years, it's doing fine.");
  heart('doc', 30);
  exit('doc');
}

async function faGus(): Promise<void> {
  await N('Gus taps his nose and points at the clock. After sign-off, then.');
  await stage('radio', 5, 7, 'up', [['gus', 6, 5, 'down']]);
  await N('WRSL after sign-off. The ON AIR light is dark. Gus holds Old Thunder in his lap like a sleeping cat.');
  await S('gus', "Kept the ring card from that night. My handwriting, my ninth show. 'Velvet Hammers vs. Copperhead Sisters. Finish: B. turns on D.'");
  await S('gus', 'It was supposed to be Birdie\'s turn. Not hers. Then, two-fifteen in the morning, Birdie bangs on my car window.');
  await S('gus', "Still in her ring gear. 'Depot, Gus. Now.' I ran both stop signs. We only had two stop signs.");
  await S('gus', 'We pull in, and there goes the two-ten to the city. Taillights going down Route 9.');
  await M('gus', 'sad', 'Five minutes. If we\'d had one more stop sign to run.');
  await S('gus', "She stood in the gravel till the lights were gone. Then: 'Turn around. And Gus? This never happened.'");
  const c = await pick(null, [
    { label: '"Thank you for telling me."', value: 'thanks' },
    { label: '"Does Grandma know Birdie went after her?"', value: 'know' },
  ]);
  if (c === 'thanks') await M('gus', 'love', 'Felt good, kid. Felt like a title change.');
  else await M('gus', 'sad', 'Nobody knows but me, Birdie and the gravel. Somebody ought to tell her. Before... well. Somebody ought to.');
  heart('gus', 30);
  exit('gus');
}

async function faHank(): Promise<void> {
  if (G.player.map !== 'lockers') {
    await N('Hank jerks her head toward the Sportatorium. "Locker room." That\'s the whole invitation.');
    await stage('lockers', 7, 7, 'up');
  }
  cast([['hank', 9, 5, 'down']]);
  await N('Hank sits on the bench with a jar of old screws and a magnet. Plumb is asleep on her boot.');
  await S('hank', 'Morning after, I was seventeen. Sweeping under the ring. Found this.');
  await N('She tips the jar. At the bottom, under forty years of screws: a red rhinestone the size of a thumbnail.');
  await S('hank', "Center plate of the belt. Kept it. Didn't know why. Some things you keep.");
  await S('hank', 'Same morning Birdie asked me to change the lock on that one. Only lock I ever put in without asking why. One key. Hers.');
  await S('hank', 'The robe is still in there. On damp days I can smell the lavender.');
  const c = await pick(null, [
    { label: '"Could you put the belt back together?"', value: 'belt' },
    { label: '"Thank you, Hank."', value: 'thanks' },
  ]);
  if (c === 'belt') await S('hank', "I've measured both halves in my head for forty years. It'd take me an afternoon.");
  else await S('hank', "Don't thank me. Just don't let it sit another forty.");
  await S('hank', "And see Fenwick. A box of old WRSL broadcast tapes turned up in his back room. One's in Gus's handwriting. October '83.");
  G.flags['tape_quest_ready'] = true;
  sting('reveal');
  toast("The lost 1983 broadcast may be in Fenwick's back room.");
  heart('hank', 30);
  exit('hank');
}

async function faLouCopy(): Promise<void> {
  G.flags['tape_1983_lou'] = true;
  await N('In the mailbox this morning: a padded envelope, Monday style, in a slanted hand you know now.');
  await showLetter({
    id: 'lou-1983',
    from: 'L.B.',
    body: [
      "Young'un. Fenwick's box was a bust, I hear. Figured.",
      "I watched the '83 tape once. Once was plenty. Kept it anyway, in the Biscuit, behind the cobbler pans.",
      "Here it is. Watch it with her. Not alone. Nobody ought to watch that one alone.",
    ],
  });
}

async function faBroadcast(): Promise<void> {
  cast([['grandma', 3, 5, 'down']]);
  await N("You hold up the tape. Gus's handwriting on the label: *ACW · OCT '83*. Grandma goes very still.");
  await S('grandma', "Close the door, chère. ...Put it in. I'd like to see it with somebody. Just once.");
  music('sad');
  await N('The VCR clicks. The Sportatorium, forty years younger. Two thousand people. The Velvet Hammers against the Copperhead Sisters.');
  await S('grandma', "The finish was supposed to be hers. 'B. turns on D.' She'd break my heart, they'd boo her six weeks, we'd make up at Homecoming.");
  await S('grandma', "And then New York would come back with more money, and she'd say no again. For me. So I changed one line.");
  await N('On the screen, young Birdie goes to the ropes for her cue. Young Dottie is already reaching for the belt.');
  await N('The belt comes down. It catches the ring post and breaks clean. The tracking ripples. The crowd on the tape goes silent.');
  await N("The camera finds young Dottie at the curtain, face wet, looking back at the ring. Her lips move.");
  await N("Beside you, old Dottie's lips move with her. The same two words, forty years apart, exactly in time.");
  await M('grandma', 'sad', 'Go, Bird.');
  await N('On the screen, the curtain closes. In Room 7, nobody says anything for a long time.');
  await S('grandma', "She was supposed to hate me and go. I booked it perfectly, chère. She just never read the finish.");
  const opts: { label: string; value: string }[] = [
    { label: 'Take her hand', value: 'hand' },
    { label: '"She stayed for you."', value: 'stayed' },
  ];
  if (done(G.flags, 'fa_gus')) opts.unshift({ label: '"She went after you. To the depot."', value: 'depot' });
  const c = await pick(null, opts);
  if (c === 'depot') {
    await M('grandma', 'surprised', '...What?');
    await N('You tell her. Gus. Two-fifteen in the morning. Both stop signs. Taillights on Route 9. Five minutes.');
    await M('grandma', 'sad', "Five minutes. I watched the dark out that window the whole way, chère. And she was in it.");
  } else if (c === 'hand') await N('She grips your hand hard, like a tag.');
  else await M('grandma', 'love', 'I know. I watched. Forty years of her staying.');
  await S('grandma', "Somebody has to tell her. Not me. If I walk into that office, I'll lose my words halfway to the desk.");
  await M('grandma', 'love', "You tell her, chère. You've got my timing. Use it.");
  G.flags['player_knows'] = true;
  heart('grandma', 30);
}

async function faBirdie(): Promise<boolean> {
  if (G.player.map !== 'birdie-office') await stage('birdie-office', 5, 6, 'up');
  cast([['birdie', 6, 3, 'down']]);
  await N('Burnt coffee. The Pencil behind her ear. Birdie looks up, sees your face, and sets the coffee down.');
  await S('birdie', "Uh-oh. That's a sit-down face. Sit down, then.");
  const how = await pick('How does Birdie learn the truth?', [
    { label: 'Tell her yourself. All of it.', value: 'tell' },
    { label: "Put the 1983 tape in her VCR. She's never watched it.", value: 'tape' },
    { label: 'Ask Lou and June to come sit with her.', value: 'witness' },
    { label: 'Not today.', value: 'later' },
  ]);
  if (how === 'later') {
    await S('birdie', "Then it'll keep. Most things do, around here. Go on, sugar.");
    exit('birdie');
    return false;
  }
  if (how === 'tell') {
    await N('You tell her. The hallway and the phone. The ring card. The whisper to Danny. The belt aimed at the post. The bus. The envelopes.');
  } else if (how === 'tape') {
    await S('birdie', "Gus's handwriting. I know what that is. I've never watched it. Not once.");
    await N('She watches it anyway. All of it. When young Dottie\'s lips move at the curtain, Birdie leans in until her glasses touch the screen.');
    await N('Then you tell her the rest. The hallway. The whisper to Danny. The bus. Forty years of envelopes.');
  } else {
    cast([['lou', 3, 5, 'right'], ['june', 8, 5, 'left']]);
    await N('Lou comes in with his hat in his hands. June comes in carrying a coffee pot, like armor.');
    await S('lou', "Birdie. I've mailed her the shows. Every Monday since '83.");
    await S('june', 'And I drove her to the bus. She made me promise not to let you follow.');
    await N("Then you tell her the rest. The hallway. The whisper to Danny. Why. Lou and June stay put, like witnesses.");
  }
  await N('When it is done, Birdie does not move. The clock on the wall is very loud.');
  await S('birdie', 'So there was no offer. No better deal. Nobody offered Dottie Dupree more.');
  await N('She stands. Her chair rolls back and hits the filing cabinet.');
  music('sad');
  await M('birdie', 'angry', 'She broke our belt so I would take a *contract?*');
  await M('birdie', 'angry', "A piece of paper with some fella's name on it in New York! I'd have torn it in half! She *knew* I'd tear it in half!");
  await M('birdie', 'angry', 'Who asked her? Fifteen years we decided everything together. Every finish. Every town. Every *meal!*');
  await M('birdie', 'angry', 'And the one time it mattered, she booked my whole life without asking. Didn\'t even put her own name on the card!');
  await N('She yanks the Pencil from behind her ear and throws it. It bounces off the corkboard and rolls under the desk.');
  await M('birdie', 'angry', 'Forty years I hated her! You know how much work that is? Hating somebody you would step in front of a train for?');
  const c = await pick(null, [
    { label: '"She did it because she loved you."', value: 'loved' },
    { label: 'Say nothing. Let her be angry.', value: 'quiet' },
    { label: '"You did the same for her."', value: 'same' },
  ]);
  if (c === 'loved') {
    await M('birdie', 'angry', "Don't. Don't you... I *know* that, sugar.");
    await M('birdie', 'sad', "That's the worst part. That's the part I can't get my arms around.");
  } else if (c === 'quiet') {
    await N("You let her shout. At the trophies, the window, the ceiling, at Dottie. You stay in your chair. You know when to stay down.");
  } else {
    await N('That stops her like a clothesline.');
    await M('birdie', 'sad', "...I did, didn't I. I stayed. I stayed so she'd have somewhere to come home to.", 'Lord. We are the same fool twice.');
  }
  await N('And then the anger runs out all at once, like a ring rope cut.');
  await N('Birdie Malone sits down on the floor of her office. Right on the carpet, back against the desk, seventy-four years old.');
  await M('birdie', 'sad', 'She was crying. At the curtain. Wasn\'t she.');
  await N('You nod.');
  await M('birdie', 'sad', 'I went to the depot, sugar. I was going to drag her back by that braid. Five minutes.', 'Five minutes. And forty years. And three blocks.');
  await N('She cries the way strong people do: all at once, with her whole body, like it was stored somewhere and the door finally gave.');
  const d = await pick(null, [
    { label: 'Sit down beside her on the floor', value: 'sit' },
    { label: 'Fish the Pencil out from under the desk', value: 'pencil' },
  ]);
  if (d === 'sit') await N('You sit beside her on the carpet. After a while her head tips onto your shoulder. The same height as someone else\'s, long ago.');
  else await N('You fish out the Pencil and hold it out. She takes it in both hands, like the only thing in the room that hasn\'t changed.');
  await S('birdie', '...She still take her coffee with two sugars?');
  await N('Chicory, you tell her. Two sugars.');
  await M('birdie', 'happy', "Stirs it counterclockwise. Like a dang heel.");
  await N("She laughs, wetly. It's the worst laugh you've ever heard, and the best.");
  await M('birdie', 'sad', "Don't tell her I asked.");
  await S('birdie', "Go home, sugar. I'm going to sit on this floor a while. It's a good floor. I laid it myself in '86.");
  G.flags['truth_revealed'] = true;
  G.flags['birdie_knows'] = true;
  sting('sad');
  heart('birdie', 50);
  exit('birdie', 'lou', 'june');
  return true;
}

async function faHavoc(): Promise<void> {
  const tonight = G.time.day === 27;
  if (!G.flags['birdie_knows']) {
    await N(tonight ? 'Harvest Havoc is over. Hay in the booth, pie everywhere.' : 'The morning after Harvest Havoc, there is still hay in the diner.');
    await S('lou', "Hay wagon. Every year, a hay wagon.");
    await N("Birdie keeps glancing at the door, like she's waiting for somebody she isn't expecting.");
    return;
  }
  await N(tonight ? "Harvest Havoc is over. In the back booth, Birdie's spot is empty. June keeps looking at it." : "Birdie didn't come to the back booth after Harvest Havoc. June mentions it twice before you've finished your coffee.");
  await S('june', 'First Saturday in forty years she didn\'t come in. Go find her, baby. I know where. So do you.');
  await stage('town', 56, 16, 'left', [['birdie', 55, 16, 'up']]);
  await N("Under the Evening Bell's window, in the dark, a short woman in a crimson blazer stands with her hands in her pockets.");
  await N('One light is on upstairs. Room 7. Behind you, the Sportatorium marquee is lit, every single bulb.');
  await S('birdie', 'Got as far as the steps. Three times.');
  await M('birdie', 'sad', "What do I even say, sugar? 'Hi, Dot. Got your message. Took a while.'");
  const c = await pick(null, [
    { label: '"Just say hi."', value: 'hi' },
    { label: '"She\'s frightened too."', value: 'scared' },
  ]);
  if (c === 'hi') await S('birdie', 'Hi. Huh. Forty years of words, and the one that fits is two letters long.');
  else await M('birdie', 'sad', 'Course she is. We always did get scared at the same time. Made us a good team.');
  await S('birdie', 'Not tonight. But soon. I promise you soon.');
  await N('Upstairs, the curtain in Room 7 moves. Just a little. Then it is still.');
  heart('birdie', 20);
  exit('birdie');
}

// ====================================================================== WINTER

async function wiMeeting(): Promise<void> {
  await N("Birdie is already in her coat. She's been wearing it since six, June says. She holds out her arm.");
  await S('birdie', 'Walk me over, sugar. My feet forget the way after the corner.');
  await stage('grandma-room', 5, 6, 'up', [['grandma', 3, 5, 'down'], ['birdie', 4, 6, 'up']]);
  music('theme:velvet');
  await N('Room 7. Winter light. Grandma sits by the window, braid half done, humming her waltz with one phrase missing.');
  await N('In the doorway, Birdie stops. You feel her stop, like a truck braking.');
  await N("Grandma looks up. For a long moment her face is a tape that won't track.");
  await M('grandma', 'love', "Bird. There you are. You're late.");
  await N('Birdie opens her mouth. Nothing comes. Then, carefully, the way you would catch a falling glass:');
  await S('birdie', "I know, Dot. I'm sorry. I got held up.");
  await S('grandma', "Help me with my braid, then. We're on third, and Agnes will never let me hear the end of it.");
  await N('Birdie crosses the room. Her hands shake. She takes the braid like it is 1979: three strands, and she knows where each one goes.');
  await N("Halfway down the braid, Grandma's shoulders change. She's back. All the way back.");
  await M('grandma', 'sad', '...Bernadette.');
  await S('birdie', 'Hi, Dot.');
  await S('grandma', 'You got old.');
  await M('birdie', 'happy', 'You got older.');
  await N('They laugh, and it is the same laugh. Fifteen years of sharing a locker room will do that.');
  const c = await pick(null, [
    { label: 'Step into the hall and give them the room', value: 'out' },
    { label: 'Stay by the door, quiet as furniture', value: 'stay' },
  ]);
  await N(c === 'out' ? 'You step into the hall and leave the door open a crack. Some things you hear anyway.' : 'You stay by the door, very still. June would be proud.');
  await S('birdie', 'I went to the depot, Dot. That night. Gus drove. The bus was pulling out.');
  await M('grandma', 'surprised', '...You came after me?');
  await S('birdie', "Called New York next morning and said no again. Had Hank change the lock on your locker. Your robe's still on the hook.");
  await M('grandma', 'sad', "I watched you on Lou's tapes every Saturday. I thought you stayed because you're a stubborn old mule.");
  await M('birdie', 'love', 'I *am* a stubborn old mule. I stayed in case you came home and needed somewhere to sit.');
  await N('Grandma reaches out. Birdie takes her hand. Crooked pinky hooks crooked pinky, like a tag.');
  await M('grandma', 'sad', "I'm sorry, Bird.");
  await S('birdie', "Hush, Dot. You don't get to apologize. You get to finish your braid.");
  await N('They finish the braid. Then they sit by the window, not talking, and watch the marquee come on, bulb by bulb. Every single one.');
  G.flags['hammers_met'] = true;
  heart('birdie', 40);
  heart('grandma', 40);
  exit('grandma', 'birdie');
}

/** Wrestler friends who could stand across the ring at Homecoming. */
export function partnerCandidates(): { id: string; label: string }[] {
  const pool = NPCS.filter((n) => n.wrestler && n.insider && !['birdie', 'grandma', 'lou', 'mothman'].includes(n.id));
  const spouse = pool.find((n) => rel(n.id).married);
  const top = pool.filter((n) => n !== spouse).sort((a, b) => hearts(b.id) - hearts(a.id)).slice(0, spouse ? 2 : 3);
  return [...(spouse ? [spouse] : []), ...top].map((n) => ({
    id: n.id,
    label: `${n.wrestler?.ringName ?? n.short}${n === spouse ? ' (your spouse)' : ` · ${hearts(n.id)}♥`}`,
  }));
}

export interface FinaleState {
  partner: string;
}
export const finaleState = () => ext<FinaleState>('finale', () => ({ partner: 'dex' }));

async function wiLastMatch(): Promise<void> {
  if (G.player.map !== 'birdie-office') await stage('birdie-office', 5, 6, 'up');
  cast([['birdie', 6, 3, 'down']]);
  await N("Birdie has the bottom desk drawer open. Inside, wrapped in a faded velvet sash: half a championship belt.");
  await S('birdie', "Forty years in that drawer, under the tax forms, where nobody would ever look. Including me.");
  await S('birdie', 'Dot and I talked. She has good days and foggy ones. She wants to spend the good ones in a ring.');
  await M('birdie', 'happy', 'One more, sugar. Homecoming. The rematch that never happened. The Velvet Hammers, one last time.');
  await S('birdie', 'And I want you across the ring. Somebody has to take the Encore. Might as well be family.');
  await S('birdie', "You know how it ends. We win. You lose. No swerves. We've had enough swerves for one lifetime.");
  const c = await pick(null, [
    { label: '"It would be an honor to lose to you."', value: 'honor' },
    { label: '"Is she ready?"', value: 'ready' },
  ]);
  if (c === 'honor') await M('birdie', 'love', "Best thing anybody ever said to me in this office. And I've been offered a lot of steaks.");
  else await S('birdie', "No idea. She forgets the date. She never forgets a hold. 'The body remembers,' she says. I'm betting the farm on it.");
  const cands = partnerCandidates();
  let partner = 'dex';
  if (cands.length) {
    await S('birdie', 'Now. Who stands in your corner? Pick somebody you trust to fall right.');
    partner = await pick('Your Homecoming tag partner:', cands.map((x) => ({ label: x.label, value: x.id })));
  }
  finaleState().partner = partner;
  await S('birdie', `${NPC_BY_ID[partner]?.short ?? 'Good'}. Good pick. Now come on. There's a locker that's waited long enough.`);
  await stage('lockers', 7, 7, 'up', [['birdie', 8, 4, 'up']]);
  await N('Birdie takes the fortieth key off her ring. Her hand is steady, which surprises both of you.');
  await N('The lock gives like it has been waiting. Inside: a plum velvet robe on a hook, with a train. Lavender, forty years old.');
  await M('birdie', 'sad', "Hello, Dot's robe.");
  await M('birdie', 'happy', "Marigold's going to have a conniption.");
  G.flags['reunion_set'] = true;
  G.flags['locker_opened'] = true;
  sting('reveal');
  toast(`Homecoming, Winter 27: the Velvet Hammers vs. {ring} & ${NPC_BY_ID[partner]?.short ?? 'partner'}.`);
  heart('birdie', 30);
  exit('birdie');
}

async function wiRobe(): Promise<void> {
  if (G.player.map !== 'tailor') await stage('tailor', 6, 7, 'up');
  cast([['marigold', 3, 5, 'right']]);
  await N("The plum robe stands on a mannequin. Marigold kneels at the hem with pins in their mouth. In a chair by the window: Velma Ruiz, ninety.");
  await N("Velma made the robe in 1981. She is supervising. Loudly.");
  await S('marigold', "Velma's pattern book had their measurements. And a note in the margin, in Dottie's handwriting. Fall of '83.");
  await M('marigold', 'sad', "'Let Birdie's out an inch. She'll be eating better in the big city.' I never knew why that made me so sad. Now I do.");
  await N("Velma taps the train with her cane. \"She tripped on it in '81,\" Velma says. \"Take it up an inch. She'll deny it.\"");
  await S('marigold', "Gideon's doing the braid from the '81 photo. June's bringing boots down off her top shelf. Hank's mending the belt.");
  await M('marigold', 'happy', "The whole town is sewing the same robe, {name}. I've never been part of anything this big.");
  heart('marigold', 30);
  exit('marigold');
}


async function spRadio(): Promise<void> {
  await N('The kitchen radio crackles on by itself, the way it does. WRSL 1340 AM, *The Gravel Pit*, Thaw Brawl week.');
  await S('gus', "Folks, it's Thaw Brawl week, so here's one from the vault. Spring of 1981. The Velvet Hammers, live on this very station.");
  await N('Hiss. A crowd, thin and far away. Then a voice like a velvet curtain coming down. Younger. Unmistakable.');
  await M('grandma', 'smug', "Thaw Brawl? Bird and I will be there. We're always there, chère. Where else would we be?");
  await N("Another voice cuts in, laughing, a little hoarse: \"Don't make promises on the radio, Dot.\" It's Birdie. Forty years younger.");
  await N('The clip ends. For a second, the most famous voice in Turnbuckle Alley says nothing at all.');
  await S('gus', '...Ahem. Sixty-two degrees. Lock your doors. The Mountain has not been seen since Saturday.');
}

async function suVanity(): Promise<void> {
  if (G.player.map !== 'sportatorium') await stage('sportatorium', 21, 11, 'up');
  cast([['hank', 22, 9, 'left']]);
  await N("In the corner of the Sportatorium, Hank is wiring a ring of bulbs around an old vanity mirror. Plumb supervises from a drop cloth.");
  await S('hank', 'Job for the Evening Bell. Room 7. Resident wants to see herself the way the crowd does.');
  const c = await pick(null, [
    { label: '"Who\'s paying for it?"', value: 'who' },
    { label: 'Hand her the next bulb', value: 'help' },
  ]);
  if (c === 'who') {
    await S('hank', "Customer asked me not to say.");
    await N('She screws in a bulb. Then another.');
    await S('hank', 'Customer wears a red jacket and chews cinnamon sticks. That is all I am saying.');
  } else {
    await N('You hand her bulbs, one at a time. She tests each one against her palm before it goes in.');
    await S('hank', "Every one of these has to work. I was told that twice. In a voice.");
  }
  heart('hank', 20);
  exit('hank');
}

async function wiContract(): Promise<void> {
  await N('Saturday. Before the bell, Gus steps into the ring with Old Thunder and a folding table Hank built for one purpose: to break.');
  await S('gus', 'Ladies and gentlemen, for the first time in forty years, for the Homecoming rematch... the contract signing!');
  await N('The Duchess walks out to boos so loving they sound like a hymn. The Commissioner follows, and the building stands.');
  await N("They sign. The plan: Birdie slams the Duchess's hand on the table, Hank pulls the pin underneath, the table explodes, chaos.");
  await N('Birdie slams. Nothing. She slams again. The table holds.');
  await N('Under the ring, Hank is crying too hard to find the pin. You can hear Plumb howling in sympathy.');
  await N("Birdie looks at the stubborn table. Then at the Duchess. Then she grins and grabs Old Thunder.");
  await S('birdie', 'Well, folks. Looks like even the furniture forgave her.');
  await N('The roof nearly comes off. Agnes stands up to boo, forgets halfway, and sits back down very confused. Then you sign.');
  heart('birdie', 20);
  heart('grandma', 20);
}

async function wiHouse(): Promise<void> {
  await N("A car crunches up the gravel. Birdie's, with the bad muffler. Birdie gets out, then comes around and opens the passenger door.");
  if (G.player.map !== 'farm') await stage('farm', 10, 12, 'down');
  const p = playerTile();
  cast([['grandma', p.x - 1, p.y + 1, 'up'], ['birdie', p.x + 1, p.y + 1, 'up']]);
  await N("Grandma steps out and stands at the end of her own yard for the first time in forty years. She doesn't say anything for a while.");
  await M('grandma', 'love', "You kept it. You cleared the weeds. Look at that ring, chère. That's where we built the Encore. Five in the morning.");
  await S('birdie', 'Come on, Dot. One run-through. The kid will be the pudding cup.');
  await N("You are the pudding cup. The Curtsy, the cradle, the legs, the hands across your chest. She doesn't miss a single beat.");
  await N("Afterward Grandma goes inside alone. You find her at the wall calendar. It has said October 1983 since the night she left.");
  await N('She takes it down. Turns the pages, all forty years of them, one by one, until it reads today.');
  await M('grandma', 'happy', 'There. Now we can get going.');
  heart('grandma', 30);
  G.flags['calendar_turned'] = true;
  exit('grandma', 'birdie');
}

async function wiEve(): Promise<void> {
  await N('Homecoming Eve. The whole town is getting ready for one match.');
  await N("Agnes digs her 1983 sign out of the attic: VELVET HAMMERS 4-EVER. She has crossed out EVER and written ALWAYS.");
  await N('At the creek, Pip asks Sweet Lou who the Velvet Hammers are. Lou tells him for an hour. Every word of it is the kayfabe version, and every word is true.');
  await N("Coach Patty buys a front-row ticket \"for research.\" Clementine has already written tomorrow's headline. No question mark.");
  await N("In Room 7, Gideon braids a crown from a 1981 photo while Birdie pretends to read the paper. It's upside down.");
  await N("And on June's highest shelf, a pair of white ring boots comes down off the shelf for the first time in forty years.");
  sting('story-beat');
}

async function faPageSix(): Promise<void> {
  if (G.player.map !== 'birdie-office') await stage('birdie-office', 5, 6, 'up');
  cast([['birdie', 6, 3, 'down']]);
  await N('Birdie has the bottom desk drawer open. She hands you a yellowed newspaper clipping, two inches long, soft as cloth.');
  await N('*The Turnbuckle Tattler, page six, November 1983:* "A national company has withdrawn its offer to a local star, who declined a second time."');
  await S('birdie', 'I had Lavinia run it small. Page six, under the church suppers. Somewhere she would only find it if she was looking.');
  await M('birdie', 'sad', "She never was looking. She was too busy not looking, same as me. Forty years of two people not looking.");
  await S('birdie', 'Take it to her. No. Don\'t.', '...Yes. Take it. Tell her I said no twice. Tell her the second one was louder.');
  G.flags['page_six'] = true;
  heart('birdie', 20);
  exit('birdie');
}

async function wiCurtsy(): Promise<void> {
  cast([['grandma', 3, 5, 'down']]);
  await M('grandma', 'happy', "Chère! Stand up. I'm going to teach you something nobody else knows. My Curtsy.");
  await N('She taught you the Curtsy last Sunday. And the Sunday before. This is the third Sunday.');
  const c = await pick(null, [
    { label: 'Let her teach it to you again', value: 'again' },
    { label: '"You showed me last week, remember?"', value: 'remind' },
  ]);
  if (c === 'again') {
    await N('You let her. She sinks into a slow, perfect bow, hooks your ankle, and you land on the bed, and she laughs like it is the first time.');
    await N('In the doorway, Birdie leans on the frame, holding two coffees. She catches your eye and mouths: *third time.* You nod. She grins.');
    heart('grandma', 30);
  } else {
    await M('grandma', 'sad', 'Did I? ...Then you know it. Good.');
    await M('grandma', 'happy', 'Show me, then. Slower. A Curtsy is a bow first and a trip second. Manners, then violence.');
    heart('grandma', 20);
  }
  await S('grandma', "When you do it on a Saturday, I'll stand up in the front row and curtsy back. That's a promise. My knees signed it.");
}

export const SCENES: Record<string, SceneFn> = {
  fa_page_six: faPageSix,
  wi_curtsy: wiCurtsy,
  sp_radio: spRadio,
  su_vanity: suVanity,
  wi_contract: wiContract,
  wi_house: wiHouse,
  wi_eve: wiEve,
  sp_mural: spMural,
  sp_locker: spLocker,
  sp_agnes: spAgnes,
  sp_lou: spLou,
  sp_thawbrawl: spThawBrawl,
  su_rumor: suRumor,
  su_june: suJune,
  su_arrival: suArrival,
  su_sami: suSami,
  su_room7: room7,
  su_corner: suCorner,
  su_fury: suFury,
  mem_1: mem1,
  mem_2: mem2,
  mem_3: mem3,
  mem_4: mem4,
  mem_5: mem5,
  fa_lou: faLou,
  fa_doc: faDoc,
  fa_gus: faGus,
  fa_hank: faHank,
  fa_lou_copy: faLouCopy,
  fa_broadcast: faBroadcast,
  fa_birdie: faBirdie,
  fa_havoc: faHavoc,
  wi_meeting: wiMeeting,
  wi_last_match: wiLastMatch,
  wi_robe: wiRobe,
};
