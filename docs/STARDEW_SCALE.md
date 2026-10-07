# Stardew-scale town (D-022)

The creator's words: "the scaling still feels weird. look at how stardew valley does their scaling and lets do that."

## Stardew's rules (16 px tiles)
| Thing | Stardew | Ours before | Target |
|---|---|---|---|
| Camera | 480×270 view at 1080p (~30×17 tiles) | ~220 tall | 270 (done: core/screen.ts) |
| Person | 16×32 (1×2 tiles) | 30 tall | 30–32 tall (keep) |
| Door | 16×32 opening, a person fills it | 12–14 wide × 33–36 | exactly 1 tile wide × 2 tiles tall (16×32 opening, plus frame) |
| Storey | about 3 tiles (48 px) of wall | about 4 tiles | 3 tiles of wall per storey; roofs 2–3 tiles above |
| Shop | 8–12 tiles wide (Pierre's ~10, the Saloon ~12) | 4–5 tiles | 8–12 tiles wide; the Sportatorium ~16–20 |
| House | 6–8 tiles wide | 4 tiles | 6–8 tiles |
| Tree | ~3×5 tiles | 48×60 | fine as is |
| Windows | ~1×1 tile | small | about 1 tile; shop windows 2–3 tiles wide |

So buildings become wide and low (wider than they are tall, like Stardew's), with person-sized doors. Main Street should feel like a street of storefronts, not a row of narrow towers.

## The job
1. In src/gfx/world/buildings.ts, re-proportion every building by these rules. Keep the double-density detail and each building's personality, and reflow the facade (more windows, wider awnings, longer signs) rather than stretching it. Update `solid` boxes, light positions and animation areas.
2. In src/world/maps/town.ts, re-lay out the town to fit the wider buildings. Grow the map if needed (for example 96×64). Keep the town's character: Main Street with the Sportatorium as the heart, Second Street, the bus stop at the east edge, the road west to the Dupree farm, and the fairgrounds. Stardew-style spacing: paths 2–3 tiles, Main Street road about 4 tiles plus sidewalks, room for props and trees. Keep every door's tile position consistent with its building's door, and update `TOWN_DOORS` and src/world/maps/links.ts so every door still links to its interior.
3. Update everything that uses town coordinates:
   - src/data/npcs.ts SPOTS and schedules for town;
   - src/story-main/opening.ts and index.ts (arrival at the bus stop, Pip's walk, the farm road);
   - src/story-main/chapters/*;
   - src/systems/* (any warpTo('town', x, y));
   - src/scenes/title.ts (the attract-mode pan, which should still frame Main Street at golden hour);
   - src/scenes/devroutes.ts defaults;
   - farm and fair warps (src/world/maps/farm.ts, fair.ts, if their links to town move).
   Grep for `'town'` and `warpTo(` to find them all.
4. Verify by walking:
   - every door works both ways;
   - NPCs reach their spots;
   - the new-game arrival plays correctly (Pip at the bus stop);
   - the title pan looks good;
   - tests/maps.test.ts passes.
   tsc is clean and all tests pass. Take screenshots at #town?t=10 and t=18.

Read CLAUDE.md, docs/WORLD_PASS.md (shared rules, double density via dense()) and DECISIONS.md D-016 to D-021 first. Commit on your branch after each solid stage, never push, and report.
