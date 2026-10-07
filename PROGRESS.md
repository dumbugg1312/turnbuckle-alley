# Progress

Status of the overnight build (night of 2026-10-06).

## Done and verified in the browser
- **Title screen:** a golden-hour pan down Main Street. New Game / Continue.
- **Prologue:** the MaxxMedia office at midnight (Royce, Arlo, the clip choice), the apartment, Grandma's letter (Polaroid, key, ticket), the mirror (character creator, self mode), and the bus-ride parallax montage.
- **Arrival:** Pip at the bus stop, walking west to the Dupree place, the overgrown farm, Grandma's house, the first night, the morning note from Birdie.
- **Birdie and the Sportatorium:** the tryout match with Dex, Birdie coaching each phase, then sent to Marigold.
- **Marigold:** the ring persona creator. Ring name, gear, mask, moves, entrance and theme, with "Roll me one" and presets.
- **Wednesday debut at the VFW:** the storyline engine books a full card with you vs. the Mountain. Then the show poster, entrance cards, Birdie coaching the match, the other segments (watch or skip), the night summary with pay, and the after-show back booth at the Hot Tag, where Dex pitches a storyline on the napkin board.
- **Card match:** the engine is tuned by bot simulation (story-aware play about 3.8★, random about 2.2★). It has kickouts, results with a crowd curve, and move rewards.
- **World:** town, farm, fairgrounds and 27 interiors, all in the Golden Hour art style. NPC schedules, talking, gifts, heart events, shops, selling at Fenwick's, day/night lighting with lamps and windows, rain, the HUD with a goal ribbon, and the pause menu (bag, moves, people, stories, collection, career, settings).
- **Farm loop:** clear debris; Hank restores the ring and builds training gear (heavy bag, tires, bench, trampoline, speed bag, T-shirt press); merch sells at shows.
- **Folding chairs** (the forageable), trading card packs with a binder, letters in the mailbox, payphone calls to Grandma, the morning Tattler.
- **Dungeon** (the mining equivalent): 30 floors across 6 eras, timing-based workouts, loot, ghost spars, elevators, the Golden Belt.
- **Tapes** (the fishing equivalent): 67 tapes, crate digging, the VHS tracking mini-game, a library, and 1983 clues.
- **Storyline engine:** 109 story cards, 31 shapes, pitches with all involvement modes, Birdie's approvals, organic turns, flops and saves, career promotions, booking at Assistant and Pencil rank, and the corkboard journal.
- **Audio:** a chiptune engine with about 30 songs, 14 character leitmotifs (town version plus entrance version), generated entrance themes for your wrestler, sfx, crowd and dialogue blips.

## Art upgrade (morning of 2026-10-07, after the "looks like Roblox" feedback)
- Characters rebuilt (src/gfx/charart/*): natural proportions, five-tone ramps, anti-aliasing, painterly portraits.
- Matches at native resolution with detailed side-view wrestlers, a crowd of 28 fan variants, and five redesigned venues with lighting.
- World atmosphere (src/world/atmosphere.ts): time-of-day grading, god rays, sun-cast shadows, night bloom and light pools, particles.
- Not done yet: the terrain texture pass (manholes, mortar, caustics), rain splashes and wet sheen, interior window sunbeams, birds.

## Animation pass (2026-10-07, D-021)
- Walk and run gaits solved from foot placement in all four facings, with frames driven by distance walked, so feet plant without sliding. Body-type and age personalities.
- Idle life: breathing, weight shifts, glances, double blinks, and per-character quirks (table `IDLE_QUIRK` in world/scene.ts).
- Juice: a one-frame turn when reversing direction, settling into the passing pose when stopping, an eased start, happy hops on ♥/♪/! emotes (`WORLD.hop(id)`), emote bubbles with squash and stretch and pixel icons (with a heartbeat), dust puffs on dirt, sand and gravel, splashes in rain and shallow water, and footstep sounds synced to footfalls (src/world/stepfx.ts).
- Not done yet: foot pitch (heel and toe roll) when the foot leaves the ground, and the dungeon scene doesn't call `Actor.animate`, so it has no turn frames, hops or dust there yet.

## World pass (2026-10-07 afternoon, D-018 to D-021)
- Everything in the world is painted at double density on one pixel grid: the characters, terrain, interior walls, props and the farm, and the building exteriors.
- Scale fixed: adults are 30 px, doors 33–36 px, cars 68–72 px, lamps 54 px.
- The UI was redesigned as in-world paper, enamel and brass (D-020).
- Animation: an 8-frame walk that plants its feet, a run, idle life, per-character quirks, and touches such as hops, dust and splashes (D-021).
- Stardew scale (D-022): buildings 7–18 tiles wide and low with 16×32 doors; the town grew to 104×70 and every coordinate moved; the camera aims for 270 px. Not rescaled yet: Grandma's house and the shed on the farm map; #gallery cells are too small for the wider buildings.
- Bus ride rebuilt (D-023). All 25 interiors redone (D-024). Interior follow-ups: bake rugs into the (now 2×) ground canvas again; redraw the bed, couch, piano, bleachers, folding chairs and fireplace; wire actions for new display pieces in systems/actions.ts. Weaker spots helpers flagged: fair set pieces (water tower, Ferris wheel, tents), winter trees, the show poster and entrance CSS, the Dungeon and tapes screens' CSS, and town ground load time (~1.8 s first build).

## In progress at the end of the night
- Done since: all 34 characters have dialogue files; the main story runs through the Homecoming finale and credits (src/story-main/chapters/).

## Needs a human
- Listening: the music and sound mix by ear.
- Real-device touch testing on iPhone and iPad.
- Feel of the timing mini-games (kickout, Dungeon reps, VHS tracking) by hand.

## Charm pass (2026-10-07 evening, D-025)
- World life: birds, moths, a creek fish and Biscuit the diner cat; rustling plants; physical pickups; NPC greetings, rain shelter and idle emotes; snow, storms, gusts and 9 footstep surfaces.
- 506 of the placed objects now answer the action button (was 84); festival days with a playable fair (Ferris wheel, fortunes that come true, strongman bell, Wanda, stage shows); Grandma's garden.
- Writing: town memory and gossip, gift replies that name the item, second-talk and fallback lines per character, real match results in Grandma's calls and the back booth, item descriptions rewritten, repeated tics cut ("don't tell" 115 to 30, "eleven" 65 to 5).
- Looks: calmer ground with clustered detail, fewer words on facades, belt title logo, softer flickering night light, windows that follow time and weather, hand-placed wear.
- Follow-ups: nothing calls `setSeason()`, so terrain and trees stay in spring art all year; settled snow reads as hard-edged blobs (src/world/weather.ts); 6 lore objects are out of reach; Second Street facades still word-heavy; new sounds and the strongman bell timing need a human.

## Needs a human (charm pass)
- Write your own lines in src/data/dialogue/handwritten.ts (guide: docs/YOUR_LINES.md).
