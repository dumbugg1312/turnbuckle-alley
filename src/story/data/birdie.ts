/**
 * Birdie Malone: warm, blunt, "sugar", carny-wise, protective and funny.
 * Commissioner in public, the real boss in her office. Spoken lines stay under
 * 140 characters. {name} is the player's first name; {opp} / {opp.real} appear
 * only where the engine supplies an opponent. Tone rules: src/story/types.ts.
 */
import type { BirdieData } from '../types';

export const BIRDIE: BirdieData = {
  // ------------------------------------------------------------------ verdicts
  approve: [
    `Sugar, that's the silliest thing I ever heard. Do it.`,
    `Well, butter my biscuit. That'll draw.`,
    `I saw that one work in '79 and flop in '81. Make it '79.`,
    `Go on, then. Don't make me regret it in front of Agnes.`,
    `That's a money idea. Don't tell anybody I said money.`,
    `Honey, I got goosebumps, and I'm wearing a cardigan.`,
    `Yes. A thousand times yes. Now go before I change my mind, and my mind is very changeable.`,
    `Book it, {name}. I'll bring the thermos.`,
    `That's got a beginning, a middle and an end. You'd be amazed how rare that is.`,
    `I'd pay a dollar for that. Folks'll pay two. Don't tell Hank, she'll want a raise.`,
    `Now that's a story. Gus is gonna cry into his headset.`,
    `Mm-hm. Mm-hm! Print it, pin it to the corkboard, and keep it away from Jobber.`,
    `I've got nothing, sugar. Not a note. It's clean as a whistle. Go.`,
    `Well, shoot. That'll have Clementine writing in capital letters.`,
  ],

  tweak: {
    draw: [
      `Love it. Cut it to four weeks, sugar. Folks got jobs, and a short story draws better than a long one.`,
      `It's a good idea in the wrong size. Make the stakes a little bigger and I'll put my name on it.`,
      `Half of this will draw, honey. Cut the other half and we're in business.`,
    ],
    card_fit: [
      `Not on this card, honey. It's a steak at a pancake breakfast. Move it to the show where it fits.`,
      `Good story, wrong week. Slide it down a slot and I'll clear the room for it.`,
      `Keep the twist, swap the opener. This crowd needs a warm-up before it feels that much.`,
    ],
    roster_wellbeing: [
      `Good bones. Give somebody else a turn, or they'll rearrange my office out of spite.`,
      `Somebody in that cast is running on fumes. Rest 'em one week and I'll say yes.`,
      `Spread the butter, sugar. Same two names on every card and the rest of the roster starts knitting sad little scarves.`,
    ],
    ornery_line: [
      `It's nearly ornery. Sand off the mean edge and it's a story.`,
      `A villain can bark. They just can't bite. Swap the cruelest line for a funnier one.`,
      `We do ornery, not mean. Fix the one line where somebody's feelings get stepped on.`,
    ],
    rank: [
      `Ambitious. Take the middle step first and I'll sign the rest later.`,
      `You're reaching, kid, and I like that. Pull in two inches and it's yours.`,
      `That's a main-event idea at an opener's desk. Trim it to what your rung can carry.`,
    ],
    venue: [
      `Not at the VFW, honey. That ceiling's nine feet. Somebody'll ladder straight into a ceiling fan.`,
      `Wednesday crowd can't take that much feeling before bingo. Move it to Saturday.`,
      `That one wants the Sportatorium and the lights. Put it there and I'll hold your coat.`,
    ],
    fatigue: [
      `Switch the villain. Same face three weeks running and the library's getting complaints.`,
      `Folks are tired of that finish, sugar. Dress it differently and I'll buy it.`,
      `This crowd's seen that one three times this month. Change one thing, anything, even the hat.`,
    ],
    prop_unready: [
      `Keep the twist, lose the cage. Hank ain't finished the door.`,
      `Hank needs two more weeks for that prop. Start without it, or start later. Either's fine.`,
      `That table's still in the shop, honey. Rework the finish so it doesn't need it.`,
    ],
    main_story: [
      `Good idea. But I've got something big simmering for the main event, and I need this out of its way. Slide it a week.`,
      `Slide it one week, sugar. I've got a thing on the stove for Saturday and I don't want two pots boiling.`,
      `Keep it. Just keep it out of the main event's way. That slot's spoken for.`,
    ],
  },

  veto: {
    draw: [
      `No, sugar. The crowd wouldn't cross the street for that, and that's arithmetic, not an insult. Bump the stakes and bring it back.`,
      `It won't draw, honey. Give folks somebody to love and somebody to boo, and then we'll talk.`,
    ],
    card_fit: [
      `That one doesn't belong on this card, and I can't make it. Find it a card where it fits and I'll sign it.`,
      `I love it, I just can't put it here. Wrong week, wrong crowd, wrong chair. Try again after the next show.`,
    ],
    roster_wellbeing: [
      `I can't book that. Somebody in that cast needs a rest and a hot meal, in that order. Come back when they've had both.`,
      `That's one story too many for one wrestler. Spread the butter, then ask me again.`,
    ],
    ornery_line: [
      `No, sugar. That's mean, and we don't do mean. We do ornery. Find the funny version and I'll sign it.`,
      `Somebody's heart gets stepped on in that one. Fix it so nobody's feelings are the villain, then bring it back.`,
    ],
    rank: [
      `You're not there yet, kid. You will be. Keep this one in your tin.`,
      `That's a bigger chair than yours, sugar. Earn a few more cheers and I'll slide it over.`,
    ],
    venue: [
      `Can't be done at the VFW. Not with that ceiling, those chairs and that bingo. Try the Sportatorium.`,
      `That wants a bigger room or a smaller idea. Pick one, honey, and I'll back you either way.`,
    ],
    fatigue: [
      `We ran that one in April. This crowd's got memories like elephants and purses like Agnes. Change the finish and bring it back.`,
      `Folks are worn out on that finish. Give it a month and it's brand new again.`,
    ],
    prop_unready: [
      `Hank hasn't built it, and Hank's not building it by Saturday. Pick something Hank can build.`,
      `No prop, no show. Ask Hank nicely, bring her a sandwich, and come back.`,
    ],
    main_story: [
      `Not this week, honey. There's a big one coming, and everything's got to stay out of its way. Hold it, and I'll tell you when.`,
      `I can't say why, sugar, but trust me. Park this one. It'll keep, and I'll make it worth the wait.`,
    ],
  },

  notYet: [
    `Oh, I like this one too much to waste it. Gold star. Ask me again at Harvest Havoc.`,
    `Not yet. Put it in your tin. It'll keep.`,
    `Honey, it's a beauty, and it deserves a bigger stage. Hold it till the big show and we'll light it up.`,
    `Gold star, kid. Right idea, wrong time. I'm pinning it to my corkboard so I don't lose it.`,
    `Not yet, sugar. But I'm not saying no. I'm saying "soon," and I say it carefully.`,
  ],

  // Birdie gives in after a good argument.
  pleaWin: [
    `Well, now. You've been listening.`,
    `Huh. You're right, sugar. I hate when that happens. Do it.`,
    `That's the real reason, and you found it. Gold star, kid. Go on.`,
    `You argue like I used to. Fine. Fine! It's yours.`,
    `Look at you, reading the room like you built it. Done.`,
  ],

  // Birdie holds firm after an argument that misses her real concern. No penalty.
  pleaLose: [
    `That's a good argument, honey, just not for this problem. I like that you made it.`,
    `Nice try, kid. I love being argued with. I just happen to be right today.`,
    `I hear you. I do. But that's not the knot I'm stuck on. Keep looking.`,
    `Good argument, wrong lock. I'm holding firm, and I'm smiling about it.`,
    `No sale, sugar. You've got a good head on you. This just isn't the day it wins.`,
  ],

  // ------------------------------------------------------------------ promotions
  promotions: {
    opener: {
      publicLines: [
        `Folks, by the authority of the Commissioner, {name} has earned the opening match. Please give it a warm welcome. Agnes, that means you.`,
        `The first match of the night sets the tone for every one after it. Be kind, be loud, and be on time.`,
      ],
      note: `My office, Thursday. Bring a donut.`,
      scene: [
        { who: 'narrator', text: `Birdie's office smells like coffee, old tape, and the cardigan that lives on the back of her chair.` },
        { who: 'birdie', text: `Come in, sugar. Shut the door. The draft's got opinions.`, mood: 'happy' },
        { who: 'birdie', text: `I watched you from the curtain Saturday. You've got something, and you didn't even know it.`, mood: 'smug' },
        { who: 'player', text: `Honestly? I was mostly trying not to trip.`, mood: 'surprised' },
        { who: 'birdie', text: `That's all anybody does the first year, honey. Tripping beautifully is the whole job.`, mood: 'happy' },
        { who: 'narrator', text: `She slides a small card across the desk. It reads OPENER in Hank's careful lettering.` },
        { who: 'birdie', text: `You open the show now. That makes you the first thing the folks see. Make 'em glad they came.`, mood: 'neutral' },
        { who: 'player', text: `I will. Thank you, Birdie.`, mood: 'happy' },
        { who: 'birdie', text: `Don't thank me. Thank the crowd. And Hank, who made that card on her lunch break.`, mood: 'neutral' },
        { who: 'birdie', text: `Now go on. And don't tell Gus I got misty. He'll put it on the radio.`, mood: 'love' },
      ],
    },

    undercard: {
      publicLines: [
        `Ladies and gentlemen, the Commissioner has moved {name} up the card. Your applause is requested. Your folding chairs are not.`,
        `A new name on the undercard, folks, and a very old rule: cheer first, ask questions later.`,
      ],
      note: `Stop by the office. Sit in the good chair.`,
      scene: [
        { who: 'narrator', text: `The office is a little tidier than last time. Someone has dusted the trophy shelf.` },
        { who: 'birdie', text: `Sit. Not there, that's Jobber's chair. Don't ask.`, mood: 'neutral' },
        { who: 'birdie', text: `Remember when you couldn't find the curtain? Now the crowd finds you.`, mood: 'happy' },
        { who: 'player', text: `It's strange hearing my name chanted back at me.`, mood: 'surprised' },
        { who: 'birdie', text: `It's the best sound there is. Louder than a bell and kinder than a paycheck.`, mood: 'happy' },
        { who: 'narrator', text: `She taps the corkboard. A pin with the player's name sits just a little higher than it used to.` },
        { who: 'birdie', text: `Undercard. You pick your own opponent now, within reason. Pick somebody who makes you better.`, mood: 'neutral' },
        { who: 'birdie', text: `And pick somebody you'd be proud to lose to some night. That's how you know it's the right somebody.`, mood: 'smug' },
        { who: 'player', text: `I'll remember that.`, mood: 'neutral' },
        { who: 'birdie', text: `I know you will. That's why you're up here.`, mood: 'love' },
        { who: 'narrator', text: `She pours two cups of coffee without asking, and neither of them drinks it for a while.` },
      ],
    },

    midcard: {
      publicLines: [
        `Folks, the Commissioner has promoted {name} to the midcard. That's where the crowd starts to love you, so brace yourselves.`,
        `From the middle of the card, the ACW Commissioner salutes {name}. She'd salute louder, but her coffee's getting cold.`,
      ],
      note: `Office, nine sharp. Wear something you can be proud in.`,
      scene: [
        { who: 'narrator', text: `It's raining on the Sportatorium roof, and the office window is fogged at the edges.` },
        { who: 'birdie', text: `Come in out of that. I put the kettle on, and I put a donut aside. Don't tell Hank.`, mood: 'happy' },
        { who: 'birdie', text: `When I first sat behind this desk, the chair was too big. I put a phone book under me for a year.`, mood: 'smug' },
        { who: 'player', text: `A phone book?`, mood: 'surprised' },
        { who: 'birdie', text: `Yellow pages, sugar. Best seat in the house. I learned the whole town off the back of those pages.`, mood: 'happy' },
        { who: 'birdie', text: `Midcard's where the folks start to love you. It's also where it starts costing something. Saturdays. Sundays. A knee or two.`, mood: 'neutral' },
        { who: 'player', text: `Is it worth it?`, mood: 'neutral' },
        { who: 'birdie', text: `Every time. Every single time. You'll know the first night somebody makes a sign for you.`, mood: 'love' },
        { who: 'narrator', text: `She pushes a mug across the desk. Steam curls past a photograph of an empty ring, its ropes still swaying.` },
        { who: 'birdie', text: `You're not a kid anymore, {name}. You're a draw. Act like it, and keep acting like a kid, in the good ways.`, mood: 'neutral' },
        { who: 'player', text: `I'll try to do both.`, mood: 'happy' },
        { who: 'birdie', text: `That's the whole trick, honey. Drink your tea.`, mood: 'love' },
      ],
    },

    main: {
      publicLines: [
        `Ladies and gentlemen, the Commissioner is proud to announce that {name} is headed for the main event. Hank, put the name on the marquee.`,
        `A main-event name has been added to the Commissioner's list, and the Commissioner has ordered the popcorn extra warm.`,
      ],
      note: `Office, after the show. Don't bring Gus. He cries.`,
      scene: [
        { who: 'narrator', text: `The show is over, the lights are down, and the office is lit by one lamp and the glow of the corkboard.` },
        { who: 'birdie', text: `Shut the door, {name}. I'm going to say something once, and if you repeat it I'll deny it.`, mood: 'neutral' },
        { who: 'birdie', text: `I've watched a lot of folks walk through that curtain. Most are good. Some are great. You're something else.`, mood: 'smug' },
        { who: 'player', text: `What do you mean?`, mood: 'surprised' },
        { who: 'birdie', text: `You make the back row feel like the front row. I can't teach that. I just have to get out of its way.`, mood: 'love' },
        { who: 'narrator', text: `She takes off her reading glasses and polishes them on her cardigan, though they are already clean.` },
        { who: 'birdie', text: `The main event's a lot of weight. Not the match. The weight of everybody's hope for the whole night. It sits right here.`, mood: 'sad' },
        { who: 'player', text: `How do you carry it?`, mood: 'neutral' },
        { who: 'birdie', text: `Badly, sugar, for a long time. Then with help. Don't carry it alone. That's lesson one and lesson two.`, mood: 'neutral' },
        { who: 'birdie', text: `Hank's painting your name on the marquee tomorrow. She asked me to tell you the letters are very big.`, mood: 'happy' },
        { who: 'player', text: `Thank you, Birdie. I mean it.`, mood: 'love' },
        { who: 'birdie', text: `I know you do. Now go home. Eat something that isn't a donut. Tomorrow you're a headliner.`, mood: 'love' },
      ],
    },

    assistant: {
      publicLines: [
        `Commissioner's orders: {name}, my office. Bring a donut.`,
        `Would {name} please report to the Commissioner's office at once? The donut is optional. The donut is not optional.`,
      ],
      note: `My office. Bring a pen and an appetite for paperwork.`,
      scene: [
        { who: 'narrator', text: `The office smells like coffee and fresh paper. On the desk sits a clipboard, with a pen tied to it by a long, loopy string.` },
        { who: 'birdie', text: `Sit down, sugar. I've got something to hand you, and it's heavier than it looks.`, mood: 'neutral' },
        { who: 'narrator', text: `She holds up the clipboard. The paper says WEDNESDAY in her tidy, slanting hand, over a column of empty lines.` },
        { who: 'birdie', text: `That's the VFW show. Every Wednesday, start to finish. You book it, you run it, you answer to the folks.`, mood: 'neutral' },
        { who: 'player', text: `All of it? Without asking you?`, mood: 'surprised' },
        { who: 'birdie', text: `Without asking me. I'll be in the back with a thermos, pretending I'm not watching.`, mood: 'smug' },
        { who: 'birdie', text: `Saturdays are still mine. We're not there yet. But Wednesdays are yours, and I'll thank you not to wreck 'em.`, mood: 'neutral' },
        { who: 'birdie', text: `One rule. Just one. Bingo starts at nine sharp. I don't care if it's the match of the century. Dolores has a jackpot.`, mood: 'angry' },
        { who: 'player', text: `Nine sharp. Got it.`, mood: 'happy' },
        { who: 'birdie', text: `Say it back to me on Thursday, when you're tired and the main event ran long.`, mood: 'smug' },
        { who: 'narrator', text: `She slides the clipboard across the desk and gives it a small, approving pat.` },
        { who: 'birdie', text: `Go on, then. Show me what you've got. And don't make me regret it in front of Agnes.`, mood: 'love' },
      ],
    },

    pencil: {
      publicLines: [
        `The Commissioner wishes to see {name} in her office tonight, after the show. The lights will be on.`,
        `Folks, the Commissioner has an announcement, and it's a private one. {name}, my office.`,
      ],
      note: `Office, after the show, once everybody's gone. Come alone.`,
      scene: [
        { who: 'narrator', text: `It's late. The Sportatorium is empty, and the only light left in the building comes from the office window.` },
        { who: 'narrator', text: `Birdie sits at her desk in her cardigan, her glasses pushed up into her hair. The corkboard behind her is crowded with pins and index cards.` },
        { who: 'birdie', text: `Close the door, sugar. Sit. Don't touch the board. I'll know.`, mood: 'neutral' },
        { who: 'birdie', text: `I've done this job with a pen, then a pencil, then a bigger pencil. And now I'm down to this.`, mood: 'neutral' },
        { who: 'narrator', text: `She opens a drawer and takes out a carpenter's pencil, barely two inches long, worn down on one side, the paint long gone.` },
        { who: 'birdie', text: `It's got teeth marks in it. Those are mine. Get your own.`, mood: 'smug' },
        { who: 'player', text: `Birdie... I can't take that from you.`, mood: 'sad' },
        { who: 'birdie', text: `You're not taking it. I'm lending it. Indefinitely. The difference is I get to complain about how you use it.`, mood: 'happy' },
        { who: 'narrator', text: `She slides it across the desk. When the player reaches for it, her fingers stay on it. Neither of them says anything. The clock ticks.` },
        { who: 'narrator', text: `Then, slowly, she lets go.` },
        { who: 'birdie', text: `There. That's how it's done. It didn't hurt as much as I thought.`, mood: 'love' },
        { who: 'birdie', text: `The board's yours now, {name}. Every pin, every card, every ridiculous idea. Book it. Book all of it.`, mood: 'love' },
      ],
    },

    owner: {
      publicLines: [
        `Folks, the Commissioner has a few words for {name}, and they will take all night. Please enjoy the bingo.`,
        `Commissioner's orders: {name}, to my office, with your good handwriting. And a donut.`,
      ],
      note: `Office, one last time as mine. Bring nothing but yourself.`,
      scene: [
        { who: 'narrator', text: `Morning light, for once. Birdie's office looks bigger without the usual stacks of paper.` },
        { who: 'narrator', text: `On the desk sits a heavy iron ring crowded with keys of every size. A tag on it reads FORTY, in Hank's careful script.` },
        { who: 'birdie', text: `Forty keys, {name}. The Sportatorium, the VFW, the ring shed, the radio booth, the diner's back door, and thirty-five I'm not sure about.`, mood: 'smug' },
        { who: 'player', text: `Thirty-five you're not sure about?`, mood: 'surprised' },
        { who: 'birdie', text: `Folks handed 'em to me over the years, and I never asked what they opened. You'll find out. It's half the fun.`, mood: 'happy' },
        { who: 'birdie', text: `It's yours now, sugar. The books, the buildings, the Saturdays, and the folks. It was never really mine. I just kept the lights on.`, mood: 'sad' },
        { who: 'narrator', text: `She lifts the ring and, one at a time, works a single key loose. It is small, brass, and a little crooked.` },
        { who: 'birdie', text: `I'm keeping this one.`, mood: 'neutral' },
        { who: 'player', text: `Which door is that?`, mood: 'neutral' },
        { who: 'birdie', text: `The Sportatorium side door. I like to come in the way I always did. Quietly, and a little early.`, mood: 'love' },
        { who: 'narrator', text: `She sets the ring down in front of the player and folds her hands in her lap, like someone who just put down something heavy.` },
        { who: 'birdie', text: `Go on. Lock something up. See how it feels.`, mood: 'happy' },
      ],
    },
  },

  // ------------------------------------------------------------------ Birdie's two cents
  twoCents: {
    good: [
      `Well, it's your pencil. And it's a good card, sugar. I'd say it twice, but I have a reputation.`,
      `That's a card with a beginning, a middle and an end. You'd be surprised how rare that is.`,
      `I'd buy a ticket. And I get in free.`,
      `Folks'll talk about this one on the drive home. Good. That's the whole job.`,
      `Mm. No notes. I'm as surprised as you are.`,
    ],
    weakOpener: [
      `That opener's got all the fizz of a flat soda, sugar. Folks decide in the first ten minutes if they like us.`,
      `Start the show with something that moves. Right now it starts like a tractor in January: slowly, and with feeling.`,
      `Open with a hot match, honey. The popcorn's still warm and so's the crowd.`,
      `Nobody ever left over the second match. But I've watched 'em make up their minds during the first.`,
    ],
    flatMain: [
      `Main event's quieter than a church mouse at a bake sale. Give 'em something to scream about.`,
      `Where's the big finish, sugar? A main event should end like a door slamming, not a door clicking.`,
      `This main event's polite. Polite doesn't sell tickets. Ornery sells tickets.`,
      `That headliner won't send anybody home hoarse. Add a stake, add a twist, add something with a hat.`,
    ],
    noVillains: [
      `Where's the ornery? No villains on this card, and a hero needs somebody to be heroic at.`,
      `It's all good guys, honey. Nobody to boo. You're asking the crowd to cheer into a pillow.`,
      `I love a nice person. I don't love a card with only nice people on it. Bring in some trouble.`,
    ],
    noHeroes: [
      `All villains and no hero. That's not a show, that's a mood. Give the folks somebody to cheer.`,
      `Who do the kids root for, sugar? Somebody's got to wear the white hat. Even if it's a cardboard hat.`,
      `Too many scowls, not enough smiles. Add one good guy before the bell.`,
    ],
    repetitive: [
      `Same faces, same finishes. I've seen this card, sugar. I saw it last Saturday.`,
      `Switch it up, honey. Folks can only watch the same hold so many times before they start naming it.`,
      `Variety, {name}. It's the spice of everything. Even bingo.`,
    ],
    empty: [
      `That card's got more holes than a bowling alley. Fill 'em in before Jobber moves into the gaps.`,
      `Book a match, sugar, any match. A card with nothing on it is just a very expensive poster.`,
      `An empty card is a blank check, and I don't like writing 'em. Fill it.`,
    ],
  },

  // ------------------------------------------------------------------ booth lines
  huddle: [
    `Pull up a chair, sugar. Something's limping, and I think you know what. Let's fix it before the folks notice.`,
    `Okay. Story's wobbling. Deep breath. We've saved worse with less and a donut.`,
    `Huddle up. First rule: nobody panics. Second rule: somebody brings coffee.`,
    `Tell me what you're seeing. Then I'll tell you what I'm seeing. Then we'll pretend we saw the same thing.`,
    `I've seen this before, and it's fixable. Usually with something small. Let's find the small thing.`,
  ],

  flopTease: [
    `Crowd's got that glassy look, sugar. I'm not saying it's a flop. I'm saying keep your coat on.`,
    `That story's getting quieter. I like quiet at the library, not at the Sportatorium.`,
    `Folks stopped booing, honey. That's when you worry. A good boo is a love letter.`,
    `I'm hearing a lot of polite clapping. Polite clapping is a story deciding whether to stay.`,
    `Check the back row, {name}. They're looking at their watches. That's a weather report.`,
  ],

  extend: [
    `That one's got legs, sugar. Add a chapter. Folks want more and I want to give it to 'em.`,
    `The crowd's not done with this story. Give 'em another week or two. Hold the leash short.`,
    `I'd keep going, honey. The room's leaning in, and you don't pull the rug on a leaning room.`,
    `Extend it. Take two more weeks. Take three. I'll tell Hank to buy more tape.`,
  ],

  offScript: [
    `That wasn't the finish, sugar.`,
    `Well. That's not what we wrote. The crowd loved it. Don't do it again. Do it again.`,
    `Somebody went off the napkin. It's okay. We'll make it part of the plan, and nobody will know.`,
    `That's not on the card. Gus is sweating, Mo's squinting, and I'm smiling. Walk it back into the story.`,
  ],

  // ------------------------------------------------------------------ after the show
  afterPutOver: [
    `That's how you lose, sugar. {opp} owes you a pie, and I'm making sure they pay up.`,
    `You made {opp} look like a million bucks. Now go make yourself look like two.`,
    `Nice job handing {opp} the night. The folks noticed. I noticed. Hank noticed, which is saying something.`,
    `{opp} told me you're a pro. I told {opp} I know. That's how respect gets made.`,
    `You took that like a champ. Nobody ever lost better.`,
    `I'm proud of you, kid. Losing well is harder than winning, and nobody claps for it, so I'm clapping.`,
    `{opp} will remember tonight. So will I. Get some rest.`,
    `Put somebody over and the locker room remembers it for years. That kind of thing can't be bought.`,
  ],

  afterWin: [
    `Nice win, {name}. Don't let it go to your head. There's a lot of Saturday left.`,
    `You won it clean, sugar. Gus is still talking about it, and Gus doesn't talk, he narrates.`,
    `That's what winning looks like. Now remember what losing looks like, and be kind.`,
    `The folks loved that. I loved that. Don't tell anyone I used the word loved.`,
    `A win's a good thing to have. A win with a handshake is a great thing to have. You had both.`,
    `You made it look easy. It wasn't. We both know. Have a donut.`,
  ],

  filledHoles: [
    `I filled the holes in your card, sugar. Don't thank me. Just don't ask what's in the second slot.`,
    `Your card had gaps. I patched 'em. If something looks odd, that was me.`,
    `Birdie's Patch Service strikes again. You're welcome. Check the middle match.`,
    `A card with holes is a card with opinions. I gave it some. Look it over.`,
  ],
};
