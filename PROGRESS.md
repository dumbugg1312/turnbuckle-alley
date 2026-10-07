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

## In progress at the end of the night
- Done since: all 34 characters have dialogue files; the main story runs through the Homecoming finale and credits (src/story-main/chapters/).

## Needs a human
- Listening: the music and sound mix by ear.
- Real-device touch testing on iPhone and iPad.
- Feel of the timing mini-games (kickout, Dungeon reps, VHS tracking) by hand.
