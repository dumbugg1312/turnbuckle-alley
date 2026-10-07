# World beautification pass (2026-10-07)

The creator's words: "i want this whole world more detailed, not just the people." Also: "the cars and buildings are small and the characters are big," and "i want this to feel cohesive throughout." The quality bar is premium pixel art, Eastward / Sea of Stars level. Never toy-like, never Roblox, never flat color blocks. Read CLAUDE.md, DECISIONS.md (D-005, D-016 to D-019) and src/gfx/kit.ts first.

## The technique: double density (D-018)
- The screen buffer is 2× native (core/screen.ts `DENSITY`), and characters are already painted at 2× (gfx/charart). The world is still 1× and should now match.
- Wrap sprite building in `dense(2, () => ...)` (gfx/kit.ts).
  - Inside, every primitive still takes WORLD-pixel coordinates. Your existing code renders the same, and ellipses and polygons get smoother for free.
  - Add the new detail on half-pixels: fractional coordinates (`R(10.5, 3, 0.5, 2, c)`), `P1(x, y, c)` for a single fine pixel, and `FX`/`FY` (fine coordinates) inside paint callbacks for fine noise and dithers.
- Canvases from dense sprites are tagged. `ctx.drawImage(c, x, y)` draws them at logical size, and the 9-argument form takes logical source rects. Anywhere you read `c.width`/`c.height` to position things, use `lw(c)`/`lh(c)`. Avoid `createPattern` with dense canvases.
- Outlines (`OUT`) on dense sprites are one world pixel thick, so line weight matches the characters' silhouettes. Interior detail lines should be 1 fine pixel.
- Spend the pixels on:
  - material texture: wood grain, brick mortar and chips, shingles, siding, rust, paint wear, grime at the bases;
  - small clutter that makes places lived in;
  - better light: rim light on edges facing the sun, ambient occlusion in corners, glass with reflections;
  - softer anti-aliased curves.
- Keep the Golden Hour Storybook palette and hue-shifted ramps (`shA`/`liA`). Plum ink AK `#2b2140`, never black.
- Keep caches. Build cost matters on phones: cache every dense sprite once.

## Scale (D-019)
Adults are now 30 px tall (was 33). Doors should be about 32–36 px tall. Cars should be about 64–70 px long. Benches, hydrants and lamps should be sized against a 30 px person.

## Rules for every helper
- Work in your own git worktree on your own branch. Touch only the files you own (your prompt lists them). If you truly need a change elsewhere, note it in your report instead.
- If `node_modules` is missing in your worktree, run `ln -s /Users/grover/Documents/PROGRAMS/ringside/node_modules node_modules`.
- Run your own dev server in the background on the port in your prompt: `npx vite --port <port> --strictPort`. HMR is off, so reload manually. Check routes such as `#gallery`, `#town?t=10`, `#town?t=18` (golden hour), `#town?t=21.5` (night) and `#farm`.
- To judge fine pixels, draw your sprites enlarged onto a test canvas in the page (screenshots are downscaled). Be honest about anything that still looks flat.
- `npx tsc --noEmit` must be clean and `npx vitest run` must pass in your worktree.
- Commit on your branch after each solid stage (`git add -A && git commit`). End messages with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Never push. Never leave the build broken at a commit.
- Budget is tight: the weekly limit may cut you off. Finish one area completely before starting the next, and commit as you go. Stop your dev server when done.
- Report: what changed, what still looks weak, and your branch name.
