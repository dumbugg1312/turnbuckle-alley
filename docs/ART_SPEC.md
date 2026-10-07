# Turnbuckle Alley art spec

This is the contract between the game engine and the art modules. The art direction is **"Golden Hour Storybook"**: see `mockups/style-a.html`, open at http://localhost:5173/mockups/style-a.html. Match it closely. It is the quality bar.

## Style rules (from Direction A)
- **Warm, painterly pixel art.** Use hue-shifted shading: shadows drift toward plum and teal, highlights toward butter yellow.
  - Use `shA(c, k)` to darken and `liA(c, k)` to highlight, both from `src/gfx/kit.ts`.
  - **Never use pure black.** The deepest ink is `AK = '#2b2140'`.
- **Selective colored outlines.** `OUT(spr, selA)` gives each outline pixel a darkened version of the fill next to it. Use it on characters, props and buildings. Floors and terrain stay unoutlined.
- **Lots of tiny, lived-in detail:** flower boxes, hand-painted signs, posters, string lights, cracks, chipped paint, potted plants, menus in windows.
- **Light source** is top-left, a warm sun. Shadows fall to the lower right as soft plum dither (`DR` with a dither level), never hard black.
- **Palette feel:** cream `#fbf0d9`, warm reds `#d8434b`/`#e2544a`, teal `#3f9a92`/`#2fa59a`, butter `#f6d38a`, plum ink `#2b2140`, sky peach and lavender. Wrestling spectacle colors (gold `#f4b63f`, hot pink `#ff5d8f`) appear on signage and posters.
- **NOT Stardew Valley.** Avoid its exact palette, its chunky brown wooden UI and its proportions.
- **NOTHING like Roblox.** No blocky plastic shapes.
- **Whimsy at the edges:** the water tower shaped like a turnbuckle; the raccoon in the trash can; posters advertising matches.

## Technical contract
- Everything is drawn in code with the kit in `src/gfx/kit.ts` (a port of the mockup's toolkit): `mkSpr`, `R`, `P`, `HL`, `VL`, `L`, `RR`, `RRB`, `poly`, `ell`, `circ`, `curve`, `DR`, `VG`, `SP`, `DS`, `OUT`, `rotL`, `recolor`, `sprite()`, `rowsCanvas()`, `toCanvas()`, `shA`, `liA`, `selA`, `AK`, `hash2`, `rng`.
  - Build each sprite **once** with `sprite(key, w, h, fn, {outline:true})` (cached), and draw it per frame with `ctx.drawImage`.
  - Never redraw buffers per frame. Small animations, like a neon flicker or a smoke puff, are separate tiny cached frames picked by time.
- Tiles are **16×16 px**. The world is 3/4 top-down: buildings show their front facade (facing down/south) with the roof on top, like the Main Street mockup but placed on a tile map.
- Characters are about 20×30 px. They are handled separately by the character renderer (`src/gfx/characters.ts`).
- Register art with `registerTerrain(id, def)` and `registerObject(kind, def)` from `src/world/registry.ts`. Types live in `src/world/types.ts`. Any id that isn't registered draws a magenta placeholder, so every id below must be registered.
- **Terrain** `draw(ctx, x, y, tx, ty, n)` draws one 16×16 tile at pixel (x, y).
  - `n(dx, dy)` returns the neighbor's terrain id, for edge blending: grass meeting a path gets a ragged edge; a sidewalk meeting the road gets a curb.
  - Use `hash2(tx, ty)` to pick variants deterministically.
  - The ground is pre-rendered once per map, so terrain can be as detailed as you like.
- **Objects** `ObjectKind`: `{ solid?, hit?, sortY?, flat?, above?, draw(ctx, o, t), lights?(o), label?(o) }`.
  - `o.x, o.y` is the **anchor in pixels**. For buildings and props the anchor is the **bottom-center** of the footprint: the base line where the building meets the ground. Draw with `ctx.drawImage(img, o.x - w/2, o.y - h)`.
  - `solid` is the collision rect relative to the anchor, e.g. `{x:-48, y:-40, w:96, h:40}` for a building's ground footprint. Collision is usually the bottom part (the walls); the roof can overhang without collision.
  - `t` is seconds, for animation (neon flicker, flags waving, Jobber's tail, smoke from chimneys, water shimmer).
  - `o.props` carries per-instance options, e.g. `variant`, `text`, `color`, `w` (length in tiles), `state`.
  - `lights(o)` returns night light sources (window glow, lamps, neon), each `{x, y, r, color}` in absolute pixels. The world scene draws night darkness with these lights cut out and glowing. Every building with windows should return window lights.
- **Doors:** the engine places warps in maps. A door should be visibly obvious on each facade, at the door offset given below (relative to the anchor's x).
- **Performance:** with ~200 objects on screen, each `draw` must just blit cached canvases.

## Terrain ids (all must be registered)
| id | look |
|---|---|
| grass | lush warm green with tiny variation, small tufts; shade toward teal |
| grass-dark | shadier, deeper grass (under trees, edges of woods) |
| flowers | grass with little flower clusters (pinks, butter, white), seasonal-ready |
| dirt / dirt-dark | packed earth paths; rounded ragged edges into grass |
| path | cozy cobble or stepping-stone path (park and residential) |
| sidewalk | cream concrete slabs with seams, a few cracks and a gum spot; curb edge when next to road |
| road | warm-gray asphalt, subtle noise and patches |
| road-line | road with a dashed butter-yellow center line (horizontal) |
| crosswalk | road with cream zebra stripes (vertical stripes) |
| brick | warm red brick plaza (town square) |
| concrete | plain concrete (parking lot, VFW pad) |
| parking | asphalt with white parking lines |
| gravel | loose gravel (fairgrounds lot, farm drive) |
| water | creek water: animated look isn't possible in the pre-render, so draw rich static ripples. Edges blend to sand or grass with a little foam line. **solid** |
| shallow | shallow water you can't walk on (lighter, pebbles visible). **solid** |
| deep-water | darker water. **solid** |
| sand | creek bank sand |
| mud | wet mud (fair mud pit) |
| bridge | wooden bridge planks (horizontal) |
| wood / wood-dark | interior floorboards (warm honey / dark walnut) |
| tile | kitchen/diner tile (cream + teal) |
| checker | diner checkerboard floor (red/cream or black/cream) |
| carpet / carpet-red | interior carpet (dusty blue / theater red with a gold pattern) |
| mat | ring canvas mat (gray-blue) |
| rubber | gym rubber floor (dark with flecks) |
| stone / dungeon | old stone floor; dungeon = mossy greenish stone with cracks and faint glow |
| tilled | tilled garden soil |
| snow | snow (for later) |
| wall | interior wallpaper wall (cream with a subtle pattern, wainscot at the bottom). **solid**. Rooms use 2–3 rows of wall terrain along the top. Draw the bottom row of a wall run with a baseboard shadow when `n(0,1)` is not a wall. |
| wall-wood | wood-paneled wall (VFW, cabin, diner). **solid** |
| wall-brick | exposed brick wall (Sportatorium, hardware store). **solid** |
| wall-panel | dark painted cinderblock (locker room, arena backstage). **solid** |
| wall-pink / wall-blue | colored wallpaper variants (Birdie's office pink, Grandma's house blue floral). **solid** |
| wall-dungeon | dungeon brick, mossy and spooky-whimsical. **solid** |
| void | never drawn (outside rooms) |

## Object kinds

### Exterior buildings (anchor = bottom-center; w×h in px; door dx = door center relative to anchor x)
Each gets a facade full of personality, warm window lights at night, and its sign lettered with a pixel font: port `mkFont` from the mockup into your module, or draw letters directly.

| kind | w×h | door dx | notes |
|---|---|---|---|
| b-diner | 96×80 | +24 | **Hot Tag Diner.** Neon sign HOT TAG DINER (flicker), chrome trim, booths seen through windows, "Breakfast all day". |
| b-hardware | 80×80 | +16 | **Steel Chair Hardware.** Folding chairs stacked in the window, SALE sign, striped awning. |
| b-sportatorium | 176×120 | 0 | **The Sportatorium.** A big red barn-arena (EST. 1931); big double doors in the center (32 px wide); poster frames for WEDNESDAY NIGHT and SATURDAY NIGHT; weathervane; string lights. The landmark: it should be gorgeous. |
| b-taqueria | 80×72 | -16 | **Taqueria Mariposa.** Papel picado, a gold butterfly sign, bright teal and pink trim. |
| b-bakery | 80×72 | +16 | **Tallbridge Bakery.** Tiny cakes in the window, a pastel striped awning, an oversized doorframe (the baker is 7 feet tall). |
| b-radio | 64×72 | 0 | **WRSL 1340 AM.** A little brick radio station with an ON AIR light (red, flickers on) and a vintage sign. |
| radio-tower | 24×120 | — | Red/white lattice antenna with a blinking light. solid base 12×8. |
| b-library | 96×80 | 0 | **Public Library.** Stone steps, columns, a "Story Time 4pm" sign, a book return box. |
| b-tailor | 64×72 | 0 | **Sew What? (Marigold's).** A mannequin in a sequined robe in the window, a spool sign. |
| b-clinic | 64×72 | 0 | **Halloran Chiropractic.** Clean white and teal, a spine logo sign. |
| b-studio | 64×72 | 0 | **Hurricane Physio & Yoga.** Calm sage green, a lotus/lightning logo. |
| b-vfw | 112×80 | 0 | **VFW Post 316.** Low brick hall, flagpole beside it, a marquee board saying WED NIGHT WRESTLING / BINGO after. |
| b-pawn | 64×72 | 0 | **Fenwick's Pawn & Tapes.** Cluttered window of VHS tapes and old TVs, neon OPEN sign. |
| b-house | 64×64 | -12 | Cozy small house. `props.variant` 0..3 gives different siding colors (butter, sage, rose, sky) and roofs. |
| b-birdie | 80×72 | -16 | **Birdie's house.** Pink trim, porch swing, a pink flamingo, a faded Velvet Hammers banner in the window. |
| b-sunnypines | 128×80 | 0 | **Sunny Pines Retirement Home.** Gentle two-story, porch rockers, planters. |
| b-school | 112×88 | 0 | **Turnbuckle Alley High gym.** Brick gym, "Home of the Turnbuckle Tigers". |
| b-grandma | 96×88 | -20 | **Grandma's house.** Weathered blue clapboard, porch with rocking chair, overgrown planters, mailbox. Lived-in but neglected, with a hint of former glory (a faded star painted on the porch). |
| b-shed | 48×48 | 0 | Farm tool shed. |
| airstream | 72×40 | +18 | **Sweet Lou's Airstream.** Silver trailer, striped awning, lawn chair, fishing rods, string lights. |
| bus-stop | 48×40 | — | Bus shelter with bench and route sign. |
| watertower | 48×112 | — | **Water tower shaped like a ring turnbuckle post:** red padded top with "TA" lettering, metal legs. solid base 24×10. |
| gazebo | 64×56 | — | White town gazebo with bunting. solid ring around the edge, but leave the bottom-center open (entrance gap 16 px). |
| mural | 64×48 | — | Wall mural of the Velvet Hammers (two women in 80s gear raising a belt) for the alley. Drawn on a wall; solid 64×8 at the bottom. |
| ferris-wheel | 112×128 | — | Fairgrounds Ferris wheel (slowly rotating cars; use `t`). solid base 64×12. |
| tent | 64×56 | 0 | Striped carnival tent; `props.color` 'red', 'teal' or 'purple'. |
| bear-pen | 80×48 | — | Low wooden pen with a hay bale and a honey pot (Wanda the bear is an NPC standing inside). solid fence edges, open interior. |
| strongman | 24×64 | — | "Test your strength" bell tower. |
| fair-stage | 96×56 | — | Small outdoor stage with bunting and a ring apron skirt. |
| food-stand | 48×48 | — | Corn dog/lemonade stand; `props.variant` 0..2. |

### Street, nature and town props
- **Trees:**
  - `tree` (round leafy oak, 32×40, `props.variant` 0..2; canopy should be marked `above` so the player walks behind it, but keep it as one object: draw trunk plus canopy, with a solid trunk 8×6 at the base)
  - `tree-pine` (24×40)
  - `tree-blossom` (32×40, pink spring blossom)
- **Plants:** `bush` (16×14), `flowerbed` (32×12, flat-ish), `hedge` (`props.w` tiles long, 16 high)
- **Fences:** `fence-h` (`props.w` tiles, picket), `fence-v` (`props.h` tiles)
- **Street furniture:**
  - `lamp` (street lamp 12×36; warm night light)
  - `bench` (32×16)
  - `mailbox` (blue mailbox 12×18)
  - `hydrant` (10×14)
  - `trashcan` (12×16; `props.raccoon` true makes Jobber the raccoon peek out with an animated tail, as in the mockup)
  - `sign` (wooden sign 16×18; text is shown by the engine)
  - `phone-booth` (payphone booth 20×36, used to call Grandma; warm light at night)
  - `newsstand` (Turnbuckle Tattler newspaper box 14×18)
  - `vending` (18×28)
  - `picnic-table` (32×20)
  - `flagpole` (12×56, waving flag)
- **Vehicles:** `car` (48×28, `props.variant` 0..3 colors, parked facing right), `pickup` (52×30)
- **Clutter:** `barrel`, `crate`, `tire`, `rock` (`props.variant`), `log`
- **Water plants:** `reeds` (16×16), `lilypad` (flat on water)
- `bridge-rail` (`props.w` tiles, wooden railing drawn on bridges)
- `poster-board` (community corkboard on a post, 20×28)

### Collectibles and interactables (gameplay-critical, make them readable and sparkly)
- `chair`: a folding steel chair lying on the ground or leaning on something (the town's collectible, see the mockup's chair). About 16×14. Add a subtle twinkle every few seconds via `t`.
- `tapebin`: a crate full of VHS tapes (20×16) with a glint.
- `sparkle`: a generic forageable glint (8×8 animated).
- `card-pack`: a dropped trading card pack (8×10, glint).

### The farm (Grandma's backyard)
- **Debris to clear:** `weeds` (16×16, `props.variant` 0..2), `junk` (old appliance/junk pile 24×20), `stone` (16×14), `stump` (16×14), `old-tire` (16×12)
- `backyard-ring`: Grandma's backyard ring, 96×72. `props.state` is 'overgrown' (vines on the ropes, saggy, leaves on the mat, rusty posts), 'clean' (fixed) or 'deluxe' (new ropes, LED posts). The anchor is bottom-center; the solid box covers only the ring apron edges, with `solid {x:-48,y:-20,w:96,h:20}`.
- **Training equipment:** `heavy-bag` (16×32), `tire-stack` (20×20), `weight-bench` (32×20), `trampoline` (32×20), `rope-lane` (48×16, flat), `speed-bag` (16×28)
- **Merch machines:** `merch-press` (24×24 T-shirt press, shows a shirt when ready via `props.ready`), `sewing-machine` (20×20 table)
- **Garden and yard:** `garden-bed` (32×16), `clothesline` (48×32), `mailbox-home` (12×20)

### Interior furniture (anchor bottom-center; most are `solid` on their footprint)
- **Doors and wall features:**
  - `door-mat` (flat, 16×8, marks the exit at the bottom of rooms)
  - `window` (wall window 24×20, drawn on wall rows; sunny glow by day)
  - `poster` (wall poster 16×20; `props.variant` 0..5 wrestling posters)
  - `photo` (framed photo 12×12; `props.variant`)
  - `calendar` (12×14)
- **Home:**
  - `bed` (24×36, quilt)
  - `dresser` (24×24)
  - `tv-vcr` (CRT TV on a stand with a VCR, 24×28; screen glow animated)
  - `couch` (40×20)
  - `armchair` (20×20)
  - `rug` (flat, `props.w`×`props.h` tiles, `props.variant` 0..3)
  - `table` (32×20)
  - `chair-wood` (12×16)
  - `bookshelf` (32×32)
  - `trunk` (Grandma's old chest 24×16)
  - `fireplace` (32×32, glowing)
  - `piano` (32×28)
  - `plant` (12×20)
  - `lamp-floor` (10×28, light)
- **Kitchen:** `fridge` (16×32), `stove` (16×20), `sink` (16×20)
- **Diner:**
  - `counter` (`props.w` tiles long, 20 tall, with stools in front)
  - `stool` (10×12)
  - `booth` (diner booth pair with table, 32×28; `props.variant` 'red' or 'teal')
  - `jukebox` (20×28, animated lights)
  - `cash-register` (12×12, sits on counters, no solid)
- **Shops:** `shelf-goods` (`props.w` tiles, shop shelves), `display-case` (bakery glass case 32×20), `vhs-shelf` (32×32 shelves of tapes), `crt-stack` (stack of old TVs 24×28), `clothing-rack` (24×24), `mannequin` (12×28)
- **Office:**
  - `desk` (32×20)
  - `office-chair` (12×14)
  - `filing-cabinet` (14×24)
  - `corkboard` (Birdie's booking board on the wall: index cards, string, Polaroids, 32×24; gameplay-critical!)
  - `trophy-case` (32×32)
- **Arena:**
  - `locker` (`props.w` lockers wide, 12 px each, 28 tall)
  - `locked-locker` (Dottie's locker: a single locker with a padlock and faded tape label "D.D.", 12×28)
  - `bleachers` (`props.w` tiles wide, 3 rows, 40 tall)
  - `folding-chairs` (row of folding chairs, `props.w` tiles)
  - `ring` (indoor wrestling ring 160×112, anchor bottom-center; solid apron edges only; turnbuckles red/white/blue; mat logo ACW)
  - `bingo-board` (32×24)
  - `mic-stand` (8×24)
  - `announce-table` (32×16)
  - `stairs-down` (the Dungeon entrance: stone stairs going down with a faint green glow, 32×24, not solid, interactable)
- **Radio:** `radio-console` (WRSL console with mic and reels, 32×20)
- **Clinic:** `exam-table` (32×16)
- **Studio:** `yoga-mat` (flat, 16×32)
- **Retirement home:** `rocking-chair` (16×20), `tv-lounge` (24×24)
- **Dungeon:** `dungeon-door` (spooky arched door 32×40), `torch` (wall torch 8×16, green flame light)

## Night lights
Return lights for windows (warm `#ffcf7a`), lamps (`#ffd890`), neon (pinks and teals), the ON AIR sign (red) and torches (green). The engine renders darkness over the scene and cuts these lights out with additive glow.

## Seasons (stretch)
Register terrain and trees in a way that could vary by season later (accept an optional season parameter via a module-level `setSeason()` you export). Spring is the default.
