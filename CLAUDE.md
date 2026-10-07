# Turnbuckle Alley: project notes

A cozy Stardew-style life sim set in small-town pro wrestling. It's a browser game (desktop, iPad, phone) built with Vite + TypeScript and no framework.

## Run
- `npm run dev` starts the dev server on :5173 (launch config "turnbuckle-dev"). HMR is off on purpose: several people edit at once.
- `npx tsc --noEmit` must stay clean.
- `npx vitest run` runs the tests: match simulation, maps, story, audio and others.

Dev routes:
- `#town` and `#farm` start a test save. Query params: `?day=&t=&map=&x=&y=`.
- `#match` (`?heel=1&lose=1&venue=vfw`), `#gallery` (`?filter=&night=1`), `#jukebox`, `#creator-self`, `#creator-ring`.

Explorer panel: press ` or tap the HUD clock five times.

The `window.TA` global exposes `{ game, G, advance(seconds), auto(seconds, pickIndex) }` for playtests.

## Architecture (src/)
- **core/:** screen (pixel-perfect integer scaling), input, scene stack, game state `G` (plus `ext(key)` slices that each module owns), save, time (15-minute days, 6 AM to 2 AM).
- **gfx/:**
  - `kit.ts`: the art-direction pixel toolkit (mkSpr, OUT selective outline, shA/liA hue-shifted shading, plum ink AK).
  - `font.ts`
  - `characters.ts`: the paper-doll renderer API (`drawCharacter`, `renderPortrait`).
  - `world/*`: terrain and object art, registered by id.
- **world/:** maps (`maps/*.ts`; doors are linked in `links.ts`), the world scene (camera, lighting, NPC schedules, interaction), `talk.ts` (dialogue picking, gifts, heart events), and `hooks.ts` (onAction, onEnterMap, onTalk, onNewDay, onTick, doorRule).
- **data/:** `npcs.ts` (schedules, wrestler info), `items.ts`, `looks.ts`, and `dialogue/chars/*.ts` (one file per character).
- **match/:** the card game. `engine.ts` is pure logic plus a seeded RNG, `scene.ts` renders, `cards.ts` holds the card data.
- **story/:** the storyline engine, which books every show (contract in `story/api.ts`).
- **story-main/:** the Velvet Hammers main story: opening, letters, phone calls, and chapters.
- **systems/:** day/sleep, actions, shops, shows, farm, cards, goals, paper, mail.
- **activities/:** the Dungeon (the mining equivalent) and tapes (the fishing equivalent).
- **audio/:** the WebAudio chiptune engine. The facade is `audio`.

## Rules
- Kayfabe is absolute in public: marks never learn wrestling is staged.
- No death, ever. Humor never punches down.
- Art is all code, in the Style A look. Never use pure black; use AK '#2b2140'.
- Record design calls in DECISIONS.md and status in PROGRESS.md.
