/**
 * Personalities: the 17 traits and every insider's story profile.
 * Design: docs/STORYLINES.md §6 (scoring, traits, table 6.3) and docs/CAST.md (who people are).
 *
 * Voice registers:
 *   - wants / opener / signoff / booth / barks / redLines / spins: INSIDER voice (the back
 *     booth, the locker room, Birdie's office). Shop talk is fine here.
 *   - nudges: PUBLIC. 100% kayfabe-safe and harmless to overhear. *Asterisks* are narration
 *     (rendered as red emphasis). La Mariposa never speaks in public (gestures + Abuela Celia).
 *     The Mothman never speaks anywhere: notes, porch lights and narration only.
 * Placeholders allowed in lines spoken to the player: {name}, {ring}.
 */

import type { Personality, TraitDef, TraitId } from '../types';

// ------------------------------------------------------------------ traits

export const TRAITS: Record<TraitId, TraitDef> = {
  vain: {
    id: 'vain',
    name: 'Vain',
    weights: { spotlight: 2, spectacle: 2, gear: 2, entrance: 1, humiliation_light: -2, hair: -3, mess: -2 },
    barks: {
      love: [
        "Oh, that's a LOOK. Somebody call Marigold.",
        "Spotlight, sequins, and me in the middle? Yes. Obviously yes.",
        "Finally, a card that understands my good side. It's all of them.",
      ],
      fine: [
        "Fine. I'll make it glamorous. That's my burden.",
        "Acceptable, if the lighting's flattering.",
        "I can work with it. I can work with anything that has a mirror nearby.",
      ],
      counter: [
        "Close. Now turn the embarrassment into a makeover.",
        "What if it ended in a glamour moment instead? Everybody wins. Mostly me.",
        "Love the bones. Needs more sparkle.",
      ],
      softNo: [
        "Messy? On camera? With my pores?",
        "That card is a bad photo waiting to happen.",
        "I'd rather not be humiliated where people can see. Or anywhere, really.",
      ],
    },
  },

  anxious: {
    id: 'anxious',
    name: 'Anxious',
    weights: { rehearsed: 2, comedy: 1, whimsy: 1, improv: -2, hardcore: -2, cage: -2, live_mic: -2, high_risk: -1 },
    barks: {
      love: [
        "Rehearsed, short, and nobody improvises? I could cry. Happily.",
        "Oh good, a plan. I love a plan. Can we walk it twice?",
        "That I can do in my sleep. Which is good, because I won't be sleeping.",
      ],
      fine: [
        "Okay. Okay. As long as we rehearse it.",
        "Fine. Can we walk through it Friday? And Saturday morning?",
        "I can do that. Breathing. I'm breathing.",
      ],
      counter: [
        "Could we add a rehearsal beat first? Just one. Two.",
        "What if it were a little shorter? Same story, fewer chances to panic.",
        "Close. Can we script the scary part?",
      ],
      softNo: [
        "Live and unrehearsed? My hands are sweating just holding the card.",
        "A cage? I'd need a paper bag. Possibly two.",
        "That's a lot of improvising. I don't improvise. I prepare.",
      ],
    },
  },

  proud: {
    id: 'proud',
    name: 'Proud',
    weights: { title: 2, legacy: 2, clean_finish: 2, mat_classic: 1, humiliation_light: -2, schmozz: -1, comedy: -1 },
    barks: {
      love: [
        "A title on the line and a clean finish. That's how it should be done.",
        "Now that means something. I'll wear it well.",
        "Legacy. Good. Let's make it worth remembering.",
      ],
      fine: [
        "Fine. I'll make it matter.",
        "Acceptable. I'll win it the right way.",
        "That works, as long as I earn it.",
      ],
      counter: [
        "Raise the stakes. Make it a title. Then I'm in.",
        "What if there's a rematch clause? I don't lose twice.",
        "Close. Give me a clean finish and you've got me.",
      ],
      softNo: [
        "Lose to a cheap trick? Not without a rematch on paper.",
        "Comedy stakes? I've worked too hard for that.",
        "I don't mind losing. I mind losing small.",
      ],
    },
  },

  gentle: {
    id: 'gentle',
    name: 'Gentle',
    weights: { heartfelt: 2, kids_spotlight: 2, comedy: 1, whimsy: 1, violence_mid: -2, hardcore: -3, menace: -2 },
    barks: {
      love: [
        "Oh, that's sweet. Somebody gets rescued? I'm in.",
        "A kid at ringside gets a moment? That's my favorite thing.",
        "That's got a heart in it. I like stories with a heart.",
      ],
      fine: [
        "Okay. I'll be careful with everybody.",
        "Fine. Nobody gets scared, right? Good.",
        "That works. I'll say sorry before the big stuff.",
      ],
      counter: [
        "What if it was a rescue instead of an attack?",
        "Could it be a little kinder? Same story, softer edges.",
        "Close. What if somebody helps somebody at the end?",
      ],
      softNo: [
        "That feels mean. I don't want to do mean.",
        "Too rough for me. Somebody in the front row could get scared.",
        "I'd rather not. That's a lot of hitting for one story.",
      ],
    },
  },

  showboat: {
    id: 'showboat',
    name: 'Showboat',
    weights: { spectacle: 2, high_risk: 2, entrance: 2, spotlight: 1, supershow: 1, mat_classic: -1, slow_build: -2 },
    barks: {
      love: [
        "Spectacle! Pyro! A dive! I'm halfway to the top rope already.",
        "That's an entrance and a half. Lights, please.",
        "Now we're talking. Something tall and something loud.",
      ],
      fine: [
        "Cool. I'll add a dive.",
        "Works. I'll make the entrance bigger.",
        "Fine by me. Can there be pyro? A little pyro?",
      ],
      counter: [
        "Love it, but put a dive at the end.",
        "What if there was an entrance segment? Just a short one. Four minutes.",
        "Close! Make it bigger. Then make it bigger again.",
      ],
      softNo: [
        "Twenty minutes of headlocks? The crowd'll nod off. I'll nod off.",
        "That's a slow burn. I'm more of a firework.",
        "No spectacle? What am I supposed to do, stand there?",
      ],
    },
  },

  traditionalist: {
    id: 'traditionalist',
    name: 'Traditionalist',
    weights: { mat_classic: 2, legacy: 2, old_school: 2, clean_finish: 1, whimsy: -2, prank: -1 },
    barks: {
      love: [
        "Now that's the old way. Headlocks with a story in them.",
        "A classic. They're classics because they work.",
        "Mat wrestling and a legacy? That's a real show.",
      ],
      fine: [
        "Fine. I'll keep it honest.",
        "That'll work. The bones are good.",
        "Alright. Old dog, new card. I can do it.",
      ],
      counter: [
        "Swap the gimmick for a classic, and you've got a deal.",
        "Close. Trade the whimsy for two out of three falls.",
        "Strip it back. Wrestling first, frosting second.",
      ],
      softNo: [
        "That's a gimmick, not a match.",
        "Too cute by half. The old-timers would laugh me out of the building.",
        "No. Folks pay to see wrestling, not a carnival.",
      ],
    },
  },

  mischievous: {
    id: 'mischievous',
    name: 'Mischievous',
    weights: { comedy: 2, swerve: 2, prank: 2, whimsy: 1, improv: 1, solemn: -2 },
    barks: {
      love: [
        "Ha! Oh, that's devious. I love it. Put it in.",
        "A swerve? Nobody'll see it coming. Not even us.",
        "That's a prank with a bell on it. Perfect.",
      ],
      fine: [
        "Sure. I'll find the funny in it.",
        "Works. I'll slip a little trick in somewhere.",
        "Fine. But I'm allowed one surprise.",
      ],
      counter: [
        "Close! Needs a swerve. Everything needs a swerve.",
        "What if somebody got pranked right in the middle?",
        "Fun. Now make it sneakier.",
      ],
      softNo: [
        "That's awfully serious. Can I at least wink?",
        "Solemn? All the way through? I'll crack up.",
        "No room for a joke anywhere? That's a no from me.",
      ],
    },
  },

  family_first: {
    id: 'family_first',
    name: 'Family-First',
    weights: { family: 2, legacy: 2, hometown: 2, heartfelt: 1, leaving: -2, career_ending: -2 },
    barks: {
      love: [
        "Family in the corner? I'm already teary.",
        "That's a hometown story. That's a story worth telling.",
        "Legacy and family. That's everything I care about.",
      ],
      fine: [
        "Fine, as long as everybody's home for supper.",
        "That works. My folks will want seats.",
        "Okay. I'll make it about the people who raised me.",
      ],
      counter: [
        "Could we add a family cameo? Just a small one.",
        "What if it happened here, in town, instead?",
        "Close. Bring it home and I'm in.",
      ],
      softNo: [
        "Leaving town? Not for a story. Not for anything.",
        "Hanging up the boots isn't a stake. It's a life. Pass.",
        "My people are here. I'm not walking away from them on screen.",
      ],
    },
  },

  competitive: {
    id: 'competitive',
    name: 'Competitive',
    weights: { title: 2, clean_finish: 1, mat_classic: 1, supershow: 1, comedy: -1, humiliation_light: -1 },
    barks: {
      love: [
        "Winner take all? Yes. Absolutely yes.",
        "A title. Finally. Let me at it.",
        "That's a real contest. I can taste it.",
      ],
      fine: [
        "Fine. I'll win it.",
        "Works for me. Just give me a fair shot.",
        "Okay. Somebody's losing, and it isn't me.",
      ],
      counter: [
        "Make it winner take all, and you've got a deal.",
        "What if there was a title in it? There should be a title.",
        "Close. Give me a rematch clause in case I don't win.",
      ],
      softNo: [
        "Lose for a laugh? I don't lose for a laugh.",
        "No prize at the end? Then why am I running?",
        "I'll take a loss. I won't take a joke loss.",
      ],
    },
  },

  romantic: {
    id: 'romantic',
    name: 'Romantic',
    weights: { romance: 2, heartfelt: 2, mystery: 1, drama: 1, betrayal: -2 },
    barks: {
      love: [
        "Oh, that's got heart. That's got a love story in it.",
        "Secret admirers? Roses? I'm swooning. Professionally.",
        "That's the one. Somebody's going to cry, and it's me.",
      ],
      fine: [
        "Sweet enough. I'll find the heart in it.",
        "Fine. Could use a little romance, but fine.",
        "Okay. Somebody can hold somebody's hand at the end, right?",
      ],
      counter: [
        "Close. Add a love interest. Grown-ups only, obviously.",
        "What if there was a secret in it? Hearts love a secret.",
        "Lovely bones. Needs a kiss on the forehead somewhere.",
      ],
      softNo: [
        "Using love as a betrayal? No. Love's the one thing that stays real.",
        "That breaks a heart and doesn't fix it. I can't.",
        "Too cold. There's no heart in it anywhere.",
      ],
    },
  },

  dreamer: {
    id: 'dreamer',
    name: 'Dreamer',
    weights: { spectacle: 2, big_city: 2, supershow: 2, high_risk: 1, leaving: 1, slow_build: -2, rules: -1 },
    barks: {
      love: [
        "A supershow? Big city lights? That's the dream.",
        "Bigger! That's the bigger I've been waiting for.",
        "Two thousand people and a payoff they'll talk about for years? Yes.",
      ],
      fine: [
        "Fine. Can we save the payoff for a supershow?",
        "Works. It's a step up, anyway.",
        "Okay. Every big thing starts small. Right?",
      ],
      counter: [
        "Close. Pull the payoff to a supershow and I'm all in.",
        "What if it was bigger? Like, way bigger.",
        "Love it, but dream larger. Fairgrounds larger.",
      ],
      softNo: [
        "That's kind of small, you know? I'm trying to go somewhere.",
        "We did that one already. I need something new.",
        "The same old story, slower? I'll pass.",
      ],
    },
  },

  loyal: {
    id: 'loyal',
    name: 'Loyal',
    weights: { tag: 2, faction: 1, heartfelt: 1, family: 1, betrayal: -1 },
    barks: {
      love: [
        "A tag story? With my partner? Yes.",
        "A reunion? I'll bring the handshake.",
        "Standing with somebody when it counts. That's my kind of story.",
      ],
      fine: [
        "Fine. As long as I'm not the one who turns.",
        "Works for me. I've got their back either way.",
        "Okay. Whoever's next to me, I'm in.",
      ],
      counter: [
        "Close. Can I be the one who gets betrayed instead?",
        "What if we stuck together through it? Loyalty plays.",
        "Make it a team thing, and I'm there.",
      ],
      softNo: [
        "I don't turn on people. Not even pretend. Make me the one who gets turned on.",
        "Turn on my partner? Even on screen? I can't.",
        "I'll take the hit. I won't be the hit.",
      ],
    },
  },

  private: {
    id: 'private',
    name: 'Private',
    weights: { heartfelt: 1, mystery: 1, mask: 1, public: -2, real_life: -3, live_mic: -1, spotlight: -1 },
    barks: {
      love: [
        "Something quiet, and something mine? That's perfect.",
        "A little mystery. Nobody needs to know everything.",
        "That keeps the real stuff off screen. Thank you.",
      ],
      fine: [
        "Fine. Just keep my life out of it.",
        "Works. As long as it stays in the ring.",
        "Okay. All show and no secrets. Good.",
      ],
      counter: [
        "Close. Take the real-life bit off screen and I'm in.",
        "Could it happen behind a curtain instead of on Main Street?",
        "What if we left the personal stuff out? Just the story.",
      ],
      softNo: [
        "That's my real life, and it's not for sale.",
        "That's a lot of public for one person.",
        "I'd rather keep that part to myself.",
      ],
    },
  },

  analytical: {
    id: 'analytical',
    name: 'Analytical',
    weights: { mat_classic: 2, rules: 2, clean_finish: 1, rehearsed: 1, schmozz: -2, improv: -1, mess: -1 },
    barks: {
      love: [
        "Clear rules, clean finish. Beautiful. I've made a chart.",
        "A stipulation! Finally, something with structure.",
        "That's a well-built story. Every piece holds weight.",
      ],
      fine: [
        "Acceptable. I'll take notes.",
        "Fine. It holds together.",
        "Workable. I'll draw a diagram.",
      ],
      counter: [
        "Close. Add a rules stipulation and it's airtight.",
        "What if there was a technicality? Everything's better with a technicality.",
        "Tidy it up. Fewer moving parts, cleaner finish.",
      ],
      softNo: [
        "That's just chaos in a ring. I can't chart chaos.",
        "A schmozz finish? Nobody can follow that. Including me.",
        "There are no rules in that. I need rules.",
      ],
    },
  },

  superstitious: {
    id: 'superstitious',
    name: 'Superstitious',
    weights: { night: 2, mystery: 2, supernatural: 2, solemn: 1, old_school: 1, injury_worked: -1, career_ending: -1 },
    barks: {
      love: [
        "A night show? Good. Things go right after dark.",
        "Mystery, a full moon, a little spooky? That's lucky. Trust me.",
        "Oh, that's got a good feeling on it. I can tell.",
      ],
      fine: [
        "Fine. As long as it's not on an unlucky date.",
        "Works. I'll knock on the turnbuckle twice for luck.",
        "Okay. Let me check the calendar first.",
      ],
      counter: [
        "Close. Can we move it to a night show? Luckier.",
        "What if there was a little ritual before the payoff?",
        "Good bones. Needs a little mystery.",
      ],
      softNo: [
        "That's tempting fate. I don't tempt fate.",
        "Bad feeling on that one. Can't explain it. Won't try.",
        "Faking a hurt? That's bad luck where I come from.",
      ],
    },
  },

  grumpy: {
    id: 'grumpy',
    name: 'Grumpy',
    weights: { violence_low: 2, crime_kayfabe: 1, old_school: 1, heartfelt: -1, romance: -1, whimsy: -1, spectacle: -1 },
    barks: {
      love: [
        "Hmph. Fine. It's good. Don't tell anybody I said so.",
        "A villain who gets to grumble? Finally.",
        "Bragging rights. Good. I like bragging. Quietly.",
      ],
      fine: [
        "Fine.",
        "Whatever. I'll do it.",
        "Hmph. It'll work.",
      ],
      counter: [
        "Too sappy. Trim the hugging. ...Okay, keep one hug.",
        "Close. Less talking, more scowling.",
        "Cut the speech. I'll just glare. Glaring works.",
      ],
      softNo: [
        "That's sweet enough to rot teeth.",
        "No. Too many feelings. On camera.",
        "Not my style. I don't do whimsy.",
      ],
    },
  },

  nurturing: {
    id: 'nurturing',
    name: 'Nurturing',
    weights: { heartfelt: 2, legacy: 1, kids_spotlight: 1, slow_build: 1, mat_classic: 1, humiliation_light: -3, menace: -1 },
    barks: {
      love: [
        "Somebody learns something? Oh, I love a lesson.",
        "A comeback story. Everybody deserves one.",
        "A mentor and a student. That's the best kind of story there is.",
      ],
      fine: [
        "That'll work. I'll find the lesson in it.",
        "Fine. Somebody'll grow from it. Somebody always does.",
        "Okay. I'll keep an eye on everybody.",
      ],
      counter: [
        "Close. Add a lesson beat. Somebody should learn something.",
        "What if somebody was there to help them back up?",
        "Lovely. Now give the young one a moment to shine.",
      ],
      softNo: [
        "Making somebody feel small isn't a story. It's just mean.",
        "No. I won't humiliate anybody. Not for a laugh.",
        "That doesn't teach anybody anything. Let's find one that does.",
      ],
    },
  },
};

// ------------------------------------------------------------------ personalities

export const PERSONALITIES: Record<string, Personality> = {
  // ---------------------------------------------------------------- Birdie
  birdie: {
    id: 'birdie',
    traits: ['nurturing', 'traditionalist', 'mischievous'],
    loves: ['WC-06', 'HK-06', 'HK-07', 'ST-10', 'old_school', 'heartfelt', 'swerve'],
    redLines: [
      {
        id: 'birdie.locker',
        cards: ['HK-18'],
        line: "Not that locker. Pick another card, sugar, and don't ask me why. I won't say it twice.",
      },
      {
        id: 'birdie.mean',
        tags: ['menace'],
        line: "We don't do mean, sugar. We do ornery. Ornery sells tickets. Mean sells nothing but a bad night's sleep.",
      },
    ],
    spins: [
      {
        replaces: 'HK-18',
        with: 'HK-05',
        line: "Want something spooky? Fine. Something precious walks off from backstage and everybody's a suspect. Leave the lockers be.",
      },
      {
        replaces: 'PO-04',
        with: 'PO-03',
        line: "Chairs are seasoning, sugar, not a meal. Give me two out of three falls and let the room breathe.",
      },
      {
        replaces: 'ST-03',
        with: 'ST-12',
        line: "Leaving's a big word in this town. Have the loser say sorry into Gus's microphone instead. Sorry's harder.",
      },
    ],
    spotlight: 30,
    ego: 35,
    lovable: 2,
    motifs: ['Pencil', 'Cinnamon', 'Velvet', 'Folding Chair', 'Ticket', 'Sugar', 'Carnival', 'Porch'],
    wants: [
      "I need something for the opener, sugar. Make it sing.",
      "I want this town to get its money's worth on a Wednesday. Every seat. Even the wobbly one.",
      "I want to see somebody learn something out there. A real lesson, dressed up as a fight.",
      "I've got a carny swerve in my back pocket from 1974. I want to see if it still works.",
      "I want a story where the one who leaves comes back. Humor an old woman.",
    ],
    nudges: [
      "*A note under your windshield wiper, folded the carny way so it lands face-up:* \"My office. Bring a donut. Not a plain one.\"",
      "*A note slipped under your door, in carpenter's pencil:* \"My office, sugar. Coffee's on me. Donut's on you.\"",
      "*The Commissioner stops you on Main Street.* \"Paperwork, rookie. My office. And if you pass Tiny's, I like sprinkles.\"",
      "*A flyer for Saturday's card is taped to your door. Across the bottom, in pencil:* \"Office. Donut. You know the drill.\"",
      "*An envelope in your mailbox. Inside, one line:* \"Office, Thursday. Bring two crullers and an open mind.\"",
    ],
    opener: [
      "Sit, sugar. Shut the door. No, the sticky one. Okay. Here's what I've been chewing on.",
      "Donut first. Good. Now. I've been booking since before your folks met, and I've got an itch.",
      "Pull up the folding chair. The good one. I've got a story, and it won't keep.",
    ],
    signoff: [
      "That's a show, sugar. Now go home and rest. You'll need it.",
      "Shake on it. ...Firm grip. That's how you know a promoter means it.",
      "I'll pencil it in. And in this building, the Pencil doesn't erase.",
    ],
    booth: [
      "Eleven people paid on a Saturday once. Tonight was more. I count 'em every time, sugar. Every time.",
      "June's going to turn the lights off on me again. Let her. I like it in the dark with a coffee.",
      "Did you hear that room breathe in the main event? That's the sound you're chasing. Not the pop. The breath.",
      "Gideon's out there tipping the waitress in compliments again. I keep telling him the bank won't take those.",
      "Don't tell the Twins I fined them for fun. They think it was for the ladder.",
    ],
    barks: {
      love: [
        "Oh, sugar. That's the oldest trick in the book, and it's old because it works.",
        "Ha! That one'll put rear ends in the folding chairs.",
        "Now that's a carny's card. I'd have traded my last cinnamon stick for that in '74.",
      ],
      fine: [
        "It'll draw. Not a barn burner, but it'll draw.",
        "Fine by me, sugar. Make it sing.",
      ],
      counter: [
        "Close, sugar. Now put a heart in it. Cold stories don't sell on a Wednesday.",
        "Hmm. Does the one who leaves come back? Then we'll talk.",
      ],
      softNo: [
        "Not in my building, sugar. Not yet, anyhow.",
        "I've seen that one empty a barn. Bring me something warmer.",
      ],
    },
    shapes: ['mentor_student', 'legacy', 'prank_war', 'hometown_hero', 'reunion', 'managers_war'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- Rosa / La Mariposa Dorada
  mariposa: {
    id: 'mariposa',
    traits: ['proud', 'family_first', 'traditionalist'],
    loves: ['legacy', 'family', 'high_risk', 'HK-14', 'HK-16', 'ST-11', 'PO-03'],
    redLines: [
      {
        id: 'mariposa.mask',
        cards: ['ST-04', 'TW-04'],
        unlessFlag: 'rosa_mask_choice',
        line: "In my family, you don't take a mask. You earn the right to ask. And the one who asks is me. Someday. Not today.",
      },
    ],
    spins: [
      {
        replaces: 'ST-01',
        with: 'ST-11',
        line: "A belt you take is a belt you borrow. Make it the family name. Then I have to earn it, in front of Abuela.",
      },
      {
        replaces: 'TW-04',
        with: 'TW-03',
        line: "Nobody touches the mask. But a mystery? Give them a partner nobody saw coming. All the mystery, none of the hands.",
      },
      {
        replaces: 'ST-04',
        with: 'ST-12',
        line: "No masks hanging over the ring. The loser apologizes to Abuela, in the ring, in Spanish. Believe me, that's worse.",
      },
      {
        replaces: 'PO-04',
        with: 'PO-03',
        line: "Chairs? Ay. Give me two out of three falls. Lucha is a conversation, not a yard sale.",
      },
    ],
    spotlight: 55,
    ego: 60,
    lovable: 2,
    motifs: ['Butterfly', 'Wing', 'Monarch', 'Comal', 'Tortilla', 'Abuela', 'Gold Thread', 'Salsa Verde'],
    wants: [
      "Okay. I want a title story where I earn it. Not take it. Earn it. Abuela will know the difference.",
      "I want to fly. Higher than last time. Somebody tell Hank to check the rafters.",
      "I want my family in it. Abuela in my corner. She has already picked her chair.",
      "I want a story the old way. Honor, a handshake, a rematch. Is that so much? Sit, sit.",
      "I want to give the crowd something new. Still wings. But new. Don't tell Abuela yet.",
    ],
    nudges: [
      "*La Mariposa taps the menu board twice, then points toward the diner.* Abuela: \"She says the booth, ten o'clock. She also says eat more.\"",
      "*La Mariposa hands over your order with a napkin folded into a butterfly.* Abuela: \"She wants to talk tonight. The butterfly is my idea.\"",
      "*La Mariposa draws a clock in salsa verde on your plate. It says ten.* Abuela: \"Ten o'clock. The diner. Don't be late, she worries.\"",
      "*La Mariposa presses a hand to her heart, then points down the street toward June's.* Abuela: \"Tonight. Also, you need a haircut. That's from me.\"",
      "*La Mariposa taps your receipt. On the back, a little drawing of a booth.* Abuela: \"She says after the show. Bring an appetite.\"",
    ],
    opener: [
      "Okay. Sit, sit, you're standing there like a lamp. First, the jalapeños this week are a crime. Second, I have a story.",
      "*She rolls her mask up to her nose and takes a bite.* Good. Now I can talk. I have been waiting all day to talk.",
      "You came! Good. Abuela said you would. Abuela says a lot of things. Listen.",
    ],
    signoff: [
      "Done. Signed. I'm telling Abuela tonight, and she'll say she thought of it first.",
      "*She signs with a little butterfly.* That's a promise, not a doodle. Don't smudge it.",
      "Perfect. Now eat something. You're too skinny. That one is from me, not Abuela.",
    ],
    booth: [
      "You know what nobody tells you about masks? They're hot. Sixty-five years of my family sweating for mystery.",
      "Abuela watched the main event and said my headscissors were 'a little American.' I'll be thinking about that all week.",
      "The fryer made a new noise today. A bad noise. I talked to it nicely. It's a Villanueva now. It has to be brave.",
      "Dex ate four plates tonight. Four. I'm not mad. I'm writing it down.",
      "Gideon says my wings need more sparkle. Gideon thinks the moon needs more sparkle.",
    ],
    barks: {
      love: [
        "Yes! Abuela is going to cry. Then she is going to say she knew it all along.",
        "That's honor. That's the old way. Put it on the napkin before I hug you.",
      ],
      fine: [
        "Okay. I can work with that. My cousin can watch the register.",
        "Fine. It's a good tortilla. Not hot off the comal, but good.",
      ],
      counter: [
        "Hm. Close. What if I have to earn it instead? Earning plays better. Ask Abuela.",
        "No, no, wait. Make it bigger. Make it about family.",
      ],
      softNo: [
        "Ay. Abuela would walk out. And she has a very good seat.",
        "That's not lucha. That's a yard sale with a ring in it.",
      ],
    },
    shapes: ['legacy', 'family_feud', 'masked_mystery', 'underdog_title', 'mentor_student', 'secret_admirer'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- Big Earl, the Mountain
  earl: {
    id: 'earl',
    traits: ['gentle', 'private', 'grumpy'],
    loves: ['ST-14', 'TW-02', 'TW-13', 'slow_build', 'heartfelt', 'kids_spotlight', 'solemn'],
    redLines: [
      {
        id: 'earl.kids',
        tags: ['menace'],
        line: "The Mountain doesn't growl at children. The Mountain nods. ...I'd like a different card, please.",
      },
    ],
    spins: [
      {
        replaces: 'ST-03',
        with: 'ST-14',
        line: "Nobody leaves. Loser reads it. Story hour, Saturday, ten sharp. With the voices. All the voices.",
      },
      {
        replaces: 'TW-13',
        with: 'TW-02',
        line: "No speech. I don't do speeches. Let the camcorder catch me being kind, once. Then I walk away.",
      },
      {
        replaces: 'PO-04',
        with: 'PO-09',
        line: "No chairs, please. I'll just stand there. Let them try to knock me down. That's the whole story.",
      },
    ],
    spotlight: 25,
    ego: 30,
    lovable: 3,
    motifs: ['Library', 'Bookmark', 'Avalanche', 'Summit', 'Sparrow', 'Cardigan', 'Snowcap', 'Chamomile'],
    wants: [
      "I want to loom. Slowly. For weeks. Then do one small kind thing and walk away.",
      "I'd like the crowd to see me differently. Not soft. Just... different.",
      "I want a story with a library in it. Not as a villain. As a library.",
      "I want to be the mountain somebody climbs. A smaller wrestler. A long climb.",
      "I want to tag with someone who talks, so I don't have to.",
    ],
    nudges: [
      "*Earl stamps your library card. The due date reads* BOOTH.",
      "\"Library closes at five. You have... four minutes.\" *He slides you a bookmark. On the back, in tiny print:* booth, 10.",
      "*Earl shushes you so deeply the shelves rattle. Your returned book has a note inside:* tonight. june's. (E.)",
      "*The Mountain says nothing. He points at the diner across the street, then at the clock, then at you.*",
      "*Earl hands you an overdue notice. Amount due: one coffee. Pay at: the back booth.*",
    ],
    opener: [
      "*whispering* Thank you for coming. I made notes. Sorry. There are a lot of notes.",
      "*He pushes a tiny drawing across the table: a mountain and a napkin.* That's the pitch. Kidding. Here's the pitch.",
      "I'm going to say it quietly so I don't lose my nerve. Okay.",
    ],
    signoff: [
      "*He signs in very small letters.* Thank you. I'll try not to cry at the payoff. I'll probably cry at the payoff.",
      "Mm. Good. *A rare smile.* Very good.",
      "I'll draw this one in the sketchbook. Next to the sparrows.",
    ],
    booth: [
      "I flinched at the pyro again. They think it's rage. It's not rage. It's fire, near my beard.",
      "Pip held his belt up at me tonight. I nodded at it. Solemnly. He nearly floated out of his sneakers.",
      "I cried at the part where the sparrow comes back. I wrote that part. I still cried.",
      "Tiny says thirty little cakes is too many. Tiny is wrong. Thirty is a reasonable number of cakes.",
      "I apologized to the turnbuckle after the match. I bumped it pretty hard. It seemed fine.",
    ],
    barks: {
      love: [
        "Mm. *A rare smile.*",
        "*whispering* Oh. Oh, that's lovely. Can I keep the card?",
      ],
      fine: [
        "Mm.",
        "That's fine. I'll loom.",
      ],
      counter: [
        "Mm. What if I don't say anything at all? I'm better at not saying anything.",
        "Could it be slower? Slow is scarier for the grown-ups, and kinder to my knees.",
      ],
      softNo: [
        "*He sets the card down very gently, like a baby bird.* No, thank you.",
        "I'd rather not. I spend my whole life trying not to knock things over.",
      ],
    },
    shapes: ['gentle_monster', 'redemption', 'odd_couple', 'secret_admirer', 'grudge_match'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- Dex "Dropkick" Delgado
  dex: {
    id: 'dex',
    traits: ['dreamer', 'showboat', 'loyal'],
    loves: ['PO-06', 'HK-15', 'SG-11', 'high_risk', 'supershow', 'big_city', 'spectacle'],
    redLines: [
      {
        id: 'dex.goodbye',
        cards: ['ST-03'],
        line: "Lose my way out of town? Nah. When I go, I say goodbye. To Luz, to the pumps, to everybody. In person. That's the deal.",
      },
    ],
    spins: [
      {
        replaces: 'PO-01',
        with: 'PO-06',
        line: "If I'm jumping off it, it better be the tallest thing in the building. Ladder. Please. I'll sign anything.",
      },
      {
        replaces: 'PO-08',
        with: 'PO-15',
        line: "Say uncle? I'm a flyer. Put something on a pole and let me climb for it. Climbing is my love language.",
      },
      {
        replaces: 'ST-03',
        with: 'ST-10',
        line: "Nobody loses me out of town. But winner headlines the supershow? Now we're talking. Dream big, stay put.",
      },
      {
        replaces: 'HK-03',
        with: 'HK-02',
        line: "A handshake? Boring. Open challenge. Anyone, anytime. That's my whole thing. Let me answer it.",
      },
    ],
    spotlight: 85,
    ego: 70,
    lovable: 2,
    motifs: ['Slushie', 'Gas Pump', 'Dropkick', 'Unleaded', 'Checkered Flag', 'Skyline', 'Water Tower', 'High-Top'],
    wants: [
      "I want to fly off something nobody's flown off. The scaffold. The grandstand. Hank'll say no. Ask anyway.",
      "I want a supershow. Main event. Neon lights. My mom in the second row.",
      "I want to prove I'm not small-town. But, like, in a way that's nice to the town.",
      "I want a tag partner I'd jump in front of a chair for. Literally. I'll take the bump.",
      "I want the underdog thing. Everybody counts me out, then boom. Last Stop.",
    ],
    nudges: [
      "*Dex writes* BOOTH? *in the frost on the gas station ice machine, then wipes it off with his sleeve like nothing happened.*",
      "\"Fill 'er up? Nah. I fill ARENAS.\" *He hands you the receipt. On the back:* booth? 10?",
      "*Dex backflips over the air pump, sticks it, and points at the diner across the street. Then at you. Then the diner again.*",
      "*A grape slushie is waiting on your car roof. On the cup, in marker:* JUNE'S. TONITE.",
      "\"Pump four's broken. Kidding. Pump four's fine.\" *He lowers his voice.* \"Diner. Later. Big idea.\"",
    ],
    opener: [
      "Okay okay okay. Don't say no yet. Just listen till the end, and then say yes.",
      "*He's already drawn on the napkin. There's a stick figure diving off the water tower.* Hear me out.",
      "Hazel says I gotta pitch slower. So. This. Is. My. Idea. ...Okay, that's too slow.",
    ],
    signoff: [
      "LET'S GO! *He high-fives you so hard the ketchup tips over.* Sorry, June!",
      "Signed. Sealed. Never stop flying.",
      "Best napkin ever. I'm posting a picture. Twelve views, easy.",
    ],
    booth: [
      "Landed the corkscrew clean tonight. Clean! Hazel said 'acceptable.' That's basically a hug from Hazel.",
      "Luz made me a sign. DEX IS THE BEST BROTHER. Spelled brother with two Rs in the middle. Framing it.",
      "My ribs are fine. Totally fine. Don't tell Doc I said 'totally.' He knows what 'totally' means.",
      "Rosa made me eat three plates. I came here for a fourth. Don't tell Rosa.",
      "Somebody in row three had a sign with my name spelled right. First time ever. I'm kind of emotional.",
    ],
    barks: {
      love: [
        "YES. Tallest thing in the building. Write it down.",
        "That's a highlight reel, partner! I can hear Gus losing his voice already.",
      ],
      fine: [
        "Cool, cool. Can I add a dive? I'm adding a dive.",
        "Works for me. I'll find something to jump off.",
      ],
      counter: [
        "Okay, but what if it was taller?",
        "Love the energy. Needs more air. Like, literal air. Under me.",
      ],
      softNo: [
        "Feels kinda small, you know? I'm trying to get big over here.",
        "Nah, that's a slow one. I don't do slow. I do Premium Unleaded.",
      ],
    },
    shapes: ['big_city_dream', 'underdog_title', 'rookie_first_win', 'comeback', 'odd_couple', 'reunion'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- "Gorgeous" Gideon Price
  gideon: {
    id: 'gideon',
    traits: ['vain', 'anxious', 'showboat'],
    loves: ['SG-11', 'SG-16', 'HK-04', 'HK-20', 'entrance', 'gear', 'rehearsed'],
    redLines: [
      {
        id: 'gideon.hair',
        cards: ['ST-05'],
        tags: ['hair'],
        line: "No. Not 'no, darling.' Just no. I don't want clippers in the building. I don't want the concept of clippers in the building.",
      },
    ],
    spins: [
      {
        replaces: 'ST-05',
        with: 'ST-07',
        line: "But. The loser wears Marigold's chicken suit, and I style it. In my salon window. For a week. It'll be a look.",
      },
      {
        replaces: 'PO-05',
        with: 'PO-07',
        line: "A cage? I'll sweat through the sequins, and the angles are all wrong. Lumberjacks. An audience, up close. Better.",
      },
      {
        replaces: 'SG-01',
        with: 'SG-16',
        line: "An open mic? Unrehearsed? No. Give me a hand mirror and a script. The mirror never interrupts.",
      },
      {
        replaces: 'HK-11',
        with: 'HK-20',
        line: "Ruin my robe? Even a stunt robe? I'd need a lie-down. Let me debut a new look and refuse to explain it.",
      },
    ],
    spotlight: 95,
    ego: 85,
    lovable: 3,
    motifs: ['Sequin', 'Mirror', 'Hairspray', 'Pompadour', 'Velvet Chair', 'Blowout', 'Compact', 'Rose Gold'],
    wants: [
      "I want to be seen. Not looked at. Seen. ...Also looked at. Both.",
      "I want an entrance so long it needs an intermission. Four minutes minimum. Choreographed.",
      "I want to be the villain everybody loves to boo and secretly wants a haircut from.",
      "I want the crowd to see me differently. Just for one story. Then I go back to being gorgeous.",
      "I want a tag partner with a beard I can groom on the apron. You know who I mean.",
    ],
    nudges: [
      "*Loudly, for the customers:* \"Darling, your split ends and I need to have a conversation. Tonight.\"",
      "\"Compliment me three times, sincerely, and I'll fit you in.\" *He flips open his book. Tonight, 10 p.m.:* THE BOOTH.",
      "*Gideon checks his reflection in a spoon, then in your sunglasses.* \"We need to discuss your look. Privately. Over pie.\"",
      "*A lavender-scented card lands on your table:* \"Your bangs have filed a complaint. June's. Ten. Bring courage.\"",
      "\"Sit. No, don't sit, there's no time. Later. The diner. We'll do something about... all this.\"",
    ],
    opener: [
      "Is it about me? Please say it's about me. Please say it's not about me. Okay. It's about me.",
      "*He lays the napkin out like a silk scarf.* I've rehearsed this pitch. Eleven times. Twelve, in the car.",
      "Before I begin: do I look nervous? Don't answer. I look gorgeous. Continuing.",
    ],
    signoff: [
      "*He signs with a flourish and a small heart.* I need to go practice my shocked face.",
      "Signed. Witnessed. Moisturized. Let's make art.",
      "I'll tell my therapist Tuesday that I'm thrilled. She'll ask how I really feel. Thrilled. Mostly.",
    ],
    booth: [
      "Fifty folding chairs and bingo after, and I breathed into a bag like it was a coronation. Hazel says that's growth.",
      "Someone in row two booed me with genuine love tonight. I could feel it. I'm framing the feeling.",
      "Earl's beard has opinions. I oiled it anyway. With love. And gloves.",
      "Clementine called my entrance 'interminable.' Into the LIES folder it goes.",
      "Do you ever feel like if you stop performing for one second, everybody sees the seams? No? Just me? Pass the bag.",
    ],
    barks: {
      love: [
        "My entrance is four minutes of choreographed sequins. ...You'd interrupt at the key change, obviously.",
        "Oh, that's a LOOK. I'm going to need a new robe.",
        "I'm not vain. I'm accurate. And accurately, this is perfect.",
      ],
      fine: [
        "Acceptable. I'll elevate it.",
        "Fine. But I'm wearing the champagne sequins, not the blush.",
      ],
      counter: [
        "Darling. Close. Now make it about my face.",
        "What if it were rehearsed? Thoroughly? With a mirror?",
      ],
      softNo: [
        "I'll sweat through the sequins. Nobody can see a glitter cape through chaos.",
        "I'm not saying no. I'm saying my therapist would say no.",
      ],
    },
    shapes: ['fall_from_grace', 'redemption', 'odd_couple', 'secret_admirer', 'reinvention', 'prank_war'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- Bo Bruiser
  bo: {
    id: 'bo',
    traits: ['analytical', 'grumpy', 'loyal'],
    loves: ['HK-08', 'PO-02', 'ST-09', 'SG-04', 'rules', 'schmozz', 'tag'],
    redLines: [
      {
        id: 'bo.store',
        cards: ['ST-03', 'ST-06'],
        line: "Not that one. If one of us goes, the other's standing alone in aisle nine. I've done the math. No.",
      },
    ],
    spins: [
      {
        replaces: 'HK-01',
        with: 'HK-08',
        line: "No parking-lot jumps. We bet them at the counter. In public. Witnesses. A notary, if June knows one.",
      },
      {
        replaces: 'PO-04',
        with: 'PO-02',
        line: "Anything goes means nothing gets counted. Tag match. Legal tags. I'll bring a clipboard.",
      },
      {
        replaces: 'ST-03',
        with: 'ST-09',
        line: "Nobody leaves. Make it custody. Of the parking space. It's been in dispute since 1994.",
      },
      {
        replaces: 'TW-01',
        with: 'TW-18',
        line: "Fine, a twist. But it's the wrong twin. Nobody can prove anything. That's the beauty of identical.",
      },
    ],
    spotlight: 35,
    ego: 60,
    lovable: 1,
    motifs: ['Label Maker', 'Inventory', 'Toolbox', 'Clipboard', 'Flannel', 'Parking Space', 'Measuring Tape', 'Duplex'],
    wants: [
      "We want a shot at the tag belts. A shot. He'll say 'the belts.' It is legally not the same thing.",
      "I want a story with rules in it. Clear ones. Ideally laminated.",
      "I want a finish that technically counts. The crowd hates it, the ref allows it, I sleep fine.",
      "I want custody of the parking space. It's been disputed since 1994. Settle it on screen.",
      "I want the store in it. Not the store as a villain. The store as a venue.",
    ],
    nudges: [
      "\"Aisle four, bottom shelf.\" *Bo hands you the receipt. Under the total, in label-maker tape:* DINER. 2200.",
      "*Bo labels your coffee cup without asking. It reads:* JUNE'S. AFTER CLOSE. SERIOUS.",
      "\"Your return's been processed.\" *He lowers his voice a notch.* \"Paperwork needs a signature. The diner. Tonight.\"",
      "*Bo slides a hardware catalog across the counter. On page nine, a drawing of a diner booth is circled in red pen.*",
    ],
    opener: [
      "I brought an agenda. Item one: don't let Buck talk first. Item two: Buck's already talking.",
      "*He clicks a pen.* Let's do this properly. Hook, twist, stakes, payoff. In that order.",
      "Before we start, I need it noted that I'm the older one. Four minutes. Proceed.",
    ],
    signoff: [
      "*He labels the napkin.* There. Now it's official.",
      "Signed in triplicate. Well. Once. But I'll make copies.",
      "Good. I'll tell Buck it was his idea. He works better that way.",
    ],
    booth: [
      "Did the books at two again. The numbers are fine. Don't tell Buck I said 'fine' like that.",
      "Buck's whittling a breakaway chair. It is not on purpose. None of them are on purpose.",
      "Aunt Patty asked me over pot roast if the ref was paid off. I said 'no comment.' She wrote it down.",
      "Nobody pins anybody clean. Not him on me, not me on him. We tried that in high school. Didn't talk till Easter.",
      "The parking space is technically mine. I put a label on the curb. He keeps peeling it.",
    ],
    barks: {
      love: [
        "Witnesses. Rules. A clear outcome. I'm almost smiling.",
        "That is a properly organized story. I want it laminated.",
      ],
      fine: [
        "Acceptable. I'll take inventory of it later.",
        "Fine. Noted. Filed.",
      ],
      counter: [
        "Close. Needs a technicality. Everything's better with a technicality.",
        "What if it technically counted? That's the whole fun.",
      ],
      softNo: [
        "That's chaos with a bell on it. I don't do chaos. Buck does chaos.",
        "No. That's how the store gets dented. Dad will call from Arizona.",
      ],
    },
    shapes: ['tag_breakup', 'ornery_twin', 'family_feud', 'grudge_match', 'stolen_belt', 'managers_war'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- Buck Bruiser
  buck: {
    id: 'buck',
    traits: ['showboat', 'competitive', 'mischievous'],
    loves: ['HK-08', 'PO-17', 'TW-18', 'prank', 'comedy', 'swerve', 'spectacle'],
    redLines: [
      {
        id: 'buck.store',
        cards: ['ST-03', 'ST-06'],
        line: "Nope. The store's the last thing left from when we were kids. Nobody loses their way out of it. Not him. Not me.",
      },
    ],
    spins: [
      {
        replaces: 'PO-08',
        with: 'PO-17',
        line: "Say uncle? I'd rather say 'aisle nine.' Hardware Store Brawl. Folding chairs between Plumbing and Paint.",
      },
      {
        replaces: 'HK-03',
        with: 'HK-08',
        line: "A handshake? Boring. I bet him. Loudly. At the counter. I bet you a hammer I win. A good hammer.",
      },
      {
        replaces: 'PO-01',
        with: 'PO-15',
        line: "Singles is fine. But put my new invention on a pole. If it doesn't collapse first, whoever grabs it wins.",
      },
      {
        replaces: 'ST-03',
        with: 'ST-08',
        line: "Nobody's leaving. Loser buys the whole town pie. I want to watch Bo do the math in real time.",
      },
    ],
    spotlight: 65,
    ego: 55,
    lovable: 1,
    motifs: ['Harmonica', 'Whittling Knife', 'Power Tool', 'Bait Fridge', 'Hammer', 'Sawdust', 'Duct Tape', 'Plunger'],
    wants: [
      "We want your tag belts. ...Bo's gonna say 'a shot at.' Same thing.",
      "I want to bet somebody something. Big. In public. And lose spectacularly. Or win. Either.",
      "I want to prove who the better twin is. It's me. I just need it on a napkin.",
      "I want a gadget in the story. It'll collapse. That's the bit. That's always the bit.",
      "I want to fight in the store after hours. Plungers. Paint cans. I've dreamed about it since I was nine.",
    ],
    nudges: [
      "\"Bo's wrong. Whatever he said. I wasn't there, but he's wrong.\" *Buck winks and tips his head toward the diner.*",
      "*Buck whittles you a tiny booth out of a clothespin. It collapses in your hand. He mouths:* tonight.",
      "\"I bet you a hammer you can't beat me to June's tonight. A good hammer.\"",
      "*Buck leaves a harmonica on your counter with a sticky note:* \"Key of A. The sad key. Bring it to the diner later.\"",
    ],
    opener: [
      "Okay. I've got an idea and Bo hates it, which means it's good.",
      "*He's drawn on the napkin in pencil and ketchup.* It's a schematic. Ignore the ketchup.",
      "Don't let Bo talk first. He'll explain it. I'll SELL it.",
    ],
    signoff: [
      "*He signs with a ketchup thumbprint.* Legally binding. Ask Bo.",
      "Shook on it! No take-backs. That's a twin rule. Now it's a you rule.",
      "We'll need a permit. Bo'll get the permit. I'll get the hammer.",
    ],
    booth: [
      "Everybody thinks I'm the easy one. Easy's just what loud looks like from outside.",
      "Wrote a new sad song tonight. It's about a hammer that doesn't know it's the good hammer.",
      "Bo labeled his side of the milkshake. I drank his side. It's war now.",
      "My self-tightening turnbuckle worked tonight. First person I wanted to tell was Bo. Don't tell Bo.",
      "Aunt Patty asked me who really won tonight. I said 'the crowd.' She threw a dinner roll at me.",
    ],
    barks: {
      love: [
        "I bet you a hammer this works. A GOOD hammer.",
        "Oh, that's chaos. Beautiful chaos. Bo's gonna hate it. Put it in.",
      ],
      fine: [
        "Sure, sure. I'll find a way to make it louder.",
        "Works. Can I bring a gadget?",
      ],
      counter: [
        "What if there was a bet? There should be a bet.",
        "Close! Now make it twice as loud. Bo, plug your ears.",
      ],
      softNo: [
        "Feels like instructions. I don't do instructions.",
        "That's a Bo story. I'd fall asleep in my own match.",
      ],
    },
    shapes: ['tag_breakup', 'ornery_twin', 'prank_war', 'family_feud', 'tournament', 'grudge_match'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- Hazel "Hurricane" Huang
  hazel: {
    id: 'hazel',
    traits: ['proud', 'nurturing', 'competitive'],
    loves: ['TW-15', 'SG-14', 'HK-07', 'mat_classic', 'title', 'clean_finish', 'legacy'],
    redLines: [
      {
        id: 'hazel.knee',
        cards: ['TW-09'],
        tags: ['injury_worked'],
        line: "My knee is part of the story. It's not the ending. No worked injuries for me. Not ever. It's too close to home.",
      },
    ],
    spins: [
      {
        replaces: 'TW-09',
        with: 'TW-15',
        line: "No worked injury. Give me secret training. I disappear, I come back with something nobody's seen. That's my story now.",
      },
      {
        replaces: 'PO-06',
        with: 'PO-09',
        line: "No dives off ladders. Not anymore. Last one standing. I stay on my feet. That's the whole point.",
      },
      {
        replaces: 'ST-07',
        with: 'ST-12',
        line: "A chicken suit? I held a title for six hundred eleven days. Make the loser apologize into the mic. And mean it.",
      },
      {
        replaces: 'PO-04',
        with: 'PO-03',
        line: "No chairs. Two out of three falls. I want to beat somebody two different ways, clean.",
      },
    ],
    spotlight: 55,
    ego: 75,
    lovable: 1,
    motifs: ['Hurricane', 'Storm', 'Lightning', 'Eye', 'Forecast', 'Still Water', 'Thunder', 'Mahjong'],
    wants: [
      "I want to come back. Not as the old Hurricane. As the quiet part in the middle.",
      "I want a title story. A real one. Six hundred eleven days taught me how to hold one.",
      "I want to train somebody. Dex. You. Whoever lands the worst. I'll fix it.",
      "I want a weather feud. Forecasts on WRSL. Sheriff Bev issuing advisories. The whole storm.",
      "I want a mat classic. Twenty minutes, nothing cheap, and a crowd learning to hold its breath.",
    ],
    nudges: [
      "\"Breathe in. Hold it. Hold it. You call that holding it?\" *As you exhale, she adds quietly:* \"Booth. Ten.\"",
      "*Hazel corrects your tree pose with one finger. You topple. She taps the class schedule. Tonight's entry:* JUNE'S.",
      "*Hazel hands you a resistance band with a tag tied on:* \"Homework. Also: the diner, after close.\"",
      "\"Your form's a mess. Come by later and we'll talk about it.\" *She points, barely, toward the Hot Tag.*",
    ],
    opener: [
      "Sit. Posture. ...Better. Okay. Here's the forecast.",
      "I always count the days. Today I want to count something else. Listen.",
      "I'm going to say this once, straight, no hype. Then you can hype it.",
    ],
    signoff: [
      "Signed. Don't make that face. I'm smiling. This is what my smiling looks like.",
      "Good. Now I have to actually do it. *She stands on one leg, testing.* Good.",
      "Done. I'll tell Doc myself, before you can. He worries.",
    ],
    booth: [
      "Six hundred eleven days as champion. Seven hundred thirty since the knee. I count both. Tonight I counted one more.",
      "Dex landed clean. I said 'acceptable.' He looked like I gave him a car. Don't tell him it was better than acceptable.",
      "Gideon called my kick 'luminous.' I said thank you. Out loud. He teared up. Progress, for both of us.",
      "My parents called. 'Are you being careful?' I said yes. I'm screaming into a towel later.",
      "Lost at mahjong today to a lady who's ninety-one. She trash-talks better than Buck.",
    ],
    barks: {
      love: [
        "That's a real story. Discipline, and a payoff you earn.",
        "Good. Clean finish. I don't have to win cheap. I never have.",
      ],
      fine: [
        "Fine. I'll make it look harder than it is.",
        "Acceptable. That's high praise. Ask Dex.",
      ],
      counter: [
        "Close. Make me earn it. Then it'll mean something.",
        "What if there's a lesson in it? Somebody learns something. Maybe me.",
      ],
      softNo: [
        "Not that dive. Not ever again. Something else.",
        "Comedy stakes? I held a title for six hundred eleven days. Try again.",
      ],
    },
    shapes: ['comeback', 'mentor_student', 'underdog_title', 'grudge_match', 'tournament', 'rookie_first_win'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- "Cowboy" Clint Ransom / the Dust Devil
  clint: {
    id: 'clint',
    traits: ['family_first', 'traditionalist', 'private'],
    loves: ['PO-19', 'PO-14', 'PO-24', 'animal', 'old_school', 'solemn', 'heartfelt'],
    redLines: [
      {
        id: 'clint.mask',
        cards: ['TW-04', 'ST-04'],
        unlessFlag: 'clint_unmask_choice',
        line: "Nobody pulls this mask but me, partner. And I'll pick the night. She deserves to hear it from me first.",
      },
    ],
    spins: [
      {
        replaces: 'PO-01',
        with: 'PO-19',
        line: "Singles is fine. Tie us together with a bandana, though. Nobody runs. Nobody hides. Like the old days.",
      },
      {
        replaces: 'PO-04',
        with: 'PO-14',
        line: "Chairs? Nah. Let Wanda decide. First one to bring her the honey pot wins. She's fair. Fairer than me.",
      },
      {
        replaces: 'ST-03',
        with: 'ST-09',
        line: "Can't leave town. Somebody's got to feed a bear. Fight me for something instead. Custody of my lucky hat.",
      },
      {
        replaces: 'TW-04',
        with: 'TW-10',
        line: "Nobody touches the mask. But a big farewell, and a comeback nobody saw coming? I know a little about that.",
      },
    ],
    spotlight: 35,
    ego: 45,
    lovable: 0,
    motifs: ['Bandana', 'Sundown', 'Spur', 'Tumbleweed', 'Dust', 'Harmonica', 'Straw Hat', 'Rodeo'],
    wants: [
      "I'd like one more ride, partner. Something with a sundown in it.",
      "I want to pick my own ending. Most folks don't get to. I'd like to.",
      "I want Wanda at ringside. She's got better timing than half the roster.",
      "I want a feud with some weather in it. Hazel's been forecasting my doom on the radio. Rude. Effective.",
      "I want to stand next to somebody young and hand 'em something. A move. A hat. Whatever fits.",
    ],
    nudges: [
      "\"Retired, partner. Hat's just for shade now.\" *He taps the brim twice and tips it toward the diner.*",
      "*Clint hands you a wooden spoon of honey.* \"For Wanda. And if you're hungry later, June's has pie.\" *He holds your eye a beat.*",
      "*A red bandana is tied to your mailbox. Knotted inside it, a scrap of paper:* sundown. back booth.",
      "\"Livestock auction runs late tonight.\" *He says it a little too carefully.* \"Might grab coffee at June's after.\"",
    ],
    opener: [
      "Sit a spell, partner. I'm not much for talking, so I'll say it once and slow.",
      "*He sets his hat on the table, crown down, for luck.* Alright. Here's a thought I've been chewing.",
      "Been carrying this one around like a stone in my boot. Let me set it down.",
    ],
    signoff: [
      "*He taps his hat brim twice.* Obliged, partner. I mean that.",
      "Shook on it. Where I come from, that's thicker than ink.",
      "Good. Now I've got to go feed a bear and pretend I'm not grinning.",
    ],
    booth: [
      "She put a dart right between my eyes last night. Bullseye. Proudest I've ever been in my life.",
      "Wanda bowed at the gate this morning. Nobody told her to. Bears just know when it's a good day.",
      "Lacey won her meet Tuesday. By pin. I hollered so loud a fella asked if I was okay. I was not. I was great.",
      "Doc watched every bump tonight like a hawk in reading glasses. Told him I'm fine. Told him twice.",
      "New paperback in the feed bag. Gunslinger falls for a schoolteacher. Don't spoil it.",
    ],
    barks: {
      love: [
        "*He taps his hat brim twice.* That'll do, partner. That'll do just fine.",
        "Now that's got a sundown in it. I like a story that knows how it ends.",
      ],
      fine: [
        "Reckon that works.",
        "Fine by me. I've ridden worse.",
      ],
      counter: [
        "Close. Put a sunset on it and you've got something.",
        "What if we slowed it down and let it ache a little? The good kind of ache.",
      ],
      softNo: [
        "Not with my girl in the building, partner. She's never part of it.",
        "That's not my kind of ride. Find me one with some dust on it.",
      ],
    },
    shapes: ['retirement_tour', 'masked_mystery', 'legacy', 'comeback', 'mentor_student', 'grudge_match'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- Tamsin "Tiny" Tallbridge
  tiny: {
    id: 'tiny',
    traits: ['gentle', 'competitive', 'nurturing'],
    loves: ['PO-11', 'SG-09', 'ST-08', 'food', 'kids_spotlight', 'heartfelt', 'comedy'],
    redLines: [
      {
        id: 'tiny.cake',
        tags: ['mess'],
        line: "No cake in faces. Cake is for eating. I'll bake you a hundred cakes, and not one of them goes in a face.",
      },
    ],
    spins: [
      {
        replaces: 'PO-04',
        with: 'PO-11',
        line: "Sorry, no chairs. Pie-eating contest. I'll bake. No pie in faces. Pie is for eating.",
      },
      {
        replaces: 'PO-22',
        with: 'PO-11',
        line: "Pumpkin guts everywhere? No, thank you. Pie-eating contest. Pumpkin pie. In mouths. Where pie goes.",
      },
      {
        replaces: 'SG-02',
        with: 'SG-09',
        line: "Not a brawl. A standoff. Over the last cruller, at my counter. I'll make a really, really good cruller.",
      },
      {
        replaces: 'HK-01',
        with: 'HK-05',
        line: "I can't jump somebody. Sorry! But somebody could steal my grandma's recipe card. That's a mystery. With frosting.",
      },
    ],
    spotlight: 45,
    ego: 60,
    lovable: 2,
    motifs: ['Cruller', 'Sprinkle', 'Rolling Pin', 'Lemon Cake', 'Buttercream', 'Thimble', 'Tuck-In', 'Lattice'],
    wants: [
      "I've been thinking about a story. A whole one, with a beginning, a middle and an end. Can I tell you?",
      "I want to win something. Anything. I've lost the pie contest eight years running. I want this.",
      "I want a kid at ringside to get the biggest cake of their life. Well. Smallest. You know what I mean.",
      "I want an underdog story. I know, I know. Hear me out. Who roots for the giant? Let's find out.",
      "I want to work with Earl. Two giants. Gently.",
    ],
    nudges: [
      "*Tiny hands you a tiny cake with a tiny napkin flag stuck in it.*",
      "*Tiny rings you up and slips a little note under your change:* tonight? june's? i have an idea.",
      "*A cupcake the size of a thimble sits on your doorstep. Piped on top, in very small letters:* BOOTH",
      "\"Sorry! Sorry. Didn't mean to bonk the doorframe.\" *She leans way down and whispers:* \"After close. June's.\"",
      "*Tiny ties your box of crullers with a bow. Tucked under the string: a napkin with a very small drawing of a booth.*",
    ],
    opener: [
      "*She sets down a cake the size of a bottle cap.* Lemon. For you. Okay. Okay okay okay. Can I tell you?",
      "I drew it out already. Every slot. Very small handwriting. Sorry. You might need my glasses.",
      "I'm so nervous. That's silly. I'm seven feet tall. Okay. Here goes.",
    ],
    signoff: [
      "*very quietly* This is the best day of my life.",
      "*She signs in the tiniest letters you've ever seen, then dots the i with a sprinkle.*",
      "Signed! I'm baking something to celebrate. It'll be small. It'll be perfect.",
    ],
    booth: [
      "Bonked the curtain rod again. Every show. I think it's part of my entrance now.",
      "Earl ate thirty little cakes tonight. He says thirty is a 'reasonable number.' It is not.",
      "The kid in row one tonight got lemon. She cried. I cried. Mo asked if we were okay.",
      "Fenwick brought me rare sprinkles again. He started to say something. Didn't finish. I think it was nice.",
      "The twins came to the back door at eleven for cupcakes. In disguise. Bo had a mustache. Buck had a different mustache.",
    ],
    barks: {
      love: [
        "I made you a little something. It's lemon. ...Because I love it, is what I'm saying.",
        "Oh! Oh, that's so good. Can I bake for it? I'm baking for it.",
      ],
      fine: [
        "Okay! I'll say sorry before I hit anybody. Sorry in advance.",
        "That works. I'll bring a cake for the kid in row one.",
      ],
      counter: [
        "Hmm. What if there was a pastry in it? Everything's better with a pastry.",
        "Could it be gentler? I'll still win. Just gently.",
      ],
      softNo: [
        "I'd feel bad. Like, really bad. Sorry.",
        "That's kind of mean, isn't it? I don't do mean. Even pretend mean.",
      ],
    },
    shapes: ['underdog_title', 'gentle_monster', 'mentor_student', 'odd_couple', 'secret_admirer', 'hometown_hero'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- Odessa Pruitt, "Professor" Pinfall
  professor: {
    id: 'professor',
    traits: ['analytical', 'traditionalist', 'proud'],
    loves: ['PO-16', 'PO-03', 'PO-08', 'PO-18', 'mat_classic', 'rules', 'clean_finish'],
    redLines: [
      {
        id: 'professor.hardcore',
        tags: ['hardcore'],
        line: "A chair is not an argument. Show your work, or show yourself out.",
      },
      {
        id: 'professor.nodq',
        cards: ['PO-04'],
        line: "No disqualification means no rules. No rules means no proof. I decline to grade it.",
      },
    ],
    spins: [
      {
        replaces: 'PO-04',
        with: 'PO-16',
        line: "Anything goes? No. Everything counts. Pop Quiz Match. Right answers unlock moves. Wrong answers unlock growth.",
      },
      {
        replaces: 'PO-10',
        with: 'PO-03',
        line: "Fifteen bodies over a rope is not a story. It's a stampede. Two out of three falls: thesis, antithesis, synthesis.",
      },
      {
        replaces: 'PO-13',
        with: 'PO-18',
        line: "I can't grade what I can't see. Iron Hour. Sixty minutes, falls tallied on the chalkboard. In good lighting.",
      },
      {
        replaces: 'ST-07',
        with: 'ST-12',
        line: "Poultry is not a consequence. An apology is. Into the microphone. With citations.",
      },
    ],
    spotlight: 45,
    ego: 70,
    lovable: 0,
    motifs: ['Chalkboard', 'Red Pen', 'Pointer', 'Mortarboard', 'Equation', 'Pop Quiz', 'Proof', 'Sonnet'],
    wants: [
      "I want a student. Someone who'll boo me for a semester and pass the final.",
      "I want a story with rules. Clear stipulations. A rubric, if Birdie will allow it.",
      "I want twenty minutes of chain wrestling and a crowd that learns to count holds.",
      "I want to prove something. In the ring. Q.E.D. on the chalkboard, the whole bit.",
      "I want an Iron Hour. Falls tallied in chalk. I have been planning the math since July.",
    ],
    nudges: [
      "\"Wrong. Also wrong. Detention.\" *She hands you a graded paper. It's an F. In the margin:* see me. booth. 10 p.m.",
      "*Professor Pinfall writes on the library whiteboard:* x = THE BOOTH, t = 10. *She caps her marker and leaves.*",
      "\"Your form is a C-minus.\" *She sticks a note to your sleeve. It reads:* office hours. june's. tonight.",
      "\"Show your work.\" *She taps her watch twice, then points across the street at the diner.*",
    ],
    opener: [
      "Sit. Take notes if you like. There will be a quiz. There's always a quiz.",
      "*She uncaps a red pen.* I've outlined it. Fourteen beats. The turn comes at the ninth. Like a sonnet.",
      "Let's begin with a hypothesis. Then we'll test it on a Saturday.",
    ],
    signoff: [
      "*She signs, then writes Q.E.D. under her name.* Proven.",
      "Approved. Provisionally. Pending peer review. That's you.",
      "Good work. A-minus. The minus is for the ketchup.",
    ],
    booth: [
      "Wrestling's the only art where the audience writes half the poem. I've been trying to prove that for thirty years.",
      "Dex failed my class twice. Tonight he chained four holds on instinct. I may need a moment.",
      "My students booed me in the hallway today. Highest test scores in the state. Those facts are related.",
      "The new foster cat sat on my lesson plan. I left her there. She had a point about question four.",
      "Coach Lou taught me a crowd hums like an equation. Tonight it hummed in B-flat.",
    ],
    barks: {
      love: [
        "Elegant. Correct. Mm. Almost lovely.",
        "Show your work. ...Oh, you did. Gold star.",
      ],
      fine: [
        "Acceptable. B-plus.",
        "It holds up. I'll footnote it.",
      ],
      counter: [
        "Close. Add a stipulation and it becomes rigorous.",
        "Interesting hypothesis. Allow me to propose a more elegant proof.",
      ],
      softNo: [
        "Wrong. Fascinatingly wrong, but wrong.",
        "That isn't wrestling. That's noise with a bell at each end.",
      ],
    },
    shapes: ['mentor_student', 'grudge_match', 'tournament', 'legacy', 'odd_couple'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- Sweet Lou Bastian
  lou: {
    id: 'lou',
    traits: ['traditionalist', 'nurturing', 'superstitious'],
    loves: ['TW-16', 'PO-03', 'slow_build', 'old_school', 'mat_classic', 'legacy', 'heartfelt'],
    redLines: [
      {
        id: 'lou.audible',
        cards: ['TW-19'],
        line: "Some stories ain't for selling, young'un. That one stays on the creek bank with me.",
      },
    ],
    spins: [
      {
        replaces: 'PO-06',
        with: 'PO-03',
        line: "All that climbing. Slow down. Two out of three falls. Let 'em bite.",
      },
      {
        replaces: 'PO-13',
        with: 'PO-03',
        line: "Glow sticks? Lord. Give 'em two out of three falls and a quiet room. That's a show.",
      },
      {
        replaces: 'PO-10',
        with: 'PO-03',
        line: "Twenty folks going over a rope. Can't hear a story in a crowd that big. Two falls out of three, young'un.",
      },
      {
        replaces: 'TW-03',
        with: 'TW-16',
        line: "Mystery partner? Shoot. Just let an old man walk out and stand in the corner. Folks'll know what it means.",
      },
    ],
    spotlight: 15,
    ego: 25,
    lovable: 2,
    motifs: ['Catfish', 'Biscuit', 'Lure', 'Creek', 'Serenade', 'Cane', 'Lantern', 'Bucket Hat'],
    wants: [
      "I'd like to stand in somebody's corner, young'un. Somebody who needs an old man there.",
      "I want a slow one. Weeks. Let 'em bite before you set the hook.",
      "I want to see somebody learn the old way. Headlock, story, comeback. The bones of it.",
      "I want a comeback story. Fella gets knocked down, gets up slower, gets up anyway.",
      "I'd like a little song in it somewhere. Haven't sung to a crowd in a long while.",
    ],
    nudges: [
      "\"Fish are biting late tonight. Over at June's.\"",
      "*Lou doesn't look up from his line.* \"Big one's been circling the diner. Ten o'clock or so. Bring an appetite.\"",
      "*Sweet Lou tips his lure-covered hat.* \"Evening. Coffee's better after dark. Ask June.\"",
      "*He hums a slow bar of an old soul song, then winks.* \"That one's about a booth. You'd know which.\"",
      "\"Neither of us is in a hurry. But if you were, I'd say June's, later on.\"",
    ],
    opener: [
      "Sit down, young'un. Neither of us is in a hurry. That's the first lesson.",
      "*He stirs his chicory coffee slow.* Got a story. Not a new one. Just one that ain't been told right yet.",
      "Let me tell it the old way. Beginning, middle, and the part where you lean in.",
    ],
    signoff: [
      "Shake on it. That's a handshake from 1966. They don't make 'em like that anymore.",
      "*He signs in slow, curly script.* Good. Now let it bite.",
      "That'll keep. Good stories keep. Like a catfish in a cold creek.",
    ],
    booth: [
      "Wrestled a catfish two falls out of three once. Catfish took the second fall. Dirty. Used the current.",
      "Agnes waved at me from row one tonight. Lord. I nearly forgot my own cane.",
      "Some promises get heavier every year, young'un. You carry 'em anyway. That's what makes 'em promises.",
      "Earl sketched me by the creek again. Says I hold the rod like a microphone. Well. I do.",
      "That main event was slow in the middle, just right. The room leaned in. Feel that? That's the bite.",
    ],
    barks: {
      love: [
        "Now that's the old way. Let 'em bite.",
        "Mm-hm. That's a song I know the words to.",
      ],
      fine: [
        "That'll do. Fish'll bite at most anything if you're patient.",
        "Alright. I'll stand where you tell me.",
      ],
      counter: [
        "Slow down. Same story, half the speed. Twice the bite.",
        "Pretty. Now take the sparkle off and see if it still swims.",
      ],
      softNo: [
        "Too fast for me, young'un. Too fast for the crowd, too.",
        "All that flash. Folks can't hear a story over fireworks.",
      ],
    },
    shapes: ['mentor_student', 'legacy', 'comeback', 'reunion', 'retirement_tour', 'redemption'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- The Mothman (never speaks; notes and narration only)
  mothman: {
    id: 'mothman',
    traits: ['mischievous', 'private', 'superstitious'],
    loves: ['TW-12', 'PO-13', 'WC-14', 'night', 'mystery', 'supernatural', 'swerve'],
    redLines: [
      {
        id: 'mothman.unmasked',
        cards: ['TW-04', 'ST-04', 'ST-05'],
        line: "*A moth-shaped note slides across the booth. In block capitals:* NEVER. *Then, much smaller:* SORRY.",
      },
      {
        id: 'mothman.silent',
        cards: ['SG-01', 'SG-06', 'SG-05'],
        tags: ['live_mic'],
        line: "*The note has a drawing of a microphone, neatly crossed out. Beside it, a tiny moth, shrugging.*",
      },
      {
        id: 'mothman.kind',
        tags: ['menace', 'hardcore'],
        line: "*The note reads:* NOT LIKE THAT. *Beside the words, a little porch light is drawn, glowing.*",
      },
      {
        id: 'mothman.wednesday',
        cards: ['PO-12'],
        line: "*The note reads:* NOT WEDNESDAYS. *It is underlined twice.*",
      },
    ],
    spins: [
      {
        replaces: 'PO-04',
        with: 'PO-13',
        line: "*A moth-shaped note:* NO CHAIRS. LIGHTS OUT. *A tiny bulb is drawn in the corner, switched off.*",
      },
      {
        replaces: 'TW-04',
        with: 'TW-12',
        line: "*The note reads:* NEVER THE MASK. *Turn it over:* BUT I COULD DESCEND.",
      },
      {
        replaces: 'SG-01',
        with: 'SG-03',
        line: "*The note reads:* NO WORDS. I'LL RUN IN. *There's a doodle of a moth sprinting, which is not how moths move.*",
      },
      {
        replaces: 'HK-04',
        with: 'HK-10',
        line: "*The note shows a gift-wrapped box, drawn with care. One feathery antenna pokes out from under the lid.*",
      },
    ],
    spotlight: 40,
    ego: 10,
    lovable: 2,
    motifs: ['Porch Light', 'Moth', 'Wing', 'Lantern', 'Water Tower', 'Bulb', 'Midnight', 'Stump'],
    wants: [
      "*A moth-shaped note waits in the booth. Block capitals:* SOMEONE NEEDS A MIRACLE. SATURDAY.",
      "*A note on the Moth Stump:* LIGHTS OUT. YOU PICK THE NIGHT.",
      "*A paper moth, wings spread. Written on one wing:* THE END OF THE STORY. *On the other:* ME.",
      "*A note under the sugar jar:* WHO DOES THE CROWD NEED HELPED? I'LL BE THERE.",
      "*A note:* THE BUTTERFLY. ASK HER. *Below it, a tiny doodle of a moth bowing.*",
    ],
    nudges: [
      "*A moth-shaped note is tucked under your door. It has a single checkmark on it.*",
      "*Your porch light flickers twice, then holds steady. On the step: a scrap of dusty brown felt.*",
      "*On the Moth Stump by the water tower, someone has left a folded paper moth. Its wings point toward the diner.*",
      "*Walking home after dark, every porch light on the street hums at once. Then only one stays lit: the one nearest June's.*",
      "*A note is tucked into your boot. Block capitals:* SATURDAY. AFTER DARK. YES.",
    ],
    opener: [
      "*In the booth, where nobody was sitting, a moth-shaped note waits under the sugar jar.*",
      "*The booth's bulb flickers. When it steadies, there's a paper moth perched on the napkin dispenser.*",
    ],
    signoff: [
      "*At dawn the napkin is gone. In its place, a scrap of dusty brown felt and a single checkmark.*",
      "*The signed napkin has a new mark at the bottom: a tiny moth, drawn in one careful line.*",
      "*A note on the Moth Stump:* AGREED. *It's signed with a smudge of wing dust.*",
    ],
    booth: [
      "*Somebody left a jar of honey on the booth table. There's a moth sticker on the lid. Nobody saw who.*",
      "*The bulb over the booth flickers once when someone mentions the main event. June pretends not to notice.*",
      "*A paper moth sits on the jukebox, wings spread wide, which is how moths look when they're happy.*",
      "*A note under the ketchup bottle:* GOOD SHOW. *And, smaller:* TELL THE BEAR.",
    ],
    barks: {
      love: [
        "*The Mothman tilts its head. A single moth lands on the card and opens its wings.*",
        "*A note appears beside the card: one big checkmark, traced over twice.*",
      ],
      fine: [
        "*The Mothman tilts its head, then nods once.*",
        "*A moth lands on the card, considers it, and stays.*",
      ],
      counter: [
        "*The Mothman tilts its head the other way. A note slides over:* WHAT IF DARKER? (THE LIGHTS. NOT THE STORY.)",
        "*A paper moth is set down on a different card in your Tin. Its wings point at it.*",
      ],
      softNo: [
        "*The Mothman tilts its head and slowly folds its wings.*",
        "*The porch light flickers. When it steadies, the card has been turned face down.*",
      ],
    },
    shapes: ['cryptid_hunt', 'masked_mystery', 'haunted_locker', 'comeback', 'secret_admirer'],
    canPitch: false,
  },

  // ---------------------------------------------------------------- Referee Mo (Maribel Dizon)
  mo: {
    id: 'mo',
    traits: ['loyal', 'mischievous'],
    loves: ['TW-05', 'SG-04', 'swerve', 'comedy', 'improv', 'prank'],
    redLines: [],
    spins: [
      {
        replaces: 'TW-01',
        with: 'TW-05',
        line: "Somebody's got to go down for the twist? Let it be me. Sack of Mail. I'll hit the floor like a dropped mailbag.",
      },
      {
        replaces: 'SG-02',
        with: 'SG-04',
        line: "Skip the brawl. Special delivery. I bring the contract to the ring. Sign here. And here. And duck.",
      },
    ],
    spotlight: 15,
    ego: 20,
    lovable: 2,
    motifs: ['Mailbag', 'Envelope', 'Whistle', 'Stripes', 'Postmark', 'Route', 'Special Delivery', 'Rain Poncho'],
    wants: [
      "I want to go down. Big. Sack of Mail, through the ropes, flat on the floor. It's been a while.",
      "I want to bring the contract. Special delivery. In the stripes. I'll even ring a little bell.",
      "Villains keep knocking me out. I want to show up with more padding every week. Bubble wrap by the payoff.",
      "I want one night where the ref doesn't go down. Chairs, ladders, Dex. I dodge it all and count the pin. Clean.",
      "I'd like to be part of the twist for once. Not the furniture. A piece of the story.",
    ],
    nudges: [
      "*Referee Mo delivers an envelope with no words in it, just a doodle of a napkin.*",
      "\"Certified mail. Sign here.\" *The slip has no sender. Just a little drawing of a coffee cup and a clock that says ten.*",
      "\"I call what I see.\" *She hands you your mail. On top, a postcard of the Hot Tag Diner. No message. Postmarked today.*",
      "*Mo tips her cap at your mailbox and leaves an envelope marked* SPECIAL DELIVERY. *Inside: one sugar packet from June's.*",
    ],
    opener: [
      "Special delivery. That's me. I've got a pitch. Sign here. And here. And duck. Kidding. Mostly.",
      "*She sets her satchel on the booth seat like it's a passenger.* Okay. I've been keeping this one folded up a while.",
      "I don't pitch much. Refs are furniture. But this chair's got an idea.",
    ],
    signoff: [
      "Signed, sealed, delivered. I'll see myself out. Through the ropes, ideally.",
      "*She stamps the napkin with a rubber stamp from her pocket:* DELIVERED.",
      "Good. I'll pad my elbows. Possibly my everything.",
    ],
    booth: [
      "Refs are furniture. Good furniture. Nobody thanks the chair, but try sitting down without one.",
      "Agnes yelled at me at her mailbox about a missed call. From March. I respect the commitment.",
      "Jobber followed me to the curb again. I gave him a cracker. He gave me a bottle cap. We're even.",
      "My mom called from Stockton. All four of my siblings got on the phone at once. I said maybe six words. Best call all week.",
    ],
    barks: {
      love: [
        "Oh, I'm going DOWN for that one. Through the ropes, flat on the floor. Beautiful.",
        "Special delivery. That's a yes, signed and stamped.",
      ],
      fine: [
        "I call what I see.",
        "Works for me. I've got a route to walk in the morning, but sure.",
      ],
      counter: [
        "What if the ref went down right there? Just a thought. From the ref.",
        "Close. Add a contract. I'll bring it in my satchel.",
      ],
      softNo: [
        "Crooked ref for a week, tops. I've got a route to walk. People trust me with their mail.",
        "Not sure about that one. Refs are furniture, but furniture's got feelings.",
      ],
    },
    shapes: ['managers_war', 'prank_war', 'stolen_belt', 'tournament'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- Gus Gravel
  gus: {
    id: 'gus',
    traits: ['showboat', 'romantic'],
    loves: ['SG-05', 'SG-06', 'spectacle', 'supershow', 'romance', 'heartfelt', 'title'],
    redLines: [],
    spins: [
      {
        replaces: 'SG-01',
        with: 'SG-05',
        line: "Why use a ring mic when you could use the whole county? Call-in segment, folks! The lines are OPEN!",
      },
      {
        replaces: 'SG-12',
        with: 'SG-06',
        line: "A parking lot? Nobody can hear a parking lot! Two chairs, my desk, and the hard questions. Gently asked.",
      },
    ],
    spotlight: 60,
    ego: 35,
    lovable: 3,
    motifs: ['Old Thunder', 'Microphone', 'Static', 'Jingle', 'Porch Hour', 'Ring Card', 'Headphones', 'Airwaves'],
    wants: [
      "I want to name something, kid. I've had 'the CRULLER CONFLICT' in my back pocket since spring.",
      "I want a call-in segment. A villain gloats on The Gravel Pit, the hero calls back, and the phones melt.",
      "I want a wedding. Or a reunion. Something I can cry through on air while Buck makes fun of me.",
      "I want to call a title change. Break right out of my own text box. AND NEWWWW...",
      "I want a story the whole county can follow on the radio, even folks who can't make the Sportatorium.",
    ],
    nudges: [
      "*Gus Gravel on WRSL:* \"This next one goes out to a certain somebody. You know where to find me.\"",
      "\"Ladies and gentlemen... at the counter... weighing in at one coffee... {name}!\" *Then, quieter:* \"See you tonight.\"",
      "*On the morning show:* \"Skies are clear, the Mountain's at large, and the Hot Tag's serving pie late tonight. Real late.\"",
      "*Gus announces you on Main Street at full ring volume, then adds:* \"...APPEARING TONIGHT, AT JUNE'S!\"",
      "*On WRSL:* \"Shout-out to a listener with a lot on their mind. Coffee's on me after close. You know the place.\"",
    ],
    opener: [
      "*He clears his throat into a napkin like it's Old Thunder.* Ladies and gentlemen... my pitch.",
      "Kid, I've said other people's names into a microphone for forty years. Let me say a story into one.",
      "I'll keep it short. *He does not keep it short.* Okay. Medium.",
    ],
    signoff: [
      "AND IT'S OFFICIAL! *Three heads turn at the counter. He lowers his voice.* It's official.",
      "Signed! I'm already working on the name. Something with alliteration. Something with THUNDER.",
      "*He signs with a flourish that runs right off the napkin.* That's a broadcast, kid. That's a broadcast.",
    ],
    booth: [
      "Forty years of saying other people's names into a microphone. Best job in the world. Nobody says yours back, though.",
      "Jobber stole the mic cord again tonight. We fought. I lost. I always lose. He's got thumbs, basically.",
      "Hank's beaten me at cribbage something like fourteen hundred times. Fourteen hundred and one, as of Sunday.",
      "Did you hear that pop on the hot tag? I put my headphones back on just to hear it twice.",
      "Clementine's review tomorrow is gonna be rough. I'll read it on air in my saddest voice. Folks love it.",
    ],
    barks: {
      love: [
        "They're calling it... the CRULLER CONFLICT! Okay, nobody's calling it that yet. I will be.",
        "Oh, that's a radio story, kid! The phones are gonna MELT.",
      ],
      fine: [
        "I can sell that. I can sell anything. I once sold a tuna melt.",
        "Good, good. I'll give it a name it can grow into.",
      ],
      counter: [
        "Close! Needs a moment the whole county can hear. A call-in, maybe?",
        "Give it a sweet ending, kid. Something I can get choked up announcing.",
      ],
      softNo: [
        "Kid, I can't hype that. My listeners trust me.",
        "Folks'll change the station. And there's only one station.",
      ],
    },
    shapes: ['wedding', 'reunion', 'tournament', 'secret_admirer', 'underdog_title'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- June Oyelaran (Madame Midnight, retired)
  june: {
    id: 'june',
    traits: ['proud', 'mischievous', 'nurturing'],
    loves: ['TW-08', 'HK-08', 'swerve', 'heartfelt', 'old_school', 'food', 'comedy'],
    redLines: [],
    spins: [
      {
        replaces: 'TW-07',
        with: 'TW-08',
        line: "A double agent? Honey, why hire a spy when you could hire Madame Midnight? I'll bring the fan.",
      },
      {
        replaces: 'HK-01',
        with: 'HK-08',
        line: "No parking-lot jumps outside my diner. Make the bet at my counter. Witnesses, coffee, and the loser tips big.",
      },
    ],
    spotlight: 30,
    ego: 55,
    lovable: 2,
    motifs: ['Coffee Pot', 'Chipped Mug', 'Jeweled Fan', 'Midnight', 'Jukebox', 'Cobbler', 'Gong', 'Bangle'],
    wants: [
      "Honey, I want a client. Somebody who needs a manager with a bigger hat than their ego.",
      "I want one more run with the fan. One story. Then I'm back behind the counter. Probably.",
      "I want a comeback story. Not mine. ...Okay, maybe a little bit mine.",
      "I want the diner in it. My counter, my pie, my chipped mug. Not the booth. Never the booth.",
      "I want somebody to get distracted at exactly the wrong moment. I know how. I invented how.",
    ],
    nudges: [
      "*June sets down your check. Under the total, in red pen:* stay late.",
      "*June refills your coffee without asking.* \"Kitchen closes at nine, baby. The coffee doesn't.\"",
      "*June fans herself with a jeweled fan, then points it toward the back of the diner like a referee's blind side.*",
      "\"You look hungry. Come back after close. Nobody leaves hungry.\"",
      "*Your to-go box has a note on the lid in June's handwriting:* Back tonight. Bring your appetite and an idea.",
    ],
    opener: [
      "Sit down, baby. Eat first. Then we talk. That's the rule.",
      "*She slides into the booth holding the coffee pot like a scepter.* I've managed bigger egos in smaller hats. Listen.",
      "Honey, I've been sitting on this one since before the jukebox got fixed.",
    ],
    signoff: [
      "Done. Now eat your pie. Nobody leaves hungry.",
      "*She snaps the jeweled fan shut.* That's a deal. Madame Midnight approved.",
      "Good. And if Birdie fusses, send her to me. I've got her coffee.",
    ],
    booth: [
      "One: what's said in the booth stays in the booth. Two: nobody leaves hungry. Three: if Birdie's crying, you didn't see it.",
      "Gus announced my jollof special at full volume again. Sold out by noon. I'm not thanking him.",
      "Royce Penn came in for lunch. Chipped mug. Every time. Forever.",
      "I listened to the main event on the kitchen radio. Burned the toast at the finish. Good finish.",
      "Lou wants his cobbler warm. Lou always wants his cobbler warm. Lou is going to get his cobbler warm.",
    ],
    barks: {
      love: [
        "Now THAT'S a story, baby. Pass me my fan.",
        "Ooh. Honey, that's got some midnight in it. I like it.",
      ],
      fine: [
        "It'll do. Eat something.",
        "Fine. Not my kind of hat, but fine.",
      ],
      counter: [
        "Close, baby. Needs a manager. I know a good one.",
        "What if somebody got distracted at exactly the wrong moment? I could arrange that.",
      ],
      softNo: [
        "Not in my diner, honey.",
        "That's rude. And I don't manage rude.",
      ],
    },
    shapes: ['managers_war', 'comeback', 'reunion', 'redemption', 'odd_couple'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- Hank Szabo
  hank: {
    id: 'hank',
    traits: ['analytical', 'private'],
    loves: ['PO-05', 'PO-06', 'SG-04', 'rehearsed', 'rules', 'clean_finish', 'old_school'],
    redLines: [],
    spins: [
      {
        replaces: 'PO-04',
        with: 'PO-05',
        line: "Anything goes is how people get hurt. Give me a cage. I built it. I test-ran it. It's safe.",
      },
      {
        replaces: 'SG-02',
        with: 'SG-04',
        line: "Backstage is all corners and fire extinguishers. Put a table in the ring. My table. It'll break exactly right.",
      },
    ],
    spotlight: 5,
    ego: 20,
    lovable: 2,
    motifs: ['Sawdust', 'Wrench', 'Breakaway', 'Cage', 'Ladder', 'Turnbuckle', 'Tape Measure', 'Walnut'],
    wants: [
      "Want to build something. Cage. Ladder. Table. You pick. I'll make it sing.",
      "Got a breakaway table that's been waiting for a contract signing. Scored perfect.",
      "I'd like a ladder match. My ladder. Nobody's knocking it over. That's the story.",
      "Want something to collapse on schedule. Four seconds. I've done the math.",
    ],
    nudges: [
      "*Hank hands you a lumber receipt. On the back, in carpenter's pencil:* booth. 10. bring coffee.",
      "*Hank taps her tape measure against your shoulder. Two taps. Then she points it at the diner.*",
      "*Plumb trots up on three cheerful legs with a folded napkin. In Hank's block letters:* JUNE'S. LATER.",
      "\"Ring's done. Ropes sing.\" *She wipes her hands on her overalls.* \"Got something else to talk about. Diner. After.\"",
    ],
    opener: [
      "Few words. Here they are.",
      "*She unrolls a blueprint over the napkin.* Napkin's too small. Blueprint's better. Listen.",
      "Got an idea. It's load-bearing. Hear me out.",
    ],
    signoff: [
      "Good. I'll build it. You'll rehearse it. Friday.",
      "*She signs with a carpenter's pencil, square letters.* Done. Measure twice.",
      "Shook. Plumb witnessed. That's binding.",
    ],
    booth: [
      "Every ring has a voice. This one's a little flat on the north side. Been meaning to fix it since 1994.",
      "Table broke perfect tonight. Seven pieces. Nobody touched a splinter. That's the job.",
      "Gus owes me a coffee per cribbage game. Fourteen hundred games. That's a lot of coffee.",
      "The twins borrowed my clamps again. Both sets. Separately. For the same project.",
    ],
    barks: {
      love: [
        "I'll build it. You'll rehearse it.",
        "Now that's a prop worth a Friday.",
      ],
      fine: [
        "Fine. It'll hold.",
        "Workable.",
      ],
      counter: [
        "Needs a test run. Friday. Everybody shows up.",
        "Close. Swap that for something I can build safe.",
      ],
      softNo: [
        "No.",
        "Not without a test run. Not ever.",
      ],
    },
    shapes: ['odd_couple', 'stolen_belt', 'tournament', 'haunted_locker'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- Marigold Iyer
  marigold: {
    id: 'marigold',
    traits: ['romantic', 'analytical'],
    loves: ['ST-07', 'HK-11', 'HK-20', 'SG-15', 'gear', 'entrance', 'romance'],
    redLines: [],
    spins: [
      {
        replaces: 'HK-03',
        with: 'HK-11',
        line: "A handshake? Snooze. Ruin a robe on screen. I'll sew a stunt double. The real one stays safe in my shop.",
      },
      {
        replaces: 'ST-02',
        with: 'ST-07',
        line: "Bragging rights doesn't come with a costume. The chicken suit does. I just re-feathered the whole tail.",
      },
    ],
    spotlight: 20,
    ego: 35,
    lovable: 2,
    motifs: ['Sequin', 'Thread', 'Chicken Suit', 'Pincushion', 'Quilt', 'Robe', 'Tassel', 'Velvet'],
    wants: [
      "I want a robe reveal. A real one. Tear-away, three layers, the crowd gasps on the second.",
      "I want the chicken suit in a story. I re-feathered it. It deserves an audience.",
      "I want matching tag gear. Two people, one color story. Maybe a cape. Probably a cape.",
      "I want a wedding story. Not for me. For the gear. Have you seen what I can do with lace?",
    ],
    nudges: [
      "\"I don't follow wrestling. I just sew. Hold still.\" *They pin your hem and murmur:* \"Diner. Ten. Wear the good jacket.\"",
      "*Marigold measures you without asking, muttering numbers. The last number is* 10. *They add:* \"P.M. June's.\"",
      "*A garment bag arrives at your door. Inside: nothing but a pinned note:* fitting at the diner tonight. bring ideas.",
      "\"Your left shoulder sits higher than your right.\" *They tuck a fabric swatch in your pocket. Written on it:* later?",
    ],
    opener: [
      "*Pins in mouth* Okay. Okay okay. *takes pins out* Sorry. Okay. I have sketches.",
      "Everybody thinks gear is decoration. Gear is the first thing the crowd believes. So. I have a story about gear.",
      "I made a mood board. On a napkin. Don't laugh, it's a very good napkin.",
    ],
    signoff: [
      "*They sign, then stitch a tiny marigold into the corner of the napkin with a travel needle.*",
      "Done. I need everybody's measurements by Friday. Yes, again. Bodies change. Shoulders lie.",
      "I'm going to cry at this entrance. I cry at all the entrances. Plan for it.",
    ],
    booth: [
      "Gideon's robe ripped up the back an hour before the show. I sewed it shut on him. We both screamed. It was perfect.",
      "Velma said my stitches were 'acceptable.' That's the nicest thing she's said since spring.",
      "Gear is a promise in thread. Tonight everybody kept theirs.",
      "The quilt has a new square. A sequin from tonight's main event. Don't ask how I got it.",
    ],
    barks: {
      love: [
        "Oh, I can make that SING. Sit down, I need to sketch.",
        "I can make you look like a hero or a chicken. This one? Both. Beautiful.",
      ],
      fine: [
        "Fine. I'll make it look better than it is.",
        "Okay. I'll need fittings.",
      ],
      counter: [
        "Close. What if there was a reveal? There should always be a reveal.",
        "Could the gear do something? Gear wants to do something.",
      ],
      softNo: [
        "I don't sew anything that makes fun of somebody's body. Ever. Pick another.",
        "That idea squeaks. Like cheap satin.",
      ],
    },
    shapes: ['wedding', 'reinvention', 'secret_admirer', 'odd_couple'],
    canPitch: true,
  },

  // ---------------------------------------------------------------- Doc Halloran
  doc: {
    id: 'doc',
    traits: ['nurturing', 'analytical'],
    loves: ['HK-07', 'injury_worked', 'solemn', 'heartfelt', 'slow_build', 'clean_finish'],
    redLines: [
      {
        id: 'doc.orders',
        cards: ['TW-09'],
        unlessFlag: 'doc_signs_off',
        line: "Doctor's orders are real orders. Nobody goes down on screen until I've signed off. Red's real. Blue's art.",
      },
    ],
    spins: [
      {
        replaces: 'TW-09',
        with: 'TW-15',
        line: "Not without my sign-off. How about secret training instead? Nobody gets hurt, and everybody gets better.",
      },
      {
        replaces: 'PO-04',
        with: 'PO-03',
        line: "No chairs, please. My waiting room is full enough. Two out of three falls. Lovely. Nobody needs ice.",
      },
      {
        replaces: 'HK-01',
        with: 'HK-19',
        line: "Blindsides make me nervous. How about a rematch clause? Old loss, new date. Much gentler on the vertebrae.",
      },
    ],
    spotlight: 10,
    ego: 20,
    lovable: 2,
    motifs: ['Butterscotch', 'Juniper', 'Bonsai', 'Stretcher', 'Neck Brace', 'Cardigan', 'Liniment', 'Slow Count'],
    wants: [
      "I'd like a comeback story. Someone gets hurt on paper, heals on paper, and walks back out for real.",
      "I want to play the ringside doctor. The solemn headshake. I've been practicing it in the mirror.",
      "I want a stretcher exit. Slow. Dignified. I'll walk beside it the whole way. Slowly.",
      "I want a story where nobody really gets hurt and everybody believes it. That's my favorite kind.",
    ],
    nudges: [
      "\"Walk it off. No, really. Walk. Let me watch.\" *He hands you a butterscotch. The wrapper says* 10 p.m. *in pen.*",
      "*Doc adjusts your back with a crack that echoes down the street.* \"There. Follow-up tonight, June's. Doctor's orders.\"",
      "*Your appointment card from Halloran Chiropractic lists a follow-up. Location:* back booth. *Time:* after the show.",
      "\"That's a sore subject. We'll discuss it privately.\" *He winks, which takes him a while.*",
    ],
    opener: [
      "Sit. Slowly. ...Good. I've been tending an idea, like the juniper. It took a while.",
      "*He unwraps a butterscotch, very slowly.* Bear with me. I don't hurry, even for a good story.",
      "I'll keep this brief. *a pause* Brief for me.",
    ],
    signoff: [
      "Signed. And I'm signing off on the bumps. That's the other signature that matters.",
      "*He signs in neat, unhurried script.* Doctor's orders: enjoy it.",
      "Good. Now everybody stretch. I mean it. Hamstrings.",
    ],
    booth: [
      "Matching neck braces for the twins tonight. They were not going to hug. I told them not to anyway.",
      "Somebody asked me 'Doc, quick question' in the cereal aisle. There's no such thing as a quick question, dear.",
      "Red's real. Blue's art. Tonight the injury board was all blue. Best kind of night.",
      "The juniper put out a new shoot this week. Slow and steady. Like everything worth doing.",
    ],
    barks: {
      love: [
        "Oh, that's lovely. Nobody gets hurt and everybody believes it.",
        "Now that I can sign off on. Gladly.",
      ],
      fine: [
        "Fine. Stretch first.",
        "That'll do. I'll bring the ice anyway.",
      ],
      counter: [
        "Slow it down a touch. Bodies like slow.",
        "What if I came out with the stretcher? Just a little gravitas.",
      ],
      softNo: [
        "Not on my watch. Doctor's orders are real orders.",
        "That's a lot of bumps for one month. My waiting room's full, dear.",
      ],
    },
    shapes: ['comeback', 'mentor_student', 'redemption', 'retirement_tour'],
    canPitch: true,
  },
};
