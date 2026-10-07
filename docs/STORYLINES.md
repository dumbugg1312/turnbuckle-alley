# Turnbuckle Alley: Storylines

*The storyline system and its content library.*

- **Canon source:** `docs/_context_for_writers.md`. Nothing here contradicts it. Where this document goes deeper, it builds on the canon and never replaces it.
- **Companion doc:** `docs/CAST.md`, written in parallel, is authoritative on who people are. When CAST.md and this document disagree about a character's history or personality, CAST.md wins and this document's tables get updated to match.
- **Audience:** writers, designers and engineers. Sections 1 to 14 explain what it feels like and how it works. Section 15 is the implementation spec. Section 16 walks five storylines from pitch to payoff.

> **Aligned with CAST.md.** CAST.md arrived while this document was being written, and this document follows it. Clint's masked alter ego is **the Dust Devil**. His daughter is **Lacey Ransom**, 16, an amateur wrestler on Coach Patty's team. The Velvet Hammers' never-performed team finisher is **the Encore**. *The Gravel Pit* is Gus's weekday morning show. **Royce Penn**, the player's old MaxxMedia boss, runs the late-game rival promotion. A few working choices remain, and CAST.md or the main story doc can overrule them without changing any mechanics:
> - The **Mothman's identity** is defined in CAST.md. This system treats it as a sealed field and never reads or reveals it.
> - The rival promotion's brand is called **"MAXX Megatour."**
> - Seasonal supershows fall on **the last Saturday of each season.**

## Contents

1. Design goals and feel
2. The pitch conversation
3. Story structure
4. Story cards (109 cards)
5. Story shapes (31 shapes)
6. Personality and pushback
7. Birdie as booker
8. The crowd steers
9. Flops and saves
10. Real life bleeds in
11. Emotional storylines
12. The variation math
13. Booking Mode (the Pencil)
14. Tie-in to the main story
15. Implementation spec
16. Five worked example storylines

---

## 1. Design goals and feel

It's 10:40 on a Saturday night. The Sportatorium lights are off, and the confetti is still in everyone's hair. In the back booth of the Hot Tag Diner, Tiny Tallbridge is cutting a cake the size of a coaster into eight perfect slices, Big Earl has his reading glasses on, and Gorgeous Gideon is blotting his forehead with a napkin he will later regret. June slides a fresh napkin across the table, the clean one, and clicks a pen. Somebody says, "Okay. What if..."

**That is the game.** This system exists to put the player in the room where wrestling stories get written, and then let them walk out into a town that believes every word.

### Three tables

A Turnbuckle Alley storyline lives at three tables, and the fun comes from moving between them.

| Table | Where | Who is there | What happens |
|---|---|---|---|
| **The booth** | The Hot Tag back booth, the locker room, Birdie's office | Insiders, as their real selves | Stories get pitched, argued over, reshaped and laughed about. |
| **The ring** | The VFW Hall on Wednesdays, the Sportatorium on Saturdays, supershows | Insiders in character, the crowd | Stories get told through matches, promos, run-ins and contract signings. |
| **The town** | The bakery, Main Street, the Tattler, WRSL, the fairgrounds | Insiders in character, marks being themselves | Stories get *believed*. The bakery charges villains extra and Sheriff Bev tries to make an arrest. |

### What a great storyline moment feels like

- At Wednesday's VFW show, the villain you helped invent steps on the bingo caller's microphone cord, and fifty folding chairs boo at once. Somebody yells "B-FOUR YOU GO, YOU BUM."
- On Thursday morning, the price board at Tallbridge Bakery has a name chalked next to its canon line: `VILLAIN SURCHARGE: $1 (YES, GIDEON, YOU)`.
- The Sunday Tattler runs a headline you caused: **"WHERE IS THE RECIPE CARD? TOWN DEMANDS ANSWERS."**
- Pip is on the sidewalk outside the hardware store with a new cardboard sign. It predicts your twist. He's wrong, and he's going to be so happy when he finds out what really happens.
- On Saturday night the payoff match ends, Agnes is on her feet, and Gus Gravel's voice cracks on the microphone. Afterward, in the booth, everybody pretends they didn't cry.

The player wrote some of that, steered some of it, and got surprised by the rest. That mix is the target.

### What the player does from moment to moment

A storyline plays out across real weeks of in-game time. A day lasts fifteen real minutes, so one storyline week takes about 1 hour 45 minutes of play. Storyline content is spread through the week so there is always one small, optional thing to do and one big thing to look forward to.

| Day | Storyline activity (all optional) |
|---|---|
| **Sunday** | The Tattler reviews Saturday's show. The town buzzes about it, with chalk drawings on the sidewalk and talk at the bakery. |
| **Monday** | *The Gravel Pit* airs on WRSL from 6 to 10 a.m., and villains call in to gloat (you can too). Birdie's office opens for pitch verdicts after the show. |
| **Tuesday** | A town moment or public angle. Planning in the locker room or the booth. |
| **Wednesday** | The VFW show: small, rowdy story beats, then bingo. The booth afterward. |
| **Thursday** | The Tattler reviews Wednesday's show. *The Gravel Pit* airs again. A town moment. |
| **Friday** | A town moment. The call sheet for Saturday's finishes gets written in the locker room. |
| **Saturday** | The Sportatorium show with the big beats and the payoffs. The booth afterward, which is where most pitches happen. |

### Why it's cozy: seven pillars

1. **You're invited, never required.** If you're in a beat and skip the show, the story holds your spot until the next one. If you aren't in it, the beat plays out without you, and you can read about it in the Tattler. Nothing is lost by going fishing for tapes instead.
2. **Nobody gets truly hurt.** Villains are ornery, never cruel. Birdie's house rule is "We don't do mean. We do ornery." (See 3.6, The Ornery Line.)
3. **Failure is funny.** A flopped story becomes a Tattler joke, a lesson and, later, a callback the crowd loves.
4. **People have opinions.** Pushback from the cast is part of the charm. Gideon refusing the clippers is a *scene* that the player gets to enjoy, and it never blocks progress.
5. **The town believes.** Kayfabe is the reward loop. You get to watch your fiction become the town's reality.
6. **Control is a dial.** Each player decides how much of the story they write, and can change their mind on any pitch.
7. **Stories remember.** Old storylines become callbacks, rivalries pick up where they left off, and the crowd remembers too.

### Design goals we can test

- After three storylines, a playtester can describe each to a friend, and all three sound different.
- Every storyline produces at least one town moment worth screenshotting.
- Every storyline has at least one booth scene where the characters are visibly themselves.
- No storyline requires the player to wrestle. Wrestling is rewarded and never required.
- A player who never touches the pitch system still sees good stories happen to them and around them (see the "Let Birdie handle it" setting in 2.6).

---

## 2. The pitch conversation

### 2.1 Where pitches happen

Kayfabe can never break, so **no one talks shop in public.** Pitches happen only in the three insider spaces:

| Space | When | What it's for |
|---|---|---|
| **The Hot Tag back booth** | After every show (about 10 p.m. to midnight) and on most evenings | The main pitch table. Casual pitches, group pitches, mid-story huddles and reactions after the payoff. |
| **The locker room** | Before and during shows | Quick pitches ("I've got a thought for tonight"), call sheets and finishes, last-minute twists. |
| **Birdie's office** | Monday and Thursday mornings | Formal pitches and Birdie's verdicts, plus career talks. In Booking Mode, it becomes your office. |

### 2.2 How residents approach you in public: the nudge

When an insider wants to pitch, they find you in town and give you a **nudge**. A nudge is always in character and always harmless to overhear, but it tells you clearly that they want you at the booth. A nudge adds a small napkin icon to your calendar, and the pitch waits for you at the booth. **Pitches never expire.** Characters will wait, and they'll mention it fondly ("Still thinking about that cake thing, whenever you are").

Sample nudges:

- **Big Earl** stamps your library card, and the due date reads `BOOTH`.
- **Rosa**, as La Mariposa, never speaks in public. At the taqueria she makes a gesture, and Abuela Celia translates from the register: "She says the booth, ten o'clock. She also says eat more."
- **Gideon** at the salon, loudly, for the customers: "Darling, your split ends and I need to have a *conversation*. Tonight."
- **Referee Mo** delivers an envelope with no words in it, just a doodle of a napkin.
- **Dex** writes `BOOTH?` in the frost on the gas station ice machine.
- **Tiny** hands you a tiny cake with a tiny napkin flag stuck in it.
- **Gus Gravel** on WRSL: "This next one goes out to a certain somebody. You know where to find me."
- **Sweet Lou** at Chokeslam Creek: "Fish are biting late tonight. Over at June's."
- **Birdie** doesn't nudge. She sends a note: "My office. Bring a donut."

### 2.3 When: pitch triggers

| Trigger | Example | Usually pitched by | How often |
|---|---|---|---|
| **The booth after a show** | After any Wednesday or Saturday show, 1 to 3 people in the booth have ideas, and you choose whose to hear. | Anyone in the booth | Every show |
| **An idle wrestler** | Someone has gone 2 or more weeks without a storyline and gets restless. | That wrestler | When it happens |
| **A new card in your tin** | You catch a "Masked Stranger" card on a tape, and Rosa asks about it. | The character whose tags match the card best | Sometimes |
| **A friendship milestone** | At 5 hearts, an insider shares a story card. At 7, they offer their signature storyline. | That character | At milestones |
| **A real-life event** | Hazel is cleared to wrestle, Dex gets a MaxxMedia letter, the twins have a real argument, a romance reaches a new stage. | The people involved | Event-driven |
| **The crowd** | The crowd starts a chant on its own, or a villain's shirts outsell the hero's. | The wrestler being chanted for | Event-driven |
| **A supershow window** | A supershow is 4 to 6 weeks out, and everyone wants a piece of it. | Several people at once | Seasonal |
| **An assignment from Birdie** | "I need something for the opener, sugar. Make it sing." | Birdie | Early game, regularly |
| **You** | Open your Recipe Tin, pick a card and bring it to someone. That uses "I've got an idea" (2.6). | You | Whenever you like |
| **A protégé** (late game) | A booker in one of your towns sends a pitch up for your verdict. | Protégés | Late game |

**Pitch pace** is a player setting: *Chatty* (2 to 3 pitches a week), *Steady* (1 to 2, the default) or *Quiet* (about one every two weeks, plus signature storylines and anything the player starts).

### 2.4 Whose story is it? Pitch scopes

The player isn't the booker at first, but they're never shut out of stories. A pitch has one of three **scopes**:

- **For you.** You're in it as hero, villain, partner or mystery figure. This is available from day one.
- **Consult.** A friend wants help with *their own* story and asks your opinion. You help shape the napkin, and they take it to Birdie under their own name. This is available from day one, and it's how the player gets to touch the whole roster's stories long before holding the book. Good consults earn Ledger credit with Birdie (see 7.3).
- **Board.** Once you're assistant booker (Wednesdays) or hold the Pencil (everything), you can pitch for any match on a card you book.

### 2.5 The flow of a pitch

1. **The nudge** (in public). A napkin icon shows up on the calendar.
2. **The sit-down** (in an insider space). The pitcher opens with a *want*, not a plan: "I want to get my hands on a title." "I need something for my last run." "I want the crowd to see me differently."
3. **Choose your involvement.** Three choices appear, with your default already selected. One tap keeps the default.
4. **The napkin.** The story slots are drawn on a diner napkin, with ketchup bottles as paperweights. Story cards are placed on the slots according to the mode. On a phone the napkin is a vertical stack of slots, and you tap a slot and then tap a card. On a desktop or iPad you can also drag.
5. **Pushback and reshaping.** Each character in the story reacts to each card. A reaction can be love, acceptance, a counter-offer, a soft no that can be talked through, or a red line that can't (see section 6).
6. **The forecast.** Coffee rings on the napkin forecast how the story will do, and they get clearer as your Storytelling skill grows. At Storytelling 1 you see one faint ring and a vague feeling ("Folks might like this"). At Storytelling 5 you see a forecast of 1 to 5 rings plus one specific tip ("Gideon's part could be bigger").
7. **Shake on it.** Everyone involved signs the napkin, and the signatures stay on it. A ketchup thumbprint is a valid signature.
8. **Birdie's verdict**, until you hold the Pencil. She approves, tweaks, vetoes, or says "Not yet" and saves the idea for later (section 7).
9. **On the calendar.** The first beat shows up on the calendar, and the napkin gets pinned to the corkboard in Birdie's office.

When a storyline ends, its napkin moves to the **Napkin Box**, a shoebox under your bed that works as a scrapbook of every story you've been part of, signatures included.

### 2.6 The three involvement modes

The three choices are **lines the player says** to the pitcher:

| Mode | What the player says | Who fills the slots | How much control | Rewards |
|---|---|---|---|---|
| **You drive** | "You drive. Tell me everything." | The pitcher fills every slot from their own preferences and cards. | Low. You get **one nudge** (swap any single card) and the final yes. | Biggest friendship gain with the pitcher ("they trusted me"). You get surprised. |
| **Let's build it together** (the default) | "Let's build it together." | For each slot, you're offered **2 or 3 cards**: one or two from the pitcher's preferences and one from your Recipe Tin. You pick one, swap in your own, or ask to see more. | Medium. Each side may veto one card per pitch. | Balanced friendship and Storytelling XP, plus chemistry with the pitcher. |
| **I've got an idea** | "I've got an idea." | **You** fill every slot from your Tin, and the pitcher reacts to each card as you place it. | High. You choose everything, and they push back. | Most Storytelling XP and the most Ledger credit with Birdie. More reshapes. |

**Optional twist secrecy.** "You drive" includes a toggle: *Keep the twist a secret from me.* The twist slot then shows a face-down card ("Tiny's got a secret") that flips during the beat where it happens, so the player can be surprised by a story they agreed to.

**The global default.** *Settings → Stories → When someone brings me a story:*

- You drive
- Let's build it together *(default)*
- I've got an idea
- Ask me every time (no option is pre-selected)
- **Let Birdie handle it.** The player never sits through pitches. Stories happen to them and around them, built by the pitcher and approved by Birdie, and the player only performs. This is the "little control" end of the dial, and it's fully supported.

**Changing it for one pitch.** The three choices always appear at step 3, with the default highlighted. One tap keeps it, and tapping another choice changes it for this pitch only. The player can also switch partway through a pitch. Saying "Actually, you drive" hands the rest of the napkin to the pitcher, and the cards already placed stay where they are.

### 2.7 Sample transcripts

Text in [brackets] describes UI and system events. Choices start with ▸. Nothing is voiced. Lines appear in dialogue boxes with chiptune blips.

#### Transcript A: "You drive" (Tiny Tallbridge)

*The Hot Tag back booth, Wednesday, 10:15 p.m., after the VFW show. Bingo is still going next door, and "B-12!" comes faintly through the wall.*

**TINY:** *(sets down a cake the size of a bottle cap)* Lemon. For your match. You did the thing with the elbow.
**YOU:** ▸ "Tiny, it's perfect." ▸ "Is there a smaller fork?"
**TINY:** *(beaming)* I've been thinking about a story. A whole one, with a beginning, a middle and an end. Can I tell you?

[The three choices appear, with your default, "Let's build it together," highlighted. You tap **You drive**.]

**YOU:** "You drive, Tiny. Tell me everything."
**TINY:** Okay. Okay okay okay. *(She unfolds a napkin she has clearly drawn on already. Every slot is filled in with careful, very small handwriting.)* Somebody steals my grandma's recipe card. The tiny eight-layer one. Right out of my locker.

[HOOK: **The Heist**]

**TINY:** And everybody thinks Gideon did it, because Gideon is always saying carbs ruin a silhouette.

[HERO: **Tiny Tallbridge**. VILLAIN (apparent): **"Gorgeous" Gideon Price**]

**GIDEON:** *(from the next booth, without looking up from his compact)* Carbs *do* ruin a silhouette.
**TINY:** But it wasn't Gideon. *(whispering)* It was the Professor. She wanted to know the ratios.

[TWIST: **Swerve Within a Swerve**. The real villain is **Professor Pinfall**.]

**PINFALL:** *(at the counter, not turning around)* For science.
**TINY:** And whoever loses buys pie for the whole town. At June's.

[STAKES: **Loser Buys the Town Pie**]

**JUNE:** *(refilling coffee)* I'll need a week's notice and a deposit.
**TINY:** And it ends in a pie-eating contest. No pie in faces. Pie is for eating.

[PAYOFF: **Pie-Eating Contest**. LENGTH: **Short, 3 weeks**.]
[Forecast: three faint coffee rings. *"The crowd will like this. Gideon's part could be bigger."*]

**YOU:** ▸ "Love it. Let's take it to Birdie." ▸ Use your nudge (swap one card) ▸ "Can I sleep on it?"
**YOU:** *(using the nudge)* "What if Gideon *wants* the blame? A red herring on purpose."
**GIDEON:** *(snapping the compact shut)* A wrongly accused man. Tormented. Misunderstood. *(a pause)* I'll need a new robe.

[Gideon joins the story in a third role, **The Red Herring**. Segment added: **The Mirror Speech**.]

**TINY:** *(very quietly)* This is the best day of my life.

[The napkin is signed by Tiny, Gideon and Pinfall ("For science"), and by you.]

#### Transcript B: "Let's build it together" (the Bruiser Twins)

*The back booth, Saturday, 11:02 p.m. Bo and Buck are sharing one milkshake through two straws, which is how they argue.*

**BUCK:** We want your tag belts.
**BO:** We want a *shot* at your tag belts. He always says it wrong.
**BUCK:** Same thing.
**BO:** It is legally not the same thing.

[Scope: **For you**. You and Dex hold the ACW Tag Team Championship. You keep the highlighted default, **Let's build it together**.]

**YOU:** "Let's build it together. Hook first."

[The napkin offers three hooks. Buck slides one forward, Bo slides another, and the third comes from your Recipe Tin.]

**BUCK:** *(The Sneak Attack)* We jump you in the parking lot. Easy.
**BO:** *(The Diner Bet)* No. We bet you at the counter. In public. Witnesses.
**YOU:** ▸ The Sneak Attack ▸ The Diner Bet ▸ Friendly Fire *(from your Tin)* ▸ "Show me more"
**YOU:** "The Diner Bet. But Buck makes the bet, and Bo has no idea he made it."
**BO:** *(turning slowly)* ...That is what would happen, though.
**BUCK:** That is exactly what would happen.

[HOOK: **The Diner Bet**, spun as *"Buck bets without asking."* Buck loves it. Bo is fine with it, grudgingly.]
[HERO and VILLAIN: The napkin suggests you and Dex as heroes and the twins as villains. You can flip it.]

**YOU:** "You two want to be the villains?"
**BUCK:** We're always the villains. People buy hammers angry. It's good for business.

[TWIST offers: **The Turn** (from Buck), **The Wrong Twin** (from Bo), **The Mystery Partner** (from your Tin).]

**YOU:** "The Turn. Buck turns on Bo."
**BO:** *(A soft red-line chime sounds.)* Hang on. Here's the deal. Nobody pins anybody clean. Not him on me, not me on him. We tried that in high school and didn't talk till Easter.

[**Red line:** one twin may never pin the other clean. The Turn stays in, but the finish is reshaped. Buck turns, the payoff ends in a schmozz, and no twin pins the other.]

**BUCK:** He's right. I'd never let him forget it.
**BO:** You'd put it on a sign. In the store.

[STAKES offers: **The Title**, **Bragging Rights**, **Custody** (of the reserved parking space outside Steel Chair Hardware).]

**YOU:** ▸ Custody of the parking space
**BO & BUCK:** *(together, delighted)* The *space*.

[PAYOFF offers: **Tag Team Match**, **Hardware Store Brawl** (needs a supershow), **No Disqualification**.]

**BUCK:** Hardware Store Brawl. Fans in folding chairs between Plumbing and Paint.
**BO:** Harvest Havoc's in five weeks.

[The Hardware Store Brawl needs a supershow, so the forecast moves the payoff to Harvest Havoc. LENGTH: **Standard, 5 weeks**.]
[Forecast: three solid coffee rings. *"A breakup inside a feud. The crowd's seen the twins split before; make this one different."*]

**YOU:** "Five weeks. Different this time. We'll figure out how in the booth."
**BO & BUCK:** *(at the same time)* We'll need a permit.

[The napkin is signed with three signatures and a ketchup thumbprint, then goes to Birdie.]

> **How the offers work.** In "Let's build it together," each slot shows 2 or 3 cards: one or two from the pitcher's top-scored cards for that slot, and one from the player's Tin, chosen to fit the shape. "Show me more" draws a fresh set. You get 1 redraw per pitch at Storytelling 1, up to 3 at Storytelling 5. Each side may veto one card per pitch. With two pitchers, as with the twins, each one offers a card, and you break the tie.

#### Transcript C: "I've got an idea" (Gorgeous Gideon)

*The locker room, Saturday, 6:40 p.m., before the show. Gideon is at the mirror with eleven brushes laid out in a fan.*

**YOU:** "Gideon. I've got an idea."

[Mode: **I've got an idea**. You fill the napkin, and Gideon reacts to each card. Friendship with Gideon: 6 hearts.]

**GIDEON:** *(dabbing his forehead)* Is it about me? Please say it's about me. Please say it's not about me.
**YOU:** *(places HOOK: The Crashed Entrance)* "I interrupt your entrance. Mid-song."
**GIDEON:** My entrance is four minutes of choreographed sequins. *(He loves it: +2 for Vain, which likes the spotlight.)* ...You'd interrupt at the key change, obviously.
**YOU:** *(HERO: you. VILLAIN: Gideon.)*
**GIDEON:** Naturally.
**YOU:** *(places STAKES: Hair vs. Hair)*

[**Red line.** The card shakes and slides back toward your Tin.]

**GIDEON:** *(very quietly)* No. Not "no, darling." Not "no, unless." Just no. Not even if I win. I don't want clippers in the building. I don't want the *concept* of clippers in the building.

[Gideon will never risk his hair. Red lines can't be talked through. Gideon offers a spin instead.]

**GIDEON:** *(recovering, a little shaky, then a little thrilled)* But. What if the loser has to sit in my chair? At the salon. On Main Street. In the front window. And I give them whatever look I want.

[STAKES reshaped: **Loser Sits in Gideon's Chair**, Gideon's spin on Hair vs. Hair.]

**YOU:** ▸ Accept the spin ▸ Try another stakes card
**YOU:** "Deal. And if you lose, I style you."
**GIDEON:** *(laughing too loudly)* I won't lose. *(a beat)* Will I lose? Don't tell me.
**YOU:** *(places PAYOFF: Steel Cage)*
**GIDEON:** *(He doesn't like it: −2 for Anxious, which dislikes cages.)* A cage? I'll sweat through the sequins. You can't see a glitter cape through a cage. The angles are all wrong.

[A soft no. Options: accept his counter-offer (**Lumberjack Match**), talk it through (Storytelling plus friendship), or pick another card.]

**YOU:** ▸ Talk it through: "Darling. A cage is just a very large mirror frame."

[The talk-through succeeds (Storytelling 3, 6 hearts).]

**GIDEON:** ...Hank could paint it gold.
**HANK:** *(from across the locker room)* Hank could not.
**GIDEON:** Hank could paint it gold.

[PAYOFF: **Steel Cage (gold)**. Hank's rule adds a required **test run** beat on a Friday.]

**YOU:** *(LENGTH: 4 weeks. TWIST: none.)*
**GIDEON:** No twist? Brave. I like it. And I have footage of myself. Hours of it. *(He suggests the segment **The Video Package**.)*

[Forecast: four coffee rings. Gideon signs the napkin with a flourish and a small heart.]

**GIDEON:** I need to go practice my shocked face.

> **How reactions work.** In "I've got an idea," every card gets an immediate reaction: **Love it**, **Fine**, **Hmm, how about...** (a counter-offer) or **No** (a red line). A failed talk-through costs nothing. It just turns into the character's counter-offer. Red lines can never be argued, which is what makes them feel like *people* and not like puzzles.

---

## 3. Story structure

### 3.1 The slots

The canon slots are hook, who's the hero, twist, stakes, payoff match and length. "Who's the hero" covers casting everyone, so a full napkin looks like this:

| Slot | The question it answers | Filled by | Required? | Notes |
|---|---|---|---|---|
| **Shape** | What kind of story is this? | A story shape (section 5) | Yes | Usually implied by the pitcher's want or the hook card, and it can be changed. |
| **Hook** | Why do we care, starting now? | A hook card | Yes | The first beat is built from it. |
| **Hero** | Who do we cheer? | A cast pick | Yes | Can be the player. |
| **Villain** | Who do we boo? | A cast pick | Usually | Some shapes use hero vs. hero ("respect"), hero vs. mystery, or hero vs. circumstance. |
| **Extra roles** | Mentor, manager, mystery partner, red herring... | Cast picks | Depends on the shape | Defined by the shape's roles. |
| **Twist** | What changes in the middle? | A twist card | Optional (0 to 2) | It lands at the end of Act II by default. |
| **Stakes** | What's on the line? | A stakes card | Yes | Declared at the end of Act II. |
| **Payoff** | How does it end in the ring? | A payoff card (match type) | Yes | Always at a show, preferably a Saturday or supershow. |
| **Length** | How long does it run? | A dial | Yes | **Short** 2 to 3 weeks, **Standard** 4 to 6, **Epic** 7 to 10, **Saga** (a full season, Main Event rung and up). |
| **Segments** | How do we fill the middle? | Segment cards (0 to 4) | Optional | If left empty, the shape supplies its own segments. |
| **Wildcards** | What's up our sleeve? | Wildcard cards | Optional | Held in reserve and played at huddles (9.3). |

Alignment uses three values: **hero**, **villain** and **tweener**. In insider spaces, characters use the old carny words (*babyface*, *heel*, *heat*, *pop*, *work*, *shoot*, *go home*), so lifelong fans get the layered references. The UI says hero and villain, and an optional glossary explains the rest to newcomers without ever gatekeeping them.

### 3.2 Three acts

| Act | Share of length | Job | Typical beats |
|---|---|---|---|
| **Act I: The Hook** | About 25% | Set up the want and the problem. Show who the hero is and who the villain is. | The hook beat, a first match (usually the hero wins or the villain cheats to win), the first town moment and the first booth reaction. |
| **Act II: The Heat** | About 50% | Escalate. The villain gets the upper hand, the hero is tested, the twist lands and the stakes are declared. | Run-ins, backstage segments, WRSL call-ins, public angles, a match the villain steals, the twist beat, and the stakes declaration (often a contract signing). |
| **Act III: The Payoff** | About 25% | Go home and pay it off. | The go-home beat (a final promo or face-off), **the payoff match**, an epilogue in the booth, and the town's reaction the next morning. |

**The twist lands at the end of Act II by default.** A shape can move it to the middle of the story ("midpoint swerve") or keep it for the payoff match itself ("finish swerve").

### 3.3 Beat budget by length

The scheduler (15.4) turns acts into beats using these budgets. A storyline uses about 60 to 70 percent of the shows in its window, so the roster and the crowd get a breather.

| Length | Weeks | Show beats | Town moments | WRSL promos | Booth (insider) moments |
|---|---|---|---|---|---|
| Short | 2 to 3 | 3 to 4 | 2 to 3 | 0 to 1 | 2 to 3 |
| Standard | 4 to 6 | 5 to 8 | 4 to 6 | 1 to 2 | 4 to 6 |
| Epic | 7 to 10 | 9 to 13 | 7 to 10 | 2 to 4 | 6 to 10 |
| Saga | One season | 14 to 20 | 10 to 16 | 4 to 6 | 10 or more |

### 3.4 Kinds of beats

| Beat kind | Where | When | Register | What the player does |
|---|---|---|---|---|
| **Match** | The ring | At shows | Kayfabe | Wrestle it in the card-game match system, or watch it from ringside or the commentary desk. |
| **Ring segment** | The ring | At shows | Kayfabe | Promos, in-ring interviews, challenges and celebrations. The player picks promo lines, and Charisma plus promo lines caught on tapes improve them. |
| **Backstage segment** | The hallway by the curtain, caught on the crew camcorder | At shows | Kayfabe | Short scenes shown on the big screen on Saturdays or on the TV cart on Wednesdays. |
| **Run-in** | During someone else's match | At shows | Kayfabe | Choose to charge the ring at the right phase. The canon lets you "run in on someone's match." |
| **Contract signing** | A table in the ring | At shows | Kayfabe | A dialogue scene, after which the table always breaks. Hank builds the breakaway table. |
| **WRSL promo** | *The Gravel Pit* on WRSL 1340 AM | Monday and Thursday mornings (6 to 10 a.m.) | Kayfabe | Listen at home or at the diner, or call in as yourself (in character). Villains gloat on air. |
| **Tattler beat** | The Turnbuckle Tattler | Sundays and Thursdays | Kayfabe (Clementine is a mark) | Passive. A headline, a review and sometimes an "exclusive." |
| **Town moment** | Public places | Days without a show | Kayfabe, with marks reacting | Walk by and watch (ambient), or step in and take part (a scene). See 3.5. |
| **Public angle** | Public places | Days without a show | Kayfabe | A staged scene in town in the old territory style, such as a standoff over the last cruller. Insiders stay in character, and marks are never the target. |
| **Insider moment** | The booth, the locker room, Birdie's office | After shows and in the evenings | **Insider** | Plan, react, huddle and be honest. These are the only beats where the truth is spoken. |

### 3.5 Town moments

Town moments are where kayfabe pays off. They come in two kinds:

- **Ambient moments** cost no time. They're barks, signs, prices, chalk drawings and posters the player passes during an ordinary day. They're generated from story tags and crowd sentiment.
- **Scene moments** are short, optional scenes of 30 to 90 seconds at a specific place and time, marked on the calendar with a little house icon. If the player is part of the story, they take part in character, because insiders in public stay in character automatically. Every dialogue choice the player sees in public is a kayfabe line.

**The core rule:** *insiders set the stage, and marks react for real.* No mark is ever in on it, put in danger, made a victim or embarrassed. Marks are the audience, and their reactions are genuine.

The mark reaction library is a starter set. Each entry is a template keyed to storyline state.

| Mark or place | Triggered by | Sample reactions |
|---|---|---|
| **Tallbridge Bakery** | A villain's crowd sentiment drops below −40 | The villain's name is chalked next to the price board's canon line, `VILLAIN SURCHARGE: $1`. Tiny is an insider and plays along in character ("Sorry! Sorry! It's the rules."). When Tiny herself is booked as a villain, she has to charge herself in public, dropping quarters into her own register. The hero gets a free sprinkle upgrade. |
| **Sheriff Bev** | A beat tagged with kayfabe crime, such as a belt theft, a chair shot or an ambush | She stops you on Main Street: "Say the word and I'll bring him in. I've got a form for this." Villains get pulled over for "suspicious strutting." No arrest ever succeeds. A paperwork mishap, a fast escape or Birdie's "jurisdictional matter" always gets in the way. |
| **The Tattler** | Every show, plus "exclusives" | Headlines and reviews from Clementine. Two sample headlines: "IS THE MOUNTAIN SOFTENING? SOURCES SAY NO (GROWL)" and "PROFESSOR'S LECTURE RUNS LONG; BINGO DELAYED." |
| **Kids on the sidewalk** | A villain's sentiment below −30, or a hero's above +30 | Chalk drawings of the hero lifting a belt and the villain as a grumpy stick figure. Kids boo the villain from a safe, giggling distance, and the villain hams up a "grr" in reply. Kids are never frightened. |
| **Pip** | Any active storyline he's following, which is all of them | He carries a new cardboard sign every week: `MOTHMAN 4 CHAMP`, `TINY DIDN'T DO IT`, `I KNEW IT!!!`. His predictions can come true through **Pip's Prediction** (WC-05). |
| **Agnes Pickett** | A villain near row one | The purse. She also corners you at the bakery: "You tell that sequined boy I'm saving a swing for him." |
| **Nadia, the vet** | You took a kayfabe beating | She checks your shoulder in the street, worried. "I saw what he did. Should I... is there a *wrestling* doctor? Do you want a treat? I mean, a mint." She becomes a romance route that believes every feud (see 10.1). |
| **Coach Patty Kowalski** | Any big storyline beat | She tries to prove it's fake with a stopwatch, a protractor or a slow-motion VHS, and finds something that convinces her it's real. "Okay, but *nobody* fakes a cruller that stale." She's also the Bruiser Twins' aunt, so every family dinner happens in kayfabe. |
| **Fenwick** | Mysteries, masks, the Mothman, anything at night | Theories, delivered over a table of tapes: "The recipe card? Follow the flour, friend. Follow the *flour*." |
| **Mayor Delphine Oakes** | A storyline with high buzz | She wants to put it on the map: a banner across Main Street, a proclamation, or the key to the city for whoever wins. |
| **Clementine** | Reviews | See section 9 for her review voice. |
| **Wanda the bear** | Fairgrounds beats | She bows politely to the hero and turns her back on the villain. She wants honey. She's a very good bear. |
| **Jobber the raccoon** | Stories that happen near the announce booth | He steals the contract, the microphone or the sunglasses. A "Jobber roll" decides what he grabs, and the story adapts to it. |

### 3.6 The Ornery Line (content guardrails)

The engine enforces these with forbidden tags and a check on generated text (15.7). Writers enforce them with taste.

**Villains may:** cheat, brag, distract the referee, steal a belt (it always comes back), cut in line at the bakery, wear sunglasses indoors, refuse handshakes, interfere in matches, use a steel chair in the ring, cut corny insults ("your cape is from a *catalog*"), run away and hide behind Birdie, and be magnificently vain.

**The system never produces:**

- Death or death imagery. No caskets, funerals, graves, wakes, "buried alive," or memorial salutes.
- Harm to marks, or to their property, pets or dignity.
- Kids being menaced, frightened or embarrassed.
- Mockery of bodies, identities, money, intelligence, accents or disabilities, whether played as comedy or generated procedurally. The single exception is a hand-written signature storyline that the targeted insider has chosen. There, a villain's jab exists only so the hero can answer it with dignity (CAST.md's "Don't Make Me" for Tiny is the model), and the villain apologizes in the epilogue.
- A real secret exposed against someone's will.
- Romance used to humiliate anyone.
- Animals harmed. Wanda and Jobber always come out fine and usually come out ahead.
- Gore or blood.
- Grandma Dottie's memory loss used as story material, ever. It belongs to the main story and is handled there with dignity.
- Real cruelty presented as a joke. **Humor punches up, or sideways at the self, and never down.**

---

## 4. Story cards

Story cards are the building blocks the player collects. They're kept in the **Recipe Tin**, Grandma Dottie's old recipe tin, which the player finds in the kitchen of her house on day one with a few index cards still inside. Birdie gives the player a **starter deck** in the first week ("The oldest tricks in the book, sugar. They're old because they work."). Everything else is collected through play.

### 4.1 How cards are collected

| Source | Code | How it works |
|---|---|---|
| **Starter** | S | Birdie's starter deck in week one: every card marked S, 24 cards in all. |
| **Tapes** | T | Caught in the VHS-tracking mini-game. A tape's era and type decide which card pool it draws from. Legendary tapes hold legendary cards, including the Velvet Hammers cards (section 14). |
| **Insider stories** | I | Told in insider spaces at friendship milestones and heart events. "Did I ever tell you about the time..." Each character teaches 1 to 3 cards. |
| **Life events** | L | Real-life happenings create cards: an injury, a recovery, a romance, a reinvention, a return, a real argument. |
| **The Dungeon** | D | Ghost wrestlers on Dungeon floors teach cards after sparring matches. Deeper floors hold rarer cards. |
| **Fan mail** | F | Marks write in with ideas they believe are predictions ("I bet Gideon has a long-lost sister!!"). Pip writes most of them. A good letter turns into a card. This is kayfabe-safe, because Pip thinks he's guessing, not booking. |
| **Town** | Tn | Town life and marks' habits create cards: a diner bet, Agnes's purse, Bev's paperwork, Wanda's honey. |
| **Main story** | M | Granted by main story progress. |

**Rarity** sets how often a card shows up, not how powerful it is: **C** common, **U** uncommon, **R** rare, **L** legendary. Rare and legendary cards come with richer beat templates and bigger crowd reactions the first few times they're played. **Duplicate catches** add a gold star to the card, up to three, and each star gives +3 starting buzz when it's played. **Card freshness:** a card played in the last 8 weeks starts with less buzz (8.5), so players are nudged toward variety without being forbidden anything.

Each card also carries **tags**, such as `comedy`, `betrayal`, `mask`, `hair`, `kids_spotlight` or `night` (the full list is in 15.1). Personalities react to tags (section 6), and the crowd tires of repeated tags.

**Other catches.** Promo lines, chants and gear designs caught on tapes are not story cards. They plug into segments and promos (3.4) and make them better.

### 4.2 Hooks (20)

| ID | Card | What it does | Collected from | Rarity | Requires |
|---|---|---|---|---|---|
| HK-01 | **The Sneak Attack** | A blindside after the bell, from someone you trusted or someone you never saw coming. | S | C | none |
| HK-02 | **The Open Challenge** | "Anyone, anytime." Somebody answers who shouldn't. | S | C | none |
| HK-03 | **The Left-Hanging Handshake** | A hand is offered in front of everyone and refused. | S | C | none |
| HK-04 | **The Crashed Entrance** | Someone's big entrance is interrupted mid-song, at the key change. | T | C | none |
| HK-05 | **The Heist** | Something precious vanishes from backstage, and everyone's a suspect. | S, I | C | none |
| HK-06 | **Number One Contender** | Birdie names a contender nobody expected. | I (Birdie) | U | A title exists |
| HK-07 | **The Return** | A familiar song hits, and someone long gone walks through the curtain. | L | U | Someone returning from injury, travel, MaxxMedia or Loser Leaves Town |
| HK-08 | **The Diner Bet** | A bet made loudly at the Hot Tag counter and lost in front of witnesses. | Tn | C | none |
| HK-09 | **Roses in the Locker** | Flowers and unsigned notes start appearing on screen. | F | U | none (pairs with romance) |
| HK-10 | **The Mysterious Box** | A gift-wrapped box sits in the middle of the ring, and nobody claims it. | T | U | none |
| HK-11 | **The Ruined Robe** | A beloved piece of gear is "destroyed" on screen. Marigold sews a stunt double, and the real one is safe. | I (Marigold) | U | Marigold 3 hearts |
| HK-12 | **Hometown Pride** | Someone says they were born in Turnbuckle Alley, and someone else says prove it. | Tn | C | none |
| HK-13 | **Friendly Fire** | A move misses and hits your own partner. | S | C | Tag partners or allies |
| HK-14 | **The Masked Stranger** | A masked figure appears at ringside, says nothing and leaves. | T | R | A performer willing to work masked, including the player's alter ego |
| HK-15 | **The Big City Letter** | Someone waves a contract from the city. Are they leaving? | L | U | Dex's arc has started, or anyone has an offer |
| HK-16 | **The Missing Heirloom** | A family keepsake goes "missing" on screen. | I | R | A legacy item, and its owner's consent |
| HK-17 | **Fenwick's Prophecy** | Fenwick's latest WRSL call-in theory turns out to be weirdly specific. | Tn (Fenwick) | R | none |
| HK-18 | **The Cold Locker** | A locker frosts over, and a whisper says a name. | D | R | Never Dottie's locker (blocked by the engine) |
| HK-19 | **The Rematch Clause** | An old loss nobody forgot gets a new date. | S | C | The two have wrestled before |
| HK-20 | **The New Look** | Someone debuts a new gimmick and won't say why. | L | U | A character reinvention, including the player's |

### 4.3 Twists (19)

| ID | Card | What it does | Collected from | Rarity | Requires |
|---|---|---|---|---|---|
| TW-01 | **The Turn** | An ally turns on their partner at the worst possible moment. | S | C | Allies |
| TW-02 | **Change of Heart** | The villain saves the hero from a beating. | S | C | none |
| TW-03 | **The Mystery Partner** | "My partner tonight is..." and nobody saw it coming. | T | U | An available wrestler not yet in the story |
| TW-04 | **Half a Mask** | A mask is pulled halfway up, and then the lights cut out. | T | R | A masked wrestler, and the wearer's consent |
| TW-05 | **The Ref Bump** | Referee Mo goes down, and anything can happen. | S | C | Mo is officiating |
| TW-06 | **The Long-Lost Sibling** | "I have a sister you've never met." | F (Pip) | R | An unattached wrestler or a newcomer to play the sibling |
| TW-07 | **The Double Agent** | The hero's ally was working for the villain all along. | T | R | Three or more roles |
| TW-08 | **June Comes Back to Ringside** | June comes out of retirement as Madame Midnight, jeweled fan and all, and picks a client. | I (June) | R | June 5 hearts |
| TW-09 | **The Worked Injury** | The hero "goes down" (in kayfabe only) and is helped out by Doc Halloran. | I (Doc) | C | Doc signs off. Never used on a real injury. |
| TW-10 | **The Fake Retirement** | A tearful farewell speech, and then a return two weeks later. | T | U | none |
| TW-11 | **Swerve Within a Swerve** | The twist everyone guessed turns out to be a decoy. | T | R | The story already has a twist |
| TW-12 | **The Mothman Descends** | At a night show the lights die, and when they come back the Mothman is in the ring. | Tn | R | A night show, and the Mothman agrees |
| TW-13 | **The Heart-to-Heart** | The villain tells the crowd *why*, and it makes sense. | I | U | The villain has 4 or more hearts with the player |
| TW-14 | **The Belt Goes Missing** | The title vanishes from the trophy case. | T | U | A title is in the story |
| TW-15 | **Secret Training** | The hero disappears and comes back with a move nobody has seen in fifty years. | D | U | The hero has learned a move in the Dungeon |
| TW-16 | **The Legend in the Corner** | Sweet Lou walks out and stands in someone's corner. | I (Sweet Lou) | R | Sweet Lou 5 hearts |
| TW-17 | **Enemy of My Enemy** | Two rivals team up against a bigger threat. | S | U | An outsider or a bigger villain |
| TW-18 | **The Wrong Twin** | "That wasn't Bo. That was Buck." | L | U | The Bruiser Twins |
| TW-19 | **The Audible** | Mid-match the finish changes, and only the two people in the ring know why. | T (a 1983 tape) | L | Unlocked after the truth about 1983 comes out. Never playable in the Homecoming finale. |

### 4.4 Stakes (15)

| ID | Card | What it does | Collected from | Rarity | Requires |
|---|---|---|---|---|---|
| ST-01 | **The Title** | A championship changes hands, or doesn't. | S | C | A title |
| ST-02 | **Bragging Rights** | Pride. Just pride. It's plenty. | S | C | none |
| ST-03 | **Loser Leaves Town** | The loser actually leaves the map for 2 to 6 weeks. Late game, they move to another of your towns instead (13.7). | T | R | The loser consents, and their business has someone to cover it |
| ST-04 | **Mask vs. Mask** | Both masks hang above the ring. | T | L | Two masked wrestlers, each of whom must suggest or approve the stakes themselves |
| ST-05 | **Hair vs. Hair** | Clippers on a velvet pillow. | T | R | Both wrestlers willing. Gideon never is. |
| ST-06 | **Career on the Line** | Lose, and you hang up the boots. | L | R | A wrestler genuinely ready to retire, or played as a decoy with the Fake Retirement twist |
| ST-07 | **Loser Wears the Chicken Suit** | Marigold's finest poultry costume, worn for a full week of shows and errands. | I (Marigold) | C | none |
| ST-08 | **Loser Buys the Town Pie** | The loser pays for pie for everyone at the Hot Tag. | Tn | C | none |
| ST-09 | **Custody** | The winner gets the mascot, the manager, the lucky jacket, the parking space or the raccoon. | Tn | U | Something or someone to fight over |
| ST-10 | **The Main Event Spot** | The winner headlines the next supershow. | I (Birdie) | U | A supershow within 6 weeks |
| ST-11 | **The Family Name** | The winner earns the right to a family name, move or robe. | I | R | A legacy connection |
| ST-12 | **The Apology** | The loser apologizes in the ring, into Gus's microphone, and means it. | S | C | none |
| ST-13 | **The Town's Honor** | Turnbuckle Alley's pride against an outsider. | Tn (Mayor) | U | An outsider role |
| ST-14 | **Story Hour** | The loser reads at the library's Saturday story hour. | I (Big Earl) | U | Big Earl 3 hearts (it's his library) |
| ST-15 | **The Building** | The losing promotion stops running shows in the county. | L | L | The rival promotion arc, Owner rung |

### 4.5 Payoffs (24)

Payoffs are match types. Each one passes **stipulation rules** to the match system (15.5): rule changes, special cards, how the finish works and any venue limits.

| ID | Card | What it does | Collected from | Rarity | Requires |
|---|---|---|---|---|---|
| PO-01 | **Singles Match** | One on one. A classic. | S | C | none |
| PO-02 | **Tag Team Match** | Two on two, hot tags included. | S | C | Teams |
| PO-03 | **Two Out of Three Falls** | The old-timers' favorite: a story inside a story. | T | C | none |
| PO-04 | **No Disqualification** | Anything goes, within Birdie's rules. Folding chairs come into play. | S | C | none |
| PO-05 | **Steel Cage** | Escape the cage Hank built. | I (Hank) | U | Hank's cage has been built and test-run. Sportatorium or fairgrounds only. |
| PO-06 | **Ladder Match** | The prize hangs from the rafters. | T | U | Not at the VFW (nine-foot ceiling) |
| PO-07 | **Lumberjack Match** | The whole locker room surrounds the ring. | T | U | A roster of 8 or more |
| PO-08 | **Say Uncle** | No pins. Somebody has to say it into the microphone. | I (Pinfall) | U | none |
| PO-09 | **Last One Standing** | Stay on your feet through a ten count. | T | R | Saturday or a supershow |
| PO-10 | **Battle Royal** | Over the top rope and out. | S | C | 6 or more participants |
| PO-11 | **Pie-Eating Contest** | Tiny bakes, the contestants eat and the crowd chants. No pie in faces. | Tn | C | Tiny bakes the pies |
| PO-12 | **Bingo Brawl** | Wednesdays only. The fight spills into post-show bingo, and the winner yells "BINGO." | Tn | U | The VFW Hall |
| PO-13 | **Lights Out** | Night only. A match in the dark with glow-stick ropes. | T | R | A night show |
| PO-14 | **Wanda's Honey Pot** | At the fairgrounds, the first to bring Wanda her honey pot wins. She bows to the winner. | Tn (fairgrounds) | R | Fairgrounds Fury |
| PO-15 | **Object on a Pole** | A pickle jar, a contract or a lucky boot. The first to grab it wins. | S | C | none |
| PO-16 | **Pop Quiz Match** | Between falls, Professor Pinfall asks a question, and right answers unlock a signature move. | I (Pinfall) | U | none |
| PO-17 | **Hardware Store Brawl** | After hours at Steel Chair Hardware, with fans in folding chairs between the aisles. | L | R | The Bruiser Twins consent. A supershow. |
| PO-18 | **Iron Hour** | The most falls in sixty minutes wins. | T | R | Saturday or a supershow |
| PO-19 | **Bandana Match** | Two wrestlers tied wrist to wrist with a bandana. | I (Clint) | U | none |
| PO-20 | **Haunted House Match** | At Harvest Havoc, through Hank's haunted maze and into the ring. | D | R | Harvest Havoc |
| PO-21 | **Snowball Showdown** | The ring is ringed with snow forts, and snowballs are power-up cards. | Tn | U | Winter or Homecoming |
| PO-22 | **Hay Bale Brawl** | Harvest Havoc's farmyard match, fought over hay bales and a pumpkin patch. | Tn | C | Fall |
| PO-23 | **Four Corners** | Three or four wrestlers at once, and the first fall wins. | S | C | 3 or 4 participants |
| PO-24 | **The Farewell Match** | Special rules: the crowd meter can't drop below "warm," and every ending feels earned. | L | R | A real retirement |

### 4.6 Segments (17)

Segments fill the middle of a story. If the napkin leaves them empty, the shape supplies its own segments.

| ID | Card | What it does | Collected from | Rarity | Requires |
|---|---|---|---|---|---|
| SG-01 | **In-Ring Promo** | A microphone, a spotlight and an opinion. | S | C | none |
| SG-02 | **Backstage Brawl** | Caught on the crew camcorder and played on the big screen. | S | C | none |
| SG-03 | **The Run-In** | Someone charges the ring mid-match. | S | C | none |
| SG-04 | **Contract Signing** | A table in the ring, and the table always breaks. | T | U | Hank's breakaway table |
| SG-05 | **WRSL Call-In** | A villain calls *The Gravel Pit* to gloat on air, and the hero calls back. | Tn (WRSL) | U | none |
| SG-06 | **Sit-Down Interview** | Two chairs at the commentary desk, and Gus asks the hard questions. | T | U | none |
| SG-07 | **Autograph Table Ambush** | Mid-show, at the merch table, in front of the line. Only wrestlers are targeted, never fans. | S | C | none |
| SG-08 | **The Public Weigh-In** | On the feed store scale on Main Street. Agnes attends. | Tn | U | none |
| SG-09 | **Face-Off at the Bakery** | A staged standoff over the last cruller at Tiny's counter. | Tn | U | Tiny agrees |
| SG-10 | **The Tattler Exclusive** | Clementine gets an "exclusive" quote and believes every word. | Tn | U | none |
| SG-11 | **The Video Package** | A hype video on the Sportatorium screen. | L (Craft) | U | Saturday. Craft 3. |
| SG-12 | **Parking Lot Showdown** | After the show, under the lot's one buzzing light. | T | C | none |
| SG-13 | **The Suspicious Gift** | The villain gives the hero a present. It's a fruit basket. Or is it? | I | C | none |
| SG-14 | **The Training Montage** | The hero runs the water tower stairs at dawn while the town cheers from below. | Tn | U | none |
| SG-15 | **The Parade Float** | The villain's float in Mayor Delphine's parade is magnificently tacky. | Tn (Mayor) | U | A parade day |
| SG-16 | **The Mirror Speech** | A villain gives a speech to a hand mirror, and the crowd heckles the mirror. | I (Gideon) | C | none |
| SG-17 | **Hall of Fame Moment** | A plaque, a speech and something nobody expected. | L | R | Homecoming |

### 4.7 Wildcards (14)

Wildcards are kept in reserve and played at **huddles**, the mid-story check-ins in the booth (9.3). They change a story that's already running, and they're the main way to rescue a flop. Wildcards that involve marks follow one rule: *the insiders set the stage, and the mark does what they'd naturally do.*

| ID | Card | What it does | Collected from | Rarity | Requires |
|---|---|---|---|---|---|
| WC-01 | **Let the People Decide** | The crowd's cheers pick the winner. The booked finish becomes open. | T | U | none |
| WC-02 | **Jobber Takes a Side** | The announce-booth raccoon steals something important. A "Jobber roll" decides what. | Tn | U | none |
| WC-03 | **Agnes Gets Involved** | Work the spot right in front of row one, and Agnes will do the rest. | Tn | U | Agnes is there (she always is) |
| WC-04 | **Sheriff Bev's Warrant** | The villain taunts near Sheriff Bev, she tries to arrest him, and he escapes. He always escapes. | Tn | U | A villain in the story |
| WC-05 | **Pip's Prediction** | Pip's cardboard sign predicts the ending, and the wrestlers make it come true. | F | U | Pip is there (Saturdays) |
| WC-06 | **Birdie's Old Trick** | A carny swerve from Birdie's private playbook. | I (Birdie) | R | Birdie 6 hearts |
| WC-07 | **Rain Delay** | A storm turns an outdoor show into an improvised mud-and-tarp classic. | L | C | An outdoor venue |
| WC-08 | **Blackout** | The power cuts mid-show, and the crew lights the ring with pickup truck headlights. | L | U | none |
| WC-09 | **The Second Chance** | Reshuffle a sagging Act II with new beats and the same cast. | S | C | none |
| WC-10 | **Callback** | Bring back a bit from an old storyline, even a flop. The crowd remembers. | L (from archived stories) | U | A finished storyline |
| WC-11 | **Coach Patty's Investigation** | Patty shows up to prove it's fake, and whatever she checks proves it's real. Crowd heat soars. | Tn | U | none |
| WC-12 | **The Golden Belt** | The Dungeon's ultimate prize appears in a story. | D (the bottom floor) | L | The Golden Belt has been won |
| WC-13 | **Grandma Stands Up** | Dottie rises from her front-row seat, and the whole room rises with her. | M (after the credits) | L | After the credits |
| WC-14 | **Fenwick's Sighting** | Fenwick swears he saw something, and the Mothman's shadow crosses the story. It's only a tease. | Tn (Fenwick) | R | A night beat |

**Totals:** 20 hooks, 19 twists, 15 stakes, 24 payoffs, 17 segments and 14 wildcards, for **109 story cards**. The 24-card starter deck is every card marked S: HK-01, HK-02, HK-03, HK-05, HK-13, HK-19, TW-01, TW-02, TW-05, TW-17, ST-01, ST-02, ST-12, PO-01, PO-02, PO-04, PO-10, PO-15, PO-23, SG-01, SG-02, SG-03, SG-07 and WC-09.

---

## 5. Story shapes

A **story shape** is a reusable storyline template. It defines the roles, the act-by-act beat outline, the points where the story can vary, which cards fit it, its emotional register and its usual length. Shapes are deliberately loose: the cards, the cast and the crowd fill in the rest.

Every shape has a **cooldown** of 8 weeks by default. Running the same shape again within the cooldown is allowed, but it starts with less buzz (8.5). Card lists name the best fits, not the only legal cards. Any card whose requirements are met can go on any napkin, though cards outside the list start with less buzz.

**How to read an entry:** the acts are I, II and III. **Varies** lists the variation points. **Cards** lists the most compatible hooks, twists, stakes and payoffs in that order.

### 5.1 The Betrayal
*Register: heartbreak, then catharsis. Length: 4 to 6 weeks. Roles: Betrayer, Betrayed, optional New Ally.*
- **I:** The partners win together. In the booth: "We're good, right?" Their matching shirts sell out at the merch table.
- **II:** Small cracks show, like a missed tag and a moment of friendly fire. Then **the Turn** comes at a Saturday show. The betrayer explains on *The Gravel Pit*. Tiny chalks the traitor's name next to the bakery's villain surcharge, and Pip draws a mustache on the traitor's poster.
- **III:** A contract signing, and the table breaks. The payoff match. In the epilogue, does the betrayer look back at the curtain?
- **Varies:** why they turned (jealousy, the city, a manager, a misunderstanding or a secretly noble reason), who gets betrayed (the player or a resident), whether the betrayer regrets it (which sets up a future Redemption), and whether the payoff is tag or singles.
- **Cards:** HK-13, HK-03, HK-15, HK-08 · TW-01, TW-07, TW-08, TW-13 · ST-02, ST-03, ST-01, ST-12 · PO-05, PO-07, PO-19, PO-04.
- *Birdie always asks one question about this shape: "Does the one who leaves come back?" Finishing a Betrayal automatically puts a Return hook (HK-07) in the betrayer's future.*

### 5.2 The Underdog Title Chase
*Register: hope and scrappy joy. Length: 5 to 8 weeks. Roles: Underdog (hero), Champion, optional Mentor.*
- **I:** The underdog loses a match but steals the show. Then comes a Number One Contender announcement or an Open Challenge. Kids start wearing homemade versions of the underdog's gear.
- **II:** The champion dodges the match with excuses ("I have a *salon appointment*"). The underdog earns the shot by beating two midcarders, then loses the title match to a cheat after a Ref Bump. "One more try."
- **III:** A training montage on the water tower stairs. The payoff is ideally at a supershow, and if the underdog wins, the whole town counts the pin.
- **Varies:** whether the underdog wins (yes by default, or a loss that earns respect and plants a Rematch Clause), whether the champion is a cowardly villain or a proud hero (a respect match), and whether there's a mentor.
- **Cards:** HK-02, HK-06, HK-19 · TW-05, TW-15, TW-16, TW-12 · ST-01, ST-10 · PO-06, PO-09, PO-03, PO-18.

### 5.3 The Mentor and the Student
*Register: warm and bittersweet. Length: 4 to 8 weeks. Roles: Mentor, Student, Antagonist.*
- **I:** The student gets beaten up, and the mentor steps in, often reluctantly. Public training scenes follow: the legend trains the kid while the town watches from the sidewalk.
- **II:** The student learns a signature move. The antagonist attacks the mentor, and the student has to stand alone. Optionally, the mentor's old rival shows up.
- **III:** The student wins with the mentor's move while the mentor stands in the corner. Then the handover: the mentor gives the student a piece of their gear.
- **Varies:** whether the mentor stays true or turns (rare), who the student is (often the player early in the game), and whether the mentor is a retiree, such as Sweet Lou or a Birdie cameo.
- **Cards:** HK-01, HK-02, HK-20 · TW-15, TW-16, TW-01 · ST-11, ST-02 · PO-01, PO-03, PO-08.

### 5.4 The Masked Mystery
*Register: intrigue and whimsy. Length: 4 to 6 weeks. Roles: Masked Figure, Target, Suspects (2 or 3).*
- **I:** The Masked Stranger appears. Fenwick has theories, and the sidewalk debates them.
- **II:** The figure interferes in matches, sometimes helping and sometimes hurting. Suspects get accused in segments. The Tattler runs a "WHO IS IT?" poll. Half a Mask teases the answer.
- **III:** The payoff, with a reveal or without one. The identity comes out only if the person under the mask chooses it.
- **Varies:** who's under the mask (any willing wrestler, the player's alter ego or a newcomer), helper or menace, and reveal or keep the mystery (keeping it creates a lasting character).
- **Cards:** HK-14, HK-10, HK-17 · TW-04, TW-03, TW-11, TW-12 · ST-04, ST-02, ST-09 · PO-13, PO-01, PO-23.
- *The Mothman can appear in this shape but is never the one revealed.*

### 5.5 The Tag Team Breakup
*Register: comic-tragic. Length: 4 to 6 weeks. Roles: Partner A, Partner B, the Wedge (a manager or third party).*
- **I:** The team wins but bickers, and their matching gear starts to fray. In the booth they're real friends, and everything's fine.
- **II:** Friendly fire and missed tags. The Wedge whispers in ears. The Turn or the Wrong Twin. The town splits into camps, with Team A shirts and Team B shirts.
- **III:** Partner against partner. (For the Bruiser Twins, no clean pin, ever.)
- **Varies:** amicable or bitter, who the Wedge is, and whether to plant a reunion (yes by default).
- **Cards:** HK-13, HK-08 · TW-01, TW-18, TW-08, TW-07 · ST-09, ST-02, ST-03 · PO-01, PO-19, PO-17, PO-05.

### 5.6 The Reunion
*Register: joyful and teary. Length: 3 to 5 weeks. Roles: Estranged Partner A, Estranged Partner B, Common Enemy.*
- **I:** A common enemy beats each of them separately, and each one refuses help.
- **II:** One saves the other. Their old entrance music plays. The town remembers, and Agnes brings her old sign.
- **III:** The reunited team wins with their old double-team move.
- **Varies:** why they split (this can be a real storyline from the save's archive), who gives in first, and whether the payoff is a tag match or a 2-on-1.
- **Cards:** HK-07, HK-19 · TW-02, TW-17, TW-16 · ST-01, ST-13 · PO-02, PO-04.
- *Reuniting a team the player once broke up earns a big Callback bonus.*

### 5.7 The Retirement Tour
*Register: bittersweet and grateful. Length: 6 to 10 weeks. Roles: Retiree, Final Opponent, optional Successor.*
- **I:** The announcement, which reflects a real decision (10.4). Mayor Delphine proclaims a Day in the retiree's honor.
- **II:** Tour stops where the retiree faces old rivals, with callbacks to archived stories. Each match is treated as a gift. The Final Opponent earns the spot.
- **III:** The Farewell Match on a Saturday or at a supershow. A curtain call, with everyone coming out from the back. A plaque at the next Homecoming.
- **Varies:** whether the retiree wins or loses the final match (both endings feel earned), whether there's a successor, whether a masked retiree unmasks (only if they choose), and whether they come back for cameos.
- **Cards:** HK-07, HK-19 · TW-16, TW-13 · ST-06, ST-11 · PO-24, PO-03, PO-19.

### 5.8 The Comeback
*Register: perseverance and quiet triumph. Length: 4 to 8 weeks. Roles: Returning Wrestler, the One Who Took Their Spot, Doc Halloran (cameo).*
- **I:** The Return. The first match is rusty by design, with the crowd meter capped. The villain calls the comeback "old news."
- **II:** The villain targets the old injury, which is allowed in kayfabe, though the hero's red lines still govern the finish. A training montage. Doc's "cleared" moment. A loss.
- **III:** The payoff, won with the comeback finisher.
- **Varies:** based on a real injury (10.3) or pure kayfabe, title or pride, and a win (the default) or a "won the crowd" ending.
- **Cards:** HK-07, HK-19 · TW-09 (never if the injury is real), TW-15, TW-16 · ST-01, ST-02 · PO-09, PO-01, PO-03.

### 5.9 The Hometown Hero
*Register: pride and community. Length: 3 to 6 weeks. Roles: Hometown Hero, Outsider or Doubter.*
- **I:** Hometown Pride. The doubter says prove it. Yearbook photos show up in the Tattler.
- **II:** The doubter insults the turnbuckle water tower, which is ornery but harmless. Mayor Delphine weighs in, and an old teacher vouches for the hero (a Professor Pinfall cameo works well).
- **III:** The payoff at a supershow, and Mayor Delphine hands over the key to the city.
- **Varies:** born here or chose here (the player's version is "Dottie Dupree's grandkid"), and the doubter's alignment.
- **Cards:** HK-12, HK-02 · TW-17, TW-02 · ST-13, ST-02, ST-03 · PO-01, PO-22, PO-21.

### 5.10 The Ornery Twin
*Register: comedy and mystery. Length: 3 to 5 weeks. Roles: Original, Twin, Confused Bystander.*
- **I:** Strange sightings. The hero is seen cutting in line at the bakery while also at the gym, and the town is baffled.
- **II:** The twin shows up in matches. Mirror segments and mix-ups follow. Sheriff Bev tries to arrest the wrong one.
- **III:** Original against twin. The reveal: the twin just wanted to be noticed. The twin ends up as a tag partner or goes on a "road trip."
- **Varies:** who plays the twin (another wrestler in matching gear, the player's alter ego or a newcomer), the flip (the twin is lovely and the original is the ornery one), and sibling or impostor.
- **Cards:** HK-20, HK-14 · TW-06, TW-11, TW-18 · ST-11, ST-09 · PO-01, PO-02, PO-13.
- *This is the cozy version of the "evil twin." Nobody here is evil. The twin is ornery and a little lonely.*

### 5.11 The Stolen Belt
*Register: caper comedy. Length: 3 to 5 weeks. Roles: Champion, Thief, optional Detective.*
- **I:** The belt goes missing, and Sheriff Bev opens a case file.
- **II:** The thief wears the belt around town: at the bakery, on a parade float, on the water tower ladder. Clues pile up. Jobber may be involved.
- **III:** The payoff, often an Object on a Pole match with the belt hanging from the pole.
- **Varies:** who the thief is (the villain, a masked figure, Jobber as a joke, or the champion as the twist), and how the belt comes back.
- **Cards:** HK-05, HK-10 · TW-14, TW-11, TW-03 · ST-01, ST-09 · PO-15, PO-06, PO-04.
- *The belt always comes back in one piece. No storyline ever breaks a belt. That image belongs to 1983 (section 14).*

### 5.12 The Secret Admirer
*Register: sweet, funny and romantic. Length: 3 to 6 weeks. Roles: Admired, Admirer (secret), Decoy Suspect.*
- **I:** Roses in the Locker. Notes appear on screen, and the town swoons.
- **II:** Suspects and gifts. A decoy (Gideon is sure it's for him). The admirer quietly helps the admired in a match.
- **III:** The reveal at a show, then a tag match together or a match against the jealous decoy.
- **Varies:** real romance (10.1) or kayfabe only, who the admirer is, and whether the feeling is returned or kindly declined (a friendship ending that's always gentle).
- **Cards:** HK-09, HK-10 · TW-03, TW-11, TW-02 · ST-09, ST-02 · PO-02, PO-23.
- *Everyone involved is an adult, and Pip is never romantically involved (both enforced by the engine). If the story is tied to a real romance, both people have agreed to it.*

### 5.13 The Family Feud
*Register: loud and loving. Length: 4 to 6 weeks. Roles: Family Member A, Family Member B, Mediator.*
- **I:** A public spat at the taqueria about the family move.
- **II:** Everyone picks a side. Relatives make cameos. Old photos come out.
- **III:** A payoff for the family name, then a group hug or "We'll fight about it again at Thanksgiving."
- **Varies:** a real family (the twins, Rosa's cousins) or a kayfabe one (the Long-Lost Sibling), and what they're fighting over (a move, a recipe, a name, a parking space).
- **Cards:** HK-16, HK-08 · TW-06, TW-18, TW-08 · ST-11, ST-09, ST-08 · PO-03, PO-02, PO-17.

### 5.14 The Outsider Invasion
*Register: rally-the-town spectacle. Length: 5 to 8 weeks. Roles: Invaders (2 to 4), Town Defenders, optional Traitor.*
- **I:** Strangers in matching jackets attack everyone after the main event, and the Tattler panics.
- **II:** The invaders win matches. Around town they're merely ornery: they put ketchup on June's pancakes and refuse Wanda's polite bow. Then a local joins them, through the Turn or a Double Agent.
- **III:** A lumberjack match, a battle royal or an elimination tag match, with the town's honor at stake.
- **Varies:** who invades (one of your other towns late in the game, MAXX Megatour, or whimsical Dungeon echoes), whether there's a traitor, and the ending (the invaders leave, become friends or stay as a group).
- **Cards:** HK-01, HK-15 · TW-01, TW-07, TW-17 · ST-13, ST-03, ST-15 · PO-07, PO-10, PO-02.

### 5.15 Loser Leaves Town
*Register: high drama with a real absence. Length: 4 to 6 weeks. Roles: Hero, Villain.*
- **I:** A feud that's been running a long time, often a Grudge Match sequel.
- **II:** Things escalate, and Loser Leaves Town is declared. "DON'T GO" signs appear around town.
- **III:** The payoff. The loser **actually leaves the map** for 2 to 6 weeks, and their shop door shows a sign ("Gone fishin'. Cousin's got it."). They come back later through the Return hook.
- **Varies:** who loses, whether they come back under a mask (combine with the Masked Mystery), and late in the game, whether the loser is "traded" to another of your towns (13.7).
- **Cards:** HK-19 · TW-11, TW-10 · ST-03 · PO-05, PO-09, PO-18.
- *This needs consent. Someone covers every business, such as Rosa's cousin at the taqueria. Birdie never leaves town in any storyline.*

### 5.16 The Haunted Locker
*Register: spooky-cozy whimsy, and a Harvest Havoc favorite. Length: 3 to 5 weeks. Roles: the Haunted, the "Ghost," the Skeptic.*
- **I:** The Cold Locker. Camcorder footage shows a frosted locker. Fenwick has a theory, and Coach Patty shows up to debunk it.
- **II:** The haunted wrestler's matches get strange: lights flicker and the bell rings by itself. The Skeptic gets spooked during an overnight stakeout in the Sportatorium.
- **III:** A Haunted House Match or a Lights Out match. The "ghost" turns out to be a wrestler in old-timey gear. In a rare variation, it really is a Dungeon echo who wanted one more match.
- **Varies:** who the "ghost" is, whether the skeptic comes around, and whether the echo is real (rare, and it requires Dungeon progress).
- **Cards:** HK-18, HK-17 · TW-12, TW-11 · ST-02, ST-09 · PO-20, PO-13.
- *Ghosts in Turnbuckle Alley are **echoes of great matches**, never people who have died. The engine blocks Dottie's locker from ever being the haunted locker.*

### 5.17 The Worked Shoot
*Register: raw, honest and cathartic. Length: 3 to 6 weeks. Roles: two insiders with real tension.*
- **Trigger:** a real disagreement in an insider space (10.2).
- **I:** A promo "goes off script." In kayfabe it looks like a real outburst, but it was planned in the booth. For marks, everything is real anyway, so to them this plays as a feud with unusual bite. Fans who know the business feel the extra layer.
- **II:** Escalation built on things that are honestly felt. In the booth, the two of them actually talk.
- **III:** The payoff match, then a **required insider beat, "The Air Clears,"** where they make up for real.
- **Varies:** what the tension is about, the payoff type, and how they make up (a handshake, a shared milkshake, repainting the store sign together).
- **Cards:** HK-03, HK-08, HK-19 · TW-13, TW-17, TW-18 · ST-12, ST-02, ST-09 · PO-03, PO-08, PO-17.
- *The story never makes the real tension worse. If a worked shoot flops, the make-up beat still happens.*

### 5.18 The Redemption
*Register: forgiveness and warmth. Length: 4 to 6 weeks. Roles: Redeeming Villain, Wronged Hero, Doubter.*
- **I:** The villain's partner abandons them, or the camcorder catches the villain doing something kind.
- **II:** The villain offers help and gets turned down. Then Change of Heart and the Heart-to-Heart. The town stays skeptical: the bakery keeps charging the villain surcharge until, one morning, the name next to it has been wiped off.
- **III:** A tag match together against the villain's old partner, and the villain surcharge comes off for good.
- **Varies:** why the villain redeems, whether the hero accepts, and whether the old partner forgives.
- **Cards:** HK-01, HK-07 · TW-02, TW-13, TW-17 · ST-12, ST-02 · PO-02, PO-07.
- *This is the shape that crowd-driven turns usually use (8.3).*

### 5.19 The Fall from Grace
*Register: dramatic, "I didn't see that coming." Length: 4 to 6 weeks. Roles: Falling Hero, Friend, Tempter.*
- **I:** The hero loses a big match and gets frustrated.
- **II:** A tempter (a manager or a smooth-talking city type) offers a shortcut. The hero takes a cheap win. Pip's sign reads `SAY IT ISN'T SO`.
- **III:** The new villain against their old friend, or a turn back to hero at the last second.
- **Varies:** why it happens, how far they fall (tweener or fully ornery), and whether they turn back.
- **Cards:** HK-15, HK-03 · TW-01, TW-08, TW-07 · ST-01, ST-11 · PO-04, PO-05.
- *Even a fallen hero stays on the ornery side of the line in 3.6.*

### 5.20 The Odd Couple
*Register: buddy comedy. Length: 3 to 5 weeks. Roles: Partner A and Partner B (who can't stand each other), the Champions.*
- **I:** Birdie forces them to team up, or they lose a Diner Bet together.
- **II:** Comic mismatches, like the librarian and the high-flyer, or the vain one and the messy one. Birdie sends them to the fairgrounds to hang flyers together, which plays as a public angle. They start to click.
- **III:** A tag title payoff and a high-five that finally connects.
- **Varies:** who they are, whether they win or lose, and whether they stay a team.
- **Cards:** HK-08, HK-06, HK-13 · TW-17, TW-02 · ST-01, ST-07 · PO-02, PO-11, PO-12.

### 5.21 The Big City Dream
*Register: bittersweet, then home. Length: 6 to 10 weeks, and it can run as a Saga. Roles: Dreamer, Town Loyalist, City Rep (kayfabe).*
- **I:** The Big City Letter. The town reacts with Mayor Delphine's plea and Pip's long face.
- **II:** Farewell matches and one last night at the VFW. The dreamer leaves (they're actually off the map for a while), or decides at the last moment to stay.
- **III:** The Return. The dreamer comes home with new moves and wrestles the loyalist or teams with them.
- **Varies:** leave and return (Dex's canon path), or stay. Nobody leaves forever.
- **Cards:** HK-15, HK-07 · TW-10, TW-02, TW-13 · ST-13, ST-03 · PO-06, PO-01.

### 5.22 The Manager's War
*Register: scheming, with 80s flair. Length: 4 to 6 weeks. Roles: Manager A, Manager B, their Clients.*
- **I:** A manager arrives with a client, and June gets a look in her eye.
- **II:** Interference from ringside, dueling promos and a custody fight over a client. June comes back to ringside.
- **III:** Client against client, with the managers locked in a shark cage above the ring or tied together at ringside with the Bandana rules.
- **Varies:** who manages (June, Sweet Lou, Gideon as a "beauty consultant" or the player), and the custody stakes.
- **Cards:** HK-06, HK-14 · TW-08, TW-07, TW-01 · ST-09, ST-02 · PO-07, PO-02, PO-05.

### 5.23 The Tournament
*Register: sporting spectacle. Length: 3 to 6 weeks. Roles: 4 to 8 Entrants, a Dark Horse.*
- **I:** Birdie announces the tournament. The bracket goes up in the Hot Tag window and in the Tattler, and the town bets in pies.
- **II:** Rounds at each show, with upsets and a surprising run by the dark horse.
- **III:** The final at a supershow.
- **Varies:** bracket size, singles or tag, whether the dark horse wins, and whether it's a tournament for a vacant title.
- **Cards:** HK-06, HK-02 · TW-03, TW-05, TW-15 · ST-01, ST-10 · PO-01, PO-02, PO-23.

### 5.24 The Prank War
*Register: pure comedy. Length: 2 to 4 weeks. Roles: Prankster A, Prankster B, the Collateral (usually Gus).*
- **I:** A rubber chicken in someone's boot, and glitter in someone else's robe.
- **II:** The pranks escalate in public angles: a removable mustache banner on the water tower (Mayor Delphine is amused), and a ring entrance played on kazoo. Sheriff Bev investigates.
- **III:** A whimsical payoff with silly stakes, such as the Chicken Suit.
- **Varies:** the kinds of pranks, Jobber joining in as a prankster, and who wins.
- **Cards:** HK-10, HK-08 · TW-11, TW-03 · ST-07, ST-08 · PO-11, PO-15, PO-12.
- *Pranks are only ever played on insiders. Marks are never pranked.*

### 5.25 The Gentle Monster
*Register: a tender reveal. Length: 4 to 6 weeks. Roles: Monster, Underdog, and the crowd as witness.*
- **I:** The monster flattens everyone.
- **II:** Glimpses of something else: the camcorder catches the monster helping a lost kid find their parents at the concession stand. The bakery is puzzled. A hero calls him out: "I saw you smile."
- **III:** The monster wins or loses, but either way shows his heart, which opens the door to a crowd-driven turn.
- **Varies:** whether he turns, and what his soft side is (a book, a cat, a hobby).
- **Cards:** HK-02, HK-01 · TW-13, TW-02 · ST-14, ST-12 · PO-09, PO-01.
- *This shape is a natural fit for Big Earl. The monster never menaces kids.*

### 5.26 The Rookie's First Win
*Register: pure triumph. Length: 2 to 4 weeks. Roles: Rookie (often the player), Veteran.*
- **I:** The rookie keeps losing, and the record becomes a running gag ("0 and 7").
- **II:** The town rallies. Pip's sign reads `TODAY'S THE DAY`. The veteran taunts.
- **III:** The first win. Birdie lets confetti fly on a Wednesday, just this once.
- **Varies:** the veteran's alignment, and how the win comes (a roll-up, an Agnes assist, or a clean win).
- **Cards:** HK-02, HK-03 · TW-05, TW-02 · ST-02, ST-12 · PO-01, PO-12.
- *This is an early-game staple for the player.*

### 5.27 The Legacy
*Register: generational and moving. Length: 5 to 8 weeks. Roles: Legacy Holder, Heir, Challenger.*
- **I:** The heirloom is introduced, and then it goes missing.
- **II:** The heir trains, and a challenger claims the legacy. Family history comes out (for Rosa, Abuela Celia's 1958 mask).
- **III:** A payoff for the family name, and a mask or a move gets passed down.
- **Varies:** whose legacy (Rosa's lineage, Clint's mask, or the Velvet Hammers after the credits), and who inherits (it can be the player).
- **Cards:** HK-16, HK-07 · TW-16, TW-15, TW-04 · ST-11, ST-04 · PO-03, PO-24, PO-01.

### 5.28 The Wedding
*Register: joy. Length: 3 to 5 weeks. Roles: the Couple, the Objector (comic), the Officiant.*
- **I:** A proposal in the ring, and the town goes wild.
- **II:** Preparations: Marigold sews the gear, and Tiny builds a tower of tiny cakes. A villain lodges a comic objection (to the floral arrangements).
- **III:** The wedding in the ring. The "objection" turns out to be a gift. A celebration tag match follows, and the spouse becomes a tag partner, as the canon says.
- **Varies:** whether it's on screen, who objects and why, and the celebration match.
- **Cards:** HK-09 · TW-02, TW-03 · ST-02 · PO-02.
- *A wedding is never sabotaged. Objections are jokes that end in hugs.*

### 5.29 The Cryptid Hunt
*Register: whimsical mystery. Length: 3 to 5 weeks. Roles: Hunter, the Mothman, Skeptic.*
- **I:** Fenwick's Prophecy. A wrestler vows to unmask the Mothman.
- **II:** Night beats: stakeouts at the water tower, sightings, and a hunter who gets well and truly spooked.
- **III:** A Lights Out match. The hunter loses, or wins and finds only a single dusty wing scale.
- **Varies:** the hunter's alignment, a respect ending, and whether the Mothman becomes an ally.
- **Cards:** HK-17, HK-14 · TW-12 · ST-02, ST-09 · PO-13.
- *The engine guarantees the Mothman is never unmasked and only appears at night.*

### 5.30 The Reinvention
*Register: self-discovery and fun. Length: 3 to 5 weeks. Roles: Reinventor, Old Rival, Supporter.*
- **I:** The New Look, and nobody recognizes the reinventor. The player's version is tied to the character creator's "reinvent" option.
- **II:** The old rival insists "I know it's you." Longtime fans adjust, and the merch gets overhauled.
- **III:** A payoff that proves the new self.
- **Varies:** what changes (alignment, look, music or name), and whether the old self comes back for one night as a callback.
- **Cards:** HK-20, HK-14 · TW-11, TW-02 · ST-11, ST-02 · PO-01, PO-23.

### 5.31 The Grudge Match
*Register: fiery old rivals. Length: 3 to 6 weeks. Roles: Rival A, Rival B.*
- **Built from history.** When two characters have a storyline in the archive, this shape revives it with callback cards.
- **I:** The Rematch Clause. Old footage plays on the big screen.
- **II:** Old wounds, with archived stories quoted by name. A public angle at the spot where the old feud happened.
- **III:** A bigger stipulation than last time.
- **Varies:** who won last time, whether to flip the result, and whether to end it for good or leave the door open.
- **Cards:** HK-19, HK-03 · TW-11, TW-17 · ST-03, ST-05, ST-06 · PO-05, PO-18, PO-09.

**Total: 31 shapes.** New shapes can be added as data (15.1) without engine changes.

---

## 6. Personality and pushback

Pushback is how a character shows who they are. When Gideon turns down the clippers, the player learns something about Gideon. The pushback system follows four rules:

1. **Red lines are absolute.** No amount of friendship, skill or arguing moves them. Characters may *choose* to cross their own old lines at a moment in their life they pick themselves, as when Rosa offers her mask or Clint decides to unmask. That choice is always theirs and comes through their signature storyline.
2. **Soft dislikes can be talked through,** and the player can see beforehand whether talking will work. Persuasion is never a hidden dice roll.
3. **Every "no" comes with a "how about."** A refusal always produces a counter-offer or a spin, so a pitch never stalls out.
4. **People get bored too.** Characters remember what they've done lately and ask for something new.

### 6.1 How a character judges a card

Every card has tags (15.1). Every character has 2 or 3 **traits** with weights for each tag, a list of **loves** (specific cards or tags they adore), **red lines** (hard blocks) and **spins** (their personal rewrite of a card).

```
score(character, card) =
    sum over the character's traits of trait.tagWeights[tag] for each of the card's tags
  + love bonus (+2 for each loved tag or card)
  + chemistry modifier (−1 to +1, with the other people in the story)
  + friendship modifier (0 to +2, with the player; only applies to soft dislikes)
  − boredom (−1 if they've done this card or shape in the last 8 weeks)
```

| Result | Reaction | What happens |
|---|---|---|
| Hits a red line | **"No."** | The card is refused. If the character has a spin for that card, they offer it straight away. Otherwise they counter with their best-scoring card for the slot. The red line is recorded in the character's journal page, so the player learns it. |
| 3 or more | **"Love it."** | +5 starting buzz and a small morale boost. Their face on the napkin lights up. |
| 0 to 2 | **"Fine."** | Accepted. |
| −3 to −1 | **"Hmm, how about..."** | They counter with a spin or their best card for the slot. The player can accept the counter, keep their own card by talking it through, or pick a different card. |
| Below −3 | **"I don't know..."** (a soft no) | Like the row above, except the talk-through is harder. |

**Talking it through** is deterministic. The game compares the player's *persuasion*, which is Storytelling level + half the character's hearts (rounded down) + 1 if their chemistry with the character is high, against the character's *resistance*, which is the size of the negative score + 1. Before the player tries, the button shows the outcome: "Gideon's listening" or "Gideon's not ready for that. Maybe with more trust." A talk-through that comes up short costs nothing and simply turns into the character's counter-offer.

**How the modes use this.** In *You drive*, the pitcher only places cards they score at 0 or higher, and they've already adjusted for the other participants' red lines. In *Let's build it together*, offers never include red-line cards for anyone involved, and cards that would get a "Hmm" show a small wince icon. In *I've got an idea*, nothing is filtered out. Once the player has learned a red line, though, cards that would hit it show a red thread icon in the Tin. Learning red lines is part of getting to know people.

**Group pitches.** When several characters are on the napkin, everyone reacts to each card, with faces drawn around the napkin's edge. If two characters disagree, they argue with each other, and the player breaks the tie. Twins always disagree.

### 6.2 Traits

| Trait | Leans toward | Leans away from | How they reshape a pitch |
|---|---|---|---|
| **Vain** | spotlight, spectacle, gear | humiliation_light, hair, mess | Turns an embarrassment into a makeover or a glamour moment. |
| **Anxious** | rehearsed, comedy, short | improv, hardcore, cage, live_mic | Asks for a rehearsal beat, or shortens the length. |
| **Proud** | title, legacy, clean_finish | comedy stakes, losing by cheating | Upgrades the stakes to a title, or adds a rematch clause. |
| **Gentle** | heartfelt, comedy, kids_spotlight | violence_mid, hardcore, menace | Turns an attack into a rescue. |
| **Showboat** | spectacle, high_risk, entrance | mat_classic, slow_build | Adds a dive, pyro or an entrance segment. |
| **Traditionalist** | mat_classic, legacy, old_school | whimsy, gimmick matches | Swaps a whimsical payoff for a classic one. |
| **Mischievous** | comedy, swerve, prank | solemn | Adds a prank or a swerve beat. |
| **Family-First** | family, legacy, hometown | leaving, career_ending | Adds a family cameo, and resists stakes that mean leaving. |
| **Competitive** | title, tournament, rematch | losing for comedy | Asks for winner-take-all. |
| **Romantic** | romance, heartfelt, secret | love used as betrayal | Adds a love-interest subplot (adults only). |
| **Dreamer** | spectacle, big_city, supershow | small stakes, stagnant stories | Pulls the payoff toward a supershow. |
| **Loyal** | tag, alliance, reunion | being the betrayer | Is willing to be betrayed, but won't betray anyone. |
| **Private** | heartfelt (off screen) | public angles, real_life on screen | Keeps real-life elements off screen. |
| **Analytical** | mat_classic, rules, technical | chaos, schmozz | Adds a rules stipulation. |
| **Superstitious** | night, mystery, supernatural | certain dates | Adds ritual beats, and won't schedule on unlucky dates. |
| **Grumpy** | villain role, bragging_rights | sappy (on the surface) | Trims the heartfelt beats, then quietly asks for them back. |
| **Nurturing** | mentor, comeback, student | humiliation | Adds a lesson beat. |

### 6.3 Spins and red lines for each insider

These are working values. CAST.md is the authority on who these people are, and this table should be updated to match it.

| Character | Traits | Loves and spins | Red lines | In their words |
|---|---|---|---|---|
| **Birdie Malone** | Nurturing, Traditionalist, Mischievous | Old-school psychology and carny swerves (WC-06). Adds a heart to anything cold. Always asks whether "the one who leaves comes back." | Nothing mean, ever. Dottie's locker is never used. No belt is ever broken on screen. | "We don't do mean, sugar. We do ornery." |
| **La Mariposa Dorada (Rosa Villanueva)** | Proud, Family-First, Traditionalist | Lucha tradition, high-flying, honor, trios matches, Abuela Celia in her corner. Turns title stories into stories about *earning*, not taking. | **Her mask can only be risked on her own terms.** Mask vs. Mask and Half a Mask are greyed out for her unless she proposes them, which happens only in her signature storyline or at a moment she chooses at 10 hearts. No jokes about her abuela or lucha tradition. The taqueria never closes for a story; her cousin covers. In public La Mariposa never speaks, so her promos are gestures, with Abuela Celia translating. | "In my family, you don't take a mask. You earn the right to ask." |
| **Big Earl "The Mountain" Odom** | Gentle, Private, Grumpy (on screen) | Slow, looming menace aimed at adults. Library bits and the Story Hour stakes. A secret soft side. | **Nothing mean around kids.** No beat may frighten, menace or embarrass a child, and the Mountain never takes Pip's cardboard belt (he nods at it solemnly). The library is never part of a villain angle. His children's book stays private unless he chooses otherwise (10.5). | "The Mountain doesn't growl at children. The Mountain nods." |
| **Dex "Dropkick" Delgado** | Dreamer, Showboat, Loyal | Dives, ladders, supershows, big-city glamour, anything tall. Adds a dive off something to every payoff. | Won't trash Turnbuckle Alley on the mic, even as a villain. Won't do a story where he leaves without saying goodbye. | "If I'm jumping off it, it better be the tallest thing in the building." |
| **"Gorgeous" Gideon Price** | Vain, Anxious, Showboat | Sequins, mirrors, entrances, video packages, rehearsed promos. Turns humiliation stakes into "sit in my chair" makeovers. | **Never any stipulation where he might lose his hair,** not even as the winner. No unrehearsed live mic: open-mic segments need a rehearsal beat first. | "I'm not vain. I'm *accurate*." |
| **Bo Bruiser** | Analytical, Grumpy, Loyal | The careful twin, label maker holstered like a sidearm. Rules, technicalities, inventory, and schmozz finishes that technically count. | Never pins Buck clean, and Buck never pins him. Any breakup must leave a door open. | "It is legally not the same thing." |
| **Buck Bruiser** | Showboat, Competitive, Mischievous | The chaotic twin. Bets, dares, gadgets that collapse, and "who's the better twin" contests. | The same rule about pinning his twin. Never makes the store look bad. | "I bet you a hammer I can do it. A *good* hammer." |
| **Hazel "Hurricane" Huang** | Proud, Nurturing, Competitive | Comeback stories, discipline, mentoring, mat classics, dawn yoga as a training montage. | The villain may target her knee, but **the finish can never be the knee giving out.** No worked knee injuries; it's too close to home. Never the old Hurricane dive again. | "My knee is part of the story. It's not the ending." |
| **"Cowboy" Clint Ransom (secretly the Dust Devil)** | Family-First, Traditionalist, Private | Last-ride framing, bandanas, sundown imagery, Wanda at ringside, "one more." Puts a sunset on everything. | The Dust Devil is never unmasked in front of Lacey until *Clint* decides. She's never targeted or humiliated, and if his choice breaks her heart, the story has to heal it. His last match happens on a Saturday. | "Every ride's got a sundown, partner. I'd like to pick mine." |
| **The Mothman** | Mischievous, Private, Superstitious | Night, lights out, mystery, arriving at the very end. Adds moths, flickering lights and one dramatic pointing finger. Not even the insiders know who it is, so it never sits at the table: it agrees to a pitch, or declines, with a moth-shaped note left in the booth. | Never unmasked by any storyline. Never appears before sundown. Never speaks. Never a villain who hurts anyone, only a mysterious one. | *(points)* |
| **Tamsin "Tiny" Tallbridge** | Gentle, Competitive, Nurturing | Baked goods, kids (a tiny cake for a kid at ringside every show), underdogs, and apologizing before she hits you ("Sorry! Sorry!"). Adds a baked good to every segment. | **No cake in faces**, because cake is for eating. Won't bully anyone, even as a villain. No jokes about her size, except in a signature story she has chosen herself (3.6). | "I made you a little something. It's lemon." |
| **Odessa Pruitt, "Professor" Pinfall** | Analytical, Traditionalist, Proud | Mat classics, submissions, the Pop Quiz Match, Two Out of Three Falls, rules stipulations. Turns every story into a lesson. | Never mocks a kid for a wrong answer. No hardcore payoffs: "A chair is not an argument." | "Show your work." |
| **Sweet Lou Bastian** | Traditionalist, Nurturing, Superstitious | Old-school psychology, mentor and corner-man roles, slow builds, fishing metaphors. | **Never puts 1983 in a storyline:** "Some stories ain't for selling." Wrestles at most one match a year; otherwise he's a corner man or manager. | "Slow down. Let 'em bite." |
| **Referee Mo (Maribel Dizon)** | Loyal, Mischievous (a theatrical streak she keeps folded up) | Ref bumps (her famous Sack of Mail), fast counts, slow counts, and "special delivery" segments where she brings the contract. | Plays a crooked ref for one week at most: "I've got a route to walk." | "Special delivery. Sign here. And here. And duck." |
| **Gus Gravel** | Showboat, Romantic | Naming matches, call-in segments, hype. Gives every storyline an on-air nickname. | WRSL is never part of a villain takeover, because his listeners trust him. | "They're calling it... the CRULLER CONFLICT!" |
| **June Oyelaran (Madame Midnight, retired)** | Proud, Mischievous, Nurturing | Managing, 80s flair, the jeweled fan to the referee's blind side, comebacks, her own included. | The back booth is sacred and never appears in a public angle. Won't manage anyone who's rude to her customers. | "Honey, I've managed bigger egos in smaller hats." |
| **Henrietta "Hank" Szabo** | Analytical, Private | Props: cages, breakaway tables, ladders, belts. | No prop is used without a test run, which adds a required Friday beat. Nothing unsafe, ever. | "I'll build it. You'll rehearse it." |
| **Marigold Iyer** (they/them) | Romantic, Analytical (a fussy perfectionist) | Costumes, chicken suits, matching tag gear, wedding gear, dramatic robe reveals. | Nothing that mocks a body. Won't sew a joke mask for a luchador. | "I can make you look like a hero or a chicken. Not both. Well. Maybe both." |
| **Doc Halloran** | Nurturing, Analytical | Playing the ringside doctor for worked injuries, comebacks, stretcher exits, the solemn headshake. | "Doctor's orders are real orders." Never clears someone who's really hurt. Every worked injury needs his sign-off. Won't referee a match, not since the night of the Broken Belt. | "Walk it off. No, really. Walk. Let me watch." |

**Grandma Dottie** isn't on the active roster. Her limits are set at the system level: her memory loss is never story material, she's booked only in the Homecoming finale and in cameos after the credits, and she never appears in a betrayal shape. **The player** has no traits or red lines imposed on them. Their gimmick and alignment belong to them.

### 6.4 Chemistry and friendship

- **Friendship** (hearts from 0 to 10, between the player and a character) changes how a character treats *the player's* ideas:
  - **3 hearts:** they'll consider soft dislikes if you talk it through.
  - **5 hearts:** they share an insider-story card ("Did I ever tell you...").
  - **7 hearts:** they offer their **signature storyline** (12.3).
  - **9 hearts:** they ask you to "just surprise me" and accept your cards with only gentle pushback.
  - Red lines never move at any heart level.
- **Chemistry** (0 to 100, between any two wrestlers, the player included) grows by working stories and matches together:
  - In matches, high chemistry makes the partner's called spots clearer, as the canon says, and raises the possible star rating.
  - In pitches, high-chemistry pairs accept riskier cards together and suggest each other as partners or opponents.
  - Low chemistry ("We'll figure it out") lowers starting buzz but grows quickly when the story succeeds. Odd Couple stories are built on this.
- **Rivalry fatigue:** if the same pair headlines three stories in a row, both of them ask for someone new. "I love you, but I've seen your armpit more than my own family."

---

## 7. Birdie as booker

In the early and middle game, Birdie Malone holds the pencil: the stub of a carpenter's pencil she has booked with since before the player was born. Her office has a corkboard full of napkins, a coffee maker older than the VFW, and a couch she sleeps on more nights than she admits. In public she plays the Commissioner, handing out "fines" to villains. In this office she's just Birdie. She reviews every pitch that involves the player and every consult the player helped with.

Birdie protects the player. She is never the obstacle. She's the friend who makes your idea better, with the wisdom of a carny who has seen every trick and every sneak.

### 7.1 How she judges a pitch

Birdie asks five questions, and each one maps to a reason code the engine uses (15.6):

1. **Will it draw?** She looks at the forecast and the card fit.
2. **Does it fit the card?** She checks the balance of heroes and villains, how many stories are already running, and which shapes are cooling down.
3. **Is everybody okay?** She checks morale, red lines, overuse and rest.
4. **Is it ornery, or is it mean?** She checks the guardrails in 3.6.
5. **Has the kid earned it?** She checks the player's rung on the ladder and her Ledger.

### 7.2 Her verdicts

| Verdict | When | What happens |
|---|---|---|
| **Approve** | The pitch passes all five questions. | It goes on the calendar as it is. |
| **Tweak** | One or two questions have small problems. | She proposes one or two changes, such as a shorter length, a different venue, a different payoff or a swapped villain. The player can accept or **plead their case** once. |
| **Veto** | A guardrail problem, a red line someone missed, a serious roster conflict, or the rung is too low. | The cards go back to the Tin, and there's no Ledger penalty. She always gives a reason and a way forward. |
| **Not yet** | A great idea at the wrong time. | The napkin gets a gold star and a spot on the corkboard, and it comes back as a pitch when the conditions are right (the right rung, the supershow window or the right cast). |
| **Sleep on it** | Rare. A big Saga, or something touching main-story nerves. | The verdict comes at the next office morning. |

**Pleading your case.** After a Tweak, the player may push back once by choosing an argument: *the crowd*, *the heart*, *the roster* or *the history*. If the argument answers her real concern (the reason code), she gives in with delight: "Well, now. You've been listening." If it doesn't, she smiles and holds firm, with no penalty. She likes being argued with when you're right.

### 7.3 Birdie's Ledger

The Ledger is Birdie's private measure of how much she trusts the player's booking instincts. It never swings much in either direction.

- **It goes up for:** stories that land (stars and buzz), respecting red lines, good consults, balanced pitches, taking a tweak gracefully, pleading your case well, and rescuing a flop.
- **It goes down a little for:** flops, ignoring her warning and then flopping, and pitching close to the ornery line again and again.
- **It never goes down for:** turning down a pitch from a resident, using "You drive," or skipping shows. Choosing a cozy way to play is never punished.

### 7.4 Birdie's voice

**Approve:**
- "Sugar, that's the dumbest thing I ever heard. Do it."
- "Well, butter my biscuit. That'll draw."
- "I saw that one work in '79 and flop in '81. Make it '79."
- "Go on, then. Don't make me regret it in front of Agnes."
- "That's a money idea. Don't tell anybody I said money."
- "Honey, I got goosebumps, and I'm seventy-some years old and wearing a cardigan."

**Tweak:**
- "Love it. Cut it to four weeks. Folks got jobs."
- "Not at the VFW, honey. That ceiling's nine feet. Somebody'll ladder straight into a ceiling fan."
- "Switch the villain. Earl's done three in a row, and the library's getting complaints about his posture."
- "Keep the twist, lose the cage. Hank ain't finished the door."
- "Wednesday crowd can't take that much feeling before bingo. Move it to Saturday."
- "Good bones. Give Gideon more to do, or he'll redecorate my office out of spite."

**Veto:**
- "No, ma'am. That's mean, and we don't do mean. We do ornery."
- "Rosa'd sooner eat that mask. You ask her proper, or you don't ask."
- "We ran that one in April. This crowd's got memories like elephants and purses like Agnes."
- "That's three stories for Dex and none for Hazel. Spread the butter, sugar."
- "You're not there yet, kid. You will be. Keep this one in your tin."

**Not yet:**
- "Oh, I like this one too much to waste it. Gold star. Ask me again at Harvest Havoc."
- "Not yet. Put it in your tin. It'll keep."

**Sleep on it:**
- "Let me sleep on it. Come by Monday. Bring a donut. Not a plain one."

### 7.5 Earning more say: the career ladder

The player's say grows rung by rung. Each rung widens what they can pitch and loosens Birdie's grip.

| Rung | What you can pitch | Active stories you're in | Birdie's grip | New tools |
|---|---|---|---|---|
| **1. Opener** | Opener stories you're in. Consults on friends' stories. | 1 | Heavy (she tweaks most pitches) | The Recipe Tin, the napkin, the starter deck |
| **2. Undercard** | Undercard stories, and you choose your opponent. | 2 | Firm | Playing twists at huddles |
| **3. Midcard** | Midcard stories, plus two consults at once. | 2, plus consults | Moderate | Epic length, midcard titles, the coffee-ring forecast at full detail |
| **4. Main event** | Main event stories and title changes in your stories. | 3 | Light | Saga length, a "Crowd Read" preview, and you can request supershow payoffs |
| **5. Assistant booker** | You book **the whole Wednesday show**, with no approval needed. Saturday pitches still go to Birdie. | Any | Saturdays only | The Booking Board, Wednesday version (section 13) |
| **6. The Pencil** | **Everything.** | Any | None. She's an advisor now ("Birdie's two cents"). | Full Booking Mode |
| **7. Owner** | Plus the budget, building upgrades and new titles. | Any | None | Owner tools (13.6) |
| **8. Founder** | Plus protégés and new towns. | Any | None | Delegation, invasions, talent trades (13.7) |

**Moving up a rung** takes four things: a Ledger threshold, a Storytelling skill level, an in-ring milestone (for example, a 4-star main event for rung 4), and a scene in Birdie's office. Rung 6 may also wait on main-story pacing; coordinate with the main story doc.

**The Pencil scene** (outline). Birdie's office, late. She slides the pencil across the desk. It's barely two inches long. "It's got teeth marks in it. Those are mine. Get your own." She doesn't let go of it right away. Then she does. From then on, her corkboard is your corkboard.

**After the Pencil, Birdie keeps her opinions.** "Birdie's two cents" is an optional advisor on the Booking Board. Tap her mug, and she reads your card the way she used to read the player's pitches. She never vetoes again, but she will say "Well, it's *your* pencil" in a tone that makes you double-check.

---

## 8. The crowd steers

The crowd is a co-author. Players can book a story, but the people in the folding chairs decide what it turns into.

### 8.1 What the game measures after each beat

| Signal | Source | What it measures |
|---|---|---|
| **Match stars** (0 to 5) | The match system | How good the match was |
| **Crowd meter peak** | The match system | The loudest moment of the match |
| **Chants** | Generated from the beat's tags and best moment | What caught on. Chants become collectible chant cards for future promos. |
| **Merch sales** | The merch table and the merch machines | Each wrestler's popularity. A villain outselling a hero is a strong signal. |
| **Tattler review** | Clementine, every Sunday and Thursday | A star rating, a headline and a quote from the review |
| **Town buzz** | Town moments | How much marks are talking about the story |
| **Attendance** | Seats filled | Foraged folding chairs count. Every chair you found is another seat, and another voice. |

### 8.2 Buzz

Every storyline has **buzz**, a momentum score from 0 to 100. It starts at 50 and is adjusted by card fit, freshness, any "Love it" reactions and gold stars on cards. After each beat:

```
buzz += 6 × (stars − 2.5)
      + 2 × (number of chants generated, at most 3)
      + town buzz from the beat (0 to 4)
      − fatigue from 8.5 (0 to 6)
      + rescue power if a twist or wildcard was played (9.3)
clamped to the range 0 to 100
```

Buzz drives the story's **status**: *Hot* (75 or higher), *Steady* (40 to 74), *Cooling* (30 to 39) or *Flopping* (below 30).

### 8.3 Sentiment and turns the crowd chooses

Every character in a story has a **crowd sentiment** from −100 (booed out of the building) to +100 (adored). Heroes want it positive and villains want it negative. **Intensity**, meaning how strongly the crowd feels in either direction, is good for both.

**Turn pressure** builds when the crowd and the book disagree:

- **The crowd chooses a villain:** a villain's sentiment stays above +30 for 3 beats in a row, *or* their merch outsells the hero's two to one for 2 weeks.
- **A hero goes stale:** a hero's sentiment stays below −20 for 3 beats in a row.

When turn pressure fires, it creates a booth scene. The villain slides into the booth looking rattled: "Kid. They're cheering me. Agnes *waved* at me. What do we do?" The player chooses:

| Choice | Result |
|---|---|
| **Lean in** | At the next show, a turn beat is added automatically (Change of Heart or the Heart-to-Heart). The current story either changes into a Redemption or ends early with a happy payoff. A new story often follows: hero and ex-villain against someone new. |
| **Fight it** | The villain doubles down on ornery behavior, and the gentle humor gets bigger. If the crowd keeps cheering, they become a **beloved villain**: booed out of love, with sentiment around zero and very high intensity. Some characters thrive like this (Gideon, secretly). |
| **Wait a week** | Nothing changes yet. If the pressure lasts 3 more weeks, the crowd decides on its own: the character becomes a **tweener**, the Tattler announces "THE PEOPLE HAVE SPOKEN," and the next pitch involving them is built around the new alignment. |

Personality colors these scenes. Anxious Gideon panics at being cheered ("What if they *like* me? I'll have to be *nice*. In *public*."). Grumpy Big Earl pretends not to care and shows up to the booth in a new sweater.

**Organic turns are a feature, not a bug.** A turn the crowd forces on the book should feel like the town grabbed the pencil for a moment, which, in a way, it did.

### 8.4 Extending a story and ending it early

- **Extend:** if buzz is 75 or higher at the end of Act II, the pitcher (or Birdie, or the player holding the Pencil) offers to **"add a chapter,"** which adds 1 to 3 weeks of Act II beats. Each story can be extended once. Rarely, a Hot story near a supershow offers to move its payoff to that supershow.
- **End early:** if buzz stays below 30 for two beats in a row, a huddle opens with a flop warning (9.3). One option is **"Wrap it up"**: skip to Act III and pay it off at the next show with no penalty.

### 8.5 Fatigue

The crowd gets bored of repetition, gently:

| Repeated thing | Window | Starting buzz penalty |
|---|---|---|
| The same shape | 8 weeks | −8 |
| The same card | 8 weeks | −4 for each card |
| The same pair of headliners | 3 stories in a row | −6, and the characters complain (6.4) |
| The same tag (for example `betrayal`) more than twice on one show | One show | −2 for each beat |

Fatigue is shown as a soft yawn icon on the napkin's forecast, never as a lockout.

### 8.6 The crowd remembers

Finished storylines go into the archive (15.8), and the crowd remembers them. Rematches, callbacks and reunions earn bonuses when they refer to real history from the archive. If a feud from the spring returns in the fall, the Tattler quotes its own spring review. Even flops turn into callbacks the crowd loves (9.4).

---

## 9. Flops and saves

### 9.1 What a flop is

A story is **flopping** when its buzz falls below 30. Common causes:

- Matches that don't land, such as two 1.5-star matches in a row.
- A mismatch of personalities, such as a gentle hero against a lecturing villain with no one bringing the fire.
- A shape that's still cooling down, or a tag that's been overused.
- Stakes that don't matter to anyone.
- A story that's simply too long.

### 9.2 Gentle consequences

A flop **never** causes:

- a lost friend or a damaged relationship
- a lost wrestler
- a lost card
- a demotion
- any lasting harm

A flop **does** cause:

- **A snooze in the Tattler.** Clementine's funniest writing comes out for the worst shows (9.5).
- **A few empty chairs on Wednesday.** Your foraged chairs are still there, just unfilled.
- **A small dip in merch** for the people in the story.
- **Gentle teasing in the booth.** "Can't all be classics, sugar." Then pie, which helps.
- **A lesson.** Every flop gives Storytelling XP and adds a "What we learned" note to the napkin ("The Wednesday crowd doesn't want homework.").
- **A callback card** (WC-10). The flop becomes a running joke you can use later for a big laugh.

### 9.3 The huddle and saves

A **huddle** is a short check-in in the booth about one story. It happens automatically when a story starts Cooling or Flopping, and the player can call one about any story they're part of after any show.

At a huddle, the player can:

- **Play a twist** (if the story has fewer than 2 twists) or **play a wildcard.** Each card has *rescue power*: common cards +15 buzz, uncommon +20, rare +25, legendary +35. Bigger effects come from cards that fit the story's problem. Agnes Gets Involved, for example, is strongest when the story lacks heat.
- **Reshuffle** with The Second Chance (WC-09): new Act II beats, the same cast.
- **Wrap it up:** skip to Act III.
- **Let it ride:** do nothing. Sometimes the payoff match saves everything by itself.

Each story can be saved **twice at most.** A saved story gets a **"Saved!"** stamp on its napkin, and the Tattler takes back what it said (9.5). Saved stories are some of the best in the game. "The comeback of a story" is its own kind of satisfying.

### 9.4 The fizzle ending

If a flopping story is never saved, it **fizzles**: a short payoff match at the next Wednesday show, a shrug from the Tattler, and everybody eating pie in the booth. The napkin goes into the Napkin Box with a coffee stain and the note "Well, we tried." A few weeks later, the callback card shows up in the Tin with a note from Gus: "The people want the Cheese Match back."

### 9.5 Clementine's reviews

Clementine is a mark who reviews every show with total sincerity and a gift for the cutting phrase.

**Snoozes:**
- "I have seen more tension in a wet noodle. Two stars, and one of them is for the popcorn."
- "Halfway through Act Two, a man behind me began knitting. He finished a scarf. One star."
- "Even Jobber the raccoon left early."
- "Agnes Pickett did not swing her purse once all evening. Let that sink in."
- "Mayor Oakes was seen checking her watch. The watch was seen checking its watch."
- "A riveting feud, if you are a folding chair."
- "SNOOZEBUCKLE ALLEY."
- "Sheriff Bev did not attempt a single arrest. Even the law is bored."
- "I would rather watch Wanda the bear do her taxes. Actually, I would pay for that. Someone book it."
- "The contract signing was so dull that the table broke out of sheer mercy."
- "PROFESSOR'S LECTURE SERIES CONTINUES; BRING A PILLOW."

**Retractions (after a save):**
- "I take it back. ALL OF IT."
- "THE PURSE HEARD 'ROUND THE COUNTY."
- "Last week I called this a snooze. This week I lost my voice and one earring."
- "Fine. FINE. I cried. Are you happy?"

**Raves:**
- "Five stars. I have no notes. I have only screaming."
- "Turnbuckle Alley, you magnificent little town."
- "Somewhere a big-city executive is crying into a smaller, sadder clip."

---

## 10. Real life bleeds in

The canon says real life bleeds into the stories. Mechanically, life-sim systems (romance, injuries, friendships, tension events, career events) emit **life events**. The storyline system listens for them and turns them into pitches and cards. Two laws hold throughout:

1. **Kayfabe holds for marks.** Real life can shape a storyline, but no mark ever learns that it's a storyline. The only way a mark learns the truth is by **joining the business** (10.6).
2. **Real life comes first.** A story can help a real situation, but it can never make one worse.

### 10.1 Romance

When the player is dating an insider, the couple decides how the romance appears, in a booth scene:

| Choice | On screen | In town | Storylines it unlocks |
|---|---|---|---|
| **On screen** | They're a couple in kayfabe too. | Marks swoon. The bakery gives them a two-for-one. Mayor Delphine wants to officiate. | The Secret Admirer (as a prequel), The Wedding, tag teams for couples, "they hurt my sweetheart" revenge angles |
| **Secret** | Nobody knows. | Ordinary friends in public. | None directly, but booth scenes get sweeter. |
| **Kayfabe enemies** | Bitter rivals on screen. | Bitter rivals in public. Their dates happen in insider spaces or after hours in the empty Sportatorium. | Rivalries with a secret layer that only the player and the partner know about |

**No one ever gets caught.** The canon has no slip mechanic, and this system doesn't add one. If a secret couple tries to plan a public date, that option is simply greyed out with a funny note ("Not on Main Street! Agnes has eyes like a hawk."), and an insider-space alternative is offered instead ("Pie in the back booth after close?").

**Romance with a mark.** If CAST.md makes a mark romanceable (Nadia, who believes every feud, is the obvious candidate), the relationship works fully *as a mark*. Nadia worries about your kayfabe injuries, cheers your wins and glares at your rivals. For a mark spouse to become a tag partner, as the canon's wedding promises, they must **join the business**, which leads to one of the most tender scenes in the game: the locker room, the truth, and Nadia going quiet for a long moment before saying, "...So the time he hit you with the chair..." Then she asks, "Can *I* hit someone with a chair?"

**The Wedding** (5.28) is always a joyful, on-screen story when the couple chooses to make it public. Objections are jokes, and no wedding is ever sabotaged.

**If a romance ends** (if the romance system allows that), no storyline ever uses the breakup.

### 10.2 Real disagreements become worked shoots

Life-sim systems create small **tension events** between insiders: the twins arguing over a hammer order, Dex and Hazel disagreeing about how to train, Gideon and Marigold clashing over a robe's neckline. Tension shows up as a booth scene. The player can:

- **Help them talk it out privately.** They'll be grateful, and friendship goes up.
- **Suggest putting it in the ring.** This starts a pitch using **The Worked Shoot** (5.17).

A worked shoot always ends with the required insider beat **"The Air Clears,"** where the two characters make up for real: a handshake, a shared milkshake, a repainted sign. The tension meter has a hard rule: **storyline beats can lower it and can never raise it.**

### 10.3 Real injuries and comebacks

Real injuries are rare, never graphic, and always heal. They come from the match system's small "tweak" chance, from canon (Hazel's knee) or from scripted life events. The player can set **Real injuries: Off / Rare (default)**. Hazel's knee is canon and is always part of her story.

When a real injury happens:

1. **Doc Halloran's verdict** sets how long the wrestler is out (1 to 6 weeks). Doctor's orders are real orders.
2. **A kayfabe cover.** In the booth, the insiders decide how to explain the absence out there: an attack in the parking lot, a "suspension" from Birdie, or a mysterious trip. Marks only ever see the cover story.
3. **The current story adapts.** The injured wrestler moves to a role that doesn't need wrestling: commentary with Gus, manager, corner man, promos, town moments. Their payoff gets postponed, or a partner steps up (an automatic Mystery Partner twist).
4. **The comeback becomes the story.** When Doc clears them, a Comeback pitch (5.8) is waiting, and it's built from the real injury.

### 10.4 Retirements

Retirement is always a real decision a character makes, triggered by their arc (Clint is canon) or late in a long career. It starts a **Retirement Tour** (5.7). After retiring:

- They stay in town and keep running their shop.
- They're inducted into the Hall of Fame at the next Homecoming.
- They make cameos: in someone's corner, at the commentary desk, as a surprise in a Battle Royal.
- At most once a year, they can come back for **one more match**, Sweet Lou style.

Nobody vanishes. Birdie's own last match, at Homecoming, belongs to the main story (section 14).

### 10.5 Private lives stay private

Some facts are private: Big Earl's children's book, Gideon's anxiety, whatever is under the Mothman's mask. In the data these are `privateFacts`, and **no kayfabe beat may use one unless its owner has consented** through their signature storyline. Even then, consent can be partial. Big Earl might read his book at Story Hour but credit it to "Anonymous."

### 10.6 A family member who's a mark: Lacey Ransom

Per CAST.md: two years ago, after a concussion scare (Doc cleared him), Cowboy Clint promised his daughter Lacey that he'd hang up his boots. A month later, a masked villain called **the Dust Devil** blew into ACW and started mocking Cowboy Clint's legacy in every promo. That was Birdie's idea, because nobody suspects the man being insulted. Lacey is 16, wrestles on Coach Patty's high school team, wears the twin of her dad's red bandana on her wrist, and keeps the Dust Devil's face on her dartboard. She's a mark.

The system follows these rules:

1. **She's never a target.** Beats with her are audience beats only. She boos, makes signs (`DUST DEVIL = COWARD`), and defends Cowboy Clint to anyone who'll listen. She's never part of an angle and never humiliated.
2. **Her heartbreak always heals.** If Clint unmasks in front of her, the story has to bring her back (section 16, Example 3). A storyline may make her sad, but it may never leave her sad.
3. **Clint decides when.** Unmasking in front of her is his red line, and it's his alone to cross.
4. **She learns the business only by joining it,** like any mark. In CAST.md she becomes the player's first trainee. The unmasking tells her *who* the Dust Devil was. Joining the business tells her what it all *was*.
5. **Her presence makes his story better.** In the booth, a dart between the Dust Devil's eyes is the proudest thing Clint can imagine.

Town moments featuring her include: telling Pip that Cowboy Clint "would've *flattened* the Dust Devil," asking the player for an autograph and then whispering "Hurt him. For my dad," quizzing Fenwick about the Dust Devil's identity (Fenwick is, of course, completely wrong), and her Tuesday meets, where Clint sits in the top row "as a retired man." On show days, his alibi around town is "a livestock auction."

**Other marks who join the business** go through the same life event, `JoinsTheBusiness`: a reveal scene in the locker room, after which they're an insider and welcome in the booth. **Coach Patty is excluded.** Her running gag of nearly proving it's fake is too good to end.

---

## 11. Emotional storylines

The creator asked for "incredibly emotional" with no death and nothing too evil. This system gets there by making the emotion come from *love expressed under pressure*.

### 11.1 Where the emotion comes from

- **Sacrifice:** giving up a win, a belt or a chance for someone else.
- **Loyalty:** staying when you could leave.
- **Legacy:** passing a mask, a move or a robe to the next person.
- **Homecoming:** leaving, and being welcomed back.
- **Forgiveness:** the villain who comes back, and the friend who lets them.
- **Growing older:** the last ride, the body that still remembers.
- **Belonging and being seen:** the anxious one, the quiet one, the kid with the cardboard belt.
- **The town showing up:** Agnes on her feet, the whole building counting along.

### 11.2 Tools the system uses

| Tool | What it does |
|---|---|
| **The Hold** | A beat flag. The crowd noise fades, the chiptune drops to a single music-box line, and the camera holds on one image. Use it once per storyline, at most. |
| **The long walk** | The scene follows a wrestler up the aisle as the crowd reaches out to them. |
| **The callback** | The archive supplies real history: "Two years ago, in this ring..." |
| **The town shows up** | Signs, standing ovations, the whole building counting along, Mayor Delphine's proclamation. |
| **The gift** | A wrestler hands over a piece of gear, a belt or a mask. |
| **The booth afterward** | The real selves admit it: "I wasn't acting at the end there." |
| **Real life underneath** | The player knows what's real. The marks don't, and the player gets to carry that secret. |
| **Pip and Agnes** | The town's emotional barometers. When Agnes doesn't swing her purse, something important is happening. |
| **The curtain call** | Everyone comes out from the back to applaud one person. |

### 11.3 What the system never does

It never uses death, illness as spectacle, cruelty, humiliation, or Grandma's memory loss as a storyline beat. Sad moments are allowed and encouraged, but every story must end on hope, and every heartbreak must have a door left open.

### 11.4 Examples

1. **Hurricane Season (Hazel).** At the payoff of her comeback, the villain works her knee for the whole heat phase. During the near-falls, Hazel stands up on that knee, and the Hold kicks in: the crowd goes silent, and there's a single music-box note. She doesn't win with the old Hurricane dive. She wins with **Still Water**, the new finisher she built with the player. Afterward in the booth, she says, "It held."
2. **Sundown (Clint).** In his last match, Clint pulls off the Dust Devil's mask himself and hits the Bulldogger one more time, with his girl in the building. Lacey walks out. Three Saturdays later she walks back in, sits down, and throws his red bandana into the ring. (Section 16, Example 3.)
3. **Tres Generaciones (Rosa).** On her own terms, Rosa puts her mask on the line against a challenger who mocked the lineage. Abuela Celia is watching from the front row, and her mother Elena has flown in without telling anyone. She wins. Instead of taking the challenger's mask, she gives the challenger her blessing to train with her. "A mask isn't a trophy. It's a promise."
4. **Bright Lights, Small Town (Dex).** He comes home from the city and makes his return on a Wednesday at the VFW, not at a supershow. "This is where I started." Fifty folding chairs, and bingo waits for him.
5. **Once Upon a Mountain (Big Earl).** After losing the Story Hour stakes, the Mountain reads a picture book "by Anonymous" to the kids at the library. Pip asks who wrote it. Earl closes the book. "Somebody who used to be scared of the dark too."
6. **Inventory Day (the Bruiser Twins).** After their worked shoot, they repaint the Steel Chair Hardware sign together, with both their names the same size for the first time.
7. **One More Cast (Sweet Lou).** At his once-a-year match, Lou puts the player over clean in the middle of the ring. In the booth he says, "I wanted to see what you'd do with it. You did fine. Don't tell anybody I said fine."
8. **The Real Belt (Pip).** The player has Hank build a kid-sized belt. At a Saturday show, the player calls Pip into the ring "for the biggest fan in the county" and swaps out his cardboard belt. Pip cries. Agnes cries. Sheriff Bev claims there's something in her eye and starts writing herself a ticket for it.
9. **Gorgeous Under Pressure (Gideon).** His entrance music plays, and he can't go out. The player sits with him on the locker room bench, the only place he can say it out loud. Then he goes out, and the crowd boos him so lovingly and so loudly that, back in the booth, he can't stop smiling. "They booed me *so loud*."
10. **Eighty-One Candles (Agnes).** On Agnes's birthday, Tiny brings out a tower of 81 tiny cakes during the show. Every villain on the roster comes out, sheepish, and lines up to let her swing at them once. She hugs Gideon instead. Clementine runs the photo on the front page.

---

## 12. The variation math

The creator wants hundreds of storylines with variations. This section shows the number is real.

### 12.1 The ingredients

| Ingredient | Count | Notes |
|---|---|---|
| Story shapes | 31 | Section 5 |
| Hooks / twists / stakes / payoffs | 20 / 19 / 15 / 24 | Section 4. A twist slot can also be left empty. |
| Segments / wildcards | 17 / 14 | Fill the middle and change stories already running |
| Lengths | 4 | Short, Standard, Epic, Saga |
| Wrestlers who can headline | 13 | The player, Rosa, Earl, Dex, Gideon, Bo, Buck, Hazel, Clint (the Dust Devil), the Mothman, Tiny, Pinfall, and Sweet Lou (limited). More come later through trainees, returns and the rival promotion. |
| Personality spins | About 3 per character | Each pitch picks up 0 to 2 reshapes |
| Outcomes per shape | About 3 | For example: the hero wins clean, the villain steals it, a twist ending |
| Crowd paths | 6 | An organic turn or not, times extended, normal or ended early |
| Town moment templates | 13 marks, 4 to 8 templates each | Parameterized by story tags and sentiment |

### 12.2 Counting it

There are four ways to count, from the most generous to the stingiest:

| Estimate | Method | Result |
|---|---|---|
| **Combinatorial ceiling** | Every legal card combination × 3 lengths × about 60 valid hero/villain pairs × 18 outcome and crowd paths | Billions. Mathematically true and meaningless. |
| **"Sounds different when you tell a friend"** | Shape (31) × hero/villain pair (about 60 valid after personality and alignment filters) × major twist (about 4 good fits including none) × outcome (3) | **About 22,000** |
| **Very conservative** | Shape (31) × who the hero is (13) × outcome (3), ignoring the villain, the cards and the crowd entirely | **About 1,200** |
| **The floor** | Shape (31) × outcome (3) × whether the crowd turned someone (2), with the cast never changing at all | **186** |

So with the same two wrestlers every time, the structure alone produces close to two hundred distinct stories. Casting the 13 headliners, adding personality spins and adding organic turns comfortably puts the honest count in the thousands. Players will feel hundreds.

**How many a player actually sees.** A typical player is in 1 to 3 storylines at a time, each about 4 to 5 weeks long, and watches 3 to 6 more from the crowd. Every ten in-game weeks, that's roughly 4 to 6 stories they're part of and 8 to 12 around them, most of them noticeably different.

### 12.3 One pitch, three stories

The pitch is **The Underdog Title Chase**: Dex (hero) against Gideon (champion), with the Open Challenge hook, a Ref Bump twist, the title on the line and a Ladder Match payoff, over 6 weeks.

- **Run one: the classic.** The matches land at 3.5 stars or better. Dex climbs the ladder at Fairgrounds Fury, the town counts along, and the Tattler raves.
- **Run two: the crowd turns Gideon.** His Mirror Speech brings the house down, and his shirts outsell Dex's. Turn pressure fires, and the player leans in. Gideon's Heart-to-Heart: he's terrified of heights and took the ladder match anyway. The ladder match becomes a respect match, Gideon keeps the title, and he shakes Dex's hand. A new story is born: Gideon as the hero champion.
- **Run three: a flop and a save.** Gideon's nervous promos sink Act II, and buzz drops to 26. At the huddle, the player plays **The Mothman Descends**. The payoff becomes a ladder match lit by glow sticks, the Tattler retracts its snooze, and Fenwick is unbearable for a month.

Same napkin, three stories a player would tell differently.

### 12.4 Signature storylines

Procedural stories give variety. **Signature storylines** give depth. These are hand-written stories for each insider, with bespoke dialogue, unique beats, 2 or 3 hand-written endings, and slots that are partly locked.

| Character | Signature storyline | Trigger | In one line |
|---|---|---|---|
| Birdie | **Sugar's Rules** | Early game | A run of small stories in which Birdie teaches the player her carny rules, one at a time. |
| Birdie and Dottie | **The Last Rematch** | Main story | The Homecoming finale (section 14). |
| Rosa | **Tres Generaciones** | 7 hearts | Rosa puts her mask on the line on her own terms, with Abuela Celia and her mother Elena watching. Pairs with CAST.md's "La Última Reverencia." |
| Rosa | **Alas Nuevas** | 9 hearts | Rosa teaches a protégé to fly. A Mentor shape. |
| Big Earl | **Once Upon a Mountain** | 7 hearts and the book life event | The monster, the library and the book nobody knows he wrote. |
| Big Earl | **Shh** | 5 hearts | The quietest feud in history, ending in a match where only whispering is allowed. |
| Dex | **Bright Lights, Small Town** | The MaxxMedia letter (canon) | He leaves for the city and comes home. |
| Gideon | **Gorgeous Under Pressure** | 7 hearts | Stage fright, a locker room bench and the loudest boos of his life. |
| Gideon | **The Mirror Match** | 5 hearts | Gideon against a perfect imitator. An Ornery Twin variant. |
| Bo and Buck | **Inventory Day** | A real tension event | A worked shoot about a hammer order that's really about who gets to run the store. |
| Bo and Buck | **Three Knocks** | After Inventory Day | The reunion, named for the thin wall between their apartments: two knocks meant *you awake?* and three meant *me too*. |
| Hazel | **Hurricane Season** | Doc clears her (canon) | The comeback, start to finish, ending with Still Water. |
| Clint | **Sundown** | 8 hearts (he asks you to be his last opponent) | The Dust Devil's last ride, an unmasking, and the girl in the front row. Built on CAST.md's "The Unmasking." |
| The Mothman | **Who Watches the Night** | Night shows, plus Fenwick has floated 5 theories | The Mothman chooses a side. The identity is never revealed. |
| Tiny | **Small Cakes, Big Heart** | 7 hearts | Grandma's recipe card and the Great Bake-Off Brawl. Repeats every Fairgrounds Fury with variations. |
| Pinfall | **The Proof** | 7 hearts | A purist's great mat classic, two out of three falls, against the player. |
| Sweet Lou | **One More Cast** | 7 hearts, then once a year | Lou's once-a-year match. |
| June | **Back to Ringside** | 7 hearts | June comes out of retirement to manage the player for one season. |
| Referee Mo | **Return to Sender** | 5 hearts | A week as a crooked ref that ends with the most honest count in history. |
| Gus | **Off the Air** | 5 hearts | A villain takes over the announce booth at the shows (never WRSL), and Gus has to win his microphone back, with Jobber's help. |
| Hank | **The Cage That Hank Built** | The cage is built | The cage's debut, with all of Hank's worries about the test run. |
| Marigold | **The Robe** | 5 hearts | A robe for the player, a Ruined Robe hook, and a reveal at Homecoming. |
| Doc | **Doctor's Orders** | 5 hearts | The ringside-doctor bit gets its own feud with a villain who keeps faking injuries. |
| The player | **The Duchess's Grandkid** | The main story's midpoint | The town learns whose grandkid you are. A Hometown Hero signature. |

**How signature storylines fit alongside procedural ones:**

- **Same data, same engine.** A signature storyline is a `StoryShape` with `signatureOf`, `lockedSlots`, `scriptedBeats` and hand-written `endings`. The personality, crowd, flop and scheduling systems all apply to it.
- **A gold napkin.** It shows up as a Signature pitch from its character. The mode choices still appear. Locked slots are inked in pen and can't be changed. Open slots are in pencil and get filled according to the mode.
- **A safety net.** Signature stories have a buzz floor of 25, so they can't fizzle unless the player chooses to wrap them up.
- **Priority.** When their triggers fire, they jump the pitch queue and get first claim on supershow payoffs.
- **Repeats.** Most happen once per save. Some come back every year with variations (One More Cast, Small Cakes, Big Heart).
- **Cross-pollination.** Finishing a signature story changes that character's procedural pitches from then on, with new loves, new cards and sometimes a new alignment. After Tres Generaciones, Rosa starts pitching Mentor stories and The Family Name.
- **Pacing.** Over the first two in-game years, aim for signature stories to make up about 15% of the stories a player is part of, spaced so no two land in the same month unless the main story needs it.

---

## 13. Booking Mode (the Pencil)

Booking Mode is the late-game layer. The player graduates from pitching stories to running the whole show. It begins in a limited form at **Assistant booker** (Wednesdays) and opens fully with **the Pencil**.

### 13.1 The Booking Board

The Booking Board is Birdie's corkboard, and now it's yours. It has three areas:

- **The Card:** index cards for the next show, one per match or segment, in running order.
- **The Story Wall:** a napkin for every active storyline, with yarn connecting stories that share characters.
- **The Roster Strip:** headshots with alignment, morale, fatigue and current title.

On phones the board is three swipeable panels. On desktop and iPad it's one wall, and you can drag cards around.

### 13.2 Building the Wednesday and Saturday cards

| Show | Size | Venue rules | Special |
|---|---|---|---|
| **Wednesday** (VFW Hall, about 50 folding chairs) | 4 matches and 1 or 2 segments | No ladders (nine-foot ceiling), no cage, no pyro. Wrestlers can brawl into the crowd because everyone's close. | The last segment can spill into bingo (Bingo Brawl). Rowdy, intimate, forgiving: crowd fatigue is halved. |
| **Saturday** (the Sportatorium) | 6 or 7 matches and 2 or 3 segments | Everything is allowed: lights, pyro, confetti and the big screen. | The main event's crowd meter counts for 1.5×. |
| **Supershow** (Thaw Brawl, Fairgrounds Fury, Harvest Havoc, Homecoming) | 8 matches and 3 segments | The season's venue rules apply (the fairgrounds are outdoors, so Rain Delay is possible). | Payoffs are worth +10 buzz. Homecoming includes the Hall of Fame. |

Every match card on the board has these fields:

- **Participants**, with their alignments
- **Story link:** which storyline beat this match is, if any
- **Booked finish:** who wins, how, and how locked that is (15.5)
- **Time:** short, medium or long
- **Match type:** the stipulation
- **Position** in the running order

**Birdie's Curve.** A show is scored by its star ratings, weighted by position, plus a bonus for its shape: *"Open hot, take a breath, build, then blow the roof off."*

```
showRating = weighted average of match stars (opener ×1.0, middle ×1.0, semi-main ×1.2, main event ×1.5)
           + curve bonus (up to +0.5) if the opener scores at least 3 stars, a quieter match or segment
             comes before the semi-main, and the main event is the best match of the night
           − repetition (−0.2 for each repeated match type or repeated finish method)
```

### 13.3 Running several storylines at once

- **Capacity.** A good rule of thumb is one active storyline for every 3 roster members. A Wednesday show holds up to 3 story beats, a Saturday up to 5, and a supershow up to 6 payoffs plus 2 other beats.
- **Collisions are opportunities.** When two stories share a character, the board offers **crossover cards**. Enemy of My Enemy, for example, can merge two feuds into a tag match, and a Double Agent can link two stories.
- **Background stories.** Wrestlers without a pitched story automatically get simple procedural feuds, the way Birdie used to fill the card, so nobody sits idle and the shows always feel alive. The player can take one over at any time.
- **The Wire.** A weekly note on the board summarizes every story's buzz, its next beat and anything that needs attention: "The twins have been in two stories this month. Buck says he's 'fine,' and he's not."

### 13.4 Balancing heroes and villains

The **balance meter** shows the roster's split by alignment. The ideal is about 45% heroes, 45% villains and 10% tweeners.

- **Too many heroes:** "Nobody to boo." The crowd gets restless, Clementine writes "a church picnic," and Agnes's purse goes unswung.
- **Too many villains:** "Agnes is running out of purse." Crowd morale dips, and kids' chalk drawings turn into question marks.
- **Pairings:** hero against villain is the default. Hero against hero is a **respect match**, with less heat, more stars and a good fit for supershows. Villain against villain is a **"who do we cheer?" match**, which is a perfect way to let the crowd choose (8.3).

Organic turns are how the roster balances itself naturally. The board points them out instead of fighting them.

### 13.5 Title belts and their lineage

**Starting titles:** the ACW Heavyweight Championship, the ACW Tag Team Championship and the Wednesday Night Championship (defended only at the VFW). **Novelty titles** unlock through play: the **Steel Chair Championship** (sponsored by Steel Chair Hardware, and only defended when a folding chair is in the ring), the **Pie Championship** (Tiny's idea) and any belt the player designs.

**Designing belts.** The player sketches a design, Hank builds the belt, and Marigold adds the strap stitching, as in the canon. A belt's look is saved to its lineage.

**The lineage book.** Each title keeps a record of every champion, reign length, defense, notable match and how the title changed hands. It's shown in the Sportatorium hallway on a wall of photos.

**Prestige** runs from 0 to 100:

| Change | Effect |
|---|---|
| A defense rated 3.5 stars or better | +3 |
| A long reign (weeks 6 to 20) | +1 a week |
| A stale reign (past 20 weeks without a 4-star defense) | −1 a week |
| Hot potato (the title changes hands less than 3 weeks after the last change) | −8 |
| Won at a supershow | +6 |
| Vacated because of a real injury | 0, plus a pitch for a vacant-title tournament (5.23) |

**The Velvet Hammers' broken tag belt** is never defended. After Homecoming its two halves are rejoined, and it hangs in a case at the end of the hallway (section 14).

### 13.6 Roster morale

Every wrestler has **morale** from 0 to 100, updated weekly. It depends on:

- Screen time compared with their *spotlight appetite* (Gideon's is huge, Big Earl's is small).
- Wins and losses compared with their *ego*. Losses that are part of a story barely count. Losing with no story attached stings.
- Whether their stories match their loves, and how many "Love it" reactions they gave.
- Rest and fatigue (at most 3 matches a week, enforced by Doc's warnings).
- **Red lines respected.** The engine never crosses a red line, but repeatedly pitching right up against one lowers morale a little.

**Low morale** has gentle effects: less effort in matches (their called spots are less clear), a booth scene ("Can we talk?"), and a pull from elsewhere. Early in the game that's MaxxMedia letters. Late in the game it's offers from the rival promotion. **Nobody leaves forever** unless a canon arc says so, and even then they come home (Dex). At worst, a wrestler with low morale takes a "road trip" for a couple of weeks and comes back refreshed, which is also a Return hook.

**Owner tools** (rung 7): a budget covering gate, merch and concessions; building upgrades (a bigger screen, more pyro, new seats); hiring crew; and creating titles.

### 13.7 Delegating to protégés, and new towns

As **Founder** (rung 8), the player starts wrestling towns elsewhere. Trainees from the backyard training yard grow into wrestlers, and some grow into bookers.

- **Protégé booker personalities:** *Showman* (spectacle and pyro), *Purist* (mat classics), *Comedian* (whimsy), *Dramatist* (sagas and tears), *Wild Card* (swerves).
- **The delegation dial,** set per town: *Hands-on* (you approve every story), *Check-in* (you approve main events and title changes) or *Trust* (you read the weekly digest).
- **You're Birdie now.** Protégés send pitches up to you. You give Birdie's verdicts (Approve, Tweak, Veto, Not yet) in your own voice. The three involvement modes work in reverse: "You drive" lets the protégé book it, "Let's build it together" co-writes, and "I've got an idea" overrides. Protégés start quoting the player's verdicts back to their own rosters, which is a quiet, lovely echo of Birdie.
- **Talent trades:** wrestlers can move between towns for a set number of weeks or permanently. **Loser Leaves Town** becomes a real transfer to another of your towns.

### 13.8 Storylines that cross between towns

- **Invasions:** the Outsider Invasion shape (5.14), with the invaders coming from another of your towns. The storyline's beats alternate between the two towns' calendars.
- **Cross-town storylines** are a single storyline object that spans several calendars (15.4). The player can attend only one show per show night. Beats elsewhere play out without them, using the same simulation as any beat the player misses, and arrive as a digest along with that town's paper.
- **Interpromotional supershows:** once a year, all your towns meet at Fairgrounds Fury for a crossover card. Travel happens by bus, a callback to the prologue.

### 13.9 The rival promotion (never evil)

Late in the game, **MAXX Megatour**, MaxxMedia's touring show (working name), starts running monthly shows in the next county. The people who run it are not villains. They love wrestling too. They just think in 9-second clips. Their lead is **Royce Penn**, the player's old boss at MaxxMedia, who genuinely believes he's helping (CAST.md).

- **What they compete for:** attendance, the Tattler's attention, and the morale of your wrestlers, through bigger paychecks and city glamour. They never sabotage anyone. No dirty tricks happen in real life.
- **How it plays in kayfabe:** a big interpromotional feud using the Outsider Invasion shape at scale, with ST-15 **The Building** available as legendary stakes.
- **Real life:** after the shows, wrestlers from both promotions sit together in the Hot Tag back booth. They're all insiders, the way it was in the old territories. Some of the best booth scenes in the game happen here.
- **How it resolves:** a co-promoted supershow. Depending on the player's choices and the results, MAXX Megatour either goes back to the city with a new respect for long stories, becomes a friendly rival with a yearly crossover, or forms a permanent alliance with talent exchanges. Birdie shakes Royce's hand: "You'll do. Come back when you've learned to wait for it."

---

## 14. Tie-in to the main story

The Velvet Hammers arc uses the same storyline system the player has been using all game. The game's emotional climax is also its best storyline.

### 14.1 The oldest stories, on tape

Legendary tapes in VHS bins hold the Velvet Hammers' storylines from the territory era. Catching their moments gives **Hammers-edition cards**: alternate printings of standard cards, with Dottie and Birdie on the art. They aren't counted in the 109.

| Hammers card | Edition of | The story on the tape |
|---|---|---|
| **Velvet Gloves** (1976) | HK-02 The Open Challenge | The Hammers' first open challenge, answered by a team that thought two women would be easy pickings. |
| **Sugar and Spite** (1978) | HK-03 The Left-Hanging Handshake | Before they were a team, Dottie refused Birdie's handshake on their first night as rivals. |
| **The Fairgrounds Riot of '79** | WC-07 Rain Delay | A thunderstorm, a collapsed tarp, and the best match either of them ever had in the mud. |
| **The Duchess Crowns Herself** (1980) | ST-01 The Title | Dottie wins the territory's singles title and hands it to Birdie to hold during the celebration. |
| **Original Recipe** (1981) | WC-06 Birdie's Old Trick | The first time Birdie's famous switcheroo ever worked. |
| **The Hot Tag Heard 'Round the County** (1982) | PO-02 Tag Team Match | The tag the diner was later named after. *(Coordinate with the main story and CAST.md: a lovely origin if they want it.)* |
| **The Planned Breakup** (1983) | TW-01 The Turn | The booking sheet as written: Birdie was supposed to turn on Dottie. |
| **The Audible** (1983) | TW-19 The Audible | The legendary tape of the Night of the Broken Belt. Unlocked only after the truth is out. |

Each Hammers card has **two uses**:

1. **A memory key.** Bringing that tape to Grandma Dottie at the retirement home opens a memory scene and a clue about 1983. This is the main story's mechanism, and the card is how it's tracked.
2. **A playable homage.** It can go on any napkin where the base card would fit. When Agnes, Sweet Lou or Birdie is in attendance, it earns an "old-timers remember" bonus (+5 buzz, and a unique Agnes line).

**How Birdie reacts to Hammers cards depends on the main story's progress.** (These are suggestions to coordinate with the main story doc.) Early on, she quietly vetoes any pitch that uses one: "Not that one, sugar." She gives no reason, and that's the point. After the truth comes out, she approves them with wet eyes: "Go on. She'd want it used."

### 14.2 Rebuilding the 1983 napkin

Every save starts with one storyline already in the archive: **"The Night of the Broken Belt" (1983)**. It's a complete `Storyline` record with both its planned slots and what actually happened. At first the player sees it as a **blank, yellowed napkin** in the Napkin Box.

As the main story unfolds (Sweet Lou's tapes, Grandma's memories, the locker Birdie has kept shut), the napkin **fills in, slot by slot**, in two kinds of handwriting:

| Slot | Planned (in Birdie's handwriting) | What happened (revealed in Dottie's handwriting) |
|---|---|---|
| Hook | The national company calls | The same |
| Hero / Villain | Dottie, the hero; Birdie, the villain | **The roles reversed** |
| Twist | The Planned Breakup: Birdie turns on Dottie | **The Audible:** Dottie turns on Birdie, so Birdie would go |
| Stakes | The tag titles | **The belt, broken in half** |
| Payoff | A rematch in 6 weeks | **The rematch never happened** |
| Length | 6 weeks | **40 years** |

The last slot to fill is the twist. When it does, the player understands the whole thing at the same moment Birdie does. This turns the main story's mystery into the storyline UI the player already knows by heart.

### 14.3 The final match: The Last Rematch

The Homecoming finale is a locked signature storyline run on the same engine, and it plays as a winter-long Saga.

- **Who books it:** the player. If they already hold the Pencil, it's in their hand. If they don't, Birdie lends it to them for one night: "I can't book my own last match, sugar. I'd go easy on me."
- **The locked slots,** inked in pen:
  - **Hook:** the rematch that never happened.
  - **Heroes:** both teams. This is a respect match, and nobody is the villain tonight.
  - **Twist:** none. "No swerves tonight. We've had enough swerves for one lifetime."
  - **Stakes:** the belt made whole.
  - **Payoff:** a tag team match.
  - **Finish:** **the Velvet Hammers win.** Birdie pins the player after **the Encore**, the double-team finisher they were saving for the 1983 rematch.
- **The open slot,** in pencil: **your partner.** It's your spouse if you're married (and therefore your tag partner, as the canon says), or any insider you choose. The partner's chemistry with you shapes the match.
- **The Saga's beats** run across winter. Town moments: the town hears the Hammers are back. Agnes digs out her 1983 sign. Pip asks who they are, and Sweet Lou tells him the kayfabe version, which is wonderful. Coach Patty buys a ticket "for research." A WRSL special airs. A contract signing happens in which the table, for once, doesn't break, because Hank is crying too hard to rig it.
- **The match script** (15.5) is `finishLock: 'eternal'`. The AI steers toward the booked finish as always, but nothing can change it. The **Audible** card is greyed out in the player's deck with one line: *"Some finishes are worth keeping."*
  - **Feeling out:** 1983 callbacks. Dottie opens with the Curtsy, and Agnes gasps out loud. Each Hammers card the player has collected adds a spot the crowd recognizes.
  - **Shine:** the Hammers. The building shakes.
  - **Heat:** the player's team cuts Dottie off from her corner, the classic hero in peril. The Hold kicks in and the music drops to a music box. Then Dottie reverses the hold with a move from the 1979 tape, exactly as she did it then. *The body remembers the match.*
  - **Comeback:** Birdie's hot tag.
  - **Near-falls:** the player's finisher, and Dottie kicks out at 2.9.
  - **Finish:** the Encore. Birdie makes the cover. **The whole town counts along**, one... two... three.
- **The star rating** shows five stars and then, in Birdie's pencil, one more.
- **Afterward:** the two halves of the belt come back together in the ring. The last beat is an **insider moment**: Dottie and Birdie in the Hot Tag back booth, side by side for the first time in forty years. June slides them one milkshake and two straws.

The player always loses. The system's job is to make losing the proudest moment of the game.

### 14.4 After the credits

- **WC-13 Grandma Stands Up** joins the Tin. Every Saturday Dottie sits in the front row next to Agnes, and whenever the player's entrance music hits, she stands up and the room stands with her. The card can be played at any huddle for a big buzz boost, though most players will just let it happen.
- The Hammers-edition cards play at full strength with no veto from Birdie.
- **The mended belt** hangs in a case at the end of the Sportatorium hallway.
- **The Velvet Hammers Invitational,** a tag team tournament every Homecoming (5.23), with the winners photographed next to the case.
- The game continues forever, and so do the stories.

---

## 15. Implementation spec

This section is for engineers. All storyline *content* (cards, shapes, traits, personalities, town moments, lines) is **data**, loaded from JSON or TypeScript modules and validated at build time. The engine is a small set of pure-ish functions driven by a seeded RNG, so reloading a save never rerolls a result.

### 15.1 Core types

```ts
// ---------- ids ----------
type CharacterId = string;   // 'rosa', 'big_earl', 'player', ...
type CardId = string;        // 'HK-01'
type ShapeId = string;       // 'betrayal'
type StorylineId = string;
type BeatId = string;
type BeatTemplateId = string; // 'betrayal.partners_win'
type TownId = string;        // 'turnbuckle_alley', plus towns founded later
type TitleId = string;
type ShowId = string;        // 'tba-2027-03-17-wed'
type DayIndex = number;      // absolute in-game day since the save started
type TraitId = string;
type SpinId = string;
type ChantId = string;

// ---------- enums ----------
type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
type CardSource = 'starter' | 'tape' | 'insider_story' | 'life_event' | 'dungeon'
                | 'fan_mail' | 'town' | 'main_story';
type SlotType = 'hook' | 'twist' | 'stakes' | 'payoff' | 'segment' | 'wildcard';
type Alignment = 'hero' | 'villain' | 'tweener';
type InvolvementMode = 'you_drive' | 'build_together' | 'my_idea' | 'birdie_handles';
type Weekday = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
type TimeOfDay = 'morning' | 'midday' | 'evening' | 'night';
type ShowKind = 'wednesday' | 'saturday' | 'supershow';
type SupershowId = 'thaw_brawl' | 'fairgrounds_fury' | 'harvest_havoc' | 'homecoming';
type Register = 'kayfabe' | 'insider';
type Skill = 'strength' | 'ring_iq' | 'charisma' | 'craft' | 'storytelling';
type CareerRung = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;  // opener ... founder
type FlopCause = 'weak_matches' | 'no_heat' | 'personality_mismatch' | 'fatigue'
               | 'stakes_dont_matter' | 'too_long';

type LocationId =
  | 'vfw_hall' | 'sportatorium' | 'fairgrounds' | 'steel_chair_hardware'
  | 'hot_tag_booth' | 'locker_room' | 'birdie_office'
  | 'main_street' | 'bakery' | 'library' | 'taqueria' | 'salon' | 'gas_station'
  | 'wrsl' | 'water_tower' | 'chokeslam_creek' | 'retirement_home' | 'flea_market';

const INSIDER_SPACES: ReadonlySet<LocationId> =
  new Set(['hot_tag_booth', 'locker_room', 'birdie_office']);

type CardTag =
  | 'comedy' | 'drama' | 'heartfelt' | 'whimsy' | 'spectacle' | 'mat_classic'
  | 'betrayal' | 'romance' | 'family' | 'legacy' | 'hometown' | 'big_city' | 'leaving'
  | 'mask' | 'hair' | 'title' | 'tag' | 'faction' | 'outsider' | 'mystery'
  | 'night' | 'supernatural' | 'violence_low' | 'violence_mid' | 'hardcore'
  | 'high_risk' | 'cage' | 'humiliation_light' | 'mess' | 'food' | 'animal'
  | 'kids_spotlight' | 'public' | 'real_life' | 'live_mic' | 'rehearsed' | 'improv'
  | 'swerve' | 'prank' | 'rules' | 'crime_kayfabe' | 'injury_worked' | 'career_ending'
  | 'old_school' | 'spotlight' | 'entrance' | 'gear' | 'supershow'
  | 'clean_finish' | 'schmozz' | 'slow_build' | 'menace' | 'solemn';

// Content carrying any of these fails validation and never loads (3.6).
type ForbiddenTag = 'death' | 'gore' | 'menace_kids' | 'harm_mark' | 'mock_body'
                  | 'mock_identity' | 'animal_harm' | 'memory_loss' | 'real_secret_exposed';

// ---------- conditions (a small predicate DSL, evaluated against world + storyline) ----------
type Condition =
  | { all: Condition[] } | { any: Condition[] } | { not: Condition }
  | { tag: CardTag } | { flag: string }
  | { hearts: { who: CharacterId; min: number } }
  | { sentiment: { role: RoleKey; op: '<' | '>'; value: number } }
  | { status: Storyline['runtime']['status'] }
  | { rung: { min: CareerRung } } | { showKind: ShowKind } | { night: true };

type Requirement =
  | { kind: 'masked_wrestler'; count?: number; consentFrom: 'wearer' }
  | { kind: 'tag_team' | 'allies' | 'twins' | 'manager' | 'romance'
          | 'title' | 'retiring' | 'returning' | 'outsider' }
  | { kind: 'night_show' }
  | { kind: 'venue'; anyOf: LocationId[] }
  | { kind: 'not_venue'; noneOf: LocationId[] }
  | { kind: 'show'; anyOf: ShowKind[]; supershow?: SupershowId[] }
  | { kind: 'character'; id: CharacterId; minHearts?: number; consent?: boolean }
  | { kind: 'prop'; id: 'steel_cage' | 'breakaway_table' | 'ladder' | 'glow_ropes'; testRun: boolean }
  | { kind: 'rung'; min: CareerRung }
  | { kind: 'flag'; flag: string }
  | { kind: 'roster_size'; min: number }
  | { kind: 'participants'; min: number; max?: number }
  | { kind: 'skill'; skill: Skill; min: number }
  | { kind: 'archive'; needs: 'any_storyline' | 'prior_match_between_roles' };
```

### 15.2 StoryCard and StoryShape

```ts
interface StoryCard {
  id: CardId;
  name: string;
  slot: SlotType;
  blurb: string;
  rarity: Rarity;
  sources: CardSource[];
  tags: CardTag[];
  requirements: Requirement[];
  beatTemplates: BeatTemplateId[];   // beats this card injects (hook beat, twist beat, ...)
  stipulation?: StipulationRules;    // payoff cards only (15.6)
  stakesOutcome?: StakesOutcome;     // stakes cards only
  rescuePower?: number;              // twists and wildcards; defaults by rarity: 15/20/25/35
  fixesProblem?: FlopCause[];        // +10 rescue power when the story's flop cause matches
  hammersEdition?: { baseCard: CardId; year: number; memoryKey: string };  // section 14
  flavor: { headlines: string[]; chants: string[]; birdieLines?: string[] };
}

type StakesOutcome =
  | { kind: 'title_change' }
  | { kind: 'leave_map'; weeks: [number, number]; transferIfFounder: boolean }
  | { kind: 'unmask' | 'haircut' }               // always consent-gated
  | { kind: 'retire' }
  | { kind: 'costume'; costumeId: string; days: number }
  | { kind: 'town_treat'; item: 'pie' }
  | { kind: 'custody'; objectId: string }
  | { kind: 'card_position'; target: 'next_supershow_main' }
  | { kind: 'speech'; speech: 'apology' | 'story_hour' }
  | { kind: 'family_name'; legacyId: string }
  | { kind: 'pride' }
  | { kind: 'promotion_leaves_county' };

interface OwnedCard {               // a card in the Recipe Tin
  cardId: CardId;
  stars: 0 | 1 | 2 | 3;            // duplicate catches
  source: CardSource;
  acquiredOn: DayIndex;
  lastPlayedOn?: DayIndex;
  timesPlayed: number;
}

type RoleKey = 'hero' | 'villain' | 'betrayer' | 'betrayed' | 'mentor' | 'student'
             | 'masked' | 'manager' | 'mystery' | 'red_herring' | 'ally' | 'retiree'
             | 'successor' | 'rival_a' | 'rival_b' | 'invader' | 'defender' | string;

interface RoleDef {
  role: RoleKey;
  alignment: Alignment | 'any';
  required: boolean;
  constraints?: Requirement[];      // e.g. masked role requires a willing masked performer
}

type BeatKind = 'match' | 'ring_segment' | 'backstage_segment' | 'run_in'
              | 'contract_signing' | 'wrsl_promo' | 'tattler' | 'town_moment'
              | 'public_angle' | 'insider_moment';

interface BeatSlot {
  templateId: BeatTemplateId;
  kind: BeatKind;
  required: boolean;
  fromSlot?: SlotType;              // this beat is generated by the napkin card in that slot
  roles: RoleKey[];
  preferredDay?: 'show' | 'non_show' | Weekday;
  preferredShow?: ShowKind;
  timeOfDay?: TimeOfDay;
  hold?: boolean;                   // the emotional Hold (11.2); at most one per storyline
}

interface ActTemplate {
  act: 1 | 2 | 3;
  share: number;                    // about 0.25 / 0.5 / 0.25 of length
  beats: BeatSlot[];
}

interface VariationPoint {
  id: string;                       // 'why_they_turned'
  label: string;
  chosenBy: 'pitcher' | 'player' | 'crowd' | 'random';
  options: { id: string; weight: number; effects: CardEffect[] }[];
}

interface EndingDef {
  id: string;                        // 'hero_wins_clean'
  label: string;
  when: Condition;                   // evaluated at the payoff
  finish: BookedFinish;
  epilogueBeats: BeatTemplateId[];
  seeds?: { hookCard: CardId; forRole: RoleKey; afterWeeks: number }[];
}

interface StoryShape {
  id: ShapeId;
  name: string;
  register: string;                  // 'heartbreak, then catharsis'
  tags: CardTag[];
  roles: RoleDef[];
  acts: [ActTemplate, ActTemplate, ActTemplate];
  length: { min: number; default: number; max: number };  // weeks
  compatible: Partial<Record<SlotType, CardId[]>>;        // best fits (+buzz)
  twistPlacement: 'end_act2' | 'midpoint' | 'finish';
  variationPoints: VariationPoint[];
  endings: EndingDef[];
  cooldownWeeks: number;             // default 8
  // signature storylines only:
  signatureOf?: CharacterId;
  trigger?: Condition;
  lockedSlots?: Partial<NapkinSlots>;
  scriptedBeats?: Record<BeatTemplateId, string>;          // dialogue script refs
  buzzFloor?: number;                                       // 25 for signatures
  repeat?: 'once' | 'yearly';
}

type CardEffect =
  | { op: 'add_beat'; template: BeatTemplateId; act: 1 | 2 | 3 }
  | { op: 'remove_beat'; template: BeatTemplateId }
  | { op: 'set_length'; weeks: number }
  | { op: 'swap_card'; slot: SlotType; to: CardId }
  | { op: 'swap_role'; role: RoleKey; to: CharacterId }
  | { op: 'move_payoff'; to: 'next_supershow' | 'saturday' }
  | { op: 'buzz'; amount: number }
  | { op: 'sentiment'; role: RoleKey; amount: number };
```

### 15.3 Beat and Storyline (with runtime state)

```ts
interface Beat {
  id: BeatId;
  storylineId: StorylineId;
  act: 1 | 2 | 3;
  order: number;
  templateId: BeatTemplateId;
  kind: BeatKind;
  register: Register;          // derived: 'insider' only if location is in INSIDER_SPACES
  location: LocationId;
  townId: TownId;
  scheduled: {
    day: DayIndex; timeOfDay: TimeOfDay; showId?: ShowId; cardPosition?: number;
  } | null;
  participants: Partial<Record<RoleKey, CharacterId>>;
  playerInvolved: boolean;
  required: boolean;
  hold?: boolean;
  match?: MatchBooking;        // when kind === 'match'
  townMomentId?: string;       // when kind === 'town_moment' or 'public_angle'
  status: 'pending' | 'scheduled' | 'held_for_player' | 'resolved' | 'skipped';
  result?: CrowdReaction;
}

interface NapkinSlots {
  hook: CardId;
  twists: CardId[];            // 0 to 2
  stakes: CardId;
  payoff: CardId;
  segments: CardId[];          // 0 to 4
  wildcardsHeld: CardId[];
}

interface AppliedSpin { characterId: CharacterId; spinId: SpinId; replaced: CardId; with: CardId; }

interface Storyline {
  id: StorylineId;
  title: string;               // Gus names it: "The Cruller Conflict"
  shapeId: ShapeId;
  pitchId: string | null;      // null for background stories and the seeded 1983 record
  scope: 'for_you' | 'consult' | 'board' | 'background';
  townIds: TownId[];           // more than one for cross-town stories
  slots: NapkinSlots;
  spins: AppliedSpin[];
  cast: Record<RoleKey, CharacterId>;
  alignmentAtStart: Record<CharacterId, Alignment>;
  lengthWeeks: number;
  variationChoices: Record<string, string>;
  beats: Beat[];
  rngSeed: number;

  runtime: {
    status: 'approved' | 'running' | 'hot' | 'steady' | 'cooling' | 'flopping'
          | 'paid_off' | 'fizzled' | 'wrapped_early';
    act: 1 | 2 | 3;
    buzz: number;                                        // 0 to 100
    buzzHistory: { beatId: BeatId; buzz: number }[];
    sentiment: Record<CharacterId, { value: number; intensity: number; streak: number }>;
    turnPressure: Partial<Record<CharacterId, {
      kind: 'crowd_picks_villain' | 'stale_hero'; since: DayIndex; offered: boolean;
    }>>;
    flopCauses: FlopCause[];
    savesUsed: number;                                   // at most 2
    extensionsUsed: number;                              // at most 1
    huddles: { day: DayIndex; played?: CardId; choice: 'twist' | 'wildcard' | 'reshuffle' | 'wrap' | 'ride' }[];
    decisions: { day: DayIndex; what: string; choice: string }[];  // feeds callbacks and the Napkin Box
    startedOn: DayIndex;
    endedOn?: DayIndex;
    endingId?: string;
    stamps: ('saved' | 'signature' | 'crowd_turn' | 'extended' | 'fizzled' | 'off_script')[];
    lessons: string[];                                   // "What we learned"
  };
}
```

### 15.4 Pitch, PersonalityTrait, CrowdReaction, TownMoment

```ts
type PitchTrigger =
  | { kind: 'booth_after_show'; showId: ShowId }
  | { kind: 'idle_wrestler'; who: CharacterId }
  | { kind: 'new_card'; cardId: CardId }
  | { kind: 'friendship_milestone'; who: CharacterId; hearts: number }
  | { kind: 'life_event'; eventId: string }
  | { kind: 'crowd_signal'; who: CharacterId; signal: 'chant' | 'merch_inversion' }
  | { kind: 'supershow_window'; supershow: SupershowId }
  | { kind: 'birdie_assignment'; slot: string }
  | { kind: 'signature'; shapeId: ShapeId }
  | { kind: 'player_initiated'; cardId?: CardId; target: CharacterId }
  | { kind: 'protege'; townId: TownId; protegeId: CharacterId };

interface Pitch {
  id: string;
  pitcherIds: CharacterId[];
  trigger: PitchTrigger;
  scope: 'for_you' | 'consult' | 'board' | 'protege';
  createdOn: DayIndex;
  location: LocationId;                 // must be in INSIDER_SPACES (asserted)
  want: string;                         // "I want to get my hands on a title."
  mode: InvolvementMode;
  keepTwistSecret: boolean;
  shapeId: ShapeId;
  draft: Partial<NapkinSlots> & {
    cast: Partial<Record<RoleKey, CharacterId>>;
    lengthWeeks?: number;
  };
  reactions: ReactionRecord[];
  nudgeUsed: boolean;                   // you_drive: one swap
  vetoesUsed: { player: boolean; pitcher: boolean };  // build_together
  redrawsUsed: number;
  forecast: { rings: 0 | 1 | 2 | 3 | 4 | 5; tip?: string; fatigue: boolean };
  status: 'waiting' | 'drafting' | 'signed' | 'with_birdie' | 'approved' | 'tweaked'
        | 'vetoed' | 'not_yet' | 'sleeping' | 'withdrawn';
  birdie?: BirdieVerdict;
}

interface ReactionRecord {
  characterId: CharacterId;
  cardId: CardId;
  score: number;
  reaction: 'love' | 'fine' | 'counter' | 'soft_no' | 'red_line';
  counter?: CardId;
  spinId?: SpinId;
  talkedThrough?: boolean;
}

type BirdieReason = 'draw' | 'card_fit' | 'roster_wellbeing' | 'ornery_line'
                  | 'rung' | 'venue' | 'fatigue' | 'prop_unready' | 'main_story';

interface BirdieVerdict {
  verdict: 'approve' | 'tweak' | 'veto' | 'not_yet' | 'sleep_on_it';
  reasons: BirdieReason[];
  tweaks?: CardEffect[];
  line: string;
  plea?: { argument: 'crowd' | 'heart' | 'roster' | 'history'; succeeded: boolean };
}

interface PersonalityTrait {
  id: TraitId;                          // 'vain', 'anxious', ...
  name: string;
  tagWeights: Partial<Record<CardTag, number>>;   // typically -3 to +3
  slotBias?: Partial<Record<SlotType, number>>;
  reshapeStyle: 'makeover' | 'shorten' | 'upgrade_stakes' | 'rescue' | 'add_dive'
              | 'classicize' | 'add_prank' | 'add_family' | 'winner_take_all'
              | 'add_romance' | 'supershow_pull' | 'refuse_betrayer' | 'offscreen'
              | 'add_rules' | 'add_ritual' | 'trim_sap' | 'add_lesson';
  barks: { love: string[]; fine: string[]; counter: string[]; softNo: string[] };
}

// Per-character story profile. Lives alongside the CAST data.
interface StoryPersonality {
  characterId: CharacterId;
  traits: TraitId[];
  loves: (CardTag | CardId)[];
  redLines: RedLine[];
  spins: Record<CardId, Spin>;
  spotlightAppetite: number;            // 0 to 100
  ego: number;                          // 0 to 100
  privateFacts: { id: string; consented: boolean }[];
}

interface FinishPattern {               // used by red lines and match validation
  pinner?: CharacterId; pinned?: CharacterId; clean?: boolean;
  method?: BookedFinish['method']; bodyPartFinish?: 'knee';
}

interface RedLine {
  id: string;                           // 'gideon.hair'
  blocks: {
    cards?: CardId[]; tags?: CardTag[];
    beatTemplates?: BeatTemplateId[]; finishes?: FinishPattern[];
    locations?: LocationId[]; timeOfDay?: TimeOfDay[];  // e.g. the Mothman before night
  };
  unlessFlag?: string;                  // a self-chosen crossing (Rosa's mask, Clint's unmasking)
  line: string;                         // what they say
}

interface Spin { id: SpinId; replaces: CardId; with: CardId; line: string; }

interface CrowdReaction {
  beatId: BeatId;
  attended: boolean;                    // was the player there?
  simulated: boolean;                   // resolved offscreen (15.5)
  stars?: number;                       // matches only, 0 to 5
  crowdPeak: number;                    // 0 to 100
  chants: ChantId[];
  sentimentDelta: Record<CharacterId, number>;
  merchDelta: Record<CharacterId, number>;
  townBuzz: number;                     // 0 to 4
  attendance?: number;
  tattler?: { stars: number; headline: string; pullQuote: string };
  buzzDelta: number;
  finishAchieved: boolean;              // false if the booked finish changed
  notable: string[];                    // 'agnes_purse', 'pip_sign_true', 'table_broke'
}

interface TownMoment {
  id: string;
  kind: 'ambient' | 'scene' | 'public_angle';
  markIds: CharacterId[];               // marks react; they're never in on it
  insiderRoles?: RoleKey[];             // insiders staging a public angle
  location: LocationId;                 // never an insider space (asserted)
  when: { days: Weekday[]; timeOfDay?: TimeOfDay[] };
  condition: Condition;
  weight: number;
  cooldownDays: number;
  lines: { speaker: CharacterId | RoleKey; text: string; register: 'kayfabe' }[];
  effects: {
    buzz?: number;
    sentiment?: Partial<Record<RoleKey, number>>;
    merch?: Partial<Record<RoleKey, number>>;
    grantCard?: CardId;
    worldFlag?: string;
    priceModifier?: { shop: 'bakery'; role: RoleKey; multiplier: number };
  };
}
```

### 15.5 The generation algorithm

```text
// ---------------- daily tick ----------------
onDayStart(day):
    world.drainLifeEvents() -> storyEvents
    for t in evaluatePitchTriggers(day): pitchQueue.offer(t)      // limited by Pitch Pace
    placeNudges(day)            // put pitchers with queued pitches in the player's path, in character
    runTownMoments(day)         // ambient moments always; scenes on days without a show

evaluatePitchTriggers(day):
    t  = signatureTriggers()                        // highest priority
    t += boothTriggers(day) if day is a show night   // 1 to 3 candidates
    t += lifeEventsUnconsumed()
    t += friendshipMilestones()
    t += crowdSignals()                             // chants, merch inversions
    t += supershowWindow(4..6 weeks)
    t += birdieAssignments(player.rung)
    t += idleWrestlers(>= 2 weeks)
    t += newCardMatches(tin.recent)
    return rankByPriority(t).take(paceBudget(settings.pitchPace))

// ---------------- making a pitch ----------------
generatePitch(trigger):
    pitcher = trigger.pitcher ?? choosePitcher(trigger)          // whose tags fit best
    shape   = trigger.signatureShape ?? weightedPick(shapes, s =>
                 traitAffinity(pitcher, s.tags)
               * triggerFit(trigger, s)
               * freshness(s)                                    // cooldown penalty
               * rosterFit(s))                                   // can we cast the roles?
    cast    = proposeCast(shape, pitcher, trigger)
              // filters: availability (injured, left the map, retired), alignment fit,
              // chemistry, role red lines (the Mothman only in night-capable shapes),
              // the player in a role if scope = for_you
    return Pitch{ pitcher, trigger, shape, cast,
                  mode = settings.defaultMode, want = wantLine(pitcher, shape, trigger) }

runNapkin(pitch):
    if pitch.mode == 'birdie_handles': autofill as 'you_drive', then sign without UI
    for slot in [hook, cast, twist, stakes, payoff, length, segments]:
        switch pitch.mode:
          'you_drive':
              card = bestCard(pitcher, slot, from = pitcher.cards + tin,
                              minScore = 0, avoidRedLinesOf = pitch.castAll)
          'build_together':
              offers = topK(pitcherCandidates(slot), 1..2) + [bestFromTin(slot)]
              offers = offers.filter(c => !hitsAnyRedLine(c, pitch.castAll))
              card = await player.choose(offers, allowRedraw, allowOwnCard, allowVeto)
          'my_idea':
              card = await player.chooseFromTin(slot)            // red-thread icons on known red lines
        place(pitch, slot, card)
        reactAll(pitch, slot, card)
    pitch.forecast = forecast(pitch, player.skills.storytelling)
    await signatures(pitch)                                      // "Shake on it"

reactAll(pitch, slot, card):
    for c in pitch.castAll where c != player:
        r = evaluate(c, card, pitch)
        record(r)
        if r.reaction == 'red_line':
            learnRedLine(player, c, r.redLine)
            offer(spinFor(c, card) ?? counterFor(c, slot))
        elif r.reaction in ['counter', 'soft_no']:
            offer(counterFor(c, slot))
            allowTalkThrough(persuasion(player, c) >= resistance(r.score))   // shown up front

evaluate(c, card, pitch):
    if blockedByRedLine(c, card, pitch): return red_line          // includes card + cast combos
    s  = sum(trait.tagWeights[tag] for trait in c.traits for tag in card.tags)
    s += 2 * |loves(c) ∩ (card.tags ∪ {card.id})|
    s += chemistryMod(c, pitch.cast)                              // -1..+1
    s -= boredom(c, card, pitch.shape)                            // 0 or 1
    if s < 0: s += friendshipMod(c, player)                       // 0..+2, only softens
    return bucket(s)    // >=3 love, 0..2 fine, -3..-1 counter, < -3 soft_no

birdieReview(pitch):
    if player.rung >= 6: return approve                           // you hold the Pencil
    reasons = []
    if pitch.forecast.rings <= 1:            reasons += 'draw'
    if cardBalanceBroken(pitch):             reasons += 'card_fit'
    if rosterStrain(pitch):                  reasons += 'roster_wellbeing'
    if orneryScore(pitch) > ORNERY_LIMIT:    reasons += 'ornery_line'
    if requiredRung(pitch) > player.rung:    reasons += 'rung'
    if venueConflict(pitch):                 reasons += 'venue'
    if fatigueScore(pitch) > FATIGUE_LIMIT:  reasons += 'fatigue'
    if propUnready(pitch):                   reasons += 'prop_unready'
    if usesHammersCard(pitch) and !flag('truth_revealed'): reasons += 'main_story'
    verdict =
        'ornery_line' in reasons or 'main_story' in reasons -> veto
        reasons == ['rung'] or timingOnly(reasons)          -> not_yet
        len(reasons) >= 3                                   -> veto
        len(reasons) >= 1                                   -> tweak(fixesFor(reasons))
        else                                                -> approve
    return BirdieVerdict{ verdict, reasons, line = birdieLine(verdict, reasons) }

// ---------------- running a storyline ----------------
instantiate(pitch):
    s = Storyline.from(pitch.draft, pitch.spins)
    s.lengthWeeks = clamp(pitch.draft.lengthWeeks, shape.length.min, shape.length.max)
    s.rngSeed     = hash(pitch.id)
    s.beats       = expandBeats(shape, s)
    s.runtime.buzz = clamp(50 + fitBonus + loveBonus + starBonus - fatiguePenalty, 20, 80)
    s.title       = gusNames(s)                                  // procedural title from tags + cast
    schedule(s)                                                  // 15.6
    return s

expandBeats(shape, s):
    beats = []
    for act in shape.acts:
        budget = beatBudget(s.lengthWeeks, act.share)            // table in 3.3
        for slot in act.beats:
            if slot.required or rng(s).chance(optionalWeight(slot, budget)):
                beats.push(materialize(slot, s))
    inject(beats, hookBeat(s.slots.hook), act 1, first)
    inject(beats, twistBeats(s.slots.twists), at shape.twistPlacement)
    inject(beats, stakesDeclaration(s.slots.stakes), act 2, last show)
    inject(beats, payoffMatch(s.slots.payoff), act 3)
    spread(beats, segmentBeats(s.slots.segments), act 2)
    ensure(at least 1 town moment and 1 insider moment per act; at most 1 Hold)
    for prop requirement with testRun: insert 'hank.test_run' on the Friday before first use
    return beats

onBeatResolved(s, beat, reaction):
    s.runtime.buzz = clamp(s.runtime.buzz + buzzDelta(reaction, s),   // formula in 8.2
                           s.shape.buzzFloor ?? 0, 100)
    updateSentiment(s, reaction)
    checkTurnPressure(s)                    // 8.3; queues a booth scene
    updateStatus(s)                         // hot / steady / cooling / flopping
    if s.runtime.status in [cooling, flopping] and no huddle queued: queueHuddle(s)
    if beat.isLastOfAct2 and s.runtime.buzz >= 75 and s.runtime.extensionsUsed == 0:
        offerExtension(s)
    if !reaction.finishAchieved: handleOffScript(s, beat, reaction)   // 15.7
    if beat.isPayoff: resolveEnding(s, reaction)

resolveEnding(s, reaction):
    ending = first(e in shape.endings where e.when(s, reaction)) ?? shape.defaultEnding
    applyStakes(s.slots.stakes.stakesOutcome)       // title change, leave map, costume, pie...
    applyAlignmentChanges(s); applyMorale(s); applyChemistry(s); applyFriendship(s)
    seedFollowUps(ending.seeds)                     // e.g. a Return hook in 4 weeks
    grantCallbackCard(s)
    archive(s)                                      // the napkin moves to the Napkin Box
    queue(epilogue: booth insider moment tonight,
          town moments tomorrow, Tattler on the next issue day)

// ---------------- offscreen resolution ----------------
simulateBeat(beat):                                  // the player wasn't there, or another town
    base  = mean(ringSkill(w) for w in beat.participants) / 20     // 0..5
          + chemistry(beat) / 50
          + (storyline.buzz - 50) / 40
          + stipulationModifier(beat.match)
    stars = clamp(seededNormal(base, 0.6, storyline.rngSeed + beat.order), 0.5, 5)
    return CrowdReaction{ simulated: true, stars, finishAchieved: true, ... }
```

### 15.6 Scheduling beats onto the calendar

**The calendar:** a week runs Sunday to Saturday, and each day has four time slots (morning, midday, evening, night). Shows happen on Wednesday evenings (VFW, finishing before night for bingo) and Saturday evenings into night (the Sportatorium; segments in the last two positions count as **night**, which is when the Mothman is available). Supershows replace the last Saturday show of each season and are night-capable throughout.

**Where each kind of beat goes:**

| Beat kind | Days | Time | Rule |
|---|---|---|---|
| Match, ring segment, backstage, run-in, contract signing | Wednesday or Saturday | Evening or night | One beat per storyline per show. Show capacity: Wednesday 3, Saturday 5, supershow 6 payoffs plus 2 other beats. |
| Payoff match | The last show in the window | Saturday preferred | Moves to a supershow if one falls within ±1 week and the length can stretch. |
| Stakes declaration | The show before the go-home show | | |
| Twist | Wherever `twistPlacement` puts it | | |
| Town moment (scene) | Sun, Mon, Tue, Thu, Fri | Depends on the template | At most 1 per storyline per day, and 2 or 3 per storyline per week. Ambient moments have no limit. |
| Public angle | Sun, Mon, Tue, Thu, Fri | Morning or midday | Never at a mark's expense (lint-checked). |
| WRSL promo | Monday and Thursday | Morning (6 to 10 a.m.) | |
| Tattler | Sunday (reviews Saturday) and Thursday (reviews Wednesday) | Morning | Automatic. |
| Insider moment | After every show, plus huddles | Night, in the booth | Birdie's verdicts happen on Monday and Thursday mornings. |
| Hank's test run | The Friday before a prop's first use | Midday | |

```text
schedule(s):
    window = showsBetween(s.startedOn, s.startedOn + s.lengthWeeks * 7, s.townIds)
    order  = sortByPriority(s.beats)
             // signature payoff > supershow payoff > payoff > twist > stakes
             //   > other show beats > WRSL > town moments
    for b in order:
        candidates = slotsFor(b, window)                       // rules in the table above
        candidates = candidates.filter(fitsCapacity, noDoubleBooking,
                                       participantsAvailable, venueAllows(b),
                                       timeOfDayAllowed(b), // e.g. the Mothman: night only
                                       withinActWindow(b))
        if candidates.empty:
            candidates = shiftByOneShow(b) or downgrade(b)      // a match becomes a segment
            if still empty and !b.required: b.status = 'skipped'; continue
        b.scheduled = best(candidates, preferSaturdayFor = b.isPayoff)
    publishToCalendar(s)                                        // napkin icons on show days, house icons on others

onShowStart(show):
    for b in beatsAt(show) where b.playerInvolved and !player.present:
        if settings.missedShowPolicy == 'hold':
            b.status = 'held_for_player'
            reschedule(b, nextShowOfKind(show.kind))           // the story waits for you
            extend(b.storyline, byDays = gap)                  // the end date slides; nothing else changes
        else:
            simulateBeat(b)
```

**The story waits for you.** If a beat the player is in gets held twice, the pitcher checks in kindly at the booth ("No rush, partner. The Dust Devil's patient."). Beats the player isn't in are never held.

### 15.7 How storyline state feeds the match system

Every match beat produces a `MatchBooking`. The match system already knows the phases (feeling out, shine, heat, comeback, near-falls, finish), the crowd meter, star ratings, and the opponent's called spots. The storyline system tells it *what story to tell*.

```ts
type MatchPhase = 'feeling_out' | 'shine' | 'heat' | 'comeback' | 'near_falls' | 'finish';

interface MatchBooking {
  matchId: string;
  showId: ShowId;
  storylineId?: StorylineId;
  beatPurpose: 'act1_establish' | 'act2_heat' | 'act2_twist' | 'stakes'
             | 'payoff' | 'background' | 'epilogue';
  sides: {
    members: CharacterId[];
    alignment: Alignment;     // drives AI style: villains cheat in heat, heroes fire up in comeback
    crowdBias: number;        // -50..+50: the crowd meter's starting lean, from sentiment
  }[];
  finish: BookedFinish;
  phaseScript: PhaseDirective[];
  stipulation: StipulationRules;
  runIns?: { who: CharacterId; phase: MatchPhase; side: number; playerOptional: boolean }[];
  timeAllotment: 'short' | 'medium' | 'long';
  chemistry: number;          // clarity of the opponent's called spots
  hold?: { phase: MatchPhase };
}

interface BookedFinish {
  winnerSide: number | null;  // null = draw or no contest
  method: 'pinfall' | 'submission' | 'say_uncle' | 'dq' | 'countout' | 'escape'
        | 'retrieve' | 'ten_count' | 'falls_count' | 'eliminations'
        | 'crowd_vote' | 'schmozz' | 'contest_score';
  finisherCardHint?: string;
  cheat?: 'feet_on_ropes' | 'distraction' | 'foreign_object' | 'run_in' | 'ref_bump' | null;
  lock: 'soft' | 'firm' | 'open' | 'eternal';
  forbidden: FinishPattern[];  // compiled from red lines (no twin pins twin clean; no knee finish on Hazel)
}

interface PhaseDirective {
  phase: MatchPhase;
  directive: 'villain_cheats' | 'target_body_part' | 'hero_fire_up' | 'ref_bump'
           | 'run_in' | 'turn' | 'near_fall_2_9' | 'signature_tease' | 'callback_spot'
           | 'hold' | 'crowd_count_along' | 'stip_event';
  params?: Record<string, string | number>;
}

interface StipulationRules {
  matchType: CardId;                 // the payoff card
  winConditions: BookedFinish['method'][];
  dqEnabled: boolean;
  countoutEnabled: boolean;
  specialCards?: string[];           // injected into decks: 'climb_ladder', 'grab_pole',
                                     // 'eat_pie', 'answer_quiz', 'throw_snowball', 'honey_pot'
  removedCards?: string[];
  ringsideEvents?: 'lumberjacks' | 'snow_forts' | 'hay_bales' | 'bingo_tables' | null;
  venueLimits?: Requirement[];
  crowdMeterFloor?: number;          // the Farewell Match keeps the crowd at least "warm"
  falls?: number;                    // Two Out of Three, Iron Hour
  timeLimitMinutes?: number;
}
```

**Default bookings by beat purpose:**

| Purpose | Default finish | Lock | Phase script highlights |
|---|---|---|---|
| `act1_establish` | The hero wins clean (or, 40% of the time, the villain cheats to win) | soft | Shine for the hero; heat with a villain cheat; the finish as booked |
| `act2_heat` | The villain wins with a cheat | soft | A long heat phase; the comeback cut off; `villain_cheats` at the finish |
| `act2_twist` | Set by the twist card (The Turn: the partner turns during near-falls, ending in a DQ or a loss) | firm | `turn` or `run_in` at the card's phase |
| `stakes` | A schmozz or no contest | firm | A brawl, then a segment |
| `payoff` | Set by the ending (usually the hero wins clean) | firm | The full arc, a Hold allowed, `crowd_count_along` if the hero wins by pinfall |
| `background` | Weighted by ego and morale | soft | Standard |

**What the locks mean:**

- **soft:** the AI steers toward the finish, as the canon describes, so the player usually lands there. A determined player can force a different result, in which case `finishAchieved = false`.
- **firm:** the AI steers harder. Only the legendary card **The Audible** can change the result.
- **open:** the crowd decides (WC-01). Whichever side leads the crowd meter at the finish phase wins.
- **eternal:** nothing changes the result. It's used once, for the Homecoming finale (14.3).

**Going off script.** When a soft-lock finish isn't reached, `handleOffScript` turns the surprise into story. It adds an unplanned "Off Script!" twist beat, opens a booth scene ("That wasn't the finish, sugar."), and re-evaluates which endings are possible. If the crowd peaked high, Birdie's Ledger goes *up* ("Well. They loved it."). If not, it dips slightly. Either way, the storyline adapts and nothing breaks.

**What comes back from the match:** stars, the crowd peak, chants, notable moments, and whether the finish happened. That becomes a `CrowdReaction`, which goes into `onBeatResolved`.

### 15.8 Kayfabe guard and content lint

- **Register enforcement.** Every authored line has a `register`. At build time, any beat or town moment whose location isn't in `INSIDER_SPACES` may reference only `kayfabe` lines. At runtime, `assert(beat.register === 'insider' ? INSIDER_SPACES.has(beat.location) : true)`. Pitches assert that their location is an insider space.
- **No slip API.** There's no code path that can reveal the truth to a mark. `isInsider` changes only through the `JoinsTheBusiness` life event, and Coach Patty is excluded from it.
- **Forbidden tags** (15.1) make content fail at load time. A CI lint scans every authored and templated string for a maintained list of death and cruelty imagery (casket, funeral, grave, memorial, and so on) and fails the build if it finds any.
- **Red lines are checked in three places:** pitch evaluation, booking-board validation, and match-finish validation (`BookedFinish.forbidden`).
- **Mark safety.** Town moments and public angles validate that no mark is the target of an effect other than reacting: no price penalty on a mark, no prank on a mark, no menacing of anyone flagged `child`.

### 15.9 Save data

```ts
interface StorySaveData {
  version: number;                           // migrations keyed on this
  settings: {
    defaultMode: InvolvementMode | 'ask';
    pitchPace: 'chatty' | 'steady' | 'quiet';
    keepTwistSecretDefault: boolean;
    realInjuries: 'off' | 'rare';
    missedShowPolicy: 'hold' | 'simulate';
  };
  tin: OwnedCard[];
  pitchQueue: Pitch[];                       // waiting pitches never expire
  activeStorylines: Storyline[];
  archive: ArchivedStoryline[];              // compact records (below)
  cooldowns: {
    shapes: Record<ShapeId, DayIndex>;
    cards: Record<CardId, DayIndex>;
    headlinerPairs: Record<string, number>;  // 'dex|gideon' -> stories in a row
  };
  characters: Record<CharacterId, {
    alignment: Alignment;
    sentimentGlobal: number;
    morale: number;
    fatigue: number;
    isInsider: boolean;
    learnedRedLines: string[];               // red lines the player has discovered
    signatureRuns: Record<ShapeId, DayIndex[]>;
    availability: { kind: 'available' | 'injured' | 'left_map' | 'retired'; until?: DayIndex };
    privateFactConsents: string[];
  }>;
  chemistry: Record<string, number>;         // key 'a|b', ids sorted
  titles: Record<TitleId, {
    name: string; designRef: string; prestige: number; retired?: boolean;
    holders?: CharacterId[];
    lineage: { holders: CharacterId[]; wonOn: DayIndex; lostOn?: DayIndex;
               defenses: number; howWon: string; storylineId?: StorylineId }[];
  }>;
  career: { rung: CareerRung; ledger: number; history: { rung: CareerRung; day: DayIndex }[] };
  town: Record<TownId, {
    recentMoments: { id: string; day: DayIndex }[];
    priceModifiers: { shop: 'bakery'; who: CharacterId; multiplier: number; until: DayIndex }[];
  }>;
  tattler: { day: DayIndex; headline: string; stars: number; storylineIds: StorylineId[] }[];
  booking?: {
    boards: Record<TownId, { nextShows: Record<ShowId, MatchBooking[]> }>;
    delegation: Record<TownId, 'hands_on' | 'check_in' | 'trust'>;
    proteges: { id: CharacterId; townId: TownId; personality: string; trust: number }[];
  };
  rival?: { stage: 'arrived' | 'feud' | 'supershow' | 'resolved'; relationship: number; outcome?: string };
  mainStory: {
    napkin1983: Record<'hook' | 'roles' | 'twist' | 'stakes' | 'payoff' | 'length',
                       'blank' | 'planned' | 'revealed'>;
    hammersCards: CardId[];
    homecomingDone: boolean;
  };
  rngState: number;
}

interface ArchivedStoryline {                // about 1 to 2 KB each; keep them all
  id: StorylineId; title: string; shapeId: ShapeId;
  cast: Record<RoleKey, CharacterId>; slots: NapkinSlots;
  startedOn: DayIndex; endedOn: DayIndex; endingId: string;
  bestStars: number; avgStars: number; peakBuzz: number;
  headlines: string[]; stamps: Storyline['runtime']['stamps'];
  decisions: Storyline['runtime']['decisions'];
  signatures: CharacterId[];                 // who signed the napkin
  callbackCardId?: CardId;
}
```

**Engineering notes:**

- **Storage.** Keep archived storylines forever, because the Napkin Box is beloved and callbacks need them. Store the save in IndexedDB, not localStorage. Archived records are small, and Tattler issues older than 52 weeks can be trimmed to headline-only.
- **Determinism.** Every storyline gets its own seed, and the world RNG state is saved, so reloading never rerolls an outcome.
- **Content validation** runs in CI over every card, shape, personality and town moment: requirements resolve, IDs exist, each shape's beats cover all three acts, no forbidden tags appear, kayfabe registers are respected, and every red line has a line of dialogue.
- **Tuning.** Every number in sections 6 to 9 (thresholds, buzz formula weights, fatigue penalties, capacities) lives in a single `storyTuning.ts` file.

---

## 16. Five worked example storylines

Each example runs from pitch to payoff. Buzz values follow the formula in 8.2 and are rounded.

### Example 1: "Custody of Jobber" (funny)

*Shape: The Prank War (5.24). Mode: **You drive**. Pitcher: Gus Gravel. Player rung: Undercard. Length: Short, 3 weeks.*

**The pitch.** After a Saturday show, Gus slides into the booth holding a shoebox with holes punched in the lid. "Don't look in the box. Okay, look in the box." Jobber the raccoon is asleep inside on one of the player's wristbands. The player says "You drive," and Gus unfolds a napkin covered in arrows.

| Slot | Gus's card |
|---|---|
| Hook | HK-10 **The Mysterious Box**: the box is left in the ring, and Jobber is inside |
| Hero / Villain | The player / **Professor Pinfall**, who claims Jobber as her "lab assistant" |
| Twist (face down until week 2) | TW-17 **Enemy of My Enemy**: Gideon files a rival claim, and the player and Pinfall have to team up against him |
| Stakes | ST-09 **Custody** (of Jobber) |
| Payoff | PO-15 **Object on a Pole**, made into a three-way "Grapes on a Pole" match |
| Length | 3 weeks |

The player turns on **Keep the twist a secret**, so the twist slot stays face down ("Gus's got a secret") until the beat where it happens. Then the player uses their one nudge to add a clause: the winner gets custody, *but Jobber gets a say*. Pinfall agrees, because it's a "controlled variable."

**Birdie:** "Sugar, that's the dumbest thing I ever heard. Do it." *(Approved.)*

**Act I (week 1).**
- **Saturday:** a gift-wrapped box sits in the ring. Gus opens it on the microphone and finds Jobber asleep. Pinfall stalks out: "That animal has been organizing my chalk by length. He's *mine*." The player counters: "He sleeps in my gear bag." Gus declares a formal custody dispute.
- **Sunday:** the Tattler headline reads **"RACCOON IN A BOX: WHOSE IS HE?"**
- **Monday, on *The Gravel Pit*:** Pinfall calls in and presents "evidence" in a 9-minute lecture. Listeners call in for the player. Fenwick calls in to say Jobber is a government raccoon.
- **Tuesday (town):** Pip's new sign reads `JOBBER IS MINE ACTUALLY`, and chalk raccoons appear all over the sidewalk.

**Act II (weeks 1 to 2).**
- **Wednesday at the VFW:** a **Jobber roll** at Pinfall's match comes up *steals glasses*. Pinfall loses by countout while crawling around looking for them. The crowd chants "JOB-BER!"
- **Thursday (town):** Sheriff Bev opens a case file and takes a statement from Nadia the vet, who is very sincere about it: "He's healthy, he's happy, he likes grapes."
- **Saturday:** a custody contract signing. Jobber sits on the contract and won't budge, and when the table breaks he's already hopped off. Then the face-down card flips: Gideon storms out holding a shirt covered in raccoon fur. "He *chose* sequins." (In the booth afterward it turns out Gus cleared this with Gideon weeks ago, on one condition: "My merch bin. He sleeps on my shirts. Clearly he has taste.") The player and Pinfall look at each other. Enemy of My Enemy: they shake hands, flour-free.
- Buzz after the twist is 81, so the story is **Hot.** Gus offers to add a chapter, and the player declines: "It's a three-week bit. Leave 'em wanting more."

**Act III (week 3).**
- **Saturday payoff:** a three-way Grapes on a Pole match. The booked finish is the player retrieving the grapes, with a soft lock. During the near-falls a Jobber roll comes up *climbs the pole*. Jobber scales the pole and sits on top eating a grape, and the crowd meter hits its maximum. The player wins by coaxing him down with one of Tiny's crullers and taking the grapes.
- **The custody clause:** the player sets Jobber down in the center of the ring. He walks past the player, past Pinfall, past Gideon, under the bottom rope and into the open tote bag of **Agnes Pickett** in row one. Gus, hoarse: "THE RACCOON HAS CHOSEN!" Agnes: "Well. I suppose he can come for Sunday dinner."
- **The booth:** Pinfall asks for visitation rights. Gideon asks for his shirts back. The match gets 4 stars.
- **The Tattler:** **"RACCOON SPURNS ALL SUITORS; AGNES PICKETT NAMED GUARDIAN."** ★★★★

**Rewards and lasting changes:** the chant card "JOB-BER!", a callback card called **"The Grape Pole,"** a friendship gain with Gus, and Storytelling XP. A permanent world flag is set: **Jobber now sits in the front row with Agnes on Saturdays.**

---

### Example 2: "Six Ladders to the Ferris Wheel" (spectacular)

*Shape: The Underdog Title Chase (5.2). Mode: **Let's build it together**. Scope: **Consult** (Dex's story). Player rung: Midcard. Length: Standard, 6 weeks, paid off at Fairgrounds Fury.*

**The pitch.** Dex finds the player in the locker room before a Wednesday show. "I want the big one. The Heavyweight belt. And I want to win it somewhere nobody's ever seen." They build it together.

- **Hook:** Dex offers the Sneak Attack and the Open Challenge. The player's Tin offers the Crashed Entrance. The player picks **HK-02 The Open Challenge**: Gideon, the champion, will face "anyone gorgeous enough," and Dex answers in a sequined headband he borrowed from Marigold.
- **Twist:** the player plays **TW-12 The Mothman Descends** from their Tin. The Mothman can't be asked in person, since not even the insiders know who it is, so the request is left in the booth. The next night, a moth-shaped note is waiting under the ketchup bottle with a single checkmark on it.
- **Stakes:** **ST-01 The Title**, the ACW Heavyweight Championship.
- **Payoff:** Dex offers the Ladder Match, and Gideon is anxious about it (Anxious dislikes high_risk and heights). Gideon's spin: "Fine. But the ladders are *gold*." Hank, from across the room: "Six gold ladders?" That adds a test-run beat.
- **Length:** 6 weeks, lined up with Fairgrounds Fury.

**Birdie (tweak):** "Lovely. Six weeks, Fairgrounds Fury, under the Ferris wheel. And Dex, if you dive off that Ferris wheel, I will retire you myself." *(Tweak: the Ferris wheel is scenery only.)*

**Act I (weeks 1 and 2).**
- **Saturday:** the Open Challenge. Dex answers and steals a non-title win with a roll-up, an act1_establish beat where the hero wins clean in an upset.
- **Monday, on *The Gravel Pit*:** Gideon calls in, sounding hurt: "A *lucky* roll-up."
- **Tuesday (town):** kids in homemade Dex goggles. Tiny chalks GIDEON next to the bakery's `VILLAIN SURCHARGE: $1`.
- **Wednesday:** Gideon dodges the match ("salon appointment") with a Mirror Speech on the TV cart.
- **Saturday:** Dex beats Bo in a gauntlet match to earn the title shot.

**Act II (weeks 3 to 5).**
- **Week 3, Saturday:** the title match. Gideon steals it with his feet on the ropes, an act2_heat beat. Buzz is 58.
- **Week 3, Thursday (town):** Fenwick swears he saw wings over the Ferris wheel. This is an ambient moment, a tease seeded by the twist card.
- **Week 4, Saturday:** the stakes are declared at a contract signing for the Ladder Match. Gideon signs with a gold pen, and the table breaks. Buzz is 66.
- **Week 5, Friday:** Hank's test run at the fairgrounds. She climbs one gold ladder and gets down muttering, "Fine. *Fine.*"
- **Week 5, dawn town moment:** Dex runs the water tower stairs (SG-14) while the town cheers from below. Coach Patty times him and refuses to believe her own stopwatch.
- **Week 5, Saturday:** the go-home show. Gideon hires the Bruiser Twins as "security." (Buck agrees instantly. Bo asks about overtime and dental.) Buzz is 77, so the story is **Hot.**

**Act III (week 6): Fairgrounds Fury, at night.**
- The Ferris wheel lights cycle through gold. Gideon's entrance gets pyro and a four-minute sequin routine.
- **Shine:** Dex flies from ladder to ladder.
- **Heat:** the twins interfere and pull Dex off a ladder twice.
- **Near-falls:** both men climb, and both come back down.
- **The twist:** every light at the fairgrounds goes out, and only the Ferris wheel is left glowing. When the ring lights snap back, **the Mothman** is standing in the middle of the ring. The twins run off screaming (they're insiders playing it scared, and Buck is visibly enjoying it). The Mothman points once at the belt, and then the lights cut again. When they come back, the Mothman is gone.
- **The finish:** Dex and Gideon climb opposite sides of the tallest gold ladder and trade punches at the top. Dex unhooks the belt. Confetti cannons fire, fireworks go off over the Ferris wheel, and the crowd counts the "three" even though there's no pin.
- **Result:** 4.5 stars. Chants of "MOTH-MAN!" and "YOU DESERVE IT!" Gideon's sentiment rises: the crowd respected his bravery on the ladder, which plants a future turn.
- **The Tattler:** **"Five stars. I have no notes. I have only screaming."**

**The booth.** Dex holds the belt, then quietly pulls a folded MaxxMedia letter out of his jacket. He's been carrying it all season. He doesn't open it. *(This plants his signature storyline, Bright Lights, Small Town.)* Gideon: "I was so scared up there. Did I look scared? Don't answer." At the end of the booth there's an empty seat, with a single napkin folded into the shape of a moth.

---

### Example 3: "Sundown" (heartbreaking but hopeful)

*Clint's signature storyline, built on CAST.md's seed "The Unmasking." Shape: The Retirement Tour (5.7). Mode: **You drive**. Player rung: Main event. Length: Epic, 8 weeks, paid off at Harvest Havoc.*

**The pitch.** Clint reaches 8 hearts in late summer. In the locker room he sits on the bench with the Dust Devil mask in his hands and taps it twice. "Two years ago I promised Lacey I'd hang 'em up. Had the party and everything. Sheet cake." A dry laugh. "Then Birdie handed me this, and I've spent every Saturday since telling the whole town that cowboy's washed up. She's got my face on her dartboard. The other face." He looks up. "I want my last match at Harvest Havoc. I want it to be you. And I want the Bulldogger, unmasked, one more time, with my girl in the building."

The player says, "You drive. It's your ride." The gold Signature napkin arrives with most of its slots already inked in pen:

| Slot | Card | Locked? |
|---|---|---|
| Retiree / Villain | **The Dust Devil** (Clint) | Pen |
| Hero / Final Opponent | The player | Pen (he asked) |
| Stakes | ST-06 **Career on the Line** (the Dust Devil's) | Pen |
| Payoff | PO-24 **The Farewell Match**, at Harvest Havoc | Pen |
| Hook | HK-03 **The Left-Hanging Handshake**: the player offers a handshake "for Cowboy Clint," and the Dust Devil blows dust on it | Pencil (Clint fills it) |
| Twist | TW-13 **The Heart-to-Heart** | Pencil |
| Length | 8 weeks | Pencil |

The unmasking isn't a card. It's Clint's to give, so it lives in his hand-written ending, not on the napkin.

**Birdie** gave him the mask, so she knows exactly what this is. She reads the napkin twice and puts a hand on his shoulder. "Approved. Saturday, like you wanted." The next week, in public, she plays the Commissioner and "fines" the Dust Devil for getting dust on her ring.

**Act I (weeks 1 and 2).**
- **Saturday:** the player offers a handshake in honor of Cowboy Clint's legacy. The Dust Devil blows a puff of "desert dust" (Hank's cornstarch) onto the outstretched hand and wins with Dirt in Your Eye.
- **Tuesday evening (town):** at Lacey's wrestling meet in the high school gym, the player spots Clint in the top row with his hat over his heart, there "as a retired man." Lacey wins her match. Coach Patty corrects her posture anyway.
- **At the merch table:** Lacey asks the player for an autograph, then whispers, "Hurt him. For my dad. He can't do it anymore."
- **The booth:** Clint tells the player she put a dart right between the Dust Devil's eyes last night. He has never been prouder of anything.

**Act II (weeks 3 to 6): the tour.**
- **Callback matches from the archive:** a weather feud with Hazel in week 3, "Hurricane vs. Dust Devil," which Gus can barely contain himself announcing. In week 4, Sweet Lou's once-a-year match, which the Dust Devil loses through sheer orneriness.
- **Week 5, a Bandana Match against the player:** the two are tied wrist to wrist with a red bandana. In the front row, Lacey touches the identical red bandana on her own wrist and frowns. She doesn't know why.
- **Week 6, the twist (TW-13, The Heart-to-Heart):** in a ring promo, the masked villain says, "I've done things in this ring I ain't proud of. But every one of 'em, I did for somebody." The crowd goes quiet. Lacey boos louder than anyone in the building.
- Buzz is 72 and steady. The Dust Devil's sentiment sits around −55, with very high intensity: perfectly hated.

**Act III (weeks 7 and 8): sundown.**
- **The go-home beat:** a face-off. The Dust Devil offers the player a handshake, then yanks it back at the last second, and the crowd roars. In the booth, Clint admits it was the hardest thing he's done all year, because he wanted to shake the player's hand for real.
- **Harvest Havoc, the Farewell Match.** The crowd meter can't drop below "warm." The booked finish is the player winning, with a firm lock.
  - **Heat:** the Dust Devil, ornery to the last.
  - **Near-falls:** the player has him beat. Then he stands in the center of the ring, taps his mask twice, and **pulls it off himself.**
  - **The Hold:** the music drops to a single harmonica line, and the building goes silent. Gus, into the microphone, barely a whisper: "...Clint?"
  - **The finish:** Cowboy Clint hits **the Bulldogger** one last time, as himself. He covers the player and then lifts their shoulder at two, because he didn't want the win. He wanted the move. The player hits their finisher, and the whole town counts the three.
  - **Lacey**, in the front row, stands up, looks at her father for a long moment, and walks out.
- **Result:** 4.5 stars. No chants. Just a long, confused, tender round of applause.
- **The next morning (town):** the Tattler runs **"THE DUST DEVIL WAS COWBOY CLINT ALL ALONG."** Sheriff Bev stops him on Main Street, can't decide whether to arrest him or hug him, and does a little of both. Tiny won't take his money at the bakery.
- **The booth:** Clint hangs the Dust Devil mask on a nail in the locker room and asks the player to leave it there "until she's ready to know." The player can sit with him as long as they like. There's no timer.

**The epilogue, three Saturdays later.** The calendar shows no beat, only a small house icon. During the opener, Lacey walks back into the Sportatorium, sits down in her old seat, pulls the red bandana off her wrist and throws it into the ring. At the curtain, where he now helps Birdie run the show, Clint taps his hat brim twice.

**What it seeds:** Lacey's trainee arc from CAST.md. When she later becomes the player's first trainee and joins the business (the **JoinsTheBusiness** life event), her first day in the locker room ends at that nail. She looks at the mask for a long time. *"...You were SO good at being the worst."*

**Variation: the second hand-written ending.** If the player told Clint in the week 6 booth scene that "she should hear it from you, not from a whole building," he makes a different choice and keeps the mask on. The Dust Devil loses and walks up the aisle while Lacey cheers his defeat with both fists in the air. At the curtain he turns and tips an imaginary hat toward the front row. Lacey stops cheering, just for a second, puzzled. The mask still goes on the nail, and the truth waits for her trainee arc, where she hears it from him first.

---

### Example 4: "Story Hour" (built in "I've got an idea" mode)

*Shape: The Gentle Monster (5.25). Mode: **I've got an idea**. Scope: For you. Player rung: Undercard. Length: 5 weeks, changed to 4 by Birdie.*

**The pitch.** The player opens the Recipe Tin, takes out the Open Challenge card, and finds Big Earl in the booth on a Tuesday evening, reading glasses on and a crossword half done. Friendship: 5 hearts.

| Card the player placed | Earl's reaction | Result |
|---|---|---|
| Shape: **The Gentle Monster** | (He only sees the cards, not the shape name.) | Shape set |
| Hook: HK-02 **The Open Challenge** | "Fine." (Fine) | Placed |
| Hero / Villain: the player / **the Mountain** | "Mm." (Fine) | Placed |
| Stakes: ST-03 **Loser Leaves Town** | "Who'd do Saturday story hour? Library can't close for six weeks." (Soft no, score −4.) He counters with his loved card: "Tell you what. *Loser reads it.*" | The player accepts **ST-14 Story Hour.** Earl: "You'll do voices. I'll know if you don't do voices." |
| Twist: TW-13 **The Heart-to-Heart** | "I don't do speeches." (Counter, score −1, from Private vs. live_mic.) His spin is **"The Look"**: no speech, just the camcorder catching him being kind when he thinks no one's watching. | The player accepts the spin. |
| Payoff: PO-09 **Last One Standing** | A rare smile. (Love it.) | Placed. +5 starting buzz. |
| Length: 5 weeks | "Hm." | Placed |

The forecast shows three coffee rings and the tip *"The Mountain might get cheered."*

**Birdie (tweak, at Monday's office hours):** "Last One Standing at the VFW? The bingo crowd'll riot. Payoff goes on a Saturday. And four weeks, not five. The library's doing inventory." The player pleads *the heart*, but her concern was the venue and the schedule. She smiles and holds firm: "Heart's fine, sugar. It's the calendar I'm worried about." The player accepts.

**Act I (week 1).**
- **Saturday:** the player lays down an open challenge. The lights dim to red and the Mountain walks out slowly. He holds the player overhead in the Summit while the crowd counts the seconds, and flattens them in four minutes, an act1_establish beat where the monster wins clean.
- **Sunday, the Tattler:** **"THE MOUNTAIN MOVES."**
- **Tuesday (town):** kids give Big Earl a wide berth on the sidewalk. Pip holds up his cardboard belt, and the Mountain stops, considers it, **nods solemnly**, and walks on. (This is Earl's red line in action, and it's the moment players screenshot.)

**Act II (weeks 2 and 3).**
- **Wednesday at the VFW:** the player comes close and loses. The Mountain's sentiment is −35.
- **Thursday (town):** at the library, the player in character has to return a book to the scariest man in town. He stamps it without a word, then slides a bookmark across the desk. It has a tiny drawn mountain on it.
- **Week 3, Saturday, the twist ("The Look"):** between matches, the big screen shows camcorder footage from the parking lot. A fledgling sparrow has fallen onto the asphalt, and the Mountain kneels, cups it in his enormous hands and sets it back in the hedge. The Sportatorium goes "awww" all at once. The Mountain's sentiment jumps to +32.
- **Week 3, Saturday, the stakes:** in a ring promo, the Mountain growls out the terms: the loser reads at story hour. The crowd laughs, and his sentiment goes to +38.

**Act III (week 4).**
- **Saturday payoff, Last One Standing:** a firm lock with the player winning. The Mountain beats the count three times. On the fourth, he gets to one knee at nine and *looks at the crowd*, and they're cheering for him. He stays down. 4 stars. Buzz is 79.
- **Sunday morning (town), Story Hour at the library:** in kayfabe, the Mountain is a defeated villain paying off a stipulation. He reads a picture book by "Anonymous" to twenty kids sitting cross-legged, and he does the voices. Pip asks who wrote it. Earl closes the book. "Somebody who used to be scared of the dark too."
- **The Tattler:** **"MOUNTAIN READS; TOWN MELTS."**

**The crowd steers.** The Mountain's sentiment has been above +30 for three beats in a row, so **turn pressure** fires. In the booth, Earl is wearing a new sweater and pretending he isn't: "A lady at the bakery gave me a free cruller. Tiny didn't even charge me the villain surcharge. What do we do?" The player chooses **Lean in.** Organic turn: the Mountain becomes a hero.

**Afterward:** his book stays anonymous (consent was partial). If the player and Earl have already made CAST.md's 10-heart choice to publish under his own name, this beat changes: the Mountain reads his own name off the cover, and the turn happens right there at Story Hour. Only the player knows, because Earl told them in the booth. The next week Earl pitches a sequel: an Odd Couple tag team of the player and the Mountain.

---

### Example 5: "Pop Quiz" (flops, then gets saved)

*Shape: The Underdog Title Chase (5.2). Mode: **Let's build it together**. Scope: **Consult** (Pinfall pitches, and Tiny joins). Player rung: Midcard. Length: 4 weeks, for the Wednesday Night Championship.*

**The pitch.** Professor Pinfall, in the booth with a red pen behind her ear: "I want to teach this town a lesson. Literally." Tiny, nervous and holding a muffin, agrees to be the challenger. They build it together.

- **Hook:** Pinfall offers the Left-Hanging Handshake: she refuses Tiny's hand because it's "floury and unsanitary." The player picks it.
- **Hero / Villain:** Tiny is the hero challenger. Pinfall is the smug lecturer and the Wednesday Night Champion.
- **Twist:** none. Pinfall: "A clean proof needs no twist."
- **Stakes:** ST-01 The Title.
- **Payoff:** Pinfall offers Two Out of Three Falls and the Pop Quiz Match, and Tiny offers the Pie-Eating Contest. The player picks **PO-16 Pop Quiz Match.**
- **Forecast:** two coffee rings and a small yawn icon. At Storytelling 3 the player gets the tip *"Who brings the fire?"*, and goes ahead anyway.

**Birdie (approve, with a warning):** "Wednesday crowd don't like homework, sugar. But it's your napkin."

**Act I (week 1).**
- **Wednesday:** Pinfall refuses the handshake, Tiny looks crushed, and the crowd boos mildly. Pinfall's match is 2.5 stars. Buzz is 47.
- **Thursday, the Tattler:** **"PROFESSOR REFUSES FLOURY HANDSHAKE."**

**Act II (week 2): the flop.**
- **Wednesday:** Pinfall's in-ring lecture runs 12 minutes, on leverage. Bingo starts early next door. Tiny responds by offering Pinfall a muffin. The crowd goes "aww," but nobody gets heated. Buzz is 38, so the story is **Cooling.**
- **Saturday:** a non-title match between Tiny and Pinfall. Pinfall grinds through mat holds, and Tiny is too gentle to fire up. 1.5 stars. Buzz is 26, so the story is **Flopping.**
- **Sunday, the Tattler:** **"PROFESSOR'S LECTURE SERIES CONTINUES; BRING A PILLOW."** ★½ *"Halfway through, a man behind me began knitting. He finished a scarf."*
- A few chairs sit empty at the VFW. The chairs the player foraged are still there, just unfilled.

**The huddle (Saturday night, in the booth).** A flop warning opens with the diagnosis: **no_heat** and **personality_mismatch**. The booth is gently honest:

> **PINFALL:** I'm boring them. I bore my students too. *(beat)* Kidding. Mostly.
> **TINY:** I don't know how to be mad at her. She's so *tidy*.

Options: the player's held cards are **WC-03 Agnes Gets Involved** (it fixes no_heat, so its rescue power is 20 + 10 = 30), **WC-09 The Second Chance**, and **TW-05 The Ref Bump**. Or they can wrap it up, or let it ride. The player plays **Agnes Gets Involved**: "Work the spot in front of row one. Agnes will do the rest."

**The save (week 3).**
- **Wednesday:** Pinfall takes her lecture to the floor and stops in front of row one, where she corrects the grammar on Agnes's sign. ("It's *you're*, madam.") Agnes swings. The purse connects, and Pinfall takes a spectacular, carefully choreographed bump into the bingo table. The VFW erupts. And Tiny, gentle Tiny, finally finds her fire: "**NOBODY** corrects Miss Agnes." She charges. ("Sorry! Sorry!")
- **Buzz:** 26 + 30 (rescue) + 6 (a 3.5-star brawl) + 4 (chants) = **66.** The story gets a **Saved!** stamp, and "SAY YOU'RE SORRY!" becomes a chant card.
- **Thursday, the Tattler:** **"THE PURSE HEARD 'ROUND THE COUNTY."**
- **Thursday (town):** Tiny's price board: `VILLAIN SURCHARGE: $1 (PROFESSOR) / RED PENS NOT ACCEPTED`. Coach Patty announces she'll attend the payoff "to fact-check the professor's quiz," a WC-11 cameo that happens without a card because the story is Hot.

**Act III (week 4).**
- **Wednesday payoff:** the Pop Quiz Match at the VFW. (The Wednesday Night Championship is defended only at the VFW, so Birdie doesn't move it.)
  - Between falls, Pinfall answers every question perfectly.
  - The final question goes to Tiny: *"How many layers are in a perfect cake?"* Pinfall scoffs: "Mathematically, seven." Tiny: "Eight. The eighth one's for sharing."
  - The crowd loses its mind, the right answer unlocks Tiny's signature move, and Tiny gets the pin. 4 stars.
  - Coach Patty checks Pinfall's answers on her clipboard and finds every one correct. "So the math is real... which means the *wrestling*... ugh." In the booth afterward, Pinfall admits she nearly forgot her own name when she spotted Patty in row two. She has been in love with Coach Patty for eleven years.
- **The Tattler:** **"I take it back. ALL OF IT."** ★★★★
- **The booth:** Pinfall, staring at a slice of cake: "Eight layers. I've been wrong for forty years." Tiny gives her the eighth layer.

**Rewards and lasting changes:**
- The napkin is stamped *Saved!* and carries the lesson note *"The Wednesday crowd doesn't want homework."*
- A callback card, **"The Floury Handshake,"** joins the Tin.
- Birdie's Ledger goes up for rescuing a flop, and the player earns Storytelling XP.
- Agnes now glares at red pens.

---

## Open questions for the creator

These are working choices, flagged so the creator can confirm or overrule them:

1. **The rival promotion's brand.** This document calls Royce Penn's touring show "MAXX Megatour." Is that the right name?
2. **Gating the Pencil.** Should the Pencil wait on a main-story beat as well as career progress?
3. **Ghosts.** Ghosts are always "echoes of great matches," never people who have died. Is that framing right for the Dungeon too?
4. **The Hot Tag Diner's name.** Was it named after a 1982 Hammers hot tag? (A suggestion only.)
5. **The default for real injuries.** Keep "Rare," or default to "Off"?
6. **"Don't Make Me."** CAST.md's Tiny storyline is the one place a villain jabs at someone's body. This document allows that only as a signature story the hero has chosen, with the villain apologizing in the epilogue (3.6). Is the creator comfortable with that line?
